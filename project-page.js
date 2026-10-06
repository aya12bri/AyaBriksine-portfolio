/* Builds a project's own page (project.html?id=...) from projects.js.
   You don't need to edit this file: change the text in projects.js instead. */

(function () {
    const root = document.querySelector('#project-root');
    const id = new URLSearchParams(location.search).get('id');
    const index = projects.findIndex(p => p.id === id);

    const t = {
        back: { en: 'All projects', fr: 'Tous les projets' },
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
            ? `<a href="${escapeHTML(p.demo)}" target="_blank" rel="noopener" class="btn btn-outline"><i class='bx bx-play-circle'></i> ${t.demo[lang]}</a>`
            : '';
        const results = p.results && p.results[lang]
            ? `<aside class="results-callout"><h2><i class='bx bx-trophy'></i> ${t.results[lang]}</h2><p>${escapeHTML(p.results[lang])}</p></aside>`
            : '';
        const gallery = p.gallery && p.gallery.length
            ? `<section class="project-gallery"><h2>${t.gallery[lang]}</h2><div class="gallery">${p.gallery.map(item => {
                const src = typeof item === 'string' ? item : item.src;
                const cap = item.caption && item.caption[lang] ? item.caption[lang] : '';
                return `<figure><a href="${escapeHTML(src)}" target="_blank" rel="noopener"><img src="${escapeHTML(src)}" alt="${escapeHTML(cap)}" loading="lazy"></a>${cap ? `<figcaption>${escapeHTML(cap)}</figcaption>` : ''}</figure>`;
            }).join('')}</div></section>`
            : '';

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
                    <div class="hero-buttons">${pdfLink}${downloadLinks}${githubLink}${demoLink}</div>
                </div>
            </section>

            <section class="project-content">
                <div class="container">
                    ${p.video
                        ? `<div class="project-video"><video controls playsinline preload="metadata" poster="${escapeHTML(p.image || '')}" src="${escapeHTML(p.video)}"></video></div>`
                        : p.image ? `<div class="project-banner project-visual cat-${p.category} has-image fit-${p.imageFit || 'cover'}"><img src="${escapeHTML(p.image)}" alt="${escapeHTML(p.title[lang])}"></div>`
                        : p.art ? `<div class="project-banner project-visual cat-${p.category}"><span class="cover-art art-${escapeHTML(p.art)}"></span></div>` : ''}

                    <div class="project-layout">
                        <article class="project-main">
                            <h2>${t.did[lang]}</h2>
                            <ol class="steps">
                                ${p.highlights[lang].map(h => `<li><span>${escapeHTML(h)}</span></li>`).join('')}
                            </ol>
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

    render();
    document.addEventListener('langchange', render);
})();
