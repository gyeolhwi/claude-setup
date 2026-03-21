# ERD 설계서 템플릿

## 의존 문서

- 기능명세서 (`features.md`) — 입출력 데이터, 처리 로직
- 역할/권한 매트릭스 (`roles.md`) — 역할 코드, 데이터 범위

## 사용자에게 확인할 것

- 기존 DB가 있는지
- 필수 엔티티 목록
- 소프트 삭제 여부
- 다국어 지원 여부

## 템플릿

```markdown
# ERD 설계서

| 항목 | 내용 |
|------|------|
| 프로젝트 | {프로젝트 이름} |
| 문서 버전 | v1.0 |
| 최종 수정일 | {YYYY-MM-DD} |
| 작성자 | {작성자} |
| 상태 | `초안` |

---

## 1. ERD 다이어그램

```mermaid
erDiagram
    USER {
        bigint id PK
        string email UK
        string password
        string name
        enum role
        datetime created_at
        datetime updated_at
        datetime deleted_at
    }

    {ENTITY} {
        bigint id PK
        bigint user_id FK
        string title
        text content
        datetime created_at
        datetime updated_at
        datetime deleted_at
    }

    USER ||--o{ {ENTITY} : "작성"
```

---

## 2. 테이블 정의

### users (사용자)

| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|--------|------|------|--------|------|
| id | BIGINT | N | AUTO_INCREMENT | PK |
| email | VARCHAR(255) | N | - | 이메일 (UK) |
| password | VARCHAR(255) | N | - | 해시된 비밀번호 |
| name | VARCHAR(100) | N | - | 이름 |
| role | ENUM | N | 'USER' | 역할 (USER/ADMIN) |
| created_at | DATETIME | N | CURRENT_TIMESTAMP | 생성일 |
| updated_at | DATETIME | N | CURRENT_TIMESTAMP | 수정일 |
| deleted_at | DATETIME | Y | NULL | 삭제일 (소프트 삭제) |

### {테이블명} ({설명})

| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|--------|------|------|--------|------|
| id | BIGINT | N | AUTO_INCREMENT | PK |
| user_id | BIGINT | N | - | FK → users.id |
| {컬럼} | {타입} | {N/Y} | {기본값} | {설명} |
| created_at | DATETIME | N | CURRENT_TIMESTAMP | 생성일 |
| updated_at | DATETIME | N | CURRENT_TIMESTAMP | 수정일 |
| deleted_at | DATETIME | Y | NULL | 삭제일 |

---

## 3. 인덱스 정의

| 테이블 | 인덱스명 | 컬럼 | 유형 | 설명 |
|--------|---------|------|------|------|
| users | idx_email | email | UNIQUE | 이메일 중복 방지 |
| {테이블} | idx_{컬럼} | {컬럼} | INDEX | {설명} |

---

## 4. 관계 정의

| 관계 | 설명 | 타입 |
|------|------|------|
| users → {테이블} | 사용자는 여러 {엔티티}를 가짐 | 1:N |

---

## 5. 설계 원칙

- 소프트 삭제: `deleted_at` 컬럼으로 논리 삭제
- 타임스탬프: 모든 테이블에 `created_at`, `updated_at` 필수
- 문자셋: utf8mb4 (이모지 지원)
- 기본키: BIGINT AUTO_INCREMENT
```
