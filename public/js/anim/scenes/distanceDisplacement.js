/**
 * Distance vs displacement.
 *
 * Students can recite "one is scalar, one is vector" and still add them
 * wrongly. Walking a body along a path while both quantities tick upward -
 * and then bringing it home so one collapses to zero - fixes it for good.
 */

import { cssVar, c2d, phase, lerp, ease, body, vector, readout } from '../kit.js';

/** The walked route, as fractions of the canvas. Returns {x, y} for s in 0..1. */
function route(s, w, h) {
  // Out along a curve, then back to the start by a different way.
  const pts = [
    { x: 0.12, y: 0.74 },
    { x: 0.30, y: 0.34 },
    { x: 0.52, y: 0.60 },
    { x: 0.72, y: 0.24 },
    { x: 0.86, y: 0.56 },
    { x: 0.58, y: 0.82 },
    { x: 0.12, y: 0.74 }
  ];
  const seg = s * (pts.length - 1);
  const i = Math.min(pts.length - 2, Math.floor(seg));
  const f = seg - i;
  return {
    x: lerp(pts[i].x, pts[i + 1].x, f) * w,
    y: lerp(pts[i].y, pts[i + 1].y, f) * h
  };
}

export default {
  id: 'distanceDisplacement',
  title: 'Distance and displacement are not the same number',
  caption: 'Distance counts every step you take. Displacement only asks where you ended up.',
  duration: 15,
  loop: true,
  height: 280,
  stillAt: 0.62,

  steps: [
    { at: 0.00, text: 'A body sets off from the marked start.' },
    { at: 0.14, text: 'The dotted trail is the **distance** — the actual length of the path walked. It only ever increases.' },
    { at: 0.30, text: 'The straight arrow is the **displacement** — start to current position, and it has a direction.' },
    { at: 0.48, text: 'Notice displacement can *shrink* while distance grows, whenever the body turns back.' },
    { at: 0.70, text: 'Now it returns to where it began.' },
    { at: 0.82, text: 'Distance is a large positive number. Displacement is **exactly zero** — the arrow has vanished.' },
    { at: 0.92, text: 'So $|\\text{displacement}| \\leq \\text{distance}$, always, with equality only for motion in a straight line without reversing.' }
  ],

  draw(g, w, h, t) {
    const hue = cssVar('--physics');
    const accent = cssVar('--accent');
    const ink = cssVar('--ink-3');

    const pad = 12;
    const pw = w - pad * 2, ph = h - 64;

    const s = phase(t, 0.06, 0.88, ease.inOut);
    const start = route(0, pw, ph);
    const now = route(s, pw, ph);

    const ox = pad, oy = 16;
    const P = (p) => ({ x: p.x + ox, y: p.y + oy });

    /* ---- the path walked so far, and its length ---- */
    const trail = [];
    let dist = 0;
    const N = 220;
    let prev = route(0, pw, ph);
    for (let i = 0; i <= N; i++) {
      const u = (i / N) * s;
      const p = route(u, pw, ph);
      trail.push(P(p));
      dist += Math.hypot(p.x - prev.x, p.y - prev.y);
      prev = p;
    }

    // faint preview of the whole route
    g.save();
    g.globalAlpha = 0.14;
    g.strokeStyle = ink;
    g.lineWidth = 2;
    g.setLineDash([2, 6]);
    g.beginPath();
    for (let i = 0; i <= 160; i++) {
      const p = P(route(i / 160, pw, ph));
      i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y);
    }
    g.stroke();
    g.restore();

    // the walked trail
    g.save();
    g.strokeStyle = hue;
    g.lineWidth = 3;
    g.lineJoin = 'round';
    g.lineCap = 'round';
    g.setLineDash([6, 5]);
    g.beginPath();
    trail.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)));
    g.stroke();
    g.restore();

    /* ---- displacement arrow ---- */
    const A = P(start), B = P(now);
    const disp = Math.hypot(B.x - A.x, B.y - A.y);
    if (disp > 4) {
      vector(g, A.x, A.y, B.x, B.y, { color: accent, label: 'displacement', width: 3 });
    } else if (t > 0.8) {
      g.save();
      g.globalAlpha = 0.9;
      c2d.text(g, 'displacement = 0', B.x, B.y - 30, { size: 12, weight: 900, color: accent });
      g.restore();
    }

    /* ---- markers ---- */
    g.fillStyle = cssVar('--ok');
    g.beginPath(); g.arc(A.x, A.y, 6, 0, Math.PI * 2); g.fill();
    c2d.text(g, 'start', A.x, A.y + 20, { size: 10, weight: 800, color: cssVar('--ok') });

    body(g, B.x, B.y, 9, { color: hue });

    /* ---- live numbers ---- */
    // Scale the canvas metres so the figures look like a real walk.
    const metres = (px) => px / (pw / 100);
    readout(g, w - 14, h - 52, [
      `distance     = ${metres(dist).toFixed(1)} m`,
      `displacement = ${metres(disp).toFixed(1)} m`,
      `ratio        = ${dist > 1 ? (disp / dist).toFixed(2) : '—'}`
    ], { align: 'right', hue: accent });

    /* ---- closing statement ---- */
    if (t > 0.9) {
      g.save();
      g.globalAlpha = phase(t, 0.9, 0.96);
      c2d.text(g, '|displacement|  ≤  distance', 16, h - 14,
        { size: 12, weight: 800, color: hue, align: 'left' });
      g.restore();
    }
  }
};
