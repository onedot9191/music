import assert from 'assert/strict';

import { revealCompetencySectionAnswers } from '../modules/answer-reveal.js';

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
