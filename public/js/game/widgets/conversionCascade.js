/**
 * Conversion Cascade - route a quantity from one unit system to another by
 * picking the right multiplier at each stage.
 *
 * Teaches: the factor-label method, and specifically that a squared or cubed
 * unit raises its conversion factor to the same power.
 */

import { h, clear } from '../../core/dom.js';
import { renderInline, renderMath } from '../../core/mathlite.js';
import { sfx } from '../../core/audio.js';
import { arcade, btn, cleared, shuffle, sci, sup } from '../kit.js';

/**
 * Each puzzle is a chain of stages. At every stage the learner picks the
 * correct multiplier; distractors are the classic errors (reciprocal, forgot
 * to raise to the power, off by a factor of ten).
 */
const PUZZLES = [
  {
    from: '72 km h⁻¹', to: 'm s⁻¹', start: 72, answer: 20,
    stages: [
      { label: 'km → m', right: 1000, wrong: [0.001, 100, 10] },
      { label: 'h → s', right: 1 / 3600, wrong: [3600, 1 / 60, 1 / 24] }
    ],
    lesson: 'Multiply km h⁻¹ by 5/18 to get m s⁻¹.'
  },
  {
    from: '1 N', to: 'dyne', start: 1, answer: 1e5,
    stages: [
      { label: 'kg → g', right: 1000, wrong: [0.001, 100, 1e6] },
      { label: 'm → cm', right: 100, wrong: [0.01, 1000, 10] }
    ],
    lesson: 'Force is kg·m·s⁻², so both mass and length convert once each: 10³ × 10² = 10⁵.'
  },
  {
    from: '1 J', to: 'erg', start: 1, answer: 1e7,
    stages: [
      { label: 'kg → g', right: 1000, wrong: [0.001, 100, 1e6] },
      { label: 'm² → cm²', right: 10000, wrong: [100, 1e6, 0.0001] }
    ],
    lesson: 'Energy carries m², so the length factor is squared: (10²)² = 10⁴.'
  },
  {
    from: '8 g cm⁻³', to: 'kg m⁻³', start: 8, answer: 8000,
    stages: [
      { label: 'g → kg', right: 0.001, wrong: [1000, 0.01, 1] },
      { label: 'cm⁻³ → m⁻³', right: 1e6, wrong: [100, 1000, 1e-6] }
    ],
    lesson: 'Water is 1 g cm⁻³ = 1000 kg m⁻³. Use it as your anchor.'
  },
  {
    from: '1 Pa', to: 'dyne cm⁻²', start: 1, answer: 10,
    stages: [
      { label: 'N → dyne', right: 1e5, wrong: [1e-5, 1000, 100] },
      { label: 'm⁻² → cm⁻²', right: 1e-4, wrong: [1e4, 0.01, 100] }
    ],
    lesson: '10⁵ × 10⁻⁴ = 10. One pascal is ten baryes.'
  },
  {
    from: '6.67×10⁻¹¹ N m² kg⁻²', to: 'dyne cm² g⁻²', start: 6.67e-11, answer: 6.67e-8,
    stages: [
      { label: 'N → dyne', right: 1e5, wrong: [1e-5, 1e3, 1e7] },
      { label: 'm² → cm²', right: 1e4, wrong: [1e2, 1e6, 1e-4] },
      { label: 'kg⁻² → g⁻²', right: 1e-6, wrong: [1e6, 1e-3, 1e3] }
    ],
    lesson: 'G has dimensions M⁻¹L³T⁻², so mass appears with a negative power — its factor inverts.'
  },
  {
    from: '72 dyne cm⁻¹', to: 'N m⁻¹', start: 72, answer: 0.072,
    stages: [
      { label: 'dyne → N', right: 1e-5, wrong: [1e5, 1e-3, 1e-2] },
      { label: 'cm⁻¹ → m⁻¹', right: 100, wrong: [0.01, 1000, 10] }
    ],
    lesson: 'Surface tension of water: 72 dyne cm⁻¹ = 0.072 N m⁻¹.'
  }
];

const fmtFactor = (f) => {
  if (f === 1) return '× 1';
  const exp = Math.log10(f);
  if (Number.isInteger(exp) && Math.abs(exp) >= 2) return `× 10${sup(exp)}`;
  if (f < 1 && Number.isInteger(1 / f)) return `÷ ${1 / f}`;
  return `× ${f}`;
};

export default {
  id: 'conversionCascade',

  mount(root, ctx) {
    const cab = arcade(root, {
      title: 'Conversion Cascade',
      badge: 'Factor-label chain',
      hint: 'Pick the multiplier that cancels the unwanted unit.',
      best: ctx.best ?? null,
      onRestart: start
    });

    const board = h('div.arcade__panel');
    cab.stage.appendChild(board);

    let queue = [], puzzle = null, stageIdx = 0, running = 0, score = 0, lives = 3, done = 0;

    function start() {
      cab.clearOverlay();
      queue = shuffle(PUZZLES);
      score = 0; lives = 3; done = 0;
      cab.setScore(0);
      next();
    }

    function next() {
      if (!queue.length || lives <= 0) return finish();
      puzzle = queue.shift();
      stageIdx = 0;
      running = puzzle.start;
      render();
    }

    function render() {
      clear(board);

      board.appendChild(h('div.spread', { style: { marginBottom: '14px' } },
        h('div', null,
          h('div.tiny.dim', null, 'CONVERT'),
          h('div', { style: { fontSize: '1.15rem', fontWeight: '700' } }, puzzle.from),
          h('div.small.muted', null, '↓ to ↓'),
          h('div', { style: { fontSize: '1.15rem', fontWeight: '700', color: 'var(--hue, var(--primary))' } }, puzzle.to)
        ),
        h('div.playerhp', null, [0, 1, 2].map((i) =>
          h('i', { dataset: { lost: String(i >= lives) } }, '❤️')))
      ));

      // The running value so far.
      const chain = h('div.readouts', { style: { marginBottom: '14px' } },
        h('div.readout', null,
          h('div.readout__v.mono', null, sci(running, 4)),
          h('div.readout__k', null, 'current value')),
        h('div.readout', null,
          h('div.readout__v', null, `${stageIdx} / ${puzzle.stages.length}`),
          h('div.readout__k', null, 'stages cleared'))
      );
      board.appendChild(chain);

      if (stageIdx >= puzzle.stages.length) return void settle();

      const stage = puzzle.stages[stageIdx];
      board.appendChild(h('div', { style: { marginBottom: '10px' } },
        h('span.tag', null, `Stage ${stageIdx + 1}`),
        h('span', { style: { marginLeft: '10px', fontWeight: '650' } }, stage.label)
      ));

      const opts = shuffle([stage.right, ...stage.wrong]);
      const row = h('div.tiles');
      for (const f of opts) {
        row.appendChild(h('button.tile.mono', {
          onClick: (e) => choose(f, stage.right, e.currentTarget)
        }, fmtFactor(f)));
      }
      board.appendChild(row);
    }

    function choose(f, right, el) {
      if (f === right) {
        running *= f;
        stageIdx++;
        score += 12;
        cab.setScore(score);
        sfx.correct();
        el.style.background = 'var(--ok)';
        setTimeout(render, 320);
      } else {
        lives--;
        score = Math.max(0, score - 6);
        cab.setScore(score);
        sfx.wrong();
        el.classList.add('shake');
        el.style.background = 'var(--bad-dim)';
        cab.setHint(wrongWhy(f, right));
        setTimeout(() => {
          el.classList.remove('shake');
          el.style.background = '';
          if (lives <= 0) finish(); else render();
        }, 700);
      }
    }

    function wrongWhy(chosen, right) {
      if (Math.abs(chosen * right - 1) < 1e-9) return 'That is the **reciprocal** — you converted the wrong way.';
      if (right > 1 && chosen > 1 && Math.abs(Math.log10(right) - 2 * Math.log10(chosen)) < 1e-9) {
        return 'Close — but the unit is **squared**, so the factor must be squared too.';
      }
      return 'Check which unit that stage is cancelling, and what power it carries.';
    }

    function settle() {
      done++;
      const ok = Math.abs(running - puzzle.answer) / Math.abs(puzzle.answer) < 1e-6;
      score += ok ? 25 : 0;
      cab.setScore(score);
      if (ok) { sfx.levelUp(); ctx.fx?.burstAt(board, { count: 26 }); }

      board.appendChild(h('div', { style: { marginTop: '14px' } },
        h('div.verdict.verdict--ok', null,
          h('div.verdict__head', null, '✓ Chain complete'),
          h('div.verdict__body', null,
            h('p', null, renderInline(`**${puzzle.from} = ${sci(running, 4)} ${puzzle.to}**`)),
            h('p.small', null, renderInline(puzzle.lesson))
          )),
        h('div.btnbar', { style: { marginTop: '12px' } },
          btn(queue.length ? 'Next conversion' : 'Finish', next, { kind: 'primary' }))
      ));
    }

    function finish() {
      const best = Math.max(ctx.best ?? 0, score);
      cab.setBest(best);
      ctx.report(score, { best, chains: done });
      cab.overlay(lives <= 0
        ? h('div', null,
            h('div', { style: { fontSize: '2.2rem' } }, '💥'),
            h('h3', null, 'Cascade broke'),
            h('p.muted', null, 'Three wrong factors. In 1999 that lost NASA a Mars orbiter.'),
            h('div.btnbar', { style: { justifyContent: 'center', marginTop: '12px' } },
              btn('Try again', start, { kind: 'primary' })))
        : cleared(score, best, start, h('p.small.muted', null, `${done} conversions routed.`)));
    }

    start();
    return { destroy() {} };
  }
};
