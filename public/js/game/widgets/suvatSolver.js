/**
 * SUVAT Console - practise *choosing* the equation, not just using it.
 *
 * Each round states a problem, and the learner must first identify which of
 * the five quantities is absent before the numeric answer is even accepted.
 * That ordering is the point: picking the equation is the skill, and doing
 * the arithmetic is not.
 */

import { h, clear } from '../../core/dom.js';
import { renderInline, renderMath } from '../../core/mathlite.js';
import { sfx } from '../../core/audio.js';
import { arcade, btn, cleared, shuffle, round } from '../kit.js';

const EQUATIONS = {
  s: { tex: 'v = u + at', omits: 's', name: 'first' },
  v: { tex: 's = ut + \\tfrac{1}{2}at^2', omits: 'v', name: 'second' },
  t: { tex: 'v^2 = u^2 + 2as', omits: 't', name: 'third' },
  a: { tex: 's = \\left(\\tfrac{u+v}{2}\\right)t', omits: 'a', name: 'average-velocity' }
};

const SYMBOLS = [
  { key: 'u', label: 'u  initial velocity' },
  { key: 'v', label: 'v  final velocity' },
  { key: 'a', label: 'a  acceleration' },
  { key: 't', label: 't  time' },
  { key: 's', label: 's  displacement' }
];

/** Every problem states three quantities and asks for a fourth. */
const PROBLEMS = [
  {
    text: 'A car accelerates from $10\\ \\text{m s}^{-1}$ at $3\\ \\text{m s}^{-2}$ for $4$ s. Find its final velocity.',
    given: { u: 10, a: 3, t: 4 }, want: 'v', missing: 's', answer: 22, unit: 'm s⁻¹'
  },
  {
    text: 'A body starts from rest and accelerates at $2\\ \\text{m s}^{-2}$ for $6$ s. Find the distance covered.',
    given: { u: 0, a: 2, t: 6 }, want: 's', missing: 'v', answer: 36, unit: 'm'
  },
  {
    text: 'A train braking at $2\\ \\text{m s}^{-2}$ slows from $30\\ \\text{m s}^{-1}$ to rest. Find the distance travelled.',
    given: { u: 30, v: 0, a: -2 }, want: 's', missing: 't', answer: 225, unit: 'm'
  },
  {
    text: 'A body covers $100$ m while accelerating uniformly from $5\\ \\text{m s}^{-1}$ to $15\\ \\text{m s}^{-1}$. Find the time taken.',
    given: { u: 5, v: 15, s: 100 }, want: 't', missing: 'a', answer: 10, unit: 's'
  },
  {
    text: 'A stone dropped from rest reaches $40\\ \\text{m s}^{-1}$. Taking $g = 10\\ \\text{m s}^{-2}$, find the height fallen.',
    given: { u: 0, v: 40, a: 10 }, want: 's', missing: 't', answer: 80, unit: 'm'
  },
  {
    text: 'A cyclist slows from $12\\ \\text{m s}^{-1}$ to $4\\ \\text{m s}^{-1}$ in $4$ s. Find the acceleration.',
    given: { u: 12, v: 4, t: 4 }, want: 'a', missing: 's', answer: -2, unit: 'm s⁻²'
  },
  {
    text: 'A body accelerating at $4\\ \\text{m s}^{-2}$ from rest covers a distance in which it reaches $20\\ \\text{m s}^{-1}$. Find the time taken.',
    given: { u: 0, v: 20, a: 4 }, want: 't', missing: 's', answer: 5, unit: 's'
  }
];

export default {
  id: 'suvatSolver',

  mount(root, ctx) {
    const cab = arcade(root, {
      title: 'SUVAT Console',
      badge: 'Pick the equation',
      hint: 'Find the quantity that is neither given nor wanted. That names your equation.',
      best: ctx.best ?? null,
      onRestart: start
    });

    let queue = [], p = null, phase = 'pick', score = 0, solved = 0, slips = 0;

    const board = h('div', { style: { padding: '16px' } });
    cab.stage.appendChild(board);

    function render() {
      clear(board);

      board.appendChild(h('div', { style: { marginBottom: '14px' } },
        h('div.tiny.dim', null, `PROBLEM ${solved + 1} OF ${Math.min(5, PROBLEMS.length)}`),
        h('div', { style: { fontSize: '1.02rem' } }, renderInline(p.text))));

      /* ---- the five slots ---- */
      const grid = h('div', {
        style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(104px,1fr))', gap: '8px', marginBottom: '16px' }
      });
      for (const sym of SYMBOLS) {
        const given = p.given[sym.key] !== undefined;
        const wanted = p.want === sym.key;
        const state = given ? 'given' : wanted ? 'want' : 'absent';
        const revealed = phase !== 'pick';

        grid.appendChild(h('div', {
          style: {
            padding: '10px 8px', borderRadius: 'var(--r-sm)', textAlign: 'center',
            border: '1px solid ' + (state === 'given' ? 'var(--ok)' : state === 'want' ? 'var(--accent)' : 'var(--line)'),
            background: state === 'given' ? 'var(--ok-dim)'
              : state === 'want' ? 'var(--warn-dim)'
              : (revealed ? 'var(--bad-dim)' : 'var(--bg-2)')
          }
        },
          h('div.mono', { style: { fontSize: '1.1rem', fontWeight: '800' } }, sym.key),
          h('div.tiny.dim', null, given ? String(p.given[sym.key]) : wanted ? 'find this' : (revealed ? 'absent' : '?'))
        ));
      }
      board.appendChild(grid);

      if (phase === 'pick') return renderPick();
      if (phase === 'solve') return renderSolve();
      renderDone();
    }

    /* ---- phase 1: which quantity is missing? ---- */
    function renderPick() {
      board.appendChild(h('div.callout.callout--jee', { style: { margin: '0 0 12px' } },
        h('div.callout__label', null, 'Step 1'),
        h('div.small', null, 'Which quantity is **neither given nor asked for**?')));

      const row = h('div.tiles');
      for (const sym of SYMBOLS) {
        row.appendChild(h('button.tile.mono', {
          style: { fontSize: '1rem', padding: '10px 16px' },
          onClick: () => pick(sym.key)
        }, sym.key));
      }
      board.appendChild(row);
    }

    function pick(key) {
      if (key !== p.missing) {
        slips++;
        score = Math.max(0, score - 5);
        cab.setScore(score);
        sfx.wrong();
        const why = p.given[key] !== undefined
          ? `**${key}** is given in the problem — look for the one that is not mentioned at all.`
          : key === p.want
            ? `**${key}** is what you are being asked for. The missing one is a *fourth* quantity.`
            : 'Not that one — check each of the five in turn.';
        cab.setHint(why);
        return;
      }
      score += 15;
      cab.setScore(score);
      sfx.correct();
      phase = 'solve';
      cab.setHint('');
      render();
    }

    /* ---- phase 2: the number ---- */
    function renderSolve() {
      const eq = EQUATIONS[p.missing];
      board.appendChild(h('div.verdict.verdict--ok', { style: { marginBottom: '12px' } },
        h('div.verdict__head', null, `✓ ${p.missing} is missing — use the ${eq.name} equation`),
        h('div.verdict__body', null, renderMath(eq.tex, { display: true }))));

      const input = h('input.input.mono', {
        type: 'text', inputmode: 'decimal', placeholder: `value in ${p.unit}`,
        style: { maxWidth: '200px' },
        onKeyDown: (e) => { if (e.key === 'Enter') solve(input.value); }
      });
      board.appendChild(h('div.row', { style: { gap: '10px', flexWrap: 'wrap' } },
        input,
        h('span.muted', null, p.unit),
        btn('Check', () => solve(input.value), { kind: 'primary', size: 'md' })));
      setTimeout(() => input.focus(), 40);
    }

    function solve(raw) {
      const val = Number(String(raw).trim());
      const ok = Number.isFinite(val) && Math.abs(val - p.answer) <= Math.max(0.05, Math.abs(p.answer) * 0.02);
      if (!ok) {
        slips++;
        score = Math.max(0, score - 4);
        cab.setScore(score);
        sfx.wrong();
        cab.setHint('Substitute carefully — and mind the sign of the acceleration.');
        return;
      }
      solved++;
      score += Math.max(10, 30 - slips * 5);
      cab.setScore(score);
      sfx.levelUp();
      ctx.fx?.burstAt(board, { count: 20 });
      phase = 'done';
      render();
    }

    function renderDone() {
      const eq = EQUATIONS[p.missing];
      board.appendChild(h('div.verdict.verdict--ok', null,
        h('div.verdict__head', null, `✓ ${p.answer} ${p.unit}`),
        h('div.verdict__body.small', null,
          renderMath(eq.tex, { display: true }),
          h('p', { style: { marginBottom: 0 } }, renderInline(
            `Given ${Object.entries(p.given).map(([k, v]) => `$${k} = ${v}$`).join(', ')}, and **${p.missing}** never appears.`)))));

      board.appendChild(h('div.btnbar', { style: { marginTop: '12px' } },
        btn(solved >= 5 || !queue.length ? 'Finish' : 'Next problem', next, { kind: 'primary', size: 'md' })));
    }

    function next() {
      if (solved >= 5 || !queue.length) return finish();
      p = queue.shift();
      phase = 'pick'; slips = 0;
      cab.setHint('Find the quantity that is neither given nor wanted.');
      render();
    }

    function finish() {
      const best = Math.max(ctx.best ?? 0, score);
      cab.setBest(best);
      ctx.report(score, { best, solved });
      cab.overlay(cleared(score, best, start,
        h('p.small.muted', null, `${solved} problems, each solved by elimination first.`)));
    }

    function start() {
      cab.clearOverlay();
      queue = shuffle(PROBLEMS);
      score = 0; solved = 0;
      cab.setScore(0);
      next();
    }

    start();
    return { destroy() {} };
  }
};
