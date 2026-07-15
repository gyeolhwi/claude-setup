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

파일명은 `_` 접두사로 시작한다(폴더 맨 위 고정). **wikilink는 `_`를 포함한 실제 파일명으로 쓰고,
`aliases`는 쓰지 않는다** — alias 해석 실패 시 유령 노드가 생겨 그래프뷰에 인덱스가 두 개로 겹친다.
생성 후 `.obsidian/bookmarks.json`에도 등록한다.

같은 폴더에 인덱스가 여러 개면 허브에 `__`를 붙여 한 단계 더 위로 올린다
(예: `40_Personal/감상기록/` → 허브 `__🎞️ 감상 기록 인덱스`, 매체별 `_📖 책 인덱스`).

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
> 📂 [[_상위 폴더 인덱스]]

# [인덱스 파일명]

> 이 카테고리에 속한 문서 목록

---

## 📑 목록

```

- `> 📂` 부모 링크는 frontmatter 바로 다음 줄에, **빈 줄 없이** 넣는다.
  최상위 폴더(`10_Dev/` 등)의 인덱스는 부모가 없으므로 이 줄을 생략한다.
  매핑은 `/obsidian-categories.md`의 **부모 인덱스 링크** 참조.
- `## 📑 목록`은 **필수**다 — `/obsidian-index`가 새 문서를 넣는 자리다. 없으면 그 폴더는 갱신되지 않는다.

#### 하위 폴더가 있으면 `## 📂 카테고리` 추가

**부모 인덱스에서 하위 인덱스로 내려가는 링크가 없으면 인덱스가 막다른 길이 된다.**
하위 폴더를 가진 폴더(`10_Dev/`, `40_Personal/` 등)의 인덱스에는 `## 📑 목록` **위에**
`## 📂 카테고리` 섹션을 만들고, 각 하위 폴더의 인덱스를 링크한다.

```markdown
## 📂 카테고리

- [[_⚙️ Backend 인덱스]] - Spring Boot, Java, JWT
- [[_⚛️ Frontend 인덱스]] - React, JavaScript, CSS
- [[_🖥️ Server 인덱스]] - AWS, 배포, Linux

## 📑 목록

하위 폴더에 속하지 않는 이 폴더 직속 문서:

-
```

- 링크 뒤 설명은 `/obsidian-categories.md`의 **분류 기준** 표에서 가져온다.
- 두 섹션의 역할이 다르다 — `## 📂 카테고리`는 **하위 인덱스**(수동 관리),
  `## 📑 목록`은 **그 폴더 직속 문서**(`/obsidian-index`가 자동 관리).
- 이 링크와 하위 인덱스의 `> 📂` 부모 링크가 짝을 이뤄 양방향으로 연결된다.

#### 북마크 등록

인덱스를 사이드바 북마크 상단에 노출해 어느 폴더에 있든 바로 열 수 있게 한다.
`<볼트>/.obsidian/bookmarks.json`을 아래 형식으로 만든다 (없으면 새로 생성).

```json
{
  "items": [
    {
      "type": "file",
      "ctime": 1752000000000,
      "path": "20_Work/_💼 Work 인덱스.md",
      "title": "💼 Work"
    }
  ]
}
```

| 필드 | 설명 |
|------|------|
| `type` | `"file"` 고정 |
| `ctime` | 생성 시각 (밀리초 단위 epoch). 항목마다 달라야 순서가 안정적 |
| `path` | 볼트 루트 기준 경로 — **`_` 접두사와 `.md` 확장자 포함** |
| `title` | 사이드바 표시 이름 (선택). `_`와 "인덱스"를 뗀 이름을 쓰면 깔끔하다 |

`items` 배열 순서가 곧 사이드바 표시 순서다. Obsidian이 실행 중이면 재시작해야 반영된다.

### 5. 속성 타입 등록 (`types.json`)

**이 단계를 빠뜨리면 `client` 필드가 깨진다.** Obsidian은 `types.json`에 등록되지 않은 속성을
**Text(단일 문자열)**로 추론한다. 그러면 `client`에 회사를 여러 개 넣어도 `"우리회사 고객사A"`라는
**문자열 하나**가 되어 값이 분리되지 않고, `client contains 우리회사` 필터도 걸리지 않는다.

`<볼트>/.obsidian/types.json`을 아래처럼 만든다 (이미 있으면 `types` 안에 병합).

```json
{
  "types": {
    "aliases": "aliases",
    "cssclasses": "multitext",
    "tags": "tags",
    "status": "text",
    "client": "multitext"
  }
}
```

| 속성 | 타입 | 이유 |
|------|------|------|
| `client` | `multitext` | 얽힌 회사를 **리스트**로 넣는다. 각 값이 개별 칩으로 분리되고 필터가 걸린다 |
| `status` | `text` | 단일값이다. `multitext`로 두면 값 하나짜리 리스트로 취급된다 |

Obsidian이 실행 중이면 재시작해야 반영된다.

### 6. 기본 템플릿 복사

`<볼트>/01_문서템플릿/` 폴더를 만들고 기본 문서 템플릿을 넣는다. **볼트 안이 정본**이다.

- 이 저장소가 로컬에 있으면 `commands/obsidian/templates/` 파일들을 통째로 복사한다
  (`00_템플릿_사용규칙.md` 포함 — frontmatter·문서 구조·인덱스 규칙의 정본이다).
- 저장소 위치를 모르면 사용자에게 경로를 묻고, 그것도 없으면 `/obsidian-categories.md`의
  **문서 템플릿** 매핑을 참고해 직접 생성한다.

### 7. 커맨드 파일 경로 치환 (선택)

`~/.claude/commands/`(또는 플러그인으로 설치된 경우 해당 커맨드 디렉터리) 내의 obsidian 커맨드 파일들에서
`{{OBSIDIAN_VAULT_PATH}}`를 입력받은 볼트 경로로 치환한다.

대상 파일:
- `obsidian-preview.md`
- `obsidian-format.md`
- `obsidian-move.md`
- `obsidian-index.md`
- `obsidian-organize.md`

경로/설치 레이아웃이 달라 치환하지 못해도, 각 커맨드는 실행 시 볼트 경로를 물어보는 폴백으로 동작하므로 필수는 아니다.

### 8. 완료 출력

```
✅ 볼트 경로: /path/to/vault
✅ 생성된 폴더: N개
✅ 생성된 인덱스: N개 (_ 접두사 + 부모 링크 + 📂 카테고리 링크)
✅ 속성 타입 등록: client=multitext, status=text
✅ 북마크 등록: N개
✅ 템플릿 복사: <볼트>/01_문서템플릿/ (N개)
✅ 커맨드 경로 치환 완료

⚠️ Obsidian이 실행 중이면 재시작하세요 — types.json·bookmarks.json은 재시작 후 반영됩니다.

사용법:
  파일을 00_Sandbox/에 넣고 /obsidian-organize 실행
  미리보기: /obsidian-preview
```
