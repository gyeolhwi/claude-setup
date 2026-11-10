# 작업공간 문서 형식

work-setup이 만드는 `docs/` 문서와 루트 `INDEX.md`의 형식이다.

## docs 문서: 머리말 7개

`docs/**/*.md`는 첫 줄부터 `---`로 감싼 YAML 머리말로 시작한다.

```yaml
---
id: guide-workspace-layout
title: Work 폴더 구조·프로젝트는 Projects 아래 폴더 하나
category: guide
summary: 작업 폴더의 최상위 폴더가 각각 무엇인지와 모든 일을 Projects/<이름> 폴더 하나로 다루는 규칙을 설명한다
keywords: [Work, 폴더 구조, Projects, 프로젝트, docs, README, INDEX]
related_files:
  - README.md
last_updated: "2026-11-10"
---
```

| 필드 | 규칙 |
| --- | --- |
| `id` | `{category}-{주제}`. 소문자 영문·숫자 kebab-case. 작업공간 안에서 유일 |
| `title` | 찾을 때 쓸 핵심 단어를 앞에 둔 제목. 본문 `#` 제목과 같게 |
| `category` | `docs/` 바로 아래 폴더명과 같게 (`guide` · `ops`, 필요하면 `spec`) |
| `summary` | 무엇을 어떻게 설명하는지 구체적인 한 줄. 동어반복·홍보 문구 금지 |
| `keywords` | 실제로 칠 법한 검색어 배열. 한글·영문·명령어 섞어서. 빈 배열 금지 |
| `related_files` | 이 문서가 설명하는 실제 파일의 작업공간 상대 경로. 없으면 `[]` |
| `last_updated` | 내용을 실제로 바꾼 날 `"YYYY-MM-DD"` |

## 루트 INDEX.md

본문을 옮기지 않고 네 필드만 모은다. 머리말이 정본이다.

````markdown
# INDEX

> AI는 질문을 받으면 이 파일부터 읽고, 아래에서 맞는 문서만 연다.

```yaml
docs:
- path: docs/guide/workspace-layout.md
  title: Work 폴더 구조·프로젝트는 Projects 아래 폴더 하나
  summary: 작업 폴더의 최상위 폴더가 각각 무엇인지와 모든 일을 Projects/<이름> 폴더 하나로 다루는 규칙을 설명한다
  keywords:
  - Work
  - 폴더 구조
```
````

- `docs/**/*.md`를 경로 오름차순으로 전부 넣는다. 루트 README·AGENTS·CLAUDE·INDEX는 넣지 않는다.
- 문서를 추가·이동·삭제하면 같은 작업에서 INDEX도 고친다. 옛 경로를 남기지 않는다.
- 각 프로젝트(`Projects/<이름>/`)가 자기 `INDEX.md`를 가지면 뷰어의 "문서" 탭에 함께 나온다.
