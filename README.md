# JEE ASCENT

**The Aryabhata Protocol** — an offline-first, gamified, adaptive platform for
JEE preparation.

Chapters 1 and 2 of Physics, Chemistry and Mathematics, built end to end:
40 topics, 40 purpose-built interactive simulations, 22 narrated concept
animations, 378 questions with full worked solutions, six boss battles, and an
adaptive engine that decides what you should do next.

No npm install. No build step. Works offline. An account is **optional** —
sign in only if you want your progress to follow you to another device.

**[Open the live app →](https://jee-abhijay-nagals-projects.vercel.app)**

[![CI](https://github.com/Abhijay-Nagal/JEE/actions/workflows/ci.yml/badge.svg)](https://github.com/Abhijay-Nagal/JEE/actions/workflows/ci.yml)

Install it from the browser's address bar and it keeps working with the network
off.

---

## Run it locally

```bash
node server.js
```

Then open **http://localhost:5173**.

On Windows you can double-click **`start.bat`** instead.

> The little server is needed because browsers block ES modules and service
> workers on `file://`. It has zero dependencies — if you have Node 18 or
> newer, you have everything.

---

## What is inside

| | |
|---|---|
| **40 topics** | Physics *Units & Measurements* + *Kinematics* · Chemistry *Some Basic Concepts* + *Atomic Structure* · Maths *Sets, Relations & Functions* + *Complex Numbers & Quadratic Equations* |
| **40 simulations** | A different one per topic — read a real vernier calliper, null a cathode-ray beam against a magnet to measure *e/m*, drag a complex number around the Argand plane, shade a Venn diagram and have the app name your expression |
| **22 animations** | Narrated, scrubbable explanations of the ideas that are hard to describe in prose: gold-foil scattering, de Broglie standing waves, why the discriminant decides everything |
| **378 questions** | Graded **G**rasp → **M**astery → **H**urdle, every one with a step-by-step solution |
| **Adaptive engine** | Bayesian Knowledge Tracing, Item Response Theory, Elo, SM-2 spaced repetition, a Thompson-sampling bandit, and a 135-node prerequisite graph |
| **Gamified** | XP, 15 ranks, streaks with freezes, daily missions, 31 achievements, six bosses |
| **Printable** | Formula sheets, lesson notes, question papers with an OMR grid, answer keys, and a worksheet generated from your own mistakes |
| **Offline** | Installable PWA, 125 files precached |
| **Optional sync** | Passwordless email sign-in. Progress is merged across devices field by field, never overwritten. Off unless you configure it — see [docs/SYNC.md](docs/SYNC.md) |

---

## Getting started in the app

1. It asks your name once, then drops you on the **Command Deck**.
2. The big button is the recommendation — it is chosen for you, and the
   reasoning is printed underneath it.
3. Press <kbd>/</kbd> anywhere to search topics, formulae and concepts.
4. **Progress** shows what the engine actually thinks, including which kind of
   activity works best for you.
5. **Print Pack** turns any chapter into paper.

---

## Development

```bash
npm test        # syntax + content validation + 5,547 engine checks
npm run sync    # sign-in and cross-device merge, against a stand-in Supabase
npm run ui      # drives the real app in Chromium (needs Playwright)
npm run build   # regenerate icons and the offline precache list
```

**Run `npm run sw` after changing anything in `public/`** — the service worker
precaches an explicit file list, and a stale list serves stale content.
`npm run sw:check` proves it is current, and both CI and the deploy build run
it — so a forgotten `npm run sw` fails the build instead of silently shipping
stale offline content.

Full architecture, the maths behind the adaptive engine, the content schema
and how to add a chapter: **[CLAUDE.md](CLAUDE.md)**.

---

## Deployment

Live at **[jee-abhijay-nagals-projects.vercel.app](https://jee-abhijay-nagals-projects.vercel.app)**, hosted on **Vercel**, which
builds from this repository on every push. Its
configuration lives in [`vercel.json`](vercel.json) rather than in a dashboard,
so the deploy is reproducible from the repo alone:

```jsonc
"buildCommand":     "npm run verify",   // a red suite blocks the deploy
"outputDirectory":  "public",           // the site is public/, served as-is
"installCommand":   "echo ..."          // nothing to install
```

There is no build step in the usual sense — nothing is compiled or bundled.
`server.js` exists only because browsers block ES modules and service workers
on `file://`; it is never deployed.

Pushes to `main` publish; other branches get preview URLs.
[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs the same checks on
pull requests so the signal arrives without waiting on a deployment.

`vercel.json` also pins `Cache-Control: max-age=0, must-revalidate` on `sw.js`,
`precache.js` and `index.html`. Without that a CDN can pin an old service
worker in browsers and updates stop reaching people who already have the app
installed — the one genuinely hard-to-debug failure mode for an offline-first
site.

The app uses relative paths throughout and a hash router, so it runs unmodified
from any path — a root domain or a subpath — with no rewrite rules and no
`404.html` fallback.

---

## Status

Chapters 1 and 2 of each subject are complete and playable — six of roughly
fifty-four. The remaining chapters are listed on each subject screen as
`planned`, so the app shows the real shape of the syllabus rather than
pretending to be finished.
