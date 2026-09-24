/**
 * achievements.js - badge definitions and the checker that unlocks them.
 *
 * Each badge is a pure predicate over (state, graph, ctx). The checker runs
 * after every graded answer, finished topic and boss fight; unlocking is
 * idempotent, so re-running it is always safe.
 */

import { get, addCoins, pushLog } from '../core/store.js';
import { emit, EV } from '../core/bus.js';
import { chapterMastery, topicMastery } from './knowledgeGraph.js';

const countTopics = (s, fn) => Object.values(s.topics).filter(fn).length;
const totalAnswers = (s) => Object.values(s.items).reduce((n, i) => n + i.seen, 0);
const totalCorrect = (s) => Object.values(s.items).reduce((n, i) => n + i.correct, 0);

export const ACHIEVEMENTS = [
  /* --- onboarding --- */
  { id: 'first-light',   icon: '🌅', name: 'First Light',        desc: 'Open your first topic.',                    coins: 10, test: (s) => countTopics(s, (t) => t.read) >= 1 },
  { id: 'first-blood',   icon: '🎯', name: 'On the Board',       desc: 'Answer your first question correctly.',     coins: 10, test: (s) => totalCorrect(s) >= 1 },
  { id: 'gamer',         icon: '🎮', name: 'Hands On',           desc: 'Play your first simulation.',               coins: 10, test: (s) => countTopics(s, (t) => t.gamePlays > 0) >= 1 },

  /* --- volume --- */
  { id: 'q-50',          icon: '📝', name: 'Fifty Down',         desc: 'Answer 50 questions.',                      coins: 25, test: (s) => totalAnswers(s) >= 50 },
  { id: 'q-250',         icon: '📚', name: 'Question Grinder',   desc: 'Answer 250 questions.',                     coins: 60, test: (s) => totalAnswers(s) >= 250 },
  { id: 'q-1000',        icon: '🗿', name: 'Thousand Yard Sprint', desc: 'Answer 1000 questions.',                  coins: 200, test: (s) => totalAnswers(s) >= 1000 },

  /* --- accuracy --- */
  { id: 'combo-10',      icon: '🔥', name: 'Ten Straight',       desc: 'Get 10 correct answers in a row.',          coins: 30, test: (s, g, c) => Math.max(c.bestCombo ?? 0, s.bestCombo ?? 0) >= 10 },
  { id: 'combo-25',      icon: '☄️', name: 'Unstoppable',        desc: 'Get 25 correct answers in a row.',          coins: 80, test: (s, g, c) => Math.max(c.bestCombo ?? 0, s.bestCombo ?? 0) >= 25 },
  { id: 'flawless',      icon: '💎', name: 'Flawless Run',       desc: 'Finish a drill of 8+ questions with no mistakes.', coins: 50, test: (s, g, c) => (c.flawlessRun ?? 0) >= 8 },
  { id: 'hurdle-hunter', icon: '⛰️', name: 'Hurdle Hunter',      desc: 'Answer 25 Hurdle-tier (Advanced) questions correctly.', coins: 75, test: (s) => (s.tierCorrect?.H ?? 0) >= 25 },

  /* --- speed --- */
  { id: 'quickdraw',     icon: '⚡', name: 'Quickdraw',          desc: 'Answer a Mastery-tier question correctly in under 20 seconds.', coins: 25, test: (s, g, c) => c.fastMastery === true },
  { id: 'speed-run',     icon: '🏃', name: 'Speed Run',          desc: 'Clear a 10-question drill in under 6 minutes with 80%+ accuracy.', coins: 45, test: (s, g, c) => c.speedRun === true },

  /* --- mastery --- */
  { id: 'topic-master',  icon: '🧠', name: 'Topic Mastered',     desc: 'Push any topic past 80% mastery.',          coins: 30, test: (s, g) => g && [...g.topics.keys()].some((id) => topicMastery(g, s, id) >= 0.8) },
  { id: 'five-topics',   icon: '🧩', name: 'Five Pillars',       desc: 'Master five topics.',                       coins: 70, test: (s, g) => g && [...g.topics.keys()].filter((id) => topicMastery(g, s, id) >= 0.8).length >= 5 },
  { id: 'chapter-clear', icon: '🏅', name: 'Chapter Cleared',    desc: 'Reach 80% mastery in a whole chapter.',     coins: 120, test: (s, g) => g && g.chapters.some((c) => chapterMastery(g, s, c.id) >= 0.8) },
  { id: 'triple-threat', icon: '🔺', name: 'Triple Threat',      desc: 'Read at least one topic in Physics, Chemistry and Maths.', coins: 40,
    test: (s, g) => g && ['physics', 'chemistry', 'maths'].every((sub) =>
      [...g.topics.values()].some((t) => t.subject === sub && s.topics[t.id]?.read)) },

  /* --- bosses --- */
  { id: 'boss-1',        icon: '⚔️', name: 'Giant Slayer',       desc: 'Defeat your first chapter boss.',           coins: 60, test: (s) => Object.values(s.chapters).some((c) => c.bossWins > 0) },
  { id: 'boss-perfect',  icon: '👑', name: 'Untouchable',        desc: 'Defeat a boss without losing a single life.', coins: 120, test: (s, g, c) => c.perfectBoss === true },
  { id: 'boss-all',      icon: '🛡️', name: 'Three Crowns',       desc: 'Defeat three chapter bosses.',  coins: 250, test: (s) => Object.values(s.chapters).filter((c) => c.bossWins > 0).length >= 3 },

  /* --- consistency --- */
  { id: 'streak-3',      icon: '🌱', name: 'Habit Forming',      desc: 'Keep a 3-day streak.',                      coins: 20, test: (s) => s.streak.best >= 3 },
  { id: 'streak-7',      icon: '🌿', name: 'One Week Strong',    desc: 'Keep a 7-day streak.',                      coins: 50, test: (s) => s.streak.best >= 7 },
  { id: 'streak-30',     icon: '🌳', name: 'Month of Discipline',desc: 'Keep a 30-day streak.',                     coins: 200, test: (s) => s.streak.best >= 30 },
  { id: 'early-bird',    icon: '🐦', name: 'Early Bird',         desc: 'Study before 7 a.m.',                       coins: 25, test: () => new Date().getHours() < 7 },
  { id: 'night-owl',     icon: '🦉', name: 'Night Owl',          desc: 'Study after 11 p.m.',                       coins: 25, test: () => new Date().getHours() >= 23 },

  /* --- review --- */
  { id: 'review-50',     icon: '🔁', name: 'Memory Keeper',      desc: 'Complete 50 spaced reviews.',               coins: 60, test: (s) => (s.reviewCount ?? 0) >= 50 },
  { id: 'inbox-zero',    icon: '📭', name: 'Nothing Due',        desc: 'Clear the entire review queue.',            coins: 80, test: (s, g, c) => c.queueCleared === true },

  /* --- meta --- */
  { id: 'level-10',      icon: '🎖️', name: 'Double Digits',      desc: 'Reach level 10.',                           coins: 80, test: (s) => s.xp >= 3000 },
  { id: 'printer',       icon: '🖨️', name: 'Analogue Backup',    desc: 'Generate a print pack.',                    coins: 20, test: (s) => (s.printCount ?? 0) >= 1 },
  { id: 'curious',       icon: '🔍', name: 'Curious Mind',       desc: 'Open the knowledge graph.',                 coins: 15, test: (s) => (s.graphViews ?? 0) >= 1 },
  { id: 'no-hints',      icon: '🚫', name: 'Unaided',            desc: 'Finish a 10-question drill without a single hint.', coins: 45, test: (s, g, c) => (c.noHintRun ?? 0) >= 10 },
  { id: 'comeback',      icon: '💪', name: 'Comeback',           desc: 'Get a question right that you previously got wrong twice.', coins: 35, test: (s, g, c) => c.comeback === true }
];

const BY_ID = new Map(ACHIEVEMENTS.map((a) => [a.id, a]));
export const achievementById = (id) => BY_ID.get(id);

/**
 * Run every predicate and unlock whatever passes.
 * @param {object} graph
 * @param {object} ctx transient facts from the current session (combo, run
 *                     length, etc.) that aren't worth persisting
 * @returns {Array} newly unlocked badges
 */
export function checkAchievements(graph = null, ctx = {}) {
  const state = get();
  const fresh = [];

  for (const a of ACHIEVEMENTS) {
    if (state.achievements[a.id]) continue;
    let passed = false;
    try { passed = Boolean(a.test(state, graph, ctx)); }
    catch (err) { console.warn(`[achievements] "${a.id}" predicate failed`, err); }
    if (!passed) continue;

    state.achievements[a.id] = Date.now();
    if (a.coins) addCoins(a.coins, `achievement:${a.id}`);
    pushLog({ type: 'achievement', id: a.id });
    fresh.push(a);
    emit(EV.ACHIEVEMENT, a);
  }
  return fresh;
}

export function unlockedCount(state = get()) {
  return Object.keys(state.achievements).length;
}

/** Progress toward the next few locked badges, for the profile screen. */
export function nearMisses(state = get(), graph = null, n = 3) {
  const locked = ACHIEVEMENTS.filter((a) => !state.achievements[a.id]);
  const scored = locked.map((a) => ({ a, p: estimateProgress(a, state, graph) }));
  return scored.sort((x, y) => y.p - x.p).slice(0, n);
}

/** Rough completion fraction - only meaningful for the counting badges. */
function estimateProgress(a, state, graph) {
  const ans = totalAnswers(state);
  switch (a.id) {
    case 'q-50': return ans / 50;
    case 'q-250': return ans / 250;
    case 'q-1000': return ans / 1000;
    case 'streak-3': return state.streak.best / 3;
    case 'streak-7': return state.streak.best / 7;
    case 'streak-30': return state.streak.best / 30;
    case 'level-10': return state.xp / 3000;
    case 'review-50': return (state.reviewCount ?? 0) / 50;
    case 'five-topics':
      return graph ? [...graph.topics.keys()].filter((id) => topicMastery(graph, state, id) >= 0.8).length / 5 : 0;
    default: return 0.05;
  }
}
