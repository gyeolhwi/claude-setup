# claude-setup

Claude Code 용 커스텀 커맨드·스킬·훅 모음. 새 컴퓨터나 다른 저장소에 `install.sh` 한 번으로 같은 작업 환경을 세팅한다.

## 현재 상태

[v0.3.0](./CHANGELOG.md) 릴리스. 이 저장소에서 고치고 push 한 뒤, 각 컴퓨터에서 `git pull` 후 다시 설치해 맞춘다.

## 주요 기능

- **이슈 → 워크트리 → 증거 → PR**: 이슈 하나 = 워크트리 하나 = PR 하나. before/after 증거가 없으면 PR 이 안 만들어진다.
  `/repo-init` → `/issue-create` → `/issue-start 12` → `/issue-end` → `/issue-merge` · [가이드](./docs/guide/issue-workflow.md)
- **Git 커밋·PR·릴리스**: 제목은 PM 이 읽기 쉽게, 본문은 개발자·AI 가 추적할 수 있게. 훅이 형식을 점검한다.
  `"커밋해"` · `/git-pr` · `/git-release` · `/git-board` · [가이드](./docs/guide/git-workflow.md)
- **docs/ 기반 프로젝트 협업**: docs 골격을 만들고 기획서를 개발 문서 10종으로 펼친 뒤 자연어 서브모드로 협업한다.
  `/project-docs` · `/project-docs-gen` · `"개발 시작해줘"` · [가이드](./docs/guide/project-docs-workflow.md)
- **문서 정리**: docs 를 `guide / spec / ops` 로 나누고 YAML 머리말과 `INDEX.md` 목차를 만든다. 이 저장소 문서도 이 형식이다.
  `/docs-tidy` · [규약](./docs/spec/doc-conventions.md)
- **발표자료**: 기획안(plan.md)을 먼저 승인받고 항상 같은 디자인의 PPT 를 만든다.
  `/deck` · [SKILL](./skills/deck/SKILL.md)
- **Obsidian 볼트 관리**: 노트 머리말 정규화 → 폴더 이동 → 인덱스 갱신.
  `/obsidian-init` · `/obsidian-organize` · [가이드](./docs/guide/obsidian-workflow.md)
- **Work 작업공간 + 실시간 뷰어**: [gyeolhwi/work-viewer](https://github.com/gyeolhwi/work-viewer) 저장소에서 관리한다. · [안내](./docs/guide/work-workspace-workflow.md)

## 기술 스택

Bash(`install.sh`) · Node 18+(스킬 스크립트·deck) · Python 3(훅·docs-tidy) · GitHub CLI(`gh`)

## 폴더 구조

```text
commands/    슬래시 커맨드 (project-*, obsidian-*)
skills/      스킬 (issue-*, git-*, repo-init, deck, docs-tidy …)
hooks/       git-convention 훅
docs/        guide(설치·사용법) · spec(목록·규약)
install.sh   설치·점검 스크립트
```

파일별 상세는 [원본 자산 지도](./docs/spec/source-map.md).

## 시작하기

```bash
git clone https://github.com/gyeolhwi/claude-setup.git && cd claude-setup
./install.sh --check     # 전제 조건 점검
./install.sh             # ~/.claude 에 심볼릭 링크로 설치
```

이미 설치한 컴퓨터는 `git pull` 뒤 `./install.sh --copy --no-obsidian`. 옵션 전체와 설치 위치는 [설치와 세팅](./docs/guide/install.md).

## 문서

- [전제 조건](./docs/guide/prerequisites.md) · [설치와 세팅](./docs/guide/install.md)
- [커맨드·스킬 카탈로그](./docs/spec/catalog.md) · [원본 자산 지도](./docs/spec/source-map.md)
- 전체 목록과 요약·검색어: [INDEX.md](./INDEX.md) (AI 는 여기부터 읽는다)
