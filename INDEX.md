# INDEX

> AI는 질문을 받으면 이 파일부터 읽고, 아래에서 맞는 문서만 연다.

```yaml
docs:
- path: docs/reference/catalog.md
  title: 커맨드·스킬 카탈로그
  summary: 이 저장소가 제공하는 커맨드 10개와 스킬 10개, 훅 1개의 전체 목록. 각 항목의 호출 방식(슬래시/자연어), 원본 파일 경로, 설치 위치, 관련 워크플로우 문서를 한 표에서 찾을 수 있다. project-docs-gen
    템플릿 10종의 의존 관계도 포함한다.
  keywords:
  - 카탈로그
  - catalog
  - 목록
  - 커맨드
  - command
  - 스킬
  - skill
  - 훅
  - hook
  - git-commit
  - git-pr
  - git-release
  - git-board
  - 슬래시
  - 템플릿
  - template
  - 의존관계
  - ID체계
  - REQ
  - FEAT
  - SCR
  - API
  - TC
  - FLOW
  - EDGE
- path: docs/reference/doc-conventions.md
  title: 문서 작성 규약
  summary: 이 저장소의 docs/ 문서가 지켜야 하는 YAML 프론트매터 7개 필드의 의미와 작성 기준, 카테고리 3종의 경계, 새 문서를 추가할 때 INDEX.md 를 함께 갱신하는 절차, 그리고 AI 가 문서를
    찾는 탐색 순서를 정의한다.
  keywords:
  - 규약
  - convention
  - frontmatter
  - 프론트매터
  - YAML
  - id
  - title
  - category
  - summary
  - keywords
  - related_files
  - last_updated
  - INDEX
  - 문서추가
  - 라우팅
- path: docs/reference/issue-workflow-internals.md
  title: 이슈 워크플로우 내부 규약
  summary: issue-* 스킬군의 상태 파일이 홈과 저장소 어디에 사는지, .gitignore 블록이 왜 증거만 뚫어 두는지, 워크트리 배치 두 가지, 브랜치 이름 규칙, 성격·진행 상태 라벨 두 축, 기본 브랜치
    판별 순서, 그리고 증상별 트러블슈팅 표.
  keywords:
  - settings.json
  - .issue
  - 워크트리
  - worktree
  - sibling
  - children
  - gitignore
  - 브랜치명
  - slug
  - prefix
  - 라벨
  - label
  - status
  - detectBase
  - 기본브랜치
  - 트러블슈팅
  - exit4
- path: docs/reference/source-map.md
  title: 원본 자산 지도와 자주 묻는 질문
  summary: 실제로 설치되는 원본(install.sh·commands·skills·hooks)이 어느 경로에 있고 무엇을 담는지 정리한 목록과, 자주 묻는 질문별로 열어야 할 docs 문서를 짝지은 표.
  keywords:
  - 원본
  - 자산
  - assets
  - 소스
  - 경로
  - install.sh
  - commands
  - skills
  - hooks
  - git-convention
  - 템플릿
  - 어디서 고치나
  - 자주 묻는 질문
  - FAQ
  - 바로가기
- path: docs/setup/install.md
  title: 설치와 세팅
  summary: 새 컴퓨터나 다른 저장소에 커맨드·스킬을 세팅하는 방법. install.sh 의 옵션 전체, 무엇이 어디로 복사되는지의 매핑표, 링크와 복사의 차이, 설치 후 검증 명령, 원본 동기화 방법을 담는다.
  keywords:
  - 설치
  - install
  - install.sh
  - 세팅
  - 심볼릭링크
  - symlink
  - copy
  - codex
  - 볼트
  - obsidian
  - 설치확인
  - 동기화
  - rsync
  - 새컴퓨터
- path: docs/setup/prerequisites.md
  title: 전제 조건
  summary: claude-setup 설치 전에 시스템에 있어야 하는 것(git·rsync·Node 18+·gh·python3)과 작업할 프로젝트 쪽에 있어야 하는 것(Playwright·webp 변환기)을 구분해
    정리한다. 무엇이 없으면 무엇이 막히는지까지 명시한다.
  keywords:
  - 전제조건
  - prerequisites
  - git
  - node
  - python3
  - gh
  - github cli
  - playwright
  - webp
  - cwebp
  - ffmpeg
  - sharp
  - 설치확인
- path: docs/workflows/git-workflow.md
  title: Git 커밋·PR·릴리스 워크플로우
  summary: 커밋은 git-commit, PR 은 git-pr, 배포 릴리스 노트는 git-release 스킬이 같은 TYPE(scope) 규칙으로 만든다. 제목은 PM 이 읽고 본문(Why·How·Refs·Related·Author)은
    개발자·AI 가 추적한다. git-convention 훅이 Claude 가 만든 커밋·PR 형식을 점검하고 배포를 감지하면 릴리스 노트를 제안한다. git-board 는 저장소에 연결된 GitHub Project
    보드를 요약한다.
  keywords:
  - git-commit
  - git-pr
  - git-release
  - git-board
  - git-convention
  - 커밋
  - commit
  - PR
  - 풀리퀘스트
  - 릴리스
  - release
  - 릴리스노트
  - CHANGELOG
  - 컨벤션
  - convention
  - TYPE
  - scope
  - FEAT
  - UX
  - FIX
  - PERF
  - CONTENT
  - DOCS
  - REFACTOR
  - TEST
  - CHORE
  - REVERT
  - Why
  - How
  - Refs
  - 훅
  - hook
  - 보드
  - project
- path: docs/workflows/issue-workflow.md
  title: 이슈 → 워크트리 → 증거 → PR 워크플로우
  summary: GitHub 이슈를 먼저 등록하고, 이슈당 워크트리 하나에서 구현하고, before/after 증거를 webp 로 남겨 이슈에 코멘트하고, PR 을 만들고, 여러 워크트리를 순서대로 누적 검증하며 통합하는
    4단계 파이프라인의 사용법. 각 스킬이 무엇을 자동으로 하고 어디서 승인을 받는지 정리한다.
  keywords:
  - issue-create
  - issue-start
  - issue-end
  - issue-merge
  - 이슈
  - 워크트리
  - worktree
  - 증거
  - evidence
  - PR
  - 풀리퀘스트
  - gh
  - 통합
  - merge
  - before after
  - webp
  - 캡처
- path: docs/workflows/obsidian-workflow.md
  title: Obsidian 볼트 관리 워크플로우
  summary: 볼트의 00_Sandbox 에 쌓인 노트를 frontmatter 정규화 → 내용 기반 폴더 이동 → 인덱스 갱신 순서로 정리하는 커맨드 7종 사용법. 인덱스 파일명에 왜 언더스코어를 붙이는지, 목록
    섹션만 자동 갱신되는 이유 같은 함정도 담는다.
  keywords:
  - obsidian
  - 볼트
  - vault
  - obsidian-init
  - obsidian-format
  - obsidian-move
  - obsidian-index
  - obsidian-organize
  - obsidian-preview
  - obsidian-categories
  - frontmatter
  - 인덱스
  - wikilink
  - 정렬
  - 이모지
  - 템플릿
- path: docs/workflows/project-docs-workflow.md
  title: docs/ 기반 프로젝트 협업 워크플로우
  summary: /project-docs 로 docs/ 골격을 만들고, /project-docs-gen 으로 기획서를 개발 문서 10종으로 펼친 뒤, project-workflow 의 8개 서브모드(feedback·issues·dev·design·review·sync·status·classify)를
    자연어로 불러 협업하는 전체 사용법. 새 프로젝트·기존 프로젝트·일상 협업 세 가지 진입 시나리오를 포함한다.
  keywords:
  - project-docs
  - project-docs-gen
  - project-workflow
  - 피드백
  - feedback
  - 이슈
  - issues
  - 개발
  - dev
  - 디자인
  - design
  - 리뷰
  - review
  - 동기화
  - sync
  - 상태
  - status
  - 분류
  - classify
  - inbox
  - CONVENTIONS
  - CHANGELOG
  - docs구조
- path: docs/workflows/work-workspace-workflow.md
  title: Work 작업공간 세팅과 실시간 뷰어 (work-viewer 저장소 안내)
  summary: 작업 폴더를 Projects 중심 + README·INDEX·AGENTS·docs 구조로 세팅하는 work-setup 스킬과 Work 뷰어는 이 저장소가 아니라 gyeolhwi/work-viewer
    에서 관리한다. clone·설치 명령, 스킬 갱신 방법, 상세 문서 위치를 안내한다.
  keywords:
  - work-setup
  - Work
  - 작업공간
  - workspace
  - 뷰어
  - viewer
  - work-viewer
  - 실시간
  - 아이패드
  - Projects
  - docs-tidy
  - 설치
  - install.sh --skills
  - bun
  - 새컴퓨터
  - 서버
```
