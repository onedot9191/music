const CREATIVE_WIDTH_SELECTOR = [
    '#creative-quiz-main .creative-question input[data-answer]',
    '#overview-quiz-main .overview-question input[data-answer]',
    '#integrated-course-quiz-main .overview-question input[data-answer]',
    '#moral-course-quiz-main .overview-question input[data-answer]',
    '#eastern-ethics-quiz-main .overview-question input[data-answer]',
    '#western-ethics-quiz-main .overview-question input[data-answer]',
    '#moral-psychology-quiz-main .overview-question input[data-answer]',
    '#pe-course-quiz-main .overview-question input[data-answer]',
    '#pe-back-quiz-main .pe-back-input',
    '#science-std-quiz-main .overview-question input[data-answer]',
    '#english-std-quiz-main .overview-question input[data-answer]',
    '#practical-std-quiz-main .overview-question input[data-answer]',
    '#practical-std-quiz-main #info-education .overview-question input[data-answer]',
    '#social-34-quiz-main .overview-question input[data-answer]',
    '#social-56-quiz-main .overview-question input[data-answer]',
    '#life-achievement-quiz-main .overview-question input[data-answer]',
    '#wise-achievement-quiz-main .overview-question input[data-answer]',
    '#joy-achievement-quiz-main .overview-question input[data-answer]',
    '#music-std-quiz-main .overview-question input[data-answer]',
    '#korean-std-quiz-main .overview-question input[data-answer]',
    '#art-std-quiz-main .overview-question input[data-answer]',
    '#math-operation-quiz-main .overview-question input[data-answer]',
    '#change-relation-quiz-main .overview-question input[data-answer]',
    '#geometry-measure-quiz-main .overview-question input[data-answer]',
    '#geometry-quiz-main .overview-question input[data-answer]',
    '#data-probability-quiz-main .overview-question input[data-answer]',
    '#math-course-quiz-main .overview-question input[data-answer]',
    '#science-course-quiz-main .overview-question input[data-answer]',
    '#practical-course-quiz-main .overview-question input[data-answer]',
    '#music-course-quiz-main .overview-question input[data-answer]',
    '#english-course-quiz-main .overview-question input[data-answer]',
    '#art-course-quiz-main .overview-question input[data-answer]',
    '#korean-course-quiz-main .overview-question input[data-answer]',
    '#integrated-guide-overview .overview-question input[data-answer]',
].join(', ');

function findById(root, id) {
    return root.getElementById?.(id) || root.querySelector?.(`#${id}`);
}

function hasHangul(text) {
    return /[\u3131-\uD79D]/.test(text);
}

export function desiredWidthForAnswer(
    input,
    { hangulFactor = 1.8, latinFactor = 1.3, scale = 1 } = {}
) {
    const answer = input.dataset.answer || '';
    const factor = hasHangul(answer) ? hangulFactor : latinFactor;
    const base = Math.max(2, Math.ceil(answer.length * factor) + 4);

    return Math.max(2, Math.floor(base * scale));
}

export function growInputWidth(input, desired) {
    const inlineWidth = parseInt(input.style.width, 10) || 0;
    const attrSize = parseInt(input.getAttribute('size'), 10) || 0;

    if (Math.max(inlineWidth, attrSize) >= desired) return;

    input.setAttribute('size', desired);
    input.style.width = `${desired}ch`;
}

export function setInputWidth(input, desired) {
    input.setAttribute('size', desired);
    input.style.width = `${desired}ch`;
}

export function adjustCreativeInputWidths({ root = document } = {}) {
    root.querySelectorAll(CREATIVE_WIDTH_SELECTOR).forEach((input) => {
        const isPECourse = input.closest('#pe-course-quiz-main') !== null;
        const isGeometryCourse = input.closest('#geometry-quiz-main') !== null;
        const hangulFactor = isPECourse ? 1.5 : isGeometryCourse ? 1.4 : 1.6;

        growInputWidth(
            input,
            desiredWidthForAnswer(input, { hangulFactor, latinFactor: 1.3 })
        );
    });
}

export function adjustEnglishInputWidths({ root = document } = {}) {
    root.querySelectorAll('#english-quiz-main input[data-answer]').forEach(
        (input) => {
            setInputWidth(
                input,
                desiredWidthForAnswer(input, {
                    hangulFactor: 1.8,
                    latinFactor: 1.3,
                    scale: 0.8,
                })
            );
        }
    );
}

export function adjustBasicTopicInputWidths({
    CONSTANTS,
    gameState,
    getMainElementId,
    root = document,
}) {
    if (gameState.selectedTopic !== CONSTANTS.TOPICS.BASIC) return;

    const mainId = getMainElementId();

    root.querySelectorAll(`#${mainId} input[data-answer]`).forEach((input) => {
        const desired = desiredWidthForAnswer(input, {
            hangulFactor: 1.8,
            latinFactor: 1.3,
            scale: mainId === 'english-quiz-main' ? 0.8 : 1,
        });

        if (mainId === 'english-quiz-main') {
            setInputWidth(input, desired);
        } else {
            growInputWidth(input, desired);
        }
    });
}

export function adjustCurriculumInputWidths({
    CONSTANTS,
    gameState,
    getMainElementId,
    root = document,
}) {
    if (gameState.selectedTopic !== CONSTANTS.TOPICS.CURRICULUM) return;

    const main = findById(root, getMainElementId());
    if (!main) return;

    main.querySelectorAll('input[data-answer]').forEach((input) => {
        if (input.closest('[data-inline-order-editor]')) {
            const desired = desiredWidthForAnswer(input, {
                hangulFactor: 1.6,
                latinFactor: 1.3,
            });

            input.removeAttribute('size');
            input.style.setProperty('display', 'inline-block', 'important');
            input.style.setProperty('box-sizing', 'border-box', 'important');
            input.style.setProperty('width', `${desired}ch`, 'important');
            input.style.setProperty('min-width', `${desired}ch`, 'important');
            input.style.setProperty('max-width', 'none', 'important');
            return;
        }

        input.removeAttribute('size');
        input.style.setProperty('display', 'block', 'important');
        input.style.setProperty('box-sizing', 'border-box', 'important');
        input.style.setProperty('width', '100%', 'important');
        input.style.setProperty('min-width', '100%', 'important');
        input.style.setProperty('max-width', '100%', 'important');
    });
}
