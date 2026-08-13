import { setInputWidthToText } from './dom-utils.js';

export const DEFAULT_CORE_IDEA_BLANK_PARTS = Object.freeze([
    '내가 누구인지',
    '서로 관계를 맺으며',
    '여러 공동체 속에서',
    '삶의 공간을 넓히며',
    '여러 유형의 주기로',
    '과거, 현재, 미래를',
    '경험하고 상상하고 만들며',
    '느끼고 생각하고 표현하며',
]);

const PREFERENCE_KEY = 'integratedCoreIdeaSettings';
const MODES = new Set(['full', 'partial']);

function isBlankPartInAnswer(blankPart, answer) {
    const normalizedBlankPart =
        typeof blankPart === 'string' ? blankPart.trim() : '';

    return Boolean(normalizedBlankPart && answer.includes(normalizedBlankPart));
}

export function normalizeSelectedBlankPart(selectedText, answer) {
    const selectedPart =
        typeof selectedText === 'string'
            ? selectedText
                  .replace(/\s+/g, ' ')
                  .trim()
                  .replace(/[.。]$/, '')
            : '';

    return isBlankPartInAnswer(selectedPart, answer) ? selectedPart : '';
}

function createInput({ answer, ariaLabel, placeholder }) {
    const input = document.createElement('input');
    input.autocomplete = 'off';
    input.className = 'core-idea-input';
    input.dataset.answer = answer;
    input.setAttribute('aria-label', ariaLabel);
    if (placeholder) input.placeholder = placeholder;
    input.type = 'text';
    return input;
}

function getBlankPart(blankPart, answer) {
    const candidate = Array.isArray(blankPart) ? blankPart[0] : blankPart;
    const normalizedPart =
        typeof candidate === 'string' ? candidate.trim() : '';

    return isBlankPartInAnswer(normalizedPart, answer) ? normalizedPart : '';
}

function createPartialPrompt({ answer, ariaLabel, blankPart }) {
    const prompt = document.createDocumentFragment();
    const fragmentIndex = answer.indexOf(blankPart);

    prompt.append(document.createTextNode(answer.slice(0, fragmentIndex)));
    const input = createInput({
        answer: blankPart,
        ariaLabel: `${ariaLabel} 빈칸`,
        placeholder: '빈칸 작성',
    });
    input.classList.add('core-idea-partial-input');
    prompt.append(input);
    prompt.append(
        document.createTextNode(answer.slice(fragmentIndex + blankPart.length))
    );

    return prompt;
}

function createSettingsPrompt({ answer, ariaLabel, blankPart }) {
    const prompt = document.createDocumentFragment();
    const blankStart = answer.indexOf(blankPart);

    if (blankStart === -1) {
        prompt.append(document.createTextNode(answer));
        return prompt;
    }

    const selectedPart = document.createElement('mark');
    selectedPart.className = 'core-idea-selected-part';
    selectedPart.textContent = blankPart;
    selectedPart.setAttribute('aria-label', `${ariaLabel} 현재 빈칸`);
    prompt.append(
        document.createTextNode(answer.slice(0, blankStart)),
        selectedPart,
        document.createTextNode(answer.slice(blankStart + blankPart.length))
    );

    return prompt;
}

export function normalizeCoreIdeaSettings(rawSettings = {}, answers = []) {
    const requestedParts = Array.isArray(rawSettings.blankParts)
        ? rawSettings.blankParts
        : [];

    return {
        blankParts: DEFAULT_CORE_IDEA_BLANK_PARTS.map((defaultPart, index) => {
            const requestedValue = requestedParts[index];
            const answer = answers[index] || '';
            const requestedPart = getBlankPart(requestedValue, answer);

            return requestedPart || defaultPart;
        }),
        mode: MODES.has(rawSettings.mode) ? rawSettings.mode : 'full',
    };
}

export function initializeIntegratedCoreIdeas({
    root = document,
    storageManager,
} = {}) {
    const main = root.getElementById('integrated-core-ideas-quiz-main');
    if (!main || !storageManager) return;

    const rows = Array.from(main.querySelectorAll('[data-core-idea-row]'));
    const answers = rows.map((row) => row.dataset.coreIdeaAnswer || '');
    const modeToggle = main.querySelector('#core-idea-mode-toggle');
    const modeToggleContainer = main.querySelector('.core-idea-mode-toggle');
    const settingsToggle = main.querySelector('#core-idea-settings-toggle');
    const settingsStatus = main.querySelector('#core-idea-settings-status');
    const resetButton = main.querySelector('#core-idea-settings-reset');
    let settings = normalizeCoreIdeaSettings(
        storageManager.getUserPreference(PREFERENCE_KEY, {}),
        answers
    );
    let isConfiguring = false;

    function saveSettings() {
        storageManager.saveUserPreferences({ [PREFERENCE_KEY]: settings });
    }

    function renderPrompt(row, index) {
        const prompt = row.querySelector('[data-core-idea-prompt]');
        const answer = answers[index];
        const ariaLabel = row.dataset.coreIdeaLabel || '핵심 아이디어';

        prompt.replaceChildren();
        prompt.classList.toggle('is-configuring', isConfiguring);
        prompt.removeAttribute('tabindex');
        prompt.removeAttribute('aria-label');
        prompt.removeAttribute('aria-describedby');
        prompt.removeAttribute('contenteditable');
        prompt.removeAttribute('spellcheck');

        if (isConfiguring) {
            prompt.tabIndex = 0;
            prompt.contentEditable = 'true';
            prompt.spellcheck = false;
            prompt.setAttribute('aria-describedby', 'core-idea-settings-help');
            prompt.append(
                createSettingsPrompt({
                    answer,
                    ariaLabel,
                    blankPart: settings.blankParts[index],
                })
            );
            return;
        }

        if (settings.mode === 'partial') {
            prompt.append(
                createPartialPrompt({
                    answer,
                    ariaLabel,
                    blankPart: settings.blankParts[index],
                })
            );
            prompt
                .querySelectorAll('.core-idea-partial-input')
                .forEach((input) =>
                    setInputWidthToText(input, input.dataset.answer)
                );
            return;
        }

        prompt.append(
            createInput({
                answer,
                ariaLabel,
            })
        );
    }

    function render() {
        const isPartialMode = settings.mode === 'partial';

        rows.forEach(renderPrompt);
        modeToggle.checked = isPartialMode;
        modeToggle.setAttribute(
            'aria-label',
            isPartialMode
                ? '부분 모드 켜짐. 전체 모드로 전환'
                : '전체 모드 켜짐. 부분 모드로 전환'
        );
        modeToggleContainer.classList.toggle('is-partial', isPartialMode);
        settingsToggle.hidden = !isPartialMode;
        settingsToggle.textContent = isConfiguring ? '완료' : '빈칸 설정';
        settingsToggle.setAttribute('aria-pressed', String(isConfiguring));
        resetButton.hidden = !isConfiguring;
        main.classList.toggle('is-configuring-core-ideas', isConfiguring);
    }

    modeToggle.addEventListener('change', () => {
        settings.mode = modeToggle.checked ? 'partial' : 'full';
        isConfiguring = false;
        saveSettings();
        render();
    });

    rows.forEach((row, index) => {
        let isDragging = false;

        const hideExistingBlank = () => {
            if (!isConfiguring) return;

            main.classList.add('is-selecting-core-idea-blank');
        };

        const commitSelectedPart = () => {
            if (!isConfiguring) return;

            const prompt = row.querySelector('[data-core-idea-prompt]');
            const selection = window.getSelection();
            const range = selection?.rangeCount
                ? selection.getRangeAt(0)
                : null;
            const selectionIsInSource =
                range &&
                !selection.isCollapsed &&
                prompt.contains(range.commonAncestorContainer);
            const selectedPart = selectionIsInSource
                ? normalizeSelectedBlankPart(
                      selection.toString(),
                      answers[index]
                  )
                : '';

            if (!selectedPart) {
                if (isDragging) renderPrompt(row, index);
                main.classList.remove('is-selecting-core-idea-blank');
                isDragging = false;
                return;
            }

            settings.blankParts[index] = selectedPart;
            saveSettings();
            main.classList.remove('is-selecting-core-idea-blank');
            render();
            isDragging = false;
            selection.removeAllRanges();
            settingsStatus.textContent = '빈칸을 저장했습니다.';
        };

        const cancelSelectedPart = () => {
            if (!isDragging) return;

            main.classList.remove('is-selecting-core-idea-blank');
            renderPrompt(row, index);
            isDragging = false;
            window.getSelection()?.removeAllRanges();
        };

        row.addEventListener('mousedown', () => {
            isDragging = true;
            hideExistingBlank();
            window.addEventListener('mouseup', commitSelectedPart, {
                once: true,
            });
        });
        row.addEventListener('touchstart', () => {
            isDragging = true;
            hideExistingBlank();
            window.addEventListener(
                'touchend',
                () => {
                    requestAnimationFrame(commitSelectedPart);
                },
                { once: true }
            );
            window.addEventListener('touchcancel', cancelSelectedPart, {
                once: true,
            });
        });
        row.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') commitSelectedPart();
        });
        row.addEventListener('beforeinput', (event) => {
            if (isConfiguring) event.preventDefault();
        });
    });

    settingsToggle.addEventListener('click', () => {
        isConfiguring = !isConfiguring;
        render();
        settingsStatus.textContent = isConfiguring
            ? '문장에서 빈칸으로 만들 구절을 드래그해 선택하세요.'
            : '빈칸 설정을 마쳤습니다.';
    });

    resetButton.addEventListener('click', () => {
        settings = normalizeCoreIdeaSettings({ mode: settings.mode }, answers);
        saveSettings();
        render();
        settingsStatus.textContent = '기본 빈칸 설정으로 되돌렸습니다.';
    });

    render();
}
