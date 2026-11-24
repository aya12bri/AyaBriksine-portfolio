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

    const robotAvatar = '<span class="portfolio-chat-avatar" aria-hidden="true"><span class="robot-face"></span></span>'
    const widget = document.createElement('div')
    widget.className = 'portfolio-chat'
    widget.innerHTML = `
        <button class="portfolio-chat-launch" type="button" aria-haspopup="dialog" aria-controls="portfolio-chat-dialog">
            <span class="portfolio-chat-prompt"></span>
            <span class="portfolio-chat-robot" aria-hidden="true">
                <span class="robot-antenna"></span>
                <span class="robot-head"><span class="robot-face"></span></span>
                <span class="robot-body"></span>
                <span class="robot-arm robot-arm-left"></span>
                <span class="robot-arm robot-arm-right"></span>
                <span class="robot-wheel robot-wheel-left"></span>
                <span class="robot-wheel robot-wheel-right"></span>
            </span>
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
