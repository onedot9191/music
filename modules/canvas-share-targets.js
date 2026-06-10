// === CANVAS SHARE TARGETS MODULE ===
// 캔버스 이미지를 Web Share 또는 클립보드로 전달하는 브라우저 API 래퍼입니다.

export const isMobileDevice = () =>
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
    );

export const isSafariBrowser = () =>
    /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

export const supportsClipboardImageWrite = () =>
    navigator.clipboard &&
    navigator.clipboard.write &&
    window.ClipboardItem &&
    window.isSecureContext;

export async function shareCanvasImage(canvas) {
    if (!navigator.share || !navigator.canShare) return false;

    try {
        const blob = await canvasToPngBlob(canvas);
        const file = new File([blob], 'quiz-result.png', {
            type: 'image/png',
        });

        if (!navigator.canShare({ files: [file] })) return false;

        await navigator.share({
            title: '퀴즈 결과',
            text: '퀴즈 결과를 공유합니다.',
            files: [file],
        });

        return true;
    } catch (_) {
        return false;
    }
}

export async function copyCanvasImageToClipboard(canvas) {
    if (supportsClipboardImageWrite()) {
        try {
            if (isSafariBrowser()) {
                const dataUrl = canvas.toDataURL('image/png');
                await navigator.clipboard.write([
                    new ClipboardItem({
                        'image/png': fetch(dataUrl).then((res) => res.blob()),
                    }),
                ]);
            } else {
                const blob = await canvasToPngBlob(canvas);
                await navigator.clipboard.write([
                    new ClipboardItem({ [blob.type]: blob }),
                ]);
            }

            return { success: true, method: 'clipboard-api' };
        } catch (_) {
            // fallback below
        }
    }

    if (navigator.clipboard?.writeText) {
        try {
            await navigator.clipboard.writeText(canvas.toDataURL('image/png'));
            return { success: true, method: 'text-dataurl' };
        } catch (_) {
            // fallback below
        }
    }

    try {
        const textArea = document.createElement('textarea');
        textArea.value = canvas.toDataURL('image/png');
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        textArea.setSelectionRange(0, 99999);

        const success = document.execCommand('copy');
        document.body.removeChild(textArea);

        if (success) {
            return { success: true, method: 'legacy-text' };
        }
    } catch (_) {
        // no usable fallback
    }

    return { success: false, method: 'none' };
}

export async function copyDeferredPngBlobToClipboard(createBlob) {
    if (!supportsClipboardImageWrite()) {
        return false;
    }

    try {
        await navigator.clipboard.write([
            new ClipboardItem({
                'image/png': createBlob(),
            }),
        ]);
        return true;
    } catch (_) {
        return false;
    }
}

export const isTextClipboardFallback = (copyResult) =>
    copyResult.method === 'text-dataurl' || copyResult.method === 'legacy-text';

export async function writeCanvasToPreferredTarget(canvas, messages) {
    if (isMobileDevice()) {
        const shareSuccess = await shareCanvasImage(canvas);
        alert(
            shareSuccess
                ? messages.shared
                : '공유에 실패했습니다. 다시 시도해주세요.'
        );
        return;
    }

    const copyResult = await copyCanvasImageToClipboard(canvas);
    if (!copyResult.success) {
        alert('클립보드 복사에 실패했습니다. 다시 시도해주세요.');
        return;
    }

    alert(
        isTextClipboardFallback(copyResult)
            ? messages.textFallback
            : messages.copied
    );
}

async function canvasToPngBlob(canvas) {
    return (await fetch(canvas.toDataURL('image/png'))).blob();
}
