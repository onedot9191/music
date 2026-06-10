// === APP RUNTIME HELPERS MODULE ===
// app.js의 엔트리 조립 중 필요한 런타임 참조와 작은 래퍼 함수를 묶는다.

import {
    checkStageClear as checkStageClearBase,
    getMainElementId as resolveMainElementId,
    isQuizComplete as isQuizCompleteBase,
    normalizeAnswer as normalizeGameAnswer,
} from './game-utils.js';

export function createAppRuntimeHelpers({
    CONSTANTS,
    gameState,
    isSpellingBlankMode,
}) {
    let usedAnswersMap = new WeakMap();
    let timerController = null;

    function setTimerController(controller) {
        timerController = controller;
    }

    function resetUsedAnswers() {
        usedAnswersMap = new WeakMap();
    }

    function getUsedAnswersMap() {
        return usedAnswersMap;
    }

    function normalizeAnswer(str) {
        return normalizeGameAnswer(str, gameState, isSpellingBlankMode);
    }

    function handleGameOver() {
        timerController?.handleGameOver();
    }

    function tick() {
        timerController?.tick();
    }

    function checkStageClear(sectionElement) {
        return checkStageClearBase(sectionElement, CONSTANTS.CSS_CLASSES);
    }

    function getMainElementId() {
        return resolveMainElementId(gameState);
    }

    function isQuizComplete() {
        return isQuizCompleteBase({ getMainElementId });
    }

    function finishQuizIfComplete() {
        if (!isQuizComplete()) return;

        if (gameState.timerId) {
            gameState.total = 0;
            tick();
        } else {
            handleGameOver();
        }
    }

    return {
        checkStageClear,
        finishQuizIfComplete,
        getMainElementId,
        getUsedAnswersMap,
        handleGameOver,
        normalizeAnswer,
        resetUsedAnswers,
        setTimerController,
        tick,
    };
}
