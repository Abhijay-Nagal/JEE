/**
 * Path Tracer - draw a route and watch distance and displacement diverge.
 *
 * The missions force the learner to *produce* specific relationships between
 * the two quantities, which is much harder than recognising them and is where
 * the understanding actually forms.
 */

import { h, clear } from '../../core/dom.js';
import { renderInline } from '../../core/mathlite.js';
import { sfx } from '../../core/audio.js';
import { arcade, canvasLayer, cssVar, c2d, readouts, btn, cleared, round } from '../kit.js';

const MISSIONS = [
  {
    text: 'Draw any path at all. Just get moving.',
    test: (s) => s.distance > 60,
    note: 'Distance only ever grows. Displacement is free to do whatever it likes.'
  },
  {
    text: 'Make the **displacement zero** while the distance is over 300 m.',
    test: (s) => s.distance > 300 && s.displacement < 12,
    note: 'A closed loop. You travelled a long way and got precisely nowhere — which is why average *velocity* for a round trip is always zero.'
  },
  {
    text: 'Get the ratio distance : displacement **below 1.1** with a distance over 200 m.',
    test: (s) => s.distance > 200 && s.displacement > 0 && s.distance / s.displacement < 1.1,
    note: 'Nearly a straight line. The two quantities agree only when the motion does not wander — and they are exactly equal only for a perfectly straight, non-reversing path.'
  },
  {
    text: 'Make the ratio **greater than 3** — a genuinely wasteful journey.',
    test: (s) => s.distance > 150 && s.displacement > 8 && s.distance / s.displacement > 3,
    note: 'Loops and reversals inflate the distance without moving you. A semicircular arc gives $\\pi/2 \\approx 1.57$; you have beaten that comfortably.'
  }
];

export default {
  id: 'pathTracer',

  mount(root, ctx) {
    const cab = arcade(root, {
      title: 'Path Tracer',
      badge: 'Draw a route',
      hint: 'Press and drag on the grid to walk. Release to stop.',
      best: ctx.best ?? null,
      onRestart: start
    });

    /** Points are in metres; the canvas maps 1 m to ~1 px at 400 px wide. */
    let pts = [];
    let drawing = false;
    let score = 0, missionIdx = 0, settling = false;
    const stats = { distance: 0, displacement: 0 };

    const stageBox = h('div');
    cab.stage.appendChild(stageBox);

    let SCALE = 1;

    const view = canvasLayer(stageBox, {
      height: 320,
      draw(g, w, hgt) {
        SCALE = w / 420;
        const hue = cssVar('--physics');
        const accent = cssVar('--accent');

        // grid
        g.save();
        g.strokeStyle = cssVar('--chart-grid');
        g.lineWidth = 1;
        for (let x = 0; x < w; x += 40 * SCALE) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, hgt); g.stroke(); }
        for (let y = 0; y < hgt; y += 40 * SCALE) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
        g.restore();
        c2d.text(g, '1 square = 40 m', w - 10, hgt - 10,
          { size: 9, color: cssVar('--ink-4'), align: 'right' });

        if (!pts.length) {
          c2d.text(g, 'press and drag to walk a route', w / 2, hgt / 2,
            { size: 13, weight: 700, color: cssVar('--ink-4') });
          return;
        }

        // the walked path
        g.save();
        g.strokeStyle = hue;
        g.lineWidth = 3;
        g.lineJoin = 'round';
        g.lineCap = 'round';
        g.setLineDash([7, 5]);
        g.beginPath();
        pts.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)));
        g.stroke();
        g.restore();

        const a = pts[0], b = pts[pts.length - 1];

        // displacement arrow
        if (Math.hypot(b.x - a.x, b.y - a.y) > 6) {
          c2d.arrow(g, a.x, a.y, b.x, b.y, { color: accent, width: 3, head: 10 });
        }

        // endpoints
        g.fillStyle = cssVar('--ok');
        g.beginPath(); g.arc(a.x, a.y, 6, 0, Math.PI * 2); g.fill();
        c2d.text(g, 'start', a.x, a.y - 14, { size: 10, weight: 800, color: cssVar('--ok') });

        g.fillStyle = hue;
        g.beginPath(); g.arc(b.x, b.y, 7, 0, Math.PI * 2); g.fill();
        g.strokeStyle = cssVar('--bg-1'); g.lineWidth = 2; g.stroke();
      },
      onPointer(type, pos) {
        if (type === 'down') {
          if (!drawing && pts.length) pts = [];    // a new press starts a new route
          drawing = true;
          pts.push({ x: pos.x, y: pos.y });
          sfx.tick();
        } else if (type === 'move' && drawing) {
          const last = pts[pts.length - 1];
          // Sample sparsely so the "distance" is the path length, not pixel noise.
          if (!last || Math.hypot(pos.x - last.x, pos.y - last.y) > 4) {
            pts.push({ x: pos.x, y: pos.y });
            recompute();
          }
        } else if (type === 'up' || type === 'leave') {
          if (drawing) { drawing = false; recompute(); checkMission(); }
        }
        view.redraw();
      }
    });

    /* ---------------- readouts ---------------- */

    const out = readouts([
      { key: 'd', label: 'distance', value: '0 m' },
      { key: 's', label: '|displacement|', value: '0 m' },
      { key: 'r', label: 'ratio', value: '—' },
      { key: 'n', label: 'path points', value: '0' }
    ]);

    const missionBox = h('div.callout.callout--jee', { style: { margin: '0 0 12px' } });
    cab.panel.appendChild(missionBox);
    cab.panel.appendChild(out.root);
    cab.panel.appendChild(h('div.btnbar', { style: { marginTop: 'var(--sp-4)' } },
      btn('Clear route', () => { pts = []; recompute(); view.redraw(); }, { kind: 'ghost' })
    ));

    function recompute() {
      let d = 0;
      for (let i = 1; i < pts.length; i++) {
        d += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
      }
      const a = pts[0], b = pts[pts.length - 1];
      const s = pts.length ? Math.hypot(b.x - a.x, b.y - a.y) : 0;

      // Convert pixels to metres: one grid square is 40 m.
      const m = (px) => px / SCALE;
      stats.distance = m(d);
      stats.displacement = m(s);

      out.set('d', `${round(stats.distance, 0)} m`);
      out.set('s', `${round(stats.displacement, 0)} m`, stats.displacement < 12 ? 'ok' : null);
      out.set('r', stats.displacement > 1 ? (stats.distance / stats.displacement).toFixed(2) : '—');
      out.set('n', String(pts.length));

      if (stats.distance > 20) {
        cab.setHint(stats.displacement < 12
          ? 'Displacement has collapsed to almost nothing — you are back where you started.'
          : `You walked ${round(stats.distance, 0)} m and moved ${round(stats.displacement, 0)} m.`);
      }
    }

    /* ---------------- missions ---------------- */

    function renderMission() {
      clear(missionBox);
      if (missionIdx >= MISSIONS.length) {
        missionBox.className = 'callout callout--tip';
        missionBox.appendChild(h('div.callout__label', null, '✓ All missions cleared'));
        missionBox.appendChild(h('div.small', null, renderInline(
          'Free play. Try to get the ratio exactly $\\pi/2 \\approx 1.57$ by drawing a semicircle.')));
        return;
      }
      missionBox.className = 'callout callout--jee';
      missionBox.appendChild(h('div.callout__label', null, `Mission ${missionIdx + 1} / ${MISSIONS.length}`));
      missionBox.appendChild(h('div.small', null, renderInline(MISSIONS[missionIdx].text)));
    }

    function checkMission() {
      if (settling || missionIdx >= MISSIONS.length) return;
      const m = MISSIONS[missionIdx];
      if (!m.test(stats)) return;

      settling = true;
      score += 25;
      cab.setScore(score);
      sfx.levelUp();
      ctx.fx?.burstAt(missionBox, { count: 20 });

      clear(missionBox);
      missionBox.className = 'callout callout--tip';
      missionBox.appendChild(h('div.callout__label', null, '✓ Done'));
      missionBox.appendChild(h('div.small', null, renderInline(m.note)));
      missionBox.appendChild(h('div.btnbar', { style: { marginTop: '10px' } },
        btn('Next mission', () => {
          missionIdx++; settling = false;
          pts = []; recompute(); view.redraw();
          renderMission();
          if (missionIdx >= MISSIONS.length) finish();
        }, { kind: 'primary' })));
    }

    function finish() {
      const best = Math.max(ctx.best ?? 0, score);
      cab.setBest(best);
      ctx.report(score, { best, missions: MISSIONS.length });
    }

    function start() {
      cab.clearOverlay();
      pts = []; score = 0; missionIdx = 0; settling = false;
      cab.setScore(0);
      renderMission();
      recompute();
      view.redraw();
    }

    start();
    return { destroy() { view.stop(); } };
  }
};
