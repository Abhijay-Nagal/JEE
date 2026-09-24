/**
 * Sig-Fig Sniper - shoot only the readings with the requested number of
 * significant figures, before they drift off the sensor.
 *
 * Teaches: fast, reflexive sig-fig counting, with the zero rules (leading,
 * trailing, sandwiched) deliberately over-represented in the spawn table.
 */

import { h } from '../../core/dom.js';
import { renderInline } from '../../core/mathlite.js';
import { sfx } from '../../core/audio.js';
import { arcade, canvasLayer, cssVar, c2d, btn, cleared, pick, clamp } from '../kit.js';

/** Count significant figures. Only unambiguous forms are ever spawned. */
export function countSig(str) {
  let t = String(str).trim().replace(/^[-+]/, '');
  if (/e/i.test(t)) t = t.split(/e/i)[0];      // scientific: mantissa only
  if (t.includes('.')) {
    const digits = t.replace('.', '').replace(/^0+/, '');
    return digits.length || 1;
  }
  const d = t.replace(/^0+/, '');
  return d.replace(/0+$/, '').length || 1;      // bare trailing zeros: not counted
}

/** Spawn pool, weighted toward the zero cases that trip people up. */
const POOL = [
  '0.00450', '0.0250', '2.003', '1.230', '4.50', '100.0', '0.0001', '9.9',
  '12.30', '0.507', '3.0', '250.', '6.022', '0.0000250', '45.60', '7',
  '0.900', '1.0080', '8.00', '0.0304', '15.0', '2.50', '0.078', '304.5',
  '1.00', '0.0420', '99.99', '5.0', '0.006', '72.0', '3.142', '0.5',
  '6.02e23', '1.60e-19', '3.00e8', '9.11e-31', '1.38e-23', '2.998e8'
];

export default {
  id: 'sigFigSniper',

  mount(root, ctx) {
    const cab = arcade(root, {
      title: 'Sig-Fig Sniper',
      badge: 'Reflex drill',
      hint: 'Tap a reading to shoot it. Let the non-targets pass.',
      best: ctx.best ?? null,
      onRestart: start
    });

    let targets = [];        // {x, y, vx, text, sig, hit, dead, age}
    let score = 0, lives = 3, combo = 0, wave = 1, want = 3, spawnAt = 0, elapsed = 0;
    let running = false, shots = 0, hits = 0;

    const hud = h('div.arcade__panel');
    cab.stage.appendChild(hud);

    const view = canvasLayer(hud, {
      height: 260,
      animate: true,
      draw(g, w, hgt, t) {
        const dt = Math.min(0.05, t - (draw.last ?? t));
        draw.last = t;
        if (running) { elapsed += dt; step(dt, w, hgt); }
        paint(g, w, hgt);
      },
      onPointer(type, pos) {
        if (type === 'down' && running) shoot(pos.x, pos.y);
      }
    });
    const draw = {};

    /* ---------------- simulation ---------------- */

    function step(dt, w, hgt) {
      spawnAt -= dt;
      if (spawnAt <= 0) {
        spawn(w, hgt);
        spawnAt = clamp(1.25 - wave * 0.09, 0.42, 1.25);
      }

      for (const o of targets) {
        o.x += o.vx * dt;
        o.age += dt;
        if (o.hit) o.deadT = (o.deadT ?? 0) + dt;
      }

      // A target that leaves the sensor uncaught costs a life.
      for (const o of targets) {
        if (o.x < -90 && !o.hit && !o.counted) {
          o.counted = true;
          if (o.sig === want) {
            lives--;
            combo = 0;
            sfx.wrong();
            ctx.fx?.shake?.(5);
            cab.setHint(`Missed **${o.text}** — that had ${o.sig} significant figures.`);
            if (lives <= 0) finish();
          }
        }
      }
      targets = targets.filter((o) => o.x > -140 && (o.deadT ?? 0) < 0.5);

      // Every 22 s the required count changes, so nobody coasts on one rule.
      const newWant = 2 + (Math.floor(elapsed / 22) % 3);
      if (newWant !== want) {
        want = newWant;
        wave++;
        sfx.unlock();
      }
    }

    function spawn(w, hgt) {
      const text = pick(POOL);
      const lanes = 4;
      const lane = Math.floor(Math.random() * lanes);
      targets.push({
        text,
        sig: countSig(text),
        x: w + 60,
        y: 44 + lane * ((hgt - 88) / (lanes - 1)),
        vx: -(58 + wave * 5 + Math.random() * 22),
        age: 0, hit: false, counted: false
      });
    }

    function shoot(px, py) {
      shots++;
      for (const o of targets) {
        if (o.hit) continue;
        const w = 46 + o.text.length * 8.5, hh = 30;
        if (px >= o.x - w / 2 && px <= o.x + w / 2 && py >= o.y - hh / 2 && py <= o.y + hh / 2) {
          o.hit = true;
          o.correct = o.sig === want;
          if (o.correct) {
            hits++;
            combo++;
            const pts = 10 + Math.min(combo, 10) * 2;
            score += pts;
            sfx.correct(Math.min(combo, 8));
            cab.setHint(`**${o.text}** → ${o.sig} sig figs. +${pts}${combo > 2 ? `  (×${combo})` : ''}`);
          } else {
            combo = 0;
            lives--;
            score = Math.max(0, score - 8);
            sfx.wrong();
            cab.setHint(explain(o.text, o.sig));
            if (lives <= 0) finish();
          }
          cab.setScore(score);
          return;
        }
      }
      // A clean miss costs nothing but the combo.
      combo = 0;
      sfx.tick();
    }

    function explain(text, sig) {
      if (/^0\./.test(text)) return `**${text}** has ${sig} — the leading zeros are only placeholders and never count.`;
      if (/\.\d*0$/.test(text)) return `**${text}** has ${sig} — a trailing zero *after* a decimal point **is** significant.`;
      if (/e/i.test(text)) return `**${text}** has ${sig} — in scientific notation only the mantissa counts.`;
      if (/[1-9]0+[1-9]/.test(text)) return `**${text}** has ${sig} — zeros sandwiched between non-zero digits always count.`;
      return `**${text}** has ${sig} significant figures, not ${want}.`;
    }

    /* ---------------- painting ---------------- */

    function paint(g, w, hgt) {
      const hue = cssVar('--hue') || cssVar('--primary');
      const ok = cssVar('--ok'), bad = cssVar('--bad');

      // sensor grid
      g.save();
      g.strokeStyle = cssVar('--line-soft');
      g.lineWidth = 1;
      for (let x = (elapsed * 30) % 44; x < w; x += 44) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, hgt); g.stroke(); }
      g.restore();

      // "danger zone" at the left edge
      const grad = g.createLinearGradient(0, 0, 90, 0);
      grad.addColorStop(0, 'rgba(255,93,115,.18)');
      grad.addColorStop(1, 'rgba(255,93,115,0)');
      g.fillStyle = grad;
      g.fillRect(0, 0, 90, hgt);

      for (const o of targets) {
        const bw = 46 + o.text.length * 8.5, bh = 30;
        const alpha = o.hit ? clamp(1 - (o.deadT ?? 0) * 2.2, 0, 1) : 1;
        g.save();
        g.globalAlpha = alpha;
        g.translate(o.x, o.y);
        if (o.hit) g.scale(1 + (o.deadT ?? 0) * 1.4, 1 + (o.deadT ?? 0) * 1.4);

        g.fillStyle = o.hit ? (o.correct ? ok : bad) : cssVar('--bg-3');
        g.strokeStyle = o.hit ? (o.correct ? ok : bad) : cssVar('--line');
        g.lineWidth = 1.5;
        c2d.roundRect(g, -bw / 2, -bh / 2, bw, bh, 8);
        g.fill(); g.stroke();

        c2d.text(g, o.text, 0, 0, {
          size: 14, weight: 700, font: 'mono',
          color: o.hit ? '#06121c' : cssVar('--ink-1')
        });
        if (o.hit) c2d.text(g, `${o.sig} s.f.`, 0, -bh / 2 - 9, { size: 10, weight: 800, color: o.correct ? ok : bad });
        g.restore();
      }

      // HUD
      g.save();
      g.globalAlpha = 0.95;
      g.fillStyle = cssVar('--bg-1');
      c2d.roundRect(g, w / 2 - 110, 6, 220, 30, 15); g.fill();
      g.strokeStyle = hue; g.lineWidth = 1.5; g.stroke();
      c2d.text(g, `SHOOT  ${want}  SIG FIGS`, w / 2, 21, { size: 13, weight: 800, color: hue });
      g.restore();

      c2d.text(g, '❤️'.repeat(Math.max(0, lives)), 14, hgt - 16, { size: 14, align: 'left' });
      if (combo > 2) c2d.text(g, `×${combo}`, w - 16, hgt - 16, { size: 16, weight: 900, color: cssVar('--accent'), align: 'right' });
    }

    /* ---------------- lifecycle ---------------- */

    function finish() {
      running = false;
      const best = Math.max(ctx.best ?? 0, score);
      cab.setBest(best);
      ctx.report(score, { best, accuracy: shots ? hits / shots : 0 });
      cab.overlay(cleared(score, best, start,
        h('p.small.muted', null, `${hits} clean hits · ${shots ? Math.round((hits / shots) * 100) : 0}% shot accuracy`)));
    }

    function start() {
      cab.clearOverlay();
      targets = []; score = 0; lives = 3; combo = 0; wave = 1;
      want = 3; spawnAt = 0; elapsed = 0; shots = 0; hits = 0;
      cab.setScore(0);
      cab.setHint('Tap a reading to shoot it. Let the non-targets pass.');
      running = true;
    }

    cab.overlay(h('div', null,
      h('div', { style: { fontSize: '2.2rem' } }, '🎯'),
      h('h3', null, 'Sig-Fig Sniper'),
      h('p.muted', null, 'Readings stream past the sensor. Shoot only those with the requested number of significant figures. The requirement changes every few seconds.'),
      h('div.btnbar', { style: { justifyContent: 'center', marginTop: '12px' } },
        btn('Start', () => { cab.clearOverlay(); start(); }, { kind: 'primary', size: 'md' }))
    ));

    return { destroy() { running = false; view.stop(); } };
  }
};
