/**
 * audio.js - procedural sound.
 *
 * No .mp3/.wav assets ship with this app: every cue is synthesised with
 * WebAudio at call time. That keeps the offline cache tiny and means sounds
 * scale/pitch-shift with combo multipliers for free.
 *
 * Browsers block audio until a gesture, so the context is created lazily on
 * the first user interaction.
 */

import { get } from './store.js';

let ctx = null;
let master = null;
let unlocked = false;

function ensure() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0.22;
  master.connect(ctx.destination);
  return ctx;
}

export function unlock() {
  if (unlocked) return;
  const c = ensure();
  if (!c) return;
  if (c.state === 'suspended') c.resume();
  unlocked = true;
}

function enabled() {
  try { return get().settings.sound !== false; } catch { return true; }
}

/**
 * One synth voice.
 * @param {object} o
 * @param {number} o.f  start frequency (Hz)
 * @param {number} [o.f2] glide target
 * @param {number} o.d  duration (s)
 * @param {OscillatorType} [o.type]
 * @param {number} [o.g] peak gain
 * @param {number} [o.delay] start offset (s)
 */
function tone({ f, f2, d = 0.12, type = 'sine', g = 0.6, delay = 0, curve = 'exp' }) {
  const c = ensure();
  if (!c || !enabled()) return;
  if (c.state === 'suspended') c.resume();

  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(f, t0);
  if (f2 && f2 !== f) {
    if (curve === 'exp') osc.frequency.exponentialRampToValueAtTime(Math.max(1, f2), t0 + d);
    else osc.frequency.linearRampToValueAtTime(f2, t0 + d);
  }
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(g, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + d);

  osc.connect(gain); gain.connect(master);
  osc.start(t0);
  osc.stop(t0 + d + 0.02);
}

function noise({ d = 0.18, g = 0.35, hp = 800, delay = 0 }) {
  const c = ensure();
  if (!c || !enabled()) return;
  const len = Math.max(1, Math.floor(c.sampleRate * d));
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);

  const src = c.createBufferSource(); src.buffer = buf;
  const filt = c.createBiquadFilter(); filt.type = 'highpass'; filt.frequency.value = hp;
  const gain = c.createGain(); gain.gain.value = g;

  src.connect(filt); filt.connect(gain); gain.connect(master);
  src.start(c.currentTime + delay);
}

/* ---- named cues -------------------------------------------------- */

const N = (semi) => 440 * Math.pow(2, semi / 12);

export const sfx = {
  click:  () => tone({ f: 520, f2: 440, d: 0.05, type: 'triangle', g: 0.25 }),
  tick:   () => tone({ f: 1400, d: 0.025, type: 'square', g: 0.12 }),
  hover:  () => tone({ f: 900, d: 0.03, type: 'sine', g: 0.08 }),

  /** Rising major triad; `step` lets a combo raise the whole chord. */
  correct: (step = 0) => {
    [0, 4, 7].forEach((s, i) => tone({ f: N(s + step), d: 0.2, type: 'sine', g: 0.4, delay: i * 0.045 }));
    tone({ f: N(12 + step), d: 0.28, type: 'triangle', g: 0.22, delay: 0.13 });
  },

  wrong: () => {
    tone({ f: 200, f2: 110, d: 0.3, type: 'sawtooth', g: 0.28 });
    tone({ f: 150, f2: 90, d: 0.3, type: 'square', g: 0.14, delay: 0.02 });
  },

  levelUp: () => {
    [0, 4, 7, 12, 16, 19].forEach((s, i) =>
      tone({ f: N(s), d: 0.34, type: 'triangle', g: 0.34, delay: i * 0.075 }));
    noise({ d: 0.5, g: 0.1, hp: 2200, delay: 0.1 });
  },

  achievement: () => {
    [0, 7, 12, 19].forEach((s, i) => tone({ f: N(s + 12), d: 0.4, type: 'sine', g: 0.3, delay: i * 0.09 }));
  },

  coin:   () => { tone({ f: N(19), d: 0.07, type: 'square', g: 0.2 }); tone({ f: N(26), d: 0.14, type: 'square', g: 0.2, delay: 0.06 }); },
  whoosh: () => noise({ d: 0.26, g: 0.2, hp: 500 }),
  hit:    () => { tone({ f: 320, f2: 80, d: 0.16, type: 'sawtooth', g: 0.3 }); noise({ d: 0.12, g: 0.25, hp: 400 }); },
  shield: () => tone({ f: 700, f2: 1300, d: 0.22, type: 'sine', g: 0.25 }),
  bossDown: () => {
    [24, 19, 12, 7, 0, -5].forEach((s, i) => tone({ f: N(s), d: 0.35, type: 'sawtooth', g: 0.3, delay: i * 0.1 }));
    noise({ d: 0.9, g: 0.22, hp: 200, delay: 0.25 });
  },
  timeout: () => { tone({ f: 660, d: 0.12, type: 'square', g: 0.25 }); tone({ f: 660, d: 0.12, type: 'square', g: 0.25, delay: 0.2 }); tone({ f: 440, d: 0.3, type: 'square', g: 0.25, delay: 0.4 }); },
  pop:    () => tone({ f: 800, f2: 1600, d: 0.06, type: 'sine', g: 0.2 }),
  drop:   () => tone({ f: 380, f2: 240, d: 0.1, type: 'triangle', g: 0.22 }),
  unlock: () => { tone({ f: N(0), d: 0.2, type: 'sine', g: 0.3 }); tone({ f: N(7), d: 0.3, type: 'sine', g: 0.3, delay: 0.1 }); tone({ f: N(12), d: 0.4, type: 'triangle', g: 0.25, delay: 0.2 }); }
};

/** Arm the audio context on the first gesture anywhere in the app. */
export function installUnlockHandlers() {
  const fire = () => { unlock(); window.removeEventListener('pointerdown', fire); window.removeEventListener('keydown', fire); };
  window.addEventListener('pointerdown', fire, { once: true });
  window.addEventListener('keydown', fire, { once: true });
}

export function setVolume(v) {
  ensure();
  if (master) master.gain.value = Math.max(0, Math.min(1, v));
}
