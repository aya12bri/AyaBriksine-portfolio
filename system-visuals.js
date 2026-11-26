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
    function stepper(id, dur, items, x, y, w, gap = 44, hh = 36) {
        // a list of steps on the right; the active one lights up
        let css = '', body = '';
        items.forEach(([label, spans], i) => {
            const n = `${id}-p${i}`;
            css += phases(n, dur, spans);
            const yy = y + i * gap, ty = yy + hh / 2 + 5;
            body += `<g class="sv-step"><rect x="${x}" y="${yy}" width="${w}" height="${hh}" rx="9"/>${T(x + 12, ty, label, 's2', 'start')}</g>`
                + `<g class="${n}"><rect class="sv-step-on" x="${x}" y="${yy}" width="${w}" height="${hh}" rx="9"/>${T(x + 12, ty, label, 's2 on', 'start')}</g>`;
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
                .${id}r{transform:translate(400px,230px);animation:${id}r 9s ease-in-out infinite}`
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
            const reduce = false;
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

    /* ---------- Automation labs (M340 / S7-300): diagram, animation and Grafcet ---------- */

    /* kf(): keyframes from a list of [percent, css] pairs */
    const kf = (name, list, dur, extra = '') => `@keyframes ${name}{${list.map(([p, c]) => `${p}%{${c}}`).join('')}}.${name}{${extra}animation:${name} ${dur}s linear infinite}`;
    const tr = (x, y) => `transform:translate(${x}px,${y}px)`;

    /* gcol(): one Grafcet column. steps = [{ n, a: [actions], t: 'condition to the next step' }] */
    function gcol(x, y, steps, o = {}) {
        const h = o.h || 40, bw = 30, bh = 24, cx = x + bw / 2;
        let s = '';
        steps.forEach((st, i) => {
            const yy = y + i * h, init = i === 0 && o.init !== false;
            s += `<g class="sv-gstep${init ? ' init' : ''}"><rect x="${x}" y="${yy}" width="${bw}" height="${bh}"/>${init ? `<rect x="${x + 3}" y="${yy + 3}" width="${bw - 6}" height="${bh - 6}"/>` : ''}${T(cx, yy + 17, st.n, 'gn')}</g>`;
            let ax = x + bw + 12;
            if (st.a && st.a.length) s += `<line x1="${x + bw}" y1="${yy + bh / 2}" x2="${ax}" y2="${yy + bh / 2}" class="gl"/>`;
            (st.a || []).forEach(a => { const w = a.length * 6.6 + 14; s += `<rect x="${ax}" y="${yy + 1}" width="${w}" height="${bh - 2}" class="act"/>` + T(ax + w / 2, yy + 16, a, 'ga'); ax += w; });
            const last = i === steps.length - 1;
            if (!last || o.loop !== false || o.tail) {
                const ty = yy + bh + (h - bh) / 2;
                s += `<line x1="${cx}" y1="${yy + bh}" x2="${cx}" y2="${last ? ty + 8 : yy + h}" class="gl"/><line x1="${cx - 8}" y1="${ty}" x2="${cx + 8}" y2="${ty}" class="trans"/>` + (st.t ? T(cx + 14, ty + 4, st.t, 'gt', 'start') : '');
            }
        });
        if (o.loop !== false) {
            const yEnd = y + (steps.length - 1) * h + h - 4, lx = x - 16;
            s += `<path d="M${cx} ${yEnd} V${yEnd + 6} H${lx} V${y - 10} H${cx} V${y - 1}" class="gl ln-loop" marker-end="url(#sv-ar)"/>`;
        }
        if (o.title) s += T(x - 16, y - 22, o.title, 'tag', 'start');
        return s;
    }
    const legend = (lines, y) => `<g class="sv-note"><rect x="24" y="${y}" width="${W - 48}" height="${14 + lines.length * 18}" rx="10"/>${lines.map((l, i) => T(38, y + 24 + i * 18, l, 'gt', 'start')).join('')}</g>`;

    /* Manipulator arm, Schneider M340 */
    V['manipulator-arm-m340'] = {
        schema: L => {
            let s = node(16, 40, 168, 78, L('Potentiometers', 'Potentiomètres'), [L('rotation, height,', 'rotation, hauteur,'), L('reach', 'avance')])
                + line('M184 79 H214') + node(216, 40, 160, 78, 'M340', L('analog inputs', 'entrées analogiques'), { dark: true })
                + line('M376 79 H406') + node(408, 40, 170, 78, L('Comparison blocks', 'Blocs de comparaison'), L('value ≥ threshold', 'valeur ≥ seuil'))
                + line('M578 79 H608') + node(610, 40, 174, 78, L('Position bits', 'Bits de position'), [L('A, B, high, low,', 'A, B, haute, basse,'), L('back', 'recul')]);
            s += line('M697 118 V150 H400 V170') + node(300, 172, 200, 56, 'Grafcet', L('pick-and-place + initial position', 'prise/dépose + position initiale'), { r: 12 });
            s += line('M400 228 V250');
            const outs = [['FER / OUV', L('gripper', 'pince')], ['MON / DES', L('up / down', 'montée / descente')], ['TRI / HOR', L('rotation', 'rotation')], ['REC', L('back', 'recul')], ['CLI', L('blinking light', 'voyant clignotant')]];
            s += `<line x1="96" y1="250" x2="704" y2="250" class="ln noar"/>` + outs.map(([t, sub], i) => line(`M${96 + i * 152} 250 V266`) + node(26 + i * 152, 268, 140, 60, t, sub, { r: 12 })).join('');
            // path over the obstacle
            s += `<line x1="140" y1="420" x2="660" y2="420" class="ground"/><rect x="360" y="370" width="80" height="50" rx="6" class="m2"/>` + T(400, 400, L('obstacle', 'obstacle'), 's2 inv')
                + `<path d="M210 410 V350 H590 V410" class="ln d"/>` + `<rect x="196" y="392" width="28" height="28" rx="4" class="cup"/>` + T(210, 440, 'A', 't') + T(590, 440, 'B', 't')
                + T(400, 342, L('up first, then rotate', 'monter d’abord, puis tourner'), 's');
            return svg(s + legend([L('The cup is lifted above the obstacle before the arm rotates from A to B.', 'Le gobelet est levé au-dessus de l’obstacle avant que le bras tourne de A vers B.')], 456), '', L('Manipulator arm driven by the M340', 'Bras manipulateur piloté par le M340'));
        },
        anim: L => {
            const id = 'sva' + (++uid), D = 14;
            let css = kf(id + 'x', [[0, tr(0, 0)], [22, tr(0, 0)], [40, tr(260, 0)], [64, tr(260, 0)], [84, tr(0, 0)], [100, tr(0, 0)]], D)
                + kf(id + 'y', [[0, tr(0, 0)], [12, tr(0, 0)], [22, tr(0, -120)], [40, tr(0, -120)], [50, tr(0, 0)], [56, tr(0, 0)], [64, tr(0, -120)], [84, tr(0, -120)], [92, tr(0, 0)], [100, tr(0, 0)]], D)
                + kf(id + 'cx', [[0, tr(0, 0)], [22, tr(0, 0)], [40, tr(260, 0)], [95, tr(260, 0)], [95.01, tr(0, 0)], [100, tr(0, 0)]], D)
                + kf(id + 'cy', [[0, tr(0, 0) + ';opacity:0'], [3, tr(0, 0) + ';opacity:1'], [12, tr(0, 0)], [22, tr(0, -120)], [40, tr(0, -120)], [50, tr(0, 0)], [93, tr(0, 0) + ';opacity:1'], [95, tr(0, 0) + ';opacity:0'], [100, tr(0, 0) + ';opacity:0']], D)
                + kf(id + 'j', [[0, tr(0, 0)], [6, tr(0, 0)], [12, tr(7, 0)], [50, tr(7, 0)], [56, tr(0, 0)], [100, tr(0, 0)]], D)
                + kf(id + 'k', [[0, tr(0, 0)], [6, tr(0, 0)], [12, tr(-7, 0)], [50, tr(-7, 0)], [56, tr(0, 0)], [100, tr(0, 0)]], D)
                + kf(id + 'r', [[0, 'transform:scaleX(.1)'], [22, 'transform:scaleX(.1)'], [40, 'transform:scaleX(1)'], [64, 'transform:scaleX(1)'], [84, 'transform:scaleX(.1)'], [100, 'transform:scaleX(.1)']], D, 'transform-box:fill-box;transform-origin:left;')
                + kf(id + 'h', [[0, 'transform:scaleX(.1)'], [12, 'transform:scaleX(.1)'], [22, 'transform:scaleX(1)'], [40, 'transform:scaleX(1)'], [50, 'transform:scaleX(.1)'], [56, 'transform:scaleX(.1)'], [64, 'transform:scaleX(1)'], [84, 'transform:scaleX(1)'], [92, 'transform:scaleX(.1)'], [100, 'transform:scaleX(.1)']], D, 'transform-box:fill-box;transform-origin:left;')
                + phases(id + 'A', D, [[0, 22], [84, 100]]) + phases(id + 'B', D, [[40, 64]]) + phases(id + 'H', D, [[22, 40], [64, 84]]) + phases(id + 'D', D, [[0, 12], [50, 56], [92, 100]]) + phases(id + 'L', D, [[12, 50]]);
            let s = `<line x1="40" y1="420" x2="500" y2="420" class="ground"/><rect x="20" y="64" width="480" height="18" rx="6" class="m2"/>`
                + `<rect x="250" y="360" width="70" height="60" rx="6" class="m2"/>` + T(285, 395, L('obstacle', 'obstacle'), 's2 inv')
                + T(130, 446, 'A', 't') + T(390, 446, 'B', 't');
            s += `<g class="${id}cx"><g class="${id}cy"><rect x="116" y="382" width="28" height="38" rx="4" class="cup"/></g></g>`;
            s += `<g class="${id}x"><rect x="110" y="56" width="40" height="34" rx="6" class="m1"/><rect x="124" y="90" width="12" height="150" class="m2"/>`
                + `<g class="${id}y"><rect x="126" y="230" width="8" height="140" class="shaft-r"/><rect x="108" y="366" width="44" height="10" rx="3" class="m2"/>`
                + `<g class="${id}k"><rect x="108" y="376" width="7" height="30" class="m2"/></g><g class="${id}j"><rect x="145" y="376" width="7" height="30" class="m2"/></g>`
                + `<circle cx="160" cy="356" r="6" class="lamp off"/><circle cx="160" cy="356" r="6" class="lamp wait sv-blink ${id}L"/></g></g>`;
            // M340 panel: analog values and comparison bits
            s += `<g transform="translate(520 40)"><rect width="260" height="150" rx="14" class="kpi"/>` + T(16, 26, L('M340 · analog inputs', 'M340 · entrées analogiques'), 's2', 'start')
                + T(16, 54, L('rotation', 'rotation'), 's', 'start') + `<rect x="90" y="44" width="150" height="12" rx="6" class="faintbar"/><rect x="90" y="44" width="150" height="12" rx="6" class="bar ${id}r"/>`
                + T(16, 80, L('height', 'hauteur'), 's', 'start') + `<rect x="90" y="70" width="150" height="12" rx="6" class="faintbar"/><rect x="90" y="70" width="150" height="12" rx="6" class="bar ${id}h"/>`
                + [['A', 'A'], ['B', 'B'], ['H', L('high', 'haute')], ['D', L('low', 'basse')]].map(([k, t], i) => `<circle cx="${30 + i * 62}" cy="112" r="8" class="lamp off"/><circle cx="${30 + i * 62}" cy="112" r="8" class="lamp ok ${id}${k}"/>` + T(30 + i * 62, 138, t, 's')).join('') + `</g>`;
            const st = stepper(id + 's', D, [
                [L('0 · initial position', '0 · position initiale'), [[0, 6]]], [L('1 · close gripper (FER)', '1 · fermer la pince (FER)'), [[6, 12]]],
                [L('2 · up (MON) · CLI', '2 · monter (MON) · CLI'), [[12, 22]]], [L('3 · rotate to B (TRI)', '3 · tourner vers B (TRI)'), [[22, 40]]],
                [L('4 · down (DES)', '4 · descendre (DES)'), [[40, 50]]], [L('5 · open (OUV)', '5 · ouvrir (OUV)'), [[50, 56]]],
                [L('6 · up (MON)', '6 · monter (MON)'), [[56, 64]]], [L('7 · back to A (HOR)', '7 · revenir en A (HOR)'), [[64, 84]]], [L('8–9 · back to initial position', '8–9 · retour position initiale'), [[84, 100]]]
            ], 520, 204, 260, 32, 28);
            return svg(s + st.body, css + st.css, L('Arm moving the cup over the obstacle', 'Bras qui passe le gobelet au-dessus de l’obstacle'));
        },
        prog: L => svg(
            gcol(40, 50, [
                { n: '0', a: [L('Initial position', 'Position initiale')], t: L('start · initial pos.', 'dcy · pos. initiale') },
                { n: '1', a: ['FER'], t: L('gripper closed', 'pince fermée') }, { n: '2', a: ['MON', 'CLI'], t: L('high pos.', 'pos. haute') },
                { n: '3', a: ['TRI', 'CLI'], t: L('pos. B', 'pos. B') }, { n: '4', a: ['DES', 'CLI'], t: L('low pos.', 'pos. basse') },
                { n: '5', a: ['OUV'], t: L('gripper open', 'pince ouverte') }, { n: '6', a: ['MON'], t: L('high pos.', 'pos. haute') },
                { n: '7', a: ['HOR'], t: L('pos. A', 'pos. A') }, { n: '8', t: L('initial pos.', 'pos. init') }, { n: '9', t: L('back pos.', 'pos. recul') }
            ], { h: 38, title: L('Pick and place', 'Prise et dépose') })
            + gcol(440, 50, [
                { n: '0', a: [L('Waiting', 'Attente')], t: 'init' }, { n: '1', a: ['OUV'], t: L('gripper open', 'pince ouverte') },
                { n: '2', a: ['MON'], t: L('high pos.', 'pos. haute') }, { n: '3', a: ['REC'], t: L('back pos.', 'pos. recul') },
                { n: '4', a: ['HOR'], t: L('pos. A', 'pos. A') }, { n: '5', a: ['DES'], t: L('low pos.', 'pos. basse') },
                { n: '6', a: [L('Initial position OK', 'Position initiale OK')], t: L('1 (always true)', '1 (toujours vrai)') }
            ], { h: 38, title: L('Back to initial position', 'Mise en position initiale') })
            + `<g transform="translate(410 340)"><rect width="370" height="118" rx="12" class="kpi"/>` + [
                L('FER / OUV: close / open gripper', 'FER / OUV : fermer / ouvrir la pince'), L('MON / DES: up / down', 'MON / DES : montée / descente'),
                L('TRI / HOR: rotate one way / the other', 'TRI / HOR : rotation sens trigo / horaire'), L('REC: back · CLI: blinking light', 'REC : recul · CLI : voyant clignotant')
            ].map((t, i) => T(16, 28 + i * 24, t, 'gt', 'start')).join('') + `</g>`,
            '', L('Grafcets of the manipulator arm', 'Grafcets du bras manipulateur'))
    };

    /* Overhead crane, Schneider M340 */
    const craneSteps = L => [
        { n: '0', a: [L('Wait: P1, hoist up', 'Attente : P1, palan haut')], t: 'dcy · PV · P1' },
        { n: '1', a: ['RD'], t: 'Ca = 9 ' + L('turns', 'tours') }, { n: '2', a: ['RAI', 'T/2s'], t: 't/2s' },
        { n: '3', a: ['RM', 'RAI'], t: 'Ca = 5 ' + L('turns', 'tours') }, { n: '4', a: ['RDD', 'RAI'], t: 'P2' },
        { n: '5', a: ['RD', 'RAI'], t: 'Ca = 7 ' + L('turns', 'tours') }, { n: '6', a: ['RAI', 'T/2s'], t: 't/2s' },
        { n: '7', a: ['RM', 'RAI'], t: 'Ca = 7 ' + L('turns', 'tours') }, { n: '8', a: ['RDD', 'RAI'], t: 'P3' },
        { n: '9', a: ['RD', 'RAI'], t: 'Ca = 7 ' + L('turns', 'tours') }, { n: '10', a: ['RAI', 'T/2s'], t: 't/2s' },
        { n: '11', a: ['RM', 'RAI'], t: 'Ca = 7 ' + L('turns', 'tours') }, { n: '12', a: ['RDD', 'RAI'], t: 'P4' },
        { n: '13', a: ['RD', 'RAI'], t: 'Ca = 5 ' + L('turns', 'tours') }, { n: '14', a: [L('magnet off', 'aimant coupé')], t: '' },
        { n: '15', a: ['RM'], t: 'Ca = 9 ' + L('turns', 'tours') }, { n: '16', a: ['RDG'], t: 'P1' }
    ];
    V['overhead-crane-m340'] = {
        schema: L => {
            const X = [110, 296, 482, 668], u = 16, y0 = 96;   // hoist height: one turn = 16 px
            const Y = h => y0 - h * u;
            let s = T(400, 50, L('→ trolley right (RDD) between stations · ← back left (RDG) to P1', '→ chariot à droite (RDD) entre les postes · ← retour à gauche (RDG) vers P1'), 's');
            s += `<rect x="${X[1] - 44}" y="${Y(-10)}" width="88" height="${Y(-13) - Y(-10)}" rx="6" class="liq"/><rect x="${X[2] - 44}" y="${Y(-10)}" width="88" height="${Y(-13) - Y(-10)}" rx="6" class="liq"/>`
                + `<rect x="${X[0] - 30}" y="${Y(-9) + 16}" width="60" height="${Y(-13) - Y(-9) - 16}" rx="6" class="m1"/><rect x="${X[3] - 30}" y="${Y(-9) + 16}" width="60" height="${Y(-13) - Y(-9) - 16}" rx="6" class="m1"/>`;
            const pts = [[0, 0], [0, -9], [0, -4], [1, -4], [1, -11], [1, -4], [2, -4], [2, -11], [2, -4], [3, -4], [3, -9], [3, 0], [0, 0]];
            s += `<path d="M${pts.map(([k, h]) => X[k] + ' ' + Y(h)).join(' L')}" class="ln path3" marker-end="url(#sv-ar)"/>`;
            s += X.map((x, i) => T(x, Y(-13) + 22, 'P' + (i + 1), 't') + T(x, Y(-13) + 40, [L('pick-up', 'prise'), L('bath', 'bain'), L('bath', 'bain'), L('drop-off', 'dépose')][i], 's')).join('');
            const stack = (x, lines, anchor) => lines.map((t, i) => T(x, Y(-5.2) + i * 18, t, 's2', anchor)).join('');
            s += stack(X[0] + 10, ['↓ 9 tr', L('magnet 2 s', 'aimant 2 s'), '↑ 5 tr'], 'start')
                + stack(X[1] + 10, ['↓ 7 tr', L('treatment 2 s', 'traitement 2 s'), '↑ 7 tr'], 'start')
                + stack(X[2] + 10, ['↓ 7 tr', L('treatment 2 s', 'traitement 2 s'), '↑ 7 tr'], 'start')
                + stack(X[3] - 10, ['↓ 5 tr', L('magnet off', 'aimant coupé'), '↑ 9 tr'], 'end');
            s += node(24, 372, 230, 56, 'M340', L('Grafcet · counter Ca · timers', 'Grafcet · compteur Ca · tempos'), { dark: true })
                + node(286, 372, 230, 56, L('Hoist', 'Palan'), L('RD / RM · turns counted', 'RD / RM · tours comptés'), { r: 12 })
                + node(548, 372, 230, 56, L('Trolley + magnet', 'Chariot + aimant'), 'RDD / RDG · RAI', { r: 12 });
            return svg(s + legend([L('Heights are measured by counting hoist turns (Ca): no position sensor on the hoist.', 'Les hauteurs se mesurent en comptant les tours du palan (Ca) : pas de capteur de position sur le palan.')], 444), '', L('Overhead crane cycle', 'Cycle du pont roulant'));
        },
        anim: L => {
            const id = 'svp' + (++uid), D = 22, dx = 125, uy = 12;
            const tl = [[0, 0, 0], [5, 0, 9], [10, 0, 9], [14, 0, 4], [20, 1, 4], [25, 1, 11], [30, 1, 11], [35, 1, 4], [41, 2, 4], [46, 2, 11], [51, 2, 11], [56, 2, 4], [62, 3, 4], [66, 3, 9], [70, 3, 9], [75, 3, 0], [88, 0, 0], [100, 0, 0]];
            const part = [[0, 0, 9, 0], [2, 0, 9, 1], [10, 0, 9, 1], [14, 0, 4, 1], [20, 1, 4, 1], [25, 1, 11, 1], [30, 1, 11, 1], [35, 1, 4, 1], [41, 2, 4, 1], [46, 2, 11, 1], [51, 2, 11, 1], [56, 2, 4, 1], [62, 3, 4, 1], [66, 3, 9, 1], [93, 3, 9, 1], [96, 3, 9, 0], [100, 3, 9, 0]];
            let css = kf(id + 't', tl.map(([p, k]) => [p, tr(k * dx, 0)]), D)
                + kf(id + 'h', tl.map(([p, , h]) => [p, tr(0, h * uy)]), D)
                + kf(id + 'c', tl.map(([p, , h]) => [p, `transform:scaleY(${((60 + h * uy) / (60 + 11 * uy)).toFixed(3)})`]), D, 'transform-box:fill-box;transform-origin:top;')
                + kf(id + 'q', part.map(([p, k, h, o]) => [p, tr(k * dx, h * uy) + `;opacity:${o}`]), D)
                + phases(id + 'm', D, [[5, 70]]) + phases(id + 'd', D, [[0, 5], [10, 14], [20, 25], [30, 35], [41, 46], [51, 56], [62, 66], [70, 75]]) + phases(id + 'w', D, [[5, 10], [25, 30], [46, 51]]);
            let s = `<rect x="20" y="60" width="500" height="14" rx="6" class="m2"/><line x1="20" y1="430" x2="520" y2="430" class="ground"/>`;
            [0, 1, 2, 3].forEach(k => {
                const x = 80 + k * dx;
                s += T(x, 452, 'P' + (k + 1), 't');
                if (k === 1 || k === 2) s += `<rect x="${x - 42}" y="260" width="84" height="170" rx="8" class="tank"/><rect x="${x - 39}" y="280" width="78" height="147" rx="6" class="liq"/>`;
                else s += `<rect x="${x - 34}" y="280" width="68" height="150" rx="6" class="m1"/>`;
            });
            // part: hangs 30 px under the hook origin; at h = 9 it sits on the stand of P1/P4
            s += `<g class="${id}q"><rect x="62" y="156" width="36" height="16" rx="3" class="part"/></g>`;
            s += `<g class="${id}t"><rect x="56" y="52" width="48" height="32" rx="6" class="m1"/><circle cx="80" cy="68" r="9" class="disc"/><g transform="translate(80 68)"><g class="${id}d"><g class="spin"><line x1="-7" y1="0" x2="7" y2="0" class="spoke"/><line x1="0" y1="-7" x2="0" y2="7" class="spoke"/></g></g></g>`
                + `<rect x="78" y="84" width="4" height="${60 + 11 * uy}" class="cable ${id}c"/>`
                + `<g class="${id}h"><rect x="64" y="144" width="32" height="12" rx="3" class="magnet"/><rect x="64" y="144" width="32" height="12" rx="3" class="magnet-on ${id}m"/></g></g>`;
            s += `<g class="${id}w">${T(270, 30, L('timer: 2 s', 'temporisation : 2 s'), 't')}</g>`;
            const st = stepper(id + 's', D, [
                [L('Down 9 turns at P1', 'Descente 9 tours en P1'), [[0, 5]]], [L('Magnet on · 2 s', 'Aimant (RAI) · 2 s'), [[5, 10]]],
                [L('Up 5 turns', 'Montée 5 tours'), [[10, 14]]], [L('Move right to P2', 'Vers P2 (RDD)'), [[14, 20]]],
                [L('P2: 7 turns down · 2 s', 'P2 : bain 7 tours · 2 s'), [[20, 35]]], [L('Move right to P3', 'Vers P3 (RDD)'), [[35, 41]]],
                [L('P3: 7 turns down · 2 s', 'P3 : bain 7 tours · 2 s'), [[41, 56]]], [L('Move right to P4', 'Vers P4 (RDD)'), [[56, 62]]],
                [L('P4: drop, magnet off', 'P4 : dépose, aimant coupé'), [[62, 75]]], [L('Up 9 turns, back to P1', 'Montée 9 tours, retour P1'), [[75, 100]]]
            ], 540, 40, 244, 40, 32);
            return svg(s + st.body, css + st.css, L('Overhead crane carrying the part through the baths', 'Pont roulant qui passe la pièce dans les bains'));
        },
        prog: L => {
            const st = craneSteps(L);
            return svg(gcol(46, 40, st.slice(0, 9), { h: 42, loop: false, tail: true })
                + T(61, 40 + 9 * 42 + 8, L('↓ continues at step 9', '↓ suite à l’étape 9'), 'gt', 'middle')
                + gcol(436, 40, st.slice(9), { h: 42, init: false, loop: false, tail: true })
                + `<path d="M451 ${40 + 7 * 42 + 33} V${40 + 7 * 42 + 46} H400 V30 H61 V38" class="gl ln-loop" marker-end="url(#sv-ar)"/>` + T(392, 46, L('back to step 0', 'retour à l’étape 0'), 'gt', 'end')
                + legend([L('RD / RM: hoist down / up · RDD / RDG: trolley right / left · RAI: electromagnet', 'RD / RM : palan descente / montée · RDD / RDG : chariot droite / gauche · RAI : électro-aimant'), L('Ca: hoist turn counter · VMA: running light, on during the whole cycle', 'Ca : compteur de tours du palan · VMA : voyant de marche, allumé pendant tout le cycle')], 440),
                '', L('Grafcet of the overhead crane', 'Grafcet du pont roulant'));
        }
    };

    /* Elevator, Siemens S7-300 */
    V['elevator-s7-300'] = {
        schema: L => {
            const ins = [[L('Cabin calls', 'Appels cabine'), L('floors 1, 2, 3', 'étages 1, 2, 3')], [L('Landing calls', 'Appels paliers'), L('at each floor', 'à chaque étage')], [L('Floor sensors', 'Capteurs d’étage'), L('cabin present', 'présence cabine')]];
            const outs = [[L('Up', 'Montée'), ''], [L('Down', 'Descente'), ''], [L('Cabin lamp', 'Lampe cabine'), ''], [L('Floor lights', 'Témoins d’étage'), '']];
            let s = ins.map(([t, sub], i) => node(20, 40 + i * 92, 200, 70, t, sub) + line(`M220 ${75 + i * 92} H286`)).join('');
            s += node(288, 40, 220, 254, 'S7-300', ['Grafcet', L('timer 5 s at each stop', 'tempo 5 s à chaque arrêt'), L('choice of direction', 'choix du sens')], { dark: true });
            s += outs.map(([t], i) => line(`M508 167 H540 V${58 + i * 72} H576`) + node(578, 30 + i * 72, 200, 56, t, '', { r: 12 })).join('');
            return svg(`<g transform="translate(0 60)">${s}</g>` + legend([L('After each stop the cabin waits 5 s with the floor light on, then serves the next call.', 'À chaque arrêt la cabine attend 5 s avec le témoin d’étage allumé, puis sert l’appel suivant.')], 400), '', L('Elevator inputs and outputs on the S7-300', 'Entrées et sorties de l’ascenseur sur le S7-300'));
        },
        anim: L => V['grafcet-sequential-systems'].anim(L),
        prog: L => svg(
            gcol(40, 50, [
                { n: '0', a: [L('Wait for a call (floor 1 or 3)', 'Attente appel étage 1 ou 3')], t: '(I136.2 + I137.0) · I137.2' },
                { n: '1', a: [L('Up', 'Montée'), L('Cabin lamp', 'Lampe cabine')], t: L('floor 3 reached', 'présence étage 3') },
                { n: '2', a: ['T/5s', L('Cabin lamp', 'Lampe cabine'), L('Floor 3 light', 'Témoin étage 3')], t: 't/5s · (I136.0 + I136.6)' },
                { n: '3', a: [L('Down', 'Descente'), L('Cabin lamp', 'Lampe cabine')], t: L('floor 1 reached', 'présence étage 1') },
                { n: '4', a: ['T/5s'], t: 't/5s · (I136.2 + I137.0)' }
            ], { h: 54, title: L('Version 1: floors 1 and 3', 'Version 1 : étages 1 et 3') })
            + T(40, 340, L('Version 2: every call, choice between three branches', 'Version 2 : tous les appels, choix entre trois branches'), 'tag', 'start')
            + [[L('Steps 1–4', 'Étapes 1–4'), L('up to floor 3, wait 5 s', 'montée vers l’étage 3, attente 5 s')], [L('Steps 5–7', 'Étapes 5–7'), L('to floor 2, wait 5 s', 'vers l’étage 2, attente 5 s')], [L('Steps 8–11', 'Étapes 8–11'), L('down to floor 1, wait 5 s', 'descente vers l’étage 1, attente 5 s')]]
                .map(([t, sub], i) => node(40 + i * 248, 356, 230, 64, t, sub, { r: 12 })).join('')
            + T(40, 452, L('I136.x / I137.x: call buttons and floor sensors wired on the S7-300 inputs', 'I136.x / I137.x : boutons d’appel et capteurs d’étage câblés sur les entrées du S7-300'), 'gt', 'start'),
            '', L('Grafcet of the elevator', 'Grafcet de l’ascenseur'))
    };

    /* Rotary-table machining station, Schneider M340 */
    function table(L, animated, id) {
        const cx = 230, cy = 240, r = 130;
        const st = [[0, -1, L('loading', 'chargement')], [1, 0, L('drilling', 'perçage')], [0, 1, L('checking', 'contrôle')], [-1, 0, L('removal', 'évacuation')]];
        let s = `<g class="${animated ? id + 'rot' : ''}"><circle cx="${cx}" cy="${cy}" r="${r}" class="tablec"/>` + [0, 1, 2, 3].map(i => { const a = i * Math.PI / 2; return `<circle cx="${(cx + 100 * Math.sin(a)).toFixed(1)}" cy="${(cy - 100 * Math.cos(a)).toFixed(1)}" r="22" class="part-c"/>`; }).join('') + `<circle cx="${cx}" cy="${cy}" r="14" class="hub"/></g>`;
        st.forEach(([dx, dy, t]) => { s += T(cx + dx * 160, cy + dy * 170 + (dy > 0 ? 14 : 0) - (dx ? 44 : 0), t, 's2', 'middle'); });
        // tools
        s += `<g class="${animated ? id + 'dr' : ''}"><rect x="${cx + 88}" y="${cy - 60}" width="24" height="44" rx="5" class="m1"/><line x1="${cx + 100}" y1="${cy - 16}" x2="${cx + 100}" y2="${cy - 4}" class="shaft"/></g>`;
        s += `<g class="${animated ? id + 'pr' : ''}"><rect x="${cx - 8}" y="${cy + 120}" width="16" height="40" rx="4" class="m2"/></g>`;
        s += `<g class="${animated ? id + 'ej' : ''}"><rect x="${cx - 200}" y="${cy - 10}" width="50" height="20" rx="4" class="m2"/><path d="M${cx - 150} ${cy} h16" class="ln"/></g>`;
        return s;
    }
    V['rotary-machining-m340'] = {
        schema: L => {
            let s = table(L, false);
            s += node(450, 40, 330, 110, 'M340', [L('one Grafcet, 3 simultaneous sequences', 'un Grafcet, 3 séquences simultanées'), L('automatic or cycle-by-cycle mode', 'mode automatique ou cycle par cycle')], { dark: true });
            const seq = [[L('Drilling', 'Perçage'), L('clamp · drill down · 2 s · up · unclamp', 'serrage · descente · 2 s · montée · desserrage')], [L('Checking', 'Contrôle'), L('probe down: good part or faulty part', 'palpeur : pièce bonne ou défectueuse')], [L('Removal', 'Évacuation'), L('ejector pushes 1 s, then back', 'éjecteur 1 s, puis retour')]];
            s += `<path d="M450 95 H432 V${168 + 2 * 82 + 29}" class="ln noar"/>` + seq.map(([t, sub], i) => line(`M432 ${168 + i * 82 + 29} H448`) + node(450, 168 + i * 82, 330, 58, t, sub, { r: 12 })).join('');
            return svg(s + legend([L('A faulty part stops the cycle until the operator resets. The table turns when all three sequences are done.', 'Une pièce défectueuse arrête le cycle jusqu’au réarmement. Le plateau tourne quand les trois séquences sont finies.')], 452), '', L('Rotary-table machining station', 'Poste d’usinage à plateau tournant'));
        },
        anim: L => {
            const id = 'svu' + (++uid), D = 10;
            let css = kf(id + 'rot', [[0, 'transform:rotate(0)'], [72, 'transform:rotate(0)'], [90, 'transform:rotate(90deg)'], [100, 'transform:rotate(90deg)']], D, 'transform-box:view-box;transform-origin:230px 240px;')
                + kf(id + 'dr', [[0, tr(0, 0)], [10, tr(0, 0)], [28, tr(0, 22)], [46, tr(0, 22)], [60, tr(0, 0)], [100, tr(0, 0)]], D)
                + kf(id + 'pr', [[0, tr(0, 0)], [12, tr(0, 0)], [26, tr(0, -24)], [44, tr(0, -24)], [54, tr(0, 0)], [100, tr(0, 0)]], D)
                + kf(id + 'ej', [[0, tr(0, 0)], [12, tr(0, 0)], [20, tr(36, 0)], [30, tr(36, 0)], [38, tr(0, 0)], [100, tr(0, 0)]], D);
            const lanes = [
                [L('Drilling', 'Perçage'), [[L('1 · clamp (SEP) · turn (RPE)', '1 · serrage (SEP) · RPE'), 0, 10], [L('2 · drill down (DPE)', '2 · descente (DPE)'), 10, 28], [L('3 · 2 s at the bottom', '3 · 2 s en bas'), 28, 46], [L('4 · drill up (MPE)', '4 · montée (MPE)'), 46, 60], [L('5 · unclamp', '5 · desserrage'), 60, 72]]],
                [L('Checking', 'Contrôle'), [[L('6 · probe down (DCO)', '6 · descente palpeur (DCO)'), 0, 26], [L('7 · 2 s', '7 · 2 s'), 26, 44], [L('8 · good part', '8 · pièce bonne'), 44, 72]]],
                [L('Removal', 'Évacuation'), [[L('10 · eject (REJ) · 1 s', '10 · éjection (REJ) · 1 s'), 0, 30], [L('11 · ejector back', '11 · repos éjecteur'), 30, 72]]]
            ];
            let s = table(L, true, id);
            lanes.forEach(([t, items], i) => {
                const y = 40 + i * 120;
                s += `<g transform="translate(450 ${y})"><rect width="330" height="104" rx="14" class="kpi"/>` + T(16, 28, t, 't', 'start');
                items.forEach(([label, a, b], j) => { const n = `${id}l${i}${j}`; css += phases(n, D, [[a, b]]); s += `<g class="${n}"><rect x="12" y="44" width="306" height="44" rx="10" class="sv-step-on"/>${T(26, 72, label, 's2 on', 'start')}</g>`; });
                s += `</g>`;
            });
            css += phases(id + 'turn', D, [[72, 100]]);
            s += `<g class="${id}turn"><g transform="translate(450 400)"><rect width="330" height="44" rx="10" class="sv-step-on"/>${T(16, 28, L('All done → the table turns 90°', 'Tout est fini → le plateau tourne de 90°'), 's2 on', 'start')}</g></g>`;
            return svg(s, css, L('Rotary table: three sequences at the same time', 'Plateau tournant : trois séquences en même temps'));
        },
        prog: L => {
            const bar = (x1, x2, y) => `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" class="par"/><line x1="${x1}" y1="${y + 5}" x2="${x2}" y2="${y + 5}" class="par"/>`;
            let s = '<g transform="translate(0 34)">' + gcol(370, 16, [{ n: '0', a: [L('Wait (initial position)', 'Attente (position initiale)')], t: 'dcy · cpe · cpp · cpc · cph · auto (/ man)' }], { h: 40, loop: false, tail: true });
            s += `<line x1="385" y1="40" x2="385" y2="66" class="gl"/>` + bar(60, 640, 66);
            s += `<line x1="75" y1="71" x2="75" y2="84" class="gl"/><line x1="335" y1="71" x2="335" y2="84" class="gl"/><line x1="605" y1="71" x2="605" y2="84" class="gl"/>`;
            s += gcol(60, 84, [{ n: '1', a: ['SEP', 'RPE'], t: 'cpp' }, { n: '2', a: ['DPE', 'RPE'], t: 'cpb' }, { n: '3', a: ['T/2s', 'RPE'], t: 't/2s' }, { n: '4', a: ['MPE', 'VMA'], t: 'cph' }, { n: '5', a: ['/SEP'] }], { h: 52, init: false, loop: false });
            s += gcol(320, 84, [{ n: '6', a: ['DCO', 'VMA'], t: 'ccb' }, { n: '7', a: ['T/2s', 'VMA'] }], { h: 52, init: false, loop: false });
            s += `<line x1="335" y1="160" x2="335" y2="176" class="gl"/><line x1="290" y1="176" x2="420" y2="176" class="gl"/><line x1="290" y1="176" x2="290" y2="214" class="gl"/><line x1="420" y1="176" x2="420" y2="214" class="gl"/>`
                + `<line x1="282" y1="192" x2="298" y2="192" class="trans"/>` + T(250, 188, 't/2s · ccb', 'gt', 'end') + `<line x1="412" y1="192" x2="428" y2="192" class="trans"/>` + T(436, 196, 't/2s · /ccb', 'gt', 'start')
                + gcol(275, 214, [{ n: '8', t: 'cpc' }], { init: false, loop: false }) + gcol(405, 214, [{ n: '9', a: [L('faulty', 'défaut')], t: 'rea' }], { init: false, loop: false })
                + `<line x1="290" y1="238" x2="290" y2="270" class="gl"/><line x1="420" y1="238" x2="420" y2="270" class="gl"/><line x1="282" y1="254" x2="298" y2="254" class="trans"/><line x1="412" y1="254" x2="428" y2="254" class="trans"/>`
                + T(306, 258, 'cpc', 'gt', 'start') + T(436, 258, L('rea (reset)', 'rea (réarmement)'), 'gt', 'start') + `<line x1="290" y1="270" x2="420" y2="270" class="gl"/><line x1="335" y1="270" x2="335" y2="330" class="gl"/>`;
            s += gcol(590, 84, [{ n: '10', a: ['REJ', 'VMA'], t: 't/1s' }, { n: '11', a: [L('REJ back', 'Repos REJ')] }], { h: 52, init: false, loop: false });
            s += `<line x1="75" y1="316" x2="75" y2="330" class="gl"/><line x1="605" y1="160" x2="605" y2="330" class="gl"/>` + bar(60, 640, 330);
            s += `<line x1="385" y1="335" x2="385" y2="360" class="gl"/><line x1="377" y1="350" x2="393" y2="350" class="trans"/>` + T(400, 354, '1', 'gt', 'start')
                + `<path d="M385 360 V368 H24 V6 H385 V14" class="gl ln-loop" marker-end="url(#sv-ar)"/>`;
            return svg(s + '</g>' + legend([L('SEP clamp · RPE drill turning · DPE / MPE drill down / up · DCO probe down', 'SEP serrage · RPE rotation perceuse · DPE / MPE descente / montée perceuse · DCO descente palpeur'), L('REJ ejector · VMA running light · rea operator reset', 'REJ éjecteur · VMA voyant de marche · rea réarmement par l’opérateur')], 440), '', L('Grafcet with simultaneous sequences', 'Grafcet à séquences simultanées'));
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
            meta.prog = { icon: 'bx-code-block', label: 'Grafcet', cap: L('My Grafcet, redrawn from my lab notes', 'Mon Grafcet, redessiné à partir de mes notes de TP') };
            return ['schema', 'anim', 'prog', 'sim'].filter(k => v[k]).map(k => ({ kind: k, ...meta[k], html: v[k](L) }));
        },
        mount(id, el) { const v = V[id]; if (v && v.mount) v.mount(el); }
    };
})();
