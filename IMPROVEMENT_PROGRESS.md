# 코드 개선 진행 기록

## 완료

- `app.js`에서 상수, 오디오, 스토리지, 통계, 타이머, 게임 세션, 입력 처리, 결과 처리, 시작 모달, 맞춤법 퀴즈 로직을 모듈로 분리했다.
- 대형 퀴즈 HTML을 `partials/quiz-mains/`와 `partials/quiz-main-sections/`로 분리했다.
- 대형 CSS를 `css/` 아래 책임별 파일로 분리했다.
- `styles.css`는 호환용 엔트리로 축소했다.
- partial 검증 스크립트와 npm `check/test/lint` 흐름을 정리했다.

## 현재 점검 포인트

- `app.js`는 새 기능 구현 장소가 아니라 조립 장소로 유지한다.
- `modules/storage.js`, `modules/audio.js` 같은 facade는 외부 API 호환을 위해 유지한다.
- 새 과목 콘텐츠는 가능하면 partial 섹션으로 추가한다.
- 새 스타일은 가장 가까운 책임의 CSS 파일에 배치한다.

## 기본 검증

```bash
npm test
npm run lint
npx prettier --check index.html README_MODULES.md app.js modules/*.js css/*.css scripts/*.js
```
