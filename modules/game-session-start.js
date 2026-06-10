function findById(root, id) {
    return root.getElementById?.(id) || root.querySelector?.(`#${id}`);
}

export function parseTimeDisplay(text) {
    const [minutes = '0', seconds = '0'] = text.split(':');
    return parseInt(minutes, 10) * 60 + parseInt(seconds, 10);
}

export function configureSessionTimer({
    CONSTANTS,
    barEl,
    formatTime,
    gameState,
    root = document,
    tick,
    timeEl,
    timeSettingDisplay,
}) {
    const timerContainer = findById(root, 'timer-container');

    if (gameState.gameMode === CONSTANTS.MODES.HARD_CORE) {
        gameState.duration = CONSTANTS.HARD_CORE_DURATION;
        timerContainer?.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);
        timerContainer?.classList.add('hard-core-timer');
        barEl.style.display = 'none';
    } else {
        gameState.duration = parseTimeDisplay(timeSettingDisplay.textContent);
        timerContainer?.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);
        timerContainer?.classList.remove('hard-core-timer');
        barEl.style.display = 'block';
    }

    gameState.total = gameState.duration;
    timeEl.textContent = formatTime(gameState.total);
    barEl.style.width = '100%';

    if (gameState.timerId === null) {
        gameState.timerId = setInterval(tick, 1000);
    }
}

export function showSessionControls({
    CONSTANTS,
    comboCounter,
    forceQuitBtn,
    resetBtn,
    timerContainer,
}) {
    timerContainer?.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);
    comboCounter?.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);
    forceQuitBtn?.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);
    resetBtn?.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);
}
