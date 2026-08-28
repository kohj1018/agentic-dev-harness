# Guardrails Strategy

> 모드: Explanation (guardrail 운영 원칙의 근거)

## 목적
이 보일러플레이트는 cross-platform 재사용성을 우선한다.
따라서 shared 기본값에는 OS, 셸, 런타임에 강하게 의존하는 자동화를 넣지 않는다.

## 기본 원칙
- shared 설정에는 플랫폼 중립적인 항목만 둔다.
- local 자동화는 `.claude/settings.local.json`에서 활성화한다.
- 프로젝트의 스택이 정해진 뒤 그 스택에 맞는 scripts/hooks/CI를 생성한다.
- 문서 구조와 운영 원칙은 shared로 유지한다.
- 환경 종속적인 guardrail은 optional로 둔다.

## shared 기본값에 포함하는 것
- `CLAUDE.md`
- `.claude/agents`
- `.claude/skills`
- `docs/` 문서 구조
- `.claude/settings.json`의 최소 공통 설정
- 민감 파일 접근 제한

<a id="guardrails-default-mode-risk-tier"></a>
## defaultMode 위험 tier (ADR-047 D5 sandboxed execution + permissioned state transition 정합)

본 보일러플레이트는 shared 기본값에 `defaultMode` 를 **박지 않는다** — Claude Code CLI 의 built-in default 를 승계한다 (ADR-047#amend-2). 승계 결과는 실행 방식에 따라 다르다: Pro·Max·Team 플랜의 터미널·VS Code 세션은 `auto`, `claude -p`·Agent SDK·Enterprise 플랜·Console API key·feature-flag 미수신 세션은 `default`(Manual).

| 모드 | 행동 | 위험 tier | 본 보일러 적용 |
|------|------|----------|--------------|
| `default` (=Manual) | 모든 Write/Edit 마다 confirm | 낮음 | `claude -p`·SDK·Enterprise·API key 세션의 승계값 |
| `auto` | 작업 디렉터리 내 read·Write/Edit 는 자동 수락(protected path 제외), 그 밖의 셸·네트워크·MCP 호출은 **분류기(classifier)가 사용자 대신 검토** — 승인 또는 차단, confirm 프롬프트 없음 | **중간** | **터미널 세션의 승계값 (사실상 기본)** |
| `acceptEdits` | Write/Edit + 작업 디렉터리 내 파일시스템 명령 자동 수락 — **Bash** `mkdir`/`touch`/`rm`/`rmdir`/`mv`/`cp`/`sed`, **PowerShell** `Set-Content`/`Add-Content`/`Clear-Content`/`Remove-Item`(+ 공통 별칭); 범위 밖 경로·protected path·그 외 Bash/PowerShell·MCP는 confirm | **중간** | 비대화 실행에서 분류기를 쓰지 않을 때의 명시 선택 |
| `bypassPermissions` | 모든 도구 자동 수락 | 높음 | local-only 권장 (절대 shared X) |
| `plan` | 읽기 전용 | 매우 낮음 | 사용자 명시 선택 |

**비고정(built-in default 승계) 정당화**:
- 본 보일러플레이트의 lifecycle(plan→implement→validate→repair→finalize→stabilize)이 모든 변경을 *후속 validate에서 검증*한다 (deterministic sensor — ADR-047 D1 Executability 정합). 즉 mid-stream confirm을 빼도 끝단 validator가 catch.
- `auto` 에서도 **작업 디렉터리 내 Write/Edit 는 분류기를 거치지 않고 자동 수락**되므로 builder 의 RGR 사이클은 그대로 성립한다. 셸·MCP 호출은 confirm 대신 분류기 검토를 받아 *비대화 sub-agent 도 멈추지 않는다* — sub-agent 의 모든 행동은 부모 세션과 같은 규칙으로 검토되고, sub-agent frontmatter 의 `permissionMode` 는 무시된다.
- 도구 기본값을 따라가면 CLI 업데이트에 맞춰 모드 정책이 자동 갱신된다 (모델·추론 강도 비고정과 같은 형태 — ADR-004#amend-2).

**잔여 위험**:
- builder 가 *task 범위 밖* Write/Edit 를 자동 수락 — validator 의 diff trace audit(ADR-006#amend-1)으로 후행 catch. 삭제·파괴 명령은 `auto` 에서 분류기 검토를 받지만(critical path 삭제는 어떤 모드에서도 자동 수락 X) 검토를 통과한 삭제는 실행되므로, *비가역 파괴* 위험이 0 이 되는 것은 아니다.
- 민감 파일 접근은 `permissions.deny`(현재 `.env`/`secrets/**` 등)가 **모든 모드에서** 차단한다(불변). 단 *프로젝트 외부 경로* 작업은 별도 sandbox 책임.
- **비대화 실행 경로 주의**: `claude -p`·Agent SDK 는 승계값이 `default`(Manual)이라 첫 Edit 에서 응답 없는 confirm 으로 멈춘다. dogfood·bench 러너(ADR-017)처럼 비대화로 lifecycle 을 돌릴 때는 `--permission-mode auto`(또는 `acceptEdits`)를 명시한다 — 플래그가 설정 파일보다 우선한다.
- `auto` 진입 시 *임의 코드 실행을 허용하는 광범위 allow 룰*(`Bash(*)`·`PowerShell(*)`·`Bash(python*)` 류 인터프리터 wildcard·패키지 매니저 run·`Agent`·`Monitor`)은 자동 드롭되고 모드를 벗어나면 복원된다. shared `.claude/settings.json` 에는 allow 룰이 없어 무영향이지만, local 파일에 박은 사람은 그 룰이 `auto` 에서 무효임을 인지해야 한다.

**모드를 강제해야 하면**: 개인은 `.claude/settings.local.json`, 팀 차원 강제는 *프로젝트 자체 정책 ADR-100+* 으로 박는다. `bypassPermissions` 는 *로컬 only* — shared 로 절대 박지 않는다. 참고로 `.claude/settings.json`·`settings.local.json` 에 `"auto"` 를 적는 것은 **무효**다(공식문서 명시 — auto 는 built-in default 로만 온다).

**참고**: Claude Code 공식 [문서](https://code.claude.com/docs) 의 permission modes 절 + ADR-047 D5 (sandboxed execution + permissioned state transition — 본 단락이 D5 적용 surface, 논문 §3.4.3 인용 SSOT는 ADR-047 D5 본문).

## shared 기본값에 포함하지 않는 것
- PowerShell 전용 hook
- Bash 전용 hook
- Python 런타임 전제를 가진 검증 스크립트
- Node.js 전제를 가진 검증 스크립트
- 특정 프레임워크 lint/test/build hook

## local 자동화 권장 원칙
- 개인 환경에서만 필요한 hook는 `.claude/settings.local.json`에 둔다.
- 실험적인 자동화도 local에 둔다.
- 팀 전체에 강제할 검증은 스택이 확정된 뒤 repo 차원에서 추가한다.
- `.claude/settings.local.json`은 Git에 커밋하지 않는다(`.gitignore` 처리).
- Windows에서만 PowerShell hook, macOS/Linux에서만 bash hook처럼 OS별 분기가 필요한 경우에도 local에 둔다.
- 민감 환경변수는 `.env` 파일을 사용하고 `.gitignore`에 추가한다.
- 형식은 [Claude Code 공식 문서](https://code.claude.com/docs)의 settings 섹션을 참고한다.

## stack-specific 생성 시점
다음이 정해진 후 생성한다.
- 운영체제 전제
- 셸 전제
- 런타임 전제
- 언어/프레임워크
- package manager
- 테스트 도구
- lint/typecheck 도구

<a id="guardrails-stack-guard-scope"></a>
## /stack-guard 1단계 산출물 범위
스택이 확정된 후 사용자가 `/stack-guard`를 발화하면 다음을 생성한다.

**1단계 산출물 (자동 생성)**:
- 통합 진입점 — 이름은 `validate`로 고정 (`pnpm validate` / `npm run validate` / `make validate` / `task validate` 중 스택에 자연스러운 1종). **단 design gate(`validate:design`)를 쓰는 프로젝트는 그 진입점을 npm 계열로 둔다** — `task`·`make`는 하위 명령의 종료코드를 자기 코드로 대체해 adapter의 차단/실행불가 구분을 없앤다 (ADR-059 D2).
- `scripts/verify.{sh,ps1,mjs,py}` 중 스택에 자연스러운 런타임 1종.
- UI 판정 시에만 JIT canonical asset을 project-native `validate:design` adapter로 물질화하고 fixed conformance를 실행한 뒤 `STACK_SETUP_PLAN.md ## Design Gate Adapter`에 실제 명령·경로·capability version·source digest를 기록한다(ADR-058#amend-2). 비-UI에서는 asset을 읽거나 복사하거나 design toolchain을 설치하지 않는다.
- `.gitattributes` (line ending 통일).
- 생성된 `docs/00-meta/STACK_SETUP_PLAN.md`에 본 파일 하단 *"## PostToolUse hook 매뉴얼 등록 절차"* 섹션을 link하는 1줄 안내 (hook 절차 SSOT는 본 파일).

**1단계 비범위 (사용자 옵션 — shared 자동 등록 X)**:
- PostToolUse hook은 본 1단계에서 **`.claude/settings.json` shared에 자동 박지 않는다** ([ADR-010](../90-decisions/boilerplate/ADR-010-multi-agent-compatibility.md) multi-tool parity 정합 — canonical 검증은 `validate` 스크립트, hook은 Claude-only adapter).
- Anthropic 2026 hooks docs의 `async: true` / `asyncRewake: true` 2 패턴이 *비용 폭증 우려*를 완화한다 (async 백그라운드 실행 + 실패 시만 깨움). `/stack-guard`는 **이 패턴 예시를 *옵션 출력*으로 박는다** (사용자가 채택 시 `.claude/settings.local.json`에 복사). 파일 확장자 필터링은 verify 스크립트 내부 처리 — `if` 필드는 단일 permission rule 제약(`|`/`&&` 미지원)으로 미사용.
- **canonical 검증은 hook 도입 여부와 무관하게 작동** — `/validate-workitem`, `/finalize-workitem`, `/stabilize-milestone` 각각이 동기 `validate` 호출을 가짐 (ADR-007 lifecycle 정합).

<a id="guardrails-verification-lifecycle"></a>
## 검증 장치의 유지 주기 (ADR-063 D5)

| 시점 | 무엇이 도나 | 누가 |
|---|---|---|
| 스택 확정 직후 1회 | `validate` 생성 + probe 실측 검증 | `/stack-guard` |
| 매 task 검증 | `validate` **전체 실행** (코드 상태가 매 phase 변하므로 직전 결과를 재사용하지 않는다) | `/validate-workitem` |
| task 마감 직전 | `validate --changed` 허용 (빠른 회전 — ADR-020) | `/finalize-workitem` |
| 매 마일스톤 | `validate` 전체 + `validate:e2e` + 장치 노후 점검 | `/stabilize-milestone` |
| 다음 마일스톤 시작 | 노후 발견분 회수 → 재실행 권고 | `/plan-milestone` R0 |

장치가 낡았다는 신호는 `P2 [Guard-drift]` 로 `IMPROVEMENT_GUIDE.md` 에 기록되고, 다음 `/plan-milestone` R0 가 회수해 `/stack-guard` 재실행을 안내한다. **아무것도 낡지 않았으면 아무 출력도 없다** — 정상 상태는 보고하지 않는다. 재실행 시 무엇이 갱신되고 무엇이 보존되는지는 `/stack-guard` 의 `## 재실행 계약` 표가 SSOT다.

`validate` 의 **판정력**(probe 로 실측하는 부분)은 `/stack-guard` 재실행 때만 측정된다. 마일스톤 점검은 그 결과를 다시 재지 않고 `STACK_SETUP_PLAN.md` 에 기록된 판정(`probe smoke:`)만 읽는다 — 실측을 마일스톤 점검으로 옮기면 read-only 계약이 깨지고, 기록을 두지 않으면 프로비저닝 단계의 `SKIPPED` 가 아무도 모르게 남는다.

## 새 기계적 검사의 배치 기준 (ADR-063 D6)

새 기계적 검사에 **차단(hard-block)** 등급을 줄 수 있는지 2문항으로 판정한다.

1. 이 검사가 **문법·구조를 이해**하는가, 문자열만 보는가? → 문자열만 보면 **기록 등급 상한**(차단 금지).
2. 막으려는 실패가 **실제로 관측**됐는가(ADR-022)? → 가설뿐이면 **권장 등급**까지만.

둘 다 통과할 때만 차단이 가능하다. 하나라도 걸리면 report-only 로 둔다.

## 권장 예시
- Next.js + pnpm + Playwright 프로젝트
  - `scripts/verify.ps1` 또는 `scripts/verify.mjs`
  - lint / typecheck / test / e2e hook
- Python + pytest + ruff 프로젝트
  - `scripts/verify.py`
  - format / lint / test hook

## 결정 이유
- 템플릿 자체는 어디서든 clone해서 써야 한다.
- 환경이 다른 팀원에게 동일한 hook를 강제하면 실패 확률이 높다.
- 공통 템플릿은 구조와 원칙을 제공하고,
  실제 자동화는 프로젝트 상황에 맞게 생성하는 편이 유지보수에 유리하다.

## PostToolUse hook 매뉴얼 등록 절차
> 본 단락은 STACK_SETUP_PLAN_TEMPLATE.md에서 이관됨. hook 자동 등록 정책의 SSOT는 본 파일.

현재 단계에서는 매뉴얼 등록. 추후 자동화 예정.

1. `.claude/settings.local.json` 생성 또는 수정.

**Unix/macOS 예시:**

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Write|Edit",
      "hooks": [{
        "type": "command",
        "command": "${CLAUDE_PROJECT_DIR}/scripts/verify.sh",
        "args": ["--changed"]
      }]
    }]
  }
}
```

**Windows 예시 (PowerShell 또는 `.cmd` shim 대응):**

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Write|Edit",
      "hooks": [{
        "type": "command",
        "command": "powershell",
        "args": ["-File", "${CLAUDE_PROJECT_DIR}/scripts/verify.ps1", "--changed"]
      }]
    }]
  }
}
```

> **본 hook 패턴의 핵심 3 가지**:
> - `${CLAUDE_PROJECT_DIR}` 절대 경로 — CWD drift 회피 (Anthropic open issue #50960 다중 reproducer 대응).
> - `args` 배열 (exec form) — shell escaping 회피, `.cmd` shim 대응 (Windows 는 `powershell` 또는 `node` 직접 호출).
> - `matcher: "Write|Edit"` — 도구 이름 필터. 파일 확장자 필터는 *verify 스크립트 내부* 에서 처리한다 (예: `verify.sh --changed` 가 `git diff --name-only` 로 변경 파일을 추려 확장자별 분기).
>
> **Schema 주의 — `if` 필드 미사용**: Anthropic [hooks docs](https://code.claude.com/docs/en/hooks) 에 따르면 hook 의 `if` 필드는 *정확히 하나의 permission rule* 만 받으며 `|`/`&&`/list 같은 결합 syntax 를 지원하지 않는다. 따라서 본 예시는 *`if` 없이 matcher 만 사용 + verify 스크립트 내부 확장자 필터링* 패턴으로 박는다. fork 사용자가 *Edit / Write 별로 다른 동작이 필요* 하면 **두 hook handler 로 분리** 한다 (`matcher: "Edit"` 1개 + `matcher: "Write"` 1개 — 각자 자기 `if` 단일 rule).

2. 주의: Write/Edit 를 자동 수락하는 모드(`auto`·`acceptEdits`)에서 PostToolUse hook 은 매 Write/Edit 마다 실행 → 비용 폭증 위험. 로컬에서만 활성화 권장. (본 파일 `## /stack-guard 1단계 산출물 범위` 의 `async`/`asyncRewake` 옵션 패턴으로 비용 폭증 완화 가능 — `asyncRewake` 는 exit code 2 에서 Claude 를 깨운다.)
