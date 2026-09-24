/**
 * Instrument Bench - read a real vernier calliper and screw gauge.
 *
 * The instrument is drawn to scale and set to a random value; the learner must
 * read it. Later rounds introduce a zero error, which is where almost all
 * marks are actually lost in this topic.
 *
 * Teaches: least count, main-scale + moving-scale addition, and the sign
 * convention of zero correction.
 */

import { h, clear } from '../../core/dom.js';
import { renderInline, renderMath } from '../../core/mathlite.js';
import { sfx } from '../../core/audio.js';
import { arcade, canvasLayer, cssVar, c2d, btn, cleared, verdictLine, clamp } from '../kit.js';

const ROUNDS = 8;

export default {
  id: 'vernierBench',

  mount(root, ctx) {
    const cab = arcade(root, {
      title: 'Instrument Bench',
      badge: 'Read the scale',
      hint: 'Find the main-scale reading first, then the coinciding division.',
      best: ctx.best ?? null,
      onRestart: start
    });

    let round = 0, score = 0, tries = 0, task = null, answered = false;

    const stage = h('div', { style: { padding: '12px 8px 0' } });
    cab.stage.appendChild(stage);

    const view = canvasLayer(stage, {
      height: 220,
      draw(g, w, hgt) {
        if (!task) return;
        if (task.kind === 'vernier') drawVernier(g, w, hgt);
        else drawScrew(g, w, hgt);
      }
    });

    /* ================= drawing: vernier calliper ================= */

    function drawVernier(g, w, hgt) {
      const ink = cssVar('--ink-2'), line = cssVar('--line'), hue = cssVar('--hue') || cssVar('--primary');
      const R = task.shown;                       // reading in mm shown by the instrument
      const winStart = Math.max(0, Math.floor(R) - 7);
      const winMm = 26;
      const pad = 24;
      const px = (mm) => pad + ((mm - winStart) / winMm) * (w - pad * 2);

      const mainY = 74, vernY = 122;

      // ---- main scale body
      g.fillStyle = cssVar('--bg-3');
      c2d.roundRect(g, pad - 10, mainY - 34, w - pad * 2 + 20, 36, 5); g.fill();
      g.strokeStyle = line; g.lineWidth = 1; g.stroke();

      // ---- main scale ticks (1 mm apart)
      for (let mm = Math.ceil(winStart); mm <= winStart + winMm; mm++) {
        const x = px(mm);
        if (x < pad - 12 || x > w - pad + 12) continue;
        const major = mm % 10 === 0, mid = mm % 5 === 0;
        const len = major ? 20 : mid ? 14 : 9;
        c2d.line(g, x, mainY, x, mainY - len, { color: major ? ink : line, width: major ? 1.6 : 1 });
        if (major) c2d.text(g, String(mm / 10), x, mainY - 26, { size: 11, weight: 700, color: ink });
      }
      // Right-aligned: the object bar occupies the left of this band.
      c2d.text(g, 'MAIN SCALE (cm)', w - pad, mainY - 40, { size: 9, weight: 800, color: cssVar('--ink-4'), align: 'right' });

      // ---- vernier scale body, its zero sitting at the reading
      const vStart = px(R);
      const vEnd = px(R + 9);      // 10 divisions spanning 9 mm
      g.fillStyle = cssVar('--bg-4');
      c2d.roundRect(g, vStart - 8, vernY - 2, (vEnd - vStart) + 20, 34, 5); g.fill();
      g.strokeStyle = hue; g.lineWidth = 1.4; g.stroke();

      for (let k = 0; k <= 10; k++) {
        const mm = R + k * 0.9;
        const x = px(mm);
        const isMatch = k === task.vc;
        c2d.line(g, x, vernY, x, vernY + (k % 5 === 0 ? 17 : 12), {
          color: isMatch ? cssVar('--accent') : ink,
          width: isMatch ? 2.4 : 1
        });
        if (k % 5 === 0) c2d.text(g, String(k), x, vernY + 26, { size: 10, weight: 700, color: ink });
        if (isMatch && answered) {
          c2d.line(g, x, mainY, x, vernY, { color: cssVar('--accent'), width: 1.4, dash: [3, 3] });
          c2d.text(g, 'coincides', x, vernY + 40, { size: 10, weight: 800, color: cssVar('--accent') });
        }
      }
      c2d.text(g, 'VERNIER SCALE', vStart - 8, vernY + 46, { size: 9, weight: 800, color: cssVar('--ink-4'), align: 'left' });

      // ---- the object being measured
      // Its left jaw sits at 0 mm, which is usually outside the visible
      // window, so clamp the bar to the panel and label it beside the
      // measuring jaw rather than at the (off-screen) midpoint.
      const objLeft = Math.max(pad - 10, px(0));
      const objRight = px(R);
      g.fillStyle = hue;
      g.globalAlpha = 0.18;
      g.fillRect(objLeft, 14, Math.max(2, objRight - objLeft), 30);
      g.globalAlpha = 1;
      if (px(0) > pad - 10) c2d.line(g, px(0), 10, px(0), 50, { color: hue, width: 3 });
      c2d.line(g, objRight, 10, objRight, 50, { color: hue, width: 3 });
      c2d.text(g, 'object', objRight - 8, 29, { size: 10, weight: 800, color: hue, align: 'right' });
    }

    /* ================= drawing: screw gauge ================= */

    function drawScrew(g, w, hgt) {
      const ink = cssVar('--ink-2'), line = cssVar('--line'), hue = cssVar('--hue') || cssVar('--primary');
      const R = task.shown;                       // mm
      const psr = task.psr;                       // main-scale reading in mm
      const hsr = task.hsr;                       // circular division on the line

      const pad = 30;
      const mmSpan = 8;
      const px = (mm) => pad + (mm / mmSpan) * (w * 0.52 - pad);

      // sleeve
      g.fillStyle = cssVar('--bg-3');
      c2d.roundRect(g, pad - 14, 84, w * 0.52 - pad + 20, 26, 4); g.fill();
      g.strokeStyle = line; g.stroke();

      // reference line
      c2d.line(g, pad - 14, 97, w * 0.56, 97, { color: ink, width: 1.4 });

      // main scale: whole mm above the line, half mm below
      for (let i = 0; i <= mmSpan * 2; i++) {
        const mm = i / 2;
        const x = px(mm);
        const whole = i % 2 === 0;
        c2d.line(g, x, 97, x, whole ? 86 : 108, { color: whole ? ink : line, width: whole ? 1.6 : 1 });
        if (whole) c2d.text(g, String(mm), x, 78, { size: 10, weight: 700, color: ink });
      }
      c2d.text(g, 'PITCH SCALE (mm)', pad - 14, 62, { size: 9, weight: 800, color: cssVar('--ink-4'), align: 'left' });

      // thimble edge sits at the pitch-scale reading
      const tx = px(psr);
      g.fillStyle = cssVar('--bg-4');
      c2d.roundRect(g, tx, 74, w - tx - 16, 46, 6); g.fill();
      g.strokeStyle = hue; g.lineWidth = 1.6; g.stroke();
      c2d.line(g, tx, 70, tx, 124, { color: hue, width: 2.5 });

      // circular scale, drawn as a vertical strip near the reference line
      const stripX = tx + 34;
      for (let d = -4; d <= 4; d++) {
        const div = ((hsr - d) % 50 + 50) % 50;
        const y = 97 + d * 13;
        if (y < 76 || y > 122) continue;
        const onLine = d === 0;
        c2d.line(g, stripX - 12, y, stripX + (onLine ? 18 : 10), y, {
          color: onLine ? cssVar('--accent') : line, width: onLine ? 2.2 : 1
        });
        c2d.text(g, String(div), stripX + 32, y, {
          size: onLine ? 13 : 10,
          weight: onLine ? 900 : 600,
          color: onLine ? cssVar('--accent') : cssVar('--ink-3'),
          align: 'left'
        });
      }
      c2d.text(g, 'CIRCULAR SCALE', stripX + 16, 62, { size: 9, weight: 800, color: cssVar('--ink-4'), align: 'left' });

      if (answered) {
        c2d.text(g, `${psr} mm + ${hsr}×0.01 mm`, w / 2, 160, { size: 13, weight: 800, color: cssVar('--ok') });
      }

      // the wire
      g.fillStyle = hue; g.globalAlpha = 0.25;
      g.fillRect(pad - 14, 134, Math.max(3, px(R) - pad + 14), 12);
      g.globalAlpha = 1;
      c2d.text(g, 'wire', pad - 14, 158, { size: 10, weight: 800, color: hue, align: 'left' });
    }

    /* ================= tasks ================= */

    function makeTask(n) {
      // First half: plain readings. Second half: zero error too.
      const withZero = n >= 4;
      const kind = n % 2 === 0 ? 'vernier' : 'screw';

      if (kind === 'vernier') {
        const msr = 10 + Math.floor(Math.random() * 25);      // whole mm
        const vc = Math.floor(Math.random() * 10);
        const shown = msr + vc * 0.1;
        let zero = 0;
        if (withZero) {
          const zdiv = 1 + Math.floor(Math.random() * 4);
          zero = (Math.random() < 0.5 ? 1 : -1) * zdiv * 0.1;
        }
        return {
          kind, shown, msr, vc, zero,
          lc: 0.1, unit: 'mm',
          correct: Number((shown - zero).toFixed(2)),
          lcText: '\\text{L.C.} = \\dfrac{1\\ \\text{mm}}{10} = 0.1\\ \\text{mm}',
          setup: '10 vernier divisions span 9 main-scale divisions; 1 MSD = 1 mm.'
        };
      }

      const psr = (1 + Math.floor(Math.random() * 12)) * 0.5;  // whole or half mm
      const hsr = Math.floor(Math.random() * 50);
      const shown = Number((psr + hsr * 0.01).toFixed(2));
      let zero = 0;
      if (withZero) {
        const zdiv = 1 + Math.floor(Math.random() * 5);
        zero = (Math.random() < 0.5 ? 1 : -1) * zdiv * 0.01;
      }
      return {
        kind, shown, psr, hsr, zero,
        lc: 0.01, unit: 'mm',
        correct: Number((shown - zero).toFixed(3)),
        lcText: '\\text{L.C.} = \\dfrac{0.5\\ \\text{mm}}{50} = 0.01\\ \\text{mm}',
        setup: 'Pitch 0.5 mm, 50 divisions on the circular scale.'
      };
    }

    /* ================= UI ================= */

    const panel = cab.panel;

    function render() {
      clear(panel);
      answered = false;
      view.redraw();

      panel.appendChild(h('div.spread', { style: { marginBottom: '10px' } },
        h('div', null,
          h('div.tiny.dim', null, `ROUND ${round + 1} / ${ROUNDS}`),
          h('strong', null, task.kind === 'vernier' ? 'Vernier calliper' : 'Screw gauge')),
        h('span.tag', null, task.setup)
      ));

      if (task.zero) {
        const sign = task.zero > 0 ? '+' : '−';
        panel.appendChild(h('div.callout.callout--trap', { style: { margin: '0 0 12px' } },
          h('div.callout__label', null, '⚠ Zero error present'),
          h('div.small', null, renderInline(
            `With the jaws fully closed this instrument reads **${sign}${Math.abs(task.zero).toFixed(task.kind === 'vernier' ? 1 : 2)} mm**. Report the **corrected** measurement.`))));
      }

      const input = h('input.input.mono', {
        type: 'text', inputmode: 'decimal', placeholder: 'reading in mm',
        style: { maxWidth: '200px' },
        onKeyDown: (e) => { if (e.key === 'Enter') check(input.value); }
      });

      panel.appendChild(h('div.row', { style: { flexWrap: 'wrap', gap: '10px' } },
        input,
        h('span.muted', null, 'mm'),
        btn('Check reading', () => check(input.value), { kind: 'primary', size: 'md' }),
        btn('Show least count', () => {
          cab.setHint('');
          panel.appendChild(h('div.hintbox', { style: { marginTop: '10px' } },
            h('div.hintbox__label', null, 'Least count'),
            renderMath(task.lcText, { display: true })));
        }, { kind: 'ghost' })
      ));

      setTimeout(() => input.focus(), 30);
    }

    function check(raw) {
      if (answered) return;
      const val = Number(String(raw).trim());
      if (!Number.isFinite(val)) {
        cab.setHint('Enter a number, in millimetres.');
        return;
      }
      const tol = task.lc / 2 * 0.999;
      const ok = Math.abs(val - task.correct) <= tol;
      answered = true;
      view.redraw();
      tries++;

      if (ok) {
        const pts = 20;
        score += pts;
        cab.setScore(score);
        sfx.correct();
        ctx.fx?.burstAt(panel, { count: 18 });
      } else {
        score = Math.max(0, score - 5);
        cab.setScore(score);
        sfx.wrong();
      }

      panel.appendChild(h('div', { style: { marginTop: '14px' } },
        verdictLine(ok, buildExplanation(val, ok)),
        h('div.btnbar', { style: { marginTop: '12px' } },
          btn(round + 1 >= ROUNDS ? 'See results' : 'Next instrument', next, { kind: 'primary' }))
      ));
    }

    function buildExplanation(given, ok) {
      const box = h('div');
      const dp = task.kind === 'vernier' ? 1 : 2;

      const steps = [];
      if (task.kind === 'vernier') {
        steps.push(`Main scale reading (just before the vernier zero): **${task.msr} mm**`);
        steps.push(`Coinciding vernier division: **${task.vc}**`);
        steps.push(`Observed $= ${task.msr} + ${task.vc} \\times 0.1 = ${task.shown.toFixed(1)}$ mm`);
      } else {
        steps.push(`Pitch scale reading: **${task.psr} mm**`);
        steps.push(`Circular scale division on the reference line: **${task.hsr}**`);
        steps.push(`Observed $= ${task.psr} + ${task.hsr} \\times 0.01 = ${task.shown.toFixed(2)}$ mm`);
      }
      if (task.zero) {
        const z = task.zero.toFixed(dp);
        steps.push(`Zero error $= ${z}$ mm, so corrected $=$ observed $-$ zero error $= ${task.shown.toFixed(dp)} - (${z}) = **${task.correct.toFixed(dp)}$ mm**`);
      }

      const ol = h('ol', { style: { margin: '0 0 8px', paddingLeft: '1.2em' } });
      for (const s of steps) ol.appendChild(h('li.small', null, renderInline(s)));
      box.appendChild(ol);

      if (!ok) {
        // Diagnose the classic mistakes.
        let why = `You wrote ${given}; the answer is ${task.correct.toFixed(dp)} mm.`;
        if (task.zero && Math.abs(given - task.shown) <= task.lc / 2) {
          why = 'You read the instrument correctly but **forgot the zero correction**. That is the single most common lost mark in this topic.';
        } else if (task.zero && Math.abs(given - (task.shown + task.zero)) <= task.lc / 2) {
          why = 'You applied the zero correction with the **wrong sign**. Correct = observed $-$ zero error, and the error keeps its own sign.';
        } else if (task.kind === 'screw' && Math.abs(given - (task.psr + task.hsr * 0.001)) < 0.005) {
          why = 'You used a least count of 0.001 mm. Pitch 0.5 mm over 50 divisions gives **0.01 mm**.';
        } else if (task.kind === 'vernier' && Math.abs(given - (task.msr + task.vc * 0.01)) < 0.005) {
          why = 'You used 0.01 mm. Ten vernier divisions over 1 mm gives a least count of **0.1 mm** (which is 0.01 **cm** — watch the unit).';
        }
        box.appendChild(h('p.small', { style: { marginBottom: 0 } }, renderInline(why)));
      }
      return box;
    }

    function next() {
      round++;
      if (round >= ROUNDS) return finish();
      task = makeTask(round);
      render();
    }

    function finish() {
      const best = Math.max(ctx.best ?? 0, score);
      cab.setBest(best);
      ctx.report(score, { best, rounds: ROUNDS });
      cab.overlay(cleared(score, best, start,
        h('p.small.muted', null, 'Both instruments, with and without zero error.')));
    }

    function start() {
      cab.clearOverlay();
      round = 0; score = 0; tries = 0;
      cab.setScore(0);
      task = makeTask(0);
      render();
    }

    start();
    return { destroy() { view.stop(); } };
  }
};
