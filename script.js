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
    prev: { en: 'Previous projects', fr: 'Projets précédents' },
    next: { en: 'Next projects', fr: 'Projets suivants' },
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

/* ---------- Carousel: one swipeable row per category ---------- */
function carouselStep(track) {
    const card = track.querySelector('.project-card');
    return card ? card.getBoundingClientRect().width + (parseFloat(getComputedStyle(track).columnGap) || 0) : track.clientWidth;
}

function updateCarousel(car) {
    const track = car.querySelector('.carousel-track');
    const max = track.scrollWidth - track.clientWidth;
    const x = track.scrollLeft;
    const section = car.closest('.project-group');
    const buttons = section.querySelectorAll('.car-btn');
    buttons[0].disabled = x <= 2;
    buttons[1].disabled = x >= max - 2;
    section.classList.toggle('no-scroll', max <= 2);
    car.style.setProperty('--fl', x > 2 ? '36px' : '0px');
    car.style.setProperty('--fr', x < max - 2 ? '36px' : '0px');
    // dots: one per "page" of visible cards
    const step = carouselStep(track), pages = max > 2 ? Math.round(max / step) + 1 : 1;
    const dots = car.querySelector('.car-dots');
    if (dots.children.length !== pages) dots.innerHTML = Array.from({ length: pages }, (_, i) => `<button type="button" data-page="${i}" tabindex="-1"></button>`).join('');
    const current = Math.min(pages - 1, Math.round(x / step));
    [...dots.children].forEach((d, i) => d.classList.toggle('on', i === current));
}

function setupCarousel(car) {
    const track = car.querySelector('.carousel-track');
    let raf;
    track.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => updateCarousel(car)); }, { passive: true });
    new ResizeObserver(() => updateCarousel(car)).observe(track);

    // mouse drag (touch screens already scroll natively)
    let down = null, moved = false;
    track.addEventListener('pointerdown', e => {
        if (e.pointerType !== 'mouse' || e.button !== 0) return;
        down = { x: e.clientX, left: track.scrollLeft }; moved = false;
    });
    window.addEventListener('pointermove', e => {
        if (!down || !track.isConnected) return;
        const dx = e.clientX - down.x;
        if (!moved && Math.abs(dx) > 6) { moved = true; track.classList.add('dragging'); }
        if (moved) track.scrollLeft = down.left - dx;
    });
    window.addEventListener('pointerup', () => {
        if (!down) return;
        down = null;
        track.classList.remove('dragging');
    });
    track.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    track.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight') { track.scrollBy({ left: carouselStep(track), behavior: 'smooth' }); e.preventDefault(); }
        if (e.key === 'ArrowLeft') { track.scrollBy({ left: -carouselStep(track), behavior: 'smooth' }); e.preventDefault(); }
    });
    updateCarousel(car);
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
                <ul class="tags">${p.tags.slice(0, 3).map(t => `<li>${escapeHTML(t)}</li>`).join('')}${p.tags.length > 3 ? `<li class="tag-more">${projectLabels.more[lang](p.tags.length - 3)}</li>` : ''}</ul>
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

    const moreCard = `<article class="card project-card project-more">
            <div class="icon-box"><i class='bx bx-rocket'></i></div>
            <h3>${projectLabels.moreTitle[lang]}</h3>
            <p>${projectLabels.moreText[lang]}</p>
            <a href="https://github.com/aya12bri" target="_blank" rel="noopener" class="btn btn-sm btn-outline"><i class='bx bxl-github'></i> ${projectLabels.moreBtn[lang]}</a>
        </article>`;
    // one single carousel; the category buttons above filter it (projects stay ordered by category)
    const order = Object.keys(projectCategories);
    const sorted = [...found].sort((x, y) => order.indexOf(x.category) - order.indexOf(y.category));
    const current = activeFilter === 'all' ? null : projectCategories[activeFilter];
    let html = `
        <section class="project-group${current ? ' cat-' + activeFilter : ''}">
            <header class="group-head">
                <i class='bx ${current ? current.icon : 'bx-grid-alt'}'></i>
                <h3>${escapeHTML(current ? current[lang] : projectLabels.all[lang])}</h3>
                <span class="group-count">${sorted.length}</span>
                <div class="car-controls">
                    <button type="button" class="car-btn" data-dir="-1" aria-label="${projectLabels.prev[lang]}"><i class='bx bx-chevron-left'></i></button>
                    <button type="button" class="car-btn" data-dir="1" aria-label="${projectLabels.next[lang]}"><i class='bx bx-chevron-right'></i></button>
                </div>
            </header>
            <div class="carousel">
                <div class="carousel-track" tabindex="0" role="region" aria-label="${escapeHTML(current ? current[lang] : projectLabels.all[lang])}">${sorted.map(card).join('')}${found.length ? moreCard : ''}</div>
                <div class="car-dots" aria-hidden="true"></div>
            </div>
        </section>`;

    if (!found.length) {
        html = `<div class="project-empty"><i class='bx bx-search-alt'></i><p>${projectLabels.none[lang]}</p><button type="button" class="btn btn-sm btn-outline" id="project-reset">${projectLabels.reset[lang]}</button></div>`;
    }


    projectsGrid.innerHTML = html;
    projectsGrid.querySelectorAll('.carousel').forEach(setupCarousel);
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
        const btn = e.target.closest('.car-btn');
        const dot = e.target.closest('.car-dots button');
        if (btn || dot) {
            const group = e.target.closest('.project-group');
            const track = group.querySelector('.carousel-track');
            const smooth = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
            if (btn) track.scrollBy({ left: Number(btn.dataset.dir) * carouselStep(track) * (window.innerWidth > 1000 ? 2 : 1), behavior: smooth });
            else track.scrollTo({ left: Number(dot.dataset.page) * carouselStep(track), behavior: smooth });
            return;
        }
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



/* ---------- Animated robot arm drawn as a kinematic diagram (joints q1..q3, frames, trace) ---------- */
let kinCount = 0;
function createKinArm(host, opts) {
    const o = Object.assign({ phase: 0 }, opts || {});
    const id = 'kin' + (++kinCount);
    const base = { x: 120, y: 350 }, L = [150, 128, 72];
    const arrow = (a, b) => `<path class="kin-axis" d="M${a[0]} ${a[1]} L${b[0]} ${b[1]}" marker-end="url(#${id}-ah)"/>`;
    host.innerHTML = `<svg class="kin-svg" viewBox="0 0 480 420" aria-hidden="true">
        <defs><marker id="${id}-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 1 L9 5 L0 9 z" fill="currentColor"/></marker></defs>
        <path class="kin-ground" d="M10 372 H470"/>
        <rect class="kin-base" x="${base.x - 32}" y="${base.y + 2}" width="64" height="20" rx="4"/>
        ${arrow([base.x, base.y], [base.x + 78, base.y])}${arrow([base.x, base.y], [base.x, base.y - 70])}
        <text class="kin-t" x="${base.x - 40}" y="${base.y + 42}">{0}</text>
        <text class="kin-t" x="${base.x + 82}" y="${base.y + 16}">x₀</text>
        <text class="kin-t" x="${base.x - 22}" y="${base.y - 66}">y₀</text>
        <polyline class="kin-trace"/>
        <path class="kin-ext e2"/><path class="kin-ext e3"/>
        <path class="kin-arc a1"/><path class="kin-arc a2"/><path class="kin-arc a3"/>
        <line class="kin-link l1"/><line class="kin-link l2"/><line class="kin-link l3"/>
        <circle class="kin-joint j1"/><circle class="kin-joint j2"/><circle class="kin-joint j3"/>
        <circle class="kin-dot d1"/><circle class="kin-dot d2"/><circle class="kin-dot d3"/>
        <text class="kin-t q1">q₁</text><text class="kin-t q2">q₂</text><text class="kin-t q3">q₃</text>
        <text class="kin-t t1">L₁</text><text class="kin-t t2">L₂</text><text class="kin-t t3">L₃</text>
        <g class="kin-e"><path class="kin-axis ex" marker-end="url(#${id}-ah)"/><path class="kin-axis ey" marker-end="url(#${id}-ah)"/><text class="kin-t te">{E}</text></g>
        <g class="kin-grip"><path class="kin-g" d="M0 0 H8 M8 -9 V9"/><path class="kin-g gu" d="M8 -9 H26 V-4"/><path class="kin-g gd" d="M8 9 H26 V4"/></g>
    </svg>`;
    const q = s => host.querySelector(s), trace = [];
    const el = { l: [1, 2, 3].map(i => q('.l' + i)), j: [1, 2, 3].map(i => q('.j' + i)), d: [1, 2, 3].map(i => q('.d' + i)),
        a: [1, 2, 3].map(i => q('.a' + i)), q: [1, 2, 3].map(i => q('.q' + i)), t: [1, 2, 3].map(i => q('.t' + i)),
        e2: q('.e2'), e3: q('.e3'), ex: q('.ex'), ey: q('.ey'), te: q('.te'), eg: q('.kin-e'), grip: q('.kin-grip'),
        gu: q('.gu'), gd: q('.gd'), trace: q('.kin-trace') };
    const pt = (p, a, l) => ({ x: p.x + l * Math.cos(a), y: p.y - l * Math.sin(a) });
    const set = (e, a) => Object.keys(a).forEach(k => e.setAttribute(k, typeof a[k] === 'number' ? a[k].toFixed(1) : a[k]));
    const arc = (c, r, a, b) => {
        const s = pt(c, a, r), e = pt(c, b, r);
        return `M${s.x.toFixed(1)} ${s.y.toFixed(1)} A${r} ${r} 0 0 ${b > a ? 0 : 1} ${e.x.toFixed(1)} ${e.y.toFixed(1)}`;
    };
    const put = (e, c, ang, r, dx) => set(e, { x: c.x + r * Math.cos(ang) + (dx || 0), y: c.y - r * Math.sin(ang) + 4 });
    const deg = x => x * Math.PI / 180;
    function draw(t) {
        t += o.phase;
        const t1 = deg(58 + 16 * Math.sin(0.55 * t)), t2 = t1 - deg(66 + 26 * Math.sin(0.8 * t + 1)), t3 = t2 - deg(35 + 30 * Math.sin(1.1 * t + 2));
        const p = [base, pt(base, t1, L[0])]; p.push(pt(p[1], t2, L[1])); p.push(pt(p[2], t3, L[2]));
        const th = [t1, t2, t3];
        for (let i = 0; i < 3; i++) {
            set(el.l[i], { x1: p[i].x, y1: p[i].y, x2: p[i + 1].x, y2: p[i + 1].y });
            set(el.j[i], { cx: p[i].x, cy: p[i].y, r: 9 });
            set(el.d[i], { cx: p[i].x, cy: p[i].y, r: 2.4 });
            const from = i === 0 ? 0 : th[i - 1];
            el.a[i].setAttribute('d', arc(p[i], 30 + i * 4, from, th[i]));
            put(el.q[i], p[i], (from + th[i]) / 2, 48 + i * 4, -6);
            const m = { x: (p[i].x + p[i + 1].x) / 2, y: (p[i].y + p[i + 1].y) / 2 };
            put(el.t[i], m, th[i] + Math.PI / 2, 16, -6);
        }
        [el.e2, el.e3].forEach((e, i) => { const a = pt(p[i + 1], th[i], 0), b = pt(p[i + 1], th[i], 38); e.setAttribute('d', `M${a.x.toFixed(1)} ${a.y.toFixed(1)} L${b.x.toFixed(1)} ${b.y.toFixed(1)}`); });
        const ex = pt(p[3], t3, 40), ey = pt(p[3], t3 + Math.PI / 2, 30);
        el.ex.setAttribute('d', `M${p[3].x.toFixed(1)} ${p[3].y.toFixed(1)} L${ex.x.toFixed(1)} ${ex.y.toFixed(1)}`);
        el.ey.setAttribute('d', `M${p[3].x.toFixed(1)} ${p[3].y.toFixed(1)} L${ey.x.toFixed(1)} ${ey.y.toFixed(1)}`);
        put(el.te, p[3], t3 - Math.PI / 2, 26, -8);
        const open = 2.5 + 6.5 * (0.5 + 0.5 * Math.sin(1.5 * t));
        el.grip.setAttribute('transform', `translate(${p[3].x.toFixed(1)} ${p[3].y.toFixed(1)}) rotate(${(-t3 * 180 / Math.PI).toFixed(1)})`);
        el.gu.setAttribute('transform', `translate(0 ${(9 - open).toFixed(2)})`);
        el.gd.setAttribute('transform', `translate(0 ${(open - 9).toFixed(2)})`);
        const tip = pt(p[3], t3, 26);
        trace.push(tip.x.toFixed(1) + ',' + tip.y.toFixed(1));
        if (trace.length > 110) trace.shift();
        el.trace.setAttribute('points', trace.join(' '));
    }
    draw(0);
    return draw;
}

const kinArms = [];
function startKinArms() {
    let t0 = null;
    function tick(now) {
        requestAnimationFrame(tick);
        if (t0 === null) t0 = now;
        kinArms.forEach(a => { if (a.visible) a.draw((now - t0) / 1000); });
    }
    requestAnimationFrame(tick);
}
function addKinArm(host, opts) {
    const arm = { draw: createKinArm(host, opts), visible: true };
    if ('IntersectionObserver' in window) new IntersectionObserver(es => { arm.visible = es[0].isIntersecting; }).observe(host);
    if (!kinArms.length) startKinArms();
    kinArms.push(arm);
}

/* ---------- Faint robot symbols in the background of each section ---------- */
(function () {
    // symbol, size, position, rotation, delay, hide on phones?
    const layout = {
        home:       [['gear', 240, 'left:-70px;top:12%',     '12deg', '-6s', 1], ['cobot', 270, 'left:44%;bottom:-60px', '0deg', '-4s', 1]],
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
    const d = 'M-20 640 C180 560 280 720 470 640 S760 430 930 500 S1230 330 1460 260';
    const waypoints = [[470, 640, 'P1'], [930, 500, 'P2'], [1240, 340, 'P3']];
    const fx = document.createElement('div');
    fx.className = 'hero-fx';
    fx.setAttribute('aria-hidden', 'true');
    fx.innerHTML = `
        <span class="fx-blob fx-blob-a"></span><span class="fx-blob fx-blob-b"></span>
        <svg class="fx-trajectory" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
            <path class="path" d="${d}"/>
            ${waypoints.map(([x, y, n]) => `<circle class="wp" cx="${x}" cy="${y}" r="9"/><circle class="wp-dot" cx="${x}" cy="${y}" r="2.5"/><text x="${x + 16}" y="${y - 14}">${n}</text>`).join('')}
            <rect class="cube" x="-4.5" y="-4.5" width="9" height="9" rx="1.5"/>
            <g class="gripper">
                <circle class="tool-halo" r="13"/>
                <circle class="tool" r="4.5"/>
                <path class="g-arm" d="M4 0 H12 M12 -9 V9"/>
                <path class="g-jaw g-jaw-up" d="M12 -9 H30 V-4"/>
                <path class="g-jaw g-jaw-down" d="M12 9 H30 V4"/>
            </g>
        </svg>`;
    hero.insertBefore(fx, hero.firstChild);
    const kin = document.createElement('div');
    kin.className = 'kin-host kin-hero';
    hero.appendChild(kin);                                      // above the stats card, so the diagram stays readable
    addKinArm(kin);

    // The tool is a parallel-jaw gripper: it follows the trajectory, stops at the waypoints,
    // closes on a small cube at P1, drops it at P2, and pinches once at P3.
    const svg = fx.querySelector('.fx-trajectory');
    const pathEl = svg.querySelector('.path');
    const grip = svg.querySelector('.gripper');
    const jawUp = svg.querySelector('.g-jaw-up');
    const jawDown = svg.querySelector('.g-jaw-down');
    const cube = svg.querySelector('.cube');
    const L = pathEl.getTotalLength();
    const dist = waypoints.map(([x, y]) => {                   // distance along the path of each waypoint
        let best = 0, bd = 1e9;
        for (let s = 0; s <= L; s += 3) {
            const p = pathEl.getPointAtLength(s), e = (p.x - x) ** 2 + (p.y - y) ** 2;
            if (e < bd) { bd = e; best = s; }
        }
        return best;
    });
    const OPEN = 13, HOLD = 5, PINCH = 1.5;                     // half-opening of the jaws
    const pose = d => {
        const a = pathEl.getPointAtLength(Math.max(0, d - 6)), b = pathEl.getPointAtLength(Math.min(L, d + 6));
        const p = pathEl.getPointAtLength(d);
        return { x: p.x, y: p.y, r: Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI };
    };
    const K = 1.7;                                             // the gripper is drawn a bit larger than its 30-unit design
    const place = (el, ps, dx) => el.setAttribute('transform', `translate(${ps.x.toFixed(1)} ${ps.y.toFixed(1)}) rotate(${ps.r.toFixed(1)}) translate(${((dx || 0) * K).toFixed(1)} 0) scale(${K})`);
    const jaws = j => {
        jawUp.setAttribute('transform', `translate(0 ${(OPEN - j).toFixed(2)})`);
        jawDown.setAttribute('transform', `translate(0 ${(j - OPEN).toFixed(2)})`);
    };
    const ease = u => 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, Math.max(0, u)));
    const lerp = (a, b, u) => a + (b - a) * u;

    // timeline: moves along the path and pauses with a gripper action
    const SPEED = 105;                                          // path units per second
    const steps = [
        { to: dist[0] }, { act: 'grasp', t: 1.4 },
        { to: dist[1] }, { act: 'release', t: 1.3 },
        { to: dist[2] }, { act: 'pinch', t: 1.1 },
        { to: L }, { act: 'wait', t: 0.8 }
    ];
    const startAt = -30;                                        // the loop starts a little before the first point
    let d0 = startAt;
    steps.forEach(s => {
        if (s.to !== undefined) { s.from = d0; s.t = Math.abs(s.to - d0) / SPEED; d0 = s.to; }
    });
    const total = steps.reduce((n, s) => n + s.t, 0);
    const cubePose = pose(dist[0]);
    const dropPose = pose(dist[1]);

    function frame(sec) {
        let t = sec % total, k = 0;
        while (k < steps.length - 1 && t >= steps[k].t) { t -= steps[k].t; k++; }
        const s = steps[k], u = t / s.t;
        const d = s.to !== undefined ? lerp(s.from, s.to, ease(u)) : steps[k - 1].to;
        const ps = pose(Math.max(0, d));

        // jaw opening
        let j = OPEN;
        if (k === 1) j = u < 0.5 ? lerp(OPEN, HOLD, ease(u / 0.5)) : HOLD;
        else if (k === 2) j = HOLD;
        else if (k === 3) j = u < 0.5 ? HOLD : lerp(HOLD, OPEN, ease((u - 0.5) / 0.5));
        else if (k === 5) j = u < 0.5 ? lerp(OPEN, PINCH, ease(u / 0.5)) : lerp(PINCH, OPEN, ease((u - 0.5) / 0.5));

        // cube: waits at P1, is carried to P2, then stays where it was dropped and fades out
        const carried = (k === 1 && u >= 0.55) || k === 2 || (k === 3 && u < 0.45);
        if (carried) place(cube, ps, 21);
        else if (k < 2) place(cube, cubePose, 21);
        else place(cube, dropPose, 21);
        cube.style.opacity = k < 6 ? 1 : k === 6 ? 1 - ease(u) * 0.8 : 0.2 * (1 - u);

        place(grip, ps);
        jaws(j);
    }

    let t0 = null, running = true;
    function tick(now) {
        if (t0 === null) t0 = now;
        if (running) frame((now - t0) / 1000);
        requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    if ('IntersectionObserver' in window) {                     // do nothing while the hero is off screen
        new IntersectionObserver(es => { running = es[0].isIntersecting; }, { threshold: 0 }).observe(hero);
    }
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
        home:       [['eq', 'fourier', 'left:3%;top:15%', 24, -3, 0, 0], ['eq', 'pid', 'left:38%;bottom:8%', 22, 0, -6, 1], ['eq', 'nyquist', 'right:4%;top:11%', 24, 4, -9, 0]],
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


/* ---------- Faint code that types itself and erases itself (Python / C++) ---------- */
(function () {
    const snippets = {
        pick: [
            '# pick and place', 'robot.movel(P1)', 'gripper.close()', 'robot.movel(P2)', 'gripper.open()'],
        avoid: [
            '// obstacle avoidance', 'if (distance < 20) {', '    stop();', '    turn(90);', '} else {', '    forward(speed);', '}'],
        pid: [
            'def pid(e, dt):', '    global i, prev', '    i += e * dt', '    d = (e - prev) / dt', '    prev = e', '    return Kp*e + Ki*i + Kd*d'],
        loop: [
            'void loop() {', '  int d = lidar.read();', '  if (d < 30) turnLeft();', '  else forward();', '}'],
        fft: [
            'import numpy as np', 'X = np.fft.fft(x)', 'f = np.fft.fftfreq(N, 1/fs)', 'peak = f[np.argmax(abs(X))]'],
        grafcet: [
            'while step != END:', '    if step == 1 and S1:', '        step = 2', '        cylinder.out()', '    elif step == 2 and S2:', '        step = 1'],
        fsk: [
            'b = fir1(50, [f0-50 f0+50]/(Fs/2));', 'y = filter(b, 1, signal);', 'env = movmean(abs(y), Nbit);', 'bit = mean(env0) > mean(env1);'],
        ros: [
            'void cb(const Scan::ConstPtr& s) {', '  float m = *min_element(s->ranges);', '  cmd.linear.x = m > 0.5 ? 0.3 : 0.0;', '  pub.publish(cmd);', '}'],
        hello: [
            'print("Let\'s build robots together")', 'robot.say("Hello")']
    };
    // [snippet names the block cycles through, position, font px, delay (s), hide on phones?]
    const layout = {
        home:       [[['pick', 'loop'], 'right:6%;top:9%', 15, 0, 1]],
        background: [[['pid', 'fsk'], 'left:3%;bottom:5%', 14, 1.5, 0], [['grafcet'], 'right:4%;top:10%', 13, 3, 1]],
        services:   [[['loop', 'ros'], 'right:4%;bottom:5%', 14, 0.5, 0], [['pick'], 'left:3%;top:8%', 13, 2.5, 1]],
        skills:     [[['fft', 'pid'], 'right:5%;top:6%', 14, 2, 0], [['avoid'], 'left:4%;bottom:5%', 13, 4, 1]],
        projects:   [[['grafcet', 'fsk'], 'left:3%;top:2%', 13, 1, 1], [['loop', 'ros'], 'right:4%;bottom:1%', 13, 3.5, 1]],
        contact:    [[['hello', 'pick'], 'left:4%;bottom:8%', 14, 0.5, 0], [['pid'], 'right:5%;top:8%', 13, 2, 1]]
    };

    function type(el, names, delay) {
        const live = el.querySelector('.code-live');
        const texts = names.map(n => snippets[n].join('\n'));
        let n = 0, started = false, visible = true, timer;
        const wait = (fn, ms) => { timer = setTimeout(fn, ms); };
        function write(text, i) {
            if (!visible) return wait(() => write(text, i), 400);
            live.textContent = text.slice(0, i);
            if (i < text.length) return wait(() => write(text, i + 1), text[i] === '\n' ? 260 : 45 + Math.random() * 45);
            wait(() => erase(text, text.length), 3200);
        }
        function erase(text, i) {
            if (!visible) return wait(() => erase(text, i), 400);
            live.textContent = text.slice(0, i);
            if (i > 0) return wait(() => erase(text, Math.max(0, i - 2)), 16);
            n = (n + 1) % texts.length;
            wait(() => write(texts[n], 0), 900);
        }
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { threshold: 0 }).observe(el);
        }
        wait(() => write(texts[0], 0), 800 + delay * 1000);
    }

    window.typeCode = type;
    window.codeSnippets = snippets;
    Object.keys(layout).forEach(id => {
        const box = document.querySelector('#' + id + ' .bg-symbols');
        if (!box) return;
        layout[id].forEach(([names, pos, size, delay, hide]) => {
            const all = names.map(n => snippets[n]);
            const cols = Math.max(...all.map(s => Math.max(...s.map(l => l.length)))) + 1;
            const rows = Math.max(...all.map(s => s.length));
            const el = document.createElement('pre');
            el.className = 'code-bg' + (hide ? ' hide-mobile' : '');
            el.setAttribute('aria-hidden', 'true');
            el.style.cssText = `--fs:${size}px;--cols:${cols};--rows:${rows};--d:${delay}s;${pos}`;
            el.innerHTML = '<code class="code-live"></code>';
            box.appendChild(el);
            type(el, names, delay);
        });
    });
})();


/* ---------- A small mobile robot driving along the bottom of the hero ---------- */
(function () {
    const hero = document.getElementById('home');
    const fx = hero && hero.querySelector('.hero-fx');
    if (!fx) return;
    const floor = document.createElement('div');
    floor.className = 'roam-floor';
    const crate = document.createElement('span');
    crate.className = 'roam-crate';
    const bot = document.createElement('div');
    bot.className = 'roam-bot';
    bot.innerHTML = `<svg viewBox="0 0 64 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path class="roam-sweep" d="M52 22 L74 10 M52 22 L78 22 M52 22 L74 34"/>
        <path d="M30 6 V12"/><circle cx="30" cy="5" r="2" class="roam-led"/>
        <rect x="8" y="12" width="44" height="22" rx="7"/>
        <circle cx="40" cy="22" r="3" class="roam-eye"/><circle cx="49" cy="22" r="3" class="roam-eye"/>
        <path d="M13 28 H27"/>
        <g class="roam-wheel roam-w1"><circle cx="18" cy="39" r="7"/><path d="M18 33 V45 M12 39 H24"/></g>
        <g class="roam-wheel roam-w2"><circle cx="44" cy="39" r="7"/><path d="M44 33 V45 M38 39 H50"/></g>
    </svg>`;
    fx.append(floor, crate, bot);
    const wheels = bot.querySelectorAll('.roam-wheel');
    const W = 58;                                            // drawn width of the robot (matches the CSS)
    let x = 0, dir = 1, spin = 0, state = 'drive', until = 0, last = null, crateX = 0;
    const width = () => hero.clientWidth;
    const pickCrate = () => { crateX = width() * (0.3 + Math.random() * 0.4); crate.style.left = crateX + 'px'; };
    pickCrate();
    function render() {
        bot.style.transform = `translateX(${x.toFixed(1)}px) scaleX(${dir})`;
        bot.style.transformOrigin = `${W / 2}px 50%`;
        wheels.forEach(w => w.style.transform = `rotate(${spin.toFixed(0)}deg)`);
    }
    let visible = true;
    function tick(now) {
        requestAnimationFrame(tick);
        const dt = last === null ? 0 : Math.min(0.05, (now - last) / 1000);
        last = now;
        if (!visible) return;
        const max = width() - W;
        if (state === 'drive') {
            x += dir * 70 * dt; spin += dir * 70 * dt * 6;
            const front = dir > 0 ? x + W : x;               // stops in front of the crate, turns around, drives away
            if (Math.abs(front - crateX) < 14 && (crateX - front) * dir >= -2) { state = 'think'; until = now + 1100; bot.classList.add('alert'); }
            else if (x <= -W * 0.4 && dir < 0) { dir = 1; pickCrate(); }
            else if (x >= max + W * 0.4 && dir > 0) { dir = -1; pickCrate(); }
        } else if (now > until) {
            dir = -dir; state = 'drive'; bot.classList.remove('alert');
            x += dir * 30;
        }
        render();
    }
    if ('IntersectionObserver' in window) {
        new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { threshold: 0 }).observe(hero);
    }
    requestAnimationFrame(tick);
})();


/* ---------- Background layout: no robot, curve or equation ever overlaps another ---------- */
(function () {
    const GAP = 24;                       // clear space between two drawings (also covers the slow floating motion)
    const HEADER = 96;                    // fixed header height + margin
    const SCALES = [1, 0.8, 0.62];        // an item that does not fit is shrunk before being hidden
    const rank = el => el.classList.contains('sym') ? 0 : el.classList.contains('curve') || el.classList.contains('code-bg') ? 1 : 2;   // code blocks and equations come last
    const hit = (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;
    const grow = (r, g) => ({ l: r.l - g, t: r.t - g, r: r.r + g, b: r.b + g });

    function arrange() {
        document.querySelectorAll('.bg-symbols').forEach(box => {
            const section = box.parentElement;
            const items = [...box.querySelectorAll('.sym, .curve, .eq, .code-bg')];
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


/* ---------- Project pages: animated background (gears, kinematic arm, typed code) ---------- */
(function () {
    if (!document.body.classList.contains('project-page')) return;
    const bg = document.createElement('div');
    bg.className = 'page-bg';
    bg.setAttribute('aria-hidden', 'true');
    bg.innerHTML = `
        <span class="sym sym-gear" style="--s:230px;--r:0deg;--d:-3s;left:-60px;bottom:6%"></span>
        <span class="sym sym-gear" style="--s:150px;--r:15deg;--d:-8s;left:130px;bottom:26%"></span>
        <span class="sym sym-gear" style="--s:200px;--r:0deg;--d:-5s;right:-50px;top:14%"></span>
        <span class="sym sym-drone" style="--s:210px;--r:0deg;--d:-2s;left:2%;top:16%"></span>
        <div class="kin-host"></div>`;
    document.body.insertBefore(bg, document.body.firstChild);
    addKinArm(bg.querySelector('.kin-host'), { phase: 2 });
    if (!window.typeCode) return;
    [['pid', 'left:1%;top:44%', 14, 0], ['fsk', 'right:1.5%;top:10%', 13, 2]].forEach(([name, pos, size, delay]) => {
        const s = window.codeSnippets[name];
        const el = document.createElement('pre');
        el.className = 'code-bg';
        el.style.cssText = `--fs:${size}px;--cols:${Math.max(...s.map(l => l.length)) + 1};--rows:${s.length};${pos}`;
        el.innerHTML = '<code class="code-live"></code>';
        bg.appendChild(el);
        window.typeCode(el, [name], delay);
    });
})();


/* ---------- Click effects: ripple anywhere, burst on the portrait ---------- */
(function () {
    document.addEventListener('pointerdown', e => {
        const r = document.createElement('span');
        r.className = 'click-ripple';
        r.style.left = e.clientX + 'px';
        r.style.top = e.clientY + 'px';
        document.body.appendChild(r);
        setTimeout(() => r.remove(), 800);
    });
    const frame = document.querySelector('.photo-frame');
    if (!frame) return;
    frame.addEventListener('click', () => {
        frame.classList.remove('bump');
        void frame.offsetWidth;                                 // restart the animation on every click
        frame.classList.add('bump');
        const parts = [];
        for (let i = 0; i < 3; i++) parts.push(`<span class="photo-ring" style="--rd:${i * 0.18}s"></span>`);
        for (let i = 0; i < 10; i++) parts.push(`<span class="photo-spark" style="--a:${i * 36 + 12}deg"></span>`);
        const burst = document.createElement('span');
        burst.innerHTML = parts.join('');
        const nodes = [...burst.children];
        nodes.forEach(n => frame.appendChild(n));
        setTimeout(() => { nodes.forEach(n => n.remove()); frame.classList.remove('bump'); }, 1500);
    });
})();


/* ---------- A kinematic arm also works behind the Expertise and Skills sections ---------- */
(function () {
    [['services', 'right:1%;bottom:2%', 1], ['skills', 'left:1%;bottom:3%', 3.5]].forEach(([id, pos, phase]) => {
        const box = document.querySelector('#' + id + ' .bg-symbols');
        if (!box) return;
        const host = document.createElement('div');
        host.className = 'kin-host kin-sec';
        host.style.cssText = pos;
        box.appendChild(host);
        addKinArm(host, { phase });
    });
})();
