    // 모듈 임포트
    import { StorageManager } from './modules/storage.js';
    import { CONSTANTS, SUBJECT_NAMES, TOPIC_NAMES } from './modules/constants.js';
    import { AudioManager } from './modules/audio.js';
    import { getNextDDay, formatDateKey, fmt, formatTime } from './modules/utils.js';
    import { createDDayRenderer } from './modules/dday.js';
    import { createModalManager } from './modules/modal.js';
    import { SPELLING_DATA_BASIC, SPELLING_DATA_EXTENDED, SPELLING_DATA_ALL } from './modules/spelling-data.js';
    import {
        measureTextWidthForElement,
        getAnswerCandidates,
        getLongestReferenceText,
        setInputWidthToText,
        applyAutoWidthForContainer,
        initAutoWidthCourse,
        protectHomeProjectInputs
    } from './modules/dom-utils.js';
    import {
        applyOverviewHierarchyIndentation,
        applyScienceModelPurpleText,
        applyGeometryMoralPurpleText,
        applyPurpleTextStyles
    } from './modules/ui-styling.js';
    import {
        saveDailyStats,
        saveSubjectAccuracy,
        getSubjectAccuracy,
        checkSubjectAccuracyThreshold,
        markSubjectAccuracyAchieved,
        checkSubjectAccuracyAchieved,
        getDailyStats,
        updateHeatmapTitle,
        renderHeatmap,
        render6MonthHeatmap,
        getTodayBlankCount
    } from './modules/stats-manager.js';

    document.addEventListener('DOMContentLoaded', () => {
        // 효과음 토글 텍스트 업데이트
        const soundToggle = document.getElementById('sound-toggle');
        const soundToggleText = document.querySelector('.sound-toggle-text');
        
        function updateSoundToggleText() {
            if (soundToggleText) {
                soundToggleText.textContent = soundToggle && soundToggle.checked ? 'On' : 'Off';
            }
        }
        
        // 초기 텍스트 설정
        updateSoundToggleText();
        
        // 체크박스 변경 시 텍스트 업데이트
        if (soundToggle) {
            soundToggle.addEventListener('change', updateSoundToggleText);
        }



        // --- 오디오 관리자 ---
        // AudioManager는 오디오 컨텍스트와 오디오 잠금 해제를 자동으로 처리합니다
        const audioManager = new AudioManager();





        // --- 상수 ---
        // CONSTANTS, SUBJECT_NAMES, TOPIC_NAMES는 modules/constants.js에서 import됨
        // SPELLING_DATA는 modules/spelling-data.js에서 import됨



        // --- 빈칸 자동 너비 조정 (답변 길이에 맞춤) ---
        // DOM 유틸리티 함수들은 modules/dom-utils.js에서 import됨

        // 렌더링이 안정될 때까지 지연
        requestAnimationFrame(() => { initAutoWidthCourse(); });

        // 홈 프로젝트 파트 빈칸 너비 보호 로직 초기 실행
        requestAnimationFrame(() => {
            protectHomeProjectInputs();
        });



        // --- 게임 상태 ---

        const gameState = {

            duration: CONSTANTS.DEFAULT_DURATION,

            total: CONSTANTS.DEFAULT_DURATION,

            timerId: null,

            combo: 0,

            isForceQuit: false,

            lastSpecialPopupCount: 0, // 마지막으로 특별 팝업이 표시된 카운트

            selectedSubject: CONSTANTS.SUBJECTS.MUSIC,

            selectedTopic: CONSTANTS.TOPICS.CURRICULUM,

            gameMode: CONSTANTS.MODES.NORMAL,
            
            normalModeDuration: CONSTANTS.DEFAULT_DURATION, // Normal 모드의 duration 저장

            isRandomizing: false,

            typingInterval: null,

            // 맞춤법 관련 상태

            spelling: {

                questions: [],

                currentQuestionIndex: 0,

                score: 0,

                answered: false,

                roundCompleted: false,

                selectedDataset: 'basic' // 기본값

            }

        };

        // --- 저장소 관리자 ---
        const storageManager = new StorageManager();

        const SPECIAL_SUBJECTS = new Set([

            CONSTANTS.SUBJECTS.COMPETENCY,

            CONSTANTS.SUBJECTS.AREA,

            CONSTANTS.SUBJECTS.MORAL_PRINCIPLES

        ]);



        // 역량/영역 섹션에서 일치된 답변 추적용

        let usedAnswersMap = new WeakMap();



        // --- DOM 요소 ---

        const timeEl = document.getElementById('time');

        const barEl = document.querySelector('#bar > div');

        const comboCounter = document.getElementById('combo-counter');

        // showAnswersBtn 제거됨 - 기능이 결과창의 정답 보기 버튼으로 통합됨

        const startGameBtn = document.getElementById('start-game-btn');

        const forceQuitBtn = document.getElementById('force-quit-btn');

        const resetBtn = document.getElementById('reset-btn');


        const character = document.getElementById('character-assistant');

        const headerTitle = document.getElementById('header-title');

        const stageClearModal = document.getElementById('stage-clear-modal');

        const progressModal = document.getElementById('progress-modal');

        const closeProgressModalBtn = document.getElementById('close-progress-modal-btn');

        const scrapResultImageBtn = document.getElementById('scrap-result-image-btn');

        const scrapResultImageBtnTop = document.getElementById('scrap-result-image-btn-top');

        const startModal = document.getElementById('start-modal');

        const settingsPanel = document.getElementById('settings-panel');

        const timeSettingDisplay = document.getElementById('time-setting-display');

        const decreaseTimeBtn = document.getElementById('decrease-time');

        const increaseTimeBtn = document.getElementById('increase-time');

        const timeSetterWrapper = document.getElementById('time-setter-wrapper');

        const topicSelector = document.querySelector('.topic-selector');

        const subjectSelector = document.querySelector('.subject-selector');

        const subjectSelectionTitle = document.getElementById('subject-selection-title');
        const topicSelectionTitle = document.getElementById('topic-selection-title');

        const curriculumBreak = document.getElementById('curriculum-break');

        const modelBreak = document.getElementById('model-break');

        const quizContainers = document.querySelectorAll('main[id$="-quiz-main"], #integrated-guide-overview');

        const modalCharacterPlaceholder = document.getElementById('modal-character-placeholder');

        const speechBubble = document.querySelector('.speech-bubble');

        const resultDialogue = document.getElementById('result-dialogue');

        const resultTitle = document.getElementById('result-title');

        const resultSubject = document.getElementById('result-subject');

        const resultTopic = document.getElementById('result-topic');

        const resultProgress = document.getElementById('result-progress');

        const resultPercentage = document.getElementById('result-percentage');

        const slotMachineEl = document.getElementById('slot-machine');

        const slotReels = slotMachineEl.querySelectorAll('.reel');

        

        // --- Overview (총론) 계층 들여쓰기 적용 ---

        function applyOverviewHierarchyIndentation() {

            const overviewMain = document.getElementById('overview-quiz-main');
            const integratedGuideMain = document.getElementById('integrated-guide-overview');

            if (!overviewMain && !integratedGuideMain) return;

            const items = overviewMain ? overviewMain.querySelectorAll('.overview-question') : [];
            const integratedGuideItems = integratedGuideMain ? integratedGuideMain.querySelectorAll('.overview-question') : [];
            const allItems = [...items, ...integratedGuideItems];

            allItems.forEach((el) => {

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

                // - 하위: '1)' '2)' 또는 '①' 등은 들여쓰기

                // 그 외 섹션은 기존 규칙 유지

                let isSub;

                if (inDesignSection) {

                    const isTopKoreanDot = /^[가-힣]\./.test(textStart);

                    const isNumericOrCircled = /^(?:[0-9]{1,3}[)]|[①-⑳])/.test(textStart);

                    // '가.' 형태면 상위, 숫자/원형 숫자면 하위, 그 외 기본 상위

                    isSub = !isTopKoreanDot && isNumericOrCircled;

                    // 강조(보라 테두리): 가., 나., 다., 라. 등 상위 항목만

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

                    if (isTopKoreanDot && !excludeEmphasis) {

                        el.classList.add('design-emphasis');

                    } else {

                        el.classList.remove('design-emphasis');

                    }

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



                // III-2. 초등학교의 상위 숫자항목(1),2),...) 강조 표시

                if (inStandardElementaryBlock && /^[0-9]{1,3}[)]/.test(textStart)) {

                    el.classList.add('standard-emphasis');

                } else {

                    el.classList.remove('standard-emphasis');

                }

            });

        }



        // --- 과학 모형 빈칸 주변 텍스트 보라색 적용 ---

        function applyScienceModelPurpleText() {
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

        // --- 기타 도형 빈칸 주변 텍스트 보라색 적용 ---

        function applyGeometryMoralPurpleText() {
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

        // 초기 적용

        applyOverviewHierarchyIndentation();

        // 보라색 텍스트는 지정된 과목에서만 적용
        if (gameState.selectedTopic === CONSTANTS.TOPICS.MODEL &&
            gameState.selectedSubject === CONSTANTS.SUBJECTS.SCIENCE) {
            applyPurpleTextStyles(gameState, CONSTANTS);
        } else if (gameState.selectedTopic === CONSTANTS.TOPICS.MORAL &&
                   gameState.selectedSubject === CONSTANTS.SUBJECTS.GEOMETRY) {
        } else {
            // 다른 과목에서는 보라색 클래스 제거
            const overviewQuestions = document.querySelectorAll('.overview-question');
            overviewQuestions.forEach(question => {
                question.classList.remove('science-model-purple-text');
            });
        }

        // 총론 내부 탭 클릭 시 재적용

        const overviewTabs = document.querySelector('#overview-quiz-main .tabs');

        if (overviewTabs) {

            overviewTabs.addEventListener('click', () => {

                requestAnimationFrame(() => {
                    applyOverviewHierarchyIndentation();
                    applyPurpleTextStyles(gameState, CONSTANTS);
                });

            });

        }

        // 동양윤리 내부 탭 클릭 시 재적용

        const easternEthicsTabs = document.querySelector('#eastern-ethics-quiz-main .tabs');

        if (easternEthicsTabs) {

            easternEthicsTabs.addEventListener('click', () => {

                requestAnimationFrame(() => {
                    applyOverviewHierarchyIndentation();
                    applyPurpleTextStyles(gameState, CONSTANTS);
                });

            });

        }

        // 서양윤리 내부 탭 클릭 시 재적용

        const westernEthicsTabs = document.querySelector('#western-ethics-quiz-main .tabs');

        if (westernEthicsTabs) {

            westernEthicsTabs.addEventListener('click', () => {

                requestAnimationFrame(() => {
                    applyOverviewHierarchyIndentation();
                    applyPurpleTextStyles(gameState, CONSTANTS);
                });

            });

        }

        // 도덕 심리학 내부 탭 클릭 시 재적용

        const moralPsychologyTabs = document.querySelector('#moral-psychology-quiz-main .tabs');

        if (moralPsychologyTabs) {

            moralPsychologyTabs.addEventListener('click', () => {

                requestAnimationFrame(() => {
                    applyOverviewHierarchyIndentation();
                    applyPurpleTextStyles(gameState, CONSTANTS);
                });

            });

        }

        // 통합 지도서 내부 탭 클릭 시 재적용

        const integratedGuideTabs = document.querySelector('#integrated-guide-overview .tabs');

        if (integratedGuideTabs) {

            integratedGuideTabs.addEventListener('click', () => {

                requestAnimationFrame(() => {
                    applyOverviewHierarchyIndentation();
                    applyPurpleTextStyles(gameState, CONSTANTS);
                });
            });
        }



        // --- 모달 포커스 헬퍼 ---
        // 모달 관리 함수들은 modules/modal.js에서 import됨
        const modalManager = createModalManager();
        const { openModal: openModalBase, closeModal: closeModalBase, focusModal } = modalManager;
        
        // CONSTANTS.CSS_CLASSES.ACTIVE를 사용하도록 래퍼 함수 생성
        function openModal(modalEl) {
            modalEl.classList.add(CONSTANTS.CSS_CLASSES.ACTIVE);
            openModalBase(modalEl);
        }
        
        function closeModal(modalEl) {
            modalEl.classList.remove(CONSTANTS.CSS_CLASSES.ACTIVE);
            closeModalBase(modalEl);
        }



        // --- 오디오 ---
        // AudioManager를 사용하므로 중복 코드 제거
        // 호환성을 위해 기존 변수명 유지 (AudioManager의 audioElements 참조)
        const successAudio = audioManager.audioElements.success;
        const timeupAudio = audioManager.audioElements.timeup;
        const startAudio = audioManager.audioElements.start;
        const failAudio = audioManager.audioElements.fail;
        const clearAudio = audioManager.audioElements.clear;
        const randomAudio = audioManager.audioElements.random;
        const clickAudio = audioManager.audioElements.click;
        const slotWinAudio = audioManager.audioElements.slotWin;
        const specialBlankAudio = audioManager.audioElements.great;

        

        // --- 유틸리티 함수 ---
        // formatDateKey, fmt, formatTime은 modules/utils.js에서 import됨



        function resetUsedAnswers() {

            usedAnswersMap = new WeakMap();

        }



        // 통계 관리 함수들은 modules/stats-manager.js에서 import됨

        function updateSubjectButtonStates() {

            const subjectButtons = document.querySelectorAll('.subject-btn');

            subjectButtons.forEach(button => {

                const subject = button.dataset.subject;

                // 한번 달성했으면 계속 유지, 아니면 현재 정답률로 판단
                if (subject && (checkSubjectAccuracyAchieved(subject) || checkSubjectAccuracyThreshold(subject, 70))) {

                    button.classList.add('high-accuracy');

                } else {

                    button.classList.remove('high-accuracy');

                }

            });

        }



        // getDailyStats는 modules/stats-manager.js에서 import됨



        // updateHeatmapTitle은 modules/stats-manager.js에서 import됨

        function showSpecialBlankCountPopup(count) {
            // 기존 팝업 제거 (중복 방지)
            const existingPopup = document.getElementById('special-blank-count-popup');
            if (existingPopup) {
                existingPopup.remove();
            }

            // 마지막 팝업 카운트 업데이트
            gameState.lastSpecialPopupCount = count;

            const specialPopup = document.createElement('div');
            specialPopup.id = 'special-blank-count-popup';
            specialPopup.className = 'special-blank-count-popup';
            specialPopup.innerHTML = `
                오늘 푼 빈칸 <span class="special-count-highlight">${count}</span>개 돌파!
                <div class="special-popup-sparkles">
                    <div class="sparkle"></div>
                    <div class="sparkle"></div>
                    <div class="sparkle"></div>
                    <div class="sparkle"></div>
                    <div class="sparkle"></div>
                    <div class="sparkle"></div>
                </div>
            `;

            document.body.appendChild(specialPopup);

            // 특별 빈칸 팝업 효과음 재생 (hit.mp3 우선 중지)
            audioManager.stopAllAudio();
            playSound(specialBlankAudio);

            // 3초 후 자동 제거
            setTimeout(() => {
                if (specialPopup.parentNode) {
                    specialPopup.parentNode.removeChild(specialPopup);
                }
            }, 3000);
        }

        function updateTodayBlankCount() {
            try {
                // getTodayBlankCount는 modules/stats-manager.js에서 import됨
                const count = getTodayBlankCount();


                const countEl = document.getElementById('today-blank-count-number');
                if (countEl) {
                    countEl.textContent = String(count);
                }

                // 50의 배수일 경우 특별 팝업 표시 (이미 표시된 카운트거나 강제 종료 시에는 표시하지 않음)
                if (count > 0 && count % 50 === 0 && count !== gameState.lastSpecialPopupCount && !gameState.isForceQuit) {
                    showSpecialBlankCountPopup(count);
                }

                // 강제 종료 플래그 초기화
                if (gameState.isForceQuit) {
                    gameState.isForceQuit = false;
                }
            } catch (error) {
                console.warn('Failed to update today blank count:', error);
                // 오류 발생 시 안전하게 0으로 표시
                const countEl = document.getElementById('today-blank-count-number');
                if (countEl) {
                    countEl.textContent = '0';
                }
            }
        }



        // renderHeatmap은 modules/stats-manager.js에서 import됨



        // --- 6개월 히트맵 팝업 ---
        // render6MonthHeatmap은 modules/stats-manager.js에서 import됨

        // 6개월 히트맵 모달 열기/닫기
        const expandHeatmapBtn = document.getElementById('expand-heatmap-btn');
        const sixMonthModal = document.getElementById('six-month-heatmap-modal');
        const closeSixMonthBtn = document.getElementById('close-six-month-heatmap');

        if (expandHeatmapBtn && sixMonthModal) {
            expandHeatmapBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                render6MonthHeatmap();
                sixMonthModal.classList.remove('hidden');
                sixMonthModal.classList.add('active');
            });
        }

        if (closeSixMonthBtn && sixMonthModal) {
            closeSixMonthBtn.addEventListener('click', () => {
                sixMonthModal.classList.remove('active');
                sixMonthModal.classList.add('hidden');
            });
            
            // 모달 배경 클릭 시 닫기
            sixMonthModal.addEventListener('click', (e) => {
                if (e.target === sixMonthModal) {
                    sixMonthModal.classList.remove('active');
                    sixMonthModal.classList.add('hidden');
                }
            });
        }



        // --- D-DAY ---
        // D-Day 렌더링 함수는 modules/dday.js에서 import됨
        const renderDDay = createDDayRenderer();



        // 오디오 재생 함수 - AudioManager 사용으로 간소화
        // 기존 시그니처 유지하여 호환성 보장
        function playSound(audioElement) {
            // 효과음 스위치가 OFF인 경우 재생하지 않음
            if (window.isSoundEnabled && !window.isSoundEnabled()) {
                return;
            }

            if (!audioElement || typeof audioElement.play !== 'function') {
                console.error('Provided element is not a valid audio element.');
                return;
            }

            // AudioManager의 audioElements에서 해당 오디오 타입 찾기
            const audioType = Object.keys(audioManager.audioElements).find(
                key => audioManager.audioElements[key] === audioElement
            );

            if (audioType) {
                // AudioManager의 playSound 메서드 사용
                audioManager.playSound(audioType);
            } else {
                // 호환성을 위해 기존 방식으로 폴백
            const play = () => {
                try {
                    audioElement.currentTime = 0;
                    const playPromise = audioElement.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(err => {
                            console.error(`Audio playback failed for ${audioElement.src}:`, err);
                            if (err.name === 'NotAllowedError') {
                                console.warn('Audio autoplay was prevented. User interaction may be required.');
                            }
                        });
                    }
                } catch (err) {
                    console.error(`Error playing audio ${audioElement.src}:`, err);
                }
            };

            if (audioManager && audioManager.audioContext && audioManager.audioContext.state === 'suspended') {
                    audioManager.audioContext.resume()
                        .then(() => play())
                    .catch(err => {
                        console.warn('Failed to resume AudioContext:', err);
                        play();
                    });
            } else {
                play();
            }
            }
        }



        function normalizeAnswer(str) {

            const ignoreParticleEui =

                gameState.selectedTopic === CONSTANTS.TOPICS.MODEL ||

                (

                    gameState.selectedTopic === CONSTANTS.TOPICS.CURRICULUM &&

                    (

                                        gameState.selectedSubject === CONSTANTS.SUBJECTS.OVERVIEW ||

                gameState.selectedSubject === CONSTANTS.SUBJECTS.CREATIVE ||

                (gameState.selectedSubject === CONSTANTS.SUBJECTS.SPELLING && isSpellingBlankMode())

                    )

                );

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

                .replace(/,/g, '')  // 콤마 무시

                .replace(pattern, '')

                .toLowerCase();



            if (removeChevrons) {

                result = result.replace(/>/g, '');

            }



            return result;

        }



        function typewriter(element, text) {

            if (gameState.typingInterval) {

                clearInterval(gameState.typingInterval);

            }

            element.innerHTML = '';

            let i = 0;

            gameState.typingInterval = setInterval(() => {

                if (i < text.length) {

                    const char = text.charAt(i);

                    element.innerHTML += char === '\n' ? '<br>' : char;

                    i++;

                } else {

                    clearInterval(gameState.typingInterval);

                    gameState.typingInterval = null;

                }

            }, 50);

        }

        // === 오답 추적 관련 함수들 ===

        // 문제 ID 생성 함수
        function generateQuestionId(input) {
            const section = input.closest('section');
            const sectionId = section ? section.id : 'unknown';
            const answer = input.dataset.answer || '';
            const inputIndex = Array.from(section.querySelectorAll('input[data-answer]')).indexOf(input);

            // 섹션 ID, 정답, 입력 순서를 조합하여 고유 ID 생성
            const questionId = `${sectionId}_${answer}_${inputIndex}`;
            return questionId;
        }

        // 오답 횟수 추적 함수
        function trackWrongAnswer(input) {
            const questionId = generateQuestionId(input);
            const currentCount = storageManager.getWrongCount(gameState.selectedSubject, gameState.selectedTopic, questionId);
            const newCount = currentCount + 1;

            storageManager.saveWrongAnswer(gameState.selectedSubject, gameState.selectedTopic, questionId, newCount);

            return newCount;
        }

        // 오답 표시 여부 확인 함수
        function shouldShowWrongAnswerIndicator(input) {
            const questionId = generateQuestionId(input);
            const wrongCount = storageManager.getWrongCount(gameState.selectedSubject, gameState.selectedTopic, questionId);

            // 이미 정답 처리된 문제는 표시하지 않음
            if (storageManager.isAnsweredCorrectly(gameState.selectedSubject, gameState.selectedTopic, questionId)) {
                return false;
            }

            // RETRYING 상태에서 INCORRECT 상태로 바뀌는 순간 표시 (2차 오답)
            // 또는 이전에 이미 2차 오답을 경험한 경우 계속 표시
            return wrongCount >= 1;
        }

        // 오답 표시 업데이트 함수
        function updateWrongAnswerIndicators() {
            const mainId = getMainElementId();
            const inputs = document.querySelectorAll(`#${mainId} input[data-answer]`);
            const { selectedSubject, selectedTopic } = gameState;

            inputs.forEach(input => {
                const questionId = generateQuestionId(input);
                const wrongCount = storageManager.getWrongCount(selectedSubject, selectedTopic, questionId);

                // 정답 처리된 문제는 오답 표시하지 않음
                if (storageManager.isAnsweredCorrectly(selectedSubject, selectedTopic, questionId)) {
                    input.classList.remove('wrong-answer-indicator');
                } else if (wrongCount >= 1) {
                    input.classList.add('wrong-answer-indicator');
                } else {
                    input.classList.remove('wrong-answer-indicator');
                }
            });
        }

        // 즉시 오답 표시 업데이트 함수
        function updateWrongAnswerIndicatorsImmediate() {
            requestAnimationFrame(() => {
                updateWrongAnswerIndicators();
            });
        }


        // 모션 감소 설정 존중

        const PREFERS_REDUCED_MOTION =

            typeof window.matchMedia === 'function' &&

            window.matchMedia('(prefers-reduced-motion: reduce)').matches;



        // 모바일 기기인지 확인 (집중 효과 비활성화용)

        const IS_MOBILE = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||

            window.innerWidth <= 768;



        // --- 파티클 효과 ---

        // 통합된 spawnTypingParticles 함수 (더 나은 버전 사용)
        function spawnTypingParticles(element, color) {
            // 성능 개선을 위해 모바일 기기에서 파티클 생략
            if (IS_MOBILE || PREFERS_REDUCED_MOTION) {
                return;
            }

            try {
                const rect = element.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                const num = 6;

                for (let i = 0; i < num; i++) {
                    const p = document.createElement('span');
                    p.className = 'typing-particle';
                    p.style.backgroundColor = color;
                    p.style.left = `${cx}px`;
                    p.style.top = `${cy}px`;
                    
                    const angle = Math.random() * Math.PI * 2;
                    const dist = 8 + Math.random() * 18;
                    const dx = Math.cos(angle) * dist;
                    const dy = Math.sin(angle) * dist;
                    
                    p.style.setProperty('--tx', `${dx.toFixed(1)}px`);
                    p.style.setProperty('--ty', `${dy.toFixed(1)}px`);
                    
                    document.body.appendChild(p);
                    p.addEventListener('animationend', () => {
                        if (p && p.parentNode) p.parentNode.removeChild(p);
                    }, { once: true });
                }
            } catch (_) { /* no-op */ }
        }



        // 통합된 spawnComboConfetti 함수 (더 나은 버전 사용)
        function spawnComboConfetti(element, colors = ['#39ff14', '#00ffff', '#ffffff']) {
            // 성능 개선을 위해 모바일 기기에서 confetti 생략
            if (IS_MOBILE || PREFERS_REDUCED_MOTION) {
                return;
            }

            try {
                const rect = element.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                const num = 12;

                for (let i = 0; i < num; i++) {
                    const s = document.createElement('span');
                    s.className = 'confetti-piece';
                    s.style.backgroundColor = colors[i % colors.length];
                    s.style.left = `${cx}px`;
                    s.style.top = `${cy}px`;
                    
                    const angle = Math.random() * Math.PI * 2;
                    const speed = 40 + Math.random() * 60;
                    const dx = Math.cos(angle) * speed;
                    const dy = Math.sin(angle) * speed - 20;
                    const rot = (Math.random() * 360 - 180).toFixed(1);
                    
                    s.style.setProperty('--dx', `${dx.toFixed(1)}px`);
                    s.style.setProperty('--dy', `${dy.toFixed(1)}px`);
                    s.style.setProperty('--dr', `${rot}deg`);
                    
                    document.body.appendChild(s);
                    s.addEventListener('animationend', () => {
                        if (s && s.parentNode) s.parentNode.removeChild(s);
                    }, { once: true });
                }
            } catch (_) { /* no-op */ }
        }

        // 유틸리티 함수: 랜덤 범위
        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        // 유틸리티 함수: 모형 단어 제거
        function stripModelWord(str) {
            return str.replace(/모형/g, '').replace(/\s+/g, ' ').trim();
        }



        // --- UI 업데이트 함수 ---

        function updateTimeSettingDisplay() {

            timeSettingDisplay.textContent = formatTime(gameState.duration);

        }

        // --- 슬롯 머신 ---

        const SLOT_SYMBOLS = [

            '🍒',

            '🍋',

            '🔔',

            '⭐',

            '7',

            '🍉',

            '🍇',

            '💎',

            '👑',

            '🍀'

        ];

        const slotMachine = {

            index: 0,

            predetermined: [],

            randomSymbol() {

                return SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];

            },

            generateSymbols() {

                const symbols = [];

                symbols[0] = this.randomSymbol();

                // 첫 두 릴이 일치할 확률 증가

                symbols[1] = Math.random() < 0.9 ? symbols[0] : this.randomSymbol();

                if (symbols[1] === symbols[0]) {

                    symbols[2] = Math.random() < 0.5 ? symbols[0] : this.randomSymbol();

                } else {

                    if (Math.random() < 0.5) {

                        symbols[2] = Math.random() < 0.5 ? symbols[0] : symbols[1];

                    } else {

                        symbols[2] = this.randomSymbol();

                    }

                }

                return symbols;

            },

            start() {

                if (!slotMachineEl) return;

                this.index = 0;

                this.predetermined = this.generateSymbols();

                slotMachineEl.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);

                slotReels.forEach(reel => {

                    reel.textContent = '?';

                    reel.classList.remove('revealed');

                });

            },

            stopNext() {

                if (this.index >= slotReels.length) return;

                const reel = slotReels[this.index];

                reel.textContent = this.predetermined[this.index];

                reel.classList.add('revealed');

                setTimeout(() => reel.classList.remove('revealed'), 300);

                this.index++;

                if (this.index === slotReels.length) {

                    this.checkWin();

                }

            },

            checkWin() {

                const values = Array.from(slotReels).map(r => r.textContent);

                if (values.every(v => v === values[0])) {

                    playSound(slotWinAudio);

                    slotMachineEl.classList.add('win');

                    setTimeout(() => slotMachineEl.classList.remove('win'), 1000);

                    slotMachineEl.classList.add("win-lights");

                    setTimeout(() => slotMachineEl.classList.remove("win-lights"), 800);

                }

                setTimeout(() => this.start(), 1000);

            },

            reset() {

                slotReels.forEach(reel => reel.textContent = '?');

                this.predetermined = [];

                this.index = 0;

                if (slotMachineEl) slotMachineEl.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);

            }

        };



       function focusFirstInput(container) {

           const firstInput = container.querySelector('input[data-answer]:not([disabled])');

           if (firstInput) {

               firstInput.focus();

               firstInput.scrollIntoView({ behavior: 'smooth', block: 'center' });

           }

       }



       function adjustCreativeInputWidths() {

        document.querySelectorAll('#creative-quiz-main .creative-question input[data-answer], #overview-quiz-main .overview-question input[data-answer], #integrated-course-quiz-main .overview-question input[data-answer], #moral-course-quiz-main .overview-question input[data-answer], #eastern-ethics-quiz-main .overview-question input[data-answer], #western-ethics-quiz-main .overview-question input[data-answer], #moral-psychology-quiz-main .overview-question input[data-answer], #pe-course-quiz-main .overview-question input[data-answer], #pe-back-quiz-main .pe-back-input, #science-std-quiz-main .overview-question input[data-answer], #english-std-quiz-main .overview-question input[data-answer], #practical-std-quiz-main .overview-question input[data-answer], #practical-std-quiz-main #info-education .overview-question input[data-answer], #social-34-quiz-main .overview-question input[data-answer], #social-56-quiz-main .overview-question input[data-answer], #life-achievement-quiz-main .overview-question input[data-answer], #wise-achievement-quiz-main .overview-question input[data-answer], #joy-achievement-quiz-main .overview-question input[data-answer], #music-std-quiz-main .overview-question input[data-answer], #korean-std-quiz-main .overview-question input[data-answer], #art-std-quiz-main .overview-question input[data-answer], #math-operation-quiz-main .overview-question input[data-answer], #change-relation-quiz-main .overview-question input[data-answer], #geometry-measure-quiz-main .overview-question input[data-answer], #geometry-quiz-main .overview-question input[data-answer], #data-probability-quiz-main .overview-question input[data-answer], #math-course-quiz-main .overview-question input[data-answer], #science-course-quiz-main .overview-question input[data-answer], #practical-course-quiz-main .overview-question input[data-answer], #music-course-quiz-main .overview-question input[data-answer], #english-course-quiz-main .overview-question input[data-answer], #art-course-quiz-main .overview-question input[data-answer], #korean-course-quiz-main .overview-question input[data-answer], #integrated-guide-overview .overview-question input[data-answer]')

                .forEach(input => {

                    const answer = input.dataset.answer || '';

                    const answerLen = answer.length;

                    const hasHangul = /[\u3131-\uD79D]/.test(answer);

                    // 체육 과목과 도형 과목은 적절한 factor로 빈칸 너비 조정
                    const isPECourse = input.closest('#pe-course-quiz-main') !== null;
                    const isGeometryCourse = input.closest('#geometry-quiz-main') !== null;

                    const factor = hasHangul ? (isPECourse ? 1.5 : (isGeometryCourse ? 1.4 : 1.6)) : 1.3;

                    const desired = Math.max(2, Math.ceil(answerLen * factor) + 4);

                    const inlineWidth = parseInt(input.style.width) || 0;

                    const attrSize = parseInt(input.getAttribute('size')) || 0;

                    const current = Math.max(inlineWidth, attrSize);

                    if (current < desired) {

                        input.setAttribute('size', desired);

                        input.style.width = `${desired}ch`;

                    }

                });

       }



       // 과학 성취기준: '탐구 활동' 제목과 그 다음 항목들을 하나의 박스로 래핑

       function wrapScienceInquiryActivities() {

            const main = document.getElementById('science-std-quiz-main');

            if (!main) return;

            // 이미 처리되었다면 재실행 방지

            if (main.dataset.inquiryWrapped === 'true') return;



            const blocks = main.querySelectorAll('.achievement-block');

            

            // # 표기가 있는 outline-title을 주제로 표시

            main.querySelectorAll('.outline-title').forEach(title => {

                if (title.textContent.trim().startsWith('#')) {

                    title.setAttribute('data-is-topic', 'true');

                }

            });

            

            // 블록 사이 구분선 추가

            blocks.forEach((block, idx) => {

                if (idx === 0) return; // 첫 블록 앞은 생략

                const divider = document.createElement('div');

                divider.className = 'topic-divider';

                block.parentNode.insertBefore(divider, block);

            });

            blocks.forEach(block => {

                // 블록 내의 모든 overview-question을 순회하며 '탐구 활동'을 찾음

                const questions = Array.from(block.querySelectorAll('.overview-question'));

                for (let i = 0; i < questions.length; i++) {

                    const el = questions[i];

                    const text = el.textContent.replace(/\s+/g, '').replace(/[<>]/g, '').trim();

                    if (text === '탐구활동') {

                        // 표기 변경: "탐구 활동" -> "<탐구 활동>"

                        el.textContent = '<탐구 활동>';

                        // 새 래퍼 생성

                        const wrapper = document.createElement('div');

                        wrapper.className = 'activity-box';



                        // '탐구 활동' 제목과 뒤따르는 항목(다음 outline-title 전까지)을 이동

                        el.parentNode.insertBefore(wrapper, el);

                        wrapper.appendChild(el);



                        // 다음 형제들을 outline-title이나 achievement-block 끝을 만나기 전까지 수집

                        let sibling = wrapper.nextElementSibling;

                        while (sibling && !sibling.classList.contains('outline-title')) {

                            const next = sibling.nextElementSibling;

                            if (sibling.classList.contains('overview-question')) {

                                wrapper.appendChild(sibling);

                            } else {

                                break;

                            }

                            sibling = next;

                        }

                    }

                }

            });



            main.dataset.inquiryWrapped = 'true';

       }



       function adjustEnglishInputWidths() {

            document

                .querySelectorAll('#english-quiz-main input[data-answer]')

                .forEach(input => {

                    const answer = input.dataset.answer || '';

                    const answerLen = answer.length;

                    const hasHangul = /[\u3131-\uD79D]/.test(answer);

                    const factor = hasHangul ? 1.8 : 1.3;

                    const desiredBase = Math.max(2, Math.ceil(answerLen * factor) + 4);
                    // 10% 축소 적용
                    const desired = Math.max(2, Math.floor(desiredBase * 0.8));

                    // 항상 최신 계산값으로 갱신하여 축소가 반영되도록 함
                    input.setAttribute('size', desired);
                    input.style.width = `${desired}ch`;

                });

       }



       function adjustBasicTopicInputWidths() {

            if (gameState.selectedTopic !== CONSTANTS.TOPICS.BASIC) return;

            const mainId = getMainElementId();

            document

                .querySelectorAll(`#${mainId} input[data-answer]`)

                .forEach(input => {

                    const answer = input.dataset.answer || '';

                    const answerLen = answer.length;

                    const hasHangul = /[\u3131-\uD79D]/.test(answer);

                    const factor = hasHangul ? 1.8 : 1.3;

                    const desiredBase = Math.max(2, Math.ceil(answerLen * factor) + 4);
                    // 영어 기본 토픽의 특수 규칙: 10% 축소 적용 및 항상 갱신
                    if (mainId === 'english-quiz-main') {
                        const desired = Math.max(2, Math.floor(desiredBase * 0.8));
                        input.setAttribute('size', desired);
                        input.style.width = `${desired}ch`;
                    } else {
                        const desired = desiredBase;
                        const inlineWidth = parseInt(input.style.width) || 0;
                        const attrSize = parseInt(input.getAttribute('size')) || 0;
                        const current = Math.max(inlineWidth, attrSize);
                        if (current < desired) {
                            input.setAttribute('size', desired);
                            input.style.width = `${desired}ch`;
                        }
                    }

                });

       }



       function shuffleSocialityFunctionList() {

            const list = document.getElementById('sociality-function-list');

            if (!list) return;

            const items = Array.from(list.children);

            for (let i = items.length - 1; i > 0; i--) {

                const j = Math.floor(Math.random() * (i + 1));

                list.appendChild(items[j]);

                items.splice(j, 1);

            }

       }



       function fixSettingsPanelHeight() {

            if (!settingsPanel.dataset.fixedHeight) {

                // 높이를 고정하지 않고 자동으로 조정되도록 함
                settingsPanel.style.height = 'auto';
                settingsPanel.style.minHeight = 'auto';

                // data-fixed-height 제거하여 동적 높이 조정 허용
                settingsPanel.removeAttribute('data-fixed-height');

            }

       }



       // 과목별 주제 매핑
       const subjectTopicMapping = {
           'overview-creative': [
               { name: '총론', subject: 'overview', topic: 'course' },
               { name: '창체', subject: 'creative', topic: 'course' }
           ],
           'korean': [
               { name: '내체표', subject: 'korean', topic: 'curriculum' },
               { name: '모형', subject: 'korean-model', topic: 'model' },
               { name: '성취기준', subject: 'korean-std', topic: 'achievement' },
               { name: '교육과정', subject: 'korean-course', topic: 'course' },
               { name: '맞춤법', subject: 'spelling', topic: 'moral' }
           ],
           'math': [
               { name: '모형', subject: 'math-model', topic: 'model' },
               { name: '성취기준', subject: 'math-operation', topic: 'achievement', hasSubmenu: true },
               { name: '교육과정', subject: 'math-course', topic: 'course' },
               { name: '도형', subject: 'geometry', topic: 'moral' }
           ],
           'english': [
               { name: '기본이론', subject: 'english', topic: 'basic' },
               { name: '성취기준', subject: 'english-std', topic: 'achievement' },
               { name: '교육과정', subject: 'english-course', topic: 'course' }
           ],
           'social': [
               { name: '모형', subject: 'social', topic: 'model' },
               { name: '성취기준', subject: 'social-34', topic: 'achievement', hasSubmenu: true },
               { name: '교육과정', subject: 'social-course', topic: 'course' }
           ],
           'ethics': [
               { name: '내체표', subject: 'ethics-lite', topic: 'curriculum' },
               { name: '모형', subject: 'ethics', topic: 'model' },
               { name: '교육과정', subject: 'moral-course', topic: 'course' },
               { name: '기본이론', subject: 'eastern-ethics', topic: 'basic', hasSubmenu: true },
               { name: '지도 원리·방법', subject: 'moral-principles', topic: 'moral' }
           ],
           'science': [
               { name: '내체표', subject: 'science-curriculum', topic: 'curriculum' },
               { name: '모형', subject: 'science', topic: 'model' },
               { name: '성취기준', subject: 'science-std', topic: 'achievement' },
               { name: '교육과정', subject: 'science-course', topic: 'course' }
           ],
           'pe': [
               { name: '내체표', subject: 'pe', topic: 'curriculum', hasSubmenu: true },
               { name: '모형', subject: 'pe-model', topic: 'model' },
               { name: '교육과정', subject: 'pe-course', topic: 'course' },
               { name: '체육(뒷교)', subject: 'pe-back', topic: 'moral' },
               { name: '신체활동 예시', subject: 'physical-activity', topic: 'moral' },
               { name: '기본 기능&전략', subject: 'sports-functions', topic: 'moral' }
           ],
           'music': [
               { name: '내체표', subject: 'music', topic: 'curriculum' },
               { name: '성취기준', subject: 'music-std', topic: 'achievement' },
               { name: '교육과정', subject: 'music-course', topic: 'course' },
               { name: '음악요소', subject: 'music-elements', topic: 'moral' }
           ],
           'art': [
               { name: '내체표', subject: 'art', topic: 'curriculum' },
               { name: '모형', subject: 'art-model', topic: 'model' },
               { name: '성취기준', subject: 'art-std', topic: 'achievement' },
               { name: '교육과정', subject: 'art-course', topic: 'course' }
           ],
           'practical': [
               { name: '내체표', subject: 'practical-lite', topic: 'curriculum' },
               { name: '모형', subject: 'practical', topic: 'model' },
               { name: '성취기준', subject: 'practical-std', topic: 'achievement' },
               { name: '교육과정', subject: 'practical-course', topic: 'course' }
           ],
           'integrated': [
               { name: '내체표', subject: 'life', topic: 'curriculum', hasSubmenu: true },
               { name: '모형', subject: 'integrated-model', topic: 'model' },
               { name: '성취기준', subject: 'life-achievement', topic: 'achievement', hasSubmenu: true },
               { name: '교육과정', subject: 'integrated-course', topic: 'course' },
               { name: '통합 지도서', subject: 'integrated-guide', topic: 'moral' }
           ]
       };

       // 수학 성취기준 하위 선택지
       const mathAchievementSubmenu = [
           { name: '수와 연산', subject: 'math-operation', topic: 'achievement' },
           { name: '변화와 관계', subject: 'change-relation', topic: 'achievement' },
           { name: '도형과 측정', subject: 'geometry-measure', topic: 'achievement' },
           { name: '자료와 가능성', subject: 'data-probability', topic: 'achievement' }
       ];

       // 과목 그룹과 주제를 기반으로 실제 data-subject 찾기
       function findActualSubjectForGroup(groupName, topic) {
           const mapping = subjectTopicMapping[groupName];
           if (!mapping) return null;

           const topicItem = mapping.find(item => item.topic === topic);
           if (topicItem) {
               return topicItem.subject;
           }

           return mapping[0]?.subject || null;
       }

       // 주제 선택기 동적 생성
       function renderTopicSelector(groupName) {
           const topics = subjectTopicMapping[groupName];
           if (!topics) {
               topicSelector.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);
               topicSelectionTitle.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);
               return;
           }

           topicSelector.innerHTML = '';
           
           topics.forEach((item, index) => {
               const btn = document.createElement('button');
               btn.className = 'btn topic-btn';
               btn.textContent = item.name;
               btn.dataset.subject = item.subject;
               btn.dataset.topic = item.topic;
               
               if (index === 0) {
                   btn.classList.add(CONSTANTS.CSS_CLASSES.SELECTED);
                   gameState.selectedSubject = item.subject;
                   gameState.selectedTopic = item.topic;
               }
               
               topicSelector.appendChild(btn);
           });

           topicSelector.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);
           topicSelectionTitle.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);

           // 모든 하위 선택지 숨기기
           const submenus = [
               'math-achievement-submenu',
               'social-achievement-submenu',
               'integrated-curriculum-submenu',
               'integrated-achievement-submenu',
               'pe-curriculum-submenu',
               'ethics-basic-submenu'
           ];
           submenus.forEach(id => {
               const submenu = document.getElementById(id);
               if (submenu) {
                   submenu.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);
               }
           });

           // 주제별 시간 설정
           const firstTopic = topics[0]?.topic;
           if (firstTopic) {
               if (firstTopic === CONSTANTS.TOPICS.CURRICULUM ||
                   firstTopic === CONSTANTS.TOPICS.COMPETENCY ||
                   firstTopic === CONSTANTS.TOPICS.AREA) {
                   gameState.duration = 1200; // 20분
            } else {
                   gameState.duration = 2400; // 40분
               }
           }
           
           // 첫 번째 주제에 하위 메뉴가 있으면 표시
           const firstTopicItem = topics[0];
           if (firstTopicItem?.hasSubmenu) {
               const submenus = {
                   'math-achievement-submenu': false,
                   'social-achievement-submenu': false,
                   'integrated-curriculum-submenu': false,
                   'integrated-achievement-submenu': false,
                   'pe-curriculum-submenu': false,
                   'ethics-basic-submenu': false
               };
               
               if (groupName === 'math' && firstTopicItem.topic === 'achievement') {
                   submenus['math-achievement-submenu'] = true;
               } else if (groupName === 'social' && firstTopicItem.topic === 'achievement') {
                   submenus['social-achievement-submenu'] = true;
               } else if (groupName === 'integrated' && firstTopicItem.topic === 'curriculum') {
                   submenus['integrated-curriculum-submenu'] = true;
               } else if (groupName === 'integrated' && firstTopicItem.topic === 'achievement') {
                   submenus['integrated-achievement-submenu'] = true;
               } else if (groupName === 'pe' && firstTopicItem.topic === 'curriculum') {
                   submenus['pe-curriculum-submenu'] = true;
               } else if (groupName === 'ethics' && firstTopicItem.topic === 'basic') {
                   submenus['ethics-basic-submenu'] = true;
               }
               
               // 하위 선택지 표시/숨김 처리
               Object.keys(submenus).forEach(id => {
                   const submenu = document.getElementById(id);
                   if (submenu) {
                       if (submenus[id]) {
                           submenu.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);
                           // 모든 버튼의 선택 상태 초기화
                           submenu.querySelectorAll('.topic-sub-btn').forEach(b => {
                               b.classList.remove(CONSTANTS.CSS_CLASSES.SELECTED);
                               b.style.background = '';
                               b.style.color = '';
                               b.style.transform = '';
                               b.style.boxShadow = '';
                               b.style.borderColor = '';
                               b.style.fontWeight = '';
                           });
                           // 첫 번째 버튼을 기본 선택
                           const firstBtn = submenu.querySelector('.topic-sub-btn');
                           if (firstBtn) {
                               firstBtn.classList.add(CONSTANTS.CSS_CLASSES.SELECTED);
                               firstBtn.style.background = 'linear-gradient(135deg, #ff1744 0%, #ff6b6b 100%)';
                               firstBtn.style.color = '#ffffff';
                               firstBtn.style.fontWeight = '900';
                               firstBtn.style.transform = 'translateY(2px)';
                               firstBtn.style.boxShadow = '0 0 20px rgba(255, 23, 68, 0.6), 3px 3px 0px rgba(15, 52, 96, 0.8), inset 0 2px 4px rgba(255, 255, 255, 0.2)';
                               firstBtn.style.borderColor = '#ff1744';
                               // gameState도 업데이트
                               gameState.selectedSubject = firstBtn.dataset.subject;
                               gameState.selectedTopic = firstBtn.dataset.topic;
                           }
                       } else {
                           submenu.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);
                       }
                   }
               });
           }
       }

       function updateStartModalUI() {

            const stats = getDailyStats(30);

            renderHeatmap(stats, renderDDay);

            // 과목 버튼 정답률 상태 업데이트
            updateSubjectButtonStates();

            // 시간 설정 표시 업데이트
            updateTimeSettingDisplay();

        }



        function setCharacterState(state, duration = 1500) {

            character.className = '';

            character.classList.add(state);

            if (gameState.gameMode === CONSTANTS.MODES.HARD_CORE) {

                character.classList.add('devil-mode');

            }

            

            updateMushroomGrowth();



            if (state === 'happy' || state === 'sad') {

                setTimeout(() => {

                    const baseState = (gameState.total > 0 && gameState.total < 30 && gameState.gameMode !== CONSTANTS.MODES.HARD_CORE) ? 'worried' : 'idle';

                    character.className = '';

                    character.classList.add(baseState);

                    if (gameState.gameMode === CONSTANTS.MODES.HARD_CORE) {

                        character.classList.add('devil-mode');

                    }

                    updateMushroomGrowth();

                }, duration);

            }

        }

        

        function updateMushroomGrowth() {

            character.classList.remove('combo-level-1', 'combo-level-2', 'combo-level-3');

            if (gameState.gameMode === CONSTANTS.MODES.HARD_CORE) return;



            if (gameState.combo >= 10) character.classList.add('combo-level-3');

            else if (gameState.combo >= 5) character.classList.add('combo-level-2');

            else if (gameState.combo >= 2) character.classList.add('combo-level-1');

        }



        function resetToFirstStage(subject) {

            const main = document.getElementById(`${subject}-quiz-main`);

            if (!main) return;

            const tabsContainer = main.querySelector('.tabs');

            if (!tabsContainer) return;

            const tabs = Array.from(tabsContainer.querySelectorAll('.tab'));

            tabs.forEach(t => t.classList.remove(CONSTANTS.CSS_CLASSES.ACTIVE));

            main.querySelectorAll('section').forEach(sec => sec.classList.remove(CONSTANTS.CSS_CLASSES.ACTIVE));

            if (tabs.length === 0) return;

            const firstTab = tabs[0];

            firstTab.classList.add(CONSTANTS.CSS_CLASSES.ACTIVE);

            const firstSection = main.querySelector(`#${firstTab.dataset.target}`);

            if (firstSection) {

                firstSection.classList.add(CONSTANTS.CSS_CLASSES.ACTIVE);

                if (firstTab.dataset.target === 'activity-examples') {

                    const subTabs = firstSection.querySelector('.sub-tabs');

                    if (subTabs) {

                        const subTabBtns = subTabs.querySelectorAll('.tab');

                        subTabBtns.forEach(t => t.classList.remove(CONSTANTS.CSS_CLASSES.ACTIVE));

                        const defaultTab = subTabs.querySelector('[data-target="activity-exercise"]');

                        if (defaultTab) defaultTab.classList.add(CONSTANTS.CSS_CLASSES.ACTIVE);

                    }

                    firstSection.querySelectorAll('section').forEach(sec => sec.classList.remove(CONSTANTS.CSS_CLASSES.ACTIVE));

                    const defaultSection = firstSection.querySelector('#activity-exercise');

                    if (defaultSection) defaultSection.classList.add(CONSTANTS.CSS_CLASSES.ACTIVE);

                }

                if (subject === CONSTANTS.SUBJECTS.INTEGRATED_COURSE) {

                    shuffleSocialityFunctionList();

                }

                focusFirstInput(firstSection);

            }

        }



        function advanceToNextStage(showProgressIfNoNext = true) {

            const mainId = getMainElementId();

            const main = document.getElementById(mainId);

            if (!main) return;

            const tabs = Array.from(main.querySelector('.tabs').querySelectorAll('.tab'));

            const currentIndex = tabs.findIndex(t =>

                t.classList.contains(CONSTANTS.CSS_CLASSES.ACTIVE)

            );

            if (currentIndex === -1) return;

            const nextIndex = currentIndex + 1;



            // 다음 단계가 없으면 현재 단계 활성 유지

            if (nextIndex >= tabs.length) {

                if (showProgressIfNoNext) {

                    showProgress();

                }

                return;

            }



            const currentTab = tabs[currentIndex];

            const nextTab = tabs[nextIndex];



            currentTab.classList.remove(CONSTANTS.CSS_CLASSES.ACTIVE);

            if (SPECIAL_SUBJECTS.has(gameState.selectedSubject)) {

                main

                    .querySelectorAll('section')

                    .forEach(sec => sec.classList.remove(CONSTANTS.CSS_CLASSES.ACTIVE));

                const sectionGroups = SECTION_GROUPS[gameState.selectedSubject] || {};

                const nextIds = sectionGroups[nextTab.dataset.target] || [nextTab.dataset.target];

                nextTab.classList.add(CONSTANTS.CSS_CLASSES.ACTIVE);

                nextIds.forEach(id => {

                    const targetSection = main.querySelector(`#${id}`);

                    if (targetSection) targetSection.classList.add(CONSTANTS.CSS_CLASSES.ACTIVE);

                });

                const firstSection = main.querySelector(`#${nextIds[0]}`);

                if (firstSection) focusFirstInput(firstSection);

            } else {

                const currentSection = main.querySelector(`#${currentTab.dataset.target}`);

                if (currentSection) currentSection.classList.remove(CONSTANTS.CSS_CLASSES.ACTIVE);



                nextTab.classList.add(CONSTANTS.CSS_CLASSES.ACTIVE);

                const nextSection = main.querySelector(`#${nextTab.dataset.target}`);

                if (nextSection) {

                    nextSection.classList.add(CONSTANTS.CSS_CLASSES.ACTIVE);

                    if (nextTab.dataset.target === 'activity-examples') {

                        const subTabs = nextSection.querySelector('.sub-tabs');

                        if (subTabs) {

                            const subBtns = subTabs.querySelectorAll('.tab');

                            subBtns.forEach(b =>

                                b.classList.remove(CONSTANTS.CSS_CLASSES.ACTIVE)

                            );

                            const defaultTab = subTabs.querySelector('[data-target="activity-exercise"]');

                            if (defaultTab) defaultTab.classList.add(CONSTANTS.CSS_CLASSES.ACTIVE);

                        }

                        nextSection

                            .querySelectorAll('section')

                            .forEach(sec => sec.classList.remove(CONSTANTS.CSS_CLASSES.ACTIVE));

                        const defaultSection = nextSection.querySelector('#activity-exercise');

                        if (defaultSection) {

                            defaultSection.classList.add(CONSTANTS.CSS_CLASSES.ACTIVE);

                            focusFirstInput(defaultSection);

                        } else {

                            focusFirstInput(nextSection);

                        }

                    } else {

                        focusFirstInput(nextSection);

                    }

                }

            }

        }



        function showProgress() {

            let correctCount, totalCount, percentage;

            

            // 맞춤법 퀴즈의 이지선다 모드만 누적 방식 사용, 빈칸 모드는 일반 퀴즈처럼 처리

            if (gameState.selectedSubject === CONSTANTS.SUBJECTS.SPELLING && !isSpellingBlankMode()) {

                // 맞춤법 이지선다 퀴즈의 경우, 이미 결과창에 누적된 값을 사용

                const correctCountEl = document.getElementById('correct-count');

                const totalCountEl = document.getElementById('total-count');

                

                correctCount = parseInt(correctCountEl.textContent) || 0;

                totalCount = parseInt(totalCountEl.textContent) || 0;

                percentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

                // 맞춤법 퀴즈의 경우에도 과목별 정답률 저장
                saveSubjectAccuracy(gameState.selectedSubject, correctCount, totalCount);

                // 70% 이상 달성했으면 기록
                if (percentage >= 70) {
                    markSubjectAccuracyAchieved(gameState.selectedSubject);
                }

                // 과목 버튼 상태 업데이트
                updateSubjectButtonStates();

            } else {

                // 일반 퀴즈 및 맞춤법 빈칸 모드의 경우 입력 요소 기준으로 계산

                const mainId = getMainElementId();

                const allInputs = document.querySelectorAll(`#${mainId} input[data-answer]`);

                correctCount = document.querySelectorAll(`#${mainId} input.${CONSTANTS.CSS_CLASSES.CORRECT}`).length;

                totalCount = allInputs.length;

                percentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;



                // 빈칸 카운팅은 정답을 맞을 때마다 실시간으로 저장되므로 여기서는 저장하지 않음
                // saveDailyStats(correctCount);

                // 오늘 푼 빈칸 수 표시 요소 업데이트
                updateTodayBlankCount();

                // 과목별 정답률 저장
                saveSubjectAccuracy(gameState.selectedSubject, correctCount, totalCount);

                // 70% 이상 달성했으면 기록
                if (percentage >= 70) {
                    markSubjectAccuracyAchieved(gameState.selectedSubject);
                }

                // 과목 버튼 상태 업데이트
                updateSubjectButtonStates();

                document.getElementById('correct-count').textContent = correctCount;

                document.getElementById('total-count').textContent = totalCount;

            }

            

            // 히트맵 제목(오늘 푼 빈칸 수) 즉시 갱신

            updateHeatmapTitle(getDailyStats(30));

            // 오늘 푼 빈칸 수 표시 요소 업데이트

            updateTodayBlankCount();



            resultProgress.style.width = `${percentage}%`;

            resultPercentage.textContent = `${percentage}%`;



            resultSubject.textContent = SUBJECT_NAMES[gameState.selectedSubject] || '';

            resultTopic.textContent = TOPIC_NAMES[gameState.selectedTopic] || '';

            

            let feedback;

            if (percentage === 100) {

                feedback = { title: "[트러플버섯]", dialogue: "완벽은 드물기에 값지다.", animation: "cheer", effect: "perfect" };

            } else if (percentage >= 90) {

                feedback = { title: "[송이버섯]", dialogue: "이건 귀한 향이다.", animation: "happy", effect: "excellent" };

            } else if (percentage >= 70) {

                feedback = { title: "[표고버섯]", dialogue: "국물 깊이가 다르다.", animation: "idle", effect: "great" };

            } else if (percentage >= 50) {

                feedback = { title: "[느타리버섯]", dialogue: "전골 재료는 확보했다.", animation: "idle", effect: "good" };

            } else if (percentage >= 20) {

                feedback = { title: "[균사]", dialogue: "실밥이 풀린 모양이다.", animation: "sad", effect: "notbad" };

            } else {

                feedback = { title: "[포자]", dialogue: "지금은 가루만 날린다…", animation: "sad", effect: "tryagain" };

            }



            // 현재 날짜를 가져오는 함수
            function getCurrentDate() {
                const today = new Date();
                const month = today.getMonth() + 1; // getMonth()는 0부터 시작하므로 +1
                const day = today.getDate();
                return `${month}월 ${day}일`;
            }

            // 칭호에 날짜 추가
            const currentDate = getCurrentDate();
            const titleWithDate = `${currentDate} 자 ${feedback.title}`;

            resultTitle.textContent = titleWithDate;

            

            modalCharacterPlaceholder.innerHTML = '';

            modalCharacterPlaceholder.appendChild(character.cloneNode(true));

            

            setTimeout(() => {

                const modalChar = modalCharacterPlaceholder.querySelector('#character-assistant');

                modalChar.className = '';

                modalChar.classList.add(feedback.animation);

                 if (gameState.gameMode === CONSTANTS.MODES.HARD_CORE) {

                    modalChar.classList.add('devil-mode');

                }

            }, 100);



            speechBubble.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);

            typewriter(resultDialogue, feedback.dialogue);

            

            openModal(progressModal);

        }



        // --- 게임 로직 함수 ---

        function handleGameOver() {

            clearInterval(gameState.timerId);

            gameState.timerId = null;

            const mainId = getMainElementId();

            document.querySelectorAll(`#${mainId} input[data-answer]`).forEach(i => i.disabled = true);

            playSound(timeupAudio);

            

            gameState.combo = 0;

            updateMushroomGrowth();

            headerTitle.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);

            comboCounter.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);



            forceQuitBtn.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);

            slotMachine.reset();

            setCharacterState('sad');

            showProgress();

        }



        function tick() {

            if (gameState.total <= 0) {

                handleGameOver();

                return;

            }

            gameState.total--;

            timeEl.textContent = formatTime(gameState.total);

            

            let currentDuration = (gameState.gameMode === CONSTANTS.MODES.HARD_CORE) ? CONSTANTS.HARD_CORE_DURATION : gameState.duration;

            barEl.style.width = `${(gameState.total / currentDuration) * 100}%`;



            if (gameState.total < 30 && !character.classList.contains('happy') && !character.classList.contains('sad') && gameState.gameMode !== CONSTANTS.MODES.HARD_CORE) {

                setCharacterState('worried', 1000);

            }

        }



        function resetGame(showStartModal = true) {

            clearInterval(gameState.timerId);

            gameState.timerId = null;

            // 오늘 푼 빈칸 수 표시 요소 숨김
            const todayBlankCountEl = document.getElementById('today-blank-count');
            if (todayBlankCountEl) {
                todayBlankCountEl.classList.add('hidden');
            }

            quizContainers.forEach(main => main.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN));

            document.querySelectorAll('input[data-answer]').forEach(i => {

                i.disabled = true;

                i.value = '';

                i.className = '';

            });

            resetUsedAnswers();

            

            gameState.combo = 0;

            updateMushroomGrowth();

            

            // 결과창 카운터 초기화 (맞춤법 퀴즈에서 일반 퀴즈로 전환 시 이전 값 제거)

            const correctCountEl = document.getElementById('correct-count');

            const totalCountEl = document.getElementById('total-count');

            const resultProgress = document.getElementById('result-progress');

            const resultPercentage = document.getElementById('result-percentage');

            

            if (correctCountEl) correctCountEl.textContent = '0';

            if (totalCountEl) totalCountEl.textContent = '0';

            if (resultProgress) resultProgress.style.width = '0%';

            if (resultPercentage) resultPercentage.textContent = '0%';

            

            // 맞춤법 상태 초기화

            gameState.spelling = {

                questions: [],

                currentQuestionIndex: 0,

                score: 0,

                answered: false,

                roundCompleted: false,

                selectedDataset: 'basic'

            };

            

            // 맞춤법 문항 리스트 초기화

            const questionsList = document.getElementById('spelling-questions-list');

            if (questionsList) {

                questionsList.innerHTML = '';

            }

            

            headerTitle.textContent = '아웃풋';

            headerTitle.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);

            comboCounter.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);

            // showAnswersBtn 제거됨 - 기능이 결과창의 정답 보기 버튼으로 통합됨

            scrapResultImageBtnTop.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);

            resetBtn.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);

            forceQuitBtn.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);

            document.getElementById('timer-container').classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);



            // 역량 탭 상태 초기화

           document.querySelectorAll('.competency-tab.cleared')

               .forEach(tab => tab.classList.remove('cleared'));



           if (showStartModal) {

               openModal(startModal);

               updateStartModalUI();

               adjustCreativeInputWidths();

               adjustEnglishInputWidths();

               adjustBasicTopicInputWidths();

               fixSettingsPanelHeight();

           }



           setCharacterState('idle');

            slotMachine.reset();

       }



        function startGame() {

            // 특별 팝업 카운트 초기화
            gameState.lastSpecialPopupCount = 0;

            playSound(startAudio);

            closeModal(startModal);

            

            headerTitle.textContent =

                SUBJECT_NAMES[gameState.selectedSubject] || '퀴즈';

           // 주제와 과목에 따라 올바른 메인 요소 결정

           const mainId = getMainElementId();

           

           const mainEl = document.getElementById(mainId);

           mainEl.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);

           resetToFirstStage(gameState.selectedSubject);



           document.querySelectorAll(`#${mainId} input[data-answer]`).forEach(i => i.disabled = false);

           if (mainEl) delete mainEl.dataset.answersRevealed;

           // 오답 표시 업데이트
           updateWrongAnswerIndicators();

            // 맞춤법 퀴즈가 아닌 경우 결과창 카운터 초기화

            // (맞춤법 퀴즈는 initializeSpellingQuiz에서 초기화함)

            if (gameState.selectedSubject !== CONSTANTS.SUBJECTS.SPELLING) {

                const correctCountEl = document.getElementById('correct-count');

                const totalCountEl = document.getElementById('total-count');

                const resultProgress = document.getElementById('result-progress');

                const resultPercentage = document.getElementById('result-percentage');

                

                if (correctCountEl) correctCountEl.textContent = '0';

                if (totalCountEl) totalCountEl.textContent = '0';

                if (resultProgress) resultProgress.style.width = '0%';

                if (resultPercentage) resultPercentage.textContent = '0%';

            }

            if (

                gameState.selectedSubject === CONSTANTS.SUBJECTS.CREATIVE ||

                gameState.selectedSubject === CONSTANTS.SUBJECTS.OVERVIEW ||

                gameState.selectedSubject === CONSTANTS.SUBJECTS.INTEGRATED_COURSE ||

                gameState.selectedSubject === CONSTANTS.SUBJECTS.SOCIAL_COURSE ||

                gameState.selectedSubject === CONSTANTS.SUBJECTS.MATH_COURSE ||

                gameState.selectedSubject === CONSTANTS.SUBJECTS.MUSIC_COURSE ||

                gameState.selectedSubject === CONSTANTS.SUBJECTS.ART_COURSE ||

                gameState.selectedSubject === CONSTANTS.SUBJECTS.MORAL_COURSE ||

                gameState.selectedSubject === CONSTANTS.SUBJECTS.PE_BACK ||

                gameState.selectedSubject === CONSTANTS.SUBJECTS.SCIENCE_STD ||

                gameState.selectedSubject === CONSTANTS.SUBJECTS.ENGLISH_STD ||

                gameState.selectedSubject === CONSTANTS.SUBJECTS.PRACTICAL_STD ||

                gameState.selectedSubject === CONSTANTS.SUBJECTS.ART_STD ||

                gameState.selectedSubject === CONSTANTS.SUBJECTS.MATH_OPERATION ||

                gameState.selectedSubject === CONSTANTS.SUBJECTS.CHANGE_RELATION ||

                gameState.selectedSubject === CONSTANTS.SUBJECTS.GEOMETRY_MEASURE ||
                gameState.selectedSubject === CONSTANTS.SUBJECTS.DATA_PROBABILITY ||

                (gameState.selectedSubject === CONSTANTS.SUBJECTS.SPELLING && isSpellingBlankMode())

            ) {

                if (gameState.selectedSubject === CONSTANTS.SUBJECTS.SCIENCE_STD) {

                    wrapScienceInquiryActivities();

                }

                adjustCreativeInputWidths();

            } else if (

                gameState.selectedSubject === CONSTANTS.SUBJECTS.ENGLISH &&

                gameState.selectedTopic === CONSTANTS.TOPICS.BASIC

            ) {

                adjustEnglishInputWidths();

            } else if (gameState.selectedSubject === CONSTANTS.SUBJECTS.SPELLING) {

                initializeSpellingQuiz();

            }

            adjustBasicTopicInputWidths();

            

            // Practical model: start with only Title enabled

            if (gameState.selectedSubject === CONSTANTS.SUBJECTS.PRACTICAL && gameState.selectedTopic === CONSTANTS.TOPICS.MODEL) {

                const main = document.getElementById('practical-quiz-main');

                if (main) {

                    main.querySelectorAll('section').forEach(sec => {

                        if (sec.id !== 'practical-title') {

                            sec.querySelectorAll('input[data-answer]').forEach(i => i.disabled = true);

                            sec.style.opacity = '0.2';

                            sec.style.pointerEvents = 'none';

                            sec.classList.add('practical-section-disabled');

                        }

                    });

                    const tabs = main.querySelectorAll('.tabs .tab');

                    tabs.forEach(tab => {

                        if (tab.dataset.target !== 'practical-title') tab.classList.add('practical-disabled');

                    });

                }

            }



            // Apply gating for other model subjects similar to Practical

            if (gameState.selectedTopic === CONSTANTS.TOPICS.MODEL) {

                const configs = [

                    { subject: CONSTANTS.SUBJECTS.PE_MODEL, mainId: 'pe-model-quiz-main', titleId: 'pe-title' },

                    { subject: CONSTANTS.SUBJECTS.ETHICS, mainId: 'ethics-quiz-main', titleId: 'ethics-title' },

                    { subject: CONSTANTS.SUBJECTS.KOREAN_MODEL, mainId: 'korean-model-quiz-main', titleId: 'korean-title' },

                    { subject: CONSTANTS.SUBJECTS.ART_MODEL, mainId: 'art-model-quiz-main', titleId: 'art-title' },

                    { subject: CONSTANTS.SUBJECTS.MATH_MODEL, mainId: 'math-model-quiz-main', titleId: 'math-title' },

                    { subject: CONSTANTS.SUBJECTS.SOCIAL, mainId: 'social-quiz-main', titleId: 'social-title' },

                    { subject: CONSTANTS.SUBJECTS.SCIENCE, mainId: 'science-quiz-main', titleId: 'science-title' },

                    { subject: CONSTANTS.SUBJECTS.SCIENCE_CURRICULUM, mainId: 'science-curriculum-quiz-main', titleId: 'science-title' }

                ];

                const cfg = configs.find(c => c.subject === gameState.selectedSubject);

                if (cfg) {

                    const main = document.getElementById(cfg.mainId);

                    if (main) {

                        main.querySelectorAll('section').forEach(sec => {

                            if (sec.id !== cfg.titleId) {

                                sec.querySelectorAll('input[data-answer]').forEach(i => i.disabled = true);

                                sec.style.opacity = '0.2';

                                sec.style.pointerEvents = 'none';

                                sec.classList.add('practical-section-disabled');

                            }

                        });

                        const tabs = main.querySelectorAll('.tabs .tab');

                        tabs.forEach(tab => {

                            if (tab.dataset.target !== cfg.titleId) tab.classList.add('practical-disabled');

                        });

                    }

                }

            }

            

            forceQuitBtn.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);

            

            if (gameState.gameMode === CONSTANTS.MODES.HARD_CORE) {

                gameState.duration = CONSTANTS.HARD_CORE_DURATION;

                document.getElementById('timer-container').classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);

                document.getElementById('bar').style.display = 'none';

            } else {

                const timeParts = timeSettingDisplay.textContent.split(':');

                gameState.duration = parseInt(timeParts[0], 10) * 60 + parseInt(timeParts[1], 10);

                document.getElementById('timer-container').classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);

                document.getElementById('bar').style.display = 'block';

            }

            gameState.total = gameState.duration;

            timeEl.textContent = formatTime(gameState.total);

            barEl.style.width = '100%';

            if (gameState.timerId === null) {

                gameState.timerId = setInterval(tick, 1000);

            }

            setCharacterState('idle');

            if (gameState.gameMode === CONSTANTS.MODES.HARD_CORE) {

                character.classList.add('devil-mode');

            }



           // 올바른 메인 요소 ID 사용 (이미 위에서 선언됨)

           const activeSection = document.querySelector(`#${mainId} section.active`);

           if (activeSection) focusFirstInput(activeSection);

            slotMachine.start();

       }



        function checkStageClear(sectionElement) {

            const inputs = sectionElement.querySelectorAll('input[data-answer]');

            return (

                inputs.length > 0 &&

                [...inputs].every(input =>

                    input.classList.contains(CONSTANTS.CSS_CLASSES.CORRECT)

                )

            );

        }

        // Close practical title modal

        (function() {

            const btn = document.getElementById('close-practical-model-title-modal');

            if (btn) {

                btn.addEventListener('click', () => {

                    const modal = document.getElementById('practical-model-title-modal');

                    if (modal) closeModal(modal);

                });

            }

        })();



        function isSectionComplete(sectionElement) {

            const inputs = sectionElement.querySelectorAll('input[data-answer]');

            return (

                inputs.length > 0 && [...inputs].every(input => input.disabled)

            );

        }



        function getMainElementId() {

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



        function isQuizComplete() {

            const main = document.getElementById(getMainElementId());

            if (!main) return false;

            // If there are any gated sections with remaining inputs, quiz is not complete

            const gatedInputs = main.querySelectorAll('section.practical-section-disabled input[data-answer]');

            if (gatedInputs.length > 0) return false;



            const inputs = Array.from(main.querySelectorAll('input[data-answer]'));

            return inputs.length > 0 && inputs.every(input => input.disabled);

        }



       function showStageClear() {

           playSound(clearAudio);

           openModal(stageClearModal);

           setCharacterState('cheer', 5000);



            if (gameState.timerId !== null) {

                clearInterval(gameState.timerId);

                gameState.timerId = null;

            }



            const duration = CONSTANTS.STAGE_CLEAR_DURATION; // faster transition after stage clear

            let interval = null;

            if (!PREFERS_REDUCED_MOTION) {

                const animationEnd = Date.now() + duration;

                const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 201 };

                // randomInRange는 위에서 통합 정의됨

                interval = setInterval(() => {

                    const timeLeft = animationEnd - Date.now();

                    if (timeLeft <= 0) return clearInterval(interval);

                    const particleCount = 50 * (timeLeft / duration);

                    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });

                    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });

                }, 250);

            }



            setTimeout(() => {

                if (interval) clearInterval(interval);

                closeModal(stageClearModal);

                advanceToNextStage(false);

                if (gameState.total > 0 && gameState.timerId === null) {

                    gameState.timerId = setInterval(tick, 1000);

                }

                if (isQuizComplete()) {

                    if (gameState.timerId) {

                        gameState.total = 0;

                        tick();

                    } else {

                        handleGameOver();

                    }

                }

            }, duration);

        }



        function celebrateCompetencySection(sectionElement) {

            const sectionId = sectionElement.id;

            const mainId = getMainElementId();

            const main = document.getElementById(mainId);

            const sectionGroups = SECTION_GROUPS[gameState.selectedSubject] || {};

            const tabId = Object.keys(sectionGroups).find(key => sectionGroups[key].includes(sectionId)) || sectionId;

            const tabButton = main.querySelector(`.competency-tab[data-target="${tabId}"]`);

            if (!tabButton || tabButton.classList.contains('cleared')) return;



            const groupIds = sectionGroups[tabId];

            if (groupIds) {

                const allCleared = groupIds.every(id => {

                    const sec = main.querySelector(`#${id}`);

                    return sec && checkStageClear(sec);

                });

                if (!allCleared) return;

            }



            tabButton.classList.add('cleared');

            playSound(clearAudio);

            if (gameState.timerId !== null) {

                clearInterval(gameState.timerId);

                gameState.timerId = null;

            }

            const duration = 1000; // faster transition after competency clear

            let interval = null;

            if (!PREFERS_REDUCED_MOTION) {

                const animationEnd = Date.now() + duration;

                const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 201 };

                // randomInRange는 위에서 통합 정의됨

                interval = setInterval(() => {

                    const timeLeft = animationEnd - Date.now();

                    if (timeLeft <= 0) return clearInterval(interval);

                    const particleCount = 50 * (timeLeft / duration);

                    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });

                    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });

                }, 250);

            }

            setTimeout(() => {

                if (interval) clearInterval(interval);

                advanceToNextStage(false);

                if (gameState.total > 0 && gameState.timerId === null) {

                    gameState.timerId = setInterval(tick, 1000);

                }

            }, duration);

        }



        // 전역 handleInputChange 함수
        window.handleInputChange = function(e) {

            const input = e.target;

            if (!input.matches('input[data-answer]') || input.disabled) {
                return;
            }



            const section = input.closest('section');

            const userAnswer = normalizeAnswer(input.value);

            // stripModelWord는 위에서 통합 정의됨



            let isCorrect = false;

            let displayAnswer = input.dataset.answer;



            if (

                SPECIAL_SUBJECTS.has(gameState.selectedSubject) ||

                isIntegratedTitle(input) ||

                isPracticalTitle(input) ||

                isGenericModelTitle(input) ||

                // Allow order-agnostic grading for explicitly marked groups (e.g., #yosho)
                input.closest('[data-ignore-order]')

            ) {

                const group = input.closest('[data-group]') || section;

                let ignoreOrder = group.hasAttribute('data-ignore-order');



                if (!usedAnswersMap.has(group)) usedAnswersMap.set(group, new Set());

                const usedSet = usedAnswersMap.get(group);

                // 과학-모형 타이틀에서는 채점 시 순서 무시를 강제로 비활성화
                const groupSection = input.closest('section') || section;
                const isScienceModelTitleForGrading = (
                    gameState.selectedTopic === CONSTANTS.TOPICS.MODEL &&
                    gameState.selectedSubject === CONSTANTS.SUBJECTS.SCIENCE &&
                    groupSection && groupSection.id && groupSection.id.toLowerCase().includes('title')
                );

                if (isScienceModelTitleForGrading) {
                    ignoreOrder = false;
                }

                const answers = Array.from(group.querySelectorAll('input[data-answer]')).map(i => i.dataset.answer);
                const typedSet = new Set(
                    Array.from(group.querySelectorAll('input[data-answer]'))
                        .map(i => normalizeAnswer(i.value))
                        .filter(v => v)
                );

                const correctAnswers = Array.from(group.querySelectorAll('input[data-answer]'))
                    .filter(input => input.classList.contains(CONSTANTS.CSS_CLASSES.CORRECT))
                    .map(input => input.dataset.answer);

                let remaining = answers.filter(ans => !correctAnswers.includes(ans));
                if (isScienceModelTitleForGrading) {
                    remaining = remaining.filter(ans => !typedSet.has(normalizeAnswer(ans)));
                }

                const candidates = getAnswerCandidates(input);

                for (const candidate of candidates) {

                    const canonical = normalizeAnswer(candidate);

                    const canonicalNorm = canonical;

                    if (userAnswer === canonicalNorm && !usedSet.has(canonicalNorm)) {

                        isCorrect = true;

                        displayAnswer = candidate;

                        if (!ignoreOrder) {

                            usedSet.add(canonicalNorm);

                        }

                        break;

                    }

                }

            } else {

                const correctAnswers = getAnswerCandidates(input).map(answer => normalizeAnswer(answer));



                // '기타' 주제 '음악요소'의 경우 괄호 내용까지 정확히 입력해야 함

                if (gameState.selectedTopic === CONSTANTS.TOPICS.MORAL &&

                    gameState.selectedSubject === CONSTANTS.SUBJECTS.MUSIC_ELEMENTS) {

                    // 괄호 내용까지 정확히 입력해야 정답으로 처리 (원본 정답만 사용)
                    const originalAnswer = normalizeAnswer(input.dataset.answer);

                    if (userAnswer === originalAnswer) {

                        isCorrect = true;

                        displayAnswer = input.dataset.answer;

                    }

                } else if (correctAnswers.includes(userAnswer)) {

                    isCorrect = true;

                    displayAnswer = input.dataset.answer;

                } else if (gameState.selectedTopic === CONSTANTS.TOPICS.MODEL) {

                    const userNoModel = stripModelWord(userAnswer);

                    const correctNoModelList = correctAnswers.map(answer => stripModelWord(answer));

                    if (correctNoModelList.includes(userNoModel)) {

                        isCorrect = true;

                        displayAnswer = input.dataset.answer;

                    }

                }

            }

            const isRetry = input.classList.contains(CONSTANTS.CSS_CLASSES.INCORRECT);

            let shouldAdvance = false;

            if (isCorrect) {

                input.classList.remove(CONSTANTS.CSS_CLASSES.INCORRECT);

                input.classList.remove(CONSTANTS.CSS_CLASSES.RETRYING);

                input.classList.add(CONSTANTS.CSS_CLASSES.CORRECT);

                // 정답 시 오답 표시 제거
                input.classList.remove('wrong-answer-indicator');

                // 정답 처리 시 오답 기록과 정답 기록 모두 초기화 (순환 구조 유지)
                const questionId = generateQuestionId(input);

                // 해당 문제의 오답 기록과 정답 기록 삭제
                const wrongAnswers = storageManager.getWrongAnswers();
                const correctAnswers = storageManager.getCorrectAnswers();
                const subjectKey = `${gameState.selectedSubject}_${gameState.selectedTopic}`;

                if (wrongAnswers[subjectKey] && wrongAnswers[subjectKey][questionId]) {
                    delete wrongAnswers[subjectKey][questionId];
                    storageManager.setItem(storageManager.storageKeys.WRONG_ANSWERS, wrongAnswers);
                }

                if (correctAnswers[subjectKey] && correctAnswers[subjectKey][questionId]) {
                    delete correctAnswers[subjectKey][questionId];
                    storageManager.setItem(storageManager.storageKeys.CORRECT_ANSWERS, correctAnswers);
                }

                gameState.correct++;

                // 즉시 오답 표시 업데이트 (다른 입력 필드들의 표시 상태 갱신)
                updateWrongAnswerIndicatorsImmediate();

                gameState.combo++;

                setCharacterState('happy');

                updateMushroomGrowth();

                slotMachine.stopNext();



                if (gameState.gameMode === CONSTANTS.MODES.HARD_CORE) {

                    gameState.total += CONSTANTS.HARD_CORE_TIME_BONUS;

                    timeEl.textContent = formatTime(gameState.total);

                }



                if (gameState.combo > 1) {

                    headerTitle.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);

                    comboCounter.textContent = `COMBO x${gameState.combo}`;

                    comboCounter.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);

                    comboCounter.classList.remove(CONSTANTS.CSS_CLASSES.COMBO_POP);

                    void comboCounter.offsetWidth;

                    comboCounter.classList.add(CONSTANTS.CSS_CLASSES.COMBO_POP);

                }

                // 정답 파티클 (무음): 입력 주위로 작은 네온 점 터짐

                spawnTypingParticles(input, '#39ff14');

                // 콤보 5, 10, 15...마다 미니 컨페티

                if (gameState.combo >= 5 && gameState.combo % 5 === 0) {

                    spawnComboConfetti(input);

                }

            } else if (input.classList.contains(CONSTANTS.CSS_CLASSES.RETRYING)) {

                input.classList.remove(CONSTANTS.CSS_CLASSES.RETRYING);

                input.classList.add(CONSTANTS.CSS_CLASSES.INCORRECT);

                // 2차 오답 추적
                trackWrongAnswer(input);

                // 즉시 오답 표시 업데이트
                updateWrongAnswerIndicatorsImmediate();



                if (isInIntegratedModel(input) && !isIntegratedTitle(input)) {

                    // 통합 과목: 2차 오답 시 빨간색(incorrect) 유지 + 답 공개 + 버튼 제공

                    input.value = input.dataset.answer;

                    input.disabled = true;

                    shouldAdvance = true;

                    showRevealButtonForIntegrated(input);

                } else if (isInArtBasic(input)) {

                    // 미술-기본이론: 2차 오답 시 빨간색(incorrect) + 답 공개 + 버튼 제공(정답 처리 가능)

                    input.value = input.dataset.answer;

                    input.disabled = true;

                    shouldAdvance = true;

                    showRevealButtonForIntegrated(input);

                } else if (isInEasternEthics(input)) {

                    // 동양윤리: 2차 오답 시 빨간색(incorrect) + 답 공개 + 버튼 제공(정답 처리 가능)

                    input.value = input.dataset.answer;

                    input.disabled = true;

                    shouldAdvance = true;

                    showRevealButtonForIntegrated(input);

                } else if (isInGeometry(input)) {

                    // 기타-도형: 2차 오답 시 빨간색(incorrect) + 답 공개 + 버튼 제공(정답 처리 가능)

                    input.value = input.dataset.answer;

                    input.disabled = true;

                    shouldAdvance = true;

                    showRevealButtonForIntegrated(input);

                } else if (isInWesternEthics(input)) {

                    // 서양윤리: 2차 오답 시 빨간색(incorrect) + 답 공개 + 버튼 제공(정답 처리 가능)

                    input.value = input.dataset.answer;

                    input.disabled = true;

                    shouldAdvance = true;

                    showRevealButtonForIntegrated(input);

                } else if (isInMoralPsychology(input)) {

                    // 윤리심리: 2차 오답 시 빨간색(incorrect) + 답 공개 + 버튼 제공(정답 처리 가능)

                    input.value = input.dataset.answer;

                    input.disabled = true;

                    shouldAdvance = true;

                    showRevealButtonForIntegrated(input);

                } else {

                    // 기본 처리: 2차 오답 시 빨간색(incorrect) 유지

                    gameState.incorrect++;

                    setCharacterState('sad');

                    gameState.combo = 0;

                    comboCounter.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);

                    headerTitle.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);

                    // 틀린 답변 파티클 (무음): 입력 주위로 작은 빨간 점 터짐

                    spawnTypingParticles(input, '#ff073a');

                }

            } else {

                input.classList.add(CONSTANTS.CSS_CLASSES.RETRYING);

            }

            if (isCorrect || shouldAdvance) {

                updateScore();

                if (shouldAdvance) {

                    advanceToNextStage();

                } else if (gameState.correct >= gameState.totalQuestions) {

                    handleGameOver();

                }

            }

        }

        function revealCompetencyAnswers() {

            const normalize = str => normalizeAnswer(str);

            const mainId = getMainElementId();

            document

                .querySelectorAll(`#${mainId} section`)

                .forEach(section => {

                    const groups = section.querySelectorAll('[data-group]');

                    if (groups.length > 0) {

                        groups.forEach(group => {

                            const inputs = group.querySelectorAll('input[data-answer]');

                            const ignoreOrder = group.hasAttribute('data-ignore-order');

                            const answers = Array.from(inputs).map(i => i.dataset.answer);
                            const typedSet = new Set(
                                Array.from(inputs)
                                    .map(i => normalize(i.value))
                                    .filter(v => v)
                            );
                            const isScienceModelTitle = (
                                gameState.selectedTopic === CONSTANTS.TOPICS.MODEL &&
                                gameState.selectedSubject === CONSTANTS.SUBJECTS.SCIENCE &&
                                section.id && section.id.toLowerCase().includes('title')
                            );

                            let remaining;

                            if (ignoreOrder) {

                                // data-ignore-order가 있는 경우: 이미 맞춘 답안들을 제외한 나머지 답안들만 사용

                                const correctAnswers = Array.from(inputs)

                                    .filter(input => input.classList.contains(CONSTANTS.CSS_CLASSES.CORRECT))

                                    .map(input => input.dataset.answer);

                                remaining = answers.filter(ans => !correctAnswers.includes(ans));
                                if (isScienceModelTitle) {
                                    remaining = remaining.filter(ans => !typedSet.has(normalize(ans)));
                                }

                            } else {

                                // 일반적인 경우: 사용되지 않은 답안만 사용

                                const usedSet = usedAnswersMap.get(group) || new Set();

                                remaining = answers.filter(ans => !usedSet.has(normalize(ans)));
                                if (isScienceModelTitle) {
                                    remaining = remaining.filter(ans => !typedSet.has(normalize(ans)));
                                }

                            }

                            let idx = 0;

                            inputs.forEach(input => {

                                input.classList.remove(

                                    CONSTANTS.CSS_CLASSES.INCORRECT,

                                    CONSTANTS.CSS_CLASSES.RETRYING

                                );

                                if (!input.classList.contains(CONSTANTS.CSS_CLASSES.CORRECT)) {

                                    const userNorm = normalize(input.value);
                                    let pick = remaining[idx];
                                    if (pick == null) {
                                        const alt = answers.find(a => normalize(a) !== userNorm);
                                        pick = alt ?? input.dataset.answer;
                                    }
                                    if (pick != null && normalize(pick) !== userNorm) {
                                        input.value = pick;
                                    }

                                    idx++;

                                    input.classList.add(
                                        CONSTANTS.CSS_CLASSES.CORRECT,
                                        CONSTANTS.CSS_CLASSES.REVEALED
                                    );

                                }

                                input.disabled = true;

                            });

                        });

                    } else {

                        const inputs = section.querySelectorAll('input[data-answer]');

                        const ignoreOrder = section.hasAttribute('data-ignore-order');

                        const answers = Array.from(inputs).map(i => i.dataset.answer);
                        const typedSet = new Set(
                            Array.from(inputs)
                                .map(i => normalize(i.value))
                                .filter(v => v)
                        );
                        const isScienceModelTitle = (
                            gameState.selectedTopic === CONSTANTS.TOPICS.MODEL &&
                            gameState.selectedSubject === CONSTANTS.SUBJECTS.SCIENCE &&
                            section.id && section.id.toLowerCase().includes('title')
                        );

                        let remaining;

                        if (ignoreOrder) {

                            // data-ignore-order가 있는 경우: 이미 맞춘 답안들을 제외한 나머지 답안들만 사용

                            const correctAnswers = Array.from(inputs)

                                .filter(input => input.classList.contains(CONSTANTS.CSS_CLASSES.CORRECT))

                                .map(input => input.dataset.answer);

                            remaining = answers.filter(ans => !correctAnswers.includes(ans));
                            if (isScienceModelTitle) {
                                remaining = remaining.filter(ans => !typedSet.has(normalize(ans)));
                            }

                        } else {

                            // 일반적인 경우: 사용되지 않은 답안만 사용

                            const usedSet = usedAnswersMap.get(section) || new Set();

                            remaining = answers.filter(ans => !usedSet.has(normalize(ans)));
                            if (isScienceModelTitle) {
                                remaining = remaining.filter(ans => !typedSet.has(normalize(ans)));
                            }

                        }

                        let idx = 0;

                        inputs.forEach(input => {

                            input.classList.remove(

                                CONSTANTS.CSS_CLASSES.INCORRECT,

                                CONSTANTS.CSS_CLASSES.RETRYING

                            );

                            if (!input.classList.contains(CONSTANTS.CSS_CLASSES.CORRECT)) {

                                input.value = remaining[idx] ?? input.dataset.answer;

                                idx++;

                                input.classList.add(CONSTANTS.CSS_CLASSES.REVEALED);

                            }

                            input.disabled = true;



                        });

                    }

                });

        }



        function handleInputChange(e) {

            const input = e.target;

            if (!input.matches('input[data-answer]') || input.disabled) {
                return;
            }



            const section = input.closest('section');

            const userAnswer = normalizeAnswer(input.value);

            // stripModelWord는 위에서 통합 정의됨



            let isCorrect = false;

            let displayAnswer = input.dataset.answer;



            if (

                SPECIAL_SUBJECTS.has(gameState.selectedSubject) ||

                isIntegratedTitle(input) ||

                isPracticalTitle(input) ||

                isGenericModelTitle(input) ||

                input.closest('[data-ignore-order]')

            ) {

                const group = input.closest('[data-group]') || section;

                let ignoreOrder = group.hasAttribute('data-ignore-order');

                

                if (!usedAnswersMap.has(group)) usedAnswersMap.set(group, new Set());

                const usedSet = usedAnswersMap.get(group);

                // 과학-모형 타이틀에서는 채점 시 순서 무시를 강제로 비활성화
                const groupSection = input.closest('section') || section;
                const isScienceModelTitleForGrading = (
                    gameState.selectedTopic === CONSTANTS.TOPICS.MODEL &&
                    gameState.selectedSubject === CONSTANTS.SUBJECTS.SCIENCE &&
                    groupSection && groupSection.id && groupSection.id.toLowerCase().includes('title')
                );
                if (isScienceModelTitleForGrading) {
                    ignoreOrder = false;
                }

                // [성취기준] 미술 과목에서는 일반 채점 시스템 사용 (순서 무시 비활성화)
                if (gameState.selectedTopic === CONSTANTS.TOPICS.ACHIEVEMENT &&
                    gameState.selectedSubject === CONSTANTS.SUBJECTS.ART_STD) {
                    ignoreOrder = false;
                }



                // Cache DOM query result to improve performance
                const inputs = Array.from(group.querySelectorAll('input[data-answer]'));
                const answerMap = new Map();
                const isModelTopic = gameState.selectedTopic === CONSTANTS.TOPICS.MODEL;

                // Process answers more efficiently
                inputs.forEach(inp => {
                    const original = inp.dataset.answer.trim();
                    const normalized = normalizeAnswer(original);

                    answerMap.set(normalized, original);

                    const alias = normalized.replace(/역량$/, '');
                    if (alias !== normalized) {
                        answerMap.set(alias, original);
                    }

                    if (isModelTopic) {
                        const modelAlias = stripModelWord(normalized);
                        if (modelAlias && modelAlias !== normalized) {
                            answerMap.set(modelAlias, original);
                        }
                    }
                });



                const candidate = answerMap.has(userAnswer)

                    ? userAnswer

                    : (gameState.selectedTopic === CONSTANTS.TOPICS.MODEL ? stripModelWord(userAnswer) : null);

                if (candidate && answerMap.has(candidate)) {

                    const canonical = answerMap.get(candidate);

                    const canonicalNorm = normalizeAnswer(canonical);

                    

                    // data-ignore-order가 있으면 이미 사용된 답이라도 허용

                    if (ignoreOrder || !usedSet.has(canonicalNorm)) {

                        isCorrect = true;

                        displayAnswer = canonical;

                        if (!ignoreOrder) {

                            usedSet.add(canonicalNorm);

                        }

                    }

                }

            } else {

                const correctAnswers = getAnswerCandidates(input).map(answer => normalizeAnswer(answer));



                // '기타' 주제 '음악요소'의 경우 괄호 내용까지 정확히 입력해야 함

                if (gameState.selectedTopic === CONSTANTS.TOPICS.MORAL &&

                    gameState.selectedSubject === CONSTANTS.SUBJECTS.MUSIC_ELEMENTS) {

                    // 괄호 내용까지 정확히 입력해야 정답으로 처리 (원본 정답만 사용)
                    const originalAnswer = normalizeAnswer(input.dataset.answer);

                    if (userAnswer === originalAnswer) {

                        isCorrect = true;

                        displayAnswer = input.dataset.answer;

                    }

                } else if (correctAnswers.includes(userAnswer)) {

                    isCorrect = true;

                    displayAnswer = input.dataset.answer;

                } else if (gameState.selectedTopic === CONSTANTS.TOPICS.MODEL) {

                    const userNoModel = stripModelWord(userAnswer);

                    const correctNoModelList = correctAnswers.map(answer => stripModelWord(answer));

                    if (

                        correctNoModelList.some(correct => userAnswer === correct) ||

                        correctAnswers.some(correct => userNoModel === correct) ||

                        correctNoModelList.some(correct => userNoModel === correct)

                    ) {

                        isCorrect = true;

                        displayAnswer = input.dataset.answer;

                    }

                }

            }



            let shouldAdvance = false;

            if (isCorrect) {

                playSound(successAudio);

                input.classList.remove(CONSTANTS.CSS_CLASSES.INCORRECT, CONSTANTS.CSS_CLASSES.RETRYING);

                input.classList.add(CONSTANTS.CSS_CLASSES.CORRECT);

                // 정답 시 오답 표시 제거
                input.classList.remove('wrong-answer-indicator');

                // 정답 처리 시 오답 기록과 정답 기록 모두 초기화 (순환 구조 유지)
                const questionId = generateQuestionId(input);

                // 해당 문제의 오답 기록과 정답 기록 삭제
                const wrongAnswers = storageManager.getWrongAnswers();
                const correctAnswers = storageManager.getCorrectAnswers();
                const subjectKey = `${gameState.selectedSubject}_${gameState.selectedTopic}`;

                if (wrongAnswers[subjectKey] && wrongAnswers[subjectKey][questionId]) {
                    delete wrongAnswers[subjectKey][questionId];
                    storageManager.setItem(storageManager.storageKeys.WRONG_ANSWERS, wrongAnswers);
                }

                if (correctAnswers[subjectKey] && correctAnswers[subjectKey][questionId]) {
                    delete correctAnswers[subjectKey][questionId];
                    storageManager.setItem(storageManager.storageKeys.CORRECT_ANSWERS, correctAnswers);
                }

                // 즉시 오답 표시 업데이트 (다른 입력 필드들의 표시 상태 갱신)
                updateWrongAnswerIndicatorsImmediate();

                // add a brief pulse distinct from wrong shake

                input.classList.remove(CONSTANTS.CSS_CLASSES.CORRECT_PULSE);

                void input.offsetWidth;

                input.classList.add(CONSTANTS.CSS_CLASSES.CORRECT_PULSE);

                input.addEventListener('animationend', () => {

                    input.classList.remove(CONSTANTS.CSS_CLASSES.CORRECT_PULSE);

                }, { once: true });

                input.value = displayAnswer;

                input.disabled = true;

                shouldAdvance = true;



                gameState.combo++;

                setCharacterState('happy');

                updateMushroomGrowth();

                // 실시간 빈칸 카운트 업데이트
                const stats = getDailyStats(30);
                const todayKey = formatDateKey();
                const today = stats.find(s => s.date === todayKey);
                const currentCount = today ? today.count : 0;

                // localStorage에 실시간으로 1 증가
                const dailyStats = JSON.parse(localStorage.getItem('dailyStats') || '{}');
                dailyStats[todayKey] = currentCount + 1;
                localStorage.setItem('dailyStats', JSON.stringify(dailyStats));

                // UI 즉시 업데이트
                updateTodayBlankCount();

                slotMachine.stopNext();



                if (gameState.gameMode === CONSTANTS.MODES.HARD_CORE) {

                    gameState.total += CONSTANTS.HARD_CORE_TIME_BONUS;

                    timeEl.textContent = formatTime(gameState.total);

                }

                

                if (gameState.combo > 1) {

                    headerTitle.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);

                    comboCounter.textContent = `COMBO x${gameState.combo}`;

                    comboCounter.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);

                    comboCounter.classList.remove(CONSTANTS.CSS_CLASSES.COMBO_POP);

                    void comboCounter.offsetWidth;

                    comboCounter.classList.add(CONSTANTS.CSS_CLASSES.COMBO_POP);

                }

                // 정답 파티클 (무음): 입력 주위로 작은 네온 점 터짐

                spawnTypingParticles(input, '#39ff14');

                // 콤보 5, 10, 15...마다 미니 컨페티

                if (gameState.combo >= 5 && gameState.combo % 5 === 0) {

                    spawnComboConfetti(input);

                }

                

            } else {

                gameState.combo = 0;

                updateMushroomGrowth();

                headerTitle.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);

                comboCounter.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);



                playSound(failAudio);

                setCharacterState('sad');



                input.classList.add(CONSTANTS.CSS_CLASSES.SHAKE);

                input.addEventListener('animationend', () => {

                    input.classList.remove(CONSTANTS.CSS_CLASSES.SHAKE);

                }, { once: true });

                // 오답 파티클 (무음): 붉은 점 소량 흩뿌림

                spawnTypingParticles(input, '#ff5733');



                if (

                    SPECIAL_SUBJECTS.has(gameState.selectedSubject) ||

                    isIntegratedTitle(input) ||

                    isPracticalTitle(input) ||

                    isGenericModelTitle(input)

                ) {

                    input.classList.remove(CONSTANTS.CSS_CLASSES.RETRYING);

                    input.classList.add(CONSTANTS.CSS_CLASSES.INCORRECT);



                } else if (input.classList.contains(CONSTANTS.CSS_CLASSES.RETRYING)) {

                    input.classList.remove(CONSTANTS.CSS_CLASSES.RETRYING);

                    input.classList.add(CONSTANTS.CSS_CLASSES.INCORRECT);

                    // 2차 오답 추적
                    trackWrongAnswer(input);

                    // 즉시 오답 표시 업데이트
                    updateWrongAnswerIndicatorsImmediate();



                    if (isInIntegratedModel(input) && !isIntegratedTitle(input)) {

                        // 통합 과목: 2차 오답 시 빨간색(incorrect) 유지 + 답 공개 + 버튼 제공

                        input.value = input.dataset.answer;

                        input.disabled = true;

                        shouldAdvance = true;

                        showRevealButtonForIntegrated(input);

                    } else if (isInArtBasic(input)) {

                        // 미술-기본이론: 2차 오답 시 빨간색(incorrect) + 답 공개 + 버튼 제공(정답 처리 가능)

                        input.value = input.dataset.answer;

                        input.disabled = true;

                        shouldAdvance = true;

                        showRevealButtonForIntegrated(input);

                    } else if (isInEasternEthics(input)) {

                        // 동양윤리: 2차 오답 시 빨간색(incorrect) + 답 공개 + 버튼 제공(정답 처리 가능)

                        input.value = input.dataset.answer;

                        input.disabled = true;

                        shouldAdvance = true;

                        showRevealButtonForIntegrated(input);

                    } else if (isInGeometry(input)) {

                        // 기타-도형: 2차 오답 시 빨간색(incorrect) + 답 공개 + 버튼 제공(정답 처리 가능)

                        input.value = input.dataset.answer;

                        input.disabled = true;

                        shouldAdvance = true;

                        showRevealButtonForIntegrated(input);

                } else if (isInCourseOverview(input) || isInCourseCreative(input) || isInCourseSocial(input) || isInCourseScience(input) || isInCourseEnglish(input) || isInCourseKorean(input) || isInCoursePractical(input) || isInCourseMusic(input) || isInCourseArt(input) || isInCoursePe(input)) {

                    // 교육과정-총론, 교육과정-창체: 2차 오답 시 빨간색(incorrect) + 답 공개 + 버튼 제공(정답 처리 가능)

                    input.value = input.dataset.answer;

                    input.disabled = true;

                    shouldAdvance = true;

                    showRevealButtonForIntegrated(input);

                    } else if (

                        gameState.selectedTopic !== CONSTANTS.TOPICS.CURRICULUM &&

                        gameState.selectedTopic !== CONSTANTS.TOPICS.COMPETENCY &&

                        gameState.selectedTopic !== CONSTANTS.TOPICS.MORAL

                    ) {

                        input.value = input.dataset.answer;

                        input.disabled = true;

                        shouldAdvance = true;

                        showRevealButtonForIntegrated(input);

                    } else {

                        input.value = input.dataset.answer;

                        input.disabled = true;

                        shouldAdvance = true;

                    }



                } else {

                    input.classList.add(CONSTANTS.CSS_CLASSES.RETRYING);

                    input.value = '';

                }

            }



            if (shouldAdvance && isSectionComplete(section)) {

                if (checkStageClear(section)) {

                    // If the cleared section is a model Title, unlock other sections immediately

                    const cfg = getCurrentModelConfig();

                    if (cfg && section.id === cfg.titleId) {

                        unlockOtherModelSections(cfg.mainId, cfg.titleId);

                    }

                    const delay = CONSTANTS.NEXT_STAGE_DELAY - CONSTANTS.STAGE_CLEAR_DURATION;

                    if (SPECIAL_SUBJECTS.has(gameState.selectedSubject)) {

                        setTimeout(() => celebrateCompetencySection(section), delay);

                    } else {

                        setTimeout(showStageClear, delay);

                    }

                } else {

                    setTimeout(() => {

                        advanceToNextStage(false);

                        if (gameState.total > 0 && gameState.timerId === null) {

                            gameState.timerId = setInterval(tick, 1000);

                        }

                    }, CONSTANTS.NEXT_STAGE_DELAY);

                }

            }



            if (shouldAdvance) {

                const main = input.closest('main');

                if (main) {

                    const inputs = Array.from(main.querySelectorAll('input[data-answer]'));

                    const idx = inputs.indexOf(input);

                    for (let i = idx + 1; i < inputs.length; i++) {

                        if (!inputs[i].disabled) {

                            inputs[i].focus();

                            inputs[i].scrollIntoView({ behavior: 'smooth', block: 'center' });

                            break;

                        }

                    }

                }

            }



            if (isQuizComplete()) {

                if (gameState.timerId) {

                    gameState.total = 0;

                    tick();

                } else {

                    handleGameOver();

                }

            }

        }



        function isInIntegratedModel(el) {

            const main = el.closest('main');

            return !!main && main.id === 'integrated-model-quiz-main';

        }



        function isInArtBasic(el) {

            const main = el.closest('main');

            return !!main && main.id === 'art-basic-quiz-main';

        }

        function isInEasternEthics(el) {

            const main = el.closest('main');

            return !!main && main.id === 'eastern-ethics-quiz-main';

        }

        function isInWesternEthics(el) {

            const main = el.closest('main');

            return !!main && main.id === 'western-ethics-quiz-main';

        }

        function isInMoralPsychology(el) {

            const main = el.closest('main');

            return !!main && main.id === 'moral-psychology-quiz-main';

        }

        function isInPiaget(el) {

            const section = el.closest('section');

            return !!section && section.id === 'piaget';

        }

        function isInKohlberg(el) {

            const section = el.closest('section');

            return !!section && section.id === 'kohlberg';

        }

        function isInGilligan(el) {

            const section = el.closest('section');

            return !!section && section.id === 'gilligan';

        }

        function isInNoddings(el) {

            const section = el.closest('section');

            return !!section && section.id === 'noddings';

        }



        function isInGeometry(el) {

            const main = el.closest('main');

            return !!main && main.id === 'geometry-quiz-main';

        }



        function isInCourseOverview(el) {

            const main = el.closest('main');

            return !!main && main.id === 'overview-quiz-main';

        }



        function isInCourseCreative(el) {

            const main = el.closest('main');

            return !!main && main.id === 'creative-quiz-main';

        }



        function isInCourseSocial(el) {

            const main = el.closest('main');

            return !!main && main.id === 'social-course-quiz-main';

        }



        function isInCourseScience(el) {

            const main = el.closest('main');

            return !!main && main.id === 'science-course-quiz-main';

        }



        function isInCourseEnglish(el) {

            const main = el.closest('main');

            return !!main && main.id === 'english-course-quiz-main';

        }



        function isInCourseKorean(el) {

            const main = el.closest('main');

            return !!main && main.id === 'korean-course-quiz-main';

        }



        function isInCoursePractical(el) {

            const main = el.closest('main');

            return !!main && main.id === 'practical-course-quiz-main';

        }



        function isInCourseMusic(el) {

            const main = el.closest('main');

            return !!main && main.id === 'music-course-quiz-main';

        }



        function isInCourseArt(el) {

            const main = el.closest('main');

            return !!main && main.id === 'art-course-quiz-main';

        }



        function isInCoursePe(el) {

            const main = el.closest('main');

            return false; // pe-back removed

        }



        function isIntegratedTitle(el) {

            const section = el.closest('section');

            return !!section && section.id === 'integrated-title';

        }



        function isPracticalTitle(el) {

            const section = el.closest('section');

            return !!section && section.id === 'practical-title';

        }



        function isGenericModelTitle(el) {

            const section = el.closest('section');

            if (!section) return false;

            // Allow order-independent scoring for all newly added model titles

            return (

                section.id === 'pe-title' ||

                section.id === 'ethics-title' ||

                section.id === 'art-title' ||

                section.id === 'math-title' ||

                section.id === 'science-title' ||

                section.id === 'social-title' ||

                section.id === 'korean-title'

            );

        }



        function getCurrentModelConfig() {

            if (gameState.selectedTopic !== CONSTANTS.TOPICS.MODEL) return null;

            const map = {

                [CONSTANTS.SUBJECTS.PRACTICAL]: { mainId: 'practical-quiz-main', titleId: 'practical-title' },

                [CONSTANTS.SUBJECTS.PE_MODEL]: { mainId: 'pe-model-quiz-main', titleId: 'pe-title' },

                [CONSTANTS.SUBJECTS.ETHICS]: { mainId: 'ethics-quiz-main', titleId: 'ethics-title' },

                [CONSTANTS.SUBJECTS.KOREAN_MODEL]: { mainId: 'korean-model-quiz-main', titleId: 'korean-title' },

                [CONSTANTS.SUBJECTS.ART_MODEL]: { mainId: 'art-model-quiz-main', titleId: 'art-title' },

                [CONSTANTS.SUBJECTS.MATH_MODEL]: { mainId: 'math-model-quiz-main', titleId: 'math-title' },

                [CONSTANTS.SUBJECTS.SOCIAL]: { mainId: 'social-quiz-main', titleId: 'social-title' },

                [CONSTANTS.SUBJECTS.SCIENCE]: { mainId: 'science-quiz-main', titleId: 'science-title' },

                [CONSTANTS.SUBJECTS.SCIENCE_CURRICULUM]: { mainId: 'science-curriculum-quiz-main', titleId: 'science-title' }

            };

            return map[gameState.selectedSubject] || null;

        }



        function unlockOtherModelSections(mainId, titleId) {

            const main = document.getElementById(mainId);

            if (!main) return;

            main.dataset.titleCleared = 'true';

            main.querySelectorAll('section').forEach(sec => {

                if (sec.id !== titleId) {

                    sec.querySelectorAll('input[data-answer]').forEach(i => i.disabled = false);

                    sec.style.opacity = '';

                    sec.style.pointerEvents = '';

                    sec.classList.remove('practical-section-disabled');

                }

            });

            const tabs = main.querySelectorAll('.tabs .tab');

            tabs.forEach(tab => tab.classList.remove('practical-disabled'));

        }



        function showRevealButtonForIntegrated(input) {

            // Wrap input to position the button at bottom-right

            if (!input.parentElement.classList.contains('reveal-wrapper')) {

                const wrapper = document.createElement('span');

                wrapper.className = 'reveal-wrapper';

                input.parentElement.insertBefore(wrapper, input);

                wrapper.appendChild(input);

            }

            // Avoid duplicating button

            const wrapperEl = input.parentElement;

            let btn = wrapperEl.querySelector('.mini-reveal-btn');

            if (!btn) {

                btn = document.createElement('button');

                btn.type = 'button';

                btn.className = 'mini-reveal-btn';

                btn.textContent = '정답';

                btn.title = '정답 보기';

                btn.addEventListener('click', () => {

                    markCorrectAndAdvance(input);

                    btn.remove();

                }, { once: true });

                wrapperEl.appendChild(btn);

            }

        }



        function markCorrectAndAdvance(input) {

            const section = input.closest('section');

            playSound(successAudio);

            input.classList.remove(CONSTANTS.CSS_CLASSES.INCORRECT, CONSTANTS.CSS_CLASSES.RETRYING);

            input.classList.add(CONSTANTS.CSS_CLASSES.CORRECT);

            // 정답 시 오답 표시 제거
            input.classList.remove('wrong-answer-indicator');

            // 정답 데이터 저장 (다음 플레이에도 적용)
            const questionId = generateQuestionId(input);
            storageManager.saveCorrectAnswer(gameState.selectedSubject, gameState.selectedTopic, questionId);

            // 즉시 오답 표시 업데이트 (다른 입력 필드들의 표시 상태 갱신)
            updateWrongAnswerIndicatorsImmediate();

            input.value = input.dataset.answer;

            input.disabled = true;



            gameState.combo++;

            setCharacterState('happy');

            updateMushroomGrowth();

            // 실시간 빈칸 카운트 업데이트 (정답 버튼 클릭 시에도 카운트 증가)
            const stats = getDailyStats(30);
            const todayKey = formatDateKey();
            const today = stats.find(s => s.date === todayKey);
            const currentCount = today ? today.count : 0;

            // localStorage에 실시간으로 1 증가
            const dailyStats = JSON.parse(localStorage.getItem('dailyStats') || '{}');
            dailyStats[todayKey] = currentCount + 1;
            localStorage.setItem('dailyStats', JSON.stringify(dailyStats));

            // UI 즉시 업데이트
            updateTodayBlankCount();

            slotMachine.stopNext();

            if (gameState.gameMode === CONSTANTS.MODES.HARD_CORE) {

                gameState.total += CONSTANTS.HARD_CORE_TIME_BONUS;

                timeEl.textContent = formatTime(gameState.total);

            }

            if (gameState.combo > 1) {

                headerTitle.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);

                comboCounter.textContent = `COMBO x${gameState.combo}`;

                comboCounter.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);

                comboCounter.classList.remove(CONSTANTS.CSS_CLASSES.COMBO_POP);

                void comboCounter.offsetWidth;

                comboCounter.classList.add(CONSTANTS.CSS_CLASSES.COMBO_POP);

            }



            let shouldAdvance = true;

            if (shouldAdvance && isSectionComplete(section)) {

                if (checkStageClear(section)) {

                    const cfg = getCurrentModelConfig();

                    if (cfg && section.id === cfg.titleId) {

                        unlockOtherModelSections(cfg.mainId, cfg.titleId);

                    }

                    const delay = CONSTANTS.NEXT_STAGE_DELAY - CONSTANTS.STAGE_CLEAR_DURATION;

                    if (SPECIAL_SUBJECTS.has(gameState.selectedSubject)) {

                        setTimeout(() => celebrateCompetencySection(section), delay);

                    } else {

                        setTimeout(showStageClear, delay);

                    }

                } else {

                    setTimeout(() => {

                        advanceToNextStage(false);

                        if (gameState.total > 0 && gameState.timerId === null) {

                            gameState.timerId = setInterval(tick, 1000);

                        }

                    }, CONSTANTS.NEXT_STAGE_DELAY);

                }

            }



            // Focus next available input

            const main = input.closest('main');

            if (main) {

                const inputs = Array.from(main.querySelectorAll('input[data-answer]'));

                const idx = inputs.indexOf(input);

                for (let i = idx + 1; i < inputs.length; i++) {

                    if (!inputs[i].disabled) {

                        inputs[i].focus();

                        inputs[i].scrollIntoView({ behavior: 'smooth', block: 'center' });

                        break;

                    }

                }

            }

        }



        // --- 이벤트 리스너 ---

        document.querySelector('.topic-selector').addEventListener('click', e => {

            if (!e.target.matches('.topic-btn')) return;

            // INP 개선: 사운드 재생을 지연시켜 즉시 응답성 향상
            setTimeout(() => playSound(clickAudio), 0);

            // INP 개선: DOM 조작을 다음 프레임으로 지연
            requestAnimationFrame(() => {
                document.querySelectorAll('.topic-btn').forEach(b => b.classList.remove(CONSTANTS.CSS_CLASSES.SELECTED));
                e.target.classList.add(CONSTANTS.CSS_CLASSES.SELECTED);
            });

            const topic = e.target.dataset.topic;
            const subject = e.target.dataset.subject;

            gameState.selectedTopic = topic;
            gameState.selectedSubject = subject;

            // 모든 하위 선택지 처리
            const submenus = {
                'math-achievement-submenu': false,
                'social-achievement-submenu': false,
                'integrated-curriculum-submenu': false,
                'integrated-achievement-submenu': false,
                'pe-curriculum-submenu': false,
                'ethics-basic-submenu': false
            };

            const selectedSubjectBtn = document.querySelector('.subject-btn[data-subject-group].selected');
            if (selectedSubjectBtn) {
                const groupName = selectedSubjectBtn.dataset.subjectGroup;
                const topics = subjectTopicMapping[groupName];
                const selectedTopicItem = topics?.find(item => item.topic === topic && item.subject === subject);
                
                if (selectedTopicItem?.hasSubmenu) {
                    // 하위 선택지 표시
                    if (groupName === 'math' && topic === 'achievement') {
                        submenus['math-achievement-submenu'] = true;
                    } else if (groupName === 'social' && topic === 'achievement') {
                        submenus['social-achievement-submenu'] = true;
                    } else if (groupName === 'integrated' && topic === 'curriculum') {
                        submenus['integrated-curriculum-submenu'] = true;
                    } else if (groupName === 'integrated' && topic === 'achievement') {
                        submenus['integrated-achievement-submenu'] = true;
                    } else if (groupName === 'pe' && topic === 'curriculum') {
                        submenus['pe-curriculum-submenu'] = true;
                    } else if (groupName === 'ethics' && topic === 'basic') {
                        submenus['ethics-basic-submenu'] = true;
                    }
                }
            }

            // 하위 선택지 표시/숨김 처리
            Object.keys(submenus).forEach(id => {
                const submenu = document.getElementById(id);
                if (submenu) {
                    if (submenus[id]) {
                        submenu.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);
                        // 모든 버튼의 선택 상태 초기화
                        submenu.querySelectorAll('.topic-sub-btn').forEach(b => {
                            b.classList.remove(CONSTANTS.CSS_CLASSES.SELECTED);
                            b.style.background = '';
                            b.style.color = '';
                            b.style.transform = '';
                            b.style.boxShadow = '';
                            b.style.borderColor = '';
                            b.style.fontWeight = '';
                        });
                        // 현재 선택된 항목에 selected 클래스와 스타일 추가
                        const currentSelectedBtn = submenu.querySelector(`.topic-sub-btn[data-subject="${gameState.selectedSubject}"]`);
                        if (currentSelectedBtn) {
                            currentSelectedBtn.classList.add(CONSTANTS.CSS_CLASSES.SELECTED);
                            currentSelectedBtn.style.background = 'linear-gradient(135deg, #ff1744 0%, #ff6b6b 100%)';
                            currentSelectedBtn.style.color = '#ffffff';
                            currentSelectedBtn.style.fontWeight = '900';
                            currentSelectedBtn.style.transform = 'translateY(2px)';
                            currentSelectedBtn.style.boxShadow = '0 0 20px rgba(255, 23, 68, 0.6), 3px 3px 0px rgba(15, 52, 96, 0.8), inset 0 2px 4px rgba(255, 255, 255, 0.2)';
                            currentSelectedBtn.style.borderColor = '#ff1744';
                } else {
                            // 첫 번째 버튼을 기본 선택
                            const firstBtn = submenu.querySelector('.topic-sub-btn');
                            if (firstBtn) {
                                firstBtn.classList.add(CONSTANTS.CSS_CLASSES.SELECTED);
                                firstBtn.style.background = 'linear-gradient(135deg, #ff1744 0%, #ff6b6b 100%)';
                                firstBtn.style.color = '#ffffff';
                                firstBtn.style.fontWeight = '900';
                                firstBtn.style.transform = 'translateY(2px)';
                                firstBtn.style.boxShadow = '0 0 20px rgba(255, 23, 68, 0.6), 3px 3px 0px rgba(15, 52, 96, 0.8), inset 0 2px 4px rgba(255, 255, 255, 0.2)';
                                firstBtn.style.borderColor = '#ff1744';
                                // gameState도 업데이트
                                gameState.selectedSubject = firstBtn.dataset.subject;
                                gameState.selectedTopic = firstBtn.dataset.topic;
                            }
                        }
            } else {
                        submenu.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);
                    }
                }
            });

            // 주제별 시간 설정: 내체표, 역량, 영역 주제는 20분, 나머지는 40분
            if (topic === CONSTANTS.TOPICS.CURRICULUM ||
                topic === CONSTANTS.TOPICS.COMPETENCY ||
                topic === CONSTANTS.TOPICS.AREA) {
                gameState.duration = 1200; // 20분
            } else {
                gameState.duration = 2400; // 40분
            }

            updateStartModalUI();

            // 과학 모형 및 기타 도형 조건에 따른 스타일 적용
            setTimeout(() => {
                // 보라색 텍스트는 지정된 과목에서만 적용
                applyPurpleTextStyles(gameState, CONSTANTS);
            }, 100);

            // 오답 표시 업데이트
            updateWrongAnswerIndicators();

        });



        subjectSelector.addEventListener('click', e => {

            if (!e.target.matches('.subject-btn[data-subject-group]') || gameState.isRandomizing) return;

            const clickedBtn = e.target;

            const groupName = clickedBtn.dataset.subjectGroup;

                 // INP 개선: 사운드 재생을 지연시켜 즉시 응답성 향상
            setTimeout(() => playSound(clickAudio), 0);

            // 과목 선택 상태 업데이트
            document.querySelectorAll('.subject-btn[data-subject-group]').forEach(btn => {
                btn.classList.remove(CONSTANTS.CSS_CLASSES.SELECTED);
            });
            clickedBtn.classList.add(CONSTANTS.CSS_CLASSES.SELECTED);

            // 주제 선택기 동적 생성
            renderTopicSelector(groupName);

            updateStartModalUI();

                        // 과학 모형 및 기타 도형 조건에 따른 스타일 적용
                        setTimeout(() => {
                            // 보라색 텍스트는 지정된 과목에서만 적용
                            if (gameState.selectedTopic === CONSTANTS.TOPICS.MODEL &&
                                gameState.selectedSubject === CONSTANTS.SUBJECTS.SCIENCE) {
                                applyPurpleTextStyles(gameState, CONSTANTS);
                            } else if (gameState.selectedTopic === CONSTANTS.TOPICS.MORAL &&
                                       gameState.selectedSubject === CONSTANTS.SUBJECTS.GEOMETRY) {
                            } else {
                                // 다른 과목에서는 보라색 클래스 제거
                                const overviewQuestions = document.querySelectorAll('.overview-question');
                                overviewQuestions.forEach(question => {
                                    question.classList.remove('science-model-purple-text');
                                });
                            }
                        }, 100);

                        // 오답 표시 업데이트
                        updateWrongAnswerIndicators();

        });

        // 모든 하위 선택지 이벤트 핸들러
        const submenuIds = [
            'math-achievement-submenu',
            'social-achievement-submenu',
            'integrated-curriculum-submenu',
            'integrated-achievement-submenu',
            'pe-curriculum-submenu',
            'ethics-basic-submenu'
        ];

        submenuIds.forEach(submenuId => {
            const submenuEl = document.getElementById(submenuId);
            if (submenuEl) {
                submenuEl.addEventListener('click', e => {
                    if (!e.target.matches('.topic-sub-btn')) return;

                    setTimeout(() => playSound(clickAudio), 0);

                    // 같은 하위 메뉴 내의 버튼만 선택 상태 업데이트
                    const parentSubmenu = e.target.closest('[id$="-submenu"]');
                    if (parentSubmenu) {
                        parentSubmenu.querySelectorAll('.topic-sub-btn').forEach(b => {
                            b.classList.remove(CONSTANTS.CSS_CLASSES.SELECTED);
                            // 스타일도 직접 제거
                            b.style.background = '';
                            b.style.color = '';
                            b.style.transform = '';
                            b.style.boxShadow = '';
                            b.style.borderColor = '';
                            b.style.fontWeight = '';
                        });
                    }
                    // 선택된 버튼에 클래스와 스타일 추가
                    e.target.classList.add(CONSTANTS.CSS_CLASSES.SELECTED);
                    e.target.style.background = 'linear-gradient(135deg, #ff1744 0%, #ff6b6b 100%)';
                    e.target.style.color = '#ffffff';
                    e.target.style.fontWeight = '900';
                    e.target.style.transform = 'translateY(2px)';
                    e.target.style.boxShadow = '0 0 20px rgba(255, 23, 68, 0.6), 3px 3px 0px rgba(15, 52, 96, 0.8), inset 0 2px 4px rgba(255, 255, 255, 0.2)';
                    e.target.style.borderColor = '#ff1744';

                    const subject = e.target.dataset.subject;
                    const topic = e.target.dataset.topic;

                gameState.selectedSubject = subject;
                    gameState.selectedTopic = topic;

                    // 주제 버튼도 업데이트
                    const selectedSubjectBtn = document.querySelector('.subject-btn[data-subject-group].selected');
                    if (selectedSubjectBtn) {
                        document.querySelectorAll('.topic-btn').forEach(b => {
                            if (b.dataset.topic === topic) {
                                b.classList.add(CONSTANTS.CSS_CLASSES.SELECTED);
                    } else {
                                b.classList.remove(CONSTANTS.CSS_CLASSES.SELECTED);
                            }
                        });
                    }

                    updateStartModalUI();
                });
            }
        });

        // 초기화 시 음악 주제 표시
        setTimeout(() => {
            const initialMusicBtn = document.querySelector('.subject-btn[data-subject-group="music"].selected');
            if (initialMusicBtn) {
                renderTopicSelector('music');
                updateStartModalUI();
            }
        }, 100);

        document.querySelector('.mode-selector').addEventListener('click', e => {

            if (!e.target.matches('.btn')) return;

            // INP 개선: 사운드 재생을 지연시켜 즉시 응답성 향상
            setTimeout(() => playSound(clickAudio), 0);

            // Hard 모드로 전환하기 전에 Normal 모드의 duration 저장
            if (gameState.gameMode === CONSTANTS.MODES.NORMAL && e.target.dataset.mode === CONSTANTS.MODES.HARD_CORE) {
                gameState.normalModeDuration = gameState.duration;
            }
            
            gameState.gameMode = e.target.dataset.mode;

            // INP 개선: DOM 조작을 다음 프레임으로 지연
            requestAnimationFrame(() => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove(CONSTANTS.CSS_CLASSES.SELECTED));
                e.target.classList.add(CONSTANTS.CSS_CLASSES.SELECTED);

                // 세그먼트 슬라이딩 애니메이션을 위한 data-selected 속성 설정
                const modeBtnGroup = document.querySelector('.mode-btn-group');
                if (modeBtnGroup) {
                    modeBtnGroup.setAttribute('data-selected', gameState.gameMode);
                }

                // Normal 모드: 제한 시간 표시, Hard 설명 숨김
                // Hard 모드: 제한 시간 숨김, Hard 설명 표시
                if (gameState.gameMode === CONSTANTS.MODES.NORMAL) {
                    timeSetterWrapper.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);
                    document.getElementById('hard-core-description').classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);
                    
                    // Normal 모드로 돌아올 때 저장된 duration 복원
                    gameState.duration = gameState.normalModeDuration;
                    updateTimeSettingDisplay();
                } else {
                    timeSetterWrapper.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);
                    document.getElementById('hard-core-description').classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);
                }
            });

        });



        // Handle section switching for subject tabs (music, art, korean)

        document.querySelectorAll('.tabs').forEach(tabsContainer => {

            if (tabsContainer.classList.contains('competency-tabs') || tabsContainer.classList.contains('sub-tabs')) return;

            tabsContainer.addEventListener('click', e => {

                if (!e.target.classList.contains('tab')) return;

                // INP 개선: 사운드 재생을 지연시켜 즉시 응답성 향상
            setTimeout(() => playSound(clickAudio), 0);

                const main = e.target.closest('main');

                tabsContainer.querySelectorAll('.tab').forEach(tab => tab.classList.remove(CONSTANTS.CSS_CLASSES.ACTIVE));

                e.target.classList.add(CONSTANTS.CSS_CLASSES.ACTIVE);

                if (!main) return;



                const targetId = e.target.dataset.target;

                main.querySelectorAll('section').forEach(sec => sec.classList.remove(CONSTANTS.CSS_CLASSES.ACTIVE));

                const targetSection = main.querySelector(`#${targetId}`);

                if (targetSection) {

                    targetSection.classList.add(CONSTANTS.CSS_CLASSES.ACTIVE);

                    focusFirstInput(targetSection);

                }



                // Generic gating for other model subjects when Title tab is selected

                const genericConfigs = [

                    { mainId: 'pe-model-quiz-main', titleId: 'pe-title' },

                    { mainId: 'ethics-quiz-main', titleId: 'ethics-title' },

                    { mainId: 'korean-model-quiz-main', titleId: 'korean-title' },

                    { mainId: 'art-model-quiz-main', titleId: 'art-title' },

                    { mainId: 'math-model-quiz-main', titleId: 'math-title' },

                    { mainId: 'social-quiz-main', titleId: 'social-title' },

                    { mainId: 'science-quiz-main', titleId: 'science-title' },

                    { mainId: 'science-curriculum-quiz-main', titleId: 'science-title' }

                ];

                const found = genericConfigs.find(c => main.id === c.mainId);

                if (found) {

                    const isTitle = targetId === found.titleId;

                    const alreadyCleared = tabsContainer.closest('main')?.dataset.titleCleared === 'true';

                    main.querySelectorAll('section').forEach(sec => {

                        if (sec.id !== found.titleId) {

                            const shouldGate = isTitle && !alreadyCleared;

                            const answersRevealed = main.dataset.answersRevealed === 'true';

                            sec.querySelectorAll('input[data-answer]').forEach(inp => {

                                if (answersRevealed) {

                                    inp.disabled = true;

                                } else {

                                    // 이미 정답이나 2차 오답으로 처리된 input은 비활성화 상태 유지

                                    const isAnswered = inp.classList.contains('correct') || inp.classList.contains('incorrect');

                                    if (isAnswered) {

                                        inp.disabled = true;

                                    } else {

                                        inp.disabled = shouldGate;

                                    }

                                }

                            });

                            sec.style.opacity = shouldGate ? '0.2' : '';

                            sec.style.pointerEvents = shouldGate ? 'none' : '';

                            sec.classList.toggle('practical-section-disabled', shouldGate);

                        }

                    });

                    const tabs = tabsContainer.querySelectorAll('.tab');

                    tabs.forEach(tab => {

                        if (tab.dataset.target !== found.titleId) {

                            tab.classList.toggle('practical-disabled', isTitle && !alreadyCleared);

                        }

                    });

                }



                if (

                    gameState.selectedSubject === CONSTANTS.SUBJECTS.CREATIVE ||

                    gameState.selectedSubject === CONSTANTS.SUBJECTS.OVERVIEW ||

                    gameState.selectedSubject === CONSTANTS.SUBJECTS.INTEGRATED_COURSE ||

                    gameState.selectedSubject === CONSTANTS.SUBJECTS.SOCIAL_COURSE ||

                    gameState.selectedSubject === CONSTANTS.SUBJECTS.MATH_COURSE ||

                    gameState.selectedSubject === CONSTANTS.SUBJECTS.MUSIC_COURSE ||

                    gameState.selectedSubject === CONSTANTS.SUBJECTS.ART_COURSE ||

                    gameState.selectedSubject === CONSTANTS.SUBJECTS.MORAL_COURSE ||

                    gameState.selectedSubject === CONSTANTS.SUBJECTS.PE_BACK ||

                    gameState.selectedSubject === CONSTANTS.SUBJECTS.SCIENCE_STD ||

                    gameState.selectedSubject === CONSTANTS.SUBJECTS.ENGLISH_STD ||

                    gameState.selectedSubject === CONSTANTS.SUBJECTS.PRACTICAL_STD ||

                    gameState.selectedSubject === CONSTANTS.SUBJECTS.ART_STD ||

                    gameState.selectedSubject === CONSTANTS.SUBJECTS.MATH_OPERATION ||

                    gameState.selectedSubject === CONSTANTS.SUBJECTS.CHANGE_RELATION ||

                    gameState.selectedSubject === CONSTANTS.SUBJECTS.GEOMETRY_MEASURE ||
                    gameState.selectedSubject === CONSTANTS.SUBJECTS.DATA_PROBABILITY ||

                    (gameState.selectedSubject === CONSTANTS.SUBJECTS.SPELLING && isSpellingBlankMode())

                ) {

                    adjustCreativeInputWidths();

                }



                if (targetId === 'activity-examples' && targetSection) {

                    const subTabs = targetSection.querySelector('.sub-tabs');

                    if (subTabs) {

                        const defaultTab = subTabs.querySelector('[data-target="activity-exercise"]');

                        subTabs.querySelectorAll('.tab').forEach(tab => tab.classList.remove(CONSTANTS.CSS_CLASSES.ACTIVE));

                        if (defaultTab) defaultTab.classList.add(CONSTANTS.CSS_CLASSES.ACTIVE);

                    }

                    targetSection.querySelectorAll('section').forEach(sec => sec.classList.remove(CONSTANTS.CSS_CLASSES.ACTIVE));

                    const defaultSection = targetSection.querySelector('#activity-exercise');

                    if (defaultSection) {

                        defaultSection.classList.add(CONSTANTS.CSS_CLASSES.ACTIVE);

                        focusFirstInput(defaultSection);

                        if (

                            gameState.selectedSubject === CONSTANTS.SUBJECTS.CREATIVE ||

                            gameState.selectedSubject === CONSTANTS.SUBJECTS.OVERVIEW ||

                            gameState.selectedSubject === CONSTANTS.SUBJECTS.INTEGRATED_COURSE ||

                            gameState.selectedSubject === CONSTANTS.SUBJECTS.SOCIAL_COURSE ||

                            gameState.selectedSubject === CONSTANTS.SUBJECTS.MATH_COURSE ||

                            gameState.selectedSubject === CONSTANTS.SUBJECTS.MUSIC_COURSE ||

                            gameState.selectedSubject === CONSTANTS.SUBJECTS.ART_COURSE ||

                            gameState.selectedSubject === CONSTANTS.SUBJECTS.MORAL_COURSE ||

                            gameState.selectedSubject === CONSTANTS.SUBJECTS.PE_BACK ||

                            gameState.selectedSubject === CONSTANTS.SUBJECTS.SCIENCE_STD ||

                            gameState.selectedSubject === CONSTANTS.SUBJECTS.ENGLISH_STD ||

                            gameState.selectedSubject === CONSTANTS.SUBJECTS.PRACTICAL_STD ||

                            gameState.selectedSubject === CONSTANTS.SUBJECTS.ART_STD ||

                            gameState.selectedSubject === CONSTANTS.SUBJECTS.MATH_OPERATION ||

                            gameState.selectedSubject === CONSTANTS.SUBJECTS.CHANGE_RELATION ||

                            gameState.selectedSubject === CONSTANTS.SUBJECTS.GEOMETRY_MEASURE ||
                            gameState.selectedSubject === CONSTANTS.SUBJECTS.DATA_PROBABILITY ||

                            (gameState.selectedSubject === CONSTANTS.SUBJECTS.SPELLING && isSpellingBlankMode())

                        ) {

                            adjustCreativeInputWidths();

                        }

                    }

                }



                // Practical model: when Title is selected, disable other sections and blur tabs

                if (main.id === 'practical-quiz-main') {

                    const isTitle = targetId === 'practical-title';

                    const alreadyCleared = main.dataset.titleCleared === 'true';

                    const answersRevealed = main.dataset.answersRevealed === 'true';

                    main.querySelectorAll('section').forEach(sec => {

                        if (sec.id !== 'practical-title') {

                            const shouldGate = isTitle && !alreadyCleared;

                            sec.querySelectorAll('input[data-answer]').forEach(inp => {

                                if (answersRevealed) {

                                    inp.disabled = true;

                                } else {

                                    // 이미 정답이나 2차 오답으로 처리된 input은 비활성화 상태 유지

                                    const isAnswered = inp.classList.contains('correct') || inp.classList.contains('incorrect');

                                    if (isAnswered) {

                                        inp.disabled = true;

                                    } else {

                                        inp.disabled = shouldGate;

                                    }

                                }

                            });

                            sec.style.opacity = shouldGate ? '0.2' : '';

                            sec.style.pointerEvents = shouldGate ? 'none' : '';

                            sec.classList.toggle('practical-section-disabled', shouldGate);

                        }

                    });

                    const tabs = tabsContainer.querySelectorAll('.tab');

                    tabs.forEach(tab => {

                        if (tab.dataset.target !== 'practical-title') {

                            tab.classList.toggle('practical-disabled', isTitle && !alreadyCleared);

                        }

                    });

                }

            });

        });



        // Handle section switching for sub-tabs within sections

        document.querySelectorAll('.sub-tabs').forEach(tabsContainer => {

            tabsContainer.addEventListener('click', e => {

                if (!e.target.classList.contains('tab')) return;

                e.stopPropagation();

                // INP 개선: 사운드 재생을 지연시켜 즉시 응답성 향상
            setTimeout(() => playSound(clickAudio), 0);

                const parentSection = tabsContainer.closest('section');

                tabsContainer.querySelectorAll('.tab').forEach(tab => tab.classList.remove(CONSTANTS.CSS_CLASSES.ACTIVE));

                e.target.classList.add(CONSTANTS.CSS_CLASSES.ACTIVE);

                if (parentSection) {

                    const targetId = e.target.dataset.target;

                    parentSection.querySelectorAll('section').forEach(sec => sec.classList.remove(CONSTANTS.CSS_CLASSES.ACTIVE));

                   const targetSection = parentSection.querySelector(`#${targetId}`);

                    if (targetSection) {

                        targetSection.classList.add(CONSTANTS.CSS_CLASSES.ACTIVE);

                        focusFirstInput(targetSection);

                        if (

                            gameState.selectedSubject === CONSTANTS.SUBJECTS.CREATIVE ||

                            gameState.selectedSubject === CONSTANTS.SUBJECTS.OVERVIEW ||

                            gameState.selectedSubject === CONSTANTS.SUBJECTS.INTEGRATED_COURSE ||

                            gameState.selectedSubject === CONSTANTS.SUBJECTS.SOCIAL_COURSE ||

                            gameState.selectedSubject === CONSTANTS.SUBJECTS.MATH_COURSE ||

                            gameState.selectedSubject === CONSTANTS.SUBJECTS.MUSIC_COURSE ||

                            gameState.selectedSubject === CONSTANTS.SUBJECTS.ART_COURSE ||

                            gameState.selectedSubject === CONSTANTS.SUBJECTS.MORAL_COURSE ||

                            gameState.selectedSubject === CONSTANTS.SUBJECTS.PE_BACK ||

                            gameState.selectedSubject === CONSTANTS.SUBJECTS.SCIENCE_STD ||

                            gameState.selectedSubject === CONSTANTS.SUBJECTS.ENGLISH_STD ||

                            gameState.selectedSubject === CONSTANTS.SUBJECTS.PRACTICAL_STD ||

                            gameState.selectedSubject === CONSTANTS.SUBJECTS.ART_STD ||

                            gameState.selectedSubject === CONSTANTS.SUBJECTS.MATH_OPERATION ||

                            gameState.selectedSubject === CONSTANTS.SUBJECTS.CHANGE_RELATION ||

                            gameState.selectedSubject === CONSTANTS.SUBJECTS.GEOMETRY_MEASURE ||
                            gameState.selectedSubject === CONSTANTS.SUBJECTS.DATA_PROBABILITY ||

                            (gameState.selectedSubject === CONSTANTS.SUBJECTS.SPELLING && isSpellingBlankMode())

                        ) {

                            adjustCreativeInputWidths();

                        }

                    }

                }

            });

        });



        const SECTION_GROUPS = {

            [CONSTANTS.SUBJECTS.COMPETENCY]: {

                integrated: ['integrated', 'goodlife', 'sociality', 'joyful']

            }

        };



        document.querySelectorAll('.competency-tabs').forEach(tabs => {

            tabs.addEventListener('click', e => {

                if (!e.target.matches('.competency-tab')) return;

                // INP 개선: 사운드 재생을 지연시켜 즉시 응답성 향상
            setTimeout(() => playSound(clickAudio), 0);

                tabs.querySelectorAll('.competency-tab').forEach(tab => tab.classList.remove(CONSTANTS.CSS_CLASSES.ACTIVE));

                e.target.classList.add(CONSTANTS.CSS_CLASSES.ACTIVE);

                const targetId = e.target.dataset.target;

                const main = tabs.closest('main');

                const subject = main ? main.id.replace('-quiz-main', '') : '';

                const sectionGroups = SECTION_GROUPS[subject] || {};

                main.querySelectorAll('section').forEach(sec => sec.classList.remove(CONSTANTS.CSS_CLASSES.ACTIVE));

                const sectionIds = sectionGroups[targetId] || [targetId];

                sectionIds.forEach(id => {

                    const targetSection = main.querySelector(`#${id}`);

                    if (targetSection) {

                        targetSection.classList.add(CONSTANTS.CSS_CLASSES.ACTIVE);

                    }

                });

                const firstSection = main.querySelector(`#${sectionIds[0]}`);

                if (firstSection) {

                    focusFirstInput(firstSection);

                }

            });

        });

        

        function toggleAccordion(header) {

            const accordion = header.closest('.accordion');

            const targetSection = header.nextElementSibling;

            if (!accordion || !targetSection) return;

            const isExpanded = header.getAttribute('aria-expanded') === 'true';

            accordion.querySelectorAll('.accordion-header').forEach(h => h.setAttribute('aria-expanded', 'false'));

            accordion.querySelectorAll('section').forEach(s => s.classList.remove(CONSTANTS.CSS_CLASSES.ACTIVE));

            if (!isExpanded) {

                header.setAttribute('aria-expanded', 'true');

                targetSection.classList.add(CONSTANTS.CSS_CLASSES.ACTIVE);

                focusFirstInput(targetSection);

            }

        }



        document.querySelectorAll('.accordion-header').forEach(header => {

            header.addEventListener('click', () => toggleAccordion(header));

            header.addEventListener('keydown', e => {

                if (e.key === 'Enter' || e.key === ' ') {

                    e.preventDefault();

                    toggleAccordion(header);

                }

            });

        });



        const attachInputHandlers = root => {

            // Use requestAnimationFrame to defer heavy computation and improve INP
            const debouncedHandleInputChange = (e) => {
                requestAnimationFrame(() => handleInputChange(e));
            };

            root.addEventListener('blur', debouncedHandleInputChange);

            root.addEventListener('keydown', e => {

                if (e.key === 'Enter' && e.target.matches('input[data-answer]')) {

                    e.preventDefault();
                    handleInputChange({ target: e.target });

                    if (e.target.classList.contains(CONSTANTS.CSS_CLASSES.CORRECT)) {

                        const container = e.target.closest('main, .modal-content') || root;

                        const inputs = Array.from(container.querySelectorAll('input[data-answer]'));

                        const idx = inputs.indexOf(e.target);

                        for (let i = idx + 1; i < inputs.length; i++) {

                            if (!inputs[i].disabled) {

                                inputs[i].focus();

                                inputs[i].scrollIntoView({ behavior: 'smooth', block: 'center' });

                                break;

                            }

                        }

                    }

                }

            });

        };



        // 중복 함수 제거됨 - 위에서 통합된 버전 사용



        quizContainers.forEach(main => attachInputHandlers(main));

        // 버섯 캐릭터 클릭 이벤트 - 개수 블럭 3초간 표시
        let countBlockTimer = null;
        character.addEventListener('click', () => {
            const todayBlankCount = document.getElementById('today-blank-count');
            if (todayBlankCount) {
                // 기존 타이머 취소
                if (countBlockTimer) {
                    clearTimeout(countBlockTimer);
                }

                // 개수 블럭 표시 및 최신 데이터로 업데이트
                todayBlankCount.classList.remove('hidden');
                updateTodayBlankCount();

                // 1.5초 후 자동 숨김
                countBlockTimer = setTimeout(() => {
                    todayBlankCount.classList.add('hidden');
                    countBlockTimer = null;
                }, 1500);
            }
        });



        // modal removed; no extra handlers

        

        if (startGameBtn) {
            startGameBtn.addEventListener('click', (e) => {
                console.log('시작 버튼 클릭됨!', e);
                e.preventDefault();
                e.stopPropagation();
                try {
                    startGame();
                } catch (error) {
                    console.error('startGame 함수 실행 중 에러:', error);
                }
            });
            console.log('시작 버튼 이벤트 리스너 등록 완료');
        } else {
            console.error('시작 버튼을 찾을 수 없습니다. ID: start-game-btn');
        }

        resetBtn.addEventListener('click', () => resetGame(true));

        forceQuitBtn.addEventListener('click', () => {
            if(gameState.timerId) {
                gameState.isForceQuit = true; // 강제 종료 플래그 설정
                gameState.total = 0;
                tick();
            }
        });

        // 오답 기록 초기화 버튼 이벤트 리스너

        



        closeProgressModalBtn.addEventListener('click', () => {

            closeModal(progressModal);

            // 정답 보기 기능 실행
            if (
                SPECIAL_SUBJECTS.has(gameState.selectedSubject) ||
                (gameState.selectedTopic === CONSTANTS.TOPICS.MODEL && gameState.selectedSubject === CONSTANTS.SUBJECTS.INTEGRATED_MODEL) ||
                (gameState.selectedTopic === CONSTANTS.TOPICS.MODEL && gameState.selectedSubject === CONSTANTS.SUBJECTS.SCIENCE)
            ) {
                revealCompetencyAnswers();
            } else {
                const mainId = getMainElementId();
                document
                    .querySelectorAll(`#${mainId} input[data-answer]`)
                    .forEach(input => {
                        if (!input.classList.contains(CONSTANTS.CSS_CLASSES.CORRECT)) {
                            input.value = input.dataset.answer;
                            input.classList.remove(
                                CONSTANTS.CSS_CLASSES.INCORRECT,
                                CONSTANTS.CSS_CLASSES.RETRYING
                            );
                            input.classList.add(
                                CONSTANTS.CSS_CLASSES.CORRECT,
                                CONSTANTS.CSS_CLASSES.REVEALED
                            );
                        }
                        input.disabled = true;
                    });
            }

            const mainId = getMainElementId();
            const main = document.getElementById(mainId);
            if (main) main.dataset.answersRevealed = 'true';

            // showAnswersBtn 제거됨 - 기능이 결과창의 정답 보기 버튼으로 통합됨

            // 다른 버튼들 표시
            scrapResultImageBtnTop.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);
            resetBtn.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);

        });



        // 디바이스 및 브라우저 감지 함수들

        const isMobile = () => {

            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        };



        const isSafari = () => {

            return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

        };



        const isIOS = () => {

            return /iPad|iPhone|iPod/.test(navigator.userAgent);

        };



        // 클립보드 API 지원 확인

        const supportsClipboardAPI = () => {

            return navigator.clipboard && 

                   navigator.clipboard.write && 

                   window.ClipboardItem &&

                   window.isSecureContext; // HTTPS 확인

        };



        // 이미지 다운로드 함수

        const downloadImage = (canvas, filename = 'quiz-result.png') => {

            const link = document.createElement('a');

            link.download = filename;

            link.href = canvas.toDataURL('image/png');

            document.body.appendChild(link);

            link.click();

            document.body.removeChild(link);

        };



        // Web Share API를 통한 이미지 공유 (모바일용)

        const shareImage = async (canvas) => {

            if (navigator.share && navigator.canShare) {

                try {

                    const dataUrl = canvas.toDataURL('image/png');

                    const blob = await (await fetch(dataUrl)).blob();

                    const file = new File([blob], 'quiz-result.png', { type: 'image/png' });

                    

                    if (navigator.canShare({ files: [file] })) {

                        await navigator.share({

                            title: '퀴즈 결과',

                            text: '퀴즈 결과를 공유합니다.',

                            files: [file]

                        });

                        return true;

                    }

                } catch (err) {

                    // Share API failed, fallback to other methods

                }

            }

            return false;

        };



        // 향상된 클립보드 복사 함수

        const copyImageToClipboard = async (canvas) => {

            // 방법 1: 최신 Clipboard API 시도 (크롬, 파이어폭스)

            if (supportsClipboardAPI()) {

                try {

                    const dataUrl = canvas.toDataURL('image/png');

                    

                    // Safari는 특별한 처리가 필요 (macOS Safari는 Promise 기반 blob 필요)

                    if (isSafari()) {

                        // Safari에서는 ClipboardItem을 Promise를 반환하는 함수로 생성해야 함

                        await navigator.clipboard.write([

                            new ClipboardItem({

                                'image/png': fetch(dataUrl).then(res => res.blob())

                            })

                        ]);

                    } else {

                        const blob = await (await fetch(dataUrl)).blob();

                        await navigator.clipboard.write([

                            new ClipboardItem({ [blob.type]: blob })

                        ]);

                    }

                    return { success: true, method: 'clipboard-api' };

                } catch (err) {

                    // Clipboard API failed, fallback to other methods

                }

            }



            // 방법 2: 텍스트 형태로 Data URL 복사 시도

            if (navigator.clipboard && navigator.clipboard.writeText) {

                try {

                    const dataUrl = canvas.toDataURL('image/png');

                    await navigator.clipboard.writeText(dataUrl);

                    return { success: true, method: 'text-dataurl' };

                } catch (err) {

                    // Text clipboard failed, fallback to other methods

                }

            }



            // 방법 3: 레거시 방법 (텍스트만 가능)

            try {

                const dataUrl = canvas.toDataURL('image/png');

                const textArea = document.createElement('textarea');

                textArea.value = dataUrl;

                textArea.style.position = 'fixed';

                textArea.style.left = '-999999px';

                document.body.appendChild(textArea);

                textArea.select();

                textArea.setSelectionRange(0, 99999);

                

                const success = document.execCommand('copy');

                document.body.removeChild(textArea);

                

                if (success) {

                    return { success: true, method: 'legacy-text' };

                }

            } catch (err) {

                // Legacy copy failed

            }



            return { success: false, method: 'none' };

        };



        // 로딩 상태 관리 함수들 (버튼 상태만 변경, 오버레이 제거)
        const setLoadingState = (loading) => {
            const buttons = [scrapResultImageBtn, scrapResultImageBtnTop].filter(btn => btn);

            buttons.forEach(btn => {
                if (loading) {
                    // 즉시 시각적 변경을 위해 동기적으로 처리
                    btn.style.pointerEvents = 'none'; // 클릭 방지
                    btn.classList.add('loading');
                    btn.disabled = true;
                    const originalText = btn.textContent;
                    btn.setAttribute('data-original-text', originalText);
                    btn.innerHTML = '<span class="btn-text">' + originalText + '</span>';
                    
                    // 강제 리플로우로 변경사항 즉시 적용
                    btn.offsetHeight;
                    btn.getBoundingClientRect();
                } else {
                    btn.style.pointerEvents = '';
                    btn.classList.remove('loading');
                    btn.disabled = false;
                    const originalText = btn.getAttribute('data-original-text');
                    if (originalText) {
                        btn.textContent = originalText;
                        btn.removeAttribute('data-original-text');
                    }
                }
            });
        };

        // 캡처 성능 최적화를 위한 캐시 변수
        let lastCaptureTime = 0;
        let cachedCanvas = null;
        let lastResultHash = null; // 결과 내용 변경 감지용
        const CAPTURE_CACHE_DURATION = 5000; // 5초간 캐시 유지 (연장)

        const handleScrapResultImage = async () => {
            const modalContent = document.querySelector('#progress-modal .modal-content');
            const wasHidden = !progressModal.classList.contains(CONSTANTS.CSS_CLASSES.ACTIVE);

            // Safari 특별 처리: 사용자 제스처 컨텍스트 내에서 clipboard.write() 호출
            if (isSafari() && !isMobile() && supportsClipboardAPI()) {
                try {
                    // 버튼 클릭 즉시 로딩 상태로 변경
                    setLoadingState(true);
                    
                    if (wasHidden) {
                        openModal(progressModal);
                        await new Promise(resolve => requestAnimationFrame(resolve));
                    }

                    // Safari를 위한 즉시 clipboard.write() 호출 (사용자 제스처 컨텍스트 유지)
                    await navigator.clipboard.write([
                        new ClipboardItem({
                            'image/png': (async () => {
                                // 이 함수는 나중에 실행되므로 html2canvas를 여기서 호출
                                const canvas = await html2canvas(modalContent, {
                                    backgroundColor: '#ffffff',
                                    scale: 1.2,
                                    logging: false,
                                    removeContainer: true,
                                    imageTimeout: 3000,
                                    useCORS: false,
                                    allowTaint: true,
                                    foreignObjectRendering: false,
                                    ignoreElements: (element) => {
                                        return element.classList.contains('loading') ||
                                               element.classList.contains('hidden') ||
                                               element.style.display === 'none' ||
                                               element.style.visibility === 'hidden';
                                    },
                                    onclone: (clonedDoc) => {
                                        const clonedContent = clonedDoc.querySelector('.modal-content');
                                        if (clonedContent) {
                                            const allElements = clonedContent.querySelectorAll('*');
                                            allElements.forEach(el => {
                                                el.style.transition = 'none';
                                                el.style.animation = 'none';
                                                el.style.transform = 'none';
                                                el.style.boxShadow = 'none';
                                                el.style.filter = 'none';
                                            });
                                            clonedContent.style.fontDisplay = 'swap';
                                        }
                                    }
                                });
                                
                                const dataUrl = canvas.toDataURL('image/png');
                                const blob = await (await fetch(dataUrl)).blob();
                                
                                // 캔버스 캐싱
                                cachedCanvas = canvas;
                                lastCaptureTime = Date.now();
                                const resultText = modalContent.textContent || '';
                                lastResultHash = resultText.length + resultText.slice(0, 100);
                                
                                return blob;
                            })()
                        })
                    ]);

                    setLoadingState(false);
                    alert('결과 이미지가 복사되었습니다!');
                    
                    if (wasHidden) {
                        closeModal(progressModal);
                    }
                    return;

                } catch (error) {
                    console.error('Safari clipboard failed:', error);
                    setLoadingState(false);
                    alert('클립보드 복사에 실패했습니다. 다시 시도해주세요.');
                    if (wasHidden) {
                        closeModal(progressModal);
                    }
                    return;
                }
            }

            // 일반 처리 (Chrome, Firefox, 기타 브라우저)
            // 버튼 클릭 즉시 로딩 상태로 변경 (동기적 처리)
            setLoadingState(true);
            
            // DOM 변경사항을 즉시 반영하기 위한 강제 렌더링
            document.body.offsetHeight;
            
            // 메인 스레드 블로킹 방지를 위한 마이크로태스크 분할
            await new Promise(resolve => setTimeout(resolve, 0));

            if (wasHidden) {
                openModal(progressModal);
                // 모달이 열린 경우에만 최소한의 대기
                await new Promise(resolve => requestAnimationFrame(resolve));
            }

            try {
                // 결과 내용 해시 생성 (빠른 변경 감지)
                const resultText = modalContent.textContent || '';
                const currentResultHash = resultText.length + resultText.slice(0, 100);
                
                // 캐시된 캔버스가 있고 유효한 경우 재사용
                const currentTime = Date.now();
                const isCacheValid = cachedCanvas && 
                                   (currentTime - lastCaptureTime) < CAPTURE_CACHE_DURATION &&
                                   lastResultHash === currentResultHash;
                
                if (isCacheValid) {
                    // 캐시된 캔버스 사용으로 즉시 처리
                    const canvas = cachedCanvas;
                    
                    // 모바일 환경에서는 공유 우선
                    if (isMobile()) {
                        const shareSuccess = await shareImage(canvas);
                        setLoadingState(false); // 로딩 상태 해제
                        if (shareSuccess) {
                            alert('결과 이미지가 공유되었습니다!');
                            return;
                        }
                        // 공유 실패 시 사용자에게 알림
                        alert('공유에 실패했습니다. 다시 시도해주세요.');
                        return;
                    }

                    // 데스크톱 환경에서는 클립보드 복사 시도
                    const copyResult = await copyImageToClipboard(canvas);
                    setLoadingState(false); // 로딩 상태 해제
                    if (copyResult.success) {
                        if (copyResult.method === 'text-dataurl' || copyResult.method === 'legacy-text') {
                            alert('이미지 데이터가 복사되었습니다!\n(일부 앱에서는 이미지로 붙여넣기가 안될 수 있습니다)');
                        } else {
                            alert('결과 이미지가 복사되었습니다!');
                        }
                    } else {
                        alert('클립보드 복사에 실패했습니다. 다시 시도해주세요.');
                    }
                    return;
                }

                const canvas = await html2canvas(modalContent, {

                    backgroundColor: '#ffffff',

                    scale: 1.2, // 성능 우선으로 스케일 추가 감소

                    logging: false,

                    removeContainer: true,

                    imageTimeout: 3000, // 타임아웃 더 단축

                    useCORS: false, // CORS 체크 비활성화로 속도 향상

                    allowTaint: true, // 외부 리소스 허용으로 빠른 처리

                    foreignObjectRendering: false, // SVG 렌더링 비활성화

                    ignoreElements: (element) => {
                        // 불필요한 요소들 렌더링에서 제외
                        return element.classList.contains('loading') ||
                               element.classList.contains('hidden') ||
                               element.style.display === 'none' ||
                               element.style.visibility === 'hidden';
                    },

                    onclone: (clonedDoc) => {
                        const clonedContent = clonedDoc.querySelector('.modal-content');
                        if (clonedContent) {
                            // 모든 애니메이션과 트랜지션 완전 제거
                            const allElements = clonedContent.querySelectorAll('*');
                            allElements.forEach(el => {
                                el.style.transition = 'none';
                                el.style.animation = 'none';
                                el.style.transform = 'none';
                                // 불필요한 CSS 속성 제거
                                el.style.boxShadow = 'none';
                                el.style.filter = 'none';
                            });
                            
                            // 폰트 로딩 최적화
                            clonedContent.style.fontDisplay = 'swap';
                        }
                    }

                });

                // 캔버스를 캐시에 저장
                cachedCanvas = canvas;
                lastCaptureTime = Date.now();
                lastResultHash = currentResultHash;

                // 모바일 환경에서는 공유 우선

                if (isMobile()) {

                    // Web Share API 시도 (모바일)

                    const shareSuccess = await shareImage(canvas);

                    if (shareSuccess) {

                        alert('결과 이미지가 공유되었습니다!');

                        return;

                    }

                    // 공유 실패 시 사용자에게 알림
                    alert('공유에 실패했습니다. 다시 시도해주세요.');
                    return;

                }



                // 데스크톱 환경에서는 클립보드 복사 시도

                const copyResult = await copyImageToClipboard(canvas);

                

                if (copyResult.success) {

                    if (copyResult.method === 'text-dataurl' || copyResult.method === 'legacy-text') {

                        alert('이미지 데이터가 복사되었습니다!\n(일부 앱에서는 이미지로 붙여넣기가 안될 수 있습니다)');

                    } else {

                        alert('결과 이미지가 복사되었습니다!');

                    }

                } else {

                    // 복사 실패 시 사용자에게 알림
                    alert('클립보드 복사에 실패했습니다. 다시 시도해주세요.');

                }



            } catch (error) {

                console.error('Image capture failed:', error);

                alert('이미지 캡처에 실패했습니다. 다시 시도해주세요.');

            } finally {

                // 로딩 상태 해제
                setLoadingState(false);

                if (wasHidden) {

                    closeModal(progressModal);

                }

            }

        };



        // 각 탭별 복사 기능
        const handleTabCopy = async (tabId) => {
            const section = document.getElementById(tabId);
            if (!section) {
                alert('탭을 찾을 수 없습니다.');
                return;
            }

            const copyButton = section.querySelector('.copy-tab-btn');
            const originalText = copyButton ? copyButton.textContent : '';
            
            if (copyButton) {
                copyButton.disabled = true;
                copyButton.classList.add('loading');
                copyButton.setAttribute('data-original-text', originalText);
                copyButton.innerHTML = '<span class="btn-text">' + originalText + '</span>';
            }

            // 섹션이 숨겨져 있는지 확인하고 일시적으로 보이게 하기
            const wasHidden = !section.classList.contains('active');
            const originalPosition = section.style.position;
            const originalLeft = section.style.left;
            const originalTop = section.style.top;
            
            if (wasHidden) {
                // 일시적으로 섹션을 보이게 함 (화면 밖에 위치시켜 사용자에게는 안 보이게)
                section.style.position = 'absolute';
                section.style.left = '-9999px';
                section.style.top = '0';
                section.classList.add('active');
                // 강제로 display block 설정
                section.style.display = 'block';
            }

            // DOM 변경사항이 완전히 반영될 때까지 대기
            await new Promise(resolve => requestAnimationFrame(resolve));
            await new Promise(resolve => setTimeout(resolve, 100));

            try {
                const canvas = await html2canvas(section, {
                    backgroundColor: '#ffffff',
                    scale: 2, // 해상도 향상
                    logging: false,
                    removeContainer: true,
                    imageTimeout: 3000,
                    useCORS: false, // CORS 체크 비활성화
                    allowTaint: true, // 외부 리소스 허용
                    foreignObjectRendering: false, // SVG 렌더링 비활성화
                    ignoreElements: (element) => {
                        return element.classList.contains('loading') ||
                               element.classList.contains('hidden') ||
                               element.classList.contains('copy-tab-btn') ||
                               element.style.display === 'none' ||
                               element.style.visibility === 'hidden';
                    },
                    onclone: (clonedDoc) => {
                        const clonedSection = clonedDoc.getElementById(tabId);
                        if (clonedSection) {
                            // 복사 버튼 숨기기
                            const clonedBtn = clonedSection.querySelector('.copy-tab-btn');
                            if (clonedBtn) {
                                clonedBtn.style.display = 'none';
                            }
                            
                            // 모든 요소의 애니메이션 제거
                            const allElements = clonedSection.querySelectorAll('*');
                            allElements.forEach(el => {
                                el.style.transition = 'none';
                                el.style.animation = 'none';
                                el.style.boxShadow = 'none';
                                el.style.filter = 'none';
                            });
                            
                            // input 요소를 텍스트로 변환하여 렌더링 개선
                            const inputs = clonedSection.querySelectorAll('input[data-answer]');
                            inputs.forEach((input, index) => {
                                const originalInput = section.querySelectorAll('input[data-answer]')[index];
                                if (!originalInput) return;
                                
                                // input을 div로 교체
                                const replacement = clonedDoc.createElement('div');
                                
                                // 원본 input의 스타일 복사
                                const computedStyle = window.getComputedStyle(originalInput);
                                replacement.style.cssText = input.style.cssText;
                                replacement.style.display = 'inline-block';
                                replacement.style.border = computedStyle.border;
                                replacement.style.borderRadius = computedStyle.borderRadius;
                                replacement.style.padding = computedStyle.padding;
                                replacement.style.fontSize = computedStyle.fontSize;
                                replacement.style.fontFamily = computedStyle.fontFamily;
                                replacement.style.fontWeight = computedStyle.fontWeight;
                                replacement.style.color = computedStyle.color;
                                replacement.style.backgroundColor = computedStyle.backgroundColor;
                                replacement.style.textAlign = 'center';
                                replacement.style.verticalAlign = 'middle';
                                replacement.style.lineHeight = computedStyle.lineHeight;
                                replacement.style.minWidth = computedStyle.width;
                                replacement.style.minHeight = computedStyle.height;
                                replacement.style.boxSizing = 'border-box';
                                
                                // 텍스트 내용 설정 (value 또는 placeholder)
                                const text = originalInput.value || originalInput.placeholder || '';
                                replacement.textContent = text;
                                
                                // class 복사 (정답/오답 스타일 유지)
                                replacement.className = input.className;
                                
                                // input을 replacement로 교체
                                if (input.parentNode) {
                                    input.parentNode.replaceChild(replacement, input);
                                }
                            });
                            
                            clonedSection.style.fontDisplay = 'swap';
                        }
                    }
                });

                // 모바일 환경에서는 공유 우선
                if (isMobile()) {
                    const shareSuccess = await shareImage(canvas);
                    if (shareSuccess) {
                        alert('탭 내용이 공유되었습니다!');
                    } else {
                        alert('공유에 실패했습니다. 다시 시도해주세요.');
                    }
                } else {
                    // 데스크톱 환경에서는 클립보드 복사
                    const copyResult = await copyImageToClipboard(canvas);
                    if (copyResult.success) {
                        if (copyResult.method === 'text-dataurl' || copyResult.method === 'legacy-text') {
                            alert('탭 이미지 데이터가 복사되었습니다!\n(일부 앱에서는 이미지로 붙여넣기가 안될 수 있습니다)');
                        } else {
                            alert('탭 내용이 복사되었습니다!');
                        }
                    } else {
                        alert('클립보드 복사에 실패했습니다. 다시 시도해주세요.');
                    }
                }
            } catch (error) {
                console.error('Tab copy failed:', error);
                alert('이미지 캡처에 실패했습니다. 다시 시도해주세요.');
            } finally {
                // 섹션 상태 복원
                if (wasHidden) {
                    section.classList.remove('active');
                    section.style.display = '';
                    section.style.position = originalPosition || '';
                    section.style.left = originalLeft || '';
                    section.style.top = originalTop || '';
                }
                
                // 버튼 상태 복원
                if (copyButton) {
                    copyButton.disabled = false;
                    copyButton.classList.remove('loading');
                    // 원본 텍스트로 복원
                    const savedText = copyButton.getAttribute('data-original-text');
                    if (savedText) {
                        copyButton.textContent = savedText;
                        copyButton.removeAttribute('data-original-text');
                    } else {
                        copyButton.textContent = originalText;
                    }
                }
            }
        };



        // 버튼 텍스트를 환경에 맞게 업데이트

        const updateCopyButtonText = () => {

            const isMobileDevice = isMobile();

            const buttonText = isMobileDevice ? '결과창 공유' : '결과창 복사';

            

            if (scrapResultImageBtn) {

                scrapResultImageBtn.textContent = buttonText;

            }

            if (scrapResultImageBtnTop) {

                scrapResultImageBtnTop.textContent = buttonText;

            }

            // 탭 복사 버튼 텍스트도 업데이트
            const tabCopyButtons = document.querySelectorAll('.copy-tab-btn');
            const tabButtonText = isMobileDevice ? '📋 섹션 공유' : '📋 섹션 복사';
            tabCopyButtons.forEach(btn => {
                if (!btn.classList.contains('loading')) {
                    btn.textContent = tabButtonText;
                }
            });

        };



        // 페이지 로드시 버튼 텍스트 업데이트

        updateCopyButtonText();



        [scrapResultImageBtn, scrapResultImageBtnTop].forEach(btn =>

            btn.addEventListener('click', handleScrapResultImage)

        );



        // 탭별 복사 버튼 이벤트 리스너 등록
        document.querySelectorAll('.copy-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.getAttribute('data-tab');
                if (tabId) {
                    handleTabCopy(tabId);
                }
            });
        });



        decreaseTimeBtn.addEventListener('click', () => {

            // INP 개선: 사운드 재생을 지연시켜 즉시 응답성 향상
            setTimeout(() => playSound(clickAudio), 0);

            if (gameState.duration > 60) {

                gameState.duration -= 300;
                gameState.normalModeDuration = gameState.duration; // Normal 모드 duration도 함께 업데이트

                updateTimeSettingDisplay();

            }

        });



        increaseTimeBtn.addEventListener('click', () => {

            // INP 개선: 사운드 재생을 지연시켜 즉시 응답성 향상
            setTimeout(() => playSound(clickAudio), 0);

            if (gameState.duration < 7200) { // Max 120 mins

                gameState.duration += 300;
                gameState.normalModeDuration = gameState.duration; // Normal 모드 duration도 함께 업데이트

                updateTimeSettingDisplay();

            }

        });



        // showAnswersBtn 이벤트 리스너 제거됨 - 기능이 결과창의 정답 보기 버튼으로 통합됨



        (function() {

            const btn = document.getElementById('practical-title-next-btn');

            if (!btn) return;

            btn.addEventListener('click', () => {

                // Reveal only the Title section answers for Practical model

                const titleSection = document.querySelector('#practical-quiz-main #practical-title');

                if (titleSection) {

                    const normalize = str => normalizeAnswer(str);

                    const groups = titleSection.querySelectorAll('[data-group]');

                    if (groups.length > 0) {

                        groups.forEach(group => {

                            const inputs = group.querySelectorAll('input[data-answer]');

                            const usedSet = usedAnswersMap.get(group) || new Set();

                            const answers = Array.from(inputs).map(i => i.dataset.answer);

                            const remaining = answers.filter(ans => !usedSet.has(normalize(ans)));

                            let idx = 0;

                            inputs.forEach(input => {

                                input.classList.remove(

                                    CONSTANTS.CSS_CLASSES.INCORRECT,

                                    CONSTANTS.CSS_CLASSES.RETRYING

                                );

                                if (!input.classList.contains(CONSTANTS.CSS_CLASSES.CORRECT)) {

                                    input.value = remaining[idx] ?? input.dataset.answer;

                                    idx++;

                                    input.classList.add(CONSTANTS.CSS_CLASSES.REVEALED);

                                }

                                input.disabled = true;

                            });

                        });

                    } else {

                        titleSection.querySelectorAll('input[data-answer]').forEach(input => {

                            input.classList.remove(

                                CONSTANTS.CSS_CLASSES.INCORRECT,

                                CONSTANTS.CSS_CLASSES.RETRYING

                            );

                            input.value = input.dataset.answer;

                            input.classList.add(CONSTANTS.CSS_CLASSES.REVEALED);

                            input.disabled = true;

                        });

                    }

                }



                // Enable other sections and unblur tabs

                const main = document.getElementById('practical-quiz-main');

                if (main) {

                    main.querySelectorAll('section').forEach(sec => {

                        if (sec.id !== 'practical-title') {

                            sec.querySelectorAll('input[data-answer]').forEach(i => i.disabled = false);

                            sec.style.opacity = '';

                            sec.style.pointerEvents = '';

                            sec.classList.remove('practical-section-disabled');

                        }

                    });

                    const tabs = main.querySelectorAll('.tabs .tab');

                    tabs.forEach(tab => tab.classList.remove('practical-disabled'));

                }

            });

        })();



        // Generic '다음으로' for model subjects

        (function() {

            const cfgs = [

                { mainId: 'pe-model-quiz-main', titleId: 'pe-title', btnId: 'pe-title-next-btn' },

                { mainId: 'ethics-quiz-main', titleId: 'ethics-title', btnId: 'ethics-title-next-btn' },

                { mainId: 'korean-model-quiz-main', titleId: 'korean-title', btnId: 'korean-title-next-btn' },

                { mainId: 'art-model-quiz-main', titleId: 'art-title', btnId: 'art-title-next-btn' },

                { mainId: 'math-model-quiz-main', titleId: 'math-title', btnId: 'math-title-next-btn' },

                { mainId: 'social-quiz-main', titleId: 'social-title', btnId: 'social-title-next-btn' },

                { mainId: 'science-quiz-main', titleId: 'science-title', btnId: 'science-title-next-btn' },

                { mainId: 'science-curriculum-quiz-main', titleId: 'science-title', btnId: 'science-title-next-btn' }

            ];

            cfgs.forEach(cfg => {

                const btn = document.getElementById(cfg.btnId);

                if (!btn) return;

                btn.addEventListener('click', () => {

                    const titleSection = document.querySelector(`#${cfg.mainId} #${cfg.titleId}`);

                    if (titleSection) {

                        const normalize = str => normalizeAnswer(str);

                        const groups = titleSection.querySelectorAll('[data-group]');

                        if (groups.length > 0) {

                            groups.forEach(group => {

                                const inputs = group.querySelectorAll('input[data-answer]');

                                const usedSet = usedAnswersMap.get(group) || new Set();

                                const answers = Array.from(inputs).map(i => i.dataset.answer);

                                const remaining = answers.filter(ans => !usedSet.has(normalize(ans)));

                                let idx = 0;

                                inputs.forEach(input => {

                                    input.classList.remove(

                                        CONSTANTS.CSS_CLASSES.INCORRECT,

                                        CONSTANTS.CSS_CLASSES.RETRYING

                                    );

                                    if (!input.classList.contains(CONSTANTS.CSS_CLASSES.CORRECT)) {

                                        input.value = remaining[idx] ?? input.dataset.answer;

                                        idx++;

                                        input.classList.add(CONSTANTS.CSS_CLASSES.REVEALED);

                                    }

                                    input.disabled = true;

                                });

                            });

                        } else {

                            titleSection.querySelectorAll('input[data-answer]').forEach(input => {

                                input.classList.remove(

                                    CONSTANTS.CSS_CLASSES.INCORRECT,

                                    CONSTANTS.CSS_CLASSES.RETRYING

                                );

                                input.value = input.dataset.answer;

                                input.classList.add(CONSTANTS.CSS_CLASSES.REVEALED);

                                input.disabled = true;

                            });

                        }

                    }



                    // Enable other sections and unblur tabs

                    const main = document.getElementById(cfg.mainId);

                    if (main) {

                        main.querySelectorAll('section').forEach(sec => {

                            if (sec.id !== cfg.titleId) {

                                sec.querySelectorAll('input[data-answer]').forEach(i => i.disabled = false);

                                sec.style.opacity = '';

                                sec.style.pointerEvents = '';

                                sec.classList.remove('practical-section-disabled');

                            }

                        });

                        const tabs = main.querySelectorAll('.tabs .tab');

                        tabs.forEach(tab => tab.classList.remove('practical-disabled'));

                    }

                });

            });

        })();



        // --- 맞춤법 퀴즈 기능 ---

        function shuffleArray(array) {

            const shuffled = [...array];

            for (let i = shuffled.length - 1; i > 0; i--) {

                const j = Math.floor(Math.random() * (i + 1));

                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];

            }

            return shuffled;

        }



        function extractChoices(sentence) {

            const match = sentence.match(/\(([^)]+)\)/);

            if (!match) return null;

            

            const choicesText = match[1];

            const choices = choicesText.split(',').map(c => c.trim());

            

            // 50% 확률로 선지 순서 뒤집기

            if (Math.random() < 0.5) {

                choices.reverse();

            }

            

            return {

                choices,

                position: match.index,

                fullMatch: match[0]

            };

        }



        function renderSpellingQuestion(questionData) {

            const questionsList = document.getElementById('spelling-questions-list');

            const { sentence, answer } = questionData;

            

            const choiceData = extractChoices(sentence);

            if (!choiceData) return;

            

            const { choices, position, fullMatch } = choiceData;

            

            // 괄호 앞부분 + 버튼들 + 괄호 뒷부분

            const beforeParens = sentence.substring(0, position);

            const afterParens = sentence.substring(position + fullMatch.length);

            

            // 새로운 문항 요소 생성

            const questionItem = document.createElement('div');

            questionItem.className = 'spelling-question-item current';

            questionItem.dataset.questionIndex = gameState.spelling.currentQuestionIndex;

            

            questionItem.innerHTML = `

                <div class="spelling-question-content">

                    ${beforeParens}

                    <button class="spelling-choice-btn" data-choice="${choices[0]}">${choices[0]}</button>

                    <button class="spelling-choice-btn" data-choice="${choices[1]}">${choices[1]}</button>

                    ${afterParens}

                </div>

            `;

            

            // 기존 현재 문항의 current 클래스 제거

            const currentItems = questionsList.querySelectorAll('.spelling-question-item.current');

            currentItems.forEach(item => item.classList.remove('current'));

            

            // 새 문항을 리스트 맨 위에 추가

            questionsList.prepend(questionItem);

            

            // 버튼 이벤트 리스너 추가

            const buttons = questionItem.querySelectorAll('.spelling-choice-btn');

            buttons.forEach(button => {

                button.addEventListener('click', () => handleSpellingChoice(button, answer, buttons, questionItem));

                

                // 모바일 터치 개선을 위한 터치 이벤트 추가

                if ('ontouchstart' in window) {

                    button.addEventListener('touchstart', (e) => {

                        e.preventDefault();

                        button.style.transform = 'translateY(-1px) scale(0.98)';

                    }, { passive: false });

                    

                    button.addEventListener('touchend', (e) => {

                        e.preventDefault();

                        button.style.transform = '';

                        // 터치 종료 시 클릭 이벤트 발생

                        if (!gameState.spelling.answered) {

                            handleSpellingChoice(button, answer, buttons, questionItem);

                        }

                    }, { passive: false });

                    

                    button.addEventListener('touchcancel', () => {

                        button.style.transform = '';

                    });

                }

            });

            

            // 키보드 네비게이션 설정

            setupSpellingKeyboard(buttons, answer, questionItem);

            

            // 모바일에서 문항이 잘 보이도록 스크롤 조정

            if (window.innerWidth <= 768) {

                setTimeout(() => {

                    questionItem.scrollIntoView({ 

                        behavior: 'smooth', 

                        block: 'center',

                        inline: 'nearest'

                    });

                }, 100);

            }

            

            // 자동 스크롤 제거 - 사용자가 직접 조작할 때까지 화면 고정

        }



        function setupSpellingKeyboard(buttons, correctAnswer, questionItem) {

            const keyboardHandler = (event) => {

                // 답이 이미 선택되었거나 빈칸 모드인 경우 무시

                if (gameState.spelling.answered || isSpellingBlankMode()) return;

                

                // 현재 활성화된 문항인지 확인

                const currentItem = document.querySelector('.spelling-question-item.current');

                if (!currentItem || !currentItem.contains(buttons[0])) return;

                

                if (event.key === 'ArrowLeft') {

                    event.preventDefault();

                    handleSpellingChoice(buttons[0], correctAnswer, buttons, questionItem);

                } else if (event.key === 'ArrowRight') {

                    event.preventDefault();

                    handleSpellingChoice(buttons[1], correctAnswer, buttons, questionItem);

                }

            };

            

            // 이벤트 리스너 추가

            document.addEventListener('keydown', keyboardHandler);

            

            // 정리 함수를 questionItem에 저장

            questionItem.keyboardCleanup = () => {

                document.removeEventListener('keydown', keyboardHandler);

            };

        }



        function handleSpellingChoice(clickedButton, correctAnswer, allButtons, questionItem) {

            if (gameState.spelling.answered) return;

            

            gameState.spelling.answered = true;

            const selectedChoice = clickedButton.dataset.choice;

            const isCorrect = selectedChoice === correctAnswer;

            

            // 키보드 이벤트 리스너 정리

            if (questionItem.keyboardCleanup) {

                questionItem.keyboardCleanup();

            }

            

            // 즉시 시각적 피드백

            allButtons.forEach(btn => {

                btn.disabled = true;

                if (btn.dataset.choice === correctAnswer) {

                    btn.classList.add('correct-answer');

                } else if (btn === clickedButton && !isCorrect) {

                    btn.classList.add('wrong-answer');

                }

            });

            

            // 문항 전체에 피드백 애니메이션

            if (isCorrect) {

                questionItem.classList.add('answer-correct');

            } else {

                questionItem.classList.add('answer-wrong');

            }

            

            // 문항을 answered 상태로 변경

            questionItem.classList.add('answered');

            questionItem.classList.remove('current');

            

            if (isCorrect) {

                gameState.spelling.score++;

                // 정답 효과 (즉시 실행)

                playSound(successAudio);

                gameState.combo++;

                setCharacterState('happy', 1500);

                if (gameState.gameMode === CONSTANTS.MODES.HARD_CORE) {

                    gameState.total = Math.min(gameState.total + CONSTANTS.HARD_CORE_TIME_BONUS, CONSTANTS.HARD_CORE_DURATION);

                }

                // 콤보 시각적 피드백

                showComboEffect();

            } else {

                // 오답 효과 (즉시 실행)

                playSound(failAudio);

                gameState.combo = 0;

                setCharacterState('sad', 1500);

            }

            

            updateMushroomGrowth();

            

            // 다음 문제로 빠르게 진행

            setTimeout(() => {

                nextSpellingQuestion();

            }, 800);

        }



        function showComboEffect() {

            if (gameState.combo > 1) {

                const comboText = document.createElement('div');

                comboText.textContent = `${gameState.combo} COMBO!`;

                comboText.style.cssText = `

                    position: fixed;

                    top: 50%;

                    left: 50%;

                    transform: translate(-50%, -50%);

                    font-size: 2rem;

                    font-weight: 900;

                    color: #FFD700;

                    text-shadow: 0 0 20px rgba(255, 215, 0, 0.8);

                    z-index: 9999;

                    pointer-events: none;

                    animation: comboFade 1s ease-out forwards;

                `;

                

                document.body.appendChild(comboText);

                

                setTimeout(() => {

                    if (comboText.parentNode) {

                        comboText.parentNode.removeChild(comboText);

                    }

                }, 1000);

            }

        }



        // 자동 스크롤 기능 비활성화 - 사용자가 직접 조작할 때까지 화면 고정

        // function scrollToCurrentQuestion() {

        //     const currentQuestion = document.querySelector('.spelling-question-item.current');

        //     if (currentQuestion) {

        //         // 현재 문항이 항상 첫 번째이므로 진행도 영역으로 스크롤

        //         const progressElement = document.getElementById('spelling-progress-container');

        //         if (progressElement) {

        //             progressElement.scrollIntoView({ 

        //                 behavior: 'smooth', 

        //                 block: 'start'

        //             });

        //         }

        //     } else {

        //         // 현재 문항이 없으면 맨 위로 스크롤

        //         const spellingContainer = document.getElementById('spelling-container');

        //         if (spellingContainer) {

        //             spellingContainer.scrollIntoView({ 

        //                 behavior: 'smooth', 

        //                 block: 'start'

        //             });

        //         }

        //     }

        // }



        function updateSpellingProgress() {

            const currentEl = document.getElementById('spelling-current-progress');

            const totalEl = document.getElementById('spelling-total-questions');

            const progressFill = document.getElementById('spelling-progress-fill');

            

            const currentProgress = gameState.spelling.currentQuestionIndex + 1;

            const totalQuestions = gameState.spelling.questions.length;

            const progressPercentage = (currentProgress / totalQuestions) * 100;

            

            currentEl.textContent = currentProgress;

            totalEl.textContent = totalQuestions;

            progressFill.style.width = `${progressPercentage}%`;

        }



        function nextSpellingQuestion() {

            gameState.spelling.currentQuestionIndex++;

            gameState.spelling.answered = false;

            

            // 진행도바는 풀이 진행 정도를 표시 (정답 여부 무관)

            const progressContainer = document.getElementById('spelling-progress-container');

            const progressFill = document.getElementById('spelling-progress-fill');

            if (progressContainer && progressFill) {

                progressContainer.classList.add('progress-increase');

                progressFill.classList.add('fill-animation');

                setTimeout(() => {

                    progressContainer.classList.remove('progress-increase');

                    progressFill.classList.remove('fill-animation');

                }, 600);

            }

            updateSpellingProgress();



            if (gameState.spelling.currentQuestionIndex >= gameState.spelling.questions.length) {

                // 라운드 완료

                showSpellingRoundComplete();

            } else {

                // 다음 문제 출제

                const currentQuestion = gameState.spelling.questions[gameState.spelling.currentQuestionIndex];

                renderSpellingQuestion(currentQuestion);

            }

        }



        function updateSpellingResultsToProgress() {

            // 맞춤법 퀴즈 결과를 일반 결과창 시스템에 반영

            const currentScore = gameState.spelling.score;

            const totalQuestions = gameState.spelling.questions.length;

            

            // 일일 통계에 점수 추가 (saveDailyStats는 이미 존재하는 함수)

            saveDailyStats(currentScore);

            

            // 히트맵 제목 갱신

            updateHeatmapTitle(getDailyStats(30));

            

            // 결과창의 정답 개수와 총 문항 수 업데이트

            const correctCountEl = document.getElementById('correct-count');

            const totalCountEl = document.getElementById('total-count');

            const resultProgress = document.getElementById('result-progress');

            

            if (correctCountEl && totalCountEl && resultProgress) {

                // 기존 점수에 새로운 점수 누적

                const currentCorrect = parseInt(correctCountEl.textContent) || 0;

                const currentTotal = parseInt(totalCountEl.textContent) || 0;

                

                const newCorrect = currentCorrect + currentScore;

                const newTotal = currentTotal + totalQuestions;

                const newPercentage = newTotal > 0 ? Math.round((newCorrect / newTotal) * 100) : 0;

                

                correctCountEl.textContent = newCorrect;

                totalCountEl.textContent = newTotal;

                resultProgress.style.width = `${newPercentage}%`;

            }

        }



        function showSpellingRoundComplete() {

            const completedMessage = document.getElementById('spelling-completed-message');

            

            // 맞춤법 결과를 결과창에 반영

            updateSpellingResultsToProgress();

            

            completedMessage.classList.remove('hidden');

            

            // 완료 메시지로 스크롤

            completedMessage.scrollIntoView({ 

                behavior: 'smooth', 

                block: 'center' 

            });

            

            // 1.2초 후 새 라운드 시작 (빠른 진행)

            setTimeout(() => {

                startNewSpellingRound();

                completedMessage.classList.add('hidden');

            }, 1200);

        }



        function startNewSpellingRound() {

            // 기존 문항들의 키보드 이벤트 리스너 정리

            const questionsList = document.getElementById('spelling-questions-list');

            const existingItems = questionsList.querySelectorAll('.spelling-question-item');

            existingItems.forEach(item => {

                if (item.keyboardCleanup) {

                    item.keyboardCleanup();

                }

            });

            

            // 기존 문항들 모두 제거

            questionsList.innerHTML = '';

            

            // 선택된 데이터셋에 따라 문항 설정

            let selectedData;

            switch (gameState.spelling.selectedDataset) {

                case 'basic':

                    selectedData = SPELLING_DATA_BASIC;

                    break;

                case 'extended':

                    selectedData = SPELLING_DATA_EXTENDED;

                    break;

                case 'all':

                    selectedData = SPELLING_DATA_ALL;

                    break;

                default:

                    selectedData = SPELLING_DATA_BASIC;

            }

            

            // 전체 문항 순서 새로 랜덤화

            gameState.spelling.questions = shuffleArray(selectedData);

            gameState.spelling.currentQuestionIndex = 0;

            gameState.spelling.score = 0;

            gameState.spelling.answered = false;

            

            updateSpellingProgress();

            

            // 첫 번째 문제 출제

            const firstQuestion = gameState.spelling.questions[0];

            renderSpellingQuestion(firstQuestion);

        }



        function isSpellingBlankMode() {

            const spellingMain = document.getElementById('spelling-quiz-main');

            if (!spellingMain) return false;

            const activeTab = spellingMain.querySelector('.tabs .tab.active');

            return activeTab && activeTab.dataset.target === 'spelling-blank';

        }



        function initializeSpellingQuiz() {

            // 현재 활성화된 탭 확인

            const spellingMain = document.getElementById('spelling-quiz-main');

            const activeTab = spellingMain.querySelector('.tabs .tab.active');

            

            if (activeTab && activeTab.dataset.target === 'spelling-blank') {

                // 빈칸 모드는 일반 입력 방식으로 처리 (총론과 동일)

                return;

            } else {

                // 다지선다 모드는 기존 방식 유지

                showSpellingDatasetSelection();

            }

        }



        function showSpellingDatasetSelection() {

            const selectionEl = document.getElementById('spelling-dataset-selection');

            const containerEl = document.getElementById('spelling-container');

            

            selectionEl.classList.remove('hidden');

            containerEl.classList.add('hidden');

            

            // 데이터셋 버튼 이벤트 리스너 추가

            const datasetBtns = document.querySelectorAll('.dataset-btn');

            datasetBtns.forEach(btn => {

                btn.addEventListener('click', () => {

                    const dataset = btn.dataset.dataset;

                    startSpellingQuizWithDataset(dataset);

                });

            });

        }



        function startSpellingQuizWithDataset(dataset) {

            gameState.spelling.selectedDataset = dataset;

            

            // 결과창 카운터 초기화

            const correctCountEl = document.getElementById('correct-count');

            const totalCountEl = document.getElementById('total-count');

            const resultProgress = document.getElementById('result-progress');

            

            if (correctCountEl) correctCountEl.textContent = '0';

            if (totalCountEl) totalCountEl.textContent = '0';

            if (resultProgress) resultProgress.style.width = '0%';

            

            // 타이머 시작

            const timerContainer = document.getElementById('timer-container');

            const timeEl = document.getElementById('time');

            const barEl = document.querySelector('#bar > div');

            

            gameState.total = (gameState.gameMode === CONSTANTS.MODES.HARD_CORE) ? CONSTANTS.HARD_CORE_DURATION : gameState.duration;

            timerContainer.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);

            comboCounter.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);

            forceQuitBtn.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);

            resetBtn.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);

            

            timeEl.textContent = formatTime(gameState.total);

            barEl.style.width = '100%';

            if (gameState.timerId === null) {

                gameState.timerId = setInterval(tick, 1000);

            }

            setCharacterState('idle');

            if (gameState.gameMode === CONSTANTS.MODES.HARD_CORE) {

                character.classList.add('devil-mode');

            }

            

            // 선택 화면 숨기고 퀴즈 화면 보여주기

            const selectionEl = document.getElementById('spelling-dataset-selection');

            const containerEl = document.getElementById('spelling-container');

            selectionEl.classList.add('hidden');

            containerEl.classList.remove('hidden');

            

            // 뒤로가기 버튼 이벤트 리스너 추가

            const backBtn = document.getElementById('spelling-back-btn');

            backBtn.addEventListener('click', () => {

                showSpellingDatasetSelection();

            });

            

            // 첫 번째 라운드 시작

            startNewSpellingRound();

        }



        // --- 초기 설정 ---

        function initializeApp() {

            gameState.selectedTopic = CONSTANTS.TOPICS.CURRICULUM;

            gameState.selectedSubject = CONSTANTS.SUBJECTS.MUSIC;

            // 주제별 시간 설정: 내체표, 역량, 영역 주제는 20분, 나머지는 40분
            if (gameState.selectedTopic === CONSTANTS.TOPICS.CURRICULUM ||
                gameState.selectedTopic === CONSTANTS.TOPICS.COMPETENCY ||
                gameState.selectedTopic === CONSTANTS.TOPICS.AREA) {
                gameState.duration = 1200; // 20분
            } else {
                gameState.duration = 2400; // 40분
            }

            resetGame(false); // Reset state without showing any modal

            adjustCreativeInputWidths();

            updateStartModalUI();

        }

        initializeApp();

        // 시작 모달 표시
        openModal(startModal);
        updateStartModalUI();
        fixSettingsPanelHeight();
        
        // 초기 모드 상태 설정 (Normal 모드 기본)
        timeSetterWrapper.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);
        document.getElementById('hard-core-description').classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);
        
        // 세그먼트 초기 상태 설정
        const modeBtnGroup = document.querySelector('.mode-btn-group');
        if (modeBtnGroup) {
            modeBtnGroup.setAttribute('data-selected', CONSTANTS.MODES.NORMAL);
        }

        // 도형 과목 전용 기능들은 다음 프레임에서 초기화 (성능 최적화)
        requestAnimationFrame(() => {
            initializeGeometryFeatures();
        });

        // 도형 과목 전용 기능 초기화
        function initializeGeometryFeatures() {
            // 도형 과목 input 요소들에 이벤트 리스너 추가
            const geometryMain = document.getElementById('geometry-quiz-main');
            if (geometryMain) {
                // # 표기가 있는 outline-title을 주제로 표시 (기존 사이트와 동일한 방식)
                geometryMain.querySelectorAll('.outline-title').forEach(title => {
                    if (title.textContent.trim().startsWith('#')) {
                        title.setAttribute('data-is-topic', 'true');
                    }
                });
            }
        }

    });




