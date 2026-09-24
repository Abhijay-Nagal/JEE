/**
 * Root Forge - set the roots, watch the coefficients follow; then transform the
 * roots and watch them follow again.
 *
 * Vieta is usually run in one direction only: coefficients in, facts about
 * roots out. Running it backwards - and in particular watching what a shift or
 * a reciprocal does to b and c - is what makes the "form the new equation"
 * questions routine.
 */

import { h, clear } from '../../core/dom.js';
import { renderInline, renderMath } from '../../core/mathlite.js';
import { sfx } from '../../core/audio.js';
import { arcade, canvasLayer, cssVar, c2d, readouts, btn, seg, choices,
         verdictLine, cleared, clamp, round, rng, shuffle } from '../kit.js';

/** Transformations offered in phase two, each applied to roots p and q. */
const TRANSFORMS = {
  none:   { label: 'as they are',  f: (p, q) => [p, q],            tex: '\\alpha,\\ \\beta' },
  shift:  { label: 'each + 2',     f: (p, q) => [p + 2, q + 2],    tex: '\\alpha+2,\\ \\beta+2' },
  negate: { label: 'each negated', f: (p, q) => [-p, -q],          tex: '-\\alpha,\\ -\\beta' },
  recip:  { label: 'reciprocals',  f: (p, q) => [1 / p, 1 / q],    tex: '1/\\alpha,\\ 1/\\beta' },
  square: { label: 'each squared', f: (p, q) => [p * p, q * q],    tex: '\\alpha^2,\\ \\beta^2' }
};

/** Phase two questions: original roots, transform, and why. */
const ROUNDS = [
  { p: 2, q: 3, key: 'shift',
    note: 'New sum $= S + 4 = 9$; new product $= P + 2S + 4 = 6 + 10 + 4 = 20$. The roots shift from 2 and 3 to 4 and 5.' },
  { p: 2, q: 3, key: 'recip',
    note: 'New sum $= S/P = 5/6$; new product $= 1/P = 1/6$. Clearing the fractions gives $6x^2 - 5x + 1 = 0$ — the original coefficients **reversed**.' },
  { p: 1, q: 4, key: 'negate',
    note: 'Negating both roots flips the sign of the sum but leaves the product alone, so only the $x$ coefficient changes sign: $x^2-5x+4 \\to x^2+5x+4$.' },
  { p: 2, q: 3, key: 'square',
    note: 'New sum $= \\alpha^2+\\beta^2 = S^2-2P = 13$; new product $= (\\alpha\\beta)^2 = 36$. So $x^2 - 13x + 36 = 0$, with roots 4 and 9.' },
  { p: -1, q: 3, key: 'shift',
    note: 'Original: $S = 2$, $P = -3$. New sum $= 2 + 4 = 6$; new product $= -3 + 4 + 4 = 5$. Roots 1 and 5, so $x^2 - 6x + 5 = 0$.' }
];

export default {
  id: 'rootForge',

  mount(root, ctx) {
    const cab = arcade(root, {
      title: 'Root Forge',
      badge: 'Vieta, run backwards',
      hint: 'Phase one: set the roots and read the coefficients. Phase two: transform them and predict the new equation.',
      best: ctx.best ?? null,
      onRestart: start
    });

    const r = rng(Date.now());
    let p = 2, q = 3;
    let transform = 'none';
    let phase = 'build';               // 'build' | 'predict'
    let idx = 0, score = 0, locked = false;

    /** Phase-one targets: the equation the learner must produce. */
    const BUILDS = [
      { a: 1, b: -8, c: 15, note: 'Roots 3 and 5. Sum 8, product 15 — and the middle coefficient is **minus** the sum.' },
      { a: 1, b: 1, c: -6, note: 'Roots 2 and $-3$. A **negative** product always means the roots straddle zero.' },
      { a: 1, b: 4, c: 4, note: 'Both roots $-2$. Equal roots, so $D = 16 - 16 = 0$ — the forge produced a perfect square.' }
    ];

    const stageBox = h('div');
    cab.stage.appendChild(stageBox);

    const roots = () => TRANSFORMS[transform].f(p, q);
    const coeffs = () => {
      const [u, v] = roots();
      return { S: u + v, P: u * v };
    };

    /* ------------------------------------------------------------ */

    const view = canvasLayer(stageBox, {
      height: 250,
      animate: true,
      draw(g, w, hgt) {
        const hue = cssVar('--maths');
        const ok = cssVar('--ok');
        const accent = cssVar('--accent');
        const ink = cssVar('--chart-ink');
        const dim = cssVar('--ink-4');

        /* ---- the number line, with both sets of roots ---- */
        const y = hgt * 0.42;
        const x0 = 34, x1 = w - 34;
        const LO = -8, HI = 12;
        const X = (v) => x0 + ((clamp(v, LO, HI) - LO) / (HI - LO)) * (x1 - x0);

        c2d.line(g, x0, y, x1, y, { color: ink, width: 1.6 });
        for (let v = LO; v <= HI; v += 2) {
          c2d.line(g, X(v), y, X(v), y + 6, { color: cssVar('--line'), width: 1 });
          c2d.text(g, String(v), X(v), y + 16, { size: 8, weight: 700, color: dim });
        }

        /* the original roots, always shown faintly */
        for (const v of [p, q]) {
          g.save(); g.globalAlpha = transform === 'none' ? 1 : 0.35;
          g.fillStyle = cssVar('--ink-3');
          g.beginPath(); g.arc(X(v), y, 6, 0, Math.PI * 2); g.fill();
          g.restore();
        }

        /* the transformed roots */
        const [u, vv] = roots();
        for (const v of [u, vv]) {
          const off = v < LO || v > HI;
          g.fillStyle = off ? cssVar('--bad') : ok;
          g.beginPath(); g.arc(X(v), y - 22, 7, 0, Math.PI * 2); g.fill();
          g.strokeStyle = cssVar('--bg-1'); g.lineWidth = 2; g.stroke();
          c2d.text(g, fmtNum(v), X(v), y - 40, { size: 11, weight: 900, color: off ? cssVar('--bad') : ok });
          if (transform !== 'none') {
            c2d.line(g, X(v), y - 14, X(v), y - 4, { color: ok, width: 1.2, dash: [2, 2] });
          }
        }

        if (transform !== 'none') {
          c2d.text(g, `↑  ${TRANSFORMS[transform].label}`, w / 2, y + 36,
            { size: 10, weight: 700, color: accent });
        }

        /* ---- the equation, built from S and P ---- */
        const { S, P } = coeffs();
        const boxY = hgt - 62;
        g.fillStyle = cssVar('--bg-2');
        c2d.roundRect(g, w / 2 - 190, boxY - 24, 380, 52, 10); g.fill();
        g.strokeStyle = hue; g.lineWidth = 1.5; g.stroke();
        c2d.text(g, 'x²  −  (sum) x  +  (product)  =  0', w / 2, boxY - 8,
          { size: 10, weight: 700, color: dim });
        c2d.text(g, `x² ${S < 0 ? '+' : '−'} ${Math.abs(S).toFixed(2)}x ${P < 0 ? '−' : '+'} ${Math.abs(P).toFixed(2)} = 0`,
          w / 2, boxY + 12, { size: 16, weight: 900, color: hue, font: 'mono' });

        /* ---- S and P badges ---- */
        const badge = (bx, label, value, colour) => {
          g.fillStyle = cssVar('--bg-0');
          c2d.roundRect(g, bx - 62, 16, 124, 40, 8); g.fill();
          g.strokeStyle = colour; g.lineWidth = 1.3; g.stroke();
          c2d.text(g, label, bx, 30, { size: 9, weight: 700, color: dim });
          c2d.text(g, value, bx, 46, { size: 15, weight: 900, color: colour, font: 'mono' });
        };
        badge(w * 0.3, 'sum   α + β', fmtNum(S), ok);
        badge(w * 0.7, 'product   αβ', fmtNum(P), accent);
      }
    });

    function fmtNum(v) {
      if (!Number.isFinite(v)) return '—';
      return Math.abs(v - Math.round(v)) < 1e-9 ? String(Math.round(v)) : v.toFixed(3);
    }

    /* ------------------------------------------------------------ */

    const out = readouts([
      { key: 'r', label: 'roots', value: '—' },
      { key: 's', label: 'sum', value: '—' },
      { key: 'p', label: 'product', value: '—' },
      { key: 'e', label: 'equation', value: '—' }
    ]);

    function refresh() {
      const [u, v] = roots();
      const { S, P } = coeffs();
      out.set('r', `${fmtNum(u)}, ${fmtNum(v)}`);
      out.set('s', fmtNum(S));
      out.set('p', fmtNum(P));
      out.set('e', `x² ${S < 0 ? '+' : '−'} ${Math.abs(S)}x ${P < 0 ? '−' : '+'} ${Math.abs(P)}`);
    }

    const taskBox = h('div.callout.callout--jee', { style: { margin: '0 0 12px' } });
    const pad = h('div');
    const verdict = h('div');
    cab.panel.appendChild(taskBox);
    cab.panel.appendChild(out.root);
    cab.panel.appendChild(pad);
    cab.panel.appendChild(verdict);

    function stepRoot(which, by) {
      if (which === 'p') p = clamp(p + by, -5, 8);
      else q = clamp(q + by, -5, 8);
      refresh();
    }

    function renderPad() {
      clear(pad);
      if (phase === 'build') {
        pad.appendChild(h('div.row', { style: { justifyContent: 'center', margin: '10px 0 4px', gap: '8px' } },
          h('span.small.muted', null, 'α'),
          btn('−', () => stepRoot('p', -1), { kind: 'ghost' }),
          btn('+', () => stepRoot('p', 1), { kind: 'ghost' }),
          h('span.small.muted', { style: { marginLeft: '12px' } }, 'β'),
          btn('−', () => stepRoot('q', -1), { kind: 'ghost' }),
          btn('+', () => stepRoot('q', 1), { kind: 'ghost' })
        ));
        pad.appendChild(h('div.btnbar', null,
          btn('Check', check, { kind: 'primary', size: 'md' })));
        return;
      }

      /* predict phase: the learner picks the resulting equation */
      const round = ROUNDS[idx];
      const t = TRANSFORMS[round.key];
      const [u, v] = t.f(round.p, round.q);
      const S = u + v, P = u * v;
      // The distractors are the three classic slips: sign of the sum, sign of
      // the product, and forgetting to transform at all. On some rounds two of
      // those coincide, so the pool is over-supplied and then de-duplicated.
      const answer = eqTex(S, P);
      const pool = [
        eqTex(-S, P),
        eqTex(S, -P),
        eqTex(round.p + round.q, round.p * round.q),
        eqTex(-S, -P)
      ];
      const seen = new Set([answer]);
      const wrong = [];
      for (const cand of pool) {
        if (seen.has(cand) || wrong.length === 3) continue;
        seen.add(cand);
        wrong.push(cand);
      }
      const opts = shuffle([
        { label: `$${answer}$`, value: 'ok' },
        ...wrong.map((x, i) => ({ label: `$${x}$`, value: `w${i}` }))
      ], r);
      pad.appendChild(choices(opts, (val) => answerPredict(val, round)));
    }

    /** x^2 - Sx + P = 0, written the way it would be on paper. */
    function eqTex(S, P) {
      const num = (v) => (Math.abs(v - Math.round(v)) < 1e-9 ? Math.round(v) : Number(v.toFixed(2)));
      const s = Math.abs(num(S)), pp = Math.abs(num(P));
      // "1x" is never written, so a unit coefficient shows as a bare x.
      const sTerm = s === 0 ? '' : `${S < 0 ? '+' : '-'} ${s === 1 ? '' : s}x `;
      const pTerm = `${P < 0 ? '-' : '+'} ${pp}`;
      return `x^2 ${sTerm}${pTerm} = 0`;
    }

    /* ------------------------------------------------------------ */

    function renderTask() {
      clear(taskBox);
      clear(verdict);

      if (phase === 'build' && idx >= BUILDS.length) {
        phase = 'predict'; idx = 0; transform = 'none';
      }
      if (phase === 'predict' && idx >= ROUNDS.length) {
        taskBox.className = 'callout callout--tip';
        taskBox.appendChild(h('div.callout__label', null, '✓ Forge mastered'));
        taskBox.appendChild(h('div.small', null, renderInline(
          'Every "form the new equation" question is the same two steps: work out the new sum, work out the new product, then write $x^2 - Sx + P = 0$.')));
        clear(pad);
        return;
      }

      renderPad();

      if (phase === 'build') {
        const b = BUILDS[idx];
        taskBox.className = 'callout callout--jee';
        taskBox.appendChild(h('div.callout__label', null, `Forge ${idx + 1} / ${BUILDS.length}`));
        taskBox.appendChild(h('div.small', null, renderInline('Set the roots so that the forge produces:')));
        taskBox.appendChild(h('div', { style: { fontSize: '1.2rem', fontWeight: '900', margin: '6px 0' } },
          renderMath(eqTex(-b.b, b.c))));
        return;
      }

      const round = ROUNDS[idx];
      p = round.p; q = round.q; transform = round.key;
      refresh();
      taskBox.className = 'callout callout--jee';
      taskBox.appendChild(h('div.callout__label', null, `Predict ${idx + 1} / ${ROUNDS.length}`));
      taskBox.appendChild(h('div.small', null, renderInline(
        `$\\alpha$ and $\\beta$ are the roots of $${eqTex(round.p + round.q, round.p * round.q)}$. Which equation has roots $${TRANSFORMS[round.key].tex}$?`)));
    }

    function check() {
      if (locked || phase !== 'build' || idx >= BUILDS.length) return;
      const b = BUILDS[idx];
      const { S, P } = coeffs();
      if (Math.abs(S - -b.b) > 1e-9 || Math.abs(P - b.c) > 1e-9) {
        sfx.wrong();
        clear(verdict);
        verdict.appendChild(verdictLine(false,
          `Your roots give sum $${fmtNum(S)}$ and product $${fmtNum(P)}$. You need sum $${-b.b}$ and product $${b.c}$.`));
        return;
      }
      win(b.note);
    }

    function answerPredict(val, round) {
      if (locked) return;
      if (val !== 'ok') {
        sfx.wrong();
        clear(verdict);
        verdict.appendChild(verdictLine(false,
          'Not that one. Work out the **new sum** and the **new product** first, then assemble the equation.'));
        renderPad();
        return;
      }
      win(round.note);
    }

    function win(note) {
      locked = true;
      score += 25;
      cab.setScore(score);
      sfx.levelUp();
      ctx.fx?.burstAt(taskBox, { count: 18 });

      clear(taskBox);
      taskBox.className = 'callout callout--tip';
      taskBox.appendChild(h('div.callout__label', null, '✓ Correct'));
      taskBox.appendChild(h('div.small', null, renderInline(note)));
      clear(verdict);
      clear(pad);
      const last = phase === 'predict' && idx === ROUNDS.length - 1;
      verdict.appendChild(h('div.btnbar', { style: { marginTop: '10px' } },
        btn(last ? 'Finish' : 'Next', () => {
          idx++; locked = false;
          renderTask();
          if (phase === 'predict' && idx >= ROUNDS.length) finish();
        }, { kind: 'primary' })));
    }

    function finish() {
      const best = Math.max(ctx.best ?? 0, score);
      cab.setBest(best);
      ctx.report(score, { best, rounds: BUILDS.length + ROUNDS.length });
      cab.overlay(cleared(score, best, start));
    }

    function start() {
      cab.clearOverlay();
      score = 0; idx = 0; locked = false;
      phase = 'build'; transform = 'none';
      p = 1; q = 1;
      cab.setScore(0);
      refresh();
      renderTask();
    }

    start();
    return { destroy() { view.stop(); } };
  }
};
