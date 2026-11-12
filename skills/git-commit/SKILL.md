---
name: git-commit
description: 커밋 규칙과 커밋 실행. 사용자가 "커밋해", "커밋하고 푸시", "변경사항 커밋", "/git-commit" 이라고 하거나, 다른 스킬·에이전트 흐름 안에서 git commit 을 만들어야 할 때 항상 이 형식을 따른다. 변경을 목적별로 묶어 여러 커밋으로 나누고, 제목은 PM 이 읽기 쉽게, 본문은 개발자·AI 가 추적할 수 있게 쓴다. 짝 스킬 git-pr(PR), git-release(릴리스 노트).
allowed-tools: Bash(git *), Bash(date *)
---

# git-commit — 커밋 규칙과 실행

짝 스킬: `git-pr`(PR 작성) · `git-release`(배포 릴리스 노트). 세 스킬은 같은 TYPE·scope 규칙을 쓴다.

## 실행 절차

### 1. 상태 파악 (병렬)

```bash
git config user.name
date +%Y-%m-%d
git branch --show-current
git status --short
git diff --staged --stat && git diff --stat
git log --oneline -15          # 이 저장소에서 쓰는 scope 단어 확인
```

### 2. 대상 결정

- staged 변경이 있으면 **staged 만** 대상으로 한다.
- staged 가 비어 있으면 작업 트리 변경 전체를 대상으로 한다. 단 `.env`, 키·인증서, 대용량 바이너리처럼 민감하거나 의도치 않아 보이는 파일은 빼고 사용자에게 알린다.
- 대상이 아무것도 없으면 "커밋할 변경사항이 없습니다" 를 알리고 멈춘다.

### 3. 목적별 그룹 나누기

diff 를 읽고 **변경 목적이 같은 파일끼리** 묶는다. 경로나 확장자가 아니라 의도로 판단한다. 하나의 그룹 = 하나의 커밋 = 하나의 TYPE.

### 4. 메시지 작성 후 커밋

- 메시지는 여러 줄이므로 UTF-8 임시 파일에 쓰고 `git commit -F <파일>` 로 커밋한다.
- 그룹이 2개 이상이면 `git reset -q` → 그룹 단위 `git add <파일>` → `git commit` 을 순서대로 반복한다.
- **단, 일부만 staged 된 파일**(`git diff --cached --name-only` 와 `git diff --name-only` 양쪽에 나오는 파일)이 있으면 `git reset` 을 쓰지 않는다. reset 후 `git add <파일>` 하면 사용자가 일부러 빼 둔 변경까지 커밋되기 때문이다. 이때는 staged 내용 전체를 한 커밋으로 만들거나, 그룹을 어떻게 나눌지 사용자에게 묻는다.
- 끝나면 `git log --oneline -N` 으로 결과를 보여준다.

### 5. push

- 사용자가 push 까지 요청했을 때만 `git push` 한다. 업스트림이 없으면 `git push -u origin <브랜치>`.
- `--force` 는 쓰지 않는다.

## 메시지 형식

**제목은 PM 이 읽고, 본문은 개발자와 AI 가 이력을 추적할 때 읽는다.** 제목은 쉬운 말로, 본문은 나중에 검색해서 찾을 수 있게 구체적으로 쓴다.

```
<TYPE>(<scope>): <subject> - YYYY-MM-DD

- <동작 변화>
- <동작 변화>

Why: <바꾼 이유 또는 원인 1문장>
How:
- <파일·모듈>: <바뀐 함수·설정 이름> <무엇을>

Refs: #<이슈·PR 번호>
Related: <연관 커밋 해시>
Author: <git user.name>
```

AI 생성 표시(`Co-Authored-By: Claude`, `🤖 Generated with ...`)는 어디에도 넣지 않는다.

### TYPE

| TYPE | 사용 기준 | 예시 subject |
|------|----------|------|
| FEAT | 전에 없던 것을 할 수 있게 됨 | 팀짜기 결과를 이미지로 공유할 수 있음 |
| UX | 기존 기능의 보이는 모습·쓰는 방식이 바뀜 (화면, 문구, 글꼴, 배치, 흐름) | 티어와 등급을 한 화면에서 고르도록 변경 |
| FIX | 의도대로 동작하지 않던 것을 고침 | 팀 채널에서 팀짜기가 막히던 문제 해결 |
| PERF | 같은 기능이 더 빠르거나 가벼워짐 | 서버를 서울로 옮겨 응답 속도 개선 |
| CONTENT | 서비스에 보이는 콘텐츠(텍스트, 이미지, 데이터) 추가·수정 | 신규 맵 4종 이미지 추가 |
| DOCS | 개발·운영 문서 (README, docs/, 가이드) | 배포 절차 문서 추가 |
| REFACTOR | 동작은 그대로, 내부 코드 구조·포맷 정리 | 편성 옵션 처리 구조 정리 (사용 변화 없음) |
| TEST | 테스트 추가·수정 | 팀 분배 규칙 테스트 추가 (사용 변화 없음) |
| CHORE | 설정·빌드·의존성·CI/CD·배포 환경·파일 정리·삭제 | 사용하지 않는 옛 코드 삭제 (사용 변화 없음) |
| REVERT | 이전 커밋 되돌리기 | "팀짜기 결과 이미지 공유" 되돌림 |

헷갈릴 때 판단 순서: 동작이 틀렸었나 → FIX / 새로 생겼나 → FEAT / 보이는 것·쓰는 방식이 바뀌었나 → UX / 사용자에게 변화가 없나 → REFACTOR·CHORE·DOCS·TEST.

### scope

- 영문 소문자 한 단어(필요하면 `-` 로 연결). 내부 모듈명·약어가 아니라 **무엇에 대한 변경인지 바로 알 수 있는 일반 단어** (예: `team`, `signup`, `login`, `payment`, `profile`)
- 서비스 전체면 `app`, 서버·배포 환경이면 `infra`, 개발 설정이면 `config`, 문서면 `docs`
- 한 저장소 안에서는 같은 대상을 늘 같은 단어로 부른다 (최근 커밋의 scope 를 먼저 확인)

### subject

- 한국어, 40자 안팎, 마침표 없음
- **어떻게 했는지가 아니라 무엇이 달라졌는지**를 쓴다
- 기술 용어(API, 리전, 병렬화, 컴포넌트, 모달, 리팩토링 등)를 쓰지 않는다. 필요하면 본문 `How:` 에 쓴다
- FIX 는 `~하던 문제 해결`, `~되지 않던 문제 해결` 형태로 증상을 드러낸다
- 사용자에게 변화가 없는 커밋(REFACTOR, CHORE, TEST)은 끝에 `(사용 변화 없음)` 을 붙인다
- 끝에 ` - YYYY-MM-DD` (커밋하는 날)

| ❌ | ✅ |
|---|---|
| `PERF(infra): 함수 리전 서울(icn1)로 변경` | `PERF(infra): 서버를 서울로 옮겨 응답 속도 개선` |
| `PERF(discord): 채널·멤버 조회 병렬화 - 모달 타임아웃 완화` | `PERF(signup): /등록 입력창이 시간 초과로 닫히던 현상 감소` |
| `STYLE(html): Pretendard 글꼴 적용` | `UX(docs): 문서 글꼴을 읽기 쉬운 서체로 변경` |
| `REFACTOR(generate): 편성 옵션 입력을 서버 전용 명령으로 분리` | `REFACTOR(team): 편성 옵션 처리 구조 정리 (사용 변화 없음)` |

### 본문

네 덩어리를 빈 줄로 나눈다. 순서와 키 이름(`Why:`, `How:`, `Refs:`, `Related:`, `Author:`)은 바꾸지 않는다. AI 가 `git log --grep` 으로 찾을 수 있도록 키 이름은 항상 같은 영문으로 쓴다.

1. **동작 변화 (필수, `- ` 1~3줄)**: 이 커밋 전후로 무엇이 다르게 동작하는지. 사용자 관점 동작을 우선 쓰고, 기술 용어는 필요하면 써도 된다. 사용자가 보는 변화가 없으면 `- 사용 변화 없음`.
2. **`Why:` (필수, 1문장)**: 바꾼 이유. FIX 면 원인. 다른 사람이 같은 버그·결정을 다시 마주쳤을 때 이 줄로 찾을 수 있어야 한다.
3. **`How:` (필수, `- ` 1~5줄)**: 형식은 `<파일 또는 모듈>: <실제 함수·변수·설정·명령 이름> <무엇을 했나>`.
   - 이름은 코드에 있는 그대로 쓴다 (예: `ALLOWED_CHANNELS`, `endActiveSession()`, `vercel.json regions`). 나중에 `git log --grep=endActiveSession` 으로 이 커밋을 찾을 수 있게 하기 위해서다.
   - 파일 전체 목록은 diff 에 있으므로 나열하지 않는다. 핵심 지점만 쓴다.
4. **trailer (마지막 문단, 빈 줄 없이 붙여 씀)**:
   - `Refs: #<번호>`: 관련 이슈·PR. 브랜치명·대화·최근 커밋에서 확인될 때만 쓰고 추측하지 않는다
   - `Related: <짧은 해시>`: 이어지는 작업, 이 버그를 만든 커밋, 되돌린 대상 등 연관 커밋이 확인될 때만. **REVERT 는 필수**
   - `Author: <git user.name>`: 항상

아주 작은 변경(오타, 한 줄 설정)은 동작 변화와 `Why:` 만 쓰고 `How:` 를 생략해도 된다.

### 예시

```
FIX(team): 팀 채널에서 팀짜기가 막히던 문제 해결 - 2026-10-13

- 이제 팀 채널에서도 바로 팀을 짤 수 있음
- 같은 채널에서 다시 짜면 이전 판은 자동 종료

Why: 팀 채널 타입이 허용 채널 목록에 없어 권한 검사에서 막힘
How:
- team/channels.ts: ALLOWED_CHANNELS에 TEAM 채널 타입 추가
- team/session.ts: 재분배 시 endActiveSession()으로 같은 채널의 진행 중 세션 종료

Refs: #32
Author: 김결휘
```

```
REFACTOR(team): 편성 옵션 처리 구조 정리 (사용 변화 없음) - 2026-11-10

- 사용 변화 없음

Why: 다음 기능 추가 전에 여러 곳에 흩어진 편성 옵션 처리를 한곳으로 모으기 위함
How:
- commands/generate.ts: 옵션 입력·검증을 handleTeamCommand() 경로로 통합
- utils/options.ts: 중복된 parseOptions() 제거

Refs: #31
Related: 4f2a9c1
Author: 김결휘
```

```
REVERT(team): "팀짜기 결과 이미지 공유" 되돌림 - 2026-11-12

- 팀짜기 결과 이미지 공유 버튼이 다시 사라짐

Why: 이미지 생성이 느려 팀짜기 응답이 시간 초과됨
How:
- 9e1d0b7 커밋 전체 되돌림

Related: 9e1d0b7
Author: 김결휘
```

## 자동 점검 훅

`~/.claude/hooks/git-convention.py` 가 Claude 가 실행한 `git commit` 직후 마지막 커밋을 검사한다. 형식이 어긋나면 알림이 오므로, **아직 push 전이면** `git commit --amend -F <파일>` 로 고치고, 이미 push 됐으면 그대로 두고 사용자에게 알린다.

이 저장소에서 검사를 끄려면: `git config convention.check false`

## PowerShell 한글 인코딩

PowerShell 에서 한글이 깨지면 메시지를 UTF-8 파일로 저장한 뒤 `git commit -F msg.txt` 를 사용한다.
