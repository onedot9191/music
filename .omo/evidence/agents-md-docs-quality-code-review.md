# AGENTS.md Docs Code Review

## Scope

- `AGENTS.md`
- `modules/AGENTS.md`
- `partials/AGENTS.md`
- `css/AGENTS.md`
- `scripts/AGENTS.md`

## Skill-Perspective Check

- `omo:remove-ai-slops`: ran by reading the skill instructions before judging maintainability. No deletion-only tests, tautological tests, implementation-mirroring tests, or needless production parsing/normalization were present because this scope only adds documentation.
- `omo:programming`: ran by reading the skill instructions before judging maintainability. No violations found. Language-specific references were not loaded because the reviewed scope is Markdown docs only and no `.js/.ts/.py/.go/.rs` production or test code was edited.

## Evidence Inspected

- Read all five scoped `AGENTS.md` files.
- Read `.omo/evidence/agents-md-qa/find-agents.txt` and `.omo/evidence/agents-md-qa/wc-lines.txt`.
- Checked actual counts and metadata:
  - `modules/*.js`: 101
  - `css/*.css`: 33
  - `partials/quiz-mains/*.html`: 62
  - `git rev-parse --short HEAD`: `da65273`
  - `git branch --show-current`: `main`
  - `typescript-language-server`: not installed in PATH
- Verified concrete claims with source inspection:
  - `window._modules`, `window.isSoundEnabled`
  - `QUIZ_PARTIAL_URLS`
  - `resolvePartial`
  - `validateCssOrder`
  - `quiz-include`
  - exact placeholder selector `input[placeholder='단계 활동']`
  - existing `:contains(...)` and `body:has(...)` selectors
  - structure validator legacy-reference checks

## Verification

- `npm test`: PASS
- `npm run lint`: PASS
- `npx prettier --check AGENTS.md modules/AGENTS.md partials/AGENTS.md css/AGENTS.md scripts/AGENTS.md`: PASS
- Local server curl via `./node_modules/.bin/http-server -p 8090 -c- .`:
  - `curl -fsS http://127.0.0.1:8090/`: PASS
  - `curl -fsS http://127.0.0.1:8090/partials/quiz-mains/music.html`: PASS

## Findings By Severity

### CRITICAL

- None.

### HIGH

- None.

### MEDIUM

- None.

### LOW

- `AGENTS.md:3`-`AGENTS.md:5` and `AGENTS.md:51` contain generated snapshot/environment metadata. These claims are accurate now, but they will naturally drift if the docs are edited manually without regeneration. This is a maintainability watch item, not a blocker.

## Assessment

- Project specificity: PASS. The docs name actual project files, validators, CSS order behavior, partial loading contracts, known globals, and selector risks.
- Maintainability: PASS. The hierarchy is scoped by directory, with short sections and actionable local conventions. The only watch item is generated metadata drift.
- Hierarchy: PASS. Root-level guidance covers global architecture; subdirectory docs add local rules without repeating the parent wholesale.
- Stale/unverified claims: PASS. All concrete claims checked in this review matched the repository state.
- Repeated parent content: PASS. Repetition is limited to local verify commands and shared contracts where appropriate.
- Markdown concision: PASS. Line counts are within the recorded target range and Prettier passes.

## Result

- `codeQualityStatus`: CLEAR
- `recommendation`: APPROVE
- `blockers`: None
