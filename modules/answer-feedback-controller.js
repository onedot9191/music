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

    function getRevealAnswer(input) {
        const group = input.closest('[data-ignore-order]');

        if (!group) return input.dataset.answer;

        const inputs = Array.from(group.querySelectorAll('input[data-answer]'));
        const remainingAnswers = inputs.map(
            (candidate) => candidate.dataset.answer
        );

        inputs.forEach((candidate) => {
            const matchedAnswer = candidate.dataset.matchedAnswer;

            if (!matchedAnswer) return;

            const answerIndex = remainingAnswers.indexOf(matchedAnswer);

            if (answerIndex !== -1) {
                remainingAnswers.splice(answerIndex, 1);
            }
        });

        return remainingAnswers[0] || input.dataset.answer;
    }

    function revealInputWithAdvance(input, { showRevealButton = false } = {}) {
        const answer = getRevealAnswer(input);

        input.value = answer;
        input.disabled = true;

        if (input.closest('[data-ignore-order]')) {
            input.dataset.matchedAnswer = answer;
        }

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

        input.value = input.dataset.matchedAnswer || input.dataset.answer;
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
