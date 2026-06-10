export const MODEL_GATE_CONFIGS = [
    { mainId: 'pe-model-quiz-main', titleId: 'pe-title' },
    { mainId: 'ethics-quiz-main', titleId: 'ethics-title' },
    { mainId: 'korean-model-quiz-main', titleId: 'korean-title' },
    { mainId: 'art-model-quiz-main', titleId: 'art-title' },
    { mainId: 'math-model-quiz-main', titleId: 'math-title' },
    { mainId: 'social-quiz-main', titleId: 'social-title' },
    { mainId: 'science-quiz-main', titleId: 'science-title' },
    { mainId: 'science-curriculum-quiz-main', titleId: 'science-title' },
];

export const MODEL_NEXT_BUTTON_CONFIGS = MODEL_GATE_CONFIGS.map((config) => ({
    ...config,
    btnId: `${config.titleId}-next-btn`,
}));

export function createModelConfigBySubject(CONSTANTS) {
    return {
        [CONSTANTS.SUBJECTS.PRACTICAL]: {
            mainId: 'practical-quiz-main',
            titleId: 'practical-title',
        },
        [CONSTANTS.SUBJECTS.PE_MODEL]: MODEL_GATE_CONFIGS[0],
        [CONSTANTS.SUBJECTS.ETHICS]: MODEL_GATE_CONFIGS[1],
        [CONSTANTS.SUBJECTS.KOREAN_MODEL]: MODEL_GATE_CONFIGS[2],
        [CONSTANTS.SUBJECTS.ART_MODEL]: MODEL_GATE_CONFIGS[3],
        [CONSTANTS.SUBJECTS.MATH_MODEL]: MODEL_GATE_CONFIGS[4],
        [CONSTANTS.SUBJECTS.SOCIAL]: MODEL_GATE_CONFIGS[5],
        [CONSTANTS.SUBJECTS.SCIENCE]: MODEL_GATE_CONFIGS[6],
        [CONSTANTS.SUBJECTS.SCIENCE_CURRICULUM]: MODEL_GATE_CONFIGS[7],
    };
}

function setSectionGate(section, shouldGate) {
    section.style.opacity = shouldGate ? '0.2' : '';
    section.style.pointerEvents = shouldGate ? 'none' : '';
    section.classList.toggle('practical-section-disabled', shouldGate);
}

function setTabGate(tab, shouldGate) {
    tab.classList.toggle('practical-disabled', shouldGate);
}

function shouldKeepAnsweredInputDisabled(input) {
    return (
        input.classList.contains('correct') ||
        input.classList.contains('incorrect')
    );
}

export function applyInitialModelGate(main, titleId) {
    if (!main) return;

    main.querySelectorAll('section').forEach((section) => {
        if (section.id === titleId) return;

        section
            .querySelectorAll('input[data-answer]')
            .forEach((input) => (input.disabled = true));

        setSectionGate(section, true);
    });

    main.querySelectorAll('.tabs .tab').forEach((tab) => {
        if (tab.dataset.target !== titleId) {
            setTabGate(tab, true);
        }
    });
}

export function applyModelTitleGate(main, tabsContainer, titleId, targetId) {
    if (!main || !tabsContainer) return;

    const shouldGate =
        targetId === titleId && main.dataset.titleCleared !== 'true';
    const answersRevealed = main.dataset.answersRevealed === 'true';

    main.querySelectorAll('section').forEach((section) => {
        if (section.id === titleId) return;

        section.querySelectorAll('input[data-answer]').forEach((input) => {
            if (answersRevealed || shouldKeepAnsweredInputDisabled(input)) {
                input.disabled = true;
                return;
            }

            input.disabled = shouldGate;
        });

        setSectionGate(section, shouldGate);
    });

    tabsContainer.querySelectorAll('.tab').forEach((tab) => {
        if (tab.dataset.target !== titleId) {
            setTabGate(tab, shouldGate);
        }
    });
}

export function unlockOtherModelSections(main, titleId) {
    if (!main) return;

    main.dataset.titleCleared = 'true';

    main.querySelectorAll('section').forEach((section) => {
        if (section.id === titleId) return;

        section
            .querySelectorAll('input[data-answer]')
            .forEach((input) => (input.disabled = false));

        setSectionGate(section, false);
    });

    main.querySelectorAll('.tabs .tab').forEach((tab) => {
        setTabGate(tab, false);
    });
}
