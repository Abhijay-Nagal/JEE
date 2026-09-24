/**
 * Filling the orbitals: Aufbau, Pauli and Hund in one pass.
 *
 * The (n+l) rule is usually drawn as a static diagonal diagram. Animating the
 * fill - and pausing on nitrogen, where Hund's rule visibly refuses to pair
 * electrons - shows the three rules doing their separate jobs.
 */

import { cssVar, c2d, phase, lerp, ease, readout } from '../kit.js';

/** Subshells in Aufbau order, with capacity. */
const ORDER = [
  { id: '1s', n: 1, l: 0, cap: 2 },
  { id: '2s', n: 2, l: 0, cap: 2 },
  { id: '2p', n: 2, l: 1, cap: 6 },
  { id: '3s', n: 3, l: 0, cap: 2 },
  { id: '3p', n: 3, l: 1, cap: 6 },
  { id: '4s', n: 4, l: 0, cap: 2 },
  { id: '3d', n: 3, l: 2, cap: 10 }
];

const TOTAL = ORDER.reduce((s, o) => s + o.cap, 0);

export default {
  id: 'aufbauFilling',
  title: 'Aufbau, Pauli and Hund, filling together',
  caption: 'Lowest $(n+l)$ first; two per box, opposite spins; and singly before doubly.',
  duration: 20,
  loop: true,
  height: 250,
  stillAt: 0.72,

  steps: [
    { at: 0.00, text: 'Electrons occupy the lowest-energy subshell available. That is the **Aufbau** principle.' },
    { at: 0.10, text: 'Energy order is set by $(n+l)$: lower $(n+l)$ fills first, and ties are broken by lower $n$.' },
    { at: 0.26, text: '**Pauli**: no two electrons share all four quantum numbers, so each box takes at most two — and they must have opposite spins.' },
    { at: 0.42, text: 'Watch the 2p subshell. **Hund**: every box gets one electron before any box gets two.' },
    { at: 0.54, text: 'At nitrogen ($2p^3$) all three are unpaired and parallel. That is why nitrogen is so stable.' },
    { at: 0.68, text: 'Only once every p box has one does pairing begin — oxygen, fluorine, neon.' },
    { at: 0.80, text: 'Now the famous one: **4s fills before 3d**, because $4+0 = 4$ beats $3+2 = 5$.' },
    { at: 0.90, text: 'That single inversion is why the d block sits where it does in the periodic table.' }
  ],

  draw(g, w, h, t) {
    const hue = cssVar('--chemistry');
    const ok = cssVar('--ok');
    const accent = cssVar('--accent');
    const ink = cssVar('--ink-3');

    const filled = Math.floor(phase(t, 0.06, 0.94, ease.linear) * TOTAL);

    /* ---- layout the subshells, wrapping as the canvas narrows ---- */
    const boxW = 20, boxH = 26, gap = 4;
    const rowH = 76;
    const widthOf = (sub) => {
      const boxes = sub.cap / 2;
      return boxes * boxW + (boxes - 1) * gap;
    };

    // Measure first: everything fits on one row on a wide canvas and wraps to
    // two on a phone, so the block is centred rather than pinned to the top.
    let rows = 1, mx = 24;
    for (const sub of ORDER) {
      const gw = widthOf(sub);
      if (mx + gw > w - 24) { mx = 24; rows++; }
      mx += gw + 26;
    }
    const areaTop = 46, areaBot = h - 58;
    const blockH = (rows - 1) * rowH + boxH;
    const startY = areaTop + 20 + Math.max(0, (areaBot - areaTop - blockH - 20) / 2);

    let idx = 0;
    let x = 24, y = startY;

    for (const sub of ORDER) {
      const boxes = sub.cap / 2;
      const groupW = boxes * boxW + (boxes - 1) * gap;

      if (x + groupW > w - 24) { x = 24; y += rowH; }

      const nl = sub.n + sub.l;
      const active = filled > idx && filled <= idx + sub.cap;

      // subshell label
      c2d.text(g, sub.id, x + groupW / 2, y - 16,
        { size: 12, weight: 800, color: active ? hue : ink });
      c2d.text(g, `n+l = ${nl}`, x + groupW / 2, y - 4,
        { size: 8, weight: 700, color: active ? accent : cssVar('--ink-4') });

      for (let b = 0; b < boxes; b++) {
        const bx = x + b * (boxW + gap);
        g.strokeStyle = active ? hue : cssVar('--line');
        g.lineWidth = active ? 1.8 : 1.2;
        g.fillStyle = cssVar('--bg-2');
        c2d.roundRect(g, bx, y, boxW, boxH, 4);
        g.fill(); g.stroke();
      }

      // Hund's rule: fill every box once, then pair.
      const inThis = Math.max(0, Math.min(sub.cap, filled - idx));
      for (let e = 0; e < inThis; e++) {
        const box = e < boxes ? e : e - boxes;
        const isSecond = e >= boxes;
        const bx = x + box * (boxW + gap);
        arrow(g, bx + boxW / 2 + (isSecond ? 4 : -4), y + boxH / 2, isSecond ? -1 : 1,
          isSecond ? accent : ok);
      }

      idx += sub.cap;
      x += groupW + 26;
    }

    /* ---- the element we have reached ---- */
    const NAMES = ['', 'H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca'];
    const el = NAMES[filled] || (filled > 20 ? `Z = ${filled}` : '');

    readout(g, w - 14, 12, [
      `electrons  ${filled}`,
      `element    ${el || '—'}`
    ], { align: 'right', hue });

    /* ---- Hund callout at nitrogen ---- */
    if (filled >= 5 && filled <= 7 && t > 0.42) {
      const a = phase(t, 0.42, 0.50);
      g.save();
      g.globalAlpha = a;
      c2d.text(g, 'one each before any pairs — Hund’s rule', w / 2, h - 46,
        { size: 12, weight: 800, color: ok });
      g.restore();
    }

    /* ---- the 4s/3d inversion callout ---- */
    if (t > 0.80) {
      const a = phase(t, 0.80, 0.88);
      g.save();
      g.globalAlpha = a;
      g.fillStyle = cssVar('--bg-2');
      c2d.roundRect(g, w / 2 - 160, h - 42, 320, 32, 8); g.fill();
      g.strokeStyle = accent; g.lineWidth = 1; g.stroke();
      c2d.text(g, '4s (n+l = 4)  fills before  3d (n+l = 5)', w / 2, h - 26,
        { size: 12, weight: 900, color: accent });
      g.restore();
    }

    /* ---- title row ---- */
    c2d.text(g, 'lowest (n + l) first · ties broken by lower n', w / 2, 20,
      { size: 10, weight: 700, color: cssVar('--ink-4') });
  }
};

function arrow(g, x, y, dir, colour) {
  g.save();
  g.strokeStyle = colour;
  g.fillStyle = colour;
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(x, y + dir * 8);
  g.lineTo(x, y - dir * 8);
  g.stroke();
  g.beginPath();
  g.moveTo(x, y - dir * 9);
  g.lineTo(x - 3.2, y - dir * 3.5);
  g.lineTo(x + 3.2, y - dir * 3.5);
  g.closePath();
  g.fill();
  g.restore();
}
