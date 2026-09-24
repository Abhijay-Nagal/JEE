/**
 * syllabus.js - subject metadata, the narrative frame, and the roadmap.
 *
 * ROADMAP lists every JEE Main unit. Chapters marked `status: 'live'` are
 * authored and playable; the rest are shown greyed out so the app presents a
 * truthful map of the syllabus rather than pretending it is complete. Adding a
 * chapter means authoring one data file, registering it, and flipping its
 * status here.
 */

export const SUBJECTS = [
  {
    id: 'physics',
    name: 'Physics',
    icon: '📐',
    tagline: 'Measure it, model it, predict it',
    wing: 'Metrology Deck',
    guide: { name: 'VERA', avatar: '📐' },
    paperWeight: 33.3,
    blurb: 'JEE physics rewards the student who can turn a paragraph into a diagram and a diagram into an equation. Chapter 1 is where the habit starts.'
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    icon: '⚗️',
    tagline: 'Counting particles by weighing matter',
    wing: 'Synthesis Bay',
    guide: { name: 'MOLE-9', avatar: '⚗️' },
    paperWeight: 33.3,
    blurb: 'Physical chemistry is arithmetic with units attached. Every later calculation - equilibrium, thermodynamics, electrochemistry - is downstream of the mole.'
  },
  {
    id: 'maths',
    name: 'Mathematics',
    icon: '♾️',
    tagline: 'The language everything else is written in',
    wing: 'Logic Core',
    guide: { name: 'CANTOR', avatar: '♾️' },
    paperWeight: 33.3,
    blurb: 'The early chapters look like definitions to memorise. They are actually the vocabulary everything later is written in - and students who skim them pay for it for three years.'
  }
];

export const SUBJECT_BY_ID = Object.fromEntries(SUBJECTS.map((s) => [s.id, s]));

/* ------------------------------------------------------------------ */
/* the frame story                                                     */
/* ------------------------------------------------------------------ */

export const STORY = {
  title: 'The Aryabhata Protocol',
  premise: 'A solar flare has wiped the calibration, synthesis and logic archives of the orbital research station *Aryabhata*. You are the cadet assigned to rebuild them - not by copying files, but by understanding the reasoning they stored.',
  acts: [
    { id: 'act-1', name: 'Act I — Restore the Cores', chapters: ['ph-01', 'ch-01', 'm-01'],
      summary: 'Three wings, three damaged cores, three corrupted subsystems standing in the way.' },
    { id: 'act-2', name: 'Act II — Beyond the Foundations', chapters: ['ph-02', 'ch-02', 'm-02'],
      summary: 'Motion, the structure of the atom, and the numbers that were missing from the real line. Three more subsystems, three more things standing in the way.' },
    { id: 'act-3', name: 'Act III — The Deep Archive', chapters: [], status: 'locked',
      summary: 'The rest of the syllabus. Not yet restored.' }
  ],
  cast: [
    { name: 'VERA', avatar: '📐', role: 'Metrology core. Precise, dry, allergic to unlabelled numbers.' },
    { name: 'MOLE-9', avatar: '⚗️', role: 'Synthesis core. Enthusiastic to a fault. Has opinions about ratios.' },
    { name: 'CANTOR', avatar: '♾️', role: 'Logic core. Formal, patient, still unsettled by infinity.' },
    { name: 'You', avatar: '🛰️', role: 'Cadet. The only one aboard who can actually learn.' }
  ]
};

/* ------------------------------------------------------------------ */
/* full syllabus roadmap                                               */
/* ------------------------------------------------------------------ */

/**
 * The complete JEE Main unit list per subject. `status: 'live'` marks what is
 * authored and playable today; everything else is shown greyed out on the
 * subject screen so a learner can see where they are in the whole course.
 */
export const ROADMAP = {
  physics: [
    { n: 1, title: 'Units and Measurements', id: 'ph-01', status: 'live' },
    { n: 2, title: 'Kinematics', id: 'ph-02', status: 'live' },
    { n: 3, title: 'Laws of Motion', status: 'planned' },
    { n: 4, title: 'Work, Energy and Power', status: 'planned' },
    { n: 5, title: 'Rotational Motion', status: 'planned' },
    { n: 6, title: 'Gravitation', status: 'planned' },
    { n: 7, title: 'Properties of Solids and Liquids', status: 'planned' },
    { n: 8, title: 'Thermodynamics', status: 'planned' },
    { n: 9, title: 'Kinetic Theory of Gases', status: 'planned' },
    { n: 10, title: 'Oscillations and Waves', status: 'planned' },
    { n: 11, title: 'Electrostatics', status: 'planned' },
    { n: 12, title: 'Current Electricity', status: 'planned' },
    { n: 13, title: 'Magnetic Effects of Current and Magnetism', status: 'planned' },
    { n: 14, title: 'Electromagnetic Induction and AC', status: 'planned' },
    { n: 15, title: 'Electromagnetic Waves', status: 'planned' },
    { n: 16, title: 'Optics', status: 'planned' },
    { n: 17, title: 'Dual Nature of Matter and Radiation', status: 'planned' },
    { n: 18, title: 'Atoms and Nuclei', status: 'planned' },
    { n: 19, title: 'Electronic Devices', status: 'planned' },
    { n: 20, title: 'Experimental Skills', status: 'planned' }
  ],
  chemistry: [
    { n: 1, title: 'Some Basic Concepts of Chemistry', id: 'ch-01', status: 'live' },
    { n: 2, title: 'Atomic Structure', id: 'ch-02', status: 'live' },
    { n: 3, title: 'Chemical Bonding and Molecular Structure', status: 'planned' },
    { n: 4, title: 'Chemical Thermodynamics', status: 'planned' },
    { n: 5, title: 'Solutions', status: 'planned' },
    { n: 6, title: 'Equilibrium', status: 'planned' },
    { n: 7, title: 'Redox Reactions and Electrochemistry', status: 'planned' },
    { n: 8, title: 'Chemical Kinetics', status: 'planned' },
    { n: 9, title: 'Classification of Elements and Periodicity', status: 'planned' },
    { n: 10, title: 'p-Block Elements', status: 'planned' },
    { n: 11, title: 'd- and f-Block Elements', status: 'planned' },
    { n: 12, title: 'Coordination Compounds', status: 'planned' },
    { n: 13, title: 'Purification and Characterisation of Organic Compounds', status: 'planned' },
    { n: 14, title: 'Basic Principles of Organic Chemistry', status: 'planned' },
    { n: 15, title: 'Hydrocarbons', status: 'planned' },
    { n: 16, title: 'Organic Compounds Containing Halogens', status: 'planned' },
    { n: 17, title: 'Organic Compounds Containing Oxygen', status: 'planned' },
    { n: 18, title: 'Organic Compounds Containing Nitrogen', status: 'planned' },
    { n: 19, title: 'Biomolecules', status: 'planned' },
    { n: 20, title: 'Principles Related to Practical Chemistry', status: 'planned' }
  ],
  maths: [
    { n: 1, title: 'Sets, Relations and Functions', id: 'm-01', status: 'live' },
    { n: 2, title: 'Complex Numbers and Quadratic Equations', id: 'm-02', status: 'live' },
    { n: 3, title: 'Matrices and Determinants', status: 'planned' },
    { n: 4, title: 'Permutations and Combinations', status: 'planned' },
    { n: 5, title: 'Binomial Theorem', status: 'planned' },
    { n: 6, title: 'Sequences and Series', status: 'planned' },
    { n: 7, title: 'Limits, Continuity and Differentiability', status: 'planned' },
    { n: 8, title: 'Integral Calculus', status: 'planned' },
    { n: 9, title: 'Differential Equations', status: 'planned' },
    { n: 10, title: 'Coordinate Geometry', status: 'planned' },
    { n: 11, title: 'Three Dimensional Geometry', status: 'planned' },
    { n: 12, title: 'Vector Algebra', status: 'planned' },
    { n: 13, title: 'Statistics and Probability', status: 'planned' },
    { n: 14, title: 'Trigonometry', status: 'planned' }
  ]
};

/** GMH ladder - the difficulty tiers used everywhere in the app. */
export const TIERS = {
  G: { key: 'G', name: 'Grasp',   label: 'Concept check',      hint: 'Can you state and apply the idea?',           color: 'var(--tier-g)' },
  M: { key: 'M', name: 'Mastery', label: 'JEE Main standard',  hint: 'Can you use it under exam conditions?',       color: 'var(--tier-m)' },
  H: { key: 'H', name: 'Hurdle',  label: 'JEE Advanced level', hint: 'Can you combine it with something else?',     color: 'var(--tier-h)' }
};

export const TIER_ORDER = ['G', 'M', 'H'];
