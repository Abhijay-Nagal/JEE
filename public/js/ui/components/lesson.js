/**
 * lesson.js - renders the authored lesson block list.
 *
 * Content is authored as structured blocks rather than HTML so the same data
 * can drive the on-screen lesson, the print pack and (eventually) any other
 * surface, and so nothing in a chapter file can inject markup.
 */

import { h, append } from '../../core/dom.js';
import { renderInline, renderMath } from '../../core/mathlite.js';

const CALLOUT_ICON = {
  tip: '💡', warn: '⚠️', trap: '🚨',
  jee: '🎯', story: '📖', note: '📝'
};
const CALLOUT_LABEL = {
  tip: 'Tip', warn: 'Careful', trap: 'Common trap',
  jee: 'Exam radar', story: 'Transmission', note: 'Note'
};

/**
 * @param {Array} blocks
 * @param {{onSim?: () => Node}} opts  `onSim` supplies the widget placeholder
 */
export function renderLesson(blocks, opts = {}) {
  const root = h('div.lesson');
  for (const b of blocks || []) {
    const node = renderBlock(b, opts);
    if (node) root.appendChild(node);
  }
  return root;
}

export function renderBlock(b, opts = {}) {
  switch (b.t) {
    case 'p':
      return h('p', null, renderInline(b.x));

    case 'h':
      return h('h3', null, renderInline(b.x));

    case 'ul':
      return h('ul', null, (b.items || []).map((i) => h('li', null, renderInline(i))));

    case 'ol':
      return h('ol', null, (b.items || []).map((i) => h('li', null, renderInline(i))));

    case 'callout': {
      const kind = b.kind || 'note';
      const body = b.items
        ? h('ul', null, b.items.map((i) => h('li', null, renderInline(i))))
        : paragraphs(b.x);
      return h(`div.callout.callout--${kind}`, null,
        h('div.callout__label', null,
          h('span', null, CALLOUT_ICON[kind] || ''),
          b.title || CALLOUT_LABEL[kind] || ''),
        body);
    }

    case 'formula':
      return h('div.formula' + (b.star ? '.formula--starred' : ''), null,
        b.name ? h('div.formula__name', null, renderInline(b.name)) : null,
        renderMath(b.tex, { display: true }),
        b.note ? h('p.formula__note', null, renderInline(b.note)) : null);

    case 'table': {
      const table = h('table.deftable', null,
        h('thead', null, h('tr', null, (b.head || []).map((c) => h('th', null, renderInline(c))))),
        h('tbody', null, (b.rows || []).map((r) =>
          h('tr', null, r.map((c) => h('td', null, renderInline(c))))))
      );
      return h('div.table-wrap', null, table);
    }

    case 'worked':
      return h('div.worked', null,
        h('div.worked__head', null,
          h('span', null, '✎'),
          h('span', null, renderInline(b.title || 'Worked example')),
          b.tier ? h('span.tag' + `.tag--${b.tier.toLowerCase()}`, { style: { marginLeft: 'auto' } }, b.tier) : null),
        h('div.worked__body', null,
          h('div.worked__q', null, renderInline(b.q)),
          h('ol.worked__steps', null, (b.steps || []).map((s) => h('li', null, renderInline(s)))),
          b.ans ? h('div.worked__ans', null, renderInline(`Answer: ${b.ans}`)) : null));

    case 'sim':
      return opts.onSim ? opts.onSim() : null;

    case 'anim':
      // The host decides how to mount it (the print pack, for instance,
      // replaces animations with their narration text instead).
      return opts.onAnim ? opts.onAnim(b) : null;

    default:
      console.warn('[lesson] unknown block type', b.t);
      return null;
  }
}

/** Split a callout body on blank lines so multi-paragraph callouts read well. */
function paragraphs(text) {
  const frag = document.createDocumentFragment();
  for (const part of String(text || '').split(/\n\n+/)) {
    frag.appendChild(h('p', null, renderInline(part)));
  }
  return frag;
}

/** Compact formula list used on the chapter and print screens. */
export function renderFormulaList(formulas) {
  return h('div.grid.grid--auto', null,
    formulas.map((f) =>
      h('div.formula' + (f.star ? '.formula--starred' : ''), { style: { margin: 0 } },
        h('div.formula__name', null, renderInline(f.name || '')),
        renderMath(f.tex, { display: true }),
        f.note ? h('p.formula__note', null, renderInline(f.note)) : null)));
}
