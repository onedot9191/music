// === UI UTILITIES MODULE ===
// UI 관련 유틸리티 함수들을 제공합니다.

import { CONSTANTS } from './constants.js';
import { formatTime } from './utils.js';

// --- 빈칸 너비 조정 관련 함수들 ---

/**
 * 텍스트의 실제 렌더링 너비를 측정합니다.
 * @param {string} text - 측정할 텍스트
 * @param {HTMLElement} element - 참조할 DOM 요소 (폰트 스타일 추출용)
 * @returns {number} 텍스트 너비 (픽셀)
 */
export function measureTextWidthForElement(text, element) {
    const canvas = measureTextWidthForElement._canvas || (measureTextWidthForElement._canvas = document.createElement('canvas'));
    const context = canvas.getContext('2d');
    const cs = getComputedStyle(element);
    
    // 캔버스용 적절한 폰트 약어 생성
    const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    context.font = font;
    
    const metrics = context.measureText(text || '');
    return metrics.width;
}

/**
 * 입력 필드의 정답 후보들을 추출합니다.
 * @param {HTMLInputElement} input - 입력 요소
 * @returns {string[]} 정답 후보 배열
 */
export function getAnswerCandidates(input) {
    const answers = [];
    
    const dataAnswer = input.getAttribute('data-answer');
    if (dataAnswer) {
        const trimmedAnswer = dataAnswer.trim();
        answers.push(trimmedAnswer);
        
        // 괄호가 있는 경우 추가 정답 후보 생성
        const parenMatch = trimmedAnswer.match(/([^(]*)\(([^)]*)\)(.*)/);
        if (parenMatch) {
            const beforeParen = parenMatch[1];
            const parenContent = parenMatch[2];
            const afterParen = parenMatch[3] || '';
            
            // 괄호 제거 버전
            const withoutParen = beforeParen + afterParen;
            if (withoutParen && withoutParen !== trimmedAnswer) {
                answers.push(withoutParen);
            }
            
            // 괄호 내용이 앞 단어에 붙은 버전
            if (beforeParen && parenContent) {
                const mergedWithBefore = beforeParen + parenContent + afterParen;
                if (mergedWithBefore && mergedWithBefore !== trimmedAnswer && mergedWithBefore !== withoutParen) {
                    answers.push(mergedWithBefore);
                }
            }
            
            // 괄호 내용만 있는 버전
            if (parenContent && parenContent !== trimmedAnswer) {
                answers.push(parenContent + afterParen);
            }
        }
    }
    
    const accept = input.getAttribute('data-accept') || input.getAttribute('data-alias') || input.getAttribute('data-aliases');
    if (accept) accept.split(',').forEach(s => { const t = s.trim(); if (t) answers.push(t); });
    
    return answers.length ? answers : [''];
}

/**
 * 입력 필드의 가장 긴 참조 텍스트를 반환합니다.
 * @param {HTMLInputElement} input - 입력 요소
 * @returns {string} 가장 긴 정답 후보
 */
export function getLongestReferenceText(input) {
    const answers = getAnswerCandidates(input);
    return answers.reduce((longest, current) => current.length > longest.length ? current : longest, '');
}

/**
 * 입력 필드의 너비를 텍스트 길이에 맞춰 조정합니다.
 * @param {HTMLInputElement} input - 입력 요소
 * @param {string} text - 참조 텍스트
 */
export function setInputWidthToText(input, text) {
    // 홈 프로젝트 파트 내부의 입력 필드는 너비 조정하지 않음
    if (input.closest('.home-project-part')) {
        return;
    }
    
    const cs = getComputedStyle(input);
    const padding = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
    const border = (parseFloat(cs.borderLeftWidth) || 0) + (parseFloat(cs.borderRightWidth) || 0);
    const extra = 16; // slightly more breathing room
    
    const textWidth = measureTextWidthForElement(text, input);
    const widthPx = Math.ceil(textWidth + padding + border + extra);
    
    input.style.width = `${widthPx}px`;
}

/**
 * 컨테이너 내의 모든 입력 필드에 자동 너비를 적용합니다.
 * @param {HTMLElement} container - 컨테이너 요소
 */
export function applyAutoWidthForContainer(container) {
    if (!container) return;
    
    const inputs = container.querySelectorAll('.overview-question input[data-answer]');
    
    inputs.forEach(input => {
        // 홈 프로젝트 파트 내부의 입력 필드는 자동 너비 조정에서 제외
        if (input.closest('.home-project-part')) {
            return;
        }
        
        const reference = getLongestReferenceText(input);
        
        const resize = () => {
            const base = reference;
            // 채점 및 입력 중에도 초기 기준 너비만 유지하여 레이아웃 변형 방지
            setInputWidthToText(input, base);
        };
        
        // INP 개선을 위한 리사이즈 함수 디바운스
        let resizeTimeout;
        const debouncedResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(resize, 16); // ~60fps
        };
        
        resize();
        input.addEventListener('input', debouncedResize);
    });
}

/**
 * 모든 코스 컨테이너에 자동 너비를 초기화합니다.
 */
export function initAutoWidthCourse() {
    const containerIds = [
        'overview-quiz-main',
        'social-course-quiz-main',
        'social-quiz-main',
        'science-quiz-main',
        'science-course-quiz-main',
        'english-course-quiz-main',
        'practical-course-quiz-main',
        'music-course-quiz-main',
        'art-course-quiz-main',
        'korean-course-quiz-main',
        'eastern-ethics-quiz-main',
        'western-ethics-quiz-main',
        'moral-psychology-quiz-main',
        'integrated-guide-overview'
    ];
    
    containerIds.forEach(id => {
        const container = document.getElementById(id);
        if (container) {
            applyAutoWidthForContainer(container);
        }
    });
}

/**
 * 홈 프로젝트 파트 내부의 입력 필드 너비를 보호합니다.
 */
export function protectHomeProjectInputs() {
    const homeProjectInputs = document.querySelectorAll('.home-project-part input');
    homeProjectInputs.forEach(input => {
        // 기본 너비 설정
        input.style.width = '100%';
        
        // MutationObserver로 스타일 변경 감지 및 방지
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const currentWidth = input.style.width;
                    if (currentWidth !== '100%' && currentWidth !== '') {
                        input.style.width = '100%';
                    }
                }
            });
        });
        
        observer.observe(input, {
            attributes: true,
            attributeFilter: ['style']
        });
        
        // 클래스 변경 시에도 너비 복원
        input.addEventListener('classChange', () => {
            setTimeout(() => {
                input.style.width = '100%';
            }, 0);
        });
    });
}

// --- 모달 관리 함수들 ---

let lastFocusedElement = null;

/**
 * 모달에 포커스를 설정합니다.
 * @param {HTMLElement} modalEl - 모달 요소
 */
export function focusModal(modalEl) {
    const content = modalEl.querySelector('.modal-content');
    if (!content) return;
    
    if (!content.hasAttribute('tabindex')) {
        content.setAttribute('tabindex', '-1');
    }
    
    content.focus({ preventScroll: true });
}

/**
 * 모달을 엽니다.
 * @param {HTMLElement} modalEl - 모달 요소
 */
export function openModal(modalEl) {
    lastFocusedElement = document.activeElement;
    modalEl.classList.add(CONSTANTS.CSS_CLASSES.ACTIVE);
    focusModal(modalEl);
}

/**
 * 모달을 닫습니다.
 * @param {HTMLElement} modalEl - 모달 요소
 */
export function closeModal(modalEl) {
    modalEl.classList.remove(CONSTANTS.CSS_CLASSES.ACTIVE);
    
    if (lastFocusedElement && document.body.contains(lastFocusedElement)) {
        try {
            lastFocusedElement.focus({ preventScroll: true });
        } catch (_) {}
    }
    
    lastFocusedElement = null;
}

// --- 기타 UI 함수들 ---

/**
 * 시간 설정 표시를 업데이트합니다.
 * @param {HTMLElement} timeSettingDisplay - 시간 표시 요소
 * @param {number} duration - 시간 (초)
 */
export function updateTimeSettingDisplay(timeSettingDisplay, duration) {
    if (timeSettingDisplay) {
        timeSettingDisplay.textContent = formatTime(duration);
    }
}

/**
 * 컨테이너 내의 첫 번째 입력 필드에 포커스를 설정합니다.
 * @param {HTMLElement} container - 컨테이너 요소
 */
export function focusFirstInput(container) {
    const firstInput = container.querySelector('input[data-answer]:not([disabled])');
    if (firstInput) {
        firstInput.focus();
        firstInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}
