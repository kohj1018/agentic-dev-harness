# ADR-052 — 스택 프로비저닝(install) + E2E readiness

> scope: boilerplate

## Status
accepted

## 배경
- [관측됨] stack-guard는 검증 wiring(`validate`/`validate:e2e`)만 생성하고 *baseline toolchain·e2e 브라우저를 직접 설치하지 않는다* → 검증 실행 시 미설치 라이브러리(biome/tsc/vitest/@playwright/test)·Playwright 브라우저로 에러가 반복 발생한다(**사용자 보고 root cause**). per-task 패키지 설치(implement, ADR-040#amend-1)는 있으나 *스택 baseline provision* 게이트가 부재.
- [관측됨] E2E 명령(`validate:e2e`)은 stack-guard가 *wiring*만 분리해 두고(현행: e2e는 task finalize 제외·milestone stabilize만 실행), 실제 *provision(외부 의존 부트업) + smoke*가 readiness gate로 강제되지 않는다 → milestone graduation 직전에야 E2E 미설정/미통과가 드러난다.
- [관측됨] graduation checklist(ADR-014 #1 item 3 `E2E Pass (스택에 정의된 경우)`)의 *"정의된 경우"* 단서가 E2E 미정의 스택을 *통과*시켜, E2E가 필요한 스택에서도 readiness 없이 졸업이 가능하다.
- 기존 규약: ADR-025(외부 의존 권장 + CI 권장), ADR-040#amend-1(install authoring=plan / 실행=implement), ADR-014(graduation 5+1). 본 ADR은 stack-guard에 baseline install provision + 정합 검증 boundary를 추가하고 E2E readiness를 hard-block으로 승격한다.

## 결정

### D1. stack-guard install provision (정책 반전 — install-by-default + install-ownership boundary)
stack-guard에 **install provision 단계**를 신설한다 — 스택 확정/재실행 시 stack-guard가 *직접* 패키지 매니저 install(`pnpm install`/`npm install`/`pip install` 등)을 실행해 authored toolchain(format/lint/typecheck/test devDeps)을 provision하고, UI/web 프로젝트(ADR-027#amend-3 신호)면 `npx playwright install`로 e2e 브라우저까지 설치한다. 설치 후 manifest↔lockfile↔설치 모듈 정합을 검증한다. **이는 stack-guard *본문 정책* "기본 설치 안 함"(소유 ADR 없는 skill-body 정책)을 *의도적으로 반전*하고, ADR-025의 "강제 X 권장만"(외부 의존 부트업·CI 파일 한정) stance를 *baseline toolchain install까지 확장*한다 — ADR-025는 toolchain 설치를 소유하지 않으므로 ADR-025에 대해서는 '반전'이 아니라 '확장'이다** — 검증 시 라이브러리/브라우저 미설치로 인한 에러가 반복 관측됐기 때문(사용자 결정 Q3).
- **Graceful fallback (skip 아님 — blocker)**: 네트워크/사용자 승인/lockfile 충돌/monorepo workspace 라우팅/sandbox 정책으로 설치가 *실제 실패*하면 fabricate·우회하지 않고 `Needs Install: <명령> — 메인 세션/사용자 실행 필요`를 출력하고 가능한 산출(진입점·config·verify 스크립트)은 계속 생성한다(implement-workitem ADR-040#amend-1 패턴 동형). 즉 조용히 넘어가지 않고 *blocker*로 남긴다.
- **install-ownership boundary 명문화**: *어떤 패키지를 추가할지 결정(authoring)* = plan-workitem(ADR-040#amend-1), *task 구현 중 그 task가 추가하는 패키지를 설치(per-task 실행)* = implement-workitem/foreman(ADR-040#amend-1), ***스택 baseline toolchain·e2e tooling을 검증 전에 직접 install/provision + 정합 검증*** = stack-guard(본 D1). 셋은 충돌하지 않는다 — authoring / per-task 실행 / 스택 baseline provision의 3분할(ADR-040 패턴 계승, ADR-025 wiring 책임 확장).

### D2. E2E provision + smoke
stack-guard에 **E2E provision/smoke 단계**를 신설한다 — `validate:e2e` 명령이 의존하는 외부 리소스(DB/Redis/S3 등 — ADR-025 부트업 권장 대상)의 *provision 절차*를 STACK_SETUP_PLAN에 기록하고, e2e harness가 *최소 1개 smoke*로 wiring 검증(앱 부팅 + 1개 시나리오)을 통과하는지 점검한다. wiring 검증 목적(stack-guard 기존 smoke test 정신 계승) — 프로젝트 자체 E2E 통과 여부와 분리 보고.

### D3. E2E MUST-run hard-block (ADR-014 graduation item 3 amend)
ADR-014 graduation checklist item 3 `E2E Pass (스택에 정의된 경우)`를 **`E2E Pass (E2E-applicable 스택은 MUST, exit code 0)`**로 강화한다.
- *E2E-applicable* 판정: STACK_SETUP_PLAN에 `validate:e2e` 명령 또는 E2E provision 항목이 *존재*하면 MUST-run — 미통과 시 graduation pre-check `졸업 가능: NO` **hard-block**(기존 "정의된 경우"의 soft-pass 제거).
- *E2E-not-applicable*(`validate:e2e` 미설정 + provision 항목 없음 — 예: 순수 라이브러리/CLI 스택): 기존대로 *해당 없음=통과*. 단 stack-guard가 "E2E 미설정 — applicable 스택이면 설정 권장" 1줄 echo.
- 본 D3은 ADR-014 `## Amendment 2`로 박는다(아래 Surfaces).

### D4. repair-milestone 신규 skill
milestone graduation hard-block(D3) 미통과 + cross-stabilize 회귀 신호를 *milestone 단위로 회수·repair*하는 **`/repair-milestone [milestone-id]`** 신규 skill을 신설한다 — stabilize가 보고한 P0/P1(graduation 미충족·E2E 미통과·회귀)을 4-판정(Adopt/Adopt-modified/Reject-false-positive/Reject-context, repair-plan/repair-workitem 동형)으로 점검한다. **repair-workitem과 동형으로 코드 수정이 허용된다**(사용자 결정 Q2 — Stage 5B): 단일 task로 격리되는 결함은 `/repair-workitem T-NNN`으로 라우팅하고, *cross-cutting hotfix·E2E wiring*(여러 task에 걸리지 않는 e2e config/scaffold 등)은 직접 수정한다. **단, 자동 커밋·workitem status 변경은 하지 않는다** — commit/status 소유권은 finalize/사용자에 유지(repair-workitem 패턴 계승 — 외부 리뷰가 지적한 ownership 우려를 no-commit/no-status로 차단). 결정 이력은 IMPROVEMENT_GUIDE `## 5. Repair decision log`의 `### M-N`(`M1-repair-N`)에 기록.
- `disable-model-invocation: true` + 메인 세션 실행(fork X). `.claude` + `.agents` 양 mirror 신설.

## Mutation Contract (ADR-047 D3)
1. **Target** — `.claude/skills/stack-guard/SKILL.md`(install provision + e2e provision/smoke); `.claude/skills/stabilize-milestone/SKILL.md`(graduation pre-check item 3 hard-block); `.claude/skills/repair-milestone/SKILL.md` 신규; ADR-014 `## Amendment 2` + `## Surfaces`; ADR-025·ADR-040 boundary 참조; STRUCTURE.md roster.
2. **Failure mode** — 선언↔설치 drift가 스택 확정 시점에 미검출; E2E provision/smoke 미강제로 readiness 없이 milestone 졸업; graduation item 3 soft-pass가 E2E-applicable 스택을 무점검 통과(관측됨).
3. **Predicted improvement** — stack-guard install provision으로 누락 의존(toolchain·Playwright 브라우저) 선설치 → 검증 에러 root cause 제거 + 선언↔설치 drift 조기 검출, e2e smoke로 readiness gate 전진, graduation hard-block으로 E2E-applicable 스택 졸업 누락 0건.
4. **Preserved invariants** — stack-guard wiring/프로젝트 책임 분리(프로젝트 *실 코드 위반*은 여전히 stack-guard가 차단 안 함 — provision·wiring까지만), ADR-040#amend-1 per-task install authoring/실행(stack-guard는 *baseline provision*을 추가), stabilize 코드·커밋·status 금지(repair-milestone가 코드 수정을 담당하되 commit/status는 미수행). **단 두 정책은 의도적으로 변경: (a) stack-guard *본문 정책* "기본 설치 안 함"(소유 ADR 없음)을 본 ADR D1이 *반전* + ADR-025 "강제 X 권장만"(외부 의존·CI 한정) stance를 toolchain install로 *확장*(ADR-025는 toolchain 설치 미소유이므로 반전 아님) — stack-guard가 baseline toolchain·e2e를 직접 install(실패 시 Needs Install blocker); (b) ADR-014 item 3 soft-pass는 D3가 E2E-applicable 스택 한정 hard-block으로 강화**.
5. **Falsifying evaluation** — ADR-017 dogfood 재실행에서 E2E-applicable 판정이 *순수 라이브러리 스택을 오탐(false MUST)*해 정상 졸업을 막으면 D3 판정 기준 재검토; install provision이 sandbox/네트워크 차단(일시적)을 *영구 fail*로 오인해 정상 진행을 막으면 D1을 권장-only(Needs Install 출력만)로 되돌림.
6. **Rollback path** — 본 ADR superseded → stack-guard install provision·e2e provision/smoke 단계 제거(기존 "기본 설치 안 함" 복원), ADR-014 item 3 "정의된 경우" 복원(`## Amendment 2` 철회), repair-milestone skill 제거(양 mirror).

## 정책 강도 (ADR-022)
- D1·D2: enabling→install-by-default + 실패 시 blocker(약~중 — 설치를 *수행*하되 실패를 fabricate 않고 Needs Install로 막음, 자동 차단은 설치 실패 시에만). D4: enabling(약) — repair 라우팅 + 코드 수정(커밋·status X). D3: constraint(강) — E2E-applicable 스택에 graduation hard-block. **Evidence label**: `[관측됨]`(미설치발 검증 에러·readiness 미검출 관측) + ADR-014 [외부실증] 계승.

## 결과
- stack-guard가 baseline toolchain·e2e를 직접 install/provision(실패 시 Needs Install blocker) + 선언↔설치 정합 검증(authoring/per-task실행/baseline provision 3분할), e2e provision/smoke가 readiness gate로 전진, E2E-applicable 스택은 graduation hard-block, repair-milestone가 milestone 단위 repair(코드 수정 포함, 커밋·status X)를 담당.

## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT. ADR-045 정합 — 실제 파일 경로 1행 1개, 생략·comma-join 금지)
- .claude/skills/stack-guard/SKILL.md                             — D1 install provision + D2 e2e provision/smoke
- .claude/skills/stabilize-milestone/SKILL.md                     — D3 graduation pre-check item 3 hard-block
- .claude/skills/repair-milestone/SKILL.md                        — D4 신규 skill
- .agents/skills/repair-milestone/SKILL.md                        — D4 Codex wrapper (신규)
- .agents/skills/repair-milestone/agents/openai.yaml              — D4 Codex wrapper policy (신규)
- docs/30-workitems/_templates/MILESTONE_TEMPLATE.md              — D3 `## 5. 완료 기준` item 3 문구 강화
- docs/00-meta/STRUCTURE.md                                       — skill roster 18→20 + 생성 주체 컬럼 + Codex wrapper 인벤토리
- docs/90-decisions/boilerplate/ADR-014-milestone-graduation.md   — `## Amendment 2` + Surfaces add
- docs/90-decisions/boilerplate/ADR-025-external-deps-and-ci-recommendation.md — install/e2e boundary 참조 note
- docs/90-decisions/boilerplate/ADR-040-external-research-capability.md — install-ownership 3분할 boundary 참조 note

## 참고
- ADR-014(graduation — item 3 hard-block amend), ADR-025(외부 의존 + CI 권장 — install/e2e provision 확장), ADR-040(install authoring/실행 — stack-guard 검증 추가로 3분할), ADR-047(harness mutation + D1 Executability), ADR-050(de-fork — repair-milestone 메인 세션 정합), ADR-051(foreman/fan-out — stabilize fan-out과 정합).
