/**
 * Mathematics - Chapter 1: Sets, Relations and Functions
 *
 * JEE Main Unit 1. Eight topics from set notation through to graph
 * transformations. This chapter supplies the *language* used by every later
 * chapter - "domain", "onto", "equivalence" are not decoration, they are the
 * vocabulary calculus is written in.
 */

export default {
  id: 'm-01',
  subject: 'maths',
  number: 1,
  title: 'Sets, Relations & Functions',
  subtitle: 'The grammar of all later mathematics',
  blurb: 'Almost everything in mathematics is a set, a relation between sets, or a function from one set to another. Get fluent here and calculus stops feeling like a foreign language.',
  jeeWeight: 5.0,
  estMin: 300,
  icon: '♾️',

  guide: {
    name: 'CANTOR',
    full: 'Categorical Analysis & Notation Terminal, Ordinal Rank',
    avatar: '♾️',
    voice: 'formal, patient, occasionally startled by infinity'
  },

  intro: {
    speaker: 'CANTOR',
    avatar: '♾️',
    lines: [
      'Cadet. The Logic Core is intact, but its *indices* are gone. It knows every fact and can find none of them.',
      'To rebuild an index you must first understand what an index is: a **relation** between a label and a thing. And to understand relations you must understand **sets**.',
      'I will warn you once. This chapter looks easy. Every year, candidates skim it because the first definitions are trivial, then lose marks in calculus for three years because they never truly understood *domain*.',
      'Eight modules. Begin.'
    ]
  },

  kcs: {
    'kc-m-setdef':    { name: 'Set notation: roster and builder form', weight: 1.0, prereq: [] },
    'kc-m-settypes':  { name: 'Empty, finite, infinite, equal sets',   weight: 1.0, prereq: ['kc-m-setdef'] },
    'kc-m-subset':    { name: 'Subsets and power sets',                weight: 1.4, prereq: ['kc-m-settypes'] },
    'kc-m-interval':  { name: 'Intervals as subsets of R',             weight: 1.1, prereq: ['kc-m-setdef'] },

    'kc-m-ops':       { name: 'Union, intersection, difference',       weight: 1.4, prereq: ['kc-m-subset'] },
    'kc-m-complement':{ name: 'Universal set and complement',          weight: 1.1, prereq: ['kc-m-ops'] },
    'kc-m-venn':      { name: 'Venn diagrams',                         weight: 1.0, prereq: ['kc-m-ops'] },
    'kc-m-laws':      { name: 'Algebra of sets and De Morgan laws',    weight: 1.3, prereq: ['kc-m-complement'] },

    'kc-m-card2':     { name: 'Cardinality of a union (two sets)',     weight: 1.5, prereq: ['kc-m-ops'] },
    'kc-m-card3':     { name: 'Inclusion-exclusion (three sets)',      weight: 1.6, prereq: ['kc-m-card2', 'kc-m-venn'] },

    'kc-m-cartesian': { name: 'Cartesian product',                     weight: 1.2, prereq: ['kc-m-ops'] },
    'kc-m-reldef':    { name: 'Relation as a subset of A x B',         weight: 1.3, prereq: ['kc-m-cartesian'] },
    'kc-m-reldom':    { name: 'Domain, codomain and range of a relation', weight: 1.2, prereq: ['kc-m-reldef'] },

    'kc-m-reflexive': { name: 'Reflexive relations',                   weight: 1.3, prereq: ['kc-m-reldef'] },
    'kc-m-symmetric': { name: 'Symmetric relations',                   weight: 1.3, prereq: ['kc-m-reldef'] },
    'kc-m-transitive':{ name: 'Transitive relations',                  weight: 1.5, prereq: ['kc-m-reldef'] },
    'kc-m-equiv':     { name: 'Equivalence relations and classes',     weight: 1.7, prereq: ['kc-m-reflexive', 'kc-m-symmetric', 'kc-m-transitive'] },
    'kc-m-relcount':  { name: 'Counting relations of a given type',    weight: 1.2, prereq: ['kc-m-reflexive', 'kc-m-symmetric'] },

    'kc-m-funcdef':   { name: 'Definition of a function',              weight: 1.5, prereq: ['kc-m-reldom'] },
    'kc-m-domain':    { name: 'Finding the domain',                    weight: 1.8, prereq: ['kc-m-funcdef', 'kc-m-interval'] },
    'kc-m-range':     { name: 'Finding the range',                     weight: 1.7, prereq: ['kc-m-domain'] },
    'kc-m-injective': { name: 'One-one (injective) functions',         weight: 1.4, prereq: ['kc-m-funcdef'] },
    'kc-m-surjective':{ name: 'Onto (surjective) functions',           weight: 1.4, prereq: ['kc-m-funcdef'] },
    'kc-m-bijective': { name: 'Bijections',                            weight: 1.3, prereq: ['kc-m-injective', 'kc-m-surjective'] },
    'kc-m-funccount': { name: 'Counting functions',                    weight: 1.1, prereq: ['kc-m-injective', 'kc-m-surjective'] },

    'kc-m-compose':   { name: 'Composition of functions',              weight: 1.5, prereq: ['kc-m-funcdef'] },
    'kc-m-inverse':   { name: 'Inverse functions',                     weight: 1.5, prereq: ['kc-m-bijective', 'kc-m-compose'] },

    'kc-m-stdgraph':  { name: 'Graphs of standard functions',          weight: 1.4, prereq: ['kc-m-range'] },
    'kc-m-special':   { name: 'Modulus, signum, greatest integer',     weight: 1.5, prereq: ['kc-m-stdgraph'] },
    'kc-m-transform': { name: 'Graph transformations',                 weight: 1.2, prereq: ['kc-m-stdgraph'] }
  },

  topics: [
    /* ---------------------------------------------------------------
       1. Sets
       --------------------------------------------------------------- */
    {
      id: 'm-01-01',
      title: 'Sets: Representation & Types',
      short: 'Collections, described precisely',
      kcs: ['kc-m-setdef', 'kc-m-settypes', 'kc-m-subset', 'kc-m-interval'],
      prereq: [],
      estMin: 26,
      weight: 1.1,
      widget: 'setBuilder',
      widgetTitle: 'Set Builder',
      widgetBrief: 'Translate between roster form, set-builder form and a live membership tester.',

      story: {
        speaker: 'CANTOR',
        avatar: '♾️',
        lines: [
          'Module One. A set is a well-defined collection of distinct objects. Three words, each of which is doing real work.',
          '**Well-defined**: given any object, there must be an unambiguous answer to whether it is in. "The set of tall people" is not a set. "The set of people over 180 cm" is.',
          '**Distinct**: $\\{1, 1, 2\\}$ is not a bigger set than $\\{1, 2\\}$. Repetition is invisible.',
          'And order is invisible too. $\\{1,2\\} = \\{2,1\\}$. Remember that when we reach ordered pairs \u2014 the contrast is the whole point.'
        ]
      },

      lesson: [
        { t: 'h', x: 'Two ways to describe a set' },
        { t: 'ul', items: [
          '**Roster (tabular) form** \u2014 list the elements: $A = \\{2, 3, 5, 7\\}$.',
          '**Set-builder form** \u2014 state the property: $A = \\{x : x \\text{ is a prime} < 10\\}$.'
        ] },
        { t: 'p', x: 'Roster form is concrete but impossible for infinite sets. Set-builder handles anything: $\\{x \\in \\mathbb{R} : x^2 < 2\\}$ has uncountably many elements and fits on one line.' },

        { t: 'h', x: 'The standard number sets' },
        { t: 'table',
          head: ['Symbol', 'Name', 'Contains'],
          rows: [
            ['$\\mathbb{N}$', 'Natural numbers', '$1, 2, 3, \\ldots$'],
            ['$\\mathbb{W}$', 'Whole numbers', '$0, 1, 2, \\ldots$'],
            ['$\\mathbb{Z}$', 'Integers', '$\\ldots, -2, -1, 0, 1, 2, \\ldots$'],
            ['$\\mathbb{Q}$', 'Rationals', '$p/q$ with $q \\neq 0$'],
            ['$\\mathbb{R}$', 'Reals', 'all points on the number line'],
            ['$\\mathbb{C}$', 'Complex', '$a + ib$']
          ]
        },
        { t: 'p', x: 'They nest: $\\mathbb{N} \\subset \\mathbb{W} \\subset \\mathbb{Z} \\subset \\mathbb{Q} \\subset \\mathbb{R} \\subset \\mathbb{C}$.' },

        { t: 'h', x: 'Types of set' },
        { t: 'ul', items: [
          '**Empty set** $\\emptyset$ or $\\{\\}$: has no elements. Note $\\{0\\}$ and $\\{\\emptyset\\}$ are *not* empty \u2014 each has one element.',
          '**Singleton**: exactly one element.',
          '**Finite / infinite**: countable-to-a-stop, or not.',
          '**Equal sets**: $A = B$ when they have exactly the same elements.',
          '**Equivalent sets**: same *number* of elements, possibly different ones.',
          '**Disjoint sets**: $A \\cap B = \\emptyset$.'
        ] },

        { t: 'h', x: 'Subsets and the power set' },
        { t: 'formula', name: 'Subset', tex: 'A \\subseteq B \\iff (x \\in A \\Rightarrow x \\in B)', star: true },
        { t: 'ul', items: [
          '$\\emptyset$ is a subset of **every** set. So is the set itself.',
          '**Proper subset** $A \\subset B$: $A \\subseteq B$ but $A \\neq B$.',
          'The **power set** $P(A)$ is the set of *all* subsets of $A$ \u2014 its elements are themselves sets.'
        ] },
        { t: 'formula', name: 'Size of the power set', tex: 'n(A) = m \\;\\Rightarrow\\; n(P(A)) = 2^{m}', star: true,
          note: 'Number of proper subsets $= 2^m - 1$; number of non-empty proper subsets $= 2^m - 2$.' },
        { t: 'worked', title: 'Worked example \u2014 why $2^m$?', tier: 'M',
          q: 'Explain why a set with $m$ elements has $2^m$ subsets, and list $P(\\{a,b\\})$.',
          steps: [
            'To build a subset, go through the $m$ elements one at a time and make a binary choice: in, or out.',
            'That is $m$ independent choices with 2 options each, so $2 \\times 2 \\times \\cdots = 2^{m}$ subsets.',
            'For $A = \\{a, b\\}$: the four choices give $\\emptyset$, $\\{a\\}$, $\\{b\\}$, $\\{a,b\\}$.'
          ],
          ans: '$P(\\{a,b\\}) = \\{\\emptyset, \\{a\\}, \\{b\\}, \\{a,b\\}\\}$, which has $2^2 = 4$ elements.'
        },

        { t: 'h', x: 'Intervals' },
        { t: 'table',
          head: ['Notation', 'Meaning', 'Endpoints'],
          rows: [
            ['$(a, b)$', '$a < x < b$', 'both excluded (open)'],
            ['$[a, b]$', '$a \\leq x \\leq b$', 'both included (closed)'],
            ['$[a, b)$', '$a \\leq x < b$', 'half-open'],
            ['$(a, \\infty)$', '$x > a$', '$\\infty$ is never included']
          ]
        },
        { t: 'callout', kind: 'trap', title: 'Infinity gets a round bracket, always', x: 'Writing $[2, \\infty]$ is an error. $\\infty$ is not a real number, so it can never be an element. Always $(2, \\infty)$ or $[2, \\infty)$.' },

        { t: 'sim' },

        { t: 'callout', kind: 'jee', title: 'The $\\in$ vs $\\subset$ trap', x: 'For $A = \\{1, 2, \\{3\\}\\}$:\n\n$1 \\in A$ \u2713 but $1 \\subset A$ \u2717 (1 is an element, not a set)\n$\\{1\\} \\subset A$ \u2713 but $\\{1\\} \\in A$ \u2717\n$\\{3\\} \\in A$ \u2713 **and** $\\{3\\} \\subset A$? No \u2014 $\\{3\\} \\subset A$ would need $3 \\in A$, and it is not; only $\\{3\\}$ is.\n\nThis single distinction accounts for a startling number of dropped marks.' }
      ],

      formulas: [
        { name: 'Power set size', tex: 'n(P(A)) = 2^{n(A)}', star: true },
        { name: 'Proper subsets', tex: '2^{n} - 1' },
        { name: 'Subset definition', tex: 'A \\subseteq B \\iff x\\in A \\Rightarrow x \\in B' }
      ],

      questions: [
        { id: 'm-01-01-q1', tier: 'G', kind: 'mcq', parSec: 35, kcs: ['kc-m-subset'],
          stem: 'If a set $A$ has $4$ elements, the number of elements in its power set $P(A)$ is:',
          options: ['$4$', '$8$', '$16$', '$32$'],
          answer: 2,
          hint: 'Each element is either in a given subset or not.',
          solution: [
            '$n(P(A)) = 2^{n(A)}$.',
            '$= 2^4 = 16$.',
            'Reason: building a subset means making 4 independent in/out choices, giving $2^4$ possibilities.'
          ] },

        { id: 'm-01-01-q2', tier: 'G', kind: 'mcq', parSec: 35, kcs: ['kc-m-settypes'],
          stem: 'Which of the following is the **empty set**?',
          options: [
            '$\\{0\\}$',
            '$\\{x : x \\in \\mathbb{R},\\ x^2 = -1\\}$',
            '$\\{\\emptyset\\}$',
            '$\\{x : x \\in \\mathbb{N},\\ x < 2\\}$'
          ],
          answer: 1,
          hint: 'Can a real number have a negative square?',
          solution: [
            'No real number squares to $-1$, so $\\{x \\in \\mathbb{R} : x^2 = -1\\} = \\emptyset$. \u2713',
            '$\\{0\\}$ is a singleton containing the number zero \u2014 not empty.',
            '$\\{\\emptyset\\}$ is a singleton whose one element is the empty set \u2014 not empty either.',
            '$\\{x \\in \\mathbb{N} : x < 2\\} = \\{1\\}$ \u2014 a singleton.'
          ] },

        { id: 'm-01-01-q3', tier: 'G', kind: 'mcq', parSec: 40, kcs: ['kc-m-interval'],
          stem: 'The set $\\{x \\in \\mathbb{R} : -2 \\leq x < 5\\}$ in interval notation is:',
          options: ['$(-2, 5)$', '$[-2, 5]$', '$[-2, 5)$', '$(-2, 5]$'],
          answer: 2,
          hint: 'A square bracket means the endpoint is included.',
          solution: [
            '$-2 \\leq x$ means $-2$ **is** included, so a square bracket on the left.',
            '$x < 5$ means $5$ is **not** included, so a round bracket on the right.',
            'The interval is $[-2, 5)$.'
          ] },

        { id: 'm-01-01-q4', tier: 'M', kind: 'mcq', parSec: 70, kcs: ['kc-m-subset', 'kc-m-setdef'],
          stem: 'Let $A = \\{1, 2, \\{3, 4\\}, 5\\}$. Which statement is **true**?',
          options: [
            '$\\{3, 4\\} \\subset A$',
            '$\\{3, 4\\} \\in A$',
            '$3 \\in A$',
            '$\\{\\{3,4\\}\\} \\in A$'
          ],
          answer: 1,
          hint: 'List the four elements of $A$ explicitly.',
          solution: [
            'The elements of $A$ are: $1$, $2$, the *set* $\\{3,4\\}$, and $5$ \u2014 four elements in all.',
            '$\\{3,4\\}$ is literally one of those elements, so $\\{3,4\\} \\in A$. \u2713',
            '$\\{3,4\\} \\subset A$ would require $3 \\in A$ and $4 \\in A$, which is false \u2014 $3$ is inside a nested set, not in $A$.',
            '$\\{\\{3,4\\}\\} \\subset A$ would be true, but $\\{\\{3,4\\}\\} \\in A$ is not.'
          ] },

        { id: 'm-01-01-q5', tier: 'M', kind: 'integer', parSec: 70, kcs: ['kc-m-subset'],
          stem: 'A set has $63$ **proper subsets**. How many elements does it have?',
          answer: 6,
          hint: 'Proper subsets number $2^n - 1$.',
          solution: [
            'Number of proper subsets $= 2^n - 1$.',
            '$2^n - 1 = 63 \\Rightarrow 2^n = 64$.',
            '$n = 6$.'
          ] },

        { id: 'm-01-01-q6', tier: 'M', kind: 'mcq', parSec: 75, kcs: ['kc-m-setdef', 'kc-m-settypes'],
          stem: 'The set $\\{x : x \\in \\mathbb{Z},\\ x^2 \\leq 9\\}$ in roster form is:',
          options: [
            '$\\{1, 2, 3\\}$',
            '$\\{0, 1, 2, 3\\}$',
            '$\\{-3, -2, -1, 0, 1, 2, 3\\}$',
            '$\\{-3, 3\\}$'
          ],
          answer: 2,
          hint: 'Do not forget the negative integers.',
          solution: [
            '$x^2 \\leq 9$ means $-3 \\leq x \\leq 3$.',
            'Restricting to integers gives $x \\in \\{-3, -2, -1, 0, 1, 2, 3\\}$.',
            'The classic slip is dropping the negatives \u2014 $(-3)^2 = 9 \\leq 9$ is perfectly valid.'
          ] },

        { id: 'm-01-01-q7', tier: 'H', kind: 'integer', parSec: 110, kcs: ['kc-m-subset'],
          stem: 'How many subsets of $\\{1,2,3,4,5,6\\}$ contain the element $2$ but **not** the element $5$?',
          answer: 16,
          hint: 'Two elements have their fate forced; the rest are free.',
          solution: [
            'Element $2$ must be in: $1$ way. Element $5$ must be out: $1$ way.',
            'The remaining elements $\\{1, 3, 4, 6\\}$ are each free to be in or out: $2^4$ ways.',
            'Total $= 2^4 = 16$ subsets.'
          ] },

        { id: 'm-01-01-q8', tier: 'H', kind: 'mcq', parSec: 110, kcs: ['kc-m-subset'],
          stem: 'If $A$ and $B$ are two sets such that $n(P(A)) - n(P(B)) = 96$, then $n(A) - n(B)$ equals:',
          options: ['$2$', '$3$', '$1$', '$5$'],
          answer: 0,
          hint: 'Write $2^a - 2^b = 96$ and factor.',
          solution: [
            'Let $n(A) = a$, $n(B) = b$. Then $2^a - 2^b = 96$.',
            'Factor: $2^b(2^{a-b} - 1) = 96 = 2^5 \\times 3$.',
            'Since $2^{a-b} - 1$ is odd, it must equal $3$, giving $2^{a-b} = 4$, so $a - b = 2$.',
            'Then $2^b = 32 \\Rightarrow b = 5$, $a = 7$. Check: $128 - 32 = 96$. \u2713'
          ] },

        { id: 'm-01-01-q9', tier: 'H', kind: 'mcq', parSec: 120, kcs: ['kc-m-settypes', 'kc-m-subset'],
          stem: 'Which of the following statements is **false** for all sets $A$?',
          options: [
            '$\\emptyset \\subseteq A$',
            '$A \\subseteq A$',
            '$\\emptyset \\in P(A)$',
            '$\\emptyset \\in A$'
          ],
          answer: 3,
          hint: 'Distinguish "is a subset of" from "is an element of".',
          solution: [
            '$\\emptyset \\subseteq A$ is true for every set (vacuously: there is no element of $\\emptyset$ that fails to be in $A$).',
            '$A \\subseteq A$ is true \u2014 every set is a subset of itself.',
            '$\\emptyset \\in P(A)$ is true, because $P(A)$ contains *all* subsets, including the empty one.',
            '$\\emptyset \\in A$ is **not** true in general. It holds only if $A$ happens to have the empty set as a member, e.g. $A = \\{\\emptyset, 1\\}$. For $A = \\{1,2\\}$ it is false.'
          ] }
      ]
    },

    /* ---------------------------------------------------------------
       2. Set operations and Venn diagrams
       --------------------------------------------------------------- */
    {
      id: 'm-01-02',
      title: 'Set Operations & Venn Diagrams',
      short: 'Combining sets, and picturing the result',
      kcs: ['kc-m-ops', 'kc-m-complement', 'kc-m-venn', 'kc-m-laws'],
      prereq: ['m-01-01'],
      estMin: 28,
      weight: 1.2,
      widget: 'vennLab',
      widgetTitle: 'Venn Lab',
      widgetBrief: 'Click regions of a live three-circle Venn diagram and the app names the set expression you just built.',

      story: {
        speaker: 'CANTOR',
        avatar: '♾️',
        lines: [
          'Module Two. John Venn drew his circles in 1880 and made a whole branch of logic visible.',
          'Do not think of Venn diagrams as a drawing aid for children, Cadet. Think of them as a *proof technique*. Every identity in the algebra of sets can be verified by shading two diagrams and comparing.',
          'When an identity confuses you \u2014 and De Morgan\u2019s laws confuse everyone at first \u2014 shade it. The picture never lies.'
        ]
      },

      lesson: [
        { t: 'h', x: 'The four operations' },
        { t: 'table',
          head: ['Operation', 'Symbol', 'Definition', 'In words'],
          rows: [
            ['Union', '$A \\cup B$', '$\\{x : x \\in A \\textbf{ or } x \\in B\\}$', 'in at least one'],
            ['Intersection', '$A \\cap B$', '$\\{x : x \\in A \\textbf{ and } x \\in B\\}$', 'in both'],
            ['Difference', '$A - B$', '$\\{x : x \\in A \\textbf{ and } x \\notin B\\}$', 'in A only'],
            ['Complement', '$A\'$ or $A^{c}$', '$\\{x \\in U : x \\notin A\\}$', 'everything else'],
            ['Symmetric difference', '$A \\triangle B$', '$(A - B) \\cup (B - A)$', 'in exactly one']
          ]
        },
        { t: 'callout', kind: 'tip', title: 'The English is the maths', x: '**Or** is inclusive in mathematics: $A \\cup B$ includes things in both. If you want "one but not both", that is the symmetric difference $A \\triangle B$.' },

        { t: 'h', x: 'The algebra of sets' },
        { t: 'table',
          head: ['Law', 'Statement'],
          rows: [
            ['Commutative', '$A \\cup B = B \\cup A$, $\\;A \\cap B = B \\cap A$'],
            ['Associative', '$(A \\cup B) \\cup C = A \\cup (B \\cup C)$'],
            ['Distributive', '$A \\cap (B \\cup C) = (A \\cap B) \\cup (A \\cap C)$'],
            ['Identity', '$A \\cup \\emptyset = A$, $\\;A \\cap U = A$'],
            ['Idempotent', '$A \\cup A = A$, $\\;A \\cap A = A$'],
            ['Complement', '$A \\cup A\' = U$, $\\;A \\cap A\' = \\emptyset$'],
            ['Double complement', '$(A\')\' = A$'],
            ['Absorption', '$A \\cup (A \\cap B) = A$']
          ]
        },

        { t: 'h', x: 'De Morgan\u2019s laws' },
        { t: 'formula', name: 'De Morgan', tex: '(A \\cup B)\' = A\' \\cap B\' \\quad\\quad (A \\cap B)\' = A\' \\cup B\'', star: true,
          note: 'Complement flips the operation. Union becomes intersection and vice versa.' },
        { t: 'callout', kind: 'jee', title: 'Why it must be true', x: 'Read it aloud. "Not (in A or in B)" means "not in A **and** not in B" \u2014 to be outside the union you must dodge both. That is the first law in plain English, and it is the whole proof.' },

        { t: 'anim', id: 'deMorgan' },
        { t: 'h', x: 'Useful identities' },
        { t: 'formula', name: 'Difference as intersection', tex: 'A - B = A \\cap B\'', star: true },
        { t: 'formula', name: 'Splitting a union', tex: 'A \\cup B = (A - B) \\cup (A \\cap B) \\cup (B - A)', note: 'three disjoint pieces \u2014 the basis of all counting problems' },
        { t: 'ul', items: [
          'If $A \\subseteq B$ then $A \\cup B = B$ and $A \\cap B = A$.',
          '$A - B$, $B - A$ and $A \\cap B$ are pairwise **disjoint**.',
          '$A \\triangle B = (A \\cup B) - (A \\cap B)$.'
        ] },

        { t: 'sim' },

        { t: 'worked', title: 'Worked example \u2014 proving an identity by shading', tier: 'M',
          q: 'Verify $A - (B \\cup C) = (A - B) \\cap (A - C)$.',
          steps: [
            'Convert differences to complements: LHS $= A \\cap (B \\cup C)\'$.',
            'Apply De Morgan: $(B \\cup C)\' = B\' \\cap C\'$, so LHS $= A \\cap B\' \\cap C\'$.',
            'Now the RHS: $(A \\cap B\') \\cap (A \\cap C\')$.',
            'Use associativity and idempotence ($A \\cap A = A$): RHS $= A \\cap B\' \\cap C\'$.',
            'Both sides reduce to the same expression. \u220e'
          ],
          ans: 'Identity verified. On a Venn diagram, both are the part of $A$ lying outside both other circles.'
        }
      ],

      formulas: [
        { name: 'De Morgan I', tex: '(A\\cup B)\' = A\'\\cap B\'', star: true },
        { name: 'De Morgan II', tex: '(A\\cap B)\' = A\'\\cup B\'', star: true },
        { name: 'Difference', tex: 'A - B = A\\cap B\'', star: true },
        { name: 'Distributive', tex: 'A\\cap(B\\cup C) = (A\\cap B)\\cup(A\\cap C)' },
        { name: 'Symmetric difference', tex: 'A\\triangle B = (A\\cup B) - (A\\cap B)' }
      ],

      questions: [
        { id: 'm-01-02-q1', tier: 'G', kind: 'mcq', parSec: 35, kcs: ['kc-m-ops'],
          stem: 'If $A = \\{1,2,3,4\\}$ and $B = \\{3,4,5,6\\}$, then $A \\cap B$ is:',
          options: ['$\\{1,2\\}$', '$\\{3,4\\}$', '$\\{5,6\\}$', '$\\{1,2,3,4,5,6\\}$'],
          answer: 1,
          hint: 'Intersection = elements in **both**.',
          solution: [
            'The elements common to both sets are $3$ and $4$.',
            '$A \\cap B = \\{3, 4\\}$.'
          ] },

        { id: 'm-01-02-q2', tier: 'G', kind: 'mcq', parSec: 40, kcs: ['kc-m-ops'],
          stem: 'With $A = \\{1,2,3,4\\}$ and $B = \\{3,4,5,6\\}$, the set $A - B$ is:',
          options: ['$\\{5,6\\}$', '$\\{3,4\\}$', '$\\{1,2\\}$', '$\\emptyset$'],
          answer: 2,
          hint: 'In $A$ but not in $B$.',
          solution: [
            '$A - B$ keeps the elements of $A$ that are not in $B$.',
            '$3$ and $4$ are in $B$, so they go. $1$ and $2$ remain.',
            '$A - B = \\{1, 2\\}$. Note $B - A = \\{5,6\\}$ \u2014 difference is **not** commutative.'
          ] },

        { id: 'm-01-02-q3', tier: 'G', kind: 'mcq', parSec: 45, kcs: ['kc-m-laws'],
          stem: 'By De Morgan\u2019s law, $(A \\cup B)\'$ equals:',
          options: ['$A\' \\cup B\'$', '$A\' \\cap B\'$', '$A \\cap B$', '$(A \\cap B)\'$'],
          answer: 1,
          hint: 'The complement flips the operation.',
          solution: [
            'To be outside $A \\cup B$, an element must avoid $A$ **and** avoid $B$.',
            'So $(A \\cup B)\' = A\' \\cap B\'$.',
            'The union has become an intersection \u2014 that flip is the content of the law.'
          ] },

        { id: 'm-01-02-q4', tier: 'M', kind: 'mcq', parSec: 70, kcs: ['kc-m-ops', 'kc-m-laws'],
          stem: 'If $A \\subseteq B$, then $A \\cap (A \\cup B)\'$ equals:',
          options: ['$A$', '$B$', '$\\emptyset$', '$A\'$'],
          answer: 2,
          hint: 'What does $(A \\cup B)\'$ have in common with $A$?',
          solution: [
            '$(A \\cup B)\'$ consists of everything outside both $A$ and $B$.',
            'So it is disjoint from $A$ by construction.',
            '$A \\cap (A \\cup B)\' = \\emptyset$.',
            'Formally: $A \\cap (A\' \\cap B\') = (A \\cap A\') \\cap B\' = \\emptyset \\cap B\' = \\emptyset$.'
          ] },

        { id: 'm-01-02-q5', tier: 'M', kind: 'mcq', parSec: 80, kcs: ['kc-m-laws'],
          stem: 'The set $(A \\cup B) \\cap (A \\cup B\')$ simplifies to:',
          options: ['$A$', '$B$', '$A \\cap B$', '$U$'],
          answer: 0,
          hint: 'Use the distributive law in reverse.',
          solution: [
            'Distributive law (factoring out the $A$): $(A \\cup B) \\cap (A \\cup B\') = A \\cup (B \\cap B\')$.',
            '$B \\cap B\' = \\emptyset$.',
            'So the expression is $A \\cup \\emptyset = A$.'
          ] },

        { id: 'm-01-02-q6', tier: 'M', kind: 'mcq', parSec: 80, kcs: ['kc-m-ops', 'kc-m-venn'],
          stem: 'Which expression describes the shaded region "in exactly one of $A$ and $B$"?',
          options: [
            '$A \\cup B$',
            '$A \\cap B$',
            '$(A \\cup B) - (A \\cap B)$',
            '$(A \\cap B)\'$'
          ],
          answer: 2,
          hint: 'Take everything in at least one, then remove the overlap.',
          solution: [
            '"In at least one" is $A \\cup B$.',
            '"In both" is $A \\cap B$, and we want to exclude it.',
            'So the region is $(A \\cup B) - (A \\cap B)$, the **symmetric difference** $A \\triangle B$.',
            'Equivalently $(A - B) \\cup (B - A)$.'
          ] },

        { id: 'm-01-02-q7', tier: 'H', kind: 'mcq', parSec: 110, kcs: ['kc-m-laws'],
          stem: 'For all sets $A$ and $B$, $A - (A - B)$ equals:',
          options: ['$A$', '$B$', '$A \\cap B$', '$A \\cup B$'],
          answer: 2,
          hint: 'Rewrite each difference as an intersection with a complement.',
          solution: [
            '$A - B = A \\cap B\'$.',
            'So $A - (A - B) = A \\cap (A \\cap B\')\'$.',
            'By De Morgan: $(A \\cap B\')\' = A\' \\cup B$.',
            '$A \\cap (A\' \\cup B) = (A \\cap A\') \\cup (A \\cap B) = \\emptyset \\cup (A \\cap B) = A \\cap B$.',
            'Picture it: removing "A but not B" from A leaves exactly the overlap.'
          ] },

        { id: 'm-01-02-q8', tier: 'H', kind: 'mcq', parSec: 120, kcs: ['kc-m-laws', 'kc-m-ops'],
          stem: 'If $A \\triangle B = A \\cup B$, then:',
          options: [
            '$A = B$',
            '$A \\cap B = \\emptyset$',
            '$A \\subseteq B$',
            '$A = \\emptyset$'
          ],
          answer: 1,
          hint: 'Symmetric difference equals the union exactly when something is missing.',
          solution: [
            '$A \\triangle B = (A \\cup B) - (A \\cap B)$.',
            'For this to equal $A \\cup B$, removing $A \\cap B$ must remove nothing.',
            'Therefore $A \\cap B = \\emptyset$ \u2014 the sets are **disjoint**.',
            'Check with $A = \\{1\\}$, $B = \\{2\\}$: $A\\triangle B = \\{1,2\\} = A \\cup B$. \u2713'
          ] },

        { id: 'm-01-02-q9', tier: 'H', kind: 'mcq', parSec: 130, kcs: ['kc-m-laws'],
          stem: 'Let $U$ be the universal set and $A, B \\subseteq U$. The expression $(A\' \\cup B\')\' \\cup (A\' \\cup B)\'$ simplifies to:',
          options: ['$A$', '$B$', '$A\'$', '$A \\cap B$'],
          answer: 0,
          hint: 'Apply De Morgan to each bracket first.',
          solution: [
            'First term: $(A\' \\cup B\')\' = A \\cap B$.',
            'Second term: $(A\' \\cup B)\' = A \\cap B\'$.',
            'Union them: $(A \\cap B) \\cup (A \\cap B\')$.',
            'Factor out $A$: $A \\cap (B \\cup B\') = A \\cap U = A$.'
          ] }
      ]
    },

    /* ---------------------------------------------------------------
       3. Cardinality and inclusion-exclusion
       --------------------------------------------------------------- */
    {
      id: 'm-01-03',
      title: 'Cardinality & Inclusion\u2013Exclusion',
      short: 'Counting without double counting',
      kcs: ['kc-m-card2', 'kc-m-card3'],
      prereq: ['m-01-02'],
      estMin: 26,
      weight: 1.3,
      widget: 'countingLab',
      widgetTitle: 'Survey Room',
      widgetBrief: 'Fill in a three-circle Venn from survey totals, from the centre outwards, and watch the constraints resolve.',

      story: {
        speaker: 'CANTOR',
        avatar: '♾️',
        lines: [
          'Module Three. A survey arrives from the habitat ring: 30 cadets study physics, 25 study chemistry, and 15 study both.',
          'How many study at least one? Not 55. You have counted the fifteen twice \u2014 once in each group.',
          'The correction is called **inclusion\u2013exclusion**, and it is one of the most reusable ideas in mathematics. It will follow you into probability, combinatorics and number theory.'
        ]
      },

      lesson: [
        { t: 'h', x: 'Two sets' },
        { t: 'formula', name: 'Cardinality of a union', tex: 'n(A \\cup B) = n(A) + n(B) - n(A \\cap B)', star: true },
        { t: 'p', x: 'Add both, then subtract the overlap you counted twice. If the sets are disjoint the last term is zero and the sizes simply add.' },
        { t: 'formula', name: 'Other useful forms', tex: 'n(A - B) = n(A) - n(A \\cap B)' },
        { t: 'formula', name: 'Outside the union', tex: 'n((A \\cup B)\') = n(U) - n(A \\cup B)' },

        { t: 'worked', title: 'Worked example \u2014 the classic survey', tier: 'G',
          q: 'In a class of 60, 30 play cricket, 25 play football and 15 play both. How many play neither?',
          steps: [
            '$n(C \\cup F) = 30 + 25 - 15 = 40$ play at least one.',
            'Neither $= n(U) - n(C \\cup F) = 60 - 40$.'
          ],
          ans: '$20$ students play neither.'
        },

        { t: 'h', x: 'Three sets' },
        { t: 'formula', name: 'Inclusion\u2013exclusion for three sets',
          tex: 'n(A \\cup B \\cup C) = n(A) + n(B) + n(C) - n(A \\cap B) - n(B \\cap C) - n(C \\cap A) + n(A \\cap B \\cap C)',
          star: true,
          note: 'Alternating signs: add singles, subtract pairs, add the triple.' },
        { t: 'callout', kind: 'tip', title: 'Why the last term comes back', x: 'Someone in all three sets is added 3 times by the singles, then subtracted 3 times by the pairs \u2014 leaving them counted zero times. Adding the triple intersection restores them exactly once.' },

        { t: 'h', x: 'The "exactly" formulas' },
        { t: 'formula', name: 'Exactly two of the three', tex: 'n_{=2} = n(A\\cap B) + n(B\\cap C) + n(C\\cap A) - 3\\,n(A\\cap B\\cap C)' },
        { t: 'formula', name: 'Exactly one of the three', tex: 'n_{=1} = \\sum n(A) - 2\\sum n(\\text{pairs}) + 3\\,n(A\\cap B\\cap C)' },
        { t: 'callout', kind: 'jee', title: 'Or just fill the diagram', x: 'Rather than memorising the "exactly" formulas, draw the three circles and fill them **from the centre outwards**: put $n(A\\cap B\\cap C)$ in the middle, subtract it from each pairwise region, then subtract everything from each single. It is slower to describe and faster to do.' },

        { t: 'sim' },

        { t: 'worked', title: 'Worked example \u2014 a three-set survey', tier: 'H',
          q: 'Of 100 people: 45 read A, 35 read B, 30 read C; 15 read A and B, 12 read B and C, 10 read A and C; 5 read all three. How many read exactly one newspaper?',
          steps: [
            'Start at the centre: all three $= 5$.',
            'Exactly A and B (not C) $= 15 - 5 = 10$. Similarly B and C only $= 12 - 5 = 7$; A and C only $= 10 - 5 = 5$.',
            'Only A $= 45 - 10 - 5 - 5 = 25$.',
            'Only B $= 35 - 10 - 7 - 5 = 13$.',
            'Only C $= 30 - 7 - 5 - 5 = 13$.',
            'Exactly one $= 25 + 13 + 13 = 51$.'
          ],
          ans: '$51$ people read exactly one newspaper. (Check: $n(A\\cup B\\cup C) = 51 + 22 + 5 = 78$, so 22 read none.)'
        }
      ],

      formulas: [
        { name: 'Two sets', tex: 'n(A\\cup B) = n(A)+n(B)-n(A\\cap B)', star: true },
        { name: 'Three sets', tex: 'n(A\\cup B\\cup C) = \\sum n(A) - \\sum n(\\text{pairs}) + n(A\\cap B\\cap C)', star: true },
        { name: 'Difference', tex: 'n(A-B) = n(A) - n(A\\cap B)' },
        { name: 'Exactly one', tex: '\\sum n(A) - 2\\sum n(\\text{pairs}) + 3n(A\\cap B\\cap C)' }
      ],

      questions: [
        { id: 'm-01-03-q1', tier: 'G', kind: 'integer', parSec: 45, kcs: ['kc-m-card2'],
          stem: 'If $n(A) = 20$, $n(B) = 15$ and $n(A \\cap B) = 5$, find $n(A \\cup B)$.',
          answer: 30,
          hint: 'Add, then subtract the overlap.',
          solution: [
            '$n(A \\cup B) = n(A) + n(B) - n(A \\cap B)$.',
            '$= 20 + 15 - 5 = 30$.'
          ] },

        { id: 'm-01-03-q2', tier: 'G', kind: 'integer', parSec: 60, kcs: ['kc-m-card2'],
          stem: 'In a class of $60$, $30$ play cricket, $25$ play football and $15$ play both. How many play **neither**?',
          answer: 20,
          hint: 'Find how many play at least one, then subtract from 60.',
          solution: [
            '$n(C \\cup F) = 30 + 25 - 15 = 40$.',
            'Neither $= 60 - 40 = 20$.'
          ] },

        { id: 'm-01-03-q3', tier: 'G', kind: 'integer', parSec: 55, kcs: ['kc-m-card2'],
          stem: 'If $n(A) = 25$, $n(B) = 18$ and $n(A \\cup B) = 36$, find $n(A \\cap B)$.',
          answer: 7,
          hint: 'Rearrange the union formula.',
          solution: [
            '$n(A \\cup B) = n(A) + n(B) - n(A \\cap B)$.',
            '$36 = 25 + 18 - n(A \\cap B)$.',
            '$n(A \\cap B) = 43 - 36 = 7$.'
          ] },

        { id: 'm-01-03-q4', tier: 'M', kind: 'integer', parSec: 90, kcs: ['kc-m-card3'],
          stem: 'In a group of $100$: $45$ read A, $35$ read B, $30$ read C; $15$ read A and B, $12$ read B and C, $10$ read A and C; $5$ read all three. How many read **at least one** newspaper?',
          answer: 78,
          hint: 'Apply the three-set inclusion-exclusion formula directly.',
          solution: [
            '$n(A\\cup B\\cup C) = 45 + 35 + 30 - 15 - 12 - 10 + 5$.',
            '$= 110 - 37 + 5$.',
            '$= 78$.'
          ] },

        { id: 'm-01-03-q5', tier: 'M', kind: 'integer', parSec: 90, kcs: ['kc-m-card3'],
          stem: 'Using the same data ($100$ people; $45, 35, 30$; pairs $15, 12, 10$; all three $5$), how many read **no** newspaper?',
          answer: 22,
          hint: 'Total minus those who read at least one.',
          solution: [
            'From the previous result, $n(A\\cup B\\cup C) = 78$.',
            'None $= 100 - 78 = 22$.'
          ] },

        { id: 'm-01-03-q6', tier: 'M', kind: 'mcq', parSec: 85, kcs: ['kc-m-card2'],
          stem: 'If $n(A) = 30$ and $n(B) = 20$, the **minimum** possible value of $n(A \\cup B)$ is:',
          options: ['$20$', '$30$', '$50$', '$10$'],
          answer: 1,
          hint: 'The union is smallest when the overlap is as large as possible.',
          solution: [
            '$n(A \\cup B) = 50 - n(A \\cap B)$, so the union shrinks as the overlap grows.',
            'The overlap cannot exceed the size of the smaller set: $n(A \\cap B) \\leq 20$.',
            'Maximum overlap $= 20$ (when $B \\subseteq A$), giving $n(A \\cup B) = 50 - 20 = 30$.',
            'So the minimum union is $30$, and the maximum is $50$ (disjoint sets).'
          ] },

        { id: 'm-01-03-q7', tier: 'H', kind: 'integer', parSec: 130, kcs: ['kc-m-card3'],
          stem: 'With the newspaper data ($100$; $45, 35, 30$; $15, 12, 10$; $5$), how many read **exactly one** newspaper?',
          answer: 51,
          hint: 'Fill the Venn diagram from the centre outwards.',
          solution: [
            'Centre (all three) $= 5$.',
            'Exactly two: A&B only $= 15-5 = 10$; B&C only $= 12-5 = 7$; A&C only $= 10-5 = 5$.',
            'Only A $= 45 - 10 - 5 - 5 = 25$.',
            'Only B $= 35 - 10 - 7 - 5 = 13$.',
            'Only C $= 30 - 7 - 5 - 5 = 13$.',
            'Exactly one $= 25 + 13 + 13 = 51$.',
            'Formula check: $\\sum n - 2\\sum\\text{pairs} + 3n_{ABC} = 110 - 74 + 15 = 51$. \u2713'
          ] },

        { id: 'm-01-03-q8', tier: 'H', kind: 'integer', parSec: 140, kcs: ['kc-m-card3'],
          stem: 'In a survey of $60$ people, $25$ like tea, $26$ like coffee, $26$ like milk; $9$ like tea and coffee, $11$ like coffee and milk, $8$ like tea and milk; $8$ like none. How many like **all three**?',
          answer: 3,
          hint: 'You know the union from the "none" figure. Solve for the triple intersection.',
          solution: [
            'At least one $= 60 - 8 = 52$.',
            'Inclusion-exclusion: $52 = 25 + 26 + 26 - 9 - 11 - 8 + x$.',
            '$52 = 77 - 28 + x = 49 + x$.',
            '$x = 3$.',
            'Three people like all three drinks.'
          ] },

        { id: 'm-01-03-q9', tier: 'H', kind: 'mcq', parSec: 130, kcs: ['kc-m-card3', 'kc-m-card2'],
          stem: 'In a class, every student studies at least one of Physics, Chemistry or Maths. $18$ study Physics, $23$ Chemistry, $24$ Maths; $9$ study Physics and Chemistry, $11$ Chemistry and Maths, $8$ Physics and Maths. If the class has $40$ students, the number studying all three is:',
          options: ['$2$', '$3$', '$4$', '$5$'],
          answer: 1,
          hint: 'Every student studies at least one, so the union equals the class size.',
          solution: [
            'Since nobody studies none, $n(P \\cup C \\cup M) = 40$.',
            '$40 = 18 + 23 + 24 - 9 - 11 - 8 + x$.',
            '$40 = 65 - 28 + x = 37 + x$.',
            '$x = 3$.'
          ] }
      ]
    },

    /* ---------------------------------------------------------------
       4. Cartesian products and relations
       --------------------------------------------------------------- */
    {
      id: 'm-01-04',
      title: 'Cartesian Product & Relations',
      short: 'Ordered pairs, and the sets you make from them',
      kcs: ['kc-m-cartesian', 'kc-m-reldef', 'kc-m-reldom'],
      prereq: ['m-01-02'],
      estMin: 26,
      weight: 1.2,
      widget: 'relationGrid',
      widgetTitle: 'Relation Grid',
      widgetBrief: 'Toggle cells in an A x B grid and watch the same relation appear as arrows, as a set of pairs and as a graph.',

      story: {
        speaker: 'CANTOR',
        avatar: '♾️',
        lines: [
          'Module Four. Here is where order starts to matter.',
          'A set ignores order: $\\{1,2\\} = \\{2,1\\}$. An **ordered pair** does not: $(1,2) \\neq (2,1)$. That single distinction is what lets us talk about *directions*, *mappings* and eventually *graphs*.',
          'A relation is nothing more mysterious than a set of ordered pairs. "Is less than" is a relation. "Is the mother of" is a relation. Both are just lists of pairs, possibly infinite.'
        ]
      },

      lesson: [
        { t: 'h', x: 'Ordered pairs and the Cartesian product' },
        { t: 'formula', name: 'Cartesian product', tex: 'A \\times B = \\{(a, b) : a \\in A,\\ b \\in B\\}', star: true },
        { t: 'formula', name: 'Its size', tex: 'n(A \\times B) = n(A) \\times n(B)', star: true },
        { t: 'ul', items: [
          '$(a,b) = (c,d)$ **iff** $a = c$ and $b = d$.',
          '$A \\times B \\neq B \\times A$ in general (equal only if $A = B$, or one is empty).',
          '$A \\times \\emptyset = \\emptyset$.',
          '$\\mathbb{R} \\times \\mathbb{R} = \\mathbb{R}^2$ is the familiar coordinate plane \u2014 every point *is* an ordered pair.'
        ] },

        { t: 'worked', title: 'Worked example \u2014 listing a product', tier: 'G',
          q: 'If $A = \\{1, 2\\}$ and $B = \\{x, y, z\\}$, write $A \\times B$ and find $n(A \\times B)$.',
          steps: [
            'Pair each element of $A$ with every element of $B$.',
            '$A \\times B = \\{(1,x), (1,y), (1,z), (2,x), (2,y), (2,z)\\}$.',
            '$n(A \\times B) = 2 \\times 3 = 6$. \u2713'
          ],
          ans: '$6$ ordered pairs.'
        },

        { t: 'h', x: 'Relations' },
        { t: 'callout', kind: 'jee', title: 'Definition', x: 'A **relation** $R$ from $A$ to $B$ is any **subset** of $A \\times B$. That is the whole definition. If $(a,b) \\in R$ we write $a\\,R\\,b$.' },
        { t: 'formula', name: 'Number of relations', tex: 'n(A) = m,\\ n(B) = p \\;\\Rightarrow\\; \\text{number of relations} = 2^{mp}', star: true,
          note: 'Because a relation is any subset of a set with $mp$ elements.' },

        { t: 'h', x: 'Domain, codomain and range' },
        { t: 'ul', items: [
          '**Domain** of $R$: the set of all first components that actually appear.',
          '**Codomain**: the whole target set $B$ (declared, not derived).',
          '**Range**: the set of second components that actually appear. Always $\\text{Range} \\subseteq \\text{Codomain}$.'
        ] },
        { t: 'worked', title: 'Worked example \u2014 reading off domain and range', tier: 'M',
          q: 'Let $A = \\{1,2,3,4\\}$ and $R = \\{(a,b) : b = a + 1,\\ a, b \\in A\\}$. Find $R$, its domain and its range.',
          steps: [
            'Test each $a$: $a=1 \\to b=2$ \u2713; $a=2 \\to b=3$ \u2713; $a=3 \\to b=4$ \u2713; $a=4 \\to b=5 \\notin A$ \u2717.',
            '$R = \\{(1,2), (2,3), (3,4)\\}$.',
            'Domain $= \\{1, 2, 3\\}$ (note $4$ is excluded \u2014 it relates to nothing *inside* $A$).',
            'Range $= \\{2, 3, 4\\}$; codomain $= A = \\{1,2,3,4\\}$.'
          ],
          ans: 'Domain $\\{1,2,3\\}$, range $\\{2,3,4\\}$ \u2014 and the range is a proper subset of the codomain.'
        },

        { t: 'sim' },

        { t: 'h', x: 'Three ways to see the same relation' },
        { t: 'ul', items: [
          '**Roster**: $\\{(1,2),(2,3),(3,4)\\}$.',
          '**Arrow diagram**: two blobs, arrows from left to right.',
          '**Graph / grid**: mark the cells of an $A \\times B$ table \u2014 this is the view that turns into a Cartesian graph when the sets are intervals of $\\mathbb{R}$.'
        ] },
        { t: 'callout', kind: 'tip', title: 'The bridge to everything later', x: 'When $A$ and $B$ are $\\mathbb{R}$, a relation is a *region* in the plane and a function is a *curve* passing the vertical-line test. Every graph you draw for the rest of your life is a relation.' }
      ],

      formulas: [
        { name: 'Cartesian product size', tex: 'n(A\\times B) = n(A)\\,n(B)', star: true },
        { name: 'Number of relations', tex: '2^{n(A)\\,n(B)}', star: true },
        { name: 'Pair equality', tex: '(a,b)=(c,d) \\iff a=c \\text{ and } b=d' }
      ],

      questions: [
        { id: 'm-01-04-q1', tier: 'G', kind: 'integer', parSec: 40, kcs: ['kc-m-cartesian'],
          stem: 'If $n(A) = 3$ and $n(B) = 4$, find $n(A \\times B)$.',
          answer: 12,
          hint: 'Multiply the sizes.',
          solution: [
            '$n(A \\times B) = n(A) \\times n(B)$.',
            '$= 3 \\times 4 = 12$ ordered pairs.'
          ] },

        { id: 'm-01-04-q2', tier: 'G', kind: 'mcq', parSec: 45, kcs: ['kc-m-cartesian'],
          stem: 'If $(x + 1, 5) = (3, y - 2)$, then the values of $x$ and $y$ are:',
          options: ['$x=2,\\ y=7$', '$x=3,\\ y=5$', '$x=4,\\ y=3$', '$x=2,\\ y=3$'],
          answer: 0,
          hint: 'Ordered pairs are equal component by component.',
          solution: [
            'Equate first components: $x + 1 = 3 \\Rightarrow x = 2$.',
            'Equate second components: $5 = y - 2 \\Rightarrow y = 7$.'
          ] },

        { id: 'm-01-04-q3', tier: 'G', kind: 'mcq', parSec: 50, kcs: ['kc-m-reldef'],
          stem: 'A relation $R$ from set $A$ to set $B$ is:',
          options: [
            'a subset of $A$',
            'a subset of $B$',
            'a subset of $A \\times B$',
            'always equal to $A \\times B$'
          ],
          answer: 2,
          hint: 'It is a collection of ordered pairs.',
          solution: [
            'By definition a relation is **any subset** of the Cartesian product $A \\times B$.',
            'It may be empty, it may be all of $A \\times B$, or anything in between.',
            'This is why the number of possible relations is $2^{n(A)n(B)}$.'
          ] },

        { id: 'm-01-04-q4', tier: 'M', kind: 'mcq', parSec: 70, kcs: ['kc-m-reldom'],
          stem: 'Let $A = \\{1,2,3,4\\}$ and $R = \\{(a,b) \\in A\\times A : b = a+1\\}$. The **range** of $R$ is:',
          options: ['$\\{1,2,3\\}$', '$\\{2,3,4\\}$', '$\\{1,2,3,4\\}$', '$\\{2,3\\}$'],
          answer: 1,
          hint: 'Collect the second components of the pairs that actually exist.',
          solution: [
            '$R = \\{(1,2), (2,3), (3,4)\\}$ \u2014 note $(4,5)$ is excluded since $5 \\notin A$.',
            'Second components: $2, 3, 4$.',
            'Range $= \\{2, 3, 4\\}$. (The domain is $\\{1,2,3\\}$.)'
          ] },

        { id: 'm-01-04-q5', tier: 'M', kind: 'mcq', parSec: 75, kcs: ['kc-m-reldef'],
          stem: 'If $n(A) = 3$ and $n(B) = 2$, the number of possible relations from $A$ to $B$ is:',
          options: ['$6$', '$8$', '$64$', '$32$'],
          answer: 2,
          hint: 'How many subsets does a 6-element set have?',
          solution: [
            '$n(A \\times B) = 3 \\times 2 = 6$.',
            'A relation is any subset of this 6-element set.',
            'Number of subsets $= 2^6 = 64$.'
          ] },

        { id: 'm-01-04-q6', tier: 'M', kind: 'mcq', parSec: 80, kcs: ['kc-m-cartesian'],
          stem: 'If $A \\times B = \\{(1,a), (1,b), (2,a), (2,b)\\}$, then:',
          options: [
            '$A = \\{1,2\\},\\ B = \\{a,b\\}$',
            '$A = \\{a,b\\},\\ B = \\{1,2\\}$',
            '$A = \\{1,a\\},\\ B = \\{2,b\\}$',
            'it cannot be determined'
          ],
          answer: 0,
          hint: 'First components come from $A$, second from $B$.',
          solution: [
            'The distinct first components are $1$ and $2$, so $A = \\{1, 2\\}$.',
            'The distinct second components are $a$ and $b$, so $B = \\{a, b\\}$.',
            'Check: $n(A\\times B) = 2 \\times 2 = 4$, matching the four listed pairs. \u2713'
          ] },

        { id: 'm-01-04-q7', tier: 'H', kind: 'mcq', parSec: 110, kcs: ['kc-m-cartesian'],
          stem: 'For any sets $A$, $B$, $C$, the set $A \\times (B \\cap C)$ equals:',
          options: [
            '$(A \\times B) \\cup (A \\times C)$',
            '$(A \\times B) \\cap (A \\times C)$',
            '$(A \\cap B) \\times (A \\cap C)$',
            '$A \\times B \\times C$'
          ],
          answer: 1,
          hint: 'Take an arbitrary pair $(x,y)$ and chase the definitions.',
          solution: [
            '$(x,y) \\in A \\times (B \\cap C)$ means $x \\in A$ and $y \\in B \\cap C$.',
            'That is: $x \\in A$, $y \\in B$, **and** $x \\in A$, $y \\in C$.',
            'Which says $(x,y) \\in A\\times B$ **and** $(x,y) \\in A \\times C$.',
            'So $A \\times (B \\cap C) = (A\\times B) \\cap (A \\times C)$ \u2014 the Cartesian product distributes over intersection (and over union too).'
          ] },

        { id: 'm-01-04-q8', tier: 'H', kind: 'integer', parSec: 120, kcs: ['kc-m-reldef', 'kc-m-cartesian'],
          stem: 'Let $A = \\{1, 2, 3\\}$. How many relations on $A$ contain the pair $(1,1)$?',
          answer: 256,
          hint: 'One pair is forced; the rest are free.',
          solution: [
            '$A \\times A$ has $3 \\times 3 = 9$ ordered pairs.',
            'The pair $(1,1)$ must be included \u2014 no choice there.',
            'The remaining $8$ pairs are each free to be in or out: $2^8$ ways.',
            '$= 256$ relations.'
          ] },

        { id: 'm-01-04-q9', tier: 'H', kind: 'mcq', parSec: 120, kcs: ['kc-m-reldom', 'kc-m-reldef'],
          stem: 'The relation $R = \\{(x, y) : x, y \\in \\mathbb{Z},\\ x^2 + y^2 = 25\\}$ has domain:',
          options: [
            '$\\{0, \\pm3, \\pm4, \\pm5\\}$',
            '$\\{\\pm3, \\pm4\\}$',
            '$\\{-5, 5\\}$',
            '$\\{0, 3, 4, 5\\}$'
          ],
          answer: 0,
          hint: 'Which integers $x$ leave $25 - x^2$ a perfect square?',
          solution: [
            'We need $25 - x^2$ to be a perfect square with $|x| \\leq 5$.',
            '$x = 0 \\Rightarrow y^2 = 25 \\Rightarrow y = \\pm5$ \u2713',
            '$x = \\pm3 \\Rightarrow y^2 = 16 \\Rightarrow y = \\pm4$ \u2713',
            '$x = \\pm4 \\Rightarrow y^2 = 9 \\Rightarrow y = \\pm3$ \u2713',
            '$x = \\pm5 \\Rightarrow y^2 = 0 \\Rightarrow y = 0$ \u2713',
            '$x = \\pm1, \\pm2$ give $24$ and $21$ \u2014 not perfect squares. \u2717',
            'Domain $= \\{0, \\pm3, \\pm4, \\pm5\\}$, twelve lattice points in all.'
          ] }
      ]
    },

    /* ---------------------------------------------------------------
       5. Types of relations
       --------------------------------------------------------------- */
    {
      id: 'm-01-05',
      title: 'Types of Relations',
      short: 'Reflexive, symmetric, transitive \u2014 and what they build',
      kcs: ['kc-m-reflexive', 'kc-m-symmetric', 'kc-m-transitive', 'kc-m-equiv', 'kc-m-relcount'],
      prereq: ['m-01-04'],
      estMin: 32,
      weight: 1.6,
      widget: 'relationMatrix',
      widgetTitle: 'Property Inspector',
      widgetBrief: 'Toggle a relation matrix and the three properties light up or fail live, naming the exact pair that breaks each one.',

      story: {
        speaker: 'CANTOR',
        avatar: '♾️',
        lines: [
          'Module Five. The heart of the chapter, and the part JEE returns to every year.',
          'Three properties. **Reflexive**: everything relates to itself. **Symmetric**: if $a$ relates to $b$ then $b$ relates to $a$. **Transitive**: if $a\\to b$ and $b \\to c$ then $a \\to c$.',
          'Hold all three at once and you have an **equivalence relation** \u2014 which is, quietly, one of the deepest ideas in mathematics. It tells you when two different things may be *treated as the same*.',
          'Equality is an equivalence relation. Congruence of triangles is one. "Same remainder mod 3" is one. Every time mathematics says "these are the same for our purposes", an equivalence relation is doing the work.'
        ]
      },

      lesson: [
        { t: 'h', x: 'The three properties' },
        { t: 'table',
          head: ['Property', 'Condition', 'Fails when'],
          rows: [
            ['Reflexive', '$(a,a) \\in R$ for **every** $a \\in A$', 'even one element misses its self-pair'],
            ['Symmetric', '$(a,b) \\in R \\Rightarrow (b,a) \\in R$', 'a pair exists whose reverse does not'],
            ['Transitive', '$(a,b), (b,c) \\in R \\Rightarrow (a,c) \\in R$', 'a chain exists without its shortcut']
          ]
        },
        { t: 'callout', kind: 'trap', title: 'Reflexive vs "contains some self-pairs"', x: '$R = \\{(1,1)\\}$ on $A = \\{1,2\\}$ is **not** reflexive, because $(2,2)$ is missing. Reflexivity is a claim about *every* element. A relation that has some but not all self-pairs has a name too \u2014 it is just not reflexive.' },

        { t: 'h', x: 'Worked examples of each' },
        { t: 'ul', items: [
          '$\\leq$ on $\\mathbb{R}$: reflexive \u2713, symmetric \u2717 ($2\\leq3$ but $3\\nleq2$), transitive \u2713.',
          '$<$ on $\\mathbb{R}$: reflexive \u2717, symmetric \u2717, transitive \u2713.',
          '"is perpendicular to" on lines: reflexive \u2717, symmetric \u2713, transitive \u2717 (if $a\\perp b$ and $b \\perp c$ then $a \\parallel c$).',
          '"is parallel to" on lines: reflexive \u2713 (a line is parallel to itself by convention), symmetric \u2713, transitive \u2713 \u2014 an **equivalence relation**.',
          '"is a sibling of": symmetric \u2713 but not reflexive (you are not your own sibling).'
        ] },

        { t: 'h', x: 'Equivalence relations' },
        { t: 'callout', kind: 'jee', title: 'Definition', x: 'A relation that is reflexive **and** symmetric **and** transitive is an **equivalence relation**. All three, or it does not count.' },
        { t: 'p', x: 'An equivalence relation carves its set into disjoint **equivalence classes**. Every element belongs to exactly one class, the classes cover the whole set, and elements in the same class are "equivalent".' },
        { t: 'worked', title: 'Worked example \u2014 congruence modulo 3', tier: 'M',
          q: 'On $\\mathbb{Z}$, define $a\\,R\\,b \\iff 3 \\mid (a - b)$. Show it is an equivalence relation and find its classes.',
          steps: [
            '**Reflexive**: $a - a = 0$, and $3 \\mid 0$. \u2713',
            '**Symmetric**: if $3 \\mid (a-b)$ then $a - b = 3k$, so $b - a = -3k$, also divisible by 3. \u2713',
            '**Transitive**: if $a - b = 3k$ and $b - c = 3m$, then $a - c = 3(k+m)$. \u2713',
            'Classes: integers grouped by remainder on division by 3.'
          ],
          ans: 'Three classes: $[0] = \\{\\ldots,-3,0,3,\\ldots\\}$, $[1] = \\{\\ldots,-2,1,4,\\ldots\\}$, $[2] = \\{\\ldots,-1,2,5,\\ldots\\}$. They are disjoint and together they are all of $\\mathbb{Z}$.'
        },

        { t: 'h', x: 'Counting relations with given properties' },
        { t: 'p', x: 'For a set with $n$ elements, $A \\times A$ has $n^2$ pairs. Splitting them into the $n$ diagonal pairs and the $n^2 - n$ off-diagonal ones makes the counting easy.' },
        { t: 'table',
          head: ['Type', 'Count', 'Reasoning'],
          rows: [
            ['All relations', '$2^{n^2}$', 'every pair free'],
            ['Reflexive', '$2^{n^2 - n}$', '$n$ diagonal pairs forced in'],
            ['Symmetric', '$2^{n(n+1)/2}$', 'choose the diagonal plus one of each mirrored couple'],
            ['Reflexive **and** symmetric', '$2^{n(n-1)/2}$', 'diagonal forced, couples free']
          ]
        },
        { t: 'callout', kind: 'tip', title: 'Worked for $n = 3$', x: '$A\\times A$ has 9 pairs: 3 on the diagonal, 6 off it forming 3 mirrored couples. Reflexive: $2^6 = 64$. Symmetric: $2^{3+3} = 2^6 = 64$. Both: $2^3 = 8$.' },

        { t: 'sim' },

        { t: 'callout', kind: 'warn', title: 'The famous false proof', x: 'Someone will tell you reflexivity follows from symmetry plus transitivity: "$aRb$ and $bRa$ give $aRa$". The flaw: this only works for elements that relate to *something*. If some $x$ appears in no pair at all, $(x,x)$ never arrives. Example on $\\{1,2\\}$: $R = \\{(1,1)\\}$ is symmetric and transitive but not reflexive.' }
      ],

      formulas: [
        { name: 'Reflexive', tex: '\\forall a \\in A,\\ (a,a) \\in R', star: true },
        { name: 'Symmetric', tex: '(a,b)\\in R \\Rightarrow (b,a)\\in R', star: true },
        { name: 'Transitive', tex: '(a,b),(b,c)\\in R \\Rightarrow (a,c)\\in R', star: true },
        { name: 'Count: reflexive', tex: '2^{n^2-n}' },
        { name: 'Count: symmetric', tex: '2^{n(n+1)/2}' }
      ],

      questions: [
        { id: 'm-01-05-q1', tier: 'G', kind: 'mcq', parSec: 45, kcs: ['kc-m-reflexive'],
          stem: 'On $A = \\{1,2,3\\}$, which relation is **reflexive**?',
          options: [
            '$\\{(1,1), (2,2)\\}$',
            '$\\{(1,1), (2,2), (3,3)\\}$',
            '$\\{(1,2), (2,1)\\}$',
            '$\\{(1,1), (1,2)\\}$'
          ],
          answer: 1,
          hint: 'Every element needs its own self-pair.',
          solution: [
            'Reflexive requires $(1,1)$, $(2,2)$ **and** $(3,3)$ all present.',
            'Only option B has all three.',
            'Option A is missing $(3,3)$, so it fails despite containing two self-pairs.'
          ] },

        { id: 'm-01-05-q2', tier: 'G', kind: 'mcq', parSec: 50, kcs: ['kc-m-symmetric'],
          stem: 'The relation "is perpendicular to" on the set of lines in a plane is:',
          options: [
            'reflexive only',
            'symmetric only',
            'transitive only',
            'an equivalence relation'
          ],
          answer: 1,
          hint: 'Check each property with a quick sketch.',
          solution: [
            '**Reflexive?** No line is perpendicular to itself. \u2717',
            '**Symmetric?** If $a \\perp b$ then certainly $b \\perp a$. \u2713',
            '**Transitive?** If $a \\perp b$ and $b \\perp c$, then $a$ and $c$ are *parallel*, not perpendicular. \u2717',
            'So it is symmetric only.'
          ] },

        { id: 'm-01-05-q3', tier: 'G', kind: 'mcq', parSec: 50, kcs: ['kc-m-transitive'],
          stem: 'The relation $\\leq$ on $\\mathbb{R}$ is:',
          options: [
            'reflexive and transitive but not symmetric',
            'symmetric and transitive but not reflexive',
            'an equivalence relation',
            'reflexive only'
          ],
          answer: 0,
          hint: 'Test symmetry with a concrete pair.',
          solution: [
            '**Reflexive**: $a \\leq a$ is always true. \u2713',
            '**Symmetric**: $2 \\leq 3$ but $3 \\nleq 2$. \u2717',
            '**Transitive**: $a \\leq b$ and $b \\leq c$ gives $a \\leq c$. \u2713',
            'A relation that is reflexive, transitive and *antisymmetric* like this is called a **partial order**.'
          ] },

        { id: 'm-01-05-q4', tier: 'M', kind: 'mcq', parSec: 80, kcs: ['kc-m-equiv'],
          stem: 'On $A = \\{1,2,3\\}$, which relation is an **equivalence relation**?',
          options: [
            '$\\{(1,1),(2,2),(3,3),(1,2)\\}$',
            '$\\{(1,1),(2,2),(3,3),(1,2),(2,1)\\}$',
            '$\\{(1,2),(2,1),(1,1)\\}$',
            '$\\{(1,1),(2,2),(1,2),(2,3)\\}$'
          ],
          answer: 1,
          hint: 'Check all three properties on each.',
          solution: [
            'Option B: reflexive \u2713 (all three self-pairs present); symmetric \u2713 ($(1,2)$ and $(2,1)$ both there); transitive \u2713 (the only chain is $1\\to2\\to1$, needing $(1,1)$, which is present).',
            'Option A: not symmetric \u2014 $(1,2)$ present, $(2,1)$ missing.',
            'Option C: not reflexive \u2014 $(2,2)$ and $(3,3)$ missing.',
            'Option D: not reflexive ($(3,3)$ missing) and not transitive ($(1,2),(2,3)$ but no $(1,3)$).'
          ] },

        { id: 'm-01-05-q5', tier: 'M', kind: 'mcq', parSec: 85, kcs: ['kc-m-equiv'],
          stem: 'On $\\mathbb{Z}$, the relation $a\\,R\\,b \\iff a - b$ is divisible by $5$ has how many equivalence classes?',
          options: ['$2$', '$4$', '$5$', 'infinitely many'],
          answer: 2,
          hint: 'Group the integers by their remainder.',
          solution: [
            'Two integers are related exactly when they leave the same remainder on division by 5.',
            'The possible remainders are $0, 1, 2, 3, 4$ \u2014 five of them.',
            'So there are **5** equivalence classes: $[0], [1], [2], [3], [4]$.',
            'Each class is infinite, but there are finitely many classes \u2014 do not confuse the two.'
          ] },

        { id: 'm-01-05-q6', tier: 'M', kind: 'integer', parSec: 90, kcs: ['kc-m-relcount'],
          stem: 'How many **reflexive** relations are there on a set with $3$ elements?',
          answer: 64,
          hint: 'The diagonal pairs are forced; count the freedom in the rest.',
          solution: [
            '$A \\times A$ has $3^2 = 9$ ordered pairs.',
            'The $3$ diagonal pairs $(1,1),(2,2),(3,3)$ must all be present \u2014 no choice.',
            'The other $9 - 3 = 6$ pairs are each free: $2^6$ ways.',
            '$= 64$ reflexive relations.'
          ] },

        { id: 'm-01-05-q7', tier: 'H', kind: 'mcq', parSec: 120, kcs: ['kc-m-transitive', 'kc-m-symmetric'],
          stem: 'Let $R$ be a relation on $\\mathbb{Z}$ defined by $a\\,R\\,b \\iff |a - b| \\leq 1$. Then $R$ is:',
          options: [
            'reflexive and symmetric but not transitive',
            'an equivalence relation',
            'transitive but not symmetric',
            'reflexive only'
          ],
          answer: 0,
          hint: 'Try to break transitivity with three consecutive integers.',
          solution: [
            '**Reflexive**: $|a - a| = 0 \\leq 1$. \u2713',
            '**Symmetric**: $|a-b| = |b-a|$. \u2713',
            '**Transitive**: take $a=1$, $b=2$, $c=3$. $|1-2|=1 \\leq 1$ \u2713 and $|2-3|=1\\leq1$ \u2713, but $|1-3| = 2 > 1$. \u2717',
            'So $R$ is reflexive and symmetric but **not** transitive \u2014 the textbook example of a "tolerance relation".'
          ] },

        { id: 'm-01-05-q8', tier: 'H', kind: 'integer', parSec: 130, kcs: ['kc-m-relcount', 'kc-m-symmetric'],
          stem: 'How many relations on a set of $3$ elements are **both reflexive and symmetric**?',
          answer: 8,
          hint: 'The diagonal is forced; off-diagonal pairs come in mirrored couples.',
          solution: [
            'The $3$ diagonal pairs are forced in by reflexivity.',
            'The $6$ off-diagonal pairs form $3$ mirrored couples: $\\{(1,2),(2,1)\\}$, $\\{(1,3),(3,1)\\}$, $\\{(2,3),(3,2)\\}$.',
            'Symmetry forces each couple to be entirely in or entirely out: $2$ choices per couple.',
            '$2^3 = 8$ such relations.',
            'General formula: $2^{n(n-1)/2}$, here $2^{3} = 8$. \u2713'
          ] },

        { id: 'm-01-05-q9', tier: 'H', kind: 'mcq', parSec: 140, kcs: ['kc-m-equiv'],
          stem: 'On the set of all triangles in a plane, which relation is **not** an equivalence relation?',
          options: [
            'is congruent to',
            'is similar to',
            'has the same area as',
            'has a greater area than'
          ],
          answer: 3,
          hint: 'Test reflexivity on the odd one out.',
          solution: [
            'Congruence, similarity and equality of area are all reflexive, symmetric and transitive \u2014 equivalence relations.',
            '"Has a greater area than" fails reflexivity (a triangle is not greater in area than itself) and fails symmetry.',
            'It is transitive, but one property is not enough.',
            'General pattern: relations built from "is the same as in some respect" are equivalence relations; those built from "is more than" are orders.'
          ] }
      ]
    },

    /* ---------------------------------------------------------------
       6. Functions
       --------------------------------------------------------------- */
    {
      id: 'm-01-06',
      title: 'Functions: Domain, Range & Types',
      short: 'Relations with a rule: exactly one output each',
      kcs: ['kc-m-funcdef', 'kc-m-domain', 'kc-m-range', 'kc-m-injective', 'kc-m-surjective', 'kc-m-bijective', 'kc-m-funccount'],
      prereq: ['m-01-05'],
      estMin: 34,
      weight: 1.8,
      widget: 'functionMachine',
      widgetTitle: 'Function Machine',
      widgetBrief: 'Feed inputs into a machine and see at once whether it is one-one, onto, both, or not even a function.',

      story: {
        speaker: 'CANTOR',
        avatar: '♾️',
        lines: [
          'Module Six. The most important word in your mathematical vocabulary.',
          'A function is a relation with one extra promise: **every** element of the domain has **exactly one** output. Not zero. Not two. Exactly one.',
          'Notice the asymmetry. Two inputs may share an output \u2014 that is allowed, and a function that forbids it is called *one-one*. But one input may never have two outputs. Ever.',
          'Every derivative, every integral, every limit you will ever compute is about a function. Two years from now you will still be using this definition.'
        ]
      },

      lesson: [
        { t: 'h', x: 'The definition' },
        { t: 'callout', kind: 'jee', title: 'Function', x: 'A relation $f$ from $A$ to $B$ is a **function** if every element of $A$ appears as the first component of **exactly one** pair. Written $f : A \\to B$, and $f(a) = b$.' },
        { t: 'ul', items: [
          '**Domain**: the set $A$ \u2014 every element must be used.',
          '**Codomain**: the set $B$ \u2014 declared in advance.',
          '**Range**: $f(A) = \\{f(a) : a \\in A\\} \\subseteq B$ \u2014 what actually comes out.'
        ] },
        { t: 'callout', kind: 'tip', title: 'The vertical line test', x: 'A curve in the plane is a function of $x$ iff every vertical line meets it **at most once**. A circle fails; a parabola $y = x^2$ passes; $x = y^2$ fails.' },

        { t: 'h', x: 'Finding the domain' },
        { t: 'p', x: 'For a real function given by a formula, the domain is everything that does not break a rule. There are exactly three rules to check.' },
        { t: 'table',
          head: ['Structure', 'Requirement', 'Example'],
          rows: [
            ['$\\dfrac{1}{g(x)}$', '$g(x) \\neq 0$', '$\\dfrac{1}{x-3}$: $x \\neq 3$'],
            ['$\\sqrt{g(x)}$ (even root)', '$g(x) \\geq 0$', '$\\sqrt{x-2}$: $x \\geq 2$'],
            ['$\\log g(x)$', '$g(x) > 0$', '$\\log(x-1)$: $x > 1$'],
            ['$\\dfrac{1}{\\sqrt{g(x)}}$', '$g(x) > 0$ (strict!)', '$\\dfrac{1}{\\sqrt{x}}$: $x > 0$']
          ]
        },
        { t: 'callout', kind: 'trap', title: 'Intersect, never union', x: 'When several conditions apply, the domain is their **intersection** \u2014 all conditions must hold simultaneously. For $f(x) = \\sqrt{x-1} + \\sqrt{6-x}$ we need $x \\geq 1$ **and** $x \\leq 6$, giving $[1, 6]$.' },

        { t: 'h', x: 'Finding the range' },
        { t: 'p', x: 'Three reliable techniques, in order of how often they work:' },
        { t: 'ol', items: [
          '**Complete the square** for quadratics: $x^2 - 4x + 5 = (x-2)^2 + 1 \\geq 1$, so range $[1,\\infty)$.',
          '**Solve for $x$ in terms of $y$** and demand that $x$ be real; the constraint on $y$ *is* the range.',
          '**Bound the building blocks**: $\\sin$, $\\cos \\in [-1,1]$; $|x| \\geq 0$; $e^x > 0$. Then propagate.'
        ] },
        { t: 'worked', title: 'Worked example \u2014 range by solving for $x$', tier: 'H',
          q: 'Find the range of $f(x) = \\dfrac{x}{1 + x^2}$ for $x \\in \\mathbb{R}$.',
          steps: [
            'Set $y = \\dfrac{x}{1+x^2}$ and clear the denominator: $yx^2 - x + y = 0$.',
            'For $y \\neq 0$ this is a quadratic in $x$; real $x$ requires the discriminant $\\geq 0$.',
            '$D = (-1)^2 - 4(y)(y) = 1 - 4y^2 \\geq 0$.',
            '$4y^2 \\leq 1 \\Rightarrow -\\dfrac{1}{2} \\leq y \\leq \\dfrac{1}{2}$.',
            '$y = 0$ is attained at $x = 0$, so it is included.'
          ],
          ans: 'Range $= \\left[-\\dfrac{1}{2}, \\dfrac{1}{2}\\right]$'
        },

        { t: 'h', x: 'Types of function' },
        { t: 'table',
          head: ['Type', 'Condition', 'Picture'],
          rows: [
            ['One-one (injective)', '$f(x_1) = f(x_2) \\Rightarrow x_1 = x_2$', 'no two arrows land together'],
            ['Onto (surjective)', 'Range $=$ Codomain', 'every target is hit'],
            ['Bijective', 'both of the above', 'perfect pairing'],
            ['Many-one', 'some output has $\\geq 2$ inputs', '$f(x)=x^2$ on $\\mathbb{R}$'],
            ['Into', 'Range $\\subsetneq$ Codomain', 'something is never hit']
          ]
        },
        { t: 'callout', kind: 'tip', title: 'The horizontal line test', x: 'A function is one-one iff every **horizontal** line meets its graph at most once. (Vertical lines test whether it is a function at all; horizontal lines test injectivity.) A strictly increasing or strictly decreasing function is automatically one-one.' },

        { t: 'h', x: 'Counting functions' },
        { t: 'formula', name: 'Total functions $A \\to B$', tex: 'n(B)^{n(A)} = p^{m}', star: true, note: 'each of $m$ inputs independently picks one of $p$ outputs' },
        { t: 'formula', name: 'One-one functions ($m \\leq p$)', tex: '{}^{p}P_{m} = \\frac{p!}{(p-m)!}', star: true },
        { t: 'formula', name: 'Bijections ($m = p$)', tex: 'm!', star: true },
        { t: 'callout', kind: 'jee', title: 'Quick impossibility checks', x: 'If $n(A) > n(B)$ no one-one function exists (pigeonhole). If $n(A) < n(B)$ no onto function exists. If $n(A) = n(B)$ on **finite** sets, one-one $\\iff$ onto $\\iff$ bijective \u2014 a fact worth a lot of marks.' },

        { t: 'sim' }
      ],

      formulas: [
        { name: 'Domain: fraction', tex: '\\text{denominator} \\neq 0', star: true },
        { name: 'Domain: even root', tex: '\\text{radicand} \\geq 0', star: true },
        { name: 'Domain: log', tex: '\\text{argument} > 0', star: true },
        { name: 'Total functions', tex: 'p^{m}', star: true },
        { name: 'One-one functions', tex: '{}^{p}P_{m}' },
        { name: 'Bijections ($m=p$)', tex: 'm!' }
      ],

      questions: [
        { id: 'm-01-06-q1', tier: 'G', kind: 'mcq', parSec: 40, kcs: ['kc-m-domain'],
          stem: 'The domain of $f(x) = \\dfrac{1}{x - 3}$ is:',
          options: ['$\\mathbb{R}$', '$\\mathbb{R} - \\{3\\}$', '$(3, \\infty)$', '$[3, \\infty)$'],
          answer: 1,
          hint: 'What value makes the denominator zero?',
          solution: [
            'The only restriction is that the denominator must not vanish.',
            '$x - 3 \\neq 0 \\Rightarrow x \\neq 3$.',
            'Domain $= \\mathbb{R} - \\{3\\}$, also written $(-\\infty,3)\\cup(3,\\infty)$.'
          ] },

        { id: 'm-01-06-q2', tier: 'G', kind: 'mcq', parSec: 45, kcs: ['kc-m-domain'],
          stem: 'The domain of $f(x) = \\sqrt{4 - x^2}$ is:',
          options: ['$[-2, 2]$', '$(-2, 2)$', '$\\mathbb{R}$', '$[0, 2]$'],
          answer: 0,
          hint: 'The expression under an even root must be non-negative.',
          solution: [
            'Require $4 - x^2 \\geq 0$.',
            '$x^2 \\leq 4 \\Rightarrow -2 \\leq x \\leq 2$.',
            'Endpoints are included because $\\sqrt{0} = 0$ is perfectly defined.',
            'Domain $= [-2, 2]$.'
          ] },

        { id: 'm-01-06-q3', tier: 'G', kind: 'mcq', parSec: 50, kcs: ['kc-m-injective', 'kc-m-surjective'],
          stem: 'The function $f : \\mathbb{R} \\to \\mathbb{R}$, $f(x) = x^2$, is:',
          options: [
            'one-one and onto',
            'one-one but not onto',
            'onto but not one-one',
            'neither one-one nor onto'
          ],
          answer: 3,
          hint: 'Test with $x = 2$ and $x = -2$, then ask whether $-1$ is ever an output.',
          solution: [
            '**One-one?** $f(2) = f(-2) = 4$ with $2 \\neq -2$. \u2717',
            '**Onto?** The range is $[0,\\infty)$, but the codomain is $\\mathbb{R}$. No $x$ gives $f(x) = -1$. \u2717',
            'So it is neither. Note that $f : [0,\\infty) \\to [0,\\infty)$, $f(x)=x^2$ **is** bijective \u2014 the same rule, different domain and codomain.'
          ] },

        { id: 'm-01-06-q4', tier: 'M', kind: 'mcq', parSec: 75, kcs: ['kc-m-domain'],
          stem: 'The domain of $f(x) = \\sqrt{x - 1} + \\sqrt{6 - x}$ is:',
          options: ['$[1, \\infty)$', '$(-\\infty, 6]$', '$[1, 6]$', '$\\mathbb{R}$'],
          answer: 2,
          hint: 'Both conditions must hold at the same time.',
          solution: [
            'First root: $x - 1 \\geq 0 \\Rightarrow x \\geq 1$.',
            'Second root: $6 - x \\geq 0 \\Rightarrow x \\leq 6$.',
            'Both must hold, so take the **intersection**: $[1, \\infty) \\cap (-\\infty, 6] = [1, 6]$.'
          ] },

        { id: 'm-01-06-q5', tier: 'M', kind: 'mcq', parSec: 80, kcs: ['kc-m-range'],
          stem: 'The range of $f(x) = x^2 - 4x + 5$ for $x \\in \\mathbb{R}$ is:',
          options: ['$[1, \\infty)$', '$[0, \\infty)$', '$\\mathbb{R}$', '$(-\\infty, 1]$'],
          answer: 0,
          hint: 'Complete the square.',
          solution: [
            '$x^2 - 4x + 5 = (x^2 - 4x + 4) + 1 = (x-2)^2 + 1$.',
            '$(x-2)^2 \\geq 0$ for all real $x$, with equality at $x = 2$.',
            'So $f(x) \\geq 1$, and the value $1$ is attained.',
            'Range $= [1, \\infty)$.'
          ] },

        { id: 'm-01-06-q6', tier: 'M', kind: 'integer', parSec: 85, kcs: ['kc-m-funccount'],
          stem: 'If $A$ has $3$ elements and $B$ has $2$ elements, how many functions are there from $A$ to $B$?',
          answer: 8,
          hint: 'Each input independently chooses an output.',
          solution: [
            'Each of the $3$ elements of $A$ must be sent somewhere in $B$, independently.',
            'That is $2$ choices, three times: $2 \\times 2 \\times 2$.',
            '$= 2^3 = 8$ functions.',
            'General formula: $n(B)^{n(A)} = p^m$.'
          ] },

        { id: 'm-01-06-q7', tier: 'H', kind: 'mcq', parSec: 130, kcs: ['kc-m-range'],
          stem: 'The range of $f(x) = \\dfrac{x}{1 + x^2}$, $x \\in \\mathbb{R}$, is:',
          options: [
            '$[-1, 1]$',
            '$\\left[-\\dfrac{1}{2}, \\dfrac{1}{2}\\right]$',
            '$(0, 1)$',
            '$\\mathbb{R}$'
          ],
          answer: 1,
          hint: 'Solve for $x$ in terms of $y$ and require a real solution.',
          solution: [
            'Let $y = \\dfrac{x}{1+x^2}$, so $yx^2 - x + y = 0$.',
            'For real $x$ (with $y \\neq 0$) we need discriminant $\\geq 0$: $1 - 4y^2 \\geq 0$.',
            '$y^2 \\leq \\dfrac{1}{4} \\Rightarrow -\\dfrac{1}{2} \\leq y \\leq \\dfrac{1}{2}$.',
            '$y = 0$ occurs at $x = 0$; the extremes $\\pm\\frac{1}{2}$ occur at $x = \\pm1$.',
            'Range $= \\left[-\\dfrac{1}{2}, \\dfrac{1}{2}\\right]$.'
          ] },

        { id: 'm-01-06-q8', tier: 'H', kind: 'mcq', parSec: 130, kcs: ['kc-m-domain'],
          stem: 'The domain of $f(x) = \\log_{10}(x^2 - 5x + 6)$ is:',
          options: [
            '$(2, 3)$',
            '$(-\\infty, 2) \\cup (3, \\infty)$',
            '$[2, 3]$',
            '$\\mathbb{R} - \\{2, 3\\}$'
          ],
          answer: 1,
          hint: 'The argument of a logarithm must be strictly positive.',
          solution: [
            'Require $x^2 - 5x + 6 > 0$.',
            'Factor: $(x - 2)(x - 3) > 0$.',
            'A product of two factors is positive when both are positive or both negative.',
            'Both negative: $x < 2$. Both positive: $x > 3$.',
            'Domain $= (-\\infty, 2) \\cup (3, \\infty)$. The roots themselves give $\\log 0$, which is undefined.'
          ] },

        { id: 'm-01-06-q9', tier: 'H', kind: 'integer', parSec: 140, kcs: ['kc-m-funccount', 'kc-m-injective'],
          stem: 'Let $A = \\{1,2,3\\}$ and $B = \\{a,b,c,d\\}$. How many **one-one** functions are there from $A$ to $B$?',
          answer: 24,
          hint: 'Each input must take a distinct output.',
          solution: [
            'The first element of $A$ has $4$ possible images.',
            'The second must differ, leaving $3$ choices. The third has $2$.',
            '$4 \\times 3 \\times 2 = 24$.',
            'This is $^{4}P_{3} = \\dfrac{4!}{1!} = 24$.',
            'Note no **onto** function exists here, since $n(A) = 3 < 4 = n(B)$.'
          ] }
      ]
    },

    /* ---------------------------------------------------------------
       7. Composition and inverse
       --------------------------------------------------------------- */
    {
      id: 'm-01-07',
      title: 'Composition & Inverse of Functions',
      short: 'Machines in series, and running them backwards',
      kcs: ['kc-m-compose', 'kc-m-inverse'],
      prereq: ['m-01-06'],
      estMin: 28,
      weight: 1.4,
      widget: 'pipelineLab',
      widgetTitle: 'Pipeline Lab',
      widgetBrief: 'Wire function machines in series, watch a value flow through, then reverse the pipeline to build the inverse.',

      story: {
        speaker: 'CANTOR',
        avatar: '♾️',
        lines: [
          'Module Seven. Two machines, bolted together.',
          'Feed $x$ into $g$, take what comes out, feed that into $f$. The combined machine is $f \\circ g$, read "f of g of x".',
          'Order matters enormously. Putting on socks then shoes is not the same as shoes then socks, and $f\\circ g \\neq g \\circ f$ for the same reason.',
          'And the inverse? That is running the machine backwards. It only works if the machine never lost information \u2014 which is exactly what *bijective* means.'
        ]
      },

      lesson: [
        { t: 'h', x: 'Composition' },
        { t: 'formula', name: 'Composite function', tex: '(f \\circ g)(x) = f(g(x))', star: true,
          note: 'Apply $g$ **first**, then $f$. The function nearest $x$ acts first.' },
        { t: 'p', x: 'For $f \\circ g$ to exist, the range of $g$ must lie inside the domain of $f$ \u2014 the output of the first machine must be something the second can accept.' },
        { t: 'worked', title: 'Worked example \u2014 order matters', tier: 'G',
          q: 'If $f(x) = 2x + 3$ and $g(x) = x^2$, find $(f\\circ g)(x)$ and $(g\\circ f)(x)$.',
          steps: [
            '$(f \\circ g)(x) = f(g(x)) = f(x^2) = 2x^2 + 3$.',
            '$(g \\circ f)(x) = g(f(x)) = g(2x+3) = (2x+3)^2 = 4x^2 + 12x + 9$.',
            'Compare at $x = 1$: $f\\circ g$ gives $5$; $g \\circ f$ gives $25$.'
          ],
          ans: '$f\\circ g \\neq g \\circ f$ \u2014 composition is **not** commutative.'
        },
        { t: 'ul', items: [
          'Composition **is** associative: $(f \\circ g) \\circ h = f \\circ (g \\circ h)$.',
          'If $f$ and $g$ are both one-one, so is $f \\circ g$.',
          'If $f$ and $g$ are both onto, so is $f \\circ g$.'
        ] },

        { t: 'h', x: 'Inverse functions' },
        { t: 'callout', kind: 'jee', title: 'When does an inverse exist?', x: '$f^{-1}$ exists **iff $f$ is bijective** (one-one and onto). One-one guarantees no ambiguity going backwards; onto guarantees every target has something to go back to.' },
        { t: 'formula', name: 'Defining property', tex: 'f^{-1}(y) = x \\iff f(x) = y', star: true },
        { t: 'formula', name: 'The check', tex: '(f^{-1}\\circ f)(x) = x \\quad\\text{and}\\quad (f \\circ f^{-1})(y) = y', star: true },

        { t: 'h', x: 'The three-step recipe' },
        { t: 'ol', items: [
          'Write $y = f(x)$.',
          'Solve for $x$ in terms of $y$.',
          'Swap the letters: replace $y$ by $x$ to get $f^{-1}(x)$.'
        ] },
        { t: 'worked', title: 'Worked example \u2014 inverting a rational function', tier: 'M',
          q: 'Find the inverse of $f(x) = \\dfrac{3x + 2}{x - 1}$, $x \\neq 1$.',
          steps: [
            'Set $y = \\dfrac{3x+2}{x-1}$ and cross-multiply: $y(x - 1) = 3x + 2$.',
            'Expand: $yx - y = 3x + 2$.',
            'Collect the $x$ terms: $yx - 3x = y + 2$, so $x(y - 3) = y + 2$.',
            'Solve: $x = \\dfrac{y+2}{y-3}$.',
            'Swap letters: $f^{-1}(x) = \\dfrac{x+2}{x-3}$, $x \\neq 3$.'
          ],
          ans: '$f^{-1}(x) = \\dfrac{x+2}{x-3}$ \u2014 note the domain of $f^{-1}$ excludes $3$, which is exactly the value $f$ never outputs.'
        },
        { t: 'callout', kind: 'tip', title: 'Domain and range swap', x: 'Domain of $f^{-1}$ = range of $f$, and range of $f^{-1}$ = domain of $f$. If you find an inverse whose domain does not match, you have made an algebra slip.' },

        { t: 'formula', name: 'Inverse of a composite', tex: '(f \\circ g)^{-1} = g^{-1} \\circ f^{-1}', star: true,
          note: 'The order reverses \u2014 socks then shoes, so shoes off then socks off.' },

        { t: 'sim' },

        { t: 'callout', kind: 'trap', title: '$f^{-1}(x)$ is not $\\dfrac{1}{f(x)}$', x: 'The superscript $-1$ here means "inverse function", not "reciprocal". For $f(x) = 2x$, the inverse is $f^{-1}(x) = x/2$, whereas $\\dfrac{1}{f(x)} = \\dfrac{1}{2x}$. Completely different objects.' },
        { t: 'callout', kind: 'tip', title: 'The geometric picture', x: 'The graph of $f^{-1}$ is the graph of $f$ reflected in the line $y = x$. So if $(a,b)$ is on $f$, then $(b,a)$ is on $f^{-1}$ \u2014 which is exactly why the horizontal line test on $f$ becomes the vertical line test on $f^{-1}$.' }
      ],

      formulas: [
        { name: 'Composition', tex: '(f\\circ g)(x) = f(g(x))', star: true },
        { name: 'Inverse property', tex: 'f^{-1}(f(x)) = x' },
        { name: 'Inverse of composite', tex: '(f\\circ g)^{-1} = g^{-1}\\circ f^{-1}', star: true },
        { name: 'Existence', tex: 'f^{-1}\\ \\text{exists} \\iff f\\ \\text{is bijective}', star: true }
      ],

      questions: [
        { id: 'm-01-07-q1', tier: 'G', kind: 'mcq', parSec: 45, kcs: ['kc-m-compose'],
          stem: 'If $f(x) = 2x + 3$ and $g(x) = x^2$, then $(f \\circ g)(x)$ is:',
          options: ['$(2x+3)^2$', '$2x^2 + 3$', '$2x^2 + 6x$', '$4x^2 + 9$'],
          answer: 1,
          hint: '$g$ acts first.',
          solution: [
            '$(f\\circ g)(x) = f(g(x))$.',
            '$g(x) = x^2$, so we need $f(x^2)$.',
            '$f(x^2) = 2(x^2) + 3 = 2x^2 + 3$.',
            'Option A is $(g \\circ f)(x)$ \u2014 the other order.'
          ] },

        { id: 'm-01-07-q2', tier: 'G', kind: 'mcq', parSec: 45, kcs: ['kc-m-inverse'],
          stem: 'A function $f$ has an inverse if and only if $f$ is:',
          options: ['one-one', 'onto', 'bijective', 'continuous'],
          answer: 2,
          hint: 'Both directions must work.',
          solution: [
            'One-one ensures the backward map is unambiguous (no output has two possible origins).',
            'Onto ensures every element of the codomain actually has an origin to return to.',
            'Both together \u2014 **bijective** \u2014 are needed for $f^{-1}$ to be a well-defined function.',
            'Continuity is irrelevant: many discontinuous functions have inverses.'
          ] },

        { id: 'm-01-07-q3', tier: 'G', kind: 'mcq', parSec: 50, kcs: ['kc-m-inverse'],
          stem: 'If $f(x) = 3x - 5$, then $f^{-1}(x)$ is:',
          options: [
            '$\\dfrac{x + 5}{3}$',
            '$\\dfrac{x - 5}{3}$',
            '$\\dfrac{1}{3x - 5}$',
            '$3x + 5$'
          ],
          answer: 0,
          hint: 'Undo the operations in reverse order.',
          solution: [
            'Set $y = 3x - 5$.',
            'Solve for $x$: $x = \\dfrac{y + 5}{3}$.',
            'Swap letters: $f^{-1}(x) = \\dfrac{x+5}{3}$.',
            'Check: $f^{-1}(f(2)) = f^{-1}(1) = \\dfrac{6}{3} = 2$. \u2713'
          ] },

        { id: 'm-01-07-q4', tier: 'M', kind: 'mcq', parSec: 80, kcs: ['kc-m-compose'],
          stem: 'If $f(x) = x + 1$ and $g(x) = 2x$, then $(g \\circ f)(3)$ equals:',
          options: ['$7$', '$8$', '$6$', '$9$'],
          answer: 1,
          hint: 'Apply $f$ first, then $g$.',
          solution: [
            '$(g\\circ f)(3) = g(f(3))$.',
            '$f(3) = 3 + 1 = 4$.',
            '$g(4) = 2 \\times 4 = 8$.',
            'For contrast, $(f \\circ g)(3) = f(6) = 7$ \u2014 different, as expected.'
          ] },

        { id: 'm-01-07-q5', tier: 'M', kind: 'mcq', parSec: 90, kcs: ['kc-m-inverse'],
          stem: 'The inverse of $f(x) = \\dfrac{3x + 2}{x - 1}$ is:',
          options: [
            '$\\dfrac{x + 2}{x - 3}$',
            '$\\dfrac{x - 2}{x + 3}$',
            '$\\dfrac{x - 1}{3x + 2}$',
            '$\\dfrac{3x - 2}{x + 1}$'
          ],
          answer: 0,
          hint: 'Cross-multiply, then collect the $x$ terms on one side.',
          solution: [
            '$y = \\dfrac{3x+2}{x-1} \\Rightarrow y(x-1) = 3x+2$.',
            '$yx - y = 3x + 2 \\Rightarrow yx - 3x = y + 2$.',
            '$x(y - 3) = y + 2 \\Rightarrow x = \\dfrac{y+2}{y-3}$.',
            'Swapping letters: $f^{-1}(x) = \\dfrac{x+2}{x-3}$.'
          ] },

        { id: 'm-01-07-q6', tier: 'M', kind: 'mcq', parSec: 85, kcs: ['kc-m-compose', 'kc-m-inverse'],
          stem: 'For bijective functions $f$ and $g$, $(f \\circ g)^{-1}$ equals:',
          options: [
            '$f^{-1} \\circ g^{-1}$',
            '$g^{-1} \\circ f^{-1}$',
            '$(f \\circ g)$',
            '$\\dfrac{1}{f \\circ g}$'
          ],
          answer: 1,
          hint: 'Think socks and shoes.',
          solution: [
            '$f \\circ g$ applies $g$ first, then $f$.',
            'To undo it you must undo the **last** operation first: undo $f$, then undo $g$.',
            'So $(f\\circ g)^{-1} = g^{-1} \\circ f^{-1}$.',
            'Verify: $(g^{-1}\\circ f^{-1})(f(g(x))) = g^{-1}(f^{-1}(f(g(x)))) = g^{-1}(g(x)) = x$. \u2713'
          ] },

        { id: 'm-01-07-q7', tier: 'H', kind: 'mcq', parSec: 120, kcs: ['kc-m-compose'],
          stem: 'If $f(x) = \\dfrac{x}{x - 1}$ for $x \\neq 1$, then $(f \\circ f)(x)$ equals:',
          options: ['$x$', '$\\dfrac{x}{x-1}$', '$\\dfrac{1}{x}$', '$\\dfrac{x-1}{x}$'],
          answer: 0,
          hint: 'Substitute $f(x)$ into $f$ and simplify the compound fraction.',
          solution: [
            '$(f\\circ f)(x) = f\\!\\left(\\dfrac{x}{x-1}\\right) = \\dfrac{\\frac{x}{x-1}}{\\frac{x}{x-1} - 1}$.',
            'Simplify the denominator: $\\dfrac{x}{x-1} - 1 = \\dfrac{x - (x-1)}{x-1} = \\dfrac{1}{x-1}$.',
            'So the expression is $\\dfrac{x/(x-1)}{1/(x-1)} = x$.',
            'So $f$ is its own inverse \u2014 such a function is called an **involution**.'
          ] },

        { id: 'm-01-07-q8', tier: 'H', kind: 'mcq', parSec: 130, kcs: ['kc-m-inverse', 'kc-m-bijective'],
          stem: 'Let $f : \\mathbb{R} \\to \\mathbb{R}$, $f(x) = x^3 + 2$. Then $f^{-1}(x)$ is:',
          options: [
            '$(x - 2)^{1/3}$',
            '$(x + 2)^{1/3}$',
            '$x^{1/3} - 2$',
            '$\\dfrac{1}{x^3 + 2}$'
          ],
          answer: 0,
          hint: 'Undo the operations in reverse: subtract 2, then take the cube root.',
          solution: [
            '$y = x^3 + 2 \\Rightarrow x^3 = y - 2 \\Rightarrow x = (y-2)^{1/3}$.',
            'So $f^{-1}(x) = (x-2)^{1/3}$.',
            'The inverse exists because $x \\mapsto x^3$ is strictly increasing on $\\mathbb{R}$, hence one-one, and its range is all of $\\mathbb{R}$, hence onto.',
            'Contrast with $x^2$, which is not one-one on $\\mathbb{R}$ and so has no inverse there.'
          ] },

        { id: 'm-01-07-q9', tier: 'H', kind: 'mcq', parSec: 140, kcs: ['kc-m-compose'],
          stem: 'If $f(x) = \\dfrac{1}{1-x}$, then $f(f(f(x)))$ equals:',
          options: ['$x$', '$1 - x$', '$\\dfrac{1}{x}$', '$\\dfrac{x-1}{x}$'],
          answer: 0,
          hint: 'Compute $f(f(x))$ first, then apply $f$ once more.',
          solution: [
            '$f(f(x)) = \\dfrac{1}{1 - \\frac{1}{1-x}} = \\dfrac{1}{\\frac{(1-x) - 1}{1-x}} = \\dfrac{1-x}{-x} = \\dfrac{x-1}{x}$.',
            'Now $f(f(f(x))) = f\\!\\left(\\dfrac{x-1}{x}\\right) = \\dfrac{1}{1 - \\frac{x-1}{x}}$.',
            'Denominator: $1 - \\dfrac{x-1}{x} = \\dfrac{x - (x-1)}{x} = \\dfrac{1}{x}$.',
            'So $f(f(f(x))) = \\dfrac{1}{1/x} = x$.',
            '$f$ has **order 3**: applying it three times returns you to the start. A favourite JEE construction.'
          ] }
      ]
    },

    /* ---------------------------------------------------------------
       8. Graphs of standard functions
       --------------------------------------------------------------- */
    {
      id: 'm-01-08',
      title: 'Graphs of Standard Functions',
      short: 'The shapes you must recognise instantly',
      kcs: ['kc-m-stdgraph', 'kc-m-special', 'kc-m-transform'],
      prereq: ['m-01-06'],
      estMin: 28,
      weight: 1.3,
      widget: 'grapher',
      widgetTitle: 'Graph Studio',
      widgetBrief: 'Plot any standard function, apply live transformations, and read domain and range straight off the axes.',

      story: {
        speaker: 'CANTOR',
        avatar: '♾️',
        lines: [
          'Final module. A picture is not a substitute for algebra \u2014 it is faster than algebra.',
          'A candidate who *sees* that $y = |x-2|$ is a V shifted two units right will solve $|x-2| = 3$ in four seconds. One who only manipulates symbols will write two cases and check them.',
          'Memorise eight shapes and four transformation rules. Between them they generate almost everything the exam will show you.'
        ]
      },

      lesson: [
        { t: 'h', x: 'The eight shapes' },
        { t: 'table',
          head: ['Function', 'Domain', 'Range', 'Shape'],
          rows: [
            ['$y = x$', '$\\mathbb{R}$', '$\\mathbb{R}$', 'line through origin, slope 1'],
            ['$y = x^2$', '$\\mathbb{R}$', '$[0,\\infty)$', 'parabola, vertex at origin'],
            ['$y = x^3$', '$\\mathbb{R}$', '$\\mathbb{R}$', 'S-curve through origin'],
            ['$y = 1/x$', '$\\mathbb{R}-\\{0\\}$', '$\\mathbb{R}-\\{0\\}$', 'rectangular hyperbola'],
            ['$y = \\sqrt{x}$', '$[0,\\infty)$', '$[0,\\infty)$', 'half-parabola on its side'],
            ['$y = |x|$', '$\\mathbb{R}$', '$[0,\\infty)$', 'V with vertex at origin'],
            ['$y = e^{x}$', '$\\mathbb{R}$', '$(0,\\infty)$', 'rises through $(0,1)$'],
            ['$y = \\log x$', '$(0,\\infty)$', '$\\mathbb{R}$', 'mirror of $e^x$ in $y=x$']
          ]
        },

        { t: 'h', x: 'The three special functions' },
        { t: 'table',
          head: ['Piecewise definition', 'Condition', 'Value'],
          rows: [
            ['**Modulus** $|x|$', '$x \\geq 0$', '$x$'],
            ['', '$x < 0$', '$-x$'],
            ['**Signum** $\\text{sgn}(x)$', '$x > 0$', '$1$'],
            ['', '$x = 0$', '$0$'],
            ['', '$x < 0$', '$-1$']
          ]
        },
        { t: 'p', x: 'Modulus: domain $\\mathbb{R}$, range $[0,\\infty)$. Signum: domain $\\mathbb{R}$, range the three-element set $\\{-1, 0, 1\\}$ — note that is a *set of three points*, not an interval.' },
        { t: 'formula', name: 'Greatest integer (floor)', tex: '[x] = \\text{greatest integer} \\leq x',
          note: 'Domain $\\mathbb{R}$, range $\\mathbb{Z}$. A staircase, jumping at every integer.' },
        { t: 'callout', kind: 'trap', title: 'The floor of a negative number', x: '$[2.3] = 2$, which feels natural. But $[-2.3] = \\mathbf{-3}$, not $-2$, because $-3$ is the greatest integer that is still $\\leq -2.3$. The floor always moves **left** on the number line. This is tested constantly.' },
        { t: 'formula', name: 'Fractional part', tex: '\\{x\\} = x - [x]', note: 'Range $[0, 1)$ \u2014 always non-negative, never reaches 1.' },

        { t: 'h', x: 'Transformations' },
        { t: 'table',
          head: ['Transformation', 'Effect on the graph', 'Direction'],
          rows: [
            ['$f(x) + k$', 'shift **up** by $k$', 'as expected'],
            ['$f(x + k)$', 'shift **left** by $k$', 'opposite to the sign'],
            ['$-f(x)$', 'reflect in the **$x$-axis**', 'flip vertically'],
            ['$f(-x)$', 'reflect in the **$y$-axis**', 'flip horizontally'],
            ['$a\\,f(x)$, $a>1$', 'stretch vertically', ''],
            ['$f(ax)$, $a>1$', 'compress horizontally', 'opposite again'],
            ['$|f(x)|$', 'reflect the part **below** the $x$-axis upwards', ''],
            ['$f(|x|)$', 'discard $x<0$, mirror the $x>0$ part', '']
          ]
        },
        { t: 'callout', kind: 'jee', title: 'The rule that fixes the confusion', x: 'Changes **outside** the function ($f(x)+k$, $-f(x)$) affect $y$ and behave intuitively. Changes **inside** the bracket ($f(x+k)$, $f(ax)$) affect $x$ and behave **backwards**. $f(x+2)$ shifts *left*, because the graph now reaches its old value two units earlier.' },

        { t: 'worked', title: 'Worked example \u2014 building a graph by stages', tier: 'M',
          q: 'Sketch $y = |x - 2| + 1$ and state its range.',
          steps: [
            'Start with $y = |x|$: a V with its vertex at the origin.',
            '$|x - 2|$: inside the function, so shift **right** by 2. Vertex moves to $(2, 0)$.',
            '$+1$: outside, so shift **up** by 1. Vertex moves to $(2, 1)$.',
            'The arms still have slopes $\\pm 1$, and the minimum value is now 1.'
          ],
          ans: 'A V with vertex $(2,1)$; range $= [1, \\infty)$.'
        },

        { t: 'sim' },

        { t: 'callout', kind: 'tip', title: 'Odd and even, read off the picture', x: '**Even** ($f(-x) = f(x)$): symmetric about the $y$-axis \u2014 $x^2$, $|x|$, $\\cos x$. **Odd** ($f(-x) = -f(x)$): symmetric about the origin \u2014 $x^3$, $\\sin x$, $1/x$. Recognising this halves the work in later integration problems.' }
      ],

      formulas: [
        { name: 'Modulus range', tex: '|x| \\geq 0' },
        { name: 'Floor bound', tex: '[x] \\leq x < [x] + 1', star: true },
        { name: 'Fractional part', tex: '\\{x\\} = x - [x] \\in [0,1)', star: true },
        { name: 'Shift right by $k$', tex: 'f(x-k)', star: true },
        { name: 'Even / odd', tex: 'f(-x)=f(x)\\ /\\ f(-x)=-f(x)' }
      ],

      questions: [
        { id: 'm-01-08-q1', tier: 'G', kind: 'mcq', parSec: 35, kcs: ['kc-m-special'],
          stem: 'The range of $f(x) = |x|$ is:',
          options: ['$\\mathbb{R}$', '$[0, \\infty)$', '$(0, \\infty)$', '$(-\\infty, 0]$'],
          answer: 1,
          hint: 'Can the modulus ever be negative? Can it be zero?',
          solution: [
            'The modulus of any real number is non-negative.',
            'It reaches $0$ at $x = 0$, so $0$ is included.',
            'Range $= [0, \\infty)$. Note the square bracket \u2014 $(0,\\infty)$ would wrongly exclude zero.'
          ] },

        { id: 'm-01-08-q2', tier: 'G', kind: 'integer', parSec: 40, kcs: ['kc-m-special'],
          stem: 'What is the value of $[-2.3]$, where $[\\,\\cdot\\,]$ denotes the greatest integer function? (Enter the integer.)',
          answer: -3,
          hint: 'The greatest integer that is less than or equal to $-2.3$.',
          solution: [
            'We need the greatest integer $\\leq -2.3$.',
            'Candidates: $-2$ is **greater** than $-2.3$, so it is disqualified.',
            '$-3 \\leq -2.3$ \u2713 and it is the largest such integer.',
            '$[-2.3] = -3$. The floor function always moves left, never toward zero.'
          ] },

        { id: 'm-01-08-q3', tier: 'G', kind: 'mcq', parSec: 40, kcs: ['kc-m-special'],
          stem: 'The range of the signum function $\\text{sgn}(x)$ is:',
          options: ['$\\{-1, 1\\}$', '$\\{-1, 0, 1\\}$', '$[-1, 1]$', '$\\mathbb{R}$'],
          answer: 1,
          hint: 'It has exactly three possible outputs.',
          solution: [
            '$\\text{sgn}(x) = 1$ for $x > 0$, $0$ for $x = 0$, $-1$ for $x < 0$.',
            'So the only outputs are $-1$, $0$ and $1$.',
            'Range $= \\{-1, 0, 1\\}$ \u2014 a set of three points, **not** the interval $[-1,1]$.'
          ] },

        { id: 'm-01-08-q4', tier: 'M', kind: 'mcq', parSec: 65, kcs: ['kc-m-transform'],
          stem: 'The graph of $y = f(x - 3)$ is obtained from that of $y = f(x)$ by shifting:',
          options: ['3 units left', '3 units right', '3 units up', '3 units down'],
          answer: 1,
          hint: 'Changes inside the bracket behave opposite to the sign.',
          solution: [
            'A change inside the function argument affects $x$ and acts in the *opposite* direction.',
            '$y = f(x-3)$ takes the value $f(0)$ when $x = 3$ instead of $x = 0$.',
            'So the whole graph moves **3 units right**.'
          ] },

        { id: 'm-01-08-q5', tier: 'M', kind: 'mcq', parSec: 75, kcs: ['kc-m-transform', 'kc-m-special'],
          stem: 'The range of $f(x) = |x - 2| + 1$ is:',
          options: ['$[0, \\infty)$', '$[1, \\infty)$', '$[2, \\infty)$', '$\\mathbb{R}$'],
          answer: 1,
          hint: 'What is the smallest value the modulus term can take?',
          solution: [
            '$|x-2| \\geq 0$, with equality when $x = 2$.',
            'Adding 1 shifts everything up: $f(x) \\geq 1$.',
            'The minimum value $1$ is attained at $x = 2$.',
            'Range $= [1, \\infty)$.'
          ] },

        { id: 'm-01-08-q6', tier: 'M', kind: 'mcq', parSec: 70, kcs: ['kc-m-stdgraph'],
          stem: 'Which of these functions is **odd**?',
          options: ['$f(x) = x^2$', '$f(x) = |x|$', '$f(x) = x^3$', '$f(x) = \\cos x$'],
          answer: 2,
          hint: 'Test whether $f(-x) = -f(x)$.',
          solution: [
            '$f(x) = x^3$: $f(-x) = (-x)^3 = -x^3 = -f(x)$. \u2713 Odd.',
            '$x^2$: $f(-x) = x^2 = f(x)$ \u2014 even.',
            '$|x|$: $|-x| = |x|$ \u2014 even.',
            '$\\cos x$: $\\cos(-x) = \\cos x$ \u2014 even.',
            'Odd functions are symmetric about the **origin**; even ones about the **$y$-axis**.'
          ] },

        { id: 'm-01-08-q7', tier: 'H', kind: 'mcq', parSec: 110, kcs: ['kc-m-special', 'kc-m-range'],
          stem: 'The range of $f(x) = x - [x]$ (the fractional part function) is:',
          options: ['$[0, 1]$', '$[0, 1)$', '$(0, 1)$', '$\\mathbb{R}$'],
          answer: 1,
          hint: 'Can the fractional part be exactly 1?',
          solution: [
            'By definition $[x] \\leq x < [x] + 1$.',
            'Subtracting $[x]$ throughout: $0 \\leq x - [x] < 1$.',
            'The value $0$ occurs whenever $x$ is an integer, so it is included.',
            'The value $1$ is never reached \u2014 if the fractional part hit 1, the floor would have incremented.',
            'Range $= [0, 1)$.'
          ] },

        { id: 'm-01-08-q8', tier: 'H', kind: 'mcq', parSec: 120, kcs: ['kc-m-transform'],
          stem: 'The graph of $y = |f(x)|$ is obtained from $y = f(x)$ by:',
          options: [
            'reflecting the entire graph in the $x$-axis',
            'reflecting only the portion below the $x$-axis above it',
            'reflecting the portion left of the $y$-axis to the right',
            'shifting the graph upwards'
          ],
          answer: 1,
          hint: 'What does taking the modulus do to a negative output?',
          solution: [
            '$|f(x)|$ leaves non-negative outputs untouched and makes negative outputs positive.',
            'Graphically: wherever the curve is above the $x$-axis, nothing changes; wherever it dips below, that part flips up.',
            'Contrast with $f(|x|)$, which discards $x<0$ and mirrors the right half \u2014 option C describes that instead.'
          ] },

        { id: 'm-01-08-q9', tier: 'H', kind: 'mcq', parSec: 130, kcs: ['kc-m-range', 'kc-m-stdgraph'],
          stem: 'The range of $f(x) = \\dfrac{1}{2 - \\cos 3x}$ is:',
          options: [
            '$\\left[\\dfrac{1}{3}, 1\\right]$',
            '$\\left(\\dfrac{1}{3}, 1\\right)$',
            '$[-1, 1]$',
            '$\\left[1, 3\\right]$'
          ],
          answer: 0,
          hint: 'Bound the denominator first, then invert the inequality.',
          solution: [
            '$\\cos 3x \\in [-1, 1]$ for all real $x$.',
            'So $2 - \\cos 3x \\in [2-1,\\ 2+1] = [1, 3]$.',
            'The denominator is always positive, so taking reciprocals **reverses** the inequality:',
            '$\\dfrac{1}{2 - \\cos 3x} \\in \\left[\\dfrac{1}{3}, 1\\right]$.',
            'Both endpoints are attained (at $\\cos 3x = -1$ and $\\cos 3x = 1$), so the brackets are closed.'
          ] }
      ]
    }
  ],

  boss: {
    id: 'm-01-boss',
    name: 'The Barber of Russell',
    title: 'Self-Referential Paradox',
    avatar: '♾️',
    hp: 10,
    lives: 3,
    timePerQ: 120,
    intro: 'The Logic Core flickers. A figure steps out of it holding a razor, and asks, pleasantly: "I shave every cadet who does not shave themselves. Who shaves me?" The lights dim as the core tries to evaluate the question.',
    defeat: 'The figure smiles, sets down the razor and dissolves. CANTOR speaks softly: "A collection may be described and still not be a set, Cadet. Knowing which is which is the beginning of rigour. Index rebuilt. Well done."',
    taunts: [
      'Is the range equal to the codomain? Be precise.',
      'Reflexive requires every element. Every one.',
      'You forgot that the floor of a negative goes down.',
      'Domain is an intersection, not a union.'
    ],
    extraQuestions: [
      { id: 'm-01-boss-q1', tier: 'H', kind: 'mcq', parSec: 130, kcs: ['kc-m-domain', 'kc-m-special'],
        stem: 'The domain of $f(x) = \\dfrac{1}{\\sqrt{x - |x|}}$ is:',
        options: ['$(0,\\infty)$', '$(-\\infty,0)$', '$\\mathbb{R}-\\{0\\}$', '$\\emptyset$'],
        answer: 3,
        hint: 'Work out $x - |x|$ separately for positive and negative $x$.',
        solution: [
          'We need $x - |x| > 0$ (strictly, because it sits under a root **and** in a denominator).',
          'If $x \\geq 0$: $|x| = x$, so $x - |x| = 0$. Not $> 0$. \u2717',
          'If $x < 0$: $|x| = -x$, so $x - |x| = x + x = 2x < 0$. Not $> 0$. \u2717',
          'No real $x$ works, so the domain is the **empty set**.',
          'A beautifully nasty question: the formula looks perfectly ordinary and defines nothing at all.'
        ] },
      { id: 'm-01-boss-q2', tier: 'H', kind: 'mcq', parSec: 130, kcs: ['kc-m-equiv', 'kc-m-transitive'],
        stem: 'On $\\mathbb{R}$, define $a\\,R\\,b \\iff a \\leq b^2$. Then $R$ is:',
        options: [
          'reflexive and transitive',
          'neither reflexive nor transitive',
          'symmetric',
          'an equivalence relation'
        ],
        answer: 1,
        hint: 'Try $a = \\tfrac{1}{2}$ for reflexivity, and find a chain that breaks transitivity.',
        solution: [
          '**Reflexive?** Need $a \\leq a^2$ for all $a$. Take $a = \\tfrac{1}{2}$: is $\\tfrac{1}{2} \\leq \\tfrac{1}{4}$? No. \u2717',
          '**Transitive?** Take $a = 2$, $b = -2$, $c = 1$. $2 \\leq (-2)^2 = 4$ \u2713 and $-2 \\leq 1^2 = 1$ \u2713, but $2 \\leq 1^2 = 1$? No. \u2717',
          '**Symmetric?** Take $a = 0$, $b = 5$: $0 \\leq 25$ \u2713 so $0\\,R\\,5$. But $5 \\leq 0$ is false, so $5\\,R\\,0$ fails. \u2717',
          'So $R$ has none of the three properties \u2014 and the answer asks only about reflexive and transitive, both of which fail.'
        ] },
      { id: 'm-01-boss-q3', tier: 'M', kind: 'integer', parSec: 110, kcs: ['kc-m-card3'],
        stem: 'In a group of $70$ people, $37$ like coffee, $52$ like tea, and each person likes at least one of the two drinks. How many like **both**?',
        answer: 19,
        hint: 'Everyone is in the union.',
        solution: [
          'Since everyone likes at least one, $n(C \\cup T) = 70$.',
          '$70 = 37 + 52 - n(C\\cap T)$.',
          '$n(C \\cap T) = 89 - 70 = 19$.'
        ] }
    ]
  },

  formulaSheet: [
    { name: 'Power set', tex: 'n(P(A)) = 2^{n(A)}' },
    { name: 'Union of two sets', tex: 'n(A\\cup B) = n(A)+n(B)-n(A\\cap B)' },
    { name: 'Union of three sets', tex: 'n(A\\cup B\\cup C) = \\sum n - \\sum n(\\text{pairs}) + n(A\\cap B\\cap C)' },
    { name: 'De Morgan', tex: '(A\\cup B)\' = A\'\\cap B\',\\quad (A\\cap B)\' = A\'\\cup B\'' },
    { name: 'Difference', tex: 'A - B = A\\cap B\'' },
    { name: 'Cartesian product', tex: 'n(A\\times B) = n(A)n(B)' },
    { name: 'Number of relations', tex: '2^{n(A)n(B)}' },
    { name: 'Reflexive relations', tex: '2^{n^2-n}' },
    { name: 'Symmetric relations', tex: '2^{n(n+1)/2}' },
    { name: 'Equivalence relation', tex: '\\text{reflexive} + \\text{symmetric} + \\text{transitive}' },
    { name: 'Number of functions', tex: 'p^{m}\\ (A \\to B,\\ |A|=m,|B|=p)' },
    { name: 'One-one functions', tex: '{}^{p}P_{m}' },
    { name: 'Composition', tex: '(f\\circ g)(x) = f(g(x))' },
    { name: 'Inverse of composite', tex: '(f\\circ g)^{-1} = g^{-1}\\circ f^{-1}' },
    { name: 'Domain rules', tex: '\\text{denom}\\neq0,\\ \\text{even root}\\geq0,\\ \\log(\\cdot)>0' },
    { name: 'Floor bounds', tex: '[x] \\leq x < [x]+1' },
    { name: 'Fractional part', tex: '\\{x\\} = x-[x] \\in [0,1)' },
    { name: 'Shift', tex: 'f(x-k)\\ \\text{moves right by } k' }
  ]
};
