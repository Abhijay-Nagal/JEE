/**
 * Where s = ut + (1/2)at^2 actually comes from.
 *
 * The equation is normally handed over as something to memorise. It is just
 * the area under a velocity-time line, split into a rectangle and a triangle -
 * and once the split is drawn, the formula is unforgettable.
 */

import { cssVar, c2d, phase, during, ease, axes, curve, areaUnder, readout } from '../kit.js';

const U = 5;      // initial velocity, m/s
const A = 3;      // acceleration, m/s^2
const TMAX = 6;
const V = (tt) => U + A * tt;

export default {
  id: 'areaIsDisplacement',
  title: 'Area under a v–t graph is the displacement',
  caption: 'Split that area into a rectangle and a triangle and the first equation of motion writes itself.',
  duration: 17,
  loop: true,
  height: 300,
  stillAt: 0.86,

  steps: [
    { at: 0.00, text: 'A body starts at $u = 5\\ \\text{m s}^{-1}$ and accelerates at $a = 3\\ \\text{m s}^{-2}$.' },
    { at: 0.10, text: 'On a v–t graph that is a straight line of slope $a$, starting at height $u$.' },
    { at: 0.24, text: 'Displacement is the **area** under it. Watch the area fill as time passes.' },
    { at: 0.46, text: 'Now split that area at the height $u$.' },
    { at: 0.56, text: 'The lower part is a rectangle: width $t$, height $u$. Its area is $ut$.' },
    { at: 0.70, text: 'The upper part is a triangle: base $t$, height $at$. Its area is $\\tfrac{1}{2}\\,t\\,(at) = \\tfrac{1}{2}at^2$.' },
    { at: 0.84, text: 'Add them: $s = ut + \\tfrac{1}{2}at^2$. That is the whole derivation.' },
    { at: 0.93, text: 'The other equations are the same area, measured a different way.' }
  ],

  draw(g, w, h, t) {
    const hue = cssVar('--physics');
    const accent = cssVar('--accent');
    const ok = cssVar('--ok');
    const ink = cssVar('--ink-3');

    const ax = axes(g, w, h - 42, {
      xmin: 0, xmax: TMAX, ymin: 0, ymax: 26,
      xlabel: 't (s)', ylabel: 'v (m s⁻¹)', xticks: 6, yticks: 4, padB: 30
    });

    const tNow = phase(t, 0.16, 0.44, ease.inOut) * TMAX;
    const split = phase(t, 0.46, 0.58, ease.inOut);
    const showRect = phase(t, 0.52, 0.62);
    const showTri = phase(t, 0.66, 0.76);

    /* ---- the v-t line ---- */
    curve(g, ax, V, 0, TMAX, { color: hue, width: 2.8 });

    /* ---- area ---- */
    if (split < 0.05) {
      areaUnder(g, ax, V, 0, tNow, { color: hue, alpha: 0.22 });
    } else {
      // rectangle u*t
      g.save();
      g.globalAlpha = 0.28 * Math.max(showRect, split);
      g.fillStyle = ok;
      g.fillRect(ax.X(0), ax.Y(U), ax.X(tNow) - ax.X(0), ax.Y(0) - ax.Y(U));
      g.restore();

      // triangle (1/2)a t^2
      g.save();
      g.globalAlpha = 0.28 * Math.max(showTri, split);
      g.fillStyle = accent;
      g.beginPath();
      g.moveTo(ax.X(0), ax.Y(U));
      g.lineTo(ax.X(tNow), ax.Y(U));
      g.lineTo(ax.X(tNow), ax.Y(V(tNow)));
      g.closePath();
      g.fill();
      g.restore();

      // the splitting line at v = u
      g.save();
      g.globalAlpha = split;
      c2d.line(g, ax.X(0), ax.Y(U), ax.X(tNow), ax.Y(U), { color: cssVar('--ink-2'), width: 1.6, dash: [5, 4] });
      g.restore();
    }

    /* ---- labels on the two pieces ---- */
    if (showRect > 0 && tNow > 1) {
      g.save();
      g.globalAlpha = showRect;
      const cx = (ax.X(0) + ax.X(tNow)) / 2;
      const cy = (ax.Y(U) + ax.Y(0)) / 2;
      c2d.text(g, 'u t', cx, cy - 7, { size: 15, weight: 900, color: ok });
      c2d.text(g, `= ${(U * tNow).toFixed(1)} m`, cx, cy + 11, { size: 10, weight: 700, color: ok });
      g.restore();
    }
    if (showTri > 0 && tNow > 1) {
      g.save();
      g.globalAlpha = showTri;
      const cx = ax.X(0) + (ax.X(tNow) - ax.X(0)) * 0.68;
      const cy = ax.Y(U) - (ax.Y(U) - ax.Y(V(tNow))) * 0.32;
      c2d.text(g, '½ a t²', cx, cy - 7, { size: 14, weight: 900, color: accent });
      c2d.text(g, `= ${(0.5 * A * tNow * tNow).toFixed(1)} m`, cx, cy + 11, { size: 10, weight: 700, color: accent });
      g.restore();
    }

    /* ---- dimension marks ---- */
    if (during(t, 0.5, 0.86) && tNow > 1) {
      g.save();
      g.globalAlpha = 0.8;
      // height u
      c2d.line(g, ax.X(0) - 10, ax.Y(0), ax.X(0) - 10, ax.Y(U), { color: ok, width: 1.4 });
      c2d.text(g, 'u', ax.X(0) - 20, (ax.Y(0) + ax.Y(U)) / 2, { size: 11, weight: 800, color: ok });
      // height at
      c2d.line(g, ax.X(tNow) + 10, ax.Y(U), ax.X(tNow) + 10, ax.Y(V(tNow)), { color: accent, width: 1.4 });
      c2d.text(g, 'at', ax.X(tNow) + 22, (ax.Y(U) + ax.Y(V(tNow))) / 2, { size: 11, weight: 800, color: accent });
      g.restore();
    }

    /* ---- moving marker ---- */
    g.fillStyle = hue;
    g.beginPath(); g.arc(ax.X(tNow), ax.Y(V(tNow)), 5.5, 0, Math.PI * 2); g.fill();
    g.strokeStyle = cssVar('--bg-2'); g.lineWidth = 2; g.stroke();

    /* ---- readout ---- */
    const s = U * tNow + 0.5 * A * tNow * tNow;
    readout(g, 56, 14, [
      `t = ${tNow.toFixed(2)} s`,
      `v = ${V(tNow).toFixed(1)} m/s`,
      `s = ${s.toFixed(1)} m`
    ], { hue });

    /* ---- the result ---- */
    if (t > 0.84) {
      g.save();
      g.globalAlpha = phase(t, 0.84, 0.92);
      const y = h - 16;
      g.fillStyle = cssVar('--bg-2');
      c2d.roundRect(g, w / 2 - 150, y - 17, 300, 30, 8); g.fill();
      g.strokeStyle = hue; g.lineWidth = 1; g.stroke();
      c2d.text(g, 's  =  u t  +  ½ a t²', w / 2, y - 1,
        { size: 15, weight: 900, color: hue });
      g.restore();
    }
  }
};
