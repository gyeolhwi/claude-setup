---
id: workflows-obsidian-workflow
title: Obsidian 볼트 관리 워크플로우
category: workflows
summary: 볼트의 00_Sandbox 에 쌓인 노트를 frontmatter 정규화 → 내용 기반 폴더 이동 → 인덱스 갱신 순서로 정리하는 커맨드 7종 사용법. 인덱스 파일명에 왜 언더스코어를 붙이는지, 목록 섹션만 자동 갱신되는 이유 같은 함정도 담는다.
keywords: [obsidian, 볼트, vault, obsidian-init, obsidian-format, obsidian-move, obsidian-index, obsidian-organize, obsidian-preview, obsidian-categories, frontmatter, 인덱스, wikilink, 정렬, 이모지, 템플릿]
related_files:
  - commands/obsidian/
  - commands/obsidian/templates/
last_updated: 2026-08-27
---

# Obsidian 볼트 관리 워크플로우

볼트 경로는 설치 시 `{{OBSIDIAN_VAULT_PATH}}` 가 치환된다. [setup/install.md](../setup/install.md) 참고.

## 사용 흐름

```text
초기 1회:  /obsidian-init       볼트 경로 + 카테고리 세팅 + 폴더/인덱스 생성
일상:      00_Sandbox 에 파일 넣기 → /obsidian-organize
확인:      /obsidian-preview    실행 전 미리보기 (읽기 전용)
개별:      /obsidian-format · /obsidian-move · /obsidian-index
```

## 커맨드 7종

| 커맨드 | 설명 |
| --- | --- |
| `/obsidian-init` | 초기 세팅 — 볼트 경로 입력, 카테고리 확인·커스텀, 폴더 생성, 인덱스 생성, 커맨드 경로 치환 |
| `/obsidian-preview` | 분류·변환 미리보기. **파일을 수정하지 않는다** |
| `/obsidian-format [경로]` | YAML frontmatter 정규화 |
| `/obsidian-move` | 내용 기반 폴더 이동 |
| `/obsidian-index [폴더]` | 인덱스 파일 갱신 |
| `/obsidian-organize` | format → move → index 를 한 번에 |
| `/obsidian-categories` | 카테고리 설정 — 다른 커맨드가 참조하는 정의 파일 |

### `/obsidian-format` — frontmatter 정규화

인수 없으면 `00_Sandbox/*.md` 전체, 있으면 지정 파일·폴더만 처리한다.

- `status` 단일값 정규화 (`done` / `wip` / `seed` / `hold` / `reference` / `wiki` / `todo` / `rfc`)
- `tags` 표준 어휘 기반 보완
- `client` — 업무·클라이언트 노트 소속 표시 (개인 노트는 생략)
- `description` — AI 검색용 한 줄 요약
- 부모 인덱스 wikilink 확인 및 추가

### `/obsidian-move` — 내용 기반 분류 이동

파일 내용을 읽고 올바른 폴더로 옮긴다. 파일명 이모지 추가, assets 이동,
**볼트 전체 wikilink 자동 업데이트**까지 함께 처리한다.

### `/obsidian-index` — 인덱스 갱신

인수 없으면 볼트 전체, 있으면 해당 폴더만 (`/obsidian-index 10_Dev/Backend`).
인덱스가 없는 폴더는 템플릿으로 새로 만든다.

---

## 함정 둘

### 섹션 규약 — 자동 갱신은 목록 섹션만

| 섹션 | 자동 갱신 |
| --- | --- |
| `## 📑 목록` | ✅ 새 문서가 **여기에만** 추가된다. 모든 인덱스에 필수 |
| `## 📂 카테고리` · `## 🏢 회사 카드` · `## 🔗 관련 링크` 등 | ❌ 수동 큐레이션 |

중복 검사는 **인덱스 본문 전체**를 스캔한다. `## 📑 목록` 안만 보면 다른 섹션에 이미 링크된 문서를
미등록으로 오판해 중복 추가하게 된다.

### 인덱스 파일명은 `_` 접두사

인덱스는 `_` 를 붙여 파일 탐색기에서 폴더 맨 위에 고정한다 (`_💼 Work 인덱스.md`).

- Obsidian(ICU 콜레이션)은 **이모지를 숫자보다 먼저** 정렬한다. 파일명이 이모지로 시작하는 볼트에서는
  `00_` 같은 숫자 접두사가 오히려 **맨 아래**로 간다. `_` 만이 이모지 앞에 온다.
- 같은 폴더에 인덱스가 여러 개면 허브에 `__` 를 붙여 한 단계 더 올린다.
- **wikilink 는 `_` 를 포함한 실제 파일명으로 쓴다.** `aliases` 로 `_` 없는 이름을 만들어 링크하면,
  alias 해석 실패 시 미해결 링크가 유령 노드로 떠서 **같은 인덱스가 그래프뷰에 두 개로 겹친다.**

---

## 템플릿

`commands/obsidian/templates/` 의 10종이 설치 시 `<볼트>/01_문서템플릿/` 으로 배치된다.
`00_템플릿_사용규칙.md` 가 frontmatter·구조·인덱스 규칙의 정본이다.

```text
00_템플릿_사용규칙.md   TPL_공용.md      TPL_인덱스.md    TPL_기술가이드.md   TPL_배포매뉴얼.md
TPL_아키텍처.md         TPL_컨벤션.md    TPL_AI프롬프트.md  TPL_개인노트.md     TPL_감상기록.md
```

**볼트 안이 정본이다.** 볼트에서 고쳤으면 저장소로 되돌려 맞춘다.
