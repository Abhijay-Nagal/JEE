/**
 * bkt.js - Bayesian Knowledge Tracing.
 *
 * Each knowledge component (KC) is a hidden binary variable "the learner knows
 * this". Every graded answer is a noisy observation of it, with two noise
 * channels:
 *   slip  - knows it but answers wrong
 *   guess - doesn't know it but answers right (high for 4-option MCQ)
 *
 * After observing an answer we compute the posterior, then apply the learning
 * transition to get the new prior. Mastery is the number the whole UI shows as
 * the progress ring.
 *
 * Extension over textbook BKT: mastery decays between sessions using an
 * exponential forgetting curve, so a topic drilled in March is not still
 * reported as "mastered" in September without a review.
 */

/** Sensible defaults for 4-option MCQ items. */
export const DEFAULT_PARAMS = {
  pInit: 0.12,    // prior mastery before any evidence
  pTransit: 0.18, // chance of learning from one practice opportunity
  pSlip: 0.10,
  pGuess: 0.22,
  decayHalfLifeDays: 21  // mastery half-life toward the guess floor
};

/** Difficulty tiers carry different slip/guess characteristics. */
const TIER_PARAMS = {
  G: { pSlip: 0.08, pGuess: 0.28, pTransit: 0.22 },
  M: { pSlip: 0.11, pGuess: 0.22, pTransit: 0.17 },
  H: { pSlip: 0.16, pGuess: 0.14, pTransit: 0.13 }
};

const clamp01 = (x) => Math.max(0.001, Math.min(0.999, x));

export function paramsFor(kcMeta = {}, tier = 'M') {
  return { ...DEFAULT_PARAMS, ...(TIER_PARAMS[tier] || {}), ...(kcMeta.bkt || {}) };
}

/**
 * Posterior mastery given one observation.
 * @param {number} p prior P(knows)
 * @param {boolean} correct
 * @param {{pSlip:number,pGuess:number}} prm
 */
export function posterior(p, correct, prm) {
  const { pSlip: S, pGuess: G } = prm;
  const num = correct ? p * (1 - S) : p * S;
  const den = correct
    ? p * (1 - S) + (1 - p) * G
    : p * S + (1 - p) * (1 - G);
  return clamp01(den === 0 ? p : num / den);
}

/** Apply the learning transition: unknown -> known with probability T. */
export function transition(p, prm) {
  return clamp01(p + (1 - p) * prm.pTransit);
}

/**
 * Full BKT step.
 * @returns {{p:number, prior:number, gain:number, predicted:number}}
 */
export function step(prior, correct, prm = DEFAULT_PARAMS) {
  const predicted = predict(prior, prm);
  const post = posterior(prior, correct, prm);
  const p = transition(post, prm);
  return { p, prior, gain: p - prior, predicted, surprise: Math.abs((correct ? 1 : 0) - predicted) };
}

/** P(next answer correct) under the current mastery estimate. */
export function predict(p, prm = DEFAULT_PARAMS) {
  return clamp01(p * (1 - prm.pSlip) + (1 - p) * prm.pGuess);
}

/**
 * Mastery after `days` of no practice.
 * Decays toward the guess floor, never below it: a learner who has forgotten
 * everything still gets MCQ questions right at chance.
 */
export function decay(p, days, prm = DEFAULT_PARAMS) {
  if (!days || days <= 0) return p;
  const floor = prm.pGuess * 0.5;
  const k = Math.pow(0.5, days / (prm.decayHalfLifeDays || 21));
  return clamp01(floor + (p - floor) * k);
}

/**
 * Time-adjusted mastery for a stored KC record.
 * @param {{p:number,lastAt:number}} rec
 */
export function effectiveMastery(rec, now = Date.now(), prm = DEFAULT_PARAMS) {
  if (!rec) return prm.pInit;
  if (!rec.lastAt) return rec.p;
  const days = (now - rec.lastAt) / 86400000;
  return decay(rec.p, days, prm);
}

/** Bucket used for colour-coding across the UI. */
export function masteryBand(p) {
  if (p >= 0.92) return 'gold';
  if (p >= 0.80) return 'mastered';
  if (p >= 0.55) return 'strong';
  if (p >= 0.30) return 'learning';
  return 'weak';
}

export const MASTERY_THRESHOLD = 0.80;

/**
 * Expected number of further correct answers needed to reach the mastery
 * threshold. Drives the "2 more to master" hints on topic cards.
 */
export function attemptsToMastery(p, prm = DEFAULT_PARAMS, target = MASTERY_THRESHOLD) {
  let cur = p, n = 0;
  while (cur < target && n < 25) {
    cur = transition(posterior(cur, true, prm), prm);
    n++;
  }
  return n;
}
