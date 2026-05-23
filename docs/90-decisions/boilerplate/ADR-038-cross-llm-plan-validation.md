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
