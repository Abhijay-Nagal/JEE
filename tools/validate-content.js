#!/usr/bin/env node
/**
 * Content integrity checks.
 *
 * The chapter files are hand-authored and large, so this catches the mistakes
 * that a browser would only reveal at the moment a learner hits the broken
 * question: duplicate ids, answers pointing past the end of the options array,
 * KC references with a typo, prerequisite cycles, missing solutions.
 *
 * Run with: npm run validate
 */
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

// fileURLToPath handles drive letters and percent-encoding on every platform;
// hand-stripping the leading slash only worked on Windows by accident.
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA = path.join(ROOT, 'public', 'data');

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

// Read the chapter list from the registry rather than hardcoding it, so a
// newly added chapter is validated the moment it is wired in - a hardcoded
// list here silently skipped Chapter 2 the first time one was added.
const { CHAPTERS: chapters } = await import(pathToFileURL(path.join(DATA, 'registry.js')).href);

/* ---- widget registry cross-check ---- */
const widgetDir = path.join(ROOT, 'public', 'js', 'game', 'widgets');
const widgetFiles = fs.existsSync(widgetDir)
  ? fs.readdirSync(widgetDir).filter((f) => f.endsWith('.js')).map((f) => f.replace(/\.js$/, ''))
  : [];

const sceneDir = path.join(ROOT, 'public', 'js', 'anim', 'scenes');
const sceneFiles = fs.existsSync(sceneDir)
  ? fs.readdirSync(sceneDir).filter((f) => f.endsWith('.js')).map((f) => f.replace(/\.js$/, ''))
  : [];
// Every scene must also be wired into the lazy-import registry, or it will
// 404 at runtime even though the file is right there.
const sceneRegistry = fs.existsSync(path.join(ROOT, 'public', 'js', 'anim', 'registry.js'))
  ? fs.readFileSync(path.join(ROOT, 'public', 'js', 'anim', 'registry.js'), 'utf8')
  : '';
for (const f of sceneFiles) {
  if (!sceneRegistry.includes(`./scenes/${f}.js`)) err(`[anim] scene "${f}" exists but is not in anim/registry.js`);
}

/* ================================================================ */

const seenIds = new Set();
const seenQIds = new Set();
const allKcIds = new Set();
const allTopicIds = new Set();

for (const ch of chapters) {
  for (const id of Object.keys(ch.kcs || {})) allKcIds.add(id);
  for (const t of ch.topics || []) allTopicIds.add(t.id);
}

let nQuestions = 0, nTopics = 0, nSolutionSteps = 0, nAnims = 0;
const tierCount = { G: 0, M: 0, H: 0 };

for (const ch of chapters) {
  const ctx = `[${ch.id}]`;

  if (!ch.id || !ch.subject || !ch.title) err(`${ctx} missing id/subject/title`);
  if (seenIds.has(ch.id)) err(`${ctx} duplicate chapter id`);
  seenIds.add(ch.id);
  if (!ch.boss) warn(`${ctx} has no boss defined`);
  if (!ch.formulaSheet?.length) warn(`${ctx} has no formulaSheet`);
  if (!ch.intro?.lines?.length) warn(`${ctx} has no intro story`);

  /* ---- KC graph ---- */
  for (const [kcId, kc] of Object.entries(ch.kcs || {})) {
    if (!kc.name) err(`${ctx} KC "${kcId}" has no name`);
    for (const p of kc.prereq || []) {
      if (!allKcIds.has(p)) err(`${ctx} KC "${kcId}" lists unknown prerequisite "${p}"`);
    }
  }
  // Cycle detection over this chapter's KC prerequisites.
  const state = new Map();
  const visit = (id, trail = []) => {
    if (state.get(id) === 'done') return;
    if (state.get(id) === 'open') { err(`${ctx} prerequisite cycle: ${[...trail, id].join(' -> ')}`); return; }
    state.set(id, 'open');
    for (const p of ch.kcs[id]?.prereq || []) if (ch.kcs[p]) visit(p, [...trail, id]);
    state.set(id, 'done');
  };
  Object.keys(ch.kcs || {}).forEach((id) => visit(id));

  /* ---- topics ---- */
  const kcsUsedByTopics = new Set();

  for (const t of ch.topics || []) {
    nTopics++;
    const tctx = `[${t.id}]`;
    if (seenIds.has(t.id)) err(`${tctx} duplicate topic id`);
    seenIds.add(t.id);

    if (!t.title) err(`${tctx} missing title`);
    if (!t.kcs?.length) err(`${tctx} declares no KCs`);
    for (const k of t.kcs || []) {
      if (!ch.kcs[k]) err(`${tctx} references unknown KC "${k}"`);
      kcsUsedByTopics.add(k);
    }
    for (const p of t.prereq || []) {
      if (!allTopicIds.has(p)) err(`${tctx} lists unknown prerequisite topic "${p}"`);
    }
    if (!t.lesson?.length) err(`${tctx} has no lesson blocks`);
    if (!t.lesson?.some((b) => b.t === 'sim')) warn(`${tctx} lesson never embeds its simulation`);
    if (!t.widget) err(`${tctx} has no widget`);
    else if (widgetFiles.length && !widgetFiles.includes(t.widget)) {
      err(`${tctx} widget "${t.widget}" has no file in js/game/widgets/`);
    }

    /* ---- lesson blocks ---- */
    for (const b of t.lesson || []) if (b.t === 'anim') nAnims++;

    for (const [i, b] of (t.lesson || []).entries()) {
      const known = ['p', 'h', 'ul', 'ol', 'callout', 'formula', 'table', 'worked', 'sim', 'anim'];
      if (!known.includes(b.t)) err(`${tctx} lesson block ${i} has unknown type "${b.t}"`);
      if (b.t === 'table') {
        if (!b.head?.length || !b.rows?.length) err(`${tctx} lesson block ${i}: empty table`);
        else for (const [ri, row] of b.rows.entries()) {
          if (row.length !== b.head.length) {
            err(`${tctx} lesson block ${i} row ${ri}: ${row.length} cells but ${b.head.length} headers`);
          }
        }
      }
      if (b.t === 'formula' && !b.tex) err(`${tctx} lesson block ${i}: formula with no tex`);
      if (b.t === 'worked' && (!b.steps?.length || !b.ans)) err(`${tctx} lesson block ${i}: incomplete worked example`);
      if (b.t === 'anim') {
        if (!b.id) err(`${tctx} lesson block ${i}: anim with no scene id`);
        else if (sceneFiles.length && !sceneFiles.includes(b.id)) {
          err(`${tctx} references animation scene "${b.id}", which has no file in js/anim/scenes/`);
        }
      }
    }

    /* ---- questions ---- */
    const tierHere = { G: 0, M: 0, H: 0 };
    for (const q of t.questions || []) {
      nQuestions++;
      checkQuestion(q, tctx, ch);
      tierHere[q.tier] = (tierHere[q.tier] || 0) + 1;
      tierCount[q.tier] = (tierCount[q.tier] || 0) + 1;
      nSolutionSteps += q.solution?.length || 0;
    }
    for (const tier of ['G', 'M', 'H']) {
      if (!tierHere[tier]) err(`${tctx} has no ${tier}-tier questions`);
    }
    if ((t.questions || []).length < 6) warn(`${tctx} has only ${(t.questions || []).length} questions`);
  }

  for (const kcId of Object.keys(ch.kcs || {})) {
    if (!kcsUsedByTopics.has(kcId)) warn(`${ctx} KC "${kcId}" is not taught by any topic`);
  }

  /* ---- boss ---- */
  for (const q of ch.boss?.extraQuestions || []) {
    nQuestions++;
    checkQuestion(q, `[${ch.id} boss]`, ch);
    tierCount[q.tier] = (tierCount[q.tier] || 0) + 1;
    nSolutionSteps += q.solution?.length || 0;
  }
}

function checkQuestion(q, ctx, ch) {
  const c = `${ctx} ${q.id}`;
  if (!q.id) { err(`${ctx} question with no id`); return; }
  if (seenQIds.has(q.id)) err(`${c} duplicate question id`);
  seenQIds.add(q.id);

  if (!['G', 'M', 'H'].includes(q.tier)) err(`${c} invalid tier "${q.tier}"`);
  if (!q.stem) err(`${c} has no stem`);
  if (!q.solution?.length) err(`${c} has no solution steps`);
  if (!q.hint) warn(`${c} has no hint`);
  if (!q.parSec) warn(`${c} has no parSec (target time)`);
  if (!q.kcs?.length) err(`${c} is not tagged with any KC`);
  for (const k of q.kcs || []) {
    if (!ch.kcs[k]) err(`${c} references unknown KC "${k}"`);
  }

  const kind = q.kind || 'mcq';
  switch (kind) {
    case 'mcq':
      if (!Array.isArray(q.options) || q.options.length < 2) { err(`${c} mcq needs >= 2 options`); break; }
      if (typeof q.answer !== 'number' || q.answer < 0 || q.answer >= q.options.length) {
        err(`${c} answer index ${q.answer} is out of range (0..${q.options.length - 1})`);
      }
      if (new Set(q.options).size !== q.options.length) err(`${c} has duplicate options`);
      break;
    case 'multi':
      if (!Array.isArray(q.answer) || !q.answer.length) err(`${c} multi needs an array answer`);
      else for (const a of q.answer) {
        if (a < 0 || a >= (q.options?.length ?? 0)) err(`${c} multi answer index ${a} out of range`);
      }
      break;
    case 'integer':
      if (!Number.isFinite(Number(q.answer))) err(`${c} integer answer is not a number`);
      else if (!Number.isInteger(Number(q.answer))) err(`${c} integer question has non-integer answer ${q.answer}`);
      break;
    case 'numeric':
      if (!Number.isFinite(Number(q.answer))) err(`${c} numeric answer is not a number`);
      if (q.tol === undefined) warn(`${c} numeric question has no tolerance (defaults to 1% relative)`);
      break;
    default:
      err(`${c} unknown question kind "${kind}"`);
  }

  // Unbalanced $ delimiters render as raw LaTeX, which looks broken.
  const fields = [q.stem, q.hint, ...(q.options || []), ...(q.solution || [])].filter(Boolean);
  for (const f of fields) {
    const n = (String(f).match(/\$/g) || []).length;
    if (n % 2 !== 0) err(`${c} has an odd number of $ delimiters in: "${String(f).slice(0, 60)}..."`);
  }
}

/* ---- cross-file LaTeX support check ---- */
const SUPPORTED = new Set(`frac dfrac tfrac sqrt text textrm textbf textit mathrm mathbf mathbb mathit operatorname vec hat bar overline underline left right lim sum prod int oint bigcup bigcap coprod iint
alpha beta gamma delta epsilon varepsilon zeta eta theta vartheta iota kappa lambda mu nu xi pi varpi rho varrho sigma varsigma tau upsilon phi varphi chi psi omega
Gamma Delta Theta Lambda Xi Pi Sigma Upsilon Phi Psi Omega
times cdot div pm mp ast star bullet oplus ominus otimes odot le leq ge geq ne neq ll gg approx sim simeq cong equiv propto to rightarrow longrightarrow leftarrow leftrightarrow Rightarrow Leftarrow Leftrightarrow implies impliedby iff mapsto uparrow downarrow in notin ni subset subseteq supset supseteq nsubseteq nsubset cup cap setminus symdiff triangle sqsubseteq land lor wedge vee neg perp parallel angle therefore because leftrightharpoons rightleftharpoons nleq ngeq nless ngtr subsetneq supsetneq preceq succeq
infty emptyset varnothing forall exists nexists partial nabla prime degree circ ldots dots cdots vdots ddots aleph hbar ell Re Im wp checkmark dagger bigcirc square blacksquare langle rangle lfloor rfloor lceil rceil mid backslash percent
sin cos tan cot sec csc sinh cosh tanh arcsin arccos arctan log ln lg exp det dim gcd lcm max min sup inf deg arg mod
quad qquad displaystyle limits nolimits overset underset stackrel widehat
xrightarrow xleftarrow xleftrightarrow xrightleftharpoons big Big bigg Bigg`.split(/\s+/).filter(Boolean));

for (const rel of ['physics/ch01.js', 'chemistry/ch01.js', 'maths/ch01.js']) {
  const src = fs.readFileSync(path.join(DATA, rel), 'utf8');
  const bad = new Map();
  for (const m of src.matchAll(/\\\\([A-Za-z]+)/g)) {
    if (!SUPPORTED.has(m[1])) bad.set(m[1], (bad.get(m[1]) || 0) + 1);
  }
  for (const [name, n] of bad) err(`[${rel}] uses \\${name} (${n}x) which mathlite.js cannot render`);
}

/* ================================================================ */

console.log('');
console.log('  JEE ASCENT — content validation');
console.log('  ' + '─'.repeat(52));
console.log(`  chapters        ${chapters.length}`);
console.log(`  topics          ${nTopics}`);
console.log(`  questions       ${nQuestions}   (G ${tierCount.G} / M ${tierCount.M} / H ${tierCount.H})`);
console.log(`  knowledge comps ${allKcIds.size}`);
console.log(`  solution steps  ${nSolutionSteps}`);
console.log(`  widgets found   ${widgetFiles.length}`);
console.log(`  animations      ${nAnims} embedded · ${sceneFiles.length} scenes built`);
console.log('  ' + '─'.repeat(52));

if (warnings.length) {
  console.log(`\n  ${warnings.length} warning(s):`);
  warnings.forEach((w) => console.log('    ! ' + w));
}
if (errors.length) {
  console.log(`\n  ${errors.length} ERROR(s):`);
  errors.forEach((e) => console.log('    ✗ ' + e));
  console.log('');
  process.exit(1);
}
console.log('\n  ✓ content is valid\n');
