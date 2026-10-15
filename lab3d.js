/* =========================================================
   Robot Lab: an industrial cell with a six-axis cobot
   ---------------------------------------------------------
   - 3D scene (Three.js, see /vendor): a conveyor feeds cartons, the cobot
     takes them with a vacuum cup and stacks them on a pallet.
   - Live kinematic diagram: frames, modified Denavit-Hartenberg table,
     forward kinematics T0E, Jacobian and singularity indicator.
   Lengths are in scene units: 1 unit = 100 mm.
   Model built from the kinematic diagram of the FANUC CRX-10iA report:
   D3 = 540 mm, r4 = 540 mm, r5 ~ 150 mm, flange 160 mm.
   ========================================================= */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/OrbitControls.js';

const root = document.getElementById('lab3d');
const kinRoot = document.getElementById('labkin');

const lang = () => (document.documentElement.lang === 'fr' ? 'fr' : 'en');

const TEXT = {
    hint: { en: 'Drag to orbit · Ctrl + scroll to zoom', fr: 'Glisser pour tourner · Ctrl + molette pour zoomer' },
    tcp: { en: 'TCP · absolute frame (mm)', fr: 'TCP · repère absolu (mm)' },
    vacuum: { en: 'Vacuum 102', fr: 'Ventouse 102' },
    on: { en: 'ON', fr: 'ON' },
    off: { en: 'OFF', fr: 'OFF' },
    program: { en: 'Program', fr: 'Programme' },
    part: { en: 'Carton', fr: 'Carton' },
    play: { en: 'Play cycle', fr: 'Lancer le cycle' },
    stop: { en: 'Stop', fr: 'Arrêter' },
    reset: { en: 'Reset', fr: 'Réinitialiser' },
    override: { en: 'Override', fr: 'Override' },
    jog: { en: 'JOG · joint space', fr: 'JOG · espace articulaire' },
    lead: {
        en: 'Take the controls: drag a slider to move one joint, just like the + / − keys on the teach pendant. Or press Play: the cobot takes cartons from the conveyor and stacks them on the pallet.',
        fr: 'Prenez les commandes : faites glisser un curseur pour déplacer une articulation, comme les touches + / − du pupitre. Ou lancez le cycle : le cobot prend les cartons sur le convoyeur et les empile sur la palette.'
    },
    note: {
        en: 'Visual model built from the kinematic diagram of the CRX-10iA report: D3 = 540 mm, r4 = 540 mm, r5 ≈ 150 mm, flange 160 mm (shoulder height r1 = 245 mm assumed).',
        fr: 'Modèle visuel construit d’après le schéma cinématique du rapport CRX-10iA : D3 = 540 mm, r4 = 540 mm, r5 ≈ 150 mm, bride 160 mm (hauteur d’épaule r1 = 245 mm supposée).'
    },
    nowebgl: {
        en: 'The 3D view needs WebGL, which is not available in this browser.',
        fr: 'La vue 3D nécessite WebGL, qui n’est pas disponible dans ce navigateur.'
    },
    joints: {
        en: ['Base', 'Shoulder', 'Elbow', 'Wrist 1', 'Wrist 2', 'Wrist 3'],
        fr: ['Base', 'Épaule', 'Coude', 'Poignet 1', 'Poignet 2', 'Poignet 3']
    },
    // kinematic diagram
    kinTitle: { en: 'Kinematic diagram', fr: 'Schéma cinématique' },
    kinLead: {
        en: 'Everything needed to compute and program a six-axis arm: frames, Denavit-Hartenberg parameters, forward kinematics, Jacobian and singularities. It follows the robot above in real time.',
        fr: 'Tout ce qu’il faut pour calculer et programmer un bras six axes : repères, paramètres de Denavit-Hartenberg, modèle géométrique direct, jacobienne et singularités. Il suit le robot ci-dessus en temps réel.'
    },
    kinFig: { en: 'Side view in the plane of the arm', fr: 'Vue de côté dans le plan du bras' },
    showFrame: { en: 'Frame shown', fr: 'Repère affiché' },
    planeAt: { en: 'Arm plane at θ1 =', fr: 'Plan du bras à θ1 =' },
    reachLbl: { en: 'reach 1240 mm', fr: 'portée 1240 mm' },
    dhTitle: { en: 'Modified Denavit-Hartenberg parameters (Khalil-Kleinfinger)', fr: 'Paramètres de Denavit-Hartenberg modifiés (Khalil-Kleinfinger)' },
    now: { en: 'now', fr: 'actuel' },
    t0eTitle: { en: 'Forward kinematics · T0E (mm)', fr: 'Modèle géométrique direct · T0E (mm)' },
    posTitle: { en: 'Tool position (mm)', fr: 'Position de l’outil (mm)' },
    oriTitle: { en: 'Orientation ZYX (°)', fr: 'Orientation ZYX (°)' },
    jacTitle: { en: 'Jacobian J (6 × 6) w.r.t. the joints q', fr: 'Jacobienne J (6 × 6) par rapport aux articulations q' },
    jacUnits: { en: 'rows 1-3: mm/rad · rows 4-6: rad/rad', fr: 'lignes 1-3 : mm/rad · lignes 4-6 : rad/rad' },
    manip: { en: 'Manipulability', fr: 'Manipulabilité' },
    reachUsed: { en: 'Reach used', fr: 'Portée utilisée' },
    okSing: { en: 'Far from singularities', fr: 'Loin des singularités' },
    nearSing: { en: 'Near a singularity', fr: 'Proche d’une singularité' },
    isSing: { en: 'Singular configuration', fr: 'Configuration singulière' },
    wristAl: { en: 'wrist axes aligned (q5 ≈ 0)', fr: 'axes du poignet alignés (q5 ≈ 0)' },
    elbowSt: { en: 'arm fully stretched', fr: 'bras tendu' },
    useTitle: { en: 'What you can compute with it', fr: 'Ce que l’on peut calculer avec' },
    f1t: { en: 'Change of frame', fr: 'Changement de repère' },
    f2t: { en: 'Forward kinematics', fr: 'Modèle géométrique direct' },
    f2d: { en: 'Position and orientation of the tool from the six joint angles.', fr: 'Position et orientation de l’outil à partir des six angles articulaires.' },
    f3t: { en: 'Differential kinematics', fr: 'Modèle cinématique' },
    f3d: { en: 'Tool speed from joint speeds, and joint torques from a force at the tool: τ = Jᵀ F.', fr: 'Vitesse de l’outil à partir des vitesses articulaires, et couples articulaires pour une force à l’outil : τ = Jᵀ F.' },
    f4t: { en: 'Inverse kinematics', fr: 'Modèle géométrique inverse' },
    f4d: { en: 'No closed form here: the wrist is not spherical (r5 ≠ 0). The cycle above uses damped least squares:', fr: 'Pas de forme fermée ici : le poignet n’est pas sphérique (r5 ≠ 0). Le cycle ci-dessus utilise les moindres carrés amortis :' },
    f5t: { en: 'Singularities and workspace', fr: 'Singularités et espace de travail' },
    f5d: { en: 'Singular when det J = 0 (wrist aligned, arm stretched). Reach ≈ D3 + r4 + 160 mm = 1240 mm.', fr: 'Singulier quand det J = 0 (poignet aligné, bras tendu). Portée ≈ D3 + r4 + 160 mm = 1240 mm.' },
    f6t: { en: 'Joint conventions', fr: 'Conventions articulaires' },
    f6d: { en: 'Pendant angles q → Denavit-Hartenberg angles θ:', fr: 'Angles du pupitre q → angles de Denavit-Hartenberg θ :' },
    kinNote: {
        en: 'r1 = 245 mm (shoulder height) and rE = 210 mm (160 mm flange + cup) are assumed; D3, r4 and r5 come from the report.',
        fr: 'r1 = 245 mm (hauteur d’épaule) et rE = 210 mm (bride de 160 mm + ventouse) sont supposés ; D3, r4 et r5 viennent du rapport.'
    }
};

// teach-pendant style program, run once per carton
const PROGRAM = [
    'Joint P1', 'Linear P2', 'I/O 102 = ON', 'Wait t', 'Joint P1',
    'Joint P3', 'Linear P4', 'I/O 102 = OFF', 'Joint P3'
];

const HOME = [0, 0, 0, 0, -90, 0];
const LIMITS = [[-180, 180], [-135, 135], [-145, 145], [-180, 180], [-120, 120], [-180, 180]];
const DEG = Math.PI / 180;
const NCARTONS = 6;

function webglOk() {
    try {
        const c = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
    } catch (e) { return false; }
}

/* ---------- Denavit-Hartenberg model (Khalil-Kleinfinger), in mm ---------- */
const DH = {
    alpha: [0, Math.PI / 2, 0, -Math.PI / 2, Math.PI / 2, -Math.PI / 2],
    d: [0, 0, 540, 0, 0, 0],
    r: [245, 0, 0, 540, 150, 0],
    rE: 210
};
const thetaOf = q => [q[0], 90 - q[1], 180 - q[2], q[3], q[4], q[5]].map(x => x * DEG);
const I4 = () => [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
function mul4(A, B) {
    const C = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { let s = 0; for (let k = 0; k < 4; k++) s += A[i][k] * B[k][j]; C[i][j] = s; }
    return C;
}
function tDH(al, d, th, r) {
    const ca = Math.cos(al), sa = Math.sin(al), ct = Math.cos(th), st = Math.sin(th);
    return [[ct, -st, 0, d], [ca * st, ca * ct, -sa, -r * sa], [sa * st, sa * ct, ca, r * ca], [0, 0, 0, 1]];
}
// F[0..6] are the frames R0..R6 in the base frame, E the tool frame
function dhFrames(q) {
    const th = thetaOf(q), F = [I4()];
    for (let j = 0; j < 6; j++) F.push(mul4(F[j], tDH(DH.alpha[j], DH.d[j], th[j], DH.r[j])));
    const E = mul4(F[6], [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, DH.rE], [0, 0, 0, 1]]);
    return { F, E, th };
}
const colv = (M, c) => [M[0][c], M[1][c], M[2][c]];
const cross3 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
function jacobian(fr) {
    const pE = colv(fr.E, 3), J = [[], [], [], [], [], []];
    for (let j = 1; j <= 6; j++) {
        const z = colv(fr.F[j], 2), o = colv(fr.F[j], 3);
        const v = cross3(z, [pE[0] - o[0], pE[1] - o[1], pE[2] - o[2]]);
        const s = (j === 2 || j === 3) ? -1 : 1;                   // theta2 = 90 - q2, theta3 = 180 - q3
        for (let i = 0; i < 3; i++) { J[i][j - 1] = s * v[i]; J[i + 3][j - 1] = s * z[i]; }
    }
    return J;
}
function det6(M) {
    const n = M.length, A = M.map(r => r.slice());
    let d = 1;
    for (let c = 0; c < n; c++) {
        let p = c;
        for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
        if (Math.abs(A[p][c]) < 1e-12) return 0;
        if (p !== c) { [A[c], A[p]] = [A[p], A[c]]; d = -d; }
        d *= A[c][c];
        for (let r = c + 1; r < n; r++) { const f = A[r][c] / A[c][c]; for (let k = c; k < n; k++) A[r][k] -= f * A[c][k]; }
    }
    return d;
}

if (root) {
    if (!webglOk()) {
        root.innerHTML = `<p class="lab3d-fallback">${TEXT.nowebgl[lang()]}</p>`;
    } else {
        init();
    }
}

function init() {
    /* ---------- markup ---------- */
    root.innerHTML = `
        <div class="lab3d-stage">
            <div class="lab3d-hint" data-t="hint"></div>
            <div class="lab3d-tcp">
                <h4 data-t="tcp"></h4>
                <dl>
                    <div><dt>X</dt><dd id="lab-x">0</dd></div>
                    <div><dt>Y</dt><dd id="lab-y">0</dd></div>
                    <div><dt>Z</dt><dd id="lab-z">0</dd></div>
                </dl>
                <div class="lab3d-vac"><span data-t="vacuum"></span><b id="lab-vac">OFF</b></div>
            </div>
            <div class="lab3d-prog">
                <h4><span data-t="program"></span> · <span data-t="part"></span> <b id="lab-part">1 / ${NCARTONS}</b></h4>
                <ol id="lab-prog">${PROGRAM.map((l, i) => `<li data-i="${i}"><span>${i + 1}</span>${l}</li>`).join('')}</ol>
            </div>
            <div class="lab3d-actions">
                <button type="button" class="lab3d-btn" id="lab-play"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5v11l9-5.5z"/></svg><span data-t="play"></span></button>
                <button type="button" class="lab3d-btn" id="lab-reset"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2.5a5.5 5.5 0 1 0 5.4 6.5h-1.6A3.9 3.9 0 1 1 8 4.1V6.5l3.6-2.9L8 .7z"/></svg><span data-t="reset"></span></button>
            </div>
            <div class="lab3d-override">
                <span data-t="override"></span>
                <button type="button" class="lab3d-chip" data-ov="30">30%</button>
                <button type="button" class="lab3d-chip active" data-ov="60">60%</button>
                <button type="button" class="lab3d-chip" data-ov="100">100%</button>
            </div>
        </div>
        <aside class="lab3d-panel">
            <h3 data-t="jog"></h3>
            <p class="lab3d-lead" data-t="lead"></p>
            <div id="lab-sliders"></div>
            <p class="lab3d-note" data-t="note"></p>
        </aside>`;
    const stage = root.querySelector('.lab3d-stage');

    /* ---------- renderer, camera, lights ---------- */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.className = 'lab3d-canvas';
    stage.prepend(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1.5, 0.1, 200);
    camera.position.set(-17.6, 15.3, 23.3);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0.1, 2.2, 0.3);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enableZoom = false;                       // zoom only with Ctrl + scroll, so the page keeps scrolling
    controls.enablePan = false;
    controls.minPolarAngle = 0.25;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.update();
    renderer.domElement.style.touchAction = 'pan-y';   // vertical swipes still scroll the page on phones
    renderer.domElement.addEventListener('wheel', e => {
        if (!e.ctrlKey) return;
        e.preventDefault();
        const off = camera.position.clone().sub(controls.target);
        const d = Math.min(46, Math.max(10, off.length() * Math.exp(e.deltaY * 0.0015)));
        camera.position.copy(controls.target).add(off.setLength(d));
    }, { passive: false });

    const hemi = new THREE.HemisphereLight(0xffffff, 0x9aa0ab, 1.0);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xffffff, 1.8);
    sun.position.set(7, 15, 9);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 45 });
    sun.shadow.bias = -0.0004;
    scene.add(sun);

    /* ---------- materials and platform ---------- */
    const mat = (color, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.5, metalness: 0.05 }, o));
    const matLink = mat(0xece8fa, { roughness: 0.42 });
    const matJoint = mat(0x474a5c, { roughness: 0.5, metalness: 0.35 });
    const matGlow = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.2, roughness: 0.3 });
    const matCup = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.35 });
    const matFrame = mat(0x555555, { roughness: 0.6, metalness: 0.3 });
    const matStop = mat(0x777777, { roughness: 0.5, metalness: 0.2 });
    const matPallet = mat(0x999999, { roughness: 0.85 });
    const matCarton = mat(0xcccccc, { roughness: 0.8 });
    const matTape = mat(0x888888, { roughness: 0.6 });

    const disc = new THREE.Mesh(new THREE.CylinderGeometry(14, 14, 0.5, 96), mat(0x3c3f4f, { roughness: 0.9 }));
    disc.position.y = -0.25;
    disc.receiveShadow = true;
    scene.add(disc);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(14, 0.11, 12, 140), matGlow);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.01;
    scene.add(rim);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x888888, transparent: true, opacity: 0.3 });
    [3, 6, 9, 12].forEach(r => {
        const pts = [];
        for (let i = 0; i < 129; i++) pts.push(new THREE.Vector3(Math.cos(i / 128 * Math.PI * 2) * r, 0.015, Math.sin(i / 128 * Math.PI * 2) * r));
        scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat));
    });
    for (let i = 0; i < 12; i++) {
        const a = i / 12 * Math.PI * 2;
        scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(Math.cos(a) * 1.3, 0.015, Math.sin(a) * 1.3), new THREE.Vector3(Math.cos(a) * 14, 0.015, Math.sin(a) * 14)]), lineMat));
    }

    /* ---------- the robot: J1..J6 ---------- */
    const D3 = 5.4, R4 = 5.4, R5 = 1.5, FLANGE = 1.6, H1 = 2.45, TOOL = 2.1;
    const cyl = (r, h, m, axis) => {
        const g = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 40), m);
        if (axis === 'z') g.rotation.x = Math.PI / 2;
        if (axis === 'x') g.rotation.z = Math.PI / 2;
        g.castShadow = true; g.receiveShadow = true;
        return g;
    };
    const place = (m, x, y, z) => { m.position.set(x, y, z); return m; };

    const robot = new THREE.Group();
    scene.add(robot);
    robot.add(place(cyl(1.0, 0.18, matJoint), 0, 0.09, 0));
    const baseRing = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.05, 10, 60), matGlow);
    baseRing.rotation.x = Math.PI / 2; baseRing.position.y = 0.2;
    robot.add(baseRing);

    const g1 = new THREE.Group(); robot.add(g1);                       // J1: about the vertical axis
    g1.add(place(cyl(0.85, H1 - 0.7, matLink), 0, 0.2 + (H1 - 0.7) / 2, 0));
    g1.add(place(cyl(0.85, 1.7, matJoint, 'z'), 0, H1, 0));            // J2 housing
    const g2 = new THREE.Group(); g2.position.set(0, H1, 0); g1.add(g2); // J2: shoulder
    g2.add(place(cyl(0.58, D3, matLink), 0, D3 / 2, 0));               // upper arm
    g2.add(place(cyl(0.72, 1.5, matJoint, 'z'), 0, D3, 0));            // J3 housing
    const g3 = new THREE.Group(); g3.position.set(0, D3, 0); g2.add(g3); // J3: elbow
    g3.add(place(cyl(0.48, R4, matLink, 'x'), R4 / 2, 0, 0));          // forearm
    const g4 = new THREE.Group(); g4.position.set(R4, 0, 0); g3.add(g4); // J4: forearm roll
    g4.add(place(cyl(0.58, 1.0, matJoint, 'z'), 0, 0, 0));             // J5 housing
    const g5 = new THREE.Group(); g4.add(g5);                          // J5: wrist pitch
    const wrist = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.75, R5), matLink);
    wrist.position.set(0, 0, R5 / 2); wrist.castShadow = true; g5.add(wrist);
    g5.add(place(cyl(0.45, 0.8, matJoint, 'x'), 0, 0, R5));            // J6 housing
    const g6 = new THREE.Group(); g6.position.set(0, 0, R5); g5.add(g6); // J6: tool roll
    g6.add(place(cyl(0.34, FLANGE - 0.15, matLink, 'x'), (FLANGE - 0.15) / 2 + 0.05, 0, 0));
    g6.add(place(cyl(0.42, 0.14, matJoint, 'x'), FLANGE, 0, 0));       // flange
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.05, 10, 40), matGlow);
    ring.rotation.y = Math.PI / 2; ring.position.set(FLANGE + 0.12, 0, 0);
    g6.add(ring);
    const cup = new THREE.Mesh(new THREE.ConeGeometry(0.3, TOOL - FLANGE - 0.1, 28), matCup);
    cup.rotation.z = -Math.PI / 2;                                     // tip towards +X
    cup.position.set(FLANGE + 0.12 + (TOOL - FLANGE - 0.1) / 2, 0, 0);
    cup.castShadow = true;
    g6.add(cup);
    const tcp = new THREE.Object3D(); tcp.position.set(TOOL, 0, 0); g6.add(tcp);

    const q = HOME.slice();
    function applyQ(v) {
        g1.rotation.y = v[0] * DEG;
        g2.rotation.z = -v[1] * DEG;
        g3.rotation.z = -v[2] * DEG;
        g4.rotation.x = v[3] * DEG;
        g5.rotation.z = v[4] * DEG;
        g6.rotation.x = v[5] * DEG;
    }
    applyQ(q);
    robot.updateMatrixWorld(true);

    /* ---------- the cell: conveyor with cartons, and a pallet ---------- */
    const CL = 2.0, CH = 1.0, CW = 1.5;                    // carton: length, height, width
    const HB = 1.2;                                        // height of the belt surface
    const PAL_TOP = 0.4, PITCH_Q = 2.9, PITCH_P = 1.6;
    const PSI_C = Math.atan2(0.8, 0.6);                    // conveyor heading (cartons travel away from the camera)
    const PSI_P = 2.38;                                    // pallet heading
    const box = (w, h, d, m, x, y, z, shadow = true) => {
        const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
        b.position.set(x, y, z); b.castShadow = shadow; b.receiveShadow = true;
        return b;
    };

    // conveyor
    const conv = new THREE.Group();
    conv.position.set(2.4, 0, 5.2);
    conv.rotation.y = PSI_C;
    scene.add(conv);
    const BEL_X0 = -9.4, BEL_X1 = 1.6, BEL_W = 2.2, BEL_LEN = BEL_X1 - BEL_X0, BEL_CX = (BEL_X0 + BEL_X1) / 2;
    conv.add(box(BEL_LEN, 0.2, BEL_W + 0.1, matFrame, BEL_CX, HB - 0.1, 0));
    const beltTex = new THREE.CanvasTexture(document.createElement('canvas'));
    beltTex.wrapS = THREE.RepeatWrapping; beltTex.wrapT = THREE.RepeatWrapping;
    const BELT_PERIOD = 0.9;
    beltTex.repeat.set(BEL_LEN / BELT_PERIOD, 1);
    const beltTop = new THREE.Mesh(new THREE.PlaneGeometry(BEL_LEN, BEL_W), new THREE.MeshStandardMaterial({ map: beltTex, roughness: 0.95 }));
    beltTop.rotation.x = -Math.PI / 2; beltTop.position.set(BEL_CX, HB + 0.004, 0); beltTop.receiveShadow = true;
    conv.add(beltTop);
    [-1, 1].forEach(s => conv.add(box(BEL_LEN, 0.5, 0.14, matFrame, BEL_CX, HB - 0.25, s * (BEL_W / 2 + 0.12))));
    [BEL_X0 + 0.3, -3.8, BEL_X1 - 0.4].forEach(x => [-1, 1].forEach(s => conv.add(box(0.16, HB - 0.5, 0.16, matFrame, x, (HB - 0.5) / 2, s * (BEL_W / 2 + 0.05)))));
    [BEL_X0, BEL_X1].forEach(x => { const r = cyl(0.22, BEL_W + 0.2, matJoint, 'z'); r.position.set(x, HB - 0.22, 0); conv.add(r); });
    conv.add(box(0.14, 0.55, BEL_W - 0.2, matStop, 1.3, HB + 0.275, 0));   // stop plate at the pick point

    // pallet
    const pallet = new THREE.Group();
    pallet.position.set(-4.2, 0, -4.1);
    pallet.rotation.y = PSI_P;
    scene.add(pallet);
    [-1.1, 0, 1.1].forEach(x => pallet.add(box(0.45, 0.28, 4.9, matPallet, x, 0.14, 0)));
    [-1.8, 0, 1.8].forEach(z => pallet.add(box(3.0, 0.1, 1.2, matPallet, 0, 0.05, z)));
    [-1.85, -0.62, 0.62, 1.85].forEach(z => pallet.add(box(3.0, 0.1, 0.95, matPallet, 0, 0.35, z)));

    // cartons
    const cartons = [];
    for (let k = 0; k < NCARTONS; k++) {
        const c = box(CL, CH, CW, matCarton, 0, 0, 0);
        c.add(box(CL + 0.02, 0.014, 0.3, matTape, 0, CH / 2 + 0.002, 0, false));     // tape on top
        c.add(box(0.014, 0.4, 0.7, matTape, CL / 2 + 0.001, 0.05, 0, false));        // label on the side
        scene.add(c);
        cartons.push(c);
    }
    let picked = 0;                                         // cartons already taken by the robot
    const beltPoint = (x, y = HB + CH / 2) => conv.localToWorld(new THREE.Vector3(x, y, 0));
    const slotPoint = (k, lift = 0) => {
        const layer = Math.floor(k / 3), i = k % 3;
        return pallet.localToWorld(new THREE.Vector3(0, PAL_TOP + CH * (layer + 0.5) + lift, (i - 1) * PITCH_P));
    };
    function layoutBelt(frac = 1) {                        // frac < 1: the queue is moving one place forward
        cartons.forEach((c, k) => {
            if (k < picked) return;
            const moving = frac < 1;
            const p = k - picked + (moving ? 1 : 0);
            const x = -PITCH_Q * (p - (moving ? frac : 0));
            c.visible = p <= 3;
            c.position.copy(beltPoint(x));
            c.rotation.set(0, PSI_C, 0);
        });
    }
    function resetCartons() {
        picked = 0;
        cartons.forEach(c => { scene.attach(c); c.visible = true; });
        layoutBelt(1);
    }
    resetCartons();

    /* ---------- theme: follow the site (light / dark), silver and charcoal ---------- */
    const PALETTES = {
        light: {
            hemi: [0xffffff, 0x9aa0ab, 1.1], sun: 1.7,
            disc: 0xd2d5dc, lines: 0x3a3e47, lineOpacity: 0.28,
            glow: 0x3a3e47, glowEmissive: 0x3a3e47, glowI: 0.12,
            link: 0xf6f7f9, joint: 0x3a3e47, cup: 0x2e3139,
            frame: 0x6c717e, belt: ['#3f434d', '#4a4f5b'], stop: 0x9aa0ab,
            pallet: 0xb4aa98, carton: 0xd8d0c2, tape: 0x9f9788
        },
        dark: {
            hemi: [0xdfe2e8, 0x1b1e2b, 0.9], sun: 1.7,
            disc: 0x1d1d28, lines: 0xdfe2e8, lineOpacity: 0.16,
            glow: 0xdfe2e8, glowEmissive: 0xdfe2e8, glowI: 0.35,
            link: 0xe9eaee, joint: 0x3a3d4a, cup: 0xdfe2e8,
            frame: 0x4a4e5c, belt: ['#14141b', '#1c1c25'], stop: 0x6c717e,
            pallet: 0x6a6558, carton: 0xb9b2a4, tape: 0x8b8578
        }
    };
    function paintBelt(pal) {
        const c = beltTex.image, g = c.getContext('2d');
        c.width = 128; c.height = 32;
        g.fillStyle = pal[0]; g.fillRect(0, 0, 128, 32);
        g.fillStyle = pal[1]; g.fillRect(0, 0, 20, 32);
        beltTex.needsUpdate = true;
    }
    function applyTheme() {
        const P = PALETTES[document.documentElement.classList.contains('light-mode') ? 'light' : 'dark'];
        hemi.color.set(P.hemi[0]); hemi.groundColor.set(P.hemi[1]); hemi.intensity = P.hemi[2];
        sun.intensity = P.sun;
        disc.material.color.set(P.disc);
        lineMat.color.set(P.lines); lineMat.opacity = P.lineOpacity;
        matGlow.color.set(P.glow); matGlow.emissive.set(P.glowEmissive); matGlow.emissiveIntensity = P.glowI;
        matLink.color.set(P.link); matJoint.color.set(P.joint); matCup.color.set(P.cup);
        matFrame.color.set(P.frame); matStop.color.set(P.stop);
        matPallet.color.set(P.pallet); matCarton.color.set(P.carton); matTape.color.set(P.tape);
        paintBelt(P.belt);
    }
    applyTheme();
    new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    /* ---------- kinematics helpers (scene model) ---------- */
    const vA = new THREE.Vector3(), vB = new THREE.Vector3();
    const DOWN = new THREE.Vector3(0, -1, 0);
    const tcpPos = (out = new THREE.Vector3()) => { robot.updateMatrixWorld(true); return tcp.getWorldPosition(out); };
    const toolAxis = (out = new THREE.Vector3()) => out.set(1, 0, 0).transformDirection(g6.matrixWorld);
    const clampJ = v => v.map((x, i) => Math.min(LIMITS[i][1], Math.max(LIMITS[i][0], x)));
    const wrapPi = a => Math.atan2(Math.sin(a), Math.cos(a));

    function ikError(v, target, out) {
        applyQ(v);
        const p = tcpPos(vA), a = toolAxis(vB);
        out[0] = target.x - p.x; out[1] = target.y - p.y; out[2] = target.z - p.z;
        const cx = a.y * DOWN.z - a.z * DOWN.y, cy = a.z * DOWN.x - a.x * DOWN.z, cz = a.x * DOWN.y - a.y * DOWN.x;
        out[3] = cx * 2; out[4] = cy * 2; out[5] = cz * 2;                // keep the tool axis pointing down
        return Math.hypot(...out);
    }
    function solve6(A, b) {                                                // 6x6 Gaussian elimination
        const n = 6, M = A.map((r, i) => [...r, b[i]]);
        for (let c = 0; c < n; c++) {
            let piv = c;
            for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[piv][c])) piv = r;
            [M[c], M[piv]] = [M[piv], M[c]];
            const d = M[c][c] || 1e-12;
            for (let r = c + 1; r < n; r++) {
                const f = M[r][c] / d;
                for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
            }
        }
        const x = new Array(n).fill(0);
        for (let r = n - 1; r >= 0; r--) {
            let s = M[r][n];
            for (let k = r + 1; k < n; k++) s -= M[r][k] * x[k];
            x[r] = s / (M[r][r] || 1e-12);
        }
        return x;
    }
    // damped least squares IK: tool tip at `target` (world), tool axis down
    function ik(target, seed, iters = 80) {
        let v = clampJ(seed.slice());
        const e = new Array(6), e2 = new Array(6), J = [[], [], [], [], [], []];
        let err = ikError(v, target, e);
        for (let it = 0; it < iters && err > 0.002; it++) {
            for (let c = 0; c < 6; c++) {
                const w = v.slice(); w[c] += 0.5;
                ikError(w, target, e2);
                for (let r = 0; r < 6; r++) J[r][c] = (e[r] - e2[r]) / (0.5 * DEG);   // d f / d q (per rad)
            }
            ikError(v, target, e);
            const lam = 0.12;
            const JJt = J.map((ri, a) => J.map((rj, b) => ri.reduce((s, x, k) => s + x * rj[k], 0) + (a === b ? lam * lam : 0)));
            const y = solve6(JJt, e);
            const dq = [0, 1, 2, 3, 4, 5].map(c => J.reduce((s, row, r) => s + row[c] * y[r], 0));
            const m = Math.max(...dq.map(Math.abs));
            const k = m > 0.25 ? 0.25 / m : 1;
            v = clampJ(v.map((x, c) => x + dq[c] * k / DEG));
            err = ikError(v, target, e);
        }
        return { q: v, err };
    }
    function ikBest(target, seeds) {
        let best = null;
        for (const s of seeds) {
            const r = ik(target, s);
            if (!best || r.err < best.err) best = r;
            if (r.err < 0.004) break;
        }
        return best;
    }
    // heading of the tool (about the vertical axis) and the J6 value that gives a wanted heading
    function toolYaw(v) {
        applyQ(v); robot.updateMatrixWorld(true);
        const y = vA.set(0, 1, 0).transformDirection(g6.matrixWorld);
        return Math.atan2(-y.z, y.x);
    }
    function withYaw(v, wanted) {
        const a = toolYaw(v), w = v.slice();
        w[5] += 10;
        const slope = wrapPi(toolYaw(w) - a) / (10 * DEG);
        let j6 = v[5] + (wrapPi(wanted - a) / slope) / DEG;
        j6 = ((j6 + 90) % 180 + 180) % 180 - 90;                           // a carton looks the same turned by 180 degrees
        const out = v.slice(); out[5] = j6;
        return out;
    }

    /* ---------- program poses ---------- */
    const parts = [];
    let pickPose = null;
    function buildParts() {
        const seedFor = (p, base) => {
            const j1 = Math.atan2(-p.z, p.x) / DEG;
            return [[j1, 35, 70, 0, -105, 0], [j1, 55, 40, 0, -85, 0], [j1, 20, 95, 0, -115, 0], base];
        };
        const lift = 2.4;
        const tipPick = beltPoint(0, HB + CH);
        const P2 = ikBest(tipPick, seedFor(tipPick, HOME));
        const P1 = ikBest(tipPick.clone().setY(tipPick.y + lift), [P2.q, ...seedFor(tipPick, HOME)]);
        const yawPick = toolYaw(P2.q);
        pickPose = { P1: P1.q, P2: P2.q, tip: tipPick, errors: [P1.err, P2.err] };
        let last = P1.q;
        for (let k = 0; k < NCARTONS; k++) {
            const tipPlace = slotPoint(k, CH / 2);
            const target = yawPick + (PSI_P - PSI_C);
            const P4 = ikBest(tipPlace, [...seedFor(tipPlace, last)]);
            const P4q = withYaw(P4.q, target);
            const P3 = ikBest(tipPlace.clone().setY(tipPlace.y + lift), [P4q, ...seedFor(tipPlace, last)]);
            const P3q = withYaw(P3.q, target);
            parts.push({ k, P3: P3q, P4: P4q, tip: tipPlace, errors: [P3.err, P4.err] });
            last = P3q;
        }
        applyQ(q); robot.updateMatrixWorld(true);
    }
    buildParts();

    /* ---------- state, UI ---------- */
    let kinKey = '';
    const el = id => root.querySelector(id);
    const ui = {
        x: el('#lab-x'), y: el('#lab-y'), z: el('#lab-z'), vac: el('#lab-vac'), part: el('#lab-part'),
        play: el('#lab-play'), reset: el('#lab-reset'), prog: el('#lab-prog'), sliders: el('#lab-sliders')
    };
    let override = 60, running = false, token = 0, vacuumOn = false, holding = null;

    ui.sliders.innerHTML = [0, 1, 2, 3, 4, 5].map(i => `
        <label class="lab3d-slider">
            <span class="lab3d-jn"><b>J${i + 1}</b> <i data-j="${i}"></i></span>
            <input type="range" data-q="${i}" min="${LIMITS[i][0]}" max="${LIMITS[i][1]}" step="1" value="${Math.round(q[i])}">
            <output data-o="${i}">${Math.round(q[i])}°</output>
        </label>`).join('');
    const inputs = [...ui.sliders.querySelectorAll('input')];
    const outputs = [...ui.sliders.querySelectorAll('output')];

    function syncSliders() {
        inputs.forEach((inp, i) => { inp.value = Math.round(q[i]); outputs[i].textContent = Math.round(q[i]) + '°'; });
    }
    function setPose(v) { for (let i = 0; i < 6; i++) q[i] = v[i]; applyQ(q); robot.updateMatrixWorld(true); syncSliders(); }
    function labels() {
        const L = lang();
        const nodes = [...root.querySelectorAll('[data-t]'), ...(kinRoot ? kinRoot.querySelectorAll('[data-t]') : [])];
        nodes.forEach(n => {
            const t = TEXT[n.dataset.t][L];
            if (n.dataset.t === 'play') n.textContent = running ? TEXT.stop[L] : t; else n.textContent = t;
        });
        root.querySelectorAll('[data-j]').forEach(n => { n.textContent = TEXT.joints[L][+n.dataset.j]; });
        ui.vac.textContent = vacuumOn ? TEXT.on[L] : TEXT.off[L];
        kinKey = '';                                                       // redraw the diagram texts
    }
    function readout() {
        const p = tcpPos(vA);
        ui.x.textContent = Math.round(p.x * 100);
        ui.y.textContent = Math.round(-p.z * 100);
        ui.z.textContent = Math.round(p.y * 100);
    }
    function setVacuum(on) {
        vacuumOn = on;
        ui.vac.textContent = on ? TEXT.on[lang()] : TEXT.off[lang()];
        ui.vac.classList.toggle('on', on);
    }
    function highlight(i) {
        ui.prog.querySelectorAll('li').forEach(li => li.classList.toggle('active', +li.dataset.i === i));
    }
    const showPart = () => { ui.part.textContent = `${Math.min(picked + (holding ? 0 : 1), NCARTONS)} / ${NCARTONS}`; };

    inputs.forEach((inp, i) => inp.addEventListener('input', () => {
        if (running) stopCycle();
        q[i] = +inp.value; applyQ(q); robot.updateMatrixWorld(true);
        outputs[i].textContent = Math.round(q[i]) + '°';
    }));
    root.querySelectorAll('.lab3d-chip').forEach(b => b.addEventListener('click', () => {
        override = +b.dataset.ov;
        root.querySelectorAll('.lab3d-chip').forEach(c => c.classList.toggle('active', c === b));
    }));

    /* ---------- cycle: a small async program runner ---------- */
    const frame = () => new Promise(r => requestAnimationFrame(r));
    const smooth = t => t * t * (3 - 2 * t);
    async function move(duration, step, my) {
        const t0 = performance.now();
        for (;;) {
            if (my !== token) throw new Error('cancelled');
            const t = Math.min(1, (performance.now() - t0) / 1000 / Math.max(duration, 0.05));
            step(smooth(t));
            if (t >= 1) return;
            await frame();
        }
    }
    const jointMove = (to, my) => {
        const from = q.slice();
        const span = Math.max(...to.map((x, i) => Math.abs(x - from[i])));
        const dur = span / (360 * override / 100);
        return move(dur, s => setPose(from.map((x, i) => x + (to[i] - x) * s)), my);
    };
    const linearMove = (target, my) => {
        const from = tcpPos(new THREE.Vector3());
        const dur = from.distanceTo(target) * 100 / (2000 * override / 100);
        return move(dur, s => {
            const p = from.clone().lerp(target, s);
            setPose(ik(p, q, 10).q);
        }, my);
    };
    const wait = (sec, my) => move(sec / Math.max(override / 100, 0.3), () => {}, my);
    // the conveyor moves the queue one place forward (runs while the robot is busy)
    function advanceBelt(my) {
        let last = 0;
        return move(1.3, s => {
            layoutBelt(s);
            beltTex.offset.x -= (PITCH_Q * (s - last)) / BELT_PERIOD;
            last = s;
        }, my).then(() => layoutBelt(1));
    }

    async function runCycle() {
        const my = ++token;
        if (picked >= NCARTONS) resetCartons();
        running = true; ui.play.classList.add('running'); labels();
        let belt = Promise.resolve();
        try {
            while (picked < NCARTONS) {
                const part = parts[picked];
                showPart();
                highlight(0); await jointMove(pickPose.P1, my);
                highlight(1); await linearMove(pickPose.tip, my);
                highlight(2); setVacuum(true);
                holding = cartons[picked]; scene.attach(holding);
                picked++; showPart();
                belt = advanceBelt(my).catch(() => {});
                highlight(3); await wait(0.5, my);
                highlight(4); await jointMove(pickPose.P1, my);
                highlight(5); await jointMove(part.P3, my);
                highlight(6); await linearMove(part.tip, my);
                highlight(7); setVacuum(false);
                scene.attach(holding);
                holding.position.copy(slotPoint(part.k)); holding.rotation.set(0, PSI_P, 0);
                holding = null;
                highlight(8); await jointMove(part.P3, my);
                await belt;
            }
            highlight(-1);
            await jointMove(HOME, my);
            showPart();
        } catch (e) {
            if (e.message !== 'cancelled') throw e;
        }
        if (my === token) { running = false; ui.play.classList.remove('running'); labels(); }
    }
    function stopCycle() {
        token++;
        running = false; ui.play.classList.remove('running');
        if (holding) {                                                     // a carton in the air goes back to the conveyor
            scene.attach(holding); holding = null;
            picked = Math.max(0, picked - 1);
            layoutBelt(1);
        }
        setVacuum(false); highlight(-1); showPart(); labels();
    }
    function resetAll() {
        stopCycle();
        resetCartons(); beltTex.offset.x = 0; setPose(HOME);
        showPart(); highlight(-1);
    }
    ui.play.addEventListener('click', () => { if (running) stopCycle(); else runCycle(); });
    ui.reset.addEventListener('click', resetAll);

    /* ---------- kinematic diagram ---------- */
    const kin = kinRoot ? buildKin() : null;

    function buildKin() {
        const FR = ['R0', 'R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'RE'];
        let shown = 7;
        const dhRows = [
            ['1', '0', '0', 'θ1 = q1', 'r1 = 245'],
            ['2', 'π/2', '0', 'θ2 = 90° − q2', '0'],
            ['3', '0', 'D3 = 540', 'θ3 = 180° − q3', '0'],
            ['4', '−π/2', '0', 'θ4 = q4', 'r4 = 540'],
            ['5', 'π/2', '0', 'θ5 = q5', 'r5 = 150'],
            ['6', '−π/2', '0', 'θ6 = q6', '0'],
            ['E', '—', '—', '—', 'rE = 210']
        ];
        const cell = (id, cls = '') => `<span class="${cls}" id="${id}"></span>`;
        kinRoot.innerHTML = `
            <div class="labkin-head">
                <h3 data-t="kinTitle"></h3>
                <p data-t="kinLead"></p>
            </div>
            <div class="labkin-grid">
                <div class="labkin-card labkin-fig">
                    <h4 data-t="kinFig"></h4>
                    <svg id="kin-svg" viewBox="0 0 640 500" role="img" aria-label="Kinematic diagram">
                        <defs>
                            <marker id="kah-z" markerWidth="9" markerHeight="9" refX="7.5" refY="4.5" orient="auto"><path d="M0,0.5 L8,4.5 L0,8.5 z" class="kin-ah-z"/></marker>
                            <marker id="kah-x" markerWidth="9" markerHeight="9" refX="7.5" refY="4.5" orient="auto"><path d="M0,0.5 L8,4.5 L0,8.5 z" class="kin-ah-x"/></marker>
                            <clipPath id="kin-clip"><rect x="0" y="0" width="640" height="456"/></clipPath>
                        </defs>
                        <g id="kin-dyn"></g>
                    </svg>
                    <div class="labkin-frames"><span data-t="showFrame"></span>${FR.map((f, i) => `<button type="button" class="lab3d-chip${i === shown ? ' active' : ''}" data-f="${i}">${f}</button>`).join('')}</div>
                    <p class="labkin-cap"><span data-t="planeAt"></span> <b id="kin-az">0°</b></p>
                </div>
                <div class="labkin-card labkin-data">
                    <h4 data-t="dhTitle"></h4>
                    <table class="labkin-dh">
                        <thead><tr><th>j</th><th>α<sub>j</sub></th><th>d<sub>j</sub> (mm)</th><th>θ<sub>j</sub></th><th data-t="now"></th><th>r<sub>j</sub> (mm)</th></tr></thead>
                        <tbody>${dhRows.map((r, i) => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td>${i < 6 ? cell('kin-th' + i, 'now') : ''}</td><td>${r[4]}</td></tr>`).join('')}</tbody>
                    </table>
                    <h4 data-t="t0eTitle"></h4>
                    <div class="labkin-mat">${[0, 1, 2, 3].map(r => [0, 1, 2, 3].map(c => cell(`kin-t${r}${c}`, c === 3 ? 'p' : '')).join('')).join('')}</div>
                    <div class="labkin-two">
                        <div><h5 data-t="posTitle"></h5><p class="labkin-mono" id="kin-pos"></p></div>
                        <div><h5 data-t="oriTitle"></h5><p class="labkin-mono" id="kin-ori"></p></div>
                    </div>
                    <h4 data-t="jacTitle"></h4>
                    <div class="labkin-jac">${[0, 1, 2, 3, 4, 5].map(r => [0, 1, 2, 3, 4, 5].map(c => cell(`kin-j${r}${c}`, r > 2 ? 'w' : '')).join('')).join('')}</div>
                    <p class="labkin-small" data-t="jacUnits"></p>
                    <div class="labkin-meter">
                        <span data-t="manip"></span> <b id="kin-mu">0</b>
                        <span class="labkin-track"><i id="kin-mubar"></i></span>
                        <em id="kin-sing"></em>
                    </div>
                    <div class="labkin-meter">
                        <span data-t="reachUsed"></span> <b id="kin-reach">0</b>
                        <span class="labkin-track"><i id="kin-reachbar"></i></span>
                    </div>
                </div>
            </div>
            <div class="labkin-use">
                <h4 data-t="useTitle"></h4>
                <div class="labkin-cards">
                    <div><h5 data-t="f1t"></h5><pre>T(j−1,j) = Rot(x,αj) · Trans(x,dj) · Rot(z,θj) · Trans(z,rj)
⎡ cθ     −sθ     0     d      ⎤
⎢ cα·sθ  cα·cθ  −sα  −r·sα ⎥
⎢ sα·sθ  sα·cθ   cα   r·cα  ⎥
⎣ 0      0       0     1      ⎦</pre></div>
                    <div><h5 data-t="f2t"></h5><pre>T0E = T01 · T12 · T23 · T34 · T45 · T56 · Trans(z, rE)</pre><p data-t="f2d"></p></div>
                    <div><h5 data-t="f3t"></h5><pre>ẋ = J(q) · q̇
Jj = [ zj × (pE − oj) ; zj ]</pre><p data-t="f3d"></p></div>
                    <div><h5 data-t="f4t"></h5><p data-t="f4d"></p><pre>Δq = Jᵀ (J Jᵀ + λ² I)⁻¹ e</pre></div>
                    <div><h5 data-t="f5t"></h5><pre>det J = 0   ⇒   singular</pre><p data-t="f5d"></p></div>
                    <div><h5 data-t="f6t"></h5><p data-t="f6d"></p><pre>θ = [ q1, 90° − q2, 180° − q3, q4, q5, q6 ]</pre></div>
                </div>
                <p class="labkin-small" data-t="kinNote"></p>
            </div>`;
        const svg = kinRoot.querySelector('#kin-dyn');
        kinRoot.querySelectorAll('[data-f]').forEach(b => b.addEventListener('click', () => {
            shown = +b.dataset.f;
            kinRoot.querySelectorAll('[data-f]').forEach(c => c.classList.toggle('active', c === b));
            kinKey = '';
        }));
        return { svg, get shown() { return shown; }, FR };
    }

    const f1 = (n, d = 1) => (Math.abs(n) < 0.5 * Math.pow(10, -d) ? 0 : n).toFixed(d);
    function updateKin() {
        if (!kin) return;
        const L = lang();
        const fr = dhFrames(q), J = jacobian(fr);
        const th1 = q[0] * DEG, c1 = Math.cos(th1), s1 = Math.sin(th1);
        const KS = 0.34, OX = 150, OY = 456;
        const P = (p) => ({ x: OX + KS * (p[0] * c1 + p[1] * s1), y: OY - KS * p[2] });
        const dir = v => ({ x: v[0] * c1 + v[1] * s1, y: v[2], w: -v[0] * s1 + v[1] * c1 });
        const o = [0, 1, 2, 3, 4, 5, 6].map(j => colv(fr.F[j], 3));
        const pE = colv(fr.E, 3);
        const pts = { O0: P(o[0]), O1: P(o[1]), O3: P(o[3]), O4: P(o[4]), O5: P(o[5]), E: P(pE) };
        let g = '';

        // ground, base, reach envelope
        g += `<line class="kin-ground" x1="16" y1="${OY}" x2="624" y2="${OY}"/>`;
        for (let x = 24; x < 620; x += 16) g += `<line class="kin-hatch" x1="${x}" y1="${OY}" x2="${x - 8}" y2="${OY + 8}"/>`;
        g += `<g clip-path="url(#kin-clip)"><circle class="kin-reach" cx="${pts.O1.x}" cy="${pts.O1.y}" r="${1240 * KS}"/></g>`;
        g += `<text class="kin-t" x="${pts.O1.x + 1240 * KS * 0.72}" y="${pts.O1.y - 1240 * KS * 0.66}" text-anchor="middle">${TEXT.reachLbl[L]}</text>`;
        g += `<rect class="kin-base" x="${OX - 30}" y="${OY - 12}" width="60" height="12" rx="3"/>`;

        // links
        const seg = (a, b, cls) => `<line class="kin-link ${cls}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/>`;
        g += seg(pts.O0, pts.O1, 'l1') + seg(pts.O1, pts.O3, 'l2') + seg(pts.O3, pts.O4, 'l3') + seg(pts.O4, pts.O5, 'l4') + seg(pts.O5, pts.E, 'l5');

        // dimension labels (offset to the side of each link)
        const dim = (a, b, text) => {
            const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
            let nx = -dy / len, ny = dx / len;
            if (ny > 0 || (Math.abs(ny) < 0.2 && nx > 0)) { nx = -nx; ny = -ny; }
            const mx = (a.x + b.x) / 2 + nx * 17, my = (a.y + b.y) / 2 + ny * 17;
            return `<text class="kin-dim" x="${mx}" y="${my + 4}" text-anchor="middle">${text}</text>`;
        };
        const longEnough = (a, b) => Math.hypot(b.x - a.x, b.y - a.y) > 78;
        if (longEnough(pts.O0, pts.O1)) g += dim(pts.O0, pts.O1, 'r1');
        if (longEnough(pts.O1, pts.O3)) g += dim(pts.O1, pts.O3, 'D3');
        if (longEnough(pts.O3, pts.O4)) g += dim(pts.O3, pts.O4, 'r4');
        g += `<text class="kin-legend" x="18" y="26">r1 = 245  ·  D3 = 540  ·  r4 = 540</text><text class="kin-legend" x="18" y="44">r5 = 150  ·  rE = 210   (mm)</text>`;

        // angle of the shoulder
        const u = dir([o[3][0] - o[1][0], o[3][1] - o[1][1], o[3][2] - o[1][2]]);
        const a2 = Math.atan2(u.x, u.y);
        if (Math.abs(a2) > 0.03) {
            const r0 = 44, sx = pts.O1.x + r0 * Math.sin(a2), sy = pts.O1.y - r0 * Math.cos(a2);
            g += `<path class="kin-arc" d="M ${pts.O1.x} ${pts.O1.y - r0} A ${r0} ${r0} 0 0 ${a2 > 0 ? 1 : 0} ${sx} ${sy}"/>`;
            const mid = a2 / 2;
            g += `<text class="kin-t" x="${pts.O1.x + 74 * Math.sin(mid) + (a2 > 0 ? -34 : 34)}" y="${pts.O1.y - 74 * Math.cos(mid) + 4}" text-anchor="middle">q2 = ${Math.round(q[1])}°</text>`;
        }

        // joint axes z1..z6 (an axis seen end-on is drawn as a symbol)
        const endOn = (org, w, r) => (w > 0
            ? `<circle class="kin-sym-dot" cx="${org.x}" cy="${org.y}" r="2.4"/>`
            : `<path class="kin-sym-x" d="M${org.x - 4},${org.y - 4} L${org.x + 4},${org.y + 4} M${org.x + 4},${org.y - 4} L${org.x - 4},${org.y + 4}"/>`);
        const zAxis = (j, org, label, dx, dy) => {
            const z = dir(colv(fr.F[j], 2));
            const m = Math.hypot(z.x, z.y);
            if (m < 0.3) {
                return `<circle class="kin-sym" cx="${org.x}" cy="${org.y}" r="8"/>${endOn(org, z.w)}<text class="kin-zt" x="${org.x + dx}" y="${org.y + dy}">${label}</text>`;
            }
            const len = 54, ex = org.x + z.x * len, ey = org.y - z.y * len;
            return `<line class="kin-axis-halo" x1="${org.x}" y1="${org.y}" x2="${ex}" y2="${ey}"/><line class="kin-axis" x1="${org.x}" y1="${org.y}" x2="${ex}" y2="${ey}" marker-end="url(#kah-z)"/><text class="kin-zt" x="${ex + (z.x >= 0 ? 6 : -6)}" y="${ey + (z.y > 0 ? -4 : 12)}" text-anchor="${z.x >= 0 ? 'start' : 'end'}">${label}</text>`;
        };
        g += zAxis(1, pts.O1, 'z1', 0, 0);
        g += zAxis(2, pts.O1, 'z2', -22, 20);
        g += zAxis(3, pts.O3, 'z3', 12, -12);
        g += zAxis(4, pts.O4, 'z4', 0, 0);
        g += zAxis(5, pts.O5, 'z5', 12, -12);
        g += zAxis(6, pts.O5, 'z6', 0, 0);

        // joints
        const joint = (p, name, dx, dy) => `<circle class="kin-joint" cx="${p.x}" cy="${p.y}" r="8"/><circle class="kin-jdot" cx="${p.x}" cy="${p.y}" r="2.6"/><text class="kin-jt" x="${p.x + dx}" y="${p.y + dy}">${name}</text>`;
        g += joint(pts.O1, 'J1·J2', -50, 22) + joint(pts.O3, 'J3', 12, 20) + joint(pts.O4, 'J4·J5', 12, 22) + joint(pts.O5, 'J6', 10, 22);

        // tool and TCP
        g += `<circle class="kin-tcp" cx="${pts.E.x}" cy="${pts.E.y}" r="5"/><path class="kin-tcpx" d="M${pts.E.x - 9},${pts.E.y} H${pts.E.x + 9} M${pts.E.x},${pts.E.y - 9} V${pts.E.y + 9}"/>`;
        g += `<text class="kin-jt" x="${pts.E.x + 12}" y="${pts.E.y + 20}">TCP</text>`;

        // chosen frame
        const k = kin.shown, Fk = k === 7 ? fr.E : fr.F[k], ok = P(colv(Fk, 3)), name = k === 7 ? 'E' : String(k);
        const tri = [[0, 'x', 'kah-x', 'kin-ax'], [1, 'y', 'kah-x', 'kin-ay'], [2, 'z', 'kah-z', 'kin-az']];
        tri.forEach(([c, nm, mk, cls]) => {
            const v = dir(colv(Fk, c)), m = Math.hypot(v.x, v.y);
            if (m < 0.3) {
                g += `<circle class="kin-sym tri" cx="${ok.x}" cy="${ok.y}" r="9"/>${endOn(ok, v.w)}<text class="kin-tri" x="${ok.x - 22}" y="${ok.y - 12}">${nm}${name}</text>`;
            } else {
                const len = 52, ex = ok.x + v.x * len, ey = ok.y - v.y * len;
                g += `<line class="${cls}" x1="${ok.x}" y1="${ok.y}" x2="${ex}" y2="${ey}" marker-end="url(#${mk})"/><text class="kin-tri" x="${ex + (v.x >= 0 ? 6 : -6)}" y="${ey + (v.y >= 0 ? -4 : 13)}" text-anchor="${v.x >= 0 ? 'start' : 'end'}">${nm}${name}</text>`;
            }
        });
        g += `<text class="kin-fr" x="${ok.x - 14}" y="${ok.y + 26}" text-anchor="end">R${name}</text>`;
        kin.svg.innerHTML = g;
        kinRoot.querySelector('#kin-az').textContent = Math.round(q[0]) + '°';

        // numbers
        const set = (id, txt) => { const n = kinRoot.querySelector('#' + id); if (n) n.textContent = txt; };
        fr.th.forEach((t, i) => set('kin-th' + i, Math.round(t / DEG) + '°'));
        for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) set(`kin-t${r}${c}`, c === 3 && r < 3 ? f1(fr.E[r][c], 1) : (r === 3 ? String(fr.E[r][c]) : f1(fr.E[r][c], 3)));
        set('kin-pos', `X ${f1(pE[0], 1)}\nY ${f1(pE[1], 1)}\nZ ${f1(pE[2], 1)}`);
        const R = fr.E;
        const pitch = Math.asin(Math.max(-1, Math.min(1, -R[2][0]))) / DEG, roll = Math.atan2(R[2][1], R[2][2]) / DEG, yaw = Math.atan2(R[1][0], R[0][0]) / DEG;
        set('kin-ori', `${L === 'fr' ? 'lacet' : 'yaw'}   ${f1(yaw, 1)}\n${L === 'fr' ? 'tangage' : 'pitch'} ${f1(pitch, 1)}\n${L === 'fr' ? 'roulis' : 'roll'}  ${f1(roll, 1)}`);
        for (let r = 0; r < 6; r++) for (let c = 0; c < 6; c++) set(`kin-j${r}${c}`, r < 3 ? f1(J[r][c], 0) : f1(J[r][c], 2));
        const mu = Math.abs(det6(J)) / Math.pow(540, 3);
        set('kin-mu', mu.toFixed(3));
        kinRoot.querySelector('#kin-mubar').style.width = Math.min(100, mu / 1.2 * 100) + '%';
        const status = mu < 0.01 ? TEXT.isSing[L] : mu < 0.05 ? TEXT.nearSing[L] : TEXT.okSing[L];
        const dW = Math.hypot(o[4][0], o[4][1], o[4][2] - 245);
        const why = [];
        if (Math.abs(q[4]) < 8) why.push(TEXT.wristAl[L]);
        if (dW > 1040) why.push(TEXT.elbowSt[L]);
        set('kin-sing', status + (mu < 0.05 && why.length ? ' · ' + why.join(', ') : ''));
        kinRoot.querySelector('#kin-sing').dataset.level = mu < 0.01 ? 'bad' : mu < 0.05 ? 'warn' : 'ok';
        const reach = Math.hypot(pE[0], pE[1], pE[2] - 245);
        set('kin-reach', `${Math.round(reach)} mm · ${Math.round(reach / 1240 * 100)} %`);
        kinRoot.querySelector('#kin-reachbar').style.width = Math.min(100, reach / 1240 * 100) + '%';
    }

    /* ---------- sizing and render loop ---------- */
    let fitK = 1;
    function resize() {
        const w = stage.clientWidth, h = stage.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        // narrow stage (phones): move back so the whole cell stays in view
        const k = Math.max(1, 1.25 / camera.aspect);
        const off = camera.position.clone().sub(controls.target);
        camera.position.copy(controls.target).add(off.setLength(off.length() * k / fitK));
        fitK = k;
    }
    new ResizeObserver(resize).observe(stage);
    resize();

    let visible = true, kinVisible = true;
    new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { threshold: 0 }).observe(root);
    if (kinRoot) new IntersectionObserver(es => { kinVisible = es[0].isIntersecting; }, { threshold: 0 }).observe(kinRoot);
    function loop() {
        requestAnimationFrame(loop);
        if (kin && kinVisible && !document.hidden) {
            const key = q.map(v => v.toFixed(2)).join(',');
            if (key !== kinKey) { kinKey = key; updateKin(); }
        }
        if (!visible || document.hidden) return;
        controls.update();
        readout();
        renderer.render(scene, camera);
    }
    labels(); highlight(-1); setVacuum(false); showPart();
    loop();
    document.addEventListener('langchange', labels);
    window.__lab3d = { ready: true, parts, pickPose, q, ik: (x, y, z) => ik(new THREE.Vector3(x, y, z), q), dh: dhFrames, jac: jacobian };
}
