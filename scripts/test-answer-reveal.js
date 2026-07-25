import assert from 'assert/strict';

import {
    revealMainAnswers,
    revealCompetencySectionAnswers,
    revealSectionAnswers,
} from '../modules/answer-reveal.js';

function createClassList() {
    const classes = new Set();

    return {
        add(...names) {
            names.forEach((name) => classes.add(name));
        },
        contains(name) {
            return classes.has(name);
        },
        remove(...names) {
            names.forEach((name) => classes.delete(name));
        },
    };
}

function createInput(answer, { correct = false, value = '' } = {}) {
    const input = {
        classList: createClassList(),
        dataset: { answer },
        disabled: false,
        value,
    };

    if (correct) input.classList.add('correct');

    return input;
}

const inputs = [
    createInput('공동체·대인관계 역량', {
        correct: true,
        value: '자기 성찰·계발 역량',
    }),
    createInput('자기 성찰·계발 역량'),
    createInput('디지털·미디어 역량'),
];

const section = {
    querySelectorAll(selector) {
        return selector === '[data-group]' ? [] : inputs;
    },
};

revealCompetencySectionAnswers(section, {
    classes: {
        CORRECT: 'correct',
        INCORRECT: 'incorrect',
        REVEALED: 'revealed',
        RETRYING: 'retrying',
    },
    isIgnoreOrderScope: () => false,
    normalizeAnswer: (value) => value.trim(),
});

assert.deepEqual(
    inputs.map((input) => input.value),
    ['자기 성찰·계발 역량', '공동체·대인관계 역량', '디지털·미디어 역량'],
    'competency reveal should preserve the learner answer and fill remaining answers'
);

const groupedInputs = [
    createInput('alpha', { correct: true, value: 'beta' }),
    createInput('beta'),
];
const orderedInput = createInput('gamma');
const group = {
    querySelectorAll() {
        return groupedInputs;
    },
};

groupedInputs.forEach((input) => {
    input.closest = (selector) => (selector === '[data-group]' ? group : null);
});
orderedInput.closest = () => null;

const mixedSection = {
    querySelectorAll(selector) {
        if (selector === '[data-group]') return [group];
        return [...groupedInputs, orderedInput];
    },
};

revealSectionAnswers(mixedSection, {
    classes: {
        CORRECT: 'correct',
        INCORRECT: 'incorrect',
        REVEALED: 'revealed',
        RETRYING: 'retrying',
    },
    isIgnoreOrderScope: (scope) => scope === group,
    normalizeAnswer: (value) => value.trim(),
});

assert.deepEqual(
    [...groupedInputs.map((input) => input.value), orderedInput.value],
    ['beta', 'alpha', 'gamma'],
    'grouped answers should reveal without order while ordered answers still reveal'
);

const finalRevealInputs = [
    createInput('one'),
    createInput('two', { correct: true, value: 'one' }),
    createInput('three'),
];
const finalRevealGroup = {
    querySelectorAll() {
        return finalRevealInputs;
    },
};
const finalRevealSection = {
    querySelectorAll(selector) {
        if (selector === '[data-group]') return [finalRevealGroup];
        return finalRevealInputs;
    },
};
const main = {
    querySelectorAll(selector) {
        return selector === 'section' ? [finalRevealSection] : [];
    },
};

revealMainAnswers(main, {
    classes: {
        CORRECT: 'correct',
        INCORRECT: 'incorrect',
        REVEALED: 'revealed',
        RETRYING: 'retrying',
    },
    isIgnoreOrderScope: (scope) => scope === finalRevealGroup,
    markCorrectOnReveal: true,
    normalizeAnswer: (value) => value.trim(),
});

assert.deepEqual(
    finalRevealInputs.map((input) => input.value),
    ['two', 'one', 'three'],
    'final reveal should not duplicate answers already correct in another position'
);
