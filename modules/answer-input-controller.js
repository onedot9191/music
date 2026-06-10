import { gradeInputAnswer, isIgnoreOrderScope } from './answer-input-grader.js';
import { isCurriculumOrderEditingInput } from './curriculum-order-editor.js';
import {
    markInputAsNonRetryableIncorrect,
    markInputCorrect,
    markInputRetrying,
} from './answer-input-feedback.js';

export { isIgnoreOrderScope };

export function createAnswerInputController({
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
    usedAnswersMapRef,
}) {
    function gradeInput({ input, section, userAnswer }) {
        return gradeInputAnswer({
            CONSTANTS,
            SPECIAL_SUBJECTS,
            gameState,
            gradeDirectAnswer,
            gradeGroupedAnswer,
            getAnswerCandidates,
            input,
            normalizeAnswer,
            section,
            sectionMatchers: {
                isGenericModelTitleInput,
                isGroupedGradingInput,
                isIntegratedTitleInput,
                isPracticalTitleInput,
            },
            stripModelWord,
            usedAnswersMap: usedAnswersMapRef(),
            userAnswer,
        });
    }

    function applyCorrectAnswer(input, displayAnswer) {
        playSound(successAudio);
        markInputCorrect({
            CONSTANTS,
            clearStoredAnswerHistory,
            displayAnswer,
            input,
            updateWrongAnswerIndicatorsImmediate,
        });

        incrementTodayBlankCount();
        applyCorrectStreakEffects(input);

        return true;
    }

    function applyIncorrectAnswer(input) {
        applyWrongAttemptFeedback(input);

        if (
            SPECIAL_SUBJECTS.has(gameState.selectedSubject) ||
            isIntegratedTitleInput(input) ||
            isPracticalTitleInput(input) ||
            isGenericModelTitleInput(input)
        ) {
            markInputAsNonRetryableIncorrect(CONSTANTS, input);
            return false;
        }

        if (input.classList.contains(CONSTANTS.CSS_CLASSES.RETRYING)) {
            markSecondIncorrect(input);

            if (
                shouldRevealSecondIncorrect(input, {
                    includeCourse: true,
                    includeNonCurriculumTopic: true,
                })
            ) {
                return revealInputWithAdvance(input, {
                    showRevealButton: true,
                });
            }

            return revealInputWithAdvance(input);
        }

        markInputRetrying(CONSTANTS, input);

        return false;
    }

    function handleInputChange(event) {
        const input = event.target;

        if (
            !input.matches('input[data-answer]') ||
            input.disabled ||
            input.dataset.autoFocused === 'true' ||
            isCurriculumOrderEditingInput(input)
        ) {
            return;
        }

        const section = input.closest('section');
        const userAnswer = normalizeAnswer(input.value);

        if (!userAnswer && !event.allowEmptyAnswer) {
            return;
        }

        const result = gradeInput({ input, section, userAnswer });
        const shouldAdvance = result.isCorrect
            ? applyCorrectAnswer(input, result.displayAnswer)
            : applyIncorrectAnswer(input);

        if (shouldAdvance && isSectionComplete(section)) {
            scheduleSectionCompletion(section);
        }

        if (shouldAdvance) {
            focusNextAvailableInput(input);
        }

        finishQuizIfComplete();
    }

    return {
        handleInputChange,
    };
}
