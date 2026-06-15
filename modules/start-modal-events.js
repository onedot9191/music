import { applyPurpleTextStyles } from './ui-styling.js';
import {
    resetTopicSubmenusForDirectTopic,
    selectSubjectGroupButton,
    selectSubmenuTopicButton,
    selectTopicButton,
    updateEthicsBasicClickState,
    updateTopicButtonSelection,
} from './start-modal-selection-state.js';

function scheduleOverviewStyleRefresh(gameState, CONSTANTS) {
    setTimeout(() => {
        applyPurpleTextStyles(gameState, CONSTANTS);
    }, 100);
}

export function bindStartModalSelectionEvents({
    CONSTANTS,
    SUBJECT_TOPIC_MAPPING,
    TOPIC_SUBMENU_IDS,
    clickAudio,
    createTopicSubmenuVisibility,
    gameState,
    getDurationForTopic,
    playSound,
    renderTopicSelector,
    showTopicSubmenus,
    startGame,
    subjectSelector,
    topicSelector,
    updateStartModalUI,
    updateWrongAnswerIndicators,
}) {
    topicSelector.addEventListener('click', (event) => {
        if (!event.target.matches('.topic-btn')) return;

        setTimeout(() => playSound(clickAudio), 0);

        requestAnimationFrame(() => {
            selectTopicButton(CONSTANTS, event.target);
        });

        const topic = event.target.dataset.topic;
        const subject = event.target.dataset.subject;

        gameState.selectedTopic = topic;
        gameState.selectedSubject = subject;

        let submenus = createTopicSubmenuVisibility(null, null);
        const selectedSubjectBtn = document.querySelector(
            '.subject-btn[data-subject-group].selected'
        );

        if (selectedSubjectBtn) {
            const groupName = selectedSubjectBtn.dataset.subjectGroup;
            submenus = createTopicSubmenuVisibility(groupName, topic);

            const selectedTopicItem = SUBJECT_TOPIC_MAPPING[groupName]?.find(
                (item) => item.topic === topic && item.subject === subject
            );

            submenus = resetTopicSubmenusForDirectTopic(
                submenus,
                selectedTopicItem
            );
        }

        showTopicSubmenus(submenus, {
            selectedSubject: gameState.selectedSubject,
            onDefaultSelect: (firstBtn) => {
                gameState.selectedSubject = firstBtn.dataset.subject;
                gameState.selectedTopic = firstBtn.dataset.topic;
            },
        });

        gameState.duration = getDurationForTopic(topic, CONSTANTS);

        updateStartModalUI();
        scheduleOverviewStyleRefresh(gameState, CONSTANTS);
        updateWrongAnswerIndicators();
    });

    subjectSelector.addEventListener('click', (event) => {
        if (
            !event.target.matches('.subject-btn[data-subject-group]') ||
            gameState.isRandomizing
        ) {
            return;
        }

        const clickedBtn = event.target;
        const groupName = clickedBtn.dataset.subjectGroup;

        updateEthicsBasicClickState(gameState, groupName);

        setTimeout(() => playSound(clickAudio), 0);

        selectSubjectGroupButton(CONSTANTS, clickedBtn);

        renderTopicSelector(groupName);
        updateStartModalUI();
        scheduleOverviewStyleRefresh(gameState, CONSTANTS);
        updateWrongAnswerIndicators();
    });

    TOPIC_SUBMENU_IDS.forEach((submenuId) => {
        const submenuEl = document.getElementById(submenuId);
        if (!submenuEl) return;

        submenuEl.addEventListener('click', (event) => {
            if (!event.target.matches('.topic-sub-btn')) return;

            setTimeout(() => playSound(clickAudio), 0);

            const parentSubmenu = selectSubmenuTopicButton(
                CONSTANTS,
                event.target
            );

            const subject = event.target.dataset.subject;
            const topic = event.target.dataset.topic;

            gameState.selectedSubject = subject;
            gameState.selectedTopic = topic;

            const selectedSubjectBtn = document.querySelector(
                '.subject-btn[data-subject-group].selected'
            );
            if (selectedSubjectBtn) {
                updateTopicButtonSelection(CONSTANTS, topic);
            }

            updateStartModalUI();

            if (
                gameState.pendingEthicsBasicStart &&
                parentSubmenu?.id === 'ethics-basic-submenu'
            ) {
                gameState.pendingEthicsBasicStart = false;
                gameState.useEasternEthicsBasic = false;
                gameState.ethicsConsecutiveClicks = 0;
                startGame();
            }
        });
    });

    setTimeout(() => {
        const selectedSubjectBtn = document.querySelector(
            '.subject-btn[data-subject-group].selected'
        );
        if (!selectedSubjectBtn) return;

        renderTopicSelector(selectedSubjectBtn.dataset.subjectGroup, {
            subject: gameState.selectedSubject,
            topic: gameState.selectedTopic,
        });
        updateStartModalUI();
    }, 100);
}
