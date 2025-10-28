// === AUDIO MANAGER MODULE ===
// 오디오 재생과 AudioContext 관리를 담당합니다.

export class AudioManager {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.audioUnlockAttempts = 0;
        this.MAX_UNLOCK_ATTEMPTS = 3;
        
        // 모바일 기기 감지 후 볼륨 설정 (모바일에서는 더 낮은 볼륨 사용)
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        this.SFX_VOLUME = isMobile ? 0.15 : 0.3;
        
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
        this.highpassNodes = {};
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
            success: this.createAudioElement('./success.mp3', this.SFX_VOLUME * 0.5),
            timeup: this.createAudioElement('./timeup.mp3'),
            start: this.createAudioElement('./start.mp3'),
            fail: this.createAudioElement('./fail.mp3'),
            clear: this.createAudioElement('./clear.mp3'),
            random: this.createAudioElement('./random.mp3'),
            click: this.createAudioElement('./click.mp3'),
            slotWin: this.createAudioElement('./hit.mp3', Math.min(1, this.SFX_VOLUME * 1.4))
        };
    }

    // 초기 볼륨을 기준 볼륨으로 저장
    captureBaseVolumes() {
        Object.entries(this.audioElements).forEach(([key, audio]) => {
            this.baseVolumes[key] = audio.volume;
        });
    }

    // 특정 오디오의 끝부분에서 짧은 페이드아웃 적용
    setupEndFade(audioKey, fadeDurationSec = 0.06) {
        const audio = this.audioElements[audioKey];
        if (!audio) return;

        const beginFadeIfNeeded = () => {
            if (!audio.duration || isNaN(audio.duration)) return;
            const remaining = audio.duration - audio.currentTime;
            if (remaining <= fadeDurationSec && remaining >= 0 && !this.fadingStates[audioKey]) {
                this.fadingStates[audioKey] = true;
                const startVolume = this.baseVolumes[audioKey] ?? audio.volume ?? 1;
                const steps = 6; // 6단계로 약 60ms 페이드
                const stepMs = Math.max(10, (fadeDurationSec * 1000) / steps);
                let currentStep = 0;
                clearInterval(this.fadeTimers[audioKey]);
                this.fadeTimers[audioKey] = setInterval(() => {
                    currentStep += 1;
                    const ratio = Math.max(0, 1 - (currentStep / steps));
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
        const audio = this.audioElements[audioKey];
        if (!audio || this.mediaSources[audioKey]) return;
        try {
            const source = this.audioContext.createMediaElementSource(audio);
            const gain = this.audioContext.createGain();
            const baseGain = this.baseVolumes[audioKey] ?? this.SFX_VOLUME;
            gain.gain.value = baseGain;
            source.connect(gain).connect(this.audioContext.destination);
            // 이 요소의 직접 출력은 끄고, Web Audio 경로만 사용
            audio.volume = 0;
            this.mediaSources[audioKey] = source;
            this.gainNodes[audioKey] = gain;
        } catch (e) {
            console.warn(`Failed to setup WebAudio routing for ${audioKey}:`, e);
        }
    }

    // 'fail'을 AudioBuffer로 디코드 (정밀 페이드/필터용)
    loadAndDecodeBuffer(audioKey, url) {
        try {
            fetch(url)
                .then(res => res.arrayBuffer())
                .then(arrayBuf => this.audioContext.decodeAudioData(arrayBuf))
                .then(decoded => {
                    // 디코딩된 버퍼를 트림/페이드 후 저장
                    const processed = this.processDecodedBuffer(audioKey, decoded, {
                        trimTailSec: 0.15,
                        tailFadeSec: 0.12
                    });
                    this.decodedBuffers[audioKey] = processed || decoded;
                    this.bufferReady[audioKey] = true;
                    // 미디어 엘리먼트 경로는 계속 유지(예비), GainNode는 공용으로 사용
                })
                .catch(err => {
                    console.warn(`Failed to decode audio buffer for ${audioKey}:`, err);
                });
        } catch (e) {
            console.warn(`Error scheduling buffer decode for ${audioKey}:`, e);
        }
    }

    // 디코딩 버퍼 후처리: 꼬리 트림 + 지수 페이드아웃 적용
    processDecodedBuffer(audioKey, decoded, opts = {}) {
        try {
            const sampleRate = decoded.sampleRate || this.audioContext.sampleRate || 48000;
            const trimTailSec = Math.max(0, opts.trimTailSec ?? 0.15);
            const tailFadeSec = Math.max(0.005, opts.tailFadeSec ?? 0.12);
            const minDurationSec = 0.08;
            const targetDurationSec = Math.max(minDurationSec, decoded.duration - trimTailSec);
            const targetSamples = Math.max(1, Math.floor(targetDurationSec * sampleRate));
            const channels = decoded.numberOfChannels || 1;
            const newBuffer = this.audioContext.createBuffer(channels, targetSamples, sampleRate);

            for (let ch = 0; ch < channels; ch++) {
                const src = decoded.getChannelData(ch);
                const dst = newBuffer.getChannelData(ch);
                const copyLen = Math.min(src.length, targetSamples);
                dst.set(src.subarray(0, copyLen));

                // DC 오프셋 제거: 평균값을 계산해 전체에서 감산
                let sum = 0;
                for (let i = 0; i < copyLen; i++) sum += dst[i];
                const mean = sum / copyLen;
                if (Math.abs(mean) > 1e-6) {
                    for (let i = 0; i < copyLen; i++) dst[i] = dst[i] - mean;
                }

                // 꼬리 지수 페이드아웃
                const fadeSamples = Math.min(copyLen - 1, Math.floor(tailFadeSec * sampleRate));
                if (fadeSamples > 2) {
                    const startIndex = Math.max(0, copyLen - fadeSamples);
                    const logEnd = Math.log(0.0001);
                    for (let i = 0; i < fadeSamples; i++) {
                        const t = i / (fadeSamples - 1);
                        const expScalar = Math.exp(logEnd * t); // 1 -> 0.0001
                        // Hann 윈도우(반쪽)로 부드러운 꼬리 적용 (1 -> 0)
                        const hannScalar = 0.5 * (1 + Math.cos(Math.PI * t));
                        const scalar = expScalar * hannScalar;
                        const idx = startIndex + i;
                        dst[idx] = dst[idx] * scalar;
                    }
                    // 마지막 수백 샘플은 0으로 고정해 잔클릭 억제 (~5ms@48k ≈ 240샘플)
                    const hardZero = Math.min(256, copyLen);
                    for (let k = 1; k <= hardZero; k++) {
                        dst[copyLen - k] = 0;
                    }
                }
            }
            return newBuffer;
        } catch (e) {
            console.warn(`Failed to post-process decoded buffer for ${audioKey}:`, e);
            return null;
        }
    }

    // AudioBuffer 기반 재생 (하이패스 + 샘플단위 페이드인/아웃 + 조기 정지)
    playDecodedBuffer(audioKey) {
        const buffer = this.decodedBuffers[audioKey];
        if (!buffer) return false;
        this.setupWebAudioRoutingFor(audioKey);
        const g = this.gainNodes[audioKey] || this.audioContext.createGain();
        if (!this.gainNodes[audioKey]) {
            this.gainNodes[audioKey] = g;
            g.connect(this.audioContext.destination);
        }
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        const hp = this.audioContext.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = 160; // DC/초저역 제거 (더 강화)
        hp.Q.value = 0.9;
        const lp = this.audioContext.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 14000; // 평상시 통과 대역
        lp.Q.value = 0.707;
        // 체인: BufferSource -> HPF -> LPF -> GainNode -> destination
        source.connect(hp).connect(lp).connect(g);

        const baseGain = this.baseVolumes[audioKey] ?? this.SFX_VOLUME;
        const fadeInSec = 0.005;
        const fadeOutSec = 0.8;
        const preStopSec = 0.1;
        const tailExpSec = 0.02; // 끝 20ms는 지수 페이드로 더 강하게
        const now = this.audioContext.currentTime;
        const dur = buffer.duration;

        // 제로 크로싱에 맞춰 stop 시점을 앞당김 (최대 20ms 탐색)
        const sampleRate = buffer.sampleRate || 48000;
        let desiredStopRelSec = Math.max(0.01, dur - preStopSec);
        const data = buffer.numberOfChannels > 0 ? buffer.getChannelData(0) : null;
        if (data && data.length > 2) {
            const maxSearchSec = 0.05;
            const maxSearchSamples = Math.min(Math.floor(maxSearchSec * sampleRate), data.length - 2);
            let stopSample = Math.max(1, Math.min(data.length - 2, Math.floor(desiredStopRelSec * sampleRate)));
            let foundZero = false;
            for (let i = stopSample; i > stopSample - maxSearchSamples; i--) {
                const s0 = data[i - 1];
                const s1 = data[i];
                if ((s0 <= 0 && s1 >= 0) || (s0 >= 0 && s1 <= 0)) {
                    const denom = (s1 - s0);
                    const frac = denom !== 0 ? (-s0) / denom : 0;
                    const crossSample = (i - 1) + Math.max(0, Math.min(1, frac));
                    desiredStopRelSec = Math.max(fadeInSec + 0.005, crossSample / sampleRate);
                    foundZero = true;
                    break;
                }
            }
            if (!foundZero) {
                // 제로 크로싱이 없으면 최소 진폭 지점 선택
                let bestIdx = stopSample;
                let bestAbs = Math.abs(data[stopSample]);
                for (let i = stopSample; i > stopSample - maxSearchSamples; i--) {
                    const a = Math.abs(data[i]);
                    if (a < bestAbs) { bestAbs = a; bestIdx = i; }
                }
                desiredStopRelSec = Math.max(fadeInSec + 0.005, bestIdx / sampleRate);
            }
        }

        const fadeOutStartRelSec = Math.max(fadeInSec, desiredStopRelSec - fadeOutSec);
        const stopAt = now + desiredStopRelSec;
        const tailStart = Math.max(now + fadeInSec, stopAt - tailExpSec);
        const hardMuteAt = Math.max(tailStart, stopAt - 0.005);

        // 게인 엔벨로프 (선형 → 선형 → 지수 꼬리)
        g.gain.cancelScheduledValues(now);
        g.gain.setValueAtTime(0.0001, now);
        g.gain.linearRampToValueAtTime(baseGain, now + fadeInSec);
        g.gain.setValueAtTime(baseGain, now + fadeOutStartRelSec);
        // 꼬리 직전까지는 작은 레벨(0.002)까지 선형으로 감쇠
        g.gain.linearRampToValueAtTime(0.002, tailStart);
        // 마지막 꼬리는 stopAt 시점까지 지수 페이드 (값은 0에 근접)
        try {
            g.gain.exponentialRampToValueAtTime(0.00001, stopAt);
        } catch (_) {
            // 일부 브라우저에서 0으로의 지수 램프 예외 방지
            g.gain.linearRampToValueAtTime(0.00001, stopAt);
        }

        // 꼬리 구간 로우패스 자동화 (사운드의 고역을 깎아 클릭 억제)
        try {
            lp.frequency.cancelScheduledValues(now);
            lp.frequency.setValueAtTime(14000, now);
            lp.frequency.setValueAtTime(14000, tailStart);
            lp.frequency.exponentialRampToValueAtTime(1000, stopAt);
        } catch (_) {
            // exponential 실패 시 선형으로 대체
            lp.frequency.linearRampToValueAtTime(1000, stopAt);
        }

        // HTMLAudioElement의 직접 출력은 계속 0 유지
        const mediaEl = this.audioElements[audioKey];
        if (mediaEl) mediaEl.volume = 0;

        // 재생 및 정지 스케줄링
        try {
            source.start(now);
            source.stop(stopAt);
        } catch (_) { /* noop */ }
        // 정지 직전 4ms에 오디오 파라미터 타임라인에서 0으로 강제 (JS 타이머 대신)
        try {
            const forceZeroAt = Math.max(now, stopAt - 0.004);
            g.gain.setValueAtTime(0.0, forceZeroAt);
            g.gain.setValueAtTime(0.0, stopAt);
        } catch (_) { /* noop */ }

        // 종료 후 정리
        this.activeBufferSources[audioKey] = source;
        source.onended = () => {
            try { source.disconnect(); } catch (_) { /* noop */ }
            try { hp.disconnect(); } catch (_) { /* noop */ }
            try { lp.disconnect(); } catch (_) { /* noop */ }
            this.activeBufferSources[audioKey] = null;
            // 다음 재생을 위해 게인을 기준값으로 복구
            const t = this.audioContext.currentTime;
            g.gain.cancelScheduledValues(t);
            g.gain.setValueAtTime(baseGain, t);
        };
        return true;
    }

    // 끝부분에서 GainNode로 정확한 페이드 후, 끝 직전 강제 정지
    setupEndGainFade(audioKey, fadeDurationSec = 0.15, prePauseSec = 0.01) {
        const audio = this.audioElements[audioKey];
        const gain = () => this.gainNodes[audioKey];
        if (!audio) return;

        const clearMonitors = () => {
            if (this.monitorIntervals[audioKey]) {
                clearInterval(this.monitorIntervals[audioKey]);
                this.monitorIntervals[audioKey] = null;
            }
            if (this.pauseTimeouts[audioKey]) {
                clearTimeout(this.pauseTimeouts[audioKey]);
                this.pauseTimeouts[audioKey] = null;
            }
        };

        const startMonitor = () => {
            clearMonitors();
            this.fadingStates[audioKey] = false;
            this.monitorIntervals[audioKey] = setInterval(() => {
                if (!audio.duration || isNaN(audio.duration)) return;
                const remaining = audio.duration - audio.currentTime;
                if (remaining <= fadeDurationSec && remaining >= 0 && !this.fadingStates[audioKey]) {
                    this.fadingStates[audioKey] = true;
                    const now = this.audioContext.currentTime;
                    const g = gain();
                    if (g) {
                        const currentVal = g.gain.value;
                        g.gain.cancelScheduledValues(now);
                        g.gain.setValueAtTime(currentVal, now);
                        g.gain.linearRampToValueAtTime(0.0001, now + Math.max(0.05, fadeDurationSec));
                    }
                    const msToPause = Math.max(0, (audio.duration - audio.currentTime - Math.max(0, prePauseSec)) * 1000);
                    this.pauseTimeouts[audioKey] = setTimeout(() => {
                        try {
                            audio.pause();
                            audio.currentTime = 0;
                        } catch (_) { /* noop */ }
                    }, msToPause);
                }
            }, 25);
        };

        const reset = () => {
            clearMonitors();
            this.fadingStates[audioKey] = false;
            const g = gain();
            if (g) {
                const now = this.audioContext.currentTime;
                const baseGain = this.baseVolumes[audioKey] ?? this.SFX_VOLUME;
                g.gain.cancelScheduledValues(now);
                g.gain.setValueAtTime(baseGain, now);
            }
        };

        audio.addEventListener('play', startMonitor);
        audio.addEventListener('seeking', reset);
        audio.addEventListener('pause', () => { if (!audio.ended) reset(); });
        audio.addEventListener('ended', reset);
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

    // 합성형 fail 사운드 (노이즈 버스트 + 필터드 톤, ADSR 엔벨로프)
    playSynthFail() {
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        const outGain = this.gainNodes.fail || ctx.createGain();
        if (!this.gainNodes.fail) {
            this.gainNodes.fail = outGain;
            outGain.connect(ctx.destination);
        }
        const baseGain = this.baseVolumes.fail ?? this.SFX_VOLUME;
        // 출력 게인 초기화
        outGain.gain.cancelScheduledValues(now);
        outGain.gain.setValueAtTime(0.0001, now);
        outGain.gain.linearRampToValueAtTime(baseGain, now + 0.01);

        // 톤: 순수 톤(사인/트라이앵글) 기반
        const tone = ctx.createOscillator();
        tone.type = 'sine';
        tone.frequency.setValueAtTime(200, now);
        tone.frequency.exponentialRampToValueAtTime(170, now + 0.08);
        const toneGain = ctx.createGain();
        toneGain.gain.setValueAtTime(0.001, now);
        toneGain.gain.linearRampToValueAtTime(0.4, now + 0.01);
        toneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
        const toneBPF = ctx.createBiquadFilter();
        toneBPF.type = 'bandpass';
        toneBPF.frequency.setValueAtTime(200, now);
        toneBPF.Q.setValueAtTime(1.2, now);

        // DC/초저역 제거
        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.setValueAtTime(200, now);
        hp.Q.setValueAtTime(0.9, now);

        // 기본 라우팅 (pure): tone → toneBPF → toneGain → hp → outGain
        tone.connect(toneBPF).connect(toneGain).connect(hp).connect(outGain);

        // 필요 시 하이브리드(노이즈) 프로파일
        if (this.synthFailProfile === 'hybrid') {
            const noiseBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.12), ctx.sampleRate);
            const ch = noiseBuffer.getChannelData(0);
            for (let i = 0; i < ch.length; i++) ch[i] = (Math.random() * 2 - 1);
            const noise = ctx.createBufferSource();
            noise.buffer = noiseBuffer;
            const noiseGain = ctx.createGain();
            noiseGain.gain.setValueAtTime(0.001, now);
            noiseGain.gain.linearRampToValueAtTime(0.3, now + 0.005);
            noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
            const noiseLP = ctx.createBiquadFilter();
            noiseLP.type = 'lowpass';
            noiseLP.frequency.setValueAtTime(3000, now);
            noiseLP.Q.setValueAtTime(0.7, now);
            noise.connect(noiseLP).connect(noiseGain).connect(hp);
            try { noise.start(now); noise.stop(now + 0.12); } catch (_) {}
            setTimeout(() => { try { noise.disconnect(); noiseLP.disconnect(); noiseGain.disconnect(); } catch (_) {} }, 200);
        }

        // 재생 스케줄
        try {
            tone.start(now);
            tone.stop(now + 0.22);
        } catch (_) { /* noop */ }

        // 끝 꼬리: 출력 게인 지수 페이드 + 강제 0
        try {
            outGain.gain.setValueAtTime(outGain.gain.value, now + 0.18);
            outGain.gain.exponentialRampToValueAtTime(0.00001, now + 0.22);
            outGain.gain.setValueAtTime(0.0, now + 0.225);
        } catch (_) {
            outGain.gain.linearRampToValueAtTime(0.00001, now + 0.22);
            outGain.gain.setValueAtTime(0.0, now + 0.225);
        }

        const cleanup = () => {
            try { tone.disconnect(); } catch (_) {}
            try { toneBPF.disconnect(); } catch (_) {}
            try { hp.disconnect(); } catch (_) {}
            const t = ctx.currentTime;
            outGain.gain.cancelScheduledValues(t);
            outGain.gain.setValueAtTime(this.baseVolumes.fail ?? this.SFX_VOLUME, t);
        };
        setTimeout(cleanup, 300);
        return true;
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
                if (active) { try { active.stop(); } catch (_) { /* noop */ } this.activeBufferSources.fail = null; }
            }
            this.playSynthFail();
            return;
        }
        // 합성 경로 실패 시 버퍼 경로 사용
        if (audioType === 'fail' && this.decodedBuffers.fail) {
            const active = this.activeBufferSources.fail;
            if (active) { try { active.stop(); } catch (_) { /* noop */ } }
            this.playDecodedBuffer('fail');
            return;
        }

        const play = () => {
            // 'fail'은 GainNode 기반 페이드/정지 사용: 재생 전 상태 복구
            if (audioType === 'fail') {
                // WebAudio 라우팅이 준비되어 있는지 확인
                this.setupWebAudioRoutingFor('fail');
                // 이전 모니터/타임아웃 정리 및 게인 복구
                if (this.monitorIntervals.fail) clearInterval(this.monitorIntervals.fail);
                if (this.pauseTimeouts.fail) clearTimeout(this.pauseTimeouts.fail);
                this.fadingStates.fail = false;
                const g = this.gainNodes.fail;
                if (g) {
                    const now = this.audioContext.currentTime;
                    const baseGain = this.baseVolumes.fail ?? this.SFX_VOLUME;
                    g.gain.cancelScheduledValues(now);
                    g.gain.setValueAtTime(baseGain, now);
                }
                // HTMLAudioElement 출력은 0 유지
                audioElement.volume = 0;
            }
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
        this.audioElements.success.volume = this.SFX_VOLUME * 0.5;
        // slotWin 오디오는 특별히 더 높은 볼륨
        this.audioElements.slotWin.volume = Math.min(1, this.SFX_VOLUME * 1.4);

        // 기준 볼륨 갱신 (페이드 복구 시 참조)
        Object.entries(this.audioElements).forEach(([key, audio]) => {
            this.baseVolumes[key] = audio.volume;
        });
        // 'fail'은 Web Audio 경로를 사용하므로 GainNode와 기준 볼륨 동기화
        if (this.gainNodes.fail) {
            const now = this.audioContext.currentTime;
            const target = this.SFX_VOLUME;
            this.baseVolumes.fail = target;
            this.gainNodes.fail.gain.cancelScheduledValues(now);
            this.gainNodes.fail.gain.setValueAtTime(target, now);
            // HTMLAudioElement 출력은 항상 0으로 유지
            this.audioElements.fail.volume = 0;
        }
    }

    // AudioContext 상태 확인
    getAudioContextState() {
        return this.audioContext.state;
    }
}
