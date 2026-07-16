---
name: finalize-workitem
description: Finalize a passed workitem — set status done, stage explicit files, and commit.
argument-hint: "[task identifier(s)] [--apply --rationale \"<why>\"]"
allowed-tools: Read Glob Grep Write Edit Bash(git add *) Bash(git status *) Bash(git diff *) Bash(git commit *) Bash(pnpm validate) Bash(pnpm validate *) Bash(npm run validate) Bash(npm run validate *) Bash(make validate) Bash(make validate *) Bash(task validate) Bash(task validate *)
context: fork
agent: builder
---

이 skill은 검증을 통과한 workitem을 마감한다 — status 갱신 + 명시적 파일 add + 커밋.

입력:
- `$ARGUMENTS`에는 task ID(또는 다중 ID, 예: `T-001 T-002`)가 들어온다.
- 선택 플래그 `--apply` — task 문서 `## 4-1. 변경 예정 파일/경로`와 git 실제 변경이 어긋나도 git 실제 변경을 신뢰하고 진행(아래 5-(4) 차이 처리에서 종료하지 않는다). 단 민감 경로 가드는 그대로 적용된다.
  - **사유 입력 (ADR-007#amend-3)**: `--apply`는 사용자가 **`--rationale "<왜 4-1과 다른지>"`** 를 함께 넘겨야 한다(`$ARGUMENTS` 파싱). finalize는 이 사유를 커밋 body의 `--apply rationale: <...>` 줄에 기록한다. `--apply`인데 `--rationale`이 없으면 **사유를 스스로 만들지 않고** `Needs Rationale`로 종료 + `--rationale` 동봉 재실행 안내(executor가 사유를 발명하면 다시 "자아"가 생긴다).

반드시 먼저 할 일:
1. 관련 task 문서를 읽는다.
2. 통합 검증 명령(`pnpm validate` / `npm run validate` / `make validate` / `task validate`)이 있으면 실행한다.
   - `--changed` 옵션 지원 시 `validate --changed`로 변경 파일만 빠르게 검증 권장 (ADR-020). full validate는 `/stabilize-milestone`에서 실행.
   - 실패 → `Needs Fix`로 종료. 커밋하지 않음. `/repair-workitem <task-id>`를 텍스트로 제안.
   - **통합 명령이 없을 때 (ADR-007#amend-3)**: `docs/00-meta/STACK_SETUP_PLAN.md`가 존재하면(스택 확정) **`Needs Stack Guard`로 종료** + `/stack-guard` 안내. STACK_SETUP_PLAN.md가 없으면(스택 미정) 이 단계 skip.
3. AC 미충족 점검 — 직전 `/validate-workitem`의 report(`docs/40-validation/reports/<task-id>.md`)에서 AC 매핑이 모두 ✅인지 확인한다.
   - report 파일이 없거나 stale(파일 mtime이 task 문서 또는 변경된 구현 파일보다 오래됨)하면 `/validate-workitem <task-id>` 선행을 안내하고 `Needs Validation`으로 종료한다(커밋하지 않음).
   - ❌가 하나라도 있으면 `Needs Fix`로 종료하고 `/repair-workitem <task-id>`를 안내한다.
   - opt-out 사유가 있는 task(task 문서 `## 6-2. TDD opt-out`이 채워진 경우)는 예외 — 출력에 opt-out 사유와 follow-up task ID를 명시한다.

수행:
4. `git status --porcelain` / `git diff --name-only`로 실제 변경 파일을 회수한다.
5. 명시적 파일 add — **`git add -A` / `git add .`는 사용하지 않는다**.
   파일 목록 산출 우선순위:
   - **(0) 자동 포함**: 본 skill이 갱신하는 task 문서 자체는 (안전검사 통과 후 status=done을 쓴 뒤) 항상 add 대상에 포함하고, 아래 (1)·(2) 비교에서는 제외한다.
   - **(1) task 문서의 `## 4-1. 변경 예정 파일/경로`** — 있으면 우선 참조. 본 섹션은 task 문서 자체를 다시 적지 않는다(자동 포함됨).
   - **(2) git 실제 변경 파일** — task 문서를 제외한 나머지.
   - **(3) 제외 규칙** — 다음을 add 대상에서 제외:
     - 민감 경로(`.env*`, `secrets/**`)
     - 빌드 산출물(`node_modules/`, `dist/`, `build/`, `.next/`, `coverage/`)
     - task 범위와 명백히 무관한 파일
   - **(3-lock) lock file 자동 화이트리스트** — TASK_TEMPLATE `## 4-1`에 명시되지 않아도 자동 add 허용 (ADR-007 amend):
     `pnpm-lock.yaml`, `package-lock.json`, `yarn.lock`, `bun.lockb`, `Cargo.lock`, `Gemfile.lock`, `composer.lock`, `go.sum`, `Pipfile.lock`, `poetry.lock`, `uv.lock`
   - **(4) 차이 처리** — 본 skill은 `context: fork` 환경에서 실행되므로 사용자에게 실시간 확인을 받을 수 없다. (1)과 (2)(둘 다 task 문서 제외 기준)가 어긋나면(또는 (1)이 비어 있고 (2)에 add 대상으로 의심되는 파일이 섞여 있으면) **차이를 출력에 명시하고 즉시 종료**한다(`Needs Review` 종료). **단, (3-lock) whitelist에 해당하는 파일은 (1)에 없어도 차이로 보지 않고 자동 add한다.** 사용자가 task 문서의 `## 4-1`을 갱신하거나 `--apply` force 모드로 재실행하도록 안내한다.
   민감 경로가 staged 영역에 들어오면 즉시 종료한다.
6. staging·안전검사(수행 4-5)가 abort 없이 통과한 뒤에만 task 문서의 `## 0. Status`를 `done`으로 갱신한다(커밋 성공 직전 — 검사 중단 시 done을 쓰지 않아 "done인데 미커밋" 방지).
7. 커밋 메시지 초안을 Conventional Commits 스타일로 생성한다(정책: ADR-008).
   - 형식: `<type>(<scope>): <summary>` — `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf` 등.
   - 본문에 변경 요약 한 단락 + task ID 참조.
   - **`--apply` 모드면** body에 사용자가 넘긴 `--rationale` 값을 `--apply rationale: <...>` 한 줄로 포함 (ADR-007#amend-3). `--rationale` 부재 시 `Needs Rationale` 종료(커밋 X).
   - footer에 `Refs: T-NNN (AC-X, AC-Y)` 형식 포함 (ADR-008#amend-2). 누락 시 *footer 추가 권장 텍스트* 출력 — 자동 차단은 하지 않음 (사용자 결정).
8. `git commit -m "..."` 실행.
   - **금지**: `--no-verify`, `--amend`, `git push`.
9. **feature-완료 감지 (ADR-057 결정 5)**: 직전 단계에서 status를 `done`으로 갱신한 각 task(⚠ 0C-6이 status=done을 커밋 안전검사 뒤로 옮겼으므로 옛 "step 4" 번호에 의존하지 말 것)의 `## 7. 관련 문서` Feature 링크로 같은 feature를 참조하는 sibling task 문서를 Glob/Grep 회수한다. 전원 `## 0. Status` 값이 `done`이면(값은 heading *다음 줄*에 있다 — TASK_TEMPLATE 형식, `Status: done` 인라인 표기가 아니다) 마지막 출력에 **Feature-완료 블록**을 추가한다(본 블록은 ADR-046 압축 대상 아님 — 전량 보존):
   - FAC closure 요약: feature `## 7-1` 매핑표의 각 `T-NNN:AC-N`이 `docs/40-validation/reports/<task-id>.md`에서 ✅인지 (report 부재 task는 "확인 불가 — report checkout-local" degrade).
   - 다음 단계 제안(텍스트만): 미-refresh feature 있으면 `/plan-workitem F-next --refresh`, FAC 시나리오 통합 확인 원하면 `/stabilize-milestone M-N --feature F-NNN`, 마일스톤 마지막 feature면 `/stabilize-milestone M-N`.
   - Feature 링크 부재 시 "feature 소속 불명 — task `## 7` 링크 보강 권장" 1줄만.

마지막 출력:
- 커밋 해시
- 커밋 메시지
- 갱신된 task status
- 다음 권장 단계 (다음 task로 진행 또는 마일스톤이면 `/stabilize-milestone`)

가드:
- 작업 트리에 변경이 없으면 "변경 없음" 종료.
- `git add -A` / `git add .` 금지.
- 민감 경로 staged 시 즉시 종료.
- `--amend` 금지(--amend는 직전 커밋 변경 — 작업 단위가 흐려진다).
- `--no-verify` 금지(pre-commit hook은 우회하지 않는다).
- `git push`는 사용자 명시 요청 없이 실행하지 않는다.

다중 ID 처리:
- `$ARGUMENTS`에 여러 task ID가 있으면 모든 ID의 status를 갱신하고 한 커밋에 묶는다.
- 커밋 메시지에 모든 ID를 명시한다.

## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 ADR/architecture 섹션은 task 본문에서 발화 시 인용 — 사전 fork-load 금지.
