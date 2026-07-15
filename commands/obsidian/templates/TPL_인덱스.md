---
status: reference
tags:
  - template
  - index
description: "인덱스/허브 파일 템플릿 — 각 폴더의 진입점"
created: 2026-02-20
updated: 2026-03-21
---
> 📂 [[00_템플릿_사용규칙]]

# 📑 TPL_인덱스

> 각 폴더의 허브 파일. Graph View에서 허브 노드 역할을 합니다.

---

## 템플릿

```markdown
---
status: reference
tags:
  - 카테고리명
description: "이 카테고리에 속한 문서들의 허브"
created: YYYY-MM-DD
updated: YYYY-MM-DD
---
> 📂 [[상위 인덱스]]

# [이모지] 카테고리 인덱스

---

## 📑 목록

- [[문서 1]]
- [[문서 2]]
- [[문서 3]]
```

---

## 작성 규칙

1. 각 폴더에 **반드시 1개** 존재
2. 새 문서 추가할 때마다 목록에 `[[파일명]]` 추가
3. `status: reference` 고정 — 변경하지 않음
4. `/doc-index` 커맨드로 자동 갱신 가능
