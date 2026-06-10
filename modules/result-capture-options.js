function resetCloneAnimations(element) {
    element.querySelectorAll('*').forEach((child) => {
        child.style.transition = 'none';
        child.style.animation = 'none';
        child.style.transform = 'none';
        child.style.boxShadow = 'none';
        child.style.filter = 'none';
    });
}

function shouldIgnoreCaptureElement(element) {
    return (
        element.classList.contains('loading') ||
        element.classList.contains('hidden') ||
        element.style.display === 'none' ||
        element.style.visibility === 'hidden'
    );
}

export function replaceInputsWithTextBlocks(
    clonedDoc,
    clonedSection,
    originalSection
) {
    const inputs = clonedSection.querySelectorAll('input[data-answer]');

    inputs.forEach((input, index) => {
        const originalInput =
            originalSection.querySelectorAll('input[data-answer]')[index];
        if (!originalInput) return;

        const replacement = clonedDoc.createElement('div');
        const computedStyle = window.getComputedStyle(originalInput);

        replacement.style.cssText = input.style.cssText;
        replacement.style.display = 'inline-block';
        replacement.style.border = computedStyle.border;
        replacement.style.borderRadius = computedStyle.borderRadius;
        replacement.style.padding = computedStyle.padding;
        replacement.style.fontSize = computedStyle.fontSize;
        replacement.style.fontFamily = computedStyle.fontFamily;
        replacement.style.fontWeight = computedStyle.fontWeight;
        replacement.style.color = computedStyle.color;
        replacement.style.backgroundColor = computedStyle.backgroundColor;
        replacement.style.textAlign = 'center';
        replacement.style.verticalAlign = 'middle';
        replacement.style.lineHeight = computedStyle.lineHeight;
        replacement.style.minWidth = computedStyle.width;
        replacement.style.minHeight = computedStyle.height;
        replacement.style.boxSizing = 'border-box';
        replacement.textContent =
            originalInput.value || originalInput.placeholder || '';
        replacement.className = input.className;

        input.parentNode?.replaceChild(replacement, input);
    });
}

export function createResultCaptureOptions(modalContent, onCaptured) {
    return {
        backgroundColor: '#ffffff',
        scale: 1.2,
        logging: false,
        removeContainer: true,
        imageTimeout: 3000,
        useCORS: false,
        allowTaint: true,
        foreignObjectRendering: false,
        ignoreElements: shouldIgnoreCaptureElement,
        onclone: (clonedDoc) => {
            const clonedContent = clonedDoc.querySelector('.modal-content');
            if (!clonedContent) return;

            resetCloneAnimations(clonedContent);
            clonedContent.style.fontDisplay = 'swap';
            onCaptured?.(modalContent);
        },
    };
}

export function createTabCaptureOptions(tabId, originalSection) {
    return {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        removeContainer: true,
        imageTimeout: 3000,
        useCORS: false,
        allowTaint: true,
        foreignObjectRendering: false,
        ignoreElements: (element) =>
            shouldIgnoreCaptureElement(element) ||
            element.classList.contains('copy-tab-btn'),
        onclone: (clonedDoc) => {
            const clonedSection = clonedDoc.getElementById(tabId);
            if (!clonedSection) return;

            const clonedBtn = clonedSection.querySelector('.copy-tab-btn');
            if (clonedBtn) {
                clonedBtn.style.display = 'none';
            }

            resetCloneAnimations(clonedSection);
            replaceInputsWithTextBlocks(
                clonedDoc,
                clonedSection,
                originalSection
            );
            clonedSection.style.fontDisplay = 'swap';
        },
    };
}
