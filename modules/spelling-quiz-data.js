// === SPELLING QUIZ DATA HELPERS MODULE ===
// 맞춤법 퀴즈 데이터셋 선택, 문항 셔플, 괄호 선택지 파싱을 담당합니다.

import {
    SPELLING_DATA_ALL,
    SPELLING_DATA_BASIC,
    SPELLING_DATA_EXTENDED,
} from './spelling-data.js';

const DATASET_BY_ID = Object.freeze({
    basic: SPELLING_DATA_BASIC,
    extended: SPELLING_DATA_EXTENDED,
    all: SPELLING_DATA_ALL,
});

export function getSpellingDataset(datasetId = 'basic') {
    return DATASET_BY_ID[datasetId] || SPELLING_DATA_BASIC;
}

export function createSpellingQuestionSet(datasetId = 'basic') {
    return shuffleArray(getSpellingDataset(datasetId));
}

export function extractSpellingChoices(sentence, random = Math.random) {
    const match = sentence.match(/\(([^)]+)\)/);
    if (!match) return null;

    const choices = match[1].split(',').map((choice) => choice.trim());

    if (random() < 0.5) {
        choices.reverse();
    }

    return {
        choices,
        position: match.index,
        fullMatch: match[0],
    };
}

function shuffleArray(array) {
    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
}
