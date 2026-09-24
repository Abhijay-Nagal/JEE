/**
 * browse.js - subject and chapter screens.
 *
 * The subject screen shows the whole JEE unit list, including the chapters
 * that are not authored yet, so a learner always sees where they are in the
 * real syllabus rather than in this app's subset.
 */

import { h } from '../../core/dom.js';
import { renderInline, renderMath } from '../../core/mathlite.js';
import { get, topicRec, update } from '../../core/store.js';
import { setView, setCrumbs } from '../shell.js';
import { SUBJECT_BY_ID, ROADMAP, CHAPTERS, getChapter, topicsOf, formulasOf, bossPool } from '../../../data/registry.js';
import { chapterMastery, topicMastery, topicUnlocked, lockReason, layoutChapter, kcMastery } from '../../engine/knowledgeGraph.js';
import { MASTERY_THRESHOLD } from '../../engine/bkt.js';
import { ring, bar, masteryList, bandOf } from '../components/charts.js';
import { renderFormulaList } from '../components/lesson.js';
import { modal } from '../components/overlays.js';

/* ================================================================== */
/* subject                                                             */
/* ================================================================== */

export function subjectView(graph, subjectId) {
  const sub = SUBJECT_BY_ID[subjectId];
  if (!sub) return notFound(subjectId);

  setCrumbs([{ label: 'Command Deck', href: '#/' }, { label: sub.name }]);
  const s = get();
  const roadmap = ROADMAP[subjectId] || [];
  const liveIds = new Set(roadmap.filter((r) => r.status === 'live').map((r) => r.id));

  const page = h('div', null,
    h('div.page-head', null,
      h('div.page-head__eyebrow', null, `${sub.wing} · ${sub.guide.name} presiding`),
      h('h1', null, h('span', { style: { marginRight: '10px' } }, sub.icon), sub.name),
      h('p.page-head__sub', null, sub.blurb)),

    h('div.grid.grid--auto', null,
      CHAPTERS.filter((c) => c.subject === subjectId).map((ch) => chapterCard(graph, s, ch))),

    h('section.section', null,
      h('div.section__head', null,
        h('h2', null, 'Full syllabus map'),
        h('span.small.muted', null, `${liveIds.size} of ${roadmap.length} chapters built`)),
      h('div.card.card--pad-sm', null,
        h('div.tlist', null, roadmap.map((r) => roadmapRow(graph, s, r, subjectId))))
    )
  );

  setView(page, { hue: subjectId });
}

function chapterCard(graph, s, ch) {
  const m = chapterMastery(graph, s, ch.id);
  const topics = topicsOf(ch.id);
  const read = topics.filter((t) => s.topics[t.id]?.read).length;
  const bossWon = (s.chapters[ch.id]?.bossWins ?? 0) > 0;

  return h('a.card.tilt', {
    href: `#/chapter/${ch.subject}/${ch.id}`,
    style: { display: 'block', color: 'inherit', textDecoration: 'none' },
    dataset: { hue: ch.subject }
  },
    h('div.spread', { style: { alignItems: 'flex-start' } },
      h('div', null,
        h('div.tiny.dim', null, `CHAPTER ${ch.number} · ~${ch.jeeWeight}% OF THE PAPER`),
        h('h3', { style: { margin: '4px 0' } }, ch.title),
        h('p.small.muted', { style: { marginBottom: 0 } }, ch.subtitle)),
      ring(Math.round(m * 100), { size: 62, label: `${Math.round(m * 100)}%`, hue: `var(--${ch.subject})` })
    ),
    h('p.small', { style: { marginTop: 'var(--sp-4)' } }, ch.blurb),
    h('div.row-wrap', { style: { marginTop: 'var(--sp-4)' } },
      h('span.tag', null, `${topics.length} topics`),
      h('span.tag', null, `${topics.reduce((n, t) => n + (t.questions?.length || 0), 0)} questions`),
      h('span.tag', null, `${read}/${topics.length} opened`),
      bossWon ? h('span.tag.tag--ok', null, '⚔️ boss defeated') : h('span.tag', null, `⚔️ ${ch.boss.name}`)
    )
  );
}

function roadmapRow(graph, s, r, subjectId) {
  const live = r.status === 'live';
  const ch = live ? getChapter(r.id) : null;
  const m = ch ? chapterMastery(graph, s, ch.id) : 0;

  return h(live ? 'a.titem' : 'div.titem', {
    ...(live ? { href: `#/chapter/${subjectId}/${r.id}` } : {}),
    dataset: { locked: String(!live), done: String(m >= MASTERY_THRESHOLD) },
    style: live ? {} : { opacity: '.45', pointerEvents: 'none' }
  },
    h('div.titem__num', null, String(r.n)),
    h('div', null,
      h('div.titem__title', null, r.title),
      h('div.titem__meta', null,
        live ? `${Math.round(m * 100)}% mastered` : 'Not built yet')),
    h('div.titem__right', null,
      live
        ? h('div', { style: { width: '90px' } }, bar(Math.round(m * 100), { hue: `var(--${subjectId})`, height: 'sm' }))
        : h('span.tag.tag--locked', null, 'planned'))
  );
}

/* ================================================================== */
/* chapter                                                             */
/* ================================================================== */

export function chapterView(graph, subjectId, chapterId) {
  const ch = getChapter(chapterId);
  if (!ch) return notFound(chapterId);

  const sub = SUBJECT_BY_ID[ch.subject];
  setCrumbs([
    { label: 'Command Deck', href: '#/' },
    { label: sub.name, href: `#/subject/${ch.subject}` },
    { label: ch.title }
  ]);

  const s = get();
  const m = chapterMastery(graph, s, ch.id);
  const topics = topicsOf(ch.id);
  const bossWins = s.chapters[ch.id]?.bossWins ?? 0;
  const allRead = topics.every((t) => s.topics[t.id]?.read);

  const page = h('div', null,
    h('div.page-head', null,
      h('div.page-head__eyebrow', null, `${sub.name} · Chapter ${ch.number}`),
      h('h1', null, ch.title),
      h('p.page-head__sub', null, ch.blurb)),

    introCard(ch),

    h('div.grid.grid--4', { style: { marginBottom: 'var(--sp-6)' } },
      statTile(`${Math.round(m * 100)}%`, 'chapter mastery'),
      statTile(String(topics.length), 'topics'),
      statTile(String(topics.reduce((n, t) => n + (t.questions?.length || 0), 0)), 'questions'),
      statTile(`~${Math.round(ch.estMin / 60)}h`, 'estimated time')
    ),

    h('section.section', { style: { marginTop: 0 } },
      h('div.section__head', null, h('h2', null, 'Topics')),
      h('div.tlist', null, topics.map((t, i) => topicRow(graph, s, t, i)))
    ),

    bossCard(graph, s, ch, allRead, bossWins),

    h('section.section', null,
      h('div.section__head', null,
        h('h2', null, 'Knowledge map'),
        h('button.btn.btn--sm.btn--ghost', {
          onClick: () => {
            update((st) => { st.graphViews = (st.graphViews || 0) + 1; });
            modal({
              title: 'How to read this map',
              body: renderInline('Each circle is a **knowledge component** — one idea small enough to be tested on its own. An arrow means the lower one is a prerequisite of the upper one.\n\nThe platform uses this graph to decide what to unlock, and when you get a question wrong it walks **down** the arrows to find the weakest ancestor. That is why a wrong answer about limiting reagents sometimes prescribes revision of the mole concept.'),
              actions: [{ label: 'Got it', kind: 'primary' }]
            });
          }
        }, 'What is this?')),
      h('div.card', null, skillTree(graph, s, ch))
    ),

    h('section.section', null,
      h('div.section__head', null,
        h('h2', null, 'Formula sheet'),
        h('a.btn.btn--sm.btn--ghost', { href: `#/print?chapter=${ch.id}` }, '🖨️ Print')),
      renderFormulaList(ch.formulaSheet || []))
  );

  setView(page, { hue: ch.subject });
}

function introCard(ch) {
  return h('div.story', { style: { marginBottom: 'var(--sp-6)' } },
    h('div.row', { style: { alignItems: 'flex-start', gap: 'var(--sp-4)' } },
      h('div.story__avatar', null, ch.intro.avatar),
      h('div', null,
        h('div.story__speaker', null, ch.intro.speaker),
        ...ch.intro.lines.map((l) => h('p.story__line', null, renderInline(l)))))
  );
}

function topicRow(graph, s, t, i) {
  const rec = s.topics[t.id];
  const m = topicMastery(graph, s, t.id);
  const unlocked = topicUnlocked(graph, s, t.id);
  const reason = unlocked ? null : lockReason(graph, s, t.id);
  const band = bandOf(m);

  const answered = ['G', 'M', 'H'].reduce((n, k) => n + (rec?.gmh?.[k]?.a || 0), 0);

  return h('a.titem', {
    href: `#/topic/${t.subject}/${t.chapterId}/${t.id}`,
    dataset: {
      locked: String(!unlocked),
      done: String(Boolean(rec?.read)),
      mastered: String(m >= MASTERY_THRESHOLD)
    },
    title: reason || ''
  },
    h('div.titem__num', null, m >= MASTERY_THRESHOLD ? '★' : rec?.read ? '✓' : String(i + 1)),
    h('div', null,
      h('div.titem__title', null, t.title),
      h('div.titem__meta', null,
        h('span', null, t.short),
        h('span', null, `~${t.estMin} min`),
        answered ? h('span', null, `${answered} answered`) : null,
        rec?.gamePlays ? h('span', null, `🎮 ×${rec.gamePlays}`) : null,
        reason ? h('span', { style: { color: 'var(--warn)' } }, '🔒 ' + reason) : null)),
    h('div.titem__right', null,
      h('span.tiny', { style: { color: band.colour, fontWeight: '800' } }, `${Math.round(m * 100)}%`),
      h('div', { style: { width: '72px' } }, bar(Math.round(m * 100), { hue: band.colour, height: 'sm' })))
  );
}

function bossCard(graph, s, ch, allRead, wins) {
  const m = chapterMastery(graph, s, ch.id);
  const ready = allRead || m > 0.4;

  return h('section.section', null,
    h('div.boss', null,
      h('div.row', { style: { alignItems: 'flex-start', gap: 'var(--sp-5)', flexWrap: 'wrap' } },
        h('div.boss__avatar', null, ch.boss.avatar),
        h('div', { style: { flex: '1', minWidth: '240px' } },
          h('div.boss__title', null, ch.boss.title),
          h('div.boss__name', null, ch.boss.name),
          h('p.small.muted', { style: { marginTop: '8px' } }, renderInline(ch.boss.intro)),
          wins > 0
            ? h('div.row-wrap', null,
                h('span.tag.tag--ok', null, `✓ Defeated ×${wins}`),
                h('span.tag', null, `Best streak ${s.chapters[ch.id]?.bossBest ?? 0}`))
            : null,
          h('div.btnbar', { style: { marginTop: 'var(--sp-4)' } },
            ready
              ? h('a.btn.btn--bad.btn--lg', { href: `#/boss/${ch.subject}/${ch.id}` },
                  wins > 0 ? 'Fight again' : 'Challenge')
              : h('span.btn', { 'aria-disabled': 'true' }, '🔒 Read a few topics first'))
        )
      )
    )
  );
}

/* ------------------------------------------------------------------ */
/* skill tree                                                          */
/* ------------------------------------------------------------------ */

function skillTree(graph, s, ch) {
  const { nodes, width, height } = layoutChapter(graph, ch.id, { width: 860, layerGap: 88 });
  const byId = new Map(nodes.map((n) => [n.id, n]));

  const edges = [];
  for (const n of nodes) {
    for (const p of n.prereq) {
      const a = byId.get(p);
      if (!a) continue;
      edges.push({ x1: a.x, y1: a.y, x2: n.x, y2: n.y });
    }
  }

  const svgNS = 'http://www.w3.org/2000/svg';
  const el = document.createElementNS(svgNS, 'svg');
  el.setAttribute('viewBox', `0 0 ${width} ${height + 20}`);
  el.setAttribute('class', 'kgraph');
  el.setAttribute('role', 'img');
  el.setAttribute('aria-label', `Prerequisite map for ${ch.title}`);

  for (const e of edges) {
    const path = document.createElementNS(svgNS, 'path');
    const my = (e.y1 + e.y2) / 2;
    path.setAttribute('d', `M${e.x1},${e.y1} C${e.x1},${my} ${e.x2},${my} ${e.x2},${e.y2}`);
    path.setAttribute('class', 'edge');
    el.appendChild(path);
  }

  for (const n of nodes) {
    const m = kcMastery(s, n.id);
    const state = m >= MASTERY_THRESHOLD ? 'mastered' : m > 0.2 ? 'learning' : 'locked';
    const g = document.createElementNS(svgNS, 'g');
    g.setAttribute('class', 'node');
    g.setAttribute('data-state', state);
    g.setAttribute('transform', `translate(${n.x},${n.y})`);

    const c = document.createElementNS(svgNS, 'circle');
    c.setAttribute('r', '15');
    g.appendChild(c);

    const title = document.createElementNS(svgNS, 'title');
    title.textContent = `${n.name} — ${Math.round(m * 100)}% mastered`;
    g.appendChild(title);

    const label = document.createElementNS(svgNS, 'text');
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('y', '32');
    label.textContent = shorten(n.name, 22);
    g.appendChild(label);

    const pctText = document.createElementNS(svgNS, 'text');
    pctText.setAttribute('text-anchor', 'middle');
    pctText.setAttribute('y', '4');
    pctText.setAttribute('font-size', '9');
    pctText.setAttribute('font-weight', '700');
    pctText.textContent = String(Math.round(m * 100));
    g.appendChild(pctText);

    if (n.topicId) {
      g.style.cursor = 'pointer';
      g.addEventListener('click', () => {
        const t = graph.topics.get(n.topicId);
        if (t) location.hash = `#/topic/${t.subject}/${t.chapterId}/${t.id}`;
      });
    }
    el.appendChild(g);
  }

  return h('div', { style: { overflowX: 'auto' } }, el,
    h('div.sim-legend', { style: { marginTop: 'var(--sp-3)' } },
      h('span', null, h('i', { style: { background: 'var(--bg-2)', border: '2px dashed var(--line)' } }), 'not started'),
      h('span', null, h('i', { style: { background: 'var(--bg-2)', border: '2px solid var(--hue,var(--primary))' } }), 'learning'),
      h('span', null, h('i', { style: { background: 'var(--hue,var(--primary))' } }), 'mastered')));
}

const shorten = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

/* ------------------------------------------------------------------ */

function statTile(v, k) {
  return h('div.card.card--pad-sm.statbox', null,
    h('div.statbox__v', null, v), h('div.statbox__k', null, k));
}

export function notFound(what) {
  setCrumbs([{ label: 'Not found' }]);
  setView(h('div.empty', null,
    h('div.empty__icon', null, '🗺️'),
    h('h2', null, 'Nothing here'),
    h('p', null, `"${what}" does not exist in this build.`),
    h('a.btn.btn--primary', { href: '#/' }, 'Back to Command Deck')));
}
