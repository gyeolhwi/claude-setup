---
id: install
title: 설치와 세팅
category: setup
summary: 새 컴퓨터나 다른 저장소에 커맨드·스킬을 세팅하는 방법. install.sh 의 옵션 전체, 무엇이 어디로 복사되는지의 매핑표, 링크와 복사의 차이, 설치 후 검증 명령, 원본 동기화 방법을 담는다.
keywords: [설치, install, install.sh, 세팅, 심볼릭링크, symlink, copy, codex, 볼트, obsidian, 설치확인, 동기화, rsync, 새컴퓨터]
related_files:
  - install.sh
  - docs/setup/prerequisites.md
last_updated: 2026-08-27
---

# 설치와 세팅

## 빠른 시작

```bash
git clone https://github.com/gyeolhwi/claude-setup.git
cd claude-setup

./install.sh --check     # 전제 조건만 점검
./install.sh             # ~/.claude 에 심볼릭 링크로 설치
```

Obsidian 볼트 경로를 물어본다. 안 쓰면 그냥 Enter 를 친다.

Claude Code 안에서 하고 싶으면 clone 한 폴더를 열고 이렇게 말해도 된다.

```
내 컴퓨터에 맞게 세팅해줘
```

이 경우 Claude 가 [INDEX.md](../../INDEX.md) → 이 문서를 읽고 `install.sh` 를 대신 돌린다.

## 옵션

| 명령 | 결과 |
| --- | --- |
| `./install.sh` | `~/.claude/{commands,skills}` 에 심볼릭 링크 |
| `./install.sh --copy` | 링크 대신 복사 |
| `./install.sh --codex` | `~/.codex` 에도 함께 |
| `./install.sh --project <경로>` | 그 저장소의 `.claude` 에만 |
| `./install.sh --obsidian <볼트>` | Obsidian 커맨드까지 (경로 치환 + 템플릿 배치) |
| `./install.sh --no-obsidian` | Obsidian 을 묻지 않고 건너뛴다 |
| `./install.sh --check` | 설치하지 않고 전제 조건만 점검 |

기존 설치가 있으면 `<이름>.bak.<타임스탬프>` 로 물려 두고 새로 건다.

**링크 vs 복사** — 링크로 걸면 이 저장소에서 고칠 때 모든 프로젝트에 즉시 반영된다.
프로젝트마다 다르게 손볼 생각이면 `--copy` 를 쓴다.
Obsidian 커맨드는 볼트 경로를 치환해야 해서 **옵션과 무관하게 항상 복사**된다.

## 무엇이 어디로 가나

| 원본 | 설치 위치 | 비고 |
| --- | --- | --- |
| `commands/git/commit-auto.md` | `~/.claude/commands/` | |
| `commands/project/project-docs.md` | `~/.claude/commands/` | |
| `commands/project/project-docs-gen.md` | `~/.claude/commands/` | |
| `commands/project/project-workflow.md` | `~/.claude/commands/` | |
| `commands/obsidian/obsidian-*.md` | `~/.claude/commands/` | `{{OBSIDIAN_VAULT_PATH}}` 치환 |
| `commands/obsidian/templates/` | `<볼트>/01_문서템플릿/` | **볼트 안이 정본** |
| `skills/create-pr/` | `~/.claude/skills/create-pr/` | |
| `skills/gh-setup/` | `~/.claude/skills/gh-setup/` | |
| `skills/issue-create/` `issue-start/` `issue-end/` `issue-merge/` | `~/.claude/skills/` | |
| `skills/omc-learned/project-docs-gen/` | `~/.claude/skills/omc-learned/project-docs-gen/` | 템플릿 10종 |

커맨드는 폴더 구조가 **펼쳐져서** 들어간다. 저장소에서는 `commands/project/project-docs.md` 지만
설치 후에는 `~/.claude/commands/project-docs.md` 다. 슬래시 커맨드 이름이 곧 파일명이기 때문이다.

`~/.issue/settings.json` 이 없으면 `provider: github` 로 만들어 준다. 이미 있으면 건드리지 않는다.

## 스킬 탐색 순서

각 스킬은 아래 중 **존재하는 첫 번째 경로**를 자기 루트로 삼는다. 프로젝트 설치가 홈 설치를 이긴다.

```text
.claude/skills/<이름>      # 현재 프로젝트 (Claude Code)
.codex/skills/<이름>       # 현재 프로젝트 (Codex)
~/.claude/skills/<이름>    # 홈 설치
~/.codex/skills/<이름>     # 홈 설치
```

`.claude/` 밑이면 실행 계열은 **claude**, `.codex/` 밑이면 **codex** 로 판별하고 이걸로 서브에이전트 모델을 고른다.

## 설치 확인

저장소를 건드리지 않는 읽기 전용 명령들이다.

```bash
# 1. 커맨드·스킬이 보이는가 — 새 Claude Code 세션에서
/project-docs
/issue-create

# 2. 스크립트가 도는가 — 아무 git 저장소 안에서
node ~/.claude/skills/issue-create/scripts/issue-create.mjs gate     # READY/ASK/SKIP
node ~/.claude/skills/issue-create/scripts/issue-create.mjs labels   # 저장소 라벨 목록
node ~/.claude/skills/issue-end/scripts/issue-end.mjs context        # 브랜치·base·증거 상태 JSON

# 3. 인증이 통과하는가
gh auth status
```

## 첫 실행 때 한 번만 물어보는 것

새 컴퓨터·새 저장소에서 처음 돌리면 두 가지를 묻고 고정한다. 이후로는 묻지 않는다.

1. **워크트리 배치** (`sibling` / `children`) → `~/.issue/settings.json`
2. **기본 브랜치** — 저장소에서 판별이 실패할 때만 (`main` / `master`)

저장소 실제 상태가 사용자 습관보다 우선이다. 평소 `main` 을 쓰더라도 그 저장소가 `master` 면 `master` 를 쓴다.
자세한 결정 순서는 [issue-workflow-internals.md](../reference/issue-workflow-internals.md#기본-브랜치-판별) 에 있다.

## 손으로 설치하기

스크립트를 안 쓰겠다면 이것만 하면 된다.

```bash
mkdir -p ~/.claude/commands ~/.claude/skills
cp commands/git/*.md commands/project/*.md ~/.claude/commands/
for s in create-pr gh-setup issue-create issue-start issue-end issue-merge; do
  cp -R skills/$s ~/.claude/skills/
done
mkdir -p ~/.claude/skills/omc-learned
cp -R skills/omc-learned/project-docs-gen ~/.claude/skills/omc-learned/
```

## 원본과 동기화

`--copy` 로 설치한 뒤 `~/.claude/` 쪽에서 고쳤다면 저장소로 되돌려 맞춘다.

```bash
for s in create-pr gh-setup issue-create issue-start issue-end issue-merge; do
  rsync -a --delete --exclude '.DS_Store' ~/.claude/skills/$s/ skills/$s/
done
```

`--link` 로 설치했다면 이 저장소를 고치는 것이 곧 원본을 고치는 것이다.
Obsidian 템플릿은 **볼트 안이 정본**이므로 방향이 반대다 — 볼트에서 고친 뒤 저장소로 되돌린다.
