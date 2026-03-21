# project-docs-gen 스킬 템플릿

`project-docs-gen` 커맨드가 문서를 생성할 때 사용하는 10종 템플릿 모음입니다.

## 템플릿 목록

| 파일 | 문서 | 의존 문서 |
|------|------|----------|
| `01-requirements.md` | 요구사항정의서 | — (최초 작성) |
| `02-tech-stack.md` | 기술 스택 결정서 | requirements |
| `03-roles.md` | 역할/권한 매트릭스 | requirements |
| `04-sitemap.md` | 정보구조도 | requirements, roles |
| `05-features.md` | 기능명세서 | requirements, sitemap |
| `06-erd.md` | ERD 설계서 | features |
| `07-api.md` | API 명세서 | features, erd |
| `08-flowchart.md` | 플로우차트 | features, sitemap |
| `09-wireframe.md` | 와이어프레임 설계서 | sitemap, features |
| `10-scenarios.md` | 시나리오 케이스 | 전체 문서 참조 |

## ID 체계

문서 간 일관성을 유지하기 위해 아래 ID 체계를 사용합니다.

| 접두사 | 대상 | 예시 |
|--------|------|------|
| `REQ-` | 요구사항 | `REQ-AUTH-001` |
| `FEAT-` | 기능 | `FEAT-AUTH-001` |
| `SCR-` | 화면 | `SCR-AUTH-001` |
| `API-` | API | `API-POST-001` |
| `TC-` | 테스트 케이스 | `TC-AUTH-001` |
| `FLOW-` | 플로우 | `FLOW-AUTH-001` |
| `EDGE-` | 엣지 케이스 | `EDGE-001` |

## 설치

```bash
cp -r project-docs-gen/ ~/.claude/skills/omc-learned/
```

> `project-docs-gen` 커맨드(`~/.claude/commands/project-docs-gen.md`)가 함께 설치되어야 작동합니다.
