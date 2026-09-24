/**
 * Drop Tower - vertical motion, with the sign convention exposed as a control.
 *
 * Learners lose marks here to signs, not physics. So the sign convention is a
 * switch they operate, and the console prints u, a and s with the signs that
 * convention implies. Flip it mid-problem and watch every number invert while
 * the physical answer does not.
 */

import { h, clear } from '../../core/dom.js';
import { renderInline, renderMath } from '../../core/mathlite.js';
import { sfx } from '../../core/audio.js';
import { arcade, canvasLayer, cssVar, c2d, slider, readouts, btn, seg, ground, clamp, round } from '../kit.js';

const G = 10;

const TASKS = [
  {
    text: 'Drop a body from **45 m** with zero launch speed. Predict its time of flight before pressing Launch.',
    setup: { h: 45, u: 0 },
    ask: 'time', answer: 3, unit: 's',
    note: '$h = \\tfrac{1}{2}gt^2 \\Rightarrow 45 = 5t^2 \\Rightarrow t = 3$ s. Mass never entered the calculation.'
  },
  {
    text: 'Throw a body **upward at 20 m/s** from ground level. Predict the maximum height.',
    setup: { h: 0, u: 20 },
    ask: 'height', answer: 20, unit: 'm',
    note: '$H = u^2/2g = 400/20 = 20$ m, reached after $u/g = 2$ s — exactly half the flight.'
  },
  {
    text: 'Throw a body **upward at 20 m/s from a 25 m tower**. Predict the total time until it hits the ground.',
    setup: { h: 25, u: 20 },
    ask: 'time', answer: 5, unit: 's',
    note: 'Taking up as positive: $-25 = 20t - 5t^2$, so $5t^2 - 20t - 25 = 0$, i.e. $t^2 - 4t - 5 = 0$, giving $t = 5$ s. The negative root is rejected.'
  },
  {
    text: 'Throw a body **downward at 10 m/s from 60 m**. Predict its landing speed.',
    setup: { h: 60, u: -10 },
    ask: 'speed', answer: 36.06, unit: 'm s⁻¹',
    note: '$v^2 = u^2 + 2gh = 100 + 2(10)(60) = 1300$, so $v = \\sqrt{1300} = 36.06\\ \\text{m s}^{-1}$. Dropped from rest it would have landed at $34.6$ — the $10\\ \\text{m s}^{-1}$ head start buys surprisingly little, because speeds add in quadrature here, not linearly.'
  }
];

export default {
  id: 'dropTower',

  mount(root, ctx) {
    const cab = arcade(root, {
      title: 'Drop Tower',
      badge: 'Vertical motion',
      hint: 'Set the height and launch speed, then predict before you launch.',
      best: ctx.best ?? null,
      onRestart: start
    });

    const st = { h: 45, u: 0, t: 0, y: 45, v: 0, running: false, landed: false, maxY: 45 };
    let upPositive = true;
    let score = 0, taskIdx = 0, settling = false;

    const stageBox = h('div');
    cab.stage.appendChild(stageBox);

    const view = canvasLayer(stageBox, {
      height: 300,
      animate: true,
      draw(g, w, hgt) {
        if (st.running) tick();

        const hue = cssVar('--physics');
        const baseY = hgt - 36;
        const topY = 20;
        const span = Math.max(60, st.maxY * 1.15, st.h * 1.15);
        const Y = (m) => baseY - (m / span) * (baseY - topY);
        const px = w * 0.42;

        ground(g, 14, w - 14, baseY);

        // the tower
        if (st.h > 0) {
          g.fillStyle = cssVar('--bg-3');
          c2d.roundRect(g, px - 42, Y(st.h), 30, baseY - Y(st.h), 3);
          g.fill();
          g.strokeStyle = cssVar('--line'); g.lineWidth = 1; g.stroke();
          c2d.text(g, `${st.h} m`, px - 27, Y(st.h) - 10, { size: 10, weight: 800, color: cssVar('--ink-3') });
        }

        // height gridlines
        g.save();
        g.globalAlpha = 0.45;
        const stepM = span > 90 ? 20 : 10;
        for (let m = 0; m <= span; m += stepM) {
          c2d.line(g, 20, Y(m), w - 20, Y(m), { color: cssVar('--line'), width: 1, dash: [2, 6] });
          c2d.text(g, `${m}`, w - 16, Y(m), { size: 9, color: cssVar('--ink-4'), align: 'right' });
        }
        g.restore();

        // apex marker
        if (st.maxY > st.h + 0.5) {
          c2d.line(g, 20, Y(st.maxY), w - 20, Y(st.maxY), { color: cssVar('--accent'), width: 1.4, dash: [4, 4] });
          c2d.text(g, `apex ${round(st.maxY, 1)} m`, 24, Y(st.maxY) - 10,
            { size: 10, weight: 800, color: cssVar('--accent'), align: 'left' });
        }

        // the body
        const by = Y(clamp(st.y, 0, span));
        g.fillStyle = hue;
        g.beginPath(); g.arc(px, by, 11, 0, Math.PI * 2); g.fill();
        g.strokeStyle = cssVar('--bg-1'); g.lineWidth = 2; g.stroke();

        // velocity arrow (physical direction, regardless of convention)
        if (Math.abs(st.v) > 0.5 && !st.landed) {
          const len = clamp(Math.abs(st.v) * 1.6, 10, 60);
          const dir = st.v > 0 ? -1 : 1;
          c2d.arrow(g, px + 26, by, px + 26, by + dir * len,
            { color: st.v > 0 ? cssVar('--ok') : cssVar('--bad'), width: 2.6, head: 8 });
        }

        // g arrow: always down, always the same
        c2d.arrow(g, px - 60, by - 12, px - 60, by + 12, { color: cssVar('--ink-3'), width: 2, head: 7 });
        c2d.text(g, upPositive ? 'a = −g' : 'a = +g', px - 60, by + 28,
          { size: 10, weight: 800, color: cssVar('--ink-3') });

        // sign convention banner
        c2d.text(g, upPositive ? '↑ positive' : '↓ positive', 20, 16,
          { size: 10, weight: 800, color: cssVar('--accent'), align: 'left' });
      }
    });

    function tick() {
      const dt = 1 / 60;
      st.v -= G * dt;
      st.y += st.v * dt;
      st.t += dt;
      st.maxY = Math.max(st.maxY, st.y);
      if (st.y <= 0) {
        st.y = 0;
        st.running = false;
        st.landed = true;
        sfx.drop();
        refresh();
        checkTask();
      }
      refresh();
    }

    /* ---------------- panel ---------------- */

    const out = readouts([
      { key: 't', label: 'time (s)', value: '0.00' },
      { key: 'y', label: 'height (m)', value: '0' },
      { key: 'v', label: 'velocity', value: '0' },
      { key: 'u', label: 'u as signed', value: '0' },
      { key: 'a', label: 'a as signed', value: '−10' },
      { key: 's', label: 's as signed', value: '0' }
    ]);

    const hSlider = slider({
      label: 'Tower height', min: 0, max: 100, step: 5, value: st.h, unit: ' m',
      fmt: (v) => String(v), onInput: (v) => { st.h = v; reset(); }
    });
    const uSlider = slider({
      label: 'Launch velocity (up positive)', min: -30, max: 30, step: 1, value: st.u,
      unit: ' m s⁻¹', fmt: (v) => String(v), onInput: (v) => { st.u = v; reset(); }
    });

    const taskBox = h('div.callout.callout--jee', { style: { margin: '0 0 12px' } });
    const answerBox = h('div');

    cab.panel.appendChild(taskBox);
    cab.panel.appendChild(out.root);
    cab.panel.appendChild(h('div.row', { style: { justifyContent: 'center', margin: '14px 0' } },
      h('span.small.muted', null, 'Sign convention:'),
      seg([{ value: 'up', label: '↑ up positive' }, { value: 'down', label: '↓ down positive' }],
        'up', (v) => { upPositive = v === 'up'; refresh(); })
    ));
    cab.panel.appendChild(h('div', {
      style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '16px' }
    }, hSlider.root, uSlider.root));
    cab.panel.appendChild(h('div.btnbar', { style: { marginTop: 'var(--sp-4)' } },
      btn('▶ Launch', launch, { kind: 'primary', size: 'md' }),
      btn('Reset', reset, { kind: 'ghost' })));
    cab.panel.appendChild(answerBox);

    function refresh() {
      const sgn = upPositive ? 1 : -1;
      out.set('t', st.t.toFixed(2));
      out.set('y', round(st.y, 1));
      out.set('v', round(st.v, 1), st.v > 0 ? 'ok' : st.v < 0 ? 'bad' : null);
      out.set('u', round(st.u * sgn, 1));
      out.set('a', String(upPositive ? '−10' : '+10'));
      out.set('s', round((st.y - st.h) * sgn, 1));
    }

    function launch() {
      if (st.running) return;
      st.t = 0; st.y = st.h; st.v = st.u; st.maxY = st.h; st.landed = false;
      st.running = true;
      sfx.whoosh();
      refresh();
    }

    function reset() {
      st.running = false; st.landed = false;
      st.t = 0; st.y = st.h; st.v = 0; st.maxY = st.h;
      refresh();
      view.redraw();
    }

    /* ---------------- tasks ---------------- */

    function renderTask() {
      clear(taskBox); clear(answerBox);
      if (taskIdx >= TASKS.length) {
        taskBox.className = 'callout callout--tip';
        taskBox.appendChild(h('div.callout__label', null, '✓ All predictions made'));
        taskBox.appendChild(h('div.small', null, renderInline(
          'Free play. Flip the sign convention mid-setup and watch every signed value invert while the physics does not move.')));
        return;
      }
      const task = TASKS[taskIdx];
      taskBox.className = 'callout callout--jee';
      taskBox.appendChild(h('div.callout__label', null, `Prediction ${taskIdx + 1} / ${TASKS.length}`));
      taskBox.appendChild(h('div.small', null, renderInline(task.text)));

      // Pre-set the apparatus so the learner works on the stated problem.
      st.h = task.setup.h; st.u = task.setup.u;
      hSlider.set(st.h); uSlider.set(st.u);
      reset();

      const input = h('input.input.mono', {
        type: 'text', inputmode: 'decimal', placeholder: `your prediction (${task.unit})`,
        style: { maxWidth: '230px' },
        onKeyDown: (e) => { if (e.key === 'Enter') grade(input.value); }
      });
      taskBox.appendChild(h('div.row', { style: { gap: '10px', marginTop: '10px', flexWrap: 'wrap' } },
        input, btn('Submit prediction', () => grade(input.value), { kind: 'primary' })));
    }

    let predicted = null;

    function grade(raw) {
      const task = TASKS[taskIdx];
      const val = Number(String(raw).trim());
      if (!Number.isFinite(val)) { cab.setHint('Enter a number first.'); return; }
      predicted = val;
      const ok = Math.abs(val - task.answer) <= Math.max(0.3, task.answer * 0.06);

      clear(answerBox);
      answerBox.appendChild(h('div.verdict' + (ok ? '.verdict--ok' : '.verdict--bad'), { style: { marginTop: '12px' } },
        h('div.verdict__head', null, ok ? `✓ ${task.answer} ${task.unit}` : `✗ The answer is ${task.answer} ${task.unit}`),
        h('div.verdict__body.small', null, renderInline(task.note))));

      if (ok) { score += 25; sfx.correct(); ctx.fx?.burstAt(answerBox, { count: 18 }); }
      else { score = Math.max(0, score - 5); sfx.wrong(); }
      cab.setScore(score);

      answerBox.appendChild(h('div.btnbar', { style: { marginTop: '10px' } },
        btn('▶ Launch and watch', launch),
        btn('Next prediction', () => {
          taskIdx++; predicted = null;
          renderTask();
          if (taskIdx >= TASKS.length) finish();
        }, { kind: 'primary' })));
    }

    function checkTask() {
      if (predicted === null) {
        cab.setHint(`Landed after ${st.t.toFixed(2)} s at ${Math.abs(st.v).toFixed(1)} m s⁻¹. Apex was ${round(st.maxY, 1)} m.`);
      }
    }

    function finish() {
      const best = Math.max(ctx.best ?? 0, score);
      cab.setBest(best);
      ctx.report(score, { best, tasks: TASKS.length });
    }

    function start() {
      cab.clearOverlay();
      score = 0; taskIdx = 0; settling = false; predicted = null;
      upPositive = true;
      cab.setScore(0);
      renderTask();
    }

    start();
    return { destroy() { view.stop(); } };
  }
};
