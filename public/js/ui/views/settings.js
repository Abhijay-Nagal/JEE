/**
 * settings.js - preferences, data management and first-run onboarding.
 */

import { h, clear } from '../../core/dom.js';
import { renderInline } from '../../core/mathlite.js';
import { get, update, save, exportJSON, importJSON, resetAll, SCHEMA } from '../../core/store.js';
import { setView, setCrumbs, applySettings, refreshStats } from '../shell.js';
import { sfx, setVolume } from '../../core/audio.js';
import { STATS, STORY } from '../../../data/registry.js';
import { modal, confirm, toast } from '../components/overlays.js';
import { syncConfigured } from '../../core/config.js';
import { sendMagicLink, signOut, isSignedIn, currentEmail, onAuthChange } from '../../core/auth.js';
import { syncNow, getStatus, onSyncChange } from '../../core/sync.js';

/* ================================================================== */
/* settings                                                            */
/* ================================================================== */

export function settingsView() {
  setCrumbs([{ label: 'Command Deck', href: '#/' }, { label: 'Settings' }]);
  const s = get();

  const page = h('div', null,
    h('div.page-head', null,
      h('h1', null, 'Settings'),
      h('p.page-head__sub', null, syncConfigured()
        ? 'Your progress lives on this device. Sign in to back it up and carry it to another one.'
        : 'Everything is stored on this device only. Nothing is uploaded anywhere.')),

    h('div.grid.grid--2', null,
      h('div', null, profileCard(s), appearanceCard(s)),
      h('div', null, studyCard(s), accountCard(), dataCard(), aboutCard())
    )
  );

  setView(page);
}

function card(title, ...body) {
  return h('div.card', { style: { marginBottom: 'var(--sp-4)' } },
    h('div.card__head', null, h('h3.card__title', null, title)), ...body);
}

function profileCard(s) {
  const AVATARS = ['🛰️', '🚀', '🔭', '⚗️', '📐', '♾️', '🧪', '🧠', '🦉', '🐦', '⭐', '🎯'];

  return card('Profile',
    h('div.field', null,
      h('label', { for: 'set-name' }, 'Name'),
      h('input#set-name.input', {
        type: 'text', value: s.profile.name, placeholder: 'Cadet', maxlength: '24',
        onInput: (e) => update((st) => { st.profile.name = e.target.value.slice(0, 24); })
      }),
      h('div.field__hint', null, 'Used in greetings and on the print pack.')),

    h('div.field', null,
      h('label', null, 'Avatar'),
      h('div.tiles', null, AVATARS.map((a) =>
        h('button.tile', {
          style: a === s.profile.avatar ? { background: 'var(--primary)', borderColor: 'transparent' } : {},
          onClick: (e) => {
            update((st) => { st.profile.avatar = a; });
            sfx.pop();
            [...e.currentTarget.parentElement.children].forEach((b) => { b.style.background = ''; b.style.borderColor = ''; });
            e.currentTarget.style.background = 'var(--primary)';
            e.currentTarget.style.borderColor = 'transparent';
          }
        }, a)))),

    h('div.field', null,
      h('label', { for: 'set-year' }, 'Target exam year'),
      h('input#set-year.input', {
        type: 'number', value: s.profile.targetYear, min: '2025', max: '2035',
        onInput: (e) => update((st) => { st.profile.targetYear = Number(e.target.value); })
      }))
  );
}

function appearanceCard(s) {
  return card('Appearance',
    h('div.field', null,
      h('label', null, 'Theme'),
      h('select.select', {
        onChange: (e) => { update((st) => { st.settings.theme = e.target.value; }); applySettings(); }
      },
        ['dark', 'light', 'auto'].map((v) =>
          h('option', { value: v, selected: s.settings.theme === v },
            v === 'auto' ? 'Follow system' : v[0].toUpperCase() + v.slice(1))))),

    switchRow('High contrast', 'Thickens borders and removes muted greys.',
      s.settings.contrast === 'high',
      (on) => { update((st) => { st.settings.contrast = on ? 'high' : 'normal'; }); applySettings(); }),

    h('div.field', { style: { marginTop: 'var(--sp-4)' } },
      h('label', null, `Text size: ${Math.round(s.settings.fontScale * 100)}%`),
      h('input', {
        type: 'range', min: '0.85', max: '1.4', step: '0.05', value: s.settings.fontScale,
        style: { width: '100%' },
        onInput: (e) => {
          const v = Number(e.target.value);
          update((st) => { st.settings.fontScale = v; });
          e.target.previousElementSibling.textContent = `Text size: ${Math.round(v * 100)}%`;
          applySettings();
        }
      })),

    switchRow('Reduced motion', 'Disables confetti, shakes and canvas animations.',
      s.settings.motion === 'reduced',
      (on) => { update((st) => { st.settings.motion = on ? 'reduced' : 'full'; }); applySettings(); }),

    switchRow('Sound effects', 'Procedurally synthesised - no audio files are downloaded.',
      s.settings.sound !== false,
      (on) => { update((st) => { st.settings.sound = on; }); if (on) sfx.correct(); })
  );
}

function studyCard(s) {
  return card('Study',
    switchRow('Hard mode', 'Hides hints and raises the XP multiplier.',
      s.settings.hardMode,
      (on) => update((st) => { st.settings.hardMode = on; })),

    switchRow('Show question timer', 'Displays a per-question clock in drills.',
      s.settings.showTimer,
      (on) => update((st) => { st.settings.showTimer = on; })),

    h('div.field', { style: { marginTop: 'var(--sp-4)' } },
      h('label', null, `Daily goal: ${s.profile.dailyGoalMin} minutes`),
      h('input', {
        type: 'range', min: '10', max: '180', step: '5', value: s.profile.dailyGoalMin,
        style: { width: '100%' },
        onInput: (e) => {
          const v = Number(e.target.value);
          update((st) => { st.profile.dailyGoalMin = v; });
          e.target.previousElementSibling.textContent = `Daily goal: ${v} minutes`;
        }
      })),

    h('div.field', null,
      h('label', null, 'Streak freezes'),
      h('div.row', null,
        h('span.stat-chip', null, '🧊 ', String(s.streak.freezes)),
        h('span.small.muted', null, 'One is earned every 7 days, up to 3. A freeze covers a single missed day automatically.')))
  );
}

/**
 * Sign-in and sync. Rendered only when this deployment has been configured
 * with a Supabase project - otherwise the app has no account concept at all
 * and pretending it does would be a lie in the UI.
 */
function accountCard() {
  if (!syncConfigured()) return null;

  const body = h('div');
  const rebuild = () => { clear(body); body.appendChild(isSignedIn() ? signedIn() : signedOut()); };

  /* ---- signed out: ask for an email, send a one-time link ---- */
  function signedOut() {
    const input = h('input.input', {
      type: 'email', placeholder: 'you@example.com', autocomplete: 'email',
      onKeyDown: (e) => { if (e.key === 'Enter') send(); }
    });
    const btn = h('button.btn.btn--primary', { onClick: () => send() }, 'Email me a link');

    async function send() {
      btn.disabled = true;
      btn.textContent = 'Sending…';
      try {
        await sendMagicLink(input.value);
        clear(body);
        body.appendChild(h('div.callout.callout--tip', null,
          h('div.callout__label', null, '✓ Check your inbox'),
          h('div.small', null,
            `A one-time sign-in link is on its way to ${input.value.trim()}. `
            + 'Open it on this device — the link is tied to this browser. It expires in an hour.')));
      } catch (err) {
        btn.disabled = false;
        btn.textContent = 'Email me a link';
        toast({ kind: 'bad', text: err.message });
      }
    }

    return h('div', null,
      h('p.small.muted', { style: { marginTop: 0 } },
        'Sign in to back your progress up and pick it up on another device. '
        + 'No password — you get a one-time link by email. '
        + 'The app keeps working offline and without an account either way.'),
      h('div.row', { style: { gap: 'var(--sp-2)', alignItems: 'center', flexWrap: 'wrap' } }, input, btn)
    );
  }

  /* ---- signed in: show who, and how the last sync went ---- */
  function signedIn() {
    const LABEL = {
      idle: ['·', 'Ready'],
      syncing: ['⟳', 'Syncing…'],
      synced: ['✓', 'Backed up'],
      offline: ['⚠', 'Offline — saving locally'],
      error: ['⚠', 'Sync problem'],
      off: ['·', 'Not syncing']
    };
    const line = h('span.small');
    const paint = () => {
      const { status, error } = getStatus();
      const [icon, text] = LABEL[status] || LABEL.idle;
      line.textContent = `${icon}  ${text}`;
      line.title = error || '';
      line.dataset.tone = status === 'error' || status === 'offline' ? 'bad' : status === 'synced' ? 'ok' : '';
    };
    paint();
    onSyncChange(paint);

    return h('div', null,
      h('p.small', { style: { marginTop: 0 } },
        'Signed in as ', h('strong', null, currentEmail() || 'your account')),
      h('div.row', { style: { gap: 'var(--sp-2)', alignItems: 'center', margin: 'var(--sp-2) 0' } }, line),
      h('p.small.muted', null,
        'Progress syncs automatically. If you study on another device, whichever '
        + 'save has done more of a given topic wins — nothing is overwritten wholesale.'),
      h('div.btnbar', null,
        h('button.btn', {
          onClick: async (e) => {
            e.target.disabled = true;
            const okd = await syncNow();
            e.target.disabled = false;
            toast(okd ? { kind: 'ok', text: 'Progress synced.' }
                      : { kind: 'bad', text: getStatus().error || 'Could not sync right now.' });
          }
        }, '⟳ Sync now'),
        h('button.btn.btn--ghost', {
          onClick: async () => {
            const yes = await confirm({
              title: 'Sign out?',
              body: 'Your progress stays on this device. Sign back in any time to keep syncing.',
              confirmLabel: 'Sign out'
            });
            if (yes) { await signOut(); toast({ kind: 'ok', text: 'Signed out.' }); }
          }
        }, 'Sign out'))
    );
  }

  rebuild();
  onAuthChange(rebuild);
  return card('Account & sync', body);
}

function dataCard() {
  return card('Your data',
    h('p.small.muted', null, renderInline(
      'Progress lives in this browser’s local storage. Clearing site data will erase it, so export a backup if that matters to you.')),
    h('div.btnbar', null,
      h('button.btn', {
        onClick: () => {
          const blob = new Blob([exportJSON()], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = h('a', { href: url, download: `jee-ascent-${new Date().toISOString().slice(0, 10)}.json` });
          document.body.appendChild(a); a.click(); a.remove();
          setTimeout(() => URL.revokeObjectURL(url), 2000);
          toast({ kind: 'ok', text: 'Backup downloaded.' });
        }
      }, '⬇ Export backup'),

      h('label.btn', { style: { cursor: 'pointer' } }, '⬆ Import backup',
        h('input', {
          type: 'file', accept: 'application/json', style: { display: 'none' },
          onChange: async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
              importJSON(await file.text());
              applySettings();
              refreshStats();
              toast({ kind: 'ok', text: 'Backup restored.' });
              setTimeout(() => location.reload(), 600);
            } catch (err) {
              toast({ kind: 'bad', text: `Could not import: ${err.message}` });
            }
          }
        })),

      h('button.btn.btn--danger', {
        onClick: async () => {
          if (await confirm({
            title: 'Erase all progress?',
            body: 'XP, mastery, streaks, badges and the review schedule will all be deleted. A copy of the current save is kept in local storage under a backup key, but do not rely on it — export first.',
            confirmLabel: 'Erase everything', danger: true
          })) {
            resetAll();
            location.hash = '#/';
            location.reload();
          }
        }
      }, 'Erase progress')),

    h('p.tiny.dim', { style: { marginTop: 'var(--sp-3)', marginBottom: 0 } },
      `Save format v${SCHEMA}. Older saves are migrated automatically on load.`)
  );
}

function aboutCard() {
  return card('About',
    h('p.small', null, renderInline(
      `**JEE ASCENT** — ${STATS.chapters} chapters, ${STATS.topics} topics, ${STATS.questions} questions, ${STATS.kcs} knowledge components and ${STATS.widgets} interactive simulations, all running offline.`)),
    h('div.row-wrap', null,
      h('span.tag', null, 'No server'),
      h('span.tag', null, 'No accounts'),
      h('span.tag', null, 'No tracking'),
      h('span.tag', null, 'Installable')),
    h('div.btnbar', { style: { marginTop: 'var(--sp-3)' } },
      h('button.btn.btn--ghost.btn--sm', { onClick: showHowItWorks }, 'How the adaptive engine works'),
      h('button.btn.btn--ghost.btn--sm', { onClick: showStory }, 'The story so far'))
  );
}

function switchRow(label, desc, checked, onChange) {
  const sw = h('div.switch', {
    role: 'switch', tabindex: '0', 'aria-checked': String(checked),
    onClick: toggle,
    onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } }
  });
  function toggle() {
    const next = sw.getAttribute('aria-checked') !== 'true';
    sw.setAttribute('aria-checked', String(next));
    sfx.click();
    onChange(next);
  }
  return h('div.switchrow', null,
    h('div', null,
      h('div.switchrow__label', null, label),
      desc ? h('div.switchrow__desc', null, desc) : null),
    sw);
}

function showHowItWorks() {
  modal({
    title: 'How the adaptive engine works',
    wide: true,
    body: h('div', null,
      h('p', null, renderInline('Five models run over every answer you give. They are deliberately different from each other, because each answers a question the others cannot.')),
      h('div.stack-sm', null,
        item('Bayesian Knowledge Tracing', 'Tracks the probability that you *know* each concept, correcting for the chance you guessed a four-option question right or slipped on one you knew. Mastery decays between sessions on a forgetting curve.'),
        item('Item Response Theory (3PL)', 'Estimates one continuous ability per subject and picks questions whose predicted success rate for you is about 75% — the band where learning per minute peaks.'),
        item('Elo', 'Rates you and the questions against each other. Over time a question everyone gets right drifts down in difficulty, so the bank self-calibrates.'),
        item('SM-2 spaced repetition', 'Schedules reviews for the moment just before you would forget, and orders the queue by predicted recall rather than by due date.'),
        item('Thompson sampling', 'When several activities are equally sensible, it samples from a Beta posterior per activity to decide what to recommend — exploring early, exploiting once your pattern is clear.'),
        item('Prerequisite graph', 'When you get something wrong, it walks down the dependency graph to find the weakest ancestor. That is why a limiting-reagent error sometimes prescribes the mole concept.')
      )),
    actions: [{ label: 'Close', kind: 'primary' }]
  });
}

const item = (name, desc) => h('div', { style: { paddingBottom: '10px', borderBottom: '1px solid var(--line-soft)' } },
  h('strong', null, name), h('div.small.muted', null, renderInline(desc)));

function showStory() {
  modal({
    title: STORY.title, wide: true,
    body: h('div', null,
      h('p', null, renderInline(STORY.premise)),
      h('div.divider-label', null, 'Cast'),
      h('div.stack-sm', null, STORY.cast.map((c) =>
        h('div.row', { style: { alignItems: 'flex-start' } },
          h('div.story__avatar', { style: { width: '40px', height: '40px', fontSize: '1.2rem' } }, c.avatar),
          h('div', null, h('strong', null, c.name), h('div.small.muted', null, c.role)))))),
    actions: [{ label: 'Close', kind: 'primary' }]
  });
}

/* ================================================================== */
/* onboarding                                                          */
/* ================================================================== */

export function maybeOnboard() {
  const s = get();
  if (s.profile.onboarded) return;

  let name = '';
  const nameInput = h('input.input', {
    type: 'text', placeholder: 'What should we call you?', maxlength: '24',
    onInput: (e) => { name = e.target.value; }
  });

  modal({
    title: 'Welcome aboard the Aryabhata',
    dismissible: false,
    wide: true,
    body: h('div', null,
      h('div.story', { style: { marginBottom: 'var(--sp-4)' } },
        h('div.row', { style: { alignItems: 'flex-start', gap: 'var(--sp-4)' } },
          h('div.story__avatar', null, '🛰️'),
          h('div', null,
            h('div.story__speaker', null, 'Station AI'),
            h('p.story__line', null, renderInline(STORY.premise))))),

      h('div.field', null, h('label', null, 'Your name'), nameInput),

      h('p.small.muted', null, renderInline(
        `Everything runs on this device. There is no account, no server and nothing to sign up for. You can export your progress at any time from Settings.`)),

      h('div.row-wrap', null,
        h('span.tag', null, `${STATS.topics} topics`),
        h('span.tag', null, `${STATS.questions} questions`),
        h('span.tag', null, `${STATS.widgets} simulations`),
        h('span.tag', null, `${STATS.bosses} bosses`))
    ),
    actions: [
      {
        label: 'Begin',
        kind: 'primary',
        onClick: () => {
          update((st) => {
            st.profile.name = (name || 'Cadet').slice(0, 24);
            st.profile.onboarded = true;
          }, { immediate: true });
          refreshStats();
          sfx.unlock();
        }
      }
    ]
  });
}
