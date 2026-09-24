/**
 * Wavelength Bench - the same formula applied to an electron and to a cricket
 * ball, on one logarithmic scale.
 *
 * "Matter has a wavelength" sounds like it should change everyday life. Putting
 * the answer on a ruler that also carries the nucleus, the atom and a human
 * hair shows in one glance why it does not.
 */

import { h, clear } from '../../core/dom.js';
import { renderInline } from '../../core/mathlite.js';
import { sfx } from '../../core/audio.js';
import { arcade, canvasLayer, cssVar, c2d, slider, readouts, btn, seg,
         verdictLine, cleared, clamp, sci } from '../kit.js';

const H = 6.626e-34;
const ME = 9.1e-31;
const EVJ = 1.602e-19;

const OBJECTS = [
  { id: 'e',    name: 'Electron',    m: ME,     icon: 'e⁻' },
  { id: 'p',    name: 'Proton',      m: 1.67e-27, icon: 'p⁺' },
  { id: 'dust', name: 'Dust grain',  m: 1e-12,  icon: '·' },
  { id: 'ball', name: 'Cricket ball', m: 0.15,  icon: '●' }
];

/** Reference lengths for the ruler, in metres. */
const MARKS = [
  { m: 1e-15, label: 'nucleus' },
  { m: 1e-10, label: 'atom' },
  { m: 5e-7,  label: 'green light' },
  { m: 1e-4,  label: 'human hair' },
  { m: 1e-3,  label: '1 mm' }
];

const TASKS = [
  { text: 'With the **electron**, find a speed that gives a wavelength **longer than an atom** ($\\lambda > 10^{-10}$ m).',
    ok: (s) => s.obj === 'e' && s.lambda > 1e-10,
    note: 'A slow electron has a wavelength comparable to atomic spacing, which is exactly why it diffracts off a crystal. Davisson and Germer saw this in 1927 and confirmed de Broglie.' },
  { text: 'Switch to the **cricket ball** and find *any* speed whose wavelength beats the size of a nucleus ($10^{-15}$ m).',
    ok: () => false,
    impossible: true,
    note: 'There is none, and that is the answer. Even at $1\\ \\text{m s}^{-1}$ the ball gives $\\lambda \\approx 4\\times10^{-33}$ m — eighteen orders of magnitude below a nucleus. Matter waves are real for everything and observable for almost nothing.' },
  { text: 'Switch to **accelerating voltage** and find the voltage that gives an electron a wavelength of **1.00 Å**.',
    ok: (s) => s.mode === 'volt' && Math.abs(s.lambda - 1e-10) / 1e-10 < 0.04,
    note: '$\\lambda = \\dfrac{12.27}{\\sqrt{V}}$ Å, so $V = \\left(\\dfrac{12.27}{1.00}\\right)^2 \\approx 150$ V. That is why electron microscopes run at kilovolts: shorter wavelength, finer detail.' },
  { text: 'Back on **speed**. An electron at $10^{6}\\ \\text{m s}^{-1}$ has $\\lambda = 7.3\\times10^{-10}$ m. Give the **proton** that same wavelength.',
    ok: (s) => s.obj === 'p' && s.mode === 'speed' && Math.abs(s.lambda - 7.28e-10) / 7.28e-10 < 0.1,
    note: 'A proton is 1836 times heavier, so to match the electron it must travel 1836 times **slower** — about $545\\ \\text{m s}^{-1}$ against $10^{6}$. In $\\lambda = h/mv$ the mass dominates completely.' }
];

export default {
  id: 'deBroglieLab',

  mount(root, ctx) {
    const cab = arcade(root, {
      title: 'Wavelength Bench',
      badge: 'λ = h / mv',
      hint: 'Pick an object, set its speed, and read where its wavelength lands on the ruler.',
      best: ctx.best ?? null,
      onRestart: start
    });

    let obj = OBJECTS[0];
    let mode = 'speed';               // 'speed' | 'volt'
    let score = 0, taskIdx = 0, locked = false;

    const stageBox = h('div');
    cab.stage.appendChild(stageBox);

    /* ------------------------------------------------------------ */

    /** Slider reads 0..100; map it to a logarithmic speed 1e0 .. 1e8 m/s. */
    const speed = () => Math.pow(10, spd.get() / 12.5);
    /** Slider reads 0..100; map to 1 V .. 100 kV. */
    const volts = () => Math.pow(10, vlt.get() / 20);

    function lambda() {
      if (mode === 'volt') {
        // lambda = h / sqrt(2 m e V), for an electron
        return H / Math.sqrt(2 * ME * EVJ * volts());
      }
      return H / (obj.m * speed());
    }

    const snapshot = () => ({ obj: obj.id, mode, lambda: lambda(), v: speed(), V: volts() });

    /* ------------------------------------------------------------ */

    const view = canvasLayer(stageBox, {
      height: 230,
      animate: true,
      draw(g, w, hgt) {
        const hue = cssVar('--chemistry');
        const ink = cssVar('--ink-4');
        const lam = lambda();

        /* ---- the object, with its wave ---- */
        const cy = 56;
        const t = performance.now() / 1000;
        const showWave = lam > 1e-12;        // only the light ones get a visible wave
        g.save();
        g.strokeStyle = showWave ? hue : cssVar('--line');
        g.lineWidth = 2.2;
        g.beginPath();
        // the drawn wavelength shrinks as the real one does, bottoming out
        const px = clamp(6 + Math.log10(Math.max(lam, 1e-36) / 1e-36) * 2.4, 4, 62);
        for (let i = 0; i <= 200; i++) {
          const x = 28 + i * ((w - 56) / 200);
          const y = cy + Math.sin(((x - 28) / px) * Math.PI * 2 - t * 5) * 13;
          i ? g.lineTo(x, y) : g.moveTo(x, y);
        }
        g.stroke();
        g.restore();

        const bx = 28 + ((performance.now() / 22) % (w - 56));
        g.fillStyle = cssVar('--chart-1');
        g.beginPath(); g.arc(bx, cy, obj.id === 'ball' ? 9 : obj.id === 'dust' ? 6 : 4.5, 0, Math.PI * 2);
        g.fill();
        c2d.text(g, obj.name, 28, cy - 30, { size: 11, weight: 800, color: hue, align: 'left' });
        c2d.text(g, `m = ${sci(obj.m, 2)} kg`, 28, cy - 16,
          { size: 9, weight: 700, color: ink, align: 'left' });

        /* ---- the logarithmic ruler ---- */
        const ry = hgt - 66, rx0 = 34, rx1 = w - 34;
        const LO = -36, HI = -2;
        const X = (m) => rx0 + ((clamp(Math.log10(m), LO, HI) - LO) / (HI - LO)) * (rx1 - rx0);

        c2d.line(g, rx0, ry, rx1, ry, { color: cssVar('--chart-ink'), width: 1.6 });
        for (let e = LO; e <= HI; e += 2) {
          const x = X(Math.pow(10, e));
          c2d.line(g, x, ry, x, ry + 5, { color: cssVar('--line'), width: 1 });
          if (e % 6 === 0) {
            c2d.text(g, `10${supOf(e)}`, x, ry + 15, { size: 8, weight: 700, color: ink });
          }
        }
        c2d.text(g, 'wavelength / m', (rx0 + rx1) / 2, ry + 32,
          { size: 9, weight: 700, color: ink });

        for (const mk of MARKS) {
          const x = X(mk.m);
          c2d.line(g, x, ry - 26, x, ry, { color: cssVar('--line'), width: 1, dash: [2, 3] });
          g.save();
          g.translate(x, ry - 30); g.rotate(-Math.PI / 5);
          c2d.text(g, mk.label, 0, 0, { size: 9, weight: 700, color: ink, align: 'left' });
          g.restore();
        }

        /* ---- the pointer ---- */
        const mx = X(lam);
        const off = Math.log10(lam) < LO;
        c2d.arrow(g, mx, ry - 46, mx, ry - 4,
          { color: off ? cssVar('--bad') : cssVar('--ok'), width: 2.6, head: 8 });
        c2d.text(g, off ? `← ${sci(lam, 2)} m (off scale)` : `${sci(lam, 2)} m`,
          clamp(mx, rx0 + 44, rx1 - 44), ry - 54,
          { size: 11, weight: 800, color: off ? cssVar('--bad') : cssVar('--ok') });
      }
    });

    const SUPS = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴',
                   5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
    const supOf = (n) => String(n).split('').map((c) => SUPS[c] ?? c).join('');

    /* ------------------------------------------------------------ */

    const out = readouts([
      { key: 'm', label: 'mass (kg)', value: '—' },
      { key: 'v', label: 'speed / volts', value: '—' },
      { key: 'l', label: 'λ (m)', value: '—' },
      { key: 'a', label: 'λ (Å)', value: '—' }
    ]);

    function refresh() {
      const lam = lambda();
      out.set('m', sci(mode === 'volt' ? ME : obj.m, 2));
      out.set('v', mode === 'volt' ? `${sci(volts(), 3)} V` : `${sci(speed(), 3)} m/s`);
      out.set('l', sci(lam, 3));
      out.set('a', sci(lam * 1e10, 3), lam > 1e-11 ? 'ok' : null);
    }

    const spd = slider({
      label: 'Speed', min: 0, max: 100, step: 0.5, value: 87.5, unit: ' m s⁻¹',
      fmt: (x) => sci(Math.pow(10, x / 12.5), 2), onInput: refresh
    });

    const vlt = slider({
      label: 'Accelerating voltage', min: 0, max: 100, step: 0.5, value: 20, unit: ' V',
      fmt: (x) => sci(Math.pow(10, x / 20), 3), onInput: refresh
    });

    const taskBox = h('div.callout.callout--jee', { style: { margin: '0 0 12px' } });
    const controls = h('div');
    const verdict = h('div');
    cab.panel.appendChild(taskBox);
    cab.panel.appendChild(out.root);
    cab.panel.appendChild(controls);
    cab.panel.appendChild(verdict);

    function renderControls() {
      clear(controls);
      controls.appendChild(h('div.row', { style: { justifyContent: 'center', margin: '12px 0 4px' } },
        seg(OBJECTS.map((o) => ({ value: o.id, label: o.name })), obj.id, (v) => {
          obj = OBJECTS.find((o) => o.id === v);
          if (mode === 'volt' && obj.id !== 'e') { mode = 'speed'; renderControls(); }
          refresh();
        })));
      controls.appendChild(h('div.row', { style: { justifyContent: 'center', margin: '8px 0' } },
        seg([
          { value: 'speed', label: 'by speed' },
          { value: 'volt', label: 'by voltage (e⁻)' }
        ], mode, (v) => {
          mode = v;
          if (v === 'volt') obj = OBJECTS[0];
          refresh(); renderControls();
        })));
      controls.appendChild(mode === 'volt' ? vlt.root : spd.root);
      controls.appendChild(h('div.btnbar', { style: { marginTop: 'var(--sp-4)' } },
        btn('Check', check, { kind: 'primary', size: 'md' }),
        TASKS[taskIdx]?.impossible
          ? btn('It is impossible', () => declareImpossible(), { kind: 'ghost' })
          : null
      ));
    }

    /* ------------------------------------------------------------ */

    function renderTask() {
      clear(taskBox);
      clear(verdict);
      if (taskIdx >= TASKS.length) {
        taskBox.className = 'callout callout--tip';
        taskBox.appendChild(h('div.callout__label', null, '✓ Bench mastered'));
        taskBox.appendChild(h('div.small', null, renderInline(
          'Free play: put the dust grain at $1\\ \\text{m s}^{-1}$. Even a speck of dust is firmly classical.')));
        return;
      }
      taskBox.className = 'callout callout--jee';
      taskBox.appendChild(h('div.callout__label', null, `Task ${taskIdx + 1} / ${TASKS.length}`));
      taskBox.appendChild(h('div.small', null, renderInline(TASKS[taskIdx].text)));
      renderControls();
    }

    function declareImpossible() {
      const task = TASKS[taskIdx];
      if (locked || !task?.impossible) return;
      if (obj.id !== 'ball') {
        cab.setHint('Select the cricket ball first, then try every speed.');
        sfx.wrong();
        return;
      }
      win(task);
    }

    function check() {
      if (locked || taskIdx >= TASKS.length) return;
      const task = TASKS[taskIdx];
      if (task.ok(snapshot())) { win(task); return; }

      sfx.wrong();
      clear(verdict);
      verdict.appendChild(verdictLine(false, task.impossible
        ? `Still ${sci(lambda(), 2)} m. Try the slowest speed on the dial — then ask whether any speed could work.`
        : `That gives $\\lambda = ${sci(lambda(), 2)}$ m. Not there yet — remember $\\lambda \\propto 1/mv$.`));
    }

    function win(task) {
      locked = true;
      score += 25;
      cab.setScore(score);
      sfx.levelUp();
      ctx.fx?.burstAt(taskBox, { count: 18 });

      clear(taskBox);
      taskBox.className = 'callout callout--tip';
      taskBox.appendChild(h('div.callout__label', null, '✓ Correct'));
      taskBox.appendChild(h('div.small', null, renderInline(task.note)));
      clear(verdict);
      verdict.appendChild(h('div.btnbar', { style: { marginTop: '10px' } },
        btn(taskIdx === TASKS.length - 1 ? 'Finish' : 'Next task', () => {
          taskIdx++; locked = false;
          renderTask();
          if (taskIdx >= TASKS.length) finish();
        }, { kind: 'primary' })));
    }

    function finish() {
      const best = Math.max(ctx.best ?? 0, score);
      cab.setBest(best);
      ctx.report(score, { best, tasks: taskIdx });
      cab.overlay(cleared(score, best, start));
    }

    function start() {
      cab.clearOverlay();
      score = 0; taskIdx = 0; locked = false;
      obj = OBJECTS[0]; mode = 'speed';
      cab.setScore(0);
      spd.set(87.5); vlt.set(20);
      refresh();
      renderTask();
    }

    start();
    return { destroy() { view.stop(); } };
  }
};
