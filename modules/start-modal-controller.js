export function createStartModalController({
    CONSTANTS,
    SUBJECT_TOPIC_MAPPING,
    checkSubjectAccuracyAchieved,
    checkSubjectAccuracyThreshold,
    createTopicSubmenuVisibility,
    formatTime,
    gameState,
    getDailyStats,
    getDurationForTopic,
    hideTopicSubmenus,
    renderDDay,
    renderHeatmap,
    showTopicSubmenus,
    timeSettingDisplay,
    topicSelectionTitle,
    topicSelector,
}) {
    function updateSubjectButtonStates() {
        document.querySelectorAll('.subject-btn').forEach((button) => {
            const subject = button.dataset.subject;

            if (
                subject &&
                (checkSubjectAccuracyAchieved(subject) ||
                    checkSubjectAccuracyThreshold(subject, 70))
            ) {
                button.classList.add('high-accuracy');
            } else {
                button.classList.remove('high-accuracy');
            }
        });
    }

    function updateTimeSettingDisplay() {
        timeSettingDisplay.textContent = formatTime(gameState.duration);
    }

    function renderTopicSelector(groupName, preferredSelection = {}) {
        const topics = SUBJECT_TOPIC_MAPPING[groupName];

        if (!topics) {
            topicSelector.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);
            topicSelectionTitle.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);
            return;
        }

        topicSelector.innerHTML = '';

        const selectedIndex = Math.max(
            topics.findIndex(
                (item) =>
                    item.subject === preferredSelection.subject &&
                    item.topic === preferredSelection.topic
            ),
            topics.findIndex(
                (item) =>
                    item.hasSubmenu &&
                    item.topic === preferredSelection.topic
            )
        );
        const effectiveSelectedIndex = selectedIndex >= 0 ? selectedIndex : 0;

        topics.forEach((item, index) => {
            const button = document.createElement('button');
            button.className = 'btn topic-btn';
            button.textContent = item.name;
            button.dataset.subject = item.subject;
            button.dataset.topic = item.topic;

            if (index === effectiveSelectedIndex) {
                button.classList.add(CONSTANTS.CSS_CLASSES.SELECTED);
                gameState.selectedSubject =
                    item.hasSubmenu && preferredSelection.subject
                        ? preferredSelection.subject
                        : item.subject;
                gameState.selectedTopic = item.topic;
            }

            topicSelector.appendChild(button);
        });

        topicSelector.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);
        topicSelectionTitle.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);

        hideTopicSubmenus();

        const selectedTopic = topics[effectiveSelectedIndex]?.topic;
        if (selectedTopic) {
            gameState.duration = getDurationForTopic(selectedTopic, CONSTANTS);
        }

        const selectedTopicItem = topics[effectiveSelectedIndex];
        if (selectedTopicItem?.hasSubmenu) {
            showTopicSubmenus(
                createTopicSubmenuVisibility(groupName, selectedTopicItem.topic),
                {
                    selectedSubject: preferredSelection.subject,
                    onDefaultSelect: (firstButton) => {
                        gameState.selectedSubject = firstButton.dataset.subject;
                        gameState.selectedTopic = firstButton.dataset.topic;
                    },
                }
            );
        }
    }

    function updateStartModalUI() {
        renderHeatmap(getDailyStats(30), renderDDay);
        updateSubjectButtonStates();
        updateTimeSettingDisplay();
    }

    return {
        renderTopicSelector,
        updateStartModalUI,
        updateSubjectButtonStates,
        updateTimeSettingDisplay,
    };
}
