/**
 * grader.js - the single place an answer becomes evidence.
 *
 * Every question, everywhere in the app (topic drills, adaptive practice,
 * spaced review, boss battles, mock tests) funnels through `gradeAnswer`.
 * Keeping it in one function is what makes the five learning models agree with
 * each other: one answer updates BKT mastery, the Elo pair, the IRT ability,
 * the SRS schedule and the gamification layer in a fixed order, and emits one
 * event the UI can react to.
 */

import { get, kcRec, itemRec, topicRec, addXP, addCoins, touchStreak, logDay, pushLog, abilityOf, setAbility } from '../core/store.js';
import { emit, EV } from '../core/bus.js';
import * as bkt from './bkt.js';
import * as elo from './elo.js';
import * as irt from './irt.js';
import * as srs from './srs.js';
import { diagnose } from './knowledgeGraph.js';

/* ------------------------------------------------------------------ */
/* answer checking                                                     */
/* ------------------------------------------------------------------ */

/**
 * Supported question kinds:
 *   mcq      - options[], answer = index
 *   multi    - options[], answer = [indices]   (JEE Advanced style)
 *   numeric  - answer = number, tol = absolute or {rel}
 *   integer  - answer = integer (JEE Main numerical section)
 *   match    - pairs, answer = mapping object
 */
export function isCorrect(q, given) {
  if (given === null || given === undefined || given === '') return false;

  switch (q.kind || 'mcq') {
    case 'mcq':
      return Number(given) === Number(q.answer);

    case 'multi': {
      const want = [...(q.answer || [])].map(Number).sort((a, b) => a - b);
      const got = [...(given || [])].map(Number).sort((a, b) => a - b);
      return want.length === got.length && want.every((v, i) => v === got[i]);
    }

    case 'integer': {
      // An integer-answer question wants the integer. 5.4 is not 5 - accepting
      // it would hide a genuine arithmetic error behind a rounding rule.
      // A whisker of float tolerance is allowed so 5.0000000001 still passes.
      const n = Number(String(given).trim());
      if (!Number.isFinite(n)) return false;
      const target = Number(q.answer);
      return Math.abs(n - target) < 1e-9;
    }

    case 'numeric': {
      const n = Number(String(given).trim());
      if (!Number.isFinite(n)) return false;
      const target = Number(q.answer);
      // Default tolerance is 1% relative, which matches how JEE numerical
      // answers are graded in practice (2 decimal places).
      if (typeof q.tol === 'number') return Math.abs(n - target) <= q.tol;
      const rel = q.tol?.rel ?? 0.01;
      const abs = q.tol?.abs ?? 0;
      return Math.abs(n - target) <= Math.max(abs, Math.abs(target) * rel);
    }

    case 'match': {
      const want = q.answer || {};
      const got = given || {};
      const keys = Object.keys(want);
      return keys.length === Object.keys(got).length && keys.every((k) => String(want[k]) === String(got[k]));
    }

    default:
      return false;
  }
}

/* ------------------------------------------------------------------ */
/* XP                                                                  */
/* ------------------------------------------------------------------ */

const TIER_XP = { G: 10, M: 18, H: 30 };

export function xpFor({ tier = 'M', correct, combo = 0, usedHint = false, firstTime = false, hardMode = false, mode = 'drill' }) {
  if (!correct) return 2; // effort credit - never zero, or learners stop trying hard items
  let xp = TIER_XP[tier] ?? 15;
  xp *= 1 + 0.08 * Math.min(combo, 12);      // combo multiplier, capped
  if (firstTime) xp += 6;
  if (usedHint) xp *= 0.7;
  if (hardMode) xp *= 1.25;
  if (mode === 'review') xp *= 0.8;          // reviews are cheap, they repeat
  if (mode === 'boss') xp *= 1.4;
  if (mode === 'mock') xp *= 1.15;
  return Math.round(xp);
}

/* ------------------------------------------------------------------ */
/* the pipeline                                                        */
/* ------------------------------------------------------------------ */

/**
 * @param {object} o
 * @param {object} o.q        the authored question (needs id, kcs[], tier, subject)
 * @param {*}      o.given    the learner's answer
 * @param {number} o.ms       time spent on this question
 * @param {boolean} [o.usedHint]
 * @param {number} [o.combo]  current streak of correct answers in this session
 * @param {string} [o.mode]   drill | review | boss | mock | practice
 * @param {object} [o.graph]  knowledge graph, for prerequisite blame
 * @param {string} [o.topicId]
 * @returns {object} result for the UI
 */
export function gradeAnswer({ q, given, ms = 0, usedHint = false, combo = 0, mode = 'drill', graph = null, topicId = null, attempts = 1 }) {
  const state = get();
  const now = Date.now();
  const correct = isCorrect(q, given);
  const tier = q.tier || 'M';
  const subject = q.subject || graph?.topics.get(topicId)?.subject || 'physics';

  /* ---- 1. item record + item Elo rating ---------------------------- */
  const item = itemRec(q.id);
  const firstTime = item.seen === 0;
  item.seen += 1;
  if (correct) { item.correct += 1; item.streak += 1; } else { item.streak = 0; }
  item.lastAt = now;
  item.ms.push(Math.min(ms, 600000));
  if (item.ms.length > 12) item.ms.shift();
  item.rating ??= elo.fromTheta(irt.itemParams(q).b);
  item.n ??= 0;

  /* ---- 2. per-KC BKT + Elo + SRS ----------------------------------- */
  const kcIds = q.kcs && q.kcs.length ? q.kcs : (topicId && graph?.topics.get(topicId)?.kcs) || [];
  const masteryBefore = [];
  const masteryAfter = [];

  for (const kcId of kcIds) {
    const rec = kcRec(kcId);
    const prm = bkt.paramsFor(graph?.kcs.get(kcId) || {}, tier);

    // Decay first, so a long gap is reflected before new evidence lands.
    const decayed = bkt.effectiveMastery(rec, now, prm);
    masteryBefore.push({ id: kcId, p: decayed });

    const stepped = bkt.step(decayed, correct, prm);
    rec.p = stepped.p;
    rec.a += 1;
    if (correct) rec.c += 1;
    rec.seen += 1;
    rec.lastAt = now;
    masteryAfter.push({ id: kcId, p: rec.p, gain: stepped.gain, predicted: stepped.predicted });

    // Elo: learner-for-this-KC vs the item.
    const r = elo.play(
      { rating: rec.elo, n: rec.a },
      { rating: item.rating, n: item.n },
      correct
    );
    rec.elo = r.learner.rating;
    item.rating = r.item.rating;
    item.n = r.item.n;

    // SRS: only drills/reviews schedule. Mock tests shouldn't flood the queue.
    if (mode !== 'mock') {
      const qual = srs.quality({ correct, ms, expectedMs: (q.parSec || 90) * 1000, usedHint, attempts });
      srs.schedule(rec, qual, now);
    }
  }

  /* ---- 3. subject-level IRT ability -------------------------------- */
  const params = irt.itemParams(q);
  const ab = abilityOf(subject);
  const upd = irt.updateTheta(ab.theta, ab.se, params, correct);
  setAbility(subject, { theta: upd.theta, se: upd.se, n: (ab.n || 0) + 1 });

  /* ---- 4. topic tier counters -------------------------------------- */
  if (topicId) {
    const t = topicRec(topicId);
    t.gmh[tier] ||= { a: 0, c: 0 };
    t.gmh[tier].a += 1;
    if (correct) t.gmh[tier].c += 1;
  }

  /* ---- 5. rewards --------------------------------------------------- */
  const xp = xpFor({ tier, correct, combo, usedHint, firstTime, hardMode: state.settings.hardMode, mode });
  addXP(xp, `q:${q.id}`);
  if (correct && tier === 'H') addCoins(3, 'hard-question');
  else if (correct) addCoins(1, 'question');

  touchStreak();
  logDay((d) => { d.q += 1; if (correct) d.correct += 1; });

  state.tierCorrect ||= { G: 0, M: 0, H: 0 };
  if (correct) state.tierCorrect[tier] = (state.tierCorrect[tier] || 0) + 1;
  state.bestCombo = Math.max(state.bestCombo || 0, correct ? combo + 1 : 0);
  if (mode === 'review') state.reviewCount = (state.reviewCount || 0) + 1;

  /* ---- 6. diagnosis on failure -------------------------------------- */
  let diagnosis = null;
  if (!correct && graph && kcIds.length) {
    diagnosis = diagnose(graph, state, kcIds, now);
  }

  pushLog({ type: 'answer', id: q.id, ok: correct, tier, mode, ms, subject });

  const result = {
    correct, xp, tier, mode, ms, usedHint,
    question: q,
    given,
    expected: q.answer,
    firstTime,
    masteryBefore, masteryAfter,
    masteryDelta: masteryAfter.reduce((s, m, i) => s + (m.p - (masteryBefore[i]?.p ?? 0)), 0),
    predicted: masteryAfter[0]?.predicted ?? null,
    theta: upd.theta,
    diagnosis,
    nextDue: kcIds.length ? state.kc[kcIds[0]]?.due : null
  };

  emit(EV.ANSWER, result);
  if (masteryAfter.length) emit(EV.MASTERY, { kcs: masteryAfter, subject, topicId });
  return result;
}

/**
 * A "surprise" score in 0..1 - how unexpected this answer was under the
 * current model. Used to decide whether to interrupt with an explanation.
 */
export function surpriseOf(result) {
  if (result.predicted === null) return 0.5;
  return Math.abs((result.correct ? 1 : 0) - result.predicted);
}

/** Negative marking, matching the JEE Main scheme, for mock tests only. */
export function marksFor(q, correct, attempted) {
  if (!attempted) return 0;
  if (correct) return 4;
  return (q.kind === 'integer' || q.kind === 'numeric') ? 0 : -1;
}
