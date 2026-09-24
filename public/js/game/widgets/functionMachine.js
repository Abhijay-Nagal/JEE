/**
 * Function Machine - change the domain and codomain, not the rule.
 *
 * The central insight of this topic is that "is f one-one?" is not a question
 * about the formula alone. x^2 is neither injective nor surjective on R, and
 * bijective on [0, inf). Here the rule stays fixed while the learner edits the
 * two sets, and the verdict flips in front of them.
 *
 * Teaches: injective, surjective, bijective, and why domain and codomain are
 * part of the definition of a function.
 */

import { h, clear } from '../../core/dom.js';
import { renderInline, renderMath } from '../../core/mathlite.js';
import { sfx } from '../../core/audio.js';
import { arcade, canvasLayer, cssVar, c2d, btn, cleared, shuffle } from '../kit.js';

const RULES = [
  { id: 'sq',   tex: 'f(x) = x^2',      f: (x) => x * x,      note: 'Many-one on any domain containing $\\pm k$.' },
  { id: 'cube', tex: 'f(x) = x^3',      f: (x) => x ** 3,     note: 'Strictly increasing, so always one-one.' },
  { id: 'lin',  tex: 'f(x) = 2x + 1',   f: (x) => 2 * x + 1,  note: 'Any non-constant linear rule is one-one.' },
  { id: 'abs',  tex: 'f(x) = |x|',      f: (x) => Math.abs(x), note: 'Folds the negatives onto the positives.' },
  { id: 'const', tex: 'f(x) = 2',       f: () => 2,           note: 'A constant function: maximally many-one.' }
];

const POOL = [-3, -2, -1, 0, 1, 2, 3];
const CODOMAIN_POOL = [-27, -8, -3, -1, 0, 1, 2, 3, 4, 5, 7, 8, 9, 27];

const CHALLENGES = [
  {
    text: 'With $f(x) = x^2$, **restrict the domain** so that $f$ becomes one-one.',
    rule: 'sq',
    test: (s) => s.isFunction && s.injective && s.domain.length >= 3,
    note: 'Keeping only non-negative inputs (or only non-positive ones) removes the folding. This is exactly why $\\sqrt{\\ }$ is defined with domain $[0,\\infty)$.'
  },
  {
    text: 'With $f(x) = x^2$, **shrink the codomain** so that $f$ becomes onto.',
    rule: 'sq',
    test: (s) => s.isFunction && s.surjective && s.domain.length >= 3,
    note: 'Onto simply means range $=$ codomain. Any function can be made onto by declaring its codomain to be its range — which is why "onto" is a statement about the *pair*, not about the rule.'
  },
  {
    text: 'Make $f(x) = x^3$ into a **bijection**.',
    rule: 'cube',
    test: (s) => s.isFunction && s.injective && s.surjective && s.domain.length >= 3,
    note: 'Cubing is already one-one; you only had to match the codomain to the range. A bijection is exactly the condition for an inverse to exist.'
  },
  {
    text: 'Build a function that is **onto but not one-one**.',
    rule: null,
    test: (s) => s.isFunction && s.surjective && !s.injective,
    note: 'Possible only when the domain is strictly bigger than the codomain — by the pigeonhole principle, two inputs must share an output.'
  },
  {
    text: 'Build a function that is **one-one but not onto**.',
    rule: null,
    test: (s) => s.isFunction && s.injective && !s.surjective,
    note: 'Possible only when the codomain is strictly bigger than the domain. On **finite sets of equal size**, one-one and onto imply each other — a fact worth a lot of marks.'
  }
];

export default {
  id: 'functionMachine',

  mount(root, ctx) {
    const cab = arcade(root, {
      title: 'Function Machine',
      badge: 'Injective / surjective',
      hint: 'The rule is fixed. Change the two sets and watch the verdict flip.',
      best: ctx.best ?? null,
      onRestart: start
    });

    let rule = RULES[0];
    let domain = new Set([-2, -1, 0, 1, 2]);
    let codomain = new Set([0, 1, 4, 9]);
    let queue = [], task = null, score = 0, solved = 0, settled = false;

    const layout = h('div', { style: { padding: '14px' } });
    cab.stage.appendChild(layout);

    const view = canvasLayer(layout, {
      height: 240,
      draw(g, w, hgt) {
        const D = [...domain].sort((a, b) => a - b);
        const C = [...codomain].sort((a, b) => a - b);
        const hue = cssVar('--hue') || cssVar('--maths');
        const lx = w * 0.22, rx = w * 0.78;
        const ys = (n, i) => n <= 1 ? hgt / 2 : 30 + i * ((hgt - 60) / (n - 1));

        g.strokeStyle = cssVar('--line'); g.lineWidth = 1.5;
        g.beginPath(); g.ellipse(lx, hgt / 2, 44, hgt / 2 - 10, 0, 0, Math.PI * 2); g.stroke();
        g.beginPath(); g.ellipse(rx, hgt / 2, 44, hgt / 2 - 10, 0, 0, Math.PI * 2); g.stroke();
        c2d.text(g, 'DOMAIN', lx, 12, { size: 10, weight: 800, color: cssVar('--ink-4') });
        c2d.text(g, 'CODOMAIN', rx, 12, { size: 10, weight: 800, color: cssVar('--ink-4') });

        // count arrivals per codomain element, to colour many-one collisions
        const arrivals = new Map();
        for (const x of D) {
          const y = rule.f(x);
          arrivals.set(y, (arrivals.get(y) || 0) + 1);
        }

        for (const [i, x] of D.entries()) {
          const y = rule.f(x);
          const j = C.indexOf(y);
          const y1 = ys(D.length, i);
          if (j === -1) {
            // image escapes the codomain: it is not a function into B
            c2d.arrow(g, lx + 18, y1, rx - 60, y1, { color: cssVar('--bad'), width: 2, head: 7 });
            c2d.text(g, `${y} ✗`, rx - 44, y1 - 10, { size: 10, weight: 800, color: cssVar('--bad') });
            continue;
          }
          const collide = arrivals.get(y) > 1;
          c2d.arrow(g, lx + 18, y1, rx - 18, ys(C.length, j), {
            color: collide ? cssVar('--warn') : hue, width: collide ? 2.2 : 1.6, head: 7
          });
        }

        D.forEach((x, i) => node(g, lx, ys(D.length, i), String(x), cssVar('--bg-3'), cssVar('--ink-1')));
        C.forEach((y, j) => {
          const hit = arrivals.has(y);
          node(g, rx, ys(C.length, j), String(y), hit ? hue : cssVar('--bg-3'), hit ? cssVar('--primary-ink') : cssVar('--ink-4'));
        });
      }
    });

    function node(g, x, y, label, fill, ink) {
      g.beginPath(); g.arc(x, y, 15, 0, Math.PI * 2);
      g.fillStyle = fill; g.fill();
      g.strokeStyle = cssVar('--line'); g.lineWidth = 1; g.stroke();
      c2d.text(g, label, x, y, { size: 11, weight: 700, color: ink });
    }

    /* ---------------- analysis ---------------- */

    function analyse() {
      const D = [...domain].sort((a, b) => a - b);
      const images = D.map(rule.f);
      const inCodomain = images.every((y) => codomain.has(y));
      const rangeSet = new Set(images);
      return {
        domain: D,
        images,
        isFunction: D.length > 0 && inCodomain,
        injective: new Set(images).size === images.length,
        surjective: inCodomain && rangeSet.size === codomain.size,
        escaped: images.filter((y) => !codomain.has(y)),
        range: [...rangeSet].sort((a, b) => a - b)
      };
    }

    /* ---------------- panel ---------------- */

    const panel = cab.panel;
    const taskBox = h('div.callout.callout--jee', { style: { margin: '0 0 12px' } });
    const ruleBox = h('div', { style: { textAlign: 'center', marginBottom: '12px' } });
    const chipsBox = h('div');
    const verdictBox = h('div', { style: { marginTop: '14px' } });

    panel.appendChild(taskBox);
    panel.appendChild(ruleBox);
    panel.appendChild(chipsBox);
    panel.appendChild(verdictBox);

    function chipRow(label, pool, set, onToggle, locked = false) {
      const row = h('div.tiles', { style: { marginBottom: '10px' } });
      for (const v of pool) {
        const on = set.has(v);
        const b = h('button.tile.mono', {
          style: {
            padding: '6px 11px', fontSize: '.82rem',
            background: on ? 'var(--hue, var(--primary))' : '',
            color: on ? 'var(--primary-ink)' : '',
            borderColor: on ? 'transparent' : ''
          },
          disabled: locked,
          onClick: () => { onToggle(v); }
        }, String(v));
        row.appendChild(b);
      }
      return h('div', null, h('div.tiny.dim', { style: { marginBottom: '4px' } }, label), row);
    }

    function render() {
      clear(ruleBox);
      ruleBox.appendChild(h('div.tiny.dim', null, 'THE RULE (fixed)'));
      ruleBox.appendChild(h('div', { style: { fontSize: '1.2rem', margin: '4px 0' } }, renderMath(rule.tex)));
      if (!task || !task.rule) {
        const row = h('div.tiles', { style: { justifyContent: 'center' } });
        for (const r of RULES) {
          row.appendChild(h('button.tile', {
            style: r.id === rule.id ? { background: 'var(--hue, var(--primary))', color: 'var(--primary-ink)', borderColor: 'transparent' } : {},
            onClick: () => { rule = r; sfx.click(); refresh(); }
          }, renderMath(r.tex)));
        }
        ruleBox.appendChild(row);
      }

      clear(chipsBox);
      chipsBox.appendChild(chipRow('DOMAIN — click to include or exclude', POOL, domain, (v) => {
        if (domain.has(v)) domain.delete(v); else domain.add(v);
        sfx.tick(); refresh();
      }));
      chipsBox.appendChild(chipRow('CODOMAIN — click to include or exclude', CODOMAIN_POOL, codomain, (v) => {
        if (codomain.has(v)) codomain.delete(v); else codomain.add(v);
        sfx.tick(); refresh();
      }));
      chipsBox.appendChild(h('div.btnbar', null,
        btn('Codomain = range', () => {
          codomain = new Set(analyse().range);
          sfx.pop(); refresh();
        }, { kind: 'ghost' })
      ));
    }

    function renderVerdict() {
      clear(verdictBox);
      const s = analyse();

      if (!s.domain.length) {
        verdictBox.appendChild(h('div.verdict.verdict--bad', null,
          h('div.verdict__head', null, 'Empty domain'),
          h('div.verdict__body.small', null, 'Add at least one element to the domain.')));
        return;
      }
      if (!s.isFunction) {
        verdictBox.appendChild(h('div.verdict.verdict--bad', null,
          h('div.verdict__head', null, '✗ Not a function into this codomain'),
          h('div.verdict__body.small', null, renderInline(
            `The image${s.escaped.length > 1 ? 's' : ''} **${[...new Set(s.escaped)].join(', ')}** ${s.escaped.length > 1 ? 'are' : 'is'} not in the codomain. Every output must land somewhere in $B$.`))));
        return;
      }

      const kind = s.injective && s.surjective ? 'bijective'
        : s.injective ? 'one-one (injective) but into'
        : s.surjective ? 'onto (surjective) but many-one'
        : 'many-one and into';

      verdictBox.appendChild(h('div.verdict' + (s.injective && s.surjective ? '.verdict--ok' : ''), null,
        h('div.verdict__head', null, `✓ A function — ${kind}`),
        h('div.verdict__body.small', null,
          h('div.row', { style: { gap: '8px', flexWrap: 'wrap', marginBottom: '8px' } },
            h('span.tag' + (s.injective ? '.tag--ok' : ''), null, (s.injective ? '✓' : '✗') + ' one-one'),
            h('span.tag' + (s.surjective ? '.tag--ok' : ''), null, (s.surjective ? '✓' : '✗') + ' onto')),
          h('p', { style: { marginBottom: '4px' } }, renderInline(`Range $= \\{${s.range.join(', ')}\\}$, codomain has ${codomain.size} element${codomain.size === 1 ? '' : 's'}.`)),
          h('p', { style: { marginBottom: 0 } }, renderInline(
            s.injective ? '' : `Two inputs share an output: ${collisionText(s)}.`
          ))
        )));
    }

    function collisionText(s) {
      const byImage = new Map();
      s.domain.forEach((x, i) => {
        const y = s.images[i];
        if (!byImage.has(y)) byImage.set(y, []);
        byImage.get(y).push(x);
      });
      const c = [...byImage.entries()].find(([, xs]) => xs.length > 1);
      return c ? `$f(${c[1][0]}) = f(${c[1][1]}) = ${c[0]}$` : '';
    }

    /* ---------------- challenges ---------------- */

    function renderTask() {
      clear(taskBox);
      if (!task) {
        taskBox.className = 'callout callout--tip';
        taskBox.appendChild(h('div.callout__label', null, 'Free play'));
        taskBox.appendChild(h('div.small', null, renderInline('Try to make $f(x)=|x|$ a bijection. You will find it needs both edits at once.')));
        return;
      }
      taskBox.className = 'callout callout--jee';
      taskBox.appendChild(h('div.callout__label', null, `Challenge ${solved + 1} / ${CHALLENGES.length}`));
      taskBox.appendChild(h('div.small', null, renderInline(task.text)));
    }

    function checkTask() {
      if (!task || settled) return;
      if (!task.test(analyse())) return;

      settled = true;
      solved++;
      score += 30;
      cab.setScore(score);
      sfx.levelUp();
      ctx.fx?.burstAt(taskBox, { count: 20 });

      clear(taskBox);
      taskBox.className = 'callout callout--tip';
      taskBox.appendChild(h('div.callout__label', null, '✓ Done'));
      taskBox.appendChild(h('div.small', null, renderInline(task.note)));
      taskBox.appendChild(h('div.btnbar', { style: { marginTop: '10px' } },
        btn(queue.length ? 'Next challenge' : 'Finish', next, { kind: 'primary' })));
    }

    function refresh() {
      render();
      renderVerdict();
      view.redraw();
      checkTask();
    }

    function next() {
      settled = false;
      if (!queue.length) { task = null; finish(); }
      else {
        task = queue.shift();
        if (task.rule) rule = RULES.find((r) => r.id === task.rule);
        domain = new Set([-2, -1, 0, 1, 2]);
        codomain = new Set([0, 1, 2, 4, 9]);
      }
      renderTask();
      refresh();
    }

    function finish() {
      const best = Math.max(ctx.best ?? 0, score);
      cab.setBest(best);
      ctx.report(score, { best, solved });
      cab.setHint('All challenges cleared. Free play is open.');
    }

    function start() {
      cab.clearOverlay();
      queue = shuffle(CHALLENGES);
      score = 0; solved = 0; settled = false;
      cab.setScore(0);
      task = queue.shift();
      if (task.rule) rule = RULES.find((r) => r.id === task.rule);
      domain = new Set([-2, -1, 0, 1, 2]);
      codomain = new Set([0, 1, 2, 4, 9]);
      renderTask();
      refresh();
    }

    start();
    return { destroy() { view.stop(); } };
  }
};
