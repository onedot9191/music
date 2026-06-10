export function bindPracticalModalEvents({ closeModal }) {
    const closeButton = document.getElementById(
        'close-practical-model-title-modal'
    );

    if (!closeButton) return;

    closeButton.addEventListener('click', () => {
        const modal = document.getElementById('practical-model-title-modal');

        if (modal) {
            closeModal(modal);
        }
    });
}
