#!/usr/bin/env python3
"""git-convention: Claude 가 실행한 Bash 명령 직후(PostToolUse) 실행된다.

1. git commit  → 방금 만든 커밋이 git-commit 스킬 형식인지 검사
2. gh pr create / gh pr edit → PR 제목·본문이 git-pr 스킬 형식인지 검사
3. 배포 명령(기본 브랜치 push, PR merge, 배포 CLI) → git-release 스킬로 릴리스 노트를 만들지 제안

문제가 있을 때만 additionalContext 로 Claude 에게 알린다. 명령을 막지 않고, 어떤 입력에도 traceback 을 내지 않는다.
저장소별 끄기: git config convention.check false / git config convention.release false
"""
import json
import os
import re
import shlex
import subprocess
import sys
import time

TYPES = "FEAT|UX|FIX|PERF|CONTENT|DOCS|REFACTOR|TEST|CHORE|REVERT"
COMMIT_TITLE = re.compile(rf"^({TYPES})\([a-z0-9][a-z0-9-]*\): \S.* - \d{{4}}-\d{{2}}-\d{{2}}$")
PR_TITLE = re.compile(rf"^({TYPES})\([a-z0-9][a-z0-9-]*\): \S.*$")
PR_SECTIONS = ("## 요약", "## 달라지는 점", "## 관련")
AI_MARKS = re.compile(r"Co-Authored-By:\s*Claude|Generated with \[?Claude", re.I)
DEFAULT_BRANCHES = {"main", "master"}
SEPARATORS = {"&&", "||", ";", "|", "&", "\n"}
FRESH_SECONDS = 120  # 이보다 오래된 HEAD 는 방금 만든 커밋이 아니다


def git(cwd, *args, timeout=3):
    try:
        r = subprocess.run(["git", "-C", cwd, *args], capture_output=True, text=True, timeout=timeout)
        return r.stdout.strip() if r.returncode == 0 else None
    except Exception:
        return None


def enabled(cwd, key):
    return (git(cwd, "config", "--get", f"convention.{key}") or "true").lower() != "false"


def segments(command):
    """명령을 &&, ;, | 단위로 나눈 토큰 목록들. 따옴표 안 텍스트는 한 토큰이라 오탐하지 않는다."""
    lex = shlex.shlex(command, posix=True, punctuation_chars=";&|\n")
    lex.whitespace = " \t\r"
    lex.whitespace_split = True
    lex.commenters = ""
    out, cur = [], []
    for tok in lex:
        if tok in SEPARATORS or set(tok) <= set(";&|\n"):
            if cur:
                out.append(cur)
            cur = []
        else:
            cur.append(tok)
    if cur:
        out.append(cur)
    return out


def abspath(base, p):
    p = os.path.expanduser(p)
    return p if os.path.isabs(p) else os.path.normpath(os.path.join(base, p))


def parse_git(tokens, cwd):
    """git [전역옵션] <sub> args → (sub, args, cwd)"""
    i = 1
    while i < len(tokens):
        t = tokens[i]
        if t == "-C" and i + 1 < len(tokens):
            cwd = abspath(cwd, tokens[i + 1]); i += 2
        elif t in ("-c", "--git-dir", "--work-tree", "--namespace") and i + 1 < len(tokens):
            i += 2
        elif t.startswith("-"):
            i += 1
        else:
            return t, tokens[i + 1:], cwd
    return None, [], cwd


# ------------------------------------------------------------------ 커밋
def check_commit(cwd):
    if git(cwd, "rev-parse", "--is-inside-work-tree") != "true":
        return None
    info = git(cwd, "log", "-1", "--format=%P%x00%ct%x00%h%x00%B")
    if not info:
        return None
    parents, ctime, short, msg = (info.split("\x00", 3) + ["", "", "", ""])[:4]
    if len(parents.split()) > 1:
        return None  # merge 커밋
    try:
        if time.time() - int(ctime) > FRESH_SECONDS:
            return None  # 방금 만든 커밋이 아님 (커밋이 실패했거나 --dry-run)
    except ValueError:
        return None
    title = msg.splitlines()[0] if msg else ""
    if title.startswith(("fixup! ", "squash! ", "amend! ")):
        return None
    problems = []
    if not COMMIT_TITLE.match(title):
        problems.append("제목이 `<TYPE>(<scope>): <subject> - YYYY-MM-DD` 형식이 아님 "
                        f"(TYPE: {TYPES.replace('|', ', ')}, scope 는 영문 소문자)")
    if not re.search(r"^Why: \S", msg, re.M):
        problems.append("본문에 `Why:` 줄이 없음")
    if not re.search(r"^Author: \S", msg, re.M):
        problems.append("마지막 trailer 에 `Author:` 줄이 없음")
    if title.startswith("REVERT") and not re.search(r"^Related: \S", msg, re.M):
        problems.append("REVERT 인데 `Related:` 가 없음")
    if AI_MARKS.search(msg):
        problems.append("AI 생성 표시(Co-Authored-By: Claude 등)가 들어 있음 — 제거해야 함")
    if not problems:
        return None
    pushed = git(cwd, "branch", "-r", "--contains", "HEAD", timeout=4)
    how = ("이미 원격에 있는 커밋이므로 고치지 말고 사용자에게 형식 위반만 알린다."
           if pushed else
           "아직 push 전이므로 git-commit 스킬 형식으로 메시지를 다시 써서 `git commit --amend -F <파일>` 로 고친다.")
    return (f"[git-convention] 방금 만든 커밋 {short} 이 git-commit 스킬 형식과 다릅니다: "
            + "; ".join(problems) + f". {how} (이 저장소에서 검사를 끄려면 git config convention.check false)")


# ------------------------------------------------------------------ PR
def flag_value(tokens, *names):
    for i, t in enumerate(tokens):
        for n in names:
            if t == n and i + 1 < len(tokens):
                return tokens[i + 1]
            if n.startswith("--") and t.startswith(n + "="):
                return t[len(n) + 1:]
    return None


def check_pr(tokens, cwd):
    problems = []
    title = flag_value(tokens, "--title", "-t")
    if title is not None and not re.search(r"[$`]", title):
        if not PR_TITLE.match(title):
            problems.append("PR 제목이 `<TYPE>(<scope>): <subject>` 형식이 아님")
        elif re.search(r" - \d{4}-\d{2}-\d{2}$", title):
            problems.append("PR 제목에는 날짜를 붙이지 않음")
    body = flag_value(tokens, "--body", "-b")
    body_file = flag_value(tokens, "--body-file", "-F")
    if body_file and body_file != "-":
        try:
            with open(abspath(cwd, body_file), encoding="utf-8") as f:
                body = f.read()
        except Exception:
            body = None
    if body is not None:
        missing = [s for s in PR_SECTIONS if s not in body]
        if missing:
            problems.append("PR 본문에 필수 섹션이 없음: " + ", ".join(missing))
        if AI_MARKS.search(body):
            problems.append("PR 본문에 AI 생성 표시가 들어 있음 — 제거해야 함")
    if not problems:
        return None
    return ("[git-convention] 방금 만든/수정한 PR 이 git-pr 스킬 형식과 다릅니다: " + "; ".join(problems)
            + ". git-pr 스킬 형식으로 고쳐 `gh pr edit <번호> --title ... --body-file <파일>` 로 갱신한다.")


# ------------------------------------------------------------------ 배포
def is_default_push(args, cwd):
    if any(a in ("-n", "--dry-run", "-d", "--delete") for a in args):
        return False
    pos = [a for a in args if not a.startswith("-")]
    targets = pos[1:]  # 첫 번째는 remote
    if not targets:
        if "--tags" in args:
            return False  # 태그만 push
        return git(cwd, "branch", "--show-current") in DEFAULT_BRANCHES
    current = None
    for t in targets:
        dst = t.split(":")[-1].lstrip("+").replace("refs/heads/", "")
        if dst in ("HEAD", "@"):
            current = current or git(cwd, "branch", "--show-current")
            dst = current
        if dst in DEFAULT_BRANCHES:
            return True
    return False


def is_deploy_cli(tokens):
    t = [x for x in tokens if not x.startswith("-")]
    if not t:
        return False
    head = os.path.basename(t[0])
    if head in ("npx", "bunx", "pnpx") and len(t) > 1:
        tokens, t, head = tokens[1:], t[1:], os.path.basename(t[1])
    if head == "vercel":
        return "--prod" in tokens
    if head in ("npm", "pnpm", "yarn", "bun"):
        rest = t[1:]
        return rest[:1] == ["deploy"] or rest[:2] == ["run", "deploy"]
    if head == "firebase" or head in ("fly", "flyctl"):
        return t[1:2] == ["deploy"]
    if head == "wrangler":
        return t[1:2] in (["deploy"], ["publish"])
    return False


# ------------------------------------------------------------------ main
def run(data):
    if not isinstance(data, dict) or data.get("tool_name") != "Bash":
        return None
    tool_input = data.get("tool_input")
    command = tool_input.get("command") if isinstance(tool_input, dict) else None
    if not isinstance(command, str) or not command.strip():
        return None
    cwd = data.get("cwd") if isinstance(data.get("cwd"), str) else os.getcwd()
    try:
        segs = segments(command)
    except ValueError:
        return None  # 따옴표가 닫히지 않은 명령은 판단하지 않는다

    commit_dirs, pr_checks, deploy = [], [], False
    for seg in segs:
        head = os.path.basename(seg[0])
        if head == "cd" and len(seg) > 1:
            nxt = abspath(cwd, seg[1])
            if os.path.isdir(nxt):
                cwd = nxt
            continue
        if head == "git":
            sub, args, gcwd = parse_git(seg, cwd)
            if not os.path.isdir(gcwd):
                gcwd = cwd
            if sub == "commit" and "--dry-run" not in args:
                commit_dirs.append(gcwd)
            elif sub == "push" and is_default_push(args, gcwd):
                deploy = deploy or gcwd
        elif head == "gh" and seg[1:3] in (["pr", "create"], ["pr", "edit"]):
            pr_checks.append((seg, cwd))
        elif head == "gh" and seg[1:3] == ["pr", "merge"] and "--auto" not in seg:
            deploy = deploy or cwd
        elif is_deploy_cli(seg):
            deploy = deploy or cwd

    notes = []
    for d in dict.fromkeys(commit_dirs):
        if enabled(d, "check"):
            n = check_commit(d)
            if n:
                notes.append(n)
    for seg, d in pr_checks:
        if enabled(d, "check"):
            n = check_pr(seg, d)
            if n:
                notes.append(n)
    if deploy and enabled(deploy, "release"):
        notes.append(
            "[git-convention] 배포로 보이는 명령이 실행됐습니다 (기본 브랜치 push / PR merge / 배포 명령). "
            "git-release 스킬로 이번 배포의 릴리스 노트를 만들지 사용자에게 한 번 물어본다. "
            "방금 한 일이 git-release 의 CHANGELOG 커밋·push 였다면 묻지 않는다. "
            "(이 저장소에서 끄려면 git config convention.release false)"
        )
    return "\n".join(notes) or None


def main():
    try:
        context = run(json.load(sys.stdin))
        if context:
            out = json.dumps({"hookSpecificOutput": {"hookEventName": "PostToolUse",
                                                     "additionalContext": context}}, ensure_ascii=True)
            sys.stdout.write(out + "\n")
    except Exception:
        pass


if __name__ == "__main__":
    main()
