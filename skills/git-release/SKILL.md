---
name: git-release
description: 배포 릴리스 노트 작성. 사용자가 "릴리스 노트", "배포 노트", "이번 배포 정리", "버전 올려줘", "/git-release" 라고 하거나, git-convention 훅이 배포(main push, PR merge, 배포 명령)를 감지해 제안했을 때 사용한다. 지난 릴리스 이후 merge 된 PR·커밋을 TYPE 별로 묶어 PM 이 읽는 릴리스 노트를 만들고, 승인받아 GitHub Release·CHANGELOG.md 로 남긴다. 짝 스킬 git-commit(커밋), git-pr(PR).
allowed-tools: Bash(git *), Bash(gh *), Bash(date *)
---

# git-release — 배포 릴리스 노트

짝 스킬: `git-commit`(커밋 규칙) · `git-pr`(PR 규칙). 릴리스 노트의 재료는 그 두 스킬이 만든 이력이다.

- 항목 문장은 **PR 의 `## 달라지는 점`** 을 그대로 가져온다 (PM 언어로 이미 쓰여 있음).
- PR 이 없는 커밋은 **커밋 제목의 subject** 를 쓴다.
- 분류는 **제목의 TYPE** 으로 한다.

## 실행 절차

### 1. 범위 정하기

```bash
git fetch --tags -q
DEFAULT=$(gh repo view --json defaultBranchRef -q .defaultBranchRef.name 2>/dev/null || echo main)
git describe --tags --abbrev=0 "origin/$DEFAULT" 2>/dev/null      # 마지막 릴리스 태그
gh release list --limit 5                                         # 기존 릴리스와 태그 형식 확인
```

> Bash 호출 사이에 셸 변수는 유지되지 않는다. 위에서 알아낸 기본 브랜치 이름(예: `main`)을 이후 명령의 `<DEFAULT>`·`"$DEFAULT"` 자리에 **실제 값으로 넣어** 실행한다.

- 마지막 태그가 있으면 범위는 `<태그>..origin/<DEFAULT>`.
- 태그가 없으면 AskUserQuestion 으로 시작점을 묻는다 (권장: 첫 릴리스로 전체 이력 / 최근 N일 / 특정 커밋부터).
- 범위 안에 커밋이 하나도 없으면 "지난 릴리스 이후 변경이 없습니다" 를 알리고 멈춘다.

### 2. 재료 모으기 (병렬)

```bash
# 범위 안 커밋 (merge 커밋 제외)
git log <범위> --no-merges --format='%h%x09%s'

# 범위 안에 merge 된 PR (태그 날짜 이후)
gh pr list --state merged --base "$DEFAULT" --search "merged:>=<태그 날짜 YYYY-MM-DD>" \
  --json number,title,body,mergedAt,url,mergeCommit --limit 200
```

- PR 이 있으면 PR 단위로 쓰고, 그 PR 에 포함된 커밋은 중복으로 쓰지 않는다 (`gh pr view <n> --json commits` 로 확인).
- PR 에 속하지 않은 커밋(직접 push)은 커밋 단위로 쓴다.

### 3. 분류

| TYPE (제목 앞부분) | 릴리스 노트 섹션 |
|---|---|
| FEAT | 새 기능 |
| UX | 개선 |
| FIX | 버그 수정 |
| PERF | 성능 |
| CONTENT | 콘텐츠 |
| REVERT | 되돌림 |
| REFACTOR, CHORE, TEST, DOCS | 내부 작업 (접어서 개수와 제목만) |

옛 형식도 받아준다: 소문자(`feat:`, `fix(x):`)는 같은 TYPE 으로, `STYLE` 은 UX 로, `BUILD`·`CI`·`CONFIG`·`DELETE` 는 내부 작업으로. TYPE 이 없는 제목은 내용을 읽고 판단한다.

### 4. 버전 정하기

- 기존 태그가 `vX.Y.Z` 면: FEAT·UX 가 있으면 minor, 아니면 patch 를 올린다. 하위 호환이 깨지는 변경(API 제거, 데이터 마이그레이션 필수 등)이 보이면 major 를 제안한다.
- 기존 태그가 날짜형(`2026.11.11` 등)이면 같은 형식으로 오늘 날짜.
- 태그가 없으면 AskUserQuestion 으로 묻는다 (권장: `v0.1.0`, 대안: 날짜형).

### 5. 노트 작성

```markdown
## v1.4.0 — 2026-11-11

<이번 배포를 PM 언어로 요약한 1~2문장. 가장 중요한 변화부터>

### 새 기능
- 팀짜기 결과를 이미지로 공유할 수 있음 (#41)

### 개선
- 티어와 등급을 한 화면에서 고를 수 있음 (#38)

### 버그 수정
- 팀 채널에서 팀짜기가 막히던 문제 해결 (#32)

### 성능
- 명령어 응답 속도 개선 (5f02aa9)

<details>
<summary>내부 작업 3건 (사용 변화 없음)</summary>

- REFACTOR(team): 편성 옵션 처리 구조 정리 (#31)
- CHORE(config): 사용하지 않는 옛 코드 삭제 (9a4f1d0)
- DOCS(readme): 배포 절차 문서 추가 (#35)
</details>

**전체 변경**: https://github.com/<owner>/<repo>/compare/v1.3.0...v1.4.0
```

작성 규칙:
- 항목은 기술 용어 없이 결과로 쓴다. PR 의 `달라지는 점` 이 여러 줄이면 가장 중요한 1줄만, 필요하면 2줄까지.
- 각 항목 끝에 출처를 단다: PR 이면 `(#번호)`, 커밋이면 `(짧은 해시)`. AI 가 거꾸로 추적할 수 있게 하는 유일한 연결고리라 빼지 않는다.
- 비어 있는 섹션은 지운다. 섹션 순서는 위 표 순서로 고정.
- 요약 문단은 사용자·운영자가 체감할 변화가 가장 큰 것부터 쓴다. 내부 작업만 있으면 "사용자가 보는 변화 없이 내부 정비만 했습니다" 처럼 쓴다.
- AI 생성 표시는 넣지 않는다.

### 6. 승인받고 게시

노트 초안을 보여준 뒤 AskUserQuestion 으로 게시 방법을 묻는다.

```text
질문: v1.4.0 릴리스 노트를 어떻게 남길까요?
- GitHub Release + CHANGELOG.md (권장)   태그를 만들고 Release 를 게시하고, CHANGELOG.md 맨 위에 추가해 커밋합니다
- GitHub Release 만                      태그와 Release 만 만듭니다
- CHANGELOG.md 만                        저장소 파일에만 남깁니다
- 텍스트만                                화면에만 보여주고 아무것도 만들지 않습니다
```

- **GitHub Release**: 노트를 UTF-8 파일로 저장한 뒤
  `gh release create <버전> --target "$DEFAULT" --title "<버전> — <YYYY-MM-DD>" --notes-file <파일>`
- **CHANGELOG.md**: 파일이 없으면 `# Changelog` 제목으로 만들고, 새 노트를 제목 바로 아래(기존 항목 위)에 넣는다. `git-commit` 형식으로 커밋한다:
  `DOCS(release): v1.4.0 릴리스 노트 추가 - YYYY-MM-DD`. push 는 사용자가 원할 때만.
- 사용자가 "이 저장소에서는 릴리스 노트를 묻지 마" 라고 하면 `git config convention.release false` 를 설정한다 (이 저장소 로컬 설정, 커밋되지 않음).

## 훅이 제안했을 때

`~/.claude/hooks/git-convention.py` 는 다음을 배포로 본다: 기본 브랜치(main·master)로의 `git push`, `gh pr merge`, `vercel --prod`, `npm|pnpm|yarn run deploy`, `firebase deploy`, `fly deploy`, `wrangler deploy`.

훅 알림을 받으면 바로 노트를 만들지 말고 **먼저 사용자에게 지금 만들지 묻는다.** 이번 작업이 이 스킬의 CHANGELOG 커밋·push 자체였다면 묻지 않고 넘어간다.
