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

    function renderTopicSelector(groupName) {
        const topics = SUBJECT_TOPIC_MAPPING[groupName];

        if (!topics) {
            topicSelector.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);
            topicSelectionTitle.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);
            return;
        }

        topicSelector.innerHTML = '';

        topics.forEach((item, index) => {
            const button = document.createElement('button');
            button.className = 'btn topic-btn';
            button.textContent = item.name;
            button.dataset.subject = item.subject;
            button.dataset.topic = item.topic;

            if (index === 0) {
                button.classList.add(CONSTANTS.CSS_CLASSES.SELECTED);
                gameState.selectedSubject = item.subject;
                gameState.selectedTopic = item.topic;
            }

            topicSelector.appendChild(button);
        });

        topicSelector.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);
        topicSelectionTitle.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);

        hideTopicSubmenus();

        const firstTopic = topics[0]?.topic;
        if (firstTopic) {
            gameState.duration = getDurationForTopic(firstTopic, CONSTANTS);
        }

        const firstTopicItem = topics[0];
        if (firstTopicItem?.hasSubmenu) {
            showTopicSubmenus(
                createTopicSubmenuVisibility(groupName, firstTopicItem.topic),
                {
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
