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
                LIFE: 'life',
                WISE: 'wise',
                JOY: 'joy',
                PE: 'pe',
                ETHICS: 'ethics',
                PRACTICAL: 'practical',
                SOCIAL: 'social',
                COMPETENCY: "competency",
                RANDOM: 'random'
            },
            TOPICS: {
                CURRICULUM: 'curriculum',
                COMPETENCY: 'competency',
                MODEL: 'model'
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
                LOST: 'lost',
                COMBO_POP: 'combo-pop'
            },
            DEFAULT_DURATION: 600,
            HARD_CORE_DURATION: 30, 
            HARD_CORE_LIVES: 3,
            HARD_CORE_TIME_BONUS: 3,
            RANDOM_ANIMATION_DURATION: 2000,
            RANDOM_ANIMATION_INTERVAL: 100
        };

        // --- GAME STATE ---
        const gameState = {
            duration: CONSTANTS.DEFAULT_DURATION,
            total: CONSTANTS.DEFAULT_DURATION,
            timerId: null,
            combo: 0,
            lives: CONSTANTS.HARD_CORE_LIVES,
            selectedSubject: CONSTANTS.SUBJECTS.MUSIC,
            selectedTopic: CONSTANTS.TOPICS.CURRICULUM,
            gameMode: CONSTANTS.MODES.NORMAL,
            isRandomizing: false,
            typingInterval: null
        };

        // Used to keep track of which answers have been matched in competency sections
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
        const livesContainer = document.getElementById('lives-container');
        const stageClearModal = document.getElementById('stage-clear-modal');
        const progressModal = document.getElementById('progress-modal');
        const closeProgressModalBtn = document.getElementById('close-progress-modal-btn');
        const startModal = document.getElementById('start-modal');
        const guideModal = document.getElementById('guide-modal');
        const closeGuideBtn = document.getElementById('close-guide-btn');
        const timeSettingDisplay = document.getElementById('time-setting-display');
        const decreaseTimeBtn = document.getElementById('decrease-time');
        const increaseTimeBtn = document.getElementById('increase-time');
        const timeSetterWrapper = document.getElementById('time-setter-wrapper');
        const topicSelector = document.querySelector('.topic-selector');
        const subjectSelector = document.querySelector('.subject-selector');
        const quizContainers = document.querySelectorAll('main[id$="-quiz-main"]');
        const modalCharacterPlaceholder = document.getElementById('modal-character-placeholder');
        const speechBubble = document.querySelector('.speech-bubble');
        const resultDialogue = document.getElementById('result-dialogue');
        const resultTitle = document.getElementById('result-title');
        
        // --- Audio ---
        const SFX_VOLUME = 0.4;

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
        
        // --- UTILITY FUNCTIONS ---
        const fmt = n => String(n).padStart(2, '0');
        const formatTime = s => `${fmt(Math.floor(s / 60))}:${fmt(s % 60)}`;

        function resetUsedAnswers() {
            usedAnswersMap = new WeakMap();
        }

        function playSound(audioElement) {
            if (audioContext.state === 'running' && audioElement && typeof audioElement.play === 'function') {
                audioElement.currentTime = 0;
                audioElement.play().catch(err => {
                    console.error(`Audio playback failed for ${audioElement.src}:`, err);
                });
            } else if (audioElement && typeof audioElement.play !== 'function') {
                 console.error("Provided element is not a valid audio element.");
            }
        }

        function typewriter(element, text) {
            if (gameState.typingInterval) {
                clearInterval(gameState.typingInterval);
            }
            element.textContent = '';
            let i = 0;
            gameState.typingInterval = setInterval(() => {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
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

        function updateLivesUI() {
            const heartIcons = livesContainer.querySelectorAll('.heart-icon');
            heartIcons.forEach((heart, index) => {
                heart.classList.toggle(CONSTANTS.CSS_CLASSES.LOST, index >= gameState.lives);
            });
        }

        function focusFirstInput(container) {
            const firstInput = container.querySelector('input[data-answer]:not([disabled])');
            if (firstInput) firstInput.focus();
        }

       function updateStartModalUI() {
            const subjectButtons = subjectSelector.querySelectorAll('.btn');
            const topic = gameState.selectedTopic;

            if (topic === CONSTANTS.TOPICS.CURRICULUM || topic === CONSTANTS.TOPICS.MODEL) {
                subjectSelector.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);
                subjectButtons.forEach(btn => {
                    const btnTopics = (btn.dataset.topic || '').split(' ');
                    const visible = btnTopics.includes(topic) || btnTopics.length === 0;
                    btn.classList.toggle(CONSTANTS.CSS_CLASSES.HIDDEN, !visible);
                    btn.disabled = false;
                });
            } else {
                subjectSelector.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);
                subjectButtons.forEach(btn => { btn.disabled = true; });
            }
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
                focusFirstInput(firstSection);
            }
        }

        function advanceToNextStage() {
            const main = document.getElementById(`${gameState.selectedSubject}-quiz-main`);
            if (!main) return;
            const tabs = Array.from(main.querySelector('.tabs').querySelectorAll('.tab'));
            const currentIndex = tabs.findIndex(t => t.classList.contains(CONSTANTS.CSS_CLASSES.ACTIVE));
            if (currentIndex === -1) return;
            const nextIndex = currentIndex + 1;
            const currentSection = main.querySelector(`#${tabs[currentIndex].dataset.target}`);
            tabs[currentIndex].classList.remove(CONSTANTS.CSS_CLASSES.ACTIVE);
            if (currentSection) currentSection.classList.remove(CONSTANTS.CSS_CLASSES.ACTIVE);
            if (nextIndex < tabs.length) {
                const nextTab = tabs[nextIndex];
                nextTab.classList.add(CONSTANTS.CSS_CLASSES.ACTIVE);
                const nextSection = main.querySelector(`#${nextTab.dataset.target}`);
                if (nextSection) {
                    nextSection.classList.add(CONSTANTS.CSS_CLASSES.ACTIVE);
                    if (nextTab.dataset.target === 'activity-examples') {
                        const subTabs = nextSection.querySelector('.sub-tabs');
                        if (subTabs) {
                            const subBtns = subTabs.querySelectorAll('.tab');
                            subBtns.forEach(b => b.classList.remove(CONSTANTS.CSS_CLASSES.ACTIVE));
                            const defaultTab = subTabs.querySelector('[data-target="activity-exercise"]');
                            if (defaultTab) defaultTab.classList.add(CONSTANTS.CSS_CLASSES.ACTIVE);
                        }
                        nextSection.querySelectorAll('section').forEach(sec => sec.classList.remove(CONSTANTS.CSS_CLASSES.ACTIVE));
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
            } else {
                showProgress();
            }
        }

        function showProgress() {
            const allInputs = document.querySelectorAll(`#${gameState.selectedSubject}-quiz-main input[data-answer]`);
            const correctCount = document.querySelectorAll(`#${gameState.selectedSubject}-quiz-main input.${CONSTANTS.CSS_CLASSES.CORRECT}`).length;
            const totalCount = allInputs.length;
            const percentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

            document.getElementById('correct-count').textContent = correctCount;
            document.getElementById('total-count').textContent = totalCount;
            document.getElementById('progress-text').textContent = `${percentage}%`;
            
            const progressBarFill = document.getElementById('progress-bar-fill');
            
            let feedback;
            if (percentage === 100) {
                feedback = { title: "신의 경지", dialogue: "완벽해! 당신은 이 게임의 신이야!", animation: "cheer", effect: "perfect" };
            } else if (percentage >= 90) {
                feedback = { title: "내체표 마스터", dialogue: "대단한 실력인데? 거의 마스터 수준이야!", animation: "happy", effect: "excellent" };
            } else if (percentage >= 70) {
                feedback = { title: "내체표 고수", dialogue: "꽤 하는걸? 이 감각, 잊지 말라구!", animation: "idle", effect: "great" };
            } else if (percentage >= 50) {
                feedback = { title: "내체표 중수", dialogue: "절반은 넘었네! 다음엔 더 잘할 수 있겠어.", animation: "idle", effect: "good" };
            } else if (percentage >= 20) {
                feedback = { title: "내체표 하수", dialogue: "으... 너무 어려웠어. 다시 해볼까?", animation: "sad", effect: "notbad" };
            } else {
                feedback = { title: "내체표 입문자", dialogue: "털썩... (아무 말도 하지 못했다)", animation: "sad", effect: "tryagain" };
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
            setTimeout(() => { progressBarFill.style.width = `${percentage}%`; }, 100);
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
            headerTitle.textContent = '내체표를 해보자';
            headerTitle.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);
            comboCounter.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);
            showAnswersBtn.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);
            showAnswersBtn.disabled = false;
            resetBtn.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);
            forceQuitBtn.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);
            document.getElementById('timer-container').classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);
            livesContainer.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);

            // Reset competency tab states
            document.querySelectorAll('.competency-tab.cleared')
                .forEach(tab => tab.classList.remove('cleared'));

            if (showStartModal) {
                startModal.classList.add(CONSTANTS.CSS_CLASSES.ACTIVE);
                updateStartModalUI();
            }

            setCharacterState('idle');
        }

        function startGame() {
            playSound(startAudio);
            startModal.classList.remove(CONSTANTS.CSS_CLASSES.ACTIVE);
            
            const subjectMap = {
                [CONSTANTS.SUBJECTS.MUSIC]: '음악',
                [CONSTANTS.SUBJECTS.ART]: '미술',
                [CONSTANTS.SUBJECTS.KOREAN]: '국어',
                [CONSTANTS.SUBJECTS.LIFE]: '바른 생활',
                [CONSTANTS.SUBJECTS.WISE]: '슬기로운 생활',
                [CONSTANTS.SUBJECTS.JOY]: '즐거운 생활',
                [CONSTANTS.SUBJECTS.PE]: '체육',
                [CONSTANTS.SUBJECTS.ETHICS]: '도덕',
                [CONSTANTS.SUBJECTS.PRACTICAL]: '실과',
                [CONSTANTS.SUBJECTS.SOCIAL]: '사회',
                [CONSTANTS.SUBJECTS.COMPETENCY]: '역량'
            };
            headerTitle.textContent = subjectMap[gameState.selectedSubject] || '퀴즈';
            const mainEl = document.getElementById(`${gameState.selectedSubject}-quiz-main`);
            mainEl.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);
            resetToFirstStage(gameState.selectedSubject);

            document.querySelectorAll(`#${gameState.selectedSubject}-quiz-main input[data-answer]`).forEach(i => i.disabled = false);
            
            forceQuitBtn.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);
            
            if (gameState.gameMode === CONSTANTS.MODES.HARD_CORE) {
                gameState.duration = CONSTANTS.HARD_CORE_DURATION;
                gameState.lives = CONSTANTS.HARD_CORE_LIVES;
                updateLivesUI();
                livesContainer.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);
                document.getElementById('timer-container').classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);
                document.getElementById('bar').style.display = 'none';
            } else {
                const timeParts = timeSettingDisplay.textContent.split(':');
                gameState.duration = parseInt(timeParts[0], 10) * 60 + parseInt(timeParts[1], 10);
                livesContainer.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);
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
        }

        function checkStageClear(sectionElement) {
            const inputsInSection = sectionElement.querySelectorAll('input[data-answer]');
            return inputsInSection.length > 0 && [...inputsInSection].every(input => input.classList.contains(CONSTANTS.CSS_CLASSES.CORRECT));
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
                advanceToNextStage();
                if (gameState.total > 0 && gameState.timerId === null) {
                    gameState.timerId = setInterval(tick, 1000);
                }
            }, duration);
        }

        function celebrateCompetencySection(sectionElement) {
            const targetId = sectionElement.id;
            const tabButton = document.querySelector(`.competency-tab[data-target="${targetId}"]`);
            if (tabButton && !tabButton.classList.contains('cleared')) {
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
                    advanceToNextStage();
                    if (gameState.total > 0 && gameState.timerId === null) {
                        gameState.timerId = setInterval(tick, 1000);
                    }
                }, duration);
            }
        }

        function revealCompetencyAnswers() {
            const normalize = str => str.trim().replace(/[\s⋅·]+/g, '').toLowerCase();
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
            const ignorePattern = gameState.selectedTopic === CONSTANTS.TOPICS.MODEL
                ? /[\s⋅·의]+/g
                : /[\s⋅·]+/g;
            const userAnswer = input.value.trim().replace(ignorePattern, '').toLowerCase();

            let isCorrect = false;
            let displayAnswer = input.dataset.answer;

            if (gameState.selectedSubject === CONSTANTS.SUBJECTS.COMPETENCY) {
                if (!usedAnswersMap.has(section)) usedAnswersMap.set(section, new Set());
                const usedSet = usedAnswersMap.get(section);

                const answerMap = new Map();
                section.querySelectorAll('input[data-answer]').forEach(inp => {
                    const original = inp.dataset.answer.trim();
                    const normalized = original.replace(ignorePattern, '').toLowerCase();
                    answerMap.set(normalized, original);
                    const alias = normalized.replace(/역량$/, '');
                    if (alias !== normalized) {
                        answerMap.set(alias, original);
                    }
                });

                if (answerMap.has(userAnswer)) {
                    const canonical = answerMap.get(userAnswer);
                    const canonicalNorm = canonical.trim().replace(ignorePattern, '').toLowerCase();
                    if (!usedSet.has(canonicalNorm)) {
                        isCorrect = true;
                        displayAnswer = canonical;
                        usedSet.add(canonicalNorm);
                    }
                }
            } else {
                const correctAnswer = input.dataset.answer.trim().replace(ignorePattern, '').toLowerCase();
                if (userAnswer === correctAnswer) {
                    isCorrect = true;
                    displayAnswer = input.dataset.answer;
                }
            }

            if (isCorrect) {
                playSound(successAudio);
                input.classList.remove(CONSTANTS.CSS_CLASSES.INCORRECT, CONSTANTS.CSS_CLASSES.RETRYING);
                input.classList.add(CONSTANTS.CSS_CLASSES.CORRECT);
                input.value = displayAnswer;
                input.disabled = true;

                gameState.combo++;
                setCharacterState('happy');
                updateMushroomGrowth();

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
                
                if (checkStageClear(section)) {
                    if (gameState.selectedSubject === CONSTANTS.SUBJECTS.COMPETENCY) {
                        setTimeout(() => celebrateCompetencySection(section), 300);
                    } else {
                        setTimeout(showStageClear, 300);
                    }
                }
            } else {
                gameState.combo = 0;
                updateMushroomGrowth();
                headerTitle.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);
                comboCounter.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);

                playSound(failAudio);
                setCharacterState('sad');

                if (gameState.selectedSubject === CONSTANTS.SUBJECTS.COMPETENCY) {
                    input.classList.remove(CONSTANTS.CSS_CLASSES.RETRYING);
                    input.classList.add(CONSTANTS.CSS_CLASSES.INCORRECT);

                    if (gameState.gameMode === CONSTANTS.MODES.HARD_CORE) {
                        gameState.lives--;
                        updateLivesUI();
                        if (gameState.lives <= 0) {
                            handleGameOver();
                        }
                    }
                } else if (input.classList.contains(CONSTANTS.CSS_CLASSES.RETRYING)) {
                    input.classList.remove(CONSTANTS.CSS_CLASSES.RETRYING);
                    input.classList.add(CONSTANTS.CSS_CLASSES.INCORRECT);

                    input.value = input.dataset.answer;
                    input.disabled = true;

                    if (gameState.gameMode === CONSTANTS.MODES.HARD_CORE) {
                        gameState.lives--;
                        updateLivesUI();
                        if (gameState.lives <= 0) {
                            handleGameOver();
                        }
                    }
                } else {
                    input.classList.add(CONSTANTS.CSS_CLASSES.RETRYING);
                    input.value = '';
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
            if (topic === CONSTANTS.TOPICS.CURRICULUM || topic === CONSTANTS.TOPICS.MODEL) {
                subjectSelector.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);
                document.querySelectorAll('.subject-btn').forEach(b => b.classList.remove(CONSTANTS.CSS_CLASSES.SELECTED));
                const defaultSubject = topic === CONSTANTS.TOPICS.MODEL ? CONSTANTS.SUBJECTS.ETHICS : CONSTANTS.SUBJECTS.MUSIC;
                const defaultBtn = document.querySelector(`.subject-btn[data-subject="${defaultSubject}"]`);
                if (defaultBtn) defaultBtn.classList.add(CONSTANTS.CSS_CLASSES.SELECTED);
                gameState.selectedSubject = defaultSubject;
            } else {
                subjectSelector.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);
                document.querySelectorAll('.subject-btn').forEach(b => b.classList.remove(CONSTANTS.CSS_CLASSES.SELECTED));
                gameState.selectedSubject = CONSTANTS.SUBJECTS.COMPETENCY;
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
                    }
                }
            });
        });

        const competencyTabs = document.querySelector('.competency-tabs');

        if (competencyTabs) {
            competencyTabs.addEventListener('click', e => {
                if (!e.target.matches('.competency-tab')) return;
                playSound(clickAudio);
                document.querySelectorAll('.competency-tab').forEach(tab => tab.classList.remove(CONSTANTS.CSS_CLASSES.ACTIVE));
                e.target.classList.add(CONSTANTS.CSS_CLASSES.ACTIVE);
                const targetId = e.target.dataset.target;
                document.querySelectorAll('#competency-quiz-main section').forEach(sec => sec.classList.remove(CONSTANTS.CSS_CLASSES.ACTIVE));
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    targetSection.classList.add(CONSTANTS.CSS_CLASSES.ACTIVE);
                    focusFirstInput(targetSection);
                }
            });
        }
        
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
        });

        closeProgressModalBtn.addEventListener('click', () => {
            progressModal.classList.remove('active');
            showAnswersBtn.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);
            resetBtn.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);
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
            if (gameState.selectedSubject === CONSTANTS.SUBJECTS.COMPETENCY) {
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
        });

        // --- INITIAL SETUP ---
        function initializeApp() {
            gameState.selectedTopic = CONSTANTS.TOPICS.CURRICULUM;
            gameState.selectedSubject = CONSTANTS.SUBJECTS.MUSIC;
            resetGame(false); // Reset state without showing any modal
            updateStartModalUI();
            guideModal.classList.add('active'); // Always show guide on page load
        }

        initializeApp();
    });
