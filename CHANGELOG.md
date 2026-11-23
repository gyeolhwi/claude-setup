# Changelog

## v0.4.0 — 2026-11-23

문서 정리 스킬(docs-tidy)이 함께 설치되고, docs-tidy·repo-init 이 만드는 README 가 사람과 AI 모두 한 번에 프로젝트를 파악할 수 있는 정해진 형식으로 바뀌었습니다. 근거 없는 실행 명령(`npm run dev` 등)을 지어 넣던 문제도 고쳤습니다.

### 업데이트 전 확인할 것
- 다른 컴퓨터는 `git pull` 후 `./install.sh --copy --no-obsidian` 으로 다시 설치해야 반영됨

### 새 기능
- `/docs-tidy`: 문서 정리 스킬이 `install.sh` 로 함께 설치됨 (3950397)

### 개선
- README 가 8개 블록 형식으로 바뀜: 이름·한 줄 소개 → 현재 상태 → 주요 기능 → 핵심 개념 → 동작 방식 → 프로젝트 구조 → 시작하기 → 문서 안내 (a30eeff, f04b653)
- README 는 명사형 소개 문체로 약 80줄 안에서 끝나고, 넘치는 내용은 docs 로 보냄 (afd0a00, 3db2f99)

### 버그 수정
- 정의되지 않은 실행 명령(`npm run dev` 등)을 README 에 추측으로 넣던 문제 해결 (b99e010)
- clone 이 실제 설치 방법인 저장소에서 README 의 clone 안내가 빠지던 문제 해결 (7a5b9df)
- 다시 설치해도 커밋 규칙 안내가 예전 버전으로 남던 문제 해결 (aecf575)

<details>
<summary>내부 작업 5건 (사용 변화 없음)</summary>

- DOCS(docs): 저장소 문서를 docs-tidy 형식(guide·spec)으로 정리 (029cc80)
- DOCS(docs): README를 한눈에 프로젝트를 파악할 수 있는 개요로 정리 (51a824a)
- DOCS(docs): README를 명령어 없이 읽히는 프로젝트 소개로 다시 작성 (0184946)
- DOCS(docs): README를 첫 화면에서 무엇인지 보이는 짧은 소개로 다시 작성 (0a84224)
- DOCS(docs): README에 핵심 개념·동작 그림·프로젝트 구조 추가 (b001f6d)
</details>

**전체 변경**: https://github.com/gyeolhwi/claude-setup/compare/v0.3.0...v0.4.0

## v0.3.0 — 2026-11-19

새 프로젝트를 시작할 때 `/repo-init` 한 번으로 GitHub 보드·라벨·작업 규칙이 갖춰지고, 이슈를 진행하면 보드 카드가 알아서 옮겨집니다. 발표자료(deck) 슬라이드에는 출처를 한 줄 달 수 있습니다.

### 업데이트 전 확인할 것
- 보드 연동을 쓰려면 gh 토큰에 project 권한이 있어야 함: `gh auth refresh -s project`. 없으면 이슈 흐름은 그대로 돌고 경고만 나옴 (#7)
- 보드가 연결되지 않은 저장소는 지금과 같음. 끄려면 `ISSUE_BOARD=0` 또는 `.issue/settings.json` 에 `"board": false` (#7)

### 새 기능
- `/repo-init`: 새 프로젝트의 GitHub 보드(필드 5종)·라벨·작업 형식 문서·작업 규칙을 한 번에 세팅하고, 다시 돌리면 빠진 것만 채움 (#7)
- 이슈 진행 상태가 바뀌면 보드도 따라감: 등록 Todo → 착수 In Progress/개발중 → PR 검수요청 → merge Done (#7)
- 발표자료 기획안에 `source` 한 줄을 쓰면 슬라이드 맨 아래에 작은 글씨로 출처가 나옴 (#9)

### 버그 수정
- 이미 문서가 있는 저장소에서 `/repo-init` 이 문서 구조를 섞던 문제 해결. 기존 구조는 그대로 두고 작업 형식 문서만 그 안에 넣음 (#9)

<details>
<summary>내부 작업 2건 (사용 변화 없음)</summary>

- DOCS(docs): 새 프로젝트 세팅과 보드 연동 사용법 문서화 (#7)
- DOCS(docs): 기존 저장소에서 repo-init 을 쓸 때 문서 구조 안내 (#9)
</details>

**전체 변경**: https://github.com/gyeolhwi/claude-setup/compare/v0.2.0...v0.3.0

## v0.2.0 — 2026-11-16

발표자료 스킬(deck)이 추가되어 `install.sh` 한 번으로 어느 컴퓨터에서나 기획안 → PPT 작업을 할 수 있습니다. Work 작업공간 스킬은 work-viewer 저장소로 옮겨, claude-setup 설치가 그쪽 스킬을 덮어쓰지 않습니다.

### 업데이트 전 확인할 것
- work-setup 스킬은 더 이상 claude-setup 이 설치하지 않음. Work 작업공간·뷰어를 쓰려면 gyeolhwi/work-viewer 를 clone 해 설치 (#3)
- deck 을 쓰려면 npm 이 있어야 하고, 미리보기 이미지(render)는 LibreOffice 가 필요함 (#5)

### 새 기능
- `install.sh` 실행 시 deck 스킬이 함께 깔리고 의존성(npm install)까지 받아져 바로 `/deck` 을 쓸 수 있음 (#5)

<details>
<summary>내부 작업 3건 (사용 변화 없음)</summary>

- CHORE(work-setup): Work 작업공간 스킬을 work-viewer 저장소로 넘김 (#3)
- docs(issue-2): 증거 자료 main 반영 (29dc83f)
- docs(issue-4): 증거 자료 main 반영 (55e4efb)
</details>

**전체 변경**: https://github.com/gyeolhwi/claude-setup/compare/v0.1.0...v0.2.0

## v0.1.0 — 2026-11-12

Claude Code 커맨드·스킬 모음의 첫 릴리스입니다. `./install.sh` 한 번으로 이슈→PR 흐름, 커밋·PR·릴리스 규칙, Obsidian 볼트 정리, Work 작업공간 뷰어까지 세팅됩니다.

### 업데이트 전 확인할 것
- `/commit-auto` 와 `create-pr` 가 없어지고 `git-commit` · `git-pr` 로 바뀜. 예전에 설치한 파일은 install.sh 가 알려만 주고 지우지 않으므로 직접 정리해야 함 (36d7f55)
- install.sh 가 이제 `~/.claude/settings.json` 에 커밋·PR 형식 점검 훅을 등록하고 `CLAUDE.md` 에 규칙 블록을 추가함 (이미 있으면 건너뜀) (36d7f55)
- Obsidian 커맨드는 볼트 경로를 넣어야 동작함: 설치할 때 `--obsidian <볼트>` 로 주거나 첫 실행 때 입력 (e46bff6)
- 프로젝트 문서 커맨드 이름이 바뀜: `/docs-gen` → `/project-docs-gen`, project-workflow 는 슬래시 대신 "리뷰해줘" 같은 말로 부름 (4fe5569)

### 새 기능
- 커맨드·스킬을 한 번에 설치하고 전제 조건을 점검하는 설치 스크립트 (4b8f465)
- 이슈 등록 → 작업 공간 분리 → 전후 화면 증거 → PR → 일괄 통합까지 이어지는 이슈 스킬 5종 (f2987f6)
- 커밋·PR·릴리스 노트를 한 규칙으로 쓰고, 형식이 어긋나면 바로 알려 주며, GitHub 보드 현황을 요약해 볼 수 있음 (36d7f55)
- 작업 폴더를 프로젝트별로 정리하고, 폴더·문서·에이전트 상태를 아이패드에서 실시간으로 보는 Work 뷰어 (6cab0ff, b083c3d)
- Obsidian 볼트 정리에 문서 템플릿, 정리 전 미리보기, 새 카테고리 제안 추가 (dcfa217, 2a07ab2, e20b46d)

### 개선
- 이슈 작업으로 남는 커밋·PR 도 같은 커밋·PR 규칙을 따름 (c9756aa)
- Work 뷰어 화면을 아이패드·PC·가로 화면에 맞게 정리 (90f87a5, bfac1eb, 06ce9db)

### 버그 수정
- Obsidian 인덱스가 같은 항목을 중복으로 추가하던 문제 해결 (1199999)

<details>
<summary>내부 작업 2건 (사용 변화 없음)</summary>

- CHORE(config): 개인 PC 경로가 담긴 로컬 설정 파일을 저장소에서 제외 (6d1ce2f)
- DOCS(docs): 문서를 머리말 기반 docs/ 체계와 자동 생성 INDEX 로 정리 (5b0f39a, 1016f34)
</details>

**전체 변경**: https://github.com/gyeolhwi/claude-setup/commits/v0.1.0
