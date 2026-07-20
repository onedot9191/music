function getRemainingIgnoreOrderAnswers(inputs, classes, normalizeAnswer) {
    const answers = inputs.map((input) => input.dataset.answer);
    const remainingCounts = new Map();

    answers.forEach((answer) => {
        const normalized = normalizeAnswer(answer);
        remainingCounts.set(
            normalized,
            (remainingCounts.get(normalized) || 0) + 1
        );
    });

    inputs
        .filter((input) => input.classList.contains(classes.CORRECT))
        .forEach((input) => {
            const normalized = normalizeAnswer(
                input.value || input.dataset.answer
            );
            const remaining = remainingCounts.get(normalized) || 0;

            if (remaining > 0) {
                remainingCounts.set(normalized, remaining - 1);
            }
        });

    return answers.filter((answer) => {
        const normalized = normalizeAnswer(answer);
        const remaining = remainingCounts.get(normalized) || 0;

        if (remaining === 0) return false;

        remainingCounts.set(normalized, remaining - 1);
        return true;
    });
}

function revealInputs(inputs, options) {
    const inputList = Array.from(inputs);
    const {
        classes,
        ignoreOrder = false,
        markCorrectOnReveal = false,
        avoidCurrentValueFallback = false,
        normalizeAnswer = (value) => value,
    } = options;
    const answers = inputList.map((input) => input.dataset.answer);
    const remainingAnswers = ignoreOrder
        ? getRemainingIgnoreOrderAnswers(inputList, classes, normalizeAnswer)
        : [];

    let answerIndex = 0;

    inputList.forEach((input) => {
        input.classList.remove(classes.INCORRECT, classes.RETRYING);

        if (!input.classList.contains(classes.CORRECT)) {
            if (ignoreOrder) {
                let answer = remainingAnswers[answerIndex];

                if (answer == null && avoidCurrentValueFallback) {
                    const userAnswer = normalizeAnswer(input.value);
                    answer = answers.find(
                        (candidate) => normalizeAnswer(candidate) !== userAnswer
                    );
                }

                input.value = answer ?? input.dataset.answer;
            } else {
                input.value = input.dataset.answer;
            }

            if (ignoreOrder) answerIndex++;

            input.classList.add(classes.REVEALED);

            if (markCorrectOnReveal) {
                input.classList.add(classes.CORRECT);
            }
        }

        input.disabled = true;
    });
}

export function revealSectionAnswers(section, options) {
    if (!section) return;

    const groups = section.querySelectorAll('[data-group]');

    if (groups.length === 0) {
        revealInputs(section.querySelectorAll('input[data-answer]'), options);
        return;
    }

    groups.forEach((group) => {
        const inputs = group.querySelectorAll('input[data-answer]');

        revealInputs(inputs, {
            ...options,
            ignoreOrder: options.isIgnoreOrderScope(group, inputs[0]),
        });
    });
}

export function revealCompetencySectionAnswers(section, options) {
    if (!section) return;

    const groups = section.querySelectorAll('[data-group]');

    if (groups.length === 0) {
        const inputs = section.querySelectorAll('input[data-answer]');

        revealInputs(inputs, {
            ...options,
            ignoreOrder: true,
        });
        return;
    }

    groups.forEach((group) => {
        const inputs = group.querySelectorAll('input[data-answer]');

        revealInputs(inputs, {
            ...options,
            ignoreOrder: true,
            markCorrectOnReveal: true,
            avoidCurrentValueFallback: true,
        });
    });
}

export function revealCurrentCompetencyAnswers({
    classes,
    getMainElementId,
    isIgnoreOrderScope,
    normalizeAnswer,
}) {
    const mainId = getMainElementId();

    document.querySelectorAll(`#${mainId} section`).forEach((section) => {
        revealCompetencySectionAnswers(section, {
            classes,
            isIgnoreOrderScope,
            normalizeAnswer,
        });
    });
}
