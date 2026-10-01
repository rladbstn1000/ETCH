# ETCH · Everyone 취업!

**채용·뉴스·프로젝트를 한곳에서 탐색하는 취업 지원 플랫폼**

[**화면 체험판 열기 ↗**](https://etch-showcase.pages.dev/)　·　[**개발 과정·기술 사례 ↗**](https://etch-showcase.pages.dev/process)　·　[포트폴리오 공통 원고](docs/portfolio-kit/ETCH.md)

| 팀 프로젝트 | 후속 개인 고도화 | 현재 공개 범위 |
|---|---|---|
| 2025.07~08 · 6명 | 김윤수 · 2026.09~10 | 가상 데이터 기반 정적 화면 체험판 |

> **문서와 코드의 범위**
>
> 아래는 팀 프로젝트 이후의 **개인 수정·추가 내용**입니다. 이번 원격 반영은 소개 문서이며, 후속 개선 코드·실험 원본 전체를 기본 브랜치에 합친 것은 아닙니다. 실제 backend는 로컬에서 구현·검증하고 외부에는 배포하지 않았습니다. 기존 팀 README는 하단에 원문 그대로 보존했습니다.

[화면 체험](#showcase) · [개인 개선 요약](#improvements) · [검증 결과](#results) · [추가 정비](#maintenance) · [포트폴리오 자료](#portfolio) · [기존 팀 기록](#team-record)

---

<a id="showcase"></a>
## 화면과 사용 흐름을 체험할 수 있습니다

홈·검색·채용·뉴스·프로젝트, 가상 마이페이지, 자기소개서·포트폴리오 편집, 스크랩·지원 현황을 둘러볼 수 있습니다. 변경은 메모리에만 남고 새로고침하면 초기화됩니다.

**실제 로그인·지원서 제출·업로드·메시지 전송은 하지 않습니다.** 추천·채팅은 예시 화면이며, 체험판의 문자열 검색은 Elasticsearch 검색이 아닙니다. `/process`는 실제 backend의 로컬 검증 기록을 요약한 페이지입니다.

최신 공개 반영 기준: 산출물 소스 `b12eaf4` · 배포 후 기록 `7ed428f` · [고유 배포 주소](https://7bb1fdec.etch-showcase.pages.dev/). 상세 조건은 [배포 근거 E5](docs/portfolio-kit/EVIDENCE.md#e5-공개-정적-체험판과-최신-배포)를 참고하세요.

<a id="improvements"></a>
## 개인 수정·추가 내용

팀 당시의 화면·API·수집·검색 구조와 기존 중복 방지를 유지하면서 다음 문제를 개선했습니다. 원래 기능을 새 개인 성과로 계산하지 않았습니다.

| 개선 사례 | 문제와 변경 | 확인한 결과 |
|---|---|---|
| **프로젝트 색인 자동 복구** | DB 커밋 후 ES 반영 실패에 대비해 동일 트랜잭션 outbox, 영속 재시도, revision·tombstone 도입 | 실제 ES 중단·backend 강제 종료/재시작 후 수동 재색인 없이 최신 검색 상태 복구 |
| **MySQL 목록 조회** | 작성자별 추가 SELECT를 재현하고 목록 메서드에만 EntityGraph 적용 | 서로 다른 작성자 100건의 JDBC 실행 **102→2회**, 동일 **158조건**의 응답 JSON 보존 |
| **채용·뉴스 증분 동기화** | ID별 최신 변경 상태와 삭제 표식, JDBC 겹침 조회, 입력별 checkpoint/PQ/DLQ 및 대조·repair | 시험에서 전체 원본 반환 공고 120행·뉴스 121행 대비 각 1건 변경 시 각각 1행. PQ 단독 복구와 운영자 복구를 구분 |
| **검색 평가·기준선 관리** | 30질의·720개 관련도 판정을 고정하고 실제 API 결과, 엔진 변경, 승인 기준선 분리 | 두 질의의 순위 손실을 기록하고 지정 후보만 승인·활성화. 과거 비교 2건 FAIL 보존 |

[문제·판단·구현·검증·한계 전체 읽기](docs/portfolio-kit/ETCH.md) · [주장별 근거와 원본 위치](docs/portfolio-kit/EVIDENCE.md)

<a id="results"></a>
## 측정 결과와 해석 범위

### MySQL — 작성자 추가 조회 개선

첫 전체 페이지에서 관측한 **JDBC 실행 횟수**입니다. 세 정렬에서 같은 결과를 확인했습니다.

| 반환 건수 | 같은 작성자: 전→후 | 서로 다른 작성자: 전→후 |
|---:|---:|---:|
| 1 | 3→2 | 3→2 |
| 3 | 3→2 | 5→2 |
| 10 | 3→2 | 12→2 |
| 30 | 3→2 | 32→2 |
| 100 | 3→2 | **102→2** |

실제 MySQL 합성 데이터에서 Controller 직접 호출부터 DTO/JSON 변환까지 계측했습니다. 동일 158조건의 응답을 비교했고, 관련 테스트 50개 중 MySQL MockMvc의 권한·상세·색인 스냅샷 검사는 5개입니다. 50개 전체가 실제 MySQL HTTP end-to-end 검사는 아닙니다. 마지막·빈 페이지는 횟수가 다르며, **운영 응답시간 개선이나 전체 N+1 해결을 주장하지 않습니다.** Formula 내부 집계 비용은 남습니다.

이전 H2의 **3건 SQL 7→4회**는 중복 좋아요 COUNT 제거라는 별도 개선입니다. [조건과 근거 E4](docs/portfolio-kit/EVIDENCE.md#e4-mysql-프로젝트-목록-조회-개선)

### 검색 — 결과가 달라진 사실까지 기록

| 합성 평가 nDCG@5 | 이전 기준선 | 승인된 새 엔진 기준선 |
|---|---:|---:|
| 채용 관련도순 | 0.932250 | 0.927753 |
| 뉴스 관련도순 | 0.911920 | 0.907424 |
| 프로젝트 최신순 | 0.707469 | 0.707469 |

React 관련 `job-02/news-02`는 직접 관련 결과가 **2위→3위**, 각 nDCG@5가 **0.926045→0.881078**로 내려갔습니다. 결과 소실은 없었지만 품질 손실을 알려진 한계로 수용했습니다. 승인된 현재 기준선 회귀와 과거 비교 FAIL은 별도로 보관합니다.

이는 자체 합성 평가이며 실사용자 검색 정확도나 정확도 백분율이 아닙니다. 프로젝트 최신순과 채용·뉴스 관련도순은 정렬 목적도 다릅니다. [평가·승인 근거 E3](docs/portfolio-kit/EVIDENCE.md#e3-고정-검색-평가와-승인-기준선)

<a id="maintenance"></a>
## 함께 정리한 기반

| 영역 | 후속 개인 작업 |
|---|---|
| 권한·응답 | 전체 허용 제거, 작성자 소유권·비공개 조회 검사, 인증/권한/검색 오류 구분, 토큰 로그 정리 |
| 검색 기본 동작 | 타입 기반 쿼리, 정확 필터·특수문자·날짜 경계, 검색어 변경 시 화면 상태 수정 |
| 실행·호환성 | 합성 seed, 격리된 새 볼륨 설치, 데이터 이관·복귀, Spring/ES 호환성 및 실제 회귀 검증 |
| 공개 체험 | 실제 API 모드와 정적 가상 공급부 분리, 기존 화면 재사용, 메모리 편집, 검토한 정적 파일만 Pages 배포 |
| 검증 기록 | 성공·실패·미실행·기존 증거 재사용을 구분하고 데이터·revision·큐 보존 여부 기록 |

복구는 단일 worker의 최신 상태 수렴 범위입니다. 증분 동기화는 이미 읽은 전송 실패와 겹침 밖에서 놓친 변경을 구분하며, 후자는 별도 대조·복구가 필요합니다. 서버 보안 잔여·과거 자격증명·전체 소스/자산 공개 검토는 별도 미완료 항목입니다. 정적 배포 성공을 해당 항목의 완료로 해석하지 않습니다.

<a id="portfolio"></a>
## 다른 프로젝트와 함께 사용할 포트폴리오 자료

| 파일 | 용도 |
|---|---|
| [ETCH 공통 원고](docs/portfolio-kit/ETCH.md) | 프로젝트 카드, 역할 구분, 네 사례, 재사용 문구, PPT·링크형 구성안, 면접 질문, 후속 제작 인계문 |
| [근거·버전 색인](docs/portfolio-kit/EVIDENCE.md) | 측정 조건·한계·로컬 원본 위치·커밋·공개 여부를 연결 |
| [구조화 데이터](docs/portfolio-kit/etch.json) | 여러 프로젝트를 같은 입력 형식으로 모아 제작하기 위한 수치·주장·근거 ID |

자료는 제공된 작업 보고서와 완료 기록을 바탕으로 정리하고, 원격 반영 전에 최신 로컬 MySQL 비교 원본·검색 승인·배포 기록과 대조했습니다. 기존 실험을 새로 실행한 것은 아닙니다. 원격에 없는 개선 커밋·원본 로그는 공개 코드 링크로 만들지 않았습니다. 이후 전체 포트폴리오를 만들 때는 이 원고를 재사용하고 필요한 로컬 원본만 확인하면 됩니다.

---

<a id="team-record"></a>
## 기존 팀 프로젝트 기록 · 원문 보존

아래는 **2025년 팀 프로젝트 당시 README 원문**입니다. 팀 구성·기여·기능·아키텍처·주차별 기록·라이선스 본문을 그대로 남겼습니다. 당시 운영 주소·버전·기술 표현은 역사 기록이며, 현재 체험판이나 후속 개인 검증 결과와 구분해 읽어 주세요.

<details>
<summary><strong>기존 README 전체 펼쳐보기 — 팀 소개·화면·아키텍처·주차별 기록·라이선스</strong></summary>

<!-- ETCH-TEAM-README-2025:BEGIN -->
# ETCH (엣취!)-README

> ***“Everyone 취업!”***
IT 취업 준비생을 위한 통합 취업 지원 플랫폼
> 

프로젝트 기간 : 2025.07 ~ 2025.08

**[✨Notion README 보러가기✨](https://antique-beechnut-31b.notion.site/ETCH-README-248b4441359c80f38e5fccf2413416f6?source=copy_link)**

---

# 🔗프로젝트 링크

<aside>

💡[**ETCH - Everyone, 취업! 엣취!**](https://etch.it.kr)

</aside>

# 👥 팀 구성

| 역할 | 이름 | 담당 업무 |
| --- | --- | --- |
| **팀장 & 인프라** | **한승수** | **CI/CD 구축, 서버 관리, DevOps** |
| **백엔드 [리드]** | **김윤수** | **백엔드 아키텍처 설계, 핵심 API 개발** |
| **백엔드** | **이재빈** | **OAuth 인증, 추천 기능, API 개발** |
| **백엔드** | **이현지** | **배치 시스템, Redis 캐싱, 데이터 수집, API 개발** |
| **프론트엔드 [리드]** | **지성현** | **프론트엔드 아키텍처, UI/UX 설계** |
| **프론트엔드** | **김성민** | **컴포넌트 개발, 사용자 인터페이스 구현** |

---

# 📋프로젝트 관리

## [Jira↗️](https://ssafy.atlassian.net/jira/software/c/projects/S13P11A402/summary)

- 스프린트 기반 일정 관리
- BE/FE/Infra 별 업무 분담
- 스토리 포인트 기반 작업량 추정
- 매주 월요일 작업 계획 수립

## [GitLab Repo↗️](https://lab.ssafy.com/s13-webmobile1-sub1/S13P11A402)

- Git Flow 적용 (master, dev, feat)
- Jira task를 통한 branch 생성

## [Notion↗️](https://www.notion.so/22a1a1b1012f809f96ecefba833c1fe9?pvs=21)

- 프로젝트 회의록 및 공유 문서 관리
- 팀 규칙 (그라운드 룰, 회의 룰) 명시
- 컨벤션 정리 (Git, Code, Naming, Jira, DB)
- 명세서 관리 (기능, API, ERD)
- 환경변수 및 설정 값 관리

---

# 🗺️ 프로젝트 아키텍쳐

![프로젝트 아키텍쳐](assets/아키텍처.jpg)

## 시스템 아키텍처 구성

**🔄 CI/CD Pipeline**
- **Jenkins**: Git Webhook을 통한 자동 빌드/배포
- **Docker Hub**: 컨테이너 이미지 저장소
- **Git**: GitLab을 통한 소스코드 관리

**🌐 Frontend (React)**
- **Nginx**: 리버스 프록시 및 로드 밸런서
- **Blue-Green 배포**: 무중단 배포 전략 적용
- **사용자 접근점**: SSAFY EC2를 통한 서비스 제공

**🏗️ Backend Microservices**
- **Business Server**: Spring Boot 기반 핵심 비즈니스 로직 (Blue-Green 배포)
- **Batch Server**: Python 기반 주기적 데이터 수집 및 처리
- **Recommend Server**: FastAPI 기반 개인 맞춤형 추천 시스템
- **Chatting Server**: Spring Boot + STOMP 기반 실시간 채팅

**💾 Data Storage**
- **MySQL**: 메인 관계형 데이터베이스
- **Redis**: 캐싱 및 세션 관리, 채팅 메시지 저장
- **MinIO**: S3 호환 객체 스토리지 (파일 업로드)

**📊 Monitoring & Logging**
- **Grafana**: 시스템 모니터링 대시보드
- **Promtail & Loki**: 로그 수집 및 분석

## 서버별 기술 스택 상세

| 구분 | 기술 스택 |
|------|-----------|
| **Frontend** | React, Typescript, Vite |
| **Batch Server** | Python, Redis(인기 Top10 캐싱), MySQL(공고/뉴스/기업 데이터 저장) |
| **Business Server** | Spring Boot, MySQL(메인 DB), Redis(Refresh 토큰), MinIO(이미지 저장), OAuth(google OAuth), JWT(Access/Refresh Token), Elasticsearch(통합 검색, 인덱스/필터 적용) |
| **Chatting Server** | Spring Boot, MySQL(채팅 내역 저장), Redis(채팅방 pub/sub 구조), STOMP(메시지 규약) |
| **Recommend Server** | Python FastAPI, Redis(추천 데이터 캐싱), MySQL(사용자 데이터 추출), Elasticsearch(인덱스 데이터 추출) |
| **CI/CD** | Jenkins, Nginx(certbot 활용 SSL 과 https 적용), 블루/그린 배포를 통한 무중단 배포, gitlab webhook 활용 CI, CD 후 MM 알림 |
| **Monitoring** | Prometheus, Grafana, Promtail, Loki |

---

# ❤️ 주요 서비스 소개

## 공고/기업/뉴스 정보를 한 눈에
- 사람인 API, 전자공시 API, News API 데이터를 Batch server를 통해 주기적으로 호출
- 데이터 전처리 과정을 통하여 프로젝트 최적화 후 DB에 저장
- 사용자 중심적 UI/UX 설계

## 개인/맞춤형 추천 서비스
- 사용자 활동 데이터 기반 맞춤형 채용 공고 및 뉴스 아이템 제공
- 단어 기반 추천율 매칭
- TF-IDF+LSA 방식을 통해 추천 유사도 매칭률을 증가

## 자소서/포트폴리오 작성
- 대표 자기소개서 질문에 대한 작성 가이드라인 제공
- 포트폴리오 작성 양식 제공
- 포트폴리오 작성 시 업로드한 프로젝트 내용 선택적 첨부 가능

## 프로젝트 SNS
- GitHub보다 가벼운 프로젝트 소개 커뮤니티
- 소스코드를 올리는 것이 아닌 프로젝트 관련 사진과 설명, 링크 등을 올려 프로젝트를 소개
- 프로젝트 아이디어 영감 및 인적 네트워킹 형성

---

# ✨ 주요 기술 소개

## ✅ 뉴스/채용공고/기업정보 최적화
- Job Scheduler & Redis RR 기법을 활용한 주기적인 데이터 업데이트
- 사용자 선호도 기반 TOP10 기업 추출 후 Redis 캐싱

## ✅ 실시간 채팅
- Spring Boot + STOMP + Redis 를 사용하여 채팅 서버 구현
- Redis pub/sub 구조를 통한 채팅방 구독 시스템 적용

## ✅ 검색 시스템
- Elasticsearch를 사용하여 통합 검색 및 인덱스/필터 최적화
- Logstash 를 통한 ES↔DB 데이터 동기화 (멱등성 보장)

## ✅ 추천 시스템
- 단어 등장 빈도 기반 추천 → TF-IDF 방식
- TF-IDF에서 LSA연산 추가
  - 추가 전: 0.4 유사도 → 추가 후: 0.8 유사도

---

# ⚡주차별 업적

## 🗓1주차~2주차 - 주제 선정

- **주제 선정**: 13번의 주제 회의, 30개 아이디어 도출
![alt text](assets/image.png)
- **최종 주제**: ***“통합 취업 지원 플랫폼 서비스”***
    
    > **ETCH (엣취!)**는 IT 취업 준비생들이 한 곳에서 모든 취업 준비를 할 수 있는 통합 플랫폼입니다. 채용 정보 제공부터 개인 맞춤 추천, 프로젝트 SNS, 자소서/포트폴리오 작성 지원까지 취업 준비에 필요한 모든 기능을 제공합니다.
    > 
    

## 📄3주차 - 명세서 작성

### **기능 명세서**

| 역할        | 통합 채용 정보                                                                                        | 맞춤형 콘텐츠 추천                                               | 프로젝트 SNS                                                   | 취준 어시스턴트                                                                      |
| --------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 기능 명세서 작성 | - 다중 API (사람인 API, NewsAPI, DartAPI) 기반 데이터 수집<br>- ElasticSearch 기반 통합 검색 기능<br>- 실시간 채용 알림 전송 | - 사용자 관심 분야 및 활동 기반 추천 알고리즘<br>- 맞춤형 채용 공고, 뉴스, 기업 정보 제공 | - 프로젝트 공유 및 팀원 모집 플랫폼<br>- 커뮤니티 기반 개발자 네트워킹<br>- 실시간 채팅 기능 | - AI 기반 자기소개서/포트폴리오 작성 지원<br>- 개인 맞춤형 가이드라인 및 템플릿 제공<br>- 대시보드 기반 취업 준비 현황 분석 |


### **API 명세서**

![alt text](assets/api.png)

### **UI/UX**

![UI/UX Thumbnail](assets/design.png)
![Figma Thumbnail](assets/메인썸네일.png)

### **ERD 설계**

![ERD Thumbnail](assets/공통ERD.png)
## 데이터베이스 구조

| 카테고리 | 테이블명 | 설명 |
|---------|----------|------|
| **👤 사용자 관리** | member | 사용자 기본 정보 (로그인, 권한 등) |
| | profile | 사용자 프로필 상세 정보 |
| | tech_stack | 사용자별 기술 스택 관리 |
| **💼 채용 정보** | job | 채용 공고 정보 (사람인 API 연동) |
| | company | 기업 정보 (전자공시 API 연동) |
| | job_scrap | 사용자별 채용 공고 스크랩 |
| **📰 뉴스 & 콘텐츠** | news | IT 뉴스 정보 (News API 연동) |
| | news_scrap | 사용자별 뉴스 스크랩 |
| **🚀 프로젝트 & 포트폴리오** | project | 프로젝트 정보 및 SNS 기능 |
| | project_tech | 프로젝트별 사용 기술 |
| | project_comment | 프로젝트 댓글 |
| | portfolio | 사용자 포트폴리오 |
| | portfolio_project | 포트폴리오-프로젝트 연결 |
| **💬 채팅 시스템** | chatting | 실시간 채팅방 관리 |
| | chat_participant | 채팅방 참여자 |
| | chat_message | 채팅 메시지 |
| **🎯 추천 시스템** | recommend | TF-IDF + LSA 기반 개인 맞춤 추천 |
| | user_activity | 사용자 활동 로그 (추천 알고리즘 학습용) |

---

## 🔧4주차 - CI/CD 구축 및 개발 시작

| 역할 | 담당자 | 주요 업무 |
|------|--------|-----------|
| **🏗️ 인프라 & DevOps** | **한승수 (팀장 & 인프라)** | • Jenkins CI/CD 파이프라인 구축<br>• GitLab Webhook 연동 자동화<br>• Nginx 리버스 프록시 설정 |
| **💻 백엔드 개발** | **김윤수 (백엔드 리드)** | • 기본 CRUD 구현<br>• ElasticSearch 테스트 및 설정<br>• ERD 조정 및 백엔드 업무 분담 조정 |
| | **이재빈 (백엔드)** | • 기본 CRUD 구현<br>• Google OAuth 연동 시스템 구축<br>• JWT Token 적용 (Access, Refresh Token) |
| | **이현지 (백엔드)** | • 기본 CRUD 구현<br>• 코스피, 코스닥 기준 주요 회사 정리<br>• 회사별 NewsAPI 호출 서버 구축<br>• Redis 활용 인기 Top10 기능 구현 |
| **🎨 프론트엔드 개발** | **지성현 (프론트엔드 리드)** | • 변형 Atomic Design 패턴 적용 (atoms → molecules → organisms → pages → layout)<br>• React Router 페이지 관리 (SPA 라우팅 및 코드 스플리팅) |
| | **김성민 (프론트엔드)** | • 변형 Atomic Design 패턴 적용 (atoms → molecules → organisms → pages → layout)<br>• React Router 페이지 관리 (SPA 라우팅 및 코드 스플리팅) |

## 🎯5주차 - 집중 개발 기간

| 역할 | 담당자 | 주요 업무 |
|------|--------|-----------|
| **🏗️ 인프라 & DevOps** | **한승수 (팀장 & 인프라)** | • Prometheus와 Grafana를 적용하여 모니터링 시스템 구축<br>• 빌드/배포 시간 최적화<br>• 블루/그린 배포 전략 적용 |
| **💻 백엔드 개발** | **김윤수 (백엔드 리드)** | • 검색 API 구현<br>• ElasticSearch 적용 및 최적화<br>• ChattingServer 작업 |
| | **이재빈 (백엔드)** | • 자소서/포트폴리오 API 구현<br>• RecommendServer 작업 |
| | **이현지 (백엔드)** | • ERD 정규화 작업<br>• JPQL 쿼리 최적화<br>• 프로젝트 API 구현 |
| **🎨 프론트엔드 개발** | **지성현 (프론트엔드 리드)** | • 프로젝트/뉴스/인기/채용/좋아요 API 연결<br>• 주요 모달창 구현 |
| | **김성민 (프론트엔드)** | • 메인페이지 레이아웃 구현<br>• OAuth 연결<br>• 검색/뉴스/프로젝트/채용/파일 API 연결 |

## 🏆6주차 - 프로젝트 완성

| 역할 | 담당자 | 주요 업무 |
|------|--------|-----------|
| **🏗️ 인프라 & DevOps** | **한승수 (팀장 & 인프라)** | • Gradle 캐싱 활용 빌드/배포 시간 단축<br>• 블루/그린 배포(Frontend, Business Server) 적용 → 무중단 배포<br>• 실시간 채팅 서버 구현<br>• 최종 시스템 모니터링 및 안정화 |
| **💻 백엔드 개발** | **김윤수 (백엔드 리드)** | • Elasticsearch 인덱싱 최적화 및 필터 구현<br>• 분석/통계 API 개발<br>• 채용 공고 데이터 전처리 완성 |
| | **이재빈 (백엔드)** | • 데이터 문서화(.md) API 개발<br>• 추천 서버 구현(TF-IDF+LSA) 완성<br>• OAuth 인증 시스템 최적화 |
| | **이현지 (백엔드)** | • JPQL 쿼리 최적화<br>• 인기 TOP10 Redis 캐싱 시스템 완성<br>• Batch server 스케줄링 최적화 |
| **🎨 프론트엔드 개발** | **지성현 (프론트엔드 리드)** | • 포트폴리오 상세보기/작성/수정 화면 구현<br>• 프로젝트 상세보기/작성/수정 화면 구현<br>• API 연동 및 UI 최적화 |
| | **김성민 (프론트엔드)** | • 팔로워/팔로잉 컴포넌트 구현<br>• 통합 검색 페이지 구현<br>• API 연동 및 UI 최적화 |

---

## 🛠기술 스택

| 분류 | 기술 |
|------|------|
| **Programming Languages** | TypeScript, Java, Python |
| **Frameworks** | React, Spring Boot, Spring Security, Oauth, JWT |
| **Databases** | MySQL, Redis, MinIO(S3) |
| **Version Control** | Git, GitLab, Jira |
| **Cloud Services** | EC2, MySQL(Azure) |
| **Deployment Tools** | Docker, DockerHub |
| **CI/CD** | Jenkins, Nginx |
| **Monitoring** | Prometheus, Grafana, Promtail, Loki |
| **OpenSource** | Elasticsearch |
| **API** | 뉴스API, 기업API, 채용API |
| **Co-op** | Jira, Figma, Notion, Git/GitLab |

---

# 📄 라이센스

본 프로젝트는 다음과 같은 오픈소스 라이브러리와 프레임워크를 사용합니다:

## 주요 의존성 라이센스

### Backend (Spring Boot)
- **Spring Boot 3.5.4** - [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0)
- **Spring Security & OAuth2** - [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0)
- **JWT (jsonwebtoken)** - [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0)
- **MySQL Connector/J** - [GPL v2 with FOSS Exception](https://www.mysql.com/about/legal/licensing/foss-exception/)
- **Redis** - [BSD 3-Clause License](https://redis.io/legal/licenses/)
- **Elasticsearch** - [Elastic License 2.0](https://www.elastic.co/licensing/elastic-license)

### Frontend (React)
- **React 19.1.0** - [MIT License](https://github.com/facebook/react/blob/main/LICENSE)
- **TypeScript** - [Apache License 2.0](https://github.com/Microsoft/TypeScript/blob/main/LICENSE.txt)
- **Vite** - [MIT License](https://github.com/vitejs/vite/blob/main/LICENSE)
- **Redux Toolkit** - [MIT License](https://github.com/reduxjs/redux-toolkit/blob/master/LICENSE)
- **Axios** - [MIT License](https://github.com/axios/axios/blob/v1.x/LICENSE)
- **TailwindCSS** - [MIT License](https://github.com/tailwindlabs/tailwindcss/blob/master/LICENSE)

### Python Services (Batch & Recommend Server)
- **FastAPI** - [MIT License](https://github.com/tiangolo/fastapi/blob/master/LICENSE)
- **scikit-learn** - [BSD 3-Clause License](https://github.com/scikit-learn/scikit-learn/blob/main/COPYING)
- **NumPy** - [BSD 3-Clause License](https://github.com/numpy/numpy/blob/main/LICENSE.txt)
- **Requests** - [Apache License 2.0](https://github.com/psf/requests/blob/main/LICENSE)
- **PyMySQL** - [MIT License](https://github.com/PyMySQL/PyMySQL/blob/main/LICENSE)
- **APScheduler** - [MIT License](https://github.com/agronholm/apscheduler/blob/master/LICENSE.txt)

### Infrastructure & DevOps
- **Docker** - [Apache License 2.0](https://github.com/moby/moby/blob/master/LICENSE)
- **Jenkins** - [MIT License](https://github.com/jenkinsci/jenkins/blob/master/LICENSE.txt)
- **Nginx** - [BSD 2-Clause License](http://nginx.org/LICENSE)
- **Prometheus** - [Apache License 2.0](https://github.com/prometheus/prometheus/blob/main/LICENSE)
- **Grafana** - [AGPL v3 License](https://github.com/grafana/grafana/blob/main/LICENSE)

## 프로젝트 라이센스

이 프로젝트는 **MIT License** 하에 배포됩니다.

```
MIT License

Copyright (c) 2025 ETCH Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 주의사항

- **Elasticsearch**: Elastic License 2.0에 따라 상업적 용도로 사용 시 제한이 있을 수 있습니다.
- **MySQL**: GPL v2 라이센스이지만 FOSS Exception이 적용되어 오픈소스 프로젝트에서 자유롭게 사용 가능합니다.
- **외부 API**: 사람인 API, News API, 전자공시 API 등은 각각의 이용약관을 따릅니다.

자세한 라이센스 정보는 각 의존성의 공식 문서를 참조하시기 바랍니다.

---

**ETCH Team © 2025. All rights reserved.**
<!-- ETCH-TEAM-README-2025:END -->

</details>
