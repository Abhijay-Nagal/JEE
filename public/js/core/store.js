/**
 * store.js - persistent learner state.
 *
 * Everything the platform knows about a learner lives in one JSON blob in
 * localStorage. There is no server, so this file is also the migration layer:
 * `SCHEMA` is bumped whenever the shape changes and `migrate()` upgrades old
 * saves rather than throwing them away.
 *
 * Writes are debounced (learning loops touch state on every keystroke in some
 * widgets) and mirrored to an in-memory object that reads hit synchronously.
 */

import { emit, EV } from './bus.js';

export const SCHEMA = 3;
const KEY = 'jee-ascent:v1';
const BACKUP_KEY = 'jee-ascent:v1:backup';

/* ------------------------------------------------------------------ */
/* defaults                                                            */
/* ------------------------------------------------------------------ */

export function blankState() {
  return {
    schema: SCHEMA,
    createdAt: Date.now(),
    updatedAt: Date.now(),

    profile: {
      name: '',
      avatar: '🛰️',
      targetYear: new Date().getFullYear() + 1,
      dailyGoalMin: 30,
      onboarded: false
    },

    settings: {
      theme: 'dark',          // dark | light | auto
      contrast: 'normal',     // normal | high
      sound: true,
      music: false,
      motion: 'full',         // full | reduced
      fontScale: 1,
      showTimer: true,
      hardMode: false,        // hides hints, negative marking on
      calculator: true
    },

    // --- gamification ---
    xp: 0,
    coins: 0,
    gems: 0,
    streak: { count: 0, best: 0, lastDay: null, freezes: 1 },
    achievements: {},          // id -> unlockedAt
    quests: { day: null, list: [] },
    inventory: { hintTokens: 3, skipTokens: 1, shields: 0 },
    cosmetics: { owned: ['🛰️'], active: '🛰️' },

    // --- learning model ---
    kc: {},                    // kcId -> { p, a, c, elo, seen, reps, ease, ivl, due, lapses }
    items: {},                 // itemId -> { seen, correct, streak, lastAt, ms[], tier }
    topics: {},                // topicId -> { read, gamePlays, gameBest, gmh:{G,M,H}, done, doneAt }
    chapters: {},              // chapterId -> { bossWins, bossBest, done }
    ability: {},               // subjectId -> theta (IRT ability estimate)
    bandit: {},                // armId -> { a, b } Beta posterior for activity choice

    // --- lifetime counters (cheap to keep, awkward to recompute) ---
    tierCorrect: { G: 0, M: 0, H: 0 },
    reviewCount: 0,
    printCount: 0,
    graphViews: 0,
    gamePlays: 0,
    bossFights: 0,
    bestCombo: 0,

    // --- telemetry ---
    days: {},                  // 'YYYY-MM-DD' -> { min, xp, q, correct, sessions }
    sessions: [],              // capped rolling log
    log: [],                   // capped event log for the analytics view
    lastRoute: '#/'
  };
}

/* ------------------------------------------------------------------ */
/* load / save                                                         */
/* ------------------------------------------------------------------ */

let state = blankState();
let saveTimer = null;
let dirty = false;

function readRaw(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}

function migrate(data) {
  if (!data || typeof data !== 'object') return blankState();
  const v = data.schema || 0;

  // v0/v1 -> v2: bandit + inventory introduced.
  if (v < 2) {
    data.bandit ||= {};
    data.inventory ||= { hintTokens: 3, skipTokens: 1, shields: 0 };
    data.cosmetics ||= { owned: ['🛰️'], active: data.profile?.avatar || '🛰️' };
  }
  // v2 -> v3: per-subject IRT ability replaced a single global number.
  if (v < 3) {
    if (typeof data.ability === 'number') data.ability = {};
    data.ability ||= {};
    data.gems ||= 0;
    if (data.streak && data.streak.freezes === undefined) data.streak.freezes = 1;
  }

  // Fill in anything a future/partial save is missing.
  const base = blankState();
  const merged = deepDefaults(data, base);
  merged.schema = SCHEMA;
  return merged;
}

function deepDefaults(target, defaults) {
  const out = Array.isArray(defaults) ? (Array.isArray(target) ? target : defaults) : { ...defaults };
  if (Array.isArray(defaults)) return out;
  for (const [k, dv] of Object.entries(defaults)) {
    const tv = target?.[k];
    if (tv === undefined || tv === null) out[k] = dv;
    else if (dv && typeof dv === 'object' && !Array.isArray(dv) && typeof tv === 'object') out[k] = deepDefaults(tv, dv);
    else out[k] = tv;
  }
  // Preserve keys the defaults don't know about (user-created maps).
  for (const [k, tv] of Object.entries(target || {})) {
    if (!(k in out)) out[k] = tv;
  }
  return out;
}

export function load() {
  const raw = readRaw(KEY);
  if (!raw) { state = blankState(); return state; }
  try {
    state = migrate(JSON.parse(raw));
  } catch (err) {
    console.error('[store] save file unreadable, starting fresh. A copy was kept.', err);
    try { localStorage.setItem(BACKUP_KEY, raw); } catch { /* quota */ }
    state = blankState();
  }
  return state;
}

export function save({ immediate = false } = {}) {
  dirty = true;
  if (saveTimer) clearTimeout(saveTimer);
  const doWrite = () => {
    saveTimer = null;
    if (!dirty) return;
    dirty = false;
    state.updatedAt = Date.now();
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (err) {
      // Quota is the realistic failure. Shed the biggest disposable arrays and retry once.
      console.warn('[store] write failed, trimming logs', err);
      state.log = state.log.slice(-120);
      state.sessions = state.sessions.slice(-40);
      try { localStorage.setItem(KEY, JSON.stringify(state)); }
      catch { emit(EV.TOAST, { kind: 'bad', text: 'Could not save progress - storage is full.' }); }
    }
    // Cloud sync listens for this to schedule a debounced push. A DOM event
    // rather than a bus event so store.js keeps no dependency on sync.js -
    // the app must run identically with sync switched off.
    try { window.dispatchEvent(new Event('jee:saved')); } catch { /* not a browser */ }
  };
  if (immediate) doWrite();
  else saveTimer = setTimeout(doWrite, 400);
}

/** Read-only-ish accessor. Mutate through `update()` so listeners fire. */
export function get() { return state; }

/**
 * Mutate state and notify. `fn` receives the draft and may return a payload
 * that is forwarded to STATE listeners.
 */
export function update(fn, { silent = false, immediate = false } = {}) {
  const payload = fn(state);
  save({ immediate });
  if (!silent) emit(EV.STATE, { state, payload });
  return payload;
}

export function resetAll() {
  try { localStorage.setItem(BACKUP_KEY, JSON.stringify(state)); } catch { /* ignore */ }
  state = blankState();
  save({ immediate: true });
  emit(EV.STATE, { state, payload: { reset: true } });
}

/**
 * Adopt a state produced elsewhere - currently the result of merging this
 * device's save with one pulled from the cloud. Kept separate from importJSON
 * because there is no file, no backup prompt and no user gesture involved.
 */
export function replaceState(next) {
  if (!next || typeof next !== 'object') return state;
  state = migrate(next);
  save({ immediate: true });
  emit(EV.STATE, { state, payload: { merged: true } });
  return state;
}

/* ------------------------------------------------------------------ */
/* import / export                                                     */
/* ------------------------------------------------------------------ */

export function exportJSON() {
  return JSON.stringify({ ...state, exportedAt: Date.now(), app: 'jee-ascent' }, null, 2);
}

export function importJSON(text) {
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== 'object') throw new Error('Not a JEE ASCENT save file.');
  if (parsed.app && parsed.app !== 'jee-ascent') throw new Error('This file is from a different app.');
  try { localStorage.setItem(BACKUP_KEY, JSON.stringify(state)); } catch { /* ignore */ }
  state = migrate(parsed);
  save({ immediate: true });
  emit(EV.STATE, { state, payload: { imported: true } });
  return state;
}

/* ------------------------------------------------------------------ */
/* levels, ranks, XP                                                   */
/* ------------------------------------------------------------------ */

/** XP required to go from level L to L+1. Grows linearly => quadratic total. */
export const xpStep = (L) => 80 + 45 * (L - 1);

/** Total XP needed to *reach* level L. */
export function xpForLevel(L) {
  const n = Math.max(0, L - 1);
  return 80 * n + 45 * (n * (n - 1)) / 2;
}

export function levelInfo(xp = state.xp) {
  let L = 1;
  while (xpForLevel(L + 1) <= xp && L < 400) L++;
  const floor = xpForLevel(L);
  const need = xpStep(L);
  return {
    level: L,
    into: xp - floor,
    need,
    pct: Math.min(100, Math.round(((xp - floor) / need) * 100)),
    rank: rankFor(L)
  };
}

const RANKS = [
  'Aspirant', 'Cadet', 'Observer', 'Navigator', 'Analyst', 'Technician',
  'Engineer', 'Specialist', 'Adept', 'Theorist', 'Architect', 'Laureate',
  'Luminary', 'Polymath', 'Ascendant'
];
export function rankFor(level) {
  return RANKS[Math.min(RANKS.length - 1, Math.floor((level - 1) / 3))];
}
export { RANKS };

/** Award XP. Handles level-up events and coin conversion. */
export function addXP(amount, reason = '') {
  const amt = Math.max(0, Math.round(amount));
  if (!amt) return { amount: 0 };
  const before = levelInfo(state.xp).level;
  state.xp += amt;
  const after = levelInfo(state.xp).level;

  logDay((d) => { d.xp += amt; });
  emit(EV.XP, { amount: amt, reason, total: state.xp });

  if (after > before) {
    const reward = 25 * (after - before);
    state.coins += reward;
    emit(EV.LEVEL_UP, { level: after, from: before, rank: rankFor(after), coins: reward });
    emit(EV.COINS, { total: state.coins, delta: reward });
  }
  save();
  return { amount: amt, level: after, levelledUp: after > before };
}

export function addCoins(n, reason = '') {
  const d = Math.round(n);
  state.coins = Math.max(0, state.coins + d);
  emit(EV.COINS, { total: state.coins, delta: d, reason });
  save();
  return state.coins;
}

export function spendCoins(n) {
  if (state.coins < n) return false;
  state.coins -= n;
  emit(EV.COINS, { total: state.coins, delta: -n });
  save();
  return true;
}

/* ------------------------------------------------------------------ */
/* days & streaks                                                      */
/* ------------------------------------------------------------------ */

export function dayKey(d = new Date()) {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
}

export function daysBetween(a, b) {
  return Math.round((Date.parse(b + 'T00:00:00') - Date.parse(a + 'T00:00:00')) / 86400000);
}

export function logDay(fn) {
  const k = dayKey();
  state.days[k] ||= { min: 0, xp: 0, q: 0, correct: 0, games: 0, sessions: 0 };
  fn(state.days[k]);
  save();
  return state.days[k];
}

/**
 * Called on every meaningful action. Advances the streak once per day and
 * spends a freeze to cover a single missed day.
 */
export function touchStreak() {
  const today = dayKey();
  const s = state.streak;
  if (s.lastDay === today) return s;

  if (!s.lastDay) {
    s.count = 1;
  } else {
    const gap = daysBetween(s.lastDay, today);
    if (gap === 1) s.count += 1;
    else if (gap === 2 && s.freezes > 0) { s.freezes -= 1; s.count += 1; emit(EV.TOAST, { kind: 'info', icon: '🧊', text: 'Streak freeze used - your streak survived.' }); }
    else if (gap > 1) s.count = 1;
  }
  s.lastDay = today;
  s.best = Math.max(s.best, s.count);
  // One freeze earned every 7 days, capped at 3.
  if (s.count % 7 === 0 && s.freezes < 3) s.freezes += 1;

  emit(EV.STREAK, { ...s });
  save();
  return s;
}

/* ------------------------------------------------------------------ */
/* event log                                                           */
/* ------------------------------------------------------------------ */

const LOG_CAP = 400;
export function pushLog(entry) {
  state.log.push({ t: Date.now(), ...entry });
  if (state.log.length > LOG_CAP) state.log.splice(0, state.log.length - LOG_CAP);
  save();
}

/* ------------------------------------------------------------------ */
/* record helpers (lazily created sub-objects)                         */
/* ------------------------------------------------------------------ */

export function kcRec(id) {
  state.kc[id] ||= {
    p: 0.12,      // BKT mastery probability
    a: 0, c: 0,   // attempts, correct
    elo: 1200,    // learner skill vs this KC
    seen: 0, reps: 0,
    ease: 2.5, ivl: 0, due: 0, lapses: 0,
    lastAt: 0
  };
  return state.kc[id];
}

export function itemRec(id) {
  state.items[id] ||= { seen: 0, correct: 0, streak: 0, lastAt: 0, ms: [], flagged: false };
  return state.items[id];
}

export function topicRec(id) {
  state.topics[id] ||= {
    read: false, readAt: 0,
    gamePlays: 0, gameBest: 0,
    gmh: { G: { a: 0, c: 0 }, M: { a: 0, c: 0 }, H: { a: 0, c: 0 } },
    done: false, doneAt: 0, notes: ''
  };
  return state.topics[id];
}

export function chapterRec(id) {
  state.chapters[id] ||= { bossWins: 0, bossBest: 0, done: false, doneAt: 0 };
  return state.chapters[id];
}

/**
 * Per-subject IRT ability. Stored as an object so the standard error travels
 * with the estimate - a theta of 0.4 after 3 questions means something very
 * different from the same number after 300.
 */
export function abilityOf(subject) {
  const cur = state.ability[subject];
  if (typeof cur === 'number') state.ability[subject] = { theta: cur, se: 0.9, n: 0 };
  else if (!cur) state.ability[subject] = { theta: 0, se: 1.0, n: 0 };
  return state.ability[subject];
}

export function setAbility(subject, { theta, se, n }) {
  const rec = abilityOf(subject);
  if (theta !== undefined) rec.theta = Math.max(-3.5, Math.min(3.5, theta));
  if (se !== undefined) rec.se = Math.max(0.18, se);
  if (n !== undefined) rec.n = n;
  save();
  return rec;
}
