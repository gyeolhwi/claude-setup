# claude-setup

Claude Code 용 커스텀 커맨드·스킬 모음. 새 컴퓨터나 다른 저장소에 한 번에 세팅한다.

> AI 가 이 저장소를 탐색할 때는 [INDEX.md](./INDEX.md) 를 먼저 읽는다.

## 설치

```bash
git clone https://github.com/gyeolhwi/claude-setup.git
cd claude-setup

./install.sh --check     # 전제 조건만 점검
./install.sh             # ~/.claude 에 심볼릭 링크로 설치
```

Obsidian 볼트 경로를 물어본다. 안 쓰면 그냥 Enter.

Claude Code 안에서 하고 싶으면 clone 한 폴더를 열고 **"내 컴퓨터에 맞게 세팅해줘"** 라고 말해도 된다.

| 옵션 | 결과 |
| --- | --- |
| `--copy` | 링크 대신 복사 |
| `--codex` | `~/.codex` 에도 함께 |
| `--project <경로>` | 그 저장소의 `.claude` 에만 |
| `--obsidian <볼트>` | Obsidian 커맨드까지 (경로 치환 + 템플릿 배치) |
| `--no-obsidian` | Obsidian 을 묻지 않고 건너뛴다 |

자세한 매핑·검증·동기화는 [docs/setup/install.md](./docs/setup/install.md) 에 있다.
전제 조건(Node 18+ · `gh` · Playwright 는 어디에)은 [docs/setup/prerequisites.md](./docs/setup/prerequisites.md).

## 무엇이 들어 있나

### 1. [docs/ 기반 프로젝트 협업](./docs/workflows/project-docs-workflow.md)

프로젝트마다 `docs/` 폴더 하나를 두고 AI 와 사람이 같이 읽고 갱신한다.

```text
/project-docs        docs/ 골격 생성          ← 프로젝트당 한 번
/project-docs-gen    기획서 → 개발 문서 10종   ← 필요할 때
"개발 시작해줘"       서브모드 8종 (자연어)     ← 매일
```

서브모드: feedback · issues · dev · design · review · sync · status · classify

### 2. [이슈 → 워크트리 → 증거 → PR](./docs/workflows/issue-workflow.md)

**이슈 하나 = 워크트리 하나 = PR 하나.** 증거(before/after webp)가 없으면 PR 이 안 만들어진다.

```text
/issue-create  "고칠 내용"    이슈부터 등록 (승인 2회: 분할안 → 초안)
/issue-start   12             착수 → 워크트리 → 구현 → 증거 → 이슈 코멘트
/issue-end                    증거 재확인 → 기본 브랜치 커밋 → 이슈 코멘트 → PR
/issue-merge                  여러 워크트리 일괄 통합 → 통합 테스트 → 이슈 close
```

내부 규약(워크트리 배치·라벨·브랜치명·트러블슈팅)은
[docs/reference/issue-workflow-internals.md](./docs/reference/issue-workflow-internals.md).

### 3. [Obsidian 볼트 관리](./docs/workflows/obsidian-workflow.md)

```text
/obsidian-init        초기 1회
/obsidian-organize    format → move → index 일괄
/obsidian-preview     실행 전 미리보기 (읽기 전용)
```

### 4. [Git 커밋·PR](./docs/workflows/git-workflow.md)

```text
/commit-auto     staged diff 를 기능별로 그룹화해 자동 커밋
create-pr        한국어 PR 본문 생성 (자연어 트리거)
```

### 5. [Work 작업공간 + 실시간 뷰어](./docs/workflows/work-workspace-workflow.md)

컴퓨터의 일을 `~/Work` 하나로 모으고(모든 일 = `Projects/<이름>`), 폴더·문서·바뀐 파일·에이전트 상태를 아이패드에서 실시간으로 본다.

```text
"Work 세팅해줘" / /work-setup    조사 → 계획 승인 → README·INDEX·AGENTS·docs 생성 → 뷰어 설치
```

커맨드·스킬 전체 목록은 [docs/reference/catalog.md](./docs/reference/catalog.md) 에 있다.

## 구조

```text
claude-setup/
├── INDEX.md                 AI 진입점 — 문서 라우팅 색인
├── README.md                사람 진입점 — 이 파일
├── install.sh               설치·점검 스크립트
│
├── docs/
│   ├── setup/
│   │   ├── prerequisites.md         전제 조건
│   │   └── install.md               설치·검증·동기화
│   ├── workflows/
│   │   ├── project-docs-workflow.md docs/ 기반 협업
│   │   ├── issue-workflow.md        이슈 → 워크트리 → PR
│   │   ├── obsidian-workflow.md     볼트 관리
│   │   ├── git-workflow.md          커밋·PR
│   │   └── work-workspace-workflow.md  작업공간 세팅·뷰어
│   └── reference/
│       ├── catalog.md                   커맨드·스킬 전체 목록
│       ├── issue-workflow-internals.md  상태·라벨·브랜치 규약, 트러블슈팅
│       └── doc-conventions.md           문서 프론트매터 규약
│
├── commands/
│   ├── git/         commit-auto
│   ├── project/     project-docs · project-docs-gen · project-workflow
│   └── obsidian/    obsidian-* 7종 + templates/ (→ 볼트)
│
└── skills/
    ├── issue-create/  issue-start/  issue-end/  issue-merge/
    ├── gh-setup/      create-pr/
    ├── work-setup/    작업공간 세팅 + viewer/ (Bun)
    └── omc-learned/project-docs-gen/   문서 템플릿 10종
```

`docs/**/*.md` 는 전부 YAML 프론트매터(`id` · `title` · `category` · `summary` · `keywords` ·
`related_files` · `last_updated`)로 시작한다. 새 문서를 추가할 때의 규칙은
[docs/reference/doc-conventions.md](./docs/reference/doc-conventions.md) 를 본다.
