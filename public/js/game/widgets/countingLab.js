/**
 * Survey Room - fill a three-circle Venn diagram from survey totals.
 *
 * The constraint list beside the diagram ticks off live as the numbers become
 * consistent, so the learner discovers the only workable order: start from the
 * centre and work outwards. That ordering *is* the technique.
 *
 * Teaches: inclusion-exclusion, and the "exactly one / exactly two / none"
 * questions that follow from a completed diagram.
 */

import { h, clear } from '../../core/dom.js';
import { renderInline, renderMath } from '../../core/mathlite.js';
import { sfx } from '../../core/audio.js';
import { arcade, btn, cleared, shuffle } from '../kit.js';

const PUZZLES = [
  {
    story: 'Of 100 people surveyed about newspapers:',
    labels: { A: 'Reads A', B: 'Reads B', C: 'Reads C' },
    given: { A: 45, B: 35, C: 30, AB: 15, BC: 12, AC: 10, ABC: 5, U: 100 },
    ask: { text: 'How many read **exactly one** newspaper?', key: 'exactlyOne' }
  },
  {
    story: 'In a class of 60 students taking science subjects:',
    labels: { A: 'Physics', B: 'Chemistry', C: 'Maths' },
    given: { A: 30, B: 32, C: 35, AB: 15, BC: 18, AC: 16, ABC: 8, U: 60 },
    ask: { text: 'How many take **none** of the three?', key: 'none' }
  },
  {
    story: 'A survey of 70 households about streaming services:',
    labels: { A: 'Service A', B: 'Service B', C: 'Service C' },
    given: { A: 40, B: 30, C: 25, AB: 14, BC: 10, AC: 12, ABC: 6, U: 70 },
    ask: { text: 'How many subscribe to **exactly two** services?', key: 'exactlyTwo' }
  },
  {
    story: 'Of 50 athletes at a training camp:',
    labels: { A: 'Runs', B: 'Swims', C: 'Cycles' },
    given: { A: 28, B: 22, C: 20, AB: 10, BC: 8, AC: 9, ABC: 4, U: 50 },
    ask: { text: 'How many do **at least one** of the three?', key: 'union' }
  }
];

const SLOTS = [
  { key: 'onlyA', x: 25, y: 32, label: 'only A' },
  { key: 'onlyB', x: 75, y: 32, label: 'only B' },
  { key: 'onlyC', x: 50, y: 78, label: 'only C' },
  { key: 'abOnly', x: 50, y: 26, label: 'A∩B only' },
  { key: 'acOnly', x: 31, y: 61, label: 'A∩C only' },
  { key: 'bcOnly', x: 69, y: 61, label: 'B∩C only' },
  { key: 'abc', x: 50, y: 48, label: 'all three' },
  { key: 'none', x: 90, y: 9, label: 'none' }
];

export default {
  id: 'countingLab',

  mount(root, ctx) {
    const cab = arcade(root, {
      title: 'Survey Room',
      badge: 'Inclusion–exclusion',
      hint: 'Start at the centre. Every other region depends on it.',
      best: ctx.best ?? null,
      onRestart: start
    });

    let queue = [], p = null, vals = {}, score = 0, solved = 0, phase = 'fill';

    const board = h('div', { style: { padding: '14px' } });
    cab.stage.appendChild(board);

    /* ---------------- expected answers ---------------- */

    function truth() {
      const g = p.given;
      const abc = g.ABC;
      const abOnly = g.AB - abc, bcOnly = g.BC - abc, acOnly = g.AC - abc;
      const onlyA = g.A - abOnly - acOnly - abc;
      const onlyB = g.B - abOnly - bcOnly - abc;
      const onlyC = g.C - acOnly - bcOnly - abc;
      const union = onlyA + onlyB + onlyC + abOnly + bcOnly + acOnly + abc;
      return {
        onlyA, onlyB, onlyC, abOnly, bcOnly, acOnly, abc,
        none: g.U - union,
        union,
        exactlyOne: onlyA + onlyB + onlyC,
        exactlyTwo: abOnly + bcOnly + acOnly
      };
    }

    /* ---------------- rendering ---------------- */

    function render() {
      clear(board);

      board.appendChild(h('div', { style: { marginBottom: '10px' } },
        h('div.tiny.dim', null, 'SURVEY DATA'),
        h('div', null, p.story)));

      const layout = h('div', { style: { display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,230px)', gap: '16px' } });
      layout.appendChild(diagram());
      layout.appendChild(constraints());
      board.appendChild(layout);
    }

    function diagram() {
      const wrap = h('div', { style: { position: 'relative', aspectRatio: '1.25', minHeight: '280px' } });

      // Background Venn drawn as inline SVG so it scales with the container.
      wrap.appendChild(h('div', {
        style: { position: 'absolute', inset: '0' },
        html: `<svg viewBox="0 0 200 160" width="100%" height="100%" aria-hidden="true">
          <rect x="2" y="2" width="196" height="156" rx="6" fill="none" stroke="var(--line)" stroke-width="1.4"/>
          <text x="190" y="16" font-size="11" font-weight="700" fill="var(--ink-4)" text-anchor="end">U</text>
          <circle cx="76" cy="62" r="46" fill="var(--hue,var(--maths))" fill-opacity="0.10" stroke="var(--ink-3)" stroke-width="1.6"/>
          <circle cx="124" cy="62" r="46" fill="var(--hue,var(--maths))" fill-opacity="0.10" stroke="var(--ink-3)" stroke-width="1.6"/>
          <circle cx="100" cy="103" r="46" fill="var(--hue,var(--maths))" fill-opacity="0.10" stroke="var(--ink-3)" stroke-width="1.6"/>
          <text x="40" y="30" font-size="12" font-weight="800" fill="var(--ink-1)">A</text>
          <text x="156" y="30" font-size="12" font-weight="800" fill="var(--ink-1)">B</text>
          <text x="100" y="152" font-size="12" font-weight="800" fill="var(--ink-1)" text-anchor="middle">C</text>
        </svg>`
      }));

      for (const s of SLOTS) {
        const input = h('input.input.mono', {
          type: 'text', inputmode: 'numeric', value: vals[s.key] ?? '',
          'aria-label': s.label,
          style: {
            position: 'absolute', left: s.x + '%', top: s.y + '%',
            transform: 'translate(-50%,-50%)', width: '54px', padding: '5px 4px',
            textAlign: 'center', fontSize: '.85rem'
          },
          onInput: (e) => {
            const v = e.target.value.trim();
            vals[s.key] = v === '' ? '' : Number(v);
            refreshConstraints();
          }
        });
        wrap.appendChild(input);
      }
      return wrap;
    }

    let consBox = null;

    function constraints() {
      consBox = h('div');
      refreshConstraints();
      return consBox;
    }

    function rules() {
      const v = (k) => (vals[k] === '' || vals[k] === undefined || Number.isNaN(vals[k]) ? null : Number(vals[k]));
      const sum = (...ks) => {
        const parts = ks.map(v);
        return parts.some((x) => x === null) ? null : parts.reduce((a, b) => a + b, 0);
      };
      const g = p.given;
      return [
        { tex: `n(A\\cap B\\cap C) = ${g.ABC}`, got: v('abc'), want: g.ABC },
        { tex: `n(A\\cap B) = ${g.AB}`, got: sum('abOnly', 'abc'), want: g.AB },
        { tex: `n(B\\cap C) = ${g.BC}`, got: sum('bcOnly', 'abc'), want: g.BC },
        { tex: `n(A\\cap C) = ${g.AC}`, got: sum('acOnly', 'abc'), want: g.AC },
        { tex: `n(A) = ${g.A}`, got: sum('onlyA', 'abOnly', 'acOnly', 'abc'), want: g.A },
        { tex: `n(B) = ${g.B}`, got: sum('onlyB', 'abOnly', 'bcOnly', 'abc'), want: g.B },
        { tex: `n(C) = ${g.C}`, got: sum('onlyC', 'acOnly', 'bcOnly', 'abc'), want: g.C },
        { tex: `n(U) = ${g.U}`, got: sum('onlyA', 'onlyB', 'onlyC', 'abOnly', 'bcOnly', 'acOnly', 'abc', 'none'), want: g.U }
      ];
    }

    function refreshConstraints() {
      if (!consBox) return;
      clear(consBox);
      consBox.appendChild(h('div.tiny.dim', { style: { marginBottom: '6px' } }, 'CONSTRAINTS'));

      const rs = rules();
      for (const r of rs) {
        const state = r.got === null ? 'pending' : r.got === r.want ? 'ok' : 'bad';
        consBox.appendChild(h('div.row', {
          style: { justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--line-soft)' }
        },
          h('span.small', null, renderMath(r.tex)),
          h('span', {
            style: { fontWeight: '800', fontSize: '.8rem', color: state === 'ok' ? 'var(--ok)' : state === 'bad' ? 'var(--bad)' : 'var(--ink-4)' }
          }, state === 'ok' ? '✓' : state === 'bad' ? String(r.got) : '–')
        ));
      }

      const allOk = rs.every((r) => r.got !== null && r.got === r.want);
      if (allOk && phase === 'fill') settle();
    }

    /* ---------------- settle and ask ---------------- */

    function settle() {
      phase = 'ask';
      score += 30;
      cab.setScore(score);
      sfx.levelUp();
      ctx.fx?.burstAt(board, { count: 22 });
      cab.setHint('Diagram consistent. Now read the answer off it.');

      const t = truth();
      const ansBox = h('div', { style: { marginTop: '14px' } });
      const input = h('input.input.mono', {
        type: 'text', inputmode: 'numeric', placeholder: 'answer', style: { maxWidth: '150px' },
        onKeyDown: (e) => { if (e.key === 'Enter') grade(input.value, t); }
      });

      ansBox.appendChild(h('div.callout.callout--jee', null,
        h('div.callout__label', null, 'Now answer'),
        h('div.small', null, renderInline(p.ask.text)),
        h('div.row', { style: { marginTop: '10px', gap: '10px', flexWrap: 'wrap' } },
          input, btn('Check', () => grade(input.value, t), { kind: 'primary' }))
      ));
      board.appendChild(ansBox);
      setTimeout(() => input.focus(), 40);
    }

    function grade(raw, t) {
      const want = t[p.ask.key];
      const v = Number(String(raw).trim());
      const ok = Number.isFinite(v) && v === want;

      if (ok) {
        solved++;
        score += 25;
        cab.setScore(score);
        sfx.correct();
      } else {
        score = Math.max(0, score - 6);
        cab.setScore(score);
        sfx.wrong();
      }

      board.appendChild(h('div', { style: { marginTop: '12px' } },
        h('div.verdict' + (ok ? '.verdict--ok' : '.verdict--bad'), null,
          h('div.verdict__head', null, ok ? '✓ Correct' : `✗ The answer is ${want}`),
          h('div.verdict__body.small', null,
            h('ul', null,
              h('li', null, `Exactly one: ${t.onlyA} + ${t.onlyB} + ${t.onlyC} = **${t.exactlyOne}**`.replace(/\*\*(.*?)\*\*/g, '$1')),
              h('li', null, `Exactly two: ${t.abOnly} + ${t.bcOnly} + ${t.acOnly} = ${t.exactlyTwo}`),
              h('li', null, `All three: ${t.abc}`),
              h('li', null, `At least one: ${t.union}; none: ${t.none}`)
            ),
            renderMath(`n(A\\cup B\\cup C) = ${p.given.A}+${p.given.B}+${p.given.C}-${p.given.AB}-${p.given.BC}-${p.given.AC}+${p.given.ABC} = ${t.union}`, { display: true })
          )),
        h('div.btnbar', { style: { marginTop: '12px' } },
          btn(queue.length ? 'Next survey' : 'Finish', next, { kind: 'primary', size: 'md' }))
      ));
    }

    function next() {
      if (!queue.length) return finish();
      p = queue.shift();
      vals = {}; phase = 'fill';
      cab.setHint('Start at the centre. Every other region depends on it.');
      render();
    }

    function finish() {
      const best = Math.max(ctx.best ?? 0, score);
      cab.setBest(best);
      ctx.report(score, { best, solved });
      cab.overlay(cleared(score, best, start, h('p.small.muted', null, `${solved} surveys resolved.`)));
    }

    function start() {
      cab.clearOverlay();
      queue = shuffle(PUZZLES).slice(0, 3);
      score = 0; solved = 0;
      cab.setScore(0);
      next();
    }

    start();
    return { destroy() {} };
  }
};
