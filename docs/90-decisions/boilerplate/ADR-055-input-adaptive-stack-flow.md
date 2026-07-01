# ADR-055 — 입력 적응형 bootstrap-stack 흐름 + 스택 결정 taxonomy (T1/T2/T3)

> scope: boilerplate
> area: process

## Status
accepted

> 본 ADR은 ADR-041 D1(`--recommend`)을 supersede한다(부분 대체 — ADR-041 D2 `--migrate` contract는 유지·확장). ADR-041 상태: `accepted (D1 superseded by ADR-055)`.

## 배경
- [관측됨] `/bootstrap-stack` 무플래그 기본 모드는 "스택이 이미 확정된 이후 문서화"만 하고(리서치·라운드 없음), 확정 *전* 추천은 별도 `--recommend`(ADR-041 D1)로만 가능했다 — 단발 텍스트·파일 생성 X·수렴 루프 없음. 추천을 받아도 `/bootstrap-stack <선택>`을 다시 발화해야 했고(재호출 seam), 그 사이 근거가 유실됐다.
- [관측됨] 스택 결정 생애주기(초기 선택 / 마이그레이션 / 라이브러리 추가)를 가르는 taxonomy·임계 규칙이 없어, "라이브러리 몇 개" 누적이 사실상 프레임워크 교체가 돼도 ADR-101(stack-selection)이 갱신되지 않는다(staleness).
- 기존 규약: discover-product/plan-milestone/bootstrap-design의 메인 세션 라운드 패턴(ADR-050), ADR-053 stakes 게이트, ADR-040 researcher 위임, ADR-039 migration task, ADR-052 install-ownership 3분할.

## 결정
1. **입력 적응형 기본 흐름** — `/bootstrap-stack` 무플래그 동작을 입력 적응형으로 한다. $ARGUMENTS에 해석 가능한 스택 토큰이 있거나 manifest가 이미 있으면(brownfield) BASE 문서화(ADR-101 + ARCH §7/§3-1 + charter §7 제약 + STACK_SETUP_PLAN). 비어 있거나 모호하면 discover-product 패턴의 DEEP 결정 라운드(요구 grounding+리서치 → 2~3 조합+트레이드오프+추천 수렴 → 고-stakes 심화 → 저장)를 메인 세션이 운전하고, 선택 후 같은 세션에서 산출물까지 auto-execute(재호출 seam 제거). bootstrap-stack은 `disable-model-invocation: true` 유지 — `/stack-guard`는 텍스트 제안(ADR-050 D2). charter/ARCH가 얇으면 discover-product/bootstrap-project 선행 안내(ADR-035). 리서치 미가용이면 `Needs Research`/저신뢰도 또는 BASE 폴백(날조 금지, ADR-053 ①).
2. **--recommend supersede** — ADR-041 D1의 `--recommend` 플래그를 제거한다. 그 지능(charter/ARCH 읽기·2~3 조합·ADR-006 가중)은 DEEP 라운드에 흡수되고, 라운드 진행 중 옵션·트레이드오프·추천·근거를 제시한다. D1의 "파일 생성 X"는 "선택 후 auto-execute"로 대체한다.
3. **--migrate 입력 적응형** — ADR-041 D2의 마이그레이션 contract(old/new/compat/cutover/rollback/validation/hook)는 유지한다(ADR-041 소유). 진입만 입력 적응형으로 확장: 타깃 명시 시 계약 직행, 타깃 미정 시 DEEP 라운드를 마이그레이션 프레이밍(호환성·이전 비용 트레이드오프 1급)으로 실행 후 계약. supersede 전 진행 중 task/worktree freeze·재검증 명시.
4. **T1/T2/T3 스택 결정 taxonomy + 임계** — T1 기초(bootstrap-stack → ADR-101), T2 물질적 변경(bootstrap-stack `--migrate` → supersede ADR-1NN + Type:migration), T3 라이브러리 추가(plan-workitem task `## 3` install line-item, ADR-040#amend-1, ADR-101 미변경). **T2/T3 임계 = ADR-053 S1~S4 재사용(분류 체크리스트 — 패널 트리거 아님)**: 되돌리기 비싼 토대(S1)·다중 모듈/surface(S3)·데이터·API·런타임 호환/보안/마이그레이션(S4) 해당 또는 ARCH §7 결정·charter §7 제약 뒤엎음 → T2. 전부 아니면 T3. S5만(버전 불확실)은 T3 유지(리서치로 해결). cluster로 임계 넘으면 T2 승격. **ADR-101 = living snapshot(기록 서사), dep 원장 아님**(lockfile이 SSOT) — T3는 ADR-101 미변경, 누적이 임계 넘을 때만 갱신.
5. **drift 재조정** — stabilize-milestone step 6에 report-only `[Stack-drift]` 후보(순증 dep가 T2 임계 넘으면 ADR-101 stale 후보 P2). plan-workitem 신호 #2/#5를 tier 라우팅으로 sharpen. DELEGATION mid-project 표에 T3 행 추가 + T2 명확화.

## 근거
- 확정 전 추천 자리를 무플래그 흐름에 통합(별도 플래그 제거)해 재호출 seam 제거 — discover-product 라운드 기계 재사용(새 skill·기계 없음, ADR-006). taxonomy는 ADR-053 S1을 재사용해 새 기준 없이 T2/T3 구분.

## 결과
- bootstrap-stack이 결정+문서화(입력 적응형) + --recommend 제거 + --migrate 적응형, T1/T2/T3 taxonomy가 plan-workitem/stabilize/DELEGATION에 배선.

## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT)
- .claude/skills/bootstrap-stack/SKILL.md              — D1~D4 입력 적응형 기본 + DEEP 라운드 + 적응형 --migrate + tier
- .claude/skills/plan-workitem/SKILL.md                — D5 신호 #2/#5 tier 라우팅
- .claude/skills/stabilize-milestone/SKILL.md          — D5 step 6 [Stack-drift] 감지기
- docs/00-meta/DELEGATION_STRATEGY.md                  — D5 mid-project T2/T3 행
- docs/00-meta/STRUCTURE.md                            — Canonical Owner 행

## Mutation Contract (ADR-047 D3)
1. Target — bootstrap-stack SKILL(입력 적응형+DEEP+적응형 --migrate+tier) / plan-workitem 신호 tier 라우팅 / stabilize [Stack-drift] / DELEGATION 행 / STRUCTURE Canonical Owner.
2. Failure mode — 확정 전 추천 자리 부재로 즉흥 선택 + --recommend→문서화 재호출 seam으로 근거 유실 + T2/T3 임계 부재로 ADR-101 staleness(관측됨).
3. Predicted improvement — 미결정 시 리서치+라운드 근거 선택 + 한 세션 auto-execute로 seam 제거 + tier 구분 + drift 조기 회수.
4. Preserved invariants — bootstrap-stack disable-model-invocation + stack-guard 텍스트 handoff(ADR-050 D2); §7-1~7-4 컨벤션 단발(라운드 금지, ADR-027#31); ADR-101 draft proposed+미등재 until 저장; DISCOVERY=SSOT(ADR-035); install-ownership 3분할(ADR-040#amend-1/ADR-052); ADR-041 D2 --migrate contract 유지.
5. Falsifying evaluation — 입력 적응형 라우터가 결정된 사용자를 라운드로 오라우팅 / [Stack-drift]가 사소 dep에 과발동 / brownfield를 T1 신규결정으로 오판 시 신호 재조정.
6. Rollback path — 본 ADR superseded → 무플래그=BASE 문서화 복원 + ADR-041 D1(--recommend) 복원(ADR-041 status 되돌림) + DEEP 라운드/[Stack-drift]/tier 라우팅 제거.

## Ratchet 강도 (ADR-022)
- enabling(약, [관측됨]) — 라운드·drift 감지 모두 opt-in/report-only(하드 게이트 아님). --recommend supersede는 기능 재배치(순손실 없음).

## 참고
- ADR-041(--migrate contract D2 유지 · D1 supersede), ADR-053(stakes 게이트 S1 재사용), ADR-040(researcher 위임), ADR-050(메인 세션 라운드·model-invocation 경계), ADR-035(DISCOVERY=SSOT), ADR-027(§7 컨벤션 단발), ADR-006(단순성), ADR-039(migration task), ADR-052(install-ownership).
