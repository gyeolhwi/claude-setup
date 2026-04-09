# /obsidian-organize

00_Sandbox 및 Clippings의 모든 문서를 **한 번에** 형식화하고 분류 이동합니다.
`/obsidian-format` → `/obsidian-move` → `/obsidian-index` 순서로 실행하는 마스터 커맨드입니다.

**볼트:** `{{OBSIDIAN_VAULT_PATH}}`

> 경로가 `{{OBSIDIAN_VAULT_PATH}}`이면 사용자에게 볼트 경로를 물어본 후 진행한다. 실제 경로가 입력되어 있으면 그대로 사용한다.

---

## 실행 순서

### Phase 1 — Format (형식 정규화)
`/obsidian-format` 명령 전체 내용을 따른다.
대상: `00_Sandbox/*.md`, `Clippings/*.md` 전체

- YAML 정규화 (status 단일값, tags 표준 어휘 기반 보완)
- `description` 필드 추가 (AI 검색용 한 줄 요약)
- 부모 인덱스는 아직 추가하지 않음 (이동 후 추가됨)

### Phase 2 — Move (내용 기반 분류 이동)
`/obsidian-move` 명령 전체 내용을 따른다.

- 각 파일 내용을 읽고 분류 기준에 따라 대상 폴더 결정 (하드코딩 없음)
- 파일명 정규화 (이모지 추가, 불필요한 괄호 제거)
- assets 이동 + 이미지 링크를 wikilink 형식으로 변환
- 이동 완료 후 부모 인덱스 링크 추가
- 파일명 변경이 있으면 볼트 전체 wikilink 자동 업데이트

### Phase 3 — Index (인덱스 갱신)
`/obsidian-index` 명령 전체 내용을 따른다.

- 문서가 추가된 모든 폴더의 인덱스 파일 업데이트
- 인덱스 파일 없는 폴더는 새로 생성

---

## 최종 출력

```
✅ Phase 1 완료: N개 파일 형식화
✅ Phase 2 완료: N개 파일 이동, wikilink N건 업데이트
✅ Phase 3 완료: N개 인덱스 파일 업데이트

--- 처리 결과 ---
이동됨: 파일명 → 대상 폴더
이름 변경: 구 파일명 → 새 파일명
수동 확인 필요: ...
```
