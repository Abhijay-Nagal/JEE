/**
 * The discriminant, seen as the parabola sliding through the x-axis.
 *
 * D > 0, D = 0, D < 0 is three cases to memorise until you watch one parabola
 * move: the roots are where it crosses, they merge as it touches, and they
 * become complex the instant it lifts clear.
 */

import { cssVar, c2d, axes, curve, phase, lerp, ease, readout } from '../kit.js';

/** x^2 - 4x + c, so D = 16 - 4c: two roots, one root, none, as c passes 4. */
const A = 1, B = -4;

export default {
  id: 'discriminantParabola',
  title: 'What the discriminant is actually telling you',
  caption: '$D = b^2 - 4ac$ measures how far the parabola reaches below the axis.',
  duration: 20,
  loop: true,
  height: 320,
  stillAt: 0.46,

  steps: [
    { at: 0.00, text: 'Take $y = x^2 - 4x + c$ and slide $c$ upward. The shape never changes — only its height.' },
    { at: 0.10, text: 'With $c = 0$ the curve cuts the axis twice. Two real, distinct roots, and $D = 16 > 0$.' },
    { at: 0.28, text: 'As $c$ grows the curve rises and the two crossings move toward each other.' },
    { at: 0.44, text: 'At $c = 4$ they meet. One repeated root at $x = 2$, and $D = 16 - 16 = 0$ exactly.' },
    { at: 0.58, text: 'Push a little further and the parabola lifts clear of the axis. No real crossings at all.' },
    { at: 0.72, text: '$D < 0$ now, and the roots are a **conjugate pair** — they did not vanish, they left the real line.' },
    { at: 0.84, text: 'The vertex sits at $x = -\\dfrac{b}{2a} = 2$ throughout. The roots are always symmetric about it.' },
    { at: 0.92, text: 'So $D$ is the one number that decides the case: positive, zero, negative — two, one, none.' }
  ],

  draw(g, w, h, t) {
    const hue = cssVar('--maths');
    const ok = cssVar('--ok');
    const bad = cssVar('--bad');
    const accent = cssVar('--accent');

    // c sweeps 0 -> 4 -> 7
    const c = t < 0.50 ? lerp(0, 4, phase(t, 0.06, 0.46, ease.inOut))
                       : lerp(4, 7, phase(t, 0.52, 0.76, ease.inOut));
    const D = B * B - 4 * A * c;

    const plotW = w * 0.62;
    const ax = axes(g, plotW, h - 40, {
      xmin: -1.5, xmax: 5.5, ymin: -5, ymax: 9,
      xlabel: 'x', ylabel: 'y',
      xticks: 7, yticks: 7,
      fmtX: (v) => (Math.abs(v - Math.round(v)) < 0.01 ? String(Math.round(v)) : ''),
      fmtY: (v) => (Math.abs(v - Math.round(v)) < 0.01 ? String(Math.round(v)) : '')
    });

    const f = (x) => A * x * x + B * x + c;

    /* ---- the parabola ---- */
    curve(g, ax, f, -1.5, 5.5, { color: hue, width: 2.8 });

    /* ---- the roots ---- */
    if (D >= 0) {
      const r = Math.sqrt(D) / (2 * A);
      const x1 = -B / (2 * A) - r, x2 = -B / (2 * A) + r;
      const colour = D < 0.25 ? accent : ok;
      for (const x of D < 1e-6 ? [x1] : [x1, x2]) {
        g.fillStyle = colour;
        g.beginPath(); g.arc(ax.X(x), ax.Y(0), 6.5, 0, Math.PI * 2); g.fill();
        g.strokeStyle = cssVar('--bg-1'); g.lineWidth = 2; g.stroke();
        c2d.text(g, x.toFixed(2), ax.X(x), ax.Y(0) + 20,
          { size: 10, weight: 800, color: colour });
      }
      if (D > 0.25) {
        // the gap between them is sqrt(D)/a
        c2d.line(g, ax.X(x1), ax.Y(-1.4), ax.X(x2), ax.Y(-1.4),
          { color: ok, width: 2 });
        c2d.text(g, `gap = √D / a = ${(x2 - x1).toFixed(2)}`,
          ax.X((x1 + x2) / 2), ax.Y(-2.1), { size: 10, weight: 800, color: ok });
      }
    } else {
      // the parabola's lowest point, floating above the axis
      const vy = f(2);
      c2d.line(g, ax.X(2), ax.Y(0), ax.X(2), ax.Y(vy),
        { color: bad, width: 2, dash: [4, 4] });
      c2d.text(g, `clears the axis by ${vy.toFixed(2)}`, ax.X(2) + 10, ax.Y(vy / 2),
        { size: 10, weight: 800, color: bad, align: 'left' });
    }

    /* ---- the vertex ---- */
    g.fillStyle = accent;
    g.beginPath(); g.arc(ax.X(2), ax.Y(f(2)), 4.5, 0, Math.PI * 2); g.fill();
    if (t > 0.82) {
      g.save();
      g.globalAlpha = phase(t, 0.82, 0.90);
      c2d.line(g, ax.X(2), ax.Y(-5), ax.X(2), ax.Y(9), { color: accent, width: 1, dash: [3, 5] });
      c2d.text(g, 'x = −b/2a = 2', ax.X(2) + 8, ax.Y(8),
        { size: 10, weight: 800, color: accent, align: 'left' });
      g.restore();
    }

    /* ---- the panel ---- */
    const px = w * 0.82;
    const kind = D > 0.25 ? { s: 'D > 0', d: 'two real, distinct', colour: ok }
      : D > -0.25 ? { s: 'D = 0', d: 'one repeated root', colour: accent }
      : { s: 'D < 0', d: 'complex conjugates', colour: bad };

    g.fillStyle = cssVar('--bg-2');
    c2d.roundRect(g, px - 96, 30, 192, 132, 10); g.fill();
    g.strokeStyle = kind.colour; g.lineWidth = 1.6; g.stroke();

    c2d.text(g, `y = x² − 4x + ${c.toFixed(2)}`, px, 50,
      { size: 11, weight: 800, color: cssVar('--ink-2') });
    c2d.text(g, 'D = b² − 4ac', px, 72, { size: 10, weight: 700, color: cssVar('--ink-4') });
    c2d.text(g, `= 16 − ${(4 * c).toFixed(2)}`, px, 90,
      { size: 11, weight: 800, color: cssVar('--ink-2') });
    c2d.text(g, `D = ${D.toFixed(2)}`, px, 114, { size: 18, weight: 900, color: kind.colour });
    c2d.text(g, kind.s, px, 136, { size: 12, weight: 900, color: kind.colour });
    c2d.text(g, kind.d, px, 152, { size: 10, weight: 700, color: cssVar('--ink-3') });

    /* ---- the complex roots, once they leave the real line ---- */
    if (D < -0.25) {
      const im = Math.sqrt(-D) / (2 * A);
      g.save();
      g.globalAlpha = phase(t, 0.62, 0.72);
      g.fillStyle = cssVar('--bg-2');
      c2d.roundRect(g, px - 96, 172, 192, 44, 8); g.fill();
      g.strokeStyle = bad; g.lineWidth = 1.2; g.stroke();
      c2d.text(g, `x = 2 ± ${im.toFixed(2)}i`, px, 194, { size: 14, weight: 900, color: bad });
      g.restore();
    }

    // A two-line readout is 43px tall, so it is anchored by its top edge well
    // clear of the bottom of the canvas.
    readout(g, 14, h - 52, [
      `c = ${c.toFixed(2)}`,
      `D = ${D.toFixed(2)}`
    ], { hue: kind.colour });
  }
};
