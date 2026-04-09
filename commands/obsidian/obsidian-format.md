# /obsidian-format — YAML frontmatter 정규화

Obsidian 문서의 YAML frontmatter를 정규화하고 description 필드를 추가합니다.

- 인수 없음: `00_Sandbox/*.md` 전체 처리
- 인수 있음: 해당 파일 또는 폴더 경로 처리 (예: `Dev/Backend/MySQL.md`)

**볼트:** `{{OBSIDIAN_VAULT_PATH}}`

> 경로가 `{{OBSIDIAN_VAULT_PATH}}`이면 사용자에게 볼트 경로를 물어본 후 진행한다. 실제 경로가 입력되어 있으면 그대로 사용한다.

## 카테고리 설정
`/obsidian-categories.md` 파일의 **부모 인덱스 링크**, **표준 태그 어휘** 섹션을 참조한다.

---

## 적용할 frontmatter 스키마

```yaml
---
status: done          # 단일값: done | wip | seed | hold | reference | wiki
tags:
  - tag1              # 소문자, 2~5개
  - tag2
description: "..."    # 한 줄 요약 — AI 검색 및 Obsidian 호버 미리보기용
created: YYYY-MM-DD
updated: YYYY-MM-DD
---
```

---

## 각 파일에 대해 순서대로 수행

### 1. YAML 정규화
- `status`가 리스트 형식(`- done`)이면 단일값 `done`으로 변환
- `tags`가 인라인 배열 형식(`[tag1, tag2]`)이면 YAML block 형식으로 변환
- `tags`가 없거나 비어 있으면 파일명과 내용 기반으로 2~4개 생성 — **아래 어휘 목록에서 우선 선택**
- `created`가 없으면 `updated` 값으로 채운다
- `updated`를 오늘 날짜로 갱신

#### 표준 태그 어휘 목록

`/obsidian-categories.md`의 **표준 태그 어휘** 섹션을 참조한다.
목록에 없는 개념은 소문자 하이픈 형식으로 새로 만든다 (예: `react-query`).

### 2. description 추가 (없는 경우)
아래 우선순위로 결정한다:
1. frontmatter 아래 첫 번째 blockquote (`> 텍스트`) 내용
2. H1 또는 H2 제목 + 첫 단락 핵심 문장
3. 파일명과 내용을 보고 50자 내외로 직접 작성

### 3. 부모 인덱스 wikilink 확인
frontmatter 바로 다음 첫 줄이 `> 📂 [[...]]` 형식인지 확인한다.
없고, 파일 위치가 카테고리 폴더에 해당하면 추가한다.
매핑은 `/obsidian-categories.md`의 **부모 인덱스 링크** 섹션을 참조한다.

### 4. 파일 저장
- 본문 내용은 수정하지 않는다 (YAML + 부모 링크 줄만 수정)
- 수정된 파일 목록과 변경 사항을 출력한다
