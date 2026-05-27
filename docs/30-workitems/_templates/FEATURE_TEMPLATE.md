# F-xxx-이름

## 0. Status
draft

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
     구 `## 8 검증 방법`을 흡수. -->

## 7-1. FAC ↔ AC 매핑표 (subsection of ## 7)
<!-- /plan-workitem이 task 분해 시 본 subsection을 채운다 (영속 SSOT — plan 출력은 echo).
     형식: FAC-N → T-NNN:AC-N, T-MMM:AC-M (다대다 허용)
     unmapped 항목은 미커버 task 추가 권장 — validator(ADR-037) 및 stabilize preflight가 재점검.
     본 subsection은 ## 7 FAC와 한 묶음 — ADR-036 12-섹션 구조에 *추가 main section 신설 X*. -->
- FAC-1 →
- FAC-2 →
- FAC-3 →

## 8. Non-functional Requirements
<!-- 성능·접근성·보안·i18n. 해당 없으면 "(해당 없음)" 명시. -->

## 8-1. UX 흐름 품질
<!-- UI feature 한정(비-UI는 "(해당 없음)"). 정책: ADR-042 (Google HEART).
     - primary task: 이 feature에서 사용자의 핵심 1행동.
     - empty / loading / error 흐름: 각 상태에서 사용자가 무엇을 보고 어떻게 복구하는가.
     - accessibility: 키보드·스크린리더·대비 등 흐름 레벨 요구.
     - copy 톤: 핵심 메시지·에러 문구 방향.
     - success metric (HEART signal 1개): 목표 → 신호 → 지표 (예: Task success → 완료율 → "온보딩 완료 ≥70%"). 실사용 데이터로 측정해 DISCOVERY §14 Evidence Log(quant)로 회수. -->

## 9. 엣지 케이스

## 10. 의존성

## 11. 관련 문서
- Milestone: <!-- 예: [M1-foundation](../milestones/M1-foundation.md) -->
- Charter: <!-- 예: [PROJECT_CHARTER](../../10-charter/PROJECT_CHARTER.md) -->
- Architecture: <!-- 예: [ARCHITECTURE_OVERVIEW](../../20-system/ARCHITECTURE_OVERVIEW.md) -->
- Architecture-Iface: <!-- 해당 스택 한정. 예: [## 7-1 API](../../20-system/ARCHITECTURE_OVERVIEW.md#arch-7-1). 비해당 스택은 줄 삭제. 정책: ADR-027. -->
- Design: <!-- UI 프로젝트 한정. 예: [DESIGN ## 7 Components](../../20-system/DESIGN.md#design-7-components). 비-UI 프로젝트는 줄 삭제. -->
- ADR: <!-- 예: [ADR-007-workitem-lifecycle](../../90-decisions/boilerplate/ADR-007-workitem-lifecycle.md) -->

## 12. 열린 질문
