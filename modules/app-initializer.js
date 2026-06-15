function initializeGeometryFeatures() {
    const geometryMain = document.getElementById('geometry-quiz-main');
    if (!geometryMain) return;

    geometryMain.querySelectorAll('.outline-title').forEach((title) => {
        if (title.textContent.trim().startsWith('#')) {
            title.setAttribute('data-is-topic', 'true');
        }
    });
}

function initializeModeUi({ CONSTANTS, timeSetterWrapper }) {
    timeSetterWrapper.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);
    document
        .getElementById('hard-core-description')
        ?.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);

    document
        .querySelector('.mode-btn-group')
        ?.setAttribute('data-selected', CONSTANTS.MODES.NORMAL);
}

function selectInitialSubjectGroup(CONSTANTS, groupName) {
    document
        .querySelectorAll('.subject-btn[data-subject-group]')
        .forEach((button) => {
            button.classList.toggle(
                CONSTANTS.CSS_CLASSES.SELECTED,
                button.dataset.subjectGroup === groupName
            );
        });
}

export function initializeApp({
    CONSTANTS,
    adjustCreativeInputWidths,
    adjustCurriculumInputWidths,
    findSubjectGroupForSelection,
    fixSettingsPanelHeight,
    gameState,
    getDurationForTopic,
    openModal,
    renderTopicSelector,
    resetGame,
    setupCreativeQuestionTextReveal,
    startModal,
    storageManager,
    timeSetterWrapper,
    updateStartModalUI,
}) {
    const lastState = storageManager.restoreLastGameState();
    const initialSelection = findSubjectGroupForSelection(
        lastState.lastSubject,
        lastState.lastTopic
    );

    gameState.selectedTopic = initialSelection.topic;
    gameState.selectedSubject = initialSelection.subject;
    gameState.duration = getDurationForTopic(
        gameState.selectedTopic,
        CONSTANTS
    );

    resetGame(false);
    selectInitialSubjectGroup(CONSTANTS, initialSelection.groupName);
    renderTopicSelector(initialSelection.groupName, {
        subject: initialSelection.subject,
        topic: initialSelection.topic,
    });

    adjustCreativeInputWidths();
    adjustCurriculumInputWidths();
    setupCreativeQuestionTextReveal();
    updateStartModalUI();

    openModal(startModal);
    updateStartModalUI();
    fixSettingsPanelHeight();
    initializeModeUi({ CONSTANTS, timeSetterWrapper });

    requestAnimationFrame(() => {
        initializeGeometryFeatures();
    });
}
