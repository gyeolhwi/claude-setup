---
id: issue-workflow
title: 이슈 → 워크트리 → 증거 → PR 워크플로우
category: workflows
summary: GitHub 이슈를 먼저 등록하고, 이슈당 워크트리 하나에서 구현하고, before/after 증거를 webp 로 남겨 이슈에 코멘트하고, PR 을 만들고, 여러 워크트리를 순서대로 누적 검증하며 통합하는 4단계 파이프라인의 사용법. 각 스킬이 무엇을 자동으로 하고 어디서 승인을 받는지 정리한다.
keywords: [issue-create, issue-start, issue-end, issue-merge, 이슈, 워크트리, worktree, 증거, evidence, PR, 풀리퀘스트, gh, 통합, merge, before after, webp, 캡처]
related_files:
  - skills/issue-create/SKILL.md
  - skills/issue-start/SKILL.md
  - skills/issue-end/SKILL.md
  - skills/issue-merge/SKILL.md
  - skills/gh-setup/SKILL.md
last_updated: 2026-11-12
---

# 이슈 → 워크트리 → 증거 → PR 워크플로우

스킬 4종이 한 줄로 이어지고, 각 단계는 다음 단계가 전제하는 산출물을 남긴다.
**이슈 하나 = 워크트리 하나 = PR 하나**가 전체 설계의 대전제다.

```text
/issue-create  →  /issue-start  →  /issue-end  →  /issue-merge
   이슈 등록        워크트리·구현·증거    코멘트·PR       통합·close
```

상태 파일 위치·라벨 체계·브랜치 규칙·트러블슈팅은
[reference/issue-workflow-internals.md](../reference/issue-workflow-internals.md) 에 따로 있다.

---

## 1. `/issue-create` — 코드를 건드리기 전에 이슈부터

```bash
/issue-create "탭 활성 상태가 새로고침하면 초기화됨"
```

- 변경 요청을 감지하면 **파일을 열기 전에** 먼저 발동한다. 사용자가 "이슈" 라는 말을 안 꺼내도 그렇다.
- 저장소 성숙도를 판정한다(`gate`). 방금 `git init` 한 빈 프로젝트에서는 조용히 빠진다.
- 요청 안에 독립 작업이 여러 개면 독립성 테스트로 쪼갠다 (최대 5개).
- 유사한 열린 이슈를 검색해 중복이면 새로 만들지 않고 기존 번호를 제시한다.
- **승인은 두 번** 받는다 — 분할안 한 번, 초안 한 번.
- 등록 시 `status:open` 라벨을 붙이고, `.gitignore` 에 `.issue` 블록을 자동으로 넣는다.

## 2. `/issue-start` — 착수부터 증거까지 (13단계)

```bash
/issue-start 12
```

```text
 1  인자 분기 및 전제 확인       8  작업 트리 커밋
 2  이슈 수집                   9  after 증거 캡처
 3  작업 성격 판정             10  증거 미러 커밋·푸시
 4  코드베이스 대조 분석        11  이슈 리포트 코멘트
 5  워크트리 생성              12  메인 체크아웃 최신화
 6  before 증거 캡처           13  다음 행동 선택
 7  구현
```

이슈 번호 대신 작업 설명을 주면 `/issue-create` 로 이슈부터 만든다.

### 깨지면 곤란한 순서 규칙 셋

| 규칙 | 이유 |
| --- | --- |
| before 캡처는 **워크트리 생성 직후, 파일을 하나도 고치기 전에** | 이 순간의 트리만이 정의상 "변경 전" 이다. 놓치면 `issue-end` 가 `pure-tree` 로 되돌려 다시 찍는다 |
| 증거는 **기본 브랜치에 먼저 커밋·푸시한 뒤** 이슈에 코멘트 | 순서를 뒤집으면 이슈에서 이미지가 렌더링되지 않는다 |
| 기본 브랜치에서는 **절대 구현하지 않는다** | 현재 워크트리에서 브랜치를 갈아타지도 않는다 |

증거 이미지는 webp 로만 만들고, after 에는 변경 구간을 가리키는 바운딩 박스를 넣는다.

## 3. `/issue-end` — 검증 가능한 상태로 만들기 (11단계)

```bash
/issue-end
```

- 증거 완결성을 재확인하고, 부족하면 변경 직전 상태(`pure-tree`)를 만들어 다시 캡처한다.
- **6단계(증거·리포트 기본 브랜치 커밋)와 8단계(이슈 코멘트)는 필수다.** 건너뛰지 않는다.
- 증거가 없으면 PR 을 만들지 않고, 왜 못 만드는지 보고하며 멈춘다.
- PR 생성 직후 `status:review` 로 상태 라벨을 옮긴다.
- **merge 는 하지 않는다.** 워크트리를 여러 개 동시에 굴리는 것이 이 스킬군의 전제이기 때문이다.

## 4. `/issue-merge` — 여러 워크트리를 한 번에 (9단계)

```bash
/issue-merge
```

개별 PR 을 하나씩 merge 하는 것과 다른 점은 **순서 때문에 깨지는 경우까지 잡는다**는 것이다.

- `.issue/merge/base/` 에 detached 워크트리를 만들어, 사용자의 작업 트리는 건드리지 않는다.
- 증거로 해결이 확인되지 않은 이슈는 후보에서 뺀다. **커밋 메시지는 근거가 아니다.**
- `preflight` 로 충돌을 **확정한 뒤에** merge 순서를 정한다. `--onto` 로 앞 회차 커밋을 이어 넘겨 누적 검증한다.
- 충돌은 작업 브랜치 쪽에서 양쪽 의도를 보존하도록 해소하고, diff 를 승인받은 뒤에만 push 한다.
- merge 전에 PR 본문의 `Closes/Fixes/Resolves #N` 을 제거한다.
  두면 merge 순간 자동 close 되어 "통합 테스트 → close" 순서가 깨진다.
- 이슈 close 는 통합 테스트 **뒤에** 한다.

---

## 곁다리 스킬 둘

| 스킬 | 언제 |
| --- | --- |
| `/gh-setup` | `gh` 가 없거나 로그인이 안 됐을 때. OS 를 판별해 설치 경로를 정하고 `gh auth login` 까지 끌고 간다 |
| `git-pr` | 이 파이프라인 밖에서 PR 을 만들 때. 파이프라인 안의 `/issue-end` 도 같은 형식을 쓴다 — [git-workflow.md](./git-workflow.md) |

## 서브에이전트 (선택)

판정성 작업을 값싼 모델에 맡기기 위한 정의 파일이다. **없어도 막히지 않는다** —
없으면 기본 서브에이전트로 진행하고 "모델 고정 실패 — 판정 비용이 높다" 를 한 줄 보고한다.

| 에이전트 | 쓰는 곳 | 모델 |
| --- | --- | --- |
| `issue-verifier` | create / start / end — 전제 확인·중복 검사·성격 판정·증거 점검 | haiku |
| `issue-merge-analyst` | merge — 워크트리 하나씩 분석 | haiku |
| `issue-merge-resolver` | merge — 충돌 헌크 해소 | sonnet |
| `issue-merge-critic` | merge — 계획의 모호성·되돌릴 수 없는 순서 지적 | haiku |

필요하면 `~/.claude/agents/issue-verifier.md` 를 직접 만들면 된다.

```markdown
---
name: issue-verifier
description: 전제 확인 · 중복 검사 · 작업 성격 판정 · 증거 완결성 점검
model: haiku
---
```
