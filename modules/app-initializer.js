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

export function initializeApp({
    CONSTANTS,
    adjustCreativeInputWidths,
    adjustCurriculumInputWidths,
    fixSettingsPanelHeight,
    gameState,
    getDurationForTopic,
    openModal,
    resetGame,
    setupCreativeQuestionTextReveal,
    startModal,
    timeSetterWrapper,
    updateStartModalUI,
}) {
    gameState.selectedTopic = CONSTANTS.TOPICS.CURRICULUM;
    gameState.selectedSubject = CONSTANTS.SUBJECTS.MUSIC;
    gameState.duration = getDurationForTopic(
        gameState.selectedTopic,
        CONSTANTS
    );

    resetGame(false);

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
