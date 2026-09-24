/**
 * Frame Switcher - the same motion, watched from three different frames.
 *
 * Relative velocity is one subtraction, and it still costs marks, because
 * students compute it without ever picturing what the other observer sees.
 * Here you click an observer and the whole scene re-renders in their frame:
 * the chosen body stops dead and everything else changes speed.
 */

import { h, clear } from '../../core/dom.js';
import { renderInline, renderMath } from '../../core/mathlite.js';
import { sfx } from '../../core/audio.js';
import { arcade, canvasLayer, cssVar, c2d, slider, readouts, btn, seg, clamp, round } from '../kit.js';

const QUESTIONS = [
  {
    setup: { a: 20, b: 12 },
    text: 'Car A does $20\\ \\text{m s}^{-1}$, car B does $12\\ \\text{m s}^{-1}$, same direction. What is $v_{AB}$?',
    answer: 8, unit: 'm s⁻¹',
    note: '$v_{AB} = v_A - v_B = 20 - 12 = 8\\ \\text{m s}^{-1}$. Switch to B’s frame and A crawls past at 8.'
  },
  {
    setup: { a: 20, b: -12 },
    text: 'Now B turns round: $v_B = -12\\ \\text{m s}^{-1}$. What is $v_{AB}$?',
    answer: 32, unit: 'm s⁻¹',
    note: '$20 - (-12) = 32\\ \\text{m s}^{-1}$. The same subtraction handles both cases — you never need a separate "opposite directions" rule.'
  },
  {
    setup: { a: -15, b: 5 },
    text: 'A moves at $-15$ and B at $+5\\ \\text{m s}^{-1}$. What is $v_{BA}$ (B relative to A)?',
    answer: 20, unit: 'm s⁻¹',
    note: '$v_{BA} = v_B - v_A = 5 - (-15) = 20\\ \\text{m s}^{-1}$. Note $v_{AB} = -20$: same size, opposite sign. Read the subscripts.'
  },
  {
    setup: { a: 18, b: 18 },
    text: 'Both cars travel at $18\\ \\text{m s}^{-1}$. What is $v_{AB}$?',
    answer: 0, unit: 'm s⁻¹',
    note: 'Zero. In each other’s frame they are stationary, side by side — which is exactly how mid-air refuelling works.'
  }
];

const FRAMES = [
  { id: 'ground', label: 'Ground' },
  { id: 'a', label: 'Inside A' },
  { id: 'b', label: 'Inside B' }
];

export default {
  id: 'relativeLab',

  mount(root, ctx) {
    const cab = arcade(root, {
      title: 'Frame Switcher',
      badge: 'Relative velocity',
      hint: 'Change the observer and watch the velocities change with them.',
      best: ctx.best ?? null,
      onRestart: start
    });

    const st = { vA: 20, vB: 12, xA: 0, xB: 0, frame: 'ground', t: 0 };
    let score = 0, qIdx = 0;

    const stageBox = h('div');
    cab.stage.appendChild(stageBox);

    const view = canvasLayer(stageBox, {
      height: 230,
      animate: true,
      draw(g, w, hgt) {
        const dt = 1 / 60;
        st.t += dt;
        st.xA += st.vA * dt;
        st.xB += st.vB * dt;

        // Wrap the world so the cars never leave the screen.
        const SPAN = 200;                       // metres shown
        const wrap = (x) => ((x % SPAN) + SPAN) % SPAN;

        // The observer's own position becomes the origin of the view.
        const shift = st.frame === 'a' ? st.xA : st.frame === 'b' ? st.xB : 0;
        const X = (m) => 30 + (wrap(m - shift + SPAN / 2) / SPAN) * (w - 60);

        const roadY = hgt * 0.5;

        // road
        g.fillStyle = cssVar('--bg-3');
        g.fillRect(0, roadY - 34, w, 68);
        c2d.line(g, 0, roadY - 34, w, roadY - 34, { color: cssVar('--line'), width: 1 });
        c2d.line(g, 0, roadY + 34, w, roadY + 34, { color: cssVar('--line'), width: 1 });

        // Road markings move too - that is what tells you the ground is not
        // stationary once you sit inside a car.
        g.save();
        g.globalAlpha = 0.5;
        for (let m = 0; m < SPAN; m += 10) {
          const x = X(m);
          c2d.line(g, x - 8, roadY, x + 8, roadY, { color: cssVar('--ink-4'), width: 2 });
        }
        g.restore();

        car(g, X(st.xA), roadY - 17, 'A', st.vA, cssVar('--chart-1'), st.frame === 'a');
        car(g, X(st.xB), roadY + 17, 'B', st.vB, cssVar('--chart-2'), st.frame === 'b');

        // frame banner
        const label = st.frame === 'ground' ? 'Observer: the ground'
          : st.frame === 'a' ? 'Observer: inside car A' : 'Observer: inside car B';
        g.fillStyle = cssVar('--bg-1');
        c2d.roundRect(g, w / 2 - 110, 10, 220, 26, 8); g.fill();
        g.strokeStyle = cssVar('--accent'); g.lineWidth = 1; g.stroke();
        c2d.text(g, label, w / 2, 23, { size: 11, weight: 800, color: cssVar('--accent') });

        if (st.frame !== 'ground') {
          c2d.text(g, 'in this frame the chosen car is at rest, and the road moves',
            w / 2, hgt - 12, { size: 10, weight: 600, color: cssVar('--ink-4') });
        }
      }
    });

    function car(g, x, y, label, v, colour, isObserver) {
      g.save();
      g.fillStyle = colour;
      c2d.roundRect(g, x - 26, y - 11, 52, 22, 6);
      g.fill();
      if (isObserver) {
        g.strokeStyle = cssVar('--accent');
        g.lineWidth = 2.5;
        g.stroke();
      }
      c2d.text(g, label, x, y, { size: 12, weight: 900, color: cssVar('--primary-ink') });
      g.restore();

      // velocity in the current frame
      const shown = st.frame === 'a' ? v - st.vA : st.frame === 'b' ? v - st.vB : v;
      if (Math.abs(shown) > 0.3) {
        const len = clamp(Math.abs(shown) * 1.8, 12, 62);
        c2d.arrow(g, x, y - 20, x + Math.sign(shown) * len, y - 20,
          { color: colour, width: 2.2, head: 7 });
      }
      c2d.text(g, `${round(shown, 1)} m/s`, x, y - 32,
        { size: 10, weight: 800, color: Math.abs(shown) < 0.3 ? cssVar('--ok') : colour });
    }

    /* ---------------- panel ---------------- */

    const out = readouts([
      { key: 'va', label: 'v_A (ground)', value: '20' },
      { key: 'vb', label: 'v_B (ground)', value: '12' },
      { key: 'vab', label: 'v_AB = v_A − v_B', value: '8' },
      { key: 'vba', label: 'v_BA = v_B − v_A', value: '−8' }
    ]);

    const sA = slider({
      label: 'Velocity of A', min: -30, max: 30, step: 1, value: 20, unit: ' m s⁻¹',
      fmt: (v) => String(v), onInput: (v) => { st.vA = v; refresh(); }
    });
    const sB = slider({
      label: 'Velocity of B', min: -30, max: 30, step: 1, value: 12, unit: ' m s⁻¹',
      fmt: (v) => String(v), onInput: (v) => { st.vB = v; refresh(); }
    });

    const qBox = h('div.callout.callout--jee', { style: { margin: '0 0 12px' } });
    const ansBox = h('div');

    cab.panel.appendChild(qBox);
    cab.panel.appendChild(out.root);
    cab.panel.appendChild(h('div.row', { style: { justifyContent: 'center', margin: '14px 0' } },
      h('span.small.muted', null, 'Watch from:'),
      seg(FRAMES.map((f) => ({ value: f.id, label: f.label })), 'ground', (v) => {
        st.frame = v; sfx.click(); refresh();
      })));
    cab.panel.appendChild(h('div', {
      style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '16px' }
    }, sA.root, sB.root));
    cab.panel.appendChild(ansBox);

    function refresh() {
      out.set('va', round(st.vA, 1));
      out.set('vb', round(st.vB, 1));
      out.set('vab', round(st.vA - st.vB, 1), Math.abs(st.vA - st.vB) < 0.1 ? 'ok' : null);
      out.set('vba', round(st.vB - st.vA, 1));
      cab.setHint(st.frame === 'ground'
        ? `From the ground: A at ${st.vA}, B at ${st.vB} m s⁻¹.`
        : `From inside ${st.frame.toUpperCase()}: that car reads zero, and the other reads ${round(st.frame === 'a' ? st.vB - st.vA : st.vA - st.vB, 1)} m s⁻¹.`);
    }

    /* ---------------- questions ---------------- */

    function renderQuestion() {
      clear(qBox); clear(ansBox);
      if (qIdx >= QUESTIONS.length) {
        qBox.className = 'callout callout--tip';
        qBox.appendChild(h('div.callout__label', null, '✓ All four answered'));
        qBox.appendChild(h('div.small', null, renderInline(
          'Free play. Set both velocities equal and step into either car — the other stands perfectly still beside you.')));
        return;
      }
      const q = QUESTIONS[qIdx];
      st.vA = q.setup.a; st.vB = q.setup.b;
      sA.set(st.vA); sB.set(st.vB);
      refresh();

      qBox.className = 'callout callout--jee';
      qBox.appendChild(h('div.callout__label', null, `Question ${qIdx + 1} / ${QUESTIONS.length}`));
      qBox.appendChild(h('div.small', null, renderInline(q.text)));

      const input = h('input.input.mono', {
        type: 'text', inputmode: 'decimal', placeholder: 'value', style: { maxWidth: '170px' },
        onKeyDown: (e) => { if (e.key === 'Enter') grade(input.value); }
      });
      qBox.appendChild(h('div.row', { style: { gap: '10px', marginTop: '10px', flexWrap: 'wrap' } },
        input, btn('Check', () => grade(input.value), { kind: 'primary' })));
    }

    function grade(raw) {
      const q = QUESTIONS[qIdx];
      const val = Number(String(raw).trim());
      const ok = Number.isFinite(val) && Math.abs(Math.abs(val) - Math.abs(q.answer)) < 0.5;

      if (ok) { score += 25; sfx.correct(); ctx.fx?.burstAt(qBox, { count: 18 }); }
      else { score = Math.max(0, score - 5); sfx.wrong(); }
      cab.setScore(score);

      clear(ansBox);
      ansBox.appendChild(h('div.verdict' + (ok ? '.verdict--ok' : '.verdict--bad'), { style: { marginTop: '12px' } },
        h('div.verdict__head', null, ok ? `✓ ${q.answer} ${q.unit}` : `✗ The answer is ${q.answer} ${q.unit}`),
        h('div.verdict__body.small', null, renderInline(q.note))));
      ansBox.appendChild(h('div.btnbar', { style: { marginTop: '10px' } },
        btn('Step into a car and check', () => { st.frame = 'b'; refresh(); }, { kind: 'ghost' }),
        btn(qIdx + 1 >= QUESTIONS.length ? 'Finish' : 'Next question', () => {
          qIdx++;
          st.frame = 'ground';
          renderQuestion();
          if (qIdx >= QUESTIONS.length) finish();
        }, { kind: 'primary' })));
    }

    function finish() {
      const best = Math.max(ctx.best ?? 0, score);
      cab.setBest(best);
      ctx.report(score, { best, answered: QUESTIONS.length });
    }

    function start() {
      cab.clearOverlay();
      score = 0; qIdx = 0;
      st.frame = 'ground'; st.xA = 0; st.xB = 40; st.t = 0;
      cab.setScore(0);
      renderQuestion();
    }

    start();
    return { destroy() { view.stop(); } };
  }
};
