---
name: gyeol-init
description: gyeolhwi의 Claude Code 커맨드/스킬 모음을 user-level (`~/.claude/`)에 글로벌 설치한다. 프로젝트의 commands/, skills/ 를 user-level 로 연결하여 모든 프로젝트에서 사용 가능하게 한다. 사용자가 'gyeol-init', '내 스킬 글로벌 설치', '커맨드 전역 설치', '키트 설치해줘', 'kit 설치' 등을 요청할 때 사용한다. 기존 obsidian 세팅은 무조건 보존한다. supanova 는 별도 외부 패키지로 이 스킬의 책임 범위 밖.
---

# /gyeol-init — gyeolhwi 키트 글로벌 설치

`gyeolhwi_claude_setup` 프로젝트의 커맨드/스킬을 `~/.claude/` 에 설치하여 모든 프로젝트에서 사용 가능하게 만든다.

## 핵심 원칙

1. **Junction 우선** — 폴더는 디렉토리 junction 으로 연결 (프로젝트 수정 즉시 반영)
2. **단일 .md 파일은 복사** — junction 불가 항목은 파일 복사
3. **충돌 시 백업** — 기존 user-level 파일을 `~/.claude/.backup-gyeol-init-{timestamp}/` 로 이동 후 설치
4. **Obsidian 은 절대 안 건드림** — user-level 에 obsidian 세팅이 있으면 전체 스킵
5. **Idempotent** — 재실행 시 이미 올바르게 연결된 항목은 skip

## 1. 사전 점검

다음 조건을 확인하고 모두 만족할 때만 진행한다:

- 현재 작업 디렉토리가 `gyeolhwi_claude_setup` **프로젝트 루트** (감지 기준: `commands/git/`, `commands/project/`, `skills/`, `README.md` 모두 존재)
- `~/.claude/` 가 존재 (Claude Code 가 이전에 한 번이라도 실행됨)

조건 미충족 시 사용자에게 명확히 알리고 중단한다.

## 2. 설치 인벤토리

### A. 단일 파일 (복사 방식)

| 원본 | 대상 |
|------|------|
| `commands/git/commit-auto.md` | `~/.claude/commands/commit-auto.md` |
| `commands/project/project-docs.md` | `~/.claude/commands/project-docs.md` |
| `commands/project/project-docs-gen.md` | `~/.claude/commands/project-docs-gen.md` |
| `commands/project/project-workflow.md` | `~/.claude/commands/project-workflow.md` |

### B. 폴더 (Junction 방식)

| 원본 | 대상 |
|------|------|
| `skills/create-pr/` | `~/.claude/skills/create-pr/` |
| `skills/omc-learned/` | `~/.claude/skills/omc-learned/` |
| `skills/gyeol-init/` | `~/.claude/skills/gyeol-init/` (자기 자신 — 다음부터 모든 프로젝트에서 호출 가능) |

### C. Obsidian — 별도 정책 (아래 4번 참조)

> **Supanova 는 이 스킬의 책임 범위 밖**. 외부 패키지로 분리되어 별도 관리 (`update-supanova.cmd` + `external/supanova-design-skill/`). gyeol-init 은 내 키트만 다룬다.

## 3. 충돌 처리 (A·B 카테고리)

각 대상에 대해:

1. **존재하지 않음** → 그대로 설치 (복사 또는 junction 생성)
2. **이미 junction 이고 같은 source 를 가리킴** → skip (idempotent)
3. **이미 junction 인데 다른 source** → 백업 후 재생성
4. **일반 파일/폴더로 존재** → 백업 폴더로 이동 후 설치

**Junction 검사 방법** (PowerShell):
```powershell
$item = Get-Item -LiteralPath <대상> -Force -ErrorAction SilentlyContinue
$isJunction = $item.LinkType -eq "Junction"
$currentTarget = $item.Target  # junction 인 경우 source 경로
```

백업 위치: `~/.claude/.backup-gyeol-init-{YYYYMMDD-HHmmss}/` (원본 상대경로 유지)

## 4. Obsidian 특별 정책

`~/.claude/commands/obsidian/` 폴더 검사:

- **존재하지 않음** → 프로젝트의 `commands/obsidian/` 를 junction 으로 연결
- **존재하지만 비어있음** → 프로젝트의 `commands/obsidian/` 를 junction 으로 연결
- **존재하고 파일이 1개 이상 있음** → **전체 스킵**. 사용자에게 다음과 같이 보고:
  ```
  ⏭ Obsidian 보존: 기존 user-level 설정이 감지되어 건드리지 않음.
     (강제 재설치하려면 ~/.claude/commands/obsidian/ 를 비운 후 재실행)
  ```

이유: user-level obsidian 은 이미 사용자별 카테고리, 볼트 프로파일 등으로 커스터마이즈되었을 가능성이 높음. 덮어쓰면 사용자 세팅 손실.

## 5. 실행 절차

1. **드라이런 먼저 보고**: 실제 동작 전에 다음을 사용자에게 표 형태로 출력
   - 설치할 항목 (NEW)
   - 백업 후 교체할 항목 (REPLACE)
   - 스킵할 항목 (SKIP — 이미 올바르게 연결되어 있거나 obsidian 보존)

2. **사용자 확인** ("진행할까요?" — 명시적 동의 필요)

3. **실행**:
   - 백업 폴더 생성 (필요한 경우만)
   - 충돌 항목 백업 이동
   - 단일 파일은 복사 (`Copy-Item` 또는 `cp`)
   - 폴더는 junction 생성: PowerShell `New-Item -ItemType Junction -Path <대상> -Target <원본>`
     - 한글 경로 안전성 위해 `-LiteralPath` 사용 권장
     - cmd 의 mklink 는 한글 경로 인코딩 이슈 있을 수 있으므로 PowerShell 우선

4. **완료 보고**: 다음 형태로 정리

   ```
   ✅ 설치 완료
   - 신규 설치: N개
   - 교체 (백업): N개  → ~/.claude/.backup-gyeol-init-{ts}/
   - 스킵: N개

   ⏭ Obsidian: [보존됨 | 신규 설치됨]

   다음 세션부터 모든 프로젝트에서 다음 사용 가능:
   - 커맨드: /commit-auto, /project-docs, /project-docs-gen, /project-workflow
   - 스킬: create-pr, omc-learned, gyeol-init
   ```

## 6. 재실행 (업데이트)

이미 설치된 후 재실행하면:
- Junction: source 동일 시 자동 skip, source 다르면 3번 충돌 처리 흐름
- 단일 파일: 내용 동일 시 skip, 다르면 드라이런에 표시 → 사용자 동의 후 백업+덮어쓰기
- Obsidian: 항상 보존

## 7. 안전장치

- **프로젝트 루트가 아닐 때 실행** → 즉시 중단, "gyeolhwi_claude_setup 프로젝트 루트에서 실행하세요" 안내
- **이동된 프로젝트 감지** (기존 junction 의 target 경로가 현재 프로젝트와 다를 때) → 사용자에게 알리고 재연결할지 물음

## 운영 메모

- Junction 은 Windows 디렉토리 링크. 관리자 권한 불필요. 단, 프로젝트 폴더를 옮기면 junction 깨짐 → user 가 알고 있어야 함.
- 단일 파일은 file symlink 가 가능하지만 admin/Developer Mode 필요. 단순 복사가 안전.
- 한글 경로 (`김결휘store`) 처리: PowerShell `-LiteralPath`, bash 는 따옴표 처리.
