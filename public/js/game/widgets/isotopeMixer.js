/**
 * Isotope Separator - tune abundances until the mass spectrum matches a real
 * element's average atomic mass.
 *
 * Teaches: why periodic-table masses are fractional, and the back-calculation
 * (given the average, find the abundance) that JEE actually asks.
 */

import { h, clear } from '../../core/dom.js';
import { renderInline, renderMath } from '../../core/mathlite.js';
import { sfx } from '../../core/audio.js';
import { arcade, canvasLayer, cssVar, c2d, slider, readouts, btn, cleared, shuffle, clamp } from '../kit.js';

const ELEMENTS = [
  {
    sym: 'Cl', name: 'Chlorine', average: 35.45,
    isotopes: [{ a: 35, m: 34.97 }, { a: 37, m: 36.97 }],
    truth: [75.77, 24.23],
    note: 'Three-quarters chlorine-35. No chlorine atom weighs 35.45 — the number is a population average.'
  },
  {
    sym: 'B', name: 'Boron', average: 10.81,
    isotopes: [{ a: 10, m: 10.013 }, { a: 11, m: 11.009 }],
    truth: [19.9, 80.1],
    note: 'The classic JEE back-calculation: $10x + 11(1-x) = 10.8 \\Rightarrow x = 0.2$.'
  },
  {
    sym: 'Cu', name: 'Copper', average: 63.55,
    isotopes: [{ a: 63, m: 62.930 }, { a: 65, m: 64.928 }],
    truth: [69.2, 30.8],
    note: 'Copper-63 is the more abundant, which is why the average sits well below 64.'
  },
  {
    sym: 'Br', name: 'Bromine', average: 79.90,
    isotopes: [{ a: 79, m: 78.918 }, { a: 81, m: 80.916 }],
    truth: [50.7, 49.3],
    note: 'Almost a 50:50 split — which is why bromine-containing molecules give famous twin peaks in mass spectra.'
  },
  {
    sym: 'Mg', name: 'Magnesium', average: 24.31,
    isotopes: [{ a: 24, m: 23.985 }, { a: 25, m: 24.986 }, { a: 26, m: 25.983 }],
    truth: [78.99, 10.00, 11.01],
    note: 'Three isotopes. The average still sits close to 24 because that isotope dominates.'
  }
];

export default {
  id: 'isotopeMixer',

  mount(root, ctx) {
    const cab = arcade(root, {
      title: 'Isotope Separator',
      badge: 'Mass spectrometer',
      hint: 'Drag the abundances until the computed average matches the target.',
      best: ctx.best ?? null,
      onRestart: start
    });

    let queue = [], el = null, pcts = [], score = 0, solved = 0, locked = false;

    const stageBox = h('div', { style: { padding: '12px 12px 0' } });
    cab.stage.appendChild(stageBox);

    const view = canvasLayer(stageBox, {
      height: 200,
      draw(g, w, hgt) {
        if (!el) return;
        const hue = cssVar('--hue') || cssVar('--chemistry');
        const padL = 40, padB = 34, padT = 18;
        const plotW = w - padL - 18, plotH = hgt - padB - padT;

        // axes
        c2d.line(g, padL, padT, padL, padT + plotH, { color: cssVar('--line'), width: 1 });
        c2d.line(g, padL, padT + plotH, padL + plotW, padT + plotH, { color: cssVar('--line'), width: 1 });
        for (let i = 0; i <= 4; i++) {
          const y = padT + plotH - (plotH * i) / 4;
          c2d.text(g, `${i * 25}%`, padL - 6, y, { size: 9, align: 'right', color: cssVar('--ink-4') });
        }

        // peaks
        const n = el.isotopes.length;
        const slotW = plotW / n;
        const bw = Math.min(46, slotW * 0.44);

        el.isotopes.forEach((iso, i) => {
          const x = padL + slotW * (i + 0.5) - bw / 2;
          const bh = (pcts[i] / 100) * plotH;
          g.fillStyle = hue;
          c2d.roundRect(g, x, padT + plotH - bh, bw, Math.max(2, bh), 4);
          g.fill();
          c2d.text(g, `${pcts[i].toFixed(1)}%`, x + bw / 2, padT + plotH - bh - 9,
            { size: 10, weight: 800, color: hue });
          c2d.text(g, `${iso.a}`, x + bw / 2, padT + plotH + 13, { size: 12, weight: 800, color: cssVar('--ink-1') });
          c2d.text(g, `${el.sym}`, x + bw / 2, padT + plotH + 26, { size: 10, color: cssVar('--ink-4') });
        });

        // the computed average, drawn as a marker on the mass axis
        const avg = average();
        const lo = el.isotopes[0].a - 1, hi = el.isotopes[n - 1].a + 1;
        const ax = padL + ((avg - lo) / (hi - lo)) * plotW;
        c2d.line(g, ax, padT, ax, padT + plotH, { color: cssVar('--accent'), width: 2, dash: [4, 4] });
        c2d.text(g, avg.toFixed(2), ax, padT - 6, { size: 11, weight: 900, color: cssVar('--accent') });

        c2d.text(g, 'mass / u →', padL + plotW, hgt - 6, { size: 9, align: 'right', color: cssVar('--ink-4') });
      }
    });

    /* ---------------- panel ---------------- */

    const out = readouts([
      { key: 'avg', label: 'computed average', value: '—' },
      { key: 'target', label: 'target', value: '—' },
      { key: 'gap', label: 'difference', value: '—' },
      { key: 'sum', label: 'abundances sum', value: '100%' }
    ]);

    const head = h('div', { style: { marginBottom: '12px' } });
    const sliderBox = h('div', { style: { display: 'grid', gap: '14px', marginTop: '14px' } });
    const resultBox = h('div');

    cab.panel.appendChild(head);
    cab.panel.appendChild(out.root);
    cab.panel.appendChild(sliderBox);
    cab.panel.appendChild(resultBox);

    const average = () =>
      el.isotopes.reduce((a, iso, i) => a + iso.m * (pcts[i] / 100), 0);

    function refresh() {
      const avg = average();
      const gap = Math.abs(avg - el.average);
      out.set('avg', avg.toFixed(3) + ' u', gap < 0.02 ? 'ok' : null);
      out.set('target', el.average.toFixed(2) + ' u');
      out.set('gap', (avg - el.average >= 0 ? '+' : '') + (avg - el.average).toFixed(3), gap < 0.02 ? 'ok' : gap < 0.2 ? null : 'bad');
      out.set('sum', pcts.reduce((a, b) => a + b, 0).toFixed(1) + '%');
      view.redraw();

      if (!locked && gap < 0.02) win();
      else if (!locked) {
        cab.setHint(avg > el.average
          ? 'Too heavy — shift abundance toward the **lighter** isotope.'
          : 'Too light — shift abundance toward the **heavier** isotope.');
      }
    }

    /**
     * Abundances must always sum to 100, so moving one slider redistributes
     * the remainder across the others in proportion. This is what makes the
     * multi-isotope case tractable.
     */
    function setPct(i, v) {
      const others = pcts.map((p, j) => (j === i ? 0 : p));
      const otherSum = others.reduce((a, b) => a + b, 0);
      pcts[i] = clamp(v, 0, 100);
      const remain = 100 - pcts[i];
      if (otherSum === 0) {
        const share = remain / (pcts.length - 1);
        pcts = pcts.map((p, j) => (j === i ? pcts[i] : share));
      } else {
        pcts = pcts.map((p, j) => (j === i ? pcts[i] : (others[j] / otherSum) * remain));
      }
      sliders.forEach((s, j) => { if (j !== i) s.set(Number(pcts[j].toFixed(1))); });
      refresh();
    }

    let sliders = [];

    function render() {
      locked = false;
      clear(head); clear(sliderBox); clear(resultBox);

      head.appendChild(h('div.tiny.dim', null, 'IDENTIFY THE MIXTURE'));
      head.appendChild(h('div', { style: { fontSize: '1.15rem', fontWeight: '750' } },
        `${el.name} (${el.sym}) — average atomic mass ${el.average.toFixed(2)} u`));
      head.appendChild(h('div.small.muted', null, renderInline(
        `Set the natural abundances of the ${el.isotopes.length} isotopes so the weighted mean comes out right.`)));

      sliders = el.isotopes.map((iso, i) =>
        slider({
          label: `${iso.a}${el.sym}  (${iso.m} u)`,
          min: 0, max: 100, step: 0.1, value: Number(pcts[i].toFixed(1)), unit: '%',
          fmt: (v) => v.toFixed(1),
          onInput: (v) => setPct(i, v)
        }));
      sliders.forEach((s) => sliderBox.appendChild(s.root));

      refresh();
    }

    function win() {
      locked = true;
      solved++;
      score += 30;
      cab.setScore(score);
      sfx.levelUp();
      ctx.fx?.burstAt(view.canvas, { count: 24 });

      clear(resultBox);
      resultBox.appendChild(h('div.verdict.verdict--ok', { style: { marginTop: '14px' } },
        h('div.verdict__head', null, `✓ ${el.name} identified`),
        h('div.verdict__body', null,
          h('p.small', null, renderInline(
            `True abundances: ${el.isotopes.map((iso, i) => `**${iso.a}${el.sym} ${el.truth[i]}%**`).join(', ')}.`)),
          renderMath(
            `\\bar{A} = ${el.isotopes.map((iso, i) => `${iso.m}\\times\\frac{${el.truth[i]}}{100}`).join(' + ')} = ${el.average}`,
            { display: true }),
          h('p.small', null, renderInline(el.note))
        )));
      resultBox.appendChild(h('div.btnbar', { style: { marginTop: '12px' } },
        btn(queue.length ? 'Next element' : 'Finish', next, { kind: 'primary', size: 'md' })));
    }

    function next() {
      if (!queue.length) return finish();
      el = queue.shift();
      pcts = el.isotopes.map(() => 100 / el.isotopes.length);
      render();
    }

    function finish() {
      const best = Math.max(ctx.best ?? 0, score);
      cab.setBest(best);
      ctx.report(score, { best, elements: solved });
      cab.overlay(cleared(score, best, start, h('p.small.muted', null, `${solved} elements separated.`)));
    }

    function start() {
      cab.clearOverlay();
      queue = shuffle(ELEMENTS).slice(0, 4);
      score = 0; solved = 0;
      cab.setScore(0);
      next();
    }

    start();
    return { destroy() { view.stop(); } };
  }
};
