# claude-setup

Claude Code 용 커스텀 커맨드·스킬 모음. 새 컴퓨터나 다른 저장소에 한 번에 세팅한다.

## 무엇이 들어 있나

### 1. [docs/ 기반 프로젝트 협업](./docs/guide/project-docs-workflow.md)

프로젝트마다 `docs/` 폴더 하나를 두고 AI 와 사람이 같이 읽고 갱신한다.

```text
/project-docs        docs/ 골격 생성          ← 프로젝트당 한 번
/project-docs-gen    기획서 → 개발 문서 10종   ← 필요할 때
"개발 시작해줘"       서브모드 8종 (자연어)     ← 매일
```

서브모드: feedback · issues · dev · design · review · sync · status · classify

### 2. [이슈 → 워크트리 → 증거 → PR](./docs/guide/issue-workflow.md)

**이슈 하나 = 워크트리 하나 = PR 하나.** 증거(before/after webp)가 없으면 PR 이 안 만들어진다.

```text
/repo-init                    새 프로젝트 1회: 보드·필드·라벨·docs·작업 규칙 세팅
/issue-create  "고칠 내용"    이슈부터 등록 (승인 2회: 분할안 → 초안)
/issue-start   12             착수 → 워크트리 → 구현 → 증거 → 이슈 코멘트
/issue-end                    증거 재확인 → 기본 브랜치 커밋 → 이슈 코멘트 → PR
/issue-merge                  여러 워크트리 일괄 통합 → 통합 테스트 → 이슈 close
```

저장소에 GitHub Project 보드가 연결돼 있으면 진행 라벨이 바뀔 때 보드 Status·검수상태도 따라 옮겨진다.
내부 규약(워크트리 배치·라벨·브랜치명·보드 연동·트러블슈팅)은
[docs/spec/issue-workflow-internals.md](./docs/spec/issue-workflow-internals.md).

### 3. [Obsidian 볼트 관리](./docs/guide/obsidian-workflow.md)

```text
/obsidian-init        초기 1회
/obsidian-organize    format → move → index 일괄
/obsidian-preview     실행 전 미리보기 (읽기 전용)
```

### 4. [Git 커밋·PR·릴리스](./docs/guide/git-workflow.md)

제목은 PM 이 읽기 쉽게, 본문은 개발자·AI 가 추적할 수 있게. 세 스킬이 같은 `TYPE(scope)` 규칙을 쓴다.

```text
"커밋해"   / /git-commit     변경을 목적별로 나눠 커밋 (push 는 요청할 때만)
"PR 올려줘" / /git-pr         고정 섹션 PR — 달라지는 점이 릴리스 노트로 이어진다
"릴리스 노트" / /git-release  지난 릴리스 이후 변경을 TYPE 별로 정리
/git-board                   연결된 GitHub Project 보드 요약 (조회 전용)
```

`git-convention` 훅이 Claude 가 만든 커밋·PR 형식을 점검하고, 배포를 감지하면 릴리스 노트를 제안한다.

### 5. 발표자료 (deck)

주제·목적·대상이나 원본 문서(md)를 주면 고정 형식의 기획안을 먼저 만들고, 승인하면 항상 같은 디자인의 PPT 를 만든다.

```text
"발표자료 만들어줘" / /deck   기획안(plan.md) → 검토·승인 → PPT(pptx) + 미리보기
```

의존성(`npm install`)은 `install.sh` 가 받는다. 미리보기 이미지(`render`)는 LibreOffice 가 있어야 한다.

### 6. [Work 작업공간 + 실시간 뷰어](./docs/guide/work-workspace-workflow.md)

컴퓨터의 일을 `~/Work` 하나로 모으고(모든 일 = `Projects/<이름>`), 폴더·문서·바뀐 파일·에이전트 상태를 아이패드에서 실시간으로 본다.
`work-setup` 스킬과 뷰어는 [gyeolhwi/work-viewer](https://github.com/gyeolhwi/work-viewer) 저장소에서 관리하고 설치한다.

### 7. 문서 정리 (docs-tidy)

프로젝트 `docs/` 를 `guide / spec / ops` 로 나누고, 문서마다 YAML 머리말을 붙여 루트 `INDEX.md` 목차를 만든다. 이 저장소의 문서도 이 형식이다.

```text
"문서 정리해줘" / /docs-tidy   조사 → 적용 계획 승인 → 이동·머리말 → INDEX build·check
```

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

이미 설치한 컴퓨터는 `git pull` 뒤 `./install.sh --copy --no-obsidian` 을 다시 돌리면 최신으로 맞춰진다.

## 문서

| 카테고리 | 문서 |
| --- | --- |
| guide — 설치·사용법 | [전제 조건](./docs/guide/prerequisites.md) · [설치와 세팅](./docs/guide/install.md) · [이슈 워크플로우](./docs/guide/issue-workflow.md) · [Git 워크플로우](./docs/guide/git-workflow.md) · [docs 협업](./docs/guide/project-docs-workflow.md) · [Obsidian](./docs/guide/obsidian-workflow.md) · [Work 작업공간](./docs/guide/work-workspace-workflow.md) |
| spec — 목록·규약 | [커맨드·스킬 카탈로그](./docs/spec/catalog.md) · [원본 자산 지도](./docs/spec/source-map.md) · [이슈 워크플로우 내부 규약](./docs/spec/issue-workflow-internals.md) · [문서 작성 규약](./docs/spec/doc-conventions.md) |

전체 문서 목록과 요약·검색어는 [INDEX.md](./INDEX.md) 에 있다. AI 는 INDEX 부터 읽고 맞는 문서만 연다.

## 구조

```text
claude-setup/
├── INDEX.md                 AI 진입점 — 문서 라우팅 색인
├── README.md                사람 진입점 — 이 파일
├── CLAUDE.md                AI 작업 규칙 (INDEX 먼저 · INDEX 같이 갱신)
├── install.sh               설치·점검 스크립트
├── hooks/                   git-convention 훅 + CLAUDE.md 규칙 블록
│
├── docs/
│   ├── guide/               설치·사용법
│   │   ├── prerequisites.md · install.md
│   │   ├── issue-workflow.md · git-workflow.md · project-docs-workflow.md
│   │   └── obsidian-workflow.md · work-workspace-workflow.md (→ work-viewer)
│   └── spec/                목록·규약
│       ├── catalog.md · source-map.md
│       └── issue-workflow-internals.md · doc-conventions.md
│
├── commands/
│   ├── project/     project-docs · project-docs-gen · project-workflow
│   └── obsidian/    obsidian-* 7종 + templates/ (→ 볼트)
│
└── skills/
    ├── issue-create/  issue-start/  issue-end/  issue-merge/
    ├── git-commit/  git-pr/  git-release/  git-board/
    ├── gh-setup/
    ├── repo-init/     새 프로젝트 보드·라벨·docs·작업 규칙 세팅
    ├── deck/          발표 기획안 → PPT (npm 의존성)
    ├── docs-tidy/     docs 머리말 정리 · INDEX.md 목차 생성
    └── omc-learned/project-docs-gen/   문서 템플릿 10종
```

`docs/**/*.md` 는 전부 YAML 프론트매터(`id` · `title` · `category` · `summary` · `keywords` ·
`related_files` · `last_updated`)로 시작한다. 새 문서를 추가할 때의 규칙은
[docs/spec/doc-conventions.md](./docs/spec/doc-conventions.md) 를 본다.
