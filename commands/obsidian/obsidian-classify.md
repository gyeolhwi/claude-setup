# /obsidian-classify
Obsidian 볼트의 00_Sandbox 파일들을 분석해 분류 계획을 출력합니다. **파일을 수정하거나 이동하지 않습니다.**

## 볼트 경로
`{{OBSIDIAN_VAULT_PATH}}`

> 경로가 `{{OBSIDIAN_VAULT_PATH}}`이면 사용자에게 볼트 경로를 물어본 후 진행한다. 실제 경로가 입력되어 있으면 그대로 사용한다.

## 작업 순서

1. `00_Sandbox/*.md` 파일 목록 전체를 가져온다 (assets/, .DS_Store 제외)
2. `Clippings/*.md` 파일 목록도 포함한다 (웹 클리핑 및 임시 보관 파일)
3. 볼트 루트의 단독 .md 파일도 포함한다
4. 각 파일 내용을 읽고, 아래 분류 기준에 따라 결정한다

## 분류 기준

| 내용 유형 | 대상 폴더 | 적용 템플릿 |
|----------|----------|------------|
| Backend, DB, API, Java/Spring, OAuth, Servlet/JSP, Eclipse 웹개발 | 10_Dev/Backend | TPL_기술가이드 |
| React, JS/TS, HTML/CSS, 프론트엔드 도구, 포트폴리오 개발 | 10_Dev/Frontend | TPL_기술가이드 |
| AWS, 서버 설정, 도메인, Nginx, SSH | 10_Dev/Server | TPL_기술가이드 |
| 배포, CI/CD, GitHub Actions, DevOps | 10_Dev/DevOps | TPL_기술가이드 |
| 아키텍처, 설계 패턴, 폴더 구조 가이드, IA 전략 | 10_Dev/Architecture | TPL_아키텍처 |
| 코딩 컨벤션, 표준 정의, 개발 용어 가이드 | 10_Dev/Standards | TPL_컨벤션 |
| AI 프롬프트, 에이전트, 시스템 인스트럭션, Claude Code | 10_Dev/Ai | TPL_AI프롬프트 |
| UI/UX 디자인, Figma, 디자인 시스템, Glassmorphism | 10_Dev/Design | TPL_기술가이드 |
| IDE, 개발 도구, 단축키, 앱 사용법 | 30_Tools | TPL_기술가이드 |
| 개인, 목표, 아이디어, 심리/성격 분석 | 20_Personal | TPL_개인노트 |
| 독서, 서평, 책 기록 | 20_Personal/서재 | TPL_서재 |
| 게임 관련 | 40_Gaming | TPL_개인노트 |
| 레시피, 요리 | 50_Recipes | TPL_개인노트 |

## status 결정 기준

| 상태 | 기준 |
|------|------|
| `done` | 내용이 완성된 문서 |
| `wip` | 명백히 작성 중인 문서 |
| `seed` | 아이디어 메모, 초안, 내용이 짧거나 미완성 |
| `hold` | 작성 보류 중인 문서 |
| `reference` | 가이드/규칙/기준 문서 |
| `wiki` | 용어/개념 정의 문서 |

## 파일명 변환 기준

- 파일명에 이모지 없으면 내용에 맞는 이모지 추가
- `FAQ.md` → `❓ 배민 아키텍처 FAQ.md` 식으로 제목 구체화
- `CHEATSHEET.md` → `📋 배민 아키텍처 치트시트.md`
- 이미 이모지 있으면 유지, "(텍스트 버전)" 등 불필요한 괄호 정리

## 출력 형식

분류 결과를 아래 표로 출력한다:

| 현재 파일명 | 새 파일명 | 대상 폴더 | 템플릿 | status | 비고 |
|-----------|---------|---------|--------|--------|------|

비고에는 중복 문서 주의, 삭제 권장, assets 이동 필요 여부 등을 표시한다.

마지막에 **처리 결과 요약**도 출력한다:
- 분류된 파일 수 (00_Sandbox, Clippings 각각)
- 이동 대상 폴더별 파일 목록
- 수동 확인 필요 항목 (분류 불명확, 중복 의심 등)
