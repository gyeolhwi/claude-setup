## 작업 요약

맥북에만 있던 `deck` 스킬(발표 기획안 → PPT)을 저장소에 추가했다. 이제 `install.sh` 한 번으로 deck 이 깔리고 의존성(`npm install`)까지 받아진다. 저장소가 공개라서 예시·형식 문서의 실제 고객사 이름은 `고객사 A` · `고객사 B` 로 바꿨고, 고객사 자료가 담긴 `reference.pptx` 와 `node_modules` 는 올리지 않았다. 화면 변경이 아니라서 캡처 대신 텍스트로 비교한다.

## 변경 전후

| 항목 | 전 (37ea0f4) | 후 (228da12) |
| --- | --- | --- |
| `install.sh` `SKILLS` | `... issue-merge` | `... issue-merge deck` + `NPM_SKILLS=(deck/scripts)` |
| `skills/deck/` 파일 수 | 0 | 8 |
| `reference.pptx` · `node_modules` 커밋 | — | 0 |
| 실제 고객사 이름 (`git grep`) | 0 | 0 |
| catalog 스킬 수 | 10 | 11 |
| 임시 HOME 설치 | — | deck 설치 + npm install 성공, 저장소와 같음 |
| 설치본으로 예시 기획안 | — | check 통과(11장) · build 성공 · render 11장 |
| docs_index check | OK (docs=11) | OK (docs=11) |

전체 기록: `.issue/4/evidence/before.txt`, `.issue/4/evidence/after.txt`

## 변경 파일

- `skills/deck/` — 추가 (SKILL.md · references · examples · scripts), SKILL.md 표에서 `reference.pptx` 행 삭제
- `install.sh` — `SKILLS` 에 deck, 설치한 자리에서 `npm install`(npm 없거나 실패하면 경고만), 끝 안내에 `/deck`
- `.gitignore` — `skills/deck/scripts/node_modules/`
- `README.md` · `docs/reference/catalog.md` · `source-map.md` · `docs/setup/prerequisites.md` — deck 항목, npm · LibreOffice 전제 조건
- `INDEX.md` — 재생성

## 검증

- `bash -n install.sh` 통과, `git diff --check` 통과
- 임시 HOME 에 `./install.sh --copy --no-obsidian` → deck 설치·의존성 설치 성공, 저장소와 `diff -rq`(node_modules 제외) 같음
- 설치본 `deck.js check / build / render` 로 예시 기획안 11장 생성, 09장에 고객사 A · B 로 표시되는 것 확인
- `docs_index.py check` → `OK: check; docs=11; index=11`

## 남은 이슈

- 머지 뒤 맥북 · company-wsl-gyeolhwi 동기화(`install.sh --copy --no-obsidian`). 맥북의 기존 `~/.claude/skills/deck` 은 `.bak` 으로 밀려나므로 백업 폴더로 옮긴다 (원본 `reference.pptx` 는 그 백업에 남는다)
- WSL 에서 `render`(LibreOffice · 글꼴 경로)는 범위 밖
