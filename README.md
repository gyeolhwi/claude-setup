# claude-code-kit

Claude Code에서 사용하는 커스텀 커맨드 & 스킬 모음입니다.

## 설치

```bash
# 커맨드 설치
cp commands/git/commit-auto.md ~/.claude/commands/
cp commands/obsidian/obsidian-*.md ~/.claude/commands/
cp commands/project/project-docs.md commands/project/project-docs-gen.md commands/project/project-workflow.md ~/.claude/commands/

# 스킬 설치
cp -r skills/create-pr/ ~/.claude/skills/
cp -r skills/omc-learned/project-docs-gen/ ~/.claude/skills/omc-learned/
```

> **Obsidian 커맨드 참고:** 각 파일의 `{{OBSIDIAN_VAULT_PATH}}`를 자신의 볼트 경로로 치환하세요. 치환하지 않으면 첫 실행 시 Claude가 경로를 물어봅니다.

---

## 커맨드

### [Git](./commands/git/README.md)

| 커맨드 | 설명 |
|--------|------|
| `/commit-auto` | staged diff를 기능별로 그룹화하여 자동 커밋 |

### [Obsidian](./commands/obsidian/README.md)

| 커맨드 | 설명 |
|--------|------|
| `/obsidian-classify` | 분류 계획 출력 (읽기 전용) |
| `/obsidian-format [경로]` | YAML frontmatter 정규화 |
| `/obsidian-move` | 내용 기반 파일 분류 이동 |
| `/obsidian-index [폴더]` | 인덱스 파일 갱신 |
| `/obsidian-organize` | format → move → index 순서로 전체 정리 |

### [Project](./commands/project/README.md)

| 커맨드 | 설명 |
|--------|------|
| `/project-docs` | AI 협업용 docs/ 폴더 구조 생성 (입력 방식 선택: 채팅 / 템플릿 파일) |
| `/project-docs-gen` | 초안/기획서로 개발 문서 생성 (10종/핵심4종/개별) |
| `/project-workflow` | docs/ 기반 협업 워크플로우 (자연어 호출) |

**A. 새 프로젝트 — 기획서/초안이 있는 경우:**
```
1. /project-docs          →  docs/ 폴더 구조 생성 (프로젝트명, 스택 입력)
2. /project-docs-gen      →  기획서 붙여넣기 → 문서 생성 → docs/99_inbox/
3. "분류해줘"              →  99_inbox/ 문서를 01_specs/ 등으로 분류
4. "개발 시작해줘"         →  개발 진행
5. "리뷰해줘"              →  코드 리뷰 & CHANGELOG 기록
```

**B. 기존 프로젝트 — 이미 코드가 있는 경우:**
```
1. /project-docs          →  코드베이스 자동 스캔 → 스택/구조 파악 → docs/ 생성
2. "동기화 체크해줘"       →  문서 ↔ 코드 정합성 확인
3. "개발 시작해줘"         →  개발 진행
```

**C. 일상 협업 — docs/가 이미 있는 경우:**
```
단건 요청  → "개발해줘" 또는 "디자인 수정해줘" → "리뷰해줘"
다건 요청  → FEEDBACK.md에 모아서 작성 → "피드백 처리해줘" → "리뷰해줘"
이슈 발생  → "이슈 확인해줘" → 해결 → "리뷰해줘"
언제든     → "현재 상태 알려줘" (현황 대시보드)
언제든     → "동기화 체크해줘" (문서 ↔ 코드 정합성)
```

---

## 스킬

### [create-pr](./skills/create-pr/SKILL.md)

PR 생성 스킬. 변경사항 분석, 커밋 히스토리 요약, 한국어 PR 작성을 자동 수행합니다.

### [project-docs-gen](./skills/omc-learned/project-docs-gen/README.md)

`/project-docs-gen` 커맨드가 사용하는 문서 템플릿 10종입니다.

| 템플릿 | 문서 |
|--------|------|
| `01-requirements.md` | 요구사항정의서 |
| `02-tech-stack.md` | 기술 스택 결정서 |
| `03-roles.md` | 역할/권한 매트릭스 |
| `04-sitemap.md` | 정보구조도 |
| `05-features.md` | 기능명세서 |
| `06-erd.md` | ERD 설계서 |
| `07-api.md` | API 명세서 |
| `08-flowchart.md` | 플로우차트 |
| `09-wireframe.md` | 와이어프레임 설계서 |
| `10-scenarios.md` | 시나리오 케이스 |

---

## 파일 구조

```
claude-code-kit/
├── README.md
├── commands/
│   ├── git/
│   │   ├── README.md
│   │   └── commit-auto.md
│   ├── obsidian/
│   │   ├── README.md
│   │   ├── obsidian-classify.md
│   │   ├── obsidian-format.md
│   │   ├── obsidian-index.md
│   │   ├── obsidian-move.md
│   │   └── obsidian-organize.md
│   └── project/
│       ├── README.md
│       ├── project-docs.md
│       ├── project-docs-gen.md
│       └── project-workflow.md
└── skills/
    ├── create-pr/
    │   └── SKILL.md
    └── omc-learned/
        └── project-docs-gen/
            ├── README.md
            └── templates/
                ├── 01-requirements.md
                ├── 02-tech-stack.md
                ├── 03-roles.md
                ├── 04-sitemap.md
                ├── 05-features.md
                ├── 06-erd.md
                ├── 07-api.md
                ├── 08-flowchart.md
                ├── 09-wireframe.md
                └── 10-scenarios.md
```
