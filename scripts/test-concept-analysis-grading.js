import assert from 'assert/strict';
import { readFileSync } from 'fs';

import {
    gradeDirectAnswer,
    gradeGroupedAnswer,
    isGroupedGradingInput,
} from '../modules/answer-grading.js';
import { getAnswerCandidates } from '../modules/answer-candidates.js';
import { gradeInputAnswer } from '../modules/answer-input-grader.js';

const partial = readFileSync(
    'partials/quiz-main-sections/ethics/concept-analysis.html',
    'utf8'
);
const canonicalAnswers = [
    '분석할 가치 개념의 확인',
    '개념의 전형적인 사례와 개념에 반대되는 사례 탐구',
    '개념의 경계에 해당하는 사례 확인',
    '개념과 관련된 개념의 분석',
    '가상적인 사태에의 적용',
    '분석한 의미의 수용 여부 검토와 정리',
];
const requestedAnswers = [
    '분석될 가치 개념의 확인',
    '개념의 전형적인 사례와 개념에 반대되는 사례 탐구',
    '개념의 경계에 해당하는 사례 확인',
    '그 개념과 관련된 개념의 분석',
    '가상적인 사태에의 적용',
    '분석된 의미의 수용 여부 검토와 정리',
];
const alternativeAnswers = canonicalAnswers.map((answer, index) =>
    requestedAnswers[index] === answer ? '' : requestedAnswers[index]
);

assert.doesNotMatch(
    partial,
    /data-group="concept-analysis-steps"|data-ignore-order/,
    'concept analysis steps should keep ordered grading'
);
canonicalAnswers.forEach((answer) => {
    assert.match(
        partial,
        new RegExp(`data-answer="${answer}"`),
        `concept analysis should include ${answer}`
    );
});
canonicalAnswers.forEach((answer, index) => {
    const alternative = alternativeAnswers[index];

    if (!alternative) return;

    assert.match(
        partial,
        new RegExp(
            `data-answer="${answer}"[\\s\\S]*data-accept="${alternative}"`
        ),
        `${alternative} should be an accepted alias of ${answer}`
    );
});

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
        value: '',
    };

    input.closest = () => null;

    return input;
}

const inputs = canonicalAnswers.map((answer, index) =>
    createInput(answer, alternativeAnswers[index])
);
const section = {};
const normalizeAnswer = (value) => value.trim().toLowerCase();
const gradeAtInput = (index, answer) => {
    inputs[index].value = answer;

    return gradeInputAnswer({
        CONSTANTS: {
            SUBJECTS: { COMPETENCY: 'competency', AREA: 'area' },
            TOPICS: { MODEL: 'model', ACHIEVEMENT: 'achievement' },
        },
        SPECIAL_SUBJECTS: new Set(),
        gameState: {
            selectedSubject: 'ethics',
            selectedTopic: 'model',
        },
        gradeDirectAnswer,
        gradeGroupedAnswer,
        getAnswerCandidates,
        input: inputs[index],
        normalizeAnswer,
        section,
        sectionMatchers: {
            isGenericModelTitleInput: () => false,
            isGroupedGradingInput,
            isIntegratedTitleInput: () => false,
            isPracticalTitleInput: () => false,
        },
        stripModelWord: (value) => value,
        usedAnswersMap: new Map(),
        userAnswer: normalizeAnswer(answer),
    });
};

canonicalAnswers.forEach((answer, index) => {
    const result = gradeAtInput(index, requestedAnswers[index]);

    assert.equal(
        result.isCorrect,
        true,
        'concept analysis answers should be accepted in their own input'
    );
    assert.equal(
        result.displayAnswer,
        canonicalAnswers[index],
        'accepted aliases should display their canonical answers'
    );
});

const wrongInputResult = gradeAtInput(0, canonicalAnswers[1]);

assert.equal(
    wrongInputResult.isCorrect,
    false,
    'concept analysis answers should not be accepted in another input'
);

const reversedAnswers = [...canonicalAnswers].reverse();
const reversedResults = reversedAnswers.map((answer, index) =>
    gradeAtInput(index, answer)
);

assert.equal(
    reversedResults.some((result) => result.isCorrect),
    false,
    'reversing concept analysis answers should not pass ordered grading'
);

console.log('Concept analysis accepts aliases and displays canonical answers');
