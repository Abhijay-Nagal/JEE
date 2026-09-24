/**
 * The slope of an x-t graph is the velocity.
 *
 * A tangent slides along a position-time curve while the matching point is
 * plotted on a velocity-time graph beneath it. Where the curve is steep the
 * v-t point is high; at the turning point the tangent goes flat and v crosses
 * zero. The link stops being a rule and becomes something you watched happen.
 */

import { cssVar, c2d, phase, ease, axes, curve, readout } from '../kit.js';

// x(t) = 20 + 18t - 3t^2  =>  v(t) = 18 - 6t, zero at t = 3
const X = (tt) => 20 + 18 * tt - 3 * tt * tt;
const V = (tt) => 18 - 6 * tt;

export default {
  id: 'slopeIsVelocity',
  title: 'Slope of the position–time graph is velocity',
  caption: 'One body, two graphs. The tangent above becomes the height below.',
  duration: 16,
  loop: true,
  height: 340,
  stillAt: 0.55,

  steps: [
    { at: 0.00, text: 'Above: position against time. Below: the velocity we are about to read off it.' },
    { at: 0.12, text: 'Draw the tangent at $t = 0$. It is steep and rising, so the velocity is large and positive.' },
    { at: 0.30, text: 'As the tangent slides right it flattens — the body is slowing, and the v-t point falls.' },
    { at: 0.48, text: 'At $t = 3$ s the tangent is **horizontal**. Velocity is zero: the body is momentarily at rest, at its furthest point.' },
    { at: 0.64, text: 'Past that the tangent tilts downward. Velocity is negative — the body is coming back.' },
    { at: 0.82, text: 'The v-t graph is a straight line, so the slope of *that* is constant: acceleration $= -6\\ \\text{m s}^{-2}$.' },
    { at: 0.92, text: 'Position $\\xrightarrow{\\ \\text{slope}\\ }$ velocity $\\xrightarrow{\\ \\text{slope}\\ }$ acceleration.' }
  ],

  draw(g, w, h, t) {
    const hue = cssVar('--physics');
    const accent = cssVar('--accent');
    const ok = cssVar('--ok');
    const bad = cssVar('--bad');

    const tNow = phase(t, 0.10, 0.88, ease.inOut) * 6;

    /* ---- top: x-t ---- */
    const topH = h * 0.52;
    g.save();
    g.translate(0, 0);
    const ax1 = axes(g, w, topH, {
      xmin: 0, xmax: 6, ymin: 0, ymax: 60,
      xlabel: 't (s)', ylabel: 'x (m)', xticks: 6, yticks: 3, padB: 26
    });
    curve(g, ax1, X, 0, 6, { color: hue, width: 2.6 });

    // tangent at tNow
    const x0 = X(tNow), m = V(tNow);
    const half = 1.15;
    const tx1 = Math.max(0, tNow - half), tx2 = Math.min(6, tNow + half);
    c2d.line(g,
      ax1.X(tx1), ax1.Y(x0 + m * (tx1 - tNow)),
      ax1.X(tx2), ax1.Y(x0 + m * (tx2 - tNow)),
      { color: Math.abs(m) < 0.6 ? ok : accent, width: 2.6 });

    // the rise/run triangle
    if (Math.abs(m) > 0.8) {
      const t2 = Math.min(6, tNow + 0.9);
      const px = ax1.X(tNow), py = ax1.Y(x0);
      const qx = ax1.X(t2), qy = ax1.Y(x0 + m * (t2 - tNow));
      g.save();
      g.globalAlpha = 0.5;
      c2d.line(g, px, py, qx, py, { color: accent, width: 1.4, dash: [3, 3] });
      c2d.line(g, qx, py, qx, qy, { color: accent, width: 1.4, dash: [3, 3] });
      g.restore();
      c2d.text(g, 'Δt', (px + qx) / 2, py + 10, { size: 9, weight: 700, color: accent });
      c2d.text(g, 'Δx', qx + 12, (py + qy) / 2, { size: 9, weight: 700, color: accent });
    }

    g.fillStyle = hue;
    g.beginPath(); g.arc(ax1.X(tNow), ax1.Y(x0), 5.5, 0, Math.PI * 2); g.fill();
    g.strokeStyle = cssVar('--bg-2'); g.lineWidth = 2; g.stroke();

    if (Math.abs(m) < 0.6) {
      c2d.text(g, 'tangent flat → v = 0', ax1.X(tNow), ax1.Y(x0) - 18,
        { size: 10, weight: 800, color: ok });
    }
    g.restore();

    /* ---- bottom: v-t ---- */
    g.save();
    g.translate(0, topH);
    const bh = h - topH;
    const ax2 = axes(g, w, bh, {
      xmin: 0, xmax: 6, ymin: -20, ymax: 20,
      xlabel: 't (s)', ylabel: 'v (m s⁻¹)', xticks: 6, yticks: 4, padB: 28
    });

    // only draw the v-t line up to "now", so it is built as we watch
    curve(g, ax2, V, 0, Math.max(0.001, tNow), { color: accent, width: 2.6 });
    curve(g, ax2, V, 0, 6, { color: cssVar('--line'), width: 1.4, dash: [3, 4] });

    const vy = ax2.Y(V(tNow));
    g.fillStyle = V(tNow) >= 0 ? ok : bad;
    g.beginPath(); g.arc(ax2.X(tNow), vy, 5.5, 0, Math.PI * 2); g.fill();
    g.strokeStyle = cssVar('--bg-2'); g.lineWidth = 2; g.stroke();

    // drop line linking the two graphs conceptually
    c2d.line(g, ax2.X(tNow), ax2.Y(0), ax2.X(tNow), vy, {
      color: V(tNow) >= 0 ? ok : bad, width: 1.6, dash: [3, 3]
    });
    g.restore();

    /* ---- shared vertical time line ---- */
    g.save();
    g.globalAlpha = 0.25;
    c2d.line(g, ax1.X(tNow), 8, ax1.X(tNow), h - 8, { color: hue, width: 1.2, dash: [2, 5] });
    g.restore();

    readout(g, w - 12, 8, [
      `t = ${tNow.toFixed(2)} s`,
      `x = ${X(tNow).toFixed(1)} m`,
      `v = ${V(tNow).toFixed(1)} m/s`
    ], { align: 'right', hue });
  }
};
