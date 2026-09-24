/**
 * overlays.js - toasts, modals and confirmations.
 *
 * All transient UI lives here so views never have to manage their own
 * stacking, focus or teardown.
 */

import { h, trapFocus, clear } from '../../core/dom.js';
import { renderInline } from '../../core/mathlite.js';
import { on, EV } from '../../core/bus.js';
import { sfx } from '../../core/audio.js';

/* ------------------------------------------------------------------ */
/* toasts                                                              */
/* ------------------------------------------------------------------ */

let stack = null;

function ensureStack() {
  if (stack) return stack;
  stack = h('div.toasts', { role: 'status', 'aria-live': 'polite' });
  document.body.appendChild(stack);
  return stack;
}

/**
 * @param {{text:string, kind?:'xp'|'ok'|'bad'|'ach'|'info', icon?:string, ms?:number}} o
 */
export function toast({ text, kind = 'info', icon = null, ms = 3200 }) {
  const el = h(`div.toast${kind ? '.toast--' + kind : ''}`, null,
    icon ? h('span.big', null, icon) : null,
    h('span', null, renderInline(text))
  );
  ensureStack().appendChild(el);

  // Cap the stack so a burst of rewards doesn't fill the screen.
  while (stack.children.length > 4) stack.firstChild.remove();

  setTimeout(() => {
    el.classList.add('out');
    setTimeout(() => el.remove(), 260);
  }, ms);
  return el;
}

/** Wire the bus events that should always surface as a toast. */
export function installToasts() {
  on(EV.TOAST, (p) => toast(p));
  on(EV.ACHIEVEMENT, (a) => toast({ kind: 'ach', icon: a.icon, text: `**${a.name}** — ${a.desc}`, ms: 5000 }));
  on(EV.QUEST_DONE, (q) => toast({ kind: 'xp', icon: q.icon, text: `Mission complete: ${q.label}  **+${q.xp} XP**`, ms: 4200 }));
}

/* ------------------------------------------------------------------ */
/* modal                                                               */
/* ------------------------------------------------------------------ */

let openModal = null;

/**
 * @param {object} o
 * @param {string} o.title
 * @param {Node|string} o.body
 * @param {Array<{label:string, kind?:string, onClick?:Function, close?:boolean}>} [o.actions]
 * @param {boolean} [o.dismissible]
 * @param {boolean} [o.wide]
 */
export function modal({ title, body, actions = [], dismissible = true, wide = false }) {
  close();

  const box = h('div.modal' + (wide ? '.modal--wide' : ''), {
    role: 'dialog', 'aria-modal': 'true', 'aria-label': title
  },
    h('h2.modal__title', null, title),
    h('div', null, typeof body === 'string' ? renderInline(body) : body),
    actions.length
      ? h('div.modal__foot', null, actions.map((a) =>
          h(`button.btn${a.kind ? '.btn--' + a.kind : ''}`, {
            onClick: () => {
              sfx.click();
              const keep = a.onClick?.();
              if (a.close !== false && keep !== false) close();
            }
          }, a.label)))
      : null
  );

  const back = h('div.modal-backdrop', {
    onClick: (e) => { if (dismissible && e.target === back) close(); }
  }, box);

  const release = trapFocus(box);
  const onKey = (e) => { if (e.key === 'Escape' && dismissible) close(); };
  document.addEventListener('keydown', onKey);

  openModal = {
    el: back,
    destroy() {
      release();
      document.removeEventListener('keydown', onKey);
      back.remove();
    }
  };

  document.body.appendChild(back);
  setTimeout(() => box.querySelector('button, input, a')?.focus(), 60);
  return openModal;
}

export function close() {
  openModal?.destroy();
  openModal = null;
}

/** Promise-based confirmation, used before destructive actions. */
export function confirm({ title, body, confirmLabel = 'Confirm', danger = false }) {
  return new Promise((resolve) => {
    modal({
      title,
      body,
      dismissible: true,
      actions: [
        { label: 'Cancel', kind: 'ghost', onClick: () => resolve(false) },
        { label: confirmLabel, kind: danger ? 'danger' : 'primary', onClick: () => resolve(true) }
      ]
    });
  });
}

/* ------------------------------------------------------------------ */
/* level-up celebration                                                */
/* ------------------------------------------------------------------ */

export function levelUpModal({ level, rank, coins }) {
  modal({
    title: `Level ${level}`,
    body: h('div', { style: { textAlign: 'center' } },
      h('div', { style: { fontSize: '3rem', margin: '4px 0 10px' } }, '🎖️'),
      h('p', null, renderInline(`You are now a **${rank}**.`)),
      h('p.small.muted', null, renderInline(`+${coins} coins credited. Spend them on hints and shields in the Depot.`))
    ),
    actions: [{ label: 'Continue', kind: 'primary' }]
  });
}
