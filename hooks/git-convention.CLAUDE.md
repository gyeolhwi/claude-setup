<!-- claude-setup:git-convention:start -->
<git_convention>
- 커밋·PR·릴리스 노트는 어떤 흐름에서 만들든(직접 요청, 다른 스킬, 서브에이전트) `git-commit` · `git-pr` · `git-release` 스킬 형식을 따른다. 커밋 전에는 git-commit, PR 전에는 git-pr 스킬을 먼저 읽는다.
- 제목은 PM 이 읽기 쉽게(`<TYPE>(<scope>): <결과 중심 한국어>`), 본문은 개발자·AI 가 추적할 수 있게(`Why:` · `How:` · `Refs:` · `Related:` · `Author:`) 쓴다.
- `~/.claude/hooks/git-convention.py` 훅이 형식 위반이나 배포를 알리면 그 안내를 따른다.
</git_convention>
<!-- claude-setup:git-convention:end -->
