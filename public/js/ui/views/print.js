/**
 * print.js - the Print Pack builder.
 *
 * Generates real A4 paper: a formula sheet, lesson notes, a question paper
 * with an OMR grid, the answer key with full solutions, and a personalised
 * weak-areas worksheet built from the learner's own error history.
 *
 * Everything is rendered as ordinary DOM inside `.paper` blocks; css/print.css
 * turns those into printed pages and strips the app chrome.
 */

import { h, clear } from '../../core/dom.js';
import { renderInline, renderMath, toPlain } from '../../core/mathlite.js';
import { get, update, dayKey } from '../../core/store.js';
import { setView, setCrumbs } from '../shell.js';
import { CHAPTERS, getChapter, getTopic, topicsOf, SUBJECT_BY_ID, TIERS } from '../../../data/registry.js';
import { weakest, troubleItems } from '../../engine/analytics.js';
import { shuffle } from '../../engine/recommender.js';
import { checkAchievements } from '../../engine/achievements.js';
import { renderBlock } from '../components/lesson.js';
import { toast } from '../components/overlays.js';

const KEYS = ['A', 'B', 'C', 'D'];

export function printView(graph, query = {}) {
  setCrumbs([{ label: 'Command Deck', href: '#/' }, { label: 'Print Pack' }]);

  const opts = {
    chapterId: query.chapter || (query.topic ? getTopic(query.topic)?.chapterId : null) || CHAPTERS[0].id,
    topicId: query.topic || null,
    formula: true,
    notes: Boolean(query.topic),
    paper: true,
    key: true,
    weak: false,
    tiers: { G: true, M: true, H: true },
    count: 15,
    workSpace: true
  };

  const output = h('div');

  const page = h('div', null,
    h('div.page-head.no-print', null,
      h('h1', null, 'Print Pack'),
      h('p.page-head__sub', null, renderInline(
        'Build a paper pack for offline revision. Everything is generated from the same content the app uses, so the question numbering and the answer key always agree.'))),

    h('div.card.no-print', null, controls(graph, opts, () => build(graph, opts, output))),
    output
  );

  setView(page, { wide: true });
  build(graph, opts, output);
}

/* ------------------------------------------------------------------ */
/* controls                                                            */
/* ------------------------------------------------------------------ */

function controls(graph, opts, rebuild) {
  const chapterSel = h('select.select', {
    onChange: (e) => { opts.chapterId = e.target.value; opts.topicId = null; topicSel.value = ''; refreshTopics(); rebuild(); }
  }, CHAPTERS.map((c) => h('option', { value: c.id, selected: c.id === opts.chapterId },
    `${SUBJECT_BY_ID[c.subject].name} — ${c.title}`)));

  const topicSel = h('select.select', {
    onChange: (e) => { opts.topicId = e.target.value || null; opts.notes = Boolean(opts.topicId); rebuild(); }
  });

  function refreshTopics() {
    clear(topicSel);
    topicSel.appendChild(h('option', { value: '' }, 'Whole chapter'));
    for (const t of topicsOf(opts.chapterId)) {
      topicSel.appendChild(h('option', { value: t.id, selected: t.id === opts.topicId }, t.title));
    }
  }
  refreshTopics();

  const check = (label, key, desc) => h('label.switchrow', { style: { cursor: 'pointer' } },
    h('div', null,
      h('div.switchrow__label', null, label),
      desc ? h('div.switchrow__desc', null, desc) : null),
    h('input', {
      type: 'checkbox', checked: opts[key],
      onChange: (e) => { opts[key] = e.target.checked; rebuild(); }
    }));

  const tierCheck = (k) => h('label', { style: { display: 'inline-flex', gap: '6px', alignItems: 'center', cursor: 'pointer' } },
    h('input', {
      type: 'checkbox', checked: opts.tiers[k],
      onChange: (e) => { opts.tiers[k] = e.target.checked; rebuild(); }
    }),
    h('span.tag' + `.tag--${k.toLowerCase()}`, null, `${k} · ${TIERS[k].name}`));

  return h('div', null,
    h('div.grid.grid--2', null,
      h('div.field', null, h('label', null, 'Chapter'), chapterSel),
      h('div.field', null, h('label', null, 'Scope'), topicSel)),

    h('div.grid.grid--2', { style: { marginTop: 'var(--sp-3)' } },
      h('div', null,
        h('div.tiny.dim', { style: { marginBottom: '6px' } }, 'SECTIONS'),
        check('Formula sheet', 'formula', 'Two-column quick reference'),
        check('Lesson notes', 'notes', 'The full written explanation'),
        check('Question paper', 'paper', 'With an OMR answer grid'),
        check('Answer key & solutions', 'key', 'Print separately and keep it face down'),
        check('My weak areas', 'weak', 'A worksheet built from your own errors')),
      h('div', null,
        h('div.tiny.dim', { style: { marginBottom: '6px' } }, 'QUESTION PAPER'),
        h('div.row-wrap', { style: { marginBottom: 'var(--sp-4)' } }, tierCheck('G'), tierCheck('M'), tierCheck('H')),
        h('div.field', null,
          h('label', null, `Number of questions: ${opts.count}`),
          h('input', {
            type: 'range', min: 5, max: 40, step: 5, value: opts.count,
            style: { width: '100%' },
            onInput: (e) => {
              opts.count = Number(e.target.value);
              e.target.previousElementSibling.textContent = `Number of questions: ${opts.count}`;
              rebuild();
            }
          })),
        check('Leave working space', 'workSpace', 'A blank box under each question'))),

    h('div.btnbar', { style: { marginTop: 'var(--sp-4)' } },
      h('button.btn.btn--primary.btn--lg', {
        onClick: () => {
          update((st) => { st.printCount = (st.printCount || 0) + 1; });
          checkAchievements(null, {});
          toast({ kind: 'ok', icon: '🖨️', text: 'Opening the print dialog — choose "Save as PDF" to keep a copy.' });
          setTimeout(() => window.print(), 350);
        }
      }, '🖨️ Print / Save as PDF'),
      h('span.small.muted', null, 'Tip: turn on "Background graphics" for the shaded boxes.')));
}

/* ------------------------------------------------------------------ */
/* builder                                                             */
/* ------------------------------------------------------------------ */

function build(graph, opts, output) {
  clear(output);
  const ch = getChapter(opts.chapterId);
  if (!ch) return;
  const topic = opts.topicId ? getTopic(opts.topicId) : null;
  const scope = topic ? [topic] : topicsOf(ch.id);

  const pool = scope
    .flatMap((t) => (t.questions || []).map((q) => ({ ...q, topicTitle: t.title })))
    .filter((q) => opts.tiers[q.tier]);
  const chosen = shuffle(pool).slice(0, opts.count)
    .sort((a, b) => 'GMH'.indexOf(a.tier) - 'GMH'.indexOf(b.tier));

  if (opts.formula) output.appendChild(formulaSheet(ch, topic));
  if (opts.notes && topic) output.appendChild(notesSheet(ch, topic));
  if (opts.paper && chosen.length) output.appendChild(questionPaper(ch, topic, chosen, opts));
  if (opts.key && chosen.length) output.appendChild(answerKey(ch, chosen));
  if (opts.weak) output.appendChild(weakSheet(graph));

  if (!output.children.length) {
    output.appendChild(h('div.empty.no-print', null, h('p', null, 'Select at least one section.')));
  }
}

/* ------------------------------------------------------------------ */
/* sheets                                                              */
/* ------------------------------------------------------------------ */

function paper(title, subtitle, ...body) {
  return h('div.paper', null,
    h('div.paper__head', null,
      h('div.paper__brand', null, 'JEE ASCENT', h('small', null, 'The Aryabhata Protocol')),
      h('div.paper__meta', null,
        h('div', null, title),
        subtitle ? h('div', null, subtitle) : null,
        h('div', null, new Date().toLocaleDateString()))),
    ...body,
    h('div.paper__foot', null,
      h('span', null, title),
      h('span', null, 'Generated by JEE ASCENT · offline study pack')));
}

function formulaSheet(ch, topic) {
  const list = topic
    ? (topic.formulas || [])
    : (ch.formulaSheet || []);

  return h('div', null, paper(
    'Formula sheet',
    `${SUBJECT_BY_ID[ch.subject].name} · ${topic ? topic.title : ch.title}`,
    h('h1', null, topic ? topic.title : ch.title),
    h('p', { style: { marginTop: '-2mm' } }, 'Quick reference — fold and keep.'),
    h('div.formula-sheet', null,
      list.map((f) => h('div.fs-item', null,
        h('div.fs-name', null, toPlain(f.name || '')),
        h('div.fs-eq', null, renderMath(f.tex)),
        f.note ? h('div.fs-note', null, renderInline(f.note)) : null)))
  ), h('div.pagebreak'));
}

function notesSheet(ch, topic) {
  return h('div', null, paper(
    'Lesson notes',
    `${SUBJECT_BY_ID[ch.subject].name} · ${ch.title}`,
    h('h1', null, topic.title),
    h('p', null, topic.short),
    h('div', null, (topic.lesson || [])
      .filter((b) => b.t !== 'sim')
      .map((b) => (b.t === 'anim'
        // Animations cannot print. Say so rather than silently dropping the
        // idea they were carrying.
        ? h('p', { style: { fontStyle: 'italic', fontSize: '9pt', color: '#555' } },
            '[ An animation explains this step in the app. ]')
        : renderBlock(b)))),
    h('h2', null, 'Notes'),
    h('div.notes-lines')
  ), h('div.pagebreak'));
}

function questionPaper(ch, topic, questions, opts) {
  const marks = questions.length * 4;
  const mins = Math.round(questions.reduce((a, q) => a + (q.parSec || 90), 0) / 60);

  return h('div', null, paper(
    'Question paper',
    `${questions.length} questions · ${marks} marks`,
    h('h1', null, topic ? topic.title : ch.title),
    h('div.paper__fields', null,
      h('span', null, 'Name:'),
      h('span', null, 'Date:'),
      h('span', null, `Time allowed: ${mins} min`)),
    h('p', { style: { fontSize: '9pt' } },
      'Marking: +4 for a correct answer, −1 for an incorrect multiple-choice answer, 0 for an unattempted question and for incorrect numerical answers. Shade one bubble per question on the grid below.'),

    h('div', null, questions.map((q, i) => h('div.q', null,
      h('div.q__n', null, `${i + 1}.`),
      h('div.q__body', null,
        h('div', null,
          renderInline(q.stem),
          h('span.q__tier', null, q.tier)),
        q.options
          ? h('div.q__opts', null, q.options.map((o, oi) =>
              h('div.q__opt', null, h('b', null, `(${KEYS[oi]})`), renderInline(o))))
          : h('div.q__opt', { style: { marginTop: '1.5mm' } }, 'Answer: ____________________'),
        opts.workSpace ? h('div.q__work') : null)))),

    h('h2', null, 'Answer grid'),
    h('div.omr', null, questions.map((q, i) =>
      h('div.omr__row', null,
        h('b', null, `${i + 1}`),
        q.options
          ? q.options.map((_, oi) => h('span.omr__b', null, KEYS[oi]))
          : h('span', { style: { borderBottom: '.5pt solid #333', minWidth: '22mm', display: 'inline-block' } }, ''))))
  ), h('div.pagebreak'));
}

function answerKey(ch, questions) {
  return h('div', null, paper(
    'Answer key & solutions',
    `${questions.length} questions`,
    h('h1', null, 'Answer key'),
    h('p', { style: { fontSize: '9pt' } }, 'Keep this sheet face down until you have finished the paper.'),

    h('table.keytable', null,
      h('thead', null, h('tr', null,
        h('th', null, 'Q'), h('th', null, 'Ans'), h('th', null, 'Tier'),
        h('th', null, 'Q'), h('th', null, 'Ans'), h('th', null, 'Tier'))),
      h('tbody', null, pairRows(questions))),

    h('h2', null, 'Worked solutions'),
    h('div', null, questions.map((q, i) => h('div.q', { style: { breakInside: 'avoid' } },
      h('div.q__n', null, `${i + 1}.`),
      h('div.q__body', null,
        h('div', { style: { fontWeight: '700', marginBottom: '1.5mm' } },
          `Answer: ${answerLabel(q)}`,
          h('span.q__tier', null, q.tier)),
        h('ol', { style: { margin: '0', paddingLeft: '5mm', fontSize: '9.5pt' } },
          (q.solution || []).map((s) => h('li', null, renderInline(s))))))))
  ), h('div.pagebreak'));
}

function pairRows(questions) {
  const rows = [];
  const half = Math.ceil(questions.length / 2);
  for (let i = 0; i < half; i++) {
    const a = questions[i], b = questions[i + half];
    rows.push(h('tr', null,
      h('td', null, String(i + 1)), h('td', null, answerLabel(a)), h('td', null, a.tier),
      b ? h('td', null, String(i + half + 1)) : h('td', null, ''),
      b ? h('td', null, answerLabel(b)) : h('td', null, ''),
      b ? h('td', null, b.tier) : h('td', null, '')));
  }
  return rows;
}

function answerLabel(q) {
  if (!q) return '';
  if (q.kind === 'mcq') return KEYS[q.answer] || String(q.answer);
  if (q.kind === 'multi') return (q.answer || []).map((i) => KEYS[i]).join(',');
  return String(q.answer) + (q.unit ? ' ' + q.unit : '');
}

/* ------------------------------------------------------------------ */
/* personalised worksheet                                              */
/* ------------------------------------------------------------------ */

function weakSheet(graph) {
  const s = get();
  const weak = weakest(graph, s, 8);
  const trouble = troubleItems(graph, s, 10);

  if (!weak.length && !trouble.length) {
    return h('div.paper', null,
      h('h1', null, 'My weak areas'),
      h('p', null, 'Not enough data yet — answer some questions and this sheet will fill itself in.'));
  }

  return h('div', null, paper(
    'Personalised worksheet',
    `Generated ${dayKey()}`,
    h('h1', null, 'My weak areas'),
    h('p', null, 'Built from your own answer history: the concepts with the lowest time-decayed mastery, and the specific questions that keep catching you.'),

    weak.length ? h('div', null,
      h('h2', null, 'Concepts to shore up'),
      h('table.keytable', { style: { textAlign: 'left' } },
        h('thead', null, h('tr', null,
          h('th', { style: { textAlign: 'left' } }, 'Concept'),
          h('th', null, 'Mastery'), h('th', null, 'Attempts'), h('th', null, 'Accuracy'))),
        h('tbody', null, weak.map((w) => h('tr', null,
          h('td', { style: { textAlign: 'left' } }, w.name),
          h('td', null, `${Math.round(w.mastery * 100)}%`),
          h('td', null, String(w.attempts)),
          h('td', null, `${Math.round(w.accuracy * 100)}%`)))))) : null,

    trouble.length ? h('div', null,
      h('h2', null, 'Questions to re-attempt'),
      h('div', null, trouble.map((x, i) => h('div.q', null,
        h('div.q__n', null, `${i + 1}.`),
        h('div.q__body', null,
          h('div', null, renderInline(x.q.stem), h('span.q__tier', null, x.q.tier)),
          x.q.options
            ? h('div.q__opts', null, x.q.options.map((o, oi) =>
                h('div.q__opt', null, h('b', null, `(${KEYS[oi]})`), renderInline(o))))
            : h('div.q__opt', { style: { marginTop: '1.5mm' } }, 'Answer: ____________________'),
          h('div.q__work'))))),
      h('h2', null, 'Answers'),
      h('p', { style: { fontSize: '9pt' } },
        trouble.map((x, i) => `${i + 1}. ${answerLabel(x.q)}`).join('    ·    '))) : null
  ));
}
