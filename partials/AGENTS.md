# PARTIALS KNOWLEDGE BASE

## OVERVIEW

`partials/` owns quiz body HTML loaded into `#quiz-partials-root` before the main app initializes.

## STRUCTURE

```text
partials/
├── quiz-mains/                 # one top-level <main> per quiz subject/topic
└── quiz-main-sections/         # reusable or split sections included by quiz mains
```

## WHERE TO LOOK

| Task                      | Location                                                                      | Notes                                                  |
| ------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------ |
| Add/remove a quiz main    | `quiz-mains/*.html`, `modules/quiz-partials-manifest.js`                      | Manifest must list every top-level partial.            |
| Split a large quiz file   | `quiz-main-sections/<topic>/*.html`                                           | Include with `<!-- quiz-include: partials/... -->`.    |
| Validate rendered mains   | `scripts/validate-quiz-partials.js`                                           | Checks include cycles, duplicate main ids, and count.  |
| Subject-specific behavior | `modules/subject-topics.js`, `modules/section-groups.js`, `css/subject-*.css` | HTML changes often need matching mapping/style checks. |

## CONVENTIONS

- Each top-level `quiz-mains/*.html` must render exactly one unique `<main id="...">`.
- Section partial paths in `quiz-include` comments are repository-relative.
- Keep ids/classes compatible with existing JS selectors; many modules query by ids, `data-*`, and `.overview-question input[data-answer]`.
- For large curriculum pages, prefer section partials over growing a monolithic `quiz-mains` file.
- Preserve Korean educational copy as authored unless the task is content editing.

## ANTI-PATTERNS

- Do not duplicate `<main>` ids across rendered partials.
- Do not create circular `quiz-include` chains.
- Do not add a quiz main without updating `QUIZ_PARTIAL_URLS`.
- Do not rely on file-open testing; partial fetch requires a local server for browser QA.

## VERIFY

```bash
npm test
npm run dev
```
