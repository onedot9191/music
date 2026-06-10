function findById(root, id) {
    return root.getElementById?.(id) || root.querySelector?.(`#${id}`);
}

export function updateSpellingProgress({
    currentQuestionIndex,
    totalQuestions,
    root = document,
}) {
    const currentEl = findById(root, 'spelling-current-progress');
    const totalEl = findById(root, 'spelling-total-questions');
    const progressFill = findById(root, 'spelling-progress-fill');

    if (!currentEl || !totalEl || !progressFill) return;

    currentEl.textContent = currentQuestionIndex + 1;
    totalEl.textContent = totalQuestions;
    progressFill.style.width = `${
        ((currentQuestionIndex + 1) / totalQuestions) * 100
    }%`;
}

export function animateSpellingProgress({ root = document } = {}) {
    const progressContainer = findById(root, 'spelling-progress-container');
    const progressFill = findById(root, 'spelling-progress-fill');

    if (!progressContainer || !progressFill) return;

    progressContainer.classList.add('progress-increase');
    progressFill.classList.add('fill-animation');

    setTimeout(() => {
        progressContainer.classList.remove('progress-increase');
        progressFill.classList.remove('fill-animation');
    }, 600);
}
