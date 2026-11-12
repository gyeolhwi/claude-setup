---
id: workflows-git-workflow
title: Git 커밋·PR·릴리스 워크플로우
category: workflows
summary: 커밋은 git-commit, PR 은 git-pr, 배포 릴리스 노트는 git-release 스킬이 같은 TYPE(scope) 규칙으로 만든다. 제목은 PM 이 읽고 본문(Why·How·Refs·Related·Author)은 개발자·AI 가 추적한다. git-convention 훅이 Claude 가 만든 커밋·PR 형식을 점검하고 배포를 감지하면 릴리스 노트를 제안한다. git-board 는 저장소에 연결된 GitHub Project 보드를 요약한다.
keywords: [git-commit, git-pr, git-release, git-board, git-convention, 커밋, commit, PR, 풀리퀘스트, 릴리스, release, 릴리스노트, CHANGELOG, 컨벤션, convention, TYPE, scope, FEAT, UX, FIX, PERF, CONTENT, DOCS, REFACTOR, TEST, CHORE, REVERT, Why, How, Refs, 훅, hook, 보드, project]
related_files:
  - skills/git-commit/SKILL.md
  - skills/git-pr/SKILL.md
  - skills/git-release/SKILL.md
  - skills/git-board/SKILL.md
  - hooks/git-convention.py
  - hooks/git-convention.CLAUDE.md
last_updated: 2026-11-12
---

# Git 커밋·PR·릴리스 워크플로우

세 스킬이 **같은 TYPE·scope 규칙**을 쓰고, 앞 단계의 결과를 다음 단계가 그대로 가져간다.

```text
git-commit  ──▶  git-pr  ──▶  git-release
커밋 제목          PR "달라지는 점"     릴리스 노트 항목
```

| 스킬 | 호출 | 하는 일 |
| --- | --- | --- |
| `git-commit` | "커밋해" · "커밋하고 푸시" · `/git-commit` | 변경을 목적별로 묶어 여러 커밋으로 나눈다. push 는 요청했을 때만 |
| `git-pr` | "PR 올려줘" · `/git-pr` | 고정 섹션 PR 을 만든다 (`요약` → `달라지는 점` → `왜` → `구현` → `리뷰 포인트` → `확인 방법` → `관련`) |
| `git-release` | "릴리스 노트" · "이번 배포 정리" · `/git-release` | 지난 태그 이후 merge 된 PR·커밋을 TYPE 별로 묶어 GitHub Release·`CHANGELOG.md` 로 남긴다 (승인 후) |
| `git-board` | "보드 확인" · "다음 뭐 해?" · `/git-board` | 저장소에 연결된 GitHub Project 보드를 Status 별로 요약한다. 조회 전용 |

다른 스킬(`issue-start` · `issue-end`)이나 서브에이전트가 커밋·PR 을 만들 때도 이 형식을 따른다.
`install.sh` 가 `CLAUDE.md` 에 넣는 `<git_convention>` 블록이 그 약속이다.

## 커밋 형식

```text
<TYPE>(<scope>): <subject> - YYYY-MM-DD

- <동작 변화>

Why: <바꾼 이유 또는 원인 1문장>
How:
- <파일·모듈>: <코드에 있는 이름> <무엇을>

Refs: #<이슈·PR 번호>
Related: <연관 커밋 해시>
Author: <git user.name>
```

- **제목은 PM 이 읽는다** — 한국어, 무엇이 달라졌는지, 기술 용어 없이. FIX 는 `~하던 문제 해결`,
  사용 변화가 없으면 끝에 `(사용 변화 없음)`.
- **본문은 개발자·AI 가 읽는다** — 키 이름(`Why:` · `How:` · `Refs:` · `Related:` · `Author:`)은 항상 같은 영문이라
  `git log --grep=<함수명>` 으로 다시 찾을 수 있다.
- AI 생성 표시(`Co-Authored-By: Claude`, `🤖 Generated with ...`)는 커밋·PR 어디에도 넣지 않는다.

| TYPE | 사용 기준 |
| --- | --- |
| FEAT | 전에 없던 것을 할 수 있게 됨 |
| UX | 기존 기능의 보이는 모습·쓰는 방식이 바뀜 |
| FIX | 의도대로 동작하지 않던 것을 고침 |
| PERF | 같은 기능이 더 빠르거나 가벼워짐 |
| CONTENT | 서비스에 보이는 텍스트·이미지·데이터 |
| DOCS | 개발·운영 문서 |
| REFACTOR | 동작은 그대로, 내부 구조 정리 |
| TEST | 테스트 추가·수정 |
| CHORE | 설정·빌드·의존성·CI/CD·파일 정리 |
| REVERT | 이전 커밋 되돌리기 (`Related:` 필수) |

전체 규칙과 예시는 [`skills/git-commit/SKILL.md`](../../skills/git-commit/SKILL.md) 에 있다.

## git-convention 훅

`hooks/git-convention.py` 는 Claude 가 Bash 를 실행한 직후(`PostToolUse`) 돈다. 명령을 막지 않고, 문제가 있을 때만 Claude 에게 알린다.

| 감지 | 점검 |
| --- | --- |
| `git commit` | 방금 만든 커밋 제목이 `TYPE(scope): ... - YYYY-MM-DD` 인지, AI 표시가 없는지 |
| `gh pr create` · `gh pr edit` | PR 제목 형식과 `## 요약` · `## 달라지는 점` · `## 관련` 섹션 |
| 기본 브랜치 push · PR merge · 배포 명령 | `git-release` 로 릴리스 노트를 만들지 제안 |

저장소별로 끄기:

```bash
git config convention.check false     # 커밋·PR 형식 점검 끄기
git config convention.release false   # 릴리스 노트 제안 끄기
```

`install.sh` 가 훅 파일을 `~/.claude/hooks/` 에 두고 `~/.claude/settings.json` 의 `hooks.PostToolUse` 에 등록한다. python3 가 필요하다.

## 이슈 파이프라인과의 관계

`/issue-start` 의 구현 커밋은 `git-commit` 형식에 `Refs: #<이슈번호>` 를 붙이고,
`/issue-end` 의 PR 은 `git-pr` 형식에 `## 증거` 섹션을 더한다. 자세한 흐름은 [issue-workflow.md](./issue-workflow.md).

## 예전 이름

`/commit-auto` 커맨드와 `create-pr` 스킬은 각각 `git-commit` · `git-pr` 로 대체됐다.
예전 것이 남아 있으면 `install.sh` 가 알려 준다 (지우지는 않는다).
