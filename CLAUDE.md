# claude-setup 작업 규칙

- 질문을 받으면 [INDEX.md](./INDEX.md) 부터 읽고, summary·keywords 로 맞는 문서만 연다.
- `docs/**/*.md` 를 추가·수정·이동하면 같은 커밋에서 INDEX 를 다시 만든다: `uv run --with pyyaml python skills/docs-tidy/scripts/docs_index.py build --root .` 뒤 `check --root .`.
- 스킬·커맨드·훅은 이 저장소에서 고치고 push 한 뒤, 각 컴퓨터에서 `git pull` + `./install.sh --copy --no-obsidian` 으로 반영한다. `~/.claude` 쪽을 직접 고치지 않는다.
- 문서 형식은 [docs/spec/doc-conventions.md](./docs/spec/doc-conventions.md) 를 따른다.
