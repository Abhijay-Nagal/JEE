/**
 * Spectral Lab - choose a jump, get a line.
 *
 * The series names are usually memorised as a table. Here the learner picks the
 * two levels and the line lands on the spectrum in front of them, so "Balmer"
 * stops being a word and becomes "anything that ends at n = 2".
 */

import { h, clear } from '../../core/dom.js';
import { renderInline } from '../../core/mathlite.js';
import { sfx } from '../../core/audio.js';
import { arcade, canvasLayer, cssVar, c2d, slider, readouts, btn, seg,
         verdictLine, cleared, clamp, round } from '../kit.js';

const RY = 13.6;                 // eV
const SERIES = ['', 'Lyman', 'Balmer', 'Paschen', 'Brackett', 'Pfund'];

const IONS = [
  { id: 'h',  name: 'H',      Z: 1 },
  { id: 'he', name: 'He⁺',  Z: 2 },
  { id: 'li', name: 'Li²⁺', Z: 3 }
];

const TASKS = [
  { text: 'In **hydrogen**, produce the red H$\\alpha$ line at **656 nm**.',
    ok: (s) => s.Z === 1 && s.n2 === 3 && s.n1 === 2,
    note: '$3 \\to 2$ in hydrogen gives $\\Delta E = 1.89$ eV and $\\lambda = 656$ nm — the brightest Balmer line, and the colour of every hydrogen nebula you have seen photographed.' },
  { text: 'Produce **any Lyman line**.',
    ok: (s) => s.n1 === 1,
    note: 'Every jump that lands on $n = 1$ is a Lyman line. They all lie in the ultraviolet, because the gap down to the ground state is always large.' },
  { text: 'Produce a line in the **infrared** ($\\lambda > 700$ nm).',
    ok: (s) => s.lambda > 700,
    note: 'Infrared needs a **small** energy gap, which means jumping between high levels — Paschen ($n_1=3$) and beyond. The levels crowd together as $n$ grows, so the gaps shrink.' },
  { text: 'Produce the transition with $\\Delta E = 2.55$ eV.',
    ok: (s) => Math.abs(s.dE - 2.55) < 0.03,
    note: '$4 \\to 2$ in hydrogen: $-0.85 - (-3.40) = 2.55$ eV, giving 486 nm — the blue-green H$\\beta$ line.' },
  { text: 'In **He$^+$**, produce a line with exactly the same wavelength as hydrogen’s $2 \\to 1$.',
    ok: (s) => s.Z === 2 && s.n2 === 4 && s.n1 === 2,
    note: 'Energies go as $Z^2/n^2$. Doubling $Z$ and doubling both $n$ leaves every energy unchanged, so He$^+$ $4\\to2$ is identical to H $2\\to1$ at 122 nm. This coincidence caused real confusion in early stellar spectroscopy.' }
];

export default {
  id: 'bohrOrbits',

  mount(root, ctx) {
    const cab = arcade(root, {
      title: 'Spectral Lab',
      badge: 'Jumps become lines',
      hint: 'Pick the level it falls from and the level it lands on. The line appears below.',
      best: ctx.best ?? null,
      onRestart: start
    });

    let Z = 1;
    let fired = [];                  // lines already produced, for the strip
    let score = 0, taskIdx = 0, locked = false;
    let flight = 0;                  // 0..1 animation of the current jump

    const stageBox = h('div');
    cab.stage.appendChild(stageBox);

    const E = (n) => -RY * (Z * Z) / (n * n);
    const state = () => {
      const n2 = Math.max(hi.get(), lo.get() + 1);
      const n1 = lo.get();
      const dE = E(n2) - E(n1);
      return { Z, n1, n2, dE, lambda: 1239.84 / dE };
    };

    /* ------------------------------------------------------------ */

    const view = canvasLayer(stageBox, {
      height: 300,
      animate: true,
      draw(g, w, hgt) {
        const s = state();
        const hue = cssVar('--chemistry');
        const ink = cssVar('--ink-4');

        /* ---------------- left: the orbits ---------------- */
        const cx = w * 0.23, cy = hgt * 0.42;
        const rOf = (n) => 14 + n * n * 3.6;

        g.fillStyle = cssVar('--bad');
        g.beginPath(); g.arc(cx, cy, 6, 0, Math.PI * 2); g.fill();
        c2d.text(g, `Z = ${Z}`, cx, cy + 4, { size: 8, weight: 900, color: cssVar('--bg-1') });

        for (let n = 1; n <= 6; n++) {
          const active = n === s.n1 || n === s.n2;
          g.save();
          g.strokeStyle = active ? hue : cssVar('--line');
          g.lineWidth = active ? 1.9 : 1;
          if (!active) g.setLineDash([3, 4]);
          g.beginPath(); g.arc(cx, cy, rOf(n), 0, Math.PI * 2); g.stroke();
          g.restore();
        }

        const nNow = s.n2 + (s.n1 - s.n2) * flight;
        const ang = performance.now() / 420;
        const rNow = rOf(nNow);
        g.fillStyle = cssVar('--chart-1');
        g.beginPath();
        g.arc(cx + Math.cos(ang) * rNow, cy + Math.sin(ang) * rNow, 5, 0, Math.PI * 2);
        g.fill();

        c2d.text(g, 'orbits', cx, cy + rOf(6) + 16, { size: 9, weight: 700, color: ink });

        /* ---------------- middle: the ladder ---------------- */
        const lx = w * 0.48, lw = w * 0.17;
        const topY = 26, botY = hgt - 86;
        const span = RY * Z * Z;
        const Ey = (n) => botY - ((E(n) + span) / span) * (botY - topY);

        for (let n = 1; n <= 6; n++) {
          const active = n === s.n1 || n === s.n2;
          c2d.line(g, lx, Ey(n), lx + lw, Ey(n),
            { color: active ? hue : cssVar('--line'), width: active ? 2.4 : 1.3 });
          c2d.text(g, `n=${n}`, lx - 6, Ey(n),
            { size: 9, weight: 700, color: active ? hue : ink, align: 'right' });
          if (active) {
            c2d.text(g, `${E(n).toFixed(2)} eV`, lx + lw + 6, Ey(n),
              { size: 9, weight: 800, color: hue, align: 'left' });
          }
        }
        c2d.line(g, lx, topY, lx + lw, topY, { color: ink, width: 1, dash: [2, 4] });
        c2d.text(g, 'n=∞  (0 eV)', lx + lw + 6, topY,
          { size: 9, weight: 700, color: ink, align: 'left' });

        const ax = lx + lw * 0.5;
        const y1 = Ey(s.n2), y2 = Ey(s.n1);
        c2d.arrow(g, ax, y1, ax, y1 + (y2 - y1) * flight,
          { color: lineColour(s.lambda), width: 3, head: 9 });
        if (flight > 0.98) {
          c2d.text(g, `ΔE = ${s.dE.toFixed(2)} eV`, ax, (y1 + y2) / 2 - 12,
            { size: 10, weight: 800, color: lineColour(s.lambda) });
        }

        /* ---------------- the emitted photon ---------------- */
        if (flight > 0.98) {
          const t = performance.now() / 1000;
          const p = (t % 1.4) / 1.4;
          g.save();
          g.globalAlpha = 1 - p * 0.7;
          g.strokeStyle = lineColour(s.lambda);
          g.lineWidth = 2.2;
          g.beginPath();
          const px = lx + lw + 30 + p * (w * 0.2);
          for (let i = 0; i <= 20; i++) {
            const x = px + i * 2.2;
            const yy = (y1 + y2) / 2 + Math.sin(i * 0.9 - t * 8) * 5;
            i ? g.lineTo(x, yy) : g.moveTo(x, yy);
          }
          g.stroke();
          g.restore();
        }

        /* ---------------- bottom: the spectrum ---------------- */
        const sy = hgt - 58, sx0 = 24, sx1 = w - 24;
        g.fillStyle = cssVar('--bg-0');
        c2d.roundRect(g, sx0, sy, sx1 - sx0, 28, 5); g.fill();
        g.strokeStyle = cssVar('--line'); g.lineWidth = 1; g.stroke();

        const X = (nmv) => {
          const a = Math.log10(50), b = Math.log10(5000);
          return sx0 + ((clamp(Math.log10(nmv), a, b) - a) / (b - a)) * (sx1 - sx0);
        };
        for (const [l, name] of [[80, 'UV'], [550, 'visible'], [2200, 'IR']]) {
          c2d.text(g, name, X(l), sy + 14, { size: 9, weight: 700, color: ink });
        }

        for (const f of fired) {
          const x = X(f);
          g.save(); g.globalAlpha = 0.45;
          c2d.line(g, x, sy + 2, x, sy + 26, { color: lineColour(f), width: 2 });
          g.restore();
        }
        if (flight > 0.98) {
          const x = X(s.lambda);
          c2d.line(g, x, sy - 2, x, sy + 30, { color: lineColour(s.lambda), width: 3.4 });
          c2d.text(g, `${s.lambda.toFixed(0)} nm`, clamp(x, sx0 + 30, sx1 - 30), sy - 12,
            { size: 10, weight: 800, color: lineColour(s.lambda) });
        }

        /* ---------------- the label ---------------- */
        c2d.text(g, `${s.n2} → ${s.n1}   ·   ${SERIES[s.n1] || 'higher'} series   ·   ${region(s.lambda)}`,
          w / 2, 14, { size: 11, weight: 800, color: hue });
      }
    });

    function region(nmv) {
      if (nmv < 400) return 'ultraviolet';
      if (nmv < 700) return 'visible';
      return 'infrared';
    }

    /** Roughly the colour the eye would see; grey outside the visible band. */
    function lineColour(nmv) {
      if (nmv < 400 || nmv > 700) return nmv < 400 ? cssVar('--chart-3') : cssVar('--warn');
      if (nmv < 460) return '#6f6fe8';
      if (nmv < 500) return '#4cc9f0';
      if (nmv < 570) return '#18a878';
      if (nmv < 600) return '#e2b93b';
      return '#e34948';
    }

    /* ------------------------------------------------------------ */

    const out = readouts([
      { key: 'j', label: 'transition', value: '—' },
      { key: 'd', label: 'ΔE (eV)', value: '—' },
      { key: 'l', label: 'λ (nm)', value: '—' },
      { key: 's', label: 'series', value: '—' }
    ]);

    function refresh() {
      const s = state();
      out.set('j', `${s.n2} → ${s.n1}`);
      out.set('d', round(s.dE, 3));
      out.set('l', s.lambda.toFixed(1));
      out.set('s', SERIES[s.n1] || `n₁ = ${s.n1}`);
      flight = 0;
    }

    const lo = slider({
      label: 'Lands on  n₁', min: 1, max: 5, step: 1, value: 2, onInput: refresh
    });
    const hi = slider({
      label: 'Falls from  n₂', min: 2, max: 6, step: 1, value: 3, onInput: refresh
    });

    const taskBox = h('div.callout.callout--jee', { style: { margin: '0 0 12px' } });
    const controls = h('div');
    const verdict = h('div');
    cab.panel.appendChild(taskBox);
    cab.panel.appendChild(out.root);
    cab.panel.appendChild(controls);
    cab.panel.appendChild(verdict);

    function renderControls() {
      clear(controls);
      controls.appendChild(h('div.row', { style: { justifyContent: 'center', margin: '12px 0 4px' } },
        seg(IONS.map((i) => ({ value: i.id, label: i.name })), IONS.find((i) => i.Z === Z).id, (v) => {
          Z = IONS.find((i) => i.id === v).Z;
          refresh();
        })));
      controls.appendChild(hi.root);
      controls.appendChild(lo.root);
      controls.appendChild(h('div.btnbar', { style: { marginTop: 'var(--sp-4)' } },
        btn('⚡ Make the jump', fire, { kind: 'primary', size: 'md' }),
        btn('Clear lines', () => { fired = []; }, { kind: 'ghost' })
      ));
    }

    /* ------------------------------------------------------------ */

    function fire() {
      const s = state();
      if (s.n2 <= s.n1) {
        cab.setHint('The electron has to fall: $n_2$ must be above $n_1$.');
        sfx.wrong();
        return;
      }
      flight = 0;
      sfx.pop();
      const startT = performance.now();
      const tick = () => {
        flight = clamp((performance.now() - startT) / 620, 0, 1);
        if (flight < 1) requestAnimationFrame(tick);
        else {
          if (!fired.includes(s.lambda)) fired.push(s.lambda);
          check(s);
        }
      };
      requestAnimationFrame(tick);
    }

    function renderTask() {
      clear(taskBox);
      clear(verdict);
      if (taskIdx >= TASKS.length) {
        taskBox.className = 'callout callout--tip';
        taskBox.appendChild(h('div.callout__label', null, '✓ Spectrum mapped'));
        taskBox.appendChild(h('div.small', null, renderInline(
          'Free play: fire every jump from $n=5$ downward and count the lines. You should get $\\dfrac{5\\times4}{2} = 10$.')));
        return;
      }
      taskBox.className = 'callout callout--jee';
      taskBox.appendChild(h('div.callout__label', null, `Task ${taskIdx + 1} / ${TASKS.length}`));
      taskBox.appendChild(h('div.small', null, renderInline(TASKS[taskIdx].text)));
    }

    function check(s) {
      if (locked || taskIdx >= TASKS.length) return;
      const task = TASKS[taskIdx];
      if (!task.ok(s)) {
        sfx.wrong();
        clear(verdict);
        verdict.appendChild(verdictLine(false,
          `That jump gives ${s.lambda.toFixed(0)} nm in the ${region(s.lambda)}. Not the one asked for — try another pair.`));
        return;
      }

      locked = true;
      score += 25;
      cab.setScore(score);
      sfx.levelUp();
      ctx.fx?.burstAt(taskBox, { count: 20 });

      clear(taskBox);
      taskBox.className = 'callout callout--tip';
      taskBox.appendChild(h('div.callout__label', null, `✓ ${s.lambda.toFixed(0)} nm`));
      taskBox.appendChild(h('div.small', null, renderInline(task.note)));
      clear(verdict);
      verdict.appendChild(h('div.btnbar', { style: { marginTop: '10px' } },
        btn(taskIdx === TASKS.length - 1 ? 'Finish' : 'Next task', () => {
          taskIdx++; locked = false;
          renderTask();
          if (taskIdx >= TASKS.length) finish();
        }, { kind: 'primary' })));
    }

    function finish() {
      const best = Math.max(ctx.best ?? 0, score);
      cab.setBest(best);
      ctx.report(score, { best, tasks: taskIdx });
      cab.overlay(cleared(score, best, start));
    }

    function start() {
      cab.clearOverlay();
      score = 0; taskIdx = 0; locked = false;
      Z = 1; fired = []; flight = 0;
      cab.setScore(0);
      lo.set(2); hi.set(3);
      refresh();
      renderControls();
      renderTask();
    }

    start();
    return { destroy() { view.stop(); } };
  }
};
