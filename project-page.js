/* Builds a project's own page (project.html?id=...) from projects.js.
   You don't need to edit this file: change the text in projects.js instead. */

(function () {
    const root = document.querySelector('#project-root');
    const backLabel = document.querySelector('#project-back-label');
    const id = new URLSearchParams(location.search).get('id');
    const index = projects.findIndex(p => p.id === id);

    const t = {
        back: { en: 'All projects', fr: 'Tous les projets' },
        overview: { en: 'Overview', fr: 'Présentation' },
        objective: { en: 'Objective', fr: 'Objectif' },
        role: { en: 'My role', fr: 'Mon rôle' },
        process: { en: 'Project steps', fr: 'Déroulement du projet' },
        technicalDetails: { en: 'Technical details', fr: 'Détails techniques' },
        results: { en: 'Results', fr: 'Résultats' },
        gallery: { en: 'Project gallery', fr: 'Galerie du projet' },
        tools: { en: 'Tools & skills', fr: 'Outils & compétences' },
        resources: { en: 'Project resources', fr: 'Ressources du projet' },
        github: { en: 'View code on GitHub', fr: 'Voir le code sur GitHub' },
        soon: { en: 'Code coming soon on GitHub', fr: 'Code bientôt en ligne sur GitHub' },
        pdf: { en: 'Download the report (PDF)', fr: 'Télécharger le rapport (PDF)' },
        demo: { en: 'Watch the demo', fr: 'Voir la démonstration' },
        video: { en: 'Video demonstration', fr: 'Vidéo de démonstration' },
        prev: { en: 'Previous project', fr: 'Projet précédent' },
        next: { en: 'Next project', fr: 'Projet suivant' },
        contact: { en: 'Interested in this project? Let’s talk.', fr: 'Ce projet vous intéresse ? Parlons-en.' },
        contactBtn: { en: 'Contact me', fr: 'Me contacter' },
        notFound: { en: 'Project not found', fr: 'Projet introuvable' },
        notFoundText: { en: 'This project doesn’t exist or has moved.', fr: 'Ce projet n’existe pas ou a été déplacé.' }
    };

    function render() {
        const lang = currentLang();
        backLabel.textContent = t.back[lang];

        if (index === -1) {
            document.title = t.notFound[lang] + ' | Aya Briksine';
            root.innerHTML = `
                <section class="project-hero">
                    <div class="container">
                        <h1>${t.notFound[lang]}</h1>
                        <p class="project-lead">${t.notFoundText[lang]}</p>
                    </div>
                </section>`;
            return;
        }

        const p = projects[index];
        const cat = projectCategories[p.category];
        const skills = [...new Set([cat[lang], ...p.tags])];
        const prev = projects[(index - 1 + projects.length) % projects.length];
        const next = projects[(index + 1) % projects.length];
        document.title = p.title[lang] + ' | Aya Briksine';

        const githubLink = !p.github && !p.code
            ? ''
            : p.github
            ? `<a href="${escapeHTML(p.github)}" target="_blank" rel="noopener" class="btn btn-primary"><i class='bx bxl-github'></i> ${t.github[lang]}</a>`
            : `<span class="btn btn-ghost"><i class='bx bxl-github'></i> ${t.soon[lang]}</span>`;
        const pdfLink = p.pdf
            ? `<a href="${escapeHTML(p.pdf)}" download class="btn btn-primary"><i class='bx bx-download'></i> ${t.pdf[lang]}</a>`
            : '';
        const downloadLinks = (p.downloads || []).map(d =>
            `<a href="${escapeHTML(d.file)}" download class="btn btn-outline"><i class='bx ${escapeHTML(d.icon || 'bx-download')}'></i> ${escapeHTML(d.label[lang])}</a>`).join('');
        const videoLink = p.video
            ? `<a href="#project-demo" class="btn btn-outline"><i class='bx bx-play-circle'></i> ${t.demo[lang]}</a>`
            : '';
        const externalDemo = p.demo
            ? `<a href="${escapeHTML(p.demo)}" target="_blank" rel="noopener" class="btn btn-outline"><i class='bx bx-play-circle'></i> ${(p.demoLabel || t.demo)[lang]}</a>`
            : '';
        const actions = pdfLink + videoLink + externalDemo;
        const resources = downloadLinks + githubLink;
        const cover = p.image || p.art
            ? `<div class="project-banner project-visual cat-${p.category} ${p.image ? `has-image fit-${p.imageFit || 'cover'}` : ''}">
                ${p.image
                    ? `<img src="${escapeHTML(p.image)}" alt="${escapeHTML(p.title[lang])}">`
                    : `<span class="cover-art art-${escapeHTML(p.art)}" aria-hidden="true"></span>`}
            </div>`
            : '';
        const video = p.video
            ? `<section class="project-demo" id="project-demo" aria-labelledby="project-demo-title">
                <h2 id="project-demo-title">${t.video[lang]}</h2>
                <div class="project-video"><video controls playsinline preload="metadata" ${p.image ? `poster="${escapeHTML(p.image)}"` : ''} src="${escapeHTML(p.video)}"></video></div>
            </section>`
            : '';
        const brief = p.brief;
        const overview = [
            [t.objective[lang], brief?.objective?.[lang]],
            [t.role[lang], brief?.role?.[lang]],
            [t.results[lang], brief?.outcome?.[lang] || p.results?.[lang]]
        ].filter(([, value]) => value);
        const highlights = p.highlights[lang].map(h => `<li><span>${escapeHTML(h)}</span></li>`).join('');
        const phases = brief?.phases?.map(phase =>
            `<li><strong>${escapeHTML(phase.title[lang])}</strong><p>${escapeHTML(phase.description[lang])}</p></li>`
        ).join('');
        const details = phases
            ? `<details class="project-technical">
                <summary>${t.technicalDetails[lang]}</summary>
                <ol class="steps" role="list">${highlights}</ol>
                ${brief.outcome?.[lang] && p.results?.[lang] ? `<h3>${t.results[lang]}</h3><p>${escapeHTML(p.results[lang])}</p>` : ''}
            </details>`
            : '';
        const gallery = p.gallery && p.gallery.length
            ? `<section class="project-gallery"><h2>${t.gallery[lang]}</h2><div class="gallery">${p.gallery.map(item => {
                const src = typeof item === 'string' ? item : item.src;
                const cap = item.caption && item.caption[lang] ? item.caption[lang] : '';
                const imageClass = src === p.image && p.imageFit !== 'contain' ? ' class="gallery-cover"' : '';
                return `<figure><a href="${escapeHTML(src)}" target="_blank" rel="noopener"><img${imageClass} src="${escapeHTML(src)}" alt="${escapeHTML(cap)}" loading="lazy"></a>${cap ? `<figcaption>${escapeHTML(cap)}</figcaption>` : ''}</figure>`;
            }).join('')}</div></section>`
            : '';

        // F layout: title, then tabs (Overview / Steps / Images / Files)
        const L2 = (en, fr) => (lang === 'fr' ? fr : en);
        const figs = (p.gallery || []).map(item => ({ src: typeof item === 'string' ? item : item.src, cap: (item.caption && item.caption[lang]) || '' }));
        const steps = brief?.phases?.length
            ? brief.phases.map(ph => ({ title: ph.title[lang], text: ph.description[lang] }))
            : p.highlights[lang].map(h => ({ title: '', text: h }));
        const vis = !p.video && !p.image && window.systemVisuals ? systemVisuals.get(p.id, lang) : [];
        const visHTML = v => `<div class="pt-sv">${v.html}</div><span class="pt-cap">${escapeHTML(v.cap)}</span>`;
        const mainMedia = vis.length ? visHTML(vis[0])
            : p.video
            ? `<video controls playsinline preload="metadata" ${p.image ? `poster="${escapeHTML(p.image)}"` : ''} src="${escapeHTML(p.video)}"></video>`
            : p.image ? `<img src="${escapeHTML(p.image)}" alt="${escapeHTML(p.title[lang])}" class="fit-${p.imageFit || 'cover'}">`
            : figs.length ? `<img src="${escapeHTML(figs[0].src)}" alt="${escapeHTML(figs[0].cap)}" class="fit-contain">`
            : p.art ? `<div class="pt-art project-visual cat-${p.category}"><span class="cover-art art-${escapeHTML(p.art)}" aria-hidden="true"></span></div>` : '';
        const thumbs = figs.slice(0, vis.length ? Math.max(0, 5 - vis.length) : 4);
        const files = [pdfLink, downloadLinks, githubLink, externalDemo].join('');
        const tabs = [
            ['overview', L2('Overview', 'Présentation'), true],
            ['steps', L2('Steps', 'Étapes'), steps.length],
            ['images', L2('Images', 'Images'), figs.length],
            ['files', L2('Files', 'Fichiers'), files.trim()]
        ].filter(x => x[2]);
        const icons = ['bx-target-lock', 'bx-user', 'bx-trophy'];
        const info = overview.map(([label, value], i) => `<div class="pt-block"><h3><i class='bx ${icons[i] || 'bx-info-circle'}'></i> ${label}</h3><p>${escapeHTML(value)}</p></div>`).join('')
            || `<div class="pt-block"><h3>${t.overview[lang]}</h3><p>${escapeHTML(p.summary[lang])}</p></div>`;

        root.innerHTML = `
            <section class="pt">
                <div class="container">
                  <article class="pt-frame">
                    <div class="pt-top">
                    <p class="pt-kicker"><span class="pt-chip pt-chip-cat"><i class='bx ${cat.icon}'></i> ${escapeHTML(cat[lang])}</span><span class="pt-chip"><i class='bx bx-calendar'></i> ${escapeHTML(p.year)}</span><span class="pt-ctx">${escapeHTML(p.context[lang])}</span></p>
                    <nav class="pt-pager" aria-label="${L2('Projects', 'Projets')}">
                        <a href="project.html?id=${encodeURIComponent(prev.id)}" aria-label="${t.prev[lang]}" title="${escapeHTML(prev.title[lang])}">‹</a>
                        <span>${index + 1} / ${projects.length}</span>
                        <a href="project.html?id=${encodeURIComponent(next.id)}" aria-label="${t.next[lang]}" title="${escapeHTML(next.title[lang])}">›</a>
                    </nav>
                    </div>
                    <h1>${escapeHTML(p.title[lang])}</h1>

                    <div class="pt-tabs" role="tablist" aria-label="${escapeHTML(p.title[lang])}">
                        ${tabs.map(([id, label], i) => `<button type="button" role="tab" id="tab-${id}" aria-controls="panel-${id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-tab="${id}">${label}${id === 'steps' ? ` <span>${steps.length}</span>` : id === 'images' ? ` <span>${figs.length}</span>` : ''}</button>`).join('')}
                    </div>

                    <section class="pt-panel" role="tabpanel" id="panel-overview" aria-labelledby="tab-overview">
                        <div class="pt-view">
                            <div class="pt-media-col">
                                ${mainMedia ? `<div class="pt-media${vis.length ? ' is-sv' : ''}" id="pt-media">${mainMedia}</div><button type="button" class="pt-full" data-full aria-label="${L2('Full screen', 'Plein écran')}" title="${L2('Full screen', 'Plein écran')}">⤢</button>` : ''}
                                ${thumbs.length || vis.length > 1 ? `<div class="pt-thumbs">${vis.map((v, i) => `<button type="button" class="pt-vthumb${i === 0 ? ' on' : ''}" data-media="v${i}"><i class='bx ${v.icon}' aria-hidden="true"></i><span>${escapeHTML(v.label)}</span></button>`).join('')}${p.video ? `<button type="button" class="on" data-media="video" aria-label="${t.video[lang]}"><span class="pt-play" aria-hidden="true">▶</span></button>` : ''}${thumbs.map((f, i) => `<button type="button" data-media="${i}" aria-label="${escapeHTML(f.cap || String(i + 1))}"><img src="${escapeHTML(f.src)}" alt="" loading="lazy"></button>`).join('')}${figs.length > thumbs.length ? `<button type="button" class="pt-more" data-tab-go="images">+${figs.length - thumbs.length}</button>` : ''}</div>` : ''}
            </div>
                            <div class="pt-info">
                                ${info}
                                ${actions ? `<div class="pt-actions">${actions}</div>` : ''}
                                <ul class="pt-tags">${skills.map(s => `<li>${escapeHTML(s)}</li>`).join('')}</ul>
                            </div>
                        </div>
                    </section>

                    <section class="pt-panel" role="tabpanel" id="panel-steps" aria-labelledby="tab-steps" hidden>
                        <ol class="pt-steps">${steps.map((s, i) => `<li><span class="pt-n">${String(i + 1).padStart(2, '0')}</span><div>${s.title ? `<h3>${escapeHTML(s.title)}</h3>` : ''}<p>${escapeHTML(s.text)}</p></div></li>`).join('')}</ol>
                        ${p.results?.[lang] && brief?.outcome?.[lang] ? `<div class="pt-result"><h3>${t.results[lang]}</h3><p>${escapeHTML(p.results[lang])}</p></div>` : ''}
                    </section>

                    <section class="pt-panel" role="tabpanel" id="panel-images" aria-labelledby="tab-images" hidden>
                        <div class="gallery pt-gallery">${figs.map(f => `<figure><a href="${escapeHTML(f.src)}" target="_blank" rel="noopener"><img src="${escapeHTML(f.src)}" alt="${escapeHTML(f.cap)}" loading="lazy"></a>${f.cap ? `<figcaption>${escapeHTML(f.cap)}</figcaption>` : ''}</figure>`).join('')}</div>
                    </section>

                    <section class="pt-panel" role="tabpanel" id="panel-files" aria-labelledby="tab-files" hidden>
                        <div class="pt-files">${files}</div>
                    </section>

                  </article>

                    <div class="project-cta card">
                        <p>${t.contact[lang]}</p>
                        <a href="index.html#contact" class="btn btn-primary"><i class='bx bx-send'></i> ${t.contactBtn[lang]}</a>
                    </div>

                    <nav class="project-nav">
                        <a href="project.html?id=${encodeURIComponent(prev.id)}">
                            <small><i class='bx bx-left-arrow-alt'></i> ${t.prev[lang]}</small>
                            <span>${escapeHTML(prev.title[lang])}</span>
                        </a>
                        <a href="project.html?id=${encodeURIComponent(next.id)}" class="next">
                            <small>${t.next[lang]} <i class='bx bx-right-arrow-alt'></i></small>
                            <span>${escapeHTML(next.title[lang])}</span>
                        </a>
                    </nav>
                </div>
            </section>`;
        mediaSrc = { video: p.video ? mainMedia : '', figs, vis: vis.map(visHTML) };
        if (vis.length) systemVisuals.mount(p.id, root.querySelector('#pt-media'));
        const want = (location.hash || '').slice(1);
        if (tabs.some(x => x[0] === want)) showTab(want, false);
    }

    /* tabs */
    let mediaSrc = { video: '', figs: [], vis: [] };
    function showTab(id, focus) {
        const btns = [...root.querySelectorAll('.pt-tabs [role="tab"]')];
        btns.forEach(b => {
            const on = b.dataset.tab === id;
            b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1;
            if (on && focus) b.focus();
        });
        root.querySelectorAll('.pt-panel').forEach(pn => { pn.hidden = pn.id !== 'panel-' + id; });
        root.querySelectorAll('.pt-panel video').forEach(v => { if (id !== 'overview') v.pause(); });
        history.replaceState(null, '', id === 'overview' ? location.pathname + location.search : '#' + id);
    }
    root.addEventListener('click', e => {
        const tab = e.target.closest('[data-tab]');
        if (tab) { showTab(tab.dataset.tab, false); return; }
        const go = e.target.closest('[data-tab-go]');
        if (go) { showTab(go.dataset.tabGo, true); return; }
        if (e.target.closest('[data-full]')) {
            const box = root.querySelector('#pt-media');
            if (document.fullscreenElement) document.exitFullscreen();
            else if (box && box.requestFullscreen) box.requestFullscreen().catch(() => {});
            return;
        }
        const th = e.target.closest('[data-media]');
        if (th) {
            const box = root.querySelector('#pt-media'); if (!box) return;
            const k = th.dataset.media;
            box.querySelectorAll('video').forEach(v => v.pause());
            box.classList.toggle('is-sv', k[0] === 'v' && k !== 'video');
            if (k === 'video') box.innerHTML = mediaSrc.video;
            else if (k[0] === 'v') { box.innerHTML = mediaSrc.vis[+k.slice(1)]; systemVisuals.mount(projects[index].id, box); }
            else { const f = mediaSrc.figs[+k]; box.innerHTML = `<img src="${escapeHTML(f.src)}" alt="${escapeHTML(f.cap)}" class="fit-contain">${f.cap ? `<span class="pt-cap">${escapeHTML(f.cap)}</span>` : ''}`; }
            root.querySelectorAll('.pt-thumbs button').forEach(b => b.classList.toggle('on', b === th));
        }
    });
    root.addEventListener('keydown', e => {
        const tab = e.target.closest('[role="tab"]'); if (!tab) return;
        const btns = [...root.querySelectorAll('.pt-tabs [role="tab"]')], i = btns.indexOf(tab);
        const j = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? btns.length - 1 : null;
        if (j === null) return;
        e.preventDefault(); showTab(btns[(j + btns.length) % btns.length].dataset.tab, true);
    });

    /* lightbox: click a figure to see it large, arrows / Esc to navigate */
    let box = null, shown = 0;
    function showFigure(i) {
        const links = [...document.querySelectorAll('.gallery figure a')];
        if (!links.length) return;
        shown = (i + links.length) % links.length;
        const img = links[shown].querySelector('img');
        const cap = links[shown].parentElement.querySelector('figcaption');
        if (!box) {
            box = document.createElement('div');
            box.className = 'lightbox';
            box.innerHTML = `<button class="lb-close" aria-label="Close"><i class='bx bx-x'></i></button>
                <button class="lb-nav lb-prev" aria-label="Previous"><i class='bx bx-chevron-left'></i></button>
                <figure><img alt=""><figcaption></figcaption></figure>
                <button class="lb-nav lb-next" aria-label="Next"><i class='bx bx-chevron-right'></i></button>`;
            box.addEventListener('click', e => {
                if (e.target.closest('.lb-prev')) showFigure(shown - 1);
                else if (e.target.closest('.lb-next')) showFigure(shown + 1);
                else if (!e.target.closest('img')) closeFigure();
            });
            document.body.appendChild(box);
        }
        box.querySelector('img').src = links[shown].getAttribute('href');
        box.querySelector('img').alt = img.alt;
        box.querySelector('figcaption').textContent = cap ? cap.textContent : '';
        box.classList.add('open');
    }
    function closeFigure() { if (box) box.classList.remove('open'); }
    document.addEventListener('click', e => {
        const a = e.target.closest('.gallery figure a');
        if (!a) return;
        e.preventDefault();
        showFigure([...document.querySelectorAll('.gallery figure a')].indexOf(a));
    });
    document.addEventListener('keydown', e => {
        if (!box || !box.classList.contains('open')) return;
        if (e.key === 'Escape') closeFigure();
        if (e.key === 'ArrowLeft') showFigure(shown - 1);
        if (e.key === 'ArrowRight') showFigure(shown + 1);
    });

    render();
    document.addEventListener('langchange', render);
})();
