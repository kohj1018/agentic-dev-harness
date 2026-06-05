---
name: implement-workitem
description: Implement one scoped workitem using builder, following Red→Green→Refactor TDD cycle.
argument-hint: "[task identifier] [--fast]"
allowed-tools: Read Glob Grep Write Edit Bash
context: fork
agent: builder
context-pack: minimal
---

너의 역할은 지정된 workitem을 Red → Green → Refactor 3 phase 사이클로 구현하는 것이다.

입력:
- `$ARGUMENTS`에는 task ID가 들어온다 (feature/milestone 분해는 `/plan-workitem` 책임 — 본 skill은 task 단위 구현 전용).
- `--fast` 플래그가 있으면 RGR 사이클을 1회만 돌려 첫 AC만 완료하고 종료한다(prototype용).

반드시 먼저 할 일:
1. 관련 task 문서를 읽는다.
2. 필요하면 상위 feature/milestone/architecture 문서를 읽는다.
3. **task `## 7. 관련 문서` 의 `Design:` / `Architecture-Iface:` link 가 있으면 그 sub-section (예: `DESIGN.md ## 7 Components`, `ARCH ## 7-1`) 만 회수** — *plan 이 박은 결정을 충실히 실행하기 위함* (독립 디자인 판단 X — EXECUTE 전용). 전체 fork-load 금지 (ADR-019 minimal). link 없으면 본 step skip.
4. **task `## 3. 구현 항목` 에 *등록 line item* (예: `+ DESIGN.md ## 7 등록`, `+ ARCH ## 7-1 error 레지스트리 등록`) 이 있으면 구현과 *동일 commit* 에 그 등록을 수행** — plan 이 authoring 한 스펙의 기계적 실행 (plan-workitem 정합). line item 없으면 등록 안 함 (builder 가 등록 여부를 *독립 판단하지 않는다*). (ADR-027)
5. task 문서의 `## 6. Acceptance Criteria`(AC-1, AC-2 ...)를 회수한다.
6. `## 6-2. TDD opt-out`을 점검한다 — 사유와 follow-up이 모두 있으면 opt-out 모드로 진행, 둘 중 하나만 비어 있으면 형식 위반으로 표시하고 종료(사용자에게 보강 요청).

opt-out 흐름 (사유와 follow-up 모두 채워졌을 때만):
- 테스트 작성을 건너뛴다.
- 출력에 "TDD opt-out 사유: <사유> / Follow-up: <task ID>"를 명시.
- 다른 흐름은 동일.

기본 흐름 — Red → Green → Refactor (각 AC마다 반복):

Red phase 진입 직전, 출력의 첫 단락으로 plan 을 다음 형식으로 명시할 것을 *권장* 한다 (plan 모드 의존 없이 think-before-edit 규율 확보):

  1. <Step> → verify: <어떤 테스트/조건으로 확인>
  2. <Step> → verify: <...>
  3. <Step> → verify: <...>

자유 텍스트 1~3 문장도 허용 — Step → verify 형식은 *권장이지 강제 X*. RGR 사이클이 이미 verify 를 강제하므로 형식 자체는 보조 규율.
*AC-N과 Step의 대응*은 plan 단계에서 명시.

AC 해석 처리 (ADR-006#amend-2 — 하드스탑):
1. 먼저 task `## 8. 메모`의 `해석 확정: AC-N = <선택>` 기록을 찾는다.
   - 기록 있음 → 그 해석을 *기계적으로 따른다*. 자체 재해석 금지.
2. 기록 없음 + 2+ 해석이 *구현을 실질적으로 다르게* 만듦(사소한 표현 차이는 제외) → **구현을 시작하지 않고 `Needs Plan Decision`으로 즉시 종료**한다.
   - 출력에 해석안 1~3개를 나열하고, `/plan-workitem <id>` 재실행(또는 cross-review 했으면 `/repair-plan <id>`)으로 해석을 확정하도록 안내한다.
   - builder는 *자기 해석을 골라 진행하지 않는다* (자아 차단 — plan이 사고, implement는 집행). 단 해석 차이가 사소(동일 구현 수렴)하면 멈추지 말고 진행.

**1. Red**
- task의 `## 6. Acceptance Criteria` 항목을 1개 골라 그것을 위반하는 실패 테스트를 작성한다.
- 테스트 이름에 `AC_N` 식별자를 포함하는 것을 권장(예: `test_AC_1_user_can_login`). 강제 아님.
- 테스트 실행 → "원하는 이유로" 실패하는지 확인 후 phase 종료.

**2. Green**
- 그 테스트를 통과시키는 **최소 코드**만 작성한다.
- 다른 AC를 미리 만족시키지 않는다(YAGNI 강화 — ADR-006).
- 테스트 통과 확인 후 phase 종료.

**3. Refactor**
- 단순성 self-check 4항목 + Clean Code 6항목(ADR-006)에 따라 정리한다.
- 외부 행동을 바꾸지 않는다.
- 테스트 통과 유지 확인 후 phase 종료.

위 사이클을 task의 모든 AC가 소진될 때까지 반복.
`--fast`면 첫 AC만 완료하고 종료, 나머지 AC는 후속 호출 권장.

마지막에 task 문서의 `## 4-1. 변경 예정 파일/경로`를 갱신한다(finalize의 add 참조 목록).

마지막 출력:
- 수정 파일 목록
- AC별 진행 상태 (완료/미완료, 예: `AC-1 ✅, AC-2 ✅, AC-3 ❌(다음 호출)`)
- 핵심 변경 사항
- 단순성 self-check 결과 (남은 정리 항목 N건, 있으면 명시)
- 남은 리스크
- 다음 추천 단계 (보통 `/validate-workitem <task-id>`)

외부 docs-check line item 처리 (ADR-040):
- task `## 3. 구현 항목`에 `구현 전 최신 공식문서 확인` line item(plan이 박음)이 있고, 그 외부 라이브러리·API의 *최신 사용법 확신*이 없으면 **구현을 시작하지 않고** 출력에 `Needs Research: <대상> — /research-pack <대상> 실행 후 재개 권장`을 명시한다. builder는 웹 접근이 없어 *직접 웹서핑하지 않는다*. 이미 확신이 있으면 line item을 체크하고 진행한다.

의존성 설치 line item 처리 (ADR-040#amend-1):
- task `## 3. 구현 항목`에 plan이 박은 의존성 설치 line item(예: `pnpm add <pkg>@<ver>`)이 있으면, 그 패키지가 필요해지는 시점(보통 Green phase)에 **설치 명령을 먼저 실행**한다(`allowed-tools`의 `Bash` 활용 — 추가 권한 불필요). 설치는 기계적 작업이므로 *기본은 진행*이다.
- 설치 후 lock 파일 변경은 그대로 둔다 — `/finalize-workitem`이 lock 파일을 자동 화이트리스트로 add한다(ADR-007#amend-1).
- **보류는 *실제 실행 실패*일 때만**: 설치가 sandbox/네트워크/승인 차단으로 실제 실패하면 *날조·우회하지 않고* `Needs Install: <명령> — 메인 세션/사용자 실행 필요`를 출력하고, 그 의존이 필요 없는 다른 AC 구현은 계속한다.
- **research gate는 *설치*가 아니라 *API 사용*에만 적용**: 패키지를 깐 뒤에도 그 라이브러리의 *최신 사용법 확신*이 없으면(plan이 `/research-pack 선행 권장`을 부기한 경우 등) ADR-040 hardstop대로 **통합 코드 작성을 멈추고** `Needs Research: <pkg> — /research-pack <pkg> 실행 후 재개`를 출력한다. 즉 *설치 자체는 막지 않고*, 잘못된(stale) API로 코드를 쓰는 것만 막는다(builder는 웹 접근 없음 — 직접 조사 금지).

connected-MCP 사용 line item 처리 (ADR-048#d4):
- task `## 3. 구현 항목`에 `<capability> 작업 시 <mcp-name> MCP 사용` line item(plan이 박음)이 있으면, 그 MCP 도구로 해당 작업을 수행한다(예: DB 스키마 introspection MCP로 실제 스키마 확인 후 구현).
- 단, **MCP 도구(`mcp__<server>__*`)가 본 skill `allowed-tools`에 없거나 호출 불가**하면 *날조·우회·추측하지 않고* 출력에 `Needs MCP Access: <mcp-name> — implement-workitem allowed-tools에 mcp__<server>__* 부여 또는 메인 세션 경유 필요 (STACK_SETUP_PLAN 연결 절차 (e))`를 명시하고 해당 line item은 미실행으로 둔다(다른 AC 구현은 계속). ADR-040 "Needs Research" hardstop과 동일 — builder는 권한 밖 도구를 임의 대체하지 않는다.

정책 근거:
- TDD: [ADR-009-tdd-default.md](../../../docs/90-decisions/boilerplate/ADR-009-tdd-default.md)
- 단순성·Clean Code: [ADR-006-simplicity-and-architecture.md](../../../docs/90-decisions/boilerplate/ADR-006-simplicity-and-architecture.md)

## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 ADR/architecture 섹션은 task 본문에서 발화 시 인용 — 사전 fork-load 금지.
