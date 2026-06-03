---
name: plan-workitem
description: 상위 설계 문서를 기반으로 milestone, feature, task 단위 문서를 생성하거나 정리할 때 사용한다 (Claude Code plan 모드와 다름 — workitem 분해기).
argument-hint: "[milestone or feature id]"
disable-model-invocation: true
allowed-tools: Read Glob Grep Write Edit
context: fork
agent: planner
context-pack: minimal
---

너의 역할은 입력으로 받은 milestone/feature/task ID에 대한 workitem 문서를 분해·생성·갱신하는 것이다.

입력:
- `$ARGUMENTS`에는 milestone ID(예: `M1`), feature ID(예: `F-001`), 또는 자연어 분해 요청이 들어온다.

반드시 먼저 읽을 파일:
- `docs/10-charter/PROJECT_CHARTER.md`
- `docs/20-system/ARCHITECTURE_OVERVIEW.md` — *해당 스택 한정 sub-section 만*: `## 7-1` (API 프로젝트), `## 7-2` (CLI), `## 7-3` (백엔드), `## 7-4` (프론트). 비해당 sub-section 은 회수 X (ADR-019 minimal 정합).
- `docs/20-system/DESIGN.md` — *UI 프로젝트 한정*. UI 판정은 **ADR-027#amend-3 "UI 판정 다중신호 절차"** 적용(부재→비-UI / status≠draft→UI / status=draft→추가신호). UI 확정 시 본문 회수 + cross-check 활성, 비-UI/skip 시 사유 echo.
- 입력 ID에 해당하는 상위 workitem 문서(있으면)
- `docs/30-workitems/_templates/MILESTONE_TEMPLATE.md`, `FEATURE_TEMPLATE.md`, `TASK_TEMPLATE.md`

반드시 수행할 일:
1. 입력 ID에 해당하는 상위 문서를 읽어 범위와 비범위를 파악한다.
2. 작업을 milestone, feature, task 중 적절한 레벨로 나눈다.
3. 각 문서의 범위와 비범위를 명확히 적는다.
4. 관련 문서 링크를 함께 기록한다.
5. 검증 포인트와 완료 기준을 포함한다.
6. **task 단위 분해 시**: TASK_TEMPLATE의 `## 6. Acceptance Criteria`에 측정 가능한 AC를 최소 1개 이상 채운다. Given-When-Then 형식을 *강력 권장*하며 자세한 점검은 아래 9번 항목과 TASK_TEMPLATE 주석을 참조한다. AC가 비면 `/implement-workitem`이 RGR 사이클을 시작할 수 없다(정책: [ADR-009](../../../docs/90-decisions/boilerplate/ADR-009-tdd-default.md), [ADR-026](../../../docs/90-decisions/boilerplate/ADR-026-plan-workitem-schema.md)).
7. 새 문서를 만들 때는 해당 레벨의 템플릿을 복사해 채운다.
8. **분해 후 sizing self-check** — 다음 3 한계 중 하나라도 초과 시 *추가 분해 권장 텍스트*를 출력에 명시 (자동 차단 X, 사용자 결정):
   - 1 task = 1 RGR 사이클.
   - AC 3개 이하.
   - 변경 예정 파일(TASK_TEMPLATE `## 4-1`) 5개 이하.
   - 초기 scaffolding·auth 같은 task는 5개 파일 초과가 자연스럽다 — 사용자가 분해 거부 결정 가능.
9. **AC 형식 권장 + 금지 verb 점검** — 모든 AC는 Given-When-Then + measurable verb 권장(TASK_TEMPLATE 주석 참조). 강력 금지 verb("works"/"looks good"/"is correct"/"is fine") 사용 시 *재분해 권장 텍스트* 출력. 문맥상 허용 verb("handles"/"supports")는 *무엇을 / 어떻게*가 명시되면 통과.
9-1. **AC interpretation diversity self-check** (분해 직후 1회 실행, ADR-006#amend-1):

각 AC를 *2+ 합리적 해석이 가능한지* self-check.
가능 시 plan 출력의 "남은 미결정 사항" 섹션에 다음 형식으로 박음:

- AC-N (T-NNN): 해석 A=<...>, 해석 B=<...>, 권장 선택=<...>
  (이유: charter ## 7. 제약 조건 또는 ## 5. 비목표 정합 / 비용 정합 등)

자동 차단 X — 사용자가 plan 검토 시 *해석 결정 협상*.

**해석 확정 기록 (ADR-006#amend-2)**: 권장 선택이 채택될 만큼 명확하면 해당 task `## 8. 메모`에 `해석 확정: AC-N = <선택>` 한 줄을 *기록*한다. 이 기록이 있으면 implement(builder)는 그 해석을 기계적으로 따르고, *기록이 없는데 2+ 해석이면 implement는 진행을 중단(Needs Plan Decision)* 한다 — plan에서 해석을 확정해 두면 implement 하드스탑을 예방한다 (2-layer defense — plan이 사고, implement는 집행).

본 self-check가 plan 단계에서 발화하면 [implement-workitem ambiguity surfacing](../implement-workitem/SKILL.md)은
*재확인 surface*가 됨 — 2-layer defense (plan에서 잡으면 RGR 1회 절감).

10. **task 의존성 채움** — TASK_TEMPLATE `## 9. 의존성`을 분해 시 명시. 병렬 가능 task는 비워둔다.
11. **wave 그룹 계산** (ADR-038#d3 / #d6) — 다음 sub-step을 순서대로 수행. 결과는 본 skill *출력에만 echo* — workitem 문서 본문에 영속 저장 X (`## 9. 의존성`이 SSOT — ADR-005 정합). **Context 부담 회피**: 본 step의 검사 2종((a) 위상 정렬 / (b) lockfile race) + 선언 1종((c) 자동 분리 X) 모두 *각 task 본문 전체 fork-load 금지* — `## 9. 의존성` 본문 + `## 3. 구현 항목` 본문의 path-like 토큰만 회수 (ADR-019 minimal 정합). **file overlap 휴리스틱은 본 step에서 제외** — 정밀도가 낮고(`## 4-1`은 현행 정책상 plan 시점 대부분 비어 있음 — WORKFLOW.md `## 4`(task `## 4-1` 채움 시점 정책) + TASK_TEMPLATE 주석 SSOT) 외부 LLM peer review(`/validate-plan`)에 전적으로 위임.

11-(a) **위상 정렬 (결정적 알고리즘)**: 각 task의 `## 9. 의존성` 본문에서 *self-ID 콜론 뒤*의 자연어 텍스트(예: `- T-002: T-001의 X 정의 후 시작 가능` → 콜론 뒤 "`T-001의 X 정의 후 시작 가능`") 안에서 **`T-[0-9]+` 패턴의 task ID 토큰을 모두 추출**. 추출한 토큰을 dep로 간주 → **단순 DAG 위상 정렬** (Kahn's algorithm 등 결정적 알고리즘). *주의*: ADR-026 `## 9` 본문은 self-ID prefix(`- T-NNN:`) + 자연어 dep 설명 형식이라 prefix 자체는 *해당 task 본인*이고 dep는 콜론 뒤 텍스트에 묻혀 있음 — prefix만 보면 안 됨. **결정성 보장**: 같은 입력(`## 9. 의존성` 텍스트)에 같은 wave 그룹. 단, *추출 자체*가 자연어 본문 기반이라 false-positive/negative 가능 — 사용자가 wave 결과를 *참고용*으로 활용 + 최종 의존성 판단은 사용자 책임.
   *우선순위* (ADR-047 D9 workflow topology + D1 inspectability 정합): 본 task `## 9. 의존성`에 *구조화 필드*(`depends_on:` / `write_set:` 등)가 있으면 자연어 grep 대신 구조화 필드를 결정적으로 사용. `depends_on:` 부재 + 자연어 1줄만 있으면 기존 grep fallback. `write_set:` 교집합이 있는 task 쌍은 *같은 wave에 두지 않는다* — 자동 wave 분리 + 출력에 *file race* 한 줄 명시.

11-(b) **lockfile race 경고**: task 본문(`## 3. 구현 항목`)에서 manifest/lock 파일명 *어느 하나라도* 명시되면 (OR 매치 — 예: `package.json` / `pnpm-lock.yaml` / `Cargo.toml` / `Cargo.lock` / `pyproject.toml` / `poetry.lock` / `uv.lock` / `go.mod` / `go.sum` 중 하나라도 본문에 등장) 해당 task를 "단독 wave (lockfile race risk)"로 표시. **출력 echo만, 자동 차단 X, 영속 저장 X** — 사용자가 wave 구성을 결정. **휴리스틱 한계 명시**: 본 검출은 *파일명 토큰이 본문에 직접 적힌 경우*만 잡음 — "add Redis client" 같은 자연어 dep 추가 task는 false negative. 출력에 *"본 검출은 manifest/lock 토큰 명시 task만 매치 — 자연어 dep 추가는 누락 가능"* 한 줄 echo 권장.
   *write_set 우선* (ADR-047 D1): task의 `write_set:`이 박혀 있으면 manifest/lock 파일 grep 대신 *write_set의 매치*로 판정 (예: `write_set`에 `pnpm-lock.yaml`이 있으면 단독 wave). write_set 부재 시 기존 manifest/lock 토큰 grep fallback.

11-(c) **자동 분리 X**: 본 점검들은 *경고 출력만*. 사용자가 wave 내에서 sequential 진행 / 별 worktree 분리 / 그대로 동시 진행 중 결정.

## Workitem Type 라우팅 (ADR-039)
분해된 각 feature/task의 `## 0-1. Type`을 읽어 처리를 라우팅한다 (미기재 시 feature):
- **technical-enabler**: User Story 대신 기술적 근거 + 서비스하는 가정/기회(DISCOVERY ID)·상위 결정(ADR) 링크를 채운다. 시나리오 cross-check skip.
- **bugfix**: TASK `## 3-T. 트러블슈팅`(증상/재현/관측/가설/root cause/회귀 테스트 AC)을 채운다. AC는 *버그 재현 실패 테스트* 형태로.
- **refactor**: 외부 행동 불변을 AC에 명시("행동 동일 + 구조 개선 측정"). Surgical Changes(ADR-006) 정합 — 범위 밖 변경 금지를 task `## 4`에 박는다.
- **migration**: bootstrap-stack `--migrate` contract(ADR-041)를 상위 참조로 link. expand-contract 단계를 `## 3`에 분해.
- **research-spike**: 산출은 `/research-pack` 리서치 노트(ADR-040). TDD opt-out 기본(`## 6-2`에 사유=탐색 + follow-up 구현 task).

## feature 분해 시 (ADR-036)
feature 분해 시 12 main sections + `## 7-1` mapping subsection 모두 채운다.
`## 7 FAC`는 task `## 6 AC`로 분해되며 매핑 결과는 **feature 문서의 `## 7-1. FAC ↔ AC 매핑표` subsection에 영속 저장** (출력만 X — drift 차단).
매핑 누락(unmapped FAC)은 plan 출력의 "남은 미결정 사항"에 *추가*로 명시.
다음 라운드의 [validate-workitem](../validate-workitem/SKILL.md) Spec coverage audit (ADR-037)
및 [stabilize-milestone deterministic preflight](../stabilize-milestone/SKILL.md)가
본 영속 표를 참조해 cross-round 추적.

**Legacy fallback** — 기존 feature 문서(템플릿 변경 *전*에 생성된 것)는 `## 7-1` subsection이 부재할 수 있다. validator / stabilize preflight는 다음 순서로 회수한다:

1. `## 7-1` subsection 존재 → 본문 매핑 표 직접 점검.
2. 부재 → `## 7 FAC` 본문에서 *inline 매핑 표기*(예: `- FAC-1 → T-001:AC-1`) 휴리스틱 검출.
3. 둘 다 부재 → `Spec Gap: <feature> 매핑표 부재 — legacy 문서 보강 권장` 라벨로 IMPROVEMENT_GUIDE에 P1 기록 + 다음 plan 라운드에서 `## 7-1` 보강.

feature 분해 시 `## 11. 관련 문서` 에 *해당 스택* 의 `Architecture-Iface:` link 와 (UI 프로젝트 한정) `Design:` link 를 채운다. TEMPLATE 의 비해당 스택 줄은 *삭제* (placeholder 잔존 X — drift 차단).

**Evidence/Insight 연결 (ADR-035#amend-2)**: feature가 DISCOVERY `## 15. Insight Backlog`의 인사이트를 구현하는 것이면, feature `## 1. 요약`에 `근거 insight: I-N` 한 줄을 박고, 해당 Insight Backlog 행의 `status`를 `planned` + `linked feature`를 채울 것을 plan 출력에 권장(plan은 DISCOVERY를 직접 수정하지 않음 — `/discover-product --update`가 회수). **`Type: feature` 한정** — 근거 인사이트가 없는 즉흥 feature면 "남은 미결정 사항"에 `- 근거 insight 부재: F-NNN — DISCOVERY 회수 권장` 명시. technical-enabler 등 비-feature 타입은 가정/기회·ADR 링크로 정당화되므로 insight 부재 경고를 내지 않는다.

## --fast 모드
prototype은 `## 3 핵심 시나리오` / `## 7 FAC` / `## 8 NFR` 신설 3섹션을 1줄씩만 채워도 OK ("해당 없음" / "M2 이후 검토").
YAGNI 정합 — Phase 6의 graduation contract *시작 시점 budget*과 동등 정신.

## milestone 생성 시 default (ADR-014)
- `## 5. 완료 기준`은 ADR-014 graduation checklist 5+1 항목 default 사용 (MILESTONE_TEMPLATE 그대로 복사). 사용자가 추가 기준을 협상해 "(선택)" 행을 채운다.
- `## 8. 회고`는 `/stabilize-milestone`이 자동 채움 — plan 단계에서는 비워둔다.

반드시 지킬 원칙:
- 코드를 구현하지 않는다.
- 서로 다른 추상화 레벨을 한 문서에 섞지 않는다(milestone은 큰 목표, feature는 사용자 가치, task는 구현 단위).
- 하위 문서는 상위 문서를 링크한다.
- 확실하지 않은 내용은 가정으로 표시한다.
- 열린 질문이 남으면 문서에 명시한다.

마지막 출력:
- 생성·갱신한 문서 목록(상대 경로)
- 분해 결과 매트릭스 (아래 형식):
  ```
  | Milestone | Feature | Task  | AC 수 | 의존성  |
  |-----------|---------|-------|-------|--------|
  | M1        | F-001   | T-001 | 2     | -      |
  | M1        | F-001   | T-002 | 3     | T-001  |
  ```
- feature 분해 시: 매핑표는 feature 문서 `## 7-1`에 직접 기록(SSOT). plan 출력에는 **전체 표를 echo하지 않고** `unmapped N건`만 요약한다(ADR-037#amend-2 owning — ADR-005·ADR-046#d5 정합). 사람은 feature `## 7-1`을 연다.
- 핵심 가정
- 남은 미결정 사항
- **인터페이스·디자인 cross-check 결과** (정합성 self-check 결과 요약):
  ```
  DESIGN cross-check: 컴포넌트 중복 N건, raw hex K건, 상태 매트릭스 누락 M건
  ARCH 7-x cross-check: 7-1 위반 N건, 7-3 위반 K건, ...
  ```
  (UI/스택 비해당 시 "skip" 명시)
- **병렬 실행 그룹 (parallel waves)** — task `## 9. 의존성` 기반 위상 정렬 (자유 텍스트 dep는 best-effort). 다음 형식으로 echo:
  ```
  Wave 1 (병렬 가능): T-001, T-002, T-003
  Wave 2 (Wave 1 종료 후): T-004 (deps: T-001), T-005 (deps: T-002)
  Wave 3 (Wave 2 종료 후): T-006 (deps: T-004, T-005)
  Wave 4 (단독 — lockfile race risk): T-007 (의존성 추가 감지)
  ```
  - (file overlap 점검은 plan-workitem에서 제외 — `/validate-plan` 외부 peer review가 *외부 관점*으로 회수. 정합 근거는 step 11 머리 단락 + ADR-038#d3.)
  - **병렬 실행 권장 패턴** (ADR-038#d6 참조): `claude --worktree T-NNN -p "/implement-workitem T-NNN"` — 이름은 `--worktree` 인자로 필수. 단일 working tree 동시 implement는 비권장. 외부 리소스(DB / 포트 / lockfile / 빌드 캐시) 격리는 프로젝트 환경 책임 (ADR-038 면책 단락 참조). **⚠ plan 산출물 가시성 주의**: `claude --worktree`는 기본 *원격 기준 fresh checkout*이라 uncommitted plan 문서가 worktree 세션에서 안 보일 수 있음 → 병렬 implement 전 plan 산출물 commit 또는 `worktree.baseRef = "head"` 설정 (ADR-038#d6).
- **Cross-review opt-in 안내** (ADR-038) — 한 줄 안내 출력:
  ```
  품질 확신이 부족하면: 다른 세션·다른 LLM에서 `/validate-plan <workitem-id>` 1+ 회 → 원본 세션에서 `/repair-plan <workitem-id>` 회수.
  ```
- 다음 추천 단계 (보통 `/implement-workitem [task-id]` — wave 그룹 병렬 시 `claude --worktree T-NNN -p "/implement-workitem T-NNN"` 패턴, 또는 cross-review를 끼우려면 `/validate-plan [workitem-id]` 먼저)

## monorepo·백엔드 sizing 가이드
- **monorepo**: 1 task = 단일 패키지 5 파일 이하 (cross-package 변경은 task 분리).
- **백엔드**: OpenAPI 변경·DB migration·코드 구현은 *별도 task*로 분리. 한 task에 묶지 않는다.
- Phase 4.1의 sizing 휴리스틱(1 RGR / AC 3 / 변경 5)이 monorepo·백엔드에서 깨지는 문제는 *외부실증*(Nx/Turbo 패턴) 기반. [관측됨] 데이터는 Phase 12 Round 2에서 회수.
- **SSOT 노트**: 본 sizing 가이드는 본 skill 본문이 SSOT다. 운영 가이드라 ADR로 박지 않음 — 추적성은 ADR-026#amend-1에서 명시.

## 정합성 self-check (분해 직후 1회 실행, ADR-026#amend-1 + ADR-027#amend-1)
- charter `## 5. 비목표` 단락 키워드와 분해된 feature/task를 매칭. 위반 의심 시 출력의 "남은 미결정 사항"에 명시.
- feature 범위가 상위 milestone `## 3. 포함되는 기능`에 매핑되는지 확인. 매핑 실패 시 동일 위치에 명시.

### Task type prefilter (context bloat 회피 — 본 prefilter 결과로 아래 cross-check sub-항목 적용 여부 결정)

각 분해된 task 본문 (`## 2. 작업 범위` + `## 3. 구현 항목`) 에서 다음 키워드 매칭으로 task type 자동 분류 — 일치 시만 해당 cross-check 활성. 매칭 안 되면 본 task 의 UI/ARCH cross-check 모두 skip.

- **UI task 신호**: `component`, `컴포넌트`, `page`, `페이지`, `screen`, `view`, `route` (라우팅 결정 시 7-4 도 함께), `UI`, `frontend`, `프론트`, `style`, `theme`, JSX/TSX 파일 path
- **API task 신호**: `endpoint`, `API`, `route`, `handler`, `controller`, `OpenAPI`, `REST`, `GraphQL`, `7-1`
- **CLI task 신호**: `command`, `CLI`, `argv`, `subcommand`, `flag`, `7-2`
- **백엔드 task 신호**: `migration`, `schema`, `auth`, `인증`, `transaction`, `트랜잭션`, `cache`, `queue`, `worker`, `7-3`

> Prefilter 한계 명시: 본 키워드 매칭은 *best-effort*. false positive/negative 가능 — prefilter 가 놓친 task 는 **validate-workitem (validator) 의 CHECK 단계가 catch** (2-layer defense — plan prefilter 가 1차, validator 가 2차). *implement/builder 가 catch 하지 않는다* — implement 는 EXECUTE 전용 (ADR-027#amend-1 책임 분배).

### UI 프로젝트 + UI task 한정 — DESIGN.md cross-check
(DESIGN.md 부재 또는 본 task 가 UI 신호 미매칭 시 본 단락 skip + skip 사유 echo):
- 분해된 task 가 *새 컴포넌트* 를 신설하는가? 중복/재사용 검사는 **두 출처 모두** 대조 (인벤토리 stale 대비 — planner 는 Grep 권한 보유):
  - (a) DESIGN.md `## 7. Components` 인벤토리 (설계 레지스트리)
  - (b) 실제 `src/components/` · `app/components/` · `components/` 디렉터리의 기존 컴포넌트 파일명 (코드 실측 — DESIGN.md 미등록 컴포넌트도 포착)
  - 둘 중 *어느 쪽이라도* 기능 유사 컴포넌트 발견 시 "남은 미결정 사항" 에 `- 컴포넌트 중복 의심: T-NNN 의 X ↔ <DESIGN.md ## 7 의 Y / src/components/Z.tsx>. 재사용 검토 권장` 명시. (b) 에만 있고 (a) 에 없으면 *인벤토리 stale* → `+ DESIGN.md ## 7 등록 보강` 도 권장.
- AC 본문 또는 task `## 3. 구현 항목` 본문에 raw hex 색 코드 (`#[0-9A-Fa-f]{3,6}` 패턴) 가 직접 박혀 있는가? 발견 시 "남은 미결정 사항" 에 `- raw hex 검출: T-NNN AC-N — DESIGN.md ## 2 의 token 으로 교체 권장` 명시.
- **8 상태 매트릭스 점검은 *task 의 use-case 해당 상태* 한정** (DESIGN.md `## 7` 의 *전체* 8 상태 설계는 별도 — reviewer Design Consistency `[Design-state]` 책임). 본 self-check 는 *task 본문이 명시한 상호작용* (예: hover/disabled 가 use-case 에 등장하는데 AC 에서 언급 누락) 만 점검. 누락 상태가 있으면 "남은 미결정 사항" 에 `- use-case 상태 누락: T-NNN — <상태> 가 task 본문에 등장하지만 AC 미언급` 명시. 자동 차단 X.

### API/CLI/백엔드/프론트 스택 + 해당 type task 한정 — ARCH 7-x cross-check
(해당 sub-section 부재 또는 본 task 가 해당 type 신호 미매칭 시 본 단락 skip):
- API task: `## 7-1` envelope/error 컨벤션 외 응답 형식을 박는가? 분해된 task `## 3. 구현 항목` 본문에 envelope 형식 (예: `{ data, error, meta }`) 외 형식 키워드 (`status: ok`, `result:` 등) 등장 시 명시.
- CLI task: `## 7-2` 출력 포맷 컨벤션 외 형식을 박는가? `## 3` 본문에 명시된 출력 형식이 7-2 의 text/JSON/table 모드 외 형식인지 점검.
- 백엔드 task: `## 7-3` 결정 (DB migration / 인증 / 트랜잭션 / Idempotency / Rate limit / Async / Caching / API versioning) 과 어긋나는 새 결정을 즉흥 도입하는가? 도입 시 명시.
- 프론트 task: `## 7-4` 결정 (라우팅 / 상태관리 / SSR-CSR / i18n / SEO / 인증 / 폼 validation) 과 어긋나는 새 결정을 즉흥 도입하는가? 도입 시 명시.

### 신규 인터페이스 요소 → task `## 3. 구현 항목` 에 *등록 line item* authoring (builder 가 독립 판단 없이 실행하도록)

위 cross-check 에서 *정당한 신규 요소* (중복 아닌 새 컴포넌트 / 신규 endpoint / 신규 error code / 신규 출력 모드) 가 필요하다고 판단되면, 해당 task `## 3. 구현 항목` 에 **등록 step 을 명시적 line item 으로 박는다**:
- 예: `- 신규 IconButton 컴포넌트 생성 + DESIGN.md ## 7. Components 에 한 줄 등록 (8 상태 매트릭스 설계 포함)`
- 예: `- 신규 error code USER_LOCKED 도입 + ARCH ## 7-1 error 레지스트리 등록`
- 예: `- 신규 CLI 출력 모드 --json 추가 + ARCH ## 7-2 출력 포맷 등록`

이로써 등록 *결정* 은 plan 이 authoring 하고, builder 는 task 스펙을 *기계적으로 실행* — 등록 책임이 executor 의 독립 판단에 박히지 않는다 (ADR-027#amend-1 책임 분배 / ADR-005 정합). validator 는 본 line item 이 실행됐는지 점검 (`/validate-workitem` + `validator.md` CHECK 단계).

**진짜 새 *primitive*** (Button/Input/Card 외 기반 컴포넌트) 는 task line item 이 아니라 architect 또는 `/bootstrap-design` 라운드 권장 (아래 `## architect 호출 권장 신호` #6 정합) — plan 은 그 권장만 출력.

**외부 라이브러리 docs-check line item (ADR-040)**: task `## 2/## 3` 본문에 *외부 SDK·API·결제·인증·외부 서비스 연동* 키워드(예: `결제`, `payment`, `Stripe`, `OAuth`, `auth provider`, `SDK`, `webhook`, `외부 API`)가 등장하면, 해당 task `## 3. 구현 항목`에 line item을 자동 추가: `- 구현 전 최신 공식문서 확인 (/research-pack 또는 researcher 위임 — 모델 지식 컷오프 보완)`. builder는 이 line item을 보고 불확실하면 researcher 위임을 메인에 요청(직접 웹서핑 X).

**connected-MCP 사용 line item (ADR-048#d3)**: `docs/00-meta/STACK_SETUP_PLAN.md` `## Optional MCP Connectors` 표가 *존재*하면 그 표만 회수(부재 시 본 점검 skip — ADR-019 minimal). 분해 task의 capability(예: 브라우저 E2E / DB 스키마 introspection / 최신 공식문서 / PR·issue / 디자인 자산)가 표의 어떤 행 `lifecycle usage`와 매칭되면, 해당 task `## 3. 구현 항목`에 line item 자동 추가: `- <capability> 작업 시 <mcp-name> MCP 사용 (STACK_SETUP_PLAN Optional MCP Connectors 참조)`. 권장 텍스트만 — builder가 독립 판단 없이 실행하도록 *plan이 authoring*(ADR-040 docs-check / ADR-027#amend-1 책임 분배와 동일 패턴). 표의 행 `agent access`가 비어 있으면(아직 부여 X) line item에 `(agent access 미부여 — 연결 절차 (e) 필요)` 한 줄 부기.

**모두 자동 차단 X — *권장 텍스트만* 출력** (ADR-007 책임 경계 정합).

## architect 호출 권장 신호 (감지 시 텍스트 제안만, 자동 호출 금지 — ADR-007)
다음 6 신호 중 하나라도 감지되면 출력 마지막에 `architect 호출 권장: <이유>` 1줄 추가:
1. 새 모듈 디렉터리 생성 (`src/<new>/` 또는 동등 경로).
2. charter `## 7. 제약 조건`에 없는 새 외부 의존 (npm/pip/cargo) 추가.
3. ARCHITECTURE_OVERVIEW.md `## 3-1. 레이어 경계` 변경.
4. "패턴 변경" / "새 boundary" / "도메인 경계" 키워드 등장.
5. **ARCHITECTURE_OVERVIEW.md `## 7-1`/`## 7-2`/`## 7-3`/`## 7-4` 의 *기존 결정* 변경 또는 신규 항목 추가 의심** (예: API versioning 정책 변경 / 인증 방식 변경 / 라우팅 전략 변경). 인터페이스 결정 책임 분배 (ADR-027) 정합.
6. **DESIGN.md `## 7. Components` 인벤토리에 *새 primitive* 추가 의심** (예: 기존 Button/Input/Card 외 패턴 신설). 추가는 architect 또는 별도 `/bootstrap-design` 라운드 권장.

## Cross-review hook (ADR-038)
본 skill 호출 후 plan 품질에 확신이 부족하거나 다중 모델 관점을 원하면:
1. 별 터미널·별 세션 (Claude 또는 Codex)에서 `/validate-plan <workitem-id> --reviewer-tag <distinct-tag>` 1+ 회 실행. **다중 리뷰어 시 서로 다른 tag 필수** (default 충돌 silent overwrite 회피). 각 호출이 `docs/40-validation/plan-reviews/<id>.<tag>.md` 1개를 작성.
2. 원본 세션 (본 skill을 돌린 세션)에 돌아와 `/repair-plan <workitem-id>` 실행. 모든 리뷰 파일을 회수해 workitem 문서를 수정 + 리뷰 파일 삭제.

본 흐름은 *opt-in*. 건너뛰어도 워크플로우 정상 작동. *opt-in 시작 후 `/repair-plan`을 건너뛰면 `docs/40-validation/plan-reviews/<id>.*.md`가 잔존*: 다음 라운드 호출이 자동 suffix(-N)로 보존(또는 rm으로 수동 정리).

운영 권장 (worktree·외부 리소스 면책 단락): ADR-038#d6 + 면책 단락 참조.

## 기술 부채 회수 hook (ADR-022 / ADR-039)
부채 회수 의도가 있는 분해(사용자 요청 또는 milestone 부채 예산)일 때만 `docs/40-validation/IMPROVEMENT_GUIDE.md`의 *open* 항목(특히 P0/P1 리팩토링·아키텍처 부채)을 회수해, 이번 범위와 관련되면 **후보 task로 surface**한다(보통 `Type: refactor` 또는 `bugfix` — ADR-039). 자동 생성 X — 출력 "다음 추천 단계"/"남은 미결정 사항"에 `- 부채 회수 후보: <IMPROVEMENT_GUIDE 항목 ID> → T-XXX(refactor) 권장` 형태로 제시. 부채 회수 의도가 없으면 IMPROVEMENT_GUIDE를 사전 read 하지 않는다 (ADR-019 minimal 정합).

## 출력 스타일 (ADR-046)
마지막 출력은 signal-first(문서 목록 → 매트릭스 → 미결정 → 다음 액션). 파일에 영속된 상세(FAC↔AC 전체표·cross-check 세부)는 위치만 가리키고 echo하지 않는다.

## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 ADR/architecture 섹션은 task 본문에서 발화 시 인용 — 사전 fork-load 금지.
