#!/usr/bin/env node
/**
 * End-to-end smoke test, run in Node against a minimal DOM shim.
 *
 * Covers the parts that would otherwise only fail in front of a learner:
 *   1. every LaTeX string in the content renders without hitting the
 *      "unsupported command" branch of mathlite;
 *   2. the five learning models actually move in the right direction when a
 *      simulated learner answers questions;
 *   3. the recommender, quest tracker and achievement checker survive a full
 *      simulated study session;
 *   4. mastery, XP, streaks and the SRS schedule all end up self-consistent.
 *
 * Run with: npm run smoke
 */

/* ------------------------------------------------------------------ */
/* minimal DOM                                                         */
/* ------------------------------------------------------------------ */

class Nd {
  constructor(tag, ns = null) {
    this.tagName = tag;
    this.ns = ns;
    this.children = [];
    this.attributes = {};
    this.style = {};
    this.dataset = {};
    this._classes = new Set();
    this.nodeValue = '';
  }
  get classList() {
    const s = this._classes;
    return { add: (...c) => c.forEach((x) => s.add(x)), remove: (...c) => c.forEach((x) => s.delete(x)), contains: (c) => s.has(c), toggle: () => {} };
  }
  get className() { return [...this._classes].join(' '); }
  set className(v) { this._classes = new Set(String(v).split(/\s+/).filter(Boolean)); }
  appendChild(c) { this.children.push(c); c.parentNode = this; return c; }
  insertBefore(c) { this.children.unshift(c); return c; }
  removeChild(c) { this.children = this.children.filter((x) => x !== c); }
  setAttribute(k, v) { this.attributes[k] = String(v); if (k === 'class') this.className = v; }
  getAttribute(k) { return this.attributes[k] ?? null; }
  addEventListener() {}
  removeEventListener() {}
  cloneNode() {
    const n = new Nd(this.tagName, this.ns);
    n.attributes = { ...this.attributes };
    n.style = { ...this.style };
    n.dataset = { ...this.dataset };
    n._classes = new Set(this._classes);
    n.nodeValue = this.nodeValue;
    n.children = this.children.map((c) => c.cloneNode(true));
    return n;
  }
  get textContent() {
    if (this.tagName === '#text') return this.nodeValue;
    return this.children.map((c) => c.textContent).join('');
  }
  set innerHTML(v) { this._html = v; this.children = []; }
  querySelector() { return null; }
  querySelectorAll() { return []; }
  get firstChild() { return this.children[0]; }
  get lastChild() { return this.children[this.children.length - 1]; }
}

class Txt extends Nd {
  constructor(t) { super('#text'); this.nodeValue = String(t); }
  cloneNode() { return new Txt(this.nodeValue); }
}

globalThis.Node = Nd;
globalThis.document = {
  createElement: (t) => new Nd(t),
  createElementNS: (ns, t) => new Nd(t, ns),
  createTextNode: (t) => new Txt(t),
  createDocumentFragment: () => new Nd('#fragment'),
  documentElement: new Nd('html'),
  body: new Nd('body'),
  addEventListener() {},
  querySelector: () => null,
  querySelectorAll: () => []
};
globalThis.window = { matchMedia: () => ({ matches: false }), addEventListener() {} };

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k)
};

/* ------------------------------------------------------------------ */

const fails = [];
const notes = [];
let checks = 0;

function ok(cond, label, detail = '') {
  checks++;
  if (!cond) fails.push(`${label}${detail ? ' — ' + detail : ''}`);
}
const near = (a, b, tol = 1e-6) => Math.abs(a - b) <= tol;

/* ------------------------------------------------------------------ */

const { CHAPTERS, allQuestions, allTopics, STATS, search } = await import('../public/data/registry.js');
const mathlite = await import('../public/js/core/mathlite.js');
const bkt = await import('../public/js/engine/bkt.js');
const irt = await import('../public/js/engine/irt.js');
const elo = await import('../public/js/engine/elo.js');
const srs = await import('../public/js/engine/srs.js');
const bandit = await import('../public/js/engine/bandit.js');
const kg = await import('../public/js/engine/knowledgeGraph.js');
const rec = await import('../public/js/engine/recommender.js');
const grader = await import('../public/js/engine/grader.js');
const quests = await import('../public/js/engine/quests.js');
const ach = await import('../public/js/engine/achievements.js');
const analytics = await import('../public/js/engine/analytics.js');
const Store = await import('../public/js/core/store.js');

console.log('\n  JEE ASCENT — smoke test');
console.log('  ' + '─'.repeat(56));

/* ================================================================== */
/* 1. maths rendering                                                  */
/* ================================================================== */

function findUnsupported(node, out = []) {
  if (!node || node.tagName === '#text') return out;
  const title = node.attributes?.title;
  if (title && title.startsWith('unsupported:')) out.push(title);
  for (const c of node.children || []) findUnsupported(c, out);
  return out;
}

function checkTex(tex, where) {
  try {
    const bad = findUnsupported(mathlite.renderMath(tex));
    if (bad.length) fails.push(`[${where}] ${bad.join(', ')} in "${tex.slice(0, 50)}"`);
    checks++;
  } catch (err) {
    fails.push(`[${where}] renderMath threw on "${tex.slice(0, 50)}": ${err.message}`);
  }
}

function checkInline(text, where) {
  const str = String(text ?? '');
  for (const m of str.matchAll(/\$([^$]+)\$/g)) checkTex(m[1], where);
}

function walkContent(v, where) {
  if (typeof v === 'string') { checkInline(v, where); return; }
  if (Array.isArray(v)) { v.forEach((x) => walkContent(x, where)); return; }
  if (v && typeof v === 'object') {
    for (const [k, val] of Object.entries(v)) {
      if (k === 'tex') checkTex(val, where);
      else walkContent(val, where);
    }
  }
}

for (const ch of CHAPTERS) walkContent(ch, ch.id);
console.log(`  ✓ LaTeX        ${checks} expressions rendered`);

// A couple of targeted parser assertions.
ok(mathlite.renderMath('\\frac{1}{2}').textContent.includes('1'), 'frac renders numerator');
ok(mathlite.toPlain('\\frac{a}{b}') === '(a)/(b)', 'toPlain handles frac', mathlite.toPlain('\\frac{a}{b}'));
ok(mathlite.renderMath('x^2').textContent === 'x2', 'superscript renders', mathlite.renderMath('x^2').textContent);

/* ================================================================== */
/* 2. the models                                                       */
/* ================================================================== */

// --- BKT
{
  const prm = bkt.paramsFor({}, 'M');
  let p = 0.12;
  for (let i = 0; i < 6; i++) p = bkt.step(p, true, prm).p;
  ok(p > 0.8, 'BKT rises on a run of correct answers', `p=${p.toFixed(3)}`);
  let q = p;
  for (let i = 0; i < 6; i++) q = bkt.step(q, false, prm).p;
  ok(q < p, 'BKT falls on a run of wrong answers', `p=${q.toFixed(3)}`);
  const decayed = bkt.decay(0.9, 21, prm);
  ok(decayed < 0.9 && decayed > prm.pGuess * 0.5 - 0.01, 'BKT decays toward the guess floor', `${decayed.toFixed(3)}`);
  ok(bkt.predict(0.95, prm) > bkt.predict(0.2, prm), 'BKT predicts better for higher mastery');
}

// --- IRT
{
  const easy = { a: 1, b: -1, c: 0.25 };
  const hard = { a: 1, b: 1.5, c: 0.25 };
  ok(irt.pCorrect(0, easy) > irt.pCorrect(0, hard), 'IRT: easy item beats hard at the same ability');
  ok(irt.pCorrect(2, hard) > irt.pCorrect(-2, hard), 'IRT: higher ability beats lower');
  ok(irt.pCorrect(-5, hard) >= 0.24, 'IRT: guessing floor holds');

  const up = irt.updateTheta(0, 0.9, hard, true);
  const down = irt.updateTheta(0, 0.9, hard, false);
  ok(up.theta > 0, 'IRT: ability rises after a correct answer', `${up.theta.toFixed(3)}`);
  ok(down.theta < 0, 'IRT: ability falls after a wrong answer', `${down.theta.toFixed(3)}`);

  const many = irt.estimateTheta(Array.from({ length: 30 }, () => ({ item: hard, correct: true })));
  ok(many.se < 0.9, 'IRT: standard error shrinks with more responses', `se=${many.se.toFixed(3)}`);
  ok(irt.thetaToPercentile(0) > 45 && irt.thetaToPercentile(0) < 55, 'IRT: theta 0 is mid-percentile');
  ok(irt.thetaToPercentile(2) > 95, 'IRT: theta 2 is top percentile');
  ok(irt.information(1.5, hard) > irt.information(-2, hard), 'IRT: information peaks near the difficulty');
}

// --- Elo
{
  const r = elo.play({ rating: 1200, n: 0 }, { rating: 1400, n: 0 }, true);
  ok(r.learner.rating > 1200, 'Elo: beating a harder item raises the rating');
  ok(r.item.rating < 1400, 'Elo: the item loses rating when it is beaten');
  ok(elo.expected(1600, 1200) > 0.8, 'Elo: expected score for a big gap');
  ok(near(elo.toTheta(elo.fromTheta(1.5)), 1.5, 0.01), 'Elo <-> theta round-trips');
}

// --- SRS
{
  const card = { ease: 2.5, ivl: 0, reps: 0, lapses: 0 };
  const now = Date.now();
  srs.schedule(card, 5, now);
  ok(card.ivl === 1, 'SRS: first success schedules 1 day', `ivl=${card.ivl}`);
  srs.schedule(card, 5, now);
  ok(card.ivl >= 3.5, 'SRS: second success jumps to ~4 days', `ivl=${card.ivl}`);
  const before = card.ivl;
  srs.schedule(card, 5, now);
  ok(card.ivl > before, 'SRS: interval keeps growing');
  const easeBefore = card.ease;
  srs.schedule(card, 1, now);
  ok(card.ivl <= 1 && card.ease < easeBefore, 'SRS: a lapse resets the ladder and lowers ease');

  ok(srs.quality({ correct: true, ms: 10000, expectedMs: 60000 }) === 5, 'SRS: fast correct = quality 5');
  ok(srs.quality({ correct: true, ms: 200000, expectedMs: 60000 }) < 5, 'SRS: slow correct scores lower');
  ok(srs.quality({ correct: false }) < 3, 'SRS: wrong answers fall below the lapse threshold');

  const fresh = { ease: 2.5, ivl: 10, reps: 3, lapses: 0, lastAt: now, stability: 10 / -Math.log(0.9) };
  ok(srs.retrievability(fresh, now) > 0.99, 'SRS: recall is ~1 right after review');
  ok(srs.retrievability(fresh, now + 10 * 86400000) < 0.95, 'SRS: recall decays over the interval');
}

// --- bandit
{
  const s = {};
  for (let i = 0; i < 60; i++) {
    bandit.reward(s, 'drill', 0.9);
    bandit.reward(s, 'sim', 0.1);
  }
  const stats = bandit.armStats(s);
  ok(stats[0].id === 'drill', 'Bandit: the rewarding arm rises to the top', stats.map((x) => x.id).join(','));

  let drillPicks = 0;
  for (let i = 0; i < 200; i++) if (bandit.choose(s, ['drill', 'sim']) === 'drill') drillPicks++;
  ok(drillPicks > 140, 'Bandit: Thompson sampling exploits the better arm', `${drillPicks}/200`);
  ok(bandit.betaSample(5, 5) > 0 && bandit.betaSample(5, 5) < 1, 'Bandit: beta samples stay in (0,1)');
}

console.log('  ✓ models       BKT, IRT, Elo, SM-2 and the bandit all behave');

/* ================================================================== */
/* 3. knowledge graph                                                  */
/* ================================================================== */

const graph = kg.buildGraph(CHAPTERS);
ok(graph.kcs.size === STATS.kcs, 'Graph: every KC indexed', `${graph.kcs.size} vs ${STATS.kcs}`);
ok(graph.topics.size === STATS.topics, 'Graph: every topic indexed');
ok(graph.order.length === graph.kcs.size, 'Graph: topological order covers all nodes (no cycle)');

// Prerequisites must precede their dependants in the topological order.
{
  const pos = new Map(graph.order.map((id, i) => [id, i]));
  let bad = null;
  for (const [id, n] of graph.kcs) {
    for (const p of n.prereq) {
      if (graph.kcs.has(p) && pos.get(p) > pos.get(id)) bad = `${p} after ${id}`;
    }
  }
  ok(!bad, 'Graph: topological order is valid', bad || '');
}

const st = Store.get();
ok(kg.topicUnlocked(graph, st, 'ph-01-01'), 'Graph: the first topic starts unlocked');
ok(!kg.topicUnlocked(graph, st, 'ph-01-07'), 'Graph: a downstream topic starts locked');
ok(kg.frontier(graph, st).length > 0, 'Graph: the frontier is non-empty at the start');

console.log(`  ✓ graph        ${graph.kcs.size} KCs, ${graph.order.length} in topological order, no cycles`);

/* ================================================================== */
/* 4. a simulated study session                                        */
/* ================================================================== */

quests.installQuestTracking();

const topic = graph.topics.get('ph-01-01');
Store.topicRec(topic.id).read = true;
Store.topicRec(topic.id).readAt = Date.now();

const before = {
  xp: Store.get().xp,
  mastery: kg.topicMastery(graph, Store.get(), topic.id)
};

// A competent-but-imperfect learner: right about 80% of the time.
let correctCount = 0;
const qs = topic.questions;
for (let round = 0; round < 3; round++) {
  for (const q of qs) {
    const shouldBeRight = Math.random() < 0.8;
    const given = shouldBeRight
      ? q.answer
      : (q.kind === 'mcq' ? (q.answer + 1) % q.options.length : Number(q.answer) + 7);
    const r = grader.gradeAnswer({
      q, given, ms: 30000, combo: correctCount, mode: 'drill', graph, topicId: topic.id
    });
    if (r.correct) correctCount++; else correctCount = 0;
  }
}

const after = {
  xp: Store.get().xp,
  mastery: kg.topicMastery(graph, Store.get(), topic.id)
};

ok(after.xp > before.xp, 'Session: XP accrued', `${before.xp} -> ${after.xp}`);
ok(after.mastery > before.mastery, 'Session: topic mastery rose', `${before.mastery.toFixed(3)} -> ${after.mastery.toFixed(3)}`);
ok(after.mastery > 0.5, 'Session: 27 answers at 80% accuracy clears 50% mastery', after.mastery.toFixed(3));

const stAfter = Store.get();
ok(Object.keys(stAfter.kc).length >= topic.kcs.length, 'Session: KC records created');
ok(Object.values(stAfter.kc).every((k) => k.due > 0), 'Session: every practised KC got a due date');
ok(Object.values(stAfter.items).every((i) => i.seen > 0), 'Session: item records written');
ok(stAfter.streak.count >= 1, 'Session: streak started');
ok(stAfter.days[Store.dayKey()].q === 27, 'Session: the day log counted every answer', String(stAfter.days[Store.dayKey()].q));

const ability = stAfter.ability.physics;
ok(ability && typeof ability.theta === 'number', 'Session: subject ability estimated');
ok(ability.se < 1.0, 'Session: ability standard error tightened', `se=${ability.se.toFixed(3)}`);

// Downstream topic should now be unlocked, because its prerequisite was read.
ok(kg.topicUnlocked(graph, stAfter, 'ph-01-02'), 'Session: reading a topic unlocks its dependant');

// Quests should have moved.
const qlist = quests.questList();
ok(qlist.length === 3, 'Quests: three daily missions generated', String(qlist.length));
ok(qlist.some((q) => q.progress > 0 || q.done), 'Quests: progress was tracked');

// Achievements.
const fresh = ach.checkAchievements(graph, { bestCombo: 12 });
ok(Object.keys(Store.get().achievements).length > 0, 'Achievements: at least one unlocked');

console.log(`  ✓ session      27 answers · mastery ${(before.mastery * 100).toFixed(0)}% → ${(after.mastery * 100).toFixed(0)}% · ${after.xp - before.xp} XP`);

/* ================================================================== */
/* 5. recommender and analytics                                        */
/* ================================================================== */

{
  const next = rec.nextBest(graph, Store.get());
  ok(next && next.href && next.title, 'Recommender: returns an actionable next step');
  ok(['review', 'drill', 'lesson', 'sim', 'boss', 'practice'].includes(next.arm), 'Recommender: arm is valid', next.arm);

  const drill = rec.drillSet(topic, Store.get(), { count: 6 });
  ok(drill.length === 6, 'Recommender: drill set is the requested size', String(drill.length));
  ok(new Set(drill.map((q) => q.id)).size === drill.length, 'Recommender: no duplicate questions in a set');

  const adaptive = rec.adaptiveSet(graph, Store.get(), { count: 8 });
  ok(adaptive.length > 0, 'Recommender: adaptive set drawn from unlocked topics');
  ok(new Set(adaptive.map((q) => q.id)).size === adaptive.length, 'Recommender: adaptive set has no duplicates');

  const due = rec.dueQueue(graph, Store.get(), { now: Date.now() + 40 * 86400000 });
  ok(due.length > 0, 'Recommender: cards fall due after 40 days');
  const sorted = due.every((d, i) => i === 0 || due[i - 1].priority >= d.priority);
  ok(sorted, 'Recommender: the review queue is ordered by priority');
}

{
  const ov = analytics.overview(graph, Store.get());
  ok(ov.answered === 27, 'Analytics: answered count matches', String(ov.answered));
  ok(ov.accuracy > 0 && ov.accuracy <= 1, 'Analytics: accuracy in range');
  ok(analytics.bySubject(graph, Store.get()).length === 3, 'Analytics: three subjects reported');
  ok(analytics.byTier(graph, Store.get()).length === 3, 'Analytics: three tiers reported');
  ok(analytics.activitySeries(Store.get(), 30).length === 30, 'Analytics: activity series length');
  ok(analytics.reviewForecast(graph, Store.get(), 14).length === 14, 'Analytics: forecast length');

  const proj = analytics.projection(graph, Store.get());
  ok(proj.overall >= 0 && proj.overall <= 100, 'Analytics: projection in range', String(proj.overall));
  ok(proj.confidence > 0 && proj.confidence <= 1, 'Analytics: confidence in range');

  const t = analytics.timing(graph, Store.get());
  ok(t.n === 27, 'Analytics: timing samples recorded', String(t.n));
}

console.log('  ✓ recommender  next-best action, adaptive selection and the review queue all resolve');

/* ================================================================== */
/* 6. answer checking                                                  */
/* ================================================================== */

{
  ok(grader.isCorrect({ kind: 'mcq', answer: 2 }, 2), 'Grading: mcq correct');
  ok(!grader.isCorrect({ kind: 'mcq', answer: 2 }, 1), 'Grading: mcq wrong');
  ok(grader.isCorrect({ kind: 'integer', answer: 5 }, '5'), 'Grading: integer from a string');
  ok(grader.isCorrect({ kind: 'integer', answer: 5 }, ' 5 '), 'Grading: integer tolerates whitespace');
  ok(!grader.isCorrect({ kind: 'integer', answer: 5 }, '5.4'), 'Grading: integer rejects a non-integer');
  ok(grader.isCorrect({ kind: 'numeric', answer: 1.65, tol: { abs: 0.02 } }, '1.66'), 'Grading: numeric within absolute tolerance');
  ok(!grader.isCorrect({ kind: 'numeric', answer: 1.65, tol: { abs: 0.02 } }, '1.7'), 'Grading: numeric outside tolerance');
  ok(grader.isCorrect({ kind: 'numeric', answer: 100 }, '100.5'), 'Grading: numeric default 1% relative tolerance');
  ok(grader.isCorrect({ kind: 'multi', answer: [0, 2] }, [2, 0]), 'Grading: multi ignores order');
  ok(!grader.isCorrect({ kind: 'multi', answer: [0, 2] }, [0]), 'Grading: multi needs every index');
  ok(!grader.isCorrect({ kind: 'mcq', answer: 0 }, null), 'Grading: a blank answer is wrong, not correct');

  ok(grader.marksFor({ kind: 'mcq' }, true, true) === 4, 'Marking: +4 for correct');
  ok(grader.marksFor({ kind: 'mcq' }, false, true) === -1, 'Marking: -1 for a wrong MCQ');
  ok(grader.marksFor({ kind: 'mcq' }, false, false) === 0, 'Marking: 0 for unattempted');
  ok(grader.marksFor({ kind: 'numeric' }, false, true) === 0, 'Marking: no penalty on numerical');

  // Every authored question must accept its own stated answer.
  let bad = 0;
  for (const q of allQuestions()) {
    if (!grader.isCorrect(q, q.answer)) { bad++; notes.push(`answer key rejected by grader: ${q.id}`); }
  }
  ok(bad === 0, 'Grading: every authored answer key validates', `${bad} failed`);
}

console.log('  ✓ grading      every one of the ' + STATS.questions + ' answer keys validates against the grader');

/* ================================================================== */
/* 7. search                                                           */
/* ================================================================== */

{
  ok(search('mole').length > 0, 'Search: finds "mole"');
  ok(search('dimensional').length > 0, 'Search: finds "dimensional"');
  ok(search('equivalence').length > 0, 'Search: finds "equivalence"');
  ok(search('x').length === 0, 'Search: ignores single characters');
  ok(search('zzzzqqq').length === 0, 'Search: no false positives');
}

/* ================================================================== */
/* 8. persistence                                                      */
/* ================================================================== */

{
  const json = Store.exportJSON();
  const parsed = JSON.parse(json);
  ok(parsed.app === 'jee-ascent', 'Store: export is tagged');
  ok(parsed.xp === Store.get().xp, 'Store: export carries XP');

  // A save from an older schema must migrate rather than throw.
  const old = JSON.stringify({ schema: 1, xp: 500, profile: { name: 'Old' }, kc: {}, items: {}, topics: {}, chapters: {}, ability: 0.5, days: {}, sessions: [], log: [], streak: { count: 3, best: 4, lastDay: null }, settings: {}, quests: {}, achievements: {} });
  Store.importJSON(old);
  const migrated = Store.get();
  ok(migrated.schema === Store.SCHEMA, 'Store: old save migrated to the current schema');
  ok(migrated.xp === 500, 'Store: migration preserves XP');
  ok(typeof migrated.ability === 'object', 'Store: the numeric ability field became an object');
  ok(migrated.bandit && migrated.inventory, 'Store: missing v2 fields were filled in');
  ok(migrated.tierCorrect && typeof migrated.reviewCount === 'number', 'Store: missing counters were filled in');

  ok(Store.levelInfo(0).level === 1, 'Levels: start at 1');
  ok(Store.levelInfo(80).level === 2, 'Levels: 80 XP reaches level 2', String(Store.levelInfo(80).level));
  ok(Store.levelInfo(1e6).level > 50, 'Levels: the curve keeps going');
  ok(Store.xpForLevel(5) > Store.xpForLevel(4), 'Levels: thresholds increase');
  ok(Store.rankFor(1) === 'Aspirant', 'Ranks: level 1 is Aspirant');
}

console.log('  ✓ persistence  export, import and a v1 → v3 migration all round-trip');

/* ================================================================== */
/* merge - reconciling two devices                                     */
/* ================================================================== */

{
  const { mergeState } = await import('../public/js/core/merge.js');
  const base = () => Store.blankState();

  // A laptop and a phone that have each done real, different work.
  const laptop = base();
  laptop.updatedAt = 2000;
  laptop.xp = 500; laptop.coins = 40;
  laptop.streak = { count: 3, best: 9, lastDay: '2026-01-02', freezes: 1 };
  laptop.kc['kc-a'] = { p: 0.8, a: 10, c: 8, elo: 1300, seen: 10, reps: 4, ease: 2.5, ivl: 6, due: 99, lapses: 0, lastAt: 1900 };
  laptop.topics['t-1'] = { read: true, readAt: 1500, gamePlays: 3, gameBest: 80,
    gmh: { G: { a: 5, c: 5 }, M: { a: 2, c: 1 }, H: { a: 0, c: 0 } }, done: false, doneAt: 0, notes: '' };
  laptop.achievements['first-topic'] = 1500;
  laptop.days['2026-01-02'] = { min: 20, xp: 100, q: 10, correct: 8, sessions: 1 };
  laptop.log = [{ t: 100, kind: 'answer', id: 'q1' }, { t: 200, kind: 'answer', id: 'q2' }];
  laptop.ability.physics = { theta: 0.4, se: 0.5, n: 30 };
  laptop.settings.motion = 'reduced';

  const phone = base();
  phone.updatedAt = 3000;                     // the phone is newer
  phone.xp = 300; phone.coins = 90;
  phone.streak = { count: 5, best: 5, lastDay: '2026-01-04', freezes: 0 };
  phone.kc['kc-a'] = { p: 0.4, a: 3, c: 1, elo: 1210, seen: 3, reps: 1, ease: 2.5, ivl: 1, due: 50, lapses: 1, lastAt: 2900 };
  phone.kc['kc-b'] = { p: 0.6, a: 4, c: 3, elo: 1250, seen: 4, reps: 2, ease: 2.5, ivl: 3, due: 60, lapses: 0, lastAt: 2900 };
  phone.topics['t-1'] = { read: false, readAt: 0, gamePlays: 1, gameBest: 95,
    gmh: { G: { a: 2, c: 2 }, M: { a: 6, c: 4 }, H: { a: 1, c: 1 } }, done: true, doneAt: 2800, notes: 'revise' };
  phone.achievements['first-topic'] = 2600;   // later than the laptop's
  phone.days['2026-01-02'] = { min: 15, xp: 120, q: 8, correct: 7, sessions: 2 };
  phone.log = [{ t: 200, kind: 'answer', id: 'q2' }, { t: 300, kind: 'answer', id: 'q3' }];
  phone.ability.physics = { theta: -0.1, se: 0.8, n: 5 };
  phone.settings.motion = 'full';

  const m = mergeState(laptop, phone);

  ok(m.xp === 500, 'Merge: XP takes the larger, never the newer', String(m.xp));
  ok(m.coins === 90, 'Merge: coins take the larger', String(m.coins));
  ok(m.streak.count === 5, 'Merge: streak count follows the device that studied last');
  ok(m.streak.best === 9, 'Merge: best streak is a record and survives', String(m.streak.best));

  ok(m.kc['kc-a'].seen === 10, 'Merge: the KC with more evidence wins whole');
  ok(m.kc['kc-a'].due === 99, 'Merge: SRS fields are not interleaved between devices');
  ok(m.kc['kc-b'], 'Merge: a KC only the phone has is kept');

  ok(m.topics['t-1'].read === true, 'Merge: read stays read');
  ok(m.topics['t-1'].done === true, 'Merge: done stays done');
  ok(m.topics['t-1'].gameBest === 95, 'Merge: best score takes the larger');
  ok(m.topics['t-1'].gmh.M.a === 6, 'Merge: per-tier attempt counts take the larger');
  ok(m.topics['t-1'].notes === 'revise', 'Merge: a note is not lost to an empty one');

  ok(m.achievements['first-topic'] === 1500, 'Merge: an achievement keeps its first unlock time');
  ok(m.days['2026-01-02'].min === 20 && m.days['2026-01-02'].xp === 120,
    'Merge: per-day stats take the larger field, so re-syncing cannot inflate them');
  ok(m.log.length === 3, 'Merge: logs union and de-duplicate', String(m.log.length));
  ok(m.ability.physics.n === 30, 'Merge: the ability estimate with more answers behind it wins');
  ok(m.settings.motion === 'reduced', 'Merge: settings stay local to the device');

  // Idempotence: syncing twice must not drift.
  const twice = mergeState(laptop, mergeState(laptop, phone));
  ok(JSON.stringify(twice) === JSON.stringify(m), 'Merge: is idempotent');

  // Order independence for the value-bearing fields.
  const flipped = mergeState(phone, laptop);
  ok(flipped.xp === m.xp && flipped.kc['kc-a'].seen === m.kc['kc-a'].seen
    && flipped.topics['t-1'].done === m.topics['t-1'].done && flipped.log.length === m.log.length,
    'Merge: progress does not depend on which side is called local');

  // A device that signed in but was never onboarded has an empty name. That
  // blank must not erase the name set on the other device.
  const named = base(); named.updatedAt = 1000;
  named.profile.name = 'Cadet'; named.profile.avatar = 'TELESCOPE';
  const blankP = base(); blankP.updatedAt = 9000;          // newer, but knows nothing
  blankP.profile.avatar = '';                              // never chosen on this device
  const kept = mergeState(named, blankP);
  ok(kept.profile.name === 'Cadet', 'Merge: a newer but empty profile does not blank the name', kept.profile.name);
  ok(kept.profile.avatar === 'TELESCOPE', 'Merge: nor an unset avatar', kept.profile.avatar);
  // A default the learner never touched is still a value, so it legitimately wins.
  ok(mergeState(named, base()).profile.name === 'Cadet', 'Merge: defaults do not erase a set name');
  const renamed = base(); renamed.updatedAt = 9000; renamed.profile.name = 'Abhijay';
  ok(mergeState(named, renamed).profile.name === 'Abhijay', 'Merge: but a real rename does win');

  // The degenerate cases a first sync actually hits.
  ok(mergeState(laptop, null) === laptop, 'Merge: no remote yet returns the local save');
  ok(mergeState(null, phone) === phone, 'Merge: no local save returns the remote');
  const fresh = mergeState(base(), phone);
  ok(fresh.xp === 300 && fresh.kc['kc-b'], 'Merge: a brand new device adopts the remote save');
}

console.log('  ✓ merge        two devices reconcile without losing progress');

/* ================================================================== */

console.log('  ' + '─'.repeat(56));
if (notes.length) {
  console.log(`\n  ${notes.length} note(s):`);
  notes.slice(0, 10).forEach((n) => console.log('    · ' + n));
}
if (fails.length) {
  console.log(`\n  ${fails.length} of ${checks} checks FAILED:\n`);
  fails.forEach((f) => console.log('    ✗ ' + f));
  console.log('');
  process.exit(1);
}
console.log(`\n  ✓ all ${checks} checks passed\n`);
