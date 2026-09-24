/**
 * De Morgan's first law, shaded.
 *
 * (A u B)' = A' n B' is a sentence students memorise and then apply backwards
 * under pressure. Shading both sides side by side, one step at a time, turns
 * it from a rule into something obviously true.
 */

import { cssVar, c2d, phase, during, ease } from '../kit.js';

export default {
  id: 'deMorgan',
  title: 'De Morgan’s law, shaded',
  caption: 'Complementing a union flips it into an intersection. Watch the two sides land on the same region.',
  duration: 16,
  loop: true,
  height: 300,
  stillAt: 0.95,

  steps: [
    { at: 0.00, text: 'Two sets inside a universe $U$. We will shade $(A \\cup B)\'$ on the left and $A\' \\cap B\'$ on the right.' },
    { at: 0.12, text: 'Left: first shade $A \\cup B$ — everything in at least one circle.' },
    { at: 0.26, text: 'Now take its complement: shade everything **outside**, and clear the inside.' },
    { at: 0.40, text: 'Right: shade $A\'$ — the whole universe except $A$.' },
    { at: 0.54, text: 'Then shade $B\'$ on top of it.' },
    { at: 0.68, text: 'Keep only the **overlap** — the region shaded by both. That is $A\' \\cap B\'$.' },
    { at: 0.82, text: 'The two results are the same region. That *is* the proof: $(A \\cup B)\' = A\' \\cap B\'$.' },
    { at: 0.92, text: 'Read it aloud and it is obvious: to be outside "A or B", you must dodge **both**.' }
  ],

  draw(g, w, h, t) {
    const hue = cssVar('--maths');
    const ink = cssVar('--ink-2');
    const line = cssVar('--line');

    const boxW = Math.min(w * 0.44, 300);
    const boxH = 150;
    const topY = 46;
    const leftX = w * 0.26 - boxW / 2;
    const rightX = w * 0.74 - boxW / 2;

    panel(g, leftX, topY, boxW, boxH, '(A ∪ B)′', hue, ink, line, (ctx) => {
      // union appears, then inverts
      const uni = phase(t, 0.12, 0.24, ease.out);
      const inv = phase(t, 0.26, 0.38, ease.inOut);
      if (uni > 0 && inv < 1) {
        ctx.shadeRegion((a, b) => a || b, hue, uni * (1 - inv) * 0.5);
      }
      if (inv > 0) {
        ctx.shadeRegion((a, b) => !a && !b, hue, inv * 0.5);
      }
    });

    panel(g, rightX, topY, boxW, boxH, 'A′ ∩ B′', hue, ink, line, (ctx) => {
      const na = phase(t, 0.40, 0.50, ease.out);
      const nb = phase(t, 0.54, 0.64, ease.out);
      const keep = phase(t, 0.68, 0.78, ease.inOut);

      if (na > 0 && keep < 1) ctx.shadeRegion((a) => !a, hue, na * (1 - keep) * 0.34);
      if (nb > 0 && keep < 1) ctx.shadeRegion((a, b) => !b, cssVar('--chart-2'), nb * (1 - keep) * 0.34);
      if (keep > 0) ctx.shadeRegion((a, b) => !a && !b, hue, keep * 0.5);
    });

    /* ---- the verdict ---- */
    if (t > 0.82) {
      const a = phase(t, 0.82, 0.9);
      g.save();
      g.globalAlpha = a;
      const y = topY + boxH + 46;
      g.strokeStyle = cssVar('--ok');
      g.lineWidth = 2;
      g.setLineDash([6, 4]);
      g.beginPath();
      g.moveTo(leftX + boxW / 2, topY + boxH + 8);
      g.lineTo(leftX + boxW / 2, y - 14);
      g.lineTo(rightX + boxW / 2, y - 14);
      g.lineTo(rightX + boxW / 2, topY + boxH + 8);
      g.stroke();
      g.setLineDash([]);
      c2d.text(g, 'same region', w / 2, y - 24, { size: 11, weight: 800, color: cssVar('--ok') });

      g.fillStyle = cssVar('--bg-2');
      c2d.roundRect(g, w / 2 - 138, y - 4, 276, 32, 9);
      g.fill();
      g.strokeStyle = cssVar('--ok'); g.lineWidth = 1; g.stroke();
      c2d.text(g, '(A ∪ B)′  =  A′ ∩ B′', w / 2, y + 12,
        { size: 15, weight: 800, color: cssVar('--ok') });
      g.restore();
    }
  }
};

/**
 * Draw one universe box with two circles and hand the body a `shadeRegion`
 * helper that fills exactly the cells matching a membership predicate.
 */
function panel(g, x, y, w, h, label, hue, ink, line, body) {
  const A = { x: x + w * 0.38, y: y + h * 0.5, r: Math.min(w, h) * 0.30 };
  const B = { x: x + w * 0.62, y: y + h * 0.5, r: Math.min(w, h) * 0.30 };

  g.save();
  g.strokeStyle = line;
  g.lineWidth = 1.4;
  c2d.roundRect(g, x, y, w, h, 8);
  g.stroke();
  g.restore();

  /**
   * Fill exactly the cells whose (inA, inB) membership satisfies `pred`.
   *
   * Each of the four cells is built on its own layer: clip to the circles it
   * is inside, fill, then erase the circles it must be outside of. Compositing
   * the accepted layers together gives the region with no seams and no
   * double-darkened overlaps.
   */
  const shadeRegion = (pred, colour, alpha) => {
    if (alpha <= 0) return;
    const W = Math.ceil(w), H = Math.ceil(h);
    const ax = A.x - x, ay = A.y - y, bx = B.x - x, by = B.y - y;

    const out = document.createElement('canvas');
    out.width = W; out.height = H;
    const o = out.getContext('2d');

    const layer = document.createElement('canvas');
    layer.width = W; layer.height = H;
    const l = layer.getContext('2d');

    const circle = (c, cx, cy, r) => { c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); };

    for (const [inA, inB] of [[false, false], [true, false], [false, true], [true, true]]) {
      if (!pred(inA, inB)) continue;

      l.clearRect(0, 0, W, H);
      l.globalCompositeOperation = 'source-over';
      l.save();
      if (inA) { circle(l, ax, ay, A.r); l.clip(); }
      if (inB) { circle(l, bx, by, B.r); l.clip(); }
      l.fillStyle = colour;
      l.fillRect(0, 0, W, H);
      l.restore();

      l.globalCompositeOperation = 'destination-out';
      if (!inA) { circle(l, ax, ay, A.r); l.fill(); }
      if (!inB) { circle(l, bx, by, B.r); l.fill(); }

      o.drawImage(layer, 0, 0);
    }

    g.save();
    g.globalAlpha = alpha;
    g.beginPath();
    c2d.roundRect(g, x, y, w, h, 8);
    g.clip();
    g.drawImage(out, x, y);
    g.restore();
  };

  body({ shadeRegion });

  // circles and labels on top
  g.save();
  g.strokeStyle = cssVar('--ink-3');
  g.lineWidth = 1.8;
  g.beginPath(); g.arc(A.x, A.y, A.r, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.arc(B.x, B.y, B.r, 0, Math.PI * 2); g.stroke();
  g.restore();

  c2d.text(g, 'A', A.x - A.r * 0.72, A.y - A.r * 0.72, { size: 14, weight: 800, color: ink });
  c2d.text(g, 'B', B.x + B.r * 0.72, B.y - B.r * 0.72, { size: 14, weight: 800, color: ink });
  c2d.text(g, 'U', x + w - 14, y + 14, { size: 11, weight: 800, color: cssVar('--ink-4') });
  c2d.text(g, label, x + w / 2, y - 14, { size: 13, weight: 800, color: hue });
}
