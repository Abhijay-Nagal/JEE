/**
 * Set Builder - translate set-builder notation into a roster by clicking.
 *
 * The universe is on screen as a grid of numbers. The learner clicks the ones
 * that satisfy the predicate; the roster form assembles live underneath.
 *
 * Teaches: reading set-builder notation fluently, and the boundary cases
 * (does 0 count? is -3 in range? is 1 prime?) that quietly cost marks.
 */

import { h, clear } from '../../core/dom.js';
import { renderInline, renderMath } from '../../core/mathlite.js';
import { sfx } from '../../core/audio.js';
import { arcade, btn, cleared, shuffle } from '../kit.js';

const isPrime = (n) => {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
  return true;
};

const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

const TASKS = [
  {
    tex: 'A = \\{x \\in \\mathbb{N} : x \\leq 12,\\ x \\text{ is prime}\\}',
    universe: range(0, 15),
    test: (x) => x >= 1 && x <= 12 && isPrime(x),
    trap: 'Careful with 1 — it is **not** prime, because a prime must have exactly two distinct factors.'
  },
  {
    tex: 'B = \\{x \\in \\mathbb{Z} : x^2 \\leq 9\\}',
    universe: range(-5, 5),
    test: (x) => x * x <= 9,
    trap: 'The negatives count too: $(-3)^2 = 9 \\leq 9$. Dropping them is the classic slip.'
  },
  {
    tex: 'C = \\{x \\in \\mathbb{W} : x < 5\\}',
    universe: range(-3, 8),
    test: (x) => x >= 0 && x < 5,
    trap: '$\\mathbb{W}$ is the **whole** numbers, so 0 is included but negatives are not. And $x<5$ excludes 5 itself.'
  },
  {
    tex: 'D = \\{x \\in \\mathbb{N} : x \\text{ divides } 24\\}',
    universe: range(1, 25),
    test: (x) => 24 % x === 0,
    trap: 'Do not forget 1 and 24 — every number divides itself, and 1 divides everything.'
  },
  {
    tex: 'E = \\{x \\in \\mathbb{Z} : -2 \\leq x < 4\\}',
    universe: range(-5, 6),
    test: (x) => x >= -2 && x < 4,
    trap: 'One endpoint is included and the other is not. $[-2, 4)$ contains $-2$ but not $4$.'
  },
  {
    tex: 'F = \\{x \\in \\mathbb{N} : x = n^2,\\ n \\in \\mathbb{N},\\ x < 30\\}',
    universe: range(1, 30),
    test: (x) => Number.isInteger(Math.sqrt(x)) && x < 30,
    trap: 'Perfect squares below 30: 1, 4, 9, 16, 25. Note that 1 is a perfect square.'
  },
  {
    tex: 'G = \\{x \\in \\mathbb{Z} : |x| > 3 \\text{ and } |x| \\leq 6\\}',
    universe: range(-8, 8),
    test: (x) => Math.abs(x) > 3 && Math.abs(x) <= 6,
    trap: 'A modulus condition always produces **two** intervals, one on each side of zero.'
  }
];

export default {
  id: 'setBuilder',

  mount(root, ctx) {
    const cab = arcade(root, {
      title: 'Set Builder',
      badge: 'Notation drill',
      hint: 'Click every element that satisfies the condition. Then submit.',
      best: ctx.best ?? null,
      onRestart: start
    });

    let queue = [], task = null, chosen = new Set(), score = 0, solved = 0, checked = false;

    const board = h('div', { style: { padding: '16px' } });
    cab.stage.appendChild(board);

    function render() {
      clear(board);
      checked = false;

      board.appendChild(h('div', { style: { textAlign: 'center', marginBottom: '6px' } },
        h('div.tiny.dim', null, 'WRITE THIS SET IN ROSTER FORM'),
        renderMath(task.tex, { display: true })
      ));

      const grid = h('div', {
        style: {
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fit, minmax(48px, 1fr))`,
          gap: '8px', margin: '14px 0'
        }
      });

      for (const n of task.universe) {
        const cell = h('button.tile.mono', {
          dataset: { n: String(n) },
          style: { justifyContent: 'center', textAlign: 'center', fontSize: '.95rem', padding: '10px 4px' },
          onClick: () => toggle(n, cell)
        }, String(n));
        if (chosen.has(n)) paint(cell, 'on');
        grid.appendChild(cell);
      }
      board.appendChild(grid);

      board.appendChild(h('div', { style: { textAlign: 'center', minHeight: '32px', marginBottom: '10px' } },
        h('span.tiny.dim', null, 'YOUR SET  '),
        h('span.mono', { style: { fontSize: '1rem' } }, roster())
      ));

      board.appendChild(h('div.btnbar', { style: { justifyContent: 'center' } },
        btn('Submit set', check, { kind: 'primary', size: 'md' }),
        btn('Clear', () => { chosen.clear(); render(); }, { kind: 'ghost' })
      ));
    }

    const roster = () => chosen.size
      ? '{ ' + [...chosen].sort((a, b) => a - b).join(', ') + ' }'
      : '∅  (the empty set)';

    function paint(cell, state) {
      cell.style.background = state === 'on' ? 'var(--hue, var(--primary))' : '';
      cell.style.color = state === 'on' ? 'var(--primary-ink)' : '';
      cell.style.borderColor = state === 'on' ? 'transparent' : '';
    }

    function toggle(n, cell) {
      if (checked) return;
      if (chosen.has(n)) { chosen.delete(n); paint(cell, 'off'); }
      else { chosen.add(n); paint(cell, 'on'); }
      sfx.tick();
      render();
    }

    function check() {
      if (checked) return;
      checked = true;
      const want = new Set(task.universe.filter(task.test));
      const missing = [...want].filter((x) => !chosen.has(x));
      const extra = [...chosen].filter((x) => !want.has(x));
      const ok = !missing.length && !extra.length;

      // Colour every cell to show the truth.
      board.querySelectorAll('.tile').forEach((cell) => {
        const n = Number(cell.dataset.n);
        const inWant = want.has(n), inGot = chosen.has(n);
        cell.style.pointerEvents = 'none';
        if (inWant && inGot) { cell.style.background = 'var(--ok)'; cell.style.color = '#04231a'; }
        else if (inWant && !inGot) { cell.style.borderColor = 'var(--ok)'; cell.style.borderStyle = 'dashed'; cell.style.color = 'var(--ok)'; }
        else if (!inWant && inGot) { cell.style.background = 'var(--bad)'; cell.style.color = '#fff'; }
      });

      if (ok) {
        solved++;
        score += 30;
        cab.setScore(score);
        sfx.levelUp();
        ctx.fx?.burstAt(board, { count: 24 });
      } else {
        score = Math.max(0, score - 6);
        cab.setScore(score);
        sfx.wrong();
      }

      const detail = [];
      if (missing.length) detail.push(`You missed **${missing.sort((a, b) => a - b).join(', ')}**.`);
      if (extra.length) detail.push(`**${extra.sort((a, b) => a - b).join(', ')}** should not be there.`);

      board.appendChild(h('div', { style: { marginTop: '14px' } },
        h('div.verdict' + (ok ? '.verdict--ok' : '.verdict--bad'), null,
          h('div.verdict__head', null, ok ? '✓ Exactly right' : '✗ Not quite'),
          h('div.verdict__body.small', null,
            h('p', null, renderInline(`Correct roster: **{ ${[...want].sort((a, b) => a - b).join(', ') || '∅'} }**`)),
            detail.length ? h('p', null, renderInline(detail.join(' '))) : null,
            h('p', { style: { marginBottom: 0 } }, renderInline(task.trap))
          )),
        h('div.btnbar', { style: { marginTop: '12px', justifyContent: 'center' } },
          btn(queue.length ? 'Next set' : 'Finish', next, { kind: 'primary', size: 'md' }))
      ));
    }

    function next() {
      if (!queue.length) return finish();
      task = queue.shift();
      chosen = new Set();
      cab.setHint('Click every element that satisfies the condition. Then submit.');
      render();
    }

    function finish() {
      const best = Math.max(ctx.best ?? 0, score);
      cab.setBest(best);
      ctx.report(score, { best, solved });
      cab.overlay(cleared(score, best, start, h('p.small.muted', null, `${solved} of 5 sets built exactly.`)));
    }

    function start() {
      cab.clearOverlay();
      queue = shuffle(TASKS).slice(0, 5);
      score = 0; solved = 0;
      cab.setScore(0);
      next();
    }

    start();
    return { destroy() {} };
  }
};
