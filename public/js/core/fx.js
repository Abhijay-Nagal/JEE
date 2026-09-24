/**
 * fx.js - celebratory visual effects.
 *
 * A single full-screen canvas (`#fx-layer`) hosts all particles so effects
 * never reflow the page. Everything here is a no-op when the learner has
 * chosen reduced motion.
 */

import { h } from './dom.js';
import { get } from './store.js';

let canvas = null;
let ctx = null;
let particles = [];
let running = false;
let dpr = 1;

function reduced() {
  try {
    return get().settings.motion === 'reduced'
      || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch { return false; }
}

function ensureCanvas() {
  if (canvas) return canvas;
  canvas = h('canvas#fx-layer');
  document.body.appendChild(canvas);
  ctx = canvas.getContext('2d');
  resize();
  window.addEventListener('resize', resize);
  return canvas;
}

function resize() {
  if (!canvas) return;
  dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.floor(innerWidth * dpr);
  canvas.height = Math.floor(innerHeight * dpr);
  canvas.style.width = innerWidth + 'px';
  canvas.style.height = innerHeight + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function loop() {
  if (!running) return;
  ctx.clearRect(0, 0, innerWidth, innerHeight);

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.vy += p.g;
    p.vx *= p.drag;
    p.vy *= p.drag;
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;
    p.life -= 1;

    if (p.life <= 0 || p.y > innerHeight + 60) { particles.splice(i, 1); continue; }

    const alpha = Math.min(1, p.life / p.fade);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;

    if (p.shape === 'circle') {
      ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill();
    } else if (p.shape === 'star') {
      drawStar(ctx, p.size * 0.6);
    } else if (p.shape === 'text') {
      ctx.globalAlpha = alpha;
      ctx.font = `700 ${p.size}px "Segoe UI", system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(p.char, 0, 0);
    } else {
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    }
    ctx.restore();
  }

  if (particles.length) requestAnimationFrame(loop);
  else { running = false; ctx.clearRect(0, 0, innerWidth, innerHeight); }
}

function drawStar(c, r) {
  c.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 ? r * 0.45 : r;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    c[i ? 'lineTo' : 'moveTo'](Math.cos(a) * rad, Math.sin(a) * rad);
  }
  c.closePath(); c.fill();
}

function kick() {
  if (running) return;
  running = true;
  requestAnimationFrame(loop);
}

const PALETTE = ['#4cc9f0', '#3ddc97', '#ffb703', '#b28dff', '#ff5d73', '#8b93ff'];

/**
 * @param {object} o
 * @param {number} [o.x] origin px (default: centre)
 * @param {number} [o.y]
 * @param {number} [o.count]
 * @param {number} [o.spread] radians
 * @param {number} [o.power]
 * @param {string[]} [o.colors]
 * @param {string} [o.shape] square | circle | star | text
 * @param {string[]} [o.chars] for shape:'text'
 */
export function burst(o = {}) {
  if (reduced()) return;
  ensureCanvas();
  const {
    x = innerWidth / 2, y = innerHeight / 2,
    count = 40, spread = Math.PI * 2, angle = -Math.PI / 2,
    power = 9, colors = PALETTE, shape = 'square', chars = ['+'],
    gravity = 0.22, size = 9
  } = o;

  for (let i = 0; i < count; i++) {
    const a = angle + (Math.random() - 0.5) * spread;
    const v = power * (0.45 + Math.random() * 0.75);
    particles.push({
      x, y,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v,
      g: gravity, drag: 0.985,
      rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3,
      size: size * (0.65 + Math.random() * 0.75),
      color: colors[(Math.random() * colors.length) | 0],
      shape, char: chars[(Math.random() * chars.length) | 0],
      life: 70 + Math.random() * 55, fade: 45
    });
  }
  if (particles.length > 700) particles.splice(0, particles.length - 700);
  kick();
}

/** Confetti rain from the top of the viewport. */
export function confetti({ count = 110, duration = 1 } = {}) {
  if (reduced()) return;
  ensureCanvas();
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * innerWidth,
      y: -20 - Math.random() * 160 * duration,
      vx: (Math.random() - 0.5) * 3,
      vy: 2 + Math.random() * 4,
      g: 0.1, drag: 0.996,
      rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.28,
      size: 7 + Math.random() * 7,
      color: PALETTE[(Math.random() * PALETTE.length) | 0],
      shape: Math.random() < 0.25 ? 'circle' : 'square',
      life: 190 + Math.random() * 90, fade: 60
    });
  }
  kick();
}

/** Burst centred on a DOM element. */
export function burstAt(el, opts = {}) {
  if (!el) return burst(opts);
  const r = el.getBoundingClientRect();
  burst({ x: r.left + r.width / 2, y: r.top + r.height / 2, ...opts });
}

/** Floating "+40 XP" text near an element (or the top bar). */
export function floatXP(amount, anchor) {
  if (reduced()) { return; }
  const el = h('div.xp-float', null, `+${amount} XP`);
  const r = (anchor || document.querySelector('.stat-chip--xp') || document.body).getBoundingClientRect();
  el.style.left = (r.left + r.width / 2) + 'px';
  el.style.top = (r.top) + 'px';
  el.style.transform = 'translateX(-50%)';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1200);
}

/** Big centred LEVEL banner. */
export function levelUpBanner(level, rank) {
  const el = h('div.levelup', null,
    h('div.levelup__txt', null, 'Level Up'),
    h('div.levelup__lv', null, String(level)),
    h('div.levelup__txt', null, rank)
  );
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2600);
  confetti({ count: 140 });
}

/** Brief screen shake - used for boss hits and wrong answers in timed modes. */
export function shake(intensity = 6, ms = 260) {
  if (reduced()) return;
  const app = document.querySelector('.app') || document.body;
  const start = performance.now();
  const step = (now) => {
    const t = (now - start) / ms;
    if (t >= 1) { app.style.transform = ''; return; }
    const k = intensity * (1 - t);
    app.style.transform = `translate(${(Math.random() - 0.5) * k}px, ${(Math.random() - 0.5) * k}px)`;
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/** Pulse a stat chip so the learner notices the number changed. */
export function pulse(selector) {
  const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
  if (!el) return;
  el.classList.remove('pulse');
  void el.offsetWidth;
  el.classList.add('pulse');
  setTimeout(() => el.classList.remove('pulse'), 700);
}
