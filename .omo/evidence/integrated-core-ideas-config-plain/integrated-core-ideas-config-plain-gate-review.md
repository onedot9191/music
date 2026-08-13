# Final Gate Review: integrated core ideas multi-blank

## recommendation

REJECT (REVISE)

## originalIntent

부분 빈칸 모드에서 한 문장에 서로 독립적인 빈칸 범위를 여러 개 저장하고, 설정 화면에서 모두 표시하며, 설정 완료 후 각 범위를 별도 inline input으로 렌더링한다. 기존 단일 문자열 preference는 동일 의미의 1-item array로 호환 정규화되어야 한다.

## desiredOutcome

- 한 행의 비중첩 선택 여러 개가 배열로 저장된다.
- 설정 화면에서 모든 선택이 동시에 보인다.
- 부분 모드에서 선택마다 독립 input이 생성된다.
- 겹치는 범위는 함께 저장/렌더링되지 않는다.
- 기존 단일 문자열 preference의 의미가 손실 없이 `[normalizedString]`으로 이전된다.
- 기존 `data-group`/`data-ignore-order` 채점 및 reveal 흐름과 호환된다.

## userOutcomeReview

다중 선택의 핵심 화면 결과는 캡처와 브라우저 리포트에서 확인된다. `config-after-release-1280.png`는 첫 문장에 두 mark를, `partial-multiple-blanks-1280.png`는 같은 문장에 두 inline input을 보여 준다. `browser-report.json`도 `storedBlanks` 두 개와 `firstPromptInputs: 2`를 기록한다. 각 input은 기존 `input[data-answer]` 계약을 유지하고 카드의 `data-group data-ignore-order` 아래 생성되므로 기존 multiset 채점/reveal 탐색에 포함된다.

그러나 레거시 단일 문자열 정규화가 이전 동작을 완전히 보존하지 않는다. 이전 구현은 문자열을 `trim()`한 후 검증/저장했지만, 현재 `getValidBlankParts`는 trimmed 값으로 유효성만 검사하고 원문 값을 반환한다. 문장 경계 때문에 양끝 공백을 포함한 기존 값은 실패하여 사용자 값 대신 기본값으로 대체된다. 직접 재현: `blankParts: ['  생각하며  ']`와 첫 답변 문장을 입력하면 기대값 `['생각하며']`가 아니라 `['내가 누구인지']`가 반환된다.

## blockers

1. **violatedCriterion:** C5 — existing single-string preferences must normalize into one-item arrays without semantic loss
   - **observation:** 공백이 포함된 유효 legacy string이 trim된 1-item array로 이전되지 않고 default selection으로 대체된다.
   - **evidencePointer:** `modules/integrated-core-ideas-mode.js:47-65, modules/integrated-core-ideas-mode.js:120-131`; direct reproduction: `normalizeCoreIdeaSettings({blankParts:['  생각하며  ']}, ['내가 누구인지 생각하며 생활한다']).blankParts[0]` => `["내가 누구인지"]`.

## notes

- C1/C2/C3: 다중 저장, 설정 mark, 다중 inline input은 지정 캡처와 `browser-report.json`으로 확인됨.
- C4: `getValidBlankParts`가 위치 정렬 후 겹치는 범위를 제외한다. 테스트는 대표 overlap 사례를 검증한다.
- C6: 생성 input마다 `data-answer`가 있고 기존 card의 `data-group data-ignore-order` 내부에 유지된다. `answer-grading.js`의 grouped multiset 경로 및 `answer-feedback-controller.js`의 reveal 경로와 구조적으로 호환된다.
- Design integrity: 1280px 두 캡처에서 겹침, 잘림, 상태 불명확성은 발견되지 않았다. 모바일 증거는 이번 입력에 없지만 명시 기준은 아니므로 blocker가 아니다.
- Slop/overfit direct pass: 새 테스트는 삭제 여부나 구현 문자열을 고정하지 않고 observable normalization 결과를 검증한다. 다만 legacy trim 경계를 빠뜨려 false confidence가 생겼다. production helper는 다중 render/settings/normalization에 공통 사용되어 needless extraction은 아니다. 새 dependency/debug/dead code는 없다. 모듈은 290 pure LOC로 skill의 일반 크기 note 대상이나 프로젝트 기존 구조 및 이 목표의 명시 기준 위반은 아니므로 blocker가 아니다.

## verification

- `npm test`: PASS
- `npm run lint`: PASS
- `node scripts/test-integrated-core-ideas-mode.js`: PASS
- `git diff --check`: PASS
- `npx prettier --check modules/integrated-core-ideas-mode.js scripts/test-integrated-core-ideas-mode.js`: PASS
- Legacy whitespace adversarial reproduction: FAIL (blocker above)

## checkedArtifactPaths

- `/Users/ibyeonghyeon/Documents/GitHub/music/modules/integrated-core-ideas-mode.js`
- `/Users/ibyeonghyeon/Documents/GitHub/music/scripts/test-integrated-core-ideas-mode.js`
- `/Users/ibyeonghyeon/Documents/GitHub/music/modules/answer-grading.js`
- `/Users/ibyeonghyeon/Documents/GitHub/music/modules/answer-feedback-controller.js`
- `/Users/ibyeonghyeon/Documents/GitHub/music/partials/quiz-mains/integrated-core-ideas.html`
- `/Users/ibyeonghyeon/Documents/GitHub/music/.omo/evidence/integrated-core-ideas-config-plain/config-after-release-1280.png`
- `/Users/ibyeonghyeon/Documents/GitHub/music/.omo/evidence/integrated-core-ideas-config-plain/partial-multiple-blanks-1280.png`
- `/Users/ibyeonghyeon/Documents/GitHub/music/.omo/evidence/integrated-core-ideas-config-plain/browser-report.json`

## exactEvidenceGaps

- 이 목표 전용 executor report, code-review report, manual QA matrix, notepad path는 제공되거나 발견되지 않았다. 따라서 별도 report의 `programming`/`remove-ai-slops` coverage는 확인할 수 없으며 본 gate가 직접 수행했다.
- `omo ulw-loop status --json`은 `omo: command not found`로 실패했다. 제공된 attempt evidence directory에 report를 기록했다.
- 실제 정답 입력 후 채점/reveal을 수행한 브라우저 기록은 없다. production DOM 및 채점 호출 경로 검토로 호환성을 확인했으며 이는 현재 blocker의 근거가 아니다.
