// === MODAL MODULE ===
// 모달 열기/닫기 및 포커스 관리 관련 함수들

/**
 * 모달 포커스 헬퍼
 */
export function createModalManager() {
    let lastFocusedElement = null;
    let detachedCharacter = null;
    let characterPlaceholder = null;

    function focusModal(modalEl) {
        const content = modalEl.querySelector('.modal-content');
        if (!content) return;

        if (!content.hasAttribute('tabindex')) {
            content.setAttribute('tabindex', '-1');
        }

        content.focus({ preventScroll: true });
    }

    function detachPageCharacter() {
        if (detachedCharacter) return;

        const character = document.body.querySelector(
            ':scope > #character-assistant'
        );
        if (!character) return;

        characterPlaceholder = document.createComment(
            'character-assistant-placeholder'
        );
        character.before(characterPlaceholder);
        detachedCharacter = character;
        character.remove();
    }

    function restorePageCharacter() {
        if (!detachedCharacter) return;

        if (characterPlaceholder?.parentNode) {
            characterPlaceholder.before(detachedCharacter);
            characterPlaceholder.remove();
        } else {
            document.body.appendChild(detachedCharacter);
        }

        detachedCharacter = null;
        characterPlaceholder = null;
    }

    function openModal(modalEl) {
        lastFocusedElement = document.activeElement;
        modalEl.classList.add('active');
        detachPageCharacter();
        document.body
            .querySelector(':scope > #character-assistant')
            ?.classList.add('hidden-behind-modal');

        if (modalEl.id === 'progress-modal') {
            document.body.classList.add('progress-modal-open');
        }

        focusModal(modalEl);
    }

    function closeModal(modalEl) {
        modalEl.classList.remove('active');

        if (modalEl.id === 'progress-modal') {
            document.body.classList.remove('progress-modal-open');
        }

        if (!document.querySelector('.modal-overlay.active')) {
            document.body
                .querySelector(':scope > #character-assistant')
                ?.classList.remove('hidden-behind-modal');
            restorePageCharacter();
        }

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
        focusModal,
    };
}
