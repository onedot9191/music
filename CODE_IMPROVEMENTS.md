# 코드 개선 요약

## 핵심 변경

- 대형 `app.js` 중심 구조를 책임별 모듈 조립 구조로 전환했다.
- 대형 `index.html` 퀴즈 본문을 partial 기반 구조로 전환했다.
- 대형 `styles.css` 중심 구조를 책임별 CSS 파일 구조로 전환했다.
- 레거시 모듈명과 CSS 파일명을 현재 구조에서 제거했다.
- `scripts/validate-quiz-partials.js`로 partial manifest와 실제 main 요소 수를 검증한다.

## 현재 주요 파일

- `app.js`: 앱 초기화와 컨트롤러 의존성 조립
- `modules/module-registry.js`: 개발자 도구용 모듈 레지스트리
- `modules/quiz-partial-loader.js`: partial 로딩
- `modules/quiz-partials-manifest.js`: partial 목록
- `modules/storage.js`: 스토리지 facade
- `modules/audio.js`: 오디오 facade
- `README_MODULES.md`: 현재 모듈/CSS/partial 구조 문서

## 검증 결과 기준

현재 구조가 깨지지 않았는지 판단할 때는 아래 명령이 기본 게이트다.

```bash
npm test
npm run lint
npx prettier --check index.html README_MODULES.md app.js modules/*.js css/*.css scripts/*.js
```

CSS 책임 분리나 화면 스타일 변경은 추가로 브라우저에서 실제 로드 순서와 computed style을 확인한다.
