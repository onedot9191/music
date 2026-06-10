# 파일 모듈화 상태 보고서

## 현재 상황

웹사이트는 기존 기능을 유지하면서 공통 코드와 페이지 전용 자산을 모듈 파일로 분리해 사용합니다.

## JavaScript 모듈

- `constants.js` - 앱 공통 상수, 과목/주제 표시명 정의
- `accordion-events.js` - 아코디언 섹션 열기/닫기와 키보드 이벤트 바인딩
- `app-event-bindings.js` - 앱 전역 이벤트 바인딩 조립
- `app-initializer.js` - 초기 과목/주제 설정, 시작 모달 표시, 기본 모드 UI, 도형 제목 초기화
- `app-runtime-helpers.js` - 엔트리 조립에 필요한 현재 main, 정답 정규화, 타이머/완료 래퍼 관리
- `answer-input-controller.js` - 빈칸 입력 이벤트 처리와 채점/피드백/진행 흐름 조립
- `answer-input-feedback.js` - 빈칸 입력의 정답/오답/재시도 CSS 상태 적용
- `answer-input-grader.js` - 직접 채점과 그룹/순서무시 채점 경로 선택
- `answer-candidates.js` - `data-answer`, `data-accept`, 괄호 표기에서 정답 후보 생성
- `answer-feedback-controller.js` - 정답/오답 입력 피드백과 콤보/진행 흐름 조립
- `answer-history-cleanup.js` - 입력 재정답 시 이전 오답/정답 저장 기록 정리
- `answer-reveal-button.js` - 통합 모형/제목 입력의 미니 정답 버튼 DOM 생성
- `audio.js` - 오디오 관리자 클래스
- `audio-buffer-processing.js` - 디코딩된 효과음 버퍼 트림, 오프셋 제거, 꼬리 페이드 처리
- `audio-config.js` - 효과음 파일 경로, 볼륨 배율, 기본 볼륨 계산 설정
- `audio-debug.js` - 옵션성 오디오 디버그 로그 제어
- `audio-fail-buffer-player.js` - `fail` 효과음의 WebAudio 라우팅, 버퍼 디코딩, 샘플 기반 페이드 재생
- `audio-playback-controller.js` - 효과음 설정 확인, AudioManager 위임, HTMLAudioElement 폴백 재생
- `audio-refs.js` - 메인 앱에서 쓰는 오디오 요소 별칭 생성
- `audio-synth-fail.js` - 합성형 `fail` 효과음 생성과 정리
- `button-loading-state.js` - 복사/공유 버튼 loading 상태와 원문 텍스트 복구 처리
- `canvas-share-targets.js` - 캔버스 이미지를 Web Share 또는 클립보드로 전달하는 브라우저 API 래퍼
- `daily-blank-count-controller.js` - 오늘 푼 빈칸 수 표시와 50개 단위 축하 팝업 처리
- `dday.js` - D-Day 렌더러 조립과 기존 렌더링 API 유지
- `dday-date.js` - 11월 둘째 토요일 기준 D-Day 날짜, 텍스트, 진행률 계산
- `dday-track-view.js` - D-Day 경주 트랙 DOM 생성, 픽셀 버섯 캔버스, 트랙 애니메이션
- `character-state.js` - 캐릭터 표정과 콤보 성장 상태 제어
- `utils.js` - 시간/날짜 포맷과 기존 입력폭 유틸 호환 재수출
- `wrong-answer-tracker.js` - 문제 ID 생성, 오답 횟수 저장, 오답 표시 갱신
- `visual-effects.js` - 입력 파티클, 콤보 confetti, 모션 감소/모바일 효과 제한
- `storage-answer-records.js` - 오답/정답 기록 키 생성, 레코드 갱신/삭제, 오답 통계 집계
- `storage-achievements.js` - 성취 데이터 병합 저장, 최고 점수, 연속 기록 갱신
- `storage-config.js` - 로컬스토리지 키와 기본 설정/성취 데이터 정의
- `storage-game-settings.js` - 게임 설정과 마지막 게임 상태 저장/복원
- `storage-preferences.js` - 사용자 환경설정 병합 저장과 단일 설정 조회
- `storage-stats-records.js` - 일일 통계, 최고 점수, 연속 기록 계산
- `storage.js` - 통계, 설정, 성취, 오답/정답 기록 저장소 facade 클래스
- `dom-elements.js` - 메인 앱 DOM 참조 생성
- `dom-utils.js` - DOM 텍스트 측정과 입력 너비 보정 구현, 기존 정답 후보 export 호환
- `game-control-events.js` - 시작, 리셋, 강제 종료, 결과 정답 공개, 캐릭터 카운트 표시 이벤트 바인딩
- `game-session-controller.js` - 게임 시작/리셋 흐름 조립과 세션 상태 전환
- `game-session-reset.js` - 입력/퀴즈/시작 모달/역량 탭 리셋과 시작 모달 선택 동기화
- `game-session-start.js` - 게임 시작 시 타이머 지속시간 계산, 타이머 UI 표시, 타이머 interval 시작
- `game-state.js` - 게임 상태와 특수 과목 Set 초기화
- `game-timer-controller.js` - 타이머 tick, 시간 초과 처리, 게임오버 결과창 진입
- `game-utils.js` - 답안 정규화, main ID 결정, 완료 판정, 다음 입력 포커스 등 게임 흐름 유틸리티
- `heatmap-modal-events.js` - 6개월 히트맵 모달 열기/닫기 이벤트 바인딩
- `hidden-section-capture.js` - 비활성 탭 섹션을 캡처 가능하게 임시 표시하고 원래 상태 복구
- `overview-hierarchy.js` - 총론/통합 가이드 문항 계층 들여쓰기 규칙
- `overview-purple-text.js` - 특정 과목/주제의 빈칸 주변 텍스트 강조 규칙
- `ui-styling.js` - Overview 스타일 갱신 조립과 관련 탭 이벤트 바인딩
- `stats-heatmap-view.js` - 활동 히트맵/6개월 히트맵 DOM 렌더링과 히트맵 제목 갱신
- `stats-manager.js` - 일일 통계, 과목 정확도, 통계 public API와 히트맵 view 위임
- `spelling-data.js` - 맞춤법 퀴즈 데이터
- `spelling-quiz-data.js` - 맞춤법 데이터셋 선택, 문항 셔플, 괄호 선택지 파싱
- `spelling-progress-view.js` - 맞춤법 퀴즈 진행도 DOM 갱신과 진행 애니메이션
- `spelling-combo-effect.js` - 맞춤법 퀴즈 콤보 오버레이 효과
- `spelling-session-view.js` - 맞춤법 퀴즈 시작 컨트롤 표시, 완료 메시지, 뒤로가기 버튼 바인딩
- `spelling-quiz-view.js` - 맞춤법 문항 렌더링, 선택 버튼/키보드 이벤트, 선택 결과 UI
- `spelling-quiz.js` - 맞춤법 다지선다 퀴즈 라운드 상태, 점수, 데이터셋 선택 흐름
- `slot-machine-controller.js` - 콤보 슬롯머신 릴 상태, 당첨 효과, 리셋 처리
- `stage-completion-scheduler.js` - 섹션 완료 후 모델 제목 잠금 해제, 스테이지 클리어, 다음 스테이지 이동 예약
- `stage-clear-controller.js` - 스테이지 클리어/역량 섹션 축하, confetti, 타이머 재개 흐름
- `stage-navigation-controller.js` - 첫 스테이지 초기화, 다음 스테이지 이동, 첫 입력 포커스 처리
- `start-modal-controller.js` - 시작 모달 주제 버튼 렌더링, 정답률/히트맵/시간 표시 갱신
- `subject-topics.js` - 과목별 주제 매핑과 하위 메뉴 설정
- `model-gating.js` - 모델 주제 제목 탭 게이팅과 다음 버튼 설정
- `mode-selection-events.js` - Normal/Hard 모드 선택과 시간 설정 표시 전환 이벤트 바인딩
- `model-next-events.js` - 모델 주제 제목 공개와 다음 섹션 잠금 해제 버튼 바인딩
- `input-event-bindings.js` - 빈칸 입력의 blur/Enter 이벤트 바인딩과 다음 입력 포커스 처리
- `input-width-bootstrap.js` - 초기 입력 폭 보정과 홈 프로젝트 입력 보호 예약
- `input-width-policy.js` - 입력칸 자동 폭 보정 대상 과목 판단
- `layout-adjustments.js` - 레이아웃 보정 함수 조립과 기존 호출 API 유지
- `layout-input-widths.js` - 과목별 입력칸 폭 계산과 basic/curriculum 입력 폭 적용
- `layout-subject-transforms.js` - 창체 텍스트 공개, 과학 탐구 활동 래핑, 사회성 기능 목록 셔플
- `local-storage-json.js` - localStorage JSON 저장/조회/삭제와 사용 가능 여부 확인
- `practical-modal-events.js` - 실과 모델 제목 모달 닫기 이벤트 바인딩
- `progress-modal-controller.js` - 결과 진행률 산출, 결과 칭호/대사, 결과 모달 렌더링
- `quiz-partial-loader.js` - `index.html`에서 분리한 과목별 퀴즈 partial HTML과 `quiz-include` 섹션 partial 로드
- `quiz-partials-manifest.js` - 분리된 퀴즈 partial HTML 경로 목록
- `result-capture-options.js` - 결과/탭 html2canvas 옵션, clone 스타일 정리, 입력값 텍스트 치환
- `result-image-actions.js` - 결과창/탭 html2canvas 캡처와 복사/공유 버튼 이벤트 바인딩
- `result-progress.js` - 결과창 정답 수, 총 문항 수, 진행률 읽기/쓰기
- `section-groups.js` - 여러 섹션을 하나의 탭으로 묶는 과목별 섹션 그룹 정의
- `start-modal-events.js` - 시작 모달의 과목/주제/하위 메뉴 선택 이벤트 바인딩
- `start-modal-selection-state.js` - 시작 모달 과목/주제/하위 메뉴 선택 상태와 윤리 기본 시작 상태 갱신
- `tab-event-bindings.js` - 일반 탭, 하위 탭, 역량 탭 전환 이벤트 바인딩
- `tab-utils.js` - 탭/섹션 활성화와 기본 활동 섹션 선택 헬퍼
- `time-setting-events.js` - 시작 모달 시간 증감 버튼 이벤트 바인딩
- `typewriter-effect.js` - 결과/진행 모달 문구 타이핑 효과
- `answer-reveal.js` - 제목/섹션/역량 전체 정답 공개 처리와 순서 무시 답안 보정
- `section-matchers.js` - 입력이 속한 main/section 기반 과목 판별 헬퍼
- `answer-grading.js` - 그룹/순서 무시/모델명 생략 정답 판정
- `module-registry.js` - 개발자 도구에서 공통 모듈을 조회하기 위한 모듈 레지스트리
- `sound-settings.js` - 효과음 토글 설정

## CSS 모듈

- `variables.css` - CSS 변수
- `base.css` - 기본 스타일과 리셋
- `components.css` - 재사용 UI 컴포넌트
- `animations.css` - 공통 애니메이션
- `hud-controls.css` - 헤더 HUD, 타이머, 슬롯머신, 상단 버튼 스타일
- `quiz-surface.css` - 퀴즈 본문, 탭, 표, 빈칸 입력 상태 공통 스타일
- `pe-activity-surface.css` - 체육/신체활동 활동명, 예시, 하위 단계 입력 레이아웃 보정
- `modal-settings.css` - 공통 모달, 가이드 모달, 결과 모달 기본 스타일
- `start-modal-settings.css` - 시작 모달 난이도/시간/효과음 설정 그리드와 시작 버튼 스타일
- `start-modal-selectors.css` - 시작 모달 과목, 모드, 토픽, 시간 선택 버튼 상태 스타일
- `start-modal-controls.css` - 시작 모달 과목/주제 선택, 하위 메뉴, 효과음 토글 보조 스타일
- `activity-status.css` - 시작 화면 히트맵과 설정/활동 상태 패널 배치 스타일
- `dday-status.css` - D-Day 패널, 진행 트랙, 마커, 퍼센트 칩 스타일
- `daily-blank-count.css` - 오늘 푼 빈칸 수 표시와 50개 단위 축하 팝업 스타일
- `wrong-answer-status.css` - 오답 표시와 오답 기록 초기화 버튼 스타일
- `character-result.css` - 캐릭터 보조 UI, 캐릭터 상태/성장/악마 모드 애니메이션
- `result-character-modal.css` - 결과 모달 캐릭터 배치, 말풍선, 결과 대화 스타일
- `six-month-heatmap.css` - 6개월 학습 활동 히트맵 모달과 월별 히트맵 그리드 스타일
- `competency-ui.css` - 역량 섹션 아코디언, 역량 탭, 통합 섹션 배치 스타일
- `subject-content.css` - 과목별 퀴즈 카드, 성취기준/개요형 문항, 입력 상태 공통 스타일
- `overview-question-inputs.css` - 개요형 문항 빈칸 입력 폭, 포커스, 정답/오답/공개 상태 스타일
- `subject-input-overrides.css` - 과목별 특수 입력폭, reveal 버튼, 단계/하위 단계 입력 테두리 보정
- `creative-subject.css` - 창체 전용 카드, 영역/활동 목록, 창체 입력칸 반응형 스타일
- `english-subject.css` - 영어 기본이론 섹션 배치, 계층형 목록, 입력칸 가독성 보강 스타일
- `subject-patterns.css` - 미술 범주, 홈 프로젝트, 개요형 계층/말머리처럼 과목 콘텐츠에서 반복되는 표시 패턴
- `interaction-effects.css` - 입력 파티클, 콤보 confetti, 모바일 기본 보강 스타일
- `subject-overrides.css` - 달크로즈, 실과, 도형, 체육 뒷교 등 좁은 과목별 최종 오버라이드
- `styles.css` - 기존 경로 호환을 위한 CSS 엔트리 파일
- `spelling-quiz-specific.css` - 맞춤법 퀴즈 화면 골격, 선택 버튼, 문항 리스트 기본 스타일
- `spelling-progress.css` - 맞춤법 퀴즈 진행도 바와 완료 메시지 스타일
- `spelling-dataset.css` - 맞춤법 퀴즈 데이터셋 선택 화면과 뒤로가기 버튼 스타일
- `spelling-feedback.css` - 맞춤법 퀴즈 정답/오답/콤보 피드백 애니메이션
- `achievement-pairs.css` - 성취기준, 해설, 고려사항, 각론 카드 쌍 스타일
- `page-specific.css` - 역량/영역 페이지 전용의 소수 잔여 스타일

## 현재 적용 상태

- `index.html`은 구조와 외부 자산 연결을 담당합니다.
- 과목별 퀴즈 `main` 62개는 `partials/quiz-mains/*.html`로 분리되어 `quiz-partial-loader.js`가 초기화 전에 로드합니다.
- 큰 과목 파일은 `<!-- quiz-include: path/to/section.html -->` 주석으로 섹션 partial을 조립할 수 있습니다. 현재 `science-std.html`, `english.html`, `practical-std.html`, `overview.html`, `social-56.html`, `english-std.html`, `geometry-measure.html`, `korean-std.html`, `integrated-course.html`, `social-34.html`, `creative.html`, `math-operation.html`, `western-ethics.html`, `geometry.html`, `pe-course.html`, `moral-psychology.html`, `social.html`, `science.html`, `art-std.html`, `pe-model.html`, `music-std.html`, `physical-activity.html`, `moral-course.html`, `eastern-ethics.html`, `korean-model.html`, `math-course.html`, `practical.html`, `korean-course.html`, `art-course.html`, `data-probability.html`, `life-achievement.html`, `ethics.html`, `wise-achievement.html`, `joy-achievement.html`, `change-relation.html`, `science-course.html`, `practical-course.html`, `math-model.html`, `korean.html`, `area.html`, `music.html`, `competency.html`, `art-model.html`, `pe.html`, `music-course.html`, `art.html`, `english-course.html`, `social-course.html`, `pe-back.html`, `moral-principles.html`, `integrated-model.html`, `spelling.html`, `practical-lite.html`, `wise.html`, `life.html`, `music-elements.html`, `joy.html`, `integrated-guide-overview.html`, `ethics-lite.html`, `sports-functions.html`, `pe-lite.html`, `science-curriculum.html`은 `partials/quiz-main-sections/*/*.html`로 분리되어 있습니다.
- `app.js`는 주요 애플리케이션 엔트리 포인트로 유지하되, 공통 기능은 `modules/`에서 import합니다.
- CSS는 `variables.css`, `base.css`, `components.css`, `animations.css`, `hud-controls.css`, `quiz-surface.css`, `pe-activity-surface.css`, `modal-settings.css`, `start-modal-settings.css`, `start-modal-selectors.css`, `start-modal-controls.css`, `activity-status.css`, `dday-status.css`, `daily-blank-count.css`, `wrong-answer-status.css`, `character-result.css`, `result-character-modal.css`, `six-month-heatmap.css`, `competency-ui.css`, `subject-content.css`, `overview-question-inputs.css`, `subject-input-overrides.css`, `creative-subject.css`, `english-subject.css`, `subject-patterns.css`, `interaction-effects.css`, `subject-overrides.css`, `styles.css`, `spelling-quiz-specific.css`, `spelling-progress.css`, `spelling-dataset.css`, `spelling-feedback.css`, `achievement-pairs.css`, `page-specific.css` 순서로 로드됩니다.
- 앱 초기화, DOM 참조, 게임 상태, 게임 흐름 유틸, 오디오 참조, 오디오 재생 위임, 오늘 빈칸 카운트 표시, 히트맵 모달 이벤트, 실과 모달 이벤트, 퀴즈 partial 로딩, 캐릭터 상태, 과목별 주제 매핑, 모델 게이팅 설정, 모드 선택 이벤트, 모델 다음 버튼, 시간 설정 이벤트, 게임 컨트롤 이벤트 바인딩, 게임 세션 시작/초기화, 타이머/게임오버 처리, 스테이지 내비게이션, 스테이지 완료 예약, 오답 추적, 시각 효과, 슬롯머신, 타이핑 효과, 입력 이벤트 바인딩, 입력 채점 컨트롤러, 입력 피드백 컨트롤러, 입력 폭 보정 정책, 과목별 레이아웃 보정, 결과 이미지 액션, 결과 진행 상태, 결과 모달 표시, 맞춤법 퀴즈 컨트롤러, 스테이지 클리어 컨트롤러, 시작 모달 UI 컨트롤러, 시작 모달 이벤트 바인딩, 탭 이벤트 바인딩, 아코디언 이벤트 바인딩, 정답 공개 처리, 정답 판정, 섹션 판별, 효과음 설정, 모듈 레지스트리 부트스트랩은 별도 모듈로 분리되어 있습니다.
- 정답 후보 추출 구현은 `answer-candidates.js`, 입력 폭 보정 구현은 `dom-utils.js`에 두고, 기존 export는 호환용 재수출로 유지합니다.
- 기존 호환성을 위해 `window.isSoundEnabled`와 `window._modules` 전역 API는 유지합니다.

## 다음 리팩터링 순서

1. 남은 중형 partial의 섹션 경계를 점검해 `quiz-include` 적용 대상을 추가 선별
2. 브라우저 기반 회귀 테스트 추가

## 검증

- `npm test` - JavaScript 파일 파싱과 퀴즈 partial/include 구조 검증
- `npm run lint` - ESLint 실행
- `npm run dev` - 로컬 웹 서버 실행
