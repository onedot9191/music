import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';

import { calculateDaysUntil, getNextDDayDate } from '../modules/dday-date.js';
import {
    STUDENT_LETTERS,
    STUDENT_LETTER_IMAGE_DIR,
    STUDENT_LETTER_SCHEDULE,
} from '../modules/student-letters-data.js';
import {
    countUnreadLetters,
    getMailboxLetters,
    getUnlockedLetterIds,
    isStudentLetterPeriod,
    readLetterPreview,
} from '../modules/student-letters.js';

const letterIds = STUDENT_LETTERS.map((letter) => letter.id);
const scheduledIds = Object.values(STUDENT_LETTER_SCHEDULE).flat();

// 모든 편지가 정확히 한 번씩 일정에 들어 있고 이미지가 있다.
assert.deepEqual([...scheduledIds].sort(), [...letterIds].sort());
assert.equal(new Set(scheduledIds).size, scheduledIds.length);
const imageIds = STUDENT_LETTERS.flatMap((letter) =>
    letter.back ? [letter.id, letter.back.id] : [letter.id]
);
for (const id of imageIds) {
    await access(`${STUDENT_LETTER_IMAGE_DIR}/${id}.webp`);
}

// 공개 기간은 D-10부터 D-1까지다.
assert.equal(isStudentLetterPeriod(11), false);
assert.equal(isStudentLetterPeriod(10), true);
assert.equal(isStudentLetterPeriod(1), true);
assert.equal(isStudentLetterPeriod(0), false);

const ids = (letters) => letters.map((letter) => letter.id);

assert.deepEqual(getMailboxLetters(11), []);
assert.deepEqual(getMailboxLetters(0), []);
assert.deepEqual(ids(getMailboxLetters(10)), STUDENT_LETTER_SCHEDULE[10]);

// 편지는 날마다 쌓이고, 최근에 도착한 날의 편지가 위에 온다.
assert.deepEqual(ids(getMailboxLetters(8)), [
    ...STUDENT_LETTER_SCHEDULE[8],
    ...STUDENT_LETTER_SCHEDULE[9],
    ...STUDENT_LETTER_SCHEDULE[10],
]);
assert.equal(getMailboxLetters(1).length, STUDENT_LETTERS.length);
assert.equal(getUnlockedLetterIds(1).length, STUDENT_LETTERS.length);

// 안 읽은 편지가 읽은 편지보다 위에 온다.
const readOnD9 = [...STUDENT_LETTER_SCHEDULE[9], STUDENT_LETTER_SCHEDULE[8][0]];
const stacked = getMailboxLetters(8, readOnD9);
assert.deepEqual(ids(stacked), [
    ...STUDENT_LETTER_SCHEDULE[8].slice(1),
    ...STUDENT_LETTER_SCHEDULE[10],
    STUDENT_LETTER_SCHEDULE[8][0],
    ...STUDENT_LETTER_SCHEDULE[9],
]);
assert.deepEqual(
    stacked.map((letter) => letter.unread),
    [true, true, true, true, false, false, false]
);

// New 표시용 안 읽은 편지 수
assert.equal(countUnreadLetters(8, readOnD9), 4);
assert.equal(countUnreadLetters(1, letterIds), 0);
assert.equal(countUnreadLetters(15), 0);

// 실제 날짜 기준: 2026-10-28이 D-10, 2026-11-06이 D-1이다.
const examDate = getNextDDayDate(new Date(2026, 9, 28));
assert.equal(calculateDaysUntil(examDate, new Date(2026, 9, 28, 23, 59)), 10);
assert.equal(calculateDaysUntil(examDate, new Date(2026, 10, 6, 0, 1)), 1);
assert.equal(calculateDaysUntil(examDate, new Date(2026, 9, 20)), 18);

// 미리보기 파라미터
assert.equal(readLetterPreview(''), null);
assert.deepEqual(
    readLetterPreview('?letters=all').map((letter) => letter.id),
    [10, 9, 8, 7, 6, 5, 4, 3, 2, 1].flatMap(
        (day) => STUDENT_LETTER_SCHEDULE[day]
    )
);
assert.deepEqual(
    readLetterPreview('?letters=d-7').map((letter) => letter.id),
    STUDENT_LETTER_SCHEDULE[7]
);
assert.equal(readLetterPreview('?letters=20'), null);

console.log('student letters tests passed');
