/**
 * auth.js - passwordless sign-in against Supabase's GoTrue API.
 *
 * Spoken to over plain fetch rather than through the Supabase SDK, which keeps
 * the app's zero-dependency, no-build-step rule intact. It is about 150 lines
 * either way.
 *
 * The flow is PKCE, not the older implicit flow, for a reason specific to this
 * app: implicit returns the tokens in the URL *fragment*, and this app is a
 * hash router. `#access_token=...` would be handed straight to the router as a
 * route. PKCE comes back as `?code=...` in the query string, which the router
 * never looks at. It is also the more secure of the two, since the token never
 * appears in a URL.
 *
 * No password is ever collected, stored or transmitted.
 */

import { SUPABASE_URL, SUPABASE_ANON_KEY, syncConfigured, redirectTo } from './config.js';

const SESSION_KEY = 'jee-ascent:session';
const VERIFIER_KEY = 'jee-ascent:pkce';

let session = null;          // { access_token, refresh_token, expires_at, user }
const listeners = new Set();

/* ------------------------------------------------------------------ */
/* small helpers                                                       */
/* ------------------------------------------------------------------ */

const read = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const write = (k, v) => { try { localStorage.setItem(k, v); } catch { /* quota / private mode */ } };
const drop = (k) => { try { localStorage.removeItem(k); } catch { /* ignore */ } };

function notify() {
  for (const fn of listeners) { try { fn(session); } catch { /* a bad listener must not break auth */ } }
}

/** base64url, which PKCE requires and btoa does not produce. */
function b64url(bytes) {
  let s = '';
  for (const b of new Uint8Array(bytes)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function challengeFor(verifier) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return b64url(digest);
}

function newVerifier() {
  return b64url(crypto.getRandomValues(new Uint8Array(48)));
}

async function api(path, { method = 'POST', body, token } = {}) {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    method,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
  if (!res.ok) {
    const msg = data?.error_description || data?.msg || data?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

/* ------------------------------------------------------------------ */
/* session                                                             */
/* ------------------------------------------------------------------ */

function store(s) {
  if (!s) { session = null; drop(SESSION_KEY); notify(); return null; }
  session = {
    access_token: s.access_token,
    refresh_token: s.refresh_token,
    // expires_in is seconds from now; store an absolute moment instead so a
    // reload does not think a long-expired token is still fresh.
    expires_at: Date.now() + (Number(s.expires_in) || 3600) * 1000,
    user: s.user || session?.user || null
  };
  write(SESSION_KEY, JSON.stringify(session));
  notify();
  return session;
}

/** Restore a session from the last visit, if there is one. */
export function loadSession() {
  if (!syncConfigured()) return null;
  try {
    const raw = read(SESSION_KEY);
    session = raw ? JSON.parse(raw) : null;
  } catch { session = null; }
  return session;
}

export const getSession = () => session;
export const isSignedIn = () => Boolean(session?.refresh_token);
export const currentEmail = () => session?.user?.email || null;

export function onAuthChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/**
 * A valid access token, refreshed if it is close to expiring.
 * Returns null rather than throwing when signed out, because every caller
 * treats "not signed in" as an ordinary state.
 */
export async function accessToken() {
  if (!session?.refresh_token) return null;
  // Refresh a minute early: a token that expires mid-request is a failed sync.
  if (session.access_token && Date.now() < session.expires_at - 60000) {
    return session.access_token;
  }
  try {
    const data = await api('/auth/v1/token?grant_type=refresh_token', {
      body: { refresh_token: session.refresh_token }
    });
    return store(data)?.access_token || null;
  } catch {
    // The refresh token is dead - the only honest response is to sign out.
    store(null);
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* sign in / out                                                       */
/* ------------------------------------------------------------------ */

/**
 * Email the learner a one-time link. Resolves once the mail is on its way;
 * the session does not exist until they click it and `completeSignIn` runs.
 */
export async function sendMagicLink(email) {
  if (!syncConfigured()) throw new Error('Sync is not configured for this deployment.');
  const addr = String(email || '').trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(addr)) throw new Error('That does not look like an email address.');

  const verifier = newVerifier();
  write(VERIFIER_KEY, verifier);

  await api(`/auth/v1/otp?redirect_to=${encodeURIComponent(redirectTo())}`, {
    body: {
      email: addr,
      create_user: true,
      code_challenge: await challengeFor(verifier),
      code_challenge_method: 'S256'
    }
  });
  return true;
}

/**
 * Exchange the `?code=` the magic link came back with for a session.
 * Safe to call on every page load: it does nothing when there is no code.
 *
 * @returns {Promise<boolean>} true if a new session was established
 */
export async function completeSignIn() {
  if (!syncConfigured()) return false;
  const params = new URLSearchParams(location.search);
  const code = params.get('code');
  const errorDesc = params.get('error_description');

  if (!code && !errorDesc) return false;

  // Clean the URL before anything else, so a refresh cannot replay the code
  // and so the address bar is not left carrying a one-time secret.
  const clean = location.pathname + location.hash;
  try { history.replaceState(null, '', clean); } catch { /* ignore */ }

  if (errorDesc) throw new Error(errorDesc);

  const verifier = read(VERIFIER_KEY);
  drop(VERIFIER_KEY);
  if (!verifier) throw new Error('This link was opened on a different device or browser than the one that requested it.');

  const data = await api('/auth/v1/token?grant_type=pkce', {
    body: { auth_code: code, code_verifier: verifier }
  });
  return Boolean(store(data));
}

/** Sign out locally and, best effort, revoke the session server-side. */
export async function signOut() {
  const token = session?.access_token;
  store(null);
  if (token) {
    try { await api('/auth/v1/logout', { token }); } catch { /* already gone; local state is what matters */ }
  }
}
