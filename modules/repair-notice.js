export const REPAIR_NOTICE_ENABLED = false;

export async function readRepairNoticeEnabled() {
    try {
        const response = await fetch('/api/repair-notice', {
            cache: 'no-store',
        });
        if (!response.ok) return REPAIR_NOTICE_ENABLED;

        const status = await response.json();
        return typeof status.enabled === 'boolean'
            ? status.enabled
            : REPAIR_NOTICE_ENABLED;
    } catch {
        return REPAIR_NOTICE_ENABLED;
    }
}

export function prepareRepairNotice({
    closeModal,
    enabled = REPAIR_NOTICE_ENABLED,
    openModal,
    repairNoticeConfirmBtn,
    repairNoticeModal,
    startModal,
}) {
    if (!enabled) return startModal;

    repairNoticeConfirmBtn.addEventListener('click', () => {
        closeModal(repairNoticeModal);
        openModal(startModal);
    });

    return repairNoticeModal;
}
