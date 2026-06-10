function safeRampTo(gainParam, value, time) {
    try {
        gainParam.exponentialRampToValueAtTime(Math.max(0.00001, value), time);
    } catch {
        gainParam.linearRampToValueAtTime(Math.max(0.00001, value), time);
    }
}

function createNoiseBuffer(ctx, duration) {
    const buffer = ctx.createBuffer(
        1,
        Math.max(1, Math.floor(ctx.sampleRate * duration)),
        ctx.sampleRate
    );
    const channel = buffer.getChannelData(0);

    for (let i = 0; i < channel.length; i++) {
        channel[i] = Math.random() * 2 - 1;
    }

    return buffer;
}

function cleanup(nodes, delayMs = 260) {
    setTimeout(() => {
        nodes.forEach((node) => {
            try {
                node.disconnect();
            } catch {
                /* noop */
            }
        });
    }, delayMs);
}

function playLowPunch({ ctx, output, now, frequency, endFrequency, gain }) {
    const oscillator = ctx.createOscillator();
    const punchGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(endFrequency, now + 0.09);

    punchGain.gain.setValueAtTime(0.0001, now);
    punchGain.gain.linearRampToValueAtTime(gain, now + 0.006);
    safeRampTo(punchGain.gain, 0.0001, now + 0.13);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(520, now);
    filter.Q.setValueAtTime(0.8, now);

    oscillator.connect(filter).connect(punchGain).connect(output);
    oscillator.start(now);
    oscillator.stop(now + 0.14);

    cleanup([oscillator, filter, punchGain]);
}

function playClick({ ctx, output, now, gain, filterFrequency = 4200 }) {
    const noise = ctx.createBufferSource();
    const noiseGain = ctx.createGain();
    const highpass = ctx.createBiquadFilter();

    noise.buffer = createNoiseBuffer(ctx, 0.045);
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(filterFrequency, now);
    highpass.Q.setValueAtTime(0.7, now);

    noiseGain.gain.setValueAtTime(0.0001, now);
    noiseGain.gain.linearRampToValueAtTime(gain, now + 0.002);
    safeRampTo(noiseGain.gain, 0.0001, now + 0.045);

    noise.connect(highpass).connect(noiseGain).connect(output);
    noise.start(now);
    noise.stop(now + 0.05);

    cleanup([noise, highpass, noiseGain], 160);
}

function playComboSpark({ ctx, output, now, gain }) {
    [740, 980, 1240].forEach((frequency, index) => {
        const oscillator = ctx.createOscillator();
        const sparkGain = ctx.createGain();
        const start = now + index * 0.025;

        oscillator.type = index === 2 ? 'triangle' : 'square';
        oscillator.frequency.setValueAtTime(frequency, start);
        oscillator.frequency.exponentialRampToValueAtTime(
            frequency * 1.12,
            start + 0.07
        );

        sparkGain.gain.setValueAtTime(0.0001, start);
        sparkGain.gain.linearRampToValueAtTime(gain, start + 0.006);
        safeRampTo(sparkGain.gain, 0.0001, start + 0.1);

        oscillator.connect(sparkGain).connect(output);
        oscillator.start(start);
        oscillator.stop(start + 0.11);

        cleanup([oscillator, sparkGain], 220);
    });
}

export function playImpactLayer(audioManager, type = 'success') {
    const ctx = audioManager.audioContext;

    if (!ctx || ctx.state === 'suspended') return false;

    const now = ctx.currentTime;
    const output = ctx.createGain();
    const compressor = ctx.createDynamicsCompressor();
    const baseVolume = audioManager.SFX_VOLUME ?? 0.3;
    const masterGain = Math.min(0.34, Math.max(0.08, baseVolume * 0.95));

    compressor.threshold.setValueAtTime(-18, now);
    compressor.knee.setValueAtTime(9, now);
    compressor.ratio.setValueAtTime(7, now);
    compressor.attack.setValueAtTime(0.002, now);
    compressor.release.setValueAtTime(0.12, now);

    output.gain.setValueAtTime(masterGain, now);
    output.gain.linearRampToValueAtTime(masterGain * 0.85, now + 0.08);
    safeRampTo(output.gain, 0.0001, now + 0.18);

    output.connect(compressor).connect(ctx.destination);

    if (type === 'fail') {
        playLowPunch({
            ctx,
            output,
            now,
            frequency: 130,
            endFrequency: 72,
            gain: 0.62,
        });
        playClick({ ctx, output, now, gain: 0.18, filterFrequency: 1600 });
    } else if (type === 'combo') {
        playLowPunch({
            ctx,
            output,
            now,
            frequency: 170,
            endFrequency: 92,
            gain: 0.46,
        });
        playClick({ ctx, output, now, gain: 0.24, filterFrequency: 5200 });
        playComboSpark({ ctx, output, now, gain: 0.12 });
    } else {
        playLowPunch({
            ctx,
            output,
            now,
            frequency: 155,
            endFrequency: 96,
            gain: 0.38,
        });
        playClick({ ctx, output, now, gain: 0.16, filterFrequency: 4600 });
    }

    cleanup([output, compressor], 320);
    return true;
}
