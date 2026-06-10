import {
    activateDefaultActivitySection,
    activateSection,
    activateSectionGroup,
    activateTab,
    shouldUseDefaultActivitySection,
} from './tab-utils.js';
import { applyModelTitleGate } from './model-gating.js';

function bindMainTabs({
    CONSTANTS,
    MODEL_GATE_CONFIGS,
    clickAudio,
    focusFirstInput,
    playSound,
    refreshAdaptiveInputWidths,
}) {
    document.querySelectorAll('.tabs').forEach((tabsContainer) => {
        if (
            tabsContainer.classList.contains('competency-tabs') ||
            tabsContainer.classList.contains('sub-tabs')
        ) {
            return;
        }

        tabsContainer.addEventListener('click', (event) => {
            if (!event.target.classList.contains('tab')) return;

            setTimeout(() => playSound(clickAudio), 0);

            const main = event.target.closest('main');
            activateTab(
                tabsContainer,
                event.target,
                CONSTANTS.CSS_CLASSES.ACTIVE
            );

            if (!main) return;

            const targetId = event.target.dataset.target;
            const targetSection = activateSection(
                main,
                targetId,
                CONSTANTS.CSS_CLASSES.ACTIVE
            );

            if (targetSection) {
                focusFirstInput(targetSection);
            }

            const found = MODEL_GATE_CONFIGS.find(
                (config) => main.id === config.mainId
            );
            if (found) {
                applyModelTitleGate(
                    main,
                    tabsContainer,
                    found.titleId,
                    targetId
                );
            }

            refreshAdaptiveInputWidths();

            if (shouldUseDefaultActivitySection(targetId) && targetSection) {
                const defaultSection = activateDefaultActivitySection(
                    targetSection,
                    CONSTANTS.CSS_CLASSES.ACTIVE
                );

                if (defaultSection) {
                    focusFirstInput(defaultSection);
                    refreshAdaptiveInputWidths();
                }
            }

            if (main.id === 'practical-quiz-main') {
                applyModelTitleGate(
                    main,
                    tabsContainer,
                    'practical-title',
                    targetId
                );
            }
        });
    });
}

function bindSubTabs({
    CONSTANTS,
    clickAudio,
    focusFirstInput,
    playSound,
    refreshAdaptiveInputWidths,
}) {
    document.querySelectorAll('.sub-tabs').forEach((tabsContainer) => {
        tabsContainer.addEventListener('click', (event) => {
            if (!event.target.classList.contains('tab')) return;

            event.stopPropagation();
            setTimeout(() => playSound(clickAudio), 0);

            const parentSection = tabsContainer.closest('section');

            activateTab(
                tabsContainer,
                event.target,
                CONSTANTS.CSS_CLASSES.ACTIVE
            );

            if (!parentSection) return;

            const targetId = event.target.dataset.target;
            const targetSection = activateSection(
                parentSection,
                targetId,
                CONSTANTS.CSS_CLASSES.ACTIVE
            );

            if (targetSection) {
                focusFirstInput(targetSection);
                refreshAdaptiveInputWidths();
            }
        });
    });
}

function bindCompetencyTabs({
    CONSTANTS,
    clickAudio,
    focusFirstInput,
    playSound,
    refreshAdaptiveInputWidths,
    sectionGroups,
}) {
    document.querySelectorAll('.competency-tabs').forEach((tabs) => {
        tabs.addEventListener('click', (event) => {
            if (!event.target.matches('.competency-tab')) return;

            setTimeout(() => playSound(clickAudio), 0);

            tabs.querySelectorAll('.competency-tab').forEach((tab) =>
                tab.classList.remove(CONSTANTS.CSS_CLASSES.ACTIVE)
            );
            event.target.classList.add(CONSTANTS.CSS_CLASSES.ACTIVE);

            const targetId = event.target.dataset.target;
            const main = tabs.closest('main');
            if (!main) return;

            const subject = main.id.replace('-quiz-main', '');
            const groups = sectionGroups[subject] || {};

            const sectionIds = groups[targetId] || [targetId];
            const firstSection = activateSectionGroup(
                main,
                sectionIds,
                CONSTANTS.CSS_CLASSES.ACTIVE
            );
            if (firstSection) {
                focusFirstInput(firstSection);
                refreshAdaptiveInputWidths();
            }
        });
    });
}

export function bindQuizTabEvents(options) {
    bindMainTabs(options);
    bindSubTabs(options);
    bindCompetencyTabs(options);
}
