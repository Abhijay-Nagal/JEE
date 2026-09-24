/**
 * config.js - the only file you edit to turn cloud sync on.
 *
 * Sync is optional by design. With these left blank the app behaves exactly as
 * it always has: everything in localStorage, no network, no account, no
 * privacy surface. Fill them in and a "Sign in" panel appears in Settings.
 *
 * The anon key is meant to be public. It identifies the project, it does not
 * grant access to anything: every row is protected by row-level security in
 * Postgres, so a signed-in learner can read and write their own save and
 * nobody else's. Committing it is the intended usage, not a leak.
 *
 * Setup is in docs/SYNC.md.
 */

export const SUPABASE_URL = '';
export const SUPABASE_ANON_KEY = '';

/** Sync is only offered when both values above are present. */
export const syncConfigured = () =>
  Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/** Where the magic link comes back to. Same page, no router involvement. */
export const redirectTo = () =>
  location.origin + location.pathname;
