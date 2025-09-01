// === UTILITY FUNCTIONS MODULE ===
// 애플리케이션에서 사용되는 유틸리티 함수들을 정의합니다.

// === 시간 관련 유틸리티 ===
export const fmt = n => String(n).padStart(2, '0');
export const formatTime = s => `${fmt(Math.floor(s / 60))}:${fmt(s % 60)}`;
export const formatDateKey = (date = new Date()) => {
    return [date.getFullYear(), fmt(date.getMonth() + 1), fmt(date.getDate())].join('-');
};

// === 입력 너비 자동 조정 관련 ===
export function measureTextWidthForElement(text, element) {
    const canvas = measureTextWidthForElement._canvas || (measureTextWidthForElement._canvas = document.createElement('canvas'));
    const context = canvas.getContext('2d');
    const cs = getComputedStyle(element);
    // Build a reasonable font shorthand for canvas
    const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    context.font = font;
    const metrics = context.measureText(text || '');
    return metrics.width;
}

export function getAnswerCandidates(input) {
    const answers = [];
    const dataAnswer = input.getAttribute('data-answer');
    if (dataAnswer) answers.push(dataAnswer.trim());
    const accept = input.getAttribute('data-accept') || input.getAttribute('data-alias') || input.getAttribute('data-aliases');
    if (accept) accept.split(',').forEach(s => { const t = s.trim(); if (t) answers.push(t); });
    return answers.length ? answers : [''];
}

export function getLongestReferenceText(input) {
    const answers = getAnswerCandidates(input);
    return answers.reduce((longest, current) => current.length > longest.length ? current : longest, '');
}

export function setInputWidthToText(input, text) {
    const cs = getComputedStyle(input);
    const padding = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
    const border = (parseFloat(cs.borderLeftWidth) || 0) + (parseFloat(cs.borderRightWidth) || 0);
    const extra = 16; // slightly more breathing room
    const textWidth = measureTextWidthForElement(text, input);
    const widthPx = Math.ceil(textWidth + padding + border + extra);
    input.style.width = `${widthPx}px`;
}

export function applyAutoWidthForContainer(container) {
    if (!container) return;
    const inputs = container.querySelectorAll('.overview-question input[data-answer]');
    inputs.forEach(input => {
        const reference = getLongestReferenceText(input);
        const resize = () => {
            const base = reference;
            const dynamic = input.value && input.value.length > base.length ? input.value : base;
            setInputWidthToText(input, dynamic);
        };
        resize();
        input.addEventListener('input', resize);
    });
}

export function initAutoWidthCourse() {
    ['practical-quiz-main', 'overview-quiz-main', 'social-course-quiz-main', 'science-course-quiz-main', 'english-course-quiz-main', 'practical-course-quiz-main', 'music-course-quiz-main', 'art-course-quiz-main', 'korean-course-quiz-main'].forEach(id => {
        const container = document.getElementById(id);
        applyAutoWidthForContainer(container);
    });
}

// === 활동 히트맵 관련 ===
export function updateHeatmapTitle(stats) {
    const countEl = document.getElementById('heatmap-count');
    if (!countEl) return;
    const todayKey = formatDateKey();
    const today = stats.find(s => s.date === todayKey);
    const count = today ? today.count : 0;
    countEl.textContent = String(count);
}

export function renderHeatmap(stats) {
    const container = document.getElementById('activity-heatmap');
    if (!container) return;
    container.innerHTML = '';
    if (stats.length === 0) return;

    const firstDate = new Date(stats[0].date);
    let offset = (firstDate.getDay() + 6) % 7; // Monday = 0
    for (let i = 0; i < offset; i++) {
        const empty = document.createElement('div');
        empty.classList.add('heatmap-cell', 'empty');
        container.appendChild(empty);
    }

    const max = Math.max(...stats.map(s => s.count), 0);
    stats.forEach(({ date, count }) => {
        const cell = document.createElement('div');
        cell.classList.add('heatmap-cell');
        if (max > 0 && count > 0) {
            const level = Math.min(4, Math.ceil((count / max) * 4));
            cell.classList.add(`level-${level}`);
        }
        cell.title = `${date}: ${count}`;
        container.appendChild(cell);
    });
    updateHeatmapTitle(stats);
}

// === D-Day 관련 ===
export function calculateDDayText(targetDate) {
    const msPerDay = 24 * 60 * 60 * 1000;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const diffDays = Math.floor((target - today) / msPerDay);
    if (diffDays === 0) return 'D-Day';
    if (diffDays > 0) return `D-${diffDays}`;
    return `D+${Math.abs(diffDays)}`;
}

export function drawPixelMushroom(ctx) {
    // clear
    ctx.clearRect(0,0,20,20);
    const fill = (x,y,w,h,color) => {
        ctx.fillStyle = color; 
        ctx.fillRect(x,y,w,h);
    };
    // stem (베이지)
    fill(7,11,6,6,'#f4e3c3');
    // cap (빨강)
    fill(4,6,12,5,'#d9534f');
    fill(5,5,10,2,'#d9534f');
    // outline (검정)
    ctx.fillStyle = '#000';
    // 상단/측면 윤곽
    ctx.fillRect(5,5,10,1);
    ctx.fillRect(4,6,1,5);
    ctx.fillRect(16,6,1,5);
    ctx.fillRect(6,11,8,1); // 캡 하단 림
    // stem 윤곽
    ctx.fillRect(7,11,1,6);
    ctx.fillRect(12,11,1,6);
    ctx.fillRect(7,17,6,1);
    // dots (하양)
    fill(6,7,3,2,'#fff');
    fill(12,7,3,2,'#fff');
    // eyes (검정)
    fill(8,13,1,2,'#000');
    fill(11,13,1,2,'#000');
}

// === 문자열 처리 관련 ===
export function normalizeText(text) {
    return text.toLowerCase().replace(/\s+/g, '').trim();
}

export function removeParentheses(text) {
    return text.replace(/\([^)]*\)/g, '').trim();
}

export function extractChoices(text) {
    const match = text.match(/\(([^)]+)\)/);
    return match ? match[1].split(',').map(s => s.trim()) : [];
}

// === Overview 계층 들여쓰기 ===
export function applyOverviewHierarchyIndentation() {
    const overviewMain = document.getElementById('overview-quiz-main');
    if (!overviewMain) return;
    const items = overviewMain.querySelectorAll('.overview-question');
    items.forEach((el) => {
        const textStart = (el.textContent || '').trim();
        const sectionEl = el.closest('section');
        const inDesignSection = sectionEl && sectionEl.id === 'design';
        const inStandardSection = sectionEl && sectionEl.id === 'standard';
        let inStandardElementaryBlock = false;
        if (inStandardSection) {
            const block = el.closest('.creative-block');
            if (block) {
                const titleEl = block.querySelector('.outline-title');
                if (titleEl && (titleEl.textContent || '').trim().startsWith('2. 초등학교')) {
                    inStandardElementaryBlock = true;
                }
            }
        }

        // 섹션 II(설계와 운영) 전용 규칙:
        // - 상위: '가.' '나.' 등 한글+'.' 시작은 왼쪽 정렬
        // - 하위: '1)' '2)' 등 숫자+')' 시작은 1단계 들여쓰기
        // - 하위: '가)' '나)' 등 한글+')' 시작은 2단계 들여쓰기
        if (inDesignSection) {
            if (/^[가-힣]\.\s/.test(textStart)) {
                el.style.marginLeft = '0';
            } else if (/^\d+\)\s/.test(textStart)) {
                el.style.marginLeft = '2rem';
            } else if (/^[가-힣]\)\s/.test(textStart)) {
                el.style.marginLeft = '4rem';
            }
        }
        // 섹션 III(편성·운영 기준) 전용 규칙:
        // - 하위: '가.' '나.' 등 한글+'.' 시작은 1단계 들여쓰기
        // - 하위: '1)' '2)' 등 숫자+')' 시작은 2단계 들여쓰기
        // - 하위: '가)' '나)' 등 한글+')' 시작은 3단계 들여쓰기
        else if (inStandardSection && inStandardElementaryBlock) {
            if (/^[가-힣]\.\s/.test(textStart)) {
                el.style.marginLeft = '2rem';
            } else if (/^\d+\)\s/.test(textStart)) {
                el.style.marginLeft = '4rem';
            } else if (/^[가-힣]\)\s/.test(textStart)) {
                el.style.marginLeft = '6rem';
            }
        }
    });
}

// === 랜덤 선택 애니메이션 ===
export function getRandomColor() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// === 문자 효과 ===
export function setCharacterState(state, duration = 3000) {
    const character = document.getElementById('character-assistant');
    if (!character) return;
    
    character.className = 'character';
    character.classList.add(state);
    
    if (duration > 0) {
        setTimeout(() => {
            character.className = 'character';
        }, duration);
    }
}

// === 모달 관련 ===
export function openModal(modal) {
    if (!modal) return;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

export function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// === 슬롯 머신 관련 ===
export function animateSlotReel(reel, values, duration = 2000) {
    let startTime = null;
    const originalValue = reel.textContent;
    
    function animate(currentTime) {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        
        if (elapsed < duration) {
            const randomIndex = Math.floor(Math.random() * values.length);
            reel.textContent = values[randomIndex];
            reel.style.color = getRandomColor();
            requestAnimationFrame(animate);
        } else {
            // 애니메이션 종료 - 원래 값으로 복원
            reel.textContent = originalValue;
            reel.style.color = '';
        }
    }
    
    requestAnimationFrame(animate);
}

// === 입력 검증 ===
export function isValidAnswer(userAnswer, correctAnswer, acceptedAnswers = []) {
    const normalizedUser = normalizeText(userAnswer);
    const normalizedCorrect = normalizeText(correctAnswer);
    
    if (normalizedUser === normalizedCorrect) return true;
    
    return acceptedAnswers.some(answer => 
        normalizeText(answer) === normalizedUser
    );
}

// === 디바운스 함수 ===
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
