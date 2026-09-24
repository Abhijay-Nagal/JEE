/**
 * knowledgeGraph.js - the prerequisite DAG.
 *
 * Content is authored as chapters -> topics -> knowledge components (KCs).
 * Each KC declares the KCs it depends on. That turns the syllabus into a
 * directed acyclic graph, which buys three things the platform needs:
 *
 *   1. Unlocking      - a topic opens when its prerequisites are understood,
 *                       so nobody meets error propagation before significant
 *                       figures.
 *   2. Blame analysis - when a learner fails a question we walk *down* the
 *                       graph to find the weakest ancestor. The fix for
 *                       "limiting reagent is hard" is usually "the mole
 *                       concept is shaky", and that is what we prescribe.
 *   3. Readiness      - chapter mastery is a prerequisite-weighted roll-up,
 *                       not a flat average of whatever was practised.
 */

import { effectiveMastery, MASTERY_THRESHOLD } from './bkt.js';

/** Mastery a prerequisite must reach before it stops gating. */
export const UNLOCK_THRESHOLD = 0.45;

/* ------------------------------------------------------------------ */
/* build                                                               */
/* ------------------------------------------------------------------ */

/**
 * @param {Array} chapters chapter objects from the content registry
 */
export function buildGraph(chapters) {
  const kcs = new Map();      // kcId -> node
  const topics = new Map();   // topicId -> topic (+ chapter/subject back-refs)

  for (const ch of chapters) {
    const kcDefs = ch.kcs || {};
    for (const [id, def] of Object.entries(kcDefs)) {
      kcs.set(id, {
        id,
        name: def.name || id,
        weight: def.weight ?? 1,
        prereq: def.prereq || [],
        bkt: def.bkt,
        subject: ch.subject,
        chapterId: ch.id,
        topicId: null,
        children: []
      });
    }
    for (const t of ch.topics || []) {
      topics.set(t.id, { ...t, chapterId: ch.id, subject: ch.subject, chapterTitle: ch.title });
      for (const kcId of t.kcs || []) {
        const node = kcs.get(kcId);
        if (node) node.topicId ||= t.id;
      }
    }
  }

  // Reverse edges + orphan detection.
  for (const node of kcs.values()) {
    for (const p of node.prereq) {
      const parent = kcs.get(p);
      if (parent) parent.children.push(node.id);
      else console.warn(`[graph] KC "${node.id}" lists unknown prerequisite "${p}"`);
    }
  }

  const order = topoSort(kcs);
  return { kcs, topics, order, chapters };
}

/** Kahn's algorithm. Reports cycles rather than silently looping forever. */
function topoSort(kcs) {
  const indeg = new Map();
  for (const [id, n] of kcs) indeg.set(id, n.prereq.filter((p) => kcs.has(p)).length);

  const queue = [...indeg].filter(([, d]) => d === 0).map(([id]) => id);
  const out = [];
  while (queue.length) {
    const id = queue.shift();
    out.push(id);
    for (const c of kcs.get(id).children) {
      indeg.set(c, indeg.get(c) - 1);
      if (indeg.get(c) === 0) queue.push(c);
    }
  }
  if (out.length !== kcs.size) {
    const stuck = [...kcs.keys()].filter((id) => !out.includes(id));
    console.error('[graph] prerequisite cycle involving:', stuck);
    return [...out, ...stuck];
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* mastery roll-ups                                                    */
/* ------------------------------------------------------------------ */

/** Time-decayed mastery of one KC. */
export function kcMastery(state, kcId, now = Date.now()) {
  const rec = state.kc[kcId];
  if (!rec) return 0.12;
  return effectiveMastery(rec, now);
}

/** Weighted mean mastery across a topic's KCs. */
export function topicMastery(graph, state, topicId, now = Date.now()) {
  const t = graph.topics.get(topicId);
  if (!t || !t.kcs?.length) return 0;
  let num = 0, den = 0;
  for (const id of t.kcs) {
    const w = graph.kcs.get(id)?.weight ?? 1;
    num += kcMastery(state, id, now) * w;
    den += w;
  }
  return den ? num / den : 0;
}

/**
 * Chapter mastery. Each topic is weighted by its authored exam weight, and a
 * topic the learner has never opened contributes 0 rather than being skipped -
 * otherwise doing one easy topic would report the chapter as "complete".
 */
export function chapterMastery(graph, state, chapterId, now = Date.now()) {
  const ch = graph.chapters.find((c) => c.id === chapterId);
  if (!ch) return 0;
  let num = 0, den = 0;
  for (const t of ch.topics) {
    const w = t.weight ?? 1;
    num += topicMastery(graph, state, t.id, now) * w;
    den += w;
  }
  return den ? num / den : 0;
}

export function subjectMastery(graph, state, subject, now = Date.now()) {
  const chs = graph.chapters.filter((c) => c.subject === subject);
  if (!chs.length) return 0;
  return chs.reduce((s, c) => s + chapterMastery(graph, state, c.id, now), 0) / chs.length;
}

/* ------------------------------------------------------------------ */
/* unlocking                                                           */
/* ------------------------------------------------------------------ */

/**
 * Is this topic open?
 * A topic unlocks when every prerequisite *topic* has either been read or
 * reached UNLOCK_THRESHOLD mastery. Reading counts because a motivated
 * learner should never be hard-blocked - the gate is guidance, not a wall.
 */
export function topicUnlocked(graph, state, topicId, now = Date.now()) {
  const t = graph.topics.get(topicId);
  if (!t) return false;
  const prereqs = t.prereq || [];
  if (!prereqs.length) return true;
  return prereqs.every((pid) => {
    const rec = state.topics[pid];
    if (rec?.read) return true;
    return topicMastery(graph, state, pid, now) >= UNLOCK_THRESHOLD;
  });
}

export function lockReason(graph, state, topicId) {
  const t = graph.topics.get(topicId);
  if (!t) return null;
  const missing = (t.prereq || []).filter((pid) => {
    const rec = state.topics[pid];
    return !rec?.read && topicMastery(graph, state, pid) < UNLOCK_THRESHOLD;
  });
  if (!missing.length) return null;
  const names = missing.map((id) => graph.topics.get(id)?.title || id);
  return `Finish ${names.join(' and ')} first`;
}

/** Topics that are open but not yet mastered - the learner's working set. */
export function frontier(graph, state, { subject = null, now = Date.now() } = {}) {
  const out = [];
  for (const t of graph.topics.values()) {
    if (subject && t.subject !== subject) continue;
    if (!topicUnlocked(graph, state, t.id, now)) continue;
    const m = topicMastery(graph, state, t.id, now);
    if (m >= MASTERY_THRESHOLD) continue;
    out.push({ topic: t, mastery: m, read: Boolean(state.topics[t.id]?.read) });
  }
  // Unread-but-open first (new material), then weakest.
  return out.sort((a, b) => (a.read === b.read ? a.mastery - b.mastery : a.read ? 1 : -1));
}

/* ------------------------------------------------------------------ */
/* blame analysis                                                      */
/* ------------------------------------------------------------------ */

/**
 * Walk the prerequisite chain under `kcId` and return the weakest ancestor
 * that is below threshold. Depth-limited breadth-first so a deep chain can't
 * blame something six steps away that the learner has never seen.
 *
 * @returns {{id:string, name:string, mastery:number, depth:number}|null}
 */
export function weakestPrereq(graph, state, kcId, { maxDepth = 3, now = Date.now() } = {}) {
  const start = graph.kcs.get(kcId);
  if (!start) return null;

  let worst = null;
  const seen = new Set([kcId]);
  let layer = start.prereq.filter((p) => graph.kcs.has(p));
  let depth = 1;

  while (layer.length && depth <= maxDepth) {
    const next = [];
    for (const id of layer) {
      if (seen.has(id)) continue;
      seen.add(id);
      const m = kcMastery(state, id, now);
      if (m < MASTERY_THRESHOLD && (!worst || m < worst.mastery)) {
        worst = { id, name: graph.kcs.get(id).name, mastery: m, depth };
      }
      next.push(...(graph.kcs.get(id)?.prereq || []));
    }
    layer = next;
    depth++;
  }
  return worst;
}

/**
 * Given a failed question, produce a diagnosis the UI can show verbatim.
 * Prefers a weak prerequisite over the KC itself, because telling a learner
 * "you got the hard question wrong because the hard thing is hard" is useless.
 */
export function diagnose(graph, state, kcIds = [], now = Date.now()) {
  const direct = kcIds
    .map((id) => ({ id, name: graph.kcs.get(id)?.name || id, mastery: kcMastery(state, id, now) }))
    .sort((a, b) => a.mastery - b.mastery)[0];
  if (!direct) return null;

  const root = weakestPrereq(graph, state, direct.id, { now });
  if (root && root.mastery < direct.mastery - 0.12) {
    return {
      kind: 'prereq',
      focus: root,
      surface: direct,
      message: `The gap is upstream: **${root.name}** is at ${Math.round(root.mastery * 100)}%. Shore that up and this gets easy.`,
      topicId: graph.kcs.get(root.id)?.topicId || null
    };
  }
  return {
    kind: 'direct',
    focus: direct,
    surface: direct,
    message: `**${direct.name}** needs more reps - you are at ${Math.round(direct.mastery * 100)}%.`,
    topicId: graph.kcs.get(direct.id)?.topicId || null
  };
}

/* ------------------------------------------------------------------ */
/* layout for the skill-tree view                                      */
/* ------------------------------------------------------------------ */

/**
 * Assign (x, y) to every KC of a chapter: y by topological depth, x spread
 * within the layer. Deterministic, so the tree doesn't reshuffle on re-render.
 */
export function layoutChapter(graph, chapterId, { width = 760, layerGap = 92, pad = 46 } = {}) {
  const nodes = [...graph.kcs.values()].filter((n) => n.chapterId === chapterId);
  const byId = new Map(nodes.map((n) => [n.id, n]));

  const depth = new Map();
  const depthOf = (id, guard = 0) => {
    if (depth.has(id)) return depth.get(id);
    if (guard > 30) return 0;
    const n = byId.get(id);
    const ps = (n?.prereq || []).filter((p) => byId.has(p));
    const d = ps.length ? 1 + Math.max(...ps.map((p) => depthOf(p, guard + 1))) : 0;
    depth.set(id, d);
    return d;
  };
  nodes.forEach((n) => depthOf(n.id));

  const layers = new Map();
  for (const n of nodes) {
    const d = depth.get(n.id) ?? 0;
    if (!layers.has(d)) layers.set(d, []);
    layers.get(d).push(n);
  }

  const placed = [];
  const maxDepth = Math.max(...layers.keys(), 0);
  for (const [d, list] of [...layers].sort((a, b) => a[0] - b[0])) {
    const step = (width - pad * 2) / Math.max(1, list.length - 1 || 1);
    list.forEach((n, i) => {
      placed.push({
        ...n,
        x: list.length === 1 ? width / 2 : pad + i * step,
        y: pad + d * layerGap
      });
    });
  }
  return { nodes: placed, width, height: pad * 2 + maxDepth * layerGap };
}
