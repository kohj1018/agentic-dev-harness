# 프로젝트 지침

## 목적
- 이 저장소는 여러 AI coding agent (Claude Code, OpenAI Codex 등)에서 동일하게 동작하는 문서 중심 개발 보일러플레이트다.
- 새 프로젝트를 시작할 때 이 구조를 복제해 빠르게 적용할 수 있어야 한다.
- 중요한 단계마다 해당 계층의 문서를 먼저 갱신한 뒤 다음 단계로 진행한다.

## 핵심 행동 규율
- ✅ 상위 문서 없이 하위 문서를 먼저 만들지 않는다.
- 🚫 `.env`, `secrets/` 같은 민감 파일은 건드리지 않는다.
- ✅ 작업 범위와 비범위를 명확히 적고, 범위 밖 변경은 하지 않는다.
- ✅ 흩어진 임시 메모보다 정해진 위치의 문서를 갱신한다.
- ⚠️ 사실, 가정, 열린 질문을 구분해서 적는다. 검증 가능한 표현을 우선한다.
- ✅ 커밋은 작고 논리적인 단위로 나눈다. 커밋 전에 관련 workitem 문서와 구현 범위가 일치하는지 확인한다.

## 단순성·YAGNI (구현 시 항상 적용)
- 요구한 범위만 구현한다. 추측성 추상화·미래 대비 코드·계획에 없는 헬퍼는 만들지 않는다.
- 동일 패턴이 3회 이상 반복될 때까지는 추출하지 않는다. 비슷한 코드 3줄이 premature abstraction보다 낫다.
- 시스템 경계(외부 입력, 외부 API)에서만 입력 검증·에러 핸들링을 둔다. 내부 호출에는 두지 않는다.
- WHY가 비자명할 때만 주석을 단다(숨은 제약, 미묘한 invariant, 특정 버그 우회). WHAT 주석은 좋은 식별자 이름으로 대체한다.
- backwards-compat shim, feature flag, 사용 안 되는 변수의 `_` rename 같은 호환 hack을 만들지 않는다. 정말 안 쓰면 삭제한다.
- 변경한 모든 줄은 task의 AC 또는 명시 요청으로 거꾸로 추적 가능해야 한다.
  인접 코드 개선·무관 포맷팅·기존 스타일 무시·pre-existing dead code 삭제는 금지 (ADR-006#amend-1).

정책 근거: [ADR-006-simplicity-and-architecture.md](docs/90-decisions/boilerplate/ADR-006-simplicity-and-architecture.md).

## Claude Code plan 모드
Claude Code의 빌트인 plan 모드(Shift+Tab)는 사용자 자율 도구다. 본 보일러플레이트의 lifecycle은 plan 모드를 의무화하지 않으며 산출물 경로(`plansDirectory`)도 강제하지 않는다. Codex 사용자도 동등한 흐름을 갖는다 (ADR-010, ADR-024).

## 기본 자동화 직접 지원 범위
보일러플레이트의 기본 자동화·문서 템플릿이 직접 다루는 스택은 web frontend / API server / CLI / monorepo / Supabase 통합 5종이다. 그 외(mobile / ML / embedded / game / desktop)는 fork 사용자 override 경로 제공 (ADR-031).

## TDD 기본 (구현 시 디폴트)
구현은 Red → Green → Refactor 3 phase 사이클을 디폴트로 따른다. opt-out은 task 문서의 `## 6-2. TDD opt-out`에 사유와 follow-up이 모두 있을 때만. 정책 근거: [ADR-009-tdd-default.md](docs/90-decisions/boilerplate/ADR-009-tdd-default.md).

## 깊은 운영 원칙은 다음 문서를 따른다
- [문서 계층과 산출물 인벤토리](docs/00-meta/STRUCTURE.md)
- [시각 디자인](docs/20-system/DESIGN.md) (UI 프로젝트 한정)
- [인터페이스 결정 책임 분배](docs/90-decisions/boilerplate/ADR-027-interface-decision-allocation.md) (DESIGN.md UI + ARCH 7-1~7-4 cross-surface enforcement, ADR-027#amend-1)
- [워크플로우 + 문서 상태 전이](docs/00-meta/WORKFLOW.md)
- [에이전트 실행 전략 + 위임 트리거](docs/00-meta/DELEGATION_STRATEGY.md)
- [Guardrail 운영 원칙](docs/00-meta/GUARDRAILS_STRATEGY.md)
- [Optional MCP Connectors 기록·사용 강제](docs/90-decisions/boilerplate/ADR-048-mcp-usage-enforcement.md)
- [새 프로젝트 시작 체크리스트](docs/00-meta/PROJECT_START_CHECKLIST.md)
- [Code-as-Agent-Harness 패러다임 + Harness Mutation Contract](docs/90-decisions/boilerplate/ADR-047-code-as-agent-harness.md)
- [ADR 인덱스](docs/90-decisions/README.md)

## Discovery → Charter SSOT 정책
**DISCOVERY=SSOT, Charter=snapshot** — DISCOVERY.md 갱신 시 Charter는 자동 sync 안 됨. `/bootstrap-project`로 갱신 제안을 받은 뒤 `--apply`로 적용하거나 직접 편집. (ADR-035)

## 출력 스타일 (signal-first)
대화·반환 출력은 signal-first: 결론/판정 → 핵심 변경 → 리스크 → 다음 액션. 긴 reasoning·로그·중복 echo는 report/문서에 두고 대화엔 요지만 남긴다. 문서 본문(charter/ADR/AC 등)·코드·경고는 압축하지 않는다 (ADR-046).

## AGENTS.md 길이 정책
본 문서는 **100줄 hard cap**(soft cap 80줄)을 적용한다. 새 정책은 ADR로 박고, 본 문서에는 한 줄 + 링크만 둔다 (ADR-011).
