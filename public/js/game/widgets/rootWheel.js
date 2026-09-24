/**
 * Root Wheel - De Moivre in one direction, nth roots in the other.
 *
 * Raising to a power and taking a root are the same dial turned opposite ways:
 * one multiplies the argument, the other divides it and then fans out. Showing
 * both on the same circle is what makes "why are there exactly n roots?"
 * answer itself.
 */

import { h, clear } from '../../core/dom.js';
import { renderInline } from '../../core/mathlite.js';
import { sfx } from '../../core/audio.js';
import { arcade, canvasLayer, cssVar, c2d, slider, readouts, btn, seg, choices,
         verdictLine, cleared, clamp, round } from '../kit.js';

const D2R = Math.PI / 180;

const TASKS = [
  { mode: 'power',
    text: 'In **power** mode, keep $|z| = 1$ and set the dial so that $(\\text{cis}\\,30^\\circ)^n$ lands exactly on $-1$.',
    ok: (s) => s.mode === 'power' && Math.abs(s.r - 1) < 0.01 && Math.abs(s.theta - 30) < 0.5
      && (((s.n * 30) % 360) + 360) % 360 === 180,
    note: '$n = 6$: $6 \\times 30^\\circ = 180^\\circ$, and $\\text{cis}\\,180^\\circ = -1$. De Moivre turned a sixth power into one multiplication.' },
  { mode: 'power',
    text: 'Still in power mode with $|z| = 1$, find an $n$ for which $(\\text{cis}\\,45^\\circ)^n = 1$.',
    ok: (s) => s.mode === 'power' && Math.abs(s.r - 1) < 0.01 && Math.abs(s.theta - 45) < 0.5
      && s.n > 0 && (s.n * 45) % 360 === 0,
    note: '$n = 8$ gives $360^\\circ$, a full turn, which is $1$. The dial is periodic — which is exactly why an $n$th root has $n$ answers and not more.' },
  { mode: 'root',
    text: 'Switch to **root** mode and produce the **cube roots of unity**.',
    ok: (s) => s.mode === 'root' && s.n === 3 && Math.abs(s.theta) < 0.5,
    note: 'Three roots at $0^\\circ$, $120^\\circ$ and $240^\\circ$ — an equilateral triangle on the unit circle. Those are $1$, $\\omega$ and $\\omega^2$, and being symmetric about the origin they sum to zero.' },
  { mode: 'root',
    text: 'Produce a set of roots forming a **regular hexagon**.',
    ok: (s) => s.mode === 'root' && s.n === 6,
    note: 'Six roots, $60^\\circ$ apart. The polygon is regular whatever the starting angle — changing $\\theta$ only rotates the whole wheel.' },
  { mode: 'root',
    text: 'With $n = 4$, rotate $\\theta$ until the **first** root ($k = 0$) sits exactly on the positive imaginary axis.',
    ok: (s) => s.mode === 'root' && s.n === 4 && Math.abs(s.theta - 360) < 3,
    note: 'The roots start at $\\theta/4$ and step by $90^\\circ$, so the first one reaches $90^\\circ$ when $\\theta = 360^\\circ$. Adding $360^\\circ$ to an argument does not change the **number** — but it does change which root the formula hands you first, and that is precisely where the other $n-1$ roots come from.' }
];

export default {
  id: 'rootWheel',

  mount(root, ctx) {
    const cab = arcade(root, {
      title: 'Root Wheel',
      badge: 'De Moivre, both ways',
      hint: 'Power mode multiplies the argument by n. Root mode divides it, then fans out n copies.',
      best: ctx.best ?? null,
      onRestart: start
    });

    let mode = 'power';
    let score = 0, idx = 0, locked = false;

    const stageBox = h('div');
    cab.stage.appendChild(stageBox);

    const state = () => ({ mode, n: nS.get(), theta: thS.get(), r: rS.get() / 10 });

    /* ------------------------------------------------------------ */

    const view = canvasLayer(stageBox, {
      height: 300,
      animate: true,
      draw(g, w, hgt) {
        const s = state();
        const hue = cssVar('--maths');
        const ink = cssVar('--ink-4');
        const accent = cssVar('--accent');
        const ok = cssVar('--ok');

        const cx = w * 0.34, cy = hgt * 0.5;
        const R = Math.min(w * 0.15, hgt * 0.34);

        /* axes and unit circle */
        c2d.line(g, cx - R * 1.6, cy, cx + R * 1.6, cy, { color: cssVar('--chart-ink'), width: 1.2 });
        c2d.line(g, cx, cy - R * 1.6, cx, cy + R * 1.6, { color: cssVar('--chart-ink'), width: 1.2 });
        g.save();
        g.strokeStyle = cssVar('--line'); g.lineWidth = 1.1; g.setLineDash([3, 4]);
        g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.stroke();
        g.restore();
        c2d.text(g, '1', cx + R + 12, cy + 12, { size: 9, weight: 700, color: ink });

        const pt = (rad, degs) => ({
          x: cx + Math.cos(degs * D2R) * R * rad,
          y: cy - Math.sin(degs * D2R) * R * rad
        });

        if (s.mode === 'power') {
          /* the base */
          const base = pt(s.r, s.theta);
          c2d.line(g, cx, cy, base.x, base.y, { color: cssVar('--line'), width: 1.8 });
          g.fillStyle = cssVar('--ink-3');
          g.beginPath(); g.arc(base.x, base.y, 4.5, 0, Math.PI * 2); g.fill();
          c2d.text(g, 'z', base.x + 10, base.y - 10,
            { size: 11, weight: 900, color: cssVar('--ink-3'), align: 'left' });

          /* the intermediate powers, fading */
          const outR = Math.pow(s.r, s.n);
          const scale = outR > 1.6 ? 1.6 / outR : 1;
          for (let k = 1; k <= s.n; k++) {
            const rad = Math.pow(s.r, k) * scale;
            const p = pt(Math.min(rad, 1.55), s.theta * k);
            const last = k === s.n;
            g.save();
            g.globalAlpha = last ? 1 : 0.28;
            c2d.line(g, cx, cy, p.x, p.y, { color: last ? accent : hue, width: last ? 3 : 1.4 });
            g.fillStyle = last ? accent : hue;
            g.beginPath(); g.arc(p.x, p.y, last ? 7 : 3.4, 0, Math.PI * 2); g.fill();
            g.restore();
          }
          const fin = pt(Math.min(Math.pow(s.r, s.n) * scale, 1.55), s.theta * s.n);
          c2d.text(g, 'zⁿ', fin.x + 12, fin.y - 12,
            { size: 13, weight: 900, color: accent, align: 'left' });

          /* the swept angle */
          g.save();
          g.strokeStyle = accent; g.lineWidth = 2;
          g.beginPath();
          g.arc(cx, cy, R * 0.42, 0, -s.theta * s.n * D2R, true);
          g.stroke();
          g.restore();
        } else {
          /* the target number */
          const target = pt(Math.min(s.r, 1.5), s.theta);
          c2d.line(g, cx, cy, target.x, target.y, { color: cssVar('--line'), width: 1.6, dash: [4, 4] });
          g.fillStyle = cssVar('--ink-3');
          g.beginPath(); g.arc(target.x, target.y, 4.5, 0, Math.PI * 2); g.fill();
          c2d.text(g, 'z', target.x + 10, target.y - 10,
            { size: 11, weight: 900, color: cssVar('--ink-3'), align: 'left' });

          /* the n roots */
          const rad = Math.pow(s.r, 1 / s.n);
          const roots = [];
          for (let k = 0; k < s.n; k++) {
            roots.push(pt(rad, (s.theta + 360 * k) / s.n));
          }
          /* the polygon */
          g.save();
          g.globalAlpha = 0.55;
          g.strokeStyle = hue; g.lineWidth = 1.5;
          g.beginPath();
          roots.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)));
          g.closePath(); g.stroke();
          g.restore();

          roots.forEach((p, k) => {
            c2d.line(g, cx, cy, p.x, p.y, { color: k === 0 ? ok : hue, width: k === 0 ? 2.6 : 1.8 });
            g.fillStyle = k === 0 ? ok : hue;
            g.beginPath(); g.arc(p.x, p.y, k === 0 ? 7 : 5, 0, Math.PI * 2); g.fill();
            if (s.n <= 8) {
              c2d.text(g, `k=${k}`,
                cx + (p.x - cx) * 1.28, cy + (p.y - cy) * 1.28,
                { size: 8, weight: 700, color: k === 0 ? ok : ink });
            }
          });

          c2d.text(g, `${(360 / s.n).toFixed(0)}° apart`, cx, cy + R * 1.6 + 14,
            { size: 10, weight: 800, color: hue });
        }

        /* the panel */
        const px = w * 0.79;
        const lines = s.mode === 'power'
          ? [
            ['z', `${s.r.toFixed(1)} cis ${s.theta.toFixed(0)}°`, cssVar('--ink-2')],
            ['n', String(s.n), accent],
            ['|zⁿ|', Math.pow(s.r, s.n).toFixed(3), hue],
            ['arg zⁿ', `${norm(s.theta * s.n).toFixed(0)}°`, accent],
            ['zⁿ', describe(Math.pow(s.r, s.n), norm(s.theta * s.n)), cssVar('--ok')]
          ]
          : [
            ['z', `${s.r.toFixed(1)} cis ${s.theta.toFixed(0)}°`, cssVar('--ink-2')],
            ['n', String(s.n), accent],
            ['|root|', Math.pow(s.r, 1 / s.n).toFixed(3), hue],
            ['first arg', `${(s.theta / s.n).toFixed(1)}°`, accent],
            ['count', `${s.n} distinct`, cssVar('--ok')]
          ];
        g.fillStyle = cssVar('--bg-2');
        c2d.roundRect(g, px - 100, 30, 200, lines.length * 27 + 22, 10); g.fill();
        g.strokeStyle = cssVar('--line'); g.lineWidth = 1; g.stroke();
        lines.forEach((row, i) => {
          const y = 50 + i * 27;
          c2d.text(g, row[0], px - 88, y, { size: 10, weight: 700, color: ink, align: 'left' });
          c2d.text(g, row[1], px + 88, y,
            { size: 11, weight: 900, color: row[2], align: 'right', font: 'mono' });
        });
      }
    });

    const norm = (d) => ((d % 360) + 360) % 360;

    /** Name the landmark values, so 180 degrees reads as -1 rather than a number. */
    function describe(rad, degs) {
      const near = (x, y) => Math.abs(x - y) < 0.5;
      if (Math.abs(rad - 1) > 0.01) return `${rad.toFixed(2)} cis ${degs.toFixed(0)}°`;
      if (near(degs, 0)) return '1';
      if (near(degs, 90)) return 'i';
      if (near(degs, 180)) return '−1';
      if (near(degs, 270)) return '−i';
      return `cis ${degs.toFixed(0)}°`;
    }

    /* ------------------------------------------------------------ */

    const out = readouts([
      { key: 'm', label: 'mode', value: 'power' },
      { key: 'n', label: 'n', value: '2' },
      { key: 't', label: 'θ', value: '30°' },
      { key: 'v', label: 'result', value: '—' }
    ]);

    function refresh() {
      const s = state();
      out.set('m', s.mode === 'power' ? 'zⁿ' : 'ⁿ√z');
      out.set('n', s.n);
      out.set('t', `${s.theta.toFixed(0)}°`);
      out.set('v', s.mode === 'power'
        ? describe(Math.pow(s.r, s.n), norm(s.theta * s.n))
        : `${s.n} roots, ${(360 / s.n).toFixed(0)}° apart`);
    }

    const nS = slider({ label: 'n', min: 1, max: 12, step: 1, value: 6, onInput: refresh });
    const thS = slider({ label: 'θ  (argument of z)', min: 0, max: 720, step: 5, value: 30, unit: '°', onInput: refresh });
    const rS = slider({ label: '|z|', min: 5, max: 20, step: 1, value: 10, fmt: (v) => (v / 10).toFixed(1), onInput: refresh });

    const taskBox = h('div.callout.callout--jee', { style: { margin: '0 0 12px' } });
    const controls = h('div');
    const verdict = h('div');
    cab.panel.appendChild(taskBox);
    cab.panel.appendChild(out.root);
    cab.panel.appendChild(controls);
    cab.panel.appendChild(verdict);

    function renderControls() {
      clear(controls);
      controls.appendChild(h('div.row', { style: { justifyContent: 'center', margin: '12px 0 4px' } },
        seg([
          { value: 'power', label: 'zⁿ  (power)' },
          { value: 'root', label: 'ⁿ√z  (roots)' }
        ], mode, (v) => { mode = v; refresh(); })));
      controls.appendChild(nS.root);
      controls.appendChild(thS.root);
      controls.appendChild(rS.root);
      controls.appendChild(h('div.btnbar', { style: { marginTop: 'var(--sp-4)' } },
        btn('Check', check, { kind: 'primary', size: 'md' })));
    }

    /* ------------------------------------------------------------ */

    function renderTask() {
      clear(taskBox);
      clear(verdict);
      if (idx >= TASKS.length) {
        taskBox.className = 'callout callout--tip';
        taskBox.appendChild(h('div.callout__label', null, '✓ Wheel mastered'));
        taskBox.appendChild(h('div.small', null, renderInline(
          'Free play: in root mode, push $n$ to 12 and watch the polygon approach the circle. Those twelve points are the twelfth roots of unity.')));
        return;
      }
      taskBox.className = 'callout callout--jee';
      taskBox.appendChild(h('div.callout__label', null, `Task ${idx + 1} / ${TASKS.length}`));
      taskBox.appendChild(h('div.small', null, renderInline(TASKS[idx].text)));
    }

    function check() {
      if (locked || idx >= TASKS.length) return;
      const task = TASKS[idx];
      const s = state();
      if (s.mode !== task.mode) {
        sfx.wrong();
        cab.setHint(`Switch to **${task.mode}** mode first.`);
        return;
      }
      if (!task.ok(s)) {
        sfx.wrong();
        clear(verdict);
        verdict.appendChild(verdictLine(false,
          s.mode === 'power'
            ? `With $n = ${s.n}$ and $\\theta = ${s.theta}^\\circ$ the result is at $${norm(s.theta * s.n).toFixed(0)}^\\circ$. Not it — keep turning.`
            : `That gives ${s.n} roots starting at $${(s.theta / s.n).toFixed(1)}^\\circ$. Not the set asked for.`));
        return;
      }

      locked = true;
      score += 25;
      cab.setScore(score);
      sfx.levelUp();
      ctx.fx?.burstAt(taskBox, { count: 18 });

      clear(taskBox);
      taskBox.className = 'callout callout--tip';
      taskBox.appendChild(h('div.callout__label', null, '✓ Correct'));
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
      score = 0; idx = 0; locked = false; mode = 'power';
      cab.setScore(0);
      nS.set(2); thS.set(30); rS.set(10);
      refresh();
      renderControls();
      renderTask();
    }

    start();
    return { destroy() { view.stop(); } };
  }
};
