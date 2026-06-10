import { removeQuestionRecord } from './storage-answer-records.js';

export function clearStoredAnswerHistory({
    input,
    gameState,
    generateQuestionId,
    storageManager,
}) {
    const questionId = generateQuestionId(input);
    const { selectedSubject, selectedTopic } = gameState;

    const wrongAnswers = removeQuestionRecord(
        storageManager.getWrongAnswers(),
        selectedSubject,
        selectedTopic,
        questionId
    );
    const correctAnswers = removeQuestionRecord(
        storageManager.getCorrectAnswers(),
        selectedSubject,
        selectedTopic,
        questionId
    );

    storageManager.setItem(
        storageManager.storageKeys.WRONG_ANSWERS,
        wrongAnswers
    );
    storageManager.setItem(
        storageManager.storageKeys.CORRECT_ANSWERS,
        correctAnswers
    );
}
