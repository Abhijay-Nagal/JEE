/**
 * Iota Engine - powers of i, and the four-line rationalisation.
 *
 * Two mechanics in one cabinet because they are the same skill: reduce the
 * exponent mod 4, and multiply by the conjugate. Both are things a learner
 * should be able to do without thinking, so the widget is built for speed.
 */

import { h, clear } from '../../core/dom.js';
import { renderInline, renderMath } from '../../core/mathlite.js';
import { sfx } from '../../core/audio.js';
import { arcade, canvasLayer, cssVar, c2d, slider, readouts, btn, seg, choices,
         verdictLine, cleared, rng, shuffle } from '../kit.js';

const POWERS = ['1', 'i', '−1', '−i'];
const TEX = ['1', 'i', '-1', '-i'];

/**
 * Division rounds: (a+bi)/(c+di) with a clean answer. The distractors are
 * written out rather than generated, because the three mistakes worth offering
 * are specific ones - forgetting to flip the conjugate's sign, mishandling
 * i^2, and dropping the denominator - and a generator produces collisions.
 */
const DIVISIONS = [
  { n: [1, 0], d: [1, 1],  ans: '\\dfrac{1-i}{2}',
    wrong: ['\\dfrac{1+i}{2}', '1-i', '\\dfrac{1-i}{4}'],
    mid: '1 \\cdot (1-i) = 1-i', den: 2 },
  { n: [2, 1], d: [3, -1], ans: '\\dfrac{1+i}{2}',
    wrong: ['\\dfrac{1-i}{2}', '\\dfrac{5+5i}{8}', '\\dfrac{6+i}{10}'],
    mid: '(2+i)(3+i) = 5+5i', den: 10 },
  { n: [1, 1], d: [1, -1], ans: 'i',
    wrong: ['-i', '1', '\\dfrac{1+i}{2}'],
    mid: '(1+i)(1+i) = 2i', den: 2 },
  { n: [3, 4], d: [0, 1],  ans: '4 - 3i',
    wrong: ['4 + 3i', '-4 - 3i', '3 - 4i'],
    mid: '(3+4i)(-i) = 4-3i', den: 1 }
];

export default {
  id: 'iotaEngine',

  mount(root, ctx) {
    const cab = arcade(root, {
      title: 'Iota Engine',
      badge: 'Reduce, then rationalise',
      hint: 'Round one: powers of i against the clock. Round two: divide by multiplying by the conjugate.',
      best: ctx.best ?? null,
      onRestart: start
    });

    const r = rng(Date.now());
    let phase = 'power';               // 'power' | 'divide'
    let exponent = 39;
    let divIdx = 0;
    let score = 0, streak = 0, round = 0, locked = false;

    const ROUNDS = 6;                  // power rounds before the division rounds

    const stageBox = h('div');
    cab.stage.appendChild(stageBox);

    /* ------------------------------------------------------------ */
    /* the dial                                                      */

    const view = canvasLayer(stageBox, {
      height: 220,
      animate: true,
      draw(g, w, hgt) {
        const hue = cssVar('--maths');
        const accent = cssVar('--accent');
        const ink = cssVar('--ink-4');

        const cx = w * 0.28, cy = hgt * 0.52;
        const R = Math.min(w * 0.14, hgt * 0.3);

        /* the four landmarks */
        c2d.line(g, cx - R * 1.4, cy, cx + R * 1.4, cy, { color: cssVar('--chart-ink'), width: 1.2 });
        c2d.line(g, cx, cy - R * 1.4, cx, cy + R * 1.4, { color: cssVar('--chart-ink'), width: 1.2 });
        g.save();
        g.strokeStyle = cssVar('--line'); g.lineWidth = 1.2; g.setLineDash([3, 4]);
        g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.stroke();
        g.restore();

        const rem = ((exponent % 4) + 4) % 4;
        for (let k = 0; k < 4; k++) {
          const a = (k * Math.PI) / 2;
          const x = cx + Math.cos(a) * R;
          const y = cy - Math.sin(a) * R;
          const on = k === rem && phase === 'power';
          g.fillStyle = on ? accent : hue;
          g.beginPath(); g.arc(x, y, on ? 7 : 4, 0, Math.PI * 2); g.fill();
          c2d.text(g, POWERS[k], cx + Math.cos(a) * (R + 20), cy - Math.sin(a) * (R + 20),
            { size: 12, weight: 900, color: on ? accent : ink });
        }

        /* the walking hand */
        const t = performance.now() / 1000;
        const spin = phase === 'power' ? (rem * Math.PI) / 2 : t;
        c2d.line(g, cx, cy, cx + Math.cos(spin) * R, cy - Math.sin(spin) * R,
          { color: accent, width: 2.4 });

        /* the statement */
        if (phase === 'power') {
          c2d.text(g, `i^${exponent}`, w * 0.66, hgt * 0.32,
            { size: 30, weight: 900, color: hue });
          c2d.text(g, `${exponent} = 4 × ${Math.floor(exponent / 4)} + ${rem}`, w * 0.66, hgt * 0.56,
            { size: 13, weight: 700, color: cssVar('--ink-3'), font: 'mono' });
          c2d.text(g, 'remainder decides it', w * 0.66, hgt * 0.72,
            { size: 10, weight: 700, color: ink });
        } else {
          const d = DIVISIONS[divIdx];
          c2d.text(g, `${fmt(d.n)}  ÷  ${fmt(d.d)}`, w * 0.66, hgt * 0.38,
            { size: 20, weight: 900, color: hue });
          c2d.text(g, `multiply by the conjugate  ${fmt(conj(d.d))}`, w * 0.66, hgt * 0.62,
            { size: 11, weight: 700, color: cssVar('--ink-3') });
        }
      }
    });

    const conj = ([a, b]) => [a, -b];
    function fmt([a, b]) {
      if (b === 0) return String(a);
      if (a === 0) return b === 1 ? 'i' : b === -1 ? '−i' : `${b}i`;
      const sign = b < 0 ? '−' : '+';
      const mag = Math.abs(b) === 1 ? '' : String(Math.abs(b));
      return `${a} ${sign} ${mag}i`;
    }

    /* ------------------------------------------------------------ */

    const out = readouts([
      { key: 'r', label: 'round', value: '1' },
      { key: 's', label: 'streak', value: '0' },
      { key: 'm', label: 'mode', value: 'powers of i' },
      { key: 'x', label: 'remainder', value: '—' }
    ]);

    const taskBox = h('div.callout.callout--jee', { style: { margin: '0 0 12px' } });
    const pad = h('div');
    const verdict = h('div');
    cab.panel.appendChild(taskBox);
    cab.panel.appendChild(out.root);
    cab.panel.appendChild(pad);
    cab.panel.appendChild(verdict);

    /* ------------------------------------------------------------ */

    function nextPower() {
      // avoid trivially small exponents, and vary the remainder
      exponent = 7 + Math.floor(r() * 120);
      out.set('x', '—');
      render();
    }

    function render() {
      clear(taskBox);
      clear(pad);
      clear(verdict);
      out.set('r', `${round + 1} / ${ROUNDS + DIVISIONS.length}`);
      out.set('s', streak);
      out.set('m', phase === 'power' ? 'powers of i' : 'rationalise');

      if (round >= ROUNDS + DIVISIONS.length) {
        taskBox.className = 'callout callout--tip';
        taskBox.appendChild(h('div.callout__label', null, '✓ Engine tuned'));
        taskBox.appendChild(h('div.small', null, renderInline(
          'Both reflexes installed: **mod 4** for a power of $i$, **conjugate** for a division. Nothing in this chapter needs more than those two.')));
        return;
      }

      if (phase === 'power') {
        taskBox.className = 'callout callout--jee';
        taskBox.appendChild(h('div.callout__label', null, 'Evaluate'));
        taskBox.appendChild(h('div', { style: { fontSize: '1.4rem', fontWeight: '900', margin: '6px 0' } },
          renderMath(`i^{${exponent}}`)));
        pad.appendChild(choices(
          shuffle([0, 1, 2, 3], r).map((k) => ({ label: `$${TEX[k]}$`, value: k })),
          (val) => answerPower(val)));
        return;
      }

      const d = DIVISIONS[divIdx];
      taskBox.className = 'callout callout--jee';
      taskBox.appendChild(h('div.callout__label', null, 'Rationalise'));
      taskBox.appendChild(h('div', { style: { fontSize: '1.3rem', fontWeight: '900', margin: '6px 0' } },
        renderMath(`\\dfrac{${texOf(d.n)}}{${texOf(d.d)}}`)));
      taskBox.appendChild(h('div.small.muted', null, renderInline(
        `Multiply top and bottom by $${texOf(conj(d.d))}$.`)));

      const opts = shuffle([
        { label: `$${d.ans}$`, value: 'ok' },
        ...d.wrong.map((x, i) => ({ label: `$${x}$`, value: `w${i}` }))
      ], r);
      pad.appendChild(choices(opts, (val) => answerDivide(val, d)));
    }

    function texOf([a, b]) {
      if (b === 0) return String(a);
      if (a === 0) return b === 1 ? 'i' : b === -1 ? '-i' : `${b}i`;
      return `${a} ${b < 0 ? '-' : '+'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}i`;
    }

    /* ------------------------------------------------------------ */

    function answerPower(val) {
      if (locked) return;
      const rem = ((exponent % 4) + 4) % 4;
      out.set('x', rem);
      if (val !== rem) { miss(`$${exponent} = 4 \\times ${Math.floor(exponent / 4)} + ${rem}$, so $i^{${exponent}} = i^{${rem}} = ${TEX[rem]}$.`); return; }
      win(`$${exponent} \\div 4$ leaves remainder $${rem}$, so $i^{${exponent}} = ${TEX[rem]}$. The exponent itself never matters — only what is left after the fours.`);
    }

    function answerDivide(val, d) {
      if (locked) return;
      if (val !== 'ok') {
        miss(`Top: $${d.mid}$. Bottom: $${d.den}$. So the answer is $${d.ans}$.`);
        return;
      }
      win(`Top becomes $${d.mid}$ and the bottom becomes the real number $${d.den}$ — which is the entire point of multiplying by the conjugate.`);
    }

    function miss(why) {
      sfx.wrong();
      streak = 0;
      out.set('s', 0);
      clear(verdict);
      verdict.appendChild(verdictLine(false, why));
      verdict.appendChild(h('div.btnbar', { style: { marginTop: '10px' } },
        btn('Next', advance, { kind: 'ghost' })));
      locked = true;
    }

    function win(why) {
      locked = true;
      streak++;
      const gain = 10 + Math.min(20, streak * 3);
      score += gain;
      cab.setScore(score);
      out.set('s', streak, 'ok');
      sfx.correct(Math.min(streak, 4));
      ctx.fx?.burstAt(taskBox, { count: 12 });
      clear(verdict);
      verdict.appendChild(verdictLine(true, why));
      verdict.appendChild(h('div.btnbar', { style: { marginTop: '10px' } },
        btn('Next', advance, { kind: 'primary' })));
    }

    function advance() {
      locked = false;
      round++;
      if (round >= ROUNDS + DIVISIONS.length) { render(); finish(); return; }
      if (round < ROUNDS) { phase = 'power'; nextPower(); return; }
      phase = 'divide';
      divIdx = round - ROUNDS;
      render();
    }

    function finish() {
      const best = Math.max(ctx.best ?? 0, score);
      cab.setBest(best);
      ctx.report(score, { best, rounds: round });
      cab.overlay(cleared(score, best, start));
    }

    function start() {
      cab.clearOverlay();
      score = 0; streak = 0; round = 0; locked = false;
      phase = 'power'; divIdx = 0;
      cab.setScore(0);
      nextPower();
    }

    start();
    return { destroy() { view.stop(); } };
  }
};
