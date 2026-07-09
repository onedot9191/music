# PROJECT KNOWLEDGE BASE

**Generated:** 2026-07-09 09:31:05 KST
**Commit:** da65273
**Branch:** main

## OVERVIEW

Static Korean quiz web app for elementary teacher exam practice. Runtime is plain HTML/CSS plus ES modules; quiz content is loaded from HTML partials before app initialization.

## STRUCTURE

```text
music/
├── index.html                 # static shell, CSS/script load order
├── app.js                     # bootstrap and controller wiring
├── modules/                   # 101 ES modules for runtime behavior
├── partials/
│   ├── quiz-mains/            # 62 top-level quiz main partials
│   └── quiz-main-sections/    # section partials included by quiz mains
├── css/                       # 33 ordered CSS modules
├── scripts/                   # Node validation and loader tests
├── README_MODULES.md          # canonical module/CSS order documentation
└── MODULARIZATION_GUIDE.md    # boundary guide for future changes
```

## WHERE TO LOOK

| Task                           | Location                                                                     | Notes                                                       |
| ------------------------------ | ---------------------------------------------------------------------------- | ----------------------------------------------------------- |
| App startup, dependency wiring | `app.js`, `modules/app-initializer.js`                                       | Keep `app.js` as orchestration, not feature logic.          |
| Runtime feature logic          | `modules/`                                                                   | Match existing responsibility-based file split.             |
| Subject/topic mapping          | `modules/subject-topics.js`, `modules/section-groups.js`                     | Update mappings with related partials.                      |
| Quiz HTML content              | `partials/quiz-mains/`, `partials/quiz-main-sections/`                       | Use `quiz-include` comments for large section splits.       |
| Partial loading                | `modules/quiz-partial-loader.js`, `modules/quiz-partials-manifest.js`        | Manifest count must match rendered main elements.           |
| Styling                        | `css/`, `index.html`, `README_MODULES.md`                                    | CSS order is validated against docs.                        |
| Structure checks               | `scripts/validate-project-structure.js`, `scripts/validate-quiz-partials.js` | `npm test` runs these.                                      |
| HTML formatting helper         | `format-html.js`                                                             | Root utility that rewrites `index.html`; run intentionally. |

## CODE MAP

| Symbol                  | Type            | Location                                | Refs           | Role                                                              |
| ----------------------- | --------------- | --------------------------------------- | -------------- | ----------------------------------------------------------------- |
| `initializeApp`         | function        | `modules/app-initializer.js`            | 1              | Restores last state, renders initial selector, opens start modal. |
| `window._modules`       | global registry | `modules/module-registry.js`            | devtools       | Dynamic imports for manual inspection.                            |
| `QUIZ_PARTIAL_URLS`     | export          | `modules/quiz-partials-manifest.js`     | loader/tests   | Source of truth for top-level partials.                           |
| `resolvePartial`        | function        | `scripts/validate-quiz-partials.js`     | script-local   | Expands nested `quiz-include` comments and detects cycles.        |
| `validateCssOrder`      | function        | `scripts/validate-project-structure.js` | script-local   | Checks `index.html` CSS order against `README_MODULES.md`.        |
| `window.isSoundEnabled` | global API      | `modules/sound-settings.js`             | audio playback | Compatibility API intentionally retained.                         |

LSP was unavailable in this environment because `typescript-language-server` is not installed; code map is from codegraph plus direct file inspection.

## CONVENTIONS

- JavaScript is ES module based; `package.json` has `"type": "module"`.
- Prettier uses single quotes and ES5 trailing commas.
- EditorConfig uses LF, UTF-8, final newline, no trailing whitespace.
- Indentation is 4 spaces for JS/HTML/CSS and 2 spaces for JSON.
- `styles.css` is a compatibility entry and should stay minimal.
- Keep static assets at the current root paths unless a broader asset migration is explicitly requested.
- `README_MODULES.md` is not passive documentation; validation reads it for CSS order.

## ANTI-PATTERNS (THIS PROJECT)

- Do not add new feature logic to `app.js` when a responsibility-specific module fits.
- Do not create `css/layout.css`, `css/modals.css`, `css/responsive.css`, `modules/stats.js`, `modules/timer.js`, `modules/ui.js`, or `modules/migration-helper.js`; the structure validator treats these legacy references as failures.
- Do not reorder CSS links in `index.html` without updating `README_MODULES.md` and running `npm test`.
- Do not edit generated/loaded partial structure without checking duplicate `<main>` ids and include cycles.
- Do not remove `window._modules` or `window.isSoundEnabled`; both are documented compatibility surfaces.
- Do not change placeholder text casually; some CSS selectors depend on exact placeholder strings.

## UNIQUE STYLES

- UI copy and quiz content are Korean.
- The app uses static partial composition rather than a framework router.
- Tests are mostly structure validation scripts, not Jest/Vitest specs.
- Browser-facing changes need local server verification because partial loading uses fetch.

## COMMANDS

```bash
npm run dev
npm test
npm run lint
npx prettier --check index.html README_MODULES.md app.js modules/*.js css/*.css scripts/*.js
```

## NOTES

- `npm test` is the same as `npm run check`.
- There is no `build` script and no CI workflow in this repository.
- `node --check` covers `app.js`, `modules/*.js`, and `scripts/*.js`; HTML/CSS consistency is covered by custom scripts.
