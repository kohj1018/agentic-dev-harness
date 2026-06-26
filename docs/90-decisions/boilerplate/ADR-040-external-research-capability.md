# ADR-040 — 외부 리서치 capability (researcher agent + research-pack)

> scope: boilerplate

## Status
accepted

## 배경
- [관측됨] 기존 6개 agent(architect/planner/builder/validator/reviewer/qa)의 tools에 WebSearch/WebFetch가 없다 → 구현 중 외부 라이브러리(결제/인증/SDK)의 *최신 공식문서*를 확인할 수 없고, 모델 지식 컷오프로 stale API를 쓸 위험이 있다.
- [관측됨] 딥리서치·스택 추천·MCP 최신 설정 조회 모두 "사용자가 직접 붙여넣기"에만 의존.
- [외부실증] Anthropic "Effective context engineering" / subagent 가이드 — 리서치/딥다이브는 서브에이전트의 정전(canonical) 용도(탐색 노이즈 격리, 1,000~2,000 토큰 요약만 반환 — 현재 cap은 ADR-046 ≤600 참조).

## 결정
1. **`researcher` agent 신설** — tools: `Read, Glob, Grep, WebSearch, WebFetch`. **코드·문서 직접 수정 권한 없음(Write/Edit 없음)** = report-only. model: sonnet. context-pack: minimal.
2. **`research-pack` skill 신설** — 메인 세션에서 실행(discover-product 패턴, `context: fork`/`agent:` 미지정). 무거운 웹 조사는 **researcher agent에 `Agent` 위임**(노이즈 격리, 결론만 반환), 반환된 결론으로 리서치 노트 1개를 `docs/10-charter/insights/<date>-<slug>.md`에 작성(Write는 본 skill의 allowed-tools, 대상은 insights/ 단일 위치). **researcher agent는 report-only(Write 없음) 유지** — 노트 작성은 research-pack skill의 책임이라 `agent: researcher`와 Write 권한이 충돌하지 않는다.
3. **신뢰도·출처 규율**: 모든 발견에 출처 URL + 발행일 + *공식/1차/2차* 신뢰도 라벨 + "제품에 대한 추론"(사실과 분리). 외부 리서치 결과는 DISCOVERY Evidence Log(ADR-035#amend-2)의 `external-research` type 항목으로 연결.
4. **`data-analyst`·별도 insight agent는 만들지 않는다** — insight 합성은 discover-product/--update의 한 단계(skill)로 충분(역할 중복·복잡도 회피).
5. **위임 경로**: implement-workitem이 외부 라이브러리 불확실성에 부딪히면 builder가 직접 웹서핑하지 않고 *메인 세션이 researcher에 위임*(builder 컨텍스트 오염 회피). MCP 연결 절차(ADR-043)·bootstrap-stack --recommend(ADR-041)도 researcher로 최신 설정/지형을 조회한다 — fork+Agent 미보유 skill(bootstrap-stack 등)은 *사전 `/research-pack` 노트*를 참조하는 방식.

## 근거
- 웹 도구를 기존 agent(예: reviewer)에 붙이면 그 agent의 권한 표면이 부적절히 넓어진다(reviewer가 코드리뷰 중 웹서핑 = scope creep). 전용 최소권한 agent가 더 깨끗하다.
- agent는 1개만 추가(researcher) — debugger·data-analyst는 만들지 않음(ADR-006 단순성, 역할 중복 회피).

## 결과
- `.claude/agents/researcher.md`, `.claude/skills/research-pack/SKILL.md`, `docs/10-charter/insights/` 디렉터리.

## Ratchet 강도 (ADR-022)
- enabling (약) — 새 capability, opt-in. 단 researcher의 "report-only(코드/문서 미수정)"는 constraint(약) 가드.

## 참고
- ADR-035 (Evidence Log 연결), ADR-041 (스택 추천 그라운딩), ADR-043 (MCP 설정 조회), ADR-019 (context-pack minimal).

<a id="adr-040-amend-1"></a>
## Amendment 1 (2026-06-05) — 의존성 설치 authoring(plan) + 실행(implement)
### 결정
1. plan-workitem은 task가 *새 외부 패키지*를 요구하면 `## 3`에 설치 line item(`<pkg-manager> add <pkg>@<ver>` + 용도)을 박는다. 버전·사용법 불확실 시 `/research-pack <pkg>`(또는 researcher 위임) 선행을 권장 부기한다.
2. implement-workitem은 그 line item의 설치 명령을 *먼저 실행*한다(기계적 — 기본은 진행). 설치가 sandbox/네트워크/승인 차단으로 *실제 실패*하면 `Needs Install`로 보류. 설치와 *별개로*, 라이브러리 *API 사용법* 확신이 없으면 `Needs Research`로 통합 코드 작성만 멈춘다(설치 자체는 막지 않음). 날조·우회 금지. lock 파일은 finalize 자동 화이트리스트(ADR-007#amend-1)가 add.
### 근거
- [관측됨] 의존성 설치가 어느 단계 책임인지 불명확해 사용자 수동 설치에 의존 → plan이 *결정*하고 implement가 *집행*하는 책임 분배로 정렬(ADR-027#amend-1 패턴).
### 강도 (ADR-022)
- enabling(약). 단 "API 사용법 불확실 → 통합 코드 작성 전 연구" hardstop은 constraint(약, ADR-040 정신 유지) — *설치 자체*는 막지 않는다.
### 적용 surface
- .claude/skills/plan-workitem/SKILL.md       — 의존성 설치 line item authoring
- .claude/skills/implement-workitem/SKILL.md  — 의존성 설치 line item 처리
- docs/30-workitems/_templates/TASK_TEMPLATE.md — `## 3` 주석(설치 단계 형식)

<a id="adr-040-amend-2"></a>
## Amendment 2 (2026-06-25) — Needs-Research soft 게이트(builder) + 오케스트레이터 자동 위임 + install-ownership 3분할 boundary

### 결정
1. **builder Needs-Research soft 게이트**: builder persona에 standing soft 게이트를 둔다 — 외부 lib/service의 *최신 사용법/시그니처/버전* 확신이 없고 *그 불확실성이 구현을 실질적으로 바꿀 때만* stale-API 추측 대신 `Needs Research: <대상>`을 메인에 emit하고 멈춘다(plan line item 유무 무관). 과발동 금지: 안정 API이거나 구현 결과를 바꾸지 않으면 진행한다. builder는 웹 접근 없음 — 직접 조사하지 않는다.
2. **오케스트레이터 자동 위임 (researcher 자율성)**: 메인 세션 오케스트레이터 중 **`Agent` 도구를 보유한 skill**(implement foreman — ADR-051 D1 / plan-milestone)는 `Needs Research`를 받으면 *수동 `/research-pack` 안내에 그치지 않고* researcher에 **Agent로 자동 위임**→findings 주입→재개한다(`/research-pack` 호출 아님 — research-pack은 disable-model-invocation). builder 컨텍스트 오염 회피(ADR-040 #5 위임 경로 계승). researcher는 report-only 유지(Write 없음). Codex: 병렬 위임 미지원 시 순차 단일 실행으로 degrade.
3. **install-ownership 3분할 boundary**: 의존성 *authoring*(어떤 패키지 — plan, #amend-1) / *실행*(task 구현 중 설치 — implement·foreman, #amend-1) / *검증*(스택 선언↔설치 정합 회수 — stack-guard, ADR-052 D1)의 3분할을 명문화한다. researcher는 이 셋 중 *어디에도* 설치 권한을 갖지 않는다 — 버전·사용법 *조사*만(report-only 불변).

### 강도 (ADR-022)
- builder soft 게이트: constraint(약 — stale-API 추측만 차단, 진행은 안 막음). 오케스트레이터 자동 위임: enabling(약). researcher report-only constraint(약) 불변. install-ownership 3분할은 정정성 명문화(행동 불변).

### 적용 surface
- .claude/agents/builder.md                     — Needs-Research soft 게이트(persona standing 규율)
- .claude/skills/implement-workitem/SKILL.md    — foreman 자동 재개(researcher 위임 — ADR-051 D1 정합)
- docs/00-meta/DELEGATION_STRATEGY.md           — researcher row standing auto-trigger
- docs/90-decisions/boilerplate/ADR-052-stack-provisioning-and-e2e-readiness.md — install-ownership 검증(3분할) owning ADR (D1)
