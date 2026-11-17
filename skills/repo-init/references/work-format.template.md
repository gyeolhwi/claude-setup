---
id: ops-work-format
title: 작업 형식 표준 - 이슈·PR·보드·전후 증거·릴리스
category: ops
summary: 이슈→워크트리→PR→머지→릴리스 흐름과 GitHub Project 보드 필드, 커밋·PR·릴리스 형식, 작업 분할 규칙
keywords: [작업 형식, 이슈, PR, GitHub Project, 보드, 검수상태, 강조포인트, 전후 증거, 워크트리, 릴리스, CHANGELOG]
related_files: []
last_updated: "{{TODAY}}"
---

# 작업 형식 표준

사람은 이슈 맨 위 `결과`와 보드만 보면 되고, AI 는 고정된 제목과 경로로 필요한 칸을 찾는다.

## 흐름

| 단계 | 스킬 | 보드 Status / 검수상태 | 라벨 |
|---|---|---|---|
| 등록 | `issue-create` | Todo | `status:open` |
| 착수 | `issue-start` | In Progress / 개발중 | `status:plan` → `status:in-process` |
| PR | `issue-end` | In Progress / 검수요청 | `status:review` |
| 머지·닫기 | `issue-merge` | Done | `status:close` |
| 배포 | `git-release` | — | 태그 + Release + CHANGELOG.md |

보드 Status·검수상태는 진행 라벨이 바뀔 때 스크립트가 자동으로 옮긴다. 손으로 옮기지 않는다.
`검수완료`는 담당자가 직접 확인한 것만 넣는다. 자동 시험 통과는 검수완료가 아니다.

## GitHub Project 보드 (#{{BOARD_NUMBER}})

- 보드: {{BOARD_URL}}
- 이슈를 등록하면 보드에 들어가고 아래 필드를 채운다.

| 필드 | 값 | 바뀌는 때 |
|---|---|---|
| Assignees | 담당자 (`--assignee @me`) | 등록 |
| Status | Todo → In Progress → Done | 자동 |
| 카테고리 | 프론트엔드 · 백엔드 · 인프라/배포 · 수동작업(콘솔) · 디자인 · 문서 | 등록 |
| 작업유형 | 신규개발 · 버그수정 · 리팩토링 · 설정/연동 · 문서화 | 등록 |
| 강조포인트 | 핵심 판단이나 주의점을 ` / `로 이은 짧은 한 줄 | 등록, 결론이 바뀌면 수정 |
| 검수상태 | 개발중 → 검수요청 → 수정필요 → 검수완료 | 착수·PR 은 자동, 나머지는 담당자 |

```bash
# 등록하면서 필드 채우기
node ~/.claude/skills/issue-create/scripts/issue-create.mjs create --title "..." --body-file draft.md \
  --label enhancement --assignee @me --field 카테고리=프론트엔드 --field 작업유형=신규개발 --field "강조포인트=..."
# 나중에 고치기
node ~/.claude/skills/issue-create/scripts/issue-create.mjs board-set 12 --field 검수상태=검수완료
```

## 이슈·PR·커밋 형식

- 이슈 본문: `issue-create` 초안 형식. 맨 위 `결과`는 머지·검증 뒤 채운다.
- 커밋: `git-commit` 스킬. 제목 `<TYPE>(<scope>): <결과 중심 한국어>`, 본문 `Why:` · `How:` · `Refs: #이슈`.
- PR: `git-pr` 스킬. `Closes #N` 은 쓰지 않는다. 이슈는 통합 검증 뒤 `issue-merge` 가 닫는다.
- 릴리스: `git-release` 스킬. 태그 형식은 첫 릴리스 때 정하고 아래에 적는다.
  - 태그 형식: {{TAG_FORMAT}}

## 공통 규칙

- 한 줄에 사실 하나. 추정은 `(추정)`을 붙인다.
- 파일은 경로로, 이슈·PR 은 번호로 적는다.
- 확인한 것과 못 한 것을 나눈다. 시험한 환경을 함께 적는다.

## 작업 분할

- 따로 머지할 수 있고 완료 기준이 겹치지 않으면 이슈를 나눈다. 이슈 1 = 워크트리 1 = PR 1.
- 메인 폴더에서 구현하지 않는다. `issue-start` 가 만든 워크트리에서 한다.
- 겹치지 않는 이슈는 `issue-parallel` 로 동시에 돌린다.
- 같은 파일을 고친 PR 은 합친 상태로 다시 검증한 뒤 머지한다.
- 머지한 뒤 워크트리와 브랜치를 지운다.

## 증거

- `.issue/<번호>/evidence/{before,after}/` 의 webp. 전후는 같은 화면·크기로 찍는다.
- 화면이 없는 작업은 명령 출력이나 근거를 글로 적는다.
