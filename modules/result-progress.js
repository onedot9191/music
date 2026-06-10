export function getResultProgressRefs(documentRef = document) {
    return {
        correctCount: documentRef.getElementById('correct-count'),
        totalCount: documentRef.getElementById('total-count'),
        progressBar: documentRef.getElementById('result-progress'),
        percentage: documentRef.getElementById('result-percentage'),
    };
}

export function calculatePercentage(correctCount, totalCount) {
    return totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
}

export function readResultProgress(documentRef = document) {
    const refs = getResultProgressRefs(documentRef);

    return {
        correctCount: parseInt(refs.correctCount?.textContent, 10) || 0,
        totalCount: parseInt(refs.totalCount?.textContent, 10) || 0,
    };
}

export function setResultProgress(
    correctCount,
    totalCount,
    documentRef = document
) {
    const refs = getResultProgressRefs(documentRef);
    const percentage = calculatePercentage(correctCount, totalCount);

    if (refs.correctCount) refs.correctCount.textContent = correctCount;
    if (refs.totalCount) refs.totalCount.textContent = totalCount;
    if (refs.progressBar) refs.progressBar.style.width = `${percentage}%`;
    if (refs.percentage) refs.percentage.textContent = `${percentage}%`;

    return percentage;
}

export function resetResultProgress(documentRef = document) {
    return setResultProgress(0, 0, documentRef);
}

export function addResultProgress(
    correctCount,
    totalCount,
    documentRef = document
) {
    const current = readResultProgress(documentRef);

    return setResultProgress(
        current.correctCount + correctCount,
        current.totalCount + totalCount,
        documentRef
    );
}
