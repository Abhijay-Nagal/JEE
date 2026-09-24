/**
 * The Argand plane: modulus is a length, argument is an angle, conjugate is a
 * reflection.
 *
 * These three facts are usually three separate definitions. Drawn on one
 * diagram they are one picture, and |z|^2 = z*zbar stops needing proof.
 */

import { cssVar, c2d, phase, lerp, ease, readout } from '../kit.js';

const RE = 3, IM = 4;     // the point 3 + 4i - chosen because |z| = 5 exactly

export default {
  id: 'argandPlane',
  title: 'Modulus, argument and conjugate on one diagram',
  caption: 'A complex number is a point. Its modulus is how far, its argument is which way.',
  duration: 19,
  loop: true,
  height: 320,
  stillAt: 0.74,

  steps: [
    { at: 0.00, text: 'Plot $z = 3 + 4i$ by treating the real part as $x$ and the imaginary part as $y$.' },
    { at: 0.14, text: 'The distance from the origin is the **modulus**: $|z| = \\sqrt{3^2 + 4^2} = 5$.' },
    { at: 0.28, text: 'That is just Pythagoras. $|z| = \\sqrt{x^2+y^2}$ is the distance formula wearing a different name.' },
    { at: 0.42, text: 'The angle from the positive real axis is the **argument**: $\\arg z = \\tan^{-1}\\dfrac{4}{3} \\approx 53.1^\\circ$.' },
    { at: 0.56, text: 'Reflecting in the real axis gives the **conjugate** $\\bar{z} = 3 - 4i$: same modulus, opposite argument.' },
    { at: 0.70, text: 'Multiply them: $z\\bar{z} = (3+4i)(3-4i) = 9 + 16 = 25 = |z|^2$. The $i$ terms always cancel.' },
    { at: 0.84, text: 'So $z\\bar{z} = |z|^2$ is not a formula to memorise — it is Pythagoras again, written with complex numbers.' }
  ],

  draw(g, w, h, t) {
    const hue = cssVar('--maths');
    const ink = cssVar('--ink-4');
    const accent = cssVar('--accent');
    const ok = cssVar('--ok');

    const cx = w * 0.38, cy = h * 0.56;
    const U = Math.min(w * 0.072, h * 0.108);     // one unit, in pixels

    const X = (x) => cx + x * U;
    const Y = (y) => cy - y * U;

    /* ---- grid ---- */
    g.save();
    g.strokeStyle = cssVar('--chart-grid');
    g.lineWidth = 1;
    for (let i = -5; i <= 5; i++) {
      g.beginPath(); g.moveTo(X(i), Y(-5)); g.lineTo(X(i), Y(5)); g.stroke();
      g.beginPath(); g.moveTo(X(-5), Y(i)); g.lineTo(X(5), Y(i)); g.stroke();
    }
    g.restore();

    c2d.line(g, X(-5), Y(0), X(5), Y(0), { color: cssVar('--chart-ink'), width: 1.5 });
    c2d.line(g, X(0), Y(-5), X(0), Y(5), { color: cssVar('--chart-ink'), width: 1.5 });
    c2d.text(g, 'Re', X(5) + 4, Y(0) - 10, { size: 9, weight: 700, color: ink, align: 'left' });
    c2d.text(g, 'Im', X(0) + 8, Y(5) - 2, { size: 9, weight: 700, color: ink, align: 'left' });
    for (const v of [-4, -2, 2, 4]) {
      c2d.text(g, String(v), X(v), Y(0) + 11, { size: 8, color: ink });
      c2d.text(g, `${v}i`, X(0) - 8, Y(v), { size: 8, color: ink, align: 'right' });
    }

    /* ---- the point z ---- */
    const drop = phase(t, 0.02, 0.14, ease.out);
    const px = X(RE), py = Y(IM * drop);
    if (drop > 0) {
      // the two components, drawn as legs of the triangle
      if (t > 0.14) {
        const leg = phase(t, 0.14, 0.26, ease.out);
        c2d.line(g, X(0), Y(0), X(RE * leg), Y(0), { color: cssVar('--chart-1'), width: 2.6 });
        c2d.line(g, X(RE), Y(0), X(RE), Y(IM * Math.max(0, (leg - 0.5) * 2)),
          { color: cssVar('--chart-3'), width: 2.6 });
        if (leg > 0.6) {
          c2d.text(g, '3', X(RE / 2), Y(0) + 14, { size: 11, weight: 800, color: cssVar('--chart-1') });
          c2d.text(g, '4', X(RE) + 12, Y(IM / 2), { size: 11, weight: 800, color: cssVar('--chart-3') });
        }
      }

      // the modulus
      if (t > 0.20) {
        c2d.line(g, X(0), Y(0), px, Y(IM), { color: hue, width: 2.8 });
        if (t > 0.26) {
          c2d.text(g, '|z| = 5', X(RE / 2) - 22, Y(IM / 2) - 12,
            { size: 12, weight: 900, color: hue });
        }
      }

      // the argument arc
      if (t > 0.40) {
        const a = phase(t, 0.40, 0.52, ease.out);
        g.save();
        g.strokeStyle = accent; g.lineWidth = 2.4;
        g.beginPath();
        g.arc(X(0), Y(0), U * 1.5, 0, -Math.atan2(IM, RE) * a, true);
        g.stroke();
        g.restore();
        if (a > 0.7) {
          c2d.text(g, 'θ ≈ 53.1°', X(0) + U * 2.0, Y(0) - U * 0.55,
            { size: 11, weight: 800, color: accent, align: 'left' });
        }
      }

      g.fillStyle = hue;
      g.beginPath(); g.arc(px, py, 7, 0, Math.PI * 2); g.fill();
      g.strokeStyle = cssVar('--bg-1'); g.lineWidth = 2; g.stroke();
      c2d.text(g, 'z = 3 + 4i', px + 14, py - 12, { size: 12, weight: 900, color: hue, align: 'left' });
    }

    /* ---- the conjugate ---- */
    if (t > 0.54) {
      const a = phase(t, 0.54, 0.66, ease.out);
      const qy = Y(-IM * a);
      g.save();
      g.globalAlpha = a;
      c2d.line(g, X(0), Y(0), X(RE), Y(-IM), { color: ok, width: 2.4, dash: [5, 4] });
      g.fillStyle = ok;
      g.beginPath(); g.arc(X(RE), qy, 6.5, 0, Math.PI * 2); g.fill();
      c2d.text(g, 'z̄ = 3 − 4i', X(RE) + 14, qy + 12,
        { size: 12, weight: 900, color: ok, align: 'left' });
      // the mirror line
      c2d.line(g, X(RE), Y(IM), X(RE), Y(-IM), { color: ok, width: 1, dash: [2, 4] });
      g.restore();
    }

    /* ---- the product ---- */
    if (t > 0.68) {
      const a = phase(t, 0.68, 0.80);
      g.save();
      g.globalAlpha = a;
      const bx = w * 0.78, by = h * 0.34;
      g.fillStyle = cssVar('--bg-2');
      c2d.roundRect(g, bx - 96, by - 46, 192, 92, 9); g.fill();
      g.strokeStyle = hue; g.lineWidth = 1.2; g.stroke();
      c2d.text(g, 'z · z̄', bx, by - 30, { size: 12, weight: 800, color: ink });
      c2d.text(g, '(3+4i)(3−4i)', bx, by - 10, { size: 12, weight: 800, color: cssVar('--ink-2') });
      c2d.text(g, '= 9 − 16i²', bx, by + 8, { size: 12, weight: 800, color: cssVar('--ink-2') });
      c2d.text(g, '= 25 = |z|²', bx, by + 28, { size: 14, weight: 900, color: ok });
      g.restore();
    }

    readout(g, 14, 14, [
      'z  = 3 + 4i',
      '|z| = 5',
      'arg = 53.13°'
    ], { hue });
  }
};
