---
id: catalog
title: 커맨드·스킬 카탈로그
category: reference
summary: 이 저장소가 제공하는 커맨드 10개와 스킬 11개, 훅 1개의 전체 목록. 각 항목의 호출 방식(슬래시/자연어), 원본 파일 경로, 설치 위치, 관련 워크플로우 문서를 한 표에서 찾을 수 있다. project-docs-gen 템플릿 10종의 의존 관계도 포함한다.
keywords: [카탈로그, catalog, 목록, 커맨드, command, 스킬, skill, 훅, hook, git-commit, git-pr, git-release, git-board, 슬래시, 템플릿, template, 의존관계, ID체계, REQ, FEAT, SCR, API, TC, FLOW, EDGE]
related_files:
  - commands/
  - skills/
  - hooks/
last_updated: 2026-11-12
---

# 커맨드·스킬 카탈로그

## 커맨드 (슬래시 호출)

| 커맨드 | 원본 | 설명 | 워크플로우 |
| --- | --- | --- | --- |
| `/project-docs` | `commands/project/project-docs.md` | AI 협업용 `docs/` 폴더 구조 생성 | [project-docs](../workflows/project-docs-workflow.md) |
| `/project-docs-gen` | `commands/project/project-docs-gen.md` | 기획서·초안 → 개발 문서 10종 | [project-docs](../workflows/project-docs-workflow.md) |
| `/obsidian-init` | `commands/obsidian/obsidian-init.md` | 볼트 초기 세팅 | [obsidian](../workflows/obsidian-workflow.md) |
| `/obsidian-preview` | `commands/obsidian/obsidian-preview.md` | 분류·변환 미리보기 (읽기 전용) | [obsidian](../workflows/obsidian-workflow.md) |
| `/obsidian-format` | `commands/obsidian/obsidian-format.md` | YAML frontmatter 정규화 | [obsidian](../workflows/obsidian-workflow.md) |
| `/obsidian-move` | `commands/obsidian/obsidian-move.md` | 내용 기반 폴더 이동 | [obsidian](../workflows/obsidian-workflow.md) |
| `/obsidian-index` | `commands/obsidian/obsidian-index.md` | 인덱스 파일 갱신 | [obsidian](../workflows/obsidian-workflow.md) |
| `/obsidian-organize` | `commands/obsidian/obsidian-organize.md` | format → move → index 일괄 | [obsidian](../workflows/obsidian-workflow.md) |
| `/obsidian-categories` | `commands/obsidian/obsidian-categories.md` | 카테고리 정의 (다른 커맨드가 참조) | [obsidian](../workflows/obsidian-workflow.md) |
| `project-workflow` | `commands/project/project-workflow.md` | **자연어 호출.** docs/ 기반 서브모드 8종 | [project-docs](../workflows/project-docs-workflow.md) |

커맨드는 설치 시 폴더 구조가 펼쳐져 `~/.claude/commands/<파일명>.md` 로 들어간다.
슬래시 커맨드 이름이 곧 파일명이기 때문이다.

## 스킬

| 스킬 | 원본 | 호출 | 설명 | 워크플로우 |
| --- | --- | --- | --- | --- |
| `issue-create` | `skills/issue-create/` | `/issue-create` · 자동 | 코드 수정 전 이슈 등록 | [issue](../workflows/issue-workflow.md) |
| `issue-start` | `skills/issue-start/` | `/issue-start <번호>` | 착수 · 워크트리 · 구현 · 증거 | [issue](../workflows/issue-workflow.md) |
| `issue-end` | `skills/issue-end/` | `/issue-end` | 증거 재확인 · 이슈 코멘트 · PR | [issue](../workflows/issue-workflow.md) |
| `issue-merge` | `skills/issue-merge/` | `/issue-merge` | 여러 워크트리 통합 · 이슈 close | [issue](../workflows/issue-workflow.md) |
| `gh-setup` | `skills/gh-setup/` | `/gh-setup` · 자동 | `gh` 설치·로그인 안내 | [issue](../workflows/issue-workflow.md) |
| `git-commit` | `skills/git-commit/` | `/git-commit` · 자연어 · 자동 | 목적별로 나눠 커밋 (PM 제목 + Why·How 본문) | [git](../workflows/git-workflow.md) |
| `git-pr` | `skills/git-pr/` | `/git-pr` · 자연어 · 자동 | 고정 섹션 PR 생성 | [git](../workflows/git-workflow.md) |
| `git-release` | `skills/git-release/` | `/git-release` · 자연어 · 훅 제안 | 릴리스 노트 → GitHub Release · CHANGELOG | [git](../workflows/git-workflow.md) |
| `git-board` | `skills/git-board/` | `/git-board` · 자연어 | GitHub Project 보드 요약 (조회 전용) | [git](../workflows/git-workflow.md) |
| `work-setup` | `skills/work-setup/` | `/work-setup` · 자연어 | 작업 폴더 구조 세팅 + 실시간 뷰어 설치 | [work](../workflows/work-workspace-workflow.md) |
| `project-docs-gen` 템플릿 | `skills/omc-learned/project-docs-gen/` | — | `/project-docs-gen` 이 읽는 템플릿 10종 | 아래 |

각 스킬은 `SKILL.md` + `references/` + `scripts/` 로 구성된다. `work-setup` 은 `scripts/` 대신 뷰어 코드(`viewer/`, Bun)를 둔다.
`references/` 는 단계별 상세 절차, `scripts/` 는 Node 표준 모듈만 쓰는 `.mjs` 다.

## 훅

| 훅 | 원본 | 이벤트 | 설명 | 워크플로우 |
| --- | --- | --- | --- | --- |
| `git-convention` | `hooks/git-convention.py` | `PostToolUse` (Bash) | 커밋·PR 형식 점검, 배포 감지 시 `git-release` 제안 | [git](../workflows/git-workflow.md) |

`hooks/git-convention.CLAUDE.md` 는 `install.sh` 가 `CLAUDE.md` 에 덧붙이는 `<git_convention>` 규칙 블록이다.

## project-docs-gen 템플릿 10종

`skills/omc-learned/project-docs-gen/templates/` 에 있다. 의존 문서가 앞서 있어야 품질이 나온다.

| 파일 | 문서 | 의존 문서 |
| --- | --- | --- |
| `01-requirements.md` | 요구사항정의서 | — (최초 작성) |
| `02-tech-stack.md` | 기술 스택 결정서 | requirements |
| `03-roles.md` | 역할/권한 매트릭스 | requirements |
| `04-sitemap.md` | 정보구조도 | requirements, roles |
| `05-features.md` | 기능명세서 | requirements, sitemap |
| `06-erd.md` | ERD 설계서 | features, roles |
| `07-api.md` | API 명세서 | features, erd |
| `08-flowchart.md` | 플로우차트 | features, sitemap |
| `09-wireframe.md` | 와이어프레임 설계서 | sitemap, features |
| `10-scenarios.md` | 시나리오 케이스 | 전체 문서 참조 |

ID 접두사: `REQ-` · `FEAT-` · `SCR-` · `API-` · `TC-` · `FLOW-` · `EDGE-`.
상세 규칙은 `commands/project/project-docs-gen.md` 에 있다.
