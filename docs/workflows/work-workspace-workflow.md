---
id: workflows-work-workspace-workflow
title: Work 작업공간 세팅과 실시간 뷰어 (work-viewer 저장소 안내)
category: workflows
summary: 작업 폴더를 Projects 중심 + README·INDEX·AGENTS·docs 구조로 세팅하는 work-setup 스킬과 Work 뷰어는 이 저장소가 아니라 gyeolhwi/work-viewer 에서 관리한다. clone·설치 명령, 스킬 갱신 방법, 상세 문서 위치를 안내한다.
keywords: [work-setup, Work, 작업공간, workspace, 뷰어, viewer, work-viewer, 실시간, 아이패드, Projects, docs-tidy, 설치, install.sh --skills, bun, 새컴퓨터, 서버]
related_files: []
last_updated: "2026-11-12"
---

# Work 작업공간 세팅과 실시간 뷰어 (work-viewer 저장소 안내)

한 컴퓨터의 일을 작업 폴더 하나(기본 `~/Work`)로 모으는 `work-setup` 스킬과, 폴더·문서·바뀐 파일·에이전트 상태를 아이패드에서 실시간으로 보는 Work 뷰어는 **[gyeolhwi/work-viewer](https://github.com/gyeolhwi/work-viewer)** 저장소가 정본이다. claude-setup 의 `install.sh` 는 이 스킬을 설치하지도, 덮어쓰지도 않는다.

## 설치

[Bun](https://bun.sh)이 필요하다.

```sh
mkdir -p ~/Work/Projects && cd ~/Work/Projects
git clone https://github.com/gyeolhwi/work-viewer.git
work-viewer/scripts/install.sh --root ~/Work --port 7320 --skills
```

`--skills` 는 `work-setup`·`docs-tidy` 스킬을 `~/.claude/skills` 에 링크한다. 설치한 뒤 Claude Code 에서 "Work 세팅해줘" 라고 하면 된다.

## 갱신

스킬과 뷰어는 work-viewer 저장소에서 고치고, 각 기계에서는 그 clone 을 `git pull` 해서 받는다. claude-setup 을 pull·install 하는 것과는 따로 한다.

## 상세 문서

- [설치·실행과 다른 기기에서 보기](https://github.com/gyeolhwi/work-viewer/blob/main/docs/guide/install.md)
- [화면 구성과 용어](https://github.com/gyeolhwi/work-viewer/blob/main/docs/guide/screens.md)
- [서버 구조·API·파일 감시와 에이전트 요약](https://github.com/gyeolhwi/work-viewer/blob/main/docs/spec/server.md)
