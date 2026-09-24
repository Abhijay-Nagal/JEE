/**
 * The nth roots of unity sit on a regular polygon, and they sum to zero.
 *
 * "1 + omega + omega^2 = 0" is usually a fact to be recalled. Drawing the three
 * vectors and adding them head to tail shows the sum closing into a triangle,
 * which is the whole proof.
 */

import { cssVar, c2d, phase, lerp, ease, readout } from '../kit.js';

export default {
  id: 'rootsOfUnity',
  title: 'The roots of unity, and why they sum to zero',
  caption: 'The $n$th roots of 1 are the corners of a regular $n$-gon, so their vectors always cancel.',
  duration: 21,
  loop: true,
  height: 320,
  stillAt: 0.80,

  steps: [
    { at: 0.00, text: 'Solve $z^n = 1$. There are exactly $n$ answers, and they are evenly spaced around the unit circle.' },
    { at: 0.12, text: '$n = 3$: the cube roots of unity, at $0^\\circ$, $120^\\circ$ and $240^\\circ$.' },
    { at: 0.24, text: 'Call them $1$, $\\omega$ and $\\omega^2$, where $\\omega = -\\tfrac12 + \\tfrac{\\sqrt3}{2}i$.' },
    { at: 0.36, text: 'Since $\\omega$ is a $120^\\circ$ turn, $\\omega^3$ is a full turn: $\\omega^3 = 1$.' },
    { at: 0.48, text: 'Now add the three as vectors, head to tail.' },
    { at: 0.62, text: 'They close into a triangle and return to the origin — so $1 + \\omega + \\omega^2 = 0$.' },
    { at: 0.76, text: 'The same argument works for any $n$: a regular polygon’s edge vectors always close.' },
    { at: 0.88, text: 'Watch $n$ grow. Whatever $n$, the roots are symmetric about the origin and the sum is zero.' }
  ],

  draw(g, w, h, t) {
    const hue = cssVar('--maths');
    const ink = cssVar('--ink-4');
    const accent = cssVar('--accent');
    const ok = cssVar('--ok');

    /* n is 3 for most of the scene, then sweeps up at the end */
    const n = t < 0.80 ? 3 : Math.round(lerp(3, 8, phase(t, 0.80, 0.98)));

    const cx = w * 0.34, cy = h * 0.5;
    const R = Math.min(w * 0.18, h * 0.32);

    /* ---- axes and circle ---- */
    c2d.line(g, cx - R * 1.5, cy, cx + R * 1.5, cy, { color: cssVar('--chart-ink'), width: 1.2 });
    c2d.line(g, cx, cy - R * 1.5, cx, cy + R * 1.5, { color: cssVar('--chart-ink'), width: 1.2 });
    g.save();
    g.strokeStyle = cssVar('--line'); g.lineWidth = 1.2; g.setLineDash([3, 4]);
    g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.stroke();
    g.restore();

    /* ---- the roots ---- */
    const appear = phase(t, 0.08, 0.26, ease.out);
    const shown = t < 0.80 ? Math.min(n, Math.ceil(appear * n)) : n;
    const pts = [];
    for (let k = 0; k < n; k++) {
      const a = (2 * Math.PI * k) / n;
      pts.push({ x: cx + Math.cos(a) * R, y: cy - Math.sin(a) * R, a });
    }

    // the polygon they form
    if (t > 0.24) {
      g.save();
      g.globalAlpha = 0.5;
      g.strokeStyle = hue; g.lineWidth = 1.4;
      g.beginPath();
      pts.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)));
      g.closePath(); g.stroke();
      g.restore();
    }

    pts.forEach((p, k) => {
      if (k >= shown) return;
      c2d.line(g, cx, cy, p.x, p.y, { color: k === 0 ? ok : hue, width: 2.2 });
      g.fillStyle = k === 0 ? ok : hue;
      g.beginPath(); g.arc(p.x, p.y, 6, 0, Math.PI * 2); g.fill();
      if (n === 3) {
        const label = k === 0 ? '1' : k === 1 ? 'ω' : 'ω²';
        c2d.text(g, label, cx + Math.cos(p.a) * (R + 22), cy - Math.sin(p.a) * (R + 22),
          { size: 14, weight: 900, color: k === 0 ? ok : hue });
      }
    });

    if (n > 3) {
      c2d.text(g, `n = ${n}`, cx, cy + R * 1.5 + 20, { size: 13, weight: 900, color: accent });
    }

    /* ---- head-to-tail addition, on the right ---- */
    if (t > 0.46 && t < 0.82) {
      const sx = w * 0.74, sy = h * 0.5;
      const scale = R * 0.9;
      const k = phase(t, 0.48, 0.66, ease.inOut) * 3;

      c2d.text(g, 'add them head to tail', sx, sy - scale - 28,
        { size: 10, weight: 700, color: ink });

      let x = sx - scale * 0.5, y = sy + scale * 0.35;
      g.fillStyle = cssVar('--ink-3');
      g.beginPath(); g.arc(x, y, 3.5, 0, Math.PI * 2); g.fill();
      const startX = x, startY = y;

      for (let i = 0; i < 3; i++) {
        const take = Math.max(0, Math.min(1, k - i));
        if (take <= 0) break;
        const a = (2 * Math.PI * i) / 3;
        const nx = x + Math.cos(a) * scale * take;
        const ny = y - Math.sin(a) * scale * take;
        c2d.arrow(g, x, y, nx, ny,
          { color: i === 0 ? ok : i === 1 ? cssVar('--chart-1') : cssVar('--chart-3'), width: 2.6, head: 8 });
        x = nx; y = ny;
      }

      if (k >= 2.98) {
        g.save();
        g.globalAlpha = phase(t, 0.64, 0.72);
        g.fillStyle = ok;
        g.beginPath(); g.arc(startX, startY, 7, 0, Math.PI * 2); g.fill();
        c2d.text(g, 'back at the start', startX, startY + 22,
          { size: 11, weight: 800, color: ok });
        g.restore();
      }
    }

    /* ---- the identities ---- */
    const rows = [
      { at: 0.34, text: 'ω³ = 1', colour: hue },
      { at: 0.64, text: '1 + ω + ω² = 0', colour: ok }
    ];
    rows.forEach((row, i) => {
      if (t < row.at) return;
      g.save();
      g.globalAlpha = phase(t, row.at, row.at + 0.08);
      const y = h - 62 + i * 30;
      g.fillStyle = cssVar('--bg-2');
      c2d.roundRect(g, w / 2 - 92, y - 13, 184, 26, 6); g.fill();
      g.strokeStyle = row.colour; g.lineWidth = 1.3; g.stroke();
      c2d.text(g, row.text, w / 2, y, { size: 13, weight: 900, color: row.colour });
      g.restore();
    });

    readout(g, 14, 14, [
      `zⁿ = 1,  n = ${n}`,
      `spacing  ${(360 / n).toFixed(0)}°`,
      'sum  =  0'
    ], { hue });
  }
};
