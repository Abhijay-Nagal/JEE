/**
 * recommender.js - "what should I do right now?"
 *
 * The dashboard's single Next Mission button, the adaptive practice queue and
 * the review queue all come from here. The policy is a small hierarchy of
 * hard rules, with the Thompson-sampling bandit breaking ties between
 * genuinely comparable options:
 *
 *   1. A heavily overdue review backlog beats everything (knowledge is
 *      actively rotting).
 *   2. An unfinished topic that was started today beats starting another
 *      (finish what you began).
 *   3. A chapter whose topics are all read but whose boss is unbeaten gets
 *      the boss.
 *   4. Otherwise: the bandit chooses between new material, drilling the
 *      weakest open topic, playing a sim, or clearing light reviews.
 */

import * as srs from './srs.js';
import * as irt from './irt.js';
import * as bandit from './bandit.js';
import { frontier, topicUnlocked, topicMastery, chapterMastery } from './knowledgeGraph.js';
import { MASTERY_THRESHOLD } from './bkt.js';

/* ------------------------------------------------------------------ */
/* review queue                                                        */
/* ------------------------------------------------------------------ */

/** All KCs the learner has met, as SRS queue entries. */
export function reviewEntries(graph, state) {
  const out = [];
  for (const [id, rec] of Object.entries(state.kc)) {
    if (!rec.seen) continue;
    const node = graph.kcs.get(id);
    out.push({ id, rec, weight: node?.weight ?? 1, node });
  }
  return out;
}

export function dueQueue(graph, state, { limit = 40, now = Date.now() } = {}) {
  return srs.buildQueue(reviewEntries(graph, state), { now, limit });
}

export function dueCount(graph, state, now = Date.now()) {
  return reviewEntries(graph, state).filter((e) => srs.isDue(e.rec, now)).length;
}

/* ------------------------------------------------------------------ */
/* question selection                                                  */
/* ------------------------------------------------------------------ */

/**
 * Adaptive set for a topic drill.
 * Walks the GMH ladder: a learner must show competence at G before M is
 * offered, but once mastery is high the ladder is skipped straight to H so
 * strong learners are not bored.
 */
export function drillSet(topic, state, { count = 6, tier = null } = {}) {
  const pool = topic.questions || [];
  if (!pool.length) return [];
  const rec = state.topics[topic.id];

  if (tier) return shuffle(pool.filter((q) => q.tier === tier)).slice(0, count);

  const acc = (t) => {
    const g = rec?.gmh?.[t];
    return g && g.a >= 2 ? g.c / g.a : null;
  };
  const aG = acc('G'), aM = acc('M');

  let mix;
  if (aG === null || aG < 0.6) mix = { G: 0.7, M: 0.3, H: 0 };
  else if (aM === null || aM < 0.55) mix = { G: 0.25, M: 0.6, H: 0.15 };
  else if (aM < 0.8) mix = { G: 0.1, M: 0.5, H: 0.4 };
  else mix = { G: 0, M: 0.35, H: 0.65 };

  const picked = [];
  const seenIds = new Set();
  for (const [t, share] of Object.entries(mix)) {
    const n = Math.round(count * share);
    const tierPool = shuffle(pool.filter((q) => q.tier === t && !seenIds.has(q.id)));
    // Prefer questions the learner has never seen, then least-recently-seen.
    tierPool.sort((a, b) => (state.items[a.id]?.seen ?? 0) - (state.items[b.id]?.seen ?? 0));
    for (const q of tierPool.slice(0, n)) { picked.push(q); seenIds.add(q.id); }
  }

  // Top up if rounding left us short.
  for (const q of shuffle(pool)) {
    if (picked.length >= count) break;
    if (!seenIds.has(q.id)) { picked.push(q); seenIds.add(q.id); }
  }
  return picked.slice(0, count);
}

/**
 * Cross-topic adaptive practice: maximum-information selection against the
 * learner's current theta, restricted to unlocked topics.
 */
export function adaptiveSet(graph, state, { subject = null, count = 10, targetP = 0.75 } = {}) {
  const pool = [];
  for (const t of graph.topics.values()) {
    if (subject && t.subject !== subject) continue;
    if (!topicUnlocked(graph, state, t.id)) continue;
    for (const q of t.questions || []) pool.push({ ...q, topicId: t.id, subject: t.subject });
  }
  if (!pool.length) return [];

  const exclude = new Set();
  const out = [];
  const thetaOf = (subj) => {
    const a = state.ability[subj];
    return typeof a === 'number' ? a : (a?.theta ?? 0);
  };

  for (let i = 0; i < count; i++) {
    const usable = pool.filter((q) => !exclude.has(q.id));
    if (!usable.length) break;
    const theta = thetaOf(subject || usable[0].subject);
    const params = usable.map((q) => ({ ...irt.itemParams(q), _q: q }));
    const chosen = irt.selectNext(theta, params, { topK: 5, targetP });
    if (!chosen) break;
    out.push(chosen._q);
    exclude.add(chosen._q.id);
  }
  return out;
}

/** Questions attached to a set of KCs - used to build review sittings. */
export function questionsForKCs(graph, kcIds, { count = 10, state = null } = {}) {
  const want = new Set(kcIds);
  const pool = [];
  for (const t of graph.topics.values()) {
    for (const q of t.questions || []) {
      if ((q.kcs || []).some((k) => want.has(k))) pool.push({ ...q, topicId: t.id, subject: t.subject });
    }
  }
  if (state) {
    // Favour items not seen recently so a review isn't a memory test of the
    // answer key rather than of the concept.
    pool.sort((a, b) => (state.items[a.id]?.lastAt ?? 0) - (state.items[b.id]?.lastAt ?? 0));
    return pool.slice(0, count);
  }
  return shuffle(pool).slice(0, count);
}

/* ------------------------------------------------------------------ */
/* next action                                                         */
/* ------------------------------------------------------------------ */

/**
 * @returns {{arm:string, title:string, reason:string, href:string, icon:string,
 *            subject?:string, urgency:number}}
 */
export function nextBest(graph, state, { now = Date.now() } = {}) {
  const due = dueQueue(graph, state, { now, limit: 60 });
  const hardDue = due.filter((e) => e.overdue > 2).length;

  /* 1. rotting knowledge */
  if (hardDue >= 5) {
    return {
      arm: 'review', icon: '🔁', title: `Clear ${hardDue} overdue reviews`,
      reason: 'These concepts have decayed past the retention target. Reviewing now costs less than relearning later.',
      href: '#/review', urgency: 1
    };
  }

  /* 2. finish what was started today */
  const today = new Date(now).toISOString().slice(0, 10);
  const started = [...graph.topics.values()].find((t) => {
    const r = state.topics[t.id];
    if (!r?.read || r.done) return false;
    const day = r.readAt ? new Date(r.readAt).toISOString().slice(0, 10) : null;
    return day === today && topicMastery(graph, state, t.id, now) < MASTERY_THRESHOLD;
  });
  if (started) {
    return {
      arm: 'drill', icon: '🎯', title: `Finish "${started.title}"`,
      reason: 'You read this today. Answering questions within a few hours locks it in far better than tomorrow.',
      href: `#/quiz/${started.subject}/${started.chapterId}/${started.id}`,
      subject: started.subject, urgency: 0.9
    };
  }

  /* 3. a chapter ready for its boss */
  for (const ch of graph.chapters) {
    const allRead = ch.topics.every((t) => state.topics[t.id]?.read);
    const beaten = (state.chapters[ch.id]?.bossWins ?? 0) > 0;
    if (allRead && !beaten && chapterMastery(graph, state, ch.id, now) > 0.5) {
      return {
        arm: 'boss', icon: '⚔️', title: `Challenge ${ch.boss?.name || 'the chapter boss'}`,
        reason: `You have covered every topic in ${ch.title}. The boss mixes them the way the exam does.`,
        href: `#/boss/${ch.subject}/${ch.id}`, subject: ch.subject, urgency: 0.85
      };
    }
  }

  /* 4. bandit over the remaining sensible options */
  const front = frontier(graph, state, { now });
  const options = [];
  if (due.length) options.push('review');
  if (front.length) { options.push('drill'); options.push('sim'); }
  const unread = front.find((f) => !f.read);
  if (unread) options.push('lesson');
  if (!options.length) {
    return {
      arm: 'practice', icon: '🧪', title: 'Adaptive mixed practice',
      reason: 'Everything is mastered and nothing is due. Mixed practice keeps it that way and sharpens speed.',
      href: '#/practice', urgency: 0.3
    };
  }

  const arm = bandit.choose(state.bandit, options, {
    review: 1 + Math.min(0.8, due.length / 20),
    lesson: unread ? 1.15 : 0.6
  });

  switch (arm) {
    case 'review':
      return {
        arm, icon: '🔁', title: `Review ${Math.min(due.length, 12)} concepts`,
        reason: 'Spaced review at the moment of near-forgetting is the cheapest retention you can buy.',
        href: '#/review', urgency: 0.6
      };
    case 'lesson': {
      const t = unread.topic;
      return {
        arm, icon: '📖', title: `Learn "${t.title}"`,
        reason: `New ground in ${t.chapterTitle}. Prerequisites are clear, so this will land.`,
        href: `#/topic/${t.subject}/${t.chapterId}/${t.id}`, subject: t.subject, urgency: 0.55
      };
    }
    case 'sim': {
      const t = front[0].topic;
      return {
        arm, icon: '🎮', title: `Play "${t.widgetTitle || t.title}"`,
        reason: 'You learn this one faster by manipulating it than by reading it again.',
        href: `#/play/${t.subject}/${t.chapterId}/${t.id}`, subject: t.subject, urgency: 0.5
      };
    }
    default: {
      const t = front[0].topic;
      return {
        arm: 'drill', icon: '🎯', title: `Drill "${t.title}"`,
        reason: `Weakest open topic at ${Math.round(front[0].mastery * 100)}% mastery. Highest expected gain per minute.`,
        href: `#/quiz/${t.subject}/${t.chapterId}/${t.id}`, subject: t.subject, urgency: 0.6
      };
    }
  }
}

/** A short ranked list for the dashboard's "also worth doing" strip. */
export function suggestions(graph, state, n = 3, { now = Date.now() } = {}) {
  const out = [];
  const front = frontier(graph, state, { now });

  for (const f of front.slice(0, n + 2)) {
    out.push({
      icon: f.read ? '🎯' : '📖',
      title: f.topic.title,
      sub: `${f.topic.chapterTitle} · ${Math.round(f.mastery * 100)}% mastered`,
      href: f.read
        ? `#/quiz/${f.topic.subject}/${f.topic.chapterId}/${f.topic.id}`
        : `#/topic/${f.topic.subject}/${f.topic.chapterId}/${f.topic.id}`,
      subject: f.topic.subject
    });
  }
  return out.slice(0, n);
}

/* ------------------------------------------------------------------ */

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
