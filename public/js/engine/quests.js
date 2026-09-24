/**
 * quests.js - daily missions.
 *
 * Three quests per day, drawn deterministically from the date so the same
 * learner sees the same set all day even across reloads and devices (the seed
 * is the date string, not a random number stored in the save).
 *
 * Quests listen to the event bus rather than being poked by each view, so any
 * new activity that emits the standard events counts automatically.
 */

import { get, addXP, addCoins, dayKey, save, pushLog } from '../core/store.js';
import { on, emit, EV } from '../core/bus.js';

/* ---- deterministic RNG (mulberry32 over a hashed seed) ---- */
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function rng(seed) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---- catalogue ---- */

const CATALOGUE = [
  { id: 'answer-15',  type: 'answers',  target: 15, xp: 60,  coins: 15, label: (n) => `Answer ${n} questions`,            icon: '📝' },
  { id: 'answer-30',  type: 'answers',  target: 30, xp: 110, coins: 30, label: (n) => `Answer ${n} questions`,            icon: '📝' },
  { id: 'correct-12', type: 'correct',  target: 12, xp: 80,  coins: 20, label: (n) => `Get ${n} answers right`,           icon: '✅' },
  { id: 'combo-6',    type: 'combo',    target: 6,  xp: 70,  coins: 20, label: (n) => `Hit a ${n}-answer streak`,         icon: '🔥' },
  { id: 'combo-10',   type: 'combo',    target: 10, xp: 120, coins: 35, label: (n) => `Hit a ${n}-answer streak`,         icon: '🔥' },
  { id: 'hard-3',     type: 'hard',     target: 3,  xp: 100, coins: 30, label: (n) => `Solve ${n} Hurdle-tier questions`, icon: '⛰️' },
  { id: 'sim-2',      type: 'games',    target: 2,  xp: 70,  coins: 20, label: (n) => `Play ${n} simulations`,            icon: '🎮' },
  { id: 'sim-1',      type: 'games',    target: 1,  xp: 40,  coins: 10, label: () => 'Play a simulation',                 icon: '🎮' },
  { id: 'review-10',  type: 'reviews',  target: 10, xp: 90,  coins: 25, label: (n) => `Clear ${n} spaced reviews`,        icon: '🔁' },
  { id: 'topic-1',    type: 'topics',   target: 1,  xp: 60,  coins: 15, label: () => 'Read a new topic',                  icon: '📖' },
  { id: 'xp-250',     type: 'xp',       target: 250, xp: 80, coins: 25, label: (n) => `Earn ${n} XP today`,               icon: '⭐' },
  { id: 'boss-1',     type: 'boss',     target: 1,  xp: 150, coins: 50, label: () => 'Defeat a chapter boss',             icon: '⚔️' },
  { id: 'three-sub',  type: 'subjects', target: 3,  xp: 130, coins: 40, label: () => 'Practise all three subjects',       icon: '🔺' }
];

/* ---- generation ---- */

export function ensureToday() {
  const state = get();
  const today = dayKey();
  if (state.quests.day === today && state.quests.list?.length) return state.quests;

  const r = rng(hash('quests:' + today));
  const pool = [...CATALOGUE];
  const picked = [];
  // Always one light, one medium, one stretch - keeps a bad day still winnable.
  const tiers = [
    pool.filter((q) => q.xp <= 70),
    pool.filter((q) => q.xp > 70 && q.xp <= 110),
    pool.filter((q) => q.xp > 110)
  ];
  for (const tier of tiers) {
    if (!tier.length) continue;
    picked.push(tier[Math.floor(r() * tier.length)]);
  }

  state.quests = {
    day: today,
    list: picked.map((q) => ({
      id: q.id, type: q.type, target: q.target, icon: q.icon,
      label: q.label(q.target), xp: q.xp, coins: q.coins,
      progress: 0, done: false
    })),
    subjectsTouched: []
  };
  save();
  return state.quests;
}

/* ---- progress ---- */

function bump(type, amount = 1, absolute = null) {
  const state = get();
  const q = ensureToday();
  let changed = false;

  for (const item of q.list) {
    if (item.done || item.type !== type) continue;
    item.progress = absolute !== null ? Math.max(item.progress, absolute) : item.progress + amount;
    changed = true;
    if (item.progress >= item.target) {
      item.done = true;
      item.progress = item.target;
      addXP(item.xp, `quest:${item.id}`);
      addCoins(item.coins, `quest:${item.id}`);
      pushLog({ type: 'quest', id: item.id });
      emit(EV.QUEST_DONE, item);
    }
  }
  if (changed) { save(); emit(EV.QUEST, q); }

  // All three done => bonus chest.
  if (q.list.length && q.list.every((i) => i.done) && !q.bonusPaid) {
    q.bonusPaid = true;
    addXP(120, 'quest:all');
    addCoins(60, 'quest:all');
    emit(EV.TOAST, { kind: 'ach', icon: '🎁', text: 'All daily missions cleared - bonus chest opened!' });
    save();
  }
  return q;
}

/** Wire quests to the event bus. Call once at boot. */
export function installQuestTracking() {
  ensureToday();

  on(EV.ANSWER, (r) => {
    bump('answers', 1);
    if (r.correct) bump('correct', 1);
    if (r.correct && r.tier === 'H') bump('hard', 1);
    if (r.mode === 'review') bump('reviews', 1);

    const q = ensureToday();
    const subj = r.question?.subject;
    if (subj) {
      q.subjectsTouched ||= [];
      if (!q.subjectsTouched.includes(subj)) {
        q.subjectsTouched.push(subj);
        bump('subjects', 0, q.subjectsTouched.length);
      }
    }
  });

  on(EV.XP, () => {
    const day = get().days[dayKey()];
    if (day) bump('xp', 0, day.xp);
  });

  on(EV.GAME_SCORE, () => bump('games', 1));
  on(EV.TOPIC_DONE, () => bump('topics', 1));
  on(EV.BOSS_WIN, () => bump('boss', 1));
}

/** Combo quests are reported by the quiz runner, which owns the streak count. */
export function reportCombo(n) {
  bump('combo', 0, n);
}

export function questList() {
  return ensureToday().list;
}

export function questsComplete() {
  const l = questList();
  return l.length > 0 && l.every((q) => q.done);
}
