---
name: stack-guard
description: After /bootstrap-stack, generate verify scripts and a unified `validate` command for the project's stack.
argument-hint: "[stack summary | empty to read existing docs]"
disable-model-invocation: true
allowed-tools: Read Glob Grep Write Edit Bash
context-pack: minimal
---

너의 역할은 스택이 확정된 직후 통합 검증 명령(`validate`)과 검증 스크립트를 생성하는 것이다.

이 skill의 1단계 범위:
- 통합 진입점 — 이름은 **`validate`로 고정** (`pnpm validate` / `npm run validate` / `make validate` / `task validate` 중 스택에 자연스러운 단일 명령).
- `scripts/verify.{sh,ps1,mjs,py}` 중 스택에 가장 자연스러운 런타임 1종.
- cross-platform 차이가 큰 팀이면 `.claude/settings.local.json` 예시 동봉 권장.
- 생성된 `docs/00-meta/STACK_SETUP_PLAN.md`에 hook 절차 SSOT([GUARDRAILS_STRATEGY.md "## PostToolUse hook 매뉴얼 등록 절차"](../../../docs/00-meta/GUARDRAILS_STRATEGY.md))를 link하는 1줄 안내. 절차 본문은 embed 금지 (SSOT 정합).

**1단계 비범위**: PostToolUse hook 자동 등록은 본 skill에서 수행하지 않는다(prototyping 미완료 — 자세한 이유는 [GUARDRAILS_STRATEGY.md의 "/stack-guard 1단계 산출물 범위" 섹션](../../../docs/00-meta/GUARDRAILS_STRATEGY.md#guardrails-stack-guard-scope) 참조). 사용자가 GUARDRAILS_STRATEGY.md 절차에 따라 매뉴얼 등록.

입력:
- `$ARGUMENTS`가 있으면 스택 요약을 받아 사용한다.
- 비어 있으면 `docs/20-system/ARCHITECTURE_OVERVIEW.md`의 "기술 선택" 섹션을 읽어 스택을 추정한다.

반드시 먼저 읽을 파일:
- `docs/00-meta/GUARDRAILS_STRATEGY.md`
- `docs/00-meta/STACK_SETUP_PLAN.md` (있으면)
- `docs/20-system/ARCHITECTURE_OVERVIEW.md`

R0 — 운영 환경 가정 확인:
- 단일 OS/셸인가, mixed env인가?
- 단일 OS/셸이면 단일 verify 스크립트로 충분.
- mixed env면 cross-platform 친화적 런타임(예: Node.js, Python) 우선, 또는 `scripts/verify.sh` + `scripts/verify.ps1` 모두 생성.
- `.gitattributes`로 line ending 통일은 항상 1단계 산출물에 포함한다(예: `* text=auto eol=lf`).
- 단일 OS/셸이 Windows로 판정되면 `scripts/verify.ps1` 우선 + 매뉴얼 hook 예시는 PowerShell exec form ([GUARDRAILS_STRATEGY.md Windows 예시](../../../docs/00-meta/GUARDRAILS_STRATEGY.md)).
- macOS/Linux 판정 또는 mixed env면 `scripts/verify.sh` 우선 + exec form 그대로 (Unix/macOS 예시).
- mixed env면 *두 verify 스크립트 모두 생성* (`.sh` + `.ps1`) + 두 hook 예시 모두 출력.
- 두 OS 모두 매뉴얼 hook 예시 본문은 `${CLAUDE_PROJECT_DIR}` + `args` 배열로 박는다 (Anthropic open issue #50960 다중 reproducer 대응).

수행:
1. `package.json`/`pyproject.toml`/`Makefile`/`Taskfile.yaml` 중 스택에 자연스러운 곳에 `validate` 진입점을 만든다.
2. `scripts/verify.{sh,ps1,mjs,py}` 중 자연스러운 런타임 1종을 생성. 내용은 스택의 `lint + typecheck + test` 통합.
3. `docs/00-meta/STACK_SETUP_PLAN.md`을 다음 규칙으로 처리한다:
   - **소유 책임 분리**: STACK_SETUP_PLAN.md는 `/bootstrap-stack`이 *최초 골격*(스택 선택 사실 + 추후 추가 필요한 자동화 목록)을 만들고, 본 `/stack-guard`는 거기에 *통합 명령 사용법 + hook 등록 안내 섹션*을 **append/갱신**한다. `/bootstrap-stack`이 만든 기존 섹션을 통째로 덮어쓰지 않는다.
   - 본 skill이 채울 섹션:
     - 통합 명령 사용법
     - PostToolUse hook 자동 등록은 prototyping 후 별도 항목 — 현재 단계에서는 매뉴얼 등록 안내
     - hook 등록 절차는 [GUARDRAILS_STRATEGY.md "## PostToolUse hook 매뉴얼 등록 절차"](../../../docs/00-meta/GUARDRAILS_STRATEGY.md) link만 박는다 (SSOT — 본 skill이 절차 본문 embed 금지).
   - 파일이 아예 없으면(`/bootstrap-stack` 산출물이 빠진 경우) `/stack-guard`가 새로 생성하되, 출력에 "`/bootstrap-stack`이 STACK_SETUP_PLAN.md를 만들지 않았음 — 사후 검토 권장"을 명시.
4. `.gitattributes`가 없으면 생성, 있으면 line ending 규칙 추가.
5. **Smoke test (필수)**: 생성된 `validate` 명령을 1회 실행한다 (`allowed-tools` 의 Bash 권한 활용 — 신규 권한 추가 불필요).
   본 smoke test 는 *wiring 검증* 이 목적 (명령이 올바르게 연결됐는지) — *프로젝트 자체의 lint/test 통과 여부* 와 분리해 보고한다.

   판정 표:
   - **wiring 성공 + 프로젝트 PASS** → `validate smoke test: PASS (wiring OK, project clean)`.
   - **wiring 성공 + 프로젝트 빈 케이스** (비어있는 lint 룰 / 테스트 0건) → `validate smoke test: PASS (wiring OK, empty rules/tests warning)`.
   - **wiring 성공 + 프로젝트 lint/test 실 위반** → `validate smoke test: WIRING OK, PROJECT FAIL` + stderr 요약. stack-guard 자체는 성공이라 종료 X, 사용자에게 *프로젝트 수정* 안내.
   - **wiring 실패** (명령 없음 / 패키지 매니저 비호환 / 스크립트 자체 오류) → `validate smoke test: WIRING FAIL` + 생성된 명령 + 실패 stderr + 제안 대체 (예: pnpm 비호환 → `npm run validate`). **stack-guard 산출물 수정 필요** — 종료.

   > 핵심 구분: stack-guard 의 책무는 *wiring* 까지. 프로젝트 실 위반은 *프로젝트 책무* 라 smoke test 가 잡되 stack-guard 가 차단하지 않는다.

마지막 출력:
- 생성/갱신한 파일 목록
- 운영 환경 가정 (R0 결과)
- 통합 명령 호출 방법 (예: `pnpm validate`)
- 매뉴얼 hook 등록 절차 SSOT 위치 ([GUARDRAILS_STRATEGY.md "## PostToolUse hook 매뉴얼 등록 절차"](../../../docs/00-meta/GUARDRAILS_STRATEGY.md)) — 생성된 STACK_SETUP_PLAN.md에는 link만 박힘.
- validate smoke test 결과 (PASS / PASS with warning / FAIL with stderr 요약)
- 다음 권장 단계 (`/plan-workitem` 또는 `/implement-workitem`)
- 스택별 default verify template은 본 skill의 "스택별 verify 풀세트" 표 기준. 도구 변경 시 ARCHITECTURE_OVERVIEW.md ## 7-X 갱신.
- **옵션: Claude PostToolUse async adapter 예시** (사용자가 채택 시 `.claude/settings.local.json` 에 복사). GUARDRAILS_STRATEGY.md 의 PostToolUse 동기 hook 예시와 동일하게 *Unix / Windows 2 OS 예시* 모두 제공 — 동일 schema 에 `async: true` + `asyncRewake: true` 만 추가:

**Unix/macOS 예시:**

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Write|Edit",
      "hooks": [{
        "type": "command",
        "command": "${CLAUDE_PROJECT_DIR}/scripts/verify.sh",
        "args": ["--changed"],
        "async": true,
        "asyncRewake": true
      }]
    }]
  }
}
```

**Windows 예시 (PowerShell 또는 `verify.mjs` 대응):**

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Write|Edit",
      "hooks": [{
        "type": "command",
        "command": "powershell",
        "args": ["-File", "${CLAUDE_PROJECT_DIR}/scripts/verify.ps1", "--changed"],
        "async": true,
        "asyncRewake": true
      }]
    }]
  }
}
```

**Schema 주의**: 위 GUARDRAILS_STRATEGY.md PostToolUse 동기 hook 예시와 동일 패턴 — `matcher` 만 사용 (도구 이름 필터). 파일 확장자 필터는 *verify 스크립트 내부* 에서 처리 — Anthropic [hooks docs](https://code.claude.com/docs/en/hooks) 의 `if` 필드 단일-rule 제약 (`|`/`&&` 미지원) 회피. `asyncRewake: true` 는 verify 가 **exit code 2** 로 종료 시 Claude 를 깨워 stderr 를 system reminder 로 주입. Windows `command`/`args` 조합은 fork 적용 시 docs 직접 확인 — **본 예시는 1 차 해석이며 schema variant 가 발견되면 SSOT 가 아님**.

도입은 사용자 결정. 본 hook은 *조기 피드백 adapter* — 실패 시 Claude를 깨워 stderr를 system reminder로 주입. **차단형 게이트 아님** (완료 판정은 동기 `validate-workitem` / `finalize-workitem` / `stabilize-milestone`이 책임).

## 정적 분석 도구 권장 (스택별 1종, ADR-021)

| 스택 | 도구 | 비고 |
|------|------|------|
| TypeScript / JS | `dependency-cruiser` | layer 위반 룰을 ARCHITECTURE_OVERVIEW `## 3-1` 채움 시 함께 권장. |
| Python | `import-linter` | 동일 layer 룰 패턴 |
| Go | `go vet` (built-in) | 후속 보강 가능 |
| Rust | `cargo deny` + `cargo udeps` | unused deps + license/advisory 동시 점검 |

## 스택별 verify 풀세트 (default template)

본 표는 *runtime / 언어* 축으로 verify 도구 default 를 박는다. [ADR-031](../../../docs/90-decisions/boilerplate/ADR-031-non-web-out-of-scope.md) 의 *프로젝트 유형 축* (web frontend / API server / CLI / monorepo / Supabase) 과는 *직교 차원* — 한 프로젝트는 *유형 1 + runtime 1* 의 조합으로 자기 verify 명령을 박는다 (예: *TS web frontend* = 유형 "web frontend" × runtime "TS" → TS web 행 적용). 본 표 자체는 ADR-031 의 직접 지원 5 유형을 *축소하거나 대체하지 않는다*.

| runtime / 언어 (예시 프로젝트 유형) | format | lint | typecheck | unit test | e2e test |
|------|--------|------|-----------|-----------|----------|
| TS web (Next/Vite — 유형: web frontend) | Biome (또는 Prettier) | Biome (또는 ESLint) | `tsc --noEmit` | Vitest | Playwright |
| TS API (Express/Fastify/Hono — 유형: API server) | Biome (또는 Prettier) | Biome (또는 ESLint) | `tsc --noEmit` | Vitest | supertest 또는 동등 |
| TS CLI (유형: CLI) | Biome (또는 Prettier) | Biome (또는 ESLint) | `tsc --noEmit` | Vitest | (선택, snapshot) |
| TS monorepo (유형: monorepo — Nx/Turbo) | Biome (또는 Prettier) | Biome (또는 ESLint) | `tsc --noEmit` (workspace 별) | Vitest | 패키지별 적용 |
| TS + Supabase (유형: Supabase 통합) | Biome (또는 Prettier) | Biome (또는 ESLint) | `tsc --noEmit` | Vitest | Supabase test runner |
| Python | `ruff format` | `ruff` | `mypy --strict` (또는 pyright) | pytest | (선택, 스택별) |
| Go | `gofmt -l` | `golangci-lint` | `go vet` (built-in) | `go test` | (선택) |
| Rust | `cargo fmt --check` | `clippy` | `cargo check` | `cargo test` | (선택) |

생성된 `validate` 명령은 위 표의 **format / lint / typecheck / unit test 4단계**를 *순서대로* 묶고, **e2e는 `validate:e2e` 별도 명령으로 분리**한다 (task 단위 finalize는 e2e 제외, milestone 단위 stabilize만 실행). 4단계 중 어느 하나라도 빠지면 출력에 *"missing: <단계>"* 명시.

도구 선택은 **첫 fork에서 결정 + ARCHITECTURE_OVERVIEW.md `## 7-X`에 박힌다** — 이후 변경 시 [/bootstrap-stack](../bootstrap-stack/SKILL.md) 재실행 또는 수동 갱신.

**TS-first depth 권고**: TS 스택은 본 보일러플레이트 직접 지원 ratio가 가장 큼 → default를 `Biome (format+lint 통합) + tsc + Vitest + Playwright`로 박는다 (`Biome` 단일 선택으로 paralysis 차단). 사용자가 ESLint+Prettier 분리 선호 시 ARCHITECTURE_OVERVIEW.md에 명시 후 verify 갱신.

**도구 감지 우선 순서** (기존 프로젝트에 fork되는 경우):

1. **감지**: `package.json` 의존성·devDependencies / `.eslintrc*` / `.prettierrc*` / `biome.json` / `vitest.config.*` / `jest.config.*` / `playwright.config.*` 등 *기존 도구 흔적* 먼저 확인.
2. **존재 → 그대로 사용**: 위 도구 중 어느 것이 *이미 박혀 있으면* default로 *덮어쓰지 않는다*. 예: ESLint+Prettier+Jest가 박힌 프로젝트에 Biome+Vitest를 강제 install 금지. 발견 도구를 ARCHITECTURE_OVERVIEW.md `## 7-X`에 기록.
3. **부재 → Biome+tsc+Vitest+Playwright default 박음**: green-field 또는 도구 미정 프로젝트에만 적용.
4. **충돌(Biome ↔ ESLint+Prettier 둘 다 박힘 등)**: 사용자에게 출력으로 보고 + 결정 요청. 자동 선택 X.

**Dependency 설치 정책** (네트워크 / 환경 의존도 큼 — 기본은 *설치하지 않음*):

- `/stack-guard` 는 *직접 패키지를 install 하지 않는다*. 산출은 `package.json` 의 `scripts.validate` 진입점 + verify 스크립트 본문 + *권장 devDeps 목록* (예: `biome / typescript / vitest / @playwright/test`).
- 출력에 `필요한 devDependencies (사용자가 npm install / pnpm add -D 로 직접 설치)` 섹션을 박는다 — 설치 명령 텍스트는 권장이지 자동 실행 X.
- 이유: 네트워크 환경 / 사용자 승인 / 기존 lockfile 충돌 / monorepo 의 workspace 라우팅 등 도구가 자동 판단하기 어려운 변수 존재. 자동 설치는 sandbox 정책 위반 위험도.
- 이미 설치돼 있으면 별도 출력 없이 verify 스크립트만 박는다.

## Secret scanner 권장 (전 스택, ADR-021)
- `gitleaks` 또는 `trufflehog`. 둘 중 1종 선택.
- finalize 직전 staged 파일에 secret 패턴 검출 시 보고 → 프로젝트가 `validate`/CI fail 처리 선택.
- *강제 X, 권장만* (ADR-010 multi-tool 호환).

`validate` 명령에 lint 단계로 통합 권장 — CI fail 처리는 프로젝트 결정.

## DESIGN.md lint 권장 (UI + Node 계열 한정, ADR-027#d25)
- **조건**: `docs/20-system/DESIGN.md` 존재(UI 프로젝트) **그리고** 스택이 Node 계열(npx 사용 가능)일 때만.
- **권장 명령** (강제 X, shared 기본값 미등록 — 사용자가 채택 시 `validate` 의 lint 단계 또는 CI에 wiring):
  ```bash
  npx @google/design.md lint docs/20-system/DESIGN.md
  ```
- 검사 항목: broken token reference / missing primary color / WCAG contrast / orphaned token / **section ordering** 등. exit 1 on error.
- **Motion 확장 주의**: 본 보일러플레이트는 Motion 을 canonical 8섹션 외 확장으로 둔다(ADR-027#d24). lint 의 section-ordering 은 canonical 8섹션 상대 순서만 보므로 통과하지만, 만약 특정 버전이 비-canonical 섹션을 경고하면 그 경고는 *무시 가능*(의도된 확장).
- 비-Node 스택·비-UI 프로젝트는 본 항목 skip. *GUARDRAILS_STRATEGY "OS·런타임 종속 자동화 강제 X" 정합 — npm 의존이라 shared 기본값에는 넣지 않는다.*

## CI 권장 출력 (ADR-025)
`.github/workflows/validate.yml` 형식 권장 텍스트를 출력한다. **스택 확정 후엔 출력에 그치지 말고 opt-in 파일 생성을 제안**한다 — 사용자가 명시 승인할 때만 `.github/workflows/validate.yml`을 생성(미승인 시 텍스트만; GUARDRAILS "강제 X" 정신). 로컬 PostToolUse hook 1-명령 설정 안내([GUARDRAILS_STRATEGY.md "## PostToolUse hook 매뉴얼 등록 절차"](../../../docs/00-meta/GUARDRAILS_STRATEGY.md))도 함께 출력:
```yaml
name: validate
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: <stack의 validate 명령>
```
GUARDRAILS_STRATEGY *"OS/셸 종속 hook 강제 X"* 정신 — 권장만.

## validate --changed (incremental, ADR-020)
- git diff 기반 변경 파일만 lint/typecheck/test.
- Nx affected / Turbo affected 패턴 차용.
- **사용 시점**:
  - `/finalize-workitem` 직전 → `--changed`만 (빠른 회전).
  - `/stabilize-milestone` → full validate (누락 차단).

## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 ADR/architecture 섹션은 task 본문에서 발화 시 인용 — 사전 fork-load 금지.
