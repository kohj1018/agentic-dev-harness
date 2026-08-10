# ADR-067 — 마일스톤 졸업 계약 v2 (Milestone Graduation Contract v2)

> scope: boilerplate
> area: process

## Status
accepted

## 대체
- [ADR-014](ADR-014-milestone-graduation.md)를 **supersede**한다. ADR-014의 결정 3개(5+1 checklist / 회고 4항목 / pre-check + `--dry-run`)와 개정 4개(evaluator-optimizer 명명 / E2E MUST-run hard-block / 회고 graduation 줄 / 0-spec 예외 철회)를 본 ADR이 통합 승계하고, 아래 3가지를 변경한다.
  1. item 4의 판정 기준을 *자동 테스트 존재* 에서 **AC 충족(전 modality — ADR-065)** 으로 바꾼다.
  2. `BLOCKED` 판정값의 정의를 *e2e blocked-on-env* 에서 **평가 실행 불가(e2e blocked-on-env | 감사 미완)** 으로 넓힌다.
  3. 회고에 `open 항목 스냅샷` 한 줄을 추가한다.
- 통합 재발행 사유(ADR-045 D6): ADR-014#amend-4가 *"graduation contract 자체를 다시 손대야 할 다음 변경에서는 통합 재발행을 우선 검토"* 를 예약했고, 이번 라운드에 서로 다른 3개 지점을 고치므로 그 조건이 충족된다.
- **역사적 서술은 원문을 보존한다.** 다른 ADR이 *"본 D3은 ADR-014 `## Amendment 2`로 박는다"* 처럼 **과거에 한 행위**를 기록한 문장은 바꾸지 않는다(바꾸면 존재하지 않는 역사가 된다). 그 결과 그 줄들에 `P2 [Ref-dead]`(superseded ADR 인용)가 발화하는데 **의도된 상태**다 — 기록을 거짓으로 만드는 것보다 report-only 등급의 P2가 낫다.

## 배경
- [관측됨] item 4가 *자동 테스트 존재* 만 보므로 테스트로 확인 불가한 AC는 영구 미충족이고, `/finalize-workitem`의 근거 없는 opt-out 예외만이 우회로였다(상세는 ADR-065 배경).
- [관측됨] 검증 팬아웃의 축이 결과를 반환하지 않는 상태(감사 미완)에 판정값이 없어, 그 상태에서도 `graduation: YES`가 기록될 수 있다. 값이 없으면 에이전트가 관대한 답을 발명한다(dogfood에서 `NOT_APPLICABLE` 오분류로 관측).
- [관측됨] open finding이 `QA_FINDINGS.md`와 `IMPROVEMENT_GUIDE.md` 둘로 나뉘어 한 파일만 읽은 쪽이 남은 항목 수를 오독한 사례가 있다.
- [외부실증] Atlassian multi-level DoD — sprint 단위의 외부 검증 가능한 완료 기준이 "릴리즈 품질"과 "구현 완료"를 분리한다.

## 결정

### D1. Graduation checklist 5+1
MILESTONE `## 5. 완료 기준`은 다음 5개 필수 + 1개 선택이다. **항목을 증설하지 않는다.**

1. 모든 task status: `done`
2. 통합 `validate` Pass
3. E2E Pass — E2E-applicable 스택은 MUST. 판정 상태 5종(`NOT_APPLICABLE`/`EMPTY`/`PASS`/`FAIL`/`BLOCKED_ENV`)의 SSOT는 [ADR-052](ADR-052-stack-provisioning-and-e2e-readiness.md)#amend-1이며, **실제 실행된 e2e 1개 이상 성공**이 조건이다(0-spec 예외 없음).
4. **AC 충족 100% + report 유효** — 본 마일스톤 **모든 task**의 최신 `docs/40-validation/reports/<task-id>.md`가 아래 넷을 **모두** 만족한다.
   - (a) **`## AC ↔ 검증 매핑`의 전 항목이 충족.** 충족 판정 기준은 [ADR-065](ADR-065-ac-verification-contract.md) D1의 modality다 — `미관측`은 미충족이며 **`## 6-2. TDD opt-out`은 본 항목의 예외가 아니다**(ADR-065 D2).
   - (b) **report 판정이 `Pass`.** AC 행만 읽으면 다른 축의 미해소 P0(diff-trace 파괴적 변경·닫힌 결정 위반 등)가 졸업을 통과한다. 판정을 함께 읽어 그 구멍을 막는다.
   - (c) **`## Orchestration`의 `감사 미완(unavailable)` 항목이 없다.** 돌지 않은 감사를 근거로 충족을 단정하지 않는다(D3의 평가 규칙과 동일 원리).
   - (d) **report가 stale하지 않다** — report 파일 mtime이 그 task `## 4-1`에 등재된 **구현 파일**들의 최신 mtime보다 오래되지 않았다(같으면 통과 — 저해상도 파일시스템 오차단 방지).
     - **비교 대상에서 task 문서를 제외한다(중요).** `/finalize-workitem`은 stale 검사를 통과한 *뒤에* task `## 0. Status`를 `done`으로 쓰므로, 정상 마감된 모든 task는 task 문서 mtime > report mtime이 된다. task 문서를 비교에 넣으면 **정상 경로의 전 task가 미충족**이 되어 어떤 마일스톤도 졸업하지 못한다.
     - task `## 8` 갱신(receipt 발급·무효화)은 이 항이 아니라 **(a)** 가 잡는다 — receipt를 발급해도 report의 그 AC 행은 여전히 미충족이므로 재validate 없이는 (a)를 통과할 수 없다.
     - **`## 4-1`에 없는 파일을 고치는 cross-cutting 수정**(`/repair-milestone`)은 mtime으로 잡히지 않는다. 그 경로는 **그 skill이 영향 task의 report를 삭제**하는 것으로 처리한다 — report 부재 = 미충족이므로 재validate가 강제된다.
     - stale이면 미충족으로 처리하고 처방은 **그 task의 `/validate-workitem` 재실행**이다.
   - **report 부재 task는 미충족**으로 처리한다. 새 체크아웃·다른 worktree가 이에 해당하며(report는 gitignore된 checkout-local ephemeral — 설계상 정상), 그때는 각 task의 `/validate-workitem`을 먼저 재실행한 뒤 본 항목을 평가한다.
5. P0 severity finding 0건 — `QA_FINDINGS.md`의 본 마일스톤 헤더 `### P0`에서 `status: resolved`가 아닌 항목 수 0.
6. (선택) 본 마일스톤 한정 추가 기준

### D2. 회고 5항목
`## 8. 회고`는 다음을 담는다.
- `graduation:` 판정 줄 (D3)
- `open 항목 스냅샷:` — `QA_FINDINGS.md`와 `IMPROVEMENT_GUIDE.md`의 **미해소 항목 합계 + 이전 마일스톤 carry-over 수** 한 줄(두 원장을 각각 읽어야만 알 수 있는 수를 한 곳에 남긴다)
- 목표 달성도 / scope creep 사례 / 비목표 위반 사례 / 핵심 학습 3개 이내

### D3. graduation 판정값 3종
`graduation: <YES | NO | BLOCKED> (<날짜>)`.
- **`YES`** — D1의 5(+선택 6) 항목 전부 충족.
- **`NO`** — 제품·계획 사유로 미충족.
- **`BLOCKED`** — **평가 실행 불가**. 두 경우다: (a) e2e blocked-on-env, (b) **감사 미완** — 졸업 predicate에 입력을 주는 축(qa 팬아웃)의 감사를 회수 규율을 전부 소진해도 완료하지 못한 상태. 표기는 `BLOCKED (audit incomplete: <축>)` / `BLOCKED (e2e blocked-on-env: <target>)`.
  - **`BLOCKED`는 기존에 기록된 `YES`를 덮어쓴다.** 재검증 라운드에서 감사가 미완인데 줄을 쓰지 않으면 낡은 `YES`가 그대로 남아 하류(ROADMAP Done)가 졸업으로 읽는다.
  - **미실행 감사가 입력을 주는 predicate는 «충족»으로 단정할 수 없다.** 이것은 새 checklist 항목이 아니라 D1 항목의 *평가 규칙*이다.
  - reviewer 팬아웃은 졸업 predicate 입력이 아니므로(report-only) 그 축의 감사 미완은 **기록·echo만 하고 판정을 바꾸지 않는다.**
  - **`YES (… 미검증: <축>)` 같은 병기 통과를 본 ADR은 도입하지 않는다.** `YES`는 D1의 전 항목 충족을 뜻하므로 미검증 축을 병기한 `YES`는 정의와 모순된다. host 제약 e2e target(예: Windows 호스트의 iOS)의 처리는 **본 ADR이 바꾸지 않으며 [ADR-052](ADR-052-stack-provisioning-and-e2e-readiness.md)#amend-1과 [ADR-059](ADR-059-flutter-mobile-profile.md) D4가 그대로 소유한다** — 같은 커밋의 registry PASS 증거가 있으면 그 target을 `PASS`로 보고, 없으면 `BLOCKED_ENV`로 졸업을 차단한다. (그 교착을 완화하는 별도 방향이 dogfood에 기록돼 있으나 아직 채택되지 않았다 — 본 ADR은 그 결정을 대신 내리지 않는다.)
  - 따라서 D3의 `BLOCKED`가 덮는 것은 둘뿐이다: **(a) e2e blocked-on-env**(ADR-052#amend-1 판정 그대로), **(b) 감사 미완**. 계약상 애초에 대상이 아닌 것은 `NOT_APPLICABLE`이다.
  - **validate 층도 같은 규칙을 받는다** — `/validate-workitem`의 감사 축이 회수 규율을 전부 소진해도 미완이면 그 report는 `Pass`를 낼 수 없다(위 D1 item 4 (c)의 입력). 이것은 새 게이트가 아니라 본 D3의 평가 규칙을 task 층에 적용한 것이며, 기록 규율의 근거는 ADR-051#amend-4 결정 2다.
- 기록 시점은 `/stabilize-milestone` 단계 8이며 1회만 쓴다(§1.5 사전점검에서 쓰지 않는다 — 단계 4~6이 새 P0를 찾을 수 있다). P0 기준은 qa 팬아웃이 `QA_FINDINGS.md`에 기록한 것만 반영한다(reviewer는 report-only).
- 이 줄은 `docs/30-workitems/ROADMAP.md` Done/Now의 파생 입력이다(다음 `/plan-milestone` R0가 읽어 재조정 — ADR-057#amend-1). 로드맵 파일 자체는 stabilize가 건드리지 않는다.

### D4. Graduation pre-check + `--dry-run`
`/stabilize-milestone` §1.5가 D1 각 항목을 deterministic 평가한다. 미충족 시 `졸업 가능: NO` + 미충족 목록 출력 + 조기 종료 옵션 제시(강제 종료 아님). `--dry-run`은 pre-check만 돌리고 종료한다(판정 미기록).

### D5. Evaluator-optimizer 패턴 명명
`/stabilize-milestone`이 instantiate하는 패턴을 evaluator-optimizer로 명명한다 — generator = `/implement-workitem`, evaluator = qa + reviewer + deterministic preflight, optimizer = `/repair-workitem`.

### D6. 사용자 수용과의 관계
[ADR-066](ADR-066-milestone-acceptance.md)의 `/accept-milestone`은 **졸업 필수 조건이 아니다**(권장). 단 `사용자 관측`·`플랫폼 관측` modality를 쓴 AC는 그 receipt 없이 item 4를 충족하지 못한다(그 receipt는 task 스코프 `--task`나 사용자 직접 기재로도 발급된다 — 마일스톤 수용 라운드를 돌려야만 하는 것은 아니다). 필수 승격 트리거는 *졸업 `YES` 후 사용자가 P0급 경험 결함을 발견한 사례* 이며, 그때 본 ADR을 개정한다.

## 비결정 (영구 No)
- Release-level DoD — stabilize 출력에 자연 흡수(carry-over 0건 + ADR 후보 0건 = release-ready).
- Fowler 4-quadrant test classification — 정확도 보장 불가, YAGNI.
- METRICS.md — 메트릭 정의는 프로젝트별 결정.
- `--apply-carryover` 자동 이월 — 사용자 명시 결정 필요(ADR-007 책임 경계).
- architect auto-escalation 신호 — 트리거 기준 정의 불가.

## 결과
- 졸업 판정의 네 소비 지점(plan·validate·finalize·stabilize)이 같은 AC 기준을 읽는다.
- 감사가 못 돈 상태가 `BLOCKED`로 드러나며 낡은 `YES`를 덮어쓴다.
- 회고 한 줄로 두 원장의 미해소 합계를 볼 수 있다.

## 정책 강도 (ADR-022)
- **제약(강) — [관측됨]**: D1 item 3·4, D3 `BLOCKED`의 덮어쓰기.
- **enabling(약)**: D2 회고 항목, D4 pre-check, D5 명명, D6 비차단 관계.

## Mutation Contract (ADR-047 D3)
1. **Target** — MILESTONE_TEMPLATE `## 5`·`## 8` / stabilize §1.5·단계 8·회고 책임 경계 / validate-workitem 감사 미완 판정 / repair-milestone·repair-acceptance report 무효화 / ADR-014 status·supersede note / ADR-014 인용 파일 전수(실행 경로는 재지정, 역사적 서술은 병기).
2. **Failure mode** — (a) 테스트 불가 AC로 졸업 영구 차단 (b) 감사 미완 상태에서 `YES` 기록 (c) 낡은 `YES` 보존 (d) 두 원장 중 한쪽만 읽고 남은 항목 오독.
3. **Predicted improvement** — item 4 미충족 사유가 modality로 분해되어 보이고, 감사 미완이 `BLOCKED`로 관측되며, 회고에 open 합계가 남는다.
4. **Preserved invariants** — 5+1 구조·항목 무증설 / e2e 판정 SSOT는 ADR-052#amend-1 / `/stabilize-milestone` read-only 및 write 대상 4종 / ROADMAP 단일 작성자 = plan-milestone.
5. **Falsifying evaluation** — dogfood 재실행에서 (a) 정상 마일스톤이 `BLOCKED (audit incomplete)`로 오차단되거나, (b) item 4가 modality 표기 누락만으로 미충족을 내면 D1·D3을 재조정한다.
6. **Rollback path** — 본 ADR을 superseded로 두고 **후속 ADR이 net 규칙을 다시 정의한다**(ADR-014를 `accepted`로 되살리지 않는다 — supersede 이력은 되돌리지 않는 것이 이 저장소의 규약이다). 되돌릴 실질은 셋이다: item 4를 «자동 테스트 매핑 100%» 기준으로, `BLOCKED`를 «e2e blocked-on-env» 한정으로, 회고에서 `open 항목 스냅샷:` 줄 제거.

## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT. 실제 파일 경로 1행 1개)
- .claude/skills/stabilize-milestone/SKILL.md          — D1 §1.5 / D2·D3 단계 8 회고 / D4 --dry-run / D5 명명 1줄
- .claude/skills/validate-workitem/SKILL.md            — D3 validate 층 평가 규칙(감사 미완 시 Pass 불가) + item 4 (c) 입력 기록
- .claude/skills/repair-milestone/SKILL.md             — D1 item 4 (d) 보완: cross-cutting 수정 시 영향 task report 삭제
- .claude/skills/repair-acceptance/SKILL.md            — D1 item 4 (d) 보완: 수리한 task report 삭제
- .claude/skills/stack-guard/SKILL.md                  — D1 item 3 E2E-applicable 판정
- docs/30-workitems/_templates/MILESTONE_TEMPLATE.md   — D1 `## 5` / D2 `## 8`
- docs/00-meta/DELEGATION_STRATEGY.md                  — D5 evaluator-optimizer 1줄
- docs/90-decisions/boilerplate/ADR-014-milestone-graduation.md — superseded note

## 참고
- ADR-007(lifecycle), ADR-009(TDD), ADR-022(Ratchet), ADR-045 D6(재발행 기준), ADR-052#amend-1(e2e 5상태 SSOT), ADR-057#amend-1(ROADMAP 파생), ADR-065(AC 검증 modality), ADR-066(수용 단계).
