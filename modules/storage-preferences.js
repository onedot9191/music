import { DEFAULT_USER_PREFERENCES } from './storage-config.js';

export function saveUserPreferences(storageManager, preferences) {
    const current = getUserPreferences(storageManager);
    storageManager.setItem(storageManager.storageKeys.USER_PREFERENCES, {
        ...current,
        ...preferences,
    });
}

export function getUserPreferences(storageManager) {
    return storageManager.getItem(
        storageManager.storageKeys.USER_PREFERENCES,
        DEFAULT_USER_PREFERENCES
    );
}

export function getUserPreference(storageManager, key, defaultValue = null) {
    const preferences = getUserPreferences(storageManager);
    return preferences[key] !== undefined ? preferences[key] : defaultValue;
}
