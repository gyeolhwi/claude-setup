---
name: git-board
description: 현재 저장소에 연결된 GitHub Project 보드 현황을 조회해 Status별로 요약한다. "git board", "/git-board", "보드", "보드 확인", "보드 진행중", "다음 뭐 해?" 같은 요청에 사용한다. 조회 전용이며 보드를 수정하지 않는다.
argument-hint: "[진행중|할일|완료|다음]"
---

# git-board

보드를 조회해 요약한다. 항목 추가, Status 변경, 이슈 수정은 하지 않는다.

## 조회

보드 번호를 고정하지 않는다. 먼저 현재 저장소에 연결된 보드를 찾는다.

```bash
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
gh api graphql -f query='query($o:String!,$n:String!){repository(owner:$o,name:$n){projectsV2(first:20){nodes{number title closed}}}}' \
  -f o="${REPO%/*}" -f n="${REPO#*/}" -q '.data.repository.projectsV2.nodes[] | select(.closed | not) | "\(.number)\t\(.title)"'
```

- 1개면 그 보드를 쓴다.
- 여러 개면 저장소 이름과 제목이 가장 비슷한 보드를 쓰고, 애매하면 어느 보드인지 묻는다.
- 없으면 연결된 보드가 없다고 알리고 멈춘다. 다른 저장소 보드로 대신하지 않는다.

찾은 번호로 항목을 조회한다.

```bash
gh project item-list <번호> --owner "${REPO%/*}" --format json --limit 500
```

`totalCount`가 받은 `items` 개수보다 크면 `--limit`을 올려 다시 조회한다.

## 출력

인자에 따라 범위를 고른다.

| 인자 | 범위 |
|---|---|
| 없음 | Status별 개수 + 완료 외 항목 목록 |
| `진행중` | In Progress 항목 |
| `할일` | Todo 항목 |
| `완료` | Done 항목 중 최근 10개 |
| `다음` | Todo 항목 중 다음 작업 1~3개 추천과 이유 |

- 첫 줄에 `전체 N · 진행 N · 할일 N · 완료 N`을 쓰고, 이어서 표 하나로 브리핑한다. 표 앞뒤에 설명 문단이나 목록을 붙이지 않는다.
- 표 열은 `상태 | # | 작업 | 담당 | 메모`이고, 진행 항목을 맨 위에 둔다.
- `작업`은 `[화면]` 같은 말머리를 빼고 짧게 줄인다. 담당자가 없으면 `-`로 쓴다.
- `메모`에는 라벨과 Status가 어긋나는 등 확인이 필요한 점만 짧게 쓰고, 없으면 비워 둔다.
- 보드에 없는 Status 값이 있으면 빼지 말고 그 이름 그대로 묶어 보여 준다.
- Status가 비어 있는 항목은 `No Status`로 묶는다.
- `다음` 추천은 보드에 있는 정보(우선순위, 라벨, 번호)를 근거로 하고, 근거가 없으면 없다고 쓴다.
