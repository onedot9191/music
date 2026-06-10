function showEthicsBasicSubmenu({
    CONSTANTS,
    TOPIC_SUBMENU_IDS,
    gameState,
    hideTopicSubmenus,
}) {
    gameState.pendingEthicsBasicStart = true;

    hideTopicSubmenus(
        TOPIC_SUBMENU_IDS.filter((id) => id !== 'ethics-basic-submenu')
    );

    const ethicsBasicSubmenu = document.getElementById('ethics-basic-submenu');
    if (!ethicsBasicSubmenu) return;

    ethicsBasicSubmenu.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);
    ethicsBasicSubmenu.querySelectorAll('.topic-sub-btn').forEach((button) => {
        button.classList.remove(CONSTANTS.CSS_CLASSES.SELECTED);
    });
    ethicsBasicSubmenu.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
    });
}

function revealDirectAnswers({ CONSTANTS, getMainElementId }) {
    const mainId = getMainElementId();

    document
        .querySelectorAll(`#${mainId} input[data-answer]`)
        .forEach((input) => {
            if (!input.classList.contains(CONSTANTS.CSS_CLASSES.CORRECT)) {
                input.value = input.dataset.answer;
                input.classList.remove(
                    CONSTANTS.CSS_CLASSES.INCORRECT,
                    CONSTANTS.CSS_CLASSES.RETRYING
                );
                input.classList.add(
                    CONSTANTS.CSS_CLASSES.CORRECT,
                    CONSTANTS.CSS_CLASSES.REVEALED
                );
            }

            input.disabled = true;
        });
}

function markAnswersRevealed(getMainElementId) {
    const main = document.getElementById(getMainElementId());
    if (main) {
        main.dataset.answersRevealed = 'true';
    }
}

function bindCharacterCountBlock({ character, updateTodayBlankCount }) {
    let countBlockTimer = null;

    character.addEventListener('click', () => {
        const todayBlankCount = document.getElementById('today-blank-count');
        if (!todayBlankCount) return;

        if (countBlockTimer) {
            clearTimeout(countBlockTimer);
        }

        todayBlankCount.classList.remove('hidden');
        updateTodayBlankCount();

        countBlockTimer = setTimeout(() => {
            todayBlankCount.classList.add('hidden');
            countBlockTimer = null;
        }, 1500);
    });
}

function bindStartButton({
    CONSTANTS,
    TOPIC_SUBMENU_IDS,
    gameState,
    hideTopicSubmenus,
    startGame,
    startGameBtn,
}) {
    if (!startGameBtn) {
        console.error('시작 버튼을 찾을 수 없습니다. ID: start-game-btn');
        return;
    }

    startGameBtn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();

        try {
            if (gameState.useEasternEthicsBasic) {
                showEthicsBasicSubmenu({
                    CONSTANTS,
                    TOPIC_SUBMENU_IDS,
                    gameState,
                    hideTopicSubmenus,
                });
                return;
            }

            startGame();
        } catch (error) {
            console.error('startGame 함수 실행 중 에러:', error);
        }
    });
}

function bindResultRevealButton({
    CONSTANTS,
    closeModal,
    closeProgressModalBtn,
    getMainElementId,
    progressModal,
    resetBtn,
    revealCompetencyAnswers,
    scrapResultImageBtnTop,
    shouldRevealCompetencyAnswers,
}) {
    closeProgressModalBtn.addEventListener('click', () => {
        closeModal(progressModal);

        if (shouldRevealCompetencyAnswers()) {
            revealCompetencyAnswers();
        } else {
            revealDirectAnswers({ CONSTANTS, getMainElementId });
        }

        markAnswersRevealed(getMainElementId);

        scrapResultImageBtnTop.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);
        resetBtn.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);
    });
}

export function bindGameControlEvents({
    CONSTANTS,
    TOPIC_SUBMENU_IDS,
    character,
    closeModal,
    closeProgressModalBtn,
    forceQuitBtn,
    gameState,
    getMainElementId,
    hideTopicSubmenus,
    progressModal,
    resetBtn,
    resetGame,
    revealCompetencyAnswers,
    scrapResultImageBtnTop,
    shouldRevealCompetencyAnswers,
    startGame,
    startGameBtn,
    tick,
    updateTodayBlankCount,
}) {
    bindCharacterCountBlock({ character, updateTodayBlankCount });

    bindStartButton({
        CONSTANTS,
        TOPIC_SUBMENU_IDS,
        gameState,
        hideTopicSubmenus,
        startGame,
        startGameBtn,
    });

    resetBtn.addEventListener('click', () => resetGame(true));

    forceQuitBtn.addEventListener('click', () => {
        if (!gameState.timerId) return;

        gameState.isForceQuit = true;
        gameState.total = 0;
        tick();
    });

    bindResultRevealButton({
        CONSTANTS,
        closeModal,
        closeProgressModalBtn,
        getMainElementId,
        progressModal,
        resetBtn,
        revealCompetencyAnswers,
        scrapResultImageBtnTop,
        shouldRevealCompetencyAnswers,
    });
}
