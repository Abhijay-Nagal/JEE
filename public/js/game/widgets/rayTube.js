/**
 * Discharge Tube - repeat Thomson's measurement rather than memorise it.
 *
 * The beam is deflected up by the plates and down by the magnet. Null the two
 * against each other and the speed falls out: v = E/B. Switch the magnet off,
 * read the deflection, and e/m follows. Nothing here is a lookup - the learner
 * balances the fields and the number appears.
 */

import { h, clear } from '../../core/dom.js';
import { renderInline } from '../../core/mathlite.js';
import { sfx } from '../../core/audio.js';
import { arcade, canvasLayer, cssVar, c2d, slider, readouts, btn, choices,
         verdictLine, cleared, clamp, sci, pick, rng } from '../kit.js';

/* Tube geometry, in metres. */
const D_PLATE = 0.02;     // plate separation
const L_PLATE = 0.05;     // plate length
const D_SCREEN = 0.20;    // plates to screen
const EM_TRUE = 1.7588e11;

/** Beam speeds the tube might be running at, in m/s. */
const SPEEDS = [1.5e7, 2.0e7, 2.5e7, 3.0e7];

export default {
  id: 'rayTube',

  mount(root, ctx) {
    const cab = arcade(root, {
      title: 'Discharge Tube',
      badge: 'Thomson, 1897',
      hint: 'The plates push the beam up; the magnet pushes it down. Find the setting where they cancel.',
      best: ctx.best ?? null,
      onRestart: start
    });

    const r = rng(Date.now());
    let v0 = pick(SPEEDS, r);      // the unknown the learner is hunting
    let magnetOn = true;
    let score = 0, stage = 0, locked = false;

    const stageBox = h('div');
    cab.stage.appendChild(stageBox);

    /* ------------------------------------------------------------ */
    /* physics                                                       */

    const E = () => volts.get() / D_PLATE;                 // V/m
    const B = () => (magnetOn ? bfield.get() * 1e-4 : 0);  // slider is in 0.1 mT

    /** Net transverse deflection at the screen, in metres. */
    function deflection() {
      const a = EM_TRUE * (E() - v0 * B());
      return (a * L_PLATE * (L_PLATE / 2 + D_SCREEN)) / (v0 * v0);
    }

    /* ------------------------------------------------------------ */
    /* the tube                                                      */

    const view = canvasLayer(stageBox, {
      height: 230,
      animate: true,
      draw(g, w, hgt) {
        const hue = cssVar('--chemistry');
        const mid = hgt / 2;
        const x0 = 26, xPlate = w * 0.3, xPlateEnd = w * 0.52, xScreen = w - 34;

        /* glass envelope */
        g.save();
        g.strokeStyle = cssVar('--line'); g.lineWidth = 1.4;
        c2d.roundRect(g, 14, 22, w - 28, hgt - 44, 14); g.stroke();
        g.restore();

        /* cathode and anode */
        c2d.line(g, x0, mid - 22, x0, mid + 22, { color: cssVar('--bad'), width: 4 });
        c2d.text(g, 'cathode', x0, mid + 36, { size: 9, weight: 700, color: cssVar('--ink-4') });
        c2d.line(g, x0 + 34, mid - 18, x0 + 34, mid + 18, { color: cssVar('--ok'), width: 3 });

        /* plates */
        const plateY = 30;
        c2d.line(g, xPlate, mid - plateY, xPlateEnd, mid - plateY, { color: cssVar('--chart-1'), width: 5 });
        c2d.line(g, xPlate, mid + plateY, xPlateEnd, mid + plateY, { color: cssVar('--chart-1'), width: 5 });
        c2d.text(g, '+', (xPlate + xPlateEnd) / 2, mid + plateY + 12,
          { size: 13, weight: 900, color: cssVar('--chart-1') });
        c2d.text(g, '−', (xPlate + xPlateEnd) / 2, mid - plateY - 12,
          { size: 13, weight: 900, color: cssVar('--chart-1') });

        /* magnet region */
        if (magnetOn && bfield.get() > 0) {
          g.save();
          g.globalAlpha = 0.14 + Math.min(0.2, bfield.get() / 120);
          g.fillStyle = cssVar('--chart-3');
          c2d.roundRect(g, xPlate, mid - plateY, xPlateEnd - xPlate, plateY * 2, 6);
          g.fill();
          g.restore();
          for (let i = 0; i < 4; i++) {
            const dx = xPlate + 10 + i * ((xPlateEnd - xPlate - 20) / 3);
            for (let j = 0; j < 3; j++) {
              const dy = mid - 16 + j * 16;
              g.fillStyle = cssVar('--chart-3');
              g.beginPath(); g.arc(dx, dy, 1.8, 0, Math.PI * 2); g.fill();
            }
          }
          c2d.text(g, 'B into page', (xPlate + xPlateEnd) / 2, mid - plateY - 26,
            { size: 9, weight: 700, color: cssVar('--chart-3') });
        }

        /* screen */
        g.save();
        g.fillStyle = cssVar('--bg-0');
        c2d.roundRect(g, xScreen - 6, 30, 12, hgt - 60, 3); g.fill();
        g.strokeStyle = cssVar('--line'); g.lineWidth = 1; g.stroke();
        g.restore();

        /* the beam. 1 cm of real deflection maps to 12 px. */
        const yScreen = clamp(deflection() * 100 * 12, -(hgt / 2 - 38), hgt / 2 - 38);
        const undeflected = Math.abs(deflection()) < 0.002;

        g.save();
        g.strokeStyle = undeflected ? cssVar('--ok') : hue;
        g.lineWidth = 2.6;
        g.lineJoin = 'round';
        g.beginPath();
        g.moveTo(x0, mid);
        g.lineTo(xPlate, mid);
        // inside the plates the path is parabolic
        const nSeg = 18;
        for (let i = 1; i <= nSeg; i++) {
          const u = i / nSeg;
          const x = xPlate + u * (xPlateEnd - xPlate);
          // deflection inside the plates grows as u^2 and is a fraction of the total
          const frac = (L_PLATE / 2) / (L_PLATE / 2 + D_SCREEN);
          g.lineTo(x, mid - yScreen * frac * u * u);
        }
        g.lineTo(xScreen - 6, mid - yScreen);
        g.stroke();
        g.restore();

        /* the spot */
        g.fillStyle = undeflected ? cssVar('--ok') : hue;
        g.beginPath(); g.arc(xScreen - 6, mid - yScreen, 5.5, 0, Math.PI * 2); g.fill();
        g.save();
        g.globalAlpha = 0.28;
        g.beginPath(); g.arc(xScreen - 6, mid - yScreen, 12, 0, Math.PI * 2); g.fill();
        g.restore();

        /* the undeflected reference line */
        c2d.line(g, x0, mid, xScreen - 6, mid,
          { color: cssVar('--ink-4'), width: 1, dash: [3, 5] });

        if (undeflected) {
          c2d.text(g, 'beam undeflected ✓', w / 2, hgt - 16,
            { size: 12, weight: 800, color: cssVar('--ok') });
        } else {
          c2d.text(g, `deflection ${(deflection() * 100).toFixed(2)} cm ${deflection() > 0 ? 'up' : 'down'}`,
            w / 2, hgt - 16, { size: 11, weight: 700, color: cssVar('--ink-3') });
        }
      }
    });

    /* ------------------------------------------------------------ */
    /* controls                                                      */

    const out = readouts([
      { key: 'E', label: 'E field (V m⁻¹)', value: '—' },
      { key: 'B', label: 'B field (T)', value: '—' },
      { key: 'y', label: 'deflection (cm)', value: '—' },
      { key: 'v', label: 'v = E/B', value: '—' }
    ]);

    function refresh() {
      out.set('E', sci(E(), 3));
      out.set('B', magnetOn ? sci(B(), 3) : 'off');
      const y = deflection() * 100;
      out.set('y', y.toFixed(2), Math.abs(y) < 0.2 ? 'ok' : null);
      out.set('v', magnetOn && B() > 0 ? sci(E() / B(), 3) : '—');
    }

    const volts = slider({
      label: 'Plate voltage', min: 50, max: 600, step: 5, value: 200, unit: ' V',
      onInput: refresh
    });

    const bfield = slider({
      label: 'Magnet current → B', min: 0, max: 120, step: 1, value: 0,
      unit: ' mT', fmt: (x) => (x / 10).toFixed(1), onInput: refresh
    });

    const taskBox = h('div.callout.callout--jee', { style: { margin: '0 0 12px' } });
    const answerBox = h('div');
    const controls = h('div');
    cab.panel.appendChild(taskBox);
    cab.panel.appendChild(out.root);
    cab.panel.appendChild(controls);
    cab.panel.appendChild(answerBox);

    function renderControls() {
      clear(controls);
      controls.appendChild(volts.root);
      controls.appendChild(bfield.root);
      controls.appendChild(h('div.btnbar', { style: { marginTop: 'var(--sp-4)' } },
        btn(magnetOn ? '● Magnet ON' : '○ Magnet OFF',
          () => { magnetOn = !magnetOn; refresh(); renderControls(); },
          { kind: magnetOn ? 'primary' : 'ghost' }),
        btn('Check', check, { kind: 'primary', size: 'md' })
      ));
    }

    /* ------------------------------------------------------------ */
    /* the three stages                                              */

    function emOptions() {
      const truth = EM_TRUE;
      return [
        { label: `$${sci(truth / 100, 3)}$ C kg$^{-1}$`, value: 'x100' },
        { label: `$${sci(truth, 3)}$ C kg$^{-1}$`, value: 'ok' },
        { label: `$${sci(truth * 100, 3)}$ C kg$^{-1}$`, value: 'x001' },
        { label: `$${sci(1.602e-19, 3)}$ C kg$^{-1}$`, value: 'charge' }
      ];
    }

    const STAGES = [
      {
        text: 'The magnet is on. **Null the beam** — adjust the plate voltage and the field until the spot sits exactly on the axis.',
        kind: 'dial',
        ok: () => magnetOn && B() > 0 && Math.abs(deflection()) < 0.002,
        note: 'At balance the electric and magnetic forces are equal: $eE = evB$. The charge cancels, leaving $v = E/B$ — the beam speed, measured without knowing anything about the particle.'
      },
      {
        text: 'Keeping the balance, read off the beam speed from $v = E/B$. Which value is it?',
        kind: 'choose',
        opts: () => {
          const truth = E() / (B() || 1);
          return [
            { label: `$${sci(truth, 3)}$ m s$^{-1}$`, value: 'ok' },
            { label: `$${sci(truth / 10, 3)}$ m s$^{-1}$`, value: 'a' },
            { label: `$${sci(truth * 10, 3)}$ m s$^{-1}$`, value: 'b' },
            { label: `$3.00\\times10^{8}$ m s$^{-1}$`, value: 'c' }
          ];
        },
        note: 'About a tenth of the speed of light — fast, but not relativistic. Notice that nothing about this number required knowing the particle’s charge or mass.'
      },
      {
        text: 'Now **switch the magnet off** and let the plates deflect the beam alone. The deflection gives $e/m$. Which value does this tube report?',
        kind: 'choose',
        needs: () => !magnetOn && Math.abs(deflection()) > 0.005,
        needsMsg: 'Switch the magnet off first, and keep the plate voltage high enough to give a measurable deflection.',
        opts: emOptions,
        note: 'From $y = \\dfrac{e}{m}\\dfrac{EL(L/2+D)}{v^2}$ we get $e/m = 1.76\\times10^{11}$ C kg$^{-1}$ — over a thousand times the value for a hydrogen ion. Thomson’s conclusion: either the charge is enormous or the mass is tiny. It was the mass.'
      }
    ];

    function renderStage() {
      clear(taskBox);
      clear(answerBox);
      if (stage >= STAGES.length) {
        taskBox.className = 'callout callout--tip';
        taskBox.appendChild(h('div.callout__label', null, '✓ Tube calibrated'));
        taskBox.appendChild(h('div.small', null, renderInline(
          'You measured $e/m$ without ever seeing an electron. Free play: change the beam speed with the restart button and repeat.')));
        return;
      }
      const s = STAGES[stage];
      taskBox.className = 'callout callout--jee';
      taskBox.appendChild(h('div.callout__label', null, `Step ${stage + 1} / ${STAGES.length}`));
      taskBox.appendChild(h('div.small', null, renderInline(s.text)));

      if (s.kind === 'choose') {
        answerBox.appendChild(h('div.small.muted', { style: { margin: '10px 0 6px' } },
          'Pick the value:'));
        answerBox.appendChild(choices(s.opts(), (val) => {
          if (locked) return;
          if (s.needs && !s.needs()) { cab.setHint(s.needsMsg); sfx.wrong(); return; }
          val === 'ok' ? win(s) : miss();
        }));
      }
    }

    function check() {
      if (locked || stage >= STAGES.length) return;
      const s = STAGES[stage];
      if (s.kind !== 'dial') { cab.setHint('Choose one of the values below.'); return; }
      s.ok() ? win(s) : miss();
    }

    function miss() {
      sfx.wrong();
      cab.setHint('Not yet. Watch the spot on the screen, not the sliders.');
    }

    function win(s) {
      locked = true;
      score += 30;
      cab.setScore(score);
      sfx.levelUp();
      ctx.fx?.burstAt(taskBox, { count: 18 });

      clear(taskBox);
      taskBox.className = 'callout callout--tip';
      taskBox.appendChild(h('div.callout__label', null, '✓ Correct'));
      taskBox.appendChild(h('div.small', null, renderInline(s.note)));
      clear(answerBox);
      answerBox.appendChild(h('div.btnbar', { style: { marginTop: '10px' } },
        btn(stage === STAGES.length - 1 ? 'Finish' : 'Next step', () => {
          stage++; locked = false;
          renderStage();
          if (stage >= STAGES.length) finish();
        }, { kind: 'primary' })));
    }

    function finish() {
      const best = Math.max(ctx.best ?? 0, score);
      cab.setBest(best);
      ctx.report(score, { best, stages: stage });
      cab.overlay(cleared(score, best, start));
    }

    function start() {
      cab.clearOverlay();
      score = 0; stage = 0; locked = false; magnetOn = true;
      v0 = pick(SPEEDS, r);
      cab.setScore(0);
      volts.set(200); bfield.set(0);
      refresh();
      renderControls();
      renderStage();
    }

    start();
    return { destroy() { view.stop(); } };
  }
};
