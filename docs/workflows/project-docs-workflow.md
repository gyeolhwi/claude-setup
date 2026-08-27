---
id: project-docs-workflow
title: docs/ 기반 프로젝트 협업 워크플로우
category: workflows
summary: /project-docs 로 docs/ 골격을 만들고, /project-docs-gen 으로 기획서를 개발 문서 10종으로 펼친 뒤, project-workflow 의 8개 서브모드(feedback·issues·dev·design·review·sync·status·classify)를 자연어로 불러 협업하는 전체 사용법. 새 프로젝트·기존 프로젝트·일상 협업 세 가지 진입 시나리오를 포함한다.
keywords: [project-docs, project-docs-gen, project-workflow, 피드백, feedback, 이슈, issues, 개발, dev, 디자인, design, 리뷰, review, 동기화, sync, 상태, status, 분류, classify, inbox, CONVENTIONS, CHANGELOG, docs구조]
related_files:
  - commands/project/project-docs.md
  - commands/project/project-docs-gen.md
  - commands/project/project-workflow.md
  - skills/omc-learned/project-docs-gen/
last_updated: 2026-08-27
---

# docs/ 기반 프로젝트 협업 워크플로우

프로젝트마다 `docs/` 폴더 하나를 두고, 그걸 AI 와 사람이 같이 읽고 갱신하는 방식이다.
구성은 커맨드 두 개 + 워크플로우 하나다.

```text
/project-docs        docs/ 골격 생성          ← 프로젝트당 한 번
/project-docs-gen    기획서 → 개발 문서 10종   ← 필요할 때
project-workflow     8개 서브모드 (자연어)     ← 매일
```

`project-workflow` 는 **슬래시 커맨드가 아니라 자연어로 부른다.** "개발 시작해줘", "리뷰해줘" 처럼.

---

## 어디서 시작하나

### A. 새 프로젝트 — 기획서·초안이 있다

```text
1. /project-docs        docs/ 구조 생성 (프로젝트명·스택 입력)
2. /project-docs-gen    기획서 붙여넣기 → 문서 생성 → docs/99_inbox/
3. "분류해줘"            99_inbox/ → 01_specs/ 등으로 편입
4. "개발 시작해줘"       specs·architecture 참조하여 개발
5. "리뷰해줘"            코드 리뷰 & CHANGELOG 기록
```

### B. 기존 프로젝트 — 이미 코드가 있다

```text
1. /project-docs        코드베이스 스캔 → 스택·구조 파악 → docs/ 생성
                        (CONVENTIONS.md 를 실제 코드 패턴 기반으로 작성)
2. "동기화 체크해줘"     생성된 문서와 실제 코드의 정합성 확인
3. "개발 시작해줘"       이후 개발 진행
```

기존 프로젝트에서 `/project-docs-gen` 은 필수가 아니다. 나중에 기획 문서가 필요해지면 그때 쓴다.

### C. 일상 협업 — docs/ 가 이미 있다

```text
단건 요청  → 채팅으로 직접 말하기 → "개발해줘" / "디자인 수정해줘" → "리뷰해줘"
다건 요청  → FEEDBACK.md 에 모아 쓰기 → "피드백 처리해줘" → "리뷰해줘"
이슈 발생  → "이슈 확인해줘" → 해결 → "리뷰해줘"
언제든     → "현재 상태 알려줘"      (현황 대시보드)
언제든     → "동기화 체크해줘"       (문서 ↔ 코드 정합성)
```

---

## `/project-docs` — docs/ 골격 생성

새 프로젝트면 사용자 입력 기반, 기존 프로젝트면 코드 스캔 기반으로 만든다.
**Idempotent** — `docs/` 가 부분적으로 있으면 누락된 것만 채우고 기존 파일은 덮어쓰지 않는다.

```text
docs/
├── INDEX.md              진입점
├── CONVENTIONS.md        코드 스타일 규칙
├── FEEDBACK.md           다건 수정 요청 일괄 전달
├── 01_specs/             기획·설계 문서 (docs-gen 산출물 최종 위치)
├── 02_architecture/      시스템 구조
├── 03_references/        외부 레퍼런스 (design/ · api/ · libraries/)
├── 04_tasks/             태스크 관리
├── 05_issues/            이슈 트래킹 (open/ · resolved/)
├── 06_changelog/         변경 이력
└── 99_inbox/             문서 수신함 (분류 전 임시 보관)
```

트리거: "프로젝트 docs 만들어줘", "docs 초기화", "AI 협업 문서 세팅"

## `/project-docs-gen` — 개발 문서 생성

초안·기획서를 대화에 붙여넣으면 컨텍스트로 인식해 문서를 만든다. 산출물은 **항상 `docs/99_inbox/`** 로 간다.
`docs/` 가 없어도 단독으로 돌아간다.

| 호출 | 결과 |
| --- | --- |
| `/project-docs-gen` | 범위 선택 (전체 10종 / 핵심 4종 / 개별) |
| `/project-docs-gen requirements` | 요구사항정의서 |
| `/project-docs-gen features` | 기능명세서 |
| `/project-docs-gen erd` | ERD 설계서 |
| `/project-docs-gen api` | API 명세서 |
| 그 외 | tech-stack · roles · sitemap · flowchart · wireframe · scenarios |

템플릿 10종과 문서 간 의존 관계는 [reference/catalog.md](../reference/catalog.md#project-docs-gen-템플릿-10종) 에 있다.

---

## project-workflow 서브모드 8종

전부 자연어로 부른다. 실행 전에 `docs/INDEX.md` 를 먼저 읽어 프로젝트 컨텍스트를 잡는다
(classify 모드와 `/project-docs-gen` 은 예외 — `INDEX.md` 가 없어도 돈다).

| 모드 | 호출 예시 | 읽는 파일 | 쓰는 파일 |
| --- | --- | --- | --- |
| feedback | "피드백 처리해줘" | `FEEDBACK.md` | `FEEDBACK.md` |
| issues | "이슈 확인해줘" | `05_issues/open/` | `05_issues/` |
| dev | "개발 시작해줘" | `CONVENTIONS.md`, `02_architecture/`, `01_specs/`, `FEEDBACK.md` | `FEEDBACK.md`, `04_tasks/` |
| design | "디자인 수정해줘" | `FEEDBACK.md`, `03_references/design/` | `FEEDBACK.md` |
| review | "리뷰해줘" | `CONVENTIONS.md` | `06_changelog/CHANGELOG.md` |
| sync | "동기화 체크해줘" | 전체 docs/ | — (보고만) |
| status | "현재 상태 알려줘" | 전체 docs/ | — (보고만) |
| classify | "분류해줘" | `99_inbox/` | `01_specs/`, `02_architecture/` 등 |

### feedback — 다건 일괄 처리

`FEEDBACK.md` 에서 `상태: 대기` 항목을 뽑아 우선순위(높음→보통→낮음)로 보여주고, 처리 후 `완료` 로 바꾼다.
**간단한 단건 요청은 이 모드 없이 채팅으로 직접 말하면 된다.** 여러 건을 모아 한 번에 넘길 때 쓰는 모드다.

피드백 항목 형식:

```markdown
### [2026-08-27] 로그인 페이지 수정
- **유형**: `추가`          # 수정 | 추가 | 삭제 | 버그 | 질문 | 디자인
- **대상**: 로그인 페이지 > 비밀번호 입력칸
- **내용**: 눈 아이콘(view/hide) 토글 추가
- **우선순위**: `보통`      # 높음 | 보통 | 낮음
- **상태**: `대기`          # 대기 | 진행중 | 완료
```

### issues — 오픈 이슈 확인

`05_issues/open/` 의 `.md` 를 읽어 요약하고, 이슈 간 연관성을 분석해 해결 방안을 제안한다.
해결되면 `open/` → `resolved/` 로 옮긴다. 파일명은 `YYYY-MM-DD-{제목-kebab-case}.md`.

> GitHub 이슈를 실제로 등록하고 워크트리·PR 까지 가는 흐름은 다른 워크플로우다.
> [issue-workflow.md](./issue-workflow.md) 를 본다.

### dev — 기능 개발

`CONVENTIONS.md` → `02_architecture/` → `01_specs/` → `FEEDBACK.md` 순으로 읽고,
개발 범위(어떤 기능·영향 받는 파일·예상 변경)를 먼저 확인받은 뒤 진행한다.

내부 체크리스트: 컨벤션 확인 / 기존 컴포넌트와 중복 없는지 / 아키텍처 문서와 방향 일치 / 다른 기능 영향.

### design — UI/UX 수정

`FEEDBACK.md` 의 `디자인` 유형 항목과 `03_references/design/` 을 참조한다.
기존 디자인 시스템·테마 변수를 우선 쓰고, 새 색상·폰트·간격을 추가할 때는 `CONVENTIONS.md` 를 확인한다.
반응형 대응 여부는 사용자에게 묻는다.

### review — 코드 리뷰 & 변경 기록

**CHANGELOG 를 쓰는 유일한 모드다.** 다른 모드는 작업이 끝나면 "리뷰해줘" 를 안내만 한다.
`CONVENTIONS.md` 기준으로 네이밍·패턴 일관성·에러 처리·타입 안전성을 보고, `06_changelog/CHANGELOG.md` 에 기록한다.

### sync — 문서 ↔ 코드 정합성

아키텍처 문서와 실제 구조, 컨벤션과 실제 코드, 완료됐는데 안 옮겨진 태스크, 이미 해결됐는데 남아 있는 이슈를 대조해
불일치를 보고하고 자동 수정을 제안한다. 스스로 고치지는 않는다.

### status — 현황 대시보드

피드백 대기/진행중/완료, 오픈·해결 이슈 수, 현재 스프린트·백로그, 마지막 변경일을 한 화면으로 요약하고
즉시 처리 가능한 항목을 짚어 준다.

### classify — 99_inbox/ 편입

`/project-docs-gen` 산출물을 `docs/` 구조에 넣는 모드다. 이동 계획을 먼저 보여주고 승인받은 뒤 옮긴다.

| 문서 유형 | 이동 폴더 |
| --- | --- |
| 요구사항정의서·기능명세서·정보구조도·ERD·API 명세·기술 스택·플로우차트·와이어프레임·시나리오·역할 매트릭스 | `01_specs/` |
| 시스템 아키텍처·구조 설계 | `02_architecture/` |
| UI/디자인 레퍼런스 | `03_references/design/` |
| 외부 API 문서·라이브러리 설명 | `03_references/api/` |
| 태스크·백로그·마일스톤 | `04_tasks/` |
| 분류 불명확 | `99_inbox/` 유지 + 수동 확인 목록 출력 |

---

## 공통 규칙

**실행 전** — `docs/INDEX.md` 를 먼저 읽는다. 관련 문서가 있으면 반드시 읽고 나서 작업한다.
`CONVENTIONS.md` 가 있으면 코드 생성 시 반드시 따른다.

**실행 후** — 변경된 docs 파일을 알려주고, 다음 추천 액션을 안내한다.

**파일 수정 시** — 기존 내용을 지우지 않는다(추가·수정만). 상태 변경은 인라인으로(`대기` → `완료`).
날짜는 항상 `YYYY-MM-DD`.
