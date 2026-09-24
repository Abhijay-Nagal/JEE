/**
 * sync.js - optional cloud backup of the save.
 *
 * The rule this file exists to protect: **localStorage stays the source of
 * truth**. Sync is a mirror, never a gate. If the network is down, the server
 * is down, or the learner never signs in at all, nothing here runs and the app
 * is exactly what it was before - which is the whole point of an offline-first
 * study tool that people use on trains.
 *
 * So every failure path below ends in "carry on with the local save".
 *
 * One row per user, holding the whole save as JSON. That sounds crude, but the
 * save is a single self-consistent document with its own schema version, and
 * merge.js already knows how to reconcile two of them field by field. Splitting
 * it into tables would buy nothing and cost a migration path.
 */

import { SUPABASE_URL, SUPABASE_ANON_KEY, syncConfigured } from './config.js';
import { accessToken, getSession, isSignedIn, onAuthChange } from './auth.js';
import { get, replaceState } from './store.js';
import { mergeState } from './merge.js';
import { emit, EV } from './bus.js';

const TABLE = 'saves';
const PUSH_DEBOUNCE = 8000;     // batch a burst of answers into one write

let pushTimer = null;
let inFlight = false;
let lastPushedAt = 0;
let status = 'off';             // off | idle | syncing | synced | error | offline
let lastError = '';

const listeners = new Set();

function setStatus(next, err = '') {
  status = next;
  lastError = err;
  for (const fn of listeners) { try { fn(status, lastError); } catch { /* ignore */ } }
}

export const getStatus = () => ({ status, error: lastError, at: lastPushedAt });
export function onSyncChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }

/* ------------------------------------------------------------------ */

async function rest(path, { method = 'GET', body, prefer } = {}) {
  const token = await accessToken();
  if (!token) throw new Error('signed out');
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(prefer ? { Prefer: prefer } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}${text ? ': ' + text.slice(0, 140) : ''}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

const uid = () => getSession()?.user?.id || null;

/* ------------------------------------------------------------------ */
/* pull / push                                                         */
/* ------------------------------------------------------------------ */

/** The remote save, or null if this account has never synced. */
async function pull() {
  const id = uid();
  if (!id) return null;
  const rows = await rest(`${TABLE}?user_id=eq.${id}&select=data`);
  return rows?.[0]?.data || null;
}

async function push(state) {
  const id = uid();
  if (!id) return;
  await rest(TABLE, {
    method: 'POST',
    prefer: 'resolution=merge-duplicates,return=minimal',
    body: [{ user_id: id, data: state, updated_at: new Date().toISOString() }]
  });
  lastPushedAt = Date.now();
}

/**
 * Pull, merge, adopt, push. Run on sign-in and on demand.
 *
 * The merge is what makes this safe to run when both sides have work in them;
 * see merge.js. A failure here is reported but never destructive - the local
 * save is only replaced once a merged result exists.
 */
export async function syncNow({ silent = false } = {}) {
  if (!syncConfigured() || !isSignedIn() || inFlight) return false;
  if (!navigator.onLine) { setStatus('offline'); return false; }

  inFlight = true;
  if (!silent) setStatus('syncing');
  try {
    const remote = await pull();
    const local = get();

    if (remote) {
      const merged = mergeState(local, remote);
      merged.updatedAt = Date.now();
      // Only touch the live state when the merge actually changed something,
      // so a no-op sync does not churn the UI.
      if (JSON.stringify(merged) !== JSON.stringify(local)) {
        replaceState(merged);
        emit(EV.SYNC_APPLIED, { source: 'remote' });
      }
      await push(get());
    } else {
      await push(local);           // first sync from this account
    }

    setStatus('synced');
    return true;
  } catch (err) {
    const msg = String(err?.message || err);
    // Being signed out or offline is an ordinary state, not an error to shout
    // about - the learner is still working, just locally.
    setStatus(/signed out/.test(msg) ? 'off' : /Failed to fetch|NetworkError/.test(msg) ? 'offline' : 'error', msg);
    return false;
  } finally {
    inFlight = false;
  }
}

/** Queue a push after the current burst of activity settles. */
export function schedulePush() {
  if (!syncConfigured() || !isSignedIn()) return;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(() => { syncNow({ silent: true }); }, PUSH_DEBOUNCE);
}

/**
 * Best-effort write on the way out. fetch with keepalive survives the page
 * unloading, which a normal request does not.
 */
export function flushOnUnload() {
  if (!syncConfigured() || !isSignedIn() || !navigator.onLine) return;
  const id = uid();
  const token = getSession()?.access_token;
  if (!id || !token) return;
  try {
    fetch(`${SUPABASE_URL}/rest/v1/${TABLE}`, {
      method: 'POST',
      keepalive: true,
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=minimal'
      },
      body: JSON.stringify([{ user_id: id, data: get(), updated_at: new Date().toISOString() }])
    });
  } catch { /* the local save is already written; this was a bonus */ }
}

/* ------------------------------------------------------------------ */

/** Wire sync to the app's lifecycle. Safe to call when sync is switched off. */
export function installSync() {
  if (!syncConfigured()) { setStatus('off'); return; }

  setStatus(isSignedIn() ? 'idle' : 'off');

  onAuthChange((s) => {
    if (s) { setStatus('idle'); syncNow(); }
    else setStatus('off');
  });

  // Every save is a candidate for a push, debounced hard so a drill session
  // is one request and not forty.
  window.addEventListener('jee:saved', schedulePush);

  window.addEventListener('online', () => { if (isSignedIn()) syncNow({ silent: true }); });
  window.addEventListener('offline', () => setStatus('offline'));

  // Coming back to the tab is the moment another device's work is most likely
  // to be waiting.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && isSignedIn()) syncNow({ silent: true });
  });

  window.addEventListener('beforeunload', flushOnUnload);

  if (isSignedIn()) syncNow({ silent: true });
}
