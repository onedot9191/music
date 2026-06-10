import { extractSpellingChoices } from './spelling-quiz-data.js';
export {
    animateSpellingProgress,
    updateSpellingProgress,
} from './spelling-progress-view.js';
export { showSpellingComboEffect } from './spelling-combo-effect.js';

function findById(root, id) {
    return root.getElementById?.(id) || root.querySelector?.(`#${id}`);
}

export function isSpellingBlankMode({ root = document } = {}) {
    const spellingMain = findById(root, 'spelling-quiz-main');
    if (!spellingMain) return false;

    const activeTab = spellingMain.querySelector('.tabs .tab.active');
    return activeTab?.dataset.target === 'spelling-blank';
}

export function getActiveSpellingTabTarget({ root = document } = {}) {
    const spellingMain = findById(root, 'spelling-quiz-main');
    const activeTab = spellingMain?.querySelector('.tabs .tab.active');
    return activeTab?.dataset.target || null;
}

function createChoiceButton(choice, onChoice) {
    const button = document.createElement('button');
    button.className = 'spelling-choice-btn';
    button.dataset.choice = choice;
    button.textContent = choice;
    button.addEventListener('click', () => onChoice(button));

    if ('ontouchstart' in window) {
        button.addEventListener(
            'touchstart',
            (event) => {
                event.preventDefault();
                button.style.transform = 'translateY(-1px) scale(0.98)';
            },
            { passive: false }
        );

        button.addEventListener(
            'touchend',
            (event) => {
                event.preventDefault();
                button.style.transform = '';
                onChoice(button);
            },
            { passive: false }
        );

        button.addEventListener('touchcancel', () => {
            button.style.transform = '';
        });
    }

    return button;
}

function appendQuestionContent({
    afterParens,
    beforeParens,
    choices,
    questionItem,
    onChoice,
}) {
    const content = document.createElement('div');
    content.className = 'spelling-question-content';
    content.append(document.createTextNode(beforeParens));
    choices.forEach((choice) => {
        content.append(createChoiceButton(choice, onChoice));
    });
    content.append(document.createTextNode(afterParens));
    questionItem.append(content);
}

export function bindSpellingKeyboard({
    buttons,
    correctAnswer,
    isAnswered,
    isBlankMode,
    onChoice,
    questionItem,
    root = document,
}) {
    const keyboardHandler = (event) => {
        if (isAnswered() || isBlankMode()) return;

        const currentItem = root.querySelector(
            '.spelling-question-item.current'
        );
        if (!currentItem || !currentItem.contains(buttons[0])) return;

        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            onChoice(buttons[0], correctAnswer, buttons, questionItem);
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            onChoice(buttons[1], correctAnswer, buttons, questionItem);
        }
    };

    document.addEventListener('keydown', keyboardHandler);
    questionItem.keyboardCleanup = () => {
        document.removeEventListener('keydown', keyboardHandler);
    };
}

export function renderSpellingQuestion({
    isAnswered,
    isBlankMode,
    onChoice,
    questionData,
    questionIndex,
    root = document,
}) {
    const questionsList = findById(root, 'spelling-questions-list');
    if (!questionsList) return null;

    const { sentence, answer } = questionData;
    const choiceData = extractSpellingChoices(sentence);
    if (!choiceData) return null;

    const { choices, position, fullMatch } = choiceData;
    const questionItem = document.createElement('div');
    questionItem.className = 'spelling-question-item current';
    questionItem.dataset.questionIndex = questionIndex;

    const handleChoice = (button) => {
        if (isAnswered()) return;
        onChoice(button, answer, buttons, questionItem);
    };

    appendQuestionContent({
        beforeParens: sentence.substring(0, position),
        afterParens: sentence.substring(position + fullMatch.length),
        choices,
        questionItem,
        onChoice: handleChoice,
    });

    questionsList
        .querySelectorAll('.spelling-question-item.current')
        .forEach((item) => item.classList.remove('current'));
    questionsList.prepend(questionItem);

    const buttons = questionItem.querySelectorAll('.spelling-choice-btn');
    bindSpellingKeyboard({
        buttons,
        correctAnswer: answer,
        isAnswered,
        isBlankMode,
        onChoice,
        questionItem,
        root,
    });

    if (window.innerWidth <= 768) {
        setTimeout(() => {
            questionItem.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest',
            });
        }, 100);
    }

    return questionItem;
}

export function applySpellingChoiceResult({
    allButtons,
    clickedButton,
    correctAnswer,
    isCorrect,
    questionItem,
}) {
    questionItem.keyboardCleanup?.();

    allButtons.forEach((button) => {
        button.disabled = true;

        if (button.dataset.choice === correctAnswer) {
            button.classList.add('correct-answer');
        } else if (button === clickedButton && !isCorrect) {
            button.classList.add('wrong-answer');
        }
    });

    questionItem.classList.add(isCorrect ? 'answer-correct' : 'answer-wrong');
    questionItem.classList.add('answered');
    questionItem.classList.remove('current');
}

export function clearSpellingQuestionItems({ root = document } = {}) {
    const questionsList = findById(root, 'spelling-questions-list');
    if (!questionsList) return false;

    questionsList
        .querySelectorAll('.spelling-question-item')
        .forEach((item) => item.keyboardCleanup?.());
    questionsList.innerHTML = '';
    return true;
}

export function setSpellingDatasetSelectionVisible({
    visible,
    root = document,
}) {
    const selectionEl = findById(root, 'spelling-dataset-selection');
    const containerEl = findById(root, 'spelling-container');

    selectionEl?.classList.toggle('hidden', !visible);
    containerEl?.classList.toggle('hidden', visible);
}
