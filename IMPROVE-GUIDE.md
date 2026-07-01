# bootstrap-stack 개선 실행 가이드

이 문서만 보고 순서대로 따라가면 두 개선을 모두 완료할 수 있다.

- **개선 1 (Q1)**: `/bootstrap-stack` 기본 흐름을 **입력 적응형**으로 — 구체적 스택 입력/기존 manifest 감지 시 빠른 문서화, 무입력/모호 시 리서치+라운드로 결정까지 운전하고 한 세션에서 산출물까지 자동 작성. `--recommend` 플래그는 제거(DEEP 라운드로 흡수), `--migrate`도 입력 적응형.
- **개선 2 (Q2)**: 스택 결정 생애주기 taxonomy(T1 기초 / T2 마이그레이션 / T3 라이브러리 추가) + T2/T3 임계 규칙 + ADR-101 staleness 재조정.

## 왜 amendment가 아니라 새 ADR-055(부분 supersede)인가
`--recommend` 제거는 **ADR-041 D1을 뒤집는** 변경이다. ADR-045 D6는 "기존 결정 뒤집기·surface 5+ 추가는 amend 흡수 금지 → 신규 supersede ADR"을 요구한다. 다만 ADR-041을 *전면* supersede하면 기존 `--migrate` contract 참조(plan-workitem·TASK_TEMPLATE·ADR-039 등 6곳)가 `[Ref-dead]`가 된다. 그래서 **부분 supersede**를 쓴다 — 새 **ADR-055**가 D1(--recommend)만 supersede하고 **D2(--migrate) contract는 ADR-041에 유지·확장**한다. ADR-041은 `accepted`로 남으므로 기존 `--migrate` 참조가 살아 있다. 이 패턴은 repo에 선례가 있다(ADR-050 = "accepted (부분 superseded by 051)").

## 진행 원칙 (반드시 지킴)
- **순서 고정**: Part A(ADR) → Part B(핵심 skill) → Part C(생애주기 배선) → Part D(문서 동기) → Part E(검증). 상위 문서(ADR)를 먼저 박고 하위(skill/doc)를 맞춘다.
- **각 Part 끝에 커밋**한다. 커밋 메시지는 각 Part 하단에 영어 한 줄로 제공. `git add`는 명시 파일만(`git add -A` 금지).
- 편집 산출물 어디에도 이 가이드(IMPROVE-GUIDE.md)를 링크·참조하지 않는다.
- **불변 유지**: bootstrap-stack은 `disable-model-invocation: true` 유지 — "완료까지 자동 실행"은 *자기 산출물*을 한 세션에 쓰는 것이며 `/stack-guard`는 텍스트 제안(사용자 발화)이다. §7-1~7-4 인터페이스 컨벤션 채움은 단발(라운드 금지). ADR-101 draft는 저장 전까지 `proposed`+인덱스 미등재.
- Codex mirror(`.agents/skills/*/SKILL.md`)는 SSOT를 가리키는 thin wrapper다 — 본문을 복제하지 않는다(bootstrap-stack wrapper의 description 1줄만 갱신, 나머지 wrapper는 무변경).

---

# Part A — 새 ADR-055 (ADR-041 D1 부분 supersede) + ADR-041 status + 인덱스 + Canonical Owner

## A-1. `docs/90-decisions/boilerplate/ADR-055-input-adaptive-stack-flow.md` — 새 파일 생성

아래 내용으로 새 파일을 만든다.

```markdown
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
```

## A-2. `docs/90-decisions/boilerplate/ADR-041-stack-recommend-migrate.md` — Status 갱신

현재:
```
## Status
accepted
```
다음으로 교체:
```
## Status
accepted (D1 `--recommend` 부분 superseded by ADR-055 — 입력 적응형 DEEP 흐름으로 흡수. D2 `--migrate` contract는 유지)
```
> ADR-041 본문의 나머지(D1/D2 결정 텍스트)는 **역사 보존을 위해 그대로 둔다**(supersede 관례 — 원문 미삭제). ADR-041은 여전히 `accepted`이므로 기존 `--migrate` 참조는 유효하다.

## A-3. `docs/90-decisions/boilerplate/README.md` — 인덱스 2곳

현재(라인 37):
```
| 041 | 스택 추천 + 마이그레이션 contract | accepted | — | bootstrap-stack --recommend(확정 전 2~3조합) / --migrate(expand-contract contract ADR) |
```
다음으로 교체:
```
| 041 | 스택 추천 + 마이그레이션 contract | accepted (D1 superseded by 055) | — | --migrate(expand-contract contract ADR) 유지 / --recommend(D1)은 ADR-055 입력 적응형 DEEP 흐름으로 흡수 |
```
그리고 054 행(라인 50) 바로 **아래에 055 행을 추가**:
```
| 055 | 입력 적응형 bootstrap-stack 흐름 + 스택 결정 taxonomy(T1/T2/T3) | accepted | — | 무입력=DEEP 결정 라운드(--recommend 흡수)/구체·brownfield=문서화 + 한 세션 auto-execute + --migrate 적응형 + T2/T3 임계(ADR-053 S1)·ADR-101 living-snapshot drift |
```
> amend 방식이 아니므로 ADR-041/ADR-055 어느 쪽도 `## Amendment N`이 없고 Amendments 컬럼은 `—`다. stabilize의 amend-sync 점검은 무관.

## A-4. `docs/00-meta/STRUCTURE.md` — Canonical Owner 행 추가

현재 Canonical Owner 표의 이 행(라인 113):
```
| Stack provisioning(install) + E2E readiness | [ADR-052](../90-decisions/boilerplate/ADR-052-stack-provisioning-and-e2e-readiness.md) (정책 SSOT). → ADR-052 `## Surfaces` 참조 (fan-out SSOT). |
```
바로 **아래에 다음 행을 추가**:
```
| Stack 결정 taxonomy (T1 기초 / T2 마이그레이션 / T3 라이브러리 추가) + 입력 적응형 bootstrap-stack 흐름 | [ADR-055](../90-decisions/boilerplate/ADR-055-input-adaptive-stack-flow.md) (정책 SSOT). → ADR-055 `## Surfaces` 참조 (fan-out SSOT). |
```
> STRUCTURE.md 라인 36 skill 로스터(21종)는 **변경하지 않는다** — skill을 추가/제거하지 않는다.

**커밋 (Part A):**
```
docs(adr-055): add input-adaptive stack flow + T1/T2/T3 taxonomy, supersede ADR-041 D1
```
(파일: `docs/90-decisions/boilerplate/ADR-055-input-adaptive-stack-flow.md`, `docs/90-decisions/boilerplate/ADR-041-stack-recommend-migrate.md`, `docs/90-decisions/boilerplate/README.md`, `docs/00-meta/STRUCTURE.md`)

---

# Part B — bootstrap-stack 개편 + --recommend dead 참조 정리

## B-1. `.claude/skills/bootstrap-stack/SKILL.md` — 파일 전체를 아래 내용으로 교체

현재 파일은 "스택이 확정된 이후 문서화"만 하고 `--recommend`(단발 텍스트)·`--migrate` 섹션을 가진다. 아래 새 본문은 입력 적응형 기본 + DEEP 라운드 + 적응형 --migrate + tier 판정을 담고, 기존의 유용한 섹션(외부 의존 부트업·monorepo 라운드·디렉터리 표·고-stakes 게이트·Context 정책)을 보존한다. **파일 전체를 다음으로 교체**:

````markdown
---
name: bootstrap-stack
description: Decide or document the project stack, then author stack-specific setup. Input-adaptive — a concrete stack summary is documented directly, empty/vague input triggers deep research-and-rounds decision, --migrate handles a stack change.
argument-hint: "[stack summary → document | empty/vague → deep decision rounds | --migrate [new stack]]"
disable-model-invocation: true
allowed-tools: Read Glob Grep Write Edit Agent
context-pack: minimal
---

너의 역할은 프로젝트 스택을 *결정하거나 문서화*하고, 이 보일러플레이트에 맞게 stack-specific 초기 세팅 문서를 정리하는 것이다. 스택이 이미 정해졌으면 문서화만, 미정이면 리서치+라운드로 결정까지 운전한다. 정책 SSOT는 ADR-055(입력 적응형 흐름·taxonomy) + ADR-041 D2(--migrate contract).

이 skill은 **메인 세션에서 직접 실행**된다(discover-product/plan-milestone 패턴 — `context: fork` 미지정). 무거운 추론은 `Agent` 도구로 architect/researcher 단발 sub-call에 위임하고 결론만 문서에 반영한다. `disable-model-invocation: true` 유지 — 후속 `/stack-guard`는 텍스트 제안이며 자동 호출하지 않는다(ADR-050 D2).

## R0 — 입력·상태 감지 + 분기 (항상 먼저 수행)
1. **상태 회수(최소)**: `docs/90-decisions/project/ADR-101-stack-selection.md` 존재 여부 + 프로젝트 manifest(`package.json`/`pyproject.toml`/`go.mod`/`Cargo.toml` 등) 존재 여부.
2. **분기**:
   - **`--migrate`** → 아래 `## --migrate (T2) 흐름`.
   - **구체적 스택 감지** — $ARGUMENTS에 아래 "스택별 디폴트 디렉터리 구조" 표나 ARCH §7 sub-section으로 해석되는 프레임워크/언어/런타임 토큰이 1+ 있음, **또는** manifest가 이미 있어 스택이 물질화됨(brownfield) → **BASE 문서화 흐름**. brownfield는 스택을 새로 *결정하지 않고* manifest에서 감지해 문서화·정합한다.
   - **비어 있음/모호/불확실** — $ARGUMENTS가 비었거나, 앱 범주·목표만 있고 해석 가능한 프레임워크 토큰이 없거나("SaaS 하나", "웹앱", "백엔드"), 불확실 마커("추천", "뭐가 좋을까", "골라줘")가 있음 → **DEEP 결정 흐름**.
3. **가드**:
   - **charter/ARCH 얕음** — DEEP인데 `PROJECT_CHARTER §6/7/8/9`·`ARCH §8`이 비었으면 persona·제품 맥락을 *만들지 말고* "먼저 `/discover-product` 또는 `/bootstrap-project`" 안내 후 종료(DISCOVERY=SSOT, ADR-035).
   - **오라우팅 방지** — 프레임워크 토큰이 하나라도 있으면 BASE로 가되, 산출이 §7에 미달(예: API 필요 제품인데 백엔드 미정)이면 "추천을 원하면 스택 없이 재실행" 1줄만 echo — 몰래 라운드로 승격하지 않는다.

반드시 먼저 읽을 파일:
- `docs/00-meta/GUARDRAILS_STRATEGY.md`
- `docs/00-meta/WORKFLOW.md`
- `docs/10-charter/PROJECT_CHARTER.md`
- `docs/20-system/ARCHITECTURE_OVERVIEW.md`
- `docs/90-decisions/boilerplate/_ADR_GUIDE.md` (ADR-101 권장 섹션·area 태그·Mutation Contract 규약)
- `docs/90-decisions/project/README.md` (project ADR 인덱스 — ADR-101 추가 후 한 줄 갱신 대상)
- `stack-brief-template.md`
- `output-checklist.md`

## DEEP 결정 흐름 (R1~R4 — 무입력/모호 시)
discover-product 라운드 패턴을 재사용한다. 각 라운드는 압축 포맷으로 출력하고 자연어 응답(`skip`/`good`/`refine: …`)만 받는다:
```
이번 결정: <1~2줄>
확인 필요: <있으면 ≤3개, 없으면 생략>
답변: skip / good / refine: …
```
사용자가 *선택해야 하는* 옵션 목록(2~3 스택 조합)은 압축하지 않고 보존한다(ADR-046#d3). architect/researcher 단발 sub-call의 *과정*은 대화에 풀지 않고 결론만 surface한다. **(Codex: sub-agent 병렬 미지원 → R1 researcher·R2 architect 위임을 순차 인라인 추론으로 degrade — ADR-040#amend-3 / ADR-053 정합.)**

**R1 — 요구 grounding + 리서치.** `PROJECT_CHARTER ## 6 목표/## 7 비목표/## 8 성공 기준/## 9 제약` + `ARCH ## 8 품질 속성`(규모·성능·확장 기대)을 읽는다. 최신 프레임워크/버전 지형이 필요하면 `Agent`로 researcher에 직접 위임(ADR-040#amend-3 — bootstrap-stack은 Agent 보유). 결과는 출처·날짜·신뢰도 라벨(ADR-040 §3). **오프라인/미발견이면 날조 금지** — 조합을 `Needs Research`·저신뢰도로 표시하거나 BASE 문서화로 폴백한다.

**R2 — 옵션 + 트레이드오프 + 추천(수렴 루프).** architect 단발 sub-call로 **2~3개 스택 조합**을 서로 다른 각도(MVP/risk/scale-first)로 생성. 각 조합에 (a) 현재 복잡도 (b) 확장·마이그레이션 비용 (c) ADR-031 직접지원 5유형(web frontend/API/CLI/monorepo/Supabase) 정합 (d) 성장 경로("X로 시작 → Y로 성장") + **본 skill의 추천안 + 근거**를 함께 제시(ADR-006 단순성 가중 — 과한 스택 경고). 사용자가 `skip/good/refine`로 응답 → 피드백 시 재생성. **2사이클 미수렴 시 재생성 대신 brief를 고친다**(charter 재독·요구 명확화 — bootstrap-design R2 규칙). 선택 확정 전에는 R3로 진행하지 않는다.

**R3 — 고-stakes 심화(해당 시).** 되돌리기 비싼 §7-3 백엔드 결정(인증·DB·트랜잭션)이 ADR-053 게이트(S1~S4 중 1+)에 걸리면 아래 `## 고-stakes 설계 게이트`의 full 패널을 실행. 저-stakes는 R2 단발 결론. 스택 선택 자체는 R2에서 다뤘으므로 여기선 *별개의* 미해결 reversible 결정에만 발동(중복 발동 회피 — ADR-053 falsifying-eval의 과발동 방지).

**R4 — 저장/실행(절대 건너뛰지 않음).** 확정된 스택으로 아래 `## BASE 문서화 흐름`을 그대로 수행해 모든 산출물을 *한 세션에* 쓴다. R1~R3 근거는 ADR-101의 옵션≥2/신뢰도/재검토 칸에 적재한다.

**누적/단계별 출구:** R1~R3 동안 결론을 draft ADR-101(`## 0. Status: proposed`, **인덱스 미등재**)에 누적한다. 중간에 멈춰도 proposed ADR-101이 남아 재개·`/stack-guard` 입력으로 유효하다. R4 저장 때만 status를 accepted로 올리고 인덱스 행을 추가한다. proposed 상태·미등재를 유지해 stabilize의 §7 backstop 오탐을 막는다.

## BASE 문서화 흐름 (구체적 스택/brownfield, 또는 DEEP R4)
1. 스택 정보를 구조화한다(`stack-brief-template.md` 참조). brownfield면 manifest에서 감지.
2. 아래 문서를 갱신한다.
   - `docs/20-system/ARCHITECTURE_OVERVIEW.md` — **`## 7. 기술 선택`**(고-stakes는 §7 결정 블록: 옵션≥2/신뢰도/재검토) + 해당 **`## 7-1`~`## 7-4`** 컨벤션 + **`## 3-1` 레이어 경계·의존성 규칙에 스택별 디폴트 디렉터리 트리**(아래 표) + `## 7. 기술 선택` 하위 운영 사실(실행 명령/포트/환경변수 이름/핵심 디렉터리 역할/gotcha — `output-checklist.md`).
   - `docs/10-charter/PROJECT_CHARTER.md` **`## 7. 제약 조건`** — 허용 의존 정책 envelope(스택 핵심 라이브러리). T3 dep 판정의 기준선.
   - `docs/90-decisions/project/ADR-101-stack-selection.md` — _ADR_GUIDE 권장 섹션 + 옵션·신뢰도·재검토 칸. **`## 7-1`~`## 7-4` 인터페이스 컨벤션 채움은 architect 단발 sub-call(라운드 아님 — ADR-027#31)**. API 감지 → 7-1+7-3, CLI → 7-2, 프론트 → 7-4.
   - `docs/90-decisions/project/README.md` 인덱스 표에 ADR-101 한 줄 추가.
3. **비해당 `## 7-1`~`## 7-4` 처리 — 단일 스택은 통째 삭제, 다중 스택(monorepo)은 KEEP-list**: 프로젝트가 스택 1종이면 비해당 sub-section을 통째 삭제한다(예: API 미포함 → `## 7-1` 삭제). **FE+API+CLI 등 다중 스택이면 해당하는 sub-section을 *모두 보존*하고 각 스택의 디렉터리 트리를 `## 3-1`에 함께 박는다(삭제 금지).**
4. 필요하면 `docs/00-meta/_templates/STACK_SETUP_PLAN_TEMPLATE.md`를 복사해 `docs/00-meta/STACK_SETUP_PLAN.md` 생성(이미 있으면 갱신 제안). **Optional MCP Connectors 백필(ADR-048#d1)**: `.codex/config.toml`에 `[mcp_servers.*]`가 있으면 STACK_SETUP_PLAN `## Optional MCP Connectors` 표에 backfill 권장(자동 연결 X — 사용자 직접).
5. 프론트 스택 감지 시 마지막 출력에 "frontend 감지됨. `/bootstrap-design` 권장" 1줄.

## --migrate (T2) 흐름 — 입력 적응형
스택 *변경*. R0에서 `--migrate`로 진입. contract 규약 소유는 ADR-041 D2, 적응형 진입은 ADR-055. **입력 적응형**:
- **타깃 명시**(`--migrate Nest.js`) 또는 이미 결정 → 옵션 라운드 건너뛰고 계약 authoring 직행.
- **타깃 미정**(`--migrate` 단독 / "뭐로 갈지 모르겠다") → 위 DEEP R1~R2를 *마이그레이션 프레이밍*으로 실행(트레이드오프 축에 **기존 데이터·API 호환성**과 **이전 비용**을 1급 추가) → 타깃 수렴 후 계약.

계약(항상, ADR-041 D2): 새 project ADR `docs/90-decisions/project/ADR-1NN-<migration>.md`에 old/new stack, 호환성(데이터·API·런타임), cutover 순서(expand-contract: 신규 추가 → dual-run → 구식 제거), rollback, validation(완료 판정), hook·verify 갱신 목록을 쓰고, 기존 ADR-101을 `superseded` + 상단 "대체: ADR-1NN". project README 인덱스에 한 줄 추가 + ADR-101 행 상태 superseded 갱신. ARCH §7 결정 블록·§3-1 디렉터리 트리 갱신, charter §7 제약 갱신.
**진행 중 task/worktree 주의**: 마이그레이션은 진행 중 task의 §7 매핑·AC를 무효화할 수 있다. supersede 전에 진행 중 task를 freeze·재검증할 것을 출력에 명시하고, cutover는 `Type:migration` task(ADR-039)로 분해(`/plan-workitem`)한다.
작성 후 안내: `/bootstrap-stack <new stack>`(문서화) → `/stack-guard` 순 재실행.

## 스택 결정 tier (T1/T2/T3 — ADR-055) — 판정 기준
- **T1 기초 스택**(프로젝트 birth): 본 skill의 BASE/DEEP 흐름 → ADR-101 + ARCH §7 + charter §7 제약.
- **T2 물질적 변경/마이그레이션**: ADR-053 S1~S4 중 1+ 해당(언어/런타임/프레임워크/DB·영속성/인증/배포 토폴로지/핵심 외부 의존을 건드림 **또는** ARCH §7 결정·charter §7 제약을 뒤엎음; 개별로 사소해도 *cluster*로 이 선을 넘으면 포함) → 본 skill `--migrate`.
- **T3 라이브러리 추가**(routine): 위 어느 것도 아님 → `/plan-workitem`이 task `## 3` install line-item으로 처리(ADR-040#amend-1). ADR-101 안 건드림. 누적이 T2 선을 넘으면 stabilize의 `[Stack-drift]`가 감지.

반드시 지켜야 할 원칙:
- shared 기본값에 OS/셸 종속 hook를 강제로 넣지 않는다. 대신 필요한 scripts/hooks/CI를 문서로 정리한다.
- 확실하지 않은 환경 전제는 가정으로 표시한다. 추측을 사실처럼 쓰지 않는다.
- 통합 검증 명령(`validate`)·verify 스크립트·hook 등록 안내는 `/stack-guard`가 별도 생성한다 — 다음 단계 안내에 포함.

마지막 출력:
- 스택 선택/문서화 요약 (DEEP면 선택된 조합 + 근거)
- 갱신/생성한 문서 목록
- 추천 guardrail 목록 + 남은 불확실성
- **연결/연결 권장 MCP가 있으면**: STACK_SETUP_PLAN `## Optional MCP Connectors`에 lifecycle usage + agent access 기록 안내 1줄(ADR-048).
- 다음 권장 단계로 `/stack-guard` 안내(자동 호출 아님 — 사용자 발화). 프론트면 `/bootstrap-design`도.

## 외부 의존 부트업 권장 (감지 시 출력, ADR-025)
스택 감지 시(강제 X, 권장만):
- Postgres: `docker-compose.yml` 또는 `supabase start` 권장.
- Redis: `docker-compose.yml` 권장.
- S3: localstack 또는 MinIO 권장.

사용자가 채택 시 README에 1단락 + `make dev` / `pnpm dev` 등의 통합 진입점에 wiring. 상세는 생성될 `docs/00-meta/STACK_SETUP_PLAN.md` 참조.

## monorepo 라운드 (감지 시 자동, ADR-008#amend-1)
1. **orchestrator 결정**: turbo / nx / pnpm workspaces only / lerna 등 1종.
2. **shared 패키지 위치 + 버전 정책**: `packages/shared`, semver vs fixed.
3. **publish 정책**: 외부 publish vs internal-only.
4. **scope vocabulary**: 패키지명 목록을 ADR-008 amend의 scope 컨벤션과 정합화.
> monorepo는 위 `## BASE 문서화 흐름` 3의 다중 스택 KEEP-list를 적용한다(§7-1~7-4 삭제 금지, 패키지별 디렉터리 트리 모두 §3-1에 박음).

## 스택별 디폴트 디렉터리 구조 (권장 출력)

| 스택 | 디폴트 트리 |
|------|-----------|
| Next.js | `app/`, `components/`, `lib/`, `tests/` |
| FastAPI | `app/{api,core,domain,infra}/`, `tests/` |
| Express | `src/{routes,services,domain,infra}/`, `tests/` |
| Rust CLI | `src/{cli,core,...}/`, `tests/` |
| Go CLI | `cmd/`, `internal/{cli,core,...}/`, `tests/` |
| Python CLI | `src/<pkg>/{cli,core,...}/`, `tests/` |

ARCHITECTURE_OVERVIEW.md `## 3-1` 채움 시 함께 박음. 사용자 즉흥 결정 → 스파게티 차단.

## 고-stakes 설계 게이트 (ADR-053)
설계 결정이 ADR-053 게이트(S1~S4 중 1+ → full 패널 / S5만 → 리서치-only / 전부 NO → 단발)면: ① researcher 웹 패스(must-or-flag, 오프라인 `Needs Research`) → ② architect 다각도 2~3안 → ③(S1·S3·S4 중 2+면) 두 번째 architect 적대 검토(review-doc 미사용·parallel-merge 금지, 순차 생성→비평→종합) → ④ ARCHITECTURE §7 결정 블록 기록. 저-stakes는 단발. (Codex: 순차 단일 degrade — researcher 인라인/사전 노트.)

## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 ADR/architecture 섹션은 task 본문에서 발화 시 인용 — 사전 fork-load 금지.
````

## B-2. `.agents/skills/bootstrap-stack/SKILL.md` — description 1줄만 갱신

현재(라인 3):
```
description: Use ONLY when the user explicitly types `$bootstrap-stack <stack-and-runtime-summary>`. Do not trigger implicitly from generic phrasing.
```
다음으로 교체:
```
description: Use ONLY when the user explicitly types `$bootstrap-stack [stack summary | empty for a recommendation | --migrate]`. Do not trigger implicitly from generic phrasing.
```
> 나머지 wrapper 본문(SSOT 포인터)은 무변경.

## B-3. `.claude/skills/bootstrap-project/SKILL.md` — 제거된 --recommend 안내 정리

`--recommend`가 사라지므로 bootstrap-project의 "다음 단계" 안내에 남은 dead 참조를 고친다. 현재(라인 65):
```
  - 기본 권장: `/bootstrap-stack <스택 요약>` (또는 `--recommend` 로 추천 받기) — 스택 확정이 후속 lifecycle 의 전제 (스택 미정 상태에서 plan 은 가짜 작업).
```
다음으로 교체:
```
  - 기본 권장: `/bootstrap-stack <스택 요약>` (스택 미정이면 **무입력**으로 실행 → 리서치+라운드 추천) — 스택 확정이 후속 lifecycle 의 전제 (스택 미정 상태에서 plan 은 가짜 작업).
```

**커밋 (Part B):**
```
feat(bootstrap-stack): input-adaptive deep default with converging rounds; fold --recommend, make --migrate adaptive
```
(파일: `.claude/skills/bootstrap-stack/SKILL.md`, `.agents/skills/bootstrap-stack/SKILL.md`, `.claude/skills/bootstrap-project/SKILL.md`)

---

# Part C — 생애주기 배선 (Q2)

## C-1. `.claude/skills/plan-workitem/SKILL.md` — 신호 #2/#5 tier 라우팅

현재 `## architect 호출 권장 신호` 섹션의 목록(신호 6개)은 라인 190에서 끝난다(마지막 항목: `6. **DESIGN.md ## 7. Components 인벤토리에 *새 primitive* 추가 의심** ...`). 그 **아래에 다음 subsection을 추가**:

```markdown

### Stack-decision tier 라우팅 (ADR-055)
위 신호 #2(charter 제약 밖 새 외부 의존) 또는 #5(ARCH §7 결정 변경)가 감지되면, 그 dep/변경을 tier로 분류해 라우팅을 함께 출력한다(권장 텍스트만 — 자동 차단 X):
- **T2** — dep/변경이 ADR-053 S1~S4에 해당(언어/런타임/프레임워크/DB·영속성/인증/배포 토폴로지/핵심 외부 의존을 건드림, 또는 ARCH §7 결정·charter §7 제약을 뒤엎음): `T2: /bootstrap-stack --migrate 권장 (ADR-101 supersede)` 출력. task로 즉흥 도입하지 않는다.
- **물질적이나 비-foundational** (S1~S4 미해당이지만 근거 기록이 필요한 새 의존): 해당 task `## 0-1. Type`을 `technical-enabler`로 두고 근거를 `## 2`에 기록(ADR-039).
- **사소(T3)**: 평범한 `## 3` install line-item으로 처리(ADR-040#amend-1). ADR-101/charter §7 제약 미변경.
```

## C-2. `.claude/skills/stabilize-milestone/SKILL.md` — step 6에 [Stack-drift] 감지기

현재 step 6(라인 136~138)은 리드 라인 1줄 + sub-bullet 2개다. 마지막(`layer 경계·의존성 규칙 변경(... ## 3-1)이 ...`) bullet **아래에 같은 들여쓰기로 다음 bullet을 추가**:
```
   - **[Stack-drift] ADR-101 staleness 감지 (ADR-055, report-only)**: 본 마일스톤에서 순증한 dep(산하 task `## 3` install line-item / lockfile diff)을 T2 임계 카테고리(언어/런타임/프레임워크/DB·영속성/인증/배포 토폴로지/핵심 외부 의존, 또는 ARCH §7 결정·charter §7 제약을 뒤엎음 — 개별로 사소해도 cluster로 넘으면 포함)와 대조. 임계를 넘으면 `P2 [Stack-drift] ADR-101 stale — 누적 dep가 T2 임계 도달 → /bootstrap-stack --migrate 후보 또는 ADR-101 amend`를 IMPROVEMENT_GUIDE에 기록. 임계 미달 누적은 침묵(피로 방지 — ADR-101은 dep 원장이 아님). 휴리스틱 한계 echo(키워드/lockfile diff 기반 — false negative 가능).
```

## C-3. `docs/00-meta/DELEGATION_STRATEGY.md` — mid-project 표 갱신

현재 표(라인 117~122)에서 이 행:
```
| architecture 스택 변경 | `/bootstrap-stack` 재실행 후 `/stack-guard` 이어 실행 |
```
다음 두 행으로 교체(스택 변경 행을 T2로 명확화 + T3 행 신설):
```
| architecture 스택 변경 (T2 — 언어/런타임/프레임워크/DB/인증 등 토대 변경, ADR-055) | `/bootstrap-stack --migrate` (타깃 미정이면 DEEP 라운드로 수렴) 후 `/stack-guard` 이어 실행 |
| 라이브러리 몇 개 추가 (T3 — 토대 미변경) | `/plan-workitem`이 task `## 3` install line-item으로 처리 (ADR-040#amend-1). 누적이 T2 임계를 넘으면 stabilize `[Stack-drift]`가 ADR-101 갱신을 감지 |
```

**커밋 (Part C):**
```
feat(lifecycle): wire T2/T3 stack-decision threshold and ADR-101 drift detection into plan-workitem, stabilize, delegation
```
(파일: `.claude/skills/plan-workitem/SKILL.md`, `.claude/skills/stabilize-milestone/SKILL.md`, `docs/00-meta/DELEGATION_STRATEGY.md`)

---

# Part D — 문서 동기 (사용자-facing)

> 아래 파일들은 example/prose이며 ADR-055 Surfaces에 등재하지 않는다(정책 back-ref 불필요). skill 로스터(자연어 호출 목록)는 변경하지 않는다 — bootstrap-stack은 그대로 존재. **코드펜스는 실제 파일대로 ` ```text `를 유지한다.**

## D-1. `README.md` (라인 65~74)

라인 67 `Once your stack is decided:` 문장과 그 아래 코드블록·설명을 다음과 같이 바꾼다. `### Step 2: Set Up Stack` 헤더는 유지.

현재:
````
Once your stack is decided:

```text
/bootstrap-stack [stack/runtime description]
/stack-guard
```

`/bootstrap-stack` documents stack choices and outlines needed automation.
````
교체:
````
`/bootstrap-stack` is input-adaptive. If you already know your stack, pass it and it is documented directly. If you are undecided, run it with no (or vague) input and it researches options, presents 2-3 combinations with tradeoffs and a recommendation over rounds, and — once you choose — authors everything in one session:

```text
/bootstrap-stack [stack/runtime description]   # decided → document
/bootstrap-stack                               # undecided → deep decision rounds
/bootstrap-stack --migrate [new stack]         # stack change (rounds if target undecided)
/stack-guard
```

`/bootstrap-stack` decides (research + rounds when undecided) or documents stack choices and outlines needed automation.
````
> "현재" 블록(`Once your stack is decided:` 부터 `... documents stack choices and outlines needed automation.` 까지)만 매칭해 "교체" 내용으로 바꾼다. 실제 파일에서 그 뒤로 이어지는 `Then run /stack-guard ...` 문장은 그대로 둔다. 안쪽 ` ```text ` 는 실제 파일의 코드펜스다.

## D-2. `README_ko.md` (라인 64~73)

라인 66 `스택이 정해지면:` 문장과 그 아래 코드블록·설명을 함께 바꾼다(라인 66을 안 고치면 새 "입력 적응형" 설명과 모순).

현재:
````
스택이 정해지면:

```text
/bootstrap-stack [스택/런타임 설명]
/stack-guard
```

`/bootstrap-stack`은 스택 선택을 문서화하고 필요한 자동화 방향을 정리한다.
````
교체:
````
`/bootstrap-stack`은 입력 적응형이다. 스택이 정해졌으면 입력을 문서화하고, 미정이면 무입력(또는 모호한 입력)으로 실행해 리서치로 옵션을 조사한 뒤 2~3개 조합을 트레이드오프·추천과 함께 라운드로 제시하고, 선택되면 한 세션에서 산출물까지 작성한다:

```text
/bootstrap-stack [스택/런타임 설명]        # 이미 정함 → 문서화
/bootstrap-stack                          # 미정 → 심층 결정 라운드
/bootstrap-stack --migrate [새 스택]       # 스택 변경 (타깃 미정이면 라운드)
/stack-guard
```

`/bootstrap-stack`은 결정(미정 시 리서치+라운드) 또는 문서화를 수행하고 필요한 자동화 방향을 정리한다.
````
> "현재" 블록만 매칭해 교체한다. 실제 파일에서 뒤로 이어지는 `STACK_SETUP_PLAN.md를 검토한 뒤 ...` 문장은 그대로 둔다. 안쪽 ` ```text ` 는 실제 파일의 코드펜스다.

## D-3. `docs/00-meta/PROJECT_START_CHECKLIST.md`

(문자열 앵커로 편집 — 라인 번호에 의존하지 말 것.)

(a) `## 2. 운영 결정 (스택 확정)` 헤더 줄(파일에서 이 문자열을 찾음) 바로 **아래에 안내 한 줄을 추가**:
```
> 스택이 아직 미정이면 이 절을 건너뛰고 `/bootstrap-stack`을 *무입력*으로 실행해 리서치+라운드로 결정할 수 있다(입력 적응형). 이미 정했으면 아래를 채운 뒤 `[스택 설명]`을 넘긴다.
```

(b) `- [ ] 스택이 정해진 뒤 `/bootstrap-stack [스택 설명]`을 실행했다` 문자열(`## 3. guardrail 추가` 절 안)을 찾아 다음으로 교체:
```
- [ ] `/bootstrap-stack`을 실행했다 — 스택이 정해졌으면 `[스택 설명]`을 넘겨 문서화, 미정이면 무입력으로 심층 결정 라운드
```

**커밋 (Part D):**
```
docs: update README and start checklist for input-adaptive bootstrap-stack
```
(파일: `README.md`, `README_ko.md`, `docs/00-meta/PROJECT_START_CHECKLIST.md`)

---

# Part E — 최종 검증 (커밋 후)

아래를 눈으로/명령으로 확인한다. 하나라도 어긋나면 해당 Part로 돌아가 수정.

1. **ADR 상태 정합**: `ADR-055-input-adaptive-stack-flow.md`가 존재하고 `## Surfaces`(5 파일) + `## Mutation Contract`(6필드)를 가짐. `ADR-041` `## Status`가 `accepted (D1 ... superseded by ADR-055 ...)`. `boilerplate/README.md`에 055 행 존재 + 041 행 status 갱신. (amend 방식 아님 → `## Amendment` / amend-sync 없음.)
2. **Surfaces back-ref**(ADR-055 `## Surfaces` 5개 파일이 모두 본문에 `ADR-055` 문자열을 가짐):
   - `grep -rl "ADR-055" .claude/skills/bootstrap-stack/SKILL.md .claude/skills/plan-workitem/SKILL.md .claude/skills/stabilize-milestone/SKILL.md docs/00-meta/DELEGATION_STRATEGY.md docs/00-meta/STRUCTURE.md` 가 **5개 파일 모두** 출력.
3. **ADR-041 참조 무-회귀**: ADR-041이 여전히 `accepted`이므로 기존 `--migrate` 참조는 유효 — `[Ref-dead]` 없음. plan-workitem:66 참조는 **손대지 않는다**(plan-workitem 파일 자체는 C-1에서 *다른 위치*에 tier 라우팅만 추가). `docs/30-workitems/_templates/TASK_TEMPLATE.md`·`ADR-039`·`ADR-040`의 `ADR-041` 참조는 **아예 편집하지 않는다**.
4. **`--recommend` 잔재**: `grep -rn "\-\-recommend" . --include=*.md` 에 IMPROVE-GUIDE.md 자신을 제외하면(`--exclude=IMPROVE-GUIDE.md`) `--recommend`는 *정책/역사 문맥*에만 남아야 한다 — ADR-041(제목·D1 본문)·ADR-055(D1 supersede 서술)·ADR-040(결정 텍스트)·`boilerplate/README.md`(041 인덱스 행). `bootstrap-stack`·`bootstrap-project`·`README.md`·`README_ko.md`·`PROJECT_START_CHECKLIST.md`에 `--recommend`가 grep되면 **회귀**.
5. **로스터 불변**: `STRUCTURE.md` 라인 36 skill 21종, `README.md`/`README_ko.md` 자연어 호출 목록에 bootstrap-stack 그대로(개수 변화 없음).
6. **불변 확인**: `bootstrap-stack/SKILL.md` frontmatter에 `disable-model-invocation: true` 유지 + `Agent`가 `allowed-tools`에 있음. 라운드는 스택 *선택* 한정, §7-1~7-4 컨벤션은 단발.
7. **Codex wrapper**: `.agents/skills/bootstrap-stack/SKILL.md`는 여전히 SSOT 포인터 + description만 갱신, 본문 복제 없음.

전부 통과하면 개선 완료. 이 가이드 파일(IMPROVE-GUIDE.md)은 추적되지 않는 임시 파일이므로 **그냥 삭제**한다(`git rm` 아님 — untracked라 실패):
```
rm IMPROVE-GUIDE.md
```
