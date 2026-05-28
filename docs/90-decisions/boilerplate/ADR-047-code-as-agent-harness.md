# ADR-047 — Code-as-Agent-Harness 패러다임 정합 + Harness Mutation Contract

> scope: boilerplate

## Status
accepted

## 배경
- 본 보일러플레이트는 코드 앱이 아니라 **agentic 개발 하네스** 자체다. AGENTS.md / .claude/skills / .claude/agents / .agents / .codex / docs/ + ADR이 모두 하네스 구성요소.
- [외부실증] Ning et al. 2026 *Code as Agent Harness* (arXiv:2605.18747v1)는 agent harness를 "tools / APIs / sandboxes / memory / validators / permission boundaries / execution loops / feedback channels"의 software layer로 정의하고, 3 계층(interface / mechanisms / scaling)으로 정리한다.
- 본 보일러플레이트는 그 패러다임의 **"document-driven specialization"** 인스턴스다. 단, 정체성·shared substrate·mutation governance가 ADR-005 / ADR-019 / ADR-045 / ADR-046에 산발 — 통합 framing 없음.
- [관측됨] 진화 라운드마다 AGENTS.md / skill body / agent body가 수정됐지만, 변경의 *target / 막는 실패 / 보존 invariant / 회귀 evidence*가 일관 양식으로 박히지 않아 retrospective 추적이 어렵다.

## 결정

### D1. 정체성 명시 (*Code as Agent Harness* §1 Harness 정의 / §3.4.4 Verification through Deterministic Sensors 정합)
본 보일러플레이트는 **"document-driven code-as-agent-harness specialization"**이다.
- *Executability* — `validate` 명령 + AC↔테스트 매핑 + stabilize deterministic preflight가 model 의도를 검증 (논문 §3.4.4 deterministic sensors 적용).
- *Inspectability* — validation report / QA_FINDINGS / IMPROVEMENT_GUIDE / ADR이 실패 진단·역추적 가능.
- *Statefulness* — git + 문서 6 layer가 상호작용 history 보존.
- 본 D1은 *원칙 owning* — `[외부실증]` 논문 §1 Harness 정의 + §3.4.4 deterministic sensors 인용 single source.

### D2. Shared Harness Substrate 6 Layer
| Layer | 위치 | Lifecycle | 책임 |
|-------|------|-----------|------|
| Living docs | charter / architecture / DESIGN / workitem | Living | 현재 의도 |
| Validation reports | docs/40-validation/reports/ | ephemeral | task 단위 판정 |
| QA findings | docs/40-validation/QA_FINDINGS.md | Record | milestone 단위 관측 |
| Improvement guide | docs/40-validation/IMPROVEMENT_GUIDE.md | Living | 누적 권장 + 진화 후보 |
| Decision records | docs/90-decisions/ | Record | 정책 변경 governance |
| Git history | .git | Record | 모든 layer의 trace |

본 표는 *분류 정의*다. 각 layer의 절차·canonical owner는 [docs/00-meta/STRUCTURE.md](../../00-meta/STRUCTURE.md) Canonical Owner 표가 SSOT.

### D3. Harness Mutation Contract (*Code as Agent Harness* §3.5.3 정합)
다음 surface 중 하나라도 수정하는 ADR/PR은 본문에 *Harness Mutation Contract 6 필드*를 명시한다 (enabling — 자동 차단 X):

**대상 surface (mutation contract 발동):**
- `AGENTS.md`
- `.claude/skills/**/SKILL.md`
- `.claude/agents/**.md`
- `.agents/skills/**/SKILL.md` (Codex wrapper)
- `.codex/config.toml`
- *agent 행동을 직접 좁히는* boilerplate ADR (예: ADR-007 lifecycle, ADR-014 graduation, ADR-019 context-pack, ADR-022 ratchet, ADR-038 cross-LLM plan, ADR-044 cross-LLM discovery, ADR-046 signal-first 등)

**6 필드:**
1. **Target** — 어떤 컴포넌트의 어떤 동작을 바꾸는가 (file:section).
2. **Failure mode** — 이 변경이 막으려는 구체적 실패 패턴 (관측됨 또는 외부실증 출처).
3. **Predicted improvement** — 변경 후 어떤 신호로 개선을 확인하는가.
4. **Preserved invariants** — 이 변경에서 *깨면 안 되는* 기존 행동 (예: "validate report 양식 호환", "skill auto-invocation 금지").
5. **Falsifying evaluation** — 변경 후 어떤 dogfood simulation / fork run에서 회귀가 검출되면 본 변경을 되돌리는가.
6. **Rollback path** — supersede 시 어떤 ADR로 되돌리는가 또는 어떤 amend가 필요한가.

ADR 본문 어느 위치에 박는지: `## 결정` 블록(D1~Dn) 다음, `## 결과` 이전 어디든 — 보통 `## 정책 강도` 보조 섹션 *전후* (본 ADR 자체는 *전*에 둠). `## Mutation Contract` 섹션을 두고 위 6 필드를 각 1줄로 박는다.

본 D3는 *원칙 owning* — `[외부실증]` 논문 §3.5.3 인용 single source.

### D4. Falsifying evaluation의 default
별도 명시가 없으면 falsifying evaluation은 [ADR-017 dogfood simulation](ADR-017-dogfood-simulation.md)의 todo CLI baseline 재실행이다. fork 사용자는 자기 baseline으로 대체 가능.

### D5. Sandboxed Execution and Permissioned State Transition (*Code as Agent Harness* §3.4.3 정합)
multi-tier permission이 *harness state*. agent의 위험 transition을 *pre-execution gating* (permission boundary) 또는 *후속 deterministic sensor catch* (D1 Executability와 정합)로 통제한다.
- 본 보일러는 `.claude/settings.json` 의 `defaultMode` 로 *permission 기본 모드*를 결정 — 4 모드(`default` / `acceptEdits` / `bypassPermissions` / `plan`) 별 위험 tier·정당화·대체 경로는 [docs/00-meta/GUARDRAILS_STRATEGY.md](../../00-meta/GUARDRAILS_STRATEGY.md#guardrails-default-mode-risk-tier) 의 `## defaultMode 위험 tier` 단락이 적용 surface SSOT.
- 민감 파일 접근 차단은 `.claude/settings.json` 의 `permissions.deny` (현재 `.env` / `secrets/**`) 가 owning.
- 본 D5는 *원칙 owning* — `[외부실증]` 논문 §3.4.3 sandboxed execution + permissioned state transition 인용 single source. 영구 GUARDRAILS_STRATEGY 본문은 본 D5만 인용.

### D6. Contract Formation (*Code as Agent Harness* §3.4.2 정합)
계획이 *executable preconditions/postconditions*를 형성해야 verification이 deterministic해진다.
- 본 보일러의 적용: TASK_TEMPLATE `## 6. Acceptance Criteria` Given-When-Then 형식 (정성적 contract) + `## 6-1. 테스트 시나리오` machine-checkable path 형식 `<runner>::<file>::<test-id>` (executable contract). validator는 path 형식이면 *path 직접 resolve*, 자연어 양식이면 fallback.
- 본 D6은 *원칙 owning* — `[외부실증]` 논문 §3.4.2 Planning as Contract Formation 인용 single source. 양식 SSOT: TASK_TEMPLATE / ADR-009 (AC ↔ 테스트 식별자). 영구 TASK_TEMPLATE / validate-workitem SKILL 본문은 본 D6만 인용.

### D7. Deep Telemetry as the Optimization Substrate (*Code as Agent Harness* §3.5.1 정합)
단순 fail/pass가 아니라 *수치·분포·추이*와 *durable correction history* 가 harness 진화의 substrate.
- 본 보일러의 적용: (a) validation report `## Evidence Bundle` 누적 (D8 양식 정합) — task 단위, (b) /stabilize-milestone `7-T. Telemetry aggregate` 수치 dashboard — milestone 단위, (c) /repair-plan·/repair-discovery P0/P1 결정 이력 영속화 (task `## 8. 메모` / IMPROVEMENT_GUIDE `## 5. Repair decision log` / DISCOVERY `### Repair history`) — correction history.
- 본 D7은 *원칙 owning* — `[외부실증]` 논문 §3.5.1 Deep Telemetry as the Optimization Substrate 인용 single source. 영구 stabilize-milestone / repair-plan / repair-discovery SKILL 본문은 본 D7만 인용.

### D8. Oracle Adequacy + Semantic Verification (*Code as Agent Harness* §5.2.1·§5.2.2 정합)
pass/fail 단일 신호는 *과신*을 만든다 — "evaluation beyond final task success"는 open problem.
- 각 verifier는 *무엇을 못 검증했는지(oracle gap)* 와 *신뢰도(High/Medium/Low)* 를 declare해야 한다. executable feedback이 *불완전*하다는 사실을 verifier가 *선언* — semantic 보존은 executable signal로 잡히지 않을 수 있음.
- 본 보일러의 적용: validate-workitem report `## Evidence Bundle` 의 *검증된 것 / 검증하지 못한 것 (oracle gap) / 신뢰도* 3 sub-section. Pass 판정이라도 oracle gap 미명시 시 *신뢰도: Low 자동 강등*.
- 본 D8은 *원칙 owning* — `[외부실증]` 논문 §5.2.1 Harness-Level Evaluation and Oracle Adequacy + §5.2.2 Semantic Verification Beyond Executable Feedback 인용 single source. 영구 validate-workitem SKILL / validator agent 본문은 본 D8만 인용.

### D9. Optimized Workflow Topology + Shared State (*Code as Agent Harness* §4.1.3·§5.2.4 정합)
agent별 *read-set / write-set / assumptions / verifier* 를 구조화하면 wave 계산 + conflict review 안정성 ↑. shared state의 semantic conflict는 syntactic merge로 잡히지 않으므로 *deterministic input*(예: 명시적 `write_set:`)이 plan 시점에 회수 가능해야.
- 본 보일러의 적용: TASK_TEMPLATE `## 9. 의존성` 5필드 구조화 (opt-in, 병렬 wave 한정 — `depends_on` / `read_set` / `write_set` / `assumptions` / `verifier`) + plan-workitem wave 계산 (write_set 교집합 시 자동 wave 분리, 자연어 grep fallback 유지). 적용 surface SSOT: ADR-026 (TASK_TEMPLATE schema) + ADR-038#amend-3 (deterministic write_set 회수).
- 본 D9는 *원칙 owning* — `[외부실증]` 논문 §4.1.3 Optimized Workflow Topology + §5.2.4 Transactional Shared Program State 인용 single source. 영구 TASK_TEMPLATE / plan-workitem SKILL 본문은 본 D9만 인용.

## Mutation Contract (본 ADR 자체에 적용)
1. **Target** — _ADR_GUIDE.md / AGENTS.md / STRUCTURE.md의 정체성·mutation contract 단락 + 영구 SKILL / TEMPLATE / GUARDRAILS 의 D5~D9 인용 surface.
2. **Failure mode** — 진화 라운드마다 skill/agent 본문이 수정될 때 회귀 evidence·rollback이 양식화 안 돼 *어느 변경이 어떤 실패를 막았는지* 6개월 뒤 재구성 불가 (관측됨, Phase 진화 라운드 다수). 추가: *영구 파일이 외부 논문 §X.Y.Z를 직접 인용*하면 논문 supersede 시 분산 갱신 부담 발생 → 본 ADR D5~D9가 single source 역할.
3. **Predicted improvement** — 새 ADR 본문에 6 필드가 정착되면 fork retrospective에서 *변경 사유 추적 시간* 단축. + 영구 파일 논문 의존이 본 ADR 한 곳으로 집중됨.
4. **Preserved invariants** — 기존 lifecycle 8단계 / validate report 양식 / IMPROVEMENT_GUIDE 스키마 / signal-first cap.
5. **Falsifying evaluation** — `.boilerplate/validation/SIMULATION_RUN.md` 다음 라운드에서 *fork 사용자가 mutation contract 양식이 부담스럽다*는 신호 1+ 회 누적되면 enabling → 약권장 강도 재검토.
6. **Rollback path** — 본 ADR superseded + ADR-005·ADR-022 단편 정의로 복귀. D5~D9 분리 시 별도 ADR (예: ADR-048 Sandboxed Execution, ADR-049 Contract Formation 등) 로 분할 supersede 가능.

## 정책 강도 (ADR-022 정합)
**enabling (약) — [외부실증]** (*Code as Agent Harness* survey 인용 — D1·D3·D5·D6·D7·D8·D9 모두 본 ADR이 single source). 자동 차단 0건. 6 필드 누락 시 reviewer P2 라벨로 보고만.

## 결과
- 본 보일러플레이트의 정체성이 ADR 1개로 명시됨 — fork 사용자가 1 페이지로 "이 보일러는 무엇을 모델링 하는가"를 이해.
- harness 자체를 바꾸는 모든 ADR이 6 필드 mutation contract를 갖춤 → retrospective 추적성 + regression evidence 누적.
- **영구 SKILL / TEMPLATE / GUARDRAILS 파일은 외부 논문을 직접 인용하지 않고 본 ADR D# 정합만 인용** — 논문 supersede / retraction 시 본 ADR 한 곳만 갱신하면 됨 (ADR-005 SSOT 정신 정합).

## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT)
- AGENTS.md                                                                          — 정체성 1줄 link
- docs/00-meta/STRUCTURE.md                                                          — Canonical Owner 표
- docs/00-meta/GUARDRAILS_STRATEGY.md#guardrails-default-mode-risk-tier              — D5 적용 surface (`## defaultMode 위험 tier`)
- docs/30-workitems/_templates/TASK_TEMPLATE.md                                      — D6 적용 (`## 6-1` path 형식) + D7 적용 (`## 8. 메모` 영속 위치) + D9 적용 (`## 9. 의존성` 5필드)
- docs/40-validation/IMPROVEMENT_GUIDE.md                                            — D7 적용 (`## 5. Repair decision log`)
- docs/90-decisions/boilerplate/_ADR_GUIDE.md                                        — mutation contract 트리거 + 권장 섹션
- .claude/skills/validate-workitem/SKILL.md                                          — D6 적용 (path resolve) + D8 적용 (`## Evidence Bundle`)
- .claude/skills/stabilize-milestone/SKILL.md                                        — D7 적용 (`7-T. Telemetry aggregate`)
- .claude/skills/repair-plan/SKILL.md                                                — D7 적용 (`5-D` 결정 이력 영속화)
- .claude/skills/repair-discovery/SKILL.md                                           — D7 적용 (`4-D` 결정 이력 영속화)
- .claude/skills/plan-workitem/SKILL.md                                              — D9 적용 (wave 계산 `write_set` 우선)
- .claude/agents/validator.md                                                        — D8 적용 (Evidence Bundle 출력)

> README 인덱스(`docs/90-decisions/boilerplate/README.md`)는 *모든 ADR이 1줄 등재*되는 인덱스라 surface 정의(ADR-045 — *cross-surface enforcement*가 필요한 fan-out)에 해당하지 않는다. 인덱스 한 줄 추가는 별도 정상 절차(_ADR_GUIDE "새 ADR 추가 절차" §2).

## 후속 작업
- 다음 보일러플레이트 진화 라운드(Phase 12+)부터 *harness mutation surface*를 건드리는 ADR은 본 contract를 적용. 기존 ADR은 사후 retrofit X (Surgical Changes — ADR-006).
- 첫 fork 사용자 라운드에서 mutation contract 양식 부담 신호 추적 (ADR-022 evidence 회수).
- D5~D9 중 본문이 *비대*해지는 항목 (특히 D7 — 적용 surface 다수) 은 별도 ADR로 분할 supersede 검토 (ADR-045 D6 기준 amend 4+ 또는 정책 의미 변경 시).

## 참고
- arXiv:2605.18747v1, Ning et al. 2026-05-18, *Code as Agent Harness: Toward Executable, Verifiable, and Stateful Agent Systems*:
  - §1 Harness 정의 (D1 인용 owning)
  - §3.4.2 Planning as Contract Formation (D6 인용 owning)
  - §3.4.3 Sandboxed Execution and Permissioned State Transition (D5 인용 owning)
  - §3.4.4 Verification through Deterministic Sensors (D1 인용 owning)
  - §3.5.1 Deep Telemetry as the Optimization Substrate (D7 인용 owning)
  - §3.5.3 Governed Harness Mutation (D3 인용 owning)
  - §4.1.3 Optimized Workflow Topology for Agentic Coordination (D9 인용 owning)
  - §5.2.1 Harness-Level Evaluation and Oracle Adequacy (D8 인용 owning)
  - §5.2.2 Semantic Verification Beyond Executable Feedback (D8 인용 owning)
  - §5.2.4 Transactional Shared Program State and Semantic Conflict Resolution (D9 인용 owning)
- ADR-005 (SSOT — 본 ADR 영구 파일 인용 SSOT 역할 정합), ADR-017 (dogfood simulation — D4 default), ADR-019 (context-pack), ADR-022 (Ratchet — 정책 강도), ADR-045 (reference contract — Surfaces fan-out), ADR-046 (signal-first).
