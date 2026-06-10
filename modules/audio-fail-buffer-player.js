import { processDecodedAudioBuffer } from './audio-buffer-processing.js';

function getOrCreateGainNode(audioManager, audioKey) {
    const gain =
        audioManager.gainNodes[audioKey] ||
        audioManager.audioContext.createGain();

    if (!audioManager.gainNodes[audioKey]) {
        audioManager.gainNodes[audioKey] = gain;
        gain.connect(audioManager.audioContext.destination);
    }

    return gain;
}

function getPreferredStopTime(buffer, { fadeInSec, preStopSec }) {
    const sampleRate = buffer.sampleRate || 48000;
    const data = buffer.numberOfChannels > 0 ? buffer.getChannelData(0) : null;
    let stopRelSec = Math.max(0.01, buffer.duration - preStopSec);

    if (!data || data.length <= 2) {
        return stopRelSec;
    }

    const maxSearchSamples = Math.min(
        Math.floor(0.05 * sampleRate),
        data.length - 2
    );
    const stopSample = Math.max(
        1,
        Math.min(data.length - 2, Math.floor(stopRelSec * sampleRate))
    );

    for (let i = stopSample; i > stopSample - maxSearchSamples; i--) {
        const previousSample = data[i - 1];
        const currentSample = data[i];
        const crossesZero =
            (previousSample <= 0 && currentSample >= 0) ||
            (previousSample >= 0 && currentSample <= 0);

        if (crossesZero) {
            const denom = currentSample - previousSample;
            const fraction = denom !== 0 ? -previousSample / denom : 0;
            const crossSample = i - 1 + Math.max(0, Math.min(1, fraction));
            return Math.max(fadeInSec + 0.005, crossSample / sampleRate);
        }
    }

    let bestIndex = stopSample;
    let bestAbs = Math.abs(data[stopSample]);
    for (let i = stopSample; i > stopSample - maxSearchSamples; i--) {
        const abs = Math.abs(data[i]);
        if (abs < bestAbs) {
            bestAbs = abs;
            bestIndex = i;
        }
    }

    return Math.max(fadeInSec + 0.005, bestIndex / sampleRate);
}

export function setupWebAudioRoutingFor(audioManager, audioKey) {
    const audio = audioManager.audioElements[audioKey];
    if (!audio || audioManager.mediaSources[audioKey]) return;

    try {
        const source =
            audioManager.audioContext.createMediaElementSource(audio);
        const gain = audioManager.audioContext.createGain();
        const baseGain =
            audioManager.baseVolumes[audioKey] ?? audioManager.SFX_VOLUME;
        gain.gain.value = baseGain;
        source.connect(gain).connect(audioManager.audioContext.destination);
        audio.volume = 0;
        audioManager.mediaSources[audioKey] = source;
        audioManager.gainNodes[audioKey] = gain;
    } catch (error) {
        console.warn(
            `Failed to setup WebAudio routing for ${audioKey}:`,
            error
        );
    }
}

export function loadAndDecodeAudioBuffer(audioManager, audioKey, url) {
    try {
        fetch(url)
            .then((res) => res.arrayBuffer())
            .then((arrayBuffer) =>
                audioManager.audioContext.decodeAudioData(arrayBuffer)
            )
            .then((decoded) => {
                const processed = processDecodedAudioBuffer(
                    audioManager.audioContext,
                    decoded,
                    {
                        trimTailSec: 0.15,
                        tailFadeSec: 0.12,
                    }
                );
                audioManager.decodedBuffers[audioKey] = processed || decoded;
                audioManager.bufferReady[audioKey] = true;
            })
            .catch((error) => {
                console.warn(
                    `Failed to decode audio buffer for ${audioKey}:`,
                    error
                );
            });
    } catch (error) {
        console.warn(`Error scheduling buffer decode for ${audioKey}:`, error);
    }
}

export function playDecodedAudioBuffer(audioManager, audioKey) {
    const buffer = audioManager.decodedBuffers[audioKey];
    if (!buffer) return false;

    setupWebAudioRoutingFor(audioManager, audioKey);

    const gain = getOrCreateGainNode(audioManager, audioKey);
    const source = audioManager.audioContext.createBufferSource();
    const highpass = audioManager.audioContext.createBiquadFilter();
    const lowpass = audioManager.audioContext.createBiquadFilter();

    source.buffer = buffer;
    highpass.type = 'highpass';
    highpass.frequency.value = 160;
    highpass.Q.value = 0.9;
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 14000;
    lowpass.Q.value = 0.707;
    source.connect(highpass).connect(lowpass).connect(gain);

    const baseGain =
        audioManager.baseVolumes[audioKey] ?? audioManager.SFX_VOLUME;
    const fadeInSec = 0.005;
    const fadeOutSec = 0.8;
    const preStopSec = 0.1;
    const tailExpSec = 0.02;
    const now = audioManager.audioContext.currentTime;
    const stopRelSec = getPreferredStopTime(buffer, {
        fadeInSec,
        preStopSec,
    });
    const fadeOutStartRelSec = Math.max(fadeInSec, stopRelSec - fadeOutSec);
    const stopAt = now + stopRelSec;
    const tailStart = Math.max(now + fadeInSec, stopAt - tailExpSec);

    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(baseGain, now + fadeInSec);
    gain.gain.setValueAtTime(baseGain, now + fadeOutStartRelSec);
    gain.gain.linearRampToValueAtTime(0.002, tailStart);

    try {
        gain.gain.exponentialRampToValueAtTime(0.00001, stopAt);
    } catch {
        gain.gain.linearRampToValueAtTime(0.00001, stopAt);
    }

    try {
        lowpass.frequency.cancelScheduledValues(now);
        lowpass.frequency.setValueAtTime(14000, now);
        lowpass.frequency.setValueAtTime(14000, tailStart);
        lowpass.frequency.exponentialRampToValueAtTime(1000, stopAt);
    } catch {
        lowpass.frequency.linearRampToValueAtTime(1000, stopAt);
    }

    const mediaElement = audioManager.audioElements[audioKey];
    if (mediaElement) mediaElement.volume = 0;

    try {
        source.start(now);
        source.stop(stopAt);
    } catch {
        /* noop */
    }

    try {
        const forceZeroAt = Math.max(now, stopAt - 0.004);
        gain.gain.setValueAtTime(0, forceZeroAt);
        gain.gain.setValueAtTime(0, stopAt);
    } catch {
        /* noop */
    }

    audioManager.activeBufferSources[audioKey] = source;
    source.onended = () => {
        try {
            source.disconnect();
            highpass.disconnect();
            lowpass.disconnect();
        } catch {
            /* noop */
        }

        audioManager.activeBufferSources[audioKey] = null;
        const resetTime = audioManager.audioContext.currentTime;
        gain.gain.cancelScheduledValues(resetTime);
        gain.gain.setValueAtTime(baseGain, resetTime);
    };

    return true;
}

export function setupEndGainFade(
    audioManager,
    audioKey,
    fadeDurationSec = 0.15,
    prePauseSec = 0.01
) {
    const audio = audioManager.audioElements[audioKey];
    if (!audio) return;

    const getGain = () => audioManager.gainNodes[audioKey];
    const clearMonitors = () => {
        if (audioManager.monitorIntervals[audioKey]) {
            clearInterval(audioManager.monitorIntervals[audioKey]);
            audioManager.monitorIntervals[audioKey] = null;
        }
        if (audioManager.pauseTimeouts[audioKey]) {
            clearTimeout(audioManager.pauseTimeouts[audioKey]);
            audioManager.pauseTimeouts[audioKey] = null;
        }
    };

    const reset = () => {
        clearMonitors();
        audioManager.fadingStates[audioKey] = false;
        const gain = getGain();
        if (!gain) return;

        const now = audioManager.audioContext.currentTime;
        const baseGain =
            audioManager.baseVolumes[audioKey] ?? audioManager.SFX_VOLUME;
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(baseGain, now);
    };

    const startMonitor = () => {
        clearMonitors();
        audioManager.fadingStates[audioKey] = false;
        audioManager.monitorIntervals[audioKey] = setInterval(() => {
            if (!audio.duration || isNaN(audio.duration)) return;

            const remaining = audio.duration - audio.currentTime;
            if (
                remaining > fadeDurationSec ||
                remaining < 0 ||
                audioManager.fadingStates[audioKey]
            ) {
                return;
            }

            audioManager.fadingStates[audioKey] = true;
            const gain = getGain();
            const now = audioManager.audioContext.currentTime;
            if (gain) {
                const currentValue = gain.gain.value;
                gain.gain.cancelScheduledValues(now);
                gain.gain.setValueAtTime(currentValue, now);
                gain.gain.linearRampToValueAtTime(
                    0.0001,
                    now + Math.max(0.05, fadeDurationSec)
                );
            }

            const msToPause = Math.max(
                0,
                (audio.duration -
                    audio.currentTime -
                    Math.max(0, prePauseSec)) *
                    1000
            );
            audioManager.pauseTimeouts[audioKey] = setTimeout(() => {
                try {
                    audio.pause();
                    audio.currentTime = 0;
                } catch {
                    /* noop */
                }
            }, msToPause);
        }, 25);
    };

    audio.addEventListener('play', startMonitor);
    audio.addEventListener('seeking', reset);
    audio.addEventListener('pause', () => {
        if (!audio.ended) reset();
    });
    audio.addEventListener('ended', reset);
}
