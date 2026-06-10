import {
    activateDefaultActivitySection,
    activateSection,
    activateSectionGroup,
    activateTab,
} from './tab-utils.js';

export function focusFirstInput(container) {
    const firstInput = container.querySelector(
        'input[data-answer]:not([disabled])'
    );

    if (!firstInput) return;

    firstInput.focus();
    firstInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

export function createStageNavigationController({
    CONSTANTS,
    SECTION_GROUPS,
    SPECIAL_SUBJECTS,
    gameState,
    getMainElementId,
    showProgress,
    shuffleSocialityFunctionList,
}) {
    const activeClass = CONSTANTS.CSS_CLASSES.ACTIVE;

    function resetToFirstStage(subject) {
        const main = document.getElementById(`${subject}-quiz-main`);
        const tabsContainer = main?.querySelector('.tabs');

        if (!tabsContainer) return;

        const tabs = Array.from(tabsContainer.querySelectorAll('.tab'));

        const firstTab = tabs[0];
        if (!firstTab) return;

        activateTab(tabsContainer, firstTab, activeClass);
        const firstSection = activateSection(
            main,
            firstTab.dataset.target,
            activeClass
        );
        if (!firstSection) return;

        if (firstTab.dataset.target === 'activity-examples') {
            activateDefaultActivitySection(firstSection, activeClass);
        }

        if (subject === CONSTANTS.SUBJECTS.INTEGRATED_COURSE) {
            shuffleSocialityFunctionList();
        }

        focusFirstInput(firstSection);
    }

    function advanceSpecialSubject(main, nextTab) {
        const sectionGroups = SECTION_GROUPS[gameState.selectedSubject] || {};
        const nextIds = sectionGroups[nextTab.dataset.target] || [
            nextTab.dataset.target,
        ];

        nextTab.classList.add(activeClass);
        const firstSection = activateSectionGroup(main, nextIds, activeClass);
        if (firstSection) focusFirstInput(firstSection);
    }

    function advanceRegularSubject(main, currentTab, nextTab) {
        main.querySelector(`#${currentTab.dataset.target}`)?.classList.remove(
            activeClass
        );

        nextTab.classList.add(activeClass);

        const nextSection = activateSection(
            main,
            nextTab.dataset.target,
            activeClass
        );
        if (!nextSection) return;

        if (nextTab.dataset.target !== 'activity-examples') {
            focusFirstInput(nextSection);
            return;
        }

        const defaultSection = activateDefaultActivitySection(
            nextSection,
            activeClass
        );

        focusFirstInput(defaultSection || nextSection);
    }

    function advanceToNextStage(showProgressIfNoNext = true) {
        const main = document.getElementById(getMainElementId());
        const tabsContainer = main?.querySelector('.tabs');

        if (!tabsContainer) return;

        const tabs = Array.from(tabsContainer.querySelectorAll('.tab'));
        const currentIndex = tabs.findIndex((tab) =>
            tab.classList.contains(activeClass)
        );

        if (currentIndex === -1) return;

        const nextTab = tabs[currentIndex + 1];

        if (!nextTab) {
            if (showProgressIfNoNext) {
                showProgress();
            }

            return;
        }

        const currentTab = tabs[currentIndex];
        currentTab.classList.remove(activeClass);

        if (SPECIAL_SUBJECTS.has(gameState.selectedSubject)) {
            advanceSpecialSubject(main, nextTab);
        } else {
            advanceRegularSubject(main, currentTab, nextTab);
        }
    }

    return {
        advanceToNextStage,
        focusFirstInput,
        resetToFirstStage,
    };
}
