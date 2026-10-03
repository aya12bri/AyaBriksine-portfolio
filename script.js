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
    moreBtn: { en: 'My GitHub', fr: 'Mon GitHub' }
};

const projectsGrid = document.querySelector('#projects-grid');
const projectFilters = document.querySelector('#project-filters');
let activeFilter = 'all';

function projectVisual(p, lang) {
    const cat = projectCategories[p.category];
    const inner = p.image
        ? `<img src="${escapeHTML(p.image)}" alt="" loading="lazy">`
        : `<i class='bx ${escapeHTML(p.icon || cat.icon)}'></i>`;
    return `
        <a href="project.html?id=${encodeURIComponent(p.id)}" class="project-visual cat-${p.category}${p.image ? ' has-image fit-' + (p.imageFit || 'cover') : ''}" tabindex="-1" aria-hidden="true">
            ${inner}
            <span class="project-cat"><i class='bx ${cat.icon}'></i>${escapeHTML(cat[lang])}</span>
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
                <ul class="tags">${p.tags.map(t => `<li>${escapeHTML(t)}</li>`).join('')}</ul>
                <div class="project-actions">
                    <a href="project.html?id=${encodeURIComponent(p.id)}" class="btn btn-sm btn-primary">${projectLabels.details[lang]} <i class='bx bx-right-arrow-alt'></i></a>
                    ${githubButton(p, lang)}
                </div>
            </div>
        </article>`;

    // one block per category, with its own heading
    let html = Object.keys(projectCategories)
        .filter(key => counts[key] && (activeFilter === 'all' || activeFilter === key))
        .map(key => {
            const cat = projectCategories[key];
            return `
        <section class="project-group cat-${key}">
            <header class="group-head">
                <i class='bx ${cat.icon}'></i>
                <h3>${escapeHTML(cat[lang])}</h3>
                <span>${counts[key]}</span>
            </header>
            <div class="projects-grid">${projects.filter(p => p.category === key).map(card).join('')}</div>
        </section>`;
        }).join('');

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
