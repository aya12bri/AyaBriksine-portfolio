/* =========================================================
   MY PROJECTS
   ---------------------------------------------------------
   Every project on the website comes from this list.
   The cards on the home page AND each project's own page
   (project.html?id=...) are built from it automatically.

   ➜ TO ADD A PROJECT
     1. Copy one whole block from {  to  },
     2. paste it at the top of the list,
     3. change the text. That's it.

   Fields:
     id          short name with no spaces, used in the page link
     category    one of: "robotics", "control", "software", "digital"
     icon        a Boxicons name (https://boxicons.com), e.g. "bx-bot"
     year        e.g. "2026"
     context     where / with whom (school, company, club…)
     github      link to the GitHub repository, or "" if not online yet
     code        true if the project has code to put on GitHub (shows a "Coming soon"
                 button until the link is added). Leave it out for projects with no
                 code: then no GitHub button is shown.
     demo        optional link to a video or live demo, or ""
     image       optional picture file for the card, e.g. "robot.jpg", or ""
     tags        tools and skills used
     title, summary, context:  { en: "...", fr: "..." }  – English and French text
     highlights  { en: [ "...", "..." ], fr: [ "...", "..." ] } – "What I did" list

   Optional extras for the project's page (leave them out if you don't need them):
     results     { en: "...", fr: "..." }  – a short paragraph about the results
     gallery     [ "photo1.jpg", "photo2.jpg" ] – pictures shown on the project page
   ========================================================= */

const projectCategories = {
    robotics: { en: 'Robotics', fr: 'Robotique', icon: 'bx-bot' },
    control:  { en: 'Automatic Control', fr: 'Automatique', icon: 'bx-slider-alt' },
    software: { en: 'Software & IoT', fr: 'Logiciel & IoT', icon: 'bx-code-alt' },
    digital:  { en: 'Digital Transformation', fr: 'Transformation digitale', icon: 'bx-line-chart' }
};

const projects = [
    {
        id: 'signal-processing-matlab',
        category: 'control',
        icon: 'bx-pulse',
        year: '2026',
        github: '',
        code: true,
        demo: '',
        image: '',
        tags: ['MATLAB', 'Traitement du signal', 'Convolution', 'Filtrage', 'DFT', 'Travail en binôme'],
        title: {
            en: 'Signal Processing in MATLAB: Filters, Convolution and DFT',
            fr: 'Traitement du signal sous MATLAB : filtres, convolution et DFT'
        },
        context: {
            en: 'Polytech Orléans – Signal processing lab work, in pairs, supervised by Mrs. Meryem Jabloun',
            fr: 'Polytech Orléans – TP de traitement du signal, en binôme, encadré par Mme Meryem Jabloun'
        },
        summary: {
            en: 'Hands-on study of linear filters, convolution and the discrete Fourier transform in MATLAB: moving-average and sinc filters, chirp sampling, spectral translation, difference equations and the resolution of the DFT.',
            fr: 'Étude pratique des filtres linéaires, de la convolution et de la transformée de Fourier discrète sous MATLAB : filtres moyenneur et sinc, signal chirp, translation spectrale, équations aux différences et résolution de la DFT.'
        },
        highlights: {
            en: [
                'Convolution: two rectangular signals give a triangle (peak 10 over 19 samples); convolving with δ(n − n0) just delays the signal',
                'Moving-average filter on a Gaussian noise signal (mean 1, std 5, 10,000 samples): N0 = 4 smooths a little, N0 = 100 keeps only the slow variations, proving it is a low-pass filter',
                'Spectrum of a sum of two sinusoids (10 Hz and 30 Hz), then filtering with a sinc low-pass filter (fc = 20 Hz) that keeps 10 Hz and removes 30 Hz',
                'Generated and listened to a chirp to understand instantaneous frequency',
                'Frequency gain of h(n) = sinc(n/8) for N0 = 10 and 100 (ripples and the Gibbs phenomenon), and spectral translation by multiplying h(n) by exp(j2πf0n), turning a low-pass into a band-pass filter',
                'Solved the difference equation y(n) − 5/6 y(n−1) + 1/6 y(n−2) = x(n) + x(n−1) by recurrence for a unit-step input: stable system with a transient response',
                'DFT resolution: two close sinusoids (50 and 60 Hz) are barely separated with N = 100 (Δf = 10 Hz) and clearly resolved with N = 1000 (Δf = 1 Hz)',
                'Spectral masking: with an amplitude ratio of 100, the weaker 50 Hz component is hidden by the 150 Hz one'
            ],
            fr: [
                'Convolution : deux rectangles identiques donnent un triangle (pic de 10 sur 19 échantillons) ; la convolution par δ(n − n0) ne fait que décaler le signal',
                'Filtre moyenneur sur un bruit gaussien (moyenne 1, écart-type 5, 10 000 échantillons) : N0 = 4 lisse un peu, N0 = 100 ne garde que les variations lentes, ce qui confirme un filtre passe-bas',
                'Spectre d’une somme de deux sinusoïdes (10 Hz et 30 Hz), puis filtrage par un passe-bas sinc (fc = 20 Hz) qui conserve le 10 Hz et supprime le 30 Hz',
                'Génération et écoute d’un signal chirp pour comprendre la fréquence instantanée',
                'Gain fréquentiel de h(n) = sinc(n/8) pour N0 = 10 et 100 (ondulations et phénomène de Gibbs), et translation spectrale en multipliant h(n) par exp(j2πf0n), qui transforme un passe-bas en passe-bande',
                'Résolution par récurrence de l’équation aux différences y(n) − 5/6 y(n−1) + 1/6 y(n−2) = x(n) + x(n−1) pour un échelon : système stable avec un régime transitoire',
                'Résolution de la DFT : deux sinusoïdes proches (50 et 60 Hz) à peine séparées avec N = 100 (Δf = 10 Hz) et nettement distinguées avec N = 1000 (Δf = 1 Hz)',
                'Masquage spectral : avec un rapport d’amplitude de 100, la composante faible à 50 Hz est noyée par celle à 150 Hz'
            ]
        },
        results: {
            en: 'The lab confirmed that convolution models a filter, that a moving average is a low-pass filter whose smoothing grows with N0, that the DFT resolution is Δf = fe/N, and that a strong amplitude imbalance can hide a weak component.',
            fr: 'Le TP a confirmé que la convolution modélise un filtre, que le filtre moyenneur est un passe-bas dont le lissage augmente avec N0, que la résolution de la DFT vaut Δf = fe/N, et qu’un fort déséquilibre d’amplitude peut masquer une composante faible.'
        },
        gallery: [
            'signaux-convolution.png',
            'signaux-filtrage-passe-bas.png',
            'signaux-spectres-filtre.png',
            'signaux-translation-spectrale.png',
            'signaux-dft-resolution.png',
            'signaux-masquage-spectral.png'
        ]
    },
    {
        id: 'grafcet-sequential-systems',
        category: 'control',
        icon: 'bx-sitemap',
        year: '2026',
        github: '',
        demo: '',
        image: '',
        tags: ['Grafcet (SFC)', 'Automatismes', 'Temporisations', 'Compteurs', 'Séquences parallèles'],
        title: {
            en: 'Grafcet Design for Industrial Sequential Systems',
            fr: 'Conception de Grafcets pour des systèmes séquentiels industriels'
        },
        context: {
            en: 'Polytech Orléans – Industrial automation course exercises',
            fr: 'Polytech Orléans – Exercices d’automatisme industriel'
        },
        summary: {
            en: 'Designing Grafcets for four typical automated systems: a manipulator arm, an overhead crane, an elevator and a machining station.',
            fr: 'Conception de Grafcets pour quatre systèmes automatisés typiques : un bras manipulateur, un pont roulant, un ascenseur et un poste d’usinage.'
        },
        highlights: {
            en: [
                'Manipulator arm: pick-and-place of a cup (close gripper, up, move, down, open, back) and a separate Grafcet to bring the arm to its initial position',
                'Overhead crane: cycle across four stations with turn counters and 2 s processing timers',
                'Elevator: calls from floors 1 to 3, going up and down with cabin lamp, 5 s waits and floor indicators; a second version handles all the possible calls with parallel branches',
                'Machining station: parallel sequences (clamping, machining, ejection) with timers and synchronisation',
                'Used the main Grafcet building blocks: initial step, transitions, actions, timers (T/xs), counters, parallel branches and loops'
            ],
            fr: [
                'Bras manipulateur : prise et dépose d’un gobelet (fermer la pince, monter, déplacer, descendre, ouvrir, revenir) et Grafcet séparé de mise en position initiale',
                'Pont roulant : cycle sur quatre postes avec comptage de tours et temporisations de traitement de 2 s',
                'Ascenseur : appels aux étages 1 à 3, montée et descente avec lampe cabine, attentes de 5 s et témoins d’étage ; une seconde version gère tous les appels possibles avec des branches parallèles',
                'Poste d’usinage : séquences parallèles (serrage, usinage, éjection) avec temporisations et synchronisation',
                'Utilisation des éléments clés du Grafcet : étape initiale, transitions, actions, temporisations (T/xs), compteurs, branches parallèles et boucles'
            ]
        },
        gallery: [
            'grafcet-bras-manipulateur.jpg',
            'grafcet-pont-roulant.jpg',
            'grafcet-ascenseur.jpg',
            'grafcet-poste-usinage.jpg'
        ]
    },
    {
        id: 'drone-modelling-control',
        category: 'control',
        icon: 'bx-navigation',
        year: '2026',
        github: '',
        code: true,
        demo: '',
        image: '',
        tags: ['MATLAB', 'Simulink', 'Linearisation', 'Observateur', 'Retour d’état', 'Commandabilité'],
        title: {
            en: 'Quadcopter Modelling, Observer and State-Feedback Control',
            fr: 'Modélisation, observateur et commande par retour d’état d’un drone quadricoptère'
        },
        context: {
            en: 'Polytech Orléans – Advanced Control lab work',
            fr: 'Polytech Orléans – TP d’Automatique Avancée'
        },
        summary: {
            en: 'Modelling a quadcopter moving in a vertical plane (an under-actuated system), then designing an observer and a state-feedback controller in MATLAB/Simulink.',
            fr: 'Modélisation d’un quadricoptère évoluant dans un plan vertical (système sous-actionné), puis conception d’un observateur et d’une commande par retour d’état sous MATLAB/Simulink.'
        },
        highlights: {
            en: [
                'Identified the state variables, inputs and outputs, and derived the simplified non-linear model',
                'Built the non-linear model in Simulink and computed its equilibrium points',
                'Tangent linearisation around θ = 0°, 10° and 20°, compared with the non-linear system (frequency responses) and analysed stability (poles)',
                'Studied controllability and observability, and chose the cheapest sensor able to reconstruct the state',
                'Designed and tested a linear observer and a non-linear observer',
                'State-feedback control to stabilise the angle, completed to get zero steady-state error'
            ],
            fr: [
                'Identification des variables d’état, entrées et sorties, et obtention du modèle non linéaire simplifié',
                'Construction du modèle non linéaire sous Simulink et calcul des points d’équilibre',
                'Linéarisé tangent autour de θ = 0°, 10° et 20°, comparaison au système non linéaire (réponses fréquentielles) et analyse de stabilité (pôles)',
                'Étude de la commandabilité et de l’observabilité, choix du capteur le moins coûteux permettant de reconstruire l’état',
                'Conception et test d’un observateur linéaire et d’un observateur non linéaire',
                'Retour d’état pour stabiliser l’angle, complété pour obtenir une erreur statique nulle'
            ]
        }
    },
    {
        id: 'reservoirs-s7-1200',
        category: 'control',
        icon: 'bx-water',
        year: '2026',
        github: '',
        demo: '',
        image: '',
        tags: ['Siemens S7-1200', 'TIA Portal', 'Grafcet', 'Automates programmables', 'Câblage'],
        title: {
            en: 'Tank Mixing Process – Siemens S7-1200 PLC',
            fr: 'Automatisation d’une station de réservoirs – automate Siemens S7-1200'
        },
        context: {
            en: 'Polytech Orléans – Industrial Automation lab work',
            fr: 'Polytech Orléans – TP d’Automatisme industriel'
        },
        summary: {
            en: 'Automating a tank station (three measuring tanks and a mixing tank with an agitator) with a Siemens S7-1200 PLC: wiring, Grafcet design, programming and testing.',
            fr: 'Automatisation d’une station de réservoirs (trois réservoirs de mesure et un réservoir de mélange avec agitateur) avec un automate Siemens S7-1200 : câblage, Grafcet, programmation et tests.'
        },
        highlights: {
            en: [
                'Wired the control panel from the inputs/outputs table (level sensors, solenoid valves, pump, agitator, indicator lamps)',
                'Designed, programmed and tested the Grafcet for the filling and initialisation sequence',
                'Managed the mixing tank consumption, with alternating valves and 5-second minimum-opening timers',
                'Sequenced the chlorinated product pour with the agitator kept running for 10 seconds'
            ],
            fr: [
                'Câblage de la platine de contrôle à partir du tableau des entrées/sorties (capteurs de niveau, électrovannes, pompe, agitateur, voyants)',
                'Élaboration, programmation et test du Grafcet de remplissage et d’initialisation',
                'Gestion de la consommation du réservoir de mélange, avec alternance des électrovannes et temporisations de 5 secondes minimum',
                'Séquencement du versement du produit chloré avec agitateur maintenu 10 secondes'
            ]
        },
        gallery: [
            'reservoirs-grafcet.jpg'
        ]
    },
    {
        id: 'self-balancing-motorcycle',
        category: 'robotics',
        icon: 'bx-cycling',
        year: '2026',
        github: '',
        code: true,
        demo: '',
        image: '',
        tags: ['MATLAB', 'Simulink', 'Simscape', 'Stateflow', 'CAO', 'Contrôleur PD', 'IMU BNO055', 'Volant d’inertie', 'Travail en binôme'],
        title: {
            en: 'Self-Balancing Motorcycle with an Inertia Wheel',
            fr: 'Moto auto-équilibrée à volant d’inertie'
        },
        context: {
            en: 'Polytech Orléans – Advanced Control project, in pairs, supervised by Mr. Dominique Nelson-Gruel',
            fr: 'Polytech Orléans – Projet d’Automatique Avancée, en binôme, encadré par M. Dominique Nelson-Gruel'
        },
        summary: {
            en: 'Modelling, simulating and controlling a motorcycle that keeps itself upright with an inertia wheel: a naturally unstable inverted pendulum stabilised by a PD controller, validated on Simulink, Simscape and CAD models.',
            fr: 'Modélisation, simulation et commande d’une moto qui reste droite grâce à un volant d’inertie : un pendule inversé naturellement instable, stabilisé par un correcteur PD et validé sur des modèles Simulink, Simscape et CAO.'
        },
        highlights: {
            en: [
                'Modelled the bike as an inverted pendulum with an inertia wheel (state: angle, angular speed, wheel speed) and linearised it around θ = 0',
                'Built the non-linear model in Simulink: open loop, the bike falls (θ drifts to −40° in 10 s)',
                'Tuned a PD controller (Kp = 10, Kd = 0.1) that brings θ back to 0° in under 0.5 s',
                'Cross-checked the Simulink model against a Simscape multibody model (curves within 2°), then ran the same controller on a 3D CAD model',
                'Selected the hardware: BNO055 IMU (angle and angular speed), wheel encoder, DC motor with inertia wheel driven by PWM, battery monitoring',
                'Designed a Stateflow state machine (fall detection, IMU calibration, battery check) tested on both simulation models',
                'Could not validate the real bike; planned next steps: in-situ gain tuning, Wi-Fi telemetry, straight-line motion and steering'
            ],
            fr: [
                'Modélisation de la moto en pendule inversé à roue d’inertie (état : angle, vitesse angulaire, vitesse de la roue) et linéarisation autour de θ = 0',
                'Modèle non linéaire sous Simulink : en boucle ouverte la moto tombe (θ dérive jusqu’à −40° en 10 s)',
                'Réglage d’un correcteur PD (Kp = 10, Kd = 0,1) qui ramène θ à 0° en moins de 0,5 s',
                'Comparaison du modèle Simulink à un modèle multi-corps Simscape (courbes à moins de 2° près), puis même contrôleur sur un modèle CAO 3D',
                'Choix du matériel : centrale inertielle BNO055 (angle et vitesse angulaire), encodeur de roue, moteur DC avec volant d’inertie piloté en PWM, surveillance de la batterie',
                'Machine à états Stateflow (détection de chute, calibration IMU, batterie) testée sur les deux modèles de simulation',
                'Moto réelle non validée ; suites prévues : réglage des gains in situ, télémétrie Wi-Fi, mouvement rectiligne et direction'
            ]
        },
        results: {
            en: 'Five of the six objectives were reached: full mathematical model, working PD controller, Simulink and CAD simulations, and a state machine validated on both models. The real motorcycle could not be balanced yet.',
            fr: 'Cinq objectifs sur six atteints : modèle mathématique complet, contrôleur PD fonctionnel, simulations Simulink et CAO, et machine à états validée sur les deux modèles. La moto réelle n’a pas encore pu être équilibrée.'
        },
        gallery: [
            'moto-schema-pendule.png',
            'moto-simulink-modele.png',
            'moto-boucle-ouverte.png',
            'moto-boucle-fermee-pd.png',
            'moto-simulink-vs-simscape.png',
            'moto-perturbation-pulse.png',
            'moto-modele-cao.png',
            'moto-arduino-moto.jpeg',
            'moto-machine-etats.png',
            'moto-resultats-scope.png'
        ]
    },
    {
        id: 'turbofan-imc-pid',
        category: 'control',
        icon: 'bx-wind',
        year: '2026',
        github: '',
        code: true,
        demo: '',
        image: '',
        tags: ['MATLAB', 'Simulink', 'IMC', 'PID', 'Identification', 'Anti-windup', 'Placement de pôles'],
        title: {
            en: 'Turbofan Speed Control: PID and Internal Model Control',
            fr: 'Commande en vitesse d’un turboréacteur : PID et commande à modèle interne (IMC)'
        },
        context: {
            en: 'Polytech Orléans – Advanced Control mini-project (Internal Model Control, March 2026), in pairs, supervised by Mr. Guillaume Colin',
            fr: 'Polytech Orléans – Mini-projet d’Automatique Avancée (commande à modèle interne, mars 2026), en binôme, encadré par M. Guillaume Colin'
        },
        summary: {
            en: 'Controlling the high-pressure turbine speed (NH) of a turbofan through the kerosene fuel flow, comparing open-loop, PID and Internal Model Control (IMC) strategies on a Simulink model.',
            fr: 'Régulation de la vitesse de la turbine haute pression (NH) d’un turboréacteur par le débit de kérosène, en comparant commande en boucle ouverte, PID et commande à modèle interne (IMC) sur un modèle Simulink.'
        },
        highlights: {
            en: [
                'System: input = kerosene fuel flow (%), output = high-pressure turbine speed NH (rpm)',
                'Analysis of the problem and closed-loop block diagram (set point, disturbances, units)',
                'Open-loop simulation with fuel-flow steps and identification of a simple representative model',
                'Static input/output characteristic and open-loop control with a look-up table',
                'PID design with the Broïda method and by pole placement, with anti-reset-windup, measurement noise and a set-point pre-filter',
                'IMC design with three filter settings (λ = 1, 0.5 and 0.2), plus anti-reset-windup',
                'Compared PID and IMC on set-point changes and disturbances'
            ],
            fr: [
                'Système : entrée = débit de kérosène (%), sortie = vitesse de la turbine haute pression NH (tr/min)',
                'Analyse du problème et schéma-bloc en boucle fermée (consigne, perturbations, unités)',
                'Simulation en boucle ouverte avec échelons de débit et identification d’un modèle représentatif simple',
                'Caractéristique statique entrée/sortie et commande en boucle ouverte par table de correspondance',
                'Synthèse de PID par la méthode de Broïda et par placement de pôles, avec anti-emballement, bruit de mesure et pré-filtre de consigne',
                'Synthèse d’une commande IMC avec trois réglages de filtre (λ = 1, 0,5 et 0,2), et anti-emballement',
                'Comparaison du PID et de l’IMC face aux changements de consigne et aux perturbations'
            ]
        },
        results: {
            en: 'Internal Model Control delivered better performance and stability against disturbances, provided the filter is well chosen.',
            fr: 'La commande par modèle interne offre plus de performance et de stabilité face aux perturbations, à condition de bien choisir le filtre.'
        },
        gallery: [
            'turbofan-schema-boucle-ouverte.png',
            'turbofan-echelon-identification.png',
            'turbofan-courbe-statique.png',
            'turbofan-pid-broida.jpg',
            'turbofan-placement-poles.jpg',
            'turbofan-antiwindup-1.jpg',
            'turbofan-antiwindup-2.jpg',
            'turbofan-prefiltre.jpg',
            'turbofan-schema-imc.jpg',
            'turbofan-imc-filtre-1.jpg',
            'turbofan-imc-filtre-3.jpg',
            'turbofan-imc-windup.jpg'
        ]
    },
    {
        id: 'doosan-m0617',
        category: 'robotics',
        icon: 'bx-bot',
        year: '2026',
        github: '',
        demo: '',
        image: '',
        tags: ['Doosan M0617', 'Teach pendant Doosan', 'Cobots', 'Programmation robot', 'Pick & Place', 'E/S numériques', 'Denavit-Hartenberg', 'Cinématique', 'Travail en équipe'],
        title: {
            en: 'Doosan M0617 Cobot Programming and Modelling',
            fr: 'Programmation et modélisation du cobot Doosan M0617'
        },
        context: {
            en: 'IUT de Bourges – Advanced Robotics course, lab work in pairs/groups of three',
            fr: 'IUT de Bourges – UE Robotique Avancée, travaux pratiques en binôme/trinôme'
        },
        summary: {
            en: 'Programming the Doosan M0617 6-axis cobot with its teach pendant: JOG, hand guiding, MoveJ/MoveL trajectories and a pick & place application with a suction-cup gripper driven by digital outputs.',
            fr: 'Programmation du cobot 6 axes Doosan M0617 sur son teach pendant : pilotage JOG, co-manipulation, trajectoires MoveJ/MoveL et application pick & place avec une ventouse pilotée par sorties numériques.'
        },
        highlights: {
            en: [
                'Robot: Doosan M0617 6-axis cobot with a suction-cup gripper',
                'Software and tools: Doosan teach pendant, digital I/O, manufacturer documentation',
                'Manual JOG control in joint and Cartesian mode (base frame and tool frame)',
                'Identified and physically marked out the robot frames',
                'Hand-guided the cobot to identify configurations and singularities',
                'Programmed back-and-forth trajectories with MoveJ (joint) and MoveL (linear)',
                'Programmed a pick & place application with the suction cup driven by digital outputs',
                'Kinematic diagram and modified DH parameter table (Craig convention)',
                'Wrote a technical lab report'
            ],
            fr: [
                'Robot : cobot 6 axes Doosan M0617 équipé d’une ventouse',
                'Logiciels et outils : teach pendant Doosan, E/S numériques, documentation constructeur',
                'Pilotage manuel (JOG) en mode articulaire et opérationnel (repère base et repère outil)',
                'Identification et matérialisation des repères du robot',
                'Co-manipulation : guidage à la main, identification des configurations et singularités',
                'Programmation de trajectoires : aller-retour MoveJ (articulaire) / MoveL (linéaire)',
                "Programmation d'une application pick & place avec ventouse pilotée par sorties numériques",
                'Schéma cinématique et tableau des paramètres DH modifiés (convention de Craig)',
                'Rédaction du compte rendu technique'
            ]
        },
        gallery: [
            'doosan-cellule.jpg',
            'doosan-pendant-movej.jpg',
            'doosan-pendant-movel.jpg',
            'doosan-pendant-set-sortie.jpg',
            'doosan-variateur-convoyeur.jpg'
        ]
    },
    {
        id: 'universal-robots-ur3-ur5',
        category: 'robotics',
        icon: 'bx-joystick',
        year: '2026',
        github: '',
        demo: '',
        image: '',
        tags: ['Universal Robots', 'UR3', 'UR5', 'PolyScope', 'Cobots', 'Programmation robot', 'Singularités', 'Denavit-Hartenberg', 'Cinématique', 'Travail en équipe'],
        title: {
            en: 'Universal Robots UR3 & UR5 Cobot Programming and Modelling',
            fr: 'Programmation et modélisation des cobots Universal Robots UR3 et UR5'
        },
        context: {
            en: 'IUT de Bourges – Advanced Robotics course, lab work in pairs/groups of three',
            fr: 'IUT de Bourges – UE Robotique Avancée, travaux pratiques en binôme/trinôme'
        },
        summary: {
            en: 'Programming the UR3 and UR5 6-axis cobots in PolyScope: joint and Cartesian JOG, hand guiding, singularities, MoveJ/MoveL trajectories, kinematic diagrams and modified DH parameters.',
            fr: 'Programmation des cobots 6 axes UR3 et UR5 sous PolyScope : pilotage JOG articulaire et cartésien, co-manipulation, singularités, trajectoires MoveJ/MoveL, schémas cinématiques et paramètres DH modifiés.'
        },
        highlights: {
            en: [
                'Robots: Universal Robots UR3 and UR5 6-axis cobots',
                'Software and tools: PolyScope (Universal Robots teach pendant), manufacturer documentation',
                'Manual JOG control in joint and Cartesian mode (base frame and tool frame)',
                'Identified and physically marked out the robot frames',
                'Hand-guided the cobots to identify configurations and singularities',
                'Programmed back-and-forth trajectories with MoveJ (joint) and MoveL (linear)',
                'Kinematic diagrams and modified DH parameter tables (Craig convention)',
                'Wrote a technical lab report'
            ],
            fr: [
                'Robots : cobots 6 axes Universal Robots UR3 et UR5',
                'Logiciels et outils : PolyScope (pupitre Universal Robots), documentation constructeur',
                'Pilotage manuel (JOG) en mode articulaire et opérationnel (repère base et repère outil)',
                'Identification et matérialisation des repères du robot',
                'Co-manipulation : guidage à la main, identification des configurations et singularités',
                'Programmation de trajectoires : aller-retour MoveJ (articulaire) / MoveL (linéaire)',
                'Schémas cinématiques et tableaux des paramètres DH modifiés (convention de Craig)',
                'Rédaction du compte rendu technique'
            ]
        }
    },
    {
        id: 'fanuc-crx-delta',
        category: 'robotics',
        icon: 'bx-target-lock',
        year: '2026',
        github: '',
        demo: '',
        image: '',
        tags: ['Fanuc', 'CRX-10iA', 'Robot Delta', 'iPendant Fanuc', 'Robotique industrielle', 'Cobots', 'Programmation robot', 'Pick & Place', 'Cinématique', 'Travail en équipe'],
        title: {
            en: 'Fanuc CRX-10iA & Delta Robot Programming and Modelling',
            fr: 'Programmation et modélisation des robots Fanuc CRX-10iA et Delta'
        },
        context: {
            en: 'IUT de Bourges – Advanced Robotics course, lab work in pairs/groups of three',
            fr: 'IUT de Bourges – UE Robotique Avancée, travaux pratiques en binôme/trinôme'
        },
        summary: {
            en: 'Programming Fanuc robots on the tablet/iPendant: the CRX-10iA 6-axis cobot (JOG, hand guiding, MoveJ/MoveL trajectories) and a Delta parallel robot built for pick & place.',
            fr: 'Programmation de robots Fanuc sur tablette/iPendant : le cobot 6 axes CRX-10iA (pilotage JOG, co-manipulation, trajectoires MoveJ/MoveL) et un robot parallèle Delta dédié au pick & place.'
        },
        highlights: {
            en: [
                'Robots: Fanuc CRX-10iA 6-axis cobot and Fanuc Delta parallel pick & place robot',
                'Software and tools: Fanuc tablet/iPendant, manufacturer documentation',
                'Manual JOG control in joint and Cartesian mode (base frame and tool frame)',
                'Identified and physically marked out the robot frames',
                'Hand-guided the CRX-10iA to identify configurations and singularities',
                'Programmed back-and-forth trajectories with MoveJ (joint) and MoveL (linear)',
                'Worked with the Delta parallel robot for pick & place',
                'Kinematic diagrams and modified DH parameters (Craig convention)',
                'Wrote a technical lab report'
            ],
            fr: [
                'Robots : cobot 6 axes Fanuc CRX-10iA et robot parallèle Fanuc Delta de pick & place',
                'Logiciels et outils : tablette/iPendant Fanuc, documentation constructeur',
                'Pilotage manuel (JOG) en mode articulaire et opérationnel (repère base et repère outil)',
                'Identification et matérialisation des repères du robot',
                'Co-manipulation du CRX-10iA : guidage à la main, identification des configurations et singularités',
                'Programmation de trajectoires : aller-retour MoveJ (articulaire) / MoveL (linéaire)',
                'Prise en main du robot parallèle Delta pour le pick & place',
                'Schémas cinématiques et paramètres DH modifiés (convention de Craig)',
                'Rédaction du compte rendu technique'
            ]
        }
    },
    {
        id: 'obstacle-avoidance-robot',
        category: 'robotics',
        icon: 'bx-radar',
        year: '2025 – 2026',
        github: '',
        code: true,
        demo: '',
        image: '',
        tags: ['Mobile robotics', 'Sensors', 'Obstacle avoidance', 'Motor control'],
        title: {
            en: 'Autonomous Obstacle-Avoidance Mobile Robot',
            fr: "Robot mobile autonome d'évitement d'obstacles"
        },
        context: {
            en: 'Polytech Orléans – M1 team project',
            fr: "Polytech Orléans – projet d'équipe M1"
        },
        summary: {
            en: 'A mobile robot that detects obstacles with its sensors and finds its way around them on its own.',
            fr: "Un robot mobile qui détecte les obstacles grâce à ses capteurs et les contourne en toute autonomie."
        },
        highlights: {
            en: [
                'Integrated the distance sensors and read their data in real time',
                'Designed and programmed the obstacle-avoidance algorithm',
                'Implemented motor control for smooth, reliable movement',
                'Tested and tuned the robot as a team'
            ],
            fr: [
                'Intégration des capteurs de distance et lecture de leurs données en temps réel',
                "Conception et programmation de l'algorithme d'évitement d'obstacles",
                'Commande des moteurs pour des déplacements fluides et fiables',
                "Tests et réglages du robot en équipe"
            ]
        }
    },
    {
        id: 'staubli-tx60',
        category: 'robotics',
        icon: 'bx-cog',
        year: '2026',
        github: '',
        demo: '',
        image: '',
        tags: ['Stäubli TX60', 'VAL3', 'Stäubli Robotics Suite', 'Pick-and-place'],
        title: {
            en: 'Stäubli TX60 Industrial Robot Programming',
            fr: 'Programmation du robot industriel Stäubli TX60'
        },
        context: {
            en: 'Polytech Orléans – Industrial robotics lab (M1)',
            fr: 'Polytech Orléans – TP de robotique industrielle (M1)'
        },
        summary: {
            en: 'Programming a 6-axis industrial robot arm in VAL3 to follow trajectories and perform pick-and-place tasks.',
            fr: 'Programmation d’un bras robotique industriel 6 axes en VAL3 pour suivre des trajectoires et réaliser des tâches de pick-and-place.'
        },
        highlights: {
            en: [
                'Programmed the Stäubli TX60 6-axis robot in VAL3',
                'Used the teach pendant and Stäubli Robotics Suite to define and simulate motions',
                'Built trajectory and pick-and-place programs'
            ],
            fr: [
                'Programmation du robot 6 axes Stäubli TX60 en VAL3',
                'Utilisation du pupitre et de Stäubli Robotics Suite pour définir et simuler les mouvements',
                'Réalisation de programmes de trajectoires et de pick-and-place'
            ]
        }
    },
    {
        id: 'dc-motor-speed-control',
        category: 'control',
        icon: 'bx-tachometer',
        year: '2026',
        github: '',
        code: true,
        demo: '',
        image: '',
        tags: ['MATLAB', 'Simulink', 'Modelling', 'PID tuning'],
        title: {
            en: 'DC Motor Speed Control',
            fr: "Asservissement en vitesse d'un moteur à courant continu"
        },
        context: {
            en: 'Polytech Orléans – Control lab (M1)',
            fr: "Polytech Orléans – TP d'automatique (M1)"
        },
        summary: {
            en: 'Modelling a DC motor, simulating it in MATLAB, tuning a speed controller and validating it on the real system.',
            fr: 'Modélisation d’un moteur à courant continu, simulation sous MATLAB, réglage d’un correcteur de vitesse et validation sur le système réel.'
        },
        highlights: {
            en: [
                'Theoretical study and modelling of the motor',
                'Simulation of the closed-loop system in MATLAB',
                'Controller tuning to meet the speed specifications',
                'Experimental validation on the test bench'
            ],
            fr: [
                'Étude théorique et modélisation du moteur',
                'Simulation du système en boucle fermée sous MATLAB',
                'Réglage du correcteur pour respecter le cahier des charges',
                'Validation expérimentale sur le banc de test'
            ]
        }
    },
    {
        id: 'climax-plc-robot-arm',
        category: 'control',
        icon: 'bx-git-merge',
        year: '2026',
        github: '',
        demo: '',
        image: '',
        tags: ['PLC', 'TSX 3705', 'PL7-Pro', 'Grafcet (SFC)', 'Ladder', 'Temporisateurs', 'Compteurs', 'Travail en équipe'],
        title: {
            en: 'Robotic Arm Control with a PLC (CLIMAX)',
            fr: 'Commande d’un bras robotique par automate (CLIMAX)'
        },
        context: {
            en: 'Polytech Orléans – Industrial automation lab (M1), group of four, supervised by Mr. Mustafa Elahres',
            fr: 'Polytech Orléans – TP d’automatisme (M1), en groupe de quatre, encadré par M. Mustafa Elahres'
        },
        summary: {
            en: 'Programming a TSX 3705 PLC with PL7-Pro to drive the CLIMAX manipulator arm (8 movements, 3 double-acting and 2 single-acting cylinders): a free 8-step Grafcet, then an industrial “french-fry factory” cycle with timers and a counter.',
            fr: 'Programmation d’un automate TSX 3705 sous PL7-Pro pour piloter le bras manipulateur CLIMAX (8 mouvements, 3 vérins double effet et 2 simple effet) : un Grafcet libre de 8 étapes, puis un cycle industriel « usine de frites » avec temporisateurs et compteur.'
        },
        highlights: {
            en: [
                'Built the I/O mnemonic tables (limit switches, start/auto/service/emergency stop inputs, cylinder outputs and indicator lamps)',
                'Part 1: designed a free 8-step Grafcet (arm out, up, in, down, rotate right, close gripper, rotate left, open gripper) starting from the initial conditions',
                'Implemented it in PL7-Pro: Grafcet chart, one Ladder page per transition (%X(n)→%X(n+1)) and a POST section linking each step bit to its physical output',
                'Part 2: “french-fry factory” cycle: grab the basket, lift, 5 s draining timer (Temp1, TON), rotate, 5 s salting timer (Temp2)',
                'Programmed the shaking loop (down + up, repeated 3 times) with an up-counter Ca (CP = 3), a COMPARE block (Ca.P < 3) and automatic reset at the start of each cycle',
                'Tested and validated the complete cycle on the real CLIMAX arm with the teacher'
            ],
            fr: [
                'Construction des tables de mnémoniques des entrées/sorties (fins de course, marche/auto/mise en service/arrêt d’urgence, vérins, voyants)',
                'Partie 1 : Grafcet libre de 8 étapes (sortie du bras, montée, rentrée, descente, rotation droite, fermeture de la pince, rotation gauche, ouverture de la pince) à partir des conditions initiales',
                'Implémentation sous PL7-Pro : chart Grafcet, une page Ladder par transition (%X(n)→%X(n+1)) et section POST associant chaque bit d’étape à sa sortie physique',
                'Partie 2 : cycle « usine de frites » : saisie du panier, montée, temporisation d’égouttage de 5 s (Temp1, TON), rotation, temporisation d’ajout du sel de 5 s (Temp2)',
                'Boucle de secouage (descente + montée, répétée 3 fois) avec un compteur ascendant Ca (CP = 3), un bloc COMPARE (Ca.P < 3) et remise à zéro automatique en début de cycle',
                'Test et validation du cycle complet sur le bras CLIMAX réel en présence de l’enseignant'
            ]
        },
        results: {
            en: 'The complete french-fry cycle was tested and validated on the real CLIMAX arm. The lab showed that Grafcet and Ladder map directly onto each other, and introduced timers and counters.',
            fr: 'Le cycle complet de l’usine de frites a été testé et validé sur le bras CLIMAX réel. Ce TP a montré la correspondance directe entre Grafcet et Ladder, et introduit les temporisateurs et les compteurs.'
        },
        gallery: [
            'climax-grafcet-partie1.png',
            'climax-ladder-transitions.png',
            'climax-temporisateur-compteur.png',
            'climax-post-partie2.png'
        ]
    },
    {
        id: 'greenhouse-monitoring',
        category: 'software',
        icon: 'bx-leaf',
        year: '2022',
        github: '',
        code: true,
        demo: '',
        image: '',
        tags: ['IoT', 'Web/mobile app', 'Data acquisition', 'Real-time dashboard'],
        title: {
            en: 'Greenhouse Monitoring Application',
            fr: 'Application de supervision de serre'
        },
        context: {
            en: 'Green Energy Park (IRESEN / UM6P) – Final-year internship',
            fr: 'Green Energy Park (IRESEN / UM6P) – Stage de fin d’études'
        },
        summary: {
            en: 'A web and mobile app to monitor, control and log sensor data from a greenhouse used to heat sewage sludge.',
            fr: 'Une application web et mobile pour superviser, piloter et enregistrer les données des capteurs d’une serre de chauffage des boues.'
        },
        highlights: {
            en: [
                'Data acquisition and storage from the greenhouse sensors',
                'Real-time visualisation and operator interface',
                'On-site testing and validation',
                'Cut manual data collection time by 70%'
            ],
            fr: [
                'Acquisition et stockage des données des capteurs de la serre',
                'Visualisation en temps réel et interface opérateur',
                'Tests et validation sur site',
                'Réduction de 70 % du temps de collecte manuelle'
            ]
        }
    },
    {
        id: 'point-cloud-3d',
        category: 'software',
        icon: 'bx-cube-alt',
        year: '2026',
        github: '',
        code: true,
        demo: '',
        image: '',
        tags: ['Python', 'Open3D', 'PyVista', 'Tkinter'],
        title: {
            en: 'Point Clouds & 3D Visualisation',
            fr: 'Nuages de points & visualisation 3D'
        },
        context: {
            en: 'Self-training',
            fr: 'Autoformation'
        },
        summary: {
            en: 'Exploring point clouds and 3D visualisation in Python with Open3D and PyVista, wrapped in simple Tkinter interfaces.',
            fr: 'Exploration des nuages de points et de la visualisation 3D en Python avec Open3D et PyVista, dans des interfaces Tkinter simples.'
        },
        highlights: {
            en: [
                'Loading, processing and displaying point clouds with Open3D',
                '3D visualisation with PyVista',
                'Python GUIs with Tkinter'
            ],
            fr: [
                'Chargement, traitement et affichage de nuages de points avec Open3D',
                'Visualisation 3D avec PyVista',
                'Interfaces graphiques Python avec Tkinter'
            ]
        }
    },
    {
        id: 'client-reporting',
        category: 'digital',
        icon: 'bx-bar-chart-alt-2',
        year: '2023 – 2024',
        github: '',
        code: true,
        demo: '',
        image: '',
        tags: ['Power BI', 'Google Data Studio', 'Dashboards', 'Training'],
        title: {
            en: 'Client Dashboards & Automated Reporting',
            fr: 'Tableaux de bord & reporting client automatisé'
        },
        context: {
            en: 'DB Growth – Digital Transformation Consultant',
            fr: 'DB Growth – Consultante en transformation digitale'
        },
        summary: {
            en: 'Analysing client processes and replacing manual reporting with monthly KPI dashboards and automated Power BI reports.',
            fr: 'Analyse des processus clients et remplacement du reporting manuel par des tableaux de bord KPI mensuels et des rapports Power BI automatisés.'
        },
        highlights: {
            en: [
                'Analysed client processes and selected digital solutions',
                'Designed KPI dashboards in Power BI and Google Data Studio',
                'Trained end users on the new tools'
            ],
            fr: [
                'Analyse des processus clients et choix des solutions digitales',
                'Conception de tableaux de bord KPI dans Power BI et Google Data Studio',
                'Formation des utilisateurs aux nouveaux outils'
            ]
        }
    },
    {
        id: 'crm-digitalisation',
        category: 'digital',
        icon: 'bx-network-chart',
        year: '2022 – 2025',
        github: '',
        code: true,
        demo: '',
        image: '',
        tags: ['CRM / ERP', 'Specifications', 'Change management', 'SAP Ariba'],
        title: {
            en: 'CRM Rollout & Digitalisation Projects',
            fr: 'Déploiement CRM & projets de digitalisation'
        },
        context: {
            en: 'BROS-COM – Digital Transformation Project Manager',
            fr: 'BROS-COM – Cheffe de projet transformation digitale'
        },
        summary: {
            en: 'Leading digitalisation projects end to end, including a CRM rollout that increased sales productivity.',
            fr: 'Pilotage de projets de digitalisation de bout en bout, dont le déploiement d’un CRM qui a augmenté la productivité commerciale.'
        },
        highlights: {
            en: [
                'Requirements gathering, specifications, planning and follow-up',
                'Rolled out a CRM system and connected the business to SAP Ariba',
                'Coordinated technical and business teams and reported to management'
            ],
            fr: [
                'Recueil des besoins, cahier des charges, planification et suivi',
                'Déploiement d’un CRM et connexion de l’entreprise à SAP Ariba',
                'Coordination des équipes techniques et métiers, reporting à la direction'
            ]
        }
    }
];
