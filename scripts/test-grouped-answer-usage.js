import assert from 'assert/strict';
import { readFileSync } from 'fs';

import { getAnswerCandidates } from '../modules/answer-candidates.js';
import { createAnswerFeedbackController } from '../modules/answer-feedback-controller.js';
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
        disabled: false,
        getAttribute(name) {
            return name === 'data-answer' ? answer : null;
        },
        markCorrect() {
            correct = true;
        },
        closest(selector) {
            return selector === '[data-group]' ||
                selector === '[data-ignore-order]'
                ? group
                : null;
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

const firstCoreIdeaCardInputs = [];
const secondCoreIdeaCardInputs = [];
const firstCoreIdeaCard = {
    querySelectorAll() {
        return firstCoreIdeaCardInputs;
    },
};
const secondCoreIdeaCard = {
    querySelectorAll() {
        return secondCoreIdeaCardInputs;
    },
};

firstCoreIdeaCardInputs.push(
    createInput('첫 번째 문장', firstCoreIdeaCard),
    createInput('두 번째 문장', firstCoreIdeaCard)
);
secondCoreIdeaCardInputs.push(
    createInput('세 번째 문장', secondCoreIdeaCard),
    createInput('네 번째 문장', secondCoreIdeaCard)
);

const coreIdeaUsedAnswers = new Map();
const gradeCoreIdeaAnswer = (input, answer) => {
    input.value = answer;

    return gradeGroupedAnswer({
        input,
        section: firstCoreIdeaCard,
        userAnswer: normalizeAnswer(answer),
        usedAnswersMap: coreIdeaUsedAnswers,
        getAnswerCandidates,
        ignoreOrder: true,
        isModelTopic: false,
        normalizeAnswer,
        stripModelWord: (value) => value,
    });
};

const crossCardResult = gradeCoreIdeaAnswer(
    firstCoreIdeaCardInputs[0],
    '세 번째 문장'
);
assert.equal(
    crossCardResult.isCorrect,
    false,
    'a core idea card should not consume an answer from another card'
);

const reversedFirstCardResult = gradeCoreIdeaAnswer(
    firstCoreIdeaCardInputs[0],
    '두 번째 문장'
);
assert.equal(
    reversedFirstCardResult.isCorrect,
    true,
    'a core idea card should accept its own answers in either order'
);
firstCoreIdeaCardInputs[0].markCorrect();

const remainingFirstCardResult = gradeCoreIdeaAnswer(
    firstCoreIdeaCardInputs[1],
    '첫 번째 문장'
);
assert.equal(
    remainingFirstCardResult.isCorrect,
    true,
    'the remaining answer should still be available within the same card'
);

const revealInputs = [];
const revealGroup = {
    querySelectorAll() {
        return revealInputs;
    },
};

revealInputs.push(
    createInput('왜라는 질문하기', revealGroup),
    createInput('도덕적 문제 부각하기', revealGroup),
    createInput('상황을 복잡하게 하기', revealGroup)
);
revealInputs[0].dataset.matchedAnswer = '도덕적 문제 부각하기';

const { revealInputWithAdvance } = createAnswerFeedbackController({});

revealInputWithAdvance(revealInputs[1]);
assert.equal(
    revealInputs[1].value,
    '왜라는 질문하기',
    'a second incorrect attempt should reveal an unused unordered answer'
);

revealInputWithAdvance(revealInputs[2]);
assert.equal(
    revealInputs[2].value,
    '상황을 복잡하게 하기',
    'later reveals should continue consuming distinct unordered answers'
);

const moralMethodsMarkup = readFileSync(
    new URL(
        '../partials/quiz-main-sections/moral-principles/moral-methods.html',
        import.meta.url
    ),
    'utf8'
);
const methodColumnTags = moralMethodsMarkup.match(
    /<div\s+class="method-column"[\s\S]*?>/g
);
const unorderedSubListTags = moralMethodsMarkup.match(
    /<ul\s+class="sub-list"[\s\S]*?data-ignore-order[\s\S]*?>/g
);

assert.equal(
    methodColumnTags?.some((tag) => tag.includes('data-ignore-order')),
    false,
    'method title inputs should keep ordered grading'
);
assert.equal(
    unorderedSubListTags?.length,
    3,
    'only the three method sub-lists should use unordered grading'
);
assert.equal(
    unorderedSubListTags?.every((tag) => tag.includes('data-group=')),
    true,
    'each unordered method sub-list should have its own answer pool'
);

console.log('Grouped grading rejects exhausted canonical answers');
