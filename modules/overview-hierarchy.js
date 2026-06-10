function isOperationCriteriaItem(block, currentElement) {
    const blockElements = Array.from(
        block.querySelectorAll('.overview-question, .sub-title, .outline-title')
    );
    const currentIndex = blockElements.indexOf(currentElement);

    return blockElements.some((element, index) => {
        if (index >= currentIndex || !element.classList.contains('sub-title')) {
            return false;
        }

        const text = (element.textContent || '').trim();
        return text.includes('나. 교육과정 편성') && text.includes('운영 기준');
    });
}

function getStandardSectionFlags(element) {
    const block = element.closest('.creative-block');
    if (!block) {
        return {
            inStandardElementaryBlock: false,
            inStandardOperationCriteria: false,
        };
    }

    const titleText = (
        block.querySelector('.outline-title')?.textContent || ''
    ).trim();
    const inStandardElementaryBlock = titleText.startsWith('2. 초등학교');

    return {
        inStandardElementaryBlock,
        inStandardOperationCriteria:
            inStandardElementaryBlock &&
            isOperationCriteriaItem(block, element),
    };
}

function isNatureOrDirectionSubItem(element, textStart) {
    const matchesPattern =
        /^(?:\[[^\]]+\]|[0-9]{1,3}[.)]|[가-힣]{1}[.)]|[①-⑳])/.test(textStart);
    const hasOrdinalMarker =
        element.querySelector('span[data-marker="ordinal"]') !== null;

    return !matchesPattern && !hasOrdinalMarker;
}

function isDesignSubItem(textStart) {
    const isTopKoreanDot = /^[가-힣]\./.test(textStart);
    const isNumericOrCircled = /^(?:[0-9]{1,3}[)]|[①-⑳])/.test(textStart);

    return isTopKoreanDot || !isNumericOrCircled;
}

function isStandardOperationCriteriaSubItem(textStart) {
    const isTopNumericParen = /^[0-9]{1,3}[)]/.test(textStart);
    const isKoreanParen = /^[가-힣][)]/.test(textStart);
    const isCircledNumeric = /^[①-⑳]/.test(textStart);

    return isTopNumericParen && !(isKoreanParen || isCircledNumeric);
}

function isStandardElementarySubItem(textStart) {
    const isTopNumericParen = /^[0-9]{1,3}[)]/.test(textStart);
    const isKoreanParen = /^[가-힣][)]/.test(textStart);
    const isCircledNumeric = /^[①-⑳]/.test(textStart);

    return !isTopNumericParen && (isKoreanParen || isCircledNumeric);
}

function isDefaultOverviewSubItem(textStart) {
    return /^(?:\[[^\]]+\]|[0-9]{1,3}[.)]|[가-힣]{1}[.)]|[①-⑳])/.test(
        textStart
    );
}

function getOverviewQuestionElements(root = document) {
    const overviewMain = root.getElementById('overview-quiz-main');
    const integratedGuideMain = root.getElementById(
        'integrated-guide-overview'
    );

    if (!overviewMain && !integratedGuideMain) return [];

    return [
        ...(overviewMain?.querySelectorAll('.overview-question') || []),
        ...(integratedGuideMain?.querySelectorAll('.overview-question') || []),
    ];
}

function shouldUseSubIndent(element) {
    const textStart = (element.textContent || '').trim();
    const sectionId = element.closest('section')?.id;

    if (sectionId === 'nature' || sectionId === 'direction') {
        element.classList.remove('design-emphasis');
        return isNatureOrDirectionSubItem(element, textStart);
    }

    if (sectionId === 'design') {
        element.classList.remove('design-emphasis');
        return isDesignSubItem(textStart);
    }

    if (sectionId === 'standard') {
        const { inStandardElementaryBlock, inStandardOperationCriteria } =
            getStandardSectionFlags(element);

        if (inStandardOperationCriteria) {
            return isStandardOperationCriteriaSubItem(textStart);
        }

        if (inStandardElementaryBlock) {
            return isStandardElementarySubItem(textStart);
        }
    }

    element.classList.remove('design-emphasis');
    return isDefaultOverviewSubItem(textStart);
}

export function applyOverviewHierarchyIndentation(root = document) {
    getOverviewQuestionElements(root).forEach((element) => {
        const isSub = shouldUseSubIndent(element);

        element.classList.remove('overview-top', 'overview-sub');
        element.classList.add(isSub ? 'overview-sub' : 'overview-top');
        element.classList.remove('standard-emphasis');
    });
}
