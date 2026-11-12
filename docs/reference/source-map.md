---
id: reference-source-map
title: 원본 자산 지도와 자주 묻는 질문
category: reference
summary: 실제로 설치되는 원본(install.sh·commands·skills·hooks)이 어느 경로에 있고 무엇을 담는지 정리한 목록과, 자주 묻는 질문별로 열어야 할 docs 문서를 짝지은 표.
keywords: [원본, 자산, assets, 소스, 경로, install.sh, commands, skills, hooks, git-convention, 템플릿, 어디서 고치나, 자주 묻는 질문, FAQ, 바로가기]
related_files:
  - install.sh
  - commands/
  - skills/
  - hooks/
last_updated: "2026-11-12"
---

# 원본 자산 지도와 자주 묻는 질문

## 원본 자산

문서가 아니라 **실제로 설치되는 것들**이다. 동작을 고치려면 여기를 고친다.

```yaml
assets:
  - path: install.sh
    title: 설치 스크립트
    summary: 전제 조건 점검 후 커맨드·스킬·훅을 ~/.claude 또는 지정 저장소에 링크·복사한다. git-convention 훅 등록, CLAUDE.md 규칙 블록, Obsidian 볼트 경로 치환과 템플릿 배치까지.
    keywords: [install, 설치, check, copy, link, codex, project, obsidian]

  - path: commands/project/
    title: 프로젝트 커맨드 원본
    summary: /project-docs, /project-docs-gen, project-workflow(서브모드 8종) 정의.
    keywords: [project-docs, project-docs-gen, project-workflow, docs, 협업]

  - path: commands/obsidian/
    title: Obsidian 커맨드 원본
    summary: obsidian-* 커맨드 7종과 볼트 문서 템플릿 10종({{OBSIDIAN_VAULT_PATH}} 치환 대상).
    keywords: [obsidian, 볼트, 템플릿, TPL]

  - path: skills/issue-create/ · issue-start/ · issue-end/ · issue-merge/ · gh-setup/
    title: 이슈 워크플로우 스킬
    summary: SKILL.md + references/(단계별 절차) + scripts/(Node 표준 모듈만 쓰는 .mjs).
    keywords: [issue, 워크트리, 증거, PR, gh, 스킬]

  - path: skills/git-commit/ · git-pr/ · git-release/ · git-board/
    title: Git 커밋·PR·릴리스·보드 스킬
    summary: 같은 TYPE(scope) 규칙의 커밋·PR·릴리스 노트 작성과 GitHub Project 보드 조회. AI 생성 문구를 넣지 않는다.
    keywords: [git-commit, git-pr, git-release, git-board, 커밋, PR, 릴리스, 보드]

  - path: hooks/
    title: git-convention 훅
    summary: git-convention.py(PostToolUse 로 커밋·PR 형식 점검, 배포 감지 시 릴리스 노트 제안)와 CLAUDE.md 에 넣는 <git_convention> 규칙 블록.
    keywords: [hook, 훅, git-convention, PostToolUse, CLAUDE.md, convention.check, convention.release]

  - path: skills/omc-learned/project-docs-gen/
    title: 개발 문서 템플릿 10종
    summary: /project-docs-gen 이 읽는 요구사항·기술스택·역할·정보구조·기능명세·ERD·API·플로우차트·와이어프레임·시나리오 템플릿.
    keywords: [템플릿, requirements, tech-stack, roles, sitemap, features, erd, api, flowchart, wireframe, scenarios]
```

## 자주 묻는 것 → 갈 곳

| 질문 | 문서 |
| --- | --- |
| 새 컴퓨터에 어떻게 깔지 | `docs/setup/install.md` |
| 뭐가 있는지 전체 목록 | `docs/reference/catalog.md` |
| "개발 시작해줘" 같은 걸 어떻게 쓰는지 | `docs/workflows/project-docs-workflow.md` |
| 이슈 만들고 PR 까지 어떻게 가는지 | `docs/workflows/issue-workflow.md` |
| 커밋·PR·릴리스 노트 형식 | `docs/workflows/git-workflow.md` |
| 워크트리·라벨·브랜치명 규칙 | `docs/reference/issue-workflow-internals.md` |
| 뭔가 안 될 때 | `docs/reference/issue-workflow-internals.md#트러블슈팅` |
| 문서를 새로 추가할 때 | `docs/reference/doc-conventions.md` |
