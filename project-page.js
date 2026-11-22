/* Builds a project's own page (project.html?id=...) from projects.js.
   You don't need to edit this file: change the text in projects.js instead. */

(function () {
    const root = document.querySelector('#project-root');
    const id = new URLSearchParams(location.search).get('id');
    const index = projects.findIndex(p => p.id === id);

    const t = {
        back: { en: 'All projects', fr: 'Tous les projets' },
        ask: { en: 'Explain this project simply', fr: 'Expliquer ce projet simplement' },
        walk: { en: 'Follow the work, step by step', fr: 'Suivre le travail, étape par étape' },
        walkLead: { en: 'Each step is something Aya did. Tap “Explain” if a step is not clear: the assistant puts it in simple words.', fr: 'Chaque étape est quelque chose qu’Aya a réalisé. Touchez « Expliquer » si une étape n’est pas claire : l’assistante la reformule avec des mots simples.' },
        step: { en: 'Step', fr: 'Étape' },
        explain: { en: 'Explain', fr: 'Expliquer' },
        factSteps: { en: 'steps', fr: 'étapes' },
        factTools: { en: 'tools & topics', fr: 'outils & thèmes' },
        factFiles: { en: 'files to download', fr: 'fichiers à télécharger' },
        factPics: { en: 'figures', fr: 'figures' },
        factVideo: { en: 'video', fr: 'vidéo' },
        related: { en: 'Same tools, other projects', fr: 'Mêmes outils, autres projets' },
        via: { en: 'shared:', fr: 'en commun :' },
        overview: { en: 'Overview', fr: 'Présentation' },
        did: { en: 'What I did', fr: 'Ce que j’ai réalisé' },
        results: { en: 'Results', fr: 'Résultats' },
        gallery: { en: 'Gallery', fr: 'Galerie' },
        details: { en: 'Details', fr: 'Détails' },
        category: { en: 'Category', fr: 'Catégorie' },
        year: { en: 'Year', fr: 'Année' },
        context: { en: 'Context', fr: 'Contexte' },
        tools: { en: 'Tools & skills', fr: 'Outils & compétences' },
        github: { en: 'View code on GitHub', fr: 'Voir le code sur GitHub' },
        soon: { en: 'Code coming soon on GitHub', fr: 'Code bientôt en ligne sur GitHub' },
        pdf: { en: 'Download the report (PDF)', fr: 'Télécharger le compte rendu (PDF)' },
        demo: { en: 'Watch the demo', fr: 'Voir la démo' },
        prev: { en: 'Previous project', fr: 'Projet précédent' },
        next: { en: 'Next project', fr: 'Projet suivant' },
        contact: { en: 'Interested in this project? Let’s talk.', fr: 'Ce projet vous intéresse ? Parlons-en.' },
        contactBtn: { en: 'Contact me', fr: 'Me contacter' },
        notFound: { en: 'Project not found', fr: 'Projet introuvable' },
        notFoundText: { en: 'This project doesn’t exist or has moved.', fr: 'Ce projet n’existe pas ou a été déplacé.' }
    };

    function render() {
        const lang = currentLang();

        if (index === -1) {
            document.title = t.notFound[lang] + ' | Aya Briksine';
            root.innerHTML = `
                <section class="project-hero">
                    <div class="container">
                        <a href="index.html#projects" class="back-link"><i class='bx bx-left-arrow-alt'></i> ${t.back[lang]}</a>
                        <h1>${t.notFound[lang]}</h1>
                        <p class="project-lead">${t.notFoundText[lang]}</p>
                    </div>
                </section>`;
            return;
        }

        const p = projects[index];
        const cat = projectCategories[p.category];
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
        const demoLink = p.demo
            ? `<a href="${escapeHTML(p.demo)}" target="_blank" rel="noopener" class="btn btn-outline"><i class='bx bx-play-circle'></i> ${(p.demoLabel || t.demo)[lang]}</a>`
            : '';
        const results = p.results && p.results[lang]
            ? `<aside class="results-callout"><h2><i class='bx bx-trophy'></i> ${t.results[lang]}</h2><p>${p.results[lang].split(/(\d+(?:[.,]\d+)?\s?(?:%|°|mm|ms|Hz|kg)?)/).map((x, i) => i % 2 ? `<b class="num">${escapeHTML(x)}</b>` : escapeHTML(x)).join('')}</p></aside>`
            : '';
        const gallery = p.gallery && p.gallery.length
            ? `<section class="project-gallery"><h2>${t.gallery[lang]}</h2><div class="gallery">${p.gallery.map(item => {
                const src = typeof item === 'string' ? item : item.src;
                const cap = item.caption && item.caption[lang] ? item.caption[lang] : '';
                return `<figure><a href="${escapeHTML(src)}" target="_blank" rel="noopener"><img src="${escapeHTML(src)}" alt="${escapeHTML(cap)}" loading="lazy"></a>${cap ? `<figcaption>${escapeHTML(cap)}</figcaption>` : ''}</figure>`;
            }).join('')}</div></section>`
            : '';

        const SOFT = ['travail en binôme', 'travail en équipe', 'teamwork', 'pair work', 'team work'];
        const realTags = (p.tags || []).filter(x => !SOFT.includes(x.toLowerCase()));
        const steps = p.highlights[lang] || [];
        const stepTools = s => realTags.filter(x => s.toLowerCase().includes(x.toLowerCase())).slice(0, 4);
        const fileCount = (p.pdf ? 1 : 0) + (p.downloads || []).length;
        const facts = [
            [steps.length, t.factSteps[lang]], [realTags.length, t.factTools[lang]],
            p.video ? ['▶', t.factVideo[lang]] : (p.gallery && p.gallery.length ? [p.gallery.length, t.factPics[lang]] : null),
            fileCount ? [fileCount, t.factFiles[lang]] : null
        ].filter(Boolean);
        const factsHtml = `<ul class="proj-facts">${facts.map(f => `<li><strong>${f[0]}</strong><span>${escapeHTML(f[1])}</span></li>`).join('')}</ul>`;
        const mine = new Set(realTags.map(x => x.toLowerCase()));
        const relatedList = projects.filter(o => o.id !== p.id).map(o => ({ o, via: (o.tags || []).filter(x => mine.has(x.toLowerCase()) && !SOFT.includes(x.toLowerCase())) }))
            .filter(r => r.via.length).sort((a, b) => b.via.length - a.via.length).slice(0, 4);
        const relatedHtml = relatedList.length ? `<section class="proj-related"><h2>${t.related[lang]}</h2><div class="rel-grid">${relatedList.map(r => `<a href="project.html?id=${encodeURIComponent(r.o.id)}"><strong>${escapeHTML(r.o.title[lang])}</strong><span>${t.via[lang]} ${escapeHTML(r.via.slice(0, 3).join(' · '))}</span></a>`).join('')}</div></section>` : '';
        const hl = txt => escapeHTML(txt).replace(/(\d+(?:[.,]\d+)?\s?(?:%|°|mm|ms|s|Hz|kg|V|A|W|rad)?)/g, m => /\d/.test(m) ? `<b class="num">${m}</b>` : m);
        const walkHtml = steps.length ? `
            <section class="walk" aria-labelledby="walk-title">
                <div class="walk-head"><h2 id="walk-title">${t.walk[lang]}</h2><p>${t.walkLead[lang]}</p></div>
                <div class="walk-body">
                    <aside class="walk-rail" aria-hidden="true">
                        <span class="walk-count"><b id="walk-cur">1</b> / ${steps.length}</span>
                        <span class="walk-bar"><i id="walk-fill"></i></span>
                        <span class="walk-dots">${steps.map((_, i) => `<button type="button" tabindex="-1" data-go="${i}">${i + 1}</button>`).join('')}</span>
                    </aside>
                    <ol class="walk-list">${steps.map((s, i) => `
                        <li class="walk-step" data-i="${i}">
                            <span class="walk-num">${i + 1}</span>
                            <div class="walk-card">
                                <p>${hl(s)}</p>
                                ${stepTools(s).length ? `<ul class="walk-tools">${stepTools(s).map(x => `<li>${escapeHTML(x)}</li>`).join('')}</ul>` : ''}
                                <button type="button" class="walk-explain" data-ask-project="${escapeHTML(p.id)}" data-ask-question="${escapeHTML((lang === 'fr' ? 'Explique avec des mots simples cette étape du projet : ' : 'Explain this step of the project in simple words: ') + s)}"><i class='bx bx-bot'></i> ${t.explain[lang]}</button>
                            </div>
                        </li>`).join('')}</ol>
                </div>
            </section>` : '';

        root.innerHTML = `
            <section class="project-hero">
                <div class="container">
                    <a href="index.html#projects" class="back-link"><i class='bx bx-left-arrow-alt'></i> ${t.back[lang]}</a>
                    <p class="project-cat-pill cat-${p.category}"><i class='bx ${cat.icon}'></i> ${escapeHTML(cat[lang])}</p>
                    <h1>${escapeHTML(p.title[lang])}</h1>
                    <p class="project-lead">${escapeHTML(p.summary[lang])}</p>
                    <ul class="project-meta-chips">
                        <li><i class='bx bx-calendar'></i> ${escapeHTML(p.year)}</li>
                        <li><i class='bx bx-buildings'></i> ${escapeHTML(p.context[lang])}</li>
                    </ul>
                    <div class="hero-buttons">${pdfLink}${downloadLinks}${githubLink}${demoLink}<button type="button" class="btn btn-outline" data-ask-project="${escapeHTML(p.id)}"><i class='bx bx-bot'></i> ${t.ask[lang]}</button></div>
                </div>
            </section>

            <section class="project-content">
                <div class="container">
                    ${p.video
                        ? `<div class="project-video"><video controls playsinline preload="metadata" poster="${escapeHTML(p.image || '')}" src="${escapeHTML(p.video)}"></video></div>`
                        : p.image ? `<div class="project-banner project-visual cat-${p.category} has-image fit-${p.imageFit || 'cover'}"><img src="${escapeHTML(p.image)}" alt="${escapeHTML(p.title[lang])}"></div>`
                        : p.art ? `<div class="project-banner project-visual cat-${p.category}"><span class="cover-art art-${escapeHTML(p.art)}"></span></div>` : ''}

                    ${factsHtml}

                    <div class="project-layout">
                        <article class="project-main">
                            ${walkHtml}
                            ${results}
                        </article>

                        <aside class="card project-side">
                            <h2>${t.details[lang]}</h2>
                            <dl>
                                <dt>${t.category[lang]}</dt><dd>${escapeHTML(cat[lang])}</dd>
                                <dt>${t.year[lang]}</dt><dd>${escapeHTML(p.year)}</dd>
                                <dt>${t.context[lang]}</dt><dd>${escapeHTML(p.context[lang])}</dd>
                            </dl>
                            <h2>${t.tools[lang]}</h2>
                            <ul class="tags">${p.tags.map(tag => `<li>${escapeHTML(tag)}</li>`).join('')}</ul>
                        </aside>
                    </div>

                    ${gallery}

                    ${relatedHtml}

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

    /* the walk-through: the current step lights up, the line fills while scrolling */
    let walkIO = null;
    function setupWalk() {
        if (walkIO) walkIO.disconnect();
        const list = document.querySelector('.walk-list'); if (!list) return;
        const stepsEl = [...list.querySelectorAll('.walk-step')], fill = document.getElementById('walk-fill'), cur = document.getElementById('walk-cur');
        const dots = [...document.querySelectorAll('.walk-dots button')];
        const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const update = () => {
            const mid = innerHeight * 0.5; let a = 0;
            stepsEl.forEach((s, i) => { const r = s.getBoundingClientRect(); if (r.top < mid) a = i; s.classList.toggle('done', r.top + r.height * 0.35 < mid); });
            stepsEl.forEach((s, i) => s.classList.toggle('active', i === a));
            if (cur) cur.textContent = a + 1;
            dots.forEach((d, i) => d.classList.toggle('on', i === a));
            const lr = list.getBoundingClientRect();
            if (fill) fill.style.height = Math.max(0, Math.min(100, ((mid - lr.top) / Math.max(1, lr.height)) * 100)) + '%';
        };
        walkIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); walkIO.unobserve(e.target); } }), { rootMargin: '0px 0px -6% 0px' });
        stepsEl.forEach(s => reduce ? s.classList.add('in') : walkIO.observe(s));
        document.querySelector('.walk-dots').addEventListener('click', e => { const b = e.target.closest('button[data-go]'); if (b) stepsEl[+b.dataset.go].scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }); });
        if (!setupWalk.bound) { setupWalk.bound = true; addEventListener('scroll', () => { if (!setupWalk.t) setupWalk.t = requestAnimationFrame(() => { setupWalk.t = 0; setupWalk.fn && setupWalk.fn(); }); }, { passive: true }); }
        setupWalk.fn = update; update();
    }

    render();
    setupWalk();
    document.addEventListener('langchange', () => { render(); setupWalk(); });
})();
