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
        walk: { en: 'Follow the work, step by step', fr: 'Suivre le travail, étape par étape' },
        walkLead: { en: 'Each step is something Aya did. If one is not clear, tap “Explain”.', fr: 'Chaque étape est quelque chose qu’Aya a réalisé. Si une étape n’est pas claire, touchez « Expliquer ».' },
        explain: { en: 'Explain', fr: 'Expliquer' },
        explainQ: { en: 'Explain this step of the project in simple words: ', fr: 'Explique avec des mots simples cette étape du projet : ' },
        factSteps: { en: 'steps', fr: 'étapes' }, factTools: { en: 'tools & topics', fr: 'outils & thèmes' },
        factFiles: { en: 'files to download', fr: 'fichiers à télécharger' }, factPics: { en: 'figures', fr: 'figures' }, factVideo: { en: 'video', fr: 'vidéo' },
        related: { en: 'Same tools, other projects', fr: 'Mêmes outils, autres projets' }, via: { en: 'shared:', fr: 'en commun :' },
        onPage: { en: 'On this page', fr: 'Sur cette page' },
        stepLbl: { en: 'STEP', fr: 'ÉTAPE' }, figLbl: { en: 'FIG.', fr: 'FIG.' }, progress: { en: 'PROGRESS', fr: 'PROGRESSION' },
        stDone: { en: 'DONE', fr: 'FAIT' }, stNow: { en: 'IN VIEW', fr: 'EN COURS' }, stNext: { en: 'NEXT', fr: 'À VENIR' },
        zoom: { en: 'Enlarge', fr: 'Agrandir' },
        notFound: { en: 'Project not found', fr: 'Projet introuvable' },
        notFoundText: { en: 'This project doesn’t exist or has moved.', fr: 'Ce projet n’existe pas ou a été déplacé.' }
    };

    let galleryItems = [];
    /* the steps: the phases of the brief when there are some, else the "what I did" list */
    function phases2(brief, p, lang) {
        if (brief && brief.phases && brief.phases.length) return brief.phases.map(ph => ({ title: ph.title[lang], text: ph.description[lang] }));
        return (p.highlights[lang] || []).map(h => ({ title: '', text: h }));
    }

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

        const SOFT = ['travail en binôme', 'travail en équipe', 'teamwork', 'pair work', 'team work'];
        const realTags = (p.tags || []).filter(x => !SOFT.includes(x.toLowerCase()));
        const stepItems = phases2(brief, p, lang);
        const toolsIn = s => realTags.filter(x => s.toLowerCase().includes(x.toLowerCase())).slice(0, 4);
        const num = txt => escapeHTML(txt).replace(/(\d+(?:[.,]\d+)?\s?(?:%|°|mm|ms|Hz|kg|V|A|W)?)/g, m => `<b class="num">${m}</b>`);
        const figs = (p.gallery || []).map(item => ({ src: typeof item === 'string' ? item : item.src, cap: (item.caption && item.caption[lang]) || '' }));
        galleryItems = figs;
        const fileCount = (p.pdf ? 1 : 0) + (p.downloads || []).length;
        const facts = [[stepItems.length, t.factSteps[lang]], [realTags.length, t.factTools[lang]],
            p.video ? ['▶', t.factVideo[lang]] : (figs.length ? [figs.length, t.factPics[lang]] : null), fileCount ? [fileCount, t.factFiles[lang]] : null].filter(Boolean);
        const mine = new Set(realTags.map(x => x.toLowerCase()));
        const rel = projects.filter(o => o.id !== p.id).map(o => ({ o, via: (o.tags || []).filter(x => mine.has(x.toLowerCase()) && !SOFT.includes(x.toLowerCase())) }))
            .filter(r => r.via.length).sort((a, b) => b.via.length - a.via.length).slice(0, 4);
        const icons = ['bx-target-lock', 'bx-user-circle', 'bx-trophy'];
        const nav = [['cs-overview', t.overview[lang], overview.length], ['cs-walk', t.process[lang], stepItems.length], ['cs-gallery', t.gallery[lang], figs.length || p.video],
            ['project-resources', t.resources[lang], resources], ['project-skills', t.tools[lang], 1]].filter(x => x[2]);
        const stage = figs.length ? `
            <section class="cs-gallery" id="cs-gallery" aria-label="${t.gallery[lang]}">
                <h2>${t.gallery[lang]}</h2>
                <div class="cs-stage"><button type="button" class="cs-main" data-open="0" aria-label="${t.zoom[lang]}"><img src="${escapeHTML(figs[0].src)}" alt="${escapeHTML(figs[0].cap)}"><span class="cs-zoom"><i class='bx bx-expand-alt'></i> ${t.zoom[lang]}</span></button>
                    <p class="cs-cap"><b>${t.figLbl[lang]} 01</b> <span>${escapeHTML(figs[0].cap)}</span></p></div>
                ${figs.length > 1 ? `<div class="cs-thumbs">${figs.map((f, i) => `<button type="button" class="${i ? '' : 'on'}" data-pick="${i}" aria-label="${i + 1} / ${figs.length}"><img src="${escapeHTML(f.src)}" alt="" loading="lazy"></button>`).join('')}</div>` : ''}
            </section>` : '';
        const relHtml = rel.length ? `<section class="cs-related"><h2>${t.related[lang]}</h2><div class="cs-rel-grid">${rel.map(r => `<a href="project.html?id=${encodeURIComponent(r.o.id)}"><strong>${escapeHTML(r.o.title[lang])}</strong><span>${t.via[lang]} ${escapeHTML(r.via.slice(0, 3).join(' · '))}</span></a>`).join('')}</div></section>` : '';
        const walkHtml = stepItems.length ? `
            <section class="cs-walk" id="cs-walk" aria-labelledby="cs-walk-title">
                <div class="cs-walk-head"><h2 id="cs-walk-title">${t.walk[lang]}</h2><p>${t.walkLead[lang]}</p></div>
                <div class="cs-walk-body">
                    <aside class="cs-rail" aria-hidden="true"><span class="cs-lbl">${t.progress[lang]}</span><span class="cs-count"><b id="cs-cur">1</b> / ${stepItems.length}</span><span class="cs-bar"><i id="cs-fill"></i></span></aside>
                    <ol class="cs-steps">${stepItems.map((s, i) => `
                        <li class="cs-step" data-i="${i}"><span class="cs-num">${i + 1}</span>
                            <div class="cs-card">
                                <p class="cs-meta"><span>${t.stepLbl[lang]} ${String(i + 1).padStart(2, '0')} / ${String(stepItems.length).padStart(2, '0')}</span><b class="cs-state" data-done="${t.stDone[lang]}" data-now="${t.stNow[lang]}" data-next="${t.stNext[lang]}"></b></p>
                                ${s.title ? `<h3>${escapeHTML(s.title)}</h3>` : ''}
                                <p>${num(s.text)}</p>
                                ${toolsIn((s.title || '') + ' ' + s.text).length ? `<ul class="cs-tools">${toolsIn((s.title || '') + ' ' + s.text).map(x => `<li>${escapeHTML(x)}</li>`).join('')}</ul>` : ''}
                                <button type="button" class="cs-explain" data-q="${escapeHTML(t.explainQ[lang] + (s.title ? s.title + ' - ' : '') + s.text)}"><i class='bx bx-bot'></i> ${t.explain[lang]}</button>
                            </div>
                        </li>`).join('')}</ol>
                </div>
            </section>` : '';

        root.innerHTML = `
            <section class="project-hero">
                <div class="container">
                    <div class="project-hero-grid ${cover ? 'with-cover' : ''}">
                        <div>
                            <p class="project-context">${escapeHTML(p.context[lang])} · ${escapeHTML(p.year)}</p>
                            <h1>${escapeHTML(p.title[lang])}</h1>
                            <p class="project-lead">${escapeHTML(brief?.intro?.[lang] || p.summary[lang])}</p>
                            ${actions ? `<div class="hero-buttons">${actions}</div>` : ''}
                        </div>
                        ${cover}
                    </div>
                    <ul class="cs-facts">${facts.map((f, i) => `<li><em>${String(i + 1).padStart(2, '0')}</em><strong>${String(f[0]).padStart(2, '0')}</strong><span>${escapeHTML(f[1])}</span></li>`).join('')}</ul>
                </div>
            </section>
            <nav class="cs-nav" aria-label="${t.onPage[lang]}"><div class="container">${nav.map(n => `<a href="#${n[0]}">${escapeHTML(n[1])}</a>`).join('')}</div></nav>

            <section class="project-content">
                <div class="container">
                    ${overview.length ? `<section class="cs-overview" id="cs-overview" aria-label="${t.overview[lang]}">
                        ${overview.map(([label, value], i) => `<article><span class="cs-ico"><i class='bx ${icons[i] || 'bx-info-circle'}'></i></span><h2><small>${String(i + 1).padStart(2, '0')} //</small> ${label}</h2><p>${num(value)}</p></article>`).join('')}
                    </section>` : ''}

                    ${walkHtml}

                    ${stage}
                    ${video}
                    ${details}

                    ${resources ? `<section class="project-resources" id="project-resources">
                        <h2>${t.resources[lang]}</h2>
                        <div class="project-resource-links">${resources}</div>
                    </section>` : ''}

                    ${relHtml}

                    <section class="project-skills" id="project-skills">
                        <h2>${t.tools[lang]}</h2>
                        <ul class="tags">${skills.map(skill => `<li>${escapeHTML(skill)}</li>`).join('')}</ul>
                    </section>

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
    }

    /* lightbox: enlarge a figure, arrows / Esc to navigate */
    let box = null, shown = 0;
    function showFigure(i) {
        if (!galleryItems.length) return;
        shown = (i + galleryItems.length) % galleryItems.length;
        const f = galleryItems[shown];
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
        box.querySelector('img').src = f.src;
        box.querySelector('img').alt = f.cap;
        box.querySelector('figcaption').textContent = f.cap;
        box.classList.add('open');
    }
    function closeFigure() { if (box) box.classList.remove('open'); }
    document.addEventListener('keydown', e => {
        if (!box || !box.classList.contains('open')) return;
        if (e.key === 'Escape') closeFigure();
        if (e.key === 'ArrowLeft') showFigure(shown - 1);
        if (e.key === 'ArrowRight') showFigure(shown + 1);
    });

    /* gallery stage, "Explain" buttons */
    root.addEventListener('click', e => {
        const pick = e.target.closest('[data-pick]');
        if (pick) {
            const i = +pick.dataset.pick, f = galleryItems[i], main = root.querySelector('.cs-main');
            main.dataset.open = i; main.querySelector('img').src = f.src; main.querySelector('img').alt = f.cap;
            root.querySelector('.cs-cap').innerHTML = `<b>${t.figLbl[currentLang()]} ${String(i + 1).padStart(2, '0')}</b> <span></span>`; root.querySelector('.cs-cap span').textContent = f.cap;
            root.querySelectorAll('.cs-thumbs button').forEach(b => b.classList.toggle('on', b === pick));
            return;
        }
        const open = e.target.closest('[data-open]');
        if (open) { showFigure(+open.dataset.open); return; }
        const ex = e.target.closest('.cs-explain');
        if (ex) document.dispatchEvent(new CustomEvent('portfolio-chat:ask', { detail: ex.dataset.q }));
    });

    /* the walk-through: the current step lights up, the line fills while scrolling; the section bar follows the page */
    let io = null, scrollFn = null, bound = false;
    function setupMotion() {
        if (io) io.disconnect();
        const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const steps = [...root.querySelectorAll('.cs-step')], list = root.querySelector('.cs-steps'), fill = root.querySelector('#cs-fill'), cur = root.querySelector('#cs-cur');
        const links = [...root.querySelectorAll('.cs-nav a')], targets = links.map(a => root.querySelector(a.getAttribute('href')));
        io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -6% 0px' });
        root.querySelectorAll('.cs-step, .cs-overview article, .cs-related, .cs-gallery').forEach(el => { if (reduce) el.classList.add('in'); else io.observe(el); });
        scrollFn = () => {
            const mid = innerHeight * 0.5; let a = 0;
            steps.forEach((s, i) => { const r = s.getBoundingClientRect(); if (r.top < mid) a = i; s.classList.toggle('done', r.top + r.height * 0.35 < mid); });
            steps.forEach((s, i) => { s.classList.toggle('active', i === a); const st = s.querySelector('.cs-state'); if (st) { const k = i < a ? 'done' : i === a ? 'now' : 'next'; st.textContent = st.dataset[k]; st.dataset.k = k; } });
            if (cur) cur.textContent = a + 1;
            if (list && fill) { const lr = list.getBoundingClientRect(); fill.style.height = Math.max(0, Math.min(100, ((mid - lr.top) / Math.max(1, lr.height)) * 100)) + '%'; }
            let on = 0; targets.forEach((t, i) => { if (t && t.getBoundingClientRect().top < innerHeight * 0.4) on = i; });
            links.forEach((l, i) => l.classList.toggle('on', i === on));
        };
        if (!bound) { bound = true; let tick = 0; addEventListener('scroll', () => { if (!tick) tick = requestAnimationFrame(() => { tick = 0; scrollFn && scrollFn(); }); }, { passive: true }); }
        scrollFn();
    }

    render();
    setupMotion();
    document.addEventListener('langchange', () => { render(); setupMotion(); });
})();
