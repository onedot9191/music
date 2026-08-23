import {
    getJsonStorageItem,
    getStorageItemSize,
    isLocalStorageAvailable,
    removeStorageItem,
    setJsonStorageItem,
} from './local-storage-json.js';

export function clearStorageKeys(storageKeys) {
    try {
        Object.values(storageKeys).forEach((key) => {
            removeStorageItem(key);
        });
        return true;
    } catch (error) {
        console.error('Storage clearAll failed:', error);
        return false;
    }
}

export function clearStorageCategory(storageKeys, category) {
    const key = storageKeys[category.toUpperCase()];
    return key ? removeStorageItem(key) : false;
}

export function getStorageUsageInfo(storageKeys) {
    let totalSize = 0;
    const categories = {};

    Object.entries(storageKeys).forEach(([name, key]) => {
        const itemSize = getStorageItemSize(key);

        if (typeof itemSize === 'number') {
            categories[name] = {
                key,
                size: itemSize,
                sizeKB: Math.round((itemSize / 1024) * 100) / 100,
            };
            totalSize += itemSize;
            return;
        }

        categories[name] = {
            key,
            size: 0,
            sizeKB: 0,
            error: itemSize.error,
        };
    });

    return {
        categories,
        totalSize,
        totalSizeKB: Math.round((totalSize / 1024) * 100) / 100,
        available: isLocalStorageAvailable(),
    };
}

function isTransferStorageKey(key, storageKeys, storagePrefixes) {
    return (
        storageKeys.has(key) ||
        storagePrefixes.some((prefix) => key.startsWith(prefix))
    );
}

export function exportStorageData(storageKeyList, storagePrefixes) {
    const data = {};
    const storageKeys = new Set(storageKeyList);

    for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index);
        if (!key || !isTransferStorageKey(key, storageKeys, storagePrefixes)) {
            continue;
        }

        const value = getJsonStorageItem(key);
        if (value !== null) {
            data[key] = value;
        }
    }

    return data;
}

function restoreStorageEntries(previousEntries) {
    for (const [key, previousValue] of previousEntries.reverse()) {
        try {
            if (previousValue === null) {
                localStorage.removeItem(key);
            } else {
                localStorage.setItem(key, previousValue);
            }
        } catch (error) {
            console.error(`Storage rollback failed for key "${key}":`, error);
        }
    }
}

export function importStorageData(storageKeyList, storagePrefixes, data) {
    const storageKeys = new Set(storageKeyList);
    const previousEntries = [];

    try {
        for (const [key, value] of Object.entries(data)) {
            if (!isTransferStorageKey(key, storageKeys, storagePrefixes)) {
                continue;
            }

            const previousValue = localStorage.getItem(key);
            if (!setJsonStorageItem(key, value)) {
                restoreStorageEntries(previousEntries);
                return false;
            }
            previousEntries.push([key, previousValue]);
        }
        return true;
    } catch (error) {
        restoreStorageEntries(previousEntries);
        console.error('Storage importData failed:', error);
        return false;
    }
}
