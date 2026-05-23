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
- `docs/20-system/ARCHITECTURE_OVERVIEW.md`
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
9-1. **AC interpretation diversity self-check** (분해 직후 1회 실행, ADR-006 amend1):

각 AC를 *2+ 합리적 해석이 가능한지* self-check.
가능 시 plan 출력의 "남은 미결정 사항" 섹션에 다음 형식으로 박음:

- AC-N (T-NNN): 해석 A=<...>, 해석 B=<...>, 권장 선택=<...>
  (이유: charter ## 7. 제약 조건 또는 ## 5. 비목표 정합 / 비용 정합 등)

자동 차단 X — 사용자가 plan 검토 시 *해석 결정 협상*.

본 self-check가 plan 단계에서 발화하면 [implement-workitem ambiguity surfacing](../implement-workitem/SKILL.md)은
*재확인 surface*가 됨 — 2-layer defense (plan에서 잡으면 RGR 1회 절감).

10. **task 의존성 채움** — TASK_TEMPLATE `## 9. 의존성`을 분해 시 명시. 병렬 가능 task는 비워둔다.
11. **wave 그룹 계산** (ADR-038 D3 / D6) — 다음 sub-step을 순서대로 수행. 결과는 본 skill *출력에만 echo* — workitem 문서 본문에 영속 저장 X (`## 9. 의존성`이 SSOT — ADR-005 정합). **Context 부담 회피**: 본 step의 검사 2종((a) 위상 정렬 / (b) lockfile race) + 선언 1종((c) 자동 분리 X) 모두 *각 task 본문 전체 fork-load 금지* — `## 9. 의존성` 본문 + `## 3. 구현 항목` 본문의 path-like 토큰만 회수 (ADR-019 minimal 정합). **file overlap 휴리스틱은 본 step에서 제외** — 정밀도가 낮고(`## 4-1`은 현행 정책상 plan 시점 대부분 비어 있음 — WORKFLOW.md §4 line 25 + TASK_TEMPLATE 주석 SSOT) 외부 LLM peer review(`/validate-plan`)에 전적으로 위임.

11-(a) **위상 정렬 (결정적 알고리즘)**: 각 task의 `## 9. 의존성` 본문에서 *self-ID 콜론 뒤*의 자연어 텍스트(예: `- T-002: T-001의 X 정의 후 시작 가능` → 콜론 뒤 "`T-001의 X 정의 후 시작 가능`") 안에서 **`T-[0-9]+` 패턴의 task ID 토큰을 모두 추출**. 추출한 토큰을 dep로 간주 → **단순 DAG 위상 정렬** (Kahn's algorithm 등 결정적 알고리즘). *주의*: ADR-026 `## 9` 본문은 self-ID prefix(`- T-NNN:`) + 자연어 dep 설명 형식이라 prefix 자체는 *해당 task 본인*이고 dep는 콜론 뒤 텍스트에 묻혀 있음 — prefix만 보면 안 됨. **결정성 보장**: 같은 입력(`## 9. 의존성` 텍스트)에 같은 wave 그룹. 단, *추출 자체*가 자연어 본문 기반이라 false-positive/negative 가능 — 사용자가 wave 결과를 *참고용*으로 활용 + 최종 의존성 판단은 사용자 책임.

11-(b) **lockfile race 경고**: task 본문(`## 3. 구현 항목`)에서 manifest/lock 파일명 *어느 하나라도* 명시되면 (OR 매치 — 예: `package.json` / `pnpm-lock.yaml` / `Cargo.toml` / `Cargo.lock` / `pyproject.toml` / `poetry.lock` / `uv.lock` / `go.mod` / `go.sum` 중 하나라도 본문에 등장) 해당 task를 "단독 wave (lockfile race risk)"로 표시. **출력 echo만, 자동 차단 X, 영속 저장 X** — 사용자가 wave 구성을 결정. **휴리스틱 한계 명시**: 본 검출은 *파일명 토큰이 본문에 직접 적힌 경우*만 잡음 — "add Redis client" 같은 자연어 dep 추가 task는 false negative. 출력에 *"본 검출은 manifest/lock 토큰 명시 task만 매치 — 자연어 dep 추가는 누락 가능"* 한 줄 echo 권장.

11-(c) **자동 분리 X**: 본 점검들은 *경고 출력만*. 사용자가 wave 내에서 sequential 진행 / 별 worktree 분리 / 그대로 동시 진행 중 결정.

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
- feature 분해 시: 매핑표를 *feature 문서의 `## 7-1`에 직접 기록* + plan 출력 요약에 동일 표 echo
  (`## 7-1` 본문이 SSOT, plan 출력은 사람 확인용):
  ```
  ## 7-1. FAC ↔ AC 매핑표
  FAC-1 → T-001:AC-1, T-002:AC-2
  FAC-2 → T-003:AC-1
  FAC-3 → unmapped  ← 미커버 task 필요
  ```
- 핵심 가정
- 남은 미결정 사항
- **병렬 실행 그룹 (parallel waves)** — task `## 9. 의존성` 기반 위상 정렬 (자유 텍스트 dep는 best-effort). 다음 형식으로 echo:
  ```
  Wave 1 (병렬 가능): T-001, T-002, T-003
  Wave 2 (Wave 1 종료 후): T-004 (deps: T-001), T-005 (deps: T-002)
  Wave 3 (Wave 2 종료 후): T-006 (deps: T-004, T-005)
  Wave 4 (단독 — lockfile race risk): T-007 (의존성 추가 감지)
  ```
  - (file overlap 점검은 plan-workitem에서 제외 — `/validate-plan` 외부 peer review가 *외부 관점*으로 회수. 정합 근거는 step 11 머리 단락 + ADR-038 D3.)
  - **병렬 실행 권장 패턴** (ADR-038 D6 참조): `claude --worktree T-NNN -p "/implement-workitem T-NNN"` — 이름은 `--worktree` 인자로 필수. 단일 working tree 동시 implement는 비권장. 외부 리소스(DB / 포트 / lockfile / 빌드 캐시) 격리는 프로젝트 환경 책임 (ADR-038 면책 단락 참조). **⚠ plan 산출물 가시성 주의**: `claude --worktree`는 기본 *원격 기준 fresh checkout*이라 uncommitted plan 문서가 worktree 세션에서 안 보일 수 있음 → 병렬 implement 전 plan 산출물 commit 또는 `worktree.baseRef = "head"` 설정 (ADR-038 D6).
- **Cross-review opt-in 안내** (ADR-038) — 한 줄 안내 출력:
  ```
  품질 확신이 부족하면: 다른 세션·다른 LLM에서 `/validate-plan <workitem-id>` 1+ 회 → 원본 세션에서 `/repair-plan <workitem-id>` 회수.
  ```
- 다음 추천 단계 (보통 `/implement-workitem [task-id]` — wave 그룹 병렬 시 `claude --worktree T-NNN -p "/implement-workitem T-NNN"` 패턴, 또는 cross-review를 끼우려면 `/validate-plan [workitem-id]` 먼저)

## monorepo·백엔드 sizing 가이드
- **monorepo**: 1 task = 단일 패키지 5 파일 이하 (cross-package 변경은 task 분리).
- **백엔드**: OpenAPI 변경·DB migration·코드 구현은 *별도 task*로 분리. 한 task에 묶지 않는다.
- Phase 4.1의 sizing 휴리스틱(1 RGR / AC 3 / 변경 5)이 monorepo·백엔드에서 깨지는 문제는 *외부실증*(Nx/Turbo 패턴) 기반. [관측됨] 데이터는 Phase 12 Round 2에서 회수.
- **SSOT 노트**: 본 sizing 가이드는 본 skill 본문이 SSOT다. 운영 가이드라 ADR로 박지 않음 — 추적성은 ADR-026 Amendment 1에서 명시.

## 정합성 self-check (분해 직후 1회 실행, ADR-026 amend 1)
- charter `## 5. 비목표` 단락 키워드와 분해된 feature/task를 매칭. 위반 의심 시 출력의 "남은 미결정 사항"에 명시.
- feature 범위가 상위 milestone `## 3. 포함되는 기능`에 매핑되는지 확인. 매핑 실패 시 동일 위치에 명시.

## architect 호출 권장 신호 (감지 시 텍스트 제안만, 자동 호출 금지 — ADR-007)
다음 4 신호 중 하나라도 감지되면 출력 마지막에 `architect 호출 권장: <이유>` 1줄 추가:
1. 새 모듈 디렉터리 생성 (`src/<new>/` 또는 동등 경로).
2. charter `## 7. 제약 조건`에 없는 새 외부 의존 (npm/pip/cargo) 추가.
3. ARCHITECTURE_OVERVIEW.md `## 3-1. 레이어 경계` 변경.
4. "패턴 변경" / "새 boundary" / "도메인 경계" 키워드 등장.

## Cross-review hook (ADR-038)
본 skill 호출 후 plan 품질에 확신이 부족하거나 다중 모델 관점을 원하면:
1. 별 터미널·별 세션 (Claude 또는 Codex)에서 `/validate-plan <workitem-id> --reviewer-tag <distinct-tag>` 1+ 회 실행. **다중 리뷰어 시 서로 다른 tag 필수** (default 충돌 silent overwrite 회피). 각 호출이 `docs/40-validation/plan-reviews/<id>.<tag>.md` 1개를 작성.
2. 원본 세션 (본 skill을 돌린 세션)에 돌아와 `/repair-plan <workitem-id>` 실행. 모든 리뷰 파일을 회수해 workitem 문서를 수정 + 리뷰 파일 삭제.

본 흐름은 *opt-in*. 건너뛰어도 워크플로우 정상 작동. *opt-in 시작 후 `/repair-plan`을 건너뛰면 `docs/40-validation/plan-reviews/<id>.*.md`가 잔존*: 다음 라운드 호출이 silent overwrite하거나 `rm docs/40-validation/plan-reviews/<id>.*.md`로 수동 정리.

운영 권장 (worktree·외부 리소스 면책 단락): ADR-038 D6 + 면책 단락 참조.

## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 ADR/architecture 섹션은 task 본문에서 발화 시 인용 — 사전 fork-load 금지.
