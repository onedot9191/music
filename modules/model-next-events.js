export function bindModelNextEvents({
    CONSTANTS,
    MODEL_NEXT_BUTTON_CONFIGS,
    isIgnoreOrderScope,
    normalizeAnswer,
    revealSectionAnswers,
    root = document,
    unlockOtherModelSections,
}) {
    const practicalTitleNextBtn = root.getElementById(
        'practical-title-next-btn'
    );

    practicalTitleNextBtn?.addEventListener('click', () => {
        const titleSection = root.querySelector(
            '#practical-quiz-main #practical-title'
        );

        revealSectionAnswers(titleSection, {
            classes: CONSTANTS.CSS_CLASSES,
            isIgnoreOrderScope,
            normalizeAnswer,
        });

        unlockOtherModelSections(
            root.getElementById('practical-quiz-main'),
            'practical-title'
        );
    });

    MODEL_NEXT_BUTTON_CONFIGS.forEach((config) => {
        const button = root.getElementById(config.btnId);
        if (!button) return;

        button.addEventListener('click', () => {
            const titleSection = root.querySelector(
                `#${config.mainId} #${config.titleId}`
            );

            revealSectionAnswers(titleSection, {
                classes: CONSTANTS.CSS_CLASSES,
                isIgnoreOrderScope,
                normalizeAnswer,
            });

            unlockOtherModelSections(
                root.getElementById(config.mainId),
                config.titleId
            );
        });
    });
}
