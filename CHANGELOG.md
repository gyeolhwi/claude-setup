# Changelog

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
