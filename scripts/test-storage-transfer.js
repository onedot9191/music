import assert from 'node:assert/strict';

import { StorageManager } from '../modules/storage.js';

function createLocalStorage(entries = {}, failOnKey = '') {
    const values = new Map(Object.entries(entries));

    return {
        get length() {
            return values.size;
        },
        clear() {
            values.clear();
        },
        getItem(key) {
            return values.has(key) ? values.get(key) : null;
        },
        key(index) {
            return [...values.keys()][index] ?? null;
        },
        removeItem(key) {
            values.delete(key);
        },
        setItem(key, value) {
            if (key === failOnKey) {
                throw new Error(`Storage write rejected for ${key}`);
            }
            values.set(key, String(value));
        },
    };
}

// Given: the browser contains quiz records, settings, custom order, and unrelated data.
globalThis.localStorage = createLocalStorage({
    audioDebug: '1',
    dailyStats: JSON.stringify({ '2026-08-24': 3 }),
    soundEnabled: 'false',
    subjectAccuracy: JSON.stringify({ music: 90 }),
    'curriculum-order:music:section:0': JSON.stringify(['b', 'a']),
});
const storageManager = new StorageManager();

// When: data for the new site is exported.
const exportedData = storageManager.exportData();

// Then: every user record is included and unrelated debug data is excluded.
assert.deepEqual(exportedData, {
    dailyStats: { '2026-08-24': 3 },
    soundEnabled: false,
    subjectAccuracy: { music: 90 },
    'curriculum-order:music:section:0': ['b', 'a'],
});

// Given: the new address starts with an empty browser store.
globalThis.localStorage = createLocalStorage();
const newStorageManager = new StorageManager();

// When: transferred data includes both known and unknown keys.
const imported = newStorageManager.importData({
    ...exportedData,
    foreignSiteData: 'blocked',
});

// Then: known records are restored and the unknown key is rejected.
assert.equal(imported, true);
assert.deepEqual(newStorageManager.exportData(), exportedData);
assert.equal(localStorage.getItem('foreignSiteData'), null);

// Given: the new address already has records and one transferred write is rejected.
globalThis.localStorage = createLocalStorage(
    {
        dailyStats: JSON.stringify({ '2026-08-24': 1 }),
        soundEnabled: 'true',
    },
    'soundEnabled'
);
const failingStorageManager = new StorageManager();

// When: importing updates one key before the browser rejects the next key.
const originalConsoleError = console.error;
const storageErrors = [];
let failedImport;
try {
    console.error = (...args) => storageErrors.push(args);
    failedImport = failingStorageManager.importData({
        dailyStats: { '2026-08-24': 3 },
        soundEnabled: false,
    });
} finally {
    console.error = originalConsoleError;
}

// Then: the import reports failure and restores the records that existed before it.
assert.equal(
    failedImport,
    false,
    'A rejected storage write must fail the import'
);
assert.match(String(storageErrors[0]?.[0]), /Storage setItem failed/);
assert.deepEqual(failingStorageManager.exportData(), {
    dailyStats: { '2026-08-24': 1 },
    soundEnabled: true,
});

console.log('Storage transfer tests passed');
