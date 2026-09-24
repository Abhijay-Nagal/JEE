/**
 * Why a vernier scale works.
 *
 * Textbooks state "L.C. = 1 MSD - 1 VSD" and move on. The reason it lets you
 * read a tenth of a division with your eyes is a deliberate mismatch, and it
 * is almost impossible to see from a static diagram. Here the second scale is
 * built in front of the learner and then slid, so the coincidence walks along
 * one division at a time.
 */

import { cssVar, c2d, phase, during, lerp, ease, readout } from '../kit.js';

const MM_SPAN = 13;

export default {
  id: 'vernierPrinciple',
  title: 'Why a vernier reads a tenth of a division',
  caption: 'The trick is a deliberate mismatch: ten vernier divisions are made to span **nine** millimetres, not ten.',
  duration: 16,
  loop: true,
  height: 280,
  stillAt: 0.72,

  steps: [
    { at: 0.00, text: 'A millimetre scale stops at one millimetre. Between two marks you can only guess.' },
    { at: 0.16, text: 'So we add a second scale, and make **10 of its divisions span 9 mm**.' },
    { at: 0.34, text: 'Each vernier division is therefore $0.9$ mm — short of a millimetre by exactly $0.1$ mm.' },
    { at: 0.46, text: 'That $0.1$ mm shortfall **is** the least count: $\\text{L.C.} = 1\\text{MSD} - 1\\text{VSD}$.' },
    { at: 0.56, text: 'Now slide the vernier. After $0.1$ mm, division **1** is the one that lines up.' },
    { at: 0.70, text: 'After $0.3$ mm, division **3** lines up. The shortfall accumulates one division at a time.' },
    { at: 0.84, text: 'So the coinciding division number *is* the tenths digit. Your eye only has to spot which pair aligns.' },
    { at: 0.93, text: 'Reading $=$ main scale $+$ (coinciding division $\\times$ L.C.).' }
  ],

  draw(g, w, h, t) {
    const ink = cssVar('--ink-2');
    const line = cssVar('--line');
    const hue = cssVar('--physics');
    const accent = cssVar('--accent');

    const pad = 34;
    const px = (mm) => pad + (mm / MM_SPAN) * (w - pad * 2);
    const mainY = 96;
    const vernY = 156;

    /* ---- 1. the main scale ---- */
    const mainIn = phase(t, 0, 0.14, ease.out);
    g.save();
    g.globalAlpha = mainIn;
    g.fillStyle = cssVar('--bg-3');
    c2d.roundRect(g, pad - 12, mainY - 40, w - pad * 2 + 24, 42, 5);
    g.fill();
    g.strokeStyle = line; g.lineWidth = 1; g.stroke();

    for (let mm = 0; mm <= MM_SPAN; mm++) {
      const x = px(mm);
      const major = mm % 10 === 0;
      const mid = mm % 5 === 0;
      c2d.line(g, x, mainY, x, mainY - (major ? 26 : mid ? 18 : 11), {
        color: major ? ink : line, width: major ? 1.8 : 1
      });
      if (mid) c2d.text(g, String(mm), x, mainY - 32, { size: 10, weight: 700, color: ink });
    }
    c2d.text(g, 'MAIN SCALE — smallest division 1 mm', pad - 12, mainY - 50,
      { size: 9, weight: 800, color: cssVar('--ink-4'), align: 'left' });
    g.restore();

    /* ---- 2. build the vernier ---- */
    const build = phase(t, 0.16, 0.34, ease.out);
    if (build <= 0) return;

    // Slide only in the later phase; before that it sits at zero.
    // Quantised to tenths of a millimetre, because the whole point is that
    // coincidence happens at discrete positions - and it keeps the readout
    // agreeing with the narration at every step.
    const raw = t < 0.52 ? 0 : lerp(0, 0.6, phase(t, 0.52, 0.88, ease.inOut));
    const offset = Math.round(raw * 10) / 10;
    const shown = Math.round(offset * 10);

    const vStart = px(offset);
    const vEnd = px(offset + 9);

    g.save();
    g.globalAlpha = build;
    g.fillStyle = cssVar('--bg-4');
    c2d.roundRect(g, vStart - 10, vernY - 2, (vEnd - vStart) + 22, 40, 5);
    g.fill();
    g.strokeStyle = hue; g.lineWidth = 1.6; g.stroke();

    const divisionsIn = Math.floor(build * 10 + 0.001);
    for (let k = 0; k <= 10; k++) {
      if (build < 1 && k > divisionsIn) break;
      const x = px(offset + k * 0.9);
      const isMatch = t > 0.5 && k === shown;
      c2d.line(g, x, vernY, x, vernY + (k % 5 === 0 ? 20 : 14), {
        color: isMatch ? accent : ink, width: isMatch ? 2.6 : 1
      });
      if (k % 5 === 0 || isMatch) {
        c2d.text(g, String(k), x, vernY + 30, {
          size: isMatch ? 12 : 10, weight: isMatch ? 900 : 700,
          color: isMatch ? accent : ink
        });
      }
    }
    c2d.text(g, 'VERNIER SCALE — 10 divisions span 9 mm', vStart - 10, vernY + 48,
      { size: 9, weight: 800, color: cssVar('--ink-4'), align: 'left' });
    g.restore();

    /* ---- 3. the 9 mm span, called out ---- */
    if (during(t, 0.22, 0.48)) {
      const a = phase(t, 0.22, 0.28);
      g.save();
      g.globalAlpha = a * (1 - phase(t, 0.44, 0.48));
      const y = vernY + 62;
      c2d.line(g, px(0), y, px(9), y, { color: hue, width: 1.5 });
      c2d.line(g, px(0), y - 5, px(0), y + 5, { color: hue, width: 1.5 });
      c2d.line(g, px(9), y - 5, px(9), y + 5, { color: hue, width: 1.5 });
      c2d.text(g, '10 divisions = 9 mm', (px(0) + px(9)) / 2, y + 14,
        { size: 11, weight: 800, color: hue });
      g.restore();
    }

    /* ---- 4. the 0.1 mm shortfall, magnified ---- */
    if (during(t, 0.36, 0.56)) {
      const a = phase(t, 0.36, 0.42) * (1 - phase(t, 0.52, 0.56));
      g.save();
      g.globalAlpha = a;

      // Compare one main division with one vernier division, blown up.
      const zx = w * 0.56, zy = 214, zw = w * 0.34;
      g.fillStyle = cssVar('--bg-2');
      c2d.roundRect(g, zx - 8, zy - 26, zw + 16, 54, 8);
      g.fill();
      g.strokeStyle = accent; g.lineWidth = 1; g.stroke();

      const unit = zw;                       // 1 mm, magnified
      c2d.line(g, zx, zy - 12, zx, zy + 6, { color: ink, width: 1.5 });
      c2d.line(g, zx + unit, zy - 12, zx + unit, zy + 6, { color: ink, width: 1.5 });
      c2d.line(g, zx, zy - 3, zx + unit, zy - 3, { color: ink, width: 1.2 });
      c2d.text(g, '1 MSD = 1.0 mm', zx + unit / 2, zy - 18, { size: 9, weight: 700, color: ink });

      c2d.line(g, zx + unit * 0.9, zy - 6, zx + unit * 0.9, zy + 12, { color: hue, width: 2 });
      c2d.line(g, zx, zy + 9, zx + unit * 0.9, zy + 9, { color: hue, width: 1.6 });
      c2d.text(g, '1 VSD = 0.9 mm', zx + unit * 0.45, zy + 21, { size: 9, weight: 700, color: hue });

      // the gap
      g.fillStyle = accent;
      g.globalAlpha = a * 0.35;
      g.fillRect(zx + unit * 0.9, zy - 10, unit * 0.1, 22);
      g.globalAlpha = a;
      c2d.text(g, '0.1 mm', zx + unit * 0.95, zy - 22, { size: 10, weight: 900, color: accent });
      g.restore();
    }

    /* ---- 5. coincidence guide line ---- */
    if (t > 0.54) {
      const x = px(offset + shown * 0.9);
      g.save();
      g.globalAlpha = 0.85;
      c2d.line(g, x, mainY, x, vernY, { color: accent, width: 1.4, dash: [4, 4] });
      g.restore();
      c2d.text(g, 'these line up', x, mainY + 26, { size: 10, weight: 800, color: accent });
    }

    /* ---- 6. live readout ---- */
    if (t > 0.5) {
      readout(g, w - pad, 18, [
        `slide   = ${offset.toFixed(1)} mm`,
        `coincide= division ${shown}`,
        `so      = ${shown} × 0.1 mm`
      ], { align: 'right', hue: accent });
    }

    /* ---- 7. the formula ---- */
    if (t > 0.9) {
      g.save();
      g.globalAlpha = phase(t, 0.9, 0.96);
      c2d.text(g, 'Reading = MSR + (coinciding division × L.C.)', w / 2, h - 12,
        { size: 12, weight: 800, color: hue });
      g.restore();
    }
  }
};
