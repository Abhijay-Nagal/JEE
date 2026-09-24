/**
 * Chemistry - Chapter 2: Atomic Structure
 *
 * JEE Main Unit 2. Six topics tracing the argument from cathode rays to
 * orbitals: each model is introduced by the experiment that broke the one
 * before it, which is both the historical truth and the easiest way to
 * remember why any of them exist.
 */

export default {
  id: 'ch-02',
  subject: 'chemistry',
  number: 2,
  title: 'Atomic Structure',
  subtitle: 'Four models, each killed by an experiment',
  blurb: 'Dalton\u2019s indivisible atom lasted a century. Then a series of experiments took it apart, and each replacement failed in turn until the answer stopped being a picture and became a probability.',
  jeeWeight: 4.0,
  estMin: 300,
  icon: '\u269b\ufe0f',

  guide: {
    name: 'MOLE-9',
    full: 'Molecular Ledger & Equilibrium unit, mark 9',
    avatar: '\u2697\ufe0f',
    voice: 'enthusiastic, slightly manic, loves a good ratio'
  },

  intro: {
    speaker: 'MOLE-9',
    avatar: '\u2697\ufe0f',
    lines: [
      'Cadet! Back already? Excellent, because the spectrometer is doing something *interesting*.',
      'It is reading the hydrogen lamp and reporting exactly four visible lines. Not a smear \u2014 four sharp lines, always the same four, every single time.',
      'A continuous atom cannot do that. Whatever is inside hydrogen can only release energy in fixed amounts, which means it can only *hold* energy in fixed amounts.',
      'Six modules. We are going to take the atom apart, and every model we build will be destroyed by the next experiment. That is not failure \u2014 that is how this works.'
    ]
  },

  /* ================================================================ */
  kcs: {
    'kc-ch2-electron':  { name: 'Discovery of the electron',          weight: 1.0, prereq: [] },
    'kc-ch2-nucleus':   { name: 'The nuclear atom',                   weight: 1.2, prereq: ['kc-ch2-electron'] },
    'kc-ch2-isotopes':  { name: 'Isotopes, isobars and isotones',     weight: 1.2, prereq: ['kc-ch2-nucleus'] },
    'kc-ch2-modelfail': { name: 'Why the Rutherford model fails',     weight: 1.1, prereq: ['kc-ch2-nucleus'] },

    'kc-ch2-emwave':    { name: 'Wavelength, frequency, wavenumber',  weight: 1.2, prereq: [] },
    'kc-ch2-planck':    { name: 'Planck quantisation, E = h\u03bd',        weight: 1.5, prereq: ['kc-ch2-emwave'] },
    'kc-ch2-photo':     { name: 'The photoelectric effect',           weight: 1.6, prereq: ['kc-ch2-planck'] },

    'kc-ch2-bohr':      { name: 'Bohr postulates and orbit radii',    weight: 1.6, prereq: ['kc-ch2-modelfail', 'kc-ch2-planck'] },
    'kc-ch2-energy':    { name: 'Energy levels and ionisation',       weight: 1.7, prereq: ['kc-ch2-bohr'] },
    'kc-ch2-spectra':   { name: 'Hydrogen spectral series',           weight: 1.6, prereq: ['kc-ch2-energy'] },

    'kc-ch2-debroglie': { name: 'de Broglie wavelength',              weight: 1.5, prereq: ['kc-ch2-planck'] },
    'kc-ch2-heisen':    { name: 'Heisenberg uncertainty principle',   weight: 1.4, prereq: ['kc-ch2-debroglie'] },

    'kc-ch2-qnumbers':  { name: 'The four quantum numbers',           weight: 1.8, prereq: ['kc-ch2-bohr', 'kc-ch2-debroglie'] },
    'kc-ch2-orbitals':  { name: 'Orbital shapes and counting',        weight: 1.6, prereq: ['kc-ch2-qnumbers'] },
    'kc-ch2-nodes':     { name: 'Radial and angular nodes',           weight: 1.2, prereq: ['kc-ch2-orbitals'] },

    'kc-ch2-aufbau':    { name: 'Aufbau and the (n+l) rule',          weight: 1.6, prereq: ['kc-ch2-orbitals'] },
    'kc-ch2-pauli':     { name: 'Pauli exclusion principle',          weight: 1.4, prereq: ['kc-ch2-qnumbers'] },
    'kc-ch2-hund':      { name: 'Hund\u2019s rule and unpaired electrons', weight: 1.5, prereq: ['kc-ch2-aufbau', 'kc-ch2-pauli'] },
    'kc-ch2-exceptions':{ name: 'Half-filled and filled stability',   weight: 1.3, prereq: ['kc-ch2-hund'] }
  },

  /* ================================================================ */
  topics: [
    /* ---------------------------------------------------------------
       1. Subatomic particles and the nuclear atom
       --------------------------------------------------------------- */
    {
      id: 'ch-02-01',
      title: 'Subatomic Particles & the Nuclear Atom',
      short: 'Taking apart the indivisible',
      kcs: ['kc-ch2-electron', 'kc-ch2-nucleus', 'kc-ch2-isotopes', 'kc-ch2-modelfail'],
      prereq: [],
      estMin: 26,
      weight: 1.2,
      widget: 'rayTube',
      widgetTitle: 'Discharge Tube',
      widgetBrief: 'Apply electric and magnetic fields to a cathode-ray beam and measure the charge-to-mass ratio yourself.',

      story: {
        speaker: 'MOLE-9',
        avatar: '\u2697\ufe0f',
        lines: [
          'Module One. Dalton said atoms were indivisible. Three experiments disagreed.',
          'Thomson found something a thousand times lighter than hydrogen coming out of *every* element he tried. Whatever it was, it was a piece of all of them.',
          'Then Rutherford fired alpha particles at gold foil, expecting a gentle haze of deflections. What came back instead rewrote the atom.'
        ]
      },

      lesson: [
        { t: 'h', x: 'The three particles' },
        { t: 'table',
          head: ['Particle', 'Discovered by', 'Charge', 'Mass (relative)'],
          rows: [
            ['Electron', 'J. J. Thomson (1897)', '$-1.602\\times10^{-19}$ C', '$1/1837$ of H'],
            ['Proton', 'Goldstein / Rutherford', '$+1.602\\times10^{-19}$ C', '$1.007$ u'],
            ['Neutron', 'Chadwick (1932)', '$0$', '$1.009$ u']
          ]
        },
        { t: 'ul', items: [
          'Thomson measured the **charge-to-mass ratio** $e/m = 1.758\\times10^{11}\\ \\text{C kg}^{-1}$ \u2014 not the charge itself.',
          'Millikan\u2019s oil-drop experiment measured the **charge** $e = 1.602\\times10^{-19}$ C, and the mass followed.',
          'Cathode rays are the same whatever the electrode material or the gas \u2014 which is the evidence that electrons are a universal constituent of matter.'
        ] },

        { t: 'h', x: 'Thomson\u2019s model, and its death' },
        { t: 'p', x: 'Thomson pictured a sphere of positive charge with electrons embedded in it \u2014 the "plum pudding". It explained neutrality, and nothing else.' },

        { t: 'anim', id: 'goldFoilScatter' },

        { t: 'callout', kind: 'jee', title: 'What the gold foil experiment established',
          x: '**1.** Most of the atom is empty space \u2014 almost all alphas passed straight through.\n**2.** The positive charge is concentrated in a tiny **nucleus** \u2014 only a concentrated charge can turn an alpha through a large angle.\n**3.** Almost all the mass is in that nucleus.\n\nNucleus $\\sim 10^{-15}$ m against an atom of $\\sim 10^{-10}$ m: a ratio of $10^5$ in radius, and $10^{15}$ in volume.' },

        { t: 'h', x: 'Why Rutherford\u2019s model also failed' },
        { t: 'callout', kind: 'trap', title: 'The stability problem',
          x: 'An electron in a circular orbit is **accelerating**. Classical electromagnetism says an accelerating charge radiates energy continuously.\n\nIt would therefore spiral into the nucleus in about $10^{-8}$ s, emitting a **continuous** spectrum on the way down.\n\nMatter exists, and hydrogen gives **sharp lines**. Both facts contradict the model.' },

        { t: 'h', x: 'Counting nucleons' },
        { t: 'formula', name: 'Atomic and mass number', tex: 'Z = \\text{protons}, \\qquad A = Z + \\text{neutrons}', star: true },
        { t: 'table',
          head: ['Term', 'Same', 'Different', 'Example'],
          rows: [
            ['Isotopes', 'atomic number $Z$', 'mass number $A$', '$^{35}$Cl and $^{37}$Cl'],
            ['Isobars', 'mass number $A$', 'atomic number $Z$', '$^{40}$Ar and $^{40}$Ca'],
            ['Isotones', 'number of neutrons', '$Z$ and $A$', '$^{14}$C and $^{16}$O'],
            ['Isoelectronic', 'number of electrons', 'nuclear charge', 'Na$^+$, Ne, F$^-$']
          ]
        },

        { t: 'sim' },

        { t: 'callout', kind: 'tip', title: 'A memory hook that holds', x: '**Isotopes** \u2014 same *protons* (p for position in the table). **Isobars** \u2014 same *bar* of total mass, $A$. **Isotones** \u2014 same *neutrons*. The "tone" and "neutron" share the letter n.' }
      ],

      formulas: [
        { name: 'Mass number', tex: 'A = Z + N', star: true },
        { name: 'Electron charge/mass', tex: 'e/m = 1.758\\times10^{11}\\ \\text{C kg}^{-1}' },
        { name: 'Elementary charge', tex: 'e = 1.602\\times10^{-19}\\ \\text{C}' },
        { name: 'Nuclear radius', tex: 'R = R_0 A^{1/3},\\ R_0 = 1.2\\ \\text{fm}' }
      ],

      questions: [
        { id: 'ch-02-01-q1', tier: 'G', kind: 'mcq', parSec: 35, kcs: ['kc-ch2-electron'],
          stem: 'Cathode rays consist of:',
          options: ['protons', 'electrons', 'neutrons', 'photons'],
          answer: 1,
          hint: 'They are deflected toward the positive plate.',
          solution: [
            'Cathode rays are streams of **electrons** emitted from the cathode.',
            'They bend toward the positive plate in an electric field, showing they carry negative charge.',
            'Crucially, they are identical whatever gas or electrode is used \u2014 electrons are common to all matter.'
          ] },

        { id: 'ch-02-01-q2', tier: 'G', kind: 'mcq', parSec: 35, kcs: ['kc-ch2-nucleus'],
          stem: 'The nucleus of the atom was discovered by:',
          options: ['Thomson', 'Rutherford', 'Chadwick', 'Bohr'],
          answer: 1,
          hint: 'Which experiment involved gold foil?',
          solution: [
            'Rutherford\u2019s alpha-scattering experiment (carried out by Geiger and Marsden) revealed the nucleus in 1911.',
            'Thomson found the electron; Chadwick the neutron; Bohr supplied the quantised orbits that came later.'
          ] },

        { id: 'ch-02-01-q3', tier: 'G', kind: 'integer', parSec: 40, kcs: ['kc-ch2-isotopes'],
          stem: 'How many neutrons are there in an atom of $^{35}_{17}\\text{Cl}$?',
          answer: 18,
          hint: '$N = A - Z$.',
          solution: [
            'The subscript is $Z = 17$ (protons); the superscript is $A = 35$ (total nucleons).',
            '$N = A - Z = 35 - 17 = 18$ neutrons.'
          ] },

        { id: 'ch-02-01-q4', tier: 'M', kind: 'mcq', parSec: 60, kcs: ['kc-ch2-isotopes'],
          stem: 'Which pair are **isobars**?',
          options: [
            '$^{35}$Cl and $^{37}$Cl',
            '$^{40}$Ar and $^{40}$Ca',
            '$^{14}$C and $^{16}$O',
            'Na$^+$ and Ne'
          ],
          answer: 1,
          hint: 'Isobars share the mass number.',
          solution: [
            'Isobars have the same **mass number** $A$ but different atomic numbers.',
            '$^{40}$Ar ($Z=18$) and $^{40}$Ca ($Z=20$) both have $A = 40$. \u2713',
            'The chlorine pair are isotopes (same $Z$); $^{14}$C and $^{16}$O are isotones (8 neutrons each); Na$^+$ and Ne are isoelectronic.'
          ] },

        { id: 'ch-02-01-q5', tier: 'M', kind: 'mcq', parSec: 70, kcs: ['kc-ch2-modelfail'],
          stem: 'Rutherford\u2019s model could not explain the **stability** of the atom because:',
          options: [
            'the nucleus would repel itself apart',
            'an orbiting electron accelerates, and an accelerating charge must radiate energy',
            'electrons are too light to orbit',
            'the nucleus is too small'
          ],
          answer: 1,
          hint: 'What does classical electromagnetism say about accelerating charges?',
          solution: [
            'Circular motion is accelerated motion, even at constant speed \u2014 the direction changes.',
            'Classical electromagnetism requires an accelerating charge to radiate energy continuously.',
            'The electron would lose energy, spiral inward and collapse into the nucleus in about $10^{-8}$ s.',
            'It would also emit a **continuous** spectrum, whereas hydrogen gives sharp discrete lines.'
          ] },

        { id: 'ch-02-01-q6', tier: 'M', kind: 'mcq', parSec: 65, kcs: ['kc-ch2-electron'],
          stem: 'Thomson\u2019s experiment measured:',
          options: [
            'the charge of the electron',
            'the mass of the electron',
            'the charge-to-mass ratio of the electron',
            'the radius of the electron'
          ],
          answer: 2,
          hint: 'Which single quantity can a deflection experiment give?',
          solution: [
            'Balancing electric and magnetic deflections gives $e/m$, and only $e/m$.',
            'Thomson found $1.758\\times10^{11}\\ \\text{C kg}^{-1}$.',
            'Millikan later measured $e$ independently with the oil-drop experiment, and the two together gave $m$.'
          ] },

        { id: 'ch-02-01-q7', tier: 'H', kind: 'mcq', parSec: 110, kcs: ['kc-ch2-nucleus'],
          stem: 'The radius of an atom is about $10^{-10}$ m and that of its nucleus about $10^{-15}$ m. The ratio of their **volumes** is approximately:',
          options: ['$10^{5}$', '$10^{10}$', '$10^{15}$', '$10^{30}$'],
          answer: 2,
          hint: 'Volume scales as the cube of the radius.',
          solution: [
            'The radii are in the ratio $\\dfrac{10^{-10}}{10^{-15}} = 10^{5}$.',
            'Volume $\\propto r^3$, so the volume ratio is $(10^{5})^3 = 10^{15}$.',
            'The nucleus occupies about one part in a thousand trillion of the atom\u2019s volume \u2014 and holds over 99.9% of its mass.'
          ] },

        { id: 'ch-02-01-q8', tier: 'H', kind: 'mcq', parSec: 120, kcs: ['kc-ch2-nucleus'],
          stem: 'In the alpha-scattering experiment, the very small number of particles deflected through large angles indicates that:',
          options: [
            'the atom has a large positive core',
            'the positive charge is concentrated in a very small volume',
            'electrons are heavy',
            'alpha particles are negatively charged'
          ],
          answer: 1,
          hint: 'Why were the large deflections **rare** rather than common?',
          solution: [
            'A large deflection needs an intense electric field, so the positive charge must be concentrated, not spread out.',
            'The **rarity** is the second half of the argument: a concentrated charge presents a tiny target, so almost every alpha misses it entirely.',
            'A large positive core would have deflected most of the beam, not one in twenty thousand.'
          ] },

        { id: 'ch-02-01-q9', tier: 'H', kind: 'mcq', parSec: 110, kcs: ['kc-ch2-isotopes'],
          stem: 'Which species are **isoelectronic** with Ne?',
          options: [
            'Na$^+$, F$^-$, O$^{2-}$',
            'Na, F, O',
            'Ar, Kr, Xe',
            'Mg, Al, Si'
          ],
          answer: 0,
          hint: 'Count electrons, not protons.',
          solution: [
            'Ne has 10 electrons.',
            'Na$^+$: $11 - 1 = 10$. F$^-$: $9 + 1 = 10$. O$^{2-}$: $8 + 2 = 10$. \u2713',
            'All four have identical electronic configurations, but different nuclear charges \u2014 which is why their **sizes** differ despite the shared configuration.'
          ] }
      ]
    },

    /* ---------------------------------------------------------------
       2. Electromagnetic radiation and Planck
       --------------------------------------------------------------- */
    {
      id: 'ch-02-02',
      title: 'Electromagnetic Radiation & the Quantum',
      short: 'Light stops being a wave, at least sometimes',
      kcs: ['kc-ch2-emwave', 'kc-ch2-planck', 'kc-ch2-photo'],
      prereq: ['ch-02-01'],
      estMin: 28,
      weight: 1.5,
      widget: 'spectrumLab',
      widgetTitle: 'Photon Bench',
      widgetBrief: 'Dial a wavelength and convert between \u03bb, \u03bd, energy in joules and energy in electronvolts.',

      story: {
        speaker: 'MOLE-9',
        avatar: '\u2697\ufe0f',
        lines: [
          'Module Two. This is where physics broke, and chemistry benefited.',
          'Planck was trying to fix a problem with hot glowing objects. His solution \u2014 that energy comes in discrete packets \u2014 he described as an act of desperation. He did not believe it.',
          'Then Einstein took it seriously, applied it to light knocking electrons out of metal, and the packets turned out to be real.'
        ]
      },

      lesson: [
        { t: 'h', x: 'Describing a wave' },
        { t: 'formula', name: 'The wave relation', tex: 'c = \\nu\\lambda', star: true,
          note: '$c = 3.00\\times10^{8}\\ \\text{m s}^{-1}$ in vacuum, for every wavelength.' },
        { t: 'formula', name: 'Wavenumber', tex: '\\bar{\\nu} = \\frac{1}{\\lambda}', note: 'Usually quoted in cm$^{-1}$. It is proportional to energy, which is why spectroscopists prefer it.' },
        { t: 'ul', items: [
          'Frequency and wavelength are **inversely** related. Short wavelength means high frequency and high energy.',
          'Order of increasing energy: radio < microwave < infrared < visible < ultraviolet < X-ray < gamma.',
          'Visible light spans roughly $400$ nm (violet) to $700$ nm (red).'
        ] },

        { t: 'h', x: 'Planck\u2019s quantum' },
        { t: 'formula', name: 'Energy of one photon', tex: 'E = h\\nu = \\frac{hc}{\\lambda}', star: true,
          note: '$h = 6.626\\times10^{-34}$ J s. Energy is absorbed or emitted only in whole multiples of $h\\nu$.' },
        { t: 'callout', kind: 'tip', title: 'The shortcut worth memorising',
          x: '$E(\\text{eV}) = \\dfrac{1240}{\\lambda(\\text{nm})}$\n\nA 400 nm photon carries $1240/400 = 3.1$ eV. This one line saves a full minute of arithmetic in the exam, every time.' },

        { t: 'h', x: 'The photoelectric effect' },
        { t: 'anim', id: 'photoelectric' },

        { t: 'formula', name: 'Einstein\u2019s photoelectric equation', tex: 'h\\nu = \\phi + KE_{\\max} = h\\nu_0 + \\tfrac{1}{2}mv^2_{\\max}', star: true },
        { t: 'callout', kind: 'jee', title: 'The three observations wave theory cannot explain',
          x: '**1.** Below a threshold frequency $\\nu_0$, **no** electrons are emitted, however intense the light.\n**2.** Above it, emission is **instantaneous** \u2014 there is no delay while energy accumulates.\n**3.** The maximum kinetic energy depends on **frequency**, never on intensity. Intensity controls only the *number* of electrons.' },

        { t: 'worked', title: 'Worked example \u2014 a photoelectric calculation', tier: 'M',
          q: 'Light of wavelength $400$ nm falls on a metal of work function $2.0$ eV. Find the maximum kinetic energy of the emitted electrons and the threshold wavelength.',
          steps: [
            'Photon energy: $E = \\dfrac{1240}{400} = 3.1$ eV.',
            '$KE_{\\max} = E - \\phi = 3.1 - 2.0 = 1.1$ eV.',
            'Threshold is where $KE_{\\max} = 0$, i.e. $E = \\phi$.',
            '$\\lambda_0 = \\dfrac{1240}{2.0} = 620$ nm.'
          ],
          ans: '$KE_{\\max} = 1.1$ eV; $\\lambda_0 = 620$ nm. Light longer than 620 nm ejects nothing at all.'
        },

        { t: 'sim' },

        { t: 'callout', kind: 'trap', title: 'Threshold is about wavelength the other way round', x: 'A **longer** wavelength means a **lower** frequency and less energy. So emission needs $\\lambda < \\lambda_0$, not $\\lambda > \\lambda_0$. The inequality flips when you switch between $\\nu$ and $\\lambda$, and that flip is worth marks every year.' }
      ],

      formulas: [
        { name: 'Wave relation', tex: 'c = \\nu\\lambda', star: true },
        { name: 'Photon energy', tex: 'E = h\\nu = hc/\\lambda', star: true },
        { name: 'In electronvolts', tex: 'E(\\text{eV}) = 1240/\\lambda(\\text{nm})', star: true },
        { name: 'Photoelectric', tex: 'h\\nu = \\phi + KE_{max}', star: true },
        { name: 'Threshold', tex: '\\lambda_0 = hc/\\phi' },
        { name: 'Stopping potential', tex: 'eV_0 = KE_{max}' }
      ],

      questions: [
        { id: 'ch-02-02-q1', tier: 'G', kind: 'numeric', parSec: 50, tol: { rel: 0.03 }, kcs: ['kc-ch2-emwave'],
          stem: 'Light has a wavelength of $600$ nm. Find its frequency, as a multiple of $10^{14}$ Hz. ($c = 3\\times10^8\\ \\text{m s}^{-1}$)',
          answer: 5,
          hint: '$\\nu = c/\\lambda$.',
          solution: [
            '$\\lambda = 600\\ \\text{nm} = 6\\times10^{-7}$ m.',
            '$\\nu = \\dfrac{c}{\\lambda} = \\dfrac{3\\times10^{8}}{6\\times10^{-7}} = 5\\times10^{14}$ Hz.'
          ] },

        { id: 'ch-02-02-q2', tier: 'G', kind: 'mcq', parSec: 40, kcs: ['kc-ch2-emwave'],
          stem: 'Which of these has the **highest** energy per photon?',
          options: ['radio waves', 'infrared', 'visible light', 'X-rays'],
          answer: 3,
          hint: 'Shortest wavelength wins.',
          solution: [
            '$E = hc/\\lambda$, so the shortest wavelength carries the most energy.',
            'X-rays ($\\sim 10^{-10}$ m) are far shorter than visible ($\\sim 5\\times10^{-7}$ m), which is shorter than infrared, which is shorter than radio.',
            'Order of increasing energy: radio < microwave < IR < visible < UV < X-ray < gamma.'
          ] },

        { id: 'ch-02-02-q3', tier: 'G', kind: 'numeric', parSec: 50, tol: { rel: 0.03 }, kcs: ['kc-ch2-planck'],
          stem: 'Find the energy in eV of a photon of wavelength $620$ nm.',
          answer: 2,
          hint: 'Use $E(\\text{eV}) = 1240/\\lambda(\\text{nm})$.',
          solution: [
            '$E = \\dfrac{1240}{620} = 2.0$ eV.',
            'In joules that is $2.0 \\times 1.6\\times10^{-19} = 3.2\\times10^{-19}$ J.'
          ] },

        { id: 'ch-02-02-q4', tier: 'M', kind: 'numeric', parSec: 80, tol: { rel: 0.04 }, kcs: ['kc-ch2-photo'],
          stem: 'Light of wavelength $400$ nm falls on a metal of work function $2.0$ eV. Find the maximum kinetic energy of the photoelectrons, in eV.',
          answer: 1.1,
          hint: 'Photon energy minus work function.',
          solution: [
            'Photon energy $= \\dfrac{1240}{400} = 3.1$ eV.',
            '$KE_{\\max} = h\\nu - \\phi = 3.1 - 2.0 = 1.1$ eV.'
          ] },

        { id: 'ch-02-02-q5', tier: 'M', kind: 'numeric', parSec: 75, tol: { rel: 0.04 }, kcs: ['kc-ch2-photo'],
          stem: 'A metal has work function $2.0$ eV. Find its threshold wavelength in nm.',
          answer: 620,
          hint: 'The threshold is where the photon energy exactly equals the work function.',
          solution: [
            'At threshold, $KE_{\\max} = 0$, so $h\\nu_0 = \\phi$.',
            '$\\lambda_0 = \\dfrac{1240}{\\phi(\\text{eV})} = \\dfrac{1240}{2.0} = 620$ nm.',
            'Light **longer** than 620 nm cannot eject an electron, however bright it is.'
          ] },

        { id: 'ch-02-02-q6', tier: 'M', kind: 'mcq', parSec: 70, kcs: ['kc-ch2-photo'],
          stem: 'Doubling the **intensity** of light above the threshold frequency:',
          options: [
            'doubles the maximum kinetic energy of the electrons',
            'doubles the number of electrons emitted',
            'halves the threshold frequency',
            'has no effect at all'
          ],
          answer: 1,
          hint: 'Intensity is photons per second, not energy per photon.',
          solution: [
            'Intensity means more photons arriving per second, each still carrying $h\\nu$.',
            'More photons eject more electrons, so the **current** doubles.',
            'The energy of each individual electron is set by $h\\nu - \\phi$ and does not change.',
            'That split \u2014 number from intensity, energy from frequency \u2014 is precisely what wave theory could not deliver.'
          ] },

        { id: 'ch-02-02-q7', tier: 'H', kind: 'numeric', parSec: 130, tol: { rel: 0.05 }, kcs: ['kc-ch2-planck'],
          stem: 'How many photons of wavelength $500$ nm are needed to supply $1.00$ J of energy? Give the answer as a multiple of $10^{18}$.',
          answer: 2.52,
          hint: 'Find the energy of one photon in joules first.',
          solution: [
            '$E_{\\text{photon}} = \\dfrac{hc}{\\lambda} = \\dfrac{(6.626\\times10^{-34})(3\\times10^{8})}{5\\times10^{-7}}$.',
            '$= \\dfrac{1.988\\times10^{-25}}{5\\times10^{-7}} = 3.98\\times10^{-19}$ J.',
            '$n = \\dfrac{1.00}{3.98\\times10^{-19}} = 2.52\\times10^{18}$ photons.',
            'A dim 1 W lamp therefore emits billions of billions of photons per second \u2014 which is why light looks continuous.'
          ] },

        { id: 'ch-02-02-q8', tier: 'H', kind: 'numeric', parSec: 130, tol: { rel: 0.05 }, kcs: ['kc-ch2-photo'],
          stem: 'The threshold wavelength of a metal is $500$ nm. Light of $300$ nm falls on it. Find the stopping potential in volts.',
          answer: 1.65,
          hint: 'Stopping potential in volts equals $KE_{\\max}$ in eV.',
          solution: [
            'Work function: $\\phi = \\dfrac{1240}{500} = 2.48$ eV.',
            'Photon energy: $E = \\dfrac{1240}{300} = 4.13$ eV.',
            '$KE_{\\max} = 4.13 - 2.48 = 1.65$ eV.',
            'Since $eV_0 = KE_{\\max}$, the stopping potential is $1.65$ V.'
          ] },

        { id: 'ch-02-02-q9', tier: 'H', kind: 'mcq', parSec: 120, kcs: ['kc-ch2-photo', 'kc-ch2-planck'],
          stem: 'A graph of $KE_{\\max}$ against frequency $\\nu$ for the photoelectric effect is a straight line. Its **slope** and **intercept on the energy axis** are:',
          options: [
            'slope $h$, intercept $-\\phi$',
            'slope $\\phi$, intercept $-h$',
            'slope $h/e$, intercept $\\phi$',
            'slope $1/h$, intercept $\\phi$'
          ],
          answer: 0,
          hint: 'Rearrange $h\\nu = \\phi + KE_{\\max}$ into $y = mx + c$.',
          solution: [
            '$KE_{\\max} = h\\nu - \\phi$.',
            'Comparing with $y = mx + c$: the slope is $h$ and the intercept on the $KE$ axis is $-\\phi$.',
            'Millikan measured exactly this line to determine $h$ experimentally \u2014 having set out to disprove Einstein, and instead confirming him.',
            'Note the slope is $h$ for **every** metal. Only the intercept changes.'
          ] }
      ]
    },

    /* ---------------------------------------------------------------
       3. Bohr's model
       --------------------------------------------------------------- */
    {
      id: 'ch-02-03',
      title: 'Bohr\u2019s Model & the Hydrogen Spectrum',
      short: 'Sharp lines demand discrete levels',
      kcs: ['kc-ch2-bohr', 'kc-ch2-energy', 'kc-ch2-spectra'],
      prereq: ['ch-02-02'],
      estMin: 30,
      weight: 1.7,
      widget: 'bohrOrbits',
      widgetTitle: 'Spectral Lab',
      widgetBrief: 'Excite a hydrogen atom, drop the electron between levels and watch the emission lines appear where you predicted.',

      story: {
        speaker: 'MOLE-9',
        avatar: '\u2697\ufe0f',
        lines: [
          'Module Three. The four lines on my spectrometer, finally explained.',
          'Bohr simply **asserted** that only certain orbits are allowed, and that light is emitted when an electron jumps between them. He had no justification for the assertion at all.',
          'But it predicted the hydrogen spectrum to four decimal places, so everyone forgave him. The justification arrived a decade later \u2014 you meet it next module.'
        ]
      },

      lesson: [
        { t: 'h', x: 'The postulates' },
        { t: 'ol', items: [
          'Electrons orbit the nucleus only in certain **stationary states** and do not radiate while in them.',
          'Angular momentum is quantised: $mvr = \\dfrac{nh}{2\\pi}$, with $n = 1, 2, 3, \\ldots$',
          'Energy is emitted or absorbed **only** when the electron jumps between levels, and the photon carries exactly $\\Delta E = E_2 - E_1 = h\\nu$.'
        ] },

        { t: 'h', x: 'The three results' },
        { t: 'formula', name: 'Orbit radius', tex: 'r_n = 0.529\\,\\frac{n^2}{Z}\\ \\text{\u00c5}', star: true },
        { t: 'formula', name: 'Energy of a level', tex: 'E_n = -13.6\\,\\frac{Z^2}{n^2}\\ \\text{eV}', star: true },
        { t: 'formula', name: 'Orbital velocity', tex: 'v_n = 2.18\\times10^{6}\\,\\frac{Z}{n}\\ \\text{m s}^{-1}' },
        { t: 'callout', kind: 'jee', title: 'Read the signs', x: 'Energies are **negative** because the electron is bound: zero energy means a free electron at infinity. So $E_1 = -13.6$ eV is the *lowest* level, and the **ionisation energy** of hydrogen is $+13.6$ eV \u2014 the work needed to lift it to zero.' },

        { t: 'anim', id: 'bohrTransitions' },

        { t: 'h', x: 'The spectral series' },
        { t: 'formula', name: 'Rydberg formula', tex: '\\bar{\\nu} = \\frac{1}{\\lambda} = R_H Z^2\\left(\\frac{1}{n_1^2} - \\frac{1}{n_2^2}\\right)', star: true,
          note: '$R_H = 1.097\\times10^{7}\\ \\text{m}^{-1}$; $n_1$ is the lower level, $n_2$ the upper.' },
        { t: 'table',
          head: ['Series', 'Lands at $n_1$', 'Region', 'First line'],
          rows: [
            ['Lyman', '1', 'ultraviolet', '$2\\to1$, 122 nm'],
            ['Balmer', '2', 'visible', '$3\\to2$, 656 nm'],
            ['Paschen', '3', 'infrared', '$4\\to3$, 1875 nm'],
            ['Brackett', '4', 'far infrared', '$5\\to4$'],
            ['Pfund', '5', 'far infrared', '$6\\to5$']
          ]
        },
        { t: 'callout', kind: 'tip', title: 'The series is named by where it lands', x: 'Not where it starts. Every jump ending at $n = 2$ is a Balmer line regardless of whether it fell from 3, 4, 5 or infinity. Those are the only ones in the visible range \u2014 which is why they were found first.' },

        { t: 'formula', name: 'Number of spectral lines', tex: '\\text{lines} = \\frac{n(n-1)}{2}',
          note: 'When an electron de-excites from level $n$ by every possible route.' },

        { t: 'worked', title: 'Worked example \u2014 the red hydrogen line', tier: 'M',
          q: 'Find the wavelength emitted when an electron in hydrogen falls from $n = 3$ to $n = 2$.',
          steps: [
            'Energies: $E_3 = -\\dfrac{13.6}{9} = -1.51$ eV, $E_2 = -\\dfrac{13.6}{4} = -3.40$ eV.',
            '$\\Delta E = -1.51 - (-3.40) = 1.89$ eV.',
            '$\\lambda = \\dfrac{1240}{1.89}$ nm.',
            'Check with Rydberg: $\\dfrac{1}{\\lambda} = 1.097\\times10^7\\left(\\dfrac{1}{4}-\\dfrac{1}{9}\\right) = 1.524\\times10^6\\ \\text{m}^{-1}$. \u2713'
          ],
          ans: '$\\lambda \\approx 656$ nm \u2014 the red H$\\alpha$ line, the brightest in the Balmer series.'
        },

        { t: 'sim' },

        { t: 'callout', kind: 'warn', title: 'Where Bohr stops working', x: 'The model is exact only for **one-electron species**: H, He$^+$, Li$^{2+}$, Be$^{3+}$. With two or more electrons the repulsion between them breaks it. It also cannot explain the fine splitting of lines, the Zeeman effect, or chemical bonding.' }
      ],

      formulas: [
        { name: 'Radius', tex: 'r_n = 0.529 n^2/Z\\ \\text{\u00c5}', star: true },
        { name: 'Energy', tex: 'E_n = -13.6 Z^2/n^2\\ \\text{eV}', star: true },
        { name: 'Velocity', tex: 'v_n = 2.18\\times10^6 Z/n\\ \\text{m s}^{-1}' },
        { name: 'Angular momentum', tex: 'mvr = nh/2\\pi', star: true },
        { name: 'Rydberg', tex: '1/\\lambda = R_H Z^2(1/n_1^2 - 1/n_2^2)', star: true },
        { name: 'Spectral lines', tex: 'n(n-1)/2' },
        { name: 'Ionisation energy of H', tex: '13.6\\ \\text{eV}' }
      ],

      questions: [
        { id: 'ch-02-03-q1', tier: 'G', kind: 'numeric', parSec: 45, tol: { rel: 0.02 }, kcs: ['kc-ch2-energy'],
          stem: 'What is the energy, in eV, of the ground state ($n = 1$) of a hydrogen atom? (Give the magnitude.)',
          answer: 13.6,
          hint: '$E_n = -13.6/n^2$ eV for hydrogen.',
          solution: [
            '$E_1 = -\\dfrac{13.6}{1^2} = -13.6$ eV.',
            'The magnitude, $13.6$ eV, is also hydrogen\u2019s **ionisation energy** \u2014 the work needed to remove the electron completely.'
          ] },

        { id: 'ch-02-03-q2', tier: 'G', kind: 'numeric', parSec: 50, tol: { rel: 0.03 }, kcs: ['kc-ch2-bohr'],
          stem: 'Find the radius of the second Bohr orbit of hydrogen, in \u00c5.',
          answer: 2.116,
          hint: '$r_n = 0.529 n^2/Z$ \u00c5, with $Z = 1$.',
          solution: [
            '$r_2 = 0.529 \\times \\dfrac{2^2}{1} = 0.529 \\times 4$.',
            '$= 2.116$ \u00c5.',
            'Radii grow as $n^2$, so the orbits get rapidly further apart.'
          ] },

        { id: 'ch-02-03-q3', tier: 'G', kind: 'mcq', parSec: 45, kcs: ['kc-ch2-spectra'],
          stem: 'The Balmer series of hydrogen lies in the:',
          options: ['ultraviolet', 'visible', 'infrared', 'X-ray'],
          answer: 1,
          hint: 'Which series was discovered first, and why?',
          solution: [
            'Balmer lines all end at $n = 2$ and fall between about 400 and 660 nm \u2014 the **visible** range.',
            'That is exactly why they were found first: they could be seen.',
            'Lyman (ending at $n=1$) is ultraviolet; Paschen and beyond are infrared.'
          ] },

        { id: 'ch-02-03-q4', tier: 'M', kind: 'numeric', parSec: 60, tol: { rel: 0.03 }, kcs: ['kc-ch2-energy'],
          stem: 'Find the energy of the $n = 2$ level of hydrogen, in eV. (Give the magnitude.)',
          answer: 3.4,
          hint: 'Divide by $n^2$.',
          solution: [
            '$E_2 = -\\dfrac{13.6}{2^2} = -\\dfrac{13.6}{4} = -3.4$ eV.',
            'Magnitude: $3.4$ eV.'
          ] },

        { id: 'ch-02-03-q5', tier: 'M', kind: 'numeric', parSec: 75, tol: { rel: 0.03 }, kcs: ['kc-ch2-energy'],
          stem: 'Find the energy, in eV, of the $n = 2$ level of He$^+$ ($Z = 2$). (Give the magnitude.)',
          answer: 13.6,
          hint: 'Energy scales as $Z^2/n^2$.',
          solution: [
            '$E_n = -13.6\\dfrac{Z^2}{n^2} = -13.6 \\times \\dfrac{4}{4}$.',
            '$= -13.6$ eV, so the magnitude is $13.6$ eV.',
            'He$^+$ at $n=2$ has exactly the same energy as H at $n=1$ \u2014 the $Z^2$ and $n^2$ cancel. A favourite exam construction.'
          ] },

        { id: 'ch-02-03-q6', tier: 'M', kind: 'integer', parSec: 70, kcs: ['kc-ch2-spectra'],
          stem: 'An electron in a hydrogen atom de-excites from $n = 5$ to the ground state by all possible routes. How many spectral lines are produced?',
          answer: 10,
          hint: 'Use $n(n-1)/2$.',
          solution: [
            'Every pair of levels from 1 to 5 can give one line.',
            'Number of lines $= \\dfrac{n(n-1)}{2} = \\dfrac{5 \\times 4}{2}$.',
            '$= 10$ lines.'
          ] },

        { id: 'ch-02-03-q7', tier: 'H', kind: 'numeric', parSec: 130, tol: { rel: 0.03 }, kcs: ['kc-ch2-spectra'],
          stem: 'Find the wavelength, in nm, of the line emitted when an electron in hydrogen falls from $n = 3$ to $n = 2$.',
          answer: 656,
          hint: 'Find $\\Delta E$ in eV, then use $\\lambda = 1240/E$.',
          solution: [
            '$E_3 = -13.6/9 = -1.511$ eV; $E_2 = -13.6/4 = -3.40$ eV.',
            '$\\Delta E = 3.40 - 1.511 = 1.889$ eV.',
            '$\\lambda = \\dfrac{1240}{1.889} = 656$ nm.',
            'This is H$\\alpha$ \u2014 the red line that gives hydrogen nebulae their colour.'
          ] },

        { id: 'ch-02-03-q8', tier: 'H', kind: 'numeric', parSec: 130, tol: { rel: 0.03 }, kcs: ['kc-ch2-spectra', 'kc-ch2-energy'],
          stem: 'Find the **series limit** of the Lyman series (the shortest wavelength), in nm.',
          answer: 91.2,
          hint: 'The series limit is the transition from $n = \\infty$.',
          solution: [
            'The limit is the jump from $n = \\infty$ down to $n = 1$.',
            '$\\Delta E = 0 - (-13.6) = 13.6$ eV \u2014 the full ionisation energy.',
            '$\\lambda = \\dfrac{1240}{13.6} = 91.2$ nm, deep in the ultraviolet.',
            'Every Lyman line is therefore longer than 91.2 nm; that value is the edge of the series.'
          ] },

        { id: 'ch-02-03-q9', tier: 'H', kind: 'mcq', parSec: 120, kcs: ['kc-ch2-bohr'],
          stem: 'Bohr\u2019s model gives accurate results for:',
          options: [
            'all atoms',
            'only hydrogen',
            'any species with exactly one electron',
            'only multi-electron atoms'
          ],
          answer: 2,
          hint: 'What does the $Z$ in the formulas allow for?',
          solution: [
            'The formulas carry a $Z$, so they work for any **one-electron** species: H, He$^+$, Li$^{2+}$, Be$^{3+}$.',
            'What breaks the model is **electron\u2013electron repulsion**, which it makes no allowance for at all.',
            'So neutral helium, with two electrons, is already beyond it.'
          ] }
      ]
    },

    /* ---------------------------------------------------------------
       4. Dual nature
       --------------------------------------------------------------- */
    {
      id: 'ch-02-04',
      title: 'Dual Nature: de Broglie & Heisenberg',
      short: 'Why the orbit had to become an orbital',
      kcs: ['kc-ch2-debroglie', 'kc-ch2-heisen'],
      prereq: ['ch-02-03'],
      estMin: 26,
      weight: 1.4,
      widget: 'deBroglieLab',
      widgetTitle: 'Wavelength Bench',
      widgetBrief: 'Compute de Broglie wavelengths for anything from an electron to a cricket ball, and see why only one of them behaves like a wave.',

      story: {
        speaker: 'MOLE-9',
        avatar: '\u2697\ufe0f',
        lines: [
          'Module Four. A doctoral thesis so short the examiners were not sure what to do with it.',
          'de Broglie asked: light behaves as both wave and particle. Why should matter be different? He proposed that every particle has a wavelength, $\\lambda = h/mv$.',
          'Then Heisenberg pointed out something worse. If the electron is a wave, asking exactly where it is *and* exactly how fast it is going stops being merely difficult. It stops being meaningful.'
        ]
      },

      lesson: [
        { t: 'h', x: 'The de Broglie relation' },
        { t: 'formula', name: 'Matter waves', tex: '\\lambda = \\frac{h}{p} = \\frac{h}{mv}', star: true },
        { t: 'formula', name: 'For an accelerated electron', tex: '\\lambda = \\frac{12.27}{\\sqrt{V}}\\ \\text{\u00c5}',
          note: 'where $V$ is the accelerating potential in volts. Worth memorising.' },

        { t: 'anim', id: 'deBroglieWave' },

        { t: 'callout', kind: 'jee', title: 'Why you never see a cricket ball diffract',
          x: 'A 150 g ball at $30\\ \\text{m s}^{-1}$ has $\\lambda = \\dfrac{6.6\\times10^{-34}}{0.15 \\times 30} \\approx 1.5\\times10^{-34}$ m.\n\nThat is twenty orders of magnitude smaller than a nucleus. The wave nature is real and completely unobservable. Only when $m$ is tiny does $\\lambda$ become comparable to the apparatus.' },

        { t: 'h', x: 'The uncertainty principle' },
        { t: 'formula', name: 'Heisenberg', tex: '\\Delta x \\cdot \\Delta p \\geq \\frac{h}{4\\pi}', star: true },
        { t: 'formula', name: 'In terms of velocity', tex: '\\Delta x \\cdot \\Delta v \\geq \\frac{h}{4\\pi m}' },
        { t: 'callout', kind: 'trap', title: 'It is not about clumsy instruments',
          x: 'This is **not** a statement that measurement disturbs the system. It is a statement that a particle does not simultaneously *possess* a precise position and a precise momentum. Better equipment cannot help.\n\nThe consequence for chemistry is decisive: a Bohr **orbit** \u2014 a definite path with a definite radius and speed \u2014 is not merely unmeasurable, it is not a coherent description. We replace it with an **orbital**, a region of probability.' },

        { t: 'worked', title: 'Worked example \u2014 pinning down an electron', tier: 'H',
          q: 'The velocity of an electron is known to within $5.7\\times10^{4}\\ \\text{m s}^{-1}$. What is the minimum uncertainty in its position? ($m_e = 9.1\\times10^{-31}$ kg)',
          steps: [
            '$\\Delta x \\geq \\dfrac{h}{4\\pi m \\Delta v}$.',
            'Denominator: $4\\pi \\times 9.1\\times10^{-31} \\times 5.7\\times10^{4} = 6.52\\times10^{-25}$.',
            '$\\Delta x \\geq \\dfrac{6.626\\times10^{-34}}{6.52\\times10^{-25}}$.',
            '$= 1.0\\times10^{-9}$ m $= 10$ \u00c5.'
          ],
          ans: 'About $10^{-9}$ m \u2014 roughly **ten times the diameter of the whole atom**. You cannot locate the electron within its own atom.'
        },

        { t: 'sim' },

        { t: 'callout', kind: 'tip', title: 'The same sum for a cricket ball', x: 'Repeat that calculation with $m = 0.15$ kg and the uncertainty comes out around $10^{-33}$ m. Heisenberg applies to everything; it only *matters* when the mass is tiny. That is the honest one-line answer to "does quantum mechanics apply to large objects?"' }
      ],

      formulas: [
        { name: 'de Broglie', tex: '\\lambda = h/mv', star: true },
        { name: 'Accelerated electron', tex: '\\lambda = 12.27/\\sqrt{V}\\ \\text{\u00c5}' },
        { name: 'From kinetic energy', tex: '\\lambda = h/\\sqrt{2mKE}' },
        { name: 'Heisenberg', tex: '\\Delta x\\,\\Delta p \\geq h/4\\pi', star: true },
        { name: 'Velocity form', tex: '\\Delta x\\,\\Delta v \\geq h/4\\pi m' }
      ],

      questions: [
        { id: 'ch-02-04-q1', tier: 'G', kind: 'mcq', parSec: 40, kcs: ['kc-ch2-debroglie'],
          stem: 'The de Broglie wavelength of a particle is given by:',
          options: ['$\\lambda = hmv$', '$\\lambda = h/mv$', '$\\lambda = mv/h$', '$\\lambda = h/m$'],
          answer: 1,
          hint: 'Wavelength is inversely related to momentum.',
          solution: [
            '$\\lambda = \\dfrac{h}{p} = \\dfrac{h}{mv}$.',
            'A heavier or faster particle has a **shorter** wavelength \u2014 which is exactly why large objects show no wave behaviour.'
          ] },

        { id: 'ch-02-04-q2', tier: 'G', kind: 'mcq', parSec: 45, kcs: ['kc-ch2-debroglie'],
          stem: 'If the velocity of a particle is doubled, its de Broglie wavelength:',
          options: ['doubles', 'halves', 'is unchanged', 'quadruples'],
          answer: 1,
          hint: '$\\lambda \\propto 1/v$.',
          solution: [
            '$\\lambda = \\dfrac{h}{mv}$, so $\\lambda \\propto \\dfrac{1}{v}$.',
            'Doubling $v$ halves $\\lambda$.'
          ] },

        { id: 'ch-02-04-q3', tier: 'G', kind: 'mcq', parSec: 50, kcs: ['kc-ch2-heisen'],
          stem: 'The Heisenberg uncertainty principle states that it is impossible to determine simultaneously and exactly:',
          options: [
            'the mass and charge of an electron',
            'the position and momentum of a particle',
            'the energy and charge of a particle',
            'the wavelength and frequency of light'
          ],
          answer: 1,
          hint: 'Which pair appears in $\\Delta x \\cdot \\Delta p \\geq h/4\\pi$?',
          solution: [
            'The principle bounds the product of the uncertainties in **position** and **momentum**.',
            '$\\Delta x \\cdot \\Delta p \\geq \\dfrac{h}{4\\pi}$.',
            'Pinning one down precisely forces the other to become correspondingly vague.'
          ] },

        { id: 'ch-02-04-q4', tier: 'M', kind: 'numeric', parSec: 80, tol: { rel: 0.05 }, kcs: ['kc-ch2-debroglie'],
          stem: 'Find the de Broglie wavelength of an electron moving at $1\\times10^{6}\\ \\text{m s}^{-1}$, as a multiple of $10^{-10}$ m. ($m_e = 9.1\\times10^{-31}$ kg)',
          answer: 7.28,
          hint: '$\\lambda = h/mv$.',
          solution: [
            '$\\lambda = \\dfrac{6.626\\times10^{-34}}{(9.1\\times10^{-31})(1\\times10^{6})}$.',
            'Denominator $= 9.1\\times10^{-25}$.',
            '$\\lambda = 7.28\\times10^{-10}$ m $= 7.28$ \u00c5.',
            'That is comparable to atomic spacing in a crystal \u2014 which is why electrons diffract off crystals, as Davisson and Germer showed.'
          ] },

        { id: 'ch-02-04-q5', tier: 'M', kind: 'numeric', parSec: 75, tol: { rel: 0.04 }, kcs: ['kc-ch2-debroglie'],
          stem: 'An electron is accelerated through $100$ V. Find its de Broglie wavelength in \u00c5.',
          answer: 1.227,
          hint: 'Use the shortcut $\\lambda = 12.27/\\sqrt{V}$ \u00c5.',
          solution: [
            '$\\lambda = \\dfrac{12.27}{\\sqrt{V}} = \\dfrac{12.27}{\\sqrt{100}}$.',
            '$= \\dfrac{12.27}{10} = 1.227$ \u00c5.',
            'This shortcut comes from $\\lambda = h/\\sqrt{2meV}$ with the constants folded in.'
          ] },

        { id: 'ch-02-04-q6', tier: 'M', kind: 'mcq', parSec: 70, kcs: ['kc-ch2-debroglie'],
          stem: 'A cricket ball and an electron move at the same speed. Compared with the electron, the ball\u2019s de Broglie wavelength is:',
          options: [
            'very much larger',
            'very much smaller',
            'the same',
            'exactly double'
          ],
          answer: 1,
          hint: '$\\lambda \\propto 1/m$ at fixed speed.',
          solution: [
            'At the same speed, $\\lambda \\propto \\dfrac{1}{m}$.',
            'A cricket ball is about $10^{29}$ times more massive than an electron, so its wavelength is about $10^{29}$ times shorter.',
            'That puts it at roughly $10^{-34}$ m \u2014 utterly unobservable, which is why everyday objects show no wave behaviour.'
          ] },

        { id: 'ch-02-04-q7', tier: 'H', kind: 'numeric', parSec: 140, tol: { rel: 0.08 }, kcs: ['kc-ch2-heisen'],
          stem: 'The uncertainty in an electron\u2019s velocity is $5.7\\times10^{4}\\ \\text{m s}^{-1}$. Find the minimum uncertainty in its position, as a multiple of $10^{-9}$ m.',
          answer: 1.02,
          hint: '$\\Delta x \\geq h/(4\\pi m \\Delta v)$.',
          solution: [
            '$\\Delta x \\geq \\dfrac{h}{4\\pi m \\Delta v}$.',
            'Denominator: $4 \\times 3.1416 \\times 9.1\\times10^{-31} \\times 5.7\\times10^{4} = 6.52\\times10^{-25}$.',
            '$\\Delta x \\geq \\dfrac{6.626\\times10^{-34}}{6.52\\times10^{-25}} = 1.02\\times10^{-9}$ m.',
            'An atom is about $10^{-10}$ m across, so the electron\u2019s position is uncertain by ten atomic diameters. The Bohr orbit is not a tenable picture.'
          ] },

        { id: 'ch-02-04-q8', tier: 'H', kind: 'mcq', parSec: 120, kcs: ['kc-ch2-heisen', 'kc-ch2-bohr'],
          stem: 'The uncertainty principle is incompatible with Bohr\u2019s model because Bohr\u2019s model:',
          options: [
            'ignores the nucleus',
            'assigns the electron a definite radius **and** a definite velocity at the same time',
            'uses the wrong value of $h$',
            'applies only to hydrogen'
          ],
          answer: 1,
          hint: 'What two things does a Bohr orbit specify simultaneously?',
          solution: [
            'A Bohr orbit specifies both an exact radius (position) and an exact orbital speed (momentum).',
            'Heisenberg forbids knowing both precisely, so such a trajectory cannot exist.',
            'This is why the orbit is replaced by the **orbital** \u2014 a probability distribution rather than a path.',
            'That Bohr works only for hydrogen is true, but it is a separate limitation.'
          ] },

        { id: 'ch-02-04-q9', tier: 'H', kind: 'mcq', parSec: 130, kcs: ['kc-ch2-debroglie'],
          stem: 'Two particles have the same kinetic energy. The ratio of their de Broglie wavelengths is:',
          options: [
            '$\\sqrt{m_2/m_1}$',
            '$m_2/m_1$',
            '$\\sqrt{m_1/m_2}$',
            '$m_1/m_2$'
          ],
          answer: 0,
          hint: 'Express $\\lambda$ in terms of kinetic energy first.',
          solution: [
            'With $KE = \\dfrac{p^2}{2m}$ we get $p = \\sqrt{2m\\,KE}$.',
            'So $\\lambda = \\dfrac{h}{\\sqrt{2m\\,KE}}$, meaning $\\lambda \\propto \\dfrac{1}{\\sqrt{m}}$ at fixed $KE$.',
            '$\\dfrac{\\lambda_1}{\\lambda_2} = \\sqrt{\\dfrac{m_2}{m_1}}$.',
            'Note it is the **square root** here, not the plain ratio \u2014 because equal kinetic energy, not equal speed, was specified.'
          ] }
      ]
    },

    /* ---------------------------------------------------------------
       5. Quantum numbers and orbitals
       --------------------------------------------------------------- */
    {
      id: 'ch-02-05',
      title: 'Quantum Numbers & Orbitals',
      short: 'Four numbers that name every electron',
      kcs: ['kc-ch2-qnumbers', 'kc-ch2-orbitals', 'kc-ch2-nodes'],
      prereq: ['ch-02-04'],
      estMin: 30,
      weight: 1.7,
      widget: 'quantumPicker',
      widgetTitle: 'Quantum Number Inspector',
      widgetBrief: 'Build sets of quantum numbers and have every illegal combination rejected with the rule it broke.',

      story: {
        speaker: 'MOLE-9',
        avatar: '\u2697\ufe0f',
        lines: [
          'Module Five. We stop drawing paths and start describing addresses.',
          'Solving Schr\u00f6dinger\u2019s equation for hydrogen produces three integers automatically \u2014 they are not assumed, they fall out of the requirement that the wavefunction be well-behaved.',
          'Those three name an orbital. A fourth, spin, distinguishes the two electrons that can share it. Four numbers, and no two electrons in an atom may carry the same four.'
        ]
      },

      lesson: [
        { t: 'h', x: 'The four numbers' },
        { t: 'table',
          head: ['Symbol', 'Name', 'Allowed values', 'Determines'],
          rows: [
            ['$n$', 'principal', '$1, 2, 3, \\ldots$', 'shell, size and energy'],
            ['$l$', 'azimuthal', '$0$ to $n-1$', 'subshell and **shape**'],
            ['$m_l$', 'magnetic', '$-l$ to $+l$', '**orientation** in space'],
            ['$m_s$', 'spin', '$+\\tfrac{1}{2}$ or $-\\tfrac{1}{2}$', 'spin direction']
          ]
        },
        { t: 'callout', kind: 'jee', title: 'The two constraints that generate every exam question',
          x: '$l$ can never reach $n$: for $n = 3$, $l$ is 0, 1 or 2 \u2014 never 3.\n\n$|m_l|$ can never exceed $l$: for $l = 1$, $m_l$ is $-1$, $0$ or $+1$ only.\n\nAlmost every "which set is not possible?" question is one of these two being violated.' },

        { t: 'formula', name: 'Subshell labels', tex: 'l = 0 \\to s, \\quad 1 \\to p, \\quad 2 \\to d, \\quad 3 \\to f', star: true },

        { t: 'anim', id: 'orbitalShapes' },

        { t: 'h', x: 'Counting' },
        { t: 'table',
          head: ['Quantity', 'Formula', 'For $n = 3$'],
          rows: [
            ['Subshells in shell $n$', '$n$', '3 (3s, 3p, 3d)'],
            ['Orbitals in subshell $l$', '$2l+1$', '1, 3, 5'],
            ['Orbitals in shell $n$', '$n^2$', '9'],
            ['Electrons in subshell $l$', '$2(2l+1)$', '2, 6, 10'],
            ['Electrons in shell $n$', '$2n^2$', '18']
          ]
        },

        { t: 'h', x: 'Nodes' },
        { t: 'formula', name: 'Nodes in an orbital', tex: '\\text{total} = n-1, \\quad \\text{angular} = l, \\quad \\text{radial} = n - l - 1', star: true },
        { t: 'callout', kind: 'tip', title: 'A node is where the electron is never found', x: 'An angular (planar) node comes from the shape; a radial (spherical) node from the distance dependence. For a 3p orbital: $n=3$, $l=1$, so 1 angular node and $3-1-1 = 1$ radial node, two in total.' },

        { t: 'worked', title: 'Worked example \u2014 spotting the illegal set', tier: 'M',
          q: 'Which of these sets of quantum numbers is not allowed? (a) $n=3, l=2, m_l=-2$  (b) $n=3, l=3, m_l=0$  (c) $n=4, l=0, m_l=0$',
          steps: [
            '(a) $n = 3$ permits $l = 0, 1, 2$. Here $l = 2$ \u2713. And $m_l = -2$ lies within $-2 \\ldots +2$ \u2713. Legal \u2014 it is a 3d orbital.',
            '(b) $n = 3$ requires $l \\leq 2$. Here $l = 3$. **Illegal.**',
            '(c) $n = 4$, $l = 0$, $m_l = 0$ \u2014 all within range. Legal; it is the 4s orbital.'
          ],
          ans: '(b) is impossible: $l$ can never equal or exceed $n$.'
        },

        { t: 'sim' },

        { t: 'callout', kind: 'trap', title: 'An orbital is not an orbit', x: 'An orbit is a path. An orbital is a **region of space where the probability of finding the electron is high** \u2014 conventionally the surface enclosing 90% of the probability. The electron does not travel around it. Heisenberg is why.' }
      ],

      formulas: [
        { name: 'Allowed l', tex: 'l = 0, 1, \\ldots, n-1', star: true },
        { name: 'Allowed m_l', tex: 'm_l = -l \\ldots +l\\quad (2l+1 \\text{ values})', star: true },
        { name: 'Orbitals in a shell', tex: 'n^2', star: true },
        { name: 'Electrons in a shell', tex: '2n^2', star: true },
        { name: 'Electrons in a subshell', tex: '2(2l+1)' },
        { name: 'Radial nodes', tex: 'n - l - 1', star: true },
        { name: 'Total nodes', tex: 'n - 1' }
      ],

      questions: [
        { id: 'ch-02-05-q1', tier: 'G', kind: 'mcq', parSec: 40, kcs: ['kc-ch2-qnumbers'],
          stem: 'For $n = 3$, the allowed values of $l$ are:',
          options: ['$0, 1, 2, 3$', '$0, 1, 2$', '$1, 2, 3$', '$0, 1$'],
          answer: 1,
          hint: '$l$ runs from 0 up to $n-1$.',
          solution: [
            '$l$ takes integer values from $0$ to $n - 1$.',
            'For $n = 3$ that is $0, 1, 2$ \u2014 the 3s, 3p and 3d subshells.',
            '$l = 3$ would need $n \\geq 4$.'
          ] },

        { id: 'ch-02-05-q2', tier: 'G', kind: 'integer', parSec: 40, kcs: ['kc-ch2-orbitals'],
          stem: 'How many orbitals are there in the shell $n = 3$?',
          answer: 9,
          hint: 'Use $n^2$.',
          solution: [
            'Orbitals in shell $n$ $= n^2 = 3^2 = 9$.',
            'Broken down: one 3s, three 3p, five 3d $= 9$. \u2713'
          ] },

        { id: 'ch-02-05-q3', tier: 'G', kind: 'integer', parSec: 40, kcs: ['kc-ch2-orbitals'],
          stem: 'What is the maximum number of electrons a $p$ subshell can hold?',
          answer: 6,
          hint: 'Three orbitals, two electrons each.',
          solution: [
            'For $p$, $l = 1$, so there are $2l+1 = 3$ orbitals.',
            'Each holds 2 electrons, so $2 \\times 3 = 6$.',
            'General formula: $2(2l+1)$.'
          ] },

        { id: 'ch-02-05-q4', tier: 'M', kind: 'integer', parSec: 50, kcs: ['kc-ch2-orbitals'],
          stem: 'What is the maximum number of electrons in the shell $n = 4$?',
          answer: 32,
          hint: 'Use $2n^2$.',
          solution: [
            '$2n^2 = 2 \\times 16 = 32$.',
            'Broken down: 4s (2) + 4p (6) + 4d (10) + 4f (14) $= 32$. \u2713'
          ] },

        { id: 'ch-02-05-q5', tier: 'M', kind: 'mcq', parSec: 70, kcs: ['kc-ch2-qnumbers'],
          stem: 'Which set of quantum numbers is **not** possible?',
          options: [
            '$n=3,\\ l=2,\\ m_l=-2$',
            '$n=3,\\ l=3,\\ m_l=0$',
            '$n=4,\\ l=0,\\ m_l=0$',
            '$n=2,\\ l=1,\\ m_l=+1$'
          ],
          answer: 1,
          hint: 'Check $l \\leq n-1$ for each.',
          solution: [
            '$l$ must satisfy $0 \\leq l \\leq n-1$.',
            'Option B has $n = 3$ and $l = 3$, but $l$ can be at most 2. **Impossible.**',
            'The others all satisfy both $l \\leq n-1$ and $|m_l| \\leq l$.'
          ] },

        { id: 'ch-02-05-q6', tier: 'M', kind: 'integer', parSec: 60, kcs: ['kc-ch2-qnumbers'],
          stem: 'How many values of $m_l$ are possible for $l = 2$?',
          answer: 5,
          hint: '$m_l$ runs from $-l$ to $+l$.',
          solution: [
            '$m_l = -2, -1, 0, +1, +2$.',
            'That is $2l + 1 = 5$ values \u2014 the five d orbitals.'
          ] },

        { id: 'ch-02-05-q7', tier: 'H', kind: 'integer', parSec: 100, kcs: ['kc-ch2-nodes'],
          stem: 'How many **radial** nodes does a 3p orbital have?',
          answer: 1,
          hint: 'Radial nodes $= n - l - 1$.',
          solution: [
            'For 3p: $n = 3$ and $l = 1$.',
            'Radial nodes $= n - l - 1 = 3 - 1 - 1 = 1$.',
            'It also has $l = 1$ angular node, making $n - 1 = 2$ nodes in total.'
          ] },

        { id: 'ch-02-05-q8', tier: 'H', kind: 'integer', parSec: 110, kcs: ['kc-ch2-orbitals', 'kc-ch2-qnumbers'],
          stem: 'In a completely filled shell with $n = 3$, how many electrons have $l = 1$?',
          answer: 6,
          hint: '$l = 1$ means the 3p subshell.',
          solution: [
            '$l = 1$ identifies the 3p subshell.',
            'It contains $2l+1 = 3$ orbitals, each holding 2 electrons.',
            '$3 \\times 2 = 6$ electrons.'
          ] },

        { id: 'ch-02-05-q9', tier: 'H', kind: 'mcq', parSec: 120, kcs: ['kc-ch2-qnumbers', 'kc-ch2-orbitals'],
          stem: 'An orbital has $n = 4$ and $l = 2$. It is designated:',
          options: ['4s', '4p', '4d', '4f'],
          answer: 2,
          hint: 'Match $l$ to its letter.',
          solution: [
            '$l = 0 \\to s$, $1 \\to p$, $2 \\to d$, $3 \\to f$.',
            'So $n = 4$, $l = 2$ is the **4d** subshell.',
            'It contains $2l+1 = 5$ orbitals and holds up to 10 electrons.'
          ] }
      ]
    },

    /* ---------------------------------------------------------------
       6. Electronic configuration
       --------------------------------------------------------------- */
    {
      id: 'ch-02-06',
      title: 'Electronic Configuration',
      short: 'Three rules, and two famous exceptions',
      kcs: ['kc-ch2-aufbau', 'kc-ch2-pauli', 'kc-ch2-hund', 'kc-ch2-exceptions'],
      prereq: ['ch-02-05'],
      estMin: 28,
      weight: 1.6,
      widget: 'configBuilder',
      widgetTitle: 'Configuration Builder',
      widgetBrief: 'Fill orbital boxes for any element and have Aufbau, Pauli and Hund checked as you go.',

      story: {
        speaker: 'MOLE-9',
        avatar: '\u2697\ufe0f',
        lines: [
          'Final module. Everything so far has been about **one** electron. Now we put them all in.',
          'Three rules do the whole job. Aufbau says fill the lowest energy first. Pauli says two per orbital, opposite spins. Hund says spread out before pairing up.',
          'And then chromium and copper ignore the order entirely \u2014 for a reason that turns out to be worth understanding rather than memorising.'
        ]
      },

      lesson: [
        { t: 'h', x: 'The three rules' },
        { t: 'ol', items: [
          '**Aufbau**: electrons occupy the lowest-energy orbital available.',
          '**Pauli exclusion**: no two electrons in an atom share all four quantum numbers, so an orbital holds at most two, with opposite spins.',
          '**Hund\u2019s rule of maximum multiplicity**: within a subshell, every orbital gets one electron before any gets a second, and the unpaired electrons have parallel spins.'
        ] },

        { t: 'h', x: 'The (n + l) rule' },
        { t: 'callout', kind: 'jee', title: 'How to get the order right every time',
          x: 'Fill in order of increasing $(n + l)$. If two subshells tie, the one with the **lower $n$** fills first.\n\n4s: $4+0 = 4$. 3d: $3+2 = 5$. So **4s fills before 3d** \u2014 the single most-asked consequence in this chapter.\n\n3d ($=5$) vs 4p ($=5$): a tie, so lower $n$ wins and 3d goes first.' },
        { t: 'formula', name: 'The filling order', tex: '1s\\ 2s\\ 2p\\ 3s\\ 3p\\ 4s\\ 3d\\ 4p\\ 5s\\ 4d\\ 5p\\ 6s\\ 4f\\ 5d\\ 6p\\ 7s\\ 5f\\ 6d', star: true },

        { t: 'anim', id: 'aufbauFilling' },

        { t: 'h', x: 'Writing a configuration' },
        { t: 'worked', title: 'Worked example \u2014 iron, Z = 26', tier: 'M',
          q: 'Write the electronic configuration of Fe ($Z = 26$) and of Fe$^{3+}$, and give the number of unpaired electrons in each.',
          steps: [
            'Fill in order: $1s^2\\,2s^2\\,2p^6\\,3s^2\\,3p^6\\,4s^2\\,3d^6$ \u2014 that is 26 electrons.',
            'In shorthand: $[\\text{Ar}]\\,3d^6\\,4s^2$.',
            'Unpaired in Fe: the five 3d orbitals take one each, then the sixth pairs up. So $6 - 2 = 4$ unpaired.',
            'For Fe$^{3+}$ remove three electrons \u2014 and **the 4s electrons leave first**, even though 4s filled first.',
            'Fe$^{3+}$ is $[\\text{Ar}]\\,3d^5$: five orbitals, one electron each.'
          ],
          ans: 'Fe: $[\\text{Ar}]3d^64s^2$, 4 unpaired. Fe$^{3+}$: $[\\text{Ar}]3d^5$, **5 unpaired** \u2014 a half-filled d subshell, and unusually stable.'
        },
        { t: 'callout', kind: 'trap', title: 'Filled first, removed first \u2014 not true', x: '4s fills **before** 3d but empties **before** it too. Once 3d starts filling, its energy drops below 4s, so cations lose the 4s electrons first. Writing Fe$^{2+}$ as $[\\text{Ar}]3d^44s^2$ is the classic error.' },

        { t: 'h', x: 'The two exceptions' },
        { t: 'table',
          head: ['Element', 'Expected', 'Actual', 'Why'],
          rows: [
            ['Cr ($Z=24$)', '$[\\text{Ar}]3d^44s^2$', '$[\\text{Ar}]3d^54s^1$', 'half-filled d is extra stable'],
            ['Cu ($Z=29$)', '$[\\text{Ar}]3d^94s^2$', '$[\\text{Ar}]3d^{10}4s^1$', 'completely filled d is extra stable']
          ]
        },
        { t: 'callout', kind: 'tip', title: 'The reason, briefly', x: 'Half-filled and fully filled subshells gain stability from symmetrical charge distribution and from exchange energy \u2014 the extra stabilisation available when several electrons have parallel spins. Promoting one 4s electron costs little and buys a lot.' },

        { t: 'sim' },

        { t: 'callout', kind: 'warn', title: 'Two conventions, both accepted', x: 'Fe may be written $[\\text{Ar}]3d^64s^2$ (energy order after filling) or $[\\text{Ar}]4s^23d^6$ (filling order). Examiners accept either. Be consistent within an answer.' }
      ],

      formulas: [
        { name: '(n+l) rule', tex: '\\text{lower } (n+l) \\text{ first; ties by lower } n', star: true },
        { name: 'Order', tex: '1s\\,2s\\,2p\\,3s\\,3p\\,4s\\,3d\\,4p\\,5s\\,4d\\,5p', star: true },
        { name: 'Pauli', tex: '\\leq 2 \\text{ per orbital, opposite spins}' },
        { name: 'Hund', tex: '\\text{singly first, spins parallel}', star: true },
        { name: 'Cr', tex: '[\\text{Ar}]3d^5 4s^1' },
        { name: 'Cu', tex: '[\\text{Ar}]3d^{10} 4s^1' }
      ],

      questions: [
        { id: 'ch-02-06-q1', tier: 'G', kind: 'mcq', parSec: 45, kcs: ['kc-ch2-aufbau'],
          stem: 'The electronic configuration of sodium ($Z = 11$) is:',
          options: [
            '$1s^2\\,2s^2\\,2p^6\\,3s^1$',
            '$1s^2\\,2s^2\\,2p^7$',
            '$1s^2\\,2s^2\\,2p^6\\,3p^1$',
            '$1s^2\\,2s^3\\,2p^6$'
          ],
          answer: 0,
          hint: 'Fill 1s, 2s, 2p, then 3s.',
          solution: [
            'Filling in order: 1s takes 2, 2s takes 2, 2p takes 6 \u2014 that is 10.',
            'The eleventh electron goes into 3s.',
            '$1s^2\\,2s^2\\,2p^6\\,3s^1$, or $[\\text{Ne}]3s^1$.',
            'The single loosely held 3s electron is why sodium is so reactive.'
          ] },

        { id: 'ch-02-06-q2', tier: 'G', kind: 'mcq', parSec: 45, kcs: ['kc-ch2-aufbau'],
          stem: 'Which subshell is filled **first**?',
          options: ['3d', '4s', '4p', '4d'],
          answer: 1,
          hint: 'Compare $(n+l)$ for each.',
          solution: [
            '$(n+l)$: 4s $= 4+0 = 4$; 3d $= 3+2 = 5$; 4p $= 4+1 = 5$; 4d $= 4+2 = 6$.',
            '4s has the lowest value, so it fills first.',
            'Between 3d and 4p (both 5), the lower $n$ wins, so 3d comes before 4p.'
          ] },

        { id: 'ch-02-06-q3', tier: 'G', kind: 'integer', parSec: 50, kcs: ['kc-ch2-hund'],
          stem: 'How many unpaired electrons are there in a nitrogen atom ($Z = 7$)?',
          answer: 3,
          hint: 'Hund\u2019s rule governs the 2p subshell.',
          solution: [
            'N: $1s^2\\,2s^2\\,2p^3$.',
            'Hund\u2019s rule puts one electron in each of the three 2p orbitals before any pairing.',
            'So all **3** are unpaired, with parallel spins.'
          ] },

        { id: 'ch-02-06-q4', tier: 'M', kind: 'mcq', parSec: 65, kcs: ['kc-ch2-aufbau'],
          stem: 'The electronic configuration of chlorine ($Z = 17$) is:',
          options: [
            '$[\\text{Ne}]3s^2\\,3p^5$',
            '$[\\text{Ne}]3s^2\\,3p^6$',
            '$[\\text{Ne}]3s^1\\,3p^6$',
            '$[\\text{Ar}]3s^2\\,3p^5$'
          ],
          answer: 0,
          hint: 'Ne accounts for 10 electrons; seven remain.',
          solution: [
            '[Ne] covers the first 10 electrons.',
            'The remaining 7 fill 3s (2) then 3p (5).',
            '$[\\text{Ne}]3s^2\\,3p^5$.',
            'One short of a full 3p, which is why chlorine so readily gains an electron.'
          ] },

        { id: 'ch-02-06-q5', tier: 'M', kind: 'mcq', parSec: 75, kcs: ['kc-ch2-exceptions'],
          stem: 'The actual configuration of chromium ($Z = 24$) is:',
          options: [
            '$[\\text{Ar}]3d^4\\,4s^2$',
            '$[\\text{Ar}]3d^5\\,4s^1$',
            '$[\\text{Ar}]3d^6$',
            '$[\\text{Ar}]4s^2\\,4p^4$'
          ],
          answer: 1,
          hint: 'A half-filled d subshell is unusually stable.',
          solution: [
            'Aufbau alone predicts $[\\text{Ar}]3d^4\\,4s^2$.',
            'Promoting one 4s electron to 3d gives $[\\text{Ar}]3d^5\\,4s^1$ \u2014 a **half-filled** d subshell.',
            'The extra exchange energy and symmetry of the half-filled shell more than pay for the promotion.',
            'Chromium therefore has 6 unpaired electrons, the most of any element in its row.'
          ] },

        { id: 'ch-02-06-q6', tier: 'M', kind: 'mcq', parSec: 70, kcs: ['kc-ch2-pauli'],
          stem: 'The Pauli exclusion principle implies that an orbital can hold at most:',
          options: ['1 electron', '2 electrons with opposite spins', '2 electrons with parallel spins', '3 electrons'],
          answer: 1,
          hint: 'Two electrons in one orbital already share $n$, $l$ and $m_l$.',
          solution: [
            'Two electrons in the same orbital already share $n$, $l$ and $m_l$.',
            'To differ in all four they must differ in $m_s$, which has only two values: $+\\tfrac{1}{2}$ and $-\\tfrac{1}{2}$.',
            'So an orbital holds a maximum of **two** electrons, necessarily with opposite spins.'
          ] },

        { id: 'ch-02-06-q7', tier: 'H', kind: 'integer', parSec: 120, kcs: ['kc-ch2-hund', 'kc-ch2-exceptions'],
          stem: 'How many unpaired electrons are there in Fe$^{3+}$ ($Z$ of Fe $= 26$)?',
          answer: 5,
          hint: 'Remove the 4s electrons first.',
          solution: [
            'Fe: $[\\text{Ar}]3d^6\\,4s^2$.',
            'For Fe$^{3+}$ remove three electrons: **both 4s first**, then one 3d.',
            'Fe$^{3+}$: $[\\text{Ar}]3d^5$.',
            'By Hund\u2019s rule the five d electrons occupy the five orbitals singly, so there are **5** unpaired.',
            'That half-filled $d^5$ is why Fe$^{3+}$ is more stable than Fe$^{2+}$.'
          ] },

        { id: 'ch-02-06-q8', tier: 'H', kind: 'mcq', parSec: 110, kcs: ['kc-ch2-exceptions'],
          stem: 'The configuration of copper ($Z = 29$) is $[\\text{Ar}]3d^{10}4s^1$ rather than $[\\text{Ar}]3d^{9}4s^2$ because:',
          options: [
            '4s is higher in energy than 3d',
            'a completely filled d subshell is extra stable',
            'copper is a transition metal',
            'the Pauli principle forbids $3d^9$'
          ],
          answer: 1,
          hint: 'What is special about $d^{10}$?',
          solution: [
            'Promoting one 4s electron completes the d subshell: $3d^{10}$.',
            'A **fully filled** subshell is symmetrical and gains substantial exchange stabilisation.',
            'The energy saved exceeds the cost of the promotion, so this is the true ground state.',
            '$3d^9$ is perfectly legal under Pauli \u2014 it is just not the lowest-energy arrangement.'
          ] },

        { id: 'ch-02-06-q9', tier: 'H', kind: 'mcq', parSec: 120, kcs: ['kc-ch2-aufbau'],
          stem: 'Using the $(n+l)$ rule, which fills first: 4f or 5d?',
          options: [
            '4f, because $(n+l)$ is smaller',
            '5d, because $(n+l)$ is smaller',
            'they fill together',
            '5d, because $n$ is larger'
          ],
          answer: 0,
          hint: 'Compute $(n+l)$ for each.',
          solution: [
            '4f: $n + l = 4 + 3 = 7$.',
            '5d: $n + l = 5 + 2 = 7$.',
            'A tie \u2014 so the **lower $n$** fills first, which is 4f.',
            'This is why the lanthanides (filling 4f) appear before the third transition series (filling 5d).'
          ] }
      ]
    }
  ],

  /* ================================================================ */
  boss: {
    id: 'ch-02-boss',
    name: 'The Uncertainty',
    title: 'Unresolvable Wavefunction',
    avatar: '\ud83c\udf2b\ufe0f',
    hp: 10,
    lives: 3,
    timePerQ: 110,
    intro: 'Something in the synthesis bay refuses to hold still. Look at where it is and its motion dissolves; track its motion and its position smears into a cloud. A voice that is everywhere and nowhere says: "YOU CANNOT HAVE BOTH."',
    defeat: 'The cloud collapses \u2014 not to a point, but to a shape: a clean, symmetrical probability density. MOLE-9 claps. "Not a location, Cadet, an **orbital**. That is the honest answer, and you found it."',
    taunts: [
      'Which orbit? There are no orbits.',
      'Check your l against your n.',
      'Which electrons leave first? Think again.',
      'Longer wavelength, more energy? Are you sure?'
    ],
    extraQuestions: [
      { id: 'ch-02-boss-q1', tier: 'H', kind: 'numeric', parSec: 140, tol: { rel: 0.04 }, kcs: ['kc-ch2-spectra'],
        stem: 'Find the wavelength in nm of the first line of the Lyman series ($n = 2 \\to 1$) for hydrogen.',
        answer: 121.6,
        hint: '$\\Delta E = E_2 - E_1$, then $\\lambda = 1240/E$.',
        solution: [
          '$E_1 = -13.6$ eV, $E_2 = -3.40$ eV.',
          '$\\Delta E = -3.40 - (-13.6) = 10.2$ eV.',
          '$\\lambda = \\dfrac{1240}{10.2} = 121.6$ nm \u2014 in the far ultraviolet.',
          'This is the strongest emission line in the universe by photon count, and invisible from the ground because the atmosphere absorbs it.'
        ] },
      { id: 'ch-02-boss-q2', tier: 'H', kind: 'integer', parSec: 120, kcs: ['kc-ch2-orbitals', 'kc-ch2-qnumbers'],
        stem: 'How many electrons in a completely filled $n = 4$ shell have $l = 2$?',
        answer: 10,
        hint: '$l = 2$ means the 4d subshell.',
        solution: [
          '$l = 2$ identifies the 4d subshell.',
          'It has $2l + 1 = 5$ orbitals.',
          'Each holds 2 electrons, so $5 \\times 2 = 10$.'
        ] },
      { id: 'ch-02-boss-q3', tier: 'M', kind: 'mcq', parSec: 100, kcs: ['kc-ch2-planck', 'kc-ch2-emwave'],
        stem: 'Radiation A has twice the wavelength of radiation B. The energy per photon of A compared with B is:',
        options: ['twice', 'half', 'four times', 'one quarter'],
        answer: 1,
        hint: '$E \\propto 1/\\lambda$.',
        solution: [
          '$E = \\dfrac{hc}{\\lambda}$, so energy is **inversely** proportional to wavelength.',
          'Doubling the wavelength halves the energy.',
          'The instinct that "bigger wavelength means bigger energy" is the single most common slip in this topic.'
        ] }
    ]
  },

  formulaSheet: [
    { name: 'Mass number', tex: 'A = Z + N' },
    { name: 'Wave relation', tex: 'c = \\nu\\lambda' },
    { name: 'Photon energy', tex: 'E = h\\nu = hc/\\lambda' },
    { name: 'Energy shortcut', tex: 'E(\\text{eV}) = 1240/\\lambda(\\text{nm})' },
    { name: 'Photoelectric', tex: 'h\\nu = \\phi + KE_{max}' },
    { name: 'Stopping potential', tex: 'eV_0 = KE_{max}' },
    { name: 'Bohr radius', tex: 'r_n = 0.529 n^2/Z\\ \\text{\u00c5}' },
    { name: 'Bohr energy', tex: 'E_n = -13.6 Z^2/n^2\\ \\text{eV}' },
    { name: 'Bohr velocity', tex: 'v_n = 2.18\\times10^6 Z/n\\ \\text{m/s}' },
    { name: 'Angular momentum', tex: 'mvr = nh/2\\pi' },
    { name: 'Rydberg', tex: '1/\\lambda = R_H Z^2(1/n_1^2 - 1/n_2^2)' },
    { name: 'Spectral lines', tex: 'n(n-1)/2' },
    { name: 'de Broglie', tex: '\\lambda = h/mv = h/\\sqrt{2mKE}' },
    { name: 'Accelerated electron', tex: '\\lambda = 12.27/\\sqrt{V}\\ \\text{\u00c5}' },
    { name: 'Heisenberg', tex: '\\Delta x\\,\\Delta p \\geq h/4\\pi' },
    { name: 'Quantum numbers', tex: 'l \\leq n-1,\\quad |m_l| \\leq l' },
    { name: 'Shell counts', tex: 'n^2 \\text{ orbitals},\\ 2n^2 \\text{ electrons}' },
    { name: 'Radial nodes', tex: 'n - l - 1' },
    { name: 'Filling order', tex: '\\text{lowest } (n+l),\\ \\text{ties by lower } n' },
    { name: 'Exceptions', tex: '\\text{Cr } 3d^54s^1,\\ \\text{Cu } 3d^{10}4s^1' }
  ]
};
