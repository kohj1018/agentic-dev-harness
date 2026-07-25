# ADR-051 — 메인 세션 오케스트레이션(foreman) + 병렬 fan-out + wave 제거

> scope: boilerplate

## Status
accepted

## 현재 유효 결정
- implement는 foreman(메인 세션)이 운전 — `## 3` step 파일 경로로 file-disjoint slice를 나눠 병렬 builder, 작거나 겹치면 단일/순차(D1·#d6).
- validate/stabilize는 report-only fan-out. **inline vs fan-out은 dispatch 전 파일·줄 수 기계 계산으로 결정** — 임계 초과면 inline 불가(강행=규칙 위반), 임계 미달이어도 inline을 택하면 `## Orchestration`에 계산값+"임계 미달" 기록(#amend-4가 #amend-2를 이 축에서 뒤집음).
- plan de-fork + plan-milestone 신설, ADR-038 wave(#d3/#d6)·write_set 5필드 제거(D5).
- 하청이 구조화 반환 없이 멈추면 foreman/dispatcher가 1회 재개→실패 시 결과 직접 회수 — builder는 파일 확인, report-only 감사자는 재실행→재위임→직접 감사→unavailable 기록(always-verify, #amend-4).
- 위임 시 scope별 의존성 도구 고정 — builder는 기존 도구만(새 도구 도입·전환 금지); scope→tool은 STACK_SETUP_PLAN `## Dependency Tools`가 SSOT(모노레포·비-JS 지원, #amend-4).
- 공유 런타임 리소스 partition 가드(#amend-1), validate orchestration 관측 기록(#amend-2), D4 범위 M1 통일(#amend-3).

## 대체
- [ADR-050](ADR-050-main-session-lifecycle-skills.md) D1 중 implement-workitem 부분을 **supersede** — implement-workitem은 fork builder 격리가 아니라 *foreman(메인 세션 오케스트레이터)*이 builder 위임을 운전한다. **파일 경계가 분리되면(file-disjoint) 여러 builder를 병렬로, 작거나(파일 ≤~2-3개·RGR 1회) 파일이 겹치면 단일 builder로** 운전한다.
- [ADR-038](ADR-038-cross-llm-plan-validation.md) `## 결정` #d3(parallel waves echo) + #d6(wave별 worktree 병렬 권장)을 **supersede** — plan-workitem은 wave 그룹을 계산·echo하지 않는다. 병렬성은 validate/stabilize *fan-out*으로 이전.

## 배경
- [관측됨] implement-workitem이 `context: fork` + `agent: builder`로 돌면 메인 세션이 구현 흐름을 *직접 운전*하지 못한다 — RGR 사이클 중 사용자 권한 응답·재해석 결정이 fork 경계에 막힌다(ADR-050 D2가 model-invocable로 풀었어도 fork 격리는 잔존).
- [관측됨] plan-workitem이 출력하는 wave 그룹(ADR-038#d3)은 *derived view*인데 사용자가 이를 따라 `claude --worktree`(ADR-038#d6)로 병렬 implement를 시도하면 (a) uncommitted plan 문서 미가시, (b) lockfile/빌드캐시 race, (c) worktree 수동 cleanup 부담이 반복 관측됐다. wave 가시화의 실효 < 병렬 implement의 환경 충돌 비용.
- [관측됨] validate-workitem·stabilize-milestone은 *report-only fan-out*(여러 task·여러 verifier를 동시 점검)이 충돌 위험 없이 안전하다 — 쓰기 격리가 필요 없는 read/판정 작업이라 병렬화 이득이 깨끗하다.
- 기존 규약: ADR-007 lifecycle 8단계, ADR-019 "사전 fork-load 금지 + minimal", ADR-038 parallel waves, ADR-047 D9(workflow topology + shared state), ADR-050(de-fork + model-invocable). 본 ADR은 *병렬성의 위치*를 plan-time wave에서 validate/stabilize fan-out으로 재배치하고 implement 운전권을 foreman으로 옮긴다.

## 결정

### D1. implement-workitem을 foreman 오케스트레이션으로 전환 (ADR-050 D1 implement 부분 supersede)
implement-workitem에서 `context: fork`(및 `agent: builder`)를 제거하고 **메인 세션 foreman**이 실행한다. foreman은 task를 1회 읽어 `## 3. 구현 항목`의 step 파일 경로로 *충돌 없는(file-disjoint) slice*를 싸게 나눈 뒤(`## 9. 의존성`은 자연어 *선행 순서*만 — 5필드 삭제됨), 각 slice를 `Agent`로 **builder에 위임**한다 — **파일 경계가 분리되면 여러 builder를 병렬로, 작거나(파일 ≤~2-3개·RGR 1회)·파일이 겹치면 단일 builder로** 운전한다(과도한 분할 금지 — 본 ADR #d6 partition 규칙). 각 builder는 자기 slice의 AC에 대해 RGR을 돌리고, foreman이 결과·`## 4-1`을 *단일 writer*로 병합한다. 무거운 추론의 노이즈 격리는 bootstrap-project의 architect 위임과 동형이되, *동시성*은 file-disjoint slice에서만 적용한다(같은 파일을 쓰는 slice는 순차 또는 worktree).
- foreman은 task 재해석(`Needs Plan Decision`)·권한 응답·`Needs Install`/`Needs Research` 분기를 메인 세션에서 직접 처리한다.
- `context-pack: minimal` 유지. [정정 2026-07: context-pack은 no-op으로 제거됨(ADR-019 정정) — 본 '유지'는 실효 없음.] ADR-050 D2(model-invocable)는 그대로 — foreman이 inner-loop를 운전한다.
- **Codex: 서브에이전트는 GA이나 본 저장소가 Claude persona 위임을 Codex subagent로 아직 매핑하지 않아 순차 단일 실행으로 degrade** — 이 매핑이 없으므로 builder `Agent` 위임을 *메인 세션 인라인 단일 실행*으로 대체한다(ADR-010 정합, 행동 동일·격리만 없음).

### D2. validate/stabilize 병렬 fan-out (ADR-038 병렬성 위치 재배치)
병렬성은 plan-time wave가 아니라 *report-only 단계의 fan-out*으로 제공한다:
- validate-workitem: 단일 workitem 검증을 **audit axis별**(AC↔테스트 / diff-trace / FAC↔AC spec / Arch-iface 7-x / UI Design-inventory / Evidence Bundle)로 **병렬 fan-out** — 각 validator는 *partial verdict만 반환*하고 **메인이 단일 report(`reports/<task-id>.md`)를 작성**(clobber 방지). 여러 task 동시 검증 시 task별 fan-out도 동형. 읽기·판정뿐이라 write 충돌 없음(작은 diff는 단일 inline validator로 fallback).
- stabilize-milestone: qa·reviewer(code/design surface) 위임을 **병렬 fan-out**.
- 두 단계 모두 report/판정 산출물이라 동시 실행이 git index race·빌드캐시 충돌을 일으키지 않는다(implement 병렬과 결정적 차이).
- **Codex: 서브에이전트는 GA이나 본 저장소가 Claude persona 위임을 Codex subagent로 아직 매핑하지 않아 순차 단일 실행으로 degrade** — fan-out 대상 task/verifier를 순차로 1개씩 처리(판정 결과 동일, wall-clock만 길어짐).

### D3. plan-workitem de-fork (ADR-050 D1 패턴 확장)
plan-workitem에서 `context: fork`(및 `agent:`)를 제거해 메인 세션 인라인 실행한다 — planning은 사용자와의 상호작용(sizing·해석 확정·의존성 결정)이 잦아 fork 격리 이득보다 운전권 손실이 크다(ADR-050 D1 de-fork 논거 동형). 무거운 아키텍처 추론은 architect `Agent` 위임 유지.
- `disable-model-invocation`은 **유지**(ADR-050 D2 범위 한정 — plan-workitem은 텍스트 제안 + 사용자 명시 발화 규약 유지).

### D4. plan-milestone 신규 skill
milestone 단위 분해를 plan-workitem에서 분리한 **`/plan-milestone [milestone idea | feature idea]`** 신규 skill을 신설한다 — milestone → feature 분해 + graduation 기준(ADR-014 5+1) authoring을 책임진다. plan-workitem은 feature → task 분해에 집중(역할 경계 명확화).
- `disable-model-invocation: true` + 메인 세션 실행(fork X) + architect `Agent` 위임. `.claude` + `.agents` 양 mirror 신설.

### D5. wave echo + worktree 병렬 권장 제거 (ADR-038 #d3·#d6 supersede)
plan-workitem은 더 이상 `## 9. 의존성`을 위상정렬한 wave 그룹을 echo하지 않으며, `claude --worktree` 병렬 implement 권장도 출력하지 않는다.
- `## 9. 의존성` 5필드(`depends_on`/`read_set`/`write_set`/`assumptions`/`verifier`)는 wave 전용 스키마(ADR-047 D9 "opt-in 병렬 wave 한정")라 **전부 삭제**한다(사용자 결정 — 완전 제거 + YAGNI). foreman의 file-disjoint 분할은 `## 3` step 파일 경로로 결정(write_set 불필요 — 아래 D6). 남는 것은 plain 자연어 의존성 선언뿐.
- `.gitignore`의 `.claude/worktrees/` 패턴은 잔존 무해라 *삭제하지 않는다*(Surgical — ADR-006). 단 ADR-038 면책 단락(동시 implement 환경 책임)은 ADR-038에 영속한 채 "병렬 implement 비권장"으로 status note만 단다.

### D6. ADR-047 D9 re-anchor (foreman `## 3` step-path partition)
ADR-047 D9(Optimized Workflow Topology + Shared State)의 적용 SSOT를 *plan-workitem wave 계산*에서 **foreman의 intra-task partition**으로 재anchor한다 — foreman이 한 task를 `## 3. 구현 항목`의 step 파일 경로로 나눠 *file-disjoint slice는 병렬 builder, 겹치거나 작으면 단일/순차*로 운전한다. TASK_TEMPLATE `## 9` 5필드(`write_set` 등) 구조화 스키마와 ADR-038#amend-3 write_set wave 분리 메커니즘은 wave 전용이라 **ADR-051 #d5가 함께 폐지**한다(사용자 결정 — 완전 제거). 즉 D9의 *개념*(워크플로 토폴로지 최적화)은 foreman 분할로 계승하되 *명시적 write_set 스키마는 쓰지 않는다*.

### D7. NO-merge 결정 (기록)
**병렬 작업 결과의 자동 코드 merge를 본 보일러플레이트가 제공·전제하지 않는다** — validate/stabilize fan-out은 *독립 report-only 산출물*(task별 report, QA_FINDINGS/IMPROVEMENT_GUIDE 누적)이라 merge할 shared write 산물이 없다. implement foreman의 병렬 builder는 **file-disjoint slice에만** 띄우므로 *같은 파일을 동시에 쓰지 않는다* → 코드 merge 자체가 발생하지 않고, foreman은 `## 4-1` 파일목록(메타데이터)만 단일 writer로 병합한다. 제거된 것은 *cross-task* plan-time wave + `claude --worktree` 멀티세션 implement(D5)이며, *intra-task* foreman 분할은 disjoint 보장으로 merge-free다. fork 사용자가 disjoint를 깨는 자체 병렬 전략을 둔다면 환경 책임(ADR-038 면책 단락 정신 계승).

### D8. 조건부 re-read (ADR-019 amend)
foreman/fan-out 도입으로 메인 세션이 inner-loop를 여러 라운드 운전하면, 매 라운드 전체 task/feature 문서를 재로딩하면 컨텍스트 낭비다. ADR-019 minimal/JIT 정책을 *조건부 re-read*로 좁힌다 — **직전 라운드에서 이미 로드한 문서는 mtime/판정 변경 신호가 있을 때만 재읽기**(예: repair 후 task `## 8. 메모` 갱신, validate report 신규 생성). 변경 신호 없으면 in-context 버전 재사용. 본 정책은 ADR-019 `## Amendment 1`로 박는다(아래 Surfaces).

## Mutation Contract (ADR-047 D3)
1. **Target** — `.claude/skills/{implement-workitem,plan-workitem,validate-workitem,stabilize-milestone}/SKILL.md` frontmatter·본문(foreman/fan-out/de-fork/wave 제거); `.claude/skills/plan-milestone/SKILL.md` 신규; ADR-038 #d3·#d6·`## 현재 유효 결정`·`## Surfaces`; ADR-047 D9 anchor 단락; ADR-050 status/supersede note; ADR-019 `## Amendment 1`; WORKFLOW.md·DELEGATION_STRATEGY.md 병렬·운전권 단락; STRUCTURE.md roster.
2. **Failure mode** — fork 격리로 메인이 implement inner-loop를 직접 운전 불가; plan-time wave + worktree 병렬 implement가 lockfile/빌드캐시 race·uncommitted plan 미가시·수동 cleanup 부담을 반복 유발(관측됨); 매 라운드 full re-read로 컨텍스트 낭비.
3. **Predicted improvement** — foreman 운전권 확보(권한·재해석 즉시 처리), 병렬성 위치를 충돌 없는 report-only fan-out으로 이동해 race 사고 0건화, 조건부 re-read로 라운드당 토큰 절감.
4. **Preserved invariants** — lifecycle 8단계 책임 경계·validate report 양식·signal-first cap·ADR-050 D2 model-invocable 범위·`## 9. 의존성`의 *자연어 의존성 선언*. **단, ADR-038 #d3·#d6(plan-time wave echo + worktree 병렬 implement) + #amend-3(write_set 결정적 wave 분리) + TASK_TEMPLATE `## 9` 5필드 구조는 본 ADR D5가 의도적으로 *제거*(소비처 이전이 아니라 폐지 — wave 전용 스키마)**; ADR-050 D1 implement 부분은 D1이 supersede.
5. **Falsifying evaluation** — ADR-017 dogfood 재실행에서 (a) foreman 운전이 *원치 않는 자동 연쇄*(사용자 확인 전 다음 task 진행)를 일으키거나, (b) fan-out 순차 degrade(Codex)에서 판정 누락이 생기면 D1·D2 범위 재검토.
6. **Rollback path** — 본 ADR superseded → ADR-050 D1(implement fork) + ADR-038 #d3·#d6·#amend-3(wave echo + worktree + write_set wave 분리) + TASK_TEMPLATE `## 9` 5필드 + ADR-026 Surfaces 5필드 줄 복원, plan-milestone skill 제거(양 mirror), ADR-019 `## Amendment 1` 철회.

## 정책 강도 (ADR-022)
- D1·D3·D4·D8: enabling(약) — 운전권/역할/토큰 개선. D2: enabling(약) — 병렬 fan-out opt-in 가속. D5·D7: constraint 완화 + 제거(약) — 병렬 implement 권장 철회(자동 차단 없던 권장이라 강도 약). D6: 정정성 re-anchor(행동 불변, 소비처 명문화).

## 결과
- implement는 foreman이 메인 세션에서 운전(file-disjoint slice는 병렬 builder, 작거나 겹치면 단일), plan-workitem/plan-milestone는 메인 세션 분해, 병렬성은 *intra-task foreman 분할* + validate/stabilize report-only fan-out으로 제공, *cross-task* plan-time wave + worktree 멀티세션 implement는 제거.
- ADR-038은 cross-LLM plan validation(`/validate-plan`+`/repair-plan`) 정책만 유효로 잔존, 병렬 wave 부분은 superseded.
- ADR-050 D1 implement 부분 + ADR-038 #d3·#d6 supersede 기록, ADR-047 D9·ADR-019는 amend로 정합.

## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT. ADR-045 정합 — 실제 파일 경로 1행 1개, 생략·comma-join 금지)
- .claude/skills/implement-workitem/SKILL.md                      — D1 foreman 전환(de-fork + 병렬/단일 builder 위임: file-disjoint면 병렬) #amend-1
- .claude/skills/plan-workitem/SKILL.md                           — D3 de-fork + D5 wave/worktree echo 제거
- .claude/skills/plan-milestone/SKILL.md                          — D4 신규 skill
- .claude/skills/validate-workitem/SKILL.md                       — D2 병렬 fan-out
- .claude/skills/stabilize-milestone/SKILL.md                     — D2 병렬 fan-out (qa·reviewer)
- .claude/agents/builder.md                                       — D1 slice-scoped builder (foreman 위임 단위) + D7 단독 writer(`## 4-1`) #amend-1
- .claude/agents/validator.md                                     — D2 per-axis partial verdict 반환
- .agents/skills/plan-milestone/                                  — D4 Codex wrapper 디렉터리 (SKILL.md + agents/openai.yaml; 신규)
- docs/00-meta/WORKFLOW.md                                        — foreman 운전권 + fan-out + wave 제거 단락
- docs/00-meta/DELEGATION_STRATEGY.md                             — foreman/builder 위임 트리거 + 병렬 fan-out + Codex degrade 노트
- docs/00-meta/STRUCTURE.md                                       — skill roster 18→20 + 생성 주체 컬럼 + Codex wrapper 인벤토리
- docs/90-decisions/boilerplate/ADR-038-cross-llm-plan-validation.md  — #d3·#d6 superseded note + status note
- docs/90-decisions/boilerplate/ADR-047-code-as-agent-harness.md      — D9 re-anchor(foreman `## 3` step-path partition; write_set 5필드 스키마 폐지)
- docs/90-decisions/boilerplate/ADR-026-plan-workitem-schema.md       — Surfaces line 55(`## 9` 5필드) 제거 (5필드 삭제 정합)
- docs/90-decisions/boilerplate/ADR-050-main-session-lifecycle-skills.md — D1 implement 부분 supersede note
- docs/90-decisions/boilerplate/ADR-019-jit-context-loading.md      — `## Amendment 1` 조건부 re-read
- .claude/skills/stack-guard/SKILL.md                             — §6-2-1 테스트 격리 권장 #amend-1
- .claude/skills/bootstrap-stack/SKILL.md                         — #amend-4 scope→tool STACK_SETUP_PLAN 기록
- .claude/skills/bootstrap-stack/stack-brief-template.md          — #amend-4 scope→tool 기록
- docs/00-meta/_templates/STACK_SETUP_PLAN_TEMPLATE.md            — #amend-4 `## Dependency Tools` 표

## 참고
- ADR-007(lifecycle), ADR-014(graduation — plan-milestone가 5+1 authoring), ADR-019(JIT 로딩 — 조건부 re-read amend), ADR-026(plan schema — `## 9` 5필드 *삭제*, 자연어 의존성만; Surfaces line 55 제거), ADR-038(cross-LLM plan + wave supersede), ADR-040(researcher 위임 — foreman이 호출), ADR-046(signal-first), ADR-047(harness mutation + D9), ADR-050(de-fork + model-invocable — D1 implement 부분 supersede).
- Ning et al. 2026, *Code as Agent Harness* (arXiv:2605.18747v1) §4.1.3 (Optimized Workflow Topology) — 병렬성 위치 재배치의 survey-level 근거.

<a id="adr-051-amend-1"></a>
## Amendment 1 (2026-06-30) — 공유 런타임 리소스 partition 가드
### 결정
1. foreman partition(D6 `## 3` 경로 분할)에 *공유 런타임 리소스* 트리거 추가: 두 slice의 테스트가 격리 없이 공유 DB·고정 포트·로컬 Supabase 스택·단일 dev server·공유 빌드/codegen 캐시를 동시에 건드리면 file-disjoint라도 순차/단일. 격리 보장 시 병렬 유지. soft(hard-block 아님).
2. builder는 *테스트 범위 한정이 완화책이지 해결책 아님*을 명시. foreman은 격리 여부를 dispatch *전*에 두 신호로 판단해 순차화한다 — (a) `STACK_SETUP_PLAN.md`의 "테스트 격리 미설정" 표식, (b) 두 slice의 `## 3`가 동일 공유 리소스 지목(builder는 peer slice 미가시·false-Green 사후 탐지 불가라 *사전 결정*). builder는 자기 slice의 공유-리소스 의존을 "남은 리스크"로 보고. stack-guard는 e2e/통합 격리를 *권장*(unit 격리 authoring 한계).
### 근거
- [관측됨] D7은 disjoint를 *file* 속성으로만 봤으나, ADR-038 면책 단락(빌드캐시 race / 포트·임시DB·fixture)이 *런타임 리소스* 충돌을 이미 명시 → same-checkout 병렬 builder에 그대로 재현(최악 false-Green). race 지식을 partition 트리거로 승격.
### 강도 (ADR-022)
- enabling(약) — 격리 보장 시 병렬 유지, hard-block 아님.
### 적용 surface
- .claude/skills/implement-workitem/SKILL.md
- .claude/agents/builder.md
- .claude/skills/stack-guard/SKILL.md

<a id="adr-051-amend-2"></a>
## Amendment 2 (2026-07-16) — validate 팬아웃 관측 기록 + fallback 게이트 보정
### 결정
1. validate-workitem report 양식에 `## Orchestration` 섹션(모드/spawn 축/skip 사유/fallback 트리거 값, ≤5줄)을 의무 추가한다. 본 ADR Mutation Contract #4가 "validate report 양식"을 보존 invariant로 박았으므로 본 amendment가 그 invariant를 좁혀 완화한다(양식 *확장*만 허용).
2. small-diff fallback을 "줄 ≤50, 또는 (파일 ≤2 이고 줄 ≤200)"으로 보정 — 구 OR 기준은 구현+테스트 2파일의 대형 diff를 inline으로 보냈다.
### 근거
- [관측됨] 사용자가 팬아웃/inline 여부를 산출물로 확인할 수단이 없어 "병렬이 아닌 것 같다"는 체감이 반증 불가능했다. 팬아웃 강제 강화는 하지 않는다(소형 task 비용 증가 — cost guard 정신 유지).
### 강도 (ADR-022)
- enabling(약) — 관측 기록 추가 + 경계값 보정. 경계값(200줄)은 실측 전 추정치로 명시.
### 적용 surface
- .claude/skills/validate-workitem/SKILL.md

<a id="adr-051-amend-3"></a>
## Amendment 3 (2026-07-16) — D4 범위 갱신 (plan-milestone이 M1 포함 전 마일스톤 생성)
D4의 "milestone 단위 분해를 분리한 신규 skill" 정의는 유지하되, 그 범위가 [ADR-057](ADR-057-planning-v2-batch-and-seam.md) 결정 1로 확장된다 — plan-milestone은 M2+가 아니라 **M1 포함 전 마일스톤**을 생성하고, bootstrap-project의 M1/F-001 seed는 제거된다. plan-workitem의 feature→task 집중(D4 후단)은 ADR-057 결정 2의 배치 모드(M<N> 입력)로 보완된다(단일 feature 모드 유지).

<a id="adr-051-amend-4"></a>
## Amendment 4 (2026-07-25) — fan-out 크기 판정 기계화 + 하청 정지 회수 + 패키지 매니저 고정

### 배경
- [관측됨] SIMULATION_RUN Round 4 — T-002(10파일 +249/-380 = 629줄)가 small-diff 임계를 명백히 초과했는데 "단일 vertical slice"라는 실행자 판단으로 inline 처리됐다(경계 판단 오용). 뒤늦게 fan-out 오케스트레이션 패턴으로 재검증하니 inline이 놓친 P1 2건([Doc-code-mismatch]·[Repair-bookkeeping-gap])이 검출됐다. #amend-2의 "경계값은 메인 세션 판단" 문구가 명확한 규칙을 우회하는 핑계가 됐다.
- [관측됨] 서브에이전트가 구조화 최종 반환 전 중간 사고 문장에서 정지하는 패턴 5+건(빌더 2·qa 1·validator 1은 빈 반환) — foreman이 재개·직접 회수로 매번 챙겼으나 규범 문서엔 없었다.
- [관측됨] builder가 npm 프로젝트에서 무심코 `pnpm`을 실행해 stray `pnpm-lock.yaml` 생성.

### 결정
1. **fan-out 크기 판정 기계화**: validate-workitem의 inline vs fan-out은 dispatch 전 계산한 값으로 결정한다 — 변경 파일 수 F, 줄 합계 L(`git status --porcelain`; tracked=`git diff HEAD`, untracked=파일 전체). inline 허용은 **(L≤50) 또는 (F≤2 그리고 L≤200)**, *그리고* UI/Arch-iface/MCP/spec-coverage 중 둘 이상 명백히 해당없음 — 셋 다 충족일 때만. 하나라도 미충족이면 **fan-out 필수(inline 재량 0)**. 조건 충족 시에도 inline을 택했으면 `## Orchestration`에 F·L과 "임계 미달"을 기록. **임계 초과인데 inline이면 그 자체가 규칙 위반**(산출물로 반증 가능). #amend-2의 "팬아웃 강제 강화 안 함"을 *이 축에 한해* 뒤집는다.
2. **하청 정지 회수 규율**: foreman/dispatcher는 위임한 서브에이전트가 구조화 최종 반환 없이 멈추면 1회 재개(예: SendMessage) → 그래도 미반환이면 결과를 직접 회수한다 — **builder**는 그 slice가 건드린 파일을 직접 열어 회수, **report-only 감사자(validator/qa/reviewer — 산출 파일 없음)**는 재실행→다른 감사자 재위임→메인 직접 감사→불가 시 `감사 미완(unavailable): <축>` 기록(DELEGATION_STRATEGY 정합). "결과 없음"을 조용히 통과시키지 않는다. *멈춤의 근본 원인은 모델/런타임 행동으로 추정되어 불확실하므로, 위임 프롬프트 문구를 더 늘리지 않고 회수 규율만 둔다*(원인 확정 전 과잉 문구 금지).
3. **의존성 도구 고정 (scope별)**: builder는 프로젝트/워크스페이스가 *이미 쓰는* 의존성 도구만 쓰고 새 도구 도입·전환을 하지 않는다. 전역 단일 PM이 아니라 **scope별 도구**(모노레포·비-JS 지원). 정보 흐름: bootstrap-stack이 확정한 scope→tool을 STACK_SETUP_PLAN `## Dependency Tools`에 기록 → stack-guard가 실제 lockfile과 교차 확인·보완 → plan-workitem은 설치 line item 작성 시 그 표로 도구를 맞추고 → implement preflight가 scope→tool을 회수(표 우선, 없으면 slice 인접 lockfile/tool-manifest 추론)해 slice별 dispatch에 전달 → builder는 지정 scope 도구만 실행. 동일 scope 신호 충돌·표↔저장소 불일치·slice→scope 불명확이면 그 slice만 `Needs Dependency Tool Decision`으로 중단. (install-ownership 경계는 [ADR-052](ADR-052-stack-provisioning-and-e2e-readiness.md); 도구 선택 *근거*는 ARCHITECTURE §7.)

거버넌스 주: 결정 1은 #amend-2의 "팬아웃 강제 강화 안 함"을 뒤집는 reversal이라 ADR-045 D6상 통합 재발행 대상이나(§1.3 amend-count 임계 상향으로 "4개째 amend" 사유는 소멸 — reversal만 남음), 이번 라운드는 사용자 minimal-churn 결정으로 amend 처리한다. D6 reversal 재발행 대신 minimal-churn amend 적용 — 근거: 이번 라운드 결정, 다음 변경 시 ADR-051 통합 재발행.

### 근거
- [관측됨] 위 3건 전부 SIMULATION_RUN Round 4 실측.

### 강도 (ADR-022)
- **결정 1(fan-out 크기 판정)은 constraint(강)로 승격** — #amend-2 D2의 enabling에서 올린다(큰 변경에서 검증 누락은 파괴적, 실측으로 효과 입증). 결정 2·3은 enabling(약).
- **Mutation Contract delta**(base 계약 승계): failure = 임계 초과 diff를 inline으로 보내 P0 누락 · 하청 정지를 조용히 통과 · 오도구로 stray lock 생성 / falsifying evaluation(ADR-047#amend-1) = SIMULATION_RUN 재실행(대조군 = 구 inline 재량)에서 임계 초과 inline이 재발하거나 inline이 놓친 결함이 그대로 통과하면 반증 / rollback = 기계 판정·회수 규율·scope→tool 고정을 제거하고 #amend-2의 재량 기준으로 복귀.

### 적용 surface
- .claude/skills/validate-workitem/SKILL.md
- .claude/skills/implement-workitem/SKILL.md
- .claude/agents/builder.md
- docs/00-meta/DELEGATION_STRATEGY.md
- .claude/skills/bootstrap-stack/SKILL.md
- .claude/skills/bootstrap-stack/stack-brief-template.md
- .claude/skills/stack-guard/SKILL.md
- .claude/skills/plan-workitem/SKILL.md
- docs/00-meta/_templates/STACK_SETUP_PLAN_TEMPLATE.md
