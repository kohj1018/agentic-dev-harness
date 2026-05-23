# IMPROVE-GUIDE

> 이 문서는 **단계별 시공 도면**이다. 위에서 아래로 한 phase씩 순서대로 수행한다. phase 안의 단계도 순서대로. 추측 없이, 명시된 텍스트만 작성한다. 마지막 phase의 acceptance checklist가 모두 ✅ 되면 개선 완료.

---

## 0. 개선 목적 (왜 이걸 한다)

### 0-1. 현재 상태
- `/plan-workitem`이 1회 LLM 호출로 workitem 문서(milestone/feature/task)를 생성한다.
- 검증 메커니즘은 같은 세션 내 self-check 6종(`## 4. 정합성`, AC interpretation diversity, AC 형식, sizing, FAC↔AC 매핑, architect 호출 신호)만 존재.
- **다른 세션·다른 LLM**의 외부 관점 검증이 부재 — 같은 모델의 blind spot이 그대로 plan에 박힌 채로 implement로 넘어감.
- 병렬 가능성 정보는 TASK `## 9. 의존성`의 *선택 명시*에 의존하고 (비어 있으면 병렬 가능으로 간주), plan 출력에 *wave 그룹*으로 가시화되지 않음. 사용자가 "어떤 task를 동시에 implement해도 되나"를 매번 직접 위상 정렬해야 함.
- 같은 working tree에서 다중 `/implement-workitem` 동시 실행 시 file 충돌 / git index race / 빌드 캐시 충돌 위험이 있지만 worktree 권장 안내가 워크플로우에 박혀 있지 않음.

### 0-2. 도달 상태 (개선 후)
다음 3가지를 동시에 갖춘다.

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

**B. Parallel waves 출력** — `/plan-workitem`이 마지막 출력에 `## 9. 의존성` 기반 위상 정렬 wave 그룹을 echo. 사용자는 같은 wave 안의 task를 여러 터미널 세션에서 동시에 `/implement-workitem`으로 돌릴 수 있다.

**C. Worktree 권장 정책** — wave 그룹 안의 task를 병렬 implement할 때는 `claude --worktree` 사용 권장 (Claude Code 공식 worktree 지원). 단일 working tree 동시 implement는 운영상 비권장. `.gitignore`에 `.claude/worktrees/` 패턴 추가.

### 0-3. 비목표 (이번 개선에서 하지 않는 일)
- ❌ `/plan-workitem` 자체를 2-pass로 만들기 (ADR-026 비결정 No "2-pass planning" — 자동 2회 호출은 거절됨. 본 개선은 **opt-in 별 skill**이라 다른 트레이드오프).
- ❌ wave 그룹을 milestone/feature 문서 *본문*에 영속 저장 (`## 9. 의존성`이 SSOT — 위상 정렬은 derived view라 drift 위험).
- ❌ 파일 충돌 자동 차단 (file overlap 경고만 출력, 사용자 결정 — ADR-007 책임 경계 정합).
- ❌ AGENTS.md 본문 변경 (ADR-011 100줄 cap 보호. 본 개선은 enabling 정책 — AGENTS.md 1줄도 추가 X).
- ❌ 빌드 캐시 / 테스트 격리 / DB·포트 등 외부 리소스 자동 격리 (보일러플레이트 책임 밖 — 프로젝트 환경 설계 책임. ADR-038 본문에 면책 단락).
- ❌ `--worktree` 강제 (운영 권장만 — 단일 worktree 실행도 사용자 선택으로 허용. 자동 spawn X).
- ❌ **`## 4-1. 변경 예정 파일/경로`의 책임 시점 변경** — 현행 "구현 시점에 채운다" 정책 그대로 유지. wave 그룹 file overlap 정밀도 향상은 외부 LLM peer review가 보완.
- ❌ **LSP/MCP import dependency graph 보조 회수** — baseline 보일러플레이트는 LSP-backed MCP server 제공·전제 X. 미래 fork evidence 누적 후 별도 ADR amend로 도입.
- ❌ **리뷰 P2 finding의 다른 산출물 이주** — P2는 한 라운드에 즉시 처리하거나 drop. IMPROVEMENT_GUIDE 등 다른 산출물 수정 책임 경계 예외 신설 X.

### 0-4. 정책 강도 (ADR-022 정합)
본 개선의 모든 새 정책은 **enabling (약)** 강도. 자동 차단 / Pass 차단 트리거 없음. 사용자가 cross-review를 건너뛰어도 워크플로우는 그대로 작동. evidence label: `[가설→실증]` (ADR-022 합성 표기 — multi-LLM ensembling/worktree 외부 사례는 [외부실증] 측면, 본 보일러플레이트 자체 [관측됨]은 0건이라 fork 첫 라운드 후 [관측됨]으로 승격 예정).

---

## 1. 사전 점검 (작업 시작 전)

**Shell 환경 전제**: 본 가이드의 shell 명령은 *POSIX 기준* (Bash / Git Bash / WSL). `mkdir -p`, `touch`, `grep`, `git diff --name-only $BASE..HEAD`, HEREDOC commit 등 POSIX 문법 사용. Windows PowerShell-native 환경에서는 동등 명령으로 치환 (예: `mkdir -p X` → `New-Item -ItemType Directory -Force X`, `touch X` → `New-Item -ItemType File X` (이미 존재 시 에러 — 무시), `BASE=$(...)` → `$BASE = git rev-parse HEAD`, HEREDOC → `@'...'@`). 가능하면 Git Bash 또는 WSL 셸에서 실행하는 게 가장 단순.

작업 시작 전에 다음을 확인한다. 1건이라도 실패하면 본 가이드를 따라 작업하지 말고 사용자에게 보고.

1-1. 현재 디렉터리가 git repository root인지 확인:
```bash
git rev-parse --show-toplevel
```
출력이 본 가이드를 실행하는 fork된 경로와 동일해야 함.

1-2. 작업 트리가 clean한지 확인:
```bash
git status --porcelain
```
출력이 비어 있어야 함. 변경이 있으면 사용자에게 commit/stash 후 재개를 안내.

**예외 — 본 가이드 자체의 변경 / IDE 설정 modified는 허용**:
- `?? IMPROVE-GUIDE.md` 또는 `M IMPROVE-GUIDE.md` (본 가이드 파일 자체) — tracked/untracked 어느 쪽이든 *commit 대상 아님*. 사용자가 작업 종료 후 직접 처리한다.
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

1-5. ADR-022(Ratchet) / ADR-026(plan-workitem schema) / ADR-037(spec coverage) 본문 한 번 훑어 본다 — 본 개선은 이 3개의 영향을 직접 받는다.

1-6. Phase 1 시작 *직전* commit hash를 환경변수로 저장 — §5-5 회귀 점검의 baseline:
```bash
BASE=$(git rev-parse HEAD)
echo "$BASE"   # 본 가이드 작업 세션 내에서 $BASE 그대로 사용. 세션이 끊기면 출력 hash를 별도 메모 후 §5-5에서 직접 치환.
```

---

## 2. Phase 1 — ADR-038 작성 + index 갱신 (commit 1)

목적: 본 개선의 정책 본문을 ADR로 박는다 (정책=ADR 패턴 — ADR-005 패턴 4 정합).

### 2-1. 신규 파일 작성: `docs/90-decisions/boilerplate/ADR-038-cross-llm-plan-validation.md`

다음을 정확히 그대로 작성:

```markdown
# ADR-038 — Cross-LLM Plan Validation (opt-in peer review + parallel waves)

> scope: boilerplate

## Status
accepted

## 배경
- [가설] multi-model ensembling / peer review가 단일 모델 blind spot을 회수한다는 외부 연구 패턴이 존재 (LLM-as-judge, debate, jury 등). 본 ADR은 구체 출처 미인용 — [가설] 단일 라벨. 향후 구체 URL 인용 시 [외부실증]으로 승격 (`## 후속 작업` 단락 evidence 회수 트리거).
- [관측됨] 본 보일러플레이트의 `/plan-workitem`은 6종 self-check(ADR-026 / ADR-037 정합)를 *같은 세션 내*에서 돌린다 (구조 사실).
- [가설] 동일 세션 내 self-check만으로는 *같은 모델의 blind spot*이 그대로 통과한다 (multi-model LLM-as-judge / debate / jury 패턴의 외부 연구가 회수 가능성 시사 — 본 repo [관측됨]은 0건 + 구체 출처 미인용으로 [가설] 단일 라벨, evidence 회수는 `## 후속 작업` 단락).
- [관측됨] `## 9. 의존성`에 병렬 가능성이 명시되어도 plan 출력에 *wave 그룹*으로 가시화되는 자리는 현재 plan-workitem SKILL 본문에 부재 — 사용자가 매번 수동 위상 정렬 (구조 사실).
- [외부실증] Claude Code native worktree support (현재 공식 문서 기준) (`claude --worktree`) — [공식 문서](https://code.claude.com/docs/en/worktrees) 인용으로 [외부실증] 자격. 다수 concurrent agent 운영 사례 자체는 구체 출처 미인용 — fork 사용자 첫 라운드의 worktree 사용 빈도/충돌 사고 수를 후속 작업으로 측정.

## ADR-026 비결정 단락과의 reconcile
ADR-026 "비결정 (No) — 2-pass planning: 토큰 2배 + stabilize reviewer 책임 중복"은 **같은 세션 내 자동 2회 호출**을 거절한 결정이다.

본 ADR이 신설하는 `/validate-plan` + `/repair-plan`은 **opt-in cross-session peer review**다 — 다음 4 차이로 ADR-026 비결정과 충돌하지 않는다.

| 차원 | ADR-026 비결정 (2-pass) | 본 ADR (cross-LLM peer review) |
|------|-----------------------|--------------------------------|
| 발화 주체 | `/plan-workitem` 자체 (자동) | 사용자 (수동, opt-in) |
| 세션 | 같은 세션 | 다른 세션(또는 다른 LLM) |
| 모델 다양성 | 동일 모델 2회 | 다른 모델 가능 (Claude + Codex 등) |
| 비용 | 자동 — 절약 불가 | 사용자가 선택해 지불 |

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
plan-workitem 마지막 출력에 task `## 9. 의존성`을 위상 정렬한 wave 그룹 echo (Kahn's algorithm 등 결정적 알고리즘 — 같은 입력에 같은 wave). **새 영속 저장 자리 신설 X** — derived view라 drift 위험 ([ADR-005](ADR-005-ssot.md) SSOT 정합). **file overlap 점검은 plan-workitem에서 제외** — `## 4-1. 변경 예정 파일/경로`가 implement 시점에 채워진다는 현행 정책(WORKFLOW.md §4 line 25 + TASK_TEMPLATE `## 4-1` 주석 SSOT)상 plan 시점 정확도 부족 → 외부 LLM peer review(`/validate-plan`)에 *전적 위임*. 새 dependency 추가 의도(manifest/lock 파일명 *어느 하나라도* 명시 — 예: `package.json` 또는 `pnpm-lock.yaml`)가 보이는 task는 *단독 wave* 라벨로 echo (자동 차단 X / 영속 저장 X).

### D4. agent 분담
- `/validate-plan` → reviewer agent (4번째 review surface "plan" 추가, Plan Quality 8 차원).
- `/repair-plan` → planner agent (workitem 문서 수정 권한 — 기존 plan-workitem과 동일).

### D5. Codex 호환
ADR-010 Phase 1 wrapper 패턴 정합. `.agents/skills/validate-plan` + `.agents/skills/repair-plan` 2개 wrapper 신설.

### D6. Wave 그룹 병렬 implement 시 worktree 권장
- wave 그룹 echo 시점에 다음을 *권장*으로 명시 (강제 X):
  - "**병렬 실행은 `claude --worktree` 사용 권장** (Claude Code 공식 worktree 지원). 이름을 `--worktree` 인자로 명시: `claude --worktree T-NNN -p "/implement-workitem T-NNN"`. 미명시 시 자동 이름이 붙어 task-id와 매칭 안 됨. 단일 working tree 동시 implement는 file 충돌 + git index race + 빌드 캐시 충돌 위험."
- `.gitignore`에 `.claude/worktrees/` 패턴 추가 — main checkout에서 worktree 폴더 untracked 노출 방지.
- 단, 단일 working tree에서 한 wave를 *순차 실행*하는 흐름도 그대로 지원 (사용자 선택).
- **`-p` + `--worktree` non-interactive 조합 주의**: 공식 문서상 자동 cleanup 안 됨. 작업 후 `git worktree remove .claude/worktrees/T-NNN`으로 수동 정리.
- **plan 산출물 가시성**: `claude --worktree`는 기본적으로 *원격 기준 fresh checkout*을 만들 수 있어 uncommitted plan 문서가 worktree 세션에서 안 보일 위험이 있음. 병렬 implement *전*에 `/plan-workitem` 산출물(milestone/feature/task 문서 + cross-review로 수정된 분)을 commit하거나, 같은 브랜치 worktree를 명시 — 사용자 환경 책임. 참고: [worktrees 공식 문서](https://code.claude.com/docs/en/worktrees).

## 정책 강도 (ADR-022 정합)
**enabling (약)** — 자동 차단 / Pass 차단 트리거 0건. 사용자가 cross-review를 건너뛰면 워크플로우는 그대로 작동.
- Evidence label: `[가설→실증]` (ADR-022 합성 표기 — Claude Code worktree 공식 docs는 [외부실증], multi-model peer review는 [가설] — 본 보일러플레이트 [관측됨] 0건이라 Phase 시뮬레이션 통과 후 [관측됨]으로 승격 예정. Ratchet 약 적용 가능).

## 동시 implement 면책 단락 (사용자/환경 책임)
본 ADR은 다음 충돌 차원을 *자동 격리해주지 않는다* — 프로젝트 환경 설계 책임:
- **빌드 캐시 race**: `tsbuildinfo` / `.next/cache` / `target/` 등. worktree-per-task로 격리 권장.
- **테스트 러너 / 통합 테스트**: 포트 / 임시 DB / fixture 공유 시 동시 실행 충돌. testcontainers · 임시 디렉터리 · 자동 포트 할당으로 격리 권장.
- **외부 리소스**: dev DB / Redis / 외부 API rate limit. Docker Compose의 task별 분리 인스턴스 또는 환경 변수 prefix 격리 권장.
- **lockfile race**: 새 의존성 추가 task는 단독 wave로 진행 권장 — 다른 task와 동시 install 시 lock 파일 race + 새 패키지의 cross-task transitive 영향 우려.

본 단락은 ADR-038 본문에 영속 — 사용자/fork가 같은 working tree에서 다중 implement를 시도하다 충돌 시 1차 책임 명시.

## 비결정 (영구 No)
- ❌ `/plan-workitem` 자체에 자동 2-pass 박기 — ADR-026 비결정 그대로 유지.
- ❌ 리뷰 결과 자동 적용 (수용·기각 판단 없이) — ADR-007 책임 경계 위반 (planner가 판단 책임).
- ❌ wave 그룹을 milestone/feature 문서 본문에 영속 저장 — `## 9. 의존성` SSOT drift 위험 (ADR-005 위반).
- ❌ 파일 overlap 자동 차단 — 사용자 결정 (`/plan-workitem`은 경고 출력만).
- ❌ `--worktree` 자동 spawn — 사용자가 명시 실행 (강제 X).
- ❌ TASK_TEMPLATE `## 4-1` 책임 시점 변경 — 현행 "구현 시점에 채운다" 정책 유지. wave 정밀도 향상은 외부 peer review가 보완.
- ❌ LSP/MCP server를 본 보일러플레이트가 제공·전제 — fork별 자체 책임. 본 ADR이 baseline에 박는 범위 밖.
- ❌ 빌드 캐시 / 테스트 / 외부 리소스 자동 격리 — 프로젝트 환경 설계 책임 (면책 단락 참조).
- ❌ 리뷰 P2 finding의 다른 산출물 이주 — P2는 한 라운드에 즉시 처리하거나 drop.

## 결과
- 사용자가 plan 품질을 외부 모델로 cross-validate할 수 있는 opt-in 경로.
- `## 9. 의존성` 기반 wave 그룹 가시화 — 사용자가 여러 터미널에서 `/implement-workitem`을 병렬 실행 가능.
- worktree-per-task 권장 정책으로 병렬 implement 안전성 확보.
- 적용 surface (8곳):
  1. `.claude/skills/validate-plan/SKILL.md` 신설.
  2. `.claude/skills/repair-plan/SKILL.md` 신설.
  3. `.claude/skills/plan-workitem/SKILL.md` parallel waves 출력 + cross-review hook 안내 + worktree 권장.
  4. `.claude/agents/reviewer.md` 4번째 surface "plan" + Plan Quality 8 차원 + Write 범위 확장.
  5. `.agents/skills/validate-plan/` Codex wrapper.
  6. `.agents/skills/repair-plan/` Codex wrapper.
  7. `docs/00-meta/STRUCTURE.md` + `docs/00-meta/WORKFLOW.md` + `docs/00-meta/DELEGATION_STRATEGY.md` sub-loop + worktree 권장.
  8. `.gitignore` `plan-reviews/*.md` + `.claude/worktrees/` 패턴 + `README.md` + `README_ko.md` flow 다이어그램.

## 후속 작업
- 첫 fork 사용자의 `/validate-plan` 호출 빈도 / finding Adopt vs Reject 비율 / `claude --worktree` 사용 빈도를 stabilize-milestone instruction improvement 후보로 추적 (ADR-022 `[가설→실증]` → `[관측됨]` 승격 트리거).
- evidence가 누적된 뒤 — wave 그룹 file overlap 정밀도 부족이 [관측됨]으로 잡히면 — `## 4-1` plan 시점 채움 / LSP-MCP 보조 같은 부수 정책을 별도 ADR amend로 추가 검토.

## 참고
- ADR-005 (SSOT — `## 9. 의존성` SSOT 정합)
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
| 038 | Cross-LLM Plan Validation + Parallel Waves | accepted | — | opt-in peer review (다른 세션·다른 LLM) — /validate-plan + /repair-plan 신설 + wave 그룹 echo + worktree 권장 |
```

### 2-3. 검증
- `cat docs/90-decisions/boilerplate/ADR-038-cross-llm-plan-validation.md` — Status `accepted` 포함
- `grep -n "038" docs/90-decisions/boilerplate/README.md` — 1개 결과
- `grep -E "^\| 037 " docs/90-decisions/boilerplate/README.md` — 변경 없이 그대로
- ADR-038 본문에 D1~D6 6개 결정 + 면책 단락 + 비결정 9개 모두 존재
- 다른 ADR row의 *Amendments* 컬럼 / 한 줄 요약 컬럼 흔들리지 않음 (수직 정렬 보존)

### 2-4. 커밋

스테이징 (명시 add):
```bash
git add docs/90-decisions/boilerplate/ADR-038-cross-llm-plan-validation.md
git add docs/90-decisions/boilerplate/README.md
```

커밋 본문 (HEREDOC) — **`Refs:` footer 없음** (ADR-008 amend 2의 commit footer `Refs:` 값은 *`T-NNN` task ID 형식*이 기본. 본 가이드는 boilerplate ADR 자체를 적용하는 commit이라 *task ID가 존재하지 않음* — 따라서 commit footer는 생략. ADR 자체에 대한 추적은 *PR body footer*에 `Refs: ADR-038`로 박는 형태 — ADR-008 amend 2 *"PR body footer는 ADR-NNN 허용"* 정합).

```bash
git commit -m "$(cat <<'EOF'
docs(boilerplate): add ADR-038 for cross-LLM plan validation + parallel waves

New ADR introducing opt-in /validate-plan + /repair-plan sub-loop, plan-
workitem parallel wave output, worktree 권장 정책. Reconciles with ADR-026
비결정 (2-pass planning) via 4-dimension difference table. baseline에서는
cross-review + waves + worktree 3가지만 박고, ## 4-1 책임 시점 / LSP-MCP /
P2 deferred 같은 부수 정책은 evidence 누적 후 ADR amend로 검토.
EOF
)"
```

---

## 3. Phase 2 — plan-reviews 디렉터리 + reviewer agent + skill 2종 (commit 2)

목적: 임시 리뷰 파일 자리 + reviewer agent plan surface + validate-plan/repair-plan skill 신설을 한 묶음에 commit.

### 3-1. 디렉터리 + `.gitkeep` 생성
```bash
mkdir -p docs/40-validation/plan-reviews
touch docs/40-validation/plan-reviews/.gitkeep
```

### 3-2. `.gitignore` 갱신

**본 repo는 이미 `.claude/worktrees/` 패턴을 보유** (현재 .gitignore line 12 기준) → 본 phase에서는 *plan-reviews 패턴 2줄만 추가*한다. 다른 fork에서 부재 시에만 추가:
```bash
grep -nF ".claude/worktrees/" .gitignore   # 1+ 라인이면 그대로 둠, 0 라인이면 마지막에 추가
```

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

(`.claude/worktrees/`는 본 repo에 이미 있으므로 *추가하지 않음*. 다른 fork에서 부재 시에만 별도 1줄 추가 — `grep` 결과로 분기.)

### 3-3. `.claude/agents/reviewer.md` 수정

4곳을 *순서대로* 수정.

#### 3-3-A. "Document Consistency 체크" 섹션 내 호출 surface 단락 갱신

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
- `plan`: Plan Quality 8 (아래 별도 섹션). Clean Code / Scope Discipline / Doc Consistency 미적용.
```

#### 3-3-B. Plan Quality 8 차원 섹션 신설

위 3-3-A 단락 바로 다음, "Write/Edit 사용 범위:" 단락 이전에 다음 단락을 *삽입*:

```
## Plan Quality 8 차원 (plan surface 전용 — ADR-038)

`/validate-plan` 호출 시 본 agent가 milestone/feature/task 문서를 비판적으로 검토할 때 사용하는 차원. 각 발견은 P0 / P1 / P2 우선순위와 카테고리 라벨을 함께 단다.

1. **[Plan-scope]** — Charter `## 5. 비목표` 키워드 위반 / 상위 milestone `## 4. 제외되는 기능` 위반 의심. (P0 권장)
2. **[Plan-sizing]** (ADR-026) — 1 task = 1 RGR 사이클 위반 / AC 4개 이상 / 변경 예정 파일 5개 초과 (초기 scaffolding·auth 예외). (P1 권장)
3. **[Plan-AC-form]** (ADR-026) — Given-When-Then 형식 부재 / 강력 금지 verb 사용 ("works"/"looks good"/"is correct"/"is fine"). (P0 권장)
4. **[Plan-ambiguity]** (ADR-006 amend1) — AC 1개에 2+ 합리적 해석 존재. (P1 권장)
5. **[Plan-FAC-coverage]** (ADR-037) — feature `## 7-1. FAC ↔ AC 매핑표`의 unmapped FAC / 누락 매핑. (P0 권장)
6. **[Plan-dep]** — task `## 9. 의존성`의 누락 / 잘못된 병렬 주장 (사실은 sequential 필요). (P1 권장)
7. **[Plan-arch]** (ADR-006) — ARCHITECTURE_OVERVIEW `## 3-1` 레이어 경계 위반 의심. `## 3-1` 부재 fork에서는 본 차원 skip + 그 사실을 리뷰 파일 "핵심 관찰"에 명시. (P1 권장)
8. **[Plan-doc-link]** — task `## 7. 관련 문서` 또는 feature `## 11. 관련 문서`의 link 누락 / 깨짐. (P2 권장)

라벨링 예: `P0 [Plan-AC-form] T-002:AC-1 — verb "works"는 비측정 — 재분해 권장 ([Given]..[When]..[Then] 형태 + verb "returns"/"persists" 등)`.
```

#### 3-3-C. Write/Edit 사용 범위 단락 확장

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

#### 3-3-D. 정책 근거 단락 확장

현재 본문 (line 65 근처):
```
정책 근거: [ADR-006](../../docs/90-decisions/boilerplate/ADR-006-simplicity-and-architecture.md).
```

다음으로 *교체*:
```
정책 근거: [ADR-006](../../docs/90-decisions/boilerplate/ADR-006-simplicity-and-architecture.md), [ADR-038](../../docs/90-decisions/boilerplate/ADR-038-cross-llm-plan-validation.md) (plan surface).
```

### 3-4. `.claude/skills/validate-plan/SKILL.md` 작성

```bash
mkdir -p .claude/skills/validate-plan
```

새 파일에 다음을 그대로 작성:

```markdown
---
name: validate-plan
description: 다른 세션·다른 LLM에서 `/plan-workitem`이 생성·갱신한 workitem 문서를 비판적으로 교차 검토하고 임시 리뷰 파일 1개를 작성한다. workitem 문서 자체는 수정하지 않는다 (ADR-038).
argument-hint: "[milestone or feature or task id] [--reviewer-tag <tag>]"
disable-model-invocation: true
allowed-tools: Read Glob Grep Write
context: fork
agent: reviewer
context-pack: minimal
---

이 skill은 **판정 + 임시 리뷰 파일 기록 전용**이다. milestone/feature/task 문서 일체 수정 금지. 코드 수정 금지. 커밋 금지.

너의 역할은 입력 workitem ID에 해당하는 plan 문서를 *외부 시선*으로 비판적으로 검토하고, 임시 리뷰 파일 1개를 작성하는 것이다.

**호출 시나리오**: 사용자는 원본 plan 세션과 *다른 터미널·다른 세션·다른 LLM*에서 본 skill을 호출한다. 본 skill의 출력 리뷰 파일은 원본 세션의 `/repair-plan`이 회수한다.

**⚠ 같은 checkout/worktree 운영 제약**: `/validate-plan`이 작성하는 리뷰 파일은 `docs/40-validation/plan-reviews/`의 *로컬 파일*이며 `.gitignore`된 상태. 다른 worktree 또는 다른 checkout에서 호출하면 원본 세션의 `/repair-plan`이 파일을 *못 본다*. **두 skill을 같은 checkout/worktree에서 실행**하거나, 다른 worktree에서 실행했다면 *원본 checkout으로 파일을 수동 이동* 후 `/repair-plan` 호출.

**다중 리뷰어 동시 실행 시 `--reviewer-tag` 필수 권장** — 각 리뷰어 호출 시 *서로 다른 tag 명시* (예: `--reviewer-tag claude-b`, `--reviewer-tag codex`). 미지정 시 둘 다 `default` 태그로 저장되어 충돌 가능성 발생 — 자동 suffix 부여 동작은 아래 입력 단락 참조.

입력:
- `$ARGUMENTS`에는 milestone ID(`M1`) / feature ID(`F-001`) / task ID(`T-001`) + 선택 플래그 `--reviewer-tag <tag>`가 들어온다.
- `--reviewer-tag` 미지정 시 `default` 사용.
- **tag 형식 제약**: `[A-Za-z0-9._-]{1,32}` (파일 경로에 들어가므로). **미일치 시 *즉시 종료*** (silent fallback X — silent overwrite 위험 회피). 사용자에게 valid tag 형식 안내 후 종료.
- **workitem-id 형식 제약**: `M[0-9]+` / `F-[0-9]+` / `T-[0-9]+` 만 허용. `/`, 공백, glob 메타문자(`*`, `?`, `[`) 포함 시 즉시 종료.
- **파일 존재 시 자동 suffix**: 호출 시점에 `docs/40-validation/plan-reviews/<workitem-id>.<tag>.md`가 이미 존재하면 `<tag>-2.md`, `<tag>-3.md`로 *자동 suffix 부여* (silent overwrite 방지). 출력에 "기존 리뷰 파일 존재 — `<id>.<tag>-N.md`로 저장" 한 줄 안내.

반드시 먼저 읽을 파일:
- `docs/10-charter/PROJECT_CHARTER.md` (`## 5. 비목표`, `## 7. 제약 조건` 참조)
- `docs/20-system/ARCHITECTURE_OVERVIEW.md` (`## 3-1. 레이어 경계` 참조 — *부재* 시 [Plan-arch] 차원 skip + 리뷰 파일 "핵심 관찰"에 그 사실 명시)
- 입력 ID에 해당하는 workitem 문서 + **모든 하위 문서**:
  - `M1` 입력 → `docs/30-workitems/milestones/M1-*.md` + 본 마일스톤 산하 feature/task 전체
  - `F-001` 입력 → 해당 feature 문서 + 본 feature 산하 task 전체
  - `T-001` 입력 → 해당 task 문서 + (있으면) 상위 feature + 상위 milestone
- **하위 문서 탐색 규칙**:
  1. **파일명 prefix glob**: `M1-*.md`, `F-001-*.md`, `T-NNN-*.md` 패턴.
  2. **상위 문서 link 본문**: milestone `## 3. 포함되는 기능` / feature `## 7-1. FAC ↔ AC 매핑표` / task `## 7. 관련 문서`에서 명시 link.
  3. **본문 link**: 상위/하위 문서가 서로 인용한 markdown link 추적.
  세 단계 모두 결과 0건이면 *"하위 문서 회수 0건"* 한 줄 echo 후 본 workitem만 회수하고 진행 (자동 차단 X).
- `docs/30-workitems/_templates/MILESTONE_TEMPLATE.md`, `FEATURE_TEMPLATE.md`, `TASK_TEMPLATE.md` (양식 정합 점검용)

**큰 milestone budget 가이드 (ADR-019 minimal/JIT 정합)**: 산하 task 합산 ≥10개면 다음 순서로 budget — (a) feature 문서 전체 + 각 task `## 6 AC` 섹션만 1차 회수, (b) 그 결과로 P0 의심 task 후보를 좁힌 뒤 (c) 후보 task 본문 전체를 깊게 읽는다. 모든 task 본문을 사전 fork-load 금지.

검토 차원 (8 dimensions — reviewer.md의 *Plan Quality 8 차원* 정합):
1. **[Plan-scope]** — Charter `## 5. 비목표` 키워드 위반 / 상위 milestone `## 4. 제외되는 기능` 위반. P0 권장.
2. **[Plan-sizing]** — 1 task = 1 RGR 위반 / AC 4개 이상 / 변경 예정 파일 5개 초과 (초기 scaffolding·auth 예외). P1 권장.
3. **[Plan-AC-form]** — Given-When-Then 형식 부재 / 강력 금지 verb ("works"/"looks good"/"is correct"/"is fine"). P0 권장.
4. **[Plan-ambiguity]** — 1 AC에 2+ 합리적 해석 가능. P1 권장.
5. **[Plan-FAC-coverage]** — feature `## 7-1. FAC ↔ AC 매핑표`의 unmapped FAC. P0 권장.
6. **[Plan-dep]** — task `## 9. 의존성` 누락 / 잘못된 병렬 주장. P1 권장.
7. **[Plan-arch]** — ARCHITECTURE_OVERVIEW `## 3-1` 레이어 경계 위반 의심. *`## 3-1` 섹션 자체가 부재한 fork*에서는 본 차원 *skip* + "핵심 관찰"에 "[Plan-arch] skipped: `## 3-1` 부재" 한 줄 명시. P1 권장.
8. **[Plan-doc-link]** — task `## 7. 관련 문서` / feature `## 11. 관련 문서` link 누락·깨짐. P2 권장.

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
- 리뷰 시각: <ISO 8601 — LLM 컨텍스트의 today's date 사용. 예: `2026-05-23T00:00:00Z`>
- 대상 workitem: <workitem-id>
- 대상 문서 경로 (회수한 모든 문서):
  - <path 1>
  - <path 2>
- 판정: ALL_GOOD | NEEDS_CHANGES

## 발견

### P0 (수용 강력 권장 — plan 품질 critical, repair-plan에서 우선 처리)
- [P0] [Plan-AC-form] T-002:AC-1 — verb "works"는 비측정. [Given]..[When]..[Then] 형식 + measurable verb로 재작성 권장.
- [P0] [Plan-FAC-coverage] F-001:FAC-3 — unmapped. 본 FAC를 커버할 task 추가 (예: T-007) 권장.

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

## 핵심 관찰 (3개 이내)
- ...
- ...

## 다음 권장 액션 (원본 plan 세션에서)
`/repair-plan <workitem-id>` — 본 파일 + 다른 리뷰어 파일을 일괄 회수.
```

마지막 출력 (메인 세션에 텍스트로):
- 판정 (ALL_GOOD / NEEDS_CHANGES) — *review verdict, 워크플로우 차단 아님*을 한 줄 명시. **ALL_GOOD 의미 보강**: P0 finding 0개를 의미 — P1/P2 finding은 있을 수 있고 `/repair-plan`에서 4결정 중 하나로 다뤄짐.
- 실제 사용된 `<reviewer-tag>` (입력 그대로 또는 자동 suffix 부여된 `<tag>-N`). suffix 부여 시 사유 1줄 함께 출력 ("기존 파일 존재 — `-N` suffix 부여").
- P0 / P1 / P2 카운트
- 리뷰 파일 경로
- 다음 권장 액션: "원본 plan 세션에서 `/repair-plan <workitem-id>` 실행" + (다른 worktree에서 호출했을 시) "리뷰 파일을 원본 checkout으로 이동 후 호출"

가드:
- workitem 문서(milestone / feature / task) 일체 수정 금지.
- IMPROVEMENT_GUIDE / QA_FINDINGS / report 디렉터리 등 다른 산출물 위치 수정 금지.
- 코드 일체 수정 금지.
- 커밋 금지.

## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 ADR/architecture 섹션은 task 본문에서 발화 시 인용 — 사전 fork-load 금지.
```

### 3-5. `.claude/skills/repair-plan/SKILL.md` 작성

```bash
mkdir -p .claude/skills/repair-plan
```

새 파일에 다음을 그대로 작성:

```markdown
---
name: repair-plan
description: 원본 plan 세션에서 실행. docs/40-validation/plan-reviews/<workitem-id>.*.md의 모든 리뷰를 회수해 수용·기각을 판단하고 workitem 문서를 수정한 뒤 리뷰 파일을 삭제한다 (ADR-038).
argument-hint: "[milestone or feature or task id]"
disable-model-invocation: true
allowed-tools: Read Glob Grep Write Edit Bash(rm docs/40-validation/plan-reviews/*.md)
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
   - **glob 결과 → 실제 파일 경로 목록을 메모리에 회수.** 이후 *수행 step 6*의 삭제는 이 목록의 각 파일을 한 개씩 정확히 삭제한다 (glob 재실행 금지 — race 차단).
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
   - **Reject-conflict** — 다른 리뷰어와 반대 의견 + 본 plan이 더 정합 (한 줄 사유 — 어느 리뷰어의 어떤 주장이 본 plan과 정합 안 되는지 명시).
3. 결정 우선순위: P0 > P1 > P2. **한 라운드에 P0 + P1 + P2 모두 판정 + 처리한다** — P2 deferred 자리 신설 X (ADR-038 비결정 정합 — "다음 stabilize 라운드 instruction improvement 후보" 같은 *defer-식 reject 사유는 표면 정합/실질 모순*이므로 금지). P2도 동일하게 4결정 중 하나로 판정: trivially 수용 가능 시 Adopt / Adopt-modified, 리뷰어가 잘못 본 경우(예: 이미 있는 link를 누락이라고 보고) Reject-false-positive, 본 plan이 더 정합한 경우 Reject-conflict. 4결정 카테고리 *외의 deferred drop은 허용 X* — 정직하게 *수용* 또는 *기각*만.
4. **다중 리뷰어 충돌 처리**: 같은 항목에 대해 리뷰어 A는 Adopt 권장, 리뷰어 B는 다른 수정 권장한 경우, 본 skill이 charter / architecture 정합 기준으로 어느 쪽을 더 받아들였는지 결정 + 결정 근거 1줄. 자동 합의 / 다수결 X — *planner agent 판단 책임* (ADR-007 책임 경계 정합).
5. Adopt / Adopt-modified로 결정된 항목에 대해 workitem 문서를 수정. 수정 후에도 양식 정합을 점검 (TEMPLATE의 섹션 번호 유지, FAC↔AC `## 7-1` 매핑 갱신, AC Given-When-Then 형식 유지). `## 9. 의존성`이 수정된 경우 그 사실을 *기록*해 아래 "마지막 출력" 단락의 wave 재emit 안내에 포함.
6. **삭제 전 사전 조건 점검** — 모든 P0/P1/P2 항목이 4결정 중 하나로 판정됐는가. 정합이면 삭제 진행.
   **삭제 전 echo 강제**: 메인 세션 출력에 *삭제 대상 경로 목록 전체를 echo* (예: `삭제 예정: M1.claude-b.md, M1.codex.md`). 사용자가 *눈으로* 검증 가능하게 함 — frontmatter `allowed-tools`의 `Bash(rm ...*.md)`가 기술적으로는 모든 plan-review md 삭제를 허용하므로, 본 echo가 *prompt-level safety* 마지막 가드.
   삭제는 *반드시 먼저 할 일 step 1*에서 회수한 파일 경로 목록을 *한 개씩 정확히* 수행 — `rm <path>` 반복 (glob 재실행 금지). 다른 workitem ID의 파일은 *건드리지 않는다*. 마지막 점검 — 회수한 모든 경로가 `docs/40-validation/plan-reviews/<workitem-id>.` 접두 + `.md` 접미 정합.

책임 경계:
- 코드 일체 수정 금지.
- 자동 커밋 금지 — 결과만 출력하고 commit은 사용자/메인 세션이 별도 발화.
- workitem 문서 *외* 다른 산출물(QA_FINDINGS / report / IMPROVEMENT_GUIDE / ADR 등) 수정 금지.
- 본 workitem ID의 plan-review 파일만 삭제. 다른 ID의 plan-review 파일은 건드리지 않는다.

마지막 출력:
- 처리한 리뷰 파일 수 + 각 reviewer-tag 명단
- 결정 별 카운트:
  - Adopted: M개
  - Adopt-modified: K개
  - Rejected (false-positive): I개
  - Rejected (conflict): J개
- 수정된 workitem 문서 목록 (상대 경로)
- **`## 9. 의존성` 수정 여부 플래그**: 수정됐으면 한 줄 안내 — `의존성 수정됨 → 기존 wave 그룹 stale. /plan-workitem <id> 재실행해 wave 재산출 권장.`
- 다중 리뷰어 충돌이 있었던 항목 별 결정 근거 (있으면)
- 삭제된 리뷰 파일 목록 (*반드시 먼저 할 일 step 1*에서 회수한 경로와 1:1 정합)
- 다음 권장 액션: 보통 `/implement-workitem <task-id>`. 의존성 수정이 있었으면 `/plan-workitem <id>` 재실행이 먼저, 대규모 변경이면 `/validate-plan` 재실행 권장.

## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 ADR/architecture 섹션은 task 본문에서 발화 시 인용 — 사전 fork-load 금지.
```

### 3-6. 검증
- `ls .claude/skills/validate-plan/SKILL.md .claude/skills/repair-plan/SKILL.md docs/40-validation/plan-reviews/.gitkeep`
- `grep -c "ADR-038" .claude/skills/validate-plan/SKILL.md .claude/skills/repair-plan/SKILL.md .claude/agents/reviewer.md` — 각 1+ 라인
- reviewer.md plan surface + Plan Quality 8 차원 + Write 범위 확장 모두 존재
- validate-plan frontmatter `allowed-tools`에 Edit 미포함
- repair-plan frontmatter `allowed-tools`에 좁혀진 `Bash(rm docs/40-validation/plan-reviews/*.md)` 포함 (*.md 한정 — .gitkeep 보호)
- `.gitignore`에 plan-reviews 패턴 2줄 + `.claude/worktrees/` 1줄 (이미 baseline에 있음 — 본 phase 변경 없음, 최종 상태 확인용)
- repair-plan frontmatter `allowed-tools`에 `Bash(ls ...)` *없음* (Glob tool로 대체)
- validate-plan frontmatter `allowed-tools`에 `Bash(date *)` *없음* (LLM context의 today's date 사용)

### 3-7. 커밋
```bash
git add .claude/agents/reviewer.md
git add .claude/skills/validate-plan/SKILL.md
git add .claude/skills/repair-plan/SKILL.md
git add docs/40-validation/plan-reviews/.gitkeep
git add .gitignore
git commit -m "$(cat <<'EOF'
feat(skills): add validate-plan + repair-plan for cross-LLM peer review (ADR-038)

- New /validate-plan skill: reviewer-agent based, writes single ephemeral
  review file at docs/40-validation/plan-reviews/<id>.<tag>.md.
- New /repair-plan skill: planner-agent based, reads all review files for
  the workitem, decides accept/reject/modify per finding, applies adopted
  edits to workitem docs, then deletes the temp review files. P0+P1+P2
  all handled in one round (no cross-artifact deferred storage).
- Adds "plan" review surface to reviewer agent (Plan Quality 8 dims).
- Mirrors existing reports/ gitignore pattern for plan-reviews/ and
  ensures .claude/worktrees/ ignore is present for ADR-038 D6 (already
  on baseline; preserved as-is — no change when forks already have it).
EOF
)"
```

---

## 4. Phase 3 — plan-workitem + SSOT docs + Codex wrapper + README (commit 3)

목적: plan-workitem 본문에 parallel waves 출력 + cross-review hook + worktree 권장 추가 + SSOT 3종(STRUCTURE / WORKFLOW / DELEGATION_STRATEGY) + Codex wrapper + README 갱신을 한 묶음에 commit.

### 4-1. `.claude/skills/plan-workitem/SKILL.md` 수정

3곳을 *순서대로* 수정.

#### 4-1-A. "반드시 수행할 일" 단락 — step 11 신설

현재 본문 (line 50 근처):
```
10. **task 의존성 채움** — TASK_TEMPLATE `## 9. 의존성`을 분해 시 명시. 병렬 가능 task는 비워둔다.
```

위 줄 *직후*에 다음 단락을 *삽입*:
```
11. **wave 그룹 계산** (ADR-038 D3 / D6) — 다음 sub-step을 순서대로 수행. 결과는 본 skill *출력에만 echo* — workitem 문서 본문에 영속 저장 X (`## 9. 의존성`이 SSOT — ADR-005 정합). **Context 부담 회피**: 본 step의 검사 2종((a) 위상 정렬 / (b) lockfile race) + 선언 1종((c) 자동 분리 X) 모두 *각 task 본문 전체 fork-load 금지* — `## 9. 의존성` 본문 + `## 3. 구현 항목` 본문의 path-like 토큰만 회수 (ADR-019 minimal 정합). **file overlap 휴리스틱은 본 step에서 제외** — 정밀도가 낮고(`## 4-1`은 현행 정책상 plan 시점 대부분 비어 있음 — WORKFLOW.md §4 line 25 + TASK_TEMPLATE 주석 SSOT) 외부 LLM peer review(`/validate-plan`)에 전적으로 위임.

11-(a) **위상 정렬 (결정적 알고리즘)**: 각 task의 `## 9. 의존성` 본문에서 *self-ID 콜론 뒤*의 자연어 텍스트(예: `- T-002: T-001의 X 정의 후 시작 가능` → 콜론 뒤 "`T-001의 X 정의 후 시작 가능`") 안에서 **`T-[0-9]+` 패턴의 task ID 토큰을 모두 추출**. 추출한 토큰을 dep로 간주 → **단순 DAG 위상 정렬** (Kahn's algorithm 등 결정적 알고리즘). *주의*: ADR-026 `## 9` 본문은 self-ID prefix(`- T-NNN:`) + 자연어 dep 설명 형식이라 prefix 자체는 *해당 task 본인*이고 dep는 콜론 뒤 텍스트에 묻혀 있음 — prefix만 보면 안 됨. **결정성 보장**: 같은 입력(`## 9. 의존성` 텍스트)에 같은 wave 그룹. 단, *추출 자체*가 자연어 본문 기반이라 false-positive/negative 가능 — 사용자가 wave 결과를 *참고용*으로 활용 + 최종 의존성 판단은 사용자 책임.

11-(b) **lockfile race 경고**: task 본문(`## 3. 구현 항목`)에서 manifest/lock 파일명 *어느 하나라도* 명시되면 (OR 매치 — 예: `package.json` / `pnpm-lock.yaml` / `Cargo.toml` / `Cargo.lock` / `pyproject.toml` / `poetry.lock` / `uv.lock` / `go.mod` / `go.sum` 중 하나라도 본문에 등장) 해당 task를 "단독 wave (lockfile race risk)"로 표시. **출력 echo만, 자동 차단 X, 영속 저장 X** — 사용자가 wave 구성을 결정. **휴리스틱 한계 명시**: 본 검출은 *파일명 토큰이 본문에 직접 적힌 경우*만 잡음 — "add Redis client" 같은 자연어 dep 추가 task는 false negative. 출력에 *"본 검출은 manifest/lock 토큰 명시 task만 매치 — 자연어 dep 추가는 누락 가능"* 한 줄 echo 권장.

11-(c) **자동 분리 X**: 본 점검들은 *경고 출력만*. 사용자가 wave 내에서 sequential 진행 / 별 worktree 분리 / 그대로 동시 진행 중 결정.
```

#### 4-1-B. "마지막 출력" 단락 확장

현재 본문 마지막 출력 단락의 끝부분이:
```
- 다음 추천 단계(보통 `/implement-workitem [task-id]`)
```

다음으로 *교체*:
```
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
```

#### 4-1-C. "Cross-review hook" 단락 신설

본 skill의 `## Context 정책 (ADR-019)` 단락 *바로 앞*에 다음 단락을 *삽입*:

```
## Cross-review hook (ADR-038)
본 skill 호출 후 plan 품질에 확신이 부족하거나 다중 모델 관점을 원하면:
1. 별 터미널·별 세션 (Claude 또는 Codex)에서 `/validate-plan <workitem-id> --reviewer-tag <distinct-tag>` 1+ 회 실행. **다중 리뷰어 시 서로 다른 tag 필수** (default 충돌 silent overwrite 회피). 각 호출이 `docs/40-validation/plan-reviews/<id>.<tag>.md` 1개를 작성.
2. 원본 세션 (본 skill을 돌린 세션)에 돌아와 `/repair-plan <workitem-id>` 실행. 모든 리뷰 파일을 회수해 workitem 문서를 수정 + 리뷰 파일 삭제.

본 흐름은 *opt-in*. 건너뛰어도 워크플로우 정상 작동. *opt-in 시작 후 `/repair-plan`을 건너뛰면 `docs/40-validation/plan-reviews/<id>.*.md`가 잔존*: 다음 라운드 호출이 silent overwrite하거나 `rm docs/40-validation/plan-reviews/<id>.*.md`로 수동 정리.

운영 권장 (worktree·외부 리소스 면책 단락): ADR-038 D6 + 면책 단락 참조.
```

### 4-2. `docs/00-meta/STRUCTURE.md` 갱신

#### 4-2-A. Skill 본문 행의 카운트 갱신

현재 (line 31):
```
| Claude skill 본문 | `.claude/skills/<name>/SKILL.md` (13종 — bootstrap-project/bootstrap-stack/bootstrap-design/discover-product/plan-workitem/implement-workitem/validate-workitem/repair-workitem/finalize-workitem/stabilize-milestone/stack-guard/review-doc/boilerplate-context) | 수동 (boilerplate 제공) | Reference | baseline |
```

다음으로 *교체*:
```
| Claude skill 본문 | `.claude/skills/<name>/SKILL.md` (15종 — bootstrap-project/bootstrap-stack/bootstrap-design/discover-product/plan-workitem/validate-plan/repair-plan/implement-workitem/validate-workitem/repair-workitem/finalize-workitem/stabilize-milestone/stack-guard/review-doc/boilerplate-context) | 수동 (boilerplate 제공) | Reference | baseline |
```

#### 4-2-B. 신규 산출물 행 추가

`validation report` 행 *바로 다음*에 새 행을 추가한다. 현재 (line 36):
```
| validation report | `docs/40-validation/reports/<task-id>.md` | `/validate-workitem` | ephemeral | generated |
```

그 *직후* 1행 *삽입*:
```
| plan review | `docs/40-validation/plan-reviews/<workitem-id>.<reviewer-tag>.md` | `/validate-plan` (다른 세션·다른 LLM) | ephemeral | generated |
```

#### 4-2-C. Canonical Owner 매핑 표에 행 1개 추가

표 마지막 행 (line 94) *직후* 1행 *삽입*:
```
| Cross-LLM plan validation (opt-in peer review) | [ADR-038](../90-decisions/boilerplate/ADR-038-cross-llm-plan-validation.md) (정책 SSOT). 적용 surface: `.claude/skills/validate-plan/SKILL.md` + `.claude/skills/repair-plan/SKILL.md` 본문 + `.claude/agents/reviewer.md` Plan Quality 8 차원 — 세 surface가 한 묶음, ADR-038 본문 변경 시 동기 갱신. |
```

(parallel waves derived view / worktree 정책 / `## 4-1` 책임 시점은 추가 X — wave는 plan-workitem 단일 surface, worktree는 인용만, `## 4-1`은 본 개선의 비목표. STRUCTURE.md line 96의 압축 규칙 정합.)

### 4-3. `docs/00-meta/WORKFLOW.md` 갱신

#### 4-3-A. "3. 작업 단위 분해" 단락 확장

현재 본문 (line 12~15):
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
- **선택**: `/plan-workitem` 직후 plan 품질 cross-validate가 필요하면, 다른 세션·다른 LLM에서 `/validate-plan <workitem-id>` 1+ 회 → 원본 세션에서 `/repair-plan <workitem-id>`로 회수 (ADR-038). opt-in — 건너뛰어도 정상.
- **선택**: `/plan-workitem` 출력의 wave 그룹을 참조해 동일 wave task를 별 worktree에서 동시 `/implement-workitem` 가능. 권장 패턴은 `claude --worktree T-NNN -p "..."` (이름은 `--worktree` 인자로 필수, ADR-038 D6). 단일 working tree 동시 implement는 비권장.
```

(WORKFLOW.md **§4 "구현 및 검증"** 안의 line 25 "task `## 4-1. 변경 예정 파일/경로`는 implement 중 채운다 — plan 단계에서 미리 채울 의무 없음" 정책은 본 §3 패치와 *무관 — 그대로 유지*. ADR-038 비결정 단락의 "TASK_TEMPLATE `## 4-1` 책임 시점 변경 X" 정합. §0-3 비목표 #7과 동일.)

#### 4-3-B. "워크아이템 라이프사이클" 다이어그램 갱신

현재 본문 (line 76~79):
```
discover → bootstrap → plan → implement → validate ─┬─Pass─→ finalize → stabilize
                                                     └─Needs Fix─→ repair → (validate 재실행)
```

다음으로 *교체*:
```
discover → bootstrap → plan ─┬─→ implement → validate ─┬─Pass─→ finalize → stabilize
                              │                          └─Needs Fix─→ repair → (validate 재실행)
                              └─(opt-in, ADR-038)─→ validate-plan (별 세션) → repair-plan (원본 세션) → implement
```

> Note: wave 그룹 병렬 implement 시 `claude --worktree T-NNN -p "/implement-workitem T-NNN"` 권장 (ADR-038 D6 — 이름은 `--worktree` 인자로 필수).

### 4-4. `docs/00-meta/DELEGATION_STRATEGY.md` 갱신

#### 4-4-A. 위임 트리거 표에 행 추가

현재 표 마지막 본문 행이:
```
| 장문 코드/문서 탐색 | Explore 등 built-in subagent | 선택적 사용. 메인 컨텍스트 오염 방지 |
```

그 *직전*에 2행을 *삽입*:
```
| `/plan-workitem` 산출물의 cross-LLM peer review (opt-in) | reviewer (plan surface, Plan Quality 8 차원) | 다른 세션 (Claude 새 창 / Codex 등)에서 `$validate-plan` or `/validate-plan` 호출. 임시 리뷰 파일 1개만 작성, workitem 문서 수정 X (ADR-038). |
| Cross-review 결과 회수 + workitem 문서 수정 | planner | 원본 plan 세션에서 `/repair-plan`. 임시 리뷰 파일 회수 → 결정 → 적용 → 파일 삭제 (ADR-038). |
```

#### 4-4-B. "스킬 실행 순서 가이드" 단락 갱신

3번 항목 *직후*에 새 3a/3b 항목 추가:
```
3a. (선택) `/validate-plan <workitem-id>` — 다른 세션·다른 LLM에서 cross-review. 임시 파일 작성 (ADR-038).
3b. (선택) `/repair-plan <workitem-id>` — 원본 plan 세션에서 임시 파일 회수 + 적용 + 삭제 (ADR-038).
```

#### 4-4-C. 병렬 패턴 단락 + worktree 안내 갱신

"병렬 패턴 3종" 표 바로 아래 "선택 기준" 단락 (line 71):
```
선택 기준 — 가벼운 병렬: 1, 같은 파일 충돌 가능성 있는 단일 작업: 2, 작업 단위가 분명한 codebase-wide 분산 작업: 3.
```

다음으로 *교체*:
```
선택 기준 — 가벼운 병렬: 1, 같은 파일 충돌 가능성 있는 단일 작업: 2, 작업 단위가 분명한 codebase-wide 분산 작업: 3.

`/plan-workitem` 출력의 wave 그룹은 **본 표의 1·2·3과는 독립 차원**이다. 본 표는 메인 세션이 sub-agent를 한 turn 안에서 어떻게 호출하느냐(orchestration). wave 그룹은 *사용자가 여러 터미널·세션을 띄워 동일 wave의 task를 `/implement-workitem`으로 동시 진행*하는 multi-session 시나리오 (ADR-038).

**Wave 그룹 병렬 실행 권장 패턴** (ADR-038 D6 본문이 SSOT):
- `claude --worktree T-NNN -p "/implement-workitem T-NNN"` — 이름은 `--worktree` 인자로 필수. 미명시 시 자동 이름이 붙어 task-id와 매칭 안 됨. 공식 문서: [worktrees](https://code.claude.com/docs/en/worktrees).
- 단일 working tree 다중 implement 동시 실행 비권장. 외부 리소스 격리는 ADR-038 면책 단락 참조.
- `-p` + `--worktree` non-interactive 조합은 자동 cleanup 안 됨 — 작업 후 `git worktree remove .claude/worktrees/T-NNN` 수동 정리.
```

### 4-5. Codex wrapper 신설

#### 4-5-A. `.agents/skills/validate-plan/`

```bash
mkdir -p .agents/skills/validate-plan/agents
```

`.agents/skills/validate-plan/SKILL.md`:
```markdown
---
name: validate-plan
description: Use ONLY when the user explicitly types `$validate-plan <workitem-id>`. Do not trigger implicitly from generic phrasing.
---

Source of truth: `.claude/skills/validate-plan/SKILL.md`. Read it and follow the workflow.

Treat all frontmatter keys other than `name` and `description` (e.g., `agent:`, `disable-model-invocation:`, `allowed-tools:`, `context:`, `argument-hint:`, `model:`, `effort:`) as Claude-only and ignore them — execute locally in Codex.

**Slash command translation**: 본문 안의 `/validate-plan` 표기는 Claude 슬래시 커맨드다. Codex에서는 `$validate-plan`으로 읽고 사용자에게 안내한다. 본문에 등장하는 `/repair-plan` 표기도 `$repair-plan`으로 안내. Codex CLI는 `/`를 빌트인 슬래시 커맨드에 쓰므로 명시적 치환이 필요.

Preserve all repo policies from `AGENTS.md` and `docs/`.

If the source path no longer exists, this wrapper is stale — see ADR-010.
```

`.agents/skills/validate-plan/agents/openai.yaml`:
```yaml
policy:
  allow_implicit_invocation: false
```

#### 4-5-B. `.agents/skills/repair-plan/`

```bash
mkdir -p .agents/skills/repair-plan/agents
```

`.agents/skills/repair-plan/SKILL.md`:
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

`.agents/skills/repair-plan/agents/openai.yaml`:
```yaml
policy:
  allow_implicit_invocation: false
```

### 4-6. README.md / README_ko.md 갱신

#### 4-6-A. `README.md` — "Overall Flow" 다이어그램

현재 본문 (line 18~25):
```
/discover-product (optional)
  → /bootstrap-project → /bootstrap-stack → /stack-guard
  → /bootstrap-design (frontend only — fills DESIGN.md)
  → /plan-workitem → /implement-workitem
  → /validate-workitem → /repair-workitem (if Needs Fix) → /finalize-workitem
  → /stabilize-milestone
```

다음으로 *교체*:
```
/discover-product (optional)
  → /bootstrap-project → /bootstrap-stack → /stack-guard
  → /bootstrap-design (frontend only — fills DESIGN.md)
  → /plan-workitem
       └─ (optional) /validate-plan (separate session) → /repair-plan (origin session)
  → /implement-workitem (parallel by wave groups — see plan-workitem output)
       └─ recommended: `claude --worktree T-NNN -p "/implement-workitem T-NNN"` per task (name in `--worktree` arg)
  → /validate-workitem → /repair-workitem (if Needs Fix) → /finalize-workitem
  → /stabilize-milestone
```

#### 4-6-B. `README.md` — "Step 3" 본문

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
# Plan (emits parallel wave groups from task ## 9. 의존성)
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

> **Tip — parallel implement**: `/plan-workitem` emits "parallel waves" derived from each task's `## 9. 의존성`. Tasks in the same wave can be implemented in **separate terminal sessions / worktrees** in parallel. Recommended pattern: `claude --worktree T-NNN -p "/implement-workitem T-NNN"` — the name is passed as the `--worktree` argument (required, no default mapping to task-id). ⚠ **Plan-artifact visibility**: `claude --worktree` defaults to a fresh checkout from `origin/HEAD`, so uncommitted plan documents may be invisible inside the worktree session — commit plan artifacts first, or set `worktree.baseRef = "head"`. See [ADR-038](docs/90-decisions/boilerplate/ADR-038-cross-llm-plan-validation.md) for full worktree + external-resource caveats.
```

#### 4-6-C. `README.md` — Codex wrapper 목록

현재 본문 (line 97~101):
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

#### 4-6-D. `README_ko.md` 동일 의미 변경

`README_ko.md`에 동일 위치 동일 의미 변경 적용 — 한글 본문.

**"전체 흐름" 다이어그램**:
```
/discover-product (선택)
  → /bootstrap-project → /bootstrap-stack → /stack-guard
  → /bootstrap-design (UI 전용 — DESIGN.md 채움)
  → /plan-workitem
       └─ (선택) /validate-plan (별 세션) → /repair-plan (원본 세션)
  → /implement-workitem (wave 그룹 별 병렬 가능 — /plan-workitem 출력 참조)
       └─ 권장: `claude --worktree T-NNN -p "/implement-workitem T-NNN"` (이름은 `--worktree` 인자로 필수)
  → /validate-workitem → /repair-workitem (Needs Fix일 때) → /finalize-workitem
  → /stabilize-milestone
```

**"3단계" 본문**:
```
### 3단계: 분해 → 구현 → 마감

```text
# 분해 (task ## 9. 의존성 기반 wave 그룹 출력)
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

> **Tip — 병렬 구현**: `/plan-workitem`은 각 task의 `## 9. 의존성`에서 파생된 "병렬 wave"를 출력한다. 같은 wave 안의 task는 **별 터미널 세션·별 worktree**에서 동시에 `/implement-workitem`으로 진행할 수 있다. 권장 패턴: `claude --worktree T-NNN -p "/implement-workitem T-NNN"` — 이름은 `--worktree` 인자로 *필수* (미지정 시 task-id와 무관한 자동 이름 부여). ⚠ **plan 산출물 가시성**: `claude --worktree`는 기본 `origin/HEAD` 기준 fresh checkout이라 uncommitted plan 문서가 worktree 세션에서 안 보일 수 있음 → 병렬 implement 전 plan 산출물 commit 또는 `worktree.baseRef = "head"` 설정. worktree + 외부 리소스 면책 전체는 [ADR-038](docs/90-decisions/boilerplate/ADR-038-cross-llm-plan-validation.md) 참조.
```

**Codex wrapper 목록**:
```
2. 문서와 정책은 동일. 핵심 workflow skill은 Codex wrapper ($-prefixed)로 제공: $implement-workitem, $validate-workitem, $repair-workitem, $finalize-workitem, $plan-workitem, $validate-plan, $repair-plan, $bootstrap-project, $bootstrap-stack, $stabilize-milestone, $stack-guard. 나머지 skill (discover-product, review-doc, boilerplate-context, bootstrap-design)은 자연어로 호출. 자세한 워크플로우는 [WORKFLOW.md](docs/00-meta/WORKFLOW.md) 참조.
3. 자주 쓰는 core workflow skill은 Codex skill로 호출 가능:
   - Inner loop: `$implement-workitem T-001`, `$validate-workitem T-001`, `$repair-workitem T-001`, `$finalize-workitem T-001`
   - Planning / bootstrap / stabilize: `$plan-workitem M1`, `$bootstrap-project <brief>`, `$bootstrap-stack <스택>`, `$stack-guard`, `$stabilize-milestone M1`
   - Plan 교차 리뷰 (선택, ADR-038): `$validate-plan M1` (별 Codex 세션) + `$repair-plan M1` (`$plan-workitem`을 돌린 원본 세션)
```

### 4-7. 검증
- `grep -c "validate-plan" .claude/skills/plan-workitem/SKILL.md docs/00-meta/STRUCTURE.md docs/00-meta/WORKFLOW.md docs/00-meta/DELEGATION_STRATEGY.md README.md README_ko.md` — 각 1+ 라인
- `grep -c "ADR-038" docs/00-meta/STRUCTURE.md docs/00-meta/WORKFLOW.md docs/00-meta/DELEGATION_STRATEGY.md README.md README_ko.md` — 합산 5+ 라인
- `grep -c "wave" .claude/skills/plan-workitem/SKILL.md docs/00-meta/WORKFLOW.md docs/00-meta/DELEGATION_STRATEGY.md` — 합산 4+ 라인
- `grep -c "worktree" .claude/skills/plan-workitem/SKILL.md docs/00-meta/DELEGATION_STRATEGY.md README.md README_ko.md` — 합산 4+ 라인
- `ls .agents/skills/validate-plan/SKILL.md .agents/skills/repair-plan/SKILL.md .agents/skills/validate-plan/agents/openai.yaml .agents/skills/repair-plan/agents/openai.yaml` — 4개 모두 존재
- WORKFLOW.md **§4 line 25**의 "implement 중 채운다" 정책 *그대로 유지* (ADR-038 비결정 "TASK_TEMPLATE `## 4-1` 책임 시점 변경 X" 정합):
  ```bash
  grep -cF "implement 중 채운다" docs/00-meta/WORKFLOW.md
  ```
  결과 = 1 (변경 X).
- plan-workitem frontmatter `allowed-tools` 미변경 확인:
  ```bash
  grep "^allowed-tools:" .claude/skills/plan-workitem/SKILL.md
  ```
  baseline 그대로(`Read Glob Grep Write Edit`).

### 4-8. 커밋
```bash
git add .claude/skills/plan-workitem/SKILL.md
git add docs/00-meta/STRUCTURE.md docs/00-meta/WORKFLOW.md docs/00-meta/DELEGATION_STRATEGY.md
git add .agents/skills/validate-plan .agents/skills/repair-plan
git add README.md README_ko.md
git commit -m "$(cat <<'EOF'
docs(boilerplate): wire validate-plan/repair-plan into plan-workitem + SSOT docs + Codex wrappers + README (ADR-038)

- plan-workitem: step 11 wave grouping ((a) deterministic topological
  sort via Kahn's algorithm + (b) lockfile race detection + (c) no auto
  split — file-overlap heuristic excluded, delegated to /validate-plan).
  Output echo of waves + worktree pattern + cross-review opt-in hint,
  Cross-review hook section.
- STRUCTURE.md: skill count 13->15, plan-review artifact row, single
  canonical-owner row for cross-LLM peer review (parallel waves /
  worktree are quoted-only per STRUCTURE compression rule).
- WORKFLOW.md: section 3 sub-loop + worktree hint, lifecycle diagram.
- DELEGATION_STRATEGY.md: delegation triggers + skill order 3a/3b +
  parallel-pattern wave mapping + worktree recommendation.
- Codex wrappers for validate-plan + repair-plan (ADR-010 wrapper
  pattern, allow_implicit_invocation: false).
- README + README_ko: flow diagram + Step 3 + Codex list + worktree tip.
EOF
)"
```

---

## 5. Acceptance Checklist

본 가이드 완료 시 다음 항목을 모두 ✅ 해야 한다.

### 5-1. 신규 산출물 존재
- [ ] `docs/90-decisions/boilerplate/ADR-038-cross-llm-plan-validation.md` (Status: accepted, D1~D6 6개 결정 + 면책 단락 + 비결정 9개)
- [ ] `.claude/skills/validate-plan/SKILL.md` (frontmatter `agent: reviewer`, Plan Quality 8 차원)
- [ ] `.claude/skills/repair-plan/SKILL.md` (frontmatter `agent: planner`)
- [ ] `.agents/skills/validate-plan/SKILL.md` + `agents/openai.yaml`
- [ ] `.agents/skills/repair-plan/SKILL.md` + `agents/openai.yaml`
- [ ] `docs/40-validation/plan-reviews/.gitkeep`

### 5-2. 기존 파일 정합 갱신
- [ ] `docs/90-decisions/boilerplate/README.md`에 ADR-038 행 추가됨
- [ ] `docs/00-meta/STRUCTURE.md` skill count 13 → 15
- [ ] `docs/00-meta/STRUCTURE.md`에 plan-review 산출물 행 + Canonical Owner 1행 추가됨
- [ ] `docs/00-meta/WORKFLOW.md` "3. 작업 단위 분해" sub-loop + worktree 안내 추가됨 + 라이프사이클 다이어그램 갱신됨
- [ ] `docs/00-meta/DELEGATION_STRATEGY.md` 위임 트리거 표 2행 + 스킬 실행 순서 3a/3b + 병렬 패턴 wave + worktree 단락 추가됨
- [ ] `.claude/agents/reviewer.md` plan surface + Plan Quality 8 + Write 범위 확장됨
- [ ] `.claude/skills/plan-workitem/SKILL.md` step 11 sub-step (a)~(c) + 마지막 출력 wave 단락 + Cross-review hook 단락 추가됨
- [ ] `.gitignore`에 `plan-reviews/*.md` + `!plan-reviews/.gitkeep` + `.claude/worktrees/` 패턴 추가됨 (worktrees는 이미 있으면 중복 X)
- [ ] `README.md` flow + Step 3 + Codex 목록 + worktree tip 갱신됨
- [ ] `README_ko.md` 동일 변경 한국어로 적용됨

### 5-3. 정책 정합 (위반 0건)
- [ ] AGENTS.md 본문 변경 없음 (ADR-011 100줄 cap 보호)
- [ ] TASK_TEMPLATE / implement-workitem 본문 변경 없음 (ADR-038 비결정 "`## 4-1` 책임 시점 변경 X" + §0-3 비목표 #7 정합)
- [ ] `## 9. 의존성` 외에 wave 그룹의 영속 저장 자리 *없음* (ADR-005 SSOT 정합)
- [ ] `/validate-plan`은 workitem 문서를 *수정하지 않음* (frontmatter `allowed-tools`에 Edit 없음)
- [ ] `/repair-plan`은 workitem 문서 *외* 다른 산출물(QA_FINDINGS / report / IMPROVEMENT_GUIDE / ADR 등)을 *수정하지 않음*
- [ ] `/repair-plan` allowed-tools의 `Bash(rm docs/40-validation/plan-reviews/*.md)`로 *좁혀짐* (.gitkeep 보호 + 다른 파일 차단). `Bash(ls ...)` 권한 *없음* — Glob tool로 대체 (불필요한 권한 surface 회피)
- [ ] `/repair-plan` SKILL 본문에 workitem-id sanitization 가드(`M[0-9]+` / `F-[0-9]+` / `T-[0-9]+` 만 허용) 존재
- [ ] `/validate-plan` SKILL 본문에 reviewer-tag 형식 제약(`[A-Za-z0-9._-]{1,32}`) 존재
- [ ] 자동 차단 트리거 0건 — 모든 신규 정책은 enabling (ADR-022 정합). `NEEDS_CHANGES`는 리뷰 verdict이지 워크플로우 차단 아님
- [ ] ADR-038 본문에 ADR-026 비결정 단락과의 reconcile 4 차원 표 존재
- [ ] ADR-038 본문에 "동시 implement 면책 단락" 존재
- [ ] ADR-038 evidence 라벨이 `[가설→실증]` (ADR-022 합성 표기 표준 정합 — `[가설+외부실증]` 같은 비표준 표기 X)
- [ ] worktree 사용은 *권장만* — 자동 spawn 없음, 단일 working tree 실행도 허용
- [ ] plan-workitem frontmatter `allowed-tools` baseline 변경 없음

### 5-4. Git 정합
- [ ] 본 가이드의 commit 메시지가 Conventional Commits 형식 (ADR-008)
- [ ] commit 3개 (Phase 1 ADR / Phase 2 skill+agent / Phase 3 docs+wrappers+README)
- [ ] `git status --porcelain` 결과에 *본 가이드 파일 자체 (`IMPROVE-GUIDE.md`) + IDE 설정 modified* 외 다른 변경 없음 (§1-2 예외 정합)

### 5-5. 회귀 점검 (git diff baseline)
§1-6에서 저장한 `$BASE` 환경변수(또는 메모한 hash) 사용. **`--name-only`** 사용 — `--stat`의 요약 라인이 grep 필터를 통과해 false-positive 발생 회피:
```bash
# 본 개선의 비목표 surface는 변경 0이어야 함
git diff --name-only $BASE..HEAD -- AGENTS.md .claude/skills/implement-workitem/SKILL.md docs/30-workitems/_templates/TASK_TEMPLATE.md
# 출력: 0 라인 (3 파일 변경 0)

# ADR-038 외의 모든 boilerplate ADR도 변경 0
git diff --name-only $BASE..HEAD -- docs/90-decisions/boilerplate/ | grep -vE 'ADR-038|^docs/90-decisions/boilerplate/README\.md$'
# 출력: 0 라인 (ADR-038 신설 + README index 갱신 외 모두 그대로)
```

### 5-6. SSOT cross-reference grep
```bash
grep -l "ADR-038" docs/90-decisions/boilerplate/ADR-038-cross-llm-plan-validation.md docs/90-decisions/boilerplate/README.md docs/00-meta/STRUCTURE.md docs/00-meta/WORKFLOW.md docs/00-meta/DELEGATION_STRATEGY.md .claude/agents/reviewer.md .claude/skills/plan-workitem/SKILL.md .claude/skills/validate-plan/SKILL.md .claude/skills/repair-plan/SKILL.md README.md README_ko.md
```
모두 1개 이상의 결과를 내야 함. (Codex wrapper는 source of truth 경로만 인용하므로 ADR-038 직접 인용 없음 — 정합.)

### 5-7. Skill / wrapper 신규 디렉터리 존재
```bash
ls -d .claude/skills/validate-plan .claude/skills/repair-plan       # 둘 다 존재
ls -d .agents/skills/validate-plan .agents/skills/repair-plan       # 둘 다 존재

# 디렉터리만 카운트 — 숨김 파일/일반 파일 영향 회피
find .claude/skills -maxdepth 1 -mindepth 1 -type d | wc -l         # = 15 (Claude skill 신규 2개 포함)
```

---

## 6. 트러블슈팅

### 6-1. `docs/40-validation/plan-reviews/` 디렉터리가 commit되지 않음
원인: `.gitkeep`을 빠뜨렸거나 `.gitignore` 패턴이 너무 광범위. 대응: `.gitignore` 패턴이 `plan-reviews/*` (md 확장자 없이)면 `.gitkeep`까지 ignored됨 — `*.md` 확장자 명시 필수.

### 6-2. `/validate-plan` 호출 시 reviewer agent가 workitem 문서를 *수정해 버림*
원인: agent가 본 skill의 가드(workitem 수정 금지)를 무시. 대응: 임시 — 본 commit으로 진행 후 stabilize 라운드 instruction improvement 후보로 보고. 영구 — reviewer.md `Write/Edit 사용 범위` 단락의 surface 분기를 더 강하게 명시 (예: `validate-plan` surface는 plan-reviews/ *외* 모든 경로 Edit 호출 시 self-terminate).

### 6-3. `/repair-plan` 호출 시 임시 파일 0건
원인: 사용자가 `/validate-plan`을 먼저 돌리지 않음. 대응: skill 본문의 "결과 0건: 사용자에게 안내 후 종료" 가드대로 작동. 추가 변경 불필요.

### 6-4. `claude --worktree`로 호출했는데 main checkout에 worktree 폴더가 untracked로 등장
원인: `.gitignore`에 `.claude/worktrees/` 패턴이 빠짐. 대응: §3-2 단계로 확인 + `.gitignore`에 추가.

### 6-5. `claude --worktree` 세션에서 plan 문서가 안 보임
원인: `claude --worktree`가 원격 기준 fresh checkout을 만드는데 plan 산출물이 main에 uncommitted 상태. 대응: 병렬 implement *전*에 `/plan-workitem` 산출물(milestone/feature/task 문서, cross-review로 수정된 분 포함)을 commit 후 worktree spawn. 또는 같은 브랜치 worktree 명시. 자세히는 ADR-038 D6 + [worktrees 공식 문서](https://code.claude.com/docs/en/worktrees) 참조.

### 6-6. `/validate-plan`만 돌리고 `/repair-plan`을 건너뜀 → 임시 파일 잔존
원인: cross-review opt-in을 시작했지만 회수 단계를 건너뜀. 잔존 파일은 `.gitignore`로 ignore되어 commit엔 안 들어가지만 디렉터리에 남음. 대응: 같은 ID로 다음 라운드에 `/validate-plan` 재호출 시 자동 suffix 부여 (silent overwrite 안 됨)되거나, 직접 수동 정리. **수동 정리 시 먼저 목록 확인 후 삭제** (다른 workitem-id 파일 실수 삭제 방지):
```bash
ls docs/40-validation/plan-reviews/<workitem-id>.*.md   # 1) 삭제 대상 확인
rm docs/40-validation/plan-reviews/<workitem-id>.*.md   # 2) 확인 후 삭제
```

### 6-7. `/repair-plan`이 `/validate-plan` 리뷰 파일을 못 봄 (cross-worktree 시나리오)
원인: `/validate-plan`을 *다른 worktree* 또는 *다른 checkout*에서 호출 → 리뷰 파일이 그 worktree의 `docs/40-validation/plan-reviews/`에 만들어짐. 원본 checkout/worktree의 `/repair-plan`은 *자기 plan-reviews/* 만 본다 (둘은 별 디렉터리). 대응:
- **권장**: validate-plan과 repair-plan을 *같은 checkout/worktree*에서 실행. 다른 세션·다른 LLM이라도 *같은 디렉터리*면 정상 작동.
- **불가피한 cross-worktree 사용 시**: validate-plan이 생성한 `<id>.<tag>.md` 파일을 원본 checkout의 `docs/40-validation/plan-reviews/`로 *수동 복사* 후 repair-plan 호출. 예시 (다른 worktree에서 원본으로 복사):
  ```bash
  cp /path/to/other-worktree/docs/40-validation/plan-reviews/M1.codex.md \
     /path/to/origin-checkout/docs/40-validation/plan-reviews/
  ```

---

## 7. 마무리

- 본 가이드의 모든 phase 통과 + acceptance checklist ✅ = 개선 완료.
- ADR-038이 영구 정책 SSOT.
- 사용자 피드백은 IMPROVEMENT_GUIDE.md 또는 다음 stabilize 라운드 instruction improvement 후보로 회수.
- 미래 확장 (현재 비목표): `## 4-1` 책임 시점 변경 / LSP-MCP 보조 / P2 deferred 이주 등은 evidence가 누적된 후 ADR-038 amend로 검토.
