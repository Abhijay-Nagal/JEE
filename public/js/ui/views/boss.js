/**
 * boss.js - the chapter boss battle.
 *
 * A timed run over the chapter's Hurdle-tier questions, mixed the way the real
 * paper mixes them. It exists for two reasons: it forces retrieval across
 * topics rather than within one, and it gives the chapter an ending.
 */

import { h, clear } from '../../core/dom.js';
import { renderInline } from '../../core/mathlite.js';
import { get, chapterRec, addXP, addCoins, update } from '../../core/store.js';
import { emit, EV } from '../../core/bus.js';
import { sfx } from '../../core/audio.js';
import { confetti, shake, burstAt } from '../../core/fx.js';
import { setView, setCrumbs } from '../shell.js';
import { getChapter, bossPool, SUBJECT_BY_ID } from '../../../data/registry.js';
import { shuffle } from '../../engine/recommender.js';
import { chapterMastery } from '../../engine/knowledgeGraph.js';
import { checkAchievements } from '../../engine/achievements.js';
import { reward, rewardFromSession } from '../../engine/bandit.js';
import { createQuiz, summaryCard } from '../components/quiz.js';
import { notFound } from './browse.js';

let live = null;
export function disposeBoss() { live?.destroy?.(); live = null; }

export function bossView(graph, subjectId, chapterId, query = {}) {
  const ch = getChapter(chapterId);
  if (!ch || !ch.boss) return notFound(chapterId);

  disposeBoss();
  const sub = SUBJECT_BY_ID[ch.subject];
  setCrumbs([
    { label: sub.name, href: `#/subject/${ch.subject}` },
    { label: ch.title, href: `#/chapter/${ch.subject}/${ch.id}` },
    { label: ch.boss.name }
  ]);

  if (!query.go) return setView(introScreen(graph, ch), { hue: ch.subject, read: true });

  runBattle(graph, ch);
}

/* ------------------------------------------------------------------ */
/* intro                                                               */
/* ------------------------------------------------------------------ */

function introScreen(graph, ch) {
  const s = get();
  const rec = s.chapters[ch.id] || {};
  const m = chapterMastery(graph, s, ch.id);
  const pool = bossPool(ch.id);

  return h('div', null,
    h('div.boss', null,
      h('div.row', { style: { alignItems: 'flex-start', gap: 'var(--sp-5)', flexWrap: 'wrap' } },
        h('div.boss__avatar', { style: { width: '110px', height: '110px', fontSize: '3.4rem' } }, ch.boss.avatar),
        h('div', { style: { flex: '1', minWidth: '260px' } },
          h('div.boss__title', null, ch.boss.title),
          h('div.boss__name', { style: { fontSize: '1.8rem' } }, ch.boss.name),
          h('p', { style: { marginTop: 'var(--sp-3)' } }, renderInline(ch.boss.intro)))
      ),

      h('div.grid.grid--4', { style: { marginTop: 'var(--sp-5)' } },
        tile(`${ch.boss.hp}`, 'correct answers to win'),
        tile(`${ch.boss.lives}`, 'lives'),
        tile(`${ch.boss.timePerQ}s`, 'per question'),
        tile(`${pool.length}`, 'questions in the pool')),

      m < 0.35
        ? h('div.callout.callout--warn', { style: { marginTop: 'var(--sp-5)' } },
            h('div.callout__label', null, '⚠️ Not recommended yet'),
            h('div.small', null, renderInline(
              `Chapter mastery is ${Math.round(m * 100)}%. The boss draws only from Hurdle-tier questions — you will learn more from the topics first. You may still try.`)))
        : null,

      rec.bossWins
        ? h('div.callout.callout--tip', { style: { marginTop: 'var(--sp-5)' } },
            h('div.callout__label', null, '✓ Already defeated'),
            h('div.small', null, renderInline(`Won ${rec.bossWins} time${rec.bossWins > 1 ? 's' : ''}, best streak ${rec.bossBest}. A rematch still counts for XP and keeps the questions in your review schedule.`)))
        : null,

      h('div.btnbar', { style: { marginTop: 'var(--sp-5)' } },
        h('a.btn.btn--bad.btn--lg', { href: `#/boss/${ch.subject}/${ch.id}?go=1` }, '⚔️ Begin the fight'),
        h('a.btn.btn--ghost', { href: `#/chapter/${ch.subject}/${ch.id}` }, 'Not yet'))
    ),

    h('div.card', { style: { marginTop: 'var(--sp-5)' } },
      h('h3', null, 'Rules'),
      h('ul.small', null,
        h('li', null, renderInline(`Every question is **Hurdle tier** — JEE Advanced difficulty, drawn from all ${ch.topics.length} topics.`)),
        h('li', null, renderInline(`A correct answer removes one point of the boss’s ${ch.boss.hp} HP.`)),
        h('li', null, 'A wrong answer or a timeout costs a life. Three lives.'),
        h('li', null, 'Hints are disabled. The clock does not stop.'),
        h('li', null, renderInline('Answers still count normally — mastery, spaced review and XP all update.'))))
  );
}

const tile = (v, k) => h('div.card.card--pad-sm.statbox', null,
  h('div.statbox__v', null, v), h('div.statbox__k', null, k));

/* ------------------------------------------------------------------ */
/* battle                                                              */
/* ------------------------------------------------------------------ */

function runBattle(graph, ch) {
  const boss = ch.boss;
  const state = { hp: boss.hp, lives: boss.lives, streak: 0, best: 0, taunt: '' };

  const pool = shuffle(bossPool(ch.id));
  // Enough questions that the boss can always be beaten, with headroom.
  const questions = pool.slice(0, Math.max(boss.hp + boss.lives + 4, Math.min(pool.length, 18)));

  const hpBar = h('i', { style: { width: '100%' } });
  const hpWrap = h('div.boss__hp', null, hpBar);
  const livesRow = h('div.playerhp', null,
    Array.from({ length: boss.lives }, (_, i) => h('i', { dataset: { lost: 'false' } }, '❤️')));
  const tauntEl = h('div.small.muted', { style: { minHeight: '20px', fontStyle: 'italic' } });

  const stage = h('div.boss', { style: { marginBottom: 'var(--sp-5)' } },
    h('div.row', { style: { gap: 'var(--sp-4)', alignItems: 'center', flexWrap: 'wrap' } },
      h('div.boss__avatar', null, boss.avatar),
      h('div', { style: { flex: '1', minWidth: '200px' } },
        h('div.spread', null,
          h('div.boss__name', null, boss.name),
          h('span.mono.small', { ref: (el) => { state.hpText = el; } }, `${state.hp} / ${boss.hp}`)),
        hpWrap,
        tauntEl),
      h('div', { style: { textAlign: 'right' } },
        h('div.tiny.dim', null, 'YOUR LIVES'),
        livesRow)
    )
  );

  const host = h('div');
  setView(h('div', null, stage, host), { hue: ch.subject, read: true });

  let ended = false;

  live = createQuiz({
    host,
    questions,
    mode: 'boss',
    graph,
    perQuestionSec: boss.timePerQ,
    onAnswer(result) {
      if (ended) return;

      if (result.correct) {
        state.hp = Math.max(0, state.hp - 1);
        state.streak++;
        state.best = Math.max(state.best, state.streak);
        sfx.hit();
        hpWrap.classList.add('hit');
        setTimeout(() => hpWrap.classList.remove('hit'), 340);
        burstAt(stage.querySelector('.boss__avatar'), { count: 14, colors: ['#ff5d73', '#ffb703'] });
      } else {
        state.lives--;
        state.streak = 0;
        sfx.wrong();
        shake(8);
        state.taunt = boss.taunts[Math.floor(Math.random() * boss.taunts.length)];
      }

      hpBar.style.width = (state.hp / boss.hp) * 100 + '%';
      if (state.hpText) state.hpText.textContent = `${state.hp} / ${boss.hp}`;
      [...livesRow.children].forEach((n, i) => { n.dataset.lost = String(i >= state.lives); });
      tauntEl.textContent = state.taunt ? `“${state.taunt}”` : '';

      if (state.hp <= 0) { ended = true; setTimeout(() => victory(graph, ch, state, host), 900); }
      else if (state.lives <= 0) { ended = true; setTimeout(() => defeat(graph, ch, state, host), 900); }
    },
    onFinish(summary) {
      if (ended) return;
      // Ran out of questions without winning or losing outright.
      ended = true;
      if (state.hp <= 0) victory(graph, ch, state, host, summary);
      else defeat(graph, ch, state, host, summary);
    }
  });
}

/* ------------------------------------------------------------------ */
/* endings                                                             */
/* ------------------------------------------------------------------ */

function victory(graph, ch, state, host) {
  live?.destroy?.();
  const rec = chapterRec(ch.id);
  rec.bossWins += 1;
  rec.bossBest = Math.max(rec.bossBest, state.best);
  rec.done = true;
  rec.doneAt = Date.now();
  update((st) => { st.bossFights = (st.bossFights || 0) + 1; });

  const xp = 250 + state.lives * 60;
  addXP(xp, `boss:${ch.id}`);
  addCoins(120, `boss:${ch.id}`);
  emit(EV.BOSS_WIN, { chapterId: ch.id, lives: state.lives });
  checkAchievements(graph, { perfectBoss: state.lives === ch.boss.lives, bestCombo: state.best });
  reward(get().bandit, 'boss', 0.9);

  sfx.bossDown();
  confetti({ count: 200, duration: 1.6 });

  clear(host);
  host.appendChild(h('div.card.center', null,
    h('div', { style: { fontSize: '3.4rem' } }, '🏆'),
    h('h1', null, `${ch.boss.name} defeated`),
    h('p', { style: { maxWidth: '54ch', margin: '0 auto var(--sp-4)' } }, renderInline(ch.boss.defeat)),
    h('div.grid.grid--3', { style: { marginTop: 'var(--sp-5)' } },
      tile(`+${xp}`, 'XP'),
      tile('+120', 'coins'),
      tile(`${state.lives}/${ch.boss.lives}`, 'lives remaining')),
    h('div.btnbar', { style: { justifyContent: 'center', marginTop: 'var(--sp-5)' } },
      h('a.btn.btn--primary.btn--lg', { href: `#/chapter/${ch.subject}/${ch.id}` }, 'Return to the chapter'),
      h('a.btn.btn--ghost', { href: '#/' }, 'Command Deck'))
  ));
}

function defeat(graph, ch, state, host) {
  live?.destroy?.();
  update((st) => { st.bossFights = (st.bossFights || 0) + 1; });
  sfx.timeout();

  const damage = Math.round(((ch.boss.hp - state.hp) / ch.boss.hp) * 100);

  clear(host);
  host.appendChild(h('div.card.center', null,
    h('div', { style: { fontSize: '3rem' } }, '🛡️'),
    h('h1', null, 'Driven back'),
    h('p.muted', { style: { maxWidth: '52ch', margin: '0 auto var(--sp-4)' } },
      renderInline(`You took ${damage}% off ${ch.boss.name} before running out of lives. Every answer still counted — mastery and the review schedule both moved.`)),
    h('div.btnbar', { style: { justifyContent: 'center' } },
      h('a.btn.btn--bad', { href: `#/boss/${ch.subject}/${ch.id}?go=1`, onClick: () => setTimeout(() => location.reload(), 10) }, 'Fight again'),
      h('a.btn.btn--primary', { href: `#/chapter/${ch.subject}/${ch.id}` }, 'Shore up the topics first'))
  ));
}
