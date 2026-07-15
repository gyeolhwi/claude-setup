---
status: reference
tags:
  - template
  - convention
description: "컨벤션/표준 문서 템플릿 — Dev/Standards 폴더에 사용"
created: 2026-02-20
updated: 2026-03-21
---
> 📂 [[00_템플릿_사용규칙]]

# 📏 TPL_컨벤션

> 10_Dev/Standards에 사용

---

## 적용 대상

코딩 컨벤션, 네이밍 규칙, Git 전략 등 **내가 따르는 표준과 규칙**을 정의할 때 사용합니다.

---

## 템플릿

```markdown
---
status: reference
tags:
  - convention
  - 적용분야
description: "한 줄 요약 — 이 컨벤션의 목적"
created: YYYY-MM-DD
updated: YYYY-MM-DD
---
> 📂 [[_📋 컨벤션 인덱스]]

# [이모지] 제목

---

## 적용 범위

어디에, 언제부터 적용하는지

---

## 규칙

### [규칙 1]

설명

✅ 좋은 예시
```
좋은 코드
```

❌ 나쁜 예시
```
나쁜 코드
```

### [규칙 2]

| 항목 | 규칙 | 예시 |
|------|------|------|
| 파일명 | camelCase | `menuCard.tsx` |

---

## 관련 링크

- [[관련 문서]]
```

---

## 작성 팁

- 규칙이 많으면 처음부터 다 채우려 하지 말고, 필요할 때마다 추가
- `status: reference`로 고정 — 컨벤션은 항상 살아있는 기준 문서
