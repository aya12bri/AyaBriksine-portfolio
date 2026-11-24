/* Builds a project's own page (project.html?id=...) from projects.js.
   You don't need to edit this file: change the text in projects.js instead. */

(function () {
    const root = document.querySelector('#project-root');
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
                return `<figure><a href="${escapeHTML(src)}" target="_blank" rel="noopener"><img src="${escapeHTML(src)}" alt="${escapeHTML(cap)}" loading="lazy"></a>${cap ? `<figcaption>${escapeHTML(cap)}</figcaption>` : ''}</figure>`;
            }).join('')}</div></section>`
            : '';

        root.innerHTML = `
            <section class="project-hero">
                <div class="container">
                    <a href="index.html#projects" class="back-link"><i class='bx bx-left-arrow-alt'></i> ${t.back[lang]}</a>
                    <div class="project-hero-grid ${cover ? 'with-cover' : ''}">
                        <div>
                            <p class="project-context"><span class="cat-${p.category}">${escapeHTML(cat[lang])}</span> · ${escapeHTML(p.context[lang])} · ${escapeHTML(p.year)}</p>
                            <h1>${escapeHTML(p.title[lang])}</h1>
                            <p class="project-lead">${escapeHTML(brief?.intro?.[lang] || p.summary[lang])}</p>
                            ${actions ? `<div class="hero-buttons">${actions}</div>` : ''}
                            ${resources ? `<div class="project-resources">${resources}</div>` : ''}
                        </div>
                        ${cover}
                    </div>
                </div>
            </section>

            <section class="project-content">
                <div class="container">
                    ${overview.length ? `<section class="project-overview" aria-label="${t.overview[lang]}">
                        ${overview.map(([label, value]) => `<div><h2>${label}</h2><p>${escapeHTML(value)}</p></div>`).join('')}
                    </section>` : ''}

                    <section class="project-process">
                        <h2>${t.process[lang]}</h2>
                        <ol class="steps ${phases ? 'steps-phases' : ''}" role="list">${phases || highlights}</ol>
                        ${details}
                    </section>

                    ${video}
                    ${gallery}

                    ${p.tags.length ? `<section class="project-tools">
                            <h2>${t.tools[lang]}</h2>
                            <ul class="tags">${p.tags.map(tag => `<li>${escapeHTML(tag)}</li>`).join('')}</ul>
                    </section>` : ''}

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
