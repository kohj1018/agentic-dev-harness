# ADR-067 — 마일스톤 졸업 계약 v2 (Milestone Graduation Contract v2)

> scope: boilerplate
> area: process

## Status
superseded (by ADR-068)

> 본 ADR의 결정은 [ADR-068](ADR-068-milestone-closure-and-graduation-v3.md)이 통합 승계했다. 졸업 item 4의 (a)(b)(c)(d)·mtime 판정·`--dry-run`은 폐지됐다. (현재 SSOT: ADR-068)

## 대체
- [ADR-014](ADR-014-milestone-graduation.md)를 **supersede**한다(현재 SSOT: 본 ADR). ADR-014의 결정 3개(5+1 checklist / 회고 4항목 / pre-check + `--dry-run`)와 개정 4개(evaluator-optimizer 명명 / E2E MUST-run hard-block / 회고 graduation 줄 / 0-spec 예외 철회)를 본 ADR이 통합 승계하고, 아래 3가지를 변경한다.
  1. item 4의 판정 기준을 *자동 테스트 존재* 에서 **AC 충족(전 modality — ADR-065)** 으로 바꾼다.
  2. `BLOCKED` 판정값의 정의를 *e2e blocked-on-env* 에서 **평가 실행 불가(e2e blocked-on-env | 감사 미완)** 으로 넓힌다.
  3. 회고에 `open 항목 스냅샷` 한 줄을 추가한다.
- 통합 재발행 사유(ADR-045 D6): ADR-014#amend-4가 *"graduation contract 자체를 다시 손대야 할 다음 변경에서는 통합 재발행을 우선 검토"* 를 예약했고, 이번 라운드에 서로 다른 3개 지점을 고치므로 그 조건이 충족된다. (현재 SSOT: 본 ADR)
- **ADR-014 인용의 처리는 [ADR-045](ADR-045-doc-reference-contract.md)#amend-2의 5종 분류를 따른다.** 살아있는 규칙 인용은 재지정하고, **Rollback path·Mutation Target 같은 «실행 불가가 된 지시»는 현재 유효한 내용으로 재작성하며**(그것은 역사가 아니라 죽은 절차다), 배경 서술은 링크를 제거하고 산문으로 다시 쓴다. **supersede 선언·인덱스 행·실행 기록(Record)만 원문을 보존하고 그 줄 끝에 `(현재 SSOT: ADR-NNN)`을 병기한다** — `/stabilize-milestone`의 `[Ref-dead]` 검사는 그 병기가 있는 줄을 건너뛰므로, 처리를 마치면 이 supersede로 인한 `[Ref-dead]` 발화는 0건이 된다. **과거에 한 행위를 기록한 문장 자체는 바꾸지 않는다**(바꾸면 존재하지 않는 역사가 된다) — 기록은 사실대로 두고 검사 소음은 마커로 없앤다. (현재 SSOT: 본 ADR)

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
4. **AC 충족 100% + report 유효** — 본 마일스톤 **모든 task**에 대해 아래를 **모두** 만족한다. **입력이 둘로 나뉜다** — 기계 검증 AC는 채점표(`docs/40-validation/reports/<task-id>.md`)에서, 관측 AC는 task 문서 `## 8`에서 **직접** 읽는다.
   - (a) **기계 검증 AC 전부 충족** — 채점표 `## AC ↔ 검증 매핑`에서 modality가 `[자동 테스트]`·`[산출물 검사]`이거나 표기 부재(legacy)인 AC가 전부 충족. 판정 기준은 [ADR-065](ADR-065-ac-verification-contract.md) D1 modality이며 `미관측`은 미충족, **`## 6-2. TDD opt-out`은 본 항목의 예외가 아니다**(ADR-065 D2).
   - (a') **관측 AC 전부 receipt 유효** — task `## 6-1`에서 modality가 `[사용자 관측]`·`[플랫폼 관측]`인 AC마다, **그 task `## 8`의 (HTML 주석 밖) 그 AC 마지막 이벤트가 `- ac-acceptance`** 인가(ADR-065 D3 판독 규칙 2). `- ac-pending`·`- invalidated`이거나 이벤트가 없으면 미충족.
     - **채점표를 경유하지 않는 이유(중요)**: receipt는 코드 상태와 무관한 사실이고 커밋된 task 문서에 있다. 채점표를 경유하면 receipt 발급마다 그 task의 `/validate-workitem` 재실행이 강제되어, 수용 라운드 1회마다 관측 AC를 쓴 task 수만큼 재채점이 발생한다.
     - **(a')만 미충족이고 나머지가 전부 충족이면 graduation은 `PENDING_ACCEPTANCE`다**(D3). 처방은 `/accept-milestone <M>`이다.
   - (b) **채점표 판정이 `Pass` 또는 `Pending Acceptance`**(ADR-065 D6). AC 행만 읽으면 다른 축의 미해소 P0(diff-trace 파괴적 변경·닫힌 결정 위반 등)가 졸업을 통과하므로 판정을 함께 읽어 그 구멍을 막는다. **`Needs Fix`는 미충족이다.**
   - (c) **채점표 `## Orchestration`의 `감사 미완(unavailable)` 항목이 없다.** 돌지 않은 감사를 근거로 충족을 단정하지 않는다(D3의 평가 규칙과 동일 원리).
   - (d) **채점표가 stale하지 않다** — 채점표 파일 mtime이 그 task `## 4-1`에 등재된 **구현 파일**들의 최신 mtime보다 오래되지 않았다(같으면 통과 — 저해상도 파일시스템 오차단 방지).
     - **비교 대상에서 task 문서를 제외한다(중요).** `/finalize-workitem`은 stale 검사를 통과한 *뒤에* task `## 0. Status`를 `done`으로 쓰므로, 정상 마감된 모든 task는 task 문서 mtime > 채점표 mtime이 된다. task 문서를 비교에 넣으면 **정상 경로의 전 task가 미충족**이 되어 어떤 마일스톤도 졸업하지 못한다.
     - **task `## 8` 갱신(receipt 발급·무효화)은 이 항의 대상이 아니다** — task 문서를 비교에 넣지 않으므로 receipt 발급이 stale을 만들지 않고, 그 AC의 판정은 **(a')** 가 담당한다.
     - **`## 4-1`에 없는 파일을 고치는 cross-cutting 수정**(`/repair-milestone`)은 mtime으로 잡히지 않는다. 그 경로는 **그 skill이 영향 task의 채점표를 삭제**하는 것으로 처리한다 — 부재 = 미충족이므로 재validate가 강제되고, **그 재validate는 `/repair-milestone`이 자기 루프 안에서 스스로 실행한다**(사용자에게 미루지 않는다).
     - **`## 4-1`이 비어 비교 대상을 얻지 못하는 task는 «비교 불가»로 기록만 하고 차단하지 않는다** — `/stabilize-milestone` §1.5 출력에 한 줄 남긴다(관측 없이 게이트를 조이지 않는다 — ADR-022).
     - stale이면 미충족으로 처리하고 처방은 **그 task의 `/validate-workitem` 재실행**이다.
   - **채점표 부재 task는 미충족**으로 처리한다. 새 체크아웃·다른 worktree가 이에 해당하며(채점표는 gitignore된 checkout-local ephemeral — 설계상 정상), 그때는 각 task의 `/validate-workitem`을 먼저 재실행한 뒤 본 항목을 평가한다.
5. P0 severity finding 0건 — `QA_FINDINGS.md`의 본 마일스톤 헤더 `### P0`에서 `status: resolved`가 아닌 항목 수 0.
6. (선택) 본 마일스톤 한정 추가 기준

### D2. 회고 5항목
`## 8. 회고`는 다음을 담는다.
- `graduation:` 판정 줄 (D3)
- `open 항목 스냅샷:` — `QA_FINDINGS.md`와 `IMPROVEMENT_GUIDE.md`의 **미해소 항목 합계 + 이전 마일스톤 carry-over 수** 한 줄(두 원장을 각각 읽어야만 알 수 있는 수를 한 곳에 남긴다)
- 목표 달성도 / scope creep 사례 / 비목표 위반 사례 / 핵심 학습 3개 이내

### D3. graduation 판정값 4종
`graduation: <YES | PENDING_ACCEPTANCE | NO | BLOCKED> (<날짜>)`.
- **`YES`** — D1의 5(+선택 6) 항목 전부 충족. 최종 졸업.
- **`PENDING_ACCEPTANCE`** — **사용자 확인만 남았다.** D1 item 4의 **(a') 관측 AC receipt를 제외한 전부**가 충족이다(item 1·2·3·5 전부 충족 + item 4 (a)(b)(c)(d) 충족). 표기는 `PENDING_ACCEPTANCE (관측 AC 미발급: <task-id>:AC-N 목록)` — 예: `PENDING_ACCEPTANCE (관측 AC 미발급: T-004:AC-3, T-007:AC-2)`. 처방은 `/accept-milestone <M>`이다.
- **`NO`** — 제품·계획 사유로 미충족.
- **`BLOCKED`** — **평가 실행 불가**. 두 경우다: (a) e2e blocked-on-env, (b) **감사 미완** — 졸업 predicate에 입력을 주는 축(qa 팬아웃)의 감사를 회수 규율을 전부 소진해도 완료하지 못한 상태. 표기는 `BLOCKED (audit incomplete: <축>)` / `BLOCKED (e2e blocked-on-env: <target>)`.
  - **매 `/stabilize-milestone` 실행이 이 줄을 그 라운드의 최신 판정으로 덮어쓴다.** 특히 `BLOCKED`·`NO`·`PENDING_ACCEPTANCE`는 기존에 기록된 `YES`를 덮어쓴다 — 재검증 라운드에서 줄을 쓰지 않으면 낡은 `YES`가 그대로 남아 하류(ROADMAP Done)가 졸업으로 읽는다.
  - **미실행 감사가 입력을 주는 predicate는 «충족»으로 단정할 수 없다.** 이것은 새 checklist 항목이 아니라 D1 항목의 *평가 규칙*이다.
  - reviewer 팬아웃은 졸업 predicate 입력이 아니므로(report-only) 그 축의 감사 미완은 **기록·echo만 하고 판정을 바꾸지 않는다.**
  - **`YES (… 미검증: <축>)` 같은 병기 통과를 본 ADR은 도입하지 않는다.** `YES`는 D1의 전 항목 충족을 뜻하므로 미검증 축을 병기한 `YES`는 정의와 모순된다. host 제약 e2e target(예: Windows 호스트의 iOS)의 처리는 **본 ADR이 바꾸지 않으며 [ADR-052](ADR-052-stack-provisioning-and-e2e-readiness.md)#amend-1과 [ADR-059](ADR-059-flutter-mobile-profile.md) D4가 그대로 소유한다** — 같은 커밋의 registry PASS 증거가 있으면 그 target을 `PASS`로 보고, 없으면 `BLOCKED_ENV`로 졸업을 차단한다. (그 교착을 완화하는 별도 방향이 dogfood에 기록돼 있으나 아직 채택되지 않았다 — 본 ADR은 그 결정을 대신 내리지 않는다.)
  - 따라서 D3의 `BLOCKED`가 덮는 것은 둘뿐이다: **(a) e2e blocked-on-env**(ADR-052#amend-1 판정 그대로), **(b) 감사 미완**. 계약상 애초에 대상이 아닌 것은 `NOT_APPLICABLE`이다.
  - **validate 층도 같은 규칙을 받는다** — `/validate-workitem`의 감사 축이 회수 규율을 전부 소진해도 미완이면 그 report는 `Pass`를 낼 수 없다(위 D1 item 4 (c)의 입력). 이것은 새 게이트가 아니라 본 D3의 평가 규칙을 task 층에 적용한 것이며, 기록 규율의 근거는 ADR-051#amend-4 결정 2다.
- **우선순위 (둘 이상 성립할 때)**: `BLOCKED` > `NO` > `PENDING_ACCEPTANCE` > `YES`. 「못 재봤다」가 어떤 긍정 판정보다 강하고, 「결함이 있다」가 「확인만 남았다」보다 앞선다.
- **`PENDING_ACCEPTANCE`가 별도 값인 이유**: 이 상태를 `NO`로 뭉뚱그리면 사용자가 `/repair-milestone`을 호출하는데 고칠 코드가 없어 헛돈다. 판정값마다 다음 액션이 다르다는 것이 이 enum의 존재 이유이며, task 층의 `/validate-workitem` 판정 3종(ADR-065 D6)과 같은 원리다.
- **`ROADMAP.md`의 Done 전환은 `YES`일 때만이다.** `PENDING_ACCEPTANCE`는 Now를 유지한다.
- **관측 modality AC가 0건인 마일스톤에서는 `PENDING_ACCEPTANCE`가 성립하지 않는다** — 그때는 나머지가 전부 충족이면 곧바로 `YES`이며, `/accept-milestone`은 권장(선택)으로 남는다.
- 기록 시점은 `/stabilize-milestone` 단계 8이며 1회만 쓴다(§1.5 사전점검에서 쓰지 않는다 — 단계 4~6이 새 P0를 찾을 수 있다). P0 기준은 qa 팬아웃이 `QA_FINDINGS.md`에 기록한 것만 반영한다(reviewer는 report-only).
- 이 줄은 `docs/30-workitems/ROADMAP.md` Done/Now의 파생 입력이다(다음 `/plan-milestone` R0가 읽어 재조정 — ADR-057#amend-1). 로드맵 파일 자체는 stabilize가 건드리지 않는다.

### D4. Graduation pre-check + `--dry-run`
`/stabilize-milestone` §1.5가 D1 각 항목을 deterministic 평가한다. 미충족 시 `졸업 가능: NO` + 미충족 목록 출력 + 조기 종료 옵션 제시(강제 종료 아님). **단 item 4 (a')만 미충족이고 나머지가 전부 충족이면 `졸업 가능: PENDING_ACCEPTANCE (관측 AC 미발급: <task-id>:AC-N 목록)`을 출력하고 조기 종료 옵션 없이 다음 단계로 계속 진행한다**(D3 — 결함이 아니라 «사람 확인만 남은» 상태이므로 되돌아가 고칠 것이 없다). `--dry-run`은 pre-check만 돌리고 종료한다(판정 미기록).

### D5. Evaluator-optimizer 패턴 명명
`/stabilize-milestone`이 instantiate하는 패턴을 evaluator-optimizer로 명명한다 — generator = `/implement-workitem`, evaluator = qa + reviewer + deterministic preflight, optimizer = `/repair-workitem`.

### D6. 사용자 수용과의 관계
[ADR-066](ADR-066-milestone-acceptance.md)의 `/accept-milestone`은 **관측 modality AC가 0건인 마일스톤에서만 선택이다**(권장·비차단). 관측 AC가 1건이라도 있으면 그 receipt 없이 item 4 (a')를 충족하지 못하므로 사실상 필수 경로가 되며, 그 상태의 판정값이 `PENDING_ACCEPTANCE`다(D3). receipt는 `/accept-milestone <M>` 또는 사용자 직접 기재로 발급된다.

**졸업 판정 소유권은 `/stabilize-milestone`에 유지한다.** 수용 라운드가 코드를 고쳤으면 그 뒤 본 skill을 재실행해 `YES`를 확정한다. **단 receipt 발급 자체는 재validate를 유발하지 않는다** — item 4 (a')가 task `## 8`을 직접 읽기 때문이다.

## 비결정 (영구 No)
- Release-level DoD — stabilize 출력에 자연 흡수(carry-over 0건 + ADR 후보 0건 = release-ready).
- Fowler 4-quadrant test classification — 정확도 보장 불가, YAGNI.
- METRICS.md — 메트릭 정의는 프로젝트별 결정.
- `--apply-carryover` 자동 이월 — 사용자 명시 결정 필요(ADR-007 책임 경계).
- architect auto-escalation 신호 — 트리거 기준 정의 불가.

## 결과
- 졸업 판정의 네 소비 지점(plan·validate·finalize·stabilize)이 같은 AC 기준을 읽되, **관측 AC의 판정 입력만은 채점표가 아니라 task `## 8`이다.**
- 감사가 못 돈 상태가 `BLOCKED`로, 사용자 확인만 남은 상태가 `PENDING_ACCEPTANCE`로 드러나며 둘 다 낡은 `YES`를 덮어쓴다.
- 회고 한 줄로 두 원장의 미해소 합계를 볼 수 있다.
- 수용 라운드의 **receipt 발급이 재validate를 유발하지 않는다** — 마일스톤 층 왕복 1회당 task 층 재채점 N회가 사라진다.

## 정책 강도 (ADR-022)
- **제약(강) — [관측됨]**: D1 item 3·4, D3 `BLOCKED`의 덮어쓰기.
- **enabling(약)**: D2 회고 항목, D4 pre-check, D5 명명, D6 비차단 관계.

## Mutation Contract (ADR-047 D3)
1. **Target** — MILESTONE_TEMPLATE `## 5`·`## 8` / stabilize §1.5(item 4 (a)(a')(b)(c)(d))·단계 8 판정 4종·회고 책임 경계 / plan-milestone `## 5` default 복사·로드맵 재조정 / validate-plan·reviewer `[MP-graduation]` / validate-workitem 감사 미완 판정 / repair-milestone·repair-acceptance 채점표 무효화 / accept-milestone `PENDING_ACCEPTANCE` 소비 / ADR-014 status·supersede note / ADR-014 인용 파일 전수(ADR-045#amend-2 D10 분류에 따라 처리). (현재 SSOT: 본 ADR)
2. **Failure mode** — (a) 테스트 불가 AC로 졸업 영구 차단 (b) 감사 미완 상태에서 `YES` 기록 (c) 낡은 `YES` 보존 (d) 두 원장 중 한쪽만 읽고 남은 항목 오독.
3. **Predicted improvement** — item 4 미충족 사유가 modality로 분해되어 보이고, 감사 미완이 `BLOCKED`로 관측되며, 회고에 open 합계가 남는다.
4. **Preserved invariants** — 5+1 구조·항목 무증설(item 4의 (a)/(a') 분기는 *입력 출처* 분리이며 항목 증설이 아니다) / e2e 판정 SSOT는 ADR-052#amend-1 / `/stabilize-milestone` read-only 및 write 대상 4종 / ROADMAP `Done`·`Now`·`Next`·`Later` 구간은 `/plan-milestone` 단독 작성자(`## Backlog`는 append-only 다중 writer — [ADR-057](ADR-057-planning-v2-batch-and-seam.md)#amend-4) / 졸업 판정 소유권 = `/stabilize-milestone` / commit owner = `/finalize-workitem`·사용자 (ADR-047 D7).
5. **Falsifying evaluation** — dogfood 재실행에서 (a) 정상 마일스톤이 `BLOCKED (audit incomplete)`로 오차단되거나, (b) item 4가 modality 표기 누락만으로 미충족을 내거나, (c) **관측 AC가 있는 정상 마일스톤이 `PENDING_ACCEPTANCE`가 아니라 `NO`로 나오면**(= item 4 (b)와 (a')가 서로를 막는 상태) D1·D3을 재조정한다.
6. **Rollback path** — 본 ADR을 superseded로 두고 **후속 ADR이 net 규칙을 다시 정의한다**(ADR-014를 `accepted`로 되살리지 않는다 — supersede 이력은 되돌리지 않는 것이 이 저장소의 규약이다). 되돌릴 실질은 넷이다: item 4를 «자동 테스트 매핑 100%» 기준으로, 판정값을 3종(`YES`·`NO`·`BLOCKED`)으로, `BLOCKED`를 «e2e blocked-on-env» 한정으로, 회고에서 `open 항목 스냅샷:` 줄 제거. (현재 SSOT: 본 ADR)

## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT. 실제 파일 경로 1행 1개)
> 등재 기준: 본 ADR의 결정을 **실행하거나 집행하는 파일만** 등재한다. 본 ADR을 배경·역사로 언급만 하는 파일(재지정 문구·supersede 선언 등)은 등재하지 않는다.
- .claude/skills/stabilize-milestone/SKILL.md          — D1 §1.5 / D2·D3 단계 8 회고 / D4 --dry-run / D5 명명 1줄
- .claude/skills/validate-workitem/SKILL.md            — D3 validate 층 평가 규칙(감사 미완 시 Pass 불가) + item 4 (c) 입력 기록
- .claude/skills/repair-milestone/SKILL.md             — D1 item 4 (d) 보완: cross-cutting 수정 시 영향 task report 삭제
- .claude/skills/repair-acceptance/SKILL.md            — D1 item 4 (d) 보완: 수리한 task report 삭제
- .claude/skills/stack-guard/SKILL.md                  — D1 item 3 E2E-applicable 판정
- docs/30-workitems/_templates/MILESTONE_TEMPLATE.md   — D1 `## 5` / D2 `## 8`
- docs/00-meta/DELEGATION_STRATEGY.md                  — D5 evaluator-optimizer 1줄
- .claude/skills/plan-milestone/SKILL.md               — D1 `## 5` 5+1 default 작성 주체 · D3 판정값 소비(로드맵 재조정)
- .claude/skills/validate-plan/SKILL.md                — D1 `[MP-graduation]` 정합 검사
- .claude/agents/reviewer.md                           — D1 `[MP-graduation]` 정합 검사
- .claude/skills/accept-milestone/SKILL.md             — D3 `PENDING_ACCEPTANCE` 소비 + D6 관계

## 참고
- ADR-007(lifecycle), ADR-009(TDD), ADR-022(Ratchet), ADR-045 D6(재발행 기준), ADR-052#amend-1(e2e 5상태 SSOT), ADR-057#amend-1(ROADMAP 파생), ADR-065(AC 검증 modality), ADR-066(수용 단계).
