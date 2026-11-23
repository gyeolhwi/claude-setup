# 프로젝트 문서 형식

이 규격은 새로 적용할 프로젝트의 기본형이다. 이미 다른 문서 규격을 쓰는 저장소의 규격을 대체하지 않는다.

## 1. 개별 문서: 필수 필드 7개

첫 바이트부터 `---`로 시작하고 아래 순서를 쓴다. 새 문서에는 기본 7개만 사용하며, 기존 추가 메타데이터는 보존한다.

- `id`: `{category}-{주제}`. 소문자 영문·숫자 kebab-case, 프로젝트 안에서 유일. `docs/spec/admin/permissions.md`는 `spec-admin-permissions`처럼 하위 경로 의미를 넣어 충돌을 피한다.
- `title`: 사용자가 찾을 핵심 단어를 앞에 둔 한국어 제목. 기술명은 원문 유지.
- `category`: `docs/` 바로 아래 폴더명과 정확히 일치. 기본 `guide / spec / ops`.
- `summary`: 무엇을 어떻게 설명하는지 **구체적인 한 줄**. 추상어·홍보 문구 금지. 수치는 실제 근거가 있을 때만 쓴다.
- `keywords`: 실제 질문에 쓰일 검색어 배열. 한글·영문 동의어와 코드 식별자를 필요에 맞게 사용. 빈 배열 금지.
- `related_files`: 설명하는 실제 소스·설정 경로를 저장소 루트 기준으로 나열. 없으면 `[]`. 절대경로·상위 이동·외부 URL 금지, 경로 구분자는 `/`.
- `last_updated`: 실제 내용 변경일 `"YYYY-MM-DD"`. 새 문서는 문자열로 따옴표를 권장하며, 기존 YAML 날짜 표기도 도구가 허용한다. 색인 재생성만으로 모든 문서 날짜를 바꾸지 않는다.

### 형식 예시

가상의 캡처 기능을 예로 든 형식 예시다. 다른 프로젝트에 이 내용을 그대로 생성하지 않는다.

```markdown
---
id: spec-capture-pipeline
title: 캡처 파이프라인·SVG에서 JPEG 출력
category: spec
summary: HTML을 SVG foreignObject와 Canvas로 렌더링하고 폰트·이미지를 base64로 인라인해 JPEG로 출력한다
keywords: [캡처, 이미지 저장, capture, SVG, foreignObject, Canvas, JPEG, base64]
related_files:
  - src/lib/render/capture.ts
last_updated: "2026-10-20"
---
# 캡처 파이프라인·SVG에서 JPEG 출력
```

본문은 예시 문구가 아니라 실제 코드와 확인한 동작으로 채운다.

## 2. 루트 INDEX.md

본문을 복제하지 않고 네 필드만 모은다. `docs:`로 통일한다.

````markdown
# INDEX

> AI는 질문을 받으면 이 파일부터 읽고, 아래에서 맞는 문서만 연다.

```yaml
docs:
  - path: docs/spec/capture-pipeline.md
    title: 캡처 파이프라인·SVG에서 JPEG 출력
    summary: HTML을 SVG foreignObject와 Canvas로 렌더링하고 폰트·이미지를 base64로 인라인해 JPEG로 출력한다
    keywords: [캡처, 이미지 저장, capture, SVG, foreignObject, Canvas, JPEG, base64]
```
````

- title·summary·keywords는 프론트매터 값 그대로. 다르면 프론트매터가 정본이다.
- `docs/**/*.md`를 저장소 상대 경로 오름차순으로 수록한다. 공백·특수문자가 있는 YAML 값은 직접 조립하지 말고 YAML serializer로 생성한다.
- 개별 문서와 색인은 같은 커밋에서 갱신한다. 문서를 이동·삭제했을 때 옛 경로를 남기지 않는다.
- 루트 README·AGENTS·CLAUDE·INDEX와 docs 밖의 소스 패키지는 docs 목록에 세지 않는다. docs 아래 README는 포함한다.
- 별도 설명이 들어 있는 기존 INDEX를 자동 덮어쓰지 않는다. 승인된 계획에 따라 설명을 적절한 문서로 보존한 뒤 이 최소 형식으로 전환한다.

## 3. README 구성

README는 매뉴얼이 아니라 **프로젝트 소개**다. 처음 보는 사람이 첫 화면에서 "무엇이고, 왜 쓰는지"를 알면 된다. 기능 목록·사용법·구조는 docs가 맡는다.

| 블록 | 내용 | 근거 |
|---|---|---|
| 1. 한 문장 소개 | 제목 아래 인용(`>`) 한 줄. 무엇인지 | 기획 문서·코드·사용자 설명 |
| 2. 왜 필요한가 | `문제 → 해결` 3줄 안팎 | 실제 구현된 기능 |
| 3. 흐름 (선택) | 쓰는 순서나 동작 흐름 한 줄 그림 | 실제 구현된 흐름 |
| 4. 시작하기 | 설치·실행 명령 2~3줄 | `package.json` scripts·`Makefile`·설치 스크립트에 정의된 것만 |
| 5. 더 보기 | 기능 전체·설치 상세·`INDEX.md` 링크 한 줄 | docs |

- 전체 30줄 안팎. 근거가 없는 블록은 통째로 뺀다. 코드가 거의 없는 초기 저장소는 1·2(계획이면 "예정"으로 표시)·5만 쓴다.
- 문체는 명사형 종결(`~하는 설정 모음`, `~로 통일`). `~한다`·`~합니다` 체로 쓰지 않는다.
- 2번은 사용자가 얻는 결과로 쓴다. 명령어·내부 도구명은 넣지 않는다.
- 기능 목록·기술 스택·폴더 구조·옵션표·현재 버전은 README에 넣지 않고 spec·guide 문서와 `CHANGELOG.md`에 둔다.

**쓰지 않는 것**

- 근거 파일에 없는 명령(`npm run dev`, `npm install` 등을 추측해 넣기), 추측한 기술 스택, 존재하지 않는 폴더.
- `git clone` 절차(clone 이 실제 설치 방법인 도구·설정 배포용 저장소는 예외), 배지, Contributing 섹션, LICENSE 파일이 없는 License 섹션.
- "추후 추가", "TBD" 같은 자리 채우기 문구와 빈 섹션.

카테고리 README·하위 INDEX를 의무적으로 추가하지 않는다.

## 4. 기계 검사와 별도 검수

**동봉 도구의 검사 범위**

- 모든 docs Markdown의 7개 필수 필드·타입·실제 날짜·한국어 제목·빈 본문 여부.
- ID kebab-case·유일성, category 폴더와 ID 접두사 일치.
- related_files의 저장소 내 존재·경로 안전성.
- INDEX 전체 형식, 경로·순서·title·summary·keywords의 정확한 일치.
- YAML 중복 키·docs 내부 심볼릭 링크 거부, 사용자 작성 INDEX의 본문·추가 YAML 필드·주석 무단 덮어쓰기 방지.
- 기존 추가 메타데이터는 보존하며 INDEX에 실어 나르지 않는다. 생성 도구는 문서 본문을 수정하지 않는다.

**별도 검수 범위**

- 요약·본문과 README의 소개·명령이 실제 근거 파일과 맞는지.
- 기존 문서 본문과 추가 메타데이터가 보존됐는지.
- 이동 전후 Markdown 링크·첨부·코드에서 참조하는 문서 경로가 유효한지.
- 기존 지침을 덮어쓰지 않았는지, 승인 범위 밖 삭제·통합·폴더 개편이 없는지.

검사 통과를 프로젝트 기능 테스트·운영 배포 검증으로 보고하지 않는다.

## 5. 기준

- `README.md`: §3의 소개 블록(한 문장·왜 필요한가·흐름·시작하기·더 보기) 중 근거가 있는 것만.
- `INDEX.md`: docs 목록과 path·title·summary·keywords 4필드.
- `docs/guide/`, `docs/spec/`, `docs/ops/`: 7필드 프론트매터를 붙인 문서.

사용자 원칙인 **계획 승인·원문 보존·실제 내용 작성·문서/색인 정합성 확인**을 함께 반영했다. 특정 프로젝트의 규칙·기술 스택·수치를 다른 프로젝트에 강제하지 않는다.
