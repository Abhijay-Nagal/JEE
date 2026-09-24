/**
 * Chemistry - Chapter 1: Some Basic Concepts of Chemistry
 *
 * JEE Main Unit 1. Six topics running from the laws of chemical combination
 * to the mole concept, stoichiometry and concentration terms. This is the
 * chapter every other chemistry chapter silently depends on.
 */

export default {
  id: 'ch-01',
  subject: 'chemistry',
  number: 1,
  title: 'Some Basic Concepts of Chemistry',
  subtitle: 'Counting atoms by weighing them',
  blurb: 'You cannot see an atom, pick one up, or count a mole of them in a lifetime. Yet chemistry is arithmetic on exactly those numbers. This chapter is the bridge between the balance in your hand and the particles you will never see.',
  jeeWeight: 3.5,
  estMin: 240,
  icon: '⚗️',

  guide: {
    name: 'MOLE-9',
    full: 'Molecular Ledger & Equilibrium unit, mark 9',
    avatar: '⚗️',
    voice: 'enthusiastic, slightly manic, loves a good ratio'
  },

  intro: {
    speaker: 'MOLE-9',
    avatar: '⚗️',
    lines: [
      'Cadet! Welcome to the Synthesis Bay! Mind the spill, it is only a mild oxidiser.',
      'Here is my problem. The life-support scrubber needs exactly the right ratio of reagents. Too little and we suffocate. Too much and we waste stock we cannot replace out here.',
      'But I cannot *count* molecules. Nobody can. So chemists invented the most audacious trick in science: we weigh a pile of matter, and from its mass we deduce **how many particles are in it**. To sixteen significant figures.',
      'Six modules and you will be able to do it too. Let us begin before the CO\u2082 alarm does.'
    ]
  },

  kcs: {
    'kc-ch-matter':    { name: 'Classification of matter',            weight: 0.7, prereq: [] },
    'kc-ch-lawmass':   { name: 'Law of conservation of mass',         weight: 1.0, prereq: ['kc-ch-matter'] },
    'kc-ch-lawprop':   { name: 'Law of definite proportions',         weight: 1.0, prereq: ['kc-ch-lawmass'] },
    'kc-ch-lawmult':   { name: 'Law of multiple proportions',         weight: 1.2, prereq: ['kc-ch-lawprop'] },
    'kc-ch-lawgas':    { name: 'Gay-Lussac and Avogadro laws',        weight: 1.1, prereq: ['kc-ch-lawprop'] },

    'kc-ch-dalton':    { name: 'Dalton\u2019s atomic theory',              weight: 0.8, prereq: ['kc-ch-lawmult'] },
    'kc-ch-amu':       { name: 'Atomic mass unit and the C-12 scale', weight: 1.1, prereq: ['kc-ch-dalton'] },
    'kc-ch-avgmass':   { name: 'Average atomic mass from isotopes',   weight: 1.3, prereq: ['kc-ch-amu'] },
    'kc-ch-molmass':   { name: 'Molecular and formula mass',          weight: 1.2, prereq: ['kc-ch-amu'] },

    'kc-ch-mole':      { name: 'The mole and Avogadro\u2019s number',      weight: 1.6, prereq: ['kc-ch-amu'] },
    'kc-ch-molarmass': { name: 'Molar mass and molar volume',         weight: 1.4, prereq: ['kc-ch-mole', 'kc-ch-molmass'] },
    'kc-ch-moleconv':  { name: 'Mass \u2194 mole \u2194 number interconversion', weight: 1.6, prereq: ['kc-ch-molarmass'] },

    'kc-ch-percent':   { name: 'Percentage composition',              weight: 1.1, prereq: ['kc-ch-molmass'] },
    'kc-ch-empirical': { name: 'Empirical formula from data',         weight: 1.4, prereq: ['kc-ch-percent', 'kc-ch-moleconv'] },
    'kc-ch-molecular': { name: 'Molecular formula from empirical',    weight: 1.3, prereq: ['kc-ch-empirical'] },

    'kc-ch-balance':   { name: 'Balancing chemical equations',        weight: 1.0, prereq: ['kc-ch-lawmass'] },
    'kc-ch-stoich':    { name: 'Stoichiometric calculations',         weight: 1.7, prereq: ['kc-ch-balance', 'kc-ch-moleconv'] },
    'kc-ch-limiting':  { name: 'Limiting reagent',                    weight: 1.8, prereq: ['kc-ch-stoich'] },
    'kc-ch-yield':     { name: 'Theoretical and percentage yield',    weight: 1.1, prereq: ['kc-ch-limiting'] },

    'kc-ch-masspct':   { name: 'Mass percent, ppm, strength',         weight: 1.0, prereq: ['kc-ch-moleconv'] },
    'kc-ch-molarity':  { name: 'Molarity',                            weight: 1.6, prereq: ['kc-ch-moleconv'] },
    'kc-ch-molality':  { name: 'Molality',                            weight: 1.3, prereq: ['kc-ch-molarity'] },
    'kc-ch-molefrac':  { name: 'Mole fraction',                       weight: 1.2, prereq: ['kc-ch-moleconv'] },
    'kc-ch-dilution':  { name: 'Dilution and interconversion',        weight: 1.4, prereq: ['kc-ch-molarity', 'kc-ch-molality'] }
  },

  topics: [
    /* ---------------------------------------------------------------
       1. Matter and the laws of chemical combination
       --------------------------------------------------------------- */
    {
      id: 'ch-01-01',
      title: 'Matter & the Laws of Chemical Combination',
      short: 'Five laws found by weighing things carefully',
      kcs: ['kc-ch-matter', 'kc-ch-lawmass', 'kc-ch-lawprop', 'kc-ch-lawmult', 'kc-ch-lawgas'],
      prereq: [],
      estMin: 26,
      weight: 1.1,
      widget: 'lawLab',
      widgetTitle: 'The Weighing Room',
      widgetBrief: 'Run 18th-century experiments on a sealed balance and rediscover the laws yourself.',

      story: {
        speaker: 'MOLE-9',
        avatar: '⚗️',
        lines: [
          'Module One. Before anyone knew atoms existed, they knew atoms existed. Watch.',
          'Lavoisier sealed a flask, burnt something inside it, and weighed it before and after. Identical. Matter was not being destroyed \u2014 it was being *rearranged*.',
          'Proust found that copper carbonate from Peru and copper carbonate from a laboratory had exactly the same composition. Always. To the last decimal.',
          'These were not chemistry facts, Cadet. They were fingerprints of something discrete underneath. Dalton just had to read them.'
        ]
      },

      lesson: [
        { t: 'h', x: 'Classifying matter' },
        { t: 'p', x: 'Matter splits two ways, and the distinction matters for every calculation that follows.' },
        { t: 'ul', items: [
          '**Pure substances** have a fixed composition: *elements* (one kind of atom) and *compounds* (fixed ratio of elements, chemically bonded).',
          '**Mixtures** have a variable composition: *homogeneous* (uniform throughout \u2014 salt solution, air) and *heterogeneous* (visibly distinct regions \u2014 sand in water).',
          'Key test: a compound\u2019s components can only be separated **chemically**; a mixture\u2019s can be separated **physically**.'
        ] },

        { t: 'h', x: 'Law 1 \u2014 Conservation of mass (Lavoisier, 1789)' },
        { t: 'callout', kind: 'jee', title: 'Statement', x: 'Matter can neither be created nor destroyed in a chemical reaction. **Total mass of reactants = total mass of products.**' },
        { t: 'p', x: 'This is why we balance equations. An unbalanced equation is a claim that atoms appeared or vanished.' },

        { t: 'h', x: 'Law 2 \u2014 Definite (constant) proportions (Proust, 1799)' },
        { t: 'callout', kind: 'jee', title: 'Statement', x: 'A given compound always contains exactly the same proportion of elements by mass, regardless of its source or method of preparation.' },
        { t: 'p', x: 'Water from a glacier, from a lab synthesis, or from a comet is always $\\text{H}:\\text{O} = 1:8$ by mass.' },

        { t: 'h', x: 'Law 3 \u2014 Multiple proportions (Dalton, 1803)' },
        { t: 'callout', kind: 'jee', title: 'Statement', x: 'When two elements combine to form more than one compound, the masses of one element that combine with a **fixed mass** of the other are in a simple whole-number ratio.' },
        { t: 'worked', title: 'Worked example \u2014 seeing the law work', tier: 'M',
          q: 'Carbon forms CO and CO$_2$. Show that these obey the law of multiple proportions.',
          steps: [
            'In CO: 12 g of carbon combines with 16 g of oxygen.',
            'In CO$_2$: 12 g of carbon combines with 32 g of oxygen.',
            'Fix the mass of carbon at 12 g and compare the oxygen masses: $16 : 32$.',
            'Simplify: $1 : 2$ \u2014 a simple whole-number ratio. \u2713'
          ],
          ans: 'The ratio $1:2$ confirms the law. The "simple whole numbers" are exactly the atom counts, which is the clue Dalton followed.'
        },
        { t: 'callout', kind: 'tip', title: 'The method, every time', x: '**Fix** the mass of one element, then compare the masses of the other. If you skip the fixing step you will get a meaningless ratio.' },

        { t: 'h', x: 'Law 4 \u2014 Gaseous volumes (Gay-Lussac, 1808)' },
        { t: 'p', x: 'When gases react, the volumes of reactants and products (at the same temperature and pressure) bear a simple whole-number ratio.' },
        { t: 'formula', name: 'Example', tex: '\\text{H}_2(g) + \\text{Cl}_2(g) \\longrightarrow 2\\,\\text{HCl}(g)', note: '1 volume + 1 volume $\\rightarrow$ 2 volumes' },

        { t: 'h', x: 'Law 5 \u2014 Avogadro\u2019s law (1811)' },
        { t: 'callout', kind: 'jee', title: 'Statement', x: 'Equal volumes of all gases, at the same temperature and pressure, contain an **equal number of molecules**.' },
        { t: 'p', x: 'This is the hinge of the entire chapter. It converts a *volume* \u2014 something you can read off a graduated cylinder \u2014 into a *count of particles*. Everything about molar volume follows from it.' },

        { t: 'sim' },

        { t: 'callout', kind: 'trap', title: 'Where students lose the mark', x: 'The law of multiple proportions and the law of definite proportions are constantly confused. **Definite** = *one* compound, always the same ratio. **Multiple** = *two or more* compounds from the same pair of elements, whole-number ratio between them.' }
      ],

      formulas: [
        { name: 'Conservation of mass', tex: '\\sum m_{\\text{reactants}} = \\sum m_{\\text{products}}', star: true },
        { name: 'Multiple proportions test', tex: '\\text{for fixed } m_A:\\quad \\frac{m_{B,1}}{m_{B,2}} = \\text{simple whole numbers}', star: true },
        { name: 'Avogadro\u2019s law', tex: 'V \\propto n \\quad (\\text{at constant } T, P)', star: true }
      ],

      questions: [
        { id: 'ch-01-01-q1', tier: 'G', kind: 'mcq', parSec: 30, kcs: ['kc-ch-lawmass'],
          stem: 'The law of conservation of mass states that in a chemical reaction:',
          options: [
            'the number of molecules stays constant',
            'the total mass of reactants equals the total mass of products',
            'the volume stays constant',
            'the number of moles stays constant'
          ],
          answer: 1,
          hint: 'What did Lavoisier actually measure?',
          solution: [
            'Lavoisier weighed a sealed flask before and after a reaction and found no change.',
            'Mass is conserved because atoms are merely rearranged, not created or destroyed.',
            'Note that the number of **molecules** and **moles** often changes: $\\text{N}_2 + 3\\text{H}_2 \\to 2\\text{NH}_3$ goes from 4 moles to 2.'
          ] },

        { id: 'ch-01-01-q2', tier: 'G', kind: 'mcq', parSec: 40, kcs: ['kc-ch-lawmult'],
          stem: 'H$_2$O and H$_2$O$_2$ are best used to illustrate the law of:',
          options: ['conservation of mass', 'definite proportions', 'multiple proportions', 'gaseous volumes'],
          answer: 2,
          hint: 'Two different compounds from the same two elements.',
          solution: [
            'Hydrogen and oxygen form **two** compounds here, which is the signature of the law of multiple proportions.',
            'Fix the hydrogen at 2 g: H$_2$O contains 16 g of oxygen, H$_2$O$_2$ contains 32 g.',
            'Ratio $16 : 32 = 1 : 2$ \u2014 simple whole numbers. \u2713'
          ] },

        { id: 'ch-01-01-q3', tier: 'G', kind: 'mcq', parSec: 35, kcs: ['kc-ch-matter'],
          stem: 'Which of the following is a **homogeneous mixture**?',
          options: ['Sand and water', 'Air', 'Water (H$_2$O)', 'Iron filings and sulphur powder'],
          answer: 1,
          hint: 'Uniform throughout, but with variable composition.',
          solution: [
            'Air is a mixture of N$_2$, O$_2$, Ar, CO$_2$ and others, uniform at every point you sample \u2014 homogeneous.',
            'Its composition **varies** with location and altitude, so it is a mixture, not a compound.',
            'Water is a pure compound; the other two are heterogeneous mixtures.'
          ] },

        { id: 'ch-01-01-q4', tier: 'M', kind: 'mcq', parSec: 70, kcs: ['kc-ch-lawmult'],
          stem: 'Two oxides of a metal contain $27.6\\%$ and $30.0\\%$ of oxygen respectively. If the first oxide is M$_3$O$_4$, the formula of the second is:',
          options: ['MO', 'M$_2$O$_3$', 'MO$_2$', 'M$_2$O'],
          answer: 1,
          hint: 'Find the mass of metal per fixed mass of oxygen in each.',
          solution: [
            'Take 100 g of each. First: 27.6 g O with 72.4 g M. Second: 30.0 g O with 70.0 g M.',
            'Mass of M per 1 g of O: first $= 72.4/27.6 = 2.623$; second $= 70.0/30.0 = 2.333$.',
            'Ratio of these $= 2.623 : 2.333 = 1.124 : 1 \\approx 9 : 8$.',
            'If the first is M$_3$O$_4$ (i.e. M/O $= 3/4 = 0.75$), the second has M/O $= 0.75 \\times \\dfrac{8}{9} = \\dfrac{2}{3}$.',
            'M$_2$O$_3$ has M/O $= 2/3$. \u2713'
          ] },

        { id: 'ch-01-01-q5', tier: 'M', kind: 'mcq', parSec: 60, kcs: ['kc-ch-lawgas'],
          stem: 'At the same temperature and pressure, $2$ L of H$_2$ reacts completely with $1$ L of O$_2$. The volume of water vapour formed is:',
          options: ['$1$ L', '$2$ L', '$3$ L', '$0.5$ L'],
          answer: 1,
          hint: 'Volume ratios follow the balanced equation directly (Avogadro).',
          solution: [
            'Balanced: $2\\text{H}_2(g) + \\text{O}_2(g) \\to 2\\text{H}_2\\text{O}(g)$.',
            'By Avogadro\u2019s law, at constant $T$ and $P$ volume is directly proportional to moles.',
            'So the volume ratio is the same as the mole ratio: $2 : 1 : 2$.',
            '$2$ L H$_2$ and $1$ L O$_2$ give **$2$ L** of water vapour.',
            'Note the total volume falls from 3 L to 2 L \u2014 mass is conserved, volume is not.'
          ] },

        { id: 'ch-01-01-q6', tier: 'M', kind: 'mcq', parSec: 70, kcs: ['kc-ch-lawprop', 'kc-ch-lawmass'],
          stem: '$4.0$ g of hydrogen reacts with $32.0$ g of oxygen to form water. If $6.0$ g of hydrogen is used with $32.0$ g of oxygen, the mass of water formed is:',
          options: ['$38.0$ g', '$36.0$ g', '$34.0$ g', '$40.0$ g'],
          answer: 1,
          hint: 'Which reactant runs out? Then apply conservation of mass to the part that reacts.',
          solution: [
            'Water is always H : O $= 1 : 8$ by mass (law of definite proportions).',
            '$32.0$ g of oxygen can only combine with $32.0/8 = 4.0$ g of hydrogen.',
            'So $4.0$ g of the $6.0$ g of hydrogen reacts; $2.0$ g is left over.',
            'Mass of water $= 4.0 + 32.0 = 36.0$ g (conservation of mass applied to what actually reacted).',
            'This is the limiting-reagent idea appearing two modules early.'
          ] },

        { id: 'ch-01-01-q7', tier: 'H', kind: 'mcq', parSec: 110, kcs: ['kc-ch-lawmult'],
          stem: 'Carbon and oxygen form CO and CO$_2$. In a third hypothetical oxide, $12$ g of carbon combines with $48$ g of oxygen. Does this obey the law of multiple proportions?',
          options: [
            'No, because $48$ is not a whole-number multiple of $16$',
            'Yes, the oxygen masses are in the ratio $1:2:3$',
            'No, the law applies only to two compounds',
            'Yes, but only if the compound is CO$_3$'
          ],
          answer: 1,
          hint: 'Fix carbon at 12 g and list the oxygen masses.',
          solution: [
            'Fixing carbon at $12$ g: CO has $16$ g O, CO$_2$ has $32$ g O, the third has $48$ g O.',
            'Ratio $= 16 : 32 : 48 = 1 : 2 : 3$ \u2014 simple whole numbers, so the law is obeyed.',
            'The law extends to any number of compounds of the same element pair.',
            '(Whether such an oxide is chemically stable is a separate question \u2014 the law is about mass ratios, not stability.)'
          ] },

        { id: 'ch-01-01-q8', tier: 'H', kind: 'numeric', parSec: 130, tol: { rel: 0.03 }, kcs: ['kc-ch-lawgas', 'kc-ch-lawmass'],
          stem: '$10$ mL of a gaseous hydrocarbon burns completely in $50$ mL of O$_2$ to give $30$ mL of CO$_2$ (all at the same $T$, $P$; water condensed). How many carbon atoms are in one molecule of the hydrocarbon?',
          answer: 3,
          hint: 'Volume ratio = mole ratio. Compare CO$_2$ volume with hydrocarbon volume.',
          solution: [
            'Let the hydrocarbon be C$_x$H$_y$. By Avogadro, volumes are proportional to moles.',
            '$10$ mL of C$_x$H$_y$ gives $30$ mL of CO$_2$, so each molecule gives 3 CO$_2$: $x = 3$.',
            'Check the oxygen: $\\text{C}_3\\text{H}_y + \\left(3 + \\dfrac{y}{4}\\right)\\text{O}_2 \\to 3\\text{CO}_2 + \\dfrac{y}{2}\\text{H}_2\\text{O}$.',
            'O$_2$ used per 10 mL of fuel is 50 mL, so $3 + y/4 = 5 \\Rightarrow y = 8$.',
            'The hydrocarbon is propane, C$_3$H$_8$, and $x = 3$.'
          ] },

        { id: 'ch-01-01-q9', tier: 'H', kind: 'mcq', parSec: 100, kcs: ['kc-ch-lawprop', 'kc-ch-matter'],
          stem: 'Which observation is **inconsistent** with a substance being a pure compound?',
          options: [
            'It has a sharp melting point',
            'Samples from different sources have different percentage compositions',
            'Its components can be separated only by chemical means',
            'It has a fixed boiling point at a given pressure'
          ],
          answer: 1,
          hint: 'Recall the law of definite proportions.',
          solution: [
            'A pure compound obeys the law of definite proportions: its composition by mass is fixed no matter the source.',
            'If different samples give different percentage compositions, it is a **mixture**, not a compound.',
            'Sharp melting and boiling points and chemical-only separation are all hallmarks of a pure compound.',
            'Historical footnote: Berthollet argued against Proust on exactly this point, and lost \u2014 his "variable" compounds turned out to be mixtures.'
          ] }
      ]
    },

    /* ---------------------------------------------------------------
       2. Atomic and molecular masses
       --------------------------------------------------------------- */
    {
      id: 'ch-01-02',
      title: 'Dalton\u2019s Theory, Atomic & Molecular Masses',
      short: 'Weighing things you cannot see',
      kcs: ['kc-ch-dalton', 'kc-ch-amu', 'kc-ch-avgmass', 'kc-ch-molmass'],
      prereq: ['ch-01-01'],
      estMin: 24,
      weight: 1.0,
      widget: 'isotopeMixer',
      widgetTitle: 'Isotope Separator',
      widgetBrief: 'Tune isotope abundances on a mass spectrometer and watch the average atomic mass shift in real time.',

      story: {
        speaker: 'MOLE-9',
        avatar: '⚗️',
        lines: [
          'Module Two. A confession about the periodic table.',
          'Chlorine\u2019s mass is listed as $35.5$. No chlorine atom weighs $35.5$ anything. Not one, anywhere in the universe.',
          'What exists is a mixture: about three-quarters at mass 35, one-quarter at mass 37. The $35.5$ is a **weighted average** of a population \u2014 like saying the average family has 2.4 children. Nobody has 0.4 of a child.',
          'Understand that and the fractional masses on the wall chart stop being mysterious.'
        ]
      },

      lesson: [
        { t: 'h', x: 'Dalton\u2019s atomic theory (1808)' },
        { t: 'ol', items: [
          'Matter consists of indivisible atoms.',
          'All atoms of a given element are identical in mass and properties.',
          'Compounds form when atoms of different elements combine in fixed whole-number ratios.',
          'Chemical reactions rearrange atoms; atoms are neither created nor destroyed.'
        ] },
        { t: 'callout', kind: 'warn', title: 'Where Dalton was wrong', x: 'Postulate 1 fails \u2014 atoms have internal structure. Postulate 2 fails \u2014 **isotopes** have different masses. But the theory explained all four mass laws in one stroke, which is why it survived being partly wrong. Note that it cannot explain Gay-Lussac\u2019s volume ratios; that needed Avogadro.' },

        { t: 'h', x: 'The atomic mass unit' },
        { t: 'p', x: 'Masses of atoms are absurd in grams ($10^{-23}$ or so), so chemistry uses a relative scale anchored to carbon-12.' },
        { t: 'formula', name: 'Definition of 1 u (amu / dalton)', tex: '1\\ \\text{u} = \\frac{1}{12} \\times \\text{mass of one } ^{12}\\text{C atom} = 1.66056 \\times 10^{-24}\\ \\text{g}', star: true },
        { t: 'p', x: 'So a $^{12}$C atom is exactly $12$ u by definition, and every other mass is measured against it.' },

        { t: 'h', x: 'Average atomic mass' },
        { t: 'formula', name: 'Weighted average', tex: '\\bar{A} = \\frac{\\sum f_i A_i}{100} \\quad\\text{where } f_i = \\text{percentage abundance}', star: true },
        { t: 'worked', title: 'Worked example \u2014 why chlorine is 35.5', tier: 'M',
          q: 'Chlorine has two isotopes: $^{35}$Cl (mass $34.97$ u, $75.77\\%$) and $^{37}$Cl (mass $36.97$ u, $24.23\\%$). Find its average atomic mass.',
          steps: [
            '$\\bar{A} = \\dfrac{(34.97 \\times 75.77) + (36.97 \\times 24.23)}{100}$',
            '$= \\dfrac{2649.6 + 895.8}{100}$',
            '$= \\dfrac{3545.4}{100} = 35.45$ u.'
          ],
          ans: '$35.45$ u \u2014 the familiar $35.5$ on the periodic table.'
        },
        { t: 'callout', kind: 'tip', title: 'Reading it backwards', x: 'JEE often gives you the average and asks for the abundance. Set the fraction of the lighter isotope to $x$, write $A_1x + A_2(1-x) = \\bar{A}$, and solve one linear equation.' },

        { t: 'h', x: 'Molecular mass and formula mass' },
        { t: 'ul', items: [
          '**Molecular mass**: the sum of atomic masses in a molecule. H$_2$SO$_4$ $= 2(1) + 32 + 4(16) = 98$ u.',
          '**Formula mass**: used for ionic compounds, which have no discrete molecules. NaCl $= 23 + 35.5 = 58.5$ u \u2014 the mass of one *formula unit*, not of a molecule.'
        ] },
        { t: 'callout', kind: 'jee', title: 'Precision matters here', x: 'Using $\\text{Cl} = 35$ instead of $35.5$ changes NaCl from $58.5$ to $58$ \u2014 about $1\\%$. In a multi-step stoichiometry question that error compounds. Use the values given in the question paper.' },

        { t: 'sim' },

        { t: 'h', x: 'The masses worth knowing cold' },
        { t: 'table',
          head: ['Species', 'Mass (u)', 'Species', 'Mass (u)'],
          rows: [
            ['H', '1.008 (\u2248 1)', 'H$_2$O', '18'],
            ['C', '12.011 (\u2248 12)', 'CO$_2$', '44'],
            ['N', '14.007 (\u2248 14)', 'NH$_3$', '17'],
            ['O', '15.999 (\u2248 16)', 'H$_2$SO$_4$', '98'],
            ['Na', '22.99 (\u2248 23)', 'NaCl', '58.5'],
            ['S', '32.06 (\u2248 32)', 'CaCO$_3$', '100'],
            ['Cl', '35.45 (\u2248 35.5)', 'C$_6$H$_{12}$O$_6$', '180'],
            ['Ca', '40.08 (\u2248 40)', 'NaOH', '40']
          ]
        }
      ],

      formulas: [
        { name: 'Atomic mass unit', tex: '1\\ \\text{u} = 1.66 \\times 10^{-24}\\ \\text{g}' },
        { name: 'Average atomic mass', tex: '\\bar{A} = \\sum \\frac{f_i A_i}{100}', star: true },
        { name: 'Molecular mass', tex: 'M = \\sum (\\text{atoms} \\times \\text{atomic mass})', star: true }
      ],

      questions: [
        { id: 'ch-01-02-q1', tier: 'G', kind: 'mcq', parSec: 30, kcs: ['kc-ch-amu'],
          stem: 'One atomic mass unit (1 u) is defined as:',
          options: [
            'the mass of one hydrogen atom',
            'one-twelfth the mass of one $^{12}$C atom',
            'the mass of one proton',
            'one-sixteenth the mass of an oxygen atom'
          ],
          answer: 1,
          hint: 'The modern scale is anchored to carbon.',
          solution: [
            'Since 1961 the unified scale defines $1\\ \\text{u} = \\dfrac{1}{12}$ of the mass of a carbon-12 atom.',
            'This makes $^{12}$C exactly $12$ u by definition.',
            'Older scales used hydrogen (Dalton) and then oxygen; carbon-12 was chosen because it gives the fewest fractional values and mass spectrometers handle it well.'
          ] },

        { id: 'ch-01-02-q2', tier: 'G', kind: 'numeric', parSec: 45, tol: { abs: 0.5 }, kcs: ['kc-ch-molmass'],
          stem: 'Calculate the molecular mass of H$_2$SO$_4$ in u. (H $= 1$, S $= 32$, O $= 16$)',
          answer: 98,
          hint: 'Count every atom in the formula.',
          solution: [
            'H: $2 \\times 1 = 2$.',
            'S: $1 \\times 32 = 32$.',
            'O: $4 \\times 16 = 64$.',
            'Total $= 2 + 32 + 64 = 98$ u.'
          ] },

        { id: 'ch-01-02-q3', tier: 'G', kind: 'mcq', parSec: 40, kcs: ['kc-ch-molmass'],
          stem: 'For NaCl we speak of **formula mass** rather than molecular mass because:',
          options: [
            'NaCl is a gas',
            'NaCl is ionic and has no discrete molecules',
            'sodium has isotopes',
            'NaCl does not obey the law of definite proportions'
          ],
          answer: 1,
          hint: 'What does a crystal of table salt actually consist of?',
          solution: [
            'Solid NaCl is a three-dimensional lattice of Na$^+$ and Cl$^-$ ions.',
            'There is no identifiable "NaCl molecule" \u2014 each Na$^+$ is surrounded by six Cl$^-$ and vice versa.',
            'So $58.5$ u is the mass of one **formula unit**: the smallest repeating ratio, not a molecule.'
          ] },

        { id: 'ch-01-02-q4', tier: 'M', kind: 'numeric', parSec: 70, tol: { abs: 0.05 }, kcs: ['kc-ch-avgmass'],
          stem: 'Chlorine has isotopes $^{35}$Cl ($34.97$ u, $75.77\\%$) and $^{37}$Cl ($36.97$ u, $24.23\\%$). Find the average atomic mass in u.',
          answer: 35.45,
          hint: 'Weighted mean: multiply each mass by its fractional abundance.',
          solution: [
            '$\\bar{A} = 34.97 \\times 0.7577 + 36.97 \\times 0.2423$',
            '$= 26.496 + 8.958$',
            '$= 35.45$ u.',
            'This is why the periodic table shows $35.45$ for an element whose atoms are all either 35 or 37.'
          ] },

        { id: 'ch-01-02-q5', tier: 'M', kind: 'numeric', parSec: 80, tol: { rel: 0.03 }, kcs: ['kc-ch-avgmass'],
          stem: 'Boron has two isotopes of masses $10$ u and $11$ u. Its average atomic mass is $10.8$ u. What is the percentage abundance of the $^{10}$B isotope?',
          answer: 20,
          hint: 'Let the fraction of $^{10}$B be $x$ and write one equation.',
          solution: [
            'Let the fraction of $^{10}$B be $x$, so $^{11}$B is $(1 - x)$.',
            '$10x + 11(1 - x) = 10.8$',
            '$11 - x = 10.8 \\Rightarrow x = 0.2$.',
            'So $^{10}$B is $20\\%$ and $^{11}$B is $80\\%$.',
            'Sanity check: the average $10.8$ sits closer to 11, so the heavier isotope must be the more abundant. \u2713'
          ] },

        { id: 'ch-01-02-q6', tier: 'M', kind: 'mcq', parSec: 70, kcs: ['kc-ch-dalton'],
          stem: 'Which postulate of Dalton\u2019s atomic theory is contradicted by the existence of **isotopes**?',
          options: [
            'Atoms are indivisible',
            'All atoms of a given element are identical in mass',
            'Atoms combine in whole-number ratios',
            'Atoms are neither created nor destroyed in a reaction'
          ],
          answer: 1,
          hint: 'What do isotopes of one element differ in?',
          solution: [
            'Isotopes are atoms of the same element with different numbers of neutrons, hence **different masses**.',
            'That directly contradicts "all atoms of a given element are identical in mass".',
            'Postulate 1 (indivisibility) is also wrong \u2014 subatomic particles exist \u2014 but the isotope evidence targets postulate 2 specifically.'
          ] },

        { id: 'ch-01-02-q7', tier: 'H', kind: 'numeric', parSec: 110, tol: { rel: 0.03 }, kcs: ['kc-ch-amu', 'kc-ch-molmass'],
          stem: 'What is the mass in grams of **one molecule** of glucose, C$_6$H$_{12}$O$_6$? Give your answer as a multiple of $10^{-22}$ g (i.e. if the answer is $5.0 \\times 10^{-22}$ g, enter 5.0).',
          answer: 2.99,
          hint: 'Molecular mass in u, then convert u to grams.',
          solution: [
            'Molecular mass: $6(12) + 12(1) + 6(16) = 72 + 12 + 96 = 180$ u.',
            'Convert: $1\\ \\text{u} = 1.66 \\times 10^{-24}$ g.',
            'Mass $= 180 \\times 1.66 \\times 10^{-24} = 2.99 \\times 10^{-22}$ g.',
            'Equivalent route: $\\dfrac{180\\ \\text{g mol}^{-1}}{6.022 \\times 10^{23}\\ \\text{mol}^{-1}} = 2.99 \\times 10^{-22}$ g. Both must agree \u2014 that is the whole point of the mole.'
          ] },

        { id: 'ch-01-02-q8', tier: 'H', kind: 'mcq', parSec: 120, kcs: ['kc-ch-avgmass'],
          stem: 'An element X has isotopes of mass numbers $A$ and $A+2$ with abundances $p\\%$ and $(100-p)\\%$. If its average atomic mass is $A + 0.5$, then $p$ is:',
          options: ['$25$', '$50$', '$75$', '$80$'],
          answer: 2,
          hint: 'Write the weighted average and solve for $p$.',
          solution: [
            '$\\bar{A} = \\dfrac{A \\cdot p + (A+2)(100 - p)}{100} = A + 0.5$.',
            'Expand: $Ap + 100A + 200 - Ap - 2p = 100A + 50$.',
            '$200 - 2p = 50 \\Rightarrow 2p = 150 \\Rightarrow p = 75$.',
            'So the lighter isotope is $75\\%$ abundant \u2014 the chlorine pattern exactly.'
          ] },

        { id: 'ch-01-02-q9', tier: 'H', kind: 'mcq', parSec: 110, kcs: ['kc-ch-dalton', 'kc-ch-lawgas'],
          stem: 'Dalton\u2019s atomic theory could **not** explain:',
          options: [
            'the law of conservation of mass',
            'the law of definite proportions',
            'the law of multiple proportions',
            'Gay-Lussac\u2019s law of gaseous volumes'
          ],
          answer: 3,
          hint: 'Which law needed a further idea from Avogadro?',
          solution: [
            'Dalton\u2019s theory explains the three mass laws beautifully \u2014 it was built for them.',
            'It could not explain Gay-Lussac\u2019s **volume** ratios, because Dalton assumed elemental gases were single atoms.',
            'On that assumption $1$ vol H $+$ $1$ vol Cl should give $1$ vol HCl, but experiment gives $2$.',
            'Avogadro resolved it by proposing **diatomic molecules** (H$_2$, Cl$_2$) plus the equal-volumes-equal-molecules law. Dalton rejected the idea; it took chemistry fifty years to accept it.'
          ] }
      ]
    },

    /* ---------------------------------------------------------------
       3. The mole concept
       --------------------------------------------------------------- */
    {
      id: 'ch-01-03',
      title: 'The Mole Concept & Molar Mass',
      short: 'The chemist\u2019s counting unit',
      kcs: ['kc-ch-mole', 'kc-ch-molarmass', 'kc-ch-moleconv'],
      prereq: ['ch-01-02'],
      estMin: 30,
      weight: 1.6,
      widget: 'moleMachine',
      widgetTitle: 'The Mole Machine',
      widgetBrief: 'Route a sample through the mass / mole / particle / volume converter without taking a wrong pipe.',

      story: {
        speaker: 'MOLE-9',
        avatar: '⚗️',
        lines: [
          'Module Three. If you learn one thing in this entire chapter, learn this one.',
          'A mole is just a number, like a dozen. A dozen is 12. A mole is $6.022 \\times 10^{23}$.',
          'Why that absurd number? Because it is chosen so that **one mole of any substance weighs its atomic or molecular mass in grams**. Carbon is 12 u per atom; one mole of carbon is 12 grams. That is the whole trick, and it is the single most useful bridge in chemistry.',
          'Everything downstream \u2014 stoichiometry, concentration, gas laws, equilibrium, electrochemistry \u2014 runs through this module. Do not move on until it is automatic.'
        ]
      },

      lesson: [
        { t: 'p', x: 'A **mole** is the amount of substance containing exactly $6.02214076 \\times 10^{23}$ elementary entities. Since the 2019 SI redefinition this is an *exact defined number*, not a measured one.' },
        { t: 'formula', name: 'Avogadro\u2019s number', tex: 'N_A = 6.022 \\times 10^{23}\\ \\text{mol}^{-1}', star: true },
        { t: 'callout', kind: 'tip', title: 'Always say what you are counting', x: '"One mole of oxygen" is ambiguous and examiners exploit it. One mole of oxygen **atoms** is 16 g and $6.022\\times10^{23}$ atoms. One mole of oxygen **molecules** (O$_2$) is 32 g and contains $1.2\\times10^{24}$ atoms. Write the formula, not the name.' },

        { t: 'h', x: 'Molar mass' },
        { t: 'p', x: 'The **molar mass** is the mass of one mole, in grams per mole. Numerically it equals the atomic/molecular mass in u \u2014 that is not a coincidence, it is the design of the scale.' },
        { t: 'table',
          head: ['Substance', 'Mass of one particle', 'Molar mass'],
          rows: [
            ['C', '$12$ u', '$12\\ \\text{g mol}^{-1}$'],
            ['O$_2$', '$32$ u', '$32\\ \\text{g mol}^{-1}$'],
            ['H$_2$O', '$18$ u', '$18\\ \\text{g mol}^{-1}$'],
            ['NaCl', '$58.5$ u', '$58.5\\ \\text{g mol}^{-1}$']
          ]
        },

        { t: 'h', x: 'The three bridges' },
        { t: 'formula', name: 'Mass \u2194 moles', tex: 'n = \\frac{m}{M}', star: true },
        { t: 'formula', name: 'Moles \u2194 particles', tex: 'N = n \\times N_A', star: true },
        { t: 'formula', name: 'Moles \u2194 gas volume at STP', tex: 'V = n \\times 22.4\\ \\text{L}', star: true,
          note: 'At $273.15$ K and $1$ atm. NCERT\u2019s newer STP ($273.15$ K, $1$ bar) gives $22.7$ L \u2014 read the question.' },

        { t: 'anim', id: 'moleBridge' },
        { t: 'callout', kind: 'jee', title: 'The master diagram',
          x: 'Everything in this chapter is one of these four boxes, and the arrows between them:\n\n**mass (g)** $\\xleftrightarrow{\\ \\div M \\ }$ **moles** $\\xleftrightarrow{\\ \\times N_A\\ }$ **number of particles**\n\nand **moles** $\\xleftrightarrow{\\ \\times 22.4\\ }$ **volume of gas at STP**.\n\nNever jump from mass to particles directly. Always go through moles.' },

        { t: 'worked', title: 'Worked example \u2014 a four-part conversion', tier: 'M',
          q: 'For $11$ g of CO$_2$: find (a) moles, (b) molecules, (c) oxygen atoms, (d) volume at STP.',
          steps: [
            'Molar mass of CO$_2$ $= 12 + 2(16) = 44\\ \\text{g mol}^{-1}$.',
            '(a) $n = \\dfrac{11}{44} = 0.25$ mol.',
            '(b) $N = 0.25 \\times 6.022\\times10^{23} = 1.506 \\times 10^{23}$ molecules.',
            '(c) Each CO$_2$ has 2 oxygen atoms: $2 \\times 1.506\\times10^{23} = 3.011 \\times 10^{23}$ atoms.',
            '(d) $V = 0.25 \\times 22.4 = 5.6$ L at STP.'
          ],
          ans: '$0.25$ mol; $1.51\\times10^{23}$ molecules; $3.01\\times10^{23}$ O atoms; $5.6$ L'
        },

        { t: 'sim' },

        { t: 'callout', kind: 'trap', title: 'Molar volume only applies to gases', x: '$22.4$ L mol$^{-1}$ is a property of an *ideal gas*, not of matter in general. One mole of water is $18$ mL, not $22.4$ L. Every year someone computes the volume of a mole of solid sodium as $22.4$ L.' },

        { t: 'callout', kind: 'story', title: 'MOLE-9', x: 'How big is $6.022 \\times 10^{23}$? A mole of grains of sand would bury India under a layer several kilometres deep. A mole of seconds is about 19 quadrillion years \u2014 a million times the age of the universe. And yet it fits in 18 grams of water. That is the scale gap chemistry lives with.' }
      ],

      formulas: [
        { name: 'Moles from mass', tex: 'n = m/M', star: true },
        { name: 'Particles', tex: 'N = nN_A = \\frac{m}{M}N_A', star: true },
        { name: 'Gas volume at STP', tex: 'V = 22.4\\,n\\ \\text{L}', star: true },
        { name: 'Avogadro number', tex: 'N_A = 6.022\\times10^{23}\\ \\text{mol}^{-1}' },
        { name: 'Gas at any T, P', tex: 'PV = nRT,\\quad R = 0.0821\\ \\text{L atm K}^{-1}\\text{mol}^{-1}' }
      ],

      questions: [
        { id: 'ch-01-03-q1', tier: 'G', kind: 'mcq', parSec: 30, kcs: ['kc-ch-mole'],
          stem: 'The number of atoms in $1$ mole of any element is:',
          options: ['$6.022 \\times 10^{22}$', '$6.022 \\times 10^{23}$', '$3.011 \\times 10^{23}$', 'it depends on the element'],
          answer: 1,
          hint: 'That is the definition of a mole.',
          solution: [
            'A mole is defined as exactly $6.02214076 \\times 10^{23}$ elementary entities \u2014 Avogadro\u2019s number.',
            'It is deliberately independent of which substance: a mole of lead and a mole of helium both contain $N_A$ atoms.',
            'What *does* differ is their mass: 207 g versus 4 g.'
          ] },

        { id: 'ch-01-03-q2', tier: 'G', kind: 'numeric', parSec: 40, tol: { abs: 0.01 }, kcs: ['kc-ch-moleconv'],
          stem: 'How many moles are there in $22$ g of CO$_2$? (C $= 12$, O $= 16$)',
          answer: 0.5,
          hint: '$n = m/M$.',
          solution: [
            'Molar mass of CO$_2$ $= 12 + 2(16) = 44\\ \\text{g mol}^{-1}$.',
            '$n = \\dfrac{22}{44} = 0.5$ mol.'
          ] },

        { id: 'ch-01-03-q3', tier: 'G', kind: 'numeric', parSec: 45, tol: { rel: 0.02 }, kcs: ['kc-ch-molarmass'],
          stem: 'What volume (in litres) does $0.25$ mol of an ideal gas occupy at STP ($273$ K, $1$ atm)?',
          answer: 5.6,
          hint: 'One mole occupies $22.4$ L at STP.',
          solution: [
            '$V = n \\times 22.4\\ \\text{L mol}^{-1}$.',
            '$= 0.25 \\times 22.4 = 5.6$ L.',
            'Note this holds for *any* ideal gas \u2014 helium, CO$_2$, ammonia \u2014 which is Avogadro\u2019s law in action.'
          ] },

        { id: 'ch-01-03-q4', tier: 'M', kind: 'mcq', parSec: 60, kcs: ['kc-ch-moleconv'],
          stem: 'The number of molecules in $1.8$ g of water is:',
          options: ['$6.022 \\times 10^{23}$', '$6.022 \\times 10^{22}$', '$1.8 \\times 10^{23}$', '$3.011 \\times 10^{22}$'],
          answer: 1,
          hint: 'Find the moles first, then multiply by $N_A$.',
          solution: [
            '$n = \\dfrac{1.8}{18} = 0.1$ mol.',
            '$N = 0.1 \\times 6.022 \\times 10^{23} = 6.022 \\times 10^{22}$ molecules.',
            'Never go from grams straight to molecules \u2014 route through moles.'
          ] },

        { id: 'ch-01-03-q5', tier: 'M', kind: 'mcq', parSec: 70, kcs: ['kc-ch-moleconv'],
          stem: 'The number of **oxygen atoms** in $0.1$ mol of H$_2$SO$_4$ is:',
          options: ['$6.022 \\times 10^{22}$', '$2.409 \\times 10^{23}$', '$6.022 \\times 10^{23}$', '$1.204 \\times 10^{23}$'],
          answer: 1,
          hint: 'How many O atoms per formula unit?',
          solution: [
            'Each H$_2$SO$_4$ contains 4 oxygen atoms.',
            'Moles of O atoms $= 0.1 \\times 4 = 0.4$ mol.',
            '$N = 0.4 \\times 6.022 \\times 10^{23} = 2.409 \\times 10^{23}$ atoms.',
            'The commonest error is stopping at $6.022\\times10^{22}$ \u2014 that is the number of *molecules*, not oxygen atoms.'
          ] },

        { id: 'ch-01-03-q6', tier: 'M', kind: 'mcq', parSec: 75, kcs: ['kc-ch-moleconv', 'kc-ch-molarmass'],
          stem: 'Which sample contains the **largest number of atoms**?',
          options: ['$1$ g of He (At. mass $4$)', '$1$ g of O$_2$ (At. mass $16$)', '$1$ g of Ag (At. mass $108$)', '$1$ g of H$_2$O'],
          answer: 0,
          hint: 'Work out moles of *atoms* for each, not moles of substance.',
          solution: [
            'He: $n = 1/4 = 0.25$ mol of atoms.',
            'O$_2$: $n = 1/32 = 0.03125$ mol of molecules $\\times 2 = 0.0625$ mol of atoms.',
            'Ag: $n = 1/108 = 0.00926$ mol of atoms.',
            'H$_2$O: $n = 1/18 = 0.0556$ mol of molecules $\\times 3 = 0.167$ mol of atoms.',
            'Helium wins with $0.25$ mol. Lowest molar mass per atom always maximises atom count for a fixed mass.'
          ] },

        { id: 'ch-01-03-q7', tier: 'H', kind: 'numeric', parSec: 120, tol: { rel: 0.03 }, kcs: ['kc-ch-moleconv'],
          stem: 'A sample of a gas at STP occupies $1.12$ L and has a mass of $1.6$ g. Find its molar mass in g mol$^{-1}$.',
          answer: 32,
          hint: 'Volume gives moles; mass divided by moles gives molar mass.',
          solution: [
            '$n = \\dfrac{1.12}{22.4} = 0.05$ mol.',
            '$M = \\dfrac{m}{n} = \\dfrac{1.6}{0.05} = 32\\ \\text{g mol}^{-1}$.',
            'The gas is almost certainly O$_2$ (or, less likely, methanol vapour \u2014 molar mass alone cannot distinguish them).'
          ] },

        { id: 'ch-01-03-q8', tier: 'H', kind: 'mcq', parSec: 130, kcs: ['kc-ch-moleconv'],
          stem: 'Equal masses of H$_2$, O$_2$ and CH$_4$ are placed in a container. The ratio of the **number of moles** H$_2$ : O$_2$ : CH$_4$ is:',
          options: ['$1 : 1 : 1$', '$16 : 1 : 2$', '$8 : 1 : 2$', '$1 : 16 : 2$'],
          answer: 1,
          hint: 'For a fixed mass $m$, moles $\\propto 1/M$.',
          solution: [
            'Take $m$ grams of each. Moles are $\\dfrac{m}{2}$, $\\dfrac{m}{32}$ and $\\dfrac{m}{16}$.',
            'Ratio $= \\dfrac{1}{2} : \\dfrac{1}{32} : \\dfrac{1}{16}$.',
            'Multiply every term by 32 to clear the fractions: $16 : 1 : 2$.',
            'Sanity check: hydrogen has the smallest molar mass, so for equal masses it must contribute by far the most moles. \u2713',
            'Since mole fraction is each value divided by the same total, the mole fractions are in the same $16 : 1 : 2$ ratio.'
          ] },

        { id: 'ch-01-03-q9', tier: 'H', kind: 'numeric', parSec: 140, tol: { rel: 0.04 }, kcs: ['kc-ch-moleconv', 'kc-ch-molarmass'],
          stem: 'How many **molecules** of O$_2$ are present in $5.6$ L of oxygen gas measured at STP? Give the answer as a multiple of $10^{22}$.',
          answer: 15.06,
          hint: 'Volume \u2192 moles \u2192 molecules.',
          solution: [
            '$n = \\dfrac{5.6}{22.4} = 0.25$ mol.',
            '$N = 0.25 \\times 6.022 \\times 10^{23} = 1.506 \\times 10^{23}$ molecules.',
            'Expressed as a multiple of $10^{22}$: $15.06$.',
            'If the question had asked for **atoms**, you would double it: $3.01\\times10^{23}$.'
          ] }
      ]
    },

    /* ---------------------------------------------------------------
       4. Percentage composition and formulae
       --------------------------------------------------------------- */
    {
      id: 'ch-01-04',
      title: 'Percentage Composition, Empirical & Molecular Formula',
      short: 'Working backwards from a lab report to a formula',
      kcs: ['kc-ch-percent', 'kc-ch-empirical', 'kc-ch-molecular'],
      prereq: ['ch-01-03'],
      estMin: 26,
      weight: 1.2,
      widget: 'formulaDetective',
      widgetTitle: 'Formula Detective',
      widgetBrief: 'Run combustion analysis on an unknown compound and deduce its formula from the wreckage.',

      story: {
        speaker: 'MOLE-9',
        avatar: '⚗️',
        lines: [
          'Module Four. Detective work.',
          'An unlabelled canister turns up in the hold. No documentation. The flare destroyed the manifest.',
          'We burn a measured sample, trap the products, weigh them. From nothing but masses, we reconstruct what the molecule *is*. It is the closest chemistry gets to forensics.',
          'The procedure never changes: percentages to moles, moles to a ratio, ratio to whole numbers. Four lines in a table. Do it in the same order every time and you will never get lost.'
        ]
      },

      lesson: [
        { t: 'h', x: 'Percentage composition' },
        { t: 'formula', name: 'Mass percent of an element', tex: '\\%\\,\\text{element} = \\frac{\\text{mass of element in 1 mol}}{\\text{molar mass}} \\times 100', star: true },
        { t: 'worked', title: 'Worked example \u2014 composition of ethanol', tier: 'G',
          q: 'Find the percentage composition of C$_2$H$_5$OH.',
          steps: [
            'Molar mass $= 2(12) + 6(1) + 16 = 46\\ \\text{g mol}^{-1}$.',
            'Carbon: $\\dfrac{24}{46} \\times 100 = 52.17\\%$.',
            'Hydrogen: $\\dfrac{6}{46} \\times 100 = 13.04\\%$.',
            'Oxygen: $\\dfrac{16}{46} \\times 100 = 34.78\\%$.',
            'Check: $52.17 + 13.04 + 34.78 = 99.99 \\approx 100\\%$. \u2713'
          ],
          ans: 'C $52.17\\%$, H $13.04\\%$, O $34.78\\%$'
        },
        { t: 'callout', kind: 'tip', title: 'Always sum to 100', x: 'Adding the percentages is a free error check. If they do not sum to $100 \\pm 0.1$, you have made an arithmetic slip \u2014 find it before proceeding.' },

        { t: 'h', x: 'Empirical vs molecular formula' },
        { t: 'ul', items: [
          '**Empirical formula**: the simplest whole-number ratio of atoms. Determined from composition data alone.',
          '**Molecular formula**: the actual number of atoms in a molecule. Needs the molar mass *as well*.',
          'For benzene: empirical CH, molecular C$_6$H$_6$. For glucose: empirical CH$_2$O, molecular C$_6$H$_{12}$O$_6$.'
        ] },
        { t: 'formula', name: 'The link', tex: '\\text{Molecular formula} = n \\times \\text{Empirical formula},\\quad n = \\frac{\\text{molar mass}}{\\text{empirical formula mass}}', star: true },

        { t: 'h', x: 'The four-step procedure' },
        { t: 'ol', items: [
          'Assume **100 g** of compound, so each percentage becomes a mass in grams.',
          'Divide each mass by that element\u2019s **atomic mass** to get moles.',
          'Divide every result by the **smallest** of them.',
          'If fractions remain ($0.5$, $0.33$, $0.25$), multiply *all* values by 2, 3 or 4 to clear them.'
        ] },

        { t: 'worked', title: 'Worked example \u2014 the full procedure', tier: 'M',
          q: 'A compound contains $24.27\\%$ C, $4.07\\%$ H and $71.65\\%$ Cl. Its molar mass is $98.96\\ \\text{g mol}^{-1}$. Find the empirical and molecular formulae.',
          steps: [
            'In 100 g: $24.27$ g C, $4.07$ g H, $71.65$ g Cl.',
            'Moles: C $= \\dfrac{24.27}{12.01} = 2.021$; H $= \\dfrac{4.07}{1.008} = 4.038$; Cl $= \\dfrac{71.65}{35.45} = 2.021$.',
            'Divide by the smallest ($2.021$): C $= 1$, H $= 2$, Cl $= 1$.',
            'Empirical formula: **CH$_2$Cl**, empirical mass $= 12.01 + 2.016 + 35.45 = 49.48$.',
            '$n = \\dfrac{98.96}{49.48} = 2$.',
            'Molecular formula $= 2 \\times$ CH$_2$Cl $=$ **C$_2$H$_4$Cl$_2$**.'
          ],
          ans: 'Empirical CH$_2$Cl; molecular C$_2$H$_4$Cl$_2$ (1,2-dichloroethane)'
        },

        { t: 'sim' },

        { t: 'callout', kind: 'trap', title: 'Do not round too early', x: 'If step 3 gives $1.33$, that is $4/3$, not $1$. Multiply everything by 3. Rounding $1.33$ down to 1 turns C$_3$H$_4$ into CH$_4$ and destroys the answer. Rule of thumb: only round when you are within about $0.05$ of a whole number.' },
        { t: 'callout', kind: 'jee', title: 'Combustion analysis', x: 'When a hydrocarbon is burnt: all the C ends up as CO$_2$, all the H as H$_2$O. So mass of C $= \\dfrac{12}{44} \\times m(\\text{CO}_2)$ and mass of H $= \\dfrac{2}{18} \\times m(\\text{H}_2\\text{O})$. Any mass left over from the original sample is oxygen.' }
      ],

      formulas: [
        { name: 'Mass percent', tex: '\\% = \\frac{\\text{mass of element}}{\\text{molar mass}}\\times 100', star: true },
        { name: 'Molecular from empirical', tex: 'n = \\frac{M_{\\text{molecular}}}{M_{\\text{empirical}}}', star: true },
        { name: 'C from CO$_2$', tex: 'm_C = \\frac{12}{44}\\,m_{CO_2}' },
        { name: 'H from H$_2$O', tex: 'm_H = \\frac{2}{18}\\,m_{H_2O}' }
      ],

      questions: [
        { id: 'ch-01-04-q1', tier: 'G', kind: 'numeric', parSec: 45, tol: { rel: 0.02 }, kcs: ['kc-ch-percent'],
          stem: 'Calculate the percentage of carbon by mass in CO$_2$. (C $= 12$, O $= 16$)',
          answer: 27.3,
          hint: 'Mass of C in one mole, divided by the molar mass.',
          solution: [
            'Molar mass of CO$_2$ $= 12 + 32 = 44\\ \\text{g mol}^{-1}$.',
            '$\\%\\,\\text{C} = \\dfrac{12}{44} \\times 100 = 27.27\\%$.',
            'So carbon dioxide is mostly oxygen by mass \u2014 $72.7\\%$ of it.'
          ] },

        { id: 'ch-01-04-q2', tier: 'G', kind: 'mcq', parSec: 40, kcs: ['kc-ch-empirical', 'kc-ch-molecular'],
          stem: 'The empirical formula of benzene (C$_6$H$_6$) is:',
          options: ['C$_6$H$_6$', 'CH', 'C$_2$H$_2$', 'C$_3$H$_3$'],
          answer: 1,
          hint: 'Simplest whole-number ratio.',
          solution: [
            'The C : H ratio in C$_6$H$_6$ is $6:6 = 1:1$.',
            'The simplest whole-number ratio is therefore **CH**.',
            'Note that ethyne (C$_2$H$_2$) has the same empirical formula \u2014 which is exactly why the molar mass is needed to pin down the molecular formula.'
          ] },

        { id: 'ch-01-04-q3', tier: 'G', kind: 'numeric', parSec: 50, tol: { rel: 0.02 }, kcs: ['kc-ch-percent'],
          stem: 'What is the percentage of oxygen by mass in water, H$_2$O?',
          answer: 88.9,
          hint: 'Molar mass of water is 18.',
          solution: [
            'Molar mass of H$_2$O $= 2(1) + 16 = 18\\ \\text{g mol}^{-1}$.',
            '$\\%\\,\\text{O} = \\dfrac{16}{18} \\times 100 = 88.89\\%$.',
            'Hydrogen is only $11.1\\%$ by mass despite being two-thirds of the atoms \u2014 a useful reminder that mass fraction and atom fraction are different things.'
          ] },

        { id: 'ch-01-04-q4', tier: 'M', kind: 'mcq', parSec: 90, kcs: ['kc-ch-empirical'],
          stem: 'A compound contains $40\\%$ C, $6.7\\%$ H and $53.3\\%$ O by mass. Its empirical formula is:',
          options: ['CHO', 'CH$_2$O', 'C$_2$H$_4$O', 'CH$_4$O'],
          answer: 1,
          hint: 'Divide each percentage by the atomic mass, then by the smallest result.',
          solution: [
            'In 100 g: C $= \\dfrac{40}{12} = 3.33$ mol; H $= \\dfrac{6.7}{1} = 6.7$ mol; O $= \\dfrac{53.3}{16} = 3.33$ mol.',
            'Divide by the smallest ($3.33$): C $= 1$, H $= 2.01 \\approx 2$, O $= 1$.',
            'Empirical formula: **CH$_2$O**.',
            'This is the composition of formaldehyde, acetic acid *and* glucose \u2014 all share this empirical formula.'
          ] },

        { id: 'ch-01-04-q5', tier: 'M', kind: 'mcq', parSec: 90, kcs: ['kc-ch-molecular'],
          stem: 'A compound with empirical formula CH$_2$O has a molar mass of $180\\ \\text{g mol}^{-1}$. Its molecular formula is:',
          options: ['C$_3$H$_6$O$_3$', 'C$_6$H$_{12}$O$_6$', 'C$_2$H$_4$O$_2$', 'C$_5$H$_{10}$O$_5$'],
          answer: 1,
          hint: 'Divide the molar mass by the empirical formula mass.',
          solution: [
            'Empirical formula mass of CH$_2$O $= 12 + 2 + 16 = 30$.',
            '$n = \\dfrac{180}{30} = 6$.',
            'Molecular formula $= 6 \\times$ CH$_2$O $=$ **C$_6$H$_{12}$O$_6$** \u2014 glucose.'
          ] },

        { id: 'ch-01-04-q6', tier: 'M', kind: 'mcq', parSec: 95, kcs: ['kc-ch-empirical'],
          stem: 'An oxide of a metal M (atomic mass $56$) contains $70\\%$ M by mass. Its empirical formula is:',
          options: ['MO', 'M$_2$O$_3$', 'MO$_2$', 'M$_3$O$_4$'],
          answer: 1,
          hint: 'Take 100 g and find moles of each.',
          solution: [
            'In 100 g: M $= 70$ g, O $= 30$ g.',
            'Moles: M $= \\dfrac{70}{56} = 1.25$; O $= \\dfrac{30}{16} = 1.875$.',
            'Divide by the smaller: M $= 1$, O $= 1.5$.',
            'A $0.5$ remains, so multiply both by 2: M $= 2$, O $= 3$.',
            'Empirical formula: **M$_2$O$_3$** \u2014 this is Fe$_2$O$_3$, haematite.'
          ] },

        { id: 'ch-01-04-q7', tier: 'H', kind: 'mcq', parSec: 140, kcs: ['kc-ch-empirical', 'kc-ch-molecular'],
          stem: 'On combustion, $0.60$ g of an organic compound containing only C, H and O gave $0.88$ g of CO$_2$ and $0.36$ g of H$_2$O. If its molar mass is $60\\ \\text{g mol}^{-1}$, the molecular formula is:',
          options: ['CH$_2$O', 'C$_2$H$_4$O$_2$', 'C$_3$H$_8$O', 'C$_2$H$_6$O'],
          answer: 1,
          hint: 'Get the masses of C and H from the products; oxygen is whatever is left.',
          solution: [
            'Mass of C $= \\dfrac{12}{44} \\times 0.88 = 0.24$ g.',
            'Mass of H $= \\dfrac{2}{18} \\times 0.36 = 0.04$ g.',
            'Mass of O $= 0.60 - 0.24 - 0.04 = 0.32$ g.',
            'Moles: C $= 0.24/12 = 0.02$; H $= 0.04/1 = 0.04$; O $= 0.32/16 = 0.02$.',
            'Ratio $= 1 : 2 : 1$, so empirical formula CH$_2$O, empirical mass $30$.',
            '$n = 60/30 = 2$, giving **C$_2$H$_4$O$_2$** \u2014 acetic acid.'
          ] },

        { id: 'ch-01-04-q8', tier: 'H', kind: 'numeric', parSec: 130, tol: { rel: 0.03 }, kcs: ['kc-ch-percent', 'kc-ch-moleconv'],
          stem: 'What mass (in grams) of iron is present in $100$ g of Fe$_2$O$_3$? (Fe $= 56$, O $= 16$)',
          answer: 70,
          hint: 'Find the mass fraction of Fe in the formula.',
          solution: [
            'Molar mass of Fe$_2$O$_3$ $= 2(56) + 3(16) = 112 + 48 = 160\\ \\text{g mol}^{-1}$.',
            'Mass fraction of Fe $= \\dfrac{112}{160} = 0.70$.',
            'In 100 g of ore: $0.70 \\times 100 = 70$ g of iron.',
            'This calculation is the basis of ore grading in metallurgy.'
          ] },

        { id: 'ch-01-04-q9', tier: 'H', kind: 'mcq', parSec: 150, kcs: ['kc-ch-empirical'],
          stem: 'A hydrated salt MSO$_4\\cdot x$H$_2$O has molar mass $246$ g mol$^{-1}$. On heating, $2.46$ g loses $1.26$ g of water. If M has atomic mass $24$, then $x$ is:',
          options: ['$5$', '$6$', '$7$', '$10$'],
          answer: 2,
          hint: 'Find moles of the salt and moles of water lost, then take the ratio.',
          solution: [
            'Moles of hydrated salt $= \\dfrac{2.46}{246} = 0.01$ mol.',
            'Moles of water lost $= \\dfrac{1.26}{18} = 0.07$ mol.',
            'Ratio water : salt $= \\dfrac{0.07}{0.01} = 7$, so $x = 7$.',
            'Verify: MSO$_4$ $= 24 + 32 + 64 = 120$; plus $7 \\times 18 = 126$ gives $246$. \u2713',
            'This is MgSO$_4\\cdot$7H$_2$O \u2014 Epsom salt.'
          ] }
      ]
    },

    /* ---------------------------------------------------------------
       5. Stoichiometry and limiting reagent
       --------------------------------------------------------------- */
    {
      id: 'ch-01-05',
      title: 'Stoichiometry & the Limiting Reagent',
      short: 'Recipes, and what happens when an ingredient runs out',
      kcs: ['kc-ch-balance', 'kc-ch-stoich', 'kc-ch-limiting', 'kc-ch-yield'],
      prereq: ['ch-01-03'],
      estMin: 32,
      weight: 1.7,
      widget: 'reactionFactory',
      widgetTitle: 'Reaction Factory',
      widgetBrief: 'Feed reagents into a production line and find the bottleneck before the shift ends.',

      story: {
        speaker: 'MOLE-9',
        avatar: '⚗️',
        lines: [
          'Module Five. The highest-scoring module in this chapter, and the one that keeps this station breathing.',
          'Here is the whole idea. To build a sandwich you need two slices of bread and one slice of cheese. You have 100 slices of bread and 10 of cheese. How many sandwiches?',
          'Ten. Not fifty. The cheese ran out, and once it does, the remaining bread is *irrelevant*. It just sits there being bread.',
          'Chemistry has the same brutal logic. The reagent that runs out first is the **limiting reagent**, and it alone determines the yield. Everything else is excess.'
        ]
      },

      lesson: [
        { t: 'h', x: 'A balanced equation is a mole recipe' },
        { t: 'formula', name: 'The Haber process', tex: '\\text{N}_2(g) + 3\\,\\text{H}_2(g) \\longrightarrow 2\\,\\text{NH}_3(g)' },
        { t: 'p', x: 'Read it as *moles*, never as grams: 1 mole of N$_2$ reacts with 3 moles of H$_2$ to give 2 moles of NH$_3$. The coefficients are the only ratio you may use.' },

        { t: 'callout', kind: 'jee', title: 'The universal three-step method',
          x: '**1. Convert** whatever you are given into moles.\n**2. Apply** the mole ratio from the balanced equation.\n**3. Convert** the answer back into whatever is asked for (grams, litres, particles).\n\nEvery stoichiometry problem in the syllabus is this, and only this.' },

        { t: 'worked', title: 'Worked example \u2014 a straight stoichiometry problem', tier: 'M',
          q: 'What mass of CO$_2$ is produced when $25$ g of CaCO$_3$ decomposes completely? $\\text{CaCO}_3 \\to \\text{CaO} + \\text{CO}_2$',
          steps: [
            'Step 1 \u2014 to moles: $M(\\text{CaCO}_3) = 40 + 12 + 48 = 100$, so $n = \\dfrac{25}{100} = 0.25$ mol.',
            'Step 2 \u2014 mole ratio: CaCO$_3$ : CO$_2$ $= 1 : 1$, so $n(\\text{CO}_2) = 0.25$ mol.',
            'Step 3 \u2014 back to mass: $m = 0.25 \\times 44 = 11$ g.'
          ],
          ans: '$11$ g of CO$_2$ (equivalently $5.6$ L at STP)'
        },

        { t: 'h', x: 'The limiting reagent' },
        { t: 'p', x: 'When you are given amounts of **two or more** reactants, you must find which one runs out first. There is only one reliable method.' },
        { t: 'callout', kind: 'tip', title: 'The divide-by-coefficient method',
          x: 'Convert each reactant to moles, then **divide by its stoichiometric coefficient**. The **smallest** quotient identifies the limiting reagent. This works every time, including for awkward ratios where intuition fails.' },

        { t: 'worked', title: 'Worked example \u2014 finding the bottleneck', tier: 'H',
          q: '$50.0$ kg of N$_2$ and $10.0$ kg of H$_2$ are mixed to produce ammonia. What mass of NH$_3$ forms?',
          steps: [
            'Moles: $n(\\text{N}_2) = \\dfrac{50000}{28} = 1786$ mol; $n(\\text{H}_2) = \\dfrac{10000}{2} = 5000$ mol.',
            'Divide by coefficients: N$_2 \\to \\dfrac{1786}{1} = 1786$; H$_2 \\to \\dfrac{5000}{3} = 1667$.',
            'The smaller quotient is hydrogen, so **H$_2$ is limiting**.',
            'Use the limiting reagent: H$_2$ : NH$_3$ $= 3 : 2$, so $n(\\text{NH}_3) = \\dfrac{2}{3} \\times 5000 = 3333$ mol.',
            'Mass $= 3333 \\times 17 = 56\\,667$ g $= 56.7$ kg.'
          ],
          ans: '$56.7$ kg of NH$_3$; nitrogen is in excess and some remains unreacted.'
        },

        { t: 'sim' },

        { t: 'h', x: 'Yield' },
        { t: 'formula', name: 'Percentage yield', tex: '\\%\\ \\text{yield} = \\frac{\\text{actual yield}}{\\text{theoretical yield}} \\times 100', star: true },
        { t: 'p', x: 'Real reactions lose product to side reactions, incomplete conversion and losses during transfer. **Theoretical yield** comes from the limiting reagent; actual yield comes from the balance.' },

        { t: 'callout', kind: 'trap', title: 'Three ways this goes wrong', x: '**1.** Comparing masses instead of moles \u2014 grams tell you nothing about the ratio.\n**2.** Forgetting to divide by the coefficient (the reagent with fewer moles is *not* always limiting).\n**3.** Computing yield from the reagent in excess. The excess reagent is a spectator; it cannot limit anything.' }
      ],

      formulas: [
        { name: 'Stoichiometry', tex: '\\frac{n_A}{\\nu_A} = \\frac{n_B}{\\nu_B}', star: true, note: '$\\nu$ = coefficient' },
        { name: 'Limiting reagent test', tex: '\\min\\left(\\frac{n_i}{\\nu_i}\\right) \\Rightarrow \\text{limiting}', star: true },
        { name: 'Percentage yield', tex: '\\% = \\frac{\\text{actual}}{\\text{theoretical}}\\times100', star: true },
        { name: 'Haber process', tex: '\\text{N}_2 + 3\\text{H}_2 \\to 2\\text{NH}_3' }
      ],

      questions: [
        { id: 'ch-01-05-q1', tier: 'G', kind: 'mcq', parSec: 40, kcs: ['kc-ch-balance', 'kc-ch-stoich'],
          stem: 'In the reaction $2\\text{H}_2 + \\text{O}_2 \\to 2\\text{H}_2\\text{O}$, how many moles of water are produced from $4$ moles of H$_2$ (with excess O$_2$)?',
          options: ['$2$', '$4$', '$8$', '$1$'],
          answer: 1,
          hint: 'The H$_2$ : H$_2$O ratio is 2 : 2.',
          solution: [
            'The coefficients give H$_2$ : H$_2$O $= 2 : 2 = 1 : 1$.',
            'So $4$ mol of H$_2$ produces $4$ mol of H$_2$O.',
            'Oxygen is in excess, so it does not limit anything here.'
          ] },

        { id: 'ch-01-05-q2', tier: 'G', kind: 'mcq', parSec: 45, kcs: ['kc-ch-limiting'],
          stem: 'The limiting reagent in a reaction is the one that:',
          options: [
            'has the smallest mass',
            'has the smallest number of moles',
            'is completely consumed first and determines the yield',
            'is left over at the end'
          ],
          answer: 2,
          hint: 'Think about the sandwich analogy.',
          solution: [
            'The limiting reagent is consumed completely, and once it is gone the reaction stops.',
            'It therefore sets the maximum (theoretical) yield.',
            'It need **not** have the smallest mass or even the smallest number of moles \u2014 the stoichiometric coefficients decide, which is why we divide moles by coefficients.'
          ] },

        { id: 'ch-01-05-q3', tier: 'G', kind: 'numeric', parSec: 60, tol: { rel: 0.03 }, kcs: ['kc-ch-stoich'],
          stem: 'What mass (in g) of CO$_2$ is produced by the complete decomposition of $25$ g of CaCO$_3$? (Ca $= 40$, C $= 12$, O $= 16$)',
          answer: 11,
          hint: 'Moles of CaCO$_3$, then 1:1 to CO$_2$, then back to mass.',
          solution: [
            '$M(\\text{CaCO}_3) = 40 + 12 + 3(16) = 100\\ \\text{g mol}^{-1}$.',
            '$n = 25/100 = 0.25$ mol.',
            '$\\text{CaCO}_3 \\to \\text{CaO} + \\text{CO}_2$ gives a 1 : 1 ratio, so $n(\\text{CO}_2) = 0.25$ mol.',
            '$m = 0.25 \\times 44 = 11$ g.'
          ] },

        { id: 'ch-01-05-q4', tier: 'M', kind: 'mcq', parSec: 90, kcs: ['kc-ch-limiting'],
          stem: '$16$ g of CH$_4$ reacts with $32$ g of O$_2$: $\\text{CH}_4 + 2\\text{O}_2 \\to \\text{CO}_2 + 2\\text{H}_2\\text{O}$. The mass of CO$_2$ formed is:',
          options: ['$44$ g', '$22$ g', '$88$ g', '$11$ g'],
          answer: 1,
          hint: 'Divide each reactant\u2019s moles by its coefficient.',
          solution: [
            'Moles: CH$_4 = 16/16 = 1$ mol; O$_2 = 32/32 = 1$ mol.',
            'Divide by coefficients: CH$_4 \\to 1/1 = 1$; O$_2 \\to 1/2 = 0.5$.',
            'O$_2$ gives the smaller quotient, so **oxygen is limiting**.',
            'From O$_2$: $n(\\text{CO}_2) = \\dfrac{1}{2} \\times 1 = 0.5$ mol.',
            '$m = 0.5 \\times 44 = 22$ g. Half the methane is left unburnt.'
          ] },

        { id: 'ch-01-05-q5', tier: 'M', kind: 'numeric', parSec: 90, tol: { rel: 0.04 }, kcs: ['kc-ch-yield'],
          stem: 'A reaction has a theoretical yield of $56.7$ kg but only $45.0$ kg is obtained. Calculate the percentage yield.',
          answer: 79.4,
          hint: 'Actual over theoretical, times 100.',
          solution: [
            '$\\%\\ \\text{yield} = \\dfrac{45.0}{56.7} \\times 100$.',
            '$= 0.7937 \\times 100 = 79.4\\%$.',
            'Industrial ammonia plants run well below 100% per pass, which is why unreacted gas is recycled.'
          ] },

        { id: 'ch-01-05-q6', tier: 'M', kind: 'mcq', parSec: 95, kcs: ['kc-ch-stoich', 'kc-ch-molarmass'],
          stem: 'What volume of O$_2$ at STP is needed to completely burn $1$ mole of C$_2$H$_6$? $\\;2\\text{C}_2\\text{H}_6 + 7\\text{O}_2 \\to 4\\text{CO}_2 + 6\\text{H}_2\\text{O}$',
          options: ['$22.4$ L', '$78.4$ L', '$156.8$ L', '$44.8$ L'],
          answer: 1,
          hint: 'Mole ratio first, then multiply by $22.4$.',
          solution: [
            'From the equation, $2$ mol C$_2$H$_6$ needs $7$ mol O$_2$.',
            'So $1$ mol C$_2$H$_6$ needs $3.5$ mol O$_2$.',
            '$V = 3.5 \\times 22.4 = 78.4$ L at STP.'
          ] },

        { id: 'ch-01-05-q7', tier: 'H', kind: 'numeric', parSec: 150, tol: { rel: 0.03 }, kcs: ['kc-ch-limiting', 'kc-ch-stoich'],
          stem: '$50.0$ kg of N$_2$ and $10.0$ kg of H$_2$ are mixed: $\\text{N}_2 + 3\\text{H}_2 \\to 2\\text{NH}_3$. What mass of NH$_3$ (in kg) is formed?',
          answer: 56.7,
          hint: 'Divide moles by coefficients to spot the limiting reagent.',
          solution: [
            '$n(\\text{N}_2) = \\dfrac{50\\,000}{28} = 1786$ mol; $n(\\text{H}_2) = \\dfrac{10\\,000}{2} = 5000$ mol.',
            'Divide by coefficients: $\\dfrac{1786}{1} = 1786$ vs $\\dfrac{5000}{3} = 1667$.',
            '$1667 < 1786$, so H$_2$ is the limiting reagent.',
            '$n(\\text{NH}_3) = \\dfrac{2}{3} \\times 5000 = 3333$ mol.',
            '$m = 3333 \\times 17 = 56\\,667$ g $\\approx 56.7$ kg.',
            'Nitrogen left over: $1786 - 1667 = 119$ mol, about $3.3$ kg.'
          ] },

        { id: 'ch-01-05-q8', tier: 'H', kind: 'mcq', parSec: 150, kcs: ['kc-ch-limiting', 'kc-ch-yield'],
          stem: '$6.3$ g of Zn (At. mass $65$) reacts with $100$ mL of $1\\ \\text{M}$ HCl: $\\text{Zn} + 2\\text{HCl} \\to \\text{ZnCl}_2 + \\text{H}_2$. The volume of H$_2$ at STP is:',
          options: ['$2.24$ L', '$1.12$ L', '$0.56$ L', '$4.48$ L'],
          answer: 1,
          hint: 'Find moles of both reactants; remember HCl needs 2 per Zn.',
          solution: [
            '$n(\\text{Zn}) = \\dfrac{6.3}{65} = 0.0969$ mol.',
            '$n(\\text{HCl}) = 1\\ \\text{M} \\times 0.100\\ \\text{L} = 0.100$ mol.',
            'Divide by coefficients: Zn $\\to 0.0969/1 = 0.0969$; HCl $\\to 0.100/2 = 0.050$.',
            'HCl is limiting.',
            '$n(\\text{H}_2) = \\dfrac{1}{2} \\times 0.100 = 0.050$ mol.',
            '$V = 0.050 \\times 22.4 = 1.12$ L.'
          ] },

        { id: 'ch-01-05-q9', tier: 'H', kind: 'numeric', parSec: 160, tol: { rel: 0.04 }, kcs: ['kc-ch-limiting', 'kc-ch-stoich'],
          stem: '$2.76$ g of silver carbonate (molar mass $276$) is heated, giving silver metal and gaseous products: $\\text{Ag}_2\\text{CO}_3 \\to 2\\text{Ag} + \\text{CO}_2 + \\tfrac{1}{2}\\text{O}_2$. What mass of silver residue (in g) remains? (Ag $= 108$)',
          answer: 2.16,
          hint: 'Moles of carbonate, then the Ag ratio.',
          solution: [
            '$n(\\text{Ag}_2\\text{CO}_3) = \\dfrac{2.76}{276} = 0.01$ mol.',
            'Ratio Ag$_2$CO$_3$ : Ag $= 1 : 2$, so $n(\\text{Ag}) = 0.02$ mol.',
            '$m = 0.02 \\times 108 = 2.16$ g.',
            'Quick check: mass lost as gas $= 2.76 - 2.16 = 0.60$ g, which is $0.01$ mol CO$_2$ ($0.44$ g) plus $0.005$ mol O$_2$ ($0.16$ g). \u2713'
          ] }
      ]
    },

    /* ---------------------------------------------------------------
       6. Concentration terms
       --------------------------------------------------------------- */
    {
      id: 'ch-01-06',
      title: 'Concentration Terms',
      short: 'Six ways to say "how much is dissolved"',
      kcs: ['kc-ch-masspct', 'kc-ch-molarity', 'kc-ch-molality', 'kc-ch-molefrac', 'kc-ch-dilution'],
      prereq: ['ch-01-03'],
      estMin: 30,
      weight: 1.5,
      widget: 'solutionMixer',
      widgetTitle: 'Solution Bench',
      widgetBrief: 'Mix, dilute and heat solutions while four concentration readouts update live \u2014 and watch which ones move.',

      story: {
        speaker: 'MOLE-9',
        avatar: '⚗️',
        lines: [
          'Final module. The scrubber needs a $0.5$ molar solution. Not $0.5$ molal. Not $0.5$ mole fraction. Molar.',
          'Cadet, these are not synonyms. They differ in what goes in the denominator \u2014 and that difference has ended experiments.',
          'One more thing, and it comes up every single year: **molarity depends on temperature** because volume expands with heat. Molality does not, because mass does not care how hot it is.',
          'Get this right and the scrubber works. Get it wrong and we all get an unscheduled lesson in partial pressures of CO\u2082.'
        ]
      },

      lesson: [
        { t: 'h', x: 'The six measures' },
        { t: 'table',
          head: ['Term', 'Symbol', 'Definition', 'Temperature-dependent?'],
          rows: [
            ['Mass percent', '% w/w', '$\\dfrac{\\text{mass of solute}}{\\text{mass of solution}} \\times 100$', 'No'],
            ['Volume percent', '% v/v', '$\\dfrac{\\text{volume of solute}}{\\text{volume of solution}} \\times 100$', 'Yes'],
            ['Parts per million', 'ppm', '$\\dfrac{\\text{mass of solute}}{\\text{mass of solution}} \\times 10^{6}$', 'No'],
            ['Molarity', 'M', '$\\dfrac{\\text{moles of solute}}{\\text{volume of \\textbf{solution} in L}}$', '**Yes**'],
            ['Molality', 'm', '$\\dfrac{\\text{moles of solute}}{\\text{mass of \\textbf{solvent} in kg}}$', 'No'],
            ['Mole fraction', '$x$', '$\\dfrac{n_{\\text{component}}}{n_{\\text{total}}}$', 'No']
          ]
        },

        { t: 'callout', kind: 'jee', title: 'The two distinctions examiners test',
          x: '**Molarity** uses the volume of the whole **solution**; **molality** uses the mass of the **solvent** alone.\n\nAnd only molarity (and volume %) change with temperature, because only they involve a volume. This is why precise analytical work quotes molality.' },

        { t: 'h', x: 'Molarity' },
        { t: 'formula', name: 'Molarity', tex: 'M = \\frac{n_{\\text{solute}}}{V_{\\text{solution}}\\ (\\text{L})} = \\frac{w \\times 1000}{M_{\\text{solute}} \\times V_{\\text{(mL)}}}', star: true },
        { t: 'worked', title: 'Worked example \u2014 preparing a solution', tier: 'G',
          q: 'What is the molarity of a solution made by dissolving $5.85$ g of NaCl in enough water to make $500$ mL of solution? (NaCl $= 58.5$)',
          steps: [
            '$n = \\dfrac{5.85}{58.5} = 0.1$ mol.',
            '$V = 500\\ \\text{mL} = 0.500$ L.',
            '$M = \\dfrac{0.1}{0.500} = 0.2$ M.'
          ],
          ans: '$0.2\\ \\text{M}$ (also written $0.2\\ \\text{mol L}^{-1}$)'
        },

        { t: 'h', x: 'Dilution' },
        { t: 'formula', name: 'Dilution law', tex: 'M_1V_1 = M_2V_2', star: true,
          note: 'Adding solvent changes the volume but not the moles of solute.' },

        { t: 'h', x: 'Molality' },
        { t: 'formula', name: 'Molality', tex: 'm = \\frac{n_{\\text{solute}}}{W_{\\text{solvent}}\\ (\\text{kg})} = \\frac{w \\times 1000}{M_{\\text{solute}} \\times W_{\\text{solvent (g)}}}', star: true },

        { t: 'h', x: 'Mole fraction' },
        { t: 'formula', name: 'Mole fraction', tex: 'x_A = \\frac{n_A}{n_A + n_B}, \\quad x_A + x_B = 1', star: true },

        { t: 'h', x: 'Converting molarity to molality' },
        { t: 'p', x: 'This needs the density, and it is a standing JEE favourite. Take exactly $1$ litre of solution and work from there.' },
        { t: 'worked', title: 'Worked example \u2014 the conversion', tier: 'H',
          q: 'A $2\\ \\text{M}$ solution of a solute (molar mass $40\\ \\text{g mol}^{-1}$) has density $1.2\\ \\text{g mL}^{-1}$. Find its molality.',
          steps: [
            'Take $1$ L of solution. It contains $2$ mol of solute.',
            'Mass of solute $= 2 \\times 40 = 80$ g.',
            'Mass of solution $= 1000\\ \\text{mL} \\times 1.2\\ \\text{g mL}^{-1} = 1200$ g.',
            'Mass of **solvent** $= 1200 - 80 = 1120$ g $= 1.12$ kg.',
            '$m = \\dfrac{2}{1.12} = 1.79$ mol kg$^{-1}$.'
          ],
          ans: '$1.79\\ \\text{m}$'
        },
        { t: 'formula', name: 'General conversion', tex: 'm = \\frac{1000\\,M}{1000\\rho - M\\,M_{\\text{solute}}}',
          note: '$\\rho$ in g mL$^{-1}$. Derive it rather than memorise it \u2014 the 1-litre method above always works.' },

        { t: 'sim' },

        { t: 'callout', kind: 'trap', title: 'The "in 500 mL of water" trap', x: 'Read the wording with care. *"Dissolved in 500 mL of water"* fixes the **solvent** \u2014 that is molality territory, and the final solution volume will be slightly more than 500 mL. *"Made up to 500 mL"* fixes the **solution** \u2014 that is molarity. Examiners switch between the two deliberately.' }
      ],

      formulas: [
        { name: 'Molarity', tex: 'M = n/V_{\\text{sol}}(\\text{L})', star: true },
        { name: 'Molality', tex: 'm = n/W_{\\text{solvent}}(\\text{kg})', star: true },
        { name: 'Mole fraction', tex: 'x_A = n_A/(n_A+n_B)', star: true },
        { name: 'Dilution', tex: 'M_1V_1 = M_2V_2', star: true },
        { name: 'Mass percent', tex: '\\%w/w = \\frac{w_{\\text{solute}}}{w_{\\text{solution}}}\\times100' },
        { name: 'ppm', tex: '\\text{ppm} = \\frac{w_{\\text{solute}}}{w_{\\text{solution}}}\\times10^{6}' },
        { name: 'M to m', tex: 'm = \\frac{1000M}{1000\\rho - M M_{\\text{solute}}}' }
      ],

      questions: [
        { id: 'ch-01-06-q1', tier: 'G', kind: 'numeric', parSec: 55, tol: { rel: 0.03 }, kcs: ['kc-ch-molarity'],
          stem: '$5.85$ g of NaCl is dissolved and made up to $500$ mL of solution. Find the molarity. (NaCl $= 58.5$)',
          answer: 0.2,
          hint: 'Moles divided by litres of solution.',
          solution: [
            '$n = \\dfrac{5.85}{58.5} = 0.1$ mol.',
            '$V = 0.500$ L.',
            '$M = \\dfrac{0.1}{0.5} = 0.2\\ \\text{mol L}^{-1}$.'
          ] },

        { id: 'ch-01-06-q2', tier: 'G', kind: 'mcq', parSec: 45, kcs: ['kc-ch-molarity', 'kc-ch-molality'],
          stem: 'Which concentration term is **independent of temperature**?',
          options: ['Molarity', 'Molality', 'Volume percent', 'Normality'],
          answer: 1,
          hint: 'Which one has no volume in its definition?',
          solution: [
            'Molality is moles of solute per **kilogram of solvent** \u2014 both mass quantities.',
            'Mass does not change with temperature, so molality does not either.',
            'Molarity, normality and volume percent all involve a volume, which expands on heating, so all three are temperature-dependent.'
          ] },

        { id: 'ch-01-06-q3', tier: 'G', kind: 'numeric', parSec: 50, tol: { rel: 0.03 }, kcs: ['kc-ch-dilution'],
          stem: '$100$ mL of $1\\ \\text{M}$ HCl is diluted to make a $0.2\\ \\text{M}$ solution. What is the final volume in mL?',
          answer: 500,
          hint: 'Use $M_1V_1 = M_2V_2$.',
          solution: [
            '$M_1V_1 = M_2V_2$.',
            '$1 \\times 100 = 0.2 \\times V_2$.',
            '$V_2 = \\dfrac{100}{0.2} = 500$ mL.',
            'So $400$ mL of water is added. The moles of HCl are unchanged throughout \u2014 that is the whole basis of the formula.'
          ] },

        { id: 'ch-01-06-q4', tier: 'M', kind: 'numeric', parSec: 80, tol: { rel: 0.03 }, kcs: ['kc-ch-molefrac'],
          stem: 'A solution contains $18$ g of water and $46$ g of ethanol (C$_2$H$_5$OH, $M = 46$). What is the mole fraction of ethanol?',
          answer: 0.5,
          hint: 'Convert both to moles first.',
          solution: [
            '$n(\\text{H}_2\\text{O}) = \\dfrac{18}{18} = 1$ mol.',
            '$n(\\text{ethanol}) = \\dfrac{46}{46} = 1$ mol.',
            '$x_{\\text{ethanol}} = \\dfrac{1}{1 + 1} = 0.5$.',
            'Note that mole fractions are dimensionless and always sum to 1.'
          ] },

        { id: 'ch-01-06-q5', tier: 'M', kind: 'numeric', parSec: 85, tol: { rel: 0.04 }, kcs: ['kc-ch-molality'],
          stem: '$4$ g of NaOH ($M = 40$) is dissolved in $250$ g of water. Calculate the molality.',
          answer: 0.4,
          hint: 'Mass of **solvent**, in kilograms.',
          solution: [
            '$n(\\text{NaOH}) = \\dfrac{4}{40} = 0.1$ mol.',
            'Mass of solvent $= 250$ g $= 0.250$ kg.',
            '$m = \\dfrac{0.1}{0.250} = 0.4\\ \\text{mol kg}^{-1}$.',
            'Note we did **not** need the density \u2014 molality never does.'
          ] },

        { id: 'ch-01-06-q6', tier: 'M', kind: 'mcq', parSec: 80, kcs: ['kc-ch-masspct'],
          stem: 'A sample of water contains $2$ mg of fluoride ions per kilogram of water. The concentration in ppm is:',
          options: ['$0.2$', '$2$', '$20$', '$200$'],
          answer: 1,
          hint: 'ppm is milligrams per kilogram for dilute aqueous solutions.',
          solution: [
            'ppm $= \\dfrac{\\text{mass of solute}}{\\text{mass of solution}} \\times 10^{6}$.',
            '$= \\dfrac{2 \\times 10^{-3}\\ \\text{g}}{1000\\ \\text{g}} \\times 10^{6} = 2$ ppm.',
            'Useful shortcut for dilute aqueous solutions: **1 mg per kg = 1 ppm**.',
            'For reference, drinking water guidelines cap fluoride at about 1.5 ppm.'
          ] },

        { id: 'ch-01-06-q7', tier: 'H', kind: 'numeric', parSec: 140, tol: { rel: 0.04 }, kcs: ['kc-ch-dilution', 'kc-ch-molality'],
          stem: 'A $2\\ \\text{M}$ aqueous solution of a solute of molar mass $40\\ \\text{g mol}^{-1}$ has density $1.2\\ \\text{g mL}^{-1}$. Calculate its molality (mol kg$^{-1}$).',
          answer: 1.79,
          hint: 'Take exactly 1 litre of solution and account for every gram.',
          solution: [
            'Take $1$ L of solution: it contains $2$ mol of solute.',
            'Mass of solute $= 2 \\times 40 = 80$ g.',
            'Mass of solution $= 1000 \\times 1.2 = 1200$ g.',
            'Mass of solvent $= 1200 - 80 = 1120$ g $= 1.12$ kg.',
            '$m = \\dfrac{2}{1.12} = 1.786 \\approx 1.79\\ \\text{mol kg}^{-1}$.',
            'Note $m > M$ here because the solution is denser than water.'
          ] },

        { id: 'ch-01-06-q8', tier: 'H', kind: 'mcq', parSec: 140, kcs: ['kc-ch-molarity', 'kc-ch-dilution'],
          stem: '$500$ mL of $0.2\\ \\text{M}$ NaCl is mixed with $300$ mL of $0.4\\ \\text{M}$ NaCl. The molarity of the resulting solution (assume volumes are additive) is:',
          options: ['$0.275\\ \\text{M}$', '$0.300\\ \\text{M}$', '$0.600\\ \\text{M}$', '$0.250\\ \\text{M}$'],
          answer: 0,
          hint: 'Total moles divided by total volume.',
          solution: [
            'Moles from the first: $0.2 \\times 0.500 = 0.10$ mol.',
            'Moles from the second: $0.4 \\times 0.300 = 0.12$ mol.',
            'Total moles $= 0.22$ mol; total volume $= 0.800$ L.',
            '$M = \\dfrac{0.22}{0.800} = 0.275$ M.',
            'The result always lies between the two starting molarities \u2014 a quick sanity check.'
          ] },

        { id: 'ch-01-06-q9', tier: 'H', kind: 'numeric', parSec: 150, tol: { rel: 0.04 }, kcs: ['kc-ch-masspct', 'kc-ch-molarity'],
          stem: 'Concentrated sulphuric acid is $98\\%$ H$_2$SO$_4$ by mass with density $1.84\\ \\text{g mL}^{-1}$. Calculate its molarity. ($M = 98\\ \\text{g mol}^{-1}$)',
          answer: 18.4,
          hint: 'Start from 1 litre of the acid and find how many grams of H$_2$SO$_4$ it holds.',
          solution: [
            'Take $1$ L $= 1000$ mL of acid. Its mass $= 1000 \\times 1.84 = 1840$ g.',
            'Mass of H$_2$SO$_4$ in it $= 98\\%$ of $1840 = 1803.2$ g.',
            'Moles $= \\dfrac{1803.2}{98} = 18.4$ mol.',
            'Since this is in 1 litre, $M = 18.4\\ \\text{mol L}^{-1}$.',
            'This is the number printed on every bottle of concentrated sulphuric acid \u2014 now you know where it comes from.'
          ] }
      ]
    }
  ],

  boss: {
    id: 'ch-01-boss',
    name: 'Lord Stoichion',
    title: 'The Unbalanced',
    avatar: '🧪',
    hp: 10,
    lives: 3,
    timePerQ: 110,
    intro: 'The synthesis bay floods with an acrid green vapour. Something enormous condenses out of it, equations crawling across its surface, none of them balanced. "MASS," it hisses, "IS NEGOTIABLE."',
    defeat: 'The equations on its surface snap into balance one by one, and the thing simply cancels out. MOLE-9 whoops. "Reagents accounted for, Cadet! Every atom where it should be. The scrubber is back online and we are all still breathing. I call that a good afternoon."',
    taunts: [
      'Which reagent limits you? Choose wrongly.',
      'Molar or molal? They are not the same and you know it.',
      'You forgot to balance. You always forget to balance.',
      'Empirical is not molecular.'
    ],
    extraQuestions: [
      { id: 'ch-01-boss-q1', tier: 'H', kind: 'mcq', parSec: 130, kcs: ['kc-ch-moleconv', 'kc-ch-stoich'],
        stem: 'The number of moles of KMnO$_4$ needed to oxidise $1$ mole of oxalate ion in acidic medium is:',
        options: ['$0.4$', '$0.5$', '$1.0$', '$2.5$'],
        answer: 0,
        hint: 'Balance the electrons: Mn goes $+7 \\to +2$, and each oxalate loses 2 electrons.',
        solution: [
          'MnO$_4^-$ gains 5 electrons per Mn ($+7 \\to +2$).',
          'C$_2$O$_4^{2-}$ loses 2 electrons per oxalate ($+3 \\to +4$ per carbon, 2 carbons).',
          'Electron balance: $5 \\times n(\\text{MnO}_4^-) = 2 \\times n(\\text{C}_2\\text{O}_4^{2-})$.',
          '$n(\\text{MnO}_4^-) = \\dfrac{2}{5} \\times 1 = 0.4$ mol.'
        ] },
      { id: 'ch-01-boss-q2', tier: 'M', kind: 'mcq', parSec: 100, kcs: ['kc-ch-moleconv'],
        stem: 'Which contains the greatest number of molecules?',
        options: ['$1$ g of H$_2$', '$1$ g of N$_2$', '$1$ g of O$_2$', '$1$ g of CH$_4$'],
        answer: 0,
        hint: 'Smallest molar mass wins for a fixed mass.',
        solution: [
          'For a fixed mass, the number of molecules is $\\dfrac{m}{M}N_A$, so the smallest $M$ wins.',
          'Molar masses: H$_2$ = 2, CH$_4$ = 16, N$_2$ = 28, O$_2$ = 32.',
          'H$_2$ gives $0.5$ mol $= 3.01\\times10^{23}$ molecules \u2014 the most by a wide margin.'
        ] },
      { id: 'ch-01-boss-q3', tier: 'H', kind: 'numeric', parSec: 140, tol: { rel: 0.04 }, kcs: ['kc-ch-limiting', 'kc-ch-yield'],
        stem: '$1$ mole of BaCl$_2$ is mixed with $1$ mole of Na$_2$SO$_4$ to precipitate BaSO$_4$ ($M = 233$). Assuming complete reaction, what mass of precipitate (in g) forms?',
        answer: 233,
        hint: 'Check the stoichiometric ratio first.',
        solution: [
          '$\\text{BaCl}_2 + \\text{Na}_2\\text{SO}_4 \\to \\text{BaSO}_4\\downarrow + 2\\text{NaCl}$.',
          'The ratio is $1:1$, and both reagents are supplied as 1 mole \u2014 neither is limiting.',
          '$n(\\text{BaSO}_4) = 1$ mol.',
          '$m = 1 \\times 233 = 233$ g.'
        ] }
    ]
  },

  formulaSheet: [
    { name: 'Avogadro number', tex: 'N_A = 6.022\\times10^{23}\\ \\text{mol}^{-1}' },
    { name: 'Moles from mass', tex: 'n = m/M' },
    { name: 'Particles', tex: 'N = nN_A' },
    { name: 'Gas volume at STP', tex: 'V = 22.4\\,n\\ \\text{L}\\ (273\\,\\text{K},\\,1\\,\\text{atm})' },
    { name: 'Ideal gas', tex: 'PV = nRT' },
    { name: 'Average atomic mass', tex: '\\bar{A} = \\sum f_iA_i/100' },
    { name: 'Mass percent', tex: '\\% = \\frac{\\text{mass of element}}{\\text{molar mass}}\\times100' },
    { name: 'Molecular from empirical', tex: 'n = M_{\\text{mol}}/M_{\\text{emp}}' },
    { name: 'C from CO2', tex: 'm_C = \\tfrac{12}{44}m_{CO_2}' },
    { name: 'H from H2O', tex: 'm_H = \\tfrac{2}{18}m_{H_2O}' },
    { name: 'Limiting reagent', tex: '\\min(n_i/\\nu_i)' },
    { name: 'Percentage yield', tex: '\\frac{\\text{actual}}{\\text{theoretical}}\\times100' },
    { name: 'Molarity', tex: 'M = \\frac{w\\times1000}{M_{\\text{solute}}\\times V_{mL}}' },
    { name: 'Molality', tex: 'm = \\frac{w\\times1000}{M_{\\text{solute}}\\times W_{\\text{solvent},g}}' },
    { name: 'Mole fraction', tex: 'x_A = n_A/(n_A+n_B)' },
    { name: 'Dilution', tex: 'M_1V_1 = M_2V_2' },
    { name: 'M to m', tex: 'm = \\frac{1000M}{1000\\rho - MM_{\\text{solute}}}' },
    { name: 'ppm', tex: '\\text{ppm} = \\frac{w_{\\text{solute}}}{w_{\\text{solution}}}\\times10^{6}' }
  ]
};
