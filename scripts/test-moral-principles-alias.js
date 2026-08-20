import assert from 'assert/strict';
import { readFileSync } from 'fs';

import { getAnswerCandidates } from '../modules/answer-candidates.js';
import { gradeGroupedAnswer } from '../modules/answer-grading.js';

const canonicalAnswer = '학교·가정·지역 사회와 연계한 지도의 원리';
const alternativeAnswer = '학교·가정·지역 사회의 연계에 의한 지도의 원리';
const partial = readFileSync(
    'partials/quiz-main-sections/moral-principles/moral-principles.html',
    'utf8'
);
const answerOffset = partial.indexOf(`data-answer="${canonicalAnswer}"`);
const inputStart = partial.lastIndexOf('<input', answerOffset);
const inputEnd = partial.indexOf('/>', answerOffset) + 2;
const inputMarkup = partial.slice(inputStart, inputEnd);

function getAttribute(name) {
    const value = inputMarkup.match(new RegExp(`${name}="([^"]*)"`))?.[1];

    if (value !== undefined) return value;

    return inputMarkup.includes(name) ? '' : null;
}

const input = {
    classList: {
        contains() {
            return false;
        },
    },
    dataset: { answer: canonicalAnswer },
    getAttribute,
    closest(selector) {
        return selector === '[data-group]' ? group : null;
    },
};
const group = {
    querySelectorAll() {
        return [input];
    },
};
const normalizeAnswer = (value) =>
    value.trim().replace(/\s+/g, '').toLowerCase();
const grade = (answer) =>
    gradeGroupedAnswer({
        input,
        section: group,
        userAnswer: normalizeAnswer(answer),
        usedAnswersMap: new Map(),
        getAnswerCandidates,
        ignoreOrder: true,
        isModelTopic: false,
        normalizeAnswer,
        stripModelWord: (value) => value,
    });

const canonicalResult = grade(canonicalAnswer);
const alternativeResult = grade(alternativeAnswer);

assert.equal(canonicalResult.isCorrect, true);
assert.equal(canonicalResult.displayAnswer, canonicalAnswer);
assert.equal(alternativeResult.isCorrect, true);
assert.equal(alternativeResult.displayAnswer, alternativeAnswer);

console.log('Moral principles displays the authored accepted answer');
