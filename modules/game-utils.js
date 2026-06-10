// === GAME UTILITIES MODULE ===
// 게임 로직 관련 유틸리티 함수들을 제공합니다.

import { CONSTANTS } from './constants.js';

/**
 * 답변을 정규화합니다 (공백, 특수문자 제거 등).
 * @param {string} str - 정규화할 문자열
 * @param {Object} gameState - 게임 상태 객체
 * @param {Function} isSpellingBlankMode - 맞춤법 빈칸 모드 확인 함수 (선택사항)
 * @returns {string} 정규화된 문자열
 */
export function normalizeAnswer(str, gameState, isSpellingBlankMode = null) {
    const ignoreParticleEui =
        gameState.selectedTopic === CONSTANTS.TOPICS.MODEL ||
        (gameState.selectedTopic === CONSTANTS.TOPICS.CURRICULUM &&
            (gameState.selectedSubject === CONSTANTS.SUBJECTS.OVERVIEW ||
                gameState.selectedSubject === CONSTANTS.SUBJECTS.CREATIVE ||
                (gameState.selectedSubject === CONSTANTS.SUBJECTS.SPELLING &&
                    isSpellingBlankMode &&
                    isSpellingBlankMode())));

    const pattern = ignoreParticleEui ? /[\s⋅·의]+/g : /[\s⋅·]+/g;

    const removeChevrons =
        gameState.selectedTopic === CONSTANTS.TOPICS.MODEL &&
        gameState.selectedSubject === CONSTANTS.SUBJECTS.PE_MODEL;

    // '기타' 주제 '음악요소'의 경우 괄호 내용을 제거하지 않음
    const shouldRemoveParentheses = !(
        gameState.selectedTopic === CONSTANTS.TOPICS.MORAL &&
        gameState.selectedSubject === CONSTANTS.SUBJECTS.MUSIC_ELEMENTS
    );

    let result = str;

    if (shouldRemoveParentheses) {
        result = result.replace(/\([^)]*\)/g, '');
    }

    result = result
        .trim()
        .replace(/,/g, '') // 콤마 무시
        .replace(pattern, '')
        .toLowerCase();

    if (removeChevrons) {
        result = result.replace(/>/g, '');
    }

    return result;
}

// 오답 추적과 문제 ID 생성은 wrong-answer-tracker.js에서 관리합니다.

/**
 * 메인 요소 ID를 가져옵니다.
 * @param {Object} gameState - 게임 상태 객체
 * @returns {string} 메인 요소 ID
 */
export function getMainElementId(gameState) {
    // 주제와 과목에 따라 올바른 메인 요소 결정
    if (gameState.selectedTopic === CONSTANTS.TOPICS.BASIC) {
        if (gameState.selectedSubject === CONSTANTS.SUBJECTS.MUSIC) {
            return 'music-basic-quiz-main';
        } else if (gameState.selectedSubject === CONSTANTS.SUBJECTS.ENGLISH) {
            return 'english-quiz-main';
        } else if (gameState.selectedSubject === CONSTANTS.SUBJECTS.ART_BASIC) {
            return 'art-basic-quiz-main';
        } else {
            return `${gameState.selectedSubject}-quiz-main`;
        }
    } else {
        if (gameState.selectedSubject === CONSTANTS.SUBJECTS.INTEGRATED_GUIDE) {
            return 'integrated-guide-overview';
        } else {
            return `${gameState.selectedSubject}-quiz-main`;
        }
    }
}

export function stripModelWord(str) {
    return str.replace(/모형/g, '').replace(/\s+/g, ' ').trim();
}

export function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
}

export function checkStageClear(sectionElement, classes) {
    const inputs = sectionElement.querySelectorAll('input[data-answer]');

    return (
        inputs.length > 0 &&
        [...inputs].every((input) => input.classList.contains(classes.CORRECT))
    );
}

export function isSectionComplete(sectionElement) {
    const inputs = sectionElement.querySelectorAll('input[data-answer]');

    return inputs.length > 0 && [...inputs].every((input) => input.disabled);
}

export function isQuizComplete({ getMainElementId }) {
    const main = document.getElementById(getMainElementId());
    if (!main) return false;

    const gatedInputs = main.querySelectorAll(
        'section.practical-section-disabled input[data-answer]'
    );
    if (gatedInputs.length > 0) return false;

    const inputs = Array.from(main.querySelectorAll('input[data-answer]'));

    return inputs.length > 0 && inputs.every((input) => input.disabled);
}

export function focusNextAvailableInput(input) {
    const main = input.closest('main');
    if (!main) return;

    const inputs = Array.from(main.querySelectorAll('input[data-answer]'));
    const currentIndex = inputs.indexOf(input);
    const nextInput = inputs
        .slice(currentIndex + 1)
        .find((candidate) => !candidate.disabled);

    if (!nextInput) return;

    nextInput.dataset.autoFocused = 'true';
    nextInput.focus();
    nextInput.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
    });
}
