# /obsidian-init — 볼트 초기 세팅

Obsidian 볼트를 초기 세팅한다. **최초 1회만 실행한다.**

---

## 실행 순서

### 1. 볼트 경로 확인

사용자에게 Obsidian 볼트 경로를 물어본다.
경로를 받으면 해당 경로가 실제로 존재하는지 확인한다.

### 2. 카테고리 설정 확인

`/obsidian-categories.md`의 **폴더 구조** 섹션을 사용자에게 보여주고 확인한다:

- 기본 구조를 그대로 사용할지
- 카테고리를 추가/삭제/변경할지

사용자가 변경을 원하면 `/obsidian-categories.md` 파일을 수정한다.
변경 시 **번호 접두사 체계(10_, 20_, ...)를 반드시 유지**한다.

### 3. 볼트에 폴더 생성

`/obsidian-categories.md`의 폴더 구조에 따라 볼트에 폴더를 생성한다.
이미 존재하는 폴더는 건너뛴다.

필수 폴더:
- `00_Sandbox/` — 미분류 파일 보관
- `Clippings/` — 웹 클리핑 (없으면 생략 가능)
- `99_Archive/` — 임시 보관

### 4. 인덱스 파일 생성

`/obsidian-categories.md`의 **인덱스 파일 매핑**에 따라 각 폴더에 인덱스 파일을 생성한다.
이미 존재하는 인덱스 파일은 건너뛴다.

인덱스 파일 템플릿:

```markdown
---
status: reference
tags:
  - index
description: "카테고리 허브 — 하위 문서 목록"
created: YYYY-MM-DD
updated: YYYY-MM-DD
---

# [인덱스 파일명]

> 이 카테고리에 속한 문서 목록

---

## 📑 목록

```

### 5. 기본 템플릿 생성

`~/.claude/commands/templates/` 폴더에 기본 문서 템플릿을 생성한다.
레포의 `commands/obsidian/templates/` 파일들을 복사한다.

### 6. 커맨드 파일 경로 치환

`~/.claude/commands/` 내의 obsidian 커맨드 파일들에서
`{{OBSIDIAN_VAULT_PATH}}`를 입력받은 볼트 경로로 치환한다.

대상 파일:
- `obsidian-preview.md`
- `obsidian-format.md`
- `obsidian-move.md`
- `obsidian-index.md`
- `obsidian-organize.md`

### 7. 완료 출력

```
✅ 볼트 경로: /path/to/vault
✅ 생성된 폴더: N개
✅ 생성된 인덱스: N개
✅ 커맨드 경로 치환 완료

사용법:
  파일을 00_Sandbox/에 넣고 /obsidian-organize 실행
  미리보기: /obsidian-preview
```
