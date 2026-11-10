---
name: work-setup
description: "컴퓨터나 서버의 작업 폴더(기본 ~/Work)를 'Projects 중심 + README·INDEX·AGENTS·docs' 구조로 세팅하고, 폴더·문서·바뀐 파일·에이전트 상태를 브라우저에서 실시간으로 보는 Work 뷰어를 설치한다. \"Work 세팅\", \"작업공간 세팅\", \"work-setup\", \"이 컴퓨터에도 Work 구조 적용\", \"뷰어 설치\" 요청에 사용."
---

# Work 작업공간 세팅

한 컴퓨터의 일을 작업 폴더 하나(기본 `~/Work`)로 모은다. 사람은 README와 뷰어로, AI는 INDEX로 구조를 한 번에 파악한다.

결과물은 두 가지다.

1. **작업공간 구조**: `Projects/` 중심의 단순한 폴더와 README·INDEX·AGENTS·docs.
2. **Work 뷰어** (`viewer/`): 폴더·문서·바뀐 파일·에이전트 상태를 아이패드·폰 브라우저에서 실시간으로 보는 읽기 전용 화면.

## 정해 둔 구조

```text
~/Work/
├── Projects/<이름>/   모든 일. 보통 git 저장소 하나
├── docs/guide/        이 작업공간 사용법 (폴더 구조)
├── docs/ops/          이 컴퓨터 운영 (에이전트 실행·원격 접속·뷰어)
├── _archive/          끝난 것 (읽기 전용)
├── README.md          사람용 소개
├── INDEX.md           AI용 문서 목록
├── AGENTS.md          에이전트 규칙
└── CLAUDE.md          한 줄: @AGENTS.md
```

- 최상위에 분류용 폴더(Intake·References·Resources·Sites 같은 것)를 미리 만들지 않는다. **모든 일은 프로젝트 하나**이고, 받은 자료·참고 문서는 그 프로젝트 폴더 안에 둔다.
- 이미 있는 지식 볼트·백업처럼 옮기면 안 되는 폴더는 그대로 두고 README·AGENTS에 읽기 전용으로 적는다.
- 문서·INDEX 형식은 [references/format.md](references/format.md)를 따른다.

## 절차

### 1. 대상과 범위 확인

- 대상 컴퓨터(로컬 PC / 원격 서버), 작업 폴더 경로(기본 `~/Work`), 뷰어를 다른 기기에서 볼 방법(Tailscale / SSH 터널 / 이 컴퓨터에서만)을 확인한다. 모르면 AskUserQuestion으로 한 번에 묻는다.
- 원격 서버라면 그 서버의 셸에서 실행하고 있는지 확인한다. 다른 컴퓨터의 파일을 이 세션에서 직접 바꾸지 않는다.

### 2. 조사하고 계획 승인받기

- 대상 폴더의 최상위 목록, 이미 있는 README·INDEX·AGENTS·CLAUDE, `Projects/` 아래 저장소(`git status`, 원격)를 본다. 본문 전체를 무차별로 읽지 않는다.
- 다음을 보여 주고 승인받는다: **완성될 최상위 트리 / 옮길 것(기존→새 경로) / 새로 쓸 파일 / 그대로 둘 것과 이유**. 삭제는 따로 묻는다.
- 승인 전에는 파일을 바꾸지 않는다.

완료 기준: 이동·신규·유지·삭제를 구분한 계획에 사용자 승인이 있다.

### 3. 구조와 문서 만들기

- 폴더: `Projects/`, `docs/guide/`, `docs/ops/`. 필요한 것만 만들고 빈 폴더용 더미 파일은 두지 않는다.
- 문서는 실제로 확인한 내용으로 2~3개만 쓴다. 플레이스홀더·예시 문구를 남기지 않는다.
  - `docs/guide/workspace-layout.md`: 이 컴퓨터의 실제 최상위 폴더 표(폴더 · 무엇 · 다루는 법)와 "일은 `Projects/<이름>`에서 한다" 규칙.
  - `docs/ops/<주제>.md`: 이 컴퓨터에서 에이전트를 띄우는 법, 원격 접속 주소, 뷰어 주소·재시작 명령 등 확인된 것만.
- `README.md`는 짧게, 이 순서로 쓴다:
  1. 제목과 목적 1~2문장
  2. `## 현재 상태`: 진행 중인 프로젝트를 한 줄 설명과 함께 링크, "일은 전부 `Projects/<이름>/` 안에서 한다"
  3. `## 시작하기`: 실제로 쓰는 주소(뷰어·원격 제어). 확인 못 한 주소는 쓰지 않는다
  4. `## 문서`: 카테고리별 핵심 문서 링크, 마지막 줄에 `INDEX.md`·`AGENTS.md` 링크

  폴더 설명 표는 README에 복제하지 않고 workspace-layout 문서에만 둔다.
- `AGENTS.md`에는 최소한 다음을 넣는다 (기존 지침은 덮어쓰지 않고 보완):
  - 질문을 받으면 `INDEX.md`부터 읽고 맞는 문서만 연다.
  - 일은 `Projects/<이름>/` 안에서 하고 그 저장소의 지침을 따른다.
  - 읽기 전용 폴더 목록.
  - 되돌리기 어려운 작업(서버 업로드·삭제, 외부 발송)은 실행 전에 승인을 받는다.
  - `docs/**/*.md`를 바꾸면 같은 작업 안에서 INDEX도 갱신한다. 프로젝트를 추가·삭제하면 README의 "현재 상태"도 맞춘다.
- `CLAUDE.md`가 없으면 `@AGENTS.md` 한 줄로 만든다.
- INDEX: [references/format.md](references/format.md)의 형식으로 `docs/**/*.md` 전부를 경로 오름차순으로 넣는다. 머리말 값과 같게 쓴다. 같은 형식을 만드는 색인 도구(`docs_index.py` 등)가 이 컴퓨터에 있으면 그것으로 만들고 검사한다.

완료 기준: docs 문서 수 = INDEX 항목 수이고, 경로·제목·요약이 머리말과 일치한다.

### 4. 뷰어 설치

- 뷰어 코드는 이 스킬의 `viewer/` 폴더다. 스킬 경로: `readlink -f ~/.claude/skills/work-setup`.
- bun이 필요하다. 없으면 사용자에게 설치 명령(`curl -fsSL https://bun.sh/install | bash`)을 보여 주고 승인 후 실행한다.
- 설치:

```sh
"$(readlink -f ~/.claude/skills/work-setup)/viewer/install.sh" --root ~/Work --port 7320
```

  Linux는 systemd 사용자 서비스, macOS는 launchd로 등록하고 `http://127.0.0.1:7320`에 응답하는지 스스로 확인한다.
- 뷰어는 항상 `127.0.0.1`에만 연다. `HOST=0.0.0.0`으로 바꿔 공개하지 않는다 (인증이 없는 읽기 전용 파일 뷰어다).
- 스킬을 링크(기본)가 아니라 복사로 설치했다면, 스킬을 갱신한 뒤 `install.sh`를 다시 실행해야 뷰어도 바뀐다.

완료 기준: `curl -fsS http://127.0.0.1:7320/api/projects`가 프로젝트 목록 JSON을 돌려준다.

### 5. 다른 기기에서 보기 (선택, 승인 후)

- **Tailscale (권장)**: 대상 컴퓨터에서 `tailscale serve --bg --https=8443 http://127.0.0.1:7320` → `https://<기기이름>.<tailnet>.ts.net:8443`. tailnet 안의 기기에서만 열린다.
  - WSL이면 WSL 안이 아니라 Windows의 `tailscale.exe`로 실행한다 (`"/mnt/c/Program Files/Tailscale/tailscale.exe" serve ...`). WSL은 localhost 포워딩으로 연결된다.
  - 같은 포트를 다른 서비스가 쓰고 있으면 `tailscale serve status`로 확인하고 다른 포트를 쓴다.
- **SSH 터널**: 보는 쪽에서 `ssh -L 7320:127.0.0.1:7320 <서버>` 후 `http://127.0.0.1:7320`.
- 끄기: `tailscale serve --https=8443 off`.

### 6. 확인과 보고

- 헤드리스 브라우저가 있으면 홈·파일 탭·README·INDEX 화면을 열어 오류가 없는지 본다.
- 보고: 만든 트리, 새로 쓴/옮긴/그대로 둔 파일, INDEX 검사 결과, 뷰어 주소(로컬·원격), 서비스 관리 명령, 남은 일.

## 뷰어가 보여 주는 것

- **홈**: 에이전트 상태(herdr가 있으면 작업 중·대기·확인 필요)와 최근 7일 변경을 날짜별·프로젝트별로 묶은 기록.
- **파일**: 작업 폴더 최상위부터 폴더를 직접 열어 가며 탐색. Markdown·코드·이미지·PDF 미리보기. 보고 있는 파일이 바뀌면 자동으로 다시 불러온다.
- `INDEX.md`는 YAML 대신 문서 목록 화면으로 보여 준다.
- 바뀐 파일 기록은 `~/.local/state/work-viewer/activity.jsonl`에 30일치 남는다.
- 서비스 관리: `systemctl --user status|restart work-viewer`, `journalctl --user -u work-viewer -f`, 제거는 `viewer/install.sh --uninstall`.

## 주의

- 다른 사람의 컴퓨터·서버에 서비스를 등록하거나 포트를 여는 일은 그 사람의 승인을 받고 한다.
- 뷰어는 작업 폴더 밖 경로를 열지 않고, `.env`·키 파일은 이름만 보여 준다. 그래도 회사 자료가 있는 폴더라면 Tailscale처럼 접근이 제한된 경로로만 연다.
