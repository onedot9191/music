# Gate Review: competency answer reveal order independence

## Recommendation

- recommendation: APPROVE
- user-facing verdict: PASS
- confidence: MEDIUM-HIGH (0.88)
- blockers: []

## Original Intent

When the user clicks the result modal's `정답 보기`, competency-subject answers must be treated as order-independent. Inputs already marked correct must retain their displayed value even when it differs from that input's `data-answer`; only the remaining canonical answers should be placed into the remaining inputs, without introducing duplicate assignments.

## Desired Outcome

For each competency section or competency group:

1. Preserve every `.correct` input value and position.
2. Subtract preserved correct values from the canonical `data-answer` values using normalized multiset semantics.
3. Fill only non-correct inputs with the remaining canonical values.
4. Apply order-independent reveal behavior to both ungrouped and grouped competency markup.

## User Outcome Review

The shipped implementation satisfies the intended visible outcome.

- `modules/answer-reveal.js:13-34` builds normalized answer counts, subtracts each already-correct value once, and emits exactly the remaining canonical multiset.
- `modules/answer-reveal.js:53-79` does not overwrite inputs already carrying the configured correct class; it only fills non-correct inputs.
- `modules/answer-reveal.js:105-129` forces `ignoreOrder: true` in both ungrouped and grouped competency branches.
- `modules/game-control-events.js:118-143` confirms the result `정답 보기` action dispatches to the competency reveal path when the selected subject qualifies.
- Direct production-module execution passed ungrouped, grouped, duplicate-canonical, and normalization-equivalence scenarios.
- Running the equivalent regression against `HEAD:modules/answer-reveal.js` reproduced the old wrong output `['B', 'B', 'C']`; the changed implementation produced `['B', 'A', 'C']`.

## Success Criteria Review

| ID | Criterion | Result | Evidence |
| --- | --- | --- | --- |
| C1 | Competency reveal is order-independent | PASS | `modules/answer-reveal.js:105-129`; targeted run |
| C2 | A correct value at a different position is preserved | PASS | `modules/answer-reveal.js:56-79`; `scripts/test-answer-reveal.js:34-64` |
| C3 | Only remaining canonical answers are filled | PASS | `modules/answer-reveal.js:1-34`; targeted run |
| C4 | No duplicate assignment beyond the canonical multiset | PASS | normalized count/decrement logic at `modules/answer-reveal.js:3-34`; duplicate-canonical targeted run |
| C5 | Regression test participates in `npm test` | PASS | `package.json:7-9`; reproduced `npm test` exit 0 |

## Independent Verification

- `node scripts/test-answer-reveal.js`: PASS, exit 0.
- `npm test`: PASS, exit 0; 62 quiz partials and project structure validated.
- `npm run lint`: PASS, exit 0.
- `npx prettier --check modules/answer-reveal.js scripts/test-answer-reveal.js package.json`: PASS.
- `git diff --check`: PASS.
- Targeted production scenarios: 4 passed (ungrouped, grouped, duplicate canonical values, normalized equivalence).
- Korean competency cross-slot permutations: 30/30 passed; each preserved the correct slot and retained the exact six-value source multiset with six unique rendered values.
- Base regression toggle: reproduced old output `['B', 'B', 'C']` when `isIgnoreOrderScope` returned false.
- Browser discovery: unavailable; browser backend list was empty.
- LSP diagnostics: unavailable because the JavaScript/TypeScript language server is not installed and installation was previously declined. Syntax and ESLint checks passed instead.

## Direct remove-ai-slops / Overfit Pass

- The test is not deletion-only and does not merely assert that code was removed.
- The assertion is behavioral: it checks the observable input values after invoking the production export.
- The fixture distinguishes the requested behavior from the fallback: `isIgnoreOrderScope` explicitly returns false while the already-correct value differs from its positional `data-answer`.
- The test is not tautological and does not derive its expected array from production output.
- The DOM fake is minimal and models only the APIs consumed by the production function; it does not mirror the multiset implementation.
- The `Map` counting logic is necessary for normalized multiset subtraction and is not speculative parsing, normalization, or extraction.
- No new dependency, pass-through wrapper, debug output, dead branch, or unrelated production abstraction was introduced.
- Pure LOC: `modules/answer-reveal.js` 118; `scripts/test-answer-reveal.js` 54. Neither is oversized.

Non-blocking test coverage note: `scripts/test-answer-reveal.js:34-64` exercises the ungrouped, unique-answer case only. It does not permanently lock the grouped branch or duplicate-canonical multiset behavior. Those cases passed this review's independent targeted run, and no stated criterion requires dedicated committed tests, so this is an evidence-strength note rather than a blocker.

## Programming Perspective

- The change is located at the shared competency reveal seam and covers both relevant branches rather than patching individual sections.
- Existing public exports and ordinary `revealSectionAnswers` behavior remain unchanged.
- The algorithm is linear in the number of inputs and preserves normalized multiplicity.
- No new dependency or scope-expanding refactor was added.
- Security impact is neutral: no new input-to-HTML sink, network access, authentication surface, secret, or dependency was introduced.

## Review Report Coverage

`/Users/ibyeonghyeon/Documents/GitHub/music/.omo/evidence/competency-answer-reveal-gate-review.md` appeared after the initial evidence inventory and was inspected as untrusted input. It explicitly covers the `remove-ai-slops` overfit categories (no deletion-only, tautological, output-derived, or implementation-mirroring test) and the `programming` maintenance criteria (shared seam, multiset justification, dependency/abstraction scope, LOC). Its claimed 30-case Korean permutation result was independently reproduced in this review. Direct review in this report reaches the same result; report coverage does not substitute for that direct pass. The unavailable `review-work` subagent surface is an orchestration limitation, not evidence of a product failure.

## Checked Artifact Paths

- `/Users/ibyeonghyeon/Documents/GitHub/music/modules/answer-reveal.js`
- `/Users/ibyeonghyeon/Documents/GitHub/music/scripts/test-answer-reveal.js`
- `/Users/ibyeonghyeon/Documents/GitHub/music/package.json`
- `/Users/ibyeonghyeon/Documents/GitHub/music/modules/game-control-events.js`
- `/Users/ibyeonghyeon/Documents/GitHub/music/modules/answer-input-grader.js`
- `/Users/ibyeonghyeon/Documents/GitHub/music/modules/answer-grading.js`
- `/Users/ibyeonghyeon/Documents/GitHub/music/modules/app-runtime-helpers.js`
- `/Users/ibyeonghyeon/Documents/GitHub/music/modules/game-utils.js`
- `/Users/ibyeonghyeon/Documents/GitHub/music/partials/quiz-mains/competency.html`
- `/Users/ibyeonghyeon/Documents/GitHub/music/partials/quiz-main-sections/competency/integrated.html`
- `/Users/ibyeonghyeon/Documents/GitHub/music/.omo/evidence/competency-answer-reveal-gate-review.md`
- `/Users/ibyeonghyeon/Documents/GitHub/music/.omo/evidence/`

## Exact Evidence Gaps

- No browser backend was available, so the real result-modal click flow and screenshot were not captured.
- No goal-specific manual QA matrix artifact was supplied or found.
- No executor evidence artifact path was supplied; all claimed commands were independently rerun.
- No notepad path was supplied.
- The goal-specific code review report appeared only after the initial inventory; it was subsequently inspected and its material runtime claim independently reproduced.
- `omo ulw-loop status --json` could not run because the `omo` executable is absent, so the mandated fallback report path was used.
- LSP diagnostics could not run because the JavaScript/TypeScript language server is unavailable.

These are evidence limitations, not blockers: none is an explicit success criterion, and the source-level behavior, regression toggle, targeted runtime scenarios, and project checks support completion.

## Blockers

None.
