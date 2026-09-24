/**
 * analytics.js - read-only derivations for the Progress screen.
 *
 * Nothing here mutates state. Everything is computed from the save file on
 * demand, which keeps the persisted blob small and means changing a metric
 * never requires a migration.
 */

import { dayKey, levelInfo } from '../core/store.js';
import { chapterMastery, topicMastery, subjectMastery, kcMastery } from './knowledgeGraph.js';
import { effectiveMastery, MASTERY_THRESHOLD } from './bkt.js';
import * as srs from './srs.js';
import * as irt from './irt.js';
import { toTheta } from './elo.js';

const DAY = 86400000;

/* ------------------------------------------------------------------ */
/* headline numbers                                                    */
/* ------------------------------------------------------------------ */

export function overview(graph, state, now = Date.now()) {
  const items = Object.values(state.items);
  const answered = items.reduce((n, i) => n + i.seen, 0);
  const correct = items.reduce((n, i) => n + i.correct, 0);

  const topics = [...graph.topics.keys()];
  const mastered = topics.filter((id) => topicMastery(graph, state, id, now) >= MASTERY_THRESHOLD).length;
  const read = topics.filter((id) => state.topics[id]?.read).length;

  const kcs = Object.entries(state.kc).filter(([, r]) => r.seen);
  const due = kcs.filter(([, r]) => srs.isDue(r, now)).length;

  return {
    answered,
    correct,
    accuracy: answered ? correct / answered : 0,
    topicsTotal: topics.length,
    topicsRead: read,
    topicsMastered: mastered,
    kcsSeen: kcs.length,
    kcsMastered: kcs.filter(([id]) => kcMastery(state, id, now) >= MASTERY_THRESHOLD).length,
    due,
    level: levelInfo(state.xp),
    minutes: Object.values(state.days).reduce((n, d) => n + (d.min || 0), 0),
    streak: state.streak.count,
    bestStreak: state.streak.best
  };
}

/* ------------------------------------------------------------------ */
/* per-subject                                                         */
/* ------------------------------------------------------------------ */

export function bySubject(graph, state, now = Date.now()) {
  const subjects = [...new Set(graph.chapters.map((c) => c.subject))];
  return subjects.map((sub) => {
    const chs = graph.chapters.filter((c) => c.subject === sub);
    const topics = [...graph.topics.values()].filter((t) => t.subject === sub);

    let a = 0, c = 0;
    for (const t of topics) {
      for (const q of t.questions || []) {
        const rec = state.items[q.id];
        if (rec) { a += rec.seen; c += rec.correct; }
      }
    }
    const ab = state.ability[sub];
    const theta = typeof ab === 'number' ? ab : (ab?.theta ?? 0);

    return {
      subject: sub,
      mastery: subjectMastery(graph, state, sub, now),
      chapters: chs.map((ch) => ({ id: ch.id, title: ch.title, mastery: chapterMastery(graph, state, ch.id, now) })),
      answered: a,
      correct: c,
      accuracy: a ? c / a : 0,
      theta,
      se: ab?.se ?? 1,
      percentile: irt.thetaToPercentile(theta),
      topicsRead: topics.filter((t) => state.topics[t.id]?.read).length,
      topicsTotal: topics.length
    };
  });
}

/* ------------------------------------------------------------------ */
/* tiers                                                               */
/* ------------------------------------------------------------------ */

export function byTier(graph, state) {
  const out = { G: { a: 0, c: 0 }, M: { a: 0, c: 0 }, H: { a: 0, c: 0 } };
  for (const t of graph.topics.values()) {
    for (const q of t.questions || []) {
      const rec = state.items[q.id];
      if (!rec || !rec.seen) continue;
      const tier = q.tier || 'M';
      out[tier].a += rec.seen;
      out[tier].c += rec.correct;
    }
  }
  return Object.entries(out).map(([tier, v]) => ({
    tier, ...v, accuracy: v.a ? v.c / v.a : 0
  }));
}

/* ------------------------------------------------------------------ */
/* weak spots                                                          */
/* ------------------------------------------------------------------ */

/** KCs the learner has met and is weakest at - the "fix these next" list. */
export function weakest(graph, state, n = 6, now = Date.now()) {
  return Object.entries(state.kc)
    .filter(([, r]) => r.seen >= 2)
    .map(([id, r]) => {
      const node = graph.kcs.get(id);
      return {
        id,
        name: node?.name || id,
        subject: node?.subject,
        topicId: node?.topicId,
        mastery: effectiveMastery(r, now),
        attempts: r.a,
        accuracy: r.a ? r.c / r.a : 0,
        elo: r.elo
      };
    })
    .filter((k) => k.mastery < MASTERY_THRESHOLD)
    .sort((a, b) => a.mastery - b.mastery)
    .slice(0, n);
}

/** Items that keep going wrong - candidates for a targeted rescue drill. */
export function troubleItems(graph, state, n = 8) {
  const byId = new Map();
  for (const t of graph.topics.values()) {
    for (const q of t.questions || []) byId.set(q.id, { q, topic: t });
  }
  return Object.entries(state.items)
    .filter(([, r]) => r.seen >= 2 && r.correct / r.seen < 0.5)
    .map(([id, r]) => ({ id, ...byId.get(id), seen: r.seen, correct: r.correct, rate: r.correct / r.seen }))
    .filter((x) => x.q)
    .sort((a, b) => a.rate - b.rate || b.seen - a.seen)
    .slice(0, n);
}

/* ------------------------------------------------------------------ */
/* time series                                                         */
/* ------------------------------------------------------------------ */

/** Last `n` days of activity, oldest first, with gaps filled. */
export function activitySeries(state, n = 30, now = Date.now()) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const key = dayKey(new Date(now - i * DAY));
    const d = state.days[key];
    out.push({
      day: key,
      xp: d?.xp ?? 0,
      q: d?.q ?? 0,
      correct: d?.correct ?? 0,
      min: d?.min ?? 0,
      accuracy: d?.q ? d.correct / d.q : null
    });
  }
  return out;
}

/** GitHub-style contribution grid: 7 rows x weeks. */
export function heatmap(state, weeks = 18, now = Date.now()) {
  const days = weeks * 7;
  const series = activitySeries(state, days, now);
  const max = Math.max(1, ...series.map((d) => d.xp));
  return series.map((d) => ({
    ...d,
    level: d.xp === 0 ? 0 : Math.min(4, 1 + Math.floor((d.xp / max) * 3.4))
  }));
}

/** Review load for the next fortnight. */
export function reviewForecast(graph, state, days = 14, now = Date.now()) {
  const entries = Object.entries(state.kc)
    .filter(([, r]) => r.seen)
    .map(([id, rec]) => ({ id, rec }));
  return srs.forecast(entries, days, now);
}

/* ------------------------------------------------------------------ */
/* projections                                                         */
/* ------------------------------------------------------------------ */

/**
 * A deliberately conservative score projection.
 *
 * It is an *estimate from this platform's own item bank*, not a rank
 * prediction, and the UI says so. Blends the IRT ability with observed
 * accuracy so a learner who has only answered 6 questions doesn't see a wild
 * number: confidence scales with n.
 */
export function projection(graph, state, now = Date.now()) {
  const subs = bySubject(graph, state, now);
  const n = subs.reduce((s, x) => s + x.answered, 0);
  const confidence = Math.min(1, n / 120);

  const perSubject = subs.map((s) => {
    const fromTheta = irt.normCdf(s.theta * 1.05) * 100;
    const fromAcc = s.accuracy * 100;
    const blended = fromTheta * 0.6 + fromAcc * 0.4;
    return {
      subject: s.subject,
      score: Math.round(blended * (0.55 + 0.45 * confidence)),
      percentile: s.percentile,
      answered: s.answered
    };
  });

  const overall = perSubject.length
    ? Math.round(perSubject.reduce((s, x) => s + x.score, 0) / perSubject.length)
    : 0;

  return {
    confidence,
    overall,
    perSubject,
    note: confidence < 0.4
      ? 'Answer more questions for a meaningful estimate.'
      : 'Based on this platform’s item bank only.'
  };
}

/** Days to reach a mastery target at the current rate. */
export function paceToTarget(graph, state, target = 0.8, now = Date.now()) {
  const series = activitySeries(state, 14, now).filter((d) => d.q > 0);
  if (series.length < 3) return null;

  const topics = [...graph.topics.keys()];
  const cur = topics.reduce((s, id) => s + topicMastery(graph, state, id, now), 0) / topics.length;
  if (cur >= target) return { done: true, days: 0 };

  // Mastery gained over the window, per active day.
  const activeDays = series.length;
  const qPerDay = series.reduce((s, d) => s + d.q, 0) / activeDays;
  // Empirically ~0.9% average mastery per answered question early on.
  const ratePerDay = qPerDay * 0.009;
  if (ratePerDay <= 0.0005) return null;

  return { done: false, days: Math.ceil((target - cur) / ratePerDay), current: cur, target };
}

/* ------------------------------------------------------------------ */
/* speed                                                               */
/* ------------------------------------------------------------------ */

/** Median seconds per question, overall and by tier. Speed is half of JEE. */
export function timing(graph, state) {
  const buckets = { G: [], M: [], H: [], all: [] };
  for (const t of graph.topics.values()) {
    for (const q of t.questions || []) {
      const rec = state.items[q.id];
      if (!rec?.ms?.length) continue;
      const tier = q.tier || 'M';
      for (const ms of rec.ms) { buckets[tier].push(ms); buckets.all.push(ms); }
    }
  }
  const med = (arr) => {
    if (!arr.length) return null;
    const a = [...arr].sort((x, y) => x - y);
    return a[Math.floor(a.length / 2)] / 1000;
  };
  return { G: med(buckets.G), M: med(buckets.M), H: med(buckets.H), all: med(buckets.all), n: buckets.all.length };
}

/** Elo rating averaged over seen KCs, for the profile badge. */
export function ratingOf(state, subject = null, graph = null) {
  const entries = Object.entries(state.kc).filter(([id, r]) => {
    if (!r.seen) return false;
    if (!subject) return true;
    return graph?.kcs.get(id)?.subject === subject;
  });
  if (!entries.length) return { rating: 1200, theta: 0, n: 0 };
  const rating = Math.round(entries.reduce((s, [, r]) => s + r.elo, 0) / entries.length);
  return { rating, theta: toTheta(rating), n: entries.length };
}
