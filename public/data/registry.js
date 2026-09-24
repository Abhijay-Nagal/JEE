/**
 * registry.js - the single source of truth for authored content.
 *
 * Every chapter file is imported here and indexed once at boot. Views never
 * reach into the chapter files directly; they ask the registry. That keeps
 * "where does content live" in one place and makes adding Chapter 2 a
 * two-line change.
 */

import physics01 from './physics/ch01.js';
import physics02 from './physics/ch02.js';
import chemistry01 from './chemistry/ch01.js';
import chemistry02 from './chemistry/ch02.js';
import maths01 from './maths/ch01.js';
import maths02 from './maths/ch02.js';
import { SUBJECTS, SUBJECT_BY_ID, ROADMAP, STORY, TIERS, TIER_ORDER } from './syllabus.js';

export const CHAPTERS = [physics01, physics02, chemistry01, chemistry02, maths01, maths02];

/* ---- indices ---- */

const chapterById = new Map();
const topicById = new Map();
const questionById = new Map();
const chaptersBySubject = new Map();

for (const ch of CHAPTERS) {
  chapterById.set(ch.id, ch);
  if (!chaptersBySubject.has(ch.subject)) chaptersBySubject.set(ch.subject, []);
  chaptersBySubject.get(ch.subject).push(ch);

  for (const t of ch.topics) {
    // Back-references so a topic always knows where it lives.
    t.chapterId = ch.id;
    t.subject = ch.subject;
    t.chapterTitle = ch.title;
    topicById.set(t.id, t);

    for (const q of t.questions || []) {
      q.topicId = t.id;
      q.chapterId = ch.id;
      q.subject = ch.subject;
      questionById.set(q.id, q);
    }
  }

  for (const q of ch.boss?.extraQuestions || []) {
    q.topicId = null;
    q.chapterId = ch.id;
    q.subject = ch.subject;
    questionById.set(q.id, q);
  }
}

/* ---- lookups ---- */

export const getChapter = (id) => chapterById.get(id) || null;
export const getTopic = (id) => topicById.get(id) || null;
export const getQuestion = (id) => questionById.get(id) || null;
export const chaptersOf = (subject) => chaptersBySubject.get(subject) || [];
export const allTopics = () => [...topicById.values()];
export const allQuestions = () => [...questionById.values()];

/** Topics of a chapter, in authored order. */
export const topicsOf = (chapterId) => getChapter(chapterId)?.topics || [];

/** The topic before/after this one, within its chapter. */
export function neighbours(topicId) {
  const t = getTopic(topicId);
  if (!t) return { prev: null, next: null };
  const list = topicsOf(t.chapterId);
  const i = list.findIndex((x) => x.id === topicId);
  return { prev: i > 0 ? list[i - 1] : null, next: i < list.length - 1 ? list[i + 1] : null };
}

/**
 * The boss question pool: every Hurdle-tier question in the chapter plus the
 * boss's own extras. Built fresh each call so a retry reshuffles.
 */
export function bossPool(chapterId) {
  const ch = getChapter(chapterId);
  if (!ch) return [];
  const hard = ch.topics.flatMap((t) => (t.questions || []).filter((q) => q.tier === 'H'));
  return [...hard, ...(ch.boss?.extraQuestions || [])];
}

/** Every formula in a chapter, for the print pack and the formula screen. */
export function formulasOf(chapterId) {
  const ch = getChapter(chapterId);
  if (!ch) return [];
  const fromTopics = ch.topics.flatMap((t) =>
    (t.formulas || []).map((f) => ({ ...f, topicId: t.id, topicTitle: t.title })));
  return [...(ch.formulaSheet || []).map((f) => ({ ...f, sheet: true })), ...fromTopics];
}

/* ---- counts, used all over the UI ---- */

export const STATS = {
  chapters: CHAPTERS.length,
  topics: topicById.size,
  questions: questionById.size,
  kcs: CHAPTERS.reduce((n, c) => n + Object.keys(c.kcs || {}).length, 0),
  widgets: new Set([...topicById.values()].map((t) => t.widget).filter(Boolean)).size,
  bosses: CHAPTERS.filter((c) => c.boss).length,
  estMinutes: CHAPTERS.reduce((n, c) => n + (c.estMin || 0), 0),
  byTier: (() => {
    const out = { G: 0, M: 0, H: 0 };
    for (const q of questionById.values()) out[q.tier || 'M'] = (out[q.tier || 'M'] || 0) + 1;
    return out;
  })()
};

/* ---- search ---- */

/**
 * A flat, lowercase search index. Small enough (a few hundred rows) that a
 * linear scan is faster than building a trie, and it works offline.
 */
const searchIndex = [];
for (const ch of CHAPTERS) {
  searchIndex.push({
    kind: 'chapter', id: ch.id, title: ch.title, sub: ch.subtitle, subject: ch.subject,
    href: `#/chapter/${ch.subject}/${ch.id}`,
    hay: `${ch.title} ${ch.subtitle} ${ch.blurb}`.toLowerCase()
  });
  for (const t of ch.topics) {
    searchIndex.push({
      kind: 'topic', id: t.id, title: t.title, sub: ch.title, subject: ch.subject,
      href: `#/topic/${ch.subject}/${ch.id}/${t.id}`,
      hay: `${t.title} ${t.short || ''} ${(t.kcs || []).map((k) => ch.kcs[k]?.name || '').join(' ')}`.toLowerCase()
    });
    for (const f of t.formulas || []) {
      searchIndex.push({
        kind: 'formula', id: `${t.id}:${f.name}`, title: f.name, sub: t.title, subject: ch.subject,
        href: `#/topic/${ch.subject}/${ch.id}/${t.id}`, tex: f.tex,
        hay: `${f.name} ${f.note || ''}`.toLowerCase()
      });
    }
  }
  for (const [kcId, kc] of Object.entries(ch.kcs || {})) {
    searchIndex.push({
      kind: 'concept', id: kcId, title: kc.name, sub: ch.title, subject: ch.subject,
      href: `#/chapter/${ch.subject}/${ch.id}`,
      hay: kc.name.toLowerCase()
    });
  }
}

export function search(query, limit = 12) {
  const q = String(query || '').trim().toLowerCase();
  if (q.length < 2) return [];
  const terms = q.split(/\s+/);

  return searchIndex
    .map((row) => {
      let score = 0;
      for (const term of terms) {
        const at = row.hay.indexOf(term);
        if (at === -1) return null;
        score += at === 0 ? 3 : 1;                       // prefix matches rank higher
        if (row.title.toLowerCase().includes(term)) score += 2;
      }
      // Prefer topics and formulas over bare concept rows.
      if (row.kind === 'topic') score += 1.5;
      if (row.kind === 'formula') score += 1;
      return { ...row, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export { SUBJECTS, SUBJECT_BY_ID, ROADMAP, STORY, TIERS, TIER_ORDER };
