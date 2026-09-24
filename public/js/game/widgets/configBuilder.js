/**
 * Configuration Builder - place the electrons yourself, one subshell at a time.
 *
 * Aufbau is the only choice the learner makes here: which subshell gets the next
 * electron. Pauli and Hund are then applied automatically by the placement, so
 * they are visible as consequences rather than as extra rules to recall. The
 * chromium and copper rounds exist precisely because the obvious choice is wrong.
 */

import { h, clear } from '../../core/dom.js';
import { renderInline } from '../../core/mathlite.js';
import { sfx } from '../../core/audio.js';
import { arcade, canvasLayer, cssVar, c2d, readouts, btn,
         verdictLine, cleared } from '../kit.js';

/** Subshells in Aufbau order. */
const ORDER = [
  { id: '1s', n: 1, l: 0, cap: 2 },
  { id: '2s', n: 2, l: 0, cap: 2 },
  { id: '2p', n: 2, l: 1, cap: 6 },
  { id: '3s', n: 3, l: 0, cap: 2 },
  { id: '3p', n: 3, l: 1, cap: 6 },
  { id: '4s', n: 4, l: 0, cap: 2 },
  { id: '3d', n: 3, l: 2, cap: 10 },
  { id: '4p', n: 4, l: 1, cap: 6 }
];

/** Targets, as electrons per subshell in the order above. */
const TARGETS = [
  { Z: 7, sym: 'N', name: 'Nitrogen',
    cfg: [2, 2, 3, 0, 0, 0, 0, 0],
    note: '$1s^2\\,2s^2\\,2p^3$. Hund put one electron in each 2p box before pairing any, so nitrogen has **three** unpaired electrons with parallel spins — a half-filled p subshell, and unusually stable.' },
  { Z: 11, sym: 'Na', name: 'Sodium',
    cfg: [2, 2, 6, 1, 0, 0, 0, 0],
    note: '$1s^2\\,2s^2\\,2p^6\\,3s^1$, or $[\\text{Ne}]3s^1$. That single outer electron, far from the nucleus and well shielded, is the whole of sodium’s chemistry.' },
  { Z: 17, sym: 'Cl', name: 'Chlorine',
    cfg: [2, 2, 6, 2, 5, 0, 0, 0],
    note: '$[\\text{Ne}]3s^2\\,3p^5$. One electron short of a filled 3p — which is why chlorine takes one so eagerly.' },
  { Z: 24, sym: 'Cr', name: 'Chromium',
    cfg: [2, 2, 6, 2, 6, 1, 5, 0],
    trap: [2, 2, 6, 2, 6, 2, 4, 0],
    trapMsg: 'That is what plain Aufbau predicts — $[\\text{Ar}]3d^4\\,4s^2$ — and it is **not** what chromium does. Try moving one electron from 4s to 3d.',
    note: '$[\\text{Ar}]3d^5\\,4s^1$. Promoting one 4s electron gives a **half-filled** d subshell, whose symmetry and exchange energy more than repay the cost. Chromium ends up with six unpaired electrons — the most in its row.' },
  { Z: 26, sym: 'Fe', name: 'Iron',
    cfg: [2, 2, 6, 2, 6, 2, 6, 0],
    note: '$[\\text{Ar}]3d^6\\,4s^2$. No exception here: 4s fills first because $(n+l) = 4$ beats 5. Four unpaired 3d electrons — the sixth had to pair up.' },
  { Z: 29, sym: 'Cu', name: 'Copper',
    cfg: [2, 2, 6, 2, 6, 1, 10, 0],
    trap: [2, 2, 6, 2, 6, 2, 9, 0],
    trapMsg: 'Aufbau alone gives $[\\text{Ar}]3d^9\\,4s^2$, but copper does better than that. What would one more 3d electron buy?',
    note: '$[\\text{Ar}]3d^{10}\\,4s^1$. A **completely filled** d subshell is the other stable arrangement worth a promotion. Copper is left with a single unpaired electron.' }
];

/** Electrons that stay unpaired in a subshell holding `e` of `cap`, by Hund. */
const unpaired = (e, cap) => {
  const orbitals = cap / 2;
  return e <= orbitals ? e : cap - e;
};

export default {
  id: 'configBuilder',

  mount(root, ctx) {
    const cab = arcade(root, {
      title: 'Configuration Builder',
      badge: 'Aufbau · Pauli · Hund',
      hint: 'Click a subshell to send the next electron there. Pairing follows Hund automatically.',
      best: ctx.best ?? null,
      onRestart: start
    });

    let cfg = ORDER.map(() => 0);
    let history = [];
    let idx = 0, score = 0, locked = false;

    const stageBox = h('div');
    cab.stage.appendChild(stageBox);

    const total = () => cfg.reduce((a, b) => a + b, 0);
    const target = () => TARGETS[Math.min(idx, TARGETS.length - 1)];

    /* ------------------------------------------------------------ */
    /* the orbital diagram                                           */

    const view = canvasLayer(stageBox, {
      height: 270,
      animate: false,
      draw(g, w, hgt) {
        const hue = cssVar('--chemistry');
        const ok = cssVar('--ok');
        const accent = cssVar('--accent');
        const ink = cssVar('--ink-4');

        const boxW = 20, boxH = 26, gap = 4, rowH = 84;
        let x = 22, y = 64;

        ORDER.forEach((sub, i) => {
          const boxes = sub.cap / 2;
          const groupW = boxes * boxW + (boxes - 1) * gap;
          if (x + groupW > w - 22) { x = 22; y += rowH; }

          const e = cfg[i];
          const live = e > 0;

          c2d.text(g, sub.id, x + groupW / 2, y - 20,
            { size: 12, weight: 800, color: live ? hue : ink });
          c2d.text(g, `n+l = ${sub.n + sub.l}`, x + groupW / 2, y - 8,
            { size: 8, weight: 700, color: live ? accent : cssVar('--ink-4') });

          for (let b = 0; b < boxes; b++) {
            const bx = x + b * (boxW + gap);
            g.save();
            g.strokeStyle = live ? hue : cssVar('--line');
            g.lineWidth = live ? 1.7 : 1.1;
            g.fillStyle = cssVar('--bg-2');
            c2d.roundRect(g, bx, y, boxW, boxH, 4);
            g.fill(); g.stroke();
            g.restore();
          }

          // Hund: one per box first, then pair.
          for (let k = 0; k < e; k++) {
            const box = k < boxes ? k : k - boxes;
            const second = k >= boxes;
            const bx = x + box * (boxW + gap);
            arrow(g, bx + boxW / 2 + (second ? 4 : -4), y + boxH / 2,
              second ? -1 : 1, second ? accent : ok);
          }

          if (e > 0) {
            c2d.text(g, `${sub.id}${supOf(e)}`, x + groupW / 2, y + boxH + 12,
              { size: 10, weight: 800, color: hue });
          }

          x += groupW + 24;
        });

        /* the running count */
        const t = target();
        const done = total();
        c2d.text(g, `${done} of ${t.Z} electrons placed`, w / 2, 20,
          { size: 12, weight: 800, color: done === t.Z ? ok : cssVar('--ink-3') });
        c2d.text(g, 'lowest (n + l) first · ties broken by lower n', w / 2, 36,
          { size: 9, weight: 700, color: ink });
      }
    });

    const SUPS = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴',
                   5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
    const supOf = (n) => String(n).split('').map((c) => SUPS[c] ?? c).join('');

    function arrow(g, x, y, dir, colour) {
      g.save();
      g.strokeStyle = colour; g.fillStyle = colour; g.lineWidth = 2;
      g.beginPath(); g.moveTo(x, y + dir * 8); g.lineTo(x, y - dir * 8); g.stroke();
      g.beginPath();
      g.moveTo(x, y - dir * 9);
      g.lineTo(x - 3.2, y - dir * 3.5);
      g.lineTo(x + 3.2, y - dir * 3.5);
      g.closePath(); g.fill();
      g.restore();
    }

    /* ------------------------------------------------------------ */
    /* placing an electron                                           */

    function place(i) {
      if (locked) return;
      const sub = ORDER[i];
      const t = target();

      if (cfg[i] >= sub.cap) {
        sfx.wrong();
        note(`**Pauli**: ${sub.id} holds at most ${sub.cap} electrons — ${sub.cap / 2} orbitals, two each with opposite spins. It is full.`);
        return;
      }
      if (total() >= t.Z) {
        sfx.wrong();
        note(`You already have all ${t.Z} electrons placed. Undo one, or press Check.`);
        return;
      }

      cfg[i]++;
      history.push(i);
      sfx.pop();

      // A note on what just happened, chosen from the rule it illustrates.
      const earlier = ORDER.findIndex((s, j) => j < i && cfg[j] < s.cap);
      const boxes = sub.cap / 2;
      if (earlier >= 0) {
        note(`That skips **${ORDER[earlier].id}**, which still has room. Aufbau would fill it first — legal only when a half-filled or filled subshell pays for the promotion.`);
      } else if (cfg[i] > boxes) {
        note(`**Hund**: every ${sub.id} orbital already had one electron, so this one pairs up — opposite spin, shown in the second colour.`);
      } else if (cfg[i] === boxes && boxes > 1) {
        note(`${sub.id} is now **half-filled**: ${boxes} orbitals, one electron each, all spins parallel. Hund’s arrangement.`);
      } else {
        note(`Placed in ${sub.id}. $(n+l) = ${sub.n + sub.l}$.`);
      }

      refresh();
    }

    function undo() {
      if (locked || !history.length) return;
      cfg[history.pop()]--;
      sfx.click();
      refresh();
    }

    /* ------------------------------------------------------------ */
    /* panel                                                         */

    const out = readouts([
      { key: 'z', label: 'target Z', value: '—' },
      { key: 'p', label: 'placed', value: '0' },
      { key: 'c', label: 'configuration', value: '—' },
      { key: 'u', label: 'unpaired', value: '0' }
    ]);

    function configString() {
      const parts = ORDER.map((s, i) => (cfg[i] ? `${s.id}${supOf(cfg[i])}` : null)).filter(Boolean);
      return parts.length ? parts.join(' ') : '—';
    }

    function refresh() {
      const t = target();
      out.set('z', `${t.sym}  (${t.Z})`);
      out.set('p', `${total()} / ${t.Z}`, total() === t.Z ? 'ok' : null);
      out.set('c', configString());
      out.set('u', ORDER.reduce((a, s, i) => a + unpaired(cfg[i], s.cap), 0));
      view.redraw();
      renderButtons();
    }

    const taskBox = h('div.callout.callout--jee', { style: { margin: '0 0 12px' } });
    const pad = h('div');
    const verdict = h('div');
    cab.panel.appendChild(taskBox);
    cab.panel.appendChild(out.root);
    cab.panel.appendChild(pad);
    cab.panel.appendChild(verdict);

    function renderButtons() {
      clear(pad);
      pad.appendChild(h('div.small.muted', { style: { margin: '10px 0 6px', textAlign: 'center' } },
        'Send the next electron to:'));
      const row = h('div.btnbar', { style: { flexWrap: 'wrap', justifyContent: 'center' } });
      ORDER.forEach((s, i) => {
        const full = cfg[i] >= s.cap;
        row.appendChild(btn(`${s.id}  ${cfg[i]}/${s.cap}`, () => place(i),
          { kind: full ? 'ghost' : cfg[i] > 0 ? 'primary' : '' }));
      });
      pad.appendChild(row);
      pad.appendChild(h('div.btnbar', { style: { marginTop: 'var(--sp-4)' } },
        btn('Check configuration', check, { kind: 'primary', size: 'md' }),
        btn('Undo', undo, { kind: 'ghost' }),
        btn('Clear', () => { cfg = ORDER.map(() => 0); history = []; refresh(); }, { kind: 'ghost' })
      ));
    }

    function note(msg) {
      cab.setHint(msg);
    }

    /* ------------------------------------------------------------ */

    function renderTask() {
      clear(taskBox);
      clear(verdict);
      if (idx >= TARGETS.length) {
        taskBox.className = 'callout callout--tip';
        taskBox.appendChild(h('div.callout__label', null, '✓ All six built'));
        taskBox.appendChild(h('div.small', null, renderInline(
          'Three rules, two exceptions, and every configuration in the first four rows falls out. Free play: try zinc ($Z = 30$) and check that 3d fills completely before 4p starts.')));
        return;
      }
      const t = TARGETS[idx];
      taskBox.className = 'callout callout--jee';
      taskBox.appendChild(h('div.callout__label', null, `Element ${idx + 1} / ${TARGETS.length}`));
      taskBox.appendChild(h('div.small', null, renderInline(
        `Build the ground-state configuration of **${t.name}** (${t.sym}, $Z = ${t.Z}$).`)));
      cfg = ORDER.map(() => 0);
      history = [];
      refresh();
    }

    function check() {
      if (locked || idx >= TARGETS.length) return;
      const t = TARGETS[idx];

      if (total() !== t.Z) {
        sfx.wrong();
        clear(verdict);
        verdict.appendChild(verdictLine(false,
          `${t.sym} has ${t.Z} electrons; you have placed ${total()}.`));
        return;
      }

      const same = (a) => a.every((v, i) => v === cfg[i]);

      if (t.trap && same(t.trap)) {
        sfx.wrong();
        clear(verdict);
        verdict.appendChild(verdictLine(false, t.trapMsg));
        return;
      }

      if (!same(t.cfg)) {
        sfx.wrong();
        // Name the first subshell that is wrong; more useful than "incorrect".
        const bad = ORDER.findIndex((s, i) => cfg[i] !== t.cfg[i]);
        clear(verdict);
        verdict.appendChild(verdictLine(false,
          `The count is right but the arrangement is not. Look again at **${ORDER[bad].id}**: you have ${cfg[bad]} there.`));
        return;
      }

      locked = true;
      score += 20;
      cab.setScore(score);
      sfx.levelUp();
      ctx.fx?.burstAt(taskBox, { count: 20 });

      clear(taskBox);
      taskBox.className = 'callout callout--tip';
      taskBox.appendChild(h('div.callout__label', null, `✓ ${t.name}`));
      taskBox.appendChild(h('div.small', null, renderInline(t.note)));
      clear(verdict);
      verdict.appendChild(h('div.btnbar', { style: { marginTop: '10px' } },
        btn(idx === TARGETS.length - 1 ? 'Finish' : 'Next element', () => {
          idx++; locked = false;
          renderTask();
          if (idx >= TARGETS.length) finish();
        }, { kind: 'primary' })));
    }

    function finish() {
      const best = Math.max(ctx.best ?? 0, score);
      cab.setBest(best);
      ctx.report(score, { best, elements: TARGETS.length });
      cab.overlay(cleared(score, best, start));
    }

    function start() {
      cab.clearOverlay();
      score = 0; idx = 0; locked = false;
      cab.setScore(0);
      renderTask();
    }

    start();
    return { destroy() { view.stop(); } };
  }
};
