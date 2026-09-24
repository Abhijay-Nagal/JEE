/**
 * Graph Studio - plot a standard function and transform it live.
 *
 * The four transformation sliders map onto y = a f(b(x - c)) + d. The learner
 * can see directly that changes inside the bracket act backwards, which is the
 * single most confusing thing about transformations.
 *
 * Challenge mode hides a target curve and asks the learner to reproduce it,
 * which forces them to reason about direction rather than guess.
 *
 * Teaches: standard graph shapes, domain and range read off the axes, and the
 * transformation rules.
 */

import { h, clear } from '../../core/dom.js';
import { renderInline, renderMath } from '../../core/mathlite.js';
import { sfx } from '../../core/audio.js';
import { arcade, canvasLayer, cssVar, c2d, slider, btn, seg, cleared, shuffle, round, clamp } from '../kit.js';

const BASES = [
  { id: 'lin',  tex: 'x',        f: (x) => x,            dom: 'R', ran: 'R' },
  { id: 'sq',   tex: 'x^2',      f: (x) => x * x,        dom: 'R', ran: '[0,\\infty)' },
  { id: 'cube', tex: 'x^3',      f: (x) => x ** 3,       dom: 'R', ran: 'R' },
  { id: 'abs',  tex: '|x|',      f: (x) => Math.abs(x),  dom: 'R', ran: '[0,\\infty)' },
  { id: 'sqrt', tex: '\\sqrt{x}', f: (x) => (x < 0 ? NaN : Math.sqrt(x)), dom: '[0,\\infty)', ran: '[0,\\infty)' },
  { id: 'recip', tex: '\\dfrac{1}{x}', f: (x) => (Math.abs(x) < 1e-9 ? NaN : 1 / x), dom: 'R-\\{0\\}', ran: 'R-\\{0\\}' },
  { id: 'exp',  tex: 'e^{x}',    f: (x) => Math.exp(x),  dom: 'R', ran: '(0,\\infty)' },
  { id: 'ln',   tex: '\\ln x',   f: (x) => (x <= 0 ? NaN : Math.log(x)), dom: '(0,\\infty)', ran: 'R' },
  { id: 'floor', tex: '[x]',     f: (x) => Math.floor(x), dom: 'R', ran: '\\mathbb{Z}' },
  { id: 'frac', tex: '\\{x\\}',  f: (x) => x - Math.floor(x), dom: 'R', ran: '[0,1)' },
  { id: 'sgn',  tex: '\\text{sgn}(x)', f: (x) => Math.sign(x), dom: 'R', ran: '\\{-1,0,1\\}' },
  { id: 'sin',  tex: '\\sin x',  f: (x) => Math.sin(x),  dom: 'R', ran: '[-1,1]' }
];

const CHALLENGES = [
  { base: 'abs', a: 1, b: 1, c: 2, d: 1, tex: '|x - 2| + 1', why: 'Inside the bracket, $-2$ moves the graph **right**; the $+1$ outside moves it **up**. Vertex $(2,1)$.' },
  { base: 'sq',  a: -1, b: 1, c: 0, d: 4, tex: '-x^2 + 4',   why: 'The minus sign outside flips the parabola in the $x$-axis; $+4$ lifts it. Maximum value 4.' },
  { base: 'sq',  a: 1, b: 1, c: -3, d: 0, tex: '(x + 3)^2',  why: '$+3$ inside the bracket moves the graph **left**, not right. Inside changes always act backwards.' },
  { base: 'abs', a: 2, b: 1, c: 0, d: -1, tex: '2|x| - 1',   why: 'The $2$ outside stretches vertically (steeper arms); $-1$ drops it below the axis.' },
  { base: 'sqrt', a: 1, b: 1, c: 4, d: 0, tex: '\\sqrt{x - 4}', why: 'Shifting right by 4 also shifts the **domain**: now $x \\geq 4$.' }
];

export default {
  id: 'grapher',

  mount(root, ctx) {
    const cab = arcade(root, {
      title: 'Graph Studio',
      badge: 'Transformations',
      hint: 'Changes outside the function behave as expected. Changes inside act backwards.',
      best: ctx.best ?? null,
      onRestart: start
    });

    let base = BASES[1];
    let a = 1, b = 1, c = 0, d = 0;
    let mode = 'explore';
    let queue = [], target = null, score = 0, solved = 0, settled = false;

    const stageBox = h('div', { style: { padding: '10px 10px 0' } });
    cab.stage.appendChild(stageBox);

    const VIEW = { xmin: -6, xmax: 6, ymin: -5, ymax: 5 };

    const view = canvasLayer(stageBox, {
      height: 300,
      draw(g, w, hgt) {
        const X = (x) => ((x - VIEW.xmin) / (VIEW.xmax - VIEW.xmin)) * w;
        const Y = (y) => hgt - ((y - VIEW.ymin) / (VIEW.ymax - VIEW.ymin)) * hgt;

        // grid
        g.strokeStyle = cssVar('--line-soft'); g.lineWidth = 1;
        for (let x = Math.ceil(VIEW.xmin); x <= VIEW.xmax; x++) {
          g.beginPath(); g.moveTo(X(x), 0); g.lineTo(X(x), hgt); g.stroke();
        }
        for (let y = Math.ceil(VIEW.ymin); y <= VIEW.ymax; y++) {
          g.beginPath(); g.moveTo(0, Y(y)); g.lineTo(w, Y(y)); g.stroke();
        }

        // axes
        c2d.line(g, 0, Y(0), w, Y(0), { color: cssVar('--ink-4'), width: 1.6 });
        c2d.line(g, X(0), 0, X(0), hgt, { color: cssVar('--ink-4'), width: 1.6 });
        for (let x = Math.ceil(VIEW.xmin); x <= VIEW.xmax; x++) {
          if (x === 0) continue;
          c2d.text(g, String(x), X(x), Y(0) + 11, { size: 9, color: cssVar('--ink-4') });
        }
        for (let y = Math.ceil(VIEW.ymin); y <= VIEW.ymax; y++) {
          if (y === 0) continue;
          c2d.text(g, String(y), X(0) - 11, Y(y), { size: 9, color: cssVar('--ink-4') });
        }

        // the base curve, faint, for comparison
        if (mode === 'explore' && (a !== 1 || b !== 1 || c !== 0 || d !== 0)) {
          plot(g, X, Y, w, (x) => base.f(x), cssVar('--ink-4'), 1.2, [4, 4]);
        }
        // target curve in challenge mode
        if (mode === 'challenge' && target) {
          const T = BASES.find((t) => t.id === target.base);
          plot(g, X, Y, w, (x) => target.a * T.f(target.b * (x - target.c)) + target.d,
            cssVar('--accent'), 3, [6, 4]);
        }
        // the learner's curve
        plot(g, X, Y, w, (x) => a * base.f(b * (x - c)) + d, cssVar('--hue') || cssVar('--maths'), 2.6, null);
      }
    });

    /** Plot with a break wherever the value is undefined or jumps wildly. */
    function plot(g, X, Y, w, fn, colour, width, dash) {
      g.save();
      g.strokeStyle = colour;
      g.lineWidth = width;
      if (dash) g.setLineDash(dash);
      g.beginPath();
      let pen = false, prevY = null;
      const steps = Math.max(400, w * 2);
      for (let i = 0; i <= steps; i++) {
        const x = VIEW.xmin + ((VIEW.xmax - VIEW.xmin) * i) / steps;
        const y = fn(x);
        if (!Number.isFinite(y) || y < VIEW.ymin - 40 || y > VIEW.ymax + 40) { pen = false; prevY = null; continue; }
        // a big jump means a discontinuity (floor, 1/x, sgn) - lift the pen
        if (prevY !== null && Math.abs(y - prevY) > (VIEW.ymax - VIEW.ymin) * 0.35) pen = false;
        if (!pen) { g.moveTo(X(x), Y(y)); pen = true; } else g.lineTo(X(x), Y(y));
        prevY = y;
      }
      g.stroke();
      g.restore();
    }

    /* ---------------- panel ---------------- */

    const panel = cab.panel;
    const pickBox = h('div');
    const sliderBox = h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: '14px', marginTop: '12px' } });
    const infoBox = h('div', { style: { marginTop: '12px' } });
    const taskBox = h('div');

    panel.appendChild(h('div.row', { style: { justifyContent: 'center', marginBottom: '10px' } },
      seg([{ value: 'explore', label: 'Explore' }, { value: 'challenge', label: 'Match the curve' }], mode, (v) => {
        mode = v;
        if (v === 'challenge') { queue = shuffle(CHALLENGES); solved = 0; nextChallenge(); }
        else { target = null; settled = false; clear(taskBox); render(); }
      })
    ));
    panel.appendChild(taskBox);
    panel.appendChild(pickBox);
    panel.appendChild(sliderBox);
    panel.appendChild(infoBox);

    const sa = slider({ label: 'a — vertical stretch', min: -3, max: 3, step: 0.5, value: 1, fmt: (v) => v.toFixed(1), onInput: (v) => { a = v; upd(); } });
    const sb = slider({ label: 'b — horizontal squeeze', min: -3, max: 3, step: 0.5, value: 1, fmt: (v) => v.toFixed(1), onInput: (v) => { b = v; upd(); } });
    const sc = slider({ label: 'c — shift right', min: -4, max: 4, step: 0.5, value: 0, fmt: (v) => v.toFixed(1), onInput: (v) => { c = v; upd(); } });
    const sd = slider({ label: 'd — shift up', min: -4, max: 4, step: 0.5, value: 0, fmt: (v) => v.toFixed(1), onInput: (v) => { d = v; upd(); } });
    sliderBox.append(sa.root, sb.root, sc.root, sd.root);

    function render() {
      clear(pickBox);
      pickBox.appendChild(h('div.tiny.dim', { style: { marginBottom: '4px' } }, 'BASE FUNCTION'));
      const row = h('div.tiles');
      for (const bs of BASES) {
        row.appendChild(h('button.tile', {
          style: bs.id === base.id ? { background: 'var(--hue, var(--primary))', color: 'var(--primary-ink)', borderColor: 'transparent' } : {},
          onClick: () => { base = bs; sfx.click(); upd(); render(); }
        }, renderMath(bs.tex)));
      }
      pickBox.appendChild(row);
      upd();
    }

    function upd() {
      view.redraw();
      clear(infoBox);

      infoBox.appendChild(h('div', { style: { textAlign: 'center' } },
        renderMath(`y = ${fmtA()}${wrap()}${fmtD()}`, { display: true })));

      const facts = [];
      if (c !== 0) facts.push(`shifted **${c > 0 ? 'right' : 'left'}** by ${Math.abs(c)} — note the sign inside the bracket is $-${c}$`);
      if (d !== 0) facts.push(`shifted **${d > 0 ? 'up' : 'down'}** by ${Math.abs(d)}`);
      if (a < 0) facts.push('reflected in the **$x$-axis** ($a < 0$)');
      if (b < 0) facts.push('reflected in the **$y$-axis** ($b < 0$)');
      if (Math.abs(a) > 1) facts.push(`stretched vertically by ${Math.abs(a)}`);
      if (Math.abs(b) > 1) facts.push(`**compressed** horizontally by ${Math.abs(b)} — a bigger $b$ makes it narrower`);

      infoBox.appendChild(h('div.row', { style: { gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '8px' } },
        h('span.tag', null, 'domain ', renderMath(domainTex())),
        h('span.tag', null, 'range ', renderMath(rangeTex()))
      ));

      if (facts.length) {
        infoBox.appendChild(h('div.small.muted', { style: { textAlign: 'center' } },
          renderInline(facts.join(' · '))));
      }

      if (mode === 'challenge') checkChallenge();
    }

    const fmtA = () => (a === 1 ? '' : a === -1 ? '-' : `${a}\\,`);
    const fmtD = () => (d === 0 ? '' : d > 0 ? ` + ${d}` : ` - ${Math.abs(d)}`);
    function wrap() {
      const arg = b === 1
        ? (c === 0 ? 'x' : c > 0 ? `(x - ${c})` : `(x + ${Math.abs(c)})`)
        : (c === 0 ? `${b}x` : `${b}(x ${c > 0 ? '-' : '+'} ${Math.abs(c)})`);
      return base.tex.replace(/x/g, arg);
    }

    function domainTex() {
      // Shifting moves the domain; scaling by b rescales it.
      if (base.id === 'sqrt') return c === 0 ? '[0,\\infty)' : `[${c},\\infty)`;
      if (base.id === 'ln') return c === 0 ? '(0,\\infty)' : `(${c},\\infty)`;
      if (base.id === 'recip') return c === 0 ? 'R-\\{0\\}' : `R-\\{${c}\\}`;
      return 'R';
    }

    function rangeTex() {
      if (base.id === 'sq' || base.id === 'abs') {
        return a > 0 ? `[${round(d, 2)},\\infty)` : `(-\\infty,${round(d, 2)}]`;
      }
      if (base.id === 'sqrt') return a > 0 ? `[${round(d, 2)},\\infty)` : `(-\\infty,${round(d, 2)}]`;
      if (base.id === 'exp') return a > 0 ? `(${round(d, 2)},\\infty)` : `(-\\infty,${round(d, 2)})`;
      if (base.id === 'frac') return `[${round(d, 2)},${round(Math.abs(a) + d, 2)})`;
      if (base.id === 'sin') return `[${round(-Math.abs(a) + d, 2)},${round(Math.abs(a) + d, 2)}]`;
      if (base.id === 'sgn') return `\\{${round(-Math.abs(a) + d, 2)},${round(d, 2)},${round(Math.abs(a) + d, 2)}\\}`;
      if (base.id === 'recip') return `R-\\{${round(d, 2)}\\}`;
      return 'R';
    }

    /* ---------------- challenge ---------------- */

    function nextChallenge() {
      if (solved >= 4 || !queue.length) return finish();
      settled = false;
      target = queue.shift();
      base = BASES.find((x) => x.id === target.base);
      a = 1; b = 1; c = 0; d = 0;
      sa.set(1); sb.set(1); sc.set(0); sd.set(0);
      clear(taskBox);
      taskBox.appendChild(h('div.callout.callout--jee', { style: { margin: '0 0 12px' } },
        h('div.callout__label', null, `Match the dashed curve · ${solved + 1} / 4`),
        h('div.small', null, renderInline('Use the four sliders. The base function is already selected for you.'))));
      render();
    }

    function checkChallenge() {
      if (!target || settled) return;
      const near = (x, y) => Math.abs(x - y) < 1e-6;
      if (!(near(a, target.a) && near(b, target.b) && near(c, target.c) && near(d, target.d))) return;

      settled = true;
      solved++;
      score += 30;
      cab.setScore(score);
      sfx.levelUp();
      ctx.fx?.burstAt(view.canvas, { count: 22 });

      clear(taskBox);
      taskBox.appendChild(h('div.verdict.verdict--ok', { style: { marginBottom: '12px' } },
        h('div.verdict__head', null, '✓ Matched'),
        h('div.verdict__body.small', null,
          renderMath(`y = ${target.tex}`, { display: true }),
          h('p', { style: { marginBottom: 0 } }, renderInline(target.why)))));
      taskBox.appendChild(h('div.btnbar', { style: { marginBottom: '12px' } },
        btn(solved >= 4 ? 'Finish' : 'Next curve', nextChallenge, { kind: 'primary' })));
    }

    function finish() {
      const best = Math.max(ctx.best ?? 0, score);
      cab.setBest(best);
      ctx.report(score, { best, solved });
      target = null;
      mode = 'explore';
      cab.setHint('Explore freely — try $\\{x\\}$ and $[x]$ together.');
      clear(taskBox);
      render();
    }

    function start() {
      cab.clearOverlay();
      score = 0; solved = 0; settled = false; target = null; mode = 'explore';
      base = BASES[1]; a = 1; b = 1; c = 0; d = 0;
      sa.set(1); sb.set(1); sc.set(0); sd.set(0);
      cab.setScore(0);
      clear(taskBox);
      render();
    }

    start();
    return { destroy() { view.stop(); } };
  }
};
