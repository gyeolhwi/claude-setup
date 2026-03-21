---
name: project-docs
description: "프로젝트 내부에 AI 협업용 docs/ 폴더 구조를 자동 생성하는 스킬. 사용자가 '프로젝트 docs 만들어줘', 'docs 초기화', 'AI 협업 문서 세팅', 'docs scaffolding', 'docs 구조 잡아줘', '프로젝트 문서화 셋업' 등을 요청할 때 트리거된다. 새 프로젝트를 시작하거나, 기존 프로젝트에 AI와 협업하기 위한 문서 구조가 필요할 때 반드시 이 스킬을 사용할 것."
---

# Project Docs Scaffolding

프로젝트 루트에 `docs/` 폴더와 AI 협업에 최적화된 문서 구조를 자동 생성한다.

## 핵심 원칙

1. **AI 진입점이 명확해야 한다** — `INDEX.md`가 프로젝트 지도 역할
2. **관심사별 분리** — architecture, tasks, references, issues는 폴더로 분리
3. **컨벤션 문서화** — AI가 코드 스타일과 패턴을 따르려면 명시적 규칙 필요
4. **사용자↔AI 소통 채널** — `FEEDBACK.md`를 통한 비동기 커뮤니케이션

## 생성할 폴더 구조

```
docs/
├── INDEX.md                      # 진입점: 프로젝트 개요 + 문서 링크 맵
├── CONVENTIONS.md                # 코드 스타일, 네이밍, 패턴 규칙
├── FEEDBACK.md                   # 사용자 ↔ AI 소통 파일 (핵심!)
│
├── architecture/
│   ├── overview.md               # 시스템 전체 구조
│   ├── frontend.md               # 프론트엔드 구조, 라우팅, 상태관리
│   ├── backend.md                # API 설계, DB 스키마
│   └── diagrams/                 # 구조도 이미지 (.png, .svg)
│       └── .gitkeep
│
├── references/
│   ├── design/                   # UI 레퍼런스, 스크린샷, 피그마 링크
│   │   └── .gitkeep
│   ├── api/                      # 외부 API 문서, 스펙
│   │   └── .gitkeep
│   └── libraries/                # 사용 라이브러리 선택 이유, 사용법
│       └── .gitkeep
│
├── tasks/
│   ├── backlog.md                # 전체 태스크 목록
│   ├── current-sprint.md         # 현재 진행 중인 작업
│   └── completed/                # 완료 태스크 아카이브
│       └── .gitkeep
│
├── issues/
│   ├── open/                     # 현재 이슈 (YYYY-MM-DD-제목.md)
│   │   └── .gitkeep
│   └── resolved/                 # 해결된 이슈 아카이브
│       └── .gitkeep
│
├── inbox/                        # project-docs-gen 생성 문서 수신함 (분류 전 임시 보관)
│   └── .gitkeep
│
└── changelog/
    └── CHANGELOG.md              # 주요 변경사항 기록
```

## 사용자에게 물어볼 것

스킬 실행 시 아래 정보를 사용자에게 확인한다. 이미 대화에서 파악된 내용은 다시 묻지 않는다.

1. **프로젝트 이름**
2. **한줄 설명**
3. **기술 스택** (Frontend, Backend, DB, Deploy 등)
4. **docs 생성 경로** (기본값: 현재 디렉토리의 `docs/`)

## 각 템플릿 파일 작성 규칙

### INDEX.md

```markdown
# {프로젝트 이름}

> {한줄 설명}

## Tech Stack

- Frontend: {프론트엔드 스택}
- Backend: {백엔드 스택}
- Database: {DB}
- Deploy: {배포 환경}

## Docs 구조

| 문서 | 설명 |
|------|------|
| [Architecture](./architecture/overview.md) | 시스템 전체 구조 |
| [Conventions](./CONVENTIONS.md) | 코드 스타일 & 패턴 규칙 |
| [Feedback](./FEEDBACK.md) | 사용자 ↔ AI 소통 |
| [Current Tasks](./tasks/current-sprint.md) | 현재 진행 중 작업 |
| [Backlog](./tasks/backlog.md) | 전체 태스크 |
| [Open Issues](./issues/open/) | 현재 이슈 |
| [Changelog](./changelog/CHANGELOG.md) | 변경 이력 |

## AI 사용 가이드

이 프로젝트에서 AI와 협업할 때:
1. 먼저 이 `INDEX.md`를 읽어서 프로젝트 전체를 파악
2. `CONVENTIONS.md`를 참고하여 코드 스타일 준수
3. `FEEDBACK.md`에서 사용자 요청사항 확인
4. 작업 후 `changelog/CHANGELOG.md`에 변경사항 기록
```

### FEEDBACK.md (사용자 ↔ AI 소통 파일)

이 파일이 핵심 소통 채널이다. 형식:

```markdown
# Feedback

사용자와 AI 간의 소통 파일. 사용자가 피드백을 작성하면 AI가 확인하고 처리한다.

---

## 작성 가이드

아래 형식으로 피드백을 작성하세요:

### [날짜] 제목
- **유형**: `수정` | `추가` | `삭제` | `버그` | `질문` | `디자인`
- **대상**: 어떤 페이지/컴포넌트/기능
- **내용**: 구체적인 요청사항
- **우선순위**: `높음` | `보통` | `낮음`
- **상태**: `대기` | `진행중` | `완료`

---

## 피드백 목록

<!-- 아래에 피드백을 작성하세요 -->

### [2026-03-21] 예시: 로그인 페이지 수정
- **유형**: `추가`
- **대상**: 로그인 페이지 > 비밀번호 입력칸
- **내용**: 비밀번호 입력칸에 눈 아이콘(view/hide) 토글 기능을 추가해주세요
- **우선순위**: `보통`
- **상태**: `대기`

---

### [2026-03-21] 예시: GNB 메뉴 이름 수정
- **유형**: `수정`
- **대상**: GNB > 1depth 메뉴
- **내용**: "서비스 소개" → "About Us"로 변경
- **우선순위**: `높음`
- **상태**: `대기`
```

### CONVENTIONS.md

```markdown
# Conventions

이 문서는 프로젝트의 코드 스타일과 패턴 규칙을 정의한다.
AI가 코드를 생성할 때 반드시 이 규칙을 따른다.

## 네이밍 규칙

- 컴포넌트: PascalCase (예: `LoginForm.tsx`)
- 유틸 함수: camelCase (예: `formatDate.ts`)
- 상수: UPPER_SNAKE_CASE (예: `API_BASE_URL`)
- CSS 클래스: {프로젝트에 맞게 작성}

## 폴더 구조 규칙

{프로젝트 src 폴더 구조와 각 폴더의 역할을 여기에 기술}

## 컴포넌트 패턴

{사용하는 컴포넌트 패턴 기술 — 예: 함수형 컴포넌트만 사용, Props 타입 정의 방식 등}

## 상태관리

{상태관리 라이브러리 및 패턴 기술}

## 에러 처리

{에러 처리 패턴 기술}

## Git 커밋 메시지

형식: `type(scope): description`

type: feat, fix, refactor, style, docs, test, chore
```

### architecture/overview.md

```markdown
# Architecture Overview

## 시스템 구조도

{여기에 구조도 이미지 또는 mermaid 다이어그램}

## 주요 모듈

| 모듈 | 역할 | 기술 |
|------|------|------|
| | | |

## 데이터 흐름

{사용자 요청 → 처리 → 응답까지의 흐름 설명}

## 외부 연동

{사용하는 외부 서비스, API 목록}
```

### tasks/current-sprint.md

```markdown
# Current Sprint

> 마지막 업데이트: {날짜}

## 진행 중

- [ ] {태스크 설명} — 담당: {사람/AI}

## 완료

- [x] {완료된 태스크}

## 블로커

{현재 막혀있는 이슈가 있다면 기술}
```

### tasks/backlog.md

```markdown
# Backlog

## 높은 우선순위
- [ ] {태스크}

## 보통
- [ ] {태스크}

## 낮음
- [ ] {태스크}
```

### changelog/CHANGELOG.md

```markdown
# Changelog

모든 주요 변경사항을 기록한다.

## [YYYY-MM-DD]

### Added
- {새로 추가된 기능}

### Changed
- {변경된 기능}

### Fixed
- {버그 수정}

### Removed
- {제거된 기능}
```

## 실행 절차

1. 사용자에게 프로젝트 정보 확인 (이름, 스택, 한줄 설명)
2. 지정된 경로에 전체 폴더 구조 생성
3. 각 템플릿 파일에 사용자 정보를 채워서 생성
4. 완료 후 생성된 구조를 tree 명령어로 보여주기
5. "다음으로 `CONVENTIONS.md`를 프로젝트에 맞게 채워주시면 AI가 코드 스타일을 정확히 따를 수 있어요" 안내
