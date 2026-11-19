---
name: repo-init
description: 새 프로젝트를 시작할 때 GitHub 작업 환경을 한 번에 세팅한다. 저장소 연결, GitHub Project 보드 생성·저장소 연결·필드(Status·카테고리·작업유형·강조포인트·검수상태), 진행·성격 라벨, docs-tidy 형식 README·INDEX·docs(기존 docs 구조는 유지), work-format.md 작업 형식 문서, CLAUDE.md·AGENTS.md 작업 규칙, .gitignore, 첫 커밋까지 한다. 다시 실행하면 빠진 것만 채운다. "프로젝트 초기 세팅", "repo-init", "/repo-init", "새 프로젝트 깃허브 세팅", "보드 만들어줘", "GitHub Project 만들어", "이슈 환경 구성" 요청에 사용한다. 이미 세팅된 저장소에서 보드 조회만 원하면 git-board, 이슈 등록은 issue-create 를 쓴다.
argument-hint: "[보드 제목]"
---

# repo-init

새 프로젝트에 이슈 → 워크트리 → PR → 릴리스 흐름이 바로 돌아가도록 환경을 갖춘다.
모든 단계는 멱등이다. 있는 것은 건드리지 않고 빠진 것만 채운다.

```text
SCRIPT=~/.claude/skills/repo-init/scripts/repo-init.mjs
ISSUE=~/.claude/skills/issue-create/scripts/issue-create.mjs
```

## 1. 점검

```bash
node $SCRIPT check
```

`✓/✗` 표와 `MISSING=<수>` 가 나온다. ✗ 항목만 아래 단계에서 처리한다.

- `gh 로그인` ✗ → `gh-setup` 스킬로 먼저 끝낸다.
- `gh project 권한` ✗ → 사용자에게 `! gh auth refresh -s project` 를 실행해 달라고 한다 (브라우저 인증이라 대신 못 한다).
- git 저장소가 아니면 `git init -b main` 부터 한다.

## 2. 계획 승인

✗ 항목을 표로 보여주고 AskUserQuestion 으로 한 번에 승인받는다. 물을 것:

- 원격이 없을 때: 저장소 owner/이름, 공개 여부 (기본 private). `gh repo create` 는 외부에 만드는 일이라 승인 없이 하지 않는다.
- 보드 제목 (기본: 저장소 이름). 보드 owner 는 저장소 owner 와 같게 한다.

승인 범위 밖의 항목은 만들지 않는다.

## 3. 저장소와 원격

원격이 없으면 승인받은 값으로:

```bash
gh repo create <owner>/<name> --private --source . --remote origin
```

커밋이 하나도 없으면 원격 생성 뒤 5단계까지 끝내고 첫 커밋과 함께 push 한다.

## 4. 보드와 라벨

```bash
node $SCRIPT board --title "<보드 제목>"   # 없으면 만들고 저장소에 연결, 빠진 필드 추가
node $SCRIPT labels                         # status:* 5개 + bug·enhancement·documentation·chore
node $ISSUE board                           # 필드·옵션 확인
```

- 필드 정의는 `references/board-fields.json`. 프로젝트에 맞게 옵션을 바꾸려면 실행 전에 사용자와 정한다.
- 이미 있는 필드의 옵션은 지우거나 바꾸지 않는다. 스크립트가 빠진 옵션만 알려 준다.
- 보드는 저장소에 연결(link)돼야 issue 스킬이 찾는다. 스크립트가 연결까지 한다.
- 결과의 `BOARD_NUMBER` · `BOARD_URL` 을 5단계 템플릿에 쓴다.

## 5. 문서와 규칙

1. **docs 구조**: `docs/` 에 문서가 없으면 `docs-tidy` 스킬 절차로 `docs/{guide,spec,ops}`, README(소개·링크), INDEX 를 만든다. 소스가 거의 없으면 README 는 1~3문장 소개와 실행 방법만 쓴다.
   이미 다른 구조(예: `docs/01-API명세/` 같은 번호 폴더)가 있으면 그 구조를 그대로 두고 `guide`·`spec`·`ops` 폴더를 새로 만들지 않는다.
2. **작업 형식**: `references/work-format.template.md` 를 복사하고 `{{TODAY}}` · `{{BOARD_NUMBER}}` · `{{BOARD_URL}}` 을 채운다. `{{TAG_FORMAT}}` 은 `첫 릴리스 때 git-release 가 정한다` 로 둔다.
   - 위치: 새 구조면 `docs/ops/work-format.md`. 기존 구조면 그 안의 운영·작업 규칙 폴더에 `work-format.md` 로 두고, 맞는 폴더가 없으면 사용자에게 위치를 묻는다. 파일 이름은 `work-format.md` 로 고정한다 (`check` 가 이 이름으로 찾는다).
   - 머리말의 `category` 는 그 저장소 INDEX 의 분류에 맞춘다.
3. **에이전트 규칙**: `references/agent-rules.template.md` 블록을 CLAUDE.md 에 넣는다 (없으면 만든다). `{{WORK_FORMAT_PATH}}` 는 2번에서 둔 실제 경로로 채운다. 이미 `repo-init:rules:start` 블록이 있으면 그 블록만 교체한다. AGENTS.md 만 쓰는 저장소면 AGENTS.md 에 넣는다.
4. **.gitignore**: `.issue/` 와 `.omc/` 가 없으면 추가한다.
5. INDEX 갱신:

```bash
uv run ~/.claude/skills/docs-tidy/scripts/docs_index.py build --root .
uv run ~/.claude/skills/docs-tidy/scripts/docs_index.py check --root .
```

## 6. 커밋과 확인

- `git-commit` 스킬 형식으로 커밋한다. 예: `CHORE(repo): 이슈·보드·문서 작업 환경 세팅`.
- 새 저장소면 push 한다. 이미 굴러가는 저장소면 사용자 브랜치 규칙을 따른다 (기본 브랜치에 바로 push 하지 않는다).
- `node $SCRIPT check` 를 다시 돌려 `MISSING=0` 을 확인한다.

## 7. 보고

```text
보드     #<번호> <URL>  필드: Status·카테고리·작업유형·강조포인트·검수상태
라벨     만든 것 / 이미 있던 것
문서     README · INDEX · <work-format 경로> · CLAUDE.md 규칙
커밋     <해시> <제목>
다음     /issue-create "첫 작업"  →  /issue-start <번호>
```

확인하지 못한 것(예: push 를 안 했음, 권한 부족으로 건너뜀)은 따로 적는다.

## 이후 흐름과 보드 연동

이 스킬이 끝나면 다음이 자동으로 이어진다.

| 단계 | 스킬 | 보드 |
|---|---|---|
| 등록 | `issue-create` (`--assignee @me --field 카테고리=…`) | 보드에 추가, Status=Todo |
| 착수 | `issue-start` | In Progress, 검수상태=개발중 |
| PR | `issue-end` | 검수상태=검수요청 |
| 머지 | `issue-merge` | Done |
| 배포 | `git-release` | 태그 + Release + CHANGELOG.md |

보드 연동은 `issue-tracker.mjs` 가 진행 라벨이 바뀔 때 한다. 보드가 없으면 조용히 건너뛰고, 끄려면 `ISSUE_BOARD=0` 이나 `.issue/settings.json` 에 `"board": false`.
