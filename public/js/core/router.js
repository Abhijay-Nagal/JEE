/**
 * router.js - hash router.
 *
 * Hash routing (not History API) is deliberate: the built app must also work
 * when opened from a file share or an offline cache where the server can't
 * rewrite deep links.
 */

import { emit, EV } from './bus.js';

const routes = [];
let notFound = null;
let current = null;
let beforeEach = null;

/** register('/topic/:subject/:chapter/:topic', handler) */
export function register(pattern, handler, meta = {}) {
  const names = [];
  const body = pattern
    .replace(/\/+$/, '')
    // Escape regex metacharacters. Note "/" is deliberately NOT escaped, so
    // the parameter substitution below can still see plain "/:name".
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\/:(\w+)/g, (_, n) => { names.push(n); return '/([^/]+)'; });

  routes.push({ pattern, rx: new RegExp('^' + body + '/?$'), names, handler, meta });
}

export function setNotFound(fn) { notFound = fn; }
export function setGuard(fn) { beforeEach = fn; }

function parse() {
  const raw = location.hash.slice(1) || '/';
  const [path, queryStr] = raw.split('?');
  const query = Object.fromEntries(new URLSearchParams(queryStr || ''));
  return { path: path.replace(/\/+$/, '') || '/', query, raw };
}

export function resolve() {
  const { path, query, raw } = parse();

  for (const r of routes) {
    const m = r.rx.exec(path);
    if (!m) continue;
    const params = {};
    r.names.forEach((n, i) => { params[n] = decodeURIComponent(m[i + 1]); });
    const ctx = { path, params, query, raw, meta: r.meta, pattern: r.pattern };

    if (beforeEach) {
      const verdict = beforeEach(ctx);
      if (verdict === false) return;
      if (typeof verdict === 'string') { go(verdict, { replace: true }); return; }
    }

    current = ctx;
    emit(EV.ROUTE, ctx);
    try {
      r.handler(ctx);
    } catch (err) {
      console.error('[router] view crashed on', path, err);
      renderCrash(err, path);
    }
    return;
  }

  if (notFound) notFound({ path, query, raw });
}

function renderCrash(err, path) {
  const main = document.getElementById('main');
  if (!main) return;
  main.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'view';
  wrap.innerHTML = `
    <div class="card">
      <h1>Something broke on this screen</h1>
      <p class="muted">Route <code>${path}</code> failed to render. Your progress is safe - it is saved separately.</p>
      <pre class="small mono" style="white-space:pre-wrap;color:var(--bad)">${String(err && err.stack || err)}</pre>
      <a class="btn btn--primary" href="#/">Back to Command Deck</a>
    </div>`;
  main.appendChild(wrap);
}

export function go(path, { replace = false } = {}) {
  const target = path.startsWith('#') ? path : '#' + path;
  if (location.hash === target) { resolve(); return; }
  if (replace) location.replace(target);
  else location.hash = target;
}

export function back() { history.back(); }
export function currentRoute() { return current; }

/** Build a hash URL from parts, encoding each segment. */
export function link(...parts) {
  return '#/' + parts.filter((p) => p !== undefined && p !== null && p !== '')
    .map((p) => encodeURIComponent(String(p))).join('/');
}

export function start() {
  window.addEventListener('hashchange', () => {
    resolve();
    // New screen => start at the top, unless the browser is restoring a scroll.
    window.scrollTo({ top: 0, behavior: 'instant' in document.documentElement.style ? 'instant' : 'auto' });
  });
  resolve();
}
