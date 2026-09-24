/**
 * The up-down symmetry of vertical projection.
 *
 * Time up equals time down; the speed at any height on the way up equals the
 * speed at that same height coming down. Both facts fall out of one graph, and
 * both are worth several marks a year.
 */

import { cssVar, c2d, phase, ease, body, ground, readout, axes, curve } from '../kit.js';

const U = 20;     // m/s upward
const G = 10;     // m/s^2
const TTOP = U / G;          // 2 s
const TTOT = 2 * TTOP;       // 4 s
const HMAX = (U * U) / (2 * G);  // 20 m

const Y = (tt) => U * tt - 0.5 * G * tt * tt;
const Vy = (tt) => U - G * tt;

export default {
  id: 'freeFallSymmetry',
  title: 'Up and down are mirror images',
  caption: 'Throw something straight up and the journey back is the journey out, run backwards.',
  duration: 16,
  loop: true,
  height: 330,
  stillAt: 0.5,

  steps: [
    { at: 0.00, text: 'Thrown straight up at $u = 20\\ \\text{m s}^{-1}$, with $g = 10\\ \\text{m s}^{-2}$ downward throughout.' },
    { at: 0.14, text: 'Going up, gravity opposes the motion, so the speed falls by $10\\ \\text{m s}^{-1}$ every second.' },
    { at: 0.30, text: 'At the top the velocity is zero — but the **acceleration is still $g$**, still downward. It never pauses.' },
    { at: 0.46, text: 'Coming down, the same $g$ now adds speed at the same rate.' },
    { at: 0.62, text: 'Time up $=$ time down $= u/g = 2$ s. The total flight is $2u/g$.' },
    { at: 0.76, text: 'At any given height the speed going up equals the speed coming down — only the direction has flipped.' },
    { at: 0.88, text: 'Maximum height $= u^2/2g = 20$ m, reached exactly halfway through the flight.' }
  ],

  draw(g, w, h, t) {
    const hue = cssVar('--physics');
    const accent = cssVar('--accent');
    const ok = cssVar('--ok');
    const bad = cssVar('--bad');

    const tNow = phase(t, 0.06, 0.92, ease.linear) * TTOT;
    const goingUp = tNow <= TTOP;

    /* ================= left: the throw ================= */
    const colW = w * 0.42;
    const baseY = h - 46;
    const topY = 34;
    const px = colW * 0.5;
    const scaleY = (m) => baseY - (m / (HMAX * 1.12)) * (baseY - topY);

    ground(g, 16, colW - 10, baseY);

    // height markers
    g.save();
    g.globalAlpha = 0.5;
    for (const m of [5, 10, 15, 20]) {
      c2d.line(g, 22, scaleY(m), colW - 16, scaleY(m), { color: cssVar('--line'), width: 1, dash: [2, 5] });
      c2d.text(g, `${m} m`, colW - 14, scaleY(m), { size: 9, color: cssVar('--ink-4'), align: 'right' });
    }
    g.restore();

    // apex marker
    c2d.line(g, 22, scaleY(HMAX), colW - 16, scaleY(HMAX), { color: accent, width: 1.4, dash: [4, 4] });
    c2d.text(g, 'hₘₐₓ = u²/2g', px, scaleY(HMAX) - 11, { size: 10, weight: 800, color: accent });

    // the ball, with a mirrored ghost at the matching height
    const yNow = Math.max(0, Y(tNow));
    body(g, px, scaleY(yNow), 10, { color: hue });

    // velocity arrow
    const v = Vy(tNow);
    if (Math.abs(v) > 0.4) {
      const len = (Math.abs(v) / U) * 52;
      const dir = v > 0 ? -1 : 1;
      c2d.arrow(g, px + 24, scaleY(yNow), px + 24, scaleY(yNow) + dir * len,
        { color: v > 0 ? ok : bad, width: 2.6, head: 8 });
      c2d.text(g, `${Math.abs(v).toFixed(1)}`, px + 44, scaleY(yNow) + (dir * len) / 2,
        { size: 10, weight: 800, color: v > 0 ? ok : bad });
    } else {
      c2d.text(g, 'v = 0', px + 40, scaleY(yNow), { size: 11, weight: 900, color: accent });
    }

    // g arrow, always the same, always down
    c2d.arrow(g, px - 34, scaleY(yNow) - 14, px - 34, scaleY(yNow) + 14,
      { color: cssVar('--ink-3'), width: 2, head: 7 });
    c2d.text(g, 'g', px - 46, scaleY(yNow), { size: 11, weight: 800, color: cssVar('--ink-3') });

    // the mirror pair, once we are on the way down
    if (!goingUp && t > 0.72) {
      const tMirror = TTOT - tNow;
      const yM = Y(tMirror);
      g.save();
      g.globalAlpha = 0.45;
      body(g, px, scaleY(yM), 9, { color: ok, glow: false });
      g.restore();
      c2d.line(g, px - 60, scaleY(yNow), px + 60, scaleY(yNow),
        { color: accent, width: 1.2, dash: [3, 3] });
      c2d.text(g, 'same height, same speed', px, scaleY(yNow) + 16,
        { size: 9, weight: 700, color: accent });
    }

    /* ================= right: the v-t graph ================= */
    g.save();
    g.translate(colW, 6);
    const gw = w - colW - 8;
    const ax = axes(g, gw, h - 40, {
      xmin: 0, xmax: TTOT, ymin: -U, ymax: U,
      xlabel: 't (s)', ylabel: 'v (m s⁻¹)', xticks: 4, yticks: 4, padB: 28, padL: 40
    });

    curve(g, ax, Vy, 0, TTOT, { color: cssVar('--line'), width: 1.4, dash: [3, 4] });
    curve(g, ax, Vy, 0, Math.max(0.001, tNow), { color: hue, width: 2.6 });

    // shade the two equal areas once both exist
    if (t > 0.6) {
      const a = phase(t, 0.6, 0.7);
      g.save();
      g.globalAlpha = 0.2 * a;
      g.fillStyle = ok;
      g.beginPath();
      g.moveTo(ax.X(0), ax.Y(0));
      g.lineTo(ax.X(0), ax.Y(U));
      g.lineTo(ax.X(TTOP), ax.Y(0));
      g.closePath(); g.fill();
      g.fillStyle = bad;
      g.beginPath();
      g.moveTo(ax.X(TTOP), ax.Y(0));
      g.lineTo(ax.X(TTOT), ax.Y(-U));
      g.lineTo(ax.X(TTOT), ax.Y(0));
      g.closePath(); g.fill();
      g.restore();
      g.save();
      g.globalAlpha = a;
      c2d.text(g, '+20 m', ax.X(TTOP * 0.5), ax.Y(U * 0.45), { size: 10, weight: 800, color: ok });
      c2d.text(g, '−20 m', ax.X(TTOP * 1.5), ax.Y(-U * 0.45), { size: 10, weight: 800, color: bad });
      g.restore();
    }

    g.fillStyle = v >= 0 ? ok : bad;
    g.beginPath(); g.arc(ax.X(tNow), ax.Y(v), 5, 0, Math.PI * 2); g.fill();
    g.strokeStyle = cssVar('--bg-2'); g.lineWidth = 2; g.stroke();
    g.restore();

    /* ================= readout ================= */
    readout(g, w - 12, h - 44, [
      `t = ${tNow.toFixed(2)} s`,
      `y = ${yNow.toFixed(1)} m`,
      `v = ${v.toFixed(1)} m/s`
    ], { align: 'right', hue });
  }
};
