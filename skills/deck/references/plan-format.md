# 기획안 형식 (고정)

기획안은 **항상 아래 3개 섹션, 이 순서, 이 제목** 그대로 작성한다. 다른 섹션·설명·서론을 덧붙이지 않는다.
`## 2. 구성 한눈에 보기` 표와 `### NN · 제목` 헤딩은 `deck.js check` 가 슬라이드 블록에서 **자동 생성**하므로 손으로 쓰지 않는다(비워 두면 된다).

````markdown
# {발표 제목} 발표 기획안

> 작성일 YYYY-MM-DD · 원본 자료 {파일명 또는 "사용자 브리프"}

## 1. 개요

| 항목 | 내용 |
|---|---|
| 주제 | 한 줄 |
| 목적 | 발표로 얻어야 할 결과 한 줄 (결정·공유·설득 등) |
| 대상 | 청중 |
| 핵심 메시지 | 청중이 기억해야 할 한 문장 |
| 색상 | blue (기본) — 아래 「색상」 참고 |
| 분량 | (자동) |

## 2. 구성 한눈에 보기

## 3. 슬라이드 상세

```yaml
layout: cover
title: ...
...
```

```yaml
layout: ...
```
````

## 색상

개요 표의 `색상` 값 하나로 덱 전체 강조색(섹션 라벨, 강조 카드, 큰 숫자, 아이콘, 마무리 배경)이 바뀐다. 연한 배경색·진한 강조 글자색은 자동 계산. 본문 글자색·회색은 고정.

| 프리셋 | 색 | 프리셋 | 색 |
|---|---|---|---|
| `blue` (기본) | #0066FF | `teal` | #0F766E |
| `navy` | #1E3A8A | `green` | #15803D |
| `indigo` | #4F46E5 | `orange` | #E8590C |
| `purple` | #7C3AED | `red` | #DC2626 |
| `black` | #171719 | 직접 지정 | `#RRGGBB` (예: 브랜드 색) |

흰 글자와 대비가 3:1 미만인 밝은 색(노랑·하늘색 등)은 `check` 에서 오류. 줄이 없으면 blue.

## 슬라이드 블록 공통 항목

| 항목 | 필수 | 설명 |
|---|---|---|
| `layout` | ✔ | 아래 형태 중 하나 |
| `section` | ✔ (cover 제외) | 섹션 이름만. 번호(01, 02…)는 등장 순서대로 자동 부여 |
| `title` | ✔ | 슬라이드 제목. `[[강조]]` 로 파란색 강조 (주로 표지) |
| `lead` | | 제목 아래 한 줄 설명 (형태별 허용 여부 아래 참고) |
| `message` | ✔ | 이 슬라이드의 핵심 메시지 한 줄 — **슬라이드에는 안 나오고** 검토용 표에만 표시 |
| `notes` | ✔ | 발표자 노트 2~4문장, 말하는 어투 |

## YAML 작성 규칙

- `{ a: 1, b: 2 }` 처럼 한 줄로 쓸 때 **값에 쉼표가 있으면 반드시 `"따옴표"`** 로 감싼다.
- 여러 줄 텍스트(`notes`)는 `notes: |` 다음 줄부터 들여쓰기.
- 아이콘은 [lucide](https://lucide.dev/icons) 이름(`repeat`, `circle-alert`, `upload` …). 없는 이름은 check 에서 오류.
- 이미지 `path` 는 기획안 파일 기준 상대 경로.

## 형태(layout) 카탈로그

괄호 안 숫자는 허용 개수. 분량(글자 수)은 `check` 가 실제 칸 크기로 계산해 초과 시 오류를 낸다.

### cover — 표지
```yaml
layout: cover
title: 팝업 [[자동화 프로그램]]
kicker: 디자인팀 병목현상 해결을 위한     # 선택
subtitle: 고객사 팝업 이미지 제작을 자동화하는 웹 플랫폼   # 선택
meta: 2026.10 · 디자인팀                   # 선택
```

### images — 이미지 예시 (1~3장)
```yaml
images:
  - { path: assets/a.jpg, caption: 고객사 A, sub: 진료·휴진 스케줄 }
```

### stat-list — 핵심 수치 + 항목 (항목 2~4)
문제 제기, 현황 진단에 사용. `lead` 는 왼쪽 상단에 최대 3줄.
```yaml
stat: { value: 30분+, label: 팝업 1건당 수작업 시간 }
items:
  - { icon: repeat, title: 단순 반복 작업, desc: 매회 30분 이상 소요 }
```

### table — 비교표 (열 2~4, 행 1~7)
첫 열은 구분, `highlight` 열(기본: 마지막 열, `none` 가능)은 파란 헤더 + 굵게.
```yaml
columns: [구분, 기존, 자동화 후]
rows:
  - [정보 수신, 달력 사진·카톡 전달, 동일]
highlight: 3
```

### flow — 단계 흐름 (3~6단계)
```yaml
steps:
  - { icon: upload, label: 정보 입력 }
highlight: 3          # 강조할 단계 번호 (선택)
caption: 하단 설명 한 줄 (선택)
```

### step-cards — 카드 그리드 (카드 2~4, 카드당 항목 1~5)
`marker: check` 이면 ✓ 목록. `chips` 는 하단 보조 기능 줄(선택).
```yaml
cards:
  - { tag: STEP 1, title: 고객사 선택, bullets: [항목1, 항목2] }
chips:
  label: 부가 기능
  items:
    - { icon: undo-2, text: 실행 취소 최대 20단계 }
```

### spec-list — 항목 목록 (2~6행)
기술 스택, 사양, 구성요소 소개. `desc` 는 쉬운 말 풀이(선택).
```yaml
rows:
  - { label: 상태관리, value: Zustand, desc: 입력값을 한곳에 기억해 모든 화면에 반영 }
```

### tree — 구조도 (2~6개)
```yaml
root: 고객사 프로파일
items:
  - { name: config.ts, desc: "규칙 (요일별 상태, 출력 크기)" }
```

### pipeline — 처리 파이프라인 (입력 0~3, 단계 3~6)
```yaml
inputs: [템플릿 (HTML/CSS), 데이터 (일정·배경·문구)]   # 선택
steps:
  - { title: HTML 문서 생성, sub: 보조 설명(선택) }
highlight: 2
highlight_tag: 핵심
note: 하단 정보 박스 (선택, 최대 3줄)
```

### lanes — 구조 비교 (현재/전환, 2~3줄, 줄당 2~5칸)
```yaml
lanes:
  - { label: 현재, steps: [웹 UI, 렌더링 엔진, JPG 출력] }
  - { label: 전환 후, steps: [봇 대화, 렌더링 엔진, JPG 출력, 이미지 전송] }
highlight: 2
annotation: 동일
```

### detail-cards — 상세 카드 (카드 2~3, 행 1~8)
`status` 배지: 완료·활성·운영 → 연파랑, 진행 중·현재 → 파랑, 그 외 → 회색.
```yaml
cards:
  - tag: Phase 1
    status: 완료
    title: 고객사 A
    sub: 진료·휴진 스케줄 팝업
    rows:
      - { k: 이미지 판독, v: OCR + 색상 분석 자동 판별 }
```

### status-grid — 현황 카드 (2~4)
활성(연파랑/파랑 배지)은 채운 카드, 그 외는 점선 카드.
```yaml
cards:
  - { status: 활성, title: 고객사 A, sub: 진료·휴진 스케줄 }
```

### points — 핵심 포인트 (2~4)
이유·원칙·전략 나열. 큰 번호 01/02/03 자동.
```yaml
points:
  - { title: 시각적 피드백, desc: 미리보기와 보정이 필수이므로 웹 UI가 가장 직관적 }
```

### chat — 대화 예시 (메시지 2~8)
```yaml
messages:
  - { from: user, text: 고객사 A 10월 팝업 만들어줘 }
  - { from: bot, text: 10월 달력 사진을 보내주세요 }
```

### stages — 단계별 계획 (2~5)
```yaml
stages:
  - { label: 1단계, desc: "웹에서 핵심 엔진 완성, 규칙 검증" }
current: 1            # "· 현재" 표시 + 파란 카드 (선택)
note: 하단 보충 설명 (선택, 최대 2줄)
```

### roadmap — 로드맵 (단계 2~4, 단계당 항목 1~5)
첫 항목은 굵게. `footer` 는 하단 "현재 방식 → 다음 방식" 대비(선택).
```yaml
phases:
  - { name: Phase 1, status: 완료, items: [고객사 A, 스케줄 팝업] }
footer: { from: 규칙 기반 고정 레이아웃 · 고객사별 프로파일, to: AI 자유 레이아웃 · 자연어 → 이미지 }
```

### closing — 마무리 (파란 배경, 수치 2~3, 요약 0~3)
`lead` 사용 안 함.
```yaml
stats:
  - { label: 팝업 1건 제작 시간, value: 83%, sub: 30분+ → 5분 이내 }
points: [반복 업무에서 벗어나 핵심 업무에 집중]
```
