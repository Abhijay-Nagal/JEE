/**
 * Rayleigh Forge - derive a physical law from dimensions alone.
 *
 * Two-phase puzzle. First decide *which* quantities the phenomenon can
 * possibly depend on; then solve the M/L/T system for their exponents. The
 * three equations update live, so the learner watches the linear system close.
 *
 * Teaches: Rayleigh's method, and the striking results it produces (a
 * pendulum's period cannot depend on its mass).
 */

import { h, clear } from '../../core/dom.js';
import { renderInline, renderMath } from '../../core/mathlite.js';
import { sfx } from '../../core/audio.js';
import { arcade, btn, cleared, shuffle, clamp } from '../kit.js';

/** Dimension vectors for the candidate quantities. */
const DIM = {
  m:     { sym: 'm',      name: 'mass',            M: 1,  L: 0,  T: 0 },
  l:     { sym: 'l',      name: 'length',          M: 0,  L: 1,  T: 0 },
  g:     { sym: 'g',      name: 'gravity',         M: 0,  L: 1,  T: -2 },
  theta: { sym: '\\theta', name: 'amplitude (angle)', M: 0, L: 0, T: 0 },
  eta:   { sym: '\\eta',  name: 'viscosity',       M: 1,  L: -1, T: -1 },
  r:     { sym: 'r',      name: 'radius',          M: 0,  L: 1,  T: 0 },
  v:     { sym: 'v',      name: 'speed',           M: 0,  L: 1,  T: -1 },
  P:     { sym: 'P',      name: 'pressure',        M: 1,  L: -1, T: -2 },
  rho:   { sym: '\\rho',  name: 'density',         M: 1,  L: -3, T: 0 },
  S:     { sym: 'S',      name: 'surface tension', M: 1,  L: 0,  T: -2 },
  E:     { sym: 'E',      name: 'energy',          M: 1,  L: 2,  T: -2 },
  t:     { sym: 't',      name: 'time',            M: 0,  L: 0,  T: 1 },
  k:     { sym: 'k',      name: 'spring constant', M: 1,  L: 0,  T: -2 }
};

const PUZZLES = [
  {
    what: 'Time period $T$ of a simple pendulum',
    target: { M: 0, L: 0, T: 1 },
    targetTex: '[\\text{T}]',
    candidates: ['m', 'l', 'g', 'theta'],
    correct: { l: 0.5, g: -0.5 },
    step: 0.5,
    reveal: 'T = 2\\pi\\sqrt{l/g}',
    moral: 'Mass came out with exponent **zero** — dimensional analysis predicted that a heavy bob and a light bob swing identically, before anyone built one. Amplitude is dimensionless, so the method is blind to it (and indeed it does matter, for large swings).'
  },
  {
    what: 'Viscous drag force $F$ on a sphere',
    target: { M: 1, L: 1, T: -2 },
    targetTex: '[\\text{MLT}^{-2}]',
    candidates: ['eta', 'r', 'v', 'm'],
    correct: { eta: 1, r: 1, v: 1 },
    step: 0.5,
    reveal: 'F = 6\\pi\\eta r v',
    moral: 'The constant $6\\pi$ is invisible to this method — Stokes had to derive it properly. Dimensions give you the *shape* of a law, never its number.'
  },
  {
    what: 'Speed of sound $v$ in a gas',
    target: { M: 0, L: 1, T: -1 },
    targetTex: '[\\text{LT}^{-1}]',
    candidates: ['P', 'rho', 'l'],
    correct: { P: 0.5, rho: -0.5 },
    step: 0.5,
    reveal: 'v = \\sqrt{\\gamma P/\\rho}',
    moral: 'Newton got exactly this and was 15% low. Laplace fixed it with the factor $\\sqrt{\\gamma}$ — again, a dimensionless number the method cannot see.'
  },
  {
    what: 'Time period $T$ of an oscillating liquid drop',
    target: { M: 0, L: 0, T: 1 },
    targetTex: '[\\text{T}]',
    candidates: ['rho', 'r', 'S', 'g'],
    correct: { rho: 0.5, r: 1.5, S: -0.5 },
    step: 0.5,
    reveal: 'T = k\\sqrt{\\dfrac{\\rho r^3}{S}}',
    moral: 'Three unknowns, three equations — exactly the limit of what M, L and T alone can resolve. A fourth quantity would leave the system underdetermined.'
  },
  {
    what: 'Radius $R$ of a blast wave at time $t$',
    target: { M: 0, L: 1, T: 0 },
    targetTex: '[\\text{L}]',
    candidates: ['E', 'rho', 't'],
    correct: { E: 0.2, rho: -0.2, t: 0.4 },
    step: 0.2,
    reveal: 'R = k\\left(\\dfrac{Et^2}{\\rho}\\right)^{1/5}',
    moral: 'G. I. Taylor used this in 1950 to compute the yield of the Trinity test from declassified photographs and a stopwatch, and published it. The US government was not pleased.'
  },
  {
    what: 'Time period $T$ of a mass on a spring',
    target: { M: 0, L: 0, T: 1 },
    targetTex: '[\\text{T}]',
    candidates: ['m', 'k', 'l', 'g'],
    correct: { m: 0.5, k: -0.5 },
    step: 0.5,
    reveal: 'T = 2\\pi\\sqrt{m/k}',
    moral: 'Here mass *does* survive — contrast with the pendulum. The difference is that a spring supplies its own restoring force, so $g$ never enters.'
  }
];

export default {
  id: 'rayleighForge',

  mount(root, ctx) {
    const cab = arcade(root, {
      title: 'Rayleigh Forge',
      badge: 'Derive a law',
      hint: 'Step 1: choose what the answer can depend on. Step 2: balance M, L and T.',
      best: ctx.best ?? null,
      onRestart: start
    });

    const panel = cab.panel;
    cab.stage.appendChild(h('div', { style: { padding: '0' } }));

    let queue = [], p = null, phase = 1, selected = new Set(), exp = {}, score = 0, solved = 0, tries = 0;

    /* ---------------- phase 1: choose the variables ---------------- */

    function renderPick() {
      clear(panel);
      panel.appendChild(header('Step 1 — what can it depend on?'));

      panel.appendChild(h('p.small.muted', null,
        renderInline('Select every quantity the answer could plausibly involve. Choosing one too many makes the system unsolvable; too few and it will not balance.')));

      const grid = h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '10px', margin: '14px 0' } });
      for (const id of p.candidates) {
        const d = DIM[id];
        const card = h('button.tile', {
          style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px', padding: '12px', textAlign: 'left' },
          'aria-pressed': String(selected.has(id)),
          onClick: () => {
            sfx.pop();
            if (selected.has(id)) selected.delete(id); else selected.add(id);
            renderPick();
          }
        },
          h('div.row', { style: { gap: '6px' } },
            h('span', { style: { fontSize: '1.05rem' } }, renderMath(d.sym)),
            h('span.small', null, d.name)),
          h('span.tiny.dim.mono', null, dimText(d))
        );
        if (selected.has(id)) {
          card.style.background = 'var(--hue-dim, var(--primary-dim))';
          card.style.borderColor = 'var(--hue, var(--primary))';
        }
        grid.appendChild(card);
      }
      panel.appendChild(grid);

      panel.appendChild(h('div.btnbar', { style: { justifyContent: 'center' } },
        btn('Lock selection', lockSelection, { kind: 'primary', size: 'md' })));
    }

    function lockSelection() {
      const want = new Set(Object.keys(p.correct));
      const same = selected.size === want.size && [...want].every((k) => selected.has(k));
      if (!same) {
        tries++;
        score = Math.max(0, score - 4);
        cab.setScore(score);
        sfx.wrong();
        const extra = [...selected].filter((k) => !want.has(k));
        const missing = [...want].filter((k) => !selected.has(k));
        cab.setHint(
          extra.length ? `Something in there cannot matter. Ask: could the answer really change if **${DIM[extra[0]].name}** changed?`
            : `You are missing something — nothing you selected supplies the ${missing.length ? dimNeeded(missing[0]) : 'needed'} dimension.`
        );
        return;
      }
      sfx.unlock();
      score += 15;
      cab.setScore(score);
      phase = 2;
      exp = {};
      for (const k of selected) exp[k] = 0;
      renderSolve();
    }

    const dimNeeded = (id) => {
      const d = DIM[id];
      return d.M && !d.L ? 'mass' : d.T ? 'time' : 'length';
    };

    /* ---------------- phase 2: solve the exponents ---------------- */

    function renderSolve() {
      clear(panel);
      panel.appendChild(header('Step 2 — balance the exponents'));

      // Live assembled expression
      const expr = h('div', { style: { textAlign: 'center', margin: '10px 0 16px' } },
        renderMath(assembleTex(), { display: true }));
      panel.appendChild(expr);

      const grid = h('div', { style: { display: 'grid', gridTemplateColumns: `repeat(${Math.min(3, selected.size)}, minmax(0,1fr))`, gap: '12px' } });
      for (const id of selected) grid.appendChild(stepper(id));
      panel.appendChild(grid);

      panel.appendChild(equations());

      panel.appendChild(h('div.btnbar', { style: { marginTop: '14px', justifyContent: 'center' } },
        btn('Check', check, { kind: 'primary', size: 'md' }),
        btn('Zero all', () => { for (const k of selected) exp[k] = 0; renderSolve(); })
      ));
    }

    function stepper(id) {
      const d = DIM[id];
      const val = h('div', {
        style: { fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: '800', textAlign: 'center', color: 'var(--hue, var(--primary))' }
      }, fmtExp(exp[id]));

      const bump = (delta) => {
        exp[id] = clamp(Number((exp[id] + delta).toFixed(2)), -3, 3);
        val.textContent = fmtExp(exp[id]);
        sfx.tick();
        refreshEquations();
      };

      return h('div', { style: { background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-md)', padding: '10px' } },
        h('div', { style: { textAlign: 'center', marginBottom: '4px' } }, renderMath(d.sym)),
        h('div.tiny.dim', { style: { textAlign: 'center' } }, d.name),
        val,
        h('div.row', { style: { justifyContent: 'center', marginTop: '6px', gap: '6px' } },
          h('button.btn.btn--sm.btn--ghost', { onClick: () => bump(-p.step) }, '−'),
          h('button.btn.btn--sm.btn--ghost', { onClick: () => bump(p.step) }, '+'))
      );
    }

    let eqBox = null;
    function equations() {
      eqBox = h('div', { style: { marginTop: '16px' } });
      refreshEquations();
      return eqBox;
    }

    function refreshEquations() {
      if (!eqBox) return;
      clear(eqBox);
      const cur = current();
      eqBox.appendChild(h('div.divider-label', null, 'the three equations'));
      for (const axis of ['M', 'L', 'T']) {
        const lhs = [...selected]
          .filter((id) => DIM[id][axis] !== 0)
          .map((id) => `${fmtCoef(DIM[id][axis])}\\,${expSym(id)}`)
          .join(' + ') || '0';
        const ok = Math.abs(cur[axis] - p.target[axis]) < 1e-6;
        eqBox.appendChild(h('div.row', { style: { justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--line-soft)' } },
          h('span', null, renderMath(`${lhs} = ${p.target[axis]}`)),
          h('span.tag' + (ok ? '.tag--ok' : ''), null, ok ? '✓ balanced' : `now ${fmtExp(cur[axis])}`)
        ));
      }
    }

    const expSym = (id) => ({ m: 'x', l: 'y', g: 'z', eta: 'x', r: 'y', v: 'z', P: 'x', rho: 'y', S: 'z', E: 'x', t: 'z', k: 'y', theta: 'w' })[id] || 'x';
    const fmtCoef = (c) => (c === 1 ? '' : c === -1 ? '-' : String(c));

    function current() {
      const out = { M: 0, L: 0, T: 0 };
      for (const id of selected) {
        for (const axis of ['M', 'L', 'T']) out[axis] += DIM[id][axis] * exp[id];
      }
      for (const axis of ['M', 'L', 'T']) out[axis] = Number(out[axis].toFixed(4));
      return out;
    }

    function assembleTex() {
      const parts = [...selected].map((id) => {
        const e = exp[id];
        if (e === 0) return null;
        if (e === 1) return DIM[id].sym;
        return `${DIM[id].sym}^{${fmtExp(e)}}`;
      }).filter(Boolean);
      return `Q = k\\,${parts.length ? parts.join('\\,') : '1'}`;
    }

    function fmtExp(v) {
      if (Number.isInteger(v)) return String(v);
      const halves = v * 2;
      if (Number.isInteger(halves)) return `${halves < 0 ? '-' : ''}${Math.abs(halves)}/2`;
      const fifths = v * 5;
      if (Number.isInteger(Math.round(fifths * 100) / 100)) return `${Math.round(fifths) < 0 ? '-' : ''}${Math.abs(Math.round(fifths))}/5`;
      return String(Number(v.toFixed(2)));
    }

    function check() {
      const cur = current();
      const balanced = ['M', 'L', 'T'].every((a) => Math.abs(cur[a] - p.target[a]) < 1e-6);
      const exact = Object.keys(p.correct).every((k) => Math.abs((exp[k] ?? 0) - p.correct[k]) < 1e-6);

      if (balanced && exact) return win();
      if (balanced && !exact) {
        cab.setHint('All three balance, but that is not the unique solution — check your arithmetic on one of the axes.');
        sfx.wrong();
        return;
      }
      tries++;
      score = Math.max(0, score - 3);
      cab.setScore(score);
      sfx.wrong();
      const off = ['M', 'L', 'T'].find((a) => Math.abs(cur[a] - p.target[a]) > 1e-6);
      cab.setHint(`The **${{ M: 'mass', L: 'length', T: 'time' }[off]}** equation is not satisfied yet. Solve the axis with the fewest terms first.`);
    }

    function win() {
      solved++;
      const pts = Math.max(12, 45 - tries * 6);
      score += pts;
      cab.setScore(score);
      sfx.levelUp();
      ctx.fx?.burstAt(panel, { count: 28 });

      clear(panel);
      panel.appendChild(h('div.verdict.verdict--ok', null,
        h('div.verdict__head', null, `✓ Law derived  ·  +${pts}`),
        h('div.verdict__body', null,
          renderMath(p.reveal, { display: true }),
          h('p.small', null, renderInline(p.moral))
        )));
      panel.appendChild(h('div.btnbar', { style: { marginTop: '12px', justifyContent: 'center' } },
        btn(queue.length ? 'Next phenomenon' : 'Finish', next, { kind: 'primary', size: 'md' })));
    }

    function header(step) {
      return h('div', { style: { marginBottom: '10px' } },
        h('div.tiny.dim', null, step.toUpperCase()),
        h('div', { style: { fontSize: '1.1rem', fontWeight: '700' } }, renderInline(p.what)),
        h('div.small.muted', null, 'Target dimensions: ', renderMath(p.targetTex))
      );
    }

    const dimText = (d) => {
      const parts = [];
      for (const k of ['M', 'L', 'T']) if (d[k] !== 0) parts.push(d[k] === 1 ? k : `${k}^${d[k]}`);
      return parts.length ? `[${parts.join(' ')}]` : '[dimensionless]';
    };

    function next() {
      if (!queue.length) return finish();
      p = queue.shift();
      phase = 1; selected = new Set(); tries = 0;
      cab.setHint('Step 1: choose what the answer can depend on.');
      renderPick();
    }

    function finish() {
      const best = Math.max(ctx.best ?? 0, score);
      cab.setBest(best);
      ctx.report(score, { best, derived: solved });
      cab.overlay(cleared(score, best, start, h('p.small.muted', null, `${solved} laws derived from dimensions alone.`)));
    }

    function start() {
      cab.clearOverlay();
      queue = shuffle(PUZZLES).slice(0, 4);
      score = 0; solved = 0;
      cab.setScore(0);
      next();
    }

    start();
    return { destroy() {} };
  }
};
