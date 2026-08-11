import assert from 'assert/strict';

import { filterResultProgressInputs } from '../modules/result-progress.js';

function createInput({ accordion, correct = false } = {}) {
    const classes = new Set(correct ? ['correct'] : []);

    return {
        classList: {
            contains(name) {
                return classes.has(name);
            },
        },
        closest(selector) {
            return selector === '.accordion' ? accordion : null;
        },
    };
}

function createAccordion(isExpanded, isActive = isExpanded) {
    return {
        querySelector(selector) {
            if (selector === 'section') {
                return {
                    classList: {
                        contains(name) {
                            return name === 'active' && isActive;
                        },
                    },
                };
            }

            if (selector !== '.accordion-header') return null;

            return {
                getAttribute(name) {
                    return name === 'aria-expanded' ? String(isExpanded) : null;
                },
            };
        },
    };
}

const closedAccordion = createAccordion(false);
const openAccordion = createAccordion(true);
const inactiveAccordion = createAccordion(true, false);
const inputs = [
    createInput({ correct: true }),
    createInput({ accordion: closedAccordion, correct: true }),
    createInput({ accordion: openAccordion, correct: true }),
    createInput({ accordion: inactiveAccordion, correct: true }),
];

assert.equal(
    filterResultProgressInputs(inputs).length,
    2,
    'closed accordion inputs should not count toward result maximum'
);
assert.equal(
    filterResultProgressInputs(inputs).filter((input) =>
        input.classList.contains('correct')
    ).length,
    2,
    'correct answers in closed accordions should not count toward the result'
);

console.log('Result progress excludes closed accordion inputs');
