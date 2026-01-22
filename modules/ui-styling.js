// === UI STYLING MODULE ===
// Overview 계층 들여쓰기 및 보라색 텍스트 스타일링 관련 함수들

/**
 * Overview 계층 구조에 따라 들여쓰기 적용
 */
export function applyOverviewHierarchyIndentation() {
    const overviewMain = document.getElementById('overview-quiz-main');
    const integratedGuideMain = document.getElementById('integrated-guide-overview');
    
    if (!overviewMain && !integratedGuideMain) return;
    
    const items = overviewMain ? overviewMain.querySelectorAll('.overview-question') : [];
    const integratedGuideItems = integratedGuideMain ? integratedGuideMain.querySelectorAll('.overview-question') : [];
    const allItems = [...items, ...integratedGuideItems];
    
    allItems.forEach((el) => {
        const textStart = (el.textContent || '').trim();
        const sectionEl = el.closest('section');
        const inNatureSection = sectionEl && sectionEl.id === 'nature';
        const inDirectionSection = sectionEl && sectionEl.id === 'direction';
        const inDesignSection = sectionEl && sectionEl.id === 'design';
        const inStandardSection = sectionEl && sectionEl.id === 'standard';
        
        let inStandardElementaryBlock = false;
        let inStandardOperationCriteria = false;
        
        if (inStandardSection) {
            const block = el.closest('.creative-block');
            if (block) {
                const titleEl = block.querySelector('.outline-title');
                if (titleEl && (titleEl.textContent || '').trim().startsWith('2. 초등학교')) {
                    inStandardElementaryBlock = true;
                    
                    // '나. 교육과정 편성⋅운영 기준' 파트 확인
                    // 블록 내의 모든 요소를 순회하여 sub-title을 찾고, 현재 요소가 그 이후인지 확인
                    const allBlockElements = Array.from(block.querySelectorAll('.overview-question, .sub-title, .outline-title'));
                    for (let i = 0; i < allBlockElements.length; i++) {
                        const element = allBlockElements[i];
                        if (element.classList.contains('sub-title')) {
                            const subTitleText = (element.textContent || '').trim();
                            if (subTitleText.includes('나. 교육과정 편성') && subTitleText.includes('운영 기준')) {
                                // 현재 요소가 이 sub-title 이후에 있는지 확인
                                const currentIndex = allBlockElements.indexOf(el);
                                if (currentIndex > i) {
                                    inStandardOperationCriteria = true;
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
        
        // 1~3번째 섹션의 블록 들여쓰기 규칙 (반대로 적용)
        let isSub;
        
        if (inNatureSection || inDirectionSection) {
            // 섹션 I(교육과정의 성격, 구성의 방향) 반대 규칙:
            // - 상위: 패턴 매치 (괄호/숫자/한글 기호로 시작) 또는 ordinal 마커 (첫째, 둘째, 셋째, 넷째 등)
            // - 하위: 패턴 매치 안 함 (괄호/숫자/한글 기호로 시작하지 않음)
            const matchesPattern = /^(?:\[[^\]]+\]|[0-9]{1,3}[.)]|[가-힣]{1}[.)]|[①-⑳])/.test(textStart);
            
            // ordinal 마커를 가진 항목 (첫째, 둘째, 셋째, 넷째 등)도 상위로 처리
            const hasOrdinalMarker = el.querySelector('span[data-marker="ordinal"]') !== null;
            
            isSub = !matchesPattern && !hasOrdinalMarker; // 패턴 매치하거나 ordinal 마커가 있으면 상위, 그 외는 하위
            // 다른 섹션들에는 디자인 강조 제거
            el.classList.remove('design-emphasis');
        } else if (inDesignSection) {
            // 섹션 II(설계와 운영) 반대 규칙:
            // - 상위: '1)' '2)' 또는 '①' 등 숫자/원형 숫자
            // - 하위: '가.' '나.' 등 한글+'.' 시작
            const isTopKoreanDot = /^[가-힣]\./.test(textStart);
            const isNumericOrCircled = /^(?:[0-9]{1,3}[)]|[①-⑳])/.test(textStart);
            
            // 반대로: '가.' 형태면 하위, 숫자/원형 숫자면 상위, 그 외 기본 하위
            isSub = isTopKoreanDot || (!isNumericOrCircled);
            
            // 강조(보라 테두리): 숫자/원형 숫자 항목만 (반대로)
            // 단, "4. 모든 학생을 위한 교육기회의 제공" 블록은 제외
            let excludeEmphasis = false;
            const designBlock = el.closest('.creative-block');
            
            if (designBlock) {
                const titleEl = designBlock.querySelector('.outline-title');
                const titleText = (titleEl && titleEl.textContent) ? titleEl.textContent.trim() : '';
                if (titleText.startsWith('4.') || titleText.includes('모든 학생을 위한 교육기회의 제공')) {
                    excludeEmphasis = true;
                }
            }
            
            // 숫자 + ')' 항목의 붉은 테두리 제거
            el.classList.remove('design-emphasis');
        } else if (inStandardOperationCriteria) {
            // III-2. 초등학교 '나. 교육과정 편성⋅운영 기준' 파트 반대 규칙:
            // - 상위: '가)' '나)' ... 한글 괄호, '①' 등 원형 숫자 → 왼쪽 정렬
            // - 하위: '1)' '2)' ... 숫자 괄호 → 들여쓰기
            const isTopNumericParen = /^[0-9]{1,3}[)]/.test(textStart);
            const isKoreanParen = /^[가-힣][)]/.test(textStart);
            const isCircledNumeric = /^[①-⑳]/.test(textStart);
            
            // 반대로: 숫자 괄호면 하위, 한글 괄호/원형 숫자면 상위
            isSub = isTopNumericParen && !(isKoreanParen || isCircledNumeric);
            
        } else if (inStandardElementaryBlock) {
            // III-2. 초등학교 전용 규칙:
            // - 상위: '1)' '2)' ... 숫자 괄호 → 왼쪽 정렬
            // - 하위: '가)' '나)' ... 한글 괄호, '①' 등 원형 숫자 → 들여쓰기
            const isTopNumericParen = /^[0-9]{1,3}[)]/.test(textStart);
            const isKoreanParen = /^[가-힣][)]/.test(textStart);
            const isCircledNumeric = /^[①-⑳]/.test(textStart);
            
            isSub = !isTopNumericParen && (isKoreanParen || isCircledNumeric);
        } else {
            // 기존 전역 규칙 (괄호/숫자/한글 기호로 시작하면 하위)
            isSub = /^(?:\[[^\]]+\]|[0-9]{1,3}[.)]|[가-힣]{1}[.)]|[①-⑳])/.test(textStart);
            // 다른 섹션들에는 디자인 강조 제거
            el.classList.remove('design-emphasis');
        }
        
        el.classList.remove('overview-top', 'overview-sub');
        el.classList.add(isSub ? 'overview-sub' : 'overview-top');
        
        // III-2. 초등학교의 상위 숫자항목(1),2),...) 강조 표시 제거
        // 숫자 + ')' 항목의 붉은 테두리 제거
        el.classList.remove('standard-emphasis');
    });
}

/**
 * 과학 모형 빈칸 주변 텍스트 보라색 적용
 * @param {Object} gameState - 게임 상태 객체
 * @param {Object} CONSTANTS - 상수 객체
 */
export function applyScienceModelPurpleText(gameState, CONSTANTS) {
    // '모형' 주제 '과학' 과목인지 확인
    const isScienceModel = gameState.selectedTopic === CONSTANTS.TOPICS.MODEL &&
                           gameState.selectedSubject === CONSTANTS.SUBJECTS.SCIENCE;
    
    if (!isScienceModel) return;
    
    // 모든 빈칸 주변 텍스트 요소 찾기
    const overviewQuestions = document.querySelectorAll('.overview-question');
    
    overviewQuestions.forEach(question => {
        // 기존 보라색 스타일 제거
        question.classList.remove('science-model-purple-text');
        
        // 빈칸이 있는 경우에만 보라색 적용
        const inputs = question.querySelectorAll('input[data-answer]');
        if (inputs.length > 0) {
            question.classList.add('science-model-purple-text');
        }
    });
}

/**
 * 기타 도형 빈칸 주변 텍스트 보라색 적용
 * @param {Object} gameState - 게임 상태 객체
 * @param {Object} CONSTANTS - 상수 객체
 */
export function applyGeometryMoralPurpleText(gameState, CONSTANTS) {
    // '기타' 주제 '도형' 과목인지 확인
    const isGeometryMoral = gameState.selectedTopic === CONSTANTS.TOPICS.MORAL &&
                            gameState.selectedSubject === CONSTANTS.SUBJECTS.GEOMETRY;
    
    if (!isGeometryMoral) return;
    
    // 모든 빈칸 주변 텍스트 요소 찾기
    const overviewQuestions = document.querySelectorAll('.overview-question');
    
    overviewQuestions.forEach(question => {
        // 기존 보라색 스타일 제거
        question.classList.remove('science-model-purple-text');
        
        // 빈칸이 있는 경우에만 보라색 적용
        const inputs = question.querySelectorAll('input[data-answer]');
        if (inputs.length > 0) {
            question.classList.add('science-model-purple-text');
        }
    });
}

/**
 * 보라색 텍스트 스타일 적용 (조건부)
 * @param {Object} gameState - 게임 상태 객체
 * @param {Object} CONSTANTS - 상수 객체
 */
export function applyPurpleTextStyles(gameState, CONSTANTS) {
    if (gameState.selectedTopic === CONSTANTS.TOPICS.MODEL &&
        gameState.selectedSubject === CONSTANTS.SUBJECTS.SCIENCE) {
        applyScienceModelPurpleText(gameState, CONSTANTS);
    } else if (gameState.selectedTopic === CONSTANTS.TOPICS.MORAL &&
               gameState.selectedSubject === CONSTANTS.SUBJECTS.GEOMETRY) {
        applyGeometryMoralPurpleText(gameState, CONSTANTS);
    } else {
        // 다른 과목에서는 보라색 클래스 제거
        const overviewQuestions = document.querySelectorAll('.overview-question');
        overviewQuestions.forEach(question => {
            question.classList.remove('science-model-purple-text');
        });
    }
}
