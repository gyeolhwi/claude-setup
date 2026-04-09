# Obsidian 카테고리 설정

이 파일은 Obsidian 커맨드들이 참조하는 카테고리 설정 파일이다.
`/obsidian-init`이 생성하며, 사용자가 자유롭게 수정할 수 있다.

---

## 폴더 구조

```
00_Sandbox/          # 미분류 파일 임시 보관
Clippings/           # 웹 클리핑
10_Dev/
  ├── Backend/
  ├── Frontend/
  ├── Server/
  ├── DevOps/
  ├── Architecture/
  ├── Standards/
  ├── Ai/
  └── Design/
20_Personal/
  └── 서재/
30_Tools/
40_Gaming/
50_Recipes/
99_Archive/          # 분류 불명확, 임시 보관, 삭제 예정
```

---

## 분류 기준

| 내용 유형 | 대상 폴더 |
|---------|---------|
| Backend, DB, API, Java/Spring, OAuth, Servlet/JSP, Eclipse 웹개발 | 10_Dev/Backend |
| React, JS/TS, HTML/CSS, 프론트엔드 도구, 포트폴리오 개발 | 10_Dev/Frontend |
| AWS, 서버 설정, 도메인, Nginx, SSH, 배포 환경 | 10_Dev/Server |
| 배포, CI/CD, GitHub Actions, DevOps | 10_Dev/DevOps |
| 아키텍처, 설계 패턴, 폴더 구조 가이드, IA 전략 | 10_Dev/Architecture |
| 코딩 컨벤션, 표준 정의, 개발 용어 가이드 | 10_Dev/Standards |
| AI 프롬프트, 에이전트, 시스템 인스트럭션, Claude Code | 10_Dev/Ai |
| UI/UX 디자인, Figma, 디자인 시스템, Glassmorphism | 10_Dev/Design |
| IDE, 개발 도구, 단축키, 앱 사용법 | 30_Tools |
| 개인, 목표, 아이디어, 심리/성격 분석 | 20_Personal |
| 독서, 서평, 책 기록 | 20_Personal/서재 |
| 게임 관련 | 40_Gaming |
| 레시피, 요리 | 50_Recipes |
| 분류 불명확, 임시 보관, 삭제 예정 | 99_Archive |

---

## 인덱스 파일 매핑

| 폴더 | 인덱스 파일명 |
|------|------------|
| 10_Dev/ | 💻 개발 인덱스.md |
| 10_Dev/Backend/ | ⚙️ Backend 인덱스.md |
| 10_Dev/Frontend/ | ⚛️ Frontend 인덱스.md |
| 10_Dev/Server/ | 🖥️ Server 인덱스.md |
| 10_Dev/DevOps/ | DevOps 인덱스.md |
| 10_Dev/Architecture/ | Architecture 인덱스.md |
| 10_Dev/Design/ | 🎨 Design 인덱스.md |
| 10_Dev/Ai/ | 🤖 Ai 인덱스.md |
| 10_Dev/Standards/ | 📋 컨벤션 인덱스.md |
| 20_Personal/ | 👤 프로필 인덱스.md |
| 20_Personal/서재/ | 📖 서재 인덱스.md |
| 30_Tools/ | 🛠️ Tools 인덱스.md |
| 40_Gaming/ | 🎮 Gaming 인덱스.md |
| 50_Recipes/ | 🍳 Recipes 인덱스.md |

---

## 부모 인덱스 링크

| 폴더 | 추가할 링크 |
|------|-----------|
| 10_Dev/Backend | `> 📂 [[⚙️ Backend 인덱스]]` |
| 10_Dev/Frontend | `> 📂 [[⚛️ Frontend 인덱스]]` |
| 10_Dev/Server | `> 📂 [[🖥️ Server 인덱스]]` |
| 10_Dev/DevOps | `> 📂 [[DevOps 인덱스]]` |
| 10_Dev/Architecture | `> 📂 [[Architecture 인덱스]]` |
| 10_Dev/Design | `> 📂 [[🎨 Design 인덱스]]` |
| 10_Dev/Ai | `> 📂 [[🤖 Ai 인덱스]]` |
| 10_Dev/Standards | `> 📂 [[📋 컨벤션 인덱스]]` |
| 20_Personal | `> 📂 [[👤 프로필 인덱스]]` |
| 20_Personal/서재 | `> 📂 [[📖 서재 인덱스]]` |
| 30_Tools | `> 📂 [[🛠️ Tools 인덱스]]` |
| 40_Gaming | `> 📂 [[🎮 Gaming 인덱스]]` |
| 50_Recipes | `> 📂 [[🍳 Recipes 인덱스]]` |
| 00_Sandbox | 생략 (이동 후 추가됨) |

---

## 표준 태그 어휘

아래 태그를 우선 사용한다. 목록에 없는 개념은 소문자 하이픈 형식으로 새로 만든다.

| 카테고리 | 사용할 태그 |
|---------|-----------|
| **언어** | `java` `javascript` `typescript` `python` `html` `css` |
| **프레임워크** | `spring` `spring-boot` `react` `next` `vue` |
| **백엔드** | `backend` `database` `mysql` `jpa` `api` `rest` `oauth` `jwt` `servlet` `jsp` |
| **프론트엔드** | `frontend` `styled-components` `css-in-js` `framer-motion` |
| **서버/인프라** | `server` `aws` `docker` `nginx` `linux` `ssh` `dns` |
| **DevOps** | `devops` `cicd` `github-actions` `deployment` |
| **아키텍처** | `architecture` `design-pattern` `mvvm` |
| **디자인** | `design` `figma` `ui` `ux` `glassmorphism` `theme` |
| **AI** | `ai` `claude-code` `prompt` `agent` |
| **도구** | `tools` `ide` `git` `obsidian` `openclaw` `telegram` |
| **개인** | `personal` `goal` `idea` `portfolio` |
| **컨벤션** | `convention` `standard` |
| **웹 클리핑** | `clippings` |

---

## 분류 템플릿 (preview용)

`templates/` 폴더의 템플릿 파일을 참조한다. 사용자가 자유롭게 수정 가능.

| 내용 유형 | 적용 템플릿 |
|---------|-----------|
| Backend, Server, Frontend, DevOps, Design, Tools | `templates/TPL_기술가이드.md` |
| 아키텍처, 설계 패턴 | `templates/TPL_아키텍처.md` |
| 코딩 컨벤션, 표준 | `templates/TPL_컨벤션.md` |
| AI 프롬프트, 에이전트 | `templates/TPL_AI프롬프트.md` |
| 개인, 목표, 게임, 레시피 | `templates/TPL_개인노트.md` |
| 독서, 서평 | `templates/TPL_서재.md` |
