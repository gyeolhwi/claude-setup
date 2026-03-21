# claude-code-kit

Claude Code에서 사용하는 커스텀 커맨드 & 스킬 모음입니다.

## 설치

```bash
# 커맨드 설치
cp commands/git/*.md ~/.claude/commands/
cp commands/obsidian/*.md ~/.claude/commands/
cp commands/project/*.md ~/.claude/commands/

# 스킬 설치
cp -r skills/omc-learned/ ~/.claude/skills/
```

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
| `/docs-gen [type]` | 초안/기획서로 개발 문서 10종 생성 |
| `/project-docs` | AI 협업용 docs/ 폴더 구조 생성 |
| `/feedback`, `/dev`, `/review` 등 | docs/ 기반 협업 워크플로우 |

**권장 워크플로우:**
```
1. /docs-gen       →  초안으로 10종 문서 생성 → docs/inbox/
2. /project-docs   →  프로젝트에 docs/ 폴더 생성
3. /classify       →  inbox/ 문서를 올바른 폴더로 분류
4. /dev, /feedback →  AI와 협업하며 개발 진행
```

---

## 스킬

### [project-docs-gen](./skills/omc-learned/project-docs-gen/README.md)

`/docs-gen` 커맨드가 사용하는 문서 템플릿 10종입니다.

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
│       ├── project-docs-gen.md
│       ├── project-docs.md
│       └── project-workflow.md
└── skills/
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