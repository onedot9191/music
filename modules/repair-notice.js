export const REPAIR_NOTICE_ENABLED = false;

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
