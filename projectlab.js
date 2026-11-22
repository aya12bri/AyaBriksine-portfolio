/* =========================================================
   Project Lab: all the projects on one interactive map.
   ---------------------------------------------------------
   - Each dot is a project, grouped by field (robotics, control...).
   - Hover or tap a dot to see what it is; click to pin it. Lines show the
     projects that share tools with it.
   - Pick a tool under the map (MATLAB, Simulink...) to light up every
     project that used it.
   - The search box and the field buttons above also filter the map.
   Everything comes from projects.js: add a project there and it appears
   on the map by itself. The map is only built when it is opened, so it
   costs nothing for visitors who stay on the cards.
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
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const NS = 'http://www.w3.org/2000/svg';
    const clip = (s, n) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s);

    // soft skills are not tools: they would link everything to everything
    const SOFT = new Set(['travail en binôme', 'travail en équipe', 'teamwork', 'pair work', 'team work']);
    const HUES = { robotics: 205, control: 262, automation: 32, signal: 158, iot: 336, programming: 48, digital: 184, electrotechnique: 8 };
    const hueOf = key => (HUES[key] !== undefined ? HUES[key] : (Array.from(key).reduce((a, c) => a + c.charCodeAt(0), 0) * 47) % 360);

    const cats = Object.keys(projectCategories).filter(k => projects.some(p => p.category === k));
    const tagsOf = p => (p.tags || []).filter(t => !SOFT.has(t.toLowerCase()));
    const byId = {}; projects.forEach(p => { byId[p.id] = p; });

    /* ---------- the "Cards | Lab" switch ---------- */
    const sw = document.createElement('div');
    sw.className = 'view-switch'; sw.setAttribute('data-no-translate', ''); sw.setAttribute('role', 'group');
    sw.innerHTML = `<button type="button" data-view="cards" class="on"><i class='bx bx-grid-alt' aria-hidden="true"></i><span></span></button>
                    <button type="button" data-view="lab"><i class='bx bx-network-chart' aria-hidden="true"></i><span></span><em class="new"></em></button>`;
    tools.appendChild(sw);
    const labels = () => {
        sw.setAttribute('aria-label', L('View', 'Affichage'));
        sw.querySelector('[data-view="cards"] span').textContent = L('Cards', 'Cartes');
        sw.querySelector('[data-view="lab"] span').textContent = L('Project Lab', 'Labo des projets');
        sw.querySelector('.new').textContent = L('new', 'nouveau');
    };
    labels();

    const lab = document.createElement('div');
    lab.id = 'project-lab'; lab.className = 'project-lab'; lab.hidden = true; lab.setAttribute('data-no-translate', '');
    grid.parentNode.insertBefore(lab, grid.nextSibling);

    let built = false, view = 'cards';
    function setView(v, remember) {
        view = v;
        sw.querySelectorAll('button').forEach(b => { const on = b.dataset.view === v; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
        grid.hidden = v === 'lab'; lab.hidden = v !== 'lab';
        if (v === 'lab') { if (!built) build(); else render(); }
        if (remember) { try { localStorage.setItem('projview', v); } catch (e) {} }
    }
    sw.addEventListener('click', e => { const b = e.target.closest('button[data-view]'); if (b) setView(b.dataset.view, true); });
    if (view === 'cards') sw.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b.dataset.view === 'cards'));

    /* ---------- state ---------- */
    const S = { pinned: null, hover: null, tool: null, W: 0, H: 0 };
    let stage, svg, detail, toolsBox, nodesG, linksG, tip, pos = {}, nodeEls = {};

    function build() {
        built = true;
        lab.innerHTML = `
            <div class="lab-main">
                <div class="lab-stage" aria-label=""><svg class="lab-svg" role="group"></svg></div>
                <aside class="lab-detail" aria-live="polite"></aside>
            </div>
            <div class="lab-tools"><p class="lab-tools-title"></p><div class="lab-chips"></div></div>`;
        stage = lab.querySelector('.lab-stage'); svg = lab.querySelector('.lab-svg'); detail = lab.querySelector('.lab-detail'); toolsBox = lab.querySelector('.lab-chips');

        svg.addEventListener('pointerover', e => { const n = e.target.closest('.lab-node'); if (n && e.pointerType === 'mouse') { S.hover = n.dataset.id; paint(); } });
        svg.addEventListener('pointerout', e => { const n = e.target.closest('.lab-node'); if (n && e.pointerType === 'mouse' && !n.contains(e.relatedTarget)) { S.hover = null; paint(); } });
        svg.addEventListener('focusin', e => { const n = e.target.closest('.lab-node'); if (n) { S.hover = n.dataset.id; paint(); } });
        svg.addEventListener('focusout', e => { if (e.target.closest('.lab-node')) { S.hover = null; paint(); } });
        svg.addEventListener('click', e => {
            const n = e.target.closest('.lab-node');
            S.pinned = n ? (S.pinned === n.dataset.id ? null : n.dataset.id) : null;
            if (n) S.tool = null;
            paint();
        });
        svg.addEventListener('keydown', e => {
            const n = e.target.closest('.lab-node');
            if (n && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); S.pinned = S.pinned === n.dataset.id ? null : n.dataset.id; S.tool = null; paint(); }
            if (e.key === 'Escape') { S.pinned = null; paint(); }
        });
        detail.addEventListener('click', e => {
            const t = e.target.closest('[data-tool]');
            if (t) { S.tool = S.tool === t.dataset.tool ? null : t.dataset.tool; S.pinned = null; paint(); return; }
            const r = e.target.closest('[data-pin]');
            if (r) { S.pinned = r.dataset.pin; paint(); }
            if (e.target.closest('[data-clear]')) { S.pinned = null; S.tool = null; paint(); }
        });
        toolsBox.addEventListener('click', e => {
            const b = e.target.closest('[data-tool]'); if (!b) return;
            S.tool = S.tool === b.dataset.tool ? null : b.dataset.tool; S.pinned = null; paint();
        });
        // the search box and the field buttons filter the map too
        const refilter = () => { if (view === 'lab') paint(); };
        document.getElementById('project-filters').addEventListener('click', () => setTimeout(refilter, 0));
        const search = document.getElementById('project-search'); if (search) search.addEventListener('input', () => setTimeout(refilter, 0));
        document.addEventListener('langchange', () => { labels(); if (built) render(); });
        if (window.ResizeObserver) new ResizeObserver(() => { if (view === 'lab' && Math.abs(stage.clientWidth - S.W) > 8) render(); }).observe(stage);
        else addEventListener('resize', () => { if (view === 'lab') render(); });
        render();
    }

    /* ---------- layout ---------- */
    function layout(W, H) {
        const narrow = W < 560, mx = narrow ? 70 : 150, my = narrow ? 84 : 66;
        const cx = W / 2, cy = H / 2, rx = Math.max(60, W / 2 - mx), ry = Math.max(60, H / 2 - my);
        const out = { hubs: {}, nodes: {}, narrow, cx, cy };
        const nodeR = narrow ? 11 : 13;
        out.r = nodeR;
        cats.forEach((k, i) => {
            const a = -Math.PI / 2 + (i / cats.length) * Math.PI * 2, dx = Math.cos(a), dy = Math.sin(a);
            const hub = { x: cx + rx * dx, y: cy + ry * dy, a, dx, dy, key: k };
            const list = projects.filter(p => p.category === k), n = list.length;
            const R = n === 1 ? 0 : Math.max(narrow ? 20 : 24, ((nodeR * 2 + (narrow ? 4 : 6)) * n) / (Math.PI * 2));
            hub.R = R; out.hubs[k] = hub;
            list.forEach((p, j) => {
                const aa = a + (n === 1 ? 0 : (j / n) * Math.PI * 2 + Math.PI / n);
                out.nodes[p.id] = { x: hub.x + (n === 1 ? 0 : Math.cos(aa) * R), y: hub.y + (n === 1 ? 0 : Math.sin(aa) * R), hub };
            });
        });
        return out;
    }

    const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };

    function render() {
        S.W = Math.round(stage.clientWidth); S.H = Math.round(stage.clientHeight);
        if (!S.W || !S.H) return;
        const lay = layout(S.W, S.H); pos = lay.nodes;
        svg.setAttribute('viewBox', `0 0 ${S.W} ${S.H}`); svg.setAttribute('width', S.W); svg.setAttribute('height', S.H);
        svg.innerHTML = ''; nodeEls = {};
        stage.setAttribute('aria-label', L('Interactive map of all projects, grouped by field', 'Carte interactive de tous les projets, regroupés par domaine'));
        svg.setAttribute('aria-label', stage.getAttribute('aria-label'));

        const spokes = el('g', { class: 'lab-spokes' }, svg);
        const cluster = el('g', { class: 'lab-cluster' }, svg);
        linksG = el('g', { class: 'lab-links' }, svg);
        const labelsG = el('g', { class: 'lab-cats' }, svg);
        nodesG = el('g', { class: 'lab-nodes' }, svg);
        tip = el('g', { class: 'lab-tip', 'aria-hidden': 'true' }, svg);
        el('rect', { rx: 8, ry: 8 }, tip); el('text', {}, tip);

        // centre
        const c = el('g', { class: 'lab-center', transform: `translate(${lay.cx} ${lay.cy})` }, svg);
        el('circle', { r: lay.narrow ? 30 : 40, class: 'lab-center-bg' }, c);
        const t1 = el('text', { class: 'lab-center-t1', y: lay.narrow ? 2 : 0, 'text-anchor': 'middle' }, c); t1.textContent = 'Aya';
        const t2 = el('text', { class: 'lab-center-t2', y: lay.narrow ? 16 : 17, 'text-anchor': 'middle' }, c); t2.textContent = projects.length + ' ' + L('projects', 'projets');

        cats.forEach((k, i) => {
            const h = lay.hubs[k], hue = hueOf(k), cat = projectCategories[k];
            el('line', { x1: lay.cx, y1: lay.cy, x2: h.x, y2: h.y, class: 'lab-spoke', style: `--h:${hue}` }, spokes);
            el('circle', { cx: h.x, cy: h.y, r: h.R + lay.r + 9, class: 'lab-zone', style: `--h:${hue}`, 'data-cat': k }, cluster);
            // label next to the cluster: on phones below it (centred), on wide screens pushed away from the centre
            const g = el('g', { class: 'lab-cat', 'data-cat': k, style: `--h:${hue}` }, labelsG);
            const name = String(cat[lang()] || cat.en), words = name.split(' ');
            const lines = words.length > 1 && name.length > (lay.narrow ? 11 : 20) ? [words.slice(0, Math.ceil(words.length / 2)).join(' '), words.slice(Math.ceil(words.length / 2)).join(' ')] : [name];
            let tx, base, anchor;
            if (lay.narrow) { anchor = 'middle'; tx = Math.max(54, Math.min(S.W - 54, h.x)); base = h.y + h.R + lay.r + 24; }
            else if (h.dy < -0.9) { anchor = 'start'; tx = h.x + h.R + lay.r + 18; base = h.y - 4; }
            else {
                const off = h.R + lay.r + 22, lx = h.x + h.dx * off, ly = h.y + h.dy * off;
                anchor = h.dx > 0.4 ? 'start' : h.dx < -0.4 ? 'end' : 'middle';
                tx = Math.max(6, Math.min(S.W - 6, lx));
                base = ly + (h.dy > 0.5 ? 6 : -(lines.length - 1) * 6);
            }
            const text = el('text', { x: tx, y: base, 'text-anchor': anchor, class: 'lab-cat-t' }, g);
            lines.forEach((ln, j) => { const ts = el('tspan', { x: tx, dy: j ? 13 : 0 }, text); ts.textContent = ln; });
            const cnt = el('text', { x: tx, y: base + lines.length * 13, 'text-anchor': anchor, class: 'lab-cat-n' }, g);
            cnt.textContent = projects.filter(p => p.category === k).length;
            // small spokes inside the cluster
            projects.filter(p => p.category === k).forEach(p => { const n = lay.nodes[p.id]; if (h.R) el('line', { x1: h.x, y1: h.y, x2: n.x, y2: n.y, class: 'lab-mini', style: `--h:${hue}` }, cluster); });
            if (h.R) el('circle', { cx: h.x, cy: h.y, r: 4, class: 'lab-hub', style: `--h:${hue}` }, cluster);
        });

        projects.forEach((p, i) => {
            const n = lay.nodes[p.id], g = el('g', { class: 'lab-node', transform: `translate(${n.x.toFixed(1)} ${n.y.toFixed(1)})`, 'data-id': p.id, tabindex: 0, role: 'button', 'aria-label': `${p.title[lang()] || p.title.en}, ${(projectCategories[p.category][lang()])}, ${p.year}` }, nodesG);
            const inner = el('g', { class: 'lab-node-in', style: `--h:${hueOf(p.category)};--d:${reduce ? 0 : Math.min(900, i * 28)}ms` }, g);
            el('circle', { r: lay.r + 9, class: 'lab-hit' }, inner);
            el('circle', { r: lay.r + 5, class: 'lab-halo' }, inner);
            el('circle', { r: lay.r, class: 'lab-dot' }, inner);
            el('circle', { r: 3.2, class: 'lab-core' }, inner);
            nodeEls[p.id] = g;
        });

        // tools strip
        const counts = {}; projects.forEach(p => tagsOf(p).forEach(t => { counts[t] = (counts[t] || 0) + 1; }));
        const top = Object.entries(counts).filter(e => e[1] >= 2).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 14);
        lab.querySelector('.lab-tools-title').textContent = L('Pick a tool or a topic to see where it was used', 'Choisissez un outil ou un thème pour voir où il a servi');
        toolsBox.innerHTML = top.map(([t, n]) => `<button type="button" data-tool="${esc(t)}">${esc(t)}<span>${n}</span></button>`).join('');

        svg.classList.remove('in'); void svg.getBBox(); requestAnimationFrame(() => svg.classList.add('in'));
        paint();
    }

    /* ---------- state -> screen ---------- */
    const matches = p => {
        const f = document.querySelector('#project-filters .filter.active'), cat = f ? f.dataset.filter : 'all';
        const search = document.getElementById('project-search'), q = ((search && search.value) || '').trim().toLowerCase();
        if (cat !== 'all' && p.category !== cat) return false;
        return !q || [p.title, p.summary, p.context].some(o => Object.values(o).some(t => t.toLowerCase().includes(q))) || (p.tags || []).some(t => t.toLowerCase().includes(q));
    };
    function related(p) {
        const mine = new Set(tagsOf(p));
        return projects.filter(o => o.id !== p.id).map(o => ({ p: o, via: tagsOf(o).filter(t => mine.has(t)) })).filter(r => r.via.length).sort((a, b) => b.via.length - a.via.length || (b.p.category === p.category) - (a.p.category === p.category)).slice(0, 5);
    }

    function paint() {
        if (!built || !nodesG) return;
        const active = S.hover || S.pinned, p = active ? byId[active] : null, rel = p ? related(p) : [];
        const relIds = new Set(rel.map(r => r.p.id));
        svg.classList.toggle('has-active', !!p); svg.classList.toggle('has-tool', !!S.tool && !p);
        projects.forEach(q => {
            const g = nodeEls[q.id]; if (!g) return;
            const hit = S.tool && tagsOf(q).includes(S.tool);
            g.classList.toggle('off', !matches(q));
            g.classList.toggle('sel', !!p && q.id === p.id);
            g.classList.toggle('pin', q.id === S.pinned);
            g.classList.toggle('rel', relIds.has(q.id));
            g.classList.toggle('hit', !!hit && !p);
            g.setAttribute('aria-pressed', q.id === S.pinned);
        });
        svg.querySelectorAll('.lab-cat').forEach(c => c.classList.toggle('dim', !!p && c.dataset.cat !== p.category));

        // links to the related projects
        linksG.innerHTML = '';
        if (p) {
            const a = pos[p.id], hue = hueOf(p.category);
            rel.forEach(r => {
                const b = pos[r.p.id], mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, k = 0.38;
                const path = el('path', { d: `M${a.x} ${a.y} Q${mx + (S.W / 2 - mx) * k} ${my + (S.H / 2 - my) * k} ${b.x} ${b.y}`, class: 'lab-link', style: `--h:${hue}`, pathLength: 1 }, linksG);
                path.style.animationDelay = reduce ? '0ms' : '0ms';
            });
        }
        // tooltip
        const tipText = tip.querySelector('text'), tipRect = tip.querySelector('rect');
        if (p) {
            const a = pos[p.id]; tipText.textContent = clip(p.title[lang()] || p.title.en, 46);
            tip.style.display = 'block'; const bb = tipText.getBBox(), w = bb.width + 18, h = bb.height + 10;
            let x = Math.max(4, Math.min(S.W - w - 4, a.x - w / 2)), y = a.y - 13 - 15 - h; if (y < 4) y = a.y + 13 + 15;
            tipRect.setAttribute('x', x); tipRect.setAttribute('y', y); tipRect.setAttribute('width', w); tipRect.setAttribute('height', h);
            tipText.setAttribute('x', x + 9); tipText.setAttribute('y', y + h - 7);
        } else tip.style.display = 'none';

        toolsBox.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.tool === S.tool));

        // side panel
        const pinned = !!S.pinned && p && p.id === S.pinned;
        if (p) {
            const cat = projectCategories[p.category], l = lang();
            detail.className = 'lab-detail has-project'; detail.style.setProperty('--h', hueOf(p.category));
            detail.innerHTML = `
                <p class="ld-meta"><span class="ld-cat"><i class='bx ${esc(cat.icon)}' aria-hidden="true"></i>${esc(cat[l] || cat.en)}</span><span>${esc(p.year)}</span></p>
                <h3>${esc(p.title[l] || p.title.en)}</h3>
                <p class="ld-sum">${esc(clip(p.summary[l] || p.summary.en, pinned ? 380 : 210))}</p>
                <ul class="ld-tags">${tagsOf(p).slice(0, 8).map(t => `<li><button type="button" data-tool="${esc(t)}">${esc(t)}</button></li>`).join('')}</ul>
                ${rel.length ? `<div class="ld-rel"><small>${L('Connected through shared tools', 'Reliés par des outils communs')}</small>${rel.slice(0, 4).map(r => `<button type="button" data-pin="${esc(r.p.id)}"><span>${esc(clip(r.p.title[l] || r.p.title.en, 54))}</span><em>${esc(r.via.slice(0, 2).join(' · '))}</em></button>`).join('')}</div>` : ''}
                <div class="ld-actions">
                    <a class="btn btn-sm btn-primary" href="project.html?id=${encodeURIComponent(p.id)}">${L('Open the project', 'Ouvrir le projet')} <i class='bx bx-right-arrow-alt' aria-hidden="true"></i></a>
                    <button type="button" class="btn btn-sm btn-outline" data-ask-project="${esc(p.id)}"><i class='bx bx-bot' aria-hidden="true"></i> ${L('Explain simply', 'Expliquer simplement')}</button>
                </div>
                ${pinned ? '' : `<p class="ld-hint">${L('Click the dot to keep this card open.', 'Cliquez sur le point pour garder cette fiche ouverte.')}</p>`}`;
        } else if (S.tool) {
            const hits = projects.filter(q => tagsOf(q).includes(S.tool)), l = lang();
            detail.className = 'lab-detail'; detail.style.setProperty('--h', 205);
            detail.innerHTML = `<p class="ld-meta"><span class="ld-cat"><i class='bx bx-wrench' aria-hidden="true"></i>${L('Tool / topic', 'Outil / thème')}</span><span>${hits.length}</span></p>
                <h3>${esc(S.tool)}</h3>
                <p class="ld-sum">${L(`Used in ${hits.length} projects. They are lit up on the map.`, `Utilisé dans ${hits.length} projets. Ils sont allumés sur la carte.`)}</p>
                <div class="ld-rel">${hits.map(q => `<button type="button" data-pin="${esc(q.id)}"><span>${esc(clip(q.title[l] || q.title.en, 58))}</span><em>${esc(q.year)}</em></button>`).join('')}</div>
                <button type="button" class="btn btn-sm btn-outline" data-clear><i class='bx bx-x' aria-hidden="true"></i> ${L('Clear', 'Effacer')}</button>`;
        } else {
            const total = new Set(projects.flatMap(q => tagsOf(q))).size, shown = projects.filter(matches).length;
            detail.className = 'lab-detail intro'; detail.style.setProperty('--h', 205);
            detail.innerHTML = `<p class="ld-meta"><span class="ld-cat"><i class='bx bx-network-chart' aria-hidden="true"></i>${L('Project Lab', 'Labo des projets')}</span></p>
                <h3>${L('Everything Aya has built, on one map', 'Tout ce qu\'Aya a construit, sur une seule carte')}</h3>
                <p class="ld-sum">${L('Each dot is a project and each colour a field. Hover or tap a dot to see what it is, and click to keep it open. Lines show projects that share tools.', 'Chaque point est un projet et chaque couleur un domaine. Survolez ou touchez un point pour voir ce que c\'est, et cliquez pour garder la fiche ouverte. Les lignes relient les projets qui partagent des outils.')}</p>
                <ul class="ld-stats"><li><strong>${projects.length}</strong><span>${L('projects', 'projets')}</span></li><li><strong>${cats.length}</strong><span>${L('fields', 'domaines')}</span></li><li><strong>${total}</strong><span>${L('tools & topics', 'outils & thèmes')}</span></li></ul>
                ${shown !== projects.length ? `<p class="ld-hint">${L(`${shown} of ${projects.length} match your search.`, `${shown} projets sur ${projects.length} correspondent à votre recherche.`)}</p>` : ''}`;
        }
    }

    // come back to the view the visitor chose last time (runs last, once everything above is defined)
    try { if (localStorage.getItem('projview') === 'lab') setView('lab'); } catch (e) {}
})();
