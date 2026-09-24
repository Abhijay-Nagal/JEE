/**
 * Relation Grid - the same relation, shown three ways at once.
 *
 * Toggling a cell of the A x B grid updates the roster form, the arrow
 * diagram, the domain and range, and the verdict on whether it is a function.
 * Seeing all four move together is what makes "a relation is a subset of the
 * Cartesian product" stop being a slogan.
 *
 * Teaches: relations as sets of ordered pairs, domain vs codomain vs range,
 * and the exactly-one-output rule.
 */

import { h, clear } from '../../core/dom.js';
import { renderInline, renderMath } from '../../core/mathlite.js';
import { sfx } from '../../core/audio.js';
import { arcade, canvasLayer, cssVar, c2d, btn, cleared, shuffle } from '../kit.js';

const A = [1, 2, 3, 4];
const B = ['p', 'q', 'r'];

const CHALLENGES = [
  {
    text: 'Build a relation that **is a function** from $A$ to $B$.',
    test: (S) => A.every((a) => S.filter(([x]) => x === a).length === 1),
    note: 'Every element of $A$ used exactly once. Note that two arrows may land on the same element of $B$ — that is allowed, and makes it many-one.'
  },
  {
    text: 'Build a relation that is **not** a function, because one input has two outputs.',
    test: (S) => A.some((a) => S.filter(([x]) => x === a).length >= 2),
    note: 'One input, two outputs — instantly disqualified. A vertical line would cut this graph twice.'
  },
  {
    text: 'Build a function whose **range is a proper subset of the codomain** (some element of $B$ is never hit).',
    test: (S) => A.every((a) => S.filter(([x]) => x === a).length === 1)
      && new Set(S.map(([, b]) => b)).size < B.length,
    note: 'This is an **into** function: the range is smaller than the codomain, so it is not onto.'
  },
  {
    text: 'Build a function that is **onto** (every element of $B$ is hit at least once).',
    test: (S) => A.every((a) => S.filter(([x]) => x === a).length === 1)
      && new Set(S.map(([, b]) => b)).size === B.length,
    note: 'Range equals codomain — surjective. With $|A| = 4 > 3 = |B|$ it cannot also be one-one, so no bijection exists here.'
  },
  {
    text: 'Build a relation with **domain $\\{1, 3\\}$** — the other elements of $A$ relate to nothing.',
    test: (S) => {
      const d = new Set(S.map(([a]) => a));
      return d.size === 2 && d.has(1) && d.has(3);
    },
    note: 'Perfectly legal for a *relation*. It is exactly what disqualifies it as a *function* from $A$, since 2 and 4 have no image.'
  }
];

export default {
  id: 'relationGrid',

  mount(root, ctx) {
    const cab = arcade(root, {
      title: 'Relation Grid',
      badge: 'A × B',
      hint: 'Toggle cells to add or remove ordered pairs.',
      best: ctx.best ?? null,
      onRestart: start
    });

    let cells = new Set();        // "a|b"
    let queue = [], task = null, score = 0, solved = 0, settled = false;

    const layout = h('div', { style: { display: 'grid', gridTemplateColumns: 'auto minmax(0,1fr)', gap: '18px', padding: '16px', alignItems: 'start' } });
    cab.stage.appendChild(layout);

    const gridBox = h('div');
    const arrowBox = h('div');
    layout.appendChild(gridBox);
    layout.appendChild(arrowBox);

    const pairs = () => [...cells].map((k) => {
      const [a, b] = k.split('|');
      return [Number(a), b];
    }).sort((x, y) => x[0] - y[0] || (x[1] < y[1] ? -1 : 1));

    /* ---------------- the grid ---------------- */

    function renderGrid() {
      clear(gridBox);
      gridBox.appendChild(h('div.tiny.dim', { style: { marginBottom: '6px' } }, 'CLICK A CELL'));

      const table = h('div.matrixgrid', {
        style: { gridTemplateColumns: `repeat(${B.length + 1}, auto)` }
      });
      table.appendChild(h('div.matrixhdr', null, ''));
      for (const b of B) table.appendChild(h('div.matrixhdr', null, b));

      for (const a of A) {
        table.appendChild(h('div.matrixhdr', null, String(a)));
        for (const b of B) {
          const key = `${a}|${b}`;
          const cell = h('div.matrixcell', {
            role: 'button', tabindex: '0',
            dataset: { on: String(cells.has(key)) },
            title: `(${a}, ${b})`,
            onClick: () => toggle(key),
            onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(key); } }
          }, cells.has(key) ? '•' : '');
          table.appendChild(cell);
        }
      }
      gridBox.appendChild(table);
      gridBox.appendChild(h('div.tiny.dim', { style: { marginTop: '8px' } },
        `${A.length} × ${B.length} = ${A.length * B.length} possible pairs`));
      gridBox.appendChild(h('div.tiny.dim', null, `2^${A.length * B.length} = ${2 ** (A.length * B.length)} possible relations`));
    }

    function toggle(key) {
      if (settled) return;
      if (cells.has(key)) cells.delete(key); else cells.add(key);
      sfx.tick();
      renderGrid();
      view.redraw();
      renderInfo();
      checkTask();
    }

    /* ---------------- arrow diagram ---------------- */

    const view = canvasLayer(arrowBox, {
      height: 210,
      draw(g, w, hgt) {
        const hue = cssVar('--hue') || cssVar('--maths');
        const lx = w * 0.26, rx = w * 0.74;
        const ay = (i) => 30 + i * ((hgt - 60) / (A.length - 1));
        const by = (i) => 46 + i * ((hgt - 92) / (B.length - 1));

        // blobs
        g.strokeStyle = cssVar('--line'); g.lineWidth = 1.5;
        roundedBlob(g, lx, hgt / 2, 42, hgt / 2 - 8);
        roundedBlob(g, rx, hgt / 2, 42, hgt / 2 - 22);
        c2d.text(g, 'A', lx, 12, { size: 13, weight: 800, color: cssVar('--ink-2') });
        c2d.text(g, 'B', rx, 12, { size: 13, weight: 800, color: cssVar('--ink-2') });

        // arrows
        for (const [a, b] of pairs()) {
          const i = A.indexOf(a), j = B.indexOf(b);
          c2d.arrow(g, lx + 16, ay(i), rx - 16, by(j), { color: hue, width: 1.8, head: 7 });
        }

        // elements
        A.forEach((a, i) => dot(g, lx, ay(i), String(a), cssVar('--bg-3'), cssVar('--ink-1')));
        B.forEach((b, j) => {
          const hit = pairs().some(([, y]) => y === b);
          dot(g, rx, by(j), b, hit ? hue : cssVar('--bg-3'), hit ? cssVar('--primary-ink') : cssVar('--ink-3'));
        });
      }
    });

    function roundedBlob(g, cx, cy, rx, ry) {
      g.beginPath();
      g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      g.stroke();
    }
    function dot(g, x, y, label, fill, ink) {
      g.beginPath(); g.arc(x, y, 13, 0, Math.PI * 2);
      g.fillStyle = fill; g.fill();
      g.strokeStyle = cssVar('--line'); g.lineWidth = 1; g.stroke();
      c2d.text(g, label, x, y, { size: 12, weight: 700, color: ink });
    }

    /* ---------------- info panel ---------------- */

    const info = h('div');
    const taskBox = h('div.callout.callout--jee', { style: { margin: '0 0 12px' } });
    cab.panel.appendChild(taskBox);
    cab.panel.appendChild(info);

    function renderInfo() {
      clear(info);
      const S = pairs();
      const domain = [...new Set(S.map(([a]) => a))].sort((x, y) => x - y);
      const rangeS = [...new Set(S.map(([, b]) => b))].sort();
      const counts = A.map((a) => S.filter(([x]) => x === a).length);
      const isFunction = counts.every((c) => c === 1);
      const offenders = A.filter((a, i) => counts[i] !== 1);

      info.appendChild(h('div.tiny.dim', null, 'ROSTER FORM'));
      info.appendChild(h('div.mono', { style: { marginBottom: '10px', fontSize: '.88rem' } },
        S.length ? `R = { ${S.map(([a, b]) => `(${a}, ${b})`).join(', ')} }` : 'R = ∅'));

      const row = (k, v) => h('div.row', { style: { justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--line-soft)' } },
        h('span.small.muted', null, k), h('span.small.mono', null, v));

      info.appendChild(row('Domain', domain.length ? `{ ${domain.join(', ')} }` : '∅'));
      info.appendChild(row('Codomain', `{ ${B.join(', ')} }`));
      info.appendChild(row('Range', rangeS.length ? `{ ${rangeS.join(', ')} }` : '∅'));
      info.appendChild(row('Number of pairs', String(S.length)));

      const verdict = h('div', { style: { marginTop: '12px' } });
      if (isFunction) {
        const onto = rangeS.length === B.length;
        const oneOne = new Set(S.map(([, b]) => b)).size === S.length;
        verdict.appendChild(h('div.verdict.verdict--ok', null,
          h('div.verdict__head', null, '✓ This is a function'),
          h('div.verdict__body.small', null, renderInline(
            `Every element of $A$ has exactly one image. It is **${oneOne ? 'one-one' : 'many-one'}** and **${onto ? 'onto' : 'into'}**.` +
            (onto && oneOne ? ' That makes it a **bijection**.' : '')))));
      } else {
        const tooMany = offenders.filter((a) => S.filter(([x]) => x === a).length > 1);
        const none = offenders.filter((a) => S.filter(([x]) => x === a).length === 0);
        verdict.appendChild(h('div.verdict.verdict--bad', null,
          h('div.verdict__head', null, '✗ Not a function'),
          h('div.verdict__body.small', null, renderInline(
            [tooMany.length ? `**${tooMany.join(', ')}** ${tooMany.length > 1 ? 'have' : 'has'} more than one image.` : '',
             none.length ? `**${none.join(', ')}** ${none.length > 1 ? 'have' : 'has'} no image at all.` : ''
            ].filter(Boolean).join(' ')))));
      }
      info.appendChild(verdict);
    }

    /* ---------------- challenges ---------------- */

    function renderTask() {
      clear(taskBox);
      if (!task) {
        taskBox.className = 'callout callout--tip';
        taskBox.appendChild(h('div.callout__label', null, 'Free play'));
        taskBox.appendChild(h('div.small', null, 'Toggle any cells and watch the four views agree.'));
        return;
      }
      taskBox.className = 'callout callout--jee';
      taskBox.appendChild(h('div.callout__label', null, `Challenge ${solved + 1} / ${CHALLENGES.length}`));
      taskBox.appendChild(h('div.small', null, renderInline(task.text)));
    }

    function checkTask() {
      if (!task || settled) return;
      const S = pairs();
      if (!S.length || !task.test(S)) return;

      settled = true;
      solved++;
      score += 25;
      cab.setScore(score);
      sfx.levelUp();
      ctx.fx?.burstAt(taskBox, { count: 20 });

      clear(taskBox);
      taskBox.className = 'callout callout--tip';
      taskBox.appendChild(h('div.callout__label', null, '✓ Built it'));
      taskBox.appendChild(h('div.small', null, renderInline(task.note)));
      taskBox.appendChild(h('div.btnbar', { style: { marginTop: '10px' } },
        btn(queue.length ? 'Next challenge' : 'Finish', next, { kind: 'primary' })));
    }

    function next() {
      settled = false;
      cells = new Set();
      if (!queue.length) { task = null; finish(); }
      else task = queue.shift();
      renderTask(); renderGrid(); renderInfo(); view.redraw();
    }

    function finish() {
      const best = Math.max(ctx.best ?? 0, score);
      cab.setBest(best);
      ctx.report(score, { best, solved });
      cab.setHint('All challenges done — free play is open.');
    }

    function start() {
      cab.clearOverlay();
      queue = shuffle(CHALLENGES);
      cells = new Set(); score = 0; solved = 0; settled = false;
      cab.setScore(0);
      task = queue.shift();
      renderTask(); renderGrid(); renderInfo(); view.redraw();
    }

    start();
    return { destroy() { view.stop(); } };
  }
};
