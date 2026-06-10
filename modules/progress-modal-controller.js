const RESULT_FEEDBACK = [
    {
        threshold: 100,
        title: '[트러플버섯]',
        dialogue: '완벽은 드물기에 값지다.',
        animation: 'cheer',
    },
    {
        threshold: 90,
        title: '[송이버섯]',
        dialogue: '이건 귀한 향이다.',
        animation: 'happy',
    },
    {
        threshold: 70,
        title: '[표고버섯]',
        dialogue: '국물 깊이가 다르다.',
        animation: 'idle',
    },
    {
        threshold: 50,
        title: '[느타리버섯]',
        dialogue: '전골 재료는 확보했다.',
        animation: 'idle',
    },
    {
        threshold: 20,
        title: '[균사]',
        dialogue: '실밥이 풀린 모양이다.',
        animation: 'sad',
    },
    {
        threshold: 0,
        title: '[포자]',
        dialogue: '지금은 가루만 날린다…',
        animation: 'sad',
    },
];

function getResultFeedback(percentage) {
    return RESULT_FEEDBACK.find((feedback) => percentage >= feedback.threshold);
}

function getCurrentDateLabel() {
    const today = new Date();
    return `${today.getMonth() + 1}월 ${today.getDate()}일`;
}

export function createProgressModalController({
    CONSTANTS,
    SUBJECT_NAMES,
    TOPIC_NAMES,
    calculatePercentage,
    character,
    gameState,
    getDailyStats,
    getMainElementId,
    isSpellingBlankMode,
    markSubjectAccuracyAchieved,
    modalCharacterPlaceholder,
    openModal,
    progressModal,
    readResultProgress,
    resultDialogue,
    resultSubject,
    resultTitle,
    resultTopic,
    saveSubjectAccuracy,
    setResultProgress,
    speechBubble,
    typewriter,
    updateHeatmapTitle,
    updateSubjectButtonStates,
    updateTodayBlankCount,
}) {
    function readCurrentProgress() {
        if (
            gameState.selectedSubject === CONSTANTS.SUBJECTS.SPELLING &&
            !isSpellingBlankMode()
        ) {
            return readResultProgress();
        }

        const mainId = getMainElementId();
        const allInputs = document.querySelectorAll(
            `#${mainId} input[data-answer]`
        );
        const correctCount = document.querySelectorAll(
            `#${mainId} input.${CONSTANTS.CSS_CLASSES.CORRECT}`
        ).length;

        updateTodayBlankCount();

        return {
            correctCount,
            totalCount: allInputs.length,
        };
    }

    function persistProgress({ correctCount, totalCount, percentage }) {
        saveSubjectAccuracy(
            gameState.selectedSubject,
            correctCount,
            totalCount
        );

        if (percentage >= 70) {
            markSubjectAccuracyAchieved(gameState.selectedSubject);
        }

        updateSubjectButtonStates();
        updateHeatmapTitle(getDailyStats(30));
        updateTodayBlankCount();
        setResultProgress(correctCount, totalCount);
    }

    function renderModalCharacter(feedback) {
        modalCharacterPlaceholder.innerHTML = '';
        modalCharacterPlaceholder.appendChild(character.cloneNode(true));

        setTimeout(() => {
            const modalChar = modalCharacterPlaceholder.querySelector(
                '#character-assistant'
            );

            if (!modalChar) return;

            modalChar.className = '';
            modalChar.classList.add(feedback.animation);

            if (gameState.gameMode === CONSTANTS.MODES.HARD_CORE) {
                modalChar.classList.add('devil-mode');
            }
        }, 100);
    }

    function showProgress() {
        const { correctCount, totalCount } = readCurrentProgress();
        const percentage = calculatePercentage(correctCount, totalCount);
        const feedback = getResultFeedback(percentage);

        persistProgress({ correctCount, totalCount, percentage });

        resultSubject.textContent =
            SUBJECT_NAMES[gameState.selectedSubject] || '';
        resultTopic.textContent = TOPIC_NAMES[gameState.selectedTopic] || '';
        resultTitle.textContent = `${getCurrentDateLabel()} 자 ${
            feedback.title
        }`;

        renderModalCharacter(feedback);

        speechBubble.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);
        typewriter(resultDialogue, feedback.dialogue);
        openModal(progressModal);
    }

    return {
        showProgress,
    };
}
