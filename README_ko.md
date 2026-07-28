<!-- 구조 변경 시 README.md와 README_ko.md를 동시에 갱신한다. drift를 막기 위해 두 README 본문은 짧게 유지하고 깊은 정의는 docs/ 링크로 둔다. -->
# agentic-dev-harness

**Language: [English](README.md) | 한국어**

새 프로젝트를 시작할 때 문서 구조와 서브에이전트 워크플로우를 한 번에 세팅하는 document-first agentic 개발 harness다. Claude Code와 Codex CLI 둘 다 1급 진입점으로 지원한다.

> **한 줄 요약**: 이 저장소를 fork → 필요하면 `/discover-product`로 사용자 데이터 기반 발굴 → `/bootstrap-project` 실행 → charter·architecture를 한 번에 생성, 이후 `/plan-milestone`이 milestone/feature를 생성한다. 메인 세션은 오케스트레이션, 실작업은 서브에이전트가 수행한다.

## 이런 경우에 적합하다

- 새 프로젝트를 자주 시작하는 개인 개발자
- 문서 구조와 작업 분해를 표준화하고 싶은 팀
- 메인 세션이 모든 컨텍스트를 떠안지 않고, 서브에이전트 위임 방식으로 운영하고 싶은 사용자

## 전체 흐름

```
/discover-product (선택)
  └─ (선택) /validate-discovery (별 세션) → /repair-discovery (원본 세션)
  → /bootstrap-project → /bootstrap-stack → /stack-guard
  → /bootstrap-design (UI 전용 — evidence-on-demand로 레퍼런스를 DESIGN_RESEARCH.md에 조사 + DESIGN.md 작성 *전* 다중 concept 시안(REFINE/EXPLORE)으로 렌더·axe 수용 게이트를 거쳐 방향 선택 + 최종 검토용 design-preview.html, 승인 후 시안 삭제) [ADR-058]
  → /plan-milestone (+UI: R5 프로토타입 라운드) → /plan-workitem M1 (배치)
       └─ (선택) /validate-plan (별 세션) → /repair-plan (원본 세션)
  → /implement-workitem
  → /validate-workitem → /repair-workitem (Needs Fix일 때) → /finalize-workitem
  → /stabilize-milestone
```

각 단계 상세는 [WORKFLOW.md](docs/00-meta/WORKFLOW.md), 서브에이전트 위임은 [DELEGATION_STRATEGY.md](docs/00-meta/DELEGATION_STRATEGY.md)를 참조한다.
아래 빠른 시작에서 이 명령들을 0~3단계로 따라갈 수 있다.

새 프로젝트는 `/discover-product`로 페르소나·pain·시나리오를 먼저 발굴해 charter의 신뢰도를 높이는 것을 권장한다. 발굴 결과는 `docs/10-charter/DISCOVERY.md`에 저장되고, `/bootstrap-project`가 이를 charter/architecture로 변환한다. 빠른 prototype에서는 `/discover-product`를 건너뛰고 `/bootstrap-project`에 자연어 설명을 바로 줘도 된다.

> **참고**: DISCOVERY.md가 SSOT이고 Charter는 snapshot이다. mid-project에서 DISCOVERY를 갱신한 뒤 Charter를 재동기화하려면 `/bootstrap-project --apply`를 실행한다 ([ADR-035](docs/90-decisions/boilerplate/ADR-035-continuous-discovery.md)).

## 빠른 시작

### 전제 조건

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) 또는 [Codex CLI](https://developers.openai.com/codex)가 설치되어 있어야 한다 — 둘 다 1급 진입점으로 지원한다
- 이 저장소를 GitHub 템플릿으로 새 저장소에 적용하거나, 복제해서 시작한다

### 0단계 (선택): 발굴

페르소나·pain 데이터를 기반으로 charter 신뢰도를 높이려면:

```text
/discover-product [제품 설명]
```

빠른 prototype이라면 이 단계를 건너뛰고 `/bootstrap-project`에 brief를 바로 넘기면 된다.

### 1단계: 프로젝트 초기화

```text
/bootstrap-project [프로젝트 설명 또는 비워두면 DISCOVERY.md 사용]
```

생성 결과: `README.md`, `docs/10-charter/PROJECT_CHARTER.md`, `docs/20-system/ARCHITECTURE_OVERVIEW.md`.

**팁 — brief에 포함하면 좋은 것**: 무엇을 만드는지, 누가 쓰는지, 어떤 문제를 푸는지, 확정된 것과 미정인 것. 자세한 예시는 [PROJECT_START_CHECKLIST.md](docs/00-meta/PROJECT_START_CHECKLIST.md)를 참고한다.

### 2단계: 스택 세팅

`/bootstrap-stack`은 입력 적응형이다. 스택이 정해졌으면 입력을 문서화하고, 미정이면 무입력(또는 모호한 입력)으로 실행해 리서치로 옵션을 조사한 뒤 2~3개 조합을 트레이드오프·추천과 함께 라운드로 제시하고, 선택되면 한 세션에서 산출물까지 작성한다:

```text
/bootstrap-stack [스택/런타임 설명]        # 이미 정함 → 문서화
/bootstrap-stack                          # 미정 → 심층 결정 라운드
/bootstrap-stack --migrate [새 스택]       # 스택 변경 (타깃 미정이면 라운드)
/stack-guard
```

`/bootstrap-stack`은 결정(미정 시 리서치+라운드) 또는 문서화를 수행하고 필요한 자동화 방향을 정리한다. `STACK_SETUP_PLAN.md`를 검토한 뒤 `/stack-guard`를 실행하면 통합 `validate` 진입점과 verify 스크립트가 생성된다. 프론트엔드 스택이 감지되면 `/bootstrap-design`도 함께 실행해 `docs/20-system/DESIGN.md`를 채운다 ([ADR-027](docs/90-decisions/boilerplate/ADR-027-interface-decision-allocation.md)).

### 3단계: 분해 → 구현 → 마감

```text
# 분해 (milestone/feature 생성은 /plan-milestone (M1 포함); feature를 task로 분해 + ## 9. 의존성 순서 선언)
/plan-milestone [milestone 아이디어]
/plan-workitem M1

# (선택) 다른 LLM 교차 리뷰 — ADR-038 참조
#   별 터미널 / 새 Claude 세션 또는 Codex 에서:
/validate-plan [workitem id] [--reviewer-tag <tag>]
#   원본 plan 세션으로 돌아와서:
/repair-plan [workitem id]

# 구현
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

## Codex CLI에서 사용하기 (대체 진입점)

Claude Code 한도에 걸리거나 Codex를 선호할 때:

1. 같은 저장소에서 `codex` 실행 — `AGENTS.md`가 자동 로드된다.
2. 문서와 정책은 동일. 핵심 workflow skill은 Codex wrapper ($-prefixed)로 제공: $implement-workitem, $validate-workitem, $repair-workitem, $finalize-workitem, $plan-milestone, $plan-workitem, $validate-plan, $repair-plan, $bootstrap-project, $bootstrap-stack, $stabilize-milestone, $repair-milestone, $stack-guard, $validate-discovery, $repair-discovery, $validate-milestone. 나머지 skill (discover-product, review-doc, boilerplate-context, bootstrap-design, research-pack)은 자연어로 호출. 자세한 워크플로우는 [WORKFLOW.md](docs/00-meta/WORKFLOW.md) 참조.
3. 자주 쓰는 core workflow skill은 Codex skill로 호출 가능:
   - Inner loop: `$implement-workitem T-001`, `$validate-workitem T-001`, `$repair-workitem T-001`, `$finalize-workitem T-001`
   - Planning / bootstrap / stabilize: `$plan-milestone <milestone 아이디어>`, `$plan-workitem M1`, `$bootstrap-project <brief>`, `$bootstrap-stack <스택>`, `$stack-guard`, `$stabilize-milestone M1`, `$repair-milestone M1`
   - Plan 교차 리뷰 (선택, ADR-038): `$validate-plan M1` (별 Codex 세션) + `$repair-plan M1` (`$plan-workitem`을 돌린 원본 세션)
   - Discovery / stabilize 교차 리뷰 (선택, ADR-044/ADR-054): `$validate-discovery` + `$repair-discovery`, `$validate-milestone M1` (별 Codex 세션) + `$repair-milestone M1` (원본 세션)
4. 나머지 skill(`discover-product`, `review-doc`, `boilerplate-context`, `bootstrap-design`, `research-pack`)은 자연어로 호출: *"Follow `.claude/skills/<name>/SKILL.md`"*

> 참고: `docs/` 하위 문서는 Claude의 `/<skill-name>` 슬래시 표기를 사용한다. Codex에서는 `$<skill-name>`으로 읽는다.

자세한 정책은 [ADR-010](docs/90-decisions/boilerplate/ADR-010-multi-agent-compatibility.md).

## 구조

산출물 전체 인벤토리(위치·생성 주체·라이프사이클)는 [STRUCTURE.md](docs/00-meta/STRUCTURE.md)를 참조한다.

```
.
├── AGENTS.md          # 캐노니컬 진입 지침 (도구 중립)
├── CLAUDE.md          # AGENTS.md를 import (Claude Code 진입점)
├── .claude/           # Claude 서브에이전트, 스킬, 설정
├── .codex/            # Codex CLI 프로젝트 설정 (안전 baseline — 한계는 config.toml 주석 참조)
├── .agents/           # Codex skill wrapper ($-prefixed, .claude/skills 본문을 가리킴)
├── docs/
│   ├── 00-meta/       # 워크플로우, guardrail, 템플릿, 운영 가이드
│   ├── 10-charter/    # 프로젝트 범위, 목표, 문제 정의
│   ├── 20-system/     # 아키텍처 개요, UI 디자인 (UI 프로젝트 한정)
│   ├── 30-workitems/  # milestone, feature, task
│   ├── 40-validation/ # QA 결과, 개선 가이드, reports
│   └── 90-decisions/  # ADR 기록
├── scripts/           # 프로젝트별 자동화 (스택 확정 후 추가)
└── .boilerplate/      # 보일러플레이트 자체 검증·메타 자료. fork 후 read-only. 프로젝트 산출물 아님.
```

## Guardrail 원칙

이 harness는 cross-platform 재사용성을 우선한다 — shared 기본값에 OS/셸/런타임 종속적인 hook를 포함하지 않는다. 자세한 내용은 [GUARDRAILS_STRATEGY.md](docs/00-meta/GUARDRAILS_STRATEGY.md)를 참고한다.

기본 자동화가 직접 다루는 스택은 web frontend / API server / CLI / monorepo / Supabase 통합 / Flutter(Android·iOS) 6종이다. 그 외(iOS Swift / Android Kotlin / RN / ML / embedded / game / desktop)는 project ADR로 supersede하는 경로를 쓴다 — 자세한 내용은 [ADR-031](docs/90-decisions/boilerplate/ADR-031-non-web-out-of-scope.md), [ADR-059](docs/90-decisions/boilerplate/ADR-059-flutter-mobile-profile.md) 참조.

## 처음 시작할 때 먼저 볼 문서

- [PROJECT_START_CHECKLIST.md](docs/00-meta/PROJECT_START_CHECKLIST.md) — 새 프로젝트 시작 체크리스트 (입력 예시 포함)
- [STRUCTURE.md](docs/00-meta/STRUCTURE.md) — 문서 구조, 네이밍 규칙, 산출물 인벤토리
- [WORKFLOW.md](docs/00-meta/WORKFLOW.md) — 단계별 워크플로우

## Contributing

개선 제안이나 버그 제보는 [이슈 템플릿](.github/ISSUE_TEMPLATE)을, 구조 변경은 [PR 템플릿](.github/PULL_REQUEST_TEMPLATE)을 참고한다.

## License

MIT
