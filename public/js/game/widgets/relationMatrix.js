/**
 * Property Inspector - toggle a relation on a small set and watch the three
 * properties pass or fail, with the exact offending pair named.
 *
 * Most students can recite the definitions and still misclassify a relation,
 * because they check "does it look symmetric?" instead of testing every pair.
 * This widget does the exhaustive test and shows its working.
 *
 * Teaches: reflexive, symmetric, transitive, equivalence relations, and the
 * counting formulas.
 */

import { h, clear } from '../../core/dom.js';
import { renderInline, renderMath } from '../../core/mathlite.js';
import { sfx } from '../../core/audio.js';
import { arcade, btn, seg, cleared, shuffle } from '../kit.js';

const SET = [1, 2, 3];

const CHALLENGES = [
  {
    text: 'Build an **equivalence relation** that is not simply the diagonal.',
    test: (p) => p.reflexive && p.symmetric && p.transitive && p.size > SET.length,
    note: 'Reflexive, symmetric and transitive together. Its equivalence classes partition the set — every element in exactly one class.'
  },
  {
    text: 'Build a relation that is **symmetric and transitive but NOT reflexive**.',
    test: (p) => !p.reflexive && p.symmetric && p.transitive && p.size > 0,
    note: 'This kills the classic false proof that symmetry plus transitivity implies reflexivity. The argument only reaches elements that appear in *some* pair; any element left out never gets its self-pair. $\\{(1,1)\\}$ is the smallest example.'
  },
  {
    text: 'Build a relation that is **reflexive and symmetric but NOT transitive**.',
    test: (p) => p.reflexive && p.symmetric && !p.transitive,
    note: 'A tolerance relation. Add $(1,2)$ and $(2,3)$ with their mirrors but leave out $(1,3)$ — like "$|a-b| \\leq 1$" on the integers.'
  },
  {
    text: 'Build a relation that is **reflexive and transitive but NOT symmetric**.',
    test: (p) => p.reflexive && !p.symmetric && p.transitive,
    note: 'A partial order — the structure of $\\leq$. Add the whole diagonal plus $(1,2)$ and $(2,3)$ and $(1,3)$, but no reverses.'
  },
  {
    text: 'Build a relation that is **transitive only** (neither reflexive nor symmetric).',
    test: (p) => !p.reflexive && !p.symmetric && p.transitive && p.size > 0,
    note: 'The relation $<$ behaves exactly like this. Transitivity is the easiest of the three to satisfy accidentally — a relation with no chains at all is vacuously transitive.'
  }
];

export default {
  id: 'relationMatrix',

  mount(root, ctx) {
    const cab = arcade(root, {
      title: 'Property Inspector',
      badge: 'R on {1,2,3}',
      hint: 'Click a cell to put (row, column) into the relation.',
      best: ctx.best ?? null,
      onRestart: start
    });

    let R = new Set();            // "a,b"
    let queue = [], task = null, score = 0, solved = 0, settled = false;

    const layout = h('div', { style: { display: 'grid', gridTemplateColumns: 'auto minmax(0,1fr)', gap: '20px', padding: '16px', alignItems: 'start' } });
    cab.stage.appendChild(layout);
    const matrixBox = h('div');
    const propsBox = h('div');
    layout.appendChild(matrixBox);
    layout.appendChild(propsBox);

    const has = (a, b) => R.has(`${a},${b}`);

    /* ---------------- analysis ---------------- */

    function analyse() {
      const missingRefl = SET.filter((a) => !has(a, a));
      const asym = [];
      for (const a of SET) for (const b of SET) {
        if (has(a, b) && !has(b, a)) asym.push([a, b]);
      }
      const nontrans = [];
      for (const a of SET) for (const b of SET) for (const c of SET) {
        if (has(a, b) && has(b, c) && !has(a, c)) nontrans.push([a, b, c]);
      }
      return {
        size: R.size,
        reflexive: missingRefl.length === 0,
        symmetric: asym.length === 0,
        transitive: nontrans.length === 0,
        missingRefl, asym, nontrans
      };
    }

    /* ---------------- matrix ---------------- */

    function renderMatrix() {
      clear(matrixBox);
      const p = analyse();

      matrixBox.appendChild(h('div.tiny.dim', { style: { marginBottom: '6px' } }, 'ROW  R  COLUMN'));

      const grid = h('div.matrixgrid', { style: { gridTemplateColumns: `repeat(${SET.length + 1}, auto)` } });
      grid.appendChild(h('div.matrixhdr', null, ''));
      for (const b of SET) grid.appendChild(h('div.matrixhdr', null, String(b)));

      const violating = new Set();
      for (const [a, b] of p.asym) violating.add(`${b},${a}`);   // the missing mirror

      for (const a of SET) {
        grid.appendChild(h('div.matrixhdr', null, String(a)));
        for (const b of SET) {
          const key = `${a},${b}`;
          grid.appendChild(h('div.matrixcell', {
            role: 'button', tabindex: '0',
            dataset: {
              on: String(has(a, b)),
              diag: String(a === b),
              violation: String(!has(a, b) && violating.has(key))
            },
            title: `(${a}, ${b})`,
            onClick: () => toggle(a, b),
            onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(a, b); } }
          }, has(a, b) ? '1' : '0'));
        }
      }
      matrixBox.appendChild(grid);

      matrixBox.appendChild(h('div.btnbar', { style: { marginTop: '12px' } },
        btn('Diagonal', () => { R = new Set(SET.map((a) => `${a},${a}`)); refresh(); }, { kind: 'ghost' }),
        btn('All', () => { R = new Set(SET.flatMap((a) => SET.map((b) => `${a},${b}`))); refresh(); }, { kind: 'ghost' }),
        btn('Clear', () => { R = new Set(); refresh(); }, { kind: 'ghost' })
      ));

      matrixBox.appendChild(h('div.tiny.dim', { style: { marginTop: '10px', lineHeight: '1.7' } },
        `Relations on a 3-set: 2⁹ = 512`, h('br'),
        `Reflexive: 2⁶ = 64`, h('br'),
        `Symmetric: 2⁶ = 64`, h('br'),
        `Both: 2³ = 8`));
    }

    function toggle(a, b) {
      if (settled) return;
      const key = `${a},${b}`;
      if (R.has(key)) R.delete(key); else R.add(key);
      sfx.tick();
      refresh();
    }

    /* ---------------- property report ---------------- */

    function renderProps() {
      clear(propsBox);
      const p = analyse();

      propsBox.appendChild(h('div.tiny.dim', { style: { marginBottom: '8px' } }, 'ROSTER'));
      propsBox.appendChild(h('div.mono.small', { style: { marginBottom: '14px' } },
        R.size ? `R = { ${[...R].sort().map((k) => `(${k.replace(',', ', ')})`).join(', ')} }` : 'R = ∅'));

      propsBox.appendChild(prop('Reflexive', p.reflexive,
        p.reflexive
          ? 'Every element relates to itself.'
          : `Missing ${p.missingRefl.map((a) => `$(${a},${a})$`).join(', ')}. Reflexivity needs **all** of them, not some.`));

      propsBox.appendChild(prop('Symmetric', p.symmetric,
        p.symmetric
          ? 'Every pair has its mirror.'
          : `$(${p.asym[0][0]},${p.asym[0][1]})$ is in $R$ but $(${p.asym[0][1]},${p.asym[0][0]})$ is not.`));

      propsBox.appendChild(prop('Transitive', p.transitive,
        p.transitive
          ? (R.size === 0 ? 'Vacuously true — there are no chains to break.' : 'Every chain has its shortcut.')
          : `$(${p.nontrans[0][0]},${p.nontrans[0][1]})$ and $(${p.nontrans[0][1]},${p.nontrans[0][2]})$ are in $R$, but $(${p.nontrans[0][0]},${p.nontrans[0][2]})$ is missing.`));

      const isEq = p.reflexive && p.symmetric && p.transitive;
      propsBox.appendChild(h('div', { style: { marginTop: '14px' } },
        h('div.verdict' + (isEq ? '.verdict--ok' : ''), null,
          h('div.verdict__head', null, isEq ? '✓ Equivalence relation' : 'Not an equivalence relation'),
          h('div.verdict__body.small', null, isEq
            ? renderInline(`Classes: ${classes(p).map((c) => `$\\{${c.join(', ')}\\}$`).join(', ')}. Every element sits in exactly one — that partition **is** what an equivalence relation buys you.`)
            : renderInline('All three properties are required. Two out of three is not enough.'))
        )));
    }

    function prop(name, ok, detail) {
      return h('div.row', {
        style: { alignItems: 'flex-start', gap: '10px', padding: '8px 0', borderBottom: '1px solid var(--line-soft)' }
      },
        h('span', {
          style: {
            flex: '0 0 auto', width: '22px', height: '22px', borderRadius: '7px',
            display: 'grid', placeItems: 'center', fontWeight: '800', fontSize: '.75rem',
            background: ok ? 'var(--ok)' : 'var(--bad-dim)',
            color: ok ? '#04231a' : 'var(--bad)'
          }
        }, ok ? '✓' : '✗'),
        h('div', null,
          h('div', { style: { fontWeight: '700', fontSize: '.88rem' } }, name),
          h('div.small.muted', null, renderInline(detail)))
      );
    }

    /** Equivalence classes, assuming the relation really is one. */
    function classes(p) {
      const seen = new Set(), out = [];
      for (const a of SET) {
        if (seen.has(a)) continue;
        const cls = SET.filter((b) => has(a, b));
        cls.forEach((b) => seen.add(b));
        out.push(cls);
      }
      return out;
    }

    /* ---------------- challenges ---------------- */

    const taskBox = h('div.callout.callout--jee', { style: { margin: '0 0 12px' } });
    cab.panel.appendChild(taskBox);

    function renderTask() {
      clear(taskBox);
      if (!task) {
        taskBox.className = 'callout callout--tip';
        taskBox.appendChild(h('div.callout__label', null, 'Free play'));
        taskBox.appendChild(h('div.small', null, renderInline('Try the 8 relations that are both reflexive and symmetric — how many of them are also transitive?')));
        return;
      }
      taskBox.className = 'callout callout--jee';
      taskBox.appendChild(h('div.callout__label', null, `Challenge ${solved + 1} / ${CHALLENGES.length}`));
      taskBox.appendChild(h('div.small', null, renderInline(task.text)));
    }

    function checkTask() {
      if (!task || settled) return;
      const p = analyse();
      if (!task.test(p)) return;

      settled = true;
      solved++;
      score += 30;
      cab.setScore(score);
      sfx.levelUp();
      ctx.fx?.burstAt(taskBox, { count: 20 });

      clear(taskBox);
      taskBox.className = 'callout callout--tip';
      taskBox.appendChild(h('div.callout__label', null, '✓ Constructed'));
      taskBox.appendChild(h('div.small', null, renderInline(task.note)));
      taskBox.appendChild(h('div.btnbar', { style: { marginTop: '10px' } },
        btn(queue.length ? 'Next challenge' : 'Finish', next, { kind: 'primary' })));
    }

    function refresh() {
      renderMatrix();
      renderProps();
      checkTask();
    }

    function next() {
      settled = false;
      R = new Set();
      if (!queue.length) { task = null; finish(); }
      else task = queue.shift();
      renderTask();
      refresh();
    }

    function finish() {
      const best = Math.max(ctx.best ?? 0, score);
      cab.setBest(best);
      ctx.report(score, { best, solved });
      cab.setHint('All five constructed. Free play is open.');
    }

    function start() {
      cab.clearOverlay();
      queue = shuffle(CHALLENGES);
      R = new Set(); score = 0; solved = 0; settled = false;
      cab.setScore(0);
      task = queue.shift();
      renderTask();
      refresh();
    }

    start();
    return { destroy() {} };
  }
};
