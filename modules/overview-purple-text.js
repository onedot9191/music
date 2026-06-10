function hasBlankInput(question) {
    return question.querySelectorAll('input[data-answer]').length > 0;
}

function setPurpleTextForBlankQuestions(root = document) {
    root.querySelectorAll('.overview-question').forEach((question) => {
        question.classList.remove('science-model-purple-text');

        if (hasBlankInput(question)) {
            question.classList.add('science-model-purple-text');
        }
    });
}

function clearPurpleText(root = document) {
    root.querySelectorAll('.overview-question').forEach((question) => {
        question.classList.remove('science-model-purple-text');
    });
}

export function applyScienceModelPurpleText(gameState, CONSTANTS) {
    const isScienceModel =
        gameState.selectedTopic === CONSTANTS.TOPICS.MODEL &&
        gameState.selectedSubject === CONSTANTS.SUBJECTS.SCIENCE;

    if (isScienceModel) {
        setPurpleTextForBlankQuestions();
    }
}

export function applyGeometryMoralPurpleText(gameState, CONSTANTS) {
    const isGeometryMoral =
        gameState.selectedTopic === CONSTANTS.TOPICS.MORAL &&
        gameState.selectedSubject === CONSTANTS.SUBJECTS.GEOMETRY;

    if (isGeometryMoral) {
        setPurpleTextForBlankQuestions();
    }
}

export function applyPurpleTextStyles(gameState, CONSTANTS) {
    if (
        gameState.selectedTopic === CONSTANTS.TOPICS.MODEL &&
        gameState.selectedSubject === CONSTANTS.SUBJECTS.SCIENCE
    ) {
        applyScienceModelPurpleText(gameState, CONSTANTS);
        return;
    }

    if (
        gameState.selectedTopic === CONSTANTS.TOPICS.MORAL &&
        gameState.selectedSubject === CONSTANTS.SUBJECTS.GEOMETRY
    ) {
        applyGeometryMoralPurpleText(gameState, CONSTANTS);
        return;
    }

    clearPurpleText();
}
