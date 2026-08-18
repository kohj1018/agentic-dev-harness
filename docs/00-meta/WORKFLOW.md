# 워크플로우

> 모드: Reference + How-to (워크플로우 정의 + 단계별 절차)

## 1. 범위 정의
- `docs/10-charter/PROJECT_CHARTER.md`에서 문제, 목표, 비목표, 제약을 정리한다.

## 2. 시스템 설계
- `docs/20-system/ARCHITECTURE_OVERVIEW.md`에서 시스템 구조를 정리한다.
- `docs/20-system/DESIGN.md`는 baseline placeholder(presence: conditional). UI 프로젝트는 `/bootstrap-design`이 본 파일을 채우고, 비-UI 프로젝트는 fork 직후 본 파일을 삭제한다. **삭제 시 `AGENTS.md`의 `[시각 디자인](docs/20-system/DESIGN.md)` 링크 줄도 함께 제거한다**(dangling 방지).
- UI 프로젝트의 `/bootstrap-design` 라운드 구조는 ADR-058(design workflow): R0(evidence-on-demand 리서치 + `DESIGN_RESEARCH.md`) → R1(원칙 + voice 기본값 확인 — ADR-056) → **R2(DESIGN.md 작성 *전* 다중 concept 시안 REFINE/EXPLORE — 실카피 렌더 + 수용 게이트(320·populated axe·repair loop), 사용자가 시각 방향 선택)** → R3(토큰)·R4(컴포넌트) → R5(DESIGN.md 저장) → R6(DESIGN.md 파생 preview 최종 확인 + 게이트). **사용자가 R2 concept 방향을 선택하고 R6 preview를 승인한 뒤** concept/preview 시안을 삭제하고 `/plan-milestone`으로 진행 권장한다(M/F가 아직 없으면 — ADR-057; `contract-ready` M에 task 0건/`draft`가 있으면 `/plan-workitem M<N>` → `/seal-milestone M<N>`(ADR-060); 이미 구현 중이면 해당 task workflow 또는 다음 M). DESIGN.md *내용*·인터페이스 할당 SSOT는 ADR-027.
- ARCH `## 7-1`/`## 7-2`/`## 7-3`/`## 7-4` / `## 7-5` 의 채움/삭제/cross-reference 정책은 [ADR-027](../90-decisions/boilerplate/ADR-027-interface-decision-allocation.md) (ADR-027#amend-1 포함) SSOT.

## 3. 작업 단위 분해
- 마일스톤·feature 문서는 첫 마일스톤(M1)부터 `/plan-milestone`이 만든다(ADR-057 — bootstrap-project는 charter/architecture까지).
- `/plan-milestone`은 `docs/30-workitems/ROADMAP.md`의 **`Done`/`Now`/`Next`/`Later` 네 구간을 단독으로 유지한다**(`## Backlog`는 append-only 다중 writer — `/accept-milestone`·`/repair-acceptance`가 행을 추가하고 본 skill이 정리·승격·재분류 등재를 한다, ADR-057#amend-4) — **R3에서 현재(Now) 행 + 미래 후보(Next/Later) 기록(candidate-key 포함), R0에서 회고 `graduation:` 기반으로 Done/Now 재조정**(직전 Now 행의 Done 전환은 **R0가 담당** — R3는 강제하지 않음; candidate-key는 전 구간 보존) (ADR-057#amend-1). 예정(Next/Later) 행은 "목표 1줄 + 확신도"만 둔다.
- 마일스톤 단위 목표를 `docs/30-workitems/milestones`에 만든다.
- 기능 단위 문서를 `docs/30-workitems/features`에 만든다.
- 실제 구현 단위 문서를 `docs/30-workitems/tasks`에 만든다.
- task 분해는 `/plan-workitem M<N>` 1회 **전체 계획 스냅샷**으로 전 feature를 함께 확정한다(ADR-057#amend-3). task는 전부 `draft`로 남으며, **`/seal-milestone M<N>`이 최종 검사 + 사용자 승인 후 task→feature→milestone을 일괄 `ready`로 봉인**한다(ADR-060 D7). 봉인 전에는 `/implement-workitem`이 착수하지 않는다.
- **선택**: `/plan-workitem` 직후 plan 품질 cross-validate가 필요하면, 다른 세션·다른 LLM에서 `/validate-plan <workitem-id>` 1+ 회 → 원본 세션에서 `/repair-plan <workitem-id>`로 회수 (ADR-038). opt-in — 건너뛰어도 정상.
- (UI 마일스톤) `/plan-milestone` R5 프로토타입 라운드가 화면 경험 계약(승인 프로토타입 — `docs/20-system/prototypes/M<N>/`)을 확정한 뒤 task 분해로 진행한다. UI 확정 feature는 승인 프로토타입(또는 면제 기록) 없이 `/plan-workitem` 분해가 차단된다 (ADR-056).

## 3-1. 마일스톤 봉인 (seal)
- `/seal-milestone M<N>`이 최종 검사(계획 완결성·AC 해석 확정·커버리지·의존성·결정 원장·가설·리뷰 증거)와 사용자 최종 승인을 거쳐 task→feature→milestone을 일괄 `ready`로 전환한다.
- **내용 수정·커밋을 하지 않는다** — 쓰는 것은 상태값 · `## 10` 봉인 기록 · (사용자가 그 자리에서 고른 경우) task `## 8`의 `해석 확정:` 한 줄뿐이다. 실패 시 어떤 상태도 바꾸지 않고 소유 skill로 반환한다. 중단 시 재실행이 부분 승격 상태를 재개 진입으로 인식하고, 구현 전 계획을 고친 뒤의 재실행은 재봉인 진입으로 받는다.
- 봉인 시점에 **현재 마일스톤에 영향을 주는 `open` 결정이 0건**이어야 한다 — 이것이 "개발 중 기획이 애매하지 않게" 만드는 지점이다.
- 봉인 후 새로 드러난 결정은 원장에 기록하되 **착수를 막지 않고** 기존 finding 라우팅(repair / 사용자 보고 / 다음 M)을 탄다 (ADR-060 D11).

## 4. 구현 및 검증
- 구현은 `/implement-workitem`으로 시작한다.
- 검증은 `/validate-workitem`으로 수행한다 — 판정 + `docs/40-validation/reports/<task-id>.md` 기록.
> Note: validation report(`docs/40-validation/reports/<task-id>.md`)는 `.gitignore`된 **checkout-local 임시 파일**이다(커밋되지 않음). 따라서 `/validate-workitem`과 `/finalize-workitem`은 **같은 worktree/checkout**에서 연속 실행해야 한다 — 다른 worktree에서 나눠 실행하면 finalize가 report를 못 찾아 `Needs Validation`으로 종료한다.
> **졸업 판정은 report를 읽지 않는다** — `/finalize-workitem`이 task `## 8`에 남긴 `- closure` 줄(커밋됨)이 입력이다(ADR-068 D2). 새 체크아웃·다른 worktree에서도 재validate 없이 `/stabilize-milestone`만 실행하면 된다.
- 검증 실패 시 `/repair-workitem`으로 report의 실패 항목을 수정한다.
- **산하 task가 전부 `done`이 되면 그 마일스톤은 «마일스톤 층»이다** — 이후 task 문서·task status·validation report는 불변이며(**예외는 `## 8`의 AC receipt 2종** — `- ac-acceptance`·`- invalidated`), 네 inner-loop skill을 호출하지 않는다(ADR-068 D1). 수리는 `/repair-milestone`·`/repair-acceptance`가 직접 수행한다.
- 판정이 `Pass` **또는 `Pending Acceptance`**면 `/finalize-workitem`으로 status `done` 갱신 + 커밋(ADR-065 D6 — 관측 AC receipt 미발급은 마감을 막지 않고 `## 8`에 `- ac-pending`을 남긴다).
- 마일스톤 단위 종합 점검은 `/stabilize-milestone`에서 수행한다.
- 누적 QA 결과는 `docs/40-validation/QA_FINDINGS.md`에 기록한다.
- 개선 제안은 `docs/40-validation/IMPROVEMENT_GUIDE.md`에 정리한다.
- task `## 4-1. 변경 예정 파일/경로`는 implement 중 채운다 — plan 단계에서 미리 채울 의무 없음.

## 4-A. 문서 선갱신 예외

AGENTS.md의 *"상위 문서 없이 하위 문서를 먼저 만들지 않는다"* 규칙은 다음 케이스에서 면제한다.

1. 보안 hotfix
2. 단순 typo / 오타 수정
3. 명시적으로 비목표(charter `## 5`)에 박힌 영역의 긴급 패치

면제 적용 시 해당 task 문서 `## 8. 메모`에 *"상위 문서 후행 갱신 필요 (WORKFLOW 4-A 면제) — <어떤 상위 문서>"* 를 기록한다. `/finalize-workitem`이 이 task 문서를 커밋에 포함하므로 기록이 영속되고, `/stabilize-milestone`이 회수한다. 기존 task 약속의 누락이면 그 task repair, cross-cutting이면 repair-milestone, 새 범위면 사용자 보고 후 다음 M 후보로 연결한다.

## 4-1. 마감 (finalize)
- `/finalize-workitem`이 task 문서 status를 `done`으로 갱신한다.
- 명시적 파일 add — `git add -A` / `git add .` 금지.
- 커밋 메시지는 Conventional Commits 스타일(ADR-008).
- `/finalize-workitem`은 **task ID 1개**만 받는다(여러 ID를 받던 이전 형태는 파싱 규칙 부재로 무관 task를 처리한 사례가 관측돼 철회). 여러 task를 함께 마감해야 하면 각각 순차로 finalize한다.

## 5. 마일스톤 안정화
- `/stabilize-milestone [milestone-id]`으로 통합 점검을 수행한다.
- E2E + 회귀 + 리팩토링 후보 + ADR 후보 점검.
- **코드 수정·커밋·status 변경 금지** — 결과는 `QA_FINDINGS.md`와 `IMPROVEMENT_GUIDE.md`에 누적 기록.
- **index-first recall (ADR-019 정합)**: 누적된 `QA_FINDINGS.md`·`IMPROVEMENT_GUIDE.md`를 회수할 때는 통째로 읽지 말고 *상태·심각도 색인*(open·P0/P1)으로 먼저 걸러 해당 항목만 읽는다. **마일스톤 헤더로만 자르지 않는다** — 이전 마일스톤에서 넘어온 미해결 P0(carry-over)를 놓치기 때문.
- 후속 작업이 필요하면 `/repair-milestone <M>`으로 연결한다. **task 재개방·새 task 자동 추가는 하지 않는다** (ADR-068 D1 / ADR-057#amend-3 결정 6).
- **선택 (opt-in, ADR-054)**: stabilize 후 다른 세션·다른 LLM에서 `/validate-milestone <M> --reviewer-tag <tag>`(읽기 전용)로 2nd opinion → 원본 세션에서 `/repair-milestone <M>`이 peer 리뷰를 종합. 건너뛰어도 정상.

다운스트림 마이그레이션: 이미 평면 양식의 QA 데이터를 가진 프로젝트는 (1) 기존 항목을 `## M1` 또는 `## 일반` 묶음으로 감싸고 (2) 다음 회차부터 새 마일스톤 헤더로 누적한다.

## 5-1. 사용자 수용 (ADR-066)
- `/accept-milestone <M>`으로 사람이 직접 실행·확인한다. **마일스톤 단위 하나뿐이다 — task 스코프는 없다.** 환경을 띄우고 확인할 시나리오를 안내하고 피드백을 3갈래(결함=QA_FINDINGS / 계약 변경=ROADMAP `## Backlog` / 개선=IMPROVEMENT_GUIDE)로 라우팅한다.
- **관측 modality AC가 0건인 마일스톤에서만 «권장(선택)»이다.** task `## 6-1`에서 AC를 `[사용자 관측]`·`[플랫폼 관측]`으로 지정했으면 그 receipt 없이 졸업 item 4를 충족하지 못하므로(ADR-065 D1 / ADR-068 D3) 사실상 필수 경로가 된다.
- **관측 AC는 task 마감을 막지 않는다** — 그 AC만 미충족이면 `/validate-workitem` 판정은 `Pending Acceptance`이고(ADR-065 D6) `/finalize-workitem`이 통과시켜 task를 `done`으로 마감하며 `## 8`에 `- ac-pending`을 남긴다. 차단은 사라지지 않고 **마일스톤 졸업**으로 옮겨간다 — 그 상태의 graduation이 `PENDING_ACCEPTANCE`다(ADR-068 D4).
  - **판정값 소유권**: `/validate-workitem`의 report 판정은 `Pass | Pending Acceptance | Needs Fix` 셋이다(ADR-065 D6). `/finalize-workitem`은 그 값을 읽어 분기할 뿐 관측 AC 전용 종료값을 따로 두지 않는다.
- **receipt 발급만으로는 재validate가 필요 없다** — 졸업 item 4가 채점표가 아니라 task `## 8`을 직접 읽는다(ADR-068 D3). **코드가 바뀌어도 per-task 재validate를 하지 않는다** — 수용 라운드의 수리는 이미 마일스톤 층이므로, 검증은 `/repair-acceptance` 5-V의 넷(회귀 테스트 Green·교차 task `## 6-1` 매핑 실행·경계 smoke·`validate --changed`)과 다음 `/stabilize-milestone`의 통합 validate·e2e가 담당한다(ADR-068 D6).
- 결함이 있으면 `/repair-acceptance <M>`이 3+1 판정으로 수리한다. 판별 질문은 «이 변경 줄을 기존 계약(AC·`## 3` line item·FAC·INV·승인 프로토타입·DESIGN)으로 거꾸로 추적할 수 있는가»이며, **그 답은 라우팅이 아니라 결정 이력의 `scope: in-AC | out-of-AC` 분류값**이다(ADR-066#amend-1). **어느 쪽이든 그 skill이 직접 고치고 task를 재개방하지 않는다** — `out-of-AC`면 계약 부채를 `IMPROVEMENT_GUIDE.md` `## 4. 보류 항목`에 `status: open`으로 등재한다. **사용자가 손으로 돌릴 `/validate-workitem`·`/finalize-workitem`은 없다.**
- **판정이 `미완`이면**(환경 기동 실패·사용자 중단으로 필수 시나리오를 다 확인하지 못함) 환경 복구 또는 사용자 재개 후 `/accept-milestone <M>`을 재실행한다 — **라운드 카운터를 소모하지 않는다**. 판정 3종의 후속은 `/accept-milestone` 출력이 SSOT다.
- 라운드 상한 3회. 초과분은 사용자 확인 후 다음 마일스톤으로 이관한다.

## 6. 의사결정 기록
- 중요한 기술적 선택은 `docs/90-decisions`에 ADR로 남긴다. **작성 주체·시점은 [DELEGATION_STRATEGY의 ADR 작성 트리거 표](DELEGATION_STRATEGY.md)(정책 SSOT: ADR-000#amend-2)를 따른다.**

## 기본 원칙
- 상위 문서 없이 하위 문서만 먼저 만들지 않는다.
- 흩어진 메모보다 정해진 위치의 문서를 갱신한다.
- 애매한 사항은 **그 단계에서 닫는다**. 지금 닫을 수 없으면 `docs/10-charter/DECISION_REGISTER.md`에 등재하고, 현재 마일스톤 무영향 근거·이관 앵커·회수 시점 3개를 갖춘 `deferred`로 전환한다. **앵커 없는 유예는 허용하지 않는다** (ADR-060 D1/D4).
- 작업을 완료(done)로 전환하기 전에 최소한 다음을 확인한다:
    - 구현 범위가 관련 workitem 문서와 일치한다
    - 관련 검증 항목(테스트 포인트, 검증 방법)이 통과했다
    - 필요한 경우 관련 문서가 함께 갱신되었다

## 문서 운영 방식

| 유형 | 예시 | 운영 방식 |
|------|------|-----------|
| Living Doc | Charter, Architecture, UI Design, Workflow | 현재 기준으로 계속 갱신한다. 과거 버전은 Git 이력으로 확인한다. |
| Record | ADR, QA Findings | 기록 보존 우선. 기존 항목을 덮어쓰지 않고 추가 또는 대체한다. |

- ADR은 기존 결정을 뒤집을 때 새 ADR로 대체하는 것을 기본으로 한다.
- QA Findings는 회차 또는 날짜 기준으로 누적 기록한다.
- Improvement Guide는 Living Doc이지만, 완료된 항목은 삭제하지 않고 상태를 갱신한다.

## 워크아이템 라이프사이클

```
discover → bootstrap → plan-milestone(+UI: 프로토타입 라운드) → [M/F = contract-ready]
   → plan-workitem (task 전부 draft)
   → (opt-in, ADR-038) validate-plan (별 세션) → repair-plan (원본 세션)
   → seal-milestone (검사 + 사용자 승인 + task→feature→milestone 일괄 ready)   ← 리뷰 유무와 무관하게 항상 거친다
   → implement → validate ─┬─Pass──────────────→ finalize (## 8에 closure 기록) → 다음 task
                           ├─Pending Acceptance→ finalize (## 8에 closure + ac-pending)
                           └─Needs Fix─────────→ repair → (validate 재실행)
   ── 산하 전 task done ⇒ 여기부터 «마일스톤 층». task 문서·status·report 불변 (예외: ## 8의 AC receipt 2종 — ADR-068 D1) ──
   → stabilize(+UI: 경험 게이트)
(opt-in, ADR-054) stabilize → validate-milestone (별 세션) → repair-milestone (원본 세션)
(ADR-066) stabilize ─┬─YES──────────────────→ 졸업 → plan-milestone (다음 M)
                     ├─PENDING_ACCEPTANCE──→ accept-milestone <M> ─┬─승인─→ stabilize 재실행 → 졸업
                     │                                             ├─보류─→ repair-acceptance (직접 수정 — 재개방 없음) → accept-milestone 재실행
                     ├─NO──────────────────→ repair-milestone (직접 수정 — 재개방 없음) → stabilize 재실행
                     └─BLOCKED─────────────→ 감사 미완: 그 축 재감사 / e2e blocked-on-env: 환경 복구 (repair 대상 아님 — ADR-068 D4) → stabilize 재실행
```

각 단계의 정의와 책임 경계는 [ADR-007-workitem-lifecycle.md](../90-decisions/boilerplate/ADR-007-workitem-lifecycle.md)가 SSOT다.
스킬 간 흐름은 기본적으로 **텍스트 제안 → 사용자/메인이 발화**한다. 단 task 실행 inner-loop(implement/validate/repair/finalize-workitem)는 model-invocable이라 메인 세션이 직접 호출할 수 있다 (ADR-050).

## 스킬 종료 시 "다음 단계" 출력 contract

각 lifecycle skill 의 마지막 출력은 사용자가 *복사·붙여넣기* 로 후속 skill 을 즉시 발화할 수 있도록 다음 양식을 따른다. ADR-046#d1 "다음 액션 1개 (분기 시 ≤3)" 의 구체화. (lifecycle skill 의 실행 컨텍스트 — fork vs 메인 세션 — 분포는 ADR-050 참조.)

```
다음 단계:
- 기본 권장: `/<next-skill> <args>` — <이 명령을 실행할 1줄 이유>
- 분기 옵션 (해당 시 — ≤3 개):
  - <조건 A> 시: `/<alt-skill> <args>`
  - <조건 B> 시: `/<alt-skill> <args>`
- 프롬프트 동봉 권장 (다음 skill 호출 시 자연어로 함께 전달할 컨텍스트 — 해당 시):
  - <미결정 / 해석안 / 선택 옵션 / 이번 회차 의 미해결 finding 등>
```

본 contract 의 **목적**: 사용자가 매번 *어느 skill 을 어떤 인자로 호출하고, 무엇을 함께 전달해야 하는지* 를 다시 계산하지 않도록 — skill 출력 자체가 후속 발화 template 을 제공.

**자동 호출 정책 (ADR-050)**: bootstrap/plan/stabilize 및 cross-session 리뷰 skill은 텍스트 제안만 — 사용자/메인이 명시 발화. task 실행 inner-loop(implement/validate/repair/finalize-workitem)는 model-invocable이라 메인 세션이 제안을 직접 실행할 수 있다 (ADR-007 책임 경계 / ADR-046 signal-first / ADR-050).

## 문서 상태 전이

```
M / F  : draft → contract-ready → ready          (ready 부여는 /seal-milestone 단독 — ADR-060 D6/D7)
task   : draft → ready → in-progress → done      (ready 부여는 /seal-milestone 단독)
                              ↓↑
                           blocked
done → in-progress (검증된 완료 결함 — **폐쇄 전 task 층에서만.** repair-workitem 단독 writer. ADR-068 D1)
done → deprecated (필요 시)
```

| 전이 | 최소 조건 |
|------|-----------|
| (M/F) draft → contract-ready | plan-milestone 라운드 완료 + 확정 재대조 통과 + 원장의 이 M 영향 및 `(미할당)` `open` 0건. **잠금 아님** — task 분해 중 계약 수정 가능 |
| (M/F/task) → ready | `/seal-milestone`이 봉인 조건 전부 통과 + 사용자 명시 승인. **M/F 계약 층은 이 시점부터 잠긴다.** task 층의 실질 기준선은 *첫 구현 시작*이다 — 구현 흔적(`in-progress`·`blocked`·`done`·`deprecated`)이 0건인 동안에는 `/repair-plan`이 task·매핑·의존성을 고칠 수 있고, 고친 뒤 `/seal-milestone` 재실행(재봉인)으로 receipt를 갱신한다 (ADR-060 D6/D7) |
| ready → in-progress | 실제 구현/작업이 시작됐다 |
| in-progress → blocked | 외부 의존성이나 미결 질문으로 진행 불가 |
| blocked → in-progress | 블로킹 원인이 해소됐다 |
| in-progress → done | 완료 기준을 충족했다 |
| done → in-progress | 검증된 완료 결함 — `/repair-workitem`이 4-판정에서 Adopt/Adopt-modified 시에만 재개방(writer: repair-workitem 한정). **산하 task가 전부 `done`인 마일스톤에서는 불가**(ADR-068 D1이 ADR-057#amend-3 결정 5를 부분 supersede) |
| done → deprecated | 대체되었거나 더 이상 유효하지 않다 |

> 산하 전 task가 `done`이 되면 그 마일스톤은 «마일스톤 층»이고 위 역전이가 닫힌다 — 그 뒤의 결함은 `/repair-milestone`·`/repair-acceptance`가 재개방 없이 직접 고친다 (ADR-068 D1).

이 규칙은 가이드 수준이며, 훅이나 스크립트로 강제하지 않는다.

## 문서 충돌 해결

문서 간 내용이 모순될 때:
1. 상위 문서가 하위 문서보다 권위가 높다 (charter > architecture > workitems).
2. 상위가 맞다면 하위를 수정하고, 상위가 outdated라면 상위를 먼저 갱신한 뒤 하위를 맞춘다.
3. 의도적 범위/기술 변경이라면 ADR을 남긴다.

## 7. 프로젝트별 자동화 추가
- 프로젝트의 OS/셸/런타임/프레임워크가 정해진 뒤 guardrail을 설계한다.
- shared 보일러플레이트는 구조와 원칙만 제공한다.
- 실제 scripts/hooks/CI는 프로젝트 상황에 맞게 생성한다.
- 관련 원칙은 docs/00-meta/GUARDRAILS_STRATEGY.md를 따른다.

## Mid-project 문서 갱신 동선

charter/architecture/스택 관련 mid-project 갱신 경로는 [DELEGATION_STRATEGY.md — Mid-project 문서 갱신 동선](DELEGATION_STRATEGY.md#delegation-midproject)을 참조한다. 정본의 절 단위 부분 개정은 `/amend-ssot`가 담당한다 (ADR-069).

## 단계별 에이전트 위임

각 단계에서의 에이전트 선택과 위임 조건은 [DELEGATION_STRATEGY.md](DELEGATION_STRATEGY.md)를 참조한다.

메인 세션 오케스트레이션(foreman·fan-out·wave 제거) 정책은 [ADR-051](../90-decisions/boilerplate/ADR-051-main-session-orchestration-and-wave-removal.md) 참조.
