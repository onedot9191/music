# 모듈 구조 가이드

이 프로젝트는 더 이상 `app.js`와 `styles.css`에 기능을 계속 추가하는 구조가 아니다. 새 기능은 책임별 모듈과 CSS 파일에 둔다.

## 현재 원칙

- `app.js`는 애플리케이션 부트스트랩과 컨트롤러 조립을 담당한다.
- 런타임 로직은 `modules/` 아래의 작은 책임 단위 파일에 둔다.
- 퀴즈 본문 HTML은 `partials/quiz-mains/`와 `partials/quiz-main-sections/`에 둔다.
- 스타일은 `css/*.css` 책임별 파일에 둔다.
- `styles.css`는 기존 경로 호환을 위한 빈 엔트리 파일로 유지한다.
- 개발자 도구용 모듈 접근은 `modules/module-registry.js`의 `window._modules`를 사용한다.

## 주요 경계

- 오디오: `audio*.js`
- 스토리지: `storage*.js`, `local-storage-json.js`
- 게임 세션: `game-session-*.js`, `game-timer-controller.js`, `game-state.js`
- 입력 채점/피드백: `answer-*.js`, `input-*.js`
- 시작 모달: `start-modal-*.js`, `mode-selection-events.js`, `time-setting-events.js`
- 맞춤법 퀴즈: `spelling-*.js`
- 결과/공유: `result-*.js`, `canvas-share-targets.js`, `hidden-section-capture.js`
- 퀴즈 partial: `quiz-partial-loader.js`, `quiz-partials-manifest.js`

## CSS 배치 기준

- 공통 기반: `variables.css`, `base.css`, `components.css`, `animations.css`
- 퀴즈 표면: `quiz-surface.css`, `pe-activity-surface.css`
- 시작 모달: `modal-settings.css`, `start-modal-settings.css`, `start-modal-selectors.css`, `start-modal-controls.css`
- 상태 패널: `activity-status.css`, `dday-status.css`, `daily-blank-count.css`, `wrong-answer-status.css`
- 과목 콘텐츠: `subject-content.css`, `overview-question-inputs.css`, `subject-input-overrides.css`, `subject-patterns.css`, `subject-overrides.css`
- 맞춤법: `spelling-quiz-specific.css`, `spelling-progress.css`, `spelling-dataset.css`, `spelling-feedback.css`

## 변경 전 확인

```bash
npm test
npm run lint
npx prettier --check index.html README_MODULES.md app.js modules/*.js css/*.css scripts/*.js
```

브라우저 동작이 필요한 변경은 로컬 서버에서 실제 CSS 로드 순서와 computed style을 확인한다.
