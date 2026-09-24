/**
 * Argand Plotter - drag a complex number around and watch everything about it
 * change at once.
 *
 * Modulus, argument, conjugate and polar form are four readings of one point.
 * The quadrant trap in particular only stops being a trap once you have dragged
 * a point into the second quadrant and seen the argument jump to 135 degrees
 * while the ratio b/a stayed at -1.
 */

import { h, clear } from '../../core/dom.js';
import { renderInline } from '../../core/mathlite.js';
import { sfx } from '../../core/audio.js';
import { arcade, canvasLayer, cssVar, c2d, readouts, btn, seg,
         verdictLine, cleared, clamp, round } from '../kit.js';

const D2R = Math.PI / 180;

const TASKS = [
  { text: 'Drag the point to $z = 3 + 4i$.',
    ok: (s) => s.a === 3 && s.b === 4,
    note: 'Modulus exactly 5 — the 3–4–5 triangle. Its argument is $\\tan^{-1}(4/3) \\approx 53.13^\\circ$. Examiners reuse this point constantly.' },
  { text: 'Find a point in the **second quadrant** whose argument is $135^\\circ$.',
    ok: (s) => s.a < 0 && s.b > 0 && Math.abs(s.argDeg - 135) < 1,
    note: 'Any point with $a = -b$ and $b > 0$, such as $-1+i$ or $-3+3i$. Note $\\tan^{-1}(b/a) = \\tan^{-1}(-1) = -45^\\circ$ on a calculator — which is the **fourth** quadrant. Plotting first is not optional.' },
  { text: 'Find a point whose principal argument is **negative**.',
    ok: (s) => s.argDeg < -0.5 && s.b !== 0,
    note: 'The principal argument lies in $(-180^\\circ, 180^\\circ]$, so anything below the real axis has a negative argument. A point at $-135^\\circ$ is in the third quadrant, not at $+225^\\circ$.' },
  { text: 'Put the point where $z$ and its conjugate $\\bar{z}$ are **equal**.',
    ok: (s) => s.b === 0 && s.a !== 0,
    note: '$z = \\bar{z}$ exactly when the imaginary part is zero — that is, when $z$ is real. The reflection in the real axis leaves the point where it is.' },
  { text: 'Find a point with modulus **5** that is **not** $3+4i$ or $4+3i$.',
    ok: (s) => Math.abs(s.mod - 5) < 0.02 && !(s.a === 3 && s.b === 4) && !(s.a === 4 && s.b === 3),
    note: 'The locus $|z| = 5$ is a whole circle. $5$, $-5$, $5i$ and $-5i$ all sit on it, as do $\\pm3\\pm4i$ in every sign combination — modulus fixes the distance and says nothing about direction.' }
];

export default {
  id: 'argandPlotter',

  mount(root, ctx) {
    const cab = arcade(root, {
      title: 'Argand Plotter',
      badge: 'Drag the number',
      hint: 'Drag the point, or use the steppers. Everything on the right updates with it.',
      best: ctx.best ?? null,
      onRestart: start
    });

    let a = 3, b = 2;                  // the current z
    let showConj = true, showPolar = true;
    let dragging = false;
    let score = 0, idx = 0, locked = false;

    const stageBox = h('div');
    cab.stage.appendChild(stageBox);

    const state = () => {
      const mod = Math.hypot(a, b);
      let argDeg = (Math.atan2(b, a) / D2R);
      if (argDeg <= -180) argDeg += 360;
      return { a, b, mod, argDeg };
    };

    /* ------------------------------------------------------------ */

    let MAP = null;                    // set on each draw, used by the pointer

    const view = canvasLayer(stageBox, {
      height: 340,
      animate: true,
      onPointer(type, p) {
        if (!MAP) return;
        if (type === 'down') dragging = true;
        if (type === 'up' || type === 'leave') { dragging = false; return; }
        if (!dragging) return;
        a = clamp(Math.round((p.x - MAP.cx) / MAP.U), -5, 5);
        b = clamp(Math.round((MAP.cy - p.y) / MAP.U), -5, 5);
        refresh();
      },
      draw(g, w, hgt) {
        const hue = cssVar('--maths');
        const ink = cssVar('--ink-4');
        const ok = cssVar('--ok');
        const accent = cssVar('--accent');

        const cx = w * 0.34, cy = hgt * 0.5;
        const U = Math.min(w * 0.06, hgt * 0.085);
        MAP = { cx, cy, U };
        const X = (x) => cx + x * U;
        const Y = (y) => cy - y * U;

        /* grid */
        g.save();
        g.strokeStyle = cssVar('--chart-grid'); g.lineWidth = 1;
        for (let i = -5; i <= 5; i++) {
          g.beginPath(); g.moveTo(X(i), Y(-5)); g.lineTo(X(i), Y(5)); g.stroke();
          g.beginPath(); g.moveTo(X(-5), Y(i)); g.lineTo(X(5), Y(i)); g.stroke();
        }
        g.restore();

        c2d.line(g, X(-5), Y(0), X(5), Y(0), { color: cssVar('--chart-ink'), width: 1.5 });
        c2d.line(g, X(0), Y(-5), X(0), Y(5), { color: cssVar('--chart-ink'), width: 1.5 });
        c2d.text(g, 'Re', X(5) + 4, Y(0) - 10, { size: 9, weight: 700, color: ink, align: 'left' });
        c2d.text(g, 'Im', X(0) + 8, Y(5) - 2, { size: 9, weight: 700, color: ink, align: 'left' });
        for (const v of [-4, -2, 2, 4]) {
          c2d.text(g, String(v), X(v), Y(0) + 11, { size: 8, color: ink });
          c2d.text(g, `${v}i`, X(0) - 8, Y(v), { size: 8, color: ink, align: 'right' });
        }

        const s = state();

        /* the modulus circle */
        if (s.mod > 0.01) {
          g.save();
          g.strokeStyle = cssVar('--line'); g.lineWidth = 1; g.setLineDash([3, 5]);
          g.beginPath(); g.arc(X(0), Y(0), s.mod * U, 0, Math.PI * 2); g.stroke();
          g.restore();
        }

        /* the argument arc */
        if (showPolar && s.mod > 0.01) {
          g.save();
          g.strokeStyle = accent; g.lineWidth = 2.2;
          g.beginPath();
          g.arc(X(0), Y(0), U * 1.3, 0, -s.argDeg * D2R, s.argDeg > 0);
          g.stroke();
          g.restore();
          c2d.text(g, `${s.argDeg.toFixed(1)}°`,
            X(0) + Math.cos(s.argDeg * D2R / 2) * U * 1.9,
            Y(0) - Math.sin(s.argDeg * D2R / 2) * U * 1.9,
            { size: 10, weight: 800, color: accent });
        }

        /* the legs */
        c2d.line(g, X(0), Y(0), X(a), Y(0), { color: cssVar('--chart-1'), width: 2, dash: [4, 3] });
        c2d.line(g, X(a), Y(0), X(a), Y(b), { color: cssVar('--chart-3'), width: 2, dash: [4, 3] });

        /* z */
        c2d.line(g, X(0), Y(0), X(a), Y(b), { color: hue, width: 2.8 });
        g.fillStyle = hue;
        g.beginPath(); g.arc(X(a), Y(b), 8, 0, Math.PI * 2); g.fill();
        g.strokeStyle = cssVar('--bg-1'); g.lineWidth = 2.4; g.stroke();
        c2d.text(g, `z = ${fmt(a, b)}`, X(a) + 14, Y(b) - 14,
          { size: 12, weight: 900, color: hue, align: 'left' });

        /* the conjugate */
        if (showConj && b !== 0) {
          c2d.line(g, X(0), Y(0), X(a), Y(-b), { color: ok, width: 2.2, dash: [5, 4] });
          g.fillStyle = ok;
          g.beginPath(); g.arc(X(a), Y(-b), 6, 0, Math.PI * 2); g.fill();
          c2d.text(g, `z̄ = ${fmt(a, -b)}`, X(a) + 14, Y(-b) + 14,
            { size: 11, weight: 900, color: ok, align: 'left' });
          c2d.line(g, X(a), Y(b), X(a), Y(-b), { color: ok, width: 1, dash: [2, 4] });
        }

        /* the panel */
        const px = w * 0.79;
        const rows = [
          ['Re(z)', String(a), cssVar('--chart-1')],
          ['Im(z)', String(b), cssVar('--chart-3')],
          ['|z|', s.mod.toFixed(3), hue],
          ['arg z', `${s.argDeg.toFixed(2)}°`, accent],
          ['quadrant', quadrant(a, b), cssVar('--ink-2')],
          ['z̄', fmt(a, -b), ok]
        ];
        g.fillStyle = cssVar('--bg-2');
        c2d.roundRect(g, px - 96, 22, 192, rows.length * 26 + 44, 10); g.fill();
        g.strokeStyle = cssVar('--line'); g.lineWidth = 1; g.stroke();
        rows.forEach((row, i) => {
          const y = 42 + i * 26;
          c2d.text(g, row[0], px - 84, y, { size: 10, weight: 700, color: ink, align: 'left' });
          c2d.text(g, row[1], px + 84, y, { size: 12, weight: 900, color: row[2], align: 'right', font: 'mono' });
        });
        if (showPolar) {
          c2d.text(g, `${s.mod.toFixed(2)} cis ${s.argDeg.toFixed(1)}°`,
            px, 42 + rows.length * 26 + 8, { size: 12, weight: 900, color: hue });
        }
      }
    });

    function fmt(re, im) {
      if (im === 0) return String(re);
      if (re === 0) return im === 1 ? 'i' : im === -1 ? '−i' : `${im}i`;
      const mag = Math.abs(im) === 1 ? '' : String(Math.abs(im));
      return `${re} ${im < 0 ? '−' : '+'} ${mag}i`;
    }

    function quadrant(re, im) {
      if (re === 0 && im === 0) return 'origin';
      if (im === 0) return 'real axis';
      if (re === 0) return 'imaginary axis';
      if (re > 0 && im > 0) return 'I';
      if (re < 0 && im > 0) return 'II';
      if (re < 0 && im < 0) return 'III';
      return 'IV';
    }

    /* ------------------------------------------------------------ */

    const out = readouts([
      { key: 'z', label: 'z', value: '—' },
      { key: 'm', label: '|z|', value: '—' },
      { key: 'g', label: 'arg z', value: '—' },
      { key: 'q', label: 'quadrant', value: '—' }
    ]);

    function refresh() {
      const s = state();
      out.set('z', fmt(a, b));
      out.set('m', round(s.mod, 3));
      out.set('g', `${s.argDeg.toFixed(1)}°`);
      out.set('q', quadrant(a, b));
    }

    const taskBox = h('div.callout.callout--jee', { style: { margin: '0 0 12px' } });
    const pad = h('div');
    const verdict = h('div');
    cab.panel.appendChild(taskBox);
    cab.panel.appendChild(out.root);
    cab.panel.appendChild(pad);
    cab.panel.appendChild(verdict);

    function step(which, by) {
      if (which === 'a') a = clamp(a + by, -5, 5);
      else b = clamp(b + by, -5, 5);
      refresh();
    }

    function renderPad() {
      clear(pad);
      pad.appendChild(h('div.row', { style: { justifyContent: 'center', margin: '10px 0 4px', gap: '8px' } },
        h('span.small.muted', null, 'Re'),
        btn('−', () => step('a', -1), { kind: 'ghost' }),
        btn('+', () => step('a', 1), { kind: 'ghost' }),
        h('span.small.muted', { style: { marginLeft: '10px' } }, 'Im'),
        btn('−', () => step('b', -1), { kind: 'ghost' }),
        btn('+', () => step('b', 1), { kind: 'ghost' })
      ));
      pad.appendChild(h('div.row', { style: { justifyContent: 'center', margin: '8px 0' } },
        seg([
          { value: 'both', label: 'z̄ and polar' },
          { value: 'conj', label: 'conjugate only' },
          { value: 'none', label: 'just z' }
        ], showConj && showPolar ? 'both' : showConj ? 'conj' : 'none', (v) => {
          showConj = v !== 'none';
          showPolar = v === 'both';
        })));
      pad.appendChild(h('div.btnbar', null,
        btn('Check', check, { kind: 'primary', size: 'md' })));
    }

    /* ------------------------------------------------------------ */

    function renderTask() {
      clear(taskBox);
      clear(verdict);
      renderPad();
      if (idx >= TASKS.length) {
        taskBox.className = 'callout callout--tip';
        taskBox.appendChild(h('div.callout__label', null, '✓ Plane mapped'));
        taskBox.appendChild(h('div.small', null, renderInline(
          'Free play: drag the point around the circle $|z| = 5$ and watch the argument sweep while the modulus never moves.')));
        return;
      }
      taskBox.className = 'callout callout--jee';
      taskBox.appendChild(h('div.callout__label', null, `Task ${idx + 1} / ${TASKS.length}`));
      taskBox.appendChild(h('div.small', null, renderInline(TASKS[idx].text)));
    }

    function check() {
      if (locked || idx >= TASKS.length) return;
      const task = TASKS[idx];
      if (!task.ok(state())) {
        sfx.wrong();
        clear(verdict);
        verdict.appendChild(verdictLine(false,
          `Not yet — you are at $${fmt(a, b)}$, modulus ${state().mod.toFixed(2)}, argument ${state().argDeg.toFixed(1)}°.`));
        return;
      }

      locked = true;
      score += 25;
      cab.setScore(score);
      sfx.levelUp();
      ctx.fx?.burstAt(taskBox, { count: 18 });

      clear(taskBox);
      taskBox.className = 'callout callout--tip';
      taskBox.appendChild(h('div.callout__label', null, `✓ ${fmt(a, b)}`));
      taskBox.appendChild(h('div.small', null, renderInline(task.note)));
      clear(verdict);
      verdict.appendChild(h('div.btnbar', { style: { marginTop: '10px' } },
        btn(idx === TASKS.length - 1 ? 'Finish' : 'Next task', () => {
          idx++; locked = false;
          renderTask();
          if (idx >= TASKS.length) finish();
        }, { kind: 'primary' })));
    }

    function finish() {
      const best = Math.max(ctx.best ?? 0, score);
      cab.setBest(best);
      ctx.report(score, { best, tasks: idx });
      cab.overlay(cleared(score, best, start));
    }

    function start() {
      cab.clearOverlay();
      score = 0; idx = 0; locked = false;
      a = 3; b = 2; showConj = true; showPolar = true;
      cab.setScore(0);
      refresh();
      renderTask();
    }

    start();
    return { destroy() { view.stop(); } };
  }
};
