# CSS KNOWLEDGE BASE

## OVERVIEW

`css/` owns ordered style modules loaded directly by `index.html`; load order is part of the validated project contract.

## WHERE TO LOOK

| Task                | Location                                                                       | Notes                                              |
| ------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------- |
| Design tokens       | `variables.css`                                                                | Prefer existing variables before new colors/sizes. |
| Base/reset          | `base.css`, `components.css`, `animations.css`                                 | Shared foundations.                                |
| Quiz layout         | `quiz-surface.css`, `subject-content.css`, `overview-question-inputs.css`      | Main answer/input surfaces.                        |
| Start modal         | `modal-settings.css`, `start-modal-*.css`                                      | Modal shell plus selectors/settings/controls.      |
| Subject exceptions  | `subject-input-overrides.css`, `subject-patterns.css`, `subject-overrides.css` | Narrow fixes for subject-specific content.         |
| Spelling UI         | `spelling-*.css`                                                               | Separate spelling quiz surface.                    |
| Result/character UI | `character-result.css`, `result-character-modal.css`                           | Result character and dialog presentation.          |

## CONVENTIONS

- Keep the CSS link order in `index.html` synchronized with the sentence in `README_MODULES.md`.
- Add new styles to the narrowest existing CSS module that matches the UI surface.
- Use `styles.css` only as the existing compatibility entry, not as a new catch-all.
- Preserve responsive behavior and avoid text/input overlap; many quiz rows have long Korean labels.
- Query params on CSS links are allowed for cache busting, but validation normalizes paths.
- Existing overrides are strong in subject-specific files; check `!important`, id selectors, and later-loaded files before assuming a rule is unused.
- Some selectors depend on exact placeholder text such as `input[placeholder='단계 활동']`; copy changes can affect styling.

## ANTI-PATTERNS

- Do not resurrect `css/layout.css`, `css/modals.css`, or `css/responsive.css`.
- Do not solve subject-specific issues in broad base files unless the rule is truly shared.
- Do not change CSS order as a visual tweak without running the structure validator.
- Do not add new uses of non-standard selectors such as `:contains(...)`; existing occurrences are a maintenance risk, not a pattern to copy.
- Treat `body:has(...)` usage as browser-facing CSS that needs real browser verification.

## VERIFY

```bash
npm test
npm run lint
npx prettier --check css/*.css
```
