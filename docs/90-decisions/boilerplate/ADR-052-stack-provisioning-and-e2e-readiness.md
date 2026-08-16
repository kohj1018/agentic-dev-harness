# ADR-052 — 스택 프로비저닝(install) + E2E readiness

> scope: boilerplate

## Status
accepted

## 현재 유효 결정
- D3의 **0-spec 예외는 Amendment 1로 철회**됐다 — 졸업 시점에는 `No tests found`류를 통과로 처리하지 않는다. 본문 D3의 "단 0-spec 예외" 단서는 historical이다.
- e2e 판정은 **종료코드가 아니라 구조화된 러너 출력**으로 하며 상태는 `NOT_APPLICABLE`/`EMPTY`/`PASS`/`FAIL`/`BLOCKED_ENV` 5종이다(Amendment 1). `EMPTY`는 프로비저닝 단계에서 허용, 졸업 시점에는 차단.
- D1(install provision)·D2(provision/smoke)·D4(repair-milestone) 결정은 그대로 유효하다.
> **부분 supersede (2026-08-17)**: D4의 *"단일 task로 격리되는 결함은 `/repair-workitem T-NNN`으로 라우팅"* 은 [ADR-068](ADR-068-milestone-closure-and-graduation-v3.md) D1이 부분 supersede한다 — **마일스톤 층(산하 전 task done) 이후에는 라우팅 없이 `/repair-milestone`이 직접 고친다.** D4의 나머지(코드 수정 허용 · 자동 커밋·status 변경 금지 · `## 5` 결정 이력)는 유효하다. 본 표기는 개정(amend)이 아니라 참조 갱신이다.

## 배경
- [관측됨] stack-guard는 검증 wiring(`validate`/`validate:e2e`)만 생성하고 *baseline toolchain·e2e 브라우저를 직접 설치하지 않는다* → 검증 실행 시 미설치 라이브러리(biome/tsc/vitest/@playwright/test)·Playwright 브라우저로 에러가 반복 발생한다(**사용자 보고 root cause**). per-task 패키지 설치(implement, ADR-040#amend-1)는 있으나 *스택 baseline provision* 게이트가 부재.
- [관측됨] E2E 명령(`validate:e2e`)은 stack-guard가 *wiring*만 분리해 두고(현행: e2e는 task finalize 제외·milestone stabilize만 실행), 실제 *provision(외부 의존 부트업) + smoke*가 readiness gate로 강제되지 않는다 → milestone graduation 직전에야 E2E 미설정/미통과가 드러난다.
- [관측됨] graduation checklist(ADR-014 #1 item 3 `E2E Pass (스택에 정의된 경우)`)의 *"정의된 경우"* 단서가 E2E 미정의 스택을 *통과*시켜, E2E가 필요한 스택에서도 readiness 없이 졸업이 가능하다. (현재 SSOT: ADR-068)
- 기존 규약: ADR-025(외부 의존 권장 + CI 권장), ADR-040#amend-1(install authoring=plan / 실행=implement), ADR-014(graduation 5+1). 본 ADR은 stack-guard에 baseline install provision + 정합 검증 boundary를 추가하고 E2E readiness를 hard-block으로 승격한다. (현재 SSOT: ADR-068)

## 결정

### D1. stack-guard install provision (정책 반전 — install-by-default + install-ownership boundary)
stack-guard에 **install provision 단계**를 신설한다 — 스택 확정/재실행 시 stack-guard가 *직접* 패키지 매니저 install(`pnpm install`/`npm install`/`pip install` 등)을 실행해 authored toolchain(format/lint/typecheck/test devDeps)을 provision하고, UI/web 프로젝트(ADR-027#amend-3 신호)면 `npx playwright install`로 e2e 브라우저까지 설치한다. 설치 후 manifest↔lockfile↔설치 모듈 정합을 검증한다. **이는 stack-guard *본문 정책* "기본 설치 안 함"(소유 ADR 없는 skill-body 정책)을 *의도적으로 반전*하고, ADR-025의 "강제 X 권장만"(외부 의존 부트업·CI 파일 한정) stance를 *baseline toolchain install까지 확장*한다 — ADR-025는 toolchain 설치를 소유하지 않으므로 ADR-025에 대해서는 '반전'이 아니라 '확장'이다** — 검증 시 라이브러리/브라우저 미설치로 인한 에러가 반복 관측됐기 때문(사용자 결정).
- **Graceful fallback (skip 아님 — blocker)**: 네트워크/사용자 승인/lockfile 충돌/monorepo workspace 라우팅/sandbox 정책으로 설치가 *실제 실패*하면 fabricate·우회하지 않고 `Needs Install: <명령> — 메인 세션/사용자 실행 필요`를 출력하고 가능한 산출(진입점·config·verify 스크립트)은 계속 생성한다(implement-workitem ADR-040#amend-1 패턴 동형). 즉 조용히 넘어가지 않고 *blocker*로 남긴다.
- **install-ownership boundary 명문화**: *어떤 패키지를 추가할지 결정(authoring)* = plan-workitem(ADR-040#amend-1), *task 구현 중 그 task가 추가하는 패키지를 설치(per-task 실행)* = implement-workitem/foreman(ADR-040#amend-1), ***스택 baseline toolchain·e2e tooling을 검증 전에 직접 install/provision + 정합 검증*** = stack-guard(본 D1). 셋은 충돌하지 않는다 — authoring / per-task 실행 / 스택 baseline provision의 3분할(ADR-040 패턴 계승, ADR-025 wiring 책임 확장).

### D2. E2E provision + smoke
stack-guard에 **E2E provision/smoke 단계**를 신설한다 — `validate:e2e` 명령이 의존하는 외부 리소스(DB/Redis/S3 등 — ADR-025 부트업 권장 대상)의 *provision 절차*를 STACK_SETUP_PLAN에 기록하고, e2e harness가 *최소 1개 smoke*로 wiring 검증(앱 부팅 + 1개 시나리오)을 통과하는지 점검한다. wiring 검증 목적(stack-guard 기존 smoke test 정신 계승) — 프로젝트 자체 E2E 통과 여부와 분리 보고.

### D3. E2E MUST-run hard-block (ADR-014 graduation item 3 amend) (현재 SSOT: ADR-068)
ADR-014 graduation checklist item 3 `E2E Pass (스택에 정의된 경우)`를 **`E2E Pass (E2E-applicable 스택은 MUST, exit code 0)`**로 강화한다. (현재 SSOT: ADR-068)
- *E2E-applicable* 판정 (stabilize §1.5·MILESTONE_TEMPLATE item 3 정합): **UI 프로젝트(ADR-027#amend-3 다중신호 판정) ∨ graduation item 6이 e2e를 명시 선언**이면 필요 → MUST-run (applicable 스택의 `validate:e2e`+provision은 stack-guard D1/D2가 선설치) — 미통과 시 graduation pre-check `졸업 가능: NO` **hard-block**(기존 "정의된 경우"의 soft-pass 제거). **단 0-spec 예외**: 미통과가 `No tests found`(0 spec — scaffold 직후 e2e 미작성)이면 real failure 아님 → PASS-with-warning(coverage P1 권장), hard-block 아님(spec 이 실행돼 실패한 경우만 차단 — stabilize §1.5/3-b 정합).
- *E2E-not-applicable*(비-UI ∧ item 6 e2e 미선언 — 예: 순수 라이브러리/CLI 스택): *해당 없음=통과*. 단 stack-guard가 "E2E 미설정 — applicable 스택이면 설정 권장" 1줄 echo.
- 본 D3은 ADR-014 `## Amendment 2`로 박는다(아래 Surfaces). (현재 SSOT: ADR-068)

### D4. repair-milestone 신규 skill
milestone graduation hard-block(D3) 미통과 + cross-stabilize 회귀 신호를 *milestone 단위로 회수·repair*하는 **`/repair-milestone [milestone-id]`** 신규 skill을 신설한다 — stabilize가 보고한 P0/P1(graduation 미충족·E2E 미통과·회귀)을 4-판정(Adopt/Adopt-modified/Reject-false-positive/Reject-context, repair-plan/repair-workitem 동형)으로 점검한다. **repair-workitem과 동형으로 코드 수정이 허용된다**(사용자 결정): 단일 task로 격리되는 결함은 `/repair-workitem T-NNN`으로 라우팅하고, *cross-cutting hotfix·E2E wiring*(여러 task에 걸리지 않는 e2e config/scaffold 등)은 직접 수정한다. **단, 자동 커밋·workitem status 변경은 하지 않는다** — commit/status 소유권은 finalize/사용자에 유지(repair-workitem 패턴 계승 — 외부 리뷰가 지적한 ownership 우려를 no-commit/no-status로 차단). 결정 이력은 IMPROVEMENT_GUIDE `## 5. Repair decision log`의 `### M-N`(`M1-repair-N`)에 기록.
- `disable-model-invocation: true` + 메인 세션 실행(fork X). `.claude` + `.agents` 양 mirror 신설.

## Mutation Contract (ADR-047 D3)
1. **Target** — `.claude/skills/stack-guard/SKILL.md`(install provision + e2e provision/smoke); `.claude/skills/stabilize-milestone/SKILL.md`(graduation pre-check item 3 hard-block); `.claude/skills/repair-milestone/SKILL.md` 신규; ADR-014 `## Amendment 2` + `## Surfaces`; ADR-025·ADR-040 boundary 참조; STRUCTURE.md roster. (현재 SSOT: ADR-068)
2. **Failure mode** — 선언↔설치 drift가 스택 확정 시점에 미검출; E2E provision/smoke 미강제로 readiness 없이 milestone 졸업; graduation item 3 soft-pass가 E2E-applicable 스택을 무점검 통과(관측됨).
3. **Predicted improvement** — stack-guard install provision으로 누락 의존(toolchain·Playwright 브라우저) 선설치 → 검증 에러 root cause 제거 + 선언↔설치 drift 조기 검출, e2e smoke로 readiness gate 전진, graduation hard-block으로 E2E-applicable 스택 졸업 누락 0건.
4. **Preserved invariants** — stack-guard wiring/프로젝트 책임 분리(프로젝트 *실 코드 위반*은 여전히 stack-guard가 차단 안 함 — provision·wiring까지만), ADR-040#amend-1 per-task install authoring/실행(stack-guard는 *baseline provision*을 추가), stabilize 코드·커밋·status 금지(repair-milestone가 코드 수정을 담당하되 commit/status는 미수행). **단 두 정책은 의도적으로 변경: (a) stack-guard *본문 정책* "기본 설치 안 함"(소유 ADR 없음)을 본 ADR D1이 *반전* + ADR-025 "강제 X 권장만"(외부 의존·CI 한정) stance를 toolchain install로 *확장*(ADR-025는 toolchain 설치 미소유이므로 반전 아님) — stack-guard가 baseline toolchain·e2e를 직접 install(실패 시 Needs Install blocker); (b) ADR-014 item 3 soft-pass는 D3가 E2E-applicable 스택 한정 hard-block으로 강화**. (현재 SSOT: ADR-068)
5. **Falsifying evaluation** — ADR-017 dogfood 재실행에서 E2E-applicable 판정이 *순수 라이브러리 스택을 오탐(false MUST)*해 정상 졸업을 막으면 D3 판정 기준 재검토; install provision이 sandbox/네트워크 차단(일시적)을 *영구 fail*로 오인해 정상 진행을 막으면 D1을 권장-only(Needs Install 출력만)로 되돌림.
6. **Rollback path** — 본 ADR superseded → stack-guard install provision·e2e provision/smoke 단계 제거(기존 "기본 설치 안 함" 복원), ADR-014 item 3 "정의된 경우" 복원(`## Amendment 2` 철회), repair-milestone skill 제거(양 mirror). (현재 SSOT: ADR-068)

## 정책 강도 (ADR-022)
- D1·D2: enabling→install-by-default + 실패 시 blocker(약~중 — 설치를 *수행*하되 실패를 fabricate 않고 Needs Install로 막음, 자동 차단은 설치 실패 시에만). D4: enabling(약) — repair 라우팅 + 코드 수정(커밋·status X). D3: constraint(강) — E2E-applicable 스택에 graduation hard-block. **Evidence label**: `[관측됨]`(미설치발 검증 에러·readiness 미검출 관측) + ADR-014 [외부실증] 계승. (현재 SSOT: ADR-068)

## 결과
- stack-guard가 baseline toolchain·e2e를 직접 install/provision(실패 시 Needs Install blocker) + 선언↔설치 정합 검증(authoring/per-task실행/baseline provision 3분할), e2e provision/smoke가 readiness gate로 전진, E2E-applicable 스택은 graduation hard-block, repair-milestone가 milestone 단위 repair(코드 수정 포함, 커밋·status X)를 담당.

## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT. ADR-045 정합 — 실제 파일 경로 1행 1개, 생략·comma-join 금지)
- .claude/skills/stack-guard/SKILL.md                             — D1 install provision + D2 e2e provision/smoke, #amend-1 5상태 판정
- .claude/skills/stabilize-milestone/SKILL.md                     — D3 graduation pre-check item 3 hard-block, #amend-1 5상태 판정
- .claude/skills/repair-milestone/SKILL.md                        — D4 신규 skill
- .agents/skills/repair-milestone/                                — D4 Codex wrapper 디렉터리 (SKILL.md + agents/openai.yaml; 신규)
- docs/30-workitems/_templates/MILESTONE_TEMPLATE.md              — D3 `## 5. 완료 기준` item 3 문구 강화, #amend-1 5상태 판정
- docs/00-meta/_templates/STACK_SETUP_PLAN_TEMPLATE.md          — #amend-1 `## E2E Smoke Registry`
- docs/00-meta/STRUCTURE.md                                       — skill roster 18→20 + 생성 주체 컬럼 + Codex wrapper 인벤토리
- docs/90-decisions/boilerplate/ADR-014-milestone-graduation.md   — `## Amendment 2` + Surfaces add (현재 SSOT: ADR-068)
- docs/90-decisions/boilerplate/ADR-025-external-deps-and-ci-recommendation.md — install/e2e boundary 참조 note
- docs/90-decisions/boilerplate/ADR-040-external-research-capability.md — install-ownership 3분할 boundary 참조 note

## 참고
- ADR-014(graduation — item 3 hard-block amend), ADR-025(외부 의존 + CI 권장 — install/e2e provision 확장), ADR-040(install authoring/실행 — stack-guard 검증 추가로 3분할), ADR-047(harness mutation + D1 Executability), ADR-050(de-fork — repair-milestone 메인 세션 정합), ADR-051(foreman/fan-out — stabilize fan-out과 정합). (현재 SSOT: ADR-068)

<a id="adr-052-amend-1"></a>
## Amendment 1 (2026-07-28) — 0-spec 판정 정합화 (D2 우선, 문자열 매칭 폐기)

### 배경
- [관측됨] 본 ADR의 D2("최소 1개 smoke 통과")와 D3의 "0-spec 예외"(PASS-with-warning)가 **같은 ADR 안에서 충돌**한다. 현재 구현은 D3를 따르므로 e2e 0건인 UI 마일스톤이 졸업한다.
- [관측됨] 0-spec 판정이 `"No tests found"` **출력 문자열 매칭**에 의존한다. 스택마다 문구가 달라(예: Flutter는 다른 메시지) 정상 상태를 real failure로, 또는 그 반대로 오분류한다.
- [관측됨] 실측에서 e2e 대상 디렉터리가 *비어 있을 때* 러너가 **다른 디렉터리의 유닛 테스트를 대신 실행하고 exit 0**을 내는 경우가 확인됐다. 종료코드만으로는 "e2e가 실제로 돌았는가"를 알 수 없다.

### 결정
1. **D2 우선**: E2E-applicable 마일스톤은 **실제 실행된 e2e 테스트가 1개 이상 성공**해야 졸업한다. D3의 "0-spec = PASS-with-warning"은 **졸업 시점에는 적용하지 않는다**.
2. **단계별 5상태 분류**로 대체한다.

   | 상태 | 정의 | 처리 |
   |---|---|---|
   | `NOT_APPLICABLE` | E2E 대상 아님(비-UI ∧ graduation item 6 미선언) | 통과 |
   | `EMPTY` | 대상이지만 실행된 e2e 테스트 0개 | **stack-guard 프로비저닝 단계에서는 허용**(scaffold 직후 정상) / **졸업 시점에는 차단** — `Needs E2E Smoke` |
   | `PASS` | 선언된 e2e 경로 하위에서 1개 이상이 실제 실행·성공 | 통과 |
   | `FAIL` | 실행된 테스트가 실패, 또는 wiring 실패 | 졸업 차단. **하위 라벨 `FAIL(wiring)`/`FAIL(project)`를 구분해 기록한다** — 프로비저닝 단계에서 처리 주체가 다르기 때문이다(wiring은 stack-guard 산출물 수정, project는 프로젝트 책무로 분리 보고). 졸업 시점에는 둘 다 차단이라 구분이 판정을 바꾸지 않는다 |
   | `BLOCKED_ENV` | device/toolchain/provision 불가 | 졸업 차단(환경 복구 안내, real failure와 라벨 구분) |

3. **판정 근거는 구조화된 러너 출력**을 쓴다. 출력 문자열 매칭은 **보조 fallback**으로만 허용하고 졸업 판정의 1차 근거로 삼지 않는다. `PASS`의 필요조건은 넷이다.
   - 실행된 테스트가 러너 내부/로딩 항목이 아닐 것
   - skip이 아닐 것
   - **그 테스트가 속한 suite의 경로가 선언된 e2e 디렉터리 하위일 것** — 이 항이 위 세 번째 관측(빈 디렉터리 → 다른 디렉터리 실행 → exit 0)을 막는 지점이다
   - 러너 전체 종료 상태가 성공일 것

   여기서 **"선언된 e2e 디렉터리"는 `validate:e2e` 진입점이 실제로 대상으로 삼는 디렉터리**다(Playwright면 config의 `testDir`, Flutter면 `flutter test <디렉터리>`의 인자). 진입점에서 읽어 내며 별도 선언 자리를 새로 만들지 않는다. 진입점이 디렉터리를 특정하지 않으면 그 사실 자체가 `FAIL(wiring)`이다 — 무엇이 e2e인지 모르는 상태로는 위 판정이 성립하지 않는다.

   **판정 순서 — 아래 순서로 보고 먼저 성립하는 상태로 확정한다. 이 순서가 5상태의 상호배타를 보장하는 지점이므로, 소비 surface는 순서를 재정의하지 않고 그대로 적용한다.** 순서를 뒤집으면 기동 불가나 테스트 실패를 "테스트 없음"으로 오분류해 처방이 틀어진다(작성 vs 환경 복구 vs 수정).
   1. **러너가 기동조차 못 함** — 진입점·config 부재면 `FAIL(wiring)`, device·브라우저·대상 앱 미기동 등 환경 원인이면 `BLOCKED_ENV`.
   2. **선언된 e2e 디렉터리 하위 suite에서 실행된 테스트가 0개** → `EMPTY`. 러너 내부/로딩 항목과 skip은 실행으로 세지 않으며, **성공·실패는 구분하지 않는다**(실패한 테스트도 "실행됨"이다).
   3. **실행된 테스트는 있으나 위 필요조건을 못 채움** — 테스트 실패 / 러너 전체 종료 상태 실패 / 등록이 있는데 이름 일치 성공 테스트 없음 → `FAIL(project)`.
   4. 넷 모두 충족 → `PASS`.
4. **canonical smoke 등록은 판정을 *좁히는* 수단이다(필요조건 아님)**: `STACK_SETUP_PLAN.md`에 e2e smoke의 파일 경로·테스트 이름·실행 대상 선택 규칙·마지막 PASS 기록을 **선언된 runtime target별로 한 행씩** 적는다. 등록이 있으면 3항을 *"등록된 이름과 일치하는 테스트가 성공"* 으로 좁혀 판정하고, **등록이 없으면 이름 제약 없이 3항만 적용하고 `P1 [E2E-registry] <target> — canonical smoke 미등록` 을 기록**한다. 등록 부재 자체로 졸업을 차단하지 않는다 — 실제로 e2e를 갖고 통과하던 프로젝트를 서류 미비로 막는 것은 ADR-022 ratchet 위반이며, 3항만으로 관측된 결함은 이미 차단된다. target이 둘 이상이면 판정도 target마다 따로 나며, 한 target의 `PASS`가 다른 target을 대신하지 않는다.

### 강도 (ADR-022)
- constraint(강) — `[관측됨]`. E2E-applicable 마일스톤의 `EMPTY` 졸업 차단.
- **기존 프로젝트 무회귀 확인**: 본 amendment는 *"e2e가 있고 통과하던 프로젝트"* 의 판정을 바꾸지 않는다. 바뀌는 것은 *"e2e가 실행되지 않았는데 통과로 보고되던 경우"* 뿐이다. registry를 필요조건으로 두지 않은 이유가 이것이다.

> **amend 근거 (ADR-045#d6)**: 본 amendment는 D3의 0-spec 예외를 철회하므로 D6 표상 *"기존 결정 뒤집기"* = 신규 ADR supersede 대상에 해당한다. 그런데 뒤집는 대상이 **D3 안의 예외 단서 하나**이고 본 ADR의 나머지 결정(D1 install provision·D2 provision/smoke·D4 repair-milestone)은 그대로 유효하므로, ADR 전체를 `superseded`로 만들면 살아 있는 결정 셋의 인용 21개 파일을 함께 재지정해야 한다. 비용이 이득을 넘어 **최소 churn을 택해 amendment로 처리**한다(상단 `## 현재 유효 결정`이 net 규칙을 요약해 본문 D3만 읽고 오해할 위험을 제거한다). 이 예외를 넘어 D2·D3의 구조를 다시 손대야 할 다음 변경이 오면 그때는 통합 재발행을 우선 검토한다.

### 적용 surface
- .claude/skills/stack-guard/SKILL.md — 프로비저닝 단계 5상태 판정 + canonical smoke 등록
- .claude/skills/stabilize-milestone/SKILL.md — §1.5 item 3, §3-b 5상태 판정
- docs/30-workitems/_templates/MILESTONE_TEMPLATE.md — `## 5` item 3 문구
- docs/90-decisions/boilerplate/ADR-014-milestone-graduation.md — Amendment 4 (현재 SSOT: ADR-068)
- docs/00-meta/_templates/STACK_SETUP_PLAN_TEMPLATE.md — `## E2E Smoke Registry` 절
