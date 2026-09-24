#!/usr/bin/env node
/**
 * Integration test for passwordless sign-in and cloud sync.
 *
 * Runs the real auth.js and sync.js against a stand-in Supabase that speaks
 * just enough GoTrue and PostgREST to be convincing: the OTP endpoint, the
 * PKCE token exchange, and select/upsert on the saves table.
 *
 * The point is that this code path cannot be exercised by npm run ui - it
 * needs a server - and shipping untested network code to a study app means the
 * first person to discover a bug is a learner who loses their progress.
 *
 * Nothing here touches a real Supabase project, and config.js is never edited:
 * the static server substitutes it in flight.
 *
 * Run with: npm run sync
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');
const API_PORT = 5321;
const APP_PORT = 5322;
const API = `http://127.0.0.1:${API_PORT}`;
const APP = `http://127.0.0.1:${APP_PORT}`;

let checks = 0;
const fails = [];
const ok = (cond, label, detail = '') => {
  checks++;
  if (!cond) fails.push(label + (detail ? `  (${detail})` : ''));
};

/* ================================================================== */
/* a stand-in Supabase                                                 */
/* ================================================================== */

const db = new Map();            // user_id -> { data, updated_at }
const pending = new Map();       // auth_code -> { email, challenge }
const sessions = new Map();      // access_token -> user
let lastLink = null;             // the "email" we would have sent
const issued = [];

const b64url = (b) => Buffer.from(b).toString('base64')
  .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

/**
 * The client sends apikey, Authorization and Prefer, all of which make these
 * non-simple cross-origin requests. Real Supabase answers the preflight; the
 * stand-in has to as well or every call fails with an opaque "Failed to fetch".
 */
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PATCH,OPTIONS',
  'Access-Control-Allow-Headers': 'authorization,apikey,content-type,prefer',
  'Access-Control-Max-Age': '86400'
};

const api = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') { res.writeHead(204, CORS); return res.end(); }

  const url = new URL(req.url, API);
  const body = await new Promise((r) => {
    let s = ''; req.on('data', (c) => (s += c));
    req.on('end', () => { try { r(s ? JSON.parse(s) : {}); } catch { r({}); } });
  });
  const send = (code, obj) => {
    res.writeHead(code, { 'Content-Type': 'application/json', ...CORS });
    res.end(JSON.stringify(obj));
  };
  const auth = req.headers.authorization?.replace(/^Bearer /, '');

  // --- GoTrue: request a magic link ---
  if (url.pathname === '/auth/v1/otp') {
    if (!body.code_challenge || body.code_challenge_method !== 'S256') {
      return send(400, { msg: 'client did not use PKCE' });
    }
    const code = crypto.randomUUID();
    pending.set(code, { email: body.email, challenge: body.code_challenge });
    lastLink = `${url.searchParams.get('redirect_to')}?code=${code}`;
    return send(200, {});
  }

  // --- GoTrue: exchange the code, or refresh ---
  if (url.pathname === '/auth/v1/token') {
    const grant = url.searchParams.get('grant_type');
    if (grant === 'pkce') {
      const rec = pending.get(body.auth_code);
      if (!rec) return send(400, { error_description: 'invalid code' });
      // Verify the challenge really matches the verifier the client kept.
      const expect = b64url(crypto.createHash('sha256').update(body.code_verifier).digest());
      if (expect !== rec.challenge) return send(400, { error_description: 'PKCE verification failed' });
      pending.delete(body.auth_code);
      const token = crypto.randomUUID();
      const user = { id: crypto.createHash('md5').update(rec.email).digest('hex').slice(0, 8)
        .replace(/^(.{8})$/, '$1-0000-4000-8000-000000000000'), email: rec.email };
      sessions.set(token, user);
      issued.push(token);
      return send(200, { access_token: token, refresh_token: 'refresh-' + token, expires_in: 3600, user });
    }
    if (grant === 'refresh_token') {
      const old = String(body.refresh_token || '').replace(/^refresh-/, '');
      const user = sessions.get(old);
      if (!user) return send(400, { error_description: 'bad refresh token' });
      const token = crypto.randomUUID();
      sessions.set(token, user);
      return send(200, { access_token: token, refresh_token: 'refresh-' + token, expires_in: 3600, user });
    }
  }

  if (url.pathname === '/auth/v1/logout') return send(204, {});

  // --- PostgREST: the saves table, with RLS simulated ---
  if (url.pathname === '/rest/v1/saves') {
    const user = sessions.get(auth);
    if (!user) return send(401, { message: 'JWT required' });   // what RLS looks like from outside

    if (req.method === 'GET') {
      const want = url.searchParams.get('user_id')?.replace('eq.', '');
      // A real policy would filter server-side; refusing a cross-user read
      // here is what proves the client never asks for someone else's row.
      if (want !== user.id) return send(200, []);
      const row = db.get(user.id);
      return send(200, row ? [{ data: row.data }] : []);
    }
    if (req.method === 'POST') {
      for (const row of [].concat(body)) {
        if (row.user_id !== user.id) return send(403, { message: 'RLS violation' });
        db.set(user.id, { data: row.data, updated_at: row.updated_at });
      }
      return send(201, null);
    }
  }
  send(404, { message: 'no such endpoint: ' + url.pathname });
});

/* ================================================================== */
/* the app, with config.js swapped in flight                           */
/* ================================================================== */

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json',
  '.png': 'image/png', '.svg': 'image/svg+xml' };

const app = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';

  // The only edit: point the real config at the stand-in server.
  if (p === '/js/core/config.js') {
    res.writeHead(200, { 'Content-Type': 'text/javascript' });
    return res.end(
      `export const SUPABASE_URL = ${JSON.stringify(API)};\n` +
      `export const SUPABASE_ANON_KEY = 'test-anon-key';\n` +
      `export const syncConfigured = () => true;\n` +
      `export const redirectTo = () => location.origin + location.pathname;\n`);
  }
  // The service worker would cache everything and confuse a second page load.
  if (p === '/sw.js') { res.writeHead(404); return res.end(); }

  const file = path.join(PUBLIC, p);
  if (!file.startsWith(PUBLIC) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404); return res.end('not found');
  }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});

/* ================================================================== */

const unwrap = (m) => (m && m.chromium ? m : m?.default?.chromium ? m.default : null);
async function loadPlaywright() {
  try { const m = unwrap(await import('playwright')); if (m) return m; } catch { /* not local */ }
  const cache = path.join(os.homedir(), 'AppData', 'Local', 'npm-cache', '_npx');
  if (fs.existsSync(cache)) {
    for (const d of fs.readdirSync(cache)) {
      const q = path.join(cache, d, 'node_modules', 'playwright', 'index.js');
      if (fs.existsSync(q)) { const m = unwrap(await import(pathToFileURL(q).href)); if (m) return m; }
    }
  }
  return null;
}

const pw = await loadPlaywright();
if (!pw) {
  console.log('\n  Playwright not found - skipping the sync test.');
  console.log('  Install it with:  npx playwright install chromium\n');
  process.exit(0);
}

await new Promise((r) => api.listen(API_PORT, r));
await new Promise((r) => app.listen(APP_PORT, r));

console.log('\n  JEE ASCENT — sync test');
console.log('  ' + '─'.repeat(56));

const browser = await pw.chromium.launch();
const errors = [];

try {
  /* ---------- device one: sign in and push ---------- */
  const one = await browser.newContext();
  const p1 = await one.newPage();
  p1.on('pageerror', (e) => errors.push('device1: ' + e.message));

  await p1.goto(APP, { waitUntil: 'networkidle' });
  await p1.waitForTimeout(600);

  // Do some work worth protecting.
  await p1.evaluate(async () => {
    const S = await import('/js/core/store.js');
    S.update((st) => {
      st.profile.name = 'Cadet';
      st.xp = 500;
      st.topics['ch-02-03'] = { read: true, readAt: 1000, gamePlays: 2, gameBest: 70,
        gmh: { G: { a: 4, c: 4 }, M: { a: 2, c: 1 }, H: { a: 0, c: 0 } }, done: false, doneAt: 0, notes: '' };
    }, { immediate: true });
  });

  const sent = await p1.evaluate(async () => {
    const A = await import('/js/core/auth.js');
    await A.sendMagicLink('learner@example.com');
    return true;
  });
  ok(sent, 'Auth: magic link requested');
  ok(Boolean(lastLink), 'Auth: the server issued a link');
  ok(/\?code=/.test(lastLink || ''), 'Auth: the callback is a ?code= query param, not a #fragment',
    String(lastLink));

  // Follow the link, as clicking it in an inbox would.
  await p1.goto(lastLink, { waitUntil: 'networkidle' });
  await p1.waitForTimeout(1500);

  const after = await p1.evaluate(async () => {
    const A = await import('/js/core/auth.js');
    return { signedIn: A.isSignedIn(), email: A.currentEmail(), search: location.search };
  });
  ok(after.signedIn, 'Auth: PKCE exchange produced a session');
  ok(after.email === 'learner@example.com', 'Auth: the session carries the right account', after.email);
  ok(after.search === '', 'Auth: the one-time code is stripped from the address bar', after.search);

  await p1.evaluate(async () => { const S = await import('/js/core/sync.js'); await S.syncNow(); });
  await p1.waitForTimeout(800);

  const stored = [...db.values()][0];
  ok(Boolean(stored), 'Sync: the save reached the server');
  ok(stored?.data?.xp === 500, 'Sync: XP was pushed', String(stored?.data?.xp));
  ok(stored?.data?.topics?.['ch-02-03']?.read === true, 'Sync: topic progress was pushed');
  ok(stored?.data?.settings !== undefined, 'Sync: the pushed blob is a whole save');

  /* ---------- device two: sign in, receive, and merge ---------- */
  const two = await browser.newContext();          // separate storage = a different device
  const p2 = await two.newPage();
  p2.on('pageerror', (e) => errors.push('device2: ' + e.message));
  await p2.goto(APP, { waitUntil: 'networkidle' });
  await p2.waitForTimeout(600);

  // Different work on this device, so the merge has something to reconcile.
  await p2.evaluate(async () => {
    const S = await import('/js/core/store.js');
    S.update((st) => {
      st.coins = 250;
      st.topics['m-02-01'] = { read: true, readAt: 2000, gamePlays: 1, gameBest: 40,
        gmh: { G: { a: 3, c: 2 }, M: { a: 0, c: 0 }, H: { a: 0, c: 0 } }, done: false, doneAt: 0, notes: '' };
    }, { immediate: true });
  });

  await p2.evaluate(async () => {
    const A = await import('/js/core/auth.js');
    await A.sendMagicLink('learner@example.com');
  });
  await p2.goto(lastLink, { waitUntil: 'networkidle' });
  await p2.waitForTimeout(1500);
  await p2.evaluate(async () => { const S = await import('/js/core/sync.js'); await S.syncNow(); });
  await p2.waitForTimeout(800);

  const merged = await p2.evaluate(async () => {
    const S = await import('/js/core/store.js');
    const st = S.get();
    return { xp: st.xp, coins: st.coins, name: st.profile.name,
      chem: Boolean(st.topics['ch-02-03']?.read), maths: Boolean(st.topics['m-02-01']?.read) };
  });

  ok(merged.chem, 'Merge: work done on device one arrived on device two');
  ok(merged.maths, 'Merge: work done on device two survived the sync');
  ok(merged.xp === 500, 'Merge: XP from the other device was adopted', String(merged.xp));
  // >= rather than ===: adopting the other device's XP can legitimately unlock
  // an achievement, and achievements pay coins. The point is that none are lost.
  ok(merged.coins >= 250, 'Merge: local coins were not overwritten', String(merged.coins));
  ok(merged.name === 'Cadet', 'Merge: the profile travelled with the account');

  /* ---------- the offline promise ---------- */
  const offline = await p2.evaluate(async () => {
    const S = await import('/js/core/sync.js');
    const St = await import('/js/core/store.js');
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
    const r = await S.syncNow();
    St.update((st) => { st.gems = 7; }, { immediate: true });   // must still work
    return { synced: r, status: S.getStatus().status, gems: St.get().gems };
  });
  ok(offline.synced === false, 'Offline: sync declines rather than hanging');
  ok(offline.status === 'offline', 'Offline: the status says so', offline.status);
  ok(offline.gems === 7, 'Offline: the app still saves locally with no network');

  /* ---------- sign out is not destructive ---------- */
  const out = await p2.evaluate(async () => {
    const A = await import('/js/core/auth.js');
    const St = await import('/js/core/store.js');
    await A.signOut();
    return { signedIn: A.isSignedIn(), xp: St.get().xp };
  });
  ok(out.signedIn === false, 'Sign out: the session is cleared');
  ok(out.xp === 500, 'Sign out: progress stays on the device');
} finally {
  await browser.close();
  api.close();
  app.close();
}

console.log('  ' + '─'.repeat(56));
if (errors.length) errors.slice(0, 5).forEach((e) => console.log('    ! ' + e));
if (fails.length) {
  console.log(`\n  ${fails.length} of ${checks} checks FAILED:\n`);
  fails.forEach((f) => console.log('    ✗ ' + f));
  console.log('');
  process.exit(1);
}
console.log(`\n  ✓ all ${checks} sync checks passed\n`);
