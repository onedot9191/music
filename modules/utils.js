// === UTILITY FUNCTIONS MODULE ===
// 날짜/시간 포맷과 이전 import 호환용 재수출을 담당합니다.

// === 시간 관련 유틸리티 ===
export const fmt = (n) => String(n).padStart(2, '0');
export const formatTime = (s) => `${fmt(Math.floor(s / 60))}:${fmt(s % 60)}`;
export const formatDateKey = (date = new Date()) => {
    return [
        date.getFullYear(),
        fmt(date.getMonth() + 1),
        fmt(date.getDate()),
    ].join('-');
};

// DOM/input sizing helpers live in dom-utils.js. Re-export them here for older imports.
export {
    measureTextWidthForElement,
    setInputWidthToText,
    applyAutoWidthForContainer,
    initAutoWidthCourse,
    protectHomeProjectInputs,
} from './dom-utils.js';
export {
    getAnswerCandidates,
    getLongestReferenceText,
} from './answer-candidates.js';
