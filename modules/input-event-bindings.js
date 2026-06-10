function focusNextEnabledAnswerInput(root, currentInput) {
    const container = currentInput.closest('main, .modal-content') || root;
    const inputs = Array.from(container.querySelectorAll('input[data-answer]'));
    const currentIndex = inputs.indexOf(currentInput);

    for (let index = currentIndex + 1; index < inputs.length; index += 1) {
        const nextInput = inputs[index];
        if (nextInput.disabled) continue;

        nextInput.focus();
        nextInput.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
        });
        break;
    }
}

export function attachAnswerInputHandlers({
    CONSTANTS,
    handleInputChange,
    root,
}) {
    const deferredHandleInputChange = (event) => {
        requestAnimationFrame(() => handleInputChange(event));
    };

    root.addEventListener('blur', deferredHandleInputChange, true);

    root.addEventListener('keydown', (event) => {
        if (
            event.key !== 'Enter' ||
            !event.target.matches('input[data-answer]')
        ) {
            return;
        }

        event.preventDefault();
        handleInputChange({ target: event.target });

        if (event.target.classList.contains(CONSTANTS.CSS_CLASSES.CORRECT)) {
            focusNextEnabledAnswerInput(root, event.target);
        }
    });
}

export function bindAnswerInputHandlers({
    CONSTANTS,
    handleInputChange,
    roots,
}) {
    roots.forEach((root) => {
        attachAnswerInputHandlers({
            CONSTANTS,
            handleInputChange,
            root,
        });
    });
}
