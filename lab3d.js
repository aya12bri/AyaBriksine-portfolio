/* =========================================================
   Robot Lab: a 3D six-axis cobot you can jog and program
   ---------------------------------------------------------
   Three.js scene (see /vendor) + a small numerical inverse kinematics
   solver. Lengths are in scene units: 1 unit = 100 mm.
   Visual model built from the kinematic diagram of the FANUC CRX-10iA
   report: D3 = 540 mm, r4 = 540 mm, r5 ~ 150 mm, flange 160 mm.
   ========================================================= */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/OrbitControls.js';

const root = document.getElementById('lab3d');

const lang = () => (document.documentElement.lang === 'fr' ? 'fr' : 'en');

const TEXT = {
    hint: { en: 'Drag to orbit · Ctrl + scroll to zoom', fr: 'Glisser pour tourner · Ctrl + molette pour zoomer' },
    tcp: { en: 'TCP · absolute frame (mm)', fr: 'TCP · repère absolu (mm)' },
    vacuum: { en: 'Vacuum 102', fr: 'Ventouse 102' },
    on: { en: 'ON', fr: 'ON' },
    off: { en: 'OFF', fr: 'OFF' },
    program: { en: 'Program', fr: 'Programme' },
    part: { en: 'Part', fr: 'Partie' },
    play: { en: 'Play cycle', fr: 'Lancer le cycle' },
    stop: { en: 'Stop', fr: 'Arrêter' },
    reset: { en: 'Reset', fr: 'Réinitialiser' },
    override: { en: 'Override', fr: 'Override' },
    jog: { en: 'JOG · joint space', fr: 'JOG · espace articulaire' },
    lead: {
        en: 'Take the controls: drag a slider to move one joint, just like the + / − keys on the teach pendant.',
        fr: 'Prenez les commandes : faites glisser un curseur pour déplacer une articulation, comme les touches + / − du pupitre.'
    },
    note: {
        en: 'Visual model built from the kinematic diagram of the CRX-10iA report: D3 = 540 mm, r4 = 540 mm, r5 ≈ 150 mm, flange 160 mm (shoulder height assumed).',
        fr: 'Modèle visuel construit d’après le schéma cinématique du rapport CRX-10iA : D3 = 540 mm, r4 = 540 mm, r5 ≈ 150 mm, bride 160 mm (hauteur d’épaule supposée).'
    },
    nowebgl: {
        en: 'The 3D view needs WebGL, which is not available in this browser.',
        fr: 'La vue 3D nécessite WebGL, qui n’est pas disponible dans ce navigateur.'
    },
    joints: {
        en: ['Base', 'Shoulder', 'Elbow', 'Wrist 1', 'Wrist 2', 'Wrist 3'],
        fr: ['Base', 'Épaule', 'Coude', 'Poignet 1', 'Poignet 2', 'Poignet 3']
    }
};

// teach-pendant style program, one part per cube
const PROGRAM = [
    'Joint P1', 'Linear P2', 'I/O 102 = ON', 'Wait t', 'Joint P1',
    'Joint P3', 'Linear P4', 'I/O 102 = OFF', 'Joint P3'
];

const HOME = [0, 0, 0, 0, -90, 0];
const LIMITS = [[-180, 180], [-135, 135], [-145, 145], [-180, 180], [-120, 120], [-180, 180]];
const DEG = Math.PI / 180;

function webglOk() {
    try {
        const c = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
    } catch (e) { return false; }
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
                <h4><span data-t="program"></span> · <span data-t="part"></span> <b id="lab-part">1 / 3</b></h4>
                <ol id="lab-prog">${PROGRAM.map((l, i) => `<li data-i="${i}"><span>${i + 1}</span>${l}</li>`).join('')}</ol>
            </div>
            <div class="lab3d-actions">
                <button type="button" class="lab3d-btn" id="lab-play"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5v11l9-5.5z"/></svg><span data-t="play"></span></button>
                <button type="button" class="lab3d-btn" id="lab-reset"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2.5a5.5 5.5 0 1 0 5.4 6.5h-1.6A3.9 3.9 0 1 1 8 4.1V6.5l3.6-2.9L8 .7z"/></svg><span data-t="reset"></span></button>
            </div>
            <div class="lab3d-override">
                <span data-t="override"></span>
                <button type="button" class="lab3d-chip" data-ov="20">20%</button>
                <button type="button" class="lab3d-chip active" data-ov="30">30%</button>
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
    camera.position.set(-15.5, 13.5, 20.5);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0.2, 2.6, 0.3);
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

    scene.add(new THREE.HemisphereLight(0xcfe6ff, 0x1b1e2b, 1.0));
    const sun = new THREE.DirectionalLight(0xffffff, 1.8);
    sun.position.set(7, 15, 9);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 45 });
    sun.shadow.bias = -0.0004;
    scene.add(sun);

    /* ---------- platform ---------- */
    const mat = (color, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.5, metalness: 0.05 }, o));
    const matLink = mat(0xece8fa, { roughness: 0.42 });
    const matJoint = mat(0x474a5c, { roughness: 0.5, metalness: 0.35 });
    const matGlow = new THREE.MeshStandardMaterial({ color: 0x7fe0ff, emissive: 0x2bb8e6, emissiveIntensity: 0.9, roughness: 0.3 });
    const matCup = new THREE.MeshStandardMaterial({ color: 0x3ee6a8, emissive: 0x10795a, emissiveIntensity: 0.6, roughness: 0.35 });

    const disc = new THREE.Mesh(new THREE.CylinderGeometry(14, 14, 0.5, 96), mat(0x3c3f4f, { roughness: 0.9 }));
    disc.position.y = -0.25;
    disc.receiveShadow = true;
    scene.add(disc);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(14, 0.11, 12, 140), matGlow);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.01;
    scene.add(rim);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x8b2a9e, transparent: true, opacity: 0.75 });
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

    const joints = [g1, g2, g3, g4, g5, g6];
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

    /* ---------- trays and cubes ---------- */
    const TRAY_TOP = 0.3, CUBE = 0.56, PITCH = 1.0;
    function makeTray(color, pocket, x, z, yaw) {
        const g = new THREE.Group();
        const body = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.3, 3.5), mat(color, { roughness: 0.55 }));
        body.position.y = 0.15; body.castShadow = true; body.receiveShadow = true; g.add(body);
        for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
            const p = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.02, 0.78), mat(pocket, { roughness: 0.8 }));
            p.position.set((i - 1) * PITCH, TRAY_TOP + 0.005, (j - 1) * PITCH); g.add(p);
        }
        g.position.set(x, 0, z); g.rotation.y = yaw;
        scene.add(g); g.updateMatrixWorld(true);
        return g;
    }
    const pickTray = makeTray(0xf5a93c, 0x7a4d10, 3.0, 5.5, -0.45);
    const placeTray = makeTray(0xd8dae1, 0x4a4d5b, -3.4, -5.0, 0.5);
    const slotWorld = (tray, i, j, lift = 0) => tray.localToWorld(new THREE.Vector3((i - 1) * PITCH, TRAY_TOP + CUBE / 2 + lift, (j - 1) * PITCH));
    const cubeColors = [0x5b8cff, 0xff6fa9, 0xffd84a];
    const cubes = cubeColors.map((c, k) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(CUBE, CUBE, CUBE), mat(c, { roughness: 0.4 }));
        m.castShadow = true; m.receiveShadow = true;
        scene.add(m);
        return m;
    });
    function resetCubes() {
        cubes.forEach((m, k) => {
            scene.attach(m);
            m.position.copy(slotWorld(pickTray, k, 0));
            m.rotation.set(0, pickTray.rotation.y, 0);
        });
    }
    resetCubes();

    /* ---------- kinematics helpers ---------- */
    const vA = new THREE.Vector3(), vB = new THREE.Vector3();
    const DOWN = new THREE.Vector3(0, -1, 0);
    const tcpPos = (out = new THREE.Vector3()) => { robot.updateMatrixWorld(true); return tcp.getWorldPosition(out); };
    const toolAxis = (out = new THREE.Vector3()) => out.set(1, 0, 0).transformDirection(g6.matrixWorld);
    const clampJ = v => v.map((x, i) => Math.min(LIMITS[i][1], Math.max(LIMITS[i][0], x)));

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

    /* ---------- program poses: P1..P4 for each cube ---------- */
    const parts = [];
    function buildParts() {
        const seedFor = (p, base) => {
            const j1 = Math.atan2(-p.z, p.x) / DEG;
            return [[j1, 35, 70, 0, -105, 0], [j1, 55, 40, 0, -85, 0], [j1, 20, 95, 0, -115, 0], base];
        };
        let last = HOME.slice();
        for (let k = 0; k < 3; k++) {
            const pickTip = slotWorld(pickTray, k, 0), placeTip = slotWorld(placeTray, k, 0);
            const lift = 2.4;
            const tipPick = pickTip.clone().setY(TRAY_TOP + CUBE + 0.02);
            const tipPlace = placeTip.clone().setY(TRAY_TOP + CUBE + 0.02);
            const P2 = ikBest(tipPick, seedFor(tipPick, last));
            const P1 = ikBest(tipPick.clone().setY(tipPick.y + lift), [P2.q, ...seedFor(tipPick, last)]);
            const P4 = ikBest(tipPlace, seedFor(tipPlace, P1.q));
            const P3 = ikBest(tipPlace.clone().setY(tipPlace.y + lift), [P4.q, ...seedFor(tipPlace, P1.q)]);
            parts.push({ k, P1: P1.q, P2: P2.q, P3: P3.q, P4: P4.q, tipPick, tipPlace, lift });
            last = P3.q;
        }
        applyQ(q); robot.updateMatrixWorld(true);
    }
    buildParts();

    /* ---------- state, UI ---------- */
    const el = id => root.querySelector(id);
    const ui = {
        x: el('#lab-x'), y: el('#lab-y'), z: el('#lab-z'), vac: el('#lab-vac'), part: el('#lab-part'),
        play: el('#lab-play'), reset: el('#lab-reset'), prog: el('#lab-prog'), sliders: el('#lab-sliders')
    };
    let override = 30, running = false, token = 0, vacuumOn = false, holding = null;

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
        root.querySelectorAll('[data-t]').forEach(n => {
            const t = TEXT[n.dataset.t][L];
            if (n.dataset.t === 'play') n.textContent = running ? TEXT.stop[L] : t; else n.textContent = t;
        });
        root.querySelectorAll('[data-j]').forEach(n => { n.textContent = TEXT.joints[L][+n.dataset.j]; });
        ui.vac.textContent = vacuumOn ? TEXT.on[L] : TEXT.off[L];
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
        const dur = span / (180 * override / 100);
        return move(dur, s => setPose(from.map((x, i) => x + (to[i] - x) * s)), my);
    };
    const linearMove = (target, my) => {
        const from = tcpPos(new THREE.Vector3());
        const dur = from.distanceTo(target) * 100 / (1000 * override / 100);
        return move(dur, s => {
            const p = from.clone().lerp(target, s);
            setPose(ik(p, q, 10).q);
        }, my);
    };
    const wait = (sec, my) => move(sec / Math.max(override / 100, 0.3), () => {}, my);

    async function runCycle() {
        const my = ++token;
        running = true; ui.play.classList.add('running'); labels();
        try {
            for (let p = 0; p < parts.length; p++) {
                const part = parts[p];
                ui.part.textContent = `${p + 1} / ${parts.length}`;
                highlight(0); await jointMove(part.P1, my);
                highlight(1); await linearMove(part.tipPick, my);
                highlight(2); setVacuum(true);
                holding = cubes[p]; g6.attach(holding);
                highlight(3); await wait(0.6, my);
                highlight(4); await jointMove(part.P1, my);
                highlight(5); await jointMove(part.P3, my);
                highlight(6); await linearMove(part.tipPlace, my);
                highlight(7); setVacuum(false);
                scene.attach(holding);
                holding.position.copy(slotWorld(placeTray, p, 0)); holding.rotation.set(0, placeTray.rotation.y, 0);
                holding = null;
                highlight(8); await jointMove(part.P3, my);
            }
            highlight(-1);
            await jointMove(HOME, my);
        } catch (e) {
            if (e.message !== 'cancelled') throw e;
        }
        if (my === token) { running = false; ui.play.classList.remove('running'); labels(); }
    }
    function stopCycle() {
        token++;
        running = false; ui.play.classList.remove('running');
        if (holding) { scene.attach(holding); holding = null; }
        setVacuum(false); labels();
    }
    function resetAll() {
        stopCycle();
        resetCubes(); setPose(HOME);
        ui.part.textContent = `1 / ${parts.length}`; highlight(-1);
    }
    ui.play.addEventListener('click', () => { if (running) stopCycle(); else runCycle(); });
    ui.reset.addEventListener('click', resetAll);

    /* ---------- sizing and render loop ---------- */
    function resize() {
        const w = stage.clientWidth, h = stage.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    }
    new ResizeObserver(resize).observe(stage);
    resize();

    let visible = true;
    new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { threshold: 0 }).observe(root);
    function loop() {
        requestAnimationFrame(loop);
        if (!visible || document.hidden) return;
        controls.update();
        readout();
        renderer.render(scene, camera);
    }
    labels(); highlight(-1); setVacuum(false);
    loop();
    document.addEventListener('langchange', labels);
    window.__lab3d = { ready: true, parts, q, ik: (x, y, z) => ik(new THREE.Vector3(x, y, z), q) };
}
