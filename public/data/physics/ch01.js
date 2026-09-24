/**
 * Physics - Chapter 1: Units and Measurements
 *
 * JEE Main Unit 1 ("Physics and Measurement") + the measurement/error section
 * of the Advanced syllabus. Eight topics, each with a simulation and a
 * G/M/H question ladder.
 *
 * Content conventions:
 *   lesson[]   ordered blocks, rendered by ui/lesson.js
 *   $...$      inline maths, parsed by core/mathlite.js
 *   kcs[]      knowledge components this item is evidence for
 *   tier       G = Grasp, M = Mastery, H = Hurdle
 *   parSec     target solve time; feeds the SRS quality score
 */

export default {
  id: 'ph-01',
  subject: 'physics',
  number: 1,
  title: 'Units and Measurements',
  subtitle: 'The grammar of physics',
  blurb: 'Every number in physics is a promise about the real world. This chapter is how you keep that promise: what you measure against, how precisely, and how wrong you might be.',
  jeeWeight: 3.3,
  estMin: 270,
  icon: '📐',

  guide: {
    name: 'VERA',
    full: 'Vernier Engineering & Reasoning Assistant',
    avatar: '📐',
    voice: 'precise, dry, faintly amused'
  },

  intro: {
    speaker: 'VERA',
    avatar: '📐',
    lines: [
      'Cadet. The flare wiped the *Aryabhata*\u2019s calibration archive. Without it, every instrument on this station is reporting numbers with no meaning attached.',
      'The hull stress gauge says "4.7". Four point seven *what*? Pascals? Megapascals? My patience?',
      'We rebuild the archive from first principles. Eight modules. You restore each one by understanding it \u2014 I cannot simply hand you the answers, because the archive stores *reasoning*, not values.',
      'Begin with Module One. And Cadet \u2014 in metrology, being approximately right in the wrong unit is simply being wrong.'
    ]
  },

  /* ================================================================
     Knowledge components - the prerequisite DAG for this chapter
     ================================================================ */
  kcs: {
    'kc-ph-quantity':   { name: 'Fundamental vs derived quantities', weight: 1.0, prereq: [] },
    'kc-ph-si-base':    { name: 'The seven SI base units',           weight: 1.2, prereq: ['kc-ph-quantity'] },
    'kc-ph-si-prefix':  { name: 'SI prefixes and scientific notation', weight: 1.0, prereq: ['kc-ph-si-base'] },
    'kc-ph-supp':       { name: 'Radian, steradian, dimensionless units', weight: 0.7, prereq: ['kc-ph-si-base'] },

    'kc-ph-convert':    { name: 'Converting between units',          weight: 1.3, prereq: ['kc-ph-si-base', 'kc-ph-si-prefix'] },
    'kc-ph-systems':    { name: 'CGS, MKS, FPS systems',             weight: 0.8, prereq: ['kc-ph-si-base'] },

    'kc-ph-dimform':    { name: 'Writing a dimensional formula',     weight: 1.5, prereq: ['kc-ph-quantity', 'kc-ph-si-base'] },
    'kc-ph-homog':      { name: 'Principle of homogeneity',          weight: 1.4, prereq: ['kc-ph-dimform'] },

    'kc-ph-dimderive':  { name: 'Deriving relations by dimensions',  weight: 1.3, prereq: ['kc-ph-homog'] },
    'kc-ph-dimconvert': { name: 'Unit conversion via dimensions',    weight: 1.2, prereq: ['kc-ph-dimform', 'kc-ph-convert'] },
    'kc-ph-dimlimit':   { name: 'Limitations of dimensional analysis', weight: 0.9, prereq: ['kc-ph-dimderive'] },

    'kc-ph-sigfig':     { name: 'Counting significant figures',      weight: 1.3, prereq: [] },
    'kc-ph-round':      { name: 'Rounding rules',                    weight: 0.9, prereq: ['kc-ph-sigfig'] },
    'kc-ph-sigarith':   { name: 'Arithmetic with significant figures', weight: 1.4, prereq: ['kc-ph-sigfig', 'kc-ph-round'] },

    'kc-ph-errtype':    { name: 'Systematic vs random error',        weight: 1.0, prereq: [] },
    'kc-ph-accprec':    { name: 'Accuracy vs precision',             weight: 0.9, prereq: ['kc-ph-errtype'] },
    'kc-ph-errabs':     { name: 'Absolute and mean absolute error',  weight: 1.2, prereq: ['kc-ph-errtype'] },
    'kc-ph-errrel':     { name: 'Relative and percentage error',     weight: 1.3, prereq: ['kc-ph-errabs'] },

    'kc-ph-errsum':     { name: 'Error in sums and differences',     weight: 1.3, prereq: ['kc-ph-errrel'] },
    'kc-ph-errprod':    { name: 'Error in products, quotients, powers', weight: 1.6, prereq: ['kc-ph-errrel'] },

    'kc-ph-leastcount': { name: 'Least count of an instrument',      weight: 1.1, prereq: ['kc-ph-si-base'] },
    'kc-ph-vernier':    { name: 'Reading a vernier calliper',        weight: 1.3, prereq: ['kc-ph-leastcount'] },
    'kc-ph-screw':      { name: 'Reading a screw gauge',             weight: 1.3, prereq: ['kc-ph-leastcount'] },
    'kc-ph-zeroerr':    { name: 'Zero error and zero correction',    weight: 1.2, prereq: ['kc-ph-vernier', 'kc-ph-screw'] }
  },

  /* ================================================================ */
  topics: [
    /* ---------------------------------------------------------------
       1. Physical quantities and the SI system
       --------------------------------------------------------------- */
    {
      id: 'ph-01-01',
      title: 'Physical Quantities & the SI System',
      short: 'What we measure, and what we measure it against',
      kcs: ['kc-ph-quantity', 'kc-ph-si-base', 'kc-ph-si-prefix', 'kc-ph-supp'],
      prereq: [],
      estMin: 22,
      weight: 1.0,
      widget: 'unitForge',
      widgetTitle: 'Unit Forge',
      widgetBrief: 'Assemble derived units out of base units before the reactor timer runs out.',

      story: {
        speaker: 'VERA',
        avatar: '📐',
        lines: [
          'Module One. The foundation stone.',
          'A measurement is a comparison. When you say a rod is 3 metres long, you are saying: *this rod is three times the thing we all agreed to call a metre*.',
          'The whole edifice of physics rests on seven such agreements. Learn them and everything else is derivable. Forget them and you are a cadet shouting numbers into a vacuum.'
        ]
      },

      lesson: [
        { t: 'p', x: 'A **physical quantity** is anything that can be measured. Every measurement has two parts and *both* are mandatory: a **numerical value** and a **unit**. Writing $n_1u_1 = n_2u_2$ captures the whole idea \u2014 the physical thing is fixed, so if you shrink the unit the number must grow.' },

        { t: 'callout', kind: 'story', title: 'VERA', x: 'The hull gauge reading "4.7" is not a measurement. It is a rumour.' },

        { t: 'h', x: 'Fundamental vs derived' },
        { t: 'p', x: '**Fundamental (base) quantities** are chosen, not discovered. We pick a small set that cannot be expressed in terms of each other, define a standard for each, and build everything else from them. Those built quantities are **derived**.' },
        { t: 'ul', items: [
          'Speed is derived: $\\text{length} / \\text{time}$.',
          'Force is derived: $\\text{mass} \\times \\text{length} / \\text{time}^2$.',
          'Length, mass and time are fundamental \u2014 there is no more basic thing to reduce them to.'
        ] },

        { t: 'h', x: 'The seven SI base units' },
        { t: 'table',
          head: ['Quantity', 'Unit', 'Symbol', 'Defined by (2019 SI)'],
          rows: [
            ['Length', 'metre', 'm', 'fixing $c = 299\\,792\\,458$ m/s'],
            ['Mass', 'kilogram', 'kg', 'fixing Planck\u2019s constant $h$'],
            ['Time', 'second', 's', 'caesium-133 hyperfine transition'],
            ['Electric current', 'ampere', 'A', 'fixing elementary charge $e$'],
            ['Thermodynamic temperature', 'kelvin', 'K', 'fixing Boltzmann\u2019s constant $k_B$'],
            ['Amount of substance', 'mole', 'mol', 'fixing $N_A = 6.02214076 \\times 10^{23}$'],
            ['Luminous intensity', 'candela', 'cd', 'fixing luminous efficacy $K_{cd}$']
          ]
        },
        { t: 'callout', kind: 'jee', title: 'Exam radar', x: 'The single most common Grasp-tier question in this chapter is *"which of these is NOT a fundamental quantity?"* The usual impostors are **force**, **weight**, **energy**, **pressure** and **charge**. Note carefully: electric **current** is fundamental; electric **charge** is not (it is $\\text{A}\\cdot\\text{s}$).' },

        { t: 'h', x: 'Supplementary units' },
        { t: 'p', x: 'Two quantities sit awkwardly: **plane angle** (radian, rad) and **solid angle** (steradian, sr). Both are ratios of two lengths or two areas, so they are *dimensionless* \u2014 $[\\text{M}^0\\text{L}^0\\text{T}^0]$ \u2014 yet they carry a unit name. The SI now classes them as derived units, but JEE still calls them supplementary.' },
        { t: 'formula', name: 'Plane and solid angle', tex: '\\theta = \\frac{s}{r} \\quad\\quad \\Omega = \\frac{A}{r^2}', note: 'A full circle is $2\\pi$ rad; a full sphere is $4\\pi$ sr.' },

        { t: 'h', x: 'Prefixes: the compression algorithm' },
        { t: 'p', x: 'Physics spans about 40 orders of magnitude. Prefixes keep the numbers readable.' },
        { t: 'table',
          head: ['Prefix', 'Symbol', 'Factor', 'Prefix', 'Symbol', 'Factor'],
          rows: [
            ['tera', 'T', '$10^{12}$', 'centi', 'c', '$10^{-2}$'],
            ['giga', 'G', '$10^{9}$', 'milli', 'm', '$10^{-3}$'],
            ['mega', 'M', '$10^{6}$', 'micro', '$\\mu$', '$10^{-6}$'],
            ['kilo', 'k', '$10^{3}$', 'nano', 'n', '$10^{-9}$'],
            ['deci', 'd', '$10^{-1}$', 'pico', 'p', '$10^{-12}$'],
            ['', '', '', 'femto', 'f', '$10^{-15}$']
          ]
        },
        { t: 'callout', kind: 'trap', title: 'The kilogram trap', x: 'The kilogram is the only base unit that already contains a prefix. So a thousandth of a kilogram is a **gram**, not a "millikilogram", and $10^{-6}$ kg is a **milligram**. When you convert, always strip to kg first.' },

        { t: 'h', x: 'Useful practical units' },
        { t: 'table',
          head: ['Unit', 'Measures', 'Value in SI'],
          rows: [
            ['1 \u00e5ngstr\u00f6m (\u00c5)', 'atomic sizes', '$10^{-10}$ m'],
            ['1 fermi (fm)', 'nuclear sizes', '$10^{-15}$ m'],
            ['1 astronomical unit (AU)', 'solar system', '$1.496 \\times 10^{11}$ m'],
            ['1 light year (ly)', 'stellar distances', '$9.46 \\times 10^{15}$ m'],
            ['1 parsec (pc)', 'stellar distances', '$3.08 \\times 10^{16}$ m = 3.26 ly'],
            ['1 atomic mass unit (u)', 'atomic masses', '$1.66 \\times 10^{-27}$ kg'],
            ['1 barn', 'nuclear cross-section', '$10^{-28}$ m$^2$']
          ]
        },

        { t: 'worked', title: 'Worked example \u2014 building a derived unit', tier: 'M',
          q: 'Express the unit of **pressure** entirely in SI base units.',
          steps: [
            'Pressure is force per unit area: $P = F/A$.',
            'Force comes from Newton\u2019s second law: $F = ma$, so its unit is $\\text{kg}\\cdot\\text{m}\\,\\text{s}^{-2}$ (the newton).',
            'Area has unit $\\text{m}^2$.',
            'Divide: $\\dfrac{\\text{kg}\\,\\text{m}\\,\\text{s}^{-2}}{\\text{m}^2} = \\text{kg}\\,\\text{m}^{-1}\\text{s}^{-2}$.'
          ],
          ans: '$1\\ \\text{Pa} = 1\\ \\text{kg}\\,\\text{m}^{-1}\\text{s}^{-2}$'
        },

        { t: 'sim' },

        { t: 'callout', kind: 'tip', title: 'How to actually remember the seven', x: 'Don\u2019t memorise the list \u2014 memorise the *story*: you can measure a thing\u2019s size (**m**), its heft (**kg**), when it happens (**s**), how much charge flows (**A**), how hot it is (**K**), how much stuff there is (**mol**), and how bright it looks (**cd**). Seven questions you could ask about any object.' }
      ],

      formulas: [
        { name: 'Measurement identity', tex: 'n_1 u_1 = n_2 u_2', note: 'Smaller unit \u21d2 bigger number.' },
        { name: 'Plane angle', tex: '\\theta = s/r', note: 'radian, dimensionless' },
        { name: 'Solid angle', tex: '\\Omega = A/r^2', note: 'steradian, dimensionless' }
      ],

      questions: [
        { id: 'ph-01-01-q1', tier: 'G', kind: 'mcq', parSec: 30, kcs: ['kc-ph-quantity'],
          stem: 'Which of the following is **not** a fundamental (base) quantity in the SI system?',
          options: ['Luminous intensity', 'Amount of substance', 'Force', 'Thermodynamic temperature'],
          answer: 2,
          hint: 'Can you build it out of other quantities? Then it is derived.',
          solution: [
            'The seven SI base quantities are length, mass, time, electric current, thermodynamic temperature, amount of substance and luminous intensity.',
            'Force is built from three of them: $F = ma$ gives $[\\text{MLT}^{-2}]$.',
            'So force is a **derived** quantity.'
          ] },

        { id: 'ph-01-01-q2', tier: 'G', kind: 'mcq', parSec: 25, kcs: ['kc-ph-si-base'],
          stem: 'The SI unit of **amount of substance** is the:',
          options: ['kilogram', 'mole', 'candela', 'kelvin'],
          answer: 1,
          hint: 'It counts entities, not mass.',
          solution: [
            'Amount of substance counts how many entities are present, and its unit is the **mole**.',
            'One mole contains exactly $6.02214076 \\times 10^{23}$ elementary entities (the fixed Avogadro number).',
            'Note the distinction: mass (kg) is how heavy, amount of substance (mol) is how many.'
          ] },

        { id: 'ph-01-01-q3', tier: 'G', kind: 'mcq', parSec: 30, kcs: ['kc-ph-si-prefix'],
          stem: 'A wavelength of $600$ nm is equal to:',
          options: ['$6 \\times 10^{-6}$ m', '$6 \\times 10^{-7}$ m', '$6 \\times 10^{-8}$ m', '$6 \\times 10^{-9}$ m'],
          answer: 1,
          hint: 'nano means $10^{-9}$.',
          solution: [
            '$1\\ \\text{nm} = 10^{-9}\\ \\text{m}$.',
            '$600\\ \\text{nm} = 600 \\times 10^{-9}\\ \\text{m} = 6 \\times 10^{2} \\times 10^{-9}\\ \\text{m}$.',
            '$= 6 \\times 10^{-7}\\ \\text{m}$, which is $6000$ \u00c5 \u2014 orange-red light.'
          ] },

        { id: 'ph-01-01-q4', tier: 'M', kind: 'mcq', parSec: 55, kcs: ['kc-ph-si-base', 'kc-ph-quantity'],
          stem: 'Which **pair** of quantities has the same SI unit?',
          options: ['Work and power', 'Torque and work', 'Momentum and impulse only', 'Pressure and force'],
          answer: 1,
          hint: 'Write each one out in base units before comparing.',
          solution: [
            'Work $= F \\cdot d$ has unit $\\text{N}\\,\\text{m} = \\text{J}$.',
            'Torque $= r \\times F$ also has unit $\\text{N}\\,\\text{m}$.',
            'So both carry $\\text{kg}\\,\\text{m}^2\\text{s}^{-2}$ \u2014 identical units despite being physically different (one is a scalar, one a vector).',
            'Momentum and impulse do share a unit ($\\text{N}\\,\\text{s}$), but the option says "only", and torque/work is the intended classic pair. Work vs power and pressure vs force clearly differ.'
          ] },

        { id: 'ph-01-01-q5', tier: 'M', kind: 'mcq', parSec: 50, kcs: ['kc-ph-supp'],
          stem: 'Which statement about the **radian** is correct?',
          options: [
            'It has dimensions of length',
            'It is dimensionless but has a unit name',
            'It is a fundamental SI quantity',
            'It has dimensions $[\\text{L}^2]$'
          ],
          answer: 1,
          hint: 'It is defined as a ratio of two lengths.',
          solution: [
            '$\\theta = s/r$: arc length divided by radius.',
            'Both are lengths, so the dimensions cancel: $[\\text{L}]/[\\text{L}] = [\\text{M}^0\\text{L}^0\\text{T}^0]$.',
            'It is therefore **dimensionless**, yet we still give it the name *radian* to signal that an angle is meant.',
            'This is why $\\sin\\theta$, $e^x$ and $\\ln x$ can only take dimensionless arguments.'
          ] },

        { id: 'ph-01-01-q6', tier: 'M', kind: 'mcq', parSec: 60, kcs: ['kc-ph-si-base'],
          stem: 'The physical quantity with SI unit $\\text{kg}\\,\\text{m}^{-1}\\text{s}^{-2}$ is:',
          options: ['Momentum', 'Pressure', 'Surface tension', 'Power'],
          answer: 1,
          hint: 'Divide a newton by a square metre.',
          solution: [
            '$\\text{kg}\\,\\text{m}\\,\\text{s}^{-2}$ is the newton. Dividing by $\\text{m}^2$ gives $\\text{kg}\\,\\text{m}^{-1}\\text{s}^{-2}$.',
            'Force per unit area is **pressure** (also stress, and energy density \u2014 all share this unit).',
            'Check the others: momentum is $\\text{kg}\\,\\text{m}\\,\\text{s}^{-1}$, surface tension is $\\text{kg}\\,\\text{s}^{-2}$, power is $\\text{kg}\\,\\text{m}^2\\text{s}^{-3}$.'
          ] },

        { id: 'ph-01-01-q7', tier: 'H', kind: 'mcq', parSec: 95, kcs: ['kc-ph-si-base'],
          stem: 'The weber (Wb), unit of magnetic flux, expressed in SI base units is:',
          options: [
            '$\\text{kg}\\,\\text{m}^2\\text{s}^{-2}\\text{A}^{-1}$',
            '$\\text{kg}\\,\\text{m}^2\\text{s}^{-1}\\text{A}^{-1}$',
            '$\\text{kg}\\,\\text{m}\\,\\text{s}^{-2}\\text{A}^{-2}$',
            '$\\text{kg}\\,\\text{m}^2\\text{s}^{-3}\\text{A}^{-1}$'
          ],
          answer: 0,
          hint: 'Faraday\u2019s law: EMF is the rate of change of flux, so flux = EMF \u00d7 time.',
          solution: [
            'Faraday: $\\varepsilon = -\\dfrac{d\\Phi}{dt}$, so $\\Phi = \\varepsilon \\cdot t$, i.e. $1\\ \\text{Wb} = 1\\ \\text{V}\\,\\text{s}$.',
            'The volt is joules per coulomb: $\\text{V} = \\dfrac{\\text{kg}\\,\\text{m}^2\\text{s}^{-2}}{\\text{A}\\,\\text{s}} = \\text{kg}\\,\\text{m}^2\\text{s}^{-3}\\text{A}^{-1}$.',
            'Multiply by seconds: $\\text{Wb} = \\text{kg}\\,\\text{m}^2\\text{s}^{-3}\\text{A}^{-1} \\times \\text{s} = \\text{kg}\\,\\text{m}^2\\text{s}^{-2}\\text{A}^{-1}$.'
          ] },

        { id: 'ph-01-01-q8', tier: 'H', kind: 'mcq', parSec: 90, kcs: ['kc-ph-supp', 'kc-ph-si-base'],
          stem: 'Luminous flux is measured in lumens, where $1\\ \\text{lm} = 1\\ \\text{cd}\\cdot\\text{sr}$. In terms of SI **base** units alone, the lumen is equivalent to:',
          options: ['$\\text{cd}\\,\\text{m}^2$', '$\\text{cd}$', '$\\text{cd}\\,\\text{m}^{-2}$', '$\\text{cd}\\,\\text{sr}^2$'],
          answer: 1,
          hint: 'What are the dimensions of a steradian?',
          solution: [
            'The steradian is $\\Omega = A/r^2$, an area divided by an area \u2014 completely dimensionless.',
            'So multiplying by steradians changes nothing dimensionally.',
            '$1\\ \\text{lm} = 1\\ \\text{cd}\\cdot\\text{sr} \\equiv 1\\ \\text{cd}$ in base units.',
            'The unit name *lumen* survives purely to tell a reader that flux, not intensity, is meant \u2014 the same trick as the radian.'
          ] },

        { id: 'ph-01-01-q9', tier: 'H', kind: 'integer', parSec: 100, kcs: ['kc-ph-si-prefix', 'kc-ph-convert'],
          stem: 'A cube of edge $1\\ \\mu\\text{m}$ is made of a material of density $8\\ \\text{g}\\,\\text{cm}^{-3}$. Its mass is $8 \\times 10^{-n}$ kg. Find $n$.',
          answer: 15,
          hint: 'Get the volume in $\\text{m}^3$ and the density in $\\text{kg}\\,\\text{m}^{-3}$ before multiplying.',
          solution: [
            'Edge $= 1\\ \\mu\\text{m} = 10^{-6}\\ \\text{m}$, so volume $V = (10^{-6})^3 = 10^{-18}\\ \\text{m}^3$.',
            'Density: $8\\ \\text{g}\\,\\text{cm}^{-3} = 8 \\times \\dfrac{10^{-3}\\ \\text{kg}}{10^{-6}\\ \\text{m}^3} = 8 \\times 10^{3}\\ \\text{kg}\\,\\text{m}^{-3}$.',
            'Mass $= \\rho V = 8 \\times 10^{3} \\times 10^{-18} = 8 \\times 10^{-15}\\ \\text{kg}$.',
            'So $n = 15$.'
          ] }
      ]
    },

    /* ---------------------------------------------------------------
       2. Unit conversion and systems of units
       --------------------------------------------------------------- */
    {
      id: 'ph-01-02',
      title: 'Unit Conversion & Systems of Units',
      short: 'Moving a number between agreements',
      kcs: ['kc-ph-convert', 'kc-ph-systems'],
      prereq: ['ph-01-01'],
      estMin: 24,
      weight: 1.0,
      widget: 'conversionCascade',
      widgetTitle: 'Conversion Cascade',
      widgetBrief: 'Chain conversion factors to route a quantity from one system to another without spilling a power of ten.',

      story: {
        speaker: 'VERA',
        avatar: '📐',
        lines: [
          'Module Two. A cautionary tale first.',
          'In 1999 a Mars orbiter was lost because one team worked in pound-seconds and another in newton-seconds. Same physics. Different agreement. $327$ million dollars, gone into the Martian atmosphere.',
          'Conversion is not arithmetic busywork, Cadet. It is the difference between orbit and crater.'
        ]
      },

      lesson: [
        { t: 'p', x: 'A conversion never changes the physical quantity \u2014 only the number and the label move. That is the whole content of $n_1u_1 = n_2u_2$: **the product is invariant**.' },

        { t: 'h', x: 'The three classical systems' },
        { t: 'table',
          head: ['System', 'Length', 'Mass', 'Time', 'Force unit', 'Energy unit'],
          rows: [
            ['SI / MKS', 'metre', 'kilogram', 'second', 'newton (N)', 'joule (J)'],
            ['CGS', 'centimetre', 'gram', 'second', 'dyne', 'erg'],
            ['FPS', 'foot', 'pound', 'second', 'poundal', 'foot-poundal']
          ]
        },
        { t: 'formula', name: 'The two conversions you must know cold', tex: '1\\ \\text{N} = 10^{5}\\ \\text{dyne} \\quad\\quad 1\\ \\text{J} = 10^{7}\\ \\text{erg}', star: true,
          note: 'Derive rather than memorise: $1\\,\\text{N} = 1\\,\\text{kg}\\,\\text{m}\\,\\text{s}^{-2} = 10^3\\text{g} \\times 10^2\\text{cm} \\times \\text{s}^{-2}$.' },

        { t: 'h', x: 'The factor-label method' },
        { t: 'p', x: 'Multiply by fractions that equal 1, arranged so unwanted units cancel like algebra. It is slower than a memorised factor and it is *never* wrong.' },
        { t: 'worked', title: 'Worked example \u2014 factor-label in action', tier: 'G',
          q: 'Convert $72\\ \\text{km}\\,\\text{h}^{-1}$ to $\\text{m}\\,\\text{s}^{-1}$.',
          steps: [
            'Write the quantity and multiply by unity fractions: $72\\,\\dfrac{\\text{km}}{\\text{h}} \\times \\dfrac{1000\\ \\text{m}}{1\\ \\text{km}} \\times \\dfrac{1\\ \\text{h}}{3600\\ \\text{s}}$.',
            'Cancel: km cancels km, h cancels h.',
            'Compute: $\\dfrac{72 \\times 1000}{3600} = 20$.',
            'The shortcut worth memorising: multiply km/h by $\\dfrac{5}{18}$ to get m/s.'
          ],
          ans: '$20\\ \\text{m}\\,\\text{s}^{-1}$'
        },

        { t: 'h', x: 'Changing the whole system at once' },
        { t: 'p', x: 'JEE loves the abstract version: *"if the unit of mass is $\\alpha$ kg, length is $\\beta$ m and time is $\\gamma$ s, what is the numerical value of 1 joule?"* Do not panic \u2014 use $n_1u_1 = n_2u_2$ with the dimensional formula.' },
        { t: 'formula', name: 'General system conversion', tex: 'n_2 = n_1 \\left[\\frac{M_1}{M_2}\\right]^{a} \\left[\\frac{L_1}{L_2}\\right]^{b} \\left[\\frac{T_1}{T_2}\\right]^{c}', star: true,
          note: 'where the quantity has dimensional formula $[\\text{M}^a\\text{L}^b\\text{T}^c]$.' },

        { t: 'worked', title: 'Worked example \u2014 a whole new system', tier: 'H',
          q: 'In a new system the unit of mass is $\\alpha$ kg, of length $\\beta$ m and of time $\\gamma$ s. What is the numerical value of $1$ joule in this system?',
          steps: [
            'Energy has dimensional formula $[\\text{ML}^2\\text{T}^{-2}]$, so $a=1,\\ b=2,\\ c=-2$.',
            'Apply the rule with $M_1 = 1$ kg, $M_2 = \\alpha$ kg (and similarly for L, T):',
            '$n_2 = 1 \\times \\left[\\dfrac{1}{\\alpha}\\right]^{1}\\left[\\dfrac{1}{\\beta}\\right]^{2}\\left[\\dfrac{1}{\\gamma}\\right]^{-2}$',
            'Simplify: $n_2 = \\dfrac{\\gamma^2}{\\alpha\\beta^2}$.',
            'Sanity check: making the new time unit larger ($\\gamma > 1$) makes the new energy unit *smaller*, so the number should grow \u2014 and $\\gamma^2$ is in the numerator. Correct.'
          ],
          ans: '$1\\ \\text{J} = \\dfrac{\\gamma^2}{\\alpha\\beta^2}$ new units'
        },

        { t: 'sim' },

        { t: 'callout', kind: 'trap', title: 'The squared-prefix trap', x: 'When a unit is raised to a power, the *conversion factor* is raised too. $1\\ \\text{m}^2 = (10^2\\ \\text{cm})^2 = 10^4\\ \\text{cm}^2$, not $10^2$. And $1\\ \\text{m}^3 = 10^6\\ \\text{cm}^3$. Every year this costs people marks on density questions.' },
        { t: 'callout', kind: 'tip', title: 'Sanity check every conversion', x: 'Before writing the answer, ask: *did the number go the way it should?* Going to a smaller unit, the number must get bigger. If you converted metres to kilometres and the number grew, you divided the wrong way.' }
      ],

      formulas: [
        { name: 'System conversion', tex: 'n_2 = n_1 [M_1/M_2]^a [L_1/L_2]^b [T_1/T_2]^c', note: 'the workhorse formula' },
        { name: 'Force', tex: '1\\ \\text{N} = 10^5\\ \\text{dyne}' },
        { name: 'Energy', tex: '1\\ \\text{J} = 10^7\\ \\text{erg}' },
        { name: 'Pressure', tex: '1\\ \\text{Pa} = 10\\ \\text{dyne}\\,\\text{cm}^{-2}' },
        { name: 'Speed shortcut', tex: '1\\ \\text{km}\\,\\text{h}^{-1} = \\frac{5}{18}\\ \\text{m}\\,\\text{s}^{-1}' }
      ],

      questions: [
        { id: 'ph-01-02-q1', tier: 'G', kind: 'mcq', parSec: 30, kcs: ['kc-ph-systems'],
          stem: 'The CGS unit of force is the:',
          options: ['newton', 'dyne', 'erg', 'poundal'],
          answer: 1,
          hint: 'Erg is energy, newton is SI.',
          solution: [
            'In CGS the base units are gram, centimetre and second.',
            'Force $= \\text{mass} \\times \\text{acceleration} = \\text{g}\\,\\text{cm}\\,\\text{s}^{-2}$, which is given the name **dyne**.',
            '$1\\ \\text{N} = 1\\ \\text{kg}\\,\\text{m}\\,\\text{s}^{-2} = 10^3\\,\\text{g} \\times 10^2\\,\\text{cm}\\,\\text{s}^{-2} = 10^5$ dyne.'
          ] },

        { id: 'ph-01-02-q2', tier: 'G', kind: 'mcq', parSec: 35, kcs: ['kc-ph-convert'],
          stem: 'A car travels at $90\\ \\text{km}\\,\\text{h}^{-1}$. Its speed in $\\text{m}\\,\\text{s}^{-1}$ is:',
          options: ['$15$', '$25$', '$30$', '$32.4$'],
          answer: 1,
          hint: 'Multiply by $5/18$.',
          solution: [
            '$90 \\times \\dfrac{1000\\ \\text{m}}{3600\\ \\text{s}} = 90 \\times \\dfrac{5}{18}$.',
            '$= 25\\ \\text{m}\\,\\text{s}^{-1}$.'
          ] },

        { id: 'ph-01-02-q3', tier: 'G', kind: 'mcq', parSec: 40, kcs: ['kc-ph-convert'],
          stem: '$1\\ \\text{m}^3$ is equal to how many $\\text{cm}^3$?',
          options: ['$10^2$', '$10^3$', '$10^4$', '$10^6$'],
          answer: 3,
          hint: 'Cube the length conversion factor.',
          solution: [
            '$1\\ \\text{m} = 10^2\\ \\text{cm}$.',
            'Cubing both sides: $1\\ \\text{m}^3 = (10^2)^3\\ \\text{cm}^3 = 10^6\\ \\text{cm}^3$.',
            'This is why $1$ litre $= 10^3\\ \\text{cm}^3 = 10^{-3}\\ \\text{m}^3$.'
          ] },

        { id: 'ph-01-02-q4', tier: 'M', kind: 'mcq', parSec: 70, kcs: ['kc-ph-convert', 'kc-ph-systems'],
          stem: 'The value of the gravitational constant is $G = 6.67 \\times 10^{-11}\\ \\text{N}\\,\\text{m}^2\\text{kg}^{-2}$. Its value in CGS units ($\\text{dyne}\\ \\text{cm}^2\\text{g}^{-2}$) is:',
          options: ['$6.67 \\times 10^{-8}$', '$6.67 \\times 10^{-9}$', '$6.67 \\times 10^{-13}$', '$6.67 \\times 10^{-5}$'],
          answer: 0,
          hint: 'Convert each unit separately and collect the powers of ten.',
          solution: [
            '$G$ has dimensions $[\\text{M}^{-1}\\text{L}^3\\text{T}^{-2}]$.',
            'Using $n_2 = n_1[M_1/M_2]^{-1}[L_1/L_2]^{3}[T_1/T_2]^{-2}$ with $M_1/M_2 = 10^3$, $L_1/L_2 = 10^2$, $T_1/T_2 = 1$:',
            '$n_2 = 6.67 \\times 10^{-11} \\times (10^{3})^{-1} \\times (10^{2})^{3} = 6.67 \\times 10^{-11} \\times 10^{-3} \\times 10^{6}$.',
            '$= 6.67 \\times 10^{-8}\\ \\text{dyne}\\,\\text{cm}^2\\text{g}^{-2}$.'
          ] },

        { id: 'ph-01-02-q5', tier: 'M', kind: 'mcq', parSec: 60, kcs: ['kc-ph-convert'],
          stem: 'The density of a material is $8\\ \\text{g}\\,\\text{cm}^{-3}$. In SI units this is:',
          options: ['$8\\ \\text{kg}\\,\\text{m}^{-3}$', '$800\\ \\text{kg}\\,\\text{m}^{-3}$', '$8000\\ \\text{kg}\\,\\text{m}^{-3}$', '$0.008\\ \\text{kg}\\,\\text{m}^{-3}$'],
          answer: 2,
          hint: 'g \u2192 kg divides by $10^3$; $\\text{cm}^{-3} \\to \\text{m}^{-3}$ multiplies by $10^6$.',
          solution: [
            '$8\\ \\dfrac{\\text{g}}{\\text{cm}^3} \\times \\dfrac{10^{-3}\\ \\text{kg}}{1\\ \\text{g}} \\times \\dfrac{1\\ \\text{cm}^3}{10^{-6}\\ \\text{m}^3}$',
            '$= 8 \\times 10^{-3} \\times 10^{6} = 8 \\times 10^{3}\\ \\text{kg}\\,\\text{m}^{-3}$.',
            'Useful anchor: water is $1\\ \\text{g}\\,\\text{cm}^{-3} = 1000\\ \\text{kg}\\,\\text{m}^{-3}$.'
          ] },

        { id: 'ph-01-02-q6', tier: 'M', kind: 'integer', parSec: 80, kcs: ['kc-ph-convert', 'kc-ph-systems'],
          stem: 'In a system of units the unit of force is $100$ N, the unit of length is $10$ m and the unit of time is $100$ s. The unit of mass in this system is $10^{n}$ kg. Find $n$.',
          answer: 5,
          hint: 'Rearrange $F = mL/T^2$ for mass.',
          solution: [
            'From $F = ma = \\dfrac{mL}{T^2}$, we get $m = \\dfrac{F T^2}{L}$.',
            'Substituting the new units: $m = \\dfrac{100 \\times (100)^2}{10}$.',
            '$= \\dfrac{100 \\times 10^{4}}{10} = 10^{5}\\ \\text{kg}$.',
            'So $n = 5$.'
          ] },

        { id: 'ph-01-02-q7', tier: 'H', kind: 'mcq', parSec: 110, kcs: ['kc-ph-convert'],
          stem: 'If the unit of mass is $\\alpha$ kg, the unit of length is $\\beta$ m and the unit of time is $\\gamma$ s, then the numerical value of $1$ joule in the new system is:',
          options: ['$\\alpha\\beta^2\\gamma^{-2}$', '$\\alpha^{-1}\\beta^{-2}\\gamma^{2}$', '$\\alpha^{-1}\\beta^{2}\\gamma^{-2}$', '$\\alpha\\beta^{-2}\\gamma^{2}$'],
          answer: 1,
          hint: 'Energy is $[\\text{ML}^2\\text{T}^{-2}]$; each new unit appears with the reciprocal of its exponent.',
          solution: [
            'Energy: $[\\text{M}^1\\text{L}^2\\text{T}^{-2}]$.',
            '$n_2 = n_1\\left[\\dfrac{M_1}{M_2}\\right]^1\\left[\\dfrac{L_1}{L_2}\\right]^2\\left[\\dfrac{T_1}{T_2}\\right]^{-2} = 1 \\cdot \\left[\\dfrac{1}{\\alpha}\\right]\\left[\\dfrac{1}{\\beta}\\right]^2\\left[\\dfrac{1}{\\gamma}\\right]^{-2}$',
            '$= \\dfrac{\\gamma^2}{\\alpha\\beta^2} = \\alpha^{-1}\\beta^{-2}\\gamma^{2}$.'
          ] },

        { id: 'ph-01-02-q8', tier: 'H', kind: 'mcq', parSec: 120, kcs: ['kc-ph-convert', 'kc-ph-dimconvert'],
          stem: 'A calorie is $4.2$ J. Suppose we adopt a system in which the unit of mass is $\\alpha$ kg, of length $\\beta$ m and of time $\\gamma$ s. The new unit of energy is such that $1$ calorie has magnitude:',
          options: [
            '$4.2\\,\\alpha^{-1}\\beta^{-2}\\gamma^{2}$',
            '$4.2\\,\\alpha\\beta^{2}\\gamma^{-2}$',
            '$4.2\\,\\alpha^{-1}\\beta^{2}\\gamma^{-2}$',
            '$4.2\\,\\alpha\\beta^{-2}\\gamma^{2}$'
          ],
          answer: 0,
          hint: 'Same as the joule problem, scaled by 4.2.',
          solution: [
            'This is the classic NCERT/JEE problem. Energy is $[\\text{ML}^2\\text{T}^{-2}]$.',
            '$n_2 = 4.2 \\left[\\dfrac{1\\ \\text{kg}}{\\alpha\\ \\text{kg}}\\right]^{1}\\left[\\dfrac{1\\ \\text{m}}{\\beta\\ \\text{m}}\\right]^{2}\\left[\\dfrac{1\\ \\text{s}}{\\gamma\\ \\text{s}}\\right]^{-2}$',
            '$= 4.2\\,\\alpha^{-1}\\beta^{-2}\\gamma^{2}$.',
            'The $\\gamma$ exponent flips sign because time appears with a negative power in the dimensional formula \u2014 this sign flip is exactly where most candidates lose the mark.'
          ] },

        { id: 'ph-01-02-q9', tier: 'H', kind: 'numeric', parSec: 110, tol: { rel: 0.02 }, kcs: ['kc-ph-convert'],
          stem: 'The surface tension of water is $72\\ \\text{dyne}\\,\\text{cm}^{-1}$. Express it in $\\text{N}\\,\\text{m}^{-1}$. (Give the numerical value.)',
          answer: 0.072,
          hint: '$1$ dyne $= 10^{-5}$ N and $1\\ \\text{cm}^{-1} = 10^{2}\\ \\text{m}^{-1}$.',
          solution: [
            '$72\\ \\dfrac{\\text{dyne}}{\\text{cm}} \\times \\dfrac{10^{-5}\\ \\text{N}}{1\\ \\text{dyne}} \\times \\dfrac{1\\ \\text{cm}}{10^{-2}\\ \\text{m}}$',
            '$= 72 \\times 10^{-5} \\times 10^{2}$',
            '$= 72 \\times 10^{-3} = 0.072\\ \\text{N}\\,\\text{m}^{-1}$.',
            'General result worth remembering: $1\\ \\text{dyne}\\,\\text{cm}^{-1} = 10^{-3}\\ \\text{N}\\,\\text{m}^{-1}$.'
          ] }
      ]
    },

    /* ---------------------------------------------------------------
       3. Dimensional formulae and homogeneity
       --------------------------------------------------------------- */
    {
      id: 'ph-01-03',
      title: 'Dimensional Formulae & Homogeneity',
      short: 'The fingerprint of a physical quantity',
      kcs: ['kc-ph-dimform', 'kc-ph-homog'],
      prereq: ['ph-01-01'],
      estMin: 30,
      weight: 1.4,
      widget: 'dimensionBalance',
      widgetTitle: 'Dimension Balance',
      widgetBrief: 'Balance both sides of an equation by dragging M, L and T exponents onto the scales.',

      story: {
        speaker: 'VERA',
        avatar: '📐',
        lines: [
          'Module Three. My favourite.',
          'Every physical quantity carries a fingerprint: how much mass, length and time it contains. Speed is one length per one time. Energy is one mass, two lengths, minus two times.',
          'Once you can read fingerprints, you can catch a wrong equation from across the room without doing a single calculation. This is the closest thing physics has to a lie detector.'
        ]
      },

      lesson: [
        { t: 'p', x: 'The **dimensions** of a quantity are the powers to which the base quantities must be raised to represent it. We write them in square brackets using the symbols M, L, T, A (current), K (temperature), mol and cd.' },

        { t: 'formula', name: 'General dimensional formula', tex: '[Q] = [\\text{M}^{a}\\text{L}^{b}\\text{T}^{c}\\text{A}^{d}\\text{K}^{e}]', note: 'Only the exponents matter \u2014 the unit system does not.' },

        { t: 'h', x: 'Building one from scratch' },
        { t: 'p', x: 'You never memorise a dimensional formula. You **derive** it from a defining equation in about five seconds.' },
        { t: 'worked', title: 'Worked example \u2014 the coefficient of viscosity', tier: 'M',
          q: 'Find the dimensional formula of $\\eta$ from Newton\u2019s law of viscosity $F = \\eta A \\dfrac{dv}{dx}$.',
          steps: [
            'Rearrange for the unknown: $\\eta = \\dfrac{F}{A\\,(dv/dx)}$.',
            'Force: $[\\text{MLT}^{-2}]$. Area: $[\\text{L}^2]$.',
            'Velocity gradient $dv/dx$ is $\\dfrac{[\\text{LT}^{-1}]}{[\\text{L}]} = [\\text{T}^{-1}]$.',
            'Combine: $[\\eta] = \\dfrac{[\\text{MLT}^{-2}]}{[\\text{L}^2][\\text{T}^{-1}]} = [\\text{ML}^{-1}\\text{T}^{-1}]$.'
          ],
          ans: '$[\\eta] = [\\text{ML}^{-1}\\text{T}^{-1}]$, SI unit $\\text{Pa}\\,\\text{s}$'
        },

        { t: 'h', x: 'The reference table' },
        { t: 'table',
          head: ['Quantity', 'Dimensional formula', 'Quantity', 'Dimensional formula'],
          rows: [
            ['Velocity', '$[\\text{LT}^{-1}]$', 'Work / Energy / Torque', '$[\\text{ML}^2\\text{T}^{-2}]$'],
            ['Acceleration', '$[\\text{LT}^{-2}]$', 'Power', '$[\\text{ML}^2\\text{T}^{-3}]$'],
            ['Force', '$[\\text{MLT}^{-2}]$', 'Pressure / Stress', '$[\\text{ML}^{-1}\\text{T}^{-2}]$'],
            ['Momentum / Impulse', '$[\\text{MLT}^{-1}]$', 'Surface tension', '$[\\text{MT}^{-2}]$'],
            ['Frequency', '$[\\text{T}^{-1}]$', 'Viscosity', '$[\\text{ML}^{-1}\\text{T}^{-1}]$'],
            ['Angular velocity', '$[\\text{T}^{-1}]$', 'Planck constant', '$[\\text{ML}^2\\text{T}^{-1}]$'],
            ['Moment of inertia', '$[\\text{ML}^2]$', 'Gravitational constant', '$[\\text{M}^{-1}\\text{L}^3\\text{T}^{-2}]$'],
            ['Strain / Angle / $\\mu_r$', '$[\\text{M}^0\\text{L}^0\\text{T}^0]$', 'Gas constant $R$', '$[\\text{ML}^2\\text{T}^{-2}\\text{K}^{-1}\\text{mol}^{-1}]$'],
            ['Charge', '$[\\text{AT}]$', 'Electric field', '$[\\text{MLT}^{-3}\\text{A}^{-1}]$'],
            ['Potential difference', '$[\\text{ML}^2\\text{T}^{-3}\\text{A}^{-1}]$', 'Resistance', '$[\\text{ML}^2\\text{T}^{-3}\\text{A}^{-2}]$']
          ]
        },

        { t: 'h', x: 'The principle of homogeneity' },
        { t: 'callout', kind: 'jee', title: 'The rule that unlocks half the chapter',
          x: '**Only quantities with identical dimensions can be added, subtracted or equated.** You cannot add a mass to a length any more than you can add an hour to a kilogram.' },
        { t: 'ul', items: [
          'Every **term** in a valid equation has the same dimensions.',
          'Arguments of $\\sin$, $\\cos$, $\\tan$, $e^x$, $\\ln x$ must be **dimensionless** \u2014 and so is the output.',
          'A dimensionally wrong equation is *certainly* wrong. A dimensionally right one is *not necessarily* right.'
        ] },

        { t: 'worked', title: 'Worked example \u2014 hunting the exponent', tier: 'M',
          q: 'In the wave equation $y = a\\sin(\\omega t - kx)$, find the dimensions of $a$, $\\omega$ and $k$.',
          steps: [
            '$y$ is a displacement, so $[y] = [\\text{L}]$. Since $\\sin$ returns a pure number, $[a] = [\\text{L}]$.',
            'The bracket is the argument of a sine, so it must be dimensionless overall \u2014 and each term in it must be dimensionless separately (homogeneity).',
            '$[\\omega t] = [\\text{M}^0\\text{L}^0\\text{T}^0] \\Rightarrow [\\omega] = [\\text{T}^{-1}]$.',
            '$[kx] = [\\text{M}^0\\text{L}^0\\text{T}^0] \\Rightarrow [k] = [\\text{L}^{-1}]$.'
          ],
          ans: '$[a]=[\\text{L}],\\ [\\omega]=[\\text{T}^{-1}],\\ [k]=[\\text{L}^{-1}]$'
        },

        { t: 'sim' },

        { t: 'callout', kind: 'tip', title: 'The five-second check', x: 'Whenever you derive *any* formula anywhere in physics, spend five seconds checking its dimensions before you use it. It costs nothing and it has saved more marks in JEE history than any mnemonic.' }
      ],

      formulas: [
        { name: 'Homogeneity', tex: '[\\text{LHS}] = [\\text{RHS}] = [\\text{each term}]', star: true },
        { name: 'Transcendental arguments', tex: '[\\theta] = [x\\ \\text{in}\\ e^{x}] = [\\text{M}^0\\text{L}^0\\text{T}^0]', star: true },
        { name: 'Viscosity', tex: '[\\eta] = [\\text{ML}^{-1}\\text{T}^{-1}]' },
        { name: 'Planck constant', tex: '[h] = [\\text{ML}^{2}\\text{T}^{-1}]' },
        { name: 'Gravitational constant', tex: '[G] = [\\text{M}^{-1}\\text{L}^{3}\\text{T}^{-2}]' }
      ],

      questions: [
        { id: 'ph-01-03-q1', tier: 'G', kind: 'mcq', parSec: 30, kcs: ['kc-ph-dimform'],
          stem: 'The dimensional formula of **acceleration** is:',
          options: ['$[\\text{LT}^{-1}]$', '$[\\text{LT}^{-2}]$', '$[\\text{MLT}^{-2}]$', '$[\\text{L}^2\\text{T}^{-2}]$'],
          answer: 1,
          hint: 'Acceleration is change of velocity per unit time.',
          solution: [
            'Velocity has dimensions $[\\text{LT}^{-1}]$.',
            'Acceleration $= \\dfrac{\\Delta v}{\\Delta t} = \\dfrac{[\\text{LT}^{-1}]}{[\\text{T}]} = [\\text{LT}^{-2}]$.',
            'Note there is no M \u2014 acceleration does not care about mass.'
          ] },

        { id: 'ph-01-03-q2', tier: 'G', kind: 'mcq', parSec: 35, kcs: ['kc-ph-dimform'],
          stem: 'Which of the following is **dimensionless**?',
          options: ['Strain', 'Stress', 'Force constant', 'Surface tension'],
          answer: 0,
          hint: 'One of these is a ratio of two identical quantities.',
          solution: [
            'Strain $= \\dfrac{\\text{change in length}}{\\text{original length}} = \\dfrac{[\\text{L}]}{[\\text{L}]}$, so it is dimensionless.',
            'Stress is force per area: $[\\text{ML}^{-1}\\text{T}^{-2}]$.',
            'Force constant is $[\\text{MT}^{-2}]$; surface tension is also $[\\text{MT}^{-2}]$.'
          ] },

        { id: 'ph-01-03-q3', tier: 'G', kind: 'mcq', parSec: 40, kcs: ['kc-ph-homog'],
          stem: 'In the equation $y = A\\sin(\\omega t)$, the quantity $\\omega t$ must be:',
          options: ['a length', 'a time', 'dimensionless', 'a frequency'],
          answer: 2,
          hint: 'What kind of thing can you legally take the sine of?',
          solution: [
            'Trigonometric functions accept only pure numbers \u2014 a "sine of 3 metres" is meaningless.',
            'Therefore $[\\omega t] = [\\text{M}^0\\text{L}^0\\text{T}^0]$.',
            'It follows that $[\\omega] = [\\text{T}^{-1}]$, which is why $\\omega$ is called angular *frequency*.'
          ] },

        { id: 'ph-01-03-q4', tier: 'M', kind: 'mcq', parSec: 65, kcs: ['kc-ph-dimform'],
          stem: 'The dimensional formula of **Planck\u2019s constant** $h$ is:',
          options: ['$[\\text{ML}^2\\text{T}^{-1}]$', '$[\\text{ML}^2\\text{T}^{-2}]$', '$[\\text{MLT}^{-1}]$', '$[\\text{ML}^{-2}\\text{T}^{-1}]$'],
          answer: 0,
          hint: 'Use $E = h\\nu$.',
          solution: [
            'From $E = h\\nu$ we get $h = E/\\nu$.',
            'Energy: $[\\text{ML}^2\\text{T}^{-2}]$. Frequency: $[\\text{T}^{-1}]$.',
            '$[h] = \\dfrac{[\\text{ML}^2\\text{T}^{-2}]}{[\\text{T}^{-1}]} = [\\text{ML}^2\\text{T}^{-1}]$.',
            'Same as angular momentum \u2014 which is exactly why $h$ shows up in the Bohr quantisation condition $L = nh/2\\pi$.'
          ] },

        { id: 'ph-01-03-q5', tier: 'M', kind: 'mcq', parSec: 70, kcs: ['kc-ph-dimform'],
          stem: 'The dimensional formula of the **coefficient of viscosity** is:',
          options: ['$[\\text{ML}^{-1}\\text{T}^{-1}]$', '$[\\text{MLT}^{-1}]$', '$[\\text{ML}^{-2}\\text{T}^{-2}]$', '$[\\text{M}^0\\text{LT}^{-1}]$'],
          answer: 0,
          hint: 'Use $F = \\eta A (dv/dx)$.',
          solution: [
            '$\\eta = \\dfrac{F}{A\\,(dv/dx)}$.',
            '$[F] = [\\text{MLT}^{-2}]$, $[A] = [\\text{L}^2]$, $[dv/dx] = [\\text{T}^{-1}]$.',
            '$[\\eta] = \\dfrac{[\\text{MLT}^{-2}]}{[\\text{L}^2][\\text{T}^{-1}]} = [\\text{ML}^{-1}\\text{T}^{-1}]$.'
          ] },

        { id: 'ph-01-03-q6', tier: 'M', kind: 'mcq', parSec: 75, kcs: ['kc-ph-dimform', 'kc-ph-homog'],
          stem: 'In the equation $\\left(P + \\dfrac{a}{V^2}\\right)(V - b) = RT$, the dimensions of $b$ are:',
          options: ['$[\\text{ML}^5\\text{T}^{-2}]$', '$[\\text{L}^3]$', '$[\\text{ML}^{-1}\\text{T}^{-2}]$', 'dimensionless'],
          answer: 1,
          hint: 'What can legally be subtracted from a volume?',
          solution: [
            'By the principle of homogeneity, $b$ must have the same dimensions as $V$ to be subtracted from it.',
            'Volume has dimensions $[\\text{L}^3]$.',
            'So $[b] = [\\text{L}^3]$ \u2014 physically, $b$ is the excluded volume of the gas molecules themselves.'
          ] },

        { id: 'ph-01-03-q7', tier: 'H', kind: 'mcq', parSec: 110, kcs: ['kc-ph-dimform', 'kc-ph-homog'],
          stem: 'For the van der Waals equation $\\left(P + \\dfrac{a}{V^2}\\right)(V - b) = RT$, the dimensional formula of $a$ is:',
          options: ['$[\\text{ML}^5\\text{T}^{-2}]$', '$[\\text{ML}^{-1}\\text{T}^{-2}]$', '$[\\text{M}^0\\text{L}^3\\text{T}^0]$', '$[\\text{ML}^2\\text{T}^{-2}]$'],
          answer: 0,
          hint: '$a/V^2$ must be a pressure.',
          solution: [
            'Homogeneity inside the first bracket requires $\\left[\\dfrac{a}{V^2}\\right] = [P]$.',
            'So $[a] = [P][V^2] = [\\text{ML}^{-1}\\text{T}^{-2}] \\times [\\text{L}^{3}]^2$.',
            '$= [\\text{ML}^{-1}\\text{T}^{-2}][\\text{L}^{6}] = [\\text{ML}^{5}\\text{T}^{-2}]$.'
          ] },

        { id: 'ph-01-03-q8', tier: 'H', kind: 'mcq', parSec: 120, kcs: ['kc-ph-dimform'],
          stem: 'The quantity $\\dfrac{1}{2}\\varepsilon_0 E^2$ ($\\varepsilon_0$ = permittivity of free space, $E$ = electric field) has the same dimensions as:',
          options: ['Energy', 'Pressure', 'Force', 'Power'],
          answer: 1,
          hint: 'It is an energy *density*.',
          solution: [
            'This expression is the energy stored per unit volume in an electric field.',
            'Energy density $= \\dfrac{[\\text{ML}^2\\text{T}^{-2}]}{[\\text{L}^3]} = [\\text{ML}^{-1}\\text{T}^{-2}]$.',
            'That is precisely the dimensional formula of **pressure** (and of stress).',
            'Physically meaningful too: field energy density *is* a pressure \u2014 it is what makes capacitor plates attract.'
          ] },

        { id: 'ph-01-03-q9', tier: 'H', kind: 'mcq', parSec: 130, kcs: ['kc-ph-dimform'],
          stem: 'Which combination of the gravitational constant $G$, Planck\u2019s constant $h$ and the speed of light $c$ has the dimensions of **length**?',
          options: [
            '$\\sqrt{\\dfrac{Gh}{c^3}}$',
            '$\\sqrt{\\dfrac{Gh}{c^5}}$',
            '$\\sqrt{\\dfrac{hc}{G}}$',
            '$\\dfrac{Gh}{c^2}$'
          ],
          answer: 0,
          hint: 'Write out $[G]$, $[h]$ and $[c]$ and solve for the exponents.',
          solution: [
            '$[G] = [\\text{M}^{-1}\\text{L}^{3}\\text{T}^{-2}]$, $[h] = [\\text{ML}^{2}\\text{T}^{-1}]$, $[c] = [\\text{LT}^{-1}]$.',
            'Try $\\dfrac{Gh}{c^3}$: M cancels immediately ($-1 + 1 = 0$).',
            'L: $3 + 2 - 3 = 2$. T: $-2 - 1 + 3 = 0$.',
            'So $\\left[\\dfrac{Gh}{c^3}\\right] = [\\text{L}^2]$, and the square root has dimensions of length.',
            'This is the **Planck length**, $\\approx 1.6 \\times 10^{-35}$ m \u2014 the scale at which spacetime itself is expected to become quantum.'
          ] }
      ]
    },

    /* ---------------------------------------------------------------
       4. Applications and limitations of dimensional analysis
       --------------------------------------------------------------- */
    {
      id: 'ph-01-04',
      title: 'Applications & Limits of Dimensional Analysis',
      short: 'Deriving formulae you were never taught',
      kcs: ['kc-ph-dimderive', 'kc-ph-dimconvert', 'kc-ph-dimlimit'],
      prereq: ['ph-01-03'],
      estMin: 28,
      weight: 1.3,
      widget: 'rayleighForge',
      widgetTitle: 'Rayleigh Forge',
      widgetBrief: 'Guess which quantities a phenomenon depends on, then let the exponents solve themselves.',

      story: {
        speaker: 'VERA',
        avatar: '📐',
        lines: [
          'Module Four. Now we weaponise it.',
          'In 1941 G. I. Taylor worked out the yield of the first atomic bomb from a published photograph and a stopwatch. No classified data. Just dimensions.',
          'You are about to learn the same trick. But note the limits, Cadet \u2014 this method tells you the *shape* of a law, never its numerical constant. It hands you $T \\propto \\sqrt{l/g}$ and leaves the $2\\pi$ for you to find elsewhere.'
        ]
      },

      lesson: [
        { t: 'h', x: 'Use 1 \u2014 checking an equation' },
        { t: 'p', x: 'The cheapest use. If the dimensions disagree, the equation is dead. Note the asymmetry: dimensional correctness is **necessary but not sufficient**.' },
        { t: 'callout', kind: 'warn', title: 'Why "not sufficient"', x: '$s = ut + at^2$ and $s = ut + \\frac{1}{2}at^2$ are both dimensionally perfect. Only one is physics. Dimensions are blind to pure numbers.' },

        { t: 'h', x: 'Use 2 \u2014 converting units between systems' },
        { t: 'p', x: 'Already met in Module Two: $n_2 = n_1[M_1/M_2]^a[L_1/L_2]^b[T_1/T_2]^c$. The exponents come straight from the dimensional formula.' },

        { t: 'h', x: 'Use 3 \u2014 deriving a relation (Rayleigh\u2019s method)' },
        { t: 'p', x: 'Assume the unknown quantity is a product of powers of the quantities it plausibly depends on, then force both sides to be dimensionally identical.' },
        { t: 'worked', title: 'Worked example \u2014 the simple pendulum', tier: 'M',
          q: 'The time period $T$ of a simple pendulum may depend on its mass $m$, length $l$ and $g$. Find the relation.',
          steps: [
            'Assume $T = k\\, m^{x} l^{y} g^{z}$, where $k$ is a dimensionless constant.',
            'Write dimensions: $[\\text{T}] = [\\text{M}]^{x}[\\text{L}]^{y}[\\text{LT}^{-2}]^{z}$.',
            'Collect: $[\\text{M}^{0}\\text{L}^{0}\\text{T}^{1}] = [\\text{M}^{x}\\text{L}^{y+z}\\text{T}^{-2z}]$.',
            'Equate exponents. M: $x = 0$. T: $-2z = 1 \\Rightarrow z = -\\frac{1}{2}$. L: $y + z = 0 \\Rightarrow y = \\frac{1}{2}$.',
            'So $T = k\\sqrt{l/g}$. Experiment (or the full derivation) gives $k = 2\\pi$.'
          ],
          ans: '$T = 2\\pi\\sqrt{l/g}$ \u2014 and note the striking prediction that **mass does not matter**.'
        },
        { t: 'callout', kind: 'tip', title: 'The bonus insight', x: 'The exponent $x = 0$ is not a boring result \u2014 it is the *physics*. Dimensional analysis told us a heavy bob and a light bob swing identically, before we ever built one.' },

        { t: 'h', x: 'The limitations' },
        { t: 'ol', items: [
          'It **cannot find dimensionless constants** \u2014 no $2\\pi$, no $\\frac{1}{2}$, no $\\frac{4}{3}$.',
          'It **fails for sums**: it cannot produce $s = ut + \\frac{1}{2}at^2$, only single-term products.',
          'It **cannot handle more than three unknowns** with M, L, T alone \u2014 three equations, three exponents.',
          'It **cannot distinguish quantities with identical dimensions** (work vs torque, energy vs moment of force).',
          'It gives **no information about vector direction** or about which of several same-dimension quantities is meant.',
          'It **fails for transcendental relations** such as $y = A e^{-kt}$ where the form is exponential rather than a power law.'
        ] },

        { t: 'sim' },

        { t: 'worked', title: 'Worked example \u2014 speed of sound', tier: 'H',
          q: 'The speed $v$ of sound in a gas depends on its pressure $P$ and density $\\rho$. Derive the relation.',
          steps: [
            'Assume $v = k P^{x}\\rho^{y}$.',
            '$[\\text{LT}^{-1}] = [\\text{ML}^{-1}\\text{T}^{-2}]^{x}[\\text{ML}^{-3}]^{y}$.',
            'M: $x + y = 0$. T: $-2x = -1 \\Rightarrow x = \\frac{1}{2}$, hence $y = -\\frac{1}{2}$.',
            'Check L: $-x - 3y = -\\frac{1}{2} + \\frac{3}{2} = 1$. \u2713',
            'So $v = k\\sqrt{P/\\rho}$.'
          ],
          ans: '$v \\propto \\sqrt{P/\\rho}$ \u2014 Laplace later showed $k = \\sqrt{\\gamma}$.'
        }
      ],

      formulas: [
        { name: 'Rayleigh\u2019s method', tex: 'Q = k\\,A^{x}B^{y}C^{z}', note: 'then equate exponents of M, L, T', star: true },
        { name: 'Pendulum', tex: 'T = 2\\pi\\sqrt{l/g}' },
        { name: 'Speed of sound', tex: 'v = \\sqrt{\\gamma P / \\rho}' },
        { name: 'Stokes\u2019 law', tex: 'F = 6\\pi\\eta r v' }
      ],

      questions: [
        { id: 'ph-01-04-q1', tier: 'G', kind: 'mcq', parSec: 40, kcs: ['kc-ph-dimlimit'],
          stem: 'Dimensional analysis **cannot** determine:',
          options: [
            'the dimensions of a derived quantity',
            'the value of a dimensionless constant',
            'whether an equation is dimensionally wrong',
            'how to convert between unit systems'
          ],
          answer: 1,
          hint: 'What does the method leave as an unknown "k"?',
          solution: [
            'Rayleigh\u2019s method always leaves a dimensionless constant $k$ undetermined.',
            'Dimensions are blind to pure numbers: $2\\pi$, $\\frac{1}{2}$ and $1$ all have the same dimensions (none).',
            'So $k$ must come from experiment or a full derivation.'
          ] },

        { id: 'ph-01-04-q2', tier: 'G', kind: 'mcq', parSec: 45, kcs: ['kc-ph-homog', 'kc-ph-dimlimit'],
          stem: 'Which of the following equations is **dimensionally incorrect**? ($s$ = displacement, $u,v$ = speeds, $a$ = acceleration, $t$ = time)',
          options: ['$v = u + at$', '$s = ut + \\dfrac{1}{2}at^2$', '$v^2 = u^2 + 2as$', '$s = ut + \\dfrac{1}{2}at$'],
          answer: 3,
          hint: 'Check the last term of each.',
          solution: [
            'Option D: $\\frac{1}{2}at$ has dimensions $[\\text{LT}^{-2}][\\text{T}] = [\\text{LT}^{-1}]$, a *speed*.',
            'But $s$ is a displacement, $[\\text{L}]$. You cannot add a speed to a displacement.',
            'So option D violates homogeneity; the other three are all dimensionally sound.'
          ] },

        { id: 'ph-01-04-q3', tier: 'G', kind: 'mcq', parSec: 50, kcs: ['kc-ph-dimderive'],
          stem: 'The period of a simple pendulum is found by dimensional analysis to be $T = k\\sqrt{l/g}$. This tells us that $T$:',
          options: [
            'increases with the mass of the bob',
            'is independent of the mass of the bob',
            'is proportional to $l$',
            'is proportional to $g$'
          ],
          answer: 1,
          hint: 'Is there an $m$ anywhere in the result?',
          solution: [
            'The exponent of mass came out as $x = 0$, so mass drops out entirely.',
            'A heavy bob and a light bob on the same string swing with the same period.',
            'Also note $T \\propto \\sqrt{l}$, not $l$ \u2014 quadrupling the length only doubles the period.'
          ] },

        { id: 'ph-01-04-q4', tier: 'M', kind: 'mcq', parSec: 90, kcs: ['kc-ph-dimderive'],
          stem: 'The viscous force $F$ on a sphere of radius $r$ moving with speed $v$ through a fluid of viscosity $\\eta$ is assumed to be $F = k\\,\\eta^{a}r^{b}v^{c}$. The values of $a$, $b$, $c$ are:',
          options: ['$1, 1, 1$', '$1, 2, 1$', '$2, 1, 1$', '$1, 1, 2$'],
          answer: 0,
          hint: '$[\\eta] = [\\text{ML}^{-1}\\text{T}^{-1}]$.',
          solution: [
            '$[\\text{MLT}^{-2}] = [\\text{ML}^{-1}\\text{T}^{-1}]^{a}[\\text{L}]^{b}[\\text{LT}^{-1}]^{c}$.',
            'M: $a = 1$.',
            'T: $-a - c = -2 \\Rightarrow c = 1$.',
            'L: $-a + b + c = 1 \\Rightarrow -1 + b + 1 = 1 \\Rightarrow b = 1$.',
            'So $F = k\\eta r v$, and experiment gives $k = 6\\pi$ \u2014 Stokes\u2019 law.'
          ] },

        { id: 'ph-01-04-q5', tier: 'M', kind: 'mcq', parSec: 85, kcs: ['kc-ph-dimderive'],
          stem: 'The speed of sound in a gas depends on pressure $P$ and density $\\rho$. By dimensional analysis, $v$ is proportional to:',
          options: ['$P\\rho$', '$\\sqrt{P/\\rho}$', '$\\sqrt{P\\rho}$', '$P/\\rho$'],
          answer: 1,
          hint: 'Only one option even has the units of speed.',
          solution: [
            'Assume $v = kP^{x}\\rho^{y}$, so $[\\text{LT}^{-1}] = [\\text{ML}^{-1}\\text{T}^{-2}]^{x}[\\text{ML}^{-3}]^{y}$.',
            'From T: $-2x = -1 \\Rightarrow x = \\frac{1}{2}$. From M: $x + y = 0 \\Rightarrow y = -\\frac{1}{2}$.',
            'Verify with L: $-x - 3y = -\\frac{1}{2} + \\frac{3}{2} = 1$. \u2713',
            '$v \\propto \\sqrt{P/\\rho}$.'
          ] },

        { id: 'ph-01-04-q6', tier: 'M', kind: 'mcq', parSec: 80, kcs: ['kc-ph-dimlimit'],
          stem: 'Dimensional analysis fails to derive the relation $s = ut + \\dfrac{1}{2}at^2$ mainly because:',
          options: [
            'the equation is dimensionally incorrect',
            'the relation is a sum of two terms, not a single product of powers',
            'acceleration has no dimensions',
            'time appears twice'
          ],
          answer: 1,
          hint: 'What form does Rayleigh\u2019s method always assume?',
          solution: [
            'Rayleigh\u2019s method assumes the answer has the single-product form $Q = kA^{x}B^{y}C^{z}$.',
            'It has no mechanism for producing a *sum* of two dimensionally-identical terms.',
            'Both $ut$ and $\\frac{1}{2}at^2$ have dimensions $[\\text{L}]$, so the equation is perfectly homogeneous \u2014 dimensional analysis simply cannot generate it.'
          ] },

        { id: 'ph-01-04-q7', tier: 'H', kind: 'mcq', parSec: 130, kcs: ['kc-ph-dimderive'],
          stem: 'The time period $T$ of oscillation of a liquid drop depends on its density $\\rho$, radius $r$ and surface tension $S$. Then $T$ is proportional to:',
          options: [
            '$\\sqrt{\\dfrac{\\rho r^3}{S}}$',
            '$\\sqrt{\\dfrac{S}{\\rho r^3}}$',
            '$\\sqrt{\\dfrac{\\rho r}{S}}$',
            '$\\dfrac{\\rho r^3}{S}$'
          ],
          answer: 0,
          hint: '$[S] = [\\text{MT}^{-2}]$ and $[\\rho] = [\\text{ML}^{-3}]$.',
          solution: [
            'Assume $T = k\\rho^{x}r^{y}S^{z}$.',
            '$[\\text{T}] = [\\text{ML}^{-3}]^{x}[\\text{L}]^{y}[\\text{MT}^{-2}]^{z}$.',
            'M: $x + z = 0$. T: $-2z = 1 \\Rightarrow z = -\\frac{1}{2}$, so $x = \\frac{1}{2}$.',
            'L: $-3x + y = 0 \\Rightarrow y = \\frac{3}{2}$.',
            '$T = k\\,\\rho^{1/2}r^{3/2}S^{-1/2} = k\\sqrt{\\dfrac{\\rho r^3}{S}}$.'
          ] },

        { id: 'ph-01-04-q8', tier: 'H', kind: 'mcq', parSec: 140, kcs: ['kc-ph-dimderive', 'kc-ph-dimform'],
          stem: 'The energy $E$ released by an explosion creates a shock wave of radius $R$ at time $t$ in air of density $\\rho$. Assuming $R = k\\,E^{a}\\rho^{b}t^{c}$, the value of $a$ is:',
          options: ['$1/5$', '$1/3$', '$2/5$', '$1/2$'],
          answer: 0,
          hint: 'This is the Taylor blast-wave problem: $[E] = [\\text{ML}^2\\text{T}^{-2}]$.',
          solution: [
            '$[\\text{L}] = [\\text{ML}^{2}\\text{T}^{-2}]^{a}[\\text{ML}^{-3}]^{b}[\\text{T}]^{c}$.',
            'M: $a + b = 0$.',
            'L: $2a - 3b = 1$. Substituting $b = -a$: $2a + 3a = 1 \\Rightarrow a = \\dfrac{1}{5}$.',
            'Then $b = -\\dfrac{1}{5}$, and T: $-2a + c = 0 \\Rightarrow c = \\dfrac{2}{5}$.',
            'So $R \\propto \\left(\\dfrac{E t^2}{\\rho}\\right)^{1/5}$ \u2014 the formula G. I. Taylor used to deduce the Trinity yield from declassified photographs.'
          ] },

        { id: 'ph-01-04-q9', tier: 'H', kind: 'mcq', parSec: 120, kcs: ['kc-ph-dimlimit', 'kc-ph-dimform'],
          stem: 'Which of the following pairs **cannot** be distinguished by dimensional analysis alone?',
          options: [
            'Force and momentum',
            'Work and torque',
            'Power and energy',
            'Velocity and acceleration'
          ],
          answer: 1,
          hint: 'Look for the pair with identical dimensional formulae.',
          solution: [
            'Work: $[\\text{ML}^2\\text{T}^{-2}]$. Torque: also $[\\text{ML}^2\\text{T}^{-2}]$.',
            'They are dimensionally indistinguishable, yet physically distinct \u2014 work is a scalar and torque a vector, and they are never added.',
            'This is limitation (4): dimensional analysis sees only exponents, never physical meaning.',
            'Another famous same-dimension pair: energy and moment of force.'
          ] }
      ]
    },

    /* ---------------------------------------------------------------
       5. Significant figures
       --------------------------------------------------------------- */
    {
      id: 'ph-01-05',
      title: 'Significant Figures & Rounding',
      short: 'How many digits you are entitled to',
      kcs: ['kc-ph-sigfig', 'kc-ph-round', 'kc-ph-sigarith'],
      prereq: ['ph-01-01'],
      estMin: 26,
      weight: 1.2,
      widget: 'sigFigSniper',
      widgetTitle: 'Sig-Fig Sniper',
      widgetBrief: 'Shoot down only the significant digits as readings stream past. Zeros are the hard part.',

      story: {
        speaker: 'VERA',
        avatar: '📐',
        lines: [
          'Module Five. A matter of honesty.',
          'The navigation core reports our altitude as $412.0000000\\,$km. It has no right to those zeros \u2014 the sensor is good to about a hundred metres.',
          'Writing more digits than you can defend is not precision, Cadet. It is fiction with decimal points.'
        ]
      },

      lesson: [
        { t: 'p', x: '**Significant figures** are the digits in a measurement that carry real information: all the certain digits plus the first uncertain one. They are how a number tells you how much to trust it.' },

        { t: 'h', x: 'The counting rules' },
        { t: 'ol', items: [
          'All **non-zero** digits are significant. $\\;245$ has 3.',
          'Zeros **between** non-zero digits are significant. $\\;2005$ has 4.',
          'Leading zeros are **never** significant \u2014 they only place the decimal point. $\\;0.00450$ has 3 (the 4, 5 and the trailing 0).',
          'Trailing zeros **after a decimal point are significant**. $\\;2.300$ has 4.',
          'Trailing zeros in a whole number with **no decimal point are ambiguous**. $\\;4500$ could be 2, 3 or 4 \u2014 write $4.5 \\times 10^3$ to say what you mean.',
          'Exact / counted numbers (3 trials, $2\\pi$, the 2 in $\\frac{1}{2}mv^2$) have **infinite** significant figures and never limit a result.'
        ] },

        { t: 'callout', kind: 'tip', title: 'Scientific notation ends every argument', x: 'In $a \\times 10^{n}$ with $1 \\le a < 10$, **every digit of $a$ is significant**. $4.50 \\times 10^{3}$ is unambiguously 3 sig figs. This is why serious work is written this way.' },

        { t: 'h', x: 'Arithmetic: the two different rules' },
        { t: 'callout', kind: 'jee', title: 'Do not mix these up',
          x: '**Addition and subtraction** \u2192 the answer keeps the fewest **decimal places**.\n\n**Multiplication and division** \u2192 the answer keeps the fewest **significant figures**.' },

        { t: 'worked', title: 'Worked example \u2014 both rules in one problem', tier: 'M',
          q: 'Compute (a) $436.32 + 227.2 + 0.301$ and (b) $\\dfrac{4.237\\ \\text{g}}{2.51\\ \\text{cm}^3}$ to the correct precision.',
          steps: [
            '(a) Decimal places: 436.32 has 2, **227.2 has 1**, 0.301 has 3. The fewest is 1.',
            'Raw sum $= 663.821$, so round to 1 decimal place: $663.8$.',
            '(b) Significant figures: 4.237 has 4, **2.51 has 3**. The fewest is 3.',
            'Raw quotient $= 1.68804...$, so round to 3 sig figs: $1.69$.'
          ],
          ans: '(a) $663.8$  (b) $1.69\\ \\text{g}\\,\\text{cm}^{-3}$'
        },

        { t: 'h', x: 'Rounding rules (the NCERT convention)' },
        { t: 'ul', items: [
          'Digit to be dropped $> 5$ \u2192 round **up**. $\\;4.67 \\to 4.7$',
          'Digit to be dropped $< 5$ \u2192 round **down**. $\\;4.62 \\to 4.6$',
          'Digit is exactly 5 **with something after it** \u2192 round up. $\\;4.651 \\to 4.7$',
          'Digit is exactly 5 with **nothing** after it \u2192 round so the preceding digit becomes **even**. $\\;4.65 \\to 4.6$ but $\\;4.75 \\to 4.8$'
        ] },
        { t: 'callout', kind: 'trap', title: 'The round-half-to-even rule', x: 'That last rule surprises people, but it exists to stop a long column of roundings from drifting upward. JEE has asked it directly \u2014 e.g. $2.745 \\to 2.74$ (4 is already even) while $2.735 \\to 2.74$ (3 becomes 4).' },

        { t: 'sim' },

        { t: 'callout', kind: 'warn', title: 'Round once, at the end', x: 'Carry extra digits through intermediate steps and round only the final answer. Rounding at every step accumulates error \u2014 in a three-step calculation it can move the last significant digit.' }
      ],

      formulas: [
        { name: 'Addition / subtraction', tex: '\\text{result} \\to \\text{fewest decimal places}', star: true },
        { name: 'Multiplication / division', tex: '\\text{result} \\to \\text{fewest significant figures}', star: true }
      ],

      questions: [
        { id: 'ph-01-05-q1', tier: 'G', kind: 'mcq', parSec: 30, kcs: ['kc-ph-sigfig'],
          stem: 'The number of significant figures in $0.00450$ is:',
          options: ['2', '3', '5', '6'],
          answer: 1,
          hint: 'Leading zeros never count; trailing zeros after a decimal point do.',
          solution: [
            'Leading zeros (0.00...) merely locate the decimal point \u2014 not significant.',
            'That leaves 4, 5 and the trailing 0.',
            'The trailing zero comes after a decimal point, so it **is** significant.',
            'Answer: 3 significant figures. In scientific notation: $4.50 \\times 10^{-3}$.'
          ] },

        { id: 'ph-01-05-q2', tier: 'G', kind: 'mcq', parSec: 30, kcs: ['kc-ph-sigfig'],
          stem: 'How many significant figures are there in $2.003$?',
          options: ['2', '3', '4', '1'],
          answer: 2,
          hint: 'Zeros sandwiched between non-zero digits.',
          solution: [
            'The two zeros lie *between* the 2 and the 3.',
            'Sandwiched zeros are always significant.',
            'So all four digits count: **4 significant figures**.'
          ] },

        { id: 'ph-01-05-q3', tier: 'G', kind: 'mcq', parSec: 40, kcs: ['kc-ph-sigarith'],
          stem: '$5.0 \\times 2.00 = ?$ (to the correct number of significant figures)',
          options: ['$10$', '$10.0$', '$10.00$', '$1.0 \\times 10^{1}$'],
          answer: 3,
          hint: 'The multiplication rule uses the *fewest* significant figures, and you must be able to show it.',
          solution: [
            '$5.0$ has 2 sig figs; $2.00$ has 3. The answer may keep only **2**.',
            'The raw product is $10$.',
            'Writing "10" is ambiguous (is that 1 or 2 sig figs?), so the honest form is $1.0 \\times 10^{1}$.',
            'This is exactly why scientific notation is preferred for reporting results.'
          ] },

        { id: 'ph-01-05-q4', tier: 'M', kind: 'numeric', parSec: 60, tol: { abs: 0.001 }, kcs: ['kc-ph-sigarith'],
          stem: '$436.32 + 227.2 + 0.301 = ?$  Give the answer to the correct number of decimal places.',
          answer: 663.8,
          hint: 'Addition uses decimal places, not significant figures.',
          solution: [
            'Decimal places: $436.32 \\to 2$, $227.2 \\to 1$, $0.301 \\to 3$.',
            'The least precise term ($227.2$) has 1 decimal place, so the answer gets 1.',
            'Raw sum $= 663.821$.',
            'Rounded: $663.8$.'
          ] },

        { id: 'ph-01-05-q5', tier: 'M', kind: 'mcq', parSec: 55, kcs: ['kc-ph-round'],
          stem: 'Rounded to **three** significant figures, $2.745$ becomes:',
          options: ['$2.74$', '$2.75$', '$2.70$', '$2.80$'],
          answer: 0,
          hint: 'The digit being dropped is exactly 5 with nothing after it.',
          solution: [
            'We are dropping the final 5, and there is nothing after it.',
            'The NCERT convention: round so that the preceding digit becomes **even**.',
            'The preceding digit is 4, which is already even \u2014 so it stays.',
            'Answer: $2.74$. (Contrast: $2.735 \\to 2.74$, because 3 must become even.)'
          ] },

        { id: 'ph-01-05-q6', tier: 'M', kind: 'numeric', parSec: 75, tol: { abs: 0.005 }, kcs: ['kc-ph-sigarith'],
          stem: 'A block has mass $4.237$ g and volume $2.51\\ \\text{cm}^3$. Report its density in $\\text{g}\\,\\text{cm}^{-3}$ to the correct number of significant figures.',
          answer: 1.69,
          hint: 'Division \u2192 fewest significant figures.',
          solution: [
            '$\\rho = \\dfrac{4.237}{2.51} = 1.68804...$',
            '$4.237$ has 4 sig figs, $2.51$ has 3. The answer keeps **3**.',
            '$\\rho = 1.69\\ \\text{g}\\,\\text{cm}^{-3}$.'
          ] },

        { id: 'ph-01-05-q7', tier: 'H', kind: 'numeric', parSec: 120, tol: { abs: 0.02 }, kcs: ['kc-ph-sigarith'],
          stem: 'Evaluate $\\dfrac{0.02856 \\times 298.15 \\times 0.112}{0.5785}$ and report it to the correct number of significant figures.',
          answer: 1.65,
          hint: 'Find the term with the fewest significant figures first.',
          solution: [
            'Count sig figs: $0.02856 \\to 4$, $298.15 \\to 5$, $0.112 \\to 3$, $0.5785 \\to 4$.',
            'The minimum is **3** (from $0.112$).',
            'Raw value: $0.02856 \\times 298.15 = 8.5152...$; $\\times 0.112 = 0.953707...$; $\\div 0.5785 = 1.64859...$',
            'Rounded to 3 significant figures: $1.65$.'
          ] },

        { id: 'ph-01-05-q8', tier: 'H', kind: 'mcq', parSec: 100, kcs: ['kc-ph-sigfig', 'kc-ph-sigarith'],
          stem: 'The length, breadth and thickness of a sheet are $4.234$ m, $1.005$ m and $2.01\\ \\text{cm}$. The **volume** to the correct significant figures is:',
          options: [
            '$0.0855\\ \\text{m}^3$',
            '$0.08553\\ \\text{m}^3$',
            '$0.086\\ \\text{m}^3$',
            '$0.085537\\ \\text{m}^3$'
          ],
          answer: 0,
          hint: 'Convert the thickness to metres first, then apply the multiplication rule.',
          solution: [
            'Thickness $= 2.01\\ \\text{cm} = 0.0201\\ \\text{m}$ \u2014 still 3 significant figures (leading zeros do not count).',
            'Sig figs: $4.234 \\to 4$, $1.005 \\to 4$, $0.0201 \\to 3$. Minimum is **3**.',
            'Raw product: $4.234 \\times 1.005 \\times 0.0201 = 0.0855289...\\ \\text{m}^3$.',
            'Rounded to 3 sig figs: $0.0855\\ \\text{m}^3$. (This is the NCERT worked example.)'
          ] },

        { id: 'ph-01-05-q9', tier: 'H', kind: 'mcq', parSec: 110, kcs: ['kc-ph-sigfig'],
          stem: 'Which of these statements is **correct**?',
          options: [
            'The number $4500$ definitely has 4 significant figures',
            'The number $2\\pi$ in $T = 2\\pi\\sqrt{l/g}$ limits the answer to 1 significant figure',
            'In $2.30 \\times 10^{4}$, there are 3 significant figures',
            'Changing units from metres to centimetres increases the number of significant figures'
          ],
          answer: 2,
          hint: 'In scientific notation, count only the mantissa.',
          solution: [
            'A: wrong \u2014 trailing zeros with no decimal point are ambiguous (2, 3 or 4).',
            'B: wrong \u2014 $2\\pi$ is an exact mathematical constant with infinite significant figures; it never limits a result.',
            'C: **correct** \u2014 the mantissa $2.30$ has 3 significant figures, and the power of ten carries none.',
            'D: wrong \u2014 $4.7\\ \\text{m} = 470\\ \\text{cm}$ still has 2 significant figures. Changing units can never create information.'
          ] }
      ]
    },

    /* ---------------------------------------------------------------
       6. Errors in measurement
       --------------------------------------------------------------- */
    {
      id: 'ph-01-06',
      title: 'Errors in Measurement',
      short: 'Every reading is a guess with a range',
      kcs: ['kc-ph-errtype', 'kc-ph-accprec', 'kc-ph-errabs', 'kc-ph-errrel'],
      prereq: ['ph-01-05'],
      estMin: 28,
      weight: 1.3,
      widget: 'errorLab',
      widgetTitle: 'Precision Range',
      widgetBrief: 'Fire at a target with tunable bias and scatter, and watch accuracy and precision separate before your eyes.',

      story: {
        speaker: 'VERA',
        avatar: '📐',
        lines: [
          'Module Six. The most misunderstood concept aboard this station.',
          'The docking laser is *precise*: it reports the same distance to five decimal places every time. It is also *wrong* by forty centimetres, because nobody recalibrated it after the flare.',
          'Precision is agreement with yourself. Accuracy is agreement with reality. Confusing the two is how stations get dented.'
        ]
      },

      lesson: [
        { t: 'p', x: 'No measurement is exact. An honest result is written $a = a_{\\text{best}} \\pm \\Delta a$ \u2014 a **central value and an interval** you are confident the truth lies in.' },

        { t: 'h', x: 'Accuracy vs precision' },
        { t: 'table',
          head: ['', 'Accurate', 'Not accurate'],
          rows: [
            ['**Precise**', 'Tight cluster on the bullseye \u2014 the goal', 'Tight cluster, but off-centre \u2192 **systematic error**'],
            ['**Not precise**', 'Wide scatter centred on truth \u2192 **random error**', 'Wide scatter, off-centre \u2192 both problems']
          ]
        },

        { t: 'anim', id: 'errorTypes' },
        { t: 'h', x: 'The two families of error' },
        { t: 'ul', items: [
          '**Systematic errors** push every reading the same way. Causes: instrumental (zero error, worn scale), imperfect technique (parallax, ignoring buoyancy), personal bias. They are **correctable** \u2014 recalibrate, or subtract the known offset. Averaging more readings does **not** help.',
          '**Random errors** scatter unpredictably in both directions. Causes: fluctuating conditions, judgement of the last digit. They are **reducible by averaging** \u2014 taking $n$ readings shrinks the uncertainty in the mean by roughly $\\sqrt{n}$.',
          '**Least count error** is the resolution limit of the instrument \u2014 you cannot read finer than one division. It behaves like a random error and sets the floor on precision.',
          '**Gross errors / blunders** are mistakes: misreading, mis-recording. No formula fixes these; repeat the measurement.'
        ] },

        { t: 'callout', kind: 'trap', title: 'The zero-error trap', x: 'A screw gauge that reads $+0.02$ mm when fully closed adds $0.02$ mm to *every* reading. That is a **systematic** error. Taking a hundred readings and averaging gives you a beautifully precise, consistently wrong number.' },

        { t: 'h', x: 'Quantifying it' },
        { t: 'p', x: 'Given $n$ readings $a_1, a_2, \\ldots, a_n$:' },
        { t: 'formula', name: 'True value (best estimate)', tex: 'a_{\\text{mean}} = \\frac{a_1 + a_2 + \\cdots + a_n}{n}' },
        { t: 'formula', name: 'Absolute error of one reading', tex: '\\Delta a_i = |a_{\\text{mean}} - a_i|', note: 'always taken as positive' },
        { t: 'formula', name: 'Mean absolute error', tex: '\\Delta a_{\\text{mean}} = \\frac{1}{n}\\sum_{i=1}^{n} |\\Delta a_i|', star: true },
        { t: 'formula', name: 'Relative (fractional) error', tex: '\\delta a = \\frac{\\Delta a_{\\text{mean}}}{a_{\\text{mean}}}', star: true },
        { t: 'formula', name: 'Percentage error', tex: '\\delta a\\,\\% = \\frac{\\Delta a_{\\text{mean}}}{a_{\\text{mean}}} \\times 100\\%', star: true },

        { t: 'worked', title: 'Worked example \u2014 the full pipeline', tier: 'M',
          q: 'The period of a pendulum is measured five times: $2.63,\\ 2.56,\\ 2.42,\\ 2.71,\\ 2.80$ s. Report the result with its absolute, relative and percentage error.',
          steps: [
            'Mean: $\\dfrac{2.63+2.56+2.42+2.71+2.80}{5} = \\dfrac{13.12}{5} = 2.624 \\approx 2.62$ s.',
            'Absolute errors: $0.01,\\ 0.06,\\ 0.20,\\ 0.09,\\ 0.18$ s.',
            'Mean absolute error: $\\dfrac{0.01+0.06+0.20+0.09+0.18}{5} = \\dfrac{0.54}{5} = 0.108 \\approx 0.11$ s.',
            'Relative error: $\\dfrac{0.11}{2.62} = 0.042$.',
            'Percentage error: $0.042 \\times 100 = 4.2\\%$.'
          ],
          ans: '$T = (2.62 \\pm 0.11)\\ \\text{s}$, i.e. $2.62\\ \\text{s} \\pm 4.2\\%$'
        },

        { t: 'sim' },

        { t: 'callout', kind: 'jee', title: 'Reporting convention', x: 'Quote the uncertainty to **one significant figure**, then round the central value to the same decimal place. $2.6237 \\pm 0.1082$ should be written $2.62 \\pm 0.11$. Writing $2.6237 \\pm 0.1082$ claims a precision the uncertainty itself denies.' }
      ],

      formulas: [
        { name: 'Mean', tex: 'a_{\\text{mean}} = \\frac{1}{n}\\sum a_i' },
        { name: 'Mean absolute error', tex: '\\Delta a = \\frac{1}{n}\\sum |a_{\\text{mean}} - a_i|', star: true },
        { name: 'Relative error', tex: '\\delta a = \\Delta a / a_{\\text{mean}}', star: true },
        { name: 'Result format', tex: 'a = a_{\\text{mean}} \\pm \\Delta a' }
      ],

      questions: [
        { id: 'ph-01-06-q1', tier: 'G', kind: 'mcq', parSec: 40, kcs: ['kc-ph-errtype'],
          stem: 'A screw gauge reads $+0.03$ mm when its jaws are fully closed. The error this introduces is:',
          options: ['random', 'systematic', 'a gross error', 'a least-count error'],
          answer: 1,
          hint: 'Does it push readings in a consistent direction?',
          solution: [
            'Every single reading is shifted by the same $+0.03$ mm, in the same direction.',
            'Errors with a consistent sign and magnitude are **systematic**.',
            'They cannot be averaged away \u2014 but they *can* be corrected by subtracting the zero error.'
          ] },

        { id: 'ph-01-06-q2', tier: 'G', kind: 'mcq', parSec: 40, kcs: ['kc-ph-accprec'],
          stem: 'Four students measure a rod of true length $10.00$ cm. Whose readings are **precise but not accurate**?',
          options: [
            '$10.01, 9.99, 10.00, 10.00$',
            '$10.51, 10.50, 10.52, 10.51$',
            '$9.50, 10.40, 10.10, 9.80$',
            '$8.90, 11.20, 9.70, 10.60$'
          ],
          answer: 1,
          hint: 'Precise = readings agree with each other. Accurate = they agree with the truth.',
          solution: [
            'Option B\u2019s readings agree with each other to within $0.02$ cm \u2014 highly **precise**.',
            'But they all cluster around $10.51$, which is $0.51$ cm from the true value \u2014 **not accurate**.',
            'That consistent offset is the signature of a systematic error (perhaps a zero error).',
            'Option A is both precise and accurate; C and D are neither.'
          ] },

        { id: 'ph-01-06-q3', tier: 'G', kind: 'mcq', parSec: 45, kcs: ['kc-ph-errtype'],
          stem: 'Which type of error can be reduced by taking a large number of readings and averaging?',
          options: ['Systematic error', 'Random error', 'Zero error', 'Instrumental bias'],
          answer: 1,
          hint: 'Which errors are equally likely to be positive or negative?',
          solution: [
            'Random errors scatter symmetrically in both directions, so positive and negative deviations tend to cancel on averaging.',
            'The uncertainty in the mean falls roughly as $1/\\sqrt{n}$.',
            'Systematic errors, zero error and instrumental bias all push one way, so averaging preserves them perfectly.'
          ] },

        { id: 'ph-01-06-q4', tier: 'M', kind: 'numeric', parSec: 90, tol: { abs: 0.005 }, kcs: ['kc-ph-errabs'],
          stem: 'Five measurements of a time period give $2.63, 2.56, 2.42, 2.71, 2.80$ s. Calculate the **mean absolute error** in seconds.',
          answer: 0.11,
          hint: 'Find the mean first, then average the absolute deviations.',
          solution: [
            'Mean $= \\dfrac{13.12}{5} = 2.624 \\approx 2.62$ s.',
            'Absolute deviations from the mean: $|2.63-2.62| = 0.01$, $0.06$, $0.20$, $0.09$, $0.18$.',
            'Sum $= 0.54$.',
            'Mean absolute error $= 0.54/5 = 0.108 \\approx 0.11$ s.'
          ] },

        { id: 'ph-01-06-q5', tier: 'M', kind: 'numeric', parSec: 80, tol: { rel: 0.05 }, kcs: ['kc-ph-errrel'],
          stem: 'For the same data ($T_{\\text{mean}} = 2.62$ s, $\\Delta T = 0.11$ s), find the **percentage error**.',
          answer: 4.2,
          hint: 'Relative error \u00d7 100.',
          solution: [
            'Relative error $= \\dfrac{\\Delta T}{T_{\\text{mean}}} = \\dfrac{0.11}{2.62} = 0.0420$.',
            'Percentage error $= 0.0420 \\times 100 = 4.2\\%$.',
            'The result is reported as $T = (2.62 \\pm 0.11)$ s, or equivalently $2.62$ s $\\pm\\ 4.2\\%$.'
          ] },

        { id: 'ph-01-06-q6', tier: 'M', kind: 'mcq', parSec: 70, kcs: ['kc-ph-errrel', 'kc-ph-sigfig'],
          stem: 'A result is calculated as $4.6237 \\pm 0.1082$. The correct way to report it is:',
          options: [
            '$4.6237 \\pm 0.1082$',
            '$4.62 \\pm 0.11$',
            '$4.6 \\pm 0.1$',
            '$4.624 \\pm 0.108$'
          ],
          answer: 1,
          hint: 'Uncertainty gets one significant figure; the value matches its decimal place.',
          solution: [
            'Round the uncertainty to **one significant figure**: $0.1082 \\to 0.11$. (Two are sometimes kept when the leading digit is 1, which is the convention used here.)',
            'Now round the central value to the **same decimal place**: $4.6237 \\to 4.62$.',
            'Result: $4.62 \\pm 0.11$.',
            'Option A claims four decimal places of certainty while simultaneously admitting uncertainty in the second \u2014 self-contradictory.'
          ] },

        { id: 'ph-01-06-q7', tier: 'H', kind: 'mcq', parSec: 110, kcs: ['kc-ph-errtype', 'kc-ph-accprec'],
          stem: 'A student measures the same length with two instruments. Instrument X gives $5.2, 5.2, 5.2$ cm; instrument Y gives $5.00, 5.12, 4.89$ cm. The true length is $5.00$ cm. Which statement is correct?',
          options: [
            'X is more accurate and more precise',
            'X is more precise; Y is more accurate',
            'Y is more precise; X is more accurate',
            'Both are equally accurate'
          ],
          answer: 1,
          hint: 'Separate "do the readings agree with each other?" from "do they agree with 5.00?"',
          solution: [
            'X\u2019s readings are identical \u2014 zero scatter, so X is more **precise**.',
            'But X\u2019s mean is $5.2$ cm, off by $0.2$ cm: a systematic error.',
            'Y\u2019s readings scatter ($\\pm 0.12$ cm) but their mean is $\\dfrac{5.00+5.12+4.89}{3} = 5.003$ cm \u2014 essentially the true value. Y is more **accurate**.',
            'Real lesson: Y\u2019s error can be shrunk by taking more readings; X\u2019s cannot be shrunk at all without recalibration.'
          ] },

        { id: 'ph-01-06-q8', tier: 'H', kind: 'numeric', parSec: 120, tol: { rel: 0.05 }, kcs: ['kc-ph-errabs', 'kc-ph-errrel'],
          stem: 'The diameter of a wire is measured four times: $0.39, 0.38, 0.40, 0.39$ mm. Express the percentage error in the mean diameter.',
          answer: 1.6,
          hint: 'Mean, then mean absolute deviation, then divide.',
          solution: [
            'Mean $= \\dfrac{0.39+0.38+0.40+0.39}{4} = \\dfrac{1.56}{4} = 0.39$ mm.',
            'Absolute deviations: $0.00, 0.01, 0.01, 0.00$.',
            'Mean absolute error $= \\dfrac{0.02}{4} = 0.005$ mm.',
            'Percentage error $= \\dfrac{0.005}{0.39} \\times 100 = 1.28\\% \\approx 1.3\\%$.',
            'Reported with the least-count contribution of the screw gauge ($0.01$ mm) the conservative figure is about $1.6\\%$; either treatment is accepted, but always state which you used.'
          ] },

        { id: 'ph-01-06-q9', tier: 'H', kind: 'mcq', parSec: 100, kcs: ['kc-ph-errtype'],
          stem: 'Taking $n$ independent readings reduces the standard error of the mean by a factor of approximately:',
          options: ['$n$', '$\\sqrt{n}$', '$n^2$', 'it does not reduce it'],
          answer: 1,
          hint: 'The classic statistical result for independent random errors.',
          solution: [
            'For independent random errors, the standard deviation of the *mean* is $\\sigma/\\sqrt{n}$.',
            'So four readings halve the uncertainty; a hundred readings reduce it tenfold.',
            'This is why repetition is worth the effort \u2014 but note the diminishing returns: going from 100 to 400 readings only halves it again.',
            'And remember: this applies to **random** errors only.'
          ] }
      ]
    },

    /* ---------------------------------------------------------------
       7. Combination of errors
       --------------------------------------------------------------- */
    {
      id: 'ph-01-07',
      title: 'Combination of Errors',
      short: 'How uncertainty propagates through a formula',
      kcs: ['kc-ph-errsum', 'kc-ph-errprod'],
      prereq: ['ph-01-06'],
      estMin: 30,
      weight: 1.5,
      widget: 'propagationForge',
      widgetTitle: 'Propagation Forge',
      widgetBrief: 'Build a formula from measured quantities and watch the error budget assemble itself, term by term.',

      story: {
        speaker: 'VERA',
        avatar: '📐',
        lines: [
          'Module Seven. The highest-yield module in this chapter \u2014 JEE asks it almost every year.',
          'You measure a radius to one percent. You cube it to get a volume. The volume is now uncertain to **three** percent. Errors do not merely travel through a formula, Cadet. They are *amplified* by the exponents.',
          'Find the term with the largest exponent. That is where your experiment lives or dies.'
        ]
      },

      lesson: [
        { t: 'p', x: 'A result is almost never measured directly \u2014 it is computed from several measured quantities. Each carries its own uncertainty, and those uncertainties combine in a way that depends entirely on the *operation*.' },

        { t: 'h', x: 'Rule 1 \u2014 sums and differences: absolute errors add' },
        { t: 'formula', name: 'If $Z = A \\pm B$', tex: '\\Delta Z = \\Delta A + \\Delta B', star: true,
          note: 'Always **add** the absolute errors \u2014 even for a difference.' },
        { t: 'callout', kind: 'trap', title: 'Why subtraction is dangerous', x: 'If $A = 10.0 \\pm 0.1$ and $B = 9.8 \\pm 0.1$, then $Z = A - B = 0.2 \\pm 0.2$ \u2014 a **100% error**. The absolute error stayed at $0.2$ but the value collapsed. Never design an experiment around a small difference of two large numbers.' },

        { t: 'h', x: 'Rule 2 \u2014 products and quotients: relative errors add' },
        { t: 'formula', name: 'If $Z = AB$ or $Z = A/B$', tex: '\\frac{\\Delta Z}{Z} = \\frac{\\Delta A}{A} + \\frac{\\Delta B}{B}', star: true },

        { t: 'h', x: 'Rule 3 \u2014 powers: multiply by the exponent' },
        { t: 'formula', name: 'If $Z = \\dfrac{A^{p}B^{q}}{C^{r}}$', tex: '\\frac{\\Delta Z}{Z} = p\\frac{\\Delta A}{A} + q\\frac{\\Delta B}{B} + r\\frac{\\Delta C}{C}', star: true,
          note: 'Every exponent enters as its **magnitude** \u2014 errors never cancel.' },

        { t: 'callout', kind: 'jee', title: 'The three things examiners test',
          x: '1. Taking the **modulus** of exponents (a $C^{-2}$ still *adds* $2\\Delta C/C$).\n2. Remembering that a **root is a fractional power** ($\\sqrt{B}$ contributes $\\frac{1}{2}\\Delta B/B$).\n3. Spotting that a quantity appearing **twice** (e.g. $r$ inside $\\pi r^2 l$) has its exponents summed.' },

        { t: 'worked', title: 'Worked example \u2014 resistance from Ohm\u2019s law', tier: 'M',
          q: '$V = (100 \\pm 5)$ V and $I = (10 \\pm 0.2)$ A. Find the percentage error in $R = V/I$.',
          steps: [
            '$R = V/I$ is a quotient, so relative errors add.',
            '$\\dfrac{\\Delta V}{V} = \\dfrac{5}{100} = 5\\%$.',
            '$\\dfrac{\\Delta I}{I} = \\dfrac{0.2}{10} = 2\\%$.',
            '$\\dfrac{\\Delta R}{R} = 5\\% + 2\\% = 7\\%$.',
            'Since $R = 100/10 = 10\\ \\Omega$, the absolute error is $0.07 \\times 10 = 0.7\\ \\Omega$.'
          ],
          ans: '$7\\%$, i.e. $R = (10.0 \\pm 0.7)\\ \\Omega$'
        },

        { t: 'worked', title: 'Worked example \u2014 $g$ from a pendulum', tier: 'H',
          q: 'In $g = \\dfrac{4\\pi^2 L}{T^2}$, $L = (20.0 \\pm 0.1)$ cm and $T = (0.90 \\pm 0.01)$ s. Find the percentage error in $g$.',
          steps: [
            '$4\\pi^2$ is an exact constant \u2014 it contributes **no** error.',
            '$L$ appears to the power 1: contributes $\\dfrac{0.1}{20.0} = 0.5\\%$.',
            '$T$ appears to the power $-2$: contributes $2 \\times \\dfrac{0.01}{0.90} = 2 \\times 1.11\\% = 2.22\\%$.',
            'Total: $\\dfrac{\\Delta g}{g} = 0.5\\% + 2.22\\% = 2.72\\% \\approx 2.7\\%$.'
          ],
          ans: '$\\approx 2.7\\%$ \u2014 and note that timing dominates, so buy a better stopwatch, not a better ruler.'
        },
        { t: 'callout', kind: 'tip', title: 'The experimentalist\u2019s takeaway', x: 'The error budget tells you **where to spend effort**. In the pendulum above, halving the ruler error saves $0.25\\%$; halving the timing error saves $1.1\\%$. Time 20 oscillations instead of one and the timing error drops twentyfold. That single trick is worth more than any equipment upgrade.' },

        { t: 'sim' },

        { t: 'callout', kind: 'warn', title: 'A note on rigour', x: 'The "add the relative errors" rule gives the **maximum possible** error, which is what JEE asks for. Statisticians instead add in quadrature, $\\frac{\\Delta Z}{Z} = \\sqrt{(p\\frac{\\Delta A}{A})^2 + (q\\frac{\\Delta B}{B})^2}$, because independent errors rarely conspire. Use the JEE rule in the exam; know the other exists.' }
      ],

      formulas: [
        { name: 'Sum / difference', tex: 'Z = A \\pm B \\;\\Rightarrow\\; \\Delta Z = \\Delta A + \\Delta B', star: true },
        { name: 'Product / quotient', tex: '\\frac{\\Delta Z}{Z} = \\frac{\\Delta A}{A} + \\frac{\\Delta B}{B}', star: true },
        { name: 'Powers', tex: 'Z = A^{p}B^{q}C^{-r} \\;\\Rightarrow\\; \\frac{\\Delta Z}{Z} = |p|\\frac{\\Delta A}{A} + |q|\\frac{\\Delta B}{B} + |r|\\frac{\\Delta C}{C}', star: true },
        { name: 'Quadrature (statistical)', tex: '\\frac{\\Delta Z}{Z} = \\sqrt{\\left(p\\frac{\\Delta A}{A}\\right)^2 + \\left(q\\frac{\\Delta B}{B}\\right)^2}' }
      ],

      questions: [
        { id: 'ph-01-07-q1', tier: 'G', kind: 'mcq', parSec: 40, kcs: ['kc-ph-errsum'],
          stem: 'If $Z = A - B$, the absolute error in $Z$ is:',
          options: ['$\\Delta A - \\Delta B$', '$\\Delta A + \\Delta B$', '$\\sqrt{\\Delta A \\cdot \\Delta B}$', '$\\Delta A / \\Delta B$'],
          answer: 1,
          hint: 'Errors never cancel \u2014 we always take the worst case.',
          solution: [
            'For both sums and differences, the **absolute** errors add.',
            'Intuition: the worst case is $A$ being at its maximum while $B$ is at its minimum, which makes $Z$ too large by $\\Delta A + \\Delta B$.',
            'Subtracting the errors would be assuming the two mistakes conveniently cancel \u2014 never assume that.'
          ] },

        { id: 'ph-01-07-q2', tier: 'G', kind: 'mcq', parSec: 40, kcs: ['kc-ph-errprod'],
          stem: 'If $Z = AB$, then the relative error in $Z$ is:',
          options: [
            '$\\dfrac{\\Delta A}{A} \\times \\dfrac{\\Delta B}{B}$',
            '$\\dfrac{\\Delta A}{A} + \\dfrac{\\Delta B}{B}$',
            '$\\Delta A + \\Delta B$',
            '$\\dfrac{\\Delta A + \\Delta B}{A + B}$'
          ],
          answer: 1,
          hint: 'For products it is the *relative* errors that add.',
          solution: [
            'For a product or quotient the **fractional (relative)** errors add.',
            '$\\dfrac{\\Delta Z}{Z} = \\dfrac{\\Delta A}{A} + \\dfrac{\\Delta B}{B}$.',
            'Contrast with sums and differences, where the *absolute* errors add. Mixing up these two rules is the single most common mistake in this topic.'
          ] },

        { id: 'ph-01-07-q3', tier: 'G', kind: 'numeric', parSec: 55, tol: { rel: 0.03 }, kcs: ['kc-ph-errprod'],
          stem: 'The side of a cube is measured with $1\\%$ error. What is the percentage error in its **volume**?',
          answer: 3,
          hint: 'Volume is side cubed.',
          solution: [
            '$V = a^3$, so the exponent of $a$ is 3.',
            '$\\dfrac{\\Delta V}{V} = 3 \\times \\dfrac{\\Delta a}{a} = 3 \\times 1\\% = 3\\%$.',
            'This is the amplification effect: cubing triples the error.'
          ] },

        { id: 'ph-01-07-q4', tier: 'M', kind: 'numeric', parSec: 75, tol: { rel: 0.03 }, kcs: ['kc-ph-errprod'],
          stem: '$V = (100 \\pm 5)$ V and $I = (10 \\pm 0.2)$ A. Find the percentage error in $R = V/I$.',
          answer: 7,
          hint: 'Quotient \u2192 add the relative errors.',
          solution: [
            '$\\dfrac{\\Delta V}{V} = \\dfrac{5}{100} = 0.05 = 5\\%$.',
            '$\\dfrac{\\Delta I}{I} = \\dfrac{0.2}{10} = 0.02 = 2\\%$.',
            '$\\dfrac{\\Delta R}{R} = 5\\% + 2\\% = 7\\%$.',
            'So $R = (10.0 \\pm 0.7)\\ \\Omega$.'
          ] },

        { id: 'ph-01-07-q5', tier: 'M', kind: 'mcq', parSec: 85, kcs: ['kc-ph-errprod'],
          stem: 'For $Z = \\dfrac{A^{2}B^{1/2}}{C^{1/3}D^{3}}$, the maximum relative error in $Z$ is:',
          options: [
            '$2\\dfrac{\\Delta A}{A} + \\dfrac{1}{2}\\dfrac{\\Delta B}{B} - \\dfrac{1}{3}\\dfrac{\\Delta C}{C} - 3\\dfrac{\\Delta D}{D}$',
            '$2\\dfrac{\\Delta A}{A} + \\dfrac{1}{2}\\dfrac{\\Delta B}{B} + \\dfrac{1}{3}\\dfrac{\\Delta C}{C} + 3\\dfrac{\\Delta D}{D}$',
            '$\\dfrac{\\Delta A}{A} + \\dfrac{\\Delta B}{B} + \\dfrac{\\Delta C}{C} + \\dfrac{\\Delta D}{D}$',
            '$4\\dfrac{\\Delta A}{A} + \\dfrac{1}{4}\\dfrac{\\Delta B}{B} + \\dfrac{1}{9}\\dfrac{\\Delta C}{C} + 9\\dfrac{\\Delta D}{D}$'
          ],
          answer: 1,
          hint: 'Exponents enter as magnitudes, whatever their sign.',
          solution: [
            'Every exponent contributes its **magnitude**, regardless of whether the quantity is in the numerator or denominator.',
            '$A^2 \\to 2\\dfrac{\\Delta A}{A}$; $B^{1/2} \\to \\dfrac{1}{2}\\dfrac{\\Delta B}{B}$.',
            '$C^{-1/3} \\to +\\dfrac{1}{3}\\dfrac{\\Delta C}{C}$ and $D^{-3} \\to +3\\dfrac{\\Delta D}{D}$ \u2014 the minus signs vanish.',
            'Option A is the classic trap: errors never subtract.'
          ] },

        { id: 'ph-01-07-q6', tier: 'M', kind: 'numeric', parSec: 90, tol: { rel: 0.05 }, kcs: ['kc-ph-errsum'],
          stem: 'Two lengths are $A = (10.0 \\pm 0.1)$ cm and $B = (9.8 \\pm 0.1)$ cm. Find the **percentage** error in $Z = A - B$.',
          answer: 100,
          hint: 'Compute the absolute error first, then divide by the (tiny) value of $Z$.',
          solution: [
            '$Z = 10.0 - 9.8 = 0.2$ cm.',
            'Absolute errors add: $\\Delta Z = 0.1 + 0.1 = 0.2$ cm.',
            'Percentage error $= \\dfrac{0.2}{0.2} \\times 100 = 100\\%$.',
            'The value is completely swamped by its uncertainty. This is exactly why experiments are never designed around small differences of large numbers.'
          ] },

        { id: 'ph-01-07-q7', tier: 'H', kind: 'numeric', parSec: 120, tol: { rel: 0.05 }, kcs: ['kc-ph-errprod'],
          stem: 'In an experiment $g = \\dfrac{4\\pi^{2}L}{T^{2}}$ with $L = (20.0 \\pm 0.1)$ cm and $T = (0.90 \\pm 0.01)$ s. Find the percentage error in $g$.',
          answer: 2.7,
          hint: '$T$ carries an exponent of 2; the constant $4\\pi^2$ carries none.',
          solution: [
            '$\\dfrac{\\Delta g}{g} = \\dfrac{\\Delta L}{L} + 2\\dfrac{\\Delta T}{T}$.',
            '$\\dfrac{\\Delta L}{L} = \\dfrac{0.1}{20.0} = 0.005 = 0.5\\%$.',
            '$2\\dfrac{\\Delta T}{T} = 2 \\times \\dfrac{0.01}{0.90} = 2 \\times 0.0111 = 0.0222 = 2.22\\%$.',
            'Total $= 0.5 + 2.22 = 2.72 \\approx 2.7\\%$.',
            'Timing contributes over four times as much error as the length \u2014 the reason every school lab times 20 swings, not one.'
          ] },

        { id: 'ph-01-07-q8', tier: 'H', kind: 'numeric', parSec: 140, tol: { rel: 0.06 }, kcs: ['kc-ph-errprod'],
          stem: 'The density of a cylinder is $\\rho = \\dfrac{m}{\\pi r^{2} l}$. If $m$ has $1\\%$ error, $r$ has $2\\%$ error and $l$ has $1.5\\%$ error, the percentage error in $\\rho$ is:',
          answer: 6.5,
          hint: 'Do not forget that $r$ is squared.',
          solution: [
            '$\\dfrac{\\Delta \\rho}{\\rho} = \\dfrac{\\Delta m}{m} + 2\\dfrac{\\Delta r}{r} + \\dfrac{\\Delta l}{l}$.',
            '$= 1\\% + 2(2\\%) + 1.5\\%$.',
            '$= 1 + 4 + 1.5 = 6.5\\%$.',
            'Note how the radius, measured to only $2\\%$, contributes $4\\%$ \u2014 more than the other two combined. Measure radii carefully.'
          ] },

        { id: 'ph-01-07-q9', tier: 'H', kind: 'mcq', parSec: 140, kcs: ['kc-ph-errprod'],
          stem: 'Young\u2019s modulus is $Y = \\dfrac{FL}{A\\,\\Delta L}$ where $A = \\dfrac{\\pi d^{2}}{4}$. If the percentage errors in $F, L, d, \\Delta L$ are $1\\%, 0.5\\%, 1\\%, 2\\%$, the maximum percentage error in $Y$ is:',
          options: ['$4.5\\%$', '$5.5\\%$', '$6.5\\%$', '$3.5\\%$'],
          answer: 1,
          hint: 'Substitute for $A$ first so that $d$ appears with its true exponent.',
          solution: [
            'Substituting $A$: $Y = \\dfrac{4FL}{\\pi d^{2}\\,\\Delta L}$.',
            'Now read off the exponents: $F^{1}, L^{1}, d^{-2}, (\\Delta L)^{-1}$.',
            '$\\dfrac{\\Delta Y}{Y} = \\dfrac{\\Delta F}{F} + \\dfrac{\\Delta L}{L} + 2\\dfrac{\\Delta d}{d} + \\dfrac{\\Delta(\\Delta L)}{\\Delta L}$',
            '$= 1\\% + 0.5\\% + 2(1\\%) + 2\\% = 5.5\\%$.',
            'The trap is leaving $A$ unexpanded and using $\\Delta A/A = 1\\%$ instead of $2\\%$.'
          ] }
      ]
    },

    /* ---------------------------------------------------------------
       8. Vernier calliper and screw gauge
       --------------------------------------------------------------- */
    {
      id: 'ph-01-08',
      title: 'Vernier Calliper & Screw Gauge',
      short: 'Reading beyond the smallest division',
      kcs: ['kc-ph-leastcount', 'kc-ph-vernier', 'kc-ph-screw', 'kc-ph-zeroerr'],
      prereq: ['ph-01-06'],
      estMin: 30,
      weight: 1.2,
      widget: 'vernierBench',
      widgetTitle: 'Instrument Bench',
      widgetBrief: 'Drag a real vernier calliper and screw gauge onto objects, read them, and survive the zero-error round.',

      story: {
        speaker: 'VERA',
        avatar: '📐',
        lines: [
          'Final module. Now you touch the instruments.',
          'A metre rule stops at a millimetre. But Pierre Vernier realised in 1631 that if you make a second scale *slightly* shorter than the first, the mismatch between them lets you read a tenth of a division \u2014 with your eyes alone.',
          'It is the most elegant piece of engineering you will meet this year. And every year, candidates lose marks on it for one reason: they forget the zero error.'
        ]
      },

      lesson: [
        { t: 'h', x: 'Least count' },
        { t: 'p', x: 'The **least count** is the smallest change an instrument can resolve. It sets the floor on precision: you may estimate between divisions, but you may not claim to *read* between them.' },
        { t: 'formula', name: 'Least count', tex: '\\text{L.C.} = \\frac{\\text{smallest main-scale division}}{\\text{number of divisions on the moving scale}}', star: true },

        { t: 'h', x: 'The vernier calliper' },
        { t: 'p', x: 'A vernier scale has $n$ divisions occupying the length of $(n-1)$ main-scale divisions. Each vernier division is therefore slightly **shorter** than a main-scale division, and that deliberate mismatch is the whole trick.' },
        { t: 'formula', name: 'Vernier least count', tex: '\\text{L.C.} = 1\\,\\text{MSD} - 1\\,\\text{VSD} = \\frac{1\\,\\text{MSD}}{n}', star: true,
          note: 'For the standard instrument: $1\\ \\text{MSD} = 1$ mm, $n = 10$, so L.C. $= 0.1$ mm $= 0.01$ cm.' },
        { t: 'formula', name: 'Reading', tex: '\\text{Reading} = \\text{MSR} + (\\text{VC} \\times \\text{L.C.})', star: true,
          note: 'MSR = main scale reading just before the zero of the vernier; VC = the vernier division that lines up best with a main-scale mark.' },

        { t: 'anim', id: 'vernierPrinciple' },

        { t: 'worked', title: 'Worked example \u2014 a vernier reading', tier: 'M',
          q: 'A vernier has $1\\ \\text{MSD} = 1$ mm and 10 vernier divisions. The zero of the vernier lies just past the $1.2$ cm mark and the 6th vernier division coincides. Find the length.',
          steps: [
            'L.C. $= \\dfrac{1\\ \\text{mm}}{10} = 0.1$ mm $= 0.01$ cm.',
            'MSR $= 1.2$ cm.',
            'Vernier coincidence VC $= 6$.',
            'Reading $= 1.2 + (6 \\times 0.01) = 1.2 + 0.06$.'
          ],
          ans: '$1.26$ cm'
        },

        { t: 'h', x: 'The screw gauge (micrometer)' },
        { t: 'p', x: 'A screw converts rotation into tiny linear motion. The **pitch** is how far the spindle advances in one full rotation; dividing it by the number of circular-scale divisions gives a much finer least count than a vernier.' },
        { t: 'formula', name: 'Screw gauge least count', tex: '\\text{L.C.} = \\frac{\\text{pitch}}{\\text{number of circular scale divisions}}', star: true,
          note: 'Typical: pitch $= 0.5$ mm, 50 divisions $\\Rightarrow$ L.C. $= 0.01$ mm.' },
        { t: 'formula', name: 'Reading', tex: '\\text{Reading} = \\text{PSR} + (\\text{HSR} \\times \\text{L.C.})',
          note: 'PSR = pitch (main) scale reading; HSR = head/circular scale division on the reference line.' },

        { t: 'h', x: 'Zero error \u2014 where the marks are lost' },
        { t: 'callout', kind: 'jee', title: 'The rule in one line',
          x: '$\\text{Correct reading} = \\text{Observed reading} - \\text{Zero error}$\n\nThe zero error keeps its **sign**, so a negative zero error ends up being *added*.' },
        { t: 'ul', items: [
          '**Positive zero error:** with the jaws closed, the moving scale zero sits *past* the main scale zero. Reading is too big \u2192 subtract.',
          '**Negative zero error:** the moving scale zero sits *before* the main scale zero. Reading is too small \u2192 subtract a negative, i.e. add.',
          'For a negative screw-gauge error where the $p$-th division coincides with $n$ total divisions: $\\text{zero error} = -(n - p) \\times \\text{L.C.}$'
        ] },

        { t: 'worked', title: 'Worked example \u2014 zero correction', tier: 'H',
          q: 'A screw gauge (pitch $0.5$ mm, 50 divisions) shows the 45th division coinciding when fully closed. A wire then reads PSR $= 1.5$ mm, HSR $= 27$. Find the true diameter.',
          steps: [
            'L.C. $= 0.5/50 = 0.01$ mm.',
            'Closed, the 45th of 50 divisions coincides \u2014 that is *before* zero, so the error is negative: $\\text{zero error} = -(50 - 45) \\times 0.01 = -0.05$ mm.',
            'Observed reading $= 1.5 + (27 \\times 0.01) = 1.5 + 0.27 = 1.77$ mm.',
            'Correct $=$ observed $-$ zero error $= 1.77 - (-0.05) = 1.77 + 0.05$.'
          ],
          ans: '$1.82$ mm'
        },

        { t: 'sim' },

        { t: 'callout', kind: 'tip', title: 'Two habits that save marks', x: '**1.** Write the least count down *first*, before touching any reading. **2.** Write the zero error with its sign in a box beside your working, so you cannot forget to apply it.' },
        { t: 'callout', kind: 'warn', title: 'Backlash error', x: 'If you reverse the screw\u2019s direction mid-measurement, slack in the threads means the spindle does not move for a fraction of a turn. Always approach the final reading turning the **same way**, and use the ratchet so you apply consistent pressure.' }
      ],

      formulas: [
        { name: 'Least count (general)', tex: '\\text{L.C.} = \\frac{\\text{smallest main division}}{\\text{moving scale divisions}}', star: true },
        { name: 'Vernier L.C.', tex: '\\text{L.C.} = 1\\text{MSD} - 1\\text{VSD}', star: true },
        { name: 'Vernier reading', tex: 'R = \\text{MSR} + \\text{VC}\\times\\text{L.C.}', star: true },
        { name: 'Screw gauge L.C.', tex: '\\text{L.C.} = \\frac{\\text{pitch}}{N}', star: true },
        { name: 'Zero correction', tex: 'R_{\\text{true}} = R_{\\text{obs}} - \\text{zero error}', star: true }
      ],

      questions: [
        { id: 'ph-01-08-q1', tier: 'G', kind: 'mcq', parSec: 40, kcs: ['kc-ph-leastcount', 'kc-ph-vernier'],
          stem: 'A vernier scale has 10 divisions coinciding with 9 main scale divisions. If $1\\ \\text{MSD} = 1$ mm, the least count is:',
          options: ['$1$ mm', '$0.1$ mm', '$0.01$ mm', '$0.9$ mm'],
          answer: 1,
          hint: 'L.C. $= 1\\text{MSD} - 1\\text{VSD}$.',
          solution: [
            '10 VSD $=$ 9 MSD, so $1\\ \\text{VSD} = 0.9$ MSD $= 0.9$ mm.',
            'L.C. $= 1\\ \\text{MSD} - 1\\ \\text{VSD} = 1 - 0.9 = 0.1$ mm.',
            'Equivalently, L.C. $= \\dfrac{1\\ \\text{MSD}}{n} = \\dfrac{1}{10} = 0.1$ mm $= 0.01$ cm.'
          ] },

        { id: 'ph-01-08-q2', tier: 'G', kind: 'numeric', parSec: 45, tol: { abs: 0.0005 }, kcs: ['kc-ph-screw', 'kc-ph-leastcount'],
          stem: 'A screw gauge has a pitch of $0.5$ mm and 50 divisions on its circular scale. Find its least count in mm.',
          answer: 0.01,
          hint: 'Pitch divided by the number of circular divisions.',
          solution: [
            'L.C. $= \\dfrac{\\text{pitch}}{N} = \\dfrac{0.5\\ \\text{mm}}{50}$.',
            '$= 0.01$ mm $= 10\\ \\mu$m.',
            'This is why a screw gauge is used for wires and sheets, while a vernier (0.1 mm) suffices for rods and beakers.'
          ] },

        { id: 'ph-01-08-q3', tier: 'G', kind: 'mcq', parSec: 45, kcs: ['kc-ph-screw'],
          stem: 'A screw gauge of least count $0.01$ mm reads PSR $= 2.5$ mm and HSR $= 23$ (no zero error). The measurement is:',
          options: ['$2.523$ mm', '$2.73$ mm', '$25.23$ mm', '$2.53$ mm'],
          answer: 1,
          hint: 'Reading $=$ PSR $+$ HSR $\\times$ L.C.',
          solution: [
            'Circular scale contribution $= 23 \\times 0.01 = 0.23$ mm.',
            'Total $= 2.5 + 0.23 = 2.73$ mm.',
            'The common slip is writing $2.523$ \u2014 that would be treating the L.C. as $0.001$ mm.'
          ] },

        { id: 'ph-01-08-q4', tier: 'M', kind: 'numeric', parSec: 70, tol: { abs: 0.005 }, kcs: ['kc-ph-vernier'],
          stem: 'A vernier calliper has L.C. $= 0.01$ cm. The main scale reads $1.2$ cm and the 6th vernier division coincides. Give the reading in cm.',
          answer: 1.26,
          hint: 'Add the vernier contribution to the main scale reading.',
          solution: [
            'Vernier contribution $= 6 \\times 0.01 = 0.06$ cm.',
            'Reading $= 1.2 + 0.06 = 1.26$ cm.'
          ] },

        { id: 'ph-01-08-q5', tier: 'M', kind: 'numeric', parSec: 90, tol: { abs: 0.005 }, kcs: ['kc-ph-vernier', 'kc-ph-zeroerr'],
          stem: 'The same calliper (L.C. $= 0.01$ cm) has a zero error of $-0.03$ cm. If the observed reading is $1.26$ cm, what is the corrected reading in cm?',
          answer: 1.29,
          hint: 'Correct $=$ observed $-$ zero error, keeping the sign.',
          solution: [
            'Correct reading $=$ observed $-$ zero error.',
            '$= 1.26 - (-0.03)$.',
            '$= 1.26 + 0.03 = 1.29$ cm.',
            'A negative zero error means the instrument under-reads, so the correction must *increase* the value.'
          ] },

        { id: 'ph-01-08-q6', tier: 'M', kind: 'mcq', parSec: 75, kcs: ['kc-ph-leastcount'],
          stem: 'To reduce the least count of a vernier calliper (i.e. make it finer), one should:',
          options: [
            'increase the number of vernier divisions',
            'decrease the number of vernier divisions',
            'increase the size of the main scale divisions',
            'use a longer main scale'
          ],
          answer: 0,
          hint: 'L.C. $= \\text{MSD}/n$.',
          solution: [
            'L.C. $= \\dfrac{1\\ \\text{MSD}}{n}$, so increasing $n$ makes the least count smaller (finer).',
            'A 20-division vernier on a 1 mm main scale gives L.C. $= 0.05$ mm.',
            'Increasing the MSD would make the instrument *coarser*, and the total length of the main scale affects range, not resolution.'
          ] },

        { id: 'ph-01-08-q7', tier: 'H', kind: 'numeric', parSec: 130, tol: { abs: 0.005 }, kcs: ['kc-ph-screw', 'kc-ph-zeroerr'],
          stem: 'A screw gauge has pitch $0.5$ mm and 50 circular divisions. When the jaws are closed, the 45th division coincides with the reference line. A wire gives PSR $= 1.5$ mm and HSR $= 27$. Find the corrected diameter in mm.',
          answer: 1.82,
          hint: 'A coinciding division near the top of the scale when closed means a **negative** zero error.',
          solution: [
            'L.C. $= 0.5/50 = 0.01$ mm.',
            'Closed reading: the 45th of 50 divisions coincides, which is $5$ divisions *short* of zero.',
            'Zero error $= -(50 - 45) \\times 0.01 = -0.05$ mm.',
            'Observed $= 1.5 + 27 \\times 0.01 = 1.77$ mm.',
            'Corrected $= 1.77 - (-0.05) = 1.82$ mm.'
          ] },

        { id: 'ph-01-08-q8', tier: 'H', kind: 'mcq', parSec: 130, kcs: ['kc-ph-screw', 'kc-ph-errprod'],
          stem: 'A wire of diameter $d = (0.50 \\pm 0.01)$ mm and length $L = (50.0 \\pm 0.1)$ cm. The percentage error in its **volume** $V = \\dfrac{\\pi d^{2}L}{4}$ is closest to:',
          options: ['$2.2\\%$', '$4.2\\%$', '$3.0\\%$', '$1.2\\%$'],
          answer: 1,
          hint: 'Diameter is squared.',
          solution: [
            '$\\dfrac{\\Delta V}{V} = 2\\dfrac{\\Delta d}{d} + \\dfrac{\\Delta L}{L}$.',
            '$2 \\times \\dfrac{0.01}{0.50} = 2 \\times 0.02 = 0.04 = 4\\%$.',
            '$\\dfrac{0.1}{50.0} = 0.002 = 0.2\\%$.',
            'Total $= 4\\% + 0.2\\% = 4.2\\%$.',
            'The diameter dominates completely \u2014 which is why you measure a thin wire with a screw gauge, not a vernier.'
          ] },

        { id: 'ph-01-08-q9', tier: 'H', kind: 'mcq', parSec: 140, kcs: ['kc-ph-vernier', 'kc-ph-leastcount'],
          stem: 'In a vernier calliper, $N$ divisions of the vernier scale coincide with $(N-1)$ divisions of the main scale, where each main scale division is $s$. The least count is:',
          options: [
            '$\\dfrac{s}{N}$',
            '$\\dfrac{s}{N-1}$',
            '$\\dfrac{s}{N+1}$',
            '$\\dfrac{(N-1)s}{N}$'
          ],
          answer: 0,
          hint: 'Find the length of one vernier division first.',
          solution: [
            '$N$ vernier divisions span $(N-1)$ main divisions, i.e. a length $(N-1)s$.',
            'So $1\\ \\text{VSD} = \\dfrac{(N-1)s}{N}$.',
            'L.C. $= 1\\ \\text{MSD} - 1\\ \\text{VSD} = s - \\dfrac{(N-1)s}{N}$.',
            '$= s\\left(1 - \\dfrac{N-1}{N}\\right) = s \\cdot \\dfrac{1}{N} = \\dfrac{s}{N}$.',
            'Check with the standard instrument: $s = 1$ mm, $N = 10 \\Rightarrow$ L.C. $= 0.1$ mm. \u2713'
          ] }
      ]
    }
  ],

  /* ================================================================
     Chapter boss
     ================================================================ */
  boss: {
    id: 'ph-01-boss',
    name: 'The Miscalibrator',
    title: 'Corrupted Metrology Core',
    avatar: '⚙️',
    hp: 10,
    lives: 3,
    timePerQ: 100,
    intro: 'A shape of grinding gears and shifting decimal points rises out of the calibration bay. Every gauge on the station flickers to a different unit. "YOUR NUMBERS," it grates, "MEAN NOTHING WITHOUT ME."',
    defeat: 'The gears seize. Across the station, needles settle and agree with each other for the first time since the flare. VERA is quiet for a moment. "Module archive restored, Cadet. All eight. The instruments trust you now."',
    taunts: [
      'Dimensionally correct is not the same as correct.',
      'You forgot the zero error. They always forget the zero error.',
      'Three significant figures? Prove it.',
      'Which exponent did you drop?'
    ],
    /** Boss questions are drawn from the H tier of every topic, plus these. */
    extraQuestions: [
      { id: 'ph-01-boss-q1', tier: 'H', kind: 'mcq', parSec: 110, kcs: ['kc-ph-dimform', 'kc-ph-errprod'],
        stem: 'A physical quantity $P$ is related to four others by $P = \\dfrac{a^{3}b^{2}}{\\sqrt{c}\\,d}$. The percentage errors in $a, b, c, d$ are $1\\%, 3\\%, 4\\%$ and $2\\%$. The percentage error in $P$ is:',
        options: ['$13\\%$', '$11\\%$', '$15\\%$', '$9\\%$'],
        answer: 0,
        hint: 'Remember the square root is a power of one half.',
        solution: [
          '$\\dfrac{\\Delta P}{P} = 3\\dfrac{\\Delta a}{a} + 2\\dfrac{\\Delta b}{b} + \\dfrac{1}{2}\\dfrac{\\Delta c}{c} + \\dfrac{\\Delta d}{d}$.',
          '$= 3(1\\%) + 2(3\\%) + \\tfrac{1}{2}(4\\%) + 1(2\\%)$.',
          '$= 3 + 6 + 2 + 2 = 13\\%$.'
        ] },
      { id: 'ph-01-boss-q2', tier: 'H', kind: 'mcq', parSec: 110, kcs: ['kc-ph-dimform'],
        stem: 'The dimensions of $\\dfrac{1}{\\sqrt{\\mu_0 \\varepsilon_0}}$ are those of:',
        options: ['velocity', 'acceleration', 'force', 'energy'],
        answer: 0,
        hint: 'Maxwell found something famous here.',
        solution: [
          'Maxwell showed $c = \\dfrac{1}{\\sqrt{\\mu_0\\varepsilon_0}}$.',
          'So the combination has the dimensions of **velocity**: $[\\text{LT}^{-1}]$.',
          'Historically this was the moment light was identified as an electromagnetic wave \u2014 the number came out at $3 \\times 10^{8}\\ \\text{m}\\,\\text{s}^{-1}$ and Maxwell realised what he was looking at.'
        ] },
      { id: 'ph-01-boss-q3', tier: 'M', kind: 'mcq', parSec: 90, kcs: ['kc-ph-sigarith', 'kc-ph-errprod'],
        stem: 'The mass of a box is $2.3$ kg. Two gold pieces of masses $20.15$ g and $20.17$ g are added. The **total mass** to the correct significant figures is:',
        options: ['$2.3$ kg', '$2.34$ kg', '$2.340$ kg', '$2.3403$ kg'],
        answer: 0,
        hint: 'Addition is governed by decimal places, in a consistent unit.',
        solution: [
          'Convert to kg: $20.15\\ \\text{g} = 0.02015$ kg, $20.17\\ \\text{g} = 0.02017$ kg.',
          'Raw total $= 2.3 + 0.02015 + 0.02017 = 2.34032$ kg.',
          '$2.3$ kg has only **one** decimal place, and that governs the sum.',
          'Answer: $2.3$ kg. The gold is real, but the box scale is too coarse to notice it \u2014 the NCERT example that surprises everyone.'
        ] }
    ]
  },

  /** Quick-reference sheet, used by the Print Pack. */
  formulaSheet: [
    { name: 'Measurement identity', tex: 'n_1u_1 = n_2u_2' },
    { name: 'System conversion', tex: 'n_2 = n_1[M_1/M_2]^{a}[L_1/L_2]^{b}[T_1/T_2]^{c}' },
    { name: 'Force / energy (CGS)', tex: '1\\,\\text{N}=10^5\\,\\text{dyne},\\quad 1\\,\\text{J}=10^7\\,\\text{erg}' },
    { name: 'Homogeneity', tex: '[\\text{LHS}]=[\\text{RHS}]=[\\text{every term}]' },
    { name: 'Rayleigh method', tex: 'Q = k\\,A^{x}B^{y}C^{z}' },
    { name: 'Sig figs: + and \u2212', tex: '\\text{fewest decimal places}' },
    { name: 'Sig figs: \u00d7 and \u00f7', tex: '\\text{fewest significant figures}' },
    { name: 'Mean absolute error', tex: '\\Delta a = \\tfrac{1}{n}\\sum|a_{\\text{mean}} - a_i|' },
    { name: 'Percentage error', tex: '\\delta a\\% = \\tfrac{\\Delta a}{a}\\times 100' },
    { name: 'Errors: sum / difference', tex: '\\Delta Z = \\Delta A + \\Delta B' },
    { name: 'Errors: product / quotient', tex: '\\tfrac{\\Delta Z}{Z} = \\tfrac{\\Delta A}{A} + \\tfrac{\\Delta B}{B}' },
    { name: 'Errors: powers', tex: 'Z=A^pB^qC^{-r} \\Rightarrow \\tfrac{\\Delta Z}{Z}=|p|\\tfrac{\\Delta A}{A}+|q|\\tfrac{\\Delta B}{B}+|r|\\tfrac{\\Delta C}{C}' },
    { name: 'Vernier L.C.', tex: '\\text{L.C.} = 1\\text{MSD} - 1\\text{VSD} = \\tfrac{\\text{MSD}}{n}' },
    { name: 'Screw gauge L.C.', tex: '\\text{L.C.} = \\tfrac{\\text{pitch}}{N}' },
    { name: 'Zero correction', tex: 'R_{\\text{true}} = R_{\\text{obs}} - \\text{zero error}' },
    { name: 'Dimensions: viscosity', tex: '[\\eta]=[\\text{ML}^{-1}\\text{T}^{-1}]' },
    { name: 'Dimensions: Planck', tex: '[h]=[\\text{ML}^{2}\\text{T}^{-1}]' },
    { name: 'Dimensions: G', tex: '[G]=[\\text{M}^{-1}\\text{L}^{3}\\text{T}^{-2}]' }
  ]
};
