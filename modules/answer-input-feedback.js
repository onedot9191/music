export function pulseCorrectInput(input, correctPulseClass) {
    input.classList.remove(correctPulseClass);

    void input.offsetWidth;

    input.classList.add(correctPulseClass);
    input.addEventListener(
        'animationend',
        () => {
            input.classList.remove(correctPulseClass);
        },
        { once: true }
    );
}

export function markInputCorrect({
    CONSTANTS,
    clearStoredAnswerHistory,
    displayAnswer,
    input,
    updateWrongAnswerIndicatorsImmediate,
}) {
    input.classList.remove(
        CONSTANTS.CSS_CLASSES.INCORRECT,
        CONSTANTS.CSS_CLASSES.RETRYING
    );
    input.classList.add(CONSTANTS.CSS_CLASSES.CORRECT);
    input.classList.remove('wrong-answer-indicator');

    clearStoredAnswerHistory(input);
    updateWrongAnswerIndicatorsImmediate();
    pulseCorrectInput(input, CONSTANTS.CSS_CLASSES.CORRECT_PULSE);

    input.value = displayAnswer;
    input.disabled = true;
}

export function markInputAsNonRetryableIncorrect(CONSTANTS, input) {
    input.classList.remove(CONSTANTS.CSS_CLASSES.RETRYING);
    input.classList.add(CONSTANTS.CSS_CLASSES.INCORRECT);
}

export function markInputRetrying(CONSTANTS, input) {
    input.classList.add(CONSTANTS.CSS_CLASSES.RETRYING);
    input.value = '';
}
