/**
 * Pipeline Lab - wire two function machines in series and watch a value flow.
 *
 * The animation makes the order of composition physical: in f(g(x)) the value
 * visibly enters g first. Reversing the pipes gives a different answer, which
 * is the point students most often get wrong.
 *
 * Teaches: composition, non-commutativity, and building an inverse by undoing
 * operations in reverse order.
 */

import { h, clear } from '../../core/dom.js';
import { renderInline, renderMath } from '../../core/mathlite.js';
import { sfx } from '../../core/audio.js';
import { arcade, canvasLayer, cssVar, c2d, btn, seg, cleared, shuffle, round } from '../kit.js';

const FNS = [
  { id: 'double', tex: '2x',      f: (x) => 2 * x,       inv: (y) => y / 2,       invTex: '\\dfrac{x}{2}', label: '×2' },
  { id: 'plus3',  tex: 'x + 3',   f: (x) => x + 3,       inv: (y) => y - 3,       invTex: 'x - 3',        label: '+3' },
  { id: 'square', tex: 'x^2',     f: (x) => x * x,       inv: null,               invTex: null,           label: 'x²' },
  { id: 'lin',    tex: '2x + 1',  f: (x) => 2 * x + 1,   inv: (y) => (y - 1) / 2, invTex: '\\dfrac{x-1}{2}', label: '2x+1' },
  { id: 'cube',   tex: 'x^3',     f: (x) => x ** 3,      inv: (y) => Math.cbrt(y), invTex: '\\sqrt[3]{x}',  label: 'x³' },
  { id: 'recip',  tex: '\\dfrac{1}{x}', f: (x) => (x === 0 ? NaN : 1 / x), inv: (y) => (y === 0 ? NaN : 1 / y), invTex: '\\dfrac{1}{x}', label: '1/x' }
];

const QUIZZES = [
  { f: 'lin', g: 'square', x: 2, which: 'fg', ask: '(f \\circ g)(2)' },
  { f: 'square', g: 'lin', x: 2, which: 'fg', ask: '(f \\circ g)(2)' },
  { f: 'double', g: 'plus3', x: 5, which: 'gf', ask: '(g \\circ f)(5)' },
  { f: 'plus3', g: 'double', x: 4, which: 'fg', ask: '(f \\circ g)(4)' },
  { f: 'cube', g: 'plus3', x: 1, which: 'fg', ask: '(f \\circ g)(1)' }
];

export default {
  id: 'pipelineLab',

  mount(root, ctx) {
    const cab = arcade(root, {
      title: 'Pipeline Lab',
      badge: 'Composition',
      hint: 'In $f(g(x))$ the value meets $g$ first. Watch the packet.',
      best: ctx.best ?? null,
      onRestart: start
    });

    let mode = 'explore';
    let fSel = FNS[3], gSel = FNS[2];
    let order = 'fg';                 // fg = f(g(x))
    let xVal = 2;
    let packet = null;                // {t, path}
    let score = 0, quizQueue = [], quiz = null, solved = 0;

    /* ---------------- pipeline canvas ---------------- */
    const stageBox = h('div', { style: { padding: '14px 14px 0' } });
    cab.stage.appendChild(stageBox);

    const view = canvasLayer(stageBox, {
      height: 170,
      animate: true,
      draw(g, w, hgt, t) {
        const hue = cssVar('--hue') || cssVar('--maths');
        const first = order === 'fg' ? gSel : fSel;
        const second = order === 'fg' ? fSel : gSel;
        const firstName = order === 'fg' ? 'g' : 'f';
        const secondName = order === 'fg' ? 'f' : 'g';

        const y = hgt / 2;
        const boxW = 92, boxH = 56;
        const x1 = w * 0.30, x2 = w * 0.66;

        // pipes
        c2d.line(g, 24, y, x1 - boxW / 2, y, { color: cssVar('--line'), width: 4 });
        c2d.line(g, x1 + boxW / 2, y, x2 - boxW / 2, y, { color: cssVar('--line'), width: 4 });
        c2d.line(g, x2 + boxW / 2, y, w - 24, y, { color: cssVar('--line'), width: 4 });

        machine(g, x1, y, boxW, boxH, firstName, first, hue);
        machine(g, x2, y, boxW, boxH, secondName, second, hue);

        c2d.text(g, 'in', 24, y - 24, { size: 10, weight: 800, color: cssVar('--ink-4') });
        c2d.text(g, 'out', w - 24, y - 24, { size: 10, weight: 800, color: cssVar('--ink-4') });

        // packet animation
        if (packet) {
          packet.t += 0.012;
          if (packet.t > 1) { packet = null; }
          else {
            const p = packet.t;
            const stops = [24, x1 - boxW / 2, x1 + boxW / 2, x2 - boxW / 2, x2 + boxW / 2, w - 24];
            const seg = Math.min(4, Math.floor(p * 5));
            const local = p * 5 - seg;
            const px = stops[seg] + (stops[seg + 1] - stops[seg]) * local;

            const v = p < 0.4 ? packet.v0 : p < 0.8 ? packet.v1 : packet.v2;
            g.fillStyle = cssVar('--accent');
            g.beginPath(); g.arc(px, y, 12, 0, Math.PI * 2); g.fill();
            c2d.text(g, fmt(v), px, y, { size: 11, weight: 800, color: '#2b1c00' });
          }
        }
      }
    });

    function machine(g, cx, cy, w, hgt, name, fn, hue) {
      g.fillStyle = cssVar('--bg-2');
      g.strokeStyle = hue; g.lineWidth = 2;
      c2d.roundRect(g, cx - w / 2, cy - hgt / 2, w, hgt, 10);
      g.fill(); g.stroke();
      c2d.text(g, name, cx, cy - hgt / 2 - 10, { size: 12, weight: 800, color: hue });
      c2d.text(g, fn.label, cx, cy, { size: 16, weight: 800, color: cssVar('--ink-1'), font: 'mono' });
    }

    const fmt = (v) => (Number.isFinite(v) ? String(round(v, 3)) : '—');

    /* ---------------- panel ---------------- */

    const panel = cab.panel;
    const controls = h('div');
    const resultBox = h('div', { style: { marginTop: '14px' } });
    const quizBox = h('div');

    panel.appendChild(h('div.row', { style: { justifyContent: 'center', marginBottom: '12px' } },
      seg([
        { value: 'explore', label: 'Compose' },
        { value: 'inverse', label: 'Invert' },
        { value: 'quiz', label: 'Quiz' }
      ], mode, (v) => { mode = v; render(); })
    ));
    panel.appendChild(controls);
    panel.appendChild(resultBox);
    panel.appendChild(quizBox);

    function picker(label, current, onPick) {
      const row = h('div.tiles');
      for (const fn of FNS) {
        row.appendChild(h('button.tile', {
          style: fn.id === current.id ? { background: 'var(--hue, var(--primary))', color: 'var(--primary-ink)', borderColor: 'transparent' } : {},
          onClick: () => { onPick(fn); sfx.click(); render(); }
        }, renderMath(fn.tex)));
      }
      return h('div', { style: { marginBottom: '10px' } },
        h('div.tiny.dim', { style: { marginBottom: '4px' } }, label), row);
    }

    function render() {
      clear(controls); clear(resultBox); clear(quizBox);

      if (mode === 'quiz') return renderQuiz();

      controls.appendChild(picker('CHOOSE f(x)', fSel, (fn) => { fSel = fn; }));
      if (mode === 'explore') controls.appendChild(picker('CHOOSE g(x)', gSel, (fn) => { gSel = fn; }));

      const xInput = h('input.input.mono', {
        type: 'text', inputmode: 'decimal', value: String(xVal), style: { maxWidth: '110px' },
        onInput: (e) => { xVal = Number(e.target.value) || 0; renderResult(); }
      });

      controls.appendChild(h('div.row', { style: { gap: '10px', flexWrap: 'wrap' } },
        h('span.small.muted', null, 'input x ='), xInput,
        mode === 'explore'
          ? seg([{ value: 'fg', label: 'f ∘ g' }, { value: 'gf', label: 'g ∘ f' }], order, (v) => { order = v; render(); })
          : null,
        btn('Send it through', sendPacket, { kind: 'primary' })
      ));

      renderResult();
    }

    function renderResult() {
      clear(resultBox);
      if (mode === 'inverse') return renderInverse();

      const inner = order === 'fg' ? gSel : fSel;
      const outer = order === 'fg' ? fSel : gSel;
      const v1 = inner.f(xVal);
      const v2 = outer.f(v1);
      const other = order === 'fg' ? fSel.f(gSel.f(xVal)) : gSel.f(fSel.f(xVal));
      const flipped = order === 'fg' ? gSel.f(fSel.f(xVal)) : fSel.f(gSel.f(xVal));

      resultBox.appendChild(h('div.readouts', null,
        h('div.readout', null, h('div.readout__v.mono', null, fmt(xVal)), h('div.readout__k', null, 'x')),
        h('div.readout', null, h('div.readout__v.mono', null, fmt(v1)), h('div.readout__k', null, `after ${order === 'fg' ? 'g' : 'f'}`)),
        h('div.readout.readout--ok', null, h('div.readout__v.mono', null, fmt(v2)), h('div.readout__k', null, 'result')),
        h('div.readout', null, h('div.readout__v.mono', null, fmt(flipped)), h('div.readout__k', null, 'other order'))
      ));

      resultBox.appendChild(h('div', { style: { textAlign: 'center', marginTop: '12px' } },
        renderMath(order === 'fg'
          ? `(f \\circ g)(${xVal}) = f(g(${xVal})) = f(${fmt(v1)}) = ${fmt(v2)}`
          : `(g \\circ f)(${xVal}) = g(f(${xVal})) = g(${fmt(v1)}) = ${fmt(v2)}`, { display: true })));

      if (Number.isFinite(v2) && Number.isFinite(flipped) && Math.abs(v2 - flipped) > 1e-9) {
        resultBox.appendChild(h('div.callout.callout--trap', null,
          h('div.callout__label', null, 'Order matters'),
          h('div.small', null, renderInline(
            `$(f\\circ g)(${xVal}) = ${fmt(order === 'fg' ? v2 : flipped)}$ but $(g\\circ f)(${xVal}) = ${fmt(order === 'fg' ? flipped : v2)}$. Composition is **not** commutative — socks then shoes is not shoes then socks.`))));
      } else if (Number.isFinite(v2)) {
        resultBox.appendChild(h('div.callout.callout--tip', null,
          h('div.callout__label', null, 'They agree here'),
          h('div.small', null, renderInline('Both orders give the same value **for this input** — which does not make them the same function. Try another $x$.'))));
      }
    }

    function renderInverse() {
      const y = fSel.f(xVal);
      const back = fSel.inv ? fSel.inv(y) : NaN;

      resultBox.appendChild(h('div.readouts', null,
        h('div.readout', null, h('div.readout__v.mono', null, fmt(xVal)), h('div.readout__k', null, 'x')),
        h('div.readout', null, h('div.readout__v.mono', null, fmt(y)), h('div.readout__k', null, 'f(x)')),
        h('div.readout' + (Math.abs(back - xVal) < 1e-9 ? '.readout--ok' : '.readout--bad'), null,
          h('div.readout__v.mono', null, fmt(back)), h('div.readout__k', null, 'f⁻¹(f(x))'))
      ));

      if (fSel.inv) {
        resultBox.appendChild(h('div', { style: { textAlign: 'center', marginTop: '12px' } },
          renderMath(`f(x) = ${fSel.tex} \\quad\\Rightarrow\\quad f^{-1}(x) = ${fSel.invTex}`, { display: true })));
        resultBox.appendChild(h('div.callout.callout--tip', null,
          h('div.callout__label', null, 'Undo in reverse order'),
          h('div.small', null, renderInline(
            fSel.id === 'lin'
              ? 'To build $f^{-1}$: $f$ multiplies by 2 **then** adds 1, so the inverse subtracts 1 **then** divides by 2. Last operation undone first.'
              : 'Set $y = f(x)$, solve for $x$, then swap the letters. Check with $f^{-1}(f(x)) = x$.'))));
      } else {
        resultBox.appendChild(h('div.callout.callout--trap', { style: { marginTop: '12px' } },
          h('div.callout__label', null, 'No inverse exists'),
          h('div.small', null, renderInline(
            `$f(x) = x^2$ on $\\mathbb{R}$ is not one-one: $f(2) = f(-2) = 4$, so $f^{-1}(4)$ has no single answer. Restrict the domain to $[0,\\infty)$ and the inverse $\\sqrt{x}$ appears.`))));
      }
    }

    /* ---------------- quiz ---------------- */

    function renderQuiz() {
      if (!quiz) { quiz = quizQueue.shift(); }
      if (!quiz) return finish();

      fSel = FNS.find((f) => f.id === quiz.f);
      gSel = FNS.find((f) => f.id === quiz.g);
      order = quiz.which;
      xVal = quiz.x;
      view.redraw();

      const want = quiz.which === 'fg' ? fSel.f(gSel.f(quiz.x)) : gSel.f(fSel.f(quiz.x));

      clear(quizBox);
      quizBox.appendChild(h('div.callout.callout--jee', null,
        h('div.callout__label', null, `Question ${solved + 1} / 4`),
        h('div', { style: { margin: '6px 0' } },
          renderInline(`Given $f(x) = ${fSel.tex}$ and $g(x) = ${gSel.tex}$, evaluate `),
          renderMath(quiz.ask), renderInline('.')),
        (() => {
          const input = h('input.input.mono', {
            type: 'text', inputmode: 'decimal', placeholder: 'value', style: { maxWidth: '150px' },
            onKeyDown: (e) => { if (e.key === 'Enter') gradeQuiz(input.value, want); }
          });
          return h('div.row', { style: { gap: '10px', flexWrap: 'wrap', marginTop: '8px' } },
            input,
            btn('Check', () => gradeQuiz(input.value, want), { kind: 'primary' }),
            btn('Run the pipeline', sendPacket, { kind: 'ghost' }));
        })()
      ));
    }

    function gradeQuiz(raw, want) {
      const v = Number(String(raw).trim());
      const ok = Number.isFinite(v) && Math.abs(v - want) < 1e-6;
      if (ok) {
        solved++;
        score += 25;
        cab.setScore(score);
        sfx.correct();
        ctx.fx?.burstAt(quizBox, { count: 18 });
      } else {
        score = Math.max(0, score - 6);
        cab.setScore(score);
        sfx.wrong();
      }

      const inner = order === 'fg' ? gSel : fSel;
      const outer = order === 'fg' ? fSel : gSel;
      quizBox.appendChild(h('div', { style: { marginTop: '10px' } },
        h('div.verdict' + (ok ? '.verdict--ok' : '.verdict--bad'), null,
          h('div.verdict__head', null, ok ? '✓ Correct' : `✗ The answer is ${fmt(want)}`),
          h('div.verdict__body.small', null,
            renderMath(`${order === 'fg' ? '(f\\circ g)' : '(g\\circ f)'}(${xVal}) = ${order === 'fg' ? 'f' : 'g'}(${fmt(inner.f(xVal))}) = ${fmt(want)}`, { display: true }),
            h('p', { style: { marginBottom: 0 } }, renderInline('The function **nearest the $x$** always acts first.')))),
        h('div.btnbar', { style: { marginTop: '10px' } },
          btn(solved >= 4 ? 'Finish' : 'Next question', () => {
            quiz = null;
            if (solved >= 4) finish(); else renderQuiz();
          }, { kind: 'primary' }))
      ));
    }

    /* ---------------- packet ---------------- */

    function sendPacket() {
      const inner = order === 'fg' ? gSel : fSel;
      const outer = order === 'fg' ? fSel : gSel;
      packet = { t: 0, v0: xVal, v1: inner.f(xVal), v2: outer.f(inner.f(xVal)) };
      sfx.whoosh();
    }

    function finish() {
      const best = Math.max(ctx.best ?? 0, score);
      cab.setBest(best);
      ctx.report(score, { best, solved });
      cab.overlay(cleared(score, best, start));
    }

    function start() {
      cab.clearOverlay();
      score = 0; solved = 0; quiz = null;
      quizQueue = shuffle(QUIZZES).slice(0, 4);
      mode = 'explore';
      fSel = FNS[3]; gSel = FNS[2]; order = 'fg'; xVal = 2;
      cab.setScore(0);
      render();
    }

    start();
    return { destroy() { view.stop(); } };
  }
};
