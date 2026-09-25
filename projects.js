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
        id: 'obstacle-avoidance-robot',
        category: 'robotics',
        icon: 'bx-radar',
        year: '2025 – 2026',
        github: '',
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
        tags: ['PLC', 'PL7 Pro', 'Grafcet (SFC)', 'Ladder'],
        title: {
            en: 'Robotic Arm Control with a PLC (CLIMAX)',
            fr: 'Commande d’un bras robotique par automate (CLIMAX)'
        },
        context: {
            en: 'Polytech Orléans – Industrial computing lab (M1)',
            fr: 'Polytech Orléans – TP d’informatique industrielle (M1)'
        },
        summary: {
            en: 'Controlling a robotic arm with a programmable logic controller, written in Grafcet (SFC) and Ladder.',
            fr: 'Commande d’un bras robotique par un automate programmable, en Grafcet (SFC) et en Ladder.'
        },
        highlights: {
            en: [
                'Programmed the PLC with PL7 Pro',
                'Described the operating sequence in Grafcet (SFC)',
                'Implemented the logic in Ladder and tested it on the arm'
            ],
            fr: [
                "Programmation de l'automate avec PL7 Pro",
                'Description du cycle de fonctionnement en Grafcet (SFC)',
                'Implémentation de la logique en Ladder et tests sur le bras'
            ]
        }
    },
    {
        id: 'greenhouse-monitoring',
        category: 'software',
        icon: 'bx-leaf',
        year: '2022',
        github: '',
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
