import {
    copyDeferredPngBlobToClipboard,
    isMobileDevice,
    isSafariBrowser,
    supportsClipboardImageWrite,
    writeCanvasToPreferredTarget,
} from './canvas-share-targets.js';
import {
    createResultCaptureOptions,
    createTabCaptureOptions,
} from './result-capture-options.js';
import {
    setButtonLoading,
    setButtonsLoading,
    setButtonTextUnlessLoading,
} from './button-loading-state.js';
import { revealSectionForCapture } from './hidden-section-capture.js';

const CAPTURE_CACHE_DURATION = 5000;

const getResultHash = (modalContent) => {
    const resultText = modalContent.textContent || '';
    return resultText.length + resultText.slice(0, 100);
};

export function bindResultImageActions({
    CONSTANTS,
    closeModal,
    progressModal,
    root = document,
    scrapResultImageBtn,
    scrapResultImageBtnTop,
    openModal,
}) {
    const resultButtons = [scrapResultImageBtn, scrapResultImageBtnTop].filter(
        Boolean
    );
    let lastCaptureTime = 0;
    let cachedCanvas = null;
    let lastResultHash = null;

    const setLoadingState = (loading) =>
        setButtonsLoading(resultButtons, loading);

    const rememberCapture = (canvas, modalContent) => {
        cachedCanvas = canvas;
        lastCaptureTime = Date.now();
        lastResultHash = getResultHash(modalContent);
    };

    const handleScrapResultImage = async () => {
        const modalContent = root.querySelector(
            '#progress-modal .modal-content'
        );
        if (!modalContent) return;

        const wasHidden = !progressModal.classList.contains(
            CONSTANTS.CSS_CLASSES.ACTIVE
        );

        if (
            isSafariBrowser() &&
            !isMobileDevice() &&
            supportsClipboardImageWrite()
        ) {
            try {
                setLoadingState(true);

                if (wasHidden) {
                    openModal(progressModal);
                    await new Promise((resolve) =>
                        requestAnimationFrame(resolve)
                    );
                }

                const copied = await copyDeferredPngBlobToClipboard(
                    async () => {
                        const canvas = await html2canvas(
                            modalContent,
                            createResultCaptureOptions(modalContent)
                        );
                        rememberCapture(canvas, modalContent);
                        return (
                            await fetch(canvas.toDataURL('image/png'))
                        ).blob();
                    }
                );

                alert(
                    copied
                        ? '결과 이미지가 복사되었습니다!'
                        : '클립보드 복사에 실패했습니다. 다시 시도해주세요.'
                );
                return;
            } catch (error) {
                console.error('Safari clipboard failed:', error);
                alert('클립보드 복사에 실패했습니다. 다시 시도해주세요.');
                return;
            } finally {
                setLoadingState(false);
                if (wasHidden) closeModal(progressModal);
            }
        }

        setLoadingState(true);
        document.body.offsetHeight;
        await new Promise((resolve) => setTimeout(resolve, 0));

        if (wasHidden) {
            openModal(progressModal);
            await new Promise((resolve) => requestAnimationFrame(resolve));
        }

        try {
            const currentResultHash = getResultHash(modalContent);
            const isCacheValid =
                cachedCanvas &&
                Date.now() - lastCaptureTime < CAPTURE_CACHE_DURATION &&
                lastResultHash === currentResultHash;
            const canvas = isCacheValid
                ? cachedCanvas
                : await html2canvas(
                      modalContent,
                      createResultCaptureOptions(modalContent)
                  );

            if (!isCacheValid) {
                rememberCapture(canvas, modalContent);
            }

            await writeCanvasToPreferredTarget(canvas, {
                shared: '결과 이미지가 공유되었습니다!',
                copied: '결과 이미지가 복사되었습니다!',
                textFallback:
                    '이미지 데이터가 복사되었습니다!\n(일부 앱에서는 이미지로 붙여넣기가 안될 수 있습니다)',
            });
        } catch (error) {
            console.error('Image capture failed:', error);
            alert('이미지 캡처에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setLoadingState(false);
            if (wasHidden) closeModal(progressModal);
        }
    };

    const handleTabCopy = async (tabId) => {
        const section = root.getElementById(tabId);
        if (!section) {
            alert('탭을 찾을 수 없습니다.');
            return;
        }

        const copyButton = section.querySelector('.copy-tab-btn');

        setButtonLoading(copyButton, true);
        const restoreSectionVisibility = revealSectionForCapture(section);

        await new Promise((resolve) => requestAnimationFrame(resolve));
        await new Promise((resolve) => setTimeout(resolve, 100));

        try {
            const canvas = await html2canvas(
                section,
                createTabCaptureOptions(tabId, section)
            );

            await writeCanvasToPreferredTarget(canvas, {
                shared: '탭 내용이 공유되었습니다!',
                copied: '탭 내용이 복사되었습니다!',
                textFallback:
                    '탭 이미지 데이터가 복사되었습니다!\n(일부 앱에서는 이미지로 붙여넣기가 안될 수 있습니다)',
            });
        } catch (error) {
            console.error('Tab copy failed:', error);
            alert('이미지 캡처에 실패했습니다. 다시 시도해주세요.');
        } finally {
            restoreSectionVisibility();
            setButtonLoading(copyButton, false);
        }
    };

    const updateCopyButtonText = () => {
        const buttonText = isMobileDevice() ? '결과창 공유' : '결과창 복사';
        resultButtons.forEach((btn) => {
            btn.textContent = buttonText;
        });

        const tabButtonText = isMobileDevice()
            ? '📋 섹션 공유'
            : '📋 섹션 복사';
        root.querySelectorAll('.copy-tab-btn').forEach((btn) => {
            setButtonTextUnlessLoading(btn, tabButtonText);
        });
    };

    updateCopyButtonText();
    resultButtons.forEach((btn) =>
        btn.addEventListener('click', handleScrapResultImage)
    );
    root.querySelectorAll('.copy-tab-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            if (tabId) handleTabCopy(tabId);
        });
    });

    return {
        handleScrapResultImage,
        handleTabCopy,
        updateCopyButtonText,
    };
}
