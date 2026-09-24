/**
 * de Broglie's standing wave, and why orbits are quantised.
 *
 * Bohr had to *postulate* that angular momentum comes in units of h/2pi.
 * de Broglie explained it: an orbit is allowed only when a whole number of
 * electron wavelengths fits round it. Sweep the circumference and watch the
 * wave fail to close except at integer values.
 */

import { cssVar, c2d, phase, lerp, ease, readout } from '../kit.js';

export default {
  id: 'deBroglieWave',
  title: 'Why only certain orbits are allowed',
  caption: 'An orbit survives only if a whole number of electron wavelengths fits exactly around it.',
  duration: 18,
  loop: true,
  height: 310,
  stillAt: 0.86,

  steps: [
    { at: 0.00, text: 'de Broglie: every particle has a wavelength $\\lambda = h/mv$. An electron is no exception.' },
    { at: 0.14, text: 'Wrap that wave around a Bohr orbit. Here the circumference is **not** a whole number of wavelengths.' },
    { at: 0.30, text: 'The wave arrives back out of step with itself and cancels. No such orbit can persist.' },
    { at: 0.46, text: 'Grow the orbit. At $n = 2$ exactly two wavelengths fit — the wave closes on itself and reinforces.' },
    { at: 0.62, text: 'At $n = 3$, three fit. At $n = 4$, four. Only the whole numbers survive.' },
    { at: 0.76, text: 'So $2\\pi r = n\\lambda = \\dfrac{nh}{mv}$, which rearranges to $mvr = \\dfrac{nh}{2\\pi}$.' },
    { at: 0.88, text: 'That is exactly Bohr’s quantisation condition — no longer a postulate, but a consequence of the electron being a wave.' }
  ],

  draw(g, w, h, t) {
    const hue = cssVar('--chemistry');
    const ok = cssVar('--ok');
    const bad = cssVar('--bad');

    const cx = w * 0.36, cy = h * 0.46;
    const R = Math.min(w * 0.2, h * 0.3);

    // The number of wavelengths around the orbit sweeps up through the
    // non-integer values and settles on 2, then 3, then 4.
    let n;
    if (t < 0.44) n = lerp(1.45, 1.62, phase(t, 0.02, 0.44));
    else if (t < 0.60) n = lerp(1.62, 2, phase(t, 0.44, 0.56, ease.inOut));
    else if (t < 0.74) n = lerp(2, 3, phase(t, 0.60, 0.70, ease.inOut));
    else n = lerp(3, 4, phase(t, 0.74, 0.84, ease.inOut));

    const closes = Math.abs(n - Math.round(n)) < 0.035;
    const colour = closes ? ok : bad;

    /* ---- nucleus and orbit ---- */
    g.fillStyle = cssVar('--bad');
    g.beginPath(); g.arc(cx, cy, 6, 0, Math.PI * 2); g.fill();

    g.save();
    g.strokeStyle = cssVar('--line');
    g.lineWidth = 1.2;
    g.setLineDash([3, 4]);
    g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.stroke();
    g.restore();

    /* ---- the wrapped wave ---- */
    const amp = R * 0.19;
    g.save();
    g.strokeStyle = colour;
    g.lineWidth = 2.6;
    g.lineJoin = 'round';
    g.beginPath();
    const STEPS = 460;
    for (let i = 0; i <= STEPS; i++) {
      const th = (i / STEPS) * Math.PI * 2;
      const rr = R + Math.sin(th * n + t * 6) * amp;
      const x = cx + Math.cos(th) * rr;
      const y = cy + Math.sin(th) * rr;
      i ? g.lineTo(x, y) : g.moveTo(x, y);
    }
    g.stroke();
    g.restore();

    /* ---- the mismatch at the join ---- */
    if (!closes) {
      const thStart = 0;
      const rStart = R + Math.sin(t * 6) * amp;
      const rEnd = R + Math.sin(Math.PI * 2 * n + t * 6) * amp;
      const x1 = cx + rStart, y1 = cy;
      const x2 = cx + rEnd, y2 = cy;
      g.save();
      g.strokeStyle = bad;
      g.lineWidth = 2.4;
      g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
      g.restore();
      g.fillStyle = bad;
      g.beginPath(); g.arc(x1, y1, 4, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.arc(x2, y2, 4, 0, Math.PI * 2); g.fill();
      c2d.text(g, 'out of step', cx + R + 46, cy, { size: 10, weight: 800, color: bad, align: 'left' });
    } else {
      g.fillStyle = ok;
      g.beginPath(); g.arc(cx + R + Math.sin(t * 6) * amp, cy, 5, 0, Math.PI * 2); g.fill();
      c2d.text(g, 'closes ✓', cx + R + 46, cy, { size: 11, weight: 800, color: ok, align: 'left' });
    }

    c2d.text(g, `${n.toFixed(2)} wavelengths around the orbit`, cx, cy + R + amp + 26,
      { size: 11, weight: 800, color: colour });

    /* ---- the straightened wave, for comparison ---- */
    const sy = h - 62;
    const sx0 = w * 0.58, sx1 = w - 24;
    g.save();
    g.strokeStyle = colour;
    g.lineWidth = 2.2;
    g.beginPath();
    for (let i = 0; i <= 160; i++) {
      const u = i / 160;
      const x = lerp(sx0, sx1, u);
      const y = sy + Math.sin(u * Math.PI * 2 * n + t * 6) * 16;
      i ? g.lineTo(x, y) : g.moveTo(x, y);
    }
    g.stroke();
    g.restore();
    c2d.line(g, sx0, sy - 26, sx0, sy + 26, { color: cssVar('--ink-4'), width: 1.2, dash: [3, 3] });
    c2d.line(g, sx1, sy - 26, sx1, sy + 26, { color: cssVar('--ink-4'), width: 1.2, dash: [3, 3] });
    c2d.text(g, 'one lap of the orbit, unrolled', (sx0 + sx1) / 2, sy + 40,
      { size: 9, weight: 700, color: cssVar('--ink-4') });

    /* ---- the result ---- */
    readout(g, w - 14, 14, [
      `n  = ${n.toFixed(2)}`,
      `2πr = nλ ?  ${closes ? 'YES' : 'no'}`
    ], { align: 'right', hue: colour });

    if (t > 0.78) {
      const a = phase(t, 0.78, 0.88);
      g.save();
      g.globalAlpha = a;
      g.fillStyle = cssVar('--bg-2');
      c2d.roundRect(g, w * 0.5 - 130, 16, 260, 30, 8); g.fill();
      g.strokeStyle = hue; g.lineWidth = 1; g.stroke();
      c2d.text(g, '2πr = nλ  ⇒  mvr = nh/2π', w * 0.5, 31,
        { size: 13, weight: 900, color: hue });
      g.restore();
    }
  }
};
