const MODEL_TITLE_SECTION_IDS = new Set([
    'pe-title',
    'ethics-title',
    'art-title',
    'math-title',
    'science-title',
    'social-title',
    'korean-title',
]);

const REVEAL_BUTTON_MAIN_IDS = new Set([
    'integrated-model-quiz-main',
    'art-basic-quiz-main',
    'eastern-ethics-quiz-main',
    'western-ethics-quiz-main',
    'moral-psychology-quiz-main',
    'geometry-quiz-main',
]);

const COURSE_REVEAL_MAIN_IDS = new Set([
    'overview-quiz-main',
    'creative-quiz-main',
    'social-course-quiz-main',
    'science-course-quiz-main',
    'english-course-quiz-main',
    'korean-course-quiz-main',
    'practical-course-quiz-main',
    'music-course-quiz-main',
    'art-course-quiz-main',
]);

export function getMainId(element) {
    return element.closest('main')?.id || '';
}

export function getSectionId(element) {
    return element.closest('section')?.id || '';
}

export function isIntegratedModelInput(element) {
    return getMainId(element) === 'integrated-model-quiz-main';
}

export function isIntegratedTitleInput(element) {
    return getSectionId(element) === 'integrated-title';
}

export function isPracticalTitleInput(element) {
    return getSectionId(element) === 'practical-title';
}

export function isGenericModelTitleInput(element) {
    return MODEL_TITLE_SECTION_IDS.has(getSectionId(element));
}

export function shouldShowRevealButtonForMain(element) {
    return REVEAL_BUTTON_MAIN_IDS.has(getMainId(element));
}

export function shouldShowRevealButtonForCourse(element) {
    return COURSE_REVEAL_MAIN_IDS.has(getMainId(element));
}
