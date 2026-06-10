import {
    getJsonStorageItem,
    removeStorageItem,
    setJsonStorageItem,
} from './local-storage-json.js';

const CURRICULUM_MAIN_IDS = new Set([
    'korean-quiz-main',
    'ethics-lite-quiz-main',
    'science-curriculum-quiz-main',
    'pe-quiz-main',
    'pe-lite-quiz-main',
    'music-quiz-main',
    'art-quiz-main',
    'practical-lite-quiz-main',
    'life-quiz-main',
    'wise-quiz-main',
    'joy-quiz-main',
]);

const STORAGE_PREFIX = 'curriculum-order';
const ACTIVE_CLASS = 'curriculum-order-editing';
const PREVIEW_VALUE_KEY = 'curriculumPreviewValue';
const PREVIEW_READONLY_KEY = 'curriculumPreviewReadonly';

let draggedItem = null;

function isCurriculumMain(main) {
    return main && CURRICULUM_MAIN_IDS.has(main.id);
}

export function isCurriculumOrderEditingInput(input) {
    return (
        input?.matches?.('input[data-answer]') &&
        input.closest(`.${ACTIVE_CLASS}`) !== null
    );
}

function getRows(main) {
    return [...main.querySelectorAll('tr')].filter((row) =>
        row.querySelector('td input[data-answer]')
    );
}

function getRowIndex(row) {
    const main = row.closest('main');
    if (!main) return -1;

    return getRows(main).indexOf(row);
}

function getRowStorageKey(row) {
    const main = row.closest('main');
    const section = row.closest('section');
    const rowIndex = getRowIndex(row);

    if (!main || !section || rowIndex < 0) return '';

    return [STORAGE_PREFIX, main.id, section.id, rowIndex].join(':');
}

function readOriginalOrder(row) {
    try {
        return JSON.parse(row.dataset.curriculumOriginalOrder || '[]');
    } catch (_) {
        return [];
    }
}

function getRowItems(row) {
    return [...row.querySelectorAll('.curriculum-order-item')];
}

function orderRowItems(row, orderIds) {
    if (!Array.isArray(orderIds) || orderIds.length === 0) return;

    const cell = row.querySelector('td');
    const items = getRowItems(row);
    const itemById = new Map(items.map((item) => [item.dataset.orderId, item]));
    const orderedItems = orderIds
        .map((id) => itemById.get(String(id)))
        .filter(Boolean);
    const remainingItems = items.filter((item) => !orderedItems.includes(item));

    [...orderedItems, ...remainingItems].forEach((item) =>
        cell.appendChild(item)
    );
}

function saveRowOrder(row) {
    const key = getRowStorageKey(row);
    if (!key) return;

    const currentOrder = getRowItems(row).map((item) => item.dataset.orderId);
    const originalOrder = readOriginalOrder(row);

    if (currentOrder.join('|') === originalOrder.join('|')) {
        removeStorageItem(key);
        return;
    }

    setJsonStorageItem(key, currentOrder);
}

function restoreOriginalRowOrder(row) {
    const originalOrder = readOriginalOrder(row);
    orderRowItems(row, originalOrder);

    const key = getRowStorageKey(row);
    if (key) removeStorageItem(key);
}

function createItem(input, orderId) {
    const item = document.createElement('div');
    item.className = 'curriculum-order-item';
    item.dataset.orderId = orderId;
    item.draggable = false;

    item.appendChild(input);

    return item;
}

function createRowTools() {
    const tools = document.createElement('div');
    tools.className = 'curriculum-order-row-tools';

    const resetButton = document.createElement('button');
    resetButton.type = 'button';
    resetButton.className = 'curriculum-order-reset-row';
    resetButton.textContent = '행 초기화';

    tools.appendChild(resetButton);
    return tools;
}

function setupRow(row) {
    if (row.dataset.curriculumOrderReady === 'true') return;

    const cell = row.querySelector('td');
    const inputs = [...cell.querySelectorAll('input[data-answer]')];
    if (inputs.length < 2) return;

    const originalOrder = inputs.map((_, index) => String(index));
    row.dataset.curriculumOriginalOrder = JSON.stringify(originalOrder);

    cell.prepend(createRowTools());

    inputs.forEach((input, index) => {
        const item = createItem(input, String(index));
        cell.appendChild(item);
    });

    row.dataset.curriculumOrderReady = 'true';

    const savedOrder = getJsonStorageItem(getRowStorageKey(row), null);
    orderRowItems(row, savedOrder);
}

function setupMain(main) {
    if (!isCurriculumMain(main)) return;

    main.querySelectorAll('td input[data-answer]').forEach((input) => {
        input.closest('tr') && setupRow(input.closest('tr'));
    });

    if (main.dataset.curriculumOrderToolbarReady === 'true') return;

    const toolbar = document.createElement('div');
    toolbar.className = 'curriculum-order-toolbar';
    toolbar.dataset.ownerMainId = main.id;

    const toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.className = 'curriculum-order-toggle';
    toggleButton.textContent = '순서 편집';

    const resetButton = document.createElement('button');
    resetButton.type = 'button';
    resetButton.className = 'curriculum-order-reset-main';
    resetButton.textContent = '전체 초기화';

    toolbar.append(toggleButton, resetButton);

    const hudRight = document.querySelector('.hud-right');
    const forceQuitButton = document.getElementById('force-quit-btn');
    if (hudRight) {
        hudRight.insertBefore(
            toolbar,
            forceQuitButton && forceQuitButton.parentElement === hudRight
                ? forceQuitButton
                : hudRight.firstChild
        );
    } else {
        main.prepend(toolbar);
    }

    main.dataset.curriculumOrderToolbarReady = 'true';
}

function refreshToolbarVisibility() {
    document.querySelectorAll('.curriculum-order-toolbar').forEach((toolbar) => {
        const main = document.getElementById(toolbar.dataset.ownerMainId);
        const hidden = !main || main.classList.contains('hidden');
        toolbar.classList.toggle('hidden', hidden);

        if (hidden && main?.classList.contains(ACTIVE_CLASS)) {
            main.classList.remove(ACTIVE_CLASS);
            setAnswerPreview(main, false);
            refreshToolbarState(main);
        }
    });
}

function refreshToolbarState(main) {
    const toggleButton = document.querySelector(
        `.curriculum-order-toolbar[data-owner-main-id="${main.id}"] .curriculum-order-toggle`
    );
    if (!toggleButton) return;

    const editing = main.classList.contains(ACTIVE_CLASS);
    toggleButton.textContent = editing ? '편집 완료' : '순서 편집';
    toggleButton.setAttribute('aria-pressed', String(editing));
}

function getToolbarMain(element) {
    const toolbar = element.closest('.curriculum-order-toolbar');
    return toolbar ? document.getElementById(toolbar.dataset.ownerMainId) : null;
}

function setAnswerPreview(main, enabled) {
    getRowItems(main).forEach((item) => {
        const input = item.querySelector('input[data-answer]');
        if (!input) return;

        if (enabled) {
            if (!(PREVIEW_VALUE_KEY in input.dataset)) {
                input.dataset[PREVIEW_VALUE_KEY] = input.value;
                input.dataset[PREVIEW_READONLY_KEY] = String(input.readOnly);
            }
            input.value = input.dataset.answer || '';
            input.readOnly = true;
            input.classList.add('curriculum-order-preview');
            item.draggable = true;
            return;
        }

        if (PREVIEW_VALUE_KEY in input.dataset) {
            input.value = input.dataset[PREVIEW_VALUE_KEY];
            delete input.dataset[PREVIEW_VALUE_KEY];
        }
        if (PREVIEW_READONLY_KEY in input.dataset) {
            input.readOnly = input.dataset[PREVIEW_READONLY_KEY] === 'true';
            delete input.dataset[PREVIEW_READONLY_KEY];
        }
        input.classList.remove('curriculum-order-preview');
        item.draggable = false;
    });
}

function toggleMainEditing(main) {
    const editing = !main.classList.contains(ACTIVE_CLASS);

    main.classList.toggle(ACTIVE_CLASS, editing);
    setAnswerPreview(main, editing);
    refreshToolbarState(main);
}

function resetMain(main) {
    getRows(main).forEach(restoreOriginalRowOrder);
}

function getDragTargetItem(row, pointerY) {
    const items = getRowItems(row).filter((item) => item !== draggedItem);

    return items.find((item) => {
        const rect = item.getBoundingClientRect();
        return pointerY < rect.top + rect.height / 2;
    });
}

function isEditingItem(item) {
    return (
        item?.classList?.contains('curriculum-order-item') &&
        item.closest(`.${ACTIVE_CLASS}`) !== null
    );
}

export function setupCurriculumOrderEditor({
    root = document,
    refreshAdaptiveInputWidths = () => {},
} = {}) {
    root.querySelectorAll('main').forEach(setupMain);
    refreshToolbarVisibility();
    new MutationObserver(refreshToolbarVisibility).observe(root.body, {
        attributes: true,
        attributeFilter: ['class'],
        subtree: true,
    });

    document.addEventListener('click', (event) => {
        requestAnimationFrame(refreshToolbarVisibility);

        const toggleButton = event.target.closest('.curriculum-order-toggle');
        if (toggleButton) {
            const main = getToolbarMain(toggleButton);
            if (isCurriculumMain(main)) toggleMainEditing(main);
            return;
        }

        const mainResetButton = event.target.closest(
            '.curriculum-order-reset-main'
        );
        if (mainResetButton) {
            const main = getToolbarMain(mainResetButton);
            if (isCurriculumMain(main)) {
                resetMain(main);
                refreshAdaptiveInputWidths();
            }
            return;
        }

        const rowResetButton = event.target.closest(
            '.curriculum-order-reset-row'
        );
        if (rowResetButton) {
            const row = rowResetButton.closest('tr');
            if (row) {
                restoreOriginalRowOrder(row);
                refreshAdaptiveInputWidths();
            }
            return;
        }

    });

    document.addEventListener('dragstart', (event) => {
        const item = event.target.closest('.curriculum-order-item');
        if (!isEditingItem(item)) {
            event.preventDefault();
            return;
        }

        draggedItem = item;
        item.classList.add('curriculum-order-dragging');
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', item.dataset.orderId || '');
    });

    document.addEventListener('dragover', (event) => {
        if (!draggedItem) return;

        const row = event.target.closest('tr');
        if (!row || row !== draggedItem.closest('tr')) return;

        event.preventDefault();
        const targetItem = getDragTargetItem(row, event.clientY);
        const cell = row.querySelector('td');

        if (targetItem) {
            cell.insertBefore(draggedItem, targetItem);
        } else {
            cell.appendChild(draggedItem);
        }
    });

    document.addEventListener('drop', (event) => {
        if (!draggedItem) return;

        const row = event.target.closest('tr');
        if (!row || row !== draggedItem.closest('tr')) return;

        event.preventDefault();
        saveRowOrder(row);
        refreshAdaptiveInputWidths();
    });

    document.addEventListener('dragend', () => {
        if (!draggedItem) return;

        const row = draggedItem.closest('tr');
        draggedItem.classList.remove('curriculum-order-dragging');
        if (row) saveRowOrder(row);
        draggedItem = null;
        refreshAdaptiveInputWidths();
    });
}
