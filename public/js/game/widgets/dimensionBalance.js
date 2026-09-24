/**
 * Dimension Balance - set the M, L, T exponents until the scale levels.
 *
 * Teaches: deriving a dimensional formula from a defining equation, and the
 * feel of homogeneity as a physical balance rather than a bookkeeping rule.
 */

import { h, clear } from '../../core/dom.js';
import { renderInline, renderMath } from '../../core/mathlite.js';
import { sfx } from '../../core/audio.js';
import { arcade, canvasLayer, cssVar, c2d, btn, cleared, shuffle, clamp } from '../kit.js';

const TARGETS = [
  { name: 'Velocity',        def: 'v = \\dfrac{\\text{displacement}}{\\text{time}}',            M: 0, L: 1, T: -1 },
  { name: 'Acceleration',    def: 'a = \\dfrac{\\Delta v}{\\Delta t}',                          M: 0, L: 1, T: -2 },
  { name: 'Force',           def: 'F = ma',                                                     M: 1, L: 1, T: -2 },
  { name: 'Momentum',        def: 'p = mv',                                                     M: 1, L: 1, T: -1 },
  { name: 'Work / Energy',   def: 'W = F \\cdot d',                                             M: 1, L: 2, T: -2 },
  { name: 'Power',           def: 'P = \\dfrac{W}{t}',                                          M: 1, L: 2, T: -3 },
  { name: 'Pressure',        def: 'P = \\dfrac{F}{A}',                                          M: 1, L: -1, T: -2 },
  { name: 'Density',         def: '\\rho = \\dfrac{m}{V}',                                      M: 1, L: -3, T: 0 },
  { name: 'Surface tension', def: 'S = \\dfrac{F}{\\ell}',                                      M: 1, L: 0, T: -2 },
  { name: 'Viscosity',       def: '\\eta = \\dfrac{F}{A\\,(dv/dx)}',                            M: 1, L: -1, T: -1 },
  { name: 'Planck constant', def: 'h = \\dfrac{E}{\\nu}',                                       M: 1, L: 2, T: -1 },
  { name: 'Grav. constant',  def: 'G = \\dfrac{F r^2}{m_1 m_2}',                                M: -1, L: 3, T: -2 },
  { name: 'Moment of inertia', def: 'I = m r^2',                                                M: 1, L: 2, T: 0 },
  { name: 'Angular velocity', def: '\\omega = \\dfrac{\\theta}{t}',                             M: 0, L: 0, T: -1 },
  { name: 'Strain',          def: '\\text{strain} = \\dfrac{\\Delta \\ell}{\\ell}',             M: 0, L: 0, T: 0 },
  { name: 'Impulse',         def: 'J = F \\Delta t',                                            M: 1, L: 1, T: -1 },
  { name: 'Energy density',  def: 'u = \\dfrac{E}{V}',                                          M: 1, L: -1, T: -2 },
  { name: 'Force constant',  def: 'k = \\dfrac{F}{x}',                                          M: 1, L: 0, T: -2 }
];

const ROUNDS = 6;

export default {
  id: 'dimensionBalance',

  mount(root, ctx) {
    const cab = arcade(root, {
      title: 'Dimension Balance',
      badge: 'Homogeneity',
      hint: 'Set the exponents so the scale levels. The tilt shows how far off you are.',
      best: ctx.best ?? null,
      onRestart: start
    });

    const exps = { M: 0, L: 0, T: 0 };
    let queue = [], target = null, score = 0, roundsDone = 0, locked = false, tilt = 0, tiltTarget = 0;

    /* ---- canvas: the balance ---- */
    const stageWrap = h('div');
    cab.stage.appendChild(stageWrap);

    const view = canvasLayer(stageWrap, {
      height: 210,
      animate: true,
      draw(g, w, hgt) {
        const hue = cssVar('--hue') || cssVar('--primary');
        const ink = cssVar('--ink-2');
        const line = cssVar('--line');

        tilt += (tiltTarget - tilt) * 0.12;

        const cx = w / 2, cy = hgt * 0.42, arm = Math.min(w * 0.34, 190);

        // stand
        c2d.line(g, cx, cy, cx, hgt - 26, { color: line, width: 6 });
        g.fillStyle = line;
        c2d.roundRect(g, cx - 42, hgt - 30, 84, 10, 5); g.fill();

        // beam
        const a = tilt;
        const lx = cx - Math.cos(a) * arm, ly = cy - Math.sin(a) * arm;
        const rx = cx + Math.cos(a) * arm, ry = cy + Math.sin(a) * arm;
        c2d.line(g, lx, ly, rx, ry, { color: locked ? cssVar('--ok') : hue, width: 5 });

        g.fillStyle = locked ? cssVar('--ok') : hue;
        g.beginPath(); g.arc(cx, cy, 8, 0, Math.PI * 2); g.fill();

        pan(g, lx, ly, 'TARGET', target ? fmtDim(target) : '', ink, line, hue);
        pan(g, rx, ry, 'YOURS', fmtDim(exps), ink, line, locked ? cssVar('--ok') : hue);

        // status text
        const err = errorOf();
        c2d.text(g, locked ? 'BALANCED' : err === 0 ? 'release to lock' : `off by ${err}`,
          cx, hgt - 8, { size: 11, weight: 700, color: locked ? cssVar('--ok') : cssVar('--ink-4') });
      }
    });

    function pan(g, x, y, label, text, ink, line, hue) {
      c2d.line(g, x, y, x, y + 34, { color: line, width: 2 });
      g.fillStyle = cssVar('--bg-2');
      g.strokeStyle = line; g.lineWidth = 1.5;
      c2d.roundRect(g, x - 62, y + 34, 124, 44, 10); g.fill(); g.stroke();
      c2d.text(g, label, x, y + 46, { size: 9, weight: 800, color: cssVar('--ink-4') });
      c2d.text(g, text, x, y + 64, { size: 14, weight: 700, color: hue, font: 'mono' });
    }

    const fmtDim = (e) => {
      const parts = [];
      for (const k of ['M', 'L', 'T']) {
        if (e[k] === 0) continue;
        parts.push(e[k] === 1 ? k : `${k}${supNum(e[k])}`);
      }
      return parts.length ? parts.join(' ') : 'dimensionless';
    };
    const supNum = (n) => String(n).replace('-', '⁻').replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+d]);

    const errorOf = () => target
      ? Math.abs(exps.M - target.M) + Math.abs(exps.L - target.L) + Math.abs(exps.T - target.T)
      : 0;

    /* ---- controls ---- */
    const panel = cab.panel;

    function render() {
      clear(panel);
      if (!target) return;

      panel.appendChild(h('div', { style: { marginBottom: '14px', textAlign: 'center' } },
        h('div.tiny.dim', null, `ROUND ${roundsDone + 1} / ${ROUNDS} — FIND THE DIMENSIONS OF`),
        h('div', { style: { fontSize: '1.2rem', fontWeight: '750', margin: '4px 0' } }, target.name),
        renderMath(target.def, { display: true })
      ));

      const grid = h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: '12px' } });
      for (const k of ['M', 'L', 'T']) {
        grid.appendChild(stepper(k));
      }
      panel.appendChild(grid);

      panel.appendChild(h('div.btnbar', { style: { marginTop: '16px', justifyContent: 'center' } },
        btn('Check balance', check, { kind: 'primary' }),
        btn('Reset', () => { exps.M = exps.L = exps.T = 0; tiltTarget = 0; render(); })
      ));
    }

    function stepper(k) {
      const label = { M: 'Mass', L: 'Length', T: 'Time' }[k];
      const val = h('div', {
        style: { fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: '800', textAlign: 'center', color: 'var(--hue, var(--primary))' }
      }, String(exps[k]));

      const bump = (d) => {
        if (locked) return;
        exps[k] = clamp(exps[k] + d, -4, 4);
        val.textContent = String(exps[k]);
        tiltTarget = clamp(signedError() * 0.06, -0.32, 0.32);
        sfx.tick();
      };

      return h('div', { style: { background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-md)', padding: '12px' } },
        h('div.tiny.dim', { style: { textAlign: 'center', marginBottom: '6px' } }, `${label} [${k}]`),
        val,
        h('div.row', { style: { justifyContent: 'center', marginTop: '8px', gap: '8px' } },
          h('button.btn.btn--sm.btn--ghost', { onClick: () => bump(-1), 'aria-label': `decrease ${label} exponent` }, '−'),
          h('button.btn.btn--sm.btn--ghost', { onClick: () => bump(1), 'aria-label': `increase ${label} exponent` }, '+')
        )
      );
    }

    // Signed so the beam tips toward whichever side is "heavier".
    const signedError = () => target
      ? (exps.M - target.M) + (exps.L - target.L) + (exps.T - target.T)
      : 0;

    function check() {
      if (locked) return;
      const err = errorOf();
      if (err === 0) {
        locked = true;
        tiltTarget = 0;
        const pts = 20;
        score += pts;
        roundsDone++;
        cab.setScore(score);
        sfx.levelUp();
        ctx.fx?.burstAt(view.canvas, { count: 24 });
        clear(panel);
        panel.appendChild(h('div.verdict.verdict--ok', null,
          h('div.verdict__head', null, '✓ Balanced'),
          h('div.verdict__body', null,
            renderInline(`**${target.name}** has dimensions `),
            renderMath(`[\\text{M}^{${target.M}}\\text{L}^{${target.L}}\\text{T}^{${target.T}}]`),
            h('p.small', { style: { marginTop: '8px' } }, renderInline(explain(target)))
          )));
        panel.appendChild(h('div.btnbar', { style: { marginTop: '12px', justifyContent: 'center' } },
          btn(roundsDone >= ROUNDS ? 'See results' : 'Next quantity', next, { kind: 'primary' })));
      } else {
        score = Math.max(0, score - 3);
        cab.setScore(score);
        sfx.wrong();
        cab.setHint(hintFor());
      }
    }

    function hintFor() {
      const dM = exps.M - target.M, dL = exps.L - target.L, dT = exps.T - target.T;
      const off = [];
      if (dM) off.push(`mass is ${dM > 0 ? 'too high' : 'too low'}`);
      if (dL) off.push(`length is ${dL > 0 ? 'too high' : 'too low'}`);
      if (dT) off.push(`time is ${dT > 0 ? 'too high' : 'too low'}`);
      return `Not balanced — ${off.join(', ')}. Read the defining equation term by term.`;
    }

    function explain(t) {
      if (t.M === 0 && t.L === 0 && t.T === 0) return 'A ratio of two like quantities — completely dimensionless.';
      if (t.name === 'Pressure') return 'Force over area: divide $[\\text{MLT}^{-2}]$ by $[\\text{L}^2]$.';
      if (t.name === 'Grav. constant') return 'Mass ends up with a **negative** exponent — the only common constant that does.';
      return 'Substitute each symbol in the defining equation with its own dimensions and collect.';
    }

    function next() {
      if (roundsDone >= ROUNDS) return finish();
      target = queue.shift();
      exps.M = exps.L = exps.T = 0;
      locked = false;
      tiltTarget = 0;
      cab.setHint('Set the exponents so the scale levels.');
      render();
    }

    function finish() {
      const best = Math.max(ctx.best ?? 0, score);
      cab.setBest(best);
      ctx.report(score, { best, rounds: roundsDone });
      cab.overlay(cleared(score, best, start));
    }

    function start() {
      cab.clearOverlay();
      queue = shuffle(TARGETS);
      score = 0; roundsDone = 0;
      cab.setScore(0);
      next();
    }

    start();

    return { destroy() { view.stop(); } };
  }
};
