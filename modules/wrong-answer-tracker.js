export function createWrongAnswerTracker({
    gameState,
    getMainElementId,
    storageManager,
}) {
    function generateQuestionId(input) {
        const section = input.closest('section');
        const sectionId = section ? section.id : 'unknown';
        const answer = input.dataset.answer || '';
        const inputIndex = Array.from(
            section?.querySelectorAll('input[data-answer]') || []
        ).indexOf(input);

        return `${sectionId}_${answer}_${inputIndex}`;
    }

    function trackWrongAnswer(input) {
        const questionId = generateQuestionId(input);
        const currentCount = storageManager.getWrongCount(
            gameState.selectedSubject,
            gameState.selectedTopic,
            questionId
        );
        const newCount = currentCount + 1;

        storageManager.saveWrongAnswer(
            gameState.selectedSubject,
            gameState.selectedTopic,
            questionId,
            newCount
        );

        return newCount;
    }

    function shouldShowWrongAnswerIndicator(input) {
        const questionId = generateQuestionId(input);

        if (
            storageManager.isAnsweredCorrectly(
                gameState.selectedSubject,
                gameState.selectedTopic,
                questionId
            )
        ) {
            return false;
        }

        return (
            storageManager.getWrongCount(
                gameState.selectedSubject,
                gameState.selectedTopic,
                questionId
            ) >= 1
        );
    }

    function updateWrongAnswerIndicators() {
        const mainId = getMainElementId();
        const inputs = document.querySelectorAll(
            `#${mainId} input[data-answer]`
        );

        inputs.forEach((input) => {
            if (shouldShowWrongAnswerIndicator(input)) {
                input.classList.add('wrong-answer-indicator');
            } else {
                input.classList.remove('wrong-answer-indicator');
            }
        });
    }

    function updateWrongAnswerIndicatorsImmediate() {
        requestAnimationFrame(() => {
            updateWrongAnswerIndicators();
        });
    }

    return {
        generateQuestionId,
        shouldShowWrongAnswerIndicator,
        trackWrongAnswer,
        updateWrongAnswerIndicators,
        updateWrongAnswerIndicatorsImmediate,
    };
}
