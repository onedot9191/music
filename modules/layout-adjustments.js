import {
    adjustBasicTopicInputWidths as adjustBasicTopicInputWidthsForLayout,
    adjustCreativeInputWidths as adjustCreativeInputWidthsForLayout,
    adjustCurriculumInputWidths as adjustCurriculumInputWidthsForLayout,
    adjustEnglishInputWidths as adjustEnglishInputWidthsForLayout,
} from './layout-input-widths.js';
import {
    setupCreativeQuestionTextReveal as setupCreativeQuestionTextRevealForLayout,
    shuffleSocialityFunctionList as shuffleSocialityFunctionListForLayout,
    wrapScienceInquiryActivities as wrapScienceInquiryActivitiesForLayout,
} from './layout-subject-transforms.js';

export function createLayoutAdjustments({
    CONSTANTS,
    gameState,
    getMainElementId,
    isSpellingBlankMode,
    settingsPanel,
    shouldUseAdaptiveInputWidth,
}) {
    const sharedContext = {
        CONSTANTS,
        gameState,
        getMainElementId,
        root: document,
    };

    function adjustCreativeInputWidths() {
        adjustCreativeInputWidthsForLayout(sharedContext);
    }

    function setupCreativeQuestionTextReveal() {
        setupCreativeQuestionTextRevealForLayout(sharedContext);
    }

    function wrapScienceInquiryActivities() {
        wrapScienceInquiryActivitiesForLayout(sharedContext);
    }

    function adjustEnglishInputWidths() {
        adjustEnglishInputWidthsForLayout(sharedContext);
    }

    function adjustBasicTopicInputWidths() {
        adjustBasicTopicInputWidthsForLayout(sharedContext);
    }

    function adjustCurriculumInputWidths() {
        adjustCurriculumInputWidthsForLayout(sharedContext);
    }

    function shuffleSocialityFunctionList() {
        shuffleSocialityFunctionListForLayout(sharedContext);
    }

    function fixSettingsPanelHeight() {
        if (settingsPanel.dataset.fixedHeight) return;

        settingsPanel.style.height = 'auto';
        settingsPanel.style.minHeight = 'auto';
        settingsPanel.removeAttribute('data-fixed-height');
    }

    function refreshAdaptiveInputWidths({ includeCurriculum = true } = {}) {
        if (
            !shouldUseAdaptiveInputWidth(
                gameState.selectedSubject,
                CONSTANTS,
                isSpellingBlankMode
            )
        ) {
            return;
        }

        adjustCreativeInputWidths();

        if (includeCurriculum) {
            adjustCurriculumInputWidths();
        }
    }

    return {
        adjustBasicTopicInputWidths,
        adjustCreativeInputWidths,
        adjustCurriculumInputWidths,
        adjustEnglishInputWidths,
        fixSettingsPanelHeight,
        refreshAdaptiveInputWidths,
        setupCreativeQuestionTextReveal,
        shuffleSocialityFunctionList,
        wrapScienceInquiryActivities,
    };
}
