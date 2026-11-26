---
name: ai-switch
description: Claude·Codex 등 AI 구독 계정을 바꾼다. init·목록·계정 추가·switch. "/ai-switch", "계정 바꿔줘", "크레딧 다 썼어", "AI 계정 목록" 요청에 쓴다.
---

# ai-switch

실제 동작은 `~/.ai-subscription` 의 `ai-switch` 명령이 한다. 이 스킬은 질문하고 그 명령을 부르기만 한다.

## 규칙 (반드시)
- 아래 질문·명령·답변을 **그대로** 쓴다. 추측·추론·추가 설명·다른 방법 제안 금지.
- 단계는 **번호 순서대로 하나씩** 진행한다. 순서를 바꾸거나 질문을 묶지 않는다. 텍스트로 묻는 단계는 그 질문으로 응답을 끝내고, 답을 받은 뒤 다음 단계로 간다.
- 사용자 값은 질문으로만 받는다. 추측한 값을 선택지로 제시하지 않는다.
- 사용자가 입력한 값은 **해석하지 않고 그대로** `{X}` 에 넣는다. 명령어·도움말 요청 등으로 해석해 되묻지 않는다. 값이 맞는지는 `ai-switch` 가 검사하고, 그 출력을 그대로 보여 준다.
- 명령이 실패하면 출력을 그대로 보여 주고 멈춘다.
- `ai-switch` 출력은 첫 줄(예: `계정 목록 ($ ai-switch list)`)까지 그대로 코드 블록으로 보여 준다. 예시 값(이름 등)을 지어내 넣지 않는다.
- 토큰을 출력하지 않고 채팅으로 받지 않는다.
- `{X}` 는 앞 단계에서 받은 값. `<SKILL_DIR>` 은 이 SKILL.md 가 있는 폴더.

`RUN {인자}` 는 아래 명령이다:
```bash
if grep -q '^#L ' ~/.ai-subscription; then powershell -NoProfile -Command "[Console]::OutputEncoding = [Text.Encoding]::UTF8; iex (gc ~/.ai-subscription -Raw -Encoding UTF8); ai-switch {인자}"; else bash -c "source ~/.ai-subscription && ai-switch {인자}"; fi
```
`HAS {NAME}` 는 아래 명령이다 (5단계 이후 저장됐으면 `DONE`, 아니면 `NONE`. 같은 이름 덮어쓰기도 잡는다):
```bash
f=~/.ai-subscription; { [ $f -nt ~/.ai-switch-wait ] && { grep -qF '  "{NAME}|' $f || grep -qF "name='{NAME}'" $f; }; } && echo DONE || echo NONE
```

## 0. 메뉴
AskUserQuestion — 질문 "ai-switch 로 무엇을 할까요?", 선택지 순서 고정:
1. `init` — 이 컴퓨터에 세팅
2. `목록` — 계정과 지금 적용된 계정 ($ ai-switch list)
3. `계정 추가` — ($ ai-switch add <claude|codex> <이름>)
4. `switch` — ($ ai-switch <이름>)

1 이 아니면 먼저 `test -f ~/.ai-subscription && echo OK || echo NOFILE` → `NOFILE` 이면 답 "아직 세팅 전입니다. init 을 먼저 실행해 주세요." 하고 멈춘다.

## 1. init
AskUserQuestion — 질문 "어느 환경인가요?", 선택지 순서 고정:
1. `자동 (Recommended)` — 이 컴퓨터를 확인해서 고름
2. `Linux·WSL·Mac`
3. `Windows`

`자동` 이면 실행하고, 출력 그대로 2 또는 3 으로 간다:
```bash
case "$(uname -s)" in MINGW*|MSYS*|CYGWIN*) echo Windows;; *) echo 'Linux·WSL·Mac';; esac
```
템플릿으로 새로 쓰되 등록된 계정 줄은 그대로 옮긴다:
```bash
f=~/.ai-subscription; touch $f
awk 'FILENAME == ARGV[1] { sub(/\r$/, ""); if ($0 ~ /^  "[^"]*[|]/) L = L $0 "\n"; else if ($0 ~ /^  @\{/) W = W "#W " $0 "\n"; next }
     { print } /^AI_ACCOUNTS=\($/ { printf "%s", L } /^#W \$AI_ACCOUNTS = @\($/ { printf "%s", W }' \
  $f <SKILL_DIR>/ai-subscription.template > $f.new && grep -q AI_ACCOUNTS $f.new && mv $f.new $f && chmod 600 $f
echo "KEPT $(grep -c '^  "[^"]*[|]\|^#W   @{' $f)"
```
이어서 고른 환경의 명령:
```bash
# Linux·WSL·Mac
for f in ~/.bashrc ~/.zshrc; do grep -qxF 'source ~/.ai-subscription' "$f" 2>/dev/null || echo 'source ~/.ai-subscription' >> "$f"; done
# Windows
grep -q '^#W ' ~/.ai-subscription && sed -i '/^# ===== Linux/,/^# ===== Windows/{/^#/!{/^$/!s/^/#L /}}; s/^#W //' ~/.ai-subscription
# 예전 init 의 -Encoding 없는 줄은 바이트 단위로 바꿔 끼워 프로필의 다른 줄·인코딩을 건드리지 않는다
powershell -NoProfile -Command '$p = $PROFILE; $old = "iex (gc ~/.ai-subscription -Raw)"; $new = "iex (gc ~/.ai-subscription -Raw -Encoding UTF8)"; if (!(Test-Path $p)) { New-Item -Force $p | Out-Null }; $b = [Text.Encoding]::GetEncoding(28591); $t = $b.GetString([IO.File]::ReadAllBytes($p)); if ($t.Contains($old)) { [IO.File]::WriteAllBytes($p, $b.GetBytes($t.Replace($old, $new))) } elseif (!(Select-String -Quiet -SimpleMatch ai-subscription $p)) { Add-Content $p $new }'
```
이어서 Claude Code 하단 상태줄에 지금 계정을 띄운다. 고른 환경의 `C=` 한 줄과 그 아래 공통 명령을 한 번에 실행한다 (OMC HUD 처럼 이미 상태줄이 있으면 그 명령 뒤에 계정 한 줄을 잇는다):
```bash
# Linux·WSL·Mac
C="bash -c 'source ~/.ai-subscription && ai-switch current'"
# Windows (JSON 안에 들어갈 값이라 \" 그대로 둔다)
C='powershell -NoProfile -Command \"[Console]::OutputEncoding = [Text.Encoding]::UTF8; iex (gc ~/.ai-subscription -Raw -Encoding UTF8); ai-switch current\"'
# 공통
s=~/.claude/settings.json; mkdir -p ~/.claude; [ -s $s ] || echo '{}' > $s
if grep -q 'ai-switch current' $s; then echo "STATUS DONE"
elif grep -q '"statusLine"' $s; then cp $s $s.bak  # 기존 상태줄 "command" 값 끝에 "; <계정 명령>" 을 잇는다
  A="; $C </dev/null" awk 'f == 0 && /"statusLine"/ { f = 1 } f == 1 && /^[ \t]*"command"[ \t]*:[ \t]*".*"[ \t]*,?[ \t]*$/ { i = match($0, /"[ \t]*,?[ \t]*$/); $0 = substr($0, 1, i - 1) ENVIRON["A"] substr($0, i); f = 2 } 1; END { exit f != 2 }' $s.bak > $s.new \
    && mv $s.new $s && echo "STATUS MERGE" || { rm -f $s.new; echo "STATUS KEEP"; }
else cp $s $s.bak
  L="\"statusLine\": { \"type\": \"command\", \"command\": \"$C\" }"; grep -q '"' $s.bak && L="$L,"
  L="$L" awk '!d && (i = index($0, "{")) { print substr($0, 1, i); print "  " ENVIRON["L"]; $0 = substr($0, i + 1); d = 1 } 1' $s.bak > $s && echo "STATUS ADD"; fi
```
- `STATUS ADD` → `{STATUS}` = `추가 (Claude Code 를 다시 켜면 하단에 "acct: <이름>")`
- `STATUS MERGE` → `{STATUS}` = `기존 상태줄(OMC HUD 등) 아래에 계정 줄 추가 (Claude Code 를 다시 켜면 보임. 상태줄을 다시 설치하면 빠지니 그때 init 을 다시 실행)`
- `STATUS DONE` → `{STATUS}` = `이미 등록됨`
- `STATUS KEEP` → `{STATUS}` = `기존 상태줄 형식을 몰라 그대로 둠. 그 상태줄 명령 끝에 아래를 붙이면 계정이 함께 보입니다` + `; ` 뒤에 `C` 값에서 `\"` 를 `"` 로 바꾼 명령을 코드 블록으로
답 (실행한 환경의 것 하나를 그대로):
```
세팅했습니다 (Linux·WSL·Mac)
- 계정 파일: ~/.ai-subscription (계정 {KEPT}개 유지)
- 연결: ~/.bashrc, ~/.zshrc
- 상태줄: {STATUS}
새 터미널부터 ai-switch 를 쓸 수 있습니다.
```
```
세팅했습니다 (Windows)
- 계정 파일: ~/.ai-subscription (계정 {KEPT}개 유지)
- 연결: PowerShell 프로필($PROFILE)
- 상태줄: {STATUS}
새 터미널부터 ai-switch 를 쓸 수 있습니다.
```

## 2. 목록
`RUN list` → 답: 출력 그대로.

## 3. 계정 추가
1. AskUserQuestion — 질문 "어떤 도구의 계정인가요?", 선택지: `claude` / `codex`. → `{TOOL}`
2. 묻는다 (선택지 없이 텍스트로): "추가할 이름을 입력해 주세요. ($ ai-switch add {TOOL} <이름>)" → 여기서 응답을 끝내고 답을 기다린다. → `{NAME}`
3. `{TOOL}` 이 codex 면 `RUN add codex {NAME}` → 답: 출력 그대로. 끝.
4. claude 면 AskUserQuestion — 질문 "토큰이 있나요?", 선택지 순서 고정: `있음` / `없음`
   - `없음` → 먼저 말한다 (그대로): "브라우저 claude.ai 를 추가할 계정으로 로그인한 뒤, 터미널에서 `claude setup-token` 을 실행해 토큰을 받아 주세요."
5. 말한다 (그대로):
새 터미널 창을 엽니다. 창에 토큰을 붙여 넣고 Enter 를 누르면 창이 닫힙니다. (최대 1분 기다립니다)
기다리지 않으려면 직접 터미널에서 실행해도 됩니다:
```bash
$ ai-switch add claude {NAME}
```
   창 열기 실행:
```bash
touch ~/.ai-switch-wait; C='ai-switch add claude {NAME}'
if [ -n "$SSH_CONNECTION" ]; then echo NO_GUI
elif [ "$(uname -s)" = Darwin ]; then osascript -e "tell application \"Terminal\" to do script \"source ~/.ai-subscription; $C; exit\"" >/dev/null
elif grep -qi microsoft /proc/version 2>/dev/null; then cd /mnt/c && timeout 20 /mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe -NoProfile -Command "Start-Process wsl.exe -ArgumentList '--','bash','-ic','$C'" >/dev/null
else case "$(uname -s)" in
  MINGW*|MSYS*|CYGWIN*) powershell -NoProfile -Command "Start-Process powershell -ArgumentList '-NoProfile','-Command','iex (gc ~/.ai-subscription -Raw -Encoding UTF8); $C'" ;;
  *) if [ -n "$DISPLAY$WAYLAND_DISPLAY" ]; then (x-terminal-emulator -e bash -ic "$C" >/dev/null 2>&1 &); else echo NO_GUI; fi ;;
esac; fi
```
   - 출력이 `NO_GUI` 면 6 으로.
   - 아니면 기다리기 실행 (2초 간격, 최대 60초):
```bash
f=~/.ai-subscription; for i in $(seq 30); do { [ $f -nt ~/.ai-switch-wait ] && { grep -qF '  "{NAME}|' $f || grep -qF "name='{NAME}'" $f; }; } && break; sleep 2; done
{ [ $f -nt ~/.ai-switch-wait ] && { grep -qF '  "{NAME}|' $f || grep -qF "name='{NAME}'" $f; }; } && echo DONE || echo NONE
```
     `DONE` → `rm -f ~/.ai-switch-wait` 후 답 "등록됐습니다: {NAME}" 하고 끝. `NONE` → 6 으로.
6. 말한다 (그대로): "창이 열리지 않았거나 응답이 없습니다. 위 명령을 새 터미널에서 직접 실행해 주세요." (NO_GUI 로 왔으면 대신: "새 터미널에서 실행하고 토큰을 붙여 넣어 주세요." + 아래 명령)
```bash
$ ai-switch add claude {NAME}
```
   이어서 AskUserQuestion — 질문 "등록을 마쳤나요?", 선택지 순서 고정: `완료` / `취소`
   - `취소` → `rm -f ~/.ai-switch-wait` 후 답 "취소했습니다." 하고 끝.
   - `완료` → `HAS {NAME}`. `DONE` → `rm -f ~/.ai-switch-wait` 후 답 "등록됐습니다: {NAME}". `NONE` → 답 "아직 등록되지 않았습니다." 하고 6 의 질문을 다시 한다.

## 4. switch
1. `RUN list`. 출력에 "등록된 계정이 없습니다" 가 있으면 그 출력을 보여 주고 멈춘다.
2. AskUserQuestion — 질문 "어느 계정으로 바꿀까요?", 선택지: 출력의 계정 줄(두 칸 들여쓴 줄)만 순서대로 최대 4개 (label 이름, description 도구, "← 다음 실행" 줄은 description 끝에 "(현재)"). 나머지는 Other 에 이름 입력. → `{NAME}`
3. `RUN {NAME}` → 답: 출력 그대로.
