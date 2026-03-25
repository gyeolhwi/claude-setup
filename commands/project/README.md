# 프로젝트 문서화 커맨드

AI 협업을 위한 프로젝트 문서 자동 생성 & 워크플로우.
새 프로젝트든 기존 프로젝트든, docs/ 폴더 하나로 AI가 프로젝트를 이해하고 협업합니다.

---

## 사용 가이드

### A. 새 프로젝트 — 기획서/초안이 있는 경우

```
1. /project-docs          →  docs/ 폴더 구조 생성 (프로젝트명, 스택 입력)
2. /project-docs-gen      →  기획서 붙여넣기 → 문서 자동 생성 → docs/99_inbox/
3. "분류해줘"              →  99_inbox/ 문서를 01_specs/ 등으로 분류
4. "개발 시작해줘"         →  specs, architecture 참조하여 개발 시작
5. "리뷰해줘"              →  코드 리뷰 & CHANGELOG 기록
```

### B. 기존 프로젝트 — 이미 코드가 있는 경우

```
1. /project-docs          →  코드베이스 자동 스캔 → 스택/구조 파악 → docs/ 생성
                              (CONVENTIONS.md를 실제 코드 패턴 기반으로 작성)
                              (02_architecture/overview.md를 실제 폴더 구조 기반으로 초안 작성)
2. "동기화 체크해줘"       →  생성된 문서와 실제 코드 정합성 확인
3. "개발 시작해줘"         →  이후 개발 진행
```

> 기존 프로젝트에서는 `/project-docs-gen`이 필수가 아닙니다.
> 추후 기능 추가 시 기획 문서가 필요하면 그때 사용하세요.

### C. 일상 협업 — docs/가 이미 있는 경우

```
단건 요청  → 채팅으로 직접 말하기 → "개발해줘" 또는 "디자인 수정해줘" → "리뷰해줘"
다건 요청  → FEEDBACK.md에 모아서 작성 → "피드백 처리해줘" → 일괄 처리 → "리뷰해줘"
이슈 발생  → "이슈 확인해줘" → 해결 → "리뷰해줘"
언제든     → "현재 상태 알려줘" (현황 대시보드)
언제든     → "동기화 체크해줘" (문서 ↔ 코드 정합성)
```

> **CHANGELOG는 review 모드만 담당합니다.** 다른 모드는 작업 완료 후 "리뷰해줘"를 안내합니다.

---

## 커맨드 요약

### `/project-docs` — docs/ 폴더 구조 생성

새 프로젝트면 사용자 입력 기반, 기존 프로젝트면 코드 스캔 기반으로 생성합니다.
`docs/`가 부분적으로 존재하면 누락된 구조만 추가 (기존 파일 보존).

**트리거:** "프로젝트 docs 만들어줘", "docs 초기화", "AI 협업 문서 세팅"

```
docs/
├── INDEX.md              # 진입점
├── CONVENTIONS.md        # 코드 스타일 규칙
├── FEEDBACK.md           # 다건 수정 요청 일괄 전달
├── 01_specs/             # 기획·설계 문서
├── 02_architecture/      # 시스템 구조
├── 03_references/        # 외부 레퍼런스
├── 04_tasks/             # 태스크 관리
├── 05_issues/            # 이슈 트래킹
├── 06_changelog/         # 변경 이력
└── 99_inbox/             # 문서 수신함 (분류 전 임시 보관)
```

### `/project-docs-gen` — 개발 문서 생성

초안이나 기획서를 붙여넣으면 자동으로 문서를 생성합니다.
항상 `docs/99_inbox/`에 저장합니다.

**트리거:** "개발 문서 만들어줘", "요구사항정의서 작성해줘", "기획서 보고 문서 만들어줘"

| 커맨드 | 문서 |
|--------|------|
| `/project-docs-gen` | 범위 선택 (전체 10종 / 핵심 4종 / 개별) |
| `/project-docs-gen requirements` | 요구사항정의서 |
| `/project-docs-gen features` | 기능명세서 |
| `/project-docs-gen erd` | ERD 설계서 |
| `/project-docs-gen api` | API 명세서 |
| 그 외 | tech-stack, roles, sitemap, flowchart, wireframe, scenarios |

### `project-workflow` — docs/ 기반 협업 워크플로우

`project-workflow` 안의 서브모드입니다. 자연어로 호출합니다.

| 자연어 호출 | 서브모드 | 설명 |
|------------|----------|------|
| "피드백 처리해줘" | feedback | FEEDBACK.md 다건 일괄 처리 |
| "이슈 확인해줘" | issues | 오픈 이슈 확인 & 분석 |
| "개발 시작해줘" | dev | 기능 개발 |
| "디자인 수정해줘" | design | UI/UX 피드백 처리 |
| "리뷰해줘" | review | 코드 리뷰 & CHANGELOG 기록 |
| "동기화 체크해줘" | sync | 문서 ↔ 코드 정합성 체크 |
| "현재 상태 알려줘" | status | 현황 대시보드 |
| "분류해줘" | classify | 99_inbox/ → 올바른 폴더로 분류 |

---

## 설치

```bash
# 커맨드 설치 (README.md 제외)
cp project-docs.md project-docs-gen.md project-workflow.md ~/.claude/commands/

# 스킬 템플릿 설치 (project-docs-gen용)
cp -r ../../skills/omc-learned/project-docs-gen/ ~/.claude/skills/omc-learned/
```
