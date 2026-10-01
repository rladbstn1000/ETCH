# ETCH — 근거·버전·공개 범위

[저장소 소개](../../README.md) · [포트폴리오 공통 원고](ETCH.md) · [구조화 데이터](etch.json) · [공개 기술 사례](https://etch-showcase.pages.dev/process)

기록 기준: **2026-10-01**. 후속 포트폴리오 작성자가 수치의 조건·근거 위치·공개 여부를 함께 확인하기 위한 색인이다.

## 1. 자료의 범위

문서 초안은 기존 원격 README, 제공된 PHASE1~5·PHASE7·PHASE8·SHOWCASE 보고서, 후속 작업 완료 보고를 바탕으로 했다. 원격 반영 전 2026-10-01에 최신 로컬 MySQL 비교 JSON·관련 테스트 요약, 검색 후보·승인·활성 기록, 두 번째 Pages 배포 원본과 문서의 수치·조건을 직접 대조했다. 원본 기록의 확인이며 기존 실험·전체 로그·공개 브라우저 검증을 새로 실행한 것은 아니다.

| 자료 | 확인 범위 | 사용 방법 |
|---|---|---|
| 팀 README | GitHub 원격 원문 확인 | 기간·인원·역할·원래 기능 |
| 단계별 보고서 | 제공된 본문 확인 | 구현·실험 방법·한계 요약 |
| 최신 MySQL·검색 승인·배포 결과 | 완료 보고와 연결된 로컬 원본을 직접 대조 | 원본 경로와 커밋을 함께 보관하여 인용 |
| 로컬 소스·비교 JSON·실험 로그 | 인용 수치의 원본 대조, 전체 실험 재실행 없음·원격 미반영 | 최종 제출 시 필요한 주장에 연결된 원본만 확인 |
| 공개 사이트 | 기존 배포·공개 검증 기록과 주소 대조 | 이번 재배포·브라우저 재검증 없이 화면 체험과 실제 backend 실행을 구분 |

**로컬 커밋 표기는 식별자이며 GitHub 공개 코드 링크가 아니다.** 로컬 자료 경로도 링크가 아닌 코드로 표시한다. 이 문서를 원격 반영해도 후속 개선 코드와 전체 증거가 함께 반영되는 것은 아니다.

## 2. 팀 원문 보존

- 정리 직전 원격 코드: `b6feee5a3b0e29ed47cf82d96f51426d05e90fb5`.
- [당시 README 원문](https://github.com/rladbstn1000/ETCH/blob/b6feee5a3b0e29ed47cf82d96f51426d05e90fb5/README.md).
- README blob SHA: `5c91ee3822940de26ce072a393d66a887d5bd01c`.
- 이번 변경안의 루트 README에서 `ETCH-TEAM-README-2025` 구역 안에 원문 **17,380바이트**를 그대로 보존했다. 팀 구성·주차별 기록·이미지·링크·라이선스 본문을 고쳐 쓰지 않았다.
- 원문은 2025년 팀 당시 설명이다. 옛 운영 주소·버전·라이선스 설명·성능 표현을 현재 상태의 재검증으로 해석하지 않는다.

## 3. 주장별 근거

### E1. 프로젝트 검색 색인 자동 복구

**자료:** 제공된 `PHASE2.md`, `PHASE7.md`와 완료 보고. 로컬 원본은 `docs/portfolio/PHASE2.md`, `docs/portfolio/evidence/phase2-recovery.txt`, `docs/portfolio/evidence/phase7/migration-project-regression-v4.json`이다.

**구현:** 프로젝트 변경과 revision/outbox를 같은 MySQL 트랜잭션에 저장한다. 단일 worker가 최신 DB 스냅샷을 읽고 ES 반영·영속 재시도를 수행한다. `external_gte` revision과 비공개·삭제 tombstone을 사용한다.

**검증:** ES 중단 중 DB 저장, 미처리 상태의 backend 강제 종료·재시작, ES 복구 후 **수동 재색인 없이** DB·ES·실제 검색의 최신 상태가 일치했다. ES 반영 성공 후 outbox 완료 기록 전 종료도 별도로 검증했다.

**한계:** 단일 backend/worker의 at-least-once 최신 상태 수렴이다. exactly-once, 장애 중 검색 가용성, 다중 worker, ES 전체 소실 자동 복구를 보장하지 않는다. 공개 범위 검사는 DB 조회 시점 기준이다.

### E2. 채용·뉴스 증분 동기화

**자료:** 제공된 `PHASE3.md`, `PHASE7.md`. 로컬 원본은 `docs/portfolio/PHASE3.md`, `docs/portfolio/evidence/phase3-incremental-pq-confirmed.txt`, `docs/portfolio/evidence/phase7/migration-jdbc-regression-v4.json`이다.

**구현:** 원본과 같은 트랜잭션의 MySQL trigger, ID별 최신 상태 `search_sync_state`, UTC 마이크로초 변경 추적·revision·삭제 표식. JDBC 증분 조회, 입력별 checkpoint/PQ/DLQ, ID·revision·내용 대조와 현재 DB 기준 repair를 구성했다. 기존 외부 공고 ID unique와 뉴스 URL SHA-256 중복 방지는 팀 구현이다.

**설정:** 정상 폴링 10초·겹침 120초·fetch 50. 아래 측정은 **시험 폴링 2초·겹침 20초·fetch 50**, Mac M4 Pro/48GB의 로컬 Docker 합성 데이터 조건이다.

| 관측 | 결과 | 해석 |
|---|---|---|
| fixture | 공고·뉴스 각각 120건 생성 | 시험 중 삭제 후 원본 수와 구분 |
| 전체 원본 payload SELECT 반환 | 공고 120행·뉴스 121행 | 실제 DB 스캔량 아님 |
| 공고·뉴스 각 1건 변경 | 증분 predicate 각각 1행 반환 | 전체 처리 속도 배수 아님 |
| 겹침 이후 무변경 조회 | 각각 0행 반환 | 최근 행은 겹침 동안 재조회됨 |
| 변경 내용 반영 | 1.535초 | 제한된 로컬 관측 |
| 강화 장애의 ES 재개부터 복구 | 12.175초 | 운영 SLA 아님 |

**핵심 검증:** 변경이 겹침 밖으로 나가 해당 ID의 재조회가 0인 상태에서, PQ가 남은 Logstash를 SIGKILL·재생성하고 seed/repair 없이 검색을 복구했다. Mapping 오류는 DLQ로 확인하고 별도 운영자 복구를 수행했다.

**한계:** 이미 PQ에 읽힌 전송 실패와, 겹침 밖 지연 커밋으로 애초에 읽지 못한 변경은 다르다. 후자와 mapping 오류·임의 누락·저장 상태 손실은 대조·복구가 필요하다. DLQ도 유한 용량이다. checkpoint 전진/PQ 0만으로 내용의 정합성을 확정하지 않는다.

### E3. 고정 검색 평가와 승인 기준선

**자료:** 제공된 `PHASE4.md`, `PHASE7.md`, `PHASE8.md`와 후속 사용자 결정·활성화 완료 보고.

**로컬 원본:** `local/evaluation/queries.json`, `docs/portfolio/evidence/phase8/es947-final/summary.json`, `docs/portfolio/evidence/phase8/search-baseline-approval.json`, `docs/portfolio/evidence/phase8/active-search-baseline.json`.

유형별 24개 문서 정의·10질의, 관련도 0/1/2와 이유 총 720개를 평가 전에 고정했다. 이는 Codex가 작성한 작은 합성 코퍼스·관련도 기준이며 실사용자·전문가 평가가 아니다. gain 0/1/3, 할인 `log2(rank+1)`로 nDCG@5를 계산했다.

| 평균 nDCG@5 | 이전 | 승인된 새 엔진 |
|---|---:|---:|
| 채용 관련도순 | 0.932250 | 0.927753 |
| 뉴스 관련도순 | 0.911920 | 0.907424 |
| 프로젝트 최신순 | 0.707469 | 0.707469 |

`job-02/news-02`의 React 질의는 직접 관련 결과 2위→3위, 각각 0.926045→0.881078이다. 결과 소실은 없지만 실제 품질 손실은 보존했다.

제공된 PHASE8 본문의 `PROPOSED / UNAPPROVED`는 승인 이전 기록이다. **후속 결정에서 지정 후보만 승인·활성화**했으며 과거 비교 2건 FAIL은 보존했다. 승인 guard 41개, 활성화와 후속 검증 각각 30질의·통합 4개 PASS를 기존 실행 기록에서 확인했다. 이번 문서 작업에서 해당 검사를 다시 실행하지 않았다.

- 엔진: ES/Nori 9.4.7, Java Client 9.4.5.
- 후보 canonical SHA-256: `d1f4c74ab24fc3c484b8525447f9a46e4abe7a03b940938cb3e84effde01a05a`.
- 원본 summary SHA-256: `3e9907971785afe20b156754ec6d855e48ef1a4ed559b7ccb9d8728ae9216c95`.
- 승인 관련 로컬 커밋: `4fe89c6`, `90c582d`.

**한계:** 정확도 백분율·운영 검색 품질로 확대하지 않는다. 최신순 프로젝트와 관련도순 채용·뉴스는 목적이 다르다. 기존 후보 승인을 후속 backend 전체 빌드로 자동 확대하지 않는다. 결과가 바뀌어도 기준선을 자동 갱신하지 않는다.

### E4. MySQL 프로젝트 목록 조회 개선

**자료:** 사용자 제공 MySQL 완료 보고와 기술 사례 반영·배포 완료 보고, 원격 반영 전에 직접 대조한 로컬 비교 JSON·연결 측정 원본·관련 테스트 요약. 기존 결과를 읽어 확인했으며 MySQL을 기동하거나 재측정하지 않았다.

**로컬 원본:** `docs/portfolio/project-list-mysql.md`, `docs/portfolio/evidence/project-list-mysql/comparison.json` 및 연결된 실행계획. 기준선 커밋 `236bd38`, 개선 커밋 `7c26dbd`. 목록 Repository 메서드에만 EntityGraph를 적용했다.

**주 계측:** 실제 MySQL 합성 데이터, Controller 직접 호출→Service/JPA→DTO/JSON. 권한은 별도 MySQL MockMvc 검사다. 운영 HTTP 응답시간 측정이 아니다.

| 첫 전체 페이지 반환 건수 | 같은 작성자: 전→후 | 서로 다른 작성자: 전→후 |
|---:|---:|---:|
| 1 | 3→2 | 3→2 |
| 3 | 3→2 | 5→2 |
| 10 | 3→2 | 12→2 |
| 30 | 3→2 | 32→2 |
| 100 | 3→2 | 102→2 |

세 정렬에서 동일한 JDBC 실행 횟수다. 페이지 크기 100의 마지막 페이지에서 서로 다른 작성자 5건은 6→1회, 다음 빈 페이지는 2→2회다. 모든 페이지가 항상 2회라는 뜻이 아니다.

동일 **158조건**의 전체 응답 JSON 일치, 공개·삭제 필터·정렬·자료형·NULL·페이지 계약 유지, 목록 조회 전후 업무 21테이블과 revision/outbox 불변을 확인했다. 관련 **50테스트 중 MySQL MockMvc의 권한·상세·색인 스냅샷 검사 5개**가 포함된다. 나머지는 기존 H2·mock 기반 회귀이며, MockMvc도 소켓 HTTP end-to-end 검사는 아니다. 일반 모드의 성공 상세 조회는 기존 view/revision/outbox 증가를 별도로 검사했으며 목록 조회 불변과 구분한다. 158조건은 테스트 메서드 수나 운영 HTTP 요청 수가 아니다.

이전 `1a13eed`의 H2 개선은 중복 좋아요 COUNT 제거로 3건 페이지 SQL 7→4회였다. 이번 MySQL 작성자 추가 조회 개선과 다른 환경·문제이며 연속 성능 지표로 합산하지 않는다.

**한계:** Formula 내부 집계 비용은 남는다. 전체 N+1 해결·운영 지연 개선·조회 속도 51배라는 주장은 하지 않는다.

### E5. 공개 정적 체험판과 최신 배포

**자료:** `SHOWCASE.md`의 최초·후속 배포 기록, 사용자 제공 두 번째 production 배포 완료 보고와 직접 대조한 `docs/portfolio/evidence/showcase/pages-mysql-case-deployment.json`. 최초 기록을 최신 재실행으로 바꾸지 않으며 이번 문서 반영에서도 재배포·공개 브라우저 검증을 실행하지 않았다.

**공개 링크:** https://etch-showcase.pages.dev/ · https://etch-showcase.pages.dev/process

**로컬 원본:** `docs/portfolio/SHOWCASE.md`, `.local/showcase/mysql-case-study/manifest.json`과 연결 배포 증거. 이 경로의 파일을 이번 문서와 함께 공개한 것은 아니다.

| 항목 | 최신 기록 |
|---|---|
| 프로젝트·환경 | `etch-showcase` / production `main` |
| deployment | `7bb1fdec-1df1-492c-a30a-713ef16bc67c` |
| 고유 주소 | https://7bb1fdec.etch-showcase.pages.dev/ |
| 산출물 소스 | `b12eaf4` |
| 배포 후 문서·증거 커밋 | `7ed428f` — 빌드 커밋과 구분 |
| 파일·용량 | 9파일·803,579바이트 — 압축을 푼 정적 파일 합계 |
| 업로드 | 검토 ZIP 그대로, 재빌드 없음 |
| ZIP SHA-256 | `c0c919a4ba7b01c837d59a6c567d664ced46306a05a03c53581a5c8973d30dce` |
| 공개 검증 | production Chrome 8/8, 고유 주소 `/process` 1/1 PASS |
| 파일 대조 | 양 주소의 공개 payload 8개 본문·해시·MIME 및 보안 헤더 |
| 정상 흐름 네트워크 | API/OAuth/WebSocket/외부 데이터 호출 0회 |
| 이번 미실행 | Safari·WebKit·실물 모바일 |

`_headers`는 플랫폼 설정이므로 업로드 9파일과 공개 payload 8파일은 다르다. 최초 배포의 실제 Safari 핵심 흐름 검증을 최신 배포의 재검증으로 표시하지 않는다. 320/390px Chrome viewport 검사는 실물 모바일 검사가 아니다.

체험판은 별도 가상 공급부와 메모리 상태만 사용한다. 실제 로그인·제출·업로드·메시지 전송을 하지 않으며, 추천·채팅은 예시다. 공개 문자열 검색은 ES/Nori/BM25가 아니다.

## 4. 근거를 유지하는 작성 규칙

- 현재 정적 배포, 실제 backend 로컬 검증, 개선 소스의 원격 반영은 각각 다른 상태다.
- 서버 보안 잔여·과거 자격증명·공유 이력·자산 검토가 정적 배포로 완료된 것은 아니다. 이번 문서 변경은 해당 조치나 자료의 일괄 공개를 포함하지 않는다.
- 팀 원문의 기술·라이선스·운영 설명은 당시 기록으로 보존한다. 개인 고도화의 실제 동기화 방향은 MySQL→Elasticsearch로 설명한다.
- 서로 다른 단계의 테스트 수를 합쳐 하나의 최종 테스트 총수로 만들지 않는다.
- 최신 MySQL 조건은 후속 보고와 연결 원본을 대조한 것이며 이전 SHOWCASE의 H2 한계와 날짜를 덮어쓰지 않는다.
- 실제 원본을 확인하지 못한 사항은 추정하지 않고 확인 필요로 남긴다.

## 5. 원격 문서와 로컬 코드 통합 시 주의

### 첨부 초안에서 보완한 범위

원격 반영 전 대조에서 인용 수치의 불일치는 발견하지 않았다. 초안의 완료 보고 의존 상태를 이번 선택 원본의 직접 대조 상태와 구분하고, 마지막 5건의 작성자 조건과 MySQL MockMvc 5개의 포함 범위를 명확히 했다. 기존 팀 README 원문과 실험 결과는 수정하지 않았다. 전체 소스·검증 원본의 공개 승인을 뜻하지 않는다.

이번 문서를 원격에 반영하면 아직 push하지 않은 로컬 개발 브랜치와 원격이 갈라질 수 있다. 먼저 `git status`와 `git fetch origin` 후 문서 diff를 확인하고, 로컬 README의 최신 내용과 이번 보존 구역을 통합한다. 문서를 받기 위해 `reset --hard`나 강제 push를 사용하지 않는다. 전체 개선 코드·실험 로그 공개는 별도 범위 검토 후 진행한다.
