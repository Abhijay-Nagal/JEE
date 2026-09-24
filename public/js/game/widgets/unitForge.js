/**
 * Unit Forge - drag SI units onto the quantities they belong to.
 *
 * Teaches: recognising derived units, and that the *same* unit can belong to
 * several different quantities (the joule/newton-metre trap).
 */

import { h, clear } from '../../core/dom.js';
import { renderInline } from '../../core/mathlite.js';
import { sfx } from '../../core/audio.js';
import { arcade, dragDrop, shuffle, btn, cleared, countdown } from '../kit.js';

const BANK = [
  { q: 'Force',               u: 'kg·m·s⁻²',        named: 'newton (N)' },
  { q: 'Pressure',            u: 'kg·m⁻¹·s⁻²',   named: 'pascal (Pa)' },
  { q: 'Energy / Work',       u: 'kg·m²·s⁻²',     named: 'joule (J)' },
  { q: 'Power',               u: 'kg·m²·s⁻³',     named: 'watt (W)' },
  { q: 'Momentum',            u: 'kg·m·s⁻¹',        named: 'N·s' },
  { q: 'Frequency',           u: 's⁻¹',                 named: 'hertz (Hz)' },
  { q: 'Surface tension',     u: 'kg·s⁻²',            named: 'N·m⁻¹' },
  { q: 'Viscosity',           u: 'kg·m⁻¹·s⁻¹',   named: 'Pa·s' },
  { q: 'Charge',              u: 'A·s',                 named: 'coulomb (C)' },
  { q: 'Potential difference', u: 'kg·m²·s⁻³·A⁻¹', named: 'volt (V)' },
  { q: 'Resistance',          u: 'kg·m²·s⁻³·A⁻²', named: 'ohm (Ω)' },
  { q: 'Magnetic flux',       u: 'kg·m²·s⁻²·A⁻¹', named: 'weber (Wb)' },
  { q: 'Moment of inertia',   u: 'kg·m²',              named: 'kg·m²' },
  { q: 'Gravitational constant', u: 'kg⁻¹·m³·s⁻²', named: 'N·m²·kg⁻²' },
  { q: 'Planck constant',     u: 'kg·m²·s⁻¹',     named: 'J·s' }
];

const ROUND_SIZE = 5;
const ROUND_SECONDS = 75;

export default {
  id: 'unitForge',

  mount(root, ctx) {
    const cab = arcade(root, {
      title: 'Unit Forge',
      badge: 'Speed match',
      hint: 'Drag a unit onto its quantity — or tap the unit, then tap the slot.',
      best: ctx.best ?? null,
      onRestart: start
    });

    let score = 0, solved = 0, combo = 0, timer = null, dd = null, round = 0;
    const board = h('div');
    cab.stage.appendChild(h('div.arcade__panel', null, board));

    function start() {
      cab.clearOverlay();
      score = 0; solved = 0; combo = 0; round = 0;
      cab.setScore(0);
      timer?.stop();
      timer = countdown(ROUND_SECONDS, null, finish);
      cab.foot.prepend(timer.el);
      deal();
    }

    function deal() {
      round++;
      dd?.destroy();
      clear(board);

      const picks = shuffle(BANK).slice(0, ROUND_SIZE);
      const slots = h('div', { style: { display: 'grid', gap: '10px', marginBottom: '16px' } });

      for (const p of picks) {
        slots.appendChild(
          h('div', { style: { display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 150px', gap: '12px', alignItems: 'center' } },
            h('div', { style: { fontWeight: '650', fontSize: '.92rem' } }, p.q),
            h('div.slot', { dataset: { answer: p.u, named: p.named } }, 'drop unit')
          )
        );
      }

      const tiles = h('div.tiles', { style: { marginTop: '4px' } },
        shuffle(picks).map((p) =>
          h('button.tile.mono', { dataset: { value: p.u }, style: { fontSize: '.82rem' } }, p.u)));

      board.appendChild(h('div.small.muted', { style: { marginBottom: '10px' } },
        `Round ${round} · match all ${ROUND_SIZE} to advance`));
      board.appendChild(slots);
      board.appendChild(h('div.divider-label', null, 'Unit bank'));
      board.appendChild(tiles);

      let placedHere = 0;

      dd = dragDrop({
        container: board,
        onDrop(tile, slot) {
          if (slot.dataset.state === 'correct') return;
          const ok = tile.dataset.value === slot.dataset.answer;

          if (ok) {
            combo++;
            const pts = 10 + Math.min(combo, 6) * 2;
            score += pts;
            solved++; placedHere++;
            cab.setScore(score);
            slot.dataset.state = 'correct';
            slot.textContent = '';
            slot.appendChild(h('span.mono', { style: { fontSize: '.8rem' } }, tile.dataset.value));
            slot.appendChild(h('span.tiny.dim', { style: { marginLeft: '6px' } }, slot.dataset.named));
            tile.dataset.placed = 'true';
            tile.style.opacity = '.25';
            tile.style.pointerEvents = 'none';
            sfx.correct(Math.min(combo, 8));
            ctx.fx?.burstAt(slot, { count: 12, power: 5, colors: [ctx.hueHex] });
            cab.setHint(`**+${pts}**  combo ×${combo}`);
            if (placedHere === ROUND_SIZE) setTimeout(deal, 700);
          } else {
            combo = 0;
            score = Math.max(0, score - 4);
            cab.setScore(score);
            slot.dataset.state = 'wrong';
            sfx.wrong();
            slot.classList.add('shake');
            setTimeout(() => {
              slot.classList.remove('shake');
              slot.dataset.state = '';
              slot.textContent = 'drop unit';
            }, 650);
            cab.setHint('Not that one. Build the unit from its defining equation.');
          }
        }
      });
    }

    function finish() {
      dd?.destroy();
      timer?.stop();
      const best = Math.max(ctx.best ?? 0, score);
      cab.setBest(best);
      ctx.report(score, { best, matched: solved });
      cab.overlay(cleared(score, best, start,
        h('p.small.muted', null, `${solved} units forged.`)));
    }

    start();

    return {
      destroy() { dd?.destroy(); timer?.stop(); }
    };
  }
};
