// === AUDIO MANAGER MODULE ===
// 오디오 재생과 AudioContext 관리를 담당합니다.

import { getDefaultSfxVolume } from './audio-config.js';
import {
    captureBaseVolumes,
    createAudioElement,
    initializeAudioElements,
    setAudioElementsVolume,
    startLoopingAudio,
    stopAllAudioElements,
    stopLoopingAudio,
} from './audio-elements.js';
import {
    loadAndDecodeAudioBuffer,
    playDecodedAudioBuffer,
    setupEndGainFade,
    setupWebAudioRoutingFor,
} from './audio-fail-buffer-player.js';
import { playStandardAudio } from './audio-standard-playback.js';
import { playImpactLayer } from './audio-impact-synth.js';
import { playSynthFail } from './audio-synth-fail.js';
import { setupAudioUnlockEvents, unlockAudioContext } from './audio-unlock.js';

export class AudioManager {
    constructor() {
        this.audioContext = new (window.AudioContext ||
            window.webkitAudioContext)();
        this.audioUnlockAttempts = 0;
        this.MAX_UNLOCK_ATTEMPTS = 3;
        this.unlockHandler = this.unlockAudio.bind(this);

        this.SFX_VOLUME = getDefaultSfxVolume();

        // 페이드 관리용 상태
        this.fadeTimers = {};
        this.fadingStates = {};
        this.baseVolumes = {};

        // Web Audio 라우팅 상태 (특히 'fail'용)
        this.mediaSources = {};
        this.gainNodes = {};
        this.monitorIntervals = {};
        this.pauseTimeouts = {};

        // AudioBuffer 기반 재생 상태 ('fail'용)
        this.decodedBuffers = {};
        this.activeBufferSources = {};
        this.bufferReady = {};
        // 합성형 사운드 플래그
        this.useSynthFail = true;
        this.synthFailProfile = 'pure'; // 'pure' | 'hybrid'
        this.EXCLUSIVE_FAIL = true; // fail 재생 시 다른 효과음 중지

        // 오디오 요소들
        this.audioElements = {};

        this.initializeAudioElements();
        this.captureBaseVolumes();
        // 'fail' 사운드: 합성 경로를 기본으로 사용. 미디어/버퍼 경로는 예비로 유지
        this.setupWebAudioRoutingFor('fail');
        this.setupEndGainFade('fail', 0.8, 0.1);
        this.loadAndDecodeBuffer('fail', './fail.mp3');
        this.setupUnlockEvents();
    }

    // 오디오 파일 초기화
    createAudioElement(src, volume = this.SFX_VOLUME) {
        return createAudioElement(src, volume);
    }

    // 모든 오디오 요소 초기화
    initializeAudioElements() {
        this.audioElements = initializeAudioElements(this.SFX_VOLUME);
    }

    // 초기 볼륨을 기준 볼륨으로 저장
    captureBaseVolumes() {
        this.baseVolumes = captureBaseVolumes(this.audioElements);
    }

    // 특정 오디오의 끝부분에서 짧은 페이드아웃 적용
    setupEndFade(audioKey, fadeDurationSec = 0.06) {
        const audio = this.audioElements[audioKey];
        if (!audio) return;

        const beginFadeIfNeeded = () => {
            if (!audio.duration || isNaN(audio.duration)) return;
            const remaining = audio.duration - audio.currentTime;
            if (
                remaining <= fadeDurationSec &&
                remaining >= 0 &&
                !this.fadingStates[audioKey]
            ) {
                this.fadingStates[audioKey] = true;
                const startVolume =
                    this.baseVolumes[audioKey] ?? audio.volume ?? 1;
                const steps = 6; // 6단계로 약 60ms 페이드
                const stepMs = Math.max(10, (fadeDurationSec * 1000) / steps);
                let currentStep = 0;
                clearInterval(this.fadeTimers[audioKey]);
                this.fadeTimers[audioKey] = setInterval(() => {
                    currentStep += 1;
                    const ratio = Math.max(0, 1 - currentStep / steps);
                    audio.volume = Math.max(0, startVolume * ratio);
                    if (currentStep >= steps || audio.paused || audio.ended) {
                        clearInterval(this.fadeTimers[audioKey]);
                    }
                }, stepMs);
            }
        };

        const reset = () => {
            clearInterval(this.fadeTimers[audioKey]);
            this.fadingStates[audioKey] = false;
            // 다음 재생을 위해 기본 볼륨 복구
            audio.volume = this.baseVolumes[audioKey] ?? this.SFX_VOLUME;
        };

        audio.addEventListener('timeupdate', beginFadeIfNeeded);
        audio.addEventListener('seeking', reset);
        audio.addEventListener('pause', () => {
            // 자연 종료 시에도 reset은 ended에서 처리됨
            if (!audio.ended) reset();
        });
        audio.addEventListener('ended', reset);
    }

    // 'fail' 전용: MediaElement를 GainNode로 라우팅하여 정밀한 페이드 적용
    setupWebAudioRoutingFor(audioKey) {
        setupWebAudioRoutingFor(this, audioKey);
    }

    // 'fail'을 AudioBuffer로 디코드 (정밀 페이드/필터용)
    loadAndDecodeBuffer(audioKey, url) {
        loadAndDecodeAudioBuffer(this, audioKey, url);
    }

    // AudioBuffer 기반 재생 (하이패스 + 샘플단위 페이드인/아웃 + 조기 정지)
    playDecodedBuffer(audioKey) {
        return playDecodedAudioBuffer(this, audioKey);
    }

    // 끝부분에서 GainNode로 정확한 페이드 후, 끝 직전 강제 정지
    setupEndGainFade(audioKey, fadeDurationSec = 0.15, prePauseSec = 0.01) {
        setupEndGainFade(this, audioKey, fadeDurationSec, prePauseSec);
    }

    // 오디오 잠금 해제 함수
    unlockAudio() {
        unlockAudioContext(this);
    }

    // 오디오 잠금 해제 이벤트 설정
    setupUnlockEvents() {
        setupAudioUnlockEvents(this);
    }

    // 합성형 fail 사운드 (노이즈 버스트 + 필터드 톤, ADSR 엔벨로프)
    playSynthFail() {
        return playSynthFail(this);
    }

    playImpactLayer(audioType) {
        const impactType =
            audioType === 'fail'
                ? 'fail'
                : audioType === 'great' || audioType === 'slotWin'
                  ? 'combo'
                  : 'success';

        return playImpactLayer(this, impactType);
    }

    // 오디오 재생 함수
    playSound(audioType) {
        const audioElement = this.audioElements[audioType];

        if (!audioElement || typeof audioElement.play !== 'function') {
            console.error(`Audio element not found or invalid: ${audioType}`);
            return;
        }

        // 'fail'은 합성 경로를 최우선으로 사용
        if (audioType === 'fail' && this.useSynthFail) {
            if (this.EXCLUSIVE_FAIL) {
                // 다른 오디오 중지로 겹침으로 인한 클릭 방지
                this.stopAllAudio();
                const active = this.activeBufferSources.fail;
                if (active) {
                    try {
                        active.stop();
                    } catch (_) {
                        /* noop */
                    }
                    this.activeBufferSources.fail = null;
                }
            }
            this.playSynthFail();
            this.playImpactLayer('fail');
            return;
        }
        // 합성 경로 실패 시 버퍼 경로 사용
        if (audioType === 'fail' && this.decodedBuffers.fail) {
            const active = this.activeBufferSources.fail;
            if (active) {
                try {
                    active.stop();
                } catch (_) {
                    /* noop */
                }
            }
            this.playDecodedBuffer('fail');
            this.playImpactLayer('fail');
            return;
        }

        playStandardAudio(this, audioType, audioElement);

        if (
            audioType === 'success' ||
            audioType === 'great' ||
            audioType === 'slotWin'
        ) {
            this.playImpactLayer(audioType);
        }
    }

    // 특별한 오디오 처리 (랜덤 선택 시 루프)
    startRandomAudio() {
        return startLoopingAudio(this, 'random');
    }

    // 랜덤 오디오 정지
    stopRandomAudio() {
        stopLoopingAudio(this, 'random');
    }

    // 모든 오디오 정지
    stopAllAudio() {
        stopAllAudioElements(this.audioElements);
    }

    // 볼륨 설정
    setVolume(volume) {
        setAudioElementsVolume(this, volume);
    }

    // AudioContext 상태 확인
    getAudioContextState() {
        return this.audioContext.state;
    }
}
