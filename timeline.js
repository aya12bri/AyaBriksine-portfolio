/* =========================================================
   Timeline: all the projects on a time line.
   ---------------------------------------------------------
   - Newest work at the top, grouped by year. A line fills up as you scroll,
     and each project slides in when it reaches the screen.
   - Click a line to open it (summary, tools, buttons).
   - The bars at the top show how many projects there are each year: click
     one to jump to that year.
   - The search box and the field buttons above filter the time line too.
   Everything comes from projects.js (the "year" of each project). The time
   line is only built when it is opened, so it costs nothing for visitors
   who stay on the cards.
   ========================================================= */
(function () {
    'use strict';
    if (typeof projects === 'undefined' || typeof projectCategories === 'undefined') return;
    const tools = document.querySelector('.project-tools');
    const grid = document.getElementById('projects-grid');
    if (!tools || !grid) return;

    const lang = () => (typeof currentLang === 'function' ? currentLang() : (document.documentElement.lang === 'fr' ? 'fr' : 'en'));
    const L = (en, fr) => (lang() === 'fr' ? fr : en);
    const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const clip = (s, n) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s);
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const SOFT = new Set(['travail en binôme', 'travail en équipe', 'teamwork', 'pair work', 'team work']);
    const HUES = { robotics: 205, control: 262, automation: 32, signal: 158, iot: 336, programming: 48, digital: 184, electrotechnique: 8 };
    const hueOf = key => (HUES[key] !== undefined ? HUES[key] : (Array.from(key).reduce((a, c) => a + c.charCodeAt(0), 0) * 47) % 360);

    // years of a project: "2026" or "2022 – 2025"; it is listed under its last year
    const yearsOf = p => (String(p.year).match(/\d{4}/g) || []).map(Number);
    const endOf = p => Math.max(...yearsOf(p), 0);
    const startOf = p => Math.min(...yearsOf(p), 9999);

    /* ---------- the "Cards | Timeline" switch ---------- */
    const sw = document.createElement('div');
    sw.className = 'view-switch'; sw.setAttribute('data-no-translate', ''); sw.setAttribute('role', 'group');
    sw.innerHTML = `<button type="button" data-view="cards" class="on"><i class='bx bx-grid-alt' aria-hidden="true"></i><span></span></button>
                    <button type="button" data-view="timeline"><i class='bx bx-time-five' aria-hidden="true"></i><span></span><em class="new"></em></button>`;
    tools.appendChild(sw);
    const labels = () => {
        sw.setAttribute('aria-label', L('View', 'Affichage'));
        sw.querySelector('[data-view="cards"] span').textContent = L('Cards', 'Cartes');
        sw.querySelector('[data-view="timeline"] span').textContent = L('Timeline', 'Frise');
        sw.querySelector('.new').textContent = L('new', 'nouveau');
    };
    labels();

    const box = document.createElement('div');
    box.id = 'project-timeline'; box.className = 'project-timeline'; box.hidden = true; box.setAttribute('data-no-translate', '');
    grid.parentNode.insertBefore(box, grid.nextSibling);

    let view = 'cards', built = false, io = null, open = new Set(), openYears = new Set();
    const LIMIT = 8;                                                    // a year with many projects shows the first ones, then a "show more" button
    function setView(v, remember) {
        view = v;
        sw.querySelectorAll('button').forEach(b => { const on = b.dataset.view === v; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
        grid.hidden = v === 'timeline'; box.hidden = v !== 'timeline';
        if (v === 'timeline') render();
        if (remember) { try { localStorage.setItem('projview', v); } catch (e) {} }
    }
    sw.addEventListener('click', e => { const b = e.target.closest('button[data-view]'); if (b) setView(b.dataset.view, true); });
    sw.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b.dataset.view === 'cards'));

    /* ---------- which projects are shown (the search box and the field buttons) ---------- */
    const shown = p => {
        const f = document.querySelector('#project-filters .filter.active'), cat = f ? f.dataset.filter : 'all';
        const s = document.getElementById('project-search'), q = ((s && s.value) || '').trim().toLowerCase();
        if (cat !== 'all' && p.category !== cat) return false;
        return !q || [p.title, p.summary, p.context].some(o => Object.values(o).some(t => t.toLowerCase().includes(q))) || (p.tags || []).some(t => t.toLowerCase().includes(q));
    };

    /* ---------- drawing ---------- */
    function render() {
        const l = lang(), list = projects.filter(shown);
        const years = [...new Set(projects.map(endOf))].sort((a, b) => b - a);
        const byYear = {}; list.forEach(p => { (byYear[endOf(p)] = byYear[endOf(p)] || []).push(p); });
        const allByYear = {}; projects.forEach(p => { allByYear[endOf(p)] = (allByYear[endOf(p)] || 0) + 1; });
        const maxN = Math.max(...Object.values(allByYear));
        const fields = new Set(projects.map(p => p.category)).size, first = Math.min(...projects.map(startOf));

        const strip = years.slice().reverse().map(y => {
            const n = (byYear[y] || []).length, h = 14 + Math.round((allByYear[y] / maxN) * 46);
            return `<button type="button" class="tl-bar${n ? '' : ' empty'}" data-year="${y}" style="--bh:${h}px" aria-label="${y}: ${n}"><span class="tl-bar-n">${n}</span><i></i><b>${y}</b></button>`;
        }).join('');

        const row = p => {
            const cat = projectCategories[p.category], ys = yearsOf(p), span = ys.length > 1 && Math.min(...ys) !== Math.max(...ys);
            const tags = (p.tags || []).filter(t => !SOFT.has(t.toLowerCase())).slice(0, 5);
            const img = p.image ? `<img class="tl-img${p.imageFit === 'contain' ? ' contain' : ''}" src="${esc(p.image)}" alt="" loading="lazy" width="160" height="110">` : '';
            const gh = p.github ? `<a class="btn btn-sm btn-outline" href="${esc(p.github)}" target="_blank" rel="noopener"><i class='bx bxl-github' aria-hidden="true"></i> GitHub</a>` : '';
            return `<li class="tl-item${open.has(p.id) ? ' open' : ''}" data-id="${esc(p.id)}" style="--h:${hueOf(p.category)}">
                <span class="tl-dot" aria-hidden="true"></span>
                <button type="button" class="tl-head" aria-expanded="${open.has(p.id)}">
                    <span class="tl-top"><span class="tl-cat"><i class='bx ${esc(cat.icon)}' aria-hidden="true"></i>${esc(cat[l] || cat.en)}</span>${span ? `<span class="tl-span">${esc(p.year)}</span>` : ''}</span>
                    <span class="tl-title">${esc(p.title[l] || p.title.en)}</span>
                    <span class="tl-line">${esc(clip(p.summary[l] || p.summary.en, 130))}</span>
                    <i class='bx bx-chevron-down tl-chev' aria-hidden="true"></i>
                </button>
                <div class="tl-body"><div class="tl-body-in">
                    ${img}
                    <div class="tl-text">
                        <p>${esc(p.summary[l] || p.summary.en)}</p>
                        ${tags.length ? `<ul class="tl-tags">${tags.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
                        <div class="tl-actions">
                            <a class="btn btn-sm btn-primary" href="project.html?id=${encodeURIComponent(p.id)}">${L('Open the project', 'Ouvrir le projet')} <i class='bx bx-right-arrow-alt' aria-hidden="true"></i></a>
                            <button type="button" class="btn btn-sm btn-outline" data-ask-project="${esc(p.id)}"><i class='bx bx-bot' aria-hidden="true"></i> ${L('Explain simply', 'Expliquer simplement')}</button>
                            ${gh}
                        </div>
                    </div>
                </div></div>
            </li>`;
        };

        const filtering = list.length !== projects.length;
        const groups = years.filter(y => (byYear[y] || []).length).map(y => {
            const all = byYear[y], cut = !filtering && !openYears.has(y) && all.length > LIMIT + 2 ? LIMIT : all.length;
            return `
            <section class="tl-year" id="tl-${y}" data-year="${y}">
                <header class="tl-year-head"><h3>${y}</h3><span>${L(byYear[y].length === 1 ? '1 project' : byYear[y].length + ' projects', byYear[y].length === 1 ? '1 projet' : byYear[y].length + ' projets')}</span></header>
                <ol class="tl-list">${all.slice(0, cut).map(row).join('')}</ol>
                ${cut < all.length ? `<button type="button" class="tl-more" data-more="${y}">${L(`Show ${all.length - cut} more projects of ${y}`, `Voir ${all.length - cut} autres projets de ${y}`)} <i class='bx bx-chevron-down' aria-hidden="true"></i></button>` : ''}
            </section>`;
        }).join('');

        box.innerHTML = `
            <div class="tl-intro">
                <div class="tl-stats">
                    <p><strong>${projects.length}</strong><span>${L('projects', 'projets')}</span></p>
                    <p><strong>${fields}</strong><span>${L('fields', 'domaines')}</span></p>
                    <p><strong>${new Date().getFullYear() - first + 1}</strong><span>${L('years of work', 'années de travail')}</span></p>
                </div>
                <div class="tl-bars" role="group" aria-label="${L('Projects per year: click a year to jump to it', 'Projets par année : cliquez sur une année pour y aller')}">${strip}</div>
            </div>
            <div class="tl-track"><i class="tl-spine"><b class="tl-fill"></b></i>
                ${list.length ? groups : `<p class="tl-empty"><i class='bx bx-search-alt' aria-hidden="true"></i>${L('No project matches your search.', 'Aucun projet ne correspond à votre recherche.')}</p>`}
            </div>`;
        built = true;
        watch();
    }

    /* the projects slide in when they reach the screen, and the line fills with the scroll */
    function watch() {
        if (io) io.disconnect();
        const items = box.querySelectorAll('.tl-item, .tl-year-head');
        if (reduce || !('IntersectionObserver' in window)) { items.forEach(i => i.classList.add('in')); progress(); return; }
        io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
        items.forEach(i => io.observe(i));
        box.querySelectorAll('.tl-bar').forEach((b, i) => { b.style.setProperty('--d', i * 90 + 'ms'); });
        requestAnimationFrame(() => box.classList.add('go'));
        progress();
    }
    let ticking = false;
    function progress() {
        const track = box.querySelector('.tl-track'); if (!track || box.hidden) return;
        const r = track.getBoundingClientRect(), mid = innerHeight * 0.55;
        const p = Math.max(0, Math.min(1, (mid - r.top) / Math.max(1, r.height)));
        track.style.setProperty('--p', (p * 100).toFixed(1) + '%');
        const line = r.top + p * r.height;
        track.querySelectorAll('.tl-item').forEach(it => it.classList.toggle('past', it.getBoundingClientRect().top + 22 < mid));
    }
    addEventListener('scroll', () => { if (!ticking && view === 'timeline') { ticking = true; requestAnimationFrame(() => { ticking = false; progress(); }); } }, { passive: true });
    addEventListener('resize', () => { if (view === 'timeline') progress(); });

    /* ---------- clicks ---------- */
    box.addEventListener('click', e => {
        const more = e.target.closest('.tl-more');
        if (more) { openYears.add(+more.dataset.more); render(); return; }
        const bar = e.target.closest('.tl-bar');
        if (bar) { const t = box.querySelector('#tl-' + bar.dataset.year); if (t) t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); return; }
        const head = e.target.closest('.tl-head');
        if (head) {
            const it = head.closest('.tl-item'), on = !it.classList.contains('open');
            it.classList.toggle('open', on); head.setAttribute('aria-expanded', on);
            if (on) open.add(it.dataset.id); else open.delete(it.dataset.id);
            setTimeout(progress, 380);
        }
    });
    const refilter = () => { if (view === 'timeline') render(); };
    document.getElementById('project-filters').addEventListener('click', () => setTimeout(refilter, 0));
    const search = document.getElementById('project-search'); if (search) search.addEventListener('input', () => setTimeout(refilter, 0));
    document.addEventListener('langchange', () => { labels(); if (built && view === 'timeline') render(); });

    // the assistant can open this view
    window.ProjectTimeline = { show() { setView('timeline', true); } };

    // come back to the view the visitor chose last time
    try { if (localStorage.getItem('projview') === 'timeline') setView('timeline'); } catch (e) {}
})();
