export const STORAGE_KEYS = Object.freeze({
    DAILY_STATS: 'dailyStats',
    USER_PREFERENCES: 'userPreferences',
    GAME_SETTINGS: 'gameSettings',
    ACHIEVEMENT_DATA: 'achievementData',
    WRONG_ANSWERS: 'wrongAnswers',
    CORRECT_ANSWERS: 'correctAnswers',
});

export const DEFAULT_USER_PREFERENCES = Object.freeze({
    volume: 0.3,
    theme: 'dark',
    language: 'ko',
    autoSave: true,
    showHints: true,
});

export const DEFAULT_GAME_SETTINGS = Object.freeze({
    lastSubject: 'music',
    lastTopic: 'curriculum',
    lastMode: 'normal',
    lastDuration: 900,
    spellingDataset: 'basic',
});

export const DEFAULT_ACHIEVEMENT_DATA = Object.freeze({
    unlockedAchievements: [],
    bestScores: {},
    totalPlayTime: 0,
    streaks: {},
    milestones: {},
});

export function cloneStorageValue(value) {
    if (value === null || typeof value !== 'object') {
        return value;
    }

    return JSON.parse(JSON.stringify(value));
}
