export function isIgnoreOrderScope(scope, input) {
    if (!scope || !input) return false;

    const marker = input.closest('[data-ignore-order]');

    return (
        !!marker &&
        (marker === scope || marker.contains(scope) || scope.contains(marker))
    );
}

function isSectionIgnoreOrderSubject(constants, selectedSubject) {
    return (
        selectedSubject === constants.SUBJECTS.COMPETENCY ||
        selectedSubject === constants.SUBJECTS.AREA
    );
}

function shouldUseGroupedGrading({
    input,
    sectionMatchers,
    specialSubjects,
    selectedSubject,
}) {
    return (
        sectionMatchers.isGroupedGradingInput(
            input,
            specialSubjects,
            selectedSubject
        ) ||
        sectionMatchers.isIntegratedTitleInput(input) ||
        sectionMatchers.isPracticalTitleInput(input) ||
        sectionMatchers.isGenericModelTitleInput(input)
    );
}

function shouldForceOrderedGrading({
    constants,
    selectedSubject,
    selectedTopic,
}) {
    return (
        selectedTopic === constants.TOPICS.ACHIEVEMENT &&
        selectedSubject === constants.SUBJECTS.ART_STD
    );
}

export function gradeInputAnswer({
    CONSTANTS,
    SPECIAL_SUBJECTS,
    gameState,
    gradeDirectAnswer,
    gradeGroupedAnswer,
    getAnswerCandidates,
    input,
    normalizeAnswer,
    section,
    sectionMatchers,
    stripModelWord,
    usedAnswersMap,
    userAnswer,
}) {
    if (
        shouldUseGroupedGrading({
            input,
            sectionMatchers,
            specialSubjects: SPECIAL_SUBJECTS,
            selectedSubject: gameState.selectedSubject,
        })
    ) {
        const useSectionIgnoreOrder = isSectionIgnoreOrderSubject(
            CONSTANTS,
            gameState.selectedSubject
        );
        const group = input.closest('[data-group]') || section;
        const ignoreOrder = shouldForceOrderedGrading({
            constants: CONSTANTS,
            selectedSubject: gameState.selectedSubject,
            selectedTopic: gameState.selectedTopic,
        })
            ? false
            : useSectionIgnoreOrder || isIgnoreOrderScope(group, input);

        return gradeGroupedAnswer({
            input,
            section,
            userAnswer,
            usedAnswersMap,
            getAnswerCandidates,
            ignoreOrder,
            isModelTopic: gameState.selectedTopic === CONSTANTS.TOPICS.MODEL,
            normalizeAnswer,
            stripModelWord,
        });
    }

    return gradeDirectAnswer({
        input,
        userAnswer,
        selectedTopic: gameState.selectedTopic,
        selectedSubject: gameState.selectedSubject,
        constants: CONSTANTS,
        getAnswerCandidates,
        normalizeAnswer,
        stripModelWord,
    });
}
