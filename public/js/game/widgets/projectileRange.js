/**
 * Launch Range - hit targets, and discover the complementary-angle pairs.
 *
 * The scoring rewards finding *both* angles that reach a target, which is the
 * fact the exam tests and the one nobody believes until they have done it.
 * A live trace of R against theta builds up across attempts.
 */

import { h, clear } from '../../core/dom.js';
import { renderInline, renderMath } from '../../core/mathlite.js';
import { sfx } from '../../core/audio.js';
import { arcade, canvasLayer, cssVar, c2d, slider, readouts, btn, ground, clamp, round } from '../kit.js';

const G = 10;

export default {
  id: 'projectileRange',

  mount(root, ctx) {
    const cab = arcade(root, {
      title: 'Launch Range',
      badge: 'Projectiles',
      hint: 'Set the angle and speed, then fire. Every target can be hit two ways.',
      best: ctx.best ?? null,
      onRestart: start
    });

    const st = { ang: 45, u: 25, flying: false, t: 0, trail: [], target: 40, hitAngles: [], shots: 0 };
    let score = 0, round_ = 0, doubles = 0;
    const history = [];           // {ang, range}

    const stageBox = h('div');
    cab.stage.appendChild(stageBox);

    /* ---------------- the range ---------------- */
    const view = canvasLayer(stageBox, {
      height: 250,
      animate: true,
      draw(g, w, hgt) {
        const hue = cssVar('--physics');
        const accent = cssVar('--accent');
        const baseY = hgt - 34;
        const maxR = 70;
        const S = (w - 60) / maxR;
        const X = (m) => 30 + m * S;
        const Y = (m) => baseY - m * S;

        ground(g, 14, w - 14, baseY);

        // distance ticks
        for (let m = 0; m <= maxR; m += 10) {
          c2d.line(g, X(m), baseY, X(m), baseY + 6, { color: cssVar('--line'), width: 1 });
          c2d.text(g, String(m), X(m), baseY + 16, { size: 9, color: cssVar('--ink-4') });
        }

        // the target
        const tx = X(st.target);
        g.fillStyle = cssVar('--bad');
        c2d.roundRect(g, tx - 10, baseY - 20, 20, 20, 3);
        g.fill();
        c2d.text(g, `${st.target} m`, tx, baseY - 28, { size: 10, weight: 800, color: cssVar('--bad') });

        // predicted path, faint
        const T = (2 * st.u * Math.sin(st.ang * Math.PI / 180)) / G;
        const ux = st.u * Math.cos(st.ang * Math.PI / 180);
        const uy = st.u * Math.sin(st.ang * Math.PI / 180);
        g.save();
        g.globalAlpha = 0.25;
        g.strokeStyle = hue; g.lineWidth = 2; g.setLineDash([3, 5]);
        g.beginPath();
        for (let i = 0; i <= 80; i++) {
          const tt = (i / 80) * T;
          const px = X(ux * tt), py = Y(uy * tt - 0.5 * G * tt * tt);
          i ? g.lineTo(px, py) : g.moveTo(px, py);
        }
        g.stroke();
        g.restore();

        // launcher
        g.save();
        g.translate(X(0), baseY);
        g.rotate(-st.ang * Math.PI / 180);
        g.fillStyle = cssVar('--ink-3');
        c2d.roundRect(g, 0, -5, 34, 10, 3);
        g.fill();
        g.restore();

        // the shot
        if (st.flying) {
          st.t += 1 / 60;
          const x = ux * st.t;
          const y = uy * st.t - 0.5 * G * st.t * st.t;
          if (y <= 0 && st.t > 0.05) {
            st.flying = false;
            land(x);
          } else {
            st.trail.push({ x: X(x), y: Y(y) });
            if (st.trail.length > 400) st.trail.shift();
          }
        }

        if (st.trail.length > 1) {
          g.save();
          g.strokeStyle = accent; g.lineWidth = 2.6; g.lineCap = 'round';
          g.beginPath();
          st.trail.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)));
          g.stroke();
          g.restore();
          const last = st.trail[st.trail.length - 1];
          g.fillStyle = accent;
          g.beginPath(); g.arc(last.x, last.y, 6, 0, Math.PI * 2); g.fill();
        }

        // previously found angles for this target
        if (st.hitAngles.length) {
          c2d.text(g, `hit at: ${st.hitAngles.map((a) => a + '°').join('  and  ')}`,
            w - 16, 18, { size: 11, weight: 800, color: cssVar('--ok'), align: 'right' });
        }
      }
    });

    /* ---------------- the R vs theta trace ---------------- */
    const chart = canvasLayer(stageBox, {
      height: 120,
      draw(g, w, hgt) {
        const padL = 40, padB = 22, padT = 10;
        const pw = w - padL - 16, ph = hgt - padT - padB;
        const maxR = (st.u * st.u) / G;
        const X = (a) => padL + (a / 90) * pw;
        const Y = (r) => padT + ph - (r / (maxR * 1.05)) * ph;

        g.save();
        g.strokeStyle = cssVar('--chart-grid'); g.lineWidth = 1;
        for (let a = 0; a <= 90; a += 15) { g.beginPath(); g.moveTo(X(a), padT); g.lineTo(X(a), padT + ph); g.stroke(); }
        g.restore();
        c2d.line(g, padL, padT + ph, padL + pw, padT + ph, { color: cssVar('--chart-ink'), width: 1.2 });
        c2d.line(g, padL, padT, padL, padT + ph, { color: cssVar('--chart-ink'), width: 1.2 });
        for (let a = 0; a <= 90; a += 15) c2d.text(g, `${a}°`, X(a), padT + ph + 12, { size: 9, color: cssVar('--chart-ink') });
        c2d.text(g, 'R (m)', padL - 34, padT + 4, { size: 9, weight: 700, color: cssVar('--chart-ink'), align: 'left' });

        // the theoretical curve
        g.save();
        g.strokeStyle = cssVar('--chart-1'); g.lineWidth = 2;
        g.beginPath();
        for (let a = 0; a <= 90; a += 1) {
          const r = (st.u * st.u * Math.sin(2 * a * Math.PI / 180)) / G;
          const px = X(a), py = Y(r);
          a ? g.lineTo(px, py) : g.moveTo(px, py);
        }
        g.stroke();
        g.restore();

        // the target line and its two solutions
        if (st.target * 1 <= maxR) {
          c2d.line(g, padL, Y(st.target), padL + pw, Y(st.target),
            { color: cssVar('--bad'), width: 1.4, dash: [4, 4] });
          const inner = clamp((st.target * G) / (st.u * st.u), -1, 1);
          const a1 = (Math.asin(inner) * 180 / Math.PI) / 2;
          const a2 = 90 - a1;
          for (const a of [a1, a2]) {
            g.fillStyle = cssVar('--bad');
            g.beginPath(); g.arc(X(a), Y(st.target), 4, 0, Math.PI * 2); g.fill();
          }
          c2d.text(g, `${a1.toFixed(0)}° and ${a2.toFixed(0)}° both reach it`,
            padL + pw, padT + 8, { size: 10, weight: 700, color: cssVar('--bad'), align: 'right' });
        }

        // your shots
        for (const hst of history) {
          g.fillStyle = cssVar('--accent');
          g.beginPath(); g.arc(X(hst.ang), Y(hst.range), 3.5, 0, Math.PI * 2); g.fill();
        }

        // 45 marker
        c2d.line(g, X(45), padT, X(45), padT + ph, { color: cssVar('--ok'), width: 1.2, dash: [3, 3] });
        c2d.text(g, 'max at 45°', X(45), padT + 4, { size: 9, weight: 700, color: cssVar('--ok') });
      }
    });

    /* ---------------- panel ---------------- */

    const out = readouts([
      { key: 'T', label: 'time of flight', value: '—' },
      { key: 'H', label: 'max height', value: '—' },
      { key: 'R', label: 'predicted range', value: '—' },
      { key: 'd', label: 'miss by', value: '—' }
    ]);

    const angS = slider({
      label: 'Launch angle', min: 5, max: 85, step: 1, value: 45, unit: '°',
      fmt: (v) => String(v), onInput: (v) => { st.ang = v; refresh(); }
    });
    const uS = slider({
      label: 'Launch speed', min: 10, max: 35, step: 1, value: 25, unit: ' m s⁻¹',
      fmt: (v) => String(v), onInput: (v) => { st.u = v; refresh(); }
    });

    const msgBox = h('div.callout.callout--jee', { style: { margin: '0 0 12px' } });
    cab.panel.appendChild(msgBox);
    cab.panel.appendChild(out.root);
    cab.panel.appendChild(h('div', {
      style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '16px', marginTop: '14px' }
    }, angS.root, uS.root));
    cab.panel.appendChild(h('div.btnbar', { style: { marginTop: 'var(--sp-4)' } },
      btn('🚀 Fire', fire, { kind: 'primary', size: 'md' }),
      btn('New target', newTarget, { kind: 'ghost' })));

    function predicted() {
      const th = st.ang * Math.PI / 180;
      return {
        T: (2 * st.u * Math.sin(th)) / G,
        H: (st.u * st.u * Math.sin(th) ** 2) / (2 * G),
        R: (st.u * st.u * Math.sin(2 * th)) / G
      };
    }

    function refresh() {
      const p = predicted();
      out.set('T', `${p.T.toFixed(2)} s`);
      out.set('H', `${p.H.toFixed(1)} m`);
      out.set('R', `${p.R.toFixed(1)} m`);
      out.set('d', `${Math.abs(p.R - st.target).toFixed(1)} m`,
        Math.abs(p.R - st.target) < 1.5 ? 'ok' : null);
      view.redraw();
      chart.redraw();
    }

    function fire() {
      if (st.flying) return;
      st.flying = true; st.t = 0; st.trail = []; st.shots++;
      sfx.whoosh();
    }

    function land(x) {
      const miss = Math.abs(x - st.target);
      history.push({ ang: st.ang, range: x });
      chart.redraw();

      if (miss < 1.6) {
        sfx.correct();
        ctx.fx?.burstAt(view.canvas, { count: 22 });
        if (!st.hitAngles.includes(st.ang)) st.hitAngles.push(st.ang);

        const pair = st.hitAngles.length >= 2
          && Math.abs(st.hitAngles[0] + st.hitAngles[1] - 90) <= 3;

        if (pair) {
          doubles++;
          score += 60;
          clear(msgBox);
          msgBox.className = 'callout callout--tip';
          msgBox.appendChild(h('div.callout__label', null, '✓ Complementary pair found'));
          msgBox.appendChild(h('div.small', null, renderInline(
            `**${st.hitAngles[0]}°** and **${st.hitAngles[1]}°** sum to 90° and land in the same place — because $\\sin 2\\theta = \\sin(180\\degree - 2\\theta)$. The steeper shot took longer and climbed higher to get there.`)));
          msgBox.appendChild(h('div.btnbar', { style: { marginTop: '10px' } },
            btn('Next target', newTarget, { kind: 'primary' })));
          sfx.levelUp();
        } else {
          score += 30;
          cab.setHint(`Hit at ${st.ang}°. There is a **second** angle that also works — find it.`);
        }
        cab.setScore(score);
      } else {
        score = Math.max(0, score - 3);
        cab.setScore(score);
        sfx.drop();
        cab.setHint(x < st.target
          ? `Short by ${miss.toFixed(1)} m. Raise the speed, or move the angle toward 45°.`
          : `Over by ${miss.toFixed(1)} m. Lower the speed, or move the angle away from 45°.`);
      }
    }

    function newTarget() {
      round_++;
      const maxR = (st.u * st.u) / G;
      st.target = Math.round(clamp(15 + Math.random() * (maxR * 0.8 - 15), 12, 65));
      st.hitAngles = [];
      st.trail = [];
      history.length = 0;
      clear(msgBox);
      msgBox.className = 'callout callout--jee';
      msgBox.appendChild(h('div.callout__label', null, `Target ${round_}`));
      msgBox.appendChild(h('div.small', null, renderInline(
        `Land a shot at **${st.target} m** — then find the *other* angle that reaches the same spot.`)));
      refresh();

      if (round_ > 4) finish();
    }

    function finish() {
      const best = Math.max(ctx.best ?? 0, score);
      cab.setBest(best);
      ctx.report(score, { best, doubles, shots: st.shots });
    }

    function start() {
      cab.clearOverlay();
      score = 0; round_ = 0; doubles = 0; st.shots = 0;
      st.ang = 45; st.u = 25;
      angS.set(45); uS.set(25);
      history.length = 0;
      cab.setScore(0);
      newTarget();
    }

    start();
    return { destroy() { view.stop(); chart.stop(); } };
  }
};
