// Main application DOM references kept in one place.

export function createDomRefs() {
    const slotMachineEl = document.getElementById('slot-machine');

    return {
        timeEl: document.getElementById('time'),
        barEl: document.querySelector('#bar > div'),
        comboCounter: document.getElementById('combo-counter'),
        startGameBtn: document.getElementById('start-game-btn'),
        forceQuitBtn: document.getElementById('force-quit-btn'),
        resetBtn: document.getElementById('reset-btn'),
        character: document.getElementById('character-assistant'),
        headerTitle: document.getElementById('header-title'),
        stageClearModal: document.getElementById('stage-clear-modal'),
        progressModal: document.getElementById('progress-modal'),
        closeProgressModalBtn: document.getElementById(
            'close-progress-modal-btn'
        ),
        scrapResultImageBtn: document.getElementById('scrap-result-image-btn'),
        scrapResultImageBtnTop: document.getElementById(
            'scrap-result-image-btn-top'
        ),
        startModal: document.getElementById('start-modal'),
        settingsPanel: document.getElementById('settings-panel'),
        timeSettingDisplay: document.getElementById('time-setting-display'),
        decreaseTimeBtn: document.getElementById('decrease-time'),
        increaseTimeBtn: document.getElementById('increase-time'),
        timeSetterWrapper: document.getElementById('time-setter-wrapper'),
        modeSelector: document.querySelector('.mode-selector'),
        topicSelector: document.querySelector('.topic-selector'),
        subjectSelector: document.querySelector('.subject-selector'),
        subjectSelectionTitle: document.getElementById(
            'subject-selection-title'
        ),
        topicSelectionTitle: document.getElementById('topic-selection-title'),
        curriculumBreak: document.getElementById('curriculum-break'),
        modelBreak: document.getElementById('model-break'),
        quizContainers: document.querySelectorAll(
            'main[id$="-quiz-main"], #integrated-guide-overview'
        ),
        modalCharacterPlaceholder: document.getElementById(
            'modal-character-placeholder'
        ),
        speechBubble: document.querySelector('.speech-bubble'),
        resultDialogue: document.getElementById('result-dialogue'),
        resultTitle: document.getElementById('result-title'),
        resultSubject: document.getElementById('result-subject'),
        resultTopic: document.getElementById('result-topic'),
        resultProgress: document.getElementById('result-progress'),
        resultPercentage: document.getElementById('result-percentage'),
        slotMachineEl,
        slotReels: slotMachineEl.querySelectorAll('.reel'),
    };
}
