/**
 * Mathematics - Chapter 2: Complex Numbers & Quadratic Equations
 *
 * JEE Main Unit 2. The two halves are usually taught apart and are in fact one
 * subject: complex numbers exist because quadratics with negative discriminant
 * needed somewhere to keep their roots. The chapter is ordered so that fact is
 * unavoidable - the roots leave the real line in topic 4 and land exactly where
 * topics 1 to 3 built the ground for them.
 */

export default {
  id: 'm-02',
  subject: 'maths',
  number: 2,
  title: 'Complex Numbers & Quadratic Equations',
  subtitle: 'Where the missing roots went',
  blurb: 'Every quadratic has two roots. Some of them are simply not on the number line you were given, and the whole of this chapter is the business of going to find them.',
  jeeWeight: 6.7,
  estMin: 320,
  icon: '\u221a',

  guide: {
    name: 'CANTOR',
    full: 'Categorical Analysis & Notation Terminal, Ordinal Rank',
    avatar: '\u267e\ufe0f',
    voice: 'formal, patient, occasionally startled by infinity'
  },

  intro: {
    speaker: 'CANTOR',
    avatar: '\u267e\ufe0f',
    lines: [
      'Cadet. The Logic Core has been asked to solve $x^2 + 1 = 0$ and has returned an error for the eleventh time.',
      'Its objection is reasonable: no real number squares to a negative. It is refusing to answer because the answer is not where it is looking.',
      'So we will extend the territory. One new number, defined by one property, and every quadratic that has ever failed becomes solvable.',
      'Six modules. By the end, "no solution" will be a sentence you never write again.'
    ]
  },

  /* ================================================================ */
  kcs: {
    'kc-m2-iota':        { name: 'Powers of i',                        weight: 1.2, prereq: [] },
    'kc-m2-algebra':     { name: 'Arithmetic of complex numbers',      weight: 1.5, prereq: ['kc-m2-iota'] },
    'kc-m2-conjugate':   { name: 'Conjugate and division',             weight: 1.5, prereq: ['kc-m2-algebra'] },

    'kc-m2-argand':      { name: 'The Argand plane and modulus',       weight: 1.5, prereq: ['kc-m2-algebra'] },
    'kc-m2-arg':         { name: 'Argument and the correct quadrant',  weight: 1.6, prereq: ['kc-m2-argand'] },
    'kc-m2-polar':       { name: 'Polar form',                         weight: 1.5, prereq: ['kc-m2-arg'] },
    'kc-m2-modprops':    { name: 'Modulus properties and loci',        weight: 1.4, prereq: ['kc-m2-argand'] },

    'kc-m2-demoivre':    { name: 'De Moivre\u2019s theorem',                weight: 1.6, prereq: ['kc-m2-polar'] },
    'kc-m2-roots':       { name: 'nth roots of unity',                 weight: 1.4, prereq: ['kc-m2-demoivre'] },
    'kc-m2-omega':       { name: 'Cube roots of unity, \u03c9',             weight: 1.5, prereq: ['kc-m2-roots'] },

    'kc-m2-quadratic':   { name: 'Solving a quadratic',                weight: 1.5, prereq: [] },
    'kc-m2-discriminant':{ name: 'The discriminant and nature of roots', weight: 1.8, prereq: ['kc-m2-quadratic'] },
    'kc-m2-complexroots':{ name: 'Complex roots come in pairs',        weight: 1.5, prereq: ['kc-m2-discriminant', 'kc-m2-conjugate'] },

    'kc-m2-vieta':       { name: 'Sum and product of roots',           weight: 1.8, prereq: ['kc-m2-quadratic'] },
    'kc-m2-symmetric':   { name: 'Symmetric functions of the roots',   weight: 1.6, prereq: ['kc-m2-vieta'] },
    'kc-m2-forming':     { name: 'Building an equation from its roots', weight: 1.5, prereq: ['kc-m2-vieta'] },

    'kc-m2-nature':      { name: 'Sign conditions on the roots',       weight: 1.5, prereq: ['kc-m2-vieta', 'kc-m2-discriminant'] },
    'kc-m2-common':      { name: 'Common roots',                       weight: 1.3, prereq: ['kc-m2-vieta'] },
    'kc-m2-inequality':  { name: 'Quadratic inequalities',             weight: 1.6, prereq: ['kc-m2-discriminant'] }
  },

  /* ================================================================ */
  topics: [
    /* ---------------------------------------------------------------
       1. Complex numbers: the algebra
       --------------------------------------------------------------- */
    {
      id: 'm-02-01',
      title: 'Complex Numbers: the Algebra',
      short: 'One new number, and the rest is arithmetic',
      kcs: ['kc-m2-iota', 'kc-m2-algebra', 'kc-m2-conjugate'],
      prereq: [],
      estMin: 28,
      weight: 1.4,
      widget: 'iotaEngine',
      widgetTitle: 'Iota Engine',
      widgetBrief: 'Raise $i$ to any power, multiply and divide complex numbers, and watch each step of the rationalisation.',

      story: {
        speaker: 'CANTOR',
        avatar: '\u267e\ufe0f',
        lines: [
          'Module One. We declare a number $i$ with the single property $i^2 = -1$, and we do not apologise for it.',
          'This is not a trick. It is the same move that produced negative numbers when subtraction ran out of room, and fractions when division did.',
          'Everything else \u2014 addition, multiplication, division \u2014 is ordinary algebra with one substitution applied at the end.'
        ]
      },

      lesson: [
        { t: 'h', x: 'The definition' },
        { t: 'formula', name: 'The imaginary unit', tex: 'i = \\sqrt{-1}, \\qquad i^2 = -1', star: true },
        { t: 'p', x: 'A **complex number** is $z = a + bi$ with $a, b$ real. We call $a = \\text{Re}(z)$ and $b = \\text{Im}(z)$. Note that the imaginary part is the real number $b$, not $bi$.' },

        { t: 'anim', id: 'iotaCycle' },

        { t: 'callout', kind: 'jee', title: 'The powers of i repeat every four',
          x: '$i^1 = i$, $i^2 = -1$, $i^3 = -i$, $i^4 = 1$, and then it starts again.\n\nTo evaluate $i^n$, divide $n$ by 4 and keep only the **remainder**. $i^{39}$: $39 = 4(9) + 3$, so $i^{39} = i^3 = -i$.\n\nA consequence worth remembering: any **four consecutive** powers of $i$ sum to zero.' },

        { t: 'h', x: 'Arithmetic' },
        { t: 'ul', items: [
          '**Add / subtract**: combine real with real, imaginary with imaginary. $(2+3i) + (1-i) = 3 + 2i$.',
          '**Multiply**: expand as usual, then replace $i^2$ by $-1$. $(2+3i)(1-2i) = 2 - i - 6i^2 = 8 - i$.',
          '**Divide**: multiply top and bottom by the conjugate of the bottom. That is the whole technique.'
        ] },

        { t: 'h', x: 'The conjugate' },
        { t: 'formula', name: 'Conjugate', tex: '\\overline{a+bi} = a - bi', star: true },
        { t: 'formula', name: 'Why it works', tex: 'z\\bar{z} = (a+bi)(a-bi) = a^2 + b^2', star: true,
          note: 'Always real, always non-negative. That is exactly what a denominator needs to be.' },

        { t: 'worked', title: 'Worked example \u2014 dividing', tier: 'M',
          q: 'Simplify $\\dfrac{2+i}{3-i}$.',
          steps: [
            'Multiply top and bottom by $\\overline{3-i} = 3+i$.',
            'Top: $(2+i)(3+i) = 6 + 2i + 3i + i^2 = 5 + 5i$.',
            'Bottom: $(3-i)(3+i) = 9 + 1 = 10$.',
            '$\\dfrac{5+5i}{10} = \\dfrac{1+i}{2}$.'
          ],
          ans: '$\\dfrac{1}{2} + \\dfrac{1}{2}i$. The point of the conjugate is that it makes the denominator real, and nothing else.'
        },

        { t: 'sim' },

        { t: 'callout', kind: 'trap', title: 'The one rule that genuinely breaks',
          x: '$\\sqrt{a}\\sqrt{b} = \\sqrt{ab}$ is **false** when both $a$ and $b$ are negative.\n\n$\\sqrt{-4}\\sqrt{-9} = (2i)(3i) = 6i^2 = -6$, but $\\sqrt{36} = +6$.\n\nAlways convert to $i$ first, then multiply. Every year this costs marks.' }
      ],

      formulas: [
        { name: 'Definition', tex: 'i^2 = -1', star: true },
        { name: 'Powers of i', tex: 'i^{4k}=1,\\ i^{4k+1}=i,\\ i^{4k+2}=-1,\\ i^{4k+3}=-i', star: true },
        { name: 'Conjugate', tex: '\\overline{a+bi} = a-bi', star: true },
        { name: 'Product with conjugate', tex: 'z\\bar{z} = a^2+b^2', star: true },
        { name: 'Division', tex: '\\frac{z_1}{z_2} = \\frac{z_1\\bar{z_2}}{z_2\\bar{z_2}}', star: true }
      ],

      questions: [
        { id: 'm-02-01-q1', tier: 'G', kind: 'mcq', parSec: 30, kcs: ['kc-m2-iota'],
          stem: 'The value of $i^2$ is:',
          options: ['$1$', '$-1$', '$i$', '$-i$'],
          answer: 1,
          hint: 'This is the definition.',
          solution: [
            '$i$ is defined so that $i^2 = -1$.',
            'Every other property of complex numbers is a consequence of this one line.'
          ] },

        { id: 'm-02-01-q2', tier: 'G', kind: 'mcq', parSec: 45, kcs: ['kc-m2-iota'],
          stem: 'The value of $i^{10}$ is:',
          options: ['$1$', '$-1$', '$i$', '$-i$'],
          answer: 1,
          hint: 'Divide the exponent by 4 and keep the remainder.',
          solution: [
            '$10 = 4 \\times 2 + 2$, so the remainder is 2.',
            '$i^{10} = i^2 = -1$.'
          ] },

        { id: 'm-02-01-q3', tier: 'G', kind: 'mcq', parSec: 40, kcs: ['kc-m2-algebra'],
          stem: '$(2+3i) + (1-i)$ equals:',
          options: ['$3 + 2i$', '$3 + 4i$', '$1 + 2i$', '$2 + 3i$'],
          answer: 0,
          hint: 'Real with real, imaginary with imaginary.',
          solution: [
            'Real parts: $2 + 1 = 3$.',
            'Imaginary parts: $3 + (-1) = 2$.',
            'So the sum is $3 + 2i$.'
          ] },

        { id: 'm-02-01-q4', tier: 'M', kind: 'mcq', parSec: 65, kcs: ['kc-m2-algebra'],
          stem: '$(2+3i)(1-2i)$ equals:',
          options: ['$8 - i$', '$2 - 6i$', '$-4 - i$', '$8 + 7i$'],
          answer: 0,
          hint: 'Expand, then replace $i^2$ by $-1$.',
          solution: [
            'Expand: $2 - 4i + 3i - 6i^2$.',
            'Collect: $2 - i - 6i^2$.',
            'Replace $i^2 = -1$: $2 - i + 6 = 8 - i$.'
          ] },

        { id: 'm-02-01-q5', tier: 'M', kind: 'mcq', parSec: 70, kcs: ['kc-m2-conjugate'],
          stem: '$\\dfrac{1}{1+i}$ in the form $a+bi$ is:',
          options: [
            '$\\dfrac{1-i}{2}$',
            '$\\dfrac{1+i}{2}$',
            '$1 - i$',
            '$\\dfrac{i}{2}$'
          ],
          answer: 0,
          hint: 'Multiply top and bottom by the conjugate of the denominator.',
          solution: [
            'Multiply top and bottom by $1-i$.',
            'Bottom: $(1+i)(1-i) = 1 - i^2 = 2$.',
            'Top: $1 \\times (1-i) = 1-i$.',
            'So the answer is $\\dfrac{1-i}{2} = \\dfrac12 - \\dfrac12 i$.'
          ] },

        { id: 'm-02-01-q6', tier: 'M', kind: 'mcq', parSec: 80, kcs: ['kc-m2-conjugate'],
          stem: '$\\dfrac{2+i}{3-i}$ equals:',
          options: [
            '$\\dfrac{1+i}{2}$',
            '$\\dfrac{5+5i}{8}$',
            '$\\dfrac{1-i}{2}$',
            '$\\dfrac{6+i}{10}$'
          ],
          answer: 0,
          hint: 'The conjugate of $3-i$ is $3+i$.',
          solution: [
            'Top: $(2+i)(3+i) = 6 + 2i + 3i + i^2 = 5 + 5i$.',
            'Bottom: $(3-i)(3+i) = 9 - i^2 = 10$.',
            '$\\dfrac{5+5i}{10} = \\dfrac{1+i}{2}$.'
          ] },

        { id: 'm-02-01-q7', tier: 'H', kind: 'integer', parSec: 100, kcs: ['kc-m2-iota'],
          stem: 'Find the value of $i^{1000} + i^{1001} + i^{1002} + i^{1003}$.',
          answer: 0,
          hint: 'What do any four consecutive powers of $i$ add up to?',
          solution: [
            '$1000$ is divisible by 4, so $i^{1000} = 1$.',
            'The next three are $i$, $-1$ and $-i$.',
            'Sum: $1 + i - 1 - i = 0$.',
            'Any four consecutive powers of $i$ sum to zero, because they are the four corners of a square about the origin.'
          ] },

        { id: 'm-02-01-q8', tier: 'H', kind: 'integer', parSec: 110, kcs: ['kc-m2-algebra'],
          stem: 'Find the value of $(1+i)^8$.',
          answer: 16,
          hint: 'Square $(1+i)$ first \u2014 the result is remarkably simple.',
          solution: [
            '$(1+i)^2 = 1 + 2i + i^2 = 2i$.',
            'So $(1+i)^8 = \\left((1+i)^2\\right)^4 = (2i)^4$.',
            '$= 16\\,i^4 = 16 \\times 1 = 16$.',
            'Squaring first turns an eighth power into a fourth power of something trivial \u2014 always try it with $(1\\pm i)$.'
          ] },

        { id: 'm-02-01-q9', tier: 'H', kind: 'mcq', parSec: 120, kcs: ['kc-m2-conjugate', 'kc-m2-iota'],
          stem: 'If $z = \\dfrac{1+i}{1-i}$, then $z^{50}$ equals:',
          options: ['$1$', '$-1$', '$i$', '$-i$'],
          answer: 1,
          hint: 'Simplify $z$ first; it is much simpler than it looks.',
          solution: [
            'Multiply top and bottom by $1+i$: top $= (1+i)^2 = 2i$, bottom $= 2$.',
            'So $z = i$.',
            '$z^{50} = i^{50}$, and $50 = 4(12) + 2$.',
            '$i^{50} = i^2 = -1$.'
          ] }
      ]
    },

    /* ---------------------------------------------------------------
       2. The Argand plane
       --------------------------------------------------------------- */
    {
      id: 'm-02-02',
      title: 'The Argand Plane, Modulus & Argument',
      short: 'Complex numbers are points',
      kcs: ['kc-m2-argand', 'kc-m2-arg', 'kc-m2-polar', 'kc-m2-modprops'],
      prereq: ['m-02-01'],
      estMin: 30,
      weight: 1.6,
      widget: 'argandPlotter',
      widgetTitle: 'Argand Plotter',
      widgetBrief: 'Drag a point around the plane and watch its modulus, argument, conjugate and polar form update together.',

      story: {
        speaker: 'CANTOR',
        avatar: '\u267e\ufe0f',
        lines: [
          'Module Two. Argand\u2019s contribution was not a theorem. It was a picture.',
          'Treat the real part as a horizontal coordinate and the imaginary part as a vertical one, and every complex number becomes a point on a plane.',
          'From that moment, "modulus" means distance, "argument" means direction, and "conjugate" means reflection. Three definitions collapse into one diagram.'
        ]
      },

      lesson: [
        { t: 'h', x: 'The picture' },
        { t: 'p', x: 'Plot $z = a + bi$ at the point $(a, b)$. The horizontal axis is **real**, the vertical axis **imaginary**.' },

        { t: 'anim', id: 'argandPlane' },

        { t: 'formula', name: 'Modulus', tex: '|z| = \\sqrt{a^2 + b^2}', star: true,
          note: 'The distance from the origin. Always real and non-negative.' },
        { t: 'formula', name: 'Argument', tex: '\\arg z = \\theta, \\quad \\tan\\theta = \\frac{b}{a}', star: true },

        { t: 'callout', kind: 'trap', title: 'The calculator will lie to you about the quadrant',
          x: '$\\tan^{-1}$ only returns angles in $(-90^\\circ, 90^\\circ)$, so it cannot distinguish $1+i$ from $-1-i$.\n\n**Always plot the point first.** Then:\n\n\u00b7 Quadrant I: $\\theta$ as calculated\n\u00b7 Quadrant II: $180^\\circ - \\alpha$\n\u00b7 Quadrant III: $\\alpha - 180^\\circ$\n\u00b7 Quadrant IV: $-\\alpha$\n\nwhere $\\alpha = \\tan^{-1}\\left|\\dfrac{b}{a}\\right|$. The **principal** argument lies in $(-\\pi, \\pi]$.' },

        { t: 'h', x: 'Polar form' },
        { t: 'formula', name: 'Polar form', tex: 'z = r(\\cos\\theta + i\\sin\\theta), \\quad r = |z|', star: true,
          note: 'Often abbreviated $r\\,\\text{cis}\\,\\theta$, or written $re^{i\\theta}$.' },

        { t: 'h', x: 'Properties worth knowing cold' },
        { t: 'table',
          head: ['Property', 'Statement'],
          rows: [
            ['Product', '$|z_1 z_2| = |z_1||z_2|$'],
            ['Quotient', '$\\left|\\dfrac{z_1}{z_2}\\right| = \\dfrac{|z_1|}{|z_2|}$'],
            ['Power', '$|z^n| = |z|^n$'],
            ['Conjugate', '$|\\bar{z}| = |z|$, and $\\arg\\bar{z} = -\\arg z$'],
            ['Triangle inequality', '$|z_1 + z_2| \\leq |z_1| + |z_2|$']
          ]
        },
        { t: 'callout', kind: 'jee', title: 'Loci: read them as distances',
          x: '$|z - z_0| = r$ \u2014 a **circle**, centre $z_0$, radius $r$.\n\n$|z - z_1| = |z - z_2|$ \u2014 the **perpendicular bisector** of the segment joining them.\n\n$|z - z_1| + |z - z_2| = k$ \u2014 an **ellipse** with those two foci.\n\nOnce $|z - w|$ is read as "distance from $z$ to $w$", these stop needing algebra.' },

        { t: 'sim' },

        { t: 'callout', kind: 'tip', title: 'Learn 3 + 4i by heart', x: 'Its modulus is exactly 5, and its argument is $\\tan^{-1}(4/3) \\approx 53.13^\\circ$. Examiners reuse the 3\u20134\u20135 triangle constantly, so recognising it saves a square root every time.' }
      ],

      formulas: [
        { name: 'Modulus', tex: '|z| = \\sqrt{a^2+b^2}', star: true },
        { name: 'Argument', tex: '\\tan\\theta = b/a\\ \\text{(fix the quadrant)}', star: true },
        { name: 'Polar form', tex: 'z = r(\\cos\\theta + i\\sin\\theta)', star: true },
        { name: 'Product modulus', tex: '|z_1 z_2| = |z_1||z_2|', star: true },
        { name: 'Conjugate', tex: '|\\bar{z}| = |z|,\\ \\arg\\bar{z} = -\\arg z' },
        { name: 'Triangle inequality', tex: '|z_1+z_2| \\leq |z_1|+|z_2|' },
        { name: 'Circle locus', tex: '|z - z_0| = r' }
      ],

      questions: [
        { id: 'm-02-02-q1', tier: 'G', kind: 'integer', parSec: 40, kcs: ['kc-m2-argand'],
          stem: 'Find $|3 + 4i|$.',
          answer: 5,
          hint: '$|z| = \\sqrt{a^2+b^2}$.',
          solution: [
            '$|3+4i| = \\sqrt{3^2 + 4^2} = \\sqrt{9+16}$.',
            '$= \\sqrt{25} = 5$.',
            'Worth memorising \u2014 the 3\u20134\u20135 triangle appears constantly.'
          ] },

        { id: 'm-02-02-q2', tier: 'G', kind: 'integer', parSec: 40, kcs: ['kc-m2-argand'],
          stem: 'Find $|-5i|$.',
          answer: 5,
          hint: 'The real part is zero.',
          solution: [
            '$-5i = 0 + (-5)i$, so $a = 0$ and $b = -5$.',
            '$|-5i| = \\sqrt{0 + 25} = 5$.',
            'Modulus is a distance, so it is never negative.'
          ] },

        { id: 'm-02-02-q3', tier: 'G', kind: 'mcq', parSec: 40, kcs: ['kc-m2-argand'],
          stem: 'The conjugate of $2 - 7i$ is:',
          options: ['$2 + 7i$', '$-2 - 7i$', '$-2 + 7i$', '$7 - 2i$'],
          answer: 0,
          hint: 'Flip the sign of the imaginary part only.',
          solution: [
            'The conjugate changes the sign of the imaginary part and leaves the real part alone.',
            '$\\overline{2 - 7i} = 2 + 7i$.',
            'On the Argand plane this is a reflection in the real axis.'
          ] },

        { id: 'm-02-02-q4', tier: 'M', kind: 'mcq', parSec: 60, kcs: ['kc-m2-arg'],
          stem: 'The principal argument of $1 + i$ is:',
          options: ['$\\dfrac{\\pi}{4}$', '$\\dfrac{\\pi}{2}$', '$\\dfrac{3\\pi}{4}$', '$-\\dfrac{\\pi}{4}$'],
          answer: 0,
          hint: 'Plot it: which quadrant?',
          solution: [
            '$1+i$ sits at $(1, 1)$ \u2014 the first quadrant.',
            '$\\tan\\theta = 1/1 = 1$, so $\\theta = 45^\\circ = \\dfrac{\\pi}{4}$.',
            'In the first quadrant no adjustment is needed.'
          ] },

        { id: 'm-02-02-q5', tier: 'M', kind: 'mcq', parSec: 75, kcs: ['kc-m2-arg'],
          stem: 'The principal argument of $-1 + i$ is:',
          options: ['$\\dfrac{\\pi}{4}$', '$\\dfrac{3\\pi}{4}$', '$-\\dfrac{\\pi}{4}$', '$\\dfrac{5\\pi}{4}$'],
          answer: 1,
          hint: 'The point is in the second quadrant \u2014 the calculator cannot know that.',
          solution: [
            '$-1+i$ sits at $(-1, 1)$, in the second quadrant.',
            'The reference angle is $\\alpha = \\tan^{-1}\\left|\\dfrac{1}{-1}\\right| = 45^\\circ$.',
            'In quadrant II the argument is $180^\\circ - 45^\\circ = 135^\\circ = \\dfrac{3\\pi}{4}$.',
            '$\\tan^{-1}(-1)$ alone would give $-45^\\circ$, which is the wrong point entirely.'
          ] },

        { id: 'm-02-02-q6', tier: 'M', kind: 'integer', parSec: 55, kcs: ['kc-m2-modprops'],
          stem: 'If $|z_1| = 3$ and $|z_2| = 4$, find $|z_1 z_2|$.',
          answer: 12,
          hint: 'Moduli multiply.',
          solution: [
            '$|z_1 z_2| = |z_1| \\cdot |z_2|$.',
            '$= 3 \\times 4 = 12$.',
            'Note this needs no information about the arguments at all.'
          ] },

        { id: 'm-02-02-q7', tier: 'H', kind: 'mcq', parSec: 110, kcs: ['kc-m2-polar', 'kc-m2-arg'],
          stem: 'The polar form of $-1 - i$ is:',
          options: [
            '$\\sqrt{2}\\left(\\cos\\dfrac{3\\pi}{4} + i\\sin\\dfrac{3\\pi}{4}\\right)$',
            '$\\sqrt{2}\\left(\\cos\\left(-\\dfrac{3\\pi}{4}\\right) + i\\sin\\left(-\\dfrac{3\\pi}{4}\\right)\\right)$',
            '$2\\left(\\cos\\dfrac{\\pi}{4} + i\\sin\\dfrac{\\pi}{4}\\right)$',
            '$\\sqrt{2}\\left(\\cos\\dfrac{\\pi}{4} + i\\sin\\dfrac{\\pi}{4}\\right)$'
          ],
          answer: 1,
          hint: 'Third quadrant \u2014 and the principal argument must lie in $(-\\pi, \\pi]$.',
          solution: [
            'Modulus: $\\sqrt{(-1)^2 + (-1)^2} = \\sqrt{2}$.',
            'The point $(-1, -1)$ is in the third quadrant, with reference angle $45^\\circ$.',
            'In quadrant III the principal argument is $\\alpha - 180^\\circ = 45^\\circ - 180^\\circ = -135^\\circ = -\\dfrac{3\\pi}{4}$.',
            'So $-1-i = \\sqrt{2}\\,\\text{cis}\\left(-\\dfrac{3\\pi}{4}\\right)$.'
          ] },

        { id: 'm-02-02-q8', tier: 'H', kind: 'mcq', parSec: 100, kcs: ['kc-m2-modprops'],
          stem: 'The equation $|z - 3| = 4$ represents:',
          options: [
            'a circle with centre $3$ and radius $4$',
            'a circle with centre $4$ and radius $3$',
            'a straight line',
            'an ellipse'
          ],
          answer: 0,
          hint: 'Read $|z - w|$ as "distance from $z$ to $w$".',
          solution: [
            '$|z - 3|$ is the distance from the point $z$ to the point $3 + 0i$.',
            'Setting that distance equal to 4 gives all points 4 units from $(3, 0)$.',
            'That is a **circle**, centre $(3, 0)$, radius 4.'
          ] },

        { id: 'm-02-02-q9', tier: 'H', kind: 'mcq', parSec: 110, kcs: ['kc-m2-polar'],
          stem: 'If $|z| = 1$ and $\\arg z = \\dfrac{\\pi}{3}$, then $z$ equals:',
          options: [
            '$\\dfrac{1}{2} + \\dfrac{\\sqrt{3}}{2}i$',
            '$\\dfrac{\\sqrt{3}}{2} + \\dfrac{1}{2}i$',
            '$1 + \\sqrt{3}i$',
            '$\\dfrac{1}{2} - \\dfrac{\\sqrt{3}}{2}i$'
          ],
          answer: 0,
          hint: 'Write it in polar form and evaluate.',
          solution: [
            '$z = r(\\cos\\theta + i\\sin\\theta) = 1\\left(\\cos 60^\\circ + i\\sin 60^\\circ\\right)$.',
            '$\\cos 60^\\circ = \\dfrac12$ and $\\sin 60^\\circ = \\dfrac{\\sqrt3}{2}$.',
            '$z = \\dfrac12 + \\dfrac{\\sqrt3}{2}i$.',
            'Swapping the two is the standard slip \u2014 check that the imaginary part is the **sine**.'
          ] }
      ]
    },

    /* ---------------------------------------------------------------
       3. De Moivre and roots of unity
       --------------------------------------------------------------- */
    {
      id: 'm-02-03',
      title: 'De Moivre\u2019s Theorem & Roots of Unity',
      short: 'Powers become multiplication of angles',
      kcs: ['kc-m2-demoivre', 'kc-m2-roots', 'kc-m2-omega'],
      prereq: ['m-02-02'],
      estMin: 30,
      weight: 1.6,
      widget: 'rootWheel',
      widgetTitle: 'Root Wheel',
      widgetBrief: 'Raise a complex number to any power in polar form, and watch the $n$ roots of any number arrange themselves into a polygon.',

      story: {
        speaker: 'CANTOR',
        avatar: '\u267e\ufe0f',
        lines: [
          'Module Three. You have already seen that multiplying multiplies moduli and adds arguments.',
          'Apply that to a number times itself, $n$ times over, and the result is immediate: the modulus is raised to the $n$, and the argument is multiplied by $n$.',
          'That single observation is De Moivre\u2019s theorem, and it turns "find the fifth roots of 32" from impossible into arithmetic.'
        ]
      },

      lesson: [
        { t: 'h', x: 'Multiplication in polar form' },

        { t: 'anim', id: 'polarRotation' },

        { t: 'formula', name: 'Product', tex: 'r_1\\,\\text{cis}\\,\\theta_1 \\cdot r_2\\,\\text{cis}\\,\\theta_2 = r_1 r_2\\,\\text{cis}(\\theta_1+\\theta_2)', star: true },
        { t: 'formula', name: 'De Moivre\u2019s theorem', tex: '(\\cos\\theta + i\\sin\\theta)^n = \\cos n\\theta + i\\sin n\\theta', star: true },
        { t: 'formula', name: 'With a modulus', tex: '(r\\,\\text{cis}\\,\\theta)^n = r^n\\,\\text{cis}\\,n\\theta', star: true },

        { t: 'h', x: 'Roots' },
        { t: 'formula', name: 'The n nth roots', tex: 'z^{1/n} = r^{1/n}\\,\\text{cis}\\!\\left(\\frac{\\theta + 2k\\pi}{n}\\right), \\quad k = 0, 1, \\ldots, n-1', star: true },
        { t: 'callout', kind: 'jee', title: 'Why there are exactly n of them',
          x: 'Adding $2\\pi$ to the argument leaves $z$ unchanged, but **divides differently** after the root is taken. Running $k$ from 0 to $n-1$ gives $n$ distinct answers; $k = n$ returns you to the first.\n\nThey all have the same modulus, and their arguments differ by $\\dfrac{2\\pi}{n}$ \u2014 so they are the vertices of a **regular $n$-gon** centred on the origin.' },

        { t: 'anim', id: 'rootsOfUnity' },

        { t: 'h', x: 'The cube roots of unity' },
        { t: 'formula', name: 'Omega', tex: '\\omega = -\\frac{1}{2} + \\frac{\\sqrt{3}}{2}i, \\qquad \\omega^2 = -\\frac{1}{2} - \\frac{\\sqrt{3}}{2}i', star: true },
        { t: 'ul', items: [
          '$\\omega^3 = 1$, so powers of $\\omega$ repeat every **three**: reduce the exponent mod 3.',
          '$1 + \\omega + \\omega^2 = 0$ \u2014 which makes $\\omega^2 = -1-\\omega$, useful for simplifying.',
          '$\\omega$ and $\\omega^2$ are conjugates of each other.',
          'More generally, the $n$ $n$th roots of unity always sum to **zero** for $n \\geq 2$.'
        ] },

        { t: 'worked', title: 'Worked example \u2014 a tenth power', tier: 'H',
          q: 'Evaluate $(1+i)^{10}$.',
          steps: [
            'Square first: $(1+i)^2 = 1 + 2i + i^2 = 2i$.',
            'So $(1+i)^{10} = \\left((1+i)^2\\right)^5 = (2i)^5$.',
            '$(2i)^5 = 32\\,i^5$.',
            '$i^5 = i^{4+1} = i$.'
          ],
          ans: '$32i$. Polar form would work too \u2014 $(1+i) = \\sqrt2\\,\\text{cis}\\,45^\\circ$, so the tenth power is $32\\,\\text{cis}\\,450^\\circ = 32\\,\\text{cis}\\,90^\\circ = 32i$ \u2014 but squaring is faster here.'
        },

        { t: 'sim' },

        { t: 'callout', kind: 'tip', title: 'Reduce the exponent, not the number', x: 'For $\\omega^{n}$ use $n \\bmod 3$; for $i^{n}$ use $n \\bmod 4$. Both come from the same idea: the number is a rotation, and rotations repeat.' }
      ],

      formulas: [
        { name: 'De Moivre', tex: '(\\cos\\theta+i\\sin\\theta)^n = \\cos n\\theta + i\\sin n\\theta', star: true },
        { name: 'Powers', tex: '(r\\,\\text{cis}\\,\\theta)^n = r^n\\,\\text{cis}\\,n\\theta', star: true },
        { name: 'nth roots', tex: 'r^{1/n}\\,\\text{cis}\\left(\\frac{\\theta+2k\\pi}{n}\\right)', star: true },
        { name: 'Cube roots of unity', tex: '1,\\ \\omega,\\ \\omega^2' },
        { name: 'Key identity', tex: '1 + \\omega + \\omega^2 = 0', star: true },
        { name: 'Period', tex: '\\omega^3 = 1' },
        { name: 'Sum of nth roots', tex: '0\\quad (n \\geq 2)' }
      ],

      questions: [
        { id: 'm-02-03-q1', tier: 'G', kind: 'mcq', parSec: 40, kcs: ['kc-m2-demoivre'],
          stem: 'De Moivre\u2019s theorem states that $(\\cos\\theta + i\\sin\\theta)^n$ equals:',
          options: [
            '$\\cos n\\theta + i\\sin n\\theta$',
            '$n\\cos\\theta + in\\sin\\theta$',
            '$\\cos^n\\theta + i\\sin^n\\theta$',
            '$\\cos\\dfrac{\\theta}{n} + i\\sin\\dfrac{\\theta}{n}$'
          ],
          answer: 0,
          hint: 'Powers multiply the **angle**.',
          solution: [
            'Raising to the $n$th power multiplies the argument by $n$.',
            '$(\\cos\\theta + i\\sin\\theta)^n = \\cos n\\theta + i\\sin n\\theta$.',
            'It follows directly from "arguments add on multiplication", applied $n$ times.'
          ] },

        { id: 'm-02-03-q2', tier: 'G', kind: 'integer', parSec: 35, kcs: ['kc-m2-omega'],
          stem: 'If $\\omega$ is a non-real cube root of unity, find $\\omega^3$.',
          answer: 1,
          hint: 'What does "cube root of unity" mean?',
          solution: [
            'A cube root of unity satisfies $\\omega^3 = 1$ by definition.',
            'This is why powers of $\\omega$ repeat with period 3.'
          ] },

        { id: 'm-02-03-q3', tier: 'G', kind: 'integer', parSec: 40, kcs: ['kc-m2-omega'],
          stem: 'If $\\omega$ is a non-real cube root of unity, find $1 + \\omega + \\omega^2$.',
          answer: 0,
          hint: 'The three cube roots are evenly spaced about the origin.',
          solution: [
            'The three cube roots of unity are the vertices of an equilateral triangle centred on the origin.',
            'Added head to tail as vectors they close, so the sum is $0$.',
            'Algebraically: $\\omega$ satisfies $\\omega^2 + \\omega + 1 = 0$, which is the same statement.'
          ] },

        { id: 'm-02-03-q4', tier: 'M', kind: 'mcq', parSec: 75, kcs: ['kc-m2-demoivre'],
          stem: '$(\\cos 30^\\circ + i\\sin 30^\\circ)^6$ equals:',
          options: ['$1$', '$-1$', '$i$', '$-i$'],
          answer: 1,
          hint: 'Multiply the angle by 6.',
          solution: [
            'By De Moivre: $\\cos(6 \\times 30^\\circ) + i\\sin(6 \\times 30^\\circ)$.',
            '$= \\cos 180^\\circ + i \\sin 180^\\circ$.',
            '$= -1 + 0i = -1$.'
          ] },

        { id: 'm-02-03-q5', tier: 'M', kind: 'integer', parSec: 50, kcs: ['kc-m2-roots'],
          stem: 'How many distinct 7th roots of unity are there?',
          answer: 7,
          hint: 'How many values of $k$ give distinct answers?',
          solution: [
            'The $n$th roots come from $k = 0, 1, \\ldots, n-1$ \u2014 that is $n$ values.',
            'So there are exactly **7** distinct 7th roots of unity.',
            'They sit on the unit circle at the corners of a regular heptagon.'
          ] },

        { id: 'm-02-03-q6', tier: 'M', kind: 'mcq', parSec: 65, kcs: ['kc-m2-omega'],
          stem: 'If $\\omega$ is a non-real cube root of unity, then $\\omega^4$ equals:',
          options: ['$1$', '$\\omega$', '$\\omega^2$', '$0$'],
          answer: 1,
          hint: 'Reduce the exponent modulo 3.',
          solution: [
            '$\\omega^3 = 1$, so $\\omega^4 = \\omega^3 \\cdot \\omega = 1 \\cdot \\omega$.',
            '$= \\omega$.',
            'In general $\\omega^n = \\omega^{n \\bmod 3}$.'
          ] },

        { id: 'm-02-03-q7', tier: 'H', kind: 'mcq', parSec: 120, kcs: ['kc-m2-demoivre'],
          stem: '$(1+i)^{10}$ equals:',
          options: ['$32i$', '$-32i$', '$32$', '$-32$'],
          answer: 0,
          hint: 'Square $(1+i)$ first.',
          solution: [
            '$(1+i)^2 = 2i$.',
            '$(1+i)^{10} = \\left((1+i)^2\\right)^5 = (2i)^5 = 32\\,i^5$.',
            '$i^5 = i$, so the answer is $32i$.'
          ] },

        { id: 'm-02-03-q8', tier: 'H', kind: 'integer', parSec: 110, kcs: ['kc-m2-omega'],
          stem: 'If $\\omega$ is a non-real cube root of unity, find $1 + \\omega^2 + \\omega^4$.',
          answer: 0,
          hint: 'Reduce $\\omega^4$ first.',
          solution: [
            '$\\omega^4 = \\omega^3 \\cdot \\omega = \\omega$.',
            'So the expression is $1 + \\omega^2 + \\omega$.',
            'Rearranged, that is $1 + \\omega + \\omega^2 = 0$.',
            'Reducing the exponent before doing anything else is almost always the first move.'
          ] },

        { id: 'm-02-03-q9', tier: 'H', kind: 'mcq', parSec: 110, kcs: ['kc-m2-roots'],
          stem: 'The sum of all the $n$th roots of unity, for $n \\geq 2$, is:',
          options: ['$0$', '$1$', '$n$', '$-1$'],
          answer: 0,
          hint: 'Think of them as vectors to the corners of a regular polygon.',
          solution: [
            'The $n$ roots are evenly spaced around the unit circle \u2014 the vertices of a regular $n$-gon centred on the origin.',
            'By symmetry, the vectors to those vertices cancel exactly.',
            'So the sum is $0$ for every $n \\geq 2$. (For $n = 1$ the single root is 1.)',
            'Algebraically it is the sum of a geometric series: $\\dfrac{z^n - 1}{z - 1} = 0$ at each root except $z = 1$.'
          ] }
      ]
    },

    /* ---------------------------------------------------------------
       4. Quadratic equations and the discriminant
       --------------------------------------------------------------- */
    {
      id: 'm-02-04',
      title: 'Quadratic Equations & the Discriminant',
      short: 'One number decides everything',
      kcs: ['kc-m2-quadratic', 'kc-m2-discriminant', 'kc-m2-complexroots'],
      prereq: ['m-02-01'],
      estMin: 28,
      weight: 1.8,
      widget: 'discriminantLab',
      widgetTitle: 'Discriminant Lab',
      widgetBrief: 'Drag $a$, $b$ and $c$ and watch the parabola, the discriminant and the roots move together \u2014 including when the roots leave the real line.',

      story: {
        speaker: 'CANTOR',
        avatar: '\u267e\ufe0f',
        lines: [
          'Module Four. Now we return to the equation that started the trouble.',
          'The quadratic formula has one term under a square root. Everything about the roots \u2014 how many, what kind, how far apart \u2014 is decided by the sign of what is under it.',
          'That quantity has a name, and once you see it as the height of the parabola relative to the axis, the three cases stop being three cases.'
        ]
      },

      lesson: [
        { t: 'h', x: 'The formula and the discriminant' },
        { t: 'formula', name: 'Quadratic formula', tex: 'x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}', star: true },
        { t: 'formula', name: 'Discriminant', tex: 'D = b^2 - 4ac', star: true },

        { t: 'anim', id: 'discriminantParabola' },

        { t: 'table',
          head: ['$D$', 'Roots', 'The parabola'],
          rows: [
            ['$D > 0$', 'two real, distinct', 'cuts the axis twice'],
            ['$D = 0$', 'one repeated real root', 'touches the axis'],
            ['$D < 0$', 'a pair of complex conjugates', 'never meets the axis'],
            ['$D > 0$, a perfect square', 'two **rational** roots', 'cuts at rational points']
          ]
        },
        { t: 'callout', kind: 'jee', title: 'The perfect-square refinement',
          x: 'When $a$, $b$, $c$ are rational and $D > 0$:\n\n\u00b7 $D$ a perfect square \u2192 both roots **rational**\n\u00b7 $D$ not a perfect square \u2192 both roots **irrational**, and they occur as a conjugate surd pair $p \\pm \\sqrt{q}$.\n\nExam questions frequently ask for "rational roots", which is a question about $D$ being a perfect square, not about $D > 0$.' },

        { t: 'h', x: 'Complex roots arrive in pairs' },
        { t: 'callout', kind: 'tip', title: 'A fact you can use without proving it',
          x: 'If a polynomial has **real** coefficients and $p + qi$ is a root, then $p - qi$ is also a root.\n\nThe reason is visible in the formula: the only thing distinguishing the two roots is the $\\pm$ in front of $\\sqrt{D}$, and when $D < 0$ that becomes $\\pm i\\sqrt{|D|}$.\n\nSo you are never given one complex root \u2014 you are given both, and only told about one.' },

        { t: 'worked', title: 'Worked example \u2014 reconstructing an equation', tier: 'H',
          q: 'One root of $x^2 + bx + c = 0$, with $b$ and $c$ real, is $2 + 3i$. Find $b$ and $c$.',
          steps: [
            'Real coefficients, so the other root must be the conjugate $2 - 3i$.',
            'Sum of roots $= (2+3i) + (2-3i) = 4$. And the sum is $-b/1 = -b$.',
            'So $b = -4$.',
            'Product $= (2+3i)(2-3i) = 4 + 9 = 13$. And the product is $c/1 = c$.'
          ],
          ans: '$b = -4$, $c = 13$; the equation is $x^2 - 4x + 13 = 0$. Check: $D = 16 - 52 = -36 < 0$. \u2713'
        },

        { t: 'sim' },

        { t: 'callout', kind: 'warn', title: 'Check that it is a quadratic at all', x: 'In $kx^2 + 2x + 1 = 0$, the case $k = 0$ gives a **linear** equation with one root. If a question says "quadratic", $a \\neq 0$ is a condition you must impose alongside the condition on $D$.' }
      ],

      formulas: [
        { name: 'Quadratic formula', tex: 'x = \\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}', star: true },
        { name: 'Discriminant', tex: 'D = b^2-4ac', star: true },
        { name: 'Equal roots', tex: 'D = 0', star: true },
        { name: 'Real and distinct', tex: 'D > 0' },
        { name: 'Complex conjugates', tex: 'D < 0' },
        { name: 'Gap between roots', tex: '|\\alpha-\\beta| = \\frac{\\sqrt{D}}{|a|}' },
        { name: 'Vertex', tex: 'x = -\\frac{b}{2a}' }
      ],

      questions: [
        { id: 'm-02-04-q1', tier: 'G', kind: 'mcq', parSec: 45, kcs: ['kc-m2-quadratic'],
          stem: 'The roots of $x^2 - 5x + 6 = 0$ are:',
          options: ['$2, 3$', '$-2, -3$', '$1, 6$', '$-1, -6$'],
          answer: 0,
          hint: 'Which two numbers multiply to 6 and add to 5?',
          solution: [
            'Factorise: $x^2 - 5x + 6 = (x-2)(x-3)$.',
            'So the roots are $x = 2$ and $x = 3$.',
            'Check: $2 + 3 = 5$ \u2713 and $2 \\times 3 = 6$ \u2713.'
          ] },

        { id: 'm-02-04-q2', tier: 'G', kind: 'integer', parSec: 40, kcs: ['kc-m2-discriminant'],
          stem: 'Find the discriminant of $x^2 + 2x + 1 = 0$.',
          answer: 0,
          hint: '$D = b^2 - 4ac$.',
          solution: [
            '$a = 1$, $b = 2$, $c = 1$.',
            '$D = 2^2 - 4(1)(1) = 4 - 4 = 0$.',
            '$D = 0$ means one repeated root, here $x = -1$ \u2014 the parabola touches the axis.'
          ] },

        { id: 'm-02-04-q3', tier: 'G', kind: 'mcq', parSec: 40, kcs: ['kc-m2-complexroots'],
          stem: 'If $D < 0$ for a quadratic with real coefficients, its roots are:',
          options: [
            'two real and distinct',
            'one repeated real root',
            'a pair of complex conjugates',
            'undefined'
          ],
          answer: 2,
          hint: 'What is under the square root?',
          solution: [
            '$D < 0$ makes $\\sqrt{D}$ imaginary.',
            'The formula then gives $x = \\dfrac{-b \\pm i\\sqrt{|D|}}{2a}$ \u2014 two numbers differing only in the sign of their imaginary part.',
            'They are **complex conjugates**. The roots have not vanished; they have left the real line.'
          ] },

        { id: 'm-02-04-q4', tier: 'M', kind: 'integer', parSec: 60, kcs: ['kc-m2-discriminant'],
          stem: 'For what value of $k$ does $x^2 - 4x + k = 0$ have equal roots?',
          answer: 4,
          hint: 'Equal roots means $D = 0$.',
          solution: [
            '$D = (-4)^2 - 4(1)(k) = 16 - 4k$.',
            'Equal roots requires $D = 0$, so $16 - 4k = 0$.',
            '$k = 4$. The equation becomes $(x-2)^2 = 0$.'
          ] },

        { id: 'm-02-04-q5', tier: 'M', kind: 'integer', parSec: 55, kcs: ['kc-m2-discriminant'],
          stem: 'Find the discriminant of $2x^2 - 3x + 5 = 0$.',
          answer: -31,
          hint: 'Careful with the sign of $b$.',
          solution: [
            '$a = 2$, $b = -3$, $c = 5$.',
            '$D = (-3)^2 - 4(2)(5) = 9 - 40$.',
            '$D = -31$, which is negative \u2014 so the roots are complex conjugates.'
          ] },

        { id: 'm-02-04-q6', tier: 'M', kind: 'mcq', parSec: 55, kcs: ['kc-m2-complexroots'],
          stem: 'The roots of $x^2 + 4 = 0$ are:',
          options: ['$\\pm 2$', '$\\pm 2i$', '$\\pm 4i$', '$\\pm 4$'],
          answer: 1,
          hint: '$x^2 = -4$.',
          solution: [
            'Rearranging, $x^2 = -4$.',
            '$x = \\pm\\sqrt{-4} = \\pm\\sqrt{4}\\sqrt{-1} = \\pm 2i$.',
            'Check: $(2i)^2 = 4i^2 = -4$ \u2713.'
          ] },

        { id: 'm-02-04-q7', tier: 'H', kind: 'mcq', parSec: 110, kcs: ['kc-m2-discriminant'],
          stem: 'The equation $kx^2 + 2x + 1 = 0$ has real roots when:',
          options: ['$k \\leq 1$', '$k \\geq 1$', '$k < 0$', '$k \\geq -1$'],
          answer: 0,
          hint: 'Real roots means $D \\geq 0$.',
          solution: [
            '$D = 2^2 - 4(k)(1) = 4 - 4k$.',
            'Real roots need $D \\geq 0$: $4 - 4k \\geq 0$, so $k \\leq 1$.',
            'Note $k = 0$ gives the linear equation $2x + 1 = 0$, which still has a real root \u2014 so $k \\leq 1$ is correct as stated.',
            'Had the question said "**quadratic** with real roots", you would also need $k \\neq 0$.'
          ] },

        { id: 'm-02-04-q8', tier: 'H', kind: 'integer', parSec: 130, kcs: ['kc-m2-complexroots', 'kc-m2-vieta'],
          stem: 'One root of $x^2 + bx + c = 0$ (with $b$, $c$ real) is $2 + 3i$. Find $b + c$.',
          answer: 9,
          hint: 'Real coefficients force the other root.',
          solution: [
            'Real coefficients, so the other root is the conjugate $2 - 3i$.',
            'Sum of roots $= 4$, and sum $= -b$, so $b = -4$.',
            'Product $= (2+3i)(2-3i) = 4 + 9 = 13$, and product $= c$, so $c = 13$.',
            '$b + c = -4 + 13 = 9$.'
          ] },

        { id: 'm-02-04-q9', tier: 'H', kind: 'mcq', parSec: 110, kcs: ['kc-m2-complexroots'],
          stem: 'The roots of $x^2 - 2x + 5 = 0$ are:',
          options: ['$1 \\pm 2i$', '$2 \\pm i$', '$-1 \\pm 2i$', '$1 \\pm 4i$'],
          answer: 0,
          hint: 'Use the formula; $D$ is negative.',
          solution: [
            '$D = (-2)^2 - 4(1)(5) = 4 - 20 = -16$.',
            '$x = \\dfrac{2 \\pm \\sqrt{-16}}{2} = \\dfrac{2 \\pm 4i}{2}$.',
            '$= 1 \\pm 2i$.',
            'Check with Vieta: sum $= 2$ \u2713, product $= 1 + 4 = 5$ \u2713.'
          ] }
      ]
    },

    /* ---------------------------------------------------------------
       5. Relations between roots and coefficients
       --------------------------------------------------------------- */
    {
      id: 'm-02-05',
      title: 'Relations Between Roots & Coefficients',
      short: 'Answer without ever finding the roots',
      kcs: ['kc-m2-vieta', 'kc-m2-symmetric', 'kc-m2-forming'],
      prereq: ['m-02-04'],
      estMin: 28,
      weight: 1.8,
      widget: 'rootForge',
      widgetTitle: 'Root Forge',
      widgetBrief: 'Build an equation from its roots, transform the roots, and see the coefficients move to match.',

      story: {
        speaker: 'CANTOR',
        avatar: '\u267e\ufe0f',
        lines: [
          'Module Five. A confession: most quadratic questions do not want the roots.',
          'They want $\\alpha^2 + \\beta^2$, or $\\dfrac1\\alpha + \\dfrac1\\beta$, or a new equation with shifted roots. Solving for $\\alpha$ and $\\beta$ first is usually the slow path.',
          'Two relations \u2014 the sum and the product \u2014 are enough to answer almost all of them without solving anything.'
        ]
      },

      lesson: [
        { t: 'h', x: 'Vieta\u2019s relations' },

        { t: 'anim', id: 'sumProductRoots' },

        { t: 'formula', name: 'Sum of roots', tex: '\\alpha + \\beta = -\\frac{b}{a}', star: true },
        { t: 'formula', name: 'Product of roots', tex: '\\alpha\\beta = \\frac{c}{a}', star: true },

        { t: 'h', x: 'Symmetric expressions' },
        { t: 'p', x: 'Anything symmetric in $\\alpha$ and $\\beta$ can be written using only their sum $S$ and product $P$. These four cover most of what is asked:' },
        { t: 'table',
          head: ['Expression', 'In terms of $S$ and $P$', 'For $x^2-5x+6$'],
          rows: [
            ['$\\alpha^2 + \\beta^2$', '$S^2 - 2P$', '$25 - 12 = 13$'],
            ['$\\dfrac1\\alpha + \\dfrac1\\beta$', '$\\dfrac{S}{P}$', '$\\dfrac{5}{6}$'],
            ['$(\\alpha-\\beta)^2$', '$S^2 - 4P = \\dfrac{D}{a^2}$', '$25 - 24 = 1$'],
            ['$\\alpha^3 + \\beta^3$', '$S^3 - 3PS$', '$125 - 90 = 35$']
          ]
        },
        { t: 'callout', kind: 'tip', title: 'Only two identities to hold', x: '$\\alpha^2+\\beta^2 = S^2 - 2P$ and $\\alpha^3+\\beta^3 = S^3 - 3PS$. Everything else in that table is one of them rearranged, or a fraction combined over a common denominator.' },

        { t: 'h', x: 'Building an equation from its roots' },
        { t: 'formula', name: 'The construction', tex: 'x^2 - (\\alpha+\\beta)x + \\alpha\\beta = 0', star: true,
          note: 'Or in words: $x^2 - (\\text{sum})x + (\\text{product}) = 0$. Mind the minus sign.' },

        { t: 'worked', title: 'Worked example \u2014 transforming the roots', tier: 'H',
          q: 'If $\\alpha$ and $\\beta$ are the roots of $x^2 - 5x + 6 = 0$, form the equation whose roots are $\\alpha + 2$ and $\\beta + 2$.',
          steps: [
            'From the original: $S = 5$, $P = 6$.',
            'New sum: $(\\alpha+2) + (\\beta+2) = S + 4 = 9$.',
            'New product: $(\\alpha+2)(\\beta+2) = \\alpha\\beta + 2(\\alpha+\\beta) + 4 = 6 + 10 + 4 = 20$.',
            'Build it: $x^2 - 9x + 20 = 0$.'
          ],
          ans: '$x^2 - 9x + 20 = 0$. Sanity check: the original roots are 2 and 3, so the new ones are 4 and 5 \u2014 and $(x-4)(x-5) = x^2 - 9x + 20$. \u2713'
        },

        { t: 'sim' },

        { t: 'callout', kind: 'trap', title: 'Do not drop the a', x: 'The sum is $-b/a$, not $-b$. In $2x^2 - 6x + 4 = 0$ the sum is $6/2 = 3$, not 6. Dividing through by $a$ first is the safest habit.' }
      ],

      formulas: [
        { name: 'Sum', tex: '\\alpha+\\beta = -b/a', star: true },
        { name: 'Product', tex: '\\alpha\\beta = c/a', star: true },
        { name: 'Squares', tex: '\\alpha^2+\\beta^2 = S^2-2P', star: true },
        { name: 'Cubes', tex: '\\alpha^3+\\beta^3 = S^3-3PS', star: true },
        { name: 'Difference', tex: '(\\alpha-\\beta)^2 = S^2-4P = D/a^2' },
        { name: 'Reciprocals', tex: '1/\\alpha + 1/\\beta = S/P' },
        { name: 'Forming', tex: 'x^2 - Sx + P = 0', star: true }
      ],

      questions: [
        { id: 'm-02-05-q1', tier: 'G', kind: 'integer', parSec: 45, kcs: ['kc-m2-vieta'],
          stem: 'Find the sum of the roots of $2x^2 - 6x + 4 = 0$.',
          answer: 3,
          hint: 'Sum $= -b/a$, and $a$ is not 1 here.',
          solution: [
            '$a = 2$, $b = -6$.',
            'Sum $= -\\dfrac{b}{a} = -\\dfrac{-6}{2} = 3$.',
            'Check: the equation is $2(x-1)(x-2) = 0$, roots 1 and 2, sum 3 \u2713.'
          ] },

        { id: 'm-02-05-q2', tier: 'G', kind: 'integer', parSec: 40, kcs: ['kc-m2-vieta'],
          stem: 'Find the product of the roots of $x^2 - 7x + 10 = 0$.',
          answer: 10,
          hint: 'Product $= c/a$.',
          solution: [
            '$a = 1$, $c = 10$.',
            'Product $= \\dfrac{c}{a} = 10$.',
            'Check: the roots are 2 and 5, and $2 \\times 5 = 10$ \u2713.'
          ] },

        { id: 'm-02-05-q3', tier: 'G', kind: 'mcq', parSec: 50, kcs: ['kc-m2-forming'],
          stem: 'The quadratic equation whose roots are $3$ and $5$ is:',
          options: [
            '$x^2 - 8x + 15 = 0$',
            '$x^2 + 8x + 15 = 0$',
            '$x^2 - 15x + 8 = 0$',
            '$x^2 - 2x + 15 = 0$'
          ],
          answer: 0,
          hint: '$x^2 - (\\text{sum})x + (\\text{product}) = 0$.',
          solution: [
            'Sum $= 3 + 5 = 8$; product $= 3 \\times 5 = 15$.',
            'The equation is $x^2 - 8x + 15 = 0$.',
            'The sign of the middle term is **minus** the sum \u2014 that is the usual slip.'
          ] },

        { id: 'm-02-05-q4', tier: 'M', kind: 'integer', parSec: 70, kcs: ['kc-m2-symmetric'],
          stem: 'If $\\alpha$ and $\\beta$ are the roots of $x^2 - 5x + 6 = 0$, find $\\alpha^2 + \\beta^2$.',
          answer: 13,
          hint: 'Use $S^2 - 2P$; do not find the roots.',
          solution: [
            '$S = 5$, $P = 6$.',
            '$\\alpha^2 + \\beta^2 = S^2 - 2P = 25 - 12$.',
            '$= 13$. (Check with the actual roots: $4 + 9 = 13$ \u2713.)'
          ] },

        { id: 'm-02-05-q5', tier: 'M', kind: 'mcq', parSec: 65, kcs: ['kc-m2-symmetric'],
          stem: 'If $\\alpha, \\beta$ are the roots of $x^2 - 5x + 6 = 0$, then $\\dfrac{1}{\\alpha} + \\dfrac{1}{\\beta}$ equals:',
          options: ['$\\dfrac{5}{6}$', '$\\dfrac{6}{5}$', '$\\dfrac{1}{6}$', '$5$'],
          answer: 0,
          hint: 'Combine over a common denominator.',
          solution: [
            '$\\dfrac1\\alpha + \\dfrac1\\beta = \\dfrac{\\beta + \\alpha}{\\alpha\\beta} = \\dfrac{S}{P}$.',
            '$= \\dfrac{5}{6}$.'
          ] },

        { id: 'm-02-05-q6', tier: 'M', kind: 'mcq', parSec: 85, kcs: ['kc-m2-forming'],
          stem: 'The equation whose roots are the **reciprocals** of the roots of $x^2 - 5x + 6 = 0$ is:',
          options: [
            '$6x^2 - 5x + 1 = 0$',
            '$x^2 - 6x + 5 = 0$',
            '$6x^2 + 5x + 1 = 0$',
            '$x^2 + 5x + 6 = 0$'
          ],
          answer: 0,
          hint: 'New sum is $S/P$; new product is $1/P$.',
          solution: [
            'New sum: $\\dfrac1\\alpha + \\dfrac1\\beta = \\dfrac{S}{P} = \\dfrac{5}{6}$.',
            'New product: $\\dfrac{1}{\\alpha\\beta} = \\dfrac16$.',
            'So $x^2 - \\dfrac56 x + \\dfrac16 = 0$; multiply by 6 to get $6x^2 - 5x + 1 = 0$.',
            'Shortcut: for reciprocal roots, simply **reverse the coefficients**.'
          ] },

        { id: 'm-02-05-q7', tier: 'H', kind: 'integer', parSec: 110, kcs: ['kc-m2-symmetric'],
          stem: 'If $\\alpha, \\beta$ are the roots of $2x^2 - 8x + 6 = 0$, find $(\\alpha - \\beta)^2$.',
          answer: 4,
          hint: '$(\\alpha-\\beta)^2 = S^2 - 4P$.',
          solution: [
            '$S = \\dfrac{8}{2} = 4$ and $P = \\dfrac{6}{2} = 3$.',
            '$(\\alpha - \\beta)^2 = S^2 - 4P = 16 - 12 = 4$.',
            'So the roots differ by 2 \u2014 and indeed they are 1 and 3.',
            'Equivalently $(\\alpha-\\beta)^2 = D/a^2 = 16/4 = 4$ \u2713.'
          ] },

        { id: 'm-02-05-q8', tier: 'H', kind: 'integer', parSec: 110, kcs: ['kc-m2-symmetric'],
          stem: 'If $\\alpha, \\beta$ are the roots of $x^2 - 5x + 6 = 0$, find $\\alpha^3 + \\beta^3$.',
          answer: 35,
          hint: '$\\alpha^3 + \\beta^3 = S^3 - 3PS$.',
          solution: [
            '$S = 5$, $P = 6$.',
            '$\\alpha^3 + \\beta^3 = S^3 - 3PS = 125 - 3(6)(5)$.',
            '$= 125 - 90 = 35$.',
            'Check: roots are 2 and 3, and $8 + 27 = 35$ \u2713.'
          ] },

        { id: 'm-02-05-q9', tier: 'H', kind: 'mcq', parSec: 120, kcs: ['kc-m2-forming'],
          stem: 'If $\\alpha, \\beta$ are the roots of $x^2 - 5x + 6 = 0$, the equation whose roots are $\\alpha + 2$ and $\\beta + 2$ is:',
          options: [
            '$x^2 - 9x + 20 = 0$',
            '$x^2 - 7x + 12 = 0$',
            '$x^2 - 9x + 10 = 0$',
            '$x^2 - 5x + 8 = 0$'
          ],
          answer: 0,
          hint: 'Work out the new sum and the new product.',
          solution: [
            'New sum: $(\\alpha+2)+(\\beta+2) = S + 4 = 9$.',
            'New product: $\\alpha\\beta + 2(\\alpha+\\beta) + 4 = 6 + 10 + 4 = 20$.',
            'So the equation is $x^2 - 9x + 20 = 0$.',
            'Check: the roots 2 and 3 shift to 4 and 5, and $(x-4)(x-5) = x^2-9x+20$ \u2713.'
          ] }
      ]
    },

    /* ---------------------------------------------------------------
       6. Nature of roots, common roots and inequalities
       --------------------------------------------------------------- */
    {
      id: 'm-02-06',
      title: 'Sign Conditions, Common Roots & Inequalities',
      short: 'Where the quadratic is positive, and where it is not',
      kcs: ['kc-m2-nature', 'kc-m2-common', 'kc-m2-inequality'],
      prereq: ['m-02-05'],
      estMin: 30,
      weight: 1.7,
      widget: 'signChart',
      widgetTitle: 'Sign Chart',
      widgetBrief: 'Build the sign chart for any factorised expression and read the solution set straight off the line.',

      story: {
        speaker: 'CANTOR',
        avatar: '\u267e\ufe0f',
        lines: [
          'Final module. A quadratic is not only an equation to be solved \u2014 it is an expression with a sign, and the sign changes only at its roots.',
          'That one observation answers every inequality in this chapter, and most of the ones you will meet later in calculus.',
          'It also answers the questions that ask where the roots **are** rather than what they are: both positive, both in an interval, opposite signs.'
        ]
      },

      lesson: [
        { t: 'h', x: 'Sign conditions on the roots' },
        { t: 'p', x: 'Everything here is read off $S = \\alpha+\\beta$, $P = \\alpha\\beta$ and $D$ \u2014 no solving required.' },
        { t: 'table',
          head: ['Condition on the roots', 'Requirements'],
          rows: [
            ['Both real', '$D \\geq 0$'],
            ['Both positive', '$D \\geq 0$, $S > 0$, $P > 0$'],
            ['Both negative', '$D \\geq 0$, $S < 0$, $P > 0$'],
            ['Opposite signs', '$P < 0$ (then $D > 0$ automatically)'],
            ['Reciprocal of each other', '$P = 1$'],
            ['Equal in magnitude, opposite sign', '$S = 0$']
          ]
        },
        { t: 'callout', kind: 'tip', title: 'Why "opposite signs" needs nothing else', x: 'If $P = \\dfrac{c}{a} < 0$ then $ac < 0$, so $-4ac > 0$ and $D = b^2 - 4ac$ is a sum of two non-negatives with at least one positive. $D > 0$ comes free.' },

        { t: 'h', x: 'Always positive, always negative' },
        { t: 'formula', name: 'Positive for every real x', tex: 'a > 0 \\ \\text{and}\\ D < 0', star: true },
        { t: 'formula', name: 'Negative for every real x', tex: 'a < 0 \\ \\text{and}\\ D < 0', star: true },
        { t: 'p', x: 'The parabola opens the right way **and** never crosses the axis. Both conditions are needed; either alone is not enough.' },

        { t: 'h', x: 'The sign chart' },
        { t: 'ol', items: [
          'Factorise fully and mark every root on a number line.',
          'The expression can change sign **only** at those points.',
          'Test one convenient value to the far right \u2014 for a product of linear factors with positive leading coefficients, it is positive there.',
          'Alternate the signs as you step left, **except** across a repeated root of even multiplicity, where the sign does not change.',
          'Read off the intervals, minding whether the inequality is strict.'
        ] },

        { t: 'worked', title: 'Worked example \u2014 a cubic sign chart', tier: 'M',
          q: 'Solve $(x-1)(x-2)(x-3) < 0$.',
          steps: [
            'Roots at $x = 1, 2, 3$ split the line into four intervals.',
            'For $x > 3$ all three factors are positive, so the product is **positive**.',
            'Stepping left past each simple root flips the sign: $+ , - , + , -$ from right to left.',
            'So the product is negative on $(2, 3)$ and on $(-\\infty, 1)$.'
          ],
          ans: '$x < 1$ or $2 < x < 3$. Strict inequality, so the roots themselves are excluded.'
        },

        { t: 'h', x: 'Common roots' },
        { t: 'ul', items: [
          'To test for **one** common root, solve the two equations and compare \u2014 or subtract one from the other to eliminate $x^2$ and get a linear equation.',
          'If **both** roots are common, the two equations are proportional: $\\dfrac{a_1}{a_2} = \\dfrac{b_1}{b_2} = \\dfrac{c_1}{c_2}$.'
        ] },

        { t: 'sim' },

        { t: 'callout', kind: 'trap', title: 'Never multiply an inequality by something whose sign you do not know', x: 'From $\\dfrac{1}{x} > 2$ you may not simply write $1 > 2x$ \u2014 that assumes $x > 0$. Move everything to one side, combine into a single fraction, and use a sign chart on the numerator and denominator together.' }
      ],

      formulas: [
        { name: 'Both positive', tex: 'D \\geq 0,\\ S > 0,\\ P > 0', star: true },
        { name: 'Both negative', tex: 'D \\geq 0,\\ S < 0,\\ P > 0' },
        { name: 'Opposite signs', tex: 'P < 0', star: true },
        { name: 'Always positive', tex: 'a > 0,\\ D < 0', star: true },
        { name: 'Always negative', tex: 'a < 0,\\ D < 0' },
        { name: 'Both roots common', tex: '\\frac{a_1}{a_2} = \\frac{b_1}{b_2} = \\frac{c_1}{c_2}' }
      ],

      questions: [
        { id: 'm-02-06-q1', tier: 'G', kind: 'mcq', parSec: 55, kcs: ['kc-m2-inequality'],
          stem: 'The solution of $x^2 - 5x + 6 > 0$ is:',
          options: [
            '$x < 2$ or $x > 3$',
            '$2 < x < 3$',
            '$x > 3$ only',
            'all real $x$'
          ],
          answer: 0,
          hint: 'The parabola opens upward, so it is positive outside its roots.',
          solution: [
            'Factorise: $(x-2)(x-3) > 0$, with roots 2 and 3.',
            'The parabola opens upward ($a = 1 > 0$), so it lies **above** the axis outside the roots.',
            'Solution: $x < 2$ or $x > 3$.',
            'Between the roots the expression is negative \u2014 that is where the curve dips below the axis.'
          ] },

        { id: 'm-02-06-q2', tier: 'G', kind: 'mcq', parSec: 50, kcs: ['kc-m2-nature'],
          stem: 'For $ax^2 + bx + c > 0$ to hold for **every** real $x$, we need:',
          options: [
            '$a > 0$ and $D < 0$',
            '$a > 0$ and $D > 0$',
            '$a < 0$ and $D < 0$',
            '$D = 0$ only'
          ],
          answer: 0,
          hint: 'Which way does the parabola open, and does it ever cross the axis?',
          solution: [
            '$a > 0$ makes the parabola open upward.',
            '$D < 0$ means it never meets the $x$-axis.',
            'Together: the whole curve sits above the axis, so the expression is positive everywhere.',
            'Either condition alone is not enough \u2014 an upward parabola with $D > 0$ dips below the axis between its roots.'
          ] },

        { id: 'm-02-06-q3', tier: 'G', kind: 'mcq', parSec: 45, kcs: ['kc-m2-inequality'],
          stem: 'The solution of $x^2 - 9 \\leq 0$ is:',
          options: [
            '$-3 \\leq x \\leq 3$',
            '$x \\leq -3$ or $x \\geq 3$',
            '$x \\leq 3$',
            '$-9 \\leq x \\leq 9$'
          ],
          answer: 0,
          hint: 'Factorise as a difference of squares.',
          solution: [
            '$(x-3)(x+3) \\leq 0$, with roots $-3$ and $3$.',
            'An upward parabola is **below or on** the axis between its roots.',
            'So $-3 \\leq x \\leq 3$, endpoints included because the inequality is not strict.'
          ] },

        { id: 'm-02-06-q4', tier: 'M', kind: 'mcq', parSec: 90, kcs: ['kc-m2-inequality'],
          stem: 'The solution of $(x-1)(x-2)(x-3) < 0$ is:',
          options: [
            '$x < 1$ or $2 < x < 3$',
            '$1 < x < 2$ or $x > 3$',
            '$x < 1$ only',
            '$1 < x < 3$'
          ],
          answer: 0,
          hint: 'Build the sign chart from the right.',
          solution: [
            'Roots at 1, 2, 3 split the line into four intervals.',
            'For $x > 3$ every factor is positive, so the product is positive.',
            'Each simple root flips the sign as you move left: $+$ on $(3,\\infty)$, $-$ on $(2,3)$, $+$ on $(1,2)$, $-$ on $(-\\infty,1)$.',
            'The product is negative on $(-\\infty, 1)$ and $(2, 3)$.'
          ] },

        { id: 'm-02-06-q5', tier: 'M', kind: 'mcq', parSec: 65, kcs: ['kc-m2-nature'],
          stem: 'The expression $x^2 + x + 1$ is:',
          options: [
            'positive for every real $x$',
            'negative for every real $x$',
            'zero at $x = 1$',
            'positive only for $x > 0$'
          ],
          answer: 0,
          hint: 'Check $a$ and $D$.',
          solution: [
            '$a = 1 > 0$, so the parabola opens upward.',
            '$D = 1 - 4 = -3 < 0$, so it never touches the axis.',
            'The whole curve lies above the axis: positive for every real $x$.',
            'Its minimum value is $\\dfrac34$, at $x = -\\dfrac12$.'
          ] },

        { id: 'm-02-06-q6', tier: 'M', kind: 'mcq', parSec: 75, kcs: ['kc-m2-nature'],
          stem: 'For both roots of $ax^2+bx+c = 0$ (real coefficients, $a \\neq 0$) to be **positive**, we need:',
          options: [
            '$D \\geq 0$, $S > 0$ and $P > 0$',
            '$D \\geq 0$ and $P > 0$ only',
            '$S > 0$ only',
            '$D < 0$ and $P > 0$'
          ],
          answer: 0,
          hint: 'All three conditions are needed. Which one rules out "both negative"?',
          solution: [
            '$D \\geq 0$ makes the roots real in the first place.',
            '$P > 0$ makes them **the same sign**.',
            '$S > 0$ then forces that shared sign to be positive.',
            'Drop $S > 0$ and "both negative" also satisfies the remaining conditions \u2014 which is why all three are required.'
          ] },

        { id: 'm-02-06-q7', tier: 'H', kind: 'integer', parSec: 100, kcs: ['kc-m2-common'],
          stem: 'Find the common root of $x^2 - 5x + 6 = 0$ and $x^2 - 7x + 10 = 0$.',
          answer: 2,
          hint: 'Subtract one equation from the other to eliminate $x^2$.',
          solution: [
            'Subtracting: $(x^2-5x+6) - (x^2-7x+10) = 2x - 4 = 0$, so $x = 2$.',
            'Verify in both: $4 - 10 + 6 = 0$ \u2713 and $4 - 14 + 10 = 0$ \u2713.',
            'The roots are $\\{2, 3\\}$ and $\\{2, 5\\}$, so 2 is the only one they share.',
            'Subtracting to eliminate $x^2$ is the standard first move for common-root questions.'
          ] },

        { id: 'm-02-06-q8', tier: 'H', kind: 'mcq', parSec: 120, kcs: ['kc-m2-nature'],
          stem: 'The values of $k$ for which $x^2 + kx + 4 > 0$ for **every** real $x$ are:',
          options: [
            '$-4 < k < 4$',
            '$k > 4$',
            '$k < -4$ or $k > 4$',
            '$k \\geq 0$'
          ],
          answer: 0,
          hint: '$a$ is already positive, so the condition is on $D$.',
          solution: [
            '$a = 1 > 0$ \u2014 the parabola opens upward, as required.',
            'It must never touch the axis, so $D < 0$.',
            '$D = k^2 - 16 < 0$, giving $k^2 < 16$.',
            'So $-4 < k < 4$. At $k = \\pm4$ the curve touches the axis and the inequality fails at that one point.'
          ] },

        { id: 'm-02-06-q9', tier: 'H', kind: 'mcq', parSec: 130, kcs: ['kc-m2-nature', 'kc-m2-quadratic'],
          stem: 'Both roots of $x^2 - 2kx + k^2 - 1 = 0$ lie strictly between $-2$ and $4$ when:',
          options: [
            '$-1 < k < 3$',
            '$-2 < k < 4$',
            '$0 < k < 3$',
            '$k > 3$'
          ],
          answer: 0,
          hint: 'This one factorises cleanly \u2014 find the roots explicitly.',
          solution: [
            '$D = 4k^2 - 4(k^2-1) = 4$, so $\\sqrt{D} = 2$ whatever $k$ is.',
            '$x = \\dfrac{2k \\pm 2}{2} = k \\pm 1$. The roots are simply $k-1$ and $k+1$.',
            'Smaller root above $-2$: $k - 1 > -2 \\Rightarrow k > -1$.',
            'Larger root below 4: $k + 1 < 4 \\Rightarrow k < 3$.',
            'Both together: $-1 < k < 3$.'
          ] }
      ]
    }
  ],

  /* ================================================================ */
  boss: {
    id: 'm-02-boss',
    name: 'The Conjugate',
    title: 'Reflected Adversary',
    avatar: '\ud83e\ude9e',
    hp: 10,
    lives: 3,
    timePerQ: 115,
    intro: 'The Logic Core throws up a mirror, and something steps out of it that is exactly you with one sign changed. "Whatever you are," it says, "I am the other root. You have never been able to get rid of me, and you never will."',
    defeat: 'The mirror-figure inclines its head and folds back into the surface. CANTOR is almost warm: "Correct, Cadet. It was never an enemy. A conjugate is what makes the answer real \u2014 you simply had to multiply by it."',
    taunts: [
      'Which quadrant? Your calculator does not know.',
      'Sum is minus b over a. Over **a**.',
      'Reduce the exponent first. Mod four, or mod three.',
      'If one root is complex, where is the other?'
    ],
    extraQuestions: [
      { id: 'm-02-boss-q1', tier: 'H', kind: 'integer', parSec: 130, kcs: ['kc-m2-iota', 'kc-m2-algebra'],
        stem: 'Find the value of $(1+i)^4$.',
        answer: -4,
        hint: 'Square twice.',
        solution: [
          '$(1+i)^2 = 1 + 2i + i^2 = 2i$.',
          '$(1+i)^4 = (2i)^2 = 4i^2$.',
          '$= -4$.'
        ] },
      { id: 'm-02-boss-q2', tier: 'H', kind: 'integer', parSec: 130, kcs: ['kc-m2-symmetric'],
        stem: 'If $\\alpha, \\beta$ are the roots of $x^2 - 6x + 8 = 0$, find $\\alpha^2 + \\beta^2$.',
        answer: 20,
        hint: '$S^2 - 2P$.',
        solution: [
          '$S = 6$, $P = 8$.',
          '$\\alpha^2+\\beta^2 = 36 - 16 = 20$.',
          'Check: the roots are 2 and 4, and $4 + 16 = 20$ \u2713.'
        ] },
      { id: 'm-02-boss-q3', tier: 'M', kind: 'mcq', parSec: 100, kcs: ['kc-m2-modprops'],
        stem: 'If $|z| = 2$, then $|z^3|$ equals:',
        options: ['$8$', '$6$', '$2$', '$\\dfrac{1}{8}$'],
        answer: 0,
        hint: '$|z^n| = |z|^n$.',
        solution: [
          '$|z^3| = |z|^3 = 2^3 = 8$.',
          'Moduli multiply, so cubing a number cubes its modulus \u2014 the argument is irrelevant here.'
        ] }
    ]
  },

  formulaSheet: [
    { name: 'Imaginary unit', tex: 'i^2 = -1' },
    { name: 'Powers of i', tex: 'i^{4k}=1,\\ i^{4k+1}=i,\\ i^{4k+2}=-1,\\ i^{4k+3}=-i' },
    { name: 'Conjugate', tex: '\\overline{a+bi} = a-bi' },
    { name: 'Modulus', tex: '|z| = \\sqrt{a^2+b^2},\\quad z\\bar{z} = |z|^2' },
    { name: 'Division', tex: '\\frac{z_1}{z_2} = \\frac{z_1\\bar{z_2}}{|z_2|^2}' },
    { name: 'Polar form', tex: 'z = r(\\cos\\theta+i\\sin\\theta)' },
    { name: 'Modulus rules', tex: '|z_1z_2| = |z_1||z_2|,\\quad |z^n| = |z|^n' },
    { name: 'Triangle inequality', tex: '|z_1+z_2| \\leq |z_1|+|z_2|' },
    { name: 'De Moivre', tex: '(\\cos\\theta+i\\sin\\theta)^n = \\cos n\\theta+i\\sin n\\theta' },
    { name: 'nth roots', tex: 'r^{1/n}\\,\\text{cis}\\left(\\frac{\\theta+2k\\pi}{n}\\right),\\ k = 0\\ldots n-1' },
    { name: 'Cube roots of unity', tex: '1+\\omega+\\omega^2 = 0,\\quad \\omega^3 = 1' },
    { name: 'Quadratic formula', tex: 'x = \\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}' },
    { name: 'Discriminant', tex: 'D = b^2-4ac' },
    { name: 'Nature of roots', tex: 'D>0\\ \\text{two real};\\ D=0\\ \\text{equal};\\ D<0\\ \\text{complex}' },
    { name: 'Sum and product', tex: '\\alpha+\\beta = -b/a,\\quad \\alpha\\beta = c/a' },
    { name: 'Squares and cubes', tex: '\\alpha^2+\\beta^2 = S^2-2P,\\quad \\alpha^3+\\beta^3 = S^3-3PS' },
    { name: 'Difference of roots', tex: '(\\alpha-\\beta)^2 = S^2-4P' },
    { name: 'Forming an equation', tex: 'x^2 - Sx + P = 0' },
    { name: 'Both roots positive', tex: 'D \\geq 0,\\ S>0,\\ P>0' },
    { name: 'Always positive', tex: 'a>0\\ \\text{and}\\ D<0' }
  ]
};
