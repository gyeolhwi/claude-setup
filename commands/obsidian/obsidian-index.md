# /obsidian-index [$ARGUMENTS]

새로 추가된 문서들을 해당 폴더의 인덱스 파일에 등록합니다.

- 인수 없음: 볼트 전체 폴더의 인덱스 파일을 검사하여 누락된 문서 모두 추가
- 인수 있음: 해당 폴더만 처리 (예: `10_Dev/Backend`)

**볼트:** `/Users/gimgyeolhwi/Library/Mobile Documents/iCloud~md~obsidian/Documents/Document`

---

## 인덱스 파일 위치

| 폴더 | 인덱스 파일명 |
|------|------------|
| `10_Dev/` | `💻 개발 인덱스.md` |
| `10_Dev/Backend/` | `⚙️ Backend 인덱스.md` |
| `10_Dev/Frontend/` | `⚛️ Frontend 인덱스.md` |
| `10_Dev/Server/` | `🖥️ Server 인덱스.md` |
| `10_Dev/DevOps/` | `DevOps 인덱스.md` |
| `10_Dev/Architecture/` | `Architecture 인덱스.md` |
| `10_Dev/Design/` | `🎨 Design 인덱스.md` |
| `10_Dev/Ai/` | `🤖 Ai 인덱스.md` |
| `10_Dev/Standards/` | `📋 컨벤션 인덱스.md` |
| `20_Personal/` | `👤 프로필 인덱스.md` |
| `20_Personal/서재/` | `📖 서재 인덱스.md` |
| `30_Tools/` | `🛠️ Tools 인덱스.md` |
| `40_Gaming/` | `🎮 Gaming 인덱스.md` (없으면 생성) |
| `50_Recipes/` | `🍳 Recipes 인덱스.md` (없으면 생성) |

---

## 각 폴더에 대해 수행할 작업

1. 폴더 내 `.md` 파일 목록을 가져온다 (인덱스 파일 자신 제외)
2. 인덱스 파일의 `## 📑 목록` 섹션을 읽는다
3. 이미 등록된 wikilink `[[파일명]]`을 파악한다
4. 등록되지 않은 파일이 있으면 목록에 추가한다
   - 추가 형식: `- [[파일명]]` (확장자 없이 파일명만)
   - 인덱스 파일, `_assets/` 폴더 내 파일, `.DS_Store` 제외

---

## 인덱스 파일이 없는 경우 (Gaming, Recipes 등)

아래 템플릿으로 인덱스 파일을 새로 생성한다:

```markdown
---
status: reference
tags:
  - 카테고리명
description: "카테고리 허브 — 하위 문서 목록"
created: 2026-03-21
updated: 2026-03-21
---

> 📂 (최상위 폴더는 생략)

# [이모지] 카테고리 인덱스

> 이 카테고리에 속한 문서 목록

---

## 📑 목록

- [[문서1]]
- [[문서2]]
```

---

## 완료 후 출력

폴더별 추가된 항목 수, 생성된 인덱스 파일, 수동 확인 필요 항목을 출력한다.
