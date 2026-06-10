# 코드 개선 상태

## 현재 상태

- `app.js`는 617줄의 부트스트랩 파일로 남아 있으며, 주요 기능 구현은 `modules/`로 분리되어 있다.
- `index.html`의 대형 퀴즈 본문은 partial 구조로 분리되어 초기화 전에 로드된다.
- `styles.css`는 호환용 엔트리만 남기고, 실제 스타일은 `css/*.css` 책임별 파일로 분리되어 있다.
- 제거된 레거시 파일명은 새 코드에서 사용하지 않는다.
  - `modules/timer.js`
  - `modules/ui.js`
  - `modules/stats.js`
  - `modules/migration-helper.js`
  - `css/layout.css`
  - `css/modals.css`
  - `css/responsive.css`

## 완료된 정리 축

- 상수, 오디오, 스토리지, 통계, 타이머, 게임 세션, 입력 채점, 정답 공개, 결과 캡처, 시작 모달, 맞춤법 퀴즈를 모듈 단위로 분리했다.
- 62개 퀴즈 `main`과 대형 과목 섹션을 partial로 분리하고 검증 스크립트를 추가했다.
- CSS는 공통 기반, 퀴즈 표면, 시작 모달, 상태 패널, 과목 콘텐츠, 맞춤법, 결과/캐릭터 영역으로 나눴다.
- `README_MODULES.md`에 현재 로드 순서와 모듈 책임을 문서화했다.

## 남은 관리 기준

- `app.js`는 실행 순서가 중요한 조립 코드이므로, 새 기능 구현을 직접 추가하지 않는다.
- 새 UI 스타일은 기존 CSS 책임 파일 중 하나에 넣고, 책임이 새로 생길 때만 CSS 파일을 추가한다.
- 새 런타임 기능은 `modules/`에 독립 컨트롤러나 헬퍼로 만들고 `app.js`에서는 조립만 한다.
- 과목별 HTML이 커지면 `partials/quiz-main-sections/`에 섹션 partial로 분리한다.

## 검증 명령

```bash
npm test
npm run lint
npx prettier --check index.html README_MODULES.md app.js modules/*.js css/*.css scripts/*.js
```
