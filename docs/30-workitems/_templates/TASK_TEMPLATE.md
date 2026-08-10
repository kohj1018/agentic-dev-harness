# T-xxx-이름

## 0. Status
draft
<!-- 값은 헤딩+1 줄(위)에 둔다 — 주석은 값 *뒤*("헤딩+1=상태값" 파서 보호). draft(계획 작성 중) → ready(**/seal-milestone이 봉인 시 일괄 승격** — plan-workitem은 승격하지 않는다. ADR-060 D7) → in-progress(모든 preflight 통과 뒤 implement dispatch 직전) → done(finalize). 유일한 역전이: 검증된 완료 결함을 repair-workitem이 Adopt/Adopt-modified한 경우의 `done → in-progress`. implement는 ready 신규 착수/in-progress 재개만, finalize는 in-progress만 done. ADR-057#amend-3 결정 5. -->

## 0-1. Type
<!-- feature | technical-enabler | bugfix | refactor | migration | research-spike. 미기재 시 feature.
     - technical-enabler: 사용자 시나리오가 없는 기술 작업(SDK/로깅/의존성/CI). ## 1에 기술적 근거 + 어떤 가정/기회(DISCOVERY assumption ID)·상위 결정(ADR)을 서비스하는지 링크.
     - bugfix: 아래 ## 3-T 트러블슈팅 sub-template을 채운다(## 3 대신).
     - refactor: 외부 행동 불변. AC는 "행동 동일 + 구조 개선 측정".
     - migration: bootstrap-stack --migrate contract(ADR-041)와 연결. expand-contract 단계를 ## 3에 명시.
     - research-spike: 산출은 리서치 노트(/research-pack, ADR-040). TDD opt-out 기본.
     정책: ADR-039. -->
feature

## 1. 작업 목적

## 2. 작업 범위
<!-- 이 task가 외부 경계를 건드리면 plan-workitem이 범위 끝에 다음 한 줄을 박는다 (ADR-064 D1).
     종류는 (a) 영속 저장소 쓰기 / (b) 외부(서드파티·타 시스템) 네트워크 호출 / (c) 실행 진입점 세 가지이고, **해당하는 것만 골라 적는다** — "(a)/(b)/(c) 중 해당" 처럼 뭉뚱그리면 구현·검증이 어느 경계에 증거가 필요한지 알 수 없다.
     예: `- 외부 경계: (a) 영속 저장소 쓰기, (c) 실행 진입점 — 구현 시 경계 종류마다 실행 증거 필요`
     같은 저장소·같은 배포 단위 안의 서비스 간 호출은 (b)가 아니다. 셋 다 해당 없으면 이 줄을 적지 않는다. -->

## 3. 구현 항목
<!-- plan-workitem이 *단계별 구현 가이드*로 채운다 (ADR-026#amend-2). 그 문서만 보고 따라 하면 구현이 끝날 만큼 구체적으로.
     각 단계 형식: `N. <파일경로[:라인/식별자]> — 현재: <상태> → 변경: <정확한 수정(필요 시 before/after)> → 확인: <검증 방법>` (가능하면 끝에 `(AC-N)` 태그).
     모호 지시("적절히 처리") 금지. 새 외부 의존이 필요하면 설치 단계도 명시 (ADR-040#amend-1) — 예: N. 의존성 설치 — `pnpm add <pkg>@<ver>` 실행 (용도: ...) (AC-N).
     `/plan-workitem M<N>`이 전 feature의 `## 3`를 한 번에 완성한다(ADR-026#amend-4 — `## 3` SSOT; ADR-057#amend-3 — draft tier 폐기; 의도-수준 draft 마커 없음). implement 진입 preflight는 draft 검사가 아니라 접지 유효성만 가볍게 본다(ADR-057#amend-3).
     단계가 feature ## 7-2의 invariant를 집행하면 끝에 (INV-N) 태그를 붙일 수 있다 (ADR-057).
     외부 계약 사실(엔드포인트·파라미터명·응답 필드명/타입/nullable·페이지네이션·인증 헤더 형식)을 아직 실측하지 않았으면 확정으로 적지 말고 다음 형식으로 박는다 (ADR-064 D3):
       `- [미실측] <무엇> — 잠정값: <값> / 출처: <URL 또는 문서> / 확인 방법: <어떻게 실측> / 해소: 구현 1단계`
     번호 단계 아래 하위 불릿으로 둘 수 있고, 이후 참조 키는 단계 번호가 아니라 `<무엇>` 문자열이다(단계 재배치에 깨지지 않게). implement가 실측 후 `[실측 YYYY-MM-DD]`로 바꾸고 관측값으로 교체한다. AC(## 6)에는 이 표기를 쓰지 않는다 — AC는 행동을, ## 3는 배선 사실을 담는다. -->

## 3-T. 트러블슈팅 (Type=bugfix 일 때만 — 아니면 본 섹션 삭제)
<!-- 증상만 있고 AC가 없는 작업의 root-cause 절차. 채운 뒤 회귀 테스트 AC를 ## 6에 박는다. -->
- **증상(Symptom):** <사용자가 본 잘못된 동작>
- **재현 절차(Repro):** <1. … 2. … 결정적 재현 순서>
- **기대 / 실제(Expected / Actual):**
- **관측(Observed):** <로그·에러·스택트레이스·네트워크 등 1차 증거>
- **가설(Hypotheses):** <1~3개, 각 검증 방법 1줄>
- **근본 원인(Root cause):** <확정된 원인 — 가설 검증 후 채움>
- **회귀 테스트 AC:** <이 버그를 재현하는 실패 테스트를 ## 6 AC-N으로 박는다(Red→Green)>

## 4. 제외 항목

## 4-1. 변경 예정 파일/경로
<!-- 구현 시점에 채운다. /finalize-workitem이 명시적 파일 add 시 우선 참조한다.
     엄격한 화이트리스트가 아니라 참조 목록이다. 비어 있거나 git 실제 변경과 어긋나면 finalize는 차이를 출력에 명시하고 Needs Review로 즉시 종료한다 — 본 섹션을 갱신해 재실행하거나 `--apply` force 모드로 진행한다.
     task 문서 자체는 finalize가 자동 포함하므로 본 섹션에 적지 않는다. -->

## 5. 완료 조건
<!-- 이 task가 끝났다고 사람이 판단하는 상위 요약 (예: "로그인 폼이 동작하고 에러를 표시한다").
     측정 가능한 검증 단위는 ## 6 Acceptance Criteria 가 담당 — 본 섹션은 그 사람용 요약이다. -->

## 6. Acceptance Criteria
<!-- AC는 Given-When-Then *형식 강력 권장*. measurable verb 사용:
     권장(좋은 예): returns, displays, persists, rejects, emits, responds with, contains, matches
     강력 금지(절대 비측정): works, looks good, is correct, is fine
     문맥상 허용: handles, supports — 단 *무엇을 / 어떻게*까지 명시되면 허용
     AC 3개 이하 권장(4개 이상이면 task 분해 *권장 텍스트*).
     위반 시 planner는 *재분해 권장 텍스트*를 출력, builder는 *재분해 요청 텍스트*를 Red phase 직전 출력 — 자동 차단은 하지 않는다(사용자 결정). 정책: ADR-026.
     UI task로 프로토타입 경험 결정을 구현하는 AC는 끝에 `(PX-M<N>-<screen>-NN)` 태그를 붙일 수 있다(ADR-056#amend-1 — (AC-N)·(INV-N) 태그와 동형). feature `## 7-3` PX↔AC 매핑의 근거. -->
- AC-1 [Given] ... [When] ... [Then] ...
- AC-2 [Given] ... [When] ... [Then] ...

## 6-1. 테스트 시나리오 (TDD Red)
<!-- 각 AC에 대응하는 테스트 파일·테스트 이름. 사람이 미리 채우거나 builder가 Red phase 시작 전에 채운다.
     테스트 이름에 `AC_N` 또는 `[AC-N]` 식별자 포함 강력 권장 (ADR-009 amend).
     예:
     - AC-1 → tests/auth/me.spec.ts > test_AC_1_unauthenticated_returns_401
     - AC-2 → tests/auth/me.spec.ts > test_AC_2_authenticated_returns_user
     - 선택 — machine-checkable path 형식 (ADR-047 D6 contract formation 정합):
       기존 `- AC-N → <file> > <test-name>` 자연어 양식 *대신* `- AC-N → <runner>::<file>::<test-id>` 형식을 박을 수 있다.
       runner는 jest|vitest|pytest|go|cargo|flutter 등 — 실제 실행 가능한 명령으로 채울 것. (Flutter는 ADR-059)
       예: `- AC-1 → jest::tests/auth/me.spec.ts::test_AC_1_unauthenticated_returns_401`
       채워져 있고 *placeholder가 아니면* /validate-workitem이 path 우선 resolve.
       채워지지 않으면 기존 자연어 양식(`→ <file> > <test-name>`) 그대로 — 강제 X.
       **angle-bracket placeholder(`<runner>` 등)만 남기는 것 금지** — 안 채울 거면 자연어 양식으로 작성. 잔존 placeholder는 validator가 *미설정*으로 간주하고 자연어 매칭 fallback하지만, report에 P2 라벨로 기록.
     검증 판정력 확인용 테스트 중 **AC 행동으로 귀속되지 않는 것**(대표적으로 positive control — 검사 헬퍼 자체가 살아 있는지 확인하는 테스트)은 `- VC-N → <file> > <test-name>` 형식으로 등재한다 (ADR-064 D2). 반례 테스트("잘못된 입력을 거부한다")는 대개 AC 본연의 행동이므로 VC-N이 아니라 `AC-N`으로 매핑한다.
     VC-N 행의 writer는 implement foreman 단독이며, **`## AC ↔ 검증 매핑`의 충족률·자동화율 집계에는 포함하지 않는다**(그 %가 신뢰도 등급 입력이라 섞이면 등급이 이동한다). 등재 목적은 그 테스트 줄이 diff trace audit에서 `AC-N | 명시 요청 | VC-N`으로 역추적되게 하는 것이다.
     **검증 modality 표기 (ADR-065 D1 — 필수)**: 각 AC 행의 **AC 번호 바로 뒤**에 그 AC를 무엇으로 증명하는지 `[modality]`를 붙인다.
     - `[자동 테스트]` — `- AC-1 [자동 테스트] → jest::tests/auth/me.spec.ts::test_AC_1_...`
     - `[산출물 검사]` — `- AC-2 [산출물 검사] → npm run validate — insights 노트에 필수 섹션 3개(대안/권고/출처) 존재` (**검사 수단을 통합 `validate`에 묶는다** — 묶이지 않으면 충족 근거가 아니다. 내용의 *질*을 판정하는 AC는 이 modality가 아니라 `[사용자 관측]`이다)
     - `[사용자 관측]` — `- AC-3 [사용자 관측] → 삭제 확인 다이얼로그 문구·간격을 승인 프로토타입과 대조` (증거는 ## 8의 `- ac-acceptance` 줄)
     - `[플랫폼 관측]` — `- AC-4 [플랫폼 관측] → 선행 배포(T-012) 이후 이미 발화한 03:00 스케줄의 배치 완주를 확인 (증거: 실행 로그 run id)`. **커밋·배포 이후에만 일어나는 사실은 그것을 만든 task가 아니라 후속 verification task의 AC다**(ADR-065 D1 경계) — 같은 task에 두면 finalize 전에 관측할 수 없어 영구 미충족이 된다.
     - `[미관측]` — **계획 단계에서 쓰지 않는다**(판정 결과 라벨이지 authoring 표기가 아니다 — ADR-065 D1). 어떤 modality도 정할 수 없으면 AC를 관측 가능하게 다시 쓰거나 task를 쪼갠다.
     - **표기가 없는 AC는 `[자동 테스트]`로 간주한다(legacy 호환)** — 기존 fork의 task는 표기가 없으므로 이 규칙이 없으면 재검증에서 일괄 미충족이 된다. 그 AC에 대응 테스트가 없으면 기존과 같이 미충족이며, 표기 부재 자체는 `P2 [Modality-missing]` 기록 등급이다. **신규 task는 표기를 채운다.**
     modality writer: plan-workitem(계획 시 지정) · builder/foreman(구현 시 실제 경로·테스트 id 확정). `사용자 관측`·`플랫폼 관측`의 증거는 사용자만 발급한다(에이전트 대행 금지). -->

## 6-2. TDD opt-out
<!-- 본문이 비어 있으면 TDD 적용 (기본). opt-out 하려면 아래 두 줄을 *모두* 채워 본문에 추가한다 — 하나라도 비면 형식 위반:
     - 사유: <왜 TDD를 건너뛰는가>
     - Follow-up task: <TDD로 재구현할 task ID>
     예: spike 종료 후 T-014에서 TDD로 재구현 (사유: 외부 의존 탐색). -->

## 7. 관련 문서
- Milestone: <!-- 예: [M1-foundation](../milestones/M1-foundation.md) -->
- Feature: <!-- 예: [F-001-core-value](../features/F-001-core-value.md) -->
- Feature-invariants: <!-- feature ## 7-2가 채워진 경우만. 예: [F-001 ## 7-2](../features/F-001-core-value.md). 비해당 시 줄 삭제. 정책: ADR-057. -->
- Architecture: <!-- 예: [ARCHITECTURE_OVERVIEW](../../20-system/ARCHITECTURE_OVERVIEW.md) -->
- Architecture-Iface: <!-- 해당 스택 한정. 예: [ARCH ## 7-1 API](../../20-system/ARCHITECTURE_OVERVIEW.md#arch-7-1) / [## 7-4 프론트](../../20-system/ARCHITECTURE_OVERVIEW.md#arch-7-4) / [## 7-5 모바일](../../20-system/ARCHITECTURE_OVERVIEW.md#arch-7-5). 비해당 스택은 줄 자체 삭제 (placeholder 잔존 X). 정책: ADR-027. -->
- Design: <!-- UI 프로젝트 한정. 예: [DESIGN ## 7 Components](../../20-system/DESIGN.md#design-7-components) / [## 2 Colors](../../20-system/DESIGN.md#design-2-colors). 비-UI 프로젝트는 줄 자체 삭제. -->
- ADR: <!-- 예: [ADR-007-workitem-lifecycle](../../90-decisions/boilerplate/ADR-007-workitem-lifecycle.md) -->

## 8. 메모
<!-- task scope /repair-plan이 본 라운드의 P0/P1 결정을 1줄씩 append하는 영속 위치 (ADR-047 D7 durable correction history + D1 inspectability). feature/milestone scope는 IMPROVEMENT_GUIDE.md `## 5. Repair decision log`로 라우트. 그 외 메모도 자유.
     증거 receipt 위치이기도 하다 (ADR-064 D4 — writer: implement foreman 및 repair-workitem(외부 경계 코드를 고친 경우). 시점: 그 라운드의 파일 변경이 전부 끝난 뒤 · /validate-workitem 실행 *이전*. validate 이후 append하면 task 문서 mtime이 갱신돼 finalize가 report를 stale로 보고 Needs Validation 교착이 된다):
       `- exec-evidence <날짜> <경계 a|b|c>: <등급 1 재실행 가능 | 등급 2 1회성 — 형태> — <무엇에 대고 실행했는가> / 결과: <관측 1줄>`
       `- verify-power <날짜> <AC-N>: red=<observed|opt-out(사유)|characterization(사유)|unrecoverable(사유)> / vc=<VC-N 목록 또는 없음> / mutation=<미승격(G# 미충족) | 승격(변이·관측·사본 삭제 결과)>`
       `- fact-resolved <날짜> <무엇>: <잠정값> → <관측값> / 관측 방법: <1줄>`
       `- ac-acceptance <날짜> <AC-N>: modality=<사용자 관측|플랫폼 관측> / authority=사용자 / source=<출처 식별자 — 플랫폼 관측만> / 환경=<대상·버전> / 절차=<무엇을 했는가> / 결과=<관측 1줄>`  (ADR-065 D3 — writer: accept-milestone 또는 사용자. `authority`는 항상 `사용자`다. 신선도 자동검사 없음 — 고친 주체가 `- invalidated <날짜> <AC-N>: <사유>`로 무효화)
       `- pattern-scan <날짜> <패턴 1줄>: 범위 내 N건 수정 / 범위 밖 M건 <경로 목록>`  (동일 결함 패턴의 다른 출현 전수 검색 결과 — writer: repair-workitem·repair-acceptance. 범위 밖 항목은 stabilize·repair-milestone이 회수) -->

## 9. 의존성
<!-- 선행 task를 그 task가 보장할 AC 단위로 참조: `- T-002 ← T-001:AC-2 (인증 인터페이스 정의)`. 비어 있으면 선행 의존 없음.
     후행 `## 3`는 이 선행 결과를 전제로 작성한다(ADR-057#amend-3 후행-task 전제). plan-workitem이 본 선언을 읽어 의존성 컬럼을 채우고, **누락 참조·순환은 성공 종료를 막는다**(실행 순서 부재). -->
