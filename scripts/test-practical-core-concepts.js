import assert from 'assert/strict';
import fs from 'fs/promises';

import { shouldKeepAnswerHiddenAfterSecondIncorrect } from '../modules/answer-input-controller.js';
import { CONSTANTS } from '../modules/constants.js';

const partial = await fs.readFile(
    'partials/quiz-mains/practical-core-concepts.html',
    'utf8'
);
const practicalGrowthMarkup = await fs.readFile(
    'partials/quiz-main-sections/practical-std/growth.html',
    'utf8'
);
const expectedNutrientAnswersByGroup = new Map([
    ['energy-nutrients', ['탄수화물', '단백질', '지방']],
    ['body-building-nutrients', ['단백질', '무기질', '지방', '물']],
    ['regulating-nutrients', ['단백질', '무기질', '비타민', '물']],
]);

const groupMatches = [
    ...partial.matchAll(
        /<article\b[^>]*\bdata-group="[^"]+"[^>]*\bdata-ignore-order\b[^>]*>/g
    ),
];

assert.equal(
    groupMatches.length,
    4,
    'each practical core concept area should grade its answers in any order'
);
assert.equal(
    (partial.match(/data-answer=/g) || []).length,
    20,
    'the practical core concepts should keep all 20 answer inputs'
);
assert.match(
    partial,
    /class="practical-core-concept-inputs"/,
    'the answer inputs should use the compact grid layout'
);

assert.equal(
    shouldKeepAnswerHiddenAfterSecondIncorrect(CONSTANTS, {
        selectedSubject: CONSTANTS.SUBJECTS.PRACTICAL_CORE_CONCEPTS,
        selectedTopic: CONSTANTS.TOPICS.CORE_CONCEPTS,
    }),
    true,
    'practical core concept answers should remain hidden after a second incorrect attempt'
);
assert.equal(
    shouldKeepAnswerHiddenAfterSecondIncorrect(CONSTANTS, {
        selectedSubject: CONSTANTS.SUBJECTS.PRACTICAL_COURSE,
        selectedTopic: CONSTANTS.TOPICS.COURSE,
    }),
    false,
    'the no-reveal exception should not affect other practical topics'
);

expectedNutrientAnswersByGroup.forEach((expectedAnswers, groupName) => {
    const groupMarkup = practicalGrowthMarkup.match(
        new RegExp(
            `<span[^>]*data-group="${groupName}"[^>]*>([\\s\\S]*?)<\\/span>`
        )
    );
    const actualAnswers = Array.from(
        groupMarkup?.[1].matchAll(/data-answer="([^"]+)"/g) || [],
        (match) => match[1]
    );

    assert.equal(
        groupMarkup?.[0].includes('data-ignore-order'),
        true,
        `${groupName} should use unordered grading`
    );
    assert.deepEqual(
        actualAnswers,
        expectedAnswers,
        `${groupName} should use its own nutrient answer pool`
    );
});

console.log(
    'Practical core concept areas keep unordered grading and compact input grids'
);
