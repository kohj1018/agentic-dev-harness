# 아키텍처 개요

## 1. 기술 요약
<!-- 한두 문장으로 이 시스템이 무엇인지, 어떤 기술로 구성되는지 적는다. -->

## 2. 시스템 경계
<!-- 이 시스템이 다루는 것과 다루지 않는 것. 외부 시스템과의 경계선. -->
<!-- C4 관점: 이 섹션은 System Context 레벨에 해당한다. -->

## 3. 상위 아키텍처
<!-- 주요 실행 단위(서비스, 모듈, 패키지)와 그 관계. -->
<!-- C4 관점: 이 섹션은 Container 레벨에 해당한다. -->

## 3-1. 레이어 경계 + 의존성 규칙
<!-- 프로젝트 규모가 정당화될 때만 채운다. 단일 모듈 prototype은 비워둬도 된다.
     단, 모듈이 3개 이상으로 분리되면 채운다. (정책: ADR-006)

     기재 항목:
     - 레이어 정의 (예: Domain / Use Case / Interface Adapter / Framework)
     - 의존성 방향 (예: Domain ← Use Case ← Interface Adapter ← Framework)
     - ASCII 다이어그램 또는 화살표 그림
     - 위반 사례 1~2개 예시 (예: Framework 코드가 Domain을 직접 import하면 OK / 반대 방향은 violation)

     /stabilize-milestone이 모듈 수 ≥3 시 이 섹션 채움을 권장 출력한다. -->

## 4. 주요 도메인 모델
<!-- 핵심 엔티티와 관계. 과도한 세부 필드보다 개념 수준. -->

## 4-1. 상태 모델 (조건부)
<!-- 상태 머신이 있는 도메인에서만 채운다 (없으면 비워둠 — ADR-057).
     기재: 엔티티별 상태·전이(단방향/가드 조건)·멱등 요구(재시도 시 보장)·2차-write 목록(본 상태 변경이 갱신해야 하는 파생 저장소 — cache/index/알림).
     /plan-workitem seam self-check와 feature ## 7-2가 본 섹션을 참조한다. -->

## 5. 데이터 흐름
<!-- 주요 데이터가 시스템을 통해 어떻게 흘러가는지. -->

## 6. 외부 연동 지점
<!-- 외부 API, 서드파티 서비스, 외부 데이터 소스. -->

## 7. 기술 선택
<!-- 언어, 프레임워크, DB, 인프라 등 주요 기술 선택과 이유.
     스택이 아직 안 정해졌으면 여기에 "미정"으로 적지 말고 DECISION_REGISTER에 open 항목으로 등재한다 (ADR-060 D1) — 정본에 미정을 적으면 아무도 회수하지 않는다. -->

<!-- 고-stakes 결정(되돌리기 비쌈 / 대안 2+ / 3+ 모듈·cross-surface / 보안·데이터·마이그레이션 — ADR-053 게이트)은 아래 *결정 블록*으로 기록한다. 저-stakes 선택은 한 줄로 족하다(과기록 금지 — ADR-006).

### 결정: <무엇을 정했나>
- 고려한 옵션 (≥2): <A> / <B> / <C>
- 선택: <고른 것>
- 이유: <편익> + <받아들인 제약·비용>   ← 편익만 적지 말 것
- 기각한 대안 + 이유: <왜 A/B를 안 골랐나>
- 신뢰도: High | Medium | Low — <근거 한 줄>
- 재검토 트리거: <어떤 조건이 되면 다시 본다>
- 관련 품질속성(§8): <민감점·트레이드오프점 — 해당 시>
-->

<a id="arch-7-1"></a>
## 7-1. API 컨벤션
<!-- API 스택일 때만 채운다. /bootstrap-stack이 소항목별 authority에 따라 채운다 — 되돌리기 비싼 소항목은 사용자 승인, 나머지는 architect 단발 호출 + 라운드 끝 일괄 확인 (ADR-060 D9).
     **비-API 프로젝트는 스택 확정 시 /bootstrap-stack이 본 sub-section을 통째 삭제.** -->

### 응답 envelope
<!-- 예: `{ data, error, meta }` 또는 RFC 7807 problem+json 등 -->

### HTTP 상태 코드 매핑
<!-- 비즈니스 에러 ↔ HTTP 상태 매핑 표 -->

### error 레지스트리
<!-- 도메인 에러 코드 일람. 예: `USER_NOT_FOUND` (404), `INVALID_INPUT` (400) -->

### 네이밍
<!-- 단/복수형, snake_case vs camelCase, 자원 vs 액션 -->

### 페이지네이션
<!-- offset / cursor / keyset, 응답 형식 -->

### Don'ts
<!-- 예:
     - envelope 변경 금지
     - error code ad-hoc 추가 금지
     - endpoint 단/복수형 혼용 금지
     - 비차단 fail이 200 OK로 가는 패턴 금지 -->

<a id="arch-7-2"></a>
## 7-2. CLI 컨벤션
<!-- CLI 라이브러리 사용 시만 채운다. /bootstrap-stack이 소항목별 authority에 따라 채운다 (ADR-060 D9).
     **비-CLI 프로젝트는 스택 확정 시 /bootstrap-stack이 본 sub-section을 통째 삭제.** -->

### 출력 포맷
<!-- text / JSON / table 모드 + 기본 모드 / TTY 감지 정책 -->

### 플래그·명령어
<!-- 명령어 트리, 플래그 컨벤션(`--`/`-`), 도움말 포맷 -->

### TTY/ANSI 정책
<!-- 색상 / progress bar / TTY 미감지 시 fallback -->

### Don'ts
<!-- 예:
     - JSON/표 출력 모드 일관성 위반 금지
     - TTY 감지 없는 ANSI 색 금지
     - interactive prompt가 `--yes`로 우회되지 않는 패턴 금지 -->

<a id="arch-7-3"></a>
## 7-3. 백엔드 결정
<!-- 백엔드 스택일 때만 채운다. /bootstrap-stack이 채운다.
     **비-백엔드 프로젝트는 스택 확정 시 /bootstrap-stack이 본 sub-section을 통째 삭제.** -->

### DB migration
<!-- 도구 / 버전 관리 / rollback 정책. 예: 자동(ORM) vs 수동(SQL 파일), 배포 순서(blue-green / rolling). -->

### 인증·인가
<!-- 세션 vs JWT / OAuth / RBAC vs ABAC. 만료·갱신 정책. -->

### 트랜잭션 경계
<!-- 어디서 begin/commit / nested 처리. -->

### Idempotency
<!-- key 정책 / TTL / 중복 응답. POST 요청 dedup window. -->

### Rate limit
<!-- per-user / per-endpoint / 응답 헤더. 예: `X-RateLimit-*`. -->

### Async job
<!-- queue / worker / retry 정책. 작업 상태 polling vs webhook. -->

### Caching
<!-- HTTP cache / app cache / invalidation. 계층(CDN / in-process / Redis), TTL 정책. -->

### API versioning
<!-- header / URL / breaking 정책. URL prefix(`/v1`) vs header(`Accept-Version`). -->

<a id="arch-7-4"></a>
## 7-4. 프론트 결정
<!-- 프론트 스택일 때만 채운다. /bootstrap-design 또는 /bootstrap-stack이 채운다.
     **비-프론트 프로젝트는 스택 확정 시 /bootstrap-stack이 본 sub-section을 통째 삭제.** -->

### 라우팅
<!-- file-based vs config-based / 동적 라우트 / 가드. 예: Next.js App Router vs React Router. -->

### 상태관리
<!-- 글로벌 store 사용 여부 / 서버 상태(React Query 등) / 폼 상태. 예: TanStack Query / Zustand / Jotai / Redux. -->

### SSR-CSR
<!-- 페이지별 렌더링 모드 / 데이터 로딩 정책. 하이드레이션 경계. -->

### i18n
<!-- 라이브러리 / 사용자 언어 감지 / RTL. -->

### SEO
<!-- meta / sitemap / 구조화 데이터 / canonical URL. -->

### 인증
<!-- 토큰 저장(쿠키/storage) / refresh / OAuth 콜백. 보호 라우트 처리. -->

### 폼 validation
<!-- 라이브러리 / async validation / 에러 표시 정책. 예: Zod / Yup / react-hook-form + 서버 이중 검증. -->

<a id="arch-7-5"></a>
## 7-5. 모바일 클라이언트 결정
<!-- 모바일 앱 스택(Flutter 등)일 때만 채운다. /bootstrap-stack이 채운다.
     **비-모바일 프로젝트는 스택 확정 시 /bootstrap-stack이 본 sub-section을 통째 삭제.**
     웹 전용 결정(SSR·SEO·쿠키 토큰 등)은 `## 7-4`가 소유한다 — 중복 기재 금지.
     본 자리의 신설·소유·삭제 규칙은 ADR-027#amend-8이 소유한다. ADR-059 D7. -->

### 대상 플랫폼·최소 OS
<!-- Android / iOS 중 무엇을 지원하는가, 각 최소 버전. 졸업 기준의 "선언된 target"이 여기서 나온다. -->

### 화면 이동
<!-- 라우팅 방식과 라이브러리. 딥링크 처리 위치. 예: go_router / Navigator 2.0. -->

### 상태관리
<!-- 무엇을 쓰는가와 그 이유. 프레임워크 내장 수단으로 충분한지, 외부 라이브러리를 쓰는지. -->

### 로컬 저장·오프라인
<!-- 저장소 종류, 스키마 마이그레이션, 오프라인 큐·동기화 정책. -->

### 권한 요청 흐름
<!-- 어떤 권한을, 언제, 거부 시 어떤 화면으로. -->

### 네이티브 연동
<!-- platform channel 사용 여부와 경계. 네이티브 코드가 들어가는 위치. -->

### 빌드 flavor·환경변수
<!-- dev/staging/prod 분리 방식, `--dart-define` 키 이름. -->

### 백그라운드·앱 생명주기
<!-- 백그라운드 작업, 푸시 수신, 포그라운드 복귀 시 갱신 정책. -->

### WebView 브리지 (해당 시)
<!-- 앱 안에 웹 화면을 넣는 경우: 로드할 주소, 앱↔웹 데이터 교환 방식, 인증 토큰 전달 방법.
     해당 없으면 "N/A". -->

### 서명·배포
<!-- 서명키 보관 위치(저장소 밖), 스토어 계정, 버전 규칙, 크래시 리포팅. -->

### Don'ts
<!-- 예:
     - 화면 위젯에서 저장소·네트워크 직접 호출 금지
     - 권한 요청을 앱 시작 시 일괄 요청 금지
     - 서명키·인증서를 저장소에 커밋 금지
     - 배포 빌드에 디버그 전용 진입점(테스트 드라이버 등) 포함 금지 -->


## 8. 품질 속성
<!-- 프로젝트에서 중요한 품질 요구사항을 시나리오 기반으로 정리한다.
     모든 항목을 채울 필요는 없다. 프로젝트에 해당하는 것만 작성한다. -->

### 성능
<!-- 예: 핵심 사용자 흐름의 응답시간 목표, 동시 사용자 기대치 -->

### 보안
<!-- 예: 보호해야 할 데이터, 인증/인가 최소 기준, 민감 데이터 처리 방침 -->

### 신뢰성
<!-- 예: 허용 가능한 장애 범위, 데이터 유실 허용 수준 -->

### 운영성
<!-- 예: 로그/모니터링/추적성 기대 수준, 배포 빈도 -->

## 9. 리스크

<!-- ## 10. 열린 질문 — 폐지(결번). 기술 미결정은 docs/10-charter/DECISION_REGISTER.md가 소유한다 (ADR-060 D1).
     섹션 번호는 재사용하지 않는다. -->