/**
 * Physics - Chapter 2: Kinematics
 *
 * JEE Main Unit 2. Six topics: describing motion, the equations that follow
 * from uniform acceleration, vertical motion, relative velocity and
 * projectiles. Every topic carries both a simulation and a concept animation,
 * because kinematics is the chapter where a picture genuinely is worth more
 * than the algebra.
 */

export default {
  id: 'ph-02',
  subject: 'physics',
  number: 2,
  title: 'Kinematics',
  subtitle: 'Describing motion before explaining it',
  blurb: 'Kinematics asks only *what* is moving and how, never *why*. That restraint is what makes it tractable \u2014 and it is the grammar every later mechanics chapter is written in.',
  jeeWeight: 4.5,
  estMin: 300,
  icon: '\ud83d\ude80',

  guide: {
    name: 'VERA',
    full: 'Vernier Engineering & Reasoning Assistant',
    avatar: '\ud83d\udcd0',
    voice: 'precise, dry, faintly amused'
  },

  intro: {
    speaker: 'VERA',
    avatar: '\ud83d\udcd0',
    lines: [
      'Module archive restored, Cadet. Which is when we discovered the second problem.',
      'The station knows how to measure. It no longer knows **where it is**. Navigation has lost the difference between how far we have travelled and how far we have moved \u2014 and those are not the same number.',
      'Kinematics is the answer, and it is a discipline of *restraint*. You will not ask why anything moves. Forces come later. Here you only describe: position, velocity, acceleration, and the relations between them.',
      'Six modules. Master them and the navigation core comes back online. Fail, and we keep drifting \u2014 confidently, and in a direction nobody can name.'
    ]
  },

  /* ================================================================ */
  kcs: {
    'kc-ph2-frame':     { name: 'Reference frames and 1-D position', weight: 0.9, prereq: [] },
    'kc-ph2-distdisp':  { name: 'Distance vs displacement',          weight: 1.5, prereq: ['kc-ph2-frame'] },
    'kc-ph2-avgspeed':  { name: 'Average speed vs average velocity', weight: 1.5, prereq: ['kc-ph2-distdisp'] },

    'kc-ph2-instvel':   { name: 'Instantaneous velocity as a slope', weight: 1.6, prereq: ['kc-ph2-avgspeed'] },
    'kc-ph2-accel':     { name: 'Acceleration and its sign',         weight: 1.5, prereq: ['kc-ph2-instvel'] },
    'kc-ph2-graphs':    { name: 'Reading x-t, v-t and a-t graphs',   weight: 1.7, prereq: ['kc-ph2-instvel'] },

    'kc-ph2-suvat':     { name: 'The three equations of motion',     weight: 1.8, prereq: ['kc-ph2-accel'] },
    'kc-ph2-suvatpick': { name: 'Choosing the right equation',       weight: 1.4, prereq: ['kc-ph2-suvat'] },
    'kc-ph2-nthsec':    { name: 'Distance in the nth second',        weight: 1.1, prereq: ['kc-ph2-suvat'] },

    'kc-ph2-freefall':  { name: 'Free fall from rest',               weight: 1.3, prereq: ['kc-ph2-suvat'] },
    'kc-ph2-updown':    { name: 'Vertical projection and symmetry',  weight: 1.5, prereq: ['kc-ph2-freefall'] },
    'kc-ph2-gsign':     { name: 'Sign conventions with gravity',     weight: 1.3, prereq: ['kc-ph2-freefall'] },

    'kc-ph2-relvel':    { name: 'Relative velocity in one dimension', weight: 1.4, prereq: ['kc-ph2-accel'] },
    'kc-ph2-relvec':    { name: 'Relative velocity as a vector difference', weight: 1.6, prereq: ['kc-ph2-relvel'] },
    'kc-ph2-river':     { name: 'River-crossing problems',           weight: 1.5, prereq: ['kc-ph2-relvec'] },

    'kc-ph2-projcomp':  { name: 'Resolving projectile motion',       weight: 1.7, prereq: ['kc-ph2-suvat', 'kc-ph2-updown'] },
    'kc-ph2-projtime':  { name: 'Time of flight and maximum height', weight: 1.6, prereq: ['kc-ph2-projcomp'] },
    'kc-ph2-projrange': { name: 'Range and the optimal angle',       weight: 1.6, prereq: ['kc-ph2-projtime'] },
    'kc-ph2-projpath':  { name: 'Equation of the trajectory',        weight: 1.2, prereq: ['kc-ph2-projcomp'] }
  },

  /* ================================================================ */
  topics: [
    /* ---------------------------------------------------------------
       1. Motion, distance and displacement
       --------------------------------------------------------------- */
    {
      id: 'ph-02-01',
      title: 'Motion, Distance & Displacement',
      short: 'How far you went, and how far you got',
      kcs: ['kc-ph2-frame', 'kc-ph2-distdisp', 'kc-ph2-avgspeed'],
      prereq: [],
      estMin: 26,
      weight: 1.2,
      widget: 'pathTracer',
      widgetTitle: 'Path Tracer',
      widgetBrief: 'Draw a route with your finger and watch distance and displacement diverge in real time.',

      story: {
        speaker: 'VERA',
        avatar: '\ud83d\udcd0',
        lines: [
          'Module One. The distinction the navigation core lost.',
          'Yesterday the hull drones logged 14 kilometres of travel. Their displacement was four metres. Both numbers are correct, and only one of them tells you where the drone is.',
          'Confuse them and you will average the wrong quantity, take the wrong ratio, and arrive at an answer that is beautifully computed and physically meaningless.'
        ]
      },

      lesson: [
        { t: 'p', x: 'Motion is always **relative to a frame of reference**. "The passenger is at rest" and "the passenger is doing 300 km/h" are both true \u2014 relative to the train, and to the ground. Before any kinematics question, silently fix your frame and your positive direction.' },

        { t: 'h', x: 'Distance and displacement' },
        { t: 'table',
          head: ['', 'Distance', 'Displacement'],
          rows: [
            ['Type', 'Scalar', 'Vector'],
            ['Measures', 'Total path length travelled', 'Straight line from start to finish'],
            ['Can be zero while moving?', 'No \u2014 it only increases', 'Yes \u2014 any closed loop'],
            ['Sign', 'Always positive', 'Carries a direction'],
            ['Relation', '', '$|\\vec{s}| \\leq \\text{distance}$']
          ]
        },
        { t: 'callout', kind: 'jee', title: 'The inequality is the whole idea',
          x: 'Displacement can never exceed distance. They are equal **only** for motion in a straight line that never reverses \u2014 which is exactly the case most textbook problems quietly assume.' },

        { t: 'anim', id: 'distanceDisplacement' },

        { t: 'h', x: 'Average speed and average velocity' },
        { t: 'formula', name: 'Average speed', tex: '\\text{average speed} = \\frac{\\text{total distance}}{\\text{total time}}', star: true },
        { t: 'formula', name: 'Average velocity', tex: '\\vec{v}_{\\text{av}} = \\frac{\\text{total displacement}}{\\text{total time}} = \\frac{\\Delta \\vec{x}}{\\Delta t}', star: true },
        { t: 'callout', kind: 'trap', title: 'A round trip has zero average velocity', x: 'Drive to Delhi and back and your average velocity for the journey is exactly **zero**, no matter how fast you drove. Your average speed is not. Examiners set this deliberately.' },

        { t: 'h', x: 'The two "half" problems' },
        { t: 'p', x: 'These look identical and have different answers. Learn to spot which one you are being asked.' },
        { t: 'worked', title: 'Worked example \u2014 half the *distance* at each speed', tier: 'M',
          q: 'A car covers the first half of a journey at $40\\ \\text{km h}^{-1}$ and the second half at $60\\ \\text{km h}^{-1}$. Find the average speed.',
          steps: [
            'Let the total distance be $2d$, so each half is $d$.',
            'Time for the first half: $t_1 = d/40$. Time for the second: $t_2 = d/60$.',
            'Average speed $= \\dfrac{2d}{t_1 + t_2} = \\dfrac{2d}{\\frac{d}{40} + \\frac{d}{60}}$.',
            'The $d$ cancels: $= \\dfrac{2}{\\frac{1}{40} + \\frac{1}{60}} = \\dfrac{2}{\\frac{3+2}{120}} = \\dfrac{240}{5}$.',
            'This is the **harmonic mean** $\\dfrac{2v_1v_2}{v_1+v_2}$, and it is always *less* than the arithmetic mean.'
          ],
          ans: '$48\\ \\text{km h}^{-1}$ \u2014 not 50.'
        },
        { t: 'worked', title: 'Worked example \u2014 half the *time* at each speed', tier: 'M',
          q: 'The same two speeds, but now each is held for half the total time. Find the average speed.',
          steps: [
            'Let the total time be $2t$.',
            'Distance covered $= 40t + 60t = 100t$.',
            'Average speed $= \\dfrac{100t}{2t} = 50$.',
            'Now it is the **arithmetic mean** $\\dfrac{v_1+v_2}{2}$.'
          ],
          ans: '$50\\ \\text{km h}^{-1}$. Same two speeds, different answer \u2014 read the question.'
        },

        { t: 'sim' },

        { t: 'callout', kind: 'tip', title: 'A habit worth building', x: 'Draw the motion before you compute anything. A rough sketch with the start, the finish and the turning points marked will tell you whether displacement is 4 m or 12 m long before you touch a formula.' }
      ],

      formulas: [
        { name: 'Average speed', tex: '\\bar{v} = \\frac{\\text{distance}}{\\text{time}}', star: true },
        { name: 'Average velocity', tex: '\\vec{v}_{av} = \\frac{\\Delta\\vec{x}}{\\Delta t}', star: true },
        { name: 'Equal distances', tex: '\\bar{v} = \\frac{2v_1v_2}{v_1+v_2}' },
        { name: 'Equal times', tex: '\\bar{v} = \\frac{v_1+v_2}{2}' }
      ],

      questions: [
        { id: 'ph-02-01-q1', tier: 'G', kind: 'numeric', parSec: 45, tol: { abs: 0.05 }, kcs: ['kc-ph2-distdisp'],
          stem: 'A body walks $3$ m east, then $4$ m north. What is the magnitude of its **displacement** in metres?',
          answer: 5,
          hint: 'The two legs are perpendicular.',
          solution: [
            'Displacement is the straight line from start to finish.',
            'The two legs are at right angles, so use Pythagoras: $\\sqrt{3^2 + 4^2}$.',
            '$= \\sqrt{25} = 5$ m.',
            'The **distance** travelled, by contrast, is $3 + 4 = 7$ m.'
          ] },

        { id: 'ph-02-01-q2', tier: 'G', kind: 'mcq', parSec: 35, kcs: ['kc-ph2-distdisp'],
          stem: 'Which statement is **always** true?',
          options: [
            'Distance $\\leq$ |displacement|',
            '|displacement| $\\leq$ distance',
            'Distance $=$ |displacement|',
            'Displacement is always positive'
          ],
          answer: 1,
          hint: 'Can a straight line be longer than a path with the same endpoints?',
          solution: [
            'The straight line between two points is the shortest route between them.',
            'So the displacement can never exceed the actual path length: $|\\vec{s}| \\leq d$.',
            'They are equal only for straight-line motion with no reversal.',
            'Displacement is a vector \u2014 in one dimension it can be negative.'
          ] },

        { id: 'ph-02-01-q3', tier: 'G', kind: 'mcq', parSec: 40, kcs: ['kc-ph2-avgspeed'],
          stem: 'A runner completes exactly one lap of a circular track. For that lap:',
          options: [
            'average speed and average velocity are both zero',
            'average speed is zero, average velocity is not',
            'average velocity is zero, average speed is not',
            'both are non-zero and equal'
          ],
          answer: 2,
          hint: 'Where does the runner finish, relative to the start?',
          solution: [
            'The runner ends where they began, so the **displacement is zero**.',
            'Average velocity $= \\dfrac{\\text{displacement}}{\\text{time}} = 0$.',
            'But they ran a full circumference, so the distance is $2\\pi r$ and the average speed is definitely not zero.'
          ] },

        { id: 'ph-02-01-q4', tier: 'M', kind: 'numeric', parSec: 75, tol: { rel: 0.02 }, kcs: ['kc-ph2-avgspeed'],
          stem: 'A car covers the first half of a distance at $40\\ \\text{km h}^{-1}$ and the second half at $60\\ \\text{km h}^{-1}$. Find its average speed in $\\text{km h}^{-1}$.',
          answer: 48,
          hint: 'Equal distances, not equal times \u2014 that means the harmonic mean.',
          solution: [
            'Let each half be $d$. Then $t_1 = \\dfrac{d}{40}$ and $t_2 = \\dfrac{d}{60}$.',
            '$\\bar{v} = \\dfrac{2d}{t_1+t_2} = \\dfrac{2v_1v_2}{v_1+v_2} = \\dfrac{2(40)(60)}{100}$.',
            '$= 48\\ \\text{km h}^{-1}$.',
            'Note it is *below* 50: more time is spent at the slower speed.'
          ] },

        { id: 'ph-02-01-q5', tier: 'M', kind: 'mcq', parSec: 70, kcs: ['kc-ph2-distdisp'],
          stem: 'A particle travels along a semicircular arc of radius $R$ from one end of a diameter to the other. The ratio $\\dfrac{\\text{distance}}{|\\text{displacement}|}$ is:',
          options: ['$\\dfrac{\\pi}{2}$', '$\\pi$', '$2$', '$\\dfrac{\\pi}{4}$'],
          answer: 0,
          hint: 'The displacement is the diameter.',
          solution: [
            'Distance along the semicircle $= \\pi R$.',
            'Displacement is the straight line joining the ends of the diameter $= 2R$.',
            'Ratio $= \\dfrac{\\pi R}{2R} = \\dfrac{\\pi}{2} \\approx 1.57$.',
            'Consistent with the rule: the ratio is always $\\geq 1$.'
          ] },

        { id: 'ph-02-01-q6', tier: 'M', kind: 'numeric', parSec: 70, tol: { rel: 0.02 }, kcs: ['kc-ph2-avgspeed'],
          stem: 'A body moves at $40\\ \\text{km h}^{-1}$ for half the **time** of its journey and $60\\ \\text{km h}^{-1}$ for the other half. Find the average speed in $\\text{km h}^{-1}$.',
          answer: 50,
          hint: 'Equal times this time \u2014 which mean is it?',
          solution: [
            'Let each half of the journey last $t$.',
            'Distance $= 40t + 60t = 100t$; total time $= 2t$.',
            '$\\bar{v} = \\dfrac{100t}{2t} = 50\\ \\text{km h}^{-1}$ \u2014 the arithmetic mean.',
            'Compare with the equal-**distance** version, which gives 48. The wording decides the answer.'
          ] },

        { id: 'ph-02-01-q7', tier: 'H', kind: 'numeric', parSec: 140, tol: { abs: 0.1 }, kcs: ['kc-ph2-distdisp'],
          stem: 'A particle moves along a line with $x = t^3 - 6t^2 + 9t$ (metres, seconds). Find the total **distance** travelled between $t = 0$ and $t = 4$ s.',
          answer: 12,
          hint: 'Find where the velocity changes sign and add the legs separately.',
          solution: [
            '$v = \\dfrac{dx}{dt} = 3t^2 - 12t + 9 = 3(t-1)(t-3)$, which is zero at $t = 1$ and $t = 3$.',
            'Positions: $x(0) = 0$, $x(1) = 4$, $x(3) = 0$, $x(4) = 4$.',
            'The particle goes forward 4 m, back 4 m, then forward 4 m again.',
            'Distance $= 4 + 4 + 4 = 12$ m.',
            'Its **displacement** over the same interval is only $x(4) - x(0) = 4$ m. Adding the legs without the modulus is the classic slip.'
          ] },

        { id: 'ph-02-01-q8', tier: 'H', kind: 'mcq', parSec: 120, kcs: ['kc-ph2-avgspeed'],
          stem: 'A body covers three equal distances at speeds $v_1$, $v_2$ and $v_3$. Its average speed is:',
          options: [
            '$\\dfrac{v_1+v_2+v_3}{3}$',
            '$\\dfrac{3v_1v_2v_3}{v_1v_2 + v_2v_3 + v_3v_1}$',
            '$\\dfrac{v_1v_2v_3}{3}$',
            '$\\sqrt[3]{v_1v_2v_3}$'
          ],
          answer: 1,
          hint: 'Equal distances always give the harmonic mean \u2014 extend it to three terms.',
          solution: [
            'Let each leg be $d$. Total distance $= 3d$.',
            'Total time $= \\dfrac{d}{v_1} + \\dfrac{d}{v_2} + \\dfrac{d}{v_3}$.',
            '$\\bar{v} = \\dfrac{3d}{d\\left(\\frac{1}{v_1}+\\frac{1}{v_2}+\\frac{1}{v_3}\\right)} = \\dfrac{3}{\\frac{1}{v_1}+\\frac{1}{v_2}+\\frac{1}{v_3}}$.',
            'Putting that over a common denominator gives $\\dfrac{3v_1v_2v_3}{v_1v_2+v_2v_3+v_3v_1}$ \u2014 the harmonic mean of three terms.'
          ] },

        { id: 'ph-02-01-q9', tier: 'H', kind: 'mcq', parSec: 110, kcs: ['kc-ph2-frame', 'kc-ph2-avgspeed'],
          stem: 'A man walks from his house to a shop $1$ km away in $10$ minutes, spends $5$ minutes there, and returns in $15$ minutes. His average **velocity** for the whole outing is:',
          options: [
            '$4\\ \\text{km h}^{-1}$',
            '$0$',
            '$2\\ \\text{km h}^{-1}$',
            '$3.3\\ \\text{km h}^{-1}$'
          ],
          answer: 1,
          hint: 'Where does he end up?',
          solution: [
            'He finishes at his house \u2014 exactly where he started.',
            'Total displacement $= 0$, so average velocity $= \\dfrac{0}{30\\ \\text{min}} = 0$.',
            'His average **speed** is $\\dfrac{2\\ \\text{km}}{0.5\\ \\text{h}} = 4\\ \\text{km h}^{-1}$, which is the number the distractor is offering.'
          ] }
      ]
    },

    /* ---------------------------------------------------------------
       2. Velocity, acceleration and graphs
       --------------------------------------------------------------- */
    {
      id: 'ph-02-02',
      title: 'Velocity, Acceleration & Motion Graphs',
      short: 'Slopes, areas, and what each graph is hiding',
      kcs: ['kc-ph2-instvel', 'kc-ph2-accel', 'kc-ph2-graphs'],
      prereq: ['ph-02-01'],
      estMin: 30,
      weight: 1.6,
      widget: 'motionProbe',
      widgetTitle: 'Motion Probe',
      widgetBrief: 'Steer a body and watch its x\u2013t, v\u2013t and a\u2013t graphs draw themselves in step.',

      story: {
        speaker: 'VERA',
        avatar: '\ud83d\udcd0',
        lines: [
          'Module Two. Three graphs of the same motion, and a great deal of confusion between them.',
          'A candidate who sees "the graph is going down" and writes "the body is going backwards" has just guessed. On an x\u2013t graph that is true. On a v\u2013t graph it means the body is *slowing while still moving forward*.',
          'Learn which graph you are looking at before you say anything about it.'
        ]
      },

      lesson: [
        { t: 'h', x: 'From average to instantaneous' },
        { t: 'p', x: 'Average velocity over an interval is a chord of the $x$\u2013$t$ graph. Shrink the interval to nothing and the chord becomes the **tangent** \u2014 that is the instantaneous velocity.' },
        { t: 'formula', name: 'Instantaneous velocity', tex: 'v = \\lim_{\\Delta t \\to 0}\\frac{\\Delta x}{\\Delta t} = \\frac{dx}{dt}', star: true },
        { t: 'formula', name: 'Instantaneous acceleration', tex: 'a = \\frac{dv}{dt} = \\frac{d^2x}{dt^2}', star: true },

        { t: 'anim', id: 'slopeIsVelocity' },

        { t: 'h', x: 'What each graph gives you' },
        { t: 'table',
          head: ['Graph', 'Its slope gives', 'Its area gives'],
          rows: [
            ['$x$ vs $t$', 'velocity', 'nothing useful'],
            ['$v$ vs $t$', 'acceleration', '**displacement**'],
            ['$a$ vs $t$', 'jerk (out of syllabus)', '**change in velocity**']
          ]
        },
        { t: 'callout', kind: 'jee', title: 'Two rules, and almost every graph question falls',
          x: '**Slope moves you down the list** ($x \\to v \\to a$).\n\n**Area moves you up it** ($a \\to v \\to x$).' },

        { t: 'h', x: 'The sign of acceleration' },
        { t: 'callout', kind: 'trap', title: 'Negative acceleration does not mean "slowing down"',
          x: 'It means the acceleration points in the negative direction. Whether the body speeds up or slows down depends on whether $v$ and $a$ have the **same** sign.\n\nSame signs \u2192 speeding up. Opposite signs \u2192 slowing down. A ball falling downward with $v<0$ and $a<0$ is speeding up.' },

        { t: 'ul', items: [
          'A straight $x$\u2013$t$ line means **constant velocity** (zero acceleration).',
          'A curved $x$\u2013$t$ graph means the velocity is changing \u2014 there is acceleration.',
          'A horizontal $v$\u2013$t$ line means **uniform velocity**; a sloped straight line means **uniform acceleration**.',
          'An $x$\u2013$t$ graph can never be vertical \u2014 that would be infinite velocity.',
          'A maximum or minimum on the $x$\u2013$t$ graph is where the body turns round: $v = 0$ there.'
        ] },

        { t: 'worked', title: 'Worked example \u2014 differentiating a position function', tier: 'M',
          q: 'A particle moves with $x = 2 + 5t - 3t^2$ (SI units). Find its velocity and acceleration at $t = 1$ s, and describe the motion.',
          steps: [
            '$v = \\dfrac{dx}{dt} = 5 - 6t$. At $t = 1$: $v = 5 - 6 = -1\\ \\text{m s}^{-1}$.',
            '$a = \\dfrac{dv}{dt} = -6\\ \\text{m s}^{-2}$, constant.',
            'At $t = 1$ both $v$ and $a$ are negative \u2014 **same sign**, so the particle is speeding up in the negative direction.',
            'It turned round at $v = 0$, i.e. $t = 5/6$ s.'
          ],
          ans: '$v = -1\\ \\text{m s}^{-1}$, $a = -6\\ \\text{m s}^{-2}$, moving backwards and speeding up.'
        },

        { t: 'sim' },

        { t: 'callout', kind: 'tip', title: 'Reading a v\u2013t graph for displacement', x: 'Area **below** the time axis counts as negative displacement. For total *distance* take the modulus of each region and add; for *displacement* keep the signs. It is the distance/displacement distinction again, in graph form.' }
      ],

      formulas: [
        { name: 'Velocity', tex: 'v = dx/dt', star: true },
        { name: 'Acceleration', tex: 'a = dv/dt = d^2x/dt^2', star: true },
        { name: 'Displacement from v-t', tex: '\\Delta x = \\int v\\,dt = \\text{area under } v\\text{-}t' },
        { name: 'Velocity change from a-t', tex: '\\Delta v = \\int a\\,dt' },
        { name: 'Speeding up test', tex: 'v \\cdot a > 0' }
      ],

      questions: [
        { id: 'ph-02-02-q1', tier: 'G', kind: 'mcq', parSec: 35, kcs: ['kc-ph2-graphs'],
          stem: 'The slope of a position\u2013time graph gives:',
          options: ['acceleration', 'velocity', 'displacement', 'distance'],
          answer: 1,
          hint: 'Slope is rise over run \u2014 here, $\\Delta x / \\Delta t$.',
          solution: [
            'Slope $=\\dfrac{\\Delta x}{\\Delta t}$, which is exactly the definition of velocity.',
            'In the limit of a vanishing interval this is $\\dfrac{dx}{dt}$ \u2014 the instantaneous velocity.'
          ] },

        { id: 'ph-02-02-q2', tier: 'G', kind: 'mcq', parSec: 40, kcs: ['kc-ph2-graphs'],
          stem: 'The **area** under a velocity\u2013time graph gives:',
          options: ['acceleration', 'displacement', 'speed', 'jerk'],
          answer: 1,
          hint: 'Velocity multiplied by time has the units of\u2026?',
          solution: [
            'Area $=$ height $\\times$ width $= v \\times t$, which has units of metres.',
            'So the area under a $v$\u2013$t$ graph is the **displacement**.',
            'Keep the signs: area below the axis is negative displacement.'
          ] },

        { id: 'ph-02-02-q3', tier: 'G', kind: 'numeric', parSec: 50, tol: { abs: 0.1 }, kcs: ['kc-ph2-instvel'],
          stem: 'A particle has $x = 4t^2$ (SI units). Find its velocity in $\\text{m s}^{-1}$ at $t = 3$ s.',
          answer: 24,
          hint: 'Differentiate once.',
          solution: [
            '$v = \\dfrac{dx}{dt} = 8t$.',
            'At $t = 3$: $v = 8 \\times 3 = 24\\ \\text{m s}^{-1}$.',
            'The acceleration is $\\dfrac{dv}{dt} = 8\\ \\text{m s}^{-2}$, constant.'
          ] },

        { id: 'ph-02-02-q4', tier: 'M', kind: 'mcq', parSec: 70, kcs: ['kc-ph2-accel'],
          stem: 'A body has velocity $v = -6\\ \\text{m s}^{-1}$ and acceleration $a = -2\\ \\text{m s}^{-2}$. The body is:',
          options: [
            'slowing down',
            'speeding up',
            'moving with constant speed',
            'at rest'
          ],
          answer: 1,
          hint: 'Compare the signs of $v$ and $a$.',
          solution: [
            'Both $v$ and $a$ are negative, so they point the **same way**.',
            'An acceleration in the direction of motion increases the speed.',
            'So the body is speeding up \u2014 in the negative direction. $|v|$ is growing.',
            'The test is simply the sign of $v \\cdot a$: positive means speeding up.'
          ] },

        { id: 'ph-02-02-q5', tier: 'M', kind: 'numeric', parSec: 75, tol: { abs: 0.1 }, kcs: ['kc-ph2-accel'],
          stem: 'A particle\u2019s velocity is $v = 4t^3$ (SI units). Find its **average acceleration** in $\\text{m s}^{-2}$ between $t=0$ and $t=2$ s.',
          answer: 16,
          hint: 'Average acceleration is $\\Delta v / \\Delta t$, not $dv/dt$.',
          solution: [
            '$v(0) = 0$ and $v(2) = 4(8) = 32\\ \\text{m s}^{-1}$.',
            '$\\bar{a} = \\dfrac{\\Delta v}{\\Delta t} = \\dfrac{32 - 0}{2} = 16\\ \\text{m s}^{-2}$.',
            'The *instantaneous* acceleration at $t=2$ is $\\dfrac{dv}{dt} = 12t^2 = 48\\ \\text{m s}^{-2}$ \u2014 a different question.'
          ] },

        { id: 'ph-02-02-q6', tier: 'M', kind: 'mcq', parSec: 80, kcs: ['kc-ph2-graphs'],
          stem: 'On an $x$\u2013$t$ graph, a point where the curve reaches a maximum corresponds to:',
          options: [
            'maximum velocity',
            'zero velocity \u2014 the body is turning round',
            'maximum acceleration',
            'zero acceleration'
          ],
          answer: 1,
          hint: 'What is the slope at the top of a hill?',
          solution: [
            'At a maximum the tangent is horizontal, so the slope \u2014 and therefore the velocity \u2014 is zero.',
            'Physically the body has reached its furthest point and is about to reverse.',
            'The acceleration there is generally **not** zero; for a body thrown upward it is still $g$.'
          ] },

        { id: 'ph-02-02-q7', tier: 'H', kind: 'mcq', parSec: 120, kcs: ['kc-ph2-instvel', 'kc-ph2-accel'],
          stem: 'A particle moves with $x = 2 + 5t - 3t^2$ (SI). At $t = 2$ s its velocity and acceleration are:',
          options: [
            '$v = -7\\ \\text{m s}^{-1},\\ a = -6\\ \\text{m s}^{-2}$',
            '$v = 7\\ \\text{m s}^{-1},\\ a = 6\\ \\text{m s}^{-2}$',
            '$v = -7\\ \\text{m s}^{-1},\\ a = -12\\ \\text{m s}^{-2}$',
            '$v = -1\\ \\text{m s}^{-1},\\ a = -6\\ \\text{m s}^{-2}$'
          ],
          answer: 0,
          hint: 'Differentiate twice, then substitute.',
          solution: [
            '$v = \\dfrac{dx}{dt} = 5 - 6t$. At $t = 2$: $v = 5 - 12 = -7\\ \\text{m s}^{-1}$.',
            '$a = \\dfrac{dv}{dt} = -6\\ \\text{m s}^{-2}$, constant for all $t$.',
            'Both negative, so the particle is moving backwards and speeding up.'
          ] },

        { id: 'ph-02-02-q8', tier: 'H', kind: 'numeric', parSec: 130, tol: { abs: 0.2 }, kcs: ['kc-ph2-graphs'],
          stem: 'A body moves with constant velocity $10\\ \\text{m s}^{-1}$ for $4$ s, then decelerates uniformly to rest over the next $6$ s. Find the total distance travelled in metres.',
          answer: 70,
          hint: 'Split the v\u2013t graph into a rectangle and a triangle.',
          solution: [
            'Phase 1 is a rectangle on the $v$\u2013$t$ graph: area $= 10 \\times 4 = 40$ m.',
            'Phase 2 is a triangle: base 6 s, height $10\\ \\text{m s}^{-1}$, area $= \\tfrac{1}{2}(6)(10) = 30$ m.',
            'Total $= 40 + 30 = 70$ m.',
            'Both areas are above the axis, so here distance and displacement agree.'
          ] },

        { id: 'ph-02-02-q9', tier: 'H', kind: 'mcq', parSec: 120, kcs: ['kc-ph2-graphs'],
          stem: 'Which of the following $x$\u2013$t$ graphs is **physically impossible**?',
          options: [
            'A curve that is horizontal for a while, then rises',
            'A straight line with a large positive slope',
            'A curve that is vertical at one instant',
            'A curve with a maximum and then a decrease'
          ],
          answer: 2,
          hint: 'What velocity does a vertical segment imply?',
          solution: [
            'A vertical segment means the position changes while the time does not.',
            'That is an **infinite velocity**, which no body can have.',
            'A horizontal segment simply means the body is at rest; a maximum means it reverses; a steep straight line is merely fast.',
            'Equivalently: an $x$\u2013$t$ graph must be a function of $t$ \u2014 one position per instant.'
          ] }
      ]
    },

    /* ---------------------------------------------------------------
       3. Equations of motion
       --------------------------------------------------------------- */
    {
      id: 'ph-02-03',
      title: 'The Equations of Motion',
      short: 'Three equations, and how to pick one in five seconds',
      kcs: ['kc-ph2-suvat', 'kc-ph2-suvatpick', 'kc-ph2-nthsec'],
      prereq: ['ph-02-02'],
      estMin: 30,
      weight: 1.7,
      widget: 'suvatSolver',
      widgetTitle: 'SUVAT Console',
      widgetBrief: 'Feed in any three of the five quantities and the console shows which equation unlocks the rest \u2014 and why.',

      story: {
        speaker: 'VERA',
        avatar: '\ud83d\udcd0',
        lines: [
          'Module Three. The three equations every physics student can recite and half of them cannot choose between.',
          'There are five quantities: $u$, $v$, $a$, $t$ and $s$. Every problem gives you three and asks for a fourth. Each equation is simply the one that *omits* the quantity you neither have nor want.',
          'Stop hunting. Identify the missing one, and the equation selects itself.'
        ]
      },

      lesson: [
        { t: 'p', x: 'These hold **only for uniform acceleration** \u2014 constant $a$. If the acceleration changes, they are wrong, and you need calculus instead.' },

        { t: 'formula', name: 'First equation (no $s$)', tex: 'v = u + at', star: true },
        { t: 'formula', name: 'Second equation (no $v$)', tex: 's = ut + \\tfrac{1}{2}at^2', star: true },
        { t: 'formula', name: 'Third equation (no $t$)', tex: 'v^2 = u^2 + 2as', star: true },

        { t: 'anim', id: 'areaIsDisplacement' },

        { t: 'h', x: 'Choosing in five seconds' },
        { t: 'table',
          head: ['If the problem never mentions\u2026', 'Use'],
          rows: [
            ['displacement $s$', '$v = u + at$'],
            ['final velocity $v$', '$s = ut + \\frac{1}{2}at^2$'],
            ['time $t$', '$v^2 = u^2 + 2as$']
          ]
        },
        { t: 'callout', kind: 'jee', title: 'The method', x: 'Write down all five symbols. Tick the three you are given and circle the one you want. The fifth \u2014 untouched \u2014 names your equation.' },

        { t: 'h', x: 'A fourth, often forgotten' },
        { t: 'formula', name: 'Displacement from average velocity', tex: 's = \\left(\\frac{u+v}{2}\\right)t',
          note: 'Valid only for uniform acceleration, where the average velocity really is the mean of the endpoints.' },

        { t: 'h', x: 'Distance in the nth second' },
        { t: 'p', x: 'Not a new physics idea \u2014 just $s_n = s(n) - s(n-1)$, tidied up.' },
        { t: 'formula', name: 'Distance in the nth second', tex: 's_{n^{\\text{th}}} = u + \\frac{a}{2}(2n - 1)', star: true,
          note: 'Note the units: this is a distance, despite looking like a velocity. The "per second" is implicit.' },
        { t: 'callout', kind: 'tip', title: 'A pattern worth recognising', x: 'Starting from rest, the distances covered in successive seconds are in the ratio $1 : 3 : 5 : 7 : \\ldots$ \u2014 consecutive odd numbers. Spotting that ratio in a question is often the whole solution.' },

        { t: 'worked', title: 'Worked example \u2014 choosing without hunting', tier: 'M',
          q: 'A train decelerates uniformly from $20\\ \\text{m s}^{-1}$ and stops after travelling $200$ m. Find its acceleration.',
          steps: [
            'List: $u = 20$, $v = 0$, $s = 200$, $a = ?$, $t$ is neither given nor asked.',
            '$t$ is the untouched quantity, so use the equation without it: $v^2 = u^2 + 2as$.',
            '$0 = 400 + 2a(200)$',
            '$400a = -400$'
          ],
          ans: '$a = -1\\ \\text{m s}^{-2}$ \u2014 the minus sign says it opposes the motion.'
        },

        { t: 'sim' },

        { t: 'callout', kind: 'trap', title: 'Signs are not optional', x: 'Fix a positive direction **before** substituting, and keep it for the whole problem. Deceleration is not a separate case \u2014 it is an acceleration whose sign is opposite to the velocity. Writing $a = +1$ "because it is deceleration" is how a correct method produces a wrong answer.' }
      ],

      formulas: [
        { name: 'First', tex: 'v = u + at', star: true },
        { name: 'Second', tex: 's = ut + \\tfrac{1}{2}at^2', star: true },
        { name: 'Third', tex: 'v^2 = u^2 + 2as', star: true },
        { name: 'Average form', tex: 's = \\left(\\frac{u+v}{2}\\right)t' },
        { name: 'nth second', tex: 's_n = u + \\tfrac{a}{2}(2n-1)', star: true },
        { name: 'From rest, successive seconds', tex: '1 : 3 : 5 : 7 : \\ldots' }
      ],

      questions: [
        { id: 'ph-02-03-q1', tier: 'G', kind: 'numeric', parSec: 45, tol: { abs: 0.1 }, kcs: ['kc-ph2-suvat'],
          stem: 'A body starts at $u = 5\\ \\text{m s}^{-1}$ and accelerates at $2\\ \\text{m s}^{-2}$. Find its velocity in $\\text{m s}^{-1}$ after $3$ s.',
          answer: 11,
          hint: 'No displacement is mentioned.',
          solution: [
            '$s$ is neither given nor asked, so use $v = u + at$.',
            '$v = 5 + 2(3) = 11\\ \\text{m s}^{-1}$.'
          ] },

        { id: 'ph-02-03-q2', tier: 'G', kind: 'mcq', parSec: 40, kcs: ['kc-ph2-suvatpick'],
          stem: 'Which equation of motion does **not** contain time?',
          options: ['$v = u + at$', '$s = ut + \\frac{1}{2}at^2$', '$v^2 = u^2 + 2as$', '$s = \\left(\\frac{u+v}{2}\\right)t$'],
          answer: 2,
          hint: 'Scan each for a $t$.',
          solution: [
            '$v^2 = u^2 + 2as$ links $u$, $v$, $a$ and $s$ with no $t$ anywhere.',
            'Use it whenever time is neither given nor wanted \u2014 typically stopping-distance problems.'
          ] },

        { id: 'ph-02-03-q3', tier: 'G', kind: 'numeric', parSec: 50, tol: { abs: 0.1 }, kcs: ['kc-ph2-suvat'],
          stem: 'A body starts from rest with acceleration $4\\ \\text{m s}^{-2}$. How far does it travel in $3$ s (in metres)?',
          answer: 18,
          hint: 'Final velocity is not mentioned.',
          solution: [
            '$v$ is not involved, so use $s = ut + \\tfrac{1}{2}at^2$ with $u = 0$.',
            '$s = 0 + \\tfrac{1}{2}(4)(9) = 18$ m.'
          ] },

        { id: 'ph-02-03-q4', tier: 'M', kind: 'numeric', parSec: 75, tol: { abs: 0.1 }, kcs: ['kc-ph2-suvat', 'kc-ph2-suvatpick'],
          stem: 'A car travelling at $20\\ \\text{m s}^{-1}$ brakes uniformly and stops in $4$ s. How far does it travel while stopping (in metres)?',
          answer: 40,
          hint: 'You know $u$, $v$ and $t$ \u2014 the average-velocity form is quickest.',
          solution: [
            '$s = \\left(\\dfrac{u+v}{2}\\right)t = \\left(\\dfrac{20+0}{2}\\right)(4)$.',
            '$= 10 \\times 4 = 40$ m.',
            'Check with $a$: $a = \\dfrac{0-20}{4} = -5\\ \\text{m s}^{-2}$, and $s = 20(4) + \\tfrac{1}{2}(-5)(16) = 80 - 40 = 40$ m. \u2713'
          ] },

        { id: 'ph-02-03-q5', tier: 'M', kind: 'numeric', parSec: 80, tol: { abs: 0.1 }, kcs: ['kc-ph2-nthsec'],
          stem: 'A body starts from rest with $a = 2\\ \\text{m s}^{-2}$. Find the distance covered in the **3rd second** (in metres).',
          answer: 5,
          hint: 'Use $s_n = u + \\frac{a}{2}(2n-1)$, not $s = \\frac{1}{2}at^2$.',
          solution: [
            '$s_n = u + \\dfrac{a}{2}(2n-1)$ with $u = 0$, $a = 2$, $n = 3$.',
            '$= 0 + \\dfrac{2}{2}(6 - 1) = 5$ m.',
            'Check: $s(3) - s(2) = \\tfrac{1}{2}(2)(9) - \\tfrac{1}{2}(2)(4) = 9 - 4 = 5$ m. \u2713'
          ] },

        { id: 'ph-02-03-q6', tier: 'M', kind: 'numeric', parSec: 75, tol: { abs: 0.1 }, kcs: ['kc-ph2-suvat'],
          stem: 'A body accelerates from rest at $2\\ \\text{m s}^{-2}$ over $25$ m. Find its final velocity in $\\text{m s}^{-1}$.',
          answer: 10,
          hint: 'No time is given or asked.',
          solution: [
            'Use $v^2 = u^2 + 2as$ with $u=0$.',
            '$v^2 = 0 + 2(2)(25) = 100$.',
            '$v = 10\\ \\text{m s}^{-1}$.'
          ] },

        { id: 'ph-02-03-q7', tier: 'H', kind: 'mcq', parSec: 120, kcs: ['kc-ph2-nthsec'],
          stem: 'A body starting from rest moves with uniform acceleration. The ratio of the distances covered in the 1st, 2nd and 3rd seconds is:',
          options: ['$1:2:3$', '$1:3:5$', '$1:4:9$', '$1:1:1$'],
          answer: 1,
          hint: 'Use $s_n \\propto (2n-1)$ when $u=0$.',
          solution: [
            'With $u = 0$, $s_n = \\dfrac{a}{2}(2n-1)$, so $s_n \\propto (2n-1)$.',
            'For $n = 1, 2, 3$ that gives $1, 3, 5$.',
            'The ratio $1:4:9$ is for the *total* distance after 1, 2 and 3 seconds \u2014 a different question, and the usual trap.'
          ] },

        { id: 'ph-02-03-q8', tier: 'H', kind: 'numeric', parSec: 140, tol: { rel: 0.03 }, kcs: ['kc-ph2-suvat'],
          stem: 'A train decelerates uniformly from $20\\ \\text{m s}^{-1}$ and comes to rest after $200$ m. Find the magnitude of its deceleration in $\\text{m s}^{-2}$.',
          answer: 1,
          hint: 'Time is neither given nor asked.',
          solution: [
            'Use $v^2 = u^2 + 2as$: $0 = 20^2 + 2a(200)$.',
            '$400a = -400$, so $a = -1\\ \\text{m s}^{-2}$.',
            'The magnitude of the deceleration is $1\\ \\text{m s}^{-2}$.',
            'The sign is negative because the acceleration opposes the chosen positive direction of motion.'
          ] },

        { id: 'ph-02-03-q9', tier: 'H', kind: 'mcq', parSec: 150, kcs: ['kc-ph2-suvat', 'kc-ph2-suvatpick'],
          stem: 'A body moving with uniform acceleration covers $40$ m in the 4th second and $60$ m in the 6th second. Its acceleration is:',
          options: ['$5\\ \\text{m s}^{-2}$', '$10\\ \\text{m s}^{-2}$', '$20\\ \\text{m s}^{-2}$', '$2.5\\ \\text{m s}^{-2}$'],
          answer: 1,
          hint: 'Write $s_n$ for both and subtract.',
          solution: [
            '$s_4 = u + \\dfrac{a}{2}(7) = 40$ and $s_6 = u + \\dfrac{a}{2}(11) = 60$.',
            'Subtracting: $\\dfrac{a}{2}(11 - 7) = 20$, so $2a = 20$.',
            '$a = 10\\ \\text{m s}^{-2}$.',
            'Subtracting the two equations eliminates $u$ \u2014 the standard move when two nth-second distances are given.'
          ] }
      ]
    },

    /* ---------------------------------------------------------------
       4. Motion under gravity
       --------------------------------------------------------------- */
    {
      id: 'ph-02-04',
      title: 'Motion Under Gravity',
      short: 'The one acceleration you are handed for free',
      kcs: ['kc-ph2-freefall', 'kc-ph2-updown', 'kc-ph2-gsign'],
      prereq: ['ph-02-03'],
      estMin: 28,
      weight: 1.5,
      widget: 'dropTower',
      widgetTitle: 'Drop Tower',
      widgetBrief: 'Launch and drop bodies from a tower, set the sign convention yourself, and see what breaks when you get it wrong.',

      story: {
        speaker: 'VERA',
        avatar: '\ud83d\udcd0',
        lines: [
          'Module Four. A special case, treated as one because it happens so often.',
          'Near the surface, every body falls with the same acceleration $g$, regardless of mass. Galileo argued this before anyone could test it properly; the Apollo 15 commander settled it on the Moon with a hammer and a feather.',
          'The physics is identical to Module Three. What kills candidates here is not the equations. It is the **signs**.'
        ]
      },

      lesson: [
        { t: 'p', x: 'Vertical motion is just the equations of motion with $a = g \\approx 9.8\\ \\text{m s}^{-2}$ (use $10$ when the question says so). Air resistance is ignored throughout.' },

        { t: 'callout', kind: 'jee', title: 'Fix your sign convention first',
          x: 'Pick **one** positive direction and keep it for the whole problem.\n\nTaking **upward as positive**: $a = -g$ always, whether the body is going up, at the top, or coming down. Gravity does not change direction halfway.' },

        { t: 'h', x: 'Dropped from rest' },
        { t: 'formula', name: 'Falling from rest through height h', tex: 'v = \\sqrt{2gh}, \\qquad t = \\sqrt{\\frac{2h}{g}}', star: true },
        { t: 'callout', kind: 'tip', title: 'Note what is missing', x: 'Mass appears nowhere. A cannonball and a marble dropped together land together \u2014 the whole content of Galileo\u2019s argument, and a favourite one-mark question.' },

        { t: 'h', x: 'Thrown straight up' },
        { t: 'anim', id: 'freeFallSymmetry' },

        { t: 'formula', name: 'Maximum height', tex: 'H = \\frac{u^2}{2g}', star: true },
        { t: 'formula', name: 'Time to the top', tex: 't_{\\text{up}} = \\frac{u}{g}', star: true },
        { t: 'formula', name: 'Total time of flight', tex: 'T = \\frac{2u}{g}', star: true, note: 'Returning to the level it was launched from.' },

        { t: 'ul', items: [
          'Time up $=$ time down. The journey is symmetric.',
          'The speed at any height on the way down equals the speed at that height on the way up.',
          'It returns to the launch point with the **same speed** it left, reversed in direction.',
          'At the very top $v = 0$ but $a = g$ still \u2014 this is the most-tested sentence in the topic.'
        ] },

        { t: 'worked', title: 'Worked example \u2014 two bodies meeting', tier: 'H',
          q: 'A ball is dropped from a $80$ m tower. At the same instant another is thrown up from the ground at $40\\ \\text{m s}^{-1}$. When and where do they meet? ($g = 10\\ \\text{m s}^{-2}$)',
          steps: [
            'Both have the same acceleration, so in the frame of one of them the other has **no acceleration at all**.',
            'Their relative velocity of approach is therefore constant at $40\\ \\text{m s}^{-1}$.',
            'Time to meet $= \\dfrac{\\text{initial gap}}{\\text{relative speed}} = \\dfrac{80}{40} = 2$ s.',
            'Height of the meeting point, from the dropped ball: it has fallen $\\tfrac{1}{2}(10)(2^2) = 20$ m, so it is at $80 - 20 = 60$ m.',
            'Check with the thrown ball: $40(2) - \\tfrac{1}{2}(10)(4) = 80 - 20 = 60$ m. \u2713'
          ],
          ans: 'After $2$ s, at a height of $60$ m.'
        },

        { t: 'sim' },

        { t: 'callout', kind: 'trap', title: 'Three classic sign errors', x: '**1.** Changing $g$ to $+g$ once the body starts falling. It was always $-g$.\n**2.** Using $H = u^2/2g$ for a body thrown from a *height* \u2014 that formula gives the rise above the launch point, not above the ground.\n**3.** Forgetting that a body thrown down has $u$ negative too (with up positive).' }
      ],

      formulas: [
        { name: 'Free fall speed', tex: 'v = \\sqrt{2gh}', star: true },
        { name: 'Free fall time', tex: 't = \\sqrt{2h/g}', star: true },
        { name: 'Max height', tex: 'H = u^2/2g', star: true },
        { name: 'Time up', tex: 't_{up} = u/g' },
        { name: 'Time of flight', tex: 'T = 2u/g', star: true },
        { name: 'With up positive', tex: 'a = -g \\text{ throughout}' }
      ],

      questions: [
        { id: 'ph-02-04-q1', tier: 'G', kind: 'numeric', parSec: 50, tol: { abs: 0.1 }, kcs: ['kc-ph2-freefall'],
          stem: 'A stone is dropped from rest and falls $45$ m. How long does it take, in seconds? ($g = 10\\ \\text{m s}^{-2}$)',
          answer: 3,
          hint: '$h = \\frac{1}{2}gt^2$.',
          solution: [
            '$h = \\tfrac{1}{2}gt^2 \\Rightarrow 45 = \\tfrac{1}{2}(10)t^2 = 5t^2$.',
            '$t^2 = 9$, so $t = 3$ s.',
            'Its speed on landing would be $v = gt = 30\\ \\text{m s}^{-1}$.'
          ] },

        { id: 'ph-02-04-q2', tier: 'G', kind: 'mcq', parSec: 40, kcs: ['kc-ph2-freefall'],
          stem: 'Two stones of mass $1$ kg and $10$ kg are dropped together from the same height (ignore air resistance). They:',
          options: [
            'land together',
            'the heavier lands first',
            'the lighter lands first',
            'it depends on their shape'
          ],
          answer: 0,
          hint: 'Does $g$ depend on mass?',
          solution: [
            'Free-fall acceleration is $g$ for every body, independent of mass.',
            'Since both start from rest and fall the same height with the same acceleration, they take the same time.',
            'Shape matters only through **air resistance**, which the question excludes.'
          ] },

        { id: 'ph-02-04-q3', tier: 'G', kind: 'mcq', parSec: 45, kcs: ['kc-ph2-gsign'],
          stem: 'A ball is thrown vertically upward. At the highest point of its path:',
          options: [
            'both velocity and acceleration are zero',
            'velocity is zero, acceleration is $g$ downward',
            'velocity is $g$, acceleration is zero',
            'acceleration reverses direction'
          ],
          answer: 1,
          hint: 'Does gravity ever switch off?',
          solution: [
            'The velocity passes through zero as the motion reverses \u2014 that is what "highest point" means.',
            'But gravity acts continuously: the acceleration is $g$ downward at every instant, including that one.',
            'If the acceleration were zero there, the ball would stay up there forever.'
          ] },

        { id: 'ph-02-04-q4', tier: 'M', kind: 'numeric', parSec: 70, tol: { abs: 0.1 }, kcs: ['kc-ph2-updown'],
          stem: 'A ball is thrown up at $20\\ \\text{m s}^{-1}$. Find the maximum height reached, in metres. ($g = 10\\ \\text{m s}^{-2}$)',
          answer: 20,
          hint: 'At the top, $v=0$.',
          solution: [
            'Use $v^2 = u^2 - 2gH$ with $v = 0$.',
            '$0 = 400 - 2(10)H$',
            '$H = \\dfrac{400}{20} = 20$ m.',
            'Equivalently $H = u^2/2g$.'
          ] },

        { id: 'ph-02-04-q5', tier: 'M', kind: 'numeric', parSec: 65, tol: { abs: 0.1 }, kcs: ['kc-ph2-updown'],
          stem: 'For the same ball thrown up at $20\\ \\text{m s}^{-1}$, find the total time of flight in seconds before it returns to the thrower.',
          answer: 4,
          hint: 'Time up equals time down.',
          solution: [
            'Time to the top: $t_{up} = \\dfrac{u}{g} = \\dfrac{20}{10} = 2$ s.',
            'By symmetry the descent takes the same 2 s.',
            'Total $T = \\dfrac{2u}{g} = 4$ s.'
          ] },

        { id: 'ph-02-04-q6', tier: 'M', kind: 'mcq', parSec: 80, kcs: ['kc-ph2-updown'],
          stem: 'A ball thrown up at speed $u$ returns to the thrower\u2019s hand. Its speed on return is:',
          options: ['$u$', '$u/2$', '$2u$', 'zero'],
          answer: 0,
          hint: 'Apply $v^2 = u^2 + 2as$ over the whole flight.',
          solution: [
            'Over the complete flight the displacement is zero.',
            '$v^2 = u^2 + 2(-g)(0) = u^2$, so $|v| = u$.',
            'The speed is unchanged; only the **direction** has reversed.',
            'This is energy conservation showing up in kinematics, with no air resistance to spoil it.'
          ] },

        { id: 'ph-02-04-q7', tier: 'H', kind: 'numeric', parSec: 140, tol: { abs: 0.2 }, kcs: ['kc-ph2-freefall', 'kc-ph2-updown'],
          stem: 'A ball is dropped from an $80$ m tower. Simultaneously another is thrown up from the ground at $40\\ \\text{m s}^{-1}$. At what height above the ground do they meet, in metres? ($g = 10\\ \\text{m s}^{-2}$)',
          answer: 60,
          hint: 'Both have the same acceleration \u2014 so their relative acceleration is zero.',
          solution: [
            'Relative to the dropped ball, the thrown ball has zero acceleration and approaches at a constant $40\\ \\text{m s}^{-1}$.',
            'Time to close the 80 m gap: $t = \\dfrac{80}{40} = 2$ s.',
            'The dropped ball has fallen $\\tfrac{1}{2}(10)(2)^2 = 20$ m, so it is at $80 - 20 = 60$ m.',
            'Check with the thrown ball: $40(2) - \\tfrac{1}{2}(10)(2)^2 = 80 - 20 = 60$ m. \u2713'
          ] },

        { id: 'ph-02-04-q8', tier: 'H', kind: 'mcq', parSec: 130, kcs: ['kc-ph2-updown'],
          stem: 'A body thrown up reaches a maximum height $H$. The time taken to reach a height $H/2$ on the way up, as a fraction of the time to reach the top, is:',
          options: [
            '$\\dfrac{1}{2}$',
            '$1 - \\dfrac{1}{\\sqrt{2}}$',
            '$\\dfrac{1}{\\sqrt{2}}$',
            '$\\dfrac{1}{4}$'
          ],
          answer: 1,
          hint: 'Work backwards from the top, where the motion is a free fall from rest.',
          solution: [
            'Run the upward journey backwards: it is a drop from rest through $H$, taking $t_{up}$.',
            'Falling from the top through $H/2$ takes $t\' $ where $\\dfrac{H}{2} = \\tfrac{1}{2}g t\'^2$ and $H = \\tfrac{1}{2}g\\,t_{up}^2$.',
            'Dividing: $\\dfrac{t\'^2}{t_{up}^2} = \\dfrac{1}{2}$, so $t\' = \\dfrac{t_{up}}{\\sqrt{2}}$.',
            'Going up, reaching $H/2$ happens at $t_{up} - t\' = t_{up}\\left(1 - \\dfrac{1}{\\sqrt{2}}\\right) \\approx 0.29\\,t_{up}$.',
            'So it covers the first half of the height in under a third of the time \u2014 it is still fast down there.'
          ] },

        { id: 'ph-02-04-q9', tier: 'H', kind: 'numeric', parSec: 150, tol: { rel: 0.03 }, kcs: ['kc-ph2-freefall', 'kc-ph2-gsign'],
          stem: 'A stone is thrown **downward** at $10\\ \\text{m s}^{-1}$ from a height of $60$ m. Find the time in seconds before it hits the ground. ($g = 10\\ \\text{m s}^{-2}$)',
          answer: 2.61,
          hint: 'Take downward as positive to keep every sign positive.',
          solution: [
            'Taking downward as positive: $u = +10$, $a = +10$, $s = +60$.',
            '$60 = 10t + 5t^2$, so $5t^2 + 10t - 60 = 0$, i.e. $t^2 + 2t - 12 = 0$.',
            '$t = \\dfrac{-2 + \\sqrt{4 + 48}}{2} = \\dfrac{-2 + \\sqrt{52}}{2}$.',
            '$= \\dfrac{-2 + 7.211}{2} = 2.61$ s.',
            'Reject the negative root \u2014 it corresponds to a time before the throw.'
          ] }
      ]
    },

    /* ---------------------------------------------------------------
       5. Relative velocity
       --------------------------------------------------------------- */
    {
      id: 'ph-02-05',
      title: 'Relative Velocity',
      short: 'Motion seen from something that is itself moving',
      kcs: ['kc-ph2-relvel', 'kc-ph2-relvec', 'kc-ph2-river'],
      prereq: ['ph-02-02'],
      estMin: 28,
      weight: 1.5,
      widget: 'relativeLab',
      widgetTitle: 'Frame Switcher',
      widgetBrief: 'Watch the same two bodies from the ground, then from inside one of them, and see the velocities change.',

      story: {
        speaker: 'VERA',
        avatar: '\ud83d\udcd0',
        lines: [
          'Module Five. The module that repairs the navigation core.',
          'The station is not drifting. The *debris field* is drifting. Or both are, and the only meaningful statement is how one moves relative to the other.',
          'There is exactly one formula here and it is a subtraction. Nearly every mark lost on this topic is lost to a sign, or to subtracting in the wrong order.'
        ]
      },

      lesson: [
        { t: 'formula', name: 'Velocity of A relative to B', tex: '\\vec{v}_{AB} = \\vec{v}_A - \\vec{v}_B', star: true,
          note: 'Read the subscripts left to right: "A relative to B" means A minus B.' },

        { t: 'h', x: 'In one dimension' },
        { t: 'ul', items: [
          'Same direction: the relative speed is the **difference**. Two cars at 60 and 40 approach each other at 20.',
          'Opposite directions: the relative speed is the **sum**. The same cars head-on close at 100.',
          'Note $\\vec{v}_{AB} = -\\vec{v}_{BA}$ \u2014 the magnitudes agree, the directions oppose.'
        ] },
        { t: 'callout', kind: 'tip', title: 'Where the free-fall trick comes from', x: 'Two bodies both accelerating at $g$ have **zero relative acceleration**. That is why the "ball dropped, ball thrown up" problem collapses to constant-speed approach and one division.' },

        { t: 'h', x: 'In two dimensions' },
        { t: 'anim', id: 'relativeVelocity' },

        { t: 'h', x: 'River crossing' },
        { t: 'p', x: 'A boat with speed $v_b$ relative to the water, on a river flowing at $v_r$, across a width $d$. Two different questions get confused constantly.' },
        { t: 'table',
          head: ['Goal', 'Aim the boat', 'Result'],
          rows: [
            ['**Shortest time**', 'straight across', '$t = \\dfrac{d}{v_b}$, and it drifts $\\dfrac{v_r d}{v_b}$ downstream'],
            ['**Shortest path** (land straight opposite)', 'upstream at $\\sin\\theta = \\dfrac{v_r}{v_b}$', '$t = \\dfrac{d}{\\sqrt{v_b^2 - v_r^2}}$, no drift']
          ]
        },
        { t: 'callout', kind: 'jee', title: 'Two results worth remembering',
          x: 'Minimum crossing **time** is always $d/v_b$ \u2014 the river\u2019s speed cannot change it, because the current has no across-component.\n\nLanding straight opposite is **impossible** if $v_r > v_b$: you cannot cancel a current you are slower than.' },

        { t: 'worked', title: 'Worked example \u2014 the rain problem', tier: 'H',
          q: 'Rain falls vertically at $4\\ \\text{m s}^{-1}$. A man walks horizontally at $3\\ \\text{m s}^{-1}$. At what angle to the vertical should he tilt his umbrella?',
          steps: [
            'He must tilt along the velocity of the rain **relative to him**: $\\vec{v}_{rm} = \\vec{v}_r - \\vec{v}_m$.',
            'Taking $\\hat{x}$ along his motion and $\\hat{y}$ up: $\\vec{v}_r = -4\\hat{y}$ and $\\vec{v}_m = 3\\hat{x}$.',
            '$\\vec{v}_{rm} = -3\\hat{x} - 4\\hat{y}$ \u2014 the rain appears to come from in front of him, slanting down.',
            '$\\tan\\theta = \\dfrac{\\text{horizontal}}{\\text{vertical}} = \\dfrac{3}{4}$.',
            'Its apparent speed is $\\sqrt{3^2+4^2} = 5\\ \\text{m s}^{-1}$ \u2014 faster than it really falls.'
          ],
          ans: '$\\theta = \\tan^{-1}(3/4) \\approx 37\\degree$ from the vertical, tilted **forward**.'
        },

        { t: 'sim' },

        { t: 'callout', kind: 'trap', title: 'Tilt forward, not back', x: 'Intuition says lean the umbrella back against the rain. It is wrong: you are walking *into* the rain\u2019s relative motion, so the umbrella tilts forward. Trust the vector subtraction over the instinct.' }
      ],

      formulas: [
        { name: 'Relative velocity', tex: '\\vec{v}_{AB} = \\vec{v}_A - \\vec{v}_B', star: true },
        { name: 'Antisymmetry', tex: '\\vec{v}_{AB} = -\\vec{v}_{BA}' },
        { name: 'Crossing time (straight across)', tex: 't = d/v_b', star: true },
        { name: 'Drift', tex: 'x = v_r d / v_b' },
        { name: 'Shortest path angle', tex: '\\sin\\theta = v_r/v_b', star: true },
        { name: 'Shortest path time', tex: 't = d/\\sqrt{v_b^2 - v_r^2}' }
      ],

      questions: [
        { id: 'ph-02-05-q1', tier: 'G', kind: 'numeric', parSec: 45, tol: { abs: 0.1 }, kcs: ['kc-ph2-relvel'],
          stem: 'Two cars travel in the **same** direction at $60$ and $40\\ \\text{km h}^{-1}$. Find their relative speed in $\\text{km h}^{-1}$.',
          answer: 20,
          hint: 'Same direction means subtract.',
          solution: [
            '$v_{AB} = v_A - v_B = 60 - 40 = 20\\ \\text{km h}^{-1}$.',
            'The faster car gains on the slower at 20 km per hour.'
          ] },

        { id: 'ph-02-05-q2', tier: 'G', kind: 'numeric', parSec: 45, tol: { abs: 0.1 }, kcs: ['kc-ph2-relvel'],
          stem: 'The same two cars now travel **towards each other** at $60$ and $40\\ \\text{km h}^{-1}$. Find the speed at which they approach, in $\\text{km h}^{-1}$.',
          answer: 100,
          hint: 'Opposite directions mean one velocity is negative.',
          solution: [
            'Take one direction as positive: $v_A = +60$, $v_B = -40$.',
            '$v_{AB} = 60 - (-40) = 100\\ \\text{km h}^{-1}$.',
            'The subtraction formula handles both cases \u2014 you never need a separate rule for "opposite".'
          ] },

        { id: 'ph-02-05-q3', tier: 'G', kind: 'mcq', parSec: 50, kcs: ['kc-ph2-river'],
          stem: 'A boat crosses a river by pointing straight across. The time taken depends on:',
          options: [
            'the river speed only',
            'the boat speed and the river width only',
            'all three: boat speed, river speed and width',
            'the river speed and the width only'
          ],
          answer: 1,
          hint: 'Does the current have any component across the river?',
          solution: [
            'The current flows **along** the river, so it has no component across it.',
            'Only the boat\u2019s own velocity moves it across: $t = \\dfrac{d}{v_b}$.',
            'The current affects **where** the boat lands, never how long it takes.'
          ] },

        { id: 'ph-02-05-q4', tier: 'M', kind: 'numeric', parSec: 75, tol: { abs: 0.5 }, kcs: ['kc-ph2-river'],
          stem: 'A river is $60$ m wide and flows at $3\\ \\text{m s}^{-1}$. A boat with speed $4\\ \\text{m s}^{-1}$ in still water heads straight across. Find its drift downstream, in metres.',
          answer: 45,
          hint: 'Find the crossing time first.',
          solution: [
            'Crossing time $t = \\dfrac{d}{v_b} = \\dfrac{60}{4} = 15$ s.',
            'During that time the current carries the boat downstream at $3\\ \\text{m s}^{-1}$.',
            'Drift $= v_r t = 3 \\times 15 = 45$ m.'
          ] },

        { id: 'ph-02-05-q5', tier: 'M', kind: 'numeric', parSec: 70, tol: { abs: 0.1 }, kcs: ['kc-ph2-relvec'],
          stem: 'For the same boat ($v_b = 4$, $v_r = 3$, both $\\text{m s}^{-1}$) heading straight across, find its resultant speed relative to the ground, in $\\text{m s}^{-1}$.',
          answer: 5,
          hint: 'The two velocities are perpendicular.',
          solution: [
            'The boat\u2019s velocity is across; the current\u2019s is along. They are perpendicular.',
            'Resultant $= \\sqrt{4^2 + 3^2} = \\sqrt{25} = 5\\ \\text{m s}^{-1}$.',
            'It travels faster over the ground than through the water \u2014 but not in the direction it is pointing.'
          ] },

        { id: 'ph-02-05-q6', tier: 'M', kind: 'mcq', parSec: 80, kcs: ['kc-ph2-river'],
          stem: 'A boat can do $3\\ \\text{m s}^{-1}$ in still water. The river flows at $5\\ \\text{m s}^{-1}$. The boat:',
          options: [
            'can land straight opposite by aiming upstream',
            'cannot land straight opposite at all',
            'can land straight opposite only by aiming downstream',
            'will always drift exactly 5 m'
          ],
          answer: 1,
          hint: 'What would $\\sin\\theta = v_r/v_b$ have to be?',
          solution: [
            'To cancel the drift the boat needs an upstream component equal to $v_r$, i.e. $\\sin\\theta = \\dfrac{v_r}{v_b} = \\dfrac{5}{3}$.',
            'But $\\sin\\theta \\leq 1$, so no such angle exists.',
            'Whenever $v_r > v_b$ the boat **must** be carried downstream. It can only choose how far.'
          ] },

        { id: 'ph-02-05-q7', tier: 'H', kind: 'numeric', parSec: 130, tol: { rel: 0.03 }, kcs: ['kc-ph2-relvec'],
          stem: 'Rain falls vertically at $4\\ \\text{m s}^{-1}$. A man runs horizontally at $3\\ \\text{m s}^{-1}$. Find the speed of the rain **relative to the man**, in $\\text{m s}^{-1}$.',
          answer: 5,
          hint: 'Subtract the vectors; they are perpendicular.',
          solution: [
            '$\\vec{v}_{rm} = \\vec{v}_r - \\vec{v}_m$.',
            'Taking $\\hat{x}$ along his run and $\\hat{y}$ up: $\\vec{v}_{rm} = (0 - 3)\\hat{x} + (-4 - 0)\\hat{y} = -3\\hat{x} - 4\\hat{y}$.',
            'Magnitude $= \\sqrt{9 + 16} = 5\\ \\text{m s}^{-1}$.',
            'The rain appears both faster and slanted \u2014 which is why running through rain feels worse than standing in it.'
          ] },

        { id: 'ph-02-05-q8', tier: 'H', kind: 'mcq', parSec: 130, kcs: ['kc-ph2-relvec'],
          stem: 'In the same situation (rain $4\\ \\text{m s}^{-1}$ vertical, man $3\\ \\text{m s}^{-1}$ horizontal), the man should hold his umbrella at an angle to the vertical of:',
          options: [
            '$\\tan^{-1}(3/4)$, tilted forward',
            '$\\tan^{-1}(4/3)$, tilted forward',
            '$\\tan^{-1}(3/4)$, tilted backward',
            'vertically \u2014 no tilt needed'
          ],
          answer: 0,
          hint: 'The umbrella points along the relative velocity, and the horizontal component is 3.',
          solution: [
            'The relative velocity has horizontal component $3$ and vertical component $4$.',
            'The angle from the **vertical** is $\\tan^{-1}\\left(\\dfrac{\\text{horizontal}}{\\text{vertical}}\\right) = \\tan^{-1}(3/4) \\approx 37\\degree$.',
            'It tilts **forward**, into his direction of motion, because the rain appears to come from in front.',
            'Choosing $\\tan^{-1}(4/3)$ measures the angle from the horizontal instead \u2014 read which reference the question wants.'
          ] },

        { id: 'ph-02-05-q9', tier: 'H', kind: 'numeric', parSec: 150, tol: { rel: 0.03 }, kcs: ['kc-ph2-river'],
          stem: 'A $100$ m wide river flows at $3\\ \\text{m s}^{-1}$; a boat does $5\\ \\text{m s}^{-1}$ in still water. If the boat must land **straight opposite**, find the crossing time in seconds.',
          answer: 25,
          hint: 'Only the across-component of the boat\u2019s velocity now moves it forward.',
          solution: [
            'The boat must aim upstream so its upstream component cancels the current.',
            'The across-component left over is $\\sqrt{v_b^2 - v_r^2} = \\sqrt{25 - 9} = 4\\ \\text{m s}^{-1}$.',
            '$t = \\dfrac{d}{4} = \\dfrac{100}{4} = 25$ s.',
            'Compare: pointing straight across would take only $100/5 = 20$ s, but would land 60 m downstream. Shortest path and shortest time are different journeys.'
          ] }
      ]
    },

    /* ---------------------------------------------------------------
       6. Projectile motion
       --------------------------------------------------------------- */
    {
      id: 'ph-02-06',
      title: 'Projectile Motion',
      short: 'Two independent motions wearing one trajectory',
      kcs: ['kc-ph2-projcomp', 'kc-ph2-projtime', 'kc-ph2-projrange', 'kc-ph2-projpath'],
      prereq: ['ph-02-04'],
      estMin: 32,
      weight: 1.8,
      widget: 'projectileRange',
      widgetTitle: 'Launch Range',
      widgetBrief: 'Set the angle and speed, hit targets, and discover the complementary-angle pairs for yourself.',

      story: {
        speaker: 'VERA',
        avatar: '\ud83d\udcd0',
        lines: [
          'Final module. And the single most useful idea in elementary mechanics.',
          'A projectile looks like it is doing something complicated. It is not. It is doing two very simple things at once, and they are **completely independent of each other**.',
          'Horizontally: constant velocity, no acceleration at all. Vertically: exactly the free fall of Module Four. Resolve, solve each separately, recombine. That is the entire method.'
        ]
      },

      lesson: [
        { t: 'h', x: 'The decomposition' },
        { t: 'p', x: 'Launch at speed $u$ at angle $\\theta$ to the horizontal. Resolve once, at the start, and never think about the combined motion again.' },
        { t: 'table',
          head: ['', 'Horizontal', 'Vertical'],
          rows: [
            ['Initial velocity', '$u\\cos\\theta$', '$u\\sin\\theta$'],
            ['Acceleration', '$0$', '$-g$'],
            ['Velocity at time $t$', '$u\\cos\\theta$ (unchanged)', '$u\\sin\\theta - gt$'],
            ['Displacement', '$x = u\\cos\\theta\\,t$', '$y = u\\sin\\theta\\,t - \\tfrac{1}{2}gt^2$']
          ]
        },

        { t: 'anim', id: 'projectileIndependence' },

        { t: 'h', x: 'The three results' },
        { t: 'formula', name: 'Time of flight', tex: 'T = \\frac{2u\\sin\\theta}{g}', star: true, note: 'Set $y = 0$ and solve; it is the vertical motion alone.' },
        { t: 'formula', name: 'Maximum height', tex: 'H = \\frac{u^2\\sin^2\\theta}{2g}', star: true },
        { t: 'formula', name: 'Range', tex: 'R = \\frac{u^2\\sin 2\\theta}{g}', star: true, note: '$R = u\\cos\\theta \\times T$ \u2014 horizontal speed times time of flight.' },

        { t: 'callout', kind: 'jee', title: 'Two consequences worth memorising',
          x: '**Maximum range at $\\theta = 45\\degree$**, where $\\sin 2\\theta = 1$, giving $R_{\\max} = u^2/g$.\n\n**Complementary angles give the same range**: $\\theta$ and $(90\\degree - \\theta)$, because $\\sin 2\\theta = \\sin(180\\degree - 2\\theta)$. A $30\\degree$ and a $60\\degree$ shot land in the same place \u2014 by different routes and different flight times.' },

        { t: 'formula', name: 'Height-to-range ratio', tex: '\\frac{H}{R} = \\frac{\\tan\\theta}{4}',
          note: 'A quick way to recover the angle when a question gives you both.' },

        { t: 'h', x: 'The path is a parabola' },
        { t: 'p', x: 'Eliminate $t$ between the two displacement equations and the shape appears.' },
        { t: 'formula', name: 'Equation of trajectory', tex: 'y = x\\tan\\theta - \\frac{g x^2}{2u^2\\cos^2\\theta}',
          note: 'Of the form $y = ax - bx^2$ \u2014 a downward parabola through the origin.' },

        { t: 'worked', title: 'Worked example \u2014 a standard launch', tier: 'M',
          q: 'A body is projected at $20\\ \\text{m s}^{-1}$ at $30\\degree$ to the horizontal. Find its time of flight, maximum height and range. ($g = 10\\ \\text{m s}^{-2}$)',
          steps: [
            'Components: $u_x = 20\\cos 30\\degree = 17.32$, $u_y = 20\\sin 30\\degree = 10\\ \\text{m s}^{-1}$.',
            'Time of flight: $T = \\dfrac{2u_y}{g} = \\dfrac{20}{10} = 2$ s.',
            'Maximum height: $H = \\dfrac{u_y^2}{2g} = \\dfrac{100}{20} = 5$ m.',
            'Range: $R = u_x T = 17.32 \\times 2 = 34.6$ m.',
            'Check with the formula: $R = \\dfrac{u^2\\sin 60\\degree}{g} = \\dfrac{400(0.866)}{10} = 34.6$ m. \u2713'
          ],
          ans: '$T = 2$ s, $H = 5$ m, $R = 34.6$ m.'
        },

        { t: 'sim' },

        { t: 'callout', kind: 'trap', title: 'The velocity is never zero', x: 'At the highest point the **vertical** velocity is zero, but the horizontal component $u\\cos\\theta$ is untouched. The speed there is $u\\cos\\theta$, not zero. A projectile launched at an angle never stops, even for an instant.' }
      ],

      formulas: [
        { name: 'Components', tex: 'u_x = u\\cos\\theta,\\quad u_y = u\\sin\\theta', star: true },
        { name: 'Time of flight', tex: 'T = 2u\\sin\\theta/g', star: true },
        { name: 'Max height', tex: 'H = u^2\\sin^2\\theta/2g', star: true },
        { name: 'Range', tex: 'R = u^2\\sin 2\\theta/g', star: true },
        { name: 'Max range', tex: 'R_{max} = u^2/g \\text{ at } 45\\degree' },
        { name: 'Trajectory', tex: 'y = x\\tan\\theta - \\frac{gx^2}{2u^2\\cos^2\\theta}' },
        { name: 'H over R', tex: 'H/R = \\tan\\theta/4' }
      ],

      questions: [
        { id: 'ph-02-06-q1', tier: 'G', kind: 'mcq', parSec: 40, kcs: ['kc-ph2-projcomp'],
          stem: 'At the highest point of a projectile\u2019s path, its velocity is:',
          options: [
            'zero',
            '$u\\cos\\theta$, horizontal',
            '$u\\sin\\theta$, vertical',
            '$u$, at angle $\\theta$'
          ],
          answer: 1,
          hint: 'Which component is affected by gravity?',
          solution: [
            'Gravity acts vertically, so it only changes the vertical component, which reaches zero at the top.',
            'The horizontal component $u\\cos\\theta$ is **never** changed \u2014 there is no horizontal force.',
            'So the speed at the top is $u\\cos\\theta$, directed horizontally.'
          ] },

        { id: 'ph-02-06-q2', tier: 'G', kind: 'mcq', parSec: 40, kcs: ['kc-ph2-projrange'],
          stem: 'For a given launch speed, the range of a projectile is maximum at a launch angle of:',
          options: ['$30\\degree$', '$45\\degree$', '$60\\degree$', '$90\\degree$'],
          answer: 1,
          hint: 'Maximise $\\sin 2\\theta$.',
          solution: [
            '$R = \\dfrac{u^2\\sin 2\\theta}{g}$ is largest when $\\sin 2\\theta = 1$.',
            'That needs $2\\theta = 90\\degree$, so $\\theta = 45\\degree$.',
            'Then $R_{\\max} = \\dfrac{u^2}{g}$. At $90\\degree$ the range is zero \u2014 it comes straight back down.'
          ] },

        { id: 'ph-02-06-q3', tier: 'G', kind: 'numeric', parSec: 55, tol: { abs: 0.05 }, kcs: ['kc-ph2-projtime'],
          stem: 'A body is projected at $20\\ \\text{m s}^{-1}$ at $30\\degree$. Find its time of flight in seconds. ($g = 10\\ \\text{m s}^{-2}$)',
          answer: 2,
          hint: 'Only the vertical component matters.',
          solution: [
            '$u_y = 20\\sin 30\\degree = 10\\ \\text{m s}^{-1}$.',
            '$T = \\dfrac{2u_y}{g} = \\dfrac{20}{10} = 2$ s.'
          ] },

        { id: 'ph-02-06-q4', tier: 'M', kind: 'numeric', parSec: 75, tol: { rel: 0.02 }, kcs: ['kc-ph2-projrange'],
          stem: 'For the same launch ($20\\ \\text{m s}^{-1}$ at $30\\degree$, $g = 10$), find the range in metres.',
          answer: 34.64,
          hint: '$R = u_x \\times T$.',
          solution: [
            '$u_x = 20\\cos 30\\degree = 17.32\\ \\text{m s}^{-1}$.',
            '$R = u_x T = 17.32 \\times 2 = 34.64$ m.',
            'Or directly: $R = \\dfrac{u^2\\sin 60\\degree}{g} = \\dfrac{400 \\times 0.866}{10} = 34.64$ m.'
          ] },

        { id: 'ph-02-06-q5', tier: 'M', kind: 'numeric', parSec: 70, tol: { abs: 0.1 }, kcs: ['kc-ph2-projtime'],
          stem: 'Same launch again ($20\\ \\text{m s}^{-1}$ at $30\\degree$, $g = 10$). Find the maximum height in metres.',
          answer: 5,
          hint: 'Use the vertical component alone.',
          solution: [
            '$u_y = 10\\ \\text{m s}^{-1}$.',
            '$H = \\dfrac{u_y^2}{2g} = \\dfrac{100}{20} = 5$ m.',
            'Sanity check with $H/R = \\tan\\theta/4 = 0.577/4 = 0.144$, and $5/34.64 = 0.144$. \u2713'
          ] },

        { id: 'ph-02-06-q6', tier: 'M', kind: 'mcq', parSec: 80, kcs: ['kc-ph2-projrange'],
          stem: 'Two projectiles are launched with the same speed at $30\\degree$ and $60\\degree$. Compared with each other they have:',
          options: [
            'the same range and the same time of flight',
            'the same range but different times of flight',
            'different ranges and the same time of flight',
            'different ranges and different times of flight'
          ],
          answer: 1,
          hint: 'The angles are complementary. What does that do to $\\sin 2\\theta$?',
          solution: [
            '$\\sin(2 \\times 30\\degree) = \\sin 60\\degree$ and $\\sin(2 \\times 60\\degree) = \\sin 120\\degree = \\sin 60\\degree$ \u2014 equal, so the **ranges are equal**.',
            'But $T \\propto \\sin\\theta$, and $\\sin 60\\degree \\neq \\sin 30\\degree$.',
            'The $60\\degree$ shot stays in the air $\\sqrt{3}$ times longer and climbs three times higher, yet lands in exactly the same place.'
          ] },

        { id: 'ph-02-06-q7', tier: 'H', kind: 'mcq', parSec: 130, kcs: ['kc-ph2-projrange', 'kc-ph2-projtime'],
          stem: 'A projectile has maximum height $H$ and range $R$. Its launch angle satisfies:',
          options: [
            '$\\tan\\theta = \\dfrac{4H}{R}$',
            '$\\tan\\theta = \\dfrac{H}{R}$',
            '$\\tan\\theta = \\dfrac{2H}{R}$',
            '$\\tan\\theta = \\dfrac{R}{4H}$'
          ],
          answer: 0,
          hint: 'Divide $H$ by $R$ and simplify with the double-angle identity.',
          solution: [
            '$\\dfrac{H}{R} = \\dfrac{u^2\\sin^2\\theta/2g}{u^2\\sin 2\\theta/g} = \\dfrac{\\sin^2\\theta}{2\\sin 2\\theta}$.',
            'Using $\\sin 2\\theta = 2\\sin\\theta\\cos\\theta$: $=\\dfrac{\\sin^2\\theta}{4\\sin\\theta\\cos\\theta} = \\dfrac{\\tan\\theta}{4}$.',
            'So $\\tan\\theta = \\dfrac{4H}{R}$.',
            'Useful in reverse: a shot with $R = 4H$ was launched at exactly $45\\degree$.'
          ] },

        { id: 'ph-02-06-q8', tier: 'H', kind: 'numeric', parSec: 140, tol: { rel: 0.03 }, kcs: ['kc-ph2-projcomp'],
          stem: 'A ball is thrown horizontally at $15\\ \\text{m s}^{-1}$ from a cliff $45$ m high. Find its horizontal distance from the base when it lands, in metres. ($g = 10\\ \\text{m s}^{-2}$)',
          answer: 45,
          hint: 'The vertical motion is a free fall from rest \u2014 the horizontal throw does not delay it.',
          solution: [
            'Vertically: $u_y = 0$, so $45 = \\tfrac{1}{2}(10)t^2$, giving $t = 3$ s.',
            'Horizontally there is no acceleration, so $x = u_x t = 15 \\times 3$.',
            '$= 45$ m.',
            'A ball simply dropped off the same cliff would land after the same 3 s \u2014 the two motions are independent.'
          ] },

        { id: 'ph-02-06-q9', tier: 'H', kind: 'mcq', parSec: 150, kcs: ['kc-ph2-projpath'],
          stem: 'A projectile\u2019s path is $y = 8x - 4x^2$ (metres). Taking $g = 10\\ \\text{m s}^{-2}$, its range is:',
          options: ['$2$ m', '$4$ m', '$8$ m', '$16$ m'],
          answer: 0,
          hint: 'The range is where the projectile returns to $y = 0$.',
          solution: [
            'Set $y = 0$: $8x - 4x^2 = 0$, so $4x(2 - x) = 0$.',
            'The roots are $x = 0$ (the launch) and $x = 2$ m (the landing).',
            'Range $= 2$ m.',
            'The launch angle also falls out: comparing with $y = x\\tan\\theta - \\ldots$ gives $\\tan\\theta = 8$.'
          ] }
      ]
    }
  ],

  /* ================================================================ */
  boss: {
    id: 'ph-02-boss',
    name: 'The Drift',
    title: 'Corrupted Navigation Core',
    avatar: '\ud83e\udded',
    hp: 10,
    lives: 3,
    timePerQ: 105,
    intro: 'The navigation display fills with every position the station has ever occupied, all at once, none of them labelled. Something in the noise speaks: "YOU HAVE TRAVELLED FAR. YOU HAVE ARRIVED NOWHERE."',
    defeat: 'The ghost positions collapse into a single bright point, and a velocity vector unfolds from it \u2014 one number, one direction, correct. VERA sounds almost pleased. "Navigation restored, Cadet. We are, at last, somewhere."',
    taunts: [
      'Distance or displacement? Choose carefully.',
      'Which sign did you give gravity on the way down?',
      'Half the distance is not half the time.',
      'Did you resolve, or did you guess?'
    ],
    extraQuestions: [
      { id: 'ph-02-boss-q1', tier: 'H', kind: 'mcq', parSec: 130, kcs: ['kc-ph2-graphs', 'kc-ph2-suvat'],
        stem: 'A body starts from rest, accelerates uniformly to speed $v$ in time $t_1$, then decelerates uniformly to rest in time $t_2$. The total distance covered is:',
        options: [
          '$\\dfrac{v(t_1+t_2)}{2}$',
          '$v(t_1+t_2)$',
          '$\\dfrac{v t_1 t_2}{t_1+t_2}$',
          '$\\dfrac{v(t_1 - t_2)}{2}$'
        ],
        answer: 0,
        hint: 'Draw the v\u2013t graph \u2014 it is a triangle.',
        solution: [
          'The $v$\u2013$t$ graph rises from 0 to $v$ over $t_1$, then falls back to 0 over $t_2$.',
          'That is a triangle with base $(t_1+t_2)$ and height $v$.',
          'Area $= \\tfrac{1}{2}(t_1+t_2)v$, and area under $v$\u2013$t$ is displacement.',
          'No algebra with the two accelerations is needed \u2014 the graph is faster.'
        ] },
      { id: 'ph-02-boss-q2', tier: 'H', kind: 'numeric', parSec: 140, tol: { rel: 0.03 }, kcs: ['kc-ph2-projrange'],
        stem: 'A projectile launched at $45\\degree$ has a range of $80$ m. Find its launch speed in $\\text{m s}^{-1}$. ($g = 10\\ \\text{m s}^{-2}$)',
        answer: 28.28,
        hint: 'At $45\\degree$ the range formula is at its simplest.',
        solution: [
          'At $45\\degree$, $\\sin 2\\theta = 1$, so $R = \\dfrac{u^2}{g}$.',
          '$80 = \\dfrac{u^2}{10}$, so $u^2 = 800$.',
          '$u = \\sqrt{800} = 28.28\\ \\text{m s}^{-1}$.'
        ] },
      { id: 'ph-02-boss-q3', tier: 'M', kind: 'mcq', parSec: 110, kcs: ['kc-ph2-relvel', 'kc-ph2-freefall'],
        stem: 'Two balls are released from the same height, one second apart. As they fall, the distance between them:',
        options: [
          'stays constant',
          'increases',
          'decreases',
          'first increases, then decreases'
        ],
        answer: 1,
        hint: 'The first ball is always moving faster than the second.',
        solution: [
          'Both accelerate at $g$, so their **relative acceleration is zero**.',
          'But when the second is released, the first already has a speed of $g(1\\ \\text{s})$.',
          'That constant relative velocity means the gap grows steadily, by $g \\times 1 = 10$ m every second.',
          'The gap increases **linearly**, not quadratically \u2014 a common wrong instinct.'
        ] }
    ]
  },

  formulaSheet: [
    { name: 'Average speed', tex: '\\bar{v} = \\text{distance}/\\text{time}' },
    { name: 'Average velocity', tex: '\\vec{v}_{av} = \\Delta\\vec{x}/\\Delta t' },
    { name: 'Equal distances', tex: '\\bar{v} = 2v_1v_2/(v_1+v_2)' },
    { name: 'Equal times', tex: '\\bar{v} = (v_1+v_2)/2' },
    { name: 'Velocity, acceleration', tex: 'v = dx/dt,\\quad a = dv/dt' },
    { name: 'First equation', tex: 'v = u + at' },
    { name: 'Second equation', tex: 's = ut + \\tfrac{1}{2}at^2' },
    { name: 'Third equation', tex: 'v^2 = u^2 + 2as' },
    { name: 'Average form', tex: 's = \\left(\\frac{u+v}{2}\\right)t' },
    { name: 'nth second', tex: 's_n = u + \\tfrac{a}{2}(2n-1)' },
    { name: 'Free fall', tex: 'v = \\sqrt{2gh},\\quad t = \\sqrt{2h/g}' },
    { name: 'Vertical projection', tex: 'H = u^2/2g,\\quad T = 2u/g' },
    { name: 'Relative velocity', tex: '\\vec{v}_{AB} = \\vec{v}_A - \\vec{v}_B' },
    { name: 'River: straight across', tex: 't = d/v_b,\\quad \\text{drift} = v_r d/v_b' },
    { name: 'River: shortest path', tex: '\\sin\\theta = v_r/v_b,\\ t = d/\\sqrt{v_b^2-v_r^2}' },
    { name: 'Projectile components', tex: 'u_x = u\\cos\\theta,\\ u_y = u\\sin\\theta' },
    { name: 'Time of flight', tex: 'T = 2u\\sin\\theta/g' },
    { name: 'Max height', tex: 'H = u^2\\sin^2\\theta/2g' },
    { name: 'Range', tex: 'R = u^2\\sin2\\theta/g' },
    { name: 'H over R', tex: 'H/R = \\tan\\theta/4' },
    { name: 'Trajectory', tex: 'y = x\\tan\\theta - \\frac{gx^2}{2u^2\\cos^2\\theta}' }
  ]
};
