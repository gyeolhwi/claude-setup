# claude-setup

Claude Code 작업 환경을 한 번에 맞추는 개인 설정 모음.
설치 한 번으로 어느 컴퓨터에서든 같은 작업 규칙·자동화 도구로 작업 가능.

## 현재 상태

[v0.3.0](./CHANGELOG.md) 배포.

## 주요 기능

| 기능 | 설명 |
|---|---|
| [이슈 기반 작업](./docs/guide/issue-workflow.md) | 이슈 등록 → 작업 공간 분리 → 작업 전후 화면 캡처 → PR 까지 순서대로 진행 |
| [커밋·PR·릴리스 규칙](./docs/guide/git-workflow.md) | 누구나 읽기 쉬운 제목과 나중에 추적 가능한 본문으로 기록, 형식 자동 점검 |
| [새 프로젝트 초기 세팅](./docs/guide/issue-workflow.md) | GitHub 저장소·작업 보드·라벨·기본 문서를 한 번에 구성 |
| [문서 정리](./docs/spec/doc-conventions.md) | 프로젝트 문서를 사용법·명세·운영으로 분류하고 목차 자동 생성 |
| [기획서 기반 개발 문서](./docs/guide/project-docs-workflow.md) | 기획서 하나로 요구사항·기능명세·API 명세 등 개발 문서 10종 생성 |
| [발표자료 생성](./skills/deck/SKILL.md) | 발표 기획안 승인 후 항상 같은 디자인의 PPT 생성 |
| [Obsidian 노트 정리](./docs/guide/obsidian-workflow.md) | 쌓인 노트의 형식 통일 → 주제별 폴더 이동 → 목차 갱신 |

전체 명령어 목록은 [커맨드·스킬 카탈로그](./docs/spec/catalog.md).

## 기술 스택

Bash · Node.js 18+ · Python 3 · GitHub CLI

## 폴더 구조

```text
skills/      자동화 도구 (이슈·커밋·문서·발표자료 등)
commands/    슬래시 명령 (프로젝트 문서·Obsidian)
hooks/       커밋·PR 형식 자동 점검
docs/        사용법·명세 문서
install.sh   설치 스크립트
```

## 시작하기

```bash
git clone https://github.com/gyeolhwi/claude-setup.git && cd claude-setup
./install.sh --check     # 필요한 프로그램 점검
./install.sh             # 설치
```

업데이트는 `git pull` 후 `./install.sh --copy --no-obsidian`. 설치 옵션은 [설치와 세팅](./docs/guide/install.md) 참고.

## 문서

- [전제 조건](./docs/guide/prerequisites.md) · [설치와 세팅](./docs/guide/install.md) · [커맨드·스킬 카탈로그](./docs/spec/catalog.md)
- 전체 문서 목록: [INDEX.md](./INDEX.md)
