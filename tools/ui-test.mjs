#!/usr/bin/env node
/**
 * Browser test: drives the real app in Chromium and fails on any console
 * error, uncaught exception or failed request.
 *
 * The Node smoke test covers the engines; this covers everything that only
 * exists once there is a DOM - every route, every one of the 22 simulations,
 * a full answered question, the print pack and the service worker.
 *
 * Playwright is optional. If it is not installed the script exits 0 with a
 * note, so `npm test` still works on a clean machine.
 *
 * Run with: npm run ui
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 5199;
const BASE = `http://127.0.0.1:${PORT}`;
const SHOTS = path.join(ROOT, 'docs', 'screenshots');

/* ---- locate playwright ------------------------------------------ */

// Playwright is CommonJS, so an ESM import can land the real exports on
// `.default` depending on how it was resolved. Unwrap either shape.
const unwrap = (m) => (m && m.chromium ? m : m?.default?.chromium ? m.default : null);

async function loadPlaywright() {
  try { const m = unwrap(await import('playwright')); if (m) return m; } catch { /* not local */ }
  // npx keeps packages in a content-addressed cache; search it.
  const cache = path.join(os.homedir(), 'AppData', 'Local', 'npm-cache', '_npx');
  if (fs.existsSync(cache)) {
    for (const dir of fs.readdirSync(cache)) {
      const p = path.join(cache, dir, 'node_modules', 'playwright', 'index.js');
      if (fs.existsSync(p)) {
        const m = unwrap(await import(pathToFileURL(p).href));
        if (m) return m;
      }
    }
  }
  return null;
}

const pw = await loadPlaywright();
if (!pw) {
  console.log('\n  Playwright not found - skipping the browser test.');
  console.log('  Install it with:  npx playwright install chromium\n');
  process.exit(0);
}

/* ---- start the server ------------------------------------------- */

const server = spawn(process.execPath, [path.join(ROOT, 'server.js'), '--port', String(PORT)], {
  cwd: ROOT, stdio: 'ignore'
});
const stop = () => { try { server.kill(); } catch { /* already gone */ } };
process.on('exit', stop);

await new Promise((r) => setTimeout(r, 900));

/* ---- run --------------------------------------------------------- */

const problems = [];
const info = [];
let passed = 0;

const browser = await pw.chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1400, height: 950 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();

// Anything the browser complains about is a failure.
page.on('console', (m) => {
  if (m.type() === 'error') {
    const t = m.text();
    // A service-worker registration warning on http is expected in this harness.
    if (/favicon/i.test(t)) return;
    problems.push(`console.error @ ${page.url().replace(BASE, '')}: ${t}`);
  }
});
page.on('pageerror', (e) => problems.push(`pageerror @ ${page.url().replace(BASE, '')}: ${e.message}`));
page.on('requestfailed', (r) => {
  if (!/favicon/.test(r.url())) problems.push(`request failed: ${r.url().replace(BASE, '')} (${r.failure()?.errorText})`);
});

fs.mkdirSync(SHOTS, { recursive: true });

/**
 * Close any modal that is open. Levelling up mid-test is correct app
 * behaviour, but the celebration dialog will happily block the next click.
 */
async function dismissModals(p = page) {
  for (let i = 0; i < 4; i++) {
    if (!(await p.locator('.modal-backdrop').count())) return;
    const btn = p.locator('.modal .btn').last();
    if (await btn.count()) await btn.click({ timeout: 2000 }).catch(() => {});
    else await p.keyboard.press('Escape');
    await p.waitForTimeout(250);
  }
}

/**
 * Navigate and assert the route really rendered.
 *
 * `expectNotFound` matters: the Not Found screen is itself a `.view`, so
 * checking only for a view would pass even when every parameterised route
 * silently fell through - which is exactly the bug this check was added for.
 */
async function go(hash, label, { shot = null, wait = 500, expectNotFound = false } = {}) {
  await page.goto(BASE + '/index.html' + hash, { waitUntil: 'networkidle' });
  await page.waitForTimeout(wait);
  await dismissModals();

  const hasView = await page.locator('#main .view').count();
  const isNotFound = (await page.locator('#main:has-text("Nothing here")').count()) > 0;

  let good = hasView > 0;
  if (!good) problems.push(`${label}: no view rendered at ${hash}`);
  else if (isNotFound && !expectNotFound) {
    problems.push(`${label}: fell through to Not Found at ${hash}`);
    good = false;
  } else if (!isNotFound && expectNotFound) {
    problems.push(`${label}: expected Not Found at ${hash}`);
    good = false;
  }

  if (good) passed++;
  if (shot) await page.screenshot({ path: path.join(SHOTS, shot), fullPage: false });
  return good;
}

console.log('\n  JEE ASCENT — browser test');
console.log('  ' + '─'.repeat(56));

/* ---- first run: onboarding --------------------------------------- */

await page.goto(BASE + '/index.html', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);

const onboard = page.locator('.modal-backdrop');
if (await onboard.count()) {
  await page.fill('.modal input[type="text"]', 'Test Cadet');
  await page.click('.modal .btn--primary');
  await page.waitForTimeout(400);
  info.push('onboarding modal appeared and accepted a name');
  passed++;
} else {
  problems.push('onboarding modal did not appear on first run');
}

await page.screenshot({ path: path.join(SHOTS, '01-dashboard.png') });
passed++;

/* ---- routes ------------------------------------------------------ */

const routes = [
  ['#/', 'dashboard'],
  ['#/subject/physics', 'subject: physics', '02-subject.png'],
  ['#/subject/chemistry', 'subject: chemistry'],
  ['#/subject/maths', 'subject: maths'],
  ['#/chapter/physics/ph-01', 'chapter: physics 1', '03-chapter.png'],
  ['#/chapter/chemistry/ch-01', 'chapter: chemistry 1'],
  ['#/chapter/maths/m-01', 'chapter: maths 1'],
  ['#/topic/physics/ph-01/ph-01-01', 'topic: SI units', '04-topic.png'],
  ['#/topic/chemistry/ch-01/ch-01-03', 'topic: mole concept'],
  ['#/topic/maths/m-01/m-01-05', 'topic: relations'],
  ['#/quiz/physics/ph-01/ph-01-01', 'drill', '05-quiz.png'],
  ['#/review', 'review'],
  ['#/practice', 'practice setup'],
  ['#/practice?go=1', 'practice run'],
  ['#/mock', 'mock setup'],
  ['#/boss/physics/ph-01', 'boss intro', '06-boss.png'],
  ['#/progress', 'progress', '07-progress.png'],
  ['#/profile', 'profile'],
  ['#/print', 'print pack', '08-print.png'],
  ['#/settings', 'settings'],
  ['#/nonsense/route', 'unknown route falls back', null, true]
];

let routesOk = 0;
for (const [hash, label, shot, expectNotFound] of routes) {
  if (await go(hash, label, { shot, expectNotFound: Boolean(expectNotFound) })) routesOk++;
}
console.log(`  ${routesOk === routes.length ? '✓' : '✗'} routes       ${routesOk} of ${routes.length} routes rendered`);
if (routesOk === 0) {
  // Nothing else can pass if the shell never boots; report now rather than
  // timing out on a locator thirty seconds later.
  await browser.close(); stop();
  console.log('\n  The app shell did not load at all:\n');
  [...new Set(problems)].slice(0, 8).forEach((p) => console.log('    ✗ ' + p));
  process.exit(1);
}

/* ---- every simulation -------------------------------------------- */

// The registry is plain data, so it imports cleanly in Node.
const { allTopics } = await import(pathToFileURL(path.join(ROOT, 'public', 'data', 'registry.js')).href);
const topics = allTopics().map((t) => ({ id: t.id, subject: t.subject, chapterId: t.chapterId, widget: t.widget }));

let widgetsOk = 0;
for (const t of topics) {
  await page.goto(`${BASE}/index.html#/play/${t.subject}/${t.chapterId}/${t.id}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);

  await dismissModals();
  const arcade = await page.locator('.arcade').count();
  const broken = await page.locator('.card:has-text("Simulation unavailable")').count();

  if (broken) problems.push(`widget ${t.widget}: failed to mount`);
  else if (!arcade) problems.push(`widget ${t.widget}: no .arcade rendered`);
  else widgetsOk++;

  // Poke it: a click in the middle of the stage must not throw.
  const stage = page.locator('.arcade__stage').first();
  if (await stage.count()) {
    const box = await stage.boundingBox();
    if (box) {
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(120);
    }
  }
}
console.log(`  ${widgetsOk === topics.length ? '✓' : '✗'} simulations  ${widgetsOk} of ${topics.length} mounted and accepted input`);
passed += widgetsOk;

await page.goto(`${BASE}/index.html#/play/physics/ph-01/ph-01-08`, { waitUntil: 'networkidle' });
await page.waitForTimeout(700);
await page.screenshot({ path: path.join(SHOTS, '09-simulation.png') });

/* ---- every concept animation ------------------------------------- */

// Find which topic embeds which scene, so each one is exercised where it
// actually lives rather than on a synthetic harness page.
const animTargets = [];
for (const t of allTopics()) {
  for (const b of t.lesson || []) {
    if (b.t === 'anim') animTargets.push({ scene: b.id, topic: t });
  }
}

let animsOk = 0;
// One screenshot per chapter, so docs/screenshots stays reproducible output
// and covers every chapter rather than whichever scenes happened to be shot.
const shotChapters = new Set();
for (const { scene, topic } of animTargets) {
  await page.goto(`${BASE}/index.html#/topic/${topic.subject}/${topic.chapterId}/${topic.id}`,
    { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);

  await dismissModals();
  const box = page.locator('.anim').first();
  if (!(await box.count())) { problems.push(`animation ${scene}: did not mount in ${topic.id}`); continue; }
  await box.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);

  // The canvas must have real pixels, and the narration must have text.
  const info = await box.evaluate((el) => {
    const c = el.querySelector('canvas');
    return {
      w: c ? c.width : 0,
      h: c ? c.height : 0,
      steps: el.querySelectorAll('.anim__dots i, .anim__steplist li').length,
      title: el.querySelector('.anim__title')?.textContent || ''
    };
  });

  if (!info.w || !info.h) { problems.push(`animation ${scene}: canvas has no size`); continue; }
  if (info.steps < 3) { problems.push(`animation ${scene}: only ${info.steps} narration steps`); continue; }
  if (!info.title) { problems.push(`animation ${scene}: no title`); continue; }

  // Scrub to three points; a throwing draw() would surface as a pageerror.
  for (const at of [0.25, 0.6, 0.95]) {
    await page.evaluate((v) => {
      const s = document.querySelector('.anim__scrub');
      if (s) { s.value = String(Math.round(v * 1000)); s.dispatchEvent(new Event('input', { bubbles: true })); }
    }, at);
    await page.waitForTimeout(120);
  }

  if (!shotChapters.has(topic.chapterId)) {
    shotChapters.add(topic.chapterId);
    await box.screenshot({ path: path.join(SHOTS, `anim-${topic.chapterId}-${scene}.png`) });
  }
  animsOk++;
}
console.log(`  ${animsOk === animTargets.length ? '✓' : '✗'} animations   ${animsOk} of ${animTargets.length} rendered and scrubbed`);
passed += animsOk;

/* ---- answer a question for real ---------------------------------- */

await page.goto(`${BASE}/index.html#/quiz/physics/ph-01/ph-01-01`, { waitUntil: 'networkidle' });
await page.waitForTimeout(600);
await dismissModals();

const optCount = await page.locator('.opt').count();
if (!optCount) problems.push('quiz: no options rendered');
else {
  await page.locator('.opt').first().click();
  await page.waitForTimeout(150);
  await page.locator('.btn--primary:has-text("Check answer")').click();
  await page.waitForTimeout(700);
  await dismissModals();

  const verdict = await page.locator('.verdict').count();
  if (!verdict) problems.push('quiz: no verdict shown after checking an answer');
  else passed++;

  const solution = await page.locator('.verdict ol li').count();
  if (!solution) problems.push('quiz: solution steps missing from the verdict');
  else passed++;

  await page.screenshot({ path: path.join(SHOTS, '10-answered.png') });

  // XP chip must have moved off zero.
  const xp = await page.locator('#xp-n').textContent();
  if (!xp || xp === '0') problems.push(`quiz: XP did not update (chip reads "${xp}")`);
  else { passed++; info.push(`XP after one answer: ${xp}`); }
}

/* ---- maths actually rendered, not raw LaTeX ---------------------- */

await page.goto(`${BASE}/index.html#/topic/physics/ph-01/ph-01-03`, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);

const mathNodes = await page.locator('.math').count();
if (mathNodes < 10) problems.push(`maths: only ${mathNodes} .math nodes on a formula-heavy topic`);
else { passed++; info.push(`${mathNodes} rendered maths expressions on one topic page`); }

const rawLatex = await page.locator('#main').evaluate((el) => (el.textContent.match(/\\[a-zA-Z]{2,}/g) || []).slice(0, 5));
if (rawLatex.length) problems.push(`maths: raw LaTeX leaked into the page: ${rawLatex.join(', ')}`);
else passed++;

/* ---- light theme -------------------------------------------------- */

await page.goto(`${BASE}/index.html#/settings`, { waitUntil: 'networkidle' });
await page.waitForTimeout(400);
await page.selectOption('.card select', 'light');
await page.waitForTimeout(400);
const theme = await page.evaluate(() => document.documentElement.dataset.theme);
if (theme !== 'light') problems.push(`theme: switching to light did not apply (got "${theme}")`);
else passed++;
await page.goto(`${BASE}/index.html#/`, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
await page.screenshot({ path: path.join(SHOTS, '11-light-theme.png') });
await page.goto(`${BASE}/index.html#/settings`, { waitUntil: 'networkidle' });
await page.selectOption('.card select', 'dark');
await page.waitForTimeout(300);

/* ---- mobile layout ------------------------------------------------ */

const mobile = await ctx.newPage();
await mobile.setViewportSize({ width: 390, height: 844 });
await mobile.goto(`${BASE}/index.html#/`, { waitUntil: 'networkidle' });
await mobile.waitForTimeout(700);
const navVisible = await mobile.locator('.mobilenav').isVisible();
if (!navVisible) problems.push('mobile: bottom navigation is not visible at 390px');
else passed++;
const hScroll = await mobile.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
if (hScroll) problems.push('mobile: the page scrolls horizontally at 390px');
else passed++;
await mobile.screenshot({ path: path.join(SHOTS, '12-mobile.png'), fullPage: false });
await mobile.close();

/* ---- service worker ---------------------------------------------- */

await page.goto(`${BASE}/index.html`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1600);
const swState = await page.evaluate(async () => {
  if (!('serviceWorker' in navigator)) return 'unsupported';
  const reg = await navigator.serviceWorker.getRegistration();
  return reg ? (reg.active ? 'active' : 'registered') : 'none';
});
if (swState === 'none') problems.push('service worker: did not register');
else { passed++; info.push(`service worker: ${swState}`); }

const cached = await page.evaluate(async () => {
  const keys = await caches.keys();
  if (!keys.length) return 0;
  const c = await caches.open(keys[0]);
  return (await c.keys()).length;
});
if (cached < 40) problems.push(`service worker: only ${cached} files precached`);
else { passed++; info.push(`precached ${cached} files`); }

/* ---- the print pack actually prints -------------------------------- */

await page.goto(`${BASE}/index.html#/print?chapter=ph-01`, { waitUntil: 'networkidle' });
await page.waitForTimeout(900);

const sheets = await page.locator('.paper').count();
if (sheets < 3) problems.push(`print: expected formula sheet + paper + key, found ${sheets} sheets`);
else { passed++; info.push(`print pack built ${sheets} A4 sheets`); }

// Emulate print media so the @media print rules are the ones under test.
await page.emulateMedia({ media: 'print' });
await page.waitForTimeout(300);

const chromeHidden = await page.evaluate(() => {
  const gone = (sel) => {
    const el = document.querySelector(sel);
    return !el || getComputedStyle(el).display === 'none';
  };
  return { rail: gone('.rail'), topbar: gone('.topbar'), nav: gone('.mobilenav') };
});
if (!chromeHidden.rail || !chromeHidden.topbar) {
  problems.push(`print: app chrome not hidden (rail hidden=${chromeHidden.rail}, topbar hidden=${chromeHidden.topbar})`);
} else passed++;

const pdfPath = path.join(ROOT, 'docs', 'sample-print-pack.pdf');
await page.pdf({ path: pdfPath, format: 'A4', printBackground: true, margin: { top: '14mm', bottom: '15mm', left: '13mm', right: '13mm' } });
const pdfSize = fs.statSync(pdfPath).size;
if (pdfSize < 20000) problems.push(`print: generated PDF is suspiciously small (${pdfSize} bytes)`);
else { passed++; info.push(`sample PDF: ${(pdfSize / 1024).toFixed(0)} KB → docs/sample-print-pack.pdf`); }

await page.emulateMedia({ media: 'screen' });

/* ---- search palette ------------------------------------------------ */

await page.goto(`${BASE}/index.html#/`, { waitUntil: 'networkidle' });
await page.waitForTimeout(400);
await page.keyboard.press('/');
await page.waitForTimeout(300);
if (!(await page.locator('.modal input[type="search"]').count())) {
  problems.push('search: "/" did not open the palette');
} else {
  await page.fill('.modal input[type="search"]', 'limiting reagent');
  await page.waitForTimeout(300);
  const results = await page.locator('.modal a').count();
  if (!results) problems.push('search: no results for "limiting reagent"');
  else { passed++; info.push(`search returned ${results} results`); }
  await page.keyboard.press('Escape');
}

/* ---- done ---------------------------------------------------------- */

await browser.close();
stop();

console.log('  ' + '─'.repeat(56));
for (const i of info) console.log('  · ' + i);
console.log(`  screenshots → docs/screenshots/`);
console.log('  ' + '─'.repeat(56));

if (problems.length) {
  console.log(`\n  ${problems.length} problem(s):\n`);
  [...new Set(problems)].forEach((p) => console.log('    ✗ ' + p));
  console.log('');
  process.exit(1);
}
console.log(`\n  ✓ ${passed} browser checks passed, no console errors\n`);
