# /obsidian-move — 내용 기반 파일 분류 이동

00_Sandbox 및 Clippings 파일들을 내용 기반으로 분류하여 올바른 폴더로 이동한다.
**파일 목록이 하드코딩되어 있지 않으므로 새 파일이 추가돼도 그대로 실행하면 된다.**

**볼트:** `{{OBSIDIAN_VAULT_PATH}}`

> 경로가 `{{OBSIDIAN_VAULT_PATH}}`이면 사용자에게 볼트 경로를 물어본 후 진행한다. 실제 경로가 입력되어 있으면 그대로 사용한다.

## 카테고리 설정
`/obsidian-categories.md` 파일의 **분류 기준**, **폴더 구조**, **부모 인덱스 링크** 섹션을 참조한다.

---

## Step 1: 폴더 번호화

`/obsidian-categories.md`의 **폴더 구조**를 참조하여, 번호 없이 존재하는 폴더에 번호 접두사를 붙인다.
이미 번호가 붙어 있으면 건너뛴다. 필요한 폴더가 없으면 생성한다.

---

## Step 2: 파일 분류 및 이동

### 2-1. 대상 파일 수집

아래 위치의 `.md` 파일을 모두 수집한다 (인덱스 파일, `.DS_Store`, `_assets/` 제외):
- `00_Sandbox/*.md`
- `Clippings/*.md`
- 볼트 루트의 단독 `.md` 파일

### 2-2. 각 파일에 대해: 내용 읽기 → 분류 → 이동

파일 내용을 읽고 `/obsidian-categories.md`의 **분류 기준** 테이블에 따라 이동 대상 폴더를 결정한다.

### 2-3. 파일명 정규화 (이동 시 동시 처리)

- 파일명에 이모지가 없으면 내용에 맞는 이모지를 앞에 추가한다
- 영문 대문자 약어 파일명(`FAQ`, `CHEATSHEET` 등)은 내용 기반으로 구체적인 이름으로 변경한다
- `(텍스트 버전)`, `(이미지 버전)` 등 불필요한 괄호 설명은 제거한다
- 이미 이모지가 있으면 유지한다

### 2-4. 이름 변경 매핑 기록

이름이 바뀐 파일은 **Step 5에서 wikilink 업데이트에 사용하기 위해** 아래 형태로 기록해 둔다:

```
rename_map = {
  "구 파일명(확장자 제외)": "새 파일명(확장자 제외)",
  ...
}
```

### 2-5. 대상 폴더 없으면 생성 후 이동

---

## Step 3: assets 이동

`00_Sandbox/assets/` 하위 폴더가 있으면 이동된 문서의 폴더 내 `_assets/`로 옮긴다.

이동 후 문서 내 상대경로 이미지 링크를 Obsidian wikilink 형식으로 변환:
- `![설명](assets/폴더/파일명.png)` → `![[파일명.png]]`

---

## Step 4: 이동된 파일에 부모 인덱스 링크 추가

각 파일의 frontmatter 바로 다음 줄에 올바른 부모 인덱스 wikilink가 있는지 확인한다. 없으면 추가한다.

`/obsidian-format` 명령의 부모 인덱스 매핑 테이블 참조.

---

## Step 5: wikilink 업데이트

Step 2-4에서 기록한 `rename_map`을 사용해 볼트 전체 `.md` 파일에서 구 파일명을 참조하는 wikilink를 새 파일명으로 업데이트한다.

### 대상 패턴
- `[[구 파일명]]` → `[[새 파일명]]`
- `[[구 파일명|표시텍스트]]` → `[[새 파일명|표시텍스트]]`
- `![[구 파일명]]` → `![[새 파일명]]`

### 처리 방법

```python
import re
from pathlib import Path

vault = Path("{{OBSIDIAN_VAULT_PATH}}")  # 실제 볼트 경로로 치환

# rename_map은 Step 2-4에서 수집한 딕셔너리
for md_file in vault.rglob("*.md"):
    text = md_file.read_text(encoding="utf-8")
    changed = False
    for old, new in rename_map.items():
        pattern = r'\[\[' + re.escape(old) + r'(\|[^\]]+)?\]\]'
        replacement = r'[[' + new + r'\1]]'
        new_text = re.sub(pattern, replacement, text)
        if new_text != text:
            text = new_text
            changed = True
    if changed:
        md_file.write_text(text, encoding="utf-8")
```

---

## 완료 후 출력

```
이동됨: 파일명 → 대상 폴더 (이름 변경 있으면 표시)
wikilink 업데이트: N개 파일에서 업데이트
수동 확인 필요: 분류 불명확 파일 목록
```
