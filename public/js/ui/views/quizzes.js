/**
 * quizzes.js - topic drill, spaced review and adaptive practice.
 *
 * All three are the same runner with a different question-selection policy,
 * which is the whole reason the selection logic lives in the recommender and
 * not in the view.
 */

import { h, clear } from '../../core/dom.js';
import { renderInline } from '../../core/mathlite.js';
import { get, logDay } from '../../core/store.js';
import { setView, setCrumbs } from '../shell.js';
import { confetti } from '../../core/fx.js';
import { getTopic, getChapter, SUBJECT_BY_ID, SUBJECTS, TIERS } from '../../../data/registry.js';
import { drillSet, adaptiveSet, dueQueue, questionsForKCs } from '../../engine/recommender.js';
import { topicMastery } from '../../engine/knowledgeGraph.js';
import { humanInterval, retrievability } from '../../engine/srs.js';
import { reward, rewardFromSession } from '../../engine/bandit.js';
import { checkAchievements } from '../../engine/achievements.js';
import { createQuiz, summaryCard } from '../components/quiz.js';
import { ring, bandOf, bar } from '../components/charts.js';
import { notFound } from './browse.js';

let live = null;

export function disposeQuiz() {
  live?.destroy?.();
  live = null;
}

/* ================================================================== */
/* topic drill                                                         */
/* ================================================================== */

export function drillView(graph, subjectId, chapterId, topicId, query = {}) {
  const t = getTopic(topicId);
  const ch = getChapter(chapterId);
  if (!t || !ch) return notFound(topicId);

  disposeQuiz();
  setCrumbs([
    { label: SUBJECT_BY_ID[t.subject].name, href: `#/subject/${t.subject}` },
    { label: ch.title, href: `#/chapter/${t.subject}/${ch.id}` },
    { label: t.title, href: `#/topic/${t.subject}/${ch.id}/${t.id}` },
    { label: 'GMH ladder' }
  ]);

  const s = get();
  const tier = query.tier && ['G', 'M', 'H'].includes(query.tier) ? query.tier : null;
  const count = Number(query.n) || (tier ? 3 : 6);
  const questions = drillSet(t, s, { count, tier });

  if (!questions.length) {
    return setView(h('div.empty', null, h('div.empty__icon', null, '📝'), h('p', null, 'No questions authored for this topic yet.')));
  }

  const host = h('div');
  const page = h('div', null,
    header(t, ch, s, graph, tier),
    host
  );
  setView(page, { hue: t.subject, read: true });

  const startedAt = Date.now();
  live = createQuiz({
    host, questions, mode: 'drill', graph, topicId: t.id,
    onFinish(summary) {
      logDay((d) => { d.min += Math.round(summary.durationMs / 60000); });
      reward(get().bandit, 'drill', rewardFromSession({
        masteryGain: summary.results.reduce((a, r) => a + (r?.masteryDelta || 0), 0),
        minutes: summary.durationMs / 60000,
        accuracy: summary.accuracy
      }));
      if (summary.accuracy >= 0.8) confetti({ count: 90 });
      showSummary(host, summary, t, ch, graph);
    }
  });
}

function header(t, ch, s, graph, tier) {
  const rec = s.topics[t.id];
  const m = topicMastery(graph, s, t.id);
  const band = bandOf(m);

  return h('div', { style: { marginBottom: 'var(--sp-5)' } },
    h('div.spread', { style: { flexWrap: 'wrap', gap: 'var(--sp-4)' } },
      h('div', null,
        h('div.page-head__eyebrow', null, `${ch.title}`),
        h('h1', { style: { marginBottom: '4px' } }, t.title),
        h('p.page-head__sub', null, tier
          ? `${TIERS[tier].name} tier only — ${TIERS[tier].hint}`
          : 'The set adapts: clear the Grasp tier and Mastery questions start appearing.')),
      ring(Math.round(m * 100), { size: 62, label: `${Math.round(m * 100)}%`, hue: band.colour })
    ),
    h('div.row-wrap', { style: { marginTop: 'var(--sp-3)' } },
      ...['G', 'M', 'H'].map((k) => {
        const g = rec?.gmh?.[k];
        const acc = g && g.a ? Math.round((g.c / g.a) * 100) : null;
        return h('a.tag' + `.tag--${k.toLowerCase()}`, {
          href: `#/quiz/${t.subject}/${ch.id}/${t.id}?tier=${k}`,
          style: { textDecoration: 'none' }
        }, `${TIERS[k].name}: ${acc === null ? 'untried' : acc + '%'}`);
      }))
  );
}

function showSummary(host, summary, t, ch, graph) {
  clear(host);
  const s = get();
  const m = topicMastery(graph, s, t.id);

  const wrong = summary.results.filter((r) => r && !r.correct);
  host.appendChild(summaryCard(summary, {
    title: `${t.title} — set complete`,
    actions: [
      h('a.btn.btn--primary', { href: `#/quiz/${t.subject}/${ch.id}/${t.id}` }, 'Another set'),
      wrong.length ? h('a.btn', { href: `#/quiz/${t.subject}/${ch.id}/${t.id}?tier=${wrong[0].tier}` }, `Drill ${TIERS[wrong[0].tier].name} tier`) : null,
      h('a.btn.btn--ghost', { href: `#/topic/${t.subject}/${ch.id}/${t.id}` }, 'Back to lesson')
    ].filter(Boolean)
  }));

  host.appendChild(h('div.card', { style: { marginTop: 'var(--sp-4)' } },
    h('div.card__head', null, h('h3.card__title', null, 'Mastery after this set')),
    h('div.spread', null,
      h('span.small.muted', null, t.title),
      h('span.small.mono', null, `${Math.round(m * 100)}%`)),
    bar(Math.round(m * 100), { hue: bandOf(m).colour }),
    wrong.length
      ? h('div', { style: { marginTop: 'var(--sp-4)' } },
          h('div.tiny.dim', { style: { marginBottom: '6px' } }, 'WHAT TO FIX'),
          h('ul.small', null, dedupe(wrong.map((r) => r.diagnosis?.message).filter(Boolean)).map((msg) => h('li', null, renderInline(msg)))))
      : h('p.small', { style: { marginTop: 'var(--sp-3)', color: 'var(--ok)' } }, 'Nothing wrong to fix — clean sweep.')
  ));

  // Next step suggestion.
  const nextHref = m >= 0.8 ? `#/chapter/${t.subject}/${ch.id}` : `#/play/${t.subject}/${ch.id}/${t.id}`;
  host.appendChild(h('div.card', { style: { marginTop: 'var(--sp-4)', textAlign: 'center' } },
    h('p', null, renderInline(m >= 0.8
      ? 'This topic is **mastered**. Spaced review will keep it that way — move on.'
      : 'Mastery is still building. The simulation tends to move it faster than another question set at this point.')),
    h('a.btn.btn--primary', { href: nextHref }, m >= 0.8 ? 'Back to chapter' : 'Play the simulation')));
}

const dedupe = (arr) => [...new Set(arr)];

/* ================================================================== */
/* spaced review                                                       */
/* ================================================================== */

export function reviewView(graph) {
  disposeQuiz();
  setCrumbs([{ label: 'Command Deck', href: '#/' }, { label: 'Spaced Review' }]);

  const s = get();
  const queue = dueQueue(graph, s, { limit: 20 });

  if (!queue.length) {
    return setView(h('div', null,
      h('div.page-head', null,
        h('h1', null, 'Nothing is due'),
        h('p.page-head__sub', null, renderInline(
          'The scheduler queues a concept when its predicted recall drops toward 90%. Reviewing earlier than that is mostly wasted effort — the point of spacing is to catch a memory just before it fades.'))),
      h('div.card.center', null,
        h('div', { style: { fontSize: '3rem' } }, '📦'),
        h('h3', null, 'Inbox zero'),
        h('p.muted', null, 'Come back tomorrow, or learn something new.'),
        h('div.btnbar', { style: { justifyContent: 'center' } },
          h('a.btn.btn--primary', { href: '#/practice' }, 'Adaptive practice'),
          h('a.btn.btn--ghost', { href: '#/' }, 'Command Deck')))
    ));
  }

  const kcIds = queue.map((q) => q.id);
  const questions = questionsForKCs(graph, kcIds, { count: Math.min(15, queue.length + 3), state: s });

  if (!questions.length) {
    return setView(h('div.empty', null, h('p', null, 'No questions are linked to the due concepts yet.')));
  }

  const host = h('div');
  setView(h('div', null,
    h('div.page-head', null,
      h('div.page-head__eyebrow', null, `${queue.length} concept${queue.length > 1 ? 's' : ''} due`),
      h('h1', null, 'Spaced Review'),
      h('p.page-head__sub', null, renderInline(
        `Ordered by how close each one is to being forgotten, not by when it was due. The most urgent is **${graph.kcs.get(queue[0].id)?.name || 'first'}**, at ${Math.round(queue[0].retrievability * 100)}% predicted recall.`))),
    queuePreview(graph, queue),
    host
  ), { read: true });

  live = createQuiz({
    host, questions, mode: 'review', graph,
    onFinish(summary) {
      const remaining = dueQueue(graph, get(), { limit: 100 }).length;
      checkAchievements(graph, { queueCleared: remaining === 0 });
      reward(get().bandit, 'review', rewardFromSession({
        masteryGain: summary.results.reduce((a, r) => a + (r?.masteryDelta || 0), 0),
        minutes: summary.durationMs / 60000,
        accuracy: summary.accuracy
      }));
      clear(host);
      host.appendChild(summaryCard(summary, {
        title: 'Review session complete',
        actions: [
          remaining ? h('a.btn.btn--primary', { href: '#/review', onClick: () => setTimeout(() => location.reload(), 10) }, `${remaining} still due`) : null,
          h('a.btn.btn--ghost', { href: '#/' }, 'Command Deck')
        ].filter(Boolean)
      }));
      host.appendChild(scheduleCard(graph, summary));
    }
  });
}

function queuePreview(graph, queue) {
  return h('details.card', { style: { marginBottom: 'var(--sp-5)' } },
    h('summary', { style: { cursor: 'pointer', fontWeight: '650' } }, `What is due (${queue.length})`),
    h('div.stack-sm', { style: { marginTop: 'var(--sp-3)' } },
      queue.slice(0, 12).map((q) => {
        const node = graph.kcs.get(q.id);
        const r = Math.round(q.retrievability * 100);
        return h('div.spread', { style: { padding: '5px 0', borderBottom: '1px solid var(--line-soft)' } },
          h('span.small', null, node?.name || q.id),
          h('span.tiny', { style: { color: r < 70 ? 'var(--bad)' : r < 85 ? 'var(--warn)' : 'var(--ink-3)' } },
            `${r}% recall · ${q.overdue > 0 ? `${Math.round(q.overdue)}d overdue` : 'due now'}`));
      })));
}

function scheduleCard(graph, summary) {
  const s = get();
  const rows = summary.results
    .filter((r) => r && r.question)
    .flatMap((r) => (r.question.kcs || []).map((id) => ({ id, rec: s.kc[id] })))
    .filter((x) => x.rec?.due);

  const seen = new Set();
  const unique = rows.filter((x) => (seen.has(x.id) ? false : (seen.add(x.id), true)));

  return h('div.card', { style: { marginTop: 'var(--sp-4)' } },
    h('div.card__head', null, h('h3.card__title', null, 'Next time you will see these')),
    h('div.stack-sm', null, unique.slice(0, 10).map((x) =>
      h('div.spread', { style: { padding: '5px 0', borderBottom: '1px solid var(--line-soft)' } },
        h('span.small', null, graph.kcs.get(x.id)?.name || x.id),
        h('span.tiny.mono.dim', null, `in ${humanInterval(x.rec.ivl)} · ease ${x.rec.ease.toFixed(2)}`)))),
    h('p.tiny.dim', { style: { marginTop: 'var(--sp-3)', marginBottom: 0 } },
      renderInline('Intervals come from SM-2, adjusted by how quickly and how confidently you answered. A lapse resets the ladder and lowers the ease factor, so a card you keep forgetting comes back more often.')));
}

/* ================================================================== */
/* adaptive practice                                                   */
/* ================================================================== */

export function practiceView(graph, query = {}) {
  disposeQuiz();
  setCrumbs([{ label: 'Command Deck', href: '#/' }, { label: 'Adaptive Practice' }]);

  const s = get();
  const subject = SUBJECTS.some((x) => x.id === query.subject) ? query.subject : null;

  if (!query.go) return setView(practiceSetup(graph, s, subject));

  const count = Math.min(25, Math.max(5, Number(query.n) || 10));
  const questions = adaptiveSet(graph, s, { subject, count, targetP: 0.75 });

  if (!questions.length) {
    return setView(h('div.empty', null,
      h('div.empty__icon', null, '🔒'),
      h('p', null, 'Open a topic or two first — adaptive practice only draws from unlocked material.'),
      h('a.btn.btn--primary', { href: '#/' }, 'Back')));
  }

  const host = h('div');
  setView(h('div', null,
    h('div.page-head', null,
      h('div.page-head__eyebrow', null, subject ? SUBJECT_BY_ID[subject].name : 'All three subjects'),
      h('h1', null, 'Adaptive Practice'),
      h('p.page-head__sub', null, renderInline(
        'Questions are chosen by maximum information near your current ability, aiming for roughly a **75% success rate** — the band where learning per minute is highest.'))),
    host
  ), { read: true });

  live = createQuiz({
    host, questions, mode: 'practice', graph,
    onFinish(summary) {
      clear(host);
      host.appendChild(summaryCard(summary, {
        title: 'Practice complete',
        actions: [
          h('a.btn.btn--primary', { href: `#/practice?go=1${subject ? '&subject=' + subject : ''}` }, 'Another set'),
          h('a.btn.btn--ghost', { href: '#/progress' }, 'See progress')
        ]
      }));
      host.appendChild(abilityCard(graph, subject));
    }
  });
}

function practiceSetup(graph, s, subject) {
  return h('div', null,
    h('div.page-head', null,
      h('h1', null, 'Adaptive Practice'),
      h('p.page-head__sub', null, renderInline(
        'Mixed questions drawn from everything you have unlocked. Difficulty is chosen from your current ability estimate, so the set gets harder as you do.'))),

    h('div.card', null,
      h('h3', null, 'Pick a focus'),
      h('div.grid.grid--4', { style: { marginTop: 'var(--sp-4)' } },
        h('a.card.tilt.center', { href: '#/practice?go=1', style: { textDecoration: 'none', color: 'inherit' } },
          h('div', { style: { fontSize: '1.8rem' } }, '🌐'),
          h('strong', null, 'All subjects'),
          h('div.tiny.dim', null, 'mixed, exam-like')),
        ...SUBJECTS.map((sub) =>
          h('a.card.tilt.center', { href: `#/practice?go=1&subject=${sub.id}`, style: { textDecoration: 'none', color: 'inherit' } },
            h('div', { style: { fontSize: '1.8rem' } }, sub.icon),
            h('strong', null, sub.name),
            h('div.tiny.dim', null, abilityLabel(s, sub.id))))
      )),

    h('div.card', { style: { marginTop: 'var(--sp-4)' } },
      h('h3', null, 'How the selection works'),
      h('ol.small', null,
        h('li', null, renderInline('Every question carries an IRT difficulty $b$ and discrimination $a$.')),
        h('li', null, renderInline('Your ability $\\theta$ is re-estimated after every answer by expected a posteriori over a fixed grid.')),
        h('li', null, renderInline('The next question is drawn from the top few whose predicted success rate is closest to 75%, with a random tie-break so a repeat run is not identical.')),
        h('li', null, renderInline('Answers still feed the same BKT mastery and SM-2 schedule as a topic drill — nothing is wasted.'))))
  );
}

function abilityLabel(s, subject) {
  const a = s.ability[subject];
  const theta = typeof a === 'number' ? a : (a?.theta ?? 0);
  const n = a?.n ?? 0;
  if (n < 5) return 'not calibrated yet';
  return `ability θ = ${theta.toFixed(2)}`;
}

function abilityCard(graph, subject) {
  const s = get();
  const subs = subject ? [subject] : SUBJECTS.map((x) => x.id);
  return h('div.card', { style: { marginTop: 'var(--sp-4)' } },
    h('div.card__head', null, h('h3.card__title', null, 'Ability estimate')),
    h('div.stack-sm', null, subs.map((id) => {
      const a = s.ability[id];
      const theta = typeof a === 'number' ? a : (a?.theta ?? 0);
      const se = a?.se ?? 1;
      const n = a?.n ?? 0;
      const pct = Math.round(((theta + 3.5) / 7) * 100);
      return h('div', null,
        h('div.spread', { style: { marginBottom: '3px' } },
          h('span.small', null, SUBJECT_BY_ID[id].name),
          h('span.tiny.mono.dim', null, `θ ${theta >= 0 ? '+' : ''}${theta.toFixed(2)} ± ${se.toFixed(2)} (n=${n})`)),
        bar(pct, { hue: `var(--${id})`, height: 'sm' }));
    })),
    h('p.tiny.dim', { style: { marginTop: 'var(--sp-3)', marginBottom: 0 } },
      renderInline('$\\theta$ is on a standard-normal scale: 0 is average for this item bank, $+1$ is roughly the 84th percentile. The $\\pm$ is the standard error — it shrinks as you answer more.')));
}
