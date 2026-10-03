/* Shared by index.html and project.html – every part checks that its elements exist */

const header = document.querySelector('#header');
const navbar = document.querySelector('#navbar');
const menuBtn = document.querySelector('#menu-icon');
const navLinks = document.querySelectorAll('#navbar a');

function currentLang() {
    return document.documentElement.lang === 'fr' ? 'fr' : 'en';
}

function escapeHTML(text) {
    return String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* ---------- Phone menu ---------- */
function setMenu(open) {
    if (!navbar) return;
    navbar.classList.toggle('open', open);
    header.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menuBtn.querySelector('i').className = open ? 'bx bx-x' : 'bx bx-menu';
}

if (menuBtn && navbar) {
    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        setMenu(!navbar.classList.contains('open'));
    });
    navLinks.forEach(link => link.addEventListener('click', () => setMenu(false)));
    document.addEventListener('click', (e) => {
        if (navbar.classList.contains('open') && !navbar.contains(e.target)) setMenu(false);
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') setMenu(false);
    });
}

/* ---------- Header background after scrolling ---------- */
function updateHeader() {
    header.classList.toggle('scrolled', window.scrollY > 10);
}
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

/* ---------- Highlight the menu link of the section on screen ---------- */
const sections = document.querySelectorAll('main section[id]');
if (sections.length && navLinks.length) {
    const sectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            navLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
            });
        });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(section => sectionObserver.observe(section));
}

/* ---------- Background tabs (Experience / Education / Certifications) ---------- */
const tabs = document.querySelectorAll('.tab');
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => {
            t.classList.toggle('active', t === tab);
            t.setAttribute('aria-selected', t === tab);
        });
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === tab.dataset.tab);
        });
        // make sure cards inside the newly shown tab are visible
        document.querySelectorAll('#' + tab.dataset.tab + ' .reveal').forEach(el => el.classList.add('visible'));
    });
});

/* ---------- Light / dark mode ---------- */
const themeBtn = document.querySelector('#theme-toggle');

function updateThemeButton() {
    const isLight = document.documentElement.classList.contains('light-mode');
    themeBtn.querySelector('i').className = isLight ? 'bx bx-moon' : 'bx bx-sun';
    themeBtn.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
}

if (themeBtn) {
    themeBtn.addEventListener('click', () => {
        const isLight = document.documentElement.classList.toggle('light-mode');
        try { localStorage.setItem('theme', isLight ? 'light' : 'dark'); } catch (e) {}
        updateThemeButton();
    });
    updateThemeButton();
}

/* ---------- Typing effect under the name ---------- */
// The titles that type out under the name, one after the other.
// Add, remove or reorder them freely (keep the English and French lists in the same order).
const roles = {
    en: [
        'Mechatronics & Robotics Student',
        'Industrial Engineer',
        'Robot Programmer',
        'Digital Transformation Specialist',
        'Automation & Control Engineer',
        'Web Designer',
        'Python Developer',
        'Technical Project Manager'
    ],
    fr: [
        'Étudiante en mécatronique & robotique',
        'Ingénieure industrielle',
        'Programmeuse de robots',
        'Spécialiste en transformation digitale',
        'Future ingénieure en automatique',
        'Web designer',
        'Développeuse Python',
        'Cheffe de projet technique'
    ]
};
const typed = document.querySelector('#typed');

if (typed) {
    let roleIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let typingLang = currentLang();

    const typeLoop = () => {
        const lang = currentLang();
        if (lang !== typingLang) {          // language switched: start over in the new language
            typingLang = lang;
            roleIndex = 0;
            charIndex = 0;
            deleting = false;
        }
        const word = roles[lang][roleIndex];

        charIndex += deleting ? -1 : 1;
        typed.textContent = word.slice(0, charIndex);

        let delay = deleting ? 35 : 70;
        if (!deleting && charIndex === word.length) {
            deleting = true;
            delay = 1800;
        } else if (deleting && charIndex === 0) {
            deleting = false;
            roleIndex = (roleIndex + 1) % roles[lang].length;
            delay = 350;
        }
        setTimeout(typeLoop, delay);
    };
    typeLoop();
}

/* ---------- Projects (built from projects.js) ---------- */
const projectLabels = {
    all: { en: 'All', fr: 'Tous' },
    details: { en: 'View project', fr: 'Voir le projet' },
    github: { en: 'GitHub', fr: 'GitHub' },
    soon: { en: 'Coming soon', fr: 'Bientôt' },
    moreTitle: { en: 'More projects on the way', fr: "D'autres projets arrivent" },
    moreText: { en: 'I keep adding new robotics and control projects. Follow my work on GitHub.', fr: 'J’ajoute régulièrement de nouveaux projets de robotique et d’automatique. Suivez mon travail sur GitHub.' },
    moreBtn: { en: 'My GitHub', fr: 'Mon GitHub' },
    search: { en: 'Search a project, tool or skill…', fr: 'Rechercher un projet, un outil ou une compétence…' },
    count: { en: n => `${n} project${n > 1 ? 's' : ''}`, fr: n => `${n} projet${n > 1 ? 's' : ''}` },
    none: { en: 'No project matches your search.', fr: 'Aucun projet ne correspond à votre recherche.' },
    reset: { en: 'Clear search', fr: 'Effacer la recherche' },
    video: { en: 'Video', fr: 'Vidéo' },
    more: { en: n => `+${n} more`, fr: n => `+${n} autres` }
};

const projectsGrid = document.querySelector('#projects-grid');
const projectFilters = document.querySelector('#project-filters');
let activeFilter = 'all';
let searchQuery = '';

function projectVisual(p, lang) {
    const cat = projectCategories[p.category];
    const inner = p.image
        ? `<img src="${escapeHTML(p.image)}" alt="" loading="lazy">`
        : p.art
        ? `<span class="cover-art art-${escapeHTML(p.art)}"></span>`
        : `<i class='bx ${escapeHTML(p.icon || cat.icon)}'></i>`;
    const video = p.video ? `<span class="project-badge"><i class='bx bx-play'></i>${projectLabels.video[lang]}</span>` : '';
    return `
        <a href="project.html?id=${encodeURIComponent(p.id)}" class="project-visual cat-${p.category}${p.image ? ' has-image fit-' + (p.imageFit || 'cover') : ''}" tabindex="-1" aria-hidden="true">
            ${inner}
            <span class="project-cat"><i class='bx ${cat.icon}'></i>${escapeHTML(cat[lang])}</span>
            ${video}
        </a>`;
}

function githubButton(p, lang) {
    if (!p.github && !p.code) return '';
    return p.github
        ? `<a href="${escapeHTML(p.github)}" target="_blank" rel="noopener" class="btn btn-sm btn-outline"><i class='bx bxl-github'></i> ${projectLabels.github[lang]}</a>`
        : `<span class="btn btn-sm btn-ghost" title="${lang === 'fr' ? 'Code bientôt sur GitHub' : 'Code coming soon on GitHub'}"><i class='bx bxl-github'></i> ${projectLabels.soon[lang]}</span>`;
}

function renderProjects() {
    if (!projectsGrid || typeof projects === 'undefined') return;
    const lang = currentLang();

    // filter buttons with the number of projects in each category
    const counts = { all: projects.length };
    projects.forEach(p => { counts[p.category] = (counts[p.category] || 0) + 1; });
    const filterKeys = ['all', ...Object.keys(projectCategories).filter(k => counts[k])];
    projectFilters.innerHTML = filterKeys.map(key => {
        const label = key === 'all' ? projectLabels.all[lang] : projectCategories[key][lang];
        const icon = key === 'all' ? 'bx-grid-alt' : projectCategories[key].icon;
        return `<button class="filter${key === activeFilter ? ' active' : ''}" data-filter="${key}"><i class='bx ${icon}'></i>${escapeHTML(label)}<span>${counts[key]}</span></button>`;
    }).join('');
    // keep the chosen filter visible when the row scrolls sideways (mobile)
    const activeBtn = projectFilters.querySelector('.filter.active');
    if (activeBtn && activeFilter !== 'all') {
        projectFilters.scrollLeft = activeBtn.offsetLeft - (projectFilters.clientWidth - activeBtn.offsetWidth) / 2;
    }

    const card = (p, i) => `
        <article class="card project-card">
            ${projectVisual(p, lang)}
            <div class="project-body">
                <span class="project-index">${String(i + 1).padStart(2, '0')}</span>
                <p class="project-meta"><span>${escapeHTML(p.context[lang])}</span><span>${escapeHTML(p.year)}</span></p>
                <h3><a href="project.html?id=${encodeURIComponent(p.id)}">${escapeHTML(p.title[lang])}</a></h3>
                <p class="project-summary">${escapeHTML(p.summary[lang])}</p>
                <ul class="tags">${p.tags.slice(0, 4).map(t => `<li>${escapeHTML(t)}</li>`).join('')}${p.tags.length > 4 ? `<li class="tag-more">${projectLabels.more[lang](p.tags.length - 4)}</li>` : ''}</ul>
                <div class="project-actions">
                    <a href="project.html?id=${encodeURIComponent(p.id)}" class="btn btn-sm btn-primary">${projectLabels.details[lang]} <i class='bx bx-right-arrow-alt'></i></a>
                    ${githubButton(p, lang)}
                </div>
            </div>
        </article>`;

    // text search over title, summary, tools and context (both languages)
    const q = searchQuery.trim().toLowerCase();
    const matches = p => !q || [p.title, p.summary, p.context].some(o => Object.values(o).some(t => t.toLowerCase().includes(q))) || p.tags.some(t => t.toLowerCase().includes(q));
    const found = projects.filter(p => matches(p) && (activeFilter === 'all' || p.category === activeFilter));
    const searchBox = document.querySelector('#project-search');
    if (searchBox) searchBox.placeholder = projectLabels.search[lang];
    const countEl = document.querySelector('#project-count');
    if (countEl) countEl.textContent = projectLabels.count[lang](found.length);

    // one block per category, with its own heading
    let html = Object.keys(projectCategories)
        .filter(key => found.some(p => p.category === key))
        .map(key => {
            const cat = projectCategories[key];
            return `
        <section class="project-group cat-${key}">
            <header class="group-head">
                <i class='bx ${cat.icon}'></i>
                <h3>${escapeHTML(cat[lang])}</h3>
                <span>${found.filter(p => p.category === key).length}</span>
            </header>
            <div class="projects-grid">${found.filter(p => p.category === key).map(card).join('')}</div>
        </section>`;
        }).join('');

    if (!found.length) {
        html = `<div class="project-empty"><i class='bx bx-search-alt'></i><p>${projectLabels.none[lang]}</p><button type="button" class="btn btn-sm btn-outline" id="project-reset">${projectLabels.reset[lang]}</button></div>`;
    }
    html += `
        <div class="projects-grid"><article class="card project-card project-more">
            <div class="icon-box"><i class='bx bx-rocket'></i></div>
            <h3>${projectLabels.moreTitle[lang]}</h3>
            <p>${projectLabels.moreText[lang]}</p>
            <a href="https://github.com/aya12bri" target="_blank" rel="noopener" class="btn btn-sm btn-outline"><i class='bx bxl-github'></i> ${projectLabels.moreBtn[lang]}</a>
        </article></div>`;

    projectsGrid.innerHTML = html;
}

if (projectFilters) {
    projectFilters.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter');
        if (!btn) return;
        activeFilter = btn.dataset.filter;
        renderProjects();
    });
    const searchInput = document.querySelector('#project-search');
    if (searchInput) searchInput.addEventListener('input', () => {
        searchQuery = searchInput.value;
        renderProjects();
    });
    projectsGrid.addEventListener('click', (e) => {
        if (!e.target.closest('#project-reset')) return;
        searchQuery = ''; activeFilter = 'all';
        if (searchInput) searchInput.value = '';
        renderProjects();
    });
}

renderProjects();
document.addEventListener('langchange', renderProjects);

/* ---------- Fade sections in while scrolling ---------- */
const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ---------- Current year in the footer ---------- */
const yearEl = document.querySelector('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();


/* ---------- Faint robot symbols in the background of each section ---------- */
(function () {
    // symbol, size, position, rotation, delay, hide on phones?
    const layout = {
        home:       [['arm',   480, 'right:-50px;bottom:4%',   '0deg',   '0s', 0], ['gear', 240, 'left:-70px;top:12%',     '12deg', '-6s', 1], ['cobot', 270, 'left:44%;bottom:-60px', '0deg', '-4s', 1]],
        background: [['rover', 340, 'right:2%;top:4%',         '0deg',   '-3s', 0], ['chip', 290, 'left:-40px;bottom:3%',  '0deg',  '-9s', 1], ['lidar', 250, 'left:44%;top:-30px',   '0deg', '-7s', 1]],
        services:   [['drone', 300, 'right:3%;top:6%',         '8deg',   '-5s', 0], ['gear', 210, 'left:2%;bottom:5%',     '-10deg','-2s', 1], ['delta', 270, 'left:-30px;top:8%',   '0deg', '-8s', 1]],
        skills:     [['head',  260, 'left:1%;top:6%',          '-6deg',  '-7s', 0], ['chip', 290, 'right:-30px;bottom:4%', '0deg',  '-4s', 1], ['loop', 290, 'right:5%;top:2%',       '0deg', '-1s', 1]],
        projects:   [['arm',   390, 'right:-30px;top:3%',      '0deg',   '-8s', 1], ['rover', 290, 'left:-20px;bottom:2%', '0deg',  '-1s', 1], ['cobot', 260, 'left:2%;top:2%',       '0deg', '-5s', 1], ['motor', 230, 'right:30%;bottom:1%', '0deg', '-3s', 1]],
        contact:    [['drone', 280, 'left:3%;top:8%',          '-8deg',  '-6s', 1], ['head', 260, 'right:3%;bottom:6%',    '6deg',  '-3s', 0], ['lidar', 240, 'right:32%;top:3%',     '0deg', '-9s', 1], ['motor', 210, 'left:34%;bottom:2%', '0deg', '-2s', 1]]
    };
    Object.keys(layout).forEach(id => {
        const section = document.getElementById(id);
        if (!section) return;
        const box = document.createElement('div');
        box.className = 'bg-symbols';
        box.setAttribute('aria-hidden', 'true');
        box.innerHTML = layout[id].map(([name, size, pos, rot, delay, hide]) =>
            `<span class="sym sym-${name}${hide ? ' hide-mobile' : ''}" style="--s:${size}px;--r:${rot};--d:${delay};${pos}"></span>`).join('');
        section.insertBefore(box, section.firstChild);
    });
})();


/* ---------- Hero background: aurora blobs + a robot end-effector following a trajectory ---------- */
(function () {
    const hero = document.getElementById('home');
    if (!hero) return;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const d = 'M-20 640 C180 560 280 720 470 640 S760 430 930 500 S1230 330 1460 260';
    const waypoints = [[470, 640, 'P1'], [930, 500, 'P2'], [1240, 340, 'P3']];
    const motion = reduce ? '' : `
        <circle class="tool-halo" r="13"><animateMotion dur="16s" repeatCount="indefinite" path="${d}" rotate="auto"/></circle>
        <circle class="tool" r="4.5"><animateMotion dur="16s" repeatCount="indefinite" path="${d}"/></circle>`;
    const fx = document.createElement('div');
    fx.className = 'hero-fx';
    fx.setAttribute('aria-hidden', 'true');
    fx.innerHTML = `
        <span class="fx-blob fx-blob-a"></span><span class="fx-blob fx-blob-b"></span>
        <svg class="fx-trajectory" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
            <path class="path" d="${d}"/>
            ${waypoints.map(([x, y, n]) => `<circle class="wp" cx="${x}" cy="${y}" r="9"/><circle class="wp-dot" cx="${x}" cy="${y}" r="2.5"/><text x="${x + 16}" y="${y - 14}">${n}</text>`).join('')}
            ${motion}
        </svg>`;
    hero.insertBefore(fx, hero.firstChild);
})();


/* ---------- Faint equations and signal curves in the background ---------- */
(function () {
    const W = 300, H = 120, mid = 60;
    const pts = (fn, n = 120) => Array.from({ length: n + 1 }, (_, i) => {
        const x = (i / n) * W;
        return `${i ? 'L' : 'M'}${x.toFixed(1)} ${fn(i / n).toFixed(1)}`;
    }).join('');
    const axes = '<path class="axis" d="M0 112 H300 M8 6 V116"/>';
    const curves = {
        // two summed sinusoids (the 10 Hz + 30 Hz signal from the signal lab)
        sine:   axes + `<path class="trace" pathLength="1" d="${pts(t => mid - 26 * Math.sin(t * 6 * Math.PI) - 14 * Math.sin(t * 18 * Math.PI))}"/>`,
        // damped oscillation, e^(-t) cos(wt)
        damped: axes + `<path class="trace" pathLength="1" d="${pts(t => mid - 46 * Math.exp(-3.2 * t) * Math.cos(t * 9 * Math.PI))}"/>`,
        // second-order step response with overshoot
        step:   axes + '<path class="ref" d="M8 28 H300"/>' + `<path class="trace" pathLength="1" d="${pts(t => 112 - 84 * (1 - Math.exp(-5 * t) * (Math.cos(t * 22) + 0.23 * Math.sin(t * 22))))}"/>`,
        // spectrum: two pairs of lines, 10 Hz and 30 Hz
        spectrum: axes + [[60, 52], [100, 28], [200, 28], [240, 52]].map(([x, h]) => `<line class="stem" x1="${x}" y1="112" x2="${x}" y2="${112 - h * 1.5}"/>`).join(''),
        // Bode magnitude: flat then -20 dB/decade
        bode:   axes + `<path class="trace" pathLength="1" d="${pts(t => 30 + 82 * Math.max(0, Math.log10(1 + Math.pow(t * 7, 2)) / 2.1))}"/>`,
        // step of a first-order low-pass filter
        lowpass: axes + '<path class="ref" d="M8 30 H300"/>' + `<path class="trace" pathLength="1" d="${pts(t => 112 - 82 * (1 - Math.exp(-4 * t)))}"/>`
    };
    const eqs = {
        fourier:  'X(f) = ∫ x(t) e<sup>−j2πft</sup> dt',
        conv:     'y[n] = Σ<sub>k</sub> h[k] · x[n − k]',
        dft:      'X[k] = Σ<sub>n=0</sub><sup>N−1</sup> x[n] e<sup>−j2πkn/N</sup>',
        tf:       'G(s) = K / (τs + 1)',
        pid:      'u(t) = K<sub>p</sub>e + K<sub>i</sub>∫e dτ + K<sub>d</sub> de/dt',
        state:    'ẋ = Ax + Bu ,   y = Cx',
        step:     'y(t) = 1 − e<sup>−t/τ</sup>',
        nyquist:  'f<sub>s</sub> ≥ 2 f<sub>max</sub>',
        hz:       'H(z) = (1 + z<sup>−1</sup>) / (1 − ⁵⁄₆z<sup>−1</sup> + ⅙z<sup>−2</sup>)',
        jacobian: 'v = J(q) · q̇',
        dh:       'T = Rot<sub>x</sub>(α) Trans<sub>x</sub>(a) Rot<sub>z</sub>(θ) Trans<sub>z</sub>(d)',
        pendulum: 'θ̈ = (g/ℓ) sin θ + u',
        second:   'ω<sub>n</sub> = √(k/m) ,  ζ = c / 2√(km)',
        sinc:     'h[n] = sin(2π f<sub>c</sub> n / f<sub>e</sub>) / (π n)',
        res:      'Δf = f<sub>e</sub> / N'
    };
    // [kind, key, position, size (font px or width px), rotation, delay, hide on phones?]
    const layout = {
        home:       [['eq', 'fourier', 'left:3%;top:15%', 24, -3, 0, 0], ['eq', 'pid', 'left:38%;bottom:8%', 22, 0, -6, 1], ['curve', 'step', 'left:2%;bottom:3%', 300, 0, -2, 1], ['eq', 'nyquist', 'right:4%;top:11%', 24, 4, -9, 0]],
        background: [['eq', 'conv', 'left:4%;top:12%', 26, -2, -3, 0], ['curve', 'sine', 'right:3%;bottom:4%', 360, 0, -5, 0], ['eq', 'tf', 'right:8%;top:6%', 28, 3, -8, 1], ['eq', 'dh', 'left:6%;bottom:6%', 22, 0, -1, 1]],
        services:   [['eq', 'state', 'right:4%;bottom:6%', 28, -3, -4, 0], ['curve', 'damped', 'left:2%;top:4%', 340, 0, -7, 0], ['eq', 'jacobian', 'left:8%;bottom:4%', 26, 2, -2, 1], ['eq', 'second', 'right:22%;top:3%', 22, 0, -6, 1]],
        skills:     [['eq', 'dft', 'right:3%;top:8%', 24, 3, -5, 0], ['curve', 'spectrum', 'left:3%;bottom:4%', 330, 0, -3, 0], ['eq', 'pendulum', 'left:6%;top:3%', 26, -3, -9, 1], ['eq', 'res', 'right:10%;bottom:3%', 28, 0, -1, 1]],
        projects:   [['eq', 'hz', 'left:3%;top:2%', 22, 0, -4, 1], ['curve', 'bode', 'right:3%;top:3%', 340, 0, -8, 1], ['eq', 'sinc', 'right:6%;bottom:1%', 22, -2, -2, 1], ['curve', 'lowpass', 'left:30%;bottom:1%', 300, 0, -6, 1]],
        contact:    [['eq', 'step', 'left:4%;bottom:8%', 28, -3, -3, 0], ['curve', 'sine', 'left:4%;top:5%', 330, 0, -7, 1], ['eq', 'fourier', 'right:5%;top:8%', 24, 3, -1, 1], ['eq', 'pid', 'right:6%;bottom:4%', 22, 0, -5, 1]]
    };
    Object.keys(layout).forEach(id => {
        const box = document.querySelector('#' + id + ' .bg-symbols');
        if (!box) return;
        box.insertAdjacentHTML('beforeend', layout[id].map(([kind, key, pos, size, rot, delay, hide]) => kind === 'eq'
            ? `<span class="eq${hide ? ' hide-mobile' : ''}" style="--fs:${size}px;--r:${rot}deg;--d:${delay}s;${pos}">${eqs[key]}</span>`
            : `<svg class="curve${hide ? ' hide-mobile' : ''}" viewBox="0 0 ${W} ${H}" style="--w:${size}px;--d:${delay}s;${pos}" aria-hidden="true">${curves[key]}</svg>`).join(''));
    });
})();


/* ---------- Background layout: no robot, curve or equation ever overlaps another ---------- */
(function () {
    const GAP = 24;                       // clear space between two drawings (also covers the slow floating motion)
    const HEADER = 96;                    // fixed header height + margin
    const SCALES = [1, 0.8, 0.62];        // an item that does not fit is shrunk before being hidden
    const rank = el => el.classList.contains('sym') ? 0 : el.classList.contains('curve') ? 1 : 2;
    const hit = (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;
    const grow = (r, g) => ({ l: r.l - g, t: r.t - g, r: r.r + g, b: r.b + g });

    function arrange() {
        document.querySelectorAll('.bg-symbols').forEach(box => {
            const section = box.parentElement;
            const items = [...box.querySelectorAll('.sym, .curve, .eq')];
            items.forEach(el => {
                if (el.dataset.css === undefined) el.dataset.css = el.style.cssText;
                el.style.cssText = el.dataset.css;
            });
            const shown = items.filter(el => el.offsetParent !== null);
            if (!shown.length) return;

            const B = box.getBoundingClientRect();
            const rel = r => ({ l: r.left - B.left, t: r.top - B.top, r: r.right - B.left, b: r.bottom - B.top });
            // text that curves and equations must not cover (robots are pure decoration and may sit beside it)
            const textBlocks = [...section.querySelectorAll('.section-head, .hero-text, .hero-photo, .stats')].map(el => grow(rel(el.getBoundingClientRect()), 10));
            if (section.id === 'home') textBlocks.push({ l: -1e5, t: -1e5, r: 1e5, b: HEADER - (B.top < 0 ? 0 : 0) });

            const placed = [];
            const free = (r, avoidText) => !placed.some(p => hit(r, p)) && !(avoidText && textBlocks.some(t => hit(r, t)));

            shown.sort((x, y) => rank(x) - rank(y)).forEach(el => {
                const avoidText = rank(el) > 0;
                const prop = el.classList.contains('sym') ? '--s' : el.classList.contains('curve') ? '--w' : '--fs';
                const base = parseFloat(el.style.getPropertyValue(prop));
                for (const k of SCALES) {
                    if (k !== 1) el.style.setProperty(prop, (base * k) + 'px');
                    const cur = rel(el.getBoundingClientRect());
                    if (free(grow(cur, GAP / 2), avoidText)) { placed.push(grow(cur, GAP / 2)); return; }
                    // measure the offset between the left/top we set and the drawn box (rotation changes it)
                    el.style.left = '0px'; el.style.top = '0px'; el.style.right = 'auto'; el.style.bottom = 'auto';
                    const o = rel(el.getBoundingClientRect());
                    const w = o.r - o.l, h = o.b - o.t;
                    let best = null;
                    for (let y = 0; y <= B.height - h; y += 30) {
                        for (let x = 0; x <= B.width - w; x += 50) {
                            const cand = { l: x, t: y, r: x + w, b: y + h };
                            if (!free(grow(cand, GAP / 2), avoidText)) continue;
                            const d = Math.abs(x - cur.l) + Math.abs(y - cur.t);
                            if (!best || d < best.d) best = { x, y, d, cand };
                        }
                    }
                    if (best) {
                        el.style.left = (best.x - o.l) + 'px';
                        el.style.top = (best.y - o.t) + 'px';
                        placed.push(grow(best.cand, GAP / 2));
                        return;
                    }
                    el.style.cssText = el.dataset.css;       // restore before trying a smaller size
                }
                el.style.visibility = 'hidden';
            });
        });
    }

    let timer;
    const later = () => { clearTimeout(timer); timer = setTimeout(arrange, 200); };
    window.addEventListener('load', arrange);
    window.addEventListener('resize', later);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(arrange);
    document.addEventListener('langchange', later);
    // sections can change height (tabs, filters, language): lay out again
    if (window.ResizeObserver) {
        const ro = new ResizeObserver(later);
        document.querySelectorAll('.hero, .section').forEach(s => ro.observe(s));
    }
    arrange();
})();


/* ---------- Little robot that rides along the scrollbar ---------- */
(function () {
    const bot = document.getElementById('scroll-bot');
    const fill = document.querySelector('.scroll-fill');
    if (!bot) return;
    const rail = document.querySelector('.scroll-rail');
    let lastY = window.scrollY, dir = 1, idle;
    function update() {
        const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
        const y = window.scrollY, p = Math.min(1, Math.max(0, y / max));
        const top = 84, track = Math.max(0, innerHeight - top - 90);
        bot.style.setProperty('--y', (top + p * track) + 'px');
        bot.style.setProperty('--spin', (y * 0.6) + 'deg');
        if (fill) fill.style.height = (p * 100) + '%';
        if (y !== lastY) { dir = y > lastY ? 1 : -1; bot.style.setProperty('--dir', dir); bot.classList.add('moving'); }
        lastY = y;
        clearTimeout(idle);
        idle = setTimeout(() => bot.classList.remove('moving'), 160);
        bot.classList.toggle('visible', y > 120);
        if (rail) rail.classList.toggle('visible', y > 120);
    }
    window.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
    window.addEventListener('resize', update);
    bot.addEventListener('click', () => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }));
    document.addEventListener('langchange', () => {
        const t = currentLang() === 'fr' ? 'Retour en haut' : 'Back to top';
        bot.setAttribute('aria-label', t); bot.title = t;
    });
    update();
})();
