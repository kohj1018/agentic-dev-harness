# F-xxx-이름

## 0. Status
draft
<!-- 값은 헤딩+1 줄(위)에 둔다 — 주석은 값 *뒤*("헤딩+1=상태값" 파서 보호).
     draft(계획 중) → contract-ready(plan-milestone 라운드 완료·사용자 승인 — task 분해 진입 자격, **잠금 아님**) → ready(/seal-milestone이 봉인).
     M·feature는 이 단방향만 쓴다. 완료 판정은 graduation(`## 8` 회고)이 담당하고 stabilize는 M `## 0. Status`를 바꾸지 않는다.
     contract-ready 구간에서는 상위 계약 수정이 정상 경로다(repair-plan이 그 자리에서 고친다). ready 뒤 상위 계약 변경은 새 마일스톤이 기본이고, 현재 M 진행 불가 P0는 자동 역전이 없이 사용자 보고.
     plan-workitem은 M·산하 feature가 모두 contract-ready일 때 동작하고 task를 ready로 승격하지 않는다. ADR-060 D6/D7 (ADR-057#amend-3 결정 5 부분 supersede). -->

## 0-1. Type
<!-- feature | technical-enabler | bugfix | refactor | migration | research-spike. 미기재 시 feature.
     technical-enabler/bugfix/refactor/migration/research-spike 면 아래 ## 2는 "User Story" 대신
     "기술적 근거(Technical rationale)" 한 줄 + 서비스하는 가정/기회(DISCOVERY ID)·상위 결정(ADR) 링크로 채운다.
     정책: ADR-039. -->
feature

## 1. 요약

## 2. 사용자 가치 (User Story) — Type=feature 일 때
<!-- "As a <persona>, I want to <goal>, so that <benefit>." 1개 이상.
     persona는 PROJECT_CHARTER.md `## 2.1` ID 인용 — 자체 발명 X.
     Type≠feature 면 본 섹션 제목을 "기술적 근거"로 바꾸고: 무엇을/왜 + 서비스하는 DISCOVERY assumption/insight ID 또는 ADR 링크. -->

## 3. 핵심 시나리오 (Feature-level)
<!-- happy / alternate / fail 각 3~5단계.
     Charter `## 3.1`(제품 전체)과 다른 *이 feature 한정* 시나리오. -->

## 4. 범위

## 5. 비범위

## 6. 요구사항

## 7. Feature-level Acceptance Criteria
<!-- FAC-1, FAC-2 ... 시나리오 수준 측정 가능 기준.
     task `## 6 AC`는 FAC를 만족시키는 구현 단위.
     구 `## 8 검증 방법`을 흡수.
     UI feature는 승인 프로토타입 참조 줄을 둔다(ADR-056 — 화면 단위 파일, 그 feature가 등장하는 화면마다 1줄):
     `프로토타입: [M<N>/<screen>.html](../../20-system/prototypes/M<N>/<screen>.html) (진입: <라우트/상태 진입 메모>)`.
     프로토타입이 무의미한 UI feature는 `프로토타입 면제: <사유>` 한 줄로 대체(plan-workitem 입구 계약의 통과 조건 — 둘 다 없으면 Needs Experience Contract).
     경험 결정(PX) 인벤토리(ADR-056#amend-1 — plan-milestone R5-5가 승인 프로토타입 HTML의 `<!-- PX-M<N>-<screen>-NN: <한 줄 결정> -->` 마커를 *그대로 복사*, **이 feature가 *구현하는* PX만**; 한 화면이 여러 feature에 걸치면 PX별로 구현 feature에 분산 기록(화면 통째로 몰지 않음 — INST-1 사각 방지); 화면-공통은 shell/layout feature 또는 DESIGN.md §4, cross-feature 정합은 `## 7-2` INV/seam):
     `경험 결정(PX):`
     `- PX-M<N>-<screen>-01: <한 줄 결정 (예: 입력창을 화면 상단에 sticky 고정)>`
     `- PX-M<N>-<screen>-02: <...>` -->

## 7-1. FAC ↔ AC 매핑표 (subsection of ## 7)
<!-- /plan-workitem이 task 분해 시 본 subsection을 채운다 (영속 SSOT — plan 출력은 echo).
     형식: FAC-N → T-NNN:AC-N, T-MMM:AC-M (다대다 허용)
     unmapped 0건이 /seal-milestone 봉인 조건 — plan-workitem은 발견 시 성공 종료 금지, 승격은 하지 않는다(ADR-037#amend-3 / ADR-060 D7). 구현 시작 후 발견되면 validator(ADR-037) 및 stabilize preflight가 P0 [Spec-gap]로 보고 + 사용자 결정.
     본 subsection은 ## 7 FAC와 한 묶음 — ADR-036 섹션 구조(## 12 폐지로 11 main section — ADR-060 D1)에 *추가 main section 신설 X*. -->
- FAC-1 →
- FAC-2 →
- FAC-3 →

## 7-2. Cross-task invariant 계약 (subsection of ## 7)
<!-- seam 신호(2+ task 동일 엔티티 write / 상태 머신 / 2차-write / 멱등 — ADR-057 결정 8) 발화 시에만 /plan-workitem이 채운다.
     미발화 시 "(해당 없음 — seam 신호 미발화)" 한 줄.
     형식: INV-N | 보장 (상태 전이 / 멱등 / 2차-write 재검증 / task 간 계약) | 관련 task:AC | 검증 방법
     예: INV-1 | 주문 상태는 draft→paid→shipped 단방향 — 어떤 task도 역방향 write 금지 | T-003:AC-2, T-005:AC-1 | 상태 전이 가드 단위 테스트
     unmapped INV는 plan 출력 "남은 미결정 사항"에 surface. validator가 task 검증 시 위반·테스트 커버를 점검. -->

## 7-3. 프로토타입 경험(PX) ↔ AC 매핑 (subsection of ## 7)
<!-- UI feature 한정(ADR-056#amend-1). /plan-workitem 3-P가 채운다(영속 SSOT — plan 출력은 echo).
     형식: PX-M<N>-<screen>-NN → T-NNN:AC-M, T-MMM:AC-K (다대다 허용)
     `## 7` PX 인벤토리의 어떤 PX도 참조하지 않는 AC/미매핑 PX(unmapped PX)는 [Plan-FAC-coverage]가 unmapped FAC와 동일 기준으로 잡는다(P0 권장).
     본 subsection은 ## 7과 한 묶음 — ADR-036 섹션 구조(## 12 폐지로 11 main section — ADR-060 D1)에 *추가 main section 신설 X* (## 7-1·## 7-2 선례). 비-UI feature는 "(해당 없음)". -->
- PX-M<N>-<screen>-01 →
- PX-M<N>-<screen>-02 →

## 8. Non-functional Requirements
<!-- 성능·접근성·보안·i18n. 해당 없으면 "(해당 없음)" 명시. -->

## 8-1. UX 흐름 품질
<!-- UI feature 한정(비-UI는 "(해당 없음)"). 정책: ADR-042 (Google HEART).
     - primary task: 이 feature에서 사용자의 핵심 1행동.
     - empty / loading / error 흐름: 각 상태에서 사용자가 무엇을 보고 어떻게 복구하는가.
     - accessibility: 키보드·스크린리더·대비 등 흐름 레벨 요구.
     - copy 톤: DESIGN.md §10 Voice & Writing(전역 규칙서 — ADR-056) 참조 + *이 feature 한정 delta만* 기록 (예: "이 화면만 축하 톤 허용"). 전역 규칙 재서술 금지.
     - success metric (HEART signal 1개): 목표 → 신호 → 지표 (예: Task success → 완료율 → "온보딩 완료 ≥70%"). 실사용 데이터로 측정해 DISCOVERY §14 Evidence Log(quant)로 회수.
     - (옵션, 마케팅·랜딩 화면 한정) 포지셔닝: audience / JTBD / objection / proof / voice / key action을 *이 필드에 매핑*해 랜딩 카피 근거로 둔다(별도 마케팅 SSOT·스킬 설치 없음 — §10 Voice와 자연 연결). 마케팅 스코프 도입이 아니라 카피 근거 기록 수준. -->

## 9. 엣지 케이스

## 10. 의존성

## 11. 관련 문서
- Milestone: <!-- 예: [M1-foundation](../milestones/M1-foundation.md) -->
- Charter: <!-- 예: [PROJECT_CHARTER](../../10-charter/PROJECT_CHARTER.md) -->
- Architecture: <!-- 예: [ARCHITECTURE_OVERVIEW](../../20-system/ARCHITECTURE_OVERVIEW.md) -->
- Architecture-Iface: <!-- 해당 스택 한정. 예: [## 7-1 API](../../20-system/ARCHITECTURE_OVERVIEW.md#arch-7-1) / [## 7-5 모바일](../../20-system/ARCHITECTURE_OVERVIEW.md#arch-7-5). 비해당 스택은 줄 삭제. 정책: ADR-027. -->
- Design: <!-- UI 프로젝트 한정. 예: [DESIGN ## 7 Components](../../20-system/DESIGN.md#design-7-components). 비-UI 프로젝트는 줄 삭제. -->
- ADR: <!-- 예: [ADR-007-workitem-lifecycle](../../90-decisions/boilerplate/ADR-007-workitem-lifecycle.md) -->

<!-- ## 12. 열린 질문 — 폐지(결번). 이 feature의 미결정은 docs/10-charter/DECISION_REGISTER.md가 소유한다(항목의 `영향:` 칸에 M ID와 이 F ID를 함께 적는다 — ADR-060 D1). -->
