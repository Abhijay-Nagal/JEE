/**
 * Horizontal and vertical motion are independent.
 *
 * A projectile is fired at the same moment an identical ball is simply
 * dropped. They stay level with each other the whole way down. Once a learner
 * has seen that, "resolve into components and treat them separately" stops
 * being a procedure and becomes the obvious thing to do.
 */

import { cssVar, c2d, phase, ease, body, vector, ground, readout } from '../kit.js';

const U = 26;          // launch speed m/s
const ANG = 50 * Math.PI / 180;
const G = 10;
const UX = U * Math.cos(ANG);
const UY = U * Math.sin(ANG);
const TFLIGHT = (2 * UY) / G;
const RANGE = UX * TFLIGHT;
const HMAX = (UY * UY) / (2 * G);

export default {
  id: 'projectileIndependence',
  title: 'The two motions do not know about each other',
  caption: 'Fire one ball and drop another at the same instant. They land together.',
  duration: 16,
  loop: true,
  height: 310,
  stillAt: 0.55,

  steps: [
    { at: 0.00, text: 'One ball is launched at an angle. A second is released from the same height at the same instant.' },
    { at: 0.14, text: 'Horizontally, gravity does nothing: $a_x = 0$, so $x = u_x t$ — equal steps in equal times.' },
    { at: 0.30, text: 'Vertically, both balls feel the same $g$. Watch the dashed line — they stay level the whole way.' },
    { at: 0.48, text: 'At the top the vertical velocity is zero, but the horizontal velocity is untouched. The ball is still moving.' },
    { at: 0.64, text: 'They reach the ground **at the same moment**. Firing it sideways did not delay the fall by a millisecond.' },
    { at: 0.78, text: 'So: time of flight $=\\dfrac{2u\\sin\\theta}{g}$, set entirely by the vertical component.' },
    { at: 0.88, text: 'Range $= u_x \\times$ time of flight $=\\dfrac{u^2\\sin 2\\theta}{g}$ — maximum at $45\\degree$.' }
  ],

  draw(g, w, h, t) {
    const hue = cssVar('--physics');
    const accent = cssVar('--accent');
    const ok = cssVar('--ok');
    const other = cssVar('--chart-3');

    const padL = 44, padR = 22;
    const baseY = h - 44;
    const topY = 34;

    const sx = (w - padL - padR) / (RANGE * 1.06);
    const sy = (baseY - topY) / (HMAX * 1.35);
    const s = Math.min(sx, sy);

    const X = (m) => padL + m * s;
    const Y = (m) => baseY - m * s;

    ground(g, 12, w - 12, baseY);

    const tNow = phase(t, 0.06, 0.92, ease.linear) * TFLIGHT;

    /* ---- the full trajectory, faint ---- */
    g.save();
    g.globalAlpha = 0.2;
    g.strokeStyle = hue; g.lineWidth = 2; g.setLineDash([3, 5]);
    g.beginPath();
    for (let i = 0; i <= 120; i++) {
      const tt = (i / 120) * TFLIGHT;
      const px = X(UX * tt), py = Y(UY * tt - 0.5 * G * tt * tt);
      i ? g.lineTo(px, py) : g.moveTo(px, py);
    }
    g.stroke();
    g.restore();

    /* ---- travelled path ---- */
    g.save();
    g.strokeStyle = hue; g.lineWidth = 2.6; g.lineCap = 'round';
    g.beginPath();
    for (let i = 0; i <= 90; i++) {
      const tt = (i / 90) * tNow;
      const px = X(UX * tt), py = Y(UY * tt - 0.5 * G * tt * tt);
      i ? g.lineTo(px, py) : g.moveTo(px, py);
    }
    g.stroke();
    g.restore();

    /* ---- equal-time horizontal ticks ---- */
    if (t > 0.14) {
      const a = phase(t, 0.14, 0.24);
      g.save();
      g.globalAlpha = 0.65 * a;
      for (let k = 1; k <= 6; k++) {
        const tt = (k / 6) * TFLIGHT;
        if (tt > tNow) break;
        c2d.line(g, X(UX * tt), baseY, X(UX * tt), baseY - 8, { color: ok, width: 1.6 });
      }
      g.restore();
      if (tNow > TFLIGHT * 0.3) {
        c2d.text(g, 'equal horizontal steps in equal times', X(RANGE / 2), baseY + 22,
          { size: 10, weight: 700, color: ok });
      }
    }

    /* ---- the two balls ---- */
    const yNow = Math.max(0, UY * tNow - 0.5 * G * tNow * tNow);
    const px = X(UX * tNow), py = Y(yNow);

    // the dropped one, at a fixed x
    const dropX = X(RANGE * 0.06);
    const dropTop = Y(HMAX);
    // Released from the projectile's apex height so the level line is easy to read.
    const dropY = Y(Math.max(0, HMAX - 0.5 * G * tNow * tNow));

    g.save();
    g.globalAlpha = 0.55;
    c2d.line(g, dropX, dropTop, dropX, baseY, { color: other, width: 1.4, dash: [3, 4] });
    g.restore();
    body(g, dropX, dropY, 8, { color: other });
    c2d.text(g, 'dropped', dropX, dropTop - 14, { size: 9, weight: 800, color: other });

    body(g, px, py, 9, { color: hue });

    /* ---- the level line linking them ---- */
    if (t > 0.28) {
      const a = phase(t, 0.28, 0.36);
      g.save();
      g.globalAlpha = 0.85 * a;
      // Compare like with like: both have fallen the same 1/2 g t^2.
      const fallY = Y(HMAX - 0.5 * G * tNow * tNow);
      c2d.line(g, dropX, fallY, px, Y(yNow), { color: accent, width: 1.4, dash: [4, 4] });
      g.restore();
    }

    /* ---- velocity components at the ball ---- */
    if (t > 0.4) {
      const a = phase(t, 0.4, 0.5);
      const vy = UY - G * tNow;
      const k = 1.5;
      g.save();
      g.globalAlpha = a;
      vector(g, px, py, px + UX * k, py, { color: ok, width: 2.4 });
      if (Math.abs(vy) > 0.5) vector(g, px, py, px, py - vy * k, { color: accent, width: 2.4 });
      g.restore();
      if (Math.abs(vy) < 1.2) {
        c2d.text(g, 'vᵧ = 0, vₓ unchanged', px, py - 24, { size: 10, weight: 800, color: accent });
      }
    }

    /* ---- apex and range marks ---- */
    if (t > 0.74) {
      const a = phase(t, 0.74, 0.84);
      g.save();
      g.globalAlpha = a;
      c2d.line(g, padL, Y(HMAX), w - padR, Y(HMAX), { color: accent, width: 1.2, dash: [4, 4] });
      c2d.text(g, `H = ${HMAX.toFixed(1)} m`, w - padR, Y(HMAX) - 10,
        { size: 10, weight: 800, color: accent, align: 'right' });

      c2d.line(g, X(0), baseY + 30, X(RANGE), baseY + 30, { color: hue, width: 1.4 });
      c2d.line(g, X(0), baseY + 25, X(0), baseY + 35, { color: hue, width: 1.4 });
      c2d.line(g, X(RANGE), baseY + 25, X(RANGE), baseY + 35, { color: hue, width: 1.4 });
      c2d.text(g, `R = ${RANGE.toFixed(1)} m`, X(RANGE / 2), baseY + 38,
        { size: 10, weight: 800, color: hue });
      g.restore();
    }

    readout(g, w - 14, 14, [
      `t  = ${tNow.toFixed(2)} s`,
      `x  = ${(UX * tNow).toFixed(1)} m`,
      `y  = ${yNow.toFixed(1)} m`
    ], { align: 'right', hue });

    if (t > 0.62 && t < 0.78) {
      const a = phase(t, 0.62, 0.68) * (1 - phase(t, 0.74, 0.78));
      g.save();
      g.globalAlpha = a;
      c2d.text(g, 'both land together', w / 2, topY - 12, { size: 13, weight: 900, color: ok });
      g.restore();
    }
  }
};
