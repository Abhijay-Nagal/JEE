/**
 * Vieta's relations, built by expanding the factorised form.
 *
 * -b/a and c/a are two formulas that look arbitrary. Expanding a(x - p)(x - q)
 * side by side with ax^2 + bx + c makes them the only possible answer, and the
 * expansion is short enough to watch term by term.
 */

import { cssVar, c2d, axes, curve, phase, lerp, ease, readout } from '../kit.js';

/** 2x^2 - 10x + 12 = 2(x - 2)(x - 3): sum 5, product 6. */
const A = 2, P = 2, Q = 3;
const B = -A * (P + Q);      // -10
const C = A * P * Q;         //  12

export default {
  id: 'sumProductRoots',
  title: 'Where −b/a and c/a come from',
  caption: 'Expand the factorised form and the two relations fall out of matching coefficients.',
  duration: 20,
  loop: true,
  height: 320,
  stillAt: 0.76,

  steps: [
    { at: 0.00, text: 'A quadratic with roots $p$ and $q$ must factorise as $a(x-p)(x-q)$ — that is what "root" means.' },
    { at: 0.12, text: 'Here $2x^2 - 10x + 12 = 2(x-2)(x-3)$, so the roots are $2$ and $3$.' },
    { at: 0.26, text: 'Expand the brackets: $(x-p)(x-q) = x^2 - (p+q)x + pq$.' },
    { at: 0.40, text: 'Multiply by $a$: $ax^2 - a(p+q)x + apq$.' },
    { at: 0.54, text: 'Match this against $ax^2 + bx + c$ term by term. The $x$ coefficients give $b = -a(p+q)$.' },
    { at: 0.66, text: 'So $p + q = -\\dfrac{b}{a} = \\dfrac{10}{2} = 5$. Check: $2 + 3 = 5$. ✓' },
    { at: 0.78, text: 'The constants give $c = apq$, so $pq = \\dfrac{c}{a} = \\dfrac{12}{2} = 6$. Check: $2 \\times 3 = 6$. ✓' },
    { at: 0.90, text: 'Reversing it builds a quadratic from its roots: $x^2 - (\\text{sum})x + (\\text{product}) = 0$.' }
  ],

  draw(g, w, h, t) {
    const hue = cssVar('--maths');
    const ok = cssVar('--ok');
    const accent = cssVar('--accent');
    const c1 = cssVar('--chart-1');
    const c3 = cssVar('--chart-3');

    /* ================= left: the curve ================= */
    const plotW = w * 0.46;
    const ax = axes(g, plotW, h - 30, {
      xmin: 0.5, xmax: 4.5, ymin: -1.5, ymax: 5,
      xlabel: 'x', ylabel: 'y',
      xticks: 4, yticks: 4,
      fmtX: (v) => (Math.abs(v - Math.round(v)) < 0.01 ? String(Math.round(v)) : ''),
      fmtY: (v) => (Math.abs(v - Math.round(v)) < 0.01 ? String(Math.round(v)) : '')
    });

    const f = (x) => A * x * x + B * x + C;
    curve(g, ax, f, 0.5, 4.5, { color: hue, width: 2.8 });

    for (const [r, colour] of [[P, c1], [Q, c3]]) {
      g.fillStyle = colour;
      g.beginPath(); g.arc(ax.X(r), ax.Y(0), 6.5, 0, Math.PI * 2); g.fill();
      g.strokeStyle = cssVar('--bg-1'); g.lineWidth = 2; g.stroke();
      c2d.text(g, String(r), ax.X(r), ax.Y(0) + 20, { size: 12, weight: 900, color: colour });
    }

    // sum: the midpoint is the vertex
    if (t > 0.62) {
      g.save();
      g.globalAlpha = phase(t, 0.62, 0.72);
      const mid = (P + Q) / 2;
      c2d.line(g, ax.X(P), ax.Y(-1.0), ax.X(Q), ax.Y(-1.0), { color: ok, width: 2.2 });
      c2d.text(g, `2 + 3 = 5`, ax.X(mid), ax.Y(-1.35), { size: 11, weight: 900, color: ok });
      g.restore();
    }

    /* ================= right: the expansion ================= */
    const bx = w * 0.74;
    const lines = [
      { at: 0.10, text: '2x² − 10x + 12', sub: 'the quadratic', colour: hue },
      { at: 0.16, text: '= 2(x − 2)(x − 3)', sub: 'factorised', colour: hue },
      { at: 0.28, text: '(x−p)(x−q) = x² − (p+q)x + pq', sub: 'expand', colour: cssVar('--ink-2') },
      { at: 0.42, text: 'a(…) = ax² − a(p+q)x + apq', sub: 'times a', colour: cssVar('--ink-2') },
      { at: 0.56, text: 'match:  b = −a(p+q),  c = apq', sub: 'coefficients', colour: accent }
    ];

    lines.forEach((ln, i) => {
      if (t < ln.at) return;
      g.save();
      g.globalAlpha = phase(t, ln.at, ln.at + 0.06);
      const y = 40 + i * 40;
      c2d.text(g, ln.text, bx, y, { size: 13, weight: 900, color: ln.colour, font: 'mono' });
      c2d.text(g, ln.sub, bx, y + 15, { size: 9, weight: 700, color: cssVar('--ink-4') });
      g.restore();
    });

    /* ---- the two results ---- */
    const results = [
      { at: 0.66, label: 'p + q = −b/a', value: '= 10/2 = 5', colour: ok },
      { at: 0.78, label: 'p q = c/a', value: '= 12/2 = 6', colour: accent }
    ];
    results.forEach((r, i) => {
      if (t < r.at) return;
      g.save();
      g.globalAlpha = phase(t, r.at, r.at + 0.07);
      const y = h - 104 + i * 44;
      g.fillStyle = cssVar('--bg-2');
      c2d.roundRect(g, bx - 110, y - 17, 220, 36, 8); g.fill();
      g.strokeStyle = r.colour; g.lineWidth = 1.5; g.stroke();
      c2d.text(g, r.label, bx - 48, y, { size: 13, weight: 900, color: r.colour });
      c2d.text(g, r.value, bx + 50, y, { size: 12, weight: 800, color: cssVar('--ink-2'), font: 'mono' });
      g.restore();
    });

    /* ---- the reverse construction ---- */
    if (t > 0.90) {
      g.save();
      g.globalAlpha = phase(t, 0.90, 0.97);
      g.fillStyle = cssVar('--bg-2');
      c2d.roundRect(g, w / 2 - 170, h - 34, 340, 28, 8); g.fill();
      g.strokeStyle = hue; g.lineWidth = 1.3; g.stroke();
      c2d.text(g, 'x² − (sum)x + (product) = 0', w / 2, h - 20,
        { size: 13, weight: 900, color: hue });
      g.restore();
    }

    readout(g, 14, 14, [
      'roots  2, 3',
      'sum     5',
      'product 6'
    ], { hue });
  }
};
