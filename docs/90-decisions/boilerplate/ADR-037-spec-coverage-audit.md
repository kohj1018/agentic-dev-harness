# ADR-037 — Spec Coverage Self-audit

> scope: boilerplate

## Status
accepted

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

## 참고
- ADR-036 (FEATURE_TEMPLATE 12섹션)
- ADR-026 (TASK_TEMPLATE schema)
- ADR-007 (validator 책임 경계 — 판정+권장만)
