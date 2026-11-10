---
id: work-workspace-workflow
title: Work 작업공간 세팅과 실시간 뷰어
category: workflows
summary: 컴퓨터·서버의 작업 폴더를 Projects 중심 + README·INDEX·AGENTS·docs 구조로 세팅하는 work-setup 스킬 사용 순서와, 폴더·문서·바뀐 파일·herdr 에이전트 상태를 아이패드에서 실시간으로 보는 Work 뷰어의 설치·원격 접속(Tailscale·SSH 터널)·운영 명령.
keywords: [work-setup, Work, 작업공간, workspace, 뷰어, viewer, 실시간, 모니터링, 아이패드, 프로젝트별, 에이전트 요약, Projects, README, INDEX, AGENTS, herdr, ovis, tailscale, bun, systemd, launchd, 새컴퓨터, 서버]
related_files:
  - skills/work-setup/SKILL.md
  - skills/work-setup/references/format.md
  - skills/work-setup/viewer/server.ts
  - skills/work-setup/viewer/agent-summary.ts
  - skills/work-setup/viewer/install.sh
last_updated: 2026-11-10
---

# Work 작업공간 세팅과 실시간 뷰어

한 컴퓨터의 일을 작업 폴더 하나(기본 `~/Work`)로 모으고, 그 구조를 사람은 README와 뷰어로, AI는 INDEX로 한 번에 파악하게 만든다.

## 결과 모습

```text
~/Work/
├── Projects/<이름>/   모든 일. 보통 git 저장소 하나
├── docs/guide/ · docs/ops/
├── _archive/
├── README.md · INDEX.md · AGENTS.md · CLAUDE.md
```

분류용 최상위 폴더(Intake·References·Sites 등)는 만들지 않는다. 일은 전부 프로젝트 하나다.

## 쓰는 순서

```text
./install.sh                         claude-setup 설치 (work-setup 스킬 포함)
"Work 세팅해줘" 또는 /work-setup       조사 → 계획 승인 → 구조·문서 생성 → 뷰어 설치 → 확인
```

1. 대상 컴퓨터에서 Claude Code를 열고 "Work 세팅해줘"라고 한다.
2. 스킬이 작업 폴더를 조사하고 **완성될 트리 / 옮길 것 / 새로 쓸 파일 / 그대로 둘 것**을 보여 준다. 승인 전에는 아무것도 바꾸지 않는다.
3. 승인하면 `Projects/`, `docs/`, README·INDEX·AGENTS·CLAUDE를 만들고 INDEX를 검사한다.
4. 뷰어를 서비스로 등록한다 (bun 필요).
5. 원하면 Tailscale로 다른 기기에서 열 수 있게 한다.

## 뷰어

```sh
"$(readlink -f ~/.claude/skills/work-setup)/viewer/install.sh" --root ~/Work --port 7320
```

- Linux: systemd 사용자 서비스 `work-viewer`, macOS: launchd `local.work-viewer`.
- 항상 `127.0.0.1:7320`에만 연다. 다른 기기에서는:

```sh
tailscale serve --bg --https=8443 http://127.0.0.1:7320     # → https://<기기>.<tailnet>.ts.net:8443
ssh -L 7320:127.0.0.1:7320 <서버>                           # Tailscale이 없을 때
```

| 화면 | 보여 주는 것 |
| --- | --- |
| 홈 | 프로젝트별 묶음: 에이전트(상태·지금 하는 일·결과·기다리는 질문)와 오늘 바뀐 파일. 파일만 바뀐 프로젝트는 한 줄씩, 어제 이전은 "지난 기록" |
| 파일 | 작업 폴더 최상위부터 직접 열어 가는 탐색. Markdown·코드·이미지·PDF 미리보기, 바뀌면 자동 새로고침 |
| 바뀐 파일 | 추가·수정·삭제 실시간 목록 (30일치 `~/.local/state/work-viewer/activity.jsonl`) |
| 문서 | 루트·프로젝트 `INDEX.md`의 문서를 제목·요약·검색어로 찾기. INDEX.md는 문서 목록 화면으로 보인다 |

운영:

```sh
systemctl --user status|restart work-viewer
journalctl --user -u work-viewer -f
viewer/install.sh --uninstall
```

`./install.sh --copy`로 복사 설치했다면 스킬을 갱신한 뒤 뷰어 `install.sh`를 다시 실행해야 화면도 바뀐다. 링크 설치(기본)는 저장소를 `git pull`하고 `systemctl --user restart work-viewer`만 하면 된다.
