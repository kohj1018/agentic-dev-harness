# ADR-014 — Milestone Graduation Contract

> scope: boilerplate

## Status
superseded

> **superseded by [ADR-067](ADR-067-milestone-graduation-v2.md)** (2026-08-09) — 통합 재발행. 본 ADR의 결정 3개와 개정 4개는 ADR-067이 승계하며, item 4 판정 기준(AC 충족 modality)·`BLOCKED` 정의(감사 미완 포함)·회고 open 스냅샷 3가지가 변경됐다. 본 문서는 이력 보존용이며 새 인용은 ADR-067로 한다. (현재 SSOT: ADR-068)

## 현재 유효 결정 (이전 — ADR-067로 이전됨) (현재 SSOT: ADR-068)
- graduation checklist는 5+1 구조 + 회고 + pre-check + `--dry-run`(본문 결정). 평가는 `졸업 가능: YES/NO`로만 낸다.
- item 3 `E2E Pass`는 **E2E-applicable 스택 한정 hard-block**(#amend-2)이며, #amend-2가 남긴 **0-spec 예외는 #amend-4로 철회**됐다 — 실제 실행된 e2e 1개 이상 성공이 조건이고 판정 상태 5종의 SSOT는 [ADR-052](ADR-052-stack-provisioning-and-e2e-readiness.md)#amend-1이다.
- 회고에 graduation 판정 줄을 남긴다(#amend-3). evaluator-optimizer 명명은 #amend-1.

## 배경
- [관측됨] `MILESTONE_TEMPLATE.md`의 `## 5. 완료 기준`이 빈 placeholder → milestone 졸업 판정 모호. stabilize 실행 시 "완료인가"를 매번 사람이 주관적으로 판단.
- [외부실증] Atlassian multi-level DoD (story/sprint/release) — sprint 단위의 외부 검증 가능한 완료 기준이 "릴리즈 품질"과 "구현 완료"를 분리한다.
- [외부실증] Anthropic 3-agent harness sprint contract — planner·builder·evaluator 분리 패턴에서 sprint 단위 완료 기준이 evaluator의 판정 근거.

## 결정

### 1. Graduation checklist 5+1 항목
`## 5. 완료 기준`을 다음 5개 필수 + 1개 선택으로 교체:
1. 모든 task status: done
2. 통합 validate Pass
3. E2E Pass (E2E-applicable 스택은 MUST — exit code 0; #amend-2가 "정의된 경우" soft-pass를 강화)
4. AC 매핑 100% (validation report 기준)
5. P0 severity finding 0건 (QA_FINDINGS의 본 마일스톤 헤더 기준)
6. (선택) 본 마일스톤 한정 추가 기준

### 2. 회고 4 항목
`## 8. 회고` 신설 (`## 7. 열린 질문` 아래):
- 목표 달성도: 정량/정성 1줄
- scope creep 사례: 있으면 1줄, 없으면 "없음"
- 비목표(charter ## 5) 위반 사례: 있으면 1줄
- 핵심 학습 3개 이내

### 3. Graduation pre-check + `--dry-run`
`/stabilize-milestone`의 단계 1.5에 graduation pre-check 신설:
- `## 5. 완료 기준` 각 항목 자동 체크.
- 미충족 발견 시 `졸업 가능: NO` + 미충족 목록 출력 + 조기 종료 옵션.
- `--dry-run` 플래그 = pre-check만 돌리고 종료 (P0 검증 도구).

## 비결정 (영구 No)
- Release-level DoD — stabilize 출력에 자연 흡수 (carry-over 0건 + ADR 후보 0건 = release-ready).
- Fowler 4-quadrant test classification — 보일러플레이트가 정확도 보장 불가, YAGNI.
- METRICS.md — 메트릭 정의는 프로젝트별 결정, boilerplate 강제 불가.
- `--apply-carryover` 자동 이월 — 사용자 명시적 결정 필요 (ADR-007 책임 경계 정합).
- architect auto-escalation 신호 — 트리거 기준 정의 불가 (프로젝트별).

## 결과
- `/stabilize-milestone --dry-run [M1]`으로 전체 QA 없이 졸업 가능 여부를 빠르게 확인.
- 회고가 milestone 문서에 누적되어 다음 마일스톤 계획에 재사용.

## 잔여 모니터링
graduation pre-check 미통과 사유 패턴 — 3회 이상 반복 시 lifecycle 단계 결함 신호 → ADR 후보.

## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT)
- .claude/skills/stabilize-milestone/SKILL.md         — #d3 graduation pre-check §1.5, #amend-1 evaluator-optimizer 1줄, #amend-2 E2E MUST-run hard-block, #amend-4 0-spec 예외 철회
- .claude/skills/stack-guard/SKILL.md                 — #amend-2 E2E-applicable 판정(provision/smoke) — ADR-052 D2 정합, #amend-4 0-spec 예외 철회
- docs/30-workitems/_templates/MILESTONE_TEMPLATE.md  — #d1 §5 완료기준 5+1, #d2 §8 회고, #amend-2 item 3 MUST 문구, #amend-4 0-spec 예외 철회
- docs/00-meta/DELEGATION_STRATEGY.md                 — #amend-1 evaluator-optimizer 1줄

## 참고
- ADR-007 (workitem lifecycle)
- ADR-009 (TDD default)
- ADR-022 (Ratchet Principle — [관측됨] 라벨)

<a id="adr-014-amend-1"></a>
## Amendment 1 (2026-05-16) — Evaluator-Optimizer 패턴 명명

### 결정

`/stabilize-milestone`이 instantiate하는 패턴을 Anthropic "Building Effective AI Agents" 가이드의 **evaluator-optimizer pattern**으로 명명한다.

- **Generator** = [/implement-workitem](../../../.claude/skills/implement-workitem/SKILL.md) (이전 lifecycle 단계).
- **Evaluator** = qa + reviewer agent + deterministic preflight (본 skill이 위임/실행).
- **Optimizer** = [/repair-workitem](../../../.claude/skills/repair-workitem/SKILL.md) (다음 단계, 사용자 발화).

본 skill은 evaluator 단계의 *orchestration* — 코드 수정 X, 평가 + 보고만 (책임 경계는 본 ADR의 graduation contract 정합).

### 근거

- Anthropic 단일 source의 패턴 명명은 [ADR-022](ADR-022-ratchet-principle.md) "다중 repo 실증" 기준의 *외부실증* X — *명명 자체는 행동 변화 없는 citation*이라 evidence 부담 적음.
- ADR-007 lifecycle의 책임 분할(builder = 구현, validator = 판정 + report)은 이미 패턴 정합이지만 *milestone scope*의 명명이 빠짐.

### 적용 surface

- [.claude/skills/stabilize-milestone/SKILL.md](../../../.claude/skills/stabilize-milestone/SKILL.md) 본문 첫 단락에 *"본 skill은 evaluator-optimizer pattern의 evaluator orchestration이다 (ADR-014#amend-1)"* 1줄 추가.
- [DELEGATION_STRATEGY.md](../../00-meta/DELEGATION_STRATEGY.md) 스킬 실행 순서 가이드 단락에 동일 1줄.

### 후속 작업

없음 — citation 추가만.

<a id="adr-014-amend-2"></a>
## Amendment 2 (2026-06-25) — E2E MUST-run hard-block (ADR-052 D3)

### 결정
graduation checklist item 3 `E2E Pass (스택에 정의된 경우)`의 *soft-pass*("정의된 경우"만 평가)를 **E2E-applicable 스택 한정 hard-block**으로 강화한다.
- *E2E-applicable* = UI 프로젝트(ADR-027#amend-3 다중신호 판정) ∨ graduation item 6이 e2e 명시 선언 (stabilize §1.5·MILESTONE_TEMPLATE item 3 정합). 이 경우 미통과(exit code ≠ 0 또는 미설정) 시 graduation pre-check `졸업 가능: NO` **hard-block**. (applicable 스택의 `validate:e2e`/provision은 stack-guard가 선설치 — ADR-052 D1/D2.) **단 0-spec 예외**: 미통과가 `No tests found`(spec 미작성)이면 real failure 아님 → PASS-with-warning(coverage 권장), 차단 X (spec 실행 후 실패만 hard-block — ADR-052 D3·stabilize §1.5/3-b 정합).
- *E2E-not-applicable*(비-UI ∧ item 6 e2e 미선언) = 기존대로 *해당 없음=통과*. stack-guard가 "applicable 스택이면 설정 권장" 1줄 echo(ADR-052 D2).

### 근거
- [관측됨] "정의된 경우" soft-pass가 E2E-applicable 스택을 무점검 통과시켜 readiness 없이 졸업 가능. E2E readiness 판정 SSOT는 stack-guard provision/smoke(ADR-052 D2)로 이전.

### 강도 (ADR-022)
- constraint(강) — E2E-applicable 스택에 graduation hard-block. ADR-014 본래 5+1 contract 정신 계승(졸업 모호성 제거).

### 적용 surface
- .claude/skills/stabilize-milestone/SKILL.md         — 1.5 Graduation pre-check item 3 E2E MUST-run hard-block
- .claude/skills/stack-guard/SKILL.md                 — E2E-applicable 판정 + provision/smoke (ADR-052 D2 정합)
- docs/30-workitems/_templates/MILESTONE_TEMPLATE.md  — `## 5. 완료 기준` item 3 MUST 문구
- docs/90-decisions/boilerplate/ADR-052-stack-provisioning-and-e2e-readiness.md — D3 owning ADR

<a id="adr-014-amend-3"></a>
## Amendment 3 (2026-07-26) — 회고에 graduation 판정 줄 (로드맵 파생 입력)

### 결정
`## 8. 회고`에 4 항목 위로 `graduation:` 줄을 추가한다: `YES | NO | BLOCKED (<날짜>)`. **판정 기록 시점은 stabilize 단계 8(회고 자동 채움)** — 단계 4~6 중 **qa 팬아웃이 `QA_FINDINGS.md`에 기록한 P0만** 반영한 *최종* 판정을 1회 기록한다(reviewer 팬아웃은 `IMPROVEMENT_GUIDE.md` report-only — graduation predicate에 미반영, stabilize §6-S 라우팅과 정합)(§1.5 사전점검이 아님 — §1.5에서 기록하면 이후 P0를 못 잡아 '잘못된 YES'가 박힌다). 회고는 stabilize의 정상 write 대상 — read-only 계약 불변. BLOCKED = e2e blocked-on-env. 이 줄은 `docs/30-workitems/ROADMAP.md` Done/Now 파생 입력(다음 plan-milestone R0가 읽어 재조정 — ADR-057#amend-1). 로드맵 파일 자체는 stabilize가 건드리지 않는다.

### 적용 surface
- docs/30-workitems/_templates/MILESTONE_TEMPLATE.md (§8 회고)
- .claude/skills/stabilize-milestone/SKILL.md (단계 8 판정 영속 + 회고 항목)

### 강도 (ADR-022)
- enabling(약) — 회고 항목 1줄 확장.

<a id="adr-014-amend-4"></a>
## Amendment 4 (2026-07-28) — graduation item 3의 0-spec 예외 철회

### 결정
`## Amendment 2`가 남겨 둔 **0-spec 예외**("`No tests found`면 PASS-with-warning")를 **졸업 판정에서 철회**한다. E2E-applicable 마일스톤은 **실제 실행된 e2e 테스트 1개 이상 성공**이 졸업 조건이다. 실행된 e2e가 0개면 `졸업 가능: NO`이며 상태 라벨은 `EMPTY`다.

프로비저닝(스택 확정) 단계에서 e2e가 0개인 것은 여전히 정상이며 차단하지 않는다. 차단은 **졸업 시점에만** 적용한다.

### 근거
- [관측됨] 0-spec 예외로 인해 UI 마일스톤이 e2e 0건으로 졸업 가능했다.
- [관측됨] e2e 대상 디렉터리가 비어 있을 때 러너가 다른 디렉터리의 유닛 테스트를 실행하고 exit 0을 내는 사례가 확인됐다. 종료코드 기반 판정으로는 구분되지 않는다.

### 강도 (ADR-022)
- constraint(강) — Amendment 2의 강도를 유지하며 예외만 제거.

### 적용 surface
- .claude/skills/stabilize-milestone/SKILL.md — §1.5 item 3
- .claude/skills/stack-guard/SKILL.md — 프로비저닝 판정
- docs/30-workitems/_templates/MILESTONE_TEMPLATE.md — `## 5` item 3
- docs/90-decisions/boilerplate/ADR-052-stack-provisioning-and-e2e-readiness.md — Amendment 1

> **amend 근거 (ADR-045#d6)**: 본 amendment는 `## Amendment 2`가 남긴 예외를 철회하므로 D6 표상 *"기존 결정 뒤집기"* 다. 다만 ① 본 ADR은 ADR-045(2026-05-27)보다 먼저 만들어져 누적 임계는 **grandfather**이고 ② 뒤집는 대상이 예외 단서 하나이며 판정 SSOT는 ADR-052#amend-1이 소유하므로, 본 ADR은 그 결과를 graduation item 3에 반영하는 역할만 한다. **최소 churn을 택해 amendment로 처리**하고 상단 `## 현재 유효 결정`으로 net 규칙을 노출한다. graduation contract 자체(5+1 구조)를 다시 손대야 할 다음 변경에서는 통합 재발행을 우선 검토한다.
