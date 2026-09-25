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
const roles = {
    en: ['Mechatronics & Robotics Student', 'Robot Programmer', 'Automation & Control Engineer', 'Python Developer', 'Technical Project Manager'],
    fr: ['Étudiante en mécatronique & robotique', 'Programmeuse de robots', 'Future ingénieure en automatique', 'Développeuse Python', 'Cheffe de projet technique']
};
const typed = document.querySelector('#typed');

if (typed) {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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

        if (reduceMotion) {
            typed.textContent = word;
            return setTimeout(typeLoop, 500);
        }

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
        <a href="project.html?id=${encodeURIComponent(p.id)}" class="project-visual cat-${p.category}${p.image ? ' has-image' : ''}" tabindex="-1" aria-hidden="true">
            ${inner}
            <span class="project-cat"><i class='bx ${cat.icon}'></i>${escapeHTML(cat[lang])}</span>
        </a>`;
}

function githubButton(p, lang) {
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

    const shown = projects.filter(p => activeFilter === 'all' || p.category === activeFilter);
    let html = shown.map(p => `
        <article class="card project-card">
            ${projectVisual(p, lang)}
            <div class="project-body">
                <p class="project-meta"><span>${escapeHTML(p.context[lang])}</span><span>${escapeHTML(p.year)}</span></p>
                <h3><a href="project.html?id=${encodeURIComponent(p.id)}">${escapeHTML(p.title[lang])}</a></h3>
                <p class="project-summary">${escapeHTML(p.summary[lang])}</p>
                <ul class="tags">${p.tags.map(t => `<li>${escapeHTML(t)}</li>`).join('')}</ul>
                <div class="project-actions">
                    <a href="project.html?id=${encodeURIComponent(p.id)}" class="btn btn-sm btn-primary">${projectLabels.details[lang]} <i class='bx bx-right-arrow-alt'></i></a>
                    ${githubButton(p, lang)}
                </div>
            </div>
        </article>`).join('');

    html += `
        <article class="card project-card project-more">
            <div class="icon-box"><i class='bx bx-rocket'></i></div>
            <h3>${projectLabels.moreTitle[lang]}</h3>
            <p>${projectLabels.moreText[lang]}</p>
            <a href="https://github.com/aya12bri" target="_blank" rel="noopener" class="btn btn-sm btn-outline"><i class='bx bxl-github'></i> ${projectLabels.moreBtn[lang]}</a>
        </article>`;

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
