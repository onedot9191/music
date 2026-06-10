export function createGameState(CONSTANTS) {
    return {
        duration: CONSTANTS.DEFAULT_DURATION,
        total: CONSTANTS.DEFAULT_DURATION,
        timerId: null,
        combo: 0,
        isForceQuit: false,
        lastSpecialPopupCount: 0,
        selectedSubject: CONSTANTS.SUBJECTS.MUSIC,
        selectedTopic: CONSTANTS.TOPICS.CURRICULUM,
        ethicsConsecutiveClicks: 0,
        useEasternEthicsBasic: false,
        pendingEthicsBasicStart: false,
        gameMode: CONSTANTS.MODES.NORMAL,
        normalModeDuration: CONSTANTS.DEFAULT_DURATION,
        isRandomizing: false,
        typingInterval: null,
        spelling: createInitialSpellingState(),
    };
}

export function createInitialSpellingState() {
    return {
        questions: [],
        currentQuestionIndex: 0,
        score: 0,
        answered: false,
        roundCompleted: false,
        selectedDataset: 'basic',
    };
}

export function createSpecialSubjects(CONSTANTS) {
    return new Set([
        CONSTANTS.SUBJECTS.COMPETENCY,
        CONSTANTS.SUBJECTS.AREA,
        CONSTANTS.SUBJECTS.MORAL_PRINCIPLES,
    ]);
}
