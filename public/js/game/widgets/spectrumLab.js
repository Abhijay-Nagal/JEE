/**
 * Photon Bench - one wavelength dial, four numbers, and a metal to shine it on.
 *
 * Every quantity in this topic is the same fact in different clothes. Putting
 * lambda, nu, E in joules and E in eV on one dial makes the conversions
 * muscle memory, and the photocell underneath turns them into a consequence.
 */

import { h, clear } from '../../core/dom.js';
import { renderInline } from '../../core/mathlite.js';
import { sfx } from '../../core/audio.js';
import { arcade, canvasLayer, cssVar, c2d, slider, readouts, btn, seg,
         verdictLine, cleared, sci, round } from '../kit.js';

const H = 6.626e-34;
const C = 3.0e8;
const EV = 1.602e-19;

/** Work functions in eV. Standard JEE values. */
const METALS = [
  { id: 'cs', name: 'Caesium', phi: 2.14 },
  { id: 'k',  name: 'Potassium', phi: 2.30 },
  { id: 'na', name: 'Sodium', phi: 2.75 },
  { id: 'zn', name: 'Zinc', phi: 4.30 }
];

const TASKS = [
  { text: 'Dial up a photon of energy **2.00 eV**.',
    target: () => 1240 / 2.00, tol: 0.02,
    note: '$\\lambda = \\dfrac{1240}{E(\\text{eV})} = \\dfrac{1240}{2.00} = 620$ nm. That shortcut is the single most useful line in this chapter.' },
  { text: 'Dial up a frequency of **$1.0\\times10^{15}$ Hz**.',
    target: () => (C / 1.0e15) * 1e9, tol: 0.03,
    note: '$\\lambda = \\dfrac{c}{\\nu} = \\dfrac{3\\times10^{8}}{1\\times10^{15}} = 3\\times10^{-7}$ m $= 300$ nm — ultraviolet.' },
  { text: 'Find the **threshold wavelength** of caesium ($\\phi = 2.14$ eV) — the longest wavelength that still ejects an electron.',
    target: () => 1240 / 2.14, tol: 0.03,
    note: '$\\lambda_0 = \\dfrac{1240}{\\phi} = \\dfrac{1240}{2.14} = 580$ nm. Anything **longer** than this ejects nothing, however bright.' },
  { text: 'Find a wavelength that ejects electrons from **sodium** ($\\phi = 2.75$ eV) with $KE_{\\max} = 1.00$ eV.',
    target: () => 1240 / 3.75, tol: 0.03,
    note: 'The photon must supply $\\phi + KE_{\\max} = 2.75 + 1.00 = 3.75$ eV, so $\\lambda = \\dfrac{1240}{3.75} = 331$ nm.' },
  { text: 'Find the wavelength at which **zinc** ($\\phi = 4.30$ eV) just begins to emit.',
    target: () => 1240 / 4.30, tol: 0.03,
    note: '$\\lambda_0 = \\dfrac{1240}{4.30} = 288$ nm — deep ultraviolet. Zinc is unresponsive to every visible colour, which is exactly why it needs a UV lamp in the classic demonstration.' }
];

export default {
  id: 'spectrumLab',

  mount(root, ctx) {
    const cab = arcade(root, {
      title: 'Photon Bench',
      badge: 'One dial, four numbers',
      hint: 'Drag the wavelength. Everything else follows from it.',
      best: ctx.best ?? null,
      onRestart: start
    });

    let metal = METALS[0];
    let score = 0, taskIdx = 0, locked = false;

    const stageBox = h('div');
    cab.stage.appendChild(stageBox);

    /* ------------------------------------------------------------ */
    /* derived quantities                                            */

    const nm = () => lam.get();
    const freq = () => C / (nm() * 1e-9);
    const eJ = () => (H * C) / (nm() * 1e-9);
    const eEV = () => eJ() / EV;
    const band = () => {
      const l = nm();
      if (l < 100) return 'X-ray';
      if (l < 400) return 'ultraviolet';
      if (l < 700) return 'visible';
      if (l < 1000) return 'near infrared';
      return 'infrared';
    };

    /** Approximate sRGB for a visible wavelength; grey outside the band. */
    function colourOf(l) {
      if (l < 380 || l > 750) return null;
      let r = 0, g = 0, b = 0;
      if (l < 440) { r = -(l - 440) / 60; b = 1; }
      else if (l < 490) { g = (l - 440) / 50; b = 1; }
      else if (l < 510) { g = 1; b = -(l - 510) / 20; }
      else if (l < 580) { r = (l - 510) / 70; g = 1; }
      else if (l < 645) { r = 1; g = -(l - 645) / 65; }
      else { r = 1; }
      const f = l > 700 ? 0.3 + (0.7 * (750 - l)) / 50 : l < 420 ? 0.3 + (0.7 * (l - 380)) / 40 : 1;
      const cv = (x) => Math.round(255 * Math.pow(Math.max(0, x) * f, 0.8));
      return `rgb(${cv(r)},${cv(g)},${cv(b)})`;
    }

    /* ------------------------------------------------------------ */
    /* the spectrum strip and photocell                              */

    const view = canvasLayer(stageBox, {
      height: 250,
      animate: true,
      draw(g, w, hgt) {
        const hue = cssVar('--chemistry');
        const x0 = 26, x1 = w - 26;
        const X = (l) => {
          const a = Math.log10(100), b = Math.log10(2000);
          return x0 + ((Math.log10(l) - a) / (b - a)) * (x1 - x0);
        };

        /* ---- the strip ---- */
        const sy = 30, sh = 34;
        for (let x = x0; x <= x1; x += 2) {
          const u = (x - x0) / (x1 - x0);
          const l = Math.pow(10, 2 + u * (Math.log10(2000) - 2));
          g.fillStyle = colourOf(l) || cssVar('--bg-0');
          g.fillRect(x, sy, 2.4, sh);
        }
        g.save();
        g.strokeStyle = cssVar('--line'); g.lineWidth = 1;
        c2d.roundRect(g, x0, sy, x1 - x0, sh, 4); g.stroke();
        g.restore();

        for (const [l, name] of [[150, 'UV'], [550, 'visible'], [1400, 'infrared']]) {
          c2d.text(g, name, X(l), sy - 10, { size: 9, weight: 700, color: cssVar('--ink-4') });
        }
        for (const l of [100, 200, 400, 700, 1000, 2000]) {
          c2d.line(g, X(l), sy + sh, X(l), sy + sh + 5, { color: cssVar('--line'), width: 1 });
          c2d.text(g, String(l), X(l), sy + sh + 14, { size: 8, color: cssVar('--ink-4') });
        }
        c2d.text(g, 'wavelength / nm', (x0 + x1) / 2, sy + sh + 28,
          { size: 9, weight: 700, color: cssVar('--ink-4') });

        /* ---- the marker ---- */
        const mx = X(nm());
        c2d.line(g, mx, sy - 4, mx, sy + sh + 4, { color: cssVar('--ink-0'), width: 2.4 });
        g.fillStyle = colourOf(nm()) || cssVar('--ink-3');
        g.beginPath(); g.arc(mx, sy - 8, 5, 0, Math.PI * 2); g.fill();

        /* ---- the photocell ---- */
        const cy = hgt - 62;
        const plateX = w * 0.32;
        const ejects = eEV() > metal.phi;
        const ke = Math.max(0, eEV() - metal.phi);

        // the metal plate
        g.fillStyle = cssVar('--ink-4');
        c2d.roundRect(g, plateX - 8, cy - 40, 12, 80, 3); g.fill();
        c2d.text(g, metal.name, plateX - 2, cy + 54, { size: 10, weight: 800, color: cssVar('--ink-3') });
        c2d.text(g, `φ = ${metal.phi.toFixed(2)} eV`, plateX - 2, cy + 68,
          { size: 9, weight: 700, color: cssVar('--ink-4') });

        // the incoming light
        const t = performance.now() / 1000;
        const beam = colourOf(nm()) || cssVar('--ink-3');
        g.save();
        g.strokeStyle = beam; g.lineWidth = 2.2;
        for (let k = 0; k < 3; k++) {
          const y = cy - 22 + k * 22;
          g.beginPath();
          for (let i = 0; i <= 40; i++) {
            const x = 40 + i * ((plateX - 50) / 40);
            const yy = y + Math.sin(i * 0.6 + t * 6 - k) * 4;
            i ? g.lineTo(x, yy) : g.moveTo(x, yy);
          }
          g.stroke();
        }
        g.restore();

        // the ejected electrons
        if (ejects) {
          const speed = 60 + Math.min(240, ke * 110);
          for (let k = 0; k < 4; k++) {
            const p = ((t * speed + k * 60) % 240) / 240;
            const ex = plateX + 10 + p * (w - plateX - 60);
            const ey = cy - 26 + k * 17 + Math.sin(p * 4 + k) * 6;
            g.fillStyle = cssVar('--ok');
            g.beginPath(); g.arc(ex, ey, 4.5, 0, Math.PI * 2); g.fill();
          }
          c2d.text(g, `KEₘₐₓ = ${ke.toFixed(2)} eV`, w - 40, cy - 46,
            { size: 11, weight: 800, color: cssVar('--ok'), align: 'right' });
          c2d.text(g, 'emitting ✓', w - 40, cy + 54,
            { size: 11, weight: 800, color: cssVar('--ok'), align: 'right' });
        } else {
          c2d.text(g, 'no emission', w - 40, cy + 54,
            { size: 11, weight: 800, color: cssVar('--bad'), align: 'right' });
          c2d.text(g, `photon ${eEV().toFixed(2)} eV < φ`, w - 40, cy - 46,
            { size: 10, weight: 700, color: cssVar('--bad'), align: 'right' });
        }

        // the collector
        g.fillStyle = cssVar('--line');
        c2d.roundRect(g, w - 34, cy - 40, 10, 80, 3); g.fill();

        g.save();
        g.globalAlpha = 0.9;
        c2d.text(g, `${nm().toFixed(0)} nm · ${band()}`, x0, sy + sh + 46,
          { size: 11, weight: 800, color: hue, align: 'left' });
        g.restore();
      }
    });

    /* ------------------------------------------------------------ */
    /* controls                                                      */

    const out = readouts([
      { key: 'l', label: 'λ (nm)', value: '—' },
      { key: 'n', label: 'ν (Hz)', value: '—' },
      { key: 'j', label: 'E (J)', value: '—' },
      { key: 'e', label: 'E (eV)', value: '—' }
    ]);

    function refresh() {
      out.set('l', nm().toFixed(0));
      out.set('n', sci(freq(), 3));
      out.set('j', sci(eJ(), 3));
      out.set('e', round(eEV(), 3), eEV() > metal.phi ? 'ok' : null);
    }

    const lam = slider({
      label: 'Wavelength', min: 100, max: 2000, step: 1, value: 500, unit: ' nm',
      onInput: refresh
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
        seg(METALS.map((m) => ({ value: m.id, label: m.name })), metal.id, (v) => {
          metal = METALS.find((m) => m.id === v);
          refresh();
        })));
      controls.appendChild(lam.root);
      controls.appendChild(h('div.btnbar', { style: { marginTop: 'var(--sp-4)' } },
        btn('Check', check, { kind: 'primary', size: 'md' })
      ));
    }

    /* ------------------------------------------------------------ */
    /* tasks                                                         */

    function renderTask() {
      clear(taskBox);
      clear(verdict);
      if (taskIdx >= TASKS.length) {
        taskBox.className = 'callout callout--tip';
        taskBox.appendChild(h('div.callout__label', null, '✓ Bench mastered'));
        taskBox.appendChild(h('div.small', null, renderInline(
          'Free play: pick zinc and try to find **any** visible colour that ejects an electron. There is none — that is the point.')));
        return;
      }
      taskBox.className = 'callout callout--jee';
      taskBox.appendChild(h('div.callout__label', null, `Task ${taskIdx + 1} / ${TASKS.length}`));
      taskBox.appendChild(h('div.small', null, renderInline(TASKS[taskIdx].text)));
    }

    function check() {
      if (locked || taskIdx >= TASKS.length) return;
      const task = TASKS[taskIdx];
      const target = task.target();
      const err = Math.abs(nm() - target) / target;

      if (err > task.tol) {
        sfx.wrong();
        clear(verdict);
        const dir = nm() > target ? 'shorter' : 'longer';
        verdict.appendChild(verdictLine(false,
          `Not there yet — try a **${dir}** wavelength. You are at ${nm().toFixed(0)} nm.`));
        return;
      }

      locked = true;
      score += 25;
      cab.setScore(score);
      sfx.levelUp();
      ctx.fx?.burstAt(taskBox, { count: 18 });

      clear(taskBox);
      taskBox.className = 'callout callout--tip';
      taskBox.appendChild(h('div.callout__label', null, `✓ ${target.toFixed(0)} nm`));
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
      metal = METALS[0];
      cab.setScore(0);
      lam.set(500);
      refresh();
      renderControls();
      renderTask();
    }

    start();
    return { destroy() { view.stop(); } };
  }
};
