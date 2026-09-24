/**
 * charts.js - the small chart set this app needs, built as inline SVG.
 *
 * Design rules applied throughout (see the notes on each function):
 *   - categorical identity uses the validated --chart-1..3 slots in fixed
 *     order, never cycled and never reassigned by rank;
 *   - magnitude uses one hue, light-to-dark (--seq-*);
 *   - marks are thin: bars capped at 24px with a 4px rounded data-end and a
 *     square baseline, lines 2px, markers >= 8px with a 2px surface ring;
 *   - touching marks are separated by a 2px surface gap, never a stroke;
 *   - gridlines are hairline, solid and recessive;
 *   - text always wears an ink token, never the series colour;
 *   - two or more series always get a legend; a single series gets none,
 *     because the heading already names it;
 *   - every mark carries a hover/focus tooltip, and any chart that hides
 *     values behind colour ships a table view beside it.
 */

import { h, svg, clear } from '../../core/dom.js';

const NS = 'http://www.w3.org/2000/svg';

/** Fixed categorical order. Index 0 = physics, 1 = chemistry, 2 = maths. */
export const SERIES = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)'];
export const SUBJECT_SLOT = { physics: 0, chemistry: 1, maths: 2 };
export const seriesColour = (subject) => SERIES[SUBJECT_SLOT[subject] ?? 0];

/* ================================================================== */
/* progress ring - a stat tile, not a chart: one value, no legend      */
/* ================================================================== */

export function ring(pct, { size = 80, stroke = 8, label = null, hue = 'var(--primary)', sub = null } = {}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, pct));

  const el = h('div.ring', { style: { width: size + 'px', height: size + 'px' } },
    svg('svg', { width: size, height: size, 'aria-hidden': 'true' },
      svg('circle', { class: 'ring__track', cx: size / 2, cy: size / 2, r, 'stroke-width': stroke }),
      svg('circle', {
        class: 'ring__fill', cx: size / 2, cy: size / 2, r,
        'stroke-width': stroke, stroke: hue,
        'stroke-dasharray': c, 'stroke-dashoffset': c * (1 - v / 100)
      })
    ),
    label !== null ? h('div.ring__label', null, label) : null
  );
  el.setAttribute('role', 'img');
  el.setAttribute('aria-label', `${Math.round(v)} percent${sub ? ' ' + sub : ''}`);
  return el;
}

/* ================================================================== */
/* progress bar - single value                                         */
/* ================================================================== */

export function bar(pct, { hue = null, height = null, label = null } = {}) {
  const v = Math.max(0, Math.min(100, pct));
  const el = h('div.bar' + (height === 'sm' ? '.bar--sm' : height === 'lg' ? '.bar--lg' : ''), {
    role: 'img', 'aria-label': label || `${Math.round(v)} percent`
  }, h('i', { style: { width: v + '%', ...(hue ? { background: hue } : {}) } }));
  return el;
}

/* ================================================================== */
/* activity heatmap - sequential, one hue                              */
/* ================================================================== */

/**
 * @param {Array<{day:string, xp:number, q:number, level:number}>} series oldest first
 */
export function heatStrip(series, { weeks = 12 } = {}) {
  const days = weeks * 7;
  const data = series.slice(-days);
  const max = Math.max(1, ...data.map((d) => d.xp));

  const grid = h('div.heatmap', { role: 'img', 'aria-label': `Daily activity for the last ${weeks} weeks` });
  for (const d of data) {
    const level = d.xp === 0 ? 0 : Math.min(4, 1 + Math.floor((d.xp / max) * 3.4));
    const cell = h('i', {
      dataset: { l: String(level) },
      tabindex: '0',
      // Per-cell tooltip: the value is never locked behind colour alone.
      title: `${d.day}: ${d.xp} XP, ${d.q} question${d.q === 1 ? '' : 's'}`,
      'aria-label': `${d.day}: ${d.xp} XP`
    });
    grid.appendChild(cell);
  }

  // Scale legend - required for a sequential ramp.
  const legend = h('div.row', { style: { gap: '6px', marginTop: '8px', justifyContent: 'flex-end' } },
    h('span.tiny.dim', null, 'less'),
    ...[0, 1, 2, 3, 4].map((l) => h('i', {
      dataset: { l: String(l) },
      style: { width: '11px', height: '11px', borderRadius: '2px', display: 'block', background: `var(--seq-${l})` }
    })),
    h('span.tiny.dim', null, 'more')
  );

  return h('div', null, grid, legend);
}

/* ================================================================== */
/* sparkline - single series                                           */
/* ================================================================== */

export function sparkline(values, { width = 260, height = 56, hue = 'var(--chart-1)', label = null } = {}) {
  const vals = values.filter((v) => Number.isFinite(v));
  if (vals.length < 2) return h('div.tiny.dim', null, 'Not enough data yet.');

  const min = Math.min(...vals), max = Math.max(...vals);
  const span = max - min || 1;
  const pad = 6;
  const X = (i) => pad + (i / (vals.length - 1)) * (width - pad * 2);
  const Y = (v) => height - pad - ((v - min) / span) * (height - pad * 2);

  const d = vals.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ');
  const area = `${d} L${X(vals.length - 1).toFixed(1)},${height - pad} L${X(0).toFixed(1)},${height - pad} Z`;

  const last = vals[vals.length - 1];

  return h('div', null,
    svg('svg', {
      width: '100%', viewBox: `0 0 ${width} ${height}`, preserveAspectRatio: 'none',
      role: 'img', 'aria-label': label || `Trend ending at ${last}`,
      style: 'display:block'
    },
      // area wash at ~10% opacity, never a saturated block
      svg('path', { d: area, fill: hue, 'fill-opacity': '0.10' }),
      svg('path', { d, fill: 'none', stroke: hue, 'stroke-width': '2', 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }),
      // end marker: >= 8px, with a 2px ring in the surface colour
      svg('circle', { cx: X(vals.length - 1), cy: Y(last), r: 4.5, fill: hue, stroke: 'var(--bg-1)', 'stroke-width': '2' })
    ),
    // one direct label, at the endpoint only
    h('div.tiny.dim', { style: { textAlign: 'right', marginTop: '2px' } }, String(last))
  );
}

/* ================================================================== */
/* column chart - single series, used for the review forecast          */
/* ================================================================== */

/**
 * @param {number[]} values
 * @param {{labels?:string[], title?:string, hue?:string, height?:number}} opts
 */
export function columns(values, { labels = [], title = '', hue = 'var(--chart-1)', height = 130, unit = '' } = {}) {
  const max = Math.max(1, ...values);
  const n = values.length;
  const width = 320;
  const padT = 8, padB = 20, padL = 4;
  const plotH = height - padT - padB;
  const slot = (width - padL * 2) / n;
  // Cap the bar and let the leftover be air; the 2px surface gap between
  // neighbours comes out of that leftover, never out of a stroke.
  const bw = Math.min(24, Math.max(4, slot - 4));

  const marks = [];
  values.forEach((v, i) => {
    const bh = (v / max) * plotH;
    const x = padL + slot * i + (slot - bw) / 2;
    const y = padT + plotH - bh;
    // 4px rounded data-end, square at the baseline.
    const r = Math.min(4, bh);
    const d = bh <= 0.5
      ? `M${x},${padT + plotH} h${bw}`
      : `M${x},${padT + plotH} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + bw - r},${y} Q${x + bw},${y} ${x + bw},${y + r} L${x + bw},${padT + plotH} Z`;
    marks.push(svg('path', {
      d, fill: v ? hue : 'var(--chart-grid)',
      tabindex: '0', role: 'img',
      'aria-label': `${labels[i] ?? i}: ${v}${unit}`
    }, svg('title', null, `${labels[i] ?? i}: ${v}${unit}`)));
  });

  // Selective direct labels: only the tallest column is annotated.
  const peak = values.indexOf(max);
  if (max > 0) {
    const bh = plotH;
    marks.push(svg('text', {
      x: padL + slot * peak + slot / 2, y: padT + plotH - bh - 1,
      'text-anchor': 'middle', 'font-size': '10', 'font-weight': '700',
      fill: 'var(--chart-ink)'
    }, String(max)));
  }

  const axis = labels.length
    ? labels.map((l, i) => (i % Math.ceil(n / 7) === 0
        ? svg('text', {
            x: padL + slot * i + slot / 2, y: height - 6,
            'text-anchor': 'middle', 'font-size': '9', fill: 'var(--chart-ink)'
          }, l)
        : null)).filter(Boolean)
    : [];

  return h('div', null,
    title ? h('div.tiny.dim', { style: { marginBottom: '4px' } }, title) : null,
    svg('svg', { width: '100%', viewBox: `0 0 ${width} ${height}`, role: 'group', 'aria-label': title || 'Column chart', style: 'display:block' },
      // baseline, hairline and recessive
      svg('line', { x1: padL, y1: padT + plotH + 0.5, x2: width - padL, y2: padT + plotH + 0.5, stroke: 'var(--chart-grid)', 'stroke-width': '1' }),
      ...marks, ...axis)
  );
}

/* ================================================================== */
/* grouped subject bars - the one categorical chart                    */
/* ================================================================== */

/**
 * Horizontal bars, one per subject. Because there are >= 2 series, a legend is
 * always drawn; each bar is also directly labelled, so identity never rests on
 * colour alone.
 *
 * @param {Array<{subject:string, name:string, value:number, detail?:string}>} rows
 */
export function subjectBars(rows, { max = 100, unit = '%' } = {}) {
  const list = h('div.stack-sm');

  for (const r of rows) {
    const pct = Math.max(0, Math.min(100, (r.value / max) * 100));
    const colour = seriesColour(r.subject);
    list.appendChild(h('div', null,
      h('div.spread', { style: { marginBottom: '4px' } },
        h('span.small', null,
          h('i', { style: { display: 'inline-block', width: '10px', height: '10px', borderRadius: '3px', background: colour, marginRight: '7px' } }),
          r.name),
        h('span.small.mono', null, `${Math.round(r.value)}${unit}`)),
      h('div.bar', { role: 'img', 'aria-label': `${r.name}: ${Math.round(r.value)}${unit}` },
        h('i', { style: { width: pct + '%', background: colour } })),
      r.detail ? h('div.tiny.dim', { style: { marginTop: '3px' } }, r.detail) : null
    ));
  }

  list.appendChild(legend(rows.map((r) => ({ name: r.name, colour: seriesColour(r.subject) }))));
  return list;
}

export function legend(items) {
  return h('div.row', { style: { gap: 'var(--sp-4)', flexWrap: 'wrap', marginTop: 'var(--sp-3)' } },
    items.map((i) =>
      h('span.row', { style: { gap: '6px' } },
        h('i', { style: { width: '10px', height: '10px', borderRadius: '3px', background: i.colour, display: 'block' } }),
        h('span.tiny.dim', null, i.name))));
}

/* ================================================================== */
/* mastery list - status scale, always with a text label               */
/* ================================================================== */

const BANDS = [
  { min: 0.92, key: 'mastered', label: 'mastered', icon: '★', colour: 'var(--st-mastered)' },
  { min: 0.80, key: 'mastered', label: 'mastered', icon: '✓', colour: 'var(--st-mastered)' },
  { min: 0.55, key: 'strong', label: 'strong', icon: '●', colour: 'var(--st-strong)' },
  { min: 0.30, key: 'learning', label: 'learning', icon: '◐', colour: 'var(--st-learning)' },
  { min: 0, key: 'weak', label: 'needs work', icon: '○', colour: 'var(--st-weak)' }
];

export const bandOf = (p) => BANDS.find((b) => p >= b.min) || BANDS[BANDS.length - 1];

/**
 * Nominal rows (concept names) with a status colour. The band name is printed
 * beside every row, so the colour is a reinforcement and never the only
 * carrier of meaning.
 */
export function masteryList(rows, { onClick = null } = {}) {
  return h('div.stack-sm', null,
    rows.map((r) => {
      const band = bandOf(r.mastery);
      const inner = h('div', { style: { flex: 1, minWidth: 0 } },
        h('div.spread', { style: { marginBottom: '3px' } },
          h('span.small', { style: { fontWeight: '600' } }, r.name),
          h('span.tiny', { style: { color: band.colour, fontWeight: '800' } },
            `${band.icon} ${band.label} · ${Math.round(r.mastery * 100)}%`)),
        h('div.bar.bar--sm', { role: 'img', 'aria-label': `${r.name}: ${Math.round(r.mastery * 100)} percent, ${band.label}` },
          h('i', { style: { width: (r.mastery * 100) + '%', background: band.colour } })),
        r.detail ? h('div.tiny.dim', { style: { marginTop: '3px' } }, r.detail) : null
      );

      return onClick && r.href
        ? h('a', { href: r.href, style: { display: 'flex', textDecoration: 'none', color: 'inherit' } }, inner)
        : h('div', { style: { display: 'flex' } }, inner);
    }));
}

/* ================================================================== */
/* table view - the accessible fallback for any chart above            */
/* ================================================================== */

/**
 * @param {string[]} head
 * @param {Array<Array<string|number>>} rows
 */
export function dataTable(head, rows) {
  return h('div.table-wrap', null,
    h('table.deftable', null,
      h('thead', null, h('tr', null, head.map((c) => h('th', null, c)))),
      h('tbody', null, rows.map((r) => h('tr', null, r.map((c) => h('td', null, String(c))))))));
}

/** Wraps a chart with a "view as table" toggle. */
export function withTable(chartNode, head, rows) {
  let showing = false;
  const slot = h('div', null, chartNode);
  const toggle = h('button.btn.btn--sm.btn--quiet', {
    onClick: () => {
      showing = !showing;
      clear(slot);
      slot.appendChild(showing ? dataTable(head, rows) : chartNode);
      toggle.textContent = showing ? 'View as chart' : 'View as table';
    }
  }, 'View as table');

  return h('div', null, slot,
    h('div', { style: { textAlign: 'right', marginTop: '4px' } }, toggle));
}
