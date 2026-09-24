/**
 * mathlite.js - a dependency-free renderer for the LaTeX subset this syllabus
 * actually uses.
 *
 * Why not KaTeX/MathJax: the platform is offline-first and must work with zero
 * network and zero npm install. Those libraries are ~300KB and would have to be
 * vendored and kept in sync. The maths in JEE Chapter 1 content is narrow -
 * fractions, roots, sub/superscripts, Greek, set/relational operators, big
 * operators with limits - so a ~350-line parser covers it exactly.
 *
 * Output is plain DOM styled by the `.math` rules in base.css.
 *
 *   renderMath('\\frac{1}{2}mv^2')      -> <span class="math">...</span>
 *   renderInline('KE is $\\frac12mv^2$') -> DocumentFragment (text + math)
 */

import { h } from './dom.js';

/* ------------------------------------------------------------------ */
/* symbol tables                                                       */
/* ------------------------------------------------------------------ */

const GREEK = {
  alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ϵ', varepsilon: 'ε',
  zeta: 'ζ', eta: 'η', theta: 'θ', vartheta: 'ϑ', iota: 'ι', kappa: 'κ',
  lambda: 'λ', mu: 'μ', nu: 'ν', xi: 'ξ', pi: 'π', varpi: 'ϖ', rho: 'ρ',
  varrho: 'ϱ', sigma: 'σ', varsigma: 'ς', tau: 'τ', upsilon: 'υ', phi: 'ϕ',
  varphi: 'φ', chi: 'χ', psi: 'ψ', omega: 'ω',
  Gamma: 'Γ', Delta: 'Δ', Theta: 'Θ', Lambda: 'Λ', Xi: 'Ξ', Pi: 'Π',
  Sigma: 'Σ', Upsilon: 'Υ', Phi: 'Φ', Psi: 'Ψ', Omega: 'Ω'
};

/** Binary/relational operators - rendered upright with side padding. */
const OPS = {
  times: '×', cdot: '·', div: '÷', pm: '±', mp: '∓', ast: '∗', star: '⋆',
  bullet: '∙', oplus: '⊕', ominus: '⊖', otimes: '⊗', odot: '⊙',
  le: '≤', leq: '≤', ge: '≥', geq: '≥', ne: '≠', neq: '≠', ll: '≪', gg: '≫',
  approx: '≈', sim: '∼', simeq: '≃', cong: '≅', equiv: '≡', propto: '∝',
  to: '→', rightarrow: '→', longrightarrow: '⟶', leftarrow: '←',
  leftrightarrow: '↔', Rightarrow: '⇒', Leftarrow: '⇐', Leftrightarrow: '⇔',
  implies: '⟹', impliedby: '⟸', iff: '⟺', mapsto: '↦', uparrow: '↑', downarrow: '↓',
  in: '∈', notin: '∉', ni: '∋', subset: '⊂', subseteq: '⊆', supset: '⊃',
  supseteq: '⊇', nsubseteq: '⊈', nsubset: '⊄', cup: '∪', cap: '∩',
  setminus: '∖', symdiff: '△', triangle: '△', sqsubseteq: '⊑',
  land: '∧', lor: '∨', wedge: '∧', vee: '∨', neg: '¬',
  perp: '⊥', parallel: '∥', angle: '∠', therefore: '∴', because: '∵',
  leftrightharpoons: '⇌', rightleftharpoons: '⇌',
  nleq: '≰', ngeq: '≱', nless: '≮', ngtr: '≯',
  subsetneq: '⊊', supsetneq: '⊋', preceq: '≼', succeq: '≽',
  // \bmod is the infix form of "mod"; the \mod function name is in FUNCS.
  bmod: 'mod'
};

/** Arrows that carry a label above them: \xrightarrow{...} */
const XARROW = {
  xrightarrow: '→', xleftarrow: '←',
  xleftrightarrow: '↔', xrightleftharpoons: '⇌'
};

/** Standalone symbols - rendered upright, no extra padding. */
const SYMS = {
  infty: '∞', emptyset: '∅', varnothing: '∅', forall: '∀', exists: '∃',
  nexists: '∄', partial: '∂', nabla: '∇', prime: '′', degree: '°', circ: '∘',
  ldots: '…', dots: '…', cdots: '⋯', vdots: '⋮', ddots: '⋱',
  aleph: 'ℵ', hbar: 'ℏ', ell: 'ℓ', Re: 'ℜ', Im: 'ℑ', wp: '℘',
  mathbb_R: 'ℝ', mathbb_N: 'ℕ', mathbb_Z: 'ℤ', mathbb_Q: 'ℚ', mathbb_C: 'ℂ',
  checkmark: '✓', dagger: '†', bigcirc: '◯', square: '□', blacksquare: '■',
  langle: '⟨', rangle: '⟩', lfloor: '⌊', rfloor: '⌋', lceil: '⌈', rceil: '⌉',
  mid: '∣', parallelsym: '∥', backslash: '\\', percent: '%'
};

/** Escaped literals: \{ \} \% \& \# \_ \$ */
const ESCAPED = { '{': '{', '}': '}', '%': '%', '&': '&', '#': '#', '_': '_', $: '$' };

/** Upright function names. */
const FUNCS = new Set([
  'sin', 'cos', 'tan', 'cot', 'sec', 'csc', 'sinh', 'cosh', 'tanh',
  'arcsin', 'arccos', 'arctan', 'log', 'ln', 'lg', 'exp', 'det', 'dim',
  'gcd', 'lcm', 'max', 'min', 'sup', 'inf', 'deg', 'arg', 'mod'
]);

/** Big operators that stack their limits (sum) vs. hang them (int). */
const BIG = { sum: ['∑', true], prod: ['∏', true], coprod: ['∐', true], bigcup: ['⋃', true], bigcap: ['⋂', true], int: ['∫', false], iint: ['∬', false], oint: ['∮', false] };

const SPACES = { ',': ' ', ':': ' ', ';': ' ', '!': '', ' ': ' ', quad: ' ', qquad: '  ' };

/* ------------------------------------------------------------------ */
/* tokenizer                                                           */
/* ------------------------------------------------------------------ */

function tokenize(src) {
  const out = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];

    if (c === '\\') {
      const rest = src.slice(i + 1);
      const word = /^[A-Za-z]+/.exec(rest);
      if (word) { out.push({ t: 'cmd', v: word[0] }); i += 1 + word[0].length; continue; }
      const nxt = src[i + 1];
      if (nxt === '\\') { out.push({ t: 'br' }); i += 2; continue; }
      out.push({ t: 'cmd', v: nxt ?? '' }); i += 2; continue;
    }

    if (c === '{' || c === '}' || c === '^' || c === '_' || c === '&') {
      out.push({ t: c }); i++; continue;
    }

    // Whitespace is meaningless in maths mode but significant inside
    // \text{...}, so keep it as a token and let the parser decide.
    if (/\s/.test(c)) {
      let j = i;
      while (j < src.length && /\s/.test(src[j])) j++;
      out.push({ t: 'sp' });
      i = j;
      continue;
    }

    // Group consecutive digits (with an optional decimal part) into one atom so
    // that 12.5^2 raises the whole number, matching LaTeX's visual intent here.
    const num = /^\d+(?:\.\d+)?/.exec(src.slice(i));
    if (num) { out.push({ t: 'num', v: num[0] }); i += num[0].length; continue; }

    out.push({ t: 'ch', v: c }); i++;
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* parser -> DOM                                                       */
/* ------------------------------------------------------------------ */

const PUNCT = new Set([',', ';', ':']);
const RELCH = new Set(['=', '<', '>', '+', '−', '-', '±']);
const FENCE = new Set(['(', ')', '[', ']', '|', '/']);

class Parser {
  constructor(tokens) { this.k = tokens; this.i = 0; }
  peek(o = 0) { return this.k[this.i + o]; }
  next() { return this.k[this.i++]; }
  /** Maths mode ignores whitespace; call before peeking for a structural token. */
  skipSpace() { while (this.k[this.i]?.t === 'sp') this.i++; }

  /** Parse until `}` (or end). Returns an array of DOM nodes. */
  parseList(stopAtBrace = false) {
    const out = [];
    while (this.i < this.k.length) {
      const tk = this.peek();
      if (tk.t === '}') { if (stopAtBrace) { this.next(); } break; }
      if (tk.t === '^' || tk.t === '_') { this.attachScript(out); continue; }
      // A space before a script still binds the script to the previous atom.
      if (tk.t === 'sp' && (this.peek(1)?.t === '^' || this.peek(1)?.t === '_')) {
        this.next();
        this.attachScript(out);
        continue;
      }
      const node = this.atom();
      if (node) out.push(node);
    }
    return out;
  }

  /** Read one `{...}` group (or a single atom if no braces) as a node list. */
  group() {
    this.skipSpace();
    const tk = this.peek();
    if (!tk) return [];
    if (tk.t === '{') { this.next(); return this.parseList(true); }
    const a = this.atom();
    return a ? [a] : [];
  }

  groupNode(extraClass) {
    const nodes = this.group();
    if (nodes.length === 1 && !extraClass) return nodes[0];
    return h('span' + (extraClass ? '.' + extraClass : ''), null, nodes);
  }

  /** Optional `[...]` argument, used by \sqrt[3]{x}. */
  optional() {
    this.skipSpace();
    const tk = this.peek();
    if (tk && tk.t === 'ch' && tk.v === '[') {
      this.next();
      const nodes = [];
      while (this.i < this.k.length) {
        const t2 = this.peek();
        if (t2.t === 'ch' && t2.v === ']') { this.next(); break; }
        const a = this.atom();
        if (a) nodes.push(a);
      }
      return nodes;
    }
    return null;
  }

  /** Attach ^ / _ to the previously emitted atom. */
  attachScript(out) {
    let sup = null, sub = null;
    this.skipSpace();
    while (this.peek() && (this.peek().t === '^' || this.peek().t === '_')) {
      const kind = this.next().t;
      const body = this.groupNode();
      if (kind === '^') sup = body; else sub = body;
    }
    const base = out.pop() ?? h('span', null, '');

    // A big operator already carries its own limit slots.
    if (base.dataset && base.dataset.big === 'stack') {
      out.push(stackedBig(base, sup, sub));
      return;
    }

    if (sup && sub) {
      out.push(base, h('span.msubsup', null, h('span', null, sup), h('span', null, sub)));
    } else if (sup) {
      out.push(base, h('span.msup', null, sup));
    } else {
      out.push(base, h('span.msub', null, sub));
    }
  }

  atom() {
    const tk = this.next();
    if (!tk) return null;

    switch (tk.t) {
      case 'sp':  return null;            // ignored in maths mode
      case 'num': return h('span.mnum', null, tk.v);
      case 'br':  return h('span', { style: { display: 'block', height: '.5em' } });
      case '&':   return h('span.mop', null, ' ');
      case '{': { this.i--; return this.groupNode(); }
      case 'ch':  return this.charAtom(tk.v);
      case 'cmd': return this.cmdAtom(tk.v);
      default:    return null;
    }
  }

  charAtom(c) {
    if (PUNCT.has(c)) return h('span.mpunct', null, c);
    if (RELCH.has(c)) return h('span.mop', null, c === '-' ? '−' : c);
    if (FENCE.has(c)) return h('span.mfence', null, c);
    if (c === "'") return h('span.msup', null, '′');
    return document.createTextNode(c); // italic variable, via .math font-style
  }

  cmdAtom(name) {
    // --- structures ---
    if (name === 'frac' || name === 'dfrac' || name === 'tfrac') {
      const num = this.groupNode();
      const den = this.groupNode();
      return h('span.mfrac', null, h('span.num', null, num), h('span.den', null, den));
    }
    if (name === 'sqrt') {
      const idx = this.optional();
      const body = this.groupNode();
      return h('span.msqrt', null,
        idx ? h('span.mroot-index', null, idx) : null,
        h('span.radical', null, '√'),
        h('span.radicand', null, body));
    }
    if (name === 'text' || name === 'textrm' || name === 'mbox') return h('span.mtext', null, this.rawGroup());
    if (name === 'textbf') return h('span.mtext', { style: { fontWeight: '700' } }, this.rawGroup());
    if (name === 'textit') return h('span.mtext', { style: { fontStyle: 'italic' } }, this.rawGroup());
    if (name === 'mathrm' || name === 'operatorname') return h('span.mfn', null, this.groupNode());
    if (name === 'mathbf' || name === 'bm') return h('span', { style: { fontWeight: '700' } }, this.groupNode());
    if (XARROW[name]) {
      // \xrightarrow{label} - the label rides above a stretched arrow.
      const label = this.groupNode();
      return h('span.mstack', { style: { margin: '0 .2em' } },
        h('span.over', null, label),
        h('span.mop', { style: { padding: 0, letterSpacing: '-.1em' } }, XARROW[name]));
    }
    // Delimiter size hints carry no meaning for this renderer; skip them so the
    // delimiter that follows is parsed normally.
    if (/^(?:big|Big|bigg|Bigg)(?:l|r|m)?$/.test(name)) return null;
    if (name === 'mathit') return h('span', { style: { fontStyle: 'italic' } }, this.groupNode());
    if (name === 'mathbb') {
      const raw = this.rawGroup().trim();
      return h('span.mfn', null, SYMS['mathbb_' + raw] || raw);
    }
    if (name === 'vec') return h('span.mvec', null, this.groupNode());
    if (name === 'hat' || name === 'widehat') return h('span.mhat', null, this.groupNode());
    if (name === 'bar' || name === 'overline') return h('span.mbar', null, this.groupNode());
    if (name === 'underline') return h('span', { style: { textDecoration: 'underline' } }, this.groupNode());
    if (name === 'overset' || name === 'stackrel') {
      const over = this.groupNode(); const base = this.groupNode();
      return h('span.mstack', null, h('span.over', null, over), h('span', null, base));
    }
    if (name === 'underset') {
      const under = this.groupNode(); const base = this.groupNode();
      return h('span.mstack', null, h('span', null, base), h('span.under', null, under));
    }
    if (name === 'left' || name === 'right') {
      const d = this.next();
      const ch = d ? (d.t === 'cmd' ? (SYMS[d.v] || ESCAPED[d.v] || '') : d.v) : '';
      return ch === '.' ? null : h('span.mfence', null, ch);
    }
    if (name === 'lim') {
      // \lim_{x \to 0} - limits sit under the operator.
      const node = h('span.mfn', { dataset: { big: 'stack' } }, 'lim');
      return node;
    }
    if (BIG[name]) {
      const [glyph, stacks] = BIG[name];
      return h('span.mbig', { dataset: { big: stacks ? 'stack' : 'hang' } }, glyph);
    }

    // --- plain symbols ---
    if (GREEK[name]) return h('span', { style: { fontStyle: 'italic' } }, GREEK[name]);
    if (OPS[name]) return h('span.mop', null, OPS[name]);
    if (SYMS[name]) return h('span.mfn', null, SYMS[name]);
    if (FUNCS.has(name)) return h('span.mfn', null, name + ' ');
    if (ESCAPED[name]) return h('span.mfn', null, ESCAPED[name]);
    if (name in SPACES) return document.createTextNode(SPACES[name]);
    if (name === 'displaystyle' || name === 'limits' || name === 'nolimits' || name === '') return null;

    // Unknown command: show it plainly rather than swallowing content.
    return h('span.mfn', { style: { color: 'var(--bad)' }, title: 'unsupported: \\' + name }, '\\' + name);
  }

  /** Read a `{...}` group as literal text (for \text{}). */
  rawGroup() {
    const tk = this.peek();
    if (!tk || tk.t !== '{') { const a = this.next(); return a ? (a.v ?? '') : ''; }
    this.next();
    let depth = 1, out = '';
    while (this.i < this.k.length) {
      const t = this.next();
      if (t.t === '{') { depth++; out += '{'; continue; }
      if (t.t === '}') { depth--; if (!depth) break; out += '}'; continue; }
      if (t.t === 'cmd') { out += SPACES[t.v] !== undefined ? SPACES[t.v] : (GREEK[t.v] || SYMS[t.v] || OPS[t.v] || ESCAPED[t.v] || ('\\' + t.v)); continue; }
      if (t.t === 'num' || t.t === 'ch') { out += t.v; continue; }
      if (t.t === 'sp') { out += ' '; continue; }
      out += ' ';
    }
    return out;
  }
}

function stackedBig(base, sup, sub) {
  return h('span.mlim', null,
    sup ? h('span.lim-sub', null, sup) : null,
    base,
    sub ? h('span.lim-sub', null, sub) : null);
}

/* ------------------------------------------------------------------ */
/* public API                                                          */
/* ------------------------------------------------------------------ */

const cache = new Map();

/**
 * Render a LaTeX string to a DOM node.
 * @param {string} src
 * @param {{display?: boolean, cls?: string}} [opts]
 */
export function renderMath(src, opts = {}) {
  const key = (opts.display ? 'D:' : 'I:') + src;
  const cached = cache.get(key);
  if (cached) return cached.cloneNode(true);

  let nodes;
  try {
    nodes = new Parser(tokenize(String(src))).parseList();
  } catch (err) {
    console.warn('[mathlite] parse failed:', src, err);
    nodes = [document.createTextNode(String(src))];
  }

  const el = h('span.math' + (opts.display ? '.math-block' : '') + (opts.cls ? '.' + opts.cls : ''), {
    role: 'math',
    'aria-label': toSpeech(src)
  }, nodes);

  if (cache.size > 900) cache.clear();
  cache.set(key, el);
  return el.cloneNode(true);
}

/** Convenience for display-mode equations. */
export const renderDisplay = (src) => renderMath(src, { display: true });

/**
 * Render a paragraph containing `$...$` inline maths and `**bold**` /
 * `*italic*` / `` `code` `` markers. Returns a DocumentFragment.
 */
export function renderInline(text) {
  const frag = document.createDocumentFragment();
  const str = String(text ?? '');
  let i = 0;

  while (i < str.length) {
    const dollar = str.indexOf('$', i);
    if (dollar === -1) { appendRich(frag, str.slice(i)); break; }
    if (dollar > i) appendRich(frag, str.slice(i, dollar));

    const end = str.indexOf('$', dollar + 1);
    if (end === -1) { appendRich(frag, str.slice(dollar)); break; }

    frag.appendChild(renderMath(str.slice(dollar + 1, end)));
    i = end + 1;
  }
  return frag;
}

/** Minimal inline markdown: **bold**, *italic*, `code`. */
function appendRich(parent, text) {
  const re = /\*\*([^*]+)\*\*|(?<!\*)\*([^*]+)\*(?!\*)|`([^`]+)`/g;
  let last = 0, m;
  while ((m = re.exec(text))) {
    if (m.index > last) parent.appendChild(document.createTextNode(text.slice(last, m.index)));
    if (m[1] !== undefined) parent.appendChild(h('strong', null, m[1]));
    else if (m[2] !== undefined) parent.appendChild(h('em', null, m[2]));
    else parent.appendChild(h('code', null, m[3]));
    last = re.lastIndex;
  }
  if (last < text.length) parent.appendChild(document.createTextNode(text.slice(last)));
}

/**
 * A rough spoken form, used for aria-label so screen readers say something
 * better than a soup of backslashes.
 */
export function toSpeech(src) {
  return String(src)
    .replace(/\\frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, ' $1 over $2 ')
    .replace(/\\sqrt\s*\{([^{}]*)\}/g, ' square root of $1 ')
    .replace(/\^\{?([^{}\s]+)\}?/g, ' to the power $1 ')
    .replace(/_\{?([^{}\s]+)\}?/g, ' sub $1 ')
    .replace(/\\(?:times)/g, ' times ')
    .replace(/\\(?:cdot)/g, ' dot ')
    .replace(/\\(?:le|leq)/g, ' less than or equal to ')
    .replace(/\\(?:ge|geq)/g, ' greater than or equal to ')
    .replace(/\\(?:ne|neq)/g, ' not equal to ')
    .replace(/\\(?:in)\b/g, ' in ')
    .replace(/\\(?:cup)/g, ' union ')
    .replace(/\\(?:cap)/g, ' intersection ')
    .replace(/\\(?:to|rightarrow)/g, ' tends to ')
    .replace(/\\(?:text|mathrm)\s*\{([^{}]*)\}/g, ' $1 ')
    .replace(/\\([A-Za-z]+)/g, ' $1 ')
    .replace(/[{}$]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Strip LaTeX to plain text - used by the search index and print fallbacks. */
export function toPlain(src) {
  return String(src)
    .replace(/\\(?:text|mathrm|mathbf|mathit)\s*\{([^{}]*)\}/g, '$1')
    .replace(/\\frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, '($1)/($2)')
    .replace(/\\[A-Za-z]+/g, (m) => GREEK[m.slice(1)] || OPS[m.slice(1)] || SYMS[m.slice(1)] || '')
    .replace(/[{}\\$]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Render every `$...$` span inside an existing element in place.
 * Used for content that arrives as a string from the print pack builder.
 */
export function typesetElement(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (n.nodeValue.includes('$') && !n.parentElement.closest('.math'))
      ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
  });
  const targets = [];
  while (walker.nextNode()) targets.push(walker.currentNode);
  for (const node of targets) {
    node.parentNode.replaceChild(renderInline(node.nodeValue), node);
  }
  return root;
}
