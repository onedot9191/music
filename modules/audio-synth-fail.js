function connectHybridNoiseProfile({ ctx, now, highpass }) {
    const noiseBuffer = ctx.createBuffer(
        1,
        Math.floor(ctx.sampleRate * 0.12),
        ctx.sampleRate
    );
    const channel = noiseBuffer.getChannelData(0);
    for (let i = 0; i < channel.length; i++) {
        channel[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    const noiseGain = ctx.createGain();
    const noiseLowpass = ctx.createBiquadFilter();

    noise.buffer = noiseBuffer;
    noiseGain.gain.setValueAtTime(0.001, now);
    noiseGain.gain.linearRampToValueAtTime(0.3, now + 0.005);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
    noiseLowpass.type = 'lowpass';
    noiseLowpass.frequency.setValueAtTime(3000, now);
    noiseLowpass.Q.setValueAtTime(0.7, now);
    noise.connect(noiseLowpass).connect(noiseGain).connect(highpass);

    try {
        noise.start(now);
        noise.stop(now + 0.12);
    } catch {
        /* noop */
    }

    setTimeout(() => {
        try {
            noise.disconnect();
            noiseLowpass.disconnect();
            noiseGain.disconnect();
        } catch {
            /* noop */
        }
    }, 200);
}

export function playSynthFail(audioManager) {
    const ctx = audioManager.audioContext;
    const now = ctx.currentTime;
    const outputGain = audioManager.gainNodes.fail || ctx.createGain();

    if (!audioManager.gainNodes.fail) {
        audioManager.gainNodes.fail = outputGain;
        outputGain.connect(ctx.destination);
    }

    const baseGain = audioManager.baseVolumes.fail ?? audioManager.SFX_VOLUME;
    outputGain.gain.cancelScheduledValues(now);
    outputGain.gain.setValueAtTime(0.0001, now);
    outputGain.gain.linearRampToValueAtTime(baseGain, now + 0.01);

    const tone = ctx.createOscillator();
    const toneGain = ctx.createGain();
    const toneBandpass = ctx.createBiquadFilter();
    const highpass = ctx.createBiquadFilter();

    tone.type = 'sine';
    tone.frequency.setValueAtTime(200, now);
    tone.frequency.exponentialRampToValueAtTime(170, now + 0.08);
    toneGain.gain.setValueAtTime(0.001, now);
    toneGain.gain.linearRampToValueAtTime(0.4, now + 0.01);
    toneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
    toneBandpass.type = 'bandpass';
    toneBandpass.frequency.setValueAtTime(200, now);
    toneBandpass.Q.setValueAtTime(1.2, now);
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(200, now);
    highpass.Q.setValueAtTime(0.9, now);

    tone.connect(toneBandpass)
        .connect(toneGain)
        .connect(highpass)
        .connect(outputGain);

    if (audioManager.synthFailProfile === 'hybrid') {
        connectHybridNoiseProfile({ ctx, now, highpass });
    }

    try {
        tone.start(now);
        tone.stop(now + 0.22);
    } catch {
        /* noop */
    }

    try {
        outputGain.gain.setValueAtTime(outputGain.gain.value, now + 0.18);
        outputGain.gain.exponentialRampToValueAtTime(0.00001, now + 0.22);
        outputGain.gain.setValueAtTime(0, now + 0.225);
    } catch {
        outputGain.gain.linearRampToValueAtTime(0.00001, now + 0.22);
        outputGain.gain.setValueAtTime(0, now + 0.225);
    }

    setTimeout(() => {
        try {
            tone.disconnect();
            toneBandpass.disconnect();
            highpass.disconnect();
        } catch {
            /* noop */
        }

        const resetTime = ctx.currentTime;
        outputGain.gain.cancelScheduledValues(resetTime);
        outputGain.gain.setValueAtTime(
            audioManager.baseVolumes.fail ?? audioManager.SFX_VOLUME,
            resetTime
        );
    }, 300);

    return true;
}
