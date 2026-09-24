# JEE ASCENT — implementation reference

> You asked for this file as `cloud.md`; the conventional name for a project
> brief that Claude Code reads automatically is `CLAUDE.md`, so it lives here.
> `README.md` is the short version for a human opening the folder.

An offline-first, gamified, adaptive preparation platform for JEE, covering
**Chapters 1 and 2 of Physics, Chemistry and Mathematics** end to end.

**Zero runtime dependencies. No build step. No server, accounts or network.**
`node server.js` is the entire install.

---

## 1. Decisions taken (and why)

You asked me to decide rather than ask. These are the calls that shaped
everything else.

| Question | Decision | Reasoning |
|---|---|---|
| "GMH questions" | **G**rasp → **M**astery → **Hurdle** | Read as a Good/Medium/Hard ladder. Mapped onto the exam: Grasp = concept check, Mastery = JEE Main standard, Hurdle = JEE Advanced. Every topic has all three. |
| "printable and progressive" | A real **PWA** *and* a real **print pack** | Installable, works with the network off, and generates A4 paper: formula sheet, notes, question paper with OMR grid, answer key, and a worksheet built from your own errors. |
| Stack | Vanilla ES modules, Canvas, one zero-dependency Node static server | An `npm install` that breaks in eighteen months would make the whole thing unusable. Nothing here can rot. |
| Maths rendering | A custom LaTeX-subset renderer (`core/mathlite.js`) | KaTeX/MathJax are ~300 KB and would need vendoring for offline use. The syllabus needs a narrow subset, so a 400-line parser covers it exactly and ships in 12 KB. |
| Which chapters | Units 1 and 2 of each subject: Physics *Units & Measurements* + *Kinematics*; Chemistry *Some Basic Concepts* + *Atomic Structure*; Maths *Sets, Relations & Functions* + *Complex Numbers & Quadratic Equations* | Building the syllabus in order, and in parallel across the three subjects, so no subject runs ahead of the others. |
| Storyline | *The Aryabhata Protocol* | A frame that motivates revisiting foundations without being childish: a research station's archives are wiped and must be rebuilt from understanding. Each subject has a guide character; each chapter ends in a boss. |
| Personalisation | Six models, not one | A single "difficulty score" cannot answer both "do they know this?" and "what should they see next?". See §4. |
| Data | `localStorage` only | No account to create, no privacy surface, works on a plane. Export/import is one click. |

---

## 2. Running it

```bash
cd JEE
node server.js          # or: npm start, or double-click start.bat on Windows
# open http://localhost:5173
```

The server exists because ES modules and service workers are both blocked on
`file://`. It has no dependencies.

```bash
npm test          # syntax + content validation + engine smoke test (5,500+ checks)
npm run ui        # drives the real app in Chromium (needs Playwright; skips cleanly if absent)
npm run build     # regenerate PWA icons and the service-worker precache list
```

**After adding or editing any file under `public/`, run `npm run sw`** — the
service worker precaches an explicit, content-hashed file list, and a stale
list means stale offline content.

---

## 3. What is actually built

| | Count |
|---|---|
| Chapters | 6 (two per subject, fully authored) |
| Topics | 40 |
| Interactive simulations | 40 — one purpose-built per topic |
| Concept animations | 22 — narrated, scrubbable, print-aware |
| Questions | 378 (120 Grasp / 126 Mastery / 132 Hurdle) |
| Worked solution steps | 1342 — every question explains itself |
| Knowledge components | 135, in a prerequisite DAG |
| Chapter bosses | 6 |
| Achievements | 31 |
| Total JS/CSS | 121 files, ~1.5 MB uncompressed, all precached |

### Topic breakdown

**Physics 1 — Units and Measurements** (8 topics)
SI system · unit conversion & systems · dimensional formulae & homogeneity ·
applications and limits of dimensional analysis · significant figures ·
errors in measurement · combination of errors · vernier calliper & screw gauge

**Physics 2 — Kinematics** (6 topics)
Distance vs displacement · velocity and the slope of x–t · acceleration and
the area under v–t · the SUVAT equations · free fall · relative velocity ·
projectile motion

**Chemistry 1 — Some Basic Concepts** (6 topics)
Laws of chemical combination · atomic & molecular masses · the mole concept ·
percentage composition and formulae · stoichiometry & limiting reagent ·
concentration terms

**Chemistry 2 — Atomic Structure** (6 topics)
Subatomic particles & the nuclear atom · electromagnetic radiation and the
quantum · Bohr's model & the hydrogen spectrum · dual nature (de Broglie,
Heisenberg) · quantum numbers & orbitals · electronic configuration

**Mathematics 1 — Sets, Relations & Functions** (8 topics)
Sets and notation · set operations & Venn diagrams · inclusion–exclusion ·
Cartesian products & relations · types of relations · functions and their
types · composition & inverse · graphs and transformations

**Mathematics 2 — Complex Numbers & Quadratic Equations** (6 topics)
The algebra of i · the Argand plane, modulus & argument · De Moivre and roots
of unity · quadratic equations & the discriminant · relations between roots
and coefficients · sign conditions, common roots & inequalities

The remaining chapters of all three subjects are listed on each subject screen
as `planned`, so the app shows the true shape of the syllabus rather than
implying it is complete.

---

## 4. The adaptive engine

Six models run over every answer. They are deliberately different because each
answers a question the others cannot. All live in `public/js/engine/` and are
pure functions over plain data — no DOM, which is why they can be tested in
Node.

### 4.1 Bayesian Knowledge Tracing — `bkt.js`
*"Does the learner know this concept?"*

Each knowledge component is a hidden binary variable. Every answer is a noisy
observation with two channels: **slip** (knows it, answered wrong) and
**guess** (doesn't, answered right — high for 4-option MCQ). After each answer:

```
P(L|correct) = L(1−S) / [L(1−S) + (1−L)G]
P(L|wrong)   = L·S   / [L·S   + (1−L)(1−G)]
P(L')        = P(L|obs) + (1 − P(L|obs))·T
```

Slip/guess/transit are tuned per tier — a Hurdle question has a higher slip
rate and a lower guess rate than a Grasp one.

**Extension beyond textbook BKT:** mastery decays between sessions on an
exponential forgetting curve toward the guess floor (21-day half-life). A topic
drilled in March is not still reported as mastered in September.

### 4.2 Item Response Theory (3PL) — `irt.js`
*"How hard a question can they handle right now?"*

```
P(correct | θ) = c + (1 − c) / (1 + exp(−1.7·a·(θ − b)))
```

One ability `θ` per subject, re-estimated by **EAP over a fixed grid** with a
N(0,1) prior. A grid is used rather than Newton–Raphson because it cannot
diverge on an all-correct or all-wrong pattern — common in the first few
questions.

Selection targets **~75% predicted success** rather than maximum information
(which implicitly targets 50%). 75% is the desirable-difficulty band where
learning per minute is highest and the learner stays in flow.

### 4.3 Elo — `elo.js`
*Fast, robust, and it re-rates the questions too.*

Learner and item are rated against each other on the familiar 1200-centred
scale, with a FIDE-style provisional K-factor. The item side matters: an
authored "Hard" question that everyone gets right drifts down over time, so
the bank self-calibrates from real answer data.

### 4.4 SM-2 spaced repetition — `srs.js`
*"When should they see this again?"*

SM-2 supplies the interval ladder (1 day → 4 days → ×ease). On top of it the
scheduler tracks **retrievability** from the forgetting curve:

```
R(t) = exp(−t / S)
```

The review queue is therefore ordered by *closest to being forgotten*, not by
oldest due date — which matters because learners often clear only part of a
backlog, and the part they clear should be the part about to decay.

Quality 0–5 comes from correctness, speed against the item's par time, and
hint use. Intervals are fuzzed ±8% so one big study day doesn't create one
enormous review day a fortnight later.

### 4.5 Thompson sampling bandit — `bandit.js`
*"Which activity actually helps this learner?"*

Five arms: read a lesson, play the simulation, drill questions, clear reviews,
fight the boss. Each keeps a Beta(α, β) posterior over "did this produce a
learning gain?", where reward is normalised mastery gain per minute. The
Command Deck samples from the posteriors when several options are equally
sensible — exploring early, exploiting once a pattern is clear. Shown to the
learner on the Progress screen as "what works for you".

### 4.6 Prerequisite knowledge graph — `knowledgeGraph.js`
*"Why did they get that wrong?"*

78 knowledge components with declared prerequisites form a DAG (validated
acyclic, and topologically sorted at boot). This buys three things:

1. **Unlocking** — a topic opens when its prerequisites are read or understood.
   It is guidance, not a wall: you can always read ahead.
2. **Blame analysis** — on a wrong answer the engine walks *down* the graph to
   find the weakest ancestor. "Limiting reagent is hard" usually means "the
   mole concept is shaky", and that is what gets prescribed.
3. **Roll-up** — chapter mastery is a prerequisite-weighted aggregate, and a
   topic never opened contributes zero rather than being skipped.

### 4.7 Where they meet — `grader.js`

Every question in the app — topic drills, review, adaptive practice, boss
fights, mock tests — funnels through one `gradeAnswer()`. One answer updates
BKT, the Elo pair, the IRT ability, the SRS schedule and the gamification
layer in a fixed order, then emits one event. Keeping it in one function is
what makes the models agree with each other.

---

## 5. Gamification

- **XP and levels** — XP per level grows linearly (80 + 45(L−1)), so the curve
  slows on purpose. 15 rank titles, a new one every three levels.
- **Tiered XP** — Grasp 10, Mastery 18, Hurdle 30, multiplied by a combo (capped
  at ×12), reduced for hints, raised in hard mode. A wrong answer still earns 2:
  never zero, or learners stop attempting hard questions.
- **Streaks** with earned freezes — one freeze per 7 days, up to 3, spent
  automatically to cover a single missed day.
- **Daily missions** — three per day, drawn deterministically from the date so
  they are stable across reloads. Always one light, one medium, one stretch.
- **31 achievements**, from "open your first topic" to "defeat a boss without
  losing a life".
- **Boss battles** — timed, Hurdle-tier only, 3 lives, hints disabled, with a
  narrative defeat scene. Answers still count normally.
- **Coins** from levels, achievements and hard questions.

Nothing gamified interferes with the learning signal: XP is a *reward*, never
an input to the models.

---

## 6. The 40 simulations

Each topic has a purpose-built interactive, embedded inline at the point in
the lesson where it explains something, and also available full-screen. All are
Canvas or SVG, pointer- and touch-driven, built on a shared kit
(`game/kit.js`) and lazily imported so nothing loads until it is opened.

| Topic | Simulation | What it teaches by doing |
|---|---|---|
| SI units | **Unit Forge** | Drag units onto quantities against a clock; the work/torque trap |
| Unit conversion | **Conversion Cascade** | Chain factor-label steps; wrong choices are diagnosed (reciprocal, unsquared) |
| Dimensional formulae | **Dimension Balance** | Set M/L/T exponents until a physical scale levels |
| Rayleigh's method | **Rayleigh Forge** | Choose the variables, then solve the M/L/T system live; derives five real laws |
| Significant figures | **Sig-Fig Sniper** | Arcade reflex drill; the required count changes mid-game |
| Errors | **Precision Range** | Independent bias and spread knobs; four missions that separate accuracy from precision |
| Error propagation | **Propagation Forge** | A live error budget bar chart — see which term dominates |
| Vernier & screw gauge | **Instrument Bench** | Read a drawn-to-scale instrument, including zero-error rounds |
| Laws of combination | **The Weighing Room** | Run Lavoisier/Proust/Dalton's experiments; the law is revealed from *your* data table |
| Atomic mass | **Isotope Separator** | Tune abundances on a mass spectrum to match a real element |
| Mole concept | **The Mole Machine** | Route a sample through the conversion network; shortcuts that don't exist are refused with a reason |
| Empirical formula | **Formula Detective** | Combustion analysis, gated step by step |
| Stoichiometry | **Reaction Factory** | Physical reagent stacks drain until one empties |
| Concentration | **Solution Bench** | Four concentration readouts on one beaker; heat it and watch only molarity move |
| Sets | **Set Builder** | Click the elements that satisfy a predicate; the roster assembles live |
| Set operations | **Venn Lab** | Shade regions and it names your expression — or names one and you shade it |
| Inclusion–exclusion | **Survey Room** | Fill a Venn from survey totals with live constraint checking |
| Relations | **Relation Grid** | One relation shown as a grid, arrows, roster and verdict at once |
| Types of relations | **Property Inspector** | Toggle a matrix; the three properties pass or fail with the offending pair named |
| Functions | **Function Machine** | The rule stays fixed while you edit domain and codomain, and the verdict flips |
| Composition | **Pipeline Lab** | Watch a value flow through two machines in series, then reverse them |
| Graphs | **Graph Studio** | Transformation sliders, plus a match-the-curve challenge |

Chapter 2 of each subject adds eighteen more:

| Topic | Simulation | What it teaches by doing |
|---|---|---|
| Distance vs displacement | **Path Tracer** | Draw a path; distance and displacement diverge as you draw |
| Motion graphs | **Motion Probe** | You control the *acceleration* — position is two integrations away |
| SUVAT | **SUVAT Console** | Pick the equation by which variable is missing, not by habit |
| Free fall | **Drop Tower** | Symmetry of rise and fall, with a live height–time trace |
| Relative velocity | **Frame Switcher** | The same motion replayed from a second observer's frame |
| Projectiles | **Launch Range** | Independent x and y, and the complementary-angle pair |
| Subatomic particles | **Discharge Tube** | Null the beam against a magnet, then measure *e/m* yourself |
| Quantum theory | **Photon Bench** | One λ dial drives ν, E in joules, E in eV — and a photocell that fires or doesn't |
| Bohr's model | **Spectral Lab** | Pick a jump; the line lands on the spectrum where you predicted |
| Dual nature | **Wavelength Bench** | The same λ = h/mv for an electron and a cricket ball, on one log ruler |
| Quantum numbers | **Quantum Number Inspector** | Build illegal sets on purpose; the broken rule is named as you dial |
| Configuration | **Configuration Builder** | You choose the subshell; Pauli and Hund are applied as consequences |
| Algebra of i | **Iota Engine** | Mod-4 reflex drill, then the four-line rationalisation |
| Argand plane | **Argand Plotter** | Drag the number; modulus, argument, conjugate and quadrant move together |
| De Moivre | **Root Wheel** | Powers multiply the angle one way, roots fan out the other |
| Discriminant | **Discriminant Lab** | When D goes negative the roots don't vanish — they move to an Argand panel |
| Vieta | **Root Forge** | Set the roots and watch the coefficients follow; then transform them |
| Inequalities | **Sign Chart** | Claim every interval; the curve above the line marks your work |

---

## 6b. The 22 concept animations

Simulations answer *"what happens if I change this?"*. Some ideas need the
opposite: a fixed, narrated sequence that makes one argument once, properly.
Those live in `public/js/anim/` and are embedded in a lesson as
`{ t: 'anim', id: 'sceneId' }`.

A scene is a module exporting one object:

```js
export default {
  id, title, caption, duration, loop, height,
  stillAt,                       // the frame to show when motion is reduced
  steps: [{ at: 0.24, text: '…' }],   // narration, keyed to normalised time
  draw(g, w, h, t, api) { … }         // t runs 0 → 1
};
```

The player (`ui/components/anim.js`) supplies play/pause, a scrubber, 0.5×/1×/1.5×
speed, stepped narration with dot markers, and an `IntersectionObserver` that
pauses anything scrolled out of view. Three behaviours matter:

- **`prefers-reduced-motion`** renders the single `stillAt` frame plus the full
  narration as a list. No animation, no loss of content.
- **The print pack** replaces every animation with its narration text, so a
  printed lesson still carries the argument.
- **Scenes are DOM-free apart from the canvas**, so `validate-content.js` can
  check that every referenced scene exists and is registered, and the browser
  test can render and scrub all 22.

Current scenes: vernier principle · types of error · the mole bridge ·
De Morgan · distance vs displacement · slope is velocity · area is displacement ·
free-fall symmetry · relative velocity · projectile independence · gold-foil
scattering · the photoelectric effect · Bohr transitions · de Broglie standing
waves · orbital shapes · Aufbau filling · the cycle of i · the Argand plane ·
polar rotation · roots of unity · the discriminant parabola · sum and product
of roots.

---

## 7. Content model

Content is **data, not markup**. A chapter file exports a plain object; nothing
in it can inject HTML.

```js
{
  id, subject, number, title, blurb, jeeWeight, estMin,
  guide: { name, avatar },
  intro: { speaker, avatar, lines: [] },      // story beat
  kcs: { 'kc-id': { name, weight, prereq: [] } },
  topics: [{
    id, title, short, kcs: [], prereq: [],    // prereq = topic ids
    estMin, weight,
    widget, widgetTitle, widgetBrief,
    story: { speaker, avatar, lines: [] },
    lesson: [ /* blocks */ ],
    formulas: [{ name, tex, note, star }],
    questions: [ /* see below */ ]
  }],
  boss: { name, title, avatar, hp, lives, timePerQ, intro, defeat, taunts, extraQuestions },
  formulaSheet: [{ name, tex }]
}
```

**Lesson blocks:** `p`, `h`, `ul`, `ol`, `callout` (tip/warn/trap/jee/story),
`formula`, `table`, `worked`, and `sim` — which is where the simulation is
embedded.

**Questions:**

```js
{
  id, tier: 'G'|'M'|'H',
  kind: 'mcq' | 'multi' | 'numeric' | 'integer',
  stem, options: [], answer, tol: { abs } | { rel },
  hint, solution: [ 'step', 'step', … ],
  kcs: [],       // which knowledge components this is evidence for
  parSec,        // target solve time; feeds the SRS quality score
  a, b, c        // optional IRT overrides; defaults are derived from the tier
}
```

Inline `$…$` in any string is rendered by `mathlite.js`. `**bold**`,
`*italic*` and `` `code` `` work too.

### Adding a chapter

1. Write `public/data/<subject>/chNN.js` in the shape above.
2. Import it in `public/data/registry.js` and add it to `CHAPTERS`.
3. Flip its entry in `ROADMAP` (`public/data/syllabus.js`) to `status: 'live'`.
4. Add one widget per topic under `public/js/game/widgets/`, registered in
   `public/js/game/registry.js`.
5. `npm test` — the validator will refuse ids that clash, answers out of
   range, KC typos, prerequisite cycles, missing tiers, unbalanced `$`
   delimiters and LaTeX commands the renderer cannot draw.
6. `npm run sw`.

---

## 8. Offline and printable

**PWA.** Installable, `standalone` display, four app shortcuts, maskable icon.
The service worker precaches an explicit list generated by
`tools/build-sw.js` — content-hashed, so a one-character change invalidates the
cache and nothing else does. Navigations serve the app shell from cache and
refresh behind it; everything else is stale-while-revalidate. Verified in the
browser test: **121 files precached, worker active.**

**Icons** are generated by `tools/make-icons.js`, which contains a ~60-line PNG
encoder built on Node's `zlib` — real PNG files with no image dependency.

**Print pack** (`#/print`) builds A4 paper from the same content the app uses,
so numbering and the answer key can never disagree:

- formula sheet (two-column, fold-and-keep)
- lesson notes with ruled space
- question paper — name/date/time fields, marking scheme, tier badges,
  working boxes, and an **OMR answer grid** (numeric questions get a write-in
  line instead of bubbles)
- answer key with full worked solutions, on its own page
- **"My weak areas"** — a worksheet generated from your own error history

`css/print.css` strips the app chrome, converts colour to ink-safe output,
handles page breaks and replaces canvases with a note. Verified by generating
a real PDF in the test suite (`docs/sample-print-pack.pdf`).

---

## 9. Accessibility and presentation

- Full **light theme** — selected and re-validated, not an inverted dark theme.
- High-contrast mode, text scaling 85–140%, reduced-motion honoured from both
  the OS and an in-app setting.
- Keyboard throughout: `A`–`D` to answer, `Enter` to submit and advance, `/`
  for the command palette, focus trapping in modals, a skip link.
- Charts follow one documented system (`ui/components/charts.js`): the
  three-subject categorical palette was **validated** for colourblind
  separation, lightness band, chroma and contrast in both themes (worst
  adjacent pair ΔE 19.4 deutan / 20.6 normal in dark; 22.6 / 23.5 in light).
  Magnitude uses a single-hue ramp, status colours always ship with a text
  label, and any chart that hides a value behind colour has a table view.
- Maths carries `role="math"` and a spoken-form `aria-label`.
- Verified: no horizontal scroll at 390 px.

---

## 10. Testing

| Command | What it covers |
|---|---|
| `npm run check` | Parses all 117 JS files |
| `npm run validate` | Content integrity: duplicate ids, out-of-range answers, KC typos, prerequisite cycles, missing tiers, unbalanced `$`, unsupported LaTeX, widget files that don't exist |
| `npm run smoke` | **5,521 checks** in Node against a DOM shim: every one of the 5,418 LaTeX expressions renders; all six models behave directionally; a simulated 27-answer session moves mastery, XP, streaks and the SRS schedule; every one of the 378 answer keys validates against the grader; export/import and a v1→v3 migration round-trip |
| `npm run ui` | **99 checks** in Chromium: all 21 routes, all 40 simulations mounted and clicked, all 22 animations rendered and scrubbed, a real answered question, maths rendered (no raw LaTeX leaking), light theme, mobile layout, service worker active, PDF generation, search |

`npm test` runs the first three; `npm run test:all` adds the browser pass.

Bugs this suite caught during development, all fixed:

- the router never substituted `:param` segments, so **every** parameterised
  route silently fell through to Not Found;
- a temporal-dead-zone crash in the quiz runner;
- wrong relative depth on every `data/` import inside `js/`;
- the integer grader rounded, so `5.4` was accepted for `5`;
- `\text{…}` lost its spaces ("fewestdecimalplaces");
- a `1fr` grid track letting one nowrap breadcrumb cause horizontal scroll;
- the service worker registering on an event that had already fired;
- `ground()` missing from `game/kit.js`, so two Kinematics simulations failed
  to mount;
- the content validator hard-coding the three Chapter 1 files, silently
  skipping every Chapter 2 it was supposed to check;
- the syntax checker's fallback parse rejecting top-level `await`, and then
  a shebang, in its own tool files.

---

## 11. File map

```
JEE/
├── server.js                  zero-dependency static server
├── start.bat                  Windows launcher
├── CLAUDE.md  README.md
├── docs/
│   ├── screenshots/           generated by the browser test
│   └── sample-print-pack.pdf  generated by the browser test
├── tools/
│   ├── check-syntax.js  validate-content.js  smoke-test.js  ui-test.mjs
│   ├── build-sw.js            regenerates the precache list
│   └── make-icons.js          PNG encoder + icon art
└── public/
    ├── index.html  manifest.webmanifest  sw.js  precache.js  offline.html
    ├── css/        base (tokens) · layout · components · game · print
    ├── data/
    │   ├── syllabus.js        subjects, story, full JEE roadmap, GMH tiers
    │   ├── registry.js        indices, lookups, search
    │   ├── physics/   ch01.js  ch02.js
    │   ├── chemistry/ ch01.js  ch02.js
    │   └── maths/     ch01.js  ch02.js
    ├── js/
    │   ├── main.js            bootstrap, routes, session clock
    │   ├── core/              dom · bus · store · router · mathlite · audio · fx
    │   ├── engine/            bkt · irt · elo · srs · bandit · knowledgeGraph
    │   │                      grader · recommender · analytics · quests · achievements
    │   ├── anim/              kit · registry · scenes/ (22 concept animations)
    │   ├── game/              kit · registry · widgets/ (40 simulations)
    │   └── ui/                shell · components/ (quiz, charts, lesson, overlays,
    │                                       search, anim)
    │                          views/ (dashboard, browse, topic, quizzes, boss,
    │                                  mock, progress, print, settings)
    └── assets/icons/
```

**Architectural rule worth preserving:** engines never touch the DOM and views
never contain learning logic. Engines publish facts on the event bus
(`core/bus.js`); the UI decides what to show. That separation is what lets
5,500 checks run in Node with no browser.

---

## 12. Deployment

Hosted on **Vercel**. The deployed site is `public/`, served as-is: nothing is
compiled or bundled, and `server.js` is never deployed - it exists only because
browsers block ES modules and service workers on `file://`.

Configuration is in `vercel.json`, in the repository rather than in a dashboard,
so the deploy is reproducible from a clone alone:

| Field | Value | Why |
|---|---|---|
| `buildCommand` | `npm run verify` | A red suite fails the deploy |
| `outputDirectory` | `public` | The site is the source |
| `installCommand` | an echo | There is nothing to install |
| `framework` | `null` | No preset; this is not a framework app |

**`npm run verify`** = `npm test` plus `npm run sw:check`. The second half
regenerates the precache list in memory and exits non-zero if it differs from
the committed `public/precache.js`. That is the one rule in §2 that is easy to
forget and invisible until a learner goes offline, so it is enforced rather
than documented. It compares generated text to the file on disk rather than
shelling out to `git diff`, so it behaves identically in CI, in a deploy build
with a shallow clone, and locally.

`.github/workflows/ci.yml` runs the same `npm run verify` on pull requests and
on `main`, so branches get a signal without waiting on a deployment.

### Cache headers are not optional here

`vercel.json` pins `Cache-Control: public, max-age=0, must-revalidate` on
`sw.js`, `precache.js` and `index.html`. If a CDN or browser holds an old
`sw.js`, the stale worker keeps serving its own precache and updates stop
reaching anyone who already installed the app. It is the one failure mode of an
offline-first site that is genuinely hard to debug, because it is invisible to
anyone testing with a fresh profile.

### Why the app is host-independent

Every path in `index.html`, the manifest, the precache list and the service
worker is **relative**, and the router is hash-based. So it runs unmodified from
a root domain or from a subpath, with no rewrite rules and no `404.html`
fallback. This was verified by serving `public/` behind a `/JEE/` prefix and
checking that the worker registered at the right scope, all 121 files
precached, and deep links resolved.

**The one path-dependent field** was the manifest's `id`. It resolves against
the *origin*, not the manifest URL, so a value like `/jee-ascent/` is both wrong
and liable to collide with other projects on a shared host. It is now omitted,
which makes the id default to the resolved `start_url` - correct at any path,
with nothing hardcoded.

---

## 13. Honest limitations

- **Two chapters per subject.** 6 of roughly 54 JEE chapters. The roadmap
  screens show what is missing rather than hiding it.
- **The score projection is not a rank prediction.** It estimates performance
  on *this bank of 378 questions* and says so on screen, with a confidence bar
  that stays low until you have answered enough.
- **Item difficulties start from the authored tier.** Elo re-rates them from
  real answers, but with one learner that takes a while to matter.
- **Progress is per-browser.** No sync. Export/import is one click, and the
  format is documented JSON.
- **Sound is synthesised**, so it is functional rather than beautiful. That
  was the price of shipping no audio files.
- **`mathlite` covers the subset this syllabus needs**, not all of LaTeX. The
  validator fails the build on any command it cannot draw, so this can never
  degrade silently — it either renders or the test goes red.
