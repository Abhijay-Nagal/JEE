/**
 * Where the hydrogen spectral series come from.
 *
 * Students learn Lyman/Balmer/Paschen as a list to memorise. They are simply
 * "which orbit did the electron land in" - and that is visible the moment you
 * watch the jumps and the lines appear together.
 */

import { cssVar, c2d, phase, lerp, ease, readout } from '../kit.js';

const RY = 13.6;                                   // eV
const E = (n) => -RY / (n * n);
/** Wavelength in nm for a transition n2 -> n1. */
const lambda = (n2, n1) => 1239.84 / (E(n2) - E(n1));

/** The jumps shown, in order. */
const JUMPS = [
  { from: 3, to: 2, series: 'Balmer', colour: '#e34948', label: 'Hα 656 nm · red' },
  { from: 4, to: 2, series: 'Balmer', colour: '#4cc9f0', label: 'Hβ 486 nm · blue' },
  { from: 2, to: 1, series: 'Lyman', colour: '#8f63e8', label: '122 nm · ultraviolet' },
  { from: 4, to: 3, series: 'Paschen', colour: '#c96b2b', label: '1875 nm · infrared' }
];

export default {
  id: 'bohrTransitions',
  title: 'Jumps, photons and the spectral series',
  caption: 'Each series is named for the orbit the electron *lands* in, not the one it leaves.',
  duration: 20,
  loop: true,
  height: 330,
  stillAt: 0.9,

  steps: [
    { at: 0.00, text: 'Bohr’s hydrogen atom: the electron may only occupy orbits with $E_n = -13.6/n^2$ eV.' },
    { at: 0.12, text: 'It cannot sit between them. To move down it must emit a photon carrying **exactly** the energy difference.' },
    { at: 0.24, text: '$3 \\to 2$: the energy gap is $1.89$ eV, giving red light at 656 nm. This is the H$\\alpha$ line.' },
    { at: 0.42, text: '$4 \\to 2$: a bigger gap, so a more energetic photon — blue, at 486 nm.' },
    { at: 0.56, text: 'Every jump that **ends at $n=2$** is a Balmer line, and they all land in the visible.' },
    { at: 0.68, text: '$2 \\to 1$ ends at the ground state — a Lyman line, far more energetic, in the ultraviolet.' },
    { at: 0.82, text: '$4 \\to 3$ ends at $n=3$ — a Paschen line, a small gap, in the infrared.' },
    { at: 0.92, text: '$\\dfrac{1}{\\lambda} = R_H\\left(\\dfrac{1}{n_1^2} - \\dfrac{1}{n_2^2}\\right)$ — the landing orbit $n_1$ names the series.' }
  ],

  draw(g, w, h, t) {
    const ink = cssVar('--ink-3');
    const hue = cssVar('--chemistry');

    // which jump is running
    const idx = t < 0.24 ? -1 : t < 0.42 ? 0 : t < 0.56 ? 1 : t < 0.82 ? 2 : 3;
    const jump = idx >= 0 ? JUMPS[idx] : null;
    const jumpStart = [0.24, 0.42, 0.68, 0.82][Math.max(0, idx)];
    const k = jump ? phase(t, jumpStart, jumpStart + 0.09, ease.inOut) : 0;

    /* ================= left: the orbits ================= */
    const cx = w * 0.27, cy = h * 0.42;
    const rOf = (n) => 16 + n * n * 5.4;

    // nucleus
    g.fillStyle = cssVar('--bad');
    g.beginPath(); g.arc(cx, cy, 6, 0, Math.PI * 2); g.fill();

    for (let n = 1; n <= 4; n++) {
      const active = jump && (n === jump.from || n === jump.to);
      g.save();
      g.strokeStyle = active ? hue : cssVar('--line');
      g.lineWidth = active ? 2 : 1.2;
      if (!active) g.setLineDash([3, 4]);
      g.beginPath(); g.arc(cx, cy, rOf(n), 0, Math.PI * 2); g.stroke();
      g.restore();
      c2d.text(g, `n=${n}`, cx + rOf(n) + 2, cy - rOf(n) * 0.28,
        { size: 9, weight: 700, color: active ? hue : cssVar('--ink-4'), align: 'left' });
    }

    // the electron, mid-jump
    const nNow = jump ? lerp(jump.from, jump.to, k) : 3;
    const ang = t * 3.2;
    const rNow = rOf(nNow);
    const ex = cx + Math.cos(ang) * rNow;
    const ey = cy + Math.sin(ang) * rNow;
    g.fillStyle = cssVar('--chart-1');
    g.beginPath(); g.arc(ex, ey, 5.5, 0, Math.PI * 2); g.fill();
    g.strokeStyle = cssVar('--bg-2'); g.lineWidth = 2; g.stroke();

    // the emitted photon, flying off after the jump
    if (jump && k >= 1) {
      const fly = phase(t, jumpStart + 0.09, jumpStart + 0.17);
      g.save();
      g.globalAlpha = 1 - fly * 0.4;
      g.strokeStyle = jump.colour;
      g.lineWidth = 2.4;
      g.beginPath();
      const px = ex + fly * (w * 0.34);
      for (let i = 0; i <= 24; i++) {
        const x = px + i * 2.2;
        const y = ey + Math.sin(i * 0.9) * 5;
        i ? g.lineTo(x, y) : g.moveTo(x, y);
      }
      g.stroke();
      g.restore();
    }

    /* ================= right: the energy ladder ================= */
    const lx = w * 0.56, lw = w * 0.16;
    const topY = 34, botY = h - 74;
    const Ey = (n) => botY - ((E(n) + RY) / RY) * (botY - topY);

    // The levels genuinely crowd together as n grows - that is the point of the
    // diagram - so only the two levels in play carry an energy label, and those
    // two are nudged apart vertically (the upper one up, the lower one down)
    // so that even a 4 -> 3 jump stays legible.
    for (let n = 1; n <= 5; n++) {
      const active = jump && (n === jump.from || n === jump.to);
      c2d.line(g, lx, Ey(n), lx + lw, Ey(n), {
        color: active ? hue : cssVar('--line'), width: active ? 2.4 : 1.4
      });
      if (!active) continue;
      const nudge = n === jump.from ? -7 : 7;
      c2d.text(g, `n=${n}`, lx - 6, Ey(n) + nudge,
        { size: 9, weight: 800, color: hue, align: 'right' });
      c2d.text(g, `${E(n).toFixed(2)} eV`, lx + lw + 6, Ey(n) + nudge,
        { size: 9, weight: 700, color: hue, align: 'left' });
    }
    c2d.text(g, 'n=∞', lx - 6, Ey(50), { size: 9, weight: 700, color: ink, align: 'right' });
    c2d.text(g, '0 eV', lx + lw + 6, Ey(50), { size: 9, weight: 700, color: ink, align: 'left' });

    if (jump) {
      const y1 = Ey(jump.from), y2 = Ey(jump.to);
      const ax = lx + lw * 0.5;
      c2d.arrow(g, ax, y1, ax, lerp(y1, y2, k), { color: jump.colour, width: 3, head: 9 });
      if (k >= 1) {
        const dE = E(jump.from) - E(jump.to);
        c2d.text(g, `ΔE = ${dE.toFixed(2)} eV`, ax, (y1 + y2) / 2 - 12,
          { size: 10, weight: 800, color: jump.colour });
      }
    }

    /* ================= bottom: the spectrum ================= */
    const sy = h - 44;
    const sx0 = 24, sx1 = w - 24;
    g.fillStyle = cssVar('--bg-0');
    c2d.roundRect(g, sx0, sy, sx1 - sx0, 26, 5); g.fill();
    g.strokeStyle = cssVar('--line'); g.lineWidth = 1; g.stroke();
    c2d.text(g, 'UV', sx0 + 14, sy + 13, { size: 9, weight: 700, color: cssVar('--ink-4') });
    c2d.text(g, 'visible', (sx0 + sx1) / 2, sy + 13, { size: 9, weight: 700, color: cssVar('--ink-4') });
    c2d.text(g, 'IR', sx1 - 12, sy + 13, { size: 9, weight: 700, color: cssVar('--ink-4') });

    // lines accumulate as each jump completes
    const logMap = (nm) => {
      const a = Math.log10(100), b = Math.log10(2000);
      return sx0 + ((Math.log10(nm) - a) / (b - a)) * (sx1 - sx0);
    };
    JUMPS.forEach((j, i) => {
      const done = i < idx || (i === idx && k >= 1);
      if (!done) return;
      const nm = lambda(j.from, j.to);
      const x = logMap(nm);
      c2d.line(g, x, sy + 2, x, sy + 24, { color: j.colour, width: 3 });
      if (i === idx) {
        c2d.text(g, j.label, x, sy - 10, { size: 10, weight: 800, color: j.colour });
      }
    });

    if (jump) {
      readout(g, 14, 12, [
        `${jump.from} → ${jump.to}  (${jump.series})`,
        `λ = ${lambda(jump.from, jump.to).toFixed(0)} nm`
      ], { hue: jump.colour });
    }
  }
};
