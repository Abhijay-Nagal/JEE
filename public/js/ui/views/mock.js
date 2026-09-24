/**
 * mock.js - a timed test under JEE Main marking.
 *
 * No feedback during the paper, a global clock, and +4 / -1 scoring. The
 * point is not more practice - it is rehearsing the two skills the drills
 * cannot teach: pacing, and deciding when to leave a question alone.
 */

import { h, clear } from '../../core/dom.js';
import { renderInline } from '../../core/mathlite.js';
import { get, logDay } from '../../core/store.js';
import { sfx } from '../../core/audio.js';
import { confetti } from '../../core/fx.js';
import { setView, setCrumbs } from '../shell.js';
import { SUBJECTS, SUBJECT_BY_ID, allQuestions } from '../../../data/registry.js';
import { adaptiveSet, shuffle } from '../../engine/recommender.js';
import { marksFor } from '../../engine/grader.js';
import { createQuiz } from '../components/quiz.js';
import { ring, subjectBars, dataTable, withTable } from '../components/charts.js';
import { confirm } from '../components/overlays.js';

let live = null;
let clockId = null;

export function disposeMock() {
  live?.destroy?.();
  live = null;
  if (clockId) { clearInterval(clockId); clockId = null; }
}

const PRESETS = [
  { id: 'sprint', n: 15, min: 20, label: 'Sprint', desc: '15 questions, 20 minutes' },
  { id: 'half', n: 30, min: 45, label: 'Half paper', desc: '30 questions, 45 minutes' },
  { id: 'full', n: 45, min: 75, label: 'Full mock', desc: '45 questions, 75 minutes' }
];

export function mockView(graph, query = {}) {
  disposeMock();
  setCrumbs([{ label: 'Command Deck', href: '#/' }, { label: 'Mock Test' }]);

  if (!query.go) return setView(setupScreen(graph));

  const preset = PRESETS.find((p) => p.id === query.preset) || PRESETS[0];
  runTest(graph, preset);
}

/* ------------------------------------------------------------------ */
/* setup                                                               */
/* ------------------------------------------------------------------ */

function setupScreen(graph) {
  const s = get();
  const available = allQuestions().length;

  return h('div', null,
    h('div.page-head', null,
      h('h1', null, 'Mock Test'),
      h('p.page-head__sub', null, renderInline(
        'JEE Main marking: **+4** for a correct answer, **−1** for a wrong MCQ, **0** for an unattempted one and for wrong numerical answers. No feedback until the paper ends.'))),

    h('div.grid.grid--3', null,
      PRESETS.map((p) =>
        h('a.card.tilt', { href: `#/mock?go=1&preset=${p.id}`, style: { textDecoration: 'none', color: 'inherit' } },
          h('div', { style: { fontSize: '1.8rem' } }, '⏱️'),
          h('h3', { style: { margin: '6px 0 2px' } }, p.label),
          h('div.small.muted', null, p.desc),
          h('div.tiny.dim', { style: { marginTop: '8px' } }, `${Math.round((p.min * 60) / p.n)}s per question`)))),

    h('div.card', { style: { marginTop: 'var(--sp-5)' } },
      h('h3', null, 'Before you start'),
      h('ul.small', null,
        h('li', null, renderInline(`Questions are drawn from the whole unlocked bank (${available} authored so far), weighted toward your current ability.`)),
        h('li', null, 'Negative marking is on. Guessing a 4-option MCQ at random has an expected value of exactly zero, so guess only when you can eliminate at least one option.'),
        h('li', null, 'Numerical questions carry no penalty. Always attempt them.'),
        h('li', null, renderInline('Mock answers **do not** enter the spaced-review schedule — a test is a measurement, not a study session. They still update your ability estimate.'))))
  );
}

/* ------------------------------------------------------------------ */
/* the paper                                                           */
/* ------------------------------------------------------------------ */

function runTest(graph, preset) {
  const s = get();

  // Draw proportionally from the three subjects, like the real paper.
  const perSubject = Math.ceil(preset.n / SUBJECTS.length);
  let questions = [];
  for (const sub of SUBJECTS) {
    questions.push(...adaptiveSet(graph, s, { subject: sub.id, count: perSubject, targetP: 0.6 }));
  }
  questions = shuffle(questions).slice(0, preset.n);

  if (questions.length < 5) {
    return setView(h('div.empty', null,
      h('div.empty__icon', null, '🔒'),
      h('p', null, 'Not enough unlocked questions for a mock yet. Open a few topics first.'),
      h('a.btn.btn--primary', { href: '#/' }, 'Back')));
  }

  let secondsLeft = preset.min * 60;
  const clockEl = h('span.timer', null, '⏱ ', h('span', null, fmtClock(secondsLeft)));

  const bar = h('div.card.card--pad-sm', {
    style: { position: 'sticky', top: 'calc(var(--topbar-h) + 8px)', zIndex: '20', marginBottom: 'var(--sp-4)' }
  },
    h('div.spread', null,
      h('div', null,
        h('div.tiny.dim', null, `${preset.label.toUpperCase()} · ${questions.length} QUESTIONS`),
        h('strong', null, 'Test in progress')),
      clockEl,
      h('button.btn.btn--sm.btn--danger', {
        onClick: async () => {
          if (await confirm({
            title: 'End the paper?',
            body: 'Unanswered questions score zero. You will see the full solutions immediately.',
            confirmLabel: 'End now', danger: true
          })) finish();
        }
      }, 'End test'))
  );

  const host = h('div');
  setView(h('div', null, bar, host), { read: true });

  clockId = setInterval(() => {
    secondsLeft -= 1;
    clockEl.lastChild.textContent = fmtClock(secondsLeft);
    clockEl.dataset.warn = String(secondsLeft <= 60);
    if (secondsLeft <= 0) { sfx.timeout(); finish(); }
  }, 1000);

  let summary = null;
  live = createQuiz({
    host, questions, mode: 'mock', graph,
    instantFeedback: false,
    onFinish(sum) { summary = sum; finish(sum); }
  });

  function finish(sum = null) {
    if (clockId) { clearInterval(clockId); clockId = null; }
    const results = sum?.results || live?.state.results || [];
    live?.destroy?.();
    live = null;
    bar.remove();
    showResult(graph, questions, results, preset);
  }
}

const fmtClock = (s) => {
  const t = Math.max(0, s);
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
};

/* ------------------------------------------------------------------ */
/* result                                                              */
/* ------------------------------------------------------------------ */

function showResult(graph, questions, results, preset) {
  const rows = questions.map((q, i) => {
    const r = results[i];
    const attempted = Boolean(r) && !r.skipped && r.given !== null && r.given !== undefined;
    const correct = Boolean(r?.correct);
    return { q, r, attempted, correct, marks: marksFor(q, correct, attempted) };
  });

  const total = rows.reduce((a, x) => a + x.marks, 0);
  const maxMarks = questions.length * 4;
  const attempted = rows.filter((x) => x.attempted).length;
  const correct = rows.filter((x) => x.correct).length;
  const wrong = attempted - correct;
  const pct = Math.max(0, Math.round((total / maxMarks) * 100));

  logDay((d) => { d.min += preset.min; });
  if (pct >= 70) confetti({ count: 140 });

  const bySubject = SUBJECTS.map((sub) => {
    const mine = rows.filter((x) => x.q.subject === sub.id);
    const got = mine.reduce((a, x) => a + x.marks, 0);
    return {
      subject: sub.id, name: sub.name,
      value: mine.length ? Math.max(0, (got / (mine.length * 4)) * 100) : 0,
      detail: `${got} / ${mine.length * 4} marks · ${mine.filter((x) => x.correct).length}/${mine.length} correct`
    };
  });

  const page = h('div', null,
    h('div.card.center', null,
      h('div.tiny.dim', null, `${preset.label.toUpperCase()} COMPLETE`),
      h('h1', { style: { fontSize: '3rem', margin: '6px 0' } }, `${total}`),
      h('div.muted', null, `out of ${maxMarks} marks`),
      h('div', { style: { display: 'flex', justifyContent: 'center', marginTop: 'var(--sp-4)' } },
        ring(pct, { size: 96, label: `${pct}%`, hue: pct >= 70 ? 'var(--ok)' : pct >= 40 ? 'var(--warn)' : 'var(--bad)' })),
      h('div.grid.grid--4', { style: { marginTop: 'var(--sp-5)' } },
        stat(String(attempted), 'attempted'),
        stat(String(correct), 'correct'),
        stat(String(wrong), 'wrong'),
        stat(`−${wrong}`, 'negative marks'))
    ),

    h('div.card', { style: { marginTop: 'var(--sp-4)' } },
      h('div.card__head', null, h('h3.card__title', null, 'By subject')),
      subjectBars(bySubject, { max: 100, unit: '%' })),

    strategyCard(rows, attempted, correct, wrong),

    h('section.section', null,
      h('div.section__head', null, h('h2', null, 'Every question')),
      withTable(
        answerList(rows),
        ['#', 'Subject', 'Tier', 'Your answer', 'Correct', 'Marks'],
        rows.map((x, i) => [
          i + 1,
          SUBJECT_BY_ID[x.q.subject]?.name || x.q.subject,
          x.q.tier,
          x.attempted ? shortAnswer(x.q, x.r.given) : 'not attempted',
          shortAnswer(x.q, x.q.answer),
          x.marks
        ])
      )),

    h('div.btnbar', { style: { marginTop: 'var(--sp-5)', justifyContent: 'center' } },
      h('a.btn.btn--primary', { href: '#/mock' }, 'Another mock'),
      h('a.btn.btn--ghost', { href: '#/progress' }, 'See progress'))
  );

  setView(page, { read: true });
}

function strategyCard(rows, attempted, correct, wrong) {
  const notes = [];
  const skipped = rows.length - attempted;

  if (wrong > correct * 0.6 && attempted > 5) {
    notes.push('You are **over-attempting**. With negative marking, a question you cannot narrow to two options is worth less than leaving blank.');
  }
  if (skipped > rows.length * 0.4) {
    notes.push('You left a lot blank. Numerical questions carry **no penalty** — those should always be attempted, even on a guess.');
  }
  const numericWrong = rows.filter((x) => !x.correct && x.attempted && (x.q.kind === 'numeric' || x.q.kind === 'integer')).length;
  if (numericWrong > 2) {
    notes.push(`${numericWrong} numerical answers were wrong. These cost nothing to attempt but they also reward precision — check your significant figures and units before entering.`);
  }
  const hardAttempts = rows.filter((x) => x.q.tier === 'H' && x.attempted);
  const hardRight = hardAttempts.filter((x) => x.correct).length;
  if (hardAttempts.length >= 3 && hardRight / hardAttempts.length < 0.3) {
    notes.push('Hurdle-tier questions are costing you more marks than they earn. In a real paper, sweep the easy questions first and return to these only with time left over.');
  }
  if (!notes.length) {
    notes.push('Attempt pattern looks sound — you attempted what you could and left what you could not.');
  }

  return h('div.card', { style: { marginTop: 'var(--sp-4)' } },
    h('div.card__head', null, h('h3.card__title', null, 'Exam strategy')),
    h('ul.small', null, notes.map((n) => h('li', null, renderInline(n)))));
}

function answerList(rows) {
  return h('div.stack-sm', null, rows.map((x, i) => {
    const t = x.q;
    const tone = !x.attempted ? 'var(--ink-4)' : x.correct ? 'var(--ok)' : 'var(--bad)';
    return h('details.card.card--pad-sm', null,
      h('summary', { style: { cursor: 'pointer', display: 'flex', gap: '10px', alignItems: 'center' } },
        h('span.mono.small', { style: { color: tone, fontWeight: '800', minWidth: '28px' } },
          x.attempted ? (x.correct ? '✓' : '✗') : '–'),
        h('span.small', { style: { flex: 1 } }, `Q${i + 1} · ${SUBJECT_BY_ID[t.subject]?.name} · ${t.tier}`),
        h('span.mono.tiny', { style: { color: tone } }, `${x.marks >= 0 ? '+' : ''}${x.marks}`)),
      h('div', { style: { marginTop: 'var(--sp-3)' } },
        h('div', { style: { marginBottom: 'var(--sp-3)' } }, renderInline(t.stem)),
        t.options
          ? h('ul.small', null, t.options.map((o, oi) =>
              h('li', {
                style: {
                  color: oi === t.answer ? 'var(--ok)' : (x.attempted && oi === x.r.given ? 'var(--bad)' : 'inherit'),
                  fontWeight: oi === t.answer ? '700' : '400'
                }
              }, renderInline(o))))
          : h('p.small', null, renderInline(`Correct answer: **${t.answer}**${t.unit ? ' ' + t.unit : ''}`)),
        h('div.divider-label', null, 'solution'),
        h('ol.small', null, (t.solution || []).map((st) => h('li', null, renderInline(st))))));
  }));
}

function shortAnswer(q, given) {
  if (given === null || given === undefined) return '—';
  if (q.options && typeof given === 'number') return ['A', 'B', 'C', 'D', 'E'][given] || String(given);
  if (Array.isArray(given)) return given.map((i) => ['A', 'B', 'C', 'D', 'E'][i]).join(',');
  return String(given);
}

const stat = (v, k) => h('div.statbox', null, h('div.statbox__v', null, v), h('div.statbox__k', null, k));
