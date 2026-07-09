# SCRIPTS KNOWLEDGE BASE

## OVERVIEW

`scripts/` owns Node-based validation and lightweight tests used by `npm test`.

## WHERE TO LOOK

| Task                    | Location                        | Notes                                                          |
| ----------------------- | ------------------------------- | -------------------------------------------------------------- |
| Full project check      | `package.json` `scripts.check`  | Runs syntax checks and all script validators.                  |
| Partial validation      | `validate-quiz-partials.js`     | Expands includes and validates rendered main ids/count.        |
| Structure validation    | `validate-project-structure.js` | Checks CSS order, local scripts, module registry, legacy refs. |
| Partial loader test     | `test-quiz-partial-loader.js`   | Tests loader behavior without a browser framework.             |
| HTML formatting utility | `../format-html.js`             | Root-level utility that rewrites `index.html`.                 |

## CONVENTIONS

- Scripts are ES modules and run directly under Node.
- Prefer deterministic filesystem checks over browser automation for structure invariants.
- Keep error messages specific; `npm test` output is the main feedback channel.
- `validate-project-structure.js` intentionally parses `README_MODULES.md` for documented CSS order.
- `validate-quiz-partials.js` resolves `quiz-include` recursively and must reject circular includes.

## ANTI-PATTERNS

- Do not weaken validators to accommodate inconsistent docs or markup; update the source of truth instead.
- Do not add a test framework unless the task explicitly requires broader runtime coverage.
- Do not hide missing file errors behind optional fallbacks.

## VERIFY

```bash
npm test
node scripts/validate-project-structure.js
node scripts/validate-quiz-partials.js
node scripts/test-quiz-partial-loader.js
```
