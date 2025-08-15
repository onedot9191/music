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
                ENGLISH: 'english',
                ETHICS: 'ethics',
                PRACTICAL: 'practical',
                SOCIAL: 'social',
                SCIENCE: 'science',
                SCIENCE_STD: 'science-std',
                PRACTICAL_STD: 'practical-std',
                PE_BACK: 'pe-back',
                CREATIVE: 'creative',
                OVERVIEW: 'overview',
                INTEGRATED_COURSE: 'integrated-course',
                MORAL_COURSE: 'moral-course',
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
                ACHIEVEMENT: 'achievement'
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
                SHAKE: 'shake'
            },
            DEFAULT_DURATION: 900,
            HARD_CORE_DURATION: 60,
            HARD_CORE_TIME_BONUS: 5,
            RANDOM_ANIMATION_DURATION: 2000,
            RANDOM_ANIMATION_INTERVAL: 100
        };

        const SUBJECT_NAMES = {
            [CONSTANTS.SUBJECTS.MUSIC]: '음악',
            [CONSTANTS.SUBJECTS.ART]: '미술',
            [CONSTANTS.SUBJECTS.KOREAN]: '국어',
            [CONSTANTS.SUBJECTS.KOREAN_MODEL]: '국어',
            [CONSTANTS.SUBJECTS.LIFE]: '바른 생활',
            [CONSTANTS.SUBJECTS.WISE]: '슬기로운 생활',
            [CONSTANTS.SUBJECTS.JOY]: '즐거운 생활',
            [CONSTANTS.SUBJECTS.PE]: '체육',
            [CONSTANTS.SUBJECTS.PE_LITE]: '체육(lite)',
            [CONSTANTS.SUBJECTS.PE_MODEL]: '체육',
            [CONSTANTS.SUBJECTS.ENGLISH]: '영어',
            [CONSTANTS.SUBJECTS.ETHICS]: '도덕',
            [CONSTANTS.SUBJECTS.PRACTICAL]: '실과',
            [CONSTANTS.SUBJECTS.SOCIAL]: '사회',
            [CONSTANTS.SUBJECTS.SCIENCE]: '과학',
            [CONSTANTS.SUBJECTS.SCIENCE_STD]: '과학',
            [CONSTANTS.SUBJECTS.PRACTICAL_STD]: '실과',
            [CONSTANTS.SUBJECTS.PE_BACK]: '체육(뒷교)',
            [CONSTANTS.SUBJECTS.CREATIVE]: '창체',
            [CONSTANTS.SUBJECTS.OVERVIEW]: '총론',
            [CONSTANTS.SUBJECTS.INTEGRATED_COURSE]: '통합',
            [CONSTANTS.SUBJECTS.MORAL_COURSE]: '도덕',
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
            [CONSTANTS.TOPICS.ACHIEVEMENT]: '성취기준'
        };

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
            CONSTANTS.SUBJECTS.AREA
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
        
        // --- Audio ---
        const SFX_VOLUME = 0.2;

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

            let result = str
                .replace(/\([^)]*\)/g, '')
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
            document.querySelectorAll('#creative-quiz-main .creative-question input[data-answer], #overview-quiz-main .overview-question input[data-answer], #integrated-course-quiz-main .overview-question input[data-answer], #moral-course-quiz-main .overview-question input[data-answer], #science-std-quiz-main .overview-question input[data-answer], #practical-std-quiz-main .overview-question input[data-answer]')
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
            const topic = gameState.selectedTopic;

            if (
                topic === CONSTANTS.TOPICS.CURRICULUM ||
                topic === CONSTANTS.TOPICS.MODEL ||
                topic === CONSTANTS.TOPICS.COURSE ||
                topic === CONSTANTS.TOPICS.BASIC ||
                topic === CONSTANTS.TOPICS.ACHIEVEMENT
            ) {
                subjectSelector.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);
                subjectButtons.forEach(btn => {
                    const btnTopics = (btn.dataset.topic || '').split(' ');
                    const visible = btnTopics.includes(topic) || btnTopics.length === 0;
                    btn.classList.toggle(CONSTANTS.CSS_CLASSES.HIDDEN, !visible);
                    btn.disabled = false;
                });
                curriculumBreak.classList.toggle(CONSTANTS.CSS_CLASSES.HIDDEN, topic !== CONSTANTS.TOPICS.CURRICULUM);
            } else {
                subjectSelector.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);
                subjectButtons.forEach(btn => { btn.disabled = true; });
                curriculumBreak.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);
            }
            renderHeatmap(getDailyStats(30));
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
            
            progressModal.classList.add(CONSTANTS.CSS_CLASSES.ACTIVE);
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
            headerTitle.textContent = '아웃풋을 해보자';
            headerTitle.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);
            comboCounter.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);
            showAnswersBtn.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);
            showAnswersBtn.disabled = false;
            resetBtn.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);
            forceQuitBtn.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);
            document.getElementById('timer-container').classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);

            // Reset competency tab states
           document.querySelectorAll('.competency-tab.cleared')
               .forEach(tab => tab.classList.remove('cleared'));

           if (showStartModal) {
               startModal.classList.add(CONSTANTS.CSS_CLASSES.ACTIVE);
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
            startModal.classList.remove(CONSTANTS.CSS_CLASSES.ACTIVE);
            
            headerTitle.textContent =
                SUBJECT_NAMES[gameState.selectedSubject] || '퀴즈';
           const mainEl = document.getElementById(`${gameState.selectedSubject}-quiz-main`);
           mainEl.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);
           resetToFirstStage(gameState.selectedSubject);

           document.querySelectorAll(`#${gameState.selectedSubject}-quiz-main input[data-answer]`).forEach(i => i.disabled = false);
            if (
                gameState.selectedSubject === CONSTANTS.SUBJECTS.CREATIVE ||
                gameState.selectedSubject === CONSTANTS.SUBJECTS.OVERVIEW ||
                gameState.selectedSubject === CONSTANTS.SUBJECTS.INTEGRATED_COURSE ||
                                CONSTANTS.SUBJECTS.MORAL_COURSE ||
                gameState.selectedSubject === CONSTANTS.SUBJECTS.MORAL_COURSE ||
                gameState.selectedSubject === CONSTANTS.SUBJECTS.SCIENCE_STD ||
                gameState.selectedSubject === CONSTANTS.SUBJECTS.PRACTICAL_STD
            ) {
                adjustCreativeInputWidths();
            } else if (
                gameState.selectedSubject === CONSTANTS.SUBJECTS.ENGLISH &&
                gameState.selectedTopic === CONSTANTS.TOPICS.BASIC
            ) {
                adjustEnglishInputWidths();
            }
            adjustBasicTopicInputWidths();
            
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

        function isSectionComplete(sectionElement) {
            const inputs = sectionElement.querySelectorAll('input[data-answer]');
            return (
                inputs.length > 0 && [...inputs].every(input => input.disabled)
            );
        }

        function isQuizComplete() {
            const inputs = document.querySelectorAll(
                `#${gameState.selectedSubject}-quiz-main input[data-answer]`
            );
            return (
                inputs.length > 0 && [...inputs].every(input => input.disabled)
            );
        }

       function showStageClear() {
           playSound(clearAudio);
           stageClearModal.classList.add(CONSTANTS.CSS_CLASSES.ACTIVE);
           setCharacterState('cheer', 5000);

            if (gameState.timerId !== null) {
                clearInterval(gameState.timerId);
                gameState.timerId = null;
            }

            const duration = 1 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 201 };
            function randomInRange(min, max) { return Math.random() * (max - min) + min; }
            const interval = setInterval(() => {
                const timeLeft = animationEnd - Date.now();
                if (timeLeft <= 0) return clearInterval(interval);
                const particleCount = 50 * (timeLeft / duration);
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 250);

            setTimeout(() => {
                clearInterval(interval);
                stageClearModal.classList.remove(CONSTANTS.CSS_CLASSES.ACTIVE);
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
                    const sec = document.getElementById(id);
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
            const duration = 2000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 201 };
            function randomInRange(min, max) { return Math.random() * (max - min) + min; }
            const interval = setInterval(() => {
                const timeLeft = animationEnd - Date.now();
                if (timeLeft <= 0) return clearInterval(interval);
                const particleCount = 50 * (timeLeft / duration);
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 250);
            setTimeout(() => {
                clearInterval(interval);
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
                });
        }

        function handleInputChange(e) {
            const input = e.target;
            if (!input.matches('input[data-answer]') || input.disabled) return;

            const section = input.closest('section');
            const userAnswer = normalizeAnswer(input.value);

            let isCorrect = false;
            let displayAnswer = input.dataset.answer;

            if (SPECIAL_SUBJECTS.has(gameState.selectedSubject)) {
                if (!usedAnswersMap.has(section)) usedAnswersMap.set(section, new Set());
                const usedSet = usedAnswersMap.get(section);

                const answerMap = new Map();
                section.querySelectorAll('input[data-answer]').forEach(inp => {
                    const original = inp.dataset.answer.trim();
                    const normalized = normalizeAnswer(original);
                    answerMap.set(normalized, original);
                    const alias = normalized.replace(/역량$/, '');
                    if (alias !== normalized) {
                        answerMap.set(alias, original);
                    }
                });

                if (answerMap.has(userAnswer)) {
                    const canonical = answerMap.get(userAnswer);
                    const canonicalNorm = normalizeAnswer(canonical);
                    if (!usedSet.has(canonicalNorm)) {
                        isCorrect = true;
                        displayAnswer = canonical;
                        usedSet.add(canonicalNorm);
                    }
                }
            } else {
                const correctAnswer = normalizeAnswer(input.dataset.answer);
                if (userAnswer === correctAnswer) {
                    isCorrect = true;
                    displayAnswer = input.dataset.answer;
                }
            }

            let shouldAdvance = false;
            if (isCorrect) {
                playSound(successAudio);
                input.classList.remove(CONSTANTS.CSS_CLASSES.INCORRECT, CONSTANTS.CSS_CLASSES.RETRYING);
                input.classList.add(CONSTANTS.CSS_CLASSES.CORRECT);
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

                if (SPECIAL_SUBJECTS.has(gameState.selectedSubject)) {
                    input.classList.remove(CONSTANTS.CSS_CLASSES.RETRYING);
                    input.classList.add(CONSTANTS.CSS_CLASSES.INCORRECT);

                } else if (input.classList.contains(CONSTANTS.CSS_CLASSES.RETRYING)) {
                    input.classList.remove(CONSTANTS.CSS_CLASSES.RETRYING);
                    input.classList.add(CONSTANTS.CSS_CLASSES.INCORRECT);

                    input.value = input.dataset.answer;
                    input.disabled = true;
                    shouldAdvance = true;

                } else {
                    input.classList.add(CONSTANTS.CSS_CLASSES.RETRYING);
                    input.value = '';
                }
            }

            if (shouldAdvance && isSectionComplete(section)) {
                if (checkStageClear(section)) {
                    if (SPECIAL_SUBJECTS.has(gameState.selectedSubject)) {
                        setTimeout(() => celebrateCompetencySection(section), 300);
                    } else {
                        setTimeout(showStageClear, 300);
                    }
                } else {
                    setTimeout(() => {
                        advanceToNextStage(false);
                        if (gameState.total > 0 && gameState.timerId === null) {
                            gameState.timerId = setInterval(tick, 1000);
                        }
                    }, 300);
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

        // --- EVENT LISTENERS ---
        topicSelector.addEventListener('click', e => {
            if (!e.target.matches('.btn')) return;
            playSound(clickAudio);
            document.querySelectorAll('.topic-btn').forEach(b => b.classList.remove(CONSTANTS.CSS_CLASSES.SELECTED));
            e.target.classList.add(CONSTANTS.CSS_CLASSES.SELECTED);
            const topic = e.target.dataset.topic;
            gameState.selectedTopic = topic;
            if (
                topic === CONSTANTS.TOPICS.CURRICULUM ||
                topic === CONSTANTS.TOPICS.MODEL ||
                topic === CONSTANTS.TOPICS.COURSE ||
                topic === CONSTANTS.TOPICS.BASIC ||
                topic === CONSTANTS.TOPICS.ACHIEVEMENT
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
                    defaultSubject = CONSTANTS.SUBJECTS.SCIENCE_STD;
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
                if (main) {
                    const targetId = e.target.dataset.target;
                    main.querySelectorAll('section').forEach(sec => sec.classList.remove(CONSTANTS.CSS_CLASSES.ACTIVE));
                    const targetSection = main.querySelector(`#${targetId}`);
                    if (targetSection) {
                        targetSection.classList.add(CONSTANTS.CSS_CLASSES.ACTIVE);
                        focusFirstInput(targetSection);
                        if (
                            gameState.selectedSubject ===
                                CONSTANTS.SUBJECTS.CREATIVE ||
                            gameState.selectedSubject ===
                                CONSTANTS.SUBJECTS.OVERVIEW ||
                            gameState.selectedSubject ===
                                CONSTANTS.SUBJECTS.INTEGRATED_COURSE ||
                            gameState.selectedSubject ===
                                CONSTANTS.SUBJECTS.MORAL_COURSE ||
                            gameState.selectedSubject ===
                                CONSTANTS.SUBJECTS.SCIENCE_STD ||
                            gameState.selectedSubject ===
                                CONSTANTS.SUBJECTS.PRACTICAL_STD
                        ) {
                            adjustCreativeInputWidths();
                        }
                        if (targetId === 'activity-examples') {
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
                                    gameState.selectedSubject ===
                                        CONSTANTS.SUBJECTS.CREATIVE ||
                                    gameState.selectedSubject ===
                                        CONSTANTS.SUBJECTS.OVERVIEW ||
                                    gameState.selectedSubject ===
                                        CONSTANTS.SUBJECTS.INTEGRATED_COURSE ||
                                    gameState.selectedSubject ===
                                        CONSTANTS.SUBJECTS.MORAL_COURSE ||
                                    gameState.selectedSubject ===
                                        CONSTANTS.SUBJECTS.SCIENCE_STD ||
                                    gameState.selectedSubject ===
                                        CONSTANTS.SUBJECTS.PRACTICAL_STD
                                ) {
                                    adjustCreativeInputWidths();
                                }
                            }
                        }
                    }
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
                    const targetSection = document.getElementById(id);
                    if (targetSection) {
                        targetSection.classList.add(CONSTANTS.CSS_CLASSES.ACTIVE);
                    }
                });
                const firstSection = document.getElementById(sectionIds[0]);
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

        quizContainers.forEach(main => {
            main.addEventListener('change', handleInputChange);
            main.addEventListener('keydown', e => {
                if (e.key === 'Enter' && e.target.matches('input[data-answer]')) {
                    handleInputChange({ target: e.target });
                    if (e.target.classList.contains(CONSTANTS.CSS_CLASSES.CORRECT)) {
                        const inputs = Array.from(
                            main.querySelectorAll('input[data-answer]')
                        );
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
        });
        
        startGameBtn.addEventListener('click', startGame);
        resetBtn.addEventListener('click', () => resetGame(true));
        forceQuitBtn.addEventListener('click', () => { if(gameState.timerId) { gameState.total = 0; tick(); } });
        
        closeGuideBtn.addEventListener('click', () => {
            guideModal.classList.remove('active');
            startModal.classList.add('active');
            updateStartModalUI();
            fixSettingsPanelHeight();
        });

        closeProgressModalBtn.addEventListener('click', () => {
            progressModal.classList.remove('active');
            showAnswersBtn.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);
            resetBtn.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);
        });

        scrapResultImageBtn.addEventListener('click', () => {
            const modalContent = document.querySelector('#progress-modal .modal-content');
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
                });
        });

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
            if (SPECIAL_SUBJECTS.has(gameState.selectedSubject)) {
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
            showAnswersBtn.disabled = true;
            // 결과 창이 즉시 표시되지 않도록 진행 상태를 확인하지 않는다.
        });

        // --- INITIAL SETUP ---
        function initializeApp() {
            gameState.selectedTopic = CONSTANTS.TOPICS.CURRICULUM;
            gameState.selectedSubject = CONSTANTS.SUBJECTS.MUSIC;
            resetGame(false); // Reset state without showing any modal
            adjustCreativeInputWidths();
            updateStartModalUI();
            guideModal.classList.add('active'); // Always show guide on page load
        }

        initializeApp();
    });
