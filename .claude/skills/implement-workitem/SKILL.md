---
name: implement-workitem
description: Implement one scoped workitem as foreman — partition into file-disjoint slices and dispatch builder(s) (parallel when disjoint, single for small tasks), each running Red→Green→Refactor.
argument-hint: "[task identifier] [--fast]"
allowed-tools: Read Glob Grep Write Edit Bash Agent
---

너의 역할은 지정된 workitem 구현을 지휘하는 *foreman*이다 — task를 file-disjoint slice로 쪼개고 각 slice를 builder 에게 위임한다. 각 builder 는 자기 slice 의 AC 에 대해 Red → Green → Refactor 3 phase 사이클을 돈다. 메인 세션(너)은 직접 구현하지 않고 분할·dispatch·병합·최종 sanity 검증만 한다.

> Codex: 병렬 위임 미지원 시 순차 단일 실행으로 degrade — slice 들을 한 builder 가(또는 메인이 직접) 순서대로 처리한다. 분할 결과·병합·최종 step 은 동일하게 적용한다.

입력:
- `$ARGUMENTS`에는 task ID가 들어온다 (feature/milestone 분해는 `/plan-workitem` 책임 — 본 skill은 task 단위 구현 전용).
- `--fast` 플래그가 있으면 *단일 builder 1개*만 띄워 RGR 사이클을 1회만 돌려 첫 AC만 완료하고 종료한다(prototype용 — 분할 안 함).

반드시 먼저 할 일 (메인 세션이 1회 수행):
1. 관련 task 문서를 읽는다 (메인 세션이 *한 번*만 읽는다 — builder 에 task 전문을 넘기지 않는다).
2. 필요하면 상위 feature/milestone/architecture 문서를 읽는다.
3. task 문서의 `## 6. Acceptance Criteria`(AC-1, AC-2 ...)와 `## 3. 구현 항목`을 회수한다.
4. **분할 (partition) — 싸게 한다, 과추론 금지** (ADR-047 D9 + ADR-051 #d6 — foreman `## 3` step-path partition; *partition 직전 `docs/00-meta/STACK_SETUP_PLAN.md`(있으면)의 "테스트 격리 미설정" 표식을 회수* — 공유 런타임 리소스 순차화 입력):
   - `## 3. 구현 항목` step 을 *건드리는 파일/경로* 기준으로 묶는다. step 의 파일 경로는 `## 3` 본문(또는 `## 4-1. 변경 예정 파일/경로` 힌트)에서 읽는다.
   - 파일 집합이 **서로 겹치지 않는(disjoint)** step 그룹 → 각각 한 slice → *병렬 builder*.
   - 파일이 **겹치거나** step A 산출물을 step B 가 import/호출하는 *명백한* 선후 의존이 있으면 → 같은 slice(한 builder) 또는 *순차* dispatch. 의존은 `## 3` step 경로만 보고 rough 하게 판단 — 깊은 그래프 분석 금지.
   - **공유 변이 지점·테스트 의존 주의(조용한 clobber 방지)**: manifest/lockfile·barrel(`index.*`)·DI 컨테이너·route registry 처럼 *여러 slice 가 동시에 append 할 수 있는 공유 파일*은 `## 3` 에 명시 안 돼도 *겹치는 파일*로 간주 → 순차/단일. slice B 의 테스트가 slice A 코드를 import 하면 disjoint 아님 → 순차. *의심되면 단일 builder*.
   - **공유 런타임 리소스 주의(병렬 안전, ADR-051#amend-1 / ADR-038 면책 단락)**: 두 slice의 테스트가 *격리 없이* 공유 런타임 리소스(테스트 DB·고정 포트·로컬 Supabase 54321/54322·단일 dev server·공유 빌드/codegen 캐시 `tsbuildinfo`·`.next/cache`)를 동시에 건드리면, file-disjoint라도 병렬 시 충돌(최악: 한 builder의 seed가 다른 builder 단언을 우연히 충족하는 *false-Green*) → 그 slice들은 *순차 dispatch(또는 단일 builder)*. **"격리 없이"는 dispatch *전*에 두 신호로 판단한다**: (a) `STACK_SETUP_PLAN.md`의 "테스트 격리 미설정" 표식(step 4에서 회수), (b) 두 slice의 `## 3`/`## 4-1`가 *같은 공유 리소스*(테스트 DB·고정 포트·로컬 Supabase·단일 dev server·공유 빌드캐시)를 가리킴. 둘 중 하나라도 해당하고 *격리 보장 명시가 없으면* 순차화한다 — builder는 충돌을 사후 탐지할 수 없으므로 dispatch 전에 결정한다(*의심되면 단일 builder*). 격리(testcontainers·트랜잭션 롤백·랜덤 포트)가 보장되면 병렬 유지. **soft(hard-block 아님)** — 격리된 unit-test 일반 케이스 병렬 속도는 죽이지 않는다.
   - **작은 task(파일 ≤~2-3개, RGR 1회 분량)** → 분할하지 말고 *단일 builder 1개*. 병렬 오버헤드를 만들지 않는다.
   - 각 slice 는 {담당 step 목록, 그 step 이 만족시킬 AC subset, slice 가 건드릴 파일 집합}으로 정의된다.
5. **dispatch — 각 builder 에게 자기 slice 만 전달**한다 (ADR-019 minimal). builder 1개에 넘기는 것:
   - 그 slice 의 `## 3` step 들 (전문 아님, 해당 step 만)
   - 그 slice 가 책임지는 AC subset (예: builder-A → AC-1·AC-2, builder-B → AC-3)
   - **task `## 7. 관련 문서` 의 `Design:` / `Architecture-Iface:` link 가 있고 그 slice 와 관련되면** 그 sub-section (예: `DESIGN.md ## 7 Components`, `ARCH ## 7-1`) 경로만 — *plan 이 박은 결정을 충실히 실행하기 위함* (builder 의 독립 디자인 판단 X — EXECUTE 전용). 전체 fork-load 금지. 관련 link 없으면 생략.
   - 그 slice 의 step 에 *등록 line item* (예: `+ DESIGN.md ## 7 등록`, `+ ARCH ## 7-1 error 레지스트리 등록`) 이 있으면 함께 전달 — builder 가 구현과 *동일 commit* 에 기계적으로 수행한다 (builder 가 등록 여부를 *독립 판단하지 않는다*). (ADR-027)
   - 병렬 builder 는 *file-disjoint* slice 에만 띄운다. 같은 파일에 실제 write-conflict 가능성이 있으면 *그 slice 들은 순차로* 돌린다(또는 사용자가 별도 worktree 로 격리) — disjoint 인 일반 경우엔 불필요.
   - **same-checkout 제약(WORKFLOW.md 정합)**: worktree 를 쓴 builder 의 변경은 *최종 minimal validate 전에 메인 checkout 으로 병합*한다. validate/finalize 는 같은 checkout 에서 실행해야 하고, validation report(`docs/40-validation/reports/<task-id>.md`)는 gitignored·checkout-local 이라 worktree 에 흩어지면 후속 finalize 가 `Needs Validation` 으로 못 찾는다. 일반 disjoint 병렬(worktree 미사용)은 본 제약과 무관.
6. **`## 6-2. TDD opt-out` 점검 (메인이 먼저)** — 사유와 follow-up이 모두 있으면 opt-out 모드를 해당 slice builder 에 지시, 둘 중 하나만 비어 있으면 형식 위반으로 표시하고 *분할/dispatch 전에 종료*(사용자에게 보강 요청).

아래 흐름은 **각 builder 가 자기 slice 에 대해** 수행한다 (메인 foreman 은 dispatch 후 결과를 수합한다).

opt-out 흐름 (사유와 follow-up 모두 채워졌을 때만 — 메인이 4-6 step 에서 확인해 지시):
- 테스트 작성을 건너뛴다.
- 출력에 "TDD opt-out 사유: <사유> / Follow-up: <task ID>"를 명시.
- 다른 흐름은 동일.

기본 흐름 — Red → Green → Refactor (builder 가 *자기 slice 의 AC subset* 마다 반복):

Red phase 진입 직전, builder 출력의 첫 단락으로 plan 을 다음 형식으로 명시할 것을 *권장* 한다 (plan 모드 의존 없이 think-before-edit 규율 확보):

  1. <Step> → verify: <어떤 테스트/조건으로 확인>
  2. <Step> → verify: <...>
  3. <Step> → verify: <...>

자유 텍스트 1~3 문장도 허용 — Step → verify 형식은 *권장이지 강제 X*. RGR 사이클이 이미 verify 를 강제하므로 형식 자체는 보조 규율.
*AC-N과 Step의 대응*은 plan 단계에서 명시.

AC 해석 처리 (각 builder 가 자기 AC subset 에 대해 수행 — ADR-006#amend-2 하드스탑):
1. 먼저 task `## 8. 메모`의 `해석 확정: AC-N = <선택>` 기록을 찾는다.
   - 기록 있음 → 그 해석을 *기계적으로 따른다*. 자체 재해석 금지.
2. 기록 없음 + 2+ 해석이 *구현을 실질적으로 다르게* 만듦(사소한 표현 차이는 제외) → **그 slice 구현을 시작하지 않고 `Needs Plan Decision`으로 즉시 종료**한다(메인 foreman 에 그대로 보고 — 메인은 해당 slice 만 보류하고 다른 slice 는 계속).
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

각 builder 는 위 사이클을 *자기 slice 의 AC subset* 이 소진될 때까지 반복한다.
`--fast`면 단일 builder 가 첫 AC만 완료하고 종료, 나머지 AC는 후속 호출 권장.

각 builder 는 *자기 slice 가 건드린 파일* 을 메인 foreman 에 반환한다.
**메인 foreman 은 모든 builder 의 변경 파일 목록을 합쳐 task 문서의 `## 4-1. 변경 예정 파일/경로` 를 *한 번* 갱신한다** (slice 별 중복 제거 — finalize 의 add 참조 목록). builder 가 같은 `## 4-1` 을 동시에 쓰지 않게 갱신 주체는 메인으로 단일화한다.

최종 sanity 검증 (메인 foreman 이 모든 builder 수합 후 1회 — *minimal*):
- 모든 slice 가 합쳐진 working tree 에서 통합 검증 명령이 `--changed` 를 지원하면 `validate --changed`(예: `pnpm validate --changed`)로 *변경 파일만* 빠르게 돌려, 병렬 머지가 깨지지 않았는지만 본다 (ADR-020).
  - 이건 *전체 검증이 아니다* — full validate·AC 스코프 정합·문서-구현 일치 판정은 `/validate-workitem` 책임이다. 여기선 "병렬 슬라이스 병합 후 즉시 깨졌는가"만 잡는다.
  - `--changed` 미지원이거나 통합 명령이 없으면 이 step 을 skip 한다 (별도 hardstop 만들지 않음 — validate-workitem 이 받는다).
  - sanity 가 깨지면 어느 slice/파일이 깼는지 출력에 명시하고 다음 추천 단계를 `/repair-workitem <task-id>` 로 둔다.

마지막 출력 (메인 foreman 이 builder 결과를 병합해 signal-first 로):
- 수정 파일 목록 (전 slice 합산, 중복 제거)
- AC별 진행 상태 (완료/미완료, 예: `AC-1 ✅, AC-2 ✅, AC-3 ❌(다음 호출)` — slice→builder 매핑이 비자명하면 1줄 부기)
- 핵심 변경 사항
- 단순성 self-check 결과 (남은 정리 항목 N건, 있으면 명시)
- 최종 sanity (`validate --changed`) 결과: pass / skip / broken(+원인 slice)
- 남은 리스크
- 다음 추천 단계 (보통 `/validate-workitem <task-id>`)

외부 docs-check line item 처리 (각 builder 가 자기 slice 의 `## 3` step 에 대해 — ADR-040):
- 그 slice 의 step 에 `구현 전 최신 공식문서 확인` line item(plan이 박음)이 있고, 그 외부 라이브러리·API의 *최신 사용법 확신*이 없으면 **그 slice 구현을 시작하지 않고** 출력에 `Needs Research: <대상> — <무엇이 불확실한지 1줄>`을 명시한다(메인 foreman 에 보고 — 메인은 그 slice 만 보류). builder는 웹 접근이 없어 *직접 웹서핑하지 않는다*. 이미 확신이 있으면 line item을 체크하고 진행한다.
- **foreman 자동 재개 (ADR-040#amend-2)**: implement foreman 은 builder가 `Needs Research`로 멈추면 *수동 `/research-pack` 안내에 그치지 않고* researcher agent에 **Agent로 직접 위임**(`/research-pack` 호출 아님 — research-pack은 disable-model-invocation)하여 findings를 회수하고, 그 결론을 builder 재호출 프롬프트에 주입해 구현을 재개한다. Codex: 병렬 위임 미지원 시 순차 단일 실행으로 degrade(foreman이 직접 researcher 본문을 순차 호출하거나, 사전 `/research-pack` 노트를 참조).

의존성 설치 line item 처리 (각 builder 가 자기 slice 에서 — ADR-040#amend-1):
- 그 slice 의 step 에 plan이 박은 의존성 설치 line item(예: `pnpm add <pkg>@<ver>`)이 있으면, 그 패키지가 필요해지는 시점(보통 Green phase)에 **설치 명령을 먼저 실행**한다(builder `allowed-tools`의 `Bash` 활용 — 추가 권한 불필요). 설치는 기계적 작업이므로 *기본은 진행*이다.
  - 병렬 builder 가 *동일 패키지 매니저 lock 파일*(예: `pnpm-lock.yaml`)을 동시에 건드리면 write-conflict 가 날 수 있다. 동일 lock 을 만지는 설치 line item 이 여러 slice 에 걸치면 메인 foreman 이 그 설치를 *한 slice 로 모으거나 순차* 로 돌린다 (분할 step 4 의 의존 규칙과 동일 — lock 파일도 "겹치는 파일"로 본다).
- 설치 후 lock 파일 변경은 그대로 둔다 — `/finalize-workitem`이 lock 파일을 자동 화이트리스트로 add한다(ADR-007#amend-1).
- **보류는 *실제 실행 실패*일 때만**: 설치가 sandbox/네트워크/승인 차단으로 실제 실패하면 *날조·우회하지 않고* `Needs Install: <명령> — 메인 세션/사용자 실행 필요`를 출력하고, 그 의존이 필요 없는 다른 AC 구현은 계속한다.
- **research gate는 *설치*가 아니라 *API 사용*에만 적용**: 패키지를 깐 뒤에도 그 라이브러리의 *최신 사용법 확신*이 없으면(plan이 `/research-pack 선행 권장`을 부기한 경우 등) ADR-040 hardstop대로 **통합 코드 작성을 멈추고** `Needs Research: <pkg> — /research-pack <pkg> 실행 후 재개`를 출력한다. 즉 *설치 자체는 막지 않고*, 잘못된(stale) API로 코드를 쓰는 것만 막는다(builder는 웹 접근 없음 — 직접 조사 금지).

connected-MCP 사용 line item 처리 (각 builder 가 자기 slice 에서 — ADR-048#d4):
- 그 slice 의 step 에 `<capability> 작업 시 <mcp-name> MCP 사용` line item(plan이 박음)이 있으면, 그 MCP 도구로 해당 작업을 수행한다(예: DB 스키마 introspection MCP로 실제 스키마 확인 후 구현).
- 단, **MCP 도구(`mcp__<server>__*`)가 본 skill `allowed-tools`에 없거나 호출 불가**하면 *날조·우회·추측하지 않고* 출력에 `Needs MCP Access: <mcp-name> — implement-workitem allowed-tools에 mcp__<server>__* 부여 또는 메인 세션 경유 필요 (STACK_SETUP_PLAN 연결 절차 (e))`를 명시하고 해당 line item은 미실행으로 둔다(다른 AC 구현은 계속). ADR-040 "Needs Research" hardstop과 동일 — builder는 권한 밖 도구를 임의 대체하지 않는다.

정책 근거:
- TDD: [ADR-009-tdd-default.md](../../../docs/90-decisions/boilerplate/ADR-009-tdd-default.md)
- 단순성·Clean Code: [ADR-006-simplicity-and-architecture.md](../../../docs/90-decisions/boilerplate/ADR-006-simplicity-and-architecture.md)
- foreman 오케스트레이션·wave 제거: [ADR-051](../../../docs/90-decisions/boilerplate/ADR-051-main-session-orchestration-and-wave-removal.md) D1·D5·D6.

## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 ADR/architecture 섹션은 task 본문에서 발화 시 인용 — 사전 fork-load 금지.
foreman 이 inner-loop 를 여러 라운드 운전할 때(ADR-051 D8 + ADR-019#amend-1) 직전 라운드에서 이미 로드한 task 문서는 변경 신호(`## 8. 메모` repair 갱신·validate report 신규)가 없으면 재독 생략 — 변경 신호가 있을 때만 재읽기.
