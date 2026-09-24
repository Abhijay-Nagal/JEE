/**
 * The Mole Machine - route a sample through the conversion network.
 *
 * The network diagram (mass <-> moles <-> particles, moles -> volume) is drawn
 * live with the learner's current position highlighted. You cannot jump from
 * mass to particles directly, which is exactly the habit this builds.
 *
 * Teaches: n = m/M, N = n x N_A, V = 22.4n, and the per-formula atom count.
 */

import { h, clear } from '../../core/dom.js';
import { renderInline, renderMath } from '../../core/mathlite.js';
import { sfx } from '../../core/audio.js';
import { arcade, canvasLayer, cssVar, c2d, btn, cleared, shuffle, sci } from '../kit.js';

const NA = 6.022e23;

const PUZZLES = [
  {
    formula: '\\text{CO}_2', name: 'carbon dioxide', M: 44,
    start: { v: 22, u: 'g' },
    target: { u: 'molecules', v: 0.5 * NA },
    atoms: { O: 2, C: 1 },
    ask: 'How many **molecules** are in 22 g of CO₂?'
  },
  {
    formula: '\\text{H}_2\\text{O}', name: 'water', M: 18,
    start: { v: 1.8, u: 'g' },
    target: { u: 'molecules', v: 0.1 * NA },
    atoms: { H: 2, O: 1 },
    ask: 'How many **molecules** are in 1.8 g of water?'
  },
  {
    formula: '\\text{O}_2', name: 'oxygen gas', M: 32,
    start: { v: 5.6, u: 'L' },
    target: { u: 'g', v: 8 },
    atoms: { O: 2 },
    ask: 'What is the **mass** of 5.6 L of O₂ at STP?'
  },
  {
    formula: '\\text{H}_2\\text{SO}_4', name: 'sulphuric acid', M: 98,
    start: { v: 9.8, u: 'g' },
    target: { u: 'atoms:O', v: 0.4 * NA },
    atoms: { H: 2, S: 1, O: 4 },
    ask: 'How many **oxygen atoms** are in 9.8 g of H₂SO₄?'
  },
  {
    formula: '\\text{CH}_4', name: 'methane', M: 16,
    start: { v: 3.011e23, u: 'molecules' },
    target: { u: 'L', v: 11.2 },
    atoms: { C: 1, H: 4 },
    ask: 'What **volume at STP** is occupied by 3.011×10²³ molecules of CH₄?'
  },
  {
    formula: '\\text{NaCl}', name: 'sodium chloride', M: 58.5,
    start: { v: 0.25, u: 'mol' },
    target: { u: 'g', v: 14.625 },
    atoms: { Na: 1, Cl: 1 },
    ask: 'What is the **mass** of 0.25 mol of NaCl?'
  }
];

export default {
  id: 'moleMachine',

  mount(root, ctx) {
    const cab = arcade(root, {
      title: 'The Mole Machine',
      badge: 'Conversion network',
      hint: 'Pick an operation. You can never jump straight from grams to particles.',
      best: ctx.best ?? null,
      onRestart: start
    });

    let queue = [], p = null, cur = null, path = [], score = 0, solved = 0, wrongs = 0;

    /* ---------------- network diagram ---------------- */
    const diagBox = h('div', { style: { padding: '10px 10px 0' } });
    cab.stage.appendChild(diagBox);

    const NODES = {
      g:          { x: 0.14, y: 0.30, label: 'mass (g)' },
      mol:        { x: 0.46, y: 0.30, label: 'moles' },
      molecules:  { x: 0.80, y: 0.30, label: 'particles' },
      L:          { x: 0.46, y: 0.78, label: 'volume (L, STP)' },
      'atoms:O':  { x: 0.80, y: 0.78, label: 'atoms of one element' }
    };
    const EDGES = [['g', 'mol'], ['mol', 'molecules'], ['mol', 'L'], ['molecules', 'atoms:O']];

    const view = canvasLayer(diagBox, {
      height: 180,
      draw(g, w, hgt) {
        const hue = cssVar('--hue') || cssVar('--chemistry');
        const line = cssVar('--line');
        const at = cur?.u;
        const visited = new Set(path.map((s) => s.u));

        for (const [a, b] of EDGES) {
          const A = NODES[a], B = NODES[b];
          const hot = visited.has(a) && visited.has(b);
          c2d.line(g, A.x * w, A.y * hgt, B.x * w, B.y * hgt, {
            color: hot ? hue : line, width: hot ? 2.5 : 1.5
          });
        }

        for (const [key, n] of Object.entries(NODES)) {
          const x = n.x * w, y = n.y * hgt;
          const active = key === at;
          const done = visited.has(key);
          g.beginPath();
          g.arc(x, y, active ? 17 : 12, 0, Math.PI * 2);
          g.fillStyle = active ? hue : done ? cssVar('--bg-4') : cssVar('--bg-2');
          g.fill();
          g.strokeStyle = active ? hue : line;
          g.lineWidth = active ? 3 : 1.5;
          g.stroke();
          c2d.text(g, n.label, x, y + (n.y > 0.5 ? 30 : -26), {
            size: 10, weight: active ? 800 : 600,
            color: active ? hue : cssVar('--ink-3')
          });
        }

      }
    });

    /* ---------------- panel ---------------- */

    const panel = cab.panel;

    const unitWord = (u) => ({
      g: 'g', mol: 'mol', molecules: 'molecules', L: 'L', 'atoms:O': 'O atoms'
    }[u] || u);

    const fmt = (v) => (Math.abs(v) >= 1e4 || (v !== 0 && Math.abs(v) < 1e-3) ? sci(v, 4) : Number(v.toPrecision(5)).toString());

    function ops() {
      const list = [];
      const M = p.M;
      if (cur.u === 'g') list.push({ label: `÷ M (${M})`, to: 'mol', f: (v) => v / M, tex: 'n = \\dfrac{m}{M}' });
      if (cur.u === 'mol') {
        list.push({ label: `× M (${M})`, to: 'g', f: (v) => v * M, tex: 'm = nM' });
        list.push({ label: '× Nₐ', to: 'molecules', f: (v) => v * NA, tex: 'N = nN_A' });
        list.push({ label: '× 22.4', to: 'L', f: (v) => v * 22.4, tex: 'V = 22.4n' });
      }
      if (cur.u === 'molecules') {
        list.push({ label: '÷ Nₐ', to: 'mol', f: (v) => v / NA, tex: 'n = \\dfrac{N}{N_A}' });
        const nO = p.atoms.O;
        if (nO) list.push({ label: `× ${nO} (O per formula)`, to: 'atoms:O', f: (v) => v * nO, tex: `N_{\\text{O}} = ${nO}N` });
      }
      if (cur.u === 'L') list.push({ label: '÷ 22.4', to: 'mol', f: (v) => v / 22.4, tex: 'n = \\dfrac{V}{22.4}' });
      if (cur.u === 'atoms:O') list.push({ label: `÷ ${p.atoms.O}`, to: 'molecules', f: (v) => v / p.atoms.O, tex: 'back to molecules' });

      // Distractors: the shortcuts that do not exist.
      if (cur.u === 'g') list.push({ label: '× Nₐ', to: null, f: null, why: 'Grams are not moles. You must divide by the molar mass **first** — $N_A$ only ever multiplies a number of moles.' });
      if (cur.u === 'g') list.push({ label: '× 22.4', to: null, f: null, why: '22.4 L mol⁻¹ is a *molar* volume. It converts moles to litres, never grams to litres.' });
      if (cur.u === 'molecules') list.push({ label: `× M (${M})`, to: null, f: null, why: 'Multiplying a particle count by molar mass is dimensionally meaningless. Go back to moles first.' });

      return shuffle(list);
    }

    function render() {
      clear(panel);

      panel.appendChild(h('div', { style: { marginBottom: '12px' } },
        h('div.tiny.dim', null, `SAMPLE · ${p.name}`),
        h('div.row', { style: { gap: '10px', alignItems: 'baseline' } },
          renderMath(p.formula),
          h('span.small.muted', null, `M = ${p.M} g mol⁻¹`)),
        h('div', { style: { marginTop: '6px' } }, renderInline(p.ask))
      ));

      panel.appendChild(h('div.readouts', { style: { marginBottom: '14px' } },
        h('div.readout', null,
          h('div.readout__v.mono', null, fmt(cur.v)),
          h('div.readout__k', null, unitWord(cur.u))),
        h('div.readout', null,
          h('div.readout__v', null, `${path.length}`),
          h('div.readout__k', null, 'steps taken')),
        h('div.readout', null,
          h('div.readout__v', null, unitWord(p.target.u)),
          h('div.readout__k', null, 'target unit'))
      ));

      const row = h('div.tiles');
      for (const op of ops()) {
        row.appendChild(h('button.tile.mono', {
          style: { fontSize: '.84rem' },
          onClick: () => apply(op)
        }, op.label));
      }
      panel.appendChild(h('div.divider-label', null, 'available operations'));
      panel.appendChild(row);

      if (path.length) {
        panel.appendChild(h('div.divider-label', null, 'your route'));
        panel.appendChild(h('div.small.mono.muted', null,
          path.map((s) => `${fmt(s.v)} ${unitWord(s.u)}`).join('  →  ') + `  →  ${fmt(cur.v)} ${unitWord(cur.u)}`));
      }

      view.redraw();
    }

    function apply(op) {
      if (!op.to) {
        wrongs++;
        score = Math.max(0, score - 6);
        cab.setScore(score);
        sfx.wrong();
        cab.setHint(op.why);
        return;
      }
      path.push({ ...cur });
      cur = { v: op.f(cur.v), u: op.to };
      sfx.drop();
      cab.setHint('');

      if (cur.u === p.target.u) return settle();
      render();
    }

    function settle() {
      const ok = Math.abs(cur.v - p.target.v) / Math.abs(p.target.v) < 0.02;
      if (ok) {
        solved++;
        const pts = Math.max(15, 45 - wrongs * 8 - Math.max(0, path.length - shortest()) * 5);
        score += pts;
        cab.setScore(score);
        sfx.levelUp();
        ctx.fx?.burstAt(panel, { count: 24 });
      } else {
        sfx.wrong();
      }

      render();
      panel.appendChild(h('div', { style: { marginTop: '14px' } },
        h('div.verdict' + (ok ? '.verdict--ok' : '.verdict--bad'), null,
          h('div.verdict__head', null, ok ? '✓ Correct route' : '✗ Wrong value'),
          h('div.verdict__body', null,
            h('p', null, renderInline(`Answer: **${fmt(p.target.v)} ${unitWord(p.target.u)}**`)),
            h('p.small', null, renderInline(
              path.length === shortest()
                ? 'And by the shortest route — no wasted conversions.'
                : `The shortest route is ${shortest()} step${shortest() > 1 ? 's' : ''}; you took ${path.length}.`))
          )),
        h('div.btnbar', { style: { marginTop: '12px' } },
          btn(queue.length ? 'Next sample' : 'Finish', next, { kind: 'primary', size: 'md' }))
      ));
    }

    /** Breadth-first shortest path through the network, for scoring. */
    function shortest() {
      const adj = { g: ['mol'], mol: ['g', 'molecules', 'L'], molecules: ['mol', 'atoms:O'], L: ['mol'], 'atoms:O': ['molecules'] };
      const q = [[p.start.u, 0]];
      const seen = new Set([p.start.u]);
      while (q.length) {
        const [u, d] = q.shift();
        if (u === p.target.u) return d;
        for (const nx of adj[u] || []) if (!seen.has(nx)) { seen.add(nx); q.push([nx, d + 1]); }
      }
      return 3;
    }

    function next() {
      if (!queue.length) return finish();
      p = queue.shift();
      cur = { ...p.start };
      path = []; wrongs = 0;
      cab.setHint('Pick an operation. You can never jump straight from grams to particles.');
      render();
    }

    function finish() {
      const best = Math.max(ctx.best ?? 0, score);
      cab.setBest(best);
      ctx.report(score, { best, solved });
      cab.overlay(cleared(score, best, start, h('p.small.muted', null, `${solved} samples routed.`)));
    }

    function start() {
      cab.clearOverlay();
      queue = shuffle(PUZZLES).slice(0, 4);
      score = 0; solved = 0;
      cab.setScore(0);
      next();
    }

    start();
    return { destroy() { view.stop(); } };
  }
};
