# 프로젝트 문서화 커맨드

초안/기획서에서 개발 문서를 자동 생성하고, AI와 협업하는 워크플로우를 제공합니다.

## 권장 워크플로우

```
1. /project-docs-gen  →  초안/기획서로 10종 개발 문서 생성 → docs/inbox/
2. /project-docs      →  프로젝트 내부에 docs/ 폴더 구조 생성
3. /classify          →  inbox/ 문서를 올바른 폴더로 자동 분류
4. /project-workflow  →  /dev, /feedback, /review 등으로 협업 진행
```

> `project-docs-gen`과 `project-docs`는 독립적으로 동작합니다.
> 순서에 구애받지 않고 각각 단독으로 사용 가능합니다.

---

## `project-docs-gen` — 개발 문서 10종 생성

초안이나 기획서를 붙여넣으면 자동으로 내용을 파악하여 문서를 생성합니다.

**트리거 키워드:** "개발 문서 만들어줘", "요구사항정의서 작성해줘", "이 내용으로 문서 작성해줘", "기획서 보고 문서 만들어줘"

**출력 경로:**
- `docs/` 폴더 있으면 → `docs/inbox/`
- `docs/` 폴더 없으면 → `./specs/`

**개별 커맨드:**

| 커맨드 | 문서 |
|--------|------|
| `/docs-gen requirements` | 요구사항정의서 |
| `/docs-gen tech-stack` | 기술 스택 결정서 |
| `/docs-gen roles` | 역할/권한 매트릭스 |
| `/docs-gen sitemap` | 정보구조도 |
| `/docs-gen features` | 기능명세서 |
| `/docs-gen erd` | ERD 설계서 |
| `/docs-gen api` | API 명세서 |
| `/docs-gen flowchart` | 플로우차트 |
| `/docs-gen wireframe` | 와이어프레임 설계서 |
| `/docs-gen scenarios` | 시나리오 케이스 |
| `/docs-gen` | 전체 10종 순서대로 생성 |

문서 간 의존 관계를 자동으로 추적하여 일관된 ID 체계(`REQ-AUTH-001`, `FEAT-AUTH-001` 등)를 유지합니다.

---

## `project-docs` — docs/ 폴더 구조 생성

**트리거 키워드:** "프로젝트 docs 만들어줘", "docs 초기화", "AI 협업 문서 세팅"

프로젝트 루트에 AI 협업에 최적화된 `docs/` 폴더를 생성합니다.

**생성 구조:**

```
docs/
├── INDEX.md                  # 진입점: 프로젝트 개요 + 문서 링크 맵
├── CONVENTIONS.md            # 코드 스타일, 네이밍, 패턴 규칙
├── FEEDBACK.md               # 사용자 ↔ AI 소통 파일
├── inbox/                    # project-docs-gen 문서 수신함
├── architecture/
│   ├── overview.md
│   ├── frontend.md
│   ├── backend.md
│   └── diagrams/
├── references/
│   ├── design/
│   ├── api/
│   └── libraries/
├── tasks/
│   ├── backlog.md
│   ├── current-sprint.md
│   └── completed/
├── issues/
│   ├── open/
│   └── resolved/
└── changelog/
    └── CHANGELOG.md
```

---

## `project-workflow` — docs/ 기반 협업 워크플로우

**트리거 키워드:** "피드백 확인해줘", "기능 개발해줘", "문서 분류해줘", `/feedback`, `/dev`, `/classify` 등

`docs/` 폴더가 있는 프로젝트에서 AI와 협업하는 커맨드 모음입니다.

| 커맨드 | 설명 |
|--------|------|
| `/feedback` | `FEEDBACK.md`에서 대기 중인 피드백 확인 & 처리 |
| `/issues` | `issues/open/` 이슈 확인 & 분석 |
| `/dev` | 기능 개발 (CONVENTIONS, architecture, specs 참조) |
| `/design` | UI/UX 피드백 처리 |
| `/review` | 변경사항 코드 리뷰 & `CHANGELOG.md` 업데이트 |
| `/sync` | 실제 코드와 docs 문서 일치 여부 확인 |
| `/status` | 피드백, 이슈, 태스크 현황 대시보드 출력 |
| `/classify` | `inbox/` 문서를 `specs/`, `architecture/` 등으로 자동 분류 |

**FEEDBACK.md 작성 형식:**

```markdown
### [2026-03-21] 버튼 색상 변경
- **유형**: `수정`
- **대상**: 로그인 페이지 > 로그인 버튼
- **내용**: primary 색상을 #3B82F6으로 변경
- **우선순위**: `보통`
- **상태**: `대기`
```

## 설치

```bash
cp project-docs-gen.md project-docs.md project-workflow.md ~/.claude/commands/
```
