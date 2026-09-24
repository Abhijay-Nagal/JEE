/**
 * bandit.js - Thompson sampling over activity types.
 *
 * When several things are equally "due" (read a new topic, play the sim,
 * drill GMH questions, clear reviews, fight the boss), there is no ground
 * truth about which one helps *this* learner most. So the platform treats it
 * as a multi-armed bandit and learns it.
 *
 * Each arm keeps a Beta(a, b) posterior over "did this activity produce a
 * learning gain?". Thompson sampling draws one value per arm and picks the
 * max, which explores early and exploits once a preference is clear - without
 * the tuning knob that epsilon-greedy needs.
 *
 * Reward signal (0..1) = normalised mastery gain per minute, so an activity
 * that is fun but teaches nothing decays on its own.
 */

export const ARMS = ['lesson', 'sim', 'drill', 'review', 'boss'];

/** Beta posterior with a mildly optimistic prior so every arm is tried. */
export function armRec(store, id) {
  store[id] ||= { a: 2, b: 1, n: 0, reward: 0 };
  return store[id];
}

/* ---- sampling -------------------------------------------------------- */

/** Marsaglia-Tsang gamma sampler (shape >= 1 via boost for shape < 1). */
function gammaSample(shape) {
  if (shape < 1) return gammaSample(shape + 1) * Math.pow(Math.random(), 1 / shape);
  const d = shape - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  for (;;) {
    let x, v;
    do { x = gaussian(); v = 1 + c * x; } while (v <= 0);
    v = v * v * v;
    const u = Math.random();
    if (u < 1 - 0.0331 * x * x * x * x) return d * v;
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
  }
}

/** Box-Muller standard normal. */
export function gaussian() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function betaSample(a, b) {
  const x = gammaSample(a);
  const y = gammaSample(b);
  return x / (x + y);
}

/* ---- the bandit ------------------------------------------------------ */

/**
 * Choose an arm.
 * @param {object} store  state.bandit
 * @param {string[]} available arms that make sense right now
 * @param {object} [bias] multiplicative prior nudges, e.g. {review: 1.6}
 */
export function choose(store, available = ARMS, bias = {}) {
  let best = null, bestDraw = -Infinity;
  for (const id of available) {
    const r = armRec(store, id);
    const draw = betaSample(Math.max(0.05, r.a), Math.max(0.05, r.b)) * (bias[id] ?? 1);
    if (draw > bestDraw) { bestDraw = draw; best = id; }
  }
  return best ?? available[0] ?? 'lesson';
}

/**
 * Record the outcome of an activity.
 * @param {object} store
 * @param {string} id arm
 * @param {number} reward 0..1
 */
export function reward(store, id, r) {
  const rec = armRec(store, id);
  const x = Math.max(0, Math.min(1, r));
  rec.a += x;
  rec.b += 1 - x;
  rec.n += 1;
  rec.reward += x;

  // Slow decay keeps the bandit responsive months later (non-stationary learner).
  if (rec.a + rec.b > 90) { rec.a *= 0.9; rec.b *= 0.9; }
  return rec;
}

/**
 * Turn a finished activity into a reward.
 * Mastery gained per minute, squashed into 0..1. 0.05 mastery/min is treated
 * as an excellent session.
 */
export function rewardFromSession({ masteryGain = 0, minutes = 1, accuracy = null }) {
  const perMin = masteryGain / Math.max(0.5, minutes);
  let r = 1 - Math.exp(-perMin / 0.05);
  // A session with no mastery movement but high accuracy still has value
  // (consolidation), so it earns a small floor rather than punishing the arm.
  if (accuracy !== null && masteryGain < 0.01) r = Math.max(r, accuracy * 0.35);
  return Math.max(0, Math.min(1, r));
}

/** Posterior mean, for the "what works for you" panel on the progress screen. */
export function armStats(store) {
  return ARMS.map((id) => {
    const r = armRec(store, id);
    const mean = r.a / (r.a + r.b);
    const sd = Math.sqrt((r.a * r.b) / (Math.pow(r.a + r.b, 2) * (r.a + r.b + 1)));
    return { id, mean, sd, n: r.n };
  }).sort((x, y) => y.mean - x.mean);
}

export const ARM_LABEL = {
  lesson: 'Reading the concept',
  sim: 'Playing the simulation',
  drill: 'GMH question drills',
  review: 'Spaced review',
  boss: 'Boss battles'
};
