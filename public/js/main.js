/**
 * main.js - bootstrap.
 *
 * Load the save, build the knowledge graph once, raise the shell, register
 * routes, start the clock that logs study minutes, and register the service
 * worker so the whole thing keeps working with the network off.
 */

import { load, get, update, logDay, touchStreak } from './core/store.js';
import { on, EV } from './core/bus.js';
import { installUnlockHandlers } from './core/audio.js';
import { register, setNotFound, start as startRouter, go } from './core/router.js';

import { CHAPTERS } from '../data/registry.js';
import { buildGraph } from './engine/knowledgeGraph.js';
import { installQuestTracking } from './engine/quests.js';
import { checkAchievements } from './engine/achievements.js';

import { buildShell, applySettings, refreshStats, setCrumbs, setView } from './ui/shell.js';
import { installToasts } from './ui/components/overlays.js';

import { dashboardView } from './ui/views/dashboard.js';
import { subjectView, chapterView, notFound } from './ui/views/browse.js';
import { topicView, playView, disposeWidget } from './ui/views/topic.js';
import { drillView, reviewView, practiceView, disposeQuiz } from './ui/views/quizzes.js';
import { bossView, disposeBoss } from './ui/views/boss.js';
import { mockView, disposeMock } from './ui/views/mock.js';
import { progressView, profileView } from './ui/views/progress.js';
import { printView } from './ui/views/print.js';
import { settingsView, maybeOnboard } from './ui/views/settings.js';

/* ------------------------------------------------------------------ */

const state = load();
applySettings();

const graph = buildGraph(CHAPTERS);

buildShell(graph);
installToasts();
installQuestTracking();
installUnlockHandlers();

/* ---- routes ---------------------------------------------------- */

/** Every navigation tears down whatever was animating or timing. */
function teardown() {
  disposeWidget();
  disposeQuiz();
  disposeBoss();
  disposeMock();
}

const route = (pattern, fn) => register(pattern, (ctx) => { teardown(); fn(ctx); });

route('/', () => dashboardView(graph));
route('/subject/:subject', (c) => subjectView(graph, c.params.subject));
route('/chapter/:subject/:chapter', (c) => chapterView(graph, c.params.subject, c.params.chapter));
route('/topic/:subject/:chapter/:topic', (c) => topicView(graph, c.params.subject, c.params.chapter, c.params.topic));
route('/play/:subject/:chapter/:topic', (c) => playView(graph, c.params.subject, c.params.chapter, c.params.topic));
route('/quiz/:subject/:chapter/:topic', (c) => drillView(graph, c.params.subject, c.params.chapter, c.params.topic, c.query));
route('/boss/:subject/:chapter', (c) => bossView(graph, c.params.subject, c.params.chapter, c.query));
route('/review', () => reviewView(graph));
route('/practice', (c) => practiceView(graph, c.query));
route('/mock', (c) => mockView(graph, c.query));
route('/progress', () => progressView(graph));
route('/profile', () => profileView(graph));
route('/print', (c) => printView(graph, c.query));
route('/settings', () => settingsView());

setNotFound(({ path }) => { teardown(); notFound(path); });

/* ---- session bookkeeping --------------------------------------- */

let minuteTicker = null;
let activeSince = Date.now();

function startTicker() {
  if (minuteTicker) return;
  activeSince = Date.now();
  minuteTicker = setInterval(() => {
    // Only count a minute if the tab is visible - background tabs are not study.
    if (document.visibilityState !== 'visible') return;
    logDay((d) => { d.min += 1; });
  }, 60000);
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') startTicker();
});
startTicker();

// Keep the save current if the tab is closed mid-session.
window.addEventListener('beforeunload', () => {
  update((st) => { st.lastRoute = location.hash || '#/'; }, { silent: true, immediate: true });
});

on(EV.ANSWER, () => { touchStreak(); });

/* ---- go --------------------------------------------------------- */

startRouter();
maybeOnboard();
checkAchievements(graph, {});
refreshStats();

/* ---- service worker --------------------------------------------- */

if ('serviceWorker' in navigator) {
  // main.js is loaded by a dynamic import, so the window "load" event has
  // usually already fired by the time this runs. Waiting for it would mean
  // never registering at all.
  const registerSW = () => {
    navigator.serviceWorker.register('./sw.js').then((reg) => {
      // Tell the learner when a new build is ready rather than swapping under them.
      reg.addEventListener('updatefound', () => {
        const sw = reg.installing;
        if (!sw) return;
        sw.addEventListener('statechange', () => {
          if (sw.state === 'installed' && navigator.serviceWorker.controller) {
            import('./ui/components/overlays.js').then(({ toast }) =>
              toast({ kind: 'info', icon: '⬆️', text: 'An update is ready. Reload to apply it.', ms: 8000 }));
          }
        });
      });
    }).catch((err) => console.warn('[sw] registration failed', err));
  };

  if (document.readyState === 'complete') registerSW();
  else window.addEventListener('load', registerSW, { once: true });
}

/* ---- last-resort error surface ---------------------------------- */

window.addEventListener('error', (e) => {
  console.error('[uncaught]', e.error || e.message);
});
window.addEventListener('unhandledrejection', (e) => {
  console.error('[unhandled promise]', e.reason);
});

// Expose a few handles for debugging from the console; harmless in production.
window.JEE = { graph, get, CHAPTERS };
