/**
 * dom.js - a tiny hyperscript layer.
 *
 * Every view in this app builds real DOM nodes instead of concatenating HTML
 * strings. That keeps untrusted-looking content (question stems, user names)
 * out of innerHTML by default, and lets us attach listeners inline.
 */

const SVG_NS = 'http://www.w3.org/2000/svg';
const SVG_TAGS = new Set([
  'svg', 'g', 'path', 'circle', 'ellipse', 'rect', 'line', 'polyline', 'polygon',
  'text', 'tspan', 'defs', 'linearGradient', 'radialGradient', 'stop', 'clipPath',
  'mask', 'use', 'marker', 'filter', 'feGaussianBlur', 'feOffset', 'feMerge',
  'feMergeNode', 'animate', 'animateTransform', 'foreignObject', 'pattern', 'image'
]);

/**
 * h('div.card#id', {attrs}, ...children)
 * Tag supports `tag.class.class#id` shorthand. Attribute keys:
 *   on*      -> addEventListener (onClick, onInput, ...)
 *   style    -> object of CSS props (camelCase or custom --props)
 *   dataset  -> object of data-* values
 *   class    -> string | array | {name: bool}
 *   html     -> innerHTML (only for content we generate ourselves)
 *   ref      -> callback receiving the node
 */
export function h(tag, attrs, ...children) {
  let tagName = tag;
  const classes = [];
  let id = null;

  const idx = tag.search(/[.#]/);
  if (idx !== -1) {
    tagName = tag.slice(0, idx) || 'div';
    const rest = tag.slice(idx);
    for (const m of rest.matchAll(/([.#])([^.#]+)/g)) {
      if (m[1] === '.') classes.push(m[2]);
      else id = m[2];
    }
  }

  const isSvg = SVG_TAGS.has(tagName);
  const el = isSvg
    ? document.createElementNS(SVG_NS, tagName)
    : document.createElement(tagName);

  if (id) el.id = id;
  if (classes.length) {
    if (isSvg) el.setAttribute('class', classes.join(' '));
    else el.classList.add(...classes);
  }

  // Allow h('div', child) without an attrs object.
  if (attrs && (typeof attrs !== 'object' || attrs instanceof Node || Array.isArray(attrs))) {
    children.unshift(attrs);
    attrs = null;
  }

  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v === null || v === undefined || v === false) continue;

      if (k.startsWith('on') && typeof v === 'function') {
        el.addEventListener(k.slice(2).toLowerCase(), v);
      } else if (k === 'style' && typeof v === 'object') {
        for (const [p, val] of Object.entries(v)) {
          if (val === null || val === undefined) continue;
          if (p.startsWith('--')) el.style.setProperty(p, String(val));
          else el.style[p] = val;
        }
      } else if (k === 'dataset') {
        for (const [p, val] of Object.entries(v)) {
          if (val !== null && val !== undefined) el.dataset[p] = String(val);
        }
      } else if (k === 'class') {
        const list = normaliseClass(v);
        if (isSvg) el.setAttribute('class', [...classes, ...list].join(' '));
        else if (list.length) el.classList.add(...list);
      } else if (k === 'html') {
        el.innerHTML = v;
      } else if (k === 'ref' && typeof v === 'function') {
        v(el);
      } else if (k === 'value' && 'value' in el) {
        el.value = v;
      } else if (k === 'checked' || k === 'disabled' || k === 'selected') {
        el[k] = Boolean(v);
        if (v) el.setAttribute(k, '');
      } else {
        el.setAttribute(k, v === true ? '' : String(v));
      }
    }
  }

  append(el, children);
  return el;
}

function normaliseClass(v) {
  if (!v) return [];
  if (typeof v === 'string') return v.split(/\s+/).filter(Boolean);
  if (Array.isArray(v)) return v.flatMap(normaliseClass);
  return Object.entries(v).filter(([, on]) => on).map(([n]) => n);
}

export function append(parent, children) {
  for (const c of children.flat(Infinity)) {
    if (c === null || c === undefined || c === false || c === true) continue;
    parent.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return parent;
}

/** Namespaced SVG element helper for cases where the tag isn't in SVG_TAGS. */
export function svg(tag, attrs, ...children) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === null || v === undefined || v === false) continue;
    if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else el.setAttribute(k, String(v));
  }
  append(el, children);
  return el;
}

export const $  = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
  return node;
}

export function mount(node, ...children) {
  clear(node);
  append(node, children);
  return node;
}

/** Fragment builder - useful when a helper must return several siblings. */
export function frag(...children) {
  return append(document.createDocumentFragment(), children);
}

/** Escape text for the rare places we must build an HTML string (print export). */
export function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** requestAnimationFrame-throttled callback. */
export function raf(fn) {
  let queued = false, lastArgs;
  return (...args) => {
    lastArgs = args;
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; fn(...lastArgs); });
  };
}

export function delegate(root, selector, type, handler) {
  root.addEventListener(type, (e) => {
    const t = e.target.closest(selector);
    if (t && root.contains(t)) handler(e, t);
  });
}

/** Focus trap for modals: keeps Tab inside `container` until released. */
export function trapFocus(container) {
  const sel = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';
  const onKey = (e) => {
    if (e.key !== 'Tab') return;
    const items = $$(sel, container).filter((n) => n.offsetParent !== null);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  container.addEventListener('keydown', onKey);
  return () => container.removeEventListener('keydown', onKey);
}
