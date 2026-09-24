/**
 * The photoelectric effect - why brightness cannot substitute for frequency.
 *
 * The experiment that forced light to be particles. The animation runs the
 * two controls independently: crank the intensity below threshold and nothing
 * happens at all; nudge the frequency past it and electrons come out
 * immediately, however dim the beam.
 */

import { cssVar, c2d, phase, during, lerp, ease, axes, curve, readout } from '../kit.js';

const H = 4.136e-15;     // eV s, so energies come out in electronvolts
const NU0 = 1.0;         // threshold, in units of 10^15 Hz
const W = H * NU0 * 1e15; // work function in eV

export default {
  id: 'photoelectric',
  title: 'The photoelectric effect',
  caption: 'Below the threshold frequency, no amount of brightness ejects a single electron.',
  duration: 18,
  loop: true,
  height: 320,
  stillAt: 0.8,

  steps: [
    { at: 0.00, text: 'Shine light on a metal surface and electrons may be emitted. The question is what controls it.' },
    { at: 0.12, text: 'Start with **low frequency** light, turned up very bright.' },
    { at: 0.26, text: 'Nothing. No electrons at all, no matter how intense — and with **no delay** to wait out. Wave theory cannot explain either fact.' },
    { at: 0.40, text: 'Now raise the frequency past the **threshold** $\\nu_0$.' },
    { at: 0.52, text: 'Electrons come out instantly, even from a dim beam. Each one absorbs a single photon of energy $h\\nu$.' },
    { at: 0.66, text: 'Part of that energy pays the **work function** $\\phi$; the rest becomes kinetic energy.' },
    { at: 0.78, text: '$KE_{\\max} = h\\nu - \\phi$. Plot it against $\\nu$ and you get a straight line of slope $h$.' },
    { at: 0.90, text: 'Brightness changes **how many** electrons. Frequency changes **how fast** they leave. That split is the quantum.' }
  ],

  draw(g, w, h, t) {
    const hue = cssVar('--chemistry');
    const accent = cssVar('--accent');
    const bad = cssVar('--bad');
    const ok = cssVar('--ok');

    // Frequency sweeps up past the threshold partway through.
    const nu = t < 0.36 ? 0.62 : lerp(0.62, 2.1, phase(t, 0.36, 0.86, ease.inOut));
    const above = nu > NU0;
    const ke = Math.max(0, H * nu * 1e15 - W);
    // Intensity is high early (to prove it does not matter), then dropped.
    const intensity = t < 0.36 ? 1 : 0.35;

    /* ================= left: the apparatus ================= */
    const plateX = w * 0.40;
    const midY = h * 0.34;

    // the metal plate
    g.fillStyle = cssVar('--bg-4');
    c2d.roundRect(g, plateX, midY - 62, 16, 124, 3); g.fill();
    g.strokeStyle = cssVar('--ink-3'); g.lineWidth = 1; g.stroke();
    c2d.text(g, 'metal', plateX + 8, midY + 78, { size: 10, weight: 800, color: cssVar('--ink-4') });

    // incoming photons
    const photonColour = above ? '#8f63e8' : '#e05a2b';
    const count = Math.round(4 + intensity * 7);
    for (let i = 0; i < count; i++) {
      const lane = midY - 50 + (i * 100) / Math.max(1, count - 1);
      const speed = 0.9 + (i % 3) * 0.12;
      const px = ((t * 900 * speed + i * 63) % (plateX - 26)) + 12;
      // a little wave packet: wavelength shrinks as frequency rises
      g.save();
      g.globalAlpha = 0.85;
      g.strokeStyle = photonColour;
      g.lineWidth = 2;
      g.beginPath();
      const waveLen = 26 / Math.max(0.5, nu);
      for (let k = 0; k <= 20; k++) {
        const x = px - 22 + (k / 20) * 22;
        const y = lane + Math.sin((k / 20) * Math.PI * 2 * (22 / waveLen)) * 4;
        k ? g.lineTo(x, y) : g.moveTo(x, y);
      }
      g.stroke();
      g.restore();
    }

    c2d.text(g, above ? 'high frequency' : 'low frequency, high intensity',
      plateX * 0.5, midY - 78, { size: 10, weight: 800, color: photonColour });

    // ejected electrons
    if (above) {
      const n = Math.round(2 + intensity * 6);
      for (let i = 0; i < n; i++) {
        const lane = midY - 42 + (i * 84) / Math.max(1, n - 1);
        const sp = 0.6 + ke * 0.5;
        const px = plateX + 18 + ((t * 620 * sp + i * 71) % (w - plateX - 40));
        g.fillStyle = ok;
        g.beginPath(); g.arc(px, lane, 4, 0, Math.PI * 2); g.fill();
        g.save();
        g.globalAlpha = 0.3;
        g.fillStyle = ok;
        g.beginPath(); g.arc(px, lane, 8, 0, Math.PI * 2); g.fill();
        g.restore();
        if (i === 0) c2d.arrow(g, px + 8, lane, px + 14 + ke * 12, lane, { color: ok, width: 1.6, head: 5 });
      }
      c2d.text(g, 'e⁻ ejected', w * 0.78, midY - 78, { size: 10, weight: 800, color: ok });
    } else if (t > 0.18) {
      g.save();
      g.globalAlpha = 0.9;
      c2d.text(g, '✗  no emission', w * 0.74, midY, { size: 14, weight: 900, color: bad });
      c2d.text(g, 'at any intensity', w * 0.74, midY + 20, { size: 10, weight: 700, color: cssVar('--ink-4') });
      g.restore();
    }

    /* ================= right/bottom: KE vs frequency ================= */
    g.save();
    g.translate(0, h * 0.56);
    const gh = h * 0.44;
    const ax = axes(g, w, gh, {
      xmin: 0, xmax: 2.4, ymin: 0, ymax: 5,
      xlabel: 'ν (×10¹⁵ Hz)', ylabel: 'KEₘₐₓ (eV)',
      xticks: 6, yticks: 5, padB: 26, padT: 10
    });

    // the straight line, only above threshold
    curve(g, ax, (x) => Math.max(0, H * x * 1e15 - W), NU0, 2.4, { color: accent, width: 2.6 });
    // the flat zero region below it
    c2d.line(g, ax.X(0), ax.Y(0), ax.X(NU0), ax.Y(0), { color: bad, width: 2.6 });

    // threshold marker
    c2d.line(g, ax.X(NU0), ax.Y(0), ax.X(NU0), ax.Y(5), { color: cssVar('--ink-4'), width: 1.4, dash: [4, 4] });
    c2d.text(g, 'ν₀', ax.X(NU0), ax.Y(5) - 8, { size: 11, weight: 800, color: cssVar('--ink-4') });

    // the live point
    g.fillStyle = above ? accent : bad;
    g.beginPath(); g.arc(ax.X(Math.min(nu, 2.4)), ax.Y(Math.min(ke, 5)), 5.5, 0, Math.PI * 2); g.fill();
    g.strokeStyle = cssVar('--bg-2'); g.lineWidth = 2; g.stroke();

    if (t > 0.78) {
      const a = phase(t, 0.78, 0.86);
      g.save();
      g.globalAlpha = a;
      c2d.text(g, 'slope = h', ax.X(1.9), ax.Y(3.4), { size: 11, weight: 800, color: accent });
      c2d.text(g, 'intercept = −ϕ', ax.X(0.5), ax.Y(0.7), { size: 10, weight: 700, color: cssVar('--ink-3') });
      g.restore();
    }
    g.restore();

    readout(g, w - 12, 12, [
      `ν  = ${nu.toFixed(2)}e15 Hz`,
      `hν = ${(H * nu * 1e15).toFixed(2)} eV`,
      `KE = ${ke.toFixed(2)} eV`
    ], { align: 'right', hue: above ? ok : bad });

    if (t > 0.88) {
      g.save();
      g.globalAlpha = phase(t, 0.88, 0.95);
      c2d.text(g, 'KEₘₐₓ = hν − ϕ', w * 0.5, h * 0.5,
        { size: 15, weight: 900, color: accent });
      g.restore();
    }
  }
};
