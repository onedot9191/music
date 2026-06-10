export function createAudioRefs(audioManager) {
    return {
        successAudio: audioManager.audioElements.success,
        timeupAudio: audioManager.audioElements.timeup,
        startAudio: audioManager.audioElements.start,
        failAudio: audioManager.audioElements.fail,
        clearAudio: audioManager.audioElements.clear,
        randomAudio: audioManager.audioElements.random,
        clickAudio: audioManager.audioElements.click,
        slotWinAudio: audioManager.audioElements.slotWin,
        specialBlankAudio: audioManager.audioElements.great,
    };
}
