---
name: implement-workitem
description: Implement one scoped workitem as foreman — partition into file-disjoint slices and dispatch builder(s) (parallel when disjoint, single for small tasks), each running Red→Green→Refactor.
argument-hint: "[task identifier] [--fast] [--waiver \"<why>\"]"
allowed-tools: Read Glob Grep Write Edit Bash Agent
---

너의 역할은 지정된 workitem 구현을 지휘하는 *foreman*이다 — task를 file-disjoint slice로 쪼개고 각 slice를 builder 에게 위임한다. 각 builder 는 자기 slice 의 AC 에 대해 Red → Green → Refactor 3 phase 사이클을 돈다. 메인 세션(너)은 직접 구현하지 않고 분할·dispatch·병합·최종 sanity 검증만 한다.

> Codex: 서브에이전트는 GA이나 본 저장소가 Claude persona 위임을 Codex subagent로 아직 매핑하지 않아 순차 단일 실행으로 degrade — slice 들을 한 builder 가(또는 메인이 직접) 순서대로 처리한다. 분할 결과·병합·최종 step 은 동일하게 적용한다.

입력:
- `$ARGUMENTS`에는 task ID가 들어온다 (feature/milestone 분해는 `/plan-workitem` 책임 — 본 skill은 task 단위 구현 전용).
- `--waiver "<사유>"` 플래그는 **사용자만** 넘긴다 — 실행 증거(ADR-064 D1)를 확보할 수 없는 환경에서 사용자가 그 사실을 알고 진행을 승인하는 경로다. foreman은 이 플래그를 스스로 만들지 않고 사유도 발명하지 않으며(`/finalize-workitem`의 `--rationale`과 동일 근거), 값이 있으면 그 문자열을 그대로 receipt에 인용한다.
- `--fast` 플래그가 있으면 *단일 builder 1개*만 띄워 RGR 사이클을 1회만 돌려 첫 AC만 완료하고 종료한다(prototype용 — 분할 안 함).

반드시 먼저 할 일 (메인 세션이 1회 수행):
1. 관련 task 문서를 읽는다 (메인 세션이 *한 번*만 읽는다 — builder 에 task 전문을 넘기지 않는다).
2. 필요하면 상위 feature/milestone/architecture 문서를 읽는다.
3. task 문서의 `## 6. Acceptance Criteria`(AC-1, AC-2 ...)와 `## 3. 구현 항목`을 회수한다.
3-DT. **의존성 도구 확인 (scope별, ADR-051#amend-4)**: slice별로 쓸 의존성 도구(npm/pnpm/yarn/bun · pip/poetry/uv · cargo · go 등)를 회수한다 — ① `docs/00-meta/STACK_SETUP_PLAN.md`의 `## Dependency Tools`(scope→tool)를 *우선* 조회 + 인접 lockfile 등 실제 신호와 모순 없는지 교차 확인, ② 매핑이 없을 때만 각 slice 경로에 *인접한 고신뢰 신호*(`pnpm-lock.yaml`·`poetry.lock`·`uv.lock`·`Cargo.lock`·`go.mod`·`pubspec.lock` 등 tool-specific)로 추론(일반 manifest만으로 단정 금지)(ADR-059), ③ slice 경로와 가장 구체적으로 일치하는 scope의 도구를 그 slice dispatch(step 5)에 전달(한 slice가 여러 scope면 각 도구 함께). **충돌·불일치·slice→scope 불명확이면 그 slice만 `Needs Dependency Tool Decision`으로 중단**(출력에 scope·관측 신호·충돌 사유·해결 포함; 명확한 slice는 계속). 도구 명령이 불필요한 slice는 lockfile 변경 없이 진행.
3-R. **접지 경량 preflight (ADR-057#amend-3 / ADR-026#amend-4 — base 결정 4의 실행 전 접지 확인)**: 계획은 `/plan-workitem M<N>` 전체 스냅샷이라 `## 3`는 전체 스냅샷에서 이미 완성돼 있다. 분할·dispatch 전, 그 task의 접지가 여전히 유효한지만 *가볍게* 확인한다 — `## 3`가 참조하는 (a) 상위 계약(feature `## 7` FAC·`## 7-2` INV/seam·상위 ADR)과 (b) UI면 승인 프로토타입 경로가 **실제로 바뀌었거나 사라졌는지**, (c) 이 task `## 9. 의존성`의 **선행 task가 모두 done인지 + 선행이 약속한 산출(파일·인터페이스·AC)이 실제 존재하는지**(후행 `## 3`가 선행의 *계획된* 완료 결과를 전제로 쓰였으므로 — ADR-057#amend-3). 선행 task가 아직 done이 아니면 이 task는 의존순상 아직 dispatch 대상이 아니다(순서 대기 — 오류 아님). 어긋남이 **없으면 그대로 진행**(기본 경로 — 재계획 아님). 어긋남이 있으면 **원인별로 라우팅**한다 — (1) **선행 task가 done인데 약속한 산출(파일·인터페이스)이 없음**: 대개 그 *선행 task의 구현·검증 누락*이므로 **현재 M에서 그 선행 task를 repair→validate→finalize한 뒤 이 task 재시도**(current-M repair 라우팅 — 사용자 중단 아님). (2) **상위 기획·계약 자체가 틀림**(참조 프로토타입 경로 삭제·상위 `## 7`/INV 변경 등 계획 전제 붕괴): 그 task만 **중단하고 사용자에게 보고**(근본 충돌 — 자동 재계획하지 않음; §4.5b amend-3 결정 3, 변경은 다음 마일스톤). 일반 오류(테스트·타입·구현 누락·프로토타입 세부 불일치)는 중단 없이 repair.
3-G. **착수 게이트 — `ready → in-progress` (ADR-057#amend-3 결정 5)**: 분할(step 4) 진입 전, 아래 ①~⑧을 확인한다(⑥은 게이트가 아니라 참고 항목) — ① 같은 M에 `draft` task 없음(전체 계획 스냅샷 승격 완료), ② 대상 task 상태 = `ready`(신규 착수) 또는 `in-progress`(재개) — `done`은 거부, ③ 대상 task `## 9`의 선행 task가 모두 `done`(3-R이 산출물 실재까지 검사), ④ 부모 milestone·feature 문서 상태 모두 `ready` **이고 부모 milestone `## 10. 봉인 기록`에 `- 봉인일:`이 채워져 있음**(= `/seal-milestone` 봉인 완료. `contract-ready`이거나 `## 10`이 미채움이면 `/seal-milestone M<N>` 안내 후 종료 — ADR-060 D7/D12. 섹션 *존재*가 아니라 `- 봉인일:` *채움*을 본다 — `## 10`은 템플릿에 빈 채로 들어 있다), ⑤ `docs/40-validation/plan-reviews/`에 해당 M 또는 산하 F/T의 미해결 review 파일 없음, ⑥ (게이트 아님 — 참고) 봉인 시점의 원장 상태가 `## 10` receipt에 남아 있다(정상 봉인이면 `open 0건`, `(마이그레이션 — 소급 검사 없음)` 라벨이면 미검사). **봉인 후 새로 등재된 항목(`- 발견: 봉인 후 (M<N>)`)은 착수를 막지 않는다** — ADR-057#amend-3 결정 6 라우팅으로 처리한다(ADR-060 D11), ⑦ 대상 AC의 구현을 실질적으로 갈라놓는 미확정 해석 0건(아래 "AC 해석 모호성 경로"에서 이미 판정 — task `## 8`의 기존 `해석 확정`을 먼저 읽는다), ⑧ `## 6-2. TDD opt-out` **형식 정합**(사유·follow-up이 둘 다 있거나 둘 다 없음 — 둘 중 하나만 있는 형식 위반은 step 6이 아니라 여기서 막는다. 상태를 쓴 뒤 형식 위반으로 종료하면 구현하지 않은 task가 `in-progress`로 남는다). 하나라도 불충족이면 분할·dispatch하지 않고 신규 대상은 `ready`를 유지한 채 어느 항목이 막았는지 사용자에게 보고한다(이미 `in-progress`인 재개 호출은 상태를 다시 쓰지 않는다). **모든 게이트 통과 후, partition/dispatch 직전에만** 신규 대상 task `## 0. Status`를 `ready → in-progress`로 갱신한다 — 이 기록이 다른 세션의 계획 잠금 판정 근거다.
3-U. **미실측 외부 사실 해소 (ADR-064 D3 — 분할·dispatch 전에 1회)**: task `## 3`에 `[미실측]` line item이 있으면 각 항목의 *확인 방법*대로 실측해 확정한다. **표기를 찾을 때는 HTML 주석(`<!-- -->`) 밖의 줄만 본다** — TASK_TEMPLATE `## 3` 주석에 같은 형식의 예시가 있어 주석까지 세면 모든 task에 미실측 항목이 있는 것으로 보인다(D4 판독 규칙). **실측 주체는 foreman이다** — 자기 `Bash`·연결된 MCP 도구로 직접 관측하고, *웹 문서 조사*가 필요하면 researcher에 위임한다(ADR-040#amend-2). **문서 조사만으로는 실측이 아니다** — 실제 응답·스키마를 본 뒤에만 `[실측]`이 된다. 실측 수단·안전 규정은 아래 6-E와 같다(자사 운영 환경 접속 금지 / 파괴적 호출 자동 실행 금지 / 민감·유료·rate-limited 엔드포인트는 사용자 승인 후 / raw 응답 전문 미출력).
   실측 후 (i) 그 line item의 `[미실측]`을 `[실측 <오늘 날짜>]`로 바꾸고 잠정값을 관측값으로 교체하고, (ii) 결과를 6-R에서 `## 8`에 기록한다. **이것은 계획 변경이 아니라 계획이 예약해 둔 해소 절차의 집행이므로 봉인을 다시 열지 않고 사용자에게 묻지 않는다.**
   - 실측 결과가 AC의 **행동·범위·보안 계약**을 바꾸면(예: 원천이 그 데이터를 제공하지 않아 AC가 성립 불가) 자동 해소하지 않고 3-R의 근본 충돌 경로대로 **중단·사용자 보고**한다. **본 단계는 3-G가 이미 `ready → in-progress`를 쓴 뒤이므로 상태를 되돌리지 않고 `in-progress`를 유지한 채** 중단한다(다음 호출을 재개 진입으로 받는다).
   - 실측이 막히면(네트워크·자격증명·승인 차단) 추측으로 진행하지 않고 `Needs Fact Resolution: <무엇> — <막힌 사유>`를 출력하고 **그 사실이 필요한 부분을 미완으로 둔다**(그 사실이 필요 없는 다른 AC 구현은 계속).
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
   - **이 slice의 의존성 도구**(3-DT에서 scope별 회수 — 예: `apps/web`→npm, `apps/api`→uv). builder는 지정된 scope의 그 도구만 쓴다 — 새 도구 도입·전환·다른 scope 도구 실행 금지(stray lock·오도구 방지 — ADR-051#amend-4).
   - 병렬 builder 는 *file-disjoint* slice 에만 띄운다. 같은 파일에 실제 write-conflict 가능성이 있으면 *그 slice 들은 순차로* 돌린다(또는 사용자가 별도 worktree 로 격리) — disjoint 인 일반 경우엔 불필요.
   - **same-checkout 제약(WORKFLOW.md 정합)**: worktree 를 쓴 builder 의 변경은 *최종 minimal validate 전에 메인 checkout 으로 병합*한다. validate/finalize 는 같은 checkout 에서 실행해야 하고, validation report(`docs/40-validation/reports/<task-id>.md`)는 gitignored·checkout-local 이라 worktree 에 흩어지면 후속 finalize 가 `Needs Validation` 으로 못 찾는다. 일반 disjoint 병렬(worktree 미사용)은 본 제약과 무관.
6. **`## 6-2. TDD opt-out` 점검 (메인이 먼저)** — 사유와 follow-up이 모두 있으면 opt-out 모드를 해당 slice builder 에 지시한다. *형식 위반(둘 중 하나만 있음) 차단은 3-G ⑧이 담당*하므로 여기까지 왔으면 형식은 정합이다(상태를 쓴 뒤 종료하지 않기 위한 순서 — ADR-057#amend-3 결정 5c).

**AC 해석 모호성 경로 (foreman, dispatch 전 preflight — ADR-006#amend-2 하드스탑 위치 이동)**: AC 해석 점검을 builder 내부(Red 직전)가 아니라 **메인 foreman의 dispatch 전**에 수행한다(신규 task가 아직 `ready`인 동안 판정되고, 모호한 task를 `in-progress`로 먼저 쓰지 않도록). 먼저 task `## 8. 메모`의 `해석 확정: AC-N = <선택>` 기록을 찾는다 — 있으면 그 해석을 기계적으로 따르고 분할·dispatch를 계속한다. 기록이 없고 *2+ 해석이 구현을 실질적으로 다르게* 만들면(사소한 표현 차이는 제외): (a) 그 M이 아직 봉인 전(`contract-ready`)이면 `/validate-plan M<N>` → `/repair-plan M<N>`으로 M 전체 task 계획을 검증·수정하도록 안내한다. **봉인 후(`ready` + receipt)라면** 계획 수정 경로로 보내지 않고 해석안 1~3개와 영향만 사용자에게 보고하고, 사용자가 고른 해석을 task `## 8. 메모`에 `해석 확정:`으로 기록한 뒤 같은 `/implement-workitem`을 재실행한다(계획 변경이 아니라 잠긴 AC의 해석 확정 — ADR-057#amend-3 결정 5 정합). 구현 흔적이 0건이라 `/repair-plan` 2-S가 task 층을 고칠 수 있는 상태여도(ADR-060 D6) **해석 확정이 더 값싼 경로**이므로 이쪽을 기본으로 한다 — 구현이 시작된 뒤에는 그 경로 자체가 닫힌다. (b) 하나라도 `draft|ready` 밖 상태면 계획 skill을 우회 호출하지 않는다. 두 경우 모두 **신규 대상은 `ready`를 유지한 채** 분할·dispatch를 시작하지 않고, 해석안 1~3개와 영향을 사용자에게 보고해 결정을 기다린다. 사용자가 명시적으로 선택한 경우에만 task `## 8. 메모`에 `해석 확정: AC-N = <선택>`을 기록하고 같은 `/implement-workitem T-NNN`을 재실행한다. 이미 `in-progress`인 중단 작업을 재개하다 새 모호성이 드러난 예외는 상태를 되돌리지 않고 `in-progress`를 유지한다. 이는 새 scope·자동 재계획이 아니라 잠긴 AC의 사용자 해석 확정이며, 에이전트가 임의 선택하지 않는다.

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

AC 해석은 위 "AC 해석 모호성 경로"에서 dispatch 전에 메인 foreman이 이미 판정했으므로(ADR-006#amend-2), builder는 그 결과(진행 또는 `해석 확정` 기록)를 그대로 전제하고 자체 재해석하지 않는다.

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
**builder가 구조화 최종 반환 없이 멈추면** foreman은 1회 재개를 시도(SendMessage 등)하고, 그래도 미반환이면 그 slice가 건드렸을 파일을 직접 열어 결과를 회수한다(always-verify — "결과 없음"을 조용히 통과 금지, ADR-051#amend-4).
6-V. **검증 판정력 확인 (ADR-064 D2 — 메인 foreman이 1회. `## 4-1` 갱신보다 *먼저* 수행한다 — 여기서 테스트가 추가되기 때문)**: 각 AC에 대해 그 테스트가 실제로 무언가를 보고 있는지 확인하고 기록한다. **코드를 변형하지 않는 3수단이 기본**이며 이 순서로 적용한다 — ① builder가 보고한 **Red 관측**(어떤 테스트가 구현 전에 어떤 이유로 실패했는지). 구현 전에 통과했다면 그 테스트는 판정력이 없으므로 테스트를 먼저 고친다. ② **반례 테스트** — 거부·차단돼야 할 입력을 넣고 실제로 거부되는지 단정(**이것은 대개 AC 본연의 행동이므로 `AC-N`으로 매핑한다** — VC로 빼지 않는다). ③ **positive control** — 검사 헬퍼·수집기 자체가 살아 있는지 확인(예: "로그가 없어야 한다"를 단정하기 전에 일부러 로그를 하나 심어 헬퍼가 잡는지). **부재를 단정하는 AC는 ①만으로 판정력이 증명되지 않으므로 ③이 필수다.**
   - **modality 분기 (ADR-065 D1)**: `## 6-1`의 `[modality]`를 먼저 읽는다. **`[자동 테스트]`·`[산출물 검사]` AC만 RGR·판정력 확인(6-V) 대상**이다. `[사용자 관측]`·`[플랫폼 관측]` AC는 Red를 만들 수 없으므로 **6-V·6-R의 `verify-power` 대상에서 제외한다** — 그 AC에는 `- verify-power` 줄을 쓰지 않고, 대신 6-R 출력에 `- ac-pending <AC-N>: modality=<...> — 사용자 receipt 대기` 한 줄만 남긴다. 그 AC의 충족은 사용자 발급 `- ac-acceptance`가 담당하며 **foreman이 그 receipt를 쓰지 않는다.**
   - **`red=opt-out(...)`을 modality 사유로 쓰지 않는다** — ADR-064 D2의 `opt-out`은 *task `## 6-2`가 정당하게 채워졌거나 `Type: research-spike`* 인 경우로 정의돼 있다. modality를 그 값에 태우면 그 상태의 의미가 조용히 넓어진다. 상태 집합을 늘리지도, 기존 값을 전용하지도 않고 **대상에서 빼는** 것이 두 ADR을 모두 지키는 유일한 방법이다.
   - `[산출물 검사]` AC는 테스트 대신 **재현 가능한 검사 수단**(명령·스키마·파서·grep 패턴)을 만들어 **통합 `validate`에 묶고**, 그 수단과 결과를 `## 6-1` 그 AC 줄에 적는다. 묶지 않으면 validate가 그 AC를 미충족으로 판정한다(ADR-065 D1).
   - **Red 관측의 허용 상태는 넷이다** — `observed`(정상) / `opt-out(<사유>)`(task `## 6-2. TDD opt-out`이 정당하게 채워졌거나 `Type: research-spike` — Red가 존재할 수 없으므로 결함이 아니다) / `characterization(<사유>)`(`Type: refactor` 등 기존 동작 고정 테스트가 구현 전에도 통과) / `unrecoverable(<사유>)`(세션 중단 후 재개라 원래 Red를 재현할 수 없음 — 이때는 ②·③으로 판정력을 대체 확인하고 그 결과를 함께 적는다).
   - ③으로 추가한, **AC 행동으로 귀속되지 않는** 테스트만 `## 6-1`에 `- VC-N → <file> > <test-name>` 으로 등재한다(이 행의 writer는 foreman 단독). **`## AC ↔ 검증 매핑` 커버리지 % 집계 대상이 아니다.**
   - **격리 변이 승격**: 3수단으로 판정력이 확인되지 않을 때만, 아래 **4 게이트를 전부 충족하면** 격리된 작업 사본에서 코드를 일시 변형해 민감도를 측정할 수 있다 — **G1** 그 AC가 막는 실패가 데이터 손상·유실 / 보안·권한 경계 / 비가역 외부 부작용 중 하나다(표시·성능·편의는 대상 아님), **G2** 의심이 특정 단정으로 좁혀지지 않아 반례·positive control을 설계할 수 없다(좁혀지면 승격하지 않는다), **G3** 관측 신호가 있다(구현 전에도 통과했던 테스트 / 같은 파일에서 확인된 공허한 단정 / 실행되지 않는 분기 / 과거 유출 이력 중 1개 이상), **G4** 별도 작업 사본에서 그 테스트를 독립 실행할 수 있다(공유 DB·고정 포트·외부 자원에 묶여 사본에서 못 돌리면 **승격 금지**). **하나라도 미달이면 승격하지 않고 그 사실을 receipt에 남긴다(재량 0).**
   - 승격 시 규율(전부 의무): **R1** 별도 worktree·사본에서만, **현재 작업 트리 변형은 예외 없이 금지** / **R2** 한 번에 변이 1개 / **R3** 변이가 실제로 코드에 적용됐는지 **먼저 확인**(미적용 상태의 초록불을 커버 증거로 읽지 않는다) / **R4** 판정 단위는 전체 종료코드가 아니라 "그 변이가 어느 테스트를 빨갛게 만들었는가" / **R5** 종료 시 사본 삭제 + 삭제 결과 보고(실패·조기 종료 경로 포함) / **R6** G1~G4 판정 결과를 receipt에 기록 / **R7** 승격 권한은 foreman 단독 — **builder에게 위임하지 않는다**.

6-E. **실행 증거 (ADR-064 D1 — 6-V 뒤, `## 4-1` 갱신 앞)**: task `## 2`에 `- 외부 경계:` 표시가 있거나(plan authoring — **HTML 주석 밖의 줄만 표시로 센다**. 템플릿 주석에 같은 형식의 예시가 있다. D4 판독 규칙), 표시가 없더라도 합쳐진 변경이 (a) 영속 저장소 쓰기 · (b) **외부(서드파티·타 시스템)** 네트워크 호출 · (c) 실행 진입점 중 하나를 건드렸으면 **해당하는 경계 *종류마다* 각각 1건 이상의 실행 증거를 확보한다.** 한 종류의 증거가 다른 종류를 대신하지 못한다(응답 재생은 DB 스키마 write를 증명하지 않고, 진입점 기동은 요청 URL·인증 형식을 증명하지 않는다). **같은 저장소·같은 배포 단위 안의 서비스 간 호출은 (b)가 아니다.**
   - **등급 1(권장 — 재실행 가능)**: 일회용 실자원(테스트 전용 DB·로컬 컨테이너·에뮬레이터)에 대고 도는 테스트를 만들어 **통합 `validate` 명령에 묶는다.** 회귀 차단을 기존 exit code 게이트가 맡게 되어 증거가 1회성으로 증발하지 않는다. 가능하면 항상 이쪽을 택한다. **이미 있는 e2e가 그 경계를 실제로 밟는다면 새로 만들지 말고 그 실행을 등급 1 증거로 인용한다**(무엇이 그 경계를 밟았는지 receipt에 1줄 — D6).
   - **등급 2(차선 — 1회성 관측)**: 등급 1이 불가능할 때만(유료·rate-limited API / 자격증명 필요 / 수동 환경 / dry-run만 제공). 형태는 ① 일회용 실자원 수동 1회 실행 ② 읽기 전용 실 호출 1회 관측 ③ 마스킹된 실 응답 재생 ④ dry-run ⑤ 사용자 waiver(`--waiver`).
   - **안전 규정(전부 강제)**: 자사 운영 환경(project-owned production)에 접속하지 않는다 — 서드파티 공개 엔드포인트는 *읽기 전용*에 한해 허용한다. 파괴적 호출(외부 상태를 바꾸는 write·삭제·결제·발송)을 자동 실행하지 않는다(등급 1 또는 dry-run으로 대체). **개인정보가 반환될 수 있거나 유료이거나 rate limit이 있는 엔드포인트는 사용자 승인 후에만 호출하고, 호출 전에 필요한 최소 필드만 받도록 요청을 좁힌다.** raw 응답 전문을 출력·로그·receipt에 싣지 않는다(구조 확인에 필요한 최소 발췌만, 그 발췌도 마스킹). 출처 URL의 민감한 쿼리 문자열은 가린다. `.env`·자격증명 파일 접근 금지 정책은 그대로 적용된다.
   - **waiver는 사용자만 발급한다** — foreman이 면제를 스스로 판단하거나 사유를 발명하지 않는다. 입력 경로는 `--waiver "<사유>"` 플래그뿐이다.
   - 새로 만들거나 갱신한 픽스처에는 출처를 표기한다 — `docs-verified` / `live-observed` / `synthetic` + 출처 + 관측일 (ADR-064 D5). **`live-observed`는 저장 전 마스킹이 의무**이며, 마스킹이 확실하지 않으면 저장하지 않고 receipt에 구조 요약만 남긴다.
   - **확보하지 못하면 날조·우회하지 않고 `Needs Execution Evidence: <경계 종류> — <무엇을 못 했는지 1줄> / 가능한 대안: <있으면>` 을 출력하고 그 부분을 미완으로 둔다**(다른 AC 구현은 계속). **이 정지가 본 계약의 실질 차단 지점이다** — `/validate-workitem`은 기록만 하므로(ADR-064 D7) 여기서 통과시키면 방어선이 없다.

**메인 foreman 은 모든 builder 의 변경 파일 목록을 합쳐 task 문서의 `## 4-1. 변경 예정 파일/경로` 를 *한 번* 갱신한다** (slice 별 중복 제거 — finalize 의 add 참조 목록). builder 가 같은 `## 4-1` 을 동시에 쓰지 않게 갱신 주체는 메인으로 단일화한다. **6-V·6-E 가 추가한 VC 테스트·픽스처 파일도 이 목록에 포함한다** (ADR-064 — 그 둘이 본 갱신보다 먼저 수행되는 이유다. 빠지면 finalize 의 add 대상에서 누락된다).

6-R. **receipt 기록 (ADR-064 D4 — 파일 변경이 전부 끝난 뒤, `/validate-workitem` 실행 *이전*)**: 3-U·6-V·6-E의 결과를 task 문서 `## 8. 메모`에 해당하는 것만 1줄씩 append한다. **writer는 foreman 단독이다.**
   - `- exec-evidence <날짜> <경계 a|b|c>: <등급 1 재실행 가능 | 등급 2 1회성 — 형태> — <무엇에 대고 실행했는가> / 결과: <관측 1줄>`
   - `- verify-power <날짜> <AC-N>: red=<observed|opt-out(사유)|characterization(사유)|unrecoverable(사유)> / vc=<VC-N 목록 또는 없음> / mutation=<미승격(G# 미충족) | 승격(변이·관측·사본 삭제 결과)>`
   - `- fact-resolved <날짜> <무엇>: <잠정값> → <관측값> / 관측 방법: <1줄>`

   **순서가 계약의 일부다.** (i) 파일 변경이 끝난 뒤에 써야 증거가 최종 코드를 덮고 `## 4-1`에도 반영된다. (ii) `/validate-workitem`이 report를 쓴 *뒤에* `## 8`을 건드리면 task 문서 mtime이 갱신돼 `/finalize-workitem`이 report를 stale로 판정하고 `Needs Validation`으로 종료한다 — 재validate → 재append의 무한 후퇴가 된다. **digest·커밋 비교로 신선도를 판정하지 않는다**(판정자에게 그 도구가 없고, 커밋 비교는 위 무한 후퇴의 직접 원인이다) — 코드를 고친 주체가 그 자리에서 receipt를 갱신하는 것이 신선도 유지 방식이며 `/repair-workitem`도 같은 책임을 진다.

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
- 실행 증거 (ADR-064 D1): 경계 종류별 확보 현황(a/b/c) + 등급(1 재실행 가능 / 2 1회성) / 해당없음(외부 경계 아님) / `Needs Execution Evidence: <경계 종류>`
- 판정력 (ADR-064 D2): AC별 red 상태 / VC-N 추가분 / 격리 변이 승격 여부
- 미실측 해소 (ADR-064 D3): 해소 N건 / `Needs Fact Resolution` K건(사유)
- 사용자 확인 대기 AC (ADR-065 D1): `[사용자 관측]`·`[플랫폼 관측]` AC-N 목록 — `/validate-workitem` 후 `/accept-milestone --task <task-id>`로 receipt 발급 필요 / 해당없음
- 남은 리스크
- 다음 추천 단계 (보통 `/validate-workitem <task-id>`)

외부 docs-check line item 처리 (각 builder 가 자기 slice 의 `## 3` step 에 대해 — ADR-040):
- 그 slice 의 step 에 `구현 전 최신 공식문서 확인` line item(plan이 박음)이 있고, 그 외부 라이브러리·API의 *최신 사용법 확신*이 없으면 **그 slice 구현을 시작하지 않고** 출력에 `Needs Research: <대상> — <무엇이 불확실한지 1줄>`을 명시한다(메인 foreman 에 보고 — 메인은 그 slice 만 보류). builder는 웹 접근이 없어 *직접 웹서핑하지 않는다*. 이미 확신이 있으면 line item을 체크하고 진행한다.
- **foreman 자동 재개 (ADR-040#amend-2)**: implement foreman 은 builder가 `Needs Research`로 멈추면 *수동 `/research-pack` 안내에 그치지 않고* researcher agent에 **Agent로 직접 위임**(`/research-pack` 호출 아님 — research-pack은 disable-model-invocation)하여 findings를 회수하고, 그 결론을 builder 재호출 프롬프트에 주입해 구현을 재개한다. Codex: 서브에이전트는 GA이나 본 저장소가 Claude persona 위임을 Codex subagent로 아직 매핑하지 않아 순차 단일 실행으로 degrade(foreman이 직접 researcher 본문을 순차 호출하거나, 사전 `/research-pack` 노트를 참조).

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
