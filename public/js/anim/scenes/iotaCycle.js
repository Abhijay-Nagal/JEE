/**
 * Why the powers of i repeat every four.
 *
 * "i^4 = 1, so divide the exponent by 4" is a rule students apply without
 * seeing it. Multiplying by i is a quarter turn; four quarter turns is a full
 * circle. Watching the point walk round makes the period-4 obvious rather than
 * memorised.
 */

import { cssVar, c2d, phase, lerp, ease, readout } from '../kit.js';

const LABELS = ['1', 'i', '−1', '−i'];
const TEX = ['i⁰ = 1', 'i¹ = i', 'i² = −1', 'i³ = −i'];

export default {
  id: 'iotaCycle',
  title: 'Multiplying by i is a quarter turn',
  caption: 'Four quarter turns return you to where you started, which is why $i^4 = 1$.',
  duration: 17,
  loop: true,
  height: 300,
  stillAt: 0.62,

  steps: [
    { at: 0.00, text: '$i$ is defined by one property: $i^2 = -1$. Everything else follows from it.' },
    { at: 0.10, text: 'Start at $1$, on the real axis. Multiplying by $i$ moves you a **quarter turn anticlockwise**.' },
    { at: 0.24, text: '$i^1 = i$ — you are now on the imaginary axis.' },
    { at: 0.38, text: 'Another quarter turn: $i^2 = -1$. Half a circle from the start, which is exactly what "$-1$" means geometrically.' },
    { at: 0.52, text: '$i^3 = -i$, three quarters round.' },
    { at: 0.66, text: '$i^4 = 1$. Full circle. You are back at the start, and the pattern must now repeat forever.' },
    { at: 0.78, text: 'So the powers of $i$ have period **four**: divide the exponent by 4 and only the remainder matters.' },
    { at: 0.88, text: '$i^{39}$: since $39 = 4\\times9 + 3$, the answer is $i^3 = -i$. No multiplication required.' }
  ],

  draw(g, w, h, t) {
    const hue = cssVar('--maths');
    const ink = cssVar('--ink-3');
    const accent = cssVar('--accent');

    const cx = w * 0.34, cy = h * 0.5;
    const R = Math.min(w * 0.19, h * 0.32);

    /* ---- axes ---- */
    c2d.line(g, cx - R * 1.5, cy, cx + R * 1.5, cy, { color: cssVar('--chart-ink'), width: 1.3 });
    c2d.line(g, cx, cy - R * 1.5, cx, cy + R * 1.5, { color: cssVar('--chart-ink'), width: 1.3 });
    c2d.text(g, 'Re', cx + R * 1.5 + 2, cy - 9, { size: 9, weight: 700, color: cssVar('--ink-4'), align: 'left' });
    c2d.text(g, 'Im', cx + 10, cy - R * 1.5, { size: 9, weight: 700, color: cssVar('--ink-4'), align: 'left' });

    /* ---- the unit circle ---- */
    g.save();
    g.strokeStyle = cssVar('--line');
    g.lineWidth = 1.2;
    g.setLineDash([3, 4]);
    g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.stroke();
    g.restore();

    /* ---- how far round have we gone? 0 .. 4 quarter turns ---- */
    const k = lerp(0, 4, phase(t, 0.10, 0.72, ease.inOut));
    const reached = Math.floor(k + 1e-6);

    /* ---- the four landmarks ---- */
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2;
      const x = cx + Math.cos(a) * R;
      const y = cy - Math.sin(a) * R;
      const on = i <= reached || (reached >= 4 && i === 0);
      g.fillStyle = on ? hue : cssVar('--line');
      g.beginPath(); g.arc(x, y, on ? 5 : 3.4, 0, Math.PI * 2); g.fill();
      c2d.text(g, LABELS[i],
        cx + Math.cos(a) * (R + 20), cy - Math.sin(a) * (R + 20),
        { size: 12, weight: 900, color: on ? hue : cssVar('--ink-4') });
    }

    /* ---- the swept arc ---- */
    if (k > 0.01) {
      g.save();
      g.strokeStyle = accent;
      g.lineWidth = 3;
      g.beginPath();
      g.arc(cx, cy, R, 0, -(k * Math.PI) / 2, true);
      g.stroke();
      g.restore();
    }

    /* ---- the moving point and its radius ---- */
    const ang = (k * Math.PI) / 2;
    const px = cx + Math.cos(ang) * R;
    const py = cy - Math.sin(ang) * R;
    c2d.line(g, cx, cy, px, py, { color: hue, width: 2 });
    g.fillStyle = accent;
    g.beginPath(); g.arc(px, py, 7, 0, Math.PI * 2); g.fill();
    g.strokeStyle = cssVar('--bg-1'); g.lineWidth = 2; g.stroke();

    c2d.text(g, `× i  ·  ${(k * 90).toFixed(0)}°`, cx, cy + R * 1.5 + 22,
      { size: 11, weight: 800, color: accent });

    /* ---- the ladder of powers on the right ---- */
    const lx = w * 0.68;
    for (let i = 0; i < 4; i++) {
      const y = h * 0.24 + i * 32;
      const on = i <= reached;
      g.save();
      g.globalAlpha = on ? 1 : 0.32;
      g.fillStyle = cssVar('--bg-2');
      c2d.roundRect(g, lx - 58, y - 13, 116, 26, 6); g.fill();
      g.strokeStyle = on ? hue : cssVar('--line'); g.lineWidth = on ? 1.6 : 1;
      g.stroke();
      c2d.text(g, TEX[i], lx, y, { size: 13, weight: 900, color: on ? hue : ink });
      g.restore();
    }

    if (reached >= 4) {
      g.save();
      g.globalAlpha = phase(t, 0.66, 0.74);
      g.fillStyle = cssVar('--bg-2');
      c2d.roundRect(g, lx - 58, h * 0.24 + 4 * 32 - 13, 116, 26, 6); g.fill();
      g.strokeStyle = cssVar('--ok'); g.lineWidth = 1.8; g.stroke();
      c2d.text(g, 'i⁴ = 1', lx, h * 0.24 + 4 * 32, { size: 13, weight: 900, color: cssVar('--ok') });
      g.restore();
    }

    /* ---- the remainder rule ---- */
    if (t > 0.80) {
      const a = phase(t, 0.80, 0.90);
      g.save();
      g.globalAlpha = a;
      g.fillStyle = cssVar('--bg-2');
      c2d.roundRect(g, w / 2 - 150, h - 40, 300, 30, 8); g.fill();
      g.strokeStyle = accent; g.lineWidth = 1; g.stroke();
      c2d.text(g, 'i³⁹  ·  39 = 4×9 + 3  ·  i³ = −i', w / 2, h - 25,
        { size: 13, weight: 900, color: accent });
      g.restore();
    }

    readout(g, 14, 14, [
      `quarter turns  ${k.toFixed(2)}`,
      `i^${reached}  =  ${LABELS[reached % 4]}`
    ], { hue });
  }
};
