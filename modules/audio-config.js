export const AUDIO_DEFINITIONS = {
    success: {
        src: './success.mp3',
        volumeMultiplier: 0.5,
    },
    timeup: {
        src: './timeup.mp3',
    },
    start: {
        src: './start.mp3',
    },
    fail: {
        src: './fail.mp3',
    },
    clear: {
        src: './clear.mp3',
    },
    random: {
        src: './random.mp3',
    },
    click: {
        src: './click.mp3',
    },
    slotWin: {
        src: './hit.mp3',
        volumeMultiplier: 1.4,
    },
    great: {
        src: './great.mp3',
        volumeMultiplier: 1.2,
    },
};

export function getDefaultSfxVolume(userAgent = navigator.userAgent) {
    const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            userAgent
        );

    return isMobile ? 0.15 : 0.3;
}

export function getAudioVolume(baseVolume, definition = {}) {
    const multiplier = definition.volumeMultiplier ?? 1;

    return Math.min(1, baseVolume * multiplier);
}
