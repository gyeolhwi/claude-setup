---
name: project-docs
description: "프로젝트 내부에 AI 협업용 docs/ 폴더 구조를 자동 생성하는 스킬. 사용자가 '프로젝트 docs 만들어줘', 'docs 초기화', 'AI 협업 문서 세팅', 'docs scaffolding', 'docs 구조 잡아줘', '프로젝트 문서화 셋업' 등을 요청할 때 트리거된다. 새 프로젝트를 시작하거나, 기존 프로젝트에 AI와 협업하기 위한 문서 구조가 필요할 때 반드시 이 스킬을 사용할 것."
---

# Project Docs Scaffolding

프로젝트 루트에 `docs/` 폴더와 AI 협업에 최적화된 문서 구조를 자동 생성한다.

**Idempotent:** `docs/`가 이미 부분적으로 존재하면 누락된 폴더/파일만 추가 생성한다. 기존 파일은 덮어쓰지 않는다.

## 핵심 원칙

1. **AI 진입점이 명확해야 한다** — `INDEX.md`가 프로젝트 지도 역할
2. **관심사별 분리** — architecture, tasks, references, issues는 폴더로 분리
3. **컨벤션 문서화** — AI가 코드 스타일과 패턴을 따르려면 명시적 규칙 필요
4. **다건 피드백 일괄 처리** — `FEEDBACK.md`에 수정사항을 모아서 한 번에 전달

## 생성할 폴더 구조

```
docs/
├── INDEX.md                      # 진입점: 프로젝트 개요 + 문서 링크 맵
├── CONVENTIONS.md                # 코드 스타일, 네이밍, 패턴 규칙
├── FEEDBACK.md                   # 다건 수정 요청을 모아서 일괄 전달하는 파일
│
├── 01_specs/                     # 기획·설계 문서 (docs-gen 산출물 최종 위치)
│   └── .gitkeep
│
├── 02_architecture/
│   ├── overview.md               # 시스템 전체 구조
│   ├── frontend.md               # 프론트엔드 구조, 라우팅, 상태관리
│   ├── backend.md                # API 설계, DB 스키마
│   └── diagrams/                 # 구조도 이미지 (.png, .svg)
│       └── .gitkeep
│
├── 03_references/
│   ├── design/                   # UI 레퍼런스, 스크린샷, 피그마 링크
│   │   └── .gitkeep
│   ├── api/                      # 외부 API 문서, 스펙
│   │   └── .gitkeep
│   └── libraries/                # 사용 라이브러리 선택 이유, 사용법
│       └── .gitkeep
│
├── 04_tasks/
│   ├── backlog.md                # 전체 태스크 목록
│   ├── current-sprint.md         # 현재 진행 중인 작업
│   └── completed/                # 완료 태스크 아카이브
│       └── .gitkeep
│
├── 05_issues/
│   ├── open/                     # 현재 이슈 (YYYY-MM-DD-제목.md)
│   │   └── .gitkeep
│   └── resolved/                 # 해결된 이슈 아카이브
│       └── .gitkeep
│
├── 06_changelog/
│   └── CHANGELOG.md              # 주요 변경사항 기록
│
└── 99_inbox/                     # project-docs-gen 생성 문서 수신함 (분류 전 임시 보관)
    └── .gitkeep
```

## 프로젝트 유형 감지

스킬 실행 시 프로젝트 루트를 스캔하여 **새 프로젝트**인지 **기존 프로젝트**인지 자동 판별한다.

**기존 프로젝트 판별 기준** (하나라도 해당하면 기존 프로젝트):
- `package.json`, `requirements.txt`, `go.mod`, `Cargo.toml` 등 의존성 파일 존재
- `src/`, `app/`, `pages/` 등 소스 코드 폴더 존재
- `.git` 히스토리에 코드 관련 커밋이 있음

### 새 프로젝트인 경우

프로젝트 정보를 입력받는 방식을 먼저 선택한다:

```
프로젝트 정보를 어떻게 입력하시겠어요?
- 채팅으로 직접 알려주기 ← 내용이 적을 때
- 템플릿 파일 생성 → 내가 채워서 알려주기 ← 내용이 많을 때
```

#### A. 채팅으로 직접 입력

사용자에게 아래 정보를 확인한다:

1. **프로젝트 이름**
2. **한줄 설명**
3. **기술 스택** (Frontend, Backend, DB, Deploy 등)
4. **docs 생성 경로** (기본값: 현재 디렉토리의 `docs/`)

#### B. 템플릿 파일 생성

프로젝트 루트에 `project-info.md`를 생성한다. 사용자가 내용을 채운 뒤 "준비됐어" 또는 "docs 생성해줘"라고 요청하면 파일을 읽어서 진행한다.

```markdown
# 프로젝트 정보

아래 항목을 채워주세요. 작성 후 "준비됐어"라고 말씀해주시면 docs/를 생성합니다.

## 기본 정보
- **프로젝트 이름**:
- **한줄 설명**:
- **docs 생성 경로**: docs/ (기본값, 변경 시 수정)

## 기술 스택
- **Frontend**:
- **Backend**:
- **Database**:
- **Deploy**:
- **기타**:

## 주요 기능 (선택)
-
-
-

## 참고사항 (선택)
자유롭게 작성. 디자인 레퍼런스 URL, 기획 방향, 특이사항 등.
```

사용자가 파일을 채우면:
1. `project-info.md`를 읽어서 정보를 추출한다
2. 추출 결과를 보여주고 확인을 받는다
3. 확인 후 docs/ 생성 진행
4. 생성 완료 후 `project-info.md`는 삭제하지 않는다 (사용자가 직접 관리)

### 기존 프로젝트인 경우

코드베이스를 스캔하여 자동으로 파악한다:

1. **프로젝트 이름** ← `package.json` name 또는 폴더명
2. **한줄 설명** ← `package.json` description 또는 README 첫 줄
3. **기술 스택** ← 의존성 파일에서 자동 추출 (package.json, requirements.txt 등)
4. **CONVENTIONS.md** ← 기존 코드 패턴을 분석하여 작성 (단순 스택 기본값이 아닌 실제 코드 기반)
5. **02_architecture/overview.md** ← 프로젝트 폴더 구조, 라우팅, API 엔드포인트를 스캔하여 초안 작성 (라우트 파일 기반 페이지 URL 맵 포함)

스캔 결과를 사용자에게 보여주고 확인을 받은 후 생성한다:
```
📂 기존 프로젝트 감지

프로젝트: my-app
스택: Next.js 14 + TypeScript + Tailwind + Prisma + PostgreSQL
구조: app/ (App Router), components/, lib/, prisma/

이 정보로 docs/를 생성할까요? 수정할 내용이 있으면 알려주세요.
```

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
| [Specs](./01_specs/) | 기획·설계 문서 (요구사항, 기능명세, ERD 등) |
| [Architecture](./02_architecture/overview.md) | 시스템 전체 구조 |
| [References](./03_references/) | 외부 레퍼런스 (디자인, API, 라이브러리) |
| [Conventions](./CONVENTIONS.md) | 코드 스타일 & 패턴 규칙 |
| [Feedback](./FEEDBACK.md) | 다건 수정 요청 일괄 전달 |
| [Current Tasks](./04_tasks/current-sprint.md) | 현재 진행 중 작업 |
| [Backlog](./04_tasks/backlog.md) | 전체 태스크 |
| [Open Issues](./05_issues/open/) | 현재 이슈 |
| [Changelog](./06_changelog/CHANGELOG.md) | 변경 이력 |

## AI 사용 가이드

이 프로젝트에서 AI와 협업할 때:
1. 먼저 이 `INDEX.md`를 읽어서 프로젝트 전체를 파악
2. `CONVENTIONS.md`를 참고하여 코드 스타일 준수
3. `FEEDBACK.md`에 다건 수정 요청이 있으면 확인
4. 작업 후 "리뷰해줘"로 코드 리뷰 & 변경사항 기록
```

### FEEDBACK.md (다건 피드백 일괄 전달용)

수정 요청이 여러 건일 때, 사용자가 한 번에 작성하여 AI에게 전달하는 파일이다. 간단한 요청은 채팅으로 직접 말하면 된다. 형식:

```markdown
# Feedback

수정 요청이 여러 건일 때 한 번에 모아서 전달하는 파일. 사용자가 피드백을 작성한 뒤 "피드백 처리해줘"라고 요청하면 AI가 확인하고 처리한다.

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

사용자가 입력한 기술 스택을 기반으로 아래 템플릿의 `{플레이스홀더}`를 **스택에 맞는 기본 컨벤션으로 자동 채운다.**

**자동 채우기 규칙:**
- React/Next.js → 함수형 컴포넌트, hooks 패턴, CSS-in-JS 또는 Tailwind 클래스 네이밍
- Vue → Composition API, SFC 패턴, BEM 또는 scoped CSS
- Express/Nest → 컨트롤러-서비스 패턴, DTO 네이밍, 에러 미들웨어
- Python/Django/FastAPI → PEP8, snake_case, docstring 스타일
- 기타 스택 → 해당 생태계의 공식 스타일 가이드 기반으로 작성
- 사용자가 제공한 정보가 부족한 섹션은 `<!-- TODO: 프로젝트에 맞게 수정해주세요 -->`를 남긴다

```markdown
# Conventions

이 문서는 프로젝트의 코드 스타일과 패턴 규칙을 정의한다.
AI가 코드를 생성할 때 반드시 이 규칙을 따른다.

## 네이밍 규칙

- 컴포넌트: PascalCase (예: `LoginForm.tsx`)
- 유틸 함수: camelCase (예: `formatDate.ts`)
- 상수: UPPER_SNAKE_CASE (예: `API_BASE_URL`)
- CSS 클래스: {스택 기반 자동 채우기}

## 폴더 구조 규칙

{스택 기반 자동 채우기 — 예: Next.js면 app/, components/, lib/, hooks/ 등}

## 컴포넌트 패턴

{스택 기반 자동 채우기 — 예: React면 함수형 컴포넌트 + Props 타입 인터페이스}

## 상태관리

{스택 기반 자동 채우기 — 예: Zustand, Redux Toolkit, Pinia 등}

## API 통신

{스택 기반 자동 채우기 — 예: fetch wrapper, axios 인스턴스, react-query 패턴 등}

## 에러 처리

{스택 기반 자동 채우기 — 예: ErrorBoundary, try-catch 패턴, 전역 에러 핸들러 등}

## Git 커밋 메시지

형식: `type(scope): description`

type: feat, fix, refactor, style, docs, test, chore
```

### 02_architecture/overview.md

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

### 04_tasks/current-sprint.md

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

### 04_tasks/backlog.md

```markdown
# Backlog

## 높은 우선순위
- [ ] {태스크}

## 보통
- [ ] {태스크}

## 낮음
- [ ] {태스크}
```

### 06_changelog/CHANGELOG.md

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

### 공통

1. 프로젝트 유형 감지 (새 프로젝트 / 기존 프로젝트)
2. 지정된 경로에 전체 폴더 구조 생성
3. 완료 후 생성된 구조를 tree 명령어로 보여주기

### 새 프로젝트

4. 입력 방식 선택 (채팅 직접 입력 / 템플릿 파일 생성)
   - **채팅:** 프로젝트 이름, 스택, 한줄 설명을 대화로 확인 → 5로 진행
   - **템플릿:** `project-info.md` 생성 → 사용자가 채운 뒤 "준비됐어" → 파일 읽어서 5로 진행
5. 각 템플릿 파일에 사용자 정보를 채워서 생성
6. `CONVENTIONS.md`를 스택 기본값으로 자동 채우기
7. 안내: "`CONVENTIONS.md`를 스택 기반으로 자동 채웠습니다. 검토/수정해주시면 AI가 더 정확하게 따릅니다."
8. 안내: "기획서가 있으면 `/project-docs-gen`으로 개발 문서를 생성할 수 있습니다."

### 기존 프로젝트

4. 코드베이스 스캔 (의존성 파일, 폴더 구조, 코드 패턴)
5. 스캔 결과를 사용자에게 보여주고 확인받기
6. `INDEX.md`에 스캔된 스택 정보 채우기
7. `CONVENTIONS.md`를 실제 코드 패턴 기반으로 작성 (네이밍, 폴더 구조, 컴포넌트 패턴 등)
8. `02_architecture/overview.md`에 실제 프로젝트 구조 초안 작성 (라우트 파일 기반 페이지 URL 맵 포함)
9. 안내: "'동기화 체크해줘'로 문서와 코드 정합성을 확인해보세요."
