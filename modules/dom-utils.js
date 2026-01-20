// === DOM UTILITIES MODULE ===
// DOM 조작 및 빈칸 너비 조정 관련 유틸리티 함수들

/**
 * 입력 요소와 동일한 폰트를 사용하여 캔버스로 텍스트 너비 측정
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
 * 입력 요소의 정답 후보들을 추출
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
 * 가장 긴 참조 텍스트 반환
 */
export function getLongestReferenceText(input) {
    const answers = getAnswerCandidates(input);
    return answers.reduce((longest, current) => current.length > longest.length ? current : longest, '');
}

/**
 * 입력 요소의 너비를 텍스트에 맞게 설정
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
 * 컨테이너 내의 모든 입력 요소에 자동 너비 적용
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
 * 여러 컨테이너에 자동 너비 초기화
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
        applyAutoWidthForContainer(container);
    });
}

/**
 * 홈 프로젝트 파트 빈칸 너비 보호 로직
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
