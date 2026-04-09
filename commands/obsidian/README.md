# Obsidian 볼트 관리 커맨드

> 볼트 경로: 각 커맨드 파일의 `{{OBSIDIAN_VAULT_PATH}}`를 자신의 볼트 경로로 치환하여 사용

## 커맨드 목록

| 커맨드 | 설명 |
|--------|------|
| `/obsidian-classify` | 분류 계획 출력 (읽기 전용) |
| `/obsidian-format [경로]` | YAML frontmatter 정규화 |
| `/obsidian-move` | 내용 기반 파일 이동 |
| `/obsidian-index [폴더]` | 인덱스 파일 갱신 |
| `/obsidian-organize` | 전체 정리 마스터 커맨드 |

---

## `/obsidian-classify` — 분류 계획 출력 (읽기 전용)

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

## 볼트 폴더 구조

```
10_Dev/
  ├── Backend / Frontend / Server / DevOps
  ├── Architecture / Standards / Ai / Design
20_Personal/
  └── 서재/
30_Tools/
40_Gaming/
50_Recipes/
99_Archive/
```

## 설치

```bash
cp obsidian-*.md ~/.claude/commands/
```
