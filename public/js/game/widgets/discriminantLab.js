/**
 * Discriminant Lab - three sliders, one parabola, and the roots shown wherever
 * they happen to be.
 *
 * The novelty here is that when D goes negative the roots do not disappear from
 * the display. They move onto a small Argand panel, which is the honest picture
 * and the one that makes "complex conjugate pair" mean something.
 */

import { h, clear } from '../../core/dom.js';
import { renderInline } from '../../core/mathlite.js';
import { sfx } from '../../core/audio.js';
import { arcade, canvasLayer, cssVar, c2d, slider, readouts, btn,
         verdictLine, cleared, clamp, round } from '../kit.js';

const TASKS = [
  { text: 'Make the equation have **two distinct real roots**.',
    ok: (s) => s.a !== 0 && s.D > 0.05,
    note: '$D > 0$ — the parabola cuts the axis twice, and $\\sqrt{D}$ is a real number, so the $\\pm$ produces two different answers.' },
  { text: 'Make the roots **equal** — exactly one repeated root.',
    ok: (s) => s.a !== 0 && Math.abs(s.D) < 0.05,
    note: '$D = 0$: the $\\pm\\sqrt{D}$ term vanishes and both roots collapse to $x = -\\dfrac{b}{2a}$, the vertex. The parabola touches the axis rather than crossing it.' },
  { text: 'Make the roots a **pair of complex conjugates**.',
    ok: (s) => s.a !== 0 && s.D < -0.05,
    note: '$D < 0$ — the parabola clears the axis entirely. The roots are $\\dfrac{-b}{2a} \\pm \\dfrac{\\sqrt{|D|}}{2a}i$: same real part, opposite imaginary parts. Look at the small Argand panel: they are mirror images in the real axis.' },
  { text: 'Make the expression **positive for every real $x$**.',
    ok: (s) => s.a > 0 && s.D < -0.05,
    note: 'Two conditions, both needed: $a > 0$ so the parabola opens upward, and $D < 0$ so it never reaches the axis. With $a > 0$ and $D > 0$ the curve dips below the axis between its roots.' },
  { text: 'Make the roots have **opposite signs** (one positive, one negative).',
    ok: (s) => s.a !== 0 && s.D > 0.05 && s.c / s.a < 0,
    note: 'The product of the roots is $c/a$. Negative product means the two roots straddle zero. Note you never needed $D$: a negative $c/a$ forces $D = b^2 - 4ac > 0$ automatically.' },
  { text: 'Make **both roots negative**.',
    ok: (s) => s.a !== 0 && s.D >= -0.05 && (-s.b / s.a) < 0 && (s.c / s.a) > 0,
    note: 'Three conditions together: $D \\geq 0$ for real roots, $P = c/a > 0$ to put them on the same side of zero, and $S = -b/a < 0$ to make that side the negative one.' }
];

export default {
  id: 'discriminantLab',

  mount(root, ctx) {
    const cab = arcade(root, {
      title: 'Discriminant Lab',
      badge: 'D decides everything',
      hint: 'Drag a, b and c. Watch the parabola, the discriminant and the roots move together.',
      best: ctx.best ?? null,
      onRestart: start
    });

    let score = 0, idx = 0, locked = false;

    const stageBox = h('div');
    cab.stage.appendChild(stageBox);

    const state = () => {
      const a = aS.get() / 2, b = bS.get() / 2, c = cS.get() / 2;
      return { a, b, c, D: b * b - 4 * a * c };
    };

    /* ------------------------------------------------------------ */

    const view = canvasLayer(stageBox, {
      height: 290,
      animate: true,
      draw(g, w, hgt) {
        const { a, b, c, D } = state();
        const hue = cssVar('--maths');
        const ok = cssVar('--ok');
        const bad = cssVar('--bad');
        const accent = cssVar('--accent');
        const ink = cssVar('--chart-ink');

        /* ---------------- the plot ---------------- */
        const padL = 40, padR = w * 0.36, padT = 16, padB = 30;
        const pw = w - padL - padR, ph = hgt - padT - padB;
        const XMIN = -6, XMAX = 6, YMIN = -8, YMAX = 12;
        const X = (x) => padL + ((x - XMIN) / (XMAX - XMIN)) * pw;
        const Y = (y) => padT + ph - ((y - YMIN) / (YMAX - YMIN)) * ph;

        g.save();
        g.strokeStyle = cssVar('--chart-grid'); g.lineWidth = 1;
        for (let x = XMIN; x <= XMAX; x += 2) { g.beginPath(); g.moveTo(X(x), padT); g.lineTo(X(x), padT + ph); g.stroke(); }
        for (let y = YMIN; y <= YMAX; y += 4) { g.beginPath(); g.moveTo(padL, Y(y)); g.lineTo(padL + pw, Y(y)); g.stroke(); }
        g.restore();
        c2d.line(g, padL, Y(0), padL + pw, Y(0), { color: ink, width: 1.5 });
        c2d.line(g, X(0), padT, X(0), padT + ph, { color: ink, width: 1.5 });
        for (let x = XMIN + 2; x <= XMAX - 2; x += 2) {
          if (x) c2d.text(g, String(x), X(x), Y(0) + 12, { size: 8, color: ink });
        }
        c2d.text(g, 'x', padL + pw, hgt - 6, { size: 10, weight: 700, color: ink, align: 'right' });

        /* the curve */
        const f = (x) => a * x * x + b * x + c;
        g.save();
        g.strokeStyle = hue; g.lineWidth = 2.8; g.lineJoin = 'round';
        g.beginPath();
        g.rect(padL, padT, pw, ph); g.clip();
        g.beginPath();
        for (let i = 0; i <= 200; i++) {
          const x = XMIN + (i / 200) * (XMAX - XMIN);
          const y = f(x);
          i ? g.lineTo(X(x), Y(y)) : g.moveTo(X(x), Y(y));
        }
        g.stroke();
        g.restore();

        /* the roots on the real axis */
        if (Math.abs(a) > 0.01 && D >= -0.05) {
          const rt = Math.sqrt(Math.max(0, D));
          const xs = Math.abs(D) < 0.05 ? [-b / (2 * a)] : [(-b - rt) / (2 * a), (-b + rt) / (2 * a)];
          const colour = Math.abs(D) < 0.05 ? accent : ok;
          for (const x of xs) {
            if (x < XMIN || x > XMAX) continue;
            g.fillStyle = colour;
            g.beginPath(); g.arc(X(x), Y(0), 6.5, 0, Math.PI * 2); g.fill();
            g.strokeStyle = cssVar('--bg-1'); g.lineWidth = 2; g.stroke();
            c2d.text(g, x.toFixed(2), X(x), Y(0) + 22, { size: 10, weight: 800, color: colour });
          }
        }

        /* the vertex */
        if (Math.abs(a) > 0.01) {
          const vx = -b / (2 * a);
          if (vx >= XMIN && vx <= XMAX) {
            g.fillStyle = accent;
            g.beginPath(); g.arc(X(vx), Y(f(vx)), 4, 0, Math.PI * 2); g.fill();
          }
        }

        /* ---------------- the panel ---------------- */
        const px = w - padR / 2;
        const kind = Math.abs(a) < 0.01 ? { s: 'not a quadratic', d: 'a = 0', colour: cssVar('--ink-4') }
          : D > 0.05 ? { s: 'D > 0', d: 'two real, distinct', colour: ok }
          : D >= -0.05 ? { s: 'D = 0', d: 'one repeated root', colour: accent }
          : { s: 'D < 0', d: 'complex conjugates', colour: bad };

        g.fillStyle = cssVar('--bg-2');
        c2d.roundRect(g, px - 96, 22, 192, 118, 10); g.fill();
        g.strokeStyle = kind.colour; g.lineWidth = 1.6; g.stroke();
        c2d.text(g, eqn(a, b, c), px, 42, { size: 11, weight: 800, color: cssVar('--ink-2') });
        c2d.text(g, `D = ${b.toFixed(1)}² − 4(${a.toFixed(1)})(${c.toFixed(1)})`, px, 62,
          { size: 9, weight: 700, color: cssVar('--ink-4'), font: 'mono' });
        c2d.text(g, `D = ${D.toFixed(2)}`, px, 88, { size: 20, weight: 900, color: kind.colour });
        c2d.text(g, kind.s, px, 112, { size: 12, weight: 900, color: kind.colour });
        c2d.text(g, kind.d, px, 128, { size: 10, weight: 700, color: cssVar('--ink-3') });

        /* ---------------- the Argand panel, when the roots leave ---------------- */
        if (Math.abs(a) > 0.01 && D < -0.05) {
          const cx = px, cy = 210, U = 14;
          g.fillStyle = cssVar('--bg-0');
          c2d.roundRect(g, cx - 96, cy - 58, 192, 108, 9); g.fill();
          g.strokeStyle = bad; g.lineWidth = 1.2; g.stroke();
          c2d.text(g, 'the roots, on the Argand plane', cx, cy - 46,
            { size: 9, weight: 700, color: cssVar('--ink-4') });

          c2d.line(g, cx - 80, cy + 6, cx + 80, cy + 6, { color: ink, width: 1.2 });
          c2d.line(g, cx, cy - 32, cx, cy + 44, { color: ink, width: 1.2 });

          const re = -b / (2 * a);
          const im = Math.sqrt(-D) / (2 * a);
          for (const sgn of [1, -1]) {
            const x = clamp(cx + re * U, cx - 76, cx + 76);
            const y = clamp(cy + 6 - sgn * im * U, cy - 28, cy + 40);
            g.fillStyle = bad;
            g.beginPath(); g.arc(x, y, 5.5, 0, Math.PI * 2); g.fill();
          }
          c2d.text(g, `${re.toFixed(2)} ± ${Math.abs(im).toFixed(2)}i`, cx, cy + 40,
            { size: 12, weight: 900, color: bad });
        }
      }
    });

    function eqn(a, b, c) {
      const t = (v, sym) => `${v < 0 ? '−' : '+'} ${Math.abs(v).toFixed(1)}${sym}`;
      return `${a.toFixed(1)}x² ${t(b, 'x')} ${t(c, '')}`;
    }

    /* ------------------------------------------------------------ */

    const out = readouts([
      { key: 'e', label: 'equation', value: '—' },
      { key: 'd', label: 'D', value: '—' },
      { key: 's', label: 'sum  −b/a', value: '—' },
      { key: 'p', label: 'product  c/a', value: '—' }
    ]);

    function refresh() {
      const { a, b, c, D } = state();
      out.set('e', eqn(a, b, c));
      out.set('d', round(D, 2), D > 0.05 ? 'ok' : D < -0.05 ? 'bad' : null);
      out.set('s', Math.abs(a) < 0.01 ? '—' : round(-b / a, 2));
      out.set('p', Math.abs(a) < 0.01 ? '—' : round(c / a, 2));
    }

    const aS = slider({ label: 'a', min: -6, max: 6, step: 1, value: 2, fmt: (v) => (v / 2).toFixed(1), onInput: refresh });
    const bS = slider({ label: 'b', min: -16, max: 16, step: 1, value: -4, fmt: (v) => (v / 2).toFixed(1), onInput: refresh });
    const cS = slider({ label: 'c', min: -16, max: 16, step: 1, value: 2, fmt: (v) => (v / 2).toFixed(1), onInput: refresh });

    const taskBox = h('div.callout.callout--jee', { style: { margin: '0 0 12px' } });
    const controls = h('div');
    const verdict = h('div');
    cab.panel.appendChild(taskBox);
    cab.panel.appendChild(out.root);
    cab.panel.appendChild(controls);
    cab.panel.appendChild(verdict);

    function renderControls() {
      clear(controls);
      controls.appendChild(aS.root);
      controls.appendChild(bS.root);
      controls.appendChild(cS.root);
      controls.appendChild(h('div.btnbar', { style: { marginTop: 'var(--sp-4)' } },
        btn('Check', check, { kind: 'primary', size: 'md' })));
    }

    /* ------------------------------------------------------------ */

    function renderTask() {
      clear(taskBox);
      clear(verdict);
      if (idx >= TASKS.length) {
        taskBox.className = 'callout callout--tip';
        taskBox.appendChild(h('div.callout__label', null, '✓ Lab complete'));
        taskBox.appendChild(h('div.small', null, renderInline(
          'Free play: hold $a$ and $b$ fixed and slide $c$ slowly through the value that makes $D = 0$. That is the exact moment the roots leave the real line.')));
        return;
      }
      taskBox.className = 'callout callout--jee';
      taskBox.appendChild(h('div.callout__label', null, `Task ${idx + 1} / ${TASKS.length}`));
      taskBox.appendChild(h('div.small', null, renderInline(TASKS[idx].text)));
    }

    function check() {
      if (locked || idx >= TASKS.length) return;
      const s = state();
      if (Math.abs(s.a) < 0.01) {
        sfx.wrong();
        cab.setHint('With $a = 0$ this is not a quadratic at all. Move $a$ off zero.');
        return;
      }
      if (!TASKS[idx].ok(s)) {
        sfx.wrong();
        clear(verdict);
        verdict.appendChild(verdictLine(false,
          `Right now $D = ${s.D.toFixed(2)}$, sum $= ${(-s.b / s.a).toFixed(2)}$, product $= ${(s.c / s.a).toFixed(2)}$. Not the configuration asked for.`));
        return;
      }

      locked = true;
      score += 20;
      cab.setScore(score);
      sfx.levelUp();
      ctx.fx?.burstAt(taskBox, { count: 18 });

      clear(taskBox);
      taskBox.className = 'callout callout--tip';
      taskBox.appendChild(h('div.callout__label', null, `✓ D = ${s.D.toFixed(2)}`));
      taskBox.appendChild(h('div.small', null, renderInline(TASKS[idx].note)));
      clear(verdict);
      verdict.appendChild(h('div.btnbar', { style: { marginTop: '10px' } },
        btn(idx === TASKS.length - 1 ? 'Finish' : 'Next task', () => {
          idx++; locked = false;
          renderTask();
          if (idx >= TASKS.length) finish();
        }, { kind: 'primary' })));
    }

    function finish() {
      const best = Math.max(ctx.best ?? 0, score);
      cab.setBest(best);
      ctx.report(score, { best, tasks: idx });
      cab.overlay(cleared(score, best, start));
    }

    function start() {
      cab.clearOverlay();
      score = 0; idx = 0; locked = false;
      cab.setScore(0);
      aS.set(2); bS.set(-4); cS.set(2);
      refresh();
      renderControls();
      renderTask();
    }

    start();
    return { destroy() { view.stop(); } };
  }
};
