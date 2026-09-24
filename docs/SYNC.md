# Cloud sync — setup

Sync is **off by default** and the app is fully usable without it. Turning it on
takes about five minutes and costs nothing on Supabase's free tier.

If you never do this, nothing changes: no account, no network, no privacy
surface, and the Settings page says so.

---

## 1. Create the project

1. [supabase.com](https://supabase.com) → **New project** (free tier is enough).
2. Wait for it to provision, then open **Project Settings → API** and copy:
   - **Project URL** — `https://xxxxxxxx.supabase.co`
   - **anon public** key — a long `eyJ…` string

## 2. Create the table

**SQL Editor → New query** → paste the contents of
[`supabase/schema.sql`](../supabase/schema.sql) → **Run**.

That creates one table and the row-level security policies. Do not skip the
policies — they are what make the anon key safe to publish.

## 3. Allow the redirect

**Authentication → URL Configuration**:

- **Site URL** — your deployed origin, e.g. `https://jee-ascent.vercel.app`
- **Redirect URLs** — add both:
  ```
  https://jee-ascent.vercel.app
  http://localhost:5173
  ```

The second one lets you test sign-in locally. Supabase refuses to redirect
anywhere not on this list, which is what stops someone pointing a sign-in link
at their own site.

## 4. Point the app at it

Edit [`public/js/core/config.js`](../public/js/core/config.js):

```js
export const SUPABASE_URL = 'https://xxxxxxxx.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJ…';
```

Then, because `public/` changed:

```bash
npm run sw      # regenerate the offline precache list
npm run verify  # prove nothing broke
```

Commit and push. Vercel deploys, and an **Account & sync** card appears in
Settings.

---

## Is it safe to commit the anon key?

Yes — that is its designed use. It identifies the project and grants nothing on
its own. Every row is gated by the RLS policies in step 2, which compare
`auth.uid()` from the caller's signed JWT against the row's `user_id`. Without a
valid session the key can read and write nothing.

The key to **never** commit is the `service_role` key, which bypasses RLS
entirely. This app never uses it and never needs it.

---

## How sync behaves

- **localStorage stays the source of truth.** The cloud is a mirror. Offline,
  signed out, or Supabase down — the app works identically.
- **Sign-in is passwordless.** A one-time link by email. No password is
  collected, stored or transmitted, so there is none to leak or reset.
- **PKCE, not implicit flow.** The callback arrives as `?code=` in the query
  string. This matters here specifically: the app is a hash router, and the
  implicit flow's `#access_token=…` would be handed to the router as a route.
- **Merging, not overwriting.** Two devices with real work in them are
  reconciled field by field — XP takes the larger, a topic stays read, an SRS
  schedule is taken whole from the device that has seen the card more.
  `npm test` covers this, including that merging is idempotent and does not
  depend on which side is called local.
- **Settings are not synced.** Theme, motion and font scale belong to a device,
  not a person.
- **Writes are debounced** to 8 seconds, so a drill session is one request
  rather than forty.

---

## Troubleshooting

| Symptom | Cause |
|---|---|
| *"This link was opened on a different device or browser"* | PKCE ties the link to the browser that asked for it. Request a new link in the browser you want to sign in on. |
| Sign-in redirects to the site but stays signed out | The redirect URL is not in the allow-list from step 3. |
| `HTTP 401` on sync | Table exists but RLS policies were not created. Re-run `schema.sql`. |
| `HTTP 404` on sync | The `saves` table was not created, or is not in the `public` schema. |
| Card never appears in Settings | `config.js` is still blank, or `npm run sw` was not run after editing it. |
