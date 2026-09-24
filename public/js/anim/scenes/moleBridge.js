/**
 * The mole as a bridge between the balance and the particles.
 *
 * The scale gap is the thing students never internalise: 18 grams of water is
 * something you can hold, and it contains 6 x 10^23 molecules. This animation
 * weighs a sample, then zooms in until the particles are visible and counts
 * them out in moles.
 */

import { cssVar, c2d, phase, during, lerp, ease, readout } from '../kit.js';

const NA = 6.022e23;

export default {
  id: 'moleBridge',
  title: 'From the balance to the particles',
  caption: 'You cannot count molecules. You can weigh them — and the mole converts one into the other.',
  duration: 15,
  loop: true,
  height: 290,
  stillAt: 0.8,

  steps: [
    { at: 0.00, text: 'Put water on a balance until it reads **18.0 g**. That is a thing you can hold.' },
    { at: 0.18, text: 'Water’s molecular mass is 18 u, so its molar mass is $18\\ \\text{g mol}^{-1}$.' },
    { at: 0.32, text: '$n = \\dfrac{m}{M} = \\dfrac{18}{18} = 1$ mole. One single mole.' },
    { at: 0.46, text: 'Now zoom in. And keep zooming.' },
    { at: 0.62, text: 'That one mole contains $6.022\\times10^{23}$ molecules — Avogadro’s number, exactly, by definition.' },
    { at: 0.76, text: 'Each molecule has 3 atoms, so the sample holds $1.8\\times10^{24}$ atoms.' },
    { at: 0.88, text: 'The bridge always runs **through moles**. Grams never convert straight to particles.' }
  ],

  draw(g, w, h, t) {
    const hue = cssVar('--chemistry');
    const ink = cssVar('--ink-2');
    const accent = cssVar('--accent');

    /* ---- left: the balance ---- */
    const bx = w * 0.22;
    const balanceFade = 1 - phase(t, 0.50, 0.62);
    if (balanceFade > 0) {
      g.save();
      g.globalAlpha = balanceFade;

      const baseY = 168;
      g.fillStyle = cssVar('--line');
      c2d.roundRect(g, bx - 62, baseY, 124, 9, 4); g.fill();
      c2d.roundRect(g, bx - 34, baseY + 9, 68, 26, 5); g.fill();

      // beaker
      g.strokeStyle = cssVar('--ink-4'); g.lineWidth = 2.5;
      g.beginPath();
      g.moveTo(bx - 32, baseY - 68); g.lineTo(bx - 32, baseY - 4);
      g.lineTo(bx + 32, baseY - 4); g.lineTo(bx + 32, baseY - 68);
      g.stroke();

      const fill = phase(t, 0.02, 0.18, ease.out);
      g.save();
      g.beginPath(); g.rect(bx - 32, baseY - 68, 64, 64); g.clip();
      g.fillStyle = hue; g.globalAlpha = balanceFade * 0.55;
      g.fillRect(bx - 32, baseY - 4 - 54 * fill, 64, 54 * fill);
      g.restore();

      // digital display
      const shown = (18 * fill).toFixed(1);
      g.fillStyle = cssVar('--bg-0');
      c2d.roundRect(g, bx - 40, baseY + 14, 80, 18, 4); g.fill();
      c2d.text(g, `${shown} g`, bx, baseY + 23,
        { size: 12, weight: 800, font: 'mono', color: fill >= 1 ? cssVar('--ok') : ink });

      c2d.text(g, 'WATER', bx, baseY - 82, { size: 10, weight: 800, color: cssVar('--ink-4') });
      g.restore();
    }

    /* ---- the arithmetic ---- */
    if (during(t, 0.2, 0.62)) {
      const a = phase(t, 0.2, 0.28) * (1 - phase(t, 0.56, 0.62));
      g.save();
      g.globalAlpha = a;
      const mx = w * 0.53, my = 104;
      c2d.text(g, 'n = m / M', mx, my, { size: 15, weight: 800, color: hue });
      c2d.text(g, '= 18 g ÷ 18 g mol⁻¹', mx, my + 22, { size: 12, weight: 700, font: 'mono', color: ink });
      c2d.text(g, '= 1 mol', mx, my + 44, { size: 15, weight: 900, color: accent });
      g.restore();
    }

    /* ---- right: the zoom into particles ---- */
    const zoom = phase(t, 0.46, 0.68, ease.inOut);
    if (zoom > 0) {
      const cx = w * 0.62, cy = 150;
      const R = lerp(6, Math.min(w * 0.2, 96), zoom);

      g.save();
      g.globalAlpha = Math.min(1, zoom * 2);
      g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2);
      g.fillStyle = cssVar('--bg-2'); g.fill();
      g.strokeStyle = hue; g.lineWidth = 2; g.stroke();
      g.clip();

      // molecules: a hex-ish lattice that densifies as we zoom
      const count = Math.floor(lerp(4, 46, zoom));
      for (let i = 0; i < count; i++) {
        const ang = i * 2.399963;
        const rad = R * 0.86 * Math.sqrt(i / count);
        const mx = cx + Math.cos(ang) * rad;
        const my = cy + Math.sin(ang) * rad;
        molecule(g, mx, my, lerp(2, 7, zoom), hue);
      }
      g.restore();

      if (zoom > 0.6) {
        c2d.text(g, 'one mole', cx, cy - R - 14, { size: 10, weight: 800, color: cssVar('--ink-4') });
      }
    }

    /* ---- counting readouts ---- */
    if (t > 0.6) {
      const a = phase(t, 0.6, 0.68);
      g.save();
      g.globalAlpha = a;
      readout(g, w - 26, 22, [
        'n        = 1 mol',
        'N = n·Nₐ = 6.022e23',
        'atoms×3  = 1.807e24'
      ], { align: 'right', hue });
      g.restore();
    }

    /* ---- the chain, at the bottom ---- */
    if (t > 0.84) {
      const a = phase(t, 0.84, 0.92);
      g.save();
      g.globalAlpha = a;
      const y = h - 26;
      const boxes = [
        { label: 'mass (g)', x: w * 0.16 },
        { label: 'MOLES', x: w * 0.5, hot: true },
        { label: 'particles', x: w * 0.84 }
      ];
      for (const b of boxes) {
        g.fillStyle = b.hot ? hue : cssVar('--bg-3');
        c2d.roundRect(g, b.x - 52, y - 13, 104, 26, 7); g.fill();
        if (!b.hot) { g.strokeStyle = cssVar('--line'); g.lineWidth = 1; g.stroke(); }
        c2d.text(g, b.label, b.x, y, {
          size: 10, weight: 800,
          color: b.hot ? cssVar('--primary-ink') : cssVar('--ink-2')
        });
      }
      c2d.arrow(g, w * 0.16 + 56, y, w * 0.5 - 56, y, { color: ink, width: 1.6, head: 6 });
      c2d.arrow(g, w * 0.5 + 56, y, w * 0.84 - 56, y, { color: ink, width: 1.6, head: 6 });
      c2d.text(g, '÷ M', (w * 0.16 + w * 0.5) / 2, y - 15, { size: 9, weight: 700, color: ink });
      c2d.text(g, '× Nₐ', (w * 0.5 + w * 0.84) / 2, y - 15, { size: 9, weight: 700, color: ink });
      g.restore();
    }
  }
};

function molecule(g, x, y, r, hue) {
  g.fillStyle = hue;
  g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  if (r > 4) {
    g.fillStyle = cssVar('--bg-1');
    g.globalAlpha = 0.8;
    g.beginPath(); g.arc(x - r * 0.9, y - r * 0.6, r * 0.45, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(x + r * 0.9, y - r * 0.6, r * 0.45, 0, Math.PI * 2); g.fill();
    g.globalAlpha = 1;
  }
}
