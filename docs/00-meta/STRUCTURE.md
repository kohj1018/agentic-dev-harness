# 산출물 인벤토리

> 모드: Reference (산출물 인벤토리)

## 목적
이 보일러플레이트가 운영하는 모든 산출물(문서, skill 산출물, agent 산출물 등)의 위치, 생성 주체, 라이프사이클을 단일 표로 관리한다.
새 산출물이 도입되면 이 표에 한 줄을 추가하는 것이 기본 절차다.

## 라이프사이클 정의
- **Living**: 현재 기준으로 계속 갱신한다. 과거 버전은 git 이력으로 확인한다.
- **Reference**: 보조 자료. 갱신 빈도가 낮다.
- **Record**: 기록 보존이 우선. 덮어쓰지 않고 추가 또는 대체한다.
- **ephemeral**: 임시 산출물. 회차마다 덮어쓴다.

## 산출물 표

`presence` 컬럼은 산출물이 *어떤 상태로 존재하는가*를 표시한다.

- **baseline**: 보일러플레이트가 *이미 박아 둔* 파일 (템플릿 / 정책 placeholder 포함).
- **generated**: skill 호출 시 *최초 생성*되는 파일. baseline에는 없음.
- **conditional**: 특정 스택에서만 존재 (예: UI 한정).
- **reserved**: 번호 placeholder. 미생성. fork 사용자가 채우거나 dropped 처리.
- **boilerplate-only**: 보일러플레이트 자체 검증·메타 자료. fork 후 read-only. 프로젝트 산출물 아님.

| 산출물 | 위치 | 생성 주체 | 라이프사이클 | presence |
|--------|------|-----------|--------------|----------|
| project charter | `docs/10-charter/PROJECT_CHARTER.md` | `/bootstrap-project` | Living | baseline |
| discovery | `docs/10-charter/DISCOVERY.md` | `/discover-product` | Living | generated |
| discovery template | `docs/10-charter/_templates/DISCOVERY_TEMPLATE.md` | 수동 (boilerplate 제공) | Reference | baseline |
| research note | `docs/10-charter/insights/<date>-<slug>.md` | `/research-pack` | Record | generated |
| architecture overview | `docs/20-system/ARCHITECTURE_OVERVIEW.md` | `/bootstrap-project`, `/bootstrap-stack` | Living | baseline |
| design (UI only) | `docs/20-system/DESIGN.md` | `/bootstrap-design` (UI 스택 포함 시) | Living | conditional |
| design research note (UI only) | `docs/20-system/DESIGN_RESEARCH.md` | `/bootstrap-design` (R0 레퍼런스 + R2 선택 근거) | Reference | conditional |
| design concept mockups (UI only, 검토용 임시 — 선택·승인 후 삭제) | `docs/20-system/design-concepts/concept-*.html` | `/bootstrap-design` (R2, 선택 후 R6 삭제) | ephemeral | conditional |
| design preview (UI only, 검토용 임시 — 승인 후 삭제) | `docs/20-system/design-preview.html` | `/bootstrap-design` (R6, 검토 후 삭제) | ephemeral | conditional |
| Claude skill 본문 | `.claude/skills/<name>/SKILL.md` (18종 — bootstrap-project/bootstrap-stack/bootstrap-design/discover-product/plan-workitem/validate-plan/repair-plan/implement-workitem/validate-workitem/repair-workitem/finalize-workitem/stabilize-milestone/stack-guard/review-doc/boilerplate-context/research-pack/validate-discovery/repair-discovery) | 수동 (boilerplate 제공) | Reference | baseline |
| Claude sub-agent | `.claude/agents/<name>.md` (7종: architect/builder/validator/planner/reviewer/qa/researcher) | 수동 (boilerplate 제공) | Reference | baseline |
| milestone | `docs/30-workitems/milestones/M*-*.md` | `/bootstrap-project`, `/plan-workitem` | Living | generated |
| feature | `docs/30-workitems/features/F-*-*.md` | `/bootstrap-project`, `/plan-workitem` | Living | generated |
| task | `docs/30-workitems/tasks/T-*-*.md` | `/plan-workitem`, `/implement-workitem` | Living | generated |
| workitem 템플릿 | `docs/30-workitems/_templates/{MILESTONE,FEATURE,TASK}_TEMPLATE.md` | 수동 (boilerplate 제공) | Reference | baseline |
| validation report | `docs/40-validation/reports/<task-id>.md` | `/validate-workitem` | ephemeral | generated |
| plan review | `docs/40-validation/plan-reviews/<workitem-id>.<reviewer-tag>.md` | `/validate-plan` (다른 세션·다른 LLM) | ephemeral | generated |
| discovery review | `docs/40-validation/discovery-reviews/DISCOVERY.<reviewer-tag>.md` | `/validate-discovery` (다른 세션·다른 LLM) | ephemeral | generated |
| qa findings | `docs/40-validation/QA_FINDINGS.md` | `/stabilize-milestone` (mile별 누적) | Record | baseline |
| improvement guide | `docs/40-validation/IMPROVEMENT_GUIDE.md` | `/stabilize-milestone` | Living | baseline |
| ADR (boilerplate) | `docs/90-decisions/boilerplate/ADR-*.md` (인덱스: `docs/90-decisions/boilerplate/README.md`) | 수동 (boilerplate 진화) | Record | baseline |
| ADR (project) | `docs/90-decisions/project/ADR-1NN-*.md` (인덱스: `docs/90-decisions/project/README.md`) | architect, `/bootstrap-project` 등 | Record | generated |
| stack setup plan template | `docs/00-meta/_templates/STACK_SETUP_PLAN_TEMPLATE.md` | 수동 (boilerplate 제공) | Reference | baseline |
| stack setup plan | `docs/00-meta/STACK_SETUP_PLAN.md` | `/bootstrap-stack`, `/stack-guard` | Reference | generated |
| verify scripts | `scripts/verify.{sh,ps1,mjs,py}` | `/stack-guard` | Reference | generated |
| AGENTS.md | `./AGENTS.md` | (수동 또는 ADR-010 fork 시) | Living | baseline |
| Codex 프로젝트 설정 | `.codex/config.toml` | 수동 | Living | baseline |
| Codex skill wrapper | `.agents/skills/<name>/{SKILL.md, agents/openai.yaml}` | 수동 | Reference | baseline |
| .github 템플릿 | `.github/ISSUE_TEMPLATE/*.md`, `.github/PULL_REQUEST_TEMPLATE/*.md` | 수동 (boilerplate 제공) | Reference | baseline |
| scripts 안내 | `scripts/README.md` (스택 확정 전 placeholder) | 수동 (boilerplate 제공) | Reference | baseline |

## 보일러플레이트 메타 산출물

`.boilerplate/` 디렉터리는 보일러플레이트 *자체 검증·메타 자료* 영역이다.
fork 후 read-only로 취급한다 — 프로젝트 산출물이 아니다.

| 산출물 | 위치 | 생성 주체 | 라이프사이클 | presence |
|--------|------|-----------|--------------|----------|
| simulation run | `.boilerplate/validation/SIMULATION_RUN.md` | 수동 (보일러플레이트 진화 라운드별 누적) | Record | boilerplate-only |

## Canonical Owner 매핑 (SSOT 부록)

각 사실은 단 하나의 canonical 문서에 정의되고, 다른 문서는 한 줄 + 링크만 둔다.

| 사실 | Canonical Owner |
|------|-----------------|
| 문서 계층 정의 (`docs/00-meta`, ...) | `docs/00-meta/STRUCTURE.md` (본 문서) + [ADR-001](../90-decisions/boilerplate/ADR-001-doc-hierarchy.md) |
| 네이밍 규칙 (milestone/feature/task/ADR) | `docs/00-meta/STRUCTURE.md` (본 문서) |
| 위임 트리거 + 메인 세션 역할 | `docs/00-meta/DELEGATION_STRATEGY.md` |
| agent 단위 책임 경계 (validator/reviewer/qa) | `docs/00-meta/DELEGATION_STRATEGY.md` (위임 트리거 표) |
| 상태값 + 전이 규칙 (workitem 일반) | `docs/00-meta/WORKFLOW.md`의 "문서 상태 전이" |
| ADR 전용 상태값 (`proposed`/`accepted`/`superseded`/`deprecated`) | `docs/90-decisions/boilerplate/_ADR_GUIDE.md` |
| 워크플로우 단계 흐름 (한 줄 그림) | `docs/00-meta/WORKFLOW.md` |
| Guardrail 원칙 | `docs/00-meta/GUARDRAILS_STRATEGY.md` |
| 도메인 용어 정의 | `docs/00-meta/GLOSSARY.md` |
| 새 프로젝트 시작 절차 (체크리스트) | `docs/00-meta/PROJECT_START_CHECKLIST.md` |
| Bootstrap 입력 예시 | `docs/00-meta/PROJECT_START_CHECKLIST.md` (1단계 예시 흡수) |
| 모델 별칭 정책 | `docs/90-decisions/boilerplate/ADR-004-model-alias-policy.md` |
| 단순성·YAGNI·Clean Code/Architecture 정책 | `docs/90-decisions/boilerplate/ADR-006-simplicity-and-architecture.md` + `AGENTS.md`(요약) |
| TDD 정책 | `docs/90-decisions/boilerplate/ADR-009-tdd-default.md` + `AGENTS.md`(1줄) |
| 워크아이템 라이프사이클 | `docs/90-decisions/boilerplate/ADR-007-workitem-lifecycle.md` |
| Conventional Commits | `docs/90-decisions/boilerplate/ADR-008-commit-convention.md` |
| 산출물 위치 인벤토리 | 본 문서(`docs/00-meta/STRUCTURE.md`) |
| ADR 인덱스 허브 | `docs/90-decisions/README.md` |
| ADR 인덱스 (boilerplate) | `docs/90-decisions/boilerplate/README.md` |
| 도구 어댑터 매핑 (Claude ↔ Codex) | `docs/90-decisions/boilerplate/ADR-010-multi-agent-compatibility.md` |
| AGENTS.md 진입 페이지 정책 (왜 이 파일을 진입점으로 삼는가) | `docs/90-decisions/boilerplate/ADR-010-multi-agent-compatibility.md` |
| 공통 진입 지침 본문 (도구 중립 entry instructions) | `AGENTS.md` |
| 보일러플레이트 직접 지원 스택 범위 | `docs/90-decisions/boilerplate/ADR-031-non-web-out-of-scope.md` |
| UI 시각 디자인 | `docs/20-system/DESIGN.md` (SSOT). 검토용 파생 뷰 `design-preview.html`(R6) 와 방향 선택용 `design-concepts/concept-*.html`(R2) 는 `/bootstrap-design` 이 생성하고 검토·선택 완료 후 삭제 — 직접 편집·영속 금지 (ADR-005). |
| UI 디자인 워크플로우 라운드 구조 (R0~R6 concept-first) + 레퍼런스 노트 | [ADR-049](../90-decisions/boilerplate/ADR-049-concept-mockup-first-design.md) (정책 SSOT — 라운드 구조·시안 시점). → ADR-049 `## Surfaces` 참조. DESIGN.md *내용*·인터페이스 할당은 [ADR-027](../90-decisions/boilerplate/ADR-027-interface-decision-allocation.md). |
| API/CLI 인터페이스 컨벤션 | `docs/20-system/ARCHITECTURE_OVERVIEW.md` `## 7-1`, `## 7-2` |
| 백엔드 핵심 결정 | `docs/20-system/ARCHITECTURE_OVERVIEW.md` `## 7-3` |
| 프론트 핵심 결정 | `docs/20-system/ARCHITECTURE_OVERVIEW.md` `## 7-4` |
| Milestone graduation checklist 5+1 | [ADR-014](../90-decisions/boilerplate/ADR-014-milestone-graduation.md) (정책 SSOT). → ADR-014 `## Surfaces` 참조 (fan-out SSOT). |
| DISCOVERY=SSOT / Charter=snapshot | [ADR-035](../90-decisions/boilerplate/ADR-035-continuous-discovery.md) (정책 SSOT). → ADR-035 `## Surfaces` 참조 (fan-out SSOT). |
| FAC↔AC 매핑표 영속 위치 | [ADR-037](../90-decisions/boilerplate/ADR-037-spec-coverage-audit.md)#amend-1 (정책 SSOT). 영속 위치: 각 feature 문서 `## 7-1` (plan/validate/stabilize cross-round 추적). → ADR-037 `## Surfaces` 참조 (fan-out SSOT). |
| Evidence label (`[관측됨]`/`[외부실증]`/`[가설]` + 합성 표기) | [ADR-022](../90-decisions/boilerplate/ADR-022-ratchet-principle.md) (정책 SSOT). → ADR-022 `## Surfaces` 참조 (fan-out SSOT). |
| Cross-LLM plan validation (opt-in peer review) | [ADR-038](../90-decisions/boilerplate/ADR-038-cross-llm-plan-validation.md) (정책 SSOT). → ADR-038 `## Surfaces` 참조 (fan-out SSOT). |
| Cross-LLM discovery validation (opt-in peer review) | [ADR-044](../90-decisions/boilerplate/ADR-044-cross-llm-discovery-validation.md) (정책 SSOT). → ADR-044 `## Surfaces` 참조 (fan-out SSOT). |
| DESIGN.md + ARCH 7-1~7-4 cross-surface enforcement | [ADR-027](../90-decisions/boilerplate/ADR-027-interface-decision-allocation.md) #amend-1 (정책 SSOT). 적용 파일 전체는 ADR-027 `## Surfaces` 참조 (fan-out SSOT — ADR-045#d3). UI 판정 다중신호 절차 = ADR-027#amend-3 SSOT. |
| Workitem Type 분류 (feature/technical-enabler/bugfix/refactor/migration/research-spike) | [ADR-039](../90-decisions/boilerplate/ADR-039-workitem-type.md) (정책 SSOT). → ADR-039 `## Surfaces` 참조 (fan-out SSOT). |
| 출력 스타일 (signal-first 대화/반환 계약) | [ADR-046](../90-decisions/boilerplate/ADR-046-signal-first-output.md) (정책 SSOT). → ADR-046 `## Surfaces` 참조 (fan-out SSOT). |
| Code-as-Agent-Harness 패러다임 + Harness Mutation Contract | [ADR-047](../90-decisions/boilerplate/ADR-047-code-as-agent-harness.md) (정책 SSOT). → ADR-047 `## Surfaces` 참조 (fan-out SSOT). |

> 압축 규칙 — ADR 본문 자체가 단일 SSOT이고 다른 surface에는 인용만 되는 정책(예: ADR-011 cap / ADR-019 context-pack)은 본 표에 박지 않는다. *cross-surface 적용*(여러 파일이 동일 본문을 함께 반영해야 drift가 안 나는 정책)만 행으로 박는다.

## 네이밍 규칙
- 마일스톤: `M1-xxx.md`, `M2-xxx.md`
- 기능: `F-001-xxx.md`, `F-002-xxx.md`
- 작업: `T-001-xxx.md`, `T-002-xxx.md`
- ADR: `ADR-001-xxx.md` (boilerplate, 001~099 — ADR-002/003은 legacy reserved), `ADR-100-xxx.md` (project, 100+)

<a id="structure-doc-linking"></a>
## 문서 연결 원칙
- 상위 문서는 하위 문서를 링크한다.
- 기능 문서는 관련 마일스톤, 설계 문서, ADR을 링크한다.
- QA 문서는 기능/작업 ID를 기준으로 역참조한다.
- ADR 간 참조·anchor·fan-out(`## Surfaces`) 규약은 [ADR-045](../90-decisions/boilerplate/ADR-045-doc-reference-contract.md) SSOT.
- cross-surface 정책의 적용 파일 목록은 해당 ADR의 `## Surfaces` 블록이 SSOT다. 아래 Canonical Owner 표는 산문으로 재나열하지 않고 그 블록을 가리킨다(ADR-045#d3).

## 절차

### 새 산출물 도입 시
1. 산출물 표에 한 줄 추가(위치, 생성 주체, 라이프사이클).
2. 라이프사이클이 Record/ephemeral이면 `.gitignore` 처리 여부도 함께 판단.

### 새 정책 도입 시
1. ADR을 만든다 — 정책 본문은 ADR이 SSOT.
2. `docs/90-decisions/README.md`(또는 boilerplate/project 인덱스)에 한 줄 추가.
3. 관련 agent/skill 본문에는 정책 설명 대신 ADR 링크 + 자기 영역 행동 규율(self-check 등)만 둔다 + 자신을 고정하는 `ADR-NNN` 역참조(ADR-045#d4).
4. 여러 파일에 동기 반영되는 정책이면 ADR 본문에 `## Surfaces` 블록을 둔다(fan-out SSOT — ADR-045#d3). Canonical Owner 표에는 산문 나열 대신 `→ ADR-NNN ## Surfaces` 포인터만 둔다.
5. canonical owner 매핑이 변하면 본 문서의 Canonical Owner 표 갱신.
