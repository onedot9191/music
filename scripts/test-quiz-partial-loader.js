import assert from 'assert/strict';

import { loadQuizPartials } from '../modules/quiz-partial-loader.js';

const root = {
    dataset: {
        quizPartials: 'partials/transient.html',
    },
    innerHTML: '',
};

globalThis.document = {
    getElementById(id) {
        return id === 'quiz-partials-root' ? root : null;
    },
};

let fetchCount = 0;
globalThis.fetch = async () => {
    fetchCount += 1;

    if (fetchCount === 1) {
        throw new TypeError('Failed to fetch');
    }

    return {
        ok: true,
        async text() {
            return '<main id="transient-quiz-main"></main>';
        },
    };
};

await loadQuizPartials();

assert.equal(fetchCount, 2, 'transient partial fetch should be retried once');
assert.equal(root.dataset.loaded, 'true');
assert.equal(root.innerHTML, '<main id="transient-quiz-main"></main>');
