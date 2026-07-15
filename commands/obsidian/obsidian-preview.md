# /obsidian-preview — 분류/변환 미리보기

Obsidian 볼트의 00_Sandbox, Clippings 파일들을 분석해 `/obsidian-organize` 실행 시 어떤 일이 일어날지 미리 보여줍니다. **파일을 수정하거나 이동하지 않습니다.**

## 볼트 경로
`{{OBSIDIAN_VAULT_PATH}}`

> 경로가 `{{OBSIDIAN_VAULT_PATH}}`이면 사용자에게 볼트 경로를 물어본 후 진행한다. 실제 경로가 입력되어 있으면 그대로 사용한다.

## 카테고리 설정
`/obsidian-categories.md` 파일을 참조한다.

## 작업 순서

### 1. 구조 변동 감지

`/obsidian-categories.md`의 **폴더 구조**와 실제 볼트 폴더를 비교한다.

변동이 있으면 출력:
```
📂 구조 변동 감지:
  추가됨: 60_Music/ (categories.md에 미등록)
  삭제됨: 50_Recipes/ (볼트에 없음)
→ /obsidian-organize 실행 시 categories.md가 자동 동기화됩니다.
```

변동이 없으면 생략.

### 2. 파일 수집

1. `00_Sandbox/*.md` 파일 목록 전체를 가져온다 (assets/, .DS_Store 제외)
2. `Clippings/*.md` 파일 목록도 포함한다
3. 볼트 루트의 단독 .md 파일도 포함한다

### 3. 새 카테고리 필요 여부 감지

각 파일 내용을 읽고 기존 카테고리에 맞지 않는 파일이 있으면 출력:
```
⚠️ 새 카테고리 제안:
  - 피아노연습.md, 기타코드.md → "Music"?
  - 여행계획.md → "Travel"?
→ /obsidian-organize 실행 시 새 카테고리 생성 여부를 물어봅니다.
```

### 4. 분류 결과 출력

| 현재 파일명 | 새 파일명 | 대상 폴더 | 템플릿 | status | client | 비고 |
|-----------|---------|---------|--------|--------|--------|------|

## status 결정 기준

status 값과 판단 기준은 `/obsidian-categories.md`의 **status 값** 섹션을 참조한다.

## client 결정 기준

회사·클라이언트 업무로 작성된 문서면 `client` 필드로 소속을 표시한다. 자세한 기준은 `/obsidian-categories.md`의 **client 필드** 섹션을 참조한다.

| 판단 | 처리 |
|------|------|
| 내용/description에 특정 회사·클라이언트 업무임이 분명 (예: "우리회사 고객…") | `client: <소속명>` |
| 본문/태그에 소속·기관 고유명사가 박혀 있음 | 해당 값을 `client`로, 태그에서는 제거 |
| 개인 학습·기록·취미 | `client` 없음 (개인 노트) |

- 폴더 분류는 **주제 기준 그대로** — client는 폴더에 영향을 주지 않는다.

## 파일명 변환 기준

- 파일명에 이모지 없으면 내용에 맞는 이모지 추가
- `FAQ.md` → `❓ 배민 아키텍처 FAQ.md` 식으로 제목 구체화
- `CHEATSHEET.md` → `📋 배민 아키텍처 치트시트.md`
- 이미 이모지 있으면 유지, "(텍스트 버전)" 등 불필요한 괄호 정리

## 처리 결과 요약

```
📊 미리보기 결과:
  구조 변동: N건
  새 카테고리 제안: N건
  분류 대상: N개 파일 (00_Sandbox N개, Clippings N개)
  폴더별: 10_Dev/Backend N개, 20_Work N개, 40_Personal N개, ...
  수동 확인 필요: N건
```
