---
id: setup-prerequisites
title: 전제 조건
category: setup
summary: claude-setup 설치 전에 시스템에 있어야 하는 것(git·rsync·Node 18+·gh·python3)과 작업할 프로젝트 쪽에 있어야 하는 것(Playwright·webp 변환기)을 구분해 정리한다. 무엇이 없으면 무엇이 막히는지까지 명시한다.
keywords: [전제조건, prerequisites, git, node, python3, gh, github cli, playwright, webp, cwebp, ffmpeg, sharp, 설치확인]
related_files:
  - install.sh
  - skills/gh-setup/SKILL.md
last_updated: 2026-11-12
---

# 전제 조건

가장 헷갈리는 지점부터 짚는다. **증거 캡처 도구는 이 저장소가 아니라 "작업할 프로젝트" 에 있어야 한다.**

## 시스템에 있어야 하는 것

| 항목 | 필수 | 없으면 |
| --- | --- | --- |
| git | ✓ | 설치 중단 |
| rsync | ✓ | 설치 중단 (`--copy` 및 템플릿 배치에 쓴다) |
| Node 18+ | ✓ | issue-* 스킬 스크립트가 안 돈다. 설치 중단 |
| python3 | git-convention 훅에 필요 | 커밋·PR 형식 점검 훅만 건너뛴다. 스킬은 그대로 동작 |
| `gh` (로그인) | 이슈·PR·릴리스·보드에 필요 | 이슈 등록·PR 생성이 막힌다. `/gh-setup` 이 설치·로그인을 안내한다 |
| cwebp 또는 ffmpeg | 증거 캡처에 권장 | 프로젝트에 sharp 도 없으면 증거가 png 로 남는다 |

issue-* 스킬 스크립트는 **Node 표준 모듈만** 쓴다. npm 의존성이 없다.

Jira 를 provider 로 쓰더라도 **`gh` 로그인은 여전히 필요하다.** Jira 에는 PR 개념이 없어서
PR 을 만들고 merge 하는 것은 언제나 `gh` 다.

## 작업할 프로젝트에 있어야 하는 것

```bash
# 증거 캡처를 쓸 거라면 — 작업할 프로젝트 루트에서
npm i -D playwright && npx playwright install chromium

# webp 변환 도구가 하나도 없다면 — 시스템에
brew install webp
```

`playwright 를 찾지 못했습니다` 가 뜨면 스킬이 아니라 프로젝트 쪽 설치를 확인한다.

## 점검

```bash
./install.sh --check     # 설치하지 않고 위 항목만 점검
```

설치 후 검증은 [install.md](./install.md#설치-확인) 를 본다.
