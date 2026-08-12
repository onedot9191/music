# 빈칸 정답 판정 Manual QA

실행일: 2026-08-12 (Asia/Seoul)

## 실행 요약

- `npm test`: PASS (구조/모듈/기존 grading 회귀 검사 포함).
- Production runtime driver: PASS 20/23, FAIL 3. `modules/answer-grading.js`, `modules/answer-input-grader.js`, `modules/game-utils.js`, `modules/input-event-bindings.js`를 실제 import하여 호출했다.
- HTTP 브라우저 표면: BLOCKED. `http-server`가 sandbox에서 `listen EPERM`으로 포트 바인딩되지 않아 curl을 실행할 수 없었다. 제품 결함으로 판정하지 않고 환경 blocker로 기록한다.

## surfaceEvidence

정확한 공통 실행 명령: `node /private/tmp/blank-qa-driver.mjs` (출력은 [runtime-driver.jsonl](runtime-driver.jsonl)).

| ID | 기준 | surface / exact invocation | verdict | artifactRefs |
|---|---|---|---|---|
| P0-01 | canonical direct | production `gradeInputAnswer`; 위 공통 명령 | PASS | A2 |
| P0-02 | wrong direct | production `gradeInputAnswer`; 위 공통 명령 | PASS | A2 |
| P0-03 | empty Enter allowEmpty | production `gradeInputAnswer` empty userAnswer; 위 공통 명령 | PASS | A2 |
| P0-04 | spaces/comma | production `normalizeAnswer` + `gradeInputAnswer`; 위 공통 명령 | PASS | A2 |
| P0-05 | `의` model normalization | production model `normalizeAnswer` + grader; 위 공통 명령 | PASS | A2 |
| P0-06 | parenthesis alias | production `getAnswerCandidates` + direct grader; 위 공통 명령 | PASS | A2 |
| P0-07 | explicit `data-accept` alias | production candidate expansion + direct grader; 위 공통 명령 | PASS | A2 |
| P0-08 | model without `모형` | production model strip path; 위 공통 명령 | PASS | A2 |
| P1-01 | model `의` + spaces | production model normalization; 위 공통 명령 | PASS | A2 |
| P1-02 | ordered group position fixed | production `gradeInputAnswer` ordered group; 위 공통 명령 | PASS | A2 |
| P1-03 | unordered group | production `[data-ignore-order]` grouped grader; 위 공통 명령 | PASS | A2 |
| P1-04 | duplicate capacity | production grouped grader with correct-class consumption; 위 공통 명령 | PASS | A2 |
| P1-05 | ordered duplicate retry | production `gradeGroupedAnswer` used-answer guard; 위 공통 명령 | PASS | A2 |
| P1-06 | competency/area grouped mode | production `isGroupedGradingInput`; 위 공통 명령 | PASS | A2 |
| P1-07 | art-std achievement order lock | production `gradeInputAnswer` forced ordered branch; 위 공통 명령 | PASS | A2 |
| P1-08 | Hangul IME composition | production `attachAnswerInputHandlers` keydown path; 위 공통 명령 | PASS | A2 |
| P1-09 | Tab/blank | production `attachAnswerInputHandlers` Tab path; 위 공통 명령 | PASS | A2 |
| P1-10 | blur after dirty | production input+blur handlers and requestAnimationFrame; 위 공통 명령 | PASS | A2 |
| P1-11 | alias reveal text | production direct grader `displayAnswer`; 위 공통 명령 | PASS | A2 |
| P1-12 | unordered duplicate across slots | production grouped grader + correct-class state; 위 공통 명령 | FAIL | A2 |
| P1-13 | internal `의` syllable | production model normalizer + direct grader; 위 공통 명령 | FAIL | A2 |
| P1-14 | arbitrary parenthetical suffix | production candidate/normalizer path; 위 공통 명령 | FAIL | A2 |
| P0-09 | empty Enter event | production `attachAnswerInputHandlers` keydown; 위 공통 명령 | PASS | A2 |
| HTTP-01 | static app HTTP | `node_modules/.bin/http-server -a 127.0.0.1 -p 8080`, then intended `curl -i http://127.0.0.1:8080/` | BLOCKED (environment) | A3 |

## adversarialCases

| ID | 기준 | adversarial class | expected behavior | verdict | artifactRefs |
|---|---|---|---|---|---|
| ADV-01 | P0-02 | wrong answer | reject and enter retry path | PASS | A2 |
| ADV-02 | P0-03 | empty Enter | process as incorrect without crash | PASS | A2 |
| ADV-03 | P0-04 | whitespace/comma | ignore formatting-only differences | PASS | A2 |
| ADV-04 | P0-05/P1-01 | particle `의` | model/curriculum configured particle omission only | PASS | A2 |
| ADV-05 | P0-06/P0-07 | parenthesis/alias | accept declared variants, expose canonical answer | PASS | A2 |
| ADV-06 | P1-02/P1-07 | order-sensitive group | reject answer belonging to another slot | PASS | A2 |
| ADV-07 | P1-03 | order-insensitive group | accept answer in any slot | PASS | A2 |
| ADV-08 | P1-04/P1-05 | duplicate answer | allow only available multiplicity / reject exhausted retry | PASS | A2 |
| ADV-09 | P1-08 | Hangul IME composition | ignore Enter while composing | PASS | A2 |
| ADV-10 | P1-09/P1-10 | Tab/blur dirty-state | blank Tab no grade; dirty blur grades once | PASS | A2 |
| ADV-11 | HTTP-01 | unavailable local port | report blocker, do not infer browser PASS | BLOCKED (environment) | A3 |
| ADV-12 | P1-12 | duplicate alias across unordered slots | second use beyond available canonical multiplicity must reject | FAIL | A2 |
| ADV-13 | P1-13 | internal particle substring | only standalone particle omission should pass; `의미` ≠ `미` | FAIL | A2 |
| ADV-14 | P1-14 | arbitrary parentheses injection | undeclared parenthetical text must reject | FAIL | A2 |

## artifactRefs

| id | kind | description | path |
|---|---|---|---|
| A1 | test-log | `npm test` successful output | [.omo/evidence/blank-qa/npm-test.txt](npm-test.txt) |
| A2 | runtime-log | 19 production-function scenarios, JSONL PASS records | [.omo/evidence/blank-qa/runtime-driver.jsonl](runtime-driver.jsonl) |
| A3 | blocker-log | loopback static-server bind failure (`listen EPERM`) | [.omo/evidence/blank-qa/http-server-error.txt](http-server-error.txt) |

## Blocking issues

1. HTTP/browser QA는 현재 실행 환경의 네트워크 sandbox가 `127.0.0.1:8080` 바인딩을 거부하여 수행하지 못했다. 로컬 승인된 실행 환경에서 `npm run dev` 후 `curl -i http://127.0.0.1:8080/`와 실제 Enter/Tab/blur UI 조작을 재실행해야 한다.
2. P1-12 FAIL: unordered grouped grading counts used answers by each input's canonical `data-answer`, not by the entered canonical answer. Entering `나` in the `가` slot then `나` again in the `나` slot yields `[true, true]` although only one `나` exists.
3. P1-13 FAIL: `normalizeAnswer` removes every `의` character in model/curriculum modes; canonical `의미` incorrectly accepts `미`.
4. P1-14 FAIL: generic parenthesis stripping makes canonical `정답` accept undeclared `정답(임의)`.
