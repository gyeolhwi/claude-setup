# Git 커맨드

## `/commit-auto` — 기능별 그룹 자동 커밋

staged diff를 읽고 변경 목적이 같은 파일끼리 그룹화하여 커밋 메시지를 자동 생성 후 커밋합니다.

```
사용법: git add <파일> 후 /commit-auto 실행
```

### 커밋 컨벤션

`<type>(<scope>): <subject> - YYYY-MM-DD`

| Type | 사용 기준 |
|------|----------|
| FEAT | 새로운 기능 추가 |
| FIX | 버그 수정 |
| REFACTOR | 기능 변경 없는 구조 개선 |
| STYLE | 코드 포맷 (들여쓰기, 세미콜론 등) |
| DOCS | 개발 관련 문서 |
| TEST | 테스트 코드 |
| CHORE | 빌드와 무관한 정리 |
| PERF | 성능 개선 |
| BUILD | 빌드 설정·의존성 변경 |
| CI | CI/CD 파이프라인 설정 |
| CONTENT | 사이트에 보여지는 콘텐츠 변경 |
| REVERT | 이전 커밋 되돌리기 |

### 동작 방식

- 그룹이 1개면 바로 커밋
- 그룹이 2개 이상이면 `git reset` → 그룹 단위 `git add` → 순차 커밋
