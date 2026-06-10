import { bindAccordionEvents } from './accordion-events.js';
import { bindAnswerInputHandlers } from './input-event-bindings.js';
import { bindGameControlEvents } from './game-control-events.js';
import { bindHeatmapModalEvents } from './heatmap-modal-events.js';
import { bindModeSelectionEvents } from './mode-selection-events.js';
import { bindModelNextEvents } from './model-next-events.js';
import { bindPracticalModalEvents } from './practical-modal-events.js';
import { bindResultImageActions } from './result-image-actions.js';
import { bindQuizTabEvents } from './tab-event-bindings.js';
import { bindStartModalSelectionEvents } from './start-modal-events.js';
import { bindTimeSettingEvents } from './time-setting-events.js';

function shouldRevealCompetencyAnswers({
    CONSTANTS,
    SPECIAL_SUBJECTS,
    gameState,
}) {
    return (
        SPECIAL_SUBJECTS.has(gameState.selectedSubject) ||
        (gameState.selectedTopic === CONSTANTS.TOPICS.MODEL &&
            gameState.selectedSubject ===
                CONSTANTS.SUBJECTS.INTEGRATED_MODEL) ||
        (gameState.selectedTopic === CONSTANTS.TOPICS.MODEL &&
            gameState.selectedSubject === CONSTANTS.SUBJECTS.SCIENCE)
    );
}

export function bindAppEvents({
    CONSTANTS,
    MODEL_GATE_CONFIGS,
    MODEL_NEXT_BUTTON_CONFIGS,
    SPECIAL_SUBJECTS,
    SUBJECT_TOPIC_MAPPING,
    TOPIC_SUBMENU_IDS,
    character,
    clickAudio,
    closeModal,
    closeProgressModalBtn,
    createTopicSubmenuVisibility,
    decreaseTimeBtn,
    focusFirstInput,
    forceQuitBtn,
    gameState,
    getDurationForTopic,
    getMainElementId,
    handleInputChange,
    hideTopicSubmenus,
    increaseTimeBtn,
    isIgnoreOrderScope,
    modeSelector,
    normalizeAnswer,
    openModal,
    playSound,
    progressModal,
    quizContainers,
    refreshAdaptiveInputWidths,
    render6MonthHeatmap,
    renderTopicSelector,
    resetBtn,
    resetGame,
    revealCompetencyAnswers,
    revealSectionAnswers,
    scrapResultImageBtn,
    scrapResultImageBtnTop,
    sectionGroups,
    showTopicSubmenus,
    startGame,
    startGameBtn,
    subjectSelector,
    tick,
    timeSetterWrapper,
    topicSelector,
    unlockOtherModelSections,
    updateStartModalUI,
    updateTimeSettingDisplay,
    updateTodayBlankCount,
    updateWrongAnswerIndicators,
}) {
    bindHeatmapModalEvents({ render6MonthHeatmap });
    bindPracticalModalEvents({ closeModal });

    bindStartModalSelectionEvents({
        CONSTANTS,
        SUBJECT_TOPIC_MAPPING,
        TOPIC_SUBMENU_IDS,
        clickAudio,
        createTopicSubmenuVisibility,
        gameState,
        getDurationForTopic,
        playSound,
        renderTopicSelector,
        showTopicSubmenus,
        startGame,
        subjectSelector,
        topicSelector,
        updateStartModalUI,
        updateWrongAnswerIndicators,
    });

    bindModeSelectionEvents({
        CONSTANTS,
        clickAudio,
        gameState,
        modeSelector,
        playSound,
        timeSetterWrapper,
        updateTimeSettingDisplay,
    });

    bindQuizTabEvents({
        CONSTANTS,
        MODEL_GATE_CONFIGS,
        clickAudio,
        focusFirstInput,
        playSound,
        refreshAdaptiveInputWidths,
        sectionGroups,
    });

    bindAccordionEvents({
        CONSTANTS,
        focusFirstInput,
    });

    bindAnswerInputHandlers({
        CONSTANTS,
        handleInputChange,
        roots: quizContainers,
    });

    bindGameControlEvents({
        CONSTANTS,
        TOPIC_SUBMENU_IDS,
        character,
        closeModal,
        closeProgressModalBtn,
        forceQuitBtn,
        gameState,
        getMainElementId,
        hideTopicSubmenus,
        progressModal,
        resetBtn,
        resetGame,
        revealCompetencyAnswers,
        scrapResultImageBtnTop,
        shouldRevealCompetencyAnswers: () =>
            shouldRevealCompetencyAnswers({
                CONSTANTS,
                SPECIAL_SUBJECTS,
                gameState,
            }),
        startGame,
        startGameBtn,
        tick,
        updateTodayBlankCount,
    });

    bindResultImageActions({
        CONSTANTS,
        closeModal,
        openModal,
        progressModal,
        scrapResultImageBtn,
        scrapResultImageBtnTop,
    });

    bindTimeSettingEvents({
        clickAudio,
        decreaseTimeBtn,
        gameState,
        increaseTimeBtn,
        playSound,
        updateTimeSettingDisplay,
    });

    bindModelNextEvents({
        CONSTANTS,
        MODEL_NEXT_BUTTON_CONFIGS,
        isIgnoreOrderScope,
        normalizeAnswer,
        revealSectionAnswers,
        unlockOtherModelSections,
    });
}
