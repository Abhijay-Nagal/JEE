/**
 * elo.js - learner-vs-item rating.
 *
 * IRT gives a statistically clean ability estimate but needs a stable item
 * bank. Elo is the pragmatic companion: it updates instantly, it is robust to
 * a small bank, and crucially it also *re-rates the questions* from real
 * answer data. Over time an authored "Hard" item that everyone gets right
 * drifts down and stops being offered as a challenge.
 *
 * Both ratings live on the familiar 1200-centred scale; `toTheta` converts to
 * the IRT logit scale when the two systems need to agree.
 */

export const START = 1200;

/** Expected score for a player rated `r` against difficulty `d`. */
export function expected(r, d) {
  return 1 / (1 + Math.pow(10, (d - r) / 400));
}

/**
 * K-factor: large while an estimate is young, small once it has settled.
 * Mirrors FIDE's provisional-rating idea.
 */
export function kFactor(n, { base = 32, floor = 12 } = {}) {
  if (n < 8) return base * 1.6;
  if (n < 20) return base;
  if (n < 50) return base * 0.66;
  return floor;
}

/**
 * Update both sides after one answer.
 * @param {{rating:number, n:number}} learner
 * @param {{rating:number, n:number}} item
 * @param {boolean} correct
 * @param {{itemK?:number}} [opts] item ratings move slower than learners'
 */
export function play(learner, item, correct, opts = {}) {
  const exp = expected(learner.rating, item.rating);
  const score = correct ? 1 : 0;

  const kL = kFactor(learner.n ?? 0);
  const kI = opts.itemK ?? kFactor(item.n ?? 0, { base: 10, floor: 3 });

  return {
    learner: {
      rating: Math.round(learner.rating + kL * (score - exp)),
      n: (learner.n ?? 0) + 1
    },
    item: {
      rating: Math.round(item.rating + kI * (exp - score)),
      n: (item.n ?? 0) + 1
    },
    expected: exp,
    surprise: Math.abs(score - exp)
  };
}

/** Elo rating -> IRT theta (400 Elo points ~= 1.1 logits). */
export const toTheta = (rating) => (rating - START) / 360;
export const fromTheta = (theta) => Math.round(START + theta * 360);

/** Human-facing band for a rating, used on the profile screen. */
export function band(rating) {
  if (rating < 1000) return { name: 'Foundation', hue: 'var(--ink-3)' };
  if (rating < 1150) return { name: 'Developing', hue: 'var(--info)' };
  if (rating < 1300) return { name: 'Main-ready', hue: 'var(--ok)' };
  if (rating < 1450) return { name: 'Advanced-track', hue: 'var(--warn)' };
  return { name: 'Top percentile', hue: 'var(--accent)' };
}
