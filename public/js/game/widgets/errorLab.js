/**
 * Precision Range - separate accuracy from precision by feel.
 *
 * Two sliders control the two kinds of error independently: a systematic bias
 * that shifts every shot the same way, and a random spread that scatters them.
 * The learner is then given missions that are only achievable by understanding
 * which knob does what.
 *
 * Teaches: accuracy vs precision, systematic vs random error, and the
 * sqrt(n) shrinking of the standard error of the mean.
 */

import { h, clear } from '../../core/dom.js';
import { renderInline } from '../../core/mathlite.js';
import { sfx } from '../../core/audio.js';
import { arcade, canvasLayer, cssVar, c2d, slider, readouts, btn, cleared, round } from '../kit.js';

const gauss = () => {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

const MISSIONS = [
  {
    id: 'both',
    text: 'Fire a group that is **both accurate and precise** — the goal of every experiment.',
    test: (s) => s.bias < 0.12 && s.spread < 0.12,
    note: 'Tight cluster, centred on truth. Nothing to fix.'
  },
  {
    id: 'precise-only',
    text: 'Fire a group that is **precise but not accurate** — the signature of a zero error.',
    test: (s) => s.spread < 0.16 && s.bias > 0.45,
    note: 'Every shot agrees with every other shot, and they are all wrong together. Averaging more readings will not help at all — only recalibration will.'
  },
  {
    id: 'accurate-only',
    text: 'Fire a group that is **accurate but not precise** — sloppy readings, honest instrument.',
    test: (s) => s.bias < 0.18 && s.spread > 0.45,
    note: 'The shots scatter, but they scatter *around the truth*. This is the error that averaging fixes: take more readings and the mean converges.'
  },
  {
    id: 'neither',
    text: 'Fire a group that is **neither** — the worst case, and surprisingly common in a rushed lab.',
    test: (s) => s.bias > 0.45 && s.spread > 0.45,
    note: 'Both problems at once. Fix the systematic error first: until the instrument is calibrated, extra readings only give you a more confident wrong answer.'
  }
];

export default {
  id: 'errorLab',

  mount(root, ctx) {
    const cab = arcade(root, {
      title: 'Precision Range',
      badge: 'Accuracy vs precision',
      hint: 'Bias moves the whole group. Spread scatters it. They are independent.',
      best: ctx.best ?? null,
      onRestart: start
    });

    let shots = [];          // {x, y}
    let biasAng = Math.PI * 0.2;
    let score = 0, missionIdx = 0, done = [];

    const stats = { bias: 0, spread: 0, meanAbs: 0, pct: 0, mean: 0 };
    const TRUE = 10.00;      // "true length" in cm, used for the numeric table

    /* ---------------- canvas target ---------------- */
    const wrap = h('div', { style: { display: 'grid', gridTemplateColumns: 'minmax(0,260px) minmax(0,1fr)', gap: '16px', padding: '16px' } });
    cab.stage.appendChild(wrap);

    const targetBox = h('div');
    const sideBox = h('div');
    wrap.appendChild(targetBox);
    wrap.appendChild(sideBox);

    const view = canvasLayer(targetBox, {
      aspect: 1,
      animate: true,
      draw(g, w, hgt, t) {
        const cx = w / 2, cy = hgt / 2, R = Math.min(w, hgt) / 2 - 8;

        // rings
        for (let i = 5; i >= 1; i--) {
          g.beginPath();
          g.arc(cx, cy, (R * i) / 5, 0, Math.PI * 2);
          g.fillStyle = i % 2 ? cssVar('--bg-2') : cssVar('--bg-3');
          g.fill();
          g.strokeStyle = cssVar('--line-soft');
          g.lineWidth = 1;
          g.stroke();
        }
        g.beginPath(); g.arc(cx, cy, R / 5 * 0.55, 0, Math.PI * 2);
        g.fillStyle = cssVar('--bad'); g.fill();

        c2d.line(g, cx - R, cy, cx + R, cy, { color: cssVar('--line'), width: 1, dash: [3, 4] });
        c2d.line(g, cx, cy - R, cx, cy + R, { color: cssVar('--line'), width: 1, dash: [3, 4] });

        // shots
        const hue = cssVar('--hue') || cssVar('--primary');
        shots.forEach((s, i) => {
          const age = Math.min(1, (t - s.born) * 5);
          if (age <= 0) return;
          const px = cx + s.x * R, py = cy + s.y * R;
          g.save();
          g.globalAlpha = 0.85;
          g.fillStyle = hue;
          g.beginPath();
          g.arc(px, py, 4.5 * age, 0, Math.PI * 2);
          g.fill();
          g.restore();
        });

        // centroid marker
        if (shots.length > 2) {
          const mx = shots.reduce((a, s) => a + s.x, 0) / shots.length;
          const my = shots.reduce((a, s) => a + s.y, 0) / shots.length;
          const px = cx + mx * R, py = cy + my * R;
          g.save();
          g.strokeStyle = cssVar('--accent'); g.lineWidth = 2;
          g.beginPath(); g.arc(px, py, 10, 0, Math.PI * 2); g.stroke();
          c2d.line(g, px - 14, py, px + 14, py, { color: cssVar('--accent'), width: 2 });
          c2d.line(g, px, py - 14, px, py + 14, { color: cssVar('--accent'), width: 2 });
          g.restore();
          c2d.text(g, 'mean', px, py - 20, { size: 10, weight: 800, color: cssVar('--accent') });
        }

        c2d.text(g, 'TRUE VALUE', cx, cy + R + 0, { size: 9, weight: 800, color: cssVar('--ink-4') });
      }
    });

    /* ---------------- controls ---------------- */

    const out = readouts([
      { key: 'acc', label: 'accuracy (bias)', value: '—' },
      { key: 'prec', label: 'precision (spread)', value: '—' },
      { key: 'mean', label: 'mean reading', value: '—' },
      { key: 'mae', label: 'mean abs error', value: '—' },
      { key: 'pct', label: '% error', value: '—' },
      { key: 'sem', label: 'error in mean', value: '—' }
    ]);

    const biasSlider = slider({
      label: 'Systematic bias (zero error)', min: 0, max: 100, value: 15,
      fmt: (v) => (v / 100).toFixed(2), onInput: () => { }
    });
    const spreadSlider = slider({
      label: 'Random spread (technique)', min: 0, max: 100, value: 35,
      fmt: (v) => (v / 100).toFixed(2), onInput: () => { }
    });

    const missionBox = h('div.callout.callout--jee', { style: { margin: '0 0 12px' } });
    const verdictBox = h('div');

    sideBox.appendChild(missionBox);
    sideBox.appendChild(out.root);
    sideBox.appendChild(h('div', { style: { marginTop: '14px', display: 'grid', gap: '14px' } },
      biasSlider.root, spreadSlider.root));
    sideBox.appendChild(h('div.btnbar', { style: { marginTop: '14px' } },
      btn('Fire 20 readings', () => fire(20), { kind: 'primary' }),
      btn('Fire 100', () => fire(100)),
      btn('Clear', () => { shots = []; recompute(); })
    ));
    sideBox.appendChild(verdictBox);

    /* ---------------- simulation ---------------- */

    function fire(n) {
      const bias = biasSlider.get() / 100;
      const spread = spreadSlider.get() / 100;
      const now = performance.now() / 1000;
      for (let i = 0; i < n; i++) {
        shots.push({
          x: Math.cos(biasAng) * bias + gauss() * spread * 0.32,
          y: Math.sin(biasAng) * bias + gauss() * spread * 0.32,
          born: now + i * 0.012
        });
      }
      if (shots.length > 220) shots = shots.slice(-220);
      sfx.pop();
      recompute();
      checkMission();
    }

    function recompute() {
      if (!shots.length) {
        for (const k of ['acc', 'prec', 'mean', 'mae', 'pct', 'sem']) out.set(k, '—');
        return;
      }
      const n = shots.length;
      const mx = shots.reduce((a, s) => a + s.x, 0) / n;
      const my = shots.reduce((a, s) => a + s.y, 0) / n;

      stats.bias = Math.hypot(mx, my);
      stats.spread = Math.sqrt(shots.reduce((a, s) => a + (s.x - mx) ** 2 + (s.y - my) ** 2, 0) / n);

      // Numeric view: interpret the horizontal coordinate as a length reading.
      const readings = shots.map((s) => TRUE + s.x * 2);
      stats.mean = readings.reduce((a, v) => a + v, 0) / n;
      stats.meanAbs = readings.reduce((a, v) => a + Math.abs(v - stats.mean), 0) / n;
      stats.pct = (stats.meanAbs / stats.mean) * 100;
      const sem = stats.meanAbs / Math.sqrt(n);

      out.set('acc', round(stats.bias, 3), stats.bias < 0.15 ? 'ok' : 'bad');
      out.set('prec', round(stats.spread, 3), stats.spread < 0.15 ? 'ok' : 'bad');
      out.set('mean', stats.mean.toFixed(3) + ' cm');
      out.set('mae', '±' + stats.meanAbs.toFixed(3));
      out.set('pct', stats.pct.toFixed(2) + '%');
      out.set('sem', '±' + sem.toFixed(4));

      cab.setHint(
        `${n} readings. True value 10.000 cm; your mean is ${stats.mean.toFixed(3)} cm. ` +
        (stats.bias > 0.2
          ? 'The gap between those two is your **systematic** error — more readings will not close it.'
          : 'The mean is close to truth; the spread is **random** error, and it shrinks as $1/\\sqrt{n}$.')
      );
    }

    /* ---------------- missions ---------------- */

    function renderMission() {
      clear(missionBox);
      if (missionIdx >= MISSIONS.length) {
        missionBox.appendChild(h('div.callout__label', null, '✓ All missions complete'));
        missionBox.appendChild(h('div.small', null, 'Experiment freely — try 100 readings and watch the error in the mean.'));
        return;
      }
      const m = MISSIONS[missionIdx];
      missionBox.appendChild(h('div.callout__label', null, `Mission ${missionIdx + 1} / ${MISSIONS.length}`));
      missionBox.appendChild(h('div.small', null, renderInline(m.text)));
    }

    function checkMission() {
      if (missionIdx >= MISSIONS.length || shots.length < 12) return;
      const m = MISSIONS[missionIdx];
      if (!m.test(stats)) return;

      done.push(m.id);
      score += 25;
      cab.setScore(score);
      sfx.levelUp();
      ctx.fx?.burstAt(missionBox, { count: 20 });

      clear(verdictBox);
      verdictBox.appendChild(h('div.verdict.verdict--ok', { style: { marginTop: '12px' } },
        h('div.verdict__head', null, '✓ Mission complete'),
        h('div.verdict__body.small', null, renderInline(m.note))));

      missionIdx++;
      renderMission();
      if (missionIdx >= MISSIONS.length) finish();
    }

    function finish() {
      const best = Math.max(ctx.best ?? 0, score);
      cab.setBest(best);
      ctx.report(score, { best, missions: done.length });
    }

    function start() {
      cab.clearOverlay();
      shots = []; score = 0; missionIdx = 0; done = [];
      biasAng = Math.random() * Math.PI * 2;
      cab.setScore(0);
      clear(verdictBox);
      renderMission();
      recompute();
    }

    start();
    return { destroy() { view.stop(); } };
  }
};
