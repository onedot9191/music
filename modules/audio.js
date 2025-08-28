// === AUDIO MANAGER MODULE ===
// 오디오 재생과 AudioContext 관리를 담당합니다.

export class AudioManager {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.audioUnlockAttempts = 0;
        this.MAX_UNLOCK_ATTEMPTS = 3;
        this.SFX_VOLUME = 0.5;
        
        // 오디오 요소들
        this.audioElements = {};
        
        this.initializeAudioElements();
        this.setupUnlockEvents();
    }

    // 오디오 파일 초기화
    createAudioElement(src, volume = this.SFX_VOLUME) {
        const audio = new Audio(src);
        audio.preload = 'auto';
        audio.volume = volume;
        
        // 오디오 로딩 에러 처리
        audio.addEventListener('error', (e) => {
            console.error(`Failed to load audio file: ${src}`, e);
        });
        
        // 오디오 로딩 완료 로그
        audio.addEventListener('canplaythrough', () => {
            console.log(`Audio file loaded: ${src}`);
        });
        
        return audio;
    }

    // 모든 오디오 요소 초기화
    initializeAudioElements() {
        this.audioElements = {
            success: this.createAudioElement('./success.mp3', this.SFX_VOLUME * 0.6),
            timeup: this.createAudioElement('./timeup.mp3'),
            start: this.createAudioElement('./start.mp3'),
            fail: this.createAudioElement('./fail.mp3'),
            clear: this.createAudioElement('./clear.mp3'),
            random: this.createAudioElement('./random.mp3'),
            click: this.createAudioElement('./click.mp3'),
            slotWin: this.createAudioElement('./hit.mp3', Math.min(1, this.SFX_VOLUME * 2))
        };
    }

    // 오디오 잠금 해제 함수
    unlockAudio() {
        this.audioUnlockAttempts++;
        console.log(`Audio unlock attempt ${this.audioUnlockAttempts}`);
        
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume().then(() => {
                console.log('AudioContext successfully resumed');
            }).catch(err => {
                console.error('Failed to resume AudioContext:', err);
            });
        }
        
        // 최대 시도 횟수에 도달하면 이벤트 리스너 제거
        if (this.audioUnlockAttempts >= this.MAX_UNLOCK_ATTEMPTS) {
            document.body.removeEventListener('click', this.unlockAudio.bind(this));
            document.body.removeEventListener('touchend', this.unlockAudio.bind(this));
            document.body.removeEventListener('keydown', this.unlockAudio.bind(this));
            console.log('Audio unlock event listeners removed after max attempts');
        }
    }

    // 오디오 잠금 해제 이벤트 설정
    setupUnlockEvents() {
        const unlockHandler = this.unlockAudio.bind(this);
        document.body.addEventListener('click', unlockHandler);
        document.body.addEventListener('touchend', unlockHandler);
        document.body.addEventListener('keydown', unlockHandler);
    }

    // 오디오 재생 함수
    playSound(audioType) {
        const audioElement = this.audioElements[audioType];
        
        if (!audioElement || typeof audioElement.play !== 'function') {
            console.error(`Audio element not found or invalid: ${audioType}`);
            return;
        }

        const play = () => {
            try {
                audioElement.currentTime = 0; // 재생 위치 초기화
                const playPromise = audioElement.play();
                
                if (playPromise !== undefined) {
                    playPromise.catch(err => {
                        console.error(`Audio playback failed for ${audioElement.src}:`, err);
                        // 브라우저에서 자동재생이 차단된 경우를 위한 추가 처리
                        if (err.name === 'NotAllowedError') {
                            console.warn('Audio autoplay was prevented. User interaction may be required.');
                        }
                    });
                }
            } catch (error) {
                console.error(`Error playing audio ${audioType}:`, error);
            }
        };

        // AudioContext 상태 확인 및 복구
        if (this.audioContext.state === 'suspended') {
            this.audioContext
                .resume()
                .then(() => {
                    console.log('AudioContext resumed successfully');
                    play();
                })
                .catch(err => {
                    console.warn('Failed to resume AudioContext:', err);
                    // AudioContext 복구에 실패해도 일반 재생 시도
                    play();
                });
        } else {
            play();
        }
    }

    // 특별한 오디오 처리 (랜덤 선택 시 루프)
    startRandomAudio() {
        const randomAudio = this.audioElements.random;
        randomAudio.loop = true;
        this.playSound('random');
        return randomAudio;
    }

    // 랜덤 오디오 정지
    stopRandomAudio() {
        const randomAudio = this.audioElements.random;
        randomAudio.pause();
        randomAudio.currentTime = 0;
        randomAudio.loop = false;
    }

    // 모든 오디오 정지
    stopAllAudio() {
        Object.values(this.audioElements).forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });
    }

    // 볼륨 설정
    setVolume(volume) {
        this.SFX_VOLUME = Math.max(0, Math.min(1, volume));
        Object.values(this.audioElements).forEach(audio => {
            audio.volume = this.SFX_VOLUME;
        });
        // success 오디오는 특별히 더 낮은 볼륨
        this.audioElements.success.volume = this.SFX_VOLUME * 0.6;
        // slotWin 오디오는 특별히 더 높은 볼륨
        this.audioElements.slotWin.volume = Math.min(1, this.SFX_VOLUME * 2);
    }

    // AudioContext 상태 확인
    getAudioContextState() {
        return this.audioContext.state;
    }
}
