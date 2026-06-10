import { createSpellingQuestionSet } from './spelling-quiz-data.js';
import {
    animateSpellingProgress,
    applySpellingChoiceResult,
    clearSpellingQuestionItems,
    getActiveSpellingTabTarget,
    isSpellingBlankMode as getIsSpellingBlankMode,
    renderSpellingQuestion as renderSpellingQuestionView,
    setSpellingDatasetSelectionVisible,
    showSpellingComboEffect,
    updateSpellingProgress as updateSpellingProgressView,
} from './spelling-quiz-view.js';
import {
    bindSpellingBackButton,
    showSpellingRoundComplete as showSpellingRoundCompleteView,
    showSpellingSessionControls,
} from './spelling-session-view.js';

export function createSpellingQuizController({
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
}) {
    let datasetButtonsBound = false;
    const backButtonState = { bound: false };

    function renderSpellingQuestion(questionData) {
        renderSpellingQuestionView({
            questionData,
            questionIndex: gameState.spelling.currentQuestionIndex,
            isAnswered: () => gameState.spelling.answered,
            isBlankMode: isSpellingBlankMode,
            onChoice: handleSpellingChoice,
        });
    }

    function handleSpellingChoice(
        clickedButton,
        correctAnswer,
        allButtons,
        questionItem
    ) {
        if (gameState.spelling.answered) return;

        gameState.spelling.answered = true;

        const selectedChoice = clickedButton.dataset.choice;
        const isCorrect = selectedChoice === correctAnswer;

        applySpellingChoiceResult({
            clickedButton,
            correctAnswer,
            allButtons,
            questionItem,
            isCorrect,
        });

        if (isCorrect) {
            gameState.spelling.score++;
            playSound(successAudio);
            gameState.combo++;
            setCharacterState('happy', 1500);

            if (gameState.gameMode === CONSTANTS.MODES.HARD_CORE) {
                gameState.total = Math.min(
                    gameState.total + CONSTANTS.HARD_CORE_TIME_BONUS,
                    CONSTANTS.HARD_CORE_DURATION
                );
            }

            showSpellingComboEffect(gameState.combo);
        } else {
            playSound(failAudio);
            gameState.combo = 0;
            setCharacterState('sad', 1500);
        }

        updateMushroomGrowth();
        setTimeout(nextSpellingQuestion, 800);
    }

    function updateSpellingProgress() {
        updateSpellingProgressView({
            currentQuestionIndex: gameState.spelling.currentQuestionIndex,
            totalQuestions: gameState.spelling.questions.length,
        });
    }

    function nextSpellingQuestion() {
        gameState.spelling.currentQuestionIndex++;
        gameState.spelling.answered = false;

        animateSpellingProgress();
        updateSpellingProgress();

        if (
            gameState.spelling.currentQuestionIndex >=
            gameState.spelling.questions.length
        ) {
            showSpellingRoundComplete();
            return;
        }

        renderSpellingQuestion(
            gameState.spelling.questions[
                gameState.spelling.currentQuestionIndex
            ]
        );
    }

    function updateSpellingResultsToProgress() {
        const currentScore = gameState.spelling.score;
        const totalQuestions = gameState.spelling.questions.length;

        saveDailyStats(currentScore);
        updateHeatmapTitle(getDailyStats(30));
        addResultProgress(currentScore, totalQuestions);
    }

    function showSpellingRoundComplete() {
        updateSpellingResultsToProgress();
        showSpellingRoundCompleteView({
            onRestart: startNewSpellingRound,
        });
    }

    function startNewSpellingRound() {
        if (!clearSpellingQuestionItems()) return;

        gameState.spelling.questions = createSpellingQuestionSet(
            gameState.spelling.selectedDataset
        );
        gameState.spelling.currentQuestionIndex = 0;
        gameState.spelling.score = 0;
        gameState.spelling.answered = false;

        updateSpellingProgress();
        renderSpellingQuestion(gameState.spelling.questions[0]);
    }

    function isSpellingBlankMode() {
        return getIsSpellingBlankMode();
    }

    function initializeSpellingQuiz() {
        if (getActiveSpellingTabTarget() === 'spelling-blank') return;

        showSpellingDatasetSelection();
    }

    function bindDatasetButtons() {
        if (datasetButtonsBound) return;

        document.querySelectorAll('.dataset-btn').forEach((button) => {
            button.addEventListener('click', () => {
                startSpellingQuizWithDataset(button.dataset.dataset);
            });
        });

        datasetButtonsBound = true;
    }

    function showSpellingDatasetSelection() {
        setSpellingDatasetSelectionVisible({ visible: true });
        bindDatasetButtons();
    }

    function bindBackButton() {
        bindSpellingBackButton({
            onBack: showSpellingDatasetSelection,
            state: backButtonState,
        });
    }

    function startSpellingQuizWithDataset(dataset) {
        gameState.spelling.selectedDataset = dataset || 'basic';
        resetResultProgress();

        gameState.total =
            gameState.gameMode === CONSTANTS.MODES.HARD_CORE
                ? CONSTANTS.HARD_CORE_DURATION
                : gameState.duration;

        showSpellingSessionControls({
            CONSTANTS,
            comboCounter,
            forceQuitBtn,
            formatTime,
            gameState,
            resetBtn,
        });

        if (gameState.timerId === null) {
            gameState.timerId = setInterval(tick, 1000);
        }

        setCharacterState('idle');

        if (gameState.gameMode === CONSTANTS.MODES.HARD_CORE) {
            character?.classList.add('devil-mode');
        }

        setSpellingDatasetSelectionVisible({ visible: false });

        bindBackButton();
        startNewSpellingRound();
    }

    return {
        initializeSpellingQuiz,
        isSpellingBlankMode,
        showSpellingDatasetSelection,
        startNewSpellingRound,
        startSpellingQuizWithDataset,
    };
}
