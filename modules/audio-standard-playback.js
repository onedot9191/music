import { logAudioDebug } from './audio-debug.js';

function handlePlaybackPromise(playPromise, audioElement) {
    if (playPromise === undefined) return;

    playPromise.catch((error) => {
        console.error(`Audio playback failed for ${audioElement.src}:`, error);

        if (error.name === 'NotAllowedError') {
            console.warn(
                'Audio autoplay was prevented. User interaction may be required.'
            );
        }
    });
}

function resetFailMediaRoute(manager, audioElement) {
    manager.setupWebAudioRoutingFor('fail');

    if (manager.monitorIntervals.fail) {
        clearInterval(manager.monitorIntervals.fail);
    }
    if (manager.pauseTimeouts.fail) {
        clearTimeout(manager.pauseTimeouts.fail);
    }

    manager.fadingStates.fail = false;

    const gainNode = manager.gainNodes.fail;
    if (gainNode) {
        const now = manager.audioContext.currentTime;
        const baseGain = manager.baseVolumes.fail ?? manager.SFX_VOLUME;
        gainNode.gain.cancelScheduledValues(now);
        gainNode.gain.setValueAtTime(baseGain, now);
    }

    audioElement.volume = 0;
}

function playHtmlAudioElement(manager, audioType, audioElement) {
    if (audioType === 'fail') {
        resetFailMediaRoute(manager, audioElement);
    }

    try {
        audioElement.currentTime = 0;
        handlePlaybackPromise(audioElement.play(), audioElement);
    } catch (error) {
        console.error(`Error playing audio ${audioType}:`, error);
    }
}

export function resumeAudioContextIfNeeded(manager, onReady) {
    if (manager.audioContext.state !== 'suspended') {
        onReady();
        return;
    }

    manager.audioContext
        .resume()
        .then(() => {
            logAudioDebug('AudioContext resumed successfully');
            onReady();
        })
        .catch((error) => {
            console.warn('Failed to resume AudioContext:', error);
            onReady();
        });
}

export function playStandardAudio(manager, audioType, audioElement) {
    resumeAudioContextIfNeeded(manager, () => {
        playHtmlAudioElement(manager, audioType, audioElement);
    });
}
