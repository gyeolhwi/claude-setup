# claude-setup — 문서 색인

**AI 는 이 파일을 가장 먼저 읽는다.** 아래 `summary` 와 `keywords` 로 후보 문서를 고른 다음,
그 문서만 열어서 읽는다. 전체를 훑지 않는다.

사람용 진입점은 [README.md](./README.md) 다.

## 이 저장소는 무엇인가

Claude Code 용 커스텀 커맨드·스킬 모음. `./install.sh` 한 번으로 새 환경에 세팅된다.
워크플로우는 셋이다 — **docs/ 기반 프로젝트 협업**, **이슈→워크트리→PR**, **Obsidian 볼트 관리**.

## 문서

```yaml
docs:
  - path: docs/setup/prerequisites.md
    title: 전제 조건
    category: setup
    summary: >
      claude-setup 설치 전에 시스템에 있어야 하는 것(git·rsync·Node 18+·gh)과
      작업할 프로젝트 쪽에 있어야 하는 것(Playwright·webp 변환기)을 구분해 정리한다.
      무엇이 없으면 무엇이 막히는지까지 명시한다.
    keywords: [전제조건, prerequisites, git, node, gh, github cli, playwright, webp, cwebp, ffmpeg, sharp, 설치확인]

  - path: docs/setup/install.md
    title: 설치와 세팅
    category: setup
    summary: >
      새 컴퓨터나 다른 저장소에 커맨드·스킬을 세팅하는 방법. install.sh 의 옵션 전체,
      무엇이 어디로 복사되는지의 매핑표, 링크와 복사의 차이, 설치 후 검증 명령, 원본 동기화 방법.
    keywords: [설치, install, install.sh, 세팅, 심볼릭링크, symlink, copy, codex, 볼트, obsidian, 설치확인, 동기화, rsync, 새컴퓨터]

  - path: docs/workflows/project-docs-workflow.md
    title: docs/ 기반 프로젝트 협업 워크플로우
    category: workflows
    summary: >
      /project-docs 로 docs/ 골격을 만들고, /project-docs-gen 으로 기획서를 개발 문서 10종으로 펼친 뒤,
      project-workflow 의 8개 서브모드(feedback·issues·dev·design·review·sync·status·classify)를
      자연어로 불러 협업하는 전체 사용법. 새 프로젝트·기존 프로젝트·일상 협업 세 진입 시나리오 포함.
    keywords: [project-docs, project-docs-gen, project-workflow, 피드백, feedback, 이슈, issues, 개발, dev,
               디자인, design, 리뷰, review, 동기화, sync, 상태, status, 분류, classify, inbox, CONVENTIONS, CHANGELOG, docs구조]

  - path: docs/workflows/issue-workflow.md
    title: 이슈 → 워크트리 → 증거 → PR 워크플로우
    category: workflows
    summary: >
      GitHub 이슈를 먼저 등록하고, 이슈당 워크트리 하나에서 구현하고, before/after 증거를 webp 로 남겨
      이슈에 코멘트하고, PR 을 만들고, 여러 워크트리를 순서대로 누적 검증하며 통합하는 4단계 파이프라인 사용법.
    keywords: [issue-create, issue-start, issue-end, issue-merge, 이슈, 워크트리, worktree, 증거, evidence,
               PR, 풀리퀘스트, gh, 통합, merge, before after, webp, 캡처]

  - path: docs/workflows/obsidian-workflow.md
    title: Obsidian 볼트 관리 워크플로우
    category: workflows
    summary: >
      볼트의 00_Sandbox 에 쌓인 노트를 frontmatter 정규화 → 내용 기반 폴더 이동 → 인덱스 갱신 순서로
      정리하는 커맨드 7종 사용법. 인덱스 파일명 언더스코어 규칙, 목록 섹션만 자동 갱신되는 이유 같은 함정 포함.
    keywords: [obsidian, 볼트, vault, obsidian-init, obsidian-format, obsidian-move, obsidian-index,
               obsidian-organize, obsidian-preview, obsidian-categories, frontmatter, 인덱스, wikilink, 정렬, 이모지, 템플릿]

  - path: docs/workflows/git-workflow.md
    title: Git 커밋·PR 워크플로우
    category: workflows
    summary: >
      staged diff 를 변경 목적별로 그룹화해 자동 커밋하는 /commit-auto 의 동작 방식과 커밋 타입 12종 컨벤션,
      변경사항·커밋 히스토리를 요약해 한국어 PR 본문을 만드는 create-pr 스킬 사용법.
    keywords: [commit-auto, 커밋, commit, 컨벤션, convention, FEAT, FIX, REFACTOR, CHORE,
               create-pr, PR, 풀리퀘스트, staged, diff, 그룹화]

  - path: docs/workflows/work-workspace-workflow.md
    title: Work 작업공간 세팅과 실시간 뷰어
    category: workflows
    summary: >
      컴퓨터·서버의 작업 폴더를 Projects 중심 + README·INDEX·AGENTS·docs 구조로 세팅하는 work-setup 스킬 사용 순서와,
      폴더·문서·바뀐 파일·herdr 에이전트 상태를 아이패드에서 실시간으로 보는 Work 뷰어의 설치·원격 접속·운영 명령.
    keywords: [work-setup, Work, 작업공간, workspace, 뷰어, viewer, 실시간, 모니터링, 아이패드, Projects, README, INDEX,
               AGENTS, herdr, tailscale, bun, systemd, launchd, 새컴퓨터, 서버]

  - path: docs/reference/catalog.md
    title: 커맨드·스킬 카탈로그
    category: reference
    summary: >
      이 저장소가 제공하는 슬래시 커맨드 11개와 스킬 8개의 전체 목록. 호출 방식(슬래시/자연어), 원본 파일 경로,
      설치 위치, 관련 워크플로우 문서를 한 표에서 찾을 수 있다. project-docs-gen 템플릿 10종의 의존 관계 포함.
    keywords: [카탈로그, catalog, 목록, 커맨드, command, 스킬, skill, 슬래시, 템플릿, template,
               의존관계, ID체계, REQ, FEAT, SCR, API, TC, FLOW, EDGE]

  - path: docs/reference/issue-workflow-internals.md
    title: 이슈 워크플로우 내부 규약
    category: reference
    summary: >
      issue-* 스킬군의 상태 파일이 홈과 저장소 어디에 사는지, .gitignore 블록이 왜 증거만 뚫어 두는지,
      워크트리 배치 두 가지, 브랜치 이름 규칙, 성격·진행 상태 라벨 두 축, 기본 브랜치 판별 순서,
      증상별 트러블슈팅 표.
    keywords: [settings.json, .issue, 워크트리, worktree, sibling, children, gitignore, 브랜치명, slug,
               prefix, 라벨, label, status, detectBase, 기본브랜치, 트러블슈팅, exit4]

  - path: docs/reference/doc-conventions.md
    title: 문서 작성 규약
    category: reference
    summary: >
      이 저장소의 docs/ 문서가 지켜야 하는 YAML 프론트매터 7개 필드의 의미와 작성 기준, 카테고리 3종의 경계,
      새 문서를 추가할 때 INDEX.md 를 함께 갱신하는 절차, AI 가 문서를 찾는 탐색 순서.
    keywords: [규약, convention, frontmatter, 프론트매터, YAML, id, title, category, summary, keywords,
               related_files, last_updated, INDEX, 문서추가, 라우팅]
```

## 원본 자산

문서가 아니라 **실제로 설치되는 것들**이다. 동작을 고치려면 여기를 고친다.

```yaml
assets:
  - path: install.sh
    title: 설치 스크립트
    summary: 전제 조건 점검 후 커맨드·스킬을 ~/.claude 또는 지정 저장소에 링크·복사한다. Obsidian 볼트 경로 치환과 템플릿 배치까지.
    keywords: [install, 설치, check, copy, link, codex, project, obsidian]

  - path: commands/git/
    title: Git 커맨드 원본
    summary: /commit-auto 정의.
    keywords: [commit-auto, 커밋]

  - path: commands/project/
    title: 프로젝트 커맨드 원본
    summary: /project-docs, /project-docs-gen, project-workflow(서브모드 8종) 정의.
    keywords: [project-docs, project-docs-gen, project-workflow, docs, 협업]

  - path: commands/obsidian/
    title: Obsidian 커맨드 원본
    summary: obsidian-* 커맨드 7종과 볼트 문서 템플릿 10종({{OBSIDIAN_VAULT_PATH}} 치환 대상).
    keywords: [obsidian, 볼트, 템플릿, TPL]

  - path: skills/issue-create/ · issue-start/ · issue-end/ · issue-merge/ · gh-setup/
    title: 이슈 워크플로우 스킬
    summary: SKILL.md + references/(단계별 절차) + scripts/(Node 표준 모듈만 쓰는 .mjs).
    keywords: [issue, 워크트리, 증거, PR, gh, 스킬]

  - path: skills/create-pr/
    title: PR 생성 스킬
    summary: 한국어 PR 본문 작성. AI 생성 문구를 넣지 않는다.
    keywords: [create-pr, PR, 풀리퀘스트]

  - path: skills/work-setup/
    title: Work 작업공간 세팅 스킬 + 뷰어
    summary: SKILL.md(세팅 절차) + references/format.md(문서·INDEX 형식) + viewer/(Bun 서버·화면·install.sh).
    keywords: [work-setup, 작업공간, 뷰어, viewer, install, bun]

  - path: skills/omc-learned/project-docs-gen/
    title: 개발 문서 템플릿 10종
    summary: /project-docs-gen 이 읽는 요구사항·기술스택·역할·정보구조·기능명세·ERD·API·플로우차트·와이어프레임·시나리오 템플릿.
    keywords: [템플릿, requirements, tech-stack, roles, sitemap, features, erd, api, flowchart, wireframe, scenarios]
```

## 자주 묻는 것 → 갈 곳

| 질문 | 문서 |
| --- | --- |
| 새 컴퓨터에 어떻게 깔지 | `docs/setup/install.md` |
| 뭐가 있는지 전체 목록 | `docs/reference/catalog.md` |
| "개발 시작해줘" 같은 걸 어떻게 쓰는지 | `docs/workflows/project-docs-workflow.md` |
| 이슈 만들고 PR 까지 어떻게 가는지 | `docs/workflows/issue-workflow.md` |
| 워크트리·라벨·브랜치명 규칙 | `docs/reference/issue-workflow-internals.md` |
| 뭔가 안 될 때 | `docs/reference/issue-workflow-internals.md#트러블슈팅` |
| 문서를 새로 추가할 때 | `docs/reference/doc-conventions.md` |
