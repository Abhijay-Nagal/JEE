/**
 * anim/registry.js - lazy loader for concept animations.
 *
 * Written out explicitly, like the widget registry, so the browser and the
 * service-worker precache list can both see every URL statically.
 */

const LOADERS = {
  /* --- Chapter 1 retrofits: the ideas that were hardest to describe in prose --- */
  vernierPrinciple:        () => import('./scenes/vernierPrinciple.js'),
  errorTypes:              () => import('./scenes/errorTypes.js'),
  moleBridge:              () => import('./scenes/moleBridge.js'),
  deMorgan:                () => import('./scenes/deMorgan.js'),

  /* --- Physics 2: Kinematics --- */
  distanceDisplacement:    () => import('./scenes/distanceDisplacement.js'),
  slopeIsVelocity:         () => import('./scenes/slopeIsVelocity.js'),
  areaIsDisplacement:      () => import('./scenes/areaIsDisplacement.js'),
  freeFallSymmetry:        () => import('./scenes/freeFallSymmetry.js'),
  relativeVelocity:        () => import('./scenes/relativeVelocity.js'),
  projectileIndependence:  () => import('./scenes/projectileIndependence.js'),

  /* --- Chemistry 2: Atomic Structure --- */
  goldFoilScatter:         () => import('./scenes/goldFoilScatter.js'),
  photoelectric:           () => import('./scenes/photoelectric.js'),
  bohrTransitions:         () => import('./scenes/bohrTransitions.js'),
  deBroglieWave:           () => import('./scenes/deBroglieWave.js'),
  orbitalShapes:           () => import('./scenes/orbitalShapes.js'),
  aufbauFilling:           () => import('./scenes/aufbauFilling.js'),

  /* --- Mathematics 2: Complex Numbers & Quadratics --- */
  iotaCycle:               () => import('./scenes/iotaCycle.js'),
  argandPlane:             () => import('./scenes/argandPlane.js'),
  polarRotation:           () => import('./scenes/polarRotation.js'),
  rootsOfUnity:            () => import('./scenes/rootsOfUnity.js'),
  discriminantParabola:    () => import('./scenes/discriminantParabola.js'),
  sumProductRoots:         () => import('./scenes/sumProductRoots.js')
};

export const SCENE_IDS = Object.keys(LOADERS);
export const hasScene = (id) => Boolean(LOADERS[id]);

const cache = new Map();

export async function loadScene(id) {
  if (!LOADERS[id]) throw new Error(`Unknown animation scene "${id}"`);
  if (cache.has(id)) return cache.get(id);
  const mod = await LOADERS[id]();
  cache.set(id, mod.default);
  return mod.default;
}
