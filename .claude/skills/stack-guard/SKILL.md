---
name: stack-guard
description: After /bootstrap-stack, generate verify scripts and a unified `validate` command for the project's stack.
argument-hint: "[stack summary | empty to read existing docs]"
disable-model-invocation: true
allowed-tools: Read Glob Grep Write Edit Bash
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
     - `## Dependency Tools` — **보완만**(ADR-051#amend-4 수행-6-2-0): 표·행이 없으면 관측 신호로 채우고, `/bootstrap-stack`이 기록한 행은 덮어쓰지 않는다(불일치는 출력 보고 + 사용자 결정).
     - PostToolUse hook 자동 등록은 prototyping 후 별도 항목 — 현재 단계에서는 매뉴얼 등록 안내
     - hook 등록 절차는 [GUARDRAILS_STRATEGY.md "## PostToolUse hook 매뉴얼 등록 절차"](../../../docs/00-meta/GUARDRAILS_STRATEGY.md) link만 박는다 (SSOT — 본 skill이 절차 본문 embed 금지).
   - 파일이 아예 없으면(`/bootstrap-stack` 산출물이 빠진 경우) `/stack-guard`가 새로 생성하되, 출력에 "`/bootstrap-stack`이 STACK_SETUP_PLAN.md를 만들지 않았음 — 사후 검토 권장"을 명시.
4. `.gitattributes`가 없으면 생성, 있으면 line ending 규칙 추가.
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

6. **Toolchain 선설치 + E2E readiness** (실행 순서상 step 5 smoke test *앞*에 수행 — `allowed-tools` 의 Bash 활용, 신규 권한 불필요):
   - **6-1. UI 판정** (ADR-027#amend-3 압축 3-case): `docs/20-system/DESIGN.md` 부재 → 비-UI. DESIGN.md 존재 + `## 0. Status` ≠ `draft` → UI 확정. DESIGN.md 존재 + status == `draft` → 추가 신호((a) ARCH `## 7-4. 프론트 결정` 활성, (b) ARCHITECTURE_OVERVIEW 기술 선택이 web frontend 유형) ≥1 → UI 의심(UI 로 취급). 신호 0 → 비-UI. 상세: ADR-027#amend-3.
   - **6-2-0. Dependency Tools 교차 확인 (ADR-051#amend-4)**: `docs/00-meta/STACK_SETUP_PLAN.md` `## Dependency Tools` 표(있으면)와 저장소의 실제 *tool-specific* 신호(`package-lock.json`·`pnpm-lock.yaml`·`yarn.lock`·`bun.lockb`·`poetry.lock`·`uv.lock`·`Cargo.lock`·`go.mod` 등)를 **scope별로 대조**한다. **표·행 부재 → 관측 신호로 보완 기록**(green-field면 이번 6-2 설치로 생성될 도구를 적는다). **표↔저장소 불일치 → 자동 수정하지 않고** 출력에 `Dependency Tool 불일치: <scope> 표=<A> 저장소=<B>`로 보고 + 사용자 결정 요청(아래 "도구 감지 우선 순서" 4와 동일 정책). 아래 6-2 설치는 이 확인을 통과한 scope 도구로 실행한다.
   - **6-2. Toolchain 설치 (전 스택 공통, 기계적 — 기본은 진행)**: 감지된 패키지 매니저로 authored devDeps 를 설치한다 — `pnpm install` / `npm install` / `pip install -e .` (또는 `uv sync`) / `go mod download` / `cargo fetch` 중 스택에 자연스러운 1종. lockfile 존재 시 frozen 설치(`pnpm install --frozen-lockfile` / `npm ci`) 우선. 설치 후 lock 파일 변경은 그대로 둔다(finalize 자동 화이트리스트, ADR-007#amend-1). **주의 — *validate 가 부르는 도구 자체*가 깔리는지 확인**: 패키지 deps 만 받는 명령은 lint/type/test 도구를 빠뜨릴 수 있다(예: `pip install -e .` 는 dev 도구 미설치 → `pip install -e '.[dev]'` 또는 `uv sync --all-extras`; Go `golangci-lint`·Rust `clippy` 는 별도 설치). step 5 smoke 가 command-not-found 면 도구 설치 명령을 보강한다.
   - **6-2-1. 테스트 격리 권장 (ADR-051#amend-1)**: 생성하는 e2e/통합 설정에 *가능한 범위에서* 격리를 권장한다 — playwright `webServer`는 동적 포트, 통합 테스트는 트랜잭션 롤백/임시 스키마/testcontainers. stack-guard가 unit-test 격리를 직접 authoring하긴 어려우므로, 미보장 시 `STACK_SETUP_PLAN.md`에 "테스트 격리 미설정 — 병렬 builder 시 foreman 순차 권장" 1줄 부기(implement partition이 실제 보호).
   - **6-3. Playwright browser 설치 (UI/web 한정)**: 6-1 이 UI 면 `npx playwright install` (CI/Linux 환경이면 `npx playwright install --with-deps` 제안만 부기, 자동 실행 X — OS 패키지 sudo 필요).
   - **6-4. `validate:e2e` scaffold (UI/web 한정, e2e 필요 시)**: `playwright.config.*` 가 *부재* 하면 최소 config(`testDir: 'e2e'`, 단일 chromium project, `webServer` 는 주석 placeholder)를 생성하고, `package.json` 의 `scripts` 에 `validate:e2e` 진입점(예: `playwright test`)을 박는다. *이미 존재* 하면 덮어쓰지 않고 발견 사실만 출력에 기록(도구 감지 우선순위 정합 — 기존 도구 미덮어씀). 비-UI 프로젝트는 6-3·6-4 를 skip 하되 6-2 toolchain 설치는 수행한다. 이 e2e provision/smoke 는 milestone graduation 의 E2E MUST-run hard-block(ADR-014#amend-2 / ADR-052 D3)이 검사할 대상을 선readiness 한다.
   - **6-4-1. Visual-QA smoke scaffold (UI/web 한정, ADR-058)**: e2e scaffold 시 `e2e/visual-qa.spec.*`도 생성 — *렌더된 화면*의 기계적 결함을 잡는다. **scaffold 시점엔 앱이 비어 있을 수 있으므로 대상 landmark 부재 시 graceful skip(vacuous PASS — 0-spec=PASS 정합)**, 실제 UI 생성 후 의미 발동.
     - breakpoint 루프(**320**/375/768/1440): (a) **가로 overflow** — `document.scrollingElement.scrollWidth > clientWidth` false 단언(가로 스크롤 없음). **차단**: 졸업 e2e 실패(진짜 버그, FP 드묾). 320은 375만으로 놓치는 좁은 화면 실패를 잡는다(실측 반례 존재). (b) **요소 겹침** — `getBoundingClientRect()` 교차 점검. **권고만**(sticky header·모달·툴팁 등 정당한 겹침 FP 가능 → 차단 X, P1 기록). (c) **a11y** `@axe-core/playwright` — **실데이터가 채워진 대표 화면(빈 화면 아님)**에서 실행하고, **serious/critical 위반은 차단**(졸업 e2e 실패), moderate/minor는 권고. (빈 화면만 검사해 대비 실패를 놓친 dogfood 문제 해결 — ADR-058 D3.)
     - 이미 `e2e/visual-qa.spec.*` 있으면 덮어쓰지 않는다. **스크린샷 vision 비평은 hot-loop 제외**(토큰 트랩 — 탐색/사람 검토는 stabilize §3-P).
     - 졸업 e2e 게이트는 ADR-052 D3 / ADR-014#amend-2가 SSOT — 본 spec은 그 위에 *가로 overflow 차단*만 추가.
   - **6-5. Graceful fallback (날조·우회 금지)**: 6-2/6-3 의 설치 명령이 sandbox/네트워크/승인 차단으로 *실제 실패* 하면 fabricate 하지 않고 `Needs Install: <명령> — 메인 세션/사용자 실행 필요` 를 출력하고, 가능한 산출(진입점·config·verify 스크립트)은 계속 생성한다. 이후 step 5 smoke 는 해당 항목을 SKIPPED 로 처리한다. (implement-workitem 의 ADR-040#amend-1 `Needs Install` 패턴과 동일.)
   - **설치-소유 경계 주의(SSOT)**: 본 step 이 까는 것은 *toolchain + e2e 의존*(biome/tsc/vitest/@playwright/test + browser)뿐이다. *task 단위 런타임/기능 패키지*(결제 SDK 등)는 plan-workitem 이 authoring → implement-workitem 이 설치한다(ADR-040#amend-1). 경계 결정은 ADR-052(install-ownership 3분할)에 기록 — 본 step 은 toolchain+e2e 소유만 집행한다.

마지막 출력:
- 생성/갱신한 파일 목록
- 운영 환경 가정 (R0 결과)
- 통합 명령 호출 방법 (예: `pnpm validate`; UI/web 이면 `pnpm validate:e2e` 도)
- UI 판정 결과 (UI 확정 / UI 의심 / 비-UI — ADR-027#amend-3 근거 신호)
- Toolchain 설치 결과 (`deps install: DONE (<pkg-manager>)` / `Needs Install: <명령>`); UI/web 이면 browser 설치 결과 (`playwright install: DONE` / `Needs Install: npx playwright install`)
- 매뉴얼 hook 등록 절차 SSOT 위치 ([GUARDRAILS_STRATEGY.md "## PostToolUse hook 매뉴얼 등록 절차"](../../../docs/00-meta/GUARDRAILS_STRATEGY.md)) — 생성된 STACK_SETUP_PLAN.md에는 link만 박힘.
- validate smoke test 결과 (PASS / PASS with warning / FAIL with stderr 요약 / SKIPPED)
- validate:e2e smoke test 결과 (UI/web 한정 — PASS (no specs yet) / PASS / WIRING FAIL / SKIPPED)
- 다음 권장 단계 (`/plan-milestone` — 첫 마일스톤 미생성 시(ADR-057); 이미 분해된 workitem이 있으면 `/plan-workitem`/`/implement-workitem`)
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

생성된 `validate` 명령은 위 표의 **format / lint / typecheck / unit test 4단계**를 *순서대로* 묶고, **e2e는 `validate:e2e` 별도 명령으로 분리**한다 (task 단위 finalize는 e2e 제외, milestone 단위 stabilize만 실행). 4단계 중 어느 하나라도 빠지면 출력에 *"missing: <단계>"* 명시. **UI/web 프로젝트(ADR-027#amend-3 UI 판정)면 stack-guard 가 `validate:e2e` 진입점 + 최소 playwright config 를 scaffold 하고 browser 를 설치한 뒤(`npx playwright install`) `validate:e2e` 까지 smoke 한다**(수행-6 + Step 5). 비-UI 는 e2e scaffold 를 skip 하되 toolchain 설치는 수행한다.

도구 선택은 **첫 fork에서 결정 + ARCHITECTURE_OVERVIEW.md `## 7-X`에 박힌다** — 이후 변경 시 [/bootstrap-stack](../bootstrap-stack/SKILL.md) 재실행 또는 수동 갱신.

**TS-first depth 권고**: TS 스택은 본 보일러플레이트 직접 지원 ratio가 가장 큼 → default를 `Biome (format+lint 통합) + tsc + Vitest + Playwright`로 박는다 (`Biome` 단일 선택으로 paralysis 차단). 사용자가 ESLint+Prettier 분리 선호 시 ARCHITECTURE_OVERVIEW.md에 명시 후 verify 갱신.

**도구 감지 우선 순서** (기존 프로젝트에 fork되는 경우):

1. **감지**: `package.json` 의존성·devDependencies / `.eslintrc*` / `.prettierrc*` / `biome.json` / `vitest.config.*` / `jest.config.*` / `playwright.config.*` 등 *기존 도구 흔적* 먼저 확인.
2. **존재 → 그대로 사용**: 위 도구 중 어느 것이 *이미 박혀 있으면* default로 *덮어쓰지 않는다*. 예: ESLint+Prettier+Jest가 박힌 프로젝트에 Biome+Vitest를 강제 install 금지. 발견 도구를 ARCHITECTURE_OVERVIEW.md `## 7-X`에 기록.
3. **부재 → Biome+tsc+Vitest+Playwright default 박음**: green-field 또는 도구 미정 프로젝트에만 적용.
4. **충돌(Biome ↔ ESLint+Prettier 둘 다 박힘 등)**: 사용자에게 출력으로 보고 + 결정 요청. 자동 선택 X.

**Dependency 설치 정책** (toolchain 선설치 — 기본은 *설치한다*, 차단 시 graceful fallback):

- `/stack-guard` 는 *authored toolchain 을 기본 설치* 한다(수행-6). 산출은 `package.json` 의 `scripts.validate`(+ UI/web 이면 `scripts.validate:e2e`) 진입점 + verify 스크립트 본문 + 실제 설치된 devDeps(예: `biome / typescript / vitest / @playwright/test`) + (UI/web) playwright browser.
- 패키지 매니저 설치는 lockfile 존재 시 frozen(`pnpm install --frozen-lockfile` / `npm ci`) 우선, 부재 시 일반 install. 설치된 devDeps 목록을 출력에 박는다.
- **설치 범위 경계(SSOT)**: stack-guard 가 까는 것은 *toolchain + e2e 의존* 뿐이다. *task 단위 기능 패키지*는 plan-workitem authoring → implement-workitem 설치(ADR-040#amend-1). 경계 결정 기록은 ADR-052(install-ownership 3분할).
- **Graceful fallback (날조·우회 금지)**: 네트워크 / 사용자 승인 / lockfile 충돌 / monorepo workspace 라우팅 / sandbox 정책으로 설치가 *실제 실패* 하면 fabricate 하지 않고 `Needs Install: <명령> — 메인 세션/사용자 실행 필요` 를 출력하고 가능한 산출(진입점·config·verify 스크립트)은 계속 생성한다(implement-workitem ADR-040#amend-1 패턴 동일). 이후 smoke 는 SKIPPED.
- 이미 설치돼 있으면(노드 모듈/lock 정합) 재설치하지 않고 verify 스크립트만 박되, 설치 상태를 `deps already present` 로 출력한다.

## Secret scanner 권장 (전 스택, ADR-021)
- `gitleaks` 또는 `trufflehog`. 둘 중 1종 선택.
- finalize 직전 staged 파일에 secret 패턴 검출 시 보고 → 프로젝트가 `validate`/CI fail 처리 선택.
- *강제 X, 권장만* (ADR-010 multi-tool 호환).

`validate` 명령에 lint 단계로 통합 권장 — CI fail 처리는 프로젝트 결정.

## DESIGN.md lint 권장 (UI + Node 계열 한정, ADR-027#d25)
- **조건**: `docs/20-system/DESIGN.md` 존재(UI 프로젝트) **그리고** 스택이 Node 계열(npx 사용 가능)일 때만.
- **권장 명령** (강제 X, shared 기본값 미등록 — 사용자가 채택 시 `validate` 의 lint 단계 또는 CI에 wiring):
  ```bash
  npx @google/design.md@<x.y.z> lint docs/20-system/DESIGN.md   # version-pin (alpha라 변동 — 실제 버전 고정)
  # 규칙 목록은 문서에 박지 말고 runtime 조회: npx -p @google/design.md@<x.y.z> designmd spec --rules
  # Windows: npx -p @google/design.md@<x.y.z> designmd lint docs/20-system/DESIGN.md
  ```
- 검사 항목은 버전마다 다르므로 `spec --rules`로 조회한다(현재 broken token ref / WCAG contrast / orphaned token / section ordering 등). **format·declared-token 보조일 뿐 browser a11y 게이트가 아니다** — 실화면 접근성은 위 breakpoint 루프 (c)의 populated axe·렌더가 담당. exit 1 on error.

**설치 배선 — `@axe-core/playwright` devDep**: 6-2 toolchain 설치 또는 6-4-1 scaffold 시점에 `@axe-core/playwright`를 **devDep로 설치**한다(감지된 PM으로, 예: `npm i -D @axe-core/playwright`) — 설치하지 않으면 visual-qa.spec·design-gate.mjs가 exit 2(Needs Install)로 죽는다. 설치 실패는 stack-guard 6-5 `Needs Install` fallback(날조 금지). UI 프로젝트는 Playwright(재사용) + `@axe-core/playwright`(신규 devDep) 둘을 갖는다.

> **기존 fork 마이그레이션**: stack-guard는 `이미 e2e/visual-qa.spec.* 있으면 덮어쓰지 않는다`. 그래서 이 변경 *전에* scaffold된 fork는 여전히 advisory axe·375-only다 — 그 fork에서는 `e2e/visual-qa.spec.*`의 axe 단언을 blocking으로, breakpoint에 320을 수동으로 올려야 한다(신규 scaffold만 자동 반영). 신규 프로젝트는 해당 없음.
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
