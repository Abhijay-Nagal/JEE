/**
 * What the orbital shapes actually are, and where the quantum numbers sit.
 *
 * s, p and d are usually met as pictures to memorise. Building them in order -
 * and labelling each with the (n, l, m) that produced it - turns the list into
 * a structure.
 */

import { cssVar, c2d, phase, during, lerp, ease } from '../kit.js';

export default {
  id: 'orbitalShapes',
  title: 'Orbital shapes and the quantum numbers',
  caption: '$l$ chooses the shape; $m_l$ chooses which way it points.',
  duration: 19,
  loop: true,
  height: 300,
  stillAt: 0.78,

  steps: [
    { at: 0.00, text: 'An orbital is a region where the electron is likely to be found — not a path it travels.' },
    { at: 0.12, text: '$l = 0$ is an **s** orbital: spherical, and there is only one of it, because $m_l$ can only be 0.' },
    { at: 0.30, text: '$l = 1$ gives **p** orbitals: dumbbells with a node at the nucleus.' },
    { at: 0.42, text: '$m_l$ takes values $-1, 0, +1$ — three values, so three p orbitals, along $x$, $y$ and $z$.' },
    { at: 0.58, text: '$l = 2$ gives **d** orbitals: four-lobed cloverleaves. $m_l$ runs $-2\\ldots+2$, so there are five.' },
    { at: 0.72, text: 'The pattern is fixed: a subshell with quantum number $l$ always has $2l+1$ orbitals.' },
    { at: 0.84, text: 'Each orbital holds at most **two** electrons, of opposite spin — so a subshell holds $2(2l+1)$.' },
    { at: 0.92, text: 'And a shell $n$ has $n^2$ orbitals in total, giving the familiar $2n^2$ electrons.' }
  ],

  draw(g, w, h, t) {
    const hue = cssVar('--chemistry');
    const ink = cssVar('--ink-3');

    const cy = h * 0.42;
    const R = Math.min(w * 0.09, 46);

    /* ---- s ---- */
    const sIn = phase(t, 0.10, 0.22, ease.out);
    if (sIn > 0) {
      const cx = w * 0.16;
      g.save();
      g.globalAlpha = sIn * (t > 0.56 ? 0.4 : 1);
      radial(g, cx, cy, R * sIn, hue);
      g.restore();
      label(g, cx, cy + R + 22, 's', 'l = 0   ·   1 orbital', ink, hue, sIn);
    }

    /* ---- p ---- */
    const pIn = phase(t, 0.28, 0.44, ease.out);
    if (pIn > 0) {
      const cx = w * 0.45;
      const shown = t < 0.40 ? 1 : 3;
      g.save();
      g.globalAlpha = pIn * (t > 0.70 ? 0.4 : 1);
      // z, then x and y
      dumbbell(g, cx, cy, R * 1.05, Math.PI / 2, hue, pIn);
      if (shown >= 3) {
        const a = phase(t, 0.40, 0.50, ease.out);
        g.globalAlpha *= 1;
        dumbbell(g, cx, cy, R * 1.05, 0, cssVar('--chart-1'), a);
        dumbbell(g, cx, cy, R * 1.05, Math.PI / 4, cssVar('--chart-3'), a);
      }
      g.restore();
      label(g, cx, cy + R * 1.3 + 22, 'p', `l = 1   ·   ${shown === 3 ? '3 orbitals' : 'pᵢ'}`, ink, hue, pIn);
    }

    /* ---- d ---- */
    const dIn = phase(t, 0.56, 0.72, ease.out);
    if (dIn > 0) {
      const cx = w * 0.78;
      g.save();
      g.globalAlpha = dIn;
      clover(g, cx, cy, R * 1.0, 0, hue, dIn);
      if (t > 0.64) {
        const a = phase(t, 0.64, 0.72);
        clover(g, cx, cy, R * 1.0, Math.PI / 4, cssVar('--chart-1'), a * 0.85);
      }
      g.restore();
      label(g, cx, cy + R * 1.25 + 22, 'd', 'l = 2   ·   5 orbitals', ink, hue, dIn);
    }

    /* ---- the counting rule ---- */
    if (t > 0.72) {
      const a = phase(t, 0.72, 0.82);
      g.save();
      g.globalAlpha = a;
      const y = h - 54;
      const cols = [
        { l: 0, name: 's', n: 1 },
        { l: 1, name: 'p', n: 3 },
        { l: 2, name: 'd', n: 5 },
        { l: 3, name: 'f', n: 7 }
      ];
      cols.forEach((c, i) => {
        const x = w * (0.16 + i * 0.22);
        g.fillStyle = cssVar('--bg-2');
        c2d.roundRect(g, x - 52, y, 104, 34, 7); g.fill();
        g.strokeStyle = cssVar('--line'); g.lineWidth = 1; g.stroke();
        c2d.text(g, `${c.name}   l = ${c.l}`, x, y + 12, { size: 10, weight: 800, color: hue });
        c2d.text(g, `2l+1 = ${c.n} orbitals`, x, y + 25, { size: 9, weight: 600, color: ink });
      });
      g.restore();
    }

    if (t > 0.88) {
      g.save();
      g.globalAlpha = phase(t, 0.88, 0.95);
      c2d.text(g, 'shell n:  n² orbitals,  2n² electrons', w / 2, 20,
        { size: 13, weight: 900, color: cssVar('--accent') });
      g.restore();
    }
  }
};

/* ---------------- shapes ---------------- */

function radial(g, cx, cy, r, colour) {
  const grad = g.createRadialGradient(cx, cy, 0, cx, cy, r);
  grad.addColorStop(0, colour);
  grad.addColorStop(0.55, colour + '');
  grad.addColorStop(1, 'transparent');
  g.save();
  g.globalAlpha *= 0.55;
  g.fillStyle = grad;
  g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill();
  g.restore();
  g.strokeStyle = colour;
  g.lineWidth = 1.6;
  g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.stroke();
}

function dumbbell(g, cx, cy, r, rot, colour, k) {
  g.save();
  g.translate(cx, cy);
  g.rotate(rot);
  g.globalAlpha *= 0.55 * k;
  g.fillStyle = colour;
  for (const s of [-1, 1]) {
    g.beginPath();
    g.ellipse(0, s * r * 0.62 * k, r * 0.33 * k, r * 0.62 * k, 0, 0, Math.PI * 2);
    g.fill();
  }
  g.globalAlpha = Math.min(1, g.globalAlpha * 2);
  g.strokeStyle = colour;
  g.lineWidth = 1.4;
  for (const s of [-1, 1]) {
    g.beginPath();
    g.ellipse(0, s * r * 0.62 * k, r * 0.33 * k, r * 0.62 * k, 0, 0, Math.PI * 2);
    g.stroke();
  }
  g.restore();
}

function clover(g, cx, cy, r, rot, colour, k) {
  g.save();
  g.translate(cx, cy);
  g.rotate(rot + Math.PI / 4);
  g.globalAlpha *= 0.5 * k;
  g.fillStyle = colour;
  for (let i = 0; i < 4; i++) {
    g.save();
    g.rotate((i * Math.PI) / 2);
    g.beginPath();
    g.ellipse(0, -r * 0.52 * k, r * 0.27 * k, r * 0.52 * k, 0, 0, Math.PI * 2);
    g.fill();
    g.restore();
  }
  g.restore();
}

function label(g, x, y, big, small, ink, hue, alpha) {
  g.save();
  g.globalAlpha = alpha;
  c2d.text(g, big, x, y, { size: 16, weight: 900, color: hue });
  c2d.text(g, small, x, y + 16, { size: 9, weight: 700, color: ink });
  g.restore();
}
