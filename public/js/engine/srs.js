/**
 * srs.js - spaced repetition scheduler.
 *
 * SM-2 supplies the interval ladder; on top of it we track *retrievability*
 * from the exponential forgetting curve so the review queue can be ordered by
 * "closest to being forgotten" instead of merely "oldest due date". That
 * matters here because a JEE learner often clears only part of a backlog, and
 * the part they clear should be the part about to decay.
 *
 *   R(t) = exp(-t / S)      S = stability (days), t = days since review
 *
 * Reviews are scheduled at R ~= 0.90, which is the retention target that
 * minimises total reviews for a fixed retention in FSRS-style models.
 */

const DAY = 86400000;
export const TARGET_RETENTION = 0.90;

/* ------------------------------------------------------------------ */
/* grading                                                             */
/* ------------------------------------------------------------------ */

/**
 * Turn a graded attempt into an SM-2 quality score 0..5.
 * Speed and hint use matter: a correct answer that needed a hint and 90s is
 * weaker evidence than an instant unaided one.
 *
 * @param {object} o
 * @param {boolean} o.correct
 * @param {number} [o.ms] response time
 * @param {number} [o.expectedMs] par time for the item
 * @param {boolean} [o.usedHint]
 * @param {number} [o.attempts] attempts within this sitting
 */
export function quality({ correct, ms = 0, expectedMs = 60000, usedHint = false, attempts = 1 }) {
  if (!correct) {
    // 0 = blackout, 1 = wrong but familiar, 2 = wrong, nearly had it
    if (attempts > 1) return 1;
    return ms > expectedMs * 0.5 ? 2 : 0;
  }
  let q = 5;
  const ratio = expectedMs > 0 ? ms / expectedMs : 1;
  if (ratio > 1.6) q -= 1;
  if (ratio > 2.6) q -= 1;
  if (usedHint) q -= 1;
  if (attempts > 1) q -= 1;
  return Math.max(3, Math.min(5, q));
}

/* ------------------------------------------------------------------ */
/* scheduling                                                          */
/* ------------------------------------------------------------------ */

/**
 * Advance an SM-2 record.
 * @param {{ease:number, ivl:number, reps:number, lapses:number, due:number}} rec
 * @param {number} q quality 0..5
 * @param {number} [now]
 * @returns the same record, mutated
 */
export function schedule(rec, q, now = Date.now()) {
  rec.ease ??= 2.5;
  rec.ivl ??= 0;
  rec.reps ??= 0;
  rec.lapses ??= 0;

  if (q < 3) {
    // Lapse: back to the start of the ladder, and the card gets harder.
    rec.reps = 0;
    rec.lapses += 1;
    rec.ivl = rec.lapses > 2 ? 1 : 0.5;     // half a day for a first slip
    rec.ease = clampEase(rec.ease - 0.20);
  } else {
    rec.reps += 1;
    if (rec.reps === 1) rec.ivl = 1;
    else if (rec.reps === 2) rec.ivl = 4;
    else rec.ivl = Math.round(rec.ivl * rec.ease * 10) / 10;

    // Classic SM-2 ease adjustment.
    rec.ease = clampEase(rec.ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
    // Hard cap: JEE is a 1-2 year horizon, nothing should vanish for a year.
    rec.ivl = Math.min(rec.ivl, 180);
  }

  rec.ivl = fuzz(rec.ivl);
  rec.due = now + rec.ivl * DAY;
  rec.lastAt = now;
  rec.stability = stabilityFor(rec.ivl);
  return rec;
}

const clampEase = (e) => Math.max(1.3, Math.min(3.2, Number(e.toFixed(3))));

/** +/-8% jitter stops a big first session from creating a review avalanche. */
function fuzz(ivl) {
  if (ivl <= 1) return ivl;
  const f = 1 + (Math.random() - 0.5) * 0.16;
  return Math.max(1, Math.round(ivl * f * 10) / 10);
}

/** Stability implied by scheduling at the target retention. */
function stabilityFor(ivl) {
  return Math.max(0.2, ivl / -Math.log(TARGET_RETENTION));
}

/* ------------------------------------------------------------------ */
/* queue                                                               */
/* ------------------------------------------------------------------ */

/** Probability the learner can still recall this right now. */
export function retrievability(rec, now = Date.now()) {
  if (!rec || !rec.lastAt || !rec.ivl) return 0;
  const t = (now - rec.lastAt) / DAY;
  const S = rec.stability || stabilityFor(rec.ivl);
  return Math.exp(-t / S);
}

export function isDue(rec, now = Date.now()) {
  return Boolean(rec && rec.due && rec.due <= now);
}

/** Days overdue (negative = not yet due). */
export function overdueDays(rec, now = Date.now()) {
  if (!rec || !rec.due) return 0;
  return (now - rec.due) / DAY;
}

/**
 * Order a set of KC records for review.
 * Priority = urgency (how far past target retention) x importance (exam weight).
 *
 * @param {Array<{id:string, rec:object, weight?:number}>} entries
 */
export function buildQueue(entries, { now = Date.now(), limit = 40 } = {}) {
  return entries
    .map((e) => {
      const r = retrievability(e.rec, now);
      const due = isDue(e.rec, now);
      const od = overdueDays(e.rec, now);
      return {
        ...e,
        retrievability: r,
        due,
        overdue: od,
        // Lower retrievability => higher priority. Overdue items get a boost
        // that saturates, so a card 60 days late doesn't monopolise the queue.
        priority: (TARGET_RETENTION - r) * (e.weight ?? 1) * (1 + Math.min(1.5, Math.max(0, od) / 7))
      };
    })
    .filter((e) => e.due || e.retrievability < TARGET_RETENTION)
    .sort((a, b) => b.priority - a.priority)
    .slice(0, limit);
}

/** How many cards fall due in the next `days` days - powers the forecast chart. */
export function forecast(entries, days = 14, now = Date.now()) {
  const buckets = new Array(days).fill(0);
  for (const e of entries) {
    if (!e.rec?.due) continue;
    const d = Math.floor((e.rec.due - now) / DAY);
    if (d < 0) buckets[0] += 1;
    else if (d < days) buckets[d] += 1;
  }
  return buckets;
}

export function humanInterval(ivl) {
  if (!ivl) return 'new';
  if (ivl < 1) return `${Math.round(ivl * 24)}h`;
  if (ivl < 30) return `${Math.round(ivl)}d`;
  if (ivl < 365) return `${(ivl / 30).toFixed(1)}mo`;
  return `${(ivl / 365).toFixed(1)}y`;
}
