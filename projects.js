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
     category    one of: "robotics", "control", "automation", "signal", "iot", "programming", "digital", "electrotechnique"
     icon        a Boxicons name (https://boxicons.com), e.g. "bx-bot"
     year        e.g. "2026"
     context     where / with whom (school, company, club…)
     github      link to the GitHub repository, or "" if not online yet
     code        true if the project has code to put on GitHub (shows a "Coming soon"
                 button until the link is added). Leave it out for projects with no
                 code: then no GitHub button is shown.
     pdf         optional PDF file to download from the project page, e.g. "report.pdf"
     downloads   optional list of files to download: [ { file: "script.m", icon: "bx-code-alt", label: { en: "...", fr: "..." } } ]
     demo        optional link to a video or live demo, or ""
     video       optional video file shown in a player on the project page, e.g. "robot.mp4"
                 (use "image" for its picture on the card)
     image       optional picture file for the card, e.g. "robot.jpg", or ""
     tags        tools and skills used
     title, summary, context:  { en: "...", fr: "..." }  – English and French text
     highlights  { en: [ "...", "..." ], fr: [ "...", "..." ] } – "What I did" list

   Optional extras for the project's page (leave them out if you don't need them):
     results     { en: "...", fr: "..." }  – a short paragraph about the results
     gallery     [ "photo1.jpg", { src: "fig.png", caption: { en: "...", fr: "..." } } ] – pictures shown on the project page
                 (a plain file name or a picture with a caption)
     art         optional line-art cover when there is no photo: arm, cobot, rover, drone, chip, head, gear,
                 lidar, delta, loop, motor, tank, grafcet, dashboard, network
     imageFit    "contain" to show the card/page picture whole on white (for figures and diagrams)
   ========================================================= */

const projectCategories = {
    robotics:    { en: 'Robotics', fr: 'Robotique', icon: 'bx-bot' },
    control:     { en: 'Automatic Control', fr: 'Automatique', icon: 'bx-slider-alt' },
    automation:  { en: 'Industrial Automation', fr: 'Automatisme', icon: 'bx-git-merge' },
    signal:      { en: 'Signal Processing', fr: 'Traitement du signal', icon: 'bx-pulse' },
    iot:         { en: 'IoT', fr: 'IoT', icon: 'bx-chip' },
    programming: { en: 'Programming', fr: 'Programmation', icon: 'bx-code-alt' },
    digital:     { en: 'Digital Transformation', fr: 'Transformation digitale', icon: 'bx-line-chart' },
    electrotechnique: { en: 'Electrical Engineering', fr: 'Électrotechnique', icon: 'bx-bolt-circle' }
};

const projects = [
    {
        id: 'signal-processing-matlab',
        category: 'signal',
        icon: 'bx-pulse',
        year: '2026',
        github: '',
        code: true,
        demo: '',
        image: 'signaux-fig6.png',
        imageFit: 'contain',
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
            { src: 'signaux-fig1.png', caption: { en: 'Convolution of two rectangular signals gives a triangle', fr: 'La convolution de deux signaux rectangulaires donne un triangle' } },
            { src: 'signaux-fig2.png', caption: { en: 'Convolution with δ(n − 5): the signal is simply delayed by 5 samples', fr: 'Convolution par δ(n − 5) : le signal est simplement décalé de 5 échantillons' } },
            { src: 'signaux-fig3.png', caption: { en: 'Gaussian random signal (mean 1, standard deviation 5)', fr: 'Signal aléatoire gaussien (moyenne 1, écart-type 5)' } },
            { src: 'signaux-fig4.png', caption: { en: 'Moving-average low-pass filter: original, N0 = 4 and N0 = 100', fr: 'Filtre moyenneur passe-bas : signal original, N0 = 4 et N0 = 100' } },
            { src: 'signaux-fig5.png', caption: { en: 'Spectrum of the sum of two sinusoids (10 Hz and 30 Hz)', fr: 'Spectre de la somme de deux sinusoïdes (10 Hz et 30 Hz)' } },
            { src: 'signaux-fig6.png', caption: { en: 'Spectra of the signal, the sinc filter and the filtered signal', fr: 'Spectres du signal, du filtre sinc et du signal filtré' } },
            { src: 'signaux-fig7.png', caption: { en: 'Chirp signal: the frequency increases with time', fr: 'Signal chirp : la fréquence augmente avec le temps' } },
            { src: 'signaux-fig8.png', caption: { en: 'Frequency gain of the sinc filter for N0 = 10 and N0 = 100', fr: 'Gain fréquentiel du filtre sinc pour N0 = 10 et N0 = 100' } },
            { src: 'signaux-fig9.png', caption: { en: 'Spectral translation: a low-pass filter becomes a band-pass filter', fr: 'Translation spectrale : le passe-bas devient un passe-bande' } },
            { src: 'signaux-fig10.png', caption: { en: 'Difference equation solved by recurrence (unit-step input)', fr: 'Équation aux différences résolue par récurrence (entrée échelon)' } },
            { src: 'signaux-fig11.png', caption: { en: 'DFT of two sinusoids at 50 Hz and 150 Hz', fr: 'DFT de deux sinusoïdes à 50 Hz et 150 Hz' } },
            { src: 'signaux-fig12.png', caption: { en: 'DFT resolution for two close frequencies (50 and 60 Hz): N = 100 vs N = 1000', fr: 'Résolution de la DFT pour deux fréquences proches (50 et 60 Hz) : N = 100 et N = 1000' } },
            { src: 'signaux-fig13.png', caption: { en: 'Spectral masking: the 50 Hz component is hidden when A2/A1 = 100', fr: 'Masquage spectral : la composante à 50 Hz est cachée quand A2/A1 = 100' } }
        ]
    },
    {
        id: 'grafcet-sequential-systems',
        category: 'automation',
        icon: 'bx-sitemap',
        year: '2026',
        github: '',
        demo: '',
        image: '',
        art: 'grafcet',
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
            { src: 'grafcet-bras-manipulateur.jpg', caption: { en: 'Manipulator arm: cup pick-and-place and return to initial position', fr: 'Bras manipulateur : prise et dépose d’un gobelet, mise en position initiale' } },
            { src: 'grafcet-pont-roulant.jpg', caption: { en: 'Overhead crane: cycle across four stations', fr: 'Pont roulant : cycle sur quatre postes' } },
            { src: 'grafcet-ascenseur.jpg', caption: { en: 'Elevator: basic version and version with all calls', fr: 'Ascenseur : version simple et version avec tous les appels' } },
            { src: 'grafcet-poste-usinage.jpg', caption: { en: 'Machining station: parallel sequences', fr: 'Poste d’usinage : séquences parallèles' } }
        ]
    },
    {
        id: 'drone-modelling-control',
        downloads: [
            { file: 'drone-tp-observateur-commande.m', icon: 'bx-code-alt', label: { en: 'Download the MATLAB script (.m)', fr: 'Télécharger le script MATLAB (.m)' } },
            { file: 'drone-tp-question5-simulink.sltx', icon: 'bx-chip', label: { en: 'Download the Simulink model (.sltx)', fr: 'Télécharger le modèle Simulink (.sltx)' } }
        ],
        category: 'control',
        icon: 'bx-navigation',
        year: '2026',
        github: '',
        code: true,
        demo: '',
        image: '',
        art: 'drone',
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
        },
        results: {
            en: 'The linearised models match the non-linear system close to each equilibrium point, and the simulations show how the non-linear response drifts away from the linear one as the angle grows (θ = 0°, 10°, 20°).',
            fr: 'Les modèles linéarisés reproduisent bien le système non linéaire près de chaque point d’équilibre, et les simulations montrent comment la réponse non linéaire s’écarte de la réponse linéaire quand l’angle augmente (θ = 0°, 10°, 20°).'
        },
        gallery: [
            { src: 'drone-bode-comparaison.png', caption: { en: 'Frequency responses of the linearised models for θ = 0°, 10° and 20°', fr: 'Réponses fréquentielles des modèles linéarisés pour θ = 0°, 10° et 20°' } },
            { src: 'drone-simulink-theta-0.png', caption: { en: 'Simulink scopes: non-linear model (red) vs linear model (blue) around θ = 0°', fr: 'Oscilloscopes Simulink : modèle non linéaire (rouge) et modèle linéaire (bleu) autour de θ = 0°' } },
            { src: 'drone-simulink-theta-10.png', caption: { en: 'Same comparison around θ = 10°', fr: 'Même comparaison autour de θ = 10°' } },
            { src: 'drone-simulink-theta-20.png', caption: { en: 'Same comparison around θ = 20°', fr: 'Même comparaison autour de θ = 20°' } }
        ]
    },
    {
        id: 'reservoirs-s7-1200',
        category: 'automation',
        icon: 'bx-water',
        year: '2026',
        github: '',
        demo: '',
        image: '',
        art: 'tank',
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
            { src: 'reservoirs-grafcet.jpg', caption: { en: 'Grafcets: tank filling and consumption', fr: 'Grafcets : remplissage et consommation des réservoirs' } }
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
        image: 'moto-modele-cao.png',
        imageFit: 'contain',
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
        art: 'loop',
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
        pdf: 'rapport-tp-doosan-m0617.pdf',
        category: 'robotics',
        icon: 'bx-bot',
        year: '2026',
        github: '',
        demo: '',
        image: 'video-doosan-m0617.jpg',
        video: 'video-doosan-m0617.mp4',
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
        pdf: 'rapport-tp-universal-robots-ur5.pdf',
        category: 'robotics',
        icon: 'bx-joystick',
        year: '2026',
        github: '',
        demo: '',
        image: 'video-universal-robots-ur5.jpg',
        video: 'video-universal-robots-ur5.mp4',
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
        image: 'video-fanuc-crx.jpg',
        video: 'video-fanuc-crx.mp4',
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
        pdf: 'rapport-projet-evitement-obstacles.pdf',
        category: 'robotics',
        icon: 'bx-radar',
        year: '2025 – 2026',
        github: '',
        code: true,
        demo: '',
        image: 'video-robot-evitement-obstacles.jpg',
        video: 'video-robot-evitement-obstacles.mp4',
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
        pdf: 'rapport-tp-staubli-tx60l.pdf',
        category: 'robotics',
        icon: 'bx-cog',
        year: '2026',
        github: '',
        demo: '',
        image: '',
        art: 'arm',
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
        art: 'motor',
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
        category: 'automation',
        icon: 'bx-git-merge',
        year: '2026',
        github: '',
        demo: '',
        image: '',
        art: 'cobot',
        imageFit: 'contain',
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
            { src: 'climax-mnemoniques.png', caption: { en: 'I/O mnemonic tables', fr: 'Tables des mnémoniques des entrées/sorties' } },
            { src: 'climax-grafcet-partie1.png', caption: { en: 'Part 1: free 8-step Grafcet', fr: 'Partie 1 : Grafcet libre de 8 étapes' } },
            { src: 'climax-ladder-transitions.png', caption: { en: 'Ladder: the 9 transitions of part 1', fr: 'Ladder : les 9 transitions de la partie 1' } },
            { src: 'climax-temporisateur-compteur.png', caption: { en: 'Part 2: Temp1 timer (TON, 5 s) and Ca counter (CP = 3)', fr: 'Partie 2 : temporisateur Temp1 (TON, 5 s) et compteur Ca (CP = 3)' } },
            { src: 'climax-post-partie2.png', caption: { en: 'POST section of part 2 and summary of the transitions', fr: 'Section POST de la partie 2 et résumé des transitions' } }
        ]
    },
    {
        id: 'greenhouse-monitoring',
        category: 'iot',
        icon: 'bx-leaf',
        year: '2022',
        github: '',
        code: true,
        demo: '',
        image: '',
        art: 'chip',
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
        category: 'programming',
        icon: 'bx-cube-alt',
        year: '2026',
        github: '',
        code: true,
        demo: '',
        image: '',
        art: 'lidar',
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
        art: 'dashboard',
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
        art: 'network',
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
    },
    {
        id: 'dc-machine-lab',
        pdf: 'rapport-tp-machine-courant-continu.pdf',
        category: 'electrotechnique',
        icon: 'bx-bolt-circle',
        year: '2026',
        github: '',
        demo: '',
        image: 'electro-mcc-caracteristique-vide.png',
        imageFit: 'contain',
        tags: ['DC machine', 'Separately excited', 'Test bench', 'Characterisation', 'Électrotechnique', 'Travail en binôme'],
        title: {
            en: 'DC Machine Lab: Generator and Motor Operation',
            fr: 'TP machine à courant continu : fonctionnement génératrice et moteur'
        },
        context: {
            en: 'Polytech Orléans – Electrical engineering lab (M1), pair work, supervised by Mr. Hervé Lailheugue',
            fr: 'Polytech Orléans – TP d’électrotechnique (M1), en binôme, encadré par M. Hervé Lailheugue'
        },
        summary: {
            en: 'Experimental study of a separately excited DC machine run first as a generator, then as a motor, to record and analyse its electrical and mechanical characteristics.',
            fr: 'Étude expérimentale d’une machine à courant continu à excitation indépendante, utilisée d’abord en génératrice puis en moteur, pour relever et analyser ses caractéristiques électriques et mécaniques.'
        },
        highlights: {
            en: [
                'Generator mode: drove the machine with an induction motor and plotted the no-load curve Ea = f(Ie), showing magnetic saturation and hysteresis (rising vs. falling Ie)',
                'Loaded the generator at Ie = 0.75 A (rated Ia = 6.8 A) and plotted Ua = f(Ia): voltage drop explained by the armature resistance',
                'Plotted the regulation characteristic Ie = f(Ia) at constant Ua = 110 V',
                'Measured the armature resistance (Ra ≈ 4.11 Ω against 4.2 Ω in the datasheet) and set up the generator energy balance Pu = Pa − Pc − Pj',
                'Motor mode: power balance at 6 load points, computed Cu, Pu and efficiency from Ua·Ia − Ra·Ia² − (Pf + Pm), and plotted Cu = f(n), η = f(Pu) and Ia = f(Cu)'
            ],
            fr: [
                'Mode génératrice : entraînement par un moteur asynchrone et tracé de la caractéristique à vide Ea = f(Ie), avec mise en évidence de la saturation magnétique et de l’hystérésis (Ie croissant puis décroissant)',
                'Mise en charge de la génératrice à Ie = 0,75 A (Ia nominal = 6,8 A) et tracé de Ua = f(Ia) : chute de tension expliquée par la résistance d’induit',
                'Tracé de la caractéristique de réglage Ie = f(Ia) à Ua constante = 110 V',
                'Mesure de la résistance d’induit (Ra ≈ 4,11 Ω contre 4,2 Ω en annexe) et écriture du bilan énergétique de la génératrice Pu = Pa − Pc − Pj',
                'Mode moteur : bilan de puissance sur 6 points de charge, calcul de Cu, Pu et du rendement à partir de Ua·Ia − Ra·Ia² − (Pf + Pm), et tracé de Cu = f(n), η = f(Pu) et Ia = f(Cu)'
            ]
        },
        results: {
            en: 'The measurements matched the theory: saturation and hysteresis in the no-load curve, a decreasing Ua = f(Ia), nearly constant speed whatever the load, a linear Ia = f(Cu) and an efficiency that rises with the useful power.',
            fr: 'Les mesures sont cohérentes avec la théorie : saturation et hystérésis sur la caractéristique à vide, Ua = f(Ia) décroissante, vitesse quasi constante quelle que soit la charge, Ia = f(Cu) linéaire et rendement croissant avec la puissance utile.'
        },
        gallery: [
            { src: 'electro-mcc-caracteristique-vide.png', caption: { en: 'No-load characteristic Ea = f(Ie): saturation and hysteresis', fr: 'Caractéristique à vide Ea = f(Ie) : saturation et hystérésis' } },
            { src: 'electro-mcc-caracteristique-charge.png', caption: { en: 'Load characteristic Ua = f(Ia)', fr: 'Caractéristique en charge Ua = f(Ia)' } },
            { src: 'electro-mcc-caracteristique-reglage.png', caption: { en: 'Regulation characteristic Ie = f(Ia) at Ua = 110 V', fr: 'Caractéristique de réglage Ie = f(Ia) à Ua = 110 V' } },
            { src: 'electro-mcc-couple-vitesse.png', caption: { en: 'Motor mode: Cu = f(n)', fr: 'Mode moteur : Cu = f(n)' } },
            { src: 'electro-mcc-rendement.png', caption: { en: 'Motor mode: efficiency η = f(Pu)', fr: 'Mode moteur : rendement η = f(Pu)' } },
            { src: 'electro-mcc-courant-couple.png', caption: { en: 'Motor mode: Ia = f(Cu)', fr: 'Mode moteur : Ia = f(Cu)' } }
        ]
    },
    {
        id: 'induction-motor-lab',
        pdf: 'rapport-tp-moteur-asynchrone.pdf',
        category: 'electrotechnique',
        icon: 'bx-bolt-circle',
        year: '2026',
        github: '',
        demo: '',
        image: 'electro-mas-schema-montage.png',
        imageFit: 'contain',
        tags: ['Induction motor', 'Powder brake', 'Oscilloscope', 'Efficiency', 'Électrotechnique', 'Travail en binôme'],
        title: {
            en: 'Three-Phase Induction Motor Test Bench',
            fr: 'TP moteur asynchrone triphasé sur banc d’essai'
        },
        context: {
            en: 'Polytech Orléans – Electrical engineering lab (M1), pair work, supervised by Mr. Hervé Lailheugue',
            fr: 'Polytech Orléans – TP d’électrotechnique (M1), en binôme, encadré par M. Hervé Lailheugue'
        },
        summary: {
            en: 'Checking the datasheet of a 1.5 kW induction motor on a test bench (powder brake, torque sensor, tachometer dynamo): efficiency curve and starting current.',
            fr: 'Vérification des données constructeur d’un moteur asynchrone de 1,5 kW sur banc d’essai (frein à poudre, capteur de couple, dynamo tachymétrique) : courbe de rendement et courant de démarrage.'
        },
        highlights: {
            en: [
                'Written preparation: read the LS90L-1.5 kW datasheet and checked the rated current (3.70 A computed vs 3.4 A) and torque (10.03 N·m vs 10 N·m); chose the star (Y) coupling on the 400 V network',
                'Wired the motor on the three-phase network through a starter, with a clamp meter and a series ammeter, and loaded it with a powder brake',
                'Recorded input power, current, useful power, speed, torque and efficiency at 6 load points, and verified Pu = T·Ω (1.526 kW vs 1.55 kW measured, about 1.5 % gap)',
                'Plotted the efficiency η against Pu/Pu,nom: maximum of 81.3 % around mid-load and 79.9 % at rated load, against 79.4 % announced',
                'Captured the start-up on an oscilloscope (current probe and tachometer dynamo): about 28 A inrush, 1600 rpm steady speed, start-up time of 0.5 to 0.75 s'
            ],
            fr: [
                'Préparation écrite : relevé des données du moteur LS90L-1,5 kW et vérification du courant nominal (3,70 A calculé pour 3,4 A) et du couple nominal (10,03 N·m pour 10 N·m) ; choix du couplage étoile (Y) sur le réseau 400 V',
                'Câblage du moteur sur le réseau triphasé via un démarreur, avec pince de mesure et ampèremètre en série, et mise en charge par un frein à poudre',
                'Relevé de la puissance absorbée, du courant, de la puissance utile, de la vitesse, du couple et du rendement sur 6 points de charge, et vérification de Pu = T·Ω (1,526 kW calculé contre 1,55 kW mesuré, écart d’environ 1,5 %)',
                'Tracé du rendement η en fonction de Pu/Pu,nom : maximum de 81,3 % vers la mi-charge et 79,9 % à charge nominale, pour 79,4 % annoncé',
                'Visualisation du démarrage à l’oscilloscope (sonde de courant et dynamo tachymétrique) : appel de courant d’environ 28 A, vitesse établie de 1600 tr/min, temps de démarrage de 0,5 à 0,75 s'
            ]
        },
        results: {
            en: 'The measured efficiency stays within 1 % of the manufacturer’s 79.4 % at rated load, and the start-up shows the typical inrush current of an induction motor, which falls as the back-EMF builds up with speed.',
            fr: 'Le rendement mesuré reste à moins de 1 % des 79,4 % du constructeur à charge nominale, et le démarrage met en évidence l’appel de courant typique d’un moteur asynchrone, qui diminue quand la force contre-électromotrice augmente avec la vitesse.'
        },
        gallery: [
            { src: 'electro-mas-schema-montage.png', caption: { en: 'Test bench wiring diagram (starter, clamp meter, powder brake, tachometer dynamo)', fr: 'Schéma du montage (démarreur, pince, frein à poudre, dynamo tachymétrique)' } },
            { src: 'electro-mas-plaque.jpg', caption: { en: 'Motor nameplate', fr: 'Plaque signalétique du moteur' } },
            { src: 'electro-mas-modmeca.jpg', caption: { en: 'MODMECA 3: power, speed and torque display', fr: 'MODMECA 3 : affichage de la puissance, de la vitesse et du couple' } },
            { src: 'electro-mas-rendement.png', caption: { en: 'Efficiency η as a function of Pu / Pu,nom', fr: 'Rendement η en fonction de Pu / Pu,nom' } },
            { src: 'electro-mas-schema-demarrage.png', caption: { en: 'Start-up measurement diagram (current probe, tachometer dynamo)', fr: 'Schéma de mesure du démarrage (sonde de courant, dynamo tachymétrique)' } },
            { src: 'electro-mas-oscillogramme.jpg', caption: { en: 'Start-up oscillogram: current and speed', fr: 'Oscillogramme du démarrage : courant et vitesse' } }
        ]
    },
    {
        id: 'three-phase-transformer-lab',
        pdf: 'rapport-tp-transformateur-triphase.pdf',
        category: 'electrotechnique',
        icon: 'bx-bolt-circle',
        year: '2026',
        github: '',
        demo: '',
        image: 'electro-transfo-montage.jpg',
        imageFit: 'cover',
        tags: ['Three-phase transformer', 'Kapp equivalent circuit', 'No-load test', 'Short-circuit test', 'Power analyser', 'Électrotechnique', 'Travail en binôme'],
        title: {
            en: 'Three-Phase Transformer: Kapp Equivalent Circuit',
            fr: 'Étude d’un transformateur triphasé : schéma équivalent de Kapp'
        },
        context: {
            en: 'Polytech Orléans – Electrical engineering lab (M1), pair work, supervised by Mr. Hervé Lailheugue',
            fr: 'Polytech Orléans – TP d’électrotechnique (M1), en binôme, encadré par M. Hervé Lailheugue'
        },
        summary: {
            en: 'Identifying the parameters of the Kapp equivalent circuit of a 4 kVA three-phase transformer from a no-load test and a short-circuit test, measured with a power analyser.',
            fr: 'Détermination des paramètres du schéma équivalent de Kapp d’un transformateur triphasé de 4 kVA à partir d’un essai à vide et d’un essai en court-circuit, mesurés à l’analyseur de réseau.'
        },
        highlights: {
            en: [
                'Preliminary study: nameplate (4 kVA, 3 × 250 V / 6 × 63 V), Yy0 wiring, transformation ratio and rated currents (I1N ≈ 5.33 A, I2N ≈ 10.6 A)',
                'Explained the physical meaning of each element of the Kapp circuit, the hysteresis loop and the odd harmonics produced by magnetic saturation (Faraday and Lenz laws)',
                'No-load test: wired the transformer, measured with a Chauvin Arnoux analyser (current wound 6 turns around the clamps for accuracy), checked that the three phases are balanced, and found m ≈ 0.53, RF ≈ 476 Ω and XP ≈ 230 Ω',
                'Displayed the hysteresis cycle of the core on the analyser',
                'Short-circuit test at the rated secondary current (10.58 A): RS ≈ 1.0 Ω and XS ≈ 0.20 Ω'
            ],
            fr: [
                'Étude préliminaire : plaque signalétique (4 kVA, 3 × 250 V / 6 × 63 V), couplage Yy0, rapport de transformation et courants nominaux (I1N ≈ 5,33 A, I2N ≈ 10,6 A)',
                'Explication de la signification physique de chaque élément du schéma de Kapp, du cycle d’hystérésis et des harmoniques de rang 3 dus à la saturation magnétique (lois de Faraday et de Lenz)',
                'Essai à vide : câblage du transformateur, mesures à l’analyseur Chauvin Arnoux (courant enroulé 6 fois autour des pinces pour gagner en précision), vérification de l’équilibre des trois phases, et détermination de m ≈ 0,53, RF ≈ 476 Ω et XP ≈ 230 Ω',
                'Affichage du cycle d’hystérésis du noyau sur l’analyseur',
                'Essai en court-circuit au courant secondaire nominal (10,58 A) : RS ≈ 1,0 Ω et XS ≈ 0,20 Ω'
            ]
        },
        results: {
            en: 'Both tests gave all four elements of the Kapp circuit (RF, XP, RS, XS). The values are consistent with theory, apart from small gaps on the secondary voltages attributed to measurement inaccuracy.',
            fr: 'Les deux essais ont donné les quatre éléments du schéma de Kapp (RF, XP, RS, XS). Les valeurs sont cohérentes avec la théorie, à l’exception de petits écarts sur les tensions secondaires attribués aux imprécisions de mesure.'
        },
        gallery: [
            { src: 'electro-transfo-plaque.jpg', caption: { en: 'Transformer nameplate (4 kVA, 3 × 250 V / 6 × 63 V)', fr: 'Plaque signalétique du transformateur (4 kVA, 3 × 250 V / 6 × 63 V)' } },
            { src: 'electro-transfo-schema-couplage.png', caption: { en: 'Star-star (Yy0) connection diagram', fr: 'Schéma du couplage étoile-étoile (Yy0)' } },
            { src: 'electro-transfo-montage.jpg', caption: { en: 'No-load test setup with the power analyser', fr: 'Montage de l’essai à vide avec l’analyseur de réseau' } },
            { src: 'electro-transfo-analyseur-vide.jpg', caption: { en: 'Values recorded during the no-load test', fr: 'Valeurs relevées lors de l’essai à vide' } },
            { src: 'electro-transfo-hysteresis.jpg', caption: { en: 'Hysteresis cycle of the core on the analyser', fr: 'Cycle d’hystérésis du noyau sur l’analyseur' } },
            { src: 'electro-transfo-court-circuit.jpg', caption: { en: 'Values recorded during the short-circuit test', fr: 'Valeurs relevées lors de l’essai en court-circuit' } }
        ]
    },
    {
        id: 'square-wave-emd-vmd',
        pdf: 'rapport-tp-signal-carre-emd-vmd.pdf',
        category: 'signal',
        icon: 'bx-pulse',
        year: '2026',
        github: '',
        code: true,
        demo: '',
        image: 'signaux-signal-carre-filtre.png',
        imageFit: 'contain',
        tags: ['MATLAB', 'Traitement du signal', 'FFT', 'Filtrage', 'EMD', 'VMD', 'Chirp'],
        title: {
            en: 'Square Wave, Filtering and Time-Frequency Decomposition (EMD, VMD)',
            fr: 'Signal carré, filtrage et décomposition temps-fréquence (EMD, VMD)'
        },
        context: {
            en: 'Polytech Orléans – Signal processing lab work, supervised by Mr. Hervé Lailheugue',
            fr: 'Polytech Orléans – TP de traitement du signal, encadré par M. Hervé Lailheugue'
        },
        summary: {
            en: 'Spectral analysis and filtering of a square wave, then separation of spectral components with classical filtering, EMD and VMD, including a non-stationary audio signal (chirp + cosine) with and without noise.',
            fr: 'Analyse spectrale et filtrage d’un signal carré, puis séparation de composantes spectrales par filtrage classique, EMD et VMD, avec un signal audio non stationnaire (chirp + cosinus) avec et sans bruit.'
        },
        highlights: {
            en: [
                'Exercise 1: generated a ±0.5 V square wave in MATLAB (T = 1 s, fs = 1000 Hz) and showed with the FFT that only odd harmonics are present, decreasing as 1/n (fundamental 2A/π ≈ 0.318 V)',
                'Isolated the 1 Hz fundamental with an ideal band-pass filter in the frequency domain (0.5–1.5 Hz) and recovered it even when the square wave was buried in Gaussian noise (σ² = 1)',
                'Exercise 2: separated two cosines (1 Hz and 5 Hz) with low-pass and band-pass filters, then with EMD (two IMFs) and VMD (K = 2 modes), and discussed mode mixing when frequencies get close',
                'Exercise 3: analysed an audio signal made of a chirp (4 to 12 kHz, fs = 44.1 kHz) plus a 4 kHz cosine: a band-pass filter cannot isolate the cosine because the chirp crosses the same band',
                'Added Gaussian noise to the audio signal and compared the spectra and the filtering results before and after noise'
            ],
            fr: [
                'Exercice 1 : génération d’un signal carré ±0,5 V sous MATLAB (T = 1 s, fs = 1000 Hz) et mise en évidence par FFT des seules harmoniques impaires, décroissantes en 1/n (fondamentale 2A/π ≈ 0,318 V)',
                'Isolement de la fondamentale à 1 Hz par un filtre passe-bande idéal dans le domaine fréquentiel (0,5–1,5 Hz), y compris lorsque le signal carré est noyé dans un bruit gaussien (σ² = 1)',
                'Exercice 2 : séparation de deux cosinusoïdes (1 Hz et 5 Hz) par filtres passe-bas et passe-bande, puis par EMD (deux IMF) et VMD (K = 2 modes), avec discussion du mode mixing quand les fréquences se rapprochent',
                'Exercice 3 : analyse d’un signal audio composé d’un chirp (4 à 12 kHz, fs = 44,1 kHz) et d’une cosinusoïde à 4 kHz : un filtre passe-bande ne peut pas isoler la cosinusoïde car le chirp traverse la même bande',
                'Ajout d’un bruit gaussien au signal audio et comparaison des spectres et des résultats de filtrage avant et après bruit'
            ]
        },
        results: {
            en: 'Classical filtering is simple and effective for stationary signals with well-separated frequencies, even in noise, but it fails on non-stationary or overlapping components, where adaptive methods such as EMD and VMD are more appropriate.',
            fr: 'Le filtrage classique est simple et efficace pour des signaux stationnaires à fréquences bien séparées, même bruités, mais il échoue sur des composantes non stationnaires ou qui se chevauchent, où les méthodes adaptatives comme l’EMD et la VMD sont mieux adaptées.'
        },
        gallery: [
            { src: 'signaux-signal-carre.png', caption: { en: 'Square wave: T = 1 s, amplitude ±0.5 V', fr: 'Signal carré : T = 1 s, amplitude ±0,5 V' } },
            { src: 'signaux-signal-carre-spectre.png', caption: { en: 'Spectrum of the square wave: odd harmonics only', fr: 'Spectre du signal carré : harmoniques impaires uniquement' } },
            { src: 'signaux-signal-carre-filtre.png', caption: { en: 'Square wave and its filtered fundamental (pure 1 Hz sine)', fr: 'Signal carré et sa fondamentale filtrée (sinusoïde pure à 1 Hz)' } },
            { src: 'signaux-signal-carre-bruite.png', caption: { en: 'Noisy square wave (σ² = 1) and result after filtering', fr: 'Signal carré bruité (σ² = 1) et résultat après filtrage' } },
            { src: 'signaux-separation-composantes.png', caption: { en: 'Separation of the 1 Hz and 5 Hz components', fr: 'Séparation des composantes à 1 Hz et 5 Hz' } },
            { src: 'signaux-chirp-filtrage.png', caption: { en: 'Chirp + 4 kHz cosine: the band-pass filter keeps part of the chirp', fr: 'Chirp + cosinusoïde à 4 kHz : le passe-bande conserve une partie du chirp' } },
            { src: 'signaux-chirp-bruit-resultat.png', caption: { en: 'Audio signal: noisy signal and filtering results with and without noise', fr: 'Signal audio : signal bruité et résultats du filtrage sans et avec bruit' } }
        ]
    },
    {
        id: 'fsk-demodulation-matlab',
        pdf: 'rapport-tp-demodulation-fsk.pdf',
        category: 'signal',
        icon: 'bx-pulse',
        year: '2025',
        github: '',
        code: true,
        demo: '',
        image: 'signaux-fsk-spectre.png',
        imageFit: 'contain',
        tags: ['MATLAB', 'Modulation FSK', 'Filtre FIR', 'Détection d’enveloppe', 'Taux d’erreur binaire', 'Traitement du signal'],
        title: {
            en: 'Recovering a Noisy Binary Signal: FSK Demodulation in MATLAB',
            fr: 'Récupération d’un signal binaire bruité : démodulation FSK sous MATLAB'
        },
        context: {
            en: 'Polytech Orléans – Signal processing lab work, supervised by Mrs. Tinhinane Mehdi',
            fr: 'Polytech Orléans – TP de traitement du signal, encadré par Mme Tinhinane Mehdi'
        },
        summary: {
            en: 'Complete FSK demodulation chain on a noisy 500-bit message: spectral analysis, FIR band-pass filtering, envelope detection and bit-by-bit decision, with a 0 % bit error rate.',
            fr: 'Chaîne complète de démodulation FSK d’un message bruité de 500 bits : analyse spectrale, filtrage passe-bande FIR, détection d’enveloppe et décision bit à bit, avec un taux d’erreur binaire nul.'
        },
        highlights: {
            en: [
                'Displayed the noisy signal (500 bits, 999,500 samples, Fs = 1999 Hz): the message is impossible to read in the time domain',
                'Located the two FSK frequencies on the power spectrum with signalAnalyzer: f0 ≈ 277 Hz and f1 ≈ 522 Hz',
                'Designed two FIR band-pass filters (fir1, order 50, ±50 Hz) around f0 and f1 and checked that the two filtered signals are complementary',
                'Detected the envelopes with the absolute value followed by a moving average over one bit (1999 samples)',
                'Decided each bit by comparing the mean envelopes and computed the bit error rate: 0 errors out of 500 bits (0.00 %); spotted and corrected an inverted encoding convention (f0 codes bit 1, f1 codes bit 0)'
            ],
            fr: [
                'Affichage du signal bruité (500 bits, 999 500 échantillons, Fs = 1999 Hz) : le message est illisible dans le domaine temporel',
                'Repérage des deux fréquences FSK sur le spectre de puissance avec signalAnalyzer : f0 ≈ 277 Hz et f1 ≈ 522 Hz',
                'Conception de deux filtres passe-bande FIR (fir1, ordre 50, ±50 Hz) autour de f0 et f1 et vérification que les deux signaux filtrés sont complémentaires',
                'Détection des enveloppes par valeur absolue puis moyenne glissante sur la durée d’un bit (1999 échantillons)',
                'Décision bit à bit par comparaison des enveloppes moyennes et calcul du taux d’erreur binaire : 0 erreur sur 500 bits (0,00 %) ; détection et correction d’une convention de codage inversée (f0 code le bit 1, f1 code le bit 0)'
            ]
        },
        results: {
            en: 'The 500-bit message was recovered without any error from a signal that looked like pure noise: the bit error rate is 0.00 %.',
            fr: 'Le message de 500 bits a été récupéré sans aucune erreur à partir d’un signal qui ressemblait à du bruit pur : le taux d’erreur binaire est de 0,00 %.'
        },
        gallery: [
            { src: 'signaux-fsk-signal-bruite.png', caption: { en: 'Noisy signal, first 2 seconds', fr: 'Signal bruité, 2 premières secondes' } },
            { src: 'signaux-fsk-spectre.png', caption: { en: 'Spectrum of the noisy signal: two peaks at f0 and f1', fr: 'Spectre du signal bruité : deux pics à f0 et f1' } },
            { src: 'signaux-fsk-filtres.png', caption: { en: 'Signals filtered around f0 and f1', fr: 'Signaux filtrés autour de f0 et f1' } },
            { src: 'signaux-fsk-enveloppes.png', caption: { en: 'Smoothed envelopes of f0 and f1', fr: 'Enveloppes lissées de f0 et f1' } },
            { src: 'signaux-fsk-message.png', caption: { en: 'Original message (red) and reconstructed message (blue)', fr: 'Message original (rouge) et message reconstruit (bleu)' } }
        ]
    }
];
