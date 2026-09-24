/**
 * Motion Probe - drive a body and watch its three graphs draw themselves.
 *
 * The learner controls the *acceleration*, not the position, which is the
 * whole lesson: you push, and position is two integrations away. Challenges
 * then ask for specific graph shapes, which cannot be produced by accident.
 */

import { h, clear } from '../../core/dom.js';
import { renderInline } from '../../core/mathlite.js';
import { sfx } from '../../core/audio.js';
import { arcade, canvasLayer, cssVar, c2d, slider, readouts, btn, seg, clamp, round } from '../kit.js';

const DUR = 10;          // seconds of recording
const DT = 1 / 30;

const CHALLENGES = [
  {
    text: 'Produce a **straight, rising x–t graph** — constant velocity, zero acceleration.',
    test: (r) => r.length > 120 && r.every((s) => Math.abs(s.a) < 0.6) && Math.abs(r[r.length - 1].x - r[0].x) > 12,
    note: 'Zero acceleration means the v–t graph is flat and the x–t graph is a straight line. Constant velocity is the *absence* of a push, not a kind of push.'
  },
  {
    text: 'Produce a **curved x–t graph that steepens** — hold a steady positive acceleration.',
    test: (r) => r.length > 120 && r.filter((s) => s.a > 1.5).length > 90 && r[r.length - 1].v > 8,
    note: 'Constant positive acceleration gives a straight sloping v–t line and a parabolic x–t curve. The x–t slope grows because the velocity is growing.'
  },
  {
    text: 'Make the body **turn round**: end up moving backwards after moving forwards.',
    test: (r) => r.some((s) => s.v > 5) && r[r.length - 1].v < -2,
    note: 'The turning point is where v crosses zero — and that is exactly where the x–t graph has its maximum. Acceleration is not zero there.'
  },
  {
    text: 'Finish **back where you started** ($x \\approx 0$) after travelling at least 30 m.',
    test: (r) => r.length > 150 && Math.abs(r[r.length - 1].x) < 3 && r[r.length - 1].dist > 30,
    note: 'Zero displacement, large distance — and therefore zero average velocity with a large average speed. The area under the v–t graph cancelled out.'
  }
];

export default {
  id: 'motionProbe',

  mount(root, ctx) {
    const cab = arcade(root, {
      title: 'Motion Probe',
      badge: 'Three graphs, one motion',
      hint: 'Drag the throttle to set the acceleration. Recording runs for 10 s.',
      best: ctx.best ?? null,
      onRestart: start
    });

    let rec = [];                      // {t, x, v, a, dist}
    let state = { t: 0, x: 0, v: 0, a: 0, dist: 0 };
    let running = false;
    let score = 0, chIdx = 0, settling = false;
    let mode = 'x';

    const stageBox = h('div');
    cab.stage.appendChild(stageBox);

    /* ---------------- the track ---------------- */
    const track = canvasLayer(stageBox, {
      height: 92,
      animate: true,
      draw(g, w, hgt) {
        if (running) step();
        const hue = cssVar('--physics');
        const mid = hgt / 2;

        c2d.line(g, 12, mid + 20, w - 12, mid + 20, { color: cssVar('--ink-4'), width: 2 });
        // marks every 10 m, centred on the origin
        const scale = (w - 40) / 120;
        const X = (m) => w / 2 + m * scale;
        for (let m = -60; m <= 60; m += 10) {
          const x = X(m);
          c2d.line(g, x, mid + 20, x, mid + 26, { color: cssVar('--line'), width: 1 });
          if (m % 20 === 0) c2d.text(g, String(m), x, mid + 34, { size: 9, color: cssVar('--ink-4') });
        }

        const px = X(clamp(state.x, -62, 62));
        g.fillStyle = hue;
        g.beginPath(); g.arc(px, mid, 12, 0, Math.PI * 2); g.fill();
        g.strokeStyle = cssVar('--bg-1'); g.lineWidth = 2; g.stroke();

        // velocity arrow on the body
        if (Math.abs(state.v) > 0.4) {
          c2d.arrow(g, px, mid, px + clamp(state.v * 2.2, -60, 60), mid,
            { color: cssVar('--accent'), width: 2.4, head: 7 });
        }
        c2d.text(g, `t = ${state.t.toFixed(1)} s`, 14, 14,
          { size: 11, weight: 800, font: 'mono', color: cssVar('--ink-3'), align: 'left' });
      }
    });

    /* ---------------- the graph ---------------- */
    const graph = canvasLayer(stageBox, {
      height: 190,
      animate: true,
      draw(g, w, hgt) {
        const padL = 44, padB = 26, padT = 12;
        const pw = w - padL - 14, ph = hgt - padT - padB;

        const series = mode === 'x' ? rec.map((s) => s.x)
          : mode === 'v' ? rec.map((s) => s.v)
          : rec.map((s) => s.a);
        const label = mode === 'x' ? 'x (m)' : mode === 'v' ? 'v (m s⁻¹)' : 'a (m s⁻²)';
        const lim = mode === 'x' ? 60 : mode === 'v' ? 20 : 6;

        const X = (tt) => padL + (tt / DUR) * pw;
        const Y = (val) => padT + ph / 2 - (val / lim) * (ph / 2);

        // grid + axes
        g.save();
        g.strokeStyle = cssVar('--chart-grid'); g.lineWidth = 1;
        for (let i = 0; i <= 10; i++) { const x = X(i); g.beginPath(); g.moveTo(x, padT); g.lineTo(x, padT + ph); g.stroke(); }
        for (let i = -2; i <= 2; i++) { const y = Y((lim * i) / 2); g.beginPath(); g.moveTo(padL, y); g.lineTo(padL + pw, y); g.stroke(); }
        g.restore();
        c2d.line(g, padL, Y(0), padL + pw, Y(0), { color: cssVar('--chart-ink'), width: 1.4 });
        c2d.line(g, padL, padT, padL, padT + ph, { color: cssVar('--chart-ink'), width: 1.4 });
        for (let i = -2; i <= 2; i++) {
          const v = (lim * i) / 2;
          c2d.text(g, String(v), padL - 6, Y(v), { size: 9, color: cssVar('--chart-ink'), align: 'right' });
        }
        c2d.text(g, 't (s)', padL + pw, hgt - 6, { size: 10, weight: 700, color: cssVar('--chart-ink'), align: 'right' });
        c2d.text(g, label, padL - 36, padT + 4, { size: 10, weight: 700, color: cssVar('--chart-ink'), align: 'left' });

        if (series.length > 1) {
          const colour = mode === 'x' ? cssVar('--chart-1') : mode === 'v' ? cssVar('--accent') : cssVar('--chart-3');
          g.save();
          g.strokeStyle = colour; g.lineWidth = 2.4; g.lineJoin = 'round';
          g.beginPath();
          series.forEach((val, i) => {
            const px = X(rec[i].t), py = Y(clamp(val, -lim, lim));
            i ? g.lineTo(px, py) : g.moveTo(px, py);
          });
          g.stroke();
          g.restore();
        }
      }
    });

    /* ---------------- physics ---------------- */

    function step() {
      state.a = throttle.get() / 10;
      state.v += state.a * DT;
      state.v = clamp(state.v, -22, 22);
      const dx = state.v * DT;
      state.x += dx;
      state.dist += Math.abs(dx);
      state.t += DT;

      if (Math.abs(state.x) > 62) { state.x = clamp(state.x, -62, 62); state.v = 0; }

      rec.push({ ...state });
      out.set('t', state.t.toFixed(1));
      out.set('x', round(state.x, 1));
      out.set('v', round(state.v, 1));
      out.set('a', round(state.a, 1));

      if (state.t >= DUR) { running = false; sfx.pop(); checkChallenge(); renderControls(); }
    }

    /* ---------------- controls ---------------- */

    const out = readouts([
      { key: 't', label: 'time (s)', value: '0.0' },
      { key: 'x', label: 'position (m)', value: '0' },
      { key: 'v', label: 'velocity', value: '0' },
      { key: 'a', label: 'acceleration', value: '0' }
    ]);

    const throttle = slider({
      label: 'Throttle — acceleration', min: -50, max: 50, step: 1, value: 0,
      unit: ' m s⁻²', fmt: (v) => (v / 10).toFixed(1), onInput: () => {}
    });

    const chBox = h('div.callout.callout--jee', { style: { margin: '0 0 12px' } });
    const controls = h('div');
    cab.panel.appendChild(chBox);
    cab.panel.appendChild(out.root);
    cab.panel.appendChild(controls);

    function renderControls() {
      clear(controls);
      controls.appendChild(h('div.row', { style: { justifyContent: 'center', margin: '14px 0' } },
        seg([
          { value: 'x', label: 'x – t' },
          { value: 'v', label: 'v – t' },
          { value: 'a', label: 'a – t' }
        ], mode, (v) => { mode = v; graph.redraw(); })));
      controls.appendChild(throttle.root);
      controls.appendChild(h('div.btnbar', { style: { marginTop: 'var(--sp-4)' } },
        running
          ? btn('Stop', () => { running = false; renderControls(); }, { kind: 'bad' })
          : btn('▶ Record 10 s', begin, { kind: 'primary', size: 'md' }),
        btn('Reset', reset, { kind: 'ghost' })
      ));
    }

    function begin() {
      reset();
      running = true;
      renderControls();
    }

    function reset() {
      running = false;
      rec = [];
      state = { t: 0, x: 0, v: 0, a: 0, dist: 0 };
      out.set('t', '0.0'); out.set('x', '0'); out.set('v', '0'); out.set('a', '0');
      graph.redraw();
      renderControls();
    }

    /* ---------------- challenges ---------------- */

    function renderChallenge() {
      clear(chBox);
      if (chIdx >= CHALLENGES.length) {
        chBox.className = 'callout callout--tip';
        chBox.appendChild(h('div.callout__label', null, '✓ All shapes produced'));
        chBox.appendChild(h('div.small', null, 'Free play — try to draw a v–t graph that is a perfect triangle.'));
        return;
      }
      chBox.className = 'callout callout--jee';
      chBox.appendChild(h('div.callout__label', null, `Challenge ${chIdx + 1} / ${CHALLENGES.length}`));
      chBox.appendChild(h('div.small', null, renderInline(CHALLENGES[chIdx].text)));
    }

    function checkChallenge() {
      if (settling || chIdx >= CHALLENGES.length) return;
      const c = CHALLENGES[chIdx];
      if (!c.test(rec)) {
        cab.setHint('Not quite that shape. Watch the graph while you drive, not afterwards.');
        return;
      }

      settling = true;
      score += 30;
      cab.setScore(score);
      sfx.levelUp();
      ctx.fx?.burstAt(chBox, { count: 20 });

      clear(chBox);
      chBox.className = 'callout callout--tip';
      chBox.appendChild(h('div.callout__label', null, '✓ That is the shape'));
      chBox.appendChild(h('div.small', null, renderInline(c.note)));
      chBox.appendChild(h('div.btnbar', { style: { marginTop: '10px' } },
        btn('Next challenge', () => {
          chIdx++; settling = false;
          renderChallenge(); reset();
          if (chIdx >= CHALLENGES.length) finish();
        }, { kind: 'primary' })));
    }

    function finish() {
      const best = Math.max(ctx.best ?? 0, score);
      cab.setBest(best);
      ctx.report(score, { best, challenges: chIdx });
    }

    function start() {
      cab.clearOverlay();
      score = 0; chIdx = 0; settling = false; mode = 'x';
      cab.setScore(0);
      throttle.set(0);
      renderChallenge();
      reset();
    }

    start();
    return { destroy() { track.stop(); graph.stop(); } };
  }
};
