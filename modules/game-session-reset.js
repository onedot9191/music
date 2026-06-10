function findById(root, id) {
    return root.getElementById?.(id) || root.querySelector?.(`#${id}`);
}

export function hideTodayBlankCount({ root = document } = {}) {
    findById(root, 'today-blank-count')?.classList.add('hidden');
}

export function resetAllAnswerInputs(CONSTANTS, { root = document } = {}) {
    root.querySelectorAll('input[data-answer]').forEach((input) => {
        input.disabled = true;
        input.value = '';
        input.classList.remove(
            CONSTANTS.CSS_CLASSES.CORRECT,
            CONSTANTS.CSS_CLASSES.INCORRECT,
            CONSTANTS.CSS_CLASSES.RETRYING,
            CONSTANTS.CSS_CLASSES.SHAKE,
            'wrong-answer-indicator'
        );
    });
}

export function clearSpellingQuestionsList({ root = document } = {}) {
    const questionsList = findById(root, 'spelling-questions-list');
    if (questionsList) {
        questionsList.innerHTML = '';
    }
}

export function syncVisibleStartModalSelection({
    SUBJECT_TOPIC_MAPPING,
    gameState,
    root = document,
}) {
    const selectedSubjectBtn = root.querySelector(
        '.subject-btn[data-subject-group].selected'
    );

    if (!selectedSubjectBtn || !SUBJECT_TOPIC_MAPPING) return;

    const topics =
        SUBJECT_TOPIC_MAPPING[selectedSubjectBtn.dataset.subjectGroup];
    if (!topics?.length) return;

    const visibleSelectedSubBtn = root.querySelector(
        '[id$="-submenu"]:not(.hidden) .topic-sub-btn.selected'
    );
    const selectedTopicBtn = root.querySelector('.topic-btn.selected');

    if (visibleSelectedSubBtn) {
        gameState.selectedSubject = visibleSelectedSubBtn.dataset.subject;
        gameState.selectedTopic = visibleSelectedSubBtn.dataset.topic;
    } else if (selectedTopicBtn) {
        gameState.selectedSubject = selectedTopicBtn.dataset.subject;
        gameState.selectedTopic = selectedTopicBtn.dataset.topic;
    } else {
        gameState.selectedSubject = topics[0].subject;
        gameState.selectedTopic = topics[0].topic;
    }
}

export function resetStartModalEthicsState({
    CONSTANTS,
    gameState,
    root = document,
}) {
    gameState.ethicsConsecutiveClicks = 0;
    gameState.useEasternEthicsBasic = false;
    gameState.pendingEthicsBasicStart = false;

    findById(root, 'ethics-basic-submenu')?.classList.add(
        CONSTANTS.CSS_CLASSES.HIDDEN
    );
}

export function hideQuizContainers(quizContainers, CONSTANTS) {
    quizContainers.forEach((main) =>
        main.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN)
    );
}

export function clearCompetencyClearedState({ root = document } = {}) {
    root.querySelectorAll('.competency-tab.cleared').forEach((tab) =>
        tab.classList.remove('cleared')
    );
}
