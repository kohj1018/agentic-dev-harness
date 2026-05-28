# ADR-038 — Cross-LLM Plan Validation (opt-in peer review + parallel waves)

> scope: boilerplate

## Status
accepted

## 현재 유효 결정
- `/validate-plan`(타 세션·타 LLM 비판 리뷰, 문서 수정 X) + `/repair-plan`(회수·수용·기각 후 문서 수정) opt-in 추가.
- 리뷰 파일은 `docs/40-validation/plan-reviews/<workitem-id>.<reviewer-tag>.md`(ephemeral). 같은 tag 재실행은 #amend-2로 *덮어쓰기 대신 `<tag>-N` 자동 suffix*.
- `/plan-workitem`이 `## 9. 의존성` 위상정렬 wave 그룹을 echo(영속 저장 X). 병렬 implement는 `claude --worktree T-NNN` 권장.
- Plan Quality 차원은 #amend-1로 8→10(ADR-027#amend-1 양립).
- file overlap 점검은 plan-workitem 제외(#d3) — 단 #amend-3로 정정: 명시적 `write_set:` 교집합은 plan-workitem이 결정적 wave 분리, `## 4-1` 기반 free-form overlap은 외부 peer review 책임.

## 배경
- [외부실증] Ning et al. 2026, *Code as Agent Harness* (arXiv:2605.18747v1) §4.1.2 (Diverse Interaction Modes Grounded in Shared Program State) — critique-and-repair, adversarial validation, reasoning debate 패턴을 survey로 정리. 본 ADR의 cross-LLM peer review 패턴이 *survey-level 외부실증* 자격.
- [가설] 다중 모델 *동등 효과*의 정량 측정은 본 ADR 단계에서 미실시 — opt-in 정책 유지의 근거는 *비용/효용 비율을 사용자가 선택*하는 ADR-022 enabling 정합.
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
- **reviewer-tag**: 다중 리뷰어 동시 작성 시 충돌 회피. 미지정 시 `default`. 같은 tag로 재실행 시 덮어쓰기 허용. *(→ #amend-2 로 "기존 파일 보존 + `<tag>-N` 자동 suffix" 로 정정됨)*

### D3. /plan-workitem에 parallel waves 출력 추가
plan-workitem 마지막 출력에 task `## 9. 의존성`을 위상 정렬한 wave 그룹 echo (Kahn's algorithm 등 결정적 알고리즘 — 같은 입력에 같은 wave). **새 영속 저장 자리 신설 X** — derived view라 drift 위험 ([ADR-005](ADR-005-ssot.md) SSOT 정합). **file overlap 점검은 plan-workitem에서 제외** — `## 4-1. 변경 예정 파일/경로`가 implement 시점에 채워진다는 현행 정책(WORKFLOW.md `## 4`(task `## 4-1` 채움 시점 정책) + TASK_TEMPLATE `## 4-1` 주석 SSOT)상 plan 시점 정확도 부족 → 외부 LLM peer review(`/validate-plan`)에 *전적 위임*. 새 dependency 추가 의도(manifest/lock 파일명 *어느 하나라도* 명시 — 예: `package.json` 또는 `pnpm-lock.yaml`)가 보이는 task는 *단독 wave* 라벨로 echo (자동 차단 X / 영속 저장 X).

### D4. agent 분담
- `/validate-plan` → reviewer agent (4번째 review surface "plan" 추가, Plan Quality 10 차원 (ADR-027#amend-1)).
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
- Evidence label: `[가설→실증]` (ADR-022 합성 표기 유지). **외부실증 구성**: (a) Ning et al. 2026, *Code as Agent Harness* (arXiv:2605.18747v1) §4.1.2 — cross-LLM peer review 패턴이 외부 survey-level 실증으로 자격. (b) Claude Code worktree 공식 docs. **가설 구성**: 본 보일러플레이트에서의 *정량적 효과 측정*은 미실시 — [관측됨] 0건. Phase 시뮬레이션 통과 후 [관측됨]으로 승격 예정. Ratchet 약 적용 유지.

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
- 적용 surface(구 "8곳" 목록)는 본 ADR `## Surfaces`로 이전 (fan-out SSOT — ADR-045#d3).

## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT)
- .claude/skills/validate-plan/SKILL.md         — D1 신설
- .claude/skills/repair-plan/SKILL.md            — D1 신설
- .claude/skills/plan-workitem/SKILL.md          — D3 wave echo + cross-review hook + worktree
- .claude/agents/reviewer.md                      — D4 plan surface + Plan Quality 10(#amend-1)
- .agents/skills/validate-plan/                   — D5 Codex wrapper
- .agents/skills/repair-plan/                     — D5 Codex wrapper
- docs/00-meta/STRUCTURE.md                        — 산출물 표(plan review) + Canonical Owner
- docs/00-meta/WORKFLOW.md                         — §3 opt-in sub-loop
- docs/00-meta/DELEGATION_STRATEGY.md              — 위임 트리거 echo
- .gitignore                                       — plan-reviews/*.md + .claude/worktrees/
- README.md / README_ko.md                         — flow 다이어그램

## 후속 작업
- 첫 fork 사용자의 `/validate-plan` 호출 빈도 / finding Adopt vs Reject 비율 / `claude --worktree` 사용 빈도를 stabilize-milestone instruction improvement 후보로 추적 (ADR-022 `[가설→실증]` → `[관측됨]` 승격 트리거).
- evidence가 누적된 뒤 — wave 그룹 file overlap 정밀도 부족이 [관측됨]으로 잡히면 — `## 4-1` plan 시점 채움 / LSP-MCP 보조 같은 부수 정책을 별도 ADR amend로 추가 검토.

<a id="adr-038-amend-1"></a>
## Amendment 1 — Plan Quality 차원 8 → 10 (ADR-027#amend-1 양립)

ADR-027#d18 에 의해 Plan Quality 차원이 8 → 10 으로 확장됨. 추가 2 차원:
- `[Plan-design]` (UI 프로젝트 한정 — DESIGN.md 부재 시 skip)
- `[Plan-arch-iface]` (해당 스택 한정 — ARCH 7-x sub-section 부재 시 skip)

본 Amendment 는 *번호 확장 + 인용 sync* 만 책임. 차원 본문 정의는 ADR-027#amend-1 + reviewer.md `Plan Quality 10 차원` 단락 SSOT.

<a id="adr-038-amend-2"></a>
## Amendment 2 — 리뷰 파일 충돌 정책 정정 (덮어쓰기 → 자동 suffix)

D2 의 "같은 tag 재실행 시 덮어쓰기 허용" 을 **기존 파일 보존 + `<tag>-N` 자동 suffix** 로 정정한다. silent overwrite 로 인한 기존 리뷰 유실을 막기 위함이며, validate-plan SKILL `입력`/`리뷰 파일 작성` 단락의 구현 의도(silent overwrite 방지)와 정합. `/repair-plan` 은 `<workitem-id>.*.md` glob 으로 suffix 파일까지 일괄 회수하므로 회수 흐름은 그대로 작동한다.

## 참고
- ADR-005 (SSOT — `## 9. 의존성` SSOT 정합)
- ADR-007 (책임 경계 — 자동 차단 X)
- ADR-010 (multi-tool 호환 — Codex wrapper)
- ADR-022 (Ratchet — enabling 약 적용)
- ADR-026 (plan-workitem schema — 2-pass 비결정 reconcile)
- ADR-037 (Spec coverage — validate-plan 체크리스트가 흡수)
- Ning et al. 2026, *Code as Agent Harness* (arXiv:2605.18747v1) §4.1.2 — cross-review 패턴 survey-level evidence.

<a id="adr-038-amend-3"></a>
## Amendment 3 — file overlap 정책 정정 (free-form 제외, 명시적 write_set 허용)

D3 의 *"file overlap 점검은 plan-workitem에서 제외 — 외부 LLM peer review에 전적 위임"* 정책은 **TASK_TEMPLATE `## 4-1. 변경 예정 파일/경로`(implement 시점 채움 — plan 시점에는 빈 상태)에 기반한 free-form file overlap** 한정으로 정정한다. **명시적 `write_set:` 구조화 필드**(TASK_TEMPLATE `## 9. 의존성` 안 — ADR-026 schema 확장으로 plan 시점 deterministic input)는 본 면제 범위 밖이며, plan-workitem은 `write_set` 교집합을 *결정적으로 검출해 wave 분리*한다 (ADR-047 D1 inspectability 정합). 본 amend는 *deterministic 부분만 회수* — 자연어 dep / `## 4-1` 기반 추측은 여전히 외부 peer review 책임.
