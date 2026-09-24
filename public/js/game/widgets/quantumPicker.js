/**
 * Quantum Number Inspector - dial a set, and be told immediately which rule you
 * broke.
 *
 * "Which set is not possible?" is asked in some form every year. It is always
 * l >= n or |m_l| > l. Letting the learner build illegal sets on purpose, and
 * naming the violation as it happens, is faster than any table.
 */

import { h, clear } from '../../core/dom.js';
import { renderInline } from '../../core/mathlite.js';
import { sfx } from '../../core/audio.js';
import { arcade, canvasLayer, cssVar, c2d, slider, readouts, btn, seg, choices,
         verdictLine, cleared } from '../kit.js';

const LETTER = ['s', 'p', 'd', 'f', 'g', 'h'];

/** Build targets: description in, four numbers out. */
const BUILDS = [
  { text: 'An electron in the **1s** orbital, **spin down**.',
    ok: (s) => s.n === 1 && s.l === 0 && s.ml === 0 && s.ms === -0.5,
    note: 'The ground state of hydrogen. With $n = 1$ there is no choice at all: $l$ must be 0 and $m_l$ must be 0. Only the spin is free, and it has two values.' },
  { text: 'An electron in a **3p** orbital with $m_l = 0$, spin up.',
    ok: (s) => s.n === 3 && s.l === 1 && s.ml === 0 && s.ms === 0.5,
    note: '$l = 1$ makes it a p orbital, and $m_l = 0$ picks the one aligned with the $z$ axis — conventionally $p_z$.' },
  { text: 'An electron in a **4d** orbital with the **most negative** $m_l$.',
    ok: (s) => s.n === 4 && s.l === 2 && s.ml === -2,
    note: '$l = 2$ gives d, and $m_l$ runs $-2, -1, 0, +1, +2$. The most negative is $-2$. Five values, five d orbitals — that is where $2l+1$ comes from.' },
  { text: 'An electron in the subshell with $n = 5$ and $l = 3$, with $m_l = +3$.',
    ok: (s) => s.n === 5 && s.l === 3 && s.ml === 3,
    note: 'That is a **5f** orbital. $l = 3$ is legal here because $n = 5$ allows $l$ up to 4. Seven orbitals, holding fourteen electrons — the width of the f block.' }
];

/** Judge round: sets to classify. */
const JUDGE = [
  { set: [3, 3, 0, 0.5], legal: false,
    why: '$l$ must satisfy $l \\leq n-1$. With $n = 3$, the largest $l$ is 2 — so $l = 3$ is impossible.' },
  { set: [4, 2, -2, -0.5], legal: true,
    why: 'Legal: $n = 4$ allows $l$ up to 3, and $l = 2$ allows $m_l$ from $-2$ to $+2$. This is a 4d electron.' },
  { set: [2, 1, 2, 0.5], legal: false,
    why: '$|m_l|$ can never exceed $l$. With $l = 1$, $m_l$ may only be $-1$, $0$ or $+1$.' },
  { set: [1, 0, 0, -0.5], legal: true,
    why: 'Legal — the 1s orbital, spin down. The only other electron it can share that orbital with has $m_s = +\\tfrac12$.' },
  { set: [3, 2, -3, 0.5], legal: false,
    why: 'With $l = 2$, $m_l$ runs $-2 \\ldots +2$. $m_l = -3$ is outside the range.' }
];

export default {
  id: 'quantumPicker',

  mount(root, ctx) {
    const cab = arcade(root, {
      title: 'Quantum Number Inspector',
      badge: 'Four numbers, two rules',
      hint: 'Set the four dials. Illegal combinations are named as soon as you make them.',
      best: ctx.best ?? null,
      onRestart: start
    });

    let ms = 0.5;
    let phase = 'build';              // 'build' | 'judge'
    let idx = 0, score = 0, locked = false;

    const stageBox = h('div');
    cab.stage.appendChild(stageBox);

    const state = () => ({ n: nS.get(), l: lS.get(), ml: mS.get(), ms });

    /** Returns null when legal, otherwise the rule that was broken. */
    function violation(s = state()) {
      if (s.l > s.n - 1) {
        return { rule: 'l ≤ n − 1',
          msg: `With $n = ${s.n}$, $l$ can be at most ${s.n - 1}. You have $l = ${s.l}$.` };
      }
      if (Math.abs(s.ml) > s.l) {
        return { rule: '|mₗ| ≤ l',
          msg: `With $l = ${s.l}$, $m_l$ runs from $-${s.l}$ to $+${s.l}$. You have $m_l = ${s.ml}$.` };
      }
      return null;
    }

    /* ------------------------------------------------------------ */

    const view = canvasLayer(stageBox, {
      height: 240,
      animate: true,
      draw(g, w, hgt) {
        const s = state();
        const bad = violation(s);
        const hue = bad ? cssVar('--bad') : cssVar('--chemistry');
        const ink = cssVar('--ink-4');

        /* ---- the shell / subshell / orbital chain ---- */
        c2d.text(g, bad ? `✗ breaks  ${bad.rule}` : `✓ legal · ${s.n}${LETTER[s.l] || '?'} orbital`,
          w / 2, 20, { size: 13, weight: 900, color: hue });

        /* shells */
        const cx = w * 0.19, cy = hgt * 0.52;
        for (let n = 1; n <= 6; n++) {
          const on = n === s.n;
          g.save();
          g.strokeStyle = on ? hue : cssVar('--line');
          g.lineWidth = on ? 2 : 1;
          if (!on) g.setLineDash([3, 4]);
          g.beginPath(); g.arc(cx, cy, 12 + n * 9, 0, Math.PI * 2); g.stroke();
          g.restore();
        }
        g.fillStyle = cssVar('--bad');
        g.beginPath(); g.arc(cx, cy, 5, 0, Math.PI * 2); g.fill();
        c2d.text(g, `n = ${s.n}`, cx, cy + 78, { size: 10, weight: 800, color: hue });
        c2d.text(g, 'shell · size', cx, cy + 92, { size: 8, weight: 700, color: ink });

        /* the subshell letter */
        const sx = w * 0.44;
        g.save();
        g.strokeStyle = hue; g.lineWidth = 1.6;
        g.fillStyle = cssVar('--bg-2');
        c2d.roundRect(g, sx - 30, cy - 30, 60, 60, 10); g.fill(); g.stroke();
        g.restore();
        c2d.text(g, bad && bad.rule.startsWith('l') ? '?' : LETTER[s.l] || '?', sx, cy,
          { size: 28, weight: 900, color: hue });
        c2d.text(g, `l = ${s.l}`, sx, cy + 46, { size: 10, weight: 800, color: hue });
        c2d.text(g, 'subshell · shape', sx, cy + 60, { size: 8, weight: 700, color: ink });

        /* the orbital boxes, one per m_l */
        const ox = w * 0.70;
        const count = 2 * s.l + 1;
        const bw = Math.min(22, (w * 0.28 - 12) / Math.max(count, 1));
        const gap = 4;
        const totalW = count * bw + (count - 1) * gap;
        const x0 = ox - totalW / 2 + bw / 2;

        for (let i = 0; i < count; i++) {
          const mlv = i - s.l;
          const on = mlv === s.ml && !bad;
          const bx = x0 + i * (bw + gap) - bw / 2;
          g.save();
          g.strokeStyle = on ? hue : cssVar('--line');
          g.lineWidth = on ? 2 : 1.1;
          g.fillStyle = cssVar('--bg-2');
          c2d.roundRect(g, bx, cy - 15, bw, 30, 4); g.fill(); g.stroke();
          g.restore();
          c2d.text(g, String(mlv), bx + bw / 2, cy + 26,
            { size: 8, weight: 700, color: on ? hue : ink });
          if (on) {
            const dir = s.ms > 0 ? 1 : -1;
            g.save();
            g.strokeStyle = cssVar('--ok'); g.fillStyle = cssVar('--ok'); g.lineWidth = 2.2;
            g.beginPath(); g.moveTo(bx + bw / 2, cy + dir * 9); g.lineTo(bx + bw / 2, cy - dir * 9); g.stroke();
            g.beginPath();
            g.moveTo(bx + bw / 2, cy - dir * 10);
            g.lineTo(bx + bw / 2 - 3.4, cy - dir * 4);
            g.lineTo(bx + bw / 2 + 3.4, cy - dir * 4);
            g.closePath(); g.fill();
            g.restore();
          }
        }
        c2d.text(g, bad ? 'mₗ = ?' : `mₗ = ${s.ml}`, ox, cy + 46,
          { size: 10, weight: 800, color: hue });
        c2d.text(g, `${count} orbitals · 2l+1`, ox, cy + 60,
          { size: 8, weight: 700, color: ink });

        /* the spin */
        c2d.text(g, `mₛ = ${s.ms > 0 ? '+½  (spin up)' : '−½  (spin down)'}`,
          w / 2, hgt - 16, { size: 11, weight: 800, color: cssVar('--ok') });

        /* arrows joining the three panels */
        if (!bad) {
          c2d.arrow(g, cx + 68, cy, sx - 36, cy, { color: cssVar('--line'), width: 1.4, head: 6 });
          c2d.arrow(g, sx + 36, cy, x0 - bw / 2 - 8, cy, { color: cssVar('--line'), width: 1.4, head: 6 });
        }
      }
    });

    /* ------------------------------------------------------------ */

    const out = readouts([
      { key: 'n', label: 'n', value: '1' },
      { key: 'l', label: 'l', value: '0' },
      { key: 'm', label: 'mₗ', value: '0' },
      { key: 'v', label: 'verdict', value: 'legal' }
    ]);

    function refresh() {
      const s = state();
      const bad = violation(s);
      out.set('n', s.n);
      out.set('l', `${s.l} (${LETTER[s.l] || '?'})`);
      out.set('m', s.ml);
      out.set('v', bad ? 'illegal' : 'legal', bad ? 'bad' : 'ok');
      if (bad) cab.setHint(bad.msg);
      else cab.setHint(`Legal: this is a ${s.n}${LETTER[s.l]} electron, one of ${2 * s.l + 1} orbitals in that subshell.`);
    }

    const nS = slider({ label: 'n — principal', min: 1, max: 6, step: 1, value: 1, onInput: refresh });
    const lS = slider({ label: 'l — azimuthal', min: 0, max: 5, step: 1, value: 0, onInput: refresh });
    const mS = slider({ label: 'mₗ — magnetic', min: -5, max: 5, step: 1, value: 0, onInput: refresh });

    const taskBox = h('div.callout.callout--jee', { style: { margin: '0 0 12px' } });
    const controls = h('div');
    const verdict = h('div');
    cab.panel.appendChild(taskBox);
    cab.panel.appendChild(out.root);
    cab.panel.appendChild(controls);
    cab.panel.appendChild(verdict);

    function renderControls() {
      clear(controls);
      if (phase === 'judge') return;
      controls.appendChild(nS.root);
      controls.appendChild(lS.root);
      controls.appendChild(mS.root);
      controls.appendChild(h('div.row', { style: { justifyContent: 'center', margin: '10px 0' } },
        seg([
          { value: 'up', label: 'mₛ = +½' },
          { value: 'down', label: 'mₛ = −½' }
        ], ms > 0 ? 'up' : 'down', (v) => { ms = v === 'up' ? 0.5 : -0.5; refresh(); })));
      controls.appendChild(h('div.btnbar', null,
        btn('Check', check, { kind: 'primary', size: 'md' })));
    }

    /* ------------------------------------------------------------ */

    function renderTask() {
      clear(taskBox);
      clear(verdict);
      renderControls();

      if (phase === 'build' && idx >= BUILDS.length) {
        phase = 'judge'; idx = 0;
        renderControls();
      }
      if (phase === 'judge' && idx >= JUDGE.length) {
        taskBox.className = 'callout callout--tip';
        taskBox.appendChild(h('div.callout__label', null, '✓ Inspector certified'));
        taskBox.appendChild(h('div.small', null, renderInline(
          'Both rules are now reflexes: $l \\leq n-1$, and $|m_l| \\leq l$. Every "impossible set" question is one of those two.')));
        return;
      }

      if (phase === 'build') {
        taskBox.className = 'callout callout--jee';
        taskBox.appendChild(h('div.callout__label', null, `Build ${idx + 1} / ${BUILDS.length}`));
        taskBox.appendChild(h('div.small', null, renderInline(BUILDS[idx].text)));
        return;
      }

      const j = JUDGE[idx];
      const [n, l, mlv, msv] = j.set;
      taskBox.className = 'callout callout--jee';
      taskBox.appendChild(h('div.callout__label', null, `Judge ${idx + 1} / ${JUDGE.length}`));
      taskBox.appendChild(h('div.small', null, renderInline('Is this set of quantum numbers possible?')));
      taskBox.appendChild(h('div', { style: { margin: '8px 0', fontWeight: '800' } },
        renderInline(`$n = ${n}$,  $l = ${l}$,  $m_l = ${mlv}$,  $m_s = ${msv > 0 ? '+\\tfrac12' : '-\\tfrac12'}$`)));
      verdict.appendChild(judgeChoices());
    }

    /** The two answer tiles for a judge round, rebuilt after a wrong guess. */
    function judgeChoices() {
      const j = JUDGE[idx];
      return choices([
        { label: 'Possible', value: 'yes' },
        { label: 'Impossible', value: 'no' }
      ], (val) => {
        if (locked) return;
        (val === 'yes') === j.legal ? win(j.why) : miss();
      });
    }

    function check() {
      if (locked || phase !== 'build' || idx >= BUILDS.length) return;
      const b = BUILDS[idx];
      if (!b.ok(state())) { miss(); return; }
      win(b.note);
    }

    function miss() {
      sfx.wrong();
      clear(verdict);
      const bad = violation();
      verdict.appendChild(verdictLine(false, phase === 'judge'
        ? 'Not quite. Check $l$ against $n$ first, then $m_l$ against $l$.'
        : bad
          ? `That set is not even legal — ${bad.msg}`
          : 'Legal, but not the set asked for. Read the description again, number by number.'));
      if (phase === 'judge') verdict.appendChild(judgeChoices());
    }

    function win(note) {
      locked = true;
      score += 20;
      cab.setScore(score);
      sfx.levelUp();
      ctx.fx?.burstAt(taskBox, { count: 16 });

      clear(taskBox);
      taskBox.className = 'callout callout--tip';
      taskBox.appendChild(h('div.callout__label', null, '✓ Correct'));
      taskBox.appendChild(h('div.small', null, renderInline(note)));
      clear(verdict);
      const last = phase === 'judge' && idx === JUDGE.length - 1;
      verdict.appendChild(h('div.btnbar', { style: { marginTop: '10px' } },
        btn(last ? 'Finish' : 'Next', () => {
          idx++; locked = false;
          renderTask();
          if (phase === 'judge' && idx >= JUDGE.length) finish();
        }, { kind: 'primary' })));
    }

    function finish() {
      const best = Math.max(ctx.best ?? 0, score);
      cab.setBest(best);
      ctx.report(score, { best, rounds: BUILDS.length + JUDGE.length });
      cab.overlay(cleared(score, best, start));
    }

    function start() {
      cab.clearOverlay();
      score = 0; idx = 0; locked = false; phase = 'build'; ms = 0.5;
      cab.setScore(0);
      nS.set(1); lS.set(0); mS.set(0);
      refresh();
      renderTask();
    }

    start();
    return { destroy() { view.stop(); } };
  }
};
