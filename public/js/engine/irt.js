/**
 * irt.js - Item Response Theory (3PL) ability estimation and item selection.
 *
 * BKT answers "does this learner know this concept?". IRT answers a different
 * question the platform also needs: "how hard a question can this learner
 * handle right now?" - a single continuous ability (theta) per subject that
 * drives adaptive question picking and the predicted-percentile estimate.
 *
 * Model (3PL, with c fixed by option count because JEE MCQs are guessable):
 *
 *   P(correct | theta) = c + (1 - c) / (1 + exp(-1.7 * a * (theta - b)))
 *
 *   a = discrimination, b = difficulty (same scale as theta), c = guess floor.
 *
 * Ability is re-estimated by EAP (expected a posteriori) over a fixed grid with
 * a N(0,1) prior. A grid is used rather than Newton-Raphson because it cannot
 * diverge on an all-correct or all-wrong response pattern, which is common in
 * the first few questions of a session.
 */

const D = 1.7; // logistic-to-normal scaling constant

/* -------- grid for EAP -------- */
const THETA_MIN = -3.5, THETA_MAX = 3.5, THETA_STEP = 0.1;
const GRID = [];
for (let t = THETA_MIN; t <= THETA_MAX + 1e-9; t += THETA_STEP) GRID.push(Number(t.toFixed(2)));
const PRIOR = GRID.map((t) => Math.exp(-0.5 * t * t));

/** Guess floor from the number of options (0 for numeric-entry items). */
export const guessFloor = (nOptions) => (nOptions && nOptions > 1 ? 1 / nOptions : 0);

/**
 * @param {number} theta
 * @param {{a?:number,b?:number,c?:number}} item
 */
export function pCorrect(theta, item) {
  const a = item.a ?? 1.0;
  const b = item.b ?? 0;
  const c = item.c ?? 0;
  return c + (1 - c) / (1 + Math.exp(-D * a * (theta - b)));
}

/** Fisher information - how much this item tells us about theta. */
export function information(theta, item) {
  const a = item.a ?? 1.0;
  const c = item.c ?? 0;
  const p = pCorrect(theta, item);
  if (p <= c + 1e-6 || p >= 1 - 1e-6) return 0;
  const q = 1 - p;
  return (D * D * a * a * q * Math.pow(p - c, 2)) / (p * Math.pow(1 - c, 2));
}

/**
 * EAP ability estimate from a response history.
 * @param {Array<{item:object, correct:boolean}>} responses
 * @param {{mean?:number, sd?:number}} [prior] centred prior (e.g. previous estimate)
 * @returns {{theta:number, se:number}}
 */
export function estimateTheta(responses, prior = {}) {
  const pm = prior.mean ?? 0;
  const psd = prior.sd ?? 1;

  const post = GRID.map((t, i) => {
    let lik = Math.exp(-0.5 * Math.pow((t - pm) / psd, 2)) * (PRIOR[i] > 0 ? 1 : 1);
    for (const r of responses) {
      const p = pCorrect(t, r.item);
      lik *= r.correct ? p : 1 - p;
      if (lik < 1e-300) { lik = 1e-300; break; }
    }
    return lik;
  });

  const sum = post.reduce((s, v) => s + v, 0) || 1;
  let mean = 0;
  for (let i = 0; i < GRID.length; i++) mean += GRID[i] * (post[i] / sum);
  let varr = 0;
  for (let i = 0; i < GRID.length; i++) varr += Math.pow(GRID[i] - mean, 2) * (post[i] / sum);

  return { theta: clampTheta(mean), se: Math.sqrt(Math.max(varr, 1e-4)) };
}

/**
 * Cheap online update when a full history isn't handy: one EAP step using the
 * current estimate as the prior. This is what the practice loop calls after
 * every answer.
 */
export function updateTheta(theta, se, item, correct) {
  const r = estimateTheta([{ item, correct }], { mean: theta, sd: Math.max(0.35, se || 0.9) });
  return { theta: r.theta, se: Math.max(0.22, r.se) };
}

export const clampTheta = (t) => Math.max(THETA_MIN, Math.min(THETA_MAX, t));

/**
 * Pick the next item by maximum information, with randomesque exposure control
 * so a learner repeating a set doesn't see the same question order every time.
 *
 * @param {number} theta
 * @param {Array} pool items with {a,b,c}
 * @param {{topK?:number, exclude?:Set, targetP?:number}} opts
 */
export function selectNext(theta, pool, opts = {}) {
  const { topK = 4, exclude = new Set(), targetP = null } = opts;
  const usable = pool.filter((it) => !exclude.has(it.id));
  if (!usable.length) return null;

  const scored = usable.map((it) => ({
    it,
    // When targetP is set we aim for a desired success rate instead of raw
    // information - the "desirable difficulty" band (~70-80%) keeps a learner
    // in flow rather than constantly at 50% (max-info's implicit target).
    score: targetP === null
      ? information(theta, it)
      : -Math.abs(pCorrect(theta, it) - targetP)
  })).sort((x, y) => y.score - x.score);

  const band = scored.slice(0, Math.min(topK, scored.length));
  return band[(Math.random() * band.length) | 0].it;
}

/**
 * Map theta to an approximate JEE Main percentile.
 * Calibrated so theta 0 ~ 50th percentile and theta 2 ~ 99th, matching the
 * heavy right-skew of the real distribution. Presented as an estimate only.
 */
export function thetaToPercentile(theta) {
  const z = clampTheta(theta);
  const pct = 100 * normCdf(z * 1.05);
  return Math.max(1, Math.min(99.9, Number(pct.toFixed(1))));
}

/** Abramowitz-Stegun 7.1.26 normal CDF. */
export function normCdf(x) {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp((-x * x) / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - p : p;
}

/** Convert an authored tier letter to a starting difficulty on the theta scale. */
export const TIER_B = { G: -0.9, M: 0.25, H: 1.35 };
export const TIER_A = { G: 0.85, M: 1.05, H: 1.25 };

/** Build IRT parameters for an authored question. */
export function itemParams(q) {
  return {
    id: q.id,
    a: q.a ?? TIER_A[q.tier] ?? 1,
    b: q.b ?? TIER_B[q.tier] ?? 0,
    c: q.c ?? guessFloor(q.options ? q.options.length : 0)
  };
}
