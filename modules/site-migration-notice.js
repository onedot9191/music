const OLD_SITE_HOSTNAME = 'star-rosy-three.vercel.app';
const OLD_SITE_ORIGIN = `https://${OLD_SITE_HOSTNAME}`;
const NEW_SITE_HOSTNAME = 'music-8pz.pages.dev';
const NEW_SITE_ORIGIN = `https://${NEW_SITE_HOSTNAME}`;
const TRANSFER_HASH_KEY = 'record-transfer';
const TRANSFER_COMPLETE_HASH = '#record-transfer-complete';
const TRANSFER_WAIT_MS = 15000;

const MESSAGE_TYPES = Object.freeze({
    READY: 'site-migration-ready',
    DATA: 'site-migration-data',
    COMPLETE: 'site-migration-complete',
});

export function shouldShowSiteMigrationNotice(hostname) {
    return hostname === OLD_SITE_HOSTNAME;
}

function parseTransferMessage(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
    if (typeof data.token !== 'string' || !data.token) return null;

    switch (data.type) {
        case MESSAGE_TYPES.READY:
            return { type: data.type, token: data.token };
        case MESSAGE_TYPES.DATA:
            if (
                !data.data ||
                typeof data.data !== 'object' ||
                Array.isArray(data.data)
            ) {
                return null;
            }
            return { type: data.type, token: data.token, data: data.data };
        case MESSAGE_TYPES.COMPLETE:
            if (typeof data.ok !== 'boolean') return null;
            return { type: data.type, token: data.token, ok: data.ok };
        default:
            return null;
    }
}

function isTrustedMessage(event, expectedOrigin, expectedSource) {
    return event.origin === expectedOrigin && event.source === expectedSource;
}

function getTransferToken(hash) {
    return new URLSearchParams(hash.slice(1)).get(TRANSFER_HASH_KEY);
}

function setCompletedContent(view) {
    view.title.textContent = '기록을 모두 옮겼습니다';
    view.description.textContent =
        '기존 주소의 정답·오답·통계·설정을 이 주소에서도 그대로 사용할 수 있습니다.';
    view.status.textContent = '';
    view.transferButton.hidden = true;
    view.dismissButton.textContent = '확인';
}

function setFailedContent(view) {
    view.title.textContent = '기록을 옮기지 못했습니다';
    view.description.textContent =
        '기존 주소로 돌아가 버튼을 다시 눌러 주세요. 기존 기록은 사라지지 않았습니다.';
    view.status.textContent = '';
    view.transferButton.hidden = true;
    view.dismissButton.textContent = '확인';
}

function openTransferWindow({ storageManager, view, windowObject }) {
    const token = windowObject.crypto.randomUUID();
    const transferUrl = `${NEW_SITE_ORIGIN}/#${TRANSFER_HASH_KEY}=${token}`;
    const newWindow = windowObject.open(transferUrl, '_blank');

    if (!newWindow) {
        view.status.textContent =
            '새 창을 열지 못했습니다. 팝업을 허용한 뒤 다시 눌러 주세요.';
        view.transferButton.disabled = false;
        return;
    }

    const records = storageManager.exportData();
    view.status.textContent = '기록을 새 주소로 옮기는 중입니다.';

    function finishTransfer(message) {
        windowObject.clearTimeout(timeoutId);
        windowObject.removeEventListener('message', handleMessage);
        view.status.textContent = message.ok
            ? '새 주소로 기록을 모두 옮겼습니다.'
            : '기록을 옮기지 못했습니다. 잠시 후 다시 시도해 주세요.';
        view.transferButton.disabled = message.ok;
    }

    function handleMessage(event) {
        if (!isTrustedMessage(event, NEW_SITE_ORIGIN, newWindow)) return;

        const message = parseTransferMessage(event.data);
        if (!message || message.token !== token) return;

        switch (message.type) {
            case MESSAGE_TYPES.READY:
                newWindow.postMessage(
                    { type: MESSAGE_TYPES.DATA, token, data: records },
                    NEW_SITE_ORIGIN
                );
                return;
            case MESSAGE_TYPES.COMPLETE:
                finishTransfer(message);
                return;
            case MESSAGE_TYPES.DATA:
                return;
        }
    }

    windowObject.addEventListener('message', handleMessage);
    const timeoutId = windowObject.setTimeout(() => {
        windowObject.removeEventListener('message', handleMessage);
        view.status.textContent =
            '연결 시간이 지났습니다. 버튼을 다시 눌러 주세요.';
        view.transferButton.disabled = false;
    }, TRANSFER_WAIT_MS);
}

function receiveTransferredRecords({
    modalManager,
    storageManager,
    token,
    view,
    windowObject,
}) {
    const opener = windowObject.opener;
    if (!opener) return;

    function handleMessage(event) {
        if (!isTrustedMessage(event, OLD_SITE_ORIGIN, opener)) return;

        const message = parseTransferMessage(event.data);
        if (
            !message ||
            message.type !== MESSAGE_TYPES.DATA ||
            message.token !== token
        ) {
            return;
        }

        windowObject.removeEventListener('message', handleMessage);
        const ok = storageManager.importData(message.data);
        opener.postMessage(
            { type: MESSAGE_TYPES.COMPLETE, token, ok },
            OLD_SITE_ORIGIN
        );

        if (ok) {
            windowObject.location.replace(
                `${windowObject.location.pathname}${windowObject.location.search}${TRANSFER_COMPLETE_HASH}`
            );
            return;
        }

        windowObject.history.replaceState(
            null,
            '',
            `${windowObject.location.pathname}${windowObject.location.search}`
        );
        setFailedContent(view);
        modalManager.openModal(view.modal);
    }

    windowObject.addEventListener('message', handleMessage);
    opener.postMessage({ type: MESSAGE_TYPES.READY, token }, OLD_SITE_ORIGIN);
}

export function bindSiteMigrationNotice({
    modalManager,
    storageManager,
    view,
    windowObject,
}) {
    view.dismissButton.addEventListener('click', () =>
        modalManager.closeModal(view.modal)
    );

    if (shouldShowSiteMigrationNotice(windowObject.location.hostname)) {
        view.transferButton.addEventListener('click', () => {
            view.transferButton.disabled = true;
            openTransferWindow({ storageManager, view, windowObject });
        });
        modalManager.openModal(view.modal);
        return;
    }

    if (windowObject.location.hostname !== NEW_SITE_HOSTNAME) return;

    if (windowObject.location.hash === TRANSFER_COMPLETE_HASH) {
        windowObject.history.replaceState(
            null,
            '',
            `${windowObject.location.pathname}${windowObject.location.search}`
        );
        setCompletedContent(view);
        modalManager.openModal(view.modal);
        return;
    }

    const token = getTransferToken(windowObject.location.hash);
    if (!token) return;

    receiveTransferredRecords({
        modalManager,
        storageManager,
        token,
        view,
        windowObject,
    });
}
