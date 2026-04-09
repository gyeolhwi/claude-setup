# claude-code-kit

Claude Code에서 사용하는 커스텀 커맨드 & 스킬 모음입니다.

## 설치

```bash
git clone https://github.com/gyeolhwi/claude-setup.git
```

clone한 폴더에서 Claude Code를 열고 아래와 같이 말하세요:

```
내 컴퓨터에 맞게 세팅해줘
```

Claude가 이 README를 읽고 OS에 맞게 자동으로 세팅합니다.

### 설치 대상

| 원본 | 복사 위치 | 비고 |
|------|----------|------|
| `commands/git/commit-auto.md` | `~/.claude/commands/` | |
| `commands/obsidian/obsidian-*.md` | `~/.claude/commands/` | Obsidian 사용자만 |
| `commands/project/project-docs.md` | `~/.claude/commands/` | |
| `commands/project/project-docs-gen.md` | `~/.claude/commands/` | |
| `commands/project/project-workflow.md` | `~/.claude/commands/` | |
| `skills/create-pr/` | `~/.claude/skills/create-pr/` | 폴더째 복사 |
| `skills/omc-learned/project-docs-gen/` | `~/.claude/skills/omc-learned/project-docs-gen/` | 폴더째 복사 |

> **Obsidian 사용자:** 설치 후 `/obsidian-init`을 실행하면 볼트 경로 설정, 카테고리 확인, 폴더/인덱스 생성까지 한 번에 처리됩니다.

---

## 기능 목록

> 커맨드(`/명령`)는 슬래시로 직접 호출, 스킬은 자연어로 자동 트리거됩니다.

### [Git](./commands/git/README.md)

| 이름 | 유형 | 설명 |
|------|------|------|
| `/commit-auto` | 커맨드 | staged diff를 기능별로 그룹화하여 자동 커밋 |
| `create-pr` | 스킬 | 변경사항 분석, 커밋 히스토리 요약, 한국어 PR 자동 생성 |

### [Obsidian](./commands/obsidian/README.md)

| 이름 | 유형 | 설명 |
|------|------|------|
| `/obsidian-init` | 커맨드 | 초기 세팅 (볼트 경로, 카테고리, 폴더/인덱스 생성) |
| `/obsidian-preview` | 커맨드 | 분류/변환 미리보기 (읽기 전용) |
| `/obsidian-format [경로]` | 커맨드 | YAML frontmatter 정규화 |
| `/obsidian-move` | 커맨드 | 내용 기반 파일 분류 이동 |
| `/obsidian-index [폴더]` | 커맨드 | 인덱스 파일 갱신 |
| `/obsidian-organize` | 커맨드 | format → move → index 순서로 전체 정리 |
| `/obsidian-categories` | 커맨드 | 카테고리 설정 (다른 커맨드가 참조) |

### [Project](./commands/project/README.md)

| 이름 | 유형 | 설명 |
|------|------|------|
| `/project-docs` | 커맨드 | AI 협업용 docs/ 폴더 구조 생성 (입력 방식 선택: 채팅 / 템플릿 파일) |
| `/project-docs-gen` | 커맨드 | 초안/기획서로 개발 문서 생성 (10종/핵심4종/개별) |
| `/project-workflow` | 커맨드 | docs/ 기반 협업 워크플로우 (자연어 호출) |

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

## 템플릿

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
│   │   ├── obsidian-categories.md
│   │   ├── obsidian-format.md
│   │   ├── obsidian-index.md
│   │   ├── obsidian-init.md
│   │   ├── obsidian-move.md
│   │   ├── obsidian-organize.md
│   │   └── obsidian-preview.md
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
