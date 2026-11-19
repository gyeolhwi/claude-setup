<!-- repo-init:rules:start -->
## 작업 방식

- 문서를 찾을 때 `INDEX.md` 부터 읽고 필요한 문서만 연다. `docs/**/*.md` 를 추가·수정·이동하면 같은 작업에서 INDEX 를 다시 만든다 (`uv run ~/.claude/skills/docs-tidy/scripts/docs_index.py build --root .`).
- 코드를 바꾸는 요청은 `issue-create` 로 이슈부터 등록한다. 이슈 1 = 워크트리 1 = PR 1.
- GitHub Project 보드 #{{BOARD_NUMBER}} ({{BOARD_URL}}) 를 쓴다. 이슈는 `--assignee @me` 와 보드 필드(카테고리·작업유형·강조포인트)를 채워 등록한다. Status 는 진행 라벨을 따라 자동으로 옮겨진다.
- 커밋·PR·릴리스는 `git-commit` · `git-pr` · `git-release` 스킬 형식을 따른다.
- 이슈·PR·보드·증거 규칙은 `{{WORK_FORMAT_PATH}}` 를 따른다. 이슈 등록과 PR 작성 전에 읽는다.
<!-- repo-init:rules:end -->
