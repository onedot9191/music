export function isGroupedGradingInput(input, specialSubjects, selectedSubject) {
    return (
        specialSubjects.has(selectedSubject) ||
        Boolean(input.closest('[data-ignore-order]')) ||
        Boolean(input.closest('[data-group]'))
    );
}

export function findScopedAnswer({
    inputs,
    userAnswer,
    getAnswerCandidates,
    isModelTopic,
    normalizeAnswer,
    stripModelWord,
}) {
    for (const input of inputs) {
        const original = input.dataset.answer.trim();
        const candidates = getAnswerCandidateList({
            input,
            getAnswerCandidates,
            isModelTopic,
            normalizeAnswer,
            stripModelWord,
        });

        if (candidates.includes(userAnswer)) {
            return original;
        }
    }

    return null;
}

function incrementCount(map, key) {
    map.set(key, (map.get(key) || 0) + 1);
}

function getAnswerCandidateList({
    input,
    getAnswerCandidates,
    isModelTopic,
    normalizeAnswer,
    stripModelWord,
}) {
    const answers = getAnswerCandidates
        ? getAnswerCandidates(input)
        : [input.dataset.answer.trim()];
    const candidates = [];

    answers.forEach((answer) => {
        const normalized = normalizeAnswer(answer);
        candidates.push(normalized);

        const competencyAlias = normalized.replace(/역량$/, '');

        if (competencyAlias !== normalized) {
            candidates.push(competencyAlias);
        }

        if (isModelTopic) {
            const modelAlias = stripModelWord(normalized);

            if (modelAlias && modelAlias !== normalized) {
                candidates.push(modelAlias);
            }
        }
    });

    return [...new Set(candidates)];
}

function findAvailableScopedAnswer({
    inputs,
    userAnswer,
    getAnswerCandidates,
    isModelTopic,
    normalizeAnswer,
    stripModelWord,
}) {
    const answerCounts = new Map();
    const usedCounts = new Map();

    inputs.forEach((input) => {
        incrementCount(answerCounts, normalizeAnswer(input.dataset.answer));

        if (input.classList.contains('correct')) {
            incrementCount(
                usedCounts,
                normalizeAnswer(input.value || input.dataset.answer)
            );
        }
    });

    for (const input of inputs) {
        const original = input.dataset.answer.trim();
        const normalized = normalizeAnswer(original);
        const candidates = getAnswerCandidateList({
            input,
            getAnswerCandidates,
            isModelTopic,
            normalizeAnswer,
            stripModelWord,
        });

        if (
            candidates.includes(userAnswer) &&
            (usedCounts.get(normalized) || 0) < (answerCounts.get(normalized) || 0)
        ) {
            return original;
        }
    }

    return null;
}

export function gradeGroupedAnswer({
    input,
    section,
    userAnswer,
    usedAnswersMap,
    getAnswerCandidates,
    ignoreOrder,
    isModelTopic,
    normalizeAnswer,
    stripModelWord,
}) {
    const group = input.closest('[data-group]') || section;

    if (!usedAnswersMap.has(group)) {
        usedAnswersMap.set(group, new Set());
    }

    const usedSet = usedAnswersMap.get(group);
    const inputs = Array.from(group.querySelectorAll('input[data-answer]'));
    const canonical = ignoreOrder
        ? findAvailableScopedAnswer({
              inputs,
              userAnswer,
              getAnswerCandidates,
              isModelTopic,
              normalizeAnswer,
              stripModelWord,
          })
        : findScopedAnswer({
              inputs: [input],
              userAnswer,
              getAnswerCandidates,
              isModelTopic,
              normalizeAnswer,
              stripModelWord,
          })
        ? input.dataset.answer
        : null;

    if (!canonical) {
        return { isCorrect: false, displayAnswer: input.dataset.answer };
    }

    const canonicalNorm = normalizeAnswer(canonical);

    if (!ignoreOrder && usedSet.has(canonicalNorm)) {
        return { isCorrect: false, displayAnswer: input.dataset.answer };
    }

    if (!ignoreOrder) {
        usedSet.add(canonicalNorm);
    }

    return { isCorrect: true, displayAnswer: canonical };
}

export function gradeDirectAnswer({
    input,
    userAnswer,
    selectedTopic,
    selectedSubject,
    constants,
    getAnswerCandidates,
    normalizeAnswer,
    stripModelWord,
    modelMatchMode = 'expanded',
}) {
    const correctAnswers = getAnswerCandidates(input).map((answer) =>
        normalizeAnswer(answer)
    );

    if (
        selectedTopic === constants.TOPICS.MORAL &&
        selectedSubject === constants.SUBJECTS.MUSIC_ELEMENTS
    ) {
        const originalAnswer = normalizeAnswer(input.dataset.answer);

        return {
            isCorrect: userAnswer === originalAnswer,
            displayAnswer: input.dataset.answer,
        };
    }

    if (correctAnswers.includes(userAnswer)) {
        return { isCorrect: true, displayAnswer: input.dataset.answer };
    }

    if (selectedTopic !== constants.TOPICS.MODEL) {
        return { isCorrect: false, displayAnswer: input.dataset.answer };
    }

    const userNoModel = stripModelWord(userAnswer);
    const correctNoModelList = correctAnswers.map((answer) =>
        stripModelWord(answer)
    );
    const isCorrect =
        modelMatchMode === 'strippedOnly'
            ? correctNoModelList.includes(userNoModel)
            : correctNoModelList.some((correct) => userAnswer === correct) ||
              correctAnswers.some((correct) => userNoModel === correct) ||
              correctNoModelList.some((correct) => userNoModel === correct);

    return { isCorrect, displayAnswer: input.dataset.answer };
}
