export function createStageCompletionScheduler({
    CONSTANTS,
    SPECIAL_SUBJECTS,
    advanceToNextStage,
    celebrateCompetencySection,
    checkStageClear,
    createModelConfigBySubject,
    gameState,
    isSectionComplete,
    showStageClear,
    tick,
    unlockOtherModelSections,
}) {
    function getCurrentModelConfig() {
        if (gameState.selectedTopic !== CONSTANTS.TOPICS.MODEL) return null;

        return (
            createModelConfigBySubject(CONSTANTS)[gameState.selectedSubject] ||
            null
        );
    }

    function unlockModelTitleIfNeeded(section) {
        const cfg = getCurrentModelConfig();

        if (cfg && section.id === cfg.titleId) {
            unlockOtherModelSections(
                document.getElementById(cfg.mainId),
                cfg.titleId
            );
        }
    }

    function scheduleSectionCompletion(section) {
        if (!isSectionComplete(section)) return;

        if (checkStageClear(section)) {
            unlockModelTitleIfNeeded(section);

            const delay =
                CONSTANTS.NEXT_STAGE_DELAY - CONSTANTS.STAGE_CLEAR_DURATION;

            if (SPECIAL_SUBJECTS.has(gameState.selectedSubject)) {
                setTimeout(() => celebrateCompetencySection(section), delay);
            } else {
                setTimeout(showStageClear, delay);
            }

            return;
        }

        setTimeout(() => {
            advanceToNextStage(false);

            if (gameState.total > 0 && gameState.timerId === null) {
                gameState.timerId = setInterval(tick, 1000);
            }
        }, CONSTANTS.NEXT_STAGE_DELAY);
    }

    return {
        getCurrentModelConfig,
        scheduleSectionCompletion,
        unlockModelTitleIfNeeded,
    };
}
