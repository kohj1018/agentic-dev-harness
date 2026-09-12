# ADR Index (Boilerplate)

> 이 디렉터리의 ADR을 한눈에 본다. ADR scope 정책은 [ADR-000](ADR-000-boilerplate-decision-policy.md) 참조.

## Boilerplate ADR (fork 후 supersede 가능)

| # | 제목 | Status | Amendments | 한 줄 요약 |
|---|------|------|------------|-----------|
| 000 | Boilerplate decision policy | accepted | (+#amend-1: 폴더 분리, +#amend-2: ADR 작성 트리거 표 + [ADR-candidate]) | scope 라벨링 + supersede + 번호 정책 |
| 001 | Doc hierarchy | accepted | — | docs/ 디렉터리 6분할 결정 |
| 004 | Model alias policy | superseded | (+#amend-1: agent 이름 역할 중심, +#amend-2: 도구 무관 비고정 + 추론 강도 포함, +#amend-3: Claude shared 파일에서도 모델 키 제거, +#amend-4: agent frontmatter effort 허용 + builder 실험, +#amend-5: 실측 결과 builder effort 제거·maxTurns 45 유지 + 결정 4 세 번째 갈래, +#amend-6: 에이전트가 자기 maxTurns 를 알고 보고 예산을 잡는다, +#amend-9: 지시를 «산출물 먼저»로 + 산식에 읽기 축(읽기 예산 = max(8, 회수 문서 수)) + reviewer 24 + slice 에 회수 문서 10 기준, #amend-8: 예산 축을 «쓰기 도구 보유»로 정정 + 예산 = 읽기 기본 8 + 산출물당 3(planner·designer·architect 20, architect 신규 부여) + 부분 보고 형식 고정, #amend-7: amend-6 falsifier 발화 — 턴 수 지시를 작업량 지시로 교체 + builder maxTurns 60 + slice 산출물 4개 상한) | shared 도구 설정 파일에 모델·추론 강도 키를 두지 않는다 (별칭은 agent frontmatter에서만) → ADR-074로 통합 재발행 (현재 SSOT: ADR-074) |
| 005 | Single Source of Truth (SSOT) | accepted | (+#amend-1: 원장 5종 배타적 기록 범위 + 비중복 불변식, +#amend-2: 산출물 인벤토리가 보일러플레이트 갱신의 판정 기준 — generated 행 불가침 + 디렉터리 통째 동기화 금지, +#amend-3: 보일러플레이트 갱신 절차) | 같은 사실은 1곳에서 정의, 다른 곳은 한 줄 + 링크. 정책=ADR 패턴. |
| 006 | Simplicity, Clean Code, and Clean Architecture priority | accepted | (+#amend-1: Surgical Changes + ambiguity surfacing, +#amend-2: implement ambiguity 하드스탑) | 단순성 1순위, Clean Code 2순위, Clean Architecture 3순위 (정당화 시) |
| 007 | Workitem lifecycle | accepted | (+#amend-1: lock file whitelist 11종, +#amend-2: agent 단위 판정 경계 SSOT, +#amend-3: validate 게이트 강화 + finalize --apply 사유, +#amend-4: 일부 lifecycle skill 메인 세션 + inner-loop model-invocable, +#amend-5: Needs Experience Contract, +#amend-6: pubspec.lock 추가) | discover→bootstrap→plan→implement→validate→repair→finalize→stabilize 8단계 |
| 008 | Commit convention | accepted | (+#amend-1: monorepo scope, +#amend-2: Refs footer) | Conventional Commits 기본 채택 |
| 009 | TDD default + opt-out | accepted | (+#amend-1: AC ID 컨벤션, +#amend-2: opt-out 범위 명확화(Red-first 면제 ≠ AC 충족 면제)) | /implement-workitem 디폴트는 Red→Green→Refactor 사이클, opt-out은 사유+follow-up 모두 필요 |
| 010 | Multi-agent compatibility (AGENTS.md as canonical entry) | accepted | (+#amend-1: Phase 2.5 stack-guard wrapper 승격, +#amend-2: bootstrap-design 자연어 호출 명시, +#amend-3: 자연어 Codex skill 목록 SSOT를 README로 단일화, +#amend-4: cross-LLM wrapper 필수 축, +#amend-5: 도구별 memory 비캐노니컬, +#amend-6: Codex 모델 ID 추적 폐기(비고정)) | AGENTS.md를 캐노니컬 진입 페이지로, Codex CLI도 동일 워크플로우 동작 |
| 011 | AGENTS.md 100줄 hard cap | accepted | — | AGENTS.md 최대 100줄, 신규 정책은 ADR + 1줄 링크 |
| 012 | docs/00-meta 문서 아키텍처 정리 | accepted | — | 9→6 흡수 + Diátaxis 모드 라벨 추가 |
| 014 | Milestone graduation contract | superseded | (+#amend-1: evaluator-optimizer pattern 명명, +#amend-2: E2E MUST-run hard-block — ADR-052 D3, +#amend-3: 회고 graduation 판정 줄 — 로드맵 파생 입력, +#amend-4: 0-spec 예외 철회 — 실행된 e2e 1개 이상 성공) | graduation checklist 5+1 + 회고 + pre-check + --dry-run → ADR-067 → ADR-068로 통합 재발행 (현재 SSOT: ADR-068) |
| 017 | Dogfood 시뮬레이션 의무 + 재실행 트리거 | accepted | (+#amend-1: 위치 경로 .boilerplate/) | todo CLI baseline 시뮬레이션 + 성공 기준 3개 + 재실행 트리거 3종 |
| 019 | JIT 컨텍스트 로딩 정책 | accepted | (+#amend-1: 조건부 re-read — ADR-051 D8) (현재 SSOT: ADR-075 D8) | 본문 JIT 로딩(`## Context 정책`) + 사전 fork-load 금지 — context-pack frontmatter는 no-op으로 제거 |
| 020 | `validate --changed` incremental | accepted | — | finalize는 --changed만, stabilize는 full validate |
| 021 | 정적 분석 권장 + secret scanner | accepted | (+#amend-1: secret scanner, +#amend-2: Dart/Flutter 도구) | 스택별 1종 정적 분석 + gitleaks/trufflehog, 강제 X 권장만 |
| 022 | Ratchet Principle | accepted | — | 정책의 제약 강도를 *제약(강)/enabling(약)*으로 차등 적용 |
| 024 | Claude Code plan 모드 lifecycle 비범위 | accepted | — | plan 모드 비의무화, plansDirectory 제거, think-before-edit 규율 확보 |
| 025 | 외부 의존 권장 + CI workflow 권장 | accepted | (+#amend-1: CI 기본 생성 — 환경 판정 시) | bootstrap-stack 외부 의존 출력 + stack-guard CI — #amend-1이 «권장만»을 **«GitHub remote + 스택 확정 시 기본 생성»**(`--no-ci` opt-out, 기존 파일 보존)으로 전환. 로컬 hook은 권장만 |
| 026 | plan-workitem 강화 (TASK_TEMPLATE schema) | accepted | (+#amend-1: planner self-check + architect 호출 신호, +#amend-2: task 단계별 구현 가이드, +#amend-3: 배치 draft 예외 + refresh — #amend-4가 supersede, +#amend-4: `## 3` 전체 계획 스냅샷 — draft/refresh 예외 폐기) | AC GWT 형식 + sizing 3한계 + 의존성 섹션 + planner self-check |
| 027 | 인터페이스 결정 책임 분배 | superseded | (+#amend-1: cross-surface enforcement 보강 — plan/validate-plan/stabilize/templates, +#amend-2: 디자인 워크플로우 실효 강화 — 시안/anti-slop/lint/Motion, +#amend-3: UI 판정 절차 단일 SSOT, +#amend-4: bootstrap-design --update, +#amend-5: §10 Voice 확장, +#amend-6: 렌더 증거 주입, +#amend-7: DESIGN 내용 계약 확장(정체성·a11y·semantic motion·category state·responsive·tabular), +#amend-8: ARCH 7-5 모바일 결정 자리 신설 + #amend-3 신호 정정) | DESIGN.md(UI) + ARCHITECTURE 7-1~7-5(API/CLI/백엔드/프론트/모바일) + /bootstrap-design 신설 → ADR-073으로 통합 재발행 (현재 SSOT: ADR-073) |
| 031 | Non-web stacks out of direct support scope | accepted | (+#amend-1: Flutter를 직접 지원 범위로 이관 — ADR-059, --override 미구현 명시) | 비웹 스택은 기본 자동화 직접 지원 범위 밖 — **단 Flutter(Android·iOS)는 #amend-1로 직접 지원 이관**(ADR-059). 남은 범위 밖 스택은 project ADR supersede 경로(`--override` 플래그는 미구현) |
| 035 | DISCOVERY.md Living Doc + Assumption Tracker | accepted | (+#amend-1: Charter staleness 보고, +#amend-2: Evidence Log + Insight Backlog, +#amend-3: 미검증 가정 차단 강도 위험도 4단계, +#amend-4: staleness 시그널 1 hunk 판정) | 14섹션(11 결번) + --update 모드 + DISCOVERY=SSOT/Charter=snapshot |
| 036 | FEATURE_TEMPLATE 12섹션 PRD 강화 | accepted | — | User Story + Feature 시나리오 + FAC + NFR 신설, boundaries 3-tier 라벨 |
| 037 | Spec coverage self-audit | accepted | (+#amend-1: FAC↔AC 매핑표 영속 SSOT 위치 `## 7-1`, +#amend-2: plan 출력 echo 축소 — ADR-046 정합, +#amend-4: 승인 표면이 검증하는 FAC 의 제3 매핑 형식(승인 스냅샷 우변 + 두 조건 + 봉인 재확인), #amend-3: unmapped FAC 계획-시점 차단 + 구현-후 사용자 결정) | plan ready gate(FAC↔AC 100%) + 구현-후 Spec Gap 사용자 결정 라우팅 |
| 038 | Cross-LLM Plan Validation + Parallel Waves | accepted (#d3·#d6·#amend-3 superseded by 051) | (+#amend-1: Plan Quality 8 → 10 차원 — ADR-027#amend-1 양립, +#amend-2: 리뷰 파일 충돌 정정 — 덮어쓰기→자동 suffix, +#amend-3: file overlap 정책 정정 — 명시적 write_set 결정적 wave 분리 — *ADR-051이 write_set 5필드와 함께 폐지*, +#amend-4: milestone-plan mode — FAC 가짜P0 수정 + milestone 4차원) | opt-in peer review (다른 세션·다른 LLM) — /validate-plan + /repair-plan 신설. ~~wave 그룹 echo + worktree 권장~~(ADR-051 제거) |
| 039 | Workitem Type 분류 | accepted | — | task/feature에 Type 필드(feature/technical-enabler/bugfix/refactor/migration/research-spike) |
| 040 | 외부 리서치 capability | accepted | (+#amend-1: 의존성 설치 authoring/실행, +#amend-2: builder Needs-Research soft 게이트 + 오케스트레이터 자동 위임 + install-ownership 3분할 boundary, +#amend-3: 소스 품질 규율 + Agent-보유 stale note 정정, +#amend-4: researcher 디자인 레퍼런스 모드) | researcher agent + /research-pack skill, report-only 웹 접근 |
| 041 | 스택 추천 + 마이그레이션 contract | accepted (D1 superseded by 055) | — | --migrate(expand-contract contract ADR) 유지 / --recommend(D1)은 ADR-055 입력 적응형 DEEP 흐름으로 흡수 |
| 042 | UX 흐름 품질 (HEART) | accepted | (+#amend-1: §8-1 delta 재정의, +#amend-2: 정량 소비자 자리 신설 + 계측 필드) | FEATURE §8-1 UX 필드 + 지표를 Evidence 루프로 회수 + analyst 가 quant 소비 |
| 043 | Optional MCP Connectors | accepted | — | 기본 자동연결 X + STACK_SETUP_PLAN 연결 절차(researcher 기반, 전용 skill 없음) + 보안 가드 |
| 044 | Cross-LLM Discovery Validation | accepted | +#amend-1: Codex 단락 supersede | /validate-discovery + /repair-discovery (기획 층 peer review, ADR-038 패턴 mirror) + reviewer discovery surface |
| 045 | Document reference contract | accepted | +#amend-1: D6 재발행 임계 4→8, +#amend-2: supersede 후 인용 처리(D10) | 참조 ID 규약 + ## Surfaces fan-out SSOT + 현재 유효 결정 + amend/supersede 기준 + checker 건전성 |
| 046 | Signal-first output contract | accepted | +#amend-1: Decision Brief 압축 예외 | sub-agent 반환 cap 축소(1~2k→≤600) + signal-first 대화/반환 계약 + auto-clarity 보존 리스트 |
| 047 | Code-as-Agent-Harness paradigm + Mutation Contract | accepted | (+#amend-1: 변경 검증법(falsifying evaluation 작성법), +#amend-3: Mutation Contract 7번째 필드 «예산 영향»(소급 적용 없음), #amend-2: D5 `defaultMode` 비고정 — CLI built-in default(auto) 승계) | 정체성 + shared substrate 6 layer + harness mutation contract 6 필드 + sandboxed execution / contract formation / deep telemetry / oracle adequacy / workflow topology umbrella SSOT (D1~D9) |
| 048 | Connected-MCP 사용 강제 (record → enforce) | accepted | (+#amend-1: `agent access` 이중 셋업 폐기 — `allowed-tools` 하나로 충분) | ADR-043 record-only를 enforce로 확장 — connectors 표에 lifecycle usage/agent access 컬럼 + plan→implement→validate(+stabilize 3-P) MCP 사용 line-item 계약 + 보안 가드 유지 |
| 049 | Concept-mockup-first 디자인 흐름 + 레퍼런스 리서치 노트 | superseded (by ADR-058) | (+#amend-1: R0 필수 + 수렴 + visual-QA scaffold + 클래스 anti-slop, +#amend-2: designer agent + grounding 위계 + divergence) | /bootstrap-design 라운드 재구성 R0~R6(DESIGN.md 작성 전 다중 concept 시안 선택) + DESIGN_RESEARCH.md 노트. ADR-027 라운드 구조 #3/#13/#21/#d22/#d26/#27 supersede(ADR-027은 내용·인터페이스 SSOT 유지) |
| 050 | Main-session, model-invocable lifecycle skills | accepted (부분 superseded by 075) | +#amend-1: dispatcher 사전판정 금지, +#amend-2: Bash 보유 report-only 프로젝트 쓰기 금지 | de-fork 7종 메인 세션 실행 + 실행 inner-loop 4종 model-invocable + repair-workitem 판단형/report 삭제 |
| 051 | Main-session orchestration (foreman) + 병렬 fan-out + wave 제거 | superseded | (+#amend-1: 공유 런타임 리소스 partition 가드, +#amend-2: validate orchestration 관측 + fallback 보정, +#amend-3: D4 범위 갱신(M1 통일), +#amend-4: fan-out 크기 판정 기계화 + 하청 정지 회수 + PM 고정) | implement→foreman 병렬/단일 builder 위임(file-disjoint slice 병렬, 작거나 겹치면 단일) + validate/stabilize report-only fan-out + plan de-fork + plan-milestone 신설 + ADR-038 wave(#d3/#d6) 제거 + ADR-047 D9 foreman partition re-anchor + ADR-019 조건부 re-read → ADR-075로 통합 재발행 (현재 SSOT: ADR-075) |
| 052 | Stack provisioning (install) + E2E readiness | accepted | (+#amend-1: 0-spec 판정 정합화 — 5상태 분류, 문자열 매칭 폐기) | stack-guard가 baseline toolchain·e2e 직접 install/provision(실패 시 Needs Install blocker) + 정합 검증 + e2e provision/smoke + E2E MUST-run hard-block(ADR-014#amend-2) + repair-milestone 신설(코드수정 허용·커밋 X) → 현재 SSOT: ADR-068 |
| 053 | 고-stakes 설계 패널 (stakes-gated design protocol) | accepted | (+#amend-1: ④ ADR 판정 기준, +#amend-2: 종결자를 사용자 선택으로 이동) | stakes 게이트(S1~S5) + 3단 강도(리서치·다각도·적대) + ARCHITECTURE §7 결정 블록 + stabilize backstop |
| 054 | Cross-LLM Stabilize Review | accepted | +#amend-1: 결정5 supersede | /validate-milestone 신설(read-only peer review) + repair-milestone 종합·dedup·echo-rm + stabilize single-origin + .gitignore |
| 055 | 입력 적응형 bootstrap-stack 흐름 + 스택 결정 taxonomy(T1/T2/T3) | accepted | — | 무입력=DEEP 결정 라운드(--recommend 흡수)/구체·brownfield=문서화 + 한 세션 auto-execute + --migrate 적응형 + T2/T3 임계(ADR-053 S1)·ADR-101 living-snapshot drift |
| 056 | Milestone experience contract | superseded | (+#amend-1: 프로토타입 경험 결정 PX 커버리지, +#amend-2: raw-hex 토큰 정의 예외, +#amend-3: 화면 전환 표 + downstream 소비자) | 프로토타입 라운드 + 입구 계약 + 스크린샷 게이트 + Voice 규칙서 → ADR-072로 supersede (현재 SSOT: ADR-072) |
| 057 | Planning v2 (unification + batch + seam) | accepted | (+#amend-1: 마일스톤 로드맵 SSOT, +#amend-2: cross-feature seam canonical 위치 — 소유 우선, +#amend-3: plan-workitem 전체 계획 스냅샷 — 2-tier/draft/refresh 전면 폐기, +#amend-4: ROADMAP `## Backlog` 구간 + 구간별 writer 규약) | M 단위 전체 계획 스냅샷 + 계획 잠금(draft→ready→in-progress→done) + seam 계약 + 마일스톤 로드맵 |
| 058 | Design Workflow (reference flow + acceptance gate + concept cards) | accepted | +#amend-1: baseline runner 제거 + UI project-native gate 조건부 생성, +#amend-2: JIT canonical asset + fixed conformance + upgrade/recovery, +#amend-3: visual-QA 전제 미충족의 표현 고정(runner-native skip 강제·populated 실패 전환·PENDING 기록), +#amend-4: 레퍼런스 갤러리 + R6 네이티브 쇼케이스 + 게이트 실행물 ADR-072 이관, +#amend-5: visual-qa seed 반영 단언 | /bootstrap-design R0~R6 SSOT(ADR-049 supersede) — evidence-on-demand R0 + R2/R6 수용 게이트(렌더·320·populated axe·repair loop) + REFINE/EXPLORE 시안 카드 |
| 059 | Flutter/모바일 프로파일 (Android·iOS 직접 지원) | accepted | +#amend-1: target별 e2e 진입점·승인 스냅샷·Flutter gate 어댑터, +#amend-2: golden 태그·validate:ci | ADR-031을 Flutter에 한해 해제 — npm broker + 등록 source root format + analyze 심각도 분리 + 로컬 golden + e2e 5상태·suite 경로 판정 + ARCH 7-5 + 시크릿 2단 분류 |
| 060 | 기획 결정 마감 + 마일스톤 봉인 (Decision Closure & Milestone Seal) | accepted | (+#amend-1: 배포 라이선스 필수 등재) | 결정 원장 + authority 축 + Decision Brief + contract-ready + /seal-milestone 봉인. 열린 질문 5섹션 폐지 |
| 061 | 닫힌 사용자 결정 위반의 인터페이스 게이트 (Decision-Backed Interface Gate) | accepted | — | `[Arch-iface-7-N]` 등급 분기 — 원장의 `closed`+`user-*` 결정 위반 또는 7-x `Don'ts` 위반은 P0(Needs Fix), 그 외는 기존 P1. + 닫힌 결정 바인딩을 diff-trace 추적 근거로 인정 |
| 062 | 전문가 자문 capability (Domain Advisory Agents) | accepted | — | `/consult-expert` 1개 skill + 도메인 agent 5종(counsel/strategist/marketer/analyst/security). 지식은 1차 출처 조회, 페르소나는 규율 전용 + agent 간 문서 경유 + 재자문 반환 |
| 063 | 검증 장치의 실측 검증과 유지 주기 (Verification Harness Integrity) | accepted | +#amend-1: Guard-drift copied-from 4방향 판정 | probe 기반 실측 smoke test + harness 경로 배제 + 재실행 계약 + `[Guard-drift]` 노후 감지(침묵 우선) + 기계적 검사 배치 2문항 |
| 064 | task 층 증거 계약 (Task-Layer Evidence Contract) | accepted | — | 외부 경계 실행 증거(implement 정지로 차단, validate는 기록 등급) + Red 관측·VC-N 판정력 + `[미실측]` 외부 사실 해소 + 공통 receipt(`## 8`, writer=implement·repair, validate 이전) |
| 065 | AC verification contract | accepted | — | AC 충족 증명 modality 5종(자동 테스트/산출물 검사/사용자 관측/플랫폼 관측/미관측=미충족) + authority·receipt + 충족률·자동화율 2수치 |
| 066 | Milestone acceptance | accepted | (+#amend-1: 재개방 판별 폐지 — ADR-068 정합, +#amend-2: 재확인 전용 라운드는 카운터 미소모) | /accept-milestone(사람 직접 확인 — 관측 AC 있으면 사실상 필수, 마일스톤 스코프 단독) + /repair-acceptance(3+1 판정 · **#amend-1로 위임·재개방 폐지 — scope와 무관하게 직접 수리**, `out-of-AC`는 계약 부채 등재) + 피드백 3갈래 라우팅 + D6 pattern-scan |
| 067 | Milestone graduation contract v2 | superseded | — | ADR-014 통합 재발행. item 4=AC 충족(전 modality) / BLOCKED=평가 실행 불가 / 회고 open 스냅샷 → ADR-068로 통합 재발행 |
| 068 | 마일스톤 폐쇄 경계 + 졸업 계약 v3 | accepted | — | ADR-067 통합 재발행. task 층 폐쇄 경계 + closure receipt + 졸업 item 4 (a)(b)(c)(d)·mtime 폐지 + 아카이브 회전 (현재 SSOT: ADR-068) |
| 069 | 상위 정본의 절 단위 부분 개정 (Bounded SSOT Amendment) | accepted | +#amend-1: 승인 UI·공용 컴포넌트 전파 행 | /amend-ssot 신설 — 분류 4단 + 결정적 전파표 + 절-키 에스컬레이션 + 봉인 충돌 라우팅 |
| 070 | finding 심각도·종결·수렴 계약 | accepted | #amend-1: 수리 경계 밖 항목 `Adopt — blocked` · 등재 전 dedup · 전부 blocked 일 때 수렴 선택지 축소 | P0 정의표 + 재현 필수 + 채택 전 5값 검토 + 4-판정 전부 종결 + 원인 단위·영향 반경 재감사 + 라운드 예산 3·수렴 실패 브리프(면제값 없음) |
| 071 | 스택 결정 카탈로그 + 스캐폴드 소유 | accepted | #amend-1: harness 경로 무결성 실행 시작·종료 확장 + Storybook 애드온 기본값 정정 | 카탈로그 색인 + registry disposition 필수 + BASE/HYBRID/DEEP + /stack-guard 수행 0 스캐폴드·6-2-b baseline 라이브러리(Storybook 포함) — ADR-052 D1·055·063 D1 부분 supersede |
| 072 | 디자인 마일스톤 + 코드 프로토타입 + UI 제작 계약 + design gate v3 | accepted | #amend-1: design gate 어댑터 3건 정정(PM `--`·자가 검사 케이스 수·단축 hex 오탐), #amend-2: plan 승인 표면 대조 self-check 3축(UI 지시 출처·계측 배선 가능성·FAC 증명 문장), #amend-3: 미리보기 하네스 가시 요소 금지 + 가시 요소 = `source[]`, #amend-4: `구성 불확실` A/B 를 상태 쌍으로 + R4 원장 행 + R6 승인 체크리스트, #amend-5: 게이트 보류 탐지기·승인본 충실도·재진입 상태 | ADR-056 supersede. /design-milestone(브리프→코드→게이트→스냅샷→contract-ready) + 매니페스트 + 승인 스냅샷 + UI 제작 계약(봉인 전 예외·가짜 Red 금지·재사용 추적) + gate v3(매니페스트 모드·자가 검사 — ADR-058#amend-2 대체) |
| 073 | 인터페이스 결정 책임 분배 + DESIGN.md 내용 계약 v2 | accepted | #amend-1: 폰트 «전달 방식» 배선 강제(이름 선언은 배선 아님) + 스캐폴드 폰트 제거 + R0·R6 차단 + 게이트 2단계 검사, #amend-2: voice grep 범위·회수 출처·Spec-gap 라우팅 | ADR-027 통합 재발행. 프로필(웹+앱 단일 파일) + §3 폰트 블록 + §10 언어별 렌즈·용어 사전 + §9 플랫폼 관례 예외 + §11 기준 자료 확인일 + cross-surface·UI 판정 통합 |
| 074 | 모델·추론 강도·턴 예산 정책 v2 | accepted | — | ADR-004 통합 재발행. shared 비고정 + 별칭 자리 + effort 미지정(3갈래 판정) + 쓰기 도구 축 턴 예산 산식 + 에이전트 정의 세션 고정(파일 수정 후 새 세션 검증) + 조건당 새 세션 실험 프로토콜 |
| 075 | 메인 세션 오케스트레이션 v2 | accepted | — | ADR-051 통합 재발행. foreman·fan-out·de-fork·partition·관측 기록 승계 + fan-out 크기 판정을 구현 줄(L_impl) 기준으로 재보정 + 축 5 spawn = UI surface 파일 diff + 1축=1 validator 불변 |

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
