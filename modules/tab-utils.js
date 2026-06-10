export const ACTIVITY_EXAMPLES_TARGET = 'activity-examples';
export const DEFAULT_ACTIVITY_TARGET = 'activity-exercise';

export function activateTab(tabsContainer, tab, activeClass = 'active') {
    tabsContainer
        .querySelectorAll('.tab')
        .forEach((item) => item.classList.remove(activeClass));
    tab.classList.add(activeClass);
}

export function activateSection(container, targetId, activeClass = 'active') {
    container
        .querySelectorAll('section')
        .forEach((section) => section.classList.remove(activeClass));

    const targetSection = container.querySelector(`#${targetId}`);
    if (targetSection) {
        targetSection.classList.add(activeClass);
    }

    return targetSection;
}

export function activateSectionGroup(
    container,
    sectionIds,
    activeClass = 'active'
) {
    container
        .querySelectorAll('section')
        .forEach((section) => section.classList.remove(activeClass));

    sectionIds.forEach((id) => {
        container.querySelector(`#${id}`)?.classList.add(activeClass);
    });

    return container.querySelector(`#${sectionIds[0]}`);
}

export function activateDefaultActivitySection(
    section,
    activeClass = 'active'
) {
    const subTabs = section.querySelector('.sub-tabs');
    if (subTabs) {
        const defaultTab = subTabs.querySelector(
            `[data-target="${DEFAULT_ACTIVITY_TARGET}"]`
        );
        if (defaultTab) {
            activateTab(subTabs, defaultTab, activeClass);
        }
    }

    return activateSection(section, DEFAULT_ACTIVITY_TARGET, activeClass);
}

export function shouldUseDefaultActivitySection(targetId) {
    return targetId === ACTIVITY_EXAMPLES_TARGET;
}
