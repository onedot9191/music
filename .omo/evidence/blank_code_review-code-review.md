# Blank-answer grading code review

## Verdict

- **codeQualityStatus:** BLOCK
- **recommendation:** REQUEST_CHANGES
- **Scope:** `modules/answer-candidates.js`, `answer-grading.js`, `answer-input-grader.js`, `answer-input-controller.js`, `game-utils.js`, `input-event-bindings.js`, relevant partials and scripts.
- **Reviewed change:** `d2044e7f87cf7f23197f6e97590c7576c84a15e6` (the workspace is clean; `omo ulw-loop` executable was unavailable, so this report uses the required fallback path).
- **Confidence:** High. The High finding was reproduced against the real production normalizer and grader.

## Evidence consulted

- Call path: `modules/input-event-bindings.js` → `modules/answer-input-controller.js` → `modules/answer-input-grader.js` → `modules/answer-grading.js`; normalization is supplied by `modules/app-runtime-helpers.js`, which calls `modules/game-utils.js`.
- `npm test`: PASS.
- `npm run lint`: PASS.
- `git diff --check HEAD^ HEAD`: PASS.
- Direct real-code reproduction: with curriculum/spelling blank mode, production `normalizeAnswer` and `gradeDirectAnswer` graded input `존 명사` as correct for partial answer `의존 명사`.

## Findings

### CRITICAL

None.

### HIGH

1. **Spelling blank answers accept omitted meaningful `의` syllables (false positive).**
   - [game-utils.js:23](/Users/ibyeonghyeon/Documents/GitHub/music/modules/game-utils.js:23) includes `의` in a global removal character class whenever spelling blank mode is active ([lines 19-21](/Users/ibyeonghyeon/Documents/GitHub/music/modules/game-utils.js:19)). This cannot distinguish the possessive particle from a meaningful syllable inside a word.
   - [spelling-blank.html:21](/Users/ibyeonghyeon/Documents/GitHub/music/partials/quiz-main-sections/spelling/spelling-blank.html:21) contains the actual answer `의존 명사`. The production reproduction returned `{ "isCorrect": true, "displayAnswer": "존 명사" }` for user input `존 명사`.
   - Current behavior therefore grants credit for a misspelled/incomplete answer in the spelling exercise. This is pre-existing relative to `d2044e7`, but is in the requested grading scope and blocks approval of the blank-grading behavior.
   - Direction: remove only a syntactically identifiable standalone particle (or model this tolerance as an explicit accepted alias) rather than deleting every `의` code point. Add positive and negative regression cases for standalone `의` and lexical `의`.

### MEDIUM

1. **The newly added grading tests do not execute the production normalization contract.**
   - [test-concept-analysis-grading.js:87](/Users/ibyeonghyeon/Documents/GitHub/music/scripts/test-concept-analysis-grading.js:87) and [test-moral-discussion-alias.js:73](/Users/ibyeonghyeon/Documents/GitHub/music/scripts/test-moral-discussion-alias.js:73) inject `trim().toLowerCase()` instead of the runtime `game-utils.normalizeAnswer` supplied through `app-runtime-helpers`.
   - The tests declare model mode ([concept:99](/Users/ibyeonghyeon/Documents/GitHub/music/scripts/test-concept-analysis-grading.js:99), [moral:67](/Users/ibyeonghyeon/Documents/GitHub/music/scripts/test-moral-discussion-alias.js:67)), where production additionally removes whitespace, separators, parentheses, and `의`. As a result, they cannot catch production false positives/negatives caused by normalization; the reproduced High issue is one such gap.
   - Direction: cover the observable grading cases through the real normalizer and realistic game state, including aliases, parenthesized answers, model-specific normalization, spelling blank mode, and one rejected near-match.

2. **Part of the new test suite is change-shape verification rather than behavior coverage.**
   - [test-concept-analysis-grading.js:36](/Users/ibyeonghyeon/Documents/GitHub/music/scripts/test-concept-analysis-grading.js:36) asserts that `data-group`/`data-ignore-order` were removed; [lines 41-60](/Users/ibyeonghyeon/Documents/GitHub/music/scripts/test-concept-analysis-grading.js:41) and [test-moral-discussion-alias.js:14](/Users/ibyeonghyeon/Documents/GitHub/music/scripts/test-moral-discussion-alias.js:14) use regexes over markup layout.
   - The ordered/reversed-answer and alias outcomes are the relevant behavior; these text/absence assertions are brittle to valid markup refactoring and primarily restate the requested edit. They also do not make the constructed mocked inputs originate from the partial being checked.
   - Direction: retain tests that distinguish ordered vs. unordered grading and alias display behavior, but drive their fixtures from a stable runtime-facing representation (or a real DOM/loaded partial). Remove only the deletion-only assertion if no runtime contract consumes that exact absence.

### LOW

None.

## Skill-perspective check

Ran: **yes**. I loaded and applied `omo:programming` and `omo:remove-ai-slops` before assessing maintainability and test relevance.

- `programming`: violation in test relevance: the tests mirror injected implementation assumptions instead of the runtime normalization boundary; no untyped escape hatch or needless production parsing/normalization was added by `d2044e7`.
- `remove-ai-slops`: the deletion-only markup assertion is a MEDIUM test-slop concern. No deletion-only production code, tautological production test, or needless new production data extraction/parsing/normalization was found in the reviewed commit.

## Blocking issues

1. Fix the false-positive `의` normalization in spelling blank mode and add a regression that fails for `의존 명사` versus `존 명사`.
2. Add/replace coverage so the relevant grade paths run the actual production normalization contract. Existing green tests alone do not establish this.
