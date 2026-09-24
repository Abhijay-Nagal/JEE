/**
 * progress.js - the analytics screen and the profile/badge screen.
 *
 * Everything here is derived on the fly by engine/analytics.js; nothing is
 * stored. Charts follow the shared rules: one hue for magnitude, the fixed
 * categorical slots for the three subjects, status colours only with a text
 * label, and a table view beside anything that hides a value behind colour.
 */

import { h, clear } from '../../core/dom.js';
import { renderInline, renderMath } from '../../core/mathlite.js';
import { get, levelInfo, RANKS, update } from '../../core/store.js';
import { setView, setCrumbs } from '../shell.js';
import { SUBJECTS, SUBJECT_BY_ID, TIERS } from '../../../data/registry.js';
import {
  overview, bySubject, byTier, weakest, troubleItems,
  activitySeries, reviewForecast, projection, paceToTarget, timing, ratingOf
} from '../../engine/analytics.js';
import { armStats, ARM_LABEL } from '../../engine/bandit.js';
import { ACHIEVEMENTS, nearMisses } from '../../engine/achievements.js';
import { band as eloBand } from '../../engine/elo.js';
import {
  ring, bar, heatStrip, sparkline, columns, subjectBars,
  masteryList, dataTable, withTable, bandOf
} from '../components/charts.js';
import { modal } from '../components/overlays.js';

/* ================================================================== */
/* progress                                                            */
/* ================================================================== */

export function progressView(graph) {
  setCrumbs([{ label: 'Command Deck', href: '#/' }, { label: 'Progress' }]);

  const s = get();
  const ov = overview(graph, s);
  const subs = bySubject(graph, s);
  const tiers = byTier(graph, s);
  const weak = weakest(graph, s, 8);
  const trouble = troubleItems(graph, s, 6);
  const series = activitySeries(s, 84);
  const forecast = reviewForecast(graph, s, 14);
  const proj = projection(graph, s);
  const pace = paceToTarget(graph, s);
  const t = timing(graph, s);

  const page = h('div', null,
    h('div.page-head', null,
      h('h1', null, 'Progress'),
      h('p.page-head__sub', null, renderInline(
        'Everything below is computed from your own answers. Numbers derived from very little data are labelled as such rather than dressed up.'))),

    /* headline */
    h('div.grid.grid--4', null,
      tile(String(ov.answered), 'questions answered'),
      tile(`${Math.round(ov.accuracy * 100)}%`, 'accuracy'),
      tile(`${ov.topicsMastered}/${ov.topicsTotal}`, 'topics mastered'),
      tile(`${ov.kcsMastered}/${ov.kcsSeen || 0}`, 'concepts mastered')),

    /* subjects */
    h('section.section', null,
      h('div.section__head', null, h('h2', null, 'Mastery by subject')),
      h('div.card', null,
        subjectBars(subs.map((x) => ({
          subject: x.subject,
          name: SUBJECT_BY_ID[x.subject].name,
          value: x.mastery * 100,
          detail: `${x.answered} answered · ${Math.round(x.accuracy * 100)}% accurate · ${x.topicsRead}/${x.topicsTotal} topics opened`
        })), { max: 100 }))),

    /* activity */
    h('section.section', null,
      h('div.section__head', null, h('h2', null, 'Activity')),
      h('div.grid.grid--2', null,
        h('div.card', null,
          h('div.tiny.dim', { style: { marginBottom: '8px' } }, 'LAST 12 WEEKS'),
          heatStrip(series),
          h('div.spread', { style: { marginTop: 'var(--sp-4)' } },
            h('span.small.muted', null, 'Current streak'),
            h('span.small.mono', null, `${s.streak.count} days (best ${s.streak.best})`))),
        h('div.card', null,
          h('div.tiny.dim', { style: { marginBottom: '8px' } }, 'XP PER DAY, LAST 30'),
          sparkline(series.slice(-30).map((d) => d.xp), { hue: 'var(--chart-1)', label: 'Daily XP' }),
          h('div.spread', { style: { marginTop: 'var(--sp-3)' } },
            h('span.small.muted', null, 'Total study time logged'),
            h('span.small.mono', null, `${Math.round(ov.minutes / 60)}h ${ov.minutes % 60}m`))))),

    /* review load */
    h('section.section', null,
      h('div.section__head', null,
        h('h2', null, 'Review forecast'),
        h('span.small.muted', null, 'next 14 days')),
      h('div.card', null,
        withTable(
          columns(forecast, {
            labels: forecast.map((_, i) => (i === 0 ? 'today' : `+${i}`)),
            hue: 'var(--chart-1)', unit: ' cards'
          }),
          ['Day', 'Cards due'],
          forecast.map((v, i) => [i === 0 ? 'today' : `+${i} days`, v])
        ),
        h('p.tiny.dim', { style: { marginTop: 'var(--sp-3)', marginBottom: 0 } },
          renderInline('Intervals are fuzzed by ±8% when scheduled, which is what stops one big study day from creating a single enormous review day two weeks later.')))),

    /* difficulty ladder */
    h('section.section', null,
      h('div.section__head', null, h('h2', null, 'The GMH ladder')),
      h('div.grid.grid--3', null,
        tiers.map((x) => {
          const tier = TIERS[x.tier];
          return h('div.card', null,
            h('div.spread', null,
              h('span.tag' + `.tag--${x.tier.toLowerCase()}`, null, `${x.tier} · ${tier.name}`),
              h('span.small.mono', null, x.a ? `${Math.round(x.accuracy * 100)}%` : '—')),
            h('p.tiny.dim', { style: { margin: '8px 0' } }, tier.label),
            bar(Math.round(x.accuracy * 100), { hue: `var(--tier-${x.tier.toLowerCase()})` }),
            h('div.tiny.dim', { style: { marginTop: '6px' } }, `${x.c} of ${x.a} correct`));
        }))),

    /* weak spots */
    h('section.section', null,
      h('div.section__head', null,
        h('h2', null, 'Weakest concepts'),
        h('span.small.muted', null, 'time-decayed mastery')),
      h('div.card', null,
        weak.length
          ? masteryList(weak.map((w) => ({
              name: w.name,
              mastery: w.mastery,
              detail: `${w.attempts} attempts · ${Math.round(w.accuracy * 100)}% accurate${w.topicId ? '' : ''}`,
              href: w.topicId ? topicHref(graph, w.topicId) : null
            })), { onClick: true })
          : h('p.small.muted', { style: { marginBottom: 0 } }, 'Not enough data yet. Answer a few questions and the weak spots will surface here.'))),

    trouble.length ? troubleCard(trouble) : null,

    /* speed */
    h('section.section', null,
      h('div.section__head', null, h('h2', null, 'Speed')),
      h('div.card', null,
        t.n
          ? h('div', null,
              h('div.grid.grid--4', null,
                tile(t.all ? `${t.all.toFixed(0)}s` : '—', 'median overall'),
                tile(t.G ? `${t.G.toFixed(0)}s` : '—', 'Grasp'),
                tile(t.M ? `${t.M.toFixed(0)}s` : '—', 'Mastery'),
                tile(t.H ? `${t.H.toFixed(0)}s` : '—', 'Hurdle')),
              h('p.small.muted', { style: { marginTop: 'var(--sp-4)', marginBottom: 0 } }, renderInline(
                'JEE Main gives about **72 seconds per question** on average. Use that as the bar for Mastery-tier items; Hurdle questions are allowed to take longer, provided the easy ones do not.')))
          : h('p.small.muted', { style: { marginBottom: 0 } }, 'No timing data yet.'))),

    /* projection */
    projectionCard(proj, pace),

    /* what works */
    banditCard()
  );

  setView(page, { wide: true });
}

function troubleCard(trouble) {
  return h('section.section', null,
    h('div.section__head', null,
      h('h2', null, 'Questions that keep catching you'),
      h('span.small.muted', null, 'under 50% on 2+ attempts')),
    h('div.card', null,
      h('div.stack-sm', null, trouble.map((x) =>
        h('a', {
          href: `#/topic/${x.topic.subject}/${x.topic.chapterId}/${x.topic.id}`,
          style: { display: 'block', color: 'inherit', textDecoration: 'none', padding: '8px 0', borderBottom: '1px solid var(--line-soft)' }
        },
          h('div.spread', null,
            h('span.small', { style: { flex: 1 } }, renderInline(truncate(x.q.stem, 90))),
            h('span.tag' + `.tag--${x.q.tier.toLowerCase()}`, null, x.q.tier)),
          h('div.tiny.dim', null, `${x.topic.title} · ${x.correct}/${x.seen} correct`))))));
}

const truncate = (s, n) => (s.length > n ? s.slice(0, n) + '…' : s);

function topicHref(graph, id) {
  const t = graph.topics.get(id);
  return t ? `#/topic/${t.subject}/${t.chapterId}/${t.id}` : null;
}

function projectionCard(proj, pace) {
  return h('section.section', null,
    h('div.section__head', null,
      h('h2', null, 'Estimate'),
      h('button.btn.btn--sm.btn--quiet', {
        onClick: () => modal({
          title: 'What this number is, and is not',
          body: renderInline(
            'It is an estimate of how you would score **on this platform’s own question bank**, blending the IRT ability estimate with your observed accuracy, and scaled down while the sample is small.\n\nIt is **not** a rank prediction. This bank has 207 questions covering three chapters; the real paper has 90 questions across roughly 60. Treat the number as a direction of travel, not a forecast.'),
          actions: [{ label: 'Understood', kind: 'primary' }]
        })
      }, 'How is this computed?')),
    h('div.card', null,
      h('div.spread', { style: { flexWrap: 'wrap', gap: 'var(--sp-4)' } },
        h('div', null,
          h('div.tiny.dim', null, 'ESTIMATED SCORE ON THIS BANK'),
          h('div', { style: { fontSize: '2.4rem', fontWeight: '800', lineHeight: '1.1' } }, `${proj.overall}%`),
          h('div.small.muted', null, proj.note)),
        h('div', { style: { minWidth: '200px', flex: 1 } },
          proj.perSubject.map((p) =>
            h('div', { style: { marginBottom: '8px' } },
              h('div.spread', null,
                h('span.tiny.dim', null, SUBJECT_BY_ID[p.subject].name),
                h('span.tiny.mono', null, `${p.score}% · ${p.answered} answered`)),
              bar(p.score, { hue: `var(--${p.subject})`, height: 'sm' }))))),
      h('div', { style: { marginTop: 'var(--sp-4)' } },
        h('div.tiny.dim', { style: { marginBottom: '4px' } }, `CONFIDENCE ${Math.round(proj.confidence * 100)}%`),
        bar(Math.round(proj.confidence * 100), { hue: 'var(--ink-3)', height: 'sm' })),
      pace && !pace.done
        ? h('p.small', { style: { marginTop: 'var(--sp-4)', marginBottom: 0 } }, renderInline(
            `At your recent pace you would reach 80% average mastery in about **${pace.days} day${pace.days === 1 ? '' : 's'}** of study.`))
        : pace?.done
          ? h('p.small', { style: { marginTop: 'var(--sp-4)', marginBottom: 0, color: 'var(--ok)' } }, 'You are already above the 80% mastery target across authored content.')
          : null
    ));
}

function banditCard() {
  const stats = armStats(get().bandit);
  const tried = stats.filter((x) => x.n > 0);

  return h('section.section', null,
    h('div.section__head', null,
      h('h2', null, 'What works for you'),
      h('span.small.muted', null, 'learned, not assumed')),
    h('div.card', null,
      tried.length
        ? h('div', null,
            h('div.stack-sm', null, stats.map((a) =>
              h('div', null,
                h('div.spread', { style: { marginBottom: '3px' } },
                  h('span.small', null, ARM_LABEL[a.id] || a.id),
                  h('span.tiny.mono.dim', null, a.n ? `${Math.round(a.mean * 100)}% ±${Math.round(a.sd * 100)} (n=${a.n})` : 'untried')),
                bar(Math.round(a.mean * 100), { hue: a.n ? 'var(--chart-1)' : 'var(--bg-4)', height: 'sm' })))),
            h('p.tiny.dim', { style: { marginTop: 'var(--sp-3)', marginBottom: 0 } }, renderInline(
              'Each activity keeps a Beta posterior over "did this produce a learning gain?". The Command Deck samples from these posteriors (Thompson sampling) when several options are equally sensible — so it explores early and settles on what actually works for you.')))
        : h('p.small.muted', { style: { marginBottom: 0 } },
            'Nothing measured yet. Read a topic, play a simulation and clear a review, and this will start telling you which one moves your mastery fastest.')));
}

const tile = (v, k) => h('div.card.card--pad-sm.statbox', null,
  h('div.statbox__v', null, v), h('div.statbox__k', null, k));

/* ================================================================== */
/* profile                                                             */
/* ================================================================== */

export function profileView(graph) {
  setCrumbs([{ label: 'Command Deck', href: '#/' }, { label: 'Profile' }]);

  const s = get();
  const li = levelInfo(s.xp);
  const unlocked = ACHIEVEMENTS.filter((a) => s.achievements[a.id]);
  const near = nearMisses(s, graph, 3);
  const rating = ratingOf(s, null, graph);
  const rb = eloBand(rating.rating);

  const page = h('div', null,
    h('div.card', null,
      h('div.row', { style: { gap: 'var(--sp-5)', flexWrap: 'wrap', alignItems: 'center' } },
        h('div.story__avatar', { style: { width: '80px', height: '80px', fontSize: '2.4rem' } }, s.profile.avatar || '🛰️'),
        h('div', { style: { flex: 1, minWidth: '220px' } },
          h('h1', { style: { marginBottom: '2px' } }, s.profile.name || 'Cadet'),
          h('div.small', { style: { color: 'var(--accent)', fontWeight: '700' } }, `Level ${li.level} · ${li.rank}`),
          h('div', { style: { marginTop: '10px' } }, bar(li.pct, { hue: 'var(--accent)' })),
          h('div.tiny.dim', { style: { marginTop: '4px' } }, `${li.into} / ${li.need} XP to level ${li.level + 1}`)),
        h('div', { style: { textAlign: 'center' } },
          h('div.tiny.dim', null, 'RATING'),
          h('div', { style: { fontSize: '1.9rem', fontWeight: '800', color: rb.hue } }, String(rating.rating)),
          h('div.tiny', { style: { color: rb.hue, fontWeight: '700' } }, rb.name))
      ),
      h('p.tiny.dim', { style: { marginTop: 'var(--sp-4)', marginBottom: 0 } }, renderInline(
        'The rating is an Elo average across the concepts you have practised. It moves fast at first and settles as your estimate stabilises; questions are re-rated from real answer data too, so an easy question everyone gets right drifts down over time.'))),

    h('section.section', null,
      h('div.section__head', null,
        h('h2', null, 'Badges'),
        h('span.small.muted', null, `${unlocked.length} of ${ACHIEVEMENTS.length}`)),
      h('div.grid.grid--auto', null,
        ACHIEVEMENTS.map((a) => {
          const on = Boolean(s.achievements[a.id]);
          return h('div.ach', { dataset: { unlocked: String(on) } },
            h('div.ach__icon', null, a.icon),
            h('div', null,
              h('div.ach__name', null, a.name),
              h('div.ach__desc', null, a.desc),
              on
                ? h('div.tiny.dim', { style: { marginTop: '3px' } }, new Date(s.achievements[a.id]).toLocaleDateString())
                : a.coins ? h('div.tiny.dim', { style: { marginTop: '3px' } }, `+${a.coins} coins`) : null));
        }))),

    near.length
      ? h('section.section', null,
          h('div.section__head', null, h('h2', null, 'Closest to unlocking')),
          h('div.card', null,
            h('div.stack-sm', null, near.map(({ a, p }) =>
              h('div', null,
                h('div.spread', { style: { marginBottom: '3px' } },
                  h('span.small', null, `${a.icon} ${a.name}`),
                  h('span.tiny.mono.dim', null, `${Math.min(99, Math.round(p * 100))}%`)),
                bar(Math.min(99, Math.round(p * 100)), { hue: 'var(--accent)', height: 'sm' }),
                h('div.tiny.dim', { style: { marginTop: '2px' } }, a.desc))))))
      : null,

    h('section.section', null,
      h('div.section__head', null, h('h2', null, 'Rank ladder')),
      h('div.card', null,
        h('div.row-wrap', null, RANKS.map((r, i) =>
          h('span.tag' + (r === li.rank ? '.tag--ok' : ''), {
            style: i * 3 + 1 > li.level ? { opacity: '.4' } : {}
          }, `${i * 3 + 1}+ ${r}`))),
        h('p.tiny.dim', { style: { marginTop: 'var(--sp-3)', marginBottom: 0 } },
          'A new rank every three levels. XP per level grows linearly, so the ladder gets slower on purpose.')))
  );

  setView(page, { wide: true });
}
