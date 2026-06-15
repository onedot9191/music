import { configureSessionTimer } from './game-session-start.js';
import {
    clearCompetencyClearedState,
    clearSpellingQuestionsList,
    hideQuizContainers,
    hideTodayBlankCount,
    resetAllAnswerInputs,
    resetStartModalEthicsState,
    syncVisibleStartModalSelection,
} from './game-session-reset.js';

export function createGameSessionController({
    CONSTANTS,
    SUBJECT_NAMES,
    SUBJECT_TOPIC_MAPPING,
    adjustBasicTopicInputWidths,
    adjustCreativeInputWidths,
    adjustCurriculumInputWidths,
    adjustEnglishInputWidths,
    applyInitialModelGate,
    barEl,
    character,
    closeModal,
    comboCounter,
    createInitialSpellingState,
    createModelConfigBySubject,
    fixSettingsPanelHeight,
    focusFirstInput,
    forceQuitBtn,
    formatTime,
    gameState,
    getMainElementId,
    headerTitle,
    initializeSpellingQuiz,
    isSpellingBlankMode,
    openModal,
    playSound,
    quizContainers,
    refreshAdaptiveInputWidths,
    resetResultProgress,
    resetToFirstStage,
    resetBtn,
    resetUsedAnswers,
    scrapResultImageBtnTop,
    setCharacterState,
    setupCreativeQuestionTextReveal,
    shouldUseAdaptiveInputWidth,
    slotMachine,
    startAudio,
    startModal,
    storageManager,
    tick,
    timeEl,
    timeSettingDisplay,
    updateMushroomGrowth,
    updateStartModalUI,
    updateWrongAnswerIndicators,
    wrapScienceInquiryActivities,
}) {
    function resetGame(showStartModal = true) {
        clearInterval(gameState.timerId);
        gameState.timerId = null;

        hideTodayBlankCount();
        hideQuizContainers(quizContainers, CONSTANTS);

        resetAllAnswerInputs(CONSTANTS);
        resetUsedAnswers();

        gameState.combo = 0;
        updateMushroomGrowth();
        resetResultProgress();
        gameState.spelling = createInitialSpellingState();

        clearSpellingQuestionsList();

        headerTitle.textContent = '아웃풋';
        headerTitle.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);
        comboCounter.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);
        scrapResultImageBtnTop.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);
        resetBtn.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);
        forceQuitBtn.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);

        document
            .getElementById('timer-container')
            .classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);

        clearCompetencyClearedState();

        if (showStartModal) {
            resetStartModalEthicsState({ CONSTANTS, gameState });
            syncVisibleStartModalSelection({
                SUBJECT_TOPIC_MAPPING,
                gameState,
            });

            openModal(startModal);
            updateStartModalUI();
            adjustCreativeInputWidths();
            setupCreativeQuestionTextReveal();
            adjustEnglishInputWidths();
            adjustBasicTopicInputWidths();
            adjustCurriculumInputWidths();
            fixSettingsPanelHeight();
        }

        setCharacterState('idle');
        slotMachine.reset();
    }

    function startGame() {
        gameState.lastSpecialPopupCount = 0;
        storageManager?.saveLastGameState(gameState);

        playSound(startAudio);
        closeModal(startModal);

        headerTitle.textContent =
            SUBJECT_NAMES[gameState.selectedSubject] || '퀴즈';

        const mainId = getMainElementId();
        const mainEl = document.getElementById(mainId);

        mainEl.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);

        resetToFirstStage(gameState.selectedSubject);

        document
            .querySelectorAll(`#${mainId} input[data-answer]`)
            .forEach((input) => {
                input.disabled = false;
            });

        if (mainEl) {
            delete mainEl.dataset.answersRevealed;
        }

        updateWrongAnswerIndicators();

        if (gameState.selectedSubject !== CONSTANTS.SUBJECTS.SPELLING) {
            resetResultProgress();
        }

        if (
            shouldUseAdaptiveInputWidth(
                gameState.selectedSubject,
                CONSTANTS,
                isSpellingBlankMode
            )
        ) {
            if (gameState.selectedSubject === CONSTANTS.SUBJECTS.SCIENCE_STD) {
                wrapScienceInquiryActivities();
            }

            refreshAdaptiveInputWidths({ includeCurriculum: false });
        } else if (
            gameState.selectedSubject === CONSTANTS.SUBJECTS.ENGLISH &&
            gameState.selectedTopic === CONSTANTS.TOPICS.BASIC
        ) {
            adjustEnglishInputWidths();
        } else if (gameState.selectedSubject === CONSTANTS.SUBJECTS.SPELLING) {
            initializeSpellingQuiz();
        }

        adjustBasicTopicInputWidths();
        adjustCurriculumInputWidths();

        if (gameState.selectedTopic === CONSTANTS.TOPICS.MODEL) {
            const modelGateConfig =
                createModelConfigBySubject(CONSTANTS)[
                    gameState.selectedSubject
                ];

            if (modelGateConfig) {
                applyInitialModelGate(
                    document.getElementById(modelGateConfig.mainId),
                    modelGateConfig.titleId
                );
            }
        }

        forceQuitBtn.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);

        configureSessionTimer({
            CONSTANTS,
            barEl,
            formatTime,
            gameState,
            tick,
            timeEl,
            timeSettingDisplay,
        });

        setCharacterState('idle');

        if (gameState.gameMode === CONSTANTS.MODES.HARD_CORE) {
            character.classList.add('devil-mode');
        }

        const activeSection = document.querySelector(
            `#${mainId} section.active`
        );
        if (activeSection) focusFirstInput(activeSection);

        slotMachine.start();
    }

    return {
        resetGame,
        startGame,
    };
}
