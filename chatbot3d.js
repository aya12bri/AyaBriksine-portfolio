/* 3D mascot of the chatbot (Three.js, see /vendor).
   A small grey robot with steel-blue lights: it floats, blinks, waves,
   and turns its head and body towards the mouse. */
import * as THREE from 'three';

export function mount(host) {
    if (!host || host.dataset.ready) return;
    host.dataset.ready = '1';
    const W = host.clientWidth || 84, H = host.clientHeight || 100;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, W / H, 0.1, 50);
    camera.position.set(0, 0.3, 7.4);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x5a6470, 2.2));
    const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(3, 4, 5); scene.add(key);
    const rim = new THREE.DirectionalLight(0x9cc4e4, 1.6); rim.position.set(-4, 2, -3); scene.add(rim);

    const shell = new THREE.MeshStandardMaterial({ color: 0xd9dde3, roughness: 0.32, metalness: 0.15 });
    const joint = new THREE.MeshStandardMaterial({ color: 0x4a515c, roughness: 0.5, metalness: 0.3 });
    const visor = new THREE.MeshStandardMaterial({ color: 0x14181f, roughness: 0.15, metalness: 0.4 });
    const light = new THREE.MeshStandardMaterial({ color: 0x8fd0ff, emissive: 0x4fb0ff, emissiveIntensity: 1.6, roughness: 0.3 });
    const mesh = (g, m) => new THREE.Mesh(g, m);

    const robot = new THREE.Group(); scene.add(robot);

    // body, chest light, legs
    const body = mesh(new THREE.SphereGeometry(0.62, 40, 28), shell); body.scale.set(1, 0.95, 0.85); body.position.y = -0.95; robot.add(body);
    const chest = mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.08, 28), light); chest.rotation.x = Math.PI / 2; chest.position.set(0, -0.88, 0.52); robot.add(chest);
    [-0.25, 0.25].forEach(x => {
        const leg = mesh(new THREE.CapsuleGeometry(0.17, 0.28, 8, 16), shell); leg.position.set(x, -1.72, 0); robot.add(leg);
        const ring = mesh(new THREE.TorusGeometry(0.17, 0.025, 8, 28), light); ring.rotation.x = Math.PI / 2; ring.position.set(x, -1.95, 0); robot.add(ring);
    });

    // arms: the right one waves
    const arm = side => {
        const g = new THREE.Group(); g.position.set(0.66 * side, -0.72, 0);
        const a = mesh(new THREE.CapsuleGeometry(0.13, 0.42, 8, 16), shell); a.position.y = -0.3; g.add(a);
        const hand = mesh(new THREE.SphereGeometry(0.15, 20, 14), joint); hand.position.y = -0.62; g.add(hand);
        g.rotation.z = 0.35 * side; robot.add(g); return g;
    };
    const armL = arm(-1), armR = arm(1);

    // head
    const head = new THREE.Group(); head.position.y = 0.45; robot.add(head);
    const skull = mesh(new THREE.SphereGeometry(0.9, 48, 32), shell); skull.scale.set(1.12, 0.92, 0.95); head.add(skull);
    const face = mesh(new THREE.SphereGeometry(0.72, 48, 32), visor); face.scale.set(1.12, 0.78, 0.55); face.position.z = 0.48; head.add(face);
    [-1, 1].forEach(s => {
        const ear = mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.16, 28), joint); ear.rotation.z = Math.PI / 2; ear.position.x = 1.0 * s; head.add(ear);
        const glow = mesh(new THREE.TorusGeometry(0.17, 0.04, 10, 28), light); glow.rotation.y = Math.PI / 2; glow.position.x = 1.09 * s; head.add(glow);
    });
    const stalk = mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.35, 12), joint); stalk.position.y = 0.95; head.add(stalk);
    const bulb = mesh(new THREE.SphereGeometry(0.13, 20, 14), light); bulb.position.y = 1.16; head.add(bulb);

    // eyes (smiling arcs) and mouth
    const eyes = new THREE.Group(); eyes.position.set(0, 0.06, 0.88); head.add(eyes);
    const arc = new THREE.TorusGeometry(0.16, 0.045, 10, 24, Math.PI);
    [-0.33, 0.33].forEach(x => { const e = mesh(arc, light); e.position.x = x; eyes.add(e); });
    const mouth = mesh(new THREE.TorusGeometry(0.14, 0.04, 10, 24, Math.PI), light); mouth.rotation.z = Math.PI; mouth.position.set(0, -0.2, 0.86); head.add(mouth);

    // follow the mouse (anywhere on the page)
    const look = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
    addEventListener('pointermove', e => {
        const r = host.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / innerWidth, dy = (e.clientY - (r.top + r.height / 2)) / innerHeight;
        look.x = Math.max(-1, Math.min(1, dx * 2.2)); look.y = Math.max(-1, Math.min(1, dy * 2.2));
    }, { passive: true });
    let excited = 0;
    host.closest('button')?.addEventListener('pointerenter', () => { excited = 1; });
    host.closest('button')?.addEventListener('pointerleave', () => { excited = 0; });

    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let visible = true;
    new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(host);
    const t0 = performance.now();
    (function frame(now) {
        if (!host.isConnected) { renderer.dispose(); return; }
        requestAnimationFrame(frame);
        if (!visible || document.hidden) return;
        const t = (now - t0) / 1000;
        cur.x += (look.x - cur.x) * 0.08; cur.y += (look.y - cur.y) * 0.08;
        head.rotation.y = cur.x * 0.6; head.rotation.x = cur.y * 0.35;
        robot.rotation.y = cur.x * 0.25;
        if (!reduce) {
            robot.position.y = Math.sin(t * 2) * 0.08;
            const speed = excited ? 9 : 4, wave = excited || (t % 4) < 1.4;
            armR.rotation.z = wave ? -2.3 + Math.sin(t * speed) * 0.35 : 0.35;
            armL.rotation.z = -0.35 - Math.sin(t * 2) * 0.05;
            const blink = (t % 3.8) < 0.12 ? 0.15 : 1; eyes.scale.y = blink;
            const pulse = 1.3 + Math.sin(t * 3) * 0.5; light.emissiveIntensity = pulse;
        }
        renderer.render(scene, camera);
    })(t0);
}
