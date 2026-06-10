export function revealSectionForCapture(section) {
    const wasHidden = !section.classList.contains('active');
    const originalStyles = {
        display: section.style.display,
        position: section.style.position,
        left: section.style.left,
        top: section.style.top,
    };

    if (wasHidden) {
        section.style.position = 'absolute';
        section.style.left = '-9999px';
        section.style.top = '0';
        section.classList.add('active');
        section.style.display = 'block';
    }

    return () => {
        if (!wasHidden) return;

        section.classList.remove('active');
        section.style.display = originalStyles.display;
        section.style.position = originalStyles.position;
        section.style.left = originalStyles.left;
        section.style.top = originalStyles.top;
    };
}
