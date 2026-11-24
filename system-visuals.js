/* Drawings that explain how each system works, for projects without a photo or video.
   Each project can have:
     schema : a labelled diagram of the system (how it works)
     anim   : the same system, animated
     sim    : a curve calculated from the values found in the project (control projects only)
   Every value written here comes from projects.js / the project reports. Colours follow the site theme. */

(function () {
    let uid = 0;
    const W = 800, H = 500;

    /* ---------- small drawing helpers ---------- */
    const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const T = (x, y, s, cls = '', a = 'middle') => `<text x="${x}" y="${y}" class="${cls}" text-anchor="${a}">${esc(s)}</text>`;
    function node(x, y, w, h, title, sub, o = {}) {
        const lines = [].concat(sub || []);
        const cx = x + w / 2, top = y + h / 2 - (lines.length * 17) / 2 + 5;
        return `<g class="sv-node${o.dark ? ' dk' : ''}${o.cls ? ' ' + o.cls : ''}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.r || 14}"/>`
            + T(cx, lines.length ? top : y + h / 2 + 6, title, 't')
            + lines.map((l, i) => T(cx, top + 21 + i * 17, l, 's')).join('') + '</g>';
    }
    const line = (d, o = '') => `<path d="${d}" class="ln ${o}"${o.includes('noar') ? '' : ' marker-end="url(#sv-ar)"'}/>`;
    const sum = (x, y) => `<g class="sv-sum"><circle cx="${x}" cy="${y}" r="15"/>${T(x, y + 5, 'Σ', 'sig')}</g>`;
    function note(lines) {
        const h = 22 + lines.length * 22;
        return `<g class="sv-note"><rect x="24" y="${H - h - 18}" width="${W - 48}" height="${h}" rx="12"/>${lines.map((l, i) => T(44, H - h - 18 + 30 + i * 22, l, 's2', 'start')).join('')}</g>`;
    }
    function svg(body, extraCSS = '', label = '') {
        return `<svg class="sv" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}" xmlns="http://www.w3.org/2000/svg">
            <defs><marker id="sv-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
            ${extraCSS ? `<style>${extraCSS}</style>` : ''}${body}</svg>`;
    }
    /* phase(): CSS that makes an element visible only during parts of a looping animation */
    function phases(name, dur, spans) {
        const k = [[0, spans.some(x => x[0] === 0) ? 1 : 0]];
        spans.forEach(([a, b]) => { if (a > 0) k.push([a - 0.01, 0], [a, 1]); if (b < 100) k.push([b, 1], [b + 0.01, 0]); });
        k.push([100, spans.some(x => x[1] === 100) ? 1 : 0]);
        k.sort((p, q) => p[0] - q[0]);
        return `@keyframes ${name}{${k.map(([p, o]) => `${+p.toFixed(2)}%{opacity:${o}}`).join('')}}.${name}{opacity:${k[0][1]};animation:${name} ${dur}s linear infinite}`;
    }
    function stepper(id, dur, items, x, y, w) {
        // a list of steps on the right; the active one lights up
        let css = '', body = '';
        items.forEach(([label, spans], i) => {
            const n = `${id}-p${i}`;
            css += phases(n, dur, spans);
            const yy = y + i * 44;
            body += `<g class="sv-step"><rect x="${x}" y="${yy}" width="${w}" height="36" rx="10"/>${T(x + 14, yy + 23, label, 's2', 'start')}</g>`
                + `<g class="${n}"><rect class="sv-step-on" x="${x}" y="${yy}" width="${w}" height="36" rx="10"/>${T(x + 14, yy + 23, label, 's2 on', 'start')}</g>`;
        });
        return { css, body };
    }
    /* chart(): simple line chart for the simulations */
    function chart(o) {
        const x0 = 70, y0 = 60, w = W - 110, h = H - 160;
        const X = v => x0 + (v - o.x[0]) / (o.x[1] - o.x[0]) * w;
        const Y = v => y0 + h - (v - o.y[0]) / (o.y[1] - o.y[0]) * h;
        let s = `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" class="sv-plot"/>`;
        o.yt.forEach(v => { s += `<line x1="${x0}" x2="${x0 + w}" y1="${Y(v)}" y2="${Y(v)}" class="grid"/>` + T(x0 - 10, Y(v) + 5, o.yf ? o.yf(v) : v, 's', 'end'); });
        o.xt.forEach(v => { s += T(X(v), y0 + h + 24, o.xf ? o.xf(v) : v, 's'); });
        s += T(x0 + w, y0 + h + 48, o.xl, 's', 'end') + T(x0 - 52, y0 - 18, o.yl, 's', 'start');
        if (o.ref != null) s += `<line x1="${x0}" x2="${x0 + w}" y1="${Y(o.ref)}" y2="${Y(o.ref)}" class="ref"/>`;
        const leg = [];
        o.series.forEach((se, i) => {
            const d = se.pts.map((p, j) => (j ? 'L' : 'M') + X(p[0]).toFixed(1) + ' ' + Y(p[1]).toFixed(1)).join('');
            s += `<path d="${d}" class="sv-curve c${se.c}" pathLength="1"/>`;
            leg.push(se.label);
        });
        (o.marks || []).forEach(m => { s += `<circle cx="${X(m[0])}" cy="${Y(m[1])}" r="5" class="dot c${m[3] || 0}"/>` + T(X(m[0]) + (m[4] || 10), Y(m[1]) + (m[5] || -10), m[2], 's2', 'start'); });
        let lx = x0;
        s += o.series.map(se => { const g = `<line x1="${lx}" x2="${lx + 26}" y1="${H - 30}" y2="${H - 30}" class="sv-curve c${se.c} static"/>` + T(lx + 34, H - 25, se.label, 's2', 'start'); lx += 40 + se.label.length * 7.6; return g; }).join('');
        return s;
    }
    const sim = (f, t1, dt, step) => { const pts = []; let st = f.init(); for (let t = 0; t <= t1 + 1e-9; t += dt) { if (Math.round(t / dt) % step === 0) pts.push([t, f.out(st)]); st = f.step(st, dt); } return pts; };
    let curLang = 'fr';
    const fr = (n, d = 1) => curLang === 'fr' ? n.toFixed(d).replace('.', ',') : n.toFixed(d);

    /* ---------- the drawings, per project ---------- */
    const V = {};

    /* DC motor ----------------------------------------------------------- */
    V['dc-motor-speed-control'] = {
        schema: L => svg(
            node(16, 150, 120, 74, L('Setpoint', 'Consigne'), L('target speed', 'vitesse voulue'))
            + line('M136 187 H172') + sum(190, 187) + T(170, 168, '+', 'sig') + T(203, 222, '−', 'sig')
            + line('M205 187 H244') + T(224, 176, L('error', 'erreur'), 's')
            + node(246, 132, 150, 110, L('PI controller', 'Régulateur PI'), ['Kp = ' + fr(3.69, 2), 'Ki = ' + fr(128.9)], { dark: true })
            + line('M396 187 H436') + T(416, 176, 'u', 's')
            + `<g class="sv-motor"><rect x="438" y="157" width="12" height="60" rx="3" class="m2"/><rect x="450" y="140" width="128" height="94" rx="16" class="m1"/><path d="M482 140V234M514 140V234M546 140V234" class="m3"/><rect x="578" y="172" width="18" height="30" rx="3" class="m2"/></g>`
            + T(514, 262, L('Escap DC motor', 'Moteur CC Escap'), 't') + T(514, 282, 'K = ' + fr(1.11, 2) + ' · τ = ' + fr(62.8) + ' ms', 's')
            + line('M596 187 H650') + node(652, 150, 132, 74, L('Speed', 'Vitesse'), L('measured', 'mesurée'))
            + line('M718 224 V330 H190 V206', 'd') + node(300, 300, 240, 62, L('Tachogenerator', 'Génératrice tachymétrique'), 'NI-USB 6008 · Te = 5 ms')
            + note([L('① The board reads the speed every 5 ms.  ② The PI compares it to the setpoint and corrects the voltage.', '① La carte mesure la vitesse toutes les 5 ms.   ② Le PI la compare à la consigne et corrige la tension.'),
                L('③ Target: overshoot below 10 % and a closed loop three times faster than the open loop.', '③ Objectif : dépassement < 10 % et réponse 3 fois plus rapide qu’en boucle ouverte.')]),
            '', L('Speed control loop of the DC motor', 'Boucle d’asservissement en vitesse du moteur')),
        anim: L => svg(
            node(30, 70, 190, 100, 'PC', ['LabVIEW · MATLAB', L('PI controller', 'régulateur PI')], { dark: true })
            + node(300, 70, 190, 100, 'NI-USB 6008', [L('acquisition card', 'carte d’acquisition'), 'Te = 5 ms'])
            + `<path d="M220 105 H298" class="ln flow"/><path d="M298 135 H220" class="ln flow"/>`
            + T(259, 96, 'u', 's') + T(259, 156, 'ω', 's')
            + `<path d="M395 170 V250 H470" class="ln flow"/>` + T(405, 230, L('voltage', 'tension'), 's', 'start')
            + `<g class="sv-motor"><rect x="472" y="210" width="150" height="110" rx="18" class="m1"/><path d="M510 210V320M547 210V320M584 210V320" class="m3"/><rect x="622" y="250" width="22" height="30" rx="4" class="m2"/><line x1="644" y1="265" x2="672" y2="265" class="shaft"/></g>`
            + `<g transform="translate(700 265)"><circle r="46" class="disc"/><g class="spin">${[0, 60, 120, 180, 240, 300].map(a => `<line x1="0" y1="0" x2="${(40 * Math.cos(a * Math.PI / 180)).toFixed(1)}" y2="${(40 * Math.sin(a * Math.PI / 180)).toFixed(1)}" class="spoke"/>`).join('')}<circle r="6" class="hub"/></g></g>`
            + T(547, 348, L('Escap DC motor', 'Moteur CC Escap'), 't')
            + node(420, 380, 250, 54, L('Tachogenerator', 'Génératrice tachymétrique'), '', { r: 12 })
            + `<path d="M700 311 V407 H672" class="ln flow"/><path d="M420 407 H360 V172" class="ln flow"/>` + T(366, 300, L('speed', 'vitesse'), 's', 'start')
            + note([L('Every 5 ms: measure the speed → compute the PI → send the new voltage to the motor.', 'Toutes les 5 ms : mesure de la vitesse → calcul du PI → nouvelle tension envoyée au moteur.')]),
            '', L('Test bench of the DC motor', 'Banc d’essai du moteur')),
        sim: L => {
            const K = 1.11, tau = 0.0628, Kp = 3.69, Ki = 128.9;
            const ol = sim({ init: () => 0, step: (y, dt) => y + dt * (K - y) / tau, out: y => y }, 0.35, 0.0005, 4);
            const cl = sim({ init: () => [0, 0], step: ([y, I], dt) => { const e = 1 - y; const u = Kp * e + Ki * I; return [y + dt * (K * u - y) / tau, I + e * dt]; }, out: s => s[0] }, 0.35, 0.0005, 4);
            const peak = cl.reduce((m, p) => p[1] > m[1] ? p : m);
            const i63 = ol.find(p => p[1] >= 0.632 * K);
            return svg(chart({
                x: [0, 0.35], y: [0, 1.25], xt: [0, .05, .1, .15, .2, .25, .3, .35], xf: v => Math.round(v * 1000), yt: [0, .25, .5, .75, 1, 1.25], yf: v => fr(v, 2),
                xl: L('time (ms)', 'temps (ms)'), yl: L('speed (normalised)', 'vitesse (normalisée)'), ref: 1,
                series: [{ pts: ol, c: 2, label: L('Open loop (Broïda model)', 'Boucle ouverte (modèle de Broïda)') }, { pts: cl, c: 1, label: L('With the PI controller', 'Avec le régulateur PI') }],
                marks: [[i63[0], i63[1], 'τ = ' + fr(62.8) + ' ms', 2, 12, 22], [peak[0], peak[1], L('overshoot ≈ ', 'dépassement ≈ ') + Math.round((peak[1] - 1) * 100) + ' %', 1, 12, -10]]
            }), '', L('Simulated step response of the motor', 'Réponse simulée du moteur à un échelon'));
        }
    };

    /* Tank station S7-1200 ------------------------------------------------ */
    function tanks(L, animated) {
        const id = 'svt' + (++uid), D = 12;
        let css = '', s = '';
        if (animated) {
            css += `@keyframes ${id}m{0%{transform:scaleY(.08)}33%,45%{transform:scaleY(.85)}58%,100%{transform:scaleY(.08)}}
                @keyframes ${id}x{0%,45%{transform:scaleY(.06)}58%,85%{transform:scaleY(.8)}97%,100%{transform:scaleY(.06)}}
                .${id}m{transform-box:fill-box;transform-origin:bottom;animation:${id}m ${D}s ease-in-out infinite}
                .${id}x{transform-box:fill-box;transform-origin:bottom;animation:${id}x ${D}s ease-in-out infinite}`
                + phases(id + 'v', D, [[45, 58]]) + phases(id + 'a', D, [[58, 85]]) + phases(id + 'u', D, [[85, 97]]);
        }
        [L('Tank 1', 'Cuve 1'), L('Tank 2', 'Cuve 2'), L('Tank 3', 'Cuve 3')].forEach((n, i) => {
            const x = 40 + i * 170;
            s += `<g transform="translate(${x} 70)"><rect width="110" height="120" rx="10" class="tank"/>`
                + `<rect x="3" y="3" width="104" height="114" rx="8" class="liq ${animated ? id + 'm' : ''}" ${animated ? '' : 'y="45" height="72"'}/>`
                + `<line x1="110" x2="128" y1="22" y2="22" class="lvl"/>` + T(55, -10, n, 't')
                + `<path d="M55 120 V160 H${300 - x}" class="pipe noar"/><g transform="translate(55 142)"><path d="M-11 -7 L11 7 L11 -7 L-11 7z" class="valve"/>${animated ? `<path d="M-11 -7 L11 7 L11 -7 L-11 7z" class="valve-on ${id}v"/>` : ''}</g></g>`;
        });
        s += `<g transform="translate(300 260)"><rect width="170" height="110" rx="14" class="tank"/><rect x="3" y="3" width="164" height="104" rx="12" class="liq2 ${animated ? id + 'x' : ''}" ${animated ? '' : 'y="40" height="67"'}/>`
            + `<line x1="85" x2="85" y1="-30" y2="66" class="shaft"/><g transform="translate(85 66)"><line x1="-34" x2="34" y1="0" y2="0" class="paddle ${animated ? 'sv-paddle' : ''}"/></g>`
            + T(96, -14, L('Agitator', 'Agitateur'), 's', 'start') + T(85, 136, L('Mixing tank', 'Cuve de mélange'), 't')
            + `<path d="M40 -30 V2" class="pipe noar"/><path d="M0 85 H-52" class="pipe noar"/><circle cx="-72" cy="85" r="20" class="pump"/><path d="M-64 75 L-84 85 L-64 95z" class="pump-ar"/>${animated ? `<circle cx="-72" cy="85" r="20" class="pump-on ${id}u"/>` : ''}`
            + T(-72, 128, L('pump', 'pompe'), 's') + `</g>`;
        s += node(590, 60, 190, 140, 'S7-1200', [L('Inputs: level sensors', 'Entrées : capteurs niveau'), L('Outputs: valves, pump,', 'Sorties : vannes, pompe,'), L('agitator, lights', 'agitateur, voyants'), L('Timers 5 s · 10 s', 'Tempos 5 s · 10 s')], { dark: true });
        s += `<path d="M590 130 H560" class="ln d noar"/>`;
        ['ok', 'wait', 'stop'].forEach((c, i) => { s += `<circle cx="${640 + i * 45}" cy="236" r="12" class="lamp ${c}"/>`; });
        s += T(685, 268, L('indicator lights', 'voyants'), 's');
        if (animated) {
            const st = stepper(id + 's', D, [
                [L('① Measuring tanks fill up', '① Remplissage des cuves'), [[0, 45]]],
                [L('② Valves open, one after the other', '② Ouverture des électrovannes'), [[45, 58]]],
                [L('③ Agitator runs 10 s', '③ Agitateur pendant 10 s'), [[58, 85]]],
                [L('④ Pump empties the mix', '④ La pompe vide le mélange'), [[85, 100]]]
            ], 520, 300, 262);
            css += st.css; s += st.body;
        } else {
            s += note([L('Level sensors → PLC (Grafcet in TIA Portal) → solenoid valves, pump, agitator and lights.', 'Capteurs de niveau → automate (Grafcet sous TIA Portal) → électrovannes, pompe, agitateur, voyants.'),
                L('Valves alternate with at least 5 s between them; the chlorinated product is mixed for 10 s.', 'Les vannes alternent avec 5 s minimum ; le produit chloré est mélangé pendant 10 s.')]);
        }
        return svg(s, css, L('Tank station controlled by a Siemens S7-1200', 'Station de réservoirs pilotée par un S7-1200'));
    }
    V['reservoirs-s7-1200'] = { schema: L => tanks(L, false), anim: L => tanks(L, true) };

    /* Turbofan ----------------------------------------------------------- */
    V['turbofan-imc-pid'] = {
        schema: L => svg(
            node(12, 150, 112, 74, L('Setpoint', 'Consigne'), 'NH (tr/min)')
            + line('M124 187 H150') + node(152, 157, 96, 60, L('Prefilter', 'Pré-filtre'), '', { r: 12 })
            + line('M248 187 H272') + sum(290, 187) + T(270, 168, '+', 'sig') + T(303, 222, '−', 'sig')
            + line('M305 187 H332') + node(334, 132, 150, 110, L('Controller', 'Régulateur'), ['PID · IMC', 'anti-windup'], { dark: true })
            + line('M484 187 H520') + T(502, 176, 'u', 's')
            + node(522, 142, 150, 90, L('Turbofan', 'Turboréacteur'), [L('u = fuel flow %', 'u = débit kérosène %'), L('HP turbine', 'turbine HP')])
            + line('M597 70 V140') + T(597, 60, L('disturbances', 'perturbations'), 's')
            + line('M672 187 H700') + node(702, 157, 86, 60, 'NH', L('rpm', 'tr/min'), { r: 12 })
            + line('M745 217 V330 H290 V206', 'd') + node(420, 300, 210, 60, L('Speed sensor', 'Capteur de vitesse'), L('+ measurement noise', '+ bruit de mesure'))
            + note([L('Input: fuel flow (%). Output: HP turbine speed NH (rpm).', 'Entrée : débit de kérosène (%). Sortie : vitesse de la turbine haute pression NH (tr/min).'),
                L('Compared: open loop (lookup table), PID (Broïda, pole placement) and IMC (λ = 1, 0.5, 0.2).', 'Comparés : boucle ouverte (table), PID (Broïda, placement de pôles) et IMC (λ = 1 ; 0,5 ; 0,2).')]),
            '', L('Speed control loop of the turbofan', 'Boucle de régulation de vitesse du turboréacteur')),
        anim: L => {
            const id = 'svf' + (++uid);
            const css = `@keyframes ${id}n{0%{transform:rotate(-100deg)}25%{transform:rotate(20deg)}35%{transform:rotate(-5deg)}45%,70%{transform:rotate(5deg)}78%{transform:rotate(-25deg)}88%,100%{transform:rotate(5deg)}}
                .${id}n{transform-box:view-box;transform-origin:640px 380px;animation:${id}n 10s ease-in-out infinite}
                @keyframes ${id}fl{0%,100%{transform:scaleX(1)}50%{transform:scaleX(1.25)}}.${id}fl{transform-box:fill-box;transform-origin:left center;animation:${id}fl .35s ease-in-out infinite}`
                + phases(id + 'd', 10, [[70, 80]]);
            const blades = [0, 1, 2, 3, 4, 5, 6].map(i => `<line x1="0" y1="0" x2="0" y2="-74" class="blade" transform="rotate(${i * 51.4})"/>`).join('');
            return svg(
                `<path d="M70 120 Q60 210 70 300 L560 270 Q600 210 560 150 Z" class="nacelle"/>`
                + `<g transform="translate(120 210)"><ellipse rx="22" ry="80" class="fan"/><g transform="scale(.3 1)"><g class="spin fast">${blades}</g></g><circle r="12" class="hub"/></g>`
                + `<rect x="200" y="180" width="300" height="60" rx="20" class="core"/>`
                + T(270, 172, L('compressor', 'compresseur'), 's')
                + `<rect x="300" y="188" width="70" height="44" rx="10" class="burn"/><path d="M310 210 h40" class="flame ${id}fl"/>` + T(335, 262, L('combustion', 'combustion'), 's')
                + `<g transform="translate(440 210)"><ellipse rx="10" ry="28" class="fan"/></g>` + T(440, 172, L('HP turbine', 'turbine HP'), 's')
                + `<path d="M335 330 V236" class="ln flow fuel"/>` + node(255, 330, 160, 56, L('Fuel flow', 'Débit kérosène'), '%', { r: 12 })
                + node(30, 390, 180, 70, L('Controller', 'Régulateur'), 'PID · IMC', { dark: true })
                + `<path d="M210 425 H240 V358 H255" class="ln flow"/>`
                + `<g class="gauge"><path d="M570 380 A70 70 0 0 1 710 380" class="arc"/><line x1="640" y1="380" x2="640" y2="322" class="needle ${id}n"/><circle cx="640" cy="380" r="6" class="hub"/></g>`
                + T(640, 410, L('NH speed', 'Vitesse NH'), 't') + T(640, 300, L('setpoint', 'consigne'), 's') + `<line x1="640" y1="306" x2="640" y2="316" class="ref"/>`
                
                + `<g class="${id}d">${T(640, 455, L('disturbance → the controller corrects', 'perturbation → le régulateur corrige'), 's2')}</g>`,
                css, L('Turbofan: the controller sets the fuel flow to hold NH', 'Turboréacteur : le régulateur règle le kérosène pour tenir NH'));
        },
        sim: L => {
            const series = [[1, 2, 'λ = 1 s'], [0.5, 3, 'λ = ' + fr(0.5) + ' s'], [0.2, 1, 'λ = ' + fr(0.2) + ' s']].map(([l, c, label]) => ({ c, label, pts: Array.from({ length: 161 }, (_, i) => { const t = i * 0.025; return [t, 1 - Math.exp(-t / l)]; }) }));
            return svg(chart({
                x: [0, 4], y: [0, 1.2], xt: [0, 1, 2, 3, 4], yt: [0, .25, .5, .75, 1], yf: v => fr(v, 2), ref: 1,
                xl: L('time (s)', 'temps (s)'), yl: L('NH / setpoint', 'NH / consigne'), series
            }) + T(W - 50, 330, L('IMC with a perfect model: closed loop = 1 / (λs + 1)', 'IMC avec modèle parfait : boucle fermée = 1 / (λs + 1)'), 's', 'end')
              + T(W - 50, 352, L('smaller λ → faster, but more sensitive to noise', 'λ plus petit → plus rapide, mais plus sensible au bruit'), 's', 'end'),
            '', L('Effect of the IMC filter λ', 'Effet du filtre λ de l’IMC'));
        }
    };

    /* Drone -------------------------------------------------------------- */
    function droneBody(extra = '') {
        return `<line x1="-110" y1="0" x2="110" y2="0" class="arm"/><rect x="-26" y="-14" width="52" height="28" rx="8" class="body"/>`
            + [-110, 110].map(x => `<g transform="translate(${x} -8)"><rect x="-6" y="0" width="12" height="10" class="m2"/><ellipse cx="0" cy="-2" rx="40" ry="5" class="prop"/></g>`).join('') + extra;
    }
    V['drone-modelling-control'] = {
        schema: L => svg(
            node(12, 120, 110, 70, L('Setpoint', 'Consigne'), 'θ, y')
            + line('M122 155 H150') + sum(168, 155) + T(148, 137, '+', 'sig') + T(181, 189, '−', 'sig')
            + line('M183 155 H202') + node(204, 120, 150, 70, L('Integral action', 'Action intégrale'), L('zero static error', 'erreur nulle'))
            + line('M354 155 H382') + node(384, 110, 130, 90, L('State feedback', 'Retour d’état'), 'u = −K x̂', { dark: true })
            + line('M514 155 H548') + T(531, 145, 'u', 's')
            + node(550, 100, 160, 110, L('Quadcopter', 'Quadricoptère'), [L('inputs: F₁, F₂', 'entrées : F₁, F₂'), L('non-linear model', 'modèle non linéaire'), L('under-actuated', 'sous-actionné')])
            + line('M710 155 H770') + T(745, 143, 'y', 's')
            + line('M760 155 V300 H660', 'd') + node(500, 270, 158, 60, L('Sensor', 'Capteur'), L('cheapest choice', 'le moins coûteux'))
            + line('M500 300 H330', 'd') + node(170, 270, 158, 60, L('Observer', 'Observateur'), L('estimates x̂', 'estime x̂'))
            + line('M250 270 V235 H449 V202', 'd') + T(330, 228, 'x̂', 's') + line('M168 270 V172', 'd')
            + note([L('The drone has fewer inputs than degrees of freedom: it must tilt (θ) to move sideways.', 'Le drone a moins d’entrées que de degrés de liberté : il doit s’incliner (θ) pour se déplacer.'),
                L('The observer rebuilds the missing states from one sensor, then the state feedback stabilises θ.', 'L’observateur reconstruit les états à partir d’un seul capteur, puis le retour d’état stabilise θ.')]),
            '', L('Control structure of the quadcopter', 'Structure de commande du quadricoptère')),
        anim: L => {
            const id = 'svd' + (++uid);
            const css = `@keyframes ${id}r{0%,8%{transform:translate(400px,230px) rotate(0)}30%,42%{transform:translate(470px,224px) rotate(20deg)}62%,72%{transform:translate(360px,226px) rotate(-10deg)}92%,100%{transform:translate(400px,230px) rotate(0)}}
                .${id}r{animation:${id}r 9s ease-in-out infinite}`
                + phases(id + 'a', 9, [[0, 15], [88, 100]]) + phases(id + 'b', 9, [[22, 48]]) + phases(id + 'c', 9, [[56, 78]]);
            return svg(
                `<line x1="40" y1="400" x2="760" y2="400" class="ground"/><line x1="60" y1="230" x2="740" y2="230" class="ref"/>`
                + `<g class="${id}r">${droneBody(`<line x1="-110" y1="-20" x2="-110" y2="-95" class="force" marker-end="url(#sv-ar)"/><line x1="110" y1="-20" x2="110" y2="-95" class="force" marker-end="url(#sv-ar)"/><text x="-130" y="-70" class="s" text-anchor="end">F₁</text><text x="130" y="-70" class="s" text-anchor="start">F₂</text><line x1="0" y1="0" x2="0" y2="-80" class="axis"/>`)}</g>`
                + `<line x1="400" y1="250" x2="400" y2="330" class="force g" marker-end="url(#sv-ar)"/>` + T(414, 320, 'mg', 's', 'start')
                + `<g class="${id}a">${T(400, 90, L('θ = 0°: balanced, thrusts equal', 'θ = 0° : équilibre, poussées égales'), 't')}</g>`
                + `<g class="${id}b">${T(400, 90, L('θ = 20°: the drone tilts and slides sideways', 'θ = 20° : le drone s’incline et glisse sur le côté'), 't')}</g>`
                + `<g class="${id}c">${T(400, 90, L('θ = −10°: the controller brings it back', 'θ = −10° : la commande le ramène'), 't')}</g>`
                + T(60, 222, L('equilibrium', 'équilibre'), 's', 'start')
                + note([L('Vertical-plane model: two thrusts F₁, F₂ control height y, position x and angle θ.', 'Modèle dans un plan vertical : deux poussées F₁, F₂ pour la hauteur y, la position x et l’angle θ.')]),
                css, L('Quadcopter tilting in a vertical plane', 'Quadricoptère qui s’incline dans un plan vertical'));
        },
        sim: L => {
            const deg = Math.PI / 180, pts = [];
            for (let a = 0; a <= 40; a += 0.5) pts.push([a, Math.cos(a * deg)]);
            const tan = (a0, c, label) => ({ c, label, pts: [Math.max(0, a0 - 15), a0 + 15].map(a => [a, Math.cos(a0 * deg) - Math.sin(a0 * deg) * (a - a0) * deg]) });
            return svg(chart({
                x: [0, 40], y: [0.7, 1.05], xt: [0, 10, 20, 30, 40], xf: v => v + '°', yt: [0.7, 0.8, 0.9, 1], yf: v => fr(v, 1),
                xl: 'θ', yl: L('vertical share of thrust: cos θ', 'part verticale de la poussée : cos θ'),
                series: [{ c: 2, label: L('real (non-linear)', 'réel (non linéaire)'), pts }, tan(0, 1, L('linearised at 0°', 'linéarisé en 0°')), tan(10, 3, '10°'), tan(20, 4, '20°')],
                marks: [[0, 1, '0°', 1, 8, 22], [10, Math.cos(10 * deg), '10°', 3, 8, 22], [20, Math.cos(20 * deg), '20°', 4, 8, 22]]
            }) + T(110, 300, L('Each linear model is exact only near its own angle:', 'Chaque modèle linéaire n’est juste que près de son angle :'), 's', 'start')
              + T(110, 322, L('the further θ goes, the more it drifts from the real drone.', 'plus θ s’en éloigne, plus il s’écarte du vrai drone.'), 's', 'start'),
            '', L('Why linearised models drift when θ grows', 'Pourquoi les modèles linéarisés s’écartent quand θ augmente'));
        }
    };

    /* Grafcet ------------------------------------------------------------ */
    V['grafcet-sequential-systems'] = {
        schema: L => {
            const step = (x, y, n, label, init) => `<g class="sv-gstep${init ? ' init' : ''}"><rect x="${x}" y="${y}" width="44" height="40"/>${init ? `<rect x="${x + 4}" y="${y + 4}" width="36" height="32"/>` : ''}${T(x + 22, y + 26, n, 't')}</g>`
                + (label ? `<line x1="${x + 44}" y1="${y + 20}" x2="${x + 64}" y2="${y + 20}" class="ln noar"/><rect x="${x + 64}" y="${y + 4}" width="${label.length * 8 + 20}" height="32" class="act"/>${T(x + 74, y + 25, label, 's2', 'start')}` : '');
            const tr = (x, y, label) => `<line x1="${x - 14}" y1="${y}" x2="${x + 14}" y2="${y}" class="trans"/>${T(x + 22, y + 5, label, 's', 'start')}`;
            const cx = 82;
            let s = step(60, 30, '0', '', true) + `<line x1="${cx}" y1="70" x2="${cx}" y2="100" class="ln noar"/>` + tr(cx, 85, L('start', 'départ cycle'))
                + step(60, 100, '1', L('Clamp', 'Serrage')) + `<line x1="${cx}" y1="140" x2="${cx}" y2="160" class="ln noar"/>` + tr(cx, 150, L('part clamped', 'pièce serrée'))
                + `<line x1="40" y1="164" x2="300" y2="164" class="par"/><line x1="40" y1="169" x2="300" y2="169" class="par"/>`
                + `<line x1="${cx}" y1="169" x2="${cx}" y2="190" class="ln noar"/><line x1="218" y1="169" x2="218" y2="190" class="ln noar"/>`
                + step(60, 190, '2', 'T/X2/2s') + step(196, 190, '3', L('Count', 'Compteur'))
                + `<line x1="${cx}" y1="230" x2="${cx}" y2="256" class="ln noar"/><line x1="218" y1="230" x2="218" y2="256" class="ln noar"/>`
                + `<line x1="40" y1="256" x2="300" y2="256" class="par"/><line x1="40" y1="261" x2="300" y2="261" class="par"/>` + tr(170, 274, L('both done', 'fin des deux'))
                + `<line x1="170" y1="261" x2="170" y2="290" class="ln noar"/><path d="M170 290 V300 H24 V50 H60" class="ln"/>`;
            const tags = [[352, 40, L('initial step', 'étape initiale')], [352, 92, L('transition = condition', 'transition = condition')], [352, 144, L('action of the step', 'action de l’étape')], [352, 196, L('timer · counter', 'tempo · compteur')], [352, 248, L('parallel branches', 'branches parallèles')], [352, 300, L('loop back to start', 'boucle de retour')]];
            s += tags.map(([x, y, t]) => `<g class="sv-tag"><rect x="${x}" y="${y}" width="190" height="34" rx="9"/>${T(x + 12, y + 22, t, 's2', 'start')}</g>`).join('');
            const sys = [L('Manipulator arm', 'Bras manipulateur'), L('Overhead crane', 'Pont roulant'), L('Elevator', 'Ascenseur'), L('Machining station', 'Poste d’usinage')];
            s += T(560 + 110, 46, L('4 systems designed', '4 systèmes conçus'), 't') + sys.map((t, i) => node(560, 64 + i * 66, 220, 52, t, '', { r: 12 })).join('');
            s += note([L('A Grafcet describes in what order a machine acts, and the condition to move to the next step.', 'Un Grafcet décrit l’ordre des actions d’une machine et la condition pour passer à l’étape suivante.'),
                L('Example drawn here: clamp, then timer and counter in parallel, then back to the start.', 'Exemple : serrage, puis temporisation et compteur en parallèle, puis retour au départ.')]);
            return svg(s, '', L('How a Grafcet is read', 'Comment se lit un Grafcet'));
        },
        anim: L => {
            const id = 'svg' + (++uid), D = 14;
            // floor y: 1 → 330, 2 → 230, 3 → 130 (cabin top)
            const css = `@keyframes ${id}c{0%,15%{transform:translateY(0)}28%,43%{transform:translateY(-100px)}56%,71%{transform:translateY(-200px)}90%,100%{transform:translateY(0)}}.${id}c{animation:${id}c ${D}s ease-in-out infinite}`
                + phases(id + 'f1', D, [[0, 15], [90, 100]]) + phases(id + 'f2', D, [[28, 43]]) + phases(id + 'f3', D, [[56, 71]]) + phases(id + 'l', D, [[15, 28], [43, 56], [71, 90]]);
            let s = `<rect x="60" y="100" width="200" height="320" rx="8" class="shaftbox"/>`;
            [3, 2, 1].forEach((f, i) => {
                const y = 100 + i * 100;
                s += `<line x1="60" y1="${y + 100}" x2="260" y2="${y + 100}" class="floor"/>` + T(285, y + 60, L('Floor ', 'Étage ') + f, 's2', 'start')
                    + `<circle cx="360" cy="${y + 55}" r="9" class="lamp off"/><circle cx="360" cy="${y + 55}" r="9" class="lamp ok ${id}f${f}"/>`;
            });
            s += T(360, 92, L('floor lights', 'témoins'), 's');
            s += `<g class="${id}c"><rect x="110" y="314" width="100" height="84" rx="6" class="cabin"/><circle cx="160" cy="332" r="7" class="lamp off"/><circle cx="160" cy="332" r="7" class="lamp wait ${id}l"/></g>`;
            s += T(160, 448, L('cabin lamp on while moving', 'lampe cabine allumée en mouvement'), 's');
            const st = stepper(id + 's', D, [
                [L('Step 0 · waiting for a call', 'Étape 0 · attente d’un appel'), [[0, 15], [90, 100]]],
                [L('Step 1 · going up · lamp on', 'Étape 1 · montée · lampe'), [[15, 28], [43, 56]]],
                [L('Step 2 · stop · wait 5 s · light on', 'Étape 2 · arrêt · 5 s · témoin'), [[28, 43], [56, 71]]],
                [L('Step 3 · going down · lamp on', 'Étape 3 · descente · lampe'), [[71, 90]]]
            ], 440, 130, 330);
            s += T(605, 110, L('Active Grafcet step', 'Étape active du Grafcet'), 't') + st.body;
            return svg(s, css + st.css, L('Elevator driven by its Grafcet', 'Ascenseur piloté par son Grafcet'));
        }
    };

    /* CLIMAX arm --------------------------------------------------------- */
    V['climax-plc-robot-arm'] = {
        schema: L => {
            const chain = [['Grafcet', L('8 steps', '8 étapes')], ['Ladder', L('1 page / transition', '1 page / transition')], ['TSX 3705', 'PL7-Pro'], [L('CLIMAX arm', 'Bras CLIMAX'), L('5 cylinders', '5 vérins')]];
            let s = chain.map(([t, sub], i) => node(20 + i * 196, 24, 170, 70, t, sub, { dark: i === 2 })).join('') + [0, 1, 2].map(i => line(`M${190 + i * 196} 59 H${214 + i * 196}`)).join('');
            s += T(400, 132, L('“Chip factory” cycle', 'Cycle « usine de frites »'), 't');
            const cyc = [[L('Grab basket', 'Saisie panier'), ''], [L('Lift', 'Montée'), ''], [L('Drain 5 s', 'Égouttage 5 s'), 'Temp1 (TON)'], [L('Rotate', 'Rotation'), ''], [L('Salt 5 s', 'Sel 5 s'), 'Temp2'], [L('Shake ×3', 'Secouage ×3'), L('counter Ca, CP = 3', 'compteur Ca, CP = 3')]];
            cyc.forEach(([t, sub], i) => {
                const row = i < 3 ? 0 : 1, col = row ? 5 - i : i;
                s += node(40 + col * 250, 150 + row * 120, 210, 76, t, sub || [], { cls: sub ? 'hl' : '' });
            });
            s += line('M250 188 H290') + line('M500 188 H540') + line('M645 226 V270') + line('M540 308 H500') + line('M290 308 H250') + line('M145 270 V226', 'd');
            s += T(152, 255, L('back to start', 'retour'), 's', 'start');
            s += note([L('Each Grafcet transition becomes a Ladder page; the POST section links each step bit to its physical output.', 'Chaque transition du Grafcet devient une page Ladder ; la section POST relie chaque étape à sa sortie.'),
                L('Shaking loop: down + up, repeated until the counter reaches 3 (COMPARE Ca.P < 3), reset at each cycle.', 'Boucle de secouage : descente + montée jusqu’à Ca = 3 (COMPARE Ca.P < 3), remise à zéro à chaque cycle.')]);
            return svg(s, '', L('From Grafcet to the real CLIMAX arm', 'Du Grafcet au bras CLIMAX réel'));
        },
        anim: L => {
            const id = 'svc' + (++uid), D = 16;
            const css = `@keyframes ${id}a{0%,8%{transform:translate(0,0)}16%,38%{transform:translate(0,-90px)}46%,62%{transform:translate(230px,-90px)}66%{transform:translate(230px,-40px)}70%{transform:translate(230px,-90px)}74%{transform:translate(230px,-40px)}78%{transform:translate(230px,-90px)}82%{transform:translate(230px,-40px)}86%{transform:translate(230px,-90px)}94%{transform:translate(0,-90px)}100%{transform:translate(0,0)}}
                .${id}a{animation:${id}a ${D}s ease-in-out infinite}
                @keyframes ${id}j{0%,3%{transform:translateX(0)}7%,94%{transform:translateX(9px)}98%,100%{transform:translateX(0)}}.${id}j{animation:${id}j ${D}s ease-in-out infinite}.${id}k{animation:${id}j ${D}s ease-in-out infinite reverse}
                @keyframes ${id}x{0%,38%{transform:scaleX(.25)}46%,86%{transform:scaleX(1)}94%,100%{transform:scaleX(.25)}}.${id}x{transform-box:fill-box;transform-origin:left;animation:${id}x ${D}s ease-in-out infinite}`
                + phases(id + 'd', D, [[16, 38]]) + phases(id + 'g', D, [[47, 62]]) + phases(id + 'n1', D, [[66, 74]]) + phases(id + 'n2', D, [[74, 82]]) + phases(id + 'n3', D, [[82, 92]]);
            let s = `<line x1="30" y1="420" x2="560" y2="420" class="ground"/>`
                + `<rect x="40" y="90" width="34" height="330" rx="6" class="m2"/><rect x="74" y="106" width="306" height="20" rx="6" class="m1 ${id}x"/>`
                + `<path d="M120 340 h110 l-12 76 h-86z" class="fryer"/>` + T(175, 445, L('fryer', 'friteuse'), 's')
                + `<g transform="translate(470 120)"><rect x="-22" y="0" width="44" height="60" rx="10" class="m1"/><path d="M-12 0 v-12 h24 v12" class="m2"/></g>` + T(470, 108, L('salt', 'sel'), 's')
                + `<g class="${id}g">${[0, 1, 2, 3, 4].map(i => `<circle cx="${458 + i * 6}" cy="${196 + (i % 2) * 14}" r="2.5" class="acc"/>`).join('')}</g>`;
            s += `<g class="${id}a"><line x1="150" y1="116" x2="150" y2="300" class="shaft"/>`
                + `<rect x="${136}" y="296" width="8" height="26" class="m2 ${id}k"/><rect x="${156}" y="296" width="8" height="26" class="m2 ${id}j"/>`
                + `<path d="M120 322 h60 l-8 40 h-44z" class="basket"/><path d="M128 334 h44 M126 346 h48" class="mesh"/>`
                + `<g class="${id}d"><circle cx="138" cy="378" r="3" class="liqdot"/><circle cx="160" cy="392" r="3" class="liqdot"/><circle cx="150" cy="404" r="3" class="liqdot"/></g></g>`;
            s += `<g class="${id}n1">${T(410, 330, 'Ca = 1', 't')}</g><g class="${id}n2">${T(410, 330, 'Ca = 2', 't')}</g><g class="${id}n3">${T(410, 330, 'Ca = 3', 't')}</g>`;
            const st = stepper(id + 's', D, [
                [L('Grab the basket', 'Saisie du panier'), [[0, 8]]],
                [L('Lift', 'Montée'), [[8, 16]]],
                [L('Drain · Temp1 5 s', 'Égouttage · Temp1 5 s'), [[16, 38]]],
                [L('Rotate', 'Rotation'), [[38, 46]]],
                [L('Add salt · Temp2 5 s', 'Ajout du sel · Temp2 5 s'), [[46, 62]]],
                [L('Shake ×3 · counter Ca', 'Secouage ×3 · Ca'), [[62, 88]]],
                [L('Back to start', 'Retour'), [[88, 100]]]
            ], 570, 70, 215);
            return svg(s + st.body, css + st.css, L('CLIMAX arm running the chip factory cycle', 'Bras CLIMAX qui exécute le cycle usine de frites'));
        }
    };

    /* Point cloud -------------------------------------------------------- */
    function cloudPoints(n) {
        const pts = [];
        for (let i = 0; i < n; i++) {
            const u = 2 * Math.PI * i / n, v = ((i * 0.618034) % 1) * 2 * Math.PI;
            pts.push([(1 + 0.42 * Math.cos(v)) * Math.cos(u), 0.42 * Math.sin(v), (1 + 0.42 * Math.cos(v)) * Math.sin(u)]);
        }
        return pts;
    }
    function drawCloud(pts, a, cx, cy, sc, tilt = 0.5) {
        const ca = Math.cos(a), sa = Math.sin(a), ct = Math.cos(tilt), st = Math.sin(tilt);
        return pts.map(([x, y, z]) => {
            const x1 = x * ca + z * sa, z1 = -x * sa + z * ca;
            const y2 = y * ct - z1 * st, z2 = y * st + z1 * ct;
            return [x1, y2, z2];
        }).sort((p, q) => p[2] - q[2]).map(([x, y, z]) => `<circle cx="${(cx + x * sc).toFixed(1)}" cy="${(cy + y * sc).toFixed(1)}" r="${(2 + (z + 1.4) * 0.9).toFixed(2)}" class="pt" style="opacity:${(0.35 + (z + 1.4) * 0.22).toFixed(2)}"/>`).join('');
    }
    V['point-cloud-3d'] = {
        schema: L => svg(
            `<g>${drawCloud(cloudPoints(260), 0.6, 110, 150, 62)}</g>` + T(110, 236, L('Point cloud (x, y, z)', 'Nuage de points (x, y, z)'), 't')
            + line('M200 150 H236') + node(238, 104, 160, 92, 'Open3D', [L('load', 'chargement'), L('process', 'traitement')])
            + line('M398 150 H428') + node(430, 104, 160, 92, 'PyVista', L('3D visualisation', 'visualisation 3D'))
            + line('M590 150 H620') + node(622, 104, 160, 92, 'Tkinter', L('simple interface', 'interface simple'), { dark: true })
            + `<g transform="translate(470 270)"><rect width="300" height="120" rx="12" class="win"/><rect width="300" height="24" rx="12" class="winbar"/><circle cx="16" cy="12" r="4" class="acc"/>`
            + `<rect x="14" y="40" width="80" height="22" rx="6" class="btnp"/><rect x="14" y="72" width="80" height="22" rx="6" class="btnp"/>`
            + `<g>${drawCloud(cloudPoints(120), 1.3, 200, 74, 38)}</g></g>`
            + `<path d="M702 196 V266" class="ln d"/>`
            + note([L('Python examples: read a point cloud, process it with Open3D, view it in 3D with PyVista,', 'Exemples en Python : lire un nuage de points, le traiter avec Open3D, le voir en 3D avec PyVista,'),
                L('and drive everything from small Tkinter windows.', 'et tout piloter depuis de petites fenêtres Tkinter.')]),
            '', L('Point cloud pipeline in Python', 'Chaîne de traitement d’un nuage de points en Python')),
        anim: L => svg(`<g data-cloud></g>` + T(400, 470, L('A point cloud turning in 3D, like in the PyVista viewer', 'Un nuage de points qui tourne en 3D, comme dans la vue PyVista'), 's2'), '', L('Rotating point cloud', 'Nuage de points en rotation')),
        mount(el) {
            const g = el.querySelector('[data-cloud]'); if (!g) return;
            const pts = cloudPoints(700); let a = 0, last = 0;
            const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
            const frame = t => {
                if (!g.isConnected) return;
                if (t - last > 33) { a += 0.012; last = t; g.innerHTML = drawCloud(pts, a, 400, 225, 150); }
                if (!reduce) requestAnimationFrame(frame);
            };
            g.innerHTML = drawCloud(pts, a, 400, 225, 150);
            if (!reduce) requestAnimationFrame(frame);
        }
    };

    /* Client reporting --------------------------------------------------- */
    V['client-reporting'] = {
        schema: L => svg(
            T(30, 46, L('Before', 'Avant'), 'tag', 'start')
            + node(30, 62, 180, 74, L('Client data', 'Données clients')) + line('M210 99 H250')
            + node(252, 62, 220, 74, L('Manual preparation', 'Préparation manuelle'), L('every month', 'chaque mois'), { cls: 'faint' }) + line('M472 99 H512')
            + node(514, 62, 180, 74, L('Report', 'Rapport'), '', { cls: 'faint' })
            + T(30, 196, L('After', 'Après'), 'tag', 'start')
            + node(30, 212, 180, 74, L('Client data', 'Données clients'), L('processes analysed', 'processus analysés')) + line('M210 249 H250')
            + node(252, 212, 220, 74, 'Power BI · Data Studio', L('automated reports', 'rapports automatisés'), { dark: true }) + line('M472 249 H512')
            + node(514, 212, 180, 74, L('KPI dashboards', 'Tableaux de bord KPI'), L('monthly', 'mensuels'))
            + line('M604 286 V330') + node(504, 332, 200, 60, L('Trained users', 'Utilisateurs formés'))
            + note([L('The monthly reporting no longer has to be rebuilt by hand: the dashboards update from the data.', 'Le reporting mensuel n’est plus refait à la main : les tableaux de bord se mettent à jour à partir des données.')]),
            '', L('From manual reporting to automated dashboards', 'Du reporting manuel aux tableaux de bord automatisés')),
        anim: L => {
            const id = 'svr' + (++uid), D = 6;
            const bars = [0.45, 0.7, 0.55, 0.85, 0.65, 0.9];
            const css = bars.map((b, i) => `@keyframes ${id}b${i}{0%,8%{transform:scaleY(.05)}40%,85%{transform:scaleY(${b})}100%{transform:scaleY(.05)}}.${id}b${i}{transform-box:fill-box;transform-origin:bottom;animation:${id}b${i} ${D}s ease-out infinite;animation-delay:${i * 0.08}s}`).join('')
                + `@keyframes ${id}l{0%,10%{stroke-dashoffset:1}50%,85%{stroke-dashoffset:0}100%{stroke-dashoffset:1}}.${id}l{stroke-dasharray:1;animation:${id}l ${D}s ease-in-out infinite}
                   @keyframes ${id}r{to{transform:rotate(360deg)}}.${id}r{transform-box:fill-box;transform-origin:center;animation:${id}r 2s linear infinite}`;
            let s = `<rect x="40" y="30" width="720" height="400" rx="16" class="win"/><rect x="40" y="30" width="720" height="44" rx="16" class="winbar"/>`
                + T(64, 58, L('Monthly KPI dashboard', 'Tableau de bord KPI mensuel'), 't', 'start')
                + `<g transform="translate(722 52)"><path d="M-9 0 A9 9 0 1 1 0 9" class="ln noar ${id}r"/></g>` + T(700, 58, L('auto refresh', 'mise à jour auto'), 's', 'end');
            [0, 1, 2].forEach(i => { s += `<rect x="${64 + i * 228}" y="94" width="208" height="72" rx="12" class="kpi"/><rect x="${80 + i * 228}" y="112" width="70" height="10" rx="5" class="faintbar"/><rect x="${80 + i * 228}" y="132" width="${110 - i * 20}" height="18" rx="6" class="acc"/>`; });
            s += `<rect x="64" y="186" width="330" height="224" rx="12" class="kpi"/>` + bars.map((b, i) => `<rect x="${88 + i * 50}" y="210" width="30" height="180" rx="6" class="bar ${id}b${i}"/>`).join('');
            s += `<rect x="410" y="186" width="326" height="224" rx="12" class="kpi"/><path d="M430 380 L480 340 L530 352 L580 300 L630 316 L680 250 L716 236" class="sv-curve c1 ${id}l" pathLength="1"/>`;
            return svg(s, css, L('Automated KPI dashboard', 'Tableau de bord KPI automatisé'));
        }
    };

    /* CRM ---------------------------------------------------------------- */
    function crmHub(L, animated) {
        const id = 'svm' + (++uid);
        const sats = [[130, 210, L('Sales team', 'Équipe commerciale')], [130, 360, L('Technical teams', 'Équipes techniques')], [670, 210, L('Management', 'Direction'), L('reporting', 'reporting')], [670, 360, 'SAP Ariba', L('connected', 'connexion')]];
        let s = '';
        sats.forEach(([x, y]) => { s += `<path d="M${x} ${y} L400 285" class="ln ${animated ? 'flow' : 'noar'}"/>`; });
        s += `<circle cx="400" cy="285" r="78" class="hubbg"/><circle cx="400" cy="285" r="78" class="hubc"/>` + T(400, 280, 'CRM', 'big') + T(400, 304, L('one shared base', 'base commune'), 's');
        sats.forEach(([x, y, t, sub]) => { s += node(x - 105, y - 34, 210, 68, t, sub || '', { r: 34, dark: t === 'SAP Ariba' }); });
        return { s, id };
    }
    V['crm-digitalisation'] = {
        schema: L => {
            const steps = [L('Needs', 'Besoins'), L('Specifications', 'Cahier des charges'), L('Planning', 'Planification'), L('Rollout', 'Déploiement'), L('Follow-up', 'Suivi')];
            let s = `<line x1="20" y1="58" x2="780" y2="58" class="ln noar"/>` + steps.map((t, i) => node(9 + i * 158, 30, 150, 56, t, '', { r: 12, cls: 'sm' + (i === 3 ? ' hl' : '') })).join('');
            s += crmHub(L, false).s;
            s += note([L('Specified, planned and rolled out a CRM, connected to SAP Ariba, coordinated business and tech teams.', 'Cahier des charges, planification et déploiement d’un CRM, connexion à SAP Ariba, coordination métiers / techniques.')]);
            return svg(s, '', L('CRM rollout: project steps and connected teams', 'Déploiement du CRM : étapes et équipes connectées'));
        },
        anim: L => {
            const h = crmHub(L, true);
            const pulse = `@keyframes ${h.id}p{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}.${h.id}p{transform-box:fill-box;transform-origin:center;animation:${h.id}p 2.4s ease-in-out infinite}`;
            return svg(h.s.replace('class="hubc"', `class="hubc ${h.id}p"`) + T(400, 80, L('Sales activity flows into one CRM', 'L’activité commerciale converge vers un seul CRM'), 't')
                + T(400, 108, L('and is shared with management and SAP Ariba', 'puis est partagée avec la direction et SAP Ariba'), 's'), pulse, L('Data flowing through the CRM', 'Les données qui circulent dans le CRM'));
        }
    };

    window.systemVisuals = {
        get(id, lang) {
            const v = V[id]; if (!v) return [];
            curLang = lang;
            const L = (en, frText) => (lang === 'fr' ? frText : en);
            const meta = {
                schema: { icon: 'bx-git-repo-forked', label: L('Diagram', 'Schéma'), cap: L('How the system works', 'Comment fonctionne le système') },
                anim: { icon: 'bx-movie-play', label: L('Animation', 'Animation'), cap: L('The system in motion', 'Le système en mouvement') },
                sim: { icon: 'bx-line-chart', label: L('Curve', 'Courbe'), cap: L('Simulation with the project values', 'Simulation avec les valeurs du projet') }
            };
            return ['schema', 'anim', 'sim'].filter(k => v[k]).map(k => ({ kind: k, ...meta[k], html: v[k](L) }));
        },
        mount(id, el) { const v = V[id]; if (v && v.mount) v.mount(el); }
    };
})();
