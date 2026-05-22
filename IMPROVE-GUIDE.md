# IMPROVE-GUIDE

> 이 문서는 **단계별 시공 도면**이다. 위에서 아래로 한 phase씩 순서대로 수행한다. phase 안의 단계도 순서대로. 추측 없이, 명시된 텍스트만 작성한다. 마지막 phase의 acceptance checklist가 모두 ✅ 되면 개선 완료.

---

## 0. 개선 목적 (왜 이걸 한다)

### 0-1. 현재 상태
- `/plan-workitem`이 1회 LLM 호출로 workitem 문서(milestone/feature/task)를 생성한다.
- 검증 메커니즘은 같은 세션 내 self-check 6종(`## 4. 정합성`, AC interpretation diversity, AC 형식, sizing, FAC↔AC 매핑, architect 호출 신호)만 존재.
- **다른 세션·다른 LLM**의 외부 관점 검증이 부재 — 같은 모델의 blind spot이 그대로 plan에 박힌 채로 implement로 넘어감.
- 병렬 가능성 정보는 TASK `## 9. 의존성`의 *선택 명시*에 의존하고 (비어 있으면 병렬 가능으로 간주), plan 출력에 *wave 그룹*으로 가시화되지 않음. 사용자가 "어떤 task를 동시에 implement해도 되나"를 매번 직접 위상 정렬해야 함.
- task `## 4-1. 변경 예정 파일/경로`는 TASK_TEMPLATE 주석상 *"구현 시점에 채운다"* 라 plan 시점에 보통 비어 있음 — 동일 wave 내 file overlap 점검의 기초 자료가 부재해 wave 그룹화 정밀도가 휴리스틱 수준(`## 3. 구현 항목` 본문 path-like 토큰 추출)에 머무름.
- 같은 working tree에서 다중 `/implement-workitem` 동시 실행 시 sneaky한 충돌이 다수 (공유 모듈 import-그래프 race / lockfile race / 빌드 캐시 충돌 / git index race) — `## 4-1` 만으로는 회수 불가, 그렇다고 wave 그룹화 자체를 포기하면 사용자가 매번 수동 위상정렬 필요.

### 0-2. 도달 상태 (개선 후)
다음 5가지를 동시에 갖춘다.

**A. Plan cross-review sub-loop (opt-in)** — plan 단계 직후의 선택 가능한 가지:
```
/plan-workitem M1
   ↓
(선택) 다른 세션·다른 LLM에서 $validate-plan / /validate-plan M1 ────┐
                                                                      │
   원본 세션에 돌아와 /repair-plan M1                                 │
      ↑                                                                │
      └──────── 다른 세션이 남긴 임시 리뷰 파일 N개를 모두 회수 ──────┘
   ↓
/implement-workitem T-001 ...
```

**B. Parallel waves 출력** — `/plan-workitem`이 마지막 출력에 `## 9. 의존성` + `## 4-1` 기반 위상 정렬 wave 그룹을 echo. 사용자는 같은 wave 안의 task를 여러 터미널 세션에서 동시에 `/implement-workitem`으로 돌릴 수 있다.

**C. `## 4-1. 변경 예정 파일/경로` 책임 시점 이동 (구현 시점 → plan 시점, best-effort)** — TASK_TEMPLATE 주석 갱신 + plan-workitem이 분해 직후 best-effort로 채움 (강제 X). wave 그룹 file overlap 점검의 *기초 자료*가 됨 (정밀도는 LSP 보조 + 휴리스틱 fallback이 보완). validate-plan이 plan 시점 unfilled 상태를 *P1* finding(권장)으로 잡음 — ADR-007 amend 1 lock-file 단순성 결정 정합으로 P0 강제 X. lock file은 D8 키워드 감지로 자동 단독 wave 분리, bootstrap-project initial scaffold는 자동 면제. 구현 중 변동 시 implement-workitem이 *변동분만* 증분 갱신.

**D. LSP-backed MCP import dependency graph 보조 회수** — plan-workitem이 file overlap 점검 시 *fork 사용자가 별도 설치한* LSP-backed MCP server(예: Serena MCP, multilspy, LSP↔MCP bridge)를 통해 *공유 모듈 후보*를 회수. `## 4-1` enumeration이 안 겹치더라도 import 그래프상 같이 만질 후보가 있으면 경고. **가용 시에만** 활성화 — fork가 LSP-backed MCP server 미보유 시 휴리스틱 fallback (출력에 명시). *공식 IDE MCP(`ide` server)는 `mcp__ide__getDiagnostics` / `mcp__ide__executeCode` 2개만 노출해 import graph 회수에 부적합* — D7 본문 + plan-workitem step 11-(c)에서 정정.

**E. Worktree 권장 정책** — wave 그룹 안의 task를 병렬 implement할 때는 `claude --worktree` (Claude Code 2026-02-21 native worktree support) 또는 동등한 별 worktree 분리 *권장*. 단일 working tree 동시 implement는 운영상 비권장 (file 충돌 + git index race + 빌드 캐시 충돌 위험). `.gitignore`에 `.claude/worktrees/` mirror 패턴 추가.

### 0-3. 비목표 (이번 개선에서 하지 않는 일)
- ❌ `/plan-workitem` 자체를 2-pass로 만들기 (ADR-026 비결정 No "2-pass planning" — 자동 2회 호출은 거절됨. 본 개선은 **opt-in 별 skill**이라 다른 트레이드오프).
- ❌ wave 그룹을 milestone/feature 문서 *본문*에 영속 저장 (`## 9. 의존성` + `## 4-1`이 SSOT — 위상 정렬은 derived view라 drift 위험).
- ❌ 파일 충돌 자동 차단 (file overlap 경고만 출력, 사용자 결정 — ADR-007 책임 경계 정합).
- ❌ AGENTS.md 본문 변경 (ADR-011 100줄 cap 보호. 본 개선은 enabling 정책 — AGENTS.md 1줄도 추가 X).
- ❌ 빌드 캐시 / 테스트 격리 / DB·포트 등 외부 리소스 자동 격리 (보일러플레이트 책임 밖 — 프로젝트 환경 설계 책임. ADR-038 본문에 면책 단락).
- ❌ `--worktree` 강제 (운영 권장만 — 단일 worktree 실행도 사용자 선택으로 허용. 자동 spawn X).
- ❌ LSP/MCP server를 본 개선이 *제공*하지 않음 (가용 시 활용만 — 부재 시 휴리스틱 fallback).

### 0-4. 정책 강도 (ADR-022 정합)
본 개선의 모든 새 정책은 **enabling (약)** 강도. 자동 차단 / Pass 차단 트리거 없음. 사용자가 cross-review를 건너뛰어도 워크플로우는 그대로 작동. evidence label: `[가설+외부실증]` (multi-LLM ensembling + Claude Code native worktree 지원 + LSP의 import graph 정확성은 외부 실증, 본 보일러플레이트 자체 [관측됨]은 아직 0건).

**예외 — 없음**: 이전 버전에 박혔던 `## 4-1` plan 시점 필수의 *간접 강제* (validate-plan P0)는 ADR-007 amend 1과의 reconcile로 *P1 권장*으로 약화. plan-workitem 자체는 `## 4-1` 미채움 상태로 분해를 통과시키고 경고만 출력. validate-plan도 P1 finding 권장으로만 보고. 즉 본 개선 *전체*가 자동 차단 0건 — enabling 약 정책 정합 유지.

---

## 1. 사전 점검 (작업 시작 전)

작업 시작 전에 다음을 확인한다. 1건이라도 실패하면 본 가이드를 따라 작업하지 말고 사용자에게 보고.

1-1. 현재 디렉터리가 git repository root인지 확인:
```bash
git rev-parse --show-toplevel
```
출력이 `/Users/kbw/Desktop/dev/my-agentic-app` (또는 fork된 경로)와 동일해야 함.

1-2. 작업 트리가 clean한지 확인:
```bash
git status --porcelain
```
출력이 비어 있어야 함. 변경이 있으면 사용자에게 commit/stash 후 재개를 안내.

**예외 — 본 가이드 자체의 untracked / IDE 설정 modified는 허용**:
- `?? IMPROVE-GUIDE.md` (본 가이드 파일 자체) — §13 옵션 A에 따라 작업 *후* 삭제 예정이라 commit 대상 아님.
- `M .codex/config.toml` (또는 다른 사용자 로컬 IDE 설정) — 사용자가 별도 작업으로 commit하거나 stash 후 재개.

위 두 케이스만 있으면 진행 가능. 그 외 staged·unstaged 변경이 섞여 있으면 사용자에게 정리 안내.

1-3. branch 확인:
```bash
git rev-parse --abbrev-ref HEAD
```
일반적으로 `main`. 다른 branch면 사용자에게 의도 확인.

1-4. 다음 파일이 존재하는지 확인 (있어야 정상):
- `.claude/skills/plan-workitem/SKILL.md`
- `.claude/agents/planner.md`
- `.claude/agents/reviewer.md`
- `docs/00-meta/STRUCTURE.md`
- `docs/00-meta/WORKFLOW.md`
- `docs/00-meta/DELEGATION_STRATEGY.md`
- `docs/30-workitems/_templates/TASK_TEMPLATE.md`
- `docs/40-validation/reports/.gitkeep`
- `docs/90-decisions/boilerplate/README.md`
- `.agents/skills/plan-workitem/SKILL.md`
- `.codex/config.toml`
- `.gitignore`
- `README.md`, `README_ko.md`, `AGENTS.md`

1-5. ADR-022(Ratchet) / ADR-026(plan-workitem schema) / ADR-037(spec coverage) 본문 한 번 훑어 본다 — 본 개선은 이 3개의 영향을 직접 받는다. 본 가이드의 ADR-038 본문에서 reconcile.

---

## 2. Phase 1 — ADR-038 작성 + index 갱신

목적: 본 개선의 정책 본문을 ADR로 박는다 (정책=ADR 패턴 — ADR-005 패턴 4 정합). 이 phase 끝에 1 commit.

### 2-1. 신규 파일 작성: `docs/90-decisions/boilerplate/ADR-038-cross-llm-plan-validation.md`

다음을 정확히 그대로 작성:

```markdown
# ADR-038 — Cross-LLM Plan Validation (opt-in peer review + parallel waves)

> scope: boilerplate

## Status
accepted

## 배경
- [외부실증] multi-model ensembling / peer review는 단일 모델 blind spot을 회수하는 다수의 외부 사례가 있다 (LLM-as-judge, debate, jury 패턴).
- [관측됨] 본 보일러플레이트의 `/plan-workitem`은 6종 self-check(ADR-026 / ADR-037 정합)를 *같은 세션 내*에서 돌린다 (구조 사실 — 본 repo 인스턴스에서 직접 회수 가능).
- [가설+외부실증] 동일 세션 내 self-check만으로는 *같은 모델의 blind spot*이 그대로 통과한다 (multi-model LLM-as-judge / debate / jury 패턴의 외부 연구가 회수 가능성 시사 — 본 repo [관측됨]은 0건, evidence 회수는 §15).
- [관측됨] `## 9. 의존성`에 병렬 가능성이 명시되어도 plan 출력에 *wave 그룹*으로 가시화되는 자리는 현재 plan-workitem SKILL 본문에 부재 — 사용자가 매번 수동 위상 정렬 (구조 사실).
- [관측됨] TASK_TEMPLATE `## 4-1. 변경 예정 파일/경로`는 주석상 *"구현 시점에 채운다"* 라 plan 시점에 비어 있는 경우가 다수 — wave 그룹 file overlap 점검의 기초 자료 부재 (구조 사실).
- [외부실증] LSP(Language Server Protocol) 기반 import dependency graph 회수는 grep 휴리스틱보다 정확하고 토큰 비용이 적다. Claude Code는 MCP server를 통해 그런 도구를 호출 가능. *주의 — 공식 IDE 통합 MCP server(`ide`)가 노출하는 도구는 `mcp__ide__getDiagnostics`(diagnostics 전용)와 `mcp__ide__executeCode`(Jupyter 실행) 2개뿐이라 import graph 회수에는 부족하다. import graph는 별도 LSP-backed MCP server(예: Serena MCP) 또는 정적 분석 도구(ts-morph / jscodeshift / rust-analyzer LSP bridge 등) 가용 시에만 회수 가능. baseline 보일러플레이트는 어느 것도 *제공하지 않으며* 전제도 하지 않는다.
- [외부실증] Claude Code 2026-02-21 native worktree support (`claude --worktree`). 사용자 다수가 worktree-per-task 패턴으로 4~8 concurrent agent를 안정적으로 운영 (외부 사례).

## ADR-026 비결정 단락과의 reconcile
ADR-026 "비결정 (No) — 2-pass planning: 토큰 2배 + stabilize reviewer 책임 중복"은 **같은 세션 내 자동 2회 호출**을 거절한 결정이다.

본 ADR이 신설하는 `/validate-plan` + `/repair-plan`은 **opt-in cross-session peer review**다 — 다음 4 차이로 ADR-026 비결정과 충돌하지 않는다.

| 차원 | ADR-026 비결정 (2-pass) | 본 ADR (cross-LLM peer review) |
|------|-----------------------|--------------------------------|
| 발화 주체 | `/plan-workitem` 자체 (자동) | 사용자 (수동, opt-in) |
| 세션 | 같은 세션 | 다른 세션(또는 다른 LLM) |
| 모델 다양성 | 동일 모델 2회 | 다른 모델 가능 (Claude + Codex 등) |
| 비용 | 자동 — 절약 불가 | 사용자가 선택해 지불 |

## ADR-007 amend 1 lock-file 단순성 결정과의 reconcile
ADR-007 amend 1은 *"lock file은 task 단위 변경의 부산물 → `## 4-1` 강제는 단순성 위반"*이라고 박았다 (lock file 11종 화이트리스트 자동 add 정책). 본 ADR의 D6(`## 4-1` plan 시점 best-effort 채움)는 그 결정과 *직접 충돌하지 않는다* — 두 결정의 강제 대상·시점·목적이 다르기 때문:

| 차원 | ADR-007 amend 1 (lock file 단순성) | 본 ADR D6 (plan-time enumeration) |
|------|----------------------------------|---------------------------------|
| 강제 대상 | finalize 시점의 *file add 화이트리스트* | plan 시점의 *변경 예정 경로 enumeration* |
| 강제 강도 | "강제 X" (lock file은 자동 add 화이트리스트로 우회) | **enabling 약** — validate-plan P1 권장 finding (자동 차단 X) |
| 단순성 우려 | lock file을 매번 `## 4-1`에 박게 하면 단순성 위반 | lock file은 D8 키워드 감지로 *자동 단독 wave 분리* — `## 4-1` 명시 없이도 회수 |
| 목적 | finalize의 file add 정책 단순화 | wave 그룹 file overlap 점검의 기초 자료 best-effort |

즉 D6는 *lock file을 `## 4-1`에 박으라*고 강제하지 않는다 (그 부분은 ADR-007 amend 1이 자동 처리). 본 ADR이 추가하는 건 *plan 시점에 일반 변경 파일을 best-effort로 enumerate*하는 권장. *미채움 자체*는 P1 finding이지 P0가 아니다 — ADR-007의 단순성 우려를 정합.

## 결정

### D1. 신설 skill 2종
- `/validate-plan [workitem-id] [--reviewer-tag <tag>]` — 비판적 리뷰 후 임시 파일 1개 작성. **workitem 문서 일체 수정 X.**
- `/repair-plan [workitem-id]` — 임시 리뷰 파일을 모두 회수해 수용·기각을 판단하고 workitem 문서를 수정. 적용 완료 후 리뷰 파일 삭제.

### D2. 임시 리뷰 파일 위치 + 라이프사이클
- **위치**: `docs/40-validation/plan-reviews/<workitem-id>.<reviewer-tag>.md`
- **lifecycle**: ephemeral (`docs/40-validation/reports/`와 동일 mirror — `.gitignore`로 `*.md` 제외 + `.gitkeep`로 디렉터리 보존).
- **삭제 주체**: `/repair-plan` (수용·기각 결정 후 일괄 삭제).
- **reviewer-tag**: 다중 리뷰어 동시 작성 시 충돌 회피. 미지정 시 `default`. 같은 tag로 재실행 시 덮어쓰기 허용.

### D3. /plan-workitem에 parallel waves 출력 추가
plan-workitem 마지막 출력에 `## 9. 의존성` + `## 4-1. 변경 예정 파일/경로`를 위상 정렬한 wave 그룹 echo. **새 영속 저장 자리 신설 X** — derived view라 drift 위험 ([ADR-005](ADR-005-ssot.md) SSOT 정합).

### D4. agent 분담
- `/validate-plan` → reviewer agent (4번째 review surface "plan" 추가, Plan Quality 9 차원).
- `/repair-plan` → planner agent (workitem 문서 수정 권한 — 기존 plan-workitem과 동일).

### D5. Codex 호환
ADR-010 Phase 1 wrapper 패턴 정합. `.agents/skills/validate-plan` + `.agents/skills/repair-plan` 2개 wrapper 신설.

### D6. `## 4-1. 변경 예정 파일/경로` 책임 시점 이동 — 구현 시점 → plan 시점 (best-effort)
- TASK_TEMPLATE 주석 갱신: *"구현 시점에 채운다"* → *"plan 시점에 best-effort로 채운다. 구현 중 변동 시 implement-workitem이 *변동분만* 갱신한다."*
- plan-workitem이 task 분해 직후 본 섹션을 채움 (sizing self-check의 5-파일 한도와 동일 라운드).
- validate-plan이 본 섹션이 plan 시점에 비어 있는 task를 **[Plan-file-coverage]** *P1* finding으로 잡음 (ADR-007 amend 1 lock-file 단순성 결정 정합 — P0가 아닌 P1로 강등. lock file은 D8 키워드 감지로 자동 단독 wave 분리되므로 `## 4-1`에 박을 의무 없음. 일반 변경 파일도 *권장*이지 강제 X). 초기 scaffolding·auth 같은 task가 본문에 *"scaffolding/auth 예외"* 명시 시 finding 자체 강등 (P2 또는 reporting only).
- **bootstrap-project initial scaffold는 본 D6 적용 면제** — bootstrap-project가 초기 task를 만들 때 `## 4-1`은 비어 있어도 자연스러움 (디렉터리 구조 미확정). validate-plan은 bootstrap-phase task를 "scaffolding 예외"로 자동 분류.
- 본 시점 이동은 wave 그룹 file overlap 점검의 *기초 자료* 확보가 목적 (정밀도는 LSP 보조 + 휴리스틱 fallback이 보완). 구현 시점 갱신 가능성은 그대로 유지 — implement-workitem은 *변동분만 증분 갱신* (finalize-workitem의 차이 처리 정책 정합 — ADR-007).

### D7. LSP-backed MCP import dependency graph 보조 회수 (가용 시)
- plan-workitem step 11의 file overlap 점검에 *LSP-backed MCP* 보조 경로 추가.
- **공식 IDE MCP server (`ide`)는 import graph 회수에 부적합**: 노출 도구가 `mcp__ide__getDiagnostics`(diagnostics)와 `mcp__ide__executeCode`(Jupyter)뿐이라 references / definitions / call hierarchy 같은 LSP method를 제공하지 않는다. 본 결정의 "LSP-backed MCP"는 *fork 사용자가 별도 설치한* server를 의미한다 (예: Serena MCP, multilspy, generic LSP↔MCP bridge).
- 가용 검출: 본 skill 호출 시점에 LSP 기반 *references / definitions / call hierarchy* 회수가 가능한 MCP server가 등록돼 있는지 빠르게 확인. 가용 시 각 `## 4-1` enumeration 파일의 *reverse 참조*(이 파일을 import하는 다른 파일 목록)를 회수, 두 task가 *동일한 import-grand-parent*를 만질 후보 1+건이면 "공유 모듈 후보" 경고 출력.
- **MCP 권한 표기**: Claude Code는 MCP 권한을 `mcp__<server>__<tool>` 또는 와일드카드 `mcp__<server>__*` 형식으로 표기한다 ([공식 permissions 문서](https://code.claude.com/docs/en/permissions#mcp)). fork 사용자가 LSP-backed MCP server를 추가한 경우, plan-workitem SKILL의 frontmatter `allowed-tools`에 해당 server 패턴을 추가하면 prompt 없이 호출 가능 — 추가 안 해도 호출 자체는 가능하나 default permission mode에서 prompt가 발생하며 `context: fork` sub-agent에서는 prompt 응답이 어려워 *결과적으로 skip*될 수 있다.
- 가용 안 함: 휴리스틱 fallback (현행 path-like 토큰 비교) + 출력에 "LSP-backed MCP 미가용 — import graph 점검 skip" 한 줄 명시.
- 본 차원은 **best-effort, 자동 차단 X**. 보일러플레이트는 LSP-backed MCP server를 *제공하지 않으며 전제도 하지 않는다* — 가용 시 활용만.

### D8. 새 dependency 추가 키워드 감지 → lockfile race 출력 표시 (영속 저장 X)
- task 본문(`## 3. 구현 항목` / `## 4-1`)에서 다음 키워드 중 1+ 감지 시 본 task를 *plan-workitem 출력에서* "단독 wave (lockfile race risk)"로 표시:
  - 명시 표기: `package.json`, `pnpm-lock.yaml`, `package-lock.json`, `yarn.lock`, `bun.lockb`, `Cargo.toml`, `Cargo.lock`, `Gemfile`, `Gemfile.lock`, `composer.json`, `composer.lock`, `pyproject.toml`, `Pipfile`, `Pipfile.lock`, `poetry.lock`, `uv.lock`, `go.mod`, `go.sum`, `requirements.txt`
  - 의도 키워드: `의존성 추가` / `dependency 추가` / `package 추가` / `npm install` / `pnpm add` / `pip install` / `cargo add` 등
- 사유: lockfile race + 새 패키지의 cross-task transitive 영향.
- **출력 echo만, 자동 차단 X / 영속 저장 X** — 사용자가 wave 그룹 구성을 결정 (sequential 진행 / 별 worktree / 그대로 동시 진행 중 선택). step 11-(f) "자동 분리 X"와 정합 (workitem 문서는 수정하지 않고 출력 단락에만 echo).

### D9. Wave 그룹 병렬 implement 시 worktree 권장
- wave 그룹 echo 시점에 다음을 *권장*으로 명시 (강제 X):
  - "**병렬 실행은 `claude --worktree` 사용 권장** — Claude Code 2026-02-21 native worktree support. 단일 working tree 동시 implement는 file 충돌 + git index race + 빌드 캐시 충돌 위험."
- `.gitignore`에 `.claude/worktrees/` 패턴 추가 — main checkout에서 worktree 폴더 untracked 노출 방지.
- 단, 단일 working tree에서 한 wave를 *순차 실행*하는 흐름도 그대로 지원 (사용자 선택).

## 정책 강도 (ADR-022 정합)
**enabling (약)** — 자동 차단 / Pass 차단 트리거 0건. 사용자가 cross-review를 건너뛰면 워크플로우는 그대로 작동.
- Evidence label: `[가설+외부실증]` (외부 multi-model 사례 + LSP import graph 정확성 + Claude Code native worktree 사례 — 본 보일러플레이트 [관측됨] 0건, Ratchet 약 적용 가능).
- **예외 없음** — `## 4-1` plan 시점 채움은 validate-plan P1 권장 finding(자동 차단 X). ADR-007 amend 1 lock-file 단순성 결정 정합으로 P0 강제 X.

## 동시 implement 면책 단락 (사용자/환경 책임)
본 ADR은 다음 충돌 차원을 *자동 격리해주지 않는다* — 프로젝트 환경 설계 책임:
- **빌드 캐시 race**: `tsbuildinfo` / `.next/cache` / `target/` 등. worktree-per-task로 격리 권장.
- **테스트 러너 / 통합 테스트**: 포트 / 임시 DB / fixture 공유 시 동시 실행 충돌. testcontainers · 임시 디렉터리 · 자동 포트 할당으로 격리 권장.
- **외부 리소스**: dev DB / Redis / 외부 API rate limit. Docker Compose의 task별 분리 인스턴스 또는 환경 변수 prefix 격리 권장.
- **MCP가 외부 리소스를 자동 격리하진 않는다** — MCP는 도구 호출 통로일 뿐. 격리 책임은 *호출되는 서버 / 환경*에 있다.

본 단락은 ADR-038 본문에 영속 — 사용자/fork가 같은 working tree에서 다중 implement를 시도하다 충돌 시 1차 책임 명시.

## 비결정 (영구 No)
- ❌ `/plan-workitem` 자체에 자동 2-pass 박기 — ADR-026 비결정 그대로 유지.
- ❌ 리뷰 결과 자동 적용 (수용·기각 판단 없이) — ADR-007 책임 경계 위반 (planner가 판단 책임).
- ❌ wave 그룹을 milestone/feature 문서 본문에 영속 저장 — `## 9. 의존성` + `## 4-1` SSOT drift 위험 (ADR-005 위반).
- ❌ 파일 overlap 자동 차단 — 사용자 결정 (`/plan-workitem`은 경고 출력만).
- ❌ `## 4-1` 미채움 시 plan-workitem 강제 종료 — validate-plan P1 권장 finding으로만 처리 (자동 차단 X). ADR-007 amend 1 lock-file 단순성 결정 정합으로 P0 강제 X.
- ❌ `--worktree` 자동 spawn — 사용자가 명시 실행 (강제 X).
- ❌ 본 보일러플레이트가 LSP/MCP server를 제공 — 가용 시 활용만, 부재 시 휴리스틱 fallback.
- ❌ 빌드 캐시 / 테스트 / 외부 리소스 자동 격리 — 프로젝트 환경 설계 책임 (면책 단락 참조).

## 결과
- 사용자가 plan 품질을 외부 모델로 cross-validate할 수 있는 opt-in 경로.
- `## 9. 의존성` + `## 4-1` 기반 wave 그룹 가시화 — 사용자가 여러 터미널에서 `/implement-workitem`을 병렬 실행 가능.
- `## 4-1`의 plan 시점 채움 강제 → wave 그룹 file overlap 점검 정밀도 향상.
- LSP-backed MCP 가용 시 import graph 보조 회수로 sneaky한 공유 모듈 충돌 후보를 plan에서 회수 (공식 IDE MCP는 본 용도에 부적합 — 별도 server 필요).
- worktree-per-task 권장 정책으로 병렬 implement 안전성 확보.
- 적용 surface (11곳):
  1. `.claude/skills/validate-plan/SKILL.md` 신설.
  2. `.claude/skills/repair-plan/SKILL.md` 신설.
  3. `.claude/skills/plan-workitem/SKILL.md` parallel waves 출력 + `## 4-1` 채움 + LSP 보조 + cross-review hook 안내 + worktree 권장.
  4. `.claude/agents/reviewer.md` 4번째 surface "plan" + Plan Quality 9 차원 + Write 범위 확장.
  5. `docs/30-workitems/_templates/TASK_TEMPLATE.md` `## 4-1` 주석 시점 변경.
  6. `.agents/skills/validate-plan/` Codex wrapper.
  7. `.agents/skills/repair-plan/` Codex wrapper.
  8. `docs/00-meta/STRUCTURE.md` skill count + plan-review row + canonical owner.
  9. `docs/00-meta/WORKFLOW.md` + `docs/00-meta/DELEGATION_STRATEGY.md` sub-loop + worktree 권장.
  10. `.gitignore` `plan-reviews/*.md` + `.claude/worktrees/` 패턴.
  11. `README.md` + `README_ko.md` flow 다이어그램 + Step 3 + Codex wrapper 목록 + worktree tip.

## 후속 작업
- 첫 fork 사용자의 `/validate-plan` 호출 빈도를 stabilize-milestone instruction improvement 후보로 추적 (ADR-022 [가설→실증] 승격 트리거).
- LSP/MCP가 plan-workitem step 11에서 실제로 회수하는 공유 모듈 후보의 hit rate를 측정해 휴리스틱 fallback 비율 회수.
- `claude --worktree` 사용 빈도 / wave 그룹 안의 충돌 사고 수를 evidence 회수.
- 다른 LLM의 wrapper(`.agents/skills/validate-plan/agents/openai.yaml`) 외에도 사용 패턴이 늘어나면 ADR-010 매핑 표 갱신.

## 참고
- ADR-005 (SSOT — `## 9. 의존성` + `## 4-1` SSOT 정합)
- ADR-007 (책임 경계 — 자동 차단 X)
- ADR-010 (multi-tool 호환 — Codex wrapper)
- ADR-022 (Ratchet — enabling 약 적용)
- ADR-026 (plan-workitem schema — 2-pass 비결정 reconcile)
- ADR-037 (Spec coverage — validate-plan 체크리스트가 흡수)
```

### 2-2. ADR index 갱신: `docs/90-decisions/boilerplate/README.md`

ADR-037 행 바로 다음에 ADR-038 행을 추가한다. 현재 본문에서 다음 텍스트를:

```
| 037 | Spec coverage self-audit | accepted | (+amend1: FAC↔AC 매핑표 영속 SSOT 위치 `## 7-1`) | FAC→AC 매핑 추적, Spec Gap report, 자동 차단 X |
```

다음으로 교체:

```
| 037 | Spec coverage self-audit | accepted | (+amend1: FAC↔AC 매핑표 영속 SSOT 위치 `## 7-1`) | FAC→AC 매핑 추적, Spec Gap report, 자동 차단 X |
| 038 | Cross-LLM Plan Validation + Parallel Waves | accepted | — | opt-in peer review (다른 세션·다른 LLM) — /validate-plan + /repair-plan 신설 + wave 그룹 echo + `## 4-1` plan 시점 채움 + LSP 보조 + worktree 권장 |
```

### 2-3. 검증
- `cat docs/90-decisions/boilerplate/ADR-038-cross-llm-plan-validation.md` — Status `accepted` 포함되었는가
- `grep -n "038" docs/90-decisions/boilerplate/README.md` — 1개 결과 (행 추가됨)
- `grep -E "^\| 037 " docs/90-decisions/boilerplate/README.md` — 변경 없이 그대로
- ADR-038 본문에 D1~D9 9개 결정 + 면책 단락 + 비결정 8개 모두 존재
- 다른 ADR row의 *Amendments* 컬럼 / 한 줄 요약 컬럼이 흔들리지 않음 (수직 정렬 보존)

### 2-4. 커밋

스테이징 (명시 add):
```bash
git add docs/90-decisions/boilerplate/ADR-038-cross-llm-plan-validation.md
git add docs/90-decisions/boilerplate/README.md
```

커밋 본문 (HEREDOC) — **`Refs:` footer 없음**. ADR-008 amend 2가 commit footer 값을 `T-NNN` 형식으로 정의하고 PR body footer만 `ADR-NNN`을 허용한다. 본 가이드는 boilerplate 자체에 대한 ADR rollout이라 task ID가 없으므로 ADR-008 amend 2의 "lock file 화이트리스트 commit은 *Refs: chore 또는 생략 가능*" 정신에 따라 footer 생략. PR 생성 시점에 PR body에 `Refs: ADR-038` 박는다.
```bash
git commit -m "$(cat <<'EOF'
docs(boilerplate): add ADR-038 for cross-LLM plan validation + parallel waves

New ADR introducing opt-in /validate-plan + /repair-plan sub-loop, plan-
workitem parallel wave output, ## 4-1 plan-time best-effort fill, LSP-backed
MCP import graph 보조 회수, worktree 권장 정책. Reconciles with ADR-026
비결정 (2-pass planning) via 4-dimension difference table. Reconciles with
ADR-007 amend 1 lock-file 단순성 결정 (D6는 lock file 강제와 분리된
plan-time enumeration 목적).
EOF
)"
```

---

## 3. Phase 2 — `docs/40-validation/plan-reviews/` 디렉터리 + `.gitignore` 갱신

목적: 임시 리뷰 파일이 살 자리 + gitignore mirror 패턴 박기 + worktree 폴더 ignore. 이 phase 끝에 별도 commit 없이 Phase 4에 묶는다.

### 3-1. 디렉터리 + `.gitkeep` 생성
```bash
mkdir -p docs/40-validation/plan-reviews
touch docs/40-validation/plan-reviews/.gitkeep
```

### 3-2. `.gitignore` 갱신

**현재 상태 점검 — `.claude/worktrees/`는 이미 존재할 수 있음**:
```bash
grep -nF ".claude/worktrees/" .gitignore
```
- 1+ 라인 매칭 (이미 존재): `.claude/worktrees/` 패턴 *추가하지 않는다* (중복 방지). 본 phase에서는 `plan-reviews/` 패턴 2줄만 추가.
- 0 라인 (부재): 본 phase에서 `plan-reviews/` 패턴 2줄 + `.claude/worktrees/` 1줄 모두 추가.

현재 `.gitignore` 마지막 2줄은 다음과 같다:
```
docs/40-validation/reports/*.md
!docs/40-validation/reports/.gitkeep
```

그 아래에 *plan-reviews 패턴 2줄을 추가*한다 (기존 줄은 변경하지 않음):

```
docs/40-validation/plan-reviews/*.md
!docs/40-validation/plan-reviews/.gitkeep
```

`.claude/worktrees/`가 grep 결과 *부재*일 때만 추가로 한 줄 더:
```
.claude/worktrees/
```

> 주: `.claude/worktrees/`는 Claude Code의 native `--worktree` 플래그가 worktree 폴더를 그 경로에 만들기 때문에 둔다 ([공식 worktrees 문서](https://code.claude.com/docs/en/worktrees) Tip 박스). main checkout에서 untracked 노출 방지 (ADR-038 D9). 본 보일러플레이트는 이미 `.gitignore`에 박혀 있을 가능성이 높으므로 *중복 추가 금지*.

### 3-3. 검증 (Phase 2 작업 직후 시점 기준)
- `ls -la docs/40-validation/plan-reviews/` — `.gitkeep` 만 존재
- `tail -5 .gitignore` — plan-reviews 패턴 2줄 + `.claude/worktrees/` 1줄이 reports 패턴 뒤에 위치
- `git status --porcelain` — `.gitignore` 변경 + 새 `.gitkeep` 두 항목이 *포함*되어야 함. Phase 3 이후엔 reviewer.md modification도 추가될 예정 (정상).

이 phase는 단독 commit하지 않는다. Phase 4의 `/validate-plan` skill 작성과 함께 묶어 commit (그래야 디렉터리가 *왜 생겼는지*가 한 commit 안에 설명된다).

---

## 4. Phase 3 — `reviewer` agent에 "plan" surface 추가 + Plan Quality 9 차원 + Write 범위 확장

목적: `/validate-plan`이 reviewer agent를 호출할 때 plan surface 차원을 따로 잡고, `docs/40-validation/plan-reviews/` 쓰기 권한을 명시. 이 phase 끝에 별도 commit 없이 Phase 4에 묶는다.

### 4-1. `.claude/agents/reviewer.md` 수정

다음 4곳을 *순서대로* 수정.

#### 4-1-A. "Document Consistency 체크" 섹션 내 호출 surface 단락 갱신

현재 본문 (line 58~61 근처):
```
**호출 surface 명시**: 본 agent가 호출될 때 입력에 *"review surface: code | doc | mixed"*를 명시받는다. surface에 따라 적용 차원:
- `code`: Clean Code 6 + Scope Discipline 4.
- `doc`: Doc Consistency 4 + (해당 시) Scope Discipline 4 (변경 diff가 있을 때만).
- `mixed`: 3 차원 모두.
```

다음으로 *교체*:
```
**호출 surface 명시**: 본 agent가 호출될 때 입력에 *"review surface: code | doc | mixed | plan"*를 명시받는다. surface에 따라 적용 차원:
- `code`: Clean Code 6 + Scope Discipline 4.
- `doc`: Doc Consistency 4 + (해당 시) Scope Discipline 4 (변경 diff가 있을 때만).
- `mixed`: 3 차원 모두 (Clean Code 6 + Scope Discipline 4 + Doc Consistency 4).
- `plan`: Plan Quality 9 (아래 별도 섹션). Clean Code / Scope Discipline / Doc Consistency 미적용.
```

#### 4-1-B. Plan Quality 9 차원 섹션 신설

위 4-1-A 단락 바로 다음, 그리고 "Write/Edit 사용 범위:" 단락 이전에 다음 단락을 *삽입*:

```
## Plan Quality 9 차원 (plan surface 전용 — ADR-038)

`/validate-plan` 호출 시 본 agent가 milestone/feature/task 문서를 비판적으로 검토할 때 사용하는 차원. 각 발견은 P0 / P1 / P2 우선순위와 카테고리 라벨을 함께 단다.

1. **[Plan-scope]** — Charter `## 5. 비목표` 키워드 위반 / 상위 milestone `## 4. 제외되는 기능` 위반 의심. (P0 권장)
2. **[Plan-sizing]** (ADR-026) — 1 task = 1 RGR 사이클 위반 / AC 4개 이상 / 변경 예정 파일 5개 초과 (초기 scaffolding·auth 예외). (P1 권장)
3. **[Plan-AC-form]** (ADR-026) — Given-When-Then 형식 부재 / 강력 금지 verb 사용 ("works"/"looks good"/"is correct"/"is fine"). (P0 권장)
4. **[Plan-ambiguity]** (ADR-006 amend1) — AC 1개에 2+ 합리적 해석 존재. (P1 권장)
5. **[Plan-FAC-coverage]** (ADR-037) — feature `## 7-1. FAC ↔ AC 매핑표`의 unmapped FAC / 누락 매핑. (P0 권장)
6. **[Plan-dep]** — task `## 9. 의존성`의 누락 / 잘못된 병렬 주장 (사실은 sequential 필요). (P1 권장)
7. **[Plan-arch]** (ADR-006) — ARCHITECTURE_OVERVIEW `## 3-1` 레이어 경계 위반 의심. `## 3-1` 부재 fork에서는 본 차원 skip + 그 사실을 리뷰 파일 "핵심 관찰"에 명시. (P1 권장)
8. **[Plan-doc-link]** — task `## 7. 관련 문서` 또는 feature `## 11. 관련 문서`의 link 누락 / 깨짐. (P2 권장)
9. **[Plan-file-coverage]** (ADR-038 D6) — task `## 4-1. 변경 예정 파일/경로`가 plan 시점에 비어 있음. wave 그룹 file overlap 점검의 기초 자료 부재 — 본 항목이 unfilled면 *다음 라운드 wave 그룹화 정밀도가 떨어진다*. **(P1 권장)** ADR-007 amend 1 lock-file 단순성 결정 정합으로 P0가 아닌 P1 — lock file은 D8 키워드 감지로 자동 단독 wave 분리되므로 `## 4-1`에 박을 의무 없음. 일반 변경 파일은 *권장*이지 강제 X.
   - 예외: task 본문에 *"scaffolding/auth 예외"* 명시 + 사유(외부 의존 탐색 / 초기 디렉터리 구조 미정 등)가 1줄 이상 있으면 P2로 강등 또는 reporting only.
   - **bootstrap-project initial scaffold task는 자동 면제** — task ID나 본문에서 bootstrap-phase 식별 시 P2로 자동 강등.
   - 본 차원이 발화하면 [Plan-dep]의 병렬 주장도 신뢰도 저하 — 리뷰 파일 "핵심 관찰"에 그 사실 1줄 명시.

라벨링 예: `P0 [Plan-AC-form] T-002:AC-1 — verb "works"는 비측정 — 재분해 권장 ([Given]..[When]..[Then] 형태 + verb "returns"/"persists" 등)`.

라벨링 예 2 (Plan-file-coverage): `P1 [Plan-file-coverage] T-003 — ## 4-1 비어 있음, 예외 사유 미명시 — plan 시점 best-effort 채움 권장 (구현 시점 변동은 implement-workitem이 변동분만 갱신)`.
```

#### 4-1-C. Write/Edit 사용 범위 단락 확장

현재 본문 (line 63 근처):
```
Write/Edit 사용 범위: `/review-doc` 호출 시 `docs/40-validation/IMPROVEMENT_GUIDE.md` 단일 파일만 허용 (review-doc body 의 *Write 범위 제한* 단락 정합). 다른 surface (`/stabilize-milestone` / manual fork) 호출 시 reviewer 는 *report-only* — 본 agent 가 직접 쓰지 않고 호출 측이 받아 적는다.
```

다음으로 *교체*:
```
Write/Edit 사용 범위:
- `/review-doc` 호출 시 → `docs/40-validation/IMPROVEMENT_GUIDE.md` 단일 파일만 허용 (review-doc body 의 *Write 범위 제한* 단락 정합).
- `/validate-plan` 호출 시 → `docs/40-validation/plan-reviews/<workitem-id>.<reviewer-tag>.md` 단일 파일만 허용 (ADR-038 D2). workitem 문서 (milestone/feature/task) 일체 수정 금지.
- 그 외 surface (`/stabilize-milestone` / manual fork) 호출 시 reviewer 는 *report-only* — 본 agent 가 직접 쓰지 않고 호출 측이 받아 적는다.
```

#### 4-1-D. 정책 근거 단락 확장

현재 본문 (line 65 근처):
```
정책 근거: [ADR-006](../../docs/90-decisions/boilerplate/ADR-006-simplicity-and-architecture.md).
```

다음으로 *교체*:
```
정책 근거: [ADR-006](../../docs/90-decisions/boilerplate/ADR-006-simplicity-and-architecture.md), [ADR-038](../../docs/90-decisions/boilerplate/ADR-038-cross-llm-plan-validation.md) (plan surface).
```

### 4-2. 검증
- `grep -n "plan" .claude/agents/reviewer.md | grep -E "surface|Plan"` — 새 plan surface 언급 라인 모두 존재
- `grep -c "ADR-038" .claude/agents/reviewer.md` — ≥1
- `grep -c "Plan-file-coverage" .claude/agents/reviewer.md` — ≥1
- 본문 line count 변화는 합리 (대략 +25 라인 정도 — Plan Quality 9 차원 + Plan-file-coverage 예외 단락)

이 phase는 단독 commit하지 않는다. Phase 4에 묶는다.

---

## 5. Phase 4 — `/validate-plan` skill 작성

목적: cross-review를 수행하는 skill 신설. Phase 2/3와 함께 1 commit (skill 본체 + 의존되는 디렉터리/agent 변경).

### 5-1. 디렉터리 + 파일 생성
```bash
mkdir -p .claude/skills/validate-plan
```

### 5-2. `.claude/skills/validate-plan/SKILL.md` 작성

새 파일에 다음을 그대로 작성:

```markdown
---
name: validate-plan
description: 다른 세션·다른 LLM에서 `/plan-workitem`이 생성·갱신한 workitem 문서를 비판적으로 교차 검토하고 임시 리뷰 파일 1개를 작성한다. workitem 문서 자체는 수정하지 않는다 (ADR-038).
argument-hint: "[milestone or feature or task id] [--reviewer-tag <tag>]"
disable-model-invocation: true
allowed-tools: Read Glob Grep Write Bash(date *)
context: fork
agent: reviewer
context-pack: minimal
---

이 skill은 **판정 + 임시 리뷰 파일 기록 전용**이다. milestone/feature/task 문서 일체 수정 금지. 코드 수정 금지. 커밋 금지.

너의 역할은 입력 workitem ID에 해당하는 plan 문서를 *외부 시선*으로 비판적으로 검토하고, 임시 리뷰 파일 1개를 작성하는 것이다.

**호출 시나리오**: 사용자는 원본 plan 세션과 *다른 터미널·다른 세션·다른 LLM*에서 본 skill을 호출한다. 본 skill의 출력 리뷰 파일은 원본 세션의 `/repair-plan`이 회수한다.

입력:
- `$ARGUMENTS`에는 milestone ID(`M1`) / feature ID(`F-001`) / task ID(`T-001`) + 선택 플래그 `--reviewer-tag <tag>`가 들어온다.
- `--reviewer-tag` 미지정 시 `default` 사용. 동일 워크아이템에 다중 리뷰어가 동시 검토 시 tag로 충돌 회피 (예: `--reviewer-tag claude-b`, `--reviewer-tag codex`, `--reviewer-tag opus-2nd-pass`).
- **tag 형식 제약**: `[A-Za-z0-9._-]{1,32}` (파일 경로에 들어가므로). 미일치 시 `default`로 fallback + 출력에 경고 1줄. 빈 문자열·공백 포함도 동일 fallback.
- **workitem-id 형식 제약**: `M[0-9]+` / `F-[0-9]+` / `T-[0-9]+` 만 허용. `/`, 공백, glob 메타문자(`*`, `?`, `[`) 포함 시 즉시 종료. (다음 phase의 `/repair-plan`이 같은 ID로 glob 삭제하므로 sanitization 필요.)
- **default tag silent overwrite 경고**: 호출 시점에 `docs/40-validation/plan-reviews/<workitem-id>.<tag>.md`가 이미 존재하면 *덮어쓰기 진행하되* 출력에 "기존 리뷰 파일 덮어씀 — 다른 세션 동시 실행 가능성" 한 줄 경고.

반드시 먼저 읽을 파일:
- `docs/10-charter/PROJECT_CHARTER.md` (`## 5. 비목표`, `## 7. 제약 조건` 참조)
- `docs/20-system/ARCHITECTURE_OVERVIEW.md` (`## 3-1. 레이어 경계` 참조 — *부재* 시 [Plan-arch] 차원 skip + 리뷰 파일 "핵심 관찰"에 그 사실 명시)
- 입력 ID에 해당하는 workitem 문서 + **모든 하위 문서** (budget 가이드 아래 참조):
  - `M1` 입력 → `docs/30-workitems/milestones/M1-*.md` + 본 마일스톤 산하 feature/task 전체
  - `F-001` 입력 → 해당 feature 문서 + 본 feature 산하 task 전체
  - `T-001` 입력 → 해당 task 문서 + (있으면) 상위 feature + 상위 milestone
- **하위 문서 탐색 규칙** (자유 텍스트 ID 매칭의 안전한 회수 순서):
  1. **파일명 prefix glob**: 가장 우선. milestone은 `M1-*.md`, feature는 `F-001-*.md`, task는 `T-NNN-*.md` 패턴.
  2. **상위 문서 link 본문**: milestone `## 3. 포함되는 기능` / feature `## 7-1. FAC ↔ AC 매핑표` / task `## 7. 관련 문서`에서 명시 link.
  3. **본문 link**: 상위/하위 문서가 서로 인용한 `[F-001](...)` / `[T-NNN](...)` 같은 markdown link 추적.
  세 단계 모두 결과 0건이면 *"하위 문서 회수 0건"* 한 줄 echo 후 본 workitem만 회수하고 진행 (자동 차단 X).
- `docs/30-workitems/_templates/MILESTONE_TEMPLATE.md`, `FEATURE_TEMPLATE.md`, `TASK_TEMPLATE.md` (양식 정합 점검용 — 본 가이드 Phase 6에서 TASK_TEMPLATE `## 4-1` 주석이 *"plan 시점에 채운다"* 로 갱신되어 있음)

**큰 milestone budget 가이드 (ADR-019 minimal/JIT 정합)**: 산하 task 합산 ≥10개면 다음 순서로 budget — (a) feature 문서 전체 + 각 task `## 6 AC` + `## 4-1` 섹션만 1차 회수, (b) 그 결과로 P0 의심 task 후보를 좁힌 뒤 (c) 후보 task 본문 전체를 깊게 읽는다. 모든 task 본문을 사전 fork-load 금지.

검토 차원 (9 dimensions — reviewer.md의 *Plan Quality 9 차원* 정합):
1. **[Plan-scope]** — Charter `## 5. 비목표` 키워드 위반 / 상위 milestone `## 4. 제외되는 기능` 위반. P0 권장.
2. **[Plan-sizing]** — 1 task = 1 RGR 위반 / AC ≥4 / 변경 예정 파일 ≥6 (초기 scaffolding·auth 예외). P1 권장.
3. **[Plan-AC-form]** — Given-When-Then 형식 부재 / 강력 금지 verb ("works"/"looks good"/"is correct"/"is fine"). P0 권장.
4. **[Plan-ambiguity]** — 1 AC에 2+ 합리적 해석 가능. P1 권장.
5. **[Plan-FAC-coverage]** — feature `## 7-1. FAC ↔ AC 매핑표`의 unmapped FAC. P0 권장.
6. **[Plan-dep]** — task `## 9. 의존성` 누락 / 잘못된 병렬 주장. P1 권장. (본 차원은 [Plan-file-coverage]가 unfilled면 신뢰도 저하 — 핵심 관찰에 명시.)
7. **[Plan-arch]** — ARCHITECTURE_OVERVIEW `## 3-1` 레이어 경계 위반 의심. *`## 3-1` 섹션 자체가 부재한 fork*(ADR-031 비웹 override 경로 등)에서는 본 차원 *skip* + "핵심 관찰"에 "[Plan-arch] skipped: `## 3-1` 부재" 한 줄 명시. P1 권장.
8. **[Plan-doc-link]** — task `## 7. 관련 문서` / feature `## 11. 관련 문서` link 누락·깨짐. P2 권장.
9. **[Plan-file-coverage]** (ADR-038 D6) — task `## 4-1. 변경 예정 파일/경로`가 plan 시점에 채워졌는가. 미채움 시 **P1** (ADR-007 amend 1 lock-file 단순성 결정 정합 — P0 아닌 P1; lock file은 D8 키워드 감지로 자동 단독 wave 분리되므로 의무 X, 일반 변경 파일은 *권장*). 본문에 *"scaffolding/auth 예외"* 명시 + 사유 1줄 있으면 P2 또는 reporting only로 강등. bootstrap-project initial scaffold task는 자동 면제 (P2 강등). 본 차원이 unfilled면 wave 그룹 file overlap 점검 정밀도가 떨어지므로 best-effort로 채우는 게 워크플로우상 정합 — 구현 시점 변동은 implement-workitem이 *변동분만* 증분 갱신 (finalize 차이 처리 정책 ADR-007 정합).

판정 규칙 (review verdict — 워크플로우 차단 아님):
- **NEEDS_CHANGES** — P0 finding 1개 이상.
- **ALL_GOOD** — P0 finding 0개. (P1/P2는 ALL_GOOD을 막지 않음.)
- 본 판정은 *리뷰 파일에 박는 severity 라벨*이지 자동 차단 트리거 아님 (ADR-038 enabling 약 + ADR-007 책임 경계). `/repair-plan`이 본 판정을 입력 신호로 받아 사용자 결정에 따라 적용.

마지막 단계 — 리뷰 파일 작성:

1. 출력 파일 경로: `docs/40-validation/plan-reviews/<workitem-id>.<reviewer-tag>.md`
   - 동일 tag로 재호출 시 덮어쓰기 허용.
   - 다른 tag로 동시 검토 시 파일 충돌 없음.
2. 다음 양식 그대로 작성:

```markdown
# Plan Review: <workitem-id>

- 리뷰어 태그: <reviewer-tag>
- 리뷰 시각: <ISO 8601 — `date -u +%FT%TZ`로 회수>
- 대상 workitem: <workitem-id>
- 대상 문서 경로 (회수한 모든 문서):
  - <path 1>
  - <path 2>
  - ...
- 판정: ALL_GOOD | NEEDS_CHANGES

## 발견

### P0 (수용 강력 권장 — plan 품질 critical, repair-plan에서 우선 처리)
- [P0] [Plan-AC-form] T-002:AC-1 — verb "works"는 비측정. [Given]..[When]..[Then] 형식 + measurable verb로 재작성 권장.
- [P0] [Plan-FAC-coverage] F-001:FAC-3 — unmapped. 본 FAC를 커버할 task 추가 (예: T-007) 권장.
- [P1] [Plan-file-coverage] T-003 — ## 4-1 비어 있음, 예외 사유 미명시. plan 시점 best-effort 채움 권장.

### P1 (수용 권장 — plan 품질 저하)
- [P1] [Plan-sizing] T-001 — AC 4개. 1 task = 1 RGR 사이클 정합 위해 T-001a/T-001b로 분리 권장.

### P2 (개선 제안 — accept 선택)
- [P2] [Plan-doc-link] T-003 — `## 7. 관련 문서`에 Architecture 링크 누락.

## 카테고리 별 카운트
| Category | P0 | P1 | P2 |
|----------|----|----|----|
| Plan-scope | 0 | 0 | 0 |
| Plan-sizing | 0 | 1 | 0 |
| Plan-AC-form | 1 | 0 | 0 |
| Plan-ambiguity | 0 | 0 | 0 |
| Plan-FAC-coverage | 1 | 0 | 0 |
| Plan-dep | 0 | 0 | 0 |
| Plan-arch | 0 | 0 | 0 |
| Plan-doc-link | 0 | 0 | 1 |
| Plan-file-coverage | 0 | 1 | 0 |

## 핵심 관찰 (3개 이내)
- ...
- ...

## 다음 권장 액션 (원본 plan 세션에서)
`/repair-plan <workitem-id>` — 본 파일 + 다른 리뷰어 파일을 일괄 회수.
```

마지막 출력 (메인 세션에 텍스트로):
- 판정 (ALL_GOOD / NEEDS_CHANGES) — *review verdict, 워크플로우 차단 아님*을 한 줄 명시.
- 실제 사용된 `<reviewer-tag>` (입력 그대로 또는 fallback된 `default`). fallback 발생 시 입력 단락의 정규식 제약을 어긴 사유 1줄 함께 출력.
- 기존 리뷰 파일 덮어쓰기 경고가 있었으면 그 줄 echo (입력 단락의 default tag silent overwrite 가드 결과).
- P0 / P1 / P2 카운트
- 리뷰 파일 경로
- 다음 권장 액션: "원본 plan 세션에서 `/repair-plan <workitem-id>` 실행"

가드:
- workitem 문서(milestone / feature / task) 일체 수정 금지.
- IMPROVEMENT_GUIDE / QA_FINDINGS / report 디렉터리 등 다른 산출물 위치 수정 금지.
- 코드 일체 수정 금지.
- 커밋 금지.

## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 ADR/architecture 섹션은 task 본문에서 발화 시 인용 — 사전 fork-load 금지.
```

### 5-3. 검증
- 파일 존재: `ls .claude/skills/validate-plan/SKILL.md`
- frontmatter `agent: reviewer` 포함
- `grep -c "ADR-038" .claude/skills/validate-plan/SKILL.md` — ≥1
- `grep -c "Plan-file-coverage" .claude/skills/validate-plan/SKILL.md` — ≥3 (검토 차원 + 카운트 표 + 발견 예시)
- frontmatter `allowed-tools`에 Write 포함 (리뷰 파일 작성용), Edit 미포함 (workitem 문서 수정 금지)

### 5-4. 커밋 (Phase 2~4 일괄)

이 phase가 끝난 시점에 Phase 2 / Phase 3 / Phase 4의 모든 변경이 한 commit에 묶인다:

```
feat(skills): add validate-plan for cross-LLM peer review (ADR-038)
```

스테이징 대상 파일 (`git add -A` / `.` 금지 — 명시 추가):
```bash
git add .claude/skills/validate-plan/SKILL.md
git add .claude/agents/reviewer.md
git add docs/40-validation/plan-reviews/.gitkeep
git add .gitignore
```

커밋 본문 (HEREDOC):
```bash
git commit -m "$(cat <<'EOF'
feat(skills): add validate-plan for cross-LLM peer review (ADR-038)

- New /validate-plan skill: reviewer-agent based, writes single ephemeral
  review file at docs/40-validation/plan-reviews/<id>.<tag>.md.
- Adds "plan" review surface to reviewer agent (Plan Quality 9 dims,
  incl. new [Plan-file-coverage] P1 for ## 4-1 plan-time best-effort fill).
- Mirrors existing reports/ gitignore pattern for plan-reviews/.
EOF
)"
```

> **주의**: 본 보일러플레이트의 finalize-workitem 정책상 `git add -A` / `git add .`는 금지된다. 본 가이드 작업은 finalize-workitem skill 안에서 수행되는 게 아니라 직접 commit이라 정책 외형은 약하지만, 일관성을 위해 *명시 add*로 박는다.

---

## 6. Phase 5 — `/repair-plan` skill 작성

목적: 원본 세션에서 임시 리뷰 파일을 회수해 workitem 문서를 수정하는 skill 신설.

### 6-1. 디렉터리 + 파일 생성
```bash
mkdir -p .claude/skills/repair-plan
```

### 6-2. `.claude/skills/repair-plan/SKILL.md` 작성

새 파일에 다음을 그대로 작성:

```markdown
---
name: repair-plan
description: 원본 plan 세션에서 실행. docs/40-validation/plan-reviews/<workitem-id>.*.md의 모든 리뷰를 회수해 수용·기각을 판단하고 workitem 문서를 수정한 뒤 리뷰 파일을 삭제한다 (ADR-038).
argument-hint: "[milestone or feature or task id]"
disable-model-invocation: true
allowed-tools: Read Glob Grep Write Edit Bash(rm docs/40-validation/plan-reviews/*) Bash(ls docs/40-validation/plan-reviews/*)
context: fork
agent: planner
context-pack: minimal
---

이 skill은 `/validate-plan`이 생성한 임시 리뷰 파일을 모두 회수해 plan 문서를 수정하는 단계다. **코드 수정·커밋 금지**.

너의 역할: 임시 리뷰 파일 N개의 발견 항목을 종합해 수용 / 기각 / 수정 결정을 내리고, workitem 문서(milestone/feature/task)를 수정한 뒤, 임시 리뷰 파일을 삭제한다.

입력:
- `$ARGUMENTS`에는 milestone / feature / task ID가 들어온다 (예: `M1`, `F-001`, `T-001`).
- **workitem-id sanitization 강제**: `M[0-9]+` / `F-[0-9]+` / `T-[0-9]+` 패턴만 허용. `/`, 공백, glob 메타문자(`*`, `?`, `[`) 포함 시 *즉시 종료* — 본 skill은 ID로 glob 삭제하므로 안전 전제.

반드시 먼저 할 일:
1. 임시 리뷰 파일 회수: `docs/40-validation/plan-reviews/<workitem-id>.*.md` glob.
   - **glob 결과 → 실제 파일 경로 목록을 메모리에 회수.** 이후 step 6의 삭제는 *이 목록의 각 파일을 한 개씩 정확히* 삭제 (glob 재실행 금지 — race 차단).
   - 결과 0건: 사용자에게 *"리뷰 파일이 없음 — 다른 세션에서 `/validate-plan <workitem-id>`를 먼저 실행하세요."* 안내 후 종료. workitem 문서 수정 금지.
   - 결과 1건 이상: 모두 읽는다.
2. 입력 ID에 해당하는 workitem 문서 + 모든 하위 문서를 읽는다 (`/validate-plan`과 동일 범위).
3. `docs/10-charter/PROJECT_CHARTER.md` `## 5. 비목표` / `## 7. 제약 조건`을 읽는다 (수용 판단 근거).
4. `docs/20-system/ARCHITECTURE_OVERVIEW.md`를 읽는다.

수행:
1. 모든 리뷰 파일의 발견 항목을 한 표로 모은다:
   - 컬럼: severity (P0/P1/P2), category, 대상 (file:section), 설명, 제안 수정, 리뷰어 태그.
2. 각 항목마다 4가지 중 하나의 결정을 내리고 한 줄 근거를 적는다:
   - **Adopt** — 그대로 수용. 제안 수정을 workitem 문서에 적용.
   - **Adopt-modified** — 수용하되 다르게 수정 (한 줄 사유 + 적용된 다른 수정 명시).
   - **Reject-false-positive** — 리뷰어가 잘못 본 경우 (예: 이미 수정됨, 문맥상 정합).
   - **Reject-conflict** — 다른 리뷰어가 반대 의견 + 본 plan이 더 정합 (한 줄 사유).
3. 결정 우선순위: P0 > P1 > P2. 한 라운드에 P0 + P1는 *반드시 Adopt/Adopt-modified/Reject* 판정. P2는 다음 중 하나 — (a) 같은 라운드에 같이 처리, 또는 (b) `docs/40-validation/IMPROVEMENT_GUIDE.md`에 *P2 라벨로 이주* 후 deferred 처리. 이주 형식 (append-only):
   ```
   ## Plan review P2 deferred — <workitem-id> (<ISO 8601 timestamp>)
   - [P2] [Plan-doc-link] T-003 — `## 7. 관련 문서`에 Architecture 링크 누락. (리뷰어: codex)
   - [P2] [Plan-sizing] T-005 — 변경 예정 파일 5개 초과 하지만 scaffolding 예외 명시 — 후속 분해 검토.
   ```
   **그냥 리뷰 파일과 함께 *삭제* 금지** — step 6의 파일 삭제로 P2가 추적 불가능해지면 정책 위반 (ADR-007 책임 경계 + ADR-005 SSOT). IMPROVEMENT_GUIDE에 옮긴 P2는 다음 stabilize-milestone 라운드의 instruction improvement 후보로 자연스럽게 회수됨.
4. **다중 리뷰어 충돌 처리**: 같은 항목에 대해 리뷰어 A는 Adopt 권장, 리뷰어 B는 다른 수정 권장한 경우, 본 skill이 charter / architecture 정합 기준으로 어느 쪽을 더 받아들였는지 결정 + 결정 근거 1줄. 자동 합의 / 다수결 X — *planner agent 판단 책임* (ADR-007 책임 경계 정합).
5. Adopt / Adopt-modified로 결정된 항목에 대해 workitem 문서를 수정. 수정 후에도 양식 정합을 점검 (TEMPLATE의 섹션 번호 유지, FAC↔AC `## 7-1` 매핑 갱신, AC Given-When-Then 형식 유지, **`## 4-1. 변경 예정 파일/경로`도 plan 시점 채움 유지** — ADR-038 D6). `## 9. 의존성` 또는 `## 4-1`이 수정된 경우 그 사실을 *기록*해 step 7의 출력에 포함 (wave 재emit 안내용).
6. **삭제 전 사전 조건 점검** — (i) 모든 P0/P1 항목이 Adopt/Adopt-modified/Reject로 판정됐는가, (ii) P2 항목 중 deferred 결정된 항목이 모두 `docs/40-validation/IMPROVEMENT_GUIDE.md`로 *이미 이주*됐는가 (step 3-(b)). 둘 다 정합이면 삭제 진행.
   삭제는 step 1에서 회수한 파일 경로 목록을 *한 개씩 정확히* 수행 — `rm <path>` 반복 (glob 재실행 금지). 다른 workitem ID의 파일은 *건드리지 않는다*. 마지막 점검 — 회수한 모든 경로가 `docs/40-validation/plan-reviews/<workitem-id>.` 접두 + `.md` 접미 정합.

책임 경계:
- 코드 일체 수정 금지.
- 자동 커밋 금지 — 결과만 출력하고 commit은 사용자/메인 세션이 별도 발화.
- workitem 문서 외 파일 수정 금지 — **예외 1개**: `docs/40-validation/IMPROVEMENT_GUIDE.md`에 P2 deferred 항목 *append-only* 추가는 허용 (step 3-(b) 정합 + step 6 삭제 전 사전 조건). 그 외 산출물(QA_FINDINGS / report / ADR 등) 수정 금지.
- 본 workitem ID의 plan-review 파일만 삭제. 다른 ID의 plan-review 파일은 건드리지 않는다.

마지막 출력:
- 처리한 리뷰 파일 수 + 각 reviewer-tag 명단
- 결정 별 카운트:
  - Adopted: M개
  - Adopt-modified: K개
  - Rejected (false-positive): I개
  - Rejected (conflict): J개
  - P2 deferred → IMPROVEMENT_GUIDE 이주: L개 (이주된 항목의 IMPROVEMENT_GUIDE 라인 범위 함께 출력)
- 수정된 workitem 문서 목록 (상대 경로)
- **`## 9. 의존성` / `## 4-1` 수정 여부 플래그**: 둘 중 하나라도 수정됐으면 한 줄 안내 — `의존성·파일경로 수정됨 → 기존 wave 그룹 stale. /plan-workitem <id> 재실행해 wave 재산출 권장.` (재실행 시 본 SKILL의 step 11 derived view가 갱신됨.)
- 다중 리뷰어 충돌이 있었던 항목 별 결정 근거 (있으면)
- 삭제된 리뷰 파일 목록 (step 1에서 회수한 경로와 1:1 정합)
- 다음 권장 액션: 보통 `/implement-workitem <task-id>`. 의존성 또는 `## 4-1` 수정이 있었으면 `/plan-workitem <id>` 재실행이 먼저, 대규모 변경이면 `/validate-plan` 재실행 권장.

## 다중 리뷰어 충돌 처리 예시
- 리뷰어 A (`claude-b`): "[P1] [Plan-sizing] T-001 — AC 4개. T-001a/T-001b 분리 권장"
- 리뷰어 B (`codex`): "[P1] [Plan-sizing] T-001 — AC 4개. AC-4를 별 task로 빼고 AC-1~3을 1 task 유지"
- planner 결정: Adopt-modified B안 — "AC-4가 의존성 측면에서 독립 — T-001(AC-1~3) + T-007(AC-4 분리)이 wave 그룹화에 더 유리. charter ## 7 제약 정합."

## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 ADR/architecture 섹션은 task 본문에서 발화 시 인용 — 사전 fork-load 금지.
```

### 6-3. 검증
- 파일 존재: `ls .claude/skills/repair-plan/SKILL.md`
- `agent: planner` 포함 (validate-plan은 reviewer였음 — 분담 정확)
- allowed-tools에 `Bash(rm docs/40-validation/plan-reviews/*)` + `Bash(ls docs/40-validation/plan-reviews/*)`로 *좁혀진* 패턴 포함 (광역 `Bash(rm *)` 금지)
- 본문에 workitem-id sanitization 가드 + P2 deferred IMPROVEMENT_GUIDE 이주 단락 + 의존성·`## 4-1` 수정 시 wave 재emit 안내 포함
- `grep -c "ADR-038" .claude/skills/repair-plan/SKILL.md` — ≥1
- `grep -c "## 4-1" .claude/skills/repair-plan/SKILL.md` — ≥2 (수정 결과 점검 + wave 재emit 안내)

### 6-4. 커밋
```bash
git add .claude/skills/repair-plan/SKILL.md
git commit -m "$(cat <<'EOF'
feat(skills): add repair-plan to absorb cross-LLM review feedback (ADR-038)

- New /repair-plan skill: planner-agent based, reads all
  docs/40-validation/plan-reviews/<id>.*.md files for the workitem,
  decides accept/reject/modify per finding, applies adopted edits
  to workitem docs (incl. ## 4-1 plan-time best-effort fill), then
  deletes the temp review files.
- One-round budget P0+P1 only, P2 deferred to IMPROVEMENT_GUIDE.md
  before deletion (workitem-doc-only rule has an explicit IMPROVEMENT_
  GUIDE exception per D2).
- Emits wave-stale flag when ## 9. 의존성 or ## 4-1 가 수정됨.
EOF
)"
```

---

## 7. Phase 6 — `/plan-workitem` skill 확장 + TASK_TEMPLATE 주석 갱신

목적: 본 개선의 두 번째·세 번째·네 번째·다섯 번째 가지 (parallel waves + `## 4-1` plan 시점 채움 + LSP 보조 + worktree 권장)를 plan-workitem 본문에 박는다. 같은 commit으로 TASK_TEMPLATE 주석도 갱신 (plan-workitem이 `## 4-1`을 plan 시점에 채우는 정책이라 의미상 한 변경).

### 7-0. `.claude/skills/implement-workitem/SKILL.md` 본문 line 62 갱신 (D6 정합)

현재 본문 (line 62 근처):
```
마지막에 task 문서의 `## 4-1. 변경 예정 파일/경로`를 갱신한다(finalize의 add 참조 목록).
```

다음으로 *교체*:
```
마지막에 task 문서의 `## 4-1. 변경 예정 파일/경로`를 *plan 시점에 채운 값과 비교해 변동분만 증분 갱신*한다 (ADR-038 D6 정합 — plan-workitem이 best-effort로 채운 enumeration을 implement가 *덮어쓰기*가 아닌 *수정*만). 비어 있던 경우(예: scaffolding/auth 예외)는 implement가 처음 채워도 OK. 결과는 finalize의 add 참조 목록으로 사용.
```

검증:
```bash
grep -n "변동분만 증분 갱신" .claude/skills/implement-workitem/SKILL.md   # 1+ 라인
grep -c "마지막에 task 문서의 \`## 4-1. 변경 예정 파일/경로\`를 갱신한다(finalize의 add 참조 목록)\." .claude/skills/implement-workitem/SKILL.md   # 0 (구문 부재)
```

### 7-1. `docs/30-workitems/_templates/TASK_TEMPLATE.md` 주석 갱신

현재 본문 (line 14~17):
```
## 4-1. 변경 예정 파일/경로
<!-- 구현 시점에 채운다. /finalize-workitem이 명시적 파일 add 시 우선 참조한다.
     엄격한 화이트리스트가 아니라 참조 목록이다. 비어 있거나 git 실제 변경과 어긋나면 finalize는 차이를 출력에 명시하고 Needs Review로 즉시 종료한다 — 본 섹션을 갱신해 재실행하거나 `--apply` force 모드로 진행한다.
     task 문서 자체는 finalize가 자동 포함하므로 본 섹션에 적지 않는다. -->
```

다음으로 *교체*:
```
## 4-1. 변경 예정 파일/경로
<!-- plan 시점에 best-effort로 채운다 (ADR-038 D6). /plan-workitem이 task 분해 직후 본 섹션을 채운다 — wave 그룹 file overlap 점검의 기초 자료.
     구현 중 변동 시 /implement-workitem이 *변동분만 증분 갱신*한다. /finalize-workitem이 명시적 파일 add 시 우선 참조한다.
     엄격한 화이트리스트가 아니라 참조 목록이다. plan 시점 미채움 + 본문에 "scaffolding/auth 예외" 명시 없으면 /validate-plan이 [Plan-file-coverage] *P1 권장* finding으로 잡는다 (자동 차단 X). lock file은 ADR-007 amend 1 화이트리스트 자동 add라 박지 않음. bootstrap-project initial scaffold는 자동 면제. finalize 시점에 git 실제 변경과 어긋나면 차이를 출력에 명시하고 Needs Review로 즉시 종료한다 — 본 섹션을 갱신해 재실행하거나 `--apply` force 모드로 진행한다.
     task 문서 자체는 finalize가 자동 포함하므로 본 섹션에 적지 않는다. -->
```

### 7-2. `.claude/skills/plan-workitem/SKILL.md` 수정

다음 4곳을 *순서대로* 수정 (§7-2-A~C 본문 + §7-2-D frontmatter).

#### 7-2-A. "반드시 수행할 일" 단락 — step 10 갱신 + step 11 신설

현재 본문 (line 50 근처):
```
10. **task 의존성 채움** — TASK_TEMPLATE `## 9. 의존성`을 분해 시 명시. 병렬 가능 task는 비워둔다.
```

다음으로 *교체*:
```
10. **task 의존성 채움** — TASK_TEMPLATE `## 9. 의존성`을 분해 시 명시. 병렬 가능 task는 비워둔다.
10-1. **`## 4-1. 변경 예정 파일/경로` plan 시점 best-effort 채움** (ADR-038 D6) — 본 섹션을 task 분해 직후 best-effort로 채운다.
   - 채울 내용: 해당 task가 *추가/수정/삭제할 예정인 모든 파일 경로* enumeration (구현 시점 변동 가능성은 받아들이되, plan 시점 best estimate를 명시).
   - sizing self-check의 *변경 예정 파일 5개 한도*가 본 섹션을 기준으로 발화 (Step 8).
   - **lock file은 박지 않는다** — ADR-007 amend 1의 lock file 11종 화이트리스트 자동 add 정책 + D8의 dependency 키워드 감지로 자동 단독 wave 분리되므로 `## 4-1` 명시 불요.
   - 본문에 *"scaffolding/auth 예외"* 명시 + 사유 1줄이 있으면 미채움 허용 (validate-plan P2로 강등 또는 reporting only).
   - bootstrap-project initial scaffold task는 *자동 면제* — task ID 또는 본문에서 bootstrap-phase 식별 시 미채움 허용.
   - 일반 task는 미채움 시 plan 출력에 `[Plan-file-coverage] T-NNN — plan 시점 미채움 (validate-plan P1 후보)` 경고 1줄 추가. **자동 차단 X** — 사용자가 결정.

11. **wave 그룹 계산 + 파일 overlap 경고 + worktree 권장** (ADR-038 D3 / D7 / D8 / D9) — 다음 sub-step을 순서대로 수행. 결과는 본 skill *출력에만 echo* — workitem 문서 본문에 영속 저장 X (`## 9. 의존성` + `## 4-1`이 SSOT — ADR-005 정합).

11-(a) **위상 정렬**: task `## 9. 의존성`을 위상 정렬해 wave 그룹을 derived view로 산출. ADR-026 `## 9` 형식이 자연어 허용(`- T-002: T-001의 X 정의 후 시작 가능`)이라 *기계 파싱 가능한 표기*(`- T-NNN: ...` prefix의 task ID enumeration)를 우선 회수 — 그 외 자유 텍스트는 best-effort heuristic, 호출마다 wave 결과가 달라질 수 있음을 출력에 명시.

11-(b) **`## 4-1` 기반 file overlap 점검** (1차):
   - 동일 wave 내 두 task의 `## 4-1` enumeration 교집합이 비지 않으면 overlap.
   - `## 4-1`이 비어 있는 task는 본 점검 skip + 출력에 `[Plan-file-coverage]` 경고 echo.

11-(c) **LSP-backed MCP import dependency graph 보조 회수** (2차, ADR-038 D7 — *가용 시*):
   - 본 skill이 호출 가능한 MCP 도구 중 *LSP의 references / definitions / call hierarchy* 같은 cross-file symbol 조회를 노출하는 server가 있는지 빠르게 검출 (예: Serena MCP, multilspy, generic LSP↔MCP bridge — fork 사용자가 별도 설치).
   - **공식 IDE MCP `mcp__ide__getDiagnostics`는 본 용도에 부적합**: diagnostics(오류/경고)만 반환하지 import graph를 노출하지 않음. 본 sub-step에서 회수 대상이 아니다.
   - 가용 시: 각 task의 `## 4-1` enumeration 파일에 대해 *해당 파일을 import하는 다른 파일 목록*을 LSP에 회수. 두 task의 import-grand-parent 집합 교집합이 비지 않으면 "공유 모듈 후보" 경고 출력.
   - 가용 안 함: 출력에 `LSP-backed MCP 미가용 — import graph 점검 skip` 한 줄 echo + 휴리스틱 fallback (현행 path-like 토큰 비교).
   - **MCP 호출 권한**: 본 sub-step이 실제로 동작하려면 fork 사용자가 frontmatter `allowed-tools`에 LSP-backed MCP server 패턴(예: `mcp__serena__*`)을 추가해야 prompt 없이 호출 가능. 미추가 시 default permission mode에서 prompt가 발생하며 `context: fork` sub-agent에서는 prompt 응답이 어려워 *결과적으로 skip*될 수 있다 — 그 경우 가용 안 함 분기로 진입.
   - **자동 차단 X** — best-effort. 정확도는 LSP 서버의 indexing 상태에 의존.

11-(d) **새 dependency 추가 키워드 감지** (3차, ADR-038 D8 — lockfile race 출력 표시):
   - task 본문(`## 3. 구현 항목` / `## 4-1`)에서 다음 키워드 중 1+ 감지 시 *plan-workitem 출력*에 "단독 wave (lockfile race risk)" 라벨 echo:
     - 명시 경로: `package.json`, `pnpm-lock.yaml`, `package-lock.json`, `yarn.lock`, `bun.lockb`, `Cargo.toml`, `Cargo.lock`, `Gemfile`, `Gemfile.lock`, `composer.json`, `composer.lock`, `pyproject.toml`, `Pipfile`, `Pipfile.lock`, `poetry.lock`, `uv.lock`, `go.mod`, `go.sum`, `requirements.txt`
     - 의도 키워드: `의존성 추가` / `dependency 추가` / `package 추가` / `npm install` / `pnpm add` / `pip install` / `cargo add` 등
   - 출력에 `⚠ lockfile-race risk: T-NNN을 단독 wave로 표시 (의존성 추가 키워드 감지) — 사용자가 wave 구성 결정` 줄 추가.
   - **자동 차단 X / 영속 저장 X / 출력 echo만** — step 11-(f)의 "자동 분리 X" 원칙 정합 (workitem 문서는 수정하지 않음).

11-(e) **fallback heuristic** (LSP-backed MCP 미가용 + `## 4-1`이 비어 있어 (b) 점검을 못 한 task에 대해):
   - `## 3. 구현 항목` 본문에서 *path-like 토큰* (`src/...`, `docs/...`, `*.ts` 등 슬래시·확장자 포함) 만 추출해 비교. 일반 자연어 키워드는 사용하지 않음 (false-positive 회피).
   - (b) `## 4-1` 직접 비교가 가능한 task끼리는 본 fallback을 *적용하지 않는다* (이중 매칭 회피).

11-(f) **자동 분리 X**:
   - 본 점검들은 *경고 출력만*. 사용자가 wave 내에서 sequential 진행 / 별 worktree 분리 / 그대로 동시 진행 중 결정.
```

#### 7-2-B. "마지막 출력" 단락 확장

현재 본문 (line 81~100 사이) "마지막 출력" 단락의 끝부분(다음 추천 단계 단락의 앞)에 다음 항목을 추가한다.

현재 마지막 출력 마지막 단락이:
```
- 다음 추천 단계(보통 `/implement-workitem [task-id]`)
```

다음으로 *교체*:
```
- **병렬 실행 그룹 (parallel waves)** — task `## 9. 의존성` + `## 4-1` 기반 위상 정렬 (자유 텍스트 dep는 best-effort). 다음 형식으로 echo:
  ```
  Wave 1 (병렬 가능): T-001, T-002, T-003
  Wave 2 (Wave 1 종료 후): T-004 (deps: T-001), T-005 (deps: T-002)
  Wave 3 (Wave 2 종료 후): T-006 (deps: T-004, T-005)
  Wave 4 (단독 — lockfile race risk): T-007 (의존성 추가 감지)
  ```
  - 동일 wave 내 두 task의 *file overlap 점검* — step 11-(b)의 `## 4-1` enumeration 우선, step 11-(c)의 LSP 보조 (가용 시), step 11-(e) 휴리스틱 fallback 정합. 매칭 시 다음 형식으로 wave 그룹 아래 추가:
    ```
    ⚠ file overlap 의심: T-NNN ↔ T-MMM (## 4-1 직접 겹침: <경로>) — sequential 또는 worktree 분리 권장
    ⚠ 공유 모듈 후보 (LSP): T-NNN ↔ T-MMM (공통 import: <경로>) — sequential 또는 worktree 분리 권장
    ⚠ lockfile-race risk: T-NNN을 단독 wave로 분리 (의존성 추가 키워드 감지)
    ```
  - `[Plan-file-coverage]` 경고가 있는 task는 wave 그룹 위에 별도로 echo: `[Plan-file-coverage] T-NNN — ## 4-1 미채움 (validate-plan P1 권장 후보, scaffolding 예외 미명시, bootstrap initial scaffold 아님)`.
  - **병렬 실행 권장 패턴** (ADR-038 D9): `claude --worktree` 사용 — Claude Code 2026-02-21 native worktree support. 동일 wave의 각 task를 별 worktree·별 터미널·별 세션에서 진행. 단일 working tree 동시 implement는 file 충돌 + git index race + 빌드 캐시 충돌 위험이라 비권장. **빌드 캐시 / 통합 테스트 / DB·포트 등 외부 리소스는 worktree만으로는 격리되지 않음 — 프로젝트 환경 설계로 격리 (ADR-038 면책 단락 참조)**.
  - *주의*: DELEGATION_STRATEGY.md `## 병렬 패턴 3종` 표의 1·2·3은 *메인 세션이 sub-agent를 어떻게 호출하느냐*의 orchestration 패턴 — 본 wave 그룹은 *사용자가 여러 터미널·세션을 직접 띄우는* multi-session 시나리오라 독립 차원. ADR-038 본문이 그 관계를 명시.
- **LSP/MCP 가용 여부 안내** — step 11-(c) 결과 한 줄:
  - 가용: `LSP/MCP import 그래프 점검: <서버 이름> 사용, N개 공유 모듈 후보 회수`
  - 미가용: `LSP/MCP 미가용 — import 그래프 점검 skip (휴리스틱 fallback)`
- **Cross-review opt-in 안내** (ADR-038) — 다음 한 줄 안내 출력:
  ```
  품질 확신이 부족하면: 다른 세션·다른 LLM에서 `/validate-plan <workitem-id>` 1+ 회 → 원본 세션에서 `/repair-plan <workitem-id>` 회수.
  ```
- 다음 추천 단계 (보통 `/implement-workitem [task-id]` — wave 그룹 병렬 시 `claude --worktree T-NNN -p "/implement-workitem T-NNN"` 패턴(이름 첫 positional 인자 *반드시* 명시 — 미명시 시 자동 이름이 붙어 `.claude/worktrees/T-NNN/`에 안 생김), 또는 cross-review를 끼우려면 `/validate-plan [workitem-id]` 먼저)
```

#### 7-2-C. "Cross-review hook" 단락 신설

본 skill의 `## Context 정책 (ADR-019)` 단락 *바로 앞*에 다음 단락을 *삽입*:

```
## Cross-review hook (ADR-038)
본 skill 호출 후 plan 품질에 확신이 부족하거나 다중 모델 관점을 원하면:
1. 별 터미널·별 세션 (Claude 또는 Codex)에서 `/validate-plan <workitem-id> [--reviewer-tag <tag>]` 1+ 회 실행. 각 호출이 `docs/40-validation/plan-reviews/<id>.<tag>.md` 1개를 작성.
2. 원본 세션 (본 skill을 돌린 세션)에 돌아와 `/repair-plan <workitem-id>` 실행. 모든 리뷰 파일을 회수해 workitem 문서를 수정 + 리뷰 파일 삭제.

본 흐름은 *opt-in*. 건너뛰어도 워크플로우 정상 작동.

## Worktree 권장 패턴 (ADR-038 D9)
본 skill의 wave 그룹 출력은 사용자가 같은 wave의 task를 *별 세션*에서 동시 `/implement-workitem`으로 진행할 수 있음을 가시화한다. 운영 권장:
- Claude Code native worktree support 사용 — **이름을 첫 positional 인자로** 명시: `claude --worktree T-NNN -p "/implement-workitem T-NNN"`. 이름 명시 시 worktree가 `.claude/worktrees/T-NNN/`에 생성된다 ([공식 문서](https://code.claude.com/docs/en/worktrees)). 이름을 *생략*하면 자동 이름(예: `bright-running-fox`)이 붙어 task-id와 매칭 안 되므로 *반드시 이름 명시*.
- 단일 working tree에서 다중 implement 동시 실행은 비권장 (file 충돌 + git index race + 빌드 캐시 충돌).
- 외부 리소스(DB / 포트 / lockfile) 격리는 *프로젝트 환경 책임* — ADR-038 면책 단락 참조.
- 적정 concurrent worktree 수는 *프로젝트 규모와 환경에 따라 다름* — fork 사용자가 직접 측정·결정.
- **`-p` + `--worktree` 조합 주의**: 공식 문서상 non-interactive run(`-p`)으로 만든 worktree는 *자동 cleanup 안 됨*. 작업 후 `git worktree remove .claude/worktrees/T-NNN`으로 수동 정리.

본 skill은 worktree를 *자동 spawn하지 않는다* — 사용자가 명시 실행.
```

#### 7-2-D. frontmatter `allowed-tools` — LSP-backed MCP 권한 (옵션, fork별)

현재 frontmatter (line 1~10 근처):
```yaml
---
name: plan-workitem
description: ...
argument-hint: "[milestone or feature id]"
disable-model-invocation: true
allowed-tools: Read Glob Grep Write Edit
context: fork
agent: planner
context-pack: minimal
---
```

**baseline 보일러플레이트의 frontmatter는 변경하지 않는다** — LSP-backed MCP server는 fork별로 다르고 baseline이 *제공하지 않으며 전제도 하지 않음* (ADR-038 D7). 본 가이드의 *본문* 변경(§7-2-A step 11-(c))만 적용하면 step 11-(c)가 *가용 시* 활성화 + *미가용 시* 휴리스틱 fallback의 두 분기로 정합 작동.

**fork 사용자가 LSP-backed MCP server를 추가한 경우 (옵션 — baseline 작업 비범위)**: fork 사용자가 step 11-(c)를 prompt 없이 활성화하고 싶으면 *본인 fork의* plan-workitem SKILL frontmatter `allowed-tools`에 해당 MCP server 패턴을 추가한다. 예 (Serena MCP 설치한 fork의 경우):

```yaml
allowed-tools: Read Glob Grep Write Edit mcp__serena__*
```

근거: [Claude Code 공식 permissions 문서](https://code.claude.com/docs/en/permissions#mcp) — `mcp__<server>__<tool>` 또는 와일드카드 `mcp__<server>__*` 표기. `allowed-tools` 항목은 *prompt 없이 사전 승인*하는 의미이며 도구 자체를 *제한*하지 않는다 ([공식 skills 문서](https://code.claude.com/docs/en/skills#pre-approve-tools-for-a-skill)). 부재 시 default permission mode에서 prompt가 발생하며 `context: fork` sub-agent에서 응답이 어려워 step 11-(c)가 결과적으로 skip된다.

**본 IMPROVE-GUIDE 범위에서는 본 frontmatter 줄을 *변경하지 않는다***. baseline 보일러플레이트는 LSP-backed MCP server 전제 X이므로 step 11-(c)는 *미가용* 분기로 default 작동 — file overlap 점검은 step 11-(b) `## 4-1` 직접 비교 + step 11-(e) 휴리스틱 fallback으로 충분. 본 sub-section은 fork 사용자를 위한 안내일 뿐.

### 7-3. 검증
- `grep -n "wave" .claude/skills/plan-workitem/SKILL.md` — ≥5 결과 (step 11 + 마지막 출력)
- `grep -c "ADR-038" .claude/skills/plan-workitem/SKILL.md` — ≥3
- `grep -c "validate-plan" .claude/skills/plan-workitem/SKILL.md` — ≥3
- `grep -c "## 4-1" .claude/skills/plan-workitem/SKILL.md` — ≥4 (step 10-1 + step 11-(b) + 출력 단락 + Plan-file-coverage 안내)
- `grep -c "worktree" .claude/skills/plan-workitem/SKILL.md` — ≥3
- `grep -c "LSP" .claude/skills/plan-workitem/SKILL.md` — ≥2
- `grep -nF "mcp__ide__getDiagnostics" .claude/skills/plan-workitem/SKILL.md` — *공식 IDE MCP는 본 용도에 부적합* 명시가 step 11-(c)에 매칭되어야 함 (1+ 라인).
- `grep -n "plan 시점" docs/30-workitems/_templates/TASK_TEMPLATE.md` — 새 주석 단락 매칭
- **frontmatter `allowed-tools` 미변경 확인**:
  ```bash
  grep -n "^allowed-tools:" .claude/skills/plan-workitem/SKILL.md
  ```
  결과가 *baseline 그대로* (`Read Glob Grep Write Edit`)여야 함. §7-2-D가 frontmatter를 *변경하지 않는* 정책임을 자기 점검.
- 본문 line count 변화는 합리 (대략 +95~115 라인 정도 — step 10-1 + step 11 sub-step 6개 + 출력 단락 확장 + Cross-review hook 단락 + Worktree 권장 패턴 단락 + §7-2-D frontmatter 안내).

### 7-4. 커밋
```bash
git add .claude/skills/plan-workitem/SKILL.md
git add .claude/skills/implement-workitem/SKILL.md
git add docs/30-workitems/_templates/TASK_TEMPLATE.md
git commit -m "$(cat <<'EOF'
feat(plan-workitem): emit parallel waves + ## 4-1 plan-time best-effort + LSP/worktree guidance (ADR-038)

- Adds step 10-1: ## 4-1. 변경 예정 파일/경로 plan-time best-effort fill
  (P1 finding when empty without scaffolding exception — reconciles with
  ADR-007 amend 1 lock-file simplicity by separating plan-time enumeration
  from finalize-time strict whitelist).
- Adds step 11: topological wave grouping with sub-steps (a)~(f):
  ## 4-1 overlap, LSP-backed MCP import graph (when fork has a separate
  LSP↔MCP server — official IDE MCP only exposes diagnostics/Jupyter,
  not import graph), dependency-keyword lockfile-race output-only marker,
  fallback heuristic.
- Output echoes wave groups + file-overlap warnings + shared-module
  candidates (LSP) + lockfile-race single-wave marker + worktree pattern
  with name-first arg.
- Cross-review hook + Worktree section guides users to opt-in flows.
- TASK_TEMPLATE ## 4-1 comment now says "plan 시점에 best-effort로 채운다".
- Wave grouping is derived view only — no new persistent storage to keep
  ## 9. 의존성 + ## 4-1 as SSOT (ADR-005).
EOF
)"
```

---

## 8. Phase 7 — SSOT 문서 갱신 (STRUCTURE / WORKFLOW / DELEGATION_STRATEGY)

목적: 신규 산출물 / 신규 워크플로우 가지 / 위임 트리거 표 / worktree 정책을 SSOT 문서에 박는다. 1 commit.

### 8-1. `docs/00-meta/STRUCTURE.md` 갱신

#### 8-1-A. Skill 본문 행의 카운트 갱신

현재 (line 31):
```
| Claude skill 본문 | `.claude/skills/<name>/SKILL.md` (13종 — bootstrap-project/bootstrap-stack/bootstrap-design/discover-product/plan-workitem/implement-workitem/validate-workitem/repair-workitem/finalize-workitem/stabilize-milestone/stack-guard/review-doc/boilerplate-context) | 수동 (boilerplate 제공) | Reference | baseline |
```

다음으로 *교체*:
```
| Claude skill 본문 | `.claude/skills/<name>/SKILL.md` (15종 — bootstrap-project/bootstrap-stack/bootstrap-design/discover-product/plan-workitem/validate-plan/repair-plan/implement-workitem/validate-workitem/repair-workitem/finalize-workitem/stabilize-milestone/stack-guard/review-doc/boilerplate-context) | 수동 (boilerplate 제공) | Reference | baseline |
```

#### 8-1-B. 신규 산출물 행 추가

`validation report` 행 *바로 다음*에 새 행을 추가한다. 현재 (line 36):
```
| validation report | `docs/40-validation/reports/<task-id>.md` | `/validate-workitem` | ephemeral | generated |
```

그 *직후* 1행 *삽입*:
```
| plan review | `docs/40-validation/plan-reviews/<workitem-id>.<reviewer-tag>.md` | `/validate-plan` (다른 세션·다른 LLM) | ephemeral | generated |
```

#### 8-1-C. Canonical Owner 매핑 표에 행 추가

표 마지막 행 (line 94):
```
| Evidence label (`[관측됨]`/`[외부실증]`/`[가설]` + 합성 표기) | [ADR-022](../90-decisions/boilerplate/ADR-022-ratchet-principle.md) (정책 SSOT). 적용 surface: `docs/40-validation/QA_FINDINGS.md` / `IMPROVEMENT_GUIDE.md` 항목 스키마 — 두 파일의 evidence label 룰은 본 ADR 본문 인용. |
```

그 *직후* 4행 *삽입*:
```
| Cross-LLM plan validation (opt-in peer review) | [ADR-038](../90-decisions/boilerplate/ADR-038-cross-llm-plan-validation.md) (정책 SSOT). 적용 surface: `.claude/skills/validate-plan/SKILL.md` + `.claude/skills/repair-plan/SKILL.md` 본문 + `.claude/agents/reviewer.md` Plan Quality 9 차원 — 세 surface가 한 묶음, ADR-038 본문 변경 시 동기 갱신. |
| Parallel waves 위상 정렬 derived view (`## 9. 의존성` + `## 4-1` 기반) | `.claude/skills/plan-workitem/SKILL.md` Step 11 + "마지막 출력" 단락 (SSOT는 `task ## 9. 의존성` + `task ## 4-1. 변경 예정 파일/경로` — derived view는 영속 저장 X). |
| `## 4-1. 변경 예정 파일/경로` 책임 시점 (plan 시점 best-effort 채움) | [ADR-038](../90-decisions/boilerplate/ADR-038-cross-llm-plan-validation.md) D6 (정책 SSOT). 적용 surface: `docs/30-workitems/_templates/TASK_TEMPLATE.md` `## 4-1` 주석 + `.claude/skills/plan-workitem/SKILL.md` Step 10-1 + `.claude/skills/validate-plan/SKILL.md` [Plan-file-coverage] 차원. |
| Worktree 권장 정책 (병렬 implement) | [ADR-038](../90-decisions/boilerplate/ADR-038-cross-llm-plan-validation.md) D9 (정책 SSOT). 적용 surface: `.gitignore` `.claude/worktrees/` 패턴 + `.claude/skills/plan-workitem/SKILL.md` "Worktree 권장 패턴" 단락 + `docs/00-meta/DELEGATION_STRATEGY.md` 병렬 패턴 단락 + README. |
```

### 8-2. `docs/00-meta/WORKFLOW.md` 갱신

#### 8-2-A. "3. 작업 단위 분해" 단락 확장 + line 25 신구 정책 충돌 해소

**작업 1 — line 12~15 단락 교체**:
```
## 3. 작업 단위 분해
- 마일스톤 단위 목표를 `docs/30-workitems/milestones`에 만든다.
- 기능 단위 문서를 `docs/30-workitems/features`에 만든다.
- 실제 구현 단위 문서를 `docs/30-workitems/tasks`에 만든다.
```

다음으로 *교체*:
```
## 3. 작업 단위 분해
- 마일스톤 단위 목표를 `docs/30-workitems/milestones`에 만든다.
- 기능 단위 문서를 `docs/30-workitems/features`에 만든다.
- 실제 구현 단위 문서를 `docs/30-workitems/tasks`에 만든다.
- task의 `## 4-1. 변경 예정 파일/경로`는 **plan 시점에 best-effort로 채운다** (ADR-038 D6). 구현 중 변동 시 implement-workitem이 *변동분만* 갱신. lock file은 ADR-007 amend 1 화이트리스트 자동 add라 박지 않음.
- **선택**: `/plan-workitem` 직후 plan 품질 cross-validate가 필요하면, 다른 세션·다른 LLM에서 `/validate-plan <workitem-id>` 1+ 회 → 원본 세션에서 `/repair-plan <workitem-id>`로 회수 (ADR-038). opt-in — 건너뛰어도 정상.
- **선택**: `/plan-workitem` 출력의 wave 그룹을 참조해 동일 wave task를 별 worktree에서 동시 `/implement-workitem` 가능. 권장 패턴은 `claude --worktree T-NNN -p "..."` (이름 첫 인자 필수, ADR-038 D9). 단일 working tree 동시 implement는 비권장.
```

**작업 2 — line 25의 *구* 정책 1줄 삭제**:

현재 line 25:
```
- task `## 4-1. 변경 예정 파일/경로`는 implement 중 채운다 — plan 단계에서 미리 채울 의무 없음.
```

본 줄을 *완전 삭제* (위 작업 1의 신정책과 정반대 — 신구 정책 공존 차단). 자기 점검:
```bash
grep -cF "implement 중 채운다 — plan 단계에서 미리 채울 의무 없음" docs/00-meta/WORKFLOW.md
# 결과 = 0
```

#### 8-2-B. "워크아이템 라이프사이클" 다이어그램 갱신

현재 본문 (line 76~79):
```
```
discover → bootstrap → plan → implement → validate ─┬─Pass─→ finalize → stabilize
                                                     └─Needs Fix─→ repair → (validate 재실행)
```
```

다음으로 *교체*:
```
```
discover → bootstrap → plan ─┬─→ implement → validate ─┬─Pass─→ finalize → stabilize
                              │   (wave 병렬 시          └─Needs Fix─→ repair → (validate 재실행)
                              │    claude --worktree)
                              │
                              └─(opt-in, ADR-038)─→ validate-plan (별 세션) → repair-plan (원본 세션) → implement
```
```

### 8-3. `docs/00-meta/DELEGATION_STRATEGY.md` 갱신

#### 8-3-A. 위임 트리거 표에 행 추가

현재 표 (line 25~36) 마지막 본문 행이:
```
| 장문 코드/문서 탐색 | Explore 등 built-in subagent | 선택적 사용. 메인 컨텍스트 오염 방지 |
```

그 *직전*에 (또는 다른 적절한 위치에) 2 행을 *삽입*:
```
| `/plan-workitem` 산출물의 cross-LLM peer review (opt-in) | reviewer (plan surface, Plan Quality 9 차원) | 다른 세션 (Claude 새 창 / Codex 등)에서 `$validate-plan` or `/validate-plan` 호출. 임시 리뷰 파일 1개만 작성, workitem 문서 수정 X (ADR-038). |
| Cross-review 결과 회수 + workitem 문서 수정 | planner | 원본 plan 세션에서 `/repair-plan`. 임시 리뷰 파일 회수 → 결정 → 적용 → 파일 삭제 (ADR-038). |
```

#### 8-3-B. "스킬 실행 순서 가이드" 단락 갱신

현재 본문 (line 82~92):
```
1. `/bootstrap-project` → charter + architecture + 초기 workitem 생성
2. `/bootstrap-stack` → 스택 확정 후 자동화 설계
3. `/plan-workitem` → milestone/feature/task 분해
4. `/implement-workitem` → task 구현
5. `/validate-workitem` → 판정 + report 기록
6. `/repair-workitem` (Needs Fix일 때만) → report의 실패 항목 수정
7. `/finalize-workitem` (Pass일 때) → status `done` 갱신 + 명시적 파일 add + Conventional Commits 커밋 (정책: [ADR-007](../90-decisions/boilerplate/ADR-007-workitem-lifecycle.md), [ADR-008](../90-decisions/boilerplate/ADR-008-commit-convention.md))
8. 마일스톤의 모든 task가 `done`이 되면 `/stabilize-milestone` — 통합 점검(코드 수정·커밋·status 변경 금지). 정책: [ADR-007](../90-decisions/boilerplate/ADR-007-workitem-lifecycle.md).
   - `/stabilize-milestone`은 evaluator-optimizer pattern의 evaluator orchestration이다 (ADR-014 amend 1) — generator=`/implement-workitem`, optimizer=`/repair-workitem`.
```

3번 항목 *직후*에 새 3a/3b 항목 추가:
```
3a. (선택) `/validate-plan <workitem-id>` — 다른 세션·다른 LLM에서 cross-review. 임시 파일 작성 (ADR-038).
3b. (선택) `/repair-plan <workitem-id>` — 원본 plan 세션에서 임시 파일 회수 + 적용 + 삭제 (ADR-038).
```

#### 8-3-C. 병렬 패턴 단락에 명시 추가

"병렬 패턴 3종" 표 *바로 아래* "선택 기준" 단락 (line 71):
```
선택 기준 — 가벼운 병렬: 1, 같은 파일 충돌 가능성 있는 단일 작업: 2, 작업 단위가 분명한 codebase-wide 분산 작업: 3.
```

다음으로 *교체*:
```
선택 기준 — 가벼운 병렬: 1, 같은 파일 충돌 가능성 있는 단일 작업: 2, 작업 단위가 분명한 codebase-wide 분산 작업: 3.

`/plan-workitem` 출력의 wave 그룹은 **본 표의 1·2·3과는 독립 차원**이다. 본 표의 1·2·3은 메인 세션이 sub-agent를 한 turn 안에서 어떻게 호출하느냐(orchestration). wave 그룹은 *사용자가 여러 터미널·세션을 띄워 동일 wave의 task를 `/implement-workitem`으로 동시 진행*하는 multi-session 시나리오 (ADR-038). 두 차원이 직교하므로 — wave 안의 한 task를 *내부적으로* sub-agent 분기할 때 본 표의 1·2·3을 별도로 선택한다.

**Wave 그룹 병렬 실행 권장 패턴** (ADR-038 D9):
- Claude Code native worktree support 사용 — **이름을 첫 positional 인자로** 명시: `claude --worktree T-NNN -p "/implement-workitem T-NNN"` 패턴으로 각 task가 `.claude/worktrees/T-NNN/`에 별 working directory를 갖는다. main checkout과 git index가 격리됨. *이름 미명시 시* 자동 이름(예: `bright-running-fox`)이 붙어 task-id와 매칭 안 됨. 공식 문서: [worktrees](https://code.claude.com/docs/en/worktrees).
- 단일 working tree에서 다중 implement 동시 실행은 file 충돌 + git index race + 빌드 캐시 충돌 위험이라 **비권장**.
- 외부 리소스(DB / 포트 / lockfile / 빌드 캐시)는 worktree만으로는 격리되지 않음 — *프로젝트 환경 설계 책임* (Docker Compose · testcontainers · 임시 포트 / DB instance / 빌드 캐시 디렉터리 분리 등). ADR-038 면책 단락 참조.
- 적정 concurrent worktree 수는 *프로젝트 규모·환경에 따라 다름* — fork 사용자가 직접 측정·결정.
- **`-p` + `--worktree` non-interactive 조합**: 공식 문서상 자동 cleanup 안 됨. 작업 후 `git worktree remove .claude/worktrees/T-NNN`으로 수동 정리.
- file overlap 경고가 있는 wave 자체는 sequential 실행 또는 worktree 분리 결정 (자동 차단 X — 사용자 결정).
```

### 8-4. 검증
- `grep -c "validate-plan" docs/00-meta/STRUCTURE.md` — ≥1
- `grep -c "ADR-038" docs/00-meta/STRUCTURE.md` — ≥4 (산출물 행 + canonical owner 4행)
- `grep -c "validate-plan" docs/00-meta/WORKFLOW.md` — ≥1
- `grep -c "## 4-1" docs/00-meta/WORKFLOW.md` — ≥1
- `grep -c "worktree" docs/00-meta/WORKFLOW.md docs/00-meta/DELEGATION_STRATEGY.md` — ≥3 합산
- `grep -c "validate-plan" docs/00-meta/DELEGATION_STRATEGY.md` — ≥1
- `grep -c "wave" docs/00-meta/WORKFLOW.md docs/00-meta/DELEGATION_STRATEGY.md` — ≥3 합산

### 8-5. 커밋
```bash
git add docs/00-meta/STRUCTURE.md docs/00-meta/WORKFLOW.md docs/00-meta/DELEGATION_STRATEGY.md
git commit -m "$(cat <<'EOF'
docs(boilerplate): wire validate-plan/repair-plan + ## 4-1 + worktree into SSOT docs (ADR-038)

- STRUCTURE.md: skill count 13 -> 15, new plan-review artifact row,
  canonical owner rows for ADR-038 / parallel waves derived view /
  ## 4-1 책임 시점 / worktree 권장.
- WORKFLOW.md: section 3 sub-loop + ## 4-1 plan-time best-effort hint
  (line 25 prior 'implement 중 채운다' policy replaced for D6 정합),
  lifecycle diagram updated with worktree hint.
- DELEGATION_STRATEGY.md: delegation triggers for plan cross-review,
  skill order 3a/3b, parallel-pattern wave mapping + worktree
  recommendation (name-first CLI arg) + 외부 리소스 면책 안내.
EOF
)"
```

---

## 9. Phase 8 — Codex wrapper 신설 (`.agents/skills/validate-plan` + `.agents/skills/repair-plan`)

목적: ADR-010 D4 (Codex wrapper 패턴) 정합. 신규 2 skill을 Codex 측에서도 동일하게 호출 가능하게 한다.

### 9-1. `validate-plan` wrapper 생성

#### 9-1-A. 디렉터리 + 파일
```bash
mkdir -p .agents/skills/validate-plan/agents
```

#### 9-1-B. `.agents/skills/validate-plan/SKILL.md`

새 파일에 다음을 그대로 작성 (기존 `.agents/skills/plan-workitem/SKILL.md`와 동일 패턴):

```markdown
---
name: validate-plan
description: Use ONLY when the user explicitly types `$validate-plan <workitem-id>`. Do not trigger implicitly from generic phrasing.
---

Source of truth: `.claude/skills/validate-plan/SKILL.md`. Read it and follow the workflow.

Treat all frontmatter keys other than `name` and `description` (e.g., `agent:`, `disable-model-invocation:`, `allowed-tools:`, `context:`, `argument-hint:`, `model:`, `effort:`) as Claude-only and ignore them — execute locally in Codex.

**Slash command translation**: 본문 안의 `/validate-plan` 표기는 Claude 슬래시 커맨드다. Codex에서는 `$validate-plan`으로 읽고 사용자에게 안내한다. 본문에 등장하는 `/repair-plan` 표기도 `$repair-plan`으로 안내 (예: 본문 "다음 단계: `/repair-plan M1`" → Codex 응답에서는 "다음 단계: `$repair-plan M1`"). Codex CLI는 `/`를 빌트인 슬래시 커맨드에 쓰므로 명시적 치환이 필요.

Preserve all repo policies from `AGENTS.md` and `docs/`.

If the source path no longer exists, this wrapper is stale — see ADR-010.
```

#### 9-1-C. `.agents/skills/validate-plan/agents/openai.yaml`

새 파일에 다음을 작성:
```yaml
policy:
  allow_implicit_invocation: false
```

### 9-2. `repair-plan` wrapper 생성

#### 9-2-A. 디렉터리 + 파일
```bash
mkdir -p .agents/skills/repair-plan/agents
```

#### 9-2-B. `.agents/skills/repair-plan/SKILL.md`

새 파일에 다음을 그대로 작성:

```markdown
---
name: repair-plan
description: Use ONLY when the user explicitly types `$repair-plan <workitem-id>`. Do not trigger implicitly from generic phrasing.
---

Source of truth: `.claude/skills/repair-plan/SKILL.md`. Read it and follow the workflow.

Treat all frontmatter keys other than `name` and `description` (e.g., `agent:`, `disable-model-invocation:`, `allowed-tools:`, `context:`, `argument-hint:`, `model:`, `effort:`) as Claude-only and ignore them — execute locally in Codex.

**Slash command translation**: 본문 안의 `/repair-plan` 표기는 Claude 슬래시 커맨드다. Codex에서는 `$repair-plan`으로 읽고 사용자에게 안내한다. 본문에 등장하는 `/implement-workitem`, `/validate-plan` 표기도 각각 `$implement-workitem`, `$validate-plan`으로 안내. Codex CLI는 `/`를 빌트인 슬래시 커맨드에 쓰므로 명시적 치환이 필요.

Preserve all repo policies from `AGENTS.md` and `docs/`.

If the source path no longer exists, this wrapper is stale — see ADR-010.
```

#### 9-2-C. `.agents/skills/repair-plan/agents/openai.yaml`

새 파일에 다음을 작성:
```yaml
policy:
  allow_implicit_invocation: false
```

### 9-3. 검증
- `ls .agents/skills/validate-plan/SKILL.md .agents/skills/repair-plan/SKILL.md` — 둘 다 존재
- `ls .agents/skills/validate-plan/agents/openai.yaml .agents/skills/repair-plan/agents/openai.yaml` — 둘 다 존재
- 본문 안에 `.claude/skills/validate-plan/SKILL.md` / `.claude/skills/repair-plan/SKILL.md` 경로 정확히 표시

### 9-4. 커밋
```bash
git add .agents/skills/validate-plan .agents/skills/repair-plan
git commit -m "$(cat <<'EOF'
feat(codex): add wrappers for validate-plan and repair-plan (ADR-010, ADR-038)

Thin wrappers that delegate to .claude/skills/<name>/SKILL.md SSOT.
Includes \$-prefixed slash translation note and explicit
allow_implicit_invocation: false to prevent silent triggering.
EOF
)"
```

---

## 10. Phase 9 — README.md / README_ko.md 갱신

목적: 사용자가 가장 먼저 보는 진입 문서에 신규 워크플로우 가지 + worktree 권장을 안내.

### 10-1. `README.md` 갱신

#### 10-1-A. "Overall Flow" 다이어그램 갱신

현재 본문 (line 18~25):
```
```
/discover-product (optional)
  → /bootstrap-project → /bootstrap-stack → /stack-guard
  → /bootstrap-design (frontend only — fills DESIGN.md)
  → /plan-workitem → /implement-workitem
  → /validate-workitem → /repair-workitem (if Needs Fix) → /finalize-workitem
  → /stabilize-milestone
```
```

다음으로 *교체*:
```
```
/discover-product (optional)
  → /bootstrap-project → /bootstrap-stack → /stack-guard
  → /bootstrap-design (frontend only — fills DESIGN.md)
  → /plan-workitem
       └─ (optional) /validate-plan (separate session) → /repair-plan (origin session)
  → /implement-workitem (parallel by wave groups — see plan-workitem output)
       └─ recommended: `claude --worktree T-NNN -p "/implement-workitem T-NNN"` per task (name first)
  → /validate-workitem → /repair-workitem (if Needs Fix) → /finalize-workitem
  → /stabilize-milestone
```
```

#### 10-1-B. "Step 3" 본문 갱신

현재 본문 (line 73~90):
```
### Step 3: Plan → Implement → Ship

```text
# Plan + implement
/plan-workitem [milestone or feature id]
/implement-workitem [task id]
/validate-workitem [task id]

# If Pass: finalize and move on
/finalize-workitem [task id]

# If Needs Fix: repair, then re-validate
/repair-workitem [task id]
/validate-workitem [task id]

# Once all tasks in the milestone are done:
/stabilize-milestone [milestone id]
```
```

다음으로 *교체*:
```
### Step 3: Plan → Implement → Ship

```text
# Plan (fills task ## 4-1 paths + emits parallel wave groups)
/plan-workitem [milestone or feature id]

# (Optional) Cross-LLM peer review — see ADR-038
#   In a separate terminal / fresh Claude session OR Codex:
/validate-plan [workitem id] [--reviewer-tag <tag>]
#   Then back in the origin plan session:
/repair-plan [workitem id]

# Implement (parallel by wave groups from /plan-workitem output)
#   Recommended: claude --worktree per task for isolated working tree
/implement-workitem [task id]
/validate-workitem [task id]

# If Pass: finalize and move on
/finalize-workitem [task id]

# If Needs Fix: repair, then re-validate
/repair-workitem [task id]
/validate-workitem [task id]

# Once all tasks in the milestone are done:
/stabilize-milestone [milestone id]
```

> **Tip — parallel implement**: `/plan-workitem` emits "parallel waves" derived from each task's `## 9. 의존성` + `## 4-1. 변경 예정 파일/경로`. Tasks in the same wave can be implemented in **separate terminal sessions / worktrees** in parallel. Recommended pattern: `claude --worktree T-NNN -p "/implement-workitem T-NNN"` — the name (first positional arg) is required for the worktree to land at `.claude/worktrees/T-NNN/`; without it Claude Code generates a random name. See [official worktrees docs](https://code.claude.com/docs/en/worktrees). Same-working-tree parallel implement is discouraged (file conflict + git index race + build cache race risks). See [ADR-038](docs/90-decisions/boilerplate/ADR-038-cross-llm-plan-validation.md) and [DELEGATION_STRATEGY.md](docs/00-meta/DELEGATION_STRATEGY.md) (parallel pattern + worktree section).
>
> External resources (DB / port / lockfile / build cache) are **NOT auto-isolated by worktree** — that's a project-environment responsibility (Docker Compose, testcontainers, per-worker temp dirs, etc.). See the "동시 implement 면책 단락" in ADR-038.
```

#### 10-1-C. "Using with Codex CLI" 단락의 wrapper 목록 갱신

현재 본문 (line 97~101 사이):
```
2. Documents and policies are equal. Core workflow skills have Codex wrappers ($-prefixed): $implement-workitem, $validate-workitem, $repair-workitem, $finalize-workitem, $plan-workitem, $bootstrap-project, $bootstrap-stack, $stabilize-milestone, $stack-guard. Remaining skills (discover-product, review-doc, boilerplate-context, bootstrap-design) are invoked via natural language. See [WORKFLOW.md](docs/00-meta/WORKFLOW.md).
3. Core workflow skills are callable via Codex Skills:
   - Inner loop: `$implement-workitem T-001`, `$validate-workitem T-001`, `$repair-workitem T-001`, `$finalize-workitem T-001`
   - Planning / bootstrap / stabilize: `$plan-workitem M1`, `$bootstrap-project <brief>`, `$bootstrap-stack <stack>`, `$stack-guard`, `$stabilize-milestone M1`
```

다음으로 *교체*:
```
2. Documents and policies are equal. Core workflow skills have Codex wrappers ($-prefixed): $implement-workitem, $validate-workitem, $repair-workitem, $finalize-workitem, $plan-workitem, $validate-plan, $repair-plan, $bootstrap-project, $bootstrap-stack, $stabilize-milestone, $stack-guard. Remaining skills (discover-product, review-doc, boilerplate-context, bootstrap-design) are invoked via natural language. See [WORKFLOW.md](docs/00-meta/WORKFLOW.md).
3. Core workflow skills are callable via Codex Skills:
   - Inner loop: `$implement-workitem T-001`, `$validate-workitem T-001`, `$repair-workitem T-001`, `$finalize-workitem T-001`
   - Planning / bootstrap / stabilize: `$plan-workitem M1`, `$bootstrap-project <brief>`, `$bootstrap-stack <stack>`, `$stack-guard`, `$stabilize-milestone M1`
   - Plan cross-review (opt-in, ADR-038): `$validate-plan M1` (in fresh Codex session) + `$repair-plan M1` (in origin session that ran $plan-workitem)
```

### 10-2. `README_ko.md` 갱신

`README.md`와 동일 위치에 동일 의미 변경을 적용한다 — 한글 본문.

#### 10-2-A. "전체 흐름" 다이어그램

현재 본문 (대응 위치):
```
```
/discover-product (선택)
  → /bootstrap-project → /bootstrap-stack → /stack-guard
  → /bootstrap-design (UI 전용 — DESIGN.md 채움)
  → /plan-workitem → /implement-workitem
  → /validate-workitem → /repair-workitem (Needs Fix일 때) → /finalize-workitem
  → /stabilize-milestone
```
```

다음으로 *교체*:
```
```
/discover-product (선택)
  → /bootstrap-project → /bootstrap-stack → /stack-guard
  → /bootstrap-design (UI 전용 — DESIGN.md 채움)
  → /plan-workitem
       └─ (선택) /validate-plan (별 세션) → /repair-plan (원본 세션)
  → /implement-workitem (wave 그룹 별 병렬 가능 — /plan-workitem 출력 참조)
       └─ 권장: `claude --worktree T-NNN -p "/implement-workitem T-NNN"` (이름 첫 인자 필수)
  → /validate-workitem → /repair-workitem (Needs Fix일 때) → /finalize-workitem
  → /stabilize-milestone
```
```

#### 10-2-B. "3단계" 본문 갱신

현재 본문 (README_ko.md line 72~89):
```
### 3단계: 분해 → 구현 → 마감

```text
# 분해 + 구현
/plan-workitem [milestone 또는 feature id]
/implement-workitem [task id]
/validate-workitem [task id]

# Pass 시: 마감하고 다음으로
/finalize-workitem [task id]

# Needs Fix 시: 수정 후 재검증
/repair-workitem [task id]
/validate-workitem [task id]

# milestone의 모든 task가 done이 되면:
/stabilize-milestone [milestone id]
```
```

다음으로 *교체*:
```
### 3단계: 분해 → 구현 → 마감

```text
# 분해 (task ## 4-1 경로 채움 + 병렬 wave 그룹 출력)
/plan-workitem [milestone 또는 feature id]

# (선택) 다른 LLM 교차 리뷰 — ADR-038 참조
#   별 터미널 / 새 Claude 세션 또는 Codex 에서:
/validate-plan [workitem id] [--reviewer-tag <tag>]
#   원본 plan 세션으로 돌아와서:
/repair-plan [workitem id]

# 구현 (/plan-workitem 출력의 wave 그룹 기준 병렬 가능)
#   권장: task당 claude --worktree 별 worktree 격리 실행
/implement-workitem [task id]
/validate-workitem [task id]

# Pass 시: 마감하고 다음으로
/finalize-workitem [task id]

# Needs Fix 시: 수정 후 재검증
/repair-workitem [task id]
/validate-workitem [task id]

# milestone의 모든 task가 done이 되면:
/stabilize-milestone [milestone id]
```

> **Tip — 병렬 구현**: `/plan-workitem`은 각 task의 `## 9. 의존성` + `## 4-1. 변경 예정 파일/경로`에서 파생된 "병렬 wave"를 출력한다. 같은 wave 안의 task는 **별 터미널 세션·별 worktree**에서 동시에 `/implement-workitem`으로 진행할 수 있다. 권장 패턴: `claude --worktree T-NNN -p "/implement-workitem T-NNN"` — 이름(첫 positional 인자)이 *필수*. 미명시 시 자동 이름이 붙어 `.claude/worktrees/T-NNN/`에 안 생긴다. [공식 worktrees 문서](https://code.claude.com/docs/en/worktrees) 참조. 단일 working tree 동시 implement는 file 충돌 + git index race + 빌드 캐시 충돌 위험이라 비권장. [ADR-038](docs/90-decisions/boilerplate/ADR-038-cross-llm-plan-validation.md) 및 [DELEGATION_STRATEGY.md](docs/00-meta/DELEGATION_STRATEGY.md) 병렬 패턴·worktree 단락 참조.
>
> 외부 리소스(DB / 포트 / lockfile / 빌드 캐시)는 **worktree만으로는 격리되지 않음** — 프로젝트 환경 설계 책임 (Docker Compose · testcontainers · 임시 디렉터리 분리 등). ADR-038 "동시 implement 면책 단락" 참조.
```

#### 10-2-C. "Codex CLI 진입" 단락의 wrapper 목록 갱신

현재 본문 (README_ko.md line 96~99):
```
2. 문서와 정책은 동일. 핵심 workflow skill은 Codex wrapper ($-prefixed)로 제공: $implement-workitem, $validate-workitem, $repair-workitem, $finalize-workitem, $plan-workitem, $bootstrap-project, $bootstrap-stack, $stabilize-milestone, $stack-guard. 나머지 skill (discover-product, review-doc, boilerplate-context, bootstrap-design)은 자연어로 호출. 자세한 워크플로우는 [WORKFLOW.md](docs/00-meta/WORKFLOW.md) 참조.
3. 자주 쓰는 core workflow skill은 Codex skill로 호출 가능:
   - Inner loop: `$implement-workitem T-001`, `$validate-workitem T-001`, `$repair-workitem T-001`, `$finalize-workitem T-001`
   - Planning / bootstrap / stabilize: `$plan-workitem M1`, `$bootstrap-project <brief>`, `$bootstrap-stack <스택>`, `$stack-guard`, `$stabilize-milestone M1`
```

다음으로 *교체*:
```
2. 문서와 정책은 동일. 핵심 workflow skill은 Codex wrapper ($-prefixed)로 제공: $implement-workitem, $validate-workitem, $repair-workitem, $finalize-workitem, $plan-workitem, $validate-plan, $repair-plan, $bootstrap-project, $bootstrap-stack, $stabilize-milestone, $stack-guard. 나머지 skill (discover-product, review-doc, boilerplate-context, bootstrap-design)은 자연어로 호출. 자세한 워크플로우는 [WORKFLOW.md](docs/00-meta/WORKFLOW.md) 참조.
3. 자주 쓰는 core workflow skill은 Codex skill로 호출 가능:
   - Inner loop: `$implement-workitem T-001`, `$validate-workitem T-001`, `$repair-workitem T-001`, `$finalize-workitem T-001`
   - Planning / bootstrap / stabilize: `$plan-workitem M1`, `$bootstrap-project <brief>`, `$bootstrap-stack <스택>`, `$stack-guard`, `$stabilize-milestone M1`
   - Plan 교차 리뷰 (선택, ADR-038): `$validate-plan M1` (별 Codex 세션) + `$repair-plan M1` (`$plan-workitem`을 돌린 원본 세션)
```

### 10-3. 검증
- `grep -c "validate-plan" README.md` — ≥3 (flow 다이어그램 + Step 3 + Codex 목록)
- `grep -c "validate-plan" README_ko.md` — ≥3
- `grep -c "repair-plan" README.md` — ≥3
- `grep -c "worktree" README.md README_ko.md` — ≥4 합산
- `grep -c "## 4-1" README.md README_ko.md` — ≥2 합산
- `grep -c "ADR-038" README.md README_ko.md` — ≥4 합산

### 10-4. 커밋
```bash
git add README.md README_ko.md
git commit -m "$(cat <<'EOF'
docs(readme): announce plan cross-review + parallel wave + worktree guidance (ADR-038)

- Overall flow diagram now branches at /plan-workitem.
- Step 3 includes optional /validate-plan + /repair-plan loop and
  recommended claude --worktree NAME -p "..." pattern (name first
  positional arg) for parallel wave implement.
- Codex wrappers list adds \$validate-plan and \$repair-plan.
- Tip box references ADR-038 + DELEGATION_STRATEGY parallel/worktree
  sections + 외부 리소스 면책 안내.
EOF
)"
```

---

## 11. Phase 10 — 최종 정합성 sweep + acceptance checklist

목적: 본 개선이 보일러플레이트의 SSOT 정책을 위반하지 않는지 마지막 확인. 변경이 없으면 commit 없이 종료.

### 11-1. SSOT drift sweep

각 항목이 모두 통과해야 한다.

11-1-A. **ADR cross-reference**: `ADR-038`이 다음 위치에서 모두 발견되어야 함:
```bash
grep -l "ADR-038" docs/90-decisions/boilerplate/ADR-038-cross-llm-plan-validation.md docs/90-decisions/boilerplate/README.md docs/00-meta/STRUCTURE.md docs/00-meta/WORKFLOW.md docs/00-meta/DELEGATION_STRATEGY.md .claude/agents/reviewer.md .claude/skills/plan-workitem/SKILL.md .claude/skills/validate-plan/SKILL.md .claude/skills/repair-plan/SKILL.md docs/30-workitems/_templates/TASK_TEMPLATE.md README.md README_ko.md
```
모두 1개 이상의 결과를 내야 함. (Codex wrapper `.agents/skills/validate-plan/SKILL.md` / `.agents/skills/repair-plan/SKILL.md`는 ADR-010 wrapper 패턴 정합상 source of truth 경로만 인용하므로 ADR-038 직접 인용이 없을 수 있음 — 본 grep 목록에서 제외, 정합.)

11-1-B. **Skill count 정합**: STRUCTURE.md의 *15종* 표기 + `.claude/skills/` 실제 디렉터리 개수 일치:
```bash
ls -d .claude/skills/*/ | wc -l
```
결과 = `15`.

11-1-C. **Codex wrapper 정합**: `.agents/skills/` 디렉터리에 신규 2개 포함:
```bash
ls -d .agents/skills/*/ | wc -l
```
이전이 9였으면 이제 11. (현재 ls 결과는 9 — 위 mkdir 후 11이어야 함.)

11-1-D. **AGENTS.md 100줄 cap (ADR-011)**: 본 개선이 AGENTS.md를 건드리지 않았어야 함. *본 가이드는 main 브랜치에 누적 commit 가정*이므로 `main` 비교는 self-compare가 되어 무력 — Phase 1 시작 *직전* commit hash를 기준점으로 본다 (작업 시작 직전 `git rev-parse HEAD`를 메모해 두는 것을 권장):
```bash
# AGENTS.md가 본 가이드 작업으로 변경됐는지 확인
git log --oneline -- AGENTS.md | head -10  # 본 가이드 phase 별 commit 메시지가 없어야 함
wc -l AGENTS.md  # 100 이하 유지
```
두 결과 모두 정합이어야 함. 본 가이드의 phase 별 commit 메시지에 `AGENTS.md`가 staged 파일로 등장한 적이 0이어야 함 (§5-4, §6-4, §7-4, §8-5, §9-4, §10-4의 `git add` 명령 어디에도 AGENTS.md 없음 — 자기 점검).

11-1-E. **`.gitignore` 정합**: plan-reviews 패턴이 reports 패턴 직후에 위치하고 mirror 형식 유지 + `.claude/worktrees/` 패턴이 *정확히 1줄만* 존재 (중복 없음):
```bash
grep -A1 "plan-reviews" .gitignore                        # 2줄 출력 (패턴 + !.gitkeep)
grep -cF ".claude/worktrees/" .gitignore                  # 결과 = 1 (중복 없음)
```
중복(`> 1`)이면 §3-2의 "이미 존재 시 추가 X" 가드가 실패한 것 — 마지막에 추가된 줄을 삭제하고 재실행.

11-1-F. **`docs/40-validation/plan-reviews/` 디렉터리가 .gitkeep만 가짐**:
```bash
ls -A docs/40-validation/plan-reviews/
```
결과 = `.gitkeep` (다른 파일 X — 본 개선 작업 중에 우연히 검토 파일이 생기지 않았는지 확인).

11-1-G. **plan-workitem 본문 정합**: parallel waves + `## 4-1` plan 시점 채움 + LSP 보조 + worktree 권장 단락 모두 존재:
```bash
grep -n "wave 그룹\|Cross-review hook\|validate-plan\|Worktree 권장\|LSP/MCP" .claude/skills/plan-workitem/SKILL.md
```
5+ 결과.

11-1-H. **reviewer.md 본문 정합**: plan surface + Plan Quality 9 + [Plan-file-coverage] + Write 범위 확장 모두 존재:
```bash
grep -n "plan surface\|Plan Quality 9\|Plan-file-coverage\|plan-reviews" .claude/agents/reviewer.md
```
4+ 결과.

11-1-I. **신규 가드 단락 정합**:
```bash
grep -n "sanitization\|reviewer-tag 형식\|P2 deferred\|IMPROVEMENT_GUIDE\|## 4-1" .claude/skills/validate-plan/SKILL.md .claude/skills/repair-plan/SKILL.md
```
validate-plan 측에 `reviewer-tag 형식` + `## 4-1` 매칭, repair-plan 측에 `sanitization` + `P2 deferred` + `IMPROVEMENT_GUIDE` + `## 4-1` 매칭 1+ 라인씩 존재.

11-1-J. **ADR-038 evidence label 정합** (`+`는 정규식 메타라 `-F` 또는 `[+]`로 안전화):
```bash
grep -nF "[관측됨]" docs/90-decisions/boilerplate/ADR-038-cross-llm-plan-validation.md
grep -nF "[가설+외부실증]" docs/90-decisions/boilerplate/ADR-038-cross-llm-plan-validation.md
grep -nF "[외부실증]" docs/90-decisions/boilerplate/ADR-038-cross-llm-plan-validation.md
```
"같은 모델의 blind spot은 그대로 통과" 줄이 `[가설+외부실증]`로 라벨링되어 있고, "self-check를 같은 세션 내에서 돌린다" 줄 + "`## 4-1`은 plan 시점에 비어 있는 경우가 다수" 줄이 `[관측됨]`이어야 함 (ADR-022 정합 — 구조 사실만 [관측됨]). multi-model ensembling / LSP / worktree 외부 사례 인용 줄은 `[외부실증]`.

11-1-K. **TASK_TEMPLATE `## 4-1` + WORKFLOW.md line 25 신구 정책 정합**:
```bash
grep -A3 "## 4-1" docs/30-workitems/_templates/TASK_TEMPLATE.md | grep "plan 시점"
```
1+ 라인 매칭. 기존 "구현 시점에 채운다" 문구가 *남아 있지 않아야* 함 (TASK_TEMPLATE + WORKFLOW.md 양쪽):
```bash
grep -c "구현 시점에 채운다" docs/30-workitems/_templates/TASK_TEMPLATE.md     # 결과 = 0
grep -cF "implement 중 채운다 — plan 단계에서 미리 채울 의무 없음" docs/00-meta/WORKFLOW.md  # 결과 = 0
```

11-1-L. **D8 dependency keyword 단락 정합** (plan-workitem step 11-(d)):
```bash
grep -n "lockfile-race\|pnpm-lock\|package.json" .claude/skills/plan-workitem/SKILL.md
```
3+ 결과.

11-1-M. **D7 LSP-backed MCP의 공식 도구 한계 명시 정합** (ADR-038 + plan-workitem step 11-(c)):
```bash
grep -nF "mcp__ide__getDiagnostics" docs/90-decisions/boilerplate/ADR-038-cross-llm-plan-validation.md .claude/skills/plan-workitem/SKILL.md
```
ADR-038 본문과 plan-workitem step 11-(c)에 *각각 1+ 라인* 매칭 — 두 곳 모두 *공식 IDE MCP는 본 용도(import graph)에 부적합* 명시 정합. 또한 frontmatter `allowed-tools`는 baseline 변경 없음:
```bash
grep "^allowed-tools:" .claude/skills/plan-workitem/SKILL.md
```
결과 = `allowed-tools: Read Glob Grep Write Edit` (그대로).

### 11-2. 워크플로우 dry-run (선택 — 빠른 sanity check)

본 개선이 완료된 후 실제 호출 흐름 1회 dry-run 권장 (정책 외 — 사용자가 fork 직후 1회 돌려 본 가이드 검증):

1. 새 터미널 1에서 Claude Code 진입 후 `/plan-workitem M1` 자연어로 호출 (M1이 존재하는 fork만). 출력에 "Wave 1:" "Cross-review hook" "## 4-1" "Worktree 권장" 발견되어야 함.
2. 새 터미널 2에서 Claude Code 진입 후 `/validate-plan M1 --reviewer-tag claude-b` 호출. `docs/40-validation/plan-reviews/M1.claude-b.md` 생성되어야 함. 본 파일 안에 `[Plan-file-coverage]` 차원 1+ 라인이 발견되어야 함 (또는 0건이면 모든 task가 채워졌음을 의미).
3. (선택) 새 터미널 3에서 Codex 진입 후 `$validate-plan M1 --reviewer-tag codex` 호출. `M1.codex.md` 생성되어야 함.
4. 터미널 1로 복귀해 `/repair-plan M1` 호출. 임시 파일 모두 사라지고 workitem 문서가 갱신되어야 함.
5. (선택) wave 그룹 안의 task 1개를 `claude --worktree T-001 -p "/implement-workitem T-001"`로 호출 (이름이 첫 positional 인자임에 주의 — 미명시 시 자동 이름이 붙음). `.claude/worktrees/T-001/` 경로에 별 working directory가 생성되어야 함. main checkout의 `git status`는 영향받지 않아야 함 (worktree 격리 확인). 작업 후 `git worktree remove .claude/worktrees/T-001` 또는 `git worktree list`로 정리 (non-interactive `-p` 조합은 자동 cleanup 안 됨).
6. 결과를 .boilerplate/validation/SIMULATION_RUN.md에 *기록*. (선택 — 본 가이드 비범위지만 ADR-022 evidence 회수에 도움.)

### 11-3. 최종 commit (해당 시)

11-1 / 11-2 단계에서 추가 정정이 필요 없으면 **commit 없이 종료**. 정정이 필요했으면 — 정정 *대상 파일을 명시적으로 add* 후 commit (`git add -A` / `git add .` 금지):

```bash
# 본 phase에서 손댄 파일만 명시 — 예시이며 실제 정정 범위에 맞춰 수정
git add <정정한 파일 경로들>
git status --porcelain  # staged 파일에 .env / secrets/ / AGENTS.md 없는지 확인

git commit -m "$(cat <<'EOF'
docs(boilerplate): post-improve consistency sweep for ADR-038 surfaces

Fixes residual SSOT drift discovered in IMPROVE-GUIDE phase 10 sweep.
EOF
)"
```

---

## 12. Acceptance Checklist

본 가이드 완료 시 다음 항목을 모두 ✅ 해야 한다.

### 12-1. 신규 산출물 존재
- [ ] `docs/90-decisions/boilerplate/ADR-038-cross-llm-plan-validation.md` (Status: accepted, D1~D9 9개 결정 + 면책 단락 + 비결정 8개)
- [ ] `.claude/skills/validate-plan/SKILL.md` (frontmatter agent: reviewer, Plan Quality 9 차원, `[Plan-file-coverage]` 포함)
- [ ] `.claude/skills/repair-plan/SKILL.md` (frontmatter agent: planner, `## 4-1` 수정 점검 포함)
- [ ] `.agents/skills/validate-plan/SKILL.md` + `agents/openai.yaml`
- [ ] `.agents/skills/repair-plan/SKILL.md` + `agents/openai.yaml`
- [ ] `docs/40-validation/plan-reviews/.gitkeep`

### 12-2. 기존 파일 정합 갱신
- [ ] `docs/90-decisions/boilerplate/README.md`에 ADR-038 행 추가됨
- [ ] `docs/00-meta/STRUCTURE.md` skill count 13 → 15
- [ ] `docs/00-meta/STRUCTURE.md`에 plan-review 산출물 행 추가됨
- [ ] `docs/00-meta/STRUCTURE.md` Canonical Owner 표에 ADR-038 + parallel waves derived view + `## 4-1` 책임 시점 + worktree 정책 행 4개 추가됨
- [ ] `docs/00-meta/WORKFLOW.md` "3. 작업 단위 분해" sub-loop + `## 4-1` plan 시점 안내 + worktree 안내 추가됨
- [ ] `docs/00-meta/WORKFLOW.md` 라이프사이클 다이어그램에 (opt-in) 가지 + worktree 힌트 추가됨
- [ ] `docs/00-meta/DELEGATION_STRATEGY.md` 위임 트리거 표 2 행 추가됨
- [ ] `docs/00-meta/DELEGATION_STRATEGY.md` 스킬 실행 순서에 3a/3b 추가됨
- [ ] `docs/00-meta/DELEGATION_STRATEGY.md` 병렬 패턴 매핑 단락 + worktree 단락 + 외부 리소스 면책 안내 갱신됨
- [ ] `.claude/agents/reviewer.md` plan surface + Plan Quality 9 + `[Plan-file-coverage]` + Write 범위 확장됨
- [ ] `.claude/skills/plan-workitem/SKILL.md` step 10-1 (`## 4-1` 채움) + step 11 sub-step (a)~(f) + 마지막 출력 wave 단락 + Cross-review hook + Worktree 권장 단락 추가됨
- [ ] `docs/30-workitems/_templates/TASK_TEMPLATE.md` `## 4-1` 주석이 "plan 시점에 채운다"로 갱신됨 (기존 "구현 시점에 채운다" 0건)
- [ ] `.gitignore`에 `plan-reviews/*.md` + `!plan-reviews/.gitkeep` + `.claude/worktrees/` 패턴 추가됨
- [ ] `README.md` flow + Step 3 + Codex 목록 + worktree tip 갱신됨
- [ ] `README_ko.md` 동일 변경 한국어로 적용됨

### 12-3. 정책 정합 (위반 0건)
- [ ] AGENTS.md 본문 변경 없음 (ADR-011 100줄 cap 보호)
- [ ] `## 9. 의존성` + `## 4-1` 외에 wave 그룹의 영속 저장 자리 *없음* (ADR-005 SSOT 정합)
- [ ] `/validate-plan`은 workitem 문서를 *수정하지 않음* (frontmatter `allowed-tools`에 Edit 없음)
- [ ] `/repair-plan`은 workitem 문서 + IMPROVEMENT_GUIDE.md (P2 deferred 이주만) *외* 다른 산출물(QA_FINDINGS / report 등)을 *수정하지 않음*
- [ ] `/repair-plan` allowed-tools의 `Bash(rm ...)` / `Bash(ls ...)`가 `docs/40-validation/plan-reviews/` 경로 prefix로 *좁혀짐*
- [ ] `/repair-plan` SKILL 본문에 workitem-id sanitization 가드(`M[0-9]+` / `F-[0-9]+` / `T-[0-9]+` 만 허용) 존재
- [ ] `/validate-plan` SKILL 본문에 reviewer-tag 형식 제약(`[A-Za-z0-9._-]{1,32}`) 존재
- [ ] 자동 차단 트리거 0건 — 모든 신규 정책은 enabling (ADR-022 정합). `NEEDS_CHANGES`는 리뷰 verdict이지 워크플로우 차단 아님 — 본문에 그 사실 명시
- [ ] ADR-038 본문에 ADR-026 비결정 단락과의 reconcile 4 차원 표 존재
- [ ] ADR-038 본문에 "동시 implement 면책 단락" (빌드 캐시 / 테스트 / 외부 리소스 격리 책임 명시) 존재
- [ ] ADR-038 evidence 라벨이 `[가설+외부실증]` (multi-LLM blind spot은 본 repo [관측됨] 아님 — ADR-022 정합)
- [ ] plan-workitem step 11-(c) LSP-backed MCP 보조가 *가용 시에만* 활성화 + 미가용 fallback 명시 + **공식 IDE MCP(`mcp__ide__*`)는 본 용도에 부적합함을 명시** (공식 도구는 diagnostics / Jupyter executeCode 2개뿐 — import graph 미제공)
- [ ] plan-workitem frontmatter `allowed-tools`는 *baseline 변경 없음* (`Read Glob Grep Write Edit`). §7-2-D는 fork 사용자용 안내일 뿐, baseline 작업으로 frontmatter 줄을 추가하지 않음
- [ ] plan-workitem step 11-(d) dependency 키워드 감지 시 *단독 wave 분리*만 수행 (자동 차단 X)
- [ ] worktree 사용은 *권장만* — 자동 spawn 없음, 단일 working tree 실행도 허용

### 12-4. Git 정합
- [ ] 본 가이드의 phase 별 commit 메시지가 Conventional Commits 형식 (ADR-008)
- [ ] **commit footer는 ADR-008 amend 2 정합 — `Refs: T-NNN` 형식이 *기본*이지만 본 가이드는 boilerplate ADR rollout이라 task ID가 없으므로 "lock file 화이트리스트 commit은 *Refs: chore 또는 생략 가능*" 정신에 따라 footer 생략**. `Refs: ADR-038`는 PR body footer에만 박는다 (ADR-008 amend 2 *"PR 본문 footer는 Refs: ADR-NNN 형식"* 명시 정합). 자기 점검:
  ```bash
  # 본 가이드의 phase commit 중 Refs: 라인이 *없어야* (ADR rollout 면제)
  git log --format="%B" -n 7 | grep -c "^Refs:"  # 결과 = 0
  ```
- [ ] commit 7개 (Phase 1 / Phase 2~4 / Phase 5 / Phase 6 / Phase 7 / Phase 8 / Phase 9) + (선택) Phase 10 정합 sweep commit
- [ ] `git status --porcelain` 결과 비어 있음 (uncommitted 변경 없음)

### 12-5. 회귀 점검
- [ ] 기존 lifecycle 8단계 (discover→...→stabilize)는 *그대로* 작동 — cross-review를 건너뛰면 변경 전과 동일 동작
- [ ] 기존 `/plan-workitem` 출력의 분해 매트릭스 / FAC↔AC echo / architect 호출 신호 모두 *그대로* 출력됨 (wave 단락 + `## 4-1` 채움 + LSP 보조는 *추가*만)
- [ ] `.claude/skills/` 다른 12개 skill 본문은 *변경 없음*
- [ ] `.claude/agents/` 다른 5개 agent 본문은 *변경 없음* (reviewer.md만 변경)
- [ ] ADR-001 ~ ADR-037 본문은 *변경 없음*
- [ ] TASK_TEMPLATE의 `## 4-1` 주석 외 다른 섹션 주석은 *변경 없음*

---

## 13. 본 IMPROVE-GUIDE.md 의 사후 처리

본 가이드는 *개선 시공 도면*이며 영구 산출물이 아니다. 모든 phase 완료 + 12 Acceptance Checklist 통과 후 다음 중 하나로 처리:

옵션 A (권장): 본 파일을 git에서 *삭제*. ADR-038이 정책 SSOT이므로 가이드는 역사적 가치만 가짐.
```bash
git rm IMPROVE-GUIDE.md
git commit -m "chore: remove IMPROVE-GUIDE.md after ADR-038 rollout complete"
```

옵션 B: 보존하되 본문 첫 줄에 `> Status: completed YYYY-MM-DD` 추가. 미래 fork 사용자의 reference.

옵션 C (비권장): 그대로 두기. 이 경우 6개월 뒤 본 파일이 stale인지 확인할 책임 발생.

**옵션 A를 권장한다** — 본 보일러플레이트의 IMPROVE-* 문서 처리 선례 (`docs: delete IMPROVE docs` commit `f439c15`)와 정합.

---

## 14. 트러블슈팅

작업 중 다음 문제 발생 시 대응:

### 14-1. ~~`Refs: ADR-038` footer 누락~~ — *본 가이드 정책상 정상*
초기 라운드에서 commit footer에 `Refs: ADR-038`을 박으라고 했으나 ADR-008 amend 2를 재확인한 결과 *commit footer 값은 `T-NNN` 형식이 기본 + PR body footer만 `ADR-NNN` 허용*. 본 가이드는 boilerplate ADR rollout이라 task ID가 없으므로 amend 2의 "lock file 화이트리스트 commit은 *Refs: chore 또는 생략 가능*" 정신에 따라 footer 생략이 정합. 추가 작업 불필요. PR을 생성하는 시점에 *PR body*에 `Refs: ADR-038`을 박으면 amend 2의 PR footer 룰 충족.

### 14-2. `docs/40-validation/plan-reviews/` 디렉터리가 commit되지 않음
원인: `.gitkeep`을 빠뜨렸거나 `.gitignore` 패턴이 너무 광범위. 대응: 11-1-E + 11-1-F 단계로 점검. `.gitignore` 패턴이 `plan-reviews/*` (md 확장자 없이)면 `.gitkeep`까지 ignored됨 — `*.md` 확장자 명시 필수.

### 14-3. reviewer.md 변경이 길어져 토큰 비용 우려
구분 — reviewer agent의 *반환 토큰 cap*(1,000~2,000)은 agent가 메인 세션에 *돌려주는 응답 cap*이지, 본문(reviewer.md) 자체의 *입력 prompt 토큰*과는 별개다. 본 개선은 두 측면을 각각 다룬다:
- *입력 prompt 토큰*(reviewer.md 본문 자체 길이): Plan Quality 9 단락이 추가되어 reviewer가 로드될 때마다 항상 본문에 포함된다. 본문 +25 라인 정도라 메인 세션 컨텍스트 부담은 적지만, 본 가이드의 호출 surface 분기(4-1-A)로 *실제 추론 시 활성 차원*을 제한해 추론 비용을 회피.
- *반환 토큰 cap*(메인 세션에 돌려주는 응답 길이): reviewer가 Plan Quality 9 + Clean Code 6 + Doc Consistency 4를 동시에 다 응답하면 cap 초과 위험. 본 가이드의 surface 분기로 *plan surface 호출*에선 Plan Quality 9만, *code/doc/mixed*에선 기존 차원만 응답하도록 명시.

후속 모니터링 — 본문 +25 라인이 의도 외 영향(다른 surface 호출 시에도 LLM이 Plan Quality 차원에 끌려가는 등)을 내면 다음 stabilize 라운드 instruction improvement 후보로 보고.

### 14-4. `/validate-plan` 호출 시 reviewer agent가 workitem 문서를 *수정해 버림*
원인: agent가 본 skill의 가드(workitem 수정 금지)를 무시. 대응: 임시 — 본 commit으로 진행 후 stabilize 라운드 instruction improvement 후보로 보고. 영구 — reviewer.md `Write/Edit 사용 범위` 단락의 surface 분기를 더 강하게 명시 (예: `validate-plan` surface는 plan-reviews/ *외* 모든 경로 Edit 호출 시 self-terminate).

### 14-5. `/repair-plan` 호출 시 임시 파일 0건
원인: 사용자가 `/validate-plan`을 먼저 돌리지 않음. 대응: skill 본문의 "결과 0건: 사용자에게 안내 후 종료" 가드대로 작동. 추가 변경 불필요.

### 14-6. `/validate-plan`이 아직 파일 작성 중인데 `/repair-plan` 호출됨 (race condition)
원인: 여러 세션이 비동기로 진행 — `/validate-plan`이 write 도중에 사용자가 원본 세션에서 `/repair-plan` 호출. 부분 작성된 파일을 읽고 적용 후 삭제하면 일부 발견 항목이 silent loss. 대응: **운영 규칙으로 회피** — 가이드의 dry-run 안내(§11-2)에 "모든 `/validate-plan` 호출이 마지막 출력의 *판정·리뷰 파일 경로 echo*까지 완료된 뒤에만 `/repair-plan` 호출" 사용자 규칙 명시. 영구 — 차후 validate-plan을 atomic write (`tmp.md` → `mv` to final)로 강화 (다음 stabilize 라운드 instruction improvement 후보).

### 14-7. plan-workitem이 `## 4-1`을 plan 시점에 채우지 않고 비어 있는 채로 출력
원인: skill 본문의 step 10-1을 LLM이 skip했거나, 사용자가 "scaffolding/auth 예외" 명시 없이 비워둠. 대응: validate-plan을 후속으로 돌리면 `[Plan-file-coverage] P1 권장` finding으로 회수됨 (ADR-007 amend 1 lock-file 단순성 결정 정합 — P0 강제 X). repair-plan에서 Adopt 결정 후 `## 4-1` 채움. 자동 차단 X — 사용자 결정.

### 14-8. plan-workitem step 11-(c)가 import graph 회수에 실패
**원인 1 — LSP-backed MCP server 부재 (가장 흔함)**: baseline 보일러플레이트는 LSP-backed MCP server를 *제공하지 않으며 전제도 하지 않는다* (ADR-038 D7). 공식 IDE 통합 MCP(`mcp__ide__getDiagnostics` / `mcp__ide__executeCode`)는 diagnostics·Jupyter 실행 전용이라 *references / definitions / call hierarchy를 노출하지 않음* — 본 step 11-(c) 용도에 부적합. fork 사용자가 Serena MCP, multilspy, generic LSP↔MCP bridge 같은 별도 server를 *설치한 경우에만* 본 step이 활성화된다.

**원인 2 — `allowed-tools` 미사전승인 (fork가 LSP server를 설치했지만 권한 미허용)**: fork 사용자가 server를 설치했지만 plan-workitem SKILL frontmatter `allowed-tools`에 해당 server 패턴(예: `mcp__serena__*`)을 추가하지 않으면, default permission mode에서 prompt가 발생한다. `context: fork` sub-agent 내부에선 prompt 응답이 어렵고 *결과적으로 도구 호출이 skip*된다. 대응: fork의 plan-workitem SKILL frontmatter에 `mcp__<server>__*` 추가 (§7-2-D 안내 참조). 또는 사용자 permission settings(`~/.claude/settings.json` 또는 `.claude/settings.json`)의 `permissions.allow`에 추가.

**원인 3 — LSP server indexing 미완료 / 타임아웃**: 가용 server가 있고 권한도 있는데 호출 결과가 비어 있거나 타임아웃. 대응: 본 단락은 best-effort라 fallback heuristic (step 11-(e))가 자동 적용됨. 출력에 "LSP-backed MCP 호출 실패 또는 미가용 — import graph 점검 skip (휴리스틱 fallback)" 한 줄 echo. 사용자가 LSP indexing 완료 후 `/plan-workitem` 재실행 결정 가능.

세 원인 모두 *step 11-(c) 가용 안 함 분기*로 진입 — file overlap 점검은 step 11-(b) `## 4-1` 직접 비교 + step 11-(e) 휴리스틱 fallback으로 충분 정합 (ADR-038 D6의 `## 4-1` plan 시점 채움이 기초 자료 확보).

### 14-9. `claude --worktree`로 호출했는데 main checkout에 worktree 폴더가 untracked로 등장
원인: `.gitignore`에 `.claude/worktrees/` 패턴이 빠짐. 대응: 11-1-E 점검 단계로 확인 + `.gitignore`에 추가. 본 가이드 Phase 2의 3-2 단계 정합.

### 14-10. 같은 wave의 task 2개를 worktree 없이 같은 working tree에서 동시 implement 시도 후 충돌
원인: 사용자가 권장(worktree)을 무시하고 단일 worktree 다중 implement 진행. 본 ADR-038은 *권장만* 하고 강제 차단 X (D9). 대응: ADR-038 면책 단락 참조 — 빌드 캐시 / 테스트 / 외부 리소스 격리는 *프로젝트 환경 책임*. 충돌 사고를 다음 stabilize 라운드 IMPROVEMENT_GUIDE에 [관측됨] 라벨로 기록 → ADR-038의 [가설+외부실증] → [관측됨] 승격 evidence로 활용.

### 14-11. `## 4-1` plan 시점 채움이 sizing self-check (5 파일 한도)와 충돌
원인: 한 task의 `## 4-1` enumeration이 6+ 파일인데 본문에 *"scaffolding/auth 예외"* 명시 없음. 대응: 기존 sizing self-check (plan-workitem step 8) 가 *추가 분해 권장 텍스트* 출력 (자동 차단 X). 사용자가 분해 결정. 본 개선은 sizing 룰 자체를 변경하지 않음 — `## 4-1`이 plan 시점에 채워졌다는 사실만으로 sizing self-check가 더 정확히 발화 (기존엔 본문 path-like 토큰 추출이라 정확도 낮았음).

---

## 15. 본 개선의 evidence 회수 계획 (선택)

ADR-022 (Ratchet — enabling [가설→실증] 승격) 정합 — 본 개선의 `[가설+외부실증]` 라벨을 `[관측됨]`으로 승격하는 계획:

- 첫 fork 사용자의 첫 마일스톤 stabilize 시 `instruction improvement 후보` 단계에서 다음 메트릭을 측정 후 IMPROVEMENT_GUIDE에 보고:
  - `/validate-plan` 호출 빈도 / 라운드당 평균 호출 수.
  - 발견 별 Adopt vs Reject 비율 (특히 `[Plan-file-coverage]` 비율).
  - plan-workitem step 11-(c) LSP/MCP 가용 비율 + 가용 시 공유 모듈 후보 hit rate.
  - dependency 키워드 감지로 단독 wave 분리된 task 수.
  - `claude --worktree` 사용 비율 / wave 그룹 안의 충돌 사고 수.
- 3+ 라운드 누적 후 본 ADR-038에 Amendment 1 박아 evidence 라벨 갱신 + (필요 시) 정책 강도 조정.

**가이드 사후 처리와의 정합** — 본 §15는 §13 옵션 A(가이드 삭제)와 충돌하지 않는다: evidence 회수 절차의 *책임 자리*는 **ADR-038 `## 후속 작업` 단락**이다 (가이드가 아니라). 본 §15는 fork 사용자가 ADR-038 후속 작업 단락만 보고도 회수 절차를 재구성할 수 있도록 *상세 안내*만 제공. 가이드 삭제 후에도 ADR-038만 살아 있으면 책임 추적 가능.

---

## 16. 마무리

- 본 가이드의 모든 phase 통과 + acceptance checklist ✅ = 개선 완료.
- 본 파일은 옵션 A에 따라 삭제 권장.
- ADR-038이 영구 정책 SSOT.
- 사용자 피드백은 IMPROVEMENT_GUIDE.md 또는 다음 stabilize 라운드 instruction improvement 후보로 회수.

**다음 단계**: 본 가이드를 따라 작업을 시작하려면 Phase 1 (ADR-038 작성)부터 순서대로 진행한다.
