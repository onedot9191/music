function getOriginalText(button) {
    return button.getAttribute('data-original-text') || button.textContent;
}

export function setButtonLoading(button, loading) {
    if (!button) return;

    if (loading) {
        const originalText = getOriginalText(button);
        const label = document.createElement('span');
        label.className = 'btn-text';
        label.textContent = originalText;

        button.style.pointerEvents = 'none';
        button.classList.add('loading');
        button.disabled = true;
        button.setAttribute('data-original-text', originalText);
        button.replaceChildren(label);
        button.getBoundingClientRect();
        return;
    }

    button.style.pointerEvents = '';
    button.classList.remove('loading');
    button.disabled = false;

    const originalText = button.getAttribute('data-original-text');
    if (originalText) {
        button.textContent = originalText;
        button.removeAttribute('data-original-text');
    }
}

export function setButtonsLoading(buttons, loading) {
    buttons.forEach((button) => setButtonLoading(button, loading));
}

export function setButtonTextUnlessLoading(button, text) {
    if (!button || button.classList.contains('loading')) return;

    button.textContent = text;
}
