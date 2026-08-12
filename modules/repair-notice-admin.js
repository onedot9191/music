const REPAIR_NOTICE_ENDPOINT = '/api/repair-notice';

export function isRepairNoticeAdminShortcut(event) {
    return (
        event.altKey &&
        event.metaKey &&
        !event.ctrlKey &&
        !event.shiftKey &&
        !event.repeat &&
        event.key === 'Enter'
    );
}

async function parseResponse(response) {
    const body = await response.json();
    if (!response.ok) {
        throw new Error(body.error || '요청을 처리하지 못했습니다.');
    }
    return body;
}

export function bindRepairNoticeAdmin({
    actionButton,
    adminModal,
    closeButton,
    closeModal,
    feedback,
    openModal,
    statusBadge,
}) {
    let enabled = false;
    let statusReady = false;

    function renderStatus(nextEnabled) {
        enabled = nextEnabled;
        statusReady = true;
        statusBadge.textContent = enabled ? '켜짐' : '꺼짐';
        statusBadge.classList.remove('warning');
        statusBadge.classList.toggle('success', enabled);
        statusBadge.classList.toggle('error', !enabled);
        actionButton.textContent = enabled
            ? '수리 공지 끄기'
            : '수리 공지 켜기';
        actionButton.setAttribute('aria-checked', String(enabled));
    }

    function setLoading(loading) {
        actionButton.disabled = loading || !statusReady;
        actionButton.textContent = loading
            ? '처리 중...'
            : enabled
            ? '수리 공지 끄기'
            : '수리 공지 켜기';
    }

    async function loadStatus() {
        statusReady = false;
        setLoading(true);
        feedback.textContent = '';
        try {
            const status = await parseResponse(
                await fetch(REPAIR_NOTICE_ENDPOINT, { cache: 'no-store' })
            );
            renderStatus(status.enabled);
            actionButton.focus({ preventScroll: true });
        } catch (error) {
            feedback.textContent = error.message;
        } finally {
            setLoading(false);
        }
    }

    document.addEventListener('keydown', (event) => {
        if (!isRepairNoticeAdminShortcut(event)) return;

        event.preventDefault();
        if (!adminModal.classList.contains('active')) {
            openModal(adminModal);
            loadStatus();
        }
    });

    closeButton.addEventListener('click', () => closeModal(adminModal));
    adminModal.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeModal(adminModal);
    });

    actionButton.addEventListener('click', async () => {
        setLoading(true);
        feedback.textContent = '';
        try {
            const status = await parseResponse(
                await fetch(REPAIR_NOTICE_ENDPOINT, {
                    body: JSON.stringify({
                        enabled: !enabled,
                    }),
                    headers: { 'Content-Type': 'application/json' },
                    method: 'POST',
                })
            );
            renderStatus(status.enabled);
            feedback.textContent = status.enabled
                ? '모든 사용자에게 수리 공지를 켰습니다.'
                : '모든 사용자에게 수리 공지를 껐습니다.';
        } catch (error) {
            feedback.textContent = error.message;
        } finally {
            setLoading(false);
        }
    });
}
