// === AUDIO BUFFER PROCESSING MODULE ===
// 디코딩된 효과음 버퍼의 트림, DC 오프셋 제거, 꼬리 페이드를 담당합니다.

export function processDecodedAudioBuffer(audioContext, decoded, opts = {}) {
    const sampleRate =
        decoded.sampleRate || audioContext?.sampleRate || DEFAULT_SAMPLE_RATE;
    const trimTailSec = Math.max(0, opts.trimTailSec ?? 0.15);
    const tailFadeSec = Math.max(0.005, opts.tailFadeSec ?? 0.12);
    const targetDurationSec = Math.max(
        MIN_DURATION_SEC,
        decoded.duration - trimTailSec
    );
    const targetSamples = Math.max(
        1,
        Math.floor(targetDurationSec * sampleRate)
    );
    const channels = decoded.numberOfChannels || 1;
    const newBuffer = audioContext.createBuffer(
        channels,
        targetSamples,
        sampleRate
    );

    for (let channel = 0; channel < channels; channel++) {
        processChannel({
            source: decoded.getChannelData(channel),
            destination: newBuffer.getChannelData(channel),
            targetSamples,
            sampleRate,
            tailFadeSec,
        });
    }

    return newBuffer;
}

const DEFAULT_SAMPLE_RATE = 48000;
const MIN_DURATION_SEC = 0.08;
const HARD_ZERO_SAMPLES = 256;
const MIN_DC_OFFSET = 1e-6;
const FADE_FLOOR = 0.0001;

function processChannel({
    source,
    destination,
    targetSamples,
    sampleRate,
    tailFadeSec,
}) {
    const copyLength = Math.min(source.length, targetSamples);
    destination.set(source.subarray(0, copyLength));

    removeDcOffset(destination, copyLength);
    applyTailFade(destination, copyLength, sampleRate, tailFadeSec);
}

function removeDcOffset(samples, sampleCount) {
    let sum = 0;
    for (let index = 0; index < sampleCount; index++) {
        sum += samples[index];
    }

    const mean = sum / sampleCount;
    if (Math.abs(mean) <= MIN_DC_OFFSET) return;

    for (let index = 0; index < sampleCount; index++) {
        samples[index] -= mean;
    }
}

function applyTailFade(samples, sampleCount, sampleRate, tailFadeSec) {
    const fadeSamples = Math.min(
        sampleCount - 1,
        Math.floor(tailFadeSec * sampleRate)
    );
    if (fadeSamples <= 2) return;

    const startIndex = Math.max(0, sampleCount - fadeSamples);
    const logEnd = Math.log(FADE_FLOOR);

    for (let offset = 0; offset < fadeSamples; offset++) {
        const t = offset / (fadeSamples - 1);
        const expScalar = Math.exp(logEnd * t);
        const hannScalar = 0.5 * (1 + Math.cos(Math.PI * t));
        samples[startIndex + offset] *= expScalar * hannScalar;
    }

    const hardZeroSamples = Math.min(HARD_ZERO_SAMPLES, sampleCount);
    for (let offset = 1; offset <= hardZeroSamples; offset++) {
        samples[sampleCount - offset] = 0;
    }
}
