function findById(root, id) {
    return root.getElementById?.(id) || root.querySelector?.(`#${id}`);
}

export function showSpellingSessionControls({
    CONSTANTS,
    comboCounter,
    forceQuitBtn,
    formatTime,
    gameState,
    resetBtn,
    root = document,
}) {
    const timerContainer = findById(root, 'timer-container');
    const timeEl = findById(root, 'time');
    const barEl = root.querySelector?.('#bar > div');

    timerContainer?.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);
    comboCounter?.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);
    forceQuitBtn?.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);
    resetBtn?.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);

    if (gameState.gameMode === CONSTANTS.MODES.HARD_CORE) {
        timerContainer?.classList.add('hard-core-timer');
    } else {
        timerContainer?.classList.remove('hard-core-timer');
    }

    if (timeEl) {
        timeEl.textContent = formatTime(gameState.total);
    }
    if (barEl) {
        barEl.style.width = '100%';
    }
}

export function showSpellingRoundComplete({
    onRestart,
    root = document,
    timeoutMs = 1200,
}) {
    const completedMessage = findById(root, 'spelling-completed-message');

    completedMessage?.classList.remove('hidden');
    completedMessage?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
    });

    setTimeout(() => {
        onRestart();
        completedMessage?.classList.add('hidden');
    }, timeoutMs);
}

export function bindSpellingBackButton({ onBack, root = document, state }) {
    if (state.bound) return;

    const backBtn = findById(root, 'spelling-back-btn');
    backBtn?.addEventListener('click', onBack);
    state.bound = true;
}
