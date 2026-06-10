export function clearSubmenuButtonInlineStyles(button) {
    button.style.background = '';
    button.style.color = '';
    button.style.transform = '';
    button.style.boxShadow = '';
    button.style.borderColor = '';
    button.style.fontWeight = '';
}

export function resetTopicSubmenusForDirectTopic(submenus, selectedTopicItem) {
    if (selectedTopicItem?.hasSubmenu) return submenus;

    Object.keys(submenus).forEach((id) => {
        submenus[id] = false;
    });

    return submenus;
}

export function updateEthicsBasicClickState(gameState, groupName) {
    if (groupName === 'ethics') {
        gameState.ethicsConsecutiveClicks =
            (gameState.ethicsConsecutiveClicks || 0) + 1;

        if (gameState.ethicsConsecutiveClicks >= 3) {
            gameState.useEasternEthicsBasic = true;
        }

        return;
    }

    gameState.ethicsConsecutiveClicks = 0;
    gameState.useEasternEthicsBasic = false;
}

export function updateTopicButtonSelection(CONSTANTS, selectedTopic) {
    document.querySelectorAll('.topic-btn').forEach((button) => {
        button.classList.toggle(
            CONSTANTS.CSS_CLASSES.SELECTED,
            button.dataset.topic === selectedTopic
        );
    });
}

export function selectTopicButton(CONSTANTS, button) {
    document.querySelectorAll('.topic-btn').forEach((topicButton) => {
        topicButton.classList.remove(CONSTANTS.CSS_CLASSES.SELECTED);
    });
    button.classList.add(CONSTANTS.CSS_CLASSES.SELECTED);
}

export function selectSubjectGroupButton(CONSTANTS, button) {
    document
        .querySelectorAll('.subject-btn[data-subject-group]')
        .forEach((subjectButton) => {
            subjectButton.classList.remove(CONSTANTS.CSS_CLASSES.SELECTED);
        });
    button.classList.add(CONSTANTS.CSS_CLASSES.SELECTED);
}

export function selectSubmenuTopicButton(CONSTANTS, button) {
    const parentSubmenu = button.closest('[id$="-submenu"]');

    if (parentSubmenu) {
        parentSubmenu
            .querySelectorAll('.topic-sub-btn')
            .forEach((subButton) => {
                subButton.classList.remove(CONSTANTS.CSS_CLASSES.SELECTED);
                clearSubmenuButtonInlineStyles(subButton);
            });
    }

    button.classList.add(CONSTANTS.CSS_CLASSES.SELECTED);
    clearSubmenuButtonInlineStyles(button);

    return parentSubmenu;
}
