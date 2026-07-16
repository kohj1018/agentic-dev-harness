# ADR Index (Boilerplate)

> 이 디렉터리의 ADR을 한눈에 본다. ADR scope 정책은 [ADR-000](ADR-000-boilerplate-decision-policy.md) 참조.

## Boilerplate ADR (fork 후 supersede 가능)

| # | 제목 | Status | Amendments | 한 줄 요약 |
|---|------|------|------------|-----------|
| 000 | Boilerplate decision policy | accepted | (+#amend-1: 폴더 분리) | scope 라벨링 + supersede + 번호 정책 |
| 001 | Doc hierarchy | accepted | — | docs/ 디렉터리 6분할 결정 |
| 004 | Model alias policy | accepted | (+#amend-1: agent 이름 역할 중심) | shared 기본값에서 모델 별칭(`sonnet`, `opus`, `haiku`)만 사용 |
| 005 | Single Source of Truth (SSOT) | accepted | — | 같은 사실은 1곳에서 정의, 다른 곳은 한 줄 + 링크. 정책=ADR 패턴. |
| 006 | Simplicity, Clean Code, and Clean Architecture priority | accepted | (+#amend-1: Surgical Changes + ambiguity surfacing, +#amend-2: implement ambiguity 하드스탑) | 단순성 1순위, Clean Code 2순위, Clean Architecture 3순위 (정당화 시) |
| 007 | Workitem lifecycle | accepted | (+#amend-1: lock file whitelist 11종, +#amend-2: agent 단위 판정 경계 SSOT, +#amend-3: validate 게이트 강화 + finalize --apply 사유, +#amend-4: 일부 lifecycle skill 메인 세션 + inner-loop model-invocable, +#amend-5: Needs Experience Contract) | discover→bootstrap→plan→implement→validate→repair→finalize→stabilize 8단계 |
| 008 | Commit convention | accepted | (+#amend-1: monorepo scope, +#amend-2: Refs footer) | Conventional Commits 기본 채택 |
| 009 | TDD default + opt-out | accepted | (+#amend-1: AC ID 컨벤션) | /implement-workitem 디폴트는 Red→Green→Refactor 사이클, opt-out은 사유+follow-up 모두 필요 |
| 010 | Multi-agent compatibility (AGENTS.md as canonical entry) | accepted | (+#amend-1: Phase 2.5 stack-guard wrapper 승격, +#amend-2: bootstrap-design 자연어 호출 명시, +#amend-3: 자연어 Codex skill 목록 SSOT를 README로 단일화, +#amend-4: cross-LLM wrapper 필수 축) | AGENTS.md를 캐노니컬 진입 페이지로, Codex CLI도 동일 워크플로우 동작 |
| 011 | AGENTS.md 100줄 hard cap | accepted | — | AGENTS.md 최대 100줄, 신규 정책은 ADR + 1줄 링크 |
| 012 | docs/00-meta 문서 아키텍처 정리 | accepted | — | 9→6 흡수 + Diátaxis 모드 라벨 추가 |
| 014 | Milestone graduation contract | accepted | (+#amend-1: evaluator-optimizer pattern 명명, +#amend-2: E2E MUST-run hard-block — ADR-052 D3) | graduation checklist 5+1 + 회고 + pre-check + --dry-run |
| 017 | Dogfood 시뮬레이션 의무 + 재실행 트리거 | accepted | (+#amend-1: 위치 경로 .boilerplate/) | todo CLI baseline 시뮬레이션 + 성공 기준 3개 + 재실행 트리거 3종 |
| 019 | JIT 컨텍스트 로딩 정책 | accepted | (+#amend-1: 조건부 re-read — ADR-051 D8) | 본문 JIT 로딩(`## Context 정책`) + 사전 fork-load 금지 — context-pack frontmatter는 no-op으로 제거 |
| 020 | `validate --changed` incremental | accepted | — | finalize는 --changed만, stabilize는 full validate |
| 021 | 정적 분석 권장 + secret scanner | accepted | (+#amend-1: secret scanner) | 스택별 1종 정적 분석 + gitleaks/trufflehog, 강제 X 권장만 |
| 022 | Ratchet Principle | accepted | — | 정책의 제약 강도를 *제약(강)/enabling(약)*으로 차등 적용 |
| 024 | Claude Code plan 모드 lifecycle 비범위 | accepted | — | plan 모드 비의무화, plansDirectory 제거, think-before-edit 규율 확보 |
| 025 | 외부 의존 권장 + CI workflow 권장 | accepted | — | bootstrap-stack 외부 의존 출력 + stack-guard CI 권장, 강제 X |
| 026 | plan-workitem 강화 (TASK_TEMPLATE schema) | accepted | (+#amend-1: planner self-check + architect 호출 신호, +#amend-2: task 단계별 구현 가이드) | AC GWT 형식 + sizing 3한계 + 의존성 섹션 + planner self-check |
| 027 | 인터페이스 결정 책임 분배 | accepted | (+#amend-1: cross-surface enforcement 보강 — plan/validate-plan/stabilize/templates, +#amend-2: 디자인 워크플로우 실효 강화 — 시안/anti-slop/lint/Motion, +#amend-3: UI 판정 절차 단일 SSOT, +#amend-4: bootstrap-design --update, +#amend-5: §10 Voice 확장, +#amend-6: 렌더 증거 주입) | DESIGN.md(UI) + ARCHITECTURE 7-1~7-4(API/CLI/백엔드/프론트) + /bootstrap-design 신설 |
| 031 | Non-web stacks out of direct support scope | accepted | — | 비웹 스택은 기본 자동화 직접 지원 범위 밖, override 경로 제공 |
| 035 | DISCOVERY.md Living Doc + Assumption Tracker | accepted | (+#amend-1: Charter staleness 보고, +#amend-2: Evidence Log + Insight Backlog) | 15섹션 + --update 모드 + DISCOVERY=SSOT/Charter=snapshot |
| 036 | FEATURE_TEMPLATE 12섹션 PRD 강화 | accepted | — | User Story + Feature 시나리오 + FAC + NFR 신설, boundaries 3-tier 라벨 |
| 037 | Spec coverage self-audit | accepted | (+#amend-1: FAC↔AC 매핑표 영속 SSOT 위치 `## 7-1`, +#amend-2: plan 출력 echo 축소 — ADR-046 정합) | FAC→AC 매핑 추적, Spec Gap report, 자동 차단 X |
| 038 | Cross-LLM Plan Validation + Parallel Waves | accepted (#d3·#d6·#amend-3 superseded by 051) | (+#amend-1: Plan Quality 8 → 10 차원 — ADR-027#amend-1 양립, +#amend-2: 리뷰 파일 충돌 정정 — 덮어쓰기→자동 suffix, +#amend-3: file overlap 정책 정정 — 명시적 write_set 결정적 wave 분리 — *ADR-051이 write_set 5필드와 함께 폐지*, +#amend-4: milestone-plan mode — FAC 가짜P0 수정 + milestone 4차원) | opt-in peer review (다른 세션·다른 LLM) — /validate-plan + /repair-plan 신설. ~~wave 그룹 echo + worktree 권장~~(ADR-051 제거) |
| 039 | Workitem Type 분류 | accepted | — | task/feature에 Type 필드(feature/technical-enabler/bugfix/refactor/migration/research-spike) |
| 040 | 외부 리서치 capability | accepted | (+#amend-1: 의존성 설치 authoring/실행, +#amend-2: builder Needs-Research soft 게이트 + 오케스트레이터 자동 위임 + install-ownership 3분할 boundary, +#amend-3: 소스 품질 규율 + Agent-보유 stale note 정정, +#amend-4: researcher 디자인 레퍼런스 모드) | researcher agent + /research-pack skill, report-only 웹 접근 |
| 041 | 스택 추천 + 마이그레이션 contract | accepted (D1 superseded by 055) | — | --migrate(expand-contract contract ADR) 유지 / --recommend(D1)은 ADR-055 입력 적응형 DEEP 흐름으로 흡수 |
| 042 | UX 흐름 품질 (HEART) | accepted | +#amend-1: §8-1 delta 재정의 | FEATURE §8-1 UX 필드 + 지표를 Evidence 루프로 회수 |
| 043 | Optional MCP Connectors | accepted | — | 기본 자동연결 X + STACK_SETUP_PLAN 연결 절차(researcher 기반, 전용 skill 없음) + 보안 가드 |
| 044 | Cross-LLM Discovery Validation | accepted | +#amend-1: Codex 단락 supersede | /validate-discovery + /repair-discovery (기획 층 peer review, ADR-038 패턴 mirror) + reviewer discovery surface |
| 045 | Document reference contract | accepted | — | 참조 ID 규약 + ## Surfaces fan-out SSOT + 현재 유효 결정 + amend/supersede 기준 + checker 건전성 |
| 046 | Signal-first output contract | accepted | — | sub-agent 반환 cap 축소(1~2k→≤600) + signal-first 대화/반환 계약 + auto-clarity 보존 리스트 |
| 047 | Code-as-Agent-Harness paradigm + Mutation Contract | accepted | — | 정체성 + shared substrate 6 layer + harness mutation contract 6 필드 + sandboxed execution / contract formation / deep telemetry / oracle adequacy / workflow topology umbrella SSOT (D1~D9) |
| 048 | Connected-MCP 사용 강제 (record → enforce) | accepted | — | ADR-043 record-only를 enforce로 확장 — connectors 표에 lifecycle usage/agent access 컬럼 + plan→implement→validate(+stabilize 3-P) MCP 사용 line-item 계약 + 보안 가드 유지 |
| 049 | Concept-mockup-first 디자인 흐름 + 레퍼런스 리서치 노트 | accepted | (+#amend-1: R0 필수 + 수렴 + visual-QA scaffold + 클래스 anti-slop, +#amend-2: designer agent + grounding 위계 + divergence) | /bootstrap-design 라운드 재구성 R0~R6(DESIGN.md 작성 전 다중 concept 시안 선택) + DESIGN_RESEARCH.md 노트. ADR-027 라운드 구조 #3/#13/#21/#d22/#d26/#27 supersede(ADR-027은 내용·인터페이스 SSOT 유지) |
| 050 | Main-session, model-invocable lifecycle skills | accepted (부분 superseded by 051) | — | de-fork 7종 메인 세션 실행 + 실행 inner-loop 4종 model-invocable + repair-workitem 판단형/report 삭제 |
| 051 | Main-session orchestration (foreman) + 병렬 fan-out + wave 제거 | accepted | (+#amend-1: 공유 런타임 리소스 partition 가드, +#amend-2: validate orchestration 관측 + fallback 보정) | implement→foreman 병렬/단일 builder 위임(file-disjoint slice 병렬, 작거나 겹치면 단일) + validate/stabilize report-only fan-out + plan de-fork + plan-milestone 신설 + ADR-038 wave(#d3/#d6) 제거 + ADR-047 D9 foreman partition re-anchor + ADR-019 조건부 re-read |
| 052 | Stack provisioning (install) + E2E readiness | accepted | — | stack-guard가 baseline toolchain·e2e 직접 install/provision(실패 시 Needs Install blocker) + 정합 검증 + e2e provision/smoke + E2E MUST-run hard-block(ADR-014#amend-2) + repair-milestone 신설(코드수정 허용·커밋 X) |
| 053 | 고-stakes 설계 패널 (stakes-gated design protocol) | accepted | — | stakes 게이트(S1~S5) + 3단 강도(리서치·다각도·적대) + ARCHITECTURE §7 결정 블록 + stabilize backstop |
| 054 | Cross-LLM Stabilize Review | accepted | +#amend-1: 결정5 supersede | /validate-milestone 신설(read-only peer review) + repair-milestone 종합·dedup·echo-rm + stabilize single-origin + .gitignore |
| 055 | 입력 적응형 bootstrap-stack 흐름 + 스택 결정 taxonomy(T1/T2/T3) | accepted | — | 무입력=DEEP 결정 라운드(--recommend 흡수)/구체·brownfield=문서화 + 한 세션 auto-execute + --migrate 적응형 + T2/T3 임계(ADR-053 S1)·ADR-101 living-snapshot drift |
| 056 | Milestone experience contract | accepted | — | 프로토타입 라운드 + 입구 계약 + 스크린샷 게이트 + Voice 규칙서 |

## Reserved / Parked / Dropped 번호

본 보일러플레이트 진화 과정에서 *번호는 잡혔지만 ADR이 만들어지지 않은* 경우를 추적한다.
fork 사용자는 이 번호들을 *자기 ADR 번호로 재사용하지 않는다* — Project ADR은 ADR-100부터.

| # | Status | 사유 |
|---|------|------|
| ADR-002 | legacy reserved | deprecated placeholder for initial project decisions. **새 project ADR은 ADR-100+에 박음** (ADR-000#amend-1 참조). 본 번호는 재사용 X. |
| ADR-003 | legacy reserved | deprecated placeholder for stack selection. **새 project ADR은 ADR-100+에 박음**. 본 번호는 재사용 X. |
| ADR-013 | dropped | Phase 진화 중 fold됨 (git log: `git log --all --diff-filter=D -- "**/ADR-013*"`로 사유 확인) |
| ADR-015 | dropped | Phase 진화 중 fold됨 |
| ADR-016 | dropped | Phase 진화 중 fold됨 |
| ADR-018 | parked | CODE_LINEAGE.md (Refs footer SSOT). P1 트리거 보류. ADR-008#amend-2가 인용. |
| ADR-023 | dropped | Phase 진화 중 fold됨 |
| ADR-028 | dropped | Phase 진화 중 fold됨 |
| ADR-029 | dropped | Phase 진화 중 fold됨 |
| ADR-030 | dropped | Phase 진화 중 fold됨 |
| ADR-032 | dropped | Phase 진화 중 fold됨 |
| ADR-033 | dropped | Phase 진화 중 fold됨 |
| ADR-034 | dropped | Phase 진화 중 fold됨 |

## 신규 ADR 추가 절차
1. `_ADR_GUIDE.md`의 "권장 섹션"을 따라 ADR 본문 작성.
2. 위 "Boilerplate ADR" 표에 한 줄 추가.
3. 관련 agent/skill 본문에 ADR 링크를 박는다.
4. scope 정책은 ADR-000 참조.
