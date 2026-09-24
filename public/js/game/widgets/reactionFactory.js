/**
 * Reaction Factory - find the bottleneck on a production line.
 *
 * Reactants are drawn as physical stacks. Running a batch visibly consumes
 * them in the stoichiometric ratio, so the moment one stack empties while
 * another is still full, the idea of a limiting reagent is on screen rather
 * than in a formula.
 *
 * Teaches: mole ratios, the divide-by-coefficient test, excess reagent and
 * percentage yield.
 */

import { h, clear } from '../../core/dom.js';
import { renderInline, renderMath } from '../../core/mathlite.js';
import { sfx } from '../../core/audio.js';
import { arcade, canvasLayer, cssVar, c2d, btn, cleared, shuffle, round } from '../kit.js';

const REACTIONS = [
  {
    tex: '\\text{N}_2 + 3\\text{H}_2 \\longrightarrow 2\\text{NH}_3',
    reactants: [{ sym: 'N₂', coef: 1, M: 28, colour: '--info' }, { sym: 'H₂', coef: 3, M: 2, colour: '--physics' }],
    product: { sym: 'NH₃', coef: 2, M: 17 },
    supply: [{ mol: 8 }, { mol: 18 }],
    story: 'The Haber process. Fix nitrogen from the air and half the world eats.'
  },
  {
    tex: '\\text{CH}_4 + 2\\text{O}_2 \\longrightarrow \\text{CO}_2 + 2\\text{H}_2\\text{O}',
    reactants: [{ sym: 'CH₄', coef: 1, M: 16, colour: '--chemistry' }, { sym: 'O₂', coef: 2, M: 32, colour: '--physics' }],
    product: { sym: 'CO₂', coef: 1, M: 44 },
    supply: [{ mol: 6 }, { mol: 9 }],
    story: 'Burning methane. Starve it of oxygen and you get carbon monoxide instead — which is why ventilation matters.'
  },
  {
    tex: '2\\text{Al} + 3\\text{Cl}_2 \\longrightarrow 2\\text{AlCl}_3',
    reactants: [{ sym: 'Al', coef: 2, M: 27, colour: '--maths' }, { sym: 'Cl₂', coef: 3, M: 71, colour: '--chemistry' }],
    product: { sym: 'AlCl₃', coef: 2, M: 133.5 },
    supply: [{ mol: 10 }, { mol: 12 }],
    story: 'Both coefficients exceed 1, so neither "fewer moles" nor "smaller mass" is a reliable guide. Only the division works.'
  },
  {
    tex: '\\text{Zn} + 2\\text{HCl} \\longrightarrow \\text{ZnCl}_2 + \\text{H}_2',
    reactants: [{ sym: 'Zn', coef: 1, M: 65, colour: '--info' }, { sym: 'HCl', coef: 2, M: 36.5, colour: '--warn' }],
    product: { sym: 'H₂', coef: 1, M: 2 },
    supply: [{ mol: 7 }, { mol: 10 }],
    story: 'The school hydrogen generator. Add more zinc once the acid is gone and nothing happens at all.'
  }
];

export default {
  id: 'reactionFactory',

  mount(root, ctx) {
    const cab = arcade(root, {
      title: 'Reaction Factory',
      badge: 'Limiting reagent',
      hint: 'Run batches until something runs out. Then predict, before you check.',
      best: ctx.best ?? null,
      onRestart: start
    });

    let queue = [], rx = null, have = [], made = 0, score = 0, solved = 0, phase = 'run';

    const stageBox = h('div', { style: { padding: '12px 12px 0' } });
    cab.stage.appendChild(stageBox);

    /* ---------------- the stacks ---------------- */

    const view = canvasLayer(stageBox, {
      height: 190,
      draw(g, w, hgt) {
        if (!rx) return;
        const cols = rx.reactants.length + 1;
        const slot = w / cols;

        rx.reactants.forEach((r, i) => {
          drawStack(g, slot * (i + 0.5), hgt, have[i], rx.supply[i].mol, r.sym, cssVar(r.colour), `×${r.coef} per batch`);
        });
        drawStack(g, slot * (cols - 0.5), hgt, made, maxBatches() * rx.product.coef, rx.product.sym, cssVar('--ok'), 'product');

        // arrow between last reactant and product
        const ax = slot * (cols - 1);
        c2d.arrow(g, ax - 14, hgt / 2, ax + 14, hgt / 2, { color: cssVar('--ink-4'), width: 2, head: 7 });
      }
    });

    function drawStack(g, cx, hgt, count, cap, label, colour, sub) {
      const boxW = 42, boxH = 11, gap = 3;
      const shown = Math.min(count, 14);
      const baseY = hgt - 40;

      // outline of the original supply
      const capShown = Math.min(cap, 14);
      g.strokeStyle = cssVar('--line-soft');
      g.lineWidth = 1;
      for (let i = 0; i < capShown; i++) {
        c2d.roundRect(g, cx - boxW / 2, baseY - i * (boxH + gap), boxW, boxH, 3);
        g.stroke();
      }

      g.fillStyle = colour;
      for (let i = 0; i < shown; i++) {
        c2d.roundRect(g, cx - boxW / 2, baseY - i * (boxH + gap), boxW, boxH, 3);
        g.fill();
      }

      c2d.text(g, label, cx, hgt - 22, { size: 13, weight: 800, color: cssVar('--ink-1') });
      c2d.text(g, `${round(count, 2)} mol`, cx, hgt - 8, { size: 11, weight: 700, font: 'mono', color: colour });
      if (sub) c2d.text(g, sub, cx, 14, { size: 9, weight: 700, color: cssVar('--ink-4') });
      if (count === 0 && cap > 0) {
        c2d.text(g, 'EMPTY', cx, baseY - 40, { size: 11, weight: 900, color: cssVar('--bad') });
      }
    }

    const maxBatches = () => Math.min(...rx.reactants.map((r, i) => rx.supply[i].mol / r.coef));
    const limitingIdx = () => {
      const q = rx.reactants.map((r, i) => rx.supply[i].mol / r.coef);
      return q.indexOf(Math.min(...q));
    };

    /* ---------------- panel ---------------- */

    const panel = cab.panel;

    function render() {
      clear(panel);

      panel.appendChild(h('div', { style: { textAlign: 'center', marginBottom: '10px' } },
        renderMath(rx.tex, { display: true })));

      if (phase === 'run') {
        panel.appendChild(h('p.small.muted', null, renderInline(
          'Run batches one at a time, or all at once. Watch which stack empties first.')));
        panel.appendChild(h('div.btnbar', { style: { justifyContent: 'center' } },
          btn('Run 1 batch', () => runBatches(1), { kind: 'primary' }),
          btn('Run until something runs out', () => runBatches(Infinity)),
          btn('Reset stacks', reset, { kind: 'ghost' })
        ));
      } else if (phase === 'ask-limiting') {
        panel.appendChild(h('div.callout.callout--jee', { style: { margin: '0 0 12px' } },
          h('div.callout__label', null, 'Question 1'),
          h('div.small', null, 'Which reagent limited the reaction?')));
        const row = h('div.tiles', { style: { justifyContent: 'center' } });
        rx.reactants.forEach((r, i) => {
          row.appendChild(h('button.tile', { onClick: () => answerLimiting(i) }, r.sym));
        });
        panel.appendChild(row);
      } else if (phase === 'ask-mass') {
        const grams = round(made * rx.product.M, 2);
        panel.appendChild(h('div.callout.callout--jee', { style: { margin: '0 0 12px' } },
          h('div.callout__label', null, 'Question 2'),
          h('div.small', null, renderInline(
            `${round(made, 3)} mol of ${rx.product.sym} was produced. What is that in **grams**? ($M = ${rx.product.M}$ g mol⁻¹)`))));
        const input = h('input.input.mono', {
          type: 'text', inputmode: 'decimal', placeholder: 'grams', style: { maxWidth: '170px' },
          onKeyDown: (e) => { if (e.key === 'Enter') answerMass(input.value, grams); }
        });
        panel.appendChild(h('div.row', { style: { gap: '10px', flexWrap: 'wrap' } },
          input, btn('Check', () => answerMass(input.value, grams), { kind: 'primary', size: 'md' })));
      }
    }

    /* ---------------- actions ---------------- */

    function runBatches(n) {
      const possible = Math.min(...rx.reactants.map((r, i) => have[i] / r.coef));
      const doable = Math.min(n, possible);
      if (doable <= 1e-9) {
        sfx.wrong();
        cab.setHint('Nothing happens — one reagent is completely used up. That is the **limiting reagent**.');
        phase = 'ask-limiting';
        render();
        return;
      }
      const step = n === Infinity ? doable : Math.min(1, doable);
      rx.reactants.forEach((r, i) => { have[i] = round(have[i] - r.coef * step, 4); });
      made = round(made + rx.product.coef * step, 4);
      sfx.drop();
      view.redraw();

      const empty = have.findIndex((v) => v <= 1e-9);
      if (empty !== -1) {
        sfx.timeout();
        cab.setHint(`**${rx.reactants[empty].sym}** has run out while ${have.map((v, i) => v > 1e-9 ? `${round(v, 2)} mol of ${rx.reactants[i].sym}` : null).filter(Boolean).join(' and ') || 'nothing'} remains.`);
        phase = 'ask-limiting';
      }
      render();
    }

    function answerLimiting(i) {
      const want = limitingIdx();
      if (i === want) {
        score += 25;
        cab.setScore(score);
        sfx.correct();
        phase = 'ask-mass';
        cab.setHint(`Correct. Divide moles by coefficient: ${rx.reactants.map((r, j) => `${rx.reactants[j].sym} → ${round(rx.supply[j].mol / r.coef, 2)}`).join(', ')}. The smallest wins.`);
      } else {
        score = Math.max(0, score - 8);
        cab.setScore(score);
        sfx.wrong();
        cab.setHint('Not that one. Do not compare raw moles — **divide each by its stoichiometric coefficient** first.');
      }
      render();
    }

    function answerMass(raw, want) {
      const v = Number(String(raw).trim());
      const ok = Number.isFinite(v) && Math.abs(v - want) <= Math.max(0.05, want * 0.02);
      if (ok) {
        solved++;
        score += 30;
        cab.setScore(score);
        sfx.levelUp();
        ctx.fx?.burstAt(panel, { count: 26 });
        showSummary(want);
      } else {
        score = Math.max(0, score - 6);
        cab.setScore(score);
        sfx.wrong();
        cab.setHint(`Multiply moles by molar mass: ${round(made, 3)} × ${rx.product.M}.`);
      }
    }

    function showSummary(grams) {
      clear(panel);
      const li = limitingIdx();
      const leftovers = rx.reactants
        .map((r, i) => ({ r, left: round(rx.supply[i].mol - maxBatches() * r.coef, 3) }))
        .filter((x) => x.left > 1e-6);

      panel.appendChild(h('div.verdict.verdict--ok', null,
        h('div.verdict__head', null, '✓ Batch analysis complete'),
        h('div.verdict__body', null,
          h('ul.small', null,
            h('li', null, renderInline(`Limiting reagent: **${rx.reactants[li].sym}**`)),
            h('li', null, renderInline(`Batches possible: **${round(maxBatches(), 3)}**`)),
            h('li', null, renderInline(`Product: **${round(made, 3)} mol = ${grams} g of ${rx.product.sym}**`)),
            leftovers.length
              ? h('li', null, renderInline(`Left unreacted: ${leftovers.map((x) => `**${x.left} mol of ${x.r.sym}**`).join(', ')} — excess reagent, and pure waste.`))
              : h('li', null, 'Nothing left over — the reagents were mixed in exactly the stoichiometric ratio.')
          ),
          h('p.small', null, renderInline(rx.story))
        )));

      panel.appendChild(h('div.btnbar', { style: { marginTop: '12px' } },
        btn(queue.length ? 'Next reaction' : 'Finish', next, { kind: 'primary', size: 'md' })));
    }

    function reset() {
      have = rx.reactants.map((r, i) => rx.supply[i].mol);
      made = 0;
      phase = 'run';
      view.redraw();
      render();
    }

    function next() {
      if (!queue.length) return finish();
      rx = queue.shift();
      reset();
      cab.setHint('Run batches until something runs out. Then predict, before you check.');
    }

    function finish() {
      const best = Math.max(ctx.best ?? 0, score);
      cab.setBest(best);
      ctx.report(score, { best, solved });
      cab.overlay(cleared(score, best, start, h('p.small.muted', null, `${solved} production runs analysed.`)));
    }

    function start() {
      cab.clearOverlay();
      queue = shuffle(REACTIONS).slice(0, 3);
      score = 0; solved = 0;
      cab.setScore(0);
      next();
    }

    start();
    return { destroy() { view.stop(); } };
  }
};
