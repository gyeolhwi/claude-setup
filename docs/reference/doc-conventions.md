---
id: reference-doc-conventions
title: 문서 작성 규약
category: reference
summary: 이 저장소의 docs/ 문서가 지켜야 하는 YAML 프론트매터 7개 필드의 의미와 작성 기준, 카테고리 3종의 경계, 새 문서를 추가할 때 INDEX.md 를 함께 갱신하는 절차, 그리고 AI 가 문서를 찾는 탐색 순서를 정의한다.
keywords: [규약, convention, frontmatter, 프론트매터, YAML, id, title, category, summary, keywords, related_files, last_updated, INDEX, 문서추가, 라우팅]
related_files:
  - INDEX.md
last_updated: 2026-11-12
---

# 문서 작성 규약

## 프론트매터 (필수)

`docs/**/*.md` 는 전부 `---` 로 감싼 YAML 프론트매터로 시작한다.

```yaml
---
id: workflows-issue-workflow
title: 이슈 → 워크트리 → 증거 → PR 워크플로우
category: workflows
summary: 무엇을 하는 문서인지 한두 문장. 제목을 풀어 쓰지 말고 안에 실제로 뭐가 있는지 적는다.
keywords: [issue-create, 워크트리, 증거, PR, merge]
related_files:
  - skills/issue-create/SKILL.md
last_updated: 2026-08-27
---
```

| 필드 | 규칙 |
| --- | --- |
| `id` | `{category}-{파일명}`(확장자 제외). 예: `docs/reference/catalog.md` → `reference-catalog`. 저장소 안에서 유일해야 한다 |
| `title` | 사람이 읽는 제목. 본문 `#` 과 같게 |
| `category` | `setup` · `workflows` · `reference` 셋 중 하나. 폴더명과 일치한다 |
| `summary` | **구체적 기능 요약.** "설치 문서" 같은 동어반복 금지. 이 문서에만 있는 것을 적는다 |
| `keywords` | 검색어 배열. 한국어·영어·커맨드명을 섞어서 넣는다. 사용자가 실제로 칠 법한 말 기준 |
| `related_files` | 이 문서가 설명하는 실제 코드·설정 파일의 저장소 상대 경로 |
| `last_updated` | `YYYY-MM-DD`. 내용을 고쳤으면 반드시 함께 고친다 |

`summary` 와 `keywords` 가 라우팅 품질을 결정한다. AI 는 [INDEX.md](../../INDEX.md) 의 이 두 필드만 보고
어느 문서를 열지 정하므로, 본문을 안 읽어도 판단이 서게 써야 한다.

## 카테고리 경계

| 카테고리 | 담는 것 | 담지 않는 것 |
| --- | --- | --- |
| `setup` | 설치·전제 조건·환경 세팅 | 설치 후의 사용법 |
| `workflows` | **어떻게 쓰는가.** 순서·호출 예시·시나리오 | 내부 구현 세부, 전체 목록 |
| `reference` | **무엇이 있는가 / 왜 이런가.** 목록·규약·내부 규칙·트러블슈팅 | 단계별 사용 절차 |

같은 주제라도 사용법과 내부 규약은 나눈다.
(예: `workflows/issue-workflow.md` ↔ `reference/issue-workflow-internals.md`)

## 새 문서를 추가할 때

1. `docs/<category>/<파일명>.md` 로 만들고 프론트매터를 채운다. `id` 는 `<category>-<파일명>` 이다.
2. **[INDEX.md](../../INDEX.md) 를 같은 커밋에서 다시 만든다.** 이걸 빠뜨리면 AI 가 문서를 못 찾는다.
   INDEX 는 프론트매터에서 생성하므로 손으로 고치지 않는다. docs-tidy 스킬의 `docs_index.py build --root .` 로 만들고 `check --root .` 로 확인한다.
3. 관련 문서에서 상대 경로로 링크를 건다.
4. 소스 파일을 함께 고쳤으면 그 문서의 `related_files` 와 `last_updated` 도 갱신한다.

## AI 탐색 순서

```text
1. INDEX.md              summary·keywords 로 후보 문서를 고른다
2. docs/<고른 문서>       필요한 것만 읽는다
3. related_files          더 깊이 필요할 때만 실제 소스로 내려간다
```

문서를 전부 읽지 않는 것이 이 구조의 목적이다. 1단계에서 후보가 안 좁혀지면
그 문서의 `summary` 나 `keywords` 가 부실한 것이므로 고친다.

## 저장소 루트 두 파일

| 파일 | 대상 | 역할 |
| --- | --- | --- |
| `INDEX.md` | AI | 라우팅 전용. 모든 문서의 path·title·summary·keywords 를 YAML 블록으로만 담는다. 값은 프론트매터 그대로이며 설명 문단을 넣지 않는다 |
| `README.md` | 사람 | 설치 방법과 기능 개요. 상세는 `docs/` 로 넘긴다 |

하위 폴더에는 `README.md` 를 두지 않는다. 내용이 `docs/` 와 갈라져 둘 다 낡기 때문이다.
