import { formatDateKey } from './utils.js';

function findById(root, id) {
    return root.getElementById?.(id) || root.querySelector?.(`#${id}`);
}

export function createHeatmapCell({
    date = '',
    count = 0,
    max = 0,
    empty = false,
    countSuffix = '',
}) {
    const cell = document.createElement('div');
    cell.classList.add('heatmap-cell');

    if (empty) {
        cell.classList.add('empty');
        return cell;
    }

    if (max > 0 && count > 0) {
        const level = Math.min(4, Math.ceil((count / max) * 4));
        cell.classList.add(`level-${level}`);
    }

    cell.title = `${date}: ${count}${countSuffix}`;
    return cell;
}

export function appendLeadingEmptyCells(container, firstDate) {
    const offset = (firstDate.getDay() + 6) % 7;

    for (let i = 0; i < offset; i += 1) {
        container.appendChild(createHeatmapCell({ empty: true }));
    }
}

export function groupStatsByMonth(stats) {
    return stats.reduce((groups, stat) => {
        const [year, month] = stat.date.split('-');
        const key = `${year}-${month}`;
        groups[key] ||= [];
        groups[key].push(stat);
        return groups;
    }, {});
}

export function updateHeatmapTitle(stats, { root = document } = {}) {
    const countEl = findById(root, 'heatmap-count');
    if (!countEl) return;

    const todayKey = formatDateKey();
    const today = stats.find((stat) => stat.date === todayKey);
    countEl.textContent = String(today ? today.count : 0);
}

export function renderHeatmap(
    stats,
    renderDDayCallback,
    { root = document } = {}
) {
    const container = findById(root, 'activity-heatmap');
    if (!container) return;

    container.innerHTML = '';
    if (stats.length === 0) return;

    appendLeadingEmptyCells(container, new Date(stats[0].date));

    const max = Math.max(...stats.map((stat) => stat.count), 0);
    stats.forEach((stat) => {
        container.appendChild(createHeatmapCell({ ...stat, max }));
    });

    updateHeatmapTitle(stats, { root });
    renderDDayCallback?.();
}

export function renderSixMonthHeatmap(
    stats,
    { root = document, emptyMessage = '아직 학습 기록이 없습니다.' } = {}
) {
    const container = findById(root, 'six-month-heatmap-container');
    if (!container) return;

    container.innerHTML = '';

    if (stats.length === 0) {
        container.innerHTML = `<p style="color: var(--text-light); text-align: center; padding: 2rem;">${emptyMessage}</p>`;
        return;
    }

    const monthGroups = groupStatsByMonth(stats);
    const globalMax = Math.max(...stats.map((stat) => stat.count), 0);
    const totalCount = stats.reduce((sum, stat) => sum + stat.count, 0);
    const titleElement = findById(root, 'six-month-heatmap-title');

    if (titleElement) {
        titleElement.innerHTML = `<span style="color: #FFFFFF; font-weight: 700;">${totalCount}개</span> 진행 중 (6개월 기준)`;
    }

    Object.keys(monthGroups)
        .sort()
        .forEach((monthKey) => {
            const monthData = monthGroups[monthKey];
            const [year, month] = monthKey.split('-');

            const monthSection = document.createElement('div');
            monthSection.classList.add('month-heatmap-section');

            const monthTitle = document.createElement('h3');
            monthTitle.classList.add('month-title');
            monthTitle.textContent = `${year}년 ${parseInt(month)}월`;
            monthSection.appendChild(monthTitle);

            const monthGrid = document.createElement('div');
            monthGrid.classList.add('month-heatmap-grid');

            appendLeadingEmptyCells(monthGrid, new Date(monthData[0].date));

            monthData.forEach((stat) => {
                monthGrid.appendChild(
                    createHeatmapCell({
                        ...stat,
                        max: globalMax,
                        countSuffix: '개',
                    })
                );
            });

            monthSection.appendChild(monthGrid);
            container.appendChild(monthSection);
        });
}
