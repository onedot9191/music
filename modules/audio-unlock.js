import { logAudioDebug } from './audio-debug.js';

export function unlockAudioContext(manager) {
    manager.audioUnlockAttempts += 1;
    logAudioDebug(`Audio unlock attempt ${manager.audioUnlockAttempts}`);

    if (manager.audioContext.state === 'suspended') {
        manager.audioContext
            .resume()
            .then(() => {
                logAudioDebug('AudioContext successfully resumed');
            })
            .catch((error) => {
                console.error('Failed to resume AudioContext:', error);
            });
    }

    if (manager.audioUnlockAttempts >= manager.MAX_UNLOCK_ATTEMPTS) {
        removeAudioUnlockEvents(manager);
        logAudioDebug(
            'Audio unlock event listeners removed after max attempts'
        );
    }
}

export function setupAudioUnlockEvents(manager) {
    document.body.addEventListener('click', manager.unlockHandler);
    document.body.addEventListener('touchend', manager.unlockHandler);
    document.body.addEventListener('keydown', manager.unlockHandler);
}

export function removeAudioUnlockEvents(manager) {
    document.body.removeEventListener('click', manager.unlockHandler);
    document.body.removeEventListener('touchend', manager.unlockHandler);
    document.body.removeEventListener('keydown', manager.unlockHandler);
}
