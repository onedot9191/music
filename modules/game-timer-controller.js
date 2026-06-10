export function createGameTimerController({
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
}) {
    function handleGameOver() {
        clearInterval(gameState.timerId);
        gameState.timerId = null;

        const mainId = getMainElementId();
        document
            .querySelectorAll(`#${mainId} input[data-answer]`)
            .forEach((input) => {
                input.disabled = true;
            });

        playSound(timeupAudio);

        gameState.combo = 0;
        updateMushroomGrowth();
        headerTitle.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);
        comboCounter.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);
        forceQuitBtn.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);
        slotMachine.reset();
        setCharacterState('sad');
        showProgress();
    }

    function tick() {
        if (gameState.total <= 0) {
            handleGameOver();
            return;
        }

        gameState.total--;
        timeEl.textContent = formatTime(gameState.total);

        const currentDuration =
            gameState.gameMode === CONSTANTS.MODES.HARD_CORE
                ? CONSTANTS.HARD_CORE_DURATION
                : gameState.duration;

        barEl.style.width = `${(gameState.total / currentDuration) * 100}%`;

        if (
            gameState.total < 30 &&
            !character.classList.contains('happy') &&
            !character.classList.contains('sad') &&
            gameState.gameMode !== CONSTANTS.MODES.HARD_CORE
        ) {
            setCharacterState('worried', 1000);
        }
    }

    return {
        handleGameOver,
        tick,
    };
}
