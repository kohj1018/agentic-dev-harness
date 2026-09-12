# ADR-075 — 메인 세션 오케스트레이션 v2 (fan-out 크기 판정 실측 재보정)

> scope: boilerplate
> area: tooling/process

## Status
accepted

> 대체: [ADR-051](ADR-051-main-session-orchestration-and-wave-removal.md)을 통합 재발행으로 supersede한다(#amend-4 거버넌스 주 이행 — "다음 변경 시 통합 재발행"). ADR-051은 `superseded`로 history 잔존. 본 ADR은 ADR-051 base(D1~D8) + amend-1~4의 net 규칙에 **fan-out 크기 판정 실측 재보정(D11)** + **축 5 spawn 신호 재보정(D12)**을 더한 것이다. 모델·추론 강도·턴 예산은 [ADR-074](ADR-074-model-effort-and-turn-budget-policy.md)가 소유한다.

## 대체
- [ADR-050](ADR-050-main-session-lifecycle-skills.md) D1 중 implement-workitem 부분을 **supersede** — implement-workitem은 fork builder 격리가 아니라 *foreman(메인 세션 오케스트레이터)*이 builder 위임을 운전한다.
- [ADR-038](ADR-038-cross-llm-plan-validation.md) `## 결정` #d3(parallel waves echo) + #d6(wave별 worktree 병렬 권장)을 **supersede** — plan-workitem은 wave 그룹을 계산·echo하지 않는다. 병렬성은 validate/stabilize *fan-out*으로 이전.

## 현재 유효 결정
- implement는 foreman(메인 세션)이 운전 — `## 3` step 파일 경로로 file-disjoint slice를 나눠 병렬 builder, 작거나 겹치면 단일/순차(D1). slice 크기 기준(산출물 4개 초과 시 분할)은 [ADR-074](ADR-074-model-effort-and-turn-budget-policy.md) D9-2를 인용한다.
- validate/stabilize는 report-only fan-out(D2). **inline vs fan-out은 dispatch 전 F(변경 파일 수)·L_impl(테스트·문서 집합 제외 변경 줄)로 기계 계산** — inline 허용은 (L_impl ≤ 50) 또는 (F ≤ 2 이고 L_impl ≤ 200), UI/Arch-iface/MCP/spec-coverage 중 둘 이상 명백히 해당없음이 함께일 때만. 하나라도 미충족이면 fan-out 필수(재량 0)(D11 — Round 11 실측으로 재보정).
- 축 5(UI Design inventory)는 「UI 프로젝트」가 아니라 「diff에 UI surface 파일이 1개 이상」일 때만 spawn한다(D12).
- plan de-fork + plan-milestone(M1 포함) 신설, ADR-038 wave(#d3/#d6)·write_set 5필드 제거(D3·D4·D5).
- 하청이 구조화 반환 없이 멈추면 foreman/dispatcher가 1회 재개 → 실패 시 결과 직접 회수 — **「이미 쓴 파일 목록」은 하청이 아니라 호출자가 워킹트리를 읽어 만든다**(ADR-074 D10 — 상한 중단은 마무리 턴 없이 잘려 하청이 목록을 낼 기회가 없다)(D13).

## 배경
- [관측됨] ADR-051은 base 결정 8개 + amendment 4개가 쌓여 net 규칙을 한 번에 읽기 어렵다. #amend-4가 스스로 "다음 변경 시 통합 재발행"을 예고했다.
- [관측됨] implement-workitem이 `context: fork` + `agent: builder`로 돌면 메인 세션이 구현 흐름을 *직접 운전*하지 못한다 — RGR 사이클 중 사용자 권한 응답·재해석 결정이 fork 경계에 막힌다.
- [관측됨] plan-workitem이 출력하는 wave 그룹은 *derived view*인데 사용자가 이를 따라 `claude --worktree`로 병렬 implement를 시도하면 (a) uncommitted plan 문서 미가시, (b) lockfile/빌드캐시 race, (c) worktree 수동 cleanup 부담이 반복 관측됐다.
- [관측됨] #amend-4의 fan-out 크기 판정(L≤50 또는 F≤2·L≤200)은 테스트 파일을 포함한 총 줄 수 L을 썼는데, 테스트 파일이 구현 파일과 거의 같은 분량으로 붙는 구조(Round 11 실측)에서 L을 부풀려 판정이 왜곡된다. Round 13 재측정(dogfood-web, 2026-09-13): T-001 F=6·L_impl=38·L_test=51·L_docs=15(테스트·문서를 빼면 50 이하 — inline 후보 가설이 성립. **다만 과거 판정의 원인이 바뀌는 것은 아니다** — Round 11 당시 기준은 총 `L=91`·`F=6`이라 크기 조건만으로도 fan-out이 필수였다. 새 기준에서 크기 관문을 통과한다는 뜻일 뿐이고 실제 inline 여부는 UI·Arch-iface 등 나머지 조건이 함께 정한다), T-003 F=5·L_impl=74·L_test=62·L_docs=16(구현 줄만으로도 50 초과·F=5>2 — fan-out 필수 가설이 그대로 성립). 두 사례 모두 가설과 어긋나지 않아 **테스트·문서를 뺀 L_impl 기준으로 임계를 유지**한다(D11).
- [관측됨] 축 5(UI Design inventory) 신호가 "UI 프로젝트" 여부로만 spawn 판정을 해 Round 11 T-003(`.tsx` 0개 diff)에서도 spawn됐다(발견 16) — diff 자체에 UI surface 파일이 있는지로 좁힌다(D12).

## 결정

### D1. implement-workitem을 foreman 오케스트레이션으로 전환 (ADR-050 D1 implement 부분 supersede + #d6, slice 크기 기준은 ADR-074 D9-2 인용)
implement-workitem에서 `context: fork`(및 `agent: builder`)를 제거하고 **메인 세션 foreman**이 실행한다. foreman은 task를 1회 읽어 `## 3. 구현 항목`의 step 파일 경로로 *충돌 없는(file-disjoint) slice*를 싸게 나눈 뒤(`## 9. 의존성`은 자연어 *선행 순서*만), 각 slice를 `Agent`로 **builder에 위임**한다 — **파일 경계가 분리되면 여러 builder를 병렬로, 작거나(파일 ≤~2-3개·RGR 1회)·파일이 겹치면 단일 builder로** 운전한다. slice 크기 상한(산출물 4개 초과 시 분할)은 [ADR-074](ADR-074-model-effort-and-turn-budget-policy.md) D9-2가 소유하며 본 D1은 그 값을 인용해 foreman 분할에 적용한다. 각 builder는 자기 slice의 AC에 대해 RGR을 돌리고, foreman이 결과·`## 4-1`을 *단일 writer*로 병합한다.
- foreman은 task 재해석(`Needs Plan Decision`)·권한 응답·`Needs Install`/`Needs Research` 분기를 메인 세션에서 직접 처리한다.
- **Codex: 서브에이전트는 GA이나 본 저장소가 Claude persona 위임을 Codex subagent로 아직 매핑하지 않아 순차 단일 실행으로 degrade** — builder `Agent` 위임을 *메인 세션 인라인 단일 실행*으로 대체한다(ADR-010 정합, 행동 동일·격리만 없음).

### D2. validate/stabilize 병렬 fan-out (ADR-038 병렬성 위치 재배치)
병렬성은 plan-time wave가 아니라 *report-only 단계의 fan-out*으로 제공한다:
- validate-workitem: 단일 workitem 검증을 **audit axis별**(AC↔검증 / diff-trace / FAC↔AC spec / Arch-iface 7-x / UI Design-inventory / Evidence Bundle)로 **병렬 fan-out** — 각 validator는 *partial verdict만 반환*하고 **메인이 단일 report(`reports/<task-id>.md`)를 작성**(clobber 방지).
- stabilize-milestone: qa·reviewer(code/design surface) 위임을 **병렬 fan-out**.
- 두 단계 모두 report/판정 산출물이라 동시 실행이 git index race·빌드캐시 충돌을 일으키지 않는다.
- **Codex 순차 degrade**: fan-out 대상 task/verifier를 순차로 1개씩 처리(판정 결과 동일, wall-clock만 길어짐).

### D3. plan-workitem de-fork (ADR-050 D1 패턴 확장)
plan-workitem에서 `context: fork`(및 `agent:`)를 제거해 메인 세션 인라인 실행한다 — planning은 사용자와의 상호작용(sizing·해석 확정·의존성 결정)이 잦아 fork 격리 이득보다 운전권 손실이 크다. 무거운 아키텍처 추론은 architect `Agent` 위임 유지. `disable-model-invocation`은 **유지**(plan-workitem은 텍스트 제안 + 사용자 명시 발화 규약).

### D4. plan-milestone (M1 포함 전 마일스톤 생성 — ADR-051#amend-3 승계)
milestone 단위 분해를 plan-workitem에서 분리한 **`/plan-milestone [milestone idea | feature idea]`**가 milestone → feature 분해 + graduation 기준(ADR-068 5+1) authoring을 책임진다. [ADR-057](ADR-057-planning-v2-batch-and-seam.md) 결정 1로 범위가 확장돼 **M2+가 아니라 M1 포함 전 마일스톤**을 생성하고, bootstrap-project의 M1/F-001 seed는 제거됐다. plan-workitem의 feature→task 집중은 ADR-057#amend-3의 `/plan-workitem M<N>` 전체 계획 스냅샷으로 대체된다. `disable-model-invocation: true` + 메인 세션 실행(fork X) + architect `Agent` 위임.

### D5. wave echo + worktree 병렬 권장 제거 (ADR-038 #d3·#d6 supersede)
plan-workitem은 더 이상 `## 9. 의존성`을 위상정렬한 wave 그룹을 echo하지 않으며, `claude --worktree` 병렬 implement 권장도 출력하지 않는다. `## 9. 의존성` 5필드(`depends_on`/`read_set`/`write_set`/`assumptions`/`verifier`)는 wave 전용 스키마라 **전부 삭제**한다 — foreman의 file-disjoint 분할은 `## 3` step 파일 경로로 결정(write_set 불필요). 남는 것은 plain 자연어 의존성 선언뿐. `.gitignore`의 `.claude/worktrees/` 패턴은 잔존 무해라 삭제하지 않는다.

### D6. ADR-047 D9 re-anchor (foreman `## 3` step-path partition)
ADR-047 D9(Optimized Workflow Topology + Shared State)의 적용 SSOT를 *plan-workitem wave 계산*에서 **foreman의 intra-task partition**으로 재anchor한다 — foreman이 한 task를 `## 3. 구현 항목`의 step 파일 경로로 나눠 *file-disjoint slice는 병렬 builder, 겹치거나 작으면 단일/순차*로 운전한다. TASK_TEMPLATE `## 9` 5필드 구조화 스키마와 ADR-038#amend-3 write_set wave 분리 메커니즘은 wave 전용이라 함께 폐지한다.

### D7. NO-merge 결정 (기록)
**병렬 작업 결과의 자동 코드 merge를 본 보일러플레이트가 제공·전제하지 않는다** — validate/stabilize fan-out은 *독립 report-only 산출물*이라 merge할 shared write 산물이 없다. implement foreman의 병렬 builder는 **file-disjoint slice에만** 띄우므로 같은 파일을 동시에 쓰지 않는다 → 코드 merge 자체가 발생하지 않고, foreman은 `## 4-1` 파일목록(메타데이터)만 단일 writer로 병합한다.

### D8. 조건부 re-read (ADR-019 amend)
foreman/fan-out 도입으로 메인 세션이 inner-loop를 여러 라운드 운전하면, 매 라운드 전체 task/feature 문서를 재로딩하면 컨텍스트 낭비다. ADR-019 minimal/JIT 정책을 *조건부 re-read*로 좁힌다 — **직전 라운드에서 이미 로드한 문서는 mtime/판정 변경 신호가 있을 때만 재읽기**(예: repair 후 task `## 8. 메모` 갱신, validate report 신규 생성). 변경 신호 없으면 in-context 버전 재사용.

### D9. 공유 런타임 리소스 partition 가드 (#amend-1 승계)
foreman partition(D6 `## 3` 경로 분할)에 *공유 런타임 리소스* 트리거를 더한다: 두 slice의 테스트가 격리 없이 공유 DB·고정 포트·로컬 Supabase 스택·단일 dev server·공유 빌드/codegen 캐시를 동시에 건드리면 file-disjoint라도 순차/단일. 격리 보장 시 병렬 유지(soft — hard-block 아님). foreman은 dispatch *전*에 두 신호로 판단한다 — (a) `STACK_SETUP_PLAN.md`의 "테스트 격리 미설정" 표식, (b) 두 slice의 `## 3`가 동일 공유 리소스 지목. builder는 자기 slice의 공유-리소스 의존을 "남은 리스크"로 보고한다.

### D10. orchestration 관측 기록 (#amend-2 승계)
validate-workitem report 양식에 `## Orchestration` 섹션(모드/spawn 축/skip 사유/fallback 트리거 값, ≤5줄)을 의무 추가한다 — 사용자가 팬아웃/inline 여부를 산출물로 확인할 수단을 준다.

### D11. fan-out 크기 판정 v2 (#amend-4 결정 1 재보정 — 테스트·문서 분리)
```
dispatch 전에 크기를 결정적으로 계산한다. F = 변경 파일 수(전부), L_impl = «테스트 파일 집합»(test/**, tests/**, __tests__/**, e2e/**, integration_test/**, **/*.test.*, **/*.spec.*, **/*_test.dart)과 «문서 집합»(docs/**)을 제외한 변경 줄 합, L_test·L_docs = 각각의 변경 줄 합. inline 허용은 **(L_impl ≤ 50) 또는 (F ≤ 2 이고 L_impl ≤ 200)**, 그리고 UI/Arch-iface/MCP/spec-coverage 중 둘 이상 명백히 해당없음 — 셋 다 충족일 때만. 하나라도 미충족이면 fan-out 필수(재량 0). `## Orchestration`에 F·L_impl·L_test·L_docs와 판정 근거를 기록한다. 임계 초과인데 inline이면 규칙 위반이다. **1축 = 1 validator는 불변이다** — 비용 압력은 임계를 재보정해 풀지, 축을 합쳐 풀지 않는다(Round 11 발견 17). 측정 시점은 validate-workitem 실행 시점의 워킹트리(`git diff HEAD` + untracked)다 — finalize 커밋 diff가 아니다.
**(b) report-only·계획 리뷰 dispatch의 분할**: 회수 문서가 10개 이상이면 축·범위를 나눈다(원천: ADR-004#amend-9 결정 4 (현재 SSOT: 본 ADR D11) — reviewer·qa dispatch(stabilize 단계 4·5, design-milestone R6-4, review-doc)에 적용. ADR-074는 이 규칙을 담지 않는다). `/validate-plan`은 세션 인라인 스킬이라 dispatch 분할의 대상이 아니다 — 그 자리는 자체 «큰 milestone budget 가이드»(JIT 회수)가 맡는다(Round 13 Phase 1 실측: 15개 문서를 부분 읽기로 dispatch 없이 완주).
```
근거(실측, 2026-09-13, dogfood-web): 가설 «Round 11 T-001은 테스트·문서를 빼면 구현 줄이 50 안팎이라 inline 후보이고, T-003(저장 어댑터, 외부 경계)은 구현 줄만으로도 50을 넘어 fan-out이 맞다»를 검증했다. T-001 F=6·L_impl=38·L_test=51·L_docs=15 — 50 이하로 가설이 성립한다(**과거 판정의 원인을 바꾸지는 않는다** — Round 11 당시 기준은 총 `L=91`·`F=6`이라 크기 조건만으로 이미 fan-out 필수였다. 새 기준에서 크기 관문을 통과하며, inline 여부는 나머지 조건이 함께 정한다). T-003 F=5·L_impl=74·L_test=62·L_docs=16 — 50 초과·F>2로 fan-out 필수 가설이 그대로 성립한다. 두 사례 모두 가설과 어긋나지 않아 임계(50/200)를 옮기지 않는다. 커밋 diff(finalize 시점) 기준이라 validate 시점 워킹트리와 다를 수 있다는 한계가 있다 — 다음 재보정 창구는 재검토 트리거 1이다.

### D12. 축 spawn 신호 (validate-workitem #cost guard 확장 승계 + 재보정)
축 3·4·6·8 신호는 기존대로. **축 5(UI Design inventory)는 «UI 프로젝트» 신호가 아니라 «diff에 UI surface 파일 집합의 파일이 1개 이상»일 때만 spawn**한다(Round 11 T-003: `.tsx` 0개인데 spawn — 발견 16). UI surface 파일 집합의 정의는 [ADR-073](ADR-073-interface-and-design-content-v2.md)#amend-2 결정 1이 소유하며 본 D12는 인용만 한다. UI 프로젝트라도 diff에 해당 파일이 없으면 spawn하지 않고 「해당없음」으로 인라인 기록한다.

### D13. 하청 정지 회수 (#amend-4 결정 2 승계 + ADR-074 D10 정합)
foreman/dispatcher는 위임한 서브에이전트가 구조화 최종 반환 없이 멈추면 1회 재개(SendMessage 등) → 그래도 미반환이면 결과를 직접 회수한다 — **builder**는 그 slice가 건드린 파일을 직접 열어 회수, **report-only 감사자(validator/qa/reviewer — 산출 파일 없음)**는 재실행→다른 감사자 재위임→메인 직접 감사→불가 시 `감사 미완(unavailable): <축>` 기록. "결과 없음"을 조용히 통과시키지 않는다(always-verify). **재개 시 「이미 쓴 파일 목록」은 하청에게 받지 않고 호출자가 워킹트리를 직접 읽어 만든다**(ADR-074 D10 — 상한 중단은 마무리 턴 없이 잘리므로 하청이 목록을 낼 기회가 없다). 멈춤의 근본 원인은 모델/런타임 행동으로 추정되어 불확실하므로, 위임 프롬프트 문구를 더 늘리지 않고 회수 규율만 둔다.

### D14. 의존성 도구 고정 (#amend-4 결정 3 승계)
builder는 프로젝트/워크스페이스가 *이미 쓰는* 의존성 도구만 쓰고 새 도구 도입·전환을 하지 않는다. 전역 단일 PM이 아니라 **scope별 도구**(모노레포·비-JS 지원). 정보 흐름: bootstrap-stack이 확정한 scope→tool을 STACK_SETUP_PLAN `## Dependency Tools`에 기록 → stack-guard가 실제 lockfile과 교차 확인·보완 → plan-workitem은 설치 line item 작성 시 그 표로 도구를 맞추고 → implement preflight가 scope→tool을 회수해 slice별 dispatch에 전달 → builder는 지정 scope 도구만 실행. 동일 scope 신호 충돌·표↔저장소 불일치·slice→scope 불명확이면 그 slice만 `Needs Dependency Tool Decision`으로 중단.

## 대안과 제약 (ADR-053)
- A. amend-5를 더한다 — ADR-045 D6 위반(#amend-4가 이미 재발행을 예고했다). 기각.
- B. 크기 판정 규칙을 DELEGATION_STRATEGY 산문으로만 — 근거·falsifier가 사라진다. 기각.
- C. 채택 — net 규칙 재발행 + 테스트/문서 분리 재보정 + 축 5 신호 재보정.

## 신뢰도
Medium — D1~D10은 여러 라운드에 걸쳐 관측·재확인됐다. D11·D12는 Round 13 재측정(n=2, T-001·T-003)으로 재보정됐으나 표본이 여전히 작아 재검토 트리거를 둔다.

## 재검토 트리거
1. Round 14에서 inline 판정된 task의 validate가 놓친 P0가 있으면 L_impl 임계를 하향한다.
2. D11의 임계값이 다른 스택(Flutter 등)에서 계속 유지되는지 다음 재측정에서 재확인한다.
3. 축 5 spawn 신호(D12)가 UI surface 파일 diff 1개 이상인데도 오탐(실제로는 UI 판정이 불필요한 사례)을 반복 내면 조건을 좁힌다.

## 정책 강도 (ADR-022)
- 제약(강, [관측됨]): D11 결정 1(fan-out 크기 판정 기계화 — 큰 변경에서 검증 누락은 파괴적).
- enabling(약): D1~D10·D12~D14, D11 (b) — **본 재발행은 승계 원천의 강도를 올리지 않는다**(D9 본문이 «soft — hard-block 아님»이고, D13 회수 규율은 ADR-051#amend-4 결정 2에서 enabling(약)이었다). 단 D13 중 «「쓴 파일 목록」은 호출자가 만든다» 조항의 강도는 ADR-074 D10(제약 중)이 소유한다.

## Mutation Contract (ADR-047 D3)
1. Target — `.claude/skills/{implement-workitem,plan-workitem,validate-workitem,stabilize-milestone,validate-plan}/SKILL.md`(fan-out 판정·인용 재지정) / `docs/00-meta/DELEGATION_STRATEGY.md`(오케스트레이션 단락) / `docs/90-decisions/boilerplate/{ADR-038,ADR-047,ADR-050,ADR-019,ADR-026}.md`(참조 갱신) / `docs/90-decisions/boilerplate/README.md` 인덱스.
2. Failure mode — net 규칙을 base + amendment 4개에서 조립해야 함 / fan-out 크기 판정이 테스트 파일을 포함한 총 줄 수를 써서 **테스트가 붙은 작은 구현 변경까지 fan-out으로 밀어 올리는 왜곡**(Round 11·13 실측) — 반대 방향의 위험(#amend-2 시절 재량 문구로 큰 변경이 inline으로 샌 Round 4 사례)은 D11 결정 1의 «재량 0»이 이미 막는다 / 축 5가 UI 파일 0건에도 spawn돼 낭비되는 fan-out (전부 관측됨).
3. Predicted improvement — Round 14에서 L_impl 기준 판정이 테스트 비대 task에서도 정확히 서고, 축 5가 UI surface 파일 diff 없는 task에서 spawn되지 않아 팬아웃 낭비가 줄어든다.
4. Preserved invariants — lifecycle 8단계 책임 경계·validate report 양식·signal-first cap·ADR-050 D2 model-invocable 범위·`## 9. 의존성`의 자연어 선언·1축=1 validator.
5. Falsifying evaluation — (a) Round 14에서 **inline으로 판정된** task(`L_impl ≤ 50` 또는 `F ≤ 2` 이고 `L_impl ≤ 200`)의 validate가 놓친 P0가 뒤늦게 드러나면 L_impl 임계를 하향한다(재검토 트리거 1과 같은 조건이다) (b) 축 5가 UI surface 파일 diff 1개 이상인데도 매번 「해당없음」으로 끝나면(UI 판정이 실질적으로 불필요) 조건을 더 좁힌다 (c) foreman 운전이 사용자 확인 전 자동 연쇄를 일으키면 D1 범위를 재검토한다.
6. Rollback path — 본 ADR superseded → ADR-051 net 규칙으로 회귀(fan-out 판정·축 5 신호 원복), ADR-050 D1 implement 부분 + ADR-038 #d3·#d6 supersede는 그대로 유지(본 ADR이 승계했을 뿐 원 결정은 불변).
7. 예산 영향 — validator 축 spawn 감소(축 5가 UI 파일 0건 diff에서 spawn되지 않음) — 위임 단위의 작업량을 늘리지 않는다.

## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT. 실제 파일 경로 1행 1개)
- .claude/skills/implement-workitem/SKILL.md                      — D1 foreman 전환 + D9 partition 가드
- .claude/skills/plan-workitem/SKILL.md                           — D3 de-fork + D5 wave/worktree echo 제거
- .claude/skills/plan-milestone/SKILL.md                          — D4
- .claude/skills/validate-workitem/SKILL.md                       — D2 병렬 fan-out + D10 Orchestration 기록 + D11·D12 판정
- .claude/skills/validate-plan/SKILL.md                           — D11 (b) 회수 예산
- .claude/skills/stabilize-milestone/SKILL.md                     — D2 병렬 fan-out (qa·reviewer) + D11 (b)
- .claude/agents/builder.md                                       — D1 slice-scoped builder + D7 단독 writer(`## 4-1`) + D9
- .claude/agents/validator.md                                     — D2 per-axis partial verdict 반환
- .agents/skills/plan-milestone/                                  — D4 Codex wrapper 디렉터리
- docs/00-meta/WORKFLOW.md                                        — foreman 운전권 + fan-out + wave 제거 단락
- docs/00-meta/DELEGATION_STRATEGY.md                             — foreman/builder 위임 트리거 + 병렬 fan-out + 회수 규율(D13) + Codex degrade 노트
- docs/00-meta/STRUCTURE.md                                       — skill roster + 생성 주체 컬럼 + Codex wrapper 인벤토리
- docs/90-decisions/boilerplate/ADR-038-cross-llm-plan-validation.md  — #d3·#d6 superseded note
- docs/90-decisions/boilerplate/ADR-047-code-as-agent-harness.md      — D9(구 D6) re-anchor
- docs/90-decisions/boilerplate/ADR-026-plan-workitem-schema.md       — `## 9` 5필드 제거 정합
- docs/90-decisions/boilerplate/ADR-050-main-session-lifecycle-skills.md — D1 implement 부분 supersede note
- docs/90-decisions/boilerplate/ADR-019-jit-context-loading.md      — `## Amendment 1` 조건부 re-read
- .claude/skills/stack-guard/SKILL.md                             — §6-2-1 테스트 격리 권장
- .claude/skills/bootstrap-stack/SKILL.md                         — scope→tool STACK_SETUP_PLAN 기록
- .claude/skills/bootstrap-stack/stack-brief-template.md          — scope→tool 기록
- docs/00-meta/_templates/STACK_SETUP_PLAN_TEMPLATE.md            — `## Dependency Tools` 표

## 참고
- ADR-051(superseded — 승계 원천), ADR-007(lifecycle), ADR-068(graduation), ADR-019(JIT 로딩), ADR-026(plan schema), ADR-038(cross-LLM plan + wave supersede), ADR-040(researcher 위임), ADR-046(signal-first), ADR-047(harness mutation + D9), ADR-050(de-fork + model-invocable), ADR-073#amend-2(UI surface 파일 집합 정의), ADR-074(모델·추론 강도·턴 예산 — D9-2·D10 인용), ADR-045 D6.
