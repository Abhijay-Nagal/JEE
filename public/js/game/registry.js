/**
 * registry.js - lazy widget loader.
 *
 * Each simulation is its own module and is only fetched when a learner opens
 * that topic. The import map is written out explicitly rather than built from
 * a template string so the browser (and the service worker's precache list)
 * can see every URL statically.
 */

const LOADERS = {
  // Physics
  unitForge:         () => import('./widgets/unitForge.js'),
  conversionCascade: () => import('./widgets/conversionCascade.js'),
  dimensionBalance:  () => import('./widgets/dimensionBalance.js'),
  rayleighForge:     () => import('./widgets/rayleighForge.js'),
  sigFigSniper:      () => import('./widgets/sigFigSniper.js'),
  errorLab:          () => import('./widgets/errorLab.js'),
  propagationForge:  () => import('./widgets/propagationForge.js'),
  vernierBench:      () => import('./widgets/vernierBench.js'),

  // Physics 2 - Kinematics
  pathTracer:        () => import('./widgets/pathTracer.js'),
  motionProbe:       () => import('./widgets/motionProbe.js'),
  suvatSolver:       () => import('./widgets/suvatSolver.js'),
  dropTower:         () => import('./widgets/dropTower.js'),
  relativeLab:       () => import('./widgets/relativeLab.js'),
  projectileRange:   () => import('./widgets/projectileRange.js'),

  // Chemistry
  lawLab:            () => import('./widgets/lawLab.js'),
  isotopeMixer:      () => import('./widgets/isotopeMixer.js'),
  moleMachine:       () => import('./widgets/moleMachine.js'),
  formulaDetective:  () => import('./widgets/formulaDetective.js'),
  reactionFactory:   () => import('./widgets/reactionFactory.js'),
  solutionMixer:     () => import('./widgets/solutionMixer.js'),

  // Chemistry 2 - Atomic Structure
  rayTube:           () => import('./widgets/rayTube.js'),
  spectrumLab:       () => import('./widgets/spectrumLab.js'),
  bohrOrbits:        () => import('./widgets/bohrOrbits.js'),
  deBroglieLab:      () => import('./widgets/deBroglieLab.js'),
  quantumPicker:     () => import('./widgets/quantumPicker.js'),
  configBuilder:     () => import('./widgets/configBuilder.js'),

  // Mathematics
  setBuilder:        () => import('./widgets/setBuilder.js'),
  vennLab:           () => import('./widgets/vennLab.js'),
  countingLab:       () => import('./widgets/countingLab.js'),
  relationGrid:      () => import('./widgets/relationGrid.js'),
  relationMatrix:    () => import('./widgets/relationMatrix.js'),
  functionMachine:   () => import('./widgets/functionMachine.js'),
  pipelineLab:       () => import('./widgets/pipelineLab.js'),
  grapher:           () => import('./widgets/grapher.js'),

  // Mathematics 2 - Complex Numbers & Quadratics
  iotaEngine:        () => import('./widgets/iotaEngine.js'),
  argandPlotter:     () => import('./widgets/argandPlotter.js'),
  rootWheel:         () => import('./widgets/rootWheel.js'),
  discriminantLab:   () => import('./widgets/discriminantLab.js'),
  rootForge:         () => import('./widgets/rootForge.js'),
  signChart:         () => import('./widgets/signChart.js')
};

export const WIDGET_IDS = Object.keys(LOADERS);
export const hasWidget = (id) => Boolean(LOADERS[id]);

const cache = new Map();

/**
 * @param {string} id
 * @returns {Promise<{id:string, mount:Function}>}
 */
export async function loadWidget(id) {
  if (!LOADERS[id]) throw new Error(`Unknown widget "${id}"`);
  if (cache.has(id)) return cache.get(id);
  const mod = await LOADERS[id]();
  const widget = mod.default;
  cache.set(id, widget);
  return widget;
}

/**
 * Mount a widget into `host`, returning a handle with destroy().
 * Failures are contained: a broken simulation must never take down the lesson
 * around it, so the error is rendered in place.
 */
export async function mountWidget(id, host, ctx) {
  try {
    const widget = await loadWidget(id);
    return widget.mount(host, ctx);
  } catch (err) {
    console.error(`[widget] "${id}" failed to mount`, err);
    host.innerHTML = '';
    const box = document.createElement('div');
    box.className = 'card';
    box.innerHTML = `<h3>Simulation unavailable</h3>
      <p class="muted small">The interactive for this topic could not start. The lesson and questions are unaffected.</p>
      <pre class="tiny mono" style="white-space:pre-wrap;color:var(--bad)"></pre>`;
    box.querySelector('pre').textContent = String(err && err.message || err);
    host.appendChild(box);
    return { destroy() {} };
  }
}
