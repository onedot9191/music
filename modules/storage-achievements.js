import { DEFAULT_ACHIEVEMENT_DATA } from './storage-config.js';
import {
    updateBestScoreData,
    updateStreakData,
} from './storage-stats-records.js';
import { formatDateKey } from './utils.js';

export function saveAchievementData(storageManager, data) {
    const current = getAchievementData(storageManager);
    storageManager.setItem(storageManager.storageKeys.ACHIEVEMENT_DATA, {
        ...current,
        ...data,
    });
}

export function getAchievementData(storageManager) {
    return storageManager.getItem(
        storageManager.storageKeys.ACHIEVEMENT_DATA,
        DEFAULT_ACHIEVEMENT_DATA
    );
}

export function updateBestScore(storageManager, subject, topic, score) {
    const data = getAchievementData(storageManager);
    const result = updateBestScoreData(data, subject, topic, score);

    if (result.changed) {
        saveAchievementData(storageManager, result.data);
    }

    return result.changed;
}

export function updateStreak(storageManager, type, success = true) {
    const data = getAchievementData(storageManager);
    const today = formatDateKey();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const result = updateStreakData({
        data,
        type,
        success,
        todayKey: today,
        yesterdayKey: formatDateKey(yesterday),
    });

    if (result.changed) {
        saveAchievementData(storageManager, result.data);
    }
}
