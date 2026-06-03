# IMPROVE-GUIDE — 3개 개선 실행 가이드

> 이 문서는 **이 보일러플레이트 자체(harness)** 를 개선하기 위한 1회성 실행 가이드다. 프로젝트 산출물이 아니라
> `docs/40-validation/IMPROVEMENT_GUIDE.md`(보일러플레이트의 QA 누적 가이드)와는 **다른 파일**이다.
> 모든 변경 적용이 끝나면 이 파일은 삭제해도 된다(직전 라운드에서도 `docs: delete IMPROVE-GUIDE`로 정리된 전례 있음).

---

## 0. 무엇을 / 왜 / 어떤 방식으로 바꾸는가

### 개선 목표 (사용자 요청 3건)
1. **MCP 적용 목록을 기록하고, 필요한 상황에 MCP를 꼭 활용하도록 강제한다.**
2. **디자인 과정에서 레퍼런스를 조사하고 문서로 남기는 단계를 추가한다.**
3. **DESIGN.md를 먼저 쓰고 마지막에 시안을 보여주는 대신, DESIGN.md 작성 *전*에 여러 시안(HTML/CSS)을 보여주고 사용자가 선택한 것을 바탕으로 DESIGN.md를 확정한다.**

### 맥락 분석 (현재 상태 → 갭)
| # | 현재 상태 (관측) | 갭 |
|---|------------------|-----|
| 1 | `ADR-043`이 `docs/00-meta/STACK_SETUP_PLAN.md`의 `## Optional MCP Connectors` 표에 *연결 사실*은 기록하게 했지만, **결정 4가 "skill/agent 본문 자동 재작성 X"로 *사용 강제*를 명시적으로 보류**. 또한 모든 lifecycle skill의 `allowed-tools`에 MCP 도구(`mcp__<server>__*`)가 없어 fork sub-agent(builder/planner/validator)는 **MCP를 호출조차 못 한다**. 한편 `/stabilize-milestone` 3-P는 이미 Playwright MCP를 참조하지만 *ad-hoc("연결돼 있으면")* 조건이고 미연결 시 silent skip(ADR-043)이라 registry와 무관하다. | MCP를 붙여도 plan/implement가 인식·활용하지 않아 "기록만 되고 안 쓰임". stabilize의 MCP 사용도 registry-driven이 아님. |
| 2 | `/bootstrap-design` R0이 레퍼런스 + 안티-레퍼런스를 추출하지만, **결과를 DESIGN.md `## 1 Overview`에 1줄씩만 흡수**(ADR-027#d26). | 레퍼런스 분해 근거가 *문서로 보존되지 않아* 재검토·재디자인 시 소실. |
| 3 | `/bootstrap-design` **R5(단일 `design-preview.html`)가 R4(DESIGN.md 저장) *후*에 생성**(ADR-027#d21) → 사용자는 토큰(텍스트)으로 방향을 확정한 *뒤에야* 눈으로 본다. **시각 방향을 *선택*할 자리가 없다.** | 방향이 틀리면 DESIGN.md 전면 재작성 비용. |

### 변경 방식 — 왜 ADR 2개인가
이 보일러플레이트는 **모든 정책 변경이 ADR을 거치는** 구조다(`AGENTS.md` "새 정책은 ADR로 박고…", `ADR-045` 문서 참조 계약, `ADR-047` Harness Mutation Contract). 따라서 skill/agent 본문을 바꾸려면 **그 변경을 고정하는 ADR + Mutation Contract + Surfaces**가 먼저 있어야 한다. 두 개선군은 성격이 달라 ADR 2개로 나눈다.

- **개선 1 → 신규 `ADR-048`** (MCP 사용 강제). `ADR-043`(record-only)을 *확장*한다. 건드리는 surface가 5개 이상이고(plan/implement/validate/validator/template/bootstrap-stack) ADR-043의 "사용 강제 보류" 입장을 *뒤집는* 성격이므로, `_ADR_GUIDE.md`/`ADR-045#d6` 기준상 **amend가 아니라 신규 ADR**이 맞다.
- **개선 2 + 3 → 신규 `ADR-049`** (concept-mockup-first 디자인 흐름 + 레퍼런스 리서치 노트). `ADR-027`의 *디자인 워크플로우 라운드 구조*(#3/#13/#21/#d22/#d26/#27)를 **supersede**한다. `ADR-027`은 이미 amend 4개(grandfather)이고 R5 시점을 *뒤집으므로* 5번째 amend 대신 신규 ADR로 분리한다. **단 ADR-027은 superseded 처리하지 않는다** — `DESIGN.md` *내용*(8섹션+Motion/토큰/Don'ts)과 *ARCH 7-x 인터페이스 할당* SSOT는 그대로 유지하고, **라운드 구조만 ADR-049로 이관**한다.

두 ADR 모두 `.claude/skills`·`.claude/agents`를 수정하므로 **`## Mutation Contract` 6필드**(ADR-047 D3)와 **`## Surfaces`**(ADR-045 D3) + 각 surface 파일의 **역참조**(ADR-045 D4)가 필수다. 아래 단계가 이를 모두 포함한다.

### 사전 확인 (작업 시작 전 1회)
- 다음 사용 가능한 boilerplate ADR 번호: **048, 049** (`docs/90-decisions/boilerplate/README.md`의 Reserved/Dropped 표 확인 — 048/049는 미사용·미예약).
- `AGENTS.md`는 현재 **54줄**(hard cap 100, soft cap 80) — 1줄 링크 추가 여유 있음(ADR-011).
- 작업 중 **`.env`/`secrets/`는 건드리지 않는다**(AGENTS.md 핵심 규율).
- 모든 신규 문서는 한국어로 작성(기존 docs 스타일 일치).

### 커밋 계획 (총 6커밋 — 각 단계 끝에 명시)
```
A1  docs(adr): add ADR-048 MCP usage enforcement extending ADR-043 record-only policy
A2  feat(mcp): record applied connectors with lifecycle-usage and agent-access columns
A3  feat(mcp): enforce connected-MCP usage across plan/implement/validate/stabilize
B1  docs(adr): add ADR-049 concept-mockup-first design flow superseding ADR-027 round structure
B2  feat(design): restructure bootstrap-design to reference-note plus concept-mockup-first rounds
B3  docs(design): surface design-research note and concept mockups across structure/workflow/readme/gitignore
```

> ⚠️ **문서 순서 ≠ 커밋 순서**: Step은 읽기 편하도록 A1→A2→A3→B1…로 나열하지만, **Step A4(인덱스+AGENTS 링크)는 커밋 A1에 묶인다**(ADR 본문과 함께 — 각 ✅ 마커 참조). B1은 A4-1이 README 인덱스에 `048` 행을 *먼저* 박은 뒤 그 아래 `049` 행을 잇는다고 전제한다. 실제 적용은 본문 순서가 아니라 *각 ✅ 마커의 커밋 단위*를 따른다.

---

# PART A — 개선 1: MCP 적용 기록 + 사용 강제 (ADR-048)

## Step A1 — `ADR-048` 신규 작성

**새 파일 생성**: `docs/90-decisions/boilerplate/ADR-048-mcp-usage-enforcement.md`

아래 내용을 **그대로** 작성한다.

```markdown
# ADR-048 — Connected-MCP 사용 강제 (record → enforce)

> scope: boilerplate
> area: tooling

## Status
accepted

## 현재 유효 결정
- 연결된 MCP는 `STACK_SETUP_PLAN ## Optional MCP Connectors` 표(+`lifecycle usage`/`agent access` 컬럼)에 기록하고, plan(line item authoring)→implement(실행 또는 `Needs MCP Access`)→validate(`[MCP-unused]` audit)→stabilize 3-P(registry-driven) 계약으로 *연결된 MCP가 관련 task에서 실제로 쓰이도록* 권장·점검한다(자동 차단 0 — enabling).
- ADR-043(record-only)을 *enforce로 확장* — 보안 가드(read-only/secret/RCE 한정/자동연결 X)는 보존(supersede 아님, ADR-043 accepted 유지).
- `agent access` 부여는 SKILL `allowed-tools`(`mcp__<server>__*`) + (acceptEdits 기본 모드에서 MCP confirm 정지 회피용) read-only MCP 도구의 `permissions.allow` *둘 다* 필요 — 그래야 fork sub-agent가 비대화식으로 자율 호출 가능(E 한계 — 아래 정책 강도).

## 배경
- [관측됨] ADR-043이 `docs/00-meta/STACK_SETUP_PLAN.md` `## Optional MCP Connectors` 표에 *연결 사실*은 기록하게 했으나, 결정 4가 "skill/agent 본문 자동 재작성 X"로 *사용 강제*를 명시적으로 보류했다 → MCP를 환경에 붙여도 plan/implement가 그 존재를 인식·활용하지 않아 "기록만 되고 안 쓰이는" 상태.
- [관측됨] plan-workitem은 이미 ADR-040 "외부 docs-check line item" 패턴(plan이 line item authoring → implement가 실행 또는 Needs Research hardstop → validator가 실행 점검)을 갖는다 — 동일 2-layer 패턴을 MCP에 재사용 가능.
- [관측됨] 본 보일러 lifecycle skill의 `allowed-tools`에 MCP 도구(`mcp__<server>__*`)가 없어 fork sub-agent(builder/planner/validator)는 현재 MCP를 호출할 수 없다 → 연결 시 `allowed-tools` 부여가 별도로 필요(보일러는 MCP 이름을 모르므로 baking 불가).

## 결정 (6)
1. **연결 기록을 *사용 의도까지* 구조화** — STACK_SETUP_PLAN `## Optional MCP Connectors` 표에 2 컬럼 추가: `lifecycle usage`(어느 phase/skill이 어떤 capability에 이 MCP를 우선 사용하는가) + `agent access`(이 MCP 도구를 `allowed-tools`로 부여한 skill, 또는 `main-session`). 기존 보안 컬럼(read-only / secret)은 유지.
2. **연결 절차에 step (e) 추가** (ADR-043 결정 4의 (a)~(d)에 이어) — MCP 연결 시 *lifecycle usage 결정 + 해당 skill `allowed-tools`에 `mcp__<server>__*` 부여*(Claude: SKILL frontmatter / Codex: `.codex/config.toml`의 permissions + `[mcp_servers.*]`)를 사용자가 직접 수행하고 표에 기록. **`allowed-tools` 부여만으로는 부족**하다 — shared 기본 모드가 `acceptEdits`이고 그 모드는 *Bash·MCP 호출에 confirm을 요구*한다(GUARDRAILS_STRATEGY `## defaultMode 위험 tier`). fork sub-agent(builder/planner/validator)는 실행 중 confirm에 응답할 수 없으므로, 비대화 자율 호출이 필요한 *read-only* MCP 도구는 `.claude/settings(.local).json`의 `permissions.allow`에도 등재해야 한다(RCE급 도구는 등재 X — 신뢰 클라이언트 confirm 유지). 부여·allow하지 않으면 enforcement는 "권장 출력 + `Needs MCP Access`"까지만 동작(자동 사용 불가).
3. **plan-workitem MCP-aware line item** — `## Optional MCP Connectors` 표가 존재하고 분해 task의 capability가 연결된 MCP의 `lifecycle usage`와 매칭되면, 해당 task `## 3. 구현 항목`에 line item을 자동 추가: `- <capability> 작업 시 <mcp-name> MCP 사용 (STACK_SETUP_PLAN Optional MCP Connectors 참조)`. 권장 텍스트만, 자동 차단 X (ADR-007 책임 경계 / ADR-040 패턴 정합). 표 부재 시 본 step skip(ADR-019 minimal — 표 없으면 사전 read X).
4. **implement-workitem MCP 실행 + Needs MCP Access** — task `## 3`에 MCP-use line item이 있으면 builder가 그 MCP 도구로 실행한다. MCP 도구가 `allowed-tools`에 없거나 호출 불가면 *날조·우회하지 않고* `Needs MCP Access: <mcp> — <skill> allowed-tools에 mcp__<server>__* 부여 또는 메인 세션 경유 필요`를 출력하고 해당 항목을 skip한다 (ADR-040 "Needs Research" hardstop 패턴 정합 — builder는 추측 금지).
5. **validator MCP 미실행 audit** — MCP-use line item이 있었는데 실행 흔적(diff / test / 출력)이 없으면 report에 `P2 [MCP-unused] <mcp> — plan이 박은 MCP 사용 line item 미실행` 기록. 자동 차단 X(report 신뢰 등급만 영향).
6. **stabilize-milestone 탐색적 QA의 registry-driven MCP** — `/stabilize-milestone` 3-P(탐색적 QA)의 MCP 사용 조건을 *registry-driven*으로 정렬: "Playwright MCP 연결"이라는 ad-hoc 조건 대신 STACK_SETUP_PLAN `## Optional MCP Connectors`에 browser/E2E capability MCP가 *등재 + `agent access` 부여* + UI 프로젝트일 때만 사용. 미등재·access 미부여·비-UI는 *silent skip + 사유 echo*(보안상 자동 사용 X). RCE급 도구(`browser_run_code_unsafe`류) 금지 유지(ADR-043 보안). 발견 결함은 기존대로 QA_FINDINGS 기록 + bugfix task 라우팅.

보안 invariant(ADR-043 계승, 본 ADR이 변경 X): read-only default / secret 분리(`.env` 커밋 X) / RCE급 도구(예: Playwright `browser_run_code_unsafe`)는 신뢰 클라이언트 한정 / 자동 연결·정적 설치 레시피 baking 금지.

## Mutation Contract (ADR-047 D3)
1. **Target** — STACK_SETUP_PLAN_TEMPLATE 표 2컬럼 + 연결 절차 (e) / plan-workitem MCP-aware line item 단락(신규) / implement-workitem MCP 실행 + Needs MCP Access 단락(신규) / validate-workitem + validator `[MCP-unused]` audit / bootstrap-stack connectors surfacing + backfill / stabilize-milestone 3-P registry-driven MCP.
2. **Failure mode** — MCP가 환경에 연결돼 있어도 lifecycle이 그 존재를 인식·활용하지 못해 "기록만 되고 안 쓰임"(관측됨, ADR-043 결정 4 보류 결과 + stabilize 3-P ad-hoc 조건).
3. **Predicted improvement** — *agent access(`allowed-tools` + read-only `permissions.allow`)가 부여된 connector 한정*, 매칭 task에서 plan이 line item을 박고 implement가 실행 → validator audit `[MCP-unused]` 0건. stabilize 3-P가 registry 기반으로 일관 동작. dogfood/fork run에서 "MCP 연결 후 미사용" 신호 감소. (access 미부여 connector는 `[MCP-access]`/`Needs MCP Access`로 *정직하게* 강등 — 이는 실패가 아니라 설계된 보안 게이트 결과.)
4. **Preserved invariants** — ADR-043 보안 가드(read-only / secret / RCE 한정) / 자동 연결·정적 설치 레시피 baking 금지 / **ADR-043#d4(연결 시 skill·agent 본문 자동 재작성 X) — 본 ADR의 line-item 계약은 boilerplate에 *1회* 박힌 standing 메커니즘이지 *연결마다* skill을 고쳐 쓰는 게 아님** / stabilize 3-P 기존 silent-skip·RCE 금지 동작 / skill auto-invocation 금지 / ADR-040 docs-check line item 동작 / validate report 양식 호환.
5. **Falsifying evaluation** — ADR-017 dogfood simulation에 "MCP 연결된 fork" 라운드 추가 시: (a) line item planting이 false-positive(무관 task에 MCP 강요)를 다수 내거나, (b) **acceptEdits 기본 모드에서 fork sub-agent의 MCP 호출이 confirm으로 정지/차단돼 `permissions.allow` 셋업 없이는 line item이 routine하게 `Needs MCP Access`로 강등**(= 기본 모드에서 enforcement 사실상 무력)되면, 결정 3·4를 *"main-session 경유 권장"* 으로 후퇴하거나 연결 절차 (e)에서 `permissions.allow` 셋업을 *필수화*한다.
6. **Rollback path** — 본 ADR superseded → ADR-043 record-only 상태로 복귀(plan/implement/validator MCP 단락 + 표 2컬럼 제거).

## 정책 강도 (ADR-022)
- enabling(약) — 새 line-item 계약 + 권장 출력, 자동 차단 0건. 결정 1·2의 보안 가드(read-only / secret / access 명시)는 constraint(약) 유지.

## 결과
- "적용 MCP 목록"이 *사용 의도(lifecycle usage) + 접근(agent access)*까지 구조화돼 기록되고, plan→implement→validate 2-layer 계약 + stabilize 3-P registry-driven으로 *연결된 MCP가 관련 task에서 실제로 쓰이도록* 권장·점검된다. 전용 skill·새 agent 없음(기존 surface 확장 — ADR-006 단순성).

## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT)
- docs/00-meta/_templates/STACK_SETUP_PLAN_TEMPLATE.md  — #d1 표 2컬럼 + #d2 연결 절차 (e)
- .claude/skills/plan-workitem/SKILL.md                 — #d3 MCP-aware line item
- .claude/skills/implement-workitem/SKILL.md            — #d4 MCP 실행 + Needs MCP Access
- .claude/skills/validate-workitem/SKILL.md             — #d5 [MCP-unused] audit
- .claude/agents/validator.md                            — #d5 [MCP-unused] audit 규칙
- .claude/skills/bootstrap-stack/SKILL.md               — #d1 connectors surfacing + backfill
- .claude/skills/stabilize-milestone/SKILL.md           — #d6 registry-driven 3-P MCP

## 참고
- ADR-043 (Optional MCP Connectors — record 정책. 본 ADR이 enforce로 확장. ADR-043은 accepted 유지)
- ADR-040 (researcher + docs-check line item 패턴 — 본 ADR이 동일 2-layer 패턴 재사용)
- ADR-010 (Claude + Codex 양쪽 emit), ADR-022 (Ratchet), ADR-047 D3 (Mutation Contract)
- GUARDRAILS_STRATEGY (`acceptEdits`에서 Bash·MCP는 confirm — 본 ADR이 그 게이트를 약화시키지 않음)
```

> ⚠️ 작성 시 주의: `## 현재 유효 결정`은 ADR-045#d5상 *권장*이다(amend 4+/정정성이면 **필수**, "그 외는 **권장**" — 신규 ADR도 권장). amend 0이라 의무는 아니나, 결정 6개의 net 규칙을 빠르게 읽도록 + ADR-049와 처리 통일을 위해 **포함**한다(위 본문). ("신규 ADR이라 생략이 맞다"는 D5 오독 — 권장 대상이다.)

---

## Step A2 — 연결 기록 구조화 (`#d1`/`#d2`)

### A2-1. STACK_SETUP_PLAN 템플릿 표 확장

**파일**: `docs/00-meta/_templates/STACK_SETUP_PLAN_TEMPLATE.md`

**기존 (38~43행):**
```markdown
## Optional MCP Connectors
<!-- 기본 자동 연결 X (ADR-043). RCE급 도구(예: Playwright browser_run_code_unsafe)는 신뢰 클라이언트 한정. secret은 .env(커밋 X).
     연결 절차(ADR-043, 전용 skill 없음 — 1회성 셋업): (a) researcher(ADR-040)로 해당 능력의 최신 공식 MCP 설정 조회; (b) Claude(`claude mcp add <name> --scope project` 또는 `.mcp.json`) + Codex(`.codex/config.toml [mcp_servers.<name>]`) 설정을 *사용자가 직접 실행*; (c) project ADR(ADR-1NN)에 purpose/official docs/scope/read-only/secret/왜 기록 + project README 인덱스 갱신; (d) 아래 표에 행 추가. -->
| name | purpose | official docs | scope | read-only | secret | smoke check | last-verified |
|------|---------|---------------|-------|-----------|--------|-------------|---------------|
| (예: jetbrains) | IDE 연동 | (URL) | project | - | - | - | - |
```

**수정 후:**
```markdown
## Optional MCP Connectors
<!-- 기본 자동 연결 X (ADR-043). RCE급 도구(예: Playwright browser_run_code_unsafe)는 신뢰 클라이언트 한정. secret은 .env(커밋 X).
     연결 절차(ADR-043 + ADR-048, 전용 skill 없음 — 1회성 셋업): (a) researcher(ADR-040)로 해당 능력의 최신 공식 MCP 설정 조회; (b) Claude(`claude mcp add <name> --scope project` 또는 `.mcp.json`) + Codex(`.codex/config.toml [mcp_servers.<name>]`) 설정을 *사용자가 직접 실행*; (c) project ADR(ADR-1NN)에 purpose/official docs/scope/read-only/secret/왜 기록 + project README 인덱스 갱신; (d) 아래 표에 행 추가;
     (e) **사용 강제 셋업 (ADR-048#d2)**: `lifecycle usage`(어느 phase/skill이 어떤 capability에 이 MCP를 우선 쓰는가) 결정 + `agent access` 부여 — (1) 해당 skill `allowed-tools`에 `mcp__<server>__*` 추가(Claude: SKILL frontmatter / Codex: `.codex/config.toml` permissions) + (2) **acceptEdits 기본 모드는 MCP 호출에 confirm을 요구**하므로(GUARDRAILS) fork sub-agent의 비대화 자율 호출이 필요한 *read-only* MCP 도구를 `.claude/settings(.local).json` `permissions.allow`에도 등재(RCE급 도구는 등재 X). 둘 다 안 하면 plan은 line item만 박고 implement는 `Needs MCP Access`로 멈춘다. read-only default 유지·secret은 .env. -->
| name | purpose | official docs | scope | read-only | secret | lifecycle usage | agent access | smoke check | last-verified |
|------|---------|---------------|-------|-----------|--------|-----------------|--------------|-------------|---------------|
| (예: jetbrains) | IDE 연동 | (URL) | project | - | - | (예: implement — 코드 심볼 조회) | (예: implement-workitem / main-session) | - | - |
```

> 변경 요점: 주석에 `+ ADR-048` 역참조(ADR-045#d4) + (e) 추가, 표 헤더에 `lifecycle usage`·`agent access` 2컬럼 추가, 예시 행에 두 칸 채움.

### A2-2. bootstrap-stack — connectors surfacing + backfill (`#d1`)

**파일**: `.claude/skills/bootstrap-stack/SKILL.md`

**(1) "반드시 수행할 일" step 3에 하위 항목 추가.** 기존 (38~40행):
```markdown
3. 필요하면 아래 문서를 만든다.
   - `docs/00-meta/STACK_SETUP_PLAN.md`
   - `docs/00-meta/_templates/STACK_SETUP_PLAN_TEMPLATE.md`를 복사해 `docs/00-meta/STACK_SETUP_PLAN.md`를 생성 (이미 있으면 갱신 제안만).
```

**수정 후:**
```markdown
3. 필요하면 아래 문서를 만든다.
   - `docs/00-meta/STACK_SETUP_PLAN.md`
   - `docs/00-meta/_templates/STACK_SETUP_PLAN_TEMPLATE.md`를 복사해 `docs/00-meta/STACK_SETUP_PLAN.md`를 생성 (이미 있으면 갱신 제안만).
   - **Optional MCP Connectors 백필 (ADR-048#d1 / ADR-043#d5)**: `.codex/config.toml`에 `[mcp_servers.*]`가 이미 있으면(예: jetbrains) STACK_SETUP_PLAN `## Optional MCP Connectors` 표에 `lifecycle usage`·`agent access` 포함해 backfill 권장. 표는 생성하되 *자동 연결은 하지 않는다*(사용자 직접 — ADR-043 보안).
```

**(2) "마지막 출력"에 1줄 추가.** 기존 (55~60행) 마지막 출력 목록에 한 줄 추가:
```markdown
마지막 출력:
- 스택 선택 요약
- 추천 guardrail 목록
- 생성/추가가 필요한 문서 목록
- 남은 불확실성
- **연결된/연결 권장 MCP가 있으면**: `STACK_SETUP_PLAN.md ## Optional MCP Connectors`에 lifecycle usage + agent access 기록 안내 1줄 (ADR-048).
- 다음 권장 단계로 `/stack-guard`를 안내한다(자동 호출 아님 — 사용자가 발화한다).
```

---

✅ **여기까지 커밋 A2**:
```
feat(mcp): record applied connectors with lifecycle-usage and agent-access columns
```

---

## Step A3 — 사용 강제 (line-item 계약 `#d3`~`#d5` + stabilize registry `#d6`)

### A3-1. plan-workitem — MCP-aware line item (`#d3`)

**파일**: `.claude/skills/plan-workitem/SKILL.md`

위치: "신규 인터페이스 요소 → … 등록 line item authoring" 절 안, **외부 라이브러리 docs-check line item (ADR-040)** 단락(186행) **바로 다음**에 새 단락을 추가한다.

**기존 (186~188행):**
```markdown
**외부 라이브러리 docs-check line item (ADR-040)**: task `## 2/## 3` 본문에 *외부 SDK·API·결제·인증·외부 서비스 연동* 키워드(예: `결제`, `payment`, `Stripe`, `OAuth`, `auth provider`, `SDK`, `webhook`, `외부 API`)가 등장하면, 해당 task `## 3. 구현 항목`에 line item을 자동 추가: `- 구현 전 최신 공식문서 확인 (/research-pack 또는 researcher 위임 — 모델 지식 컷오프 보완)`. builder는 이 line item을 보고 불확실하면 researcher 위임을 메인에 요청(직접 웹서핑 X).

**모두 자동 차단 X — *권장 텍스트만* 출력** (ADR-007 책임 경계 정합).
```

**수정 후 (docs-check 단락과 "모두 자동 차단" 단락 사이에 MCP 단락 삽입):**
```markdown
**외부 라이브러리 docs-check line item (ADR-040)**: task `## 2/## 3` 본문에 *외부 SDK·API·결제·인증·외부 서비스 연동* 키워드(예: `결제`, `payment`, `Stripe`, `OAuth`, `auth provider`, `SDK`, `webhook`, `외부 API`)가 등장하면, 해당 task `## 3. 구현 항목`에 line item을 자동 추가: `- 구현 전 최신 공식문서 확인 (/research-pack 또는 researcher 위임 — 모델 지식 컷오프 보완)`. builder는 이 line item을 보고 불확실하면 researcher 위임을 메인에 요청(직접 웹서핑 X).

**connected-MCP 사용 line item (ADR-048#d3)**: `docs/00-meta/STACK_SETUP_PLAN.md` `## Optional MCP Connectors` 표가 *존재*하면 그 표만 회수(부재 시 본 점검 skip — ADR-019 minimal). 분해 task의 capability(예: 브라우저 E2E / DB 스키마 introspection / 최신 공식문서 / PR·issue / 디자인 자산)가 표의 어떤 행 `lifecycle usage`와 매칭되면, 해당 task `## 3. 구현 항목`에 line item 자동 추가: `- <capability> 작업 시 <mcp-name> MCP 사용 (STACK_SETUP_PLAN Optional MCP Connectors 참조)`. 권장 텍스트만 — builder가 독립 판단 없이 실행하도록 *plan이 authoring*(ADR-040 docs-check / ADR-027#amend-1 책임 분배와 동일 패턴). 표의 행 `agent access`가 비어 있으면(아직 부여 X) line item에 `(agent access 미부여 — 연결 절차 (e) 필요)` 한 줄 부기.

**모두 자동 차단 X — *권장 텍스트만* 출력** (ADR-007 책임 경계 정합).
```

### A3-2. implement-workitem — MCP 실행 + Needs MCP Access (`#d4`)

**파일**: `.claude/skills/implement-workitem/SKILL.md`

위치: "외부 docs-check line item 처리 (ADR-040)" 단락(77~78행) **바로 다음**에 새 단락 추가.

**기존 (77~78행):**
```markdown
외부 docs-check line item 처리 (ADR-040):
- task `## 3. 구현 항목`에 `구현 전 최신 공식문서 확인` line item(plan이 박음)이 있고, 그 외부 라이브러리·API의 *최신 사용법 확신*이 없으면 **구현을 시작하지 않고** 출력에 `Needs Research: <대상> — /research-pack <대상> 실행 후 재개 권장`을 명시한다. builder는 웹 접근이 없어 *직접 웹서핑하지 않는다*. 이미 확신이 있으면 line item을 체크하고 진행한다.
```

**수정 후 (단락 추가):**
```markdown
외부 docs-check line item 처리 (ADR-040):
- task `## 3. 구현 항목`에 `구현 전 최신 공식문서 확인` line item(plan이 박음)이 있고, 그 외부 라이브러리·API의 *최신 사용법 확신*이 없으면 **구현을 시작하지 않고** 출력에 `Needs Research: <대상> — /research-pack <대상> 실행 후 재개 권장`을 명시한다. builder는 웹 접근이 없어 *직접 웹서핑하지 않는다*. 이미 확신이 있으면 line item을 체크하고 진행한다.

connected-MCP 사용 line item 처리 (ADR-048#d4):
- task `## 3. 구현 항목`에 `<capability> 작업 시 <mcp-name> MCP 사용` line item(plan이 박음)이 있으면, 그 MCP 도구로 해당 작업을 수행한다(예: DB 스키마 introspection MCP로 실제 스키마 확인 후 구현).
- 단, **MCP 도구(`mcp__<server>__*`)가 본 skill `allowed-tools`에 없거나 호출 불가**하면 *날조·우회·추측하지 않고* 출력에 `Needs MCP Access: <mcp-name> — implement-workitem allowed-tools에 mcp__<server>__* 부여 또는 메인 세션 경유 필요 (STACK_SETUP_PLAN 연결 절차 (e))`를 명시하고 해당 line item은 미실행으로 둔다(다른 AC 구현은 계속). ADR-040 "Needs Research" hardstop과 동일 — builder는 권한 밖 도구를 임의 대체하지 않는다.
```

### A3-3. validate-workitem — `[MCP-unused]` audit (`#d5`)

**파일**: `.claude/skills/validate-workitem/SKILL.md`

위치: "검증 기준" 목록의 **UI 프로젝트 — Design inventory audit** 와 **API/CLI/백엔드/프론트 — Arch-iface audit** 사이(54~55행 사이)에 새 bullet 추가.

**기존 (54~55행):**
```markdown
- **UI 프로젝트 — Design inventory audit** (ADR-027#amend-1): 본 task 가 새 컴포넌트를 추가했는데 task `## 3. 구현 항목` 의 *등록 line item* (plan authoring) 이 실행 누락이면 `P1 [Design-inventory]`. 등록 line item 자체가 부재한데 신규 컴포넌트 출현이면 `P1 [Design-inventory-planless]` (plan 보강 권장). repair-workitem 또는 다음 plan 라운드로 회수.
- **API/CLI/백엔드/프론트 — Arch-iface audit**: 본 task 가 ARCH `## 7-1`/`## 7-2`/`## 7-3`/`## 7-4` 의 기존 결정을 위반했거나, 신규 결정을 *7-x 본문 갱신 없이* 도입했으면 report 에 `P1 [Arch-iface-7-N]` 기록 + 7-x 본문 갱신 권장 또는 ADR 후보 표시.
```

**수정 후 (사이에 삽입):**
```markdown
- **UI 프로젝트 — Design inventory audit** (ADR-027#amend-1): 본 task 가 새 컴포넌트를 추가했는데 task `## 3. 구현 항목` 의 *등록 line item* (plan authoring) 이 실행 누락이면 `P1 [Design-inventory]`. 등록 line item 자체가 부재한데 신규 컴포넌트 출현이면 `P1 [Design-inventory-planless]` (plan 보강 권장). repair-workitem 또는 다음 plan 라운드로 회수.
- **MCP 사용 audit** (ADR-048#d5): task `## 3. 구현 항목`에 `<capability> 작업 시 <mcp-name> MCP 사용` line item(plan authoring)이 있었는데 실행 흔적(diff / test / 출력)이 없으면 report에 `P2 [MCP-unused] <mcp-name> — plan이 박은 MCP 사용 line item 미실행` 기록. implement가 `Needs MCP Access`로 멈춘 경우(권한 미부여)는 `P2 [MCP-access] <mcp-name> — agent access 미부여(연결 절차 (e))`로 구분 기록. 자동 차단 X(report 신뢰 등급만 영향).
- **API/CLI/백엔드/프론트 — Arch-iface audit**: 본 task 가 ARCH `## 7-1`/`## 7-2`/`## 7-3`/`## 7-4` 의 기존 결정을 위반했거나, 신규 결정을 *7-x 본문 갱신 없이* 도입했으면 report 에 `P1 [Arch-iface-7-N]` 기록 + 7-x 본문 갱신 권장 또는 ADR 후보 표시.
```

### A3-4. validator.md — `[MCP-unused]` audit 규칙 (`#d5`)

**파일**: `.claude/agents/validator.md`

위치: "규칙" 목록의 UI line item 규칙(45행)과 API 규칙(46행) 사이에 새 bullet 추가.

**기존 (45~46행) 사이에 삽입할 줄:**
```markdown
- MCP: task `## 3. 구현 항목` 에 *MCP 사용 line item* (`<capability> 작업 시 <mcp> MCP 사용`, plan authoring) 이 있었는가? 있었으면 그 MCP 사용 흔적(diff/test/출력)이 있는지 점검. 미실행 시 `P2 [MCP-unused] <mcp> — plan line item 미실행`, 권한 미부여로 멈춘 경우 `P2 [MCP-access] <mcp>`. (ADR-048#d5)
```

> 삽입 위치: `- UI: 본 task 가 새 컴포넌트를…` 줄과 `- API: 7-1 envelope…` 줄 사이.

### A3-5. stabilize-milestone — 3-P registry-driven MCP (`#d6`)

**파일**: `.claude/skills/stabilize-milestone/SKILL.md`

위치: 수행 단계 `3-P. (옵션) Playwright MCP 탐색적 QA` 항목의 **조건 절만** registry-driven으로 교체(나머지 본문·보안 문구는 보존).

**기존:**
```markdown
3-P. **(옵션) Playwright MCP 탐색적 QA** (ADR-043 — Playwright MCP 연결 + UI 프로젝트일 때만; 미연결·비-UI는 silent skip + 사유 echo): 실제 앱을 구동해 본 마일스톤 feature의 시나리오(happy/alt/fail) + qa 엣지케이스를 *탐색*한다(accessibility 트리·클릭/입력·스크린샷·네트워크). 발견한 결함을 `docs/40-validation/QA_FINDINGS.md`에 기록하고, **재현 케이스를 영속 Playwright 테스트(`validate:e2e`에 묶이는 커밋 가능한 파일)로 남길 것을 권장**(자동 커밋 X — stabilize는 코드·커밋 금지, 후속 task 제안). 실패는 `Type: bugfix` task(ADR-039)로 라우팅. **보안: `browser_run_code_unsafe`류 RCE급 도구는 사용하지 않는다** — accessibility snapshot·표준 브라우저 조작만.
```

**수정 후 (조건 절만 변경):**
```markdown
3-P. **(옵션) 탐색적 QA via browser/E2E MCP** (ADR-048#d6 registry-driven / ADR-043 보안 — STACK_SETUP_PLAN `## Optional MCP Connectors`에 browser/E2E capability MCP가 *등재 + `agent access` 부여* + UI 프로젝트일 때만; 미등재·access 미부여·비-UI는 silent skip + 사유 echo): 실제 앱을 구동해 본 마일스톤 feature의 시나리오(happy/alt/fail) + qa 엣지케이스를 *탐색*한다(accessibility 트리·클릭/입력·스크린샷·네트워크). 발견한 결함을 `docs/40-validation/QA_FINDINGS.md`에 기록하고, **재현 케이스를 영속 E2E 테스트(`validate:e2e`에 묶이는 커밋 가능한 파일)로 남길 것을 권장**(자동 커밋 X — stabilize는 코드·커밋 금지, 후속 task 제안). 실패는 `Type: bugfix` task(ADR-039)로 라우팅. **보안: `browser_run_code_unsafe`류 RCE급 도구는 사용하지 않는다** — accessibility snapshot·표준 브라우저 조작만.
```

> 핵심: "Playwright MCP 연결" ad-hoc 조건 → "registry(STACK_SETUP_PLAN)에 browser/E2E MCP 등재 + access" 로 정렬. silent-skip·RCE 금지 동작은 그대로(ADR-048 Preserved invariants).

### A3-6. validate-workitem report 양식에 `[MCP-unused]` 노출 (선택, 정합성)

report 템플릿의 `## 실패 항목`은 P0/P1/P2를 이미 받는 자유 양식이라 별도 수정 불필요. `[MCP-unused]`/`[MCP-access]`는 P2로 자연히 들어간다. **추가 편집 없음.**

---

✅ **여기까지 커밋 A3**:
```
feat(mcp): enforce connected-MCP usage across plan/implement/validate/stabilize
```

---

## Step A4 — 인덱스 + AGENTS.md 링크 (커밋 A1에 포함)

> A1(ADR 본문)과 함께 커밋한다. ADR 본문만 있고 인덱스에 안 박으면 `_ADR_GUIDE.md` "새 ADR 추가 절차" 위반.

### A4-1. boilerplate ADR 인덱스에 행 추가

**파일**: `docs/90-decisions/boilerplate/README.md`

**기존 (43행):**
```markdown
| 047 | Code-as-Agent-Harness paradigm + Mutation Contract | accepted | — | 정체성 + shared substrate 6 layer + harness mutation contract 6 필드 + sandboxed execution / contract formation / deep telemetry / oracle adequacy / workflow topology umbrella SSOT (D1~D9) |
```

**그 아래에 1줄 추가:**
```markdown
| 047 | Code-as-Agent-Harness paradigm + Mutation Contract | accepted | — | 정체성 + shared substrate 6 layer + harness mutation contract 6 필드 + sandboxed execution / contract formation / deep telemetry / oracle adequacy / workflow topology umbrella SSOT (D1~D9) |
| 048 | Connected-MCP 사용 강제 (record → enforce) | accepted | — | ADR-043 record-only를 enforce로 확장 — connectors 표에 lifecycle usage/agent access 컬럼 + plan→implement→validate(+stabilize 3-P) MCP 사용 line-item 계약 + 보안 가드 유지 |
```

### A4-2. AGENTS.md "깊은 운영 원칙" 링크 추가 (1줄)

**파일**: `AGENTS.md`

위치: "깊은 운영 원칙은 다음 문서를 따른다" 목록 안. `[Guardrail 운영 원칙]` 줄 **다음**에 1줄 추가:

**기존:**
```markdown
- [Guardrail 운영 원칙](docs/00-meta/GUARDRAILS_STRATEGY.md)
- [새 프로젝트 시작 체크리스트](docs/00-meta/PROJECT_START_CHECKLIST.md)
```

**수정 후:**
```markdown
- [Guardrail 운영 원칙](docs/00-meta/GUARDRAILS_STRATEGY.md)
- [Optional MCP Connectors 기록·사용 강제](docs/90-decisions/boilerplate/ADR-048-mcp-usage-enforcement.md)
- [새 프로젝트 시작 체크리스트](docs/00-meta/PROJECT_START_CHECKLIST.md)
```

> AGENTS.md는 54→55줄. cap 100 이내(ADR-011 충족). `ADR-049`는 AGENTS.md에 추가하지 않는다 — 기존 `[시각 디자인](DESIGN.md)` + STRUCTURE canonical owner가 커버(SSOT 린함 유지).

---

✅ **여기까지 커밋 A1** (Step A1 + Step A4 묶음 — ADR 본문 + 인덱스 + AGENTS 링크):
```
docs(adr): add ADR-048 MCP usage enforcement extending ADR-043 record-only policy
```

> 권장 커밋 순서: **A1 → A2 → A3**. (A1이 ADR/인덱스/링크, A2가 기록 템플릿·bootstrap-stack, A3가 강제 계약.) 각 커밋은 명시적 `git add <paths>`만 사용 — `git add -A` 금지(WORKFLOW 4-1).

---

# PART B — 개선 2 + 3: 디자인 레퍼런스 노트 + concept-mockup-first 흐름 (ADR-049)

## Step B1 — `ADR-049` 신규 작성

**새 파일 생성**: `docs/90-decisions/boilerplate/ADR-049-concept-mockup-first-design.md`

아래 내용을 **그대로** 작성한다.

```markdown
# ADR-049 — Concept-mockup-first 디자인 흐름 + 레퍼런스 리서치 노트

> scope: boilerplate
> area: design

## Status
accepted

## 현재 유효 결정
- `/bootstrap-design`의 *워크플로우 라운드 구조*는 본 ADR이 SSOT: R0(레퍼런스 추출 + `DESIGN_RESEARCH.md` 노트) → R1(원칙) → R2(다중 concept 시안 — DESIGN.md 작성 *전* 시각 방향 선택) → R3(토큰, 선택 concept에서 추출) → R4(컴포넌트) → R5(DESIGN.md 저장) → R6(DESIGN.md 파생 preview 최종 확인 + 정리).
- 시각 방향 *선택*은 R2 concept 시안(다중)이 PRIMARY, R6 preview는 SSOT 렌더 충실도 확인(사용자 생략 가능).
- ADR-027은 *DESIGN.md 내용*(#5 Stitch 8섹션+Motion, #6 3-tier 토큰, #7/#23 Don'ts)과 *ARCH 7-x 인터페이스 할당* SSOT를 유지. *라운드 구조·시안 시점·preview lifecycle(gitignore 포함)·R0 grounding*은 본 ADR이 ADR-027 #3/#13/#21/#d22/#d26/#27을 supersede(ADR-027 본문은 accepted 유지, 흐름만 이관). #d22의 design-preview.html *산출물 자체*는 R6이 계속 쓰지만 *삭제 시점(R5-3→R6-3)·gitignore 정책(보존 요청 시→기본 등재)*은 본 ADR이 갱신.

## 배경
- [외부실증] [prg.sh — Why Your AI Keeps Building the Same Purple Gradient](https://prg.sh/ramblings/Why-Your-AI-Keeps-Building-the-Same-Purple-Gradient-Website) — 시각 결정 입력 없이는 median 미감(purple gradient SaaS) 회귀 (ADR-027 배경 계승).
- [관측됨] ADR-027 #d21의 R5 시안은 DESIGN.md를 *먼저 쓰고 나서* 단일 preview를 보여준다 → 사용자가 시각 방향을 *선택*할 자리가 없고, 텍스트(토큰)만으로 방향을 확정한 뒤에야 눈으로 본다. 방향이 틀리면 DESIGN.md 전면 재작성 비용.
- [관측됨] ADR-027 #d26의 R0 reference grounding은 what-to-borrow / what-to-avoid를 DESIGN.md `## 1 Overview`에 *1줄씩*만 남긴다 → 레퍼런스 분해 근거가 문서로 보존되지 않아 재검토·재디자인 시 소실.
- [가설] 다중 안 제시 후 선택은 단일안 반복보다 해 공간 탐색이 넓다 — 본 보일러 ADR-038(plan cross-validation 다중 관점) 정신과 정합. fork 데이터로 실증 회수 예정(후속 작업).

## 결정 (4)
> **부분 supersede 패턴 + 결정 번호 28~ 근거 명시** (ADR-045 D6 보강): ADR-027은 *내용·인터페이스 SSOT*로 accepted 유지하고, 본 ADR은 ADR-027의 *디자인 흐름 결정 시퀀스만* 이어받는다. 그래서 결정 번호를 1이 아니라 ADR-027 마지막 결정(#27) 다음인 **28부터** 잇는다(흐름 결정의 연속성 표시). D6의 amend|supersede 이분법(supersede 시 status→superseded)을 넘는 의도적 선택 — 근거: *내용 SSOT 생존* + *최소 변경*(ADR-006). checker/유지보수자가 "ADR-027 accepted인데 일부 결정만 historical"을 혼동하지 않도록 본 줄로 명문화.

28. **R0 레퍼런스 리서치 노트 영속화 + R2 선택 근거 누적** — R0가 레퍼런스(1~3) + 안티-레퍼런스(1~2)를 `docs/20-system/DESIGN_RESEARCH.md`에 *문서로* 남긴다: 조사일 + 각 레퍼런스의 color signature / typography pairing / density / motion 톤 분해 + what-to-borrow / what-to-avoid + grounding 출처(사용자 제공 URL·스크린샷 / 연결된 디자인 MCP[ADR-048] / 사전추출 라이브러리 refero·getdesign.md). **R2 선택 후 *시안 옵션별 근거 + 최종 선택 이유*도 본 노트에 누적**한다(DESIGN.md는 최종 *결정* SSOT, 본 노트는 *왜 그 방향인가*의 근거 — 재디자인 추적성). 파일명은 형제 SSOT 문서(`DESIGN.md`/`ARCHITECTURE_OVERVIEW.md`)와 동일한 UPPER_SNAKE. DESIGN.md `## 1 Overview`는 본 노트를 상대경로 링크 + 핵심 1~2줄 요약 + `선택 concept: <X>` 1줄. presence: conditional(UI 한정) / lifecycle: Reference(커밋됨 — 재디자인 입력).
29. **R2 다중 concept 시안 (DESIGN.md 작성 전)** — R1 원칙 + R0 레퍼런스 + Don'ts에 근거해 **서로 다른 시각 방향 2~3개**를 각각 자기완결 HTML/CSS로 `docs/20-system/design-concepts/concept-{A,B,C}.html`에 생성(빌드·외부 의존 0, 인라인 `<style>`, GENERATED 헤더). 모든 concept은 charter `## 2.1 페르소나` / `## 3.1 핵심 시나리오` 기반 *동일 대표 화면*을 렌더해 직접 비교 가능. 사용자에게 제시 → *방향 선택*(단일 또는 하이브리드 "A 색 + B 타이포"). 선택 전에는 R3~R6로 진행하지 않는다. presence: conditional / lifecycle: ephemeral(R6에서 정리).
30. **R3~R5는 선택 concept에서 파생** — 토큰(R3)은 선택된 concept의 CSS에서 추출(3-tier DTCG — ADR-027#d6 양식 유지), 컴포넌트(R4) 동일, DESIGN.md(R5)는 선택 concept + 토큰 + 컴포넌트로 authoring. DESIGN.md `## 1 Overview`에 `선택 concept: <X>(+하이브리드 메모)` 한 줄 기록.
31. **R6 = DESIGN.md 파생 최종 preview + 정리** (구 ADR-027 #d21 R5 계승, *시점만 후행*) — DESIGN.md(SSOT) 토큰/컴포넌트만으로 단일 `design-preview.html` 재생성(`:root` CSS 변수만 참조 — raw hex 금지) → SSOT 렌더 충실도 확인 루프 → 승인 시 **concept 시안 전체 + preview 삭제**. concept은 탐색용이고 확정 방향은 DESIGN.md(SSOT)에 반영됨. preview·concept 직접 편집 금지(ADR-005). 사용자가 R2 concept 승인으로 충분하다 판단하면 R6 preview는 생략 가능(승인 후 concept만 정리).

`--fast`: R0(레퍼런스 1 + minimal 노트) + R1(1줄) + R3(토큰) + R5(저장). **R2 concept·R4·R6 생략** — concept이 필요하면 종료 후 사용자가 명시 발화 시 R2만 단독 수행.
`--update`(ADR-027#amend-4 계승): 시각 *방향 전환* 시에만 R2 concept 재탐색. 토큰/컴포넌트 부분 갱신은 R3/R4만(§1~§9 구조 보존, 전면 재작성 X). 대규모 재디자인(브랜드 전환)은 결정 근거를 project ADR로 권장.

## 비결정 (영구 No)
- concept 시안을 commit·영속 — 탐색용 ephemeral, DESIGN.md가 SSOT(ADR-005). concept/preview ephemeral HTML은 `.gitignore`에 *기본 등재*한다(reports·plan-reviews ephemeral 처리와 동일 — 커밋 방지). 삭제(R6)가 정상 경로이고 gitignore는 *중단 세션·로컬 보존* 대비 안전망(ADR-027#d22의 "보존 요청 시에만 gitignore"를 *기본 gitignore*로 정렬 — repo의 다른 ephemeral 처리와 일관).
- 이미지 생성·image-to-code 의존 — HTML/CSS 자기완결 시안으로 충분(ADR-006 / ADR-027#amend-2 비결정 계승).
- concept 개수 4+ — 2~3개로 비교 인지 부하 제한(YAGNI).
- DESIGN.md repo root 이동 — ADR-027#d8 유지.

## Mutation Contract (ADR-047 D3)
1. **Target** — bootstrap-design SKILL R0~R6 라운드 재구성 + `allowed-tools`(concept 정리 rm) / DESIGN.md `## 1 Overview` reference 링크 + `## 0` placeholder 주석 R0~R6 + 선택 concept 기록 / STRUCTURE.md 산출물(DESIGN_RESEARCH, design-concepts) + canonical owner / WORKFLOW.md §2 concept 선택 게이트 / PROJECT_START_CHECKLIST 3단계 design flow / README·README_ko 흐름 1줄 / .gitignore ephemeral HTML ignore / ADR-027 현재 유효 결정 + Surfaces 라벨(부분 supersede 표기).
2. **Failure mode** — DESIGN.md를 먼저 쓰고 단일 preview를 마지막에 보여줘 시각 *방향 선택* 자리가 없음 + 레퍼런스 분해 근거 미보존(관측됨, ADR-027 #d21/#d26).
3. **Predicted improvement** — R2 concept 선택 후 DESIGN.md 작성 → DESIGN.md 전면 재작성률↓, `DESIGN_RESEARCH.md` 존재율↑(UI 프로젝트). dogfood UI 라운드에서 "방향 확정 후 재작성" 감소.
4. **Preserved invariants** — DESIGN.md가 시각 SSOT / preview·concept는 derived·ephemeral(ADR-005) / Stitch 8섹션+Motion 구조·3-tier 토큰·anti-slop Don'ts(ADR-027 #5/#6/#7/#23) / skill auto-invocation 금지 / 비-UI는 DESIGN.md 삭제(파일 부재 시 중단) / `--fast`·`--update` 존재 / 종료 후 `/clear` 권장.
5. **Falsifying evaluation** — ADR-017 dogfood UI 라운드에서 concept 시안이 토큰 미확정 상태라 3안이 사실상 동일하거나, 사용자 선택 단계가 흐름을 과도하게 늘리면 결정 29를 `--concepts` opt-in으로 후퇴(기본은 R0→R1→R3→R5 직행 + R6 preview).
6. **Rollback path** — 본 ADR superseded → ADR-027 #3/#13/#21/#d22/#d26/#27 라운드 구조로 복귀(R2 concept·DESIGN_RESEARCH 제거, 단일 preview를 DESIGN.md 후행으로 환원).

## 정책 강도 (ADR-022)
- enabling(약) — 라운드 재구성·새 산출물·opt-out(`--fast`) 보유, 되돌리기 쉬움. 결정 28(노트 영속)도 enabling, fork 데이터 회수 후 재평가.

## 결과
- 사용자가 *DESIGN.md 작성 전* 다중 concept 시안으로 시각 방향을 눈으로 선택하고, 레퍼런스 분해 근거가 `DESIGN_RESEARCH.md`로 보존된다. ADR-027은 DESIGN.md 내용·인터페이스 할당 SSOT로 유지.

## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT)
- .claude/skills/bootstrap-design/SKILL.md  — #d28~#d31 R0~R6 + --fast/--update
- docs/20-system/DESIGN.md                  — #d28 §1 DESIGN_RESEARCH 링크 + §0 주석 R0~R6 + #d30 선택 concept 기록
- docs/00-meta/STRUCTURE.md                  — #d28 DESIGN_RESEARCH 행 + #d29 design-concepts 행 + canonical owner
- docs/00-meta/WORKFLOW.md                   — #d29 §2 concept 선택 게이트
- .gitignore                                 — #d31 concept/preview ephemeral ignore

> 적용 위치(Surfaces 아님 — ADR-045#d3 "README·요약·문맥 언급 등재 금지"): `README.md`/`README_ko.md` 흐름 1줄 + `docs/00-meta/PROJECT_START_CHECKLIST.md` design flow 단계는 *마이그레이션 적용 대상*이지 fan-out surface가 아니다(단순 참조 `[ADR-049]` 토큰만 유지, 역방향 미점검 — ADR-045#d4).

## 참고
- ADR-027 (DESIGN.md 내용·인터페이스 할당 SSOT — 본 ADR이 라운드 구조 #3/#13/#21/#d22/#d26/#27 supersede. ADR-027은 accepted 유지)
- ADR-005 (SSOT — concept/preview는 derived view)
- ADR-048 (디자인 MCP grounding access — R0 reference grounding이 연결된 디자인 MCP를 쓸 때)
- ADR-040 (research-pack — R0 reference grounding 보조), ADR-022 (Ratchet), ADR-047 D3 (Mutation Contract), ADR-019 (context minimal)
```

---

## Step B2 — `ADR-027` 부분 supersede 표기

**파일**: `docs/90-decisions/boilerplate/ADR-027-interface-decision-allocation.md`

`## 현재 유효 결정` 블록(8~12행)에 라운드 구조 이관 사실을 1줄 추가한다.

**기존 (8~12행):**
```markdown
## 현재 유효 결정
- 시각 결정은 `DESIGN.md`(UI 한정, Stitch 8섹션 + Motion 확장), 인터페이스 결정은 ARCHITECTURE `## 7-1`(API)/`## 7-2`(CLI)/`## 7-3`(백엔드)/`## 7-4`(프론트)에 둔다.
- `/bootstrap-design`(R0~R5 + `--fast` + `--update`)이 DESIGN.md를, `/bootstrap-stack`이 7-1~7-4를 채운다.
- cross-surface enforcement(plan/validate-plan/stabilize/templates/reviewer)는 #amend-1이 SSOT. anti-slop·lint·R5 시안·Motion 정정은 #amend-2. UI 판정 다중신호 절차는 #amend-3. `--update`는 #amend-4.
- 적용 파일 전체는 아래 `## Surfaces` 참조.
```

**수정 후:**
```markdown
## 현재 유효 결정
- 시각 결정은 `DESIGN.md`(UI 한정, Stitch 8섹션 + Motion 확장), 인터페이스 결정은 ARCHITECTURE `## 7-1`(API)/`## 7-2`(CLI)/`## 7-3`(백엔드)/`## 7-4`(프론트)에 둔다.
- **`/bootstrap-design`의 *워크플로우 라운드 구조*(레퍼런스→원칙→시안→토큰→DESIGN.md→preview 순서·시점)는 ADR-049가 supersede(R0~R6 concept-mockup-first + 레퍼런스 노트). 본 ADR은 *DESIGN.md 내용*(아래 #5 Stitch 8섹션+Motion / #6 3-tier 토큰 / #7·#23 Don'ts)과 *ARCH 7-x 인터페이스 할당* SSOT만 유지.** 본 ADR #3/#13/#21/#d22/#d26/#27의 라운드 구조·시안 시점·preview lifecycle(삭제 시점·gitignore 정책) 기술은 historical(net 규칙은 ADR-049). design-preview.html *산출물*은 ADR-049 R6이 계속 사용.
- `/bootstrap-stack`이 7-1~7-4를 채운다.
- cross-surface enforcement(plan/validate-plan/stabilize/templates/reviewer)는 #amend-1이 SSOT. anti-slop·lint·Motion 정정은 #amend-2. UI 판정 다중신호 절차는 #amend-3. `--update`는 #amend-4(라운드 구조는 ADR-049).
- 적용 파일 전체는 아래 `## Surfaces` 참조.
```

> ADR-027 status는 **accepted 유지**(superseded 처리 X — 내용/인터페이스 SSOT 살아 있음). 단 ADR-027 `## Surfaces`의 `bootstrap-design` 라벨이 가리키는 `#amend-2 R5/R0`(=#d21 R5 시안·#d26 R0 grounding)은 ADR-049로 이관되므로 **라벨을 재지정**한다(아래 B2-2 — 방치하면 라벨 내용이 실제와 불일치). bootstrap-design SKILL은 ADR-027·ADR-049 **둘 다** 역참조하게 된다(Step B3).

### B2-2. ADR-027 `## Surfaces` bootstrap-design 라벨 재지정 (stale 라벨 정정)

`#amend-2 R5/R0`(#d21/#d26)은 ADR-049로 supersede됐다. bootstrap-design이 *여전히* ADR-027 surface인 근거는 — R5 저장의 canonical 8섹션 순서(#d5) + R2 생성·R6 self-check의 §9 Don'ts(#amend-2 #d23) + `--update`(#amend-4) — 이므로 라벨을 이에 맞춘다.

**기존:**
```markdown
- .claude/skills/bootstrap-design/SKILL.md           — #amend-2 R5/R0, #amend-4 --update
```

**수정 후:**
```markdown
- .claude/skills/bootstrap-design/SKILL.md           — #amend-2 §9 Don'ts self-check(R2 생성·R6 점검) + canonical 8섹션 순서(R5 저장), #amend-4 --update; 라운드 구조·시안 시점은 ADR-049
```

---

✅ **여기까지 커밋 B1** (ADR-049 본문 + ADR-027 표기 + 인덱스 + AGENTS는 추가 없음):

추가로 인덱스 1줄(아래) 포함 후 커밋:

**파일**: `docs/90-decisions/boilerplate/README.md` — Step A4-1에서 추가한 `| 048 |` 줄 **다음**에:
```markdown
| 049 | Concept-mockup-first 디자인 흐름 + 레퍼런스 리서치 노트 | accepted | — | /bootstrap-design 라운드 재구성 R0~R6(DESIGN.md 작성 전 다중 concept 시안 선택) + DESIGN_RESEARCH.md 노트. ADR-027 라운드 구조 #3/#13/#21/#d22/#d26/#27 supersede(ADR-027은 내용·인터페이스 SSOT 유지) |
```

```
docs(adr): add ADR-049 concept-mockup-first design flow superseding ADR-027 round structure
```

---

## Step B3 — `/bootstrap-design` SKILL 전면 재작성 (R0~R6)

**파일**: `.claude/skills/bootstrap-design/SKILL.md`

이 파일을 **아래 내용으로 전체 교체**한다. (구조: frontmatter → 트리거 → 모드 → --update → 반드시 읽을 파일/할 일 → R0~R6 → 종료 후 → Context 정책.)

```markdown
---
name: bootstrap-design
description: UI 시각 결정 발굴 라운드 (R0~R6). 레퍼런스 노트 + DESIGN.md 작성 전 다중 concept 시안 선택. DESIGN.md 채움. UI 스택 포함 프로젝트 전용.
argument-hint: "[product description | --fast | --update]"
disable-model-invocation: true
allowed-tools: Read Glob Grep Write Edit Agent Bash(rm docs/20-system/design-preview.html) Bash(rm docs/20-system/design-concepts/concept-*.html)
context-pack: minimal
---

# /bootstrap-design

> 모드: How-to (UI 시각 결정 라운드)
> 패턴: `discover-product` 차용 — `context: fork`를 명시하지 않아 메인 세션이 R0~R6를 직접 운전한다. R0(레퍼런스 분해)과 R1(원칙 추출)의 무거운 추론은 `Agent` 도구로 architect를 단발 sub-call로 위임. 종료 후 사용자가 `/clear` 권장 (R0~R6 인터랙션이 다음 task 컨텍스트에 잡음).
> 라운드 구조 SSOT는 ADR-049(concept-mockup-first). DESIGN.md *내용*(8섹션+Motion / 3-tier 토큰 / Don'ts)·인터페이스 할당 SSOT는 ADR-027.

## 트리거
- `/bootstrap-stack` 종료 출력에 "frontend 감지됨. `/bootstrap-design` 권장" 텍스트 한 줄. 사용자 발화로 시작.
- 비-UI 프로젝트는 호출되지 않음 (ADR-031 직접 지원 범위 밖).
- 본 skill은 baseline placeholder DESIGN.md를 *채우는* 흐름. 비-UI 프로젝트는 fork 직후 DESIGN.md를 삭제했음을 전제. 파일 부재 시 작업 중단 + 사용자에게 보고.

## 모드
- `--fast`: R0(레퍼런스 1개 + `DESIGN_RESEARCH.md` minimal 1~2줄) + R1(원칙 1줄 minimal) + R3(토큰) + R5(저장 — 축약 섹션). **R2(concept 시안)·R4(컴포넌트 인벤토리)·R6(preview)는 생략** — R5 저장은 *생략하지 않는다*(생략하면 DESIGN.md 가 안 채워져 skill 목적 무산). R1은 *완전 생략 금지* — R3 토큰 결정의 근거이므로 *minimal 1줄*(예: "monochrome + 1 accent")이라도 채운다. `--fast`에서 concept 시안이나 preview가 필요하면 종료 후 사용자가 "concept 시안 생성" 또는 "design-preview 생성"을 명시 발화 → R2 또는 R6만 단독 수행.
- 기본: R0~R6 모두.
- `--update`: 기존 DESIGN.md가 있을 때의 부분 갱신/재디자인 모드(아래 `## --update 모드`). 처음부터 R0~R6를 다시 돌지 않는다.

## --update 모드 (재디자인/부분 갱신, ADR-049 / ADR-027#amend-4)
기존 `docs/20-system/DESIGN.md`가 채워져 있을 때:
- 처음부터 R0~R6를 다시 돌지 않는다. 변경 필요한 부분만 갱신:
  - R0(레퍼런스 재확인 + `DESIGN_RESEARCH.md` 갱신) — *선택*. 시각 방향 자체가 바뀔 때만.
  - R2(concept 시안 재탐색) — *시각 방향 전환 시에만*. 토큰/컴포넌트만 손보면 생략.
  - R3/R4 — 바뀐 토큰·컴포넌트만 부분 갱신(미변경 토큰·§1~§9 구조 보존, 전면 재작성 X).
  - R5 — 저장(변경분 반영).
  - R6 — 시각 방향이 크게 바뀌면 preview 재생성·검토 루프(아니면 생략).
- 대규모 재디자인(브랜드/방향 전환)은 *결정 근거*를 ADR로 남길 것을 권장(시각 방향 변경은 되돌리기 비용이 큼).

## 반드시 먼저 읽을 파일
- `docs/10-charter/PROJECT_CHARTER.md` (페르소나·시나리오 — concept 대표 화면 입력)
- `docs/20-system/ARCHITECTURE_OVERVIEW.md` (스택)
- `docs/20-system/DESIGN.md` (현재 placeholder)

## 반드시 수행할 일
- 본 skill은 baseline placeholder `docs/20-system/DESIGN.md`를 *채운다* (생성 X). 파일이 없으면 fork 사용자가 비-UI 프로젝트로 판단해 삭제한 경우 — 작업 중단 + 사용자에게 *"본 프로젝트는 비-UI라 판단됨. /bootstrap-design 실행 의도 확인 필요"* 보고.
- DESIGN.md 본문 상단 주석(`baseline placeholder`)을 변경하지 않는다 — 정책 SSOT는 STRUCTURE.md presence 컬럼 + 본 파일 주석.

## R0 — 레퍼런스 추출 + 안티-레퍼런스 + 레퍼런스 노트 영속화 (ADR-049#d28)
- 좋아하는 제품 1~3개 (예: Linear / Notion / Stripe / Vercel / Arc / Things)의 시각 메커니즘 분해:
  - color signature
  - typography pairing
  - density
  - motion 톤
- **안티-레퍼런스 1~2개 필수**: "purple gradient generic SaaS 같지 말 것", "indigo-on-slate Tailwind 디폴트 회피".
- architect 단발 sub-call로 분해 가능.
- **(옵션) reference-evidence grounding** (ADR-049#d28 / ADR-048 — 기본 의존 추가 X, *가용한 것*만): 사용자 제공 URL/스크린샷, 또는 연결돼 있다면 디자인 MCP 화면 리서치(lazyweb 무료 / mobbin 유료 — `STACK_SETUP_PLAN ## Optional MCP Connectors`에 `agent access` 부여된 경우만 호출), 또는 사전추출 라이브러리(refero.design / getdesign.md)에서 1~3개 레퍼런스를 근거로 본다. **MCP·계정 도구를 보일러플레이트 기본 의존으로 추가하지 않는다** — agent가 기본 브라우징 불가하면 사용자가 URL·스크린샷을 직접 제공.
- **레퍼런스 노트 영속화 (필수, `--fast`는 minimal)**: 위 분해 결과를 `docs/20-system/DESIGN_RESEARCH.md`에 *문서로* 남긴다. 양식:

  ```markdown
  # 디자인 리서치 (레퍼런스 + 시안 선택 근거)

  > 모드: Reference (DESIGN.md 시각 방향의 근거 — /bootstrap-design R0/R2 산출)
  > SSOT는 DESIGN.md(확정 결정). 본 노트는 *왜 그 방향인가*의 근거 보존.
  - 조사일: <YYYY-MM-DD>

  ## 레퍼런스   <!-- R0 -->
  ### <제품명> — <URL 또는 출처(사용자 제공 / MCP / 라이브러리)>
  - color signature: <...>
  - typography pairing: <...>
  - density: <...>
  - motion 톤: <...>
  - **what to borrow**: <1~2줄>
  - **what to avoid**: <1~2줄>

  (레퍼런스 1~3개 반복)

  ## 안티-레퍼런스   <!-- R0 -->
  - <"~같지 말 것"> — <이유 1줄>

  ## grounding 출처   <!-- R0 -->
  - <사용자 URL / 디자인 MCP 이름 / refero·getdesign.md / "직접 제공 없음 — 모델 지식 기반">

  ## 시안 옵션   <!-- R2 — concept별 방향·근거 (선택 후 채움) -->
  - concept A: <방향 한 줄> — <레퍼런스/원칙 근거>
  - concept B: <...>
  - (concept C: <...>)

  ## 최종 선택   <!-- R2 -->
  - 선택: <A / B / 하이브리드("A 색 + B 타이포")> — <선택 이유 1~2줄>
  ```

- DESIGN.md `## 1 Overview`는 본 노트를 *상대경로 링크*(`[디자인 리서치](DESIGN_RESEARCH.md)`)하고 핵심 1~2줄(what to borrow / avoid 요약)만 인라인. `## 시안 옵션`·`## 최종 선택`은 R2 종료 후 채운다(아래 R2-2).

## R1 — 디자인 원칙 3~5개
- actionable verb. 모호어("modern/clean/sleek") 금지.
- 예: "정보 밀도 우선", "monochrome + 1 accent", "motion은 의미 전달용만".
- `--fast` 모드에서도 *최소 1줄*은 필수.

## R2 — 다중 concept 시안 (DESIGN.md 작성 *전* 시각 방향 선택, ADR-049#d29)

> 목적: DESIGN.md(토큰 텍스트)를 쓰기 *전에* 사용자가 **눈으로 시각 방향을 선택**한다. 방향 확정 후 토큰/DESIGN.md를 그 방향에서 파생 → DESIGN.md 전면 재작성 비용 회피. (`--fast`는 본 라운드 생략.)

### R2-1. 생성
- R1 원칙 + R0 레퍼런스(`DESIGN_RESEARCH.md`) + DESIGN.md `## 9` Don'ts에 근거해 **서로 다른 시각 방향 2~3개**를 생성한다. 각 방향을 자기완결 HTML/CSS 파일로 `docs/20-system/design-concepts/concept-A.html`, `concept-B.html`, (`concept-C.html`)에 저장(빌드·외부 의존 0 — CSS는 `<style>` 인라인). 디렉터리가 없으면 생성.
- 각 concept은 *방향이 분명히 다르게*: 예) A=고밀도 monochrome+1 accent / B=여백 큰 serif heading / C=다크 우선 + 절제된 accent. 단 모든 concept이 R0 안티-레퍼런스와 `## 9` Don'ts(보라 gradient, nested card, center-align 남발 등)는 공통 회피.
- 모든 concept은 charter `## 2.1 페르소나` / `## 3.1 핵심 시나리오` 기반 **동일 대표 화면**(예: 랜딩 hero / 입력 폼 / 카드 리스트)을 렌더해 *직접 비교* 가능하게 한다.
- 각 파일 상단 GENERATED 헤더 주석 필수:
  ```html
  <!--
    GENERATED concept 시안 — /bootstrap-design R2. CANDIDATE — DESIGN.md(SSOT) 아님 (방향 선택용 임시 파일).
    선택·승인 후 R6에서 삭제. 직접 편집 금지(피드백은 재생성으로 반영).
    concept: <A/B/C> — <방향 한 줄 요약>
  -->
  ```

### R2-2. 선택 루프
- 사용자에게 안내: *"브라우저에서 `docs/20-system/design-concepts/concept-*.html`를 열어 비교하고, 선호 방향(또는 하이브리드: 예 'A 색 + B 타이포')을 알려주세요."*
- 피드백 수령 시 필요하면 concept을 *재생성*(직접 편집 X). 사용자가 한 방향(또는 하이브리드)을 *선택*할 때까지 반복.
- **선택 전에는 R3~R6로 진행하지 않는다.** 하이브리드 선택이면 그 조합을 메모로 확정.
- 선택 확정 시 *각 concept의 방향·근거 + 최종 선택 이유*를 `docs/20-system/DESIGN_RESEARCH.md`의 `## 시안 옵션` / `## 최종 선택`에 기록(근거 추적 — DESIGN.md는 최종 *결정*만 담는다, ADR-049#d28).

## R3 — 디자인 토큰 (선택 concept에서 추출, W3C DTCG + Stitch 정렬 — ADR-027#d6)
- **선택된 concept(R2)의 CSS에서 토큰을 추출**해 3-tier로 정리: primitive → semantic → component.
- **`--fast` fallback (R2 생략 — concept 없음)**: concept CSS가 없으므로 R1 원칙 + R0 레퍼런스(`DESIGN_RESEARCH.md`)에서 토큰을 *직접* 도출한다(구 `--fast`의 자기완결 토큰 흐름 보존 — concept 결합으로 인한 소스 공백 방지).
- color: brand 1 + neutral 1 + accent 1 + semantic 4 (success/warning/error/info), 12~16 hex.
- typography: 1~2 family, 4~5 size scale, modular ratio (1.125/1.25/1.333), weight pair.
- spacing: 4 or 8 base, t-shirt scale 또는 numeric.
- radius / shadow / motion (duration·easing·`prefers-reduced-motion`).
- WCAG 4.5:1 텍스트 대비 검증 권장.

## R4 — 컴포넌트 인벤토리 + 상태 매트릭스 (ADR-027#d6/#d7)
- primitives (Button/Input/Text/Icon), composites (Card/Modal/Toast), patterns (Form/EmptyState/ErrorState/LoadingState).
- 각 컴포넌트마다 상태 매트릭스 강제: default / hover / active / focus / disabled / loading / error / empty.
- 스택별 시작점:

  | 스택 | 시작점 |
  |------|--------|
  | React/Next.js | shadcn/ui (Radix + CSS 변수) |
  | Vue | shadcn-vue |
  | Svelte | shadcn-svelte |
  | Astro | shadcn 패턴 + Astro 어댑터 |
  | RN/Expo *(ADR-031 override 시)* | Tamagui |
  | Flutter *(ADR-031 override 시)* | ShadCN-Flutter 또는 Material 3 |
  | SwiftUI *(ADR-031 override 시)* | Apple HIG 토큰 직접 정의 |

  기본 자동화 직접 지원 스택: React/Vue/Svelte/Astro. RN·Flutter·SwiftUI는 ADR-031 override 경로.

## R5 — `docs/20-system/DESIGN.md` 저장 (선택 concept에서 authoring, ADR-049#d30)
- 섹션 순서를 Stitch DESIGN.md canonical에 정렬(ADR-027#d5): Overview / Colors / Typography / Layout / Elevation & Depth / Shapes / Components / Motion / Do's and Don'ts.
- 토큰은 fenced `yaml` 블록 또는 frontmatter YAML로.
- `## 1 Overview`에: (a) `DESIGN_RESEARCH.md` 상대경로 링크 + what-to-borrow/avoid 1~2줄, (b) `선택 concept: <X>(+하이브리드 메모)` 한 줄(ADR-049#d30).

## R6 — DESIGN.md 파생 최종 preview + 검토 루프 + 정리 (ADR-049#d31, 구 ADR-027#d21·#d22 계승)

> 목적: 확정된 DESIGN.md(SSOT)가 *충실히 렌더되는지* 최종 확인. R2에서 방향은 이미 선택됨 — R6은 SSOT 충실도 확인. DESIGN.md가 *SSOT*, preview는 *검토용 임시 파일*(ADR-005). 사용자가 R2 concept 승인으로 충분하다 판단하면 R6 preview 생략 가능(그 경우 concept만 정리).

### R6-1. 생성
- `docs/20-system/DESIGN.md`의 토큰·컴포넌트만으로 **단일 자기완결 HTML** `docs/20-system/design-preview.html`를 생성한다(빌드·외부 의존 0 — CSS는 `<style>` 인라인).
- DESIGN.md `## 2~6` 토큰은 `:root { --token: value; }` CSS custom property로 옮기고, 모든 요소가 *그 변수만* 참조하게 한다(DESIGN.md가 SSOT임이 구조로 드러나도록 — raw hex 직접 사용 금지).
- 파일 상단 GENERATED 헤더 주석 필수:
  ```html
  <!--
    GENERATED FROM docs/20-system/DESIGN.md — 검토용 임시 파일(검토 완료 시 삭제). 직접 편집 금지.
    SSOT는 DESIGN.md. 수정은 DESIGN.md → /bootstrap-design R6 재생성.
    생성 기준: <DESIGN.md 갱신 시각 / 생성 일시>
  -->
  ```
- preview가 포함할 섹션(순서):
  1. **Tokens** — color(primitive/semantic/component) swatch + hex + 텍스트 대비비 표시 / typography scale(각 size·weight 샘플) / spacing scale(시각 막대) / radius·shadow 샘플.
  2. **Components** — DESIGN.md `## 7` 인벤토리의 각 컴포넌트를 8 상태(default/hover/active/focus/disabled/loading/error/empty)로 나란히 렌더. hover/active/focus는 CSS pseudo + *상태 클래스 변형*(예: `.is-hover`)을 둘 다 둬서 정적 캡처에서도 보이게 한다.
  3. **대표 화면 2~3개** — charter `## 2.1 페르소나` / `## 3.1 핵심 시나리오` 기반 실사용 맥락. (R2 선택 concept과 일관되어야 — 불일치 시 DESIGN.md를 먼저 점검.)
- 생성 직후 DESIGN.md `## 9 Do's and Don'ts` 위반을 self-check해 위반 의심 항목을 출력에 보고(자동 차단 X).

### R6-2. 검토 루프
- 사용자에게 안내: *"브라우저에서 `docs/20-system/design-preview.html`를 열어 확인하고 피드백 주세요."*
- 피드백 수령 시 **반드시 DESIGN.md(SSOT)를 먼저 수정** → 그 다음 preview 재생성. (preview를 먼저 고치지 않는다.)
- 사용자가 *승인*할 때까지 반복. 승인 전에는 R6-3(정리)과 `/plan-workitem` 권장을 수행하지 않는다.
- `--fast`에서는 R6를 생략(위 `## 모드`). 사용자가 명시 요청 시 R6만 단독 수행.

### R6-3. 정리 (concept 시안 + preview 삭제)
- 사용자가 *승인*하면 `docs/20-system/design-concepts/concept-*.html` (R2 산출) + `docs/20-system/design-preview.html` (R6 산출)를 **삭제**한다. 둘 다 검토용 임시 산출물이고, 확정 시각 결정은 DESIGN.md(SSOT)에, 레퍼런스 근거는 `DESIGN_RESEARCH.md`에 영속돼 있으며, 필요하면 R2/R6 단독 실행으로 재생성 가능하다.
- 삭제 후 사용자에게 "시안·preview 검토 완료 — concept/preview 삭제됨 (재생성: `/bootstrap-design` R2/R6)" 1줄 안내.
- **참고**: `docs/20-system/design-concepts/`·`docs/20-system/design-preview.html`는 `.gitignore`에 *기본 등재*돼 있어(커밋 방지 — ADR-049#d31) 보존 요청 시 *로컬 유지*만 하면 된다(commit 안 됨). 삭제가 정상 경로 — 확정 결정은 DESIGN.md(SSOT)·근거는 DESIGN_RESEARCH.md에 영속.

## 종료 후
- 사용자가 `/clear` 권장. R0~R6가 인터랙션 길어지면 다음 task의 컨텍스트에 잡음.

마지막 출력:
- `docs/20-system/DESIGN.md` 경로
- `docs/20-system/DESIGN_RESEARCH.md` 경로 (레퍼런스 노트)
- 선택된 concept: <A/B/C 또는 하이브리드 메모>
- concept/preview 시안 상태: 삭제됨(승인 후 — 기본) / 유지(보존 요청 시) / 미생성(`--fast`). 재생성: `/bootstrap-design` R2/R6
- 채워진 섹션 요약
- 남은 열린 질문
- 다음 권장 단계: **사용자가 시안을 승인한 뒤** `/plan-workitem` (또는 `/implement-workitem`). 미승인 상태면 "concept 선택·preview 검토 먼저" 안내.

## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 ADR/architecture 섹션은 task 본문에서 발화 시 인용 — 사전 fork-load 금지.
```

> ⚠️ 검증 포인트(교체 후 확인):
> - frontmatter `allowed-tools`에 `Bash(rm docs/20-system/design-concepts/concept-*.html)` 추가됨 (concept 정리용). **단 glob(`*`) rm 권한 매처는 환경에 따라 confirm/미매칭될 수 있고, 이 환경은 PowerShell(`rm`=`Remove-Item`)이라 자동 정리가 부분 무력화될 수 있다 — 저위험: 정리는 *선택*이고 `.gitignore`(B9)가 커밋 안전망. 미매칭 시 정확 경로 `rm`으로 대체하거나 사용자 confirm 1회로 충분.**
> - 본문이 ADR-049 + ADR-027 **둘 다** 역참조 (ADR-045#d4 — 양 ADR Surfaces에 등재. ADR-027 라벨은 B2-2에서 §9 Don'ts/canonical/--update로 재지정).
> - R5(저장)·R6(preview)·`--fast`(R3 토큰 fallback 포함)·`--update`의 기존 invariant(DESIGN.md SSOT / preview·concept ephemeral / 파일 부재 시 중단) 보존.

---

## Step B4 — DESIGN.md `## 1 Overview` 주석 보강

**파일**: `docs/20-system/DESIGN.md`

`## 1. Overview`의 주석(14행)을 레퍼런스 링크 + 선택 concept 기록 안내로 보강한다.

**기존 (13~14행):**
```markdown
## 1. Overview
<!-- 디자인 원칙 3~5개 (actionable verb. "modern/clean/sleek" 같은 모호어 금지) -->
```

**수정 후:**
```markdown
## 1. Overview
<!-- 디자인 원칙 3~5개 (actionable verb. "modern/clean/sleek" 같은 모호어 금지).
     + [디자인 리서치](DESIGN_RESEARCH.md) 링크 + what-to-borrow/avoid 1~2줄 (ADR-049#d28).
     + `선택 concept: <X>(+하이브리드 메모)` 한 줄 (ADR-049#d30 — /bootstrap-design R2 선택 결과). -->
```

> DESIGN.md는 baseline placeholder라 주석만 보강한다(본문은 `/bootstrap-design`이 채움). 상단 `baseline placeholder` 구조 주석(presence/비-UI 삭제 안내)은 건드리지 않되, **라운드 수가 stale해지지 않도록 B4-2에서 `R0~R5`→`R0~R6`만 1글자 갱신**한다.

### B4-2. DESIGN.md `## 0. Status` placeholder 주석의 라운드 수 갱신 (stale 방지)

baseline DESIGN.md는 모든 fork에 배포되므로 주석의 라운드 수가 정확해야 한다(사용자 직면).

**기존 (placeholder 주석 중 1줄):**
```markdown
     - UI 프로젝트: /bootstrap-design이 R0~R5 라운드로 본 파일을 채운다.
```

**수정 후:**
```markdown
     - UI 프로젝트: /bootstrap-design이 R0~R6 라운드로 본 파일을 채운다 (ADR-049).
```

> 나머지 placeholder 주석(presence: conditional / 비-UI 삭제 안내)은 그대로 둔다.

---

✅ **여기까지 커밋 B2** (bootstrap-design 재작성 + DESIGN.md 주석):
```
feat(design): restructure bootstrap-design to reference-note plus concept-mockup-first rounds
```

---

## Step B5 — STRUCTURE.md 산출물 + canonical owner

**파일**: `docs/00-meta/STRUCTURE.md`

### B5-1. 산출물 표에 2행 추가 + 기존 preview 행 R5→R6 정정

**기존 (32~33행):**
```markdown
| design (UI only) | `docs/20-system/DESIGN.md` | `/bootstrap-design` (UI 스택 포함 시) | Living | conditional |
| design preview (UI only, 검토용 임시 — 승인 후 삭제) | `docs/20-system/design-preview.html` | `/bootstrap-design` (R5, 검토 후 삭제) | ephemeral | conditional |
```

**수정 후:**
```markdown
| design (UI only) | `docs/20-system/DESIGN.md` | `/bootstrap-design` (UI 스택 포함 시) | Living | conditional |
| design research note (UI only) | `docs/20-system/DESIGN_RESEARCH.md` | `/bootstrap-design` (R0 레퍼런스 + R2 선택 근거) | Reference | conditional |
| design concept mockups (UI only, 검토용 임시 — 선택·승인 후 삭제) | `docs/20-system/design-concepts/concept-*.html` | `/bootstrap-design` (R2, 선택 후 R6 삭제) | ephemeral | conditional |
| design preview (UI only, 검토용 임시 — 승인 후 삭제) | `docs/20-system/design-preview.html` | `/bootstrap-design` (R6, 검토 후 삭제) | ephemeral | conditional |
```

### B5-2. Canonical Owner 표 — DESIGN.md 행 보강 + 신규 1행

**기존 (94행):**
```markdown
| UI 시각 디자인 | `docs/20-system/DESIGN.md` (SSOT). 검토용 파생 뷰 `docs/20-system/design-preview.html` 는 `/bootstrap-design` R5 가 *DESIGN.md 로부터* 생성하고 검토 완료 후 삭제 — 직접 편집·영속 금지 (ADR-027#amend-2 / ADR-005). |
```

**수정 후:**
```markdown
| UI 시각 디자인 | `docs/20-system/DESIGN.md` (SSOT). 검토용 파생 뷰 `design-preview.html`(R6) 와 방향 선택용 `design-concepts/concept-*.html`(R2) 는 `/bootstrap-design` 이 생성하고 검토·선택 완료 후 삭제 — 직접 편집·영속 금지 (ADR-005). |
| UI 디자인 워크플로우 라운드 구조 (R0~R6 concept-first) + 레퍼런스 노트 | [ADR-049](../90-decisions/boilerplate/ADR-049-concept-mockup-first-design.md) (정책 SSOT — 라운드 구조·시안 시점). → ADR-049 `## Surfaces` 참조. DESIGN.md *내용*·인터페이스 할당은 [ADR-027](../90-decisions/boilerplate/ADR-027-interface-decision-allocation.md). |
```

> 기존 `| DESIGN.md + ARCH 7-1~7-4 cross-surface enforcement | ADR-027 ... |` 행(104행)은 **그대로 둔다**(ADR-027 소관 유지).

---

## Step B6 — WORKFLOW.md §2 concept 선택 게이트

**파일**: `docs/00-meta/WORKFLOW.md`

**기존 (10~11행):**
```markdown
- `docs/20-system/DESIGN.md`는 baseline placeholder(presence: conditional). UI 프로젝트는 `/bootstrap-design`이 본 파일을 채우고, 비-UI 프로젝트는 fork 직후 본 파일을 삭제한다. **삭제 시 `AGENTS.md`의 `[시각 디자인](docs/20-system/DESIGN.md)` 링크 줄(약 38행)도 함께 제거한다**(dangling 방지).
- UI 프로젝트는 `/bootstrap-design` R5가 `docs/20-system/design-preview.html`(DESIGN.md 파생 뷰, 검토용 임시 파일)을 생성한다. **사용자가 시안을 브라우저로 확인·승인한 뒤** R5가 시안을 삭제하고 `/plan-workitem`으로 진행 권장 (ADR-027#d21).
```

**수정 후:**
```markdown
- `docs/20-system/DESIGN.md`는 baseline placeholder(presence: conditional). UI 프로젝트는 `/bootstrap-design`이 본 파일을 채우고, 비-UI 프로젝트는 fork 직후 본 파일을 삭제한다. **삭제 시 `AGENTS.md`의 `[시각 디자인](docs/20-system/DESIGN.md)` 링크 줄도 함께 제거한다**(dangling 방지).
- UI 프로젝트의 `/bootstrap-design` 라운드 구조는 ADR-049(concept-mockup-first): R0(레퍼런스 + `DESIGN_RESEARCH.md`) → R1(원칙) → **R2(DESIGN.md 작성 *전* 다중 concept 시안 — 사용자가 시각 방향 선택)** → R3(토큰)·R4(컴포넌트) → R5(DESIGN.md 저장) → R6(DESIGN.md 파생 preview 최종 확인). **사용자가 R2 concept 방향을 선택하고 R6 preview를 승인한 뒤** concept/preview 시안을 삭제하고 `/plan-workitem`으로 진행 권장 (ADR-049#d29·#d31). DESIGN.md *내용*·인터페이스 할당 SSOT는 ADR-027.
```

---

## Step B7 — README 흐름 1줄 (양 언어)

### B7-1. `README.md` (영문)

**기존 (22행):**
```markdown
  → /bootstrap-design (frontend only — fills DESIGN.md + a temporary design-preview.html for review, removed after approval)
```

**수정 후:**
```markdown
  → /bootstrap-design (frontend only — researches references into DESIGN_RESEARCH.md, shows multiple concept mockups to pick a direction *before* writing DESIGN.md, then a temporary design-preview.html for final review; mockups removed after approval) [ADR-049]
```

### B7-2. `README_ko.md` (국문)

**기존 (22행):**
```markdown
  → /bootstrap-design (UI 전용 — DESIGN.md 채움 + 검토용 임시 design-preview.html 생성, 승인 후 삭제)
```

**수정 후:**
```markdown
  → /bootstrap-design (UI 전용 — 레퍼런스를 DESIGN_RESEARCH.md로 조사 + DESIGN.md 작성 *전* 다중 concept 시안으로 방향 선택 + 최종 검토용 design-preview.html, 승인 후 시안 삭제) [ADR-049]
```

> README line 75(ko 74)의 `/bootstrap-design`이 "DESIGN.md를 채운다 (ADR-027)" 문장은 **그대로 둔다** — ADR-027은 여전히 내용 SSOT라 정확. (원하면 `(ADR-027/ADR-049)`로 보강 가능하나 필수 아님.)

## Step B8 — PROJECT_START_CHECKLIST 디자인 흐름 단계 정확도

**파일**: `docs/00-meta/PROJECT_START_CHECKLIST.md`

`## 3. guardrail 추가`의 `/bootstrap-design` 체크 항목을 새 흐름(레퍼런스 + concept 선택)에 맞춘다.

**기존:**
```markdown
- [ ] (프론트엔드 스택이면) `/bootstrap-design`을 실행해 `docs/20-system/DESIGN.md`를 채웠다
```

**수정 후:**
```markdown
- [ ] (프론트엔드 스택이면) `/bootstrap-design`을 실행해 레퍼런스 조사(`DESIGN_RESEARCH.md`) + concept 시안 방향 선택을 거쳐 `docs/20-system/DESIGN.md`를 채웠다 (ADR-049)
```

> `## 6. 첫 커밋 전`의 비-UI DESIGN.md 삭제 항목은 그대로 둔다(흐름 무관). DESIGN_RESEARCH.md·design-concepts는 ephemeral/conditional이라 비-UI 삭제 항목에 별도 추가 불필요(애초에 생성 안 됨).

## Step B9 — `.gitignore`에 ephemeral 디자인 HTML 등재 (`#d31`)

**파일**: `.gitignore`

repo가 이미 모든 ephemeral 산출물(`reports/*.md`, `plan-reviews/*.md`, `discovery-reviews/*.md`)을 gitignore하는 것과 동일하게, concept/preview HTML을 등재한다(중단 세션·로컬 보존 시 우발 commit 방지).

**기존 (마지막 블록):**
```gitignore
docs/40-validation/discovery-reviews/*.md
!docs/40-validation/discovery-reviews/.gitkeep
```

**그 아래에 추가:**
```gitignore
docs/40-validation/discovery-reviews/*.md
!docs/40-validation/discovery-reviews/.gitkeep
# design exploration/preview (ephemeral, never committed — ADR-049#d31 / ADR-027#d22): concept 시안 + DESIGN.md 파생 preview
docs/20-system/design-concepts/
docs/20-system/design-preview.html
```

> `DESIGN_RESEARCH.md`는 *커밋되는 Reference 문서*라 **gitignore하지 않는다**(ephemeral HTML만 ignore).

---

✅ **여기까지 커밋 B3** (STRUCTURE + WORKFLOW + README + CHECKLIST + .gitignore):
```
docs(design): surface design-research note and concept mockups across structure/workflow/readme/gitignore
```

---

# PART C — 적용 후 검증 (필수)

모든 커밋 후 아래를 **순서대로** 확인한다. (이 보일러플레이트는 코드 빌드가 없으므로 검증은 문서 정합성 위주.)

### C1. ADR 양방향 정합 (ADR-045#d3/#d4)
- `ADR-048`/`ADR-049`의 `## Surfaces`에 등재된 **모든 파일**이 본문 어딘가에 해당 ADR을 정규 ID(`ADR-048`/`ADR-049`)로 **역참조**하는지 grep으로 확인:
  - `ADR-048` 역참조 대상: STACK_SETUP_PLAN_TEMPLATE / plan-workitem / implement-workitem / validate-workitem / validator.md / bootstrap-stack / **stabilize-milestone(3-P)** — 위 Step에서 각 편집에 `(ADR-048...)` 토큰을 넣었으므로 충족.
  - `ADR-049` 역참조 대상 (`## Surfaces` 5종): bootstrap-design / DESIGN.md / STRUCTURE.md / WORKFLOW.md / **.gitignore(주석 `ADR-049#d31`)** — 각 편집에 `ADR-049` 토큰 포함됨. **(`README.md`/`README_ko.md`/`PROJECT_START_CHECKLIST.md`는 Surfaces가 아니라 *적용 대상*(ADR-045#d3) — 단순 `[ADR-049]` 토큰만 두며 D4상 역방향 미점검이므로 surface backref 의무 없음.)**
- 확인 명령(PowerShell — surface backref만 점검):
  ```powershell
  Select-String -Path .claude/skills/*/SKILL.md, .claude/agents/validator.md, docs/00-meta/_templates/STACK_SETUP_PLAN_TEMPLATE.md -Pattern "ADR-048"
  Select-String -Path .claude/skills/bootstrap-design/SKILL.md, docs/20-system/DESIGN.md, docs/00-meta/STRUCTURE.md, docs/00-meta/WORKFLOW.md, .gitignore -Pattern "ADR-049"
  ```

### C2. 인덱스 정합
- `docs/90-decisions/boilerplate/README.md`에 `| 048 |`·`| 049 |` 행이 있고 Status `accepted`인지 확인.
- `_ADR_GUIDE.md` "새 ADR 추가 절차" 3단계(본문 / 인덱스 / agent·skill 링크) 모두 충족됐는지 체크.

### C3. 줄번호 참조 금지 (ADR-045#d1)
- 새로 작성한 ADR/편집에 `L+숫자`·"약 NN행" 같은 줄번호 참조가 없는지 확인. (본 가이드의 "약 38행" 등은 *가이드 설명용*이고, 실제 파일 본문에는 줄번호를 넣지 않는다 — WORKFLOW.md 수정본에서 "약 38행"을 뺀 것 확인.)

### C4. AGENTS.md 길이 (ADR-011)
- `(Get-Content AGENTS.md | Measure-Object -Line).Lines` 가 **100 이하**인지 확인(현재 55 예상).

### C5. dangling 링크
- `docs/20-system/DESIGN_RESEARCH.md`는 `/bootstrap-design` 실행 시 생성되는 *generated* 산출물이라 baseline에는 없다 — DESIGN.md `## 1` 주석의 링크는 *예시 안내*이므로 baseline에서 dangling이 아니다(주석 안). 단, STRUCTURE.md 산출물 표에 `generated`가 아니라 `conditional`로 적었는지 확인(presence 정의상 UI에서만 존재).
- `design-concepts/` 디렉터리는 `/bootstrap-design` R2가 생성 — baseline에 빈 디렉터리를 만들지 않는다(불필요).

### C6. (선택) dogfood 정합
- `ADR-017` dogfood simulation을 재실행할 의무는 없으나, 두 ADR 모두 Mutation Contract의 *Falsifying evaluation*에 "다음 dogfood 라운드"를 명시했다. 실제 fork 사용 라운드에서 회수.

---

# 부록 — 전체 변경 파일 목록 (체크리스트)

## ADR-048 (MCP)
- [ ] `docs/90-decisions/boilerplate/ADR-048-mcp-usage-enforcement.md` (신규) — A1
- [ ] `docs/90-decisions/boilerplate/README.md` (+1 행) — A1
- [ ] `AGENTS.md` (+1 링크 줄) — A1
- [ ] `docs/00-meta/_templates/STACK_SETUP_PLAN_TEMPLATE.md` (표 2컬럼 + (e)) — A2
- [ ] `.claude/skills/bootstrap-stack/SKILL.md` (backfill + 출력) — A2
- [ ] `.claude/skills/plan-workitem/SKILL.md` (MCP line item) — A3
- [ ] `.claude/skills/implement-workitem/SKILL.md` (MCP 실행 + Needs MCP Access) — A3
- [ ] `.claude/skills/validate-workitem/SKILL.md` ([MCP-unused] audit) — A3
- [ ] `.claude/agents/validator.md` ([MCP-unused] 규칙) — A3
- [ ] `.claude/skills/stabilize-milestone/SKILL.md` (3-P registry-driven MCP) — A3

## ADR-049 (디자인)
- [ ] `docs/90-decisions/boilerplate/ADR-049-concept-mockup-first-design.md` (신규) — B1
- [ ] `docs/90-decisions/boilerplate/README.md` (+1 행) — B1
- [ ] `docs/90-decisions/boilerplate/ADR-027-interface-decision-allocation.md` (현재 유효 결정 표기) — B1
- [ ] `.claude/skills/bootstrap-design/SKILL.md` (전면 재작성 R0~R6) — B2
- [ ] `docs/20-system/DESIGN.md` (§1 주석 보강) — B2
- [ ] `docs/00-meta/STRUCTURE.md` (산출물 2행 + canonical owner) — B3
- [ ] `docs/00-meta/WORKFLOW.md` (§2 concept 게이트) — B3
- [ ] `README.md` / `README_ko.md` (흐름 1줄) — B3
- [ ] `docs/00-meta/PROJECT_START_CHECKLIST.md` (design flow 단계) — B3
- [ ] `.gitignore` (concept/preview ephemeral ignore) — B3

## 커밋 순서
```
A1  docs(adr): add ADR-048 MCP usage enforcement extending ADR-043 record-only policy
A2  feat(mcp): record applied connectors with lifecycle-usage and agent-access columns
A3  feat(mcp): enforce connected-MCP usage across plan/implement/validate/stabilize
B1  docs(adr): add ADR-049 concept-mockup-first design flow superseding ADR-027 round structure
B2  feat(design): restructure bootstrap-design to reference-note plus concept-mockup-first rounds
B3  docs(design): surface design-research note and concept mockups across structure/workflow/readme/gitignore
```
> 각 커밋은 명시적 `git add <paths>` 사용 (`git add -A`/`git add .` 금지 — WORKFLOW 4-1 / AGENTS.md). 커밋 메시지 footer에 `Co-Authored-By` 등은 프로젝트 관례 따름.

---

# 메모 — 설계 판단 근거 (리뷰어용, 적용에는 불필요)

- **왜 line-item 패턴으로 MCP를 강제하나**: 보일러는 이미 ADR-040에서 "plan이 line item authoring → implement가 실행/Needs Research hardstop → validator가 실행 점검"이라는 *2-layer 책임 분배*(plan=사고, implement=집행, validator=점검)를 확립했다. MCP도 동일 패턴에 얹으면 새 메커니즘 없이(ADR-006 단순성) 강제가 성립한다.
- **왜 allowed-tools를 보일러가 baking하지 않나**: MCP 서버 이름은 프로젝트별이고(생태계가 월 단위로 변함 — ADR-043), RCE급 도구도 있어 자동 부여는 보안 위반. 그래서 *부여는 연결 절차 (e)의 사용자 책임*으로 두고, 보일러는 *계약(line item)·기록(표)·점검(validator)*만 제공한다.
- **왜 ADR-027을 통째 supersede하지 않나**: ADR-027은 디자인 *흐름* 외에도 ARCH 7-1~7-4 인터페이스 할당·DESIGN.md 8섹션·anti-slop Don'ts라는 *내용* SSOT를 보유한다. 흐름만 바뀌므로 ADR-049가 *라운드 구조*만 인수하고 ADR-027은 내용 SSOT로 accepted 유지하는 것이 SSOT 정합(ADR-005)·최소 변경(ADR-006)에 맞다.
- **왜 concept(R2)과 preview(R6)를 둘 다 두나**: 목적이 다르다. R2=*방향 선택*(다중·DESIGN.md 전), R6=*SSOT 충실도 확인*(단일·DESIGN.md 후). R6은 기존 R5 메커니즘을 시점만 옮긴 것이라 net-new 복잡도는 R2뿐. 사용자가 R6를 생략 가능하게 해 과정 비대화를 막았다.
- **왜 ADR-048이 ADR-043을 supersede하지 않고 *확장*하나** (교차검토 반론 검토): ADR-043의 결정(연결 절차·보안 가드·`STACK_SETUP_PLAN` 기록 위치)은 모두 유효하다 — 본 변경은 그 위에 *enforce 층*을 더하는 것이라 supersede(=기존 결정 뒤집기, ADR-045#d6) 기준에 안 맞는다. ADR-043은 accepted 유지, ADR-048이 "builds on". (supersede로 처리하면 ADR-043을 죽은 ADR로 만들어 연결 절차 SSOT를 잃는다.)
- **왜 별도 `MCP_CONNECTORS.md`를 만들지 않나** (교차검토 대안 검토): ADR-043이 이미 MCP 기록 위치를 `STACK_SETUP_PLAN.md ## Optional MCP Connectors`로 정했다(결정 2). 신규 문서는 SSOT를 이전시키고 ADR-043 supersede를 유발한다 — 표 2컬럼 확장이 단순(ADR-006)하고 기존 SSOT를 보존한다.
- **왜 `DESIGN_RESEARCH.md`(UPPER_SNAKE)인가** (교차검토 반영): 형제 SSOT 문서 `DESIGN.md`/`ARCHITECTURE_OVERVIEW.md`가 UPPER_SNAKE이고, 커밋되는 Reference 문서이므로 대문자 명명이 일관적이다(ephemeral HTML은 lowercase 유지). 노트가 레퍼런스뿐 아니라 *시안 선택 근거*까지 담아 "research"가 범위에 맞다.
- **왜 stabilize 3-P를 손대나** (교차검토 반영 — 가장 중요한 누락 보강): stabilize 3-P가 이미 Playwright MCP를 ad-hoc("연결돼 있으면") 조건으로 참조하고 미연결 시 silent skip이라, registry-driven으로 정렬하지 않으면 "필요한 상황에 MCP 활용"(요청 1)이 *stabilize 단계에서 누락*된다. ADR-048#d6으로 흡수해 전 lifecycle(plan/implement/validate/stabilize)에서 MCP 사용이 registry 기반으로 일관되게 했다.
- **MCP 강제의 실효 조건** (2차 교차검토 E1 반영): shared 기본 모드 `acceptEdits`가 *MCP 호출에 confirm*을 요구하므로(GUARDRAILS), fork sub-agent의 자율 MCP 호출은 `allowed-tools`만으론 부족하고 read-only MCP 도구의 `permissions.allow` 등재가 함께 필요하다. 이를 연결 절차 (e)·ADR-048 현재 유효 결정·Predicted improvement·Falsifying evaluation에 박아, "[MCP-unused] 0건"이 *access 부여된 connector 한정*임을 정직하게 한정했다(미부여는 `Needs MCP Access`로 강등 — 보안 게이트의 설계된 결과, 실패 아님).
- **README/CHECKLIST는 ADR Surfaces에 넣지 않는다** (2차 교차검토 A1 반영): ADR-045#d3가 "README·요약·문맥 언급 등재 금지"이고 ADR-027 선례도 README를 Surfaces에서 제외한다. ADR-049의 README/CHECKLIST 흐름 줄은 *적용 대상(마이그레이션)*으로만 두고 fan-out surface에서 뺐다(`.gitignore`는 d31을 *구현*하는 진짜 sync 대상이라 surface 유지). 역방향(파일→미등재 surface)은 ADR-045#d4상 미점검이라 `[ADR-049]` 단순 토큰만으로 충분.
- **#d22(preview lifecycle) supersede 누락 보강** (2차 교차검토 A3): ADR-049#d31이 preview 삭제 시점(R5-3→R6-3)·gitignore 정책(요청 시→기본)을 바꾸므로 ADR-027#d22를 historical 목록에 추가 — 두 accepted ADR이 design-preview.html gitignore를 상반 규정하던 모순 제거. 단 design-preview.html *산출물 자체*는 R6이 계속 사용(부분 supersede).
```
