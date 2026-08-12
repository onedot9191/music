import assert from 'assert/strict';

import { getAnswerCandidates } from '../modules/answer-candidates.js';
import { gradeGroupedAnswer } from '../modules/answer-grading.js';

function createInput(answer, group) {
    let correct = false;

    return {
        classList: {
            contains(className) {
                return className === 'correct' && correct;
            },
        },
        dataset: { answer },
        getAttribute(name) {
            return name === 'data-answer' ? answer : null;
        },
        markCorrect() {
            correct = true;
        },
        closest(selector) {
            return selector === '[data-group]' ? group : null;
        },
        value: '',
    };
}

const inputs = [];
const group = {
    querySelectorAll() {
        return inputs;
    },
};

inputs.push(createInput('듣기·말하기', group), createInput('문법', group));

const normalizeAnswer = (value) => value.replace(/[\s⋅·]+/g, '').toLowerCase();
const usedAnswersMap = new Map();
const grade = (input, answer) => {
    input.value = answer;

    return gradeGroupedAnswer({
        input,
        section: group,
        userAnswer: normalizeAnswer(answer),
        usedAnswersMap,
        getAnswerCandidates,
        ignoreOrder: true,
        isModelTopic: false,
        normalizeAnswer,
        stripModelWord: (value) => value,
    });
};

const competencyInputs = [];
const competencyGroup = {
    querySelectorAll() {
        return competencyInputs;
    },
};

competencyInputs.push(
    createInput('공동체·대인관계 역량', competencyGroup),
    createInput('의사소통 역량', competencyGroup)
);
competencyInputs[0].value = '의사소통';

const competencyResult = gradeGroupedAnswer({
    input: competencyInputs[0],
    section: competencyGroup,
    userAnswer: normalizeAnswer('의사소통'),
    usedAnswersMap: new Map(),
    getAnswerCandidates,
    ignoreOrder: true,
    isModelTopic: false,
    normalizeAnswer,
    stripModelWord: (value) => value,
});

assert.equal(
    competencyResult.displayAnswer,
    '의사소통 역량',
    'an unordered competency alias should display its matched canonical answer'
);

const firstResult = grade(inputs[0], '문법');
assert.equal(firstResult.isCorrect, true, '문법 should be accepted once');
inputs[0].markCorrect();

const duplicateResult = grade(inputs[1], '문법');
assert.equal(
    duplicateResult.isCorrect,
    false,
    'an unordered group should reject an exhausted canonical answer'
);

console.log('Grouped grading rejects exhausted canonical answers');
