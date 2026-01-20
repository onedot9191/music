// === MODAL MODULE ===
// 모달 열기/닫기 및 포커스 관리 관련 함수들

/**
 * 모달 포커스 헬퍼
 */
export function createModalManager() {
    let lastFocusedElement = null;
    
    function focusModal(modalEl) {
        const content = modalEl.querySelector('.modal-content');
        if (!content) return;
        
        if (!content.hasAttribute('tabindex')) {
            content.setAttribute('tabindex', '-1');
        }
        
        content.focus({ preventScroll: true });
    }
    
    function openModal(modalEl) {
        lastFocusedElement = document.activeElement;
        modalEl.classList.add('active');
        focusModal(modalEl);
    }
    
    function closeModal(modalEl) {
        modalEl.classList.remove('active');
        
        if (lastFocusedElement && document.body.contains(lastFocusedElement)) {
            try { 
                lastFocusedElement.focus({ preventScroll: true }); 
            } catch (_) {}
        }
        
        lastFocusedElement = null;
    }
    
    return {
        openModal,
        closeModal,
        focusModal
    };
}
