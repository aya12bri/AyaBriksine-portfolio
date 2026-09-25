const header = document.querySelector('#header');
const navbar = document.querySelector('#navbar');
const menuBtn = document.querySelector('#menu-icon');
const navLinks = document.querySelectorAll('#navbar a');

/* ---------- Phone menu ---------- */
function setMenu(open) {
    navbar.classList.toggle('open', open);
    header.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menuBtn.querySelector('i').className = open ? 'bx bx-x' : 'bx bx-menu';
}

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

/* ---------- Header background after scrolling ---------- */
function updateHeader() {
    header.classList.toggle('scrolled', window.scrollY > 10);
}
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

/* ---------- Highlight the menu link of the section on screen ---------- */
const sections = document.querySelectorAll('main section[id]');
const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
        });
    });
}, { rootMargin: '-45% 0px -50% 0px' });
sections.forEach(section => sectionObserver.observe(section));

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

themeBtn.addEventListener('click', () => {
    const isLight = document.documentElement.classList.toggle('light-mode');
    try { localStorage.setItem('theme', isLight ? 'light' : 'dark'); } catch (e) {}
    updateThemeButton();
});

updateThemeButton();

/* ---------- Typing effect under the name ---------- */
const roles = {
    en: ['Digital Transformation Specialist', 'Project Manager', 'CRM & ERP Consultant', 'Industrial Engineer', 'Salesforce Administrator'],
    fr: ['Spécialiste en transformation digitale', 'Cheffe de projet', 'Consultante CRM & ERP', 'Ingénieure industrielle', 'Administratrice Salesforce']
};
const typed = document.querySelector('#typed');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let roleIndex = 0;
let charIndex = 0;
let deleting = false;
let typingLang = document.documentElement.lang;

function typeLoop() {
    const lang = document.documentElement.lang === 'fr' ? 'fr' : 'en';
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
}
typeLoop();

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
document.querySelector('#year').textContent = new Date().getFullYear();
