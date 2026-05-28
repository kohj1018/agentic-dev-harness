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

### D1. 정체성 명시
본 보일러플레이트는 **"document-driven code-as-agent-harness specialization"**이다.
- *Executability* — `validate` 명령 + AC↔테스트 매핑 + stabilize deterministic preflight가 model 의도를 검증.
- *Inspectability* — validation report / QA_FINDINGS / IMPROVEMENT_GUIDE / ADR이 실패 진단·역추적 가능.
- *Statefulness* — git + 문서 6 layer가 상호작용 history 보존.

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

### D4. Falsifying evaluation의 default
별도 명시가 없으면 falsifying evaluation은 [ADR-017 dogfood simulation](ADR-017-dogfood-simulation.md)의 todo CLI baseline 재실행이다. fork 사용자는 자기 baseline으로 대체 가능.

## Mutation Contract (본 ADR 자체에 적용)
1. **Target** — _ADR_GUIDE.md / AGENTS.md / STRUCTURE.md의 정체성·mutation contract 단락.
2. **Failure mode** — 진화 라운드마다 skill/agent 본문이 수정될 때 회귀 evidence·rollback이 양식화 안 돼 *어느 변경이 어떤 실패를 막았는지* 6개월 뒤 재구성 불가 (관측됨, Phase 진화 라운드 다수).
3. **Predicted improvement** — 새 ADR 본문에 6 필드가 정착되면 fork retrospective에서 *변경 사유 추적 시간* 단축.
4. **Preserved invariants** — 기존 lifecycle 8단계 / validate report 양식 / IMPROVEMENT_GUIDE 스키마 / signal-first cap.
5. **Falsifying evaluation** — `.boilerplate/validation/SIMULATION_RUN.md` 다음 라운드에서 *fork 사용자가 mutation contract 양식이 부담스럽다*는 신호 1+ 회 누적되면 enabling → 약권장 강도 재검토.
6. **Rollback path** — 본 ADR superseded + ADR-005·ADR-022 단편 정의로 복귀.

## 정책 강도 (ADR-022 정합)
**enabling (약) — [외부실증]** (*Code as Agent Harness* survey 인용). 자동 차단 0건. 6 필드 누락 시 reviewer P2 라벨로 보고만.

## 결과
- 본 보일러플레이트의 정체성이 ADR 1개로 명시됨 — fork 사용자가 1 페이지로 "이 보일러는 무엇을 모델링 하는가"를 이해.
- harness 자체를 바꾸는 모든 ADR이 6 필드 mutation contract를 갖춤 → retrospective 추적성 + regression evidence 누적.

## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT)
- AGENTS.md                                                  — 정체성 1줄 link
- docs/00-meta/STRUCTURE.md                                  — Canonical Owner 표
- docs/90-decisions/boilerplate/_ADR_GUIDE.md                — mutation contract 트리거 + 권장 섹션

> README 인덱스(`docs/90-decisions/boilerplate/README.md`)는 *모든 ADR이 1줄 등재*되는 인덱스라 surface 정의(ADR-045 — *cross-surface enforcement*가 필요한 fan-out)에 해당하지 않는다. 인덱스 한 줄 추가는 별도 정상 절차(_ADR_GUIDE "새 ADR 추가 절차" §2).

## 후속 작업
- 다음 보일러플레이트 진화 라운드(Phase 12+)부터 *harness mutation surface*를 건드리는 ADR은 본 contract를 적용. 기존 ADR은 사후 retrofit X (Surgical Changes — ADR-006).
- 첫 fork 사용자 라운드에서 mutation contract 양식 부담 신호 추적 (ADR-022 evidence 회수).

## 참고
- arXiv:2605.18747v1, Ning et al. 2026, *Code as Agent Harness* — §3.5.3 Governed Harness Mutation, §1 Harness 정의.
- ADR-005 (SSOT), ADR-017 (dogfood simulation), ADR-019 (context-pack), ADR-022 (Ratchet), ADR-045 (reference contract), ADR-046 (signal-first).
