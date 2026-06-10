export function showSpellingComboEffect(combo, root = document) {
    if (combo <= 1) return;

    const comboText = root.createElement('div');
    comboText.className = 'spelling-combo-effect';
    comboText.textContent = `${combo} COMBO!`;

    root.body.appendChild(comboText);
    setTimeout(() => {
        comboText.parentNode?.removeChild(comboText);
    }, 1000);
}
