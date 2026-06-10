const SOUND_ENABLED_KEY = 'soundEnabled';
let soundEnabled = true;

function readSoundEnabled() {
    const saved = localStorage.getItem(SOUND_ENABLED_KEY);
    if (saved === null) {
        localStorage.setItem(SOUND_ENABLED_KEY, 'true');
        return true;
    }

    try {
        return JSON.parse(saved) === true;
    } catch {
        localStorage.setItem(SOUND_ENABLED_KEY, 'true');
        return true;
    }
}

function saveSoundEnabled(value) {
    soundEnabled = value;
    localStorage.setItem(SOUND_ENABLED_KEY, JSON.stringify(value));
}

function syncSoundToggle() {
    const toggle = document.getElementById('sound-toggle');
    if (toggle) {
        toggle.checked = soundEnabled;
    }

    updateSoundToggleText();
}

function updateSoundToggleText() {
    const toggle = document.getElementById('sound-toggle');
    const text = document.querySelector('.sound-toggle-text');
    if (text) {
        text.textContent = toggle && toggle.checked ? 'On' : 'Off';
    }
}

function animateToggleFeedback() {
    const container = document.getElementById('sound-toggle-container');
    if (!container) return;

    container.style.transform = 'scale(0.95)';
    setTimeout(() => {
        container.style.transform = 'scale(1)';
    }, 150);
}

window.isSoundEnabled = () => soundEnabled;

document.addEventListener('DOMContentLoaded', () => {
    soundEnabled = readSoundEnabled();
    syncSoundToggle();

    const soundToggle = document.getElementById('sound-toggle');
    if (!soundToggle) return;

    soundToggle.addEventListener('change', () => {
        saveSoundEnabled(soundToggle.checked);
        updateSoundToggleText();
        animateToggleFeedback();
    });
});
