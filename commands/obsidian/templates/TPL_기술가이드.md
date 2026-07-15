---
status: reference
tags:
  - template
  - guide
description: "기술 가이드 문서 템플릿 — Dev, Tools 폴더에 사용"
created: 2026-02-20
updated: 2026-03-21
---
> 📂 [[00_템플릿_사용규칙]]

# 🔧 TPL_기술가이드

> 10_Dev (Backend, Frontend, Server, DevOps, Design), 30_Tools에 사용

---

## 적용 대상

기술 가이드, 도구 사용법, 서버 설정, 배포 절차 등 **재사용 가능한 기술 지식**을 정리할 때 사용합니다.

---

## 템플릿

```markdown
---
status: done
tags:
  - 기술분야
  - 세부기술
description: "한 줄 요약 — 이 문서가 다루는 내용"
created: YYYY-MM-DD
updated: YYYY-MM-DD
---
> 📂 [[부모 인덱스]]

# [이모지] 제목

---

## 개요

이 기술/도구가 무엇인지, 왜 쓰는지 간단히 설명

---

## [주요 섹션 1]

내용

---

## [주요 섹션 2]

내용

---

## 관련 링크

- [[관련 문서]]

---

## 참고 자료

- [공식 문서](URL)
```

---

## 작성 팁

- H1 제목은 선택 — 생략해도 파일명이 제목 역할을 함
- 섹션은 필요한 만큼만 추가, 억지로 다 채울 필요 없음
- 코드 블록에는 언어 태그 필수: ` ```java `, ` ```bash ` 등
- 이미지는 `![[파일명.png]]` Obsidian 형식 사용
