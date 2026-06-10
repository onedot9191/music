import { DEFAULT_GAME_SETTINGS } from './storage-config.js';

export function saveGameSettings(storageManager, settings) {
    const current = getGameSettings(storageManager);
    storageManager.setItem(storageManager.storageKeys.GAME_SETTINGS, {
        ...current,
        ...settings,
    });
}

export function getGameSettings(storageManager) {
    return storageManager.getItem(
        storageManager.storageKeys.GAME_SETTINGS,
        DEFAULT_GAME_SETTINGS
    );
}

export function saveLastGameState(storageManager, state) {
    saveGameSettings(storageManager, {
        lastSubject: state.selectedSubject,
        lastTopic: state.selectedTopic,
        lastMode: state.gameMode,
        lastDuration: state.duration,
        spellingDataset: state.spelling?.selectedDataset,
    });
}

export function restoreLastGameState(storageManager) {
    return getGameSettings(storageManager);
}
