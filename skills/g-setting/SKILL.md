---
name: g-setting
description: gyeolhwi의 Claude Code 커맨드/스킬 모음을 user-level (`~/.claude/`)에 글로벌 설치하거나 업데이트한다. 처음 실행 시 설치, 재실행 시 자동으로 업데이트 모드로 전환. 사용자가 'g-setting', '세팅해줘', '키트 설치', '키트 업데이트', '글로벌 설치', '업데이트해줘' 등을 요청할 때 사용한다. obsidian 사용자 커스텀은 항상 보존(검토 후 적용). Windows/Mac/Linux 동일 동작.
---

# /g-setting — 키트 설치 및 업데이트

`gyeolhwi/claude-setup` 의 커맨드와 스킬을 `~/.claude/` 에 설치한다. **모든 OS 동일 동작** (전부 복사 기반, link 없음).

## 핵심 원칙

1. **모든 항목 복사** — junction/symlink 안 씀. 원본 폴더 삭제 가능, OS 무관, 한글 경로 안전.
2. **단일 진실: `~/.claude/.gyeolhwi/version.txt`** — 설치 git rev 1줄. 모드 자동 감지에 사용.
3. **사용자 커스텀 영역은 보존** — Obsidian 커맨드/템플릿은 첫 설치만 시드, 업데이트 시 항상 파일별 diff + 사용자 검토.
4. **업데이트 = 임시 fresh clone 후 비교** — 영구 캐시 폴더 두지 않음. 작업 후 임시 폴더 정리.
5. **충돌 시 백업** — 덮어쓰기 전 `~/.claude/.gyeolhwi/backup-{timestamp}/` 로 이동.

## 모드 자동 감지

| 조건 | 모드 |
|------|------|
| `~/.claude/.gyeolhwi/version.txt` 없음 | **설치** |
| `~/.claude/.gyeolhwi/version.txt` 있음 | **업데이트** |

## 외부 git URL

- 본체: `https://github.com/gyeolhwi/claude-setup.git`

## 설치 인벤토리

### A. 일반 영역 (변경 시 일괄 동의)

| 원본 | 대상 |
|------|------|
| `commands/git/commit-auto.md` | `~/.claude/commands/commit-auto.md` |
| `commands/project/project-docs.md` | `~/.claude/commands/project-docs.md` |
| `commands/project/project-docs-gen.md` | `~/.claude/commands/project-docs-gen.md` |
| `commands/project/project-workflow.md` | `~/.claude/commands/project-workflow.md` |
| `skills/create-pr/` | `~/.claude/skills/create-pr/` |
| `skills/omc-learned/` | `~/.claude/skills/omc-learned/` |
| `skills/g-setting/` | `~/.claude/skills/g-setting/` (자기 자신) |

### B. Obsidian 영역 (사용자 커스텀 — 첫 설치만 시드, 업데이트 시 파일별 묻기)

| 원본 | 대상 |
|------|------|
| `commands/obsidian/*.md` | `~/.claude/commands/obsidian/*.md` |
| `commands/obsidian/templates/TPL_*.md` | `~/.claude/commands/templates/TPL_*.md` |

## 1. 설치 모드 (최초)

### 1-1. 진입점 감지
현재 디렉토리가 본체 프로젝트 루트인지 확인 (`commands/git/`, `commands/project/`, `commands/obsidian/`, `skills/`, `README.md` 모두 존재).

- **루트 감지됨** → 거기서 직접 복사
- **루트 아님** → 사용자에게 "본체를 임시 폴더에 클론할까요? [Y/n]" 묻고 동의 시 임시 클론 진행

### 1-2. 외부 fetch
본체가 루트가 아닌 경우에만 임시 폴더에 fresh clone (depth 1):
- 본체: `~/.claude/.gyeolhwi/.tmp-install/repo/`

### 1-3. 복사 실행
- **A 영역**: 인벤토리대로 모두 복사
- **B 영역**: 대상 폴더가 비어있거나 없으면 복사. 이미 파일 1개 이상 있으면 사용자에게 보고: "기존 obsidian 설정 발견 — 그대로 둘까요? [Y/n/검토]". 검토 선택 시 파일별 diff 후 개별 결정.

### 1-4. 메타데이터 기록
```
~/.claude/.gyeolhwi/
├── version.txt          ← 본체 git rev (예: "371efa0")
└── installed-at.txt     ← 설치 시각 (디버깅용)
```

### 1-5. 정리 + 보고
임시 폴더(`.tmp-install/`) 삭제. 보고:

```
✅ 설치 완료
- 일반: N개 (커맨드 4 + 스킬 3)
- Obsidian: [신규 시드 N개 | 보존됨]

📍 설치 위치: ~/.claude/
📌 메타: ~/.claude/.gyeolhwi/version.txt = <rev>

다음 세션부터 사용 가능:
- 커맨드: /commit-auto, /project-docs, /project-docs-gen, /project-workflow, /obsidian-*
- 스킬: create-pr, g-setting

원본 clone 폴더는 이제 삭제해도 됩니다.
```

## 2. 업데이트 모드 (재실행)

### 2-1. Fresh clone (임시)
```
~/.claude/.gyeolhwi/.tmp-update/
└── repo/        ← git clone --depth 1 본체
```

기존 `.tmp-update/` 가 있으면 (지난번 비정상 종료) 먼저 정리.

### 2-2. Diff 분석
파일 단위로 user-level vs 임시 클론 비교 후 카테고리별 분류:

- **일반 영역**: `[NEW]`, `[CHANGED]`, `[REMOVED]` 목록
  - `[REMOVED]` = upstream 에서 사라진 항목 (폴더 구조 변경 등). 사용자에게 "삭제할까요? [Y/n]" 별도 묻기
- **Obsidian 영역**: `[NEW]`, `[CHANGED]`, `[REMOVED]` 목록 (REMOVED 는 항상 묻기, 사용자 커스텀일 수 있음)

### 2-3. 사용자 동의 (그룹별)

```
📋 일반 영역 (커맨드/스킬)
변경 N개:
  [CHANGED] ~/.claude/commands/commit-auto.md
  [CHANGED] ~/.claude/skills/create-pr/SKILL.md
  [NEW]     ~/.claude/commands/some-new-cmd.md

→ [전체 업데이트 / 개별 선택 / skip]
```

```
📋 Obsidian 영역 (사용자 커스텀 가능)
변경 N개. 각 파일 diff 출력 후 개별 선택:
  ~/.claude/commands/obsidian/obsidian-init.md
  [diff 표시]
  → [덮어쓰기 / 유지 / 더보기]
```

### 2-4. 적용
1. 백업 폴더 생성: `~/.claude/.gyeolhwi/backup-{YYYYMMDD-HHmmss}/`
2. 동의 받은 항목만 처리:
   - 변경 대상 원본을 백업 폴더로 이동 (구조 유지)
   - 새 파일 복사
3. `version.txt` 갱신

### 2-5. 정리 + 보고
```
✅ 업데이트 완료
- 일반: N개 적용 / M개 skip
- Obsidian: N개 적용 / M개 유지 (사용자 선택)
- 백업: ~/.claude/.gyeolhwi/backup-{ts}/
```

임시 폴더 삭제.

## 3. 안전장치

- **네트워크 실패** → 임시 폴더 정리 후 명확히 보고. user-level 변경 없음.
- **부분 적용 실패** → 백업에서 수동 복구 안내
- **권한 문제** → 즉시 중단, 어느 경로에서 막혔는지 출력
- **비정상 종료 후 재실행** → `.tmp-install/`, `.tmp-update/` 자동 정리
- **본체 프로젝트 루트가 아닌데 git 미설치** → 사용자에게 git 설치 안내 후 중단

## 4. 운영 메모

- 모든 git 명령은 `--depth 1` 으로 빠르게.
- 한글 경로 안전: 모든 경로 따옴표 처리.
- Cross-platform 명령 매트릭스:

| 작업 | bash (Mac/Linux/Git Bash) | PowerShell (Windows) |
|------|---------------------------|---------------------|
| 폴더 복사 | `cp -R "<src>" "<dst>"` | `Copy-Item -Recurse -Force -LiteralPath "<src>" -Destination "<dst>"` |
| 파일 복사 | `cp "<src>" "<dst>"` | `Copy-Item -Force -LiteralPath "<src>" -Destination "<dst>"` |
| 폴더 삭제 | `rm -rf "<path>"` | `Remove-Item -Recurse -Force -LiteralPath "<path>"` |
| Clone | `git clone --depth 1 <url> "<dst>"` | 동일 |
| Diff | `diff -u "<a>" "<b>"` 또는 `git diff --no-index` | `git diff --no-index` 권장 |

스킬 실행 시 OS 감지 후 적절한 명령 사용. Git Bash 가 있으면 bash 우선.

## 5. 백업 정책

- 위치: `~/.claude/.gyeolhwi/backup-{YYYYMMDD-HHmmss}/` (구조 유지)
- 보관: 사용자가 수동 삭제할 때까지
- 7일 이상 누적된 백업이 있으면 보고 시 안내 ("backup-* 폴더 N개, 정리하시려면…")

## 6. 트러블슈팅

| 증상 | 원인 | 해결 |
|------|------|------|
| `~/.claude/` 없음 | Claude Code 한 번도 실행 안 됨 | Claude Code 한 번 실행 후 재시도 |
| version.txt 있는데 파일 누락 | 사용자가 user-level 파일 직접 삭제 | 업데이트 모드에서 `[NEW]` 로 잡혀 자동 복구 제안 |
| 임시 폴더 충돌 | 비정상 종료 | 다음 실행 첫 단계에서 자동 정리 |
| Obsidian 강제 재설치 원함 | — | `~/.claude/commands/obsidian/` 비우고 g-setting 재실행 |
| 전체 초기화 원함 | — | `~/.claude/.gyeolhwi/` 삭제 후 재실행 (백업 권장) |
