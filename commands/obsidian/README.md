# Obsidian 볼트 관리 커맨드

> 볼트 경로: 각 커맨드 파일의 `{{OBSIDIAN_VAULT_PATH}}`를 자신의 볼트 경로로 치환하여 사용

## 사용 흐름

```
초기 1회:  /obsidian-init → 볼트 경로 + 카테고리 세팅 + 폴더/인덱스 생성
일상:     00_Sandbox에 파일 넣기 → /obsidian-organize
확인:     /obsidian-preview (실행 전 미리보기)
개별:     /obsidian-format, /obsidian-move, /obsidian-index (필요 시)
```

## 커맨드 목록

| 커맨드 | 설명 |
|--------|------|
| `/obsidian-init` | 초기 세팅 (볼트 경로, 카테고리, 폴더/인덱스 생성) |
| `/obsidian-preview` | 분류/변환 미리보기 (읽기 전용) |
| `/obsidian-format [경로]` | YAML frontmatter 정규화 |
| `/obsidian-move` | 내용 기반 파일 분류 이동 |
| `/obsidian-index [폴더]` | 인덱스 파일 갱신 |
| `/obsidian-organize` | format → move → index 전체 정리 |
| `/obsidian-categories` | 카테고리 설정 (다른 커맨드가 참조) |

---

## `/obsidian-init` — 초기 세팅 (1회)

볼트 경로 입력, 카테고리 구조 확인/커스텀, 폴더 생성, 인덱스 파일 생성, 커맨드 경로 치환까지 한 번에 처리합니다.

---

## `/obsidian-preview` — 분류/변환 미리보기 (읽기 전용)

`00_Sandbox`, `Clippings` 파일들을 분석해 어느 폴더로 이동할지 표로 출력합니다.
**파일을 직접 수정하지 않습니다.**

---

## `/obsidian-format [경로]` — YAML frontmatter 정규화

- 인수 없음: `00_Sandbox/*.md` 전체 처리
- 인수 있음: 지정 파일/폴더 처리

처리 내용:
- `status` 단일값 정규화
- `tags` 표준 어휘 기반 보완
- `description` 필드 추가 (AI 검색용 한 줄 요약)
- 부모 인덱스 wikilink 확인 및 추가

---

## `/obsidian-move` — 내용 기반 분류 이동

파일 내용을 읽고 분류 기준에 따라 올바른 폴더로 이동합니다.
파일명 이모지 추가, assets 이동, 볼트 전체 wikilink 자동 업데이트까지 처리합니다.

---

## `/obsidian-index [폴더]` — 인덱스 파일 갱신

- 인수 없음: 볼트 전체 인덱스 파일 검사
- 인수 있음: 해당 폴더만 처리 (예: `/obsidian-index 10_Dev/Backend`)

인덱스 파일이 없는 폴더는 템플릿으로 새로 생성합니다.

---

## `/obsidian-organize` — 전체 정리 마스터 커맨드

`/obsidian-format` → `/obsidian-move` → `/obsidian-index` 순서로 한 번에 실행합니다.

---

## `/obsidian-categories` — 카테고리 설정

폴더 구조, 분류 기준, 인덱스 매핑, 태그 어휘 등을 정의합니다.
`/obsidian-init`이 기본값으로 생성하며, 사용자가 자유롭게 수정할 수 있습니다.

