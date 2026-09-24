/**
 * shell.js - the persistent app chrome.
 *
 * Builds the rail, top bar and mobile nav once, then keeps the XP/streak/due
 * chips in sync by subscribing to the bus. Views only ever render into #main.
 */

import { h, clear, $, $$ } from '../core/dom.js';
import { renderInline } from '../core/mathlite.js';
import { on, EV } from '../core/bus.js';
import { get, levelInfo, xpStep } from '../core/store.js';
import { sfx } from '../core/audio.js';
import { pulse, levelUpBanner } from '../core/fx.js';
import { SUBJECTS } from '../../data/registry.js';
import { dueCount } from '../engine/recommender.js';
import { levelUpModal, modal } from './components/overlays.js';
import { openSearch } from './components/search.js';

let graphRef = null;

export function buildShell(graph) {
  graphRef = graph;

  const app = h('div.app', null,
    rail(),
    topbar(),
    h('main#main.main', { tabindex: '-1' }),
    mobileNav()
  );

  document.body.appendChild(h('a.skip-link', { href: '#main' }, 'Skip to content'));
  document.body.appendChild(app);

  wireEvents();
  refreshStats();
  return app;
}

/* ------------------------------------------------------------------ */
/* rail                                                                */
/* ------------------------------------------------------------------ */

function rail() {
  return h('nav.rail', { 'aria-label': 'Main navigation' },
    h('div.rail__brand', null,
      h('div.rail__mark', null, 'JA'),
      h('div', null,
        h('div.rail__name', null, 'JEE ASCENT'),
        h('div.rail__tag', null, 'Aryabhata Protocol')),
      h('button.btn.btn--icon.btn--quiet.rail__close', {
        'aria-label': 'Close menu',
        onClick: () => { document.body.dataset.rail = 'closed'; }
      }, '✕')
    ),

    h('div.rail__scroll', null,
      group('Mission', [
        link('#/', '🛠️', 'Command Deck'),
        link('#/practice', '🧪', 'Adaptive Practice'),
        link('#/review', '🔁', 'Spaced Review', 'due-badge'),
        link('#/mock', '⏱️', 'Mock Test')
      ]),
      group('Wings', SUBJECTS.map((s) =>
        link(`#/subject/${s.id}`, s.icon, s.name, null, `rail__link--${s.id}`))),
      group('Records', [
        link('#/progress', '📊', 'Progress'),
        link('#/profile', '🎖️', 'Profile & Badges'),
        link('#/print', '🖨️', 'Print Pack'),
        link('#/settings', '⚙️', 'Settings')
      ])
    ),

    h('div.rail__foot', null, levelMeter())
  );
}

function group(label, links) {
  return h('div.rail__group', null,
    h('div.rail__label', null, label),
    ...links);
}

function link(href, icon, text, badgeId = null, extraClass = '') {
  return h(`a.rail__link${extraClass ? '.' + extraClass : ''}`, { href, dataset: { route: href } },
    h('span.ico', null, icon),
    h('span', null, text),
    badgeId ? h('span.badge-n.hidden', { id: badgeId }, '0') : null
  );
}

function levelMeter() {
  return h('div.levelmeter', { id: 'level-meter' },
    h('div.levelmeter__top', null,
      h('span.levelmeter__lv', { id: 'lm-level' }, 'Level 1'),
      h('span.levelmeter__xp', { id: 'lm-xp' }, '0 / 80')),
    h('div.bar.bar--xp', null, h('i', { id: 'lm-bar', style: { width: '0%' } })),
    h('div.levelmeter__rank', { id: 'lm-rank' }, 'Aspirant')
  );
}

/* ------------------------------------------------------------------ */
/* top bar                                                             */
/* ------------------------------------------------------------------ */

function topbar() {
  return h('header.topbar', null,
    h('button.btn.btn--icon.btn--quiet', {
      'aria-label': 'Open menu',
      style: { marginRight: '4px' },
      onClick: () => {
        document.body.dataset.rail = document.body.dataset.rail === 'open' ? 'closed' : 'open';
        sfx.click();
      },
      ref: (el) => { el.classList.add('menu-toggle'); }
    }, '☰'),

    h('div.topbar__crumbs', { id: 'crumbs' }, h('span.cur', null, 'Command Deck')),

    h('div.topbar__stats', null,
      h('button.btn.btn--icon.btn--quiet', {
        'aria-label': 'Search (press /)',
        onClick: () => openSearch()
      }, '🔍'),
      h('span.stat-chip.stat-chip--due', { id: 'chip-due', dataset: { n: '0' } },
        h('span.ico', null, '🔁'), h('span', { id: 'due-n' }, '0')),
      h('span.stat-chip.stat-chip--streak', { id: 'chip-streak' },
        h('span.ico', null, '🔥'), h('span', { id: 'streak-n' }, '0')),
      h('span.stat-chip.stat-chip--coin', { id: 'chip-coins' },
        h('span.ico', null, '🪙'), h('span', { id: 'coins-n' }, '0')),
      h('span.stat-chip.stat-chip--xp', { id: 'chip-xp' },
        h('span.ico', null, '⭐'), h('span', { id: 'xp-n' }, '0'))
    )
  );
}

/* ------------------------------------------------------------------ */
/* mobile nav                                                          */
/* ------------------------------------------------------------------ */

function mobileNav() {
  const item = (href, icon, label) =>
    h('a', { href, dataset: { route: href } }, h('span.ico', null, icon), h('span', null, label));

  return h('nav.mobilenav', { 'aria-label': 'Quick navigation' },
    item('#/', '🛠️', 'Deck'),
    item('#/subject/physics', '📐', 'Phy'),
    item('#/subject/chemistry', '⚗️', 'Chem'),
    item('#/subject/maths', '♾️', 'Math'),
    item('#/review', '🔁', 'Review'),
    item('#/progress', '📊', 'Stats')
  );
}

/* ------------------------------------------------------------------ */
/* live stats                                                          */
/* ------------------------------------------------------------------ */

export function refreshStats() {
  const s = get();
  const li = levelInfo(s.xp);

  setText('xp-n', s.xp.toLocaleString());
  setText('coins-n', s.coins.toLocaleString());
  setText('streak-n', String(s.streak.count));
  setText('lm-level', `Level ${li.level}`);
  setText('lm-xp', `${li.into} / ${li.need}`);
  setText('lm-rank', li.rank);
  const bar = document.getElementById('lm-bar');
  if (bar) bar.style.width = li.pct + '%';

  const due = graphRef ? dueCount(graphRef, s) : 0;
  setText('due-n', String(due));
  const chip = document.getElementById('chip-due');
  if (chip) chip.dataset.n = String(due);
  const badge = document.getElementById('due-badge');
  if (badge) {
    badge.textContent = String(due);
    badge.classList.toggle('hidden', due === 0);
  }
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function wireEvents() {
  on(EV.STATE, refreshStats);
  on(EV.XP, () => { refreshStats(); pulse('#chip-xp'); });
  on(EV.COINS, () => { refreshStats(); pulse('#chip-coins'); });
  on(EV.STREAK, () => { refreshStats(); pulse('#chip-streak'); });
  on(EV.ANSWER, refreshStats);

  on(EV.LEVEL_UP, (p) => {
    sfx.levelUp();
    levelUpBanner(p.level, p.rank);
    setTimeout(() => levelUpModal(p), 1400);
  });

  on(EV.ROUTE, (ctx) => {
    // Highlight the active nav entry.
    const path = '#' + ctx.path;
    $$('[data-route]').forEach((a) => {
      const r = a.dataset.route;
      const active = r === path || (r !== '#/' && path.startsWith(r));
      if (active) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    document.body.dataset.rail = 'closed';
    refreshStats();
  });

  // "/" focuses search, like every tool the learner already uses.
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && !e.target.matches('input, textarea, select')) {
      e.preventDefault();
      openSearch();
    }
  });
}

/* ------------------------------------------------------------------ */
/* breadcrumbs                                                         */
/* ------------------------------------------------------------------ */

/** @param {Array<{label:string, href?:string}>} parts */
export function setCrumbs(parts) {
  const box = document.getElementById('crumbs');
  if (!box) return;
  clear(box);
  parts.forEach((p, i) => {
    const last = i === parts.length - 1;
    if (i > 0) box.appendChild(h('span.sep', null, '›'));
    box.appendChild(last
      ? h('span.cur', null, p.label)
      : h('a', { href: p.href || '#/', class: i === 0 ? 'crumb-hide' : '' }, p.label));
  });
  document.title = parts.map((p) => p.label).reverse().join(' · ') + ' — JEE ASCENT';
}

/** Replace the main region with a view. */
export function setView(node, { wide = false, read = false, hue = null } = {}) {
  const main = document.getElementById('main');
  if (!main) return;
  clear(main);
  const view = h(`div.view.view-enter${wide ? '.view--wide' : ''}${read ? '.view--read' : ''}`, null, node);
  if (hue) view.dataset.hue = hue;
  main.appendChild(view);
  main.focus({ preventScroll: true });
  return view;
}

/* ------------------------------------------------------------------ */
/* theming                                                             */
/* ------------------------------------------------------------------ */

export function applySettings() {
  const s = get().settings;
  const root = document.documentElement;

  const theme = s.theme === 'auto'
    ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
    : s.theme;
  root.dataset.theme = theme;
  root.dataset.contrast = s.contrast || 'normal';
  root.style.setProperty('--font-scale', String(s.fontScale || 1));
  document.body.dataset.motion = s.motion === 'reduced' ? 'reduced' : 'full';

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = theme === 'light' ? '#f4f6fb' : '#070b16';
}
