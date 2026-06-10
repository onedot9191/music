import { applyOverviewHierarchyIndentation } from './overview-hierarchy.js';
import { applyPurpleTextStyles } from './overview-purple-text.js';

export { applyOverviewHierarchyIndentation } from './overview-hierarchy.js';
export { applyPurpleTextStyles } from './overview-purple-text.js';

export function refreshOverviewStyles(gameState, CONSTANTS) {
    applyOverviewHierarchyIndentation();
    applyPurpleTextStyles(gameState, CONSTANTS);
}

export function bindOverviewStyleRefresh(gameState, CONSTANTS) {
    [
        '#overview-quiz-main .tabs',
        '#eastern-ethics-quiz-main .tabs',
        '#western-ethics-quiz-main .tabs',
        '#moral-psychology-quiz-main .tabs',
        '#integrated-guide-overview .tabs',
    ].forEach((selector) => {
        const tabs = document.querySelector(selector);
        if (!tabs) return;

        tabs.addEventListener('click', () => {
            requestAnimationFrame(() => {
                refreshOverviewStyles(gameState, CONSTANTS);
            });
        });
    });
}
