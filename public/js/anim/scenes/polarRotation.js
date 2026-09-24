/**
 * Multiplication of complex numbers = multiply the moduli, add the arguments.
 *
 * In cartesian form multiplication looks like four terms and a sign trick. In
 * polar form it is a stretch and a turn, and De Moivre's theorem becomes the
 * obvious consequence of doing the same turn n times.
 */

import { cssVar, c2d, phase, lerp, ease, readout } from '../kit.js';

/** z1 = 2 cis 30 deg, z2 = 1.5 cis 45 deg - product 3 cis 75 deg. */
const Z1 = { r: 2, a: 30 };
const Z2 = { r: 1.5, a: 45 };

export default {
  id: 'polarRotation',
  title: 'Multiply the moduli, add the arguments',
  caption: 'Multiplication by a complex number is a stretch and a rotation — nothing more.',
  duration: 20,
  loop: true,
  height: 320,
  stillAt: 0.66,

  steps: [
    { at: 0.00, text: 'Write each number in polar form: $z = r(\\cos\\theta + i\\sin\\theta)$, often shortened to $r\\,\\text{cis}\\,\\theta$.' },
    { at: 0.12, text: '$z_1 = 2\\,\\text{cis}\\,30^\\circ$ — a length of 2, at $30^\\circ$.' },
    { at: 0.24, text: '$z_2 = 1.5\\,\\text{cis}\\,45^\\circ$ — a length of 1.5, at $45^\\circ$.' },
    { at: 0.36, text: 'Now multiply. The moduli **multiply**: $2 \\times 1.5 = 3$.' },
    { at: 0.48, text: 'And the arguments **add**: $30^\\circ + 45^\\circ = 75^\\circ$.' },
    { at: 0.60, text: 'So $z_1 z_2 = 3\\,\\text{cis}\\,75^\\circ$. Multiplying by $z_2$ stretched $z_1$ by 1.5 and turned it by $45^\\circ$.' },
    { at: 0.74, text: 'Multiplying a number by itself $n$ times therefore does the same turn $n$ times over.' },
    { at: 0.86, text: 'That is **De Moivre**: $(r\\,\\text{cis}\\,\\theta)^n = r^n\\,\\text{cis}\\,n\\theta$. One line, and it is already proved.' }
  ],

  draw(g, w, h, t) {
    const hue = cssVar('--maths');
    const ink = cssVar('--ink-4');
    const c1 = cssVar('--chart-1');
    const c3 = cssVar('--chart-3');
    const ok = cssVar('--ok');

    const cx = w * 0.36, cy = h * 0.60;
    const U = Math.min(w * 0.085, h * 0.16);

    /* ---- axes ---- */
    c2d.line(g, cx - U * 1.2, cy, cx + U * 3.6, cy, { color: cssVar('--chart-ink'), width: 1.4 });
    c2d.line(g, cx, cy + U * 0.9, cx, cy - U * 3.4, { color: cssVar('--chart-ink'), width: 1.4 });
    c2d.text(g, 'Re', cx + U * 3.6 + 4, cy - 10, { size: 9, weight: 700, color: ink, align: 'left' });
    c2d.text(g, 'Im', cx + 8, cy - U * 3.4, { size: 9, weight: 700, color: ink, align: 'left' });

    for (let r = 1; r <= 3; r++) {
      g.save();
      g.strokeStyle = cssVar('--chart-grid'); g.lineWidth = 1;
      g.setLineDash([2, 4]);
      g.beginPath(); g.arc(cx, cy, U * r, 0, Math.PI * 2); g.stroke();
      g.restore();
    }

    const draw = (r, degs, colour, label, width = 2.6, dx = 10, dy = -10) => {
      const a = (degs * Math.PI) / 180;
      const x = cx + Math.cos(a) * U * r;
      const y = cy - Math.sin(a) * U * r;
      c2d.line(g, cx, cy, x, y, { color: colour, width });
      g.fillStyle = colour;
      g.beginPath(); g.arc(x, y, 5.5, 0, Math.PI * 2); g.fill();
      if (label) {
        c2d.text(g, label, x + dx, y + dy,
          { size: 12, weight: 900, color: colour, align: dx < 0 ? 'right' : 'left' });
      }
      return { x, y };
    };

    const arc = (r, from, to, colour) => {
      g.save();
      g.strokeStyle = colour; g.lineWidth = 2.2;
      g.beginPath();
      g.arc(cx, cy, U * r, -(from * Math.PI) / 180, -(to * Math.PI) / 180, true);
      g.stroke();
      g.restore();
    };

    /* ---- z1 ---- */
    const in1 = phase(t, 0.08, 0.20, ease.out);
    if (in1 > 0) {
      draw(Z1.r * in1, Z1.a, c1, in1 > 0.8 ? 'z₁' : null, 2.6, -10, -12);
      arc(0.55, 0, Z1.a * in1, c1);
    }

    /* ---- z2 ---- */
    const in2 = phase(t, 0.20, 0.32, ease.out);
    if (in2 > 0) {
      draw(Z2.r * in2, Z2.a, c3, in2 > 0.8 ? 'z₂' : null, 2.6, 12, 12);
      arc(0.8, 0, Z2.a * in2, c3);
    }

    /* ---- the product, built in two visible moves ---- */
    if (t > 0.34) {
      // first the stretch, then the turn - so the two rules are separable
      const stretch = phase(t, 0.36, 0.48, ease.inOut);
      const turn = phase(t, 0.48, 0.62, ease.inOut);
      const r = lerp(Z1.r, Z1.r * Z2.r, stretch);
      const a = lerp(Z1.a, Z1.a + Z2.a, turn);
      draw(r, a, ok, turn > 0.9 ? 'z₁z₂' : null, 3.2, 12, -14);
      if (turn > 0.05) arc(1.1, Z1.a, a, ok);

      // Below the real axis, where nothing else is drawn - the top of the
      // diagram is already crowded by the three vector tips.
      c2d.text(g,
        turn > 0.05 ? `turning by ${(a - Z1.a).toFixed(0)}°` : `stretching × ${(r / Z1.r).toFixed(2)}`,
        cx + U * 0.6, cy + U * 1.35,
        { size: 12, weight: 800, color: ok });
    }

    /* ---- the arithmetic, on the right ---- */
    const bx = w * 0.79;
    const rows = [
      { at: 0.36, text: 'moduli   2 × 1.5 = 3', colour: c1 },
      { at: 0.48, text: 'args     30° + 45° = 75°', colour: c3 },
      { at: 0.60, text: 'z₁z₂ = 3 cis 75°', colour: ok }
    ];
    rows.forEach((row, i) => {
      if (t < row.at) return;
      const a = phase(t, row.at, row.at + 0.08);
      g.save();
      g.globalAlpha = a;
      const y = h * 0.26 + i * 34;
      g.fillStyle = cssVar('--bg-2');
      c2d.roundRect(g, bx - 100, y - 14, 200, 28, 6); g.fill();
      g.strokeStyle = row.colour; g.lineWidth = 1.2; g.stroke();
      c2d.text(g, row.text, bx, y, { size: 12, weight: 900, color: row.colour, font: 'mono' });
      g.restore();
    });

    /* ---- De Moivre ---- */
    if (t > 0.76) {
      const a = phase(t, 0.76, 0.88);
      g.save();
      g.globalAlpha = a;
      g.fillStyle = cssVar('--bg-2');
      c2d.roundRect(g, w / 2 - 150, h - 40, 300, 30, 8); g.fill();
      g.strokeStyle = hue; g.lineWidth = 1.4; g.stroke();
      c2d.text(g, '(r cis θ)ⁿ  =  rⁿ cis nθ', w / 2, h - 25,
        { size: 14, weight: 900, color: hue });
      g.restore();
    }

    readout(g, 14, 14, [
      'z₁ = 2 cis 30°',
      'z₂ = 1.5 cis 45°'
    ], { hue });
  }
};
