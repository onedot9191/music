export function bindTimeSettingEvents({
    clickAudio,
    decreaseTimeBtn,
    gameState,
    increaseTimeBtn,
    playSound,
    updateTimeSettingDisplay,
}) {
    decreaseTimeBtn?.addEventListener('click', () => {
        setTimeout(() => playSound(clickAudio), 0);

        if (gameState.duration <= 60) return;

        gameState.duration -= 300;
        gameState.normalModeDuration = gameState.duration;
        updateTimeSettingDisplay();
    });

    increaseTimeBtn?.addEventListener('click', () => {
        setTimeout(() => playSound(clickAudio), 0);

        if (gameState.duration >= 7200) return;

        gameState.duration += 300;
        gameState.normalModeDuration = gameState.duration;
        updateTimeSettingDisplay();
    });
}
