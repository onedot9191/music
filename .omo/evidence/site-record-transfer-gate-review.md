# Site record transfer gate review

- recommendation: REJECT
- originalIntent: 기존 정확한 프로덕션 origin의 localStorage 기록과 설정을 사용자의 한 번 클릭으로 새 정확한 프로덕션 origin에 안전하게 이전한다.
- desiredOutcome: 허용된 키/접두사만 전달하고, 양쪽 창이 origin/source/token을 검증하며, 실패 시 성공으로 표시하지 않고 기존 기록을 보존한다. 새 주소 직접 방문에는 이전 UI가 나타나지 않는다.

## User outcome review

정상 경로의 한 번 클릭 handshake, 새 주소 직접 방문, 완료 UI, 모바일/태블릿/데스크톱 레이아웃은 구현 및 QA 이미지와 일치한다. 그러나 localStorage 쓰기 실패가 성공으로 보고되는 경로가 있어 실패 안전성 기준을 충족하지 못한다.

## Blockers

1. violatedCriterion: `FAILURE-SAFETY`
   - observation: `setJsonStorageItem()`은 quota/security/serialization 오류를 잡아 `false`를 반환하지만 `importStorageData()`는 각 반환값을 무시하고 항상 `true`를 반환한다. 따라서 새 사이트는 실제 저장 실패 또는 부분 저장에도 `ok: true`를 old opener에 보내고 완료 화면으로 이동한다.
   - evidencePointer: `modules/local-storage-json.js:6-13`, `modules/storage-maintenance.js:85-98`, `modules/site-migration-notice.js:145-155`

## Notes

- Exact-origin/source/token checks: production constants와 `event.origin === expectedOrigin && event.source === expectedSource`, token equality 검사가 양 방향에 적용됨 (`modules/site-migration-notice.js:1-4,43-49,93-107,133-150`).
- Allowed storage scope: 명시 키 9개와 `curriculum-order:`, `curriculum-inline-order:` 접두사만 export/import됨 (`modules/storage-config.js:1-20`, `modules/storage-maintenance.js:59-93`). unknown-key 차단 테스트가 있음 (`scripts/test-storage-transfer.js:30-64`).
- One-click behavior: 클릭 1회로 새 창을 열고 READY→DATA→COMPLETE handshake를 수행함 (`modules/site-migration-notice.js:69-120,182-188`). 정상 경로 테스트와 browser QA가 있음.
- Direct new site: transfer/completion hash가 없는 새 hostname에서는 modal을 열지 않음 (`modules/site-migration-notice.js:191-205`), `new-direct-mobile.jpg`와 QA 기록이 이를 뒷받침함.
- Visual/copy: `old-*`, `success-*`, `new-direct-mobile.jpg`를 확인했으며 겹침/잘림 없이 행동과 보존 범위를 설명한다.
- Slop/overfit direct pass: 삭제만 검증하는 테스트나 요청 문구 고정 테스트는 없음. 다만 `scripts/test-site-migration-notice.js`는 mock 중심이며 sender 측 wrong-origin/wrong-source/token, popup blocked/timeout, import failure를 검증하지 않아 false confidence가 있다. 이 자체는 별도 성공 기준 위반으로 차단하지 않지만 blocker 회귀 테스트가 필요하다.
- Programming pass: 새 production module은 185 pure LOC로 250 LOC 제한 이내다. `receiveTransferredRecords`의 5개 인자는 유지보수 note이나 명시 성공 기준 위반은 아니다.

## Checked artifacts

- `git diff`, current untracked source/tests
- `modules/site-migration-notice.js`
- `modules/storage-config.js`
- `modules/storage-maintenance.js`
- `modules/local-storage-json.js`
- `scripts/test-site-migration-notice.js`
- `scripts/test-storage-transfer.js`
- `.omo/evidence/site-record-transfer/qa-results.md`
- `.omo/evidence/site-record-transfer/{old-desktop,old-tablet,old-mobile,success-desktop,success-tablet,success-mobile,new-direct-mobile}.jpg`
- `npm test`: PASS (reproduced)
- `npm run lint`: PASS (reproduced)
- Prettier: FAIL globally on eight pre-existing files; no changed transfer file was named in warnings.

## Exact evidence gaps

- No regression test forces `localStorage.setItem()` failure and proves import returns false without a success completion state.
- No artifact demonstrates rollback/atomicity for a failure after one allowed key has already been written.
- No code-review report or manual QA failure-path matrix was present under `.omo/evidence/site-record-transfer`; direct review supplied coverage but proves the blocker above.
