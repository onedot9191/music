# Debug Journal — 핵심 아이디어 드래그 빈칸

Goal: 부분 모드 빈칸 설정에서 사용자가 드래그한 구절만 정확하게 저장한다.

## Environment

- Runtime: Node.js v24.16.0, static HTML served by `http-server` on port 8181
- Browser: local Chromium CDP on port 9333
- References: Node runtime, Playwright browser QA, debugging setup/investigation/fix/QA guidance

## Hypotheses

1. 드래그 종료 시 브라우저 선택 범위가 해당 문장 밖으로 확장되어 전체 문장이 저장된다.
2. 기존의 강조된 `mark` 요소와 새 드래그 선택이 섞여 선택 텍스트가 잘못 계산된다.
3. `pointerup`이 선택 범위가 확정되기 전에 실행되어 이전 선택 범위를 저장한다.

## Artifacts

- Browser repro and final screenshots/reports: this evidence directory

## Root cause

- `pointerup` could run before the browser had finalized the text selection. The handler then saw the preceding range or no range rather than the final dragged phrase.
- Replacing it with `mouseup` makes the selection available before the settings state is read. Touch selection waits one animation frame after `touchend` for the equivalent reason.
- Toggle proof: the real mouse drag selected and persisted `관계를` after the event change; the stored value and highlighted value match in `mouse-drag-report.json`.

## Scope

- Keep the existing normalization that removes only trailing sentence punctuation. A blank is an answer phrase rather than terminal punctuation.
