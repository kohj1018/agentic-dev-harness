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

`.claude/settings.json` 의 `defaultMode` 는 *agent의 edit/write 기본 수락 모드*를 결정한다. 본 보일러플레이트는 shared 기본값으로 `"acceptEdits"` 를 박고 있다 — 다음 정당화·위험 tier·대체 경로를 명시한다.

| 모드 | 행동 | 위험 tier | 본 보일러 적용 |
|------|------|----------|--------------|
| `default` | 모든 Write/Edit 마다 confirm | 낮음 | — |
| `acceptEdits` | Write/Edit 자동 수락, Bash·MCP는 confirm | **중간** | **shared 기본값** |
| `bypassPermissions` | 모든 도구 자동 수락 | 높음 | local-only 권장 (절대 shared X) |
| `plan` | 읽기 전용 | 매우 낮음 | 사용자 명시 선택 |

**`acceptEdits` shared 정당화**:
- 본 보일러플레이트의 lifecycle(plan→implement→validate→repair→finalize→stabilize)이 모든 변경을 *후속 validate에서 검증*한다 (deterministic sensor — ADR-047 D1 Executability 정합). 즉 mid-stream confirm을 빼도 끝단 validator가 catch.
- 비-acceptEdits 모드에서는 builder가 매 Edit마다 confirm으로 중단 — RGR 사이클이 사실상 불가능해 보일러 디폴트와 충돌.

**`acceptEdits`의 잔여 위험**:
- builder가 *task 범위 밖* Write/Edit를 자동 수락 — validator의 diff trace audit(ADR-006#amend-1)으로 후행 catch. 하지만 *비가역 파괴*는 후행 catch가 무의미.
- 민감 파일 접근은 `permissions.deny`(현재 `.env`/`secrets/**`)에 박혀 있어 차단되지만, *프로젝트 외부 경로* 작업은 별도 sandbox 책임.

**fork 사용자 대체 경로** (옵션 B):
- shared `defaultMode` 제거 + `.claude/settings.local.json` 에 개발자 본인의 모드 설정. 팀 차원의 강제는 *프로젝트 자체 정책 ADR-100+* 으로 박을 것.
- bypassPermissions 사용은 *로컬 only*. shared로 절대 박지 않는다.

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
- 통합 진입점 — 이름은 `validate`로 고정 (`pnpm validate` / `npm run validate` / `make validate` / `task validate` 중 스택에 자연스러운 1종).
- `scripts/verify.{sh,ps1,mjs,py}` 중 스택에 자연스러운 런타임 1종.
- `.gitattributes` (line ending 통일).
- 생성된 `docs/00-meta/STACK_SETUP_PLAN.md`에 본 파일 하단 *"## PostToolUse hook 매뉴얼 등록 절차"* 섹션을 link하는 1줄 안내 (hook 절차 SSOT는 본 파일).

**1단계 비범위 (사용자 옵션 — shared 자동 등록 X)**:
- PostToolUse hook은 본 1단계에서 **`.claude/settings.json` shared에 자동 박지 않는다** ([ADR-010](../90-decisions/boilerplate/ADR-010-multi-agent-compatibility.md) multi-tool parity 정합 — canonical 검증은 `validate` 스크립트, hook은 Claude-only adapter).
- Anthropic 2026 hooks docs의 `async: true` / `asyncRewake: true` 2 패턴이 *비용 폭증 우려*를 완화한다 (async 백그라운드 실행 + 실패 시만 깨움). `/stack-guard`는 **이 패턴 예시를 *옵션 출력*으로 박는다** (사용자가 채택 시 `.claude/settings.local.json`에 복사). 파일 확장자 필터링은 verify 스크립트 내부 처리 — `if` 필드는 단일 permission rule 제약(`|`/`&&` 미지원)으로 미사용.
- **canonical 검증은 hook 도입 여부와 무관하게 작동** — `/validate-workitem`, `/finalize-workitem`, `/stabilize-milestone` 각각이 동기 `validate` 호출을 가짐 (ADR-007 lifecycle 정합).

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

2. 주의: `defaultMode: "acceptEdits"` 환경에서 PostToolUse hook 은 매 Write/Edit 마다 실행 → 비용 폭증 위험. 로컬에서만 활성화 권장. (본 파일 `## /stack-guard 1단계 산출물 범위` 의 `async`/`asyncRewake` 옵션 패턴으로 비용 폭증 완화 가능 — `asyncRewake` 는 exit code 2 에서 Claude 를 깨운다.)
