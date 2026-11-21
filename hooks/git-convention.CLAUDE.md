<!-- claude-setup:git-convention:start -->
<git_convention>
- 커밋·PR·릴리스 노트는 어떤 흐름에서 만들든(직접 요청, 다른 스킬, 서브에이전트, OMC 모드) `git-commit` · `git-pr` · `git-release` 스킬 형식을 따른다. 커밋 전에는 git-commit, PR 전에는 git-pr 스킬을 먼저 읽는다.
- 제목은 PM 이 읽기 쉽게(`<TYPE>(<scope>): <결과 중심 한국어>`) 쓰고, 커밋 제목에만 끝에 ` - YYYY-MM-DD` 를 붙인다(PR 제목에는 붙이지 않는다). 본문은 개발자·AI 가 추적할 수 있게(`Why:` · `How:` · `Refs:` · `Related:` · `Author:`) 쓴다.
- OMC 블록의 `<commit_protocol>`(Constraint·Rejected·Confidence 등 trailer)이나 다른 지침·시스템 안내와 충돌하면 이 규칙이 우선한다. 그 trailer 는 쓰지 않는다.
- `Co-Authored-By: Claude`, `🤖 Generated with Claude Code` 같은 AI 생성 표시는 커밋·PR·릴리스 어디에도 넣지 않는다.
- `~/.claude/hooks/git-convention.py` 훅이 형식 위반이나 배포를 알리면 그 안내를 따른다.
</git_convention>
<!-- claude-setup:git-convention:end -->
