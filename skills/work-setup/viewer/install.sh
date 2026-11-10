#!/usr/bin/env bash
# Work Viewer 설치: 서비스 등록 (Linux systemd 사용자 서비스 / macOS launchd).
#
#   viewer/install.sh                       # ~/Work를 보는 뷰어를 127.0.0.1:7320에 띄운다
#   viewer/install.sh --root ~/Work --port 7320
#   viewer/install.sh --uninstall
#
# 뷰어는 항상 127.0.0.1에만 연다. 다른 기기에서 보려면 Tailscale serve나 SSH 터널을 쓴다 (README 참고).
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="${HOME}/Work"
PORT=7320
UNINSTALL=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --root) ROOT="$2"; shift 2 ;;
    --port) PORT="$2"; shift 2 ;;
    --uninstall) UNINSTALL=1; shift ;;
    -h|--help) sed -n '2,8p' "$0"; exit 0 ;;
    *) echo "알 수 없는 옵션: $1" >&2; exit 2 ;;
  esac
done

ROOT="$(cd "$ROOT" 2>/dev/null && pwd)" || { echo "작업공간 폴더가 없습니다: $ROOT" >&2; exit 1; }
OS="$(uname -s)"
LABEL="local.work-viewer"
UNIT="${HOME}/.config/systemd/user/work-viewer.service"
PLIST="${HOME}/Library/LaunchAgents/${LABEL}.plist"

if [[ $UNINSTALL -eq 1 ]]; then
  if [[ "$OS" == "Darwin" ]]; then
    launchctl bootout "gui/$(id -u)/${LABEL}" 2>/dev/null || true
    rm -f "$PLIST"
  else
    systemctl --user disable --now work-viewer 2>/dev/null || true
    rm -f "$UNIT"; systemctl --user daemon-reload 2>/dev/null || true
  fi
  echo "뷰어 서비스를 제거했습니다. 기록(~/.local/state/work-viewer)과 코드는 남겨 두었습니다."
  exit 0
fi


# bun 찾기
BUN="$(command -v bun || true)"
for c in "${HOME}/.local/bin/bun" "${HOME}/.bun/bin/bun"; do [[ -z "$BUN" && -x "$c" ]] && BUN="$c"; done
if [[ -z "$BUN" ]]; then
  echo "bun이 없습니다. 먼저 설치하세요: curl -fsSL https://bun.sh/install | bash" >&2
  exit 1
fi
STATE_DIR="${HOME}/.local/state/work-viewer"
mkdir -p "$STATE_DIR"

if [[ "$OS" == "Darwin" ]]; then
  mkdir -p "$(dirname "$PLIST")"
  cat > "$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>${LABEL}</string>
  <key>ProgramArguments</key><array><string>${BUN}</string><string>${APP_DIR}/server.ts</string></array>
  <key>EnvironmentVariables</key><dict>
    <key>WORK_ROOT</key><string>${ROOT}</string>
    <key>PORT</key><string>${PORT}</string>
    <key>HOST</key><string>127.0.0.1</string>
    <key>STATE_DIR</key><string>${STATE_DIR}</string>
    <key>PATH</key><string>$(dirname "$BUN"):${HOME}/.local/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin</string>
  </dict>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>StandardErrorPath</key><string>${STATE_DIR}/server.log</string>
</dict></plist>
EOF
  launchctl bootout "gui/$(id -u)/${LABEL}" 2>/dev/null || true
  launchctl bootstrap "gui/$(id -u)" "$PLIST"
elif command -v systemctl >/dev/null && systemctl --user show-environment >/dev/null 2>&1; then
  mkdir -p "$(dirname "$UNIT")"
  [[ -L "$UNIT" ]] && rm -f "$UNIT"
  cat > "$UNIT" <<EOF
[Unit]
Description=Work Viewer (${ROOT})
After=network.target

[Service]
ExecStart=${BUN} ${APP_DIR}/server.ts
Environment=WORK_ROOT=${ROOT} PORT=${PORT} HOST=127.0.0.1 STATE_DIR=${STATE_DIR}
Environment=PATH=$(dirname "$BUN"):${HOME}/.local/bin:/usr/local/bin:/usr/bin:/bin
Restart=always
RestartSec=2

[Install]
WantedBy=default.target
EOF
  systemctl --user daemon-reload
  systemctl --user enable work-viewer >/dev/null 2>&1
  systemctl --user restart work-viewer
  if command -v loginctl >/dev/null && [[ "$(loginctl show-user "$USER" -p Linger --value 2>/dev/null)" != "yes" ]]; then
    echo "참고: 로그아웃해도 계속 돌게 하려면 한 번 실행하세요: sudo loginctl enable-linger $USER"
  fi
else
  echo "서비스 관리자를 찾지 못했습니다. 직접 실행하세요:" >&2
  echo "  WORK_ROOT='$ROOT' PORT=$PORT '$BUN' '$APP_DIR/server.ts'" >&2
  exit 1
fi

# 확인
for _ in 1 2 3 4 5 6 7 8 9 10; do
  if curl -fsS "http://127.0.0.1:${PORT}/api/projects" >/dev/null 2>&1; then
    echo "뷰어가 떴습니다: http://127.0.0.1:${PORT}  (보는 폴더: ${ROOT})"
    exit 0
  fi
  sleep 0.5
done
echo "뷰어가 응답하지 않습니다. 로그를 확인하세요 (Linux: journalctl --user -u work-viewer -n 50)" >&2
exit 1
