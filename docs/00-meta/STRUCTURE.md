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
| decision register | `docs/10-charter/DECISION_REGISTER.md` | `/discover-product`·`/bootstrap-*`·`/plan-*`·`/repair-plan` (등재) · `/repair-workitem`·`/stabilize-milestone` (봉인 후 append — ADR-060 D11) · `/seal-milestone` (판정) — 정책 ADR-060 | Living | baseline |
| discovery | `docs/10-charter/DISCOVERY.md` | `/discover-product` | Living | generated |
| discovery template | `docs/10-charter/_templates/DISCOVERY_TEMPLATE.md` | 수동 (boilerplate 제공) | Reference | baseline |
| research note | `docs/10-charter/insights/<date>-<slug>.md` | `/research-pack` | Record | generated |
| 도메인 자문 노트 | `docs/10-charter/insights/<date>-<domain>-<slug>.md` (domain: legal/strategy/marketing/data/security) | `/consult-expert` | Record | generated |
| architecture overview | `docs/20-system/ARCHITECTURE_OVERVIEW.md` | `/bootstrap-project`, `/bootstrap-stack` | Living | baseline |
| design (UI only) | `docs/20-system/DESIGN.md` | `/bootstrap-design` (UI 스택 포함 시) | Living | conditional |
| design research note (UI only) | `docs/20-system/DESIGN_RESEARCH.md` | `/bootstrap-design` (R0 레퍼런스 + R2 선택 근거) | Reference | conditional |
| design concept mockups (UI only, 검토용 임시 — 선택·승인 후 삭제) | `docs/20-system/design-concepts/concept-*.html` | `/bootstrap-design` (R2, 선택 후 R6 삭제) | ephemeral | conditional |
| design preview (UI only, 검토용 임시 — 승인 후 삭제) | `docs/20-system/design-preview.html` | `/bootstrap-design` (R6, 검토 후 삭제) | ephemeral | conditional |
| milestone 승인 프로토타입 (UI only — 경험 계약, 화면 단위) | `docs/20-system/prototypes/M<N>/<screen>.html` | `/plan-milestone` R5 (draft M<N> 재실행으로 미완 라운드 재개) | Record | conditional |
| 경험 게이트 스크린샷 갤러리 (UI only, 검토용 임시) | `docs/40-validation/visual/M-N/` | `/stabilize-milestone` §3-V | ephemeral | conditional |
| Claude skill 본문 | `.claude/skills/<name>/SKILL.md` (23종 — bootstrap-project/bootstrap-stack/bootstrap-design/discover-product/plan-milestone/plan-workitem/seal-milestone/validate-plan/repair-plan/implement-workitem/validate-workitem/repair-workitem/finalize-workitem/stabilize-milestone/repair-milestone/validate-milestone/stack-guard/review-doc/boilerplate-context/research-pack/validate-discovery/repair-discovery/consult-expert) | 수동 (boilerplate 제공) | Reference | baseline |
| Claude sub-agent | `.claude/agents/<name>.md` (13종: architect/builder/validator/planner/reviewer/qa/researcher/designer + 도메인 자문 5종 counsel/strategist/marketer/analyst/security — ADR-062) | 수동 (boilerplate 제공) | Reference | baseline |
| milestone roadmap | `docs/30-workitems/ROADMAP.md` | `/plan-milestone` (R3 생성/갱신, R0 재조정 — 단일 작성자) | Living | baseline |
| milestone | `docs/30-workitems/milestones/M*-*.md` | `/plan-milestone` (M1 포함 — ADR-057) | Living | generated |
| feature | `docs/30-workitems/features/F-*-*.md` | `/plan-milestone` (생성), `/plan-workitem`(`## 7-1` AC측·`## 7-2` seam 표 채움) | Living | generated |
| task | `docs/30-workitems/tasks/T-*-*.md` | `/plan-workitem`, `/implement-workitem` | Living | generated |
| workitem 템플릿 | `docs/30-workitems/_templates/{MILESTONE,FEATURE,TASK}_TEMPLATE.md` | 수동 (boilerplate 제공) | Reference | baseline |
| validation report | `docs/40-validation/reports/<task-id>.md` | `/validate-workitem` | ephemeral | generated |
| plan review | `docs/40-validation/plan-reviews/<workitem-id>.<reviewer-tag>.md` | `/validate-plan` (다른 세션·다른 LLM) | ephemeral | generated |
| discovery review | `docs/40-validation/discovery-reviews/DISCOVERY.<reviewer-tag>.md` | `/validate-discovery` (다른 세션·다른 LLM) | ephemeral | generated |
| stabilize review | `docs/40-validation/stabilize-reviews/<M>.<reviewer-tag>.md` | `/validate-milestone` (다른 세션·다른 LLM) | ephemeral | generated |
| qa findings | `docs/40-validation/QA_FINDINGS.md` | `/stabilize-milestone` (mile별 누적) | Record | baseline |
| improvement guide | `docs/40-validation/IMPROVEMENT_GUIDE.md` | `/stabilize-milestone` | Living | baseline |
| ADR (boilerplate) | `docs/90-decisions/boilerplate/ADR-*.md` (인덱스: `docs/90-decisions/boilerplate/README.md`) | 수동 (boilerplate 진화) | Record | baseline |
| ADR (project) | `docs/90-decisions/project/ADR-1NN-*.md` (인덱스: `docs/90-decisions/project/README.md`) | `/bootstrap-project`(ADR-100) · `/bootstrap-stack`(ADR-101·--migrate ADR-1NN) · `/plan-milestone` R0([ADR-candidate] 회수) · architect(초안 sub-call) — 트리거 표: ADR-000#amend-2 | Record | generated |
| stack setup plan template | `docs/00-meta/_templates/STACK_SETUP_PLAN_TEMPLATE.md` | 수동 (boilerplate 제공) | Reference | baseline |
| stack setup plan | `docs/00-meta/STACK_SETUP_PLAN.md` | `/bootstrap-stack`, `/stack-guard` | Reference | generated |
| verify scripts | `scripts/verify.{sh,ps1,mjs,py}` | `/stack-guard` | Reference | generated |
| design gate canonical assets | `.claude/skills/stack-guard/assets/design-gate*.mjs` | 수동 (harness 제공, UI 판정 때만 JIT read/copy/run) | Reference | baseline |
| design gate adapter (UI) | `STACK_SETUP_PLAN.md ## Design Gate Adapter`에 기록된 project-native 경로 | `/stack-guard` (UI 판정 뒤 생성·self-test) | Reference | conditional |
| golden 정답 사진 (모바일 앱, 로컬 전용 — 커밋 X) | 프로젝트의 `test/**/goldens/` (golden key가 *테스트 파일이 있는 디렉터리* 기준 상대경로라 `test/` 하위 어느 깊이든 생긴다) | 개발자가 **머신·체크아웃마다 1회** 생성(`flutter test --update-goldens` — 커밋하지 않으므로 새 머신·새 체크아웃엔 없다. ADR-059 D3) | Reference | conditional |
| E2E smoke registry | `STACK_SETUP_PLAN.md ## E2E Smoke Registry` | `/stack-guard` (ADR-052#amend-1) | Reference | conditional |
| AGENTS.md | `./AGENTS.md` | (수동 또는 ADR-010 fork 시) | Living | baseline |
| Codex 프로젝트 설정 | `.codex/config.toml` | 수동 | Living | baseline |
| Codex skill wrapper | `.agents/skills/<name>/{SKILL.md, agents/openai.yaml}` (자연어 호출 skill 목록 SSOT는 README.md / README_ko.md — ADR-010#amend-3; lifecycle/메인 호출 skill은 wrapper 미보유 가능) | 수동 | Reference | baseline |
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
| 보일러플레이트 직접 지원 스택 범위 | `docs/90-decisions/boilerplate/ADR-031-non-web-out-of-scope.md` + [ADR-059](../90-decisions/boilerplate/ADR-059-flutter-mobile-profile.md)(Flutter는 직접 지원 — ADR-031#amend-1) |
| UI 시각 디자인 | `docs/20-system/DESIGN.md` (SSOT). 검토용 파생 뷰 `design-preview.html`(R6) 와 방향 선택용 `design-concepts/concept-*.html`(R2) 는 `/bootstrap-design` 이 생성하고 검토·선택 완료 후 삭제 — 직접 편집·영속 금지 (ADR-005). |
| UI 디자인 워크플로우 (R0~R6 + evidence-on-demand 리서치 + 수용 게이트 + REFINE/EXPLORE 시안) | [ADR-058](../90-decisions/boilerplate/ADR-058-design-workflow.md) (정책 SSOT — ADR-049 supersede). → ADR-058 `## Surfaces` 참조. DESIGN.md *내용*·인터페이스 할당은 [ADR-027](../90-decisions/boilerplate/ADR-027-interface-decision-allocation.md). |
| API/CLI 인터페이스 컨벤션 | `docs/20-system/ARCHITECTURE_OVERVIEW.md` `## 7-1`, `## 7-2` |
| 백엔드 핵심 결정 | `docs/20-system/ARCHITECTURE_OVERVIEW.md` `## 7-3` |
| 프론트 핵심 결정 | `docs/20-system/ARCHITECTURE_OVERVIEW.md` `## 7-4` |
| Milestone graduation checklist 5+1 | [ADR-014](../90-decisions/boilerplate/ADR-014-milestone-graduation.md) (정책 SSOT). → ADR-014 `## Surfaces` 참조 (fan-out SSOT). |
| DISCOVERY=SSOT / Charter=snapshot | [ADR-035](../90-decisions/boilerplate/ADR-035-continuous-discovery.md) (정책 SSOT). → ADR-035 `## Surfaces` 참조 (fan-out SSOT). |
| FAC↔AC 매핑표 영속 위치 | [ADR-037](../90-decisions/boilerplate/ADR-037-spec-coverage-audit.md)#amend-1 (정책 SSOT). 영속 위치: 각 feature 문서 `## 7-1` (plan/validate/stabilize cross-round 추적). → ADR-037 `## Surfaces` 참조 (fan-out SSOT). |
| Evidence label (`[관측됨]`/`[외부실증]`/`[가설]` + 합성 표기) | [ADR-022](../90-decisions/boilerplate/ADR-022-ratchet-principle.md) (정책 SSOT). → ADR-022 `## Surfaces` 참조 (fan-out SSOT). |
| Cross-LLM plan validation (opt-in peer review) | [ADR-038](../90-decisions/boilerplate/ADR-038-cross-llm-plan-validation.md) (정책 SSOT). → ADR-038 `## Surfaces` 참조 (fan-out SSOT). |
| Cross-LLM discovery validation (opt-in peer review) | [ADR-044](../90-decisions/boilerplate/ADR-044-cross-llm-discovery-validation.md) (정책 SSOT). → ADR-044 `## Surfaces` 참조 (fan-out SSOT). |
| DESIGN.md + ARCH 7-1~7-5 cross-surface enforcement | [ADR-027](../90-decisions/boilerplate/ADR-027-interface-decision-allocation.md) #amend-1 (정책 SSOT). 적용 파일 전체는 ADR-027 `## Surfaces` 참조 (fan-out SSOT — ADR-045#d3). UI 판정 다중신호 절차 = ADR-027#amend-3 SSOT. |
| Workitem Type 분류 (feature/technical-enabler/bugfix/refactor/migration/research-spike) | [ADR-039](../90-decisions/boilerplate/ADR-039-workitem-type.md) (정책 SSOT). → ADR-039 `## Surfaces` 참조 (fan-out SSOT). |
| 출력 스타일 (signal-first 대화/반환 계약) | [ADR-046](../90-decisions/boilerplate/ADR-046-signal-first-output.md) (정책 SSOT). → ADR-046 `## Surfaces` 참조 (fan-out SSOT). |
| Code-as-Agent-Harness 패러다임 + Harness Mutation Contract | [ADR-047](../90-decisions/boilerplate/ADR-047-code-as-agent-harness.md) (정책 SSOT). → ADR-047 `## Surfaces` 참조 (fan-out SSOT). |
| 메인 세션 오케스트레이션(foreman·fan-out)·wave 제거 | [ADR-051](../90-decisions/boilerplate/ADR-051-main-session-orchestration-and-wave-removal.md) (정책 SSOT). → ADR-051 `## Surfaces` 참조 (fan-out SSOT). |
| Stack provisioning(install) + E2E readiness | [ADR-052](../90-decisions/boilerplate/ADR-052-stack-provisioning-and-e2e-readiness.md) (정책 SSOT). → ADR-052 `## Surfaces` 참조 (fan-out SSOT). |
| Stack 결정 taxonomy (T1 기초 / T2 마이그레이션 / T3 라이브러리 추가) + 입력 적응형 bootstrap-stack 흐름 | [ADR-055](../90-decisions/boilerplate/ADR-055-input-adaptive-stack-flow.md) (정책 SSOT). → ADR-055 `## Surfaces` 참조 (fan-out SSOT). |
| 마일스톤 경험 계약 (프로토타입 라운드·입구 계약·스크린샷 게이트·Voice 규칙서) | [ADR-056](../90-decisions/boilerplate/ADR-056-milestone-experience-contract.md) (정책 SSOT). → ADR-056 `## Surfaces` 참조 (fan-out SSOT). |
| 마일스톤 로드맵 SSOT (Done/Now/Next/Later forward 지도) | [ADR-057](../90-decisions/boilerplate/ADR-057-planning-v2-batch-and-seam.md)#amend-1 (정책 SSOT). 파일: `docs/30-workitems/ROADMAP.md` (단일 작성자 = plan-milestone). |
| 기획 결정 마감 + 마일스톤 봉인 (원장·authority·contract-ready·seal) | [ADR-060](../90-decisions/boilerplate/ADR-060-decision-closure-and-milestone-seal.md) (정책 SSOT). → ADR-060 `## Surfaces` 참조 (fan-out SSOT). |
| Arch-iface 위반 등급 분기 (닫힌 사용자 결정·`Don'ts` → P0) + 닫힌 결정 바인딩의 diff-trace 추적 인정 | [ADR-061](../90-decisions/boilerplate/ADR-061-decision-backed-interface-gate.md) (정책 SSOT). → ADR-061 `## Surfaces` 참조 (fan-out SSOT). |
| 전문가 자문 capability (도메인 agent·조회 규율·단일 소유자·문서 경유) | [ADR-062](../90-decisions/boilerplate/ADR-062-domain-advisory-capability.md) (정책 SSOT). → ADR-062 `## Surfaces` 참조. |
| 검증 장치의 실측 검증 + 유지 주기 (probe·harness 경로 배제·재실행 계약·`[Guard-drift]`) | [ADR-063](../90-decisions/boilerplate/ADR-063-verification-harness-integrity.md) (정책 SSOT). → ADR-063 `## Surfaces` 참조. |
| task 층 증거 계약 (외부 경계 실행 증거·검증 판정력·`[미실측]` 외부 사실·receipt) | [ADR-064](../90-decisions/boilerplate/ADR-064-task-layer-evidence-contract.md) (정책 SSOT). → ADR-064 `## Surfaces` 참조. |

> 압축 규칙 — ADR 본문 자체가 단일 SSOT이고 다른 surface에는 인용만 되는 정책(예: ADR-011 cap / ADR-019 JIT 로딩)은 본 표에 박지 않는다. *cross-surface 적용*(여러 파일이 동일 본문을 함께 반영해야 drift가 안 나는 정책)만 행으로 박는다.

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
