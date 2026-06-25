# IMPROVE-GUIDE — 보일러플레이트 하니스 개선 실행 가이드

> 모드: How-to (단계별 실행 지침 — 이 문서만 보고 따라 하면 전체 개선이 완료된다)
> 작성: 2026-06-25 · 대상 저장소: agentic-dev-harness

## 0. 이 문서의 목적과 사용법

이 문서는 보일러플레이트의 워크플로 하니스를 개선하기 위한 **완결적 실행 지침서**다. 위에서 아래로 순서대로 따라가면 모든 개선이 끝난다. 각 Stage는 **`현재 (before)` → `변경 (after)`** 형식의 정확한 편집안과, 신규 파일의 **전체 내용**을 담는다.

**사용 규칙:**
- `현재 (before)` 블록의 텍스트를 대상 파일에서 *그대로* 찾아 `변경 (after)` 블록으로 치환한다. "이 블록 전체 삭제"면 삭제한다.
- "신규 파일" 표시가 있으면 주어진 전체 내용으로 새로 생성한다.
- 각 Stage 끝의 **`커밋:`** 라인은 그 지점에서 만들 git 커밋 메시지다 — 한 줄 영어 Conventional Commits (ADR-008). 이 커밋들은 *보일러플레이트 진화* 커밋이라 `Refs:` footer가 없다.
- 편집 전, 항상 대상 파일의 실제 현재 본문을 한 번 읽어 `before`가 일치하는지 확인한다(행 번호는 변동될 수 있으니 텍스트로 매칭).

## 1. 전제 — 이 작업은 "하니스 변이(harness mutation)"다

이 개선의 상당수는 *신규 기능*이 아니라 **이미 accepted된 ADR 결정을 역전**시킨다. 따라서 저장소 자체 규칙(ADR-045#d6: 결정 역전·정책 의미 변경은 amend가 아니라 supersede)에 따라 거버넌스가 따라붙는다 — 이는 **Stage 6**에서 2개의 umbrella ADR(ADR-051 / ADR-052) + ADR-040 Amendment 2로 일괄 처리한다.

| 변경 | 역전/변경 대상 | 처리 |
|---|---|---|
| implement → 메인 세션 foreman | ADR-050 D1 (implement fork 유지) | ADR-051이 부분 supersede |
| validate/stabilize 병렬 fan-out | ADR-050 D1 (validate inline 단일) | ADR-051 |
| wave 완전 제거 | ADR-038 #d3/#d6 + ADR-047 D9 | ADR-051이 supersede + D9 re-anchor |
| 조건부 재독 | ADR-019 (minimal/JIT) | ADR-019 Amendment 1 |
| stack-guard 설치 | "기본 설치 안 함" + ADR-025/040 | ADR-052 |
| E2E MUST-run 하드블록 | ADR-014 graduation item 3 | ADR-014 Amendment 2 (ADR-052 owning) |
| repair-milestone 신설 | "stabilize는 고치지 않는다" 경계 | ADR-052 |
| researcher 자율 위임 | ADR-040 enabling 정책 | ADR-040 Amendment 2 |

**확정된 설계 결정 (2026-06-25, 사용자 승인):**
1. **통합(merge) 안 함** — implement/validate/repair/finalize 4개 atomic skill은 독립 유지. 별도 묶음 skill·오케스트레이터도 만들지 않는다. implement·validate만 메인 세션 병렬 오케스트레이터로 전환.
2. **E2E** — stack-guard에서 선provision(설치+스캐폴드+smoke) + stabilize가 졸업 하드블록. 실제 코드/wiring 수정은 신규 repair-milestone가 담당(stabilize는 read-only 유지).
3. **stack-guard 설치** — 패키지 매니저 `install` + Playwright 브라우저까지 provision (검증 에러 root cause 해소).
4. **거버넌스** — umbrella ADR 1~2개(+amend)로 묶고 강제 surface만 동기화.

**미러 규칙 (ADR-010):** `.claude/skills/<name>/SKILL.md`가 canonical 본문이고, `.agents/skills/<name>/SKILL.md`는 `name`/`description` 외 전부 무시하는 thin pointer다. 따라서 **skill *본문* 편집은 `.claude`만** 고치면 되고 `.agents` 미러는 손대지 않는다. **신규/삭제 skill만** 양 미러를 함께 생성/삭제한다(이 가이드에서는 plan-milestone·repair-milestone 2개가 신규 → 양 미러 생성).

**Codex 패리티:** Codex는 sub-agent 병렬 위임 parity가 없다. 병렬 오케스트레이터 본문에는 "Codex: 병렬 위임 미지원 시 순차 단일 실행으로 degrade" 노트를 포함한다(각 Stage에 반영됨). **퇴행 아님 (외부 리뷰 정정)**: implement-workitem은 Codex에서 *원래부터* 메인 세션 인라인으로 실행된다(`.agents` thin wrapper가 `context: fork`를 무시 — 검증함). 따라서 de-fork는 Codex 동작을 *바꾸지 않는다* — Codex는 종전과 동일(애초에 fork 격리가 없었으므로 상실도 없음). 병렬 builder 격리·속도 이득은 *Claude 전용*이고, dual-tool(ADR-010)에서 이는 *Claude-first 최적화*로 의식적으로 수용한다.

## 2. 권장 실행 순서

상위 문서 선갱신 원칙(AGENTS.md)에 맞춰 **ADR-first**로 진행한다:

1. **Stage 6의 ADR-051 / ADR-052 본문을 먼저 생성**한다(Stage 6의 6.1~6.3). 이렇게 하면 Stage 1~5 본문 편집이 인용할 상위 결정이 먼저 존재한다.
2. **Stage 1 → Stage 5**를 순서대로 적용한다(각 Stage가 자기 ADR을 역참조). 각 Stage의 `커밋:` 지점에서 커밋한다.
3. **Stage 6의 나머지**(amend append, 기존 ADR supersede note, README 인덱스, STRUCTURE roster, 신규 skill 미러 *parity 검증* — 미러 *authoring*은 Stage 4A/5B에서 완료)를 적용한다.
4. **Stage 6 §6.5 최종 cross-surface 동기화 체크리스트**를 실행해 drift 0을 확인한다(stabilize-milestone deterministic preflight를 수동 모사).

### Stage 개요

| Stage | 내용 | 주 대상 |
|---|---|---|
| 1A | Wave 완전 제거 | plan-workitem, repair-plan, TASK_TEMPLATE, WORKFLOW, DELEGATION, README(_ko), .gitignore |
| 1B | stack-guard 의존성 선설치 + E2E readiness | stack-guard |
| 2A | implement-workitem → 메인 세션 foreman + 병렬 builder | implement-workitem, builder.md |
| 2B | validate-workitem → 병렬 validator fan-out | validate-workitem, validator.md |
| 2C | researcher 자동 활용 | builder.md, DELEGATION |
| 3 | 조건부 재독 | validate/repair/finalize Context 정책 footer |
| 4A | 신규 skill: plan-milestone (milestone+feature 생성) | .claude + .agents 미러 신설 |
| 4B | plan-workitem fork 해제 + task 전용 축소 | plan-workitem |
| 5A | stabilize-milestone 병렬 verifier + E2E 하드블록 | stabilize-milestone, MILESTONE_TEMPLATE |
| 5B | 신규 skill: repair-milestone | .claude + .agents 미러 신설 |
| 6 | 거버넌스 마감 (ADR-051/052 + amend + Surfaces/mirror/roster sync) | ADR 다수, STRUCTURE, README |

> 아래 각 Stage는 병렬 드래프트 에이전트가 실제 현재 본문을 정독해 작성한 것이다. `before` 블록은 작성 시점의 verbatim 본문이며, 적용 전 실제 파일과 대조한다.

## Stage 1A — Wave 완전 제거

**목표**: wave 개념(inter-task 병렬 배칭, `write_set`/wave 계산, `claude --worktree` 멀티세션 가이드)을 *처음부터 없었던 것처럼* 제거한다. 단 **평범한 `## 9. 의존성` task 순서 선언은 유지**한다. wave는 plan 출력에만 echo되던 비영속 산출물이었으므로(`## 9. 의존성`이 SSOT), 제거해도 영속 데이터 손실은 없다.

> **Codex 주의**: 본 stage는 병렬 오케스트레이터 *본문 자체를 삭제*하는 것이므로 "병렬 위임 미지원 시 순차 단일 실행으로 degrade" 류 잔존 노트를 남기지 않는다 — wave 병렬 경로가 통째로 사라지면 Codex/Claude 모두 단일 순차 implement만 남는다(별도 degrade 문구 불필요).

> **mirror 노트 (ADR-010)**: 아래 `.claude/skills/*/SKILL.md` 편집은 모두 *skill 본문* 수정이다. `.agents/skills/<name>/SKILL.md`는 `name`/`description` 외 모든 내용을 무시하는 thin pointer이므로 **`.agents` 미러 편집 불필요**. 신규/삭제 skill이 아니므로 미러 생성·삭제도 없다.

> **거버넌스 ADR (여기서 편집 금지)**: ADR-038(#d3/#d6 wave/worktree)·ADR-047 D9의 wave 처리는 **Stage 6 / ADR-051(거버넌스 섹션)**에서 다룬다. 본 stage에서는 ADR-038·ADR-047 본문을 편집하지 않는다. 단 plan-workitem/TASK_TEMPLATE 본문에 박힌 `(ADR-038#d3 / #d6)`·`(ADR-047 D9 ...)` *인용 토큰*은 아래 after 블록대로 함께 제거된다(인용 제거는 본 stage, 피인용 ADR 본문 수정은 Stage 6).

---

### 1. `.claude/skills/plan-workitem/SKILL.md`

#### 1-1. Step 11 전체 (11 + 11-(a)(b)(c)) 삭제, Step 10 유지

**현재 (before):**
```
10. **task 의존성 채움** — TASK_TEMPLATE `## 9. 의존성`을 분해 시 명시. 병렬 가능 task는 비워둔다.
11. **wave 그룹 계산** (ADR-038#d3 / #d6) — 다음 sub-step을 순서대로 수행. 결과는 본 skill *출력에만 echo* — workitem 문서 본문에 영속 저장 X (`## 9. 의존성`이 SSOT — ADR-005 정합). **Context 부담 회피**: 본 step의 검사 2종((a) 위상 정렬 / (b) lockfile race) + 선언 1종((c) 자동 분리 X) 모두 *각 task 본문 전체 fork-load 금지* — `## 9. 의존성` 본문 + `## 3. 구현 항목` 본문의 path-like 토큰만 회수 (ADR-019 minimal 정합). **file overlap 휴리스틱은 본 step에서 제외** — 정밀도가 낮고(`## 4-1`은 현행 정책상 plan 시점 대부분 비어 있음 — WORKFLOW.md `## 4`(task `## 4-1` 채움 시점 정책) + TASK_TEMPLATE 주석 SSOT) 외부 LLM peer review(`/validate-plan`)에 전적으로 위임.

11-(a) **위상 정렬 (결정적 알고리즘)**: 각 task의 `## 9. 의존성` 본문에서 *self-ID 콜론 뒤*의 자연어 텍스트(예: `- T-002: T-001의 X 정의 후 시작 가능` → 콜론 뒤 "`T-001의 X 정의 후 시작 가능`") 안에서 **`T-[0-9]+` 패턴의 task ID 토큰을 모두 추출**. 추출한 토큰을 dep로 간주 → **단순 DAG 위상 정렬** (Kahn's algorithm 등 결정적 알고리즘). *주의*: ADR-026 `## 9` 본문은 self-ID prefix(`- T-NNN:`) + 자연어 dep 설명 형식이라 prefix 자체는 *해당 task 본인*이고 dep는 콜론 뒤 텍스트에 묻혀 있음 — prefix만 보면 안 됨. **결정성 보장**: 같은 입력(`## 9. 의존성` 텍스트)에 같은 wave 그룹. 단, *추출 자체*가 자연어 본문 기반이라 false-positive/negative 가능 — 사용자가 wave 결과를 *참고용*으로 활용 + 최종 의존성 판단은 사용자 책임.
   *우선순위* (ADR-047 D9 workflow topology + D1 inspectability 정합): 본 task `## 9. 의존성`에 *구조화 필드*(`depends_on:` / `write_set:` 등)가 있으면 자연어 grep 대신 구조화 필드를 결정적으로 사용. `depends_on:` 부재 + 자연어 1줄만 있으면 기존 grep fallback. `write_set:` 교집합이 있는 task 쌍은 *같은 wave에 두지 않는다* — 자동 wave 분리 + 출력에 *file race* 한 줄 명시.

11-(b) **lockfile race 경고**: task 본문(`## 3. 구현 항목`)에서 manifest/lock 파일명 *어느 하나라도* 명시되면 (OR 매치 — 예: `package.json` / `pnpm-lock.yaml` / `Cargo.toml` / `Cargo.lock` / `pyproject.toml` / `poetry.lock` / `uv.lock` / `go.mod` / `go.sum` 중 하나라도 본문에 등장) 해당 task를 "단독 wave (lockfile race risk)"로 표시. **출력 echo만, 자동 차단 X, 영속 저장 X** — 사용자가 wave 구성을 결정. **휴리스틱 한계 명시**: 본 검출은 *파일명 토큰이 본문에 직접 적힌 경우*만 잡음 — "add Redis client" 같은 자연어 dep 추가 task는 false negative. 출력에 *"본 검출은 manifest/lock 토큰 명시 task만 매치 — 자연어 dep 추가는 누락 가능"* 한 줄 echo 권장.
   *write_set 우선* (ADR-047 D1): task의 `write_set:`이 박혀 있으면 manifest/lock 파일 grep 대신 *write_set의 매치*로 판정 (예: `write_set`에 `pnpm-lock.yaml`이 있으면 단독 wave). write_set 부재 시 기존 manifest/lock 토큰 grep fallback.

11-(c) **자동 분리 X**: 본 점검들은 *경고 출력만*. 사용자가 wave 내에서 sequential 진행 / 별 worktree 분리 / 그대로 동시 진행 중 결정.
```

**변경 (after):**
```
10. **task 의존성 채움** — TASK_TEMPLATE `## 9. 의존성`을 분해 시 명시. 의존성이 없는 task는 비워둔다.
```

> Rationale: Step 11 전체(머리 단락 + (a)(b)(c))가 wave 계산·`write_set` 교집합 분리·lockfile-race 단독 wave 로직이다. 통째로 삭제. Step 10의 "병렬 가능 task는 비워둔다" → "의존성이 없는 task는 비워둔다"로 wave 함의("병렬") 제거하되 의존성 선언 의미는 보존.

#### 1-2. "병렬 실행 그룹 (parallel waves)" 출력 블록 + "병렬 실행 권장 패턴" 삭제

**현재 (before):**
```
- **병렬 실행 그룹 (parallel waves)** — task `## 9. 의존성` 기반 위상 정렬 (자유 텍스트 dep는 best-effort). 다음 형식으로 echo:
  ```
  Wave 1 (병렬 가능): T-001, T-002, T-003
  Wave 2 (Wave 1 종료 후): T-004 (deps: T-001), T-005 (deps: T-002)
  Wave 3 (Wave 2 종료 후): T-006 (deps: T-004, T-005)
  Wave 4 (단독 — lockfile race risk): T-007 (의존성 추가 감지)
  ```
  - (file overlap 점검은 plan-workitem에서 제외 — `/validate-plan` 외부 peer review가 *외부 관점*으로 회수. 정합 근거는 step 11 머리 단락 + ADR-038#d3.)
  - **병렬 실행 권장 패턴** (ADR-038#d6 참조): `claude --worktree T-NNN -p "/implement-workitem T-NNN"` — 이름은 `--worktree` 인자로 필수. 단일 working tree 동시 implement는 비권장. 외부 리소스(DB / 포트 / lockfile / 빌드 캐시) 격리는 프로젝트 환경 책임 (ADR-038 면책 단락 참조). **⚠ plan 산출물 가시성 주의**: `claude --worktree`는 기본 *원격 기준 fresh checkout*이라 uncommitted plan 문서가 worktree 세션에서 안 보일 수 있음 → 병렬 implement 전 plan 산출물 commit 또는 `worktree.baseRef = "head"` 설정 (ADR-038#d6).
```

**변경 (after):** 이 블록 전체 삭제.

> Rationale: 이 불릿(`- **병렬 실행 그룹 ...**` 부터 들여쓰기된 `- **병렬 실행 권장 패턴 ...**` 줄까지)이 plan 출력의 wave echo 전체다. 평범한 의존성 매트릭스(아래 "분해 결과 매트릭스")는 별도이며 그대로 둔다.

#### 1-3. 마지막 "다음 추천 단계" 줄에서 wave 멘션 삭제

**현재 (before):**
```
- 다음 추천 단계 (보통 `/implement-workitem [task-id]` — wave 그룹 병렬 시 `claude --worktree T-NNN -p "/implement-workitem T-NNN"` 패턴, 또는 cross-review를 끼우려면 `/validate-plan [workitem-id]` 먼저)
```

**변경 (after):**
```
- 다음 추천 단계 (보통 `/implement-workitem [task-id]`, 또는 cross-review를 끼우려면 `/validate-plan [workitem-id]` 먼저)
```

#### 1-4. "의존성 설치 line item"의 wave/lockfile 정합 줄 삭제

**현재 (before):**
```
- **wave/lockfile 정합**: 새 의존을 추가하는 task는 기존 step 11-(b) "lockfile race 경고"·`write_set`에 lock 파일(`pnpm-lock.yaml` 등)을 포함시켜 *단독 wave*로 표시한다(병렬 implement 시 lockfile 충돌 차단).
- 이 의존이 charter 제약 밖이면 기존 `architect 호출 권장 신호 #2`도 함께 발화(새 외부 의존 = 검토 대상).
```

**변경 (after):**
```
- 이 의존이 charter 제약 밖이면 기존 `architect 호출 권장 신호 #2`도 함께 발화(새 외부 의존 = 검토 대상).
```

> Rationale: wave/lockfile 정합 줄은 삭제된 step 11-(b)와 `write_set` 단독-wave 표시를 참조하므로 dangling. 그 아래 charter-제약 발화 줄은 wave와 무관하므로 유지(앞 줄만 제거).

> **참고 (편집 불필요)**: 1-1에서 삭제되는 step 11 머리 단락이 참조하던 `## 4-1` file-overlap 정합 설명은 step 11과 함께 사라진다. `## 9. 의존성` authoring(step 10)·"분해 결과 매트릭스"의 `의존성` 컬럼·`## 9` 구조화 필드 *언급이 없는* 다른 단락은 그대로 둔다.

#### 1-5. `## Cross-review hook` 말미 wave-worktree 운영권장 줄 삭제 (외부 리뷰 반영 — 놓쳤던 유일한 wave 잔재)

plan-workitem `## Cross-review hook (ADR-038)` 섹션 마지막 줄이 ADR-038#d6(wave worktree 병렬 권장 — Stage 6에서 supersede)을 가리킨다. cross-review hook 자체는 유효(ADR-038 cross-LLM 부분 잔존)하나 이 한 줄만 stale pointer가 되므로 삭제한다.

**현재 (before):**
```
본 흐름은 *opt-in*. 건너뛰어도 워크플로우 정상 작동. *opt-in 시작 후 `/repair-plan`을 건너뛰면 `docs/40-validation/plan-reviews/<id>.*.md`가 잔존*: 다음 라운드 호출이 자동 suffix(-N)로 보존(또는 rm으로 수동 정리).

운영 권장 (worktree·외부 리소스 면책 단락): ADR-038#d6 + 면책 단락 참조.
```

**변경 (after):**
```
본 흐름은 *opt-in*. 건너뛰어도 워크플로우 정상 작동. *opt-in 시작 후 `/repair-plan`을 건너뛰면 `docs/40-validation/plan-reviews/<id>.*.md`가 잔존*: 다음 라운드 호출이 자동 suffix(-N)로 보존(또는 rm으로 수동 정리).
```

> Rationale: 전 저장소 wave 스윕에서 가이드가 놓친 *유일한* 실질 잔재(외부 리뷰 확인). ADR-038#d6이 Stage 6에서 supersede되므로 이 worktree 운영권장 줄은 dangling. 삭제로 wave 제거 완성도 100%.

---

### 2. `.claude/skills/repair-plan/SKILL.md`

#### 2-1. "수행" step 5의 wave 재emit 기록 지시 삭제

**현재 (before):**
```
5. Adopt / Adopt-modified로 결정된 항목에 대해 workitem 문서를 수정. 수정 후에도 양식 정합을 점검 (TEMPLATE의 섹션 번호 유지, FAC↔AC `## 7-1` 매핑 갱신, AC Given-When-Then 형식 유지). `## 9. 의존성`이 수정된 경우 그 사실을 *기록*해 아래 "마지막 출력" 단락의 wave 재emit 안내에 포함.
```

**변경 (after):**
```
5. Adopt / Adopt-modified로 결정된 항목에 대해 workitem 문서를 수정. 수정 후에도 양식 정합을 점검 (TEMPLATE의 섹션 번호 유지, FAC↔AC `## 7-1` 매핑 갱신, AC Given-When-Then 형식 유지).
```

#### 2-2. "마지막 출력"의 wave stale 플래그 삭제

**현재 (before):**
```
- **`## 9. 의존성` 수정 여부 플래그**: 수정됐으면 한 줄 안내 — `의존성 수정됨 → 기존 wave 그룹 stale. /plan-workitem <id> 재실행해 wave 재산출 권장.`
```

**변경 (after):** 이 줄 전체 삭제.

#### 2-3. "다음 권장 액션"에서 wave 재산출 사유 정리

**현재 (before):**
```
- 다음 권장 액션: 보통 `/implement-workitem <task-id>`. 의존성 수정이 있었으면 `/plan-workitem <id>` 재실행이 먼저, 대규모 변경이면 `/validate-plan` 재실행 권장.
```

**변경 (after):**
```
- 다음 권장 액션: 보통 `/implement-workitem <task-id>`. 대규모 변경이면 `/validate-plan` 재실행 권장.
```

> Rationale: 의존성 수정 시 `/plan-workitem` 재실행을 *먼저* 권하던 이유는 오직 "wave 재산출"이었다(2-2의 stale 플래그와 짝). wave가 사라지면 의존성 수정만으로 plan 재실행을 강제할 근거가 없어지므로 해당 분기를 제거. `## 9. 의존성` *수정 자체*는 여전히 step 5에서 정상 처리된다(plain dependency 선언 보존).

---

### 3. `docs/30-workitems/_templates/TASK_TEMPLATE.md`

#### 3-1. `## 9. 의존성` 주석 — wave 전용 5필드 구조 *완전 삭제*, plain 자연어 의존성만 유지

**현재 (before):**
```
## 9. 의존성
<!-- 기본(자연어): `- T-002: T-001의 X 정의 후 시작 가능`. 비어 있으면 병렬 가능으로 간주.

     선택(구조화, 병렬 wave 대상 task 한정 — ADR-026 schema + ADR-038#d3 정정 + ADR-047 D9 workflow topology + shared state 정합):
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

**변경 (after):**
```
## 9. 의존성
<!-- 자연어 1줄로 선행 task를 선언한다: `- T-002: T-001의 X 정의 후 시작 가능`. 비어 있으면 선행 의존 없음.
     plan-workitem이 본 선언을 읽어 분해 결과 매트릭스의 의존성 컬럼을 채운다. 단순 순차 진행 기준이며 별도 형식을 강제하지 않는다. -->
```

> Rationale (사용자 결정 — 5필드 *완전 삭제*): 5필드(`depends_on`/`read_set`/`write_set`/`assumptions`/`verifier`)는 ADR-047 D9 "opt-in, 병렬 wave 한정"으로 도입된 *wave 전용 스키마*다. wave 완전 제거 + YAGNI(추측성 추상화 금지)에 따라 *전부 삭제*하고 plain 자연어 의존성 선언만 남긴다. **foreman의 file-disjoint 분할은 `## 3` step 파일 경로로 결정**한다(write_set 불필요 — Stage 2A partition 규칙: `## 3` 경로 기반, 불확실하면 단일 builder fallback).

> **ADR-026 (편집 *필요* — Stage 6.4.2b)**: ADR-026 Surfaces line 55(`## 9 의존성 구조화 5필드 (opt-in, ADR-047 D9 정합)`)는 *삭제된 스키마*를 가리켜 stale가 된다 → Stage 6에서 그 Surfaces 줄을 제거한다(아래 §6.4.2b). ADR-026 `### 3. ## 9. 의존성 신설`의 *자연어* 형식 결정은 유효(자연어 의존성은 잔존).

> **참고 (편집 불필요)**: `## 3. 구현 항목` 주석의 의존성 설치 단계 형식(ADR-040#amend-1)은 wave를 언급하지 않으므로 그대로 둔다.

---

### 4. `docs/00-meta/WORKFLOW.md`

#### 4-1. §3 line 19 wave worktree 불릿 삭제

**현재 (before):**
```
- **선택**: `/plan-workitem` 직후 plan 품질 cross-validate가 필요하면, 다른 세션·다른 LLM에서 `/validate-plan <workitem-id>` 1+ 회 → 원본 세션에서 `/repair-plan <workitem-id>`로 회수 (ADR-038). opt-in — 건너뛰어도 정상.
- **선택**: `/plan-workitem` 출력의 wave 그룹을 참조해 동일 wave task를 별 worktree에서 동시 `/implement-workitem` 가능. 권장 패턴은 `claude --worktree T-NNN -p "..."` (이름은 `--worktree` 인자로 필수, ADR-038#d6). 단일 working tree 동시 implement는 비권장.
```

**변경 (after):**
```
- **선택**: `/plan-workitem` 직후 plan 품질 cross-validate가 필요하면, 다른 세션·다른 LLM에서 `/validate-plan <workitem-id>` 1+ 회 → 원본 세션에서 `/repair-plan <workitem-id>`로 회수 (ADR-038). opt-in — 건너뛰어도 정상.
```

> Rationale: 둘째 불릿이 wave 멀티세션 worktree 가이드. 첫째(cross-review opt-in)는 wave와 무관하므로 유지.

#### 4-2. lifecycle 다이어그램 footnote(line 87) 삭제

**현재 (before):**
```
> Note: wave 그룹 병렬 implement 시 `claude --worktree T-NNN -p "/implement-workitem T-NNN"` 권장 (ADR-038#d6 — 이름은 `--worktree` 인자로 필수).

각 단계의 정의와 책임 경계는 [ADR-007-workitem-lifecycle.md](../90-decisions/boilerplate/ADR-007-workitem-lifecycle.md)가 SSOT다.
```

**변경 (after):**
```
각 단계의 정의와 책임 경계는 [ADR-007-workitem-lifecycle.md](../90-decisions/boilerplate/ADR-007-workitem-lifecycle.md)가 SSOT다.
```

> Rationale: `> Note:` 한 줄과 그 뒤 빈 줄을 함께 삭제(다이어그램 코드블록과 SSOT 문장은 그대로). lifecycle 다이어그램 자체에는 wave 표기가 없으므로 다이어그램은 손대지 않는다.

---

### 5. `docs/00-meta/DELEGATION_STRATEGY.md`

#### 5-1. wave 단락 + "Wave 그룹 병렬 실행 권장 패턴" 블록 삭제 ("병렬 패턴 3종" 표는 유지)

**현재 (before):**
```
선택 기준 — 가벼운 병렬: 1, 같은 파일 충돌 가능성 있는 단일 작업: 2, 작업 단위가 분명한 codebase-wide 분산 작업: 3.

`/plan-workitem` 출력의 wave 그룹은 **본 표의 1·2·3과는 독립 차원**이다. 본 표는 메인 세션이 sub-agent를 한 turn 안에서 어떻게 호출하느냐(orchestration). wave 그룹은 *사용자가 여러 터미널·세션을 띄워 동일 wave의 task를 `/implement-workitem`으로 동시 진행*하는 multi-session 시나리오 (ADR-038).

**Wave 그룹 병렬 실행 권장 패턴** (ADR-038#d6 본문이 SSOT):
- `claude --worktree T-NNN -p "/implement-workitem T-NNN"` — 이름은 `--worktree` 인자로 필수. 미명시 시 자동 이름이 붙어 task-id와 매칭 안 됨. 공식 문서: [worktrees](https://code.claude.com/docs/en/worktrees).
- 단일 working tree 다중 implement 동시 실행 비권장. 외부 리소스 격리는 ADR-038 면책 단락 참조.
- `-p` + `--worktree` non-interactive 조합은 자동 cleanup 안 됨 — 작업 후 `git worktree remove .claude/worktrees/T-NNN` 수동 정리.

도구별 bundled batch 지원은 Claude Code의 `/batch`가 유일한 1차 출처다 (Codex 동등 기능 도입 시 본 단락 갱신). 도구별 매핑 SSOT는 [boilerplate/ADR-010](../90-decisions/boilerplate/ADR-010-multi-agent-compatibility.md).
```

**변경 (after):**
```
선택 기준 — 가벼운 병렬: 1, 같은 파일 충돌 가능성 있는 단일 작업: 2, 작업 단위가 분명한 codebase-wide 분산 작업: 3.

도구별 bundled batch 지원은 Claude Code의 `/batch`가 유일한 1차 출처다 (Codex 동등 기능 도입 시 본 단락 갱신). 도구별 매핑 SSOT는 [boilerplate/ADR-010](../90-decisions/boilerplate/ADR-010-multi-agent-compatibility.md).
```

> Rationale: 중간의 wave 독립차원 단락 + "Wave 그룹 병렬 실행 권장 패턴" 불릿 블록만 제거. 앞의 "병렬 패턴 3종" 표·선택 기준 줄과 뒤의 `/batch` 출처 단락은 wave-specific이 아니므로 유지("병렬 패턴 3종" 표는 명시적으로 보존 대상).

---

### 6. `README.md`

#### 6-1. flow 다이어그램(line 25–26)에서 wave 멘션 삭제

**현재 (before):**
```
  → /implement-workitem (parallel by wave groups — see plan-workitem output)
       └─ recommended: `claude --worktree T-NNN -p "/implement-workitem T-NNN"` per task (name in `--worktree` arg)
  → /validate-workitem → /repair-workitem (if Needs Fix) → /finalize-workitem
```

**변경 (after):**
```
  → /implement-workitem
  → /validate-workitem → /repair-workitem (if Needs Fix) → /finalize-workitem
```

#### 6-2. Quick Start Step 3 코드블록 주석(line 80) + (line 89–90)

**현재 (before):**
```
# Plan (emits parallel wave groups from task ## 9. 의존성)
/plan-workitem [milestone or feature id]
```

**변경 (after):**
```
# Plan (decomposes into milestone/feature/task with ## 9. 의존성 ordering)
/plan-workitem [milestone or feature id]
```

**현재 (before):**
```
# Implement (parallel by wave groups from /plan-workitem output)
#   Recommended: claude --worktree per task for isolated working tree
/implement-workitem [task id]
```

**변경 (after):**
```
# Implement
/implement-workitem [task id]
```

#### 6-3. "Tip — parallel implement" 블록(line 105) 삭제

**현재 (before):**
```
> **Tip — parallel implement**: `/plan-workitem` emits "parallel waves" derived from each task's `## 9. 의존성`. Tasks in the same wave can be implemented in **separate terminal sessions / worktrees** in parallel. Recommended pattern: `claude --worktree T-NNN -p "/implement-workitem T-NNN"` — the name is passed as the `--worktree` argument (required, no default mapping to task-id). ⚠ **Plan-artifact visibility**: `claude --worktree` defaults to a fresh checkout from `origin/HEAD`, so uncommitted plan documents may be invisible inside the worktree session — commit plan artifacts first, or set `worktree.baseRef = "head"`. See [ADR-038](docs/90-decisions/boilerplate/ADR-038-cross-llm-plan-validation.md) for full worktree + external-resource caveats.
```

**변경 (after):** 이 블록(`> **Tip — parallel implement**: ...`) 전체 삭제.

---

### 7. `README_ko.md`

#### 7-1. flow 다이어그램(line 25–26) wave 멘션 삭제

**현재 (before):**
```
  → /implement-workitem (wave 그룹 별 병렬 가능 — /plan-workitem 출력 참조)
       └─ 권장: `claude --worktree T-NNN -p "/implement-workitem T-NNN"` (이름은 `--worktree` 인자로 필수)
  → /validate-workitem → /repair-workitem (Needs Fix일 때) → /finalize-workitem
```

**변경 (after):**
```
  → /implement-workitem
  → /validate-workitem → /repair-workitem (Needs Fix일 때) → /finalize-workitem
```

#### 7-2. 빠른 시작 3단계 코드블록 주석(line 79) + (line 88–89)

**현재 (before):**
```
# 분해 (task ## 9. 의존성 기반 wave 그룹 출력)
/plan-workitem [milestone 또는 feature id]
```

**변경 (after):**
```
# 분해 (milestone/feature/task로 분해 + ## 9. 의존성 순서 선언)
/plan-workitem [milestone 또는 feature id]
```

**현재 (before):**
```
# 구현 (/plan-workitem 출력의 wave 그룹 기준 병렬 가능)
#   권장: task당 claude --worktree 별 worktree 격리 실행
/implement-workitem [task id]
```

**변경 (after):**
```
# 구현
/implement-workitem [task id]
```

#### 7-3. "Tip — 병렬 구현" 블록(line 104) 삭제

**현재 (before):**
```
> **Tip — 병렬 구현**: `/plan-workitem`은 각 task의 `## 9. 의존성`에서 파생된 "병렬 wave"를 출력한다. 같은 wave 안의 task는 **별 터미널 세션·별 worktree**에서 동시에 `/implement-workitem`으로 진행할 수 있다. 권장 패턴: `claude --worktree T-NNN -p "/implement-workitem T-NNN"` — 이름은 `--worktree` 인자로 *필수* (미지정 시 task-id와 무관한 자동 이름 부여). ⚠ **plan 산출물 가시성**: `claude --worktree`는 기본 `origin/HEAD` 기준 fresh checkout이라 uncommitted plan 문서가 worktree 세션에서 안 보일 수 있음 → 병렬 implement 전 plan 산출물 commit 또는 `worktree.baseRef = "head"` 설정. worktree + 외부 리소스 면책 전체는 [ADR-038](docs/90-decisions/boilerplate/ADR-038-cross-llm-plan-validation.md) 참조.
```

**변경 (after):** 이 블록(`> **Tip — 병렬 구현**: ...`) 전체 삭제.

---

### 8. `docs/90-decisions/boilerplate/ADR-040-external-research-capability.md`

#### 8-1. Amendment 1 결정 #1의 wave/lockfile 멘션 제거

**현재 (before):**
```
1. plan-workitem은 task가 *새 외부 패키지*를 요구하면 `## 3`에 설치 line item(`<pkg-manager> add <pkg>@<ver>` + 용도)을 박는다. 버전·사용법 불확실 시 `/research-pack <pkg>`(또는 researcher 위임) 선행을 권장 부기하고, 의존 추가 task의 `write_set`·lockfile race 경고에 lock 파일을 포함해 단독 wave로 표시한다.
```

**변경 (after):**
```
1. plan-workitem은 task가 *새 외부 패키지*를 요구하면 `## 3`에 설치 line item(`<pkg-manager> add <pkg>@<ver>` + 용도)을 박는다. 버전·사용법 불확실 시 `/research-pack <pkg>`(또는 researcher 위임) 선행을 권장 부기한다.
```

> Rationale: ADR-040은 wave를 소유하지 않는다(외부 리서치/의존성 설치 ADR). 본 amendment 결정문의 후반부("의존 추가 task의 `write_set`·lockfile race 경고에 ... 단독 wave로 표시")만 wave 참조이므로 그 절을 잘라낸다 — ADR 본문의 실질 결정(설치 line item authoring)은 보존. ADR-038/047 wave 본문은 Stage 6에서 별도 처리.

---

### 9. `.gitignore`

#### 9-1. `.claude/worktrees/` 엔트리 **유지** + 공유 주석에서 wave 표현만 제거

`.claude/worktrees/` 엔트리는 **삭제하지 않는다**(정정됨 — 외부 리뷰 반영). worktree 격리는 wave 전용이 아니다 — DELEGATION_STRATEGY "병렬 패턴 3종" #2(격리 git worktree)와 implement foreman의 *file write-conflict 시 worktree isolation*(Stage 2A — `EnterWorktree`/`ExitWorktree`)이 여전히 `.claude/worktrees/`를 쓸 수 있다. ADR-051 D5도 "잔존 무해 — Surgical(ADR-006)"로 *유지*를 명시한다. 따라서 line 16 주석에서 wave 전용 표현("+ .claude/worktrees/ 병렬 implement")만 제거하고 ignore 엔트리 자체는 둔다.

**현재 (before):**
```
.claude/settings.local.json
.idea
.claude/worktrees/
docs/30-workitems/plans/*.tmp
docs/40-validation/reports/*.md
!docs/40-validation/reports/.gitkeep
# plan-reviews (ephemeral) + .claude/worktrees/ 병렬 implement — ADR-038
docs/40-validation/plan-reviews/*.md
```

**변경 (after):**
```
.claude/settings.local.json
.idea
.claude/worktrees/
docs/30-workitems/plans/*.tmp
docs/40-validation/reports/*.md
!docs/40-validation/reports/.gitkeep
# plan-reviews (ephemeral) — ADR-038
docs/40-validation/plan-reviews/*.md
```

> Rationale (정정됨): `.claude/worktrees/` 줄(line 12)은 **유지**. line 16 공유 주석에서 wave 전용 "병렬 implement" 절만 제거해 plan-reviews 전용 주석으로 축소한다. plan-reviews ignore와 worktrees ignore 둘 다 wave 외 용도(cross-review / 일반 worktree 격리)가 있으므로 보존.

---

**커밋:** `refactor(harness): remove wave parallel-batching and the ## 9 5-field schema; keep plain natural-language ## 9 deps`

## Stage 1B — stack-guard: 의존성 선설치 + E2E readiness

> 정책 전환: 현 stack-guard 는 "기본은 설치하지 않음"이다. 본 Stage 는 이를 **install-by-default + graceful fallback** 으로 뒤집고, UI/web 프로젝트에 한해 `npx playwright install` 와 `validate:e2e` scaffold + smoke 를 추가한다. 변경 대상은 **skill BODY 뿐**이라 `.agents/skills/stack-guard/` mirror 편집은 불필요하다 (thin-wrapper 가 `name/description` 외 frontmatter·본문을 무시; ADR-010). stack-guard 는 병렬 orchestrator 가 아니므로 Codex degrade 주석도 불필요하다.

대상 파일: `.claude/skills/stack-guard/SKILL.md` (전부 BODY 편집).

> **잠금 결정 (Stage 1B 한정 — 아래 각 §의 "근거" 줄이 참조하는 (1)~(5))**:
> (1) install-by-default 정책 반전: "기본 설치 안 함" → "기본 설치 + graceful fallback".
> (2) UI/web 프로젝트는 `npx playwright install` + `validate:e2e` scaffold 를 provision.
> (3) 설치-소유 경계: stack-guard(baseline toolchain + e2e tooling) vs plan→implement(per-task 패키지).
> (4) `validate` 와 `validate:e2e` 를 *둘 다* smoke 하고 결과를 출력에 노출.
> (5) graceful `Needs Install` fallback — 설치 실패를 fabricate·silent skip 하지 않고 blocker 로 노출.

---

### 1. Step 5 "Smoke test (필수)" — validate + validate:e2e 둘 다 실행 + e2e wiring 판정 행 추가

`.claude/skills/stack-guard/SKILL.md`

**현재 (before):**

```md
5. **Smoke test (필수)**: 생성된 `validate` 명령을 1회 실행한다 (`allowed-tools` 의 Bash 권한 활용 — 신규 권한 추가 불필요).
   본 smoke test 는 *wiring 검증* 이 목적 (명령이 올바르게 연결됐는지) — *프로젝트 자체의 lint/test 통과 여부* 와 분리해 보고한다.

   판정 표:
   - **wiring 성공 + 프로젝트 PASS** → `validate smoke test: PASS (wiring OK, project clean)`.
   - **wiring 성공 + 프로젝트 빈 케이스** (비어있는 lint 룰 / 테스트 0건) → `validate smoke test: PASS (wiring OK, empty rules/tests warning)`.
   - **wiring 성공 + 프로젝트 lint/test 실 위반** → `validate smoke test: WIRING OK, PROJECT FAIL` + stderr 요약. stack-guard 자체는 성공이라 종료 X, 사용자에게 *프로젝트 수정* 안내.
   - **wiring 실패** (명령 없음 / 패키지 매니저 비호환 / 스크립트 자체 오류) → `validate smoke test: WIRING FAIL` + 생성된 명령 + 실패 stderr + 제안 대체 (예: pnpm 비호환 → `npm run validate`). **stack-guard 산출물 수정 필요** — 종료.

   > 핵심 구분: stack-guard 의 책무는 *wiring* 까지. 프로젝트 실 위반은 *프로젝트 책무* 라 smoke test 가 잡되 stack-guard 가 차단하지 않는다.
```

**변경 (after):**

```md
5. **Smoke test (필수)**: 수행-6 의 toolchain 설치가 성공한 경우 생성된 `validate` 명령을 1회 실행한다 (`allowed-tools` 의 Bash 권한 활용 — 신규 권한 추가 불필요). UI/web 프로젝트(수행-6 의 UI 판정 ≥1 신호)면 `validate:e2e` 도 1회 실행한다.
   본 smoke test 는 *wiring 검증* 이 목적 (명령이 올바르게 연결됐는지) — *프로젝트 자체의 lint/test 통과 여부* 와 분리해 보고한다.
   설치가 `Needs Install` 로 보류된 경우(수행-6) smoke test 를 실행하지 못하므로 `validate smoke test: SKIPPED (deps not installed — Needs Install)` 로 보고하고 종료하지 않는다(사용자 설치 후 재실행 안내).

   `validate` 판정 표:
   - **wiring 성공 + 프로젝트 PASS** → `validate smoke test: PASS (wiring OK, project clean)`.
   - **wiring 성공 + 프로젝트 빈 케이스** (비어있는 lint 룰 / 테스트 0건) → `validate smoke test: PASS (wiring OK, empty rules/tests warning)`.
   - **wiring 성공 + 프로젝트 lint/test 실 위반** → `validate smoke test: WIRING OK, PROJECT FAIL` + stderr 요약. stack-guard 자체는 성공이라 종료 X, 사용자에게 *프로젝트 수정* 안내.
   - **wiring 실패** (명령 없음 / 패키지 매니저 비호환 / 스크립트 자체 오류) → `validate smoke test: WIRING FAIL` + 생성된 명령 + 실패 stderr + 제안 대체 (예: pnpm 비호환 → `npm run validate`). **stack-guard 산출물 수정 필요** — 종료.

   `validate:e2e` 판정 행 (UI/web 한정):
   - **e2e wiring 성공 + 스펙 0건 / placeholder** (scaffold 직후 정상 케이스) → `validate:e2e smoke test: PASS (wiring OK, no specs yet)`.
   - **e2e wiring 성공 + 스펙 실행됨** → `validate:e2e smoke test: PASS (wiring OK)` (프로젝트 e2e 실패는 *프로젝트 책무* 로 분리 보고, 차단 X).
   - **e2e wiring 실패** (browser 미설치 / playwright config 누락 / `validate:e2e` 진입점 없음) → `validate:e2e smoke test: WIRING FAIL` + stderr + 제안 (browser 미설치 → `npx playwright install`; 진입점 누락 → 수행-6 재작업). **stack-guard 산출물 수정 필요** — 종료.
   - **browser 설치가 `Needs Install` 로 보류** → `validate:e2e smoke test: SKIPPED (browsers not installed — Needs Install: npx playwright install)`. 종료 X.

   > 핵심 구분: stack-guard 의 책무는 *wiring* (validate + validate:e2e 진입점·browser 까지). 프로젝트 실 위반은 *프로젝트 책무* 라 smoke test 가 잡되 stack-guard 가 차단하지 않는다.
```

근거: 잠금 결정 (4) — `validate` 와 `validate:e2e` 둘 다 smoke 한다. browser/deps 미설치는 fabricate 금지·`Needs Install` 보류와 정합하도록 SKIPPED 분기를 둔다.

---

### 2. 새 수행-step 6 — toolchain 설치 + (UI/web) `npx playwright install` + `validate:e2e` scaffold

수행 목록 끝(현 step 5 의 smoke test 블록 뒤, "마지막 출력:" 직전)에 새 step 을 추가한다. step 5 의 smoke test 가 step 6 의 설치 결과에 의존하므로, **번호상으로는 설치를 step 6 으로 두되 실행 순서는 "설치 → smoke" 임을 step 5·6 본문이 상호 참조**한다.

`.claude/skills/stack-guard/SKILL.md`

**현재 (before):**

```md
   > 핵심 구분: stack-guard 의 책무는 *wiring* 까지. 프로젝트 실 위반은 *프로젝트 책무* 라 smoke test 가 잡되 stack-guard 가 차단하지 않는다.

마지막 출력:
```

> 위 "현재 (before)" 의 첫 줄은 §1 의 after 로 이미 교체되었다. §1 적용 후 실제로 매칭할 텍스트는 §1 after 의 마지막 줄(`> 핵심 구분: stack-guard 의 책무는 *wiring* (validate + validate:e2e 진입점·browser 까지)...`)과 그 뒤의 `마지막 출력:` 이다. 아래 after 는 그 두 줄 사이에 step 6 블록을 삽입한다.

**변경 (after):**

```md
   > 핵심 구분: stack-guard 의 책무는 *wiring* (validate + validate:e2e 진입점·browser 까지). 프로젝트 실 위반은 *프로젝트 책무* 라 smoke test 가 잡되 stack-guard 가 차단하지 않는다.

6. **Toolchain 선설치 + E2E readiness** (실행 순서상 step 5 smoke test *앞*에 수행 — `allowed-tools` 의 Bash 활용, 신규 권한 불필요):
   - **6-1. UI 판정** (ADR-027#amend-3 압축 3-case): `docs/20-system/DESIGN.md` 부재 → 비-UI. DESIGN.md 존재 + `## 0. Status` ≠ `draft` → UI 확정. DESIGN.md 존재 + status == `draft` → 추가 신호((a) ARCH `## 7-4. 프론트 결정` 활성, (b) ARCHITECTURE_OVERVIEW 기술 선택이 web frontend 유형) ≥1 → UI 의심(UI 로 취급). 신호 0 → 비-UI. 상세: ADR-027#amend-3.
   - **6-2. Toolchain 설치 (전 스택 공통, 기계적 — 기본은 진행)**: 감지된 패키지 매니저로 authored devDeps 를 설치한다 — `pnpm install` / `npm install` / `pip install -e .` (또는 `uv sync`) / `go mod download` / `cargo fetch` 중 스택에 자연스러운 1종. lockfile 존재 시 frozen 설치(`pnpm install --frozen-lockfile` / `npm ci`) 우선. 설치 후 lock 파일 변경은 그대로 둔다(finalize 자동 화이트리스트, ADR-007#amend-1).
   - **6-3. Playwright browser 설치 (UI/web 한정)**: 6-1 이 UI 면 `npx playwright install` (CI/Linux 환경이면 `npx playwright install --with-deps` 제안만 부기, 자동 실행 X — OS 패키지 sudo 필요).
   - **6-4. `validate:e2e` scaffold (UI/web 한정, e2e 필요 시)**: `playwright.config.*` 가 *부재* 하면 최소 config(`testDir: 'e2e'`, 단일 chromium project, `webServer` 는 주석 placeholder)를 생성하고, `package.json` 의 `scripts` 에 `validate:e2e` 진입점(예: `playwright test`)을 박는다. *이미 존재* 하면 덮어쓰지 않고 발견 사실만 출력에 기록(도구 감지 우선순위 정합 — 기존 도구 미덮어씀). 비-UI 프로젝트는 6-3·6-4 를 skip 하되 6-2 toolchain 설치는 수행한다.
   - **6-5. Graceful fallback (날조·우회 금지)**: 6-2/6-3 의 설치 명령이 sandbox/네트워크/승인 차단으로 *실제 실패* 하면 fabricate 하지 않고 `Needs Install: <명령> — 메인 세션/사용자 실행 필요` 를 출력하고, 가능한 산출(진입점·config·verify 스크립트)은 계속 생성한다. 이후 step 5 smoke 는 해당 항목을 SKIPPED 로 처리한다. (implement-workitem 의 ADR-040#amend-1 `Needs Install` 패턴과 동일.)
   - **설치-소유 경계 주의(SSOT)**: 본 step 이 까는 것은 *toolchain + e2e 의존*(biome/tsc/vitest/@playwright/test + browser)뿐이다. *task 단위 런타임/기능 패키지*(결제 SDK 등)는 plan-workitem 이 authoring → implement-workitem 이 설치한다(ADR-040#amend-1). 경계 결정은 Stage 6(ADR-052)에 기록 — 본 step 은 toolchain+e2e 소유만 집행한다.

마지막 출력:
```

근거: 잠금 결정 (1)(2)(3)(5). UI 판정은 ADR-027#amend-3 의 압축 인라인 3-case 를 그대로 차용(바 참조 금지 정합). 설치-소유 경계는 stack-guard(toolchain+e2e) vs plan→implement(per-task) 로 명시하고 Stage 6/ADR-052 를 가리킨다.

---

### 3. "마지막 출력:" — 설치 결과 + e2e smoke 결과 줄 추가

`.claude/skills/stack-guard/SKILL.md`

**현재 (before):**

```md
마지막 출력:
- 생성/갱신한 파일 목록
- 운영 환경 가정 (R0 결과)
- 통합 명령 호출 방법 (예: `pnpm validate`)
- 매뉴얼 hook 등록 절차 SSOT 위치 ([GUARDRAILS_STRATEGY.md "## PostToolUse hook 매뉴얼 등록 절차"](../../../docs/00-meta/GUARDRAILS_STRATEGY.md)) — 생성된 STACK_SETUP_PLAN.md에는 link만 박힘.
- validate smoke test 결과 (PASS / PASS with warning / FAIL with stderr 요약)
- 다음 권장 단계 (`/plan-workitem` 또는 `/implement-workitem`)
```

**변경 (after):**

```md
마지막 출력:
- 생성/갱신한 파일 목록
- 운영 환경 가정 (R0 결과)
- 통합 명령 호출 방법 (예: `pnpm validate`; UI/web 이면 `pnpm validate:e2e` 도)
- UI 판정 결과 (UI 확정 / UI 의심 / 비-UI — ADR-027#amend-3 근거 신호)
- Toolchain 설치 결과 (`deps install: DONE (<pkg-manager>)` / `Needs Install: <명령>`); UI/web 이면 browser 설치 결과 (`playwright install: DONE` / `Needs Install: npx playwright install`)
- 매뉴얼 hook 등록 절차 SSOT 위치 ([GUARDRAILS_STRATEGY.md "## PostToolUse hook 매뉴얼 등록 절차"](../../../docs/00-meta/GUARDRAILS_STRATEGY.md)) — 생성된 STACK_SETUP_PLAN.md에는 link만 박힘.
- validate smoke test 결과 (PASS / PASS with warning / FAIL with stderr 요약 / SKIPPED)
- validate:e2e smoke test 결과 (UI/web 한정 — PASS (no specs yet) / PASS / WIRING FAIL / SKIPPED)
- 다음 권장 단계 (`/plan-workitem` 또는 `/implement-workitem`)
```

근거: 잠금 결정 (4)(5) — 설치 결과와 e2e smoke 결과가 출력에 노출되어야 사용자가 `Needs Install` 후속을 알 수 있다.

---

### 4. verify 풀세트 표 note — stack-guard 가 UI 프로젝트에 validate:e2e 를 scaffold + smoke 함을 명시

`.claude/skills/stack-guard/SKILL.md`

**현재 (before):**

```md
생성된 `validate` 명령은 위 표의 **format / lint / typecheck / unit test 4단계**를 *순서대로* 묶고, **e2e는 `validate:e2e` 별도 명령으로 분리**한다 (task 단위 finalize는 e2e 제외, milestone 단위 stabilize만 실행). 4단계 중 어느 하나라도 빠지면 출력에 *"missing: <단계>"* 명시.
```

**변경 (after):**

```md
생성된 `validate` 명령은 위 표의 **format / lint / typecheck / unit test 4단계**를 *순서대로* 묶고, **e2e는 `validate:e2e` 별도 명령으로 분리**한다 (task 단위 finalize는 e2e 제외, milestone 단위 stabilize만 실행). 4단계 중 어느 하나라도 빠지면 출력에 *"missing: <단계>"* 명시. **UI/web 프로젝트(ADR-027#amend-3 UI 판정)면 stack-guard 가 `validate:e2e` 진입점 + 최소 playwright config 를 scaffold 하고 browser 를 설치한 뒤(`npx playwright install`) `validate:e2e` 까지 smoke 한다**(수행-6 + Step 5). 비-UI 는 e2e scaffold 를 skip 하되 toolchain 설치는 수행한다.
```

근거: 잠금 결정 (2)(3)(4) — 표 note 가 e2e 분리만 말하고 누가 scaffold/smoke 하는지 불명확했다. stack-guard 책임을 명시한다.

---

### 5. "Dependency 설치 정책" 블록 — install-by-default + graceful fallback 으로 재작성 (정책 반전)

`.claude/skills/stack-guard/SKILL.md`

**현재 (before):**

```md
**Dependency 설치 정책** (네트워크 / 환경 의존도 큼 — 기본은 *설치하지 않음*):

- `/stack-guard` 는 *직접 패키지를 install 하지 않는다*. 산출은 `package.json` 의 `scripts.validate` 진입점 + verify 스크립트 본문 + *권장 devDeps 목록* (예: `biome / typescript / vitest / @playwright/test`).
- 출력에 `필요한 devDependencies (사용자가 npm install / pnpm add -D 로 직접 설치)` 섹션을 박는다 — 설치 명령 텍스트는 권장이지 자동 실행 X.
- 이유: 네트워크 환경 / 사용자 승인 / 기존 lockfile 충돌 / monorepo 의 workspace 라우팅 등 도구가 자동 판단하기 어려운 변수 존재. 자동 설치는 sandbox 정책 위반 위험도.
- 이미 설치돼 있으면 별도 출력 없이 verify 스크립트만 박는다.
```

**변경 (after):**

```md
**Dependency 설치 정책** (toolchain 선설치 — 기본은 *설치한다*, 차단 시 graceful fallback):

- `/stack-guard` 는 *authored toolchain 을 기본 설치* 한다(수행-6). 산출은 `package.json` 의 `scripts.validate`(+ UI/web 이면 `scripts.validate:e2e`) 진입점 + verify 스크립트 본문 + 실제 설치된 devDeps(예: `biome / typescript / vitest / @playwright/test`) + (UI/web) playwright browser.
- 패키지 매니저 설치는 lockfile 존재 시 frozen(`pnpm install --frozen-lockfile` / `npm ci`) 우선, 부재 시 일반 install. 설치된 devDeps 목록을 출력에 박는다.
- **설치 범위 경계(SSOT)**: stack-guard 가 까는 것은 *toolchain + e2e 의존* 뿐이다. *task 단위 기능 패키지*는 plan-workitem authoring → implement-workitem 설치(ADR-040#amend-1). 경계 결정 기록은 Stage 6/ADR-052.
- **Graceful fallback (날조·우회 금지)**: 네트워크 / 사용자 승인 / lockfile 충돌 / monorepo workspace 라우팅 / sandbox 정책으로 설치가 *실제 실패* 하면 fabricate 하지 않고 `Needs Install: <명령> — 메인 세션/사용자 실행 필요` 를 출력하고 가능한 산출(진입점·config·verify 스크립트)은 계속 생성한다(implement-workitem ADR-040#amend-1 패턴 동일). 이후 smoke 는 SKIPPED.
- 이미 설치돼 있으면(노드 모듈/lock 정합) 재설치하지 않고 verify 스크립트만 박되, 설치 상태를 `deps already present` 로 출력한다.
```

근거: 잠금 결정 (1)(5) — "기본은 설치하지 않음" → "기본 설치 + graceful fallback" 정책 반전. 기존 "자동 설치는 sandbox 정책 위반 위험" 우려는 `Needs Install` fallback 으로 흡수한다. 설치-소유 경계와 ADR-052 포인터를 함께 박는다.

---

### Stage 6 / ADR-052 기록 항목 (이 Stage 에서 직접 편집하지 않음 — Stage 6 작업 메모)

본 Stage 는 설치-소유 경계를 stack-guard 본문에 *집행* 으로만 박았다. 그 경계의 *결정 근거* 는 신규 **ADR-052(설치-소유 경계: stack-guard=toolchain+e2e ; plan→implement=per-task packages)** 로 기록해야 한다(Stage 6). 현 ADR-025·ADR-040#amend-1 에는 이 경계가 명시돼 있지 않으므로(ADR-025 는 "권장만/자동 생성 X", ADR-040#amend-1 은 per-task 설치만), 두 ADR 사이의 빈 영역을 ADR-052 가 채운다. 본 Stage 작업 시 stack-guard 본문의 `ADR-052` 인용이 dangling 이 되지 않도록 Stage 6 와 동시 머지하거나, ADR-052 미생성 구간에는 인용을 `Stage 6(ADR-052 예정)` 로 둔다.

**커밋:**

```
feat(stack-guard): install toolchain + e2e browsers by default with Needs Install fallback
feat(stack-guard): scaffold and smoke-test validate:e2e for UI/web projects
```
```

## Stage 2A — implement-workitem: 단일 builder → 메인 세션 foreman + 병렬 builder

이 stage는 ADR-050 D1(`implement-workitem`은 fork 유지) 결정을 **`implement-workitem`에 한해 되돌린다**. 메인 세션이 task를 한 번 읽고 file-disjoint slice로 분할한 뒤 slice별로 builder를 병렬 fan-out하는 *foreman* 역할을 맡는다. 작은 task(파일 ≤~2-3, RGR 1회)는 분할/병렬 오버헤드 없이 단일 builder 1개로 처리한다. builder는 자기 slice의 AC에 대해서만 RGR을 돈다. 이 되돌림의 근거·rollback은 Stage 6에서 신설하는 ADR-051에 박는다 (ADR-050 D1 supersede 일부 — implement-workitem 한정).

> 작성자 메모(가이드 본문 아님): ADR-051은 아직 존재하지 않는다. Stage 6에서 ADR-051(implement-workitem foreman/병렬화로 ADR-050 D1 부분 supersede)을 신설해야 본 stage의 cross-ref가 닫힌다. 본 stage 커밋 시점에 ADR-051 stub이 없다면 Stage 6과 함께 묶거나, 본문의 `(ADR-051)` 참조를 Stage 6 머지 전까지 `(ADR-051, Stage 6 신설 예정)`로 둔다.

### 1. `.claude/skills/implement-workitem/SKILL.md`

#### 1-1. Frontmatter — `context: fork` / `agent: builder` 제거, `Agent` 도구 추가

`context: fork` + `agent: builder`를 제거해 메인 세션 인라인 실행으로 전환하고, `allowed-tools`에 `Agent`(서브에이전트 dispatch)를 추가한다. `context-pack: minimal`은 유지한다.

**현재 (before):**

```
---
name: implement-workitem
description: Implement one scoped workitem using builder, following Red→Green→Refactor TDD cycle.
argument-hint: "[task identifier] [--fast]"
allowed-tools: Read Glob Grep Write Edit Bash
context: fork
agent: builder
context-pack: minimal
---
```

**변경 (after):**

```
---
name: implement-workitem
description: Implement one scoped workitem as foreman — partition into file-disjoint slices and dispatch builder(s) (parallel when disjoint, single for small tasks), each running Red→Green→Refactor.
argument-hint: "[task identifier] [--fast]"
allowed-tools: Read Glob Grep Write Edit Bash Agent
context-pack: minimal
---
```

근거: 메인 세션이 builder를 fan-out하려면 `Agent` 도구가 `allowed-tools`에 있어야 한다. `context: fork`/`agent: builder` 제거는 ADR-050 패턴(de-fork 메인 세션 실행)과 동일하나, 여기서는 builder를 *없애는 게 아니라* 메인이 builder를 dispatch하는 foreman으로 바꾸는 것이다.

#### 1-2. 본문 intro + "반드시 먼저 할 일" — foreman/partition으로 reframe

메인 세션이 task 문서를 **한 번** 읽고 slice로 분할한 뒤, 각 builder에게 **자기 slice + 관련 `## 3` step + AC subset만** 전달하도록 재구성한다 (ADR-019 minimal — builder에 task 전문/전체 fork-load를 넘기지 않는다).

**현재 (before):**

```
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
```

**변경 (after):**

```
너의 역할은 지정된 workitem 구현을 지휘하는 *foreman*이다 — task를 file-disjoint slice로 쪼개고 각 slice를 builder 에게 위임한다. 각 builder 는 자기 slice 의 AC 에 대해 Red → Green → Refactor 3 phase 사이클을 돈다. 메인 세션(너)은 직접 구현하지 않고 분할·dispatch·병합·최종 sanity 검증만 한다.

> Codex: 병렬 위임 미지원 시 순차 단일 실행으로 degrade — slice 들을 한 builder 가(또는 메인이 직접) 순서대로 처리한다. 분할 결과·병합·최종 step 은 동일하게 적용한다.

입력:
- `$ARGUMENTS`에는 task ID가 들어온다 (feature/milestone 분해는 `/plan-workitem` 책임 — 본 skill은 task 단위 구현 전용).
- `--fast` 플래그가 있으면 *단일 builder 1개*만 띄워 RGR 사이클을 1회만 돌려 첫 AC만 완료하고 종료한다(prototype용 — 분할 안 함).

반드시 먼저 할 일 (메인 세션이 1회 수행):
1. 관련 task 문서를 읽는다 (메인 세션이 *한 번*만 읽는다 — builder 에 task 전문을 넘기지 않는다).
2. 필요하면 상위 feature/milestone/architecture 문서를 읽는다.
3. task 문서의 `## 6. Acceptance Criteria`(AC-1, AC-2 ...)와 `## 3. 구현 항목`을 회수한다.
4. **분할 (partition) — 싸게 한다, 과추론 금지**:
   - `## 3. 구현 항목` step 을 *건드리는 파일/경로* 기준으로 묶는다. step 의 파일 경로는 `## 3` 본문(또는 `## 4-1. 변경 예정 파일/경로` 힌트)에서 읽는다.
   - 파일 집합이 **서로 겹치지 않는(disjoint)** step 그룹 → 각각 한 slice → *병렬 builder*.
   - 파일이 **겹치거나** step A 산출물을 step B 가 import/호출하는 *명백한* 선후 의존이 있으면 → 같은 slice(한 builder) 또는 *순차* dispatch. 의존은 `## 3` step 경로만 보고 rough 하게 판단 — 깊은 그래프 분석 금지.
   - **작은 task(파일 ≤~2-3개, RGR 1회 분량)** → 분할하지 말고 *단일 builder 1개*. 병렬 오버헤드를 만들지 않는다.
   - 각 slice 는 {담당 step 목록, 그 step 이 만족시킬 AC subset, slice 가 건드릴 파일 집합}으로 정의된다.
5. **dispatch — 각 builder 에게 자기 slice 만 전달**한다 (ADR-019 minimal). builder 1개에 넘기는 것:
   - 그 slice 의 `## 3` step 들 (전문 아님, 해당 step 만)
   - 그 slice 가 책임지는 AC subset (예: builder-A → AC-1·AC-2, builder-B → AC-3)
   - **task `## 7. 관련 문서` 의 `Design:` / `Architecture-Iface:` link 가 있고 그 slice 와 관련되면** 그 sub-section (예: `DESIGN.md ## 7 Components`, `ARCH ## 7-1`) 경로만 — *plan 이 박은 결정을 충실히 실행하기 위함* (builder 의 독립 디자인 판단 X — EXECUTE 전용). 전체 fork-load 금지. 관련 link 없으면 생략.
   - 그 slice 의 step 에 *등록 line item* (예: `+ DESIGN.md ## 7 등록`, `+ ARCH ## 7-1 error 레지스트리 등록`) 이 있으면 함께 전달 — builder 가 구현과 *동일 commit* 에 기계적으로 수행한다 (builder 가 등록 여부를 *독립 판단하지 않는다*). (ADR-027)
   - 병렬 builder 는 *file-disjoint* slice 에만 띄운다. 같은 파일에 실제 write-conflict 가능성이 있으면 worktree isolation(`EnterWorktree`/`ExitWorktree`)을 *그 경우에 한해* 적용하거나 순차로 돌린다 — disjoint 인 일반 경우엔 worktree 불필요.
   - **same-checkout 제약(WORKFLOW.md 정합)**: worktree 를 쓴 builder 의 변경은 *최종 minimal validate 전에 메인 checkout 으로 병합*한다. validate/finalize 는 같은 checkout 에서 실행해야 하고, validation report(`docs/40-validation/reports/<task-id>.md`)는 gitignored·checkout-local 이라 worktree 에 흩어지면 후속 finalize 가 `Needs Validation` 으로 못 찾는다. 일반 disjoint 병렬(worktree 미사용)은 본 제약과 무관.
6. **`## 6-2. TDD opt-out` 점검 (메인이 먼저)** — 사유와 follow-up이 모두 있으면 opt-out 모드를 해당 slice builder 에 지시, 둘 중 하나만 비어 있으면 형식 위반으로 표시하고 *분할/dispatch 전에 종료*(사용자에게 보강 요청).
```

근거: foreman이 task를 1회 읽고 slice별로 최소 컨텍스트만 builder에 주입(ADR-019)하는 게 본 stage의 핵심. partition은 `## 3` step의 파일 경로만으로 싸게 결정한다(과추론 금지 — locked 지침). `--fast`는 분할을 우회해 단일 builder 1회로 유지한다.

#### 1-3. opt-out / RGR / AC 해석 / 기본 흐름 — "각 builder가 자기 slice에 대해 수행"으로 relocate

opt-out 흐름과 RGR 사이클 gate들을 builder slice 스코프로 재배치한다. 기존 정책 본문은 보존하되, 주어를 "builder(각 slice)"로 명확히 한다.

**현재 (before):**

```
opt-out 흐름 (사유와 follow-up 모두 채워졌을 때만):
- 테스트 작성을 건너뛴다.
- 출력에 "TDD opt-out 사유: <사유> / Follow-up: <task ID>"를 명시.
- 다른 흐름은 동일.

기본 흐름 — Red → Green → Refactor (각 AC마다 반복):

Red phase 진입 직전, 출력의 첫 단락으로 plan 을 다음 형식으로 명시할 것을 *권장* 한다 (plan 모드 의존 없이 think-before-edit 규율 확보):
```

**변경 (after):**

```
아래 흐름은 **각 builder 가 자기 slice 에 대해** 수행한다 (메인 foreman 은 dispatch 후 결과를 수합한다).

opt-out 흐름 (사유와 follow-up 모두 채워졌을 때만 — 메인이 4-6 step 에서 확인해 지시):
- 테스트 작성을 건너뛴다.
- 출력에 "TDD opt-out 사유: <사유> / Follow-up: <task ID>"를 명시.
- 다른 흐름은 동일.

기본 흐름 — Red → Green → Refactor (builder 가 *자기 slice 의 AC subset* 마다 반복):

Red phase 진입 직전, builder 출력의 첫 단락으로 plan 을 다음 형식으로 명시할 것을 *권장* 한다 (plan 모드 의존 없이 think-before-edit 규율 확보):
```

**현재 (before):**

```
AC 해석 처리 (ADR-006#amend-2 — 하드스탑):
1. 먼저 task `## 8. 메모`의 `해석 확정: AC-N = <선택>` 기록을 찾는다.
   - 기록 있음 → 그 해석을 *기계적으로 따른다*. 자체 재해석 금지.
2. 기록 없음 + 2+ 해석이 *구현을 실질적으로 다르게* 만듦(사소한 표현 차이는 제외) → **구현을 시작하지 않고 `Needs Plan Decision`으로 즉시 종료**한다.
   - 출력에 해석안 1~3개를 나열하고, `/plan-workitem <id>` 재실행(또는 cross-review 했으면 `/repair-plan <id>`)으로 해석을 확정하도록 안내한다.
   - builder는 *자기 해석을 골라 진행하지 않는다* (자아 차단 — plan이 사고, implement는 집행). 단 해석 차이가 사소(동일 구현 수렴)하면 멈추지 말고 진행.
```

**변경 (after):**

```
AC 해석 처리 (각 builder 가 자기 AC subset 에 대해 수행 — ADR-006#amend-2 하드스탑):
1. 먼저 task `## 8. 메모`의 `해석 확정: AC-N = <선택>` 기록을 찾는다.
   - 기록 있음 → 그 해석을 *기계적으로 따른다*. 자체 재해석 금지.
2. 기록 없음 + 2+ 해석이 *구현을 실질적으로 다르게* 만듦(사소한 표현 차이는 제외) → **그 slice 구현을 시작하지 않고 `Needs Plan Decision`으로 즉시 종료**한다(메인 foreman 에 그대로 보고 — 메인은 해당 slice 만 보류하고 다른 slice 는 계속).
   - 출력에 해석안 1~3개를 나열하고, `/plan-workitem <id>` 재실행(또는 cross-review 했으면 `/repair-plan <id>`)으로 해석을 확정하도록 안내한다.
   - builder는 *자기 해석을 골라 진행하지 않는다* (자아 차단 — plan이 사고, implement는 집행). 단 해석 차이가 사소(동일 구현 수렴)하면 멈추지 말고 진행.
```

근거: AC ambiguity 하드스탑이 slice 단위로 동작하도록 — 한 slice의 `Needs Plan Decision`이 나머지 disjoint slice의 진행을 막지 않는다.

#### 1-4. `--fast` / `## 4-1` 갱신 — 단일 builder 및 foreman 병합으로 reframe

기존 RGR 종료 문구를 보존하되 foreman이 각 builder의 `## 4-1`을 하나로 병합하도록 명시한다.

**현재 (before):**

```
위 사이클을 task의 모든 AC가 소진될 때까지 반복.
`--fast`면 첫 AC만 완료하고 종료, 나머지 AC는 후속 호출 권장.

마지막에 task 문서의 `## 4-1. 변경 예정 파일/경로`를 갱신한다(finalize의 add 참조 목록).
```

**변경 (after):**

```
각 builder 는 위 사이클을 *자기 slice 의 AC subset* 이 소진될 때까지 반복한다.
`--fast`면 단일 builder 가 첫 AC만 완료하고 종료, 나머지 AC는 후속 호출 권장.

각 builder 는 *자기 slice 가 건드린 파일* 을 메인 foreman 에 반환한다.
**메인 foreman 은 모든 builder 의 변경 파일 목록을 합쳐 task 문서의 `## 4-1. 변경 예정 파일/경로` 를 *한 번* 갱신한다** (slice 별 중복 제거 — finalize 의 add 참조 목록). builder 가 같은 `## 4-1` 을 동시에 쓰지 않게 갱신 주체는 메인으로 단일화한다.
```

근거: 병렬 builder가 `## 4-1`을 각자 쓰면 write-conflict가 난다. foreman이 단일 writer로 병합한다(locked 지침: foreman이 각 builder의 `## 4-1`을 하나로 머지).

#### 1-5. 외부 docs-check / 의존성 설치 / MCP gate — "각 builder가 자기 slice에서" 명시

세 gate(ADR-040, ADR-040#amend-1, ADR-048#d4) 본문은 보존하고, 도입 주어만 slice 스코프로 바꾼다.

**현재 (before):**

```
외부 docs-check line item 처리 (ADR-040):
- task `## 3. 구현 항목`에 `구현 전 최신 공식문서 확인` line item(plan이 박음)이 있고, 그 외부 라이브러리·API의 *최신 사용법 확신*이 없으면 **구현을 시작하지 않고** 출력에 `Needs Research: <대상> — /research-pack <대상> 실행 후 재개 권장`을 명시한다. builder는 웹 접근이 없어 *직접 웹서핑하지 않는다*. 이미 확신이 있으면 line item을 체크하고 진행한다.
```

**변경 (after):**

```
외부 docs-check line item 처리 (각 builder 가 자기 slice 의 `## 3` step 에 대해 — ADR-040):
- 그 slice 의 step 에 `구현 전 최신 공식문서 확인` line item(plan이 박음)이 있고, 그 외부 라이브러리·API의 *최신 사용법 확신*이 없으면 **그 slice 구현을 시작하지 않고** 출력에 `Needs Research: <대상> — /research-pack <대상> 실행 후 재개 권장`을 명시한다(메인 foreman 에 보고 — 메인은 그 slice 만 보류). builder는 웹 접근이 없어 *직접 웹서핑하지 않는다*. 이미 확신이 있으면 line item을 체크하고 진행한다.
```

**현재 (before):**

```
의존성 설치 line item 처리 (ADR-040#amend-1):
- task `## 3. 구현 항목`에 plan이 박은 의존성 설치 line item(예: `pnpm add <pkg>@<ver>`)이 있으면, 그 패키지가 필요해지는 시점(보통 Green phase)에 **설치 명령을 먼저 실행**한다(`allowed-tools`의 `Bash` 활용 — 추가 권한 불필요). 설치는 기계적 작업이므로 *기본은 진행*이다.
```

**변경 (after):**

```
의존성 설치 line item 처리 (각 builder 가 자기 slice 에서 — ADR-040#amend-1):
- 그 slice 의 step 에 plan이 박은 의존성 설치 line item(예: `pnpm add <pkg>@<ver>`)이 있으면, 그 패키지가 필요해지는 시점(보통 Green phase)에 **설치 명령을 먼저 실행**한다(builder `allowed-tools`의 `Bash` 활용 — 추가 권한 불필요). 설치는 기계적 작업이므로 *기본은 진행*이다.
  - 병렬 builder 가 *동일 패키지 매니저 lock 파일*(예: `pnpm-lock.yaml`)을 동시에 건드리면 write-conflict 가 날 수 있다. 동일 lock 을 만지는 설치 line item 이 여러 slice 에 걸치면 메인 foreman 이 그 설치를 *한 slice 로 모으거나 순차* 로 돌린다 (분할 step 4 의 의존 규칙과 동일 — lock 파일도 "겹치는 파일"로 본다).
```

**현재 (before):**

```
connected-MCP 사용 line item 처리 (ADR-048#d4):
- task `## 3. 구현 항목`에 `<capability> 작업 시 <mcp-name> MCP 사용` line item(plan이 박음)이 있으면, 그 MCP 도구로 해당 작업을 수행한다(예: DB 스키마 introspection MCP로 실제 스키마 확인 후 구현).
```

**변경 (after):**

```
connected-MCP 사용 line item 처리 (각 builder 가 자기 slice 에서 — ADR-048#d4):
- 그 slice 의 step 에 `<capability> 작업 시 <mcp-name> MCP 사용` line item(plan이 박음)이 있으면, 그 MCP 도구로 해당 작업을 수행한다(예: DB 스키마 introspection MCP로 실제 스키마 확인 후 구현).
```

근거: gate 정책은 ADR 그대로 보존하되 slice 단위로 실행되며, `Needs Research`/`Needs Install`/`Needs MCP Access`는 foreman에 보고되어 *해당 slice만* 보류된다. lock 파일 동시 write는 partition 규칙에 흡수한다.

#### 1-6. 최종 출력 직전 — 메인 foreman의 minimal `validate --changed` sanity step 추가

전체 validation(validate-workitem 책임)이 아니라, 병렬 머지 후 깨지지 않았는지 보는 *가벼운* sanity step만 추가한다. `## 6-2. TDD opt-out` opt-out 흐름 직후, 최종 출력 블록 바로 앞에 삽입한다.

**현재 (before):**

```
마지막 출력:
- 수정 파일 목록
- AC별 진행 상태 (완료/미완료, 예: `AC-1 ✅, AC-2 ✅, AC-3 ❌(다음 호출)`)
- 핵심 변경 사항
- 단순성 self-check 결과 (남은 정리 항목 N건, 있으면 명시)
- 남은 리스크
- 다음 추천 단계 (보통 `/validate-workitem <task-id>`)
```

**변경 (after):**

```
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
```

근거: locked 지침의 "minimal final `validate --changed` sanity step (NOT full validation)". `--changed` 컨벤션은 finalize-workitem step 2(ADR-020)와 동일 형태를 따른다. 전체 검증은 validate-workitem이 그대로 소유한다.

### 2. `.claude/agents/builder.md`

builder는 이제 *slice-scoped laborer*로 동작한다 — 단일-에이전트 페르소나는 그대로고, foreman이 넘긴 좁은 slice(일부 `## 3` step + AC subset + 관련 파일)만 본다는 점만 명시한다. 최소 워딩만 추가한다.

**현재 (before):**

```
너는 구현 전담 에이전트다.

역할:
- task 단위 구현을 수행한다.
- 관련 테스트를 추가하거나 보강한다.
- 범위가 명확한 국소 리팩토링을 수행한다.
- 관련 workitem 문서 범위 안에서만 변경한다.

반드시 먼저 읽을 것:
- 관련 task 문서
- 관련 feature 문서
- 필요 시 architecture 문서
```

**변경 (after):**

```
너는 구현 전담 에이전트다. `/implement-workitem` foreman 이 너를 띄울 때는 task 전체가 아니라 *하나의 slice*(일부 `## 3` step + 그 step 이 만족시킬 AC subset + 건드릴 파일 집합)만 받는다. 페르소나·규율은 동일하고 *범위만 그 slice 로 좁다* — 받은 slice 밖 파일/AC 는 건드리지 않는다.

역할:
- 위임받은 slice(task 단위 또는 그 일부) 구현을 수행한다.
- 관련 테스트를 추가하거나 보강한다.
- 범위가 명확한 국소 리팩토링을 수행한다.
- 관련 workitem 문서 범위(받은 slice) 안에서만 변경한다.

반드시 먼저 읽을 것:
- foreman 이 전달한 slice 명세(담당 `## 3` step·AC subset·파일 집합). slice 명세가 곧 너의 범위다 — task 전문을 다시 fork-load 하지 않는다 (ADR-019).
- 필요 시, slice 명세가 가리키는 feature/architecture sub-section 만.
```

근거: builder의 페르소나·self-check·출력 계약은 그대로 두고(라인 36 이하 변경 없음), 스코프가 slice로 좁아졌다는 점과 task 전문 재로드 금지(ADR-019)만 명시. `finalize 위임을 받았을 때의 가드` 단락은 finalize-workitem(여전히 fork)이 소유하므로 변경하지 않는다.

> 참고: builder.md의 `## 4-1. 변경 예정 파일/경로` 갱신 문구(라인 65)는 *single-builder/finalize 위임* 경로에서 여전히 builder가 자기 변경 파일을 보고하는 동작과 호환된다(foreman이 병렬 시 병합). 본 stage에서는 builder.md의 해당 라인을 *변경하지 않는다* — 병합 단일-writer 규칙은 SKILL.md(1-4)에 둔다.

---

**커밋:**
- `feat(implement-workitem): make main session a foreman that fans out parallel file-disjoint builders`
- `refactor(builder): scope persona to a single foreman-assigned slice`

## Stage 2B — validate-workitem: 단일 inline 판정 → 병렬 validator 팬아웃

이 변경은 `validate-workitem`을 메인 세션이 **감사 축(audit AXIS)별로 scoped validator를 한 turn에 다중 호출(DELEGATION 병렬 패턴 #1)** 하고, 각 validator가 *report를 쓰지 않고* partial verdict(findings + 해당 축의 evidence)만 반환하면, **메인이 partial을 집계해 단일 report를 쓰는** 구조로 전환한다. `validator.md`의 계약도 "report 전체를 쓰는 전담"에서 "scoped 축 sub-task를 받아 partial verdict를 반환"으로 바꾼다.

> 이 변경은 ADR-050 D1("validate-workitem을 메인 세션 인라인 실행")을 **부분적으로 되돌린다**: 무거운 다축 감사는 다시 sub-agent로 팬아웃한다. 단, ADR-050 D1의 핵심(`context: fork` 제거 → 메인 세션이 orchestration·report 작성·confidence 재계산을 직접 수행)은 유지하므로 **완전 reversal이 아닌 hybrid**다. 근거 ADR는 Stage 6에서 신규 작성하는 **ADR-051**(아직 없음 — Stage 6에서 `## 결정`에 D1-partial-reversal 명시 + ADR-050 `## 결과`에 `amend` 추가)에 박는다. 이 Stage 2B 가이드의 모든 `ADR-051` 인용은 Stage 6 완료 후 유효해진다.

---

### 1. `.claude/skills/validate-workitem/SKILL.md` — frontmatter: `allowed-tools`에 `Agent` 추가

**현재 (before):**
```
allowed-tools: Read Glob Grep Write Bash(pnpm validate) Bash(pnpm validate *) Bash(npm run validate) Bash(npm run validate *) Bash(make validate) Bash(make validate *) Bash(task validate) Bash(task validate *) Bash(git diff *) Bash(git log *) Bash(git status *)
```

**변경 (after):**
```
allowed-tools: Read Glob Grep Write Agent Bash(pnpm validate) Bash(pnpm validate *) Bash(npm run validate) Bash(npm run validate *) Bash(make validate) Bash(make validate *) Bash(task validate) Bash(task validate *) Bash(git diff *) Bash(git log *) Bash(git status *)
```

근거: 메인 세션이 `Agent` 도구로 축별 validator를 팬아웃하려면 allowed-tools에 `Agent`가 있어야 한다(bootstrap-project/stabilize-milestone 선례와 동일한 공백-구분 `Agent` 토큰).

---

### 2. `.claude/skills/validate-workitem/SKILL.md` — 도입부: report-only 선언에 orchestration 책임 추가

**현재 (before):**
```
이 skill은 **판정 + report 기록 전용**이다. status 변경, 코드 수정, 커밋은 하지 않는다.

너의 역할은 지정된 workitem 구현 결과를 검증하고 표준 양식의 report를 기록하는 것이다.
```

**변경 (after):**
```
이 skill은 **판정 + report 기록 전용**이다. status 변경, 코드 수정, 커밋은 하지 않는다.

너의 역할은 지정된 workitem 구현 결과를 검증하고 표준 양식의 report를 기록하는 것이다.
큰 diff에서는 **메인 세션이 감사 축(audit AXIS)별 validator를 병렬 팬아웃**하고(아래 0단계),
각 validator가 반환한 **partial verdict**(findings + 그 축의 evidence)를 *메인이 집계해
단일 report 1개를 작성*한다. **report 작성과 confidence 산정은 집계자(메인 세션) 책임이다 —
validator는 report 파일을 쓰지 않는다**(clobber 방지: report 경로는 `<task-id>.md` 단일 파일).
```

근거: report-only 책임은 유지하되, "누가 report를 쓰는가"를 메인 세션(집계자)으로 고정해 N개 validator가 같은 파일을 덮어쓰는 clobber를 차단한다.

---

### 3. `.claude/skills/validate-workitem/SKILL.md` — "반드시 먼저 할 일"에 0단계(orchestration) 삽입

**현재 (before):**
```
반드시 먼저 할 일:
1. 통합 검증 명령(`pnpm validate` / `npm run validate` / `make validate` / `task validate` 중 하나)이 있으면 실행하고 stdout/stderr를 수집한다.
```

**변경 (after):**
```
반드시 먼저 할 일:
0. **감사 축 분할 + 병렬 validator 팬아웃 (orchestration)** — diff 규모로 분기한다.
   - **diff가 작으면 (cost guard)**: 팬아웃하지 않고 메인 세션이 직접 단일 inline validator로 1~5단계를 그대로 수행한다(아래 fallback 기준).
   - **diff가 크면**: 메인 세션이 아래 **감사 축**을 독립 sub-task로 분할하고, [DELEGATION 병렬 패턴 #1](../../../docs/00-meta/DELEGATION_STRATEGY.md#병렬-패턴-3종)(한 turn에 `validator` sub-agent 다중 호출)로 *한 turn에* 팬아웃한다. 각 validator는 **자기 축 하나만** scoped로 받고 **partial verdict만 반환**한다(report 작성 금지).
     - 축 목록 (1축 = 1 validator sub-task):
       1. AC ↔ 테스트 매핑 (+ 테스트 선행 휴리스틱 + `[verify-placeholder]` / `[test-id-missing]`)
       2. 범위 밖 변경 + diff trace audit (ADR-006#amend-1)
       3. FAC → AC spec coverage audit (ADR-037)
       4. Arch-iface 7-1/7-2/7-3/7-4 audit (API/CLI/백엔드/프론트)
       5. UI Design inventory audit (ADR-027#amend-1) — UI 프로젝트에 한해 spawn
       6. MCP 사용 audit (ADR-048#d5)
       7. Evidence Bundle 축(통합 명령 실행 결과 + oracle gap surface 점검)
     - **신호 기반 조건부 spawn (cost guard 확장)**: 축 3(FAC spec)·4(Arch-iface)·5(UI)·6(MCP)는 *해당 신호가 있을 때만* spawn한다 — 3 = task가 feature에 연결(`## 7 Feature` 링크), 4 = API/CLI/백엔드/프론트 신호(7-x 키워드·path), 5 = UI 프로젝트(ADR-027#amend-3), 6 = task `## 3`에 MCP 사용 line item. 신호 없는 축은 spawn하지 않고 메인이 "해당없음"으로 인라인 기록한다(중간 크기 task의 과다 팬아웃 방지). 축 1(AC↔테스트)·2(diff-trace)·7(Evidence Bundle)은 항상 해당.
     - **통합 검증 명령(1단계)은 메인 세션이 1회만 실행**하고 그 결과(exit code + stdout/stderr 요약)를 7번 축 validator와 집계에 공유한다 — N개 validator가 `pnpm validate`를 중복 실행하지 않는다.
     - **small-diff fallback 기준** (cost guard): `git diff --stat`의 변경 파일 ≤ 2 *또는* 변경 줄 합계 ≤ 50, *그리고* UI/Arch-iface/MCP/spec-coverage 중 둘 이상이 명백히 해당없음이면 팬아웃을 건너뛰고 단일 inline validator로 수행한다(휴리스틱 — 경계값은 메인 세션 판단).
     - **Codex: 병렬 위임 미지원 시 순차 단일 실행으로 degrade** — Codex는 sub-agent 병렬 파리티가 없으므로(ADR-010 매핑) 위 축을 순차로 단일 실행해 같은 partial들을 모은 뒤 동일하게 메인이 집계·작성한다.
1. 통합 검증 명령(`pnpm validate` / `npm run validate` / `make validate` / `task validate` 중 하나)이 있으면 실행하고 stdout/stderr를 수집한다.
```

근거: 팬아웃은 새 0단계로 두고 기존 1~5단계는 (a) 메인 inline 경로 (b) 각 validator의 scoped 축 본문으로 그대로 재사용한다 — 검증 기준 본문을 복제하지 않는다.

---

### 4. `.claude/skills/validate-workitem/SKILL.md` — report 작성 단계: "내가 쓴다" → "partial을 집계해 메인이 쓴다"

**현재 (before):**
```
마지막 단계 — report 파일 작성:
판정 결과를 다음 양식으로 `docs/40-validation/reports/<task-id>.md`에 기록한다(이미 있으면 덮어쓴다).
```

**변경 (after):**
```
마지막 단계 — partial 집계 + report 파일 작성 (집계자=메인 세션 단독):
0단계에서 팬아웃했으면 각 validator가 반환한 partial verdict(축별 findings + 그 축의 evidence)를
*메인 세션이* 모아 아래 양식의 report 1개를 `docs/40-validation/reports/<task-id>.md`에 기록한다(이미 있으면 덮어쓴다).
validator는 이 파일을 쓰지 않는다(clobber 방지). inline fallback이면 메인 세션이 자기 판정을 그대로 기록한다.

집계 규칙 (combined verdict):
- **Needs Fix 트리거**: 어느 한 축이라도 P0 finding이 있거나, AC↔테스트 매핑에 ❌ AC가 하나라도 있으면 → **Needs Fix**. 그 외 P1/P2만 있으면 Pass(라벨은 report에 전수 기록).
- 각 축의 partial findings(P0/P1/P2)·`[verify-placeholder]`·`[test-id-missing]`·`Spec Gap`·`[Design-inventory*]`·`[MCP-*]`·`[Arch-iface-7-N]`를 누락 없이 해당 report 섹션에 전수 합친다(ADR-046#d3 — cap 때문에 finding 누락 금지).
- **confidence는 메인 세션이 *집계 후* 재계산**한다(개별 validator의 신뢰도 추정을 그대로 신뢰하지 않는다). 아래 confidence ladder의 입력(통합 명령 통과 여부 / AC↔테스트 매핑 % / diff trace 통과 / oracle gap 카테고리 명시 여부)을 *집계된 전체*에서 평가해 Low→Medium→High 첫 매치로 확정한다.
```

근거: 보고 양식·Evidence Bundle·confidence ladder 블록(아래 ```` ```markdown ```` 양식 전체와 그 뒤 confidence 기준 주석)은 **변경 없이 그대로 둔다** — 계산 주체만 "validator 개별" → "메인 집계자"로 옮긴다.

---

### 5. `.claude/agents/validator.md` — 계약 전환: "report 전부 작성" → "scoped 축 partial verdict 반환"

#### 5a. 도입부 — report 작성 책임 제거

**현재 (before):**
```
이 에이전트는 **판정 + report 기록 전용**이다. 코드 수정, status 변경, 커밋은 직접 수행하지 않는다.

역할:
- 구현 결과가 관련 workitem 문서와 일치하는지 검증한다.
- 범위 밖 변경이 있었는지 확인한다.
- 문서와 코드의 불일치를 찾는다.
- obvious regression risk와 빠진 검증 포인트를 찾는다.
```

**변경 (after):**
```
이 에이전트는 **scoped 감사 축(audit AXIS) 하나를 받아 partial verdict를 반환하는 전용**이다. 코드 수정, status 변경, 커밋, **report 파일 작성**은 직접 수행하지 않는다.

호출 계약:
- 호출 측(validate-workitem 메인 세션)이 **감사 축 하나**를 scoped sub-task로 지정한다(예: "AC↔테스트 매핑만", "diff trace audit만", "Arch-iface 7-x만"). 너는 *그 축만* 검증한다.
- **partial verdict만 반환**한다: 그 축의 findings(P0/P1/P2 라벨 + 관련 파일:라인) + 그 축의 evidence(검증된 것 / oracle gap). **`docs/40-validation/reports/<task-id>.md`를 쓰지 않는다** — 단일 report는 메인 세션이 모든 축의 partial을 집계해 작성한다(clobber 방지).
- 그 축에서 P0를 발견했거나 (AC 축이면) ❌ AC가 있으면 partial에 명시한다 — combined Pass/Needs Fix 판정은 메인 집계자가 내린다.

역할 (지정된 축 한정):
- 구현 결과가 관련 workitem 문서와 일치하는지 검증한다.
- 범위 밖 변경이 있었는지 확인한다.
- 문서와 코드의 불일치를 찾는다.
- obvious regression risk와 빠진 검증 포인트를 찾는다.
```

#### 5b. 출력 형식 — "report 파일 경로 + 전체 next-action" → "partial verdict"

**현재 (before):**
```
출력 형식:
- Pass / Needs Fix
- 문서-구현 불일치
- 범위 밖 변경 여부
- 빠진 테스트/검증 포인트
- 수정이 필요한 항목 최대 5개
- report 파일 경로 (`docs/40-validation/reports/<task-id>.md`)
- Evidence Bundle: 검증된 것 / oracle gap (검증하지 못한 것) / 신뢰도 (High|Medium|Low)
- 다음 권장 액션 (Pass면 `/finalize-workitem`, Needs Fix면 `/repair-workitem` — 텍스트 제안임을 명시)
```

**변경 (after):**
```
출력 형식 (partial verdict — 지정된 축 한정, report 파일이 아니라 메인 세션에 텍스트 반환):
- 축 이름 (어떤 audit AXIS를 봤는지)
- 그 축의 partial 판정: 이 축이 Needs Fix를 트리거하는가 (P0 발견 / ❌ AC) — combined 최종 판정은 메인 집계자 책임
- 문서-구현 불일치 / 범위 밖 변경 / 빠진 테스트·검증 포인트 (그 축 범위 내)
- findings 전수 (P0/P1/P2 라벨 + 관련 파일:라인) — 개수 cap 없음
- 그 축의 Evidence partial: 검증된 것 / oracle gap (검증하지 못한 것)
- **report 파일을 쓰지 않는다** (메인 집계자가 모든 축 partial을 모아 단일 report 작성 + confidence 재계산 + 다음 액션 발화)
```

근거: 다음 권장 액션(`/finalize` · `/repair`)과 confidence 등급 확정은 개별 축이 아니라 *집계 후 전체*에서만 결정 가능하므로 validator 출력에서 제거하고 메인 집계자로 이관한다.

#### 5c. 규칙 — report 작성 규칙 제거, partial 반환 + cap 금지 보존

**현재 (before):**
```
- 판정 결과를 표준 양식으로 `docs/40-validation/reports/<task-id>.md`에 기록한다(파일은 task-id 단위로 덮어쓴다 — 가장 최근 1회만 남긴다).
- 구현이나 status 갱신, 커밋을 직접 수행하지 않는다.
```

**변경 (after):**
```
- **report 파일을 쓰지 않는다** — 지정된 축의 partial verdict를 메인 세션에 텍스트로 반환한다. 단일 `docs/40-validation/reports/<task-id>.md`는 메인 집계자가 모든 축 partial을 모아 1회 작성한다(N개 validator가 같은 파일을 덮어쓰는 clobber 방지).
- 구현이나 status 갱신, 커밋을 직접 수행하지 않는다.
```

#### 5d. 출력 계약 — ADR-046#d3 no-cap-drop 보존 (변경 없음 확인)

`## 출력 계약 (ADR-046)` 블록은 **변경하지 않는다.** report-only 위임의 finding 전수 반환 규칙(ADR-046#d3)이 그대로 partial verdict 반환에 적용된다 — partial은 *호출 측이 문서(report)에 적재하는 산출물*이므로 "분량 목표는 서술에만, finding·P0/P1/P2·AC 식별자 상태·경로·에러 문자열은 cap 때문에 누락 금지"가 그대로 유효하다. 56~58줄(`단, 본 agent의 반환 자체가 호출 측이 문서에 적재하는 산출물인 경우 …` 및 `압축 금지(정확히 보존): …`)을 손대지 않는다.

---

**커밋:**
```
feat(validate-workitem): fan out parallel per-axis validators; main aggregates partials into single report
refactor(validator): return scoped per-axis partial verdict instead of writing the report
```

## Stage 2C — researcher 자동 활용

> 의존: 본 단계의 implement-workitem foreman 편집은 **Stage 2A**(implement foreman 도입)가 먼저 적용돼 있다고 가정한다. Stage 2A가 아직 적용되지 않았다면 본 단계의 implement-workitem 항목은 Stage 2A 적용 이후로 미룬다. (ADR-040 Amendment 2는 Stage 6에서 기록 — 아래 "ADR 기록" 참조.)

핵심 목표 (locked, minimal high-leverage):
1. **builder.md** — plan이 미리 line item을 박지 않은 경우에도, builder가 외부 lib/service의 최신 사용법/API/버전에 확신이 없고 *그 불확실성이 구현을 바꿀* 때는 stale-API로 추측하지 말고 `Needs Research: <대상>`를 메인에 emit하고 멈추는 일반화된 soft 규칙을 추가한다 (builder는 웹 접근 없음).
2. **메인 세션 오케스트레이터** (Stage 2A의 implement foreman, stack-guard, plan-milestone) — `Needs Research`를 받으면 researcher agent에 **Agent로 위임**하고 findings를 주입한 뒤 재개한다. `/research-pack` 호출이 아니라 "Agent로 researcher 위임"으로 표현한다 (research-pack은 disable-model-invocation).
3. **DELEGATION_STRATEGY.md** researcher row에 standing trigger를 추가한다.

본 단계는 surgical 유지가 핵심 — over-trigger(불확실하지 않은데 멈춤)를 피하기 위해 "확신 없음 AND 구현을 바꿈" 두 조건을 모두 건다.

---

### 파일 1: `.claude/agents/builder.md`

builder persona에 일반화된 soft Needs-Research 규칙을 추가한다. 현재 builder.md에는 이 규칙이 전혀 없고 (`Needs Research` 처리는 implement-workitem SKILL.md L77(docs-check)·L83(설치 후 API-use gate)에 plan-line-item 조건부로 존재), persona 자체에는 standing 규율이 없다. persona에 두면 builder가 어떤 경로로 fork되든(implement-workitem / repair-workitem / 직접 fork) 동일하게 적용된다.

**현재 (before):**

```
- **AC ambiguity 하드스탑 (ADR-006#amend-2)**: task `## 8. 메모`에 `해석 확정:` 기록이 있으면 그 해석을 기계적으로 따른다. 기록이 없고 *2+ 해석이 구현을 실질적으로 다르게 만들면*(사소한 표현 차이는 제외) *자기 해석을 고르지 말고* `Needs Plan Decision`으로 종료 + plan 재실행 안내. implement는 집행 전용 — 해석 결정은 plan 책임.
```

**변경 (after):**

```
- **AC ambiguity 하드스탑 (ADR-006#amend-2)**: task `## 8. 메모`에 `해석 확정:` 기록이 있으면 그 해석을 기계적으로 따른다. 기록이 없고 *2+ 해석이 구현을 실질적으로 다르게 만들면*(사소한 표현 차이는 제외) *자기 해석을 고르지 말고* `Needs Plan Decision`으로 종료 + plan 재실행 안내. implement는 집행 전용 — 해석 결정은 plan 책임.
- **외부 lib/service Needs-Research soft 게이트 (ADR-040#amend-2)**: 구현 중 외부 라이브러리·API·서비스의 *최신 사용법/시그니처/버전*에 확신이 없고 **그 불확실성이 구현을 실질적으로 바꿀 때만**, stale-API로 추측해 코드를 쓰지 말고 `Needs Research: <대상> — <무엇이 불확실한지 1줄>`를 메인에 emit하고 해당 부분 구현을 멈춘다. builder는 웹 접근이 없어 *직접 조사하지 않는다* — 메인이 researcher 위임으로 findings를 회수해 재개한다. plan이 `구현 전 최신 공식문서 확인` line item을 이미 박았는지와 무관하게 적용되는 standing 규율. *과발동 금지*: 확신이 있거나(이미 아는 안정 API) 불확실성이 구현 결과를 바꾸지 않으면 멈추지 말고 진행한다. 그 외부 의존이 필요 없는 다른 AC 구현은 emit 후에도 계속한다.
```

근거: persona-level standing 규율이라 plan이 line item을 빠뜨린 경우에도 stale-API 추측을 막는다. 두 조건(확신 없음 AND 구현을 바꿈)을 명시해 over-trigger를 차단한다. implement-workitem SKILL.md L77/L83의 line-item 기반 hardstop과 중복이 아니라 *상위 일반화* — SKILL.md는 plan이 명시한 경우, persona는 plan이 놓친 경우를 덮는다.

---

### 파일 2: `.claude/skills/implement-workitem/SKILL.md`

Stage 2A가 도입하는 implement foreman flow에, foreman이 `Needs Research`를 받으면 researcher에 자동 위임한다는 one-line 노트를 추가한다. 현재 L77은 builder가 `Needs Research`를 emit하는 쪽만 기술하고 *메인/foreman이 그것을 받아 무엇을 하는지*는 `/research-pack 실행 후 재개 권장`이라는 수동 안내뿐이다. foreman이 model-invocable로 자동 위임하도록 바꾼다.

**현재 (before):**

```
외부 docs-check line item 처리 (ADR-040):
- task `## 3. 구현 항목`에 `구현 전 최신 공식문서 확인` line item(plan이 박음)이 있고, 그 외부 라이브러리·API의 *최신 사용법 확신*이 없으면 **구현을 시작하지 않고** 출력에 `Needs Research: <대상> — /research-pack <대상> 실행 후 재개 권장`을 명시한다. builder는 웹 접근이 없어 *직접 웹서핑하지 않는다*. 이미 확신이 있으면 line item을 체크하고 진행한다.
```

**변경 (after):**

```
외부 docs-check line item 처리 (ADR-040):
- task `## 3. 구현 항목`에 `구현 전 최신 공식문서 확인` line item(plan이 박음)이 있고, 그 외부 라이브러리·API의 *최신 사용법 확신*이 없으면 **구현을 시작하지 않고** 출력에 `Needs Research: <대상> — <무엇이 불확실한지 1줄>`을 명시한다. builder는 웹 접근이 없어 *직접 웹서핑하지 않는다*. 이미 확신이 있으면 line item을 체크하고 진행한다.
- **foreman 자동 재개 (ADR-040#amend-2)**: implement foreman(Stage 2A)은 builder가 `Needs Research`로 멈추면 *수동 `/research-pack` 안내에 그치지 않고* researcher agent에 **Agent로 직접 위임**(`/research-pack` 호출 아님 — research-pack은 disable-model-invocation)하여 findings를 회수하고, 그 결론을 builder 재호출 프롬프트에 주입해 구현을 재개한다. Codex: 병렬 위임 미지원 시 순차 단일 실행으로 degrade(foreman이 직접 researcher 본문을 순차 호출하거나, 사전 `/research-pack` 노트를 참조).
```

근거: `Agent로 researcher 위임`으로 명시(research-pack 호출이 아님). foreman은 Stage 2A에서 model-invocable로 도입되므로 자동 재개가 가능하다. Codex degrade 노트는 sub-agent 병렬 parity 부재(ADR-010) 때문에 필수.

---

### 파일 3: `docs/00-meta/DELEGATION_STRATEGY.md`

L39의 researcher row(위임 트리거 표)에 standing autonomous-trigger 절을 추가한다. 현재는 `/research-pack 또는 메인이 Agent 위임`까지만 있고 *언제 메인이 자동으로 위임하는지* trigger 조건이 없다.

**현재 (before):**

```
| 외부 공식문서·1차 자료·논문 조사 (구현/기획) | researcher | report-only(코드·문서 미수정). 결과는 insights/ 노트 + DISCOVERY Evidence Log 연결. `/research-pack` 또는 메인이 Agent 위임 (ADR-040). |
```

**변경 (after):**

```
| 외부 공식문서·1차 자료·논문 조사 (구현/기획) | researcher | report-only(코드·문서 미수정). 결과는 insights/ 노트 + DISCOVERY Evidence Log 연결. `/research-pack` 또는 메인이 Agent 위임. **Standing auto-trigger (ADR-040#amend-2)**: 메인 세션 오케스트레이터(implement foreman / stack-guard / plan-milestone)는 sub-agent가 `Needs Research`를 emit하면 researcher에 **Agent로 자동 위임**→findings 주입→재개한다(`/research-pack` 호출 아님 — disable-model-invocation). Codex: 병렬 위임 미지원 시 순차 단일 실행으로 degrade. |
```

근거: trigger 표의 standing 조건이 명시돼야 메인이 "언제 자동 위임하는가"를 안다. `Agent로 자동 위임`/`/research-pack 호출 아님`을 박아 disable-model-invocation 제약과 정합. Codex degrade 노트 포함.

---

### ADR 기록 (Stage 6에서 수행 — 본 단계는 포인터만)

위 3개 변경의 정책 근거는 **ADR-040 Amendment 2**로 기록한다. ADR-040 본문(`docs/90-decisions/boilerplate/ADR-040-external-research-capability.md`)에 Amendment 1(L33~45) 다음에 아래 블록을 추가하는 작업은 **Stage 6 (ADR 기록 단계)**에서 일괄 수행한다. 본 Stage 2C 코드/문서 변경은 `(ADR-040#amend-2)` anchor를 *선참조*하며, 해당 anchor는 Stage 6에서 생성된다.

Stage 6에서 추가할 블록(참고용 — 본 단계에서는 추가하지 않음):

```
<a id="adr-040-amend-2"></a>
## Amendment 2 (2026-06-25) — Needs-Research soft 게이트(builder) + 메인 오케스트레이터 자동 위임
### 결정
1. builder persona에 standing soft 게이트 추가 — 외부 lib/service의 최신 사용법/API/버전 확신이 없고 *그 불확실성이 구현을 바꿀 때만* `Needs Research: <대상>`을 emit하고 멈춘다(plan line item 유무 무관). 과발동 금지: 안정 API이거나 구현을 바꾸지 않으면 진행.
2. 메인 세션 오케스트레이터(implement foreman / stack-guard / plan-milestone)는 `Needs Research`를 받으면 researcher에 **Agent로 자동 위임**→findings 주입→재개한다. `/research-pack` 호출이 아님(research-pack은 disable-model-invocation). Codex는 병렬 위임 미지원 시 순차 단일 실행으로 degrade.
### 강도 (ADR-022)
- builder soft 게이트: constraint(약) — stale-API 추측만 막고 진행은 막지 않음. 오케스트레이터 자동 위임: enabling(약).
### 적용 surface
- .claude/agents/builder.md                   — Needs-Research soft 게이트(persona standing 규율)
- .claude/skills/implement-workitem/SKILL.md   — foreman 자동 재개 노트
- docs/00-meta/DELEGATION_STRATEGY.md          — researcher row standing auto-trigger
```

---

**커밋:** `feat(researcher): auto-delegate on Needs Research and add builder soft research gate`

(Stage 6의 ADR-040 Amendment 2 기록은 별도 커밋: `docs(adr): record ADR-040 amendment 2 for autonomous researcher delegation`)

---

> 구현자 주의 (정확성): (1) 본 Stage는 builder.md + implement-workitem SKILL.md *docs-check 블록(L77)* + ADR-040(researcher 위임 경로)에서 수동 `/research-pack` 안내를 *foreman 자동 위임*으로 대체한다(의도된 변경 — before의 `... /research-pack <대상> 실행 후 재개 권장`에서 수동 안내 제거). **implement-workitem SKILL.md L83(설치 후 API-use gate)의 `Needs Research: <pkg> — /research-pack <pkg> 실행 후 재개`는 본 Stage에서 건드리지 않는다** — 그 줄은 *의존성 설치 line item(ADR-040#amend-1)* 맥락의 부기라 유지하므로 SKILL.md 안에 두 형태가 공존한다(무해 — foreman 자동 위임은 *어느 형태의* Needs Research를 받든 동일하게 작동). 따라서 "전면 통일"이 아니라 *docs-check 경로 한정 대체*다. (2) `.agents` 미러는 편집 불필요 — 본 단계는 skill BODY 편집(implement-workitem)과 agent persona/문서 편집만 하고 NEW/REMOVED skill이 없다 (ADR-010 thin-wrapper). (3) stack-guard / plan-milestone 본문 자체에도 동일 auto-trigger 노트가 필요하면 그 작업은 각 skill을 다루는 Stage에 귀속 — 본 Stage 2C는 DELEGATION_STRATEGY 표에 standing trigger를 박는 것으로 세 오케스트레이터를 공통 커버한다.

## Stage 3 — 조건부 재독 (메인 세션 컨텍스트 재사용)

### 배경 / 적용 조건

`/implement-workitem → /validate-workitem → /repair-workitem`가 **메인 세션에서 연쇄 실행**될 때(ADR-050), 직전 단계가 이미 읽어 메인 컨텍스트에 올려둔 task 문서·diff를 다음 단계가 **무조건 다시 읽도록** 강제하는 현재 문구는 ADR-019 minimal-sufficiency 원칙과 충돌한다. 이 Stage는 그런 강제 재독을 **조건부**("메인 컨텍스트에 이미 있으면 생략, 없거나 갱신됐으면 읽는다")로 바꾼다.

단, 다음 4가지는 **무조건 유지**한다 (조건부로 바꾸지 않는다):
1. `validate`는 통합 검증 명령을 **항상 재실행**한다 — 코드 상태가 implement 단계 이후 바뀌었으므로 직전 실행 결과를 재사용하면 안 된다.
2. report 파일은 매 phase **새로 생성/덮어쓰기**되므로 항상 새로 다룬다 (캐시 대상 아님).
3. `repair`는 직전 라운드가 `## 8. 메모`를 변경(append)했을 수 있으므로, **이전 repair 라운드가 메모를 mutate한 경우 반드시 재독**한다.
4. `finalize-workitem`은 `context: fork`라 메인 컨텍스트를 상속하지 못한다 — finalize의 읽기 지시는 **그대로 둔다** (이 Stage에서 건드리지 않는다).

> 이 Stage는 skill BODY만 수정한다. `.agents/skills/*/SKILL.md`는 `.claude` 본문을 가리키는 thin pointer이므로 (ADR-010) **`.agents` 미러 편집은 불필요**하다.

---

### 1. `.claude/skills/validate-workitem/SKILL.md`

**현재 (before):**
```
반드시 먼저 할 일:
1. 통합 검증 명령(`pnpm validate` / `npm run validate` / `make validate` / `task validate` 중 하나)이 있으면 실행하고 stdout/stderr를 수집한다.
   - **명령이 없을 때 (ADR-007#amend-3)**: `docs/00-meta/STACK_SETUP_PLAN.md`가 *존재*하면(스택 확정) skip하지 않고 **`Needs Stack Guard`로 종료** + `/stack-guard` 실행 안내. STACK_SETUP_PLAN.md가 *없으면*(스택 미정) 기존대로 이 단계 skip하고 정적 판정만 한다.
   - 다른 빌더(`bun validate`, `mise run validate`, `just validate` 등)를 쓰는 스택은 본 skill의 `allowed-tools`에 해당 패턴(`Bash(bun validate)` 등)을 추가해야 자동 실행된다.
2. 관련 workitem 문서를 읽는다.
3. 필요한 상위 문서를 읽는다.
4. 최근 변경 파일 또는 diff를 기준으로 구현 결과를 본다.
```

**변경 (after):**
```
반드시 먼저 할 일:
1. 통합 검증 명령(`pnpm validate` / `npm run validate` / `make validate` / `task validate` 중 하나)이 있으면 **항상 실행**하고 stdout/stderr를 수집한다 (메인 세션 연쇄 실행이라도 implement 이후 코드 상태가 바뀌었으므로 직전 결과를 재사용하지 않는다).
   - **명령이 없을 때 (ADR-007#amend-3)**: `docs/00-meta/STACK_SETUP_PLAN.md`가 *존재*하면(스택 확정) skip하지 않고 **`Needs Stack Guard`로 종료** + `/stack-guard` 실행 안내. STACK_SETUP_PLAN.md가 *없으면*(스택 미정) 기존대로 이 단계 skip하고 정적 판정만 한다.
   - 다른 빌더(`bun validate`, `mise run validate`, `just validate` 등)를 쓰는 스택은 본 skill의 `allowed-tools`에 해당 패턴(`Bash(bun validate)` 등)을 추가해야 자동 실행된다.
2. 관련 workitem 문서를 읽는다 — **메인 세션 연쇄 실행으로 직전 단계가 이미 같은 task 문서를 메인 컨텍스트에 올렸고 그 뒤 문서가 갱신되지 않았으면 재독을 생략**하고, 없거나 갱신됐으면 읽는다 (ADR-019 minimal sufficiency).
3. 필요한 상위 문서를 읽는다 (사전 fork-load 금지 — task 본문에서 발화 시 인용).
4. 최근 변경 파일 또는 diff를 기준으로 구현 결과를 본다 — **직전 단계 이후 코드/diff가 바뀌었으므로 diff는 항상 새로 확인**한다.
```

근거: (1)·(4)는 코드 상태 변동 때문에 무조건 fresh load 유지, (2)만 조건부 재독으로 전환.

**현재 (before):**
```
## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 ADR/architecture 섹션은 task 본문에서 발화 시 인용 — 사전 fork-load 금지.
```

**변경 (after):**
```
## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 ADR/architecture 섹션은 task 본문에서 발화 시 인용 — 사전 fork-load 금지.
메인 세션 연쇄 실행(implement→validate→repair, ADR-050) 시 직전 단계가 메인 컨텍스트에 올린 task 문서는 *갱신되지 않았으면 재독 생략*. 단 통합 검증 명령 재실행·diff 재확인·report 신규 작성은 항상 수행(코드 상태/산출물이 매 phase 변한다).
```

---

### 2. `.claude/skills/repair-workitem/SKILL.md`

**현재 (before):**
```
반드시 먼저 할 일:
1. 관련 task 문서를 읽는다 (`## 6 AC`, `## 8 메모`의 기존 `해석 확정`/repair 결정 이력 포함).
2. `docs/40-validation/reports/<task-id>.md`를 읽는다.
   - 파일이 없거나 stale(파일 mtime이 task 문서/구현 파일보다 오래됨)하면 `/validate-workitem` 선행을 안내하고 종료한다.
   - 파일이 `Pass`이면 `/finalize-workitem`을 안내하고 종료한다(repair 대상 없음).
3. 사용자가 인자로 부분 지정을 줬으면 그 부분만 대상으로 한다.
4. 실패 항목을 우선순위(P0 > P1 > P2)로 정렬한다.
```

**변경 (after):**
```
반드시 먼저 할 일:
1. 관련 task 문서를 읽는다 (`## 6 AC`, `## 8 메모`의 기존 `해석 확정`/repair 결정 이력 포함).
   - **메인 세션 연쇄 실행으로 직전 단계가 같은 task 문서를 메인 컨텍스트에 올렸고 그 뒤 갱신되지 않았으면 `## 6 AC` 재독은 생략**(ADR-019). 단 **이전 repair 라운드가 `## 8. 메모`를 append(mutate)했다면 그 메모는 반드시 재독**한다 — 직전 라운드의 4-판정 이력을 보고 같은 항목 재출현을 판단해야 하므로.
2. `docs/40-validation/reports/<task-id>.md`를 읽는다 (report는 매 validate phase 새로 쓰이므로 **항상 새로 읽는다** — 캐시 대상 아님).
   - 파일이 없거나 stale(파일 mtime이 task 문서/구현 파일보다 오래됨)하면 `/validate-workitem` 선행을 안내하고 종료한다.
   - 파일이 `Pass`이면 `/finalize-workitem`을 안내하고 종료한다(repair 대상 없음).
3. 사용자가 인자로 부분 지정을 줬으면 그 부분만 대상으로 한다.
4. 실패 항목을 우선순위(P0 > P1 > P2)로 정렬한다.
```

근거: task 문서 `## 6 AC`만 조건부, `## 8. 메모`는 직전 라운드 mutate 가능성 때문에 무조건 재독, report는 phase마다 새 파일이라 무조건 재독 유지.

**현재 (before):**
```
## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 ADR/architecture 섹션은 task 본문에서 발화 시 인용 — 사전 fork-load 금지.
```

**변경 (after):**
```
## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 ADR/architecture 섹션은 task 본문에서 발화 시 인용 — 사전 fork-load 금지.
메인 세션 연쇄 실행(validate→repair, ADR-050) 시 직전 단계가 메인 컨텍스트에 올린 task `## 6 AC`는 *갱신되지 않았으면 재독 생략*. 단 직전 repair 라운드가 mutate한 `## 8. 메모`와 매 phase 새로 쓰이는 report는 항상 재독.
```

---

### 3. `.claude/skills/finalize-workitem/SKILL.md`

**변경 (after):** 이 파일은 변경하지 않는다. finalize는 frontmatter `context: fork`라 메인 컨텍스트를 상속할 수 없으므로 `반드시 먼저 할 일`(task 문서 읽기 + 통합 명령 실행 + report 확인)과 `## Context 정책 (ADR-019)` 푸터를 **현재 그대로 둔다**. (이 Stage에서 손대지 않음을 명시적으로 기록.)

---

### 4. ADR-019 본문 wording amend — Stage 6에서 처리 (cross-reference)

위 두 푸터가 새로 참조하는 "메인 세션 연쇄 시 조건부 재독" 규칙은 ADR-019 본문(`### 1. JIT 로딩 정책 명문화`)에 한 줄 amend로 박혀야 일관된다. 단 이는 ADR 본문 변경이므로 **Stage 6 (ADR amend 일괄)에서 처리**한다. Stage 6에서 `docs/90-decisions/boilerplate/ADR-019-context-packs-and-jit.md`의 `### 1. JIT 로딩 정책 명문화` 절에 다음 취지의 amend 한 줄을 추가하라 — *"메인 세션 연쇄 실행(ADR-050) 시 직전 단계가 컨텍스트에 올린 task 문서는 미갱신이면 재독 생략. 단 코드 상태 의존(검증 명령 재실행)·산출물 신규(report)·직전 라운드 mutate(`## 8. 메모`)는 무조건 fresh."* 본 Stage 3의 두 푸터는 그 amend의 skill-side 반영이다.

**커밋:** `refactor(skills): make chained main-session doc re-reads conditional in validate/repair`

## Stage 4A — 신규 skill: `plan-milestone` (milestone+feature 생성, 라운드 대화)

`/bootstrap-project`는 초기 M1/F-001만 seed한다 (그 skill `## 6` "최초 workitem"). M2+ 이후 마일스톤과 그에 딸린 feature를 *라운드 대화*로 발굴·작성할 1급 자리가 없어, 즉흥적으로 M1에 욱여넣거나 `/plan-workitem`이 상위 milestone 부재 상태에서 task부터 쪼개는 문제가 있다. 이 Stage는 `discover-product`/`bootstrap-design`의 메인-세션 라운드 패턴을 차용해 *additive 모드*(M2+)로 milestone+feature를 만드는 새 skill을 추가한다. 본 skill은 task를 만들지 않는다 — task 분해는 기존 `/plan-workitem`이 이어 수행한다.

신규 skill이므로 Claude/Codex 양쪽 mirror를 모두 생성한다 (ADR-010). 3개 파일 전부 신규 생성 — 기존 파일 편집 없음.

---

### 1. `.claude/skills/plan-milestone/SKILL.md` (신규 생성)

**현재 (before):**

```
(신규 파일 — 존재하지 않음)
```

**변경 (after):** 아래 전체 내용으로 파일을 생성한다.

````markdown
---
name: plan-milestone
description: Run a multi-round main-session conversation to author the next milestone(s) (M2+) and their feature docs. Additive — does not re-seed M1; hand off to /plan-workitem for tasks.
argument-hint: "[milestone idea | feature idea]"
disable-model-invocation: true
allowed-tools: Read Glob Grep Write Edit Agent
context-pack: minimal
---

이 skill은 메인 세션이 R0~R4 라운드를 직접 운전해 *다음* 마일스톤(M2+)과 그 feature 문서를 작성하는 절차서다.
`/bootstrap-project`가 seed한 초기 M1/F-001 *이후*의 마일스톤을 다룬다 — **additive 모드**(기존 M1을 재생성·덮어쓰기 하지 않는다). **기존 마일스톤에 *새 feature만* 추가하는 경우도 본 skill(additive)이 담당** (외부 리뷰 반영 — 경계 공백 메움): 예: 진행 중인 M1에 F-00X를 추가할 때 M1 문서는 재생성하지 않고 feature 문서만 새로 작성한 뒤 M1 `## 3. 포함되는 기능`에 링크 한 줄을 추가한다. 그 feature를 *task로 분해*하는 것은 `/plan-workitem`이다(역할 경계 유지).
무거운 추론(R2의 마일스톤 분할 판단)은 `Agent` 도구로 architect를 단발 sub-call로 위임한다.
R0~R4 산출물은 메인 컨텍스트에 누적시키지 않고 milestone/feature 문서에 적재한다.

**패턴 차용** — `discover-product`/`bootstrap-design`와 동일하게 `context: fork`를 명시하지 않아 메인 세션이 라운드를 직접 운전한다. 종료 후 사용자가 `/clear` 또는 새 세션으로 컨텍스트를 정리할 것을 권장한다(라운드 인터랙션이 다음 task 컨텍스트에 잡음).

**Codex**: 병렬 위임 미지원 시 순차 단일 실행으로 degrade — R2의 architect 단발 sub-call은 Codex에서 sub-agent 병렬 parity가 없으므로 메인 세션이 직접 추론한다(품질 보장을 위해 충분히 깊게 사고).

**경계** — 이 skill은 milestone + feature까지만 만든다. task 분해(`## 7-1` FAC↔AC 매핑·sizing)는 만들지 않는다 — `/plan-workitem`이 이어 수행한다(자동 호출 아님).

입력:
- `$ARGUMENTS`에 개발자의 다음 마일스톤/feature 아이디어가 자연어로 들어온다(비어 있으면 R1에서 입력 출처들을 회수해 사용자와 정한다).

사용자 응답 수단:
- 라운드별 응답은 자연어로만 받는다.
- 매 라운드 끝에 `skip` / `good` / `refine: …`로 응답할 수 있다.

라운드 출력 포맷 (ADR-046 출력 스타일 — 사용자-facing 표면만 압축, 내부 분석·문서 적재 내용은 불변):
각 라운드는 다음 고정 포맷으로 압축해 출력한다.
```
이번 결정: <1~2줄>
확인 필요: <있으면 ≤3개, 없으면 생략>
답변: skip / good / refine: …
```
사용자가 *선택해야 하는* 옵션(R2의 분할 vs 단일 등)은 선택 가능하도록 보존한다 — 압축은 framing·서술에만 적용한다(ADR-046#d3). architect 단발 sub-call의 *과정*은 대화에 풀어쓰지 않는다.

반드시 먼저 읽을 파일:
- `docs/10-charter/PROJECT_CHARTER.md` (페르소나·비목표 — 새 마일스톤 scope 가드)
- `docs/30-workitems/_templates/MILESTONE_TEMPLATE.md` (마일스톤 양식 SSOT)
- `docs/30-workitems/_templates/FEATURE_TEMPLATE.md` (feature 양식 SSOT)
- 직전 마일스톤 문서(있으면 — `docs/30-workitems/milestones/` 최신 Mx)

라운드 구성:

**R0 — 직전 마일스톤 회수 (additive 입력)**
- 직전 마일스톤 문서가 있으면 다음만 회수한다(ADR-019 minimal — 전체 fork-load 금지):
  - `## 8. 회고` (목표 달성도·scope creep·핵심 학습) — `/stabilize-milestone`이 채운 내용.
  - `## 5. 완료 기준` 졸업 상태(graduation 미충족 항목이 남아 있으면 carry-over 후보).
  - 직전 마일스톤에서 *stabilize 이월*된 미완 항목(졸업 안 된 task / open finding).
- `docs/40-validation/IMPROVEMENT_GUIDE.md`·`docs/40-validation/QA_FINDINGS.md`의 *open* 항목(특히 P0/P1)을 회수해, 다음 마일스톤이 회수할 부채 후보로 surface(자동 편입 X — 사용자 결정).
- 직전 마일스톤 부재(첫 호출 — M1만 존재)면 R0를 건너뛰고 회고 carry-over는 "없음"으로 표시.

**R1 — 입력 intake (다음 마일스톤의 재료)**
- 다음 입력을 모아 사용자와 정렬한다:
  - 개발자 아이디어(`$ARGUMENTS`).
  - `docs/10-charter/DISCOVERY.md` `## 14. Evidence Log`(새 증거) + `## 15. Insight Backlog`(미반영 insight) + CHARTER(범위/비목표).
  - 사용자 인터뷰·최근 큰 버그 발견·리팩토링 부채(R0의 IMPROVEMENT_GUIDE/QA_FINDINGS 회수분).
- 위 재료를 *다음 마일스톤이 다룰 목표 후보*로 묶어 1~N개 제시. 사용자가 우선순위를 정한다.

**R2 — architect 단발 sub-call: 분할 vs 단일 협상**
- R1의 목표 후보를 *여러 마일스톤으로 쪼갤지, 한 마일스톤으로 묶을지* `Agent`(architect) 단발 sub-call로 판단(스코프 크기·의존·졸업 가능성 기준). (Codex: 병렬 위임 미지원 시 메인 세션이 직접 판단.)
- architect 결론(분할 권고·각 마일스톤 한 줄 목표·feature 후보 목록)을 받아 사용자와 협상한다. 사용자가 분할 구조를 확정할 때까지 반복.

**R3 — 마일스톤 문서 authoring (MILESTONE_TEMPLATE에서)**
- 확정된 각 마일스톤을 `docs/30-workitems/_templates/MILESTONE_TEMPLATE.md`를 복사해 `docs/30-workitems/milestones/M<N>-<이름>.md`로 작성한다. `<N>`은 기존 마일스톤 다음 번호(additive — M1 보존).
- `## 5. 완료 기준`은 graduation checklist 5+1 default 그대로 복사(ADR-014). 사용자가 협상한 추가 기준만 "(선택)" 행에 채운다 — 정책 중복 금지(MILESTONE_TEMPLATE·ADR-014가 SSOT).
- `## 8. 회고`는 비워둔다 — `/stabilize-milestone`이 자동 채움(ADR-014).
- `## 6. 관련 문서`에 Charter / Architecture / 관련 ADR 링크를 채운다.

**R4 — feature 문서 authoring (FEATURE_TEMPLATE에서)**
- 각 마일스톤의 feature 후보를 `docs/30-workitems/_templates/FEATURE_TEMPLATE.md`를 복사해 `docs/30-workitems/features/F-<NNN>-<이름>.md`로 작성한다(기존 F-001 다음 번호 — additive).
- `## 0-1. Type`을 채운다(ADR-039). `feature`면 `## 2`를 User Story로, 비-feature(technical-enabler/bugfix/refactor/migration/research-spike)면 기술적 근거 + 서비스하는 DISCOVERY ID·ADR 링크로 채운다(정책은 FEATURE_TEMPLATE 주석·ADR-039가 SSOT).
- `## 7. Feature-level Acceptance Criteria`(FAC)를 시나리오 수준 측정 기준으로 채운다.
- `## 7-1. FAC ↔ AC 매핑표`는 **빈 shell만** 둔다(`- FAC-1 →` 등 우변 미채움) — task 분해 시 `/plan-workitem`이 채운다(영속 SSOT, ADR-036/ADR-037). 이 skill은 task를 만들지 않으므로 매핑을 채우지 않는다.
- `## 11. 관련 문서`의 Milestone 링크를 R3 마일스톤으로 채운다. 비해당 스택의 Architecture-Iface/Design 줄은 삭제(placeholder 잔존 금지).

**Evidence/Insight 연결 (ADR-035#amend-2)**: `Type: feature`이고 DISCOVERY `## 15. Insight Backlog`의 insight를 구현하는 feature면 `## 1. 요약`에 `근거 insight: I-N` 한 줄을 박고, 해당 Insight Backlog 행의 `status=planned` + `linked feature` 갱신을 *출력에 권장*한다(이 skill은 DISCOVERY를 직접 수정하지 않음 — `/discover-product --update`가 회수). 근거 insight 없는 즉흥 feature는 출력 "남은 미결정 사항"에 `- 근거 insight 부재: F-NNN — DISCOVERY 회수 권장` 명시. 비-feature 타입은 가정/기회·ADR 링크로 정당화되므로 insight 부재 경고를 내지 않는다.

**단계별 출구 보장**: 어느 라운드에서 멈춰도 그때까지의 산출물(마일스톤 문서·feature 문서)이 `/plan-workitem`의 입력으로 의미가 있다.

**다국어**: 입력 언어를 따른다. 한국어 입력이면 산출물도 한국어, 영문 입력이면 영문.

종료 후:
- 사용자가 `/clear` 권장 — R0~R4 인터랙션이 다음 task 컨텍스트에 잡음.

마지막 출력 ([WORKFLOW.md "스킬 종료 시 다음 단계 출력 contract"](../../../docs/00-meta/WORKFLOW.md) 양식 정합):
- 생성·갱신한 문서 목록(상대 경로 — 마일스톤·feature)
- 마일스톤 ↔ feature 구조 한 줄 요약
- 핵심 가정
- 남은 미결정 사항 (근거 insight 부재 / 부채 회수 후보 포함)
- 다음 단계:
  ```
  다음 단계:
  - 기본 권장: 본 skill이 만든 각 feature마다 `/plan-workitem F-NNN` — feature를 task로 분해 (milestone+feature는 본 skill이 작성 완료; plan-workitem은 feature→task 전용)
  - 분기 옵션 (해당 시 — ≤3 개):
    - UI feature 포함 + DESIGN.md 미반영 시: `/bootstrap-design --update` 먼저
    - 기획 신뢰도 재확인 원하면: 다른 세션에서 `/validate-discovery --reviewer-tag <tag>` 후 원본에서 `/repair-discovery`
  - 프롬프트 동봉 권장 (다음 skill 호출 시 함께 전달):
    - charter `## 5. 비목표` 핵심 키워드 (다음 plan 라운드의 scope 가드)
    - R0의 부채 회수 후보 (IMPROVEMENT_GUIDE/QA_FINDINGS open 항목 중 이번 마일스톤 편입분)
    - 남은 미결정 사항 본문
  ```

## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 ADR/architecture 섹션은 task 본문에서 발화 시 인용 — 사전 fork-load 금지.
````

> rationale: 프론트매터는 `discover-product`/`bootstrap-design`와 동일(`disable-model-invocation: true`, `allowed-tools: Read Glob Grep Write Edit Agent`, `context-pack: minimal`, `context: fork` 없음 → 메인 세션 운전). 라운드 출력 포맷·`/clear` 권장·단계별 출구 보장은 두 reference skill에서 그대로 차용했다. 템플릿·ADR은 링크로만 참조해 정책 중복을 피한다(ADR-019/ADR-005). `## 7-1` 빈 shell 처리와 task 미생성은 이 skill과 `/plan-workitem`의 경계를 명확히 한다. Codex 병렬 미지원 degrade 노트는 R2 architect sub-call 때문에 필수(CONTEXT 지시).

---

### 2. `.agents/skills/plan-milestone/SKILL.md` (신규 생성 — thin wrapper)

**현재 (before):**

```
(신규 파일 — 존재하지 않음)
```

**변경 (after):** 아래 전체 내용으로 파일을 생성한다(`plan-workitem` wrapper와 동일 shape — `name`/`description`/Source pointer/frontmatter 무시 지시/slash 치환/policy preserve/stale 안내).

```markdown
---
name: plan-milestone
description: Use ONLY when the user explicitly types `$plan-milestone <milestone-or-feature-idea>`. Do not trigger implicitly from generic phrasing.
---

Source of truth: `.claude/skills/plan-milestone/SKILL.md`. Read it and follow the workflow.

Treat all frontmatter keys other than `name` and `description` (e.g., `agent:`, `disable-model-invocation:`, `allowed-tools:`, `context:`, `argument-hint:`, `model:`, `effort:`, `context-pack:`) as Claude-only and ignore them — execute locally in Codex.

**Slash command translation**: 본문 안의 `/plan-milestone`·`/plan-workitem`·`/bootstrap-design`·`/discover-product` 등 표기는 Claude 슬래시 커맨드다. Codex에서는 `$plan-milestone` 등으로 읽고 사용자에게 안내한다 (예: 본문 "다음 단계: `/plan-workitem F-002`" → Codex 응답에서는 "다음 단계: `$plan-workitem F-002`"). Codex CLI는 `/`를 빌트인 슬래시 커맨드에 쓰므로 명시적 치환이 필요.

**Sub-agent parity**: 본문 R2의 architect 단발 sub-call은 Claude `Agent` 도구 기능이다. Codex는 sub-agent 병렬 parity가 없으므로 메인 세션이 순차 단일 실행으로 직접 추론한다(degrade — SKILL.md 본문의 Codex 노트 정합).

Preserve all repo policies from `AGENTS.md` and `docs/`.

If the source path no longer exists, this wrapper is stale — see ADR-010.
```

> rationale: `plan-workitem` wrapper와 동일한 thin-pointer 형태. 본 skill 본문이 sub-agent(`Agent`)에 의존하므로 wrapper에 Codex degrade 한 줄을 추가했다(`plan-workitem`은 sub-agent를 안 써서 그 줄이 없음 — 본 skill은 필요).

---

### 3. `.agents/skills/plan-milestone/agents/openai.yaml` (신규 생성)

**현재 (before):**

```
(신규 파일 — 존재하지 않음)
```

**변경 (after):**

```yaml
policy:
  allow_implicit_invocation: false
```

> rationale: `plan-workitem`의 `agents/openai.yaml`과 동일 — `disable-model-invocation: true`(Claude) 대응. 라이프사이클 skill은 사용자 명시 발화로만 시작(ADR-050).

---

**커밋:** `feat(skills): add plan-milestone skill for round-based M2+ milestone and feature authoring`

## Stage 4B — plan-workitem: fork 해제 + task 전용으로 범위 축소

이 Stage는 ADR-050 D1-style de-fork이다. `plan-workitem`을 fork sub-agent에서 **메인 세션 model-invocable skill**로 바꾸고, 동시에 **milestone/feature 문서 *생성* 책임을 새 `plan-milestone` skill로 이관**한다. `plan-workitem`은 이제 **task 분해** + **feature `## 7-1` FAC↔AC 매핑표의 AC 측 채움**만 담당한다.

새 boundary:
- **plan-milestone** (Stage 4A 신설; 거버넌스 ADR-051은 Stage 6): milestone 문서 생성 + feature 문서 *생성* + FAC 작성 + 빈 `## 7-1` shell 생성.
- **plan-workitem** (본 Stage): task 분해 + 그 task의 AC를 기존 `## 7-1` 매핑표에 채움.

대상 파일: `.claude/skills/plan-workitem/SKILL.md` (canonical). `.agents/skills/plan-workitem/SKILL.md`는 thin pointer라 body 편집 영향 없음 — **이 Stage는 skill 추가/삭제가 아니므로 `.agents` mirror 편집 불필요**.

> 주의: `plan-milestone` skill 본문 + 양 mirror는 **Stage 4A에서 신설**(본 Stage 4B 직전 — §2 권장 실행 순서상 4A가 4B보다 먼저)되고, 그 거버넌스 ADR-051은 Stage 6에서 박힌다. 본 Stage 4B는 plan-workitem에서 milestone/feature-creation 책임을 *제거*하고 plan-milestone로 가리키는 pointer만 남긴다. 아래 plan-workitem SKILL *after-block*(= 배포될 스킬 본문)의 `/plan-milestone` 참조는 가이드-단계 표기 없이 plain하게 둔다(배포 스킬이 "Stage 6" 같은 가이드 메타를 담지 않도록).

---

### 1. Frontmatter — fork 해제

`.claude/skills/plan-workitem/SKILL.md`

**현재 (before):**
```
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
```

**변경 (after):**
```
---
name: plan-workitem
description: 기존 feature 문서를 task 단위로 분해하고, 그 task의 AC를 feature `## 7-1` FAC↔AC 매핑표에 채운다 (milestone·feature 문서 *생성*은 plan-milestone 담당 — ADR-050/ADR-051). Claude Code plan 모드와 다름 — task 분해기.
argument-hint: "[feature id]"
disable-model-invocation: true
allowed-tools: Read Glob Grep Write Edit Agent
context-pack: minimal
---
```

근거: `context: fork` + `agent: planner` 제거로 메인 세션 실행 전환(ADR-050). `disable-model-invocation: true` 유지(여전히 명시 호출 전용). `Agent` 도구 추가 — de-fork 후 무거운 추론을 architect 단발 sub-call에 위임하기 위함(bootstrap-project 패턴 정합). argument-hint는 task 분해 입력인 `[feature id]`로 좁힌다. description은 milestone/feature 생성이 빠졌음을 반영.

---

### 2. 입력 섹션 — milestone/자연어 분해 입구 제거

`.claude/skills/plan-workitem/SKILL.md`

**현재 (before):**
```
너의 역할은 입력으로 받은 milestone/feature/task ID에 대한 workitem 문서를 분해·생성·갱신하는 것이다.

입력:
- `$ARGUMENTS`에는 milestone ID(예: `M1`), feature ID(예: `F-001`), 또는 자연어 분해 요청이 들어온다.
```

**변경 (after):**
```
너의 역할은 입력으로 받은 feature ID를 task 단위로 분해하고, 그 task들의 AC를 feature `## 7-1` 매핑표에 채우는 것이다. milestone·feature 문서 *생성*은 `/plan-milestone` 담당이며, 본 skill은 *이미 존재하는* feature 문서를 입력으로 받는다.

입력:
- `$ARGUMENTS`에는 분해 대상 feature ID(예: `F-001`)가 들어온다. feature 문서가 부재하면 `/plan-milestone`를 먼저 안내하고 종료한다(milestone·feature 문서를 본 skill이 새로 만들지 않는다).
```

근거: 입력을 feature ID로 단일화하고, milestone/자연어 진입로를 plan-milestone로 라우팅.

---

### 3. "반드시 먼저 읽을 파일" — milestone 템플릿 제거, 입력 문서 명확화

`.claude/skills/plan-workitem/SKILL.md`

**현재 (before):**
```
- 입력 ID에 해당하는 상위 workitem 문서(있으면)
- `docs/30-workitems/_templates/MILESTONE_TEMPLATE.md`, `FEATURE_TEMPLATE.md`, `TASK_TEMPLATE.md`
```

**변경 (after):**
```
- 입력 feature ID에 해당하는 feature 문서(필수 — 부재 시 `/plan-milestone` 안내 후 종료) 및 그 상위 milestone 문서
- `docs/30-workitems/_templates/TASK_TEMPLATE.md` (task 생성 양식 SSOT)
```

근거: 본 skill은 더 이상 milestone/feature 문서를 생성하지 않으므로 `MILESTONE_TEMPLATE.md`·`FEATURE_TEMPLATE.md`는 회수 불필요(ADR-019 minimal). feature 문서는 *입력*으로 필수.

---

### 4. "반드시 수행할 일" step 2 — milestone-level 분기 제거

`.claude/skills/plan-workitem/SKILL.md`

**현재 (before):**
```
1. 입력 ID에 해당하는 상위 문서를 읽어 범위와 비범위를 파악한다.
2. 작업을 milestone, feature, task 중 적절한 레벨로 나눈다.
3. 각 문서의 범위와 비범위를 명확히 적는다.
```

**변경 (after):**
```
1. 입력 feature 문서와 그 상위 milestone 문서를 읽어 범위와 비범위를 파악한다.
2. feature 범위를 *task 단위*로 분해한다. milestone·feature 레벨 신설은 하지 않는다 — feature scope가 한 milestone에 담기 어려울 만큼 크면 `/plan-milestone` 재분해를 출력에 권장한다.
3. 각 task의 범위와 비범위를 명확히 적는다.
```

근거: 분해 레벨을 task로 고정. "한 레벨 위"가 필요하면 plan-milestone로 escalation 권장만 출력(자동 차단 X — ADR-007 정합).

---

### 5. step 7 — 템플릿 복사 범위를 task로 한정

`.claude/skills/plan-workitem/SKILL.md`

**현재 (before):**
```
7. 새 문서를 만들 때는 해당 레벨의 템플릿을 복사해 채운다.
```

**변경 (after):**
```
7. 새 task 문서를 만들 때는 `TASK_TEMPLATE.md`를 복사해 채운다. milestone·feature 문서 템플릿 복사는 `/plan-milestone`가 담당하므로 본 skill에서 하지 않는다.
```

근거: milestone/feature 템플릿 복사 책임 이관 명시. task 템플릿 복사만 유지.

---

### 6. feature-decomposition 섹션 — feature DOC 생성=plan-milestone / `## 7-1` AC 채움=plan-workitem 분리 명확화

`.claude/skills/plan-workitem/SKILL.md`

**현재 (before):**
```
## feature 분해 시 (ADR-036)
feature 분해 시 12 main sections + `## 7-1` mapping subsection 모두 채운다.
`## 7 FAC`는 task `## 6 AC`로 분해되며 매핑 결과는 **feature 문서의 `## 7-1. FAC ↔ AC 매핑표` subsection에 영속 저장** (출력만 X — drift 차단).
매핑 누락(unmapped FAC)은 plan 출력의 "남은 미결정 사항"에 *추가*로 명시.
다음 라운드의 [validate-workitem](../validate-workitem/SKILL.md) Spec coverage audit (ADR-037)
및 [stabilize-milestone deterministic preflight](../stabilize-milestone/SKILL.md)가
본 영속 표를 참조해 cross-round 추적.
```

**변경 (after):**
```
## task 분해 + `## 7-1` AC 측 채움 (ADR-036 / ADR-050)
**책임 경계**: feature 문서 *본문 12 main sections* + `## 7 FAC` 작성 + *빈* `## 7-1. FAC ↔ AC 매핑표` shell 생성은 `/plan-milestone`가 이미 끝낸 상태로 본 skill에 들어온다. 본 skill은 **그 feature 문서를 task로 분해**하고, 분해된 task `## 6 AC`로 **기존 `## 7-1` shell의 AC 측(매핑 행)을 채운다** — `## 7-1` 자체를 신설하지 않는다.

입력 feature 문서에 `## 7-1` shell이 *부재*하면(plan-milestone 미실행 또는 legacy 문서) 아래 Legacy fallback을 따른다.

`## 7 FAC`는 task `## 6 AC`로 분해되며 매핑 결과는 **feature 문서의 `## 7-1. FAC ↔ AC 매핑표` subsection에 영속 저장** (출력만 X — drift 차단).
매핑 누락(unmapped FAC)은 plan 출력의 "남은 미결정 사항"에 *추가*로 명시.
다음 라운드의 [validate-workitem](../validate-workitem/SKILL.md) Spec coverage audit (ADR-037)
및 [stabilize-milestone deterministic preflight](../stabilize-milestone/SKILL.md)가
본 영속 표를 참조해 cross-round 추적.
```

근거: locked boundary 반영 — plan-milestone가 feature DOC + FAC + 빈 `## 7-1` shell을 author하고, plan-workitem은 task 분해 중 그 shell에 AC 매핑 행을 채운다. 기존 12-section 일괄 채움 문구는 plan-milestone로 이관됐음을 명시.

---

### 7. feature-decomposition 섹션 후반 — feature `## 11` 링크 채움 책임 이관 + insight 연결 정리

`.claude/skills/plan-workitem/SKILL.md`

**현재 (before):**
```
feature 분해 시 `## 11. 관련 문서` 에 *해당 스택* 의 `Architecture-Iface:` link 와 (UI 프로젝트 한정) `Design:` link 를 채운다. TEMPLATE 의 비해당 스택 줄은 *삭제* (placeholder 잔존 X — drift 차단).

**Evidence/Insight 연결 (ADR-035#amend-2)**: feature가 DISCOVERY `## 15. Insight Backlog`의 인사이트를 구현하는 것이면, feature `## 1. 요약`에 `근거 insight: I-N` 한 줄을 박고, 해당 Insight Backlog 행의 `status`를 `planned` + `linked feature`를 채울 것을 plan 출력에 권장(plan은 DISCOVERY를 직접 수정하지 않음 — `/discover-product --update`가 회수). **`Type: feature` 한정** — 근거 인사이트가 없는 즉흥 feature면 "남은 미결정 사항"에 `- 근거 insight 부재: F-NNN — DISCOVERY 회수 권장` 명시. technical-enabler 등 비-feature 타입은 가정/기회·ADR 링크로 정당화되므로 insight 부재 경고를 내지 않는다.
```

**변경 (after):**
```
feature `## 11. 관련 문서`의 `Architecture-Iface:` / (UI 한정) `Design:` link 채움과 비해당 스택 줄 삭제, 그리고 Evidence/Insight 연결(`근거 insight: I-N` 기입 + Insight Backlog status 권장)은 feature 문서 *생성* 책임이므로 `/plan-milestone`가 담당한다 — 본 skill에서는 하지 않는다. 단, task 분해 중 입력 feature 문서에서 이 항목들이 *비어 있음*을 발견하면 plan 출력의 "남은 미결정 사항"에 `- feature <id> 링크/insight 미채움 — /plan-milestone 보강 권장` 한 줄로 surface한다(자동 수정 X).
```

근거: feature 문서 메타데이터(링크·insight 연결) 채움은 feature-creation의 일부이므로 plan-milestone로 이관. plan-workitem은 결손을 surface만.

---

### 8. `## milestone 생성 시 default (ADR-014)` 섹션 — 전체 삭제 + 이관 note

`.claude/skills/plan-workitem/SKILL.md`

**현재 (before):**
```
## milestone 생성 시 default (ADR-014)
- `## 5. 완료 기준`은 ADR-014 graduation checklist 5+1 항목 default 사용 (MILESTONE_TEMPLATE 그대로 복사). 사용자가 추가 기준을 협상해 "(선택)" 행을 채운다.
- `## 8. 회고`는 `/stabilize-milestone`이 자동 채움 — plan 단계에서는 비워둔다.
```

**변경 (after):**

이 블록 전체 삭제.

근거: milestone 생성 default(graduation checklist 5+1 복사, `## 8. 회고` 자리)는 milestone 문서 생성 책임이므로 plan-milestone(Stage 4A 신설)로 이관. 본 skill은 milestone을 생성하지 않으므로 본 섹션은 잔존하면 안 됨. **이 내용은 Stage 4A의 plan-milestone SKILL.md 본문에 이미 포함**된다 — 본 Stage에서는 plan-workitem에서 제거만 한다.

---

### 9. de-fork에 따른 delegation + `/clear` 권장 note 추가

`.claude/skills/plan-workitem/SKILL.md`

기존 마지막 섹션을 anchor로 그 뒤에 새 섹션을 추가한다.

**현재 (before):**
```
## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 ADR/architecture 섹션은 task 본문에서 발화 시 인용 — 사전 fork-load 금지.
```

**변경 (after):**
```
## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 ADR/architecture 섹션은 task 본문에서 발화 시 인용 — 사전 fork-load 금지.

## 메인 세션 실행 + 무거운 추론 위임 (ADR-050)
본 skill은 fork sub-agent가 아니라 **메인 세션**에서 직접 실행된다(bootstrap-project·discover-product 패턴 정합). 메인 컨텍스트 비대화를 막기 위해:
- 무거운 추론(대규모 task 분해 설계·AC interpretation diversity 판단·sizing 협상·아키텍처 영향 분석)은 `Agent` 도구로 **architect 단발 sub-call**에 위임하고, 반환된 결론만 본 skill이 문서에 반영한다(architect의 `model: opus`가 추론 품질 보장). 본 skill이 직접 모든 task 본문을 펼쳐 inline으로 추론하지 않는다.
- 대상 파일 JIT 읽기는 step 3-G대로 *그 task가 건드릴 실제 파일*에 한정한다(ADR-019 minimal).
- 분해 완료 후 사용자에게 `/clear` 또는 새 세션을 권장한다 — 다음 단계(`/implement-workitem`)가 깨끗한 컨텍스트에서 시작하도록.
- **Codex: 병렬 위임 미지원 시 순차 단일 실행으로 degrade** — Codex는 sub-agent 병렬 fan-out parity가 없으므로, architect 단발 sub-call도 순차 단일 실행으로 동작한다(결과 동일, 처리량만 차이).
```

근거: ADR-050 de-fork의 핵심 — 메인 세션 전환 시 architect 단발 sub-call 위임 + `/clear` 권장으로 main-context bloat 방지(bootstrap-project와 동일 패턴). Codex degrade note는 orchestrator 성격의 위임 문구이므로 필수(ADR-010 parity 부재 대응).

---

### 10. 마지막 출력 섹션 — 분해 매트릭스 헤더 정합 (선택적 보강)

`.claude/skills/plan-workitem/SKILL.md`

**현재 (before):**
```
- feature 분해 시: 매핑표는 feature 문서 `## 7-1`에 직접 기록(SSOT). plan 출력에는 **전체 표를 echo하지 않고** `unmapped N건`만 요약한다(ADR-037#amend-2 owning — ADR-005·ADR-046#d5 정합). 사람은 feature `## 7-1`을 연다.
```

**변경 (after):**
```
- task 분해 시: AC 매핑은 입력 feature 문서 `## 7-1`에 직접 기록(SSOT). plan 출력에는 **전체 표를 echo하지 않고** `unmapped N건`만 요약한다(ADR-037#amend-2 owning — ADR-005·ADR-046#d5 정합). 사람은 feature `## 7-1`을 연다.
```

근거: "feature 분해 시" → "task 분해 시"로 용어 정합(본 skill은 더 이상 feature를 분해 생성하지 않고 task로 분해). 기능 변경 없음 — 용어만 일치.

---

### 11. plan-workitem 호출처 갱신 — bootstrap-project 다음-단계 (refocus cascade 정합)

plan-workitem이 feature-id/task 전용이 되면서 `/plan-workitem M1`(milestone-level) 호출은 무효가 된다. bootstrap-project는 M1 + F-001을 seed하므로, 그 다음 단계는 *seed된 F-001의 task 분해* = `/plan-workitem F-001`이다.

대상 파일: `.claude/skills/bootstrap-project/SKILL.md` (다음-단계 출력 2줄).

**현재 (before):**
```
    - 스택이 이미 brief/charter 에 명시됐고 `/bootstrap-stack` + `/stack-guard` 도 끝났다면: `/plan-workitem M1` — 첫 milestone 의 feature/task 분해
    - UI 프로젝트 + 스택 확정 후: `/bootstrap-design` 다음 `/plan-workitem M1`
```

**변경 (after):**
```
    - 스택이 이미 brief/charter 에 명시됐고 `/bootstrap-stack` + `/stack-guard` 도 끝났다면: `/plan-workitem F-001` — seed된 첫 feature(F-001)의 task 분해
    - UI 프로젝트 + 스택 확정 후: `/bootstrap-design` 다음 `/plan-workitem F-001`
```

> 근거: bootstrap-project가 M1+F-001을 이미 seed하므로 다음 단계는 *F-001의 task 분해*(plan-workitem feature-id 전용 contract 정합). milestone-level 분해(`M1`)는 더 이상 plan-workitem 입력이 아니다(M2+ 신규 마일스톤은 `/plan-milestone`). 이 갱신은 *다음-단계 routing 편의 참조*라 ADR-051 Surfaces 신규 등재는 불요(WORKFLOW 다음-단계 contract 정합). PROJECT_START_CHECKLIST의 `... → /plan-workitem` 순서 SSOT 문구는 레벨 무관(feature/task 진입)이라 불변.

---

**커밋:** `refactor(plan-workitem): de-fork to main session and scope to task decomposition + 7-1 AC fill; repoint /plan-workitem M1 caller in bootstrap-project to F-001`

## Stage 5A — stabilize-milestone: 병렬 verifier 팬아웃 + E2E MUST-run 하드블록

이 Stage는 `/stabilize-milestone`을 두 축으로 바꾼다: (1) 고정 `qa×1 + reviewer×1/2` 위임을 **필요한 만큼의 병렬 verifier 팬아웃 + 메인 세션 self-synthesis**로 교체(report-only 계약·ADR-046#d3 no-cap-drop·dedup 유지), (2) E2E의 silent-skip을 제거하고 *이 마일스톤이 e2e를 필요로 하는가*를 판정 → 필요한데 `validate:e2e`가 통과 못 하면 졸업을 **hard-block**(단 ENVIRONMENT 실패는 실제 실패와 구분). stabilize는 여전히 **read-only** — 실제 e2e/코드 수정은 신설 `/repair-milestone`(Stage 5B/6, ADR-052)로 라우팅한다.

본 Stage는 ADR-014의 graduation contract(특히 item 3 E2E)와 evaluator orchestration 형태를 개정한다. 상세 근거는 Stage 6에서 신설하는 **ADR-052**(repair-milestone + e2e graduation hard-block) 및 ADR-014 amendment에 둔다.

> 미러 영향(ADR-010): 본 Stage는 기존 skill의 **body만** 편집한다(신규/삭제 skill 없음). `.agents/skills/stabilize-milestone/SKILL.md`는 `.claude` body를 가리키는 thin pointer이고 name/description 외 frontmatter를 무시하므로, **`.agents` 미러 편집은 불필요**하다. (신설되는 `/repair-milestone`의 양쪽 미러 생성은 Stage 5B/6 섹션 책임 — 본 Stage 아님.)

---

### 파일 1 — `.claude/skills/stabilize-milestone/SKILL.md`

#### (1-A) §1.5 Graduation item 3 — "스택 정의 시"에서 "needed → must pass; needed+not-runnable = block"로

**현재 (before):**
```
- `E2E Pass (스택 정의 시)` → 단계 3의 E2E 명령 exit code 0. E2E 미정의 스택은 *해당 없음*으로 처리(통과).
```

**변경 (after):**
```
- `E2E Pass (needed → must pass)` → 단계 3의 e2e 판정 결과를 그대로 반영(ADR-052):
  - **e2e 불필요** (UI 아님 ∧ graduation item 6에 e2e 미선언) → *해당 없음*(통과).
  - **e2e 필요** (UI 프로젝트 — ADR-027#amend-3 다중신호 UI 판정 ∨ graduation item 6이 e2e를 명시 선언) ∧ `validate:e2e` exit code 0 → 통과.
  - **e2e 필요 ∧ `validate:e2e` exit code ≠ 0 (real failure)** → **`졸업 가능: NO` (hard)**. 조기 종료 옵션이 아니라 *졸업 차단*이다. 후속은 단계 8의 `/repair-milestone` 분기로 라우팅.
  - **e2e 필요 ∧ `validate:e2e` 실행 불가 (ENVIRONMENT failure — 브라우저 미설치 / 대상 앱 미기동 / E2E MCP 미등재)** → **`졸업 가능: NO` (hard, blocked-on-env)**. 단 이것은 *실제 e2e 실패가 아니다* — 사용자에게 환경 복구를 안내(`E2E 환경 미충족: <원인> — 브라우저 설치 / 앱 기동 후 재실행 권장`)하고, real failure와 라벨을 구분해 출력한다.
```

> rationale: ADR-014 item 3을 deterministic 판정으로 강화. "스택에 정의된 경우"라는 모호한 조건을 *필요성 판정(UI/선언) + 실행가능성*의 2축으로 분해하고, ENVIRONMENT 실패를 real failure와 분리해 false-block을 막는다.

---

#### (1-B) 단계 3 — E2E MUST-run, silent-skip 제거

**현재 (before):**
```
3. 통합 `validate` 명령을 실행한다 + (있으면) E2E 명령을 실행한다.
```

**변경 (after):**
```
3. 통합 `validate` 명령을 실행한다 + **e2e 필요성 판정 후 필수 실행**(ADR-052 — silent-skip 금지):
   - **3-a. e2e 필요성 판정**: 본 마일스톤이 e2e를 필요로 하는가를 deterministic 신호로 결정한다 —
     (i) **UI 프로젝트** (ADR-027#amend-3 다중신호 UI 판정: DESIGN.md status≠draft, 또는 status=draft+신호≥1) → 필요,
     (ii) graduation item 6 `(선택) 본 마일스톤 한정 추가 기준`이 e2e를 명시 선언 → 필요.
     둘 다 아니면 *불필요* → `E2E: 불필요 (비-UI ∧ item 6 미선언)` 한 줄 echo 후 통과 처리(이 경우만 skip 허용 — 사유 명시).
   - **3-b. 필요 시 `validate:e2e` 실행 (silent-skip 금지)**: e2e가 필요하면 반드시 `validate:e2e`(또는 스택의 e2e 명령)를 실행하고 exit code를 기록한다.
     - exit code 0 → 통과.
     - exit code ≠ 0 인데 출력이 환경 원인(브라우저/드라이버 미설치, 대상 앱 미기동, E2E MCP 미등재·access 미부여)으로 판명 → **ENVIRONMENT failure**로 분류(real failure 아님). 단계 8과 §1.5에 `blocked-on-env`로 전달하고 사용자에게 환경 복구 안내.
     - exit code ≠ 0 이고 환경 원인이 아님 → **real e2e failure**로 분류. §1.5 item 3을 `졸업 가능: NO (hard)`로 만든다.
   - **stabilize는 read-only다 — 여기서 e2e/코드를 고치지 않는다.** 실패(real/env 무관)는 단계 8의 `/repair-milestone` 분기로 텍스트 라우팅만 한다.
```

> rationale: ADR-014 item 3을 강제 실행으로 끌어올린다. "있으면 실행"이라는 optional 표현이 silent-skip의 근원이었다.

---

#### (1-C) 단계 4–5 — 병렬 verifier 팬아웃 + 메인 세션 self-synthesis

**현재 (before):**
```
4. **qa agent에 회귀·엣지케이스 점검 위임** — qa는 보고만 한다(qa.md의 tools에 Write 없음). 반환된 보고를 본 skill이 받아 `docs/40-validation/QA_FINDINGS.md`에 누적 기록한다. **위임 시 ADR-046#d3 적용: finding은 cap 때문에 누락하지 말고 전수 반환 — cap은 서술/과정 설명에만.**
5. **reviewer agent에 리팩토링 후보·아키텍처 부채 점검 위임** — reviewer 입력에 Clean Code 6항목 체크리스트(ADR-006) + `review surface: code` + **ADR-046#d3(finding 전수 반환 — report-only이므로 본 skill이 받아 적는다)** 를 명시 전달한다. **UI 프로젝트의 경우 추가로 `review surface: design` 으로 별도 위임 1회** — DESIGN.md `## 9. Do's and Don'ts` 위반 의심 grep 결과를 입력으로 받아 비판적 검토. reviewer 도 보고만 한다. 반환된 보고를 본 skill이 받아 `docs/40-validation/IMPROVEMENT_GUIDE.md`에 정리.
   - reviewer 결과에 구조 변경이 필요해 보이면 메인 세션에 architect 추가 호출을 텍스트로 제안.
```

**변경 (after):**
```
4. **병렬 qa verifier 팬아웃 — 고정 1개가 아니라 *필요한 만큼*** (feature / user-flow / surface 단위로 분할). 메인 세션이 본 마일스톤의 feature·핵심 시나리오·surface 목록을 회수해 *독립 점검 단위*로 쪼개고, 각 단위마다 qa agent를 1개씩 병렬 위임한다(회귀·엣지케이스 점검). qa는 보고만 한다(qa.md의 tools에 Write 없음).
   - **위임 시 ADR-046#d3 적용: finding은 cap 때문에 누락하지 말고 전수 반환 — cap은 서술/과정 설명에만.**
   - **Codex: 병렬 위임 미지원 시 순차 단일 실행으로 degrade** (sub-agent 병렬 parity 부재 — 동일한 분할 단위를 *순차 단일 qa 호출*로 한 단위씩 처리, 결과는 동일하게 누적).
5. **병렬 reviewer verifier 팬아웃 — 필요한 만큼** (리팩토링 후보·아키텍처 부채). 각 reviewer 입력에 Clean Code 6항목 체크리스트(ADR-006) + `review surface: code` + **ADR-046#d3(finding 전수 반환 — report-only)** 를 명시 전달한다. **UI 프로젝트는 추가로 `review surface: design` reviewer를 1개 더 팬아웃** — DESIGN.md `## 9. Do's and Don'ts` 위반 의심 grep 결과를 입력으로 받아 비판적 검토. reviewer도 보고만 한다.
   - **Codex: 병렬 위임 미지원 시 순차 단일 실행으로 degrade** (분할 단위를 순차 reviewer 호출로 처리).
6-S. **메인 세션 self-synthesis (report-only 계약 유지)**: 위 4·5의 *모든* 병렬 verifier가 반환한 보고를 메인 세션이 직접 종합한다.
   - qa 보고 → `docs/40-validation/QA_FINDINGS.md`에 누적 기록. reviewer 보고 → `docs/40-validation/IMPROVEMENT_GUIDE.md`에 정리.
   - **no-cap-drop (ADR-046#d3)**: 여러 verifier의 finding을 합칠 때도 cap 때문에 누락 금지 — finding은 전수 기록하고, cap은 *대화 출력의 서술/과정 요약*에만 적용한다.
   - **dedup**: 분할 단위가 겹쳐 동일 finding이 여러 verifier에서 중복 반환될 수 있다. 동일 `<라벨> <file:line> <증상>` 항목은 1건으로 병합하되, *서로 다른 단위에서 관측됨*은 근거로 보존(병합 시 관측 surface를 한 줄로 합산).
   - reviewer 결과에 구조 변경이 필요해 보이면 메인 세션에 architect 추가 호출을 텍스트로 제안.
   - **stabilize는 여전히 read-only다** — self-synthesis는 *문서 누적 기록*까지만. 코드·커밋·workitem status 변경 없음(도입부 책임 경계 정합).
```

> rationale: evaluator orchestration을 "고정 2 agent"에서 "마일스톤 표면적에 비례한 N agent 팬아웃 + 메인 self-synthesis"로 확장. Codex는 sub-agent 병렬 parity가 없으므로 두 단계 모두 순차 degrade 노트 필수. 후속 단계 번호(6, 6.5, 7, 7-T, 8)는 그대로 두고 synthesis는 `6-S`로 삽입한다.

---

#### (1-D) 단계 8 "다음 단계" 분기 — milestone-level P0/P1 + e2e는 `/repair-milestone` 권장

**현재 (before):**
```
     - **졸업 가능 = NO 또는 P0 후속 있음** (분기 옵션 ≤3):
       - `[Spec-gap]` finding 있음: `/plan-workitem F-NNN` 으로 미커버 task 추가
       - 회귀·엣지케이스 (QA_FINDINGS P0) 있음: `/repair-workitem T-NNN` 으로 해당 task 수정 → 재 validate
       - `[Doc-link]` / `[ADR-ref]` 등 문서 정합 P0: 사용자 직접 수정 (architect 또는 메인)
```

**변경 (after):**
```
     - **졸업 가능 = NO 또는 P0 후속 있음** (분기 옵션 ≤3):
       - **milestone-level P0/P1 (여러 task 교차) 또는 e2e real failure 있음: `/repair-milestone M-N` 권장** (ADR-052) — 단일 task로 격리되지 않는 회귀·교차 결함과 실제 e2e 수정은 milestone 단위 repair로 라우팅. stabilize가 read-only로 남기 위한 코드 수정 경로다.
       - 단일 task로 격리되는 회귀·엣지케이스 (QA_FINDINGS P0): `/repair-workitem T-NNN` 으로 해당 task 수정 → 재 validate
       - `[Spec-gap]` finding 있음: `/plan-workitem F-NNN` 으로 미커버 task 추가
       - `[Doc-link]` / `[ADR-ref]` 등 문서 정합 P0: 사용자 직접 수정 (architect 또는 메인)
       - **e2e blocked-on-env (ENVIRONMENT failure)**: real failure가 아니므로 repair 대상 아님 — 사용자에게 환경 복구(브라우저 설치 / 앱 기동 / E2E MCP 등재·access)를 안내하고 환경 복구 후 `/stabilize-milestone M-N` 재실행 권장.
```

> rationale: 신설 `/repair-milestone`(Stage 5B/6)을 1순위 분기로 등록하되 옵션 ≤3 규율을 지키도록 단일-task repair는 흡수 위치를 조정. env-blocked는 repair가 아니라 환경 안내로 분기.

---

#### (1-F) 단계 8 "다음 단계" 졸업-성공 분기 — `/plan-workitem M-(N+1)` → `/plan-milestone` (plan-workitem refocus 정합)

plan-workitem이 feature-id/task 전용으로 좁혀졌으므로(Stage 4B), 졸업 성공 시 *다음 마일스톤 생성*은 `/plan-milestone`이 담당한다(`/plan-workitem M-(N+1)`은 무효 입력이 됨).

**현재 (before):**
```
       - 기본 권장: `/plan-workitem M-(N+1)` — 다음 milestone 의 feature/task 분해
```

**변경 (after):**
```
       - 기본 권장: `/plan-milestone` — 다음 milestone(M-(N+1)) + feature 문서 생성 (이후 각 feature를 `/plan-workitem F-NNN`로 task 분해)
```

> rationale: plan-workitem refocus(Stage 4B — feature-id/task 전용) 정합. 졸업 후 *다음 마일스톤 생성*은 plan-milestone(Stage 4A 신설), task 분해는 plan-workitem. WORKFLOW 다음-단계 contract 정합. (stabilize-milestone은 이미 ADR-051/052 Surfaces 등재 — 추가 Surfaces 불요.)

---

#### (1-E) 단계 8 직후 line ~185 — E2E skip 안내 문구를 필요성-판정 기준으로 교체

**현재 (before):**
```
E2E 명령이 없는 스택은 3단계에서 통합 `validate`만 돌리고 E2E는 skip한다(출력에 명시).
```

**변경 (after):**
```
E2E는 단계 3-a의 *필요성 판정*으로 결정한다 — e2e 불필요(비-UI ∧ graduation item 6 미선언) 마일스톤만 통합 `validate`만 돌리고 e2e를 skip한다(사유 출력 명시). **e2e 필요 마일스톤은 silent-skip 금지** — `validate:e2e`를 반드시 실행하고, 미통과(real) 시 졸업 hard-block, 실행 불가(env) 시 사용자 환경 복구 안내(ADR-052).
```

> rationale: "E2E 명령이 없으면 skip"이라는 stack-presence 기준을 *necessity* 기준으로 교체. e2e가 필요한데 명령이 미설정/미통과인 마일스톤이 조용히 졸업하던 구멍을 막는다.

---

### 파일 2 — `docs/30-workitems/_templates/MILESTONE_TEMPLATE.md`

#### (2-A) Graduation 완료 기준 item 3 문구

**현재 (before):**
```
- [ ] E2E Pass (스택에 정의된 경우)
```

**변경 (after):**
```
- [ ] E2E Pass (needed → must pass; needed + not-runnable = block) — UI 프로젝트(ADR-027#amend-3) 또는 아래 item 6에서 e2e 선언 시 필요; 필요한데 미통과(real)면 졸업 차단, 실행 불가(env)면 환경 복구 후 재실행 (ADR-052)
```

> rationale: ADR-014 item 3 텍스트를 SKILL.md §1.5 판정과 동기화. 템플릿이 졸업 contract의 SSOT surface이므로 함께 갱신.

---

### 미러·ADR 정합 메모 (구현자 확인용, 편집 아님)

- `.agents/skills/stabilize-milestone/SKILL.md`는 thin pointer → **편집 없음** (body-only 변경, ADR-010).
- 본 Stage가 개정하는 ADR-014 item 3 / evaluator orchestration은 **ADR-052**(Stage 5B/6 신설 — repair-milestone + e2e hard-block)에 amendment/pointer로 박는다. ADR-052와 `/repair-milestone` skill(양쪽 미러)·`.claude`/`.agents` 생성은 본 Stage가 아닌 **Stage 5B/6 섹션 책임**이다. 본 Stage의 SKILL.md/TEMPLATE 본문은 ADR-052를 *forward-reference*만 한다(해당 ADR 미존재 상태에서 preflight `[ADR-ref]`가 P2를 낼 수 있으니, ADR-052는 Stage 6에서 동일 PR 묶음으로 생성할 것).

---

**커밋:**
- `feat(stabilize-milestone): fan out parallel qa/reviewer verifiers with self-synthesis`
- `feat(stabilize-milestone): make e2e MUST-run and hard-block graduation when needed`
- `docs(milestone-template): redefine graduation item 3 as needed-must-pass e2e`

## Stage 5B — 신규 skill: repair-milestone (메인 세션)

`/stabilize-milestone`이 누적한 milestone-level finding(QA_FINDINGS `## M-N`, IMPROVEMENT_GUIDE `### M-N`)을 비판적으로 재점검하고 **실제 결함을 수정**하는 메인 세션 skill을 신설한다. `repair-workitem`(task scope, code 수정 OK)과 `repair-plan`(milestone/feature scope, code 수정 금지)의 중간 — milestone scope이면서 **code 수정이 허용**되는 유일한 repair skill이다. cross-cutting 결함(doc-consistency P0, e2e wiring, architecture 부채)을 직접 처리하고, per-task 결함은 `/repair-workitem`으로 라우팅한다.

ADR-010에 따라 Claude(canonical) + Codex(thin wrapper + openai.yaml) 두 미러를 모두 신설한다. 신규 skill이므로 `.agents` 미러도 새로 만들어야 한다.

---

### 파일 1 (신규): `.claude/skills/repair-milestone/SKILL.md`

**현재 (before):**

```
이 파일은 존재하지 않음 — 신규 생성
```

**변경 (after):** 아래 전체 내용으로 파일을 생성한다.

````markdown
---
name: repair-milestone
description: Critically recheck milestone-level QA/improvement findings and fix real cross-cutting defects (code change allowed). Route per-task fixes to /repair-workitem.
argument-hint: "[milestone id] [optional notes]"
disable-model-invocation: true
allowed-tools: Read Glob Grep Write Edit Bash Agent
context-pack: minimal
---

이 skill은 `/stabilize-milestone`이 누적 기록한 milestone-level finding을 **비판적으로 재점검**한 뒤, 진짜 결함만 수정한다. 메인 세션에서 실행되므로 풀 프로젝트 컨텍스트로 판단한다.
**stabilize와 달리 코드 수정이 명시적으로 허용된다** — 단, 새 기능 추가·milestone 범위 밖 변경·자동 커밋은 금지한다.

`disable-model-invocation: true` — stabilize와 동일하게 사용자가 명시적으로 `/repair-milestone <M-N>`을 호출할 때만 실행한다(파괴적·광범위 수정 권한이라 묵시 트리거 차단).

**Codex: 병렬 위임 미지원 시 순차 단일 실행으로 degrade** — 아래 cross-cutting 처리 단계의 `/repair-workitem` 병렬 라우팅·복수 task 동시 수정은 Claude sub-agent 전용. Codex는 task를 한 개씩 순차로 `$repair-workitem`에 위임한다.

입력:
- `$ARGUMENTS`에는 milestone ID와 (선택) 부분 지정 메모가 들어온다.
  - 예: `M1`
  - 예: `M1 "P0만, doc-consistency 먼저"` — 일부 severity/카테고리만 대상
- **milestone-id sanitization 강제**: `M[0-9]+` 패턴만 허용. `/`, 공백, glob 메타문자(`*`, `?`, `[`) 포함 시 *즉시 종료* (repair-plan과 동형 — 본 skill은 ID로 QA_FINDINGS/IMPROVEMENT_GUIDE의 `## M-N` / `### M-N` 헤더를 grep하므로 안전 전제).

반드시 먼저 할 일:
1. milestone 문서를 읽고 포함된 feature/task 목록을 회수한다 (`## 8. 회고`의 기존 repair 결정 이력 맥락 포함).
2. `docs/40-validation/QA_FINDINGS.md`의 본 milestone 헤더(`## M-N`) 아래 `### P0` / `### P1` / `### P2` 항목을 회수한다.
3. `docs/40-validation/IMPROVEMENT_GUIDE.md`의 본 milestone sub-section(`### M-N` 그룹)에서 `status: open` 항목을 회수한다 — `## 2. 즉시 수정할 항목` / `## 3. 권장 리팩토링` 안의 그룹. **`## 5. Repair decision log`는 회수 대상 아님** (closed records — 이미 지나간 판단).
   - QA_FINDINGS `## M-N`도 IMPROVEMENT_GUIDE `### M-N`도 비어 있으면 *"수정 대상 finding 없음 — 다른 세션에서 `/stabilize-milestone <M-N>`을 먼저 실행하세요."* 안내 후 종료. 문서 수정 금지.
4. 사용자가 인자로 부분 지정을 줬으면 그 부분만 대상으로 한다.
5. 회수한 finding 전부를 우선순위(P0 > P1 > P2)로 정렬한다.

비판적 재점검 (수정 *전* 1회 — stabilize의 qa/reviewer/deterministic preflight가 틀리거나 맥락을 놓쳤을 수 있다):
각 finding마다 *실제 코드·문서·milestone 완료 기준을 직접 확인*해 4가지 중 하나로 판정하고 한 줄 근거를 남긴다 (repair-workitem과 동형):
- **Adopt** — 진짜 결함. finding 제안대로 수정.
- **Adopt-modified** — 결함은 맞지만 더 나은 방식으로 수정 (다른 수정 + 사유).
- **Reject-false-positive** — stabilize 단계가 잘못 봄 (예: 이미 충족됨 / deterministic preflight 휴리스틱 오탐 / placeholder 오인 / 이미 존재하는 link를 누락이라고 본 경우).
- **Reject-context** — stabilize가 milestone 범위·상위 제약을 놓침 (예: charter `## 5. 비목표`상 의도된 미구현 / ARCH 결정상 정당한 동작).
> 자기 판단을 신뢰하되, 애매하면 Adopt 쪽으로 보수적으로. Reject는 *근거가 코드/문서로 확인될 때만*.

수행:
1. Adopt / Adopt-modified 항목을 우선순위(P0 > P1 > P2) 순으로 처리한다.
2. **라우팅 — finding의 scope에 따라 처리 주체가 다르다**:
   - **per-task 결함** (특정 `T-NNN`에 귀속되는 코드/AC 결함): 직접 고치지 말고 `/repair-workitem <T-NNN> "<finding 요약>"`로 위임한다. report 부재면 먼저 `/validate-workitem <T-NNN>` 선행을 안내. (Codex: 병렬 미지원 시 task별로 순차 단일 실행.)
   - **cross-cutting 결함** (단일 task에 귀속되지 않는 milestone-level 결함): 본 skill이 **직접 수정**한다. 대표 3종:
     - **doc-consistency P0** (예: deterministic preflight가 올린 `[Doc-link]`/`[ADR-ref]`/`[Spec-gap]`/`[Arch-iface-violation]`): 해당 문서·매핑표를 직접 수정.
     - **e2e wiring scaffold/install** (E2E 미정의 스택에 재현 케이스를 영속 테스트로 묶는 scaffold, `validate:e2e` 배선, 의존성 install): 직접 scaffold·install.
     - **architecture debt** (layer 경계·의존성 규칙 위반 등 ARCH 정합 결함): 직접 수정하거나, 구조 변경이 크면 architect 호출을 텍스트로 제안하고 본 라운드에선 Reject-context 대신 *후속 task 제안*으로 남긴다(과대 수정 금지).
3. **한 라운드에 P0/P1/P2를 *모두* 4-판정으로 완결**한다(repair-plan/repair-workitem과 동형). defer 금지 — 4결정 카테고리 외의 deferred drop은 허용 X. 작업량을 줄이려면 사용자가 인자로 부분 범위를 지정한다(`M1 "P0만"`).
4. **결정 이력 영속화 (ADR-047 D7 durable correction history + D1 inspectability)** — 본 라운드의 P0/P1 항목 전부를 `docs/40-validation/IMPROVEMENT_GUIDE.md`의 `## 5. Repair decision log` 안 `### M-N` 그룹(없으면 신설)에 IMPROVEMENT_GUIDE 스키마로 append. P2는 영속화 X (cap 보호 — 재출현해도 milestone 졸업 게이트를 막지 않아 무해).

   **영속 형식** (IMPROVEMENT_GUIDE `## 항목 스키마` SSOT 정합):
   ```
   - **M1-repair-1** | P0 | [관측됨] | linked: M1 | status: applied | decision: Adopt
     - 발견 (stabilize <surface>): <한 줄 설명>.
     - 결정: <Adopt|Adopt-modified|Reject-FP|Reject-context 사유 한 줄>.
   ```
   ID 컨벤션: `<milestone-id>-repair-<N>` (예: `M1-repair-1`, `M1-repair-2`) — milestone ID 그대로 prefix + `-repair-` + 본 라운드 시퀀스. `linked` 필드로 원본 milestone 역참조. **evidence label은 기본 `[관측됨]`** (finding 자체가 stabilize의 *로컬 문서/코드 관측*에서 나옴). per-task 위임 결과는 해당 task `## 8. 메모`에 `/repair-workitem`이 직접 append하므로 *여기 중복 기록 X* — 본 `## 5`에는 cross-cutting 결정과 "T-NNN으로 위임함" 한 줄 routing 기록만 둔다.

5. **원본 finding status 갱신** — Adopt/Adopt-modified로 해소한 IMPROVEMENT_GUIDE `### M-N`의 open 항목은 `status: open` → `status: resolved`로 갱신(closed records인 `## 5`로 옮기지 않고 *open 항목의 status만* 토글 — open items와 closed records의 의미 분리 유지). QA_FINDINGS `## M-N`의 해소된 항목도 동일하게 `status: resolved` 표기.

책임 경계:
- 새 기능을 추가하지 않는다.
- milestone 범위 밖 파일을 수정하지 않는다.
- 자동 커밋하지 않는다 — 결과만 반환하고 커밋은 사용자/`/finalize-workitem`이 별도로 (ADR-047 D7 — finalize/user가 commit owner).
- per-task 코드 결함은 직접 고치지 말고 `/repair-workitem`으로 위임한다 (task scope SSOT 침범 금지). cross-cutting 결함만 직접 수정.
- QA_FINDINGS / IMPROVEMENT_GUIDE에서 본 milestone(`## M-N` / `### M-N`) 외 다른 milestone 그룹은 건드리지 않는다.

마지막 출력:
- 4-판정 카운트: Adopted M / Adopt-modified K / Reject-FP I / Reject-context J
- cross-cutting 직접 수정 파일 목록 + 어떤 finding을 어떻게 해소했는지
- `/repair-workitem`으로 위임한 task 목록 (Codex 순차 degrade 여부 명시)
- Reject한 항목 + 근거 (있으면)
- `## 5. Repair decision log` `### M-N` append 줄 수 (P0+P1 합)
- status: open → resolved 토글한 finding 수
- architect 호출 권장 (architecture debt가 구조 변경을 요할 때)
- 미해결 항목 (있으면)
- 다음 권장 액션: `/stabilize-milestone <M-N>` 재실행 (수정 반영 후 재검증 → 졸업 가능 = YES면 `/plan-milestone`로 다음 마일스톤(M-(N+1))+feature 생성 후 `/plan-workitem F-NNN`로 task 분해)

정책 근거: 비판적 재점검·전 severity 완결은 [ADR-050](../../../docs/90-decisions/boilerplate/ADR-050-main-session-lifecycle-skills.md) D3 / repair-workitem·repair-plan 대칭. milestone 졸업 contract는 [ADR-014](../../../docs/90-decisions/boilerplate/ADR-014-milestone-graduation.md). 결정 이력 영속·commit owner 분리는 [ADR-047](../../../docs/90-decisions/boilerplate/ADR-047-code-as-agent-harness.md) D7. 단순성·범위 추적은 [ADR-006](../../../docs/90-decisions/boilerplate/ADR-006-simplicity-and-architecture.md).

## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 ADR/architecture 섹션은 finding 본문에서 발화 시 인용 — 사전 fork-load 금지.
````

*Rationale:* `disable-model-invocation: true`는 stabilize와 동형 — code 수정 + cross-cutting 권한이라 묵시 트리거를 차단한다. `allowed-tools`에 `Agent`를 포함하는 이유는 per-task 결함을 `/repair-workitem` sub-agent로 라우팅하기 위함이다(stabilize의 qa/reviewer 위임과 동일 권한 셋). `## 5. Repair decision log`는 repair-plan이 owning하던 자리지만 본 skill도 milestone scope이므로 동일 스키마로 append한다(아래 ownership comment 확대 편집 참조).

---

### 파일 2 (신규): `.agents/skills/repair-milestone/SKILL.md`

**현재 (before):**

```
이 파일은 존재하지 않음 — 신규 생성
```

**변경 (after):** 아래 전체 내용으로 파일을 생성한다 (repair-workitem/stabilize-milestone 래퍼와 동일 thin-pointer 구조).

```markdown
---
name: repair-milestone
description: Use ONLY when the user explicitly types `$repair-milestone <milestone-id>`. Do not trigger implicitly from generic phrasing.
---

Source of truth: `.claude/skills/repair-milestone/SKILL.md`. Read it and follow the workflow.

Treat all frontmatter keys other than `name` and `description` (e.g., `agent:`, `disable-model-invocation:`, `allowed-tools:`, `context:`, `argument-hint:`, `model:`, `effort:`) as Claude-only and ignore them — execute locally in Codex.

**Slash command translation**: 본문 안의 `/repair-milestone` 표기는 Claude 슬래시 커맨드다. Codex에서는 `$repair-milestone`으로 읽고 사용자에게 안내한다 (예: 본문 "다음 단계: `/stabilize-milestone M1`" → Codex 응답에서는 "다음 단계: `$stabilize-milestone M1`"). Codex CLI는 `/`를 빌트인 슬래시 커맨드에 쓰므로 명시적 치환이 필요.

**Codex 병렬 미지원**: source body의 per-task `/repair-workitem` 병렬 라우팅은 Codex에서 미지원 — task를 한 개씩 순차로 `$repair-workitem`에 위임한다(degrade).

Preserve all repo policies from `AGENTS.md` and `docs/`.

If the source path no longer exists, this wrapper is stale — see ADR-010.
```

*Rationale:* thin pointer는 `name`/`description`만 의미를 갖고 나머지 frontmatter는 무시되므로 body는 source를 가리키기만 한다. Codex는 sub-agent 병렬 parity가 없으므로 source body의 병렬 라우팅을 순차 degrade하라는 한 줄을 래퍼에 추가했다(다른 래퍼와 달리 본 skill은 병렬 위임을 포함하므로 필요).

---

### 파일 3 (신규): `.agents/skills/repair-milestone/agents/openai.yaml`

**현재 (before):**

```
이 파일은 존재하지 않음 — 신규 생성
```

**변경 (after):** 아래 전체 내용으로 파일을 생성한다 (repair-workitem/stabilize-milestone openai.yaml과 동일 — 묵시 호출 차단).

```yaml
policy:
  allow_implicit_invocation: false
```

*Rationale:* Claude의 `disable-model-invocation: true`에 대응하는 Codex 측 묵시 호출 차단. stabilize-milestone·repair-workitem과 동일하게 명시 `$repair-milestone` 호출만 허용한다.

---

### 파일 4 (편집): `docs/40-validation/IMPROVEMENT_GUIDE.md`

`## 5. Repair decision log`의 ownership 주석을 현재 `repair-plan` 전용에서 `repair-milestone`도 직접 append하도록 확대한다.

**현재 (before):**

```markdown
## 5. Repair decision log

`/repair-plan`이 feature(F-NNN) 또는 milestone(M-N) 단위로 호출됐을 때 본 라운드의 P0+P1 결정을 영속 기록하는 자리 (ADR-047 D7 durable correction history + D1 inspectability). `## 2. 즉시 수정할 항목` / `## 3. 권장 리팩토링`과 의미 분리 — 이 두 섹션은 *open items*이고 본 섹션은 *closed records*(지나간 판단).

- task scope (T-NNN) 결정은 해당 task `## 8. 메모`에 직접 append — 본 섹션 아님.
- ID 컨벤션: `<workitem-id>-repair-<N>` (예: `F-001-repair-1`, `M1-repair-2`).
- evidence label은 기본 `[관측됨]` (finding 자체는 리뷰어의 *로컬 문서 관측*에서 나옴 — cross-review 방식의 외부실증은 ADR-038 본문이 owning).
- 형식은 본 파일 `## 항목 스키마` SSOT 따름.

<!-- 마일스톤별 그룹핑(`### M1`, `### M2`)은 `/repair-plan`이 *첫 호출 시* 해당 마일스톤 헤더를 자동 신설하고 그 아래에 append. /stabilize-milestone은 본 sub-section을 *추가하거나 수정하지 않음* — /repair-plan만 직접 append. 본 ## 5 sub-section은 *신설 시 헤더 + 본 안내 주석만* 두고 `### M-N` 그룹은 비워둔다. -->
```

**변경 (after):**

```markdown
## 5. Repair decision log

`/repair-plan`(plan 단계 feature/milestone 결정) 또는 `/repair-milestone`(stabilize 후 milestone-level finding 수정 결정)이 호출됐을 때 본 라운드의 P0+P1 결정을 영속 기록하는 자리 (ADR-047 D7 durable correction history + D1 inspectability). `## 2. 즉시 수정할 항목` / `## 3. 권장 리팩토링`과 의미 분리 — 이 두 섹션은 *open items*이고 본 섹션은 *closed records*(지나간 판단).

- task scope (T-NNN) 결정은 해당 task `## 8. 메모`에 직접 append — 본 섹션 아님. `/repair-milestone`이 per-task 결함을 `/repair-workitem`으로 위임한 경우 그 task 결정 이력도 task `## 8`에 남고, 본 섹션에는 cross-cutting 결정 + "T-NNN으로 위임함" routing 한 줄만 둔다.
- ID 컨벤션: `<workitem-id>-repair-<N>` (예: `F-001-repair-1`, `M1-repair-2`).
- evidence label은 기본 `[관측됨]` (finding 자체는 리뷰어/stabilize의 *로컬 문서·코드 관측*에서 나옴 — cross-review 방식의 외부실증은 ADR-038 본문이 owning).
- 형식은 본 파일 `## 항목 스키마` SSOT 따름.

<!-- 마일스톤별 그룹핑(`### M1`, `### M2`)은 `/repair-plan` 또는 `/repair-milestone`이 *첫 호출 시* 해당 마일스톤 헤더를 자동 신설하고 그 아래에 append. /stabilize-milestone은 본 sub-section을 *추가하거나 수정하지 않음* — /repair-plan·/repair-milestone만 직접 append. 본 ## 5 sub-section은 *신설 시 헤더 + 본 안내 주석만* 두고 `### M-N` 그룹은 비워둔다. -->
```

*Rationale:* `## 5`는 closed records의 SSOT 자리다. milestone scope에서 새로 추가되는 `repair-milestone`도 동일 스키마로 append하므로 ownership 주석에 명시해야 한다(미명시 시 stabilize의 "본 sub-section을 추가/수정하지 않음" 규칙과 충돌해 보일 수 있음). per-task 위임 결정은 task `## 8`이 owning하고 본 섹션은 cross-cutting만 둔다는 분담을 명문화한다.

---

**커밋:**
- `feat(skills): add repair-milestone main-session skill for cross-cutting milestone fixes`
- `docs(improvement-guide): widen section 5 repair-decision-log ownership to repair-milestone`

## Stage 6 — 거버넌스 마감 (ADR + Surfaces/mirror/roster 동기화)

> 이 Stage는 Stage 1–5에서 만든 harness 행동 변경(implement→foreman, validate/stabilize 병렬 fan-out, plan-workitem de-fork, plan-milestone/repair-milestone 신규 skill, NO-merge 결정, 조건부 re-read, wave 제거, stack-guard install provision, e2e provision/smoke + MUST-run hard-block)을 **거버넌스 계층에 박는** 마감 단계다. Locked 방식: **신규 umbrella ADR 2개(ADR-051, ADR-052) + ADR-040 amendment 1개**로 묶고, 그 다음 FORCED surface(ADR-038/047/050/014/019 + README + STRUCTURE + 두 신규 skill의 .agents mirror)를 동기화한다.
>
> 순서 강제: **6.1 → 6.2 → 6.3 → 6.4 → 6.5(체크리스트)**. ADR 본문이 SSOT이므로 ADR을 먼저 박고(6.1–6.3), 그 ADR을 역참조하는 surface를 뒤에(6.4) 박는다. 마지막 6.5 체크리스트는 양방향 정합·mirror parity·roster count를 닫는다.

---

### 6.1 신규 파일 생성 — `docs/90-decisions/boilerplate/ADR-051-main-session-orchestration-and-wave-removal.md`

이 파일은 신규다. 아래 전체 내용을 그대로 작성한다 (생성, before 없음).

````markdown
# ADR-051 — 메인 세션 오케스트레이션(foreman) + 병렬 fan-out + wave 제거

> scope: boilerplate

## Status
accepted

## 대체
- [ADR-050](ADR-050-main-session-lifecycle-skills.md) D1 중 implement-workitem 부분을 **supersede** — implement-workitem은 fork builder 격리가 아니라 *foreman(메인 세션 오케스트레이터)*이 builder 위임을 운전한다. **파일 경계가 분리되면(file-disjoint) 여러 builder를 병렬로, 작거나(파일 ≤~2-3개·RGR 1회) 파일이 겹치면 단일 builder로** 운전한다.
- [ADR-038](ADR-038-cross-llm-plan-validation.md) `## 결정` #d3(parallel waves echo) + #d6(wave별 worktree 병렬 권장)을 **supersede** — plan-workitem은 wave 그룹을 계산·echo하지 않는다. 병렬성은 validate/stabilize *fan-out*으로 이전.

## 배경
- [관측됨] implement-workitem이 `context: fork` + `agent: builder`로 돌면 메인 세션이 구현 흐름을 *직접 운전*하지 못한다 — RGR 사이클 중 사용자 권한 응답·재해석 결정이 fork 경계에 막힌다(ADR-050 D2가 model-invocable로 풀었어도 fork 격리는 잔존).
- [관측됨] plan-workitem이 출력하는 wave 그룹(ADR-038#d3)은 *derived view*인데 사용자가 이를 따라 `claude --worktree`(ADR-038#d6)로 병렬 implement를 시도하면 (a) uncommitted plan 문서 미가시, (b) lockfile/빌드캐시 race, (c) worktree 수동 cleanup 부담이 반복 관측됐다. wave 가시화의 실효 < 병렬 implement의 환경 충돌 비용.
- [관측됨] validate-workitem·stabilize-milestone은 *report-only fan-out*(여러 task·여러 verifier를 동시 점검)이 충돌 위험 없이 안전하다 — 쓰기 격리가 필요 없는 read/판정 작업이라 병렬화 이득이 깨끗하다.
- 기존 규약: ADR-007 lifecycle 8단계, ADR-019 "사전 fork-load 금지 + minimal", ADR-038 parallel waves, ADR-047 D9(workflow topology + shared state), ADR-050(de-fork + model-invocable). 본 ADR은 *병렬성의 위치*를 plan-time wave에서 validate/stabilize fan-out으로 재배치하고 implement 운전권을 foreman으로 옮긴다.

## 결정

### D1. implement-workitem을 foreman 오케스트레이션으로 전환 (ADR-050 D1 implement 부분 supersede)
implement-workitem에서 `context: fork`(및 `agent: builder`)를 제거하고 **메인 세션 foreman**이 실행한다. foreman은 task를 1회 읽어 `## 3. 구현 항목`의 step 파일 경로로 *충돌 없는(file-disjoint) slice*를 싸게 나눈 뒤(`## 9. 의존성`은 자연어 *선행 순서*만 — 5필드 삭제됨), 각 slice를 `Agent`로 **builder에 위임**한다 — **파일 경계가 분리되면 여러 builder를 병렬로, 작거나(파일 ≤~2-3개·RGR 1회)·파일이 겹치면 단일 builder로** 운전한다(과도한 분할 금지 — Stage 2A partition 규칙). 각 builder는 자기 slice의 AC에 대해 RGR을 돌리고, foreman이 결과·`## 4-1`을 *단일 writer*로 병합한다. 무거운 추론의 노이즈 격리는 bootstrap-project의 architect 위임과 동형이되, *동시성*은 file-disjoint slice에서만 적용한다(같은 파일을 쓰는 slice는 순차 또는 worktree).
- foreman은 task 재해석(`Needs Plan Decision`)·권한 응답·`Needs Install`/`Needs Research` 분기를 메인 세션에서 직접 처리한다.
- `context-pack: minimal` 유지. ADR-050 D2(model-invocable)는 그대로 — foreman이 inner-loop를 운전한다.
- **Codex: 병렬 위임 미지원 시 순차 단일 실행으로 degrade** — Codex는 sub-agent parallel parity가 없으므로 builder `Agent` 위임을 *메인 세션 인라인 단일 실행*으로 대체한다(ADR-010 정합, 행동 동일·격리만 없음).

### D2. validate/stabilize 병렬 fan-out (ADR-038 병렬성 위치 재배치)
병렬성은 plan-time wave가 아니라 *report-only 단계의 fan-out*으로 제공한다:
- validate-workitem: 단일 workitem 검증을 **audit axis별**(AC↔테스트 / diff-trace / FAC↔AC spec / Arch-iface 7-x / UI Design-inventory / Evidence Bundle)로 **병렬 fan-out** — 각 validator는 *partial verdict만 반환*하고 **메인이 단일 report(`reports/<task-id>.md`)를 작성**(clobber 방지). 여러 task 동시 검증 시 task별 fan-out도 동형. 읽기·판정뿐이라 write 충돌 없음(작은 diff는 단일 inline validator로 fallback).
- stabilize-milestone: qa·reviewer(code/design surface) 위임을 **병렬 fan-out**.
- 두 단계 모두 report/판정 산출물이라 동시 실행이 git index race·빌드캐시 충돌을 일으키지 않는다(implement 병렬과 결정적 차이).
- **Codex: 병렬 위임 미지원 시 순차 단일 실행으로 degrade** — fan-out 대상 task/verifier를 순차로 1개씩 처리(판정 결과 동일, wall-clock만 길어짐).

### D3. plan-workitem de-fork (ADR-050 D1 패턴 확장)
plan-workitem에서 `context: fork`(및 `agent:`)를 제거해 메인 세션 인라인 실행한다 — planning은 사용자와의 상호작용(sizing·해석 확정·의존성 결정)이 잦아 fork 격리 이득보다 운전권 손실이 크다(ADR-050 D1 de-fork 논거 동형). 무거운 아키텍처 추론은 architect `Agent` 위임 유지.
- `disable-model-invocation`은 **유지**(ADR-050 D2 범위 한정 — plan-workitem은 텍스트 제안 + 사용자 명시 발화 규약 유지).

### D4. plan-milestone 신규 skill
milestone 단위 분해를 plan-workitem에서 분리한 **`/plan-milestone [milestone-id]`** 신규 skill을 신설한다 — milestone → feature 분해 + graduation 기준(ADR-014 5+1) authoring을 책임진다. plan-workitem은 feature → task 분해에 집중(역할 경계 명확화).
- `disable-model-invocation: true` + 메인 세션 실행(fork X) + architect `Agent` 위임. `.claude` + `.agents` 양 mirror 신설.

### D5. wave echo + worktree 병렬 권장 제거 (ADR-038 #d3·#d6 supersede)
plan-workitem은 더 이상 `## 9. 의존성`을 위상정렬한 wave 그룹을 echo하지 않으며, `claude --worktree` 병렬 implement 권장도 출력하지 않는다.
- `## 9. 의존성` 5필드(`depends_on`/`read_set`/`write_set`/`assumptions`/`verifier`)는 wave 전용 스키마(ADR-047 D9 "opt-in 병렬 wave 한정")라 **전부 삭제**한다(사용자 결정 — 완전 제거 + YAGNI). foreman의 file-disjoint 분할은 `## 3` step 파일 경로로 결정(write_set 불필요 — 아래 D6). 남는 것은 plain 자연어 의존성 선언뿐.
- `.gitignore`의 `.claude/worktrees/` 패턴은 잔존 무해라 *삭제하지 않는다*(Surgical — ADR-006). 단 ADR-038 면책 단락(동시 implement 환경 책임)은 ADR-038에 영속한 채 "병렬 implement 비권장"으로 status note만 단다.

### D6. ADR-047 D9 re-anchor (foreman `## 3` step-path partition)
ADR-047 D9(Optimized Workflow Topology + Shared State)의 적용 SSOT를 *plan-workitem wave 계산*에서 **foreman의 intra-task partition**으로 재anchor한다 — foreman이 한 task를 `## 3. 구현 항목`의 step 파일 경로로 나눠 *file-disjoint slice는 병렬 builder, 겹치거나 작으면 단일/순차*로 운전한다. TASK_TEMPLATE `## 9` 5필드(`write_set` 등) 구조화 스키마와 ADR-038#amend-3 write_set wave 분리 메커니즘은 wave 전용이라 **ADR-051 #d5가 함께 폐지**한다(사용자 결정 — 완전 제거). 즉 D9의 *개념*(워크플로 토폴로지 최적화)은 foreman 분할로 계승하되 *명시적 write_set 스키마는 쓰지 않는다*.

### D7. NO-merge 결정 (기록)
**병렬 작업 결과의 자동 코드 merge를 본 보일러플레이트가 제공·전제하지 않는다** — validate/stabilize fan-out은 *독립 report-only 산출물*(task별 report, QA_FINDINGS/IMPROVEMENT_GUIDE 누적)이라 merge할 shared write 산물이 없다. implement foreman의 병렬 builder는 **file-disjoint slice에만** 띄우므로 *같은 파일을 동시에 쓰지 않는다* → 코드 merge 자체가 발생하지 않고, foreman은 `## 4-1` 파일목록(메타데이터)만 단일 writer로 병합한다. 제거된 것은 *cross-task* plan-time wave + `claude --worktree` 멀티세션 implement(D5)이며, *intra-task* foreman 분할은 disjoint 보장으로 merge-free다. fork 사용자가 disjoint를 깨는 자체 병렬 전략을 둔다면 환경 책임(ADR-038 면책 단락 정신 계승).

### D8. 조건부 re-read (ADR-019 amend)
foreman/fan-out 도입으로 메인 세션이 inner-loop를 여러 라운드 운전하면, 매 라운드 전체 task/feature 문서를 재로딩하면 컨텍스트 낭비다. ADR-019 minimal/JIT 정책을 *조건부 re-read*로 좁힌다 — **직전 라운드에서 이미 로드한 문서는 mtime/판정 변경 신호가 있을 때만 재읽기**(예: repair 후 task `## 8. 메모` 갱신, validate report 신규 생성). 변경 신호 없으면 in-context 버전 재사용. 본 정책은 ADR-019 `## Amendment 1`로 박는다(아래 Surfaces).

## Mutation Contract (ADR-047 D3)
1. **Target** — `.claude/skills/{implement-workitem,plan-workitem,validate-workitem,stabilize-milestone}/SKILL.md` frontmatter·본문(foreman/fan-out/de-fork/wave 제거); `.claude/skills/plan-milestone/SKILL.md` 신규; ADR-038 #d3·#d6·`## 현재 유효 결정`·`## Surfaces`; ADR-047 D9 anchor 단락; ADR-050 status/supersede note; ADR-019 `## Amendment 1`; WORKFLOW.md·DELEGATION_STRATEGY.md 병렬·운전권 단락; STRUCTURE.md roster.
2. **Failure mode** — fork 격리로 메인이 implement inner-loop를 직접 운전 불가; plan-time wave + worktree 병렬 implement가 lockfile/빌드캐시 race·uncommitted plan 미가시·수동 cleanup 부담을 반복 유발(관측됨); 매 라운드 full re-read로 컨텍스트 낭비.
3. **Predicted improvement** — foreman 운전권 확보(권한·재해석 즉시 처리), 병렬성 위치를 충돌 없는 report-only fan-out으로 이동해 race 사고 0건화, 조건부 re-read로 라운드당 토큰 절감.
4. **Preserved invariants** — lifecycle 8단계 책임 경계·validate report 양식·signal-first cap·ADR-050 D2 model-invocable 범위·`## 9. 의존성`의 *자연어 의존성 선언*. **단, ADR-038 #d3·#d6(plan-time wave echo + worktree 병렬 implement) + #amend-3(write_set 결정적 wave 분리) + TASK_TEMPLATE `## 9` 5필드 구조는 본 ADR D5가 의도적으로 *제거*(소비처 이전이 아니라 폐지 — wave 전용 스키마)**; ADR-050 D1 implement 부분은 D1이 supersede.
5. **Falsifying evaluation** — ADR-017 dogfood 재실행에서 (a) foreman 운전이 *원치 않는 자동 연쇄*(사용자 확인 전 다음 task 진행)를 일으키거나, (b) fan-out 순차 degrade(Codex)에서 판정 누락이 생기면 D1·D2 범위 재검토.
6. **Rollback path** — 본 ADR superseded → ADR-050 D1(implement fork) + ADR-038 #d3·#d6·#amend-3(wave echo + worktree + write_set wave 분리) + TASK_TEMPLATE `## 9` 5필드 + ADR-026 Surfaces 5필드 줄 복원, plan-milestone skill 제거(양 mirror), ADR-019 `## Amendment 1` 철회.

## 정책 강도 (ADR-022)
- D1·D3·D4·D8: enabling(약) — 운전권/역할/토큰 개선. D2: enabling(약) — 병렬 fan-out opt-in 가속. D5·D7: constraint 완화 + 제거(약) — 병렬 implement 권장 철회(자동 차단 없던 권장이라 강도 약). D6: 정정성 re-anchor(행동 불변, 소비처 명문화).

## 결과
- implement는 foreman이 메인 세션에서 운전(file-disjoint slice는 병렬 builder, 작거나 겹치면 단일), plan-workitem/plan-milestone는 메인 세션 분해, 병렬성은 *intra-task foreman 분할* + validate/stabilize report-only fan-out으로 제공, *cross-task* plan-time wave + worktree 멀티세션 implement는 제거.
- ADR-038은 cross-LLM plan validation(`/validate-plan`+`/repair-plan`) 정책만 유효로 잔존, 병렬 wave 부분은 superseded.
- ADR-050 D1 implement 부분 + ADR-038 #d3·#d6 supersede 기록, ADR-047 D9·ADR-019는 amend로 정합.

## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT. ADR-045 정합 — 실제 파일 경로 1행 1개, 생략·comma-join 금지)
- .claude/skills/implement-workitem/SKILL.md                      — D1 foreman 전환(de-fork + 병렬/단일 builder 위임: file-disjoint면 병렬)
- .claude/skills/plan-workitem/SKILL.md                           — D3 de-fork + D5 wave/worktree echo 제거
- .claude/skills/plan-milestone/SKILL.md                          — D4 신규 skill
- .claude/skills/validate-workitem/SKILL.md                       — D2 병렬 fan-out
- .claude/skills/stabilize-milestone/SKILL.md                     — D2 병렬 fan-out (qa·reviewer)
- .agents/skills/plan-milestone/SKILL.md                          — D4 Codex wrapper (신규)
- .agents/skills/plan-milestone/agents/openai.yaml                — D4 Codex wrapper policy (신규)
- docs/00-meta/WORKFLOW.md                                        — foreman 운전권 + fan-out + wave 제거 단락
- docs/00-meta/DELEGATION_STRATEGY.md                             — foreman/builder 위임 트리거 + 병렬 fan-out + Codex degrade 노트
- docs/00-meta/STRUCTURE.md                                       — skill roster 18→20 + 생성 주체 컬럼 + Codex wrapper 인벤토리
- docs/90-decisions/boilerplate/ADR-038-cross-llm-plan-validation.md  — #d3·#d6 superseded note + status note
- docs/90-decisions/boilerplate/ADR-047-code-as-agent-harness.md      — D9 re-anchor(foreman `## 3` step-path partition; write_set 5필드 스키마 폐지)
- docs/90-decisions/boilerplate/ADR-026-plan-workitem-schema.md       — Surfaces line 55(`## 9` 5필드) 제거 (5필드 삭제 정합)
- docs/90-decisions/boilerplate/ADR-050-main-session-lifecycle-skills.md — D1 implement 부분 supersede note
- docs/90-decisions/boilerplate/ADR-019-context-packs-and-jit.md      — `## Amendment 1` 조건부 re-read

## 참고
- ADR-007(lifecycle), ADR-014(graduation — plan-milestone가 5+1 authoring), ADR-019(context-pack — 조건부 re-read amend), ADR-026(plan schema — `## 9` 5필드 *삭제*, 자연어 의존성만; Surfaces line 55 제거), ADR-038(cross-LLM plan + wave supersede), ADR-040(researcher 위임 — foreman이 호출), ADR-046(signal-first), ADR-047(harness mutation + D9), ADR-050(de-fork + model-invocable — D1 implement 부분 supersede).
- Ning et al. 2026, *Code as Agent Harness* (arXiv:2605.18747v1) §4.1.3 (Optimized Workflow Topology) — 병렬성 위치 재배치의 survey-level 근거.
````

---

### 6.2 신규 파일 생성 — `docs/90-decisions/boilerplate/ADR-052-stack-provisioning-and-e2e-readiness.md`

이 파일은 신규다. 아래 전체 내용을 그대로 작성한다 (생성, before 없음).

````markdown
# ADR-052 — 스택 프로비저닝(install) + E2E readiness

> scope: boilerplate

## Status
accepted

## 배경
- [관측됨] stack-guard는 검증 wiring(`validate`/`validate:e2e`)만 생성하고 *baseline toolchain·e2e 브라우저를 직접 설치하지 않는다* → 검증 실행 시 미설치 라이브러리(biome/tsc/vitest/@playwright/test)·Playwright 브라우저로 에러가 반복 발생한다(**사용자 보고 root cause**). per-task 패키지 설치(implement, ADR-040#amend-1)는 있으나 *스택 baseline provision* 게이트가 부재.
- [관측됨] E2E 명령(`validate:e2e`)은 stack-guard가 *wiring*만 분리해 두고(현행: e2e는 task finalize 제외·milestone stabilize만 실행), 실제 *provision(외부 의존 부트업) + smoke*가 readiness gate로 강제되지 않는다 → milestone graduation 직전에야 E2E 미설정/미통과가 드러난다.
- [관측됨] graduation checklist(ADR-014 #1 item 3 `E2E Pass (스택에 정의된 경우)`)의 *"정의된 경우"* 단서가 E2E 미정의 스택을 *통과*시켜, E2E가 필요한 스택에서도 readiness 없이 졸업이 가능하다.
- 기존 규약: ADR-025(외부 의존 권장 + CI 권장), ADR-040#amend-1(install authoring=plan / 실행=implement), ADR-014(graduation 5+1). 본 ADR은 stack-guard에 baseline install provision + 정합 검증 boundary를 추가하고 E2E readiness를 hard-block으로 승격한다.

## 결정

### D1. stack-guard install provision (정책 반전 — install-by-default + install-ownership boundary)
stack-guard에 **install provision 단계**를 신설한다 — 스택 확정/재실행 시 stack-guard가 *직접* 패키지 매니저 install(`pnpm install`/`npm install`/`pip install` 등)을 실행해 authored toolchain(format/lint/typecheck/test devDeps)을 provision하고, UI/web 프로젝트(ADR-027#amend-3 신호)면 `npx playwright install`로 e2e 브라우저까지 설치한다. 설치 후 manifest↔lockfile↔설치 모듈 정합을 검증한다. **이는 stack-guard *본문 정책* "기본 설치 안 함"(소유 ADR 없는 skill-body 정책)을 *의도적으로 반전*하고, ADR-025의 "강제 X 권장만"(외부 의존 부트업·CI 파일 한정) stance를 *baseline toolchain install까지 확장*한다 — ADR-025는 toolchain 설치를 소유하지 않으므로 ADR-025에 대해서는 '반전'이 아니라 '확장'이다** — 검증 시 라이브러리/브라우저 미설치로 인한 에러가 반복 관측됐기 때문(사용자 결정 Q3).
- **Graceful fallback (skip 아님 — blocker)**: 네트워크/사용자 승인/lockfile 충돌/monorepo workspace 라우팅/sandbox 정책으로 설치가 *실제 실패*하면 fabricate·우회하지 않고 `Needs Install: <명령> — 메인 세션/사용자 실행 필요`를 출력하고 가능한 산출(진입점·config·verify 스크립트)은 계속 생성한다(implement-workitem ADR-040#amend-1 패턴 동형). 즉 조용히 넘어가지 않고 *blocker*로 남긴다.
- **install-ownership boundary 명문화**: *어떤 패키지를 추가할지 결정(authoring)* = plan-workitem(ADR-040#amend-1), *task 구현 중 그 task가 추가하는 패키지를 설치(per-task 실행)* = implement-workitem/foreman(ADR-040#amend-1), ***스택 baseline toolchain·e2e tooling을 검증 전에 직접 install/provision + 정합 검증*** = stack-guard(본 D1). 셋은 충돌하지 않는다 — authoring / per-task 실행 / 스택 baseline provision의 3분할(ADR-040 패턴 계승, ADR-025 wiring 책임 확장).

### D2. E2E provision + smoke
stack-guard에 **E2E provision/smoke 단계**를 신설한다 — `validate:e2e` 명령이 의존하는 외부 리소스(DB/Redis/S3 등 — ADR-025 부트업 권장 대상)의 *provision 절차*를 STACK_SETUP_PLAN에 기록하고, e2e harness가 *최소 1개 smoke*로 wiring 검증(앱 부팅 + 1개 시나리오)을 통과하는지 점검한다. wiring 검증 목적(stack-guard 기존 smoke test 정신 계승) — 프로젝트 자체 E2E 통과 여부와 분리 보고.

### D3. E2E MUST-run hard-block (ADR-014 graduation item 3 amend)
ADR-014 graduation checklist item 3 `E2E Pass (스택에 정의된 경우)`를 **`E2E Pass (E2E-applicable 스택은 MUST, exit code 0)`**로 강화한다.
- *E2E-applicable* 판정: STACK_SETUP_PLAN에 `validate:e2e` 명령 또는 E2E provision 항목이 *존재*하면 MUST-run — 미통과 시 graduation pre-check `졸업 가능: NO` **hard-block**(기존 "정의된 경우"의 soft-pass 제거).
- *E2E-not-applicable*(`validate:e2e` 미설정 + provision 항목 없음 — 예: 순수 라이브러리/CLI 스택): 기존대로 *해당 없음=통과*. 단 stack-guard가 "E2E 미설정 — applicable 스택이면 설정 권장" 1줄 echo.
- 본 D3은 ADR-014 `## Amendment 2`로 박는다(아래 Surfaces).

### D4. repair-milestone 신규 skill
milestone graduation hard-block(D3) 미통과 + cross-stabilize 회귀 신호를 *milestone 단위로 회수·repair*하는 **`/repair-milestone [milestone-id]`** 신규 skill을 신설한다 — stabilize가 보고한 P0/P1(graduation 미충족·E2E 미통과·회귀)을 4-판정(Adopt/Adopt-modified/Reject-false-positive/Reject-context, repair-plan/repair-workitem 동형)으로 점검한다. **repair-workitem과 동형으로 코드 수정이 허용된다**(사용자 결정 Q2 — Stage 5B): 단일 task로 격리되는 결함은 `/repair-workitem T-NNN`으로 라우팅하고, *cross-cutting hotfix·E2E wiring*(여러 task에 걸리지 않는 e2e config/scaffold 등)은 직접 수정한다. **단, 자동 커밋·workitem status 변경은 하지 않는다** — commit/status 소유권은 finalize/사용자에 유지(repair-workitem 패턴 계승 — 외부 리뷰가 지적한 ownership 우려를 no-commit/no-status로 차단). 결정 이력은 IMPROVEMENT_GUIDE `## 5. Repair decision log`의 `### M-N`(`M1-repair-N`)에 기록.
- `disable-model-invocation: true` + 메인 세션 실행(fork X). `.claude` + `.agents` 양 mirror 신설.

## Mutation Contract (ADR-047 D3)
1. **Target** — `.claude/skills/stack-guard/SKILL.md`(install provision + e2e provision/smoke); `.claude/skills/stabilize-milestone/SKILL.md`(graduation pre-check item 3 hard-block); `.claude/skills/repair-milestone/SKILL.md` 신규; ADR-014 `## Amendment 2` + `## Surfaces`; ADR-025·ADR-040 boundary 참조; STRUCTURE.md roster.
2. **Failure mode** — 선언↔설치 drift가 스택 확정 시점에 미검출; E2E provision/smoke 미강제로 readiness 없이 milestone 졸업; graduation item 3 soft-pass가 E2E-applicable 스택을 무점검 통과(관측됨).
3. **Predicted improvement** — stack-guard install provision으로 누락 의존(toolchain·Playwright 브라우저) 선설치 → 검증 에러 root cause 제거 + 선언↔설치 drift 조기 검출, e2e smoke로 readiness gate 전진, graduation hard-block으로 E2E-applicable 스택 졸업 누락 0건.
4. **Preserved invariants** — stack-guard wiring/프로젝트 책임 분리(프로젝트 *실 코드 위반*은 여전히 stack-guard가 차단 안 함 — provision·wiring까지만), ADR-040#amend-1 per-task install authoring/실행(stack-guard는 *baseline provision*을 추가), stabilize 코드·커밋·status 금지(repair-milestone가 코드 수정을 담당하되 commit/status는 미수행). **단 두 정책은 의도적으로 변경: (a) stack-guard *본문 정책* "기본 설치 안 함"(소유 ADR 없음)을 본 ADR D1이 *반전* + ADR-025 "강제 X 권장만"(외부 의존·CI 한정) stance를 toolchain install로 *확장*(ADR-025는 toolchain 설치 미소유이므로 반전 아님) — stack-guard가 baseline toolchain·e2e를 직접 install(실패 시 Needs Install blocker); (b) ADR-014 item 3 soft-pass는 D3가 E2E-applicable 스택 한정 hard-block으로 강화**.
5. **Falsifying evaluation** — ADR-017 dogfood 재실행에서 E2E-applicable 판정이 *순수 라이브러리 스택을 오탐(false MUST)*해 정상 졸업을 막으면 D3 판정 기준 재검토; install provision이 sandbox/네트워크 차단(일시적)을 *영구 fail*로 오인해 정상 진행을 막으면 D1을 권장-only(Needs Install 출력만)로 되돌림.
6. **Rollback path** — 본 ADR superseded → stack-guard install provision·e2e provision/smoke 단계 제거(기존 "기본 설치 안 함" 복원), ADR-014 item 3 "정의된 경우" 복원(`## Amendment 2` 철회), repair-milestone skill 제거(양 mirror).

## 정책 강도 (ADR-022)
- D1·D2: enabling→install-by-default + 실패 시 blocker(약~중 — 설치를 *수행*하되 실패를 fabricate 않고 Needs Install로 막음, 자동 차단은 설치 실패 시에만). D4: enabling(약) — repair 라우팅 + 코드 수정(커밋·status X). D3: constraint(강) — E2E-applicable 스택에 graduation hard-block. **Evidence label**: `[관측됨]`(미설치발 검증 에러·readiness 미검출 관측) + ADR-014 [외부실증] 계승.

## 결과
- stack-guard가 baseline toolchain·e2e를 직접 install/provision(실패 시 Needs Install blocker) + 선언↔설치 정합 검증(authoring/per-task실행/baseline provision 3분할), e2e provision/smoke가 readiness gate로 전진, E2E-applicable 스택은 graduation hard-block, repair-milestone가 milestone 단위 repair(코드 수정 포함, 커밋·status X)를 담당.

## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT. ADR-045 정합 — 실제 파일 경로 1행 1개, 생략·comma-join 금지)
- .claude/skills/stack-guard/SKILL.md                             — D1 install provision + D2 e2e provision/smoke
- .claude/skills/stabilize-milestone/SKILL.md                     — D3 graduation pre-check item 3 hard-block
- .claude/skills/repair-milestone/SKILL.md                        — D4 신규 skill
- .agents/skills/repair-milestone/SKILL.md                        — D4 Codex wrapper (신규)
- .agents/skills/repair-milestone/agents/openai.yaml              — D4 Codex wrapper policy (신규)
- docs/30-workitems/_templates/MILESTONE_TEMPLATE.md              — D3 `## 5. 완료 기준` item 3 문구 강화
- docs/00-meta/STRUCTURE.md                                       — skill roster 18→20 + 생성 주체 컬럼 + Codex wrapper 인벤토리
- docs/90-decisions/boilerplate/ADR-014-milestone-graduation.md   — `## Amendment 2` + Surfaces add
- docs/90-decisions/boilerplate/ADR-025-external-deps-and-ci-recommendation.md — install/e2e boundary 참조 note
- docs/90-decisions/boilerplate/ADR-040-external-research-capability.md — install-ownership 3분할 boundary 참조 note

## 참고
- ADR-014(graduation — item 3 hard-block amend), ADR-025(외부 의존 + CI 권장 — install/e2e provision 확장), ADR-040(install authoring/실행 — stack-guard 검증 추가로 3분할), ADR-047(harness mutation + D1 Executability), ADR-050(de-fork — repair-milestone 메인 세션 정합), ADR-051(foreman/fan-out — stabilize fan-out과 정합).
````

> 근거: ADR-052 D3는 ADR-014의 *정책 의미 변경*(soft-pass→hard-block)이라 ADR-014 amend로 박되, install provision·e2e provision·repair-milestone를 묶는 umbrella는 신규 ADR(surface 5+ — _ADR_GUIDE amend/supersede 기준).

---

### 6.3 ADR-040 `## Amendment 2` 추가 (researcher 자율성 — install-ownership 정합)

파일: `docs/90-decisions/boilerplate/ADR-040-external-research-capability.md`

**현재 (before):** — 파일 끝 `## Amendment 1` 블록의 마지막 줄을 anchor로 삼아 *그 뒤에 append*한다.

```markdown
### 적용 surface
- .claude/skills/plan-workitem/SKILL.md       — 의존성 설치 line item authoring
- .claude/skills/implement-workitem/SKILL.md  — 의존성 설치 line item 처리
- docs/30-workitems/_templates/TASK_TEMPLATE.md — `## 3` 주석(설치 단계 형식)
```

**변경 (after):** — 위 블록은 그대로 두고, 파일 맨 끝에 다음 블록을 *추가*한다.

```markdown
### 적용 surface
- .claude/skills/plan-workitem/SKILL.md       — 의존성 설치 line item authoring
- .claude/skills/implement-workitem/SKILL.md  — 의존성 설치 line item 처리
- docs/30-workitems/_templates/TASK_TEMPLATE.md — `## 3` 주석(설치 단계 형식)

<a id="adr-040-amend-2"></a>
## Amendment 2 (2026-06-25) — researcher 자율성 + install-ownership 3분할 boundary

### 결정
1. **researcher 자율성 명문화**: implement-workitem이 foreman으로 전환(ADR-051 D1)되면서, foreman은 라이브러리 *API 사용법 불확실*(ADR-040#amend-1 `Needs Research`) 시 builder를 멈추고 *메인 세션에서 직접 researcher에 `Agent` 위임*한다 — builder 컨텍스트 오염 회피(ADR-040 #5 위임 경로 계승). researcher는 report-only 유지(Write 없음).
2. **install-ownership 3분할 boundary**: 의존성 *authoring*(어떤 패키지 — plan, #amend-1) / *실행*(task 구현 중 설치 — implement·foreman, #amend-1) / *검증*(스택 선언↔설치 정합 회수 — stack-guard, ADR-052 D1)의 3분할을 명문화한다. researcher는 이 셋 중 *어디에도* 설치 권한을 갖지 않는다 — 버전·사용법 *조사*만(report-only 불변).

### 강도 (ADR-022)
- enabling(약). researcher report-only constraint(약) 불변. install-ownership 3분할은 정정성 명문화(행동 불변).

### 적용 surface
- .claude/skills/implement-workitem/SKILL.md   — foreman의 researcher 위임 경로(ADR-051 D1 정합)
- .claude/skills/stack-guard/SKILL.md          — install 검증 boundary(ADR-052 D1 정합)
- docs/90-decisions/boilerplate/ADR-052-stack-provisioning-and-e2e-readiness.md — 3분할 boundary owning ADR
```

> 근거: 단순 boundary 명문화 + surface 1~2개 추가라 신규 ADR이 아닌 amend(_ADR_GUIDE amend 기준). README Amendments 컬럼 갱신 필요(6.4 참조).

---

### 6.4 FORCED surface 동기화 (ADR가 먼저 박힌 뒤)

#### 6.4.1 ADR-038 — #d3·#d6 superseded note + status note

파일: `docs/90-decisions/boilerplate/ADR-038-cross-llm-plan-validation.md`

**(a) status note 추가 — `## Status` 블록**

**현재 (before):**
```markdown
## Status
accepted
```

**변경 (after):**
```markdown
## Status
accepted (부분 superseded — #d3 parallel waves echo + #d6 worktree 병렬 implement + #amend-3 write_set wave 분리는 [ADR-051](ADR-051-main-session-orchestration-and-wave-removal.md)이 supersede. cross-LLM plan validation 정책은 유효 유지.)
```

**(b) `## 현재 유효 결정` — wave 줄 정정**

**현재 (before):**
```markdown
- `/plan-workitem`이 `## 9. 의존성` 위상정렬 wave 그룹을 echo(영속 저장 X). 병렬 implement는 `claude --worktree T-NNN` 권장.
```

**변경 (after):**
```markdown
- ~~`/plan-workitem`이 `## 9. 의존성` 위상정렬 wave 그룹을 echo. 병렬 implement는 `claude --worktree` 권장~~ → **[ADR-051](ADR-051-main-session-orchestration-and-wave-removal.md) #d5가 supersede** — wave echo·worktree 병렬 implement 권장 제거. 병렬성은 validate/stabilize report-only fan-out(ADR-051 #d2)으로 이전. `## 9. 의존성` 5필드 구조는 ADR-051 #d5가 *삭제*(wave 전용 스키마) — foreman은 `## 3` step 경로로 분할.
```

**(c) `### D3` 헤딩에 supersede 표식**

**현재 (before):**
```markdown
### D3. /plan-workitem에 parallel waves 출력 추가
```

**변경 (after):**
```markdown
### D3. /plan-workitem에 parallel waves 출력 추가 — superseded by [ADR-051](ADR-051-main-session-orchestration-and-wave-removal.md) #d5 (wave echo 제거; `write_set` 5필드 스키마는 ADR-051 #d5가 폐지 — foreman은 `## 3` 경로 분할)
```

**(d) `### D6` 헤딩에 supersede 표식**

**현재 (before):**
```markdown
### D6. Wave 그룹 병렬 implement 시 worktree 권장
```

**변경 (after):**
```markdown
### D6. Wave 그룹 병렬 implement 시 worktree 권장 — superseded by [ADR-051](ADR-051-main-session-orchestration-and-wave-removal.md) #d5 (병렬 implement 권장 철회; 면책 단락은 환경 책임으로 잔존)
```

> #d1·#d2·#d4·#d5(cross-LLM validate/repair-plan)와 면책 단락은 유효 유지 — `## Surfaces`는 그대로 둔다(ADR-038 자기 Surfaces는 cross-LLM 정책 surface라 불변).

---

#### 6.4.2 ADR-047 — D9 re-anchor

파일: `docs/90-decisions/boilerplate/ADR-047-code-as-agent-harness.md`

**현재 (before):**
```markdown
- 본 보일러의 적용: TASK_TEMPLATE `## 9. 의존성` 5필드 구조화 (opt-in, 병렬 wave 한정 — `depends_on` / `read_set` / `write_set` / `assumptions` / `verifier`) + plan-workitem wave 계산 (write_set 교집합 시 자동 wave 분리, 자연어 grep fallback 유지). 적용 surface SSOT: ADR-026 (TASK_TEMPLATE schema) + ADR-038#amend-3 (deterministic write_set 회수).
```

**변경 (after):**
```markdown
- 본 보일러의 적용: **implement-workitem foreman의 file-disjoint slice partition** — foreman이 한 task를 `## 3. 구현 항목`의 step 파일 경로로 나눠 *충돌 없는 slice는 병렬 builder, 겹치거나 작으면 단일/순차*로 운전한다(ADR-051 #d6 re-anchor). **plan-time wave 계산·echo + TASK_TEMPLATE `## 9` 5필드 구조화(`write_set` 등) + ADR-038#amend-3 write_set 메커니즘은 ADR-051 #d5가 *폐지*** (wave 전용 스키마 — 사용자 결정 완전 제거). 적용 surface SSOT: ADR-051 #d6(foreman `## 3`-path partition). (ADR-026 `## 9` 5필드 Surfaces 줄도 동시 제거 — §6.4.2b.)
```

> ADR-047 `## Surfaces`의 `plan-workitem — D9 적용 (wave 계산 write_set 우선)` 줄은 plan-workitem이 더 이상 wave 계산을 하지 않으므로 implement-workitem(foreman)으로 이전한다.

**현재 (before):**
```markdown
- .claude/skills/plan-workitem/SKILL.md                                              — D9 적용 (wave 계산 `write_set` 우선)
```

**변경 (after):**
```markdown
- .claude/skills/implement-workitem/SKILL.md                                         — D9 적용 (foreman `## 3` step-path partition — ADR-051 #d6 re-anchor)
```

---

#### 6.4.2b ADR-026 — Surfaces line 55 제거 (5필드 삭제 정합)

파일: `docs/90-decisions/boilerplate/ADR-026-plan-workitem-schema.md`

5필드 구조화 스키마를 TASK_TEMPLATE에서 삭제(Stage 1A §3-1)하므로 ADR-026 `## Surfaces`의 5필드 줄을 제거한다. `### 3. ## 9. 의존성 신설`(자연어 형식)·Surfaces의 base AC 줄·plan-workitem 줄은 유지(자연어 의존성·AC 구조화는 잔존).

**현재 (before):**
```
## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT)
- docs/30-workitems/_templates/TASK_TEMPLATE.md   — AC 구조화 (base)
- docs/30-workitems/_templates/TASK_TEMPLATE.md   — ## 9 의존성 구조화 5필드 (opt-in, ADR-047 D9 workflow topology 정합)
- .claude/skills/plan-workitem/SKILL.md            — #amend-1 planner self-check + architect 신호 + sizing
```

**변경 (after):**
```
## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT)
- docs/30-workitems/_templates/TASK_TEMPLATE.md   — AC 구조화 (base)
- .claude/skills/plan-workitem/SKILL.md            — #amend-1 planner self-check + architect 신호 + sizing
```

> Rationale: 해당 Surfaces 줄은 ADR-051 #d5가 삭제한 wave-전용 5필드 스키마를 가리켜 stale. 제거로 ADR-026 Surfaces를 실제 상태와 정합화(ADR-045 Surface-backref 정합). ADR-026 amend 수는 불변(Surfaces 줄 제거는 amendment가 아님 — boilerplate/README 인덱스 amend 컬럼 갱신 불요).

**(b) ADR-051 backref 추가 (ADR-045#d4 양방향 정합)** — ADR-026이 ADR-051 `## Surfaces`에 등재되므로 ADR-026 본문에 `ADR-051` 역참조 1줄을 `## 참고`에 추가한다(없으면 stabilize Surface-backref preflight가 P1로 잡는다).

**현재 (before):**
```
## 참고
- ADR-009 (TDD default)
- ADR-007 (workitem lifecycle)
- ADR-022 (Ratchet Principle)
```

**변경 (after):**
```
## 참고
- ADR-009 (TDD default)
- ADR-007 (workitem lifecycle)
- ADR-022 (Ratchet Principle)
- ADR-051 (`## 9` 5필드 스키마 제거 — wave 완전 제거 정합)
```

---

#### 6.4.3 ADR-050 — status/supersede note

파일: `docs/90-decisions/boilerplate/ADR-050-main-session-lifecycle-skills.md`

**(a) `## Status` 블록**

**현재 (before):**
```markdown
## Status
accepted
```

**변경 (after):**
```markdown
## Status
accepted (부분 superseded — D1의 implement-workitem 부분은 [ADR-051](ADR-051-main-session-orchestration-and-wave-removal.md) D1이 foreman 오케스트레이션으로 supersede. de-fork 나머지·D2 model-invocable·D3는 유효 유지.)
```

**(b) `### D1` 헤딩 — implement 부분 supersede 표식**

**현재 (before):**
```markdown
### D1. 일부 lifecycle skill을 메인 세션 실행으로 전환
```

**변경 (after):**
```markdown
### D1. 일부 lifecycle skill을 메인 세션 실행으로 전환 — implement-workitem 부분 superseded by [ADR-051](ADR-051-main-session-orchestration-and-wave-removal.md) D1 (fork builder → foreman 병렬/단일 builder 위임: file-disjoint면 병렬, 작거나 겹치면 단일)
```

> ADR-050의 `## 결정` D1 본문(`implement-workitem·finalize-workitem은 fork 유지` 단락)은 ADR-051 D1이 implement만 foreman으로 옮기고 finalize는 fork 유지하므로, finalize 부분은 불변. 본 supersede note로 충분 — 본문 단락 자체는 ADR-051이 SSOT를 가져가므로 ADR-006 Surgical상 추가 본문 편집 안 함.

---

#### 6.4.4 ADR-014 — `## Amendment 2` + Surfaces add

파일: `docs/90-decisions/boilerplate/ADR-014-milestone-graduation.md`

**(a) graduation item 3에 amend 포인터 (in-place note)**

**현재 (before):**
```markdown
3. E2E Pass (스택에 정의된 경우)
```

**변경 (after):**
```markdown
3. E2E Pass (E2E-applicable 스택은 MUST — exit code 0; #amend-2가 "정의된 경우" soft-pass를 강화)
```

**(b) `## Surfaces` — stack-guard 추가**

**현재 (before):**
```markdown
## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT)
- .claude/skills/stabilize-milestone/SKILL.md         — #d3 graduation pre-check §1.5, #amend-1 evaluator-optimizer 1줄
- docs/30-workitems/_templates/MILESTONE_TEMPLATE.md  — #d1 §5 완료기준 5+1, #d2 §8 회고
- docs/00-meta/DELEGATION_STRATEGY.md                 — #amend-1 evaluator-optimizer 1줄
```

**변경 (after):**
```markdown
## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT)
- .claude/skills/stabilize-milestone/SKILL.md         — #d3 graduation pre-check §1.5, #amend-1 evaluator-optimizer 1줄, #amend-2 E2E MUST-run hard-block
- .claude/skills/stack-guard/SKILL.md                 — #amend-2 E2E-applicable 판정(provision/smoke) — ADR-052 D2 정합
- docs/30-workitems/_templates/MILESTONE_TEMPLATE.md  — #d1 §5 완료기준 5+1, #d2 §8 회고, #amend-2 item 3 MUST 문구
- docs/00-meta/DELEGATION_STRATEGY.md                 — #amend-1 evaluator-optimizer 1줄
```

**(c) 파일 끝에 `## Amendment 2` append** — 현재 파일 마지막 줄은 `없음 — citation 추가만.`이다.

**현재 (before):**
```markdown
### 후속 작업

없음 — citation 추가만.
```

**변경 (after):**
```markdown
### 후속 작업

없음 — citation 추가만.

<a id="adr-014-amend-2"></a>
## Amendment 2 (2026-06-25) — E2E MUST-run hard-block (ADR-052 D3)

### 결정
graduation checklist item 3 `E2E Pass (스택에 정의된 경우)`의 *soft-pass*("정의된 경우"만 평가)를 **E2E-applicable 스택 한정 hard-block**으로 강화한다.
- *E2E-applicable* = STACK_SETUP_PLAN에 `validate:e2e` 명령 또는 E2E provision 항목 존재. 이 경우 미통과(exit code ≠ 0 또는 미설정) 시 graduation pre-check `졸업 가능: NO` **hard-block**.
- *E2E-not-applicable*(`validate:e2e` 미설정 + provision 항목 없음) = 기존대로 *해당 없음=통과*. stack-guard가 "applicable 스택이면 설정 권장" 1줄 echo(ADR-052 D2).

### 근거
- [관측됨] "정의된 경우" soft-pass가 E2E-applicable 스택을 무점검 통과시켜 readiness 없이 졸업 가능. E2E readiness 판정 SSOT는 stack-guard provision/smoke(ADR-052 D2)로 이전.

### 강도 (ADR-022)
- constraint(강) — E2E-applicable 스택에 graduation hard-block. ADR-014 본래 5+1 contract 정신 계승(졸업 모호성 제거).

### 적용 surface
- .claude/skills/stabilize-milestone/SKILL.md         — 1.5 Graduation pre-check item 3 E2E MUST-run hard-block
- .claude/skills/stack-guard/SKILL.md                 — E2E-applicable 판정 + provision/smoke (ADR-052 D2 정합)
- docs/30-workitems/_templates/MILESTONE_TEMPLATE.md  — `## 5. 완료 기준` item 3 MUST 문구
- docs/90-decisions/boilerplate/ADR-052-stack-provisioning-and-e2e-readiness.md — D3 owning ADR
```

---

#### 6.4.5 ADR-019 — `## Amendment 1` 조건부 re-read

파일: `docs/90-decisions/boilerplate/ADR-019-context-packs-and-jit.md`

ADR-019에는 amendment·Surfaces 블록이 아직 없다. 파일 끝(`- ADR-010 (multi-tool 호환)`)에 amend를 append하고, 조건부 re-read가 cross-surface 적용이 아니므로(skill 본문 인용만) Surfaces 블록은 신설하지 않는다 — STRUCTURE 압축 규칙(ADR-019 context-pack은 본 표에 박지 않음) 정합.

**현재 (before):**
```markdown
## 참고
- ADR-022 (Ratchet Principle — [외부실증] 라벨)
- ADR-010 (multi-tool 호환)
```

**변경 (after):**
```markdown
## 참고
- ADR-022 (Ratchet Principle — [외부실증] 라벨)
- ADR-010 (multi-tool 호환)

<a id="adr-019-amend-1"></a>
## Amendment 1 (2026-06-25) — 조건부 re-read (foreman/fan-out inner-loop, ADR-051 D8)

### 결정
foreman/fan-out 도입(ADR-051 D1·D2)으로 메인 세션이 inner-loop를 여러 라운드 운전할 때, minimal/JIT 정책을 *조건부 re-read*로 좁힌다 — **직전 라운드에서 이미 로드한 문서는 변경 신호(mtime 갱신, validate report 신규 생성, task `## 8. 메모` repair 갱신)가 있을 때만 재읽기**. 변경 신호가 없으면 in-context 버전을 재사용하고 재로딩하지 않는다.
- 본 amend는 ADR-019 본래 "사전 fork-load 금지 + minimal" 정신 계승 — *불필요한 재로딩*도 fork-load와 동형의 컨텍스트 낭비로 본다.

### 강도 (ADR-022)
- enabling(약) — 토큰 절감. 변경 신호 판정이 모호하면 *안전하게 재읽기*(false re-read는 비용만, 정확성 무해).

### 적용 surface
- .claude/skills/implement-workitem/SKILL.md   — foreman inner-loop 조건부 re-read (ADR-051 D8)
- .claude/skills/validate-workitem/SKILL.md    — fan-out 라운드 조건부 re-read
- 각 skill 본문 `## Context 정책 (ADR-019)` 단락에 1줄 인용 (ADR-019 #amend-1).
```

---

#### 6.4.6 README 인덱스 — ADR-051/052 행 추가 + amend 컬럼 갱신

파일: `docs/90-decisions/boilerplate/README.md`

**(a) ADR-051/052 행 추가** — 표 마지막 행(ADR-050)을 anchor로 그 *뒤*에 2행 추가.

**현재 (before):**
```markdown
| 050 | Main-session, model-invocable lifecycle skills | accepted | — | de-fork 7종 메인 세션 실행 + 실행 inner-loop 4종 model-invocable + repair-workitem 판단형/report 삭제 |
```

**변경 (after):**
```markdown
| 050 | Main-session, model-invocable lifecycle skills | accepted (부분 superseded by 051) | — | de-fork 7종 메인 세션 실행 + 실행 inner-loop 4종 model-invocable + repair-workitem 판단형/report 삭제 |
| 051 | Main-session orchestration (foreman) + 병렬 fan-out + wave 제거 | accepted | — | implement→foreman 병렬/단일 builder 위임(file-disjoint slice 병렬, 작거나 겹치면 단일) + validate/stabilize report-only fan-out + plan de-fork + plan-milestone 신설 + ADR-038 wave(#d3/#d6) 제거 + ADR-047 D9 foreman partition re-anchor + ADR-019 조건부 re-read |
| 052 | Stack provisioning (install) + E2E readiness | accepted | — | stack-guard가 baseline toolchain·e2e 직접 install/provision(실패 시 Needs Install blocker) + 정합 검증 + e2e provision/smoke + E2E MUST-run hard-block(ADR-014#amend-2) + repair-milestone 신설(코드수정 허용·커밋 X) |
```

**(b) ADR-038 행 status/amend 갱신**

**현재 (before):**
```markdown
| 038 | Cross-LLM Plan Validation + Parallel Waves | accepted | (+#amend-1: Plan Quality 8 → 10 차원 — ADR-027#amend-1 양립, +#amend-2: 리뷰 파일 충돌 정정 — 덮어쓰기→자동 suffix, +#amend-3: file overlap 정책 정정 — 명시적 write_set 결정적 wave 분리) | opt-in peer review (다른 세션·다른 LLM) — /validate-plan + /repair-plan 신설 + wave 그룹 echo + worktree 권장 |
```

**변경 (after):**
```markdown
| 038 | Cross-LLM Plan Validation + Parallel Waves | accepted (#d3·#d6·#amend-3 superseded by 051) | (+#amend-1: Plan Quality 8 → 10 차원 — ADR-027#amend-1 양립, +#amend-2: 리뷰 파일 충돌 정정 — 덮어쓰기→자동 suffix, +#amend-3: file overlap 정책 정정 — 명시적 write_set 결정적 wave 분리 — *ADR-051이 write_set 5필드와 함께 폐지*) | opt-in peer review (다른 세션·다른 LLM) — /validate-plan + /repair-plan 신설. ~~wave 그룹 echo + worktree 권장~~(ADR-051 제거) |
```

**(c) ADR-014 amend 컬럼 갱신**

**현재 (before):**
```markdown
| 014 | Milestone graduation contract | accepted | (+#amend-1: evaluator-optimizer pattern 명명) | graduation checklist 5+1 + 회고 + pre-check + --dry-run |
```

**변경 (after):**
```markdown
| 014 | Milestone graduation contract | accepted | (+#amend-1: evaluator-optimizer pattern 명명, +#amend-2: E2E MUST-run hard-block — ADR-052 D3) | graduation checklist 5+1 + 회고 + pre-check + --dry-run |
```

**(d) ADR-040 amend 컬럼 갱신**

**현재 (before):**
```markdown
| 040 | 외부 리서치 capability | accepted | (+#amend-1: 의존성 설치 authoring/실행) | researcher agent + /research-pack skill, report-only 웹 접근 |
```

**변경 (after):**
```markdown
| 040 | 외부 리서치 capability | accepted | (+#amend-1: 의존성 설치 authoring/실행, +#amend-2: researcher 자율성 + install-ownership 3분할 boundary) | researcher agent + /research-pack skill, report-only 웹 접근 |
```

---

#### 6.4.7 STRUCTURE.md — roster 18→20 + 생성 주체 컬럼 + Codex wrapper 인벤토리

파일: `docs/00-meta/STRUCTURE.md`

**(a) Claude skill 본문 행 — 18종 → 20종**

**현재 (before):**
```markdown
| Claude skill 본문 | `.claude/skills/<name>/SKILL.md` (18종 — bootstrap-project/bootstrap-stack/bootstrap-design/discover-product/plan-workitem/validate-plan/repair-plan/implement-workitem/validate-workitem/repair-workitem/finalize-workitem/stabilize-milestone/stack-guard/review-doc/boilerplate-context/research-pack/validate-discovery/repair-discovery) | 수동 (boilerplate 제공) | Reference | baseline |
```

**변경 (after):**
```markdown
| Claude skill 본문 | `.claude/skills/<name>/SKILL.md` (20종 — bootstrap-project/bootstrap-stack/bootstrap-design/discover-product/plan-milestone/plan-workitem/validate-plan/repair-plan/implement-workitem/validate-workitem/repair-workitem/finalize-workitem/stabilize-milestone/repair-milestone/stack-guard/review-doc/boilerplate-context/research-pack/validate-discovery/repair-discovery) | 수동 (boilerplate 제공) | Reference | baseline |
```

**(b) milestone 행 생성 주체 컬럼 — plan-milestone 추가**

**현재 (before):**
```markdown
| milestone | `docs/30-workitems/milestones/M*-*.md` | `/bootstrap-project`, `/plan-workitem` | Living | generated |
```

**변경 (after):**
```markdown
| milestone | `docs/30-workitems/milestones/M*-*.md` | `/bootstrap-project`, `/plan-milestone` | Living | generated |
```

**(c) feature 행 생성 주체 컬럼 — plan-milestone 추가**

**현재 (before):**
```markdown
| feature | `docs/30-workitems/features/F-*-*.md` | `/bootstrap-project`, `/plan-workitem` | Living | generated |
```

**변경 (after):**
```markdown
| feature | `docs/30-workitems/features/F-*-*.md` | `/bootstrap-project`, `/plan-milestone`, `/plan-workitem` | Living | generated |
```

> 근거: ADR-051 D4 — milestone→feature 분해가 plan-milestone로 이전(milestone 생성 주체는 plan-workitem→plan-milestone), feature는 plan-milestone(분해 시) + plan-workitem(feature 내 task 분해 중 feature 갱신) 양쪽.

**(d) Codex skill wrapper 인벤토리** — 현재 STRUCTURE 54번 줄은 wrapper 위치만 일반화하고 *명시 목록을 두지 않는다*. ADR-010#amend-3에 따라 자연어 Codex skill 목록 SSOT는 README이므로, STRUCTURE wrapper 행에 *count*만 명시한다면 갱신한다. 현행 행에 count가 없으므로 wrapper 행 자체는 불변이되, .agents에 새 wrapper 2개(plan-milestone, repair-milestone)가 추가됨을 보장하는 것은 6.5 체크리스트(mirror parity)가 닫는다.

**현재 (before):**
```markdown
| Codex skill wrapper | `.agents/skills/<name>/{SKILL.md, agents/openai.yaml}` | 수동 | Reference | baseline |
```

**변경 (after):**
```markdown
| Codex skill wrapper | `.agents/skills/<name>/{SKILL.md, agents/openai.yaml}` (자연어 호출 skill 목록 SSOT는 boilerplate/README — ADR-010#amend-3; lifecycle/메인 호출 skill은 wrapper 미보유 가능) | 수동 | Reference | baseline |
```

> 근거: 기존 `.agents`에는 11종만 mirror됨(plan-milestone/repair-milestone 신규 2종은 6.1/6.2 Surfaces에서 .claude+.agents 양 mirror 신설로 박았다). STRUCTURE wrapper 행은 명시 카운트가 없어 행 본문 변경은 ADR-010#amend-3 SSOT 포인터 1줄 추가에 그친다(roster count drift는 README가 SSOT).

---

#### 6.4.8 신규 skill의 .agents mirror — parity 검증 (authoring은 Stage 4A/5B)

> **중복 제거 (외부 리뷰 반영)**: 두 신규 skill의 `.agents` thin wrapper(+ `openai.yaml`) 4개 파일은 **Stage 4A(plan-milestone §2·§3)·Stage 5B(repair-milestone 파일2·파일3)에서 이미 author**한다. 본 Stage는 *재작성하지 않고*(이전 버전이 여기서 다시 만들며 내용이 충돌했음 — 제거) 그 4개 파일이 존재하고 정본과 일치하는지만 검증한다. 정본 wrapper 내용(description 인자·Codex degrade 노트)은 **Stage 4A/5B 블록이 SSOT**다.

검증 대상 4개 파일(모두 Stage 4A/5B에서 생성됨):
- `.agents/skills/plan-milestone/SKILL.md` — Stage 4A §2 정본. description 인자 = `<milestone-or-feature-idea>`. **`Sub-agent parity` degrade 노트 포함**(R2 architect sub-call이 Claude `Agent` 전용이라 Codex는 메인 인라인 순차로 degrade).
- `.agents/skills/plan-milestone/agents/openai.yaml` — Stage 4A §3 (`allow_implicit_invocation: false`).
- `.agents/skills/repair-milestone/SKILL.md` — Stage 5B 파일2 정본. **`Codex 병렬 미지원` degrade 노트 *포함*** — per-task `/repair-workitem` 병렬 라우팅을 Codex에서 순차로 degrade해야 하므로 *필요*하다('불요'가 아니다 — 이전 버전의 오기 정정).
- `.agents/skills/repair-milestone/agents/openai.yaml` — Stage 5B 파일3 (`allow_implicit_invocation: false`).

검증 항목: 각 wrapper가 (a) `Source of truth: .claude/skills/<name>/SKILL.md` 포인터, (b) `name`/`description` 외 frontmatter 무시 지시, (c) 위 degrade 노트를 갖는가. §6.5 mirror-parity 체크리스트가 최종 게이트.

---

### 6.5 최종 cross-surface 동기화 체크리스트

implementer는 6.1–6.4를 모두 적용한 뒤 *마지막에* 다음을 순서대로 닫는다. 이것은 stabilize-milestone의 deterministic preflight(ADR-045 Surface-backref + ADR-ref + roster)를 *수동으로* 모사한 drift catch다.

- [ ] **신규/변경 ADR이 Mutation Contract를 갖는가**: ADR-051·ADR-052 본문에 `## Mutation Contract` 6 필드(Target/Failure mode/Predicted improvement/Preserved invariants/Falsifying evaluation/Rollback path) 존재 — 둘 다 harness surface(`.claude/skills`·`.agents`) 수정 ADR이라 ADR-047 D3 발동.
- [ ] **신규/변경 ADR이 Surfaces를 갖는가**: ADR-051·ADR-052에 `## Surfaces` 블록 존재, 1행 1파일(comma-join 금지 — ADR-045). ADR-040#amend-2·ADR-014#amend-2·ADR-019#amend-1은 *amend 적용 surface* 목록을 amend 블록 안에 둠.
- [ ] **Surfaces-listed 파일이 ADR을 역참조하는가** (양방향 정합 — ADR-045#d3·#d4): ADR-051 Surfaces의 모든 파일(implement-workitem/plan-workitem/plan-milestone/validate-workitem/stabilize-milestone SKILL 본문 + WORKFLOW/DELEGATION/STRUCTURE + ADR-038/047/050/019/**026**)이 본문에 `ADR-051` 토큰을 1회 이상 포함 (ADR-026 backref는 §6.4.2b(b)에서 `## 참고`에 추가). ADR-052 Surfaces의 stack-guard/stabilize-milestone/repair-milestone SKILL + MILESTONE_TEMPLATE + ADR-014/025/040이 `ADR-052` 역참조 포함. (Stage 1–5에서 skill 본문에 역참조를 박았는지 확인 — 누락 시 본 Stage에서 1줄 추가.)
- [ ] **.claude ↔ .agents mirror parity (신규 2 skill)**: `.claude/skills/plan-milestone/SKILL.md`·`.claude/skills/repair-milestone/SKILL.md` 존재 ↔ `.agents/skills/plan-milestone/{SKILL.md,agents/openai.yaml}`·`.agents/skills/repair-milestone/{SKILL.md,agents/openai.yaml}` 존재(각 thin-wrapper가 `Source of truth: .claude/skills/<name>/SKILL.md` 포인터를 가짐 — ADR-010). 본 Stage에서 *제거된* skill 없음 → mirror 제거 대상 없음.
- [ ] **STRUCTURE roster count 정확**: STRUCTURE "Claude skill 본문" 행이 `(20종 — ...)` + 나열 20개가 실제 `.claude/skills/*/` 디렉터리 수와 일치. README 인덱스에 ADR-051·ADR-052 행 추가됨.
- [ ] **README amend 컬럼 sync** (ADR-045 인덱스 amend 동기): ADR-014(=2 amend)·ADR-040(=2 amend)·ADR-038(부분 superseded note) README 컬럼이 본문 `## Amendment N` 수와 일치. ADR-050 README status가 `accepted (부분 superseded by 051)`.
- [ ] **supersede 절차 완결** (_ADR_GUIDE 대체 절차): ADR-038 #d3·#d6 + ADR-050 D1 implement 부분에 supersede note + 상단 status note, ADR-051이 두 ADR을 `## 대체`에서 참조. ADR-047 D9·ADR-019는 supersede 아닌 amend(행동 보존)로 정합.
- [ ] **stabilize-milestone deterministic preflight 멘탈 실행** (ADR-051 D2 fan-out 도입 후에도 preflight는 deterministic 유지): (a) ADR-ref — ADR-051/052 인용 파일이 실제 존재, (b) Surface-backref forward check — 모든 Surfaces 파일이 ADR 토큰 역참조, (c) roster — STRUCTURE 20종 ↔ 디렉터리 수. 세 check가 모두 green이어야 drift 0.
- [ ] **Codex degrade 노트 존재**: 병렬 오케스트레이터 본문(implement-workitem foreman 위임 + validate/stabilize fan-out + plan-milestone architect 위임 + **repair-milestone per-task `/repair-workitem` 병렬 라우팅**)에 "Codex: 병렬 위임 미지원 시 순차 단일 실행으로 degrade" 1줄 — ADR-051 D1·D2·D4 본문 + plan-milestone .agents wrapper(Stage 4A §2) + **repair-milestone .agents wrapper(Stage 5B 파일2)** 에 포함됨을 확인. (repair-milestone는 cross-cutting 코드수정 + per-task 병렬 라우팅을 *포함*하므로 degrade 노트 *필요* — 이전 "불요" 기재는 정정됨.)

---

**커밋:**
```
docs(adr): add ADR-051 main-session orchestration (foreman) + parallel fan-out + wave removal
docs(adr): add ADR-052 stack provisioning install reversal + E2E readiness hard-block
docs(adr): amend ADR-040 (researcher autonomy + install-ownership boundary), ADR-014 (E2E MUST-run), ADR-019 (conditional re-read); supersede ADR-038 #d3/#d6 + ADR-050 D1 implement; re-anchor ADR-047 D9
feat(skills): add plan-milestone and repair-milestone Codex mirrors and sync STRUCTURE roster 18→20 + README index
```
