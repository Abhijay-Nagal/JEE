/**
 * Formula Detective - combustion analysis, step by step.
 *
 * An unknown organic compound is burnt; the learner is given the sample mass
 * and the masses of CO2 and H2O trapped, and must reconstruct the formula.
 * Each stage must be correct before the next unlocks, so a wrong turn is
 * caught immediately rather than propagating to the end.
 *
 * Teaches: mass of C from CO2, mass of H from H2O, oxygen by difference, and
 * the empirical -> molecular step.
 */

import { h, clear } from '../../core/dom.js';
import { renderInline, renderMath } from '../../core/mathlite.js';
import { sfx } from '../../core/audio.js';
import { arcade, btn, cleared, shuffle, round } from '../kit.js';

/** Each case is generated from a real compound so the numbers come out clean. */
const CASES = [
  { name: 'acetic acid',   f: 'C_2H_4O_2', C: 2, H: 4, O: 2, M: 60,  sample: 0.60, emp: 'CH_2O',    empM: 30 },
  { name: 'glucose',       f: 'C_6H_{12}O_6', C: 6, H: 12, O: 6, M: 180, sample: 0.90, emp: 'CH_2O', empM: 30 },
  { name: 'ethanol',       f: 'C_2H_6O',  C: 2, H: 6, O: 1, M: 46,  sample: 0.92, emp: 'C_2H_6O',  empM: 46 },
  { name: 'benzene',       f: 'C_6H_6',   C: 6, H: 6, O: 0, M: 78,  sample: 0.78, emp: 'CH',       empM: 13 },
  { name: 'formaldehyde',  f: 'CH_2O',    C: 1, H: 2, O: 1, M: 30,  sample: 0.60, emp: 'CH_2O',    empM: 30 },
  { name: 'methanol',      f: 'CH_4O',    C: 1, H: 4, O: 1, M: 32,  sample: 0.64, emp: 'CH_4O',    empM: 32 }
];

const AM = { C: 12, H: 1, O: 16 };

export default {
  id: 'formulaDetective',

  mount(root, ctx) {
    const cab = arcade(root, {
      title: 'Formula Detective',
      badge: 'Combustion analysis',
      hint: 'All the carbon ends up in CO₂; all the hydrogen in H₂O. Oxygen is whatever is left.',
      best: ctx.best ?? null,
      onRestart: start
    });

    let queue = [], k = null, stage = 0, score = 0, solved = 0, slips = 0;

    const board = h('div', { style: { padding: '16px' } });
    cab.stage.appendChild(board);

    /* ---------------- case setup ---------------- */

    function prepare(c) {
      const moles = c.sample / c.M;                 // mol of compound
      return {
        ...c,
        mCO2: round(moles * c.C * 44, 3),
        mH2O: round(moles * (c.H / 2) * 18, 3),
        massC: round(moles * c.C * 12, 3),
        massH: round(moles * c.H * 1, 3),
        massO: round(moles * c.O * 16, 3),
        molC: round(moles * c.C, 4),
        molH: round(moles * c.H, 4),
        molO: round(moles * c.O, 4),
        n: c.M / c.empM
      };
    }

    /* ---------------- stages ---------------- */

    const STAGES = [
      {
        prompt: () => `A ${k.sample.toFixed(2)} g sample burns completely, producing **${k.mCO2.toFixed(3)} g of CO₂**. What mass of **carbon** (g) did the sample contain?`,
        tex: 'm_{\\text{C}} = \\dfrac{12}{44} \\times m_{\\text{CO}_2}',
        answer: () => k.massC,
        why: () => `Every carbon atom in the sample ends up in one CO₂. Carbon is $\\frac{12}{44}$ of CO₂ by mass, so $\\frac{12}{44}\\times${k.mCO2.toFixed(3)} = ${k.massC.toFixed(3)}$ g.`,
        hint: 'Carbon is 12 of the 44 mass units in CO₂.'
      },
      {
        prompt: () => `The same combustion produced **${k.mH2O.toFixed(3)} g of H₂O**. What mass of **hydrogen** (g) was in the sample?`,
        tex: 'm_{\\text{H}} = \\dfrac{2}{18} \\times m_{\\text{H}_2\\text{O}}',
        answer: () => k.massH,
        why: () => `Water is $\\frac{2}{18}$ hydrogen by mass (two H atoms of mass 1 in a molecule of mass 18), so $\\frac{2}{18}\\times${k.mH2O.toFixed(3)} = ${k.massH.toFixed(3)}$ g.`,
        hint: 'Both hydrogens in H₂O weigh 2 out of 18.'
      },
      {
        prompt: () => `The sample was ${k.sample.toFixed(2)} g in total. You found ${k.massC.toFixed(3)} g of C and ${k.massH.toFixed(3)} g of H. What mass of **oxygen** (g) does that leave?`,
        tex: 'm_{\\text{O}} = m_{\\text{sample}} - m_{\\text{C}} - m_{\\text{H}}',
        answer: () => k.massO,
        why: () => `Oxygen is always found **by difference** — you cannot measure it directly, because the combustion adds oxygen from the air. $${k.sample.toFixed(2)} - ${k.massC.toFixed(3)} - ${k.massH.toFixed(3)} = ${k.massO.toFixed(3)}$ g.`,
        hint: 'Subtract. Oxygen is never measured directly in this technique.'
      },
      {
        prompt: () => 'Divide each mass by its atomic mass, then divide all three by the smallest. What is the **carbon subscript** in the empirical formula?',
        tex: 'n_i = \\dfrac{m_i}{A_i}, \\quad \\text{then divide by the smallest}',
        answer: () => empSubscripts().C,
        why: () => {
          const s = empSubscripts();
          return `Moles: C $=\\frac{${k.massC.toFixed(3)}}{12} = ${k.molC}$, H $=\\frac{${k.massH.toFixed(3)}}{1} = ${k.molH}$${k.O ? `, O $=\\frac{${k.massO.toFixed(3)}}{16} = ${k.molO}$` : ''}. Dividing by the smallest gives the ratio **${s.C} : ${s.H}${k.O ? ` : ${s.O}` : ''}**, so the empirical formula is $\\text{${k.emp}}$.`;
        },
        hint: 'If a value comes out as 1.5 or 1.33, multiply everything by 2 or 3 — do not round it away.'
      },
      {
        kind: 'choice',
        prompt: () => `The empirical formula is $\\text{${k.emp}}$ (mass ${k.empM}). The compound’s molar mass is **${k.M} g mol⁻¹**. What is the molecular formula?`,
        tex: 'n = \\dfrac{M_{\\text{molecular}}}{M_{\\text{empirical}}}',
        options: () => shuffle([k.f, k.emp, doubleFormula(k.f), halveish(k.f)].filter((v, i, a) => a.indexOf(v) === i)),
        answer: () => k.f,
        why: () => `$n = \\frac{${k.M}}{${k.empM}} = ${k.n}$, so the molecular formula is ${k.n} × $\\text{${k.emp}}$ = $\\text{${k.f}}$ — **${k.name}**.`,
        hint: 'Divide the molar mass by the empirical formula mass.'
      }
    ];

    function empSubscripts() {
      const vals = { C: k.molC, H: k.molH, O: k.molO };
      const present = Object.entries(vals).filter(([, v]) => v > 1e-6);
      const min = Math.min(...present.map(([, v]) => v));
      let ratio = Object.fromEntries(present.map(([el, v]) => [el, v / min]));
      // Clear halves/thirds/quarters the way the procedure says to.
      for (const mult of [1, 2, 3, 4, 5]) {
        const scaled = Object.fromEntries(Object.entries(ratio).map(([el, v]) => [el, v * mult]));
        if (Object.values(scaled).every((v) => Math.abs(v - Math.round(v)) < 0.06)) {
          ratio = Object.fromEntries(Object.entries(scaled).map(([el, v]) => [el, Math.round(v)]));
          break;
        }
      }
      return { C: ratio.C ?? 0, H: ratio.H ?? 0, O: ratio.O ?? 0 };
    }

    const doubleFormula = (f) => f.replace(/([A-Z][a-z]?)(?:_\{?(\d+)\}?)?/g, (m, el, n) => `${el}_{${(Number(n) || 1) * 2}}`);
    const halveish = (f) => f.replace(/_\{?(\d+)\}?/g, (m, n) => `_{${Math.max(1, Math.round(Number(n) / 2))}}`);

    /* ---------------- rendering ---------------- */

    function render() {
      clear(board);
      const S = STAGES[stage];

      board.appendChild(h('div.spread', { style: { marginBottom: '12px' } },
        h('div', null,
          h('div.tiny.dim', null, `UNKNOWN SAMPLE · STEP ${stage + 1} OF ${STAGES.length}`),
          h('div.progressdots', { style: { marginTop: '6px' } },
            STAGES.map((_, i) => h('i', { class: i < stage ? 'ok' : i === stage ? 'cur' : '' })))),
        h('span.tag', null, `M = ${k.M} g mol⁻¹`)
      ));

      board.appendChild(h('p', null, renderInline(S.prompt())));
      board.appendChild(renderMath(S.tex, { display: true }));

      if (S.kind === 'choice') {
        const row = h('div.tiles');
        for (const opt of S.options()) {
          row.appendChild(h('button.tile', { onClick: () => grade(opt, S) }, renderMath(`\\text{${opt}}`)));
        }
        board.appendChild(row);
      } else {
        const input = h('input.input.mono', {
          type: 'text', inputmode: 'decimal', placeholder: 'value',
          style: { maxWidth: '180px' },
          onKeyDown: (e) => { if (e.key === 'Enter') grade(input.value, S); }
        });
        board.appendChild(h('div.row', { style: { flexWrap: 'wrap', gap: '10px' } },
          input,
          btn('Check', () => grade(input.value, S), { kind: 'primary', size: 'md' }),
          btn('Hint', () => cab.setHint(S.hint), { kind: 'ghost' })
        ));
        setTimeout(() => input.focus(), 30);
      }
    }

    function grade(given, S) {
      const want = S.answer();
      let ok;
      if (S.kind === 'choice') ok = given === want;
      else {
        const v = Number(String(given).trim());
        ok = Number.isFinite(v) && Math.abs(v - want) <= Math.max(0.006, Math.abs(want) * 0.03);
      }

      if (!ok) {
        slips++;
        score = Math.max(0, score - 4);
        cab.setScore(score);
        sfx.wrong();
        cab.setHint(S.hint);
        return;
      }

      score += 14;
      cab.setScore(score);
      sfx.correct();

      clear(board);
      board.appendChild(h('div.verdict.verdict--ok', null,
        h('div.verdict__head', null, '✓ Step ' + (stage + 1) + ' correct'),
        h('div.verdict__body.small', null, renderInline(S.why()))));

      const last = stage === STAGES.length - 1;
      board.appendChild(h('div.btnbar', { style: { marginTop: '12px' } },
        btn(last ? (queue.length ? 'Next sample' : 'Finish') : 'Continue', () => {
          if (last) { solved++; score += 20; cab.setScore(score); ctx.fx?.burstAt(board, { count: 24 }); next(); }
          else { stage++; render(); }
        }, { kind: 'primary', size: 'md' })));
    }

    function next() {
      if (!queue.length) return finish();
      k = prepare(queue.shift());
      stage = 0; slips = 0;
      cab.setHint('All the carbon ends up in CO₂; all the hydrogen in H₂O. Oxygen is whatever is left.');
      render();
    }

    function finish() {
      const best = Math.max(ctx.best ?? 0, score);
      cab.setBest(best);
      ctx.report(score, { best, solved });
      cab.overlay(cleared(score, best, start, h('p.small.muted', null, `${solved} compounds identified.`)));
    }

    function start() {
      cab.clearOverlay();
      queue = shuffle(CASES).slice(0, 3);
      score = 0; solved = 0;
      cab.setScore(0);
      next();
    }

    start();
    return { destroy() {} };
  }
};
