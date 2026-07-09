# MODULES KNOWLEDGE BASE

## OVERVIEW

`modules/` owns runtime behavior as small ES modules imported by `app.js`, the partial loader, or the devtools registry.

## WHERE TO LOOK

| Task               | Location                                                                 | Notes                                                       |
| ------------------ | ------------------------------------------------------------------------ | ----------------------------------------------------------- |
| App initialization | `app-initializer.js`, `app-runtime-helpers.js`                           | Startup state and orchestration helpers.                    |
| Event wiring       | `app-event-bindings.js`, `*-events.js`                                   | Keep event registration separate from feature calculations. |
| Game lifecycle     | `game-session-*.js`, `game-timer-controller.js`, `stage-*.js`            | Session start/reset/timer/stage flow.                       |
| Answer handling    | `answer-*.js`, `input-*.js`                                              | Candidate extraction, grading, feedback, and input sizing.  |
| Storage            | `storage*.js`, `local-storage-json.js`                                   | Storage facade plus focused record modules.                 |
| Quiz partials      | `quiz-partial-loader.js`, `quiz-partials-manifest.js`                    | Must stay aligned with `partials/`.                         |
| Start modal        | `start-modal-*.js`, `mode-selection-events.js`, `time-setting-events.js` | Subject/topic/mode/time controls.                           |
| Spelling quiz      | `spelling-*.js`                                                          | Separate quiz mode with its own data/view/session files.    |
| Results/share      | `progress-modal-controller.js`, `result-*.js`, `canvas-share-targets.js` | Result modal and capture/share flow.                        |

## CONVENTIONS

- Prefer one responsibility per file; follow existing name prefixes such as `audio-*`, `storage-*`, `game-session-*`, `start-modal-*`.
- Keep browser globals explicit and rare. Current intentional globals are `window._modules` and `window.isSoundEnabled`.
- If a module should be inspectable in devtools, add it to `module-registry.js` and run `npm test` to catch duplicate/missing imports.
- DOM-heavy modules accept DOM references or query known ids/classes; do not introduce framework-style component state.
- Keep compatibility re-exports only when an existing import path needs them.

## ANTI-PATTERNS

- Do not move large behavior back into `app.js`.
- Do not bypass `quiz-partials-manifest.js` for top-level partial lists.
- Do not silently change storage key names in `storage-config.js`; saved progress depends on them.
- Do not remove audio fallbacks unless browser playback behavior has been manually checked.

## VERIFY

```bash
npm test
npm run lint
```
