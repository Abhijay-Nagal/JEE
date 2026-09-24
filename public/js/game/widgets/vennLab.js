/**
 * Venn Lab - click regions, and the app names the set expression you built.
 *
 * Runs both directions. In free mode you shade regions and it tells you what
 * you have made; in challenge mode it names an expression and you must shade
 * it. The second direction is the one exams test and the harder of the two.
 *
 * Teaches: set operations as regions, De Morgan's laws made visible, and the
 * distinction between a union and a symmetric difference.
 */

import { h, clear } from '../../core/dom.js';
import { renderInline, renderMath } from '../../core/mathlite.js';
import { sfx } from '../../core/audio.js';
import { arcade, canvasLayer, cssVar, c2d, btn, seg, cleared, shuffle } from '../kit.js';

/** The eight regions, keyed by which circles contain them. */
const REGIONS = [
  { key: '---', a: 0, b: 0, c: 0 },
  { key: 'a--', a: 1, b: 0, c: 0 },
  { key: '-b-', a: 0, b: 1, c: 0 },
  { key: '--c', a: 0, b: 0, c: 1 },
  { key: 'ab-', a: 1, b: 1, c: 0 },
  { key: '-bc', a: 0, b: 1, c: 1 },
  { key: 'a-c', a: 1, b: 0, c: 1 },
  { key: 'abc', a: 1, b: 1, c: 1 }
];

/** Expression library. `f` is evaluated per region. */
const LIB = [
  { tex: '\\emptyset', f: () => false },
  { tex: 'U', f: () => true },
  { tex: 'A', f: (r) => r.a },
  { tex: 'B', f: (r) => r.b },
  { tex: 'C', f: (r) => r.c },
  { tex: "A'", f: (r) => !r.a },
  { tex: "B'", f: (r) => !r.b },
  { tex: "C'", f: (r) => !r.c },
  { tex: 'A \\cap B', f: (r) => r.a && r.b },
  { tex: 'B \\cap C', f: (r) => r.b && r.c },
  { tex: 'A \\cap C', f: (r) => r.a && r.c },
  { tex: 'A \\cup B', f: (r) => r.a || r.b },
  { tex: 'B \\cup C', f: (r) => r.b || r.c },
  { tex: 'A \\cup C', f: (r) => r.a || r.c },
  { tex: 'A - B', f: (r) => r.a && !r.b },
  { tex: 'B - A', f: (r) => r.b && !r.a },
  { tex: 'A - C', f: (r) => r.a && !r.c },
  { tex: 'C - A', f: (r) => r.c && !r.a },
  { tex: 'B - C', f: (r) => r.b && !r.c },
  { tex: 'C - B', f: (r) => r.c && !r.b },
  { tex: 'A \\cap B \\cap C', f: (r) => r.a && r.b && r.c },
  { tex: 'A \\cup B \\cup C', f: (r) => r.a || r.b || r.c },
  { tex: "(A \\cup B)'", f: (r) => !(r.a || r.b) },
  { tex: "(A \\cap B)'", f: (r) => !(r.a && r.b) },
  { tex: "(A \\cup B \\cup C)'", f: (r) => !(r.a || r.b || r.c) },
  { tex: "A' \\cap B'", f: (r) => !r.a && !r.b },
  { tex: "A' \\cup B'", f: (r) => !r.a || !r.b },
  { tex: 'A \\triangle B', f: (r) => Boolean(r.a) !== Boolean(r.b) },
  { tex: 'B \\triangle C', f: (r) => Boolean(r.b) !== Boolean(r.c) },
  { tex: 'A \\cap (B \\cup C)', f: (r) => r.a && (r.b || r.c) },
  { tex: 'A \\cup (B \\cap C)', f: (r) => r.a || (r.b && r.c) },
  { tex: 'A - (B \\cup C)', f: (r) => r.a && !r.b && !r.c },
  { tex: '(A \\cap B) - C', f: (r) => r.a && r.b && !r.c },
  { tex: '(A \\cup B) - C', f: (r) => (r.a || r.b) && !r.c },
  { tex: "A \\cap B' \\cap C", f: (r) => r.a && !r.b && r.c }
];

const setOf = (f) => new Set(REGIONS.filter((r) => f(r)).map((r) => r.key));
const sameSet = (x, y) => x.size === y.size && [...x].every((k) => y.has(k));

/** Challenges deliberately include both De Morgan pairs. */
const CHALLENGES = [
  'A \\cap B', 'A \\cup B', "(A \\cup B)'", "A' \\cap B'",
  'A - B', 'A \\triangle B', 'A \\cap B \\cap C', 'A - (B \\cup C)',
  'A \\cap (B \\cup C)', '(A \\cap B) - C', "(A \\cup B \\cup C)'", 'B \\cup C'
];

export default {
  id: 'vennLab',

  mount(root, ctx) {
    const cab = arcade(root, {
      title: 'Venn Lab',
      badge: 'Shade the region',
      hint: 'Click a region to shade it. The expression is named underneath.',
      best: ctx.best ?? null,
      onRestart: start
    });

    let mode = 'free';
    let shaded = new Set();
    let target = null, queue = [], score = 0, solved = 0, settled = false;

    const stageBox = h('div', { style: { padding: '8px' } });
    cab.stage.appendChild(stageBox);

    /* ---------------- geometry ---------------- */
    let geo = { cx: 0, cy: 0, R: 60 };

    const circles = () => {
      const { cx, cy, R } = geo;
      const d = R * 0.62;
      return {
        a: { x: cx - d, y: cy - d * 0.55, r: R },
        b: { x: cx + d, y: cy - d * 0.55, r: R },
        c: { x: cx, y: cy + d * 0.95, r: R }
      };
    };

    const view = canvasLayer(stageBox, {
      height: 300,
      draw(g, w, hgt) {
        geo = { cx: w / 2, cy: hgt / 2 - 6, R: Math.min(w * 0.23, hgt * 0.30) };
        const C = circles();
        const hue = cssVar('--hue') || cssVar('--maths');

        // universe box
        g.strokeStyle = cssVar('--line');
        g.lineWidth = 1.5;
        c2d.roundRect(g, 14, 10, w - 28, hgt - 34, 10);
        g.stroke();
        c2d.text(g, 'U', w - 28, 24, { size: 14, weight: 800, color: cssVar('--ink-4') });

        // shaded regions, one offscreen layer each
        for (const key of shaded) {
          const r = REGIONS.find((x) => x.key === key);
          paintRegion(g, w, hgt, r, C, hue);
        }

        // circle outlines
        for (const [name, k] of Object.entries(C)) {
          g.beginPath();
          g.arc(k.x, k.y, k.r, 0, Math.PI * 2);
          g.strokeStyle = cssVar('--ink-3');
          g.lineWidth = 2;
          g.stroke();
        }
        c2d.text(g, 'A', C.a.x - C.a.r * 0.72, C.a.y - C.a.r * 0.72, { size: 16, weight: 800, color: cssVar('--ink-1') });
        c2d.text(g, 'B', C.b.x + C.b.r * 0.72, C.b.y - C.b.r * 0.72, { size: 16, weight: 800, color: cssVar('--ink-1') });
        c2d.text(g, 'C', C.c.x, C.c.y + C.c.r * 0.86, { size: 16, weight: 800, color: cssVar('--ink-1') });
      },
      onPointer(type, pos) {
        if (type !== 'down') return;
        const r = regionAt(pos.x, pos.y);
        if (r) toggle(r.key);
      }
    });

    /**
     * Fill one region by clipping to the circles it is inside, then erasing
     * the circles it must be outside of. Done on an offscreen canvas so the
     * erase does not punch holes in anything already drawn.
     */
    function paintRegion(g, w, hgt, region, C, hue) {
      const off = document.createElement('canvas');
      off.width = w; off.height = hgt;
      const o = off.getContext('2d');

      o.save();
      // Start from the universe rectangle, then intersect the included circles.
      o.beginPath();
      o.rect(14, 10, w - 28, hgt - 34);
      o.clip();
      for (const [name, k] of Object.entries(C)) {
        if (!region[name]) continue;
        o.beginPath();
        o.arc(k.x, k.y, k.r, 0, Math.PI * 2);
        o.clip();
      }
      o.fillStyle = hue;
      o.fillRect(0, 0, w, hgt);
      o.restore();

      o.globalCompositeOperation = 'destination-out';
      for (const [name, k] of Object.entries(C)) {
        if (region[name]) continue;
        o.beginPath();
        o.arc(k.x, k.y, k.r, 0, Math.PI * 2);
        o.fill();
      }

      g.save();
      g.globalAlpha = 0.42;
      g.drawImage(off, 0, 0);
      g.restore();
    }

    function regionAt(x, y) {
      const C = circles();
      if (x < 14 || x > view.width - 14 || y < 10 || y > view.height - 24) return null;
      const inside = (k) => (x - k.x) ** 2 + (y - k.y) ** 2 <= k.r ** 2;
      const a = inside(C.a) ? 1 : 0, b = inside(C.b) ? 1 : 0, c = inside(C.c) ? 1 : 0;
      return REGIONS.find((r) => r.a === a && r.b === b && r.c === c);
    }

    function toggle(key) {
      if (settled) return;
      if (shaded.has(key)) shaded.delete(key); else shaded.add(key);
      sfx.pop();
      view.redraw();
      describe();
      if (mode === 'challenge') checkChallenge();
    }

    /* ---------------- naming ---------------- */

    const nameBox = h('div', { style: { textAlign: 'center', minHeight: '44px', margin: '6px 0 12px' } });

    function describe() {
      clear(nameBox);
      if (mode === 'challenge') return;

      const cur = new Set(shaded);
      const match = LIB.find((e) => sameSet(setOf(e.f), cur));

      nameBox.appendChild(h('div.tiny.dim', null, 'YOU HAVE SHADED'));
      if (match) {
        nameBox.appendChild(h('div', { style: { fontSize: '1.25rem', marginTop: '4px' } }, renderMath(match.tex)));
        // Point out De Morgan equivalences where they exist.
        const alt = LIB.filter((e) => e !== match && sameSet(setOf(e.f), cur));
        if (alt.length) {
          nameBox.appendChild(h('div.small.muted', { style: { marginTop: '4px' } },
            'also equals ', ...alt.map((e) => renderMath(e.tex))));
        }
      } else if (!cur.size) {
        nameBox.appendChild(h('div', { style: { marginTop: '4px' } }, renderMath('\\emptyset')));
      } else {
        nameBox.appendChild(h('div.small.muted', { style: { marginTop: '4px' } },
          `${cur.size} region${cur.size > 1 ? 's' : ''} — no single standard expression names exactly this set.`));
      }
    }

    /* ---------------- challenge mode ---------------- */

    const taskBox = h('div', { style: { textAlign: 'center', marginBottom: '10px' } });

    function renderChallenge() {
      clear(taskBox);
      if (!target) return;
      taskBox.appendChild(h('div.tiny.dim', null, `SHADE THIS SET  ·  ${solved + 1} / 5`));
      taskBox.appendChild(h('div', { style: { fontSize: '1.4rem', marginTop: '4px' } }, renderMath(target)));
    }

    function checkChallenge() {
      const want = setOf(LIB.find((e) => e.tex === target).f);
      if (!sameSet(shaded, want)) return;

      settled = true;
      solved++;
      score += 30;
      cab.setScore(score);
      sfx.levelUp();
      ctx.fx?.burstAt(view.canvas, { count: 22 });

      const equivalents = LIB.filter((e) => e.tex !== target && sameSet(setOf(e.f), want));
      clear(taskBox);
      taskBox.appendChild(h('div.verdict.verdict--ok', null,
        h('div.verdict__head', null, '✓ Correct region'),
        h('div.verdict__body.small', null,
          equivalents.length
            ? h('div', null, 'Note this is the same set as ', ...equivalents.map((e) => renderMath(e.tex)),
                h('p', { style: { marginTop: '6px', marginBottom: 0 } },
                  renderInline(equivalents.some((e) => e.tex.includes("'"))
                    ? 'That equivalence **is** De Morgan’s law — you just shaded a proof of it.'
                    : 'Two different expressions, one region.')))
            : h('div', null, 'Exactly right.')
        )));
      taskBox.appendChild(h('div.btnbar', { style: { justifyContent: 'center', marginTop: '10px' } },
        btn(solved >= 5 ? 'Finish' : 'Next challenge', nextChallenge, { kind: 'primary', size: 'md' })));
    }

    function nextChallenge() {
      if (solved >= 5) return finish();
      settled = false;
      shaded = new Set();
      target = queue.shift();
      view.redraw();
      renderChallenge();
      clear(nameBox);
    }

    /* ---------------- panel ---------------- */

    cab.panel.appendChild(taskBox);
    cab.panel.appendChild(nameBox);
    cab.panel.appendChild(h('div.row', { style: { justifyContent: 'center', gap: '12px', flexWrap: 'wrap' } },
      seg([{ value: 'free', label: 'Explore' }, { value: 'challenge', label: 'Challenge' }], mode, (v) => {
        mode = v;
        shaded = new Set();
        settled = false;
        view.redraw();
        clear(taskBox); clear(nameBox);
        if (v === 'challenge') { queue = shuffle(CHALLENGES); solved = 0; nextChallenge(); }
        else { describe(); cab.setHint('Click a region to shade it. The expression is named underneath.'); }
      }),
      btn('Clear shading', () => { shaded = new Set(); settled = false; view.redraw(); describe(); if (mode === 'challenge') renderChallenge(); }, { kind: 'ghost' })
    ));

    function finish() {
      const best = Math.max(ctx.best ?? 0, score);
      cab.setBest(best);
      ctx.report(score, { best, solved });
      cab.overlay(cleared(score, best, start, h('p.small.muted', null, '5 regions shaded correctly.')));
    }

    function start() {
      cab.clearOverlay();
      score = 0; solved = 0; shaded = new Set(); settled = false; mode = 'free';
      cab.setScore(0);
      clear(taskBox);
      view.redraw();
      describe();
    }

    describe();
    return { destroy() { view.stop(); } };
  }
};
