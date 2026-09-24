/**
 * Relative velocity, as a boat crossing a river.
 *
 * The classic trap is assuming the boat lands straight opposite. Drawing the
 * river's velocity as a vector that is added to the boat's - and watching the
 * actual track drift - makes the vector sum concrete.
 */

import { cssVar, c2d, phase, lerp, ease, vector, body, readout } from '../kit.js';

const VB = 4;    // boat speed relative to water, m/s
const VR = 3;    // river speed, m/s
const WIDTH = 60; // river width, m

export default {
  id: 'relativeVelocity',
  title: 'Relative velocity: crossing a river',
  caption: 'Point the boat straight across and you will not arrive straight across.',
  duration: 17,
  loop: true,
  height: 300,
  stillAt: 0.55,

  steps: [
    { at: 0.00, text: 'A boat can do $4\\ \\text{m s}^{-1}$ through still water. The river flows at $3\\ \\text{m s}^{-1}$.' },
    { at: 0.12, text: 'The pilot aims **straight across**. That is the boat’s velocity relative to the *water*.' },
    { at: 0.26, text: 'But the water is itself moving. The ground sees the vector **sum** of the two.' },
    { at: 0.40, text: 'Resultant speed $=\\sqrt{4^2+3^2}=5\\ \\text{m s}^{-1}$, at an angle downstream.' },
    { at: 0.56, text: 'So the boat lands **downstream** of the target. That offset is the drift.' },
    { at: 0.70, text: 'Crossing time depends only on the across-component: $t = \\dfrac{d}{v_b} = \\dfrac{60}{4} = 15$ s.' },
    { at: 0.82, text: 'Drift $= v_r t = 3 \\times 15 = 45$ m, regardless of how wide the river looks.' },
    { at: 0.92, text: 'To land straight opposite the pilot must aim **upstream**, at $\\sin\\theta = v_r/v_b$.' }
  ],

  draw(g, w, h, t) {
    const hue = cssVar('--physics');
    const accent = cssVar('--accent');
    const ok = cssVar('--ok');
    const river = cssVar('--chart-1');

    const pad = 30;
    const bankTop = 48;
    const bankBot = h - 66;
    const scale = (bankBot - bankTop) / WIDTH;     // px per metre across

    /* ---- the river ---- */
    g.save();
    g.fillStyle = river;
    g.globalAlpha = 0.13;
    g.fillRect(0, bankTop, w, bankBot - bankTop);
    g.restore();

    c2d.line(g, 0, bankTop, w, bankTop, { color: cssVar('--ink-4'), width: 2 });
    c2d.line(g, 0, bankBot, w, bankBot, { color: cssVar('--ink-4'), width: 2 });
    c2d.text(g, 'far bank', w - 12, bankTop - 12, { size: 10, weight: 700, color: cssVar('--ink-4'), align: 'right' });
    c2d.text(g, 'near bank', w - 12, bankBot + 14, { size: 10, weight: 700, color: cssVar('--ink-4'), align: 'right' });

    // flow arrows, animated
    g.save();
    g.globalAlpha = 0.35;
    for (let row = 0; row < 4; row++) {
      const y = bankTop + ((row + 0.5) * (bankBot - bankTop)) / 4;
      for (let i = -1; i < 7; i++) {
        const x = ((i * 130 + t * 900) % (w + 200)) - 60;
        c2d.arrow(g, x, y, x + 26, y, { color: river, width: 1.6, head: 5 });
      }
    }
    g.restore();
    c2d.text(g, `river  ${VR} m s⁻¹ →`, 12, bankTop + 14, { size: 10, weight: 800, color: river, align: 'left' });

    /* ---- the crossing ---- */
    const prog = phase(t, 0.14, 0.88, ease.inOut);
    const crossed = prog * WIDTH;              // metres across
    const tSec = crossed / VB;                 // seconds elapsed
    const drift = VR * tSec;                   // metres downstream

    const startX = pad + 24;
    const bx = startX + drift * scale;
    const by = bankBot - crossed * scale;

    // the target straight across
    g.save();
    g.globalAlpha = 0.7;
    c2d.line(g, startX, bankBot, startX, bankTop, { color: cssVar('--ink-4'), width: 1.4, dash: [4, 4] });
    g.restore();
    c2d.text(g, 'aim', startX, bankTop - 12, { size: 10, weight: 700, color: cssVar('--ink-4') });

    // actual track
    g.save();
    g.strokeStyle = accent;
    g.lineWidth = 2.4;
    g.setLineDash([5, 4]);
    g.beginPath();
    g.moveTo(startX, bankBot);
    g.lineTo(bx, by);
    g.stroke();
    g.restore();

    body(g, bx, by, 9, { color: hue });

    /* ---- the vector triangle, drawn on the boat ---- */
    if (t > 0.22) {
      const a = phase(t, 0.22, 0.34);
      g.save();
      g.globalAlpha = a;
      const k = 11;    // px per m/s
      vector(g, bx, by, bx, by - VB * k, { color: ok, label: t > 0.3 ? 'v_boat' : null, width: 2.6 });
      vector(g, bx, by - VB * k, bx + VR * k, by - VB * k, { color: river, label: t > 0.3 ? 'v_river' : null, width: 2.6 });
      if (t > 0.36) {
        g.globalAlpha = a * phase(t, 0.36, 0.44);
        vector(g, bx, by, bx + VR * k, by - VB * k, { color: accent, label: 'resultant 5', width: 3 });
      }
      g.restore();
    }

    /* ---- the drift, measured ---- */
    if (t > 0.54 && crossed > 4) {
      const a = phase(t, 0.54, 0.64);
      g.save();
      g.globalAlpha = a;
      const y = bankTop - 26;
      c2d.line(g, startX, y, bx, y, { color: accent, width: 1.4 });
      c2d.line(g, startX, y - 5, startX, y + 5, { color: accent, width: 1.4 });
      c2d.line(g, bx, y - 5, bx, y + 5, { color: accent, width: 1.4 });
      c2d.text(g, `drift ${drift.toFixed(0)} m`, (startX + bx) / 2, y - 10,
        { size: 10, weight: 800, color: accent });
      g.restore();
    }

    /* ---- the aim-upstream solution ---- */
    if (t > 0.9) {
      const a = phase(t, 0.9, 0.97);
      g.save();
      g.globalAlpha = a;
      const sx = w * 0.72, sy = bankBot - 8;
      const th = Math.asin(VR / VB);
      const k = 46;
      vector(g, sx, sy, sx - Math.sin(th) * k, sy - Math.cos(th) * k, { color: ok, width: 2.6 });
      vector(g, sx - Math.sin(th) * k, sy - Math.cos(th) * k,
        sx - Math.sin(th) * k + (VR / VB) * k, sy - Math.cos(th) * k, { color: river, width: 2.2 });
      vector(g, sx, sy, sx, sy - Math.cos(th) * k, { color: accent, width: 2.6, dashed: true });
      c2d.text(g, 'aim upstream → land straight across', sx, sy + 16,
        { size: 10, weight: 800, color: ok });
      g.restore();
    }

    readout(g, w - 12, h - 56, [
      `across = ${crossed.toFixed(0)} m`,
      `t      = ${tSec.toFixed(1)} s`,
      `drift  = ${drift.toFixed(0)} m`
    ], { align: 'right', hue: accent });
  }
};
