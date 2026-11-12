---
id: reference-issue-workflow-internals
title: 이슈 워크플로우 내부 규약
category: reference
summary: issue-* 스킬군의 상태 파일이 홈과 저장소 어디에 사는지, .gitignore 블록이 왜 증거만 뚫어 두는지, 워크트리 배치 두 가지, 브랜치 이름 규칙, 성격·진행 상태 라벨 두 축, 기본 브랜치 판별 순서, 그리고 증상별 트러블슈팅 표.
keywords: [settings.json, .issue, 워크트리, worktree, sibling, children, gitignore, 브랜치명, slug, prefix, 라벨, label, status, detectBase, 기본브랜치, 트러블슈팅, exit4]
related_files:
  - skills/issue-create/scripts/issue-common.mjs
  - skills/issue-start/references/worktree.md
  - docs/workflows/issue-workflow.md
last_updated: 2026-08-27
---

# 이슈 워크플로우 내부 규약

사용법은 [workflows/issue-workflow.md](../workflows/issue-workflow.md) 에 있다. 여기는 "왜 이렇게 되어 있나" 쪽이다.

## 상태와 데이터가 어디에 사는가

**설정은 홈에, 산출물은 저장소에** 산다.

### 홈 — 컴퓨터당 한 번만 정한다

`~/.issue/settings.json`

```json
{
  "version": 1,
  "provider": { "type": "github" },
  "worktree": { "layout": "children", "decidedAt": "..." },
  "gh": { "installed": true, "authenticated": true, "account": "gyeolhwi" }
}
```

| 키 | 의미 |
| --- | --- |
| `provider.type` | `github`(기본) 또는 `jira`. 네 스킬이 같은 파일을 읽는다 |
| `worktree.layout` | `sibling` 또는 `children`. 첫 실행 때 **딱 한 번** 물어보고 고정한다 |
| `git.defaultBaseBranch` | 저장소에서 base 판별이 실패할 때만 쓰는 사용자 습관값 |
| `gh` | `gh-setup` 이 기록하는 플랫폼·인증 캐시 |

> 구 경로 `~/.issue-plugin/settings.json` 이 있으면 스킬이 새 경로로 1회 복사하고 알려 준다. 구 파일은 지우지 않는다.

### 저장소 — 프로젝트마다 새로 생긴다

```text
<repo>/.issue/settings.json          git.baseBranch (main/master 판별 결과 캐시)
<repo>/.issue/<번호>/request.md      원본 요청 — issue-start 의 대조 분석이 재사용
<repo>/.issue/<번호>/issue.md        gh 로 수집한 이슈 본문·코멘트
<repo>/.issue/<번호>/plan.md         대조 분석 결과와 계획
<repo>/.issue/<번호>/images/         이슈 첨부 이미지
<repo>/.issue/<번호>/evidence/       before/after webp — 유일하게 커밋되는 것
<repo>/.issue/worktrees/<번호>-<slug>/   children 배치일 때의 워크트리
<repo>/.issue/merge/base/            issue-merge 의 base 전용 임시 워크트리
```

## .gitignore 블록 — 증거만 뚫려 있다

`/issue-create` 가 자동으로 넣는 블록이다. 이슈 코멘트에서 이미지가 렌더링되려면
증거가 기본 브랜치에 실제로 올라가 있어야 하기 때문에 이것만 예외로 뚫어 둔다.

```gitignore
# issue-* workspace — evidence only stays committed so issue comments render
.issue/**
!.issue/*/
!.issue/*/evidence/
!.issue/*/evidence/**
.issue/**/.auth.json
.issue/**/storage-state.json
```

> `children` 배치에서 이 블록이 깨져 있으면, 부모 저장소에서 `git add -A` 한 번에 워크트리 전체가
> 스테이징되는 사고가 난다. 그래서 스크립트가 워크트리를 만들기 전에 `git check-ignore` 로 실제 무시 여부를
> 확인하고, 안 걸리면 **생성을 중단한다.**

## 워크트리 배치 두 가지

| layout | 경로 | 성격 |
| --- | --- | --- |
| `sibling` | `<repo 부모>/<repo>-issue-<번호>` | 소스 디렉터리 옆에 형제로 쌓인다 |
| `children` | `<repo>/.issue/worktrees/<번호>-<slug>` | 프로젝트 안에 모인다. IDE·파일 감시자·ripgrep 이 중복 트리를 훑을 수 있다 |

## 브랜치 이름 규칙

```text
<prefix>/<이슈번호>-<영문-slug>      예) fix/59-tab-active-state
```

**이슈 번호는 필수다.** `issue-end` 와 `issue-merge` 가 브랜치 이름에서 이슈를 역추론한다.
숫자 앞은 `/` 나 `_` 여야 인식되므로 `fix/59-login` 은 되고 `fix-59-login` 은 안 된다.

slug 는 영문 kebab-case 로 **직접 지어서** 넘긴다. 한글 제목을 자동 slug 로 만들면 글자가 전부 날아가 `issue-59` 만 남는다.

`evidence/issue-<번호>` 브랜치는 증거 URL 이 의존하므로 **어느 단계에서도 삭제 대상이 아니다.**

## 라벨 체계

두 축이 **독립**으로 붙는다. 한 이슈에 성격 라벨 하나 + 진행 상태 라벨 하나.

### 성격 라벨 — 브랜치 prefix 를 정한다

| 라벨 | 의미 | prefix |
| --- | --- | --- |
| `bug` | 동작이 잘못됨 | `fix/` |
| `enhancement` | 기능 추가·개선 | `feat/` |
| `documentation` | 문서 | `docs/` |
| `chore` | 정리·설정·의존성 | `chore/` |

저장소에 이미 다른 컨벤션(`type: bug`, `kind/feature` 등)이 있으면 그쪽을 따른다.
다만 prefix 추론은 완전일치로만 매칭하므로 커스텀 컨벤션에서는 `fix/` 로 떨어진다 — `worktree --prefix` 로 직접 지정한다.

### 진행 상태 라벨 — 파이프라인 위치를 보여준다

| 라벨 | 의미 | 전환 주체 |
| --- | --- | --- |
| `status:open` | 등록됨, 아직 착수 전 | `issue-create` — 자동 |
| `status:plan` | 분석·계획 중 | `issue-start` — 자동 |
| `status:in-process` | 워크트리에서 구현 중 | `issue-start` — 자동 |
| `status:review` | PR 이 열려 merge 대기 | `issue-end` — 수동 호출 |
| `status:close` | merge 되어 종료 | `issue-merge` — 자동 |

상호배타라서 전환은 전용 명령 하나로 한다. `--add-label` 과 `--remove-label` 을 직접 조합하면 두 개가 동시에 붙는 사고가 난다.

```bash
node ~/.claude/skills/issue-create/scripts/issue-create.mjs status 59 in-process
```

## 기본 브랜치 판별

`detectBase` 가 이 순서를 내장하고 있어 네 스킬 어디서 들어와도 같은 값이 나온다.

```text
1. --base 인자                        이번 실행에만 적용
2. <repo>/.issue/settings.json        git.baseBranch    ← 이 저장소의 기록. 있으면 여기서 끝
3. origin/HEAD → main → master        실제 저장소에서 판별하고 그 값을 2 에 적어 둔다
4. ~/.issue/settings.json             git.defaultBaseBranch ← 3 이 실패할 때만
```

```bash
node -e "import(process.env.HOME+'/.claude/skills/issue-create/scripts/issue-common.mjs').then(m=>console.log(m.detectBase(process.cwd())))"
```

> **문서와 설치본의 차이.** `issue-start/references/worktree.md` 는
> `issue-create.mjs base` / `base --set` / `base --default` 를 안내하지만, 설치본에 `base` 서브커맨드는 **없다**
> (`✗ 알 수 없는 모드: base`). 판별 로직 자체는 `issue-common.mjs` 의 `detectBase` 에 살아 있고 정상 동작한다.
> 기본 브랜치를 손으로 고정하려면 `<repo>/.issue/settings.json` 의 `git.baseBranch` 를 직접 쓰거나 `--base <branch>` 를 넘긴다.

## 트러블슈팅

| 증상 | 원인과 처치 |
| --- | --- |
| `exit 4` 로 빠지며 인증 실패 | `gh auth status` 실패. `/gh-setup` 으로 설치·로그인을 먼저 끝낸다 |
| `WORKTREE_LAYOUT_UNSET=1` | 배치 미결정. 한 번 고르면 `~/.issue/settings.json` 에 박힌다 |
| 예전 설정의 `nested` 때문에 배치를 다시 물어봄 | 이름이 `children` 으로 바뀌었다. 한 번만 다시 고르면 된다 |
| 워크트리 생성이 중단됨 (children) | `.gitignore` 의 `.issue` 블록이 깨졌다. 위 블록을 복원한다 |
| 이슈 코멘트에서 이미지가 안 뜸 | 증거를 기본 브랜치에 커밋·푸시하기 **전에** 코멘트했다. 순서를 지킨다 |
| `playwright 를 찾지 못했습니다` | 스킬이 아니라 **작업할 프로젝트**에 설치해야 한다 |
| 증거가 png 로 남음 | sharp·cwebp·ffmpeg 이 전부 없다. `brew install webp` |
| 브랜치명에서 이슈 번호를 못 읽음 | `fix-59-login` 형태. 숫자 앞은 `/` 나 `_` 여야 한다 |
| slug 가 `issue-59` 로만 남음 | 한글 제목 자동 slug. `--slug` 로 영문 kebab-case 를 직접 넘긴다 |
| 성격 라벨 없이 `create` 하면 exit 2 | 의도된 차단이다. 라벨을 정하고 다시 부른다 |
| `✗ 알 수 없는 모드: base` | 레퍼런스 문서에만 있고 설치본에는 없는 명령이다. `detectBase` 나 `--base` 를 쓴다 |

## 확인 범위

2026-08-27 기준으로 스킬 실물(`SKILL.md` · `references/` · `scripts/`)을 읽고 정리한 내용이다.

**확인함** — 스크립트에 사용자 고유 절대 경로가 박혀 있지 않다. Node 표준 모듈만 쓴다
(`capture.mjs` 만 playwright 필수·sharp 선택을 동적으로 찾는다).
`gate` · `labels` · `issue-end context` · `detectBase` 가 새 경로에서도 동작한다.

**확인하지 않음** — 새 컴퓨터에 처음부터 설치해 4단계를 끝까지 돌려보는 시나리오,
`provider.type: jira` 경로, 서브에이전트 모델 고정이 실제로 먹는지.
