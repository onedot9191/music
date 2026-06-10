function toggleAccordion(header, { CONSTANTS, focusFirstInput }) {
    const accordion = header.closest('.accordion');
    const targetSection = header.nextElementSibling;

    if (!accordion || !targetSection) return;

    const isExpanded = header.getAttribute('aria-expanded') === 'true';

    accordion
        .querySelectorAll('.accordion-header')
        .forEach((currentHeader) =>
            currentHeader.setAttribute('aria-expanded', 'false')
        );

    accordion
        .querySelectorAll('section')
        .forEach((section) =>
            section.classList.remove(CONSTANTS.CSS_CLASSES.ACTIVE)
        );

    if (isExpanded) return;

    header.setAttribute('aria-expanded', 'true');
    targetSection.classList.add(CONSTANTS.CSS_CLASSES.ACTIVE);
    focusFirstInput(targetSection);
}

export function bindAccordionEvents({
    CONSTANTS,
    focusFirstInput,
    root = document,
}) {
    root.querySelectorAll('.accordion-header').forEach((header) => {
        header.addEventListener('click', () =>
            toggleAccordion(header, { CONSTANTS, focusFirstInput })
        );

        header.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;

            event.preventDefault();
            toggleAccordion(header, { CONSTANTS, focusFirstInput });
        });
    });
}
