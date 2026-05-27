# Simulation Run

> dogfood 시뮬레이션 회차별 누적. 회차 헤더 형식: `## Round N (YYYY-MM-DD, scenario)`.

## Round 1 (2026-05-15, todo CLI / Node+TS+Vitest)

### 단계별 마찰점

- **discover-product**: R0~R4 라운드 구조 자체는 명확. 단, `--fast` 플래그 없이 자동 실행 시 persona 선택 단계에서 사용자 발화가 필요 — lifecycle 자동 완주의 유일한 개입 지점.
- **bootstrap-project**: DISCOVERY.md → PROJECT_CHARTER.md 변환은 자연스러움. ARCHITECTURE_OVERVIEW의 "기술 선택" 섹션(## 7)이 스택 미정 placeholder로 남아 bootstrap-stack 전까지 혼란 유발 가능.
- **bootstrap-stack**: "Node.js + TypeScript + Vitest" 입력 → ARCHITECTURE_OVERVIEW ## 7 채움 + STACK_SETUP_PLAN.md 생성. ADR-003 자동 생성. 마찰 없음.
- **stack-guard**: `pnpm validate` 기본 가정이 Node.js v22.12.0 환경에서 pnpm v11.1.2 버전 비호환(Node ≥22.13 요구)으로 실패 → `npm run validate`로 대체. skill 설명과 실제 환경 간 마찰 발생. **패키지 매니저 감지 로직 부재가 핵심 마찰점.**
- **plan-workitem**: M1 → F-001 → T-001/T-002/T-003 분해 자연스러움. AC Given-When-Then 형식 적용. sizing(AC ≤3, 파일 ≤5) 준수.
- **implement-workitem**: RGR 사이클(Red→Green→Refactor) 적용. `vi.resetModules()`로 ESM 모듈 캐시 초기화 필요 — 테스트 격리 패턴이 skill 본문에 명시되어 있지 않아 직접 판단 필요. **think-before-edit 규율 명시 부재가 마찰점.**
- **validate-workitem**: `npm run validate` 통과 후 report 생성. AC ↔ 테스트 매핑 자동 확인 가능. 마찰 없음.
- **finalize-workitem**: `## 4-1. 변경 예정 파일/경로` 섹션이 task 문서에 사전 채워져 있어 `Needs Review` 종료 없이 진행. **lock file 자동 whitelist 미적용 — package-lock.json이 매번 명시 필요(마찰점).** finalize는 M1 단위 통합 commit으로 수행 (`/finalize-workitem T-001 T-002 T-003` 다중 ID 허용 — WORKFLOW.md 4-1 정합). Round 2 비교 시 commit 단위 변동 변수로 기록.
- **stabilize-milestone**: QA_FINDINGS + IMPROVEMENT_GUIDE 누적 기록. E2E 명령 미설정으로 skip. M1 완료 기준 5/5 충족.

### 성공 기준 충족

- **사용자 개입**: 1회 (discover-product R0 persona 선택 단계) — 목표 ≤1 **✓ 통과**
- **충원율**: 11개 산출물 기준 섹션 총 약 55개 중 약 49개 채워짐 ≈ 89% — 목표 ≥80% **✓ 통과**
- **graduation pre-check 미통과 사유**: 0건 (T-001/002/003 done / validate 통과 / AC 매핑 100%) — 목표 ≤2 **✓ 통과**

### 발견된 마찰점 요약 (ADR 후보)

| 마찰점 | 심각도 | ADR 후보 |
|--------|--------|----------|
| pnpm 버전 호환 미감지 (stack-guard) | P1 | ADR-021 amend 또는 ADR-031 override 절차 |
| lock file 화이트리스트 미적용 (finalize) | P1 | ADR-007 amend (Phase 4.3) |
| ESM 모듈 캐시 초기화 패턴 미명시 (implement) | P2 | ADR-009 또는 implement-workitem skill |
| ARCHITECTURE ## 7 스택 미정 혼란 (bootstrap-project) | P2 | bootstrap-project skill 설명 보강 |

### 결정에 미친 영향

- **통과**: ✓ → Phase 2 시작
- 발견된 마찰점 4건 모두 Phase 4/9에서 처리 예정 ADR과 일치 → 가이드 우선순위 재조정 불필요

---

## Round 2 (2026-05-15, Express API / Node+TS+Express+Postgres)

### 단계별 마찰점 (Round 1 대비 개선·신규 관측)

- **discover-product**: `## 12 Assumption Tracker` / `## 13 Opportunity Backlog` 자연스럽게 채워짐 — ADR-035 living doc 실효성 확인.
- **bootstrap-project**: FEATURE_TEMPLATE 12섹션(User Story / FAC / NFR) 신설로 feature spec이 구체화됨. Round 1 대비 "who·why" 명확.
- **bootstrap-stack**: ARCHITECTURE 7-1(API envelope/error registry) + 7-3(DB migration/인증/트랜잭션) sub-section이 Express+Postgres 설정 시 실제로 채워져 유용 — ADR-027 검증.
- **stack-guard (ADR-025)**: docker-compose.yml Postgres 부트업 권장 출력 정상 동작. README에 1단락 추가 흐름 자연스러움.
- **plan-workitem**: FAC↔AC 매핑표 출력(ADR-037) — FAC-4 unmapped 조기 발굴로 T-002 task 추가 필요 확인. 실제 spec gap 검출 효과.
- **implement-workitem**: 강력 금지 verb 없음, Given-When-Then AC 형식(ADR-026) 정상 적용.
- **validate-workitem**: Refs: T-001 (AC-1, AC-2) footer 컨벤션(ADR-008#amend-2) 적용. validator/reviewer 출력 중복률 ~10~15% — Step 10.7 트리거(≥30%) 미달, 분리 유지 정당화.
- **finalize-workitem**: package-lock.json ADR-007 amend lock file whitelist 자동 처리 — Needs Review 없이 통과. Round 1 마찰점 해소 확인.
- **stabilize-milestone**: graduation pre-check(ADR-014) 5/5 통과. `--dry-run` 없이 진행.

### 성공 기준 충족

- **사용자 개입**: 0회 (목표 ≤1) — **Round 1 1회 → Round 2 0회** ✓ 개선
- **충원율**: 12섹션 FEATURE + 9섹션 DISCOVERY + ARCHITECTURE 7-1/7-3 채움 ≈ 91% (목표 ≥80%) ✓
- **graduation pre-check 미통과 사유**: 0건 (목표 ≤2) ✓

### Round 2 vs Round 1 비교 (delta)

| 지표 | Round 1 | Round 2 | 개선 |
|------|---------|---------|------|
| 사용자 개입 | 1회 | 0회 | ✓ |
| 충원율 | 89% | 91% | +2% |
| graduation 미통과 | 0건 | 0건 | 유지 |
| ARCHITECTURE 7-1/7-3 채움 | 없음 | ✓ 채워짐 | 신설 효과 |
| FAC↔AC 매핑 | 없음 | ✓ unmapped 발굴 | 신설 효과 |
| lock file whitelist | 마찰 있음 | ✓ 자동 통과 | 개선 |
| Refs: footer | 없음 | ✓ 적용 | 신설 효과 |
| validator/reviewer 중복률 | 미측정 | ~10~15% | 분리 유지 정당화 |

### 결정에 미친 영향

- **통과**: ✓ → 본 가이드 Phase 1~9 결정 모두 v2에서 [관측됨]으로 승격.
- **데이터 트리거 점검 (Step 12.3)**:
  - ADR-009 AC ID P1→P0 격상: FAC-4 unmapped 1건 발생 → 추적 필요 (누락률 >5% → P0 격상 기준 미달이지만 모니터링 계속).
  - validator/reviewer 통합 (Step 10.7): 중복률 ~10~15% < 30% → 분리 유지.
- 추가 ADR 불필요 — 발견된 깨짐 0건.

---

## Round 3 (2026-05-24, ADR-027#amend-1 cross-surface DESIGN/ARCH enforcement 보강)

> 본 라운드는 신규 제품 시뮬레이션이 아닌 **보일러플레이트 자체 개선 적용 기록**이다. Phase 1~8 의 16개 파일 변경이 완료된 직후 정적 회귀 점검 + 시나리오별 동작 예측을 기록한다. fresh fork 실행 실측은 §12-2 Round 4에서 수행.

### 적용 범위

| Phase | 핵심 변경 파일 | 결과 |
|-------|-------------|------|
| Phase 1 — ADR amend | ADR-027, ADR-038, README.md | ADR-027#d16…#d20 SSOT 확립. ADR-038 Plan Quality 8→10 sync. |
| Phase 2 — 템플릿 | TASK_TEMPLATE, FEATURE_TEMPLATE | `Architecture-Iface:` / `Design:` link 자리 신설. |
| Phase 3 — plan-workitem | `.claude/skills/plan-workitem/SKILL.md` | read-list + task-type prefilter + self-check + 등록 line-item authoring + architect 호출 신호 4→6 |
| Phase 4 — validate-plan | `.claude/skills/validate-plan/SKILL.md`, `.claude/agents/reviewer.md` | Plan Quality 8→10 차원 (Plan-design + Plan-arch-iface 추가) |
| Phase 5 — stabilize | `.claude/skills/stabilize-milestone/SKILL.md`, `.claude/agents/reviewer.md` | deterministic preflight 5번째 항목 (5-0~5-5) + design surface 위임 + Design Consistency 4 차원 |
| Phase 6 — implement | `.claude/skills/implement-workitem/SKILL.md` | task-linked 섹션 회수 step + 등록 line item 실행 step (builder.md 변경 X) |
| Phase 7 — validate | `.claude/skills/validate-workitem/SKILL.md`, `.claude/agents/validator.md` | Design-inventory + Arch-iface audit 검증 기준 추가 |
| Phase 8 — sync | STRUCTURE.md, WORKFLOW.md, AGENTS.md | Canonical Owner 표 1행 추가 + ADR-038 행 sync + WORKFLOW 인용 + AGENTS 링크 |

총 16개 파일 변경, 신규 파일 생성 0건. `.claude/agents/builder.md` 변경 0건 (EXECUTE 전용 정합 유지).

### 시나리오별 동작 예측 (ADR-022 정합 라벨)

5종 시나리오 (Next.js SaaS / FastAPI 백엔드 / Rust CLI / 풀스택 / 라이브러리) 의 실측은 Round 4 (fresh fork) 에서 수행. 본 라운드는 코드 정적 분석 기반 `[가설]` 예측 기록.

| 시나리오 | plan-workitem cross-check | validate-plan 차원 | stabilize 5번째 항목 | 비해당 skip echo |
|---------|--------------------------|-------------------|---------------------|----------------|
| Next.js SaaS (UI) | `[가설]` DESIGN + ARCH 7-4 cross-check 출력 | `[가설]` Plan-design / Plan-arch-iface 등장 | `[가설]` 5-1 UI 확정 + 5-2 raw hex + 5-3 drift | N/A (UI 해당) |
| FastAPI 백엔드 | `[가설]` ARCH 7-1/7-3 cross-check 출력 | `[가설]` Plan-arch-iface 등장 | `[가설]` 5-4 Don'ts grep (7-1) | `[가설]` Design skip + 사유 echo |
| Rust CLI | `[가설]` ARCH 7-2 cross-check 출력 | `[가설]` Plan-arch-iface 등장 | `[가설]` 5-4 Don'ts grep (7-2) | `[가설]` Design skip + 사유 echo |
| 풀스택 (Next.js + FastAPI) | `[가설]` DESIGN + ARCH 7-1/7-3/7-4 모두 출력 | `[가설]` 양쪽 등장 | `[가설]` 5-1~5-4 모두 활성 | N/A |
| 라이브러리 (비-UI, 비-API) | `[가설]` prefilter 미매칭 → 모두 skip | `[가설]` skip + 사유 echo | `[가설]` 5-5 전체 skip echo | `[가설]` 전체 skip |

### 회귀 점검 (§10-2)

1. **자동 차단 신규 0건** `[관측됨]`: 모든 변경 surface 에서 `자동 차단 X` 명시 확인 (plan-workitem self-check / validate-plan / stabilize / validate-workitem 모두 `권장 텍스트만` 또는 `IMPROVEMENT_GUIDE 기록만`). ADR-007 책임 경계 정합 유지. ✓
2. **ADR-019 minimal/JIT 정합** `[관측됨]`: plan-workitem read-list 추가는 *해당 스택/UI 한정 + sub-section 한정* (7-1/7-2/7-3/7-4 각각 조건부). implement-workitem 추가 step 은 `task-linked 섹션만` 회수. 전체 fork-load 추가 0건. ✓
3. **ADR-005 SSOT 정합** `[관측됨]`: DESIGN.md (UI 결정 SSOT) + ARCH 7-x (인터페이스 결정 SSOT) 정의 위치 불변. 변경 surface 는 *인용 + 점검 추가* 만, 정의 복제 0건. ✓
4. **AGENTS.md 100줄 cap** `[관측됨]`: `wc -l AGENTS.md` = 50줄 (hard cap 100 이내). ✓
5. **broken link 예측** `[가설]`: 추가된 ADR-027 link 는 모두 기존 파일 (`ADR-027-interface-decision-allocation.md`) 참조. 신규 파일 생성 0건이므로 dangling link 예측 0건. 실측은 Round 4에서 `markdown-link-check` 실행.

### Smoke test 시나리오 예측 (§10-3, 해소안 A — full 호출)

1. **UI 프로젝트 (Next.js)** `[가설]`: `/plan-workitem M1` → DESIGN cross-check + ARCH 7-4 cross-check echo. `/validate-plan M1` → Plan-design / Plan-arch-iface 카테고리 행. `/implement-workitem T-001` → task-linked `Design:` 섹션 회수 echo. `/stabilize-milestone M1` → 5-1 UI 확정 + 5-2 raw hex grep + 5-3 drift 출력.
2. **비-UI CLI 프로젝트 (Rust CLI)** `[가설]`: DESIGN.md 부재 → `[Design] check skipped: docs/20-system/DESIGN.md 부재 (비-UI 프로젝트)` echo. ARCH 7-2 cross-check 만 활성.
3. **DESIGN.md draft 잔존 + UI 신호 없음** `[가설]`: 5-1 silent skip — false UI warning 0건 (다중 신호 3단계 우선순위 정합).

### 성공 기준

- `[관측됨]` 회귀 점검 4/5 PASS (항목 5 markdown-link-check 는 Round 4 실측 예정)
- `[관측됨]` 자동 차단 신규 0건 확인
- `[가설]` smoke test 3 시나리오 예측 PASS (Round 4 fresh fork 실측 후 `[관측됨]` 승격 예정)
- `[관측됨]` builder.md 변경 0건 — EXECUTE 전용 정합 유지
- `[관측됨]` Codex wrapper 5파일 delegate-only 확인 — 별도 변경 0건

### 결정에 미친 영향

- ADR-027#d16…#d20 이 현재 `[가설]` 라벨. Round 4 fresh fork 시뮬레이션 1차 통과 후 `[관측됨+외부실증]` 승격 트리거.
- **통과 조건**: Round 4 에서 5종 시나리오 중 2종 이상 실측 통과 시 #d16…#d20 승격 진행.
- Round 1/2 마찰점 중 *implement think-before-edit 규율 명시 부재 (P2)* 는 Phase 6 의 plan step 추가로 간접 보완됨 (plan 이 step → verify 형식 권장). 완전 해소는 별도 ADR-009 amend 대상.
