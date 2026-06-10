import {
    isIntegratedModelInput,
    isIntegratedTitleInput,
    shouldShowRevealButtonForCourse,
    shouldShowRevealButtonForMain,
} from './section-matchers.js';
import { clearStoredAnswerHistory as clearStoredAnswerHistoryForInput } from './answer-history-cleanup.js';
import { showMiniRevealButton } from './answer-reveal-button.js';

export function createAnswerFeedbackController({
    CONSTANTS,
    comboAudio,
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
}) {
    function showRevealButtonForIntegrated(input) {
        showMiniRevealButton(input, markCorrectAndAdvance);
    }

    function revealInputWithAdvance(input, { showRevealButton = false } = {}) {
        input.value = input.dataset.answer;
        input.disabled = true;

        if (showRevealButton) {
            showRevealButtonForIntegrated(input);
        }

        return true;
    }

    function resetWrongComboUi() {
        gameState.combo = 0;
        comboCounter.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);
        headerTitle.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);
    }

    function applyWrongAttemptFeedback(input) {
        resetWrongComboUi();
        updateMushroomGrowth();
        playSound(failAudio);
        setCharacterState('sad');

        input.classList.add(CONSTANTS.CSS_CLASSES.SHAKE);
        input.addEventListener(
            'animationend',
            () => {
                input.classList.remove(CONSTANTS.CSS_CLASSES.SHAKE);
            },
            { once: true }
        );

        spawnTypingParticles(input, '#ff5733');
    }

    function markSecondIncorrect(input) {
        input.classList.remove(CONSTANTS.CSS_CLASSES.RETRYING);
        input.classList.add(CONSTANTS.CSS_CLASSES.INCORRECT);
        trackWrongAnswer(input);
        updateWrongAnswerIndicatorsImmediate();
    }

    function shouldRevealSecondIncorrect(
        input,
        { includeCourse = false, includeNonCurriculumTopic = false } = {}
    ) {
        if (isIntegratedModelInput(input) && !isIntegratedTitleInput(input)) {
            return true;
        }

        if (shouldShowRevealButtonForMain(input)) {
            return true;
        }

        if (includeCourse && shouldShowRevealButtonForCourse(input)) {
            return true;
        }

        return (
            includeNonCurriculumTopic &&
            gameState.selectedTopic !== CONSTANTS.TOPICS.CURRICULUM &&
            gameState.selectedTopic !== CONSTANTS.TOPICS.COMPETENCY &&
            gameState.selectedTopic !== CONSTANTS.TOPICS.MORAL
        );
    }

    function incrementTodayBlankCount() {
        saveDailyStats(1);
        updateTodayBlankCount();
    }

    function clearStoredAnswerHistory(input) {
        clearStoredAnswerHistoryForInput({
            input,
            gameState,
            generateQuestionId,
            storageManager,
        });
    }

    function refreshComboDisplay() {
        if (gameState.combo <= 1) return;

        headerTitle.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);
        comboCounter.textContent = `COMBO x${gameState.combo}`;
        comboCounter.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);
        comboCounter.classList.remove(CONSTANTS.CSS_CLASSES.COMBO_POP);

        void comboCounter.offsetWidth;

        comboCounter.classList.add(CONSTANTS.CSS_CLASSES.COMBO_POP);
    }

    function applyCorrectStreakEffects(input, { particles = true } = {}) {
        gameState.combo++;
        setCharacterState('happy');
        updateMushroomGrowth();
        slotMachine.stopNext();

        if (gameState.gameMode === CONSTANTS.MODES.HARD_CORE) {
            gameState.total += CONSTANTS.HARD_CORE_TIME_BONUS;
            timeEl.textContent = formatTime(gameState.total);
        }

        refreshComboDisplay();

        if (!particles) return;

        spawnTypingParticles(input, '#39ff14');

        if (gameState.combo >= 5 && gameState.combo % 5 === 0) {
            if (comboAudio) {
                playSound(comboAudio);
            }

            spawnComboConfetti(input);
        }
    }

    function markCorrectAndAdvance(input) {
        const section = input.closest('section');

        playSound(successAudio);
        input.classList.remove(
            CONSTANTS.CSS_CLASSES.INCORRECT,
            CONSTANTS.CSS_CLASSES.RETRYING
        );
        input.classList.add(CONSTANTS.CSS_CLASSES.CORRECT);
        input.classList.remove('wrong-answer-indicator');

        storageManager.saveCorrectAnswer(
            gameState.selectedSubject,
            gameState.selectedTopic,
            generateQuestionId(input)
        );

        updateWrongAnswerIndicatorsImmediate();

        input.value = input.dataset.answer;
        input.disabled = true;

        incrementTodayBlankCount();
        applyCorrectStreakEffects(input, { particles: false });
        scheduleSectionCompletion(section);
        focusNextAvailableInput(input);
    }

    return {
        applyCorrectStreakEffects,
        applyWrongAttemptFeedback,
        clearStoredAnswerHistory,
        incrementTodayBlankCount,
        markCorrectAndAdvance,
        markSecondIncorrect,
        revealInputWithAdvance,
        shouldRevealSecondIncorrect,
    };
}
