// 모듈 임포트
import { StorageManager } from './modules/storage.js';
import { CONSTANTS, SUBJECT_NAMES, TOPIC_NAMES } from './modules/constants.js';
import { AudioManager } from './modules/audio.js';
import { createAudioPlaybackController } from './modules/audio-playback-controller.js';
import { createAudioRefs } from './modules/audio-refs.js';
import { createDailyBlankCountController } from './modules/daily-blank-count-controller.js';
import { formatTime } from './modules/utils.js';
import {
    focusNextAvailableInput,
    isSectionComplete,
    randomInRange,
    stripModelWord,
} from './modules/game-utils.js';
import { createAppRuntimeHelpers } from './modules/app-runtime-helpers.js';
import { createDDayRenderer } from './modules/dday.js';
import { createModalManager } from './modules/modal.js?v=devil-redesign-1';
import { initializeApp } from './modules/app-initializer.js';
import { createDomRefs } from './modules/dom-elements.js';
import { loadQuizPartials } from './modules/quiz-partial-loader.js';
import {
    createGameState,
    createInitialSpellingState,
    createSpecialSubjects,
} from './modules/game-state.js';
import {
    SUBJECT_TOPIC_MAPPING,
    TOPIC_SUBMENU_IDS,
    createTopicSubmenuVisibility,
    findSubjectGroupForSelection,
    getDurationForTopic,
    hideTopicSubmenus,
    showTopicSubmenus,
} from './modules/subject-topics.js';
import {
    MODEL_GATE_CONFIGS,
    MODEL_NEXT_BUTTON_CONFIGS,
    applyInitialModelGate,
    createModelConfigBySubject,
    unlockOtherModelSections,
} from './modules/model-gating.js';
import { shouldUseAdaptiveInputWidth } from './modules/input-width-policy.js';
import { createSectionGroups } from './modules/section-groups.js';
import { createGameSessionController } from './modules/game-session-controller.js';
import { createStartModalController } from './modules/start-modal-controller.js';
import { createSpellingQuizController } from './modules/spelling-quiz.js';
import { createLayoutAdjustments } from './modules/layout-adjustments.js';
import { createSlotMachineController } from './modules/slot-machine-controller.js';
import { createTypewriterEffect } from './modules/typewriter-effect.js';
import { createCharacterStateController } from './modules/character-state.js?v=devil-redesign-1';
import { createProgressModalController } from './modules/progress-modal-controller.js?v=devil-redesign-1';
import { createAnswerFeedbackController } from './modules/answer-feedback-controller.js';
import { createStageCompletionScheduler } from './modules/stage-completion-scheduler.js';
import { createStageClearController } from './modules/stage-clear-controller.js';
import { createStageNavigationController } from './modules/stage-navigation-controller.js';
import { createGameTimerController } from './modules/game-timer-controller.js';
import { createWrongAnswerTracker } from './modules/wrong-answer-tracker.js';
import { bindAppEvents } from './modules/app-event-bindings.js';
import {
    createParticleEffects,
    getMotionPreferences,
} from './modules/visual-effects.js';
import { getAnswerCandidates } from './modules/answer-candidates.js';
import { scheduleInitialInputWidthSetup } from './modules/input-width-bootstrap.js';
import {
    bindOverviewStyleRefresh,
    refreshOverviewStyles,
} from './modules/ui-styling.js';
import {
    addResultProgress,
    calculatePercentage,
    readResultProgress,
    resetResultProgress,
    setResultProgress,
} from './modules/result-progress.js';
import {
    revealCurrentCompetencyAnswers,
    revealSectionAnswers,
} from './modules/answer-reveal.js';
import {
    isGenericModelTitleInput,
    isIntegratedTitleInput,
    isPracticalTitleInput,
} from './modules/section-matchers.js';
import {
    gradeDirectAnswer,
    gradeGroupedAnswer,
    isGroupedGradingInput,
} from './modules/answer-grading.js';
import {
    createAnswerInputController,
    isIgnoreOrderScope,
} from './modules/answer-input-controller.js';
import {
    saveDailyStats,
    saveSubjectAccuracy,
    getSubjectAccuracy,
    checkSubjectAccuracyThreshold,
    markSubjectAccuracyAchieved,
    checkSubjectAccuracyAchieved,
    getDailyStats,
    updateHeatmapTitle,
    renderHeatmap,
    render6MonthHeatmap,
    getTodayBlankCount,
} from './modules/stats-manager.js';

document.addEventListener('DOMContentLoaded', async () => {
    await loadQuizPartials();

    // --- 오디오 관리자 ---
    // AudioManager는 오디오 컨텍스트와 오디오 잠금 해제를 자동으로 처리합니다
    const audioManager = new AudioManager();
    const { playSound } = createAudioPlaybackController({ audioManager });

    // --- 상수 ---
    // CONSTANTS, SUBJECT_NAMES, TOPIC_NAMES는 modules/constants.js에서 import됨
    // 맞춤법 데이터는 modules/spelling-quiz.js가 modules/spelling-data.js에서 가져옴

    scheduleInitialInputWidthSetup();

    // --- 게임 상태 ---

    const gameState = createGameState(CONSTANTS);

    // --- 저장소 관리자 ---
    const storageManager = new StorageManager();

    const SPECIAL_SUBJECTS = createSpecialSubjects(CONSTANTS);

    // 역량/영역 섹션에서 일치된 답변 추적용

    let scheduleSectionCompletion = () => {};

    // --- DOM 요소 ---

    const {
        timeEl,
        barEl,
        comboCounter,
        startGameBtn,
        forceQuitBtn,
        resetBtn,
        character,
        headerTitle,
        stageClearModal,
        progressModal,
        closeProgressModalBtn,
        scrapResultImageBtn,
        scrapResultImageBtnTop,
        startModal,
        settingsPanel,
        timeSettingDisplay,
        decreaseTimeBtn,
        increaseTimeBtn,
        timeSetterWrapper,
        modeSelector,
        topicSelector,
        subjectSelector,
        subjectSelectionTitle,
        topicSelectionTitle,
        curriculumBreak,
        modelBreak,
        quizContainers,
        modalCharacterPlaceholder,
        speechBubble,
        resultDialogue,
        resultTitle,
        resultSubject,
        resultTopic,
        resultProgress,
        resultPercentage,
        slotMachineEl,
        slotReels,
    } = createDomRefs();

    const SECTION_GROUPS = createSectionGroups(CONSTANTS);

    // --- Overview (총론) 계층 들여쓰기 적용 ---

    refreshOverviewStyles(gameState, CONSTANTS);
    bindOverviewStyleRefresh(gameState, CONSTANTS);

    // --- 모달 포커스 헬퍼 ---
    const { openModal, closeModal, focusModal } = createModalManager();

    // --- 오디오 ---
    // AudioManager를 사용하므로 중복 코드 제거
    // 호환성을 위해 기존 변수명 유지 (AudioManager의 audioElements 참조)
    const {
        successAudio,
        timeupAudio,
        startAudio,
        failAudio,
        clearAudio,
        randomAudio,
        clickAudio,
        slotWinAudio,
        specialBlankAudio,
    } = createAudioRefs(audioManager);

    // --- 유틸리티 함수 ---
    // formatTime은 modules/utils.js에서 import됨

    const { setCharacterState, updateMushroomGrowth } =
        createCharacterStateController({
            CONSTANTS,
            character,
            gameState,
        });

    let initializeSpellingQuiz = () => {};
    let isSpellingBlankMode = () => false;

    const { updateTodayBlankCount } = createDailyBlankCountController({
        audioManager,
        gameState,
        getTodayBlankCount,
        playSound,
        specialBlankAudio,
    });

    // --- D-DAY ---
    // D-Day 렌더링 함수는 modules/dday.js에서 import됨
    const renderDDay = createDDayRenderer();

    const {
        checkStageClear,
        finishQuizIfComplete,
        getMainElementId,
        getUsedAnswersMap,
        normalizeAnswer,
        resetUsedAnswers,
        setTimerController,
        tick,
    } = createAppRuntimeHelpers({
        CONSTANTS,
        gameState,
        isSpellingBlankMode: () => isSpellingBlankMode(),
    });

    ({ initializeSpellingQuiz, isSpellingBlankMode } =
        createSpellingQuizController({
            CONSTANTS,
            addResultProgress,
            character,
            comboCounter,
            failAudio,
            forceQuitBtn,
            formatTime,
            gameState,
            getDailyStats,
            playSound,
            resetBtn,
            resetResultProgress,
            saveDailyStats,
            setCharacterState,
            successAudio,
            tick,
            updateHeatmapTitle,
            updateMushroomGrowth,
        }));

    const { typewriter } = createTypewriterEffect({ gameState });

    const {
        renderTopicSelector,
        updateStartModalUI,
        updateSubjectButtonStates,
        updateTimeSettingDisplay,
    } = createStartModalController({
        CONSTANTS,
        SUBJECT_TOPIC_MAPPING,
        checkSubjectAccuracyAchieved,
        checkSubjectAccuracyThreshold,
        createTopicSubmenuVisibility,
        formatTime,
        gameState,
        getDailyStats,
        getDurationForTopic,
        hideTopicSubmenus,
        renderDDay,
        renderHeatmap,
        showTopicSubmenus,
        timeSettingDisplay,
        topicSelectionTitle,
        topicSelector,
    });

    const { showProgress } = createProgressModalController({
        CONSTANTS,
        SUBJECT_NAMES,
        TOPIC_NAMES,
        calculatePercentage,
        character,
        gameState,
        getDailyStats,
        getMainElementId,
        isSpellingBlankMode,
        markSubjectAccuracyAchieved,
        modalCharacterPlaceholder,
        openModal,
        progressModal,
        readResultProgress,
        resultDialogue,
        resultSubject,
        resultTitle,
        resultTopic,
        saveSubjectAccuracy,
        setResultProgress,
        speechBubble,
        typewriter,
        updateHeatmapTitle,
        updateSubjectButtonStates,
        updateTodayBlankCount,
    });

    const {
        generateQuestionId,
        trackWrongAnswer,
        updateWrongAnswerIndicators,
        updateWrongAnswerIndicatorsImmediate,
    } = createWrongAnswerTracker({
        gameState,
        getMainElementId,
        storageManager,
    });

    const motionPreferences = getMotionPreferences();
    const { spawnComboConfetti, spawnTypingParticles } =
        createParticleEffects(motionPreferences);

    const {
        adjustBasicTopicInputWidths,
        adjustCreativeInputWidths,
        adjustCurriculumInputWidths,
        adjustEnglishInputWidths,
        fixSettingsPanelHeight,
        refreshAdaptiveInputWidths,
        setupCreativeQuestionTextReveal,
        shuffleSocialityFunctionList,
        wrapScienceInquiryActivities,
    } = createLayoutAdjustments({
        CONSTANTS,
        gameState,
        getMainElementId,
        isSpellingBlankMode,
        settingsPanel,
        shouldUseAdaptiveInputWidth,
    });

    const slotMachine = createSlotMachineController({
        CONSTANTS,
        playSound,
        slotMachineEl,
        slotReels,
        slotWinAudio,
    });

    const { advanceToNextStage, focusFirstInput, resetToFirstStage } =
        createStageNavigationController({
            CONSTANTS,
            SECTION_GROUPS,
            SPECIAL_SUBJECTS,
            gameState,
            getMainElementId,
            showProgress,
            shuffleSocialityFunctionList,
        });

    setTimerController(
        createGameTimerController({
            CONSTANTS,
            barEl,
            character,
            comboCounter,
            forceQuitBtn,
            formatTime,
            gameState,
            getMainElementId,
            headerTitle,
            playSound,
            setCharacterState,
            showProgress,
            slotMachine,
            timeEl,
            timeupAudio,
            updateMushroomGrowth,
        })
    );

    const {
        applyCorrectStreakEffects,
        applyWrongAttemptFeedback,
        clearStoredAnswerHistory,
        incrementTodayBlankCount,
        markSecondIncorrect,
        revealInputWithAdvance,
        shouldRevealSecondIncorrect,
    } = createAnswerFeedbackController({
        CONSTANTS,
        comboCounter,
        failAudio,
        focusNextAvailableInput,
        formatTime,
        gameState,
        generateQuestionId,
        headerTitle,
        playSound,
        saveDailyStats,
        scheduleSectionCompletion,
        setCharacterState,
        slotMachine,
        spawnComboConfetti,
        spawnTypingParticles,
        storageManager,
        successAudio,
        timeEl,
        trackWrongAnswer,
        updateMushroomGrowth,
        updateTodayBlankCount,
        updateWrongAnswerIndicatorsImmediate,
    });

    const { resetGame, startGame } = createGameSessionController({
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
    });

    const { celebrateCompetencySection, showStageClear } =
        createStageClearController({
            CONSTANTS,
            SECTION_GROUPS,
            advanceToNextStage,
            checkStageClear,
            clearAudio,
            closeModal,
            finishQuizIfComplete,
            gameState,
            getMainElementId,
            openModal,
            playSound,
            randomInRange,
            reducedMotion: motionPreferences.reducedMotion,
            setCharacterState,
            stageClearModal,
            tick,
        });

    // 스테이지 클리어/역량 섹션 축하는 modules/stage-clear-controller.js에서 관리한다.

    ({ scheduleSectionCompletion } = createStageCompletionScheduler({
        CONSTANTS,
        SPECIAL_SUBJECTS,
        advanceToNextStage,
        celebrateCompetencySection,
        checkStageClear,
        createModelConfigBySubject,
        gameState,
        isSectionComplete,
        showStageClear,
        tick,
        unlockOtherModelSections,
    }));

    function revealCompetencyAnswers() {
        revealCurrentCompetencyAnswers({
            classes: CONSTANTS.CSS_CLASSES,
            getMainElementId,
            isIgnoreOrderScope,
            normalizeAnswer,
        });
    }

    const { handleInputChange } = createAnswerInputController({
        CONSTANTS,
        SPECIAL_SUBJECTS,
        applyCorrectStreakEffects,
        applyWrongAttemptFeedback,
        clearStoredAnswerHistory,
        finishQuizIfComplete,
        focusNextAvailableInput,
        gameState,
        getAnswerCandidates,
        gradeDirectAnswer,
        gradeGroupedAnswer,
        incrementTodayBlankCount,
        isGenericModelTitleInput,
        isGroupedGradingInput,
        isIntegratedTitleInput,
        isPracticalTitleInput,
        isSectionComplete,
        markSecondIncorrect,
        normalizeAnswer,
        playSound,
        revealInputWithAdvance,
        scheduleSectionCompletion,
        shouldRevealSecondIncorrect,
        stripModelWord,
        successAudio,
        updateWrongAnswerIndicatorsImmediate,
        usedAnswersMapRef: getUsedAnswersMap,
    });

    window.handleInputChange = handleInputChange;

    // 정답/오답 피드백 흐름은 modules/answer-feedback-controller.js에서 관리한다.

    bindAppEvents({
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
        sectionGroups: SECTION_GROUPS,
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
    });

    initializeApp({
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
    });
});
