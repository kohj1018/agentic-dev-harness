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
