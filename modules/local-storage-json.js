// === LOCAL STORAGE JSON MODULE ===
// localStorage의 JSON 직렬화, 파싱, 사용 가능 여부 확인을 담당합니다.

import { cloneStorageValue } from './storage-config.js';

export function setJsonStorageItem(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error(`Storage setItem failed for key "${key}":`, error);
        return false;
    }
}

export function getJsonStorageItem(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        if (item === null) {
            return cloneStorageValue(defaultValue);
        }
        return JSON.parse(item);
    } catch (error) {
        console.error(`Storage getItem failed for key "${key}":`, error);
        return cloneStorageValue(defaultValue);
    }
}

export function removeStorageItem(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error(`Storage removeItem failed for key "${key}":`, error);
        return false;
    }
}

export function isLocalStorageAvailable() {
    try {
        const testKey = '__storage_test__';
        localStorage.setItem(testKey, testKey);
        localStorage.removeItem(testKey);
        return true;
    } catch (_) {
        return false;
    }
}

export function getStorageItemSize(key) {
    try {
        return localStorage.getItem(key)?.length ?? 0;
    } catch (error) {
        return { error: error.message };
    }
}
