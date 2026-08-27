---
id: git-workflow
title: Git 커밋·PR 워크플로우
category: workflows
summary: staged diff 를 변경 목적별로 그룹화해 자동 커밋하는 /commit-auto 의 동작 방식과 커밋 타입 12종 컨벤션, 그리고 변경사항·커밋 히스토리를 요약해 한국어 PR 본문을 만드는 create-pr 스킬 사용법.
keywords: [commit-auto, 커밋, commit, 컨벤션, convention, FEAT, FIX, REFACTOR, CHORE, create-pr, PR, 풀리퀘스트, staged, diff, 그룹화]
related_files:
  - commands/git/commit-auto.md
  - skills/create-pr/SKILL.md
last_updated: 2026-08-27
---

# Git 커밋·PR 워크플로우

## `/commit-auto` — 기능별 그룹 자동 커밋

staged diff 를 읽고 변경 목적이 같은 파일끼리 묶어 커밋 메시지를 만들고 커밋한다.

```bash
git add <파일>
/commit-auto
```

- 그룹이 1개면 바로 커밋한다.
- 그룹이 2개 이상이면 `git reset` → 그룹 단위 `git add` → 순차 커밋한다.

### 커밋 메시지 형식

```text
<TYPE>(<scope>): <subject> - YYYY-MM-DD
```

| Type | 사용 기준 |
| --- | --- |
| FEAT | 새로운 기능 추가 |
| FIX | 버그 수정 |
| REFACTOR | 기능 변경 없는 구조 개선 |
| STYLE | 코드 포맷 (들여쓰기, 세미콜론 등) |
| DOCS | 개발 관련 문서 |
| TEST | 테스트 코드 |
| CHORE | 빌드와 무관한 정리 |
| PERF | 성능 개선 |
| BUILD | 빌드 설정·의존성 변경 |
| CI | CI/CD 파이프라인 설정 |
| CONTENT | 사이트에 보여지는 콘텐츠 변경 |
| REVERT | 이전 커밋 되돌리기 |

## `create-pr` — 한국어 PR 본문 생성

변경사항을 분석하고 커밋 히스토리를 요약해 한국어 PR 을 만든다. 자연어로 트리거된다
("PR 생성", "PR 올려줘", "풀 리퀘스트 만들기").

`🤖 Generated with Claude Code` 같은 AI 생성 문구는 **절대 넣지 않는다.**

이슈 파이프라인 안에서는 `/issue-end` 가 PR 생성까지 처리하므로 따로 부를 필요가 없다.
파이프라인 밖에서 PR 본문만 필요할 때 쓰는 스킬이다 — [issue-workflow.md](./issue-workflow.md) 참고.
