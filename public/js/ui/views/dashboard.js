/**
 * dashboard.js - the Command Deck.
 *
 * One screen that answers "what should I do right now?" with a single primary
 * action chosen by the recommender, plus the context a learner needs to trust
 * that choice.
 */

import { h, clear } from '../../core/dom.js';
import { renderInline } from '../../core/mathlite.js';
import { get, levelInfo, dayKey } from '../../core/store.js';
import { sfx } from '../../core/audio.js';
import { setView, setCrumbs } from '../shell.js';
import { SUBJECTS, STORY, STATS, CHAPTERS } from '../../../data/registry.js';
import { nextBest, suggestions, dueQueue } from '../../engine/recommender.js';
import { subjectMastery, chapterMastery, frontier } from '../../engine/knowledgeGraph.js';
import { questList } from '../../engine/quests.js';
import { ACHIEVEMENTS } from '../../engine/achievements.js';
import { overview, activitySeries } from '../../engine/analytics.js';
import { ring, bar, heatStrip } from '../components/charts.js';
import { modal } from '../components/overlays.js';

export function dashboardView(graph) {
  setCrumbs([{ label: 'Command Deck' }]);
  const s = get();
  const li = levelInfo(s.xp);
  const ov = overview(graph, s);

  const page = h('div', null,
    hero(graph, s, li),
    h('div.grid.grid--sidebar', { style: { marginTop: 'var(--sp-6)' } },
      h('div', null,
        subjectSection(graph, s),
        continueSection(graph, s),
        statsSection(ov, s)
      ),
      h('div', null,
        questCard(),
        dueCard(graph, s),
        badgeCard(s)
      )
    ),
    storyFooter()
  );

  setView(page);
}

/* ------------------------------------------------------------------ */
/* hero                                                                */
/* ------------------------------------------------------------------ */

function hero(graph, s, li) {
  const rec = nextBest(graph, s);
  const name = s.profile.name || 'Cadet';
  const hour = new Date().getHours();
  const greet = hour < 5 ? 'Still awake' : hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return h('div.card', {
    style: {
      background: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 12%, var(--bg-1)), var(--bg-1))',
      borderColor: 'color-mix(in srgb, var(--primary) 30%, var(--line))'
    }
  },
    h('div.spread', { style: { alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--sp-4)' } },
      h('div', { style: { minWidth: '260px', flex: '1' } },
        h('div.page-head__eyebrow', null, `${greet}, ${name} · Level ${li.level} ${li.rank}`),
        h('h1', { style: { marginBottom: '6px' } },
          h('span', { style: { marginRight: '10px' } }, rec.icon),
          rec.title),
        h('p.page-head__sub', null, renderInline(rec.reason)),
        h('div.btnbar', { style: { marginTop: 'var(--sp-4)' } },
          h('a.btn.btn--primary.btn--lg', { href: rec.href, onClick: () => sfx.click() }, 'Start →'),
          h('a.btn.btn--ghost', { href: '#/practice' }, 'Something else')
        )
      ),
      h('div', { style: { textAlign: 'center' } },
        ring(Math.round(li.pct), { size: 92, label: `${li.pct}%`, hue: 'var(--accent)' }),
        h('div.tiny.dim', { style: { marginTop: '6px' } }, `${li.need - li.into} XP to level ${li.level + 1}`)
      )
    )
  );
}

/* ------------------------------------------------------------------ */
/* subjects                                                            */
/* ------------------------------------------------------------------ */

function subjectSection(graph, s) {
  return h('section.section', { style: { marginTop: 0 } },
    h('div.section__head', null,
      h('h2', null, 'The three wings'),
      h('span.small.muted', null, `${STATS.topics} topics · ${STATS.questions} questions`)),
    h('div.grid.grid--3', null,
      SUBJECTS.map((sub) => {
        const m = subjectMastery(graph, s, sub.id);
        const chapters = CHAPTERS.filter((c) => c.subject === sub.id);
        const read = [...graph.topics.values()].filter((t) => t.subject === sub.id && s.topics[t.id]?.read).length;
        const total = [...graph.topics.values()].filter((t) => t.subject === sub.id).length;

        return h('a.subject-card.tilt', { href: `#/subject/${sub.id}`, dataset: { subject: sub.id } },
          h('div.subject-card__glyph', null, sub.icon),
          h('h3', null, sub.name),
          h('div.subject-card__meta', null, sub.tagline),
          h('div', { style: { marginTop: 'var(--sp-4)' } },
            bar(Math.round(m * 100), { hue: `var(--${sub.id})` }),
            h('div.spread', { style: { marginTop: '6px' } },
              h('span.tiny.dim', null, `${Math.round(m * 100)}% mastered`),
              h('span.tiny.dim', null, `${read}/${total} topics opened`)))
        );
      })
    )
  );
}

/* ------------------------------------------------------------------ */
/* continue                                                            */
/* ------------------------------------------------------------------ */

function continueSection(graph, s) {
  const items = suggestions(graph, s, 4);
  if (!items.length) return null;

  return h('section.section', null,
    h('div.section__head', null, h('h2', null, 'Also worth doing')),
    h('div.tlist', null,
      items.map((it) =>
        h('a.titem', { href: it.href, dataset: { hue: it.subject } },
          h('div.titem__num', null, it.icon),
          h('div', null,
            h('div.titem__title', null, it.title),
            h('div.titem__meta', null, it.sub)),
          h('div.titem__right', null, h('span.muted', null, '→'))))
    )
  );
}

/* ------------------------------------------------------------------ */
/* stats strip                                                         */
/* ------------------------------------------------------------------ */

function statsSection(ov, s) {
  const series = activitySeries(s, 84);
  return h('section.section', null,
    h('div.section__head', null,
      h('h2', null, 'Your run so far'),
      h('a.small', { href: '#/progress' }, 'Full report →')),
    h('div.card', null,
      h('div.grid.grid--4', null,
        stat(String(ov.answered), 'questions answered'),
        stat(`${Math.round(ov.accuracy * 100)}%`, 'overall accuracy'),
        stat(`${ov.topicsMastered}/${ov.topicsTotal}`, 'topics mastered'),
        stat(`${s.streak.count}🔥`, `best ${s.streak.best}`)
      ),
      h('div', { style: { marginTop: 'var(--sp-5)' } },
        h('div.tiny.dim', { style: { marginBottom: '6px' } }, 'LAST 12 WEEKS'),
        heatStrip(series))
    )
  );
}

function stat(v, k) {
  return h('div.statbox', null, h('div.statbox__v', null, v), h('div.statbox__k', null, k));
}

/* ------------------------------------------------------------------ */
/* side cards                                                          */
/* ------------------------------------------------------------------ */

function questCard() {
  const quests = questList();
  const done = quests.filter((q) => q.done).length;

  return h('div.card', { style: { marginBottom: 'var(--sp-4)' } },
    h('div.card__head', null,
      h('h3.card__title', null, 'Daily missions'),
      h('span.tag' + (done === quests.length ? '.tag--ok' : ''), null, `${done}/${quests.length}`)),
    h('div', null,
      quests.map((q) =>
        h('div.quest', { dataset: { done: String(q.done) } },
          h('div.quest__check', null, q.done ? '✓' : ''),
          h('div.quest__label', null,
            h('span', { style: { marginRight: '6px' } }, q.icon),
            q.label,
            q.target > 1 ? h('div.tiny.dim', null, `${Math.min(q.progress, q.target)} / ${q.target}`) : null),
          h('div.quest__reward', null, `+${q.xp}`)))),
    done === quests.length
      ? h('div.small.center', { style: { marginTop: 'var(--sp-3)', color: 'var(--accent)' } }, '🎁 Bonus chest opened')
      : null
  );
}

function dueCard(graph, s) {
  const due = dueQueue(graph, s, { limit: 100 });
  const overdue = due.filter((d) => d.overdue > 0).length;

  return h('div.card', { style: { marginBottom: 'var(--sp-4)' } },
    h('div.card__head', null,
      h('h3.card__title', null, 'Memory'),
      due.length ? h('span.tag.tag--info', null, `${due.length} due`) : h('span.tag.tag--ok', null, 'clear')),
    due.length
      ? h('div', null,
          h('p.small.muted', null, renderInline(
            overdue
              ? `**${overdue}** concept${overdue > 1 ? 's have' : ' has'} decayed past the 90% retention target.`
              : 'A few concepts are approaching the forgetting threshold.')),
          h('a.btn.btn--primary.btn--block', { href: '#/review' }, 'Start review'))
      : h('p.small.muted', { style: { marginBottom: 0 } },
          'Nothing is due. Spaced repetition will queue concepts as they approach the forgetting curve.')
  );
}

function badgeCard(s) {
  const unlocked = ACHIEVEMENTS.filter((a) => s.achievements[a.id]);
  const recent = unlocked
    .sort((a, b) => s.achievements[b.id] - s.achievements[a.id])
    .slice(0, 3);

  return h('div.card', null,
    h('div.card__head', null,
      h('h3.card__title', null, 'Badges'),
      h('span.tag', null, `${unlocked.length}/${ACHIEVEMENTS.length}`)),
    recent.length
      ? h('div.stack-sm', null, recent.map((a) =>
          h('div.ach', { dataset: { unlocked: 'true' } },
            h('div.ach__icon', null, a.icon),
            h('div', null,
              h('div.ach__name', null, a.name),
              h('div.ach__desc', null, a.desc)))))
      : h('p.small.muted', { style: { marginBottom: 0 } }, 'Answer your first question to start unlocking badges.'),
    h('a.btn.btn--ghost.btn--block', { href: '#/profile', style: { marginTop: 'var(--sp-3)' } }, 'See all')
  );
}

/* ------------------------------------------------------------------ */
/* story                                                               */
/* ------------------------------------------------------------------ */

function storyFooter() {
  return h('div.card', {
    style: { marginTop: 'var(--sp-6)', background: 'var(--bg-2)' }
  },
    h('div.row', { style: { flexWrap: 'wrap', gap: 'var(--sp-4)' } },
      h('div.story__avatar', null, '🛰️'),
      h('div', { style: { flex: '1', minWidth: '240px' } },
        h('div.tiny.dim', null, 'CURRENT ASSIGNMENT'),
        h('strong', null, STORY.title),
        h('p.small.muted', { style: { margin: '4px 0 0' } }, renderInline(STORY.premise))),
      h('button.btn.btn--ghost', {
        onClick: () => modal({
          title: STORY.title,
          wide: true,
          body: h('div', null,
            h('p', null, renderInline(STORY.premise)),
            h('div.divider-label', null, 'Cast'),
            h('div.stack-sm', null, STORY.cast.map((c) =>
              h('div.row', { style: { alignItems: 'flex-start' } },
                h('div.story__avatar', { style: { width: '40px', height: '40px', fontSize: '1.2rem' } }, c.avatar),
                h('div', null, h('strong', null, c.name), h('div.small.muted', null, c.role))))),
            h('div.divider-label', null, 'Acts'),
            h('div.stack-sm', null, STORY.acts.map((a) =>
              h('div', null,
                h('strong', null, a.name),
                h('div.small.muted', null, a.summary))))
          ),
          actions: [{ label: 'Close', kind: 'primary' }]
        })
      }, 'Read the brief')
    )
  );
}
