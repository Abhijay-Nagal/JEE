/**
 * The Weighing Room - rediscover the laws of chemical combination.
 *
 * Three benches, each reproducing a historical experiment. Nothing is stated
 * up front: the learner runs trials, the data table fills, and the law is only
 * revealed once the pattern is on screen in their own numbers.
 *
 * Teaches: conservation of mass, definite proportions, multiple proportions -
 * and the habit of looking for a ratio.
 */

import { h, clear } from '../../core/dom.js';
import { renderInline, renderMath } from '../../core/mathlite.js';
import { sfx } from '../../core/audio.js';
import { arcade, canvasLayer, cssVar, c2d, slider, btn, seg, cleared, round } from '../kit.js';

export default {
  id: 'lawLab',

  mount(root, ctx) {
    const cab = arcade(root, {
      title: 'The Weighing Room',
      badge: '1789 — 1803',
      hint: 'Run trials. Watch the numbers before you read the law.',
      best: ctx.best ?? null,
      onRestart: start
    });

    let bench = 'conserve';
    let trials = { conserve: [], definite: [], multiple: [] };
    let score = 0, revealed = new Set();
    let anim = { t: 0, reacting: false };

    /* ---------------- flask animation ---------------- */
    const stageTop = h('div', { style: { padding: '10px 14px 0' } });
    cab.stage.appendChild(stageTop);

    const view = canvasLayer(stageTop, {
      height: 170,
      animate: true,
      draw(g, w, hgt, t) {
        const hue = cssVar('--hue') || cssVar('--chemistry');
        const line = cssVar('--line');
        const cx = w / 2, base = hgt - 34;

        // balance pan + stand
        c2d.roundRect(g, cx - 90, base, 180, 8, 4); g.fillStyle = line; g.fill();
        c2d.line(g, cx, base + 8, cx, hgt - 8, { color: line, width: 5 });

        // sealed flask
        g.save();
        g.strokeStyle = cssVar('--ink-4'); g.lineWidth = 2.5;
        g.beginPath();
        g.moveTo(cx - 12, base - 88);
        g.lineTo(cx - 12, base - 62);
        g.lineTo(cx - 44, base - 6);
        g.lineTo(cx + 44, base - 6);
        g.lineTo(cx + 12, base - 62);
        g.lineTo(cx + 12, base - 88);
        g.closePath();
        g.stroke();
        g.clip();

        // contents
        const fill = anim.reacting ? 0.55 + Math.sin(t * 8) * 0.04 : 0.5;
        g.fillStyle = anim.reacting ? cssVar('--accent') : hue;
        g.globalAlpha = 0.55;
        g.fillRect(cx - 50, base - 6 - 52 * fill, 100, 52 * fill + 6);
        g.globalAlpha = 1;

        // bubbles while reacting
        if (anim.reacting) {
          for (let i = 0; i < 14; i++) {
            const ph = (t * 1.6 + i * 0.37) % 1;
            g.globalAlpha = 0.5 * (1 - ph);
            g.fillStyle = '#fff';
            g.beginPath();
            g.arc(cx - 34 + (i * 7) % 68, base - 8 - ph * 60, 2 + (i % 3), 0, Math.PI * 2);
            g.fill();
          }
          g.globalAlpha = 1;
        }
        g.restore();

        // stopper
        g.fillStyle = cssVar('--ink-4');
        c2d.roundRect(g, cx - 16, base - 96, 32, 12, 4); g.fill();
        c2d.text(g, 'SEALED', cx, base - 104, { size: 9, weight: 800, color: cssVar('--ink-4') });

        // digital balance readout
        const mass = currentMass();
        g.fillStyle = cssVar('--bg-0');
        c2d.roundRect(g, cx - 72, hgt - 30, 144, 24, 6); g.fill();
        g.strokeStyle = line; g.stroke();
        c2d.text(g, mass.toFixed(2) + ' g', cx, hgt - 18, {
          size: 15, weight: 800, font: 'mono', color: anim.reacting ? cssVar('--accent') : cssVar('--ok')
        });
      }
    });

    function currentMass() {
      if (bench === 'conserve') return sA.get() + sB.get();
      if (bench === 'definite') return Math.min(sH.get(), sO.get() / 8) * 9;
      return sC.get() + Math.min(sO2.get(), sC.get() * (mode === 'CO' ? 16 / 12 : 32 / 12));
    }

    /* ---------------- controls ---------------- */

    const panel = cab.panel;
    const benchBox = h('div');
    const tableBox = h('div', { style: { marginTop: '14px' } });
    const lawBox = h('div', { style: { marginTop: '14px' } });

    panel.appendChild(h('div.row', { style: { marginBottom: '14px', flexWrap: 'wrap' } },
      seg([
        { value: 'conserve', label: 'Conservation' },
        { value: 'definite', label: 'Definite proportions' },
        { value: 'multiple', label: 'Multiple proportions' }
      ], bench, (v) => { bench = v; renderBench(); })
    ));
    panel.appendChild(benchBox);
    panel.appendChild(tableBox);
    panel.appendChild(lawBox);

    // Sliders are created once and reused so their values persist per bench.
    const sA = slider({ label: 'Mass of lead nitrate', min: 1, max: 20, step: 0.5, value: 8, unit: ' g', fmt: (v) => v.toFixed(1), onInput: () => view.redraw() });
    const sB = slider({ label: 'Mass of potassium iodide', min: 1, max: 20, step: 0.5, value: 6, unit: ' g', fmt: (v) => v.toFixed(1), onInput: () => view.redraw() });
    const sH = slider({ label: 'Hydrogen supplied', min: 1, max: 12, step: 0.5, value: 4, unit: ' g', fmt: (v) => v.toFixed(1), onInput: () => view.redraw() });
    const sO = slider({ label: 'Oxygen supplied', min: 4, max: 80, step: 2, value: 32, unit: ' g', fmt: (v) => v.toFixed(0), onInput: () => view.redraw() });
    const sC = slider({ label: 'Carbon burnt', min: 6, max: 36, step: 6, value: 12, unit: ' g', fmt: (v) => v.toFixed(0), onInput: () => view.redraw() });
    const sO2 = slider({ label: 'Oxygen available', min: 8, max: 96, step: 8, value: 32, unit: ' g', fmt: (v) => v.toFixed(0), onInput: () => view.redraw() });
    let mode = 'CO2';

    function renderBench() {
      clear(benchBox); clear(lawBox);
      anim.reacting = false;

      if (bench === 'conserve') {
        benchBox.appendChild(h('p.small.muted', null, renderInline(
          'Lavoisier’s experiment. Two solutions are mixed in a **sealed** flask; a bright yellow solid crashes out. Weigh before, weigh after.')));
        benchBox.appendChild(grid(sA.root, sB.root));
      } else if (bench === 'definite') {
        benchBox.appendChild(h('p.small.muted', null, renderInline(
          'Proust’s experiment. Combine hydrogen and oxygen to make water and weigh what you get. Vary the amounts as wildly as you like.')));
        benchBox.appendChild(grid(sH.root, sO.root));
      } else {
        benchBox.appendChild(h('p.small.muted', null, renderInline(
          'Dalton’s experiment. Burn carbon in plenty of oxygen or in a restricted supply, and compare the oxides.')));
        benchBox.appendChild(grid(sC.root, sO2.root));
        benchBox.appendChild(h('div.row', { style: { marginTop: '10px' } },
          h('span.small.muted', null, 'Oxygen supply:'),
          seg([{ value: 'CO2', label: 'Plentiful → CO₂' }, { value: 'CO', label: 'Restricted → CO' }], mode, (v) => { mode = v; view.redraw(); }))
        );
      }

      benchBox.appendChild(h('div.btnbar', { style: { marginTop: '14px' } },
        btn('Run the reaction', run, { kind: 'primary', size: 'md' }),
        btn('Clear data', () => { trials[bench] = []; renderTable(); clear(lawBox); })
      ));

      view.redraw();
      renderTable();
    }

    const grid = (...kids) => h('div', {
      style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '16px' }
    }, kids);

    /* ---------------- running a trial ---------------- */

    function run() {
      anim.reacting = true;
      sfx.whoosh();
      setTimeout(() => {
        anim.reacting = false;
        record();
        sfx.pop();
      }, 1100);
    }

    function record() {
      if (bench === 'conserve') {
        const a = sA.get(), b = sB.get();
        trials.conserve.push({ before: a + b, after: a + b, a, b });
      } else if (bench === 'definite') {
        const hIn = sH.get(), oIn = sO.get();
        // Water is H : O = 1 : 8 by mass; whichever runs out first limits.
        const hUsed = Math.min(hIn, oIn / 8);
        const oUsed = hUsed * 8;
        trials.definite.push({
          hIn, oIn, hUsed: round(hUsed, 2), oUsed: round(oUsed, 2),
          water: round(hUsed + oUsed, 2),
          ratio: round(oUsed / hUsed, 2),
          leftover: hIn - hUsed > 0.01 ? `${round(hIn - hUsed, 2)} g H₂` : (oIn - oUsed > 0.01 ? `${round(oIn - oUsed, 2)} g O₂` : 'none')
        });
      } else {
        const c = sC.get();
        const need = mode === 'CO' ? c * (16 / 12) : c * (32 / 12);
        const oUsed = Math.min(sO2.get(), need);
        const cUsed = oUsed / (mode === 'CO' ? 16 / 12 : 32 / 12);
        trials.multiple.push({
          oxide: mode, c: round(cUsed, 1), o: round(oUsed, 1),
          per12: round((oUsed / cUsed) * 12, 1)
        });
      }
      renderTable();
      checkLaw();
    }

    /* ---------------- data table ---------------- */

    function renderTable() {
      clear(tableBox);
      const rows = trials[bench];
      if (!rows.length) {
        tableBox.appendChild(h('div.empty.small', null, 'No trials yet. Run the reaction.'));
        return;
      }

      const spec = {
        conserve: {
          head: ['#', 'Reactant A (g)', 'Reactant B (g)', 'Mass before (g)', 'Mass after (g)'],
          row: (r, i) => [i + 1, r.a.toFixed(1), r.b.toFixed(1), r.before.toFixed(2), r.after.toFixed(2)]
        },
        definite: {
          head: ['#', 'H in (g)', 'O in (g)', 'Water (g)', 'O : H used', 'Left over'],
          row: (r, i) => [i + 1, r.hIn.toFixed(1), r.oIn.toFixed(0), r.water.toFixed(2), `${r.ratio.toFixed(2)} : 1`, r.leftover]
        },
        multiple: {
          head: ['#', 'Oxide', 'C used (g)', 'O used (g)', 'O per 12 g C'],
          row: (r, i) => [i + 1, r.oxide === 'CO' ? 'CO' : 'CO₂', r.c.toFixed(1), r.o.toFixed(1), r.per12.toFixed(1)]
        }
      }[bench];

      const table = h('table.deftable', null,
        h('thead', null, h('tr', null, spec.head.map((x) => h('th', null, x)))),
        h('tbody', null, rows.map((r, i) => h('tr', null, spec.row(r, i).map((c) => h('td', null, String(c))))))
      );
      tableBox.appendChild(h('div.table-wrap', null, table));
    }

    /* ---------------- law detection ---------------- */

    function checkLaw() {
      const rows = trials[bench];
      if (rows.length < 3 || revealed.has(bench)) return;

      if (bench === 'definite') {
        // Only reveal once the learner has used genuinely different inputs.
        const distinct = new Set(rows.map((r) => `${r.hIn}:${r.oIn}`)).size;
        if (distinct < 3) return;
      }
      if (bench === 'multiple') {
        const kinds = new Set(rows.map((r) => r.oxide));
        if (kinds.size < 2) {
          cab.setHint('Run the other oxide too — the law is about *comparing* two compounds.');
          return;
        }
      }

      revealed.add(bench);
      score += 35;
      cab.setScore(score);
      sfx.levelUp();
      ctx.fx?.burstAt(tableBox, { count: 26 });

      const copy = {
        conserve: {
          name: 'Law of Conservation of Mass',
          body: 'Every trial gives the same mass before and after. Matter is not created or destroyed — the atoms are only rearranged. This is why we balance equations.',
          tex: '\\sum m_{\\text{reactants}} = \\sum m_{\\text{products}}'
        },
        definite: {
          name: 'Law of Definite Proportions',
          body: 'However much you supplied, the oxygen-to-hydrogen ratio in the water that formed is always **8 : 1** by mass. The surplus simply sat there unreacted. A compound has a fixed composition regardless of how it was made.',
          tex: '\\text{H} : \\text{O} = 1 : 8 \\text{ by mass, always}'
        },
        multiple: {
          name: 'Law of Multiple Proportions',
          body: 'Fix the carbon at 12 g. CO takes 16 g of oxygen; CO₂ takes 32 g. The ratio is **1 : 2** — a simple whole number. Dalton saw those whole numbers and concluded that matter must come in discrete units.',
          tex: '16 : 32 = 1 : 2'
        }
      }[bench];

      clear(lawBox);
      lawBox.appendChild(h('div.verdict.verdict--ok', null,
        h('div.verdict__head', null, `🏆 ${copy.name}`),
        h('div.verdict__body', null,
          h('p', null, renderInline(copy.body)),
          renderMath(copy.tex, { display: true }))
      ));

      if (revealed.size === 3) finish();
      else cab.setHint(`${revealed.size} of 3 laws rediscovered. Try another bench.`);
    }

    function finish() {
      const best = Math.max(ctx.best ?? 0, score);
      cab.setBest(best);
      ctx.report(score, { best, laws: revealed.size });
      cab.overlay(cleared(score, best, start,
        h('p.small.muted', null, 'All three laws found from your own data.')));
    }

    function start() {
      cab.clearOverlay();
      trials = { conserve: [], definite: [], multiple: [] };
      revealed = new Set();
      score = 0;
      cab.setScore(0);
      bench = 'conserve';
      renderBench();
    }

    renderBench();
    return { destroy() { view.stop(); } };
  }
};
