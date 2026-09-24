/**
 * anim.js - the concept-animation player.
 *
 * Plays a scene from js/anim/scenes/ with a scrub bar and stepped narration.
 * The scrub bar is the point: an animation a learner cannot stop is a
 * demonstration, and an animation they can stop and step through is a lesson.
 *
 * Reduced motion is a first-class path, not a degradation: the scene renders
 * at its most informative frame and every narration step is listed as text,
 * so nothing is only available to people who can watch it move.
 */

import { h, clear } from '../../core/dom.js';
import { renderInline } from '../../core/mathlite.js';
import { sfx } from '../../core/audio.js';
import { get } from '../../core/store.js';
import { canvasLayer } from '../../game/kit.js';
import { loadScene } from '../../anim/registry.js';

const SPEEDS = [0.5, 1, 1.5];

function reducedMotion() {
  try {
    return get().settings.motion === 'reduced'
      || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch { return false; }
}

/**
 * @param {string} id scene id
 * @param {HTMLElement} host
 * @param {{subject?: string}} [opts]
 * @returns {{destroy(): void}}
 */
export async function mountAnimation(id, host, opts = {}) {
  let scene;
  try {
    scene = await loadScene(id);
  } catch (err) {
    console.error(`[anim] scene "${id}" failed to load`, err);
    host.appendChild(h('div.callout.callout--warn', null,
      h('div.callout__label', null, 'Animation unavailable'),
      h('div.small', null, 'This concept animation could not load. The lesson around it is unaffected.')));
    return { destroy() {} };
  }

  const still = reducedMotion();
  const duration = scene.duration || 6;
  const steps = scene.steps || [];

  /* ---------------- state ---------------- */
  let t = still ? (scene.stillAt ?? 1) : 0;
  let playing = !still;
  let speed = 1;
  let last = performance.now();
  let activeStep = -1;

  /* ---------------- chrome ---------------- */

  const stepText = h('div.anim__steptext');
  const dots = h('div.anim__dots', null,
    steps.map((_, i) => h('i', { dataset: { i: String(i) } })));

  const scrub = h('input.anim__scrub', {
    type: 'range', min: '0', max: '1000', value: String(Math.round(t * 1000)),
    'aria-label': 'Scrub the animation',
    onInput: (e) => {
      t = Number(e.target.value) / 1000;
      playing = false;
      paintPlay();
      view.redraw();
      syncStep(true);
    }
  });

  const playBtn = h('button.btn.btn--icon.btn--ghost', {
    'aria-label': 'Play or pause',
    onClick: () => { playing = !playing; if (t >= 1) t = 0; last = performance.now(); sfx.click(); paintPlay(); }
  }, playing ? '⏸' : '▶');

  const speedBtn = h('button.btn.btn--sm.btn--quiet.mono', {
    'aria-label': 'Playback speed',
    onClick: () => {
      speed = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length];
      speedBtn.textContent = `${speed}×`;
      sfx.tick();
    }
  }, '1×');

  const stage = h('div.anim__stage');

  const root = h('div.anim', { dataset: { hue: opts.subject || '' } },
    h('div.anim__head', null,
      h('span.anim__badge', null, 'Animation'),
      h('span.anim__title', null, scene.title),
      still ? h('span.tag', { style: { marginLeft: 'auto' } }, 'reduced motion') : null),
    scene.caption ? h('p.anim__caption', null, renderInline(scene.caption)) : null,
    stage,
    still ? null : h('div.anim__transport', null,
      playBtn,
      scrub,
      h('button.btn.btn--icon.btn--quiet', {
        'aria-label': 'Replay from the start',
        onClick: () => { t = 0; playing = true; last = performance.now(); paintPlay(); sfx.pop(); }
      }, '↺'),
      speedBtn),
    h('div.anim__narration', null, still ? staticSteps() : h('div', null, stepText, dots))
  );

  host.appendChild(root);

  function staticSteps() {
    return h('ol.anim__steplist', null,
      steps.map((s) => h('li', null, renderInline(s.text))));
  }

  function paintPlay() {
    playBtn.textContent = playing ? '⏸' : '▶';
  }

  /* ---------------- canvas ---------------- */

  const view = canvasLayer(stage, {
    height: scene.height || 260,
    animate: !still,
    draw(g, w, hgt) {
      if (playing && !still) {
        const now = performance.now();
        const dt = Math.min(0.06, (now - last) / 1000);
        last = now;
        t += (dt * speed) / duration;
        if (t >= 1) {
          if (scene.loop) t -= 1;
          else { t = 1; playing = false; paintPlay(); }
        }
        scrub.value = String(Math.round(t * 1000));
        syncStep(false);
      }
      try {
        scene.draw(g, w, hgt, t, { subject: opts.subject });
      } catch (err) {
        console.error(`[anim] "${id}" draw failed`, err);
        playing = false;
      }
    }
  });

  /* ---------------- narration ---------------- */

  function syncStep(force) {
    let idx = -1;
    for (let i = 0; i < steps.length; i++) if (t >= steps[i].at) idx = i;
    if (idx === activeStep && !force) return;
    activeStep = idx;

    clear(stepText);
    if (idx >= 0) stepText.appendChild(renderInline(steps[idx].text));
    [...dots.children].forEach((d, i) => {
      d.dataset.state = i < idx ? 'done' : i === idx ? 'cur' : '';
    });
  }

  if (!still) syncStep(true);
  else view.redraw();

  /* ---------------- autoplay when visible ---------------- */

  let io = null;
  if (!still && 'IntersectionObserver' in window) {
    // Do not burn a rAF loop on an animation nobody is looking at.
    io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { last = performance.now(); }
        else if (playing) { playing = false; paintPlay(); }
      }
    }, { threshold: 0.25 });
    io.observe(root);
  }

  return {
    root,
    destroy() {
      io?.disconnect();
      view.stop();
      root.remove();
    }
  };
}
