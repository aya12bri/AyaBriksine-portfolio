(() => {
    const messages = []
    const copy = {
        en: {
            prompt: 'Do you have a question?',
            title: 'Ask about Aya', close: 'Close chat', placeholder: 'Ask a question…',
            send: 'Send', greeting: 'Ask me about Aya’s projects, skills, experience or internship search.',
            pending: 'Thinking…', error: 'The assistant is unavailable. Please try again.',
            rate: 'Too many questions at once. Please try again in a minute.',
            contact: 'Contact Aya', projects: 'View projects'
        },
        fr: {
            prompt: 'Vous avez une question ?',
            title: 'Poser une question', close: 'Fermer le chat', placeholder: 'Écrire une question…',
            send: 'Envoyer', greeting: 'Pose-moi une question sur les projets, les compétences, le parcours ou la recherche de stage d’Aya.',
            pending: 'Réflexion en cours…', error: 'L’assistant est indisponible. Réessaie dans un instant.',
            rate: 'Trop de questions à la fois. Réessaie dans une minute.',
            contact: 'Contacter Aya', projects: 'Voir les projets'
        }
    }


    // purple mascot, drawn in SVG so its parts can move (float, wave, blink, glowing antenna)
    const mascot = (cls, full) => `<svg class="${cls}" viewBox="${full ? '0 0 120 150' : '14 4 92 78'}" aria-hidden="true">
        <defs>
            <linearGradient id="pm-shell" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f2f8"/><stop offset="1" stop-color="#c9c4d6"/></linearGradient>
            <radialGradient id="pm-glow"><stop offset="0" stop-color="#e2c8ff"/><stop offset="1" stop-color="#9b5cf6"/></radialGradient>
        </defs>
        ${full ? `<g class="pm-legs"><rect x="44" y="118" width="13" height="22" rx="6" fill="url(#pm-shell)"/><rect x="63" y="118" width="13" height="22" rx="6" fill="url(#pm-shell)"/>
            <path d="M42 138h17M61 138h17" stroke="#a678f5" stroke-width="2.5" stroke-linecap="round"/></g>
        <g class="pm-arm-l"><rect x="25" y="88" width="12" height="28" rx="6" fill="url(#pm-shell)" transform="rotate(14 31 90)"/><circle cx="27" cy="117" r="6" fill="#5b5566"/></g>
        <rect x="36" y="80" width="48" height="44" rx="18" fill="url(#pm-shell)"/>
        <circle class="pm-chest" cx="60" cy="100" r="7" fill="url(#pm-glow)"/>
        <g class="pm-arm-r"><rect x="83" y="66" width="12" height="28" rx="6" fill="url(#pm-shell)" transform="rotate(-28 89 92)"/><circle cx="99" cy="64" r="7" fill="#5b5566"/></g>` : ''}
        <g class="pm-head">
            <line x1="60" y1="16" x2="60" y2="8" stroke="#5b5566" stroke-width="3" stroke-linecap="round"/>
            <circle class="pm-antenna" cx="60" cy="7" r="5" fill="url(#pm-glow)"/>
            <rect x="24" y="16" width="72" height="60" rx="28" fill="url(#pm-shell)"/>
            <rect x="18" y="38" width="9" height="18" rx="4.5" fill="#a678f5"/><rect x="93" y="38" width="9" height="18" rx="4.5" fill="#a678f5"/>
            <rect x="32" y="26" width="56" height="40" rx="18" fill="#1d1830"/>
            <g class="pm-eyes" fill="none" stroke="#c9a2ff" stroke-width="4" stroke-linecap="round">
                <path d="M41 46q6-8 12 0"/><path d="M67 46q6-8 12 0"/>
            </g>
            <path class="pm-mouth" d="M53 54q7 6 14 0" fill="none" stroke="#c9a2ff" stroke-width="3.5" stroke-linecap="round"/>
        </g>
    </svg>`
    const robotAvatar = `<span class="portfolio-chat-avatar" aria-hidden="true">${mascot('pm-mini', false)}</span>`
    const widget = document.createElement('div')
    widget.className = 'portfolio-chat'
    widget.innerHTML = `
        <button class="portfolio-chat-launch" type="button" aria-haspopup="dialog" aria-controls="portfolio-chat-dialog">
            <span class="portfolio-chat-prompt"></span>
            <span class="portfolio-chat-robot" aria-hidden="true">${mascot('pm-full', true)}</span>
        </button>
        <dialog class="portfolio-chat-dialog" id="portfolio-chat-dialog" aria-labelledby="portfolio-chat-title">
            <header>
                <h2 id="portfolio-chat-title"></h2>
                <button class="portfolio-chat-close" type="button">×</button>
            </header>
            <div class="portfolio-chat-log" role="log" aria-label="Conversation" tabindex="0">
                <div class="portfolio-chat-message assistant">
                    ${robotAvatar}
                    <p class="portfolio-chat-bubble portfolio-chat-greeting"></p>
                </div>
            </div>
            <p class="portfolio-chat-status" role="status"></p>
            <form class="portfolio-chat-form">
                <input type="text" maxlength="500" required autocomplete="off">
                <button type="submit"></button>
            </form>
            <footer>
                <a href="./#projects"></a>
                <a href="./#contact"></a>
            </footer>
        </dialog>`
    document.body.append(widget)

    const launch = widget.querySelector('.portfolio-chat-launch')
    const prompt = launch.querySelector('.portfolio-chat-prompt')
    const dialog = widget.querySelector('dialog')
    const close = dialog.querySelector('.portfolio-chat-close')
    const title = dialog.querySelector('h2')
    const log = dialog.querySelector('[role="log"]')
    const greeting = dialog.querySelector('.portfolio-chat-greeting')
    const status = dialog.querySelector('[role="status"]')
    const form = dialog.querySelector('form')
    const input = form.querySelector('input')
    const send = form.querySelector('button')
    const [projects, contact] = dialog.querySelectorAll('footer a')
    const language = () => document.documentElement.lang === 'fr' ? 'fr' : 'en'
    let statusKey = ''
    let pending = false

    function translate() {
        const labels = copy[language()]
        prompt.textContent = labels.prompt
        title.textContent = labels.title
        close.setAttribute('aria-label', labels.close)
        greeting.textContent = labels.greeting
        input.placeholder = labels.placeholder
        input.setAttribute('aria-label', labels.placeholder)
        send.textContent = labels.send
        projects.textContent = labels.projects
        contact.textContent = labels.contact
        status.textContent = labels[statusKey] || ''
    }

    function setStatus(key) {
        statusKey = key
        translate()
    }

    function appendMessage(message) {
        const row = document.createElement('div')
        row.className = 'portfolio-chat-message ' + message.role
        if (message.role === 'assistant') row.insertAdjacentHTML('afterbegin', robotAvatar)
        const bubble = document.createElement('p')
        bubble.className = 'portfolio-chat-bubble'
        bubble.textContent = message.content
        row.append(bubble)
        log.append(row)
        log.scrollTop = log.scrollHeight
        return row
    }

    new MutationObserver(translate).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['lang']
    })
    translate()

    launch.addEventListener('click', () => {
        dialog.showModal()
        input.focus()
        log.scrollTop = log.scrollHeight
    })
    close.addEventListener('click', () => dialog.close())
    dialog.addEventListener('close', () => launch.focus())
    for (const link of [projects, contact]) {
        link.addEventListener('click', () => dialog.close())
    }

    form.addEventListener('submit', async event => {
        event.preventDefault()
        const question = input.value.trim()
        if (!question || pending) return

        const message = { role: 'user', content: question }
        const row = appendMessage(message)
        input.value = ''
        input.readOnly = true
        send.disabled = true
        pending = true
        setStatus('pending')

        try {
            const response = await fetch('/api/portfolio-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lang: language(), messages: [...messages, message] }),
                signal: AbortSignal.timeout(25000)
            })
            if (!response.ok) {
                setStatus(response.status === 429 ? 'rate' : 'error')
                return
            }
            const { answer } = await response.json()
            if (typeof answer !== 'string' || !answer.trim()) throw new Error('Empty answer')

            const reply = { role: 'assistant', content: answer }
            messages.push(message, reply)
            if (messages.length > 6) messages.splice(0, 2)
            appendMessage(reply)
            setStatus('')
        } catch {
            setStatus('error')
        } finally {
            if (statusKey) {
                row.remove()
                input.value = question
            }
            pending = false
            input.readOnly = false
            send.disabled = false
            if (dialog.open && (document.activeElement === send || document.activeElement === document.body)) {
                input.focus()
            }
        }
    })
})()
