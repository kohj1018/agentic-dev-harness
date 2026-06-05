# ADR-050 — 일부 lifecycle skill 메인 세션 실행 + 실행 inner-loop model-invocable

> scope: boilerplate

## Status
accepted

## 배경
- [관측됨] bootstrap/validate/repair류 skill이 `context: fork` 서브에이전트로 돌면, (1) 사용자 실시간 권한 응답이 불가해 리뷰·report 파일 `rm`이 막히고, (2) repair가 풀 프로젝트 컨텍스트로 "검증이 맞는지"를 판단하기 어렵다.
- [관측됨] task 실행 inner-loop(implement→validate→repair→finalize)를 메인 세션이 매번 슬래시 커맨드 재입력으로만 진행하게 하면, 메인이 흐름을 *직접 운전*할 수 없다.
- 기존 규약: ADR-007 `## 결정`("skill 간 흐름은 자동 호출이 아니라 텍스트 제안 → 사용자/메인이 발화"), ADR-047 D3 보존 invariant "skill auto-invocation 금지". 본 ADR은 이를 *실행 inner-loop 4종에 한해* 의도적으로 좁힌다.

## 결정

### D1. 일부 lifecycle skill을 메인 세션 실행으로 전환
다음 7종에서 `context: fork`(및 죽은 `agent:`)를 제거해 메인 세션 인라인 실행한다: bootstrap-project, bootstrap-stack, stack-guard, validate-plan, repair-plan, validate-workitem, repair-workitem.
- bootstrap-project/bootstrap-stack은 무거운 아키텍처 추론을 `Agent`로 architect sub-call 위임(discover-product·bootstrap-design 패턴). 나머지는 메인 세션이 직접 수행.
- `context-pack: minimal`은 유지(메인 세션 skill도 사용 — discover-product 선례).
- implement-workitem·finalize-workitem은 fork 유지(구현 컨텍스트 폭증·git 조작 격리 이득).

### D2. task 실행 inner-loop 4종 model-invocable
implement-workitem, validate-workitem, repair-workitem, finalize-workitem에서 `disable-model-invocation: true`를 제거해 **모델이 Skill 도구로 직접 호출**할 수 있게 한다.
- 효과: 메인 세션이 "다음 액션 추천"을 *제안*에 그치지 않고 직접 실행하는 단일-task inner-loop를 운전할 수 있다.
- **범위 한정**: 그 외 모든 skill은 `disable-model-invocation` 유지 — bootstrap-project/bootstrap-stack/stack-guard/discover-product/bootstrap-design/plan-workitem/stabilize-milestone + cross-session 리뷰 skill(validate-plan/repair-plan/validate-discovery/repair-discovery). 텍스트 제안 + 사용자/메인 명시 발화 규약을 그대로 둔다.

### D3. repair-workitem 비판적 재점검 + 전 severity 완결 + report 삭제
repair-workitem은 validator report를 기계적으로 수정하지 않고, repair-plan과 동형의 4-판정(Adopt / Adopt-modified / Reject-false-positive / Reject-context)으로 *검증의 정확성*을 먼저 점검한다. **report를 삭제하므로 defer 시 정보가 사라진다 → 한 라운드에 P0/P1/P2를 모두 4-판정으로 완결**한다(repair-plan과 동일). 이는 ADR-007 `## 결과`의 "repair 한 라운드는 P0/P1만 처리, P2 defer" 정책을 *대체*한다 — 그 defer는 report를 *영속*하던 시절 정책이고, report 삭제 도입으로 더는 성립하지 않는다(ADR-007#amend-4가 명문 갱신). 처리한 P0/P1 결정은 task `## 8. 메모`에 영속(ADR-047 D7, P2는 cap 보호로 미영속), 소비한 report는 삭제한다(다음 validate가 새로 생성).

## Mutation Contract (ADR-047 D3)
1. **Target** — `.claude/skills/{bootstrap-project,bootstrap-stack,stack-guard,validate-plan,repair-plan,validate-workitem,repair-workitem,implement-workitem,finalize-workitem}/SKILL.md` frontmatter·본문; ADR-007 `## 결정`·`## 결과` 자동 호출/repair 라운드 단락, WORKFLOW.md·DELEGATION_STRATEGY.md 자동 호출 단락.
2. **Failure mode** — fork 격리로 인한 권한 미응답(리뷰·report 파일 삭제 실패)·repair 맥락 부족; inner-loop를 메인이 직접 운전 불가 (관측됨).
3. **Predicted improvement** — repair 삭제 성공률 ↑, false-positive 수정 감소(4-판정 Reject 기록), 메인 세션 inner-loop 운전 가능.
4. **Preserved invariants** — validate report 양식·lifecycle 8단계 책임 경계·signal-first cap 유지. **단, ADR-047 D3 예시 invariant "skill auto-invocation 금지"는 본 ADR D2가 4개 실행 skill에 한해 의도적으로 좁힌다**(나머지 skill은 유지).
5. **Falsifying evaluation** — ADR-017 dogfood 재실행에서 model-invocation이 *원치 않는 자동 연쇄*(예: 사용자 확인 전 finalize 커밋)를 일으키면 D2 범위 재검토 또는 되돌림.
6. **Rollback path** — 본 ADR superseded + 해당 skill에 `context: fork`/`disable-model-invocation: true` 복원.

## 정책 강도 (ADR-022)
- D1·D3: enabling(약) — capability/품질 개선. D2: constraint 완화(약) — 자동 연쇄 남용 시 reviewer가 P1로 보고.

## 결과
- de-fork 7종 메인 세션 실행, inner-loop 4종 model-invocable, repair-workitem 판단형 + report 삭제.
- ADR-007 `## 결정` 자동 호출 규약은 *실행 inner-loop 한정*으로 좁혀짐(본 ADR이 amend 역할 — ADR-007#amend-4).

## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT. ADR-045 정합 — 실제 파일 경로 1행 1개, 생략·comma-join 금지)
- .claude/skills/bootstrap-project/SKILL.md
- .claude/skills/bootstrap-stack/SKILL.md
- .claude/skills/stack-guard/SKILL.md
- .claude/skills/validate-plan/SKILL.md
- .claude/skills/repair-plan/SKILL.md
- .claude/skills/validate-workitem/SKILL.md
- .claude/skills/repair-workitem/SKILL.md
- .claude/skills/implement-workitem/SKILL.md
- .claude/skills/finalize-workitem/SKILL.md
- docs/00-meta/WORKFLOW.md                                       — 자동 호출 정책 + fork 분포 메모
- docs/00-meta/DELEGATION_STRATEGY.md                           — 스킬 자동 호출 단락 + 위임 트리거 표 정합 노트
- docs/90-decisions/boilerplate/ADR-007-workitem-lifecycle.md   — `## 결정`·`## 결과` 자동 호출/repair 라운드 amend 포인터(#adr-007-amend-4)

## 참고
- ADR-007(lifecycle), ADR-038(repair-plan 4-판정 대칭), ADR-040(연구·의존성), ADR-046(signal-first), ADR-047(harness mutation), ADR-019(context-pack), ADR-014(evaluator-optimizer).
