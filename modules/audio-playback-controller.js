export function createAudioPlaybackController({
    audioManager,
    isSoundEnabled = () => window.isSoundEnabled?.() !== false,
}) {
    function playSound(audioElement) {
        if (!isSoundEnabled()) {
            return;
        }

        if (!audioElement || typeof audioElement.play !== 'function') {
            console.error('Provided element is not a valid audio element.');
            return;
        }

        const audioType = Object.keys(audioManager.audioElements).find(
            (key) => audioManager.audioElements[key] === audioElement
        );

        if (audioType) {
            audioManager.playSound(audioType);
            return;
        }

        const play = () => {
            try {
                audioElement.currentTime = 0;
                const playPromise = audioElement.play();
                if (playPromise !== undefined) {
                    playPromise.catch((err) => {
                        console.error(
                            `Audio playback failed for ${audioElement.src}:`,
                            err
                        );
                        if (err.name === 'NotAllowedError') {
                            console.warn(
                                'Audio autoplay was prevented. User interaction may be required.'
                            );
                        }
                    });
                }
            } catch (err) {
                console.error(`Error playing audio ${audioElement.src}:`, err);
            }
        };

        if (audioManager.audioContext?.state === 'suspended') {
            audioManager.audioContext
                .resume()
                .then(() => play())
                .catch((err) => {
                    console.warn('Failed to resume AudioContext:', err);
                    play();
                });
            return;
        }

        play();
    }

    return { playSound };
}
