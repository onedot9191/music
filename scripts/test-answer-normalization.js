import assert from 'assert/strict';

import { CONSTANTS } from '../modules/constants.js';
import { normalizeAnswer } from '../modules/game-utils.js';

const modelState = {
    selectedSubject: CONSTANTS.SUBJECTS.MATH_MODEL,
    selectedTopic: CONSTANTS.TOPICS.MODEL,
};

assert.equal(
    normalizeAnswer('개념의 정의', modelState),
    normalizeAnswer('개념 정의', modelState),
    'the particle 의 may be omitted'
);
assert.notEqual(
    normalizeAnswer('정의', modelState),
    normalizeAnswer('정', modelState),
    'lexical 의 in 정의 must not be omitted'
);
assert.notEqual(
    normalizeAnswer('의사 결정', modelState),
    normalizeAnswer('사 결정', modelState),
    'word-initial 의 must not be omitted'
);
assert.notEqual(
    normalizeAnswer('창의성', modelState),
    normalizeAnswer('창성', modelState),
    'word-medial 의 must not be omitted'
);
assert.notEqual(
    normalizeAnswer('인지 > 정의 > 심동', modelState),
    normalizeAnswer('인지 > 정 > 심동', modelState),
    'a lexical word ending in 의 must not be treated as a particle'
);
assert.equal(
    normalizeAnswer('삶의 안녕', modelState),
    normalizeAnswer('삶 안녕', modelState),
    'the particle 의 after the noun 삶 may be omitted'
);
for (const [withParticle, withoutParticle] of [
    ['몸의 움직임', '몸 움직임'],
    ['꿈의 가치', '꿈 가치'],
    ['곡의 형식', '곡 형식'],
]) {
    assert.equal(
        normalizeAnswer(withParticle, modelState),
        normalizeAnswer(withoutParticle, modelState),
        `the particle 의 may be omitted from ${withParticle}`
    );
}
assert.notEqual(
    normalizeAnswer('토의 토론', modelState),
    normalizeAnswer('토 토론', modelState),
    'lexical 의 in 토의 must not be omitted'
);
assert.equal(
    normalizeAnswer('개념적 지식(원리)', modelState),
    normalizeAnswer('개념적 지식', modelState),
    'existing parenthetical-answer behavior must remain unchanged'
);

console.log('Answer normalization distinguishes particle and lexical 의');
