/* 3D wiring view for the PLC projects (Three.js, see /vendor).
   Shows the PLC, its input devices (top) and output devices (bottom), and the wires between them.
   Pulses travel along the wires: towards the PLC for inputs, away from it for outputs.
   Drag to turn the view, scroll or pinch to zoom. */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/OrbitControls.js';

const css = name => getComputedStyle(document.body).getPropertyValue(name).trim() || '#888';

function label(text, color, bg) {
    const c = document.createElement('canvas'), x = c.getContext('2d'), f = 44;
    x.font = `600 ${f}px Poppins, Segoe UI, sans-serif`;
    const w = Math.ceil(x.measureText(text).width) + 40;
    c.width = w; c.height = f + 30;
    x.font = `600 ${f}px Poppins, Segoe UI, sans-serif`;
    x.fillStyle = bg; x.beginPath(); x.roundRect(0, 0, w, c.height, 22); x.fill();
    x.fillStyle = color; x.textBaseline = 'middle'; x.fillText(text, 20, c.height / 2 + 2);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false }));
    const h = 0.42; s.scale.set(h * w / c.height, h, 1); s.renderOrder = 10;
    return s;
}

/* one device, drawn by type */
function device(type, mat) {
    const g = new THREE.Group();
    const box = (w, h, d, m, y = 0) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.y = y; g.add(o); return o; };
    const cyl = (r, h, m, y = 0, rx = 0) => { const o = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 28), m); o.position.y = y; o.rotation.x = rx; g.add(o); return o; };
    switch (type) {
        case 'sensor': cyl(0.22, 0.9, mat.metal); cyl(0.16, 0.18, mat.accent, -0.52); break;                       // cylindrical sensor
        case 'button': box(0.7, 0.5, 0.5, mat.dark); cyl(0.2, 0.18, mat.green, 0, Math.PI / 2).position.z = 0.3; break;
        case 'pot': box(0.6, 0.6, 0.35, mat.dark); cyl(0.12, 0.5, mat.metal, 0, Math.PI / 2).position.z = 0.4; break;   // potentiometer
        case 'valve': box(0.8, 0.45, 0.45, mat.metal); box(0.4, 0.55, 0.4, mat.dark, 0.45); break;                      // solenoid valve
        case 'motor': cyl(0.38, 0.9, mat.metal, 0, Math.PI / 2); box(0.5, 0.3, 0.5, mat.dark, -0.4); break;
        case 'lamp': cyl(0.22, 0.25, mat.dark, -0.15); { const b = new THREE.Mesh(new THREE.SphereGeometry(0.25, 24, 16), mat.lamp); b.position.y = 0.15; g.add(b); } break;
        case 'magnet': cyl(0.4, 0.25, mat.red); box(0.12, 0.4, 0.12, mat.metal, 0.3); break;
        case 'cylinder': cyl(0.2, 1.1, mat.metal, 0, 0); g.rotation.z = Math.PI / 2; cyl(0.08, 0.6, mat.dark, 0.8); break; // pneumatic cylinder
        default: box(0.7, 0.5, 0.4, mat.dark);
    }
    return g;
}

export function mount(host, cfg) {
    if (!host || host.dataset.ready) return;
    host.dataset.ready = '1';
    const W = () => host.clientWidth || 800, H = () => host.clientHeight || 500;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(W(), H());
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, W() / H(), 0.1, 100);
    camera.position.set(4.5, 1.6, 19.5);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.autoRotate = !matchMedia('(pointer: coarse)').matches; controls.autoRotateSpeed = 0.6;
    controls.minDistance = 7; controls.maxDistance = 30; controls.target.set(0, 0, 0);
    controls.minPolarAngle = 0.5; controls.maxPolarAngle = 2.4;
    scene.add(new THREE.HemisphereLight(0xffffff, 0x445566, 1.6));
    const sun = new THREE.DirectionalLight(0xffffff, 2.2); sun.position.set(5, 8, 10); scene.add(sun);

    const signal = new THREE.Color(css('--signal'));
    const mat = {
        plc: new THREE.MeshStandardMaterial({ color: cfg.color || 0x2f3a46, roughness: 0.55, metalness: 0.2 }),
        face: new THREE.MeshStandardMaterial({ color: 0x1c232b, roughness: 0.7 }),
        metal: new THREE.MeshStandardMaterial({ color: 0xb9c2cc, roughness: 0.35, metalness: 0.7 }),
        dark: new THREE.MeshStandardMaterial({ color: 0x2b3036, roughness: 0.6 }),
        accent: new THREE.MeshStandardMaterial({ color: signal, emissive: signal, emissiveIntensity: 0.4 }),
        green: new THREE.MeshStandardMaterial({ color: 0x3fae6a, emissive: 0x1e6a3c, emissiveIntensity: 0.5 }),
        red: new THREE.MeshStandardMaterial({ color: 0xc0392b, roughness: 0.5 }),
        lamp: new THREE.MeshStandardMaterial({ color: 0xffc04d, emissive: 0xffa31a, emissiveIntensity: 0.9 }),
        rail: new THREE.MeshStandardMaterial({ color: 0x9aa3ad, metalness: 0.8, roughness: 0.3 }),
        term: new THREE.MeshStandardMaterial({ color: 0xd9dde2, metalness: 0.5, roughness: 0.4 })
    };
    const txt = css('--text'), bg = css('--surface');

    // DIN rail + PLC (CPU + I/O modules)
    const rail = new THREE.Mesh(new THREE.BoxGeometry(9, 0.35, 0.12), mat.rail); rail.position.z = -0.65; scene.add(rail);
    const mods = [[-2.6, 2.2], [-0.6, 1.7], [1.2, 1.7], [2.9, 1.5]];
    mods.forEach(([x, w], i) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(w - 0.08, 3.2, 1.1), mat.plc); m.position.set(x, 0, 0); scene.add(m);
        const f = new THREE.Mesh(new THREE.BoxGeometry(w - 0.4, 1.3, 0.05), mat.face); f.position.set(x, 0, 0.56); scene.add(f);
        if (i === 0) for (let k = 0; k < 3; k++) { const led = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 8), k ? mat.green : mat.lamp); led.position.set(x - 0.7 + k * 0.3, 0.45, 0.6); scene.add(led); }
    });
    const plcLabel = label(cfg.plc, '#ffffff', 'rgba(20,24,30,0.85)'); plcLabel.position.set(-2.6, -0.1, 0.7); plcLabel.scale.multiplyScalar(0.95); scene.add(plcLabel);

    const wires = [];
    const place = (list, top) => {
        const n = list.length, span = Math.min(11, 2.2 * n), x0 = -span / 2;
        list.forEach((d, i) => {
            const x = n === 1 ? 0 : x0 + span * i / (n - 1);
            const y = top ? 4.3 : -4.3, z = (i % 2 ? 1.2 : 0.4);
            const g = device(d.type, mat); g.position.set(x, y, z); scene.add(g);
            const l = label(d.label, txt, bg); l.position.set(x, y + (top ? 0.95 : -0.95), z); scene.add(l);
            // terminal on the PLC
            const tx = -3.4 + 6.8 * (i + 0.5) / n, ty = top ? 1.45 : -1.45;
            const t = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, 0.2), mat.term); t.position.set(tx, ty, 0.62); scene.add(t);
            const a = new THREE.Vector3(x, y + (top ? -0.55 : 0.55), z), b = new THREE.Vector3(tx, ty, 0.72);
            const curve = new THREE.CatmullRomCurve3([a, new THREE.Vector3(x, (y + ty) / 2 + (top ? 0.6 : -0.6), z + 0.9), new THREE.Vector3(tx, ty + (top ? 0.9 : -0.9), 1.2), b]);
            const color = new THREE.Color(top ? 0x3d7bff : 0xe8663d);
            const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, 0.045, 8), new THREE.MeshStandardMaterial({ color, roughness: 0.45 }));
            scene.add(tube);
            const pulse = new THREE.Mesh(new THREE.SphereGeometry(0.1, 14, 10), new THREE.MeshBasicMaterial({ color: color.clone().lerp(new THREE.Color(0xffffff), 0.5) }));
            scene.add(pulse);
            wires.push({ curve, pulse, inward: top, phase: Math.random() });
        });
    };
    place(cfg.inputs, true);
    place(cfg.outputs, false);
    const tag = (text, y) => { const s = label(text, css('--muted'), 'rgba(0,0,0,0)'); s.position.set(-6.3, y, 0); s.scale.multiplyScalar(0.9); scene.add(s); };
    tag(cfg.inLabel, 2.8); tag(cfg.outLabel, -2.8);

    const base = camera.position.clone();
    const resize = () => {
        renderer.setSize(W(), H()); camera.aspect = W() / H();
        camera.position.copy(base).multiplyScalar(Math.max(1, 1.55 / camera.aspect));   // narrow screens: step back so everything fits
        camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(host);
    let t0 = performance.now();
    (function frame(now) {
        if (!host.isConnected) { ro.disconnect(); controls.dispose(); renderer.dispose(); return; }   // the view was closed
        const t = (now - t0) / 1000;
        wires.forEach(w => { const u = (t * 0.45 + w.phase) % 1; w.pulse.position.copy(w.curve.getPointAt(w.inward ? u : 1 - u)); });
        controls.update();
        renderer.render(scene, camera);
        requestAnimationFrame(frame);
    })(t0);
}
