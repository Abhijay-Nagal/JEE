#!/usr/bin/env node
/**
 * Parses every JS file under public/ and server.js with Node's own parser.
 * Catches syntax errors without needing a browser or a bundler.
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.js')) out.push(p);
  }
  return out;
}

const files = [...walk(path.join(ROOT, 'public')), path.join(ROOT, 'server.js'), ...walk(path.join(ROOT, 'tools'))];
let bad = 0;

for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  const rel = path.relative(ROOT, f).replace(/\\/g, '/');
  try {
    // SourceTextModule isn't enabled by default, so compile as a module-shaped
    // script: wrap import/export detection by trying Module syntax via vm.
    new vm.Script(src, { filename: rel, importModuleDynamically: () => {} });
  } catch (err) {
    if (/Cannot use import statement|Unexpected token 'export'|await is only valid/.test(err.message)) {
      // ES module syntax at top level - re-check with a module-aware parse.
      try {
        // eslint-disable-next-line no-new-func
        new Function(`return import(${JSON.stringify('data:text/javascript,' + encodeURIComponent(src))})`);
        // The above only validates the wrapper; do a real parse instead:
        checkModule(src, rel);
      } catch (e2) {
        console.error(`  ✗ ${rel}\n    ${e2.message}`);
        bad++;
      }
      continue;
    }
    console.error(`  ✗ ${rel}\n    ${err.message}`);
    bad++;
  }
}

function checkModule(src, rel) {
  // Strip nothing; let Node parse it as a module via dynamic import of a blob.
  // Works because these files have no side effects at import time that need a DOM
  // ... except the browser ones. So instead we use the parser directly:
  const wrapped = src;
  try {
    new vm.SourceTextModule(wrapped, { identifier: rel });
  } catch (err) {
    if (err instanceof ReferenceError || /SourceTextModule/.test(String(err))) {
      // vm modules not enabled (no --experimental-vm-modules): fall back to a
      // structural check that still catches unbalanced braces/strings.
      structuralCheck(wrapped, rel);
      return;
    }
    throw err;
  }
}

/** Last-resort parse: strip module keywords and compile the rest. */
function structuralCheck(src, rel) {
  const stripped = src
    // A shebang is only legal at offset 0, and the wrapper below moves it.
    .replace(/^#![^\n]*\n/, '')
    .replace(/^\s*import\s+[^;]*?;\s*$/gm, '')
    // Dynamic import is a syntax error in a plain Script, so neutralise the
    // call anywhere it appears, not only at the start of a line.
    .replace(/\bimport\s*\(/g, '__dynimport(')
    .replace(/^\s*export\s+default\s+/gm, 'var __default = ')
    .replace(/^\s*export\s+\{[^}]*\}\s*;?\s*$/gm, '')
    .replace(/^\s*export\s+/gm, '')
    .replace(/\bimport\.meta\b/g, '({url:""})');
  // Top-level await is legal in a module but not in a Script, so the stripped
  // body goes inside an async wrapper. Without this the tools that await their
  // own dynamic imports are reported as syntax errors when they are fine.
  new vm.Script(`async function __mod__() {\n${stripped}\n}`, { filename: rel });
}

if (bad) {
  console.error(`\n${bad} file(s) failed to parse.\n`);
  process.exit(1);
}
console.log(`✓ ${files.length} JS files parsed cleanly.`);
