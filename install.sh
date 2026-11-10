#!/usr/bin/env bash
#
# claude-setup 설치기 — 커맨드 + 스킬을 새 환경에 한 번에 세팅한다.
#
#   ./install.sh                      기본 설치 (~/.claude 에 심볼릭 링크)
#   ./install.sh --check              전제 조건만 점검하고 끝
#   ./install.sh --copy               링크 대신 복사
#   ./install.sh --codex              ~/.codex 에도 함께
#   ./install.sh --project <경로>     그 저장소의 .claude 에만
#   ./install.sh --obsidian <볼트>    Obsidian 커맨드까지 (볼트 경로 치환 + 템플릿 배치)
#   ./install.sh --no-obsidian        Obsidian 커맨드를 건너뛴다 (물어보지 않음)
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

CORE_COMMANDS=(git/commit-auto.md project/project-docs.md project/project-docs-gen.md project/project-workflow.md)
OBSIDIAN_COMMANDS=(obsidian-categories obsidian-format obsidian-index obsidian-init obsidian-move obsidian-organize obsidian-preview)
SKILLS=(create-pr gh-setup issue-create issue-start issue-end issue-merge work-setup)
NESTED_SKILLS=(omc-learned/project-docs-gen)

MODE=link
CODEX=0
PROJECT=""
CHECK_ONLY=0
VAULT=""
OBSIDIAN=ask

while [ $# -gt 0 ]; do
  case "$1" in
    --copy)        MODE=copy ;;
    --link)        MODE=link ;;
    --codex)       CODEX=1 ;;
    --project)     PROJECT="${2:?--project 뒤에 저장소 경로가 필요합니다}"; shift ;;
    --check)       CHECK_ONLY=1 ;;
    --obsidian)    VAULT="${2:?--obsidian 뒤에 볼트 경로가 필요합니다}"; OBSIDIAN=yes; shift ;;
    --no-obsidian) OBSIDIAN=no ;;
    -h|--help)     sed -n '2,14p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "알 수 없는 인자: $1" >&2; exit 1 ;;
  esac
  shift
done

say()  { printf '%s\n' "$*"; }
ok()   { printf '  \033[32m✓\033[0m %s\n' "$*"; }
bad()  { printf '  \033[31m✗\033[0m %s\n' "$*"; }
warn() { printf '  \033[33m!\033[0m %s\n' "$*"; }

# ---------------------------------------------------------------- 전제 점검
say ""
say "전제 조건"

FATAL=0

if command -v git >/dev/null 2>&1; then ok "git $(git --version | awk '{print $3}')"
else bad "git 없음 — 필수"; FATAL=1; fi

if command -v rsync >/dev/null 2>&1; then ok "rsync"
else bad "rsync 없음 — 필수"; FATAL=1; fi

if command -v node >/dev/null 2>&1; then
  NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
  if [ "$NODE_MAJOR" -ge 18 ]; then ok "node $(node -v)"
  else bad "node $(node -v) — issue-* 스킬은 18 이상이 필요합니다"; FATAL=1; fi
else bad "node 없음 — issue-* 스킬에 필수 (18+)"; FATAL=1; fi

if command -v gh >/dev/null 2>&1; then
  if gh auth status >/dev/null 2>&1; then ok "gh $(gh --version | head -1 | awk '{print $3}') · 로그인됨"
  else warn "gh 는 있으나 로그인되지 않음 — 'gh auth login' 또는 /gh-setup"; fi
else warn "gh 없음 — 이슈·PR 워크플로우에 필요합니다. /gh-setup 이 설치를 안내합니다"; fi

if command -v cwebp >/dev/null 2>&1; then ok "cwebp — 증거 webp 변환 가능"
elif command -v ffmpeg >/dev/null 2>&1; then ok "ffmpeg — 증거 webp 변환 가능"
else warn "cwebp/ffmpeg 없음 — 프로젝트에 sharp 가 없으면 증거가 png 로 남습니다 (brew install webp)"; fi

warn "playwright 는 이 저장소가 아니라 '작업할 프로젝트' 에 있어야 합니다:"
say  "      npm i -D playwright && npx playwright install chromium"

if [ "$FATAL" -eq 1 ]; then
  say ""
  say "필수 항목이 빠져 설치를 중단합니다."
  exit 1
fi

[ "$CHECK_ONLY" -eq 1 ] && { say ""; say "점검만 수행했습니다."; exit 0; }

# ---------------------------------------------------------------- 대상 결정
BASES=()
if [ -n "$PROJECT" ]; then
  PROJECT="$(cd "$PROJECT" && pwd)"
  BASES+=("$PROJECT/.claude")
else
  BASES+=("$HOME/.claude")
  [ "$CODEX" -eq 1 ] && BASES+=("$HOME/.codex")
fi

# ---------------------------------------------------------------- Obsidian 여부
if [ "$OBSIDIAN" = ask ]; then
  if [ -t 0 ]; then
    say ""
    printf 'Obsidian 볼트 경로 (안 쓰면 그냥 Enter): '
    read -r VAULT || VAULT=""
  fi
  [ -n "$VAULT" ] && OBSIDIAN=yes || OBSIDIAN=no
fi

if [ "$OBSIDIAN" = yes ]; then
  VAULT="${VAULT/#\~/$HOME}"
  if [ ! -d "$VAULT" ]; then
    warn "볼트 경로가 없습니다: $VAULT — Obsidian 커맨드를 건너뜁니다"
    OBSIDIAN=no
  fi
fi

# ---------------------------------------------------------------- 유틸
backup_if_exists() {
  local target="$1"
  if [ -e "$target" ] || [ -L "$target" ]; then
    local bak="$target.bak.$(date +%Y%m%d%H%M%S)"
    mv "$target" "$bak"
    warn "$(basename "$target") — 기존 설치를 $(basename "$bak") 로 물려 둠"
  fi
}

place() {          # place <원본> <대상>  — MODE 에 따라 링크 또는 복사
  local src="$1" dest="$2"
  backup_if_exists "$dest"
  mkdir -p "$(dirname "$dest")"
  if [ "$MODE" = link ]; then
    ln -s "$src" "$dest"
  elif [ -d "$src" ]; then
    rsync -a --exclude '.DS_Store' "$src/" "$dest/"
  else
    cp "$src" "$dest"
  fi
}

# ---------------------------------------------------------------- 설치
for BASE in "${BASES[@]}"; do
  say ""
  say "설치 → $BASE  (${MODE})"

  mkdir -p "$BASE/commands" "$BASE/skills"

  # 커맨드 (공통)
  for c in "${CORE_COMMANDS[@]}"; do
    src="$ROOT/commands/$c"
    [ -f "$src" ] || { bad "$c — 원본이 없습니다"; continue; }
    place "$src" "$BASE/commands/$(basename "$c")"
    ok "commands/$(basename "$c")"
  done

  # 커맨드 (Obsidian) — 볼트 경로를 치환해야 하므로 항상 복사한다
  if [ "$OBSIDIAN" = yes ]; then
    for c in "${OBSIDIAN_COMMANDS[@]}"; do
      src="$ROOT/commands/obsidian/$c.md"
      [ -f "$src" ] || { bad "obsidian/$c.md — 원본이 없습니다"; continue; }
      backup_if_exists "$BASE/commands/$c.md"
      sed "s|{{OBSIDIAN_VAULT_PATH}}|$VAULT|g" "$src" > "$BASE/commands/$c.md"
      ok "commands/$c.md (볼트 경로 치환)"
    done
  fi

  # 스킬
  for s in "${SKILLS[@]}"; do
    src="$ROOT/skills/$s"
    [ -d "$src" ] || { bad "skills/$s — 원본이 없습니다"; continue; }
    place "$src" "$BASE/skills/$s"
    ok "skills/$s"
  done

  for s in "${NESTED_SKILLS[@]}"; do
    src="$ROOT/skills/$s"
    [ -d "$src" ] || { bad "skills/$s — 원본이 없습니다"; continue; }
    place "$src" "$BASE/skills/$s"
    ok "skills/$s"
  done
done

# ---------------------------------------------------------------- Obsidian 템플릿
if [ "$OBSIDIAN" = yes ]; then
  TPL_DEST="$VAULT/01_문서템플릿"
  say ""
  say "Obsidian 템플릿 → $TPL_DEST"
  mkdir -p "$TPL_DEST"
  rsync -a --exclude '.DS_Store' "$ROOT/commands/obsidian/templates/" "$TPL_DEST/"
  ok "템플릿 $(ls -1 "$ROOT/commands/obsidian/templates" | grep -c '\.md$')종"
  warn "볼트 안이 정본입니다. 볼트에서 고쳤으면 이 저장소로 되돌려 맞추세요"
fi

# ---------------------------------------------------------------- 전역 설정
SETTINGS="$HOME/.issue/settings.json"
say ""
if [ ! -f "$SETTINGS" ]; then
  mkdir -p "$HOME/.issue"
  cat > "$SETTINGS" <<'EOJSON'
{
  "version": 1,
  "provider": { "type": "github" }
}
EOJSON
  ok "~/.issue/settings.json 생성 (provider=github)"
  warn "worktree.layout 은 첫 실행 때 스킬이 한 번 물어보고 여기에 기록합니다"
else
  ok "~/.issue/settings.json 이미 있음 — 건드리지 않았습니다"
fi

# ---------------------------------------------------------------- 끝
say ""
say "끝났습니다. 새 Claude Code 세션에서 시작하세요."
say ""
say "    /project-docs                     프로젝트 docs/ 구조 생성"
say "    /project-docs-gen                 기획서 → 개발 문서 10종"
say "    \"개발 시작해줘\" / \"리뷰해줘\"        docs/ 기반 협업 워크플로우"
say ""
say "    /issue-create  \"고칠 내용\"         이슈부터 등록"
say "    /issue-start   12                 착수 → 워크트리 → 구현 → 증거"
say "    /issue-end                        증거 확인 → 이슈 코멘트 → PR"
say "    /issue-merge                      워크트리 일괄 통합 → 이슈 close"
say ""
[ "$OBSIDIAN" = yes ] && { say "    /obsidian-init                    볼트 초기 세팅"; say ""; }
say "문서: INDEX.md (AI 진입점) · README.md (사람 진입점)"
say ""
