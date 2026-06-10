function runClearConfetti({ duration, randomInRange, reducedMotion }) {
    if (reducedMotion) return null;

    const animationEnd = Date.now() + duration;
    const defaults = {
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 201,
    };

    let intervalId = null;

    intervalId = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            clearInterval(intervalId);
            return;
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
            ...defaults,
            particleCount,
            origin: {
                x: randomInRange(0.1, 0.3),
                y: Math.random() - 0.2,
            },
        });

        confetti({
            ...defaults,
            particleCount,
            origin: {
                x: randomInRange(0.7, 0.9),
                y: Math.random() - 0.2,
            },
        });
    }, 250);

    return intervalId;
}

function stopTimer(gameState) {
    if (gameState.timerId === null) return;

    clearInterval(gameState.timerId);
    gameState.timerId = null;
}

function resumeTimerIfNeeded({ gameState, tick }) {
    if (gameState.total > 0 && gameState.timerId === null) {
        gameState.timerId = setInterval(tick, 1000);
    }
}

export function createStageClearController({
    CONSTANTS,
    SECTION_GROUPS,
    advanceToNextStage,
    checkStageClear,
    clearAudio,
    closeModal,
    finishQuizIfComplete,
    gameState,
    getMainElementId,
    openModal,
    playSound,
    randomInRange,
    reducedMotion,
    setCharacterState,
    stageClearModal,
    tick,
}) {
    function showStageClear() {
        playSound(clearAudio);
        openModal(stageClearModal);
        setCharacterState('cheer', 5000);
        stopTimer(gameState);

        const duration = CONSTANTS.STAGE_CLEAR_DURATION;
        const interval = runClearConfetti({
            duration,
            randomInRange,
            reducedMotion,
        });

        setTimeout(() => {
            if (interval) clearInterval(interval);

            closeModal(stageClearModal);
            advanceToNextStage(false);
            resumeTimerIfNeeded({ gameState, tick });
            finishQuizIfComplete();
        }, duration);
    }

    function celebrateCompetencySection(sectionElement) {
        const sectionId = sectionElement.id;
        const main = document.getElementById(getMainElementId());
        const sectionGroups = SECTION_GROUPS[gameState.selectedSubject] || {};
        const tabId =
            Object.keys(sectionGroups).find((key) =>
                sectionGroups[key].includes(sectionId)
            ) || sectionId;
        const tabButton = main.querySelector(
            `.competency-tab[data-target="${tabId}"]`
        );

        if (!tabButton || tabButton.classList.contains('cleared')) return;

        const groupIds = sectionGroups[tabId];
        if (
            groupIds &&
            !groupIds.every((id) => {
                const section = main.querySelector(`#${id}`);
                return section && checkStageClear(section);
            })
        ) {
            return;
        }

        tabButton.classList.add('cleared');
        playSound(clearAudio);
        stopTimer(gameState);

        const duration = 1000;
        const interval = runClearConfetti({
            duration,
            randomInRange,
            reducedMotion,
        });

        setTimeout(() => {
            if (interval) clearInterval(interval);

            advanceToNextStage(false);
            resumeTimerIfNeeded({ gameState, tick });
        }, duration);
    }

    return {
        celebrateCompetencySection,
        showStageClear,
    };
}
