/**
 * topic.js - the lesson screen and the full-screen simulation screen.
 *
 * The lesson embeds its simulation inline at the point the author placed the
 * `sim` block, so the interaction arrives at the moment it explains something
 * rather than being bolted on at the end.
 */

import { h, clear } from '../../core/dom.js';
import { renderInline, renderMath } from '../../core/mathlite.js';
import { get, topicRec, update, logDay, pushLog } from '../../core/store.js';
import { emit, EV } from '../../core/bus.js';
import { addXP } from '../../core/store.js';
import { burstAt } from '../../core/fx.js';
import { sfx } from '../../core/audio.js';
import { setView, setCrumbs } from '../shell.js';
import { getTopic, getChapter, neighbours, SUBJECT_BY_ID } from '../../../data/registry.js';
import { topicMastery, topicUnlocked, lockReason } from '../../engine/knowledgeGraph.js';
import { MASTERY_THRESHOLD, attemptsToMastery } from '../../engine/bkt.js';
import { checkAchievements } from '../../engine/achievements.js';
import { reward, rewardFromSession } from '../../engine/bandit.js';
import { renderLesson } from '../components/lesson.js';
import { mountAnimation } from '../components/anim.js';
import { mountWidget } from '../../game/registry.js';
import { ring, bar, bandOf, masteryList } from '../components/charts.js';
import { notFound } from './browse.js';

let liveWidget = null;
let liveAnims = [];

/** Called by the router before each navigation so canvases stop animating. */
export function disposeWidget() {
  liveWidget?.destroy?.();
  liveWidget = null;
  for (const a of liveAnims) a?.destroy?.();
  liveAnims = [];
}

/* ================================================================== */
/* lesson                                                              */
/* ================================================================== */

export function topicView(graph, subjectId, chapterId, topicId) {
  const t = getTopic(topicId);
  const ch = getChapter(chapterId);
  if (!t || !ch) return notFound(topicId);

  disposeWidget();
  const s = get();
  const sub = SUBJECT_BY_ID[t.subject];

  setCrumbs([
    { label: sub.name, href: `#/subject/${t.subject}` },
    { label: ch.title, href: `#/chapter/${t.subject}/${ch.id}` },
    { label: t.title }
  ]);

  // Opening a topic marks it read, which is what unlocks its dependants.
  const rec = topicRec(t.id);
  const firstOpen = !rec.read;
  if (firstOpen) {
    rec.read = true;
    rec.readAt = Date.now();
    addXP(15, `read:${t.id}`);
    pushLog({ type: 'read', id: t.id });
    emit(EV.TOPIC_DONE, { topicId: t.id });
    checkAchievements(graph, {});
  }

  const locked = !topicUnlocked(graph, s, t.id);
  const nav = neighbours(t.id);
  const m = topicMastery(graph, s, t.id);

  const page = h('div', null,
    locked ? lockWarning(graph, s, t) : null,

    h('div.page-head', null,
      h('div.page-head__eyebrow', null, `${ch.title} · Topic ${ch.topics.indexOf(t) + 1} of ${ch.topics.length}`),
      h('h1', null, t.title),
      h('p.page-head__sub', null, t.short)),

    storyBlock(t),

    h('div.grid.grid--sidebar', null,
      h('div', null,
        renderLesson(t.lesson, {
          onSim: () => simSlot(t),
          onAnim: (block) => animSlot(t, block)
        })
      ),
      h('div', null, sideRail(graph, s, t, ch, m))
    ),

    h('hr'),
    nextActions(t, ch, nav, m)
  );

  setView(page, { hue: t.subject });
}

function lockWarning(graph, s, t) {
  return h('div.callout.callout--warn', { style: { marginBottom: 'var(--sp-5)' } },
    h('div.callout__label', null, '🔒 Out of order'),
    h('div.small', null, renderInline(
      `${lockReason(graph, s, t.id)}. You can read on — nothing is blocked — but the prerequisites will make this much easier.`)));
}

function storyBlock(t) {
  if (!t.story) return null;
  return h('div.story', { style: { marginBottom: 'var(--sp-6)' } },
    h('div.row', { style: { alignItems: 'flex-start', gap: 'var(--sp-4)' } },
      h('div.story__avatar', null, t.story.avatar),
      h('div', null,
        h('div.story__speaker', null, t.story.speaker),
        ...t.story.lines.map((l) => h('p.story__line', null, renderInline(l))))));
}

/* ------------------------------------------------------------------ */
/* inline simulation                                                   */
/* ------------------------------------------------------------------ */

function simSlot(t) {
  const host = h('div', { style: { margin: 'var(--sp-6) 0' } });

  const start = () => {
    clear(host);
    const mountPoint = h('div');
    host.appendChild(mountPoint);
    launchWidget(t, mountPoint);
  };

  host.appendChild(h('div.arcade', null,
    h('div.arcade__head', null,
      h('span.arcade__badge', null, 'Interactive'),
      h('span.arcade__title', null, t.widgetTitle || 'Simulation')),
    h('div.arcade__panel', null,
      h('p.small.muted', null, renderInline(t.widgetBrief || '')),
      h('div.btnbar', null,
        h('button.btn.btn--primary', { onClick: start }, '▶ Launch'),
        h('a.btn.btn--ghost', { href: `#/play/${t.subject}/${t.chapterId}/${t.id}` }, 'Open full screen')))
  ));

  return host;
}

/**
 * A concept animation embedded in the lesson. It mounts immediately (they are
 * cheap, and they pause themselves when scrolled out of view) rather than
 * waiting for a click, because an animation behind a button is one nobody
 * watches.
 */
function animSlot(t, block) {
  const host = h('div');
  mountAnimation(block.id, host, { subject: t.subject })
    .then((handle) => { if (handle) liveAnims.push(handle); })
    .catch((err) => console.error('[topic] animation failed', err));
  return host;
}

export async function launchWidget(t, host, { fullscreen = false } = {}) {
  disposeWidget();
  const s = get();
  const rec = topicRec(t.id);
  const startedAt = Date.now();

  host.appendChild(h('div.row', { style: { justifyContent: 'center', padding: 'var(--sp-6)' } },
    h('div.spinner'), h('span.small.muted', null, 'Loading simulation…')));

  const handle = await mountWidget(t.widget, host, {
    topic: t,
    hue: `var(--${t.subject})`,
    hueHex: getComputedStyle(document.body).getPropertyValue(`--${t.subject}`).trim() || '#4cc9f0',
    best: rec.gameBest || 0,
    fx: { burstAt, shake: () => {} },
    report(score, meta = {}) {
      const r = topicRec(t.id);
      r.gamePlays += 1;
      r.gameBest = Math.max(r.gameBest || 0, score);
      update((st) => { st.gamePlays = (st.gamePlays || 0) + 1; });

      const minutes = Math.max(0.5, (Date.now() - startedAt) / 60000);
      logDay((d) => { d.games = (d.games || 0) + 1; d.min += Math.round(minutes); });

      // A simulation earns XP scaled by score, capped so grinding one game
      // is never a better use of time than answering questions.
      const xp = Math.min(80, 20 + Math.round(score / 6));
      addXP(xp, `game:${t.widget}`);
      reward(get().bandit, 'sim', rewardFromSession({ masteryGain: 0.01 * (meta.solved || 1), minutes }));
      emit(EV.GAME_SCORE, { topicId: t.id, widget: t.widget, score, ...meta });
      checkAchievements(null, {});
      emit(EV.TOAST, { kind: 'xp', icon: '🎮', text: `Simulation complete — **+${xp} XP**` });
    }
  });

  // Remove the spinner now that the widget owns the host.
  host.querySelector('.spinner')?.parentElement?.remove();
  liveWidget = handle;
  return handle;
}

/* ------------------------------------------------------------------ */
/* side rail                                                           */
/* ------------------------------------------------------------------ */

function sideRail(graph, s, t, ch, m) {
  const band = bandOf(m);
  const rec = s.topics[t.id];
  const toGo = attemptsToMastery(m);

  const kcRows = (t.kcs || []).map((id) => ({
    name: graph.kcs.get(id)?.name || id,
    mastery: (() => {
      const r = s.kc[id];
      return r ? r.p : 0.12;
    })()
  }));

  return h('div', { style: { position: 'sticky', top: 'calc(var(--topbar-h) + 16px)' } },
    h('div.card.card--pad-sm', { style: { marginBottom: 'var(--sp-4)', textAlign: 'center' } },
      ring(Math.round(m * 100), { size: 88, label: `${Math.round(m * 100)}%`, hue: band.colour }),
      h('div.tiny', { style: { color: band.colour, fontWeight: '800', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '.08em' } }, band.label),
      m < MASTERY_THRESHOLD
        ? h('div.tiny.dim', { style: { marginTop: '4px' } }, `about ${toGo} more correct answers to master`)
        : h('div.tiny.dim', { style: { marginTop: '4px' } }, 'mastered — reviews will keep it there'),
      h('a.btn.btn--primary.btn--block', {
        href: `#/quiz/${t.subject}/${t.chapterId}/${t.id}`,
        style: { marginTop: 'var(--sp-3)' }
      }, 'Practice GMH set')
    ),

    h('div.card.card--pad-sm', { style: { marginBottom: 'var(--sp-4)' } },
      h('div.tiny.dim', { style: { marginBottom: '8px' } }, 'CONCEPTS IN THIS TOPIC'),
      masteryList(kcRows)),

    (t.formulas?.length
      ? h('div.card.card--pad-sm', null,
          h('div.tiny.dim', { style: { marginBottom: '8px' } }, 'KEY FORMULAE'),
          h('div.stack-sm', null, t.formulas.map((f) =>
            h('div', { style: { paddingBottom: '8px', borderBottom: '1px solid var(--line-soft)' } },
              h('div.tiny.dim', null, f.name),
              h('div', { style: { overflowX: 'auto' } }, renderMath(f.tex))))))
      : null)
  );
}

/* ------------------------------------------------------------------ */
/* footer actions                                                      */
/* ------------------------------------------------------------------ */

function nextActions(t, ch, nav, m) {
  return h('div', null,
    h('div.grid.grid--3', null,
      h('a.card.tilt', { href: `#/play/${t.subject}/${t.chapterId}/${t.id}`, style: { textDecoration: 'none', color: 'inherit' } },
        h('div', { style: { fontSize: '1.6rem' } }, '🎮'),
        h('h4', { style: { margin: '6px 0 2px' } }, t.widgetTitle || 'Simulation'),
        h('div.small.muted', null, 'Full screen, no distractions')),
      h('a.card.tilt', { href: `#/quiz/${t.subject}/${t.chapterId}/${t.id}`, style: { textDecoration: 'none', color: 'inherit' } },
        h('div', { style: { fontSize: '1.6rem' } }, '🎯'),
        h('h4', { style: { margin: '6px 0 2px' } }, 'GMH ladder'),
        h('div.small.muted', null, 'Grasp → Mastery → Hurdle')),
      h('a.card.tilt', { href: `#/print?topic=${t.id}`, style: { textDecoration: 'none', color: 'inherit' } },
        h('div', { style: { fontSize: '1.6rem' } }, '🖨️'),
        h('h4', { style: { margin: '6px 0 2px' } }, 'Print this topic'),
        h('div.small.muted', null, 'Notes, formulae and a question paper'))
    ),

    h('div.spread', { style: { marginTop: 'var(--sp-6)', flexWrap: 'wrap', gap: 'var(--sp-3)' } },
      nav.prev
        ? h('a.btn.btn--ghost', { href: `#/topic/${nav.prev.subject}/${nav.prev.chapterId}/${nav.prev.id}` }, '← ' + nav.prev.title)
        : h('a.btn.btn--ghost', { href: `#/chapter/${t.subject}/${ch.id}` }, '← Chapter'),
      nav.next
        ? h('a.btn.btn--primary', { href: `#/topic/${nav.next.subject}/${nav.next.chapterId}/${nav.next.id}` }, nav.next.title + ' →')
        : h('a.btn.btn--bad', { href: `#/boss/${t.subject}/${ch.id}` }, `⚔️ Face ${ch.boss.name}`))
  );
}

/* ================================================================== */
/* full-screen play                                                    */
/* ================================================================== */

export function playView(graph, subjectId, chapterId, topicId) {
  const t = getTopic(topicId);
  const ch = getChapter(chapterId);
  if (!t || !ch) return notFound(topicId);

  disposeWidget();
  setCrumbs([
    { label: SUBJECT_BY_ID[t.subject].name, href: `#/subject/${t.subject}` },
    { label: ch.title, href: `#/chapter/${t.subject}/${ch.id}` },
    { label: t.widgetTitle || 'Simulation' }
  ]);

  const host = h('div');
  const page = h('div', null,
    h('div.page-head', null,
      h('div.page-head__eyebrow', null, `${t.title} · interactive`),
      h('h1', null, t.widgetTitle || 'Simulation'),
      h('p.page-head__sub', null, t.widgetBrief)),
    host,
    h('div.btnbar', { style: { marginTop: 'var(--sp-5)' } },
      h('a.btn.btn--ghost', { href: `#/topic/${t.subject}/${t.chapterId}/${t.id}` }, '← Back to the lesson'),
      h('a.btn.btn--primary', { href: `#/quiz/${t.subject}/${t.chapterId}/${t.id}` }, 'Practice questions →'))
  );

  setView(page, { wide: true, hue: t.subject });
  launchWidget(t, host, { fullscreen: true });
}
