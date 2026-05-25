# T-xxx-이름

## 0. Status
draft

## 1. 작업 목적

## 2. 작업 범위

## 3. 구현 항목

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
     위반 시 planner는 *재분해 권장 텍스트*를 출력, builder는 *재분해 요청 텍스트*를 Red phase 직전 출력 — 자동 차단은 하지 않는다(사용자 결정). -->
- AC-1 [Given] ... [When] ... [Then] ...
- AC-2 [Given] ... [When] ... [Then] ...

## 6-1. 테스트 시나리오 (TDD Red)
<!-- 각 AC에 대응하는 테스트 파일·테스트 이름. 사람이 미리 채우거나 builder가 Red phase 시작 전에 채운다.
     테스트 이름에 `AC_N` 또는 `[AC-N]` 식별자 포함 강력 권장 (ADR-009 amend).
     예:
     - AC-1 → tests/auth/me.spec.ts > test_AC_1_unauthenticated_returns_401
     - AC-2 → tests/auth/me.spec.ts > test_AC_2_authenticated_returns_user -->

## 6-2. TDD opt-out
<!-- 본문이 비어 있으면 TDD 적용 (기본). opt-out 하려면 아래 두 줄을 *모두* 채워 본문에 추가한다 — 하나라도 비면 형식 위반:
     - 사유: <왜 TDD를 건너뛰는가>
     - Follow-up task: <TDD로 재구현할 task ID>
     예: spike 종료 후 T-014에서 TDD로 재구현 (사유: 외부 의존 탐색). -->

## 7. 관련 문서
- Milestone: <!-- 예: [M1-foundation](../milestones/M1-foundation.md) -->
- Feature: <!-- 예: [F-001-core-value](../features/F-001-core-value.md) -->
- Architecture: <!-- 예: [ARCHITECTURE_OVERVIEW](../../20-system/ARCHITECTURE_OVERVIEW.md) -->
- Architecture-Iface: <!-- 해당 스택 한정. 예: [ARCH ## 7-1 API](../../20-system/ARCHITECTURE_OVERVIEW.md#7-1-api-컨벤션) / [## 7-4 프론트](../../20-system/ARCHITECTURE_OVERVIEW.md#7-4-프론트-결정). 비해당 스택은 줄 자체 삭제 (placeholder 잔존 X). -->
- Design: <!-- UI 프로젝트 한정. 예: [DESIGN ## 7 Components](../../20-system/DESIGN.md#7-components) / [## 2 Colors](../../20-system/DESIGN.md#2-colors). 비-UI 프로젝트는 줄 자체 삭제. -->
- ADR: <!-- 예: [ADR-007-workitem-lifecycle](../../90-decisions/boilerplate/ADR-007-workitem-lifecycle.md) -->

## 8. 메모

## 9. 의존성
<!-- 형식: `- T-002: T-001의 X 정의 후 시작 가능`. 비어 있으면 병렬 가능으로 간주. -->
