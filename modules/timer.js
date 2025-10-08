// === TIMER MODULE ===
// 게임 타이머와 시간 관리를 담당합니다.

import { CONSTANTS } from './constants.js';
import { formatTime } from './utils.js';

export class TimerManager {
    constructor(audioManager) {
        this.audioManager = audioManager;
        this.timerId = null;
        this.duration = CONSTANTS.DEFAULT_DURATION;
        this.total = CONSTANTS.DEFAULT_DURATION;
        this.gameMode = CONSTANTS.MODES.NORMAL;
        this.onTick = null;
        this.onGameOver = null;
        
        // DOM 요소들
        this.timeEl = document.getElementById('time');
        this.barEl = document.querySelector('#bar > div');
        this.character = document.getElementById('character-assistant');
    }

    // 콜백 함수 설정
    setCallbacks(onTick, onGameOver) {
        this.onTick = onTick;
        this.onGameOver = onGameOver;
    }

    // 타이머 시작
    start() {
        this.stop(); // 기존 타이머 정리
        this.total = this.gameMode === CONSTANTS.MODES.HARD_CORE ? 
                     CONSTANTS.HARD_CORE_DURATION : 
                     this.duration;
        
        this.updateDisplay();
        this.timerId = setInterval(() => this.tick(), 1000);
    }

    // 타이머 정지
    stop() {
        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
    }

    // 타이머 리셋
    reset() {
        this.stop();
        this.total = this.gameMode === CONSTANTS.MODES.HARD_CORE ? 
                     CONSTANTS.HARD_CORE_DURATION : 
                     this.duration;
        this.updateDisplay();
    }

    // 시간 추가 (하드코어 모드 보너스)
    addTime(seconds = CONSTANTS.HARD_CORE_TIME_BONUS) {
        this.total += seconds;
        this.updateDisplay();
    }

    // 게임 모드 설정
    setGameMode(mode) {
        this.gameMode = mode;
    }

    // 지속 시간 설정
    setDuration(duration) {
        this.duration = duration;
    }

    // 현재 지속 시간 가져오기
    getDuration() {
        return this.duration;
    }

    // 남은 시간 가져오기
    getRemainingTime() {
        return this.total;
    }

    // 타이머 실행 중 여부
    isRunning() {
        return this.timerId !== null;
    }

    // 타이머 틱 처리
    tick() {
        if (this.total <= 0) {
            this.handleGameOver();
            return;
        }

        this.total--;
        this.updateDisplay();

        // 30초 남았을 때 캐릭터 상태 변경 (하드코어 모드 제외)
        if (this.total < 30 && 
            !this.character.classList.contains('happy') && 
            !this.character.classList.contains('sad') && 
            this.gameMode !== CONSTANTS.MODES.HARD_CORE) {
            this.setCharacterState('worried', 1000);
        }

        // 외부 콜백 호출
        if (this.onTick) {
            this.onTick(this.total);
        }
    }

    // 디스플레이 업데이트
    updateDisplay() {
        if (this.timeEl) {
            this.timeEl.textContent = formatTime(this.total);
        }

        if (this.barEl) {
            const currentDuration = this.gameMode === CONSTANTS.MODES.HARD_CORE ? 
                                   CONSTANTS.HARD_CORE_DURATION : 
                                   this.duration;
            const percentage = (this.total / currentDuration) * 100;
            this.barEl.style.width = `${Math.max(0, percentage)}%`;
        }
    }

    // 게임 오버 처리
    handleGameOver() {
        this.stop();
        
        // 입력 필드 비활성화
        const activeQuizMain = document.querySelector(`main:not(.${CONSTANTS.CSS_CLASSES.HIDDEN})`);
        if (activeQuizMain) {
            const inputs = activeQuizMain.querySelectorAll('input[data-answer]');
            inputs.forEach(input => input.disabled = true);
        }

        // 타임업 사운드 재생
        if (this.audioManager) {
            this.audioManager.playSound('timeup');
        }

        // 캐릭터 상태 변경
        this.setCharacterState('sad');

        // 외부 콜백 호출
        if (this.onGameOver) {
            this.onGameOver();
        }
    }

    // 캐릭터 상태 설정 (유틸리티 함수 호출)
    setCharacterState(state, duration = 3000) {
        if (!this.character) return;
        
        this.character.className = 'character';
        this.character.classList.add(state);
        
        if (duration > 0) {
            setTimeout(() => {
                this.character.className = 'character';
            }, duration);
        }
    }

    // 시간 설정 증가
    increaseDuration(amount = 300) {
        if (this.duration < 7200) { // 최대 120분
            this.duration += amount;
            this.updateTimeDisplay();
        }
    }

    // 시간 설정 감소
    decreaseDuration(amount = 300) {
        if (this.duration > 60) { // 최소 1분
            this.duration -= amount;
            this.updateTimeDisplay();
        }
    }

    // 시간 설정 디스플레이 업데이트
    updateTimeDisplay() {
        const timeSettingDisplay = document.getElementById('time-setting-display');
        if (timeSettingDisplay) {
            timeSettingDisplay.textContent = formatTime(this.duration);
        }
    }

    // 타이핑 애니메이션 관리
    static createTypingManager() {
        let typingInterval = null;

        return {
            start(element, text, speed = 50) {
                this.stop();
                element.innerHTML = '';
                let i = 0;
                
                typingInterval = setInterval(() => {
                    if (i < text.length) {
                        const char = text.charAt(i);
                        element.innerHTML += char === '\n' ? '<br>' : char;
                        i++;
                    } else {
                        this.stop();
                    }
                }, speed);
            },

            stop() {
                if (typingInterval) {
                    clearInterval(typingInterval);
                    typingInterval = null;
                }
            },

            isRunning() {
                return typingInterval !== null;
            }
        };
    }
}
