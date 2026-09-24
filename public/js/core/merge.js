/**
 * merge.js - reconciling two saves of the same learner.
 *
 * Sync is optional in this app, which means the interesting case is not "push
 * the newest blob" but "this phone and this laptop both have real work in them".
 * Last-write-wins would quietly delete a revision session, so nothing here
 * overwrites a whole save. Every field is merged by a rule that suits what it
 * actually represents:
 *
 *   monotonic counters   take the larger    (you cannot un-earn XP)
 *   evidence-bearing     take the richer    (more attempts = better estimate)
 *   booleans of progress OR together        (read stays read)
 *   time-sensitive state take the newer     (today's quests, current streak)
 *   append-only logs     union and re-cap
 *
 * The function is pure and DOM-free so it can be tested in Node, which matters:
 * a merge bug loses a learner's history silently and there is no undo.
 *
 * `settings` is deliberately NOT synced. Theme, motion and font scale are
 * properties of a device, not of a person - a phone may want reduced motion
 * while a desktop does not.
 */

const max = (a, b) => (Number(a) || 0) > (Number(b) || 0) ? (Number(a) || 0) : (Number(b) || 0);
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);

/** Earliest non-zero timestamp; 0 means "never happened". */
function earliest(a, b) {
  const x = Number(a) || 0, y = Number(b) || 0;
  if (!x) return y;
  if (!y) return x;
  return Math.min(x, y);
}

/**
 * Merge every key of two id-keyed maps with `pick`.
 * Keys present in only one side survive untouched - that is the whole point.
 */
function mergeMap(a = {}, b = {}, pick) {
  const out = {};
  for (const k of new Set([...Object.keys(a || {}), ...Object.keys(b || {})])) {
    const l = a?.[k], r = b?.[k];
    if (l === undefined) out[k] = r;
    else if (r === undefined) out[k] = l;
    else out[k] = pick(l, r, k);
  }
  return out;
}

/**
 * Take whichever record carries more evidence, whole. Records like a KC's SRS
 * schedule are internally consistent - interleaving fields from two devices
 * would produce a state neither device ever had.
 */
const richer = (field) => (l, r) => {
  if (!isObj(l)) return r;
  if (!isObj(r)) return l;
  const lv = Number(l[field]) || 0, rv = Number(r[field]) || 0;
  if (lv !== rv) return lv > rv ? l : r;
  return (Number(l.lastAt) || 0) >= (Number(r.lastAt) || 0) ? l : r;
};

/**
 * Union two append-only logs, dropping duplicates and re-applying the cap.
 * Entries are identified by timestamp plus kind, which is enough: the app
 * never writes two log entries of the same kind in the same millisecond.
 */
function mergeLog(a = [], b = [], cap) {
  const seen = new Map();
  for (const e of [...(a || []), ...(b || [])]) {
    if (!e || typeof e !== 'object') continue;
    const key = `${e.t || 0}:${e.kind || e.type || ''}:${e.id || ''}`;
    if (!seen.has(key)) seen.set(key, e);
  }
  const all = [...seen.values()].sort((x, y) => (x.t || 0) - (y.t || 0));
  return all.length > cap ? all.slice(all.length - cap) : all;
}

/**
 * The newer save wins each profile field - but only where it actually has a
 * value. A device that signed in without ever being onboarded has `name: ''`,
 * and a plain spread would let that blank erase the name set on the other
 * device. An unset field is missing information, not an edit.
 */
function mergeProfile(newerP = {}, olderP = {}, onboarded) {
  const blank = (v) => v === undefined || v === null || v === '';
  const out = { ...olderP };
  for (const [k, v] of Object.entries(newerP || {})) {
    if (!blank(v)) out[k] = v;
    else if (!(k in out)) out[k] = v;
  }
  out.onboarded = onboarded;
  return out;
}

/**
 * Merge two saves into one. Neither input is mutated.
 *
 * @param {object} local  the save on this device
 * @param {object} remote the save pulled from the server
 * @returns {object} a new state, safe to persist and to push back
 */
export function mergeState(local, remote) {
  if (!remote || typeof remote !== 'object') return local;
  if (!local || typeof local !== 'object') return remote;

  // Which side is "newer" decides only genuinely time-sensitive fields.
  const lNew = (Number(local.updatedAt) || 0) >= (Number(remote.updatedAt) || 0);
  const newer = lNew ? local : remote;
  const older = lNew ? remote : local;

  return {
    schema: max(local.schema, remote.schema),
    createdAt: earliest(local.createdAt, remote.createdAt),
    updatedAt: max(local.updatedAt, remote.updatedAt),

    // Identity travels with the person; onboarding never un-completes.
    profile: mergeProfile(newer.profile, older.profile,
      Boolean(local.profile?.onboarded || remote.profile?.onboarded)),

    // Not synced - see the note at the top of this file.
    settings: { ...local.settings },

    xp: max(local.xp, remote.xp),
    coins: max(local.coins, remote.coins),
    gems: max(local.gems, remote.gems),

    streak: {
      // The count belongs to whichever device studied most recently; the best
      // ever is a record and can only go up.
      ...newer.streak,
      best: max(local.streak?.best, remote.streak?.best),
      freezes: max(local.streak?.freezes, remote.streak?.freezes)
    },

    // An achievement is a fact: keep the first time it happened.
    achievements: mergeMap(local.achievements, remote.achievements,
      (l, r) => earliest(l, r) || l || r),

    // Quests are scoped to a single day, so the newer set is the real one.
    quests: { ...newer.quests },

    // Consumables follow the newer save, so a spend on this phone is not
    // undone by a stale copy on the laptop.
    inventory: { ...newer.inventory },

    cosmetics: {
      owned: [...new Set([...(local.cosmetics?.owned || []), ...(remote.cosmetics?.owned || [])])],
      active: newer.cosmetics?.active || local.cosmetics?.active
    },

    // Learning state: whichever side saw more of the item knows more about it.
    kc: mergeMap(local.kc, remote.kc, richer('seen')),
    items: mergeMap(local.items, remote.items, richer('seen')),

    topics: mergeMap(local.topics, remote.topics, (l, r) => ({
      ...l, ...r,
      read: Boolean(l.read || r.read),
      readAt: earliest(l.readAt, r.readAt),
      gamePlays: max(l.gamePlays, r.gamePlays),
      gameBest: max(l.gameBest, r.gameBest),
      gmh: mergeMap(l.gmh, r.gmh, (a, b) => ({ a: max(a.a, b.a), c: max(a.c, b.c) })),
      done: Boolean(l.done || r.done),
      doneAt: earliest(l.doneAt, r.doneAt),
      notes: (r.notes || '').length >= (l.notes || '').length ? r.notes : l.notes
    })),

    chapters: mergeMap(local.chapters, remote.chapters, (l, r) => ({
      bossWins: max(l.bossWins, r.bossWins),
      bossBest: max(l.bossBest, r.bossBest),
      done: Boolean(l.done || r.done),
      doneAt: earliest(l.doneAt, r.doneAt)
    })),

    // theta is an estimate, not a total - averaging two would be meaningless.
    // The estimate built from more answers wins.
    ability: mergeMap(local.ability, remote.ability, (l, r) => {
      const ln = isObj(l) ? (Number(l.n) || 0) : 0;
      const rn = isObj(r) ? (Number(r.n) || 0) : 0;
      return rn > ln ? r : l;
    }),

    // Beta posteriors are running counts, so the larger has seen more.
    bandit: mergeMap(local.bandit, remote.bandit,
      (l, r) => ({ a: max(l.a, r.a), b: max(l.b, r.b) })),

    tierCorrect: {
      G: max(local.tierCorrect?.G, remote.tierCorrect?.G),
      M: max(local.tierCorrect?.M, remote.tierCorrect?.M),
      H: max(local.tierCorrect?.H, remote.tierCorrect?.H)
    },

    reviewCount: max(local.reviewCount, remote.reviewCount),
    printCount: max(local.printCount, remote.printCount),
    graphViews: max(local.graphViews, remote.graphViews),
    gamePlays: max(local.gamePlays, remote.gamePlays),
    bossFights: max(local.bossFights, remote.bossFights),
    bestCombo: max(local.bestCombo, remote.bestCombo),

    // Per-day stats take the larger of each field rather than summing, so
    // syncing the same day twice cannot inflate the numbers.
    days: mergeMap(local.days, remote.days, (l, r) => ({
      min: max(l.min, r.min),
      xp: max(l.xp, r.xp),
      q: max(l.q, r.q),
      correct: max(l.correct, r.correct),
      sessions: max(l.sessions, r.sessions)
    })),

    sessions: mergeLog(local.sessions, remote.sessions, 60),
    log: mergeLog(local.log, remote.log, 400),

    lastRoute: newer.lastRoute || local.lastRoute || '#/'
  };
}

export default mergeState;
