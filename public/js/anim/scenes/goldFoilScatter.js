/**
 * Rutherford's gold foil experiment, and why it killed the plum-pudding atom.
 *
 * The number that matters is the *rarity* of the large deflections: about one
 * in twenty thousand. Firing a stream and letting almost all of it sail
 * straight through makes the emptiness of the atom visible in a way the
 * sentence "the atom is mostly empty space" never does.
 */

import { cssVar, c2d, phase, during, lerp, ease, readout } from '../kit.js';

/** Deterministic alpha particles: same show on every replay. */
function alpha(i) {
  const r = (n, s) => {
    const x = Math.sin(n * 91.7 + s * 13.3) * 43758.5453;
    return x - Math.floor(x);
  };
  // Impact parameter, 0 = dead-on, 1 = far from any nucleus. The deflection
  // below goes as (1-b)^6, so b must be skewed toward LARGE values or most of
  // the beam bounces and the scene argues the opposite of the experiment.
  // u^0.7 lands at roughly 21 straight, 4 deflected, 1 back out of 26.
  const u = r(i, 1);
  const b = Math.pow(u, 0.7);
  return { y: (r(i, 2) - 0.5) * 1.7, b, side: r(i, 3) > 0.5 ? 1 : -1, phase: r(i, 4) };
}

const N = 26;

export default {
  id: 'goldFoilScatter',
  title: 'The gold foil experiment',
  caption: 'Fire alpha particles at a foil a few thousand atoms thick and watch what comes back.',
  duration: 18,
  loop: true,
  height: 300,
  stillAt: 0.72,

  steps: [
    { at: 0.00, text: 'Thomson’s atom was a uniform sphere of positive charge with electrons embedded in it — a plum pudding.' },
    { at: 0.12, text: 'If that were true, alpha particles should sail through a thin foil with only tiny deflections. Nothing inside is dense enough to turn them.' },
    { at: 0.26, text: 'Geiger and Marsden fired them anyway. Most did pass straight through.' },
    { at: 0.46, text: 'But a few came off at large angles — and about **1 in 20,000** bounced almost straight back.' },
    { at: 0.60, text: 'Rutherford: *"as incredible as if you fired a 15-inch shell at tissue paper and it came back and hit you."*' },
    { at: 0.72, text: 'The only explanation is a tiny, dense, positively charged **nucleus** — and a great deal of empty space.' },
    { at: 0.86, text: 'Nucleus $\\approx 10^{-15}$ m, atom $\\approx 10^{-10}$ m. The nucleus is $1/100{,}000$ of the atom’s width.' },
    { at: 0.94, text: 'By volume that is roughly a marble in a sports stadium — and it holds almost all the mass.' }
  ],

  draw(g, w, h, t) {
    const hue = cssVar('--chemistry');
    const bad = cssVar('--bad');
    const ink = cssVar('--ink-3');

    const foilX = w * 0.55;
    const midY = h * 0.46;

    /* ---- the source ---- */
    g.fillStyle = cssVar('--bg-3');
    c2d.roundRect(g, 16, midY - 26, 54, 52, 7); g.fill();
    g.strokeStyle = cssVar('--line'); g.lineWidth = 1; g.stroke();
    c2d.text(g, 'α', 43, midY, { size: 18, weight: 900, color: hue });
    c2d.text(g, 'source', 43, midY + 38, { size: 9, weight: 800, color: cssVar('--ink-4') });

    /* ---- the foil ---- */
    g.save();
    g.globalAlpha = 0.9;
    g.fillStyle = cssVar('--accent');
    g.fillRect(foilX - 4, 30, 8, h - 78);
    g.restore();
    c2d.text(g, 'gold foil', foilX, 20, { size: 10, weight: 800, color: cssVar('--accent') });

    /* ---- the detector screen ---- */
    g.save();
    g.globalAlpha = 0.5;
    g.strokeStyle = ink;
    g.lineWidth = 2;
    g.setLineDash([4, 5]);
    g.beginPath();
    g.arc(foilX, midY, Math.min(w * 0.36, h * 0.44), -Math.PI * 0.92, Math.PI * 0.92);
    g.stroke();
    g.restore();

    /* ---- nuclei inside the foil, revealed late ---- */
    const reveal = phase(t, 0.62, 0.78, ease.out);
    if (reveal > 0) {
      g.save();
      g.globalAlpha = reveal;
      for (let k = -3; k <= 3; k++) {
        const ny = midY + k * 30;
        g.fillStyle = bad;
        g.beginPath(); g.arc(foilX, ny, 2.6, 0, Math.PI * 2); g.fill();
      }
      g.restore();
      if (reveal > 0.5) {
        c2d.text(g, 'nuclei — tiny, dense, positive', foilX, h - 28,
          { size: 10, weight: 800, color: bad });
      }
    }

    /* ---- the beam ---- */
    const fire = phase(t, 0.10, 0.92);
    let straight = 0, deflected = 0, back = 0;

    for (let i = 0; i < N; i++) {
      const a = alpha(i);
      // stagger the particles along the timeline
      const local = (fire * 2.4 - a.phase * 1.4);
      if (local <= 0) continue;
      const prog = Math.min(1, local);

      const y0 = midY + a.y * 34;
      // b near 0 -> huge deflection; b near 1 -> straight through
      const angle = a.side * (Math.PI * 0.95) * Math.pow(1 - a.b, 6);
      const isBack = Math.abs(angle) > 1.6;
      const isDefl = Math.abs(angle) > 0.18;

      if (prog >= 1) { if (isBack) back++; else if (isDefl) deflected++; else straight++; }

      const R = Math.min(w * 0.36, h * 0.44);
      let px, py;
      if (prog < 0.5) {
        // inbound leg
        const k = prog / 0.5;
        px = lerp(74, foilX, k);
        py = y0;
      } else {
        // outbound leg, at the scattering angle
        const k = (prog - 0.5) / 0.5;
        px = foilX + Math.cos(angle) * R * k;
        py = y0 + Math.sin(angle) * R * k;
      }

      const colour = isBack ? bad : isDefl ? cssVar('--accent') : hue;
      g.save();
      g.globalAlpha = isBack ? 1 : isDefl ? 0.9 : 0.55;
      g.fillStyle = colour;
      g.beginPath(); g.arc(px, py, isBack ? 4.5 : 3.2, 0, Math.PI * 2); g.fill();
      if (isBack && prog > 0.5) {
        g.globalAlpha = 0.3;
        g.beginPath(); g.arc(px, py, 10, 0, Math.PI * 2); g.fill();
      }
      g.restore();
    }

    /* ---- the tally ---- */
    if (t > 0.34) {
      readout(g, w - 14, 16, [
        `straight  ${straight}`,
        `deflected ${deflected}`,
        `bounced   ${back}`
      ], { align: 'right', hue: back ? bad : hue });
    }

    /* ---- the scale comparison ---- */
    if (t > 0.86) {
      const a = phase(t, 0.86, 0.94);
      g.save();
      g.globalAlpha = a;
      const cx = w * 0.22, cy = h - 60, R = 40;
      g.strokeStyle = hue; g.lineWidth = 1.6; g.setLineDash([3, 4]);
      g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.stroke();
      g.setLineDash([]);
      g.fillStyle = bad;
      g.beginPath(); g.arc(cx, cy, 1.4, 0, Math.PI * 2); g.fill();
      c2d.text(g, 'atom 10⁻¹⁰ m', cx, cy - R - 10, { size: 9, weight: 800, color: hue });
      c2d.text(g, 'nucleus 10⁻¹⁵ m', cx + 74, cy, { size: 9, weight: 800, color: bad, align: 'left' });
      c2d.line(g, cx + 4, cy, cx + 70, cy, { color: bad, width: 1 });
      g.restore();
    }
  }
};
