import { AUDIO_DEFINITIONS, getAudioVolume } from './audio-config.js';
import { logAudioDebug } from './audio-debug.js';

export function createAudioElement(src, volume) {
    const audio = new Audio(src);
    audio.preload = 'auto';
    audio.volume = volume;

    audio.addEventListener('error', (event) => {
        console.error(`Failed to load audio file: ${src}`, event);
    });

    audio.addEventListener('canplaythrough', () => {
        logAudioDebug(`Audio file loaded: ${src}`);
    });

    return audio;
}

export function initializeAudioElements(defaultVolume) {
    return Object.fromEntries(
        Object.entries(AUDIO_DEFINITIONS).map(([key, definition]) => [
            key,
            createAudioElement(
                definition.src,
                getAudioVolume(defaultVolume, definition)
            ),
        ])
    );
}

export function captureBaseVolumes(audioElements) {
    return Object.fromEntries(
        Object.entries(audioElements).map(([key, audio]) => [key, audio.volume])
    );
}

export function stopAllAudioElements(audioElements) {
    Object.values(audioElements).forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
    });
}

export function startLoopingAudio(manager, audioType) {
    const audio = manager.audioElements[audioType];
    if (!audio) return null;

    audio.loop = true;
    manager.playSound(audioType);
    return audio;
}

export function stopLoopingAudio(manager, audioType) {
    const audio = manager.audioElements[audioType];
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
    audio.loop = false;
}

export function setAudioElementsVolume(manager, volume) {
    manager.SFX_VOLUME = Math.max(0, Math.min(1, volume));

    Object.entries(manager.audioElements).forEach(([key, audio]) => {
        audio.volume = getAudioVolume(
            manager.SFX_VOLUME,
            AUDIO_DEFINITIONS[key]
        );
    });

    manager.baseVolumes = captureBaseVolumes(manager.audioElements);

    const failGain = manager.gainNodes.fail;
    if (!failGain) return;

    const now = manager.audioContext.currentTime;
    const target = manager.SFX_VOLUME;
    manager.baseVolumes.fail = target;
    failGain.gain.cancelScheduledValues(now);
    failGain.gain.setValueAtTime(target, now);

    if (manager.audioElements.fail) {
        manager.audioElements.fail.volume = 0;
    }
}
