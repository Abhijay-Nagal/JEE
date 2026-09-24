/**
 * anim/kit.js - drawing helpers for concept animations.
 *
 * A concept animation is not a game. It has no score and nothing to win: it
 * exists to make one idea visible, and the learner drives it with a scrub bar
 * so they can stop exactly where they are confused. That different purpose is
 * why these live apart from game/widgets, even though both draw to a canvas.
 *
 * A scene module exports:
 *
 *   export default {
 *     id, title, caption,          // caption = one-line summary under the title
 *     duration,                    // seconds for one pass
 *     loop,                        // replay automatically
 *     steps: [{ at, text }],       // narration, revealed as `t` passes each `at`
 *     draw(g, w, h, t, api)        // t is 0..1
 *   }
 */

import { cssVar, c2d, ground } from '../game/kit.js';

export { cssVar, c2d, ground };

/* ------------------------------------------------------------------ */
/* easing                                                              */
/* ------------------------------------------------------------------ */

export const ease = {
  linear: (t) => t,
  inOut: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  out: (t) => 1 - Math.pow(1 - t, 3),
  in: (t) => t * t * t,
  bounceOut: (t) => {
    const n = 7.5625, d = 2.75;
    if (t < 1 / d) return n * t * t;
    if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75;
    if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375;
    return n * (t -= 2.625 / d) * t + 0.984375;
  }
};

/** Map t from [a,b] onto [0,1], clamped. Scenes are built out of these. */
export function phase(t, a, b, easing = ease.linear) {
  if (t <= a) return 0;
  if (t >= b) return 1;
  return easing((t - a) / (b - a));
}

/** True while t is inside [a, b) - for showing an element during one beat. */
export const during = (t, a, b) => t >= a && t < b;

export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/* ------------------------------------------------------------------ */
/* common furniture                                                    */
/* ------------------------------------------------------------------ */

/**
 * A labelled set of axes with a mapping function pair.
 * Returns { X, Y, plot } where plot is the inner rect.
 */
export function axes(g, w, h, {
  xmin = 0, xmax = 10, ymin = 0, ymax = 10,
  xlabel = '', ylabel = '',
  padL = 44, padR = 16, padT = 16, padB = 34,
  grid = true, xticks = 5, yticks = 4,
  fmtX = (v) => String(Math.round(v * 10) / 10),
  fmtY = (v) => String(Math.round(v * 10) / 10)
} = {}) {
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;
  const X = (x) => padL + ((x - xmin) / (xmax - xmin)) * plotW;
  const Y = (y) => padT + plotH - ((y - ymin) / (ymax - ymin)) * plotH;

  const line = cssVar('--chart-grid');
  const ink = cssVar('--chart-ink');

  if (grid) {
    g.save();
    g.strokeStyle = line;
    g.lineWidth = 1;
    for (let i = 0; i <= xticks; i++) {
      const x = X(xmin + ((xmax - xmin) * i) / xticks);
      g.beginPath(); g.moveTo(x, padT); g.lineTo(x, padT + plotH); g.stroke();
    }
    for (let i = 0; i <= yticks; i++) {
      const y = Y(ymin + ((ymax - ymin) * i) / yticks);
      g.beginPath(); g.moveTo(padL, y); g.lineTo(padL + plotW, y); g.stroke();
    }
    g.restore();
  }

  // axes themselves, drawn through zero when zero is in range
  const ax = xmin <= 0 && xmax >= 0 ? X(0) : padL;
  const ay = ymin <= 0 && ymax >= 0 ? Y(0) : padT + plotH;
  c2d.line(g, padL, ay, padL + plotW, ay, { color: ink, width: 1.4 });
  c2d.line(g, ax, padT, ax, padT + plotH, { color: ink, width: 1.4 });

  for (let i = 0; i <= xticks; i++) {
    const v = xmin + ((xmax - xmin) * i) / xticks;
    c2d.text(g, fmtX(v), X(v), ay + 13, { size: 9, color: ink });
  }
  for (let i = 0; i <= yticks; i++) {
    const v = ymin + ((ymax - ymin) * i) / yticks;
    if (Math.abs(v) < 1e-9 && xmin <= 0 && xmax >= 0) continue;
    c2d.text(g, fmtY(v), ax - 7, Y(v), { size: 9, color: ink, align: 'right' });
  }

  if (xlabel) c2d.text(g, xlabel, padL + plotW, h - 6, { size: 10, weight: 700, color: ink, align: 'right' });
  if (ylabel) {
    g.save();
    g.translate(11, padT + 4);
    c2d.text(g, ylabel, 0, 0, { size: 10, weight: 700, color: ink, align: 'left', baseline: 'top' });
    g.restore();
  }

  return { X, Y, padL, padT, plotW, plotH };
}

/** Plot y = f(x) over [from, to], clipped to the plot box. */
export function curve(g, { X, Y }, f, from, to, { color = null, width = 2.4, dash = null, steps = 240 } = {}) {
  g.save();
  g.strokeStyle = color || cssVar('--chart-1');
  g.lineWidth = width;
  g.lineJoin = 'round';
  g.lineCap = 'round';
  if (dash) g.setLineDash(dash);
  g.beginPath();
  let pen = false;
  for (let i = 0; i <= steps; i++) {
    const x = from + ((to - from) * i) / steps;
    const y = f(x);
    if (!Number.isFinite(y)) { pen = false; continue; }
    const px = X(x), py = Y(y);
    if (!pen) { g.moveTo(px, py); pen = true; } else g.lineTo(px, py);
  }
  g.stroke();
  g.restore();
}

/** Shade the area under f between two x values - used for "area = displacement". */
export function areaUnder(g, { X, Y }, f, from, to, { color = null, alpha = 0.18, steps = 120 } = {}) {
  if (to <= from) return;
  g.save();
  g.globalAlpha = alpha;
  g.fillStyle = color || cssVar('--chart-1');
  g.beginPath();
  g.moveTo(X(from), Y(0));
  for (let i = 0; i <= steps; i++) {
    const x = from + ((to - from) * i) / steps;
    g.lineTo(X(x), Y(f(x)));
  }
  g.lineTo(X(to), Y(0));
  g.closePath();
  g.fill();
  g.restore();
}

/** A moving body with an optional motion trail. */
export function body(g, x, y, r, { color = null, trail = null, label = null, glow = true } = {}) {
  const c = color || cssVar('--chart-1');
  if (trail && trail.length > 1) {
    g.save();
    g.strokeStyle = c;
    g.globalAlpha = 0.35;
    g.lineWidth = 2;
    g.setLineDash([3, 4]);
    g.beginPath();
    trail.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)));
    g.stroke();
    g.restore();
  }
  if (glow) {
    g.save();
    g.globalAlpha = 0.22;
    g.fillStyle = c;
    g.beginPath(); g.arc(x, y, r * 2.1, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  g.fillStyle = c;
  g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  g.strokeStyle = cssVar('--bg-1'); g.lineWidth = 2; g.stroke();
  if (label) c2d.text(g, label, x, y - r - 10, { size: 11, weight: 800, color: c });
}

/** A labelled vector arrow. */
export function vector(g, x1, y1, x2, y2, { color = null, label = null, width = 2.4, dashed = false } = {}) {
  const c = color || cssVar('--chart-2');
  if (Math.hypot(x2 - x1, y2 - y1) < 1.5) return;
  g.save();
  if (dashed) g.setLineDash([5, 4]);
  c2d.arrow(g, x1, y1, x2, y2, { color: c, width, head: 9 });
  g.restore();
  if (label) {
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    const nx = -(y2 - y1), ny = x2 - x1;
    const len = Math.hypot(nx, ny) || 1;
    c2d.text(g, label, mx + (nx / len) * 14, my + (ny / len) * 14, { size: 11, weight: 800, color: c });
  }
}

/** A dimension line with ticks at both ends, for showing a measured span. */
export function span(g, x1, y1, x2, y2, label, { color = null, offset = 0 } = {}) {
  const c = color || cssVar('--ink-3');
  const nx = -(y2 - y1), ny = x2 - x1;
  const len = Math.hypot(nx, ny) || 1;
  const ox = (nx / len) * offset, oy = (ny / len) * offset;
  c2d.line(g, x1 + ox, y1 + oy, x2 + ox, y2 + oy, { color: c, width: 1.4 });
  c2d.line(g, x1 + ox - (ny / len) * 5, y1 + oy + (nx / len) * 5, x1 + ox + (ny / len) * 5, y1 + oy - (nx / len) * 5, { color: c, width: 1.4 });
  c2d.line(g, x2 + ox - (ny / len) * 5, y2 + oy + (nx / len) * 5, x2 + ox + (ny / len) * 5, y2 + oy - (nx / len) * 5, { color: c, width: 1.4 });
  if (label) {
    c2d.text(g, label, (x1 + x2) / 2 + ox + (nx / len) * 11, (y1 + y2) / 2 + oy + (ny / len) * 11,
      { size: 11, weight: 700, color: c });
  }
}

/** A translucent pill holding a live readout, pinned to a corner. */
export function readout(g, x, y, lines, { align = 'left', hue = null } = {}) {
  const pad = 8;
  const lh = 15;
  const w = Math.max(...lines.map((l) => l.length)) * 6.6 + pad * 2;
  const h = lines.length * lh + pad * 2 - 3;
  const left = align === 'right' ? x - w : x;

  g.save();
  g.globalAlpha = 0.9;
  g.fillStyle = cssVar('--bg-2');
  c2d.roundRect(g, left, y, w, h, 7);
  g.fill();
  g.strokeStyle = hue || cssVar('--line');
  g.lineWidth = 1;
  g.stroke();
  g.restore();

  lines.forEach((l, i) => {
    c2d.text(g, l, left + pad, y + pad + i * lh + 5, {
      size: 11, weight: 700, font: 'mono', align: 'left', baseline: 'middle',
      color: i === 0 ? (hue || cssVar('--ink-1')) : cssVar('--ink-2')
    });
  });
}

/** Subject hue for a scene, so animations match the chapter they sit in. */
export const hueFor = (subject) => cssVar(`--${subject}`) || cssVar('--primary');
