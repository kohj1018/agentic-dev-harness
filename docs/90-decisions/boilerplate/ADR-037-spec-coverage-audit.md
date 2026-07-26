# ADR-037 — Spec Coverage Self-audit

> scope: boilerplate

## Status
accepted

## 현재 유효 결정
- feature `## 7` FAC와 `## 7-1` FAC↔AC 매핑이 coverage SSOT다(#amend-1); 대화 출력은 요약만 둔다(#amend-2).
- `/plan-workitem M<N>`은 FAC↔AC 100%와 unmapped 0건을 task ready 승격 조건으로 삼는다. 첫 구현 전 validate/reviewer는 누락을 P0로 보고하고 repair-plan이 task·AC·매핑을 수정한다(#amend-3).
- 구현 시작 뒤 unmapped FAC는 `P0 [Spec-gap]`+`Needs Fix`, stabilize graduation `NO`로 사용자에게 보고한다. 현재 M task 자동 추가·FAC 자동 취소·plan-workitem 재호출은 없다(#amend-3, ADR-057#amend-3 결정 6).

## 배경
- [외부실증] Osmani self-audit — feature FAC(Feature-level Acceptance Criteria)와 task AC 매핑 누락이 *spec gap*의 핵심 원인.
- ADR-036으로 FEATURE_TEMPLATE에 `## 7 FAC`가 생겼지만 FAC→AC 매핑을 추적하는 메커니즘 부재.
- 매핑 없이 구현하면 feature 수준 품질이 검증되지 않은 채 마일스톤이 종료된다.

## 결정

### 1. validator self-audit 1 step
validate 시 feature `## 7 FAC` 각 항목이 task `## 6 AC`로 매핑됐는지 확인. 매핑 안 된 FAC가 있으면 report에 `Spec Gap: FAC-N → unmapped` 명시 + 미커버 task 추가 권장.

**자동 차단 X (제안만)** — ADR-007 validator 책임 경계 정합.

### 2. plan-workitem 출력 형식에 FAC ↔ AC 매핑표 추가
feature 분해 후 출력에 `FAC-N → T-xxx:AC-N` 형식 매핑표. 미커버 FAC는 `unmapped` 표시.

## 토큰 비용
~1K/task. 6개월 뒤 spec gap 발견 비용보다 작음.

## 결과
- feature 단위 spec coverage가 plan 단계와 validate 단계 양쪽에서 자동 추적됨.
- `Spec Gap` 보고로 미구현 스펙을 조기 발견.

## 후속 작업
없음

<a id="adr-037-amend-1"></a>
## Amendment 1 (2026-05-16) — FAC ↔ AC 매핑표 영속 SSOT 위치

### 결정

FAC ↔ AC 매핑은 *plan-workitem 출력 echo* 가 아니라 **feature 문서의 `## 7-1. FAC ↔ AC 매핑표` subsection** 에 영속 저장한다. plan 출력은 사람 확인용 echo.

- `## 7-1` 위치: ADR-036 의 12-섹션 main 구조를 보존하기 위해 `## 7 FAC` 의 *subsection* 으로 박는다 (추가 main section 신설 X).
- 영속 SSOT 가 있어야 다음 라운드의 validate-workitem (본 ADR 결정 1 의 Spec coverage audit) 과 stabilize-milestone deterministic preflight 가 cross-round 추적 가능.
- legacy feature 문서 (template 변경 전 생성) 는 *Legacy fallback* 3-단계로 회수 — (1) `## 7-1` 존재 / (2) `## 7 FAC` 본문 inline 매핑 휴리스틱 / (3) `Spec Gap` P1 라벨.

### 근거

- 기존 본 ADR 결정 2 ("plan-workitem 출력 형식에 매핑표 추가") 는 *출력 텍스트만* 명시 — 세션 종료 시 사라져 cross-round 추적 surface 부재.
- [관측됨] plan-workitem 출력 텍스트만 있고 영속 자리 부재 — feature 문서 본문 / task 본문 어느 곳에도 매핑이 저장되지 않아 다음 round 의 validator / stabilize 가 점검 surface 가 없음.

### 적용 surface

- [FEATURE_TEMPLATE.md](../../../docs/30-workitems/_templates/FEATURE_TEMPLATE.md) `## 7-1` subsection 신설.
- [plan-workitem/SKILL.md](../../../.claude/skills/plan-workitem/SKILL.md) "feature 분해 시" 단락 — 영속 저장 + plan 출력은 echo 정합.
- [validate-workitem/SKILL.md](../../../.claude/skills/validate-workitem/SKILL.md) Spec coverage audit (본 ADR 결정 1 의 surface 확장).
- [stabilize-milestone/SKILL.md](../../../.claude/skills/stabilize-milestone/SKILL.md) deterministic preflight FAC unmapped 점검.

### 후속 작업

- 기존 feature 문서 (template 변경 전 생성) 의 `## 7-1` 보강 — Legacy fallback 3-단계로 운영 차단 없이 회수되므로 fork 별로 일괄 migration / lazy migration / 신규 feature 부터만 적용 중 선택. plan-workitem 호출 자연 발생 시점에 보강 가능.

<a id="adr-037-amend-2"></a>
## Amendment 2 (2026-05-27) — plan 출력 echo 축소 (ADR-046 정합)

### 결정
plan-workitem의 FAC↔AC *전체 매핑표 echo*를 폐지한다. plan 출력에는 `unmapped N건` 요약 + feature `## 7-1` 위치 포인터만 둔다. 전체 매핑표 SSOT는 feature 문서 `## 7-1`(본 ADR #amend-1) — 변경 없음.

### 근거
- 전체표 echo는 이미 `## 7-1`에 영속된 내용의 *대화 중복 출력* — ADR-005 SSOT 정신 및 ADR-046#d5(중복 echo 금지)와 어긋난다.
- 본 ADR 결정 1(validator self-audit)·#amend-1(영속 SSOT)의 *추적 메커니즘*은 불변 — 바뀌는 것은 plan의 *대화 출력 형식*뿐.
- #d2 및 #amend-1의 "plan 출력은 echo" 문구 중 *전체표 echo* 부분만 본 amendment가 대체한다(narrowing).

### 적용 surface
- [plan-workitem/SKILL.md](../../../.claude/skills/plan-workitem/SKILL.md) "feature 분해 시"·"마지막 출력" — 전체표 echo 제거, unmapped 요약 + 위치 포인터.
- 정합 정책: [ADR-046](ADR-046-signal-first-output.md)#d5.

## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT)
- docs/30-workitems/_templates/FEATURE_TEMPLATE.md     — #amend-1 §7-1 FAC↔AC 매핑표
- .claude/skills/plan-workitem/SKILL.md                — #amend-1 영속 저장 + #amend-2 출력 echo 축소(요약만)
- .claude/skills/validate-workitem/SKILL.md            — #d1 Spec coverage audit
- .claude/agents/validator.md                           — #d1 FAC→AC 매핑 점검
- .claude/skills/stabilize-milestone/SKILL.md          — #amend-1 §1.0 FAC unmapped 점검
- .claude/skills/validate-plan/SKILL.md                — #amend-3 [Plan-FAC-coverage] 구현-후 사용자 결정 라우팅
- .claude/agents/reviewer.md                            — #amend-3 [Plan-FAC-coverage] 미러

## 참고
- ADR-036 (FEATURE_TEMPLATE 12섹션)
- ADR-026 (TASK_TEMPLATE schema)
- ADR-007 (validator 책임 경계 — 판정+권장만)

<a id="adr-037-amend-3"></a>
## Amendment 3 (2026-07-26) — unmapped FAC의 계획-시점 차단 + 구현-후 사용자 결정

### 결정
1. `/plan-workitem M<N>` 전체 스냅샷에서는 FAC↔AC 100%가 task `ready` 승격의 필수 조건이다. unmapped FAC가 하나라도 있으면 self-check 실패로 전 task를 `draft`에 두고 성공 종료하지 않는다.
2. 첫 구현 전 `validate-plan`/reviewer의 `[Plan-FAC-coverage]`는 unmapped FAC를 P0로 보고하며, `/repair-plan M<N>`이 부모 M 전체의 **task·AC·FAC↔AC 매핑**을 고친 뒤 재검증한다(M/F의 FAC 자체를 바꾸는 경로 아님).
3. 구현이 시작된 뒤 validator/validate-workitem이 unmapped FAC를 발견하면 report에 `P0 [Spec-gap] FAC-N → unmapped`를 기록하고 combined verdict를 `Needs Fix`로 둔다. **미커버 task 자동 추가·`/plan-workitem` 재호출·`/repair-workitem` 자동 진입은 하지 않는다**. 다음 액션은 사용자 중단·보고다. 사용자가 현재 M 약속을 어떻게 처리할지 명시적으로 결정해야 하며, 새 요구·기획 변경은 다음 마일스톤이 기본이다.
4. stabilize preflight에서도 같은 finding은 graduation `NO`를 유지하고 사용자에게 보고한다. 자동 corrective task·자동 FAC 취소 문법은 두지 않는다.

### 적용 surface
- .claude/skills/plan-workitem/SKILL.md (FAC↔AC 100% ready gate)
- .claude/skills/validate-plan/SKILL.md · .claude/agents/reviewer.md (`[Plan-FAC-coverage]` P0)
- .claude/skills/validate-workitem/SKILL.md · .claude/agents/validator.md (P0 report + 사용자 결정 라우팅)
- .claude/skills/stabilize-milestone/SKILL.md (graduation NO)
- docs/30-workitems/_templates/FEATURE_TEMPLATE.md (`## 7-1` 주석)

### 강도 (ADR-022)
- constraint(강) — 계획 완료 조건과 구현 후 계획 잠금을 동시에 보존. validator는 report-only이고 문서·코드를 직접 수정하지 않는다.
