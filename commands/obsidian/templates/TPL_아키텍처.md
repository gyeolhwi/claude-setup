---
status: reference
tags:
  - template
  - architecture
description: "아키텍처/설계 문서 템플릿 — Dev/Architecture 폴더에 사용"
created: 2026-02-20
updated: 2026-03-21
---
> 📂 [[00_템플릿_사용규칙]]

# 🏗️ TPL_아키텍처

> 10_Dev/Architecture에 사용

---

## 적용 대상

아키텍처 패턴, 시스템 설계, 프로젝트 폴더 구조 등 **구조적 의사결정**을 기록할 때 사용합니다.

---

## 템플릿

```markdown
---
status: done
tags:
  - architecture
  - 세부주제
description: "한 줄 요약 — 어떤 아키텍처/설계인지"
created: YYYY-MM-DD
updated: YYYY-MM-DD
---
> 📂 [[_Architecture 인덱스]]

# [이모지] 제목

---

## 배경

왜 이 설계가 필요한지, 어떤 문제를 해결하는지

---

## 구조 개요

전체 구조 설명 (다이어그램, 폴더 구조 등)

```
프로젝트/
├── src/
│   ├── 레이어1/
│   └── 레이어2/
└── ...
```

---

## 핵심 구성 요소

### [구성 요소 1]

- 역할과 책임

### [구성 요소 2]

- 역할과 책임

---

## 관련 링크

- [[관련 문서]]
```

---

## 작성 팁

- 실제 프로젝트 코드 예시를 넣으면 나중에 참고하기 좋음
- "왜 이렇게 설계했는지" 이유를 꼭 적어두기 — 미래의 내가 고마워함
