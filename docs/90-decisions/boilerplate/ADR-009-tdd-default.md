# ADR-009 TDD를 디폴트로 채택, opt-out 절차 정의

> scope: boilerplate

## Status
accepted

## 배경
이 보일러플레이트의 가치는 fork된 미래 프로젝트에서 에이전트가 일관된 규율로 작업하는 것이다. TDD는 그 규율 중 가장 잘 작동하는 신호로, builder가 "구현 → 사후 테스트"가 아니라 "AC 정의 → 실패 테스트 → 최소 구현 → 정리" 사이클을 따르게 만든다.

본 ADR 이전의 상태:
- TASK_TEMPLATE의 `## 6. 테스트 포인트` — 자유 텍스트 메모. AC인지 단순 메모인지 구분 없음.
- builder 규칙: "관련 테스트를 추가하거나 보강한다" — 사후 테스트 가능, TDD 강제 없음.
- `/implement-workitem`: "필요한 테스트가 있으면 함께 보강한다" — 임의적.

## 결정
`/implement-workitem`의 디폴트 흐름을 Red → Green → Refactor 3 phase로 명시한다.

| Phase | 종료 조건 |
|-------|-----------|
| Red | task의 AC-N에 대응하는 실패 테스트가 작성되고, "원하는 이유로" 실패함을 확인 |
| Green | Red phase의 테스트가 통과하는 최소 코드가 작성됨. 다른 AC는 미리 만족시키지 않음 (YAGNI). |
| Refactor | 단순성 self-check 4항목 + Clean Code 6항목 적용. 외부 행동 미변경. 테스트 통과 유지. |

위 사이클을 task의 모든 AC가 소진될 때까지 반복.

opt-out 절차:
- task 문서의 `## 6-2. TDD opt-out` 섹션에 사유와 follow-up task 링크가 **모두** 있을 때만 적용된다.
- 둘 중 하나만 비어 있으면 형식 위반으로 표시되어 진행 불가.
- finalize 시점에 opt-out 사유를 사용자에게 명시적으로 보여주고 확인.

검증 흐름:
- `/validate-workitem`(validator)이 AC ↔ 테스트 매핑과 테스트 선행 휴리스틱을 점검.
- 결과는 validation report에 `AC-1 ✅ / AC-2 ❌(테스트 없음)` 형태로 기록.
- `/finalize-workitem`은 통합 `validate` 명령 통과 외에 AC 미충족 항목이 있으면 `Needs Fix`로 종료.

fast 모드:
- `/implement-workitem --fast [task-id]`는 RGR 사이클을 1회만 돌려 첫 AC만 완료하고 종료. prototype에서 빠르게 흐름을 검증할 때 사용. 나머지 AC는 후속 호출.

## 근거
- 사후 테스트는 구현을 그대로 따라가서 발견 못한 케이스가 그대로 통과한다 — 회귀 위험.
- AC가 task 시작 전 명문화되지 않으면 finalize 시점의 "완료" 기준이 흐려진다.
- TDD는 단순성·YAGNI(ADR-006)를 강화한다 — 범위가 명문화되어야 "딱 그만큼"이 가능하다.
- opt-out에 follow-up을 강제하면 spike/prototype 후 정식 구현 부채가 누적되지 않는다.

## 결과
- TASK_TEMPLATE의 `## 6. 테스트 포인트` → `## 6. Acceptance Criteria` + `## 6-1. 테스트 시나리오 (TDD Red)` + `## 6-2. TDD opt-out`으로 분리.
- `/implement-workitem`이 RGR 3 phase 흐름.
- builder 규칙에 RGR 사이클 강제.
- validator 규칙에 AC ↔ 테스트 매핑 점검.
- `/finalize-workitem` 통과 조건에 AC 미충족 0개 추가.
- AGENTS.md에 "TDD 기본" 1단락(fork된 새 세션 자동 로드 surface; CLAUDE.md는 @AGENTS.md import).

## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT)
- docs/30-workitems/_templates/TASK_TEMPLATE.md   — ## 6-1 테스트 시나리오 path 형식 권장 (opt-in, ADR-047 D6 contract formation 정합)
- .claude/skills/validate-workitem/SKILL.md       — AC↔테스트 매핑 path 우선 resolve + [verify-placeholder] P2 라벨

## 후속 작업
- AC 자연어 매핑이 헐거우면 테스트 이름에 `AC_N` 식별자 컨벤션 권장 강화.
- legacy 코드 수정은 characterization test 선행 후 RGR(task 단위 사용자 결정).
- prototype 단계의 opt-out 비율을 `/stabilize-milestone`이 보고 항목으로 추가할지 후속 검토.

## Amendment 1 (2026-05-15) — AC ID 컨벤션 강화 (P1 경고, 데이터 트리거 시 P0 격상)

### 결정
- 테스트 이름은 `AC_N` 또는 `[AC-N]` 식별자를 포함한다 (예: `test_AC_1_unauthenticated_returns_401`).
- validator가 매핑 시 식별자 누락을 발견하면 IMPROVEMENT_GUIDE에 **P1 severity**로 보고.
- Phase 12 (Round 2) 또는 후속 실 마일스톤에서 누락률 ≤ 5% 도달 시 P0로 격상 (재amend).

### 근거
- ADR-009 후속 작업의 명문화.
- 자연어 매칭 false positive 차단.
