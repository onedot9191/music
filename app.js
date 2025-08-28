    document.addEventListener('DOMContentLoaded', () => {

        // --- AudioContext for Autoplay Policy ---
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        function unlockAudio() {
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            document.body.removeEventListener('click', unlockAudio);
            document.body.removeEventListener('touchend', unlockAudio);
        }
        document.body.addEventListener('click', unlockAudio);
        document.body.addEventListener('touchend', unlockAudio);


        // --- CONSTANTS ---
        const CONSTANTS = {
            SUBJECTS: {
                MUSIC: 'music',
                ART: 'art',
                KOREAN: 'korean',
                KOREAN_MODEL: 'korean-model',
                LIFE: 'life',
                WISE: 'wise',
                JOY: 'joy',
                PE: 'pe',
                PE_LITE: 'pe-lite',
                PE_MODEL: 'pe-model',
                INTEGRATED_MODEL: 'integrated-model',
                ART_MODEL: 'art-model',
                ART_BASIC: 'art-basic',
                ENGLISH: 'english',
                ETHICS: 'ethics',
                ETHICS_LITE: 'ethics-lite',
                PRACTICAL: 'practical',
                PRACTICAL_LITE: 'practical-lite',
                MATH_MODEL: 'math-model',
                SOCIAL: 'social',
                SCIENCE: 'science',
                SCIENCE_STD: 'science-std',
                PRACTICAL_STD: 'practical-std',
                MATH_OPERATION: 'math-operation',
                PE_BACK: 'pe-back',
                CREATIVE: 'creative',
                OVERVIEW: 'overview',
                INTEGRATED_COURSE: 'integrated-course',
                SOCIAL_COURSE: 'social-course',
                MATH_COURSE: 'math-course',
                SCIENCE_COURSE: 'science-course',
                MORAL_COURSE: 'moral-course',
                MORAL_PRINCIPLES: 'moral-principles',
                MUSIC_ELEMENTS: 'music-elements',
                PHYSICAL_ACTIVITY: 'physical-activity',
                COMPETENCY: 'competency',
                AREA: 'area',
                RANDOM: 'random'
            },
            TOPICS: {
                CURRICULUM: 'curriculum',
                COMPETENCY: 'competency',
                AREA: 'area',
                MODEL: 'model',
                COURSE: 'course',
                BASIC: 'basic',
                ACHIEVEMENT: 'achievement',
                MORAL: 'moral'
            },
            MODES: {
                NORMAL: 'normal',
                HARD_CORE: 'hard-core'
            },
            CSS_CLASSES: {
                HIDDEN: 'hidden',
                CORRECT: 'correct',
                INCORRECT: 'incorrect',
                RETRYING: 'retrying',
                REVEALED: 'revealed',
                SELECTED: 'selected',
                IS_SELECTING: 'is-selecting',
                ACTIVE: 'active',
                COMBO_POP: 'combo-pop',
                SHAKE: 'shake',
                CORRECT_PULSE: 'correct-pulse'
            },
            DEFAULT_DURATION: 900,
            HARD_CORE_DURATION: 60,
            HARD_CORE_TIME_BONUS: 5,
            RANDOM_ANIMATION_DURATION: 2000,
            RANDOM_ANIMATION_INTERVAL: 100,
            STAGE_CLEAR_DURATION: 300,
            NEXT_STAGE_DELAY: 550
        };

        const SUBJECT_NAMES = {
            [CONSTANTS.SUBJECTS.MUSIC]: '음악',
            [CONSTANTS.SUBJECTS.ART]: '미술',
            [CONSTANTS.SUBJECTS.KOREAN]: '국어',
            [CONSTANTS.SUBJECTS.KOREAN_MODEL]: '국어',
            [CONSTANTS.SUBJECTS.LIFE]: '바생',
            [CONSTANTS.SUBJECTS.WISE]: '슬생',
            [CONSTANTS.SUBJECTS.JOY]: '즐생',
            [CONSTANTS.SUBJECTS.PE]: '체육',
            [CONSTANTS.SUBJECTS.PE_LITE]: '체육(lite)',
            [CONSTANTS.SUBJECTS.PE_MODEL]: '체육',
            [CONSTANTS.SUBJECTS.INTEGRATED_MODEL]: '통합',
            [CONSTANTS.SUBJECTS.ART_MODEL]: '미술',
            [CONSTANTS.SUBJECTS.ART_BASIC]: '미술',
            [CONSTANTS.SUBJECTS.ENGLISH]: '영어',
            [CONSTANTS.SUBJECTS.ETHICS]: '도덕',
            [CONSTANTS.SUBJECTS.ETHICS_LITE]: '도덕(lite)',
            [CONSTANTS.SUBJECTS.PRACTICAL]: '실과',
            [CONSTANTS.SUBJECTS.PRACTICAL_LITE]: '실과(lite)',
            [CONSTANTS.SUBJECTS.MATH_MODEL]: '수학',
            [CONSTANTS.SUBJECTS.SOCIAL]: '사회',
            [CONSTANTS.SUBJECTS.SCIENCE]: '과학',
            [CONSTANTS.SUBJECTS.SCIENCE_STD]: '과학',
            [CONSTANTS.SUBJECTS.PRACTICAL_STD]: '실과',
            [CONSTANTS.SUBJECTS.MATH_OPERATION]: '수와 연산',
            [CONSTANTS.SUBJECTS.PE_BACK]: '체육(뒷교)',
            [CONSTANTS.SUBJECTS.CREATIVE]: '창체',
            [CONSTANTS.SUBJECTS.OVERVIEW]: '총론',
            [CONSTANTS.SUBJECTS.INTEGRATED_COURSE]: '통합',
            [CONSTANTS.SUBJECTS.SOCIAL_COURSE]: '사회',
            [CONSTANTS.SUBJECTS.MATH_COURSE]: '수학',
            [CONSTANTS.SUBJECTS.SCIENCE_COURSE]: '과학',
            [CONSTANTS.SUBJECTS.MORAL_COURSE]: '도덕',
            [CONSTANTS.SUBJECTS.MORAL_PRINCIPLES]: '원리와 방법',
            [CONSTANTS.SUBJECTS.MUSIC_ELEMENTS]: '음악요소',
            [CONSTANTS.SUBJECTS.PHYSICAL_ACTIVITY]: '신체활동 예시',
            [CONSTANTS.SUBJECTS.COMPETENCY]: '역량',
            [CONSTANTS.SUBJECTS.AREA]: '영역'
        };

        const TOPIC_NAMES = {
            [CONSTANTS.TOPICS.CURRICULUM]: '내체표',
            [CONSTANTS.TOPICS.COMPETENCY]: '역량',
            [CONSTANTS.TOPICS.AREA]: '영역',
            [CONSTANTS.TOPICS.MODEL]: '모형',
            [CONSTANTS.TOPICS.COURSE]: '교육과정',
            [CONSTANTS.TOPICS.BASIC]: '기본이론',
            [CONSTANTS.TOPICS.ACHIEVEMENT]: '성취기준',
            [CONSTANTS.TOPICS.MORAL]: '기타'
        };

        // --- Auto width for blanks (fit to answer length) ---
        // Measure text width using a canvas with the same font as the input element
        function measureTextWidthForElement(text, element) {
            const canvas = measureTextWidthForElement._canvas || (measureTextWidthForElement._canvas = document.createElement('canvas'));
            const context = canvas.getContext('2d');
            const cs = getComputedStyle(element);
            // Build a reasonable font shorthand for canvas
            const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
            context.font = font;
            const metrics = context.measureText(text || '');
            return metrics.width;
        }

        function getAnswerCandidates(input) {
            const answers = [];
            const dataAnswer = input.getAttribute('data-answer');
            if (dataAnswer) answers.push(dataAnswer.trim());
            const accept = input.getAttribute('data-accept') || input.getAttribute('data-alias') || input.getAttribute('data-aliases');
            if (accept) accept.split(',').forEach(s => { const t = s.trim(); if (t) answers.push(t); });
            return answers.length ? answers : [''];
        }

        function getLongestReferenceText(input) {
            const answers = getAnswerCandidates(input);
            return answers.reduce((longest, current) => current.length > longest.length ? current : longest, '');
        }

        function setInputWidthToText(input, text) {
            const cs = getComputedStyle(input);
            const padding = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
            const border = (parseFloat(cs.borderLeftWidth) || 0) + (parseFloat(cs.borderRightWidth) || 0);
            const extra = 16; // slightly more breathing room
            const textWidth = measureTextWidthForElement(text, input);
            const widthPx = Math.ceil(textWidth + padding + border + extra);
            input.style.width = `${widthPx}px`;
        }

        function applyAutoWidthForContainer(container) {
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

        function initAutoWidthCourse() {
            ['practical-quiz-main', 'overview-quiz-main', 'social-course-quiz-main', 'science-course-quiz-main'].forEach(id => {
                const container = document.getElementById(id);
                applyAutoWidthForContainer(container);
            });
        }

        // Defer until rendering is settled
        requestAnimationFrame(() => { initAutoWidthCourse(); });

        // --- GAME STATE ---
        const gameState = {
            duration: CONSTANTS.DEFAULT_DURATION,
            total: CONSTANTS.DEFAULT_DURATION,
            timerId: null,
            combo: 0,
            selectedSubject: CONSTANTS.SUBJECTS.MUSIC,
            selectedTopic: CONSTANTS.TOPICS.CURRICULUM,
            gameMode: CONSTANTS.MODES.NORMAL,
            isRandomizing: false,
            typingInterval: null
        };

        const SPECIAL_SUBJECTS = new Set([
            CONSTANTS.SUBJECTS.COMPETENCY,
            CONSTANTS.SUBJECTS.AREA,
            CONSTANTS.SUBJECTS.MORAL_PRINCIPLES
        ]);

        // Used to keep track of which answers have been matched in competency/area sections
        let usedAnswersMap = new WeakMap();

        // --- DOM Elements ---
        const timeEl = document.getElementById('time');
        const barEl = document.querySelector('#bar > div');
        const comboCounter = document.getElementById('combo-counter');
        const showAnswersBtn = document.getElementById('show-answers-btn');
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
        const guideModal = document.getElementById('guide-modal');
        const closeGuideBtn = document.getElementById('close-guide-btn');
        const settingsPanel = document.getElementById('settings-panel');
        const timeSettingDisplay = document.getElementById('time-setting-display');
        const decreaseTimeBtn = document.getElementById('decrease-time');
        const increaseTimeBtn = document.getElementById('increase-time');
        const timeSetterWrapper = document.getElementById('time-setter-wrapper');
        const topicSelector = document.querySelector('.topic-selector');
        const subjectSelector = document.querySelector('.subject-selector');
        const curriculumBreak = document.getElementById('curriculum-break');
        const modelBreak = document.getElementById('model-break');
        const quizContainers = document.querySelectorAll('main[id$="-quiz-main"]');
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

        // 초기 적용
        applyOverviewHierarchyIndentation();
        // 총론 내부 탭 클릭 시 재적용
        const overviewTabs = document.querySelector('#overview-quiz-main .tabs');
        if (overviewTabs) {
            overviewTabs.addEventListener('click', () => {
                requestAnimationFrame(applyOverviewHierarchyIndentation);
            });
        }

        // --- Modal focus helpers ---
        let lastFocusedElement = null;
        function focusModal(modalEl) {
            const content = modalEl.querySelector('.modal-content');
            if (!content) return;
            if (!content.hasAttribute('tabindex')) {
                content.setAttribute('tabindex', '-1');
            }
            content.focus({ preventScroll: true });
        }
        function openModal(modalEl) {
            lastFocusedElement = document.activeElement;
            modalEl.classList.add(CONSTANTS.CSS_CLASSES.ACTIVE);
            focusModal(modalEl);
        }
        function closeModal(modalEl) {
            modalEl.classList.remove(CONSTANTS.CSS_CLASSES.ACTIVE);
            if (lastFocusedElement && document.body.contains(lastFocusedElement)) {
                try { lastFocusedElement.focus({ preventScroll: true }); } catch (_) {}
            }
            lastFocusedElement = null;
        }

        // --- Audio ---
        const SFX_VOLUME = 0.1;

        const successAudio = new Audio('./success.mp3');
        successAudio.preload = 'auto';
        successAudio.volume = SFX_VOLUME;
        const timeupAudio = new Audio('./timeup.mp3');
        timeupAudio.preload = 'auto';
        timeupAudio.volume = SFX_VOLUME;
        const startAudio = new Audio('./start.mp3');
        startAudio.preload = 'auto';
        startAudio.volume = SFX_VOLUME;
        const failAudio = new Audio('./fail.mp3');
        failAudio.preload = 'auto';
        failAudio.volume = SFX_VOLUME;
        const clearAudio = new Audio('./clear.mp3');
        clearAudio.preload = 'auto';
        clearAudio.volume = SFX_VOLUME;
        const randomAudio = new Audio('./random.mp3');
        randomAudio.preload = 'auto';
        randomAudio.volume = SFX_VOLUME;
        const clickAudio = new Audio('./click.mp3');
        clickAudio.preload = 'auto';
        clickAudio.volume = SFX_VOLUME;
        const slotWinAudio = new Audio('./hit.mp3');
        slotWinAudio.preload = 'auto';
        slotWinAudio.volume = Math.min(1, SFX_VOLUME * 2);
        
        // --- UTILITY FUNCTIONS ---
        const fmt = n => String(n).padStart(2, '0');
        const formatTime = s => `${fmt(Math.floor(s / 60))}:${fmt(s % 60)}`;
        const formatDateKey = (date = new Date()) => {
            return [date.getFullYear(), fmt(date.getMonth() + 1), fmt(date.getDate())].join('-');
        };

        function resetUsedAnswers() {
            usedAnswersMap = new WeakMap();
        }

        function saveDailyStats(count) {
            const key = formatDateKey();
            const stats = JSON.parse(localStorage.getItem('dailyStats') || '{}');
            stats[key] = (stats[key] || 0) + count;
            localStorage.setItem('dailyStats', JSON.stringify(stats));
        }

        function getDailyStats(days = 30) {
            const stats = JSON.parse(localStorage.getItem('dailyStats') || '{}');
            const result = [];
            for (let i = days - 1; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const key = formatDateKey(d);
                result.push({ date: key, count: stats[key] || 0 });
            }
            return result;
        }

        function updateHeatmapTitle(stats) {
            const countEl = document.getElementById('heatmap-count');
            if (!countEl) return;
            const todayKey = formatDateKey();
            const today = stats.find(s => s.date === todayKey);
            const count = today ? today.count : 0;
            countEl.textContent = String(count);
        }

       function renderHeatmap(stats) {
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
            renderDDay();
        }

        // --- D-DAY ---
        let ddayRaceResizeObserver = null;
        function calculateDDayText(targetDate) {
            const msPerDay = 24 * 60 * 60 * 1000;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const target = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
            const diffDays = Math.floor((target - today) / msPerDay);
            if (diffDays === 0) return 'D-Day';
            if (diffDays > 0) return `D-${diffDays}`;
            return `D+${Math.abs(diffDays)}`;
        }

        function renderDDay() {
            const el = document.getElementById('dday');
            const race = document.getElementById('dday-race');
            if (!el) return;
            // 크기 변화에 반응하여 재계산하도록 관찰자 설정
            if (race && !race.dataset.observed) {
                try { if (ddayRaceResizeObserver) ddayRaceResizeObserver.disconnect(); } catch (_) {}
                try {
                    ddayRaceResizeObserver = new ResizeObserver(() => {
                        // 다음 프레임에서 안전하게 위치 재계산
                        requestAnimationFrame(() => renderDDay());
                    });
                    ddayRaceResizeObserver.observe(race);
                    race.dataset.observed = 'true';
                } catch (_) { /* ResizeObserver 미지원 시 무시 */ }
            }
            // 11월 8일 기준. 이미 지났다면 내년 11월 8일 기준
            const now = new Date();
            const year = now.getFullYear();
            let target = new Date(year, 10, 8); // 0-based: 10 => November
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (target < today) {
                target = new Date(year + 1, 10, 8);
            }

            // 텍스트 D-Day 표시
            // 상단 텍스트 제거 요청에 따라 숨김 처리
            const text = calculateDDayText(target);
            el.textContent = '';

            // 경주 트랙 업데이트 (D-100 기준 진행도)
            if (race) {
                const MS_PER_DAY = 24 * 60 * 60 * 1000;
                const start = new Date(target);
                start.setDate(start.getDate() - 100);
                const clamped = Math.max(0, Math.min(1, (today - start) / (100 * MS_PER_DAY)));

                // 아직 레이아웃이 잡히지 않아 너비가 0이면 다음 기회로 미룸(ResizeObserver가 재호출)
                if (race.clientWidth === 0) {
                    return;
                }

                // 최초 렌더 시 구조 구성
                if (!race.dataset.initialized) {
                    race.innerHTML = '';
                    // 중앙 주로 선 + 진행선
                    const line = document.createElement('div');
                    line.className = 'dday-line';
                    const progress = document.createElement('div');
                    progress.className = 'dday-progress';
                    // minimal ticks
                    const tick0 = document.createElement('div');
                    tick0.className = 'dday-tick';
                    tick0.style.left = '0';
                    const tick50 = document.createElement('div');
                    tick50.className = 'dday-tick';
                    tick50.style.left = 'calc(50% - 1px)';
                    const tick100 = document.createElement('div');
                    tick100.className = 'dday-tick';
                    tick100.style.right = '0';

                    const runner = document.createElement('div');
                    runner.className = 'dday-runner';
                    runner.style.transition = 'left 0.4s ease';
                    runner.setAttribute('aria-hidden', 'true');
                    // 픽셀 버섯 캔버스 (해상도 상승: 굵고 선명하게)
                    const canvas = document.createElement('canvas');
                    canvas.width = 20; // 논리 픽셀
                    canvas.height = 20;
                    const ctx = canvas.getContext('2d');
                    // 픽셀 아트 그리기 함수
                    const drawPixelMushroom = (c) => {
                        // clear
                        c.clearRect(0,0,20,20);
                        const fill = (x,y,w,h,color) => {
                            ctx.fillStyle = color; ctx.fillRect(x,y,w,h);
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
                    };
                    drawPixelMushroom(ctx);
                    runner.appendChild(canvas);

                    const finish = document.createElement('div');
                    finish.className = 'dday-finish-flag';

                    // 좌/우 라벨과 퍼센트 칩
                    const leftLabel = document.createElement('div');
                    leftLabel.className = 'dday-label left';
                    leftLabel.textContent = 'D-100';
                    const rightLabel = document.createElement('div');
                    rightLabel.className = 'dday-label right';
                    rightLabel.textContent = 'D-Day';
                    const ddayChip = document.createElement('div');
                    ddayChip.className = 'dday-chip';
                    ddayChip.textContent = text;

                    race.appendChild(line);
                    race.appendChild(progress);
                    race.appendChild(tick0);
                    race.appendChild(tick50);
                    race.appendChild(tick100);
                    race.appendChild(runner);
                    race.appendChild(finish);
                    race.appendChild(leftLabel);
                    race.appendChild(rightLabel);
                    race.appendChild(ddayChip);
                    race.dataset.initialized = 'true';
                }

                const runnerEl = race.querySelector('.dday-runner');
                const progressEl = race.querySelector('.dday-progress');
                const chipEl = race.querySelector('.dday-chip');
                const rightLabelEl = race.querySelector('.dday-label.right');
                const percent = clamped * 100;
                // 실제 트랙 너비 기준 픽셀 위치 계산
                const finishOffset = 0; // 끝까지 사용
                const range = Math.max(0, race.clientWidth - finishOffset);
                const pos = Math.round((percent / 100) * range);
                runnerEl.style.left = `${pos}px`;
                if (progressEl) progressEl.style.width = `${pos}px`;
                if (chipEl) {
                    // 칩 내용: D-Day 텍스트 유지
                    chipEl.textContent = text;
                    // 칩을 러너 위 중앙에 배치, 살짝 위로 스타일에서 올려둠
                    let chipX = pos; // 중앙 정렬(translateX(-50%)) 적용됨
                    chipEl.style.left = `${chipX}px`;
                }
                // D-Day 라벨은 CSS에서 right:0 고정, 줄바꿈 방지 처리
                race.setAttribute('aria-label', `디데이 경주 진행도 ${Math.round(percent)}%`);
            }
        }

        function playSound(audioElement) {
            if (!audioElement || typeof audioElement.play !== 'function') {
                console.error('Provided element is not a valid audio element.');
                return;
            }

            const play = () => {
                audioElement.currentTime = 0;
                audioElement.play().catch(err => {
                    console.error(`Audio playback failed for ${audioElement.src}:`, err);
                });
            };

            if (audioContext.state === 'suspended') {
                audioContext
                    .resume()
                    .then(play)
                    .catch(err => {
                        console.warn('Failed to resume AudioContext:', err);
                    });
            } else {
                play();
            }
        }

        function normalizeAnswer(str) {
            const ignoreParticleEui =
                gameState.selectedTopic === CONSTANTS.TOPICS.MODEL ||
                (
                    gameState.selectedTopic === CONSTANTS.TOPICS.CURRICULUM &&
                    (
                        gameState.selectedSubject === CONSTANTS.SUBJECTS.OVERVIEW ||
                        gameState.selectedSubject === CONSTANTS.SUBJECTS.CREATIVE
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

        // Respect reduced motion preference
        const PREFERS_REDUCED_MOTION =
            typeof window.matchMedia === 'function' &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Check if device is mobile (for disabling intensive effects)
        const IS_MOBILE = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
            window.innerWidth <= 768;

        // --- PARTICLE EFFECTS ---
        function spawnTypingParticles(element, color) {
            // Skip particles on mobile devices to improve performance
            if (IS_MOBILE || PREFERS_REDUCED_MOTION) {
                return;
            }

            const rect = element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            // Create 3-5 small particles
            const particleCount = 3 + Math.floor(Math.random() * 3);
            
            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'typing-particle';
                particle.style.backgroundColor = color;
                particle.style.left = centerX + 'px';
                particle.style.top = centerY + 'px';
                
                // Random movement variables
                const tx = (Math.random() - 0.5) * 100;
                const ty = (Math.random() - 0.5) * 100;
                particle.style.setProperty('--tx', tx + 'px');
                particle.style.setProperty('--ty', ty + 'px');
                
                document.body.appendChild(particle);
                
                // Remove after animation
                setTimeout(() => {
                    if (particle.parentNode) {
                        particle.parentNode.removeChild(particle);
                    }
                }, 450);
            }
        }

        function spawnComboConfetti(element) {
            // Skip confetti on mobile devices to improve performance
            if (IS_MOBILE || PREFERS_REDUCED_MOTION) {
                return;
            }

            const rect = element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            // Create small confetti pieces
            const confettiCount = 8 + Math.floor(Math.random() * 6);
            const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#ffeaa7', '#dda0dd', '#98d8c8'];
            
            for (let i = 0; i < confettiCount; i++) {
                const confetti = document.createElement('div');
                confetti.className = 'confetti-piece';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.left = centerX + 'px';
                confetti.style.top = centerY + 'px';
                
                // Random movement and rotation
                const dx = (Math.random() - 0.5) * 120;
                const dy = (Math.random() - 0.5) * 120 - 30; // bias upward
                const dr = (Math.random() - 0.5) * 720; // degrees
                confetti.style.setProperty('--dx', dx + 'px');
                confetti.style.setProperty('--dy', dy + 'px');
                confetti.style.setProperty('--dr', dr + 'deg');
                
                document.body.appendChild(confetti);
                
                // Remove after animation
                setTimeout(() => {
                    if (confetti.parentNode) {
                        confetti.parentNode.removeChild(confetti);
                    }
                }, 600);
            }
        }

        // --- UI UPDATE FUNCTIONS ---
        function updateTimeSettingDisplay() {
            timeSettingDisplay.textContent = formatTime(gameState.duration);
        }
        // --- SLOT MACHINE ---
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
                // Increase chance that the first two reels match
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
           document.querySelectorAll('#creative-quiz-main .creative-question input[data-answer], #overview-quiz-main .overview-question input[data-answer], #integrated-course-quiz-main .overview-question input[data-answer], #moral-course-quiz-main .overview-question input[data-answer], #science-std-quiz-main .overview-question input[data-answer], #practical-std-quiz-main .overview-question input[data-answer], #math-operation-quiz-main .overview-question input[data-answer], #math-course-quiz-main .overview-question input[data-answer], #science-course-quiz-main .overview-question input[data-answer]')
                .forEach(input => {
                    const answer = input.dataset.answer || '';
                    const answerLen = answer.length;
                    const hasHangul = /[\u3131-\uD79D]/.test(answer);
                    const factor = hasHangul ? 1.8 : 1.3;
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

       function adjustBasicTopicInputWidths() {
            if (gameState.selectedTopic !== CONSTANTS.TOPICS.BASIC) return;
            const mainId = `${gameState.selectedSubject}-quiz-main`;
            document
                .querySelectorAll(`#${mainId} input[data-answer]`)
                .forEach(input => {
                    const answer = input.dataset.answer || '';
                    const answerLen = answer.length;
                    const hasHangul = /[\u3131-\uD79D]/.test(answer);
                    const factor = hasHangul ? 1.8 : 1.3;
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
                settingsPanel.style.height = `${settingsPanel.offsetHeight}px`;
                settingsPanel.dataset.fixedHeight = 'true';
            }
       }

       function updateStartModalUI() {
            const subjectButtons = subjectSelector.querySelectorAll('.btn');
            const randomBtn = document.getElementById('random-subject-btn');
            const topic = gameState.selectedTopic;

            if (
                topic === CONSTANTS.TOPICS.CURRICULUM ||
                topic === CONSTANTS.TOPICS.MODEL ||
                topic === CONSTANTS.TOPICS.COURSE ||
                topic === CONSTANTS.TOPICS.BASIC ||
                topic === CONSTANTS.TOPICS.ACHIEVEMENT ||
                topic === CONSTANTS.TOPICS.MORAL
            ) {
                subjectSelector.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);
                subjectButtons.forEach(btn => {
                    const btnTopics = (btn.dataset.topic || '').split(' ');
                    const visible = btnTopics.includes(topic) || btnTopics.length === 0;
                    btn.classList.toggle(CONSTANTS.CSS_CLASSES.HIDDEN, !visible);
                    btn.disabled = false;
                });
                
                // '기타' 주제일 때 랜덤 버튼 숨기기
                if (topic === CONSTANTS.TOPICS.MORAL) {
                    randomBtn.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);
                } else {
                    randomBtn.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);
                }
                
                curriculumBreak.classList.toggle(CONSTANTS.CSS_CLASSES.HIDDEN, topic !== CONSTANTS.TOPICS.CURRICULUM);
                if (modelBreak) modelBreak.classList.toggle(CONSTANTS.CSS_CLASSES.HIDDEN, topic !== CONSTANTS.TOPICS.MODEL);
                // show grouped subject button segments only for model topic
                document.querySelectorAll('.subject-btn-group').forEach(g => {
                    g.classList.toggle(CONSTANTS.CSS_CLASSES.HIDDEN, topic !== CONSTANTS.TOPICS.MODEL);
                });
            } else {
                subjectSelector.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);
                subjectButtons.forEach(btn => { btn.disabled = true; });
                curriculumBreak.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);
                if (modelBreak) modelBreak.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);
                document.querySelectorAll('.subject-btn-group').forEach(g => g.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN));
            }
            const stats = getDailyStats(30);
            renderHeatmap(stats);
            updateHeatmapTitle(stats);
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
            const main = document.getElementById(`${gameState.selectedSubject}-quiz-main`);
            if (!main) return;
            const tabs = Array.from(main.querySelector('.tabs').querySelectorAll('.tab'));
            const currentIndex = tabs.findIndex(t =>
                t.classList.contains(CONSTANTS.CSS_CLASSES.ACTIVE)
            );
            if (currentIndex === -1) return;
            const nextIndex = currentIndex + 1;

            // If there is no next stage, keep the current one active
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
            const allInputs = document.querySelectorAll(`#${gameState.selectedSubject}-quiz-main input[data-answer]`);
            const correctCount = document.querySelectorAll(`#${gameState.selectedSubject}-quiz-main input.${CONSTANTS.CSS_CLASSES.CORRECT}`).length;
            const totalCount = allInputs.length;
            const percentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

            saveDailyStats(correctCount);
            // 히트맵 제목(오늘 푼 빈칸 수) 즉시 갱신
            updateHeatmapTitle(getDailyStats(30));

            document.getElementById('correct-count').textContent = correctCount;
            document.getElementById('total-count').textContent = totalCount;
            resultProgress.style.width = `${percentage}%`;
            resultPercentage.textContent = `${percentage}%`;

            resultSubject.textContent = SUBJECT_NAMES[gameState.selectedSubject] || '';
            resultTopic.textContent = TOPIC_NAMES[gameState.selectedTopic] || '';
            
            let feedback;
            if (percentage === 100) {
                feedback = { title: "신의 경지", dialogue: "완벽해! 당신은 이 게임의 신이야!", animation: "cheer", effect: "perfect" };
            } else if (percentage >= 90) {
                feedback = { title: "아웃풋 마스터", dialogue: "대단한 실력인데? 거의 마스터 수준이야!", animation: "happy", effect: "excellent" };
            } else if (percentage >= 70) {
                feedback = { title: "아웃풋 고수", dialogue: "꽤 하는걸? 이 감각, 잊지 말라구!", animation: "idle", effect: "great" };
            } else if (percentage >= 50) {
                feedback = { title: "아웃풋 중수", dialogue: "절반은 넘었네! 다음엔 더 잘할 수 있겠어.", animation: "idle", effect: "good" };
            } else if (percentage >= 20) {
                feedback = { title: "아웃풋 하수", dialogue: "으... 너무 어려웠어. 다시 해볼까?", animation: "sad", effect: "notbad" };
            } else {
                feedback = { title: "아웃풋 입문자", dialogue: "털썩... (아무 말도 하지 못했다)", animation: "sad", effect: "tryagain" };
            }

            resultTitle.textContent = feedback.title;
            
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

        // --- GAME LOGIC FUNCTIONS ---
        function handleGameOver() {
            clearInterval(gameState.timerId);
            gameState.timerId = null;
            document.querySelectorAll(`#${gameState.selectedSubject}-quiz-main input[data-answer]`).forEach(i => i.disabled = true);
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
            
            quizContainers.forEach(main => main.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN));
            document.querySelectorAll('input[data-answer]').forEach(i => {
                i.disabled = true;
                i.value = '';
                i.className = '';
            });
            resetUsedAnswers();
            
            gameState.combo = 0;
            updateMushroomGrowth();
            headerTitle.textContent = '아웃풋';
            headerTitle.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);
            comboCounter.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);
            showAnswersBtn.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);
            showAnswersBtn.disabled = false;
            scrapResultImageBtnTop.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);
            resetBtn.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);
            forceQuitBtn.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);
            document.getElementById('timer-container').classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);

            // Reset competency tab states
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
            playSound(startAudio);
            closeModal(startModal);
            
            headerTitle.textContent =
                SUBJECT_NAMES[gameState.selectedSubject] || '퀴즈';
           
           // Determine the correct main element based on topic and subject
           let mainId;
           if (gameState.selectedTopic === CONSTANTS.TOPICS.BASIC) {
               if (gameState.selectedSubject === CONSTANTS.SUBJECTS.MUSIC) {
                   mainId = 'music-basic-quiz-main';
               } else if (gameState.selectedSubject === CONSTANTS.SUBJECTS.ENGLISH) {
                   mainId = 'english-quiz-main';
               } else if (gameState.selectedSubject === CONSTANTS.SUBJECTS.ART_BASIC) {
                   mainId = 'art-basic-quiz-main';
               } else {
                   mainId = `${gameState.selectedSubject}-quiz-main`;
               }
           } else {
               mainId = `${gameState.selectedSubject}-quiz-main`;
           }
           
           const mainEl = document.getElementById(mainId);
           mainEl.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);
           resetToFirstStage(gameState.selectedSubject);

           document.querySelectorAll(`#${mainId} input[data-answer]`).forEach(i => i.disabled = false);
           if (mainEl) delete mainEl.dataset.answersRevealed;
            if (
                gameState.selectedSubject === CONSTANTS.SUBJECTS.CREATIVE ||
                gameState.selectedSubject === CONSTANTS.SUBJECTS.OVERVIEW ||
                gameState.selectedSubject === CONSTANTS.SUBJECTS.INTEGRATED_COURSE ||
                gameState.selectedSubject === CONSTANTS.SUBJECTS.SOCIAL_COURSE ||
                gameState.selectedSubject === CONSTANTS.SUBJECTS.MATH_COURSE ||
                gameState.selectedSubject === CONSTANTS.SUBJECTS.MORAL_COURSE ||
                gameState.selectedSubject === CONSTANTS.SUBJECTS.SCIENCE_STD ||
                gameState.selectedSubject === CONSTANTS.SUBJECTS.PRACTICAL_STD ||
                gameState.selectedSubject === CONSTANTS.SUBJECTS.MATH_OPERATION
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
                    { subject: CONSTANTS.SUBJECTS.SCIENCE, mainId: 'science-quiz-main', titleId: 'science-title' }
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

           const activeSection = document.querySelector(`#${gameState.selectedSubject}-quiz-main section.active`);
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

        function isQuizComplete() {
            const main = document.getElementById(`${gameState.selectedSubject}-quiz-main`);
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
                function randomInRange(min, max) { return Math.random() * (max - min) + min; }
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
            const main = document.getElementById(`${gameState.selectedSubject}-quiz-main`);
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
                function randomInRange(min, max) { return Math.random() * (max - min) + min; }
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

        function revealCompetencyAnswers() {
            const normalize = str => normalizeAnswer(str);
            document
                .querySelectorAll(`#${gameState.selectedSubject}-quiz-main section`)
                .forEach(section => {
                    const groups = section.querySelectorAll('[data-group]');
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
                        const inputs = section.querySelectorAll('input[data-answer]');
                        const usedSet = usedAnswersMap.get(section) || new Set();
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
                    }
                });
        }

        function handleInputChange(e) {
            const input = e.target;
            if (!input.matches('input[data-answer]') || input.disabled) return;

            const section = input.closest('section');
            const userAnswer = normalizeAnswer(input.value);
            const stripModelWord = (str) => str.replace(/모형/g, '').replace(/\s+/g, ' ').trim();

            let isCorrect = false;
            let displayAnswer = input.dataset.answer;

            if (
                SPECIAL_SUBJECTS.has(gameState.selectedSubject) ||
                isIntegratedTitle(input) ||
                isPracticalTitle(input) ||
                isGenericModelTitle(input)
            ) {
                const group = input.closest('[data-group]') || section;
                const ignoreOrder = group.hasAttribute('data-ignore-order');
                
                if (!usedAnswersMap.has(group)) usedAnswersMap.set(group, new Set());
                const usedSet = usedAnswersMap.get(group);

                const answerMap = new Map();
                group.querySelectorAll('input[data-answer]').forEach(inp => {
                    const original = inp.dataset.answer.trim();
                    const normalized = normalizeAnswer(original);
                    answerMap.set(normalized, original);
                    const alias = normalized.replace(/역량$/, '');
                    if (alias !== normalized) {
                        answerMap.set(alias, original);
                    }
                    if (gameState.selectedTopic === CONSTANTS.TOPICS.MODEL) {
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
                const correctAnswer = normalizeAnswer(input.dataset.answer);
                
                // '기타' 주제 '음악요소'의 경우 괄호 내용까지 정확히 입력해야 함
                if (gameState.selectedTopic === CONSTANTS.TOPICS.MORAL && 
                    gameState.selectedSubject === CONSTANTS.SUBJECTS.MUSIC_ELEMENTS) {
                    // 괄호 내용까지 정확히 입력해야 정답으로 처리
                    if (userAnswer === correctAnswer) {
                        isCorrect = true;
                        displayAnswer = input.dataset.answer;
                    }
                } else if (userAnswer === correctAnswer) {
                    isCorrect = true;
                    displayAnswer = input.dataset.answer;
                } else if (gameState.selectedTopic === CONSTANTS.TOPICS.MODEL) {
                    const userNoModel = stripModelWord(userAnswer);
                    const correctNoModel = stripModelWord(correctAnswer);
                    if (
                        userAnswer === correctNoModel ||
                        userNoModel === correctAnswer ||
                        userNoModel === correctNoModel
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
                    } else if (isInCourseOverview(input) || isInCourseCreative(input) || isInCourseSocial(input) || isInCourseScience(input)) {
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
                [CONSTANTS.SUBJECTS.SCIENCE]: { mainId: 'science-quiz-main', titleId: 'science-title' }
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
            input.value = input.dataset.answer;
            input.disabled = true;

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

        // --- EVENT LISTENERS ---
        document.querySelector('.topic-selector').addEventListener('click', e => {
            if (!e.target.matches('.btn')) return;
            playSound(clickAudio);
            document.querySelectorAll('.topic-btn').forEach(b => b.classList.remove(CONSTANTS.CSS_CLASSES.SELECTED));
            e.target.classList.add(CONSTANTS.CSS_CLASSES.SELECTED);
            const topic = e.target.dataset.topic;
            gameState.selectedTopic = topic;
            
            // 기본이론 주제 선택 시 특별한 시각적 효과 적용
            if (topic === CONSTANTS.TOPICS.BASIC) {
                document.querySelectorAll('.subject-btn').forEach(btn => {
                    if (btn.dataset.topic === 'basic') {
                        btn.classList.add('basic-topic-highlight');
                    } else {
                        btn.classList.remove('basic-topic-highlight');
                    }
                });
            } else {
                document.querySelectorAll('.subject-btn').forEach(btn => {
                    btn.classList.remove('basic-topic-highlight');
                });
            }
            
            if (
                topic === CONSTANTS.TOPICS.CURRICULUM ||
                topic === CONSTANTS.TOPICS.MODEL ||
                topic === CONSTANTS.TOPICS.COURSE ||
                topic === CONSTANTS.TOPICS.BASIC ||
                topic === CONSTANTS.TOPICS.ACHIEVEMENT ||
                topic === CONSTANTS.TOPICS.MORAL
            ) {
                subjectSelector.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);
                document.querySelectorAll('.subject-btn').forEach(b => b.classList.remove(CONSTANTS.CSS_CLASSES.SELECTED));
                let defaultSubject;
                if (topic === CONSTANTS.TOPICS.MODEL) {
                    defaultSubject = CONSTANTS.SUBJECTS.ETHICS;
                } else if (topic === CONSTANTS.TOPICS.COURSE) {
                    defaultSubject = CONSTANTS.SUBJECTS.PE_BACK;
                } else if (topic === CONSTANTS.TOPICS.BASIC) {
                    defaultSubject = CONSTANTS.SUBJECTS.ENGLISH;
                } else if (topic === CONSTANTS.TOPICS.ACHIEVEMENT) {
                    defaultSubject = CONSTANTS.SUBJECTS.MATH_OPERATION;
                } else if (topic === CONSTANTS.TOPICS.MORAL) {
                    defaultSubject = CONSTANTS.SUBJECTS.MORAL_PRINCIPLES;
                } else {
                    defaultSubject = CONSTANTS.SUBJECTS.MUSIC;
                }
                const defaultBtn = document.querySelector(`.subject-btn[data-subject="${defaultSubject}"]`);
                if (defaultBtn) defaultBtn.classList.add(CONSTANTS.CSS_CLASSES.SELECTED);
                gameState.selectedSubject = defaultSubject;
            } else {
                subjectSelector.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);
                document.querySelectorAll('.subject-btn').forEach(b => b.classList.remove(CONSTANTS.CSS_CLASSES.SELECTED));
                gameState.selectedSubject = topic === CONSTANTS.TOPICS.COMPETENCY
                    ? CONSTANTS.SUBJECTS.COMPETENCY
                    : CONSTANTS.SUBJECTS.AREA;
            }
            updateStartModalUI();
        });

        subjectSelector.addEventListener('click', e => {
            if (!e.target.matches('.btn') || gameState.isRandomizing) return;

            const clickedBtn = e.target;
            const subject = clickedBtn.dataset.subject;
            
            if (subject !== CONSTANTS.SUBJECTS.RANDOM) {
                 playSound(clickAudio);
            }

            if (subject === CONSTANTS.SUBJECTS.RANDOM) {
                gameState.isRandomizing = true;
                const subjectBtns = Array.from(document.querySelectorAll('.subject-btn:not([data-subject="random"]):not(.hidden)'));
                const allSelectorBtns = document.querySelectorAll('.subject-selector .btn');
                
                allSelectorBtns.forEach(b => b.disabled = true);
                subjectBtns.forEach(b => b.classList.remove(CONSTANTS.CSS_CLASSES.SELECTED));

                randomAudio.loop = true;
                playSound(randomAudio);

                let shuffleCount = 0;
                const maxShuffles = CONSTANTS.RANDOM_ANIMATION_DURATION / CONSTANTS.RANDOM_ANIMATION_INTERVAL;

                const randomInterval = setInterval(() => {
                    shuffleCount++;
                    subjectBtns.forEach(b => b.classList.remove(CONSTANTS.CSS_CLASSES.IS_SELECTING));

                    if (shuffleCount >= maxShuffles) {
                        clearInterval(randomInterval);
                        randomAudio.pause();
                        randomAudio.currentTime = 0;
                        randomAudio.loop = false;

                        const randomIndex = Math.floor(Math.random() * subjectBtns.length);
                        const chosenBtn = subjectBtns[randomIndex];
                        
                        chosenBtn.classList.add(CONSTANTS.CSS_CLASSES.SELECTED);
                        gameState.selectedSubject = chosenBtn.dataset.subject;
                        
                        allSelectorBtns.forEach(b => b.disabled = false);
                        gameState.isRandomizing = false;
                        return;
                    }
                    
                    const currentIndex = shuffleCount % subjectBtns.length;
                    subjectBtns[currentIndex].classList.add(CONSTANTS.CSS_CLASSES.IS_SELECTING);
                }, CONSTANTS.RANDOM_ANIMATION_INTERVAL);
            } else {
                document.querySelectorAll('.subject-btn').forEach(b => b.classList.remove(CONSTANTS.CSS_CLASSES.SELECTED));
                clickedBtn.classList.add(CONSTANTS.CSS_CLASSES.SELECTED);
                gameState.selectedSubject = subject;
            }
        });

        document.querySelector('.mode-selector').addEventListener('click', e => {
            if (!e.target.matches('.btn')) return;
            playSound(clickAudio);
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove(CONSTANTS.CSS_CLASSES.SELECTED));
            e.target.classList.add(CONSTANTS.CSS_CLASSES.SELECTED);
            gameState.gameMode = e.target.dataset.mode;
            timeSetterWrapper.style.display = gameState.gameMode === CONSTANTS.MODES.NORMAL ? 'block' : 'none';
            document.getElementById('hard-core-description').classList.toggle(CONSTANTS.CSS_CLASSES.HIDDEN, gameState.gameMode !== CONSTANTS.MODES.HARD_CORE);
        });

        // Handle section switching for subject tabs (music, art, korean)
        document.querySelectorAll('.tabs').forEach(tabsContainer => {
            if (tabsContainer.classList.contains('competency-tabs') || tabsContainer.classList.contains('sub-tabs')) return;
            tabsContainer.addEventListener('click', e => {
                if (!e.target.classList.contains('tab')) return;
                playSound(clickAudio);
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
                    { mainId: 'science-quiz-main', titleId: 'science-title' }
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
                                    inp.disabled = shouldGate;
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
                    gameState.selectedSubject === CONSTANTS.SUBJECTS.MORAL_COURSE ||
                    gameState.selectedSubject === CONSTANTS.SUBJECTS.SCIENCE_STD ||
                    gameState.selectedSubject === CONSTANTS.SUBJECTS.PRACTICAL_STD ||
                    gameState.selectedSubject === CONSTANTS.SUBJECTS.MATH_OPERATION
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
                            gameState.selectedSubject === CONSTANTS.SUBJECTS.MORAL_COURSE ||
                            gameState.selectedSubject === CONSTANTS.SUBJECTS.SCIENCE_STD ||
                            gameState.selectedSubject === CONSTANTS.SUBJECTS.PRACTICAL_STD ||
                            gameState.selectedSubject === CONSTANTS.SUBJECTS.MATH_OPERATION
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
                                    inp.disabled = shouldGate;
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
                playSound(clickAudio);
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
                            gameState.selectedSubject === CONSTANTS.SUBJECTS.MORAL_COURSE ||
                            gameState.selectedSubject === CONSTANTS.SUBJECTS.SCIENCE_STD ||
                            gameState.selectedSubject === CONSTANTS.SUBJECTS.PRACTICAL_STD
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
                playSound(clickAudio);
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
            root.addEventListener('change', handleInputChange);
            root.addEventListener('keydown', e => {
                if (e.key === 'Enter' && e.target.matches('input[data-answer]')) {
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

        // 무음 파티클 유틸: 입력 주위로 작은 점들을 흩뿌려 시각적 만족감 강화
        function spawnTypingParticles(inputEl, color) {
            try {
                const rect = inputEl.getBoundingClientRect();
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

        // 콤보 보상: 5연속마다 미니 컨페티 (네온/화이트 톤, 무음, 그라디언트 없음)
        function spawnComboConfetti(inputEl, colors = ['#39ff14', '#00ffff', '#ffffff']) {
            try {
                const rect = inputEl.getBoundingClientRect();
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

        quizContainers.forEach(main => attachInputHandlers(main));

        // modal removed; no extra handlers
        
        startGameBtn.addEventListener('click', startGame);
        resetBtn.addEventListener('click', () => resetGame(true));
        forceQuitBtn.addEventListener('click', () => { if(gameState.timerId) { gameState.total = 0; tick(); } });
        
        closeGuideBtn.addEventListener('click', () => {
            closeModal(guideModal);
            openModal(startModal);
            updateStartModalUI();
            fixSettingsPanelHeight();
        });

        closeProgressModalBtn.addEventListener('click', () => {
            closeModal(progressModal);
            showAnswersBtn.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);
            scrapResultImageBtnTop.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);
            resetBtn.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);
        });

        const handleScrapResultImage = () => {
            const modalContent = document.querySelector('#progress-modal .modal-content');
            const wasHidden = !progressModal.classList.contains(CONSTANTS.CSS_CLASSES.ACTIVE);
            if (wasHidden) {
                openModal(progressModal);
            }
            html2canvas(modalContent)
                .then(async canvas => {
                    if (navigator.clipboard && navigator.clipboard.write && window.ClipboardItem) {
                        try {
                            const dataUrl = canvas.toDataURL('image/png');
                            const blob = await (await fetch(dataUrl)).blob();
                            await navigator.clipboard.write([
                                new ClipboardItem({ [blob.type]: blob })
                            ]);
                            alert('결과 이미지가 복사되었습니다!');
                        } catch (err) {
                            alert('이미지 복사에 실패했습니다.');
                        }
                    } else {
                        const dataUrl = canvas.toDataURL('image/png');
                        const hiddenDiv = document.createElement('div');
                        hiddenDiv.contentEditable = true;
                        hiddenDiv.style.position = 'fixed';
                        hiddenDiv.style.top = '-10000px';
                        const img = document.createElement('img');
                        img.src = dataUrl;
                        hiddenDiv.appendChild(img);
                        document.body.appendChild(hiddenDiv);

                        const range = document.createRange();
                        range.selectNode(img);
                        const selection = window.getSelection();
                        selection.removeAllRanges();
                        selection.addRange(range);

                        let success = false;
                        try {
                            success = document.execCommand('copy');
                        } catch (err) {
                            success = false;
                        }

                        document.body.removeChild(hiddenDiv);
                        selection.removeAllRanges();

                        if (success) {
                            alert('결과 이미지가 복사되었습니다!');
                        } else {
                            alert('이미지 복사에 실패했습니다.');
                        }
                    }
                })
                .catch(() => {
                    alert('이미지 캡처에 실패했습니다.');
                })
                .finally(() => {
                    if (wasHidden) {
                        closeModal(progressModal);
                    }
                });
        };

        [scrapResultImageBtn, scrapResultImageBtnTop].forEach(btn =>
            btn.addEventListener('click', handleScrapResultImage)
        );

        decreaseTimeBtn.addEventListener('click', () => {
            playSound(clickAudio);
            if (gameState.duration > 60) {
                gameState.duration -= 60;
                updateTimeSettingDisplay();
            }
        });

        increaseTimeBtn.addEventListener('click', () => {
            playSound(clickAudio);
            if (gameState.duration < 1800) { // Max 30 mins
                gameState.duration += 60;
                updateTimeSettingDisplay();
            }
        });

        showAnswersBtn.addEventListener('click', () => {
            if (
                SPECIAL_SUBJECTS.has(gameState.selectedSubject) ||
                (gameState.selectedTopic === CONSTANTS.TOPICS.MODEL && gameState.selectedSubject === CONSTANTS.SUBJECTS.INTEGRATED_MODEL)
            ) {
                revealCompetencyAnswers();
            } else {
                document
                    .querySelectorAll(`#${gameState.selectedSubject}-quiz-main input[data-answer]`)
                    .forEach(input => {
                        if (!input.classList.contains(CONSTANTS.CSS_CLASSES.CORRECT)) {
                            input.value = input.dataset.answer;
                            input.classList.remove(
                                CONSTANTS.CSS_CLASSES.INCORRECT,
                                CONSTANTS.CSS_CLASSES.RETRYING
                            );
                            input.classList.add(CONSTANTS.CSS_CLASSES.REVEALED);
                        }
                        input.disabled = true;
                    });
            }
            const main = document.getElementById(`${gameState.selectedSubject}-quiz-main`);
            if (main) main.dataset.answersRevealed = 'true';
            showAnswersBtn.disabled = true;
            // 결과 창이 즉시 표시되지 않도록 진행 상태를 확인하지 않는다.
        });

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
                { mainId: 'science-quiz-main', titleId: 'science-title', btnId: 'science-title-next-btn' }
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

        // --- INITIAL SETUP ---
        function initializeApp() {
            gameState.selectedTopic = CONSTANTS.TOPICS.CURRICULUM;
            gameState.selectedSubject = CONSTANTS.SUBJECTS.MUSIC;
            resetGame(false); // Reset state without showing any modal
            adjustCreativeInputWidths();
            updateStartModalUI();
            openModal(guideModal); // Always show guide on page load
        }

        initializeApp();
    });

