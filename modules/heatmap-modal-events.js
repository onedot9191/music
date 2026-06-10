export function bindHeatmapModalEvents({ render6MonthHeatmap }) {
    const expandHeatmapBtn = document.getElementById('expand-heatmap-btn');
    const sixMonthModal = document.getElementById('six-month-heatmap-modal');
    const closeSixMonthBtn = document.getElementById('close-six-month-heatmap');

    const closeModal = () => {
        sixMonthModal.classList.remove('active');
        sixMonthModal.classList.add('hidden');
    };

    if (expandHeatmapBtn && sixMonthModal) {
        expandHeatmapBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            render6MonthHeatmap();
            sixMonthModal.classList.remove('hidden');
            sixMonthModal.classList.add('active');
        });
    }

    if (closeSixMonthBtn && sixMonthModal) {
        closeSixMonthBtn.addEventListener('click', closeModal);

        sixMonthModal.addEventListener('click', (e) => {
            if (e.target === sixMonthModal) {
                closeModal();
            }
        });
    }
}
