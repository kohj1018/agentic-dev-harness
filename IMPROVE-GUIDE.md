# Boilerplate 개선 가이드

## 0. 개요

### Step 목록 (의존성·권장 순서는 아래 인용 참조)
1. **Step 1** — 새 ADR-047 신설 (정체성 + Harness Mutation Contract). 이후 step들이 이 ADR을 인용.
2. **Step 2** — `validate-workitem` Evidence Bundle 추가.
3. **Step 3** — `/repair-plan`·`/repair-discovery` 결정 이력 영속화.
4. **Step 4** — `.claude/settings.json` `defaultMode: "acceptEdits"` 위험 tier 문서화.
5. **Step 5** — ADR-038 evidence label / 배경 갱신 (*Code as Agent Harness* 인용).
6. **Step 6** — TASK_TEMPLATE `## 9. 의존성` minimal 구조화 (병렬 wave 한정).
7. **Step 7** — TASK_TEMPLATE `## 6-1. 테스트 시나리오` 양식 강화 (machine-checkable path resolver).
8. **Step 8** — `stabilize-milestone` Telemetry Aggregate 패널.

> **의존성** (반드시 지킬 선후관계, 2건만): (a) **Step 1이 가장 먼저** — 다른 모든 step이 ADR-047을 인용. (b) **Step 2가 Step 8보다 먼저** — Step 8 telemetry가 Step 2의 Evidence Bundle 신뢰도 분포를 집계.
>
> **번호 = 권장 적용 순서 (효용 우선, 위 의존성 충족)**: Step 2(Evidence Bundle) + Step 3(decision log)가 즉시적 *과신 방지* 효과. Step 8(telemetry)는 Step 2 데이터가 누적된 뒤가 자연스러움 — 가장 후순위. 번호 순서대로 1~8 진행하면 권장 순서가 자동 충족.

### 정책 정합 사전 점검 (모든 step에 공통)
- **새 hard fail/pass gate 0건** — 모든 step은 자동 차단·강제 종료를 추가하지 않는다 (이미 동작하는 lifecycle에 *권장·관측 surface*만 더함). 단 step별 ADR-022 정책 강도(*constraint* vs *enabling*)는 step 본문에서 별도 표기 — 모두가 동일 enabling은 아니며, 일부는 약한 constraint(예: Step 2 신뢰도 자동 강등, Step 6 `write_set` overlap 시 wave 분리)에 해당한다.
- Evidence는 `[외부실증]` 1차 출처로 인용한다. **ADR-022 정의 라벨(`[관측됨]`/`[외부실증]`/`[가설]` + 합성 3종 `[관측됨+외부실증]`/`[가설→실증]`/`[가설→트리거]`) 외 신규 라벨 발명 금지** — 합성이 필요하면 정의 라벨 + prose qualifier로 분리 표현 (Step 5 패턴 참조).
- 커밋은 [ADR-008 Conventional Commits](docs/90-decisions/boilerplate/ADR-008-commit-convention.md)를 따른다. 모든 커밋 메시지 예시는 영어 단일 줄이다.

---

## Step 1. ADR-047 신설 — Code-as-Agent-Harness 패러다임 정합 + Harness Mutation Contract

### 무엇을
- 새 ADR `docs/90-decisions/boilerplate/ADR-047-code-as-agent-harness.md` 추가.
- `docs/90-decisions/boilerplate/README.md` 인덱스에 한 줄 추가.
- `AGENTS.md`에 한 줄 link 추가.
- `docs/00-meta/STRUCTURE.md` Canonical Owner 표에 한 줄 추가.
- `docs/90-decisions/boilerplate/_ADR_GUIDE.md`에 Harness Mutation Contract 트리거 단락 추가.

### 왜
- 본 보일러플레이트의 정체성("docs as shared substrate")이 어느 ADR에도 단일 SSOT로 박혀 있지 않다. ADR-005(SSOT), ADR-019(context-pack), ADR-045(reference contract), ADR-046(signal-first)이 *각자 단편*만 다룬다.
- harness 자체를 바꾸는 변경은 safety-critical runtime 변경처럼 다뤄야 하며, **target / failure-mode / predicted-improvement / preserved-invariants / falsifying-eval / rollback** 6 필드를 요구한다 (*Code as Agent Harness* §3.5.3 Governed Harness Mutation).
- 본 보일러플레이트는 진화 중인 *self-modifying harness* — 이미 ADR-017 dogfood simulation으로 메타 회귀 검사를 하지만, ADR 본문 양식에 mutation contract가 박혀 있지 않아 fork 사용자가 같은 규율을 못 받는다.

### 영향 받는 파일 (repo 루트 기준 상대 경로)
- 신규: `docs/90-decisions/boilerplate/ADR-047-code-as-agent-harness.md`
- 수정: `docs/90-decisions/boilerplate/README.md` (인덱스 표 한 줄 추가)
- 수정: `AGENTS.md` (한 줄 link 추가)
- 수정: `docs/00-meta/STRUCTURE.md` (Canonical Owner 표 한 줄 추가)
- 수정: `docs/90-decisions/boilerplate/_ADR_GUIDE.md` (Harness Mutation Contract 단락 추가)

### 단계별 수행

**1-1) ADR-047 본문 작성** — 다음 내용으로 신규 파일 작성:

```markdown
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
```

**1-2) README 인덱스에 한 줄 추가** — `docs/90-decisions/boilerplate/README.md` 의 ADR 표 마지막 행(현재 ADR-046) 바로 아래에 추가:

```markdown
| 047 | Code-as-Agent-Harness paradigm + Mutation Contract | accepted | — | 정체성 명시 + harness surface 수정 시 6 필드 mutation contract (*Code as Agent Harness* arXiv:2605.18747 §3.5.3) |
```

**1-3) AGENTS.md 한 줄 link 추가** — *"## 깊은 운영 원칙은 다음 문서를 따른다"* 섹션의 마지막 `[ADR 인덱스](docs/90-decisions/README.md)` 줄 *바로 위*에 한 줄 추가:

```markdown
- [Code-as-Agent-Harness 패러다임 + Harness Mutation Contract](docs/90-decisions/boilerplate/ADR-047-code-as-agent-harness.md)
```

AGENTS.md는 *100줄 hard cap* (ADR-011) — 다른 줄이 100 line 근처면 한 줄 제거 또는 cap 검토 필요. 현재 본문 기준 추가는 안전 범위.

**1-4) STRUCTURE.md Canonical Owner 표에 한 줄 추가** — Canonical Owner 표의 마지막 행(현재 ADR-046 행) 바로 아래에 추가:

```markdown
| Code-as-Agent-Harness 패러다임 + Harness Mutation Contract | [ADR-047](../90-decisions/boilerplate/ADR-047-code-as-agent-harness.md) (정책 SSOT). → ADR-047 `## Surfaces` 참조 (fan-out SSOT). |
```

**1-5) _ADR_GUIDE.md 보강** — *"## 권장 섹션"* 목록 끝(`- 후속 작업` 줄 아래)에 한 줄 추가:

```markdown
- Mutation Contract (harness surface 수정 ADR 한정 — 대상 surface 정의: [ADR-047](ADR-047-code-as-agent-harness.md) D3)
```

또한 *"## Ratchet Principle (ADR-022)"* 단락 아래(파일 끝)에 새 단락 추가:

```markdown
## Harness Mutation Contract (ADR-047)

본 ADR이 `.claude/skills` / `.claude/agents` / `AGENTS.md` / `.agents/skills` / `.codex/config.toml` / lifecycle ADR 중 *어느 하나라도* 수정한다면 ([ADR-047](ADR-047-code-as-agent-harness.md) D3 대상 surface), 본문에 `## Mutation Contract` 섹션 6 필드(Target / Failure mode / Predicted improvement / Preserved invariants / Falsifying evaluation / Rollback path)를 명시한다. ADR-022와 양립 — evidence label은 그대로, Mutation Contract는 변경 governance 양식.
```

### 검증 방법
1. `Glob docs/90-decisions/boilerplate/ADR-047*.md` → 파일 1개 존재.
2. `Grep "ADR-047"` on `docs/90-decisions/boilerplate/README.md` → 1행 매치.
3. `Grep "ADR-047"` on `AGENTS.md` → 1행 매치.
4. `Grep "ADR-047"` on `docs/00-meta/STRUCTURE.md` → 1행 매치.
5. `Grep "Mutation Contract"` on `docs/90-decisions/boilerplate/_ADR_GUIDE.md` → 2행 이상 매치(권장 섹션 + 새 단락).
6. AGENTS.md 줄 수 ≤ 100 (ADR-011 hard cap).

### 커밋 메시지 (영어, 1줄)
```
docs(adr): add ADR-047 code-as-agent-harness paradigm and mutation contract
```

---

## Step 2. `validate-workitem` Report Schema — Evidence Bundle 섹션 추가

### 무엇을
- `.claude/skills/validate-workitem/SKILL.md` 의 report 양식에 `## Evidence Bundle` 섹션 추가.
- `.claude/agents/validator.md` 의 출력 형식에 1줄 추가.

### 왜
- 현재 validate-workitem report는 *판정 + AC매핑 + diff trace + spec coverage*까지 잘 박혀 있다. 그러나 **무엇을 검증하지 못했는지(oracle gap)** 가 양식화 안 됨.
- pass/fail 단일 신호는 *과신*을 만든다 — green test = 충분한 검증이라는 착각을 줄여야 한다 (*Code as Agent Harness* §5.2.1 Harness-Level Evaluation and Oracle Adequacy: "evaluation beyond final task success" 가 open problem).
- executable feedback이 *불완전*하다는 사실을 각 verifier가 *선언*해야 한다 (*Code as Agent Harness* §5.2.2 Semantic Verification Beyond Executable Feedback).

### ADR-022 정책 강도
**약한 constraint** — Pass 판정이라도 oracle gap 미명시 시 *신뢰도: Low 자동 강등*. hard fail/pass gate는 아니지만 *report의 신뢰 등급에 영향*. evidence: `[외부실증]` (*Code as Agent Harness* §5.2.1·§5.2.2).

### 영향 받는 파일
- 수정: `.claude/skills/validate-workitem/SKILL.md` (report 양식 + 검증 기준에 한 줄)
- 수정: `.claude/agents/validator.md` (출력 형식에 1줄)

### 단계별 수행

**2-1) validate-workitem SKILL.md report 양식 보강** — 본 SKILL의 *"마지막 단계 — report 파일 작성"* 단락 내 report markdown block에서 `## 다음 권장 액션` 줄 *바로 위*에 다음 섹션을 삽입한다:

```markdown
## Evidence Bundle (*Code as Agent Harness* arXiv:2605.18747 §5.2.1·§5.2.2 oracle adequacy)
<!-- 본 검증 라운드가 *무엇을 봤고 무엇을 못 봤는지* 명시. green test가 곧 충분한 검증이라는 착각을 줄인다. -->

### 검증된 것 (verified)
- 통합 명령 exit code: <0 / non-zero / 미설정>
- AC↔테스트 매핑: M개 ✅ / K개 ❌ (커버리지 %)
- diff trace audit: 추적 가능 N줄, 추적 불가 K줄(카테고리별)
- FAC↔AC spec coverage: <% / 부재>
- 기타 deterministic 점검: <markdown-link-check / static analysis 등 / 해당없음>

### 검증하지 못한 것 (oracle gap)
<!-- 다음 카테고리 중 *본 task의 surface area에 해당하는 것만* 명시. 해당없으면 "해당없음" 한 줄.
     UI 외에도 backend API에 i18n / 접근성 응답이 있으면 본 카테고리도 surface로 본다. -->
- 동시성·race condition 시나리오: <검증 가능 여부 / 가능 시 도구>
- 운영 환경 부하·성능: <검증 가능 여부>
- 외부 서비스 실패·timeout: <mocked / not covered>
- 보안 (인증 우회·권한 escalation·인젝션): <not covered / partial / not applicable>
- 접근성·국제화 (task surface가 해당하면): <not covered / partial / not applicable>
- 회귀: 이전 milestone의 어떤 시나리오를 본 변경이 깰 위험이 있나 — <명시 또는 "관련 없음">

### 신뢰도 (confidence)
<!-- 기준 (정의 — 같은 입력에 같은 판정 보장. 평가 순서: Low → Medium → High 의 *첫 매치* 등급으로 확정):
     - Low (어느 하나라도 매치): 통합 명령 미통과, 또는 oracle gap 카테고리 미명시(누락 카테고리 ≥2), 또는 AC↔테스트 매핑 <70%, 또는 AC↔테스트 ❌ 있음
     - Medium: Low 조건 모두 불일치 + High 조건 중 1~2개 미달 (예: 매핑 70~89% / oracle gap 카테고리 1개 누락)
     - High: 통합 명령 통과 + AC↔테스트 매핑 ≥90% + diff trace audit 통과 + oracle gap 카테고리 모두 명시(해당없음 포함) -->
- 본 판정의 신뢰도: <High / Medium / Low> — <한 줄 근거 (예: "통합 명령 + AC 매핑 100% + diff trace 통과 + 외부 서비스 의존 없음" / "통합 명령만 통과, 동시성·외부 의존 미검증")>
```

**2-2) validate-workitem SKILL.md 검증 기준 단락 보강** — 본 SKILL의 *"검증 기준:"* 목록 끝(현재 마지막 항목은 *Arch-iface audit*)에 한 항목 추가:

```markdown
- **Evidence Bundle 양식 강제** (ADR-047 D1 inspectability 정합): 위 양식의 "검증된 것 / 검증하지 못한 것 / 신뢰도" 3 sub-section을 *모두* 채운다. Pass 판정이라도 oracle gap이 명시 안 되면 *신뢰도: Low*로 강등 (자동 차단 X — report 신뢰 등급만 영향).
```

**2-3) validator.md 출력 형식 보강** — 본 agent의 *"출력 형식:"* 목록에 한 항목 추가 (*"다음 권장 액션"* 줄 *바로 위*):

```markdown
- Evidence Bundle: 검증된 것 / oracle gap (검증하지 못한 것) / 신뢰도 (High|Medium|Low)
```

### 검증 방법
1. `Grep "Evidence Bundle"` on `.claude/skills/validate-workitem/SKILL.md` → 2행 이상 매치.
2. `Grep "oracle gap"` on `.claude/agents/validator.md` → 1행 매치.
3. 임의의 task에 `/validate-workitem`을 돌렸을 때 report에 `## Evidence Bundle` 섹션이 *반드시* 채워진다 (다음 사용 라운드에서 확인).

### 커밋 메시지
```
docs(skills): add Evidence Bundle section to validate-workitem report schema
```

---

## Step 3. `/repair-plan` · `/repair-discovery` — P0/P1 결정 이력 영속화

### 무엇을
- `.claude/skills/repair-plan/SKILL.md` 의 *수행* 단락에 결정 이력 영속화 단계 추가.
- `.claude/skills/repair-discovery/SKILL.md` 의 동일 단락에 동일 변경.
- **영속 위치 (workitem 타입별로 다름 — `## 8` 섹션 의미가 타입별로 다른 점 반영 + open items와 closed decision의 의미 분리)**:
  - **task (T-NNN)**: 해당 task 문서 `## 8. 메모`에 1줄 append.
  - **feature (F-NNN) / milestone (M-N)**: `docs/40-validation/IMPROVEMENT_GUIDE.md`에 *신규 sub-section* `## 5. Repair decision log` 신설 후 그 안에 IMPROVEMENT_GUIDE 스키마로 append (`## 2. 즉시 수정할 항목` / `## 3. 권장 리팩토링`은 *open items*이고 본 결정 이력은 *closed records*라 의미 분리 — feature `## 8`은 NFR, milestone `## 8`은 회고라 결정 이력 영속 위치 아님).
  - **discovery**: `DISCOVERY.md` `## 12. Assumption Tracker` 표 아래 `### Repair history` 보조 단락.

### 왜
- **현재**: repair-plan / repair-discovery는 리뷰 파일 N개를 회수해 4결정(Adopt / Adopt-modified / Reject-false-positive / Reject-conflict)을 내리고 카운트만 출력 후 파일 삭제.
- **GAP**: P0/P1 항목의 *Adopt vs Reject* 결정 근거가 영구 손실 → 6개월 뒤 retrospective에서 "왜 이 리뷰는 reject 했는가" 추적 불가.
- harness state로서 *correction history*는 durable해야 optimization substrate 자격 (*Code as Agent Harness* §3.5.1).
- full review 파일은 ephemeral로 두되 *P0/P1 결정 요약 1줄*만 영속화 — 비용은 작고 추적성은 살림.

### ADR-022 정책 강도
**enabling (약) — [외부실증]** (논문 §3.5.1 durable correction history). 자동 차단 0건. P0/P1 영속 누락 시 reviewer P2 보고만.

### 영향 받는 파일
- 수정: `.claude/skills/repair-plan/SKILL.md`
- 수정: `.claude/skills/repair-discovery/SKILL.md`
- 수정: `docs/30-workitems/_templates/TASK_TEMPLATE.md` (`## 8. 메모`에 안내 주석)
- 수정: `docs/40-validation/IMPROVEMENT_GUIDE.md` (`## 5. Repair decision log` sub-section 신설 + 사용 안내)
- 수정: `docs/10-charter/_templates/DISCOVERY_TEMPLATE.md` (있으면 — assumption tracker 표 끝 안내 주석; 없으면 skip)

### 단계별 수행

**3-1) repair-plan SKILL.md 수행 단계 보강** — 본 SKILL의 *"수행:"* 목록 안 *"5. Adopt / Adopt-modified로 결정된 항목에 대해 workitem 문서를 수정..."* 단계 *다음*, *"6. 삭제 전 사전 조건 점검..."* 단계 *이전*에 새 단계 5-D 삽입 (외부 fence가 4-backtick인 점 주의):

````markdown
5-D. **P0/P1 결정 이력 영속화** (*Code as Agent Harness* arXiv:2605.18747 §3.5.1 durable correction history + ADR-047 D1 inspectability). 본 라운드의 *P0 + P1 항목 전부*에 대해 결정 요약을 영속한다. P2는 영속화 X (cap 보호).

**영속 위치 — workitem 타입별로 다름** (open items와 closed decision의 의미 분리):
- **task (T-NNN)**: 해당 task 문서 `## 8. 메모`에 1줄 append (`## 8`이 자유 메모란).
- **feature (F-NNN)** 또는 **milestone (M-N)**: `docs/40-validation/IMPROVEMENT_GUIDE.md`의 `## 5. Repair decision log` sub-section(없으면 신설)에 IMPROVEMENT_GUIDE 스키마(`ID | severity | evidence | linked workitem | status | decision`)로 append. **`## 2. 즉시 수정할 항목` / `## 3. 권장 리팩토링`에는 박지 않는다** — 이 둘은 *open items*(해야 할 일)이고 결정 이력은 *closed records*(지나간 판단)라 의미가 다르다. (feature `## 8`은 NFR, milestone `## 8`은 회고 — 결정 이력 위치 아님.)

**task scope 영속 형식 (한 줄 = 한 결정)**:
```
- repair-plan <YYYY-MM-DD> [<reviewer-tag>] <severity> <category>: <Adopt|Adopt-modified|Reject-FP|Reject-conflict> — <한 줄 근거 (≤80자)>
```

예 (task):
```
- repair-plan 2026-05-28 [claude-b] P0 Spec-gap: Adopt — FAC-3 매핑 누락이 charter §5 비목표와 직접 충돌
- repair-plan 2026-05-28 [codex] P1 Plan-design: Reject-FP — 리뷰어가 본 DESIGN.md 이전 버전 참조
```

**feature/milestone scope 영속 형식** (IMPROVEMENT_GUIDE 스키마 정합 — `docs/40-validation/IMPROVEMENT_GUIDE.md` 본문 `## 항목 스키마` SSOT):
```
- **F-001-repair-1** | P0 | [관측됨] | linked: F-001 | status: applied | decision: Adopt
  - 발견 (cross-LLM review <reviewer-tag>): <한 줄 설명>.
  - 결정: <Adopt|Adopt-modified|Reject-FP|Reject-conflict 사유 한 줄>.
```

ID 컨벤션: `<workitem-id>-repair-<N>` (예: `F-001-repair-1`, `M1-repair-2`) — workitem ID 그대로 prefix + `-repair-` + 본 라운드 시퀀스. `linked workitem` 필드로 원본 workitem 역참조. **evidence label은 기본 `[관측됨]`** — finding 자체가 리뷰어의 *로컬 문서 관측*에서 나왔으므로. cross-LLM peer review *방식* 자체의 외부실증은 ADR-038 본문에 박혀 있고, 본 finding의 label과는 별개.
````

**3-2) repair-plan SKILL.md 마지막 출력 단락 보강** — 본 SKILL의 *"마지막 출력:"* 목록 안 *"수정된 workitem 문서 목록 (상대 경로)"* 줄 *바로 다음*에 한 줄 추가:

```markdown
- **결정 이력 영속화 결과**: P0+P1 합 append 줄 수 + 영속 위치 (task scope면 task `## 8`, feature/milestone scope면 `IMPROVEMENT_GUIDE.md` `## 5. Repair decision log`).
```

**3-3) repair-discovery SKILL.md 수행 단계 보강** — 본 SKILL의 *"수행:"* 목록 안 *"4. Adopt/Adopt-modified 항목을 DISCOVERY.md에 반영..."* 단계 *바로 다음*에 새 sub-step 추가:

```markdown
4-D. **P0/P1 결정 이력 영속화** (*Code as Agent Harness* arXiv:2605.18747 §3.5.1 + ADR-047 D1): 본 라운드의 P0+P1 결정을 DISCOVERY.md `## 12. Assumption Tracker` *표 끝 아래의 보조 단락* `### Repair history`(없으면 신설)에 한 줄씩 append. 형식: `- repair-discovery <YYYY-MM-DD> [<reviewer-tag>] <severity> <category>: <결정> — <근거 ≤80자>`. P2는 영속 X.
```

**3-4) repair-discovery SKILL.md 마지막 출력 보강** — 본 SKILL의 *"마지막 출력:"* 한 줄 인라인 항목 목록 안 *"수정된 DISCOVERY 섹션"* 토큰 *바로 다음*에 다음 토큰을 추가(`/` 구분자 유지):

```
/ 결정 이력 영속화 (§12 Repair history append 줄 수)
```

**3-5) TASK_TEMPLATE.md `## 8. 메모` 안내 주석 추가** — `## 8. 메모` 헤더 줄 *바로 다음*에 다음 HTML 주석 한 줄 추가:

```markdown
<!-- task scope /repair-plan이 본 라운드의 P0/P1 결정을 1줄씩 append하는 영속 위치 (ADR-047 D1 inspectability). feature/milestone scope는 IMPROVEMENT_GUIDE.md `## 5. Repair decision log`로 라우트. 그 외 메모도 자유. -->
```

**3-6) IMPROVEMENT_GUIDE.md `## 5. Repair decision log` sub-section 신설** — `docs/40-validation/IMPROVEMENT_GUIDE.md` 파일 끝(`## 4. 보류 항목` 아래)에 새 sub-section 추가:

```markdown

## 5. Repair decision log

`/repair-plan`이 feature(F-NNN) 또는 milestone(M-N) 단위로 호출됐을 때 본 라운드의 P0+P1 결정을 영속 기록하는 자리 (ADR-047 D1 inspectability). `## 2. 즉시 수정할 항목` / `## 3. 권장 리팩토링`과 의미 분리 — 이 두 섹션은 *open items*이고 본 섹션은 *closed records*(지나간 판단).

- task scope (T-NNN) 결정은 해당 task `## 8. 메모`에 직접 append — 본 섹션 아님.
- ID 컨벤션: `<workitem-id>-repair-<N>` (예: `F-001-repair-1`, `M1-repair-2`).
- evidence label은 기본 `[관측됨]` (finding 자체는 리뷰어의 *로컬 문서 관측*에서 나옴 — cross-review 방식의 외부실증은 ADR-038 본문이 owning).
- 형식은 본 파일 `## 항목 스키마` SSOT 따름.

<!-- 마일스톤별 그룹핑(`### M1`, `### M2`)은 `/repair-plan`이 *첫 호출 시* 해당 마일스톤 헤더를 자동 신설하고 그 아래에 append. /stabilize-milestone은 본 sub-section을 *추가하거나 수정하지 않음* — /repair-plan만 직접 append. 본 ## 5 sub-section은 *신설 시 헤더 + 본 안내 주석만* 두고 `### M-N` 그룹은 비워둔다. -->
```

**3-7) (선택) DISCOVERY_TEMPLATE.md** — `Glob docs/10-charter/_templates/DISCOVERY_TEMPLATE.md`로 존재 확인. 존재하면 `## 12. Assumption Tracker` 표 아래에 다음 안내 주석:

```markdown
<!-- /repair-discovery가 본 라운드의 P0/P1 결정을 1줄씩 append하는 `### Repair history` 보조 단락이 본 §12 표 아래에 들어선다 (ADR-047 D1 + ADR-044 정합). -->
```

존재하지 않으면 본 sub-step skip (template 신설은 본 step 범위 밖).

### 검증 방법
1. `Grep "5-D"` on `.claude/skills/repair-plan/SKILL.md` → 1행 매치.
2. `Grep "결정 이력 영속화"` on `.claude/skills/repair-plan/SKILL.md` → 2행 이상 매치.
3. `Grep "workitem 타입별로 다름"` on `.claude/skills/repair-plan/SKILL.md` → 1행 매치 (per-type 분기 정합).
4. `Grep "4-D"` on `.claude/skills/repair-discovery/SKILL.md` → 1행 매치.
5. `Grep "Repair history"` on `.claude/skills/repair-discovery/SKILL.md` → 1행 이상 매치.
6. `Grep "task scope /repair-plan"` on `docs/30-workitems/_templates/TASK_TEMPLATE.md` → 1행 매치.
7. `Grep "Repair decision log"` on `docs/40-validation/IMPROVEMENT_GUIDE.md` → 2행 이상 매치 (sub-section 헤더 + 본문).

### 커밋 메시지
```
docs(skills): persist P0/P1 decision log in repair-plan and repair-discovery
```

---

## Step 4. `.claude/settings.json` `defaultMode` 위험 tier 문서화

### 무엇을
- `docs/00-meta/GUARDRAILS_STRATEGY.md` 에 새 `## defaultMode 위험 tier` 단락 추가 — `## shared 기본값에 포함하지 않는 것` 단락 *바로 위*에 삽입.
- 단락 내용: acceptEdits 정당화 + 4 모드별 위험 tier 표 + fork 사용자 대체 경로.
- 옵션 A vs B: **옵션 A — 정당화 단락 추가**를 default로 박는다 (보일러플레이트 *기본값을 깨면* fork 사용자 회귀 위험). 옵션 B(shared `defaultMode` 제거 + local 권장 강화)는 fork 사용자가 선택. 옵션 B 절차는 4-1 단락의 *fork 사용자 대체 경로* 가 안내.
- `.claude/settings.json` 자체는 본 step에서 변경 안 함 (4-2 참조).

### 왜
- **현재**: `.claude/settings.json` 의 `defaultMode: "acceptEdits"` 는 shared(공통)으로 박혀 있어 fork 후 모든 환경에서 *기본 자동 수락*.
- **GAP**: multi-tier permission이 harness state임에도(*Code as Agent Harness* §3.4.3 Sandboxed Execution and Permissioned State Transition), acceptEdits를 shared로 두는 결정의 *위험 tier*가 ADR / 문서에 명시되어 있지 않다 — fork 사용자가 안전 trade-off를 모른 채 그대로 채택.
- *기본 모드 변경은 보일러플레이트 회귀 위험 큼* — *문서화*만 박고 사용자 결정에 맡긴다.

### ADR-022 정책 강도
**enabling (약) — [외부실증]** (논문 §3.4.3). doc-only. 자동 차단 0건. `.claude/settings.json` 본문 변경 없음.

### 영향 받는 파일
- 수정: `docs/00-meta/GUARDRAILS_STRATEGY.md`
- (수정 안 함) `.claude/settings.json` — 본 step에서는 *변경 없음*. fork 사용자가 명시 결정 시 변경.

### 단계별 수행

**4-1) GUARDRAILS_STRATEGY.md 위험 tier 단락 추가** — `## shared 기본값에 포함하지 않는 것` 헤더 줄 *바로 위*에 다음 단락을 삽입한다:

```markdown
## defaultMode 위험 tier (ADR-047 D2 sandboxed execution 정합)

`.claude/settings.json` 의 `defaultMode` 는 *agent의 edit/write 기본 수락 모드*를 결정한다. 본 보일러플레이트는 shared 기본값으로 `"acceptEdits"` 를 박고 있다 — 다음 정당화·위험 tier·대체 경로를 명시한다.

| 모드 | 행동 | 위험 tier | 본 보일러 적용 |
|------|------|----------|--------------|
| `default` | 모든 Write/Edit 마다 confirm | 낮음 | — |
| `acceptEdits` | Write/Edit 자동 수락, Bash·MCP는 confirm | **중간** | **shared 기본값** |
| `bypassPermissions` | 모든 도구 자동 수락 | 높음 | local-only 권장 (절대 shared X) |
| `plan` | 읽기 전용 | 매우 낮음 | 사용자 명시 선택 |

**`acceptEdits` shared 정당화**:
- 본 보일러플레이트의 lifecycle(plan→implement→validate→repair→finalize→stabilize)이 모든 변경을 *후속 validate에서 검증*한다 (deterministic sensor, *Code as Agent Harness* arXiv:2605.18747 §3.4.4). 즉 mid-stream confirm을 빼도 끝단 validator가 catch.
- 비-acceptEdits 모드에서는 builder가 매 Edit마다 confirm으로 중단 — RGR 사이클이 사실상 불가능해 보일러 디폴트와 충돌.

**`acceptEdits`의 잔여 위험**:
- builder가 *task 범위 밖* Write/Edit를 자동 수락 — validator의 diff trace audit(ADR-006#amend-1)으로 후행 catch. 하지만 *비가역 파괴*는 후행 catch가 무의미.
- 민감 파일 접근은 `permissions.deny`(현재 `.env`/`secrets/**`)에 박혀 있어 차단되지만, *프로젝트 외부 경로* 작업은 별도 sandbox 책임.

**fork 사용자 대체 경로** (옵션 B):
- shared `defaultMode` 제거 + `.claude/settings.local.json` 에 개발자 본인의 모드 설정. 팀 차원의 강제는 *프로젝트 자체 정책 ADR-100+* 으로 박을 것.
- bypassPermissions 사용은 *로컬 only*. shared로 절대 박지 않는다.

**참고**: Claude Code 공식 [문서](https://code.claude.com/docs) 의 permission modes 절 + ADR-047 D2 (multi-tier permission as harness state).
```

**4-2) (선택, 미적용)** `.claude/settings.json` 자체 수정은 본 step에서 *하지 않는다*. fork 사용자가 옵션 B를 채택할 때 4-1 단락의 *fork 사용자 대체 경로* 가 절차 안내 역할.

### 검증 방법
1. `Grep "defaultMode 위험 tier"` on `docs/00-meta/GUARDRAILS_STRATEGY.md` → 1행 매치.
2. `Grep "bypassPermissions"` on `docs/00-meta/GUARDRAILS_STRATEGY.md` → 2행 이상 매치.
3. `.claude/settings.json` 본문 변경 없음 (정합 확인).

### 커밋 메시지
```
docs(guardrails): document defaultMode acceptEdits risk tier and fork override path
```

---

## Step 5. ADR-038 — Evidence 보강 (*Code as Agent Harness* 인용)

### 무엇을
- `docs/90-decisions/boilerplate/ADR-038-cross-llm-plan-validation.md` 의 `## 배경` 첫 번째 [가설] 줄에 *Code as Agent Harness* §4.1.2 인용 추가.
- evidence label은 *기존 `[가설→실증]` 유지* — ADR-022 정의 합성 라벨(`[관측됨+외부실증]`/`[가설→실증]`/`[가설→트리거]`) 외 신규 라벨 발명 금지. prose로 *외부실증 구성요소*와 *가설 구성요소*를 분리 명시.

### 왜
- **현재**: ADR-038 `## 배경` 첫 [가설] 줄이 *"구체 출처 미인용 — [가설] 단일 라벨"* 이라고 명시.
- *Code as Agent Harness* §4.1.2 (Diverse Interaction Modes Grounded in Shared Program State)가 critique-and-repair / adversarial validation / reasoning debate 패턴을 survey로 정리 — ADR-038이 인용할 외부실증 1차 자료가 마련됨.
- *opt-in 정책은 유지* — 강제 변경 X. evidence label과 배경 인용만 갱신.

### ADR-022 정책 강도
**enabling (약) — [가설→실증]** (라벨 유지). 본 step은 *기존 ADR-038 본문 갱신*이라 강도 변경 없음.

### 영향 받는 파일
- 수정: `docs/90-decisions/boilerplate/ADR-038-cross-llm-plan-validation.md`

### 단계별 수행

**5-1) `## 배경` 첫 [가설] 줄 보강** — ADR-038 `## 배경`의 *첫 번째* `[가설] multi-model ensembling / peer review가 단일 모델 blind spot을 회수한다...` 시작 줄 한 줄을 다음 두 줄로 교체:

```markdown
- [외부실증] Ning et al. 2026, *Code as Agent Harness* (arXiv:2605.18747v1) §4.1.2 (Diverse Interaction Modes Grounded in Shared Program State) — critique-and-repair, adversarial validation, reasoning debate 패턴을 survey로 정리. 본 ADR의 cross-LLM peer review 패턴이 *survey-level 외부실증* 자격.
- [가설] 다중 모델 *동등 효과*의 정량 측정은 본 ADR 단계에서 미실시 — opt-in 정책 유지의 근거는 *비용/효용 비율을 사용자가 선택*하는 ADR-022 enabling 정합.
```

**5-2) `## 정책 강도 (ADR-022 정합)` evidence label 보강** — `## 정책 강도 (ADR-022 정합)` 단락 안 `- Evidence label: `[가설→실증]`...` 시작 줄 한 줄을 다음으로 교체 (라벨 자체는 기존 `[가설→실증]` 유지 — ADR-022 정의 외 신규 합성 라벨 발명 금지. prose 분리만 변경):

```markdown
- Evidence label: `[가설→실증]` (ADR-022 합성 표기 유지). **외부실증 구성**: (a) Ning et al. 2026, *Code as Agent Harness* (arXiv:2605.18747v1) §4.1.2 — cross-LLM peer review 패턴이 외부 survey-level 실증으로 자격. (b) Claude Code worktree 공식 docs. **가설 구성**: 본 보일러플레이트에서의 *정량적 효과 측정*은 미실시 — [관측됨] 0건. Phase 시뮬레이션 통과 후 [관측됨]으로 승격 예정. Ratchet 약 적용 유지.
```

**5-3) `## 참고` 단락 보강** — ADR-038 `## 참고` 목록 마지막(현재 `- ADR-037 (Spec coverage — ...)` 줄) 바로 아래에 한 줄 추가:

```markdown
- Ning et al. 2026, *Code as Agent Harness* (arXiv:2605.18747v1) §4.1.2 — cross-review 패턴 survey-level evidence.
```

**5-4) (조건부) Mutation Contract 추가** — Step 1의 ADR-047 D3에 따라 ADR-038은 *lifecycle ADR*이므로 mutation contract 대상. 단 *기존 ADR retrofit X* (ADR-006 Surgical Changes). 그러므로 본 step에서 mutation contract 섹션은 추가 *하지 않는다*. ADR-047 후속 작업 단락이 *Phase 12+ 이후 새 amend* 부터 적용을 명시 — 본 Step 5는 evidence 갱신만.

### 검증 방법
1. `Grep "Ning"` on `docs/90-decisions/boilerplate/ADR-038-cross-llm-plan-validation.md` → 2행 이상 매치 (`## 배경` + `## 참고`).
2. `Grep "외부실증 구성"` on `docs/90-decisions/boilerplate/ADR-038-cross-llm-plan-validation.md` → 1행 매치 (`## 정책 강도` prose 분리 정합).
3. `Grep "2605.18747"` on `docs/90-decisions/boilerplate/ADR-038-cross-llm-plan-validation.md` → 2행 이상 매치.
4. `Grep "\\[가설→실증, 외부실증 부분\\]"` on `docs/90-decisions/boilerplate/ADR-038-cross-llm-plan-validation.md` → 0행 매치 (신규 라벨 발명 금지 정합).

### 커밋 메시지
```
docs(adr): cite Code as Agent Harness paper in ADR-038 background and evidence label
```

---

## Step 6. TASK_TEMPLATE `## 9. 의존성` — Minimal 구조화 (선택, 병렬 wave 한정)

### 무엇을
- `docs/30-workitems/_templates/TASK_TEMPLATE.md` 의 `## 9. 의존성` 주석에 *선택* 5필드 구조화 옵션 추가.
- `.claude/skills/plan-workitem/SKILL.md` 의 wave 계산 단계(11-(a))에 구조화 필드 *우선* fallback 명시.
- **Owning ADR 정합**: TASK_TEMPLATE `## 9` schema 변경 = **ADR-026** owning (plan-workitem schema), plan-workitem wave 계산 변경 = **ADR-038#d3** owning. 본 step은 *두 ADR의 amend / Surfaces 동기*를 동반한다 (6-4 참조).

### 왜
- **현재**: `## 9. 의존성`은 자연어 1줄 (`- T-002: T-001의 X 정의 후 시작 가능`). plan-workitem이 *콜론 뒤 자연어*에서 `T-[0-9]+` 패턴을 grep해 위상 정렬 — false-positive/negative 가능 (ADR-038#d3 본문도 인정).
- **GAP**: 병렬 wave 계산이 brittle. 같은 파일 race / read-set / write-set / verifier obligation을 자연어에서 추출 불가. 또한 ADR-038#d3은 "file overlap 점검은 plan-workitem에서 제외 — 외부 LLM peer review에 전적 위임" 정책인데, *명시적 write_set*은 free-form이 아닌 *deterministic input*이므로 이 면제 범위 밖이라 정정 필요.
- agent별 *read-set / write-set / assumptions / verifier*를 구조화하면 wave 계산 + conflict review 안정성 ↑ (*Code as Agent Harness* §4.1.3 Optimized Workflow Topology + §5.2.4 Shared State).
- *전면 YAML화는 과함* — *병렬 실행 대상 task에만* 5줄 옵션 허용. 단일 task / 순차 task는 자연어 1줄 그대로.

### ADR-022 정책 강도
**약한 constraint** — 5 필드 자체는 opt-in (enabling)이지만, `write_set` overlap이 있는 task 쌍은 plan-workitem이 *자동 wave 분리*한다 (file race 회피). hard fail/pass gate는 아니지만 *agent가 자동으로 wave를 분리하는 행위*가 추가됨. evidence: `[외부실증]` (논문 §4.1.3 / §5.2.4) + `[관측됨]` (ADR-038#d3 자연어 grep brittle 자체 인정).

### 영향 받는 파일
- 수정: `docs/30-workitems/_templates/TASK_TEMPLATE.md` (`## 9. 의존성` 주석)
- 수정: `.claude/skills/plan-workitem/SKILL.md` (단계 11-(a) wave 계산)
- 수정: `docs/90-decisions/boilerplate/ADR-026-plan-workitem-schema.md` (Surfaces 동기 또는 amend — TASK_TEMPLATE `## 9` schema 변경 owning)
- 수정: `docs/90-decisions/boilerplate/ADR-038-cross-llm-plan-validation.md` (#d3 정정 amend — 명시적 `write_set` overlap은 deterministic input 허용)

### 단계별 수행

**6-1) TASK_TEMPLATE.md `## 9. 의존성` 주석 보강** — `## 9. 의존성` 헤더 줄 + 그 아래 기존 HTML 주석 한 줄(현재 본문: `<!-- 형식: `- T-002: T-001의 X 정의 후 시작 가능`. 비어 있으면 병렬 가능으로 간주. -->`) 전체를 다음으로 교체:

```markdown
## 9. 의존성
<!-- 기본(자연어): `- T-002: T-001의 X 정의 후 시작 가능`. 비어 있으면 병렬 가능으로 간주.

     선택(구조화, 병렬 wave 대상 task 한정 — ADR-026 schema + ADR-038#d3 정정 + *Code as Agent Harness* arXiv:2605.18747 §4.1.3/§5.2.4):
     자연어 1줄 *대신* 또는 *아래에* 다음 5필드를 박을 수 있다. 5필드는 plan-workitem wave 계산이 *우선 사용*, 부재 시 자연어 grep fallback.

     - depends_on: [T-001, T-003]          # 명시적 task ID 목록 — 자연어 grep 대신 결정적 dep
     - read_set: ["src/auth/**", "docs/20-system/ARCHITECTURE_OVERVIEW.md"]   # 본 task가 *읽기*만 하는 경로 glob
     - write_set: ["src/auth/me.ts", "tests/auth/me.spec.ts"]                  # 본 task가 *쓰는* 경로 glob — 다른 task의 write_set과 교집합 있으면 wave 분리
     - assumptions: ["JWT secret env 변수가 이미 설정됨"]                       # 본 task가 시작 시 *가정하는* 외부 상태 1~3개
     - verifier: "jest tests/auth/me.spec.ts"                                  # 본 task 완료 판정의 deterministic 명령 (선택, 비우면 통합 validate에 위임)

     구조화 사용 권장 케이스:
     - 같은 wave에 들어갈 task가 3개 이상.
     - read_set/write_set이 모호해 file race 우려.
     - 단순 순차 작업이면 자연어 1줄 그대로 — 본 5필드를 강제하지 않는다 (ADR-022 enabling 약). -->
```

**6-2) plan-workitem SKILL.md 단계 11-(a) 우선순위 명시** — 본 SKILL의 *"11-(a) **위상 정렬 (결정적 알고리즘)**:"* 단락 끝(같은 단락의 마지막 문장 뒤)에 다음 줄 추가:

```markdown
   *우선순위* (ADR-047 D1 + *Code as Agent Harness* §4.1.3): 본 task `## 9. 의존성`에 *구조화 필드*(`depends_on:` / `write_set:` 등)가 있으면 자연어 grep 대신 구조화 필드를 결정적으로 사용. `depends_on:` 부재 + 자연어 1줄만 있으면 기존 grep fallback. `write_set:` 교집합이 있는 task 쌍은 *같은 wave에 두지 않는다* — 자동 wave 분리 + 출력에 *file race* 한 줄 명시.
```

**6-3) plan-workitem SKILL.md 단계 11-(b) lockfile race 보강** — 본 SKILL의 *"11-(b) **lockfile race 경고**:"* 단락 끝(같은 단락의 마지막 문장 뒤)에 한 줄 추가:

```markdown
   *write_set 우선* (ADR-047 D1): task의 `write_set:`이 박혀 있으면 manifest/lock 파일 grep 대신 *write_set의 매치*로 판정 (예: `write_set`에 `pnpm-lock.yaml`이 있으면 단독 wave). write_set 부재 시 기존 manifest/lock 토큰 grep fallback.
```

**6-4) ADR owning 동기 — ADR-026 Surfaces + ADR-038#d3 정정 amend** — *TASK_TEMPLATE `## 9` schema 변경*은 ADR-026 owning이므로 ADR-026 `## Surfaces` 블록(부재 시 `## 후속 작업` 직전에 신설)에 `docs/30-workitems/_templates/TASK_TEMPLATE.md — ## 9 의존성 구조화 5필드` 한 줄 추가 (또는 ADR-026 amend로 schema 확장 명시 — ADR-045 D6 기준 정책 의미 변경이면 amend, 단순 surface 추가면 Surfaces 블록만). 또한 ADR-038 본문에 다음 amend 추가:

```markdown
<a id="adr-038-amend-3"></a>
## Amendment 3 — file overlap 정책 정정 (free-form 제외, 명시적 write_set 허용)

D3 의 *"file overlap 점검은 plan-workitem에서 제외 — 외부 LLM peer review에 전적 위임"* 정책은 **TASK_TEMPLATE `## 4-1. 변경 예정 파일/경로`(implement 시점 채움 — plan 시점에는 빈 상태)에 기반한 free-form file overlap** 한정으로 정정한다. **명시적 `write_set:` 구조화 필드**(TASK_TEMPLATE `## 9. 의존성` 안 — ADR-026 schema 확장으로 plan 시점 deterministic input)는 본 면제 범위 밖이며, plan-workitem은 `write_set` 교집합을 *결정적으로 검출해 wave 분리*한다 (ADR-047 D1 inspectability 정합). 본 amend는 *deterministic 부분만 회수* — 자연어 dep / `## 4-1` 기반 추측은 여전히 외부 peer review 책임.
```

### 검증 방법
1. `Grep "depends_on:"` on `docs/30-workitems/_templates/TASK_TEMPLATE.md` → 1행 매치.
2. `Grep "read_set:"` on `docs/30-workitems/_templates/TASK_TEMPLATE.md` → 1행 매치.
3. `Grep "write_set:"` on `.claude/skills/plan-workitem/SKILL.md` → 1행 이상 매치.
4. `Grep "amend-3"` on `docs/90-decisions/boilerplate/ADR-038-cross-llm-plan-validation.md` → 1행 이상 매치 (#d3 정정 amend 정합).
5. `Grep "TASK_TEMPLATE"` on `docs/90-decisions/boilerplate/ADR-026-plan-workitem-schema.md` → 1행 이상 매치 (Surfaces 블록 또는 amend 본문에 TASK_TEMPLATE `## 9` 등재 확인 — 사람이 직접 위치 확인).
6. 기존 task(자연어 1줄)에 변경 없이 작동 — fallback 경로 유지.

### 커밋 메시지
```
docs(templates): allow optional structured deps in TASK_TEMPLATE for parallel waves
```

---

## Step 7. TASK_TEMPLATE `## 6-1. 테스트 시나리오` 양식 강화 — machine-checkable path resolver

### 무엇을
- `docs/30-workitems/_templates/TASK_TEMPLATE.md` 의 `## 6-1. 테스트 시나리오` 주석에 *machine-checkable path 형식* (`<runner>::<file>::<test-id>`) 권장 한 줄 추가.
- `.claude/skills/validate-workitem/SKILL.md` 의 AC↔테스트 매핑 단락에 *path 형식 우선 resolve* 한 줄 추가.
- **재설계 사유**: 초기 제안은 `## 6. AC` 본문 옆에 별도 `verify:` hook 줄을 박는 것이었으나, 이는 기존 `## 6-1. 테스트 시나리오`와 *동일 정보를 박는 SSOT 중복*(ADR-005 위반 anti-pattern)이라 폐기. 대신 `## 6-1`을 *그 자체로 machine-checkable*하게 강화하는 방향으로 변경.
- **Owning ADR 정합**: AC ↔ 테스트 식별자 형식은 **ADR-009 amend-1** 영역 (테스트 이름에 `AC_N`/`[AC-N]` 식별자 포함 권장). 본 step은 ADR-009 amend 또는 Surfaces 동기를 동반한다 (7-4 참조).

### 왜
- 계획이 *executable preconditions/postconditions*를 형성해야 verification이 deterministic해진다 (*Code as Agent Harness* §3.4.2 Planning as Contract Formation).
- 현재 `## 6-1. 테스트 시나리오` 양식 예시: `- AC-1 → tests/auth/me.spec.ts > test_AC_1_unauthenticated_returns_401`. 이미 *path + 테스트 이름*을 박는 자리지만, validator가 자연어 매칭 휴리스틱 (`AC_N` substring grep)에 의존 — 같은 정보를 deterministic resolver로 쓸 수 있는데 surfacing 부족.
- `<runner>::<file>::<test-id>` 형식을 권장하면 validator가 *path 직접 resolve* 가능. 기존 `→` 자연어 양식도 fallback 보존.
- ADR-022 enabling (약) — opt-out 자유. 강제 0건. 적은 부담으로 결정적 검증이 가능.

### ADR-022 정책 강도
**enabling (약) — [외부실증]** (논문 §3.4.2). 자동 차단 0건. path 형식 부재 시 자연어 fallback 유지.

### 영향 받는 파일
- 수정: `docs/30-workitems/_templates/TASK_TEMPLATE.md` (`## 6-1. 테스트 시나리오` 주석)
- 수정: `.claude/skills/validate-workitem/SKILL.md` (AC↔테스트 매핑 단락 한 줄)
- 수정: `docs/90-decisions/boilerplate/ADR-009-tdd-default.md` (amend 또는 Surfaces 동기 — AC ↔ 테스트 식별자 형식 owning)

### 단계별 수행

**7-1) TASK_TEMPLATE.md `## 6-1. 테스트 시나리오` 주석 보강** — `## 6-1. 테스트 시나리오` 헤더 바로 아래 HTML 주석 블록 안의 마지막 예시 줄(`- AC-2 → tests/auth/me.spec.ts > test_AC_2_authenticated_returns_user -->`)에서 닫는 `-->` 토큰 *직전*(같은 줄의 `-->` 앞에서 줄바꿈)에 다음 본문을 삽입한다. 즉 기존 `- AC-2 → ... ` 다음에 새 본문이 들어가고 그 뒤에 `-->`가 위치한다 (HTML 주석 블록 안에 새 본문이 포함되도록):

```
     - 선택 — machine-checkable path 형식 (*Code as Agent Harness* arXiv:2605.18747 §3.4.2 contract formation 정합 + ADR-047):
       기존 `- AC-N → <file> > <test-name>` 자연어 양식 *대신* `- AC-N → <runner>::<file>::<test-id>` 형식을 박을 수 있다.
       runner는 jest|pytest|go|cargo 등 — 실제 실행 가능한 명령으로 채울 것.
       예: `- AC-1 → jest::tests/auth/me.spec.ts::test_AC_1_unauthenticated_returns_401`
       채워져 있고 *placeholder가 아니면* /validate-workitem이 path 우선 resolve.
       채워지지 않으면 기존 자연어 양식(`→ <file> > <test-name>`) 그대로 — 강제 X.
       **angle-bracket placeholder(`<runner>` 등)만 남기는 것 금지** — 안 채울 거면 자연어 양식으로 작성. 잔존 placeholder는 validator가 *미설정*으로 간주하고 자연어 매칭 fallback하지만, report에 P2 라벨로 기록.
```

**7-2) TASK_TEMPLATE.md `## 6. Acceptance Criteria` 예시 줄 — 변경 없음** — `## 6. AC` 예시는 그대로 둔다 (verify: hook을 AC 본문 옆에 박는 초기 안은 폐기됨 — `## 6-1`이 SSOT). `## 6` 본문에는 verify hook 관련 줄을 *추가하지 않는다*.

```markdown
- AC-1 [Given] ... [When] ... [Then] ...
- AC-2 [Given] ... [When] ... [Then] ...
```

**7-3) validate-workitem SKILL.md AC↔테스트 매핑 우선순위 명시** — *"검증 기준:"* 목록 안의 *"AC ↔ 테스트 매핑"* 항목 *바로 다음*에 두 줄(들여쓰기 sub-bullet)을 추가:

```markdown
  - `## 6-1. 테스트 시나리오` 항목이 `→ <runner>::<file>::<test-id>` 형식이고 *값에 angle-bracket placeholder(`<...>`)가 포함되지 않으면* path 우선 resolve (deterministic, ADR-047 D1 inspectability + *Code as Agent Harness* §3.4.2 contract formation).
  - 값에 `<runner>` / `<file>` / `<test-id>` 같은 angle-bracket placeholder가 잔존하면 *미설정*으로 간주 + 본 report에 P2 `[verify-placeholder]` 라벨로 기록 — 기록 위치: *Needs Fix 판정 시* `## 실패 항목` 하단에 한 줄, *Pass 판정 시* `## Evidence Bundle` 의 *검증된 것* sub-section 하단에 한 줄(`## 실패 항목`은 Needs Fix일 때만 존재하므로). 자연어 매칭 fallback으로 계속 진행 (validate-workitem 책임 경계 정합 — IMPROVEMENT_GUIDE 직접 append는 stabilize-milestone이 reviewer 결과 받아 적는 영역).
```

**7-4) ADR owning 동기 — ADR-009 amend 또는 Surfaces 추가** — *AC ↔ 테스트 식별자 형식*은 ADR-009 amend-1 영역 ("테스트 이름에 `AC_N` 또는 `[AC-N]` 식별자 포함 강력 권장"). 본 step의 `<runner>::<file>::<test-id>` 형식 권장은 ADR-009 양식 확장이므로 ADR-009에 다음 중 하나를 적용:
- 옵션 A — Surfaces 동기: ADR-009 `## Surfaces` 블록(부재 시 `## 후속 작업` 직전에 신설)에 `docs/30-workitems/_templates/TASK_TEMPLATE.md — ## 6-1 테스트 시나리오 path 형식 권장` 한 줄 추가.
- 옵션 B — Amendment: ADR-009 본문 끝에 `## Amendment N — ## 6-1 테스트 시나리오 path 형식 권장` 신규 amend (machine-checkable path resolver는 `AC_N` 식별자 권장의 자연 확장임을 명시).

본 가이드는 *옵션 A (Surfaces 동기)*를 default로 권장 — amend는 정책 의미 변경 시(ADR-045 D6 기준). 본 step은 기존 권장의 *양식 확장*이라 Surfaces 추가가 적절.

### 검증 방법
1. `Grep "machine-checkable path"` on `docs/30-workitems/_templates/TASK_TEMPLATE.md` → 1행 이상 매치.
2. `Grep "^\s*verify:"` on `docs/30-workitems/_templates/TASK_TEMPLATE.md` → 0행 매치 (초기 안 `verify:` hook 줄을 `## 6. AC` 본문 옆에 박지 않았음 정합 — `## 6-1`에는 `→ <runner>::<file>::<test-id>` 형식만 권장이고 `verify:` prefix는 쓰지 않음).
3. `Grep "verify-placeholder"` on `.claude/skills/validate-workitem/SKILL.md` → 1행 매치.
4. `Grep "TASK_TEMPLATE"` on `docs/90-decisions/boilerplate/ADR-009-tdd-default.md` → 1행 이상 매치 (Surfaces 블록 또는 amend 본문에 `## 6-1` 등재 확인 — 사람이 직접 위치 확인).
5. 기존 task 호환 — `## 6-1`이 자연어 양식(`→ <file> > <test>`)이면 자연어 매칭 fallback 그대로 작동.

### 커밋 메시지
```
docs(templates): strengthen TASK_TEMPLATE 6-1 test-path format for deterministic AC mapping
```

---

## Step 8. `stabilize-milestone` Telemetry Aggregate 패널

### 무엇을
- `.claude/skills/stabilize-milestone/SKILL.md` 의 최종 출력(단계 8) *직전*에 telemetry aggregate block을 추가.

### 왜
- 단순 fail/pass가 아니라 *수치·분포·추이*가 harness 진화의 substrate (*Code as Agent Harness* §3.5.1 Deep Telemetry as Optimization Substrate).
- 현재 stabilize-milestone은 P0/P1/P2 라벨링은 잘 하지만 *수치 dashboard*가 없다. 데이터는 이미 다 존재 — validation reports + QA_FINDINGS + feature `## 7-1` — *surfacing*만 빠짐.
- ADR-014 graduation checklist 5+1이 이미 deterministic 평가 — 그 위에 *수치 echo block* 한 개 추가하면 milestone graduation이 *진짜* 데이터 기반이 된다.

### ADR-022 정책 강도
**enabling (약) — [외부실증]** (논문 §3.5.1). 수치 echo만, IMPROVEMENT_GUIDE / QA_FINDINGS에 신규 항목 박지 않음. 자동 차단 0건.

### 영향 받는 파일
- 수정: `.claude/skills/stabilize-milestone/SKILL.md` (단계 8 직전에 새 sub-step 추가)

### 단계별 수행

**8-1) stabilize-milestone SKILL.md 단계 7과 8 사이에 새 단계 추가** — 본 SKILL의 *"7. ARCHITECTURE_OVERVIEW의 `## 3-1`..."* 줄과 *"8. 최종 출력:"* 줄 사이에 다음 새 단계를 삽입한다 (외부 fence가 4-backtick인 점 주의 — 내부 ` ``` ` 블록 보존):

````markdown
7-T. **Telemetry aggregate** (*Code as Agent Harness* arXiv:2605.18747 §3.5.1 deep telemetry as optimization substrate + [ADR-047](../../../docs/90-decisions/boilerplate/ADR-047-code-as-agent-harness.md) D1 inspectability). 본 마일스톤 산하 task의 *이미 수집된 데이터*를 수치 dashboard로 echo. 새 데이터 수집 X — surface만.

수집 소스:
- 본 마일스톤 산하 모든 task의 `docs/40-validation/reports/<task-id>.md` (존재 시).
- 본 마일스톤 산하 feature의 `## 7-1. FAC ↔ AC 매핑표`.
- `docs/40-validation/QA_FINDINGS.md` 본 milestone 헤더(`## M-N`) 아래.
- `docs/40-validation/IMPROVEMENT_GUIDE.md`의 `## 2. 즉시 수정할 항목` 및 `## 3. 권장 리팩토링` 안의 본 milestone sub-section (`### M-N` 그룹) — Cross-stabilize 회귀 신호 grep 대상. **`## 5. Repair decision log`는 제외** (Step 3 신설 영역, *closed records*라 *open finding 재등장* 측정 대상 아님).

집계 항목:
- Tasks: M done / N total (M/N %)
- AC↔테스트 매핑: A ✅ / B total (A/B %)
- FAC coverage: C ✅ / D total (C/D %)
- Evidence Bundle 신뢰도 분포: High K / Medium L / Low J (Step 2 도입 후 채워짐 — 미도입 마일스톤은 "해당없음" 한 줄)
- Validate exit code (가장 최근 실행): 0 / non-zero / 미설정
- Findings 분포: P0 X / P1 Y / P2 Z (본 milestone 헤더 산하)
- Cross-stabilize 회귀 신호: *이전 모든 milestone들*(`## M-1` ~ `## M-(N-1)`)의 P1 라벨 finding이 본 milestone의 **QA_FINDINGS(`## M-N`)** 또는 **IMPROVEMENT_GUIDE 의 `## 2. 즉시 수정할 항목`/`## 3. 권장 리팩토링` 안 `### M-N`** 두 sub-section에 *재등장*한 항목 수 (라벨 grep, 휴리스틱 한계 echo — 동의어/오타 false-negative 가능. 본 grep은 *정확한 라벨 매칭*만 잡음. `## 5. Repair decision log`는 *closed records*라 회귀 신호 대상 아님).

본 단계는 *수치 echo만* — IMPROVEMENT_GUIDE / QA_FINDINGS에 새 항목 박지 않음. Cross-stabilize 회귀 신호가 1+ 건이면 단계 8 출력의 "P1 / P2 후속 작업"에 *patterned drift 의심* 한 줄 추가.

출력 형식 (단계 8의 최종 출력에 *Telemetry* 단락으로 포함):
```
Telemetry — M1
- Tasks: 12 / 12 (100%)
- AC↔테스트 매핑: 34 / 36 (94.4%)
- FAC coverage: 8 / 8 (100%)
- Evidence Bundle 신뢰도: High 9 / Medium 2 / Low 1
- Validate exit code: 0
- Findings: P0 0 / P1 3 / P2 7
- Cross-stabilize 회귀 신호: 0건
```
````

**8-2) 단계 8 최종 출력 목록 보강** — *"8. 최종 출력:"* 단락 안 마지막 항목 (현재 `- DESIGN.md / ARCH 7-x cross-surface drift ...` 줄, *"instruction improvement 후보"* 단락의 마지막 sub-bullet) 다음에 *최상위 들여쓰기*(3-space + `- `)로 한 줄 추가:

```markdown
   - **Telemetry aggregate** (단계 7-T 결과 echo — 수치만, IMPROVEMENT_GUIDE 신규 항목 X).
```

### 검증 방법
1. `Grep "7-T"` on `.claude/skills/stabilize-milestone/SKILL.md` → 1행 매치.
2. `Grep "Telemetry"` on `.claude/skills/stabilize-milestone/SKILL.md` → 3행 이상 매치.
3. 다음 `/stabilize-milestone M1` 실행 시 출력에 *Telemetry — M1* block이 등장.

### 커밋 메시지
```
docs(skills): emit milestone telemetry aggregate in stabilize-milestone output
```

---

## 부록 — 커밋 메시지 목록

각 step당 1개 커밋 (총 8개). 커밋 순서는 §0의 의존성·권장 순서 참조:

1. `docs(adr): add ADR-047 code-as-agent-harness paradigm and mutation contract`
2. `docs(skills): add Evidence Bundle section to validate-workitem report schema`
3. `docs(skills): persist P0/P1 decision log in repair-plan and repair-discovery`
4. `docs(guardrails): document defaultMode acceptEdits risk tier and fork override path`
5. `docs(adr): cite Code as Agent Harness paper in ADR-038 background and evidence label`
6. `docs(templates): allow optional structured deps in TASK_TEMPLATE for parallel waves`
7. `docs(templates): strengthen TASK_TEMPLATE 6-1 test-path format for deterministic AC mapping`
8. `docs(skills): emit milestone telemetry aggregate in stabilize-milestone output`
