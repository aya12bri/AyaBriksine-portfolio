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

        const githubLink = p.github
            ? `<a href="${escapeHTML(p.github)}" target="_blank" rel="noopener" class="btn btn-primary"><i class='bx bxl-github'></i> ${t.github[lang]}</a>`
            : `<span class="btn btn-ghost"><i class='bx bxl-github'></i> ${t.soon[lang]}</span>`;
        const demoLink = p.demo
            ? `<a href="${escapeHTML(p.demo)}" target="_blank" rel="noopener" class="btn btn-outline"><i class='bx bx-play-circle'></i> ${t.demo[lang]}</a>`
            : '';
        const results = p.results && p.results[lang]
            ? `<h2>${t.results[lang]}</h2><p>${escapeHTML(p.results[lang])}</p>`
            : '';
        const gallery = p.gallery && p.gallery.length
            ? `<h2>${t.gallery[lang]}</h2><div class="gallery">${p.gallery.map(src =>
                `<a href="${escapeHTML(src)}" target="_blank" rel="noopener"><img src="${escapeHTML(src)}" alt="" loading="lazy"></a>`).join('')}</div>`
            : '';

        root.innerHTML = `
            <section class="project-hero">
                <div class="container">
                    <a href="index.html#projects" class="back-link"><i class='bx bx-left-arrow-alt'></i> ${t.back[lang]}</a>
                    <p class="project-cat-pill cat-${p.category}"><i class='bx ${cat.icon}'></i> ${escapeHTML(cat[lang])}</p>
                    <h1>${escapeHTML(p.title[lang])}</h1>
                    <p class="project-lead">${escapeHTML(p.summary[lang])}</p>
                    <div class="hero-buttons">${githubLink}${demoLink}</div>
                </div>
            </section>

            <section class="project-content">
                <div class="container">
                    <div class="project-banner project-visual cat-${p.category}${p.image ? ' has-image' : ''}">
                        ${p.image ? `<img src="${escapeHTML(p.image)}" alt="${escapeHTML(p.title[lang])}">` : `<i class='bx ${escapeHTML(p.icon || cat.icon)}'></i>`}
                    </div>

                    <div class="project-layout">
                        <article class="project-main">
                            <h2>${t.did[lang]}</h2>
                            <ul class="check-list">
                                ${p.highlights[lang].map(h => `<li><i class='bx bx-check-circle'></i><span>${escapeHTML(h)}</span></li>`).join('')}
                            </ul>
                            ${results}
                            ${gallery}
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

    render();
    document.addEventListener('langchange', render);
})();
