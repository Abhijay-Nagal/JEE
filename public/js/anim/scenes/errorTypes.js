/**
 * Systematic vs random error, and why averaging only fixes one of them.
 *
 * Two identical targets are fired at simultaneously. The left instrument has a
 * bias; the right has scatter. Both then show their running mean, and only one
 * of the means walks onto the bullseye.
 */

import { cssVar, c2d, phase, lerp, ease } from '../kit.js';

/** Deterministic pseudo-noise so the animation is identical on every replay. */
function noise(i, seed = 1) {
  const x = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

const N = 24;

export default {
  id: 'errorTypes',
  title: 'Systematic error vs random error',
  caption: 'Two faults that look similar on one reading and behave completely differently over many.',
  duration: 14,
  loop: true,
  height: 324,
  stillAt: 0.9,

  steps: [
    { at: 0.00, text: 'Two instruments measure the same true value. Both are imperfect — differently.' },
    { at: 0.12, text: 'The left one has a **systematic** fault: every shot is pushed the same way, like an uncorrected zero error.' },
    { at: 0.30, text: 'The right one has **random** fault: the shots scatter, but around the truth.' },
    { at: 0.50, text: 'Now take the mean of each. Watch where the crosshair settles.' },
    { at: 0.66, text: 'The random errors cancel — the mean walks onto the bullseye, and the uncertainty falls as $1/\\sqrt{n}$.' },
    { at: 0.80, text: 'The systematic mean does **not** move. Averaging a thousand readings gives a thousand-fold more confident wrong answer.' },
    { at: 0.90, text: 'Precision you can buy with patience. Accuracy you have to buy with calibration.' }
  ],

  draw(g, w, h, t) {
    const ink = cssVar('--ink-3');
    const bad = cssVar('--bad');
    const ok = cssVar('--ok');
    const hue = cssVar('--physics');

    const R = Math.min(w * 0.19, 96);
    const cy = 128;
    const leftX = w * 0.27;
    const rightX = w * 0.73;

    drawTarget(g, leftX, cy, R, 'Systematic — biased', ink);
    drawTarget(g, rightX, cy, R, 'Random — scattered', ink);

    // Shots appear one at a time across the first half.
    const shotsIn = Math.floor(phase(t, 0.06, 0.48) * N);

    const bias = { x: 0.52, y: -0.34 };
    let lsx = 0, lsy = 0, rsx = 0, rsy = 0, n = 0;

    for (let i = 0; i < N; i++) {
      if (i > shotsIn) break;
      n++;
      const fade = Math.min(1, (shotsIn - i + 1) / 2);

      // left: tight cluster, offset from centre
      const lx = bias.x + noise(i, 1) * 0.09;
      const ly = bias.y + noise(i, 2) * 0.09;
      lsx += lx; lsy += ly;
      dot(g, leftX + lx * R, cy + ly * R, bad, fade);

      // right: wide scatter, centred
      const rx = noise(i, 3) * 0.55;
      const ry = noise(i, 4) * 0.55;
      rsx += rx; rsy += ry;
      dot(g, rightX + rx * R, cy + ry * R, hue, fade);
    }

    /* ---- running means ---- */
    if (t > 0.5 && n > 0) {
      const a = phase(t, 0.5, 0.6, ease.out);
      const lm = { x: lsx / n, y: lsy / n };
      const rm = { x: rsx / n, y: rsy / n };

      // Each mean animates from the first shot to its final position.
      const k = phase(t, 0.5, 0.78, ease.inOut);
      crosshair(g, leftX + lerp(bias.x, lm.x, k) * R, cy + lerp(bias.y, lm.y, k) * R, bad, a);
      crosshair(g, rightX + lerp(noise(0, 3) * 0.55, rm.x, k) * R, cy + lerp(noise(0, 4) * 0.55, rm.y, k) * R, ok, a);

      if (t > 0.66) {
        const b = phase(t, 0.66, 0.74);
        g.save();
        g.globalAlpha = b;
        c2d.text(g, 'mean → truth ✓', rightX, cy + R + 42, { size: 11, weight: 800, color: ok });
        g.restore();
      }
      if (t > 0.8) {
        const b = phase(t, 0.8, 0.88);
        g.save();
        g.globalAlpha = b;
        c2d.text(g, 'mean stays off ✗', leftX, cy + R + 42, { size: 11, weight: 800, color: bad });
        // the un-closable gap
        c2d.line(g, leftX, cy, leftX + lsx / n * R, cy + lsy / n * R, { color: bad, width: 2, dash: [4, 3] });
        g.restore();
      }
    }

    /* ---- verdict strip ---- */
    if (t > 0.86) {
      const a = phase(t, 0.86, 0.94);
      g.save();
      g.globalAlpha = a;
      const y = h - 30;
      panel(g, w * 0.06, y, w * 0.4, 'Fix by RECALIBRATING', bad);
      panel(g, w * 0.54, y, w * 0.4, 'Fix by REPEATING', ok);
      g.restore();
    }
  }
};

function drawTarget(g, cx, cy, R, label, ink) {
  for (let i = 4; i >= 1; i--) {
    g.beginPath();
    g.arc(cx, cy, (R * i) / 4, 0, Math.PI * 2);
    g.fillStyle = i % 2 ? cssVar('--bg-2') : cssVar('--bg-3');
    g.fill();
    g.strokeStyle = cssVar('--line-soft');
    g.lineWidth = 1;
    g.stroke();
  }
  g.beginPath();
  g.arc(cx, cy, R * 0.14, 0, Math.PI * 2);
  g.fillStyle = cssVar('--ink-4');
  g.fill();
  c2d.text(g, label, cx, cy - R - 16, { size: 11, weight: 800, color: ink });
  c2d.text(g, 'true value', cx, cy + R + 22, { size: 9, weight: 700, color: cssVar('--ink-4') });
}

function dot(g, x, y, colour, alpha) {
  g.save();
  g.globalAlpha = 0.85 * alpha;
  g.fillStyle = colour;
  g.beginPath();
  g.arc(x, y, 4, 0, Math.PI * 2);
  g.fill();
  g.restore();
}

function crosshair(g, x, y, colour, alpha) {
  g.save();
  g.globalAlpha = alpha;
  g.strokeStyle = colour;
  g.lineWidth = 2.2;
  g.beginPath(); g.arc(x, y, 11, 0, Math.PI * 2); g.stroke();
  c2d.line(g, x - 16, y, x + 16, y, { color: colour, width: 2.2 });
  c2d.line(g, x, y - 16, x, y + 16, { color: colour, width: 2.2 });
  c2d.text(g, 'mean', x, y - 22, { size: 9, weight: 900, color: colour });
  g.restore();
}

function panel(g, x, y, w, text, colour) {
  g.fillStyle = cssVar('--bg-2');
  c2d.roundRect(g, x, y, w, 26, 7);
  g.fill();
  g.strokeStyle = colour;
  g.lineWidth = 1;
  g.stroke();
  c2d.text(g, text, x + w / 2, y + 13, { size: 10, weight: 800, color: colour });
}
