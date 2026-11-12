## 작업 요약

work-setup 스킬과 뷰어 사본을 claude-setup 에서 빼고, 정본을 [gyeolhwi/work-viewer](https://github.com/gyeolhwi/work-viewer) 로 넘겼다. 이제 `install.sh` 는 `~/.claude/skills/work-setup`(work-viewer 를 가리키는 링크)를 덮어쓰지 않는다. 문서·화면 변경이 아니라서 캡처 대신 텍스트로 비교한다.

## 변경 전후

| 항목 | 전 (95ee0f2) | 후 (75ee63e) |
| --- | --- | --- |
| `install.sh` `SKILLS` | `... issue-merge work-setup` | `... issue-merge` |
| `skills/work-setup/` 파일 수 | 10 | 0 |
| `skills/work-setup` 참조 (저장소 전체) | 10줄 / 4개 파일 | 0 |
| work-viewer 안내 | 없음 | README · catalog · work-workspace-workflow · INDEX · install.sh 끝 안내 |
| docs_index check | OK (docs=11) | OK (docs=11) |

전체 기록: `.issue/2/evidence/before.txt`, `.issue/2/evidence/after.txt`

## 변경 파일

- `skills/work-setup/` — 삭제 (SKILL.md · references · viewer 사본)
- `install.sh` — `SKILLS` 에서 work-setup 제외, 설치 끝 안내에 work-viewer 한 줄
- `docs/workflows/work-workspace-workflow.md` — work-viewer clone · `scripts/install.sh --skills` · 문서 링크만 남긴 안내로 축소
- `docs/reference/catalog.md` · `source-map.md` · `docs/setup/prerequisites.md` · `README.md` — work-setup 행 · 자산 항목 · bun 행 · 구조 트리 정리
- `INDEX.md` — 재생성

## 검증

- `bash -n install.sh` 통과, `./install.sh --check` exit 0
- `docs_index.py check` → `OK: check; docs=11; index=11`
- README · docs 상대 링크 전부 존재, work-viewer 문서 링크 3개는 GitHub API 로 존재 확인
- `git diff --check` 통과

## 남은 이슈

- 머지 뒤 맥북 · company-wsl-gyeolhwi 동기화(`install.sh --copy --no-obsidian`) 때 `work-setup` 링크가 그대로 남는지 확인
