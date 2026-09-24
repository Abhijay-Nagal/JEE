/**
 * quiz.js - the question runner used by every mode.
 *
 * Topic drills, spaced review, adaptive practice, boss battles and mock tests
 * all render through this one component, differing only in configuration.
 * That is deliberate: it means a fix to the numeric-answer parser or the
 * explanation layout lands everywhere at once.
 */

import { h, clear, append } from '../../core/dom.js';
import { renderInline, renderMath } from '../../core/mathlite.js';
import { sfx } from '../../core/audio.js';
import { burstAt, floatXP, shake } from '../../core/fx.js';
import { get, topicRec } from '../../core/store.js';
import { gradeAnswer, isCorrect } from '../../engine/grader.js';
import { reportCombo } from '../../engine/quests.js';
import { checkAchievements } from '../../engine/achievements.js';
import { TIERS } from '../../../data/syllabus.js';
import { toast } from './overlays.js';

const KEY_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

/**
 * @param {object} o
 * @param {HTMLElement} o.host
 * @param {Array} o.questions
 * @param {string} [o.mode] drill | review | practice | boss | mock
 * @param {object} [o.graph]
 * @param {string} [o.topicId]
 * @param {boolean} [o.instantFeedback] false for mock tests
 * @param {number} [o.perQuestionSec] 0 = untimed
 * @param {(result, index) => void} [o.onAnswer]
 * @param {(summary) => void} [o.onFinish]
 */
export function createQuiz({
  host,
  questions,
  mode = 'drill',
  graph = null,
  topicId = null,
  instantFeedback = true,
  perQuestionSec = 0,
  onAnswer = null,
  onFinish = null
}) {
  const state = {
    i: 0,
    combo: 0,
    bestCombo: 0,
    correct: 0,
    usedHintOn: new Set(),
    attempts: 0,
    startedAt: Date.now(),
    qStartedAt: Date.now(),
    results: [],
    selection: null,
    locked: false,
    timerId: null,
    timeLeft: 0,
    noHintRun: 0,
    flawless: true
  };

  const root = h('div.quiz');
  host.appendChild(root);

  // Declared before the first render(): the `ref` callbacks below assign to
  // them while that first render is still running, which would otherwise hit
  // the temporal dead zone.
  let submitBtn = null;
  let timerEl = null;
  let numInput = null;
  let keyHandler = null;

  render();

  /* ================================================================ */

  function current() { return questions[state.i]; }

  function render() {
    clear(root);
    stopTimer();

    if (state.i >= questions.length) return finish();

    const q = current();
    state.selection = q.kind === 'multi' ? new Set() : null;
    state.locked = false;
    state.attempts = 0;
    state.qStartedAt = Date.now();

    root.appendChild(metaBar(q));
    root.appendChild(h('div.quiz__stem', null, renderInline(q.stem)));

    if (q.image) root.appendChild(h('div', { style: { margin: '0 0 16px' } }, q.image));

    root.appendChild(answerArea(q));

    const bar = h('div.btnbar');
    if (q.hint && !get().settings.hardMode) {
      bar.appendChild(h('button.btn.btn--ghost', { onClick: () => showHint(q) }, '💡 Hint'));
    }
    bar.appendChild(h('button.btn.btn--primary.btn--lg', {
      ref: (el) => { submitBtn = el; },
      onClick: () => submit(q)
    }, instantFeedback ? 'Check answer' : 'Save and continue'));

    if (!instantFeedback) {
      bar.appendChild(h('button.btn.btn--quiet', { onClick: () => { record(q, null); next(); } }, 'Skip'));
    }
    root.appendChild(bar);

    if (perQuestionSec > 0) startTimer(q);
    installKeys(q);
  }


  /* ---------------- chrome ---------------- */

  function metaBar(q) {
    const tier = TIERS[q.tier] || TIERS.M;
    const dots = h('div.progressdots', null,
      questions.map((_, i) =>
        h('i', {
          class: i < state.i ? (state.results[i]?.correct ? 'ok' : 'no') : i === state.i ? 'cur' : ''
        })));

    return h('div.quiz__meta', null,
      h('span.tag' + `.tag--${q.tier.toLowerCase()}`, null, `${q.tier} · ${tier.name}`),
      h('span.small.muted', null, `${state.i + 1} of ${questions.length}`),
      dots,
      state.combo > 1
        ? h('span.combo', { dataset: { hot: 'true' } }, h('span.combo__x', null, `×${state.combo}`), h('span.tiny', null, 'combo'))
        : null,
      perQuestionSec > 0 ? h('span.timer', { ref: (el) => { timerEl = el; } }, '⏱ ', h('span', null, String(perQuestionSec))) : null
    );
  }


  function answerArea(q) {
    switch (q.kind || 'mcq') {
      case 'mcq': return mcqOptions(q, false);
      case 'multi': return mcqOptions(q, true);
      case 'numeric':
      case 'integer': return numericInput(q);
      default: return h('div.empty', null, `Unsupported question type "${q.kind}".`);
    }
  }

  function mcqOptions(q, multi) {
    const box = h('div.opts', { role: multi ? 'group' : 'radiogroup' });
    q.options.forEach((opt, idx) => {
      const btn = h('button.opt', {
        role: multi ? 'checkbox' : 'radio',
        'aria-checked': 'false',
        dataset: { idx: String(idx) },
        onClick: () => choose(idx, btn, multi)
      },
        h('span.opt__key', null, KEY_LETTERS[idx]),
        h('span', null, renderInline(opt))
      );
      box.appendChild(btn);
    });
    return box;
  }

  function numericInput(q) {
    const input = h('input', {
      type: 'text', inputmode: 'decimal', autocomplete: 'off',
      placeholder: q.kind === 'integer' ? 'whole number' : 'numerical value',
      'aria-label': 'Your answer',
      ref: (el) => { numInput = el; },
      onInput: (e) => { state.selection = e.target.value; },
      onKeyDown: (e) => { if (e.key === 'Enter') submit(q); }
    });
    setTimeout(() => input.focus(), 50);
    return h('div.numinput', null, input, q.unit ? h('span.unit', null, q.unit) : null);
  }


  function choose(idx, btn, multi) {
    if (state.locked) return;
    sfx.click();
    if (multi) {
      if (state.selection.has(idx)) { state.selection.delete(idx); btn.setAttribute('aria-checked', 'false'); }
      else { state.selection.add(idx); btn.setAttribute('aria-checked', 'true'); }
    } else {
      state.selection = idx;
      root.querySelectorAll('.opt').forEach((b) => b.setAttribute('aria-checked', 'false'));
      btn.setAttribute('aria-checked', 'true');
    }
  }

  /* ---------------- keyboard ---------------- */

  function installKeys(q) {
    if (keyHandler) document.removeEventListener('keydown', keyHandler);
    keyHandler = (e) => {
      if (e.target.matches('input, textarea')) return;
      if (state.locked) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); next(); }
        return;
      }
      const letter = KEY_LETTERS.indexOf(e.key.toUpperCase());
      if (letter !== -1 && q.options && letter < q.options.length) {
        e.preventDefault();
        const btn = root.querySelector(`.opt[data-idx="${letter}"]`);
        if (btn) choose(letter, btn, q.kind === 'multi');
      }
      if (e.key === 'Enter') { e.preventDefault(); submit(q); }
    };
    document.addEventListener('keydown', keyHandler);
  }

  /* ---------------- timer ---------------- */

  function startTimer(q) {
    state.timeLeft = perQuestionSec;
    state.timerId = setInterval(() => {
      state.timeLeft -= 1;
      if (timerEl) {
        timerEl.lastChild.textContent = String(Math.max(0, state.timeLeft));
        timerEl.dataset.warn = String(state.timeLeft <= 5);
      }
      if (state.timeLeft <= 0) {
        stopTimer();
        sfx.timeout();
        submit(q, { timedOut: true });
      }
    }, 1000);
  }

  function stopTimer() {
    if (state.timerId) { clearInterval(state.timerId); state.timerId = null; }
  }

  /* ---------------- hint ---------------- */

  function showHint(q) {
    if (state.usedHintOn.has(q.id)) return;
    state.usedHintOn.add(q.id);
    state.noHintRun = 0;
    sfx.pop();
    const box = h('div.hintbox', null,
      h('div.hintbox__label', null, 'Hint'),
      h('div.small', null, renderInline(q.hint)));
    root.insertBefore(box, root.querySelector('.opts, .numinput'));
  }

  /* ---------------- grading ---------------- */

  function submit(q, { timedOut = false } = {}) {
    if (state.locked) return next();

    const given = q.kind === 'multi' ? [...state.selection] : state.selection;
    if (!timedOut && (given === null || given === undefined || given === '' || (Array.isArray(given) && !given.length))) {
      toast({ kind: 'info', text: 'Choose an answer first.' , ms: 1800});
      return;
    }

    stopTimer();
    state.locked = true;
    if (keyHandler) { /* keep for Enter-to-continue */ }

    const ms = Date.now() - state.qStartedAt;
    const result = gradeAnswer({
      q,
      given: timedOut ? null : given,
      ms,
      usedHint: state.usedHintOn.has(q.id),
      combo: state.combo,
      mode,
      graph,
      topicId: topicId || q.topicId || null,
      attempts: state.attempts + 1
    });

    if (result.correct) {
      state.correct++;
      state.combo++;
      state.noHintRun += state.usedHintOn.has(q.id) ? 0 : 1;
      state.bestCombo = Math.max(state.bestCombo, state.combo);
      reportCombo(state.combo);
      sfx.correct(Math.min(state.combo, 10));
      floatXP(result.xp);
    } else {
      state.combo = 0;
      state.noHintRun = 0;
      state.flawless = false;
      sfx.wrong();
      if (perQuestionSec > 0) shake(5);
    }

    state.results[state.i] = result;
    record(q, result);
    onAnswer?.(result, state.i);

    checkAchievements(graph, {
      bestCombo: state.bestCombo,
      fastMastery: result.correct && q.tier === 'M' && ms < 20000,
      noHintRun: state.noHintRun,
      comeback: result.correct && (get().items[q.id]?.seen ?? 0) > 2 && (get().items[q.id]?.correct ?? 0) <= 1
    });

    if (instantFeedback) revealAnswer(q, result);
    else next();
  }

  function record(q, result) {
    // Keeps the per-question log even when feedback is deferred (mock mode).
    state.results[state.i] = result || { correct: false, skipped: true, question: q };
  }

  /* ---------------- reveal ---------------- */

  function revealAnswer(q, result) {
    // Colour the options.
    if (q.options) {
      root.querySelectorAll('.opt').forEach((btn) => {
        const idx = Number(btn.dataset.idx);
        btn.disabled = true;
        const isAns = q.kind === 'multi' ? (q.answer || []).includes(idx) : idx === q.answer;
        const picked = q.kind === 'multi' ? state.selection.has(idx) : idx === state.selection;
        if (isAns && picked) btn.dataset.state = 'correct';
        else if (isAns) btn.dataset.state = 'missed';
        else if (picked) { btn.dataset.state = 'wrong'; btn.classList.add('shake'); }
      });
    }
    if (numInput) numInput.disabled = true;

    if (result.correct) {
      const el = root.querySelector('.opt[data-state="correct"]') || root.querySelector('.numinput');
      burstAt(el, { count: 16, power: 6 });
    }

    // Replace the action bar with the explanation.
    root.querySelector('.btnbar')?.remove();
    root.appendChild(explanation(q, result));

    const cont = h('div.btnbar', { style: { marginTop: '16px' } },
      h('button.btn.btn--primary.btn--lg', { onClick: next },
        state.i + 1 >= questions.length ? 'See results' : 'Next question'),
      h('button.btn.btn--quiet', {
        onClick: () => {
          const rec = get().items[q.id];
          if (rec) { rec.flagged = !rec.flagged; toast({ kind: 'info', text: rec.flagged ? 'Flagged for review.' : 'Flag removed.', ms: 1600 }); }
        }
      }, '⚑ Flag')
    );
    root.appendChild(cont);
    setTimeout(() => cont.querySelector('.btn--primary')?.focus(), 80);
  }

  function explanation(q, result) {
    const body = h('div.verdict__body');

    if (!result.correct) {
      body.appendChild(h('p', null, renderInline(
        `Correct answer: **${answerText(q)}**`)));
    }

    const steps = h('ol', { style: { marginTop: '10px' } },
      (q.solution || []).map((s) => h('li', null, renderInline(s))));
    body.appendChild(steps);

    if (result.diagnosis) {
      body.appendChild(h('div.callout.callout--jee', { style: { marginTop: '14px', marginBottom: 0 } },
        h('div.callout__label', null, '🔍 Diagnosis'),
        h('div.small', null, renderInline(result.diagnosis.message)),
        result.diagnosis.topicId
          ? h('a.btn.btn--sm.btn--ghost', {
              href: linkToTopic(result.diagnosis.topicId),
              style: { marginTop: '8px' }
            }, 'Revisit that topic')
          : null
      ));
    }

    if (result.masteryAfter?.length) {
      const m = result.masteryAfter[0];
      body.appendChild(h('div.small.muted', { style: { marginTop: '12px' } },
        renderInline(`Mastery of *${graph?.kcs.get(m.id)?.name || 'this concept'}*: **${Math.round(m.p * 100)}%** (${m.gain >= 0 ? '+' : ''}${Math.round(m.gain * 100)} pts)`)));
    }

    return h('div.verdict' + (result.correct ? '.verdict--ok' : '.verdict--bad'), null,
      h('div.verdict__head', null,
        result.correct ? `✓ Correct  ·  +${result.xp} XP` : '✗ Not quite'),
      body);
  }

  function answerText(q) {
    if (q.kind === 'mcq') return `${KEY_LETTERS[q.answer]}. ${stripMath(q.options[q.answer])}`;
    if (q.kind === 'multi') return (q.answer || []).map((i) => KEY_LETTERS[i]).join(', ');
    return String(q.answer) + (q.unit ? ' ' + q.unit : '');
  }
  const stripMath = (s) => String(s).replace(/\$/g, '');

  function linkToTopic(tid) {
    const t = graph?.topics.get(tid);
    return t ? `#/topic/${t.subject}/${t.chapterId}/${t.id}` : '#/';
  }

  /* ---------------- flow ---------------- */

  function next() {
    state.i++;
    render();
  }

  function finish() {
    stopTimer();
    if (keyHandler) { document.removeEventListener('keydown', keyHandler); keyHandler = null; }

    const total = questions.length;
    const summary = {
      total,
      correct: state.correct,
      accuracy: total ? state.correct / total : 0,
      bestCombo: state.bestCombo,
      durationMs: Date.now() - state.startedAt,
      results: state.results,
      flawless: state.flawless && total >= 8,
      hintsUsed: state.usedHintOn.size,
      xp: state.results.reduce((a, r) => a + (r?.xp || 0), 0)
    };

    checkAchievements(graph, {
      bestCombo: state.bestCombo,
      flawlessRun: summary.flawless ? total : 0,
      noHintRun: summary.hintsUsed === 0 ? total : 0,
      speedRun: total >= 10 && summary.durationMs < 360000 && summary.accuracy >= 0.8
    });

    if (topicId) {
      const rec = topicRec(topicId);
      if (summary.accuracy >= 0.7 && !rec.done) { rec.done = true; rec.doneAt = Date.now(); }
    }

    onFinish?.(summary);
  }

  return {
    root,
    destroy() {
      stopTimer();
      if (keyHandler) document.removeEventListener('keydown', keyHandler);
      root.remove();
    },
    get state() { return state; }
  };
}

/* ------------------------------------------------------------------ */
/* summary card                                                        */
/* ------------------------------------------------------------------ */

export function summaryCard(summary, { title = 'Set complete', actions = [] } = {}) {
  const pct = Math.round(summary.accuracy * 100);
  const grade = pct >= 90 ? { t: 'Outstanding', c: 'var(--accent)' }
    : pct >= 75 ? { t: 'Strong', c: 'var(--ok)' }
    : pct >= 50 ? { t: 'Getting there', c: 'var(--warn)' }
    : { t: 'Needs work', c: 'var(--bad)' };

  return h('div.card', null,
    h('div.center', null,
      h('div', { style: { fontSize: '2.6rem' } }, pct >= 75 ? '🎉' : pct >= 50 ? '💪' : '📚'),
      h('h2', { style: { marginBottom: '4px' } }, title),
      h('div', { style: { color: grade.c, fontWeight: '800', letterSpacing: '.08em', textTransform: 'uppercase', fontSize: '.78rem' } }, grade.t)
    ),
    h('div.grid.grid--4', { style: { marginTop: '20px' } },
      stat(`${summary.correct}/${summary.total}`, 'correct'),
      stat(`${pct}%`, 'accuracy'),
      stat(`×${summary.bestCombo}`, 'best combo'),
      stat(`+${summary.xp}`, 'XP earned')
    ),
    h('div.small.muted.center', { style: { marginTop: '14px' } },
      `${Math.round(summary.durationMs / 1000)}s total · ${Math.round(summary.durationMs / 1000 / Math.max(1, summary.total))}s per question` +
      (summary.hintsUsed ? ` · ${summary.hintsUsed} hint${summary.hintsUsed > 1 ? 's' : ''} used` : ' · no hints')),
    actions.length ? h('div.btnbar', { style: { marginTop: '20px', justifyContent: 'center' } }, actions) : null
  );
}

function stat(v, k) {
  return h('div.statbox', null, h('div.statbox__v', null, v), h('div.statbox__k', null, k));
}
