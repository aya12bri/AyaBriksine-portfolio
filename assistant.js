/* =========================================================
   Aya's assistant: a small chat that explains her projects.
   ---------------------------------------------------------
   How it works
   1. The page itself is the source of truth: the projects come from
      projects.js and the profile (experience, studies, skills...) is read
      from the page. Add a project or edit the page and the assistant knows.
   2. For each question the best matching pieces are picked here (a simple
      keyword search), and only those are sent to /api/chat (worker.js),
      where an AI writes a short answer from them.
   3. If the AI cannot be reached, the assistant still answers: it shows the
      projects that match the question.

   Other scripts can use  window.AyaAssistant.open(question, { project: 'id' })
   ========================================================= */
(function () {
    'use strict';

    const API = '/api/chat';
    const MAX_QUESTIONS = 25;                 // per visit, to keep the service free for everyone
    const TIMEOUT_MS = 20000;

    const lang = () => (typeof currentLang === 'function' ? currentLang() : (document.documentElement.lang === 'fr' ? 'fr' : 'en'));
    const L = (en, fr) => (lang() === 'fr' ? fr : en);
    const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasProjects = typeof projects !== 'undefined' && Array.isArray(projects);

    /* ---------- the page the visitor is on ---------- */
    let currentProject = null;
    (function () {
        if (!hasProjects) return;
        const id = new URLSearchParams(location.search).get('id');
        if (document.getElementById('project-root') && projects.some(p => p.id === id)) currentProject = id;
    })();
    const projectById = id => (hasProjects ? projects.find(p => p.id === id) : null);

    /* ---------- knowledge: projects + profile ---------- */
    const STOP = new Set(('a an the and or of to in on for with from by at is are was were be been it its this that these those i you he she we they me my your her his our their what which who whom how why when where do does did can could should would will about as into over under between not no yes please tell show explain give me aya project projects simple simply words word built build made make first look use used ' +
        'le la les un une des du de et ou en dans sur pour avec par au aux est sont etait etre ce cet cette ces je tu il elle nous vous ils elles mon ma mes ton ta tes son sa ses notre votre leur leurs que qui quoi quel quelle quels quelles comment pourquoi quand ou dit dis montre explique donne moi sur svp projet projets simple simples mots mot fait fais realise regarder premier').split(' '));
    // a few words that mean the same thing in the projects (English / French)
    const SYN = { drone: 'quadcopter quadricopt', quadricoptere: 'quadcopter drone', quadcopter: 'drone quadricopt', moto: 'motorcycle', motorcycle: 'moto', automate: 'plc', plc: 'automate', stage: 'internship', internship: 'stage', study: 'msc degree master bachelor diploma student university', studies: 'msc degree master bachelor diploma student university', studied: 'msc degree master bachelor diploma student university', school: 'university school student msc', university: 'university student msc', ecole: 'university school student msc', etudie: 'university school student msc', etudes: 'university school student msc', formation: 'university school student msc', diplome: 'msc degree diploma master', experience: 'experience timeline', job: 'experience', work: 'experience', travail: 'experience', cobot: 'collaboratif collaborative', robot: 'robotics robotique', robots: 'robotics robotique' };
    const strip = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    const stem = w => (w.length > 4 ? w.replace(/(ations?|ements?|ing|ed|es|s|x)$/, '') : w);
    const tokens = s => strip(s).split(/[^a-z0-9+#]+/).filter(w => w.length > 1 && !STOP.has(w)).map(stem);

    const both = o => (o ? Object.values(o).join(' ') : '');
    const list = (o, l) => (o && (o[l] || o.en) ? (o[l] || o.en) : []);
    const clip = (s, n) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s);

    function projectChunks() {
        if (!hasProjects) return [];
        const l = lang();
        return projects.map(p => {
            const cat = typeof projectCategories !== 'undefined' && projectCategories[p.category] ? projectCategories[p.category][l] : p.category;
            const did = list(p.highlights, l);
            const text = [
                `PROJECT "${p.title[l] || p.title.en}" (${p.year}; ${cat}; ${(p.context && (p.context[l] || p.context.en)) || ''}).`,
                `Summary: ${p.summary[l] || p.summary.en}`,
                did.length ? `What Aya did: ${did.join('; ')}.` : '',
                p.results ? `Results: ${p.results[l] || p.results.en}` : '',
                p.tags && p.tags.length ? `Tools and topics: ${p.tags.join(', ')}.` : '',
                p.github ? 'Code is on GitHub.' : '', p.video ? 'A demo video is on the project page.' : ''
            ].filter(Boolean).join(' ');
            const head = tokens([both(p.title), cat, (p.tags || []).join(' '), p.id.replace(/-/g, ' ')].join(' '));
            const all = tokens([p.id.replace(/-/g, ' '), (p.tags || []).join(' '), both(p.title), both(p.summary), both(p.context), both(p.results), (p.tags || []).join(' '), both(p.highlights && { en: (p.highlights.en || []).join(' '), fr: (p.highlights.fr || []).join(' ') }), cat, p.year].join(' '));
            return { kind: 'project', id: p.id, text: clip(text, 1500), head: new Set(head), tf: count(all), len: all.length };
        });
    }
    function profileChunks() {
        const out = [];
        document.querySelectorAll('.hero-intro, .timeline-card, .service-card, .skill-group, .contact-text, .stats li').forEach(el => {
            if (el.closest('#assistant')) return;
            const t = el.textContent.replace(/\s+/g, ' ').trim();
            if (t.length < 25) return;
            const h = (el.querySelector('h3, h2') || {}).textContent || '';
            const all = tokens(t);
            out.push({ kind: 'profile', text: clip('ABOUT AYA: ' + t, 900), head: new Set(tokens(h)), tf: count(all), len: all.length });
        });
        return out;
    }
    function count(arr) { const m = new Map(); arr.forEach(w => m.set(w, (m.get(w) || 0) + 1)); return m; }

    function retrieve(question, previous) {
        const chunks = [...projectChunks(), ...profileChunks()];
        const df = new Map();
        chunks.forEach(c => c.tf.forEach((_, w) => df.set(w, (df.get(w) || 0) + 1)));
        const N = chunks.length || 1;
        const expand = text => { const base = tokens(text), q = [...base]; base.forEach(w => { if (SYN[w]) tokens(SYN[w]).forEach(x => q.push(x)); }); return q; };
        const rank = q => {
            chunks.forEach(c => {
                let s = 0;
                q.forEach(w => {
                    const f = c.tf.get(w) || 0; if (!f) return;
                    const idf = Math.log(1 + N / (df.get(w) || 1));
                    s += idf * (Math.min(f, 3) / (1 + 0.15 * Math.log(1 + c.len))) * (c.head.has(w) ? 2.2 : 1);
                });
                c.score = s;
            });
            return chunks.filter(c => c.score > 0).sort((a, b) => b.score - a.score);
        };
        let ranked = rank(expand(question));
        if (!ranked.length && previous) ranked = rank(expand(previous + ' ' + question));     // a follow-up such as "and the tools?"
        const picked = ranked.slice(0, 5);
        if (currentProject) {                                           // "this project": the page the visitor is reading comes first
            const cur = chunks.find(c => c.id === currentProject);
            if (cur) { const i = picked.indexOf(cur); if (i > -1) picked.splice(i, 1); picked.unshift(cur); if (picked.length > 5) picked.pop(); }
            if (picked.length < 4) {                                    // "similar projects": add the ones that share tools with this page
                const mine = new Set((projectById(currentProject).tags || []).map(t => t.toLowerCase()));
                chunks.filter(c => c.kind === 'project' && c.id !== currentProject && !picked.includes(c))
                    .map(c => ({ c, n: (projectById(c.id).tags || []).filter(t => mine.has(t.toLowerCase())).length })).filter(x => x.n)
                    .sort((x, y) => y.n - x.n).slice(0, 4 - picked.length).forEach(x => { picked.push(x.c); if (!ranked.includes(x.c)) ranked.push(x.c); });
            }
        }
        return { picked, ranked };
    }

    /* ---------- tiny markdown: **bold**, lists, paragraphs ---------- */
    function md(text) {
        const lines = esc(text).split(/\n/);
        let html = '', inList = false, para = [];
        const flush = () => { if (para.length) { html += '<p>' + para.join('<br>') + '</p>'; para = []; } };
        lines.forEach(raw => {
            const line = raw.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
            const li = line.match(/^\s*(?:[-*•]|\d+[.)])\s+(.*)$/);
            if (li) { flush(); if (!inList) { html += '<ul>'; inList = true; } html += '<li>' + li[1] + '</li>'; return; }
            if (inList) { html += '</ul>'; inList = false; }
            if (!line.trim()) flush(); else para.push(line);
        });
        flush(); if (inList) html += '</ul>';
        return html;
    }

    /* ---------- interface ---------- */
    let root, panel, log, form, input, sendBtn, launcher, chipsBox;
    let busy = false, asked = 0, opened = false, offlineNoted = false;
    const history = [];                                                 // { role, content }

    function build() {
        root = document.createElement('div');
        root.id = 'assistant';
        root.setAttribute('data-no-translate', '');
        root.innerHTML = `
            <button type="button" class="ai-launch" aria-expanded="false" aria-controls="ai-panel">
                <i class='bx bx-bot' aria-hidden="true"></i><span class="ai-launch-text"></span>
            </button>
            <section class="ai-panel" id="ai-panel" role="dialog" aria-modal="false" hidden>
                <header class="ai-head">
                    <span class="ai-avatar" aria-hidden="true"><i class='bx bx-bot'></i></span>
                    <div class="ai-titles"><strong class="ai-title"></strong><small class="ai-sub"></small></div>
                    <button type="button" class="ai-close" aria-label=""><i class='bx bx-x' aria-hidden="true"></i></button>
                </header>
                <div class="ai-log" role="log" aria-live="polite" tabindex="0"></div>
                <div class="ai-chips"></div>
                <form class="ai-form" autocomplete="off">
                    <input type="text" class="ai-input" maxlength="400" enterkeyhint="send" aria-label="">
                    <button type="submit" class="ai-send" aria-label=""><i class='bx bx-send' aria-hidden="true"></i></button>
                </form>
                <p class="ai-note"></p>
            </section>`;
        document.body.appendChild(root);
        launcher = root.querySelector('.ai-launch'); panel = root.querySelector('.ai-panel');
        log = root.querySelector('.ai-log'); form = root.querySelector('.ai-form');
        input = root.querySelector('.ai-input'); sendBtn = root.querySelector('.ai-send'); chipsBox = root.querySelector('.ai-chips');

        launcher.addEventListener('click', () => (panel.hidden ? open() : close()));
        root.querySelector('.ai-close').addEventListener('click', close);
        form.addEventListener('submit', e => { e.preventDefault(); const q = input.value.trim(); if (q) { input.value = ''; ask(q); } });
        chipsBox.addEventListener('click', e => { const b = e.target.closest('button[data-q]'); if (b) ask(b.dataset.q); });
        log.addEventListener('click', e => {
            const a = e.target.closest('a[data-open-timeline]');
            if (a) { e.preventDefault(); close(); if (window.ProjectTimeline) window.ProjectTimeline.show(); document.getElementById('projects').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); }
        });
        document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) { close(); launcher.focus(); } });
        document.addEventListener('langchange', () => { texts(); if (opened && !history.length) greet(true); chips(); });
        texts(); chips();
    }

    function texts() {
        launcher.querySelector('.ai-launch-text').textContent = L('Ask my assistant', 'Poser une question');
        launcher.setAttribute('aria-label', L('Ask the assistant about Aya\'s projects', 'Poser une question à l\'assistante sur les projets d\'Aya'));
        root.querySelector('.ai-title').textContent = L('Aya\'s assistant', 'Assistante d\'Aya');
        root.querySelector('.ai-sub').textContent = L('Ask about her projects, in simple words', 'Posez vos questions sur ses projets');
        root.querySelector('.ai-close').setAttribute('aria-label', L('Close', 'Fermer'));
        input.placeholder = L('Ask a question…', 'Posez une question…');
        input.setAttribute('aria-label', L('Your question', 'Votre question'));
        sendBtn.setAttribute('aria-label', L('Send', 'Envoyer'));
        root.querySelector('.ai-note').textContent = L('AI answers can be wrong. Your question is sent to an AI service: please share no personal data.', 'Les réponses de l\'IA peuvent comporter des erreurs. Votre question est envoyée à un service d\'IA : ne partagez pas de données personnelles.');
        panel.setAttribute('aria-label', L('Aya\'s assistant', 'Assistante d\'Aya'));
    }

    function chips() {
        const p = projectById(currentProject);
        const items = p ? [
            [L('Explain this project in simple words', 'Explique ce projet avec des mots simples'), L(`Explain "${p.title.en}" in simple words`, `Explique « ${p.title.fr || p.title.en} » avec des mots simples`)],
            [L('What did Aya do herself?', 'Qu\'a fait Aya elle-même ?'), L('What did Aya personally do in this project?', 'Qu\'est-ce qu\'Aya a personnellement fait dans ce projet ?')],
            [L('Which tools were used?', 'Quels outils ont été utilisés ?'), L('Which tools and software were used in this project?', 'Quels outils et logiciels ont été utilisés dans ce projet ?')],
            [L('Show similar projects', 'Projets similaires'), L('Which other projects of Aya are similar to this one?', 'Quels autres projets d\'Aya ressemblent à celui-ci ?')]
        ] : [
            [L('Which project should I look at first?', 'Quel projet regarder en premier ?'), L('Which project should I look at first, and why?', 'Quel projet regarder en premier, et pourquoi ?')],
            [L('Which robots has Aya programmed?', 'Quels robots Aya a-t-elle programmés ?'), L('Which robots has Aya programmed?', 'Quels robots Aya a-t-elle programmés ?')],
            [L('What is Robotics Atlas?', 'C\'est quoi Robotics Atlas ?'), L('What is Robotics Atlas, in simple words?', 'C\'est quoi Robotics Atlas, avec des mots simples ?')],
            [L('What is she looking for?', 'Que recherche-t-elle ?'), L('Is Aya available for an internship, and what kind?', 'Aya est-elle disponible pour un stage, et lequel ?')]
        ];
        chipsBox.innerHTML = items.map(([label, q]) => `<button type="button" data-q="${esc(q)}">${esc(label)}</button>`).join('');
    }

    function greet(replace) {
        if (replace) log.innerHTML = '';
        const p = projectById(currentProject);
        add('bot', p
            ? L(`Hi! I'm Aya's assistant. You're reading **${p.title.en}**. I can explain it in simple words, or tell you what Aya did in it.`, `Bonjour ! Je suis l'assistante d'Aya. Vous lisez **${p.title.fr || p.title.en}**. Je peux l'expliquer avec des mots simples, ou dire ce qu'Aya y a fait.`)
            : L('Hi! I\'m Aya\'s assistant. Her projects can be hard to follow, so ask me anything: what a project is about, which tools were used, or where to start.', 'Bonjour ! Je suis l\'assistante d\'Aya. Ses projets ne sont pas toujours faciles à suivre : posez-moi vos questions, par exemple de quoi parle un projet, quels outils ont servi, ou par où commencer.'));
    }

    function add(who, text, extra) {
        const el = document.createElement('div');
        el.className = 'ai-msg ' + who;
        el.innerHTML = who === 'bot' ? md(text) : `<p>${esc(text)}</p>`;
        if (extra) el.appendChild(extra);
        log.appendChild(el); scroll();
        return el;
    }
    const scroll = () => { log.scrollTop = log.scrollHeight; };

    function related(ranked) {
        const ps = ranked.filter(c => c.kind === 'project').slice(0, 3).map(c => projectById(c.id)).filter(Boolean);
        if (!ps.length) return null;
        const box = document.createElement('div');
        box.className = 'ai-related';
        box.innerHTML = `<small>${L('Related projects', 'Projets liés')}</small>` + ps.map(p => `<a href="project.html?id=${encodeURIComponent(p.id)}"><i class='bx bx-right-arrow-alt' aria-hidden="true"></i>${esc(p.title[lang()] || p.title.en)}</a>`).join('') +
            (document.getElementById('project-timeline') ? `<a href="#projects" data-open-timeline><i class='bx bx-time-five' aria-hidden="true"></i>${L('See them on the timeline', 'Les voir sur la frise')}</a>` : '');
        return box;
    }

    /* ---------- asking ---------- */
    async function ask(question, opts) {
        if (busy) return;
        if (opts && opts.project) currentProject = opts.project, chips();
        open(true);
        if (asked >= MAX_QUESTIONS) { add('bot', L('That was a lot of questions! To keep this free for everyone, please write to Aya directly: briksinea@gmail.com', 'Beaucoup de questions ! Pour que cela reste gratuit pour tous, écrivez directement à Aya : briksinea@gmail.com')); return; }
        asked++; busy = true; sendBtn.disabled = true; root.classList.add('started');
        add('user', question);
        const prev = [...history].reverse().find(m => m.role === 'user');
        const { picked, ranked } = retrieve(question, prev && prev.content);
        const wait = add('bot', '');
        wait.classList.add('typing'); wait.innerHTML = '<span class="dots" aria-label="' + L('Thinking', 'Réflexion') + '"><i></i><i></i><i></i></span>';
        history.push({ role: 'user', content: question });

        let answer = null;
        try {
            const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);
            const res = await fetch(API, {
                method: 'POST', headers: { 'content-type': 'application/json' }, signal: ctl.signal,
                body: JSON.stringify({ lang: lang(), messages: history.slice(-6), context: picked.map(c => c.text) })
            });
            clearTimeout(timer);
            if (res.ok) { const data = await res.json(); if (data && typeof data.answer === 'string' && data.answer.trim()) answer = data.answer.trim(); }
            else if (res.status === 429) answer = L('You are asking very fast! Please wait a few seconds and try again.', 'Vous allez très vite ! Patientez quelques secondes puis réessayez.');
        } catch (e) { /* offline, blocked or slow: use the local answer below */ }

        wait.classList.remove('typing');
        const extra = answer ? related(ranked) : null;                    // when offline, the answer itself already lists the projects
        if (answer) {
            history.push({ role: 'assistant', content: answer });
            await reveal(wait, answer);
            if (extra) wait.appendChild(extra);
        } else {
            const local = localAnswer(question, picked, ranked);
            history.push({ role: 'assistant', content: local.text });
            wait.innerHTML = md(local.text);
            if (extra) wait.appendChild(extra);
            if (!offlineNoted) { offlineNoted = true; const n = document.createElement('small'); n.className = 'ai-offline'; n.textContent = L('The AI is not reachable right now: this answer comes from the project descriptions.', 'L\'IA n\'est pas joignable pour le moment : cette réponse vient des descriptions des projets.'); wait.appendChild(n); }
        }
        scroll(); busy = false; sendBtn.disabled = false; if (!matchMedia('(pointer: coarse)').matches) input.focus();
    }

    function localAnswer(question, picked, ranked) {
        const projs = ranked.filter(c => c.kind === 'project').slice(0, 3).map(c => projectById(c.id)).filter(Boolean);
        const prof = ranked.find(c => c.kind === 'profile');
        const l = lang();
        const p0 = currentProject && /\b(this|it|ce|cette|ça|ca)\b/i.test(question) ? projectById(currentProject) : null;
        if (p0) return { text: `**${p0.title[l] || p0.title.en}**\n${p0.summary[l] || p0.summary.en}` };
        if (projs.length) {
            const lines = projs.map(p => `- **${p.title[l] || p.title.en}** (${p.year}): ${clip(p.summary[l] || p.summary.en, 150)}`);
            return { text: L('These projects look closest to your question:', 'Ces projets semblent les plus proches de votre question :') + '\n' + lines.join('\n') };
        }
        if (prof) return { text: clip(prof.text.replace(/^ABOUT AYA:\s*/, ''), 420) };
        return { text: L('I did not find that. Try a tool (MATLAB, Python, PLC), a robot (cobot, SCARA, Delta) or a topic (control, signal), or browse the projects below.', 'Je n\'ai pas trouvé. Essayez un outil (MATLAB, Python, automate), un robot (cobot, SCARA, Delta) ou un thème (automatique, signal), ou parcourez les projets plus bas.') };
    }

    /* the answer appears progressively, like someone typing */
    function reveal(el, text) {
        return new Promise(done => {
            if (reduce || text.length < 40) { el.innerHTML = md(text); return done(); }
            let n = 0; const step = Math.max(2, Math.round(text.length / 90));
            const timer = setInterval(() => {
                n = Math.min(text.length, n + step);
                el.innerHTML = md(text.slice(0, n)); scroll();
                if (n >= text.length || panel.hidden) { clearInterval(timer); el.innerHTML = md(text); done(); }
            }, 22);
        });
    }

    /* ---------- open / close ---------- */
    function open(silent) {
        panel.hidden = false; launcher.setAttribute('aria-expanded', 'true'); root.classList.add('open');
        if (!opened) { opened = true; greet(); }
        if (!silent) setTimeout(() => input.focus({ preventScroll: true }), 60);
    }
    function close() { panel.hidden = true; launcher.setAttribute('aria-expanded', 'false'); root.classList.remove('open'); }

    /* ---------- public use ---------- */
    window.AyaAssistant = {
        open(question, opts) { if (!root) build(); if (question) ask(question, opts); else { if (opts && opts.project) { currentProject = opts.project; chips(); } open(); } },
        setProject(id) { currentProject = projectById(id) ? id : null; if (root) chips(); }
    };
    // a button anywhere on the site can ask about a project:  <button data-ask-project="project-id">
    document.addEventListener('click', e => {
        const b = e.target.closest('[data-ask-project]');
        if (!b) return;
        const p = projectById(b.dataset.askProject);
        if (!p) return;
        e.preventDefault();
        window.AyaAssistant.open(L(`Explain "${p.title.en}" in simple words`, `Explique « ${p.title.fr || p.title.en} » avec des mots simples`), { project: p.id });
    });

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
