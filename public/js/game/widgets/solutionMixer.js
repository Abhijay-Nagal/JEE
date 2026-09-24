/**
 * Solution Bench - four concentration measures, one beaker.
 *
 * Molarity, molality, mole fraction and mass percent are shown side by side on
 * the same solution. Heating the beaker then changes exactly one of them,
 * which makes the temperature-dependence point without a word of explanation.
 *
 * Teaches: the definitions, dilution, and why analytical work prefers molality.
 */

import { h, clear } from '../../core/dom.js';
import { renderInline, renderMath } from '../../core/mathlite.js';
import { sfx } from '../../core/audio.js';
import { arcade, slider, readouts, btn, cleared, round, clamp } from '../kit.js';

const SOLUTES = [
  { name: 'NaCl',   M: 58.5 },
  { name: 'NaOH',   M: 40 },
  { name: 'glucose', M: 180 },
  { name: 'H₂SO₄', M: 98 },
  { name: 'KNO₃', M: 101 }
];

const TASKS = [
  {
    text: 'Make a **0.2 M** solution using NaCl.',
    check: (s) => s.solute.name === 'NaCl' && Math.abs(s.molarity - 0.2) < 0.008,
    note: 'Molarity uses the volume of the **whole solution**, not the volume of solvent you started with.'
  },
  {
    text: 'Make a solution whose **molality is 0.4 mol kg⁻¹**.',
    check: (s) => Math.abs(s.molality - 0.4) < 0.016,
    note: 'Molality uses the mass of **solvent alone**. No volume appears anywhere in the definition — which is why it is immune to temperature.'
  },
  {
    text: 'Make a solution in which the solute **mole fraction is 0.10**.',
    check: (s) => Math.abs(s.xSolute - 0.10) < 0.005,
    note: 'Mole fraction compares particle counts, so both components must be converted to moles first.'
  },
  {
    text: 'Now **heat the solution to 80 °C** and find which readout changes.',
    check: (s) => s.temp >= 75,
    note: 'Only **molarity** moved. The liquid expanded, so the same moles now sit in a larger volume. Mass-based measures did not budge — mass does not care how hot it is.'
  }
];

export default {
  id: 'solutionMixer',

  mount(root, ctx) {
    const cab = arcade(root, {
      title: 'Solution Bench',
      badge: 'Concentration',
      hint: 'Watch which readouts move when you change each control.',
      best: ctx.best ?? null,
      onRestart: start
    });

    const st = { soluteIdx: 0, mass: 5.85, solvent: 250, temp: 25 };
    let score = 0, taskIdx = 0, cleared_ = [];

    /* ---------------- beaker ---------------- */
    const wrap = h('div', { style: { display: 'grid', gridTemplateColumns: 'minmax(0,180px) minmax(0,1fr)', gap: '18px', padding: '16px' } });
    cab.stage.appendChild(wrap);

    const fluid = h('div.beaker__fluid', { style: { height: '40%' } });
    const beaker = h('div', null,
      h('div.beaker', null, fluid),
      h('div.tiny.dim', { style: { textAlign: 'center', marginTop: '8px' } }, 'solution')
    );
    const side = h('div');
    wrap.appendChild(beaker);
    wrap.appendChild(side);

    /* ---------------- readouts ---------------- */
    const out = readouts([
      { key: 'M', label: 'molarity (mol L⁻¹)', value: '—' },
      { key: 'm', label: 'molality (mol kg⁻¹)', value: '—' },
      { key: 'x', label: 'mole fraction (solute)', value: '—' },
      { key: 'w', label: 'mass % (w/w)', value: '—' },
      { key: 'ppm', label: 'ppm', value: '—' },
      { key: 'V', label: 'solution volume (mL)', value: '—' }
    ]);
    side.appendChild(out.root);

    const taskBox = h('div.callout.callout--jee', { style: { margin: '14px 0 0' } });
    side.appendChild(taskBox);

    /* ---------------- controls ---------------- */
    const controls = h('div', { style: { display: 'grid', gap: '14px', marginTop: '14px' } });
    cab.panel.appendChild(controls);

    const soluteSel = h('select.select', {
      onChange: (e) => { st.soluteIdx = Number(e.target.value); refresh(); }
    }, SOLUTES.map((s, i) => h('option', { value: i }, `${s.name}  (M = ${s.M})`)));

    const massS = slider({
      label: 'Mass of solute', min: 0.5, max: 60, step: 0.05, value: st.mass, unit: ' g',
      fmt: (v) => v.toFixed(2), onInput: (v) => { st.mass = v; refresh(); }
    });
    const solventS = slider({
      label: 'Mass of water (solvent)', min: 50, max: 1000, step: 5, value: st.solvent, unit: ' g',
      fmt: (v) => v.toFixed(0), onInput: (v) => { st.solvent = v; refresh(); }
    });
    const tempS = slider({
      label: 'Temperature', min: 10, max: 90, step: 1, value: st.temp, unit: ' °C',
      fmt: (v) => v.toFixed(0), onInput: (v) => { st.temp = v; refresh(); }
    });

    controls.appendChild(h('div.field', null, h('label', null, 'Solute'), soluteSel));
    controls.appendChild(h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '16px' } },
      massS.root, solventS.root, tempS.root));
    controls.appendChild(h('div.btnbar', null,
      btn('Dilute ×2 (add water)', () => { st.solvent = clamp(st.solvent * 2, 50, 1000); solventS.set(st.solvent); refresh(); sfx.pop(); }),
      btn('Reset', () => { st.mass = 5.85; st.solvent = 250; st.temp = 25; st.soluteIdx = 0; soluteSel.value = '0'; massS.set(st.mass); solventS.set(st.solvent); tempS.set(st.temp); refresh(); }, { kind: 'ghost' })
    ));

    /* ---------------- the chemistry ---------------- */

    function computed() {
      const solute = SOLUTES[st.soluteIdx];
      const nSolute = st.mass / solute.M;
      const nWater = st.solvent / 18;
      const massSolution = st.mass + st.solvent;

      // Water density falls with temperature; the solution volume follows.
      // Quadratic fit good enough over 10-90 C (1.0 g/mL at 4 C, 0.9718 at 90 C).
      const rhoWater = 1.0000 - 5.0e-6 * (st.temp - 4) ** 2 * 1.0;
      const rho = clamp(rhoWater + 0.0007 * (st.mass / massSolution) * 100, 0.90, 1.30);
      const volumeL = massSolution / rho / 1000;

      return {
        solute,
        nSolute, nWater, massSolution, rho, temp: st.temp,
        volumeL,
        molarity: nSolute / volumeL,
        molality: nSolute / (st.solvent / 1000),
        xSolute: nSolute / (nSolute + nWater),
        wPct: (st.mass / massSolution) * 100,
        ppm: (st.mass / massSolution) * 1e6
      };
    }

    let prev = null;

    function refresh() {
      const s = computed();

      const moved = (key, val) => prev && Math.abs(prev[key] - val) > Math.abs(val) * 1e-4;

      out.set('M', s.molarity.toFixed(4), moved('molarity', s.molarity) ? 'ok' : null);
      out.set('m', s.molality.toFixed(4));
      out.set('x', s.xSolute.toFixed(4));
      out.set('w', s.wPct.toFixed(2) + '%');
      out.set('ppm', Math.round(s.ppm).toLocaleString());
      out.set('V', (s.volumeL * 1000).toFixed(1));

      fluid.style.height = clamp(18 + (s.volumeL * 1000) / 1100 * 70, 12, 92) + '%';
      fluid.style.filter = `hue-rotate(${clamp(s.wPct * 3, 0, 120)}deg)`;

      cab.setHint(
        `${round(s.nSolute, 4)} mol of ${s.solute.name} in ${st.solvent} g of water → ${(s.volumeL * 1000).toFixed(0)} mL of solution at ${st.temp}°C (density ${s.rho.toFixed(3)} g mL⁻¹).`
      );

      prev = { molarity: s.molarity, molality: s.molality };
      checkTask(s);
    }

    /* ---------------- tasks ---------------- */

    function renderTask() {
      clear(taskBox);
      if (taskIdx >= TASKS.length) {
        taskBox.className = 'callout callout--tip';
        taskBox.appendChild(h('div.callout__label', null, '✓ Bench complete'));
        taskBox.appendChild(h('div.small', null, renderInline(
          'Free play. Try the conversion: take 1 L of solution, work out the solvent mass, and check that $m = \\frac{1000M}{1000\\rho - M M_{\\text{solute}}}$ really does hold.')));
        return;
      }
      taskBox.className = 'callout callout--jee';
      taskBox.appendChild(h('div.callout__label', null, `Task ${taskIdx + 1} / ${TASKS.length}`));
      taskBox.appendChild(h('div.small', null, renderInline(TASKS[taskIdx].text)));
    }

    let settling = false;
    function checkTask(s) {
      if (settling || taskIdx >= TASKS.length) return;
      const t = TASKS[taskIdx];
      if (!t.check(s)) return;

      settling = true;
      score += 25;
      cab.setScore(score);
      sfx.levelUp();
      ctx.fx?.burstAt(taskBox, { count: 20 });
      cleared_.push(taskIdx);

      clear(taskBox);
      taskBox.className = 'callout callout--tip';
      taskBox.appendChild(h('div.callout__label', null, '✓ Task complete'));
      taskBox.appendChild(h('div.small', null, renderInline(t.note)));
      taskBox.appendChild(h('div.btnbar', { style: { marginTop: '10px' } },
        btn('Next task', () => {
          taskIdx++; settling = false; renderTask();
          if (taskIdx >= TASKS.length) finish();
        }, { kind: 'primary' })));
    }

    function finish() {
      const best = Math.max(ctx.best ?? 0, score);
      cab.setBest(best);
      ctx.report(score, { best, tasks: cleared_.length });
    }

    function start() {
      cab.clearOverlay();
      score = 0; taskIdx = 0; cleared_ = []; settling = false;
      cab.setScore(0);
      st.mass = 5.85; st.solvent = 250; st.temp = 25; st.soluteIdx = 0;
      soluteSel.value = '0';
      massS.set(st.mass); solventS.set(st.solvent); tempS.set(st.temp);
      renderTask();
      refresh();
    }

    start();
    return { destroy() {} };
  }
};
