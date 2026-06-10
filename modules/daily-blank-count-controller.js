export function createDailyBlankCountController({
    audioManager,
    gameState,
    getTodayBlankCount,
    playSound,
    specialBlankAudio,
}) {
    function showSpecialBlankCountPopup(count) {
        const existingPopup = document.getElementById(
            'special-blank-count-popup'
        );
        if (existingPopup) {
            existingPopup.remove();
        }

        gameState.lastSpecialPopupCount = count;

        const specialPopup = document.createElement('div');
        specialPopup.id = 'special-blank-count-popup';
        specialPopup.className = 'special-blank-count-popup';
        specialPopup.innerHTML = `
                오늘 푼 빈칸 <span class="special-count-highlight">${count}</span>개 돌파!
                <div class="special-popup-sparkles">
                    <div class="sparkle"></div>
                    <div class="sparkle"></div>
                    <div class="sparkle"></div>
                    <div class="sparkle"></div>
                    <div class="sparkle"></div>
                    <div class="sparkle"></div>
                </div>
            `;

        document.body.appendChild(specialPopup);

        audioManager.stopAllAudio();
        playSound(specialBlankAudio);

        setTimeout(() => {
            if (specialPopup.parentNode) {
                specialPopup.parentNode.removeChild(specialPopup);
            }
        }, 3000);
    }

    function updateTodayBlankCount() {
        try {
            const count = getTodayBlankCount();
            const countEl = document.getElementById('today-blank-count-number');

            if (countEl) {
                countEl.textContent = String(count);
            }

            if (
                count > 0 &&
                count % 50 === 0 &&
                count !== gameState.lastSpecialPopupCount &&
                !gameState.isForceQuit
            ) {
                showSpecialBlankCountPopup(count);
            }

            if (gameState.isForceQuit) {
                gameState.isForceQuit = false;
            }
        } catch (error) {
            console.warn('Failed to update today blank count:', error);
            const countEl = document.getElementById('today-blank-count-number');
            if (countEl) {
                countEl.textContent = '0';
            }
        }
    }

    return {
        showSpecialBlankCountPopup,
        updateTodayBlankCount,
    };
}
