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

export function exportStorageData(storageKeys) {
    const data = {};

    Object.values(storageKeys).forEach((key) => {
        const value = getJsonStorageItem(key);
        if (value !== null) {
            data[key] = value;
        }
    });

    return data;
}

export function importStorageData(storageKeys, data) {
    const allowedKeys = new Set(Object.values(storageKeys));

    try {
        Object.entries(data).forEach(([key, value]) => {
            if (allowedKeys.has(key)) {
                setJsonStorageItem(key, value);
            }
        });
        return true;
    } catch (error) {
        console.error('Storage importData failed:', error);
        return false;
    }
}
