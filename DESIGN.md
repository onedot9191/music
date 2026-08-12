# Music Quiz Design System

## 1. Atmosphere & Identity

빠르게 읽고 바로 문제 풀이에 들어갈 수 있는 한국어 학습용 픽셀 게임 UI다. 어두운 남색 표면, 검은 픽셀 테두리, 빨강과 노랑의 강한 상태색, Galmuri 계열 표시 글꼴이 정체성을 만든다. 새로운 화면은 이 문법을 확장하되 기존 퀴즈보다 시각적으로 앞서지 않는다.

## 2. Color

### Palette

| Role              | Token                | Value     | Usage                   |
| ----------------- | -------------------- | --------- | ----------------------- |
| Background/deep   | `--bg-dark`          | `#080d18` | 페이지 배경             |
| Background/raised | `--bg-light`         | `#101827` | 페이지 배경 그라데이션  |
| Surface/default   | `--surface`          | `#1b2940` | 카드와 모달             |
| Surface/elevated  | `--surface-elevated` | `#263956` | 강조 표면               |
| Surface/muted     | `--surface-muted`    | `#121b2d` | 보조 표면과 스크롤 트랙 |
| Action/default    | `--primary-strong`   | `#b91c1c` | 기본 버튼               |
| Action/hover      | `--primary`          | `#ef4444` | 버튼 hover와 오류       |
| Accent            | `--accent`           | `#ffe600` | 선택과 강한 강조        |
| Border/strong     | `--border-strong`    | `#03050b` | 픽셀 외곽선과 그림자    |
| Border/soft       | `--border-soft`      | `#5f6f8f` | 보조 경계               |
| Text/primary      | `--text-light`       | `#ffffff` | 제목과 주요 본문        |
| Text/secondary    | `--text-muted`       | `#bac7d8` | 보조 설명               |
| Status/success    | `--correct`          | `#00c853` | 정답과 완료             |
| Status/error      | `--incorrect`        | `#ef4444` | 오답과 오류             |
| Status/warning    | `--retrying`         | `#ff9f1c` | 재시도와 경고           |
| Status/info       | `--revealed`         | `#5f9fcb` | 공개와 정보             |

새 UI는 `css/variables.css`의 의미 토큰을 사용한다. 기능에 필요한 새로운 색상이 생기면 먼저 이 표와 `variables.css`에 의미 역할을 추가한다.

## 3. Typography

### Font Stack

- Base: `--font-base`, `Noto Sans KR`, sans-serif
- Display: `--font-display`, `Galmuri9`, `Galmuri11`, `Press Start 2P`, cursive
- Mono: `--font-mono`, `Galmuri9`, monospace

### Scale

| Level      | Size     | Usage               |
| ---------- | -------- | ------------------- |
| Display    | `3rem`   | 모달 주요 제목      |
| Heading    | `2.4rem` | 모달 내부 섹션 제목 |
| Body/large | `1.8rem` | 모달 안내문         |
| Body       | `1.6rem` | 기본 본문과 입력    |
| Control    | `1.4rem` | 버튼                |
| Caption    | `1.2rem` | 배지와 보조 정보    |

본문은 `1.4rem`보다 작게 만들지 않는다. 한국어 문장은 의미 단위로 자연스럽게 줄바꿈되도록 고정 높이를 피한다.

## 4. Spacing & Layout

기준 단위는 `0.4rem`이다.

| Token        | Value    | Usage              |
| ------------ | -------- | ------------------ |
| `--space-xs` | `0.4rem` | 아이콘과 짧은 간격 |
| `--space-sm` | `0.8rem` | 밀집된 컨트롤      |
| `--space-md` | `1.6rem` | 기본 내부 간격     |
| `--space-lg` | `2.4rem` | 카드 내부 간격     |
| `--space-xl` | `3.2rem` | 모달 좌우 간격     |

페이지는 문서 흐름을 사용하고, 모달 오버레이가 자체 스크롤을 소유한다. 모달은 화면 너비의 90%, 최대 600px이며 높이는 뷰포트의 90%를 넘지 않는다. 좁은 화면에서는 한 열로 재배치하고 기본 콘텐츠에 가로 스크롤을 만들지 않는다.

## 5. Components

### Button

- **Structure**: 네이티브 `button.btn`
- **Variants**: 기본, 선택, 비활성, 로딩
- **Spacing**: `--space-sm`과 `--space-md` 범위
- **States**: hover에서 위로 1px 이동, active에서 눌림, `:focus-visible`에 노란 외곽선, disabled에서 그림자 제거
- **Accessibility**: 한 줄의 명확한 동사형 레이블, 키보드 실행, AA 대비
- **Motion**: 120-140ms의 transform, shadow, background 전환

### Modal

- **Structure**: `div.modal-overlay[role='dialog'][aria-modal='true'] > .modal-content`
- **Variants**: 시작, 결과, 가이드, 상태 공지
- **Spacing**: `--space-md`부터 `--space-xl`
- **States**: 기본 비표시, `.active` 표시, 내부 스크롤
- **Accessibility**: `aria-labelledby`, 열릴 때 모달 내용으로 포커스 이동, 명시적 닫기 버튼
- **Motion**: 오버레이 opacity와 콘텐츠 transform만 사용하며 `prefers-reduced-motion`에서 제거
- **Layout**: 중앙 정렬 stack, 오버레이가 세로 스크롤 소유

### Card

- **Structure**: `.card` 또는 역할별 표면 컨테이너
- **Variants**: 기본, 상태별 강조
- **Spacing**: `--space-lg`
- **States**: 내용 상태에 따라 success, error, warning 토큰 사용
- **Accessibility**: 색상만으로 상태를 전달하지 않고 텍스트를 함께 제공
- **Motion**: 기본적으로 정적

## 6. Motion & Interaction

| Type     | Duration    | Usage                     |
| -------- | ----------- | ------------------------- |
| Micro    | `120-140ms` | 버튼 hover와 active       |
| Standard | `220-280ms` | 모달 오버레이와 표면 전환 |
| Emphasis | `460-520ms` | 기존 모달 진입 강조       |

모션은 피드백과 상태 전환만 설명한다. `transform`과 `opacity` 중심으로 구현하고 `prefers-reduced-motion: reduce`에서는 비필수 애니메이션을 제거한다.

## 7. Depth & Surface

전략은 **픽셀 테두리와 단단한 그림자의 혼합**이다.

- 기본 경계: `--pixel-border`
- 강한 표면 그림자: `--shadow-hard`
- 보조 표면 그림자: `--shadow-soft`
- 모서리: `--radius-sm`, `--radius-md`, `--radius-lg`, 모두 0
- 표면 깊이: `--surface`에서 더 어두운 남색으로 이어지는 세로 그라데이션

둥근 카드, 흐린 유리 효과, 외곽 네온 광선은 기존 시각 언어와 맞지 않으므로 추가하지 않는다.

## 8. Accessibility Constraints & Accepted Debt

### Constraints

- 목표는 WCAG 2.2 AA다.
- 모든 대화형 요소는 키보드로 도달 가능하고 명확한 `:focus-visible` 상태를 가진다.
- 본문 대비는 4.5:1, 큰 텍스트와 UI 경계는 3:1 이상을 목표로 한다.
- 이미지에는 목적을 설명하는 대체 텍스트와 고정 종횡비를 제공한다.
- 모달은 제목 연결, 초기 포커스, 명시적 완료 동작을 제공한다.
- `prefers-reduced-motion`을 존중하며 375px에서 주요 콘텐츠가 잘리거나 겹치지 않아야 한다.

### Accepted Debt

현재 승인된 신규 디자인 부채는 없다. 기존 전역 모달 관리자는 완전한 focus trap을 제공하지 않으며, 이번 변경은 기존 동작을 악화시키지 않는 범위에서 같은 계약을 따른다.
