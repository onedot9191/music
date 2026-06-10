export function bindModeSelectionEvents({
    CONSTANTS,
    clickAudio,
    gameState,
    modeSelector,
    playSound,
    timeSetterWrapper,
    updateTimeSettingDisplay,
}) {
    modeSelector?.addEventListener('click', (event) => {
        if (!event.target.matches('.btn')) return;

        setTimeout(() => playSound(clickAudio), 0);

        if (
            gameState.gameMode === CONSTANTS.MODES.NORMAL &&
            event.target.dataset.mode === CONSTANTS.MODES.HARD_CORE
        ) {
            gameState.normalModeDuration = gameState.duration;
        }

        gameState.gameMode = event.target.dataset.mode;

        requestAnimationFrame(() => {
            document
                .querySelectorAll('.mode-btn')
                .forEach((button) =>
                    button.classList.remove(CONSTANTS.CSS_CLASSES.SELECTED)
                );
            event.target.classList.add(CONSTANTS.CSS_CLASSES.SELECTED);

            const modeBtnGroup = document.querySelector('.mode-btn-group');
            modeBtnGroup?.setAttribute('data-selected', gameState.gameMode);

            const hardCoreDescription = document.getElementById(
                'hard-core-description'
            );

            if (gameState.gameMode === CONSTANTS.MODES.NORMAL) {
                timeSetterWrapper.classList.remove(
                    CONSTANTS.CSS_CLASSES.HIDDEN
                );
                hardCoreDescription?.classList.add(
                    CONSTANTS.CSS_CLASSES.HIDDEN
                );
                gameState.duration = gameState.normalModeDuration;
                updateTimeSettingDisplay();
                return;
            }

            timeSetterWrapper.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);
            hardCoreDescription?.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);
        });
    });
}
