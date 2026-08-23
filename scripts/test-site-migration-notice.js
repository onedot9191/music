import assert from 'node:assert/strict';

import {
    bindSiteMigrationNotice,
    shouldShowSiteMigrationNotice,
} from '../modules/site-migration-notice.js';

const OLD_SITE_ORIGIN = 'https://star-rosy-three.vercel.app';
const NEW_SITE_ORIGIN = 'https://music-8pz.pages.dev';
const TRANSFER_TOKEN = 'transfer-token';

function createButton() {
    let clickHandler = () => {};

    return {
        disabled: false,
        hidden: false,
        textContent: '',
        addEventListener(_eventName, handler) {
            clickHandler = handler;
        },
        click() {
            clickHandler();
        },
    };
}

function createView() {
    return {
        modal: {},
        title: { textContent: '' },
        description: { textContent: '' },
        status: { textContent: '' },
        transferButton: createButton(),
        dismissButton: createButton(),
    };
}

function createMessageTarget() {
    const messages = [];

    return {
        messages,
        postMessage(message, targetOrigin) {
            messages.push({ message, targetOrigin });
        },
    };
}

function createWindow({ hostname, hash = '', opener = null }) {
    const listeners = new Set();
    let openedUrl = '';
    let openedWindow = null;
    let replacedUrl = '';
    let historyUrl = '';

    return {
        crypto: { randomUUID: () => TRANSFER_TOKEN },
        location: {
            hash,
            hostname,
            origin: `https://${hostname}`,
            pathname: '/',
            replace(url) {
                replacedUrl = url;
            },
            search: '',
        },
        history: {
            replaceState(_state, _title, url) {
                historyUrl = url;
            },
        },
        opener,
        addEventListener(_eventName, handler) {
            listeners.add(handler);
        },
        clearTimeout() {},
        dispatchMessage(event) {
            listeners.forEach((listener) => listener(event));
        },
        getOpenedUrl() {
            return openedUrl;
        },
        getOpenedWindow() {
            return openedWindow;
        },
        getHistoryUrl() {
            return historyUrl;
        },
        getReplacedUrl() {
            return replacedUrl;
        },
        open(url) {
            openedUrl = url;
            openedWindow = createMessageTarget();
            return openedWindow;
        },
        removeEventListener(_eventName, handler) {
            listeners.delete(handler);
        },
        setTimeout() {
            return 1;
        },
    };
}

function createModalManager() {
    return {
        closedModal: null,
        openedModal: null,
        closeModal(modal) {
            this.closedModal = modal;
        },
        openModal(modal) {
            this.openedModal = modal;
        },
    };
}

// Given: visitors can arrive through the production Vercel host or another host.
// When: the current hostname is checked for the migration notice.
const oldSiteResult = shouldShowSiteMigrationNotice(
    'star-rosy-three.vercel.app'
);
const newSiteResult = shouldShowSiteMigrationNotice('music-8pz.pages.dev');
const previewResult = shouldShowSiteMigrationNotice('music-preview.vercel.app');

// Then: only the production Vercel address shows the migration notice.
assert.equal(oldSiteResult, true);
assert.equal(newSiteResult, false);
assert.equal(previewResult, false);

// Given: the old site has saved records and a migration notice.
const records = {
    dailyStats: { '2026-08-24': 3 },
    soundEnabled: false,
};
const oldView = createView();
const oldModalManager = createModalManager();
const oldWindow = createWindow({ hostname: 'star-rosy-three.vercel.app' });

bindSiteMigrationNotice({
    modalManager: oldModalManager,
    storageManager: { exportData: () => records },
    view: oldView,
    windowObject: oldWindow,
});

// When: the visitor clicks once and the new site announces it is ready.
oldView.transferButton.click();
const openedWindow = oldWindow.getOpenedWindow();
oldWindow.dispatchMessage({
    data: { type: 'site-migration-ready', token: TRANSFER_TOKEN },
    origin: NEW_SITE_ORIGIN,
    source: openedWindow,
});

// Then: the new site opens and receives the saved records.
assert.equal(
    oldWindow.getOpenedUrl(),
    `${NEW_SITE_ORIGIN}/#record-transfer=${TRANSFER_TOKEN}`
);
assert.deepEqual(openedWindow.messages[0], {
    message: {
        data: records,
        token: TRANSFER_TOKEN,
        type: 'site-migration-data',
    },
    targetOrigin: NEW_SITE_ORIGIN,
});

// Given: the new site was opened by the trusted production Vercel address.
const opener = createMessageTarget();
const newView = createView();
const newModalManager = createModalManager();
const newWindow = createWindow({
    hash: `#record-transfer=${TRANSFER_TOKEN}`,
    hostname: 'music-8pz.pages.dev',
    opener,
});
let importedRecords = null;

bindSiteMigrationNotice({
    modalManager: newModalManager,
    storageManager: {
        importData(data) {
            importedRecords = data;
            return true;
        },
    },
    view: newView,
    windowObject: newWindow,
});

// When: an untrusted preview sends data before the real old site.
newWindow.dispatchMessage({
    data: {
        data: { dailyStats: { fake: 1 } },
        token: TRANSFER_TOKEN,
        type: 'site-migration-data',
    },
    origin: 'https://music-preview.vercel.app',
    source: opener,
});

// Then: the untrusted data is ignored.
assert.equal(importedRecords, null);

// When: the trusted old site sends the records with the matching token.
newWindow.dispatchMessage({
    data: {
        data: records,
        token: TRANSFER_TOKEN,
        type: 'site-migration-data',
    },
    origin: OLD_SITE_ORIGIN,
    source: opener,
});

// Then: the records are imported and the page reloads into the completed state.
assert.deepEqual(importedRecords, records);
assert.equal(newWindow.getReplacedUrl(), '/#record-transfer-complete');
assert.deepEqual(opener.messages, [
    {
        message: {
            token: TRANSFER_TOKEN,
            type: 'site-migration-ready',
        },
        targetOrigin: OLD_SITE_ORIGIN,
    },
    {
        message: {
            ok: true,
            token: TRANSFER_TOKEN,
            type: 'site-migration-complete',
        },
        targetOrigin: OLD_SITE_ORIGIN,
    },
]);

// Given: the imported page reloads with the completion marker.
const completedView = createView();
const completedModalManager = createModalManager();
const completedWindow = createWindow({
    hash: '#record-transfer-complete',
    hostname: 'music-8pz.pages.dev',
});

// When: the migration notice initializes after the reload.
bindSiteMigrationNotice({
    modalManager: completedModalManager,
    storageManager: {},
    view: completedView,
    windowObject: completedWindow,
});

// Then: the new site confirms the transfer and removes the transfer button.
assert.equal(completedModalManager.openedModal, completedView.modal);
assert.equal(completedView.transferButton.hidden, true);
assert.equal(completedView.dismissButton.textContent, '확인');
assert.equal(completedWindow.getHistoryUrl(), '/');

// Given: the new address cannot save the transferred records.
const failedOpener = createMessageTarget();
const failedView = createView();
const failedModalManager = createModalManager();
const failedWindow = createWindow({
    hash: `#record-transfer=${TRANSFER_TOKEN}`,
    hostname: 'music-8pz.pages.dev',
    opener: failedOpener,
});
bindSiteMigrationNotice({
    modalManager: failedModalManager,
    storageManager: { importData: () => false },
    view: failedView,
    windowObject: failedWindow,
});

// When: the trusted old address sends valid records.
failedWindow.dispatchMessage({
    data: {
        data: records,
        token: TRANSFER_TOKEN,
        type: 'site-migration-data',
    },
    origin: OLD_SITE_ORIGIN,
    source: failedOpener,
});

// Then: no success reload occurs and both pages receive a failure result.
assert.equal(failedWindow.getReplacedUrl(), '');
assert.equal(failedView.title.textContent, '기록을 옮기지 못했습니다');
assert.equal(failedModalManager.openedModal, failedView.modal);
assert.equal(failedOpener.messages.at(-1).message.ok, false);

console.log('Site migration notice tests passed');
