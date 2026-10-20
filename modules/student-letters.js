// === STUDENT LETTERS MODULE ===
// D-10부터 D-1까지 날마다 학생 응원 편지가 편지함에 쌓입니다.
// 이 기기에서 안 읽은 편지가 있으면 편지 버튼에 New 표시를 띄우고,
// 편지함을 열면 안 읽은 편지부터 보여 줍니다.

import { calculateDaysUntil, getNextDDayDate } from './dday-date.js';
import {
    getJsonStorageItem,
    setJsonStorageItem,
} from './local-storage-json.js';
import {
    STUDENT_LETTERS,
    STUDENT_LETTER_FIRST_DAY,
    STUDENT_LETTER_IMAGE_DIR,
    STUDENT_LETTER_LAST_DAY,
    STUDENT_LETTER_SCHEDULE,
} from './student-letters-data.js';

export const STUDENT_LETTERS_SEEN_KEY = 'studentLettersSeen';
const PREVIEW_PARAM = 'letters';
const PAPER_TONES = ['yellow', 'peach', 'mint'];

const lettersById = new Map(
    STUDENT_LETTERS.map((letter, index) => [letter.id, { ...letter, index }])
);

export function isStudentLetterPeriod(daysLeft) {
    return (
        daysLeft <= STUDENT_LETTER_FIRST_DAY &&
        daysLeft >= STUDENT_LETTER_LAST_DAY
    );
}

export function getUnlockedLetterIds(daysLeft) {
    if (daysLeft > STUDENT_LETTER_FIRST_DAY) return [];

    const lastOpenDay = Math.max(daysLeft, STUDENT_LETTER_LAST_DAY);
    const ids = [];
    for (let day = STUDENT_LETTER_FIRST_DAY; day >= lastOpenDay; day -= 1) {
        ids.push(...(STUDENT_LETTER_SCHEDULE[day] ?? []));
    }
    return ids;
}

// 최근에 도착한 날의 편지가 위로 오고, 같은 날 편지는 일정 순서를 지킨다.
function getNewestFirstIds(daysLeft) {
    if (!isStudentLetterPeriod(daysLeft)) return [];

    const ids = [];
    for (let day = daysLeft; day <= STUDENT_LETTER_FIRST_DAY; day += 1) {
        ids.push(...(STUDENT_LETTER_SCHEDULE[day] ?? []));
    }
    return ids;
}

// 안 읽은 편지를 맨 위에, 읽은 편지를 그 아래에 쌓는다.
function stackLetters(ids, seenIds) {
    const seen = new Set(seenIds);
    const letters = ids
        .map((id) => lettersById.get(id))
        .filter(Boolean)
        .map((letter) => ({ ...letter, unread: !seen.has(letter.id) }));
    return [
        ...letters.filter((letter) => letter.unread),
        ...letters.filter((letter) => !letter.unread),
    ];
}

export function getMailboxLetters(daysLeft, seenIds = []) {
    return stackLetters(getNewestFirstIds(daysLeft), seenIds);
}

export function countUnreadLetters(daysLeft, seenIds = []) {
    return getMailboxLetters(daysLeft, seenIds).filter(
        (letter) => letter.unread
    ).length;
}

// ?letters=7 → D-7에 열리는 편지, ?letters=all → 전체 편지를 D-10부터 D-1 순서로
export function readLetterPreview(search = '') {
    const value = new URLSearchParams(search).get(PREVIEW_PARAM);
    if (!value) return null;
    if (value === 'all') {
        return getUnlockedLetterIds(STUDENT_LETTER_LAST_DAY).map((id) =>
            lettersById.get(id)
        );
    }

    const day = Number.parseInt(value.replace(/^d-?/i, ''), 10);
    const ids = STUDENT_LETTER_SCHEDULE[day];
    return ids ? ids.map((id) => lettersById.get(id)) : null;
}

function readSeenIds() {
    const stored = getJsonStorageItem(STUDENT_LETTERS_SEEN_KEY, []);
    return Array.isArray(stored) ? stored : [];
}

function markSeen(id) {
    const seen = readSeenIds();
    if (seen.includes(id)) return;
    setJsonStorageItem(STUDENT_LETTERS_SEEN_KEY, [...seen, id]);
}

function createLetterImage(id, text) {
    const image = document.createElement('img');
    image.src = `${STUDENT_LETTER_IMAGE_DIR}/${id}.webp`;
    image.alt = text;
    image.width = 600;
    image.height = 600;
    image.decoding = 'async';
    image.draggable = false;
    return image;
}

function createLetterFace(side, image) {
    const face = document.createElement('div');
    face.className = `student-letter-face is-${side}`;
    face.append(image);
    return face;
}

// 앞뒷면 편지: 버튼이나 종이를 누르면 뒤집힌다.
function makeFlippable(note, letter, frontImage) {
    const front = createLetterFace('front', frontImage);
    const back = createLetterFace(
        'back',
        createLetterImage(letter.back.id, letter.back.text)
    );
    const faces = document.createElement('div');
    faces.className = 'student-letter-faces';
    faces.append(front, back);

    const flipButton = document.createElement('button');
    flipButton.type = 'button';
    flipButton.className = 'btn student-letter-flip-btn';

    function setFlipped(flipped) {
        note.classList.toggle('is-flipped', flipped);
        front.setAttribute('aria-hidden', String(flipped));
        back.setAttribute('aria-hidden', String(!flipped));
        flipButton.textContent = flipped ? '↺ 앞면 보기' : '↻ 뒷면 보기';
        flipButton.setAttribute('aria-pressed', String(flipped));
    }

    const toggle = () => setFlipped(!note.classList.contains('is-flipped'));
    flipButton.addEventListener('click', toggle);
    faces.addEventListener('click', toggle);

    note.classList.add('has-back');
    note.append(faces, flipButton);
    setFlipped(false);
}

function createNoteElement(letter) {
    const note = document.createElement('figure');
    note.className = 'student-letter-note';
    note.dataset.tone = PAPER_TONES[letter.index % PAPER_TONES.length];
    // 편지마다 기울기를 고정해 다시 봐도 같은 모습으로 붙어 있게 한다.
    note.style.setProperty(
        '--note-tilt',
        `${((letter.index * 37) % 7) - 3}deg`
    );

    const image = createLetterImage(letter.id, letter.text);
    if (letter.back) {
        makeFlippable(note, letter, image);
    } else {
        note.append(image);
    }
    if (letter.unread) {
        note.classList.add('is-unread');
        const stamp = document.createElement('span');
        stamp.className = 'student-letter-unread-stamp';
        stamp.textContent = 'NEW';
        note.append(stamp);
    }
    return note;
}

function renderLetterViewer(view, letters, { title, onFinish, onShow }) {
    let current = 0;
    const notes = letters.map(createNoteElement);

    view.title.textContent = title;
    view.stage.replaceChildren(...notes);

    // 본 편지는 넘기는 순간 NEW 도장을 뗀다.
    function clearStamp(note) {
        note.classList.remove('is-unread');
        note.querySelector('.student-letter-unread-stamp')?.remove();
    }

    function show(index) {
        if (index !== current) clearStamp(notes[current]);
        current = index;
        notes.forEach((note, noteIndex) => {
            note.classList.toggle('is-current', noteIndex === index);
            note.classList.toggle('is-read', noteIndex < index);
            note.setAttribute('aria-hidden', String(noteIndex !== index));
        });
        view.counter.textContent = `${index + 1} / ${letters.length}`;
        view.prevButton.disabled = index === 0;

        // 마지막 편지에서는 돌아가기 버튼을 눈에 띄게 한다.
        const isLast = index === letters.length - 1;
        view.nextButton.disabled = isLast;
        view.closeButton?.classList.toggle('is-finish', isLast);

        onShow(letters[index]);
    }

    const goPrev = () => {
        if (current > 0) show(current - 1);
    };
    const goNext = () => {
        if (current < letters.length - 1) show(current + 1);
    };
    const finish = () => {
        clearStamp(notes[current]);
        onFinish();
    };

    view.prevButton.onclick = goPrev;
    view.nextButton.onclick = goNext;
    if (view.closeButton) view.closeButton.onclick = finish;
    view.modal.onkeydown = (event) => {
        if (event.key === 'ArrowLeft') goPrev();
        if (event.key === 'ArrowRight') goNext();
    };

    show(0);
}

function updateUnreadBadge(view, unreadCount) {
    if (view.unreadBadge) view.unreadBadge.hidden = unreadCount === 0;
    view.openButton.setAttribute(
        'aria-label',
        unreadCount > 0
            ? `학생 편지 보기, 안 읽은 편지 ${unreadCount}통`
            : '학생 편지 보기'
    );
}

// 시작 모달의 편지 버튼: 편지함을 열고, 다 읽으면 시작 모달로 돌아온다.
export function prepareStudentLetters({
    closeModal,
    nextModal,
    openModal,
    search = window.location.search,
    today = new Date(),
    view,
}) {
    const button = view?.openButton;
    if (!view?.modal || !button) return;

    // 미리보기는 읽음 기록을 이 화면에서만 기억하고 저장하지 않는다.
    const preview = readLetterPreview(search);
    const previewSeen = new Set(readSeenIds());
    const daysLeft = calculateDaysUntil(getNextDDayDate(today), today);
    const loadLetters = () =>
        preview
            ? stackLetters(
                  preview.map((letter) => letter.id),
                  previewSeen
              )
            : getMailboxLetters(daysLeft, readSeenIds());
    const refreshBadge = () =>
        updateUnreadBadge(
            view,
            loadLetters().filter((letter) => letter.unread).length
        );

    button.hidden = loadLetters().length === 0;
    if (button.hidden) return;
    refreshBadge();

    button.addEventListener('click', () => {
        const letters = loadLetters();
        const unreadCount = letters.filter((letter) => letter.unread).length;
        renderLetterViewer(view, letters, {
            title:
                unreadCount > 0
                    ? `새 편지 ${unreadCount}통이 도착했어요`
                    : '받은 편지',
            onShow: (letter) => {
                if (!letter.unread) return;
                if (preview) {
                    previewSeen.add(letter.id);
                } else {
                    markSeen(letter.id);
                }
                refreshBadge();
            },
            onFinish: () => {
                closeModal(view.modal);
                openModal(nextModal);
            },
        });
        closeModal(nextModal);
        openModal(view.modal);
    });
}
