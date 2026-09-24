/**
 * search.js - the command palette.
 *
 * Opened with "/" or the magnifier. Searches topics, chapters, formulas and
 * knowledge components from the in-memory index, so it works offline and with
 * no debounce latency.
 */

import { h, clear } from '../../core/dom.js';
import { renderInline, renderMath } from '../../core/mathlite.js';
import { search } from '../../../data/registry.js';
import { sfx } from '../../core/audio.js';

let panel = null;
let items = [];
let cursor = 0;

const KIND_ICON = { topic: '📘', chapter: '📚', formula: '∑', concept: '🧩' };

export function openSearch(initial = '') {
  if (panel) { panel.input.focus(); return; }

  const input = h('input.input', {
    type: 'search', placeholder: 'Search topics, formulas, concepts…',
    value: initial, 'aria-label': 'Search',
    style: { fontSize: '1rem', padding: '14px 16px' },
    onInput: (e) => run(e.target.value),
    onKeyDown: onKey
  });

  const list = h('div', { style: { marginTop: '12px', maxHeight: '52vh', overflowY: 'auto' } });

  const box = h('div.modal.modal--wide', {
    role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Search',
    style: { padding: 'var(--sp-4)' }
  }, input, list,
    h('div.tiny.dim', { style: { marginTop: '10px', display: 'flex', gap: '12px', flexWrap: 'wrap' } },
      h('span', null, h('span.kbd', null, '↑↓'), ' navigate'),
      h('span', null, h('span.kbd', null, '↵'), ' open'),
      h('span', null, h('span.kbd', null, 'Esc'), ' close'))
  );

  const back = h('div.modal-backdrop', {
    style: { alignItems: 'flex-start', paddingTop: '10vh' },
    onClick: (e) => { if (e.target === back) closeSearch(); }
  }, box);

  document.body.appendChild(back);
  panel = { back, input, list };
  input.focus();
  run(initial);
}

export function closeSearch() {
  panel?.back.remove();
  panel = null;
  items = [];
  cursor = 0;
}

function onKey(e) {
  if (e.key === 'Escape') { e.preventDefault(); closeSearch(); return; }
  if (e.key === 'ArrowDown') { e.preventDefault(); move(1); return; }
  if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); return; }
  if (e.key === 'Enter') {
    e.preventDefault();
    const it = items[cursor];
    if (it) { location.hash = it.href; closeSearch(); }
  }
}

function move(d) {
  if (!items.length) return;
  cursor = (cursor + d + items.length) % items.length;
  paintCursor();
}

function paintCursor() {
  if (!panel) return;
  [...panel.list.children].forEach((row, i) => {
    row.style.background = i === cursor ? 'var(--bg-3)' : '';
    if (i === cursor) row.scrollIntoView({ block: 'nearest' });
  });
}

function run(q) {
  if (!panel) return;
  items = search(q, 14);
  cursor = 0;
  clear(panel.list);

  if (!q || q.trim().length < 2) {
    panel.list.appendChild(h('div.small.muted', { style: { padding: '14px 4px' } },
      'Type at least two characters. Try "dimensional", "mole", "empirical" or "onto".'));
    return;
  }
  if (!items.length) {
    panel.list.appendChild(h('div.empty', null,
      h('div.empty__icon', null, '🔎'),
      h('div', null, `Nothing matches "${q}".`)));
    return;
  }

  items.forEach((it, i) => {
    const row = h('a', {
      href: it.href,
      style: {
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '10px 12px', borderRadius: 'var(--r-sm)', color: 'inherit', textDecoration: 'none'
      },
      onClick: () => { sfx.click(); closeSearch(); },
      onMouseEnter: () => { cursor = i; paintCursor(); }
    },
      h('span', { style: { fontSize: '1.1rem' } }, KIND_ICON[it.kind] || '•'),
      h('div', { style: { minWidth: 0, flex: 1 } },
        h('div', { style: { fontWeight: '650', fontSize: '.9rem' } }, it.title),
        h('div.tiny.dim', null, `${it.kind} · ${it.sub || ''}`)),
      it.tex ? h('span', { style: { opacity: '.8' } }, renderMath(it.tex)) : null,
      h('span.tag', { style: { textTransform: 'capitalize' } }, it.subject)
    );
    panel.list.appendChild(row);
  });
  paintCursor();
}
