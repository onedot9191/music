import assert from 'node:assert/strict';

import {
    DEFAULT_CORE_IDEA_BLANK_PARTS,
    normalizeSelectedBlankPart,
    normalizeCoreIdeaSettings,
} from '../modules/integrated-core-ideas-mode.js';

const answerSources = [
    '내가 누구인지 생각하며 생활한다',
    '서로 관계를 맺으며 생활한다',
];

const defaultSettings = normalizeCoreIdeaSettings({}, answerSources);

assert.equal(defaultSettings.mode, 'full');
assert.deepEqual(defaultSettings.blankParts, DEFAULT_CORE_IDEA_BLANK_PARTS);

const customSettings = normalizeCoreIdeaSettings(
    {
        blankParts: ['내가 누구인지'],
        mode: 'partial',
    },
    answerSources
);

assert.equal(customSettings.mode, 'partial');
assert.equal(customSettings.blankParts[0], '내가 누구인지');
assert.equal(
    customSettings.blankParts[1],
    DEFAULT_CORE_IDEA_BLANK_PARTS[1],
    'missing blank parts should retain their usable defaults'
);

const legacyWhitespaceSettings = normalizeCoreIdeaSettings(
    {
        blankParts: ['  생각하며  '],
        mode: 'partial',
    },
    answerSources
);

assert.equal(
    legacyWhitespaceSettings.blankParts[0],
    '생각하며',
    'legacy single-string settings should retain a trimmed selection'
);

const legacyMultipleSettings = normalizeCoreIdeaSettings(
    {
        blankParts: [['생각하며', '생활한다']],
        mode: 'partial',
    },
    answerSources
);

assert.equal(
    legacyMultipleSettings.blankParts[0],
    '생각하며',
    'legacy multiple selections should retain only the first blank'
);

const invalidSettings = normalizeCoreIdeaSettings(
    {
        blankParts: ['문장에 없는 구절'],
        mode: 'unknown',
    },
    answerSources
);

assert.equal(invalidSettings.mode, 'full');
assert.equal(
    invalidSettings.blankParts[0],
    DEFAULT_CORE_IDEA_BLANK_PARTS[0],
    'a blank part must be a phrase from its source sentence'
);

assert.equal(
    normalizeSelectedBlankPart('내가 누구인지.', answerSources[0]),
    '내가 누구인지',
    'a dragged selection may include a trailing sentence mark'
);
assert.equal(
    normalizeSelectedBlankPart('문장에 없는 구절', answerSources[0]),
    '',
    'a dragged selection must stay within its source sentence'
);
console.log('Integrated core idea mode settings keep usable local defaults');
