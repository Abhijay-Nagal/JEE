/**
 * Propagation Forge - build a formula and watch its error budget assemble.
 *
 * The bar chart is the whole point: it makes visible that a quantity measured
 * to 2% but raised to the power 2 contributes 4%, and therefore dominates a
 * quantity measured to 3% appearing linearly. That is the insight JEE tests
 * and that real experimentalists actually use.
 */

import { h, clear } from '../../core/dom.js';
import { renderInline, renderMath } from '../../core/mathlite.js';
import { sfx } from '../../core/audio.js';
import { arcade, canvasLayer, cssVar, c2d, slider, readouts, btn, cleared, clamp, round } from '../kit.js';

const VARS = [
  { id: 'A', sym: 'A', colour: '--physics' },
  { id: 'B', sym: 'B', colour: '--chemistry' },
  { id: 'C', sym: 'C', colour: '--maths' }
];

/** Preset experiments the learner is challenged to reproduce. */
const CHALLENGES = [
  {
    text: 'Resistance from Ohm’s law: $R = V/I$ with $V$ to $5\\%$ and $I$ to $2\\%$. Set it up and read off the total.',
    setup: { A: { p: 1, e: 5 }, B: { p: -1, e: 2 }, C: { p: 0, e: 0 } },
    answer: 7,
    note: 'Both exponents have magnitude 1, so the errors simply add: $5\\% + 2\\% = 7\\%$.'
  },
  {
    text: 'Acceleration due to gravity: $g = 4\\pi^2 L/T^2$ with $L$ to $0.5\\%$ and $T$ to $1.1\\%$.',
    setup: { A: { p: 1, e: 0.5 }, B: { p: -2, e: 1.1 }, C: { p: 0, e: 0 } },
    answer: 2.7,
    note: 'Timing enters squared, so its $1.1\\%$ becomes $2.2\\%$ — over four times the length’s contribution. Time 20 swings, not one.'
  },
  {
    text: 'Density of a cylinder: $\\rho = m/(\\pi r^2 \\ell)$ with $m$ to $1\\%$, $r$ to $2\\%$, $\\ell$ to $1.5\\%$.',
    setup: { A: { p: 1, e: 1 }, B: { p: -2, e: 2 }, C: { p: -1, e: 1.5 } },
    answer: 6.5,
    note: 'The radius contributes $4\\%$ — more than the other two combined. Measure radii with a screw gauge.'
  },
  {
    text: 'A quantity $P = a^3 b^2 / \\sqrt{c}$ with errors $1\\%$, $3\\%$ and $4\\%$.',
    setup: { A: { p: 3, e: 1 }, B: { p: 2, e: 3 }, C: { p: -0.5, e: 4 } },
    answer: 11,
    note: 'The square root is a power of one half, so $c$ contributes only $2\\%$ despite being the worst-measured quantity.'
  }
];

export default {
  id: 'propagationForge',

  mount(root, ctx) {
    const cab = arcade(root, {
      title: 'Propagation Forge',
      badge: 'Error budget',
      hint: 'Every exponent multiplies its variable’s error. Find which term dominates.',
      best: ctx.best ?? null,
      onRestart: start
    });

    const st = {
      A: { p: 1, e: 2 },
      B: { p: 1, e: 3 },
      C: { p: 0, e: 0 }
    };
    let score = 0, chIdx = 0, freeplay = false;

    const wrap = h('div', { style: { display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,300px)', gap: '16px', padding: '16px' } });
    cab.stage.appendChild(wrap);
    const left = h('div'), right = h('div');
    wrap.appendChild(left); wrap.appendChild(right);

    /* ---- formula display ---- */
    const formulaBox = h('div', { style: { textAlign: 'center', padding: '8px 0 14px' } });
    left.appendChild(formulaBox);

    /* ---- bar chart ---- */
    const chart = canvasLayer(left, {
      height: 190,
      draw(g, w, hgt) {
        const terms = VARS.map((v) => ({
          ...v,
          contrib: Math.abs(st[v.id].p) * st[v.id].e,
          label: `${st[v.id].p === 0 ? '' : Math.abs(st[v.id].p) + '×'}${st[v.id].e}%`
        }));
        const total = terms.reduce((a, t) => a + t.contrib, 0);
        const max = Math.max(total, 1);

        const padL = 44, padB = 30, padT = 16;
        const plotW = w - padL - 14, plotH = hgt - padB - padT;

        // axis
        c2d.line(g, padL, padT, padL, padT + plotH, { color: cssVar('--line'), width: 1 });
        c2d.line(g, padL, padT + plotH, padL + plotW, padT + plotH, { color: cssVar('--line'), width: 1 });
        for (let i = 0; i <= 4; i++) {
          const y = padT + plotH - (plotH * i) / 4;
          c2d.text(g, ((max * i) / 4).toFixed(0) + '%', padL - 6, y, { size: 10, align: 'right', color: cssVar('--ink-4') });
          if (i) c2d.line(g, padL, y, padL + plotW, y, { color: cssVar('--line-soft'), width: 1, dash: [2, 4] });
        }

        // bars: three contributions, then the stacked total
        const slots = terms.length + 1;
        const bw = Math.min(58, (plotW / slots) * 0.62);
        const gap = plotW / slots;

        terms.forEach((t, i) => {
          const x = padL + gap * i + (gap - bw) / 2;
          const bh = (t.contrib / max) * plotH;
          g.fillStyle = cssVar(t.colour);
          c2d.roundRect(g, x, padT + plotH - bh, bw, bh, 5);
          g.fill();
          c2d.text(g, t.sym, x + bw / 2, padT + plotH + 12, { size: 12, weight: 700, color: cssVar('--ink-2') });
          if (t.contrib > 0) {
            c2d.text(g, t.contrib.toFixed(1) + '%', x + bw / 2, padT + plotH - bh - 9, { size: 11, weight: 800, color: cssVar(t.colour) });
          }
        });

        // total, stacked
        const x = padL + gap * terms.length + (gap - bw) / 2;
        let acc = 0;
        for (const t of terms) {
          const bh = (t.contrib / max) * plotH;
          g.fillStyle = cssVar(t.colour);
          g.globalAlpha = 0.85;
          g.fillRect(x, padT + plotH - acc - bh, bw, bh);
          g.globalAlpha = 1;
          acc += bh;
        }
        g.strokeStyle = cssVar('--ink-2'); g.lineWidth = 2;
        g.strokeRect(x, padT + plotH - acc, bw, acc);
        c2d.text(g, 'TOTAL', x + bw / 2, padT + plotH + 12, { size: 11, weight: 800, color: cssVar('--ink-1') });
        c2d.text(g, total.toFixed(1) + '%', x + bw / 2, padT + plotH - acc - 9, { size: 13, weight: 900, color: cssVar('--ink-1') });
      }
    });

    /* ---- controls ---- */
    const out = readouts([
      { key: 'total', label: 'total % error', value: '0%' },
      { key: 'worst', label: 'dominant term', value: '—' }
    ]);
    right.appendChild(out.root);

    const controls = h('div', { style: { display: 'grid', gap: '14px', marginTop: '14px' } });
    right.appendChild(controls);

    const sliders = {};
    for (const v of VARS) {
      const pw = slider({
        label: `${v.sym} — exponent`, min: -3, max: 3, step: 0.5, value: st[v.id].p,
        onInput: (val) => { st[v.id].p = val; refresh(); }
      });
      const ew = slider({
        label: `${v.sym} — measured to`, min: 0, max: 10, step: 0.1, value: st[v.id].e, unit: '%',
        fmt: (x) => x.toFixed(1), onInput: (val) => { st[v.id].e = val; refresh(); }
      });
      sliders[v.id] = { pw, ew };
      controls.appendChild(h('div', {
        style: { border: '1px solid var(--line)', borderRadius: 'var(--r-md)', padding: '10px', display: 'grid', gap: '10px' }
      },
        h('div.row', { style: { gap: '8px' } },
          h('i', { style: { width: '10px', height: '10px', borderRadius: '3px', background: `var(${v.colour})`, display: 'block' } }),
          h('strong', null, v.sym)),
        pw.root, ew.root));
    }

    const challengeBox = h('div.callout.callout--jee', { style: { marginTop: '14px' } });
    right.appendChild(challengeBox);
    const actions = h('div.btnbar', { style: { marginTop: '12px' } });
    right.appendChild(actions);

    /* ---- logic ---- */

    function tex() {
      const num = [], den = [];
      for (const v of VARS) {
        const p = st[v.id].p;
        if (p === 0) continue;
        const body = Math.abs(p) === 1 ? v.sym : `${v.sym}^{${fmtP(Math.abs(p))}}`;
        (p > 0 ? num : den).push(body);
      }
      const n = num.join('') || '1';
      return den.length ? `Z = \\dfrac{${n}}{${den.join('')}}` : `Z = ${n}`;
    }
    const fmtP = (p) => (Number.isInteger(p) ? String(p) : `${p * 2}/2`);

    function refresh() {
      clear(formulaBox);
      formulaBox.appendChild(renderMath(tex(), { display: true }));

      const terms = VARS.map((v) => ({ v, c: Math.abs(st[v.id].p) * st[v.id].e }));
      const total = terms.reduce((a, t) => a + t.c, 0);
      const worst = terms.slice().sort((a, b) => b.c - a.c)[0];

      out.set('total', total.toFixed(1) + '%');
      out.set('worst', worst.c > 0 ? `${worst.v.sym} (${worst.c.toFixed(1)}%)` : '—');
      chart.redraw();

      // Live commentary on the budget.
      if (total > 0 && worst.c / total > 0.5) {
        cab.setHint(`**${worst.v.sym}** alone is ${Math.round((worst.c / total) * 100)}% of the error budget. Improving anything else is wasted effort.`);
      } else if (total > 0) {
        cab.setHint('The budget is balanced — no single measurement dominates.');
      }
      checkChallenge(total);
    }

    function renderChallenge() {
      clear(challengeBox);
      clear(actions);
      if (freeplay || chIdx >= CHALLENGES.length) {
        challengeBox.appendChild(h('div.callout__label', null, 'Free play'));
        challengeBox.appendChild(h('div.small', null,
          renderInline('Build any formula. Try setting one exponent to $3$ and see how fast the budget blows out.')));
        actions.appendChild(btn('Replay challenges', () => { freeplay = false; chIdx = 0; renderChallenge(); }));
        return;
      }
      const c = CHALLENGES[chIdx];
      challengeBox.appendChild(h('div.callout__label', null, `Challenge ${chIdx + 1} / ${CHALLENGES.length}`));
      challengeBox.appendChild(h('div.small', null, renderInline(c.text)));
      actions.appendChild(btn('Skip', () => { chIdx++; renderChallenge(); }));
      actions.appendChild(btn('Free play', () => { freeplay = true; renderChallenge(); }, { kind: 'ghost' }));
    }

    let settled = false;
    function checkChallenge(total) {
      if (freeplay || chIdx >= CHALLENGES.length || settled) return;
      const c = CHALLENGES[chIdx];
      const match = VARS.every((v) => {
        const want = c.setup[v.id];
        return Math.abs(st[v.id].p - want.p) < 1e-6 && Math.abs(st[v.id].e - want.e) < 0.051;
      });
      if (!match) return;

      settled = true;
      score += 30;
      cab.setScore(score);
      sfx.levelUp();
      ctx.fx?.burstAt(challengeBox, { count: 22 });

      clear(challengeBox);
      challengeBox.className = 'callout callout--tip';
      challengeBox.appendChild(h('div.callout__label', null, `✓ ${total.toFixed(1)}% — correct`));
      challengeBox.appendChild(h('div.small', null, renderInline(c.note)));

      clear(actions);
      actions.appendChild(btn(chIdx + 1 < CHALLENGES.length ? 'Next challenge' : 'Finish', () => {
        chIdx++; settled = false;
        challengeBox.className = 'callout callout--jee';
        if (chIdx >= CHALLENGES.length) finish();
        renderChallenge();
      }, { kind: 'primary' }));
    }

    function finish() {
      const best = Math.max(ctx.best ?? 0, score);
      cab.setBest(best);
      ctx.report(score, { best, challenges: chIdx });
      freeplay = true;
    }

    function start() {
      cab.clearOverlay();
      score = 0; chIdx = 0; freeplay = false; settled = false;
      cab.setScore(0);
      st.A = { p: 1, e: 2 }; st.B = { p: 1, e: 3 }; st.C = { p: 0, e: 0 };
      for (const v of VARS) {
        sliders[v.id].pw.set(st[v.id].p);
        sliders[v.id].ew.set(st[v.id].e);
      }
      renderChallenge();
      refresh();
    }

    start();
    return { destroy() { chart.stop(); } };
  }
};
