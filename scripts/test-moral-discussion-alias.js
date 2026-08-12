import assert from 'assert/strict';
import { readFileSync } from 'fs';

import { getAnswerCandidates } from '../modules/answer-candidates.js';
import { gradeGroupedAnswer } from '../modules/answer-grading.js';
import { gradeInputAnswer } from '../modules/answer-input-grader.js';
import { isGroupedGradingInput } from '../modules/answer-grading.js';

const partial = readFileSync(
    'partials/quiz-main-sections/ethics/moral-discussion.html',
    'utf8'
);

assert.match(
    partial,
    /data-answer="도덕적 문제 부각하기"[\s\S]*data-accept="도덕적 문제 부각시키기"/,
    'moral discussion should expose the alternative answer'
);

function createInput(answer, acceptedAnswer = '') {
    const input = {
        classList: {
            contains() {
                return false;
            },
        },
        dataset: { answer },
        getAttribute(name) {
            if (name === 'data-answer') return answer;
            if (name === 'data-accept') return acceptedAnswer;
            return null;
        },
        value: answer,
    };

    input.closest = (selector) =>
        selector === '[data-group]' || selector === '[data-ignore-order]'
            ? group
            : null;

    return input;
}

const group = {
    contains() {
        return false;
    },
    querySelectorAll() {
        return inputs;
    },
};
const inputs = [
    createInput('왜라는 질문하기'),
    createInput('도덕적 문제 부각하기', '도덕적 문제 부각시키기'),
    createInput('상황을 복잡하게 하기'),
];
inputs[1].value = '도덕적 문제 부각시키기';

const result = gradeInputAnswer({
    CONSTANTS: {
        SUBJECTS: { COMPETENCY: 'competency', AREA: 'area' },
        TOPICS: { MODEL: 'model', ACHIEVEMENT: 'achievement' },
    },
    SPECIAL_SUBJECTS: new Set(),
    gameState: {
        selectedSubject: 'ethics',
        selectedTopic: 'model',
    },
    gradeDirectAnswer: () => ({ isCorrect: false }),
    gradeGroupedAnswer,
    getAnswerCandidates,
    input: inputs[1],
    normalizeAnswer: (value) => value.trim().toLowerCase(),
    section: {},
    sectionMatchers: {
        isGenericModelTitleInput: () => false,
        isGroupedGradingInput,
        isIntegratedTitleInput: () => false,
        isPracticalTitleInput: () => false,
    },
    stripModelWord: (value) => value,
    usedAnswersMap: new Map(),
    userAnswer: '도덕적 문제 부각시키기',
});

assert.equal(
    result.isCorrect,
    true,
    'the alternative moral discussion answer should be accepted'
);
assert.equal(
    result.displayAnswer,
    '도덕적 문제 부각하기',
    'an accepted alias should display the canonical answer'
);

console.log('Moral discussion displays the canonical answer for an alias');
