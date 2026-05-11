# API 명세서 템플릿

## 의존 문서

- 기능명세서 (`features.md`) — 기능 ID, 입출력 데이터
- ERD 설계서 (`erd.md`) — 테이블 구조, 컬럼 타입

## 사용자에게 확인할 것

- RESTful 스타일 준수 여부
- 인증 방식 (JWT, Session 등)
- 응답 포맷 규칙
- 페이지네이션 방식

## 템플릿

```markdown
# API 명세서

| 항목 | 내용 |
|------|------|
| 프로젝트 | {프로젝트 이름} |
| 문서 버전 | v1.0 |
| 최종 수정일 | {YYYY-MM-DD} |
| 작성자 | {작성자} |
| 상태 | `초안` |

---

## 1. API 공통 규칙

### Base URL

- 개발: `http://localhost:8080/api/v1`
- 운영: `https://api.{도메인}/v1`

### 인증

- 방식: JWT Bearer Token
- 헤더: `Authorization: Bearer {token}`
- 만료: Access Token 1시간 / Refresh Token 7일

### 공통 응답 포맷

```json
{
  "success": true,
  "data": {},
  "message": "성공",
  "timestamp": "2026-03-21T00:00:00Z"
}
```

### 에러 응답 포맷

```json
{
  "success": false,
  "error": {
    "code": "AUTH_001",
    "message": "인증이 필요합니다"
  },
  "timestamp": "2026-03-21T00:00:00Z"
}
```

### HTTP 상태 코드

| 코드 | 의미 |
|------|------|
| 200 | 성공 |
| 201 | 생성 성공 |
| 400 | 잘못된 요청 |
| 401 | 인증 실패 |
| 403 | 권한 없음 |
| 404 | 리소스 없음 |
| 500 | 서버 오류 |

---

## 2. API 목록

| ID | 메서드 | 경로 | 설명 | 인증 |
|----|--------|------|------|------|
| API-POST-001 | POST | `/auth/login` | 로그인 | 불필요 |
| API-POST-002 | POST | `/auth/register` | 회원가입 | 불필요 |
| API-GET-001 | GET | `/{리소스}` | 목록 조회 | 필요 |
| API-GET-002 | GET | `/{리소스}/{id}` | 상세 조회 | 필요 |
| API-POST-003 | POST | `/{리소스}` | 생성 | 필요 |
| API-PUT-001 | PUT | `/{리소스}/{id}` | 수정 | 필요 |
| API-DELETE-001 | DELETE | `/{리소스}/{id}` | 삭제 | 필요 |

---

## 3. API 상세

### API-POST-001: 로그인

**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "홍길동",
      "role": "USER"
    }
  }
}
```

**Error Cases:**
| 코드 | 상황 |
|------|------|
| AUTH_001 | 이메일/비밀번호 불일치 |
| AUTH_002 | 계정 잠금 상태 |

---

### API-GET-001: {리소스} 목록 조회

**GET** `/{리소스}?page=1&size=20&sort=createdAt,desc`

**Query Parameters:**
| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| page | int | N | 페이지 번호 (기본: 1) |
| size | int | N | 페이지 크기 (기본: 20) |
| sort | string | N | 정렬 기준 |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "content": [],
    "totalElements": 100,
    "totalPages": 5,
    "currentPage": 1
  }
}
```
```
