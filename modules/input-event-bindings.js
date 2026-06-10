import { isCurriculumOrderEditingInput } from './curriculum-order-editor.js';

const DIRTY_KEY = 'answerDirty';
const AUTO_FOCUSED_KEY = 'autoFocused';
const COMPOSING_KEY = 'answerComposing';

function isAnswerInput(target) {
    return target.matches('input[data-answer]');
}

function markDirty(event) {
    if (
        !isAnswerInput(event.target) ||
        isCurriculumOrderEditingInput(event.target)
    ) {
        return;
    }

    delete event.target.dataset[AUTO_FOCUSED_KEY];
    event.target.dataset[DIRTY_KEY] = 'true';
}

function clearDirty(input) {
    delete input.dataset[DIRTY_KEY];
}

function markComposing(event) {
    if (!isAnswerInput(event.target)) return;

    event.target.dataset[COMPOSING_KEY] = 'true';
}

function markCompositionComplete(event) {
    if (!isAnswerInput(event.target)) return;

    delete event.target.dataset[COMPOSING_KEY];
    markDirty(event);
}

function isComposing(event) {
    return (
        event.isComposing ||
        event.keyCode === 229 ||
        event.target.dataset[COMPOSING_KEY] === 'true'
    );
}

function shouldIgnoreKeydown(event) {
    const isEnterGrading = event.key === 'Enter';

    return (
        !isAnswerInput(event.target) ||
        isComposing(event) ||
        isCurriculumOrderEditingInput(event.target) ||
        (!isEnterGrading && event.target.dataset[AUTO_FOCUSED_KEY] === 'true')
    );
}

export function attachAnswerInputHandlers({
    handleInputChange,
    root,
}) {
    const deferredHandleInputChange = (event) => {
        requestAnimationFrame(() => {
            if (event.target.dataset[AUTO_FOCUSED_KEY] === 'true') return;
            if (event.target.dataset[DIRTY_KEY] !== 'true') return;

            handleInputChange(event);
            clearDirty(event.target);
        });
    };

    root.addEventListener('input', markDirty, true);
    root.addEventListener('compositionstart', markComposing, true);
    root.addEventListener('compositionend', markCompositionComplete, true);
    root.addEventListener('blur', deferredHandleInputChange, true);

    root.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== 'Tab') {
            return;
        }

        if (shouldIgnoreKeydown(event)) {
            return;
        }

        if (event.key === 'Tab' && !event.target.value.trim()) {
            clearDirty(event.target);
            return;
        }

        if (event.key === 'Tab' && event.target.dataset[DIRTY_KEY] !== 'true') {
            return;
        }

        if (event.key === 'Tab') {
            handleInputChange({ target: event.target });
            clearDirty(event.target);
            return;
        }

        event.preventDefault();
        handleInputChange({
            target: event.target,
            allowEmptyAnswer: true,
        });
        clearDirty(event.target);
    });
}

export function bindAnswerInputHandlers({
    handleInputChange,
    roots,
}) {
    roots.forEach((root) => {
        attachAnswerInputHandlers({
            handleInputChange,
            root,
        });
    });
}
