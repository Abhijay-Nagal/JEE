/**
 * Sign Chart - build the line, mark the roots, read the answer.
 *
 * Inequalities are usually attacked algebraically and get signs wrong. The sign
 * chart is mechanical and cannot go wrong if it is drawn: the expression can
 * change sign only at a root, and only at one of odd multiplicity. This widget
 * makes the learner claim each interval, and shows the curve above the line so
 * the claim is checkable by eye.
 */

import { h, clear } from '../../core/dom.js';
import { renderInline, renderMath } from '../../core/mathlite.js';
import { sfx } from '../../core/audio.js';
import { arcade, canvasLayer, cssVar, c2d, readouts, btn,
         verdictLine, cleared, clamp } from '../kit.js';

/**
 * Each problem is a product of linear factors with multiplicities. Keeping the
 * factors explicit is what lets the widget mark the even-multiplicity root as
 * a touch rather than a crossing.
 */
const PROBLEMS = [
  { tex: '(x-2)(x-3) > 0', factors: [{ r: 2, m: 1 }, { r: 3, m: 1 }], want: 'pos', strict: true,
    note: 'An upward parabola is positive **outside** its roots. Answer: $x < 2$ or $x > 3$.' },
  { tex: '(x-2)(x-3) < 0', factors: [{ r: 2, m: 1 }, { r: 3, m: 1 }], want: 'neg', strict: true,
    note: 'And negative **between** them: $2 < x < 3$. The same chart answers both directions — you draw it once.' },
  { tex: '(x-1)(x-2)(x-3) < 0', factors: [{ r: 1, m: 1 }, { r: 2, m: 1 }, { r: 3, m: 1 }], want: 'neg', strict: true,
    note: 'Three simple roots, so the sign alternates: $+$ above 3, $-$ on $(2,3)$, $+$ on $(1,2)$, $-$ below 1. Answer: $x < 1$ or $2 < x < 3$.' },
  { tex: '(x+1)(x-2)^2 > 0', factors: [{ r: -1, m: 1 }, { r: 2, m: 2 }], want: 'pos', strict: true,
    note: 'The **squared** factor never goes negative, so the sign does **not** flip at $x = 2$ — the curve touches the axis and turns back. Answer: $x > -1$, excluding $x = 2$ where the expression is zero.' },
  { tex: '(x+2)(x-1)(x-4) > 0', factors: [{ r: -2, m: 1 }, { r: 1, m: 1 }, { r: 4, m: 1 }], want: 'pos', strict: true,
    note: 'Positive on $(-2, 1)$ and on $(4, \\infty)$. Reading from the far right and alternating is faster and safer than substituting test values everywhere.' }
];

const LO = -6, HI = 7;

export default {
  id: 'signChart',

  mount(root, ctx) {
    const cab = arcade(root, {
      title: 'Sign Chart',
      badge: 'Claim every interval',
      hint: 'Mark each interval + or −. The expression can only change sign at a root of odd multiplicity.',
      best: ctx.best ?? null,
      onRestart: start
    });

    let idx = 0, score = 0, locked = false;
    let claims = [];                   // 'pos' | 'neg' | null, one per interval
    let revealed = false;

    const stageBox = h('div');
    cab.stage.appendChild(stageBox);

    const problem = () => PROBLEMS[Math.min(idx, PROBLEMS.length - 1)];

    /** Interval boundaries, from -inf through each root to +inf. */
    const bounds = () => {
      const rs = problem().factors.map((f) => f.r).sort((a, b) => a - b);
      return [LO, ...rs, HI];
    };

    /** The true sign of the product on the interval containing x. */
    function signAt(x) {
      let s = 1;
      for (const f of problem().factors) s *= Math.sign(x - f.r) ** f.m;
      return s > 0 ? 'pos' : 'neg';
    }

    /** A representative point inside interval i. */
    const midOf = (i) => {
      const b = bounds();
      return (b[i] + b[i + 1]) / 2;
    };

    const nIntervals = () => bounds().length - 1;

    /* ------------------------------------------------------------ */

    let HIT = [];                      // clickable interval bands, set on draw

    const view = canvasLayer(stageBox, {
      height: 300,
      animate: true,
      onPointer(type, p) {
        if (type !== 'down' || locked) return;
        const band = HIT.find((b) => p.x >= b.x0 && p.x <= b.x1 && p.y >= b.y0 && p.y <= b.y1);
        if (!band) return;
        // cycle: unset -> + -> - -> unset
        claims[band.i] = claims[band.i] === 'pos' ? 'neg' : claims[band.i] === 'neg' ? null : 'pos';
        sfx.click();
        refresh();
      },
      draw(g, w, hgt) {
        const prob = problem();
        const hue = cssVar('--maths');
        const ok = cssVar('--ok');
        const bad = cssVar('--bad');
        const ink = cssVar('--chart-ink');
        const dim = cssVar('--ink-4');

        const x0 = 34, x1 = w - 34;
        const X = (v) => x0 + ((clamp(v, LO, HI) - LO) / (HI - LO)) * (x1 - x0);

        /* ---- the curve, above the line ---- */
        const cy = hgt * 0.30, amp = hgt * 0.20;
        const f = (x) => prob.factors.reduce((a, fa) => a * Math.pow(x - fa.r, fa.m), 1);
        // A cubic runs to several hundred at the edges while the dip between two
        // adjacent roots is a fraction of one. Linear scaling flattens exactly
        // the part that matters, so normalise by the range maximum and then take
        // a fourth root: the shape survives and every sign change stays visible.
        let peak = 1e-9;
        for (let i = 0; i <= 60; i++) {
          peak = Math.max(peak, Math.abs(f(LO + (i / 60) * (HI - LO))));
        }
        const squash = (y) => Math.sign(y) * Math.pow(Math.abs(y) / peak, 0.25) * amp;

        c2d.line(g, x0, cy, x1, cy, { color: dim, width: 1, dash: [3, 4] });
        g.save();
        g.strokeStyle = hue; g.lineWidth = 2.6; g.lineJoin = 'round';
        g.beginPath();
        for (let i = 0; i <= 300; i++) {
          const x = LO + (i / 300) * (HI - LO);
          const y = cy - squash(f(x));
          i ? g.lineTo(X(x), y) : g.moveTo(X(x), y);
        }
        g.stroke();
        g.restore();

        /* ---- the number line ---- */
        const ly = hgt - 110;
        const rootAt = new Set(prob.factors.map((fa) => fa.r));
        c2d.line(g, x0, ly, x1, ly, { color: ink, width: 1.8 });
        for (let v = LO + 1; v < HI; v++) {
          c2d.line(g, X(v), ly, X(v), ly + 5, { color: cssVar('--line'), width: 1 });
          // a root already carries its own, larger label above the line
          if (!rootAt.has(v)) c2d.text(g, String(v), X(v), ly + 15, { size: 8, weight: 700, color: dim });
        }

        /* the roots */
        for (const fa of prob.factors) {
          const even = fa.m % 2 === 0;
          g.fillStyle = even ? cssVar('--accent') : cssVar('--ink-0');
          g.beginPath(); g.arc(X(fa.r), ly, 6.5, 0, Math.PI * 2); g.fill();
          g.strokeStyle = cssVar('--bg-1'); g.lineWidth = 2; g.stroke();
          c2d.text(g, String(fa.r), X(fa.r), ly - 14,
            { size: 11, weight: 900, color: even ? cssVar('--accent') : cssVar('--ink-2') });
          if (even) {
            c2d.text(g, 'double', X(fa.r), ly + 30,
              { size: 8, weight: 800, color: cssVar('--accent') });
          }
          // a dotted riser up to the curve, so the crossing is visible
          c2d.line(g, X(fa.r), cy, X(fa.r), ly, { color: cssVar('--line'), width: 1, dash: [2, 5] });
        }

        /* ---- the claim bands ---- */
        const b = bounds();
        HIT = [];
        const by = ly + 40, bh = 30;
        for (let i = 0; i < b.length - 1; i++) {
          const bx0 = X(b[i]) + 2, bx1 = X(b[i + 1]) - 2;
          HIT.push({ i, x0: bx0, x1: bx1, y0: by, y1: by + bh });

          const claim = claims[i];
          const truth = signAt(midOf(i));
          const right = revealed && claim === truth;
          const wrongC = revealed && claim && claim !== truth;

          g.save();
          g.fillStyle = claim === 'pos' ? withAlpha(ok, 0.18)
            : claim === 'neg' ? withAlpha(bad, 0.18)
            : cssVar('--bg-2');
          c2d.roundRect(g, bx0, by, Math.max(6, bx1 - bx0), bh, 5); g.fill();
          g.strokeStyle = wrongC ? bad : right ? ok
            : claim === 'pos' ? ok : claim === 'neg' ? bad : cssVar('--line');
          g.lineWidth = claim || revealed ? 1.8 : 1;
          g.stroke();
          g.restore();

          const label = claim === 'pos' ? '+' : claim === 'neg' ? '−' : '?';
          c2d.text(g, label, (bx0 + bx1) / 2, by + bh / 2,
            { size: 16, weight: 900,
              color: claim === 'pos' ? ok : claim === 'neg' ? bad : dim });

          if (revealed && wrongC) {
            c2d.text(g, truth === 'pos' ? '+' : '−', (bx0 + bx1) / 2, by + bh + 12,
              { size: 11, weight: 900, color: ok });
          }
        }
        c2d.text(g, 'tap each band to claim  +  or  −', w / 2, by + bh + 26,
          { size: 9, weight: 700, color: dim });

        /* ---- the expression ---- */
        c2d.text(g, prob.tex.replace(/\*/g, ''), w / 2, 20,
          { size: 15, weight: 900, color: hue, font: 'mono' });
      }
    });

    /** Canvas has no colour-mix, so blend by hand for the band fills. */
    function withAlpha(colour, alpha) {
      const c = colour.trim();
      if (c.startsWith('#') && (c.length === 7 || c.length === 4)) {
        const full = c.length === 4 ? `#${c[1]}${c[1]}${c[2]}${c[2]}${c[3]}${c[3]}` : c;
        const n = parseInt(full.slice(1), 16);
        return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
      }
      return c;
    }

    /* ------------------------------------------------------------ */

    const out = readouts([
      { key: 'e', label: 'expression', value: '—' },
      { key: 'c', label: 'claimed', value: '0' },
      { key: 'w', label: 'want', value: '—' },
      { key: 's', label: 'solution', value: '—' }
    ]);

    function refresh() {
      const prob = problem();
      out.set('e', prob.tex);
      out.set('c', `${claims.filter(Boolean).length} / ${nIntervals()}`);
      out.set('w', prob.want === 'pos' ? '> 0' : '< 0');
      out.set('s', revealed ? solutionText() : '—');
      view.redraw();
    }

    /** The intervals where the true sign matches what the problem asks for. */
    function solutionText() {
      const prob = problem();
      const b = bounds();
      const parts = [];
      for (let i = 0; i < b.length - 1; i++) {
        if (signAt(midOf(i)) !== prob.want) continue;
        const lo = i === 0 ? '−∞' : String(b[i]);
        const hi = i === b.length - 2 ? '∞' : String(b[i + 1]);
        parts.push(`(${lo}, ${hi})`);
      }
      return parts.join('  ∪  ') || 'no solution';
    }

    const taskBox = h('div.callout.callout--jee', { style: { margin: '0 0 12px' } });
    const pad = h('div');
    const verdict = h('div');
    cab.panel.appendChild(taskBox);
    cab.panel.appendChild(out.root);
    cab.panel.appendChild(pad);
    cab.panel.appendChild(verdict);

    function renderPad() {
      clear(pad);
      pad.appendChild(h('div.btnbar', { style: { marginTop: '12px' } },
        btn('Check the chart', check, { kind: 'primary', size: 'md' }),
        btn('Clear claims', () => { claims = claims.map(() => null); revealed = false; refresh(); },
          { kind: 'ghost' })
      ));
    }

    /* ------------------------------------------------------------ */

    function renderTask() {
      clear(taskBox);
      clear(verdict);
      if (idx >= PROBLEMS.length) {
        taskBox.className = 'callout callout--tip';
        taskBox.appendChild(h('div.callout__label', null, '✓ Chart mastered'));
        taskBox.appendChild(h('div.small', null, renderInline(
          'The chart is mechanical: mark the roots, test the far right, alternate — except across an even power, where the sign holds. It answers every polynomial and rational inequality you will meet.')));
        clear(pad);
        return;
      }
      const prob = PROBLEMS[idx];
      claims = new Array(nIntervals()).fill(null);
      revealed = false;
      taskBox.className = 'callout callout--jee';
      taskBox.appendChild(h('div.callout__label', null, `Inequality ${idx + 1} / ${PROBLEMS.length}`));
      taskBox.appendChild(h('div.small', null, renderInline('Mark the sign of the expression on every interval, then check.')));
      taskBox.appendChild(h('div', { style: { fontSize: '1.2rem', fontWeight: '900', margin: '6px 0' } },
        renderMath(prob.tex.replace('>', '> ').replace('<', '< '))));
      renderPad();
      refresh();
    }

    function check() {
      if (locked || idx >= PROBLEMS.length) return;
      if (claims.some((c) => !c)) {
        sfx.wrong();
        cab.setHint('Every interval needs a claim. Tap the empty bands.');
        return;
      }

      const wrong = claims.filter((c, i) => c !== signAt(midOf(i))).length;
      revealed = true;
      refresh();

      if (wrong) {
        sfx.wrong();
        clear(verdict);
        verdict.appendChild(verdictLine(false,
          `${wrong} interval${wrong > 1 ? 's are' : ' is'} wrong — the correct sign is shown underneath. Start from the far right, where every factor is positive, and alternate leftwards.`));
        verdict.appendChild(h('div.btnbar', { style: { marginTop: '10px' } },
          btn('Try again', () => { claims = claims.map(() => null); revealed = false; clear(verdict); refresh(); },
            { kind: 'ghost' })));
        return;
      }

      locked = true;
      score += 25;
      cab.setScore(score);
      sfx.levelUp();
      ctx.fx?.burstAt(taskBox, { count: 18 });

      clear(taskBox);
      taskBox.className = 'callout callout--tip';
      taskBox.appendChild(h('div.callout__label', null, `✓ Solution: ${solutionText()}`));
      taskBox.appendChild(h('div.small', null, renderInline(PROBLEMS[idx].note)));
      clear(verdict);
      verdict.appendChild(h('div.btnbar', { style: { marginTop: '10px' } },
        btn(idx === PROBLEMS.length - 1 ? 'Finish' : 'Next inequality', () => {
          idx++; locked = false;
          renderTask();
          if (idx >= PROBLEMS.length) finish();
        }, { kind: 'primary' })));
    }

    function finish() {
      const best = Math.max(ctx.best ?? 0, score);
      cab.setBest(best);
      ctx.report(score, { best, problems: PROBLEMS.length });
      cab.overlay(cleared(score, best, start));
    }

    function start() {
      cab.clearOverlay();
      score = 0; idx = 0; locked = false; revealed = false;
      cab.setScore(0);
      renderTask();
    }

    start();
    return { destroy() { view.stop(); } };
  }
};
