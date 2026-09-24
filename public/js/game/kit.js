/**
 * kit.js - the shared toolkit every simulation is built from.
 *
 * Twenty-two widgets ship with this app. Without a common kit each would
 * reinvent retina canvas setup, pointer dragging and score chrome, and they
 * would drift apart visually. Everything reusable lives here; a widget file
 * then contains only the physics/chemistry/maths that makes it different.
 *
 * A widget module exports:
 *   { id, mount(root, ctx) -> { destroy() } }
 * where ctx = { topic, hue, report(score, meta), sfx, fx, rng }
 */

import { h, clear, append } from '../core/dom.js';
import { renderInline, renderMath } from '../core/mathlite.js';
import { sfx } from '../core/audio.js';

/* ================================================================== */
/* chrome                                                              */
/* ================================================================== */

/**
 * Build the arcade cabinet around a widget.
 * @returns {{root, stage, panel, foot, setScore, setBest, setHint, overlay, clearOverlay}}
 */
export function arcade(host, {
  title = 'Simulation',
  badge = 'Interactive',
  hint = '',
  best = null,
  onRestart = null
} = {}) {
  const scoreEl = h('span', null, '0');
  const bestEl = h('span', null, best === null ? '—' : String(best));
  const hintEl = h('div.arcade__hint', null, hint);

  const stage = h('div.arcade__stage');
  const panel = h('div.arcade__panel');
  const foot = h('div.arcade__foot', null,
    hintEl,
    onRestart ? h('button.btn.btn--sm.btn--ghost', { onClick: () => { sfx.click(); onRestart(); } }, '↺ Restart') : null
  );

  const root = h('div.arcade', null,
    h('div.arcade__head', null,
      h('span.arcade__badge', null, badge),
      h('span.arcade__title', null, title),
      h('div.arcade__score', null,
        'SCORE ', h('b', null, scoreEl),
        h('span.dim', null, '·'),
        'BEST ', h('b', null, bestEl)
      )
    ),
    stage, panel, foot
  );

  host.appendChild(root);

  return {
    root, stage, panel, foot,
    setScore: (n) => { scoreEl.textContent = String(n); },
    setBest: (n) => { bestEl.textContent = String(n); },
    setHint: (t) => { clear(hintEl); append(hintEl, [typeof t === 'string' ? renderInline(t) : t]); },
    overlay: (...children) => {
      const ov = h('div.arcade__overlay', null, h('div', null, children));
      stage.appendChild(ov);
      return ov;
    },
    clearOverlay: () => stage.querySelectorAll('.arcade__overlay').forEach((n) => n.remove())
  };
}

/* ================================================================== */
/* canvas                                                              */
/* ================================================================== */

/**
 * A retina-correct canvas with an optional animation loop.
 * `draw(ctx, w, h, t)` receives CSS pixels, not device pixels.
 *
 * @returns {{canvas, redraw, stop, pointer, size}}
 */
export function canvasLayer(host, {
  height = 300,
  aspect = null,          // width/height ratio; overrides `height` when set
  animate = false,
  draw = () => {},
  onPointer = null        // (type, {x, y, event}) => void
}) {
  const canvas = h('canvas.arcade__canvas');
  host.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let w = 0, hgt = 0, dpr = 1, raf = 0, t0 = performance.now(), alive = true;

  function size() {
    const rect = canvas.getBoundingClientRect();
    w = Math.max(120, rect.width || host.clientWidth || 320);
    hgt = aspect ? Math.round(w / aspect) : height;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.style.height = hgt + 'px';
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(hgt * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function redraw() {
    if (!alive) return;
    ctx.clearRect(0, 0, w, hgt);
    draw(ctx, w, hgt, (performance.now() - t0) / 1000);
  }

  function loop() {
    if (!alive) return;
    redraw();
    raf = requestAnimationFrame(loop);
  }

  const ro = new ResizeObserver(() => { size(); redraw(); });
  ro.observe(canvas);
  size();

  if (animate) raf = requestAnimationFrame(loop);
  else requestAnimationFrame(redraw);

  if (onPointer) {
    const pos = (e) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top, event: e };
    };
    const down = (e) => { canvas.setPointerCapture?.(e.pointerId); onPointer('down', pos(e)); };
    const move = (e) => onPointer('move', pos(e));
    const up = (e) => { canvas.releasePointerCapture?.(e.pointerId); onPointer('up', pos(e)); };
    canvas.addEventListener('pointerdown', down);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);
    canvas.addEventListener('pointerleave', (e) => onPointer('leave', pos(e)));
  }

  return {
    canvas, redraw,
    get width() { return w; },
    get height() { return hgt; },
    stop() { alive = false; cancelAnimationFrame(raf); ro.disconnect(); }
  };
}

/** Read a CSS custom property as a concrete colour, for canvas fills. */
export function cssVar(name, el = document.body) {
  return getComputedStyle(el).getPropertyValue(name).trim() || '#4cc9f0';
}

/** Common canvas helpers. */
export const c2d = {
  roundRect(ctx, x, y, w, h, r = 8) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  },
  text(ctx, str, x, y, { size = 13, weight = 600, color = '#fff', align = 'center', baseline = 'middle', font = 'var(--font-ui)' } = {}) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = baseline;
    ctx.font = `${weight} ${size}px ${font === 'mono' ? 'Consolas, monospace' : '"Segoe UI", system-ui, sans-serif'}`;
    ctx.fillText(str, x, y);
    ctx.restore();
  },
  line(ctx, x1, y1, x2, y2, { color = '#888', width = 1, dash = null } = {}) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    if (dash) ctx.setLineDash(dash);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  },
  arrow(ctx, x1, y1, x2, y2, { color = '#888', width = 2, head = 8 } = {}) {
    const a = Math.atan2(y2 - y1, x2 - x1);
    ctx.save();
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = width;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - head * Math.cos(a - 0.4), y2 - head * Math.sin(a - 0.4));
    ctx.lineTo(x2 - head * Math.cos(a + 0.4), y2 - head * Math.sin(a + 0.4));
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }
};

/* ================================================================== */
/* controls                                                            */
/* ================================================================== */

export function slider({ label, min = 0, max = 100, step = 1, value = 50, unit = '', fmt = null, onInput }) {
  const valEl = h('span.ctrl__val', null, (fmt ? fmt(value) : value) + unit);
  const input = h('input', {
    type: 'range', min, max, step, value,
    'aria-label': label,
    onInput: (e) => {
      const v = Number(e.target.value);
      valEl.textContent = (fmt ? fmt(v) : v) + unit;
      onInput(v);
    }
  });
  const root = h('div.ctrl', null,
    h('div.ctrl__row', null, h('span.ctrl__label', null, label), valEl),
    input
  );
  return {
    root, input,
    set(v) { input.value = v; valEl.textContent = (fmt ? fmt(v) : v) + unit; },
    get() { return Number(input.value); }
  };
}

export function readouts(items) {
  const cells = new Map();
  const root = h('div.readouts');
  for (const it of items) {
    const v = h('div.readout__v', null, String(it.value ?? '—'));
    const cell = h('div.readout', null, v, h('div.readout__k', null, it.label));
    cells.set(it.key, { cell, v });
    root.appendChild(cell);
  }
  return {
    root,
    set(key, value, tone = null) {
      const c = cells.get(key);
      if (!c) return;
      c.v.textContent = String(value);
      c.cell.className = 'readout' + (tone ? ` readout--${tone}` : '');
      c.cell.dataset.flash = 'true';
      setTimeout(() => { c.cell.dataset.flash = 'false'; }, 430);
    },
    setMath(key, tex) {
      const c = cells.get(key);
      if (!c) return;
      clear(c.v);
      c.v.appendChild(renderMath(tex));
    }
  };
}

export function btn(label, onClick, { kind = '', size = 'sm', icon = null } = {}) {
  return h(`button.btn.btn--${size}${kind ? '.btn--' + kind : ''}`, {
    onClick: (e) => { sfx.click(); onClick(e); }
  }, icon ? h('span', null, icon) : null, label);
}

export function seg(options, value, onChange) {
  const buttons = options.map((o) =>
    h('button', {
      'aria-pressed': String(o.value === value),
      onClick: (e) => {
        sfx.click();
        [...e.currentTarget.parentElement.children].forEach((b) => b.setAttribute('aria-pressed', 'false'));
        e.currentTarget.setAttribute('aria-pressed', 'true');
        onChange(o.value);
      }
    }, o.label));
  return h('div.seg', null, buttons);
}

/** A row of clickable answer choices used by the quiz-style widgets. */
export function choices(items, onPick) {
  const root = h('div.tiles');
  items.forEach((it) => {
    const b = h('button.tile', {
      onClick: () => onPick(it.value, b)
    }, typeof it.label === 'string' ? renderInline(it.label) : it.label);
    root.appendChild(b);
  });
  return root;
}

/* ================================================================== */
/* drag and drop                                                       */
/* ================================================================== */

/**
 * Pointer-based drag and drop that works with touch, pen and mouse.
 * HTML5 drag-and-drop is not used: it has no touch support on mobile, which
 * would break half the widgets on a phone.
 *
 * @param {object} o
 * @param {HTMLElement} o.container scope for hit-testing slots
 * @param {string} o.tileSel  selector for draggable tiles
 * @param {string} o.slotSel  selector for drop targets
 * @param {(tile, slot) => boolean} o.onDrop return true to accept
 */
export function dragDrop({ container, tileSel = '.tile', slotSel = '.slot', onDrop }) {
  let ghost = null, source = null, activeSlot = null;

  const slotUnder = (x, y) => {
    for (const s of container.querySelectorAll(slotSel)) {
      const r = s.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return s;
    }
    return null;
  };

  const onDown = (e) => {
    const tile = e.target.closest(tileSel);
    if (!tile || tile.dataset.placed === 'true' || !container.contains(tile)) return;
    e.preventDefault();
    source = tile;
    tile.dataset.dragging = 'true';

    ghost = tile.cloneNode(true);
    ghost.classList.add('tile--ghost');
    ghost.dataset.dragging = 'false';
    ghost.style.width = tile.offsetWidth + 'px';
    document.body.appendChild(ghost);
    moveGhost(e.clientX, e.clientY);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const moveGhost = (x, y) => {
    if (!ghost) return;
    ghost.style.left = (x - ghost.offsetWidth / 2) + 'px';
    ghost.style.top = (y - ghost.offsetHeight / 2) + 'px';
  };

  const onMove = (e) => {
    moveGhost(e.clientX, e.clientY);
    const s = slotUnder(e.clientX, e.clientY);
    if (s !== activeSlot) {
      if (activeSlot) activeSlot.dataset.over = 'false';
      activeSlot = s;
      if (activeSlot) activeSlot.dataset.over = 'true';
    }
  };

  const onUp = (e) => {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    ghost?.remove(); ghost = null;
    if (activeSlot) activeSlot.dataset.over = 'false';

    const slot = slotUnder(e.clientX, e.clientY);
    if (source) source.dataset.dragging = 'false';
    if (slot && source) onDrop(source, slot);
    source = null; activeSlot = null;
  };

  container.addEventListener('pointerdown', onDown);

  // Keyboard fallback: click a tile then click a slot.
  let picked = null;
  const onClick = (e) => {
    const tile = e.target.closest(tileSel);
    const slot = e.target.closest(slotSel);
    if (tile && tile.dataset.placed !== 'true') {
      container.querySelectorAll(tileSel).forEach((t) => t.classList.remove('tile--picked'));
      picked = picked === tile ? null : tile;
      if (picked) { picked.classList.add('tile--picked'); sfx.pop(); }
      return;
    }
    if (slot && picked) {
      onDrop(picked, slot);
      picked.classList.remove('tile--picked');
      picked = null;
    }
  };
  container.addEventListener('click', onClick);

  return {
    destroy() {
      container.removeEventListener('pointerdown', onDown);
      container.removeEventListener('click', onClick);
      ghost?.remove();
    }
  };
}

/* ================================================================== */
/* misc                                                                */
/* ================================================================== */

/**
 * Hatched ground line. Lives here rather than in anim/kit because both the
 * simulations and the animations draw bodies falling onto it.
 */
export function ground(g, x1, x2, y, { color = null } = {}) {
  const c = color || cssVar('--ink-4');
  c2d.line(g, x1, y, x2, y, { color: c, width: 2 });
  for (let x = x1; x < x2; x += 9) c2d.line(g, x, y, x - 6, y + 7, { color: c, width: 1 });
}

/** Deterministic RNG so a "daily challenge" can be reproducible. */
export function rng(seed = Date.now()) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const pick = (arr, r = Math.random) => arr[Math.floor(r() * arr.length)];

export function shuffle(arr, r = Math.random) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const round = (v, d = 2) => Number(v.toFixed(d));

/** Format a number the way a physics answer sheet would. */
export function sci(v, sig = 3) {
  if (v === 0) return '0';
  const exp = Math.floor(Math.log10(Math.abs(v)));
  if (exp >= -3 && exp < 5) return Number(v.toPrecision(sig)).toString();
  const mant = v / Math.pow(10, exp);
  return `${Number(mant.toPrecision(sig))}×10${sup(exp)}`;
}
const SUPS = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
export const sup = (n) => String(n).split('').map((c) => SUPS[c] ?? c).join('');

/** A countdown that renders itself; used by the timed widgets. */
export function countdown(seconds, onTick, onEnd) {
  const el = h('span.timer', null, '⏱ ', h('span', null, String(seconds)));
  const num = el.lastChild;
  let left = seconds;
  const id = setInterval(() => {
    left -= 1;
    num.textContent = String(Math.max(0, left));
    el.dataset.warn = String(left <= 5);
    onTick?.(left);
    if (left <= 0) { clearInterval(id); onEnd?.(); }
  }, 1000);
  return { el, stop: () => clearInterval(id), get left() { return left; } };
}

/** Feedback line shown under a widget. */
export function verdictLine(ok, text) {
  return h('div.verdict' + (ok ? '.verdict--ok' : '.verdict--bad'), null,
    h('div.verdict__head', null, ok ? '✓ Correct' : '✗ Not quite'),
    h('div.verdict__body', null, typeof text === 'string' ? renderInline(text) : text));
}

/** Standard "you cleared it" panel. */
export function cleared(score, best, onAgain, extra = null) {
  return h('div', null,
    h('div', { style: { fontSize: '2.4rem', marginBottom: '8px' } }, '✨'),
    h('h3', null, 'Module calibrated'),
    h('p.muted', null, `Score ${score}${best !== null ? ` · best ${best}` : ''}`),
    extra,
    h('div.btnbar', { style: { justifyContent: 'center', marginTop: '12px' } },
      btn('Play again', onAgain, { kind: 'primary', size: 'sm' }))
  );
}
