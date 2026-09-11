# Simulation Run

> **기록 시점 주석 (ADR-045#amend-2 D10 — 종류 E)**: 본 문서는 회차별 실행 기록이다. 본문의 ADR 인용은 **그 회차에 실제로 적용된 규칙**을 가리키며 현행 SSOT가 아닐 수 있다. **기록을 사실대로 두기 위해 원문을 고치지 않는다.** (현재 SSOT: `ADR-014` → [ADR-067](../../docs/90-decisions/boilerplate/ADR-067-milestone-graduation-v2.md) → [ADR-068](../../docs/90-decisions/boilerplate/ADR-068-milestone-closure-and-graduation-v3.md) / `ADR-049` → [ADR-058](../../docs/90-decisions/boilerplate/ADR-058-design-workflow.md) / `ADR-027` → [ADR-073](../../docs/90-decisions/boilerplate/ADR-073-interface-and-design-content-v2.md) / `ADR-056` → [ADR-072](../../docs/90-decisions/boilerplate/ADR-072-design-milestone-and-code-prototype.md)) (현재 SSOT: ADR-068, ADR-073, ADR-072)

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
- **bootstrap-stack**: ARCHITECTURE 7-1(API envelope/error registry) + 7-3(DB migration/인증/트랜잭션) sub-section이 Express+Postgres 설정 시 실제로 채워져 유용 — ADR-027 검증. (현재 SSOT: ADR-073)
- **stack-guard (ADR-025)**: docker-compose.yml Postgres 부트업 권장 출력 정상 동작. README에 1단락 추가 흐름 자연스러움.
- **plan-workitem**: FAC↔AC 매핑표 출력(ADR-037) — FAC-4 unmapped 조기 발굴로 T-002 task 추가 필요 확인. 실제 spec gap 검출 효과.
- **implement-workitem**: 강력 금지 verb 없음, Given-When-Then AC 형식(ADR-026) 정상 적용.
- **validate-workitem**: Refs: T-001 (AC-1, AC-2) footer 컨벤션(ADR-008#amend-2) 적용. validator/reviewer 출력 중복률 ~10~15% — Step 10.7 트리거(≥30%) 미달, 분리 유지 정당화.
- **finalize-workitem**: package-lock.json ADR-007 amend lock file whitelist 자동 처리 — Needs Review 없이 통과. Round 1 마찰점 해소 확인.
- **stabilize-milestone**: graduation pre-check(ADR-014) 5/5 통과. `--dry-run` 없이 진행. (현재 SSOT: ADR-068)

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

## Round 3 (2026-05-24, ADR-027#amend-1 cross-surface DESIGN/ARCH enforcement 보강) (현재 SSOT: ADR-073)

> 본 라운드는 신규 제품 시뮬레이션이 아닌 **보일러플레이트 자체 개선 적용 기록**이다. Phase 1~8 의 16개 파일 변경이 완료된 직후 정적 회귀 점검 + 시나리오별 동작 예측을 기록한다. fresh fork 실행 실측은 §12-2 Round 4에서 수행.

### 적용 범위

| Phase | 핵심 변경 파일 | 결과 |
|-------|-------------|------|
| Phase 1 — ADR amend | ADR-027, ADR-038, README.md | ADR-027#d16…#d20 SSOT 확립. ADR-038 Plan Quality 8→10 sync. (현재 SSOT: ADR-073) |
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
5. **broken link 예측** `[가설]`: 추가된 ADR-027 link 는 모두 기존 파일 (`ADR-027-interface-decision-allocation.md`) 참조. 신규 파일 생성 0건이므로 dangling link 예측 0건. 실측은 Round 4에서 `markdown-link-check` 실행. (현재 SSOT: ADR-073)

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

- ADR-027#d16…#d20 이 현재 `[가설]` 라벨. Round 4 fresh fork 시뮬레이션 1차 통과 후 `[관측됨+외부실증]` 승격 트리거. (현재 SSOT: ADR-073)
- **통과 조건**: Round 4 에서 5종 시나리오 중 2종 이상 실측 통과 시 #d16…#d20 승격 진행.
- Round 1/2 마찰점 중 *implement think-before-edit 규율 명시 부재 (P2)* 는 Phase 6 의 plan step 추가로 간접 보완됨 (plan 이 step → verify 형식 권장). 완전 해소는 별도 ADR-009 amend 대상.

---

## Round 4 (2026-07-17, 2026-07 개선 라운드 적용 기록 — ADR-056 경험 계약 + ADR-057 플래닝 v2) (현재 SSOT: ADR-072)

> 본 라운드는 신규 제품 시뮬레이션이 아닌 **보일러플레이트 자체 개선 적용 기록**(Round 3과 동형)이다. 2026-07 개선 라운드(Stage 0A~5, 신규 ADR-056·057 + amend 14건(12개 ADR))의 적용 완료 직후 정적 회귀 점검 + fresh-fork UI 마일스톤 시나리오의 새 lifecycle 관통을 `[가설]`로 기록한다(ADR-017 재실행 트리거 3종 — 새 ADR·lifecycle 변경·skill 큰 변경 — 전부 해당). fresh-fork 실측 및 Codex `$validate-milestone` 자동완성 실측은 IMPROVE-GUIDE item 11의 사용자 후속 항목으로 남는다. **⚠ 본 라운드는 ADR-017 gate 3지표(사용자 개입 ≤1 / placeholder 충원율 ≥80% / graduation pre-check 미통과 ≤2)를 측정하지 않는 *정적 적용 기록*이다 — 별도 fork 실행이 필요한 gate '통과'가 아니라 fresh-fork 실측 '예약'이다(Round 1/2 = 실측치 보유, Round 3·4 = 정적 기록·[가설]).** (현재 SSOT: ADR-072)

### 적용 범위

| Stage | 핵심 변경 | 결과 |
|-------|----------|------|
| 2 — ADR-056 경험 계약 | plan-milestone R5 + plan-workitem 입구 계약/9-1/3-P + stabilize §3-V + DESIGN §10 Voice + builder/reviewer/템플릿 (+ADR-007#5·027#6) | 프로토타입 라운드 + 입구 계약(이중 잠금) + 스크린샷 게이트 + Voice 규칙서 배선 (현재 SSOT: ADR-072) |
| 3 (커밋 1~3) — ADR-057 플래닝 v2 | bootstrap-project M1 seed 제거 / plan-milestone M1 포함 / plan-workitem 배치·refresh·seam self-check / implement Needs Plan Refresh / finalize 체크포인트 / stabilize --feature / FEATURE §7-2·ARCH §4-1 / reviewer·validate-plan 11차원 (+ADR-007 표·026#3·051#3) | 생성 통일 + 배치 2-tier + feature 체크포인트 + seam 계약 |
| 4 — ADR-000#amend-2 | ADR 작성 트리거 표 + [ADR-candidate] 회수(stabilize→plan R0) + ADR-053#amend-1 | 작성 주체·시점 SSOT + 후보 증발 차단 |
| 5 — 정합 검증 | grep sweep 기계 불일치 0; 리뷰서 의미 불일치 1건(trigger 표 ↔ plan-milestone) → sync 수정 | cross-surface 정합 확인 |

이번 라운드(Stage 0A~5) 신규: **ADR 2개(056·057 umbrella) + amend 14건(12개 ADR) + agent 1개(designer — Stage 1C, 73c21f7)**. skill 신설 0. 나머지 정책은 기존 ADR Amendment.

### 관통 시나리오 예측 — fresh-fork UI 마일스톤 (ADR-022 정합 라벨)

시나리오: UI 웹앱(할 일 관리), M1 = "홈 목록 + 상세" 화면. 실측은 다음 fresh fork에서 수행, 본 라운드는 코드 정적 분석 기반 `[가설]`.

1. **생성 통일** `[가설]`: `/bootstrap-project` → charter/ARCH/ADR-100까지만, **M1/F-001 seed 안 함**(ADR-057 결정 1). 종료 출력이 `/plan-milestone` 안내. `/plan-milestone`이 R0(첫 호출 — carry-over 없음)~R4로 M1 + feature 문서 생성.
2. **R5 프로토타입 라운드** `[가설]`: UI 확정(ADR-027#amend-3) → R5 발동. R5-1 화면 목록 → R5-2 designer 단발 sub-call 시안 2~3안(레이아웃/위계/인터랙션 축 divergence, DESIGN `:root` 토큰만) → R5-3 사용자 선택 → R5-4 못생긴 상태 5종 + 실카피(§10) + 인터랙션 캡션 → R5-5 승인본 `docs/20-system/prototypes/M1/home.html` **커밋** + feature `## 7`에 `프로토타입:` 참조 줄. DESIGN §10 부재 시 R5-4 전 기본값 신설 + 확인 1회. (현재 SSOT: ADR-073)
3. **배치 분해 (2-tier)** `[가설]`: `/plan-workitem M1` → **입구 계약 통과**(승인 프로토타입 존재 — ADR-056 결정 3). 안정 tier(전 feature AC·의존성·§7-1 매핑·seam self-check 1회) 완성 + 가이드 tier는 첫 feature만 full `## 3`, 나머지 draft 마커. 3-P가 각 UI task `## 3`에 프로토타입 참조 line item authoring(Lock 2). seam 신호 미발화(단순 CRUD)면 §7-2 "(해당 없음)". (현재 SSOT: ADR-072)
4. **draft 하드스탑** `[가설]`: 둘째 feature 구현 진입 시 `/implement-workitem`이 `## 3 상태: draft` 감지 → **`Needs Plan Refresh` 하드스탑**(ADR-057 결정 4) → `/plan-workitem F-002 --refresh`로 그 시점 코드 기준 재접지 + 마커 제거.
5. **feature 체크포인트** `[가설]`: feature 전 task done 시 `/finalize-workitem`이 FAC closure 요약 + 다음 단계 제안(ADR-057 결정 5).
6. **§3-V 경험 게이트** `[가설]`: `/stabilize-milestone M1` → 앱 기동 → 핵심 화면 Playwright 스크린샷 → `docs/40-validation/visual/M-1/` 갤러리 → Read 멀티모달로 **승인 프로토타입 `home.html` vs 실제 렌더 대조**. 불일치 시 `P1 [Experience-drift]` report-only + 갤러리 경로 출력(사용자 육안 확인). 환경 실패 시 blocked-on-env echo(silent skip 금지).
7. **Codex 관통** `[가설]`: Codex 세션에서 `$validate-milestone M1`(read-only 2nd opinion) 발견·실행 — wrapper GA. §3-V는 멀티모달 편차로 갤러리 생성 + 사용자 수동 대조 degrade.

### 회귀 점검 (Stage 5 정적 sweep 재현)

1. **로스터 정합** `[관측됨]`: `.claude/skills` 21 / `.claude/agents` 8(designer 포함) / `.agents/skills` 16 ↔ STRUCTURE·README·DELEGATION 일치. 21−16=5 자연어 정합. ✓
2. **Plan Quality 11 카운트** `[관측됨]`: reviewer.md·validate-plan·DELEGATION 3곳 일치, 잔여 "10" 7건 전부 amend-1 이력/전이 서술(ADR-027:98·114·ADR-038:52·100·README:34·ADR-057:12·32). ✓ (현재 SSOT: ADR-073)
3. **anchor 14종** `[관측됨]`: 신규 인용 amend anchor 14개 전부 정확히 1건 실재. ✓
4. **금지 참조·구체제 잔존 0** `[관측됨]`: ADR-058~061=0, `initial/초기 workitem·milestone·seed된 첫 feature`=0, M2+·`plan-workitem F-001` hit 전부 whitelist(제거-서술 ADR + CHECKLIST 단일예시). ✓
5. **0C sweep 완결** `[관측됨]`: `^context-pack:`=0(0C-8), `병렬 미지원/파리티`=0(0C-10), `Bash 없음 — e2e 충돌`=0(0C-9). ✓
6. **gitignore 정합** `[관측됨]`: `prototypes/*/_drafts/`·`visual/` ignore / `prototypes/M1/home.html` tracked(승인본 영속). ✓
7. **비의도 자동 차단 신규 0건** `[관측됨]`: **의도된 신규 hard-stop 2건은 설계** — 입구 계약 `Needs Experience Contract`(ADR-056 결정3) + draft `Needs Plan Refresh`(ADR-057 결정4)만 constraint(강). 그 외 seam/experience-drift/voice는 전부 report-only 또는 IMPROVEMENT_GUIDE 기록 — 비의도 차단 0. ✓ (현재 SSOT: ADR-072)
8. **git diff --check + Stage 5 sync** `[관측됨]`: 기계 grep 불일치 0. 단 *의미 수준* 불일치 1건(ADR-000#amend-2 트리거 표가 plan-milestone에 부여한 high-stakes ADR authoring 경로가 skill에 부재)은 정적 sweep이 못 잡아 리뷰서 발견 → plan-milestone R2 + ADR-000 Target sync 커밋 1건. **그 sync 커밋 + 본 dogfood 커밋 후 working tree clean.** ✓

### 성공 기준

- `[관측됨]` 정적 정합 8/8 PASS (로스터·카운트·anchor·잔존·0C·gitignore·차단강도·clean).
- `[가설]` 관통 시나리오 7단계 예측 PASS — fresh-fork 실측 후 `[관측됨]` 승격 예정.
- `[가설]` Codex `$validate-milestone` 발견 — item 11 (a) 사용자 자동완성 실측 대기.
- `[관측됨]` builder.md는 경험 좁힘 비대칭 1줄 외 EXECUTE 전용 정합 유지 / Codex wrapper delegate-only.

### 결정에 미친 영향

- ADR-056·057 Predicted improvement 항목은 현재 `[가설]` — fresh-fork 5종 중 UI 2종+ 실측 통과 시 `[관측됨]` 승격. (현재 SSOT: ADR-072)
- **Falsifying evaluation 입력 수집 예정**(item 11 (b)): R5 프로토타입 라운드가 마일스톤당 계획 시간을 과도하게 늘리는지 / 배치 세션 컨텍스트 소진으로 부분 완료가 나는지 / seam 신호 소형 feature 과발동 / [Experience-drift] 재실행 불일치율.
- **미수행으로 남는 실측**(정적 기록이 대체 못 함): (a) 이 라운드 fresh-fork 관통 실측, (b) Round 3이 예고한 ADR-027#amend-1 #d16…#d20 fresh-fork 실측(여전히 미수행), (c) Codex 자동 팬아웃 여부 실측(→ Codex-parity 재프레이밍 별도 라운드). (현재 SSOT: ADR-073)

---

### Round 4 실측 (2026-07-17, isolated-fork in-session AI-driven run — QuickTodo UI 마일스톤)

> 위 정적 기록의 "예약"을 실제로 수행한 결과. fork `C:\tmp\dogfood-ui-todo`(QuickTodo — 계정 없는 로컬 todo 웹앱, React 19 + Vite 8 CSR), git baseline부터 **21커밋**. **대부분의** 위임 지점에 **실제 서브에이전트**(architect ×2, designer ×2, builder ×4, qa ×1, reviewer ×1) + 실제 `npm install`/vitest/Playwright 실행. **단 3개 위임 지점 미실행** — 아래 "fidelity deviations" 참조.

**정직한 프레이밍 (한계 명시)**: fork를 cwd로 한 fresh Claude/Codex 세션을 별도 기동할 수 없어 harness auto-load·settings 자동검증·"fresh-세션 taste 게이트"는 in-session 서브에이전트 + AskUserQuestion으로 근사했다 → 순수 fresh-session 실측이 아닌 **isolated-fork in-session AI-driven run**(별도 fork 디렉터리는 맞으나 새 세션 harness auto-load 검증은 아님). Codex 관통(아래 7단계)·위 (b)(c) 실측은 여전히 미수행.

**fidelity deviations (lifecycle 완전 준수 아님 — 정직 기록)**:
- **bootstrap-design R0 researcher(코드 토큰추출)·R2-1.5 reviewer(구별성) sub-call 생략** — fresh-세션 재현 불가(fork `DESIGN_RESEARCH.md` grounding에 기록).
- **validate-workitem validator fan-out 미실행** — T-002(10파일 +249/-380)·T-003(6파일 +89/-9)·T-004(5파일 +65/-5) 전부 small-diff 임계 초과라 fan-out 대상이나 **inline 처리**. 특히 T-002는 명백한 fan-out 규모인데 "단일 vertical slice" 판단으로 inline — 경계 판단 오용. per-task validator fan-out 메커니즘은 이번 dogfood에서 **미실측**(후속 stabilize의 qa/reviewer fan-out은 다른 단계라 대체 아님). (T-004 validation report가 diff를 ~40줄로 축소 기록 — 실제 70 changed lines.)
- **stabilize read-only 계약 deviation** — stabilize 도중 미포맷 e2e를 발견해 `a78b095` 포맷 커밋을 직접 생성(정식 경로는 finding 기록 후 `/repair-milestone` 라우팅). 최종 코드는 정상이나 read-only 위반으로 기록.
- 결론: "lifecycle 그대로 관통 / 모든 위임 지점 실행"은 **부정확** — *대부분* 관통 + 위 3개 미실행.

#### 관통 시나리오 실측 ([가설] → [관측됨])

1. **생성 통일** `[관측됨]` — bootstrap-project는 charter/ARCH/ADR-100까지, M1 seed 안 함(ADR-057 결정1). plan-milestone이 M1+F-001/F-002 생성. ✓
2. **R5 프로토타입 라운드** `[관측됨]` — (선행 bootstrap-design R2에서 concept 3안 **A Command Bar / B Plaintext Terminal / C Quiet Sheet** 중 사용자가 **A Command Bar** 선택.) plan-milestone R5-2 designer sub-call이 *레이아웃* 시안 3안(**A 상단고정 / B 중앙런처 / C 그룹시트**) 생성 → 사용자 **B 중앙런처** 선택 → 못생긴 5종+corrupt+실카피(§10)+인터랙션 캡션 → 승인본 `prototypes/M1/main.html`("시안 B 중앙런처 · Concept A") 커밋 + feature §7 참조. ✓ **단 friction: 승인 프로토타입(전체 경험 타깃)이 M1 비범위(완료항목지우기·undo·j/k·is-focus)를 포함 → §3-V 대조 타깃이 마일스톤 범위와 불일치. 트림 필요했음.**
3. **배치 분해 2-tier** `[관측됨]` — plan-workitem M1 입구 계약 통과(프로토타입 존재), architect sub-call 분해, full 3-G={T-001 storage seam, T-002 capture}, intent-draft+마커={T-003, T-004}. FAC↔AC 100% 매핑, **seam 신호 발화**(todos store 2-writer: add+toggle) → INV-1/2/3 §7-2 canonical. 3-P 프로토타입 참조 line item. ✓
4. **draft 하드스탑 / --refresh** `[관측됨, 변형]` — T-003/T-004는 구현 진입 *전에* `/plan-workitem F-002 --refresh`로 draft 마커를 선제 제거(실 코드 기준 3-G 재작성) → **하드스탑 자체는 미발동(정상 흐름), --refresh 경로는 실측**. seam 재점검 무효화 0. ✓
5. **feature 체크포인트** `[관측됨]` — finalize T-002 → F-001 완료, finalize T-004 → F-002+M1 전 task done. ✓
6. **§3-V 경험 게이트** `[관측됨 — 핵심 수확]` — 앱 기동 + Playwright 6-상태 스크린샷(`visual/M1/`) + 멀티모달 대조 → **P1 [Experience-drift] 실제 검출**: 프로토타입 §2-e의 입력 sticky-pin 구성결정이 구현에 없음(`.stage padding:28vh` 고정, sticky 부재). per-task validate·unit·e2e 전부 green이었으나 경험 계약 drift는 §3-V만 잡음. **게이트가 plan→implement 갭을 설계대로 catch — ADR-056 가치 실증.** ✓✓ (현재 SSOT: ADR-072)
7. **Codex 관통** `[미실측]` — 구조적 한계.

#### ADR-017 gate 3지표 실측

| 지표 | 목표 | 실측 | 판정 |
|------|------|------|------|
| 사용자 개입 | ≤1 | **0회** — ADR-017 결정2 정의(skill 산출물 *직접 편집* 행위 기준, **질문 응답 제외**)상 concept·프로토타입 선택은 질문 응답이라 제외. 사용자의 fork 파일 직접 편집 0 (모든 편집은 에이전트 수행) | **통과** |
| placeholder 충원율 | ≥80% | ~100% (DISCOVERY 16 / CHARTER / ARCH / ADR-100·101 / DESIGN / DESIGN_RESEARCH / M1 / F-001·002 / T-001~004 전부 실콘텐츠, 미충원 0) | **통과** |
| graduation pre-check 미통과 | ≤2 | 1건 (6기준 중 task done·validate exit0·e2e suite 6/6·AC 100%·P0 0 통과, (선택)[Experience-drift] P1 0 미통과=sticky-pin) | **통과** |

- **ADR-017 gate: 3/3 통과** — 본 dogfood는 유효한 gate-통과 실측(초기 오기록: 지표1 "미달" + "UI 재정의" finding은 ADR-017 정의 오독이었음 — 정정. 질문 응답은 개입 아님).
- **M1 graduation: NO** (gate 통과와 *별개*) — 채택된 경험 게이트([Experience-drift] P1 0건)를 sticky-pin 1건이 위반해 차단. 기능·validate·e2e·AC는 완성. → `/repair-milestone M1` 라우팅. *graduation NO 자체가 유효한 실측 결과*(§3-V가 실 drift catch).
- **e2e suite 6/6의 범위 한정**: 기능 e2e 1(add→toggle→reload) + root smoke 1 + overflow advisory 3 + axe advisory 1. **overflow·axe는 결과 무관 상시 통과하는 report-only**이고 axe는 빈 화면만 검사 → "suite pass"는 맞으나 **접근성·responsive 검증 완료는 아님**(done-항목 대비 가설 미검증 — QA_FINDINGS F-M1-003).

#### 발견된 실 friction (harness 개선 후보 — fork IMPROVEMENT_GUIDE INST-1~5 + QA_FINDINGS 회수)

- **INST-1 (P1, 최대 수확)**: plan-workitem이 프로토타입 구성/인터랙션 결정(sticky-pin §2-e)을 AC로 분해하지 않아 §3-V가 뒤늦게 drift catch. 3-P/분해에 **프로토타입 상태 ↔ task AC cross-check 단계** 권장.
- **INST-2 (P2)**: stabilize raw-hex preflight(5-2)가 DTCG 토큰 정의 CSS(`src/index.css :root`)를 false-positive 플래그(DESIGN.md·prototypes만 제외). **token `:root` 정의 파일/블록도 제외** 권장.
- **INST-3 (P2)**: plan-workitem §153 cross-feature INV canonical "낮은 번호 feature" 규칙이 **비대칭 seam**(한 feature가 write-through 소유)에서 의미 역전 배치 → "소유 feature 우선" 예외 단서 검토.
- **INST-4 (P2)**: 서브에이전트가 최종 구조화 반환 전 **중간 사고 문장으로 정지** 2건(T-002 builder, qa) → foreman always-verify + SendMessage 재개로 회수(이번에 실제로 catch). 위임 프롬프트 "최종=구조화 blob" 강조 + foreman 검증 규율 명문화.
- **INST-5 (P2)**: bootstrap-design R0 researcher·R2-1.5 reviewer sub-call이 fresh-세션 재현 불가로 생략 — degraded 경로 fidelity 손실 지점(정직 문서화).
- **프로토타입 범위 friction**: 승인 프로토타입(전체 경험 타깃)이 마일스톤 비범위를 포함 → §3-V 대조가 올바르게 범위 지킨 앱을 drift로 오판 위험. **프로토타입 승인/§3-V에 "마일스톤 범위 대조" 단서** 권장(이번엔 트림으로 해소).
- **저장실패 계약 갭**: plan seam self-check가 "예외 삼키지 않음"(INV)은 잡았으나 `add()` **성공-신호 인터페이스**(App의 clear 판단용)는 못 잡아 T-002/T-004 계약 충돌 → 외부 리뷰로 사전 교정. seam 관점에 "성공/실패 신호 전파" 추가 검토.
- **커밋 규율**: e2e 커밋 시 `validate:e2e`만 확인하고 full `npm run validate` 미실행 → 미포맷 파일 커밋(format:check FAIL, qa fan-out이 검출). foreman/finalize **커밋 전 full validate 필수(테스트/e2e 파일 포함)**.

#### 승격 판정

- **ADR-056 §3-V 경험 게이트** → `[관측됨]` 승격: 실 drift(sticky-pin) 검출로 가치 실증(정적 [가설]에서 승격). 다관점 fan-out(qa가 broken 커밋·design reviewer가 sticky-pin/대비 독립 검출)도 실효 확인. (현재 SSOT: ADR-072)
- **ADR-057 배치 2-tier·seam self-check·--refresh·feature 체크포인트** → `[관측됨]` 승격(관통 실행 완료, seam 신호 실발화).
- **지표 1·2·3 전부 통과** (ADR-017 gate 3/3). M1 graduation NO는 gate와 별개(경험 게이트가 실 drift catch — 정상).
- **여전히 미실측**(repair 후속 전 기준): Codex 관통, bootstrap-design researcher/reviewer sub-call, **validate-workitem large-diff validator fan-out**(전 task inline), 위 (b)(c). 순수 fresh-session 실측은 별도 세션 필요(구조적 한계).

#### repair 라운드 후속 (M1-repair-1 — 졸업 달성)

- 위 graduation NO(sticky-pin)를 **`/repair-milestone M1`로 회수** — 마지막 미실행 스테이지(**repair-milestone + repair-workitem finding-mode**) 실측. sticky-pin을 `.capture{position:sticky;top:0}` wrapper로 수정(repair-workitem T-002 위임, 중앙런처 28vh 유지), corrupt scope를 ADR-100에 **load-scope 명문화**(cross-cutting 직접 수정, 코드 무변경). §5 Repair decision log 기록.
- **re-stabilize §3-V**: many-items 스크롤 재촬영으로 입력 상단 sticky 시각 확인 → [Experience-drift] P1 0. **M1 graduation 6/6 = YES**(validate exit0 · e2e 7/7 · AC 100% · P0 0 · 경험 게이트 통과). fork **23커밋 clean**.
- 추가 finding: sticky builder가 `pnpm`을 무심코 실행해 stray `pnpm-lock.yaml` 생성(프로젝트는 npm — `package-lock.json`) → 제거. **INST-4 인접**(서브에이전트 규율): 위임 프롬프트에 "프로젝트 패키지매니저(npm) 고정" 명시 검토.
- **관통 스테이지(대부분 실측, 완전 준수 아님)**: discover→bootstrap→stack→guard→design→plan-milestone(R5)→plan-workitem(배치)→implement×4→validate→finalize→stabilize(§3-V)→repair-milestone→repair-workitem(sticky + P2 배치 corrupt-clear/hover/rise/a11y/테스트)→**retrospective multi-agent review**(repair diff)→졸업. **부분 실측 + deviation 명시**(아래 fidelity deviations — "관통 커버리지 완결"은 과장이었음, 정정).
- **retrospective partial multi-agent review 실측 (fan-out *오케스트레이션 패턴* — 정식 `/validate-workitem` 아님)**: 외부 리뷰가 "repair 후 validate-workitem 재실행 누락 + repair diff는 fan-out 대상"을 지적 → repair diff에 **3축 병렬 리뷰(validator×2 axis1-2·5 + qa axis8) + 메인 집계** 실행. **정직 caveat**: 이는 병렬-오케스트레이션+집계 *패턴*은 실측했으나 **정식 `/validate-workitem` skill 호출이 아니다** — task-ID 입력·`reports/T-002.md` 갱신·전체 축 발화(3 FAC·4 frontend·7 evidence)를 하지 않았고 산출물은 별도 `reports/M1-repair-validation.md`. 그럼에도 **inline foreman(나)이 놓친 2 P1을 catch**: (1)[Doc-code-mismatch] corrupt-clear가 T-004 §8 "corrupt 경고 세션 유지" 결정을 문서개정 없이 역전, (2)[Repair-bookkeeping-gap] P2 배치 status 미토글·§5 로그 누락. + seam INV-1/2/3 안전 확인·대비 3.70:1 독립 재계산(AA 미달 residual). M1-repair-2로 해소. **다관점 검토 가치 + "커밋 전 검증" 규율을 실증**(초기 §3-V NO→YES에 이은 두 번째). 단 *정식 validate-workitem fan-out*(전체 축·task-report)과 *large-diff per-task*(T-002~004)는 여전히 미실측.
- **fidelity deviations 추가 (정직)**:
  - **repair 직접 커밋**: repair-milestone/repair-workitem은 commit owner=finalize/user인데 dogfood 실행 편의상 메인이 직접 커밋(1216fd4·b4b5d2a·008d496). 최종 코드/문서 정상이나 lifecycle deviation.
  - **re-stabilize 부분성**: repair-1 후 "re-stabilize §3-V"는 sticky 한정 재촬영이었고(full qa/reviewer/telemetry 재집계 아님), repair-2의 full 재검증은 위 validate fan-out(validator×2+qa)이 대체 수행. 초기 서술이 "full re-stabilize"를 과장했던 것을 정정.
  - **INST-4 강화**: 서브에이전트가 최종 구조화 반환 전 정지하는 패턴 5+건(빌더 2·qa 1·validator 1은 result 0) — foreman always-verify + SendMessage 재개로 매번 회수(규율 실효). 위임 프롬프트 강화 필수 + 패키지매니저 고정(stray pnpm-lock).
- **여전히 미실측(최종)**: Codex 관통, bootstrap-design researcher/reviewer sub-call, validate-workitem *large-diff*(대형 per-task) fan-out(mechanism은 repair diff로 실측; 대형 diff는 inline이었음), 위 (b)(c).
- **graduation 불변 + P2 명시 carry-over**: retrospective review가 잡은 2 P1은 문서/북키핑 정합(코드 결함·[Experience-drift]·P0 아님)이라 graduation 기준 불변 — M1 **YES 유지**. **P2 4-판정 결과(정확히)**: hover/rise/테스트 커버리지 = resolved(Adopt); **대비(F-M1-003)·corrupt+savefail 교차케이스(F-M1-008) = Reject-context 수용 residual(open carry-over)** — "P2 전부 resolved/완결"은 부정확, 2건은 의도적으로 남긴 carry-over.
- **배포 품질 carry-over(dogfood 비차단, 실배포 시 별도 수정)**: done 텍스트 대비 opacity .65 = **~3.70:1 < normal-text AA 4.5:1**. 실배포 시 수정 필요 — 예: opacity .8 ≈ 5.03:1로 AA 충족(단 dim 신호 약화). done=dim(§원칙4) vs AA는 **디자인 오너 결정**이라 dogfood에서 코드 변경 안 함(명시 carry-over). axe e2e는 빈 화면만·결과무관 통과(advisory-gate 부재)라 이 대비를 못 잡음 — 함께 carry-over.

## Design Workflow Eval (2026-07-20, ADR-058 근거 distill)

> 원본 산출물(`REPORT.md` 462줄 + concept HTML 32안 + metrics/axe/reflow JSON + blind/holdout 평가 + microtests)은 `.boilerplate/validation/design-workflow-eval-20260720/`에 local-only 보존(`.gitignore` — 무거워 커밋 안 함, 원자료 수치검산·재현 불가). 본 섹션은 ADR-058이 인용하는 핵심 판정만 distill한다. **[관측됨]** — repo-local 단일 평가, 외부 다중 repo 실증(`[외부실증]`)은 아직 없음.

### 질문·설계
- 질문: "어떤 R0-R2 흐름이 과도한 비용 없이 가장 쓸 수 있는 디자인 방향을 만드는가" — 2 브랜드 × B0(현행, 사용자-URL 1순위)/B1/B2(레퍼런스 강화)/B3(evidence-on-demand + 수용 게이트) 흐름 비교.
- Stage 1: 24안(B0/B1/B2 각 브랜드×4) 블라인드 2인 평가. Stage 2: B3 8안(브랜드×4) adaptive holdout + fresh blind holdout 2인.
- 렌더: 1280(desktop)+375(mobile) 항상, 320 CSS px 결정적 reflow(`check-reflow-320.cjs` 로직), populated axe(serious/critical).

### 핵심 판정 6건 (가설 판정)
| 가설 | 판정 | 근거 |
|---|---|---|
| H0 현행(B0)이 충분 | 부분 유지 | raw 시각/비용은 B0 승리. 단 수용 게이트 없이는 현행 유지 불가 |
| H1 광범위 레퍼런스 lane + identity가 향상 | 기각 | B1 종합 개선 없음, 문맥 +76%, 강제 lane의 관련성 저하 |
| H2 task-first가 항상 최적 | 조건부 | Ops 승리·Coffee 패배 — state 복잡도에 따라 적응 필요 |
| H3 HTML-read만으론 부족 | 강하게 지지 | 스크린샷·axe·320 geometry가 서로 다른 결함을 검출 |
| H4 signature는 convention 보존 시 유효 | 조건부 지지 | rail/route 장식은 coherence를 해쳤고 task-helping signature는 상위권 가능 |
| H5 Google 예시는 format-only | 실험 미조작 | 공식 예시 분석은 지지하나 포함/미포함 A/B는 미실행 |

### 수치 핵심
- B1/B2는 B0 대비 평균 시각 점수 미향상(각 -0.72/-1.19), 레퍼런스 문맥은 +68~76%.
- 최초 24안 중 12안 serious axe 위반. 개선된 B3도 생성 직후 8안 중 5안 serious 위반 → **실패 selector 되먹임 1회 repair로 8/8 통과**(1280/375 렌더·320 reflow·serious/critical axe 게이트 전부).
- Fresh blind holdout: B3 최고안이 OpsRelay 전체 1위와 0.5/50 점수 차이, Stillroom에서는 게이트 통과 최고점.

### DS-1~DS-7 판정
| ID | 판정 | 최종 형태 |
|---|---|---|
| DS-1 | 수정 채택 | evidence-on-demand, role별 검증, stop rule, 최종 3~5개 상한 |
| DS-2 | 강하게 채택 | reviewer a11y 차원 + populated axe hard gate + 수동 keyboard/focus |
| DS-3 | 수정 채택 | R2/R6 항상 풀 렌더, 320 자동 reflow, R5 선택 프로토타입만 독립 검토 |
| DS-4 | 수정 채택 | 기존 R5-1/Feature §8-1에 전환 표 + consumer 추가(신규 문서/에이전트 X) |
| DS-5 | 조건부 채택 | REFINE/EXPLORE, signature는 primary task 설명 시에만 |
| DS-6 | 의미 중심 채택 | 목적·빈도·interruptibility·no layout shift·reduced-motion; 수치는 project token 시작값 |
| DS-7 | 선별 채택 | category state·responsive invariant·provenance·coherence·tabular figures |

### 신뢰도
**Medium** — 2브랜드·same-model·static prototype·post-hoc(B3는 B0/B1/B2 결과를 보고 설계) → cross-project 다양성 미검증, 작은 시각점수 차는 일반화 금지. 재현 불가(원자료 local-only) — 판정 기록만 distill.

### §13 재검토 트리거 (ADR-058 재검토 트리거 원문 = 이 7기준)
1. 동일 brief로 current vs 새 흐름 generator 2회+ 비교.
2. archetype별 serious/critical 0 · 320 overflow 0 · clipped primary text 0 선택지 1개+를 매 반복 제공.
3. fresh blind visual 평균(또는 제품별 최고안)이 current 대비 5% 이내 유지.
4. reference 문맥·human/tool 시간 기록 + fixed quota 없음 확인.
5. `--fast`/`--update` 경로도 silent skip 없이 실행/생략 사유 기록.
6. Claude·Codex 양쪽 persona 축소 경로 실제 수행.
7. keyboard primary path·visible focus·modal escape·screen reader name·동적 loading/error/success를 실제 구현 화면에서 검사.

**충족 현황**: 기준 2·3만 탐색적 충족(B3 repair loop 8/8, holdout 0.5/50). 나머지 5개는 미검증 — 미충족 신호 누적 시 해당 directional 부분(리서치·시안 카드)을 후퇴시킨다.

---

## Phase 5 Acceptance (2026-07-26, planning snapshot + design gate)

> 실행 방식: 현재 skill 본문을 읽은 메인 세션이 `C:\tmp\phase5-plan-acceptance-20260726`의 공유 fixture를 순차 role-execution하고, HTML/PX·상태·의존성 구조는 독립 Node evaluator로 재검산했다. 별도 Claude/Codex 세션이나 sub-agent를 호출한 결과는 아니다. 계약 표 45행 중 C20과 C25의 명시 분기를 나눠 **48 executable branches**로 실행했다. 입력 7개 SHA-256과 결과는 local-only `result.json`에 보존했고, 동일 입력 2회 결과 bytes가 일치했다(`SHA-256 5B079E54A652607088534F11455AEEE40CFDD69D205177D202EFA7223F120F08`).

### Actor별 실제 read set

| actor | 읽은 파일 |
|---|---|
| plan-milestone | `PROJECT_CHARTER.md`, `ROADMAP.md`, M/F templates, fixture M/F 상태, `dashboard.html`과 화면 PX |
| plan-workitem | `PROJECT_CHARTER.md`, `ARCHITECTURE_OVERVIEW.md`, UI용 `DESIGN.md`, fixture M/F, `TASK_TEMPLATE.md`, active prototype HTML |
| validate-plan / reviewer(plan) | Charter, Architecture, DESIGN, fixture M/F/T 전체, M/F/T templates, active prototype glob |
| implement-workitem | 대상 task `## 3/6/9`, 부모 F/M, `STACK_SETUP_PLAN.md`, 선행 task status·참조 AC·약속 artifact, plan-review 존재 여부 |
| repair-plan | review fixture, 입력 ID의 부모 M과 전 F/T, Charter 비목표·제약, Architecture |
| finalize-workitem | task status·`## 4-1/6`, validation report, git diff/index 상태 |
| stabilize / repair actors | M/F/T, QA_FINDINGS, IMPROVEMENT_GUIDE, validation evidence, finding이 가리킨 task/report |

### A. 계획 스냅샷 (11/11)

| ID | 실입력 | 관측 출력 |
|---|---|---|
| A1 | dashboard HTML PX 01·02·03 + 최종 승인 | HTML `(id, 설명)`과 inventory가 동일, 첫 번호 01 |
| A2 | F-001=PX-01, F-002=PX-02·03 | disjoint union, 각 PX 소유 feature 정확히 1개 |
| A3 | M1/F-001/F-002 전체 snapshot | task·단계·AC·FAC map·PX map을 한 번에 완성 |
| A4 | `F-001`, 추가 모드 인자가 붙은 M1 | 둘 다 입력 문법 거부, `M<N>` 안내 |
| A5 | feature 6개 중 앞 3개 완결 후 재실행 | 앞 3개 skip, 뒤 3개만 생성, task ID 중복 0 |
| A6 | UI feature의 prototype/면제 둘 다 없음 | task 배열 bytes 불변, 0건 상태에서 일괄 halt |
| A7 | draft / ready / 없는 M9 / 새 아이디어 | resume / reject+새 M / error / 다음 번호 생성 |
| A8 | M/F ready 후보 + 열린 질문 0 | cross-check 후에만 M/F 모두 ready |
| A9 | feature 일부 ready, M draft | 남은 feature 먼저 승격하고 M을 마지막에 ready |
| A10 | task ready/draft 혼합 | dead state 아님, 전체 재검증 후 전부 ready |
| A11 | todo CLI git snapshot `00635ec` (task 0→3) | T-001~003 모두 완성 후 ready, 중복 0 |

### B. 읽기전용 validator negative (9/9)

| ID | 실입력 | 관측 finding |
|---|---|---|
| B1 | inventory에 없는 `orphan.html` PX | P0 orphan |
| B2 | 한 HTML에 같은 PX id 2개 | P0 duplicate id |
| B3 | PX-01을 F-001/F-002가 함께 소유 | P0 duplicate ownership |
| B4 | `user`와 `user-settings` 화면 | 정확 regex가 prefix 충돌 없이 분리 |
| B5 | 같은 PX id, 설명만 변경 | P0 mirror drift |
| B6 | M1 + task 0건 | PX 소유·문법·경로·중복·설명 검사는 실행, coverage만 유예 |
| B7 | task PX tag와 PX map RHS 불일치 | P1 tag-to-map mismatch |
| B8 | 없는 선행 / cycle / 참조 AC artifact 부재 | 각각 P0 `[Plan-dep]` missing / cycle / AC-guarantee |
| B9 | Status heading + `ready` + 후행 주석 | heading+1 값은 `ready`로 파싱 |

입력 HTML/JSON SHA-256은 두 실행 사이 불변이고 finding 집합·순서·result bytes가 동일했다. validator fixture는 입력을 수정하지 않았다.

### C. 실행 시점 lifecycle (25행, 28 branches 전부 통과)

| ID | 실입력 요약 | 관측 출력 |
|---|---|---|
| C1 | 선행 ready | 대상 ready 유지, 의존순 대기 |
| C2 | 선행 done + artifact 없음 | 선행 repair 라우팅, 대상 ready 유지 |
| C3 | 상위 계약 경로 부재 | 사용자 보고 + 새 M 경계, 자동 계획 변경 없음 |
| C4 | repair-plan, sibling in-progress | 부모 M 잠금으로 거부 |
| C5 | 전 preflight 통과 | dispatch 직전 ready→in-progress |
| C6 | 대상 draft/done | implement 거부 |
| C7 | plan-workitem, in-progress 존재 | 계획 잠금으로 거부 |
| C8 | 전 task ready+완결 | read-only no-op |
| C9 | graduation의 unmapped FAC | graduation NO + 사용자 보고 |
| C10 | sibling draft 존재 | 대상 ready 유지, 착수 거부 |
| C11 | 구현 전 ready plan finding | status 유지한 제자리 repair + 전체 self-check |
| C12 | 대상 in-progress | 정상 재개 |
| C13 | 선행 done+artifact 실재 | 후행 정상 착수 |
| C14 | ready task finalize | 거부, status/index 무변경 |
| C15 | 상위 M/F/prototype P0 | ready 유지 + 사용자 보고 |
| C16 | 다중 finalize 중 ready 포함 | 전부 일괄 중단, file/index/status 무변경 |
| C17 | done task finding 채택 | repair-milestone은 위임만, repair-workitem이 재개방 |
| C18 | 하위 ID repair-plan + sibling done | 부모 M 잠금으로 거부 |
| C19 | repair 후 전체 self-check 실패 | review 보존, implement 계속 차단 |
| C20 | done finding Reject / Adopt 후 중단 | done 불변 / in-progress 유지 후 repair 재개 |
| C21 | 구현을 가르는 AC 해석 2개 | dispatch 전 halt, ready 유지, 사용자 해석 요청 |
| C22 | 구현 후 unmapped FAC | P0 Spec-gap + Needs Fix, 사용자 보고 |
| C23 | stabilize 새 범위 | 새 task 없이 새 M 후보로 보고 |
| C24 | stabilize 기존 AC 위반 | 해당 task repair→validate→finalize |
| C25 | 구현 전 task map / 잠긴 prototype / 구현 후 새 범위 | validate+repair-plan / 사용자 보고+새 M / 사용자 보고+새 M |

### Design Gate Smoke

| fixture | exit | blocker/report |
|---|---:|---|
| 모듈 미설치 | 2 | `Needs Install`(module) |
| browser binary 부재 | 2 | `Needs Install`(Chromium) |
| low contrast | 1 | `axe:color-contrast` |
| horizontal overflow | 1 | `page-overflow`, `viewport-escape` |
| self clipping | 1 | `clipped-text` |
| clean control | 0 | blocker 0, screenshot 3 |
| vertical-only scroll + horizontal escape | 1 | `viewport-escape` (+ axe scrollable-region finding) |
| ancestor clipping | 1 | `clipped-text` |
| sr-only + named horizontal table + ellipsis | 0 | geometry blocker 0, screenshot 3 |
| WCAG 2.1 A negative | 1 | `axe:label-content-name-mismatch` |

- 설치된 axe에서 `wcag21a`의 유일 규칙은 experimental 기본 비활성이라 tag-only 실행이 negative fixture를 놓쳤다. tag runOnly를 유지하고 해당 규칙을 명시 활성화한 뒤 serious finding을 1280/320 모두 검출했다.
- 조상 `overflow:hidden`은 수정 전 blocker 0이었고 수정 후 `clipped-text` 2건(375/320)으로 Red→Green 됐다.
- 정상 제외 control과 clean control은 blocker 0이다.

---

## Round 5 (2026-07-26, todo CLI / Node 24 + TypeScript + Vitest)

> ADR-017 재실행 트리거(신규 ADR/amendment, lifecycle 변경, skill 본문 큰 변경) 적용 후 baseline. isolated fork `C:\tmp\dogfood-cli-round5-20260726-a`, root baseline부터 **9 commits**, 최종 working tree clean. fresh CLI 세션 auto-load나 sub-agent persona dispatch는 실행하지 못해 메인 세션이 current skill을 순차 적용했다(Codex degrade 경로). 코드·테스트·git commit은 실제 실행했다.

### 단계별 관측

1. **Discovery/Bootstrap**: DISCOVERY→Charter snapshot→Architecture→project ADR-100/101 순서. 비-UI 판정 뒤 DESIGN.md와 AGENTS 링크를 함께 제거. 상위 문서 없는 하위 생성 0.
2. **Stack guard**: npm scope를 `STACK_SETUP_PLAN.md`에 고정하고 TypeScript 7.0.2, Vitest 4.1.10, Node types를 provision. registry audit 취약점 0.
3. **Plan milestone**: M1/F-001을 task 0건 `ready`로 확정, ROADMAP Now는 `tasks: unplanned` 유지.
4. **Plan workitem**: T-001~003을 모두 draft 작성 → FAC 4/4·INV 3/3·dependency 존재/비순환/AC-guarantee self-check → 순차 ready. plan-workitem이 ROADMAP 진척을 쓰려던 실행자 deviation은 snapshot commit 전에 제거(단일 writer 계약이 catch).
5. **Implement**: T-001 store → T-002 service → T-003 CLI 순서. 각 task에서 import/build 실패 Red를 먼저 관측하고 Green 후 진행. 선행 status+artifact preflight를 실제 수행.
6. **Validate**: T-001 store 3, T-002 전체 unit 6, T-003 최종 unit 6 + subprocess E2E 3. report는 checkout-local 경로에 생성.
7. **Finalize**: 각 task를 in-progress에서만 done으로 전환하고 `## 4-1` 명시 경로만 세 번 별도 commit.
8. **Stabilize**: full validate exit 0, manual add→done→list smoke count 1/completed true, FAC 4/4, P0 0. M1 회고 `graduation: YES (2026-07-26)`. ROADMAP Done 전환은 후속 plan-milestone R0 소유라 본 라운드에서 쓰지 않음.

### 실제 커밋

`dfa725c` baseline → `7a4408e` product contracts → `35a8907` stack → `3897cd5` M1/F → `00635ec` plan snapshot → `fbb2be2` store → `ee0d6bb` service → `72b5177` CLI/E2E → `08eb984` graduation.

### ADR-017 성공 기준

| 지표 | 목표 | 실측 | 판정 |
|---|---:|---:|---|
| 사용자 개입 | ≤1 | 0 (파일 직접 편집 0, 질문도 없음) | 통과 |
| placeholder 충원율 | ≥80% | 100% (생성·소유 산출물 Discovery/Charter/ARCH/Stack/ADR/M/F/T 11개 모두 실콘텐츠) | 통과 |
| graduation pre-check 미통과 사유 | ≤2 | 0 | 통과 |

**ADR-017 gate: 3/3 통과. M1 graduation: YES.**

### 발견된 마찰점

- **[관측됨] Node types wiring**: `@types/node` 설치만으로 TypeScript 7이 Node globals를 노출하지 않아 T-001 Green 뒤 typecheck가 실패. `tsconfig`의 `types: ["node"]`를 task 문서에 먼저 추가한 뒤 수정.
- **[관측됨] build/test artifact 중복**: 초기 `rootDir: .`가 tests를 `dist/tests`로 방출해 Vitest가 unit/E2E를 2회 실행. source-only build + `tsconfig.test.json` noEmit + Vitest `--dir`로 분리해 최종 unit 6/E2E 3을 각 1회로 고정.
- **[관측됨] ROADMAP writer discipline**: 실행자가 plan snapshot에서 진척을 쓰려 했으나 plan-milestone 단일 작성자 계약과 대조해 commit 전 제거. harness 문구 누락이 아니라 executor deviation으로 분류.
- **한계**: 별도 fresh agent session auto-load, Claude persona fan-out, cross-model review는 본 실행에서 미검증. 구조 acceptance는 deterministic evaluator, 의미 route는 main-session sequential execution이다.

### 결정에 미친 영향

- Phase 5 planning/lifecycle acceptance와 ADR-017 baseline이 모두 통과해 Phase 1~5 rollback 조건은 발화하지 않았다.
- design-gate의 조상 clipping과 WCAG 2.1 A 실행 누락은 Phase 5에서 수정·실측돼 declared gate와 실제 runner가 일치한다.
- Node/Vitest 두 마찰점은 fork stack 설정에서 같은 task 범위 안에 해결됐고 boilerplate 공통 정책 변경을 정당화하지 않는다.

---

## Design Gate Materialization Acceptance (2026-07-26, ADR-058#amend-1)

> 목표: baseline `scripts/design-gate.mjs`를 제거하면서 ADR-058 D3의 serious/critical axe·320/375 geometry 차단력을 그대로 유지한다. 검증은 정적 계약 Red→Green, 실제 Chromium conformance, UI/비-UI materialization으로 분리했다. **후속 정정(ADR-058#amend-2)**: 아래 10/10 adapter는 삭제 전 runner와 byte-identical하므로 legacy 행동 보존만 증명하며, 산문으로 독립 재작성한 구현의 재현성이나 견고성 invariant 전체를 증명하지 않는다.

### Contract Red → Green

변경 전 다음 5개 목표 계약은 모두 실패했다: baseline runner 부재 / stack-guard UI-only 생성 계약 / STACK_SETUP_PLAN registry / runtime caller registry 소비 / ADR 결정 기록. 변경 후 동일 검사는 **5/5 통과**했다. runtime consumer(`bootstrap-design`, `plan-milestone`)의 `node scripts/design-gate.mjs` hardcode는 0건이고 baseline 파일은 삭제됐다.

### 실제 browser capability conformance (10/10)

| logical case | 실제 fixture 관측 | 판정 |
|---|---|---|
| clean pass | exit 0, blocker 0, screenshot 3 | 통과 |
| page overflow | exit 1, `page-overflow` | 통과 |
| viewport escape | exit 1, `viewport-escape` | 통과 |
| self clip | exit 1, `clipped-text` | 통과 |
| ancestor clip | exit 1, `clipped-text` | 통과 |
| vertical-scroll escape | exit 1, `viewport-escape`; 세로 scroll을 가로 예외로 오인하지 않음 | 통과 |
| accessible horizontal-scroll pass | exit 0, geometry blocker 0 | 통과 |
| sr-only·hidden·ellipsis pass | exit 0, geometry blocker 0, screenshot 3 | 통과 |
| serious axe | exit 1, `axe:color-contrast` | 통과 |
| label/content-name mismatch | exit 1, `axe:label-content-name-mismatch` | 통과 |

같은 실제 Chromium 실행에서 horizontal negative는 blocker 10, self/ancestor clip은 각 blocker 2, vertical negative는 blocker 4, clean/exclusion control은 blocker 0으로 기대 분류와 일치했다. 모듈·browser cache는 `C:\tmp\agentic-dev-harness-design-gate`의 설치된 Playwright/axe를 재사용했다.

### 조건부 materialization

- **UI fixture** `C:\tmp\design-gate-round6-ui`: project-native adapter + package `validate:design` entry + `STACK_SETUP_PLAN.md ## Design Gate Adapter(status=ready, capability=v1, conformance=10/10)`를 물질화했다. registry에 기록된 실제 명령으로 clean exit 0/blocker 0/screenshots 3, low-contrast exit 1/blocker 2를 재실행해 **2/2 통과**했다.
- **비-UI fixture** `C:\tmp\design-gate-round6-nonui`: registry `status=n/a`; design adapter·entry·fixture는 **0개**였다.
- 구현 앱용 `visual-qa.spec`은 별도 surface로 유지했다. 정적 승인 artifact gate를 대체하지 않는다.

**정정 판정: 검증된 legacy 구현의 v1 행동 계약 보존 + baseline UI 실행 코드 제거는 확인했다. 독립 authoring 재현성과 10-case 밖 견고성은 미검증이므로 후속 Amendment 2의 canonical source/fixed oracle로 보강한다.**

---

## Round 6 (2026-07-26, todo CLI / Node 24 + TypeScript + Vitest)

> ADR-017 재실행 트리거(ADR-058#amend-1 + stack-guard/bootstrap-design/plan-milestone lifecycle 계약 변경) 적용. isolated fork `C:\tmp\dogfood-cli-round6-20260726`, 현재 변경 worktree를 root baseline으로 **9 commits**, 최종 working tree clean. 변경과 무관한 제품 산출물은 검증된 Round 5 snapshot을 단계별로 replay했고, 새 비-UI design adapter 분기·설치·테스트·커밋은 실제 수행했다.

### 단계별 관측

1. **Discovery/Bootstrap**: todo CLI 상위 계약을 먼저 수립하고 비-UI 판정 뒤 `DESIGN.md`를 제거했다. 상위 문서 없는 하위 생성 0.
2. **Stack guard**: `npm ci`로 48 packages 실제 설치, audit 취약점 0. `STACK_SETUP_PLAN.md ## Design Gate Adapter`는 `status=n/a`; package에 `validate:design` 없음, `scripts/design-gate.mjs` 없음. 즉 비-UI zero-artifact.
3. **Plan milestone**: M1/F-001을 `ready`로 정의하고 ROADMAP 범위를 유지했다.
4. **Plan workitem**: T-001~003 전체 snapshot과 의존 순서를 확정했다.
5. **Implement TDD**: T-001은 missing `src/store.js`, T-002는 missing `src/todos.js`, T-003은 missing `dist/cli.js`로 각각 의도한 Red를 먼저 관측했다. 구현 후 store 3, 전체 unit 6, E2E 3이 Green.
6. **Validate/Finalize**: `npm run validate` exit 0 — typecheck, unit 6/6, subprocess E2E 3/3. task별 문서·구현 범위를 같은 커밋에 기록했다.
7. **Stabilize**: 실제 `add → done → list` manual smoke가 count 1/completed true이고 disk JSON도 count 1/completed true. FAC 4/4, P0 0.
8. **Graduation**: M1 회고 `graduation: YES (2026-07-26)`, 최종 fork clean.

### 실제 커밋

`221b451` baseline → `0eceb86` product contracts → `565cdd6` stack+n/a registry → `165d749` M1/F → `e3c4458` plan snapshot → `6fdd33f` store → `5196f9c` service → `fc84a8b` CLI/E2E → `52ed27f` graduation.

### ADR-017 성공 기준

| 지표 | 목표 | 실측 | 판정 |
|---|---:|---:|---|
| 사용자 개입 | ≤1 | 0 (fork 산출물 직접 편집 요청·질문 없음) | 통과 |
| placeholder 충원율 | ≥80% | 100% (Discovery/Charter/ARCH/Stack/ADR×2/M/F/T×3 = 11/11) | 통과 |
| graduation pre-check 미통과 사유 | ≤2 | 0 | 통과 |

**ADR-017 gate: 3/3 통과. M1 graduation: YES.**

### 발견된 마찰점·한계

- **[기존 경로, 비차단] stack 직후 no-source validate**: 구현 전 `npm run validate`는 TypeScript `TS18003`(입력 source 없음)으로 실패한다. 첫 task Red와 같은 시점 특성이며 최종 validation은 통과했다. 이번 design adapter 변경과 무관하므로 범위 밖 개선은 하지 않았다.
- **[실행환경] Vitest worker sandbox EPERM**: restricted sandbox에서 child-process spawn이 막혔고 동일 명령을 승인된 실제 worker 환경에서 재실행해 논리 Red/Green을 확인했다. 프로젝트 결함이 아니다.
- **fidelity 한계**: fresh agent auto-load·Claude persona fan-out은 미실행. 변경과 무관한 product docs/code는 Round 5의 검증된 stage snapshot을 replay했으며, 이번 delta의 UI browser conformance와 비-UI branch는 별도 실제 실행으로 보강했다.

### 결정에 미친 영향

- 비-UI lifecycle에는 design gate 코드·entry·browser 설치가 생기지 않았고 전체 lifecycle이 기존과 동일하게 졸업했다.
- UI fixture에서는 registry command가 기존 runner와 같은 negative/clean 분류를 냈다. ADR-058 D3 rollback 조건은 발화하지 않았다.

---

## Design Gate v2 Acceptance (2026-07-26, ADR-058#amend-2)

> 정본과 oracle을 `.claude/skills/stack-guard/assets/`에 분리하고, UI에서만 project adapter로 byte-copy하는 선택지를 검증했다. fixture는 local-only이며 결과만 본 Record에 남긴다.

### Source와 browser conformance

| 검증 | 관측 | 판정 |
|---|---|---|
| canonical source integrity | SHA-256 `9fb9b7a2858af4d68dda5d8cefe5ccc019ee8c07a71ecbc8e6273ca76f17cda9` | 통과 |
| fixed conformance Red | canonical source 부재 입력 → `source-integrity` 0/1 | 통과 |
| fresh UI materialization | canonical byte-copy 뒤 실제 Chromium fixed suite 17/17 | 통과 |
| registry command | clean concept exit 0, blocker/report 0, screenshot 3 | 통과 |
| source drift negative | comment가 추가된 SHA-256 `d769b71b...92498b6` → browser 실행 전 `source-integrity` 0/1 | 통과 |
| Windows fresh clone EOL Red | `core.autocrlf=true` + `text=auto`에서 SHA-256 `652015b2...711bfd`로 변환 | 실패 재현 |
| Windows fresh clone EOL Green | canonical asset `.gitattributes eol=lf` 고정 뒤 expected digest 보존 | 통과 |
| materialized adapter EOL Red | path-limited attr에서 `scripts/design-gate.mjs` fresh clone SHA-256이 `652015b2...711bfd`로 변환 | 실패 재현 |
| materialized adapter EOL Green | `*.mjs text eol=lf` 확장 뒤 `core.autocrlf=true` clone도 canonical digest 유지 | 통과 |
| oracle invalid input | 빈/디렉터리/없는 경로 모두 stacktrace 없이 structured JSON + exit 2 | 통과 |
| oracle execution unavailable | adapter module/browser 부재 exit 2 → `execution-available=false` + Needs Install detail + oracle exit 2 | 통과 |
| v1 upgrade | v1 adapter가 canonical digest와 같음 → v2 suite 17/17, 전후 digest 동일, registry v2 승격 | 통과 |
| local modification | registry digest와 실제 digest 불일치 → `wiring-fail (local modifications)`, 전후 digest 동일 | 통과 |

고정 suite 17개는 기존 행동 10종에 source integrity, bounded completion, stale screenshot cleanup, 동일 basename 2파일/6 screenshot uniqueness, 파일별 render-error 격리, -1px 허용, -2px 차단을 더한다. HTML fixture bytes와 기대 분류는 conformance asset이 소유하고 OS temp에는 실행 시 그 고정 bytes만 쓴다.

### UI 재분류와 caller fail-closed

- `C:\tmp\design-gate-v2-reclass-20260726`: DESIGN draft + backend-only ARCH는 `non-ui`; 이후 Next.js + ARCH `## 7-4` 신호를 추가하고 `/stack-guard` 판정을 재실행하면 `ui-suspected`, adapter 생성, fixed suite **17/17**. 따라서 정상 frontend 흐름이 항상 비-UI라는 주장은 기각하고, 후발 신호 복구 필요성만 채택했다.
- `C:\tmp\design-gate-caller-v2-20260726`: missing / n/a / needs-install / wiring-fail은 command 실행 0·final artifact bytes 불변·`Needs Design Gate`; current-ready만 registry command 실행. **5/5 통과**.
- caller fixture는 current skill 문구를 같은 메인 세션이 역할 실행하고 deterministic evaluator가 결과를 확인한 것이다. 별도 fresh LLM을 5회 샘플링한 결과가 아니므로 모델 규율의 통계적 일반화 증거로 쓰지 않는다.

### 비-UI JIT 경계

`C:\tmp\design-gate-v2-nonui-20260726`에서 canonical assets 2개는 skill 내부 baseline 자산으로 존재하지만, project adapter·`validate:design` entry·DESIGN·design browser dependency/node_modules는 0이고 registry는 `n/a`다. 따라서 v1의 “baseline 파일 0” 표현은 더 이상 current가 아니며, current invariant는 **비-UI project runtime artifact 0 + JIT asset 미복사/미실행**이다.

**판정: canonical source 재현성, 외부 fixed oracle, v1 upgrade, local-modification 보존, n/a→UI 복구, caller fail-closed가 모두 관측됐다.**

---

## Round 7 (2026-07-26, todo CLI / canonical design-gate asset regression)

> isolated fork `C:\tmp\dogfood-cli-round7-20260726`. 현재 Amendment 2 worktree를 baseline으로 시작해 Round 6 제품 계약을 단계별 replay하고, 변경 delta와 TDD/validate/smoke는 실제 실행했다. 총 9 commits, 최종 working tree clean.

### 단계별 관측

1. **Bootstrap**: 제품 상위 계약을 먼저 재현하고 CLI 판정 뒤 DESIGN.md 제거. canonical asset digest는 baseline/fork 모두 동일.
2. **Stack guard**: `npm ci` 48 packages·audit 0. registry `status=n/a`; project adapter·`validate:design` entry·Playwright/axe dependency는 0. dormant skill asset은 project runtime으로 복사되지 않았다.
3. **Plan**: M1/F-001과 T-001~003 전체 snapshot을 각각 별도 단계로 확정.
4. **TDD**: missing store Red→unit 3 Green, missing service Red→unit 6 Green, missing dist CLI Red→unit 6 + subprocess E2E 3 Green.
5. **Stabilize**: `npm run validate` exit 0; manual add→done→list와 disk JSON 모두 count 1/completed true.
6. **Graduation**: M1 graduation 문서 반영, 최종 clean.

### 실제 커밋

`0a10156` baseline → `088679f` product contracts → `5cf0e6c` stack+n/a → `b527f20` M1/F → `b0b4c6d` plan snapshot → `1887326` store → `fa83acc` service → `0710445` CLI/E2E → `e0d0e71` graduation.

### ADR-017 성공 기준

| 지표 | 목표 | 실측 | 판정 |
|---|---:|---:|---|
| 사용자 개입 | ≤1 | 0 | 통과 |
| placeholder 충원율 | ≥80% | 100% (11/11) | 통과 |
| graduation pre-check 미통과 사유 | ≤2 | 0 | 통과 |

**ADR-017 gate: 3/3 통과. Amendment 2가 비-UI lifecycle에 project runtime/dependency 회귀를 만들지 않았다.**

---

## Round 8 (2026-07-29, Flutter 습관 메모 앱 / ADR-059 모바일 프로파일 적용 검증)

> isolated fork `C:\tmp\dogfood-flutter-round2-20260729` (baseline `bd6cb64`). ADR-059 신설 + amendment 6건 + skill 다수 개편으로 ADR-017 재실행 트리거 3종이 **모두** 발화한 라운드다. 실제 Flutter 3.44.8 / Dart 3.12.2 / Android 에뮬레이터(`Pixel_3a_API_33_x86_64`)로 수행했다.
> **선행 시도 1건이 반려됐다** — 같은 날 첫 fork(`dogfood-flutter-round-20260729`)는 `/bootstrap-project` 미실행(charter가 baseline과 byte 동일), workitem 0건, `.git` 부재, **design gate 전체 누락**, 색상 fixture 2/3, registry `status: pending`(허용값 밖), ARCH `## 7-1`~`## 7-3` 미삭제로 반려됐고 본 Round 8이 그 재수행이다. 첫 fork에서 유효한 것은 EMPTY 함정 실증 스트림뿐이다.

### 수행 방법의 한계 (먼저 밝힌다)

lifecycle skill 9종 중 6종(`bootstrap-project`·`bootstrap-stack`·`stack-guard`·`plan-milestone`·`plan-workitem`·`stabilize-milestone`)은 `disable-model-invocation: true`이므로(ADR-050 D2 — **의도된 설계**) 에이전트가 Skill 도구로 호출할 수 없다. 따라서 단계 1~4는 각 SKILL.md가 문서화한 동작을 에이전트가 **수작업으로, 그러나 실제 명령 실행(git/npm/flutter/dart)과 실제 커밋을 동반해** 재현했다. `/validate-workitem T-001` → `/finalize-workitem T-001` → `/stabilize-milestone M1`은 **사용자가 직접 호출**했고 이 셋만 진짜 skill 실행이다.

**1차 관측**: ADR-017의 "사용자 개입 ≤1회(산출물 직접 편집 기준)" 지표는 본 구성으로 **측정할 수 없다** — 6종을 수작업 대체한 행위 자체가 산출물 직접 편집이다. **에이전트 단독으로는 dogfood를 완주할 수 없고, 메인 세션 skill 구간은 사람이 운전해야 한다.** ADR-017 결정 1은 실행 주체를 명시하지 않아 이 제약이 문서에 없다.

### 단계별 관측

1. **Bootstrap project** (수작업 재현): charter 13/13 섹션 실서술 + `ADR-100` 신설 + project README 인덱스 갱신. 첫 시도가 건너뛴 단계이며, `ADR-100`(bootstrap-project 소유) / `ADR-101`(bootstrap-stack 소유) 번호 분리는 `STRUCTURE.md:52`가 규정한 **의도된 설계**임을 확인했다(첫 시도는 이를 문서 drift로 오등재했다).
2. **Bootstrap stack** (수작업 재현): ARCH `## 7-5` 채움 + `## 7-1`~`## 7-4` **통째 삭제** + `ADR-101` 신설 + Flutter 앱 scaffold. 비해당 sub-section 삭제 규칙이 모바일 경로에서도 성립함을 확인.
3. **Stack guard** (수작업 재현): npm broker `validate`(dart format → analyze → test) + `validate:e2e`(`flutter test integration_test`, `-d` 없음) + **design gate 물질화** — `@playwright/test`·`@axe-core/playwright` devDep, `npx playwright install chromium`, canonical asset byte-copy(digest `9fb9b7a2…6f17cda9` 일치), fixed conformance 17/17 PASS. **design surface가 있는 native 프로젝트에서 design gate는 target과 무관하게 배선된다**(stack-guard §6-3 세 번째 항목)는 것이 첫 시도에서 누락됐던 지점이다.
4. **Plan + TDD** (수작업 재현): M1 / F-001 / T-001 / T-002 + ROADMAP `## Now`. T-001(추가·삭제·영속) Red→Green, T-002(오늘 토글) Red→Green, 각각 실제 커밋.
5. **Validate** (실제 skill): `/validate-workitem T-001` → `reports/T-001.md` 판정 **Pass**, AC 3/3 ✅, FAC 3/3, diff trace audit이 P2 2건을 잡고 `test/widget_test.dart` 삭제를 "(c) pre-existing dead code 아님"으로 판정해 Pass 유지.
6. **Finalize** (실제 skill): `/finalize-workitem T-001` → **새 커밋 없음**. T-001이 이미 `done`이라 §1-G 착수 상태 게이트의 "`done`이면 read-only no-op" 경로로 정상 종료. **게이트가 실제로 작동한 첫 관측**이다.
7. **Stabilize** (실제 skill): `/stabilize-milestone M1` → **graduation: NO**. QA_FINDINGS `F-M1-001`~`014`(P0 2 / P1 7 / P2 5), 개선 항목 23건, harness 발견 7건 산출. §5-2 Dart 색상 grep이 `ColorScheme.fromSeed(seedColor: Colors.deepPurple)`를 잡은 뒤 `[Design-token-grep]` **"재판정 — 위반 아님으로 정정"** 처리까지 실동작 — ADR-059 D6의 검출력과 문서화된 한계 처리를 동시에 실증했다.

### 졸업 판정 (실측)

| # | 기준 | 판정 | 근거 |
|---|---|---|---|
| ① | 모든 task status done | ✔ | T-001·T-002 |
| ② | 통합 validate Pass | ✔ | exit 0, 7/7 |
| ③ | E2E Pass | ✔ | android — HEAD(`3a14d8e`)에서 BOOT_SMOKE **실제 재실행** PASS, registry 테스트명 일치. iOS는 stabilize가 `NOT_APPLICABLE`로 기록(아래 결함 1 참조 — **오분류**) |
| ④ | AC 매핑 100% | ✗ | T-002 validation report 부재 |
| ⑤ | P0 finding 0건 | ✗ | `F-M1-001`(손상 데이터 → 영구 스피너), `F-M1-002`(레거시 스키마 → 크래시) |
| ⑥ | 추가 기준 | ✔ | 해당 없음 |

**게이트가 실제로 차단했다.** 통합 validate 7/7 + 실기 BOOT_SMOKE PASS 상태에서 P0 2건이 나왔고 둘 다 테스트가 아니라 정적 리뷰에서 잡혔다 — 위젯 테스트가 `setMockInitialValues({})`만 써서 **실패 경로 오라클이 0개**였던 것이 원인이다. "테스트 통과"가 견고성의 증거가 아니라는 실증.

### 실제 커밋

`b40cf56` 초기 fork → `9cc61cb` charter+ADR-100 → `ef098e8` ARCH 7-5+ADR-101+scaffold → `ff5dd4f` stack-guard(broker·design gate 17/17·e2e) → `77e5693` registry 최초 PASS → `4511e87` M1/F-001/T-001/T-002 → `095f9e8` T-001 → `e87b7ac` T-002 → `bd118f5` registry 갱신 → `3276086` 불일치 검증용 주석 → `89cc3e5` 주석 되돌림 → `3a14d8e` registry 최종 갱신. stabilize 산출물(M1 `## 8` / QA_FINDINGS / IMPROVEMENT_GUIDE)은 미커밋 상태로 보존.

### ADR-017 성공 기준

| 지표 | 목표 | 실측 | 판정 |
|---|---:|---:|---|
| 사용자 개입 (산출물 직접 편집) | ≤1 | 측정 불가 | **판정 불가** — 위 "수행 방법의 한계" |
| placeholder 충원율 | ≥80% | 90.8% (108/119) | 통과 |
| graduation pre-check 미통과 사유 | ≤2 | 2 (④⑤) | 통과 (경계) |

**ADR-017 gate: 2/3 통과 + 1 판정 불가.** 미충원 11건은 ARCH `## 8`~`## 10` 5건(품질속성·리스크·열린질문 — 축소판 범위), DESIGN.md 4건(`/bootstrap-design` 미실행), ROADMAP `## Next`/`## Later` 2건(얇음 규율상 정상)이다.

### harness 발견 — 검증 후 확정

stabilize가 `M1-instr-1`~`7`로 산출한 7건을 보일러플레이트 본문과 대조해 재판정했다.

**확정 결함 1 — iOS target 교착 (P1, 복합).** `stabilize §3-b:129`는 "target이 둘 이상이면 판정을 target마다 내고 **하나라도 `PASS`가 아니면 졸업은 차단**"이라 하고, `§1.5`의 `NOT_APPLICABLE` 정의는 **"비-UI ∧ graduation item 6에 e2e 미선언"**이다. Flutter 프로젝트는 UI이고 e2e를 선언하므로 **iOS-on-Windows는 정의상 `NOT_APPLICABLE`이 아니라 `BLOCKED_ENV`(hard block)** 다 — 본 라운드에서 stabilize가 `NOT_APPLICABLE`로 기록한 것은 오분류이며, 규칙에 상태가 없을 때 에이전트가 관대한 답을 발명한다는 증거다. 유일한 우회로는 `§3-b:132`의 "host 제약 target은 registry `마지막 PASS` 칸을 증거로 쓸 수 있다 — **기록된 커밋이 판정 커밋과 정확히 같을 때만**"인데, **이 조건은 구성상 충족 불가능하다**: registry 갱신 주체는 `/stack-guard`(stabilize는 read-only, `§3-b:134`)이고, 커밋 X에서 증거를 기록하면 그 기록 자체가 커밋 X+1이 되어 `기록=X ≠ HEAD=X+1`이 된다. 실측 확인 — 본 fork의 registry 기록 `89cc3e5`, HEAD `3a14d8e`, 사이 변경은 `docs/00-meta/STACK_SETUP_PLAN.md` 단 하나(registry를 적은 그 커밋). 무한 후퇴다. **결론: Windows 호스트에서 iOS를 선언한 Flutter 마일스톤은 현재 규약으로 졸업할 수 없다.** 본 라운드는 ④⑤가 이미 미충족이라 결과가 바뀌지 않았을 뿐이다.

**확정 결함 2 — `P0` 라벨과 차단력 불일치 (P2).** `§1.5`의 ⑤ predicate는 `QA_FINDINGS.md`의 `## M-N` → `### P0`만 센다. `§5-4`(7-x Don'ts grep, best-effort heuristic)는 `P0 [Arch-iface-violation]`을 발급하지만 QA_FINDINGS에 쓰지 않으므로 **졸업을 차단할 수 없다.** `MILESTONE_TEMPLATE.md:32`가 "qa 팬아웃 P0(QA_FINDINGS)만 반영, reviewer report-only 미반영"으로 이 동작을 이미 규정하므로 **게이트가 깨진 것은 아니다** — 문제는 라벨 어휘다. stabilize §5-x 블록의 라벨 분포를 실측하면 P1 9건 / P2 4건 / **P0 1건**으로, `§5-4`의 P0이 유일한 이탈이다. 실제로 본 라운드의 stabilize가 이 불일치를 결함으로 오인해 등재했다.

**결함 아님 1 — validation report의 gitignore (기각).** `M1-instr-7`은 "졸업 기준이 gitignore된 산출물에 의존한다"를 구조적 결함으로 등재했으나, `MILESTONE_TEMPLATE.md:32`가 이미 "이 판정은 stabilize 시점 report(ADR-014상 checkout-local ephemeral) 기준이며, ROADMAP Done은 *영속된 판정*의 파생이지 **fresh clone에서 재도출된 증거가 아니다**"로 명시하고, `WORKFLOW.md:27`이 "validate와 finalize는 **같은 checkout**에서 연속 실행해야 한다"를 못 박으며, `STRUCTURE.md:45`가 lifecycle을 `ephemeral`로 등재한다. **의도된 설계다.** 잔여 사항은 문구뿐 — 재검증 안내가 "stabilize 재실행"만 말하고 **각 task의 `/validate-workitem` 재실행이 선행돼야 report가 생긴다**는 점을 적지 않아, 새 체크아웃에서 ④ 미충족을 만난 사용자가 결함으로 오인한다(본 라운드가 그 실례). (현재 SSOT: ADR-068)

**결함 아님 2 — finalize의 report 게이트 (진단 오류).** `M1-instr-4`는 "lifecycle에 report 없이 finalize를 막는 게이트가 없다"고 했으나 `finalize-workitem/SKILL.md:25`에 실재한다("report 파일이 없거나 stale하면 `/validate-workitem` 선행 안내 + `Needs Validation` 종료, 커밋하지 않음"). T-002가 통과한 이유는 게이트 부재가 아니라 **finalize를 skill로 돌리지 않고 손으로 커밋했기 때문**이다. 유효한 잔여 관측은 "task status를 손으로 `done`으로 쓰는 것을 막을 수단이 없다"이며, 이는 수작업 우회 일반의 한계지 특정 게이트의 결함이 아니다.

**기존 결정 중복 — 경험 게이트 native degrade.** `M1-instr-5`(§3-V가 웹 전제라 Flutter에 적용 불가)는 **ADR-059 D12가 이미 degrade로 명시 기록**하고 재검토 트리거 7로 이관한 사안이다. 새 발견이 아니다.

**메타 관측.** `M1-instr-6` — 본 라운드 교훈 6건 중 5건이 검증·게이트 정교화 방향이고 제품을 써 본 경험축 교훈은 `F-M1-006`(“오늘”이 하루 지나도 완료로 남는다) 1건뿐이다. dogfood가 harness 자기검증에 치우치고 제품 경험을 덜 자극한다는 신호로 남긴다.

### ADR-059 재검토 트리거 판정

1 미발화(색상 3/3 — `Color(0x…)`·`Color.fromARGB|fromRGBO`·`Colors|CupertinoColors`, 정의 라인 예외 정상) · 2 미발화(빈 e2e가 `EMPTY`로 분류, exit 0 오판 없음) · 3 **부분 판정**(웹 무회귀는 결과축만 확인, `validate` median 시간축은 두 라운드 모두 미측정 — falsifier (c) 미충족) · 4 미발화(golden 미도입) · 5 미발화(CI·2인 작업 없음) · 6 미발화(`protocolVersion` `0.1.1` 불변) · 7 판정 불가(시각 회귀 관측 기회 없음) · 8 판정 불가(수동 해석 부담의 임계값은 단일 라운드로 판정 불가) · 9 미발화(`shared_preferences`는 `flutter pub add`로 pub scope, npm devDep 필요 task 없음 → `## Dependency Tools` `pub` 1행 유지).

**발화 0건 → ADR-059 `## 정책 강도` 재조정 불필요.** 단 트리거 3은 "미발화"가 아니라 부분 판정이다.

### 결정에 미친 영향

- ADR-059 D2(npm broker)·D3(golden 로컬)·D4(5상태 per-target 판정)·D6(색상 grep)·D8(3축 판정)은 **실사용에서 의도대로 작동**했다. D6은 `[Design-token-grep]` 재판정까지 포함해 실동작을 확인했다.
- D4는 **host 제약 target의 evidence 소비 경로가 구성상 성립 불가**함이 드러났다(위 확정 결함 1). ADR-059 D4 / `STACK_SETUP_PLAN_TEMPLATE.md ## E2E Smoke Registry` / `stabilize §3-b:132`가 함께 개정 대상이다.
- D12(경험 게이트 native degrade)는 예측대로 degrade했고 새 정보가 없다.
- ADR-017은 **실행 주체 규정이 없다**는 공백이 드러났다(위 1차 관측). 에이전트 단독 완주 불가를 문서화할 대상이다.

### 채택된 해결 방향 (2026-07-29 사용자 확정 — **본 라운드 미적용**, 후속 개선 라운드에서 처리)

**확정 결함 1 → `S2` + host 범위 degrade.** 두 부분이다.

1. **증거 유효 조건 교체** — "기록된 커밋 == 판정 커밋"을 **"기록 커밋과 판정 커밋 사이에 `docs/`와 `*.md` 밖의 변경이 하나도 없으면 유효"**로 바꾼다. 판정식은 `git diff --name-only <기록> <판정> -- . ':(exclude)docs/' ':(exclude)*.md'` 가 비었는지 하나로, 사람 판단은 여전히 0이다. 격리 저장소에서 4개 경계 사례로 3안을 비교 측정한 결과다.

   | 사이에 있는 변경 | S1 (source root 한정) | **S2 (문서 제외)** | S4 (트리 해시) | 정답 |
   |---|---|---|---|---|
   | 문서만 (= 교착 원인) | 유효 ✓ | **유효 ✓** | 유효 ✓ | 유효 |
   | `android/` 네이티브 설정 | 유효 ✗ | **무효 ✓** | 유효 ✗ | 무효 |
   | `.gitignore`만 | 유효 ✓ | **무효 ✗** | 유효 ✓ | 유효 |
   | `assets/`만 | 유효 ✗ | **무효 ✓** | 유효 ✗ | 무효 |

   S1·S4는 *앱이 실제로 바뀐 뒤에도 옛 증거를 유효로 인정*하는 오답을 각 2건 냈다 — 미검증 빌드를 통과시키는 방향이라 채택 불가. S2의 유일한 오답은 앱 무관 변경에 재실행을 요구하는 **과차단**이고 비용은 재실행 1회다. "조용한 오답보다 안전한 실패"(D2 재검토 트리거 9)와 같은 선택이다.

2. **host 제약 target은 차단하지 않고 명시 기록** — macOS 증거가 아예 없으면 `졸업 가능: NO`로 막지 않고, 판정문에 `graduation: YES (host 제약 target 미검증: native/ios)` 형태로 미검증 사실을 남긴다. **D12가 경험 게이트에서 이미 채택한 "숨기지 않고 degrade 기록" 패턴과 같은 형태**이며, 그 선례가 근거다. 이로써 `NOT_APPLICABLE`을 발명해 통과시키는 경로가 불필요해진다.

   개정 대상: ADR-059 D4 / `docs/00-meta/_templates/STACK_SETUP_PLAN_TEMPLATE.md ## E2E Smoke Registry` 주석 / `.claude/skills/stabilize-milestone/SKILL.md` §3-b·§1.5.

**확정 결함 2 → 라벨 `P1`로 하향.** `§5-4`의 `P0 [Arch-iface-violation]`을 `P1 [Arch-iface-violation]`으로 바꿔 같은 블록의 나머지 13건(P1 9 / P2 4)과 정렬한다. `MILESTONE_TEMPLATE.md:32`가 이미 규정한 report-only 동작과 라벨이 일치하게 된다. best-effort heuristic(스스로 "false negative 多"로 명시)에 차단력을 주는 대안은 오탐 차단 위험과 ADR-053 backstop 설계와 어긋나 기각했다.

**기각·중복 항목은 재등재하지 않는다** — `M1-instr-7`(report gitignore)은 `MILESTONE_TEMPLATE.md:32`·`WORKFLOW.md:27`·`STRUCTURE.md:45`가 규정한 의도된 설계이고, `M1-instr-4`는 `finalize-workitem/SKILL.md:25`에 게이트가 실재하므로 진단 오류이며, `M1-instr-5`는 D12가 이미 결정한 사안이다. 잔여로 남는 문구 개선 후보 2건: (a) 새 체크아웃 재검증 시 **각 task의 `/validate-workitem` 재실행이 선행돼야 report가 생긴다**는 한 줄(`MILESTONE_TEMPLATE.md:32` 또는 `WORKFLOW.md:27`), (b) ADR-017에 **에이전트 단독 완주 불가**(메인 세션 skill 구간은 사람이 운전) 명시.

## Round 9 (2026-07-30, todo CLI / ADR-060 결정 마감 + 마일스톤 봉인 적용 검증)

> isolated fork `C:\tmp\dogfood-todo-cli-20260730` (baseline `de8835e`). ADR-060 신설 + amendment 3건 + `seal-milestone` 신규 skill + skill 다수 개편으로 ADR-017 재실행 트리거 2종("새 ADR 도입 — amendment 포함", "lifecycle 단계 변경")이 모두 발동한 라운드다. 실제 Node.js 24 / npm 11로 수행했다. 시나리오는 가이드가 고정한 **todo CLI (CRUD + JSON persistence)**.

### 수행 방법의 한계 (Round 8과 동일 — 먼저 밝힌다)

lifecycle skill 중 `discover-product`·`bootstrap-project`·`bootstrap-stack`·`plan-milestone`·`plan-workitem`·`stabilize-milestone`은 `disable-model-invocation: true`(ADR-050 D2 — 의도된 설계)이므로 에이전트가 Skill 도구로 호출할 수 없고, 다른 포크 디렉터리에 대해서는 `implement-workitem`·`validate-workitem`·`repair-workitem`·`finalize-workitem`·`seal-milestone`도 Skill 도구가 현재 세션 프로젝트에 결박돼 있어 마찬가지로 호출할 수 없다. 따라서 이번 라운드는 **전 구간을 각 SKILL.md가 문서화한 절차를 손으로 충실히 재현**했다 — 단, 실제 파일 생성·실제 `git` 커밋·실제 `node --test` 실행·실제 CLI 수동 스모크 테스트를 동반했다(Round 8과 동일 기준). **1차 관측**: Round 8이 이미 확정한 "ADR-017 사용자 개입 ≤1회 지표는 이 실행 방식으로 측정 불가"가 이번에도 동일하게 적용된다 — 새로운 gap이 아니라 기존에 확정된 gap의 재확인이다.

### 단계별 관측

1. **Discover** (수작업 재현): DISCOVERY.md 14/14 섹션 실서술. R3에서 위험도 판정(ADR-035#amend-3/D5) 수행 — 가정 2개(A-1 타이밍 습관, A-2 단일기기) 모두 저위험·가역으로 판정, `risk-accepted`로 원장에 `D-001`/`D-002` 등재(`영향: (미할당)`). **관측된 gap**: R3의 위험도 판정 문구가 이 risk-accepted 등재에 전체 Decision Brief 6블록을 쓰라는 것인지 명시하지 않는다 — `## 결정 마감` 공통 블록은 모든 `user-*` 결정에 Decision Brief를 요구하지만, 가정-위험도 판정은 다중 옵션 선택이 아니라 단일 수용/비수용이라 실무적으로는 경량 진술(3필드만)로 충분해 보였다. 사양 명확화 후보.
2. **Bootstrap project** (수작업 재현): charter 9/9 섹션 + ADR-100. ADR-053 고-stakes 게이트 미발동(DB·인증·다중모듈 없음) — 저-stakes 프로젝트에서 게이트가 조용히 지나가는 것을 확인.
3. **Bootstrap stack** (수작업 재현): Node.js CLI, ARCH `## 7-1`/`## 7-3`/`## 7-4`/`## 7-5` 통째 삭제, `## 7-2`만 채움. **ADR-060 D9 authority 분리가 정확히 설계대로 작동**: `## 7-2`의 4항목 중 "출력 포맷"(user-approval) 1건만 Decision Brief 6블록으로 제시(→ `D-003`), 나머지 3건(플래그·명령어 / TTY-ANSI / Don'ts, 전부 agent-delegated)은 한 번의 일괄 확인으로 처리 — 가이드가 지정한 "1개 Decision Brief + 3개 batch-confirm" 시험점을 정확히 재현했다.
4. **Plan milestone + plan workitem** (수작업 재현): M1/F-001 → `contract-ready`. bootstrap 단계의 `(미할당)` open 항목(`D-004`, 실행 파일명 충돌 리스크)을 R1이 전수 triage — `영향: M1`으로 배정 후 같은 라운드에서 Decision Brief로 즉시 마감(`todo` 유지 결정). plan-workitem은 T-001/T-002를 전부 `draft`로 생성(자기 승격 없음, ADR-060 D7). FAC-1~4 전부 매핑. **의도적으로 T-001:AC-3(중복 add 처리)를 2개 합리적 해석이 가능한 채 미확정 상태로 남겨** 이후 봉인 3-b 검사의 시험 재료로 삼았다.
5. **Seal-milestone — 핵심 시험 대상, fixture 5~18 실행** (수작업 재현, 아래 표). **주의: 13·17·18의 *후반부*(봉인 후 `/implement-workitem` 착수 계열)와 12b는 미실행이다** — 아래 "미실행" 절에 전수 명시:

| Fixture | 시나리오 | 결과 |
|---|---|---|
| 5 | 원장 `open` 항목(M1 스코프)이 남은 채 봉인 | BLOCKED: 조건 6, 상태 불변 |
| 6 | `deferred`인데 앵커 3필드 중 결측 | BLOCKED: 조건 6 (`open`으로 강등 처리 — D4 규정대로) |
| 7 | AC 2+ 해석 미확정 — (a) 보류 응답 | BLOCKED: 조건 3-b, 상태 불변 |
| 7 (계속) | (b) 즉석 응답 → 계속 진행 중 조건 6 도달 | 3-b `해석 확정:` 기록이 **이후 BLOCKED에도 유지됨**(명시 예외 1 실동작 확인) |
| 8 | 부분 승격 상태(task 1개만 `ready`)에서 재실행 | **재개 진입** 인식, 전 문서 재검사, 승인 재요구, 나머지만 승격 |
| 9 | 봉인+구현 완료 상태에서 `/repair-plan`에 synthetic P0 투입 | 2-S 세 번째 분기 발동 — 계획 미수정, IMPROVEMENT_GUIDE 영속, 리뷰 파일 삭제 |
| 10 | 전부 정상 | fixture 8과 결합 실행 — **SEALED**, receipt 정상 기록 |
| 11 | 실제 구현→검증→마감→안정화 전 구간 | 아래 별도 서술 |
| 12 | `ready`+봉인일 미기입+구현 흔적 0건 | **마이그레이션 진입**, 조건 2~9 전수 재검사 후 SEALED(라벨 없는 평문 receipt — D12(가) 규정대로) |
| 13 | 같은 상태에서 task 1개 `in-progress`, 이어서 `blocked`로 교체 재실행 | 두 경우 모두 **grandfather 진입** 일관 판정(4종 구현 흔적 정의의 `blocked` 회귀 방지 확인). **후반부 미실행**: 그 뒤 `/implement-workitem` 착수 여부 + receipt `Register:` 실측값 표기 |
| 14 | 재개 진입의 승인 재요구 | fixture 8과 **결합 실행**으로 확인 — §10.2의 "각 fixture는 독립 상태에서" 규정 미준수(14는 8 시나리오의 하위 단정이라 결합했으나 규정 이탈은 이탈이다) |
| 15 | `DECISION_REGISTER.md` 파일 삭제 | silent skip 아님 — 확인 1회 요구 후 receipt에 `파일 부재 — 사용자 확인 후 skip` 정직 기록 |
| 16 | `(미할당)` open 미triage 항목 존재 | BLOCKED: 조건 6, `/plan-milestone` R1 triage 안내 |
| 17 | 봉인 직후(구현 0건) 결함 발견 → repair-plan 수정 → 재봉인 | 2-S 두 번째 분기(그 자리에서 수정) → **재봉인 진입** 정상 재검증·receipt 갱신 — 이 경로가 실제로 막다른 길이 아님을 확인(가이드 §7.7(a)가 고치려던 교착의 회귀 검사). **후반부 미실행**: 같은 M을 `in-progress`로 바꾼 뒤의 report-only 재검사(fixture 9가 별 상태에서 동형 확인) |
| 18 | `ALL_GOOD` 리뷰 파일 존재 | 삭제 + 통과, `independence` 질문 1회, receipt에 `executed: yes` 기록. **후반부 미실행**: 그 뒤 `/implement-workitem`이 게이트 ⑤를 통과하는지 |

6. **Implement + validate + finalize** (실제 skill 재현 — 실제 코드/테스트/커밋): T-001(add/list)·T-002(done/remove) 모두 RED(모듈 없음 확인) → GREEN(9/9 테스트 pass) → validate report Pass(신뢰도 High) → finalize로 `done` + 실제 커밋 2건. 수동 스모크로 손상 저장 파일 fail path까지 확인(크래시 없이 에러+exit 1).
7. **Stabilize** (수작업 재현): 실행 시점 판정은 graduation YES였으나 **본 기록 검토에서 계약 결함 4건이 확인돼 YES → NO로 정정**한다(아래 "harness 발견" — fork의 M1 `## 8` 회고에는 정정 전 `YES`가 남아 있다). QA_FINDINGS에 P2 1건(손상 파일 fail path 테스트 커버리지 gap). **탐색적 QA 중 실제로 새 결정을 발견**(완료 항목 purge 정책, `D-007`) → `docs/10-charter/DECISION_REGISTER.md`에 `status: open` + `- 발견: 봉인 후 (M1)`으로 등재(ADR-060 D11 writer 실동작).

### 실제 커밋 (fork 로컬, 미push)

`55840de` fork 정리 → `eefd6bf` discover+bootstrap-project+bootstrap-stack → `ea352d9` plan-milestone(contract-ready) → `276043f` plan-workitem(draft, AC-3 미확정) → `f468dc5` AC-3 해석 확정+원장 정리 → `c4c15c0` seal SEALED → `5019adf` T-001 구현 → `c1b3ec6` T-002 구현 → `1fb5440` stabilize(graduation YES, D-007 등재) → `b69ff74` repair-plan fixture9. fixture 12~18은 `fixture-migration-test` 브랜치에서 격리 실행 후 병합 없이 폐기(`main` 이력 오염 없음).

### ADR-017 성공 기준

**적용한 계수법** (가이드 §10.0이 고정한 규칙 — 회차 간 비교를 위해 명시): **카운트한다** = 사람이 skill 산출물(문서·코드) 파일을 **직접 편집**한 행위 1건 = 1회. **카운트하지 않는다** = ① skill 발화 자체(`disable-model-invocation: true` skill은 사용자가 부르는 것이 정상 호출 경로) ② Decision Brief 응답 ③ 일괄 확인 응답 ④ `/seal-milestone` 승인 응답 ⑤ 실패 fixture를 만들기 위한 의도적 상태 변조. 이번 라운드에서 ②~⑤는 다수 발생했으나 전부 계수 대상이 아니다. **에이전트가 skill 절차를 손으로 대행한 편집은 ①의 "skill 실행"에 해당하므로 계수 대상이 아니다** — 따라서 이 지표의 실측값은 **0회**다. 다만 그 0회는 *harness가 자동 실행됐을 때의 개입량*을 뜻하지 않는다(그 값은 이 실행 방식으로 얻을 수 없다). Round 8은 이 둘을 구분하지 않아 "측정 불가"로 적었고, 계수법이 고정된 뒤인 본 라운드부터는 위 구분으로 판정한다.

| 지표 | 목표 | 실측 | 판정 |
|---|---:|---:|---|
| 사용자 개입 (산출물 직접 편집) | ≤1 | **0회** | 통과 — 고정 계수법 문면 적용: *사람이* 산출물을 직접 편집한 행위 0건(에이전트의 skill 절차 대행은 ①~⑤ 어디에도 해당하지 않는 skill 실행이다). **단 이 0회는 harness 자동 실행의 개입량이 아니라 "수작업 대행 하에서 사용자 편집 0"이라는 뜻이다** — Round 8은 이 구분을 못 해 "측정 불가"로 적었고, 본 라운드가 계수법 도입 후 첫 판정이다 |
| placeholder 충원율 | ≥80% | **15/17 ≈ 88%** | 통과(하한 근접) |
| graduation pre-check 미통과 사유 | ≤2 | **1** (전 task done ✓ / validate Pass ✓ / E2E N/A ✓ / FAC↔AC 100% ✓ — **P0 0건 ✗**: 아래 결함 4건) | 통과 |

**ADR-017 gate: 3/3 통과.** 단 "통과"는 *결함이 없었다*는 뜻이 아니다 — 아래 결함 4건 + harness 구멍 2건을 잡아낸 것이 이 라운드의 산출이다. todo CLI가 `## 7-2` 1항목뿐이라 D9의 "결정 카드 피로" 지표는 이번에도 자극되지 않았다(가이드가 예견한 대로) — 원장 최종 7행(D-001~D-007), 20행 상한 대비 여유 충분.

**충원율 분모(17)와 미충원 2건**: 채움 대상 = README.md · README_ko.md · PROJECT_CHARTER · DISCOVERY · DECISION_REGISTER · ARCHITECTURE_OVERVIEW(+`## 7-2`) · STACK_SETUP_PLAN · ADR-100 · ADR-101 · ROADMAP · M1 · F-001 · T-001 · T-002 · QA_FINDINGS · IMPROVEMENT_GUIDE · M1 `## 10` receipt. **미충원 2건 = README.md·README_ko.md**(둘 다 `# agentic-dev-harness` 원문 그대로 — `/bootstrap-project`의 필수 산출물인데 프로젝트용으로 교체되지 않았다). 별건으로 **정리 누락 2건**(비-UI인데 `docs/20-system/DESIGN.md`가 `status: draft`로 잔존 + AGENTS.md의 DESIGN 링크 줄 미제거 — WORKFLOW 2절이 삭제를 규정)이 있으나 이는 placeholder 충원이 아니라 cleanup이라 분모에서 분리했다.

**ADR-060 falsifying evaluation 두 지표 실측** (가이드 §10.4 요구): **결정 카드 총량 = `user-*` 7건**(`user-choice` 6 + `user-approval` 1) — 그중 **Decision Brief 6블록으로 제시한 것은 2건**(D-003 CLI 출력 포맷 / D-004 실행 파일명), 나머지 5건은 가정 위험도 판정(`risk-accepted` 2건)·라운드 내 즉답·QA 발견분이라 Brief 대상이 아니었다. **원장 행 수 = 7행**(상한 20). 마일스톤 1개 기준 카드 2건은 피로 임계와 무관한 수준이다. §10.3(2차 fixture — 웹/Flutter 스택으로 D9 부하 측정)은 **선택 사항이라 실행하지 않음**.

### harness 발견

**봉인 기계 자체는 설계대로 동작했다(fixture 5~18 — 후반부 3건·12b 제외).** 특히 `재봉인 진입`(fixture 17), `D11 봉인 후 마커 제외`(fixture 12), `구현 흔적 4종 정의`(fixture 13의 `blocked` 회귀 검사), `2-S 3분기`(fixture 9/17) — 이번 개선 라운드가 사후에 스스로 발견해 고친 5건의 교차 계약 결함(가이드 §7.7)이 실제로 전부 해소돼 있음을 각 fixture가 개별 확인했다.

**그러나 dogfood 산출물 자체에 계약 결함 4건이 있었고 기존 게이트가 전부 놓쳤다** — 실물·실행으로 재현했다(최초 기록의 "기능 결함 0건"은 오판이며 본 절이 그것을 정정한다):

| # | 결함 | 실측 근거 | 놓친 게이트 |
|---|---|---|---|
| 1 | **D-003 승인 결정 미구현** — ARCH `## 7-2`가 `--json` + 각 명령 `-h/--help`를 확정(이 라운드 대표 Decision Brief)했는데 구현은 `--all`만 처리 | `list --json` → 사람용 텍스트(exit 0) · `--help` → exit 1. `--json`/`--help`가 **어떤 FAC/AC에도 없음** | **구멍 B** — ARCH 7-x 결정 ↔ AC 회수 검사 부재(`[Plan-arch-iface]`는 *위반*만 보고 *회수 누락*은 안 봤다) + validate-plan 미실행(opt-in) |
| 2 | **D-005 위반** — "삭제 id 영구 결번"으로 closed인데 `add.js`가 `max(id)+1` | #3 삭제 후 다음 add가 **다시 #3** | 위와 동일(닫힌 결정 → AC 회수 경로 없음) |
| 3 | **정본 앵커 dangling** — D-004·D-005의 `정본: PROJECT_CHARTER.md ## 7`인데 charter `## 7`에 두 결정이 없다. D-004의 조건부(README 완화 안내)도 미이행 | charter `## 7` 4줄 전수 확인 · README `npx`/`별칭` 0건 | **구멍 A** — seal 조건 6이 `closed` 항목의 앵커 *내용*을 대조하지 않아 ADR-060 D1(원장=위치, 정본=본문) 위반이 통과 |
| 4 | **seam 신호 ① 오판** — T-001·T-002가 같은 JSON에 write하는데 feature `## 7-2`를 "미발화(동시성 없음)"로 처리 | plan-workitem 규칙은 *"2+ task 동일 저장소 write"* **단독 발화** — 동시성 조건은 규칙에 없다 | 규칙 문면이 재량 여지를 남김. INV 표가 채워졌다면 결함 2(id 결번 불변식)가 AC로 회수됐을 가능성이 크다 — **결함 2와 인과 연결** |

**pre-existing 2건(이번 라운드 계약 소관 아님)**: `/bootstrap-project`가 README 2종을 프로젝트용으로 교체하지 않음 · 비-UI인데 `DESIGN.md`(status draft) + AGENTS의 DESIGN 링크 정리 누락(WORKFLOW 2절이 삭제를 규정).

**이번 라운드 계약의 구멍 2개(A·B)가 이 dogfood의 실제 산출이다** — 결정을 *닫는* 경로(D1~D9)는 만들었지만 (A) 닫힌 결정이 정본에 실제로 적혔는지, (B) 그 결정이 구현 AC로 회수됐는지를 아무도 보지 않았다.

**결함 아님 1 — Phase 10 fixture 순서 표기.** 가이드 §10.1이 나열한 순서(5→6→7)는 실제 조건 검사 순서(3-b가 6보다 먼저)와 어긋난다 — `T-001:AC-3`가 plan-workitem 이후 미확정 상태라 어떤 봉인 시도도 3-b에서 먼저 걸린다. 5·6을 "이미 3-b가 통과된 상태"로 가정하고 나열한 것으로 보이나 본문에 그 전제가 적혀 있지 않다. 기능 결함은 아니고 fixture 목록의 실행 순서 주석 누락 — 실제 실행 시 순서를 3-b 우선으로 재배치했고(위 표에 반영), 다음 개선 라운드에서 §10.1에 "5·6은 3-b가 이미 해소된 상태를 전제"라는 한 줄을 추가할 후보로 남긴다.

**미실행 — §10.1 item 11의 하위 관측 2개 + 7.6(a) surface 1개.** (a) *"봉인 전이면 `/implement-workitem` 착수 거부"*: 이번 실행은 SEALED 이후에만 implement를 돌렸으므로 **봉인 전 착수 시도를 하지 않았다** — 게이트 ④의 거부 경로는 미관측. (b) *"봉인 후 원장에 `open` + `- 발견: 봉인 후 (M<N>)`을 넣어도 착수가 막히지 않는가"*(D11 데드락 방지): D-007을 그 형식으로 실제 등재했으나(위 단계 7), 그 시점에 T-001·T-002가 이미 `done`이라 **착수할 task가 없어 검증하지 못했다**(synthetic T-003이 필요). ADR-060 falsifying evaluation이 감시 대상으로 지목한 항목이므로 **차기 라운드에서 반드시 실측**한다. (c) `repair-workitem`의 D11 등재 블록(가이드 7.6(a))은 validate가 Pass여서 inner-loop repair 자체가 발동하지 않아 미관측 — `stabilize` 쪽 writer만 실동작 확인됐다.

**미실행(신규 아님, 명시적 스코프 초과) — fixture 12b.** "task 0건이면 receipt 미기록"은 별도 브랜치로 실행하지 않고 조건 2 문구("모든 feature가 task를 1개 이상 갖고")와 "하지 않는 것" 목록의 직접 판독으로 대체했다. 실측 실행은 아니므로 차기 라운드에서 실제로 짧게 실행해 확정하면 좋다.

### 결정에 미친 영향

- ADR-060의 D1·D2·D3·D4·D6·D7·D8·D9·D11·D12 — **선언한 절차는 전부 의도대로 작동**함을 개별 fixture로 확인했다. **다만 절차의 두 *끝단*이 비어 있었다**: 닫힌 결정의 정본 반영 검증(구멍 A → D7 조건 6 보강)과 승인된 ARCH 7-x 결정의 AC 회수 검증(구멍 B → `[Plan-arch-iface]` 확장). 두 건은 아래 "채택된 해결 방향"으로 **본 라운드에 반영**했다.
- ADR-017은 "에이전트 단독 완주 불가" 공백이 Round 8에 이어 재확인됐다 — 이미 알려진 문서화 후보이며 이번 라운드가 새로 발견한 것은 아니다.

### 채택된 해결 방향

**본 라운드 반영 2건** (사용자 확정 — 구멍 A·B, 가이드 §11에 기록):

1. **구멍 A → seal 조건 6에 정본 앵커 대조 추가.** `status: closed` + `authority: user-*` 항목의 `정본: <문서#앵커>`를 열어 **그 결정이 실제로 그 위치에 적혀 있는지** 1회 대조하고, 비어 있으면 어느 D-NNN이 dangling인지 보고하며 중단한다. 조건부 승인이면 그 조건의 이행 위치까지 본다. 반영: `.claude/skills/seal-milestone/SKILL.md` 조건 6 · ADR-060 D7 조건 6.
2. **구멍 B → `[Plan-arch-iface]` 차원 확장.** ARCH `## 7-x`에 확정 기록된 `user-approval` 결정이 **어떤 task AC로도 회수되지 않으면 `P1`**으로 보고한다(범위 밖이 의도면 원장 `deferred` 또는 명시). 반영: `.claude/skills/validate-plan/SKILL.md` 차원 10 · `.claude/agents/reviewer.md` 차원 10(미러 동일).

**잔여 한계(명시 수용)**: 구멍 B의 검출은 `validate-plan`이 opt-in(ADR-038)이라 **리뷰를 돌리지 않으면 여전히 새어 나간다.** 봉인 시점 강제(seal 조건에 ARCH 7-x↔AC 회수 검사 추가)는 결정 카드·차단 범위를 넓히는 변경이라 본 라운드 범위 밖으로 두고 차기 라운드 후보로 남긴다.

**차기 라운드 필수 항목**: (a) 미실행 fixture 하위항목 6건 실측(봉인 전 착수 거부 · D11 데드락 방지 · 12b · 13/17/18 후반부) · (b) seam 신호 ① 문면에서 재량 여지 제거 · (c) `/bootstrap-project`의 README 2종 교체 + 비-UI `DESIGN.md`/AGENTS 링크 정리 누락 · (d) §10.1 fixture 순서 전제 한 줄.

## Probe Contract Measurement (2026-08-05~06, ADR-063 probe 계약 실측 — 임시 fork 3종)

ADR-063 Mutation Contract 5의 *Falsifying evaluation*이 요구한 실측을 별 세션에서 수행한 기록이다. 대상은 `/stack-guard` 수행-5(probe 기반 smoke test)이며, 이번 개선 라운드(ADR-062·063 신설 + ADR-042#amend-2 + ADR-060#amend-1)의 **가장 큰 실행 검증 항목**이었다.

**같은 라운드의 다른 실행 검증 2건도 함께 기록한다**(둘 다 별 세션 보고 기준 = 자기보고 등급):

- `/consult-expert`(인자 없음)와 `/consult-expert legal`(관할 누락) **필수 입력 누락 프로브 2건 — PASS**. 되묻고 종료했고 파일 변경 0건.
- **정상 법률 자문 경로(임시 fork) — 미완.** 비용 상한에 도달해 종료됐다. 따라서 `counsel` 의 조회 환경 고지·요건 대조 표의 `조회 URL`+`확인일` 전수 기재·노트 1개 생성·다른 파일 무수정은 **저장소에 완료 증거가 없다**(아래 미측정 목록에 포함).

### 수행 방법의 한계 (먼저 밝힌다)

- **실행자는 별 세션 AI**이고, `/stack-guard`는 `disable-model-invocation: true`라 **사용자가 슬래시 커맨드를 직접 입력**해 실행했다. 실행자는 fixture 준비 + 출력·파일 상태 측정만 수행했다.
- **근거는 각 실행의 최종 출력 전문 + 파일 상태다. 개별 `validate` subprocess의 원문 로그는 확보되지 않았다.** 따라서 아래 결과를 **CONFIRMED(파일 상태로 독립 확인)** 와 **PLAUSIBLE(대상 skill의 자기 보고)** 두 등급으로 나눠 적는다 — 검증하지 못한 것을 선언하는 것이 ADR-047 D8(Oracle Adequacy) 규율이다.
- fixture를 **비-UI·비-e2e로 한정**했다(`DESIGN.md` 삭제 + ARCH `## 7-x` 미기입). Chromium 다운로드를 피해 실행 시간을 줄인 선택이며, 그래서 **design gate·e2e 경로는 이번 대상이 아니다.**
- 요청서(측정 지시문)의 **fixture A 오라클이 틀렸다**(아래 D-1). 그 결과 원래 재려던 *"스캐폴드 전 = 소스 루트 자체가 없는"* 상태는 **이번에 측정되지 않았다.**

### fixture 3종

| fixture | 구성 | 무엇을 재려 했나 |
|---|---|---|
| **B** | brownfield TS 라이브러리 + **Biome(format+lint 겸업)** + tsc + Vitest, 소스 3~4개 중 1개에 **기존 서식 위반**을 의도적으로 남김 | fail-fast로 뒤 단계에 도달하지 못하는 회차의 처리 + 겸업 도구의 회차 감축 여부 |
| **C** | B와 동일 구성에서 `validate`의 **typecheck 단계만 제거** | 단계 부재의 최종 판정(부재를 `PASS`로 적지 않는가) |
| **A** | 도구 설정 전부 + **빈 `src/`**(소스 0개) | 소스 0개 정상 경로가 산출물 결함으로 오분류되지 않는가 |

도구 버전: `@biomejs/biome` 2.5.7 / TypeScript 7.0.2 / Vitest 4.1.10 (3 fixture 모두 설치 성공).

### CONFIRMED — 파일 상태로 독립 확인된 사실

- **5-f 판정 기록이 3 fixture 전부에서 실제로 남았다** (D3 기록 계약 작동):
  - B: `probe smoke: PROBE OK, PROJECT FAIL (2026-08-05)`
  - C: `probe smoke: PARTIAL (probe verified: format, lint, test / missing: typecheck) (2026-08-06)`
  - A: `probe smoke: PASS (probe verified, empty rules/tests warning) (2026-08-06)`
- **단계 부재를 `PASS`로 기록하지 않는다** — C의 최종 판정이 `PARTIAL (probe verified: format, lint, test / missing: typecheck)`로 출력·기록 양쪽에 남았다. 이 항목이 `PASS`로 굳으면 커버리지 누락이 `[Guard-drift]` (d)에서 영구 침묵하므로 본 라운드 마지막에 넣은 규칙인데, 실측으로 확인됐다.
- **재실행 계약 1행 실측** — C에서 기존 `scripts/verify.*`의 SHA-256이 실행 전후 동일(`9F5E8708AB268D00EE0D4068E5411B96B7D78692C2130BC031898C98F93E3702`). "존재하면 덮어쓰지 않고 커버리지 부족만 보고"가 실제 동작.
- **probe 정리** — B·A 모두 `probe cleanup: DONE (2개)` + `git status`에 probe 잔여물 0.
- **probe 배치** — `src/__stackguard_probe__.ts` · `src/__stackguard_probe__.test.ts`(등록 소스 루트 안), `.gitignore`에 probe 경로 **미등재**.
- fork 3종 전부 삭제 확인, **실측 종료 직후·결과 반영 전 시점**의 원본 저장소는 무수정(`HEAD c9fede76`, clean)이었다. 본 기록과 5-a 보강은 그 뒤의 변경이다.

### PLAUSIBLE — 대상 skill의 자기 보고가 유일한 근거 (반증은 없음)

- **B4 미도달 처리**: 기존 서식 위반으로 fail-fast가 걸린 2~4회차를 **단독 명령으로 재측정**했다고 보고(`npm run lint` / `typecheck` / `test`). `PROBE FAIL`로 적지 않았다 — 5-c-0 (ii)의 핵심 규칙.
- **B3 겸업 처리**: Biome이 format+lint를 겸하지만 **회차를 합산·생략하지 않았고** 단계 귀속을 규칙 id(`lint/suspicious/noDoubleEquals`)와 formatter 진단으로 구분했다고 보고.
- B1 범위 확인 통과 / B2 각 단계에서 probe 경로 지적(`TS2322`, vitest가 probe 테스트 수집·실패) / B5 마지막 회차 probe 귀속 진단 0건 / B6 최종 `PROBE OK, PROJECT FAIL` / C1~C3.
- 회차 실측(B, 총 `validate` 5회 + 2~4회차 단독 재측정): ① 형식 위반 → format 진단 / ② lint 위반 → `lint/suspicious/noDoubleEquals` / ③ 타입 오류 → `TS2322` / ④ 실패 테스트 → Vitest FAIL / ⑤ 준수 소스·통과 테스트 → probe 귀속 진단 0건.
- **왜 PLAUSIBLE인가**: 이 서술의 출처가 *검증 대상인 skill 자신*이고 subprocess 원문 로그가 없다. 방향은 전부 기대와 일치하고 CONFIRMED 항목(기록된 판정 문자열)과 모순되지 않지만, 독립 증거는 아니다.

### D-1 — 요청서 오라클 오류 1건 (보일러플레이트 결함 아님)

요청서는 fixture A(소스 0개)에서 `SKIPPED`를 기대했으나, SKILL 5-e는 *"전 회차 기대대로 + 프로젝트 빈 케이스(빈 lint 룰 / 프로젝트 테스트 0건) → `PASS (probe verified, empty rules/tests warning)`"* 이고 `SKIPPED`는 **범위 밖·생성 불가 전용** 라벨이다. fixture A는 도구 설정과 `src/`가 있어 probe 생성·5회 측정이 가능했으므로 **`PASS`가 정확한 판정**이다. *"프로젝트 소스 0개"* 를 *"probe 생성 불가/범위 밖"* 과 동일시한 측정 기준 오류다.

**파생 발견(실제 공백 1건)**: 이 오류를 추적하다 **SKILL 5-a에 "등록된 소스/테스트 루트 자체가 없을 때"의 처리가 없다**는 사실이 드러났다. `PROJECT_START_CHECKLIST`는 그 상태의 판정을 `SKIPPED (probe unavailable …)`로 이미 안내하고 있어 **문서 간 미이행**이었고, 정상 lifecycle에서 `/stack-guard`가 도는 시점(스캐폴드 전)이 바로 그 상태라 흔하다. **본 기록과 같은 커밋에서 보강**했다 — 5-a에 *"등록된 소스/테스트 루트가 아직 없으면 `SKIPPED (probe unavailable — 등록된 소스 루트 부재)`로 보고하고 디렉터리를 새로 만들지 않는다"* + ADR-063 D1 생성 불가 사유 괄호 정합.

### 미측정 5건 (차기 후보 — 1번이 최우선)

1. **⚠️ 스캐폴드 전 소스 루트 부재 → `SKIPPED (probe unavailable — 등록된 소스 루트 부재)`** — **본 기록과 같은 커밋이 새로 추가한 분기이며 실측 0이다.** 새 행동을 넣고 검증을 다음으로 넘긴 상태이므로 차기 라운드에서 **가장 먼저** 잰다. fixture 비용은 3종 중 가장 싸다(소스·테스트 루트를 아예 만들지 않은 fork 1개). 확인할 것: 디렉터리 미생성 · 정확한 SKIPPED 문자열 · `probe cleanup: DONE (0개)` · `probe smoke:` 기록 · probe 잔존 0.
2. **`[Guard-drift]` (d) 회수** — D3 기록(확인됨) → D4 회수의 **후반부**. C fixture가 `PARTIAL` 기록까지 만들어 입력이 완성됐는데 `/stabilize-milestone`을 돌리지 않았다. 마일스톤 문서 1개가 필요하다.
3. **재실행 멱등** — `## 재실행 계약` 13행 중 실측된 것은 `scripts/verify.*` 미덮어씀 1행뿐. 같은 fork에서 `/stack-guard` 2회 실행이면 대부분 확인된다.
4. **UI fork의 conformance 4-run 승계** — 기동 실패/기동 후 실패/adapter exit 2 3분기를 4개 `run()` 전부에 적용한 변경은 **함수 단위 6케이스 실행**으로만 확인됐다(원본 세션). 실브라우저 실행은 미측정.
5. **`/consult-expert` 정상 경로**(법률) — 위 서두 참조. 비용 상한으로 미완이며 노트 산출·등급·무수정 가드의 완료 증거가 없다.

### 결정에 미친 영향

- ADR-063 D1에 본 라운드에서 새로 넣은 세 규칙 — **미도달은 `PROBE FAIL`이 아니다 / 단계 부재는 `PARTIAL`이다 / 겸업은 회차를 줄이지 않는다** — 가 실측에서 모두 기대대로 동작했다. 등급은 두 번째가 CONFIRMED, 첫째·셋째가 PLAUSIBLE이다.
- D3 기록 계약(`probe smoke:` 1줄)은 3 fixture 전부 CONFIRMED. `[Guard-drift]`의 입력이 실제로 생성됨을 확인했다.
- **부수 관측**: fixture B 준비 단계에서 Vitest가 **sandbox spawn EPERM**으로 차단된 뒤 승인 실행으로 통과했다. 같은 라운드에서 conformance oracle의 *기동 실패 → exit 2 승계*를 넣은 근거(`[관측됨]`)를 보강하는 사례다.
- 요청서 오라클 오류가 결과적으로 SKILL 공백 1건을 드러냈다 — **측정 기준을 문서에서 역산하지 않으면 오라클 자체가 결함이 된다**는 교훈이며, ADR-063 D1이 *"기대값(oracle)은 고정하고 SKILL 본문의 판정 표가 소유한다"* 고 규정한 이유와 같다.

## Round 10 (2026-08-08, todo CLI / ADR-064 task 층 증거 계약 적용 검증)

> isolated fork 3종 `C:\tmp\df064\f1|f2|f3` (harness baseline `31c791f` + todo CLI overlay). ADR-064 적용은 문서 대조로 이미 끝났고 반증 시나리오 10개의 **논리 정합도 텍스트로 확인된 상태**였다. 그래서 이 라운드가 재는 것은 설계 정합이 아니라 **준수도(compliance) 샘플링** — 실행자(LLM)가 그 문구를 실제로 따르는가. 대상은 "가장 위험/가장 먼저"로 지목된 3개(1b · 8 · 6b)이며 지시된 순서대로 수행했다.

### 수행 방법 (Round 8·9와 결정적으로 다른 점 — 먼저 밝힌다)

- **skill을 손으로 대행하지 않았다.** fork 디렉터리 안에서 `claude -p "<슬래시 커맨드>" --model sonnet`으로 lifecycle skill을 **실제 호출**했고, 후속 단계는 `--continue`로 같은 메인 세션에 연쇄시켰다(ADR-050 연쇄 실행 재현). 세션 6건 전부 실행 모델 `claude-sonnet-5`로 확인했다. Round 8·9의 "전 구간 수작업 재현" 한계가 이번에는 적용되지 않는다.
- fixture: todo CLI (**Node 24 + TypeScript strict + Vitest**, `npm run validate` = `tsc -p tsconfig.json && vitest run`). M1 졸업 완료(T-001~T-003 `done`, 15 test pass), **M2 봉인 완료**(F-002 확장 명령 3종 + F-003 요약, task 4개, `## 10. 봉인 기록` 기입) 상태에서 시작했다.
- **각 task 문서는 TASK_TEMPLATE의 안내 HTML 주석을 전부 보존한 채로 작성했다** — 시나리오 1b가 요구하는 입력이자 `/plan-workitem` 산출물의 자연 상태다.
- 시나리오 간 간섭(작업 트리 오염 → diff-trace 축 왜곡)을 막으려고 fork를 3개로 분리했다: **f1 = 1b-i**, **f2 = 1b-ii**, **f3 = 8 → 6b 순차**.
- 본 저장소는 실행 전후 모두 `HEAD 31c791f` · `git status` clean으로 확인했다(무수정).

### 지상 진실 (ground truth — 주석 안 예시 vs 주석 밖 실항목)

각 task 문서의 템플릿 주석에는 `- 외부 경계:` · `[미실측]` · `- exec-evidence` · `- verify-power` · `- fact-resolved` 형식 예시가 **각 1건씩** 들어 있다. 주석 밖 실항목은 아래가 전부다 — 검사가 이 표와 다르게 세면 오탐 또는 조용한 사망이다.

| task | fork | `- 외부 경계:` | `[미실측]` | `- exec-evidence` | `- verify-power` |
|---|---|---:|---:|---:|---:|
| T-102 (순수 로직) | f1 | 0 | 0 | 0 | 2 (implement가 기록) |
| T-103 (경계 (a)+(c), receipt 미기록) | f2 | 1 | 0 | **0** | **0** |
| T-101 (경계 (a)+(c)) | f3 | 1 | 0 | 2 (implement가 기록) | 3 (implement가 기록) |
| T-104 (경계 (a)+(c), receipt 사전 기입) | f3 | 1 | 0 | 2 | 3 |

### 시나리오별 기대 / 실측 / 판정

| # | 기대 | 실측 | 판정 |
|---|---|---|---|
| **1b-i** — 순수 로직 task + 주석 그대로 (`/implement-workitem T-102` → `/validate-workitem T-102`) | `- 외부 경계:`·`[미실측]`·`- exec-evidence` 전부 0건 판정. `Needs Execution Evidence` 미발화 | implement 출력: `실행 증거: 해당없음 — task ## 2에 외부 경계 표시 없음, 순수 함수(fs/process/network 미사용)` · `미실측 해소: 해당 항목 없음`. `## 8`에 `verify-power` 2줄만 기록(exec-evidence 0줄). validate report: `외부 경계: 해당없음` / `exec-evidence: 해당없음` / `미실측 잔존: 0건`, **finding 0건, Pass**(inline fallback F=3·L=38) | **통과** |
| **1b-ii** — 경계 (a)+(c) task를 구현해 둔 채 `## 8`은 **주석뿐** (`/validate-workitem T-103` 단독) | 주석 안 예시를 세지 않으므로 `- exec-evidence` 0건 → `P1 [Exec-evidence-missing]`이 **경계 종류마다** 발화. 동시에 `[미실측]`은 0건이라 `[Unmeasured-fact]` 미발화 | `P1 [Exec-evidence-missing] a` + `... c` **2건 발화**(사유를 *"task `## 8`이 HTML 주석뿐, 실 콘텐츠 줄 0개"* 로 명기) / `P1 [Verify-power-missing]` AC-1·2·3 **3건** / **`미실측 잔존: 0건`** — 근거를 *"`## 3` 실 콘텐츠 3단계 모두 `[미실측]` 마커 없음"* 으로 명기. **판정 Pass**(D7대로 차단 없음), fan-out 6축 | **통과 (양방향)** |
| **8** — 경계 (a)+(c) task 1개로 `implement → validate → finalize` 연속 (`T-101`) | ① finalize가 `Needs Validation`으로 끝나지 **않는다** ② `## 8`의 `- exec-evidence`가 경계 종류마다 = **2줄** | ① **커밋 `b2aa676` 성공**, status `in-progress → done`. finalize 출력이 근거를 스스로 인용: *"report mtime 19:03:02 > task doc/구현 파일 mtime 전부 → stale 아님"*(task 문서 18:55:21, 구현 파일 18:51~18:54) ② `- exec-evidence 2026-08-08 a: 등급 1 …` + `- exec-evidence 2026-08-08 c: 등급 1 …` **정확히 2줄, 둘 다 등급 1(재실행 가능 — `npm run validate`에 편입)**. validate finding 0건 Pass | **통과 (①②)** |
| **6b** — 전부 Reject한 repair 라운드 → 재validate (`T-104`) | 증거 관련 finding **0건**. repair 출력에 `실행 증거 갱신: 해당없음(외부 경계 코드 미수정)` | repair: **Adopted 0 / Adopt-modified 0 / Reject-FP 2 / Reject-context 1**, 수정 파일 0, 출력 마지막 줄 **`실행 증거 갱신: 해당없음 (외부 경계 코드 미수정)`**, report 삭제, status 무변경. `## 8`은 exec-evidence 2줄 **뒤에** repair 결정 이력 3줄이 붙은 형태(= D4가 (iii) 후보를 기각하며 지목한 바로 그 오탐 유발 배치). 재validate: `exec-evidence (a) ✅ / (c) ✅`, `verify-power AC-1~3 ✅`, `미실측 잔존 0건` — **증거 관련 finding 0건, Pass** | **통과** |

**ADR-064 `## Mutation Contract` 5의 반증 항목 매핑**: (g) 템플릿 주석 오탐/조용한 사망 — **미발화**. (h) all-Reject repair 라운드의 증거 관련 finding — **미발화**. (d) receipt가 report를 stale로 만들어 finalize 차단 — **미발화**. 셋 다 반증에 실패했다(= 해당 결정을 재조정할 근거가 나오지 않았다).

### 부수 관측 (요청 범위 밖이지만 같은 실행에서 확인된 것)

- **시나리오 2의 코어가 반복 확인됐다** — 경계 (a)+(c) task에서 exec-evidence가 **종류마다 1줄씩 정확히 2줄** 생성됐다(f3/T-101 실측 1회 + 아래 계측 결함으로 폐기된 f1/T-103 실행 1회, 서로 독립). f2/T-103은 0줄일 때 P1 2건 발화로 역방향 확인. "1건만 요구하면 복합 task가 `--help` 한 번으로 통과한다"는 근거(ADR-064 `## 근거` 마지막 줄)가 실행 층에서 지켜졌다.
- **D2가 실제로 공허한 단정을 하나 잡았다.** T-101 AC-3에서 builder의 최초 단정 `stderr.toContain('사용법')`이 *미등록 명령의 `default` 분기 메시지와 구별되지 않아 구현 전에도 통과*했고, builder가 그것을 스스로 보고 → foreman이 단정을 `'사용법: todo export <path>'`로 좁혀 판정력을 확보한 뒤 `verify-power` 줄에 그 경위를 남겼다. 판정력 규율이 장식이 아니라 실제로 발화한 사례다.
- **Red 관측 4상태 중 `unrecoverable`가 실사용됐다.** builder가 AC-1 Green 단계에서 전체 구현을 한 번에 써 버려 뒤 AC의 원 Red를 재현할 수 없던 회차에서, foreman이 `red=unrecoverable(<사유> — 대체 확인 …)`로 기록하고 대체 확인 수단을 함께 적었다. 4상태를 두지 않았으면 그 task가 영구 차단됐을 자리다. **단 그 사유는 D2가 이 상태에 적어 둔 `세션 중단 등`(외부 상황)이 아니라 builder의 RGR 붕괴(규율 실패)다** — 두 원인이 같은 라벨로 들어가고 validate는 `unrecoverable`을 정상값으로 통과시키므로, 후자의 빈도를 집계할 수단이 없다. ADR-064는 `ADR-009 RGR 3 phase`를 preserved invariant로 두었을 뿐 집행하지 않으니 결함은 아니지만, **RGR 붕괴 사유의 `unrecoverable` 사용은 차기 라운드 카운터 대상**이다(현재 값 1).
- **`mutation=미승격`이 전 회차 기본값으로 동작했다** — 승격 0건, 사유는 전부 `G2 미충족`(의심이 특정 단정으로 좁혀짐). 작업 트리 변형 시도 0건.
- **`[Exec-evidence-missing]`이 Pass를 막지 않았다** — f2/T-103은 ADR-064 관련 P1 5건(+ 그 외 P1 2건·P2 1건)을 안고도 판정 Pass였고, 출력에서 *"Needs Fix는 트리거하지 않지만 기록 보강 필요"* 로 등급을 정확히 진술했다. D7의 3중 방어선 배치가 실행 층에서 오해 없이 읽혔다.
- **fixture 자체의 참 양성 3건**(보일러플레이트 결함 아님): f2에서 `P1 [Arch-layer-3-1]`(심어 둔 `src/archive.ts`가 ARCH `## 3-1`의 "`store.ts`만 디스크 I/O" 경계 밖에서 직접 파일 I/O) + `P1 [Arch-iface-7-2]`(`TODO_ARCHIVE_PATH` 컨벤션 미문서화), f3/T-104 재validate에서 `P2` diff-trace (b)(직전 커밋이 빠뜨린 usage 문자열 갱신을 이번 task가 무관하게 동봉). 셋 다 **닫힌 결정 위반이 아니라 P1/P2로 정확히 등급 분기**됐다(ADR-061 D1 정합).

### 계측 결함 1건 (보일러플레이트 결함 아님 — Round 9 D-1과 같은 계열)

최초 러너가 `Start-Process -ArgumentList` **배열** 형태로 인자를 넘겨 슬래시 커맨드의 인자가 유실됐다 — 세션 transcript 확인 결과 첫 user 메시지가 `<command-name>/implement-workitem</command-name>`뿐이고 `T-102`가 없었다. `$ARGUMENTS` 없이 받은 그 실행은 **fixture에서 유일하게 `in-progress`였던 T-103을 스스로 골라 재개 구현**했다(합리적 해석이지만 측정 대상이 아님). 산출물은 별도 보존하고 fork를 reset한 뒤, 러너를 **단일 인자 문자열**(`-p "…" --model sonnet`)로 고쳐 재실행했다. 교훈은 Round 9 D-1과 동일 — **계측기를 먼저 반증하지 않으면 오라클 자체가 결함이 된다.**

### 한계 / 미실행 (정직 기록)

- **6b의 입력은 고정 입력(planted report)이다.** `validate → Needs Fix`를 실제로 유도하지 않고, 전부 Reject 가능한 finding 3건(P0 dead-code 삭제 오주장 / P1 테스트 부재 오주장 / P1 `## 4. 제외 항목`이 배제한 확인 프롬프트 요구)을 담은 report를 손으로 심었다. 이유는 결정성 — repair의 4-판정이 *전부 Reject*가 되는 상태를 확률에 맡기면 6b 자체가 측정되지 않는다(ADR-061 Mutation Contract 5-(a)의 "게이트 검증에 implement를 매개시키지 않는다"와 같은 근거). **따라서 6b가 확인한 것은 "all-Reject 라운드 뒤 재validate가 증거 관련 오탐을 내지 않는다"이고, "validate가 그런 Needs Fix를 낸다"는 확인 대상이 아니었다.**
- **시나리오 6(코드를 실제로 고친 repair 라운드 → exec-evidence 신규 append)은 실행하지 않았다.** 이번 지시 범위 밖이며, D4가 명시한 구멍(*repair가 외부 경계 코드를 고치고도 갱신을 조용히 건너뛰는 경우*)은 여전히 실측 0이다.
- **나머지 반증 시나리오 1·3·4·5·7도 미실행**(지시 범위 밖). 특히 3(모노레포 자기 API 호출 → (b) 미해당)은 이 fixture가 단일 패키지 CLI라 자극 자체가 불가능하다.
- **`--waiver` 경로 미실행** — 증거를 확보할 수 없는 환경을 만들지 않았으므로 `Needs Execution Evidence` 정지와 waiver 해제 경로는 이번에 한 번도 발화하지 않았다. **D1의 실질 차단 지점이 미검증으로 남는다**(D7이 "여기가 유일한 실질 차단"이라고 못 박은 자리라 우선순위가 높다).
- **ADR-017 성공 기준 3지표는 산정하지 않았다** — discover/bootstrap/plan/seal 구간을 돌리지 않은 targeted 준수도 샘플링이라 placeholder 충원율·graduation pre-check의 분모가 성립하지 않는다. Round 9의 gate 3/3과 같은 축으로 비교할 수 있는 회차가 아니다.
- 비용은 미계측(`--output-format text`가 result 레코드를 내지 않는다). 실행 시간은 세션 기준 f1 implement+validate 6.2분 / f2 validate 6.1분 / f3 implement+validate+finalize 16.7분 / f3 repair+재validate 6.3분.

### 결정에 미친 영향

- **ADR-064의 D4 판독 규칙(주석 밖만 센다)은 실행 층에서 양방향으로 작동한다** — 순수 로직 task를 경계 task로 오인하지 않았고(1b-i), 증거가 없는 경계 task를 "증거 있음"으로 통과시키지도 않았다(1b-ii). 후자가 무너졌다면 **오탐보다 나쁜 조용한 사망**이 됐을 자리이며, 그 실패는 재현되지 않았다.
- **D4 시점 계약(파일 변경 후 · validate 이전)이 finalize 교착을 실제로 막는다** — mtime 순서가 예측대로 형성됐고, finalize가 그 순서를 판단 근거로 *명시 인용*했다. (d) 실패 경로는 발화하지 않았다.
- **D4가 자동 신선도 검사 3후보를 전부 기각한 판단이 6b로 뒷받침됐다** — 정상 all-Reject 라운드가 만드는 `## 8` 배치(exec-evidence 뒤에 repair 결정 이력)는 (iii) 줄-순서 검사였다면 정확히 오탐이 났을 형태인데, 검사를 두지 않았으므로 finding 0건이었다.
- **남은 최우선 미검증은 D1의 차단 경로다** — `Needs Execution Evidence` 정지와 `--waiver` 해제는 이번 3 시나리오가 건드리지 않았고, D7이 "실질 차단은 여기 하나뿐"이라고 배치한 지점이라 **차기 라운드 1순위**다(증거 확보 불가 환경 fixture 1개면 잰다).
- **차기 라운드 후보**: (a) `Needs Execution Evidence` + `--waiver` 실측 · (b) 시나리오 6(코드를 고친 repair의 exec-evidence 재기록) · (c) D4가 명시한 구멍(repair가 갱신을 조용히 건너뛰는 사례) 누적 관측 — ADR-064가 "2회 이상이면 라운드 식별자 기반 구조화 스키마로 승격"이라 규정한 카운터의 현재 값은 **0** · (d) 나머지 반증 시나리오 1·4·5·7.

## Round 11 (2026-09-11~, todo 웹앱 / Next.js + Storybook — ADR-070~073 적용 검증)

> **진행 중** — 본 절은 `/stack-guard`·`/bootstrap-design`·`/design-milestone`·`/plan-workitem`·`/seal-milestone`·첫 구현 task까지 수행한 시점의 기록이다. 단계별 마찰점·성공 기준 충족·결정에 미친 영향은 라운드 완주 후 채운다.
> isolated fork (baseline `6207cde`). 실제 Node 24.20 / pnpm 10.33 / Next 16.3.4 / Flutter 미사용. 수행 방법의 한계는 Round 8·9와 같다 — `disable-model-invocation: true`인 메인 세션 skill 구간은 에이전트가 SKILL.md대로 **실제 명령 실행·실제 커밋을 동반해** 수작업 재현했고, builder·validator 위임만 진짜 sub-agent 실행이다.

### harness 발견 → 조치

| # | 발견 | 등급 | 조치 |
|---|---|---|---|
| 1 | design gate command template `<pm> validate:design -- <args>`가 pnpm에서 `exit 2` — pnpm은 `--`를 스크립트 인자로 그대로 넘기고 어댑터가 «미정의 플래그»로 본다 | P1 | **수정** — 어댑터가 bare `--`를 무시(ADR-072#amend-1 결정 1). 템플릿·skill에 PM 차이 명시. 실측 재확인: 같은 명령이 pnpm에서 3케이스 PASS |
| 2 | `next dev`가 실행마다 `AGENTS.md`에 자기 규칙 블록 10줄을 append(57→67줄). stack-guard 보호 경로 대조가 수행 0 전후만 돌아 못 잡음 | P1 | **수정** — `/stack-guard` 수행 0-H 신설(실행 시작·종료 harness 경로 해시 대조, 보고 등급·자동 되돌림 없음) + 마지막 출력 항목(ADR-071#amend-1 결정 1) |
| 3 | «자가 검사 4케이스»가 웹 전용 프로젝트에서 도달 불가 — (d)는 `pubspec.yaml` scope 전용이라 정상 결과가 3케이스 | P2 | **수정** — 판정 기준을 «케이스 수»에서 «실행된 케이스가 전부 기대와 같은가»로 정정(ADR-072#amend-1 결정 2). registry `self-test 일자`에 케이스 수 병기 |
| 4 | `storybook init`(v10)이 결정 집합 밖 애드온 4종 + `vitest.config.ts`를 함께 설치. 「viewport 애드온」은 SB 8부터 존재하지 않음(코어 global) | P2 | **수정** — 카탈로그 기본 후보를 «a11y 애드온만»으로 정정 + 설치 직후 결정 밖 애드온 제거 명시(ADR-071#amend-1 결정 2) |
| 5 | `/validate-workitem` inline 임계(`L≤50`)가 TDD task에 낮다 — T-001(순수 함수 4개 + 테스트) 실측 **F=6·L=91**로 초과해 6축 fan-out 강제(재량 0). 축 2 단독 176초 / 6축 subagent 토큰 약 16만 | P2 | **기록만** — ADR-051#amend-4가 «실측 전 추정치, 재보정 창구»라 명시한 값의 첫 실측이다. Round 12 실측을 더한 뒤 재보정한다(단일 표본으로 임계를 옮기지 않는다) |
| 6 | foreman이 `/implement-workitem` 6-R(receipt 기록)을 건너뛰고 validate로 진행 — 축 7 validator가 `P1 [Verify-power-missing] AC-1..3`으로 사후 검출 | P1 | **수정** — 6-R 앞에 누락 방지 문단 + 마지막 출력에 `receipt 기록 (6-R)` 필수 항목 신설(없으면 «6-R 미수행») |
| 7 | builder의 «Red»가 모듈 부재 import 실패로 끝남 — 어설션이 0건 실행돼 판정력 근거가 아님(가짜 Red의 가장 흔한 형태) | P1 | **수정** — implement Red phase 정의와 `builder.md`에 «모듈 부재·컴파일 오류로 0건 실행은 Red가 아니다 — 의도적 오구현을 먼저 두고 어설션 실패를 관측» 명시. **완화 확인됨**: 같은 문구를 넣은 T-003 dispatch에서 builder가 실제로 오구현 → 어설션 실패 3종 관측 후 구현 |
| 8 | `/bootstrap-design` R6-1 테마 배선이 DESIGN `## 9` 포커스 링 규정을 배선하지 않아, 승인 화면에 브라우저 기본 파란 포커스 링(팔레트 밖 색)이 렌더됨. 인라인 스타일로는 의사 클래스 표현 불가 | P2 | **수정** — R6-1에 «의사 클래스가 필요한 상태 규정은 전역 CSS로 함께 배선» 명시 |
| 9 | 단일 라우트 앱에서 «화면»이 라우트가 아니라 상태 묶음이 된다 — ADR-072 R1의 «feature당 대표 1화면»이 흔들림 | 관측 | **기록만** — 각 브리프에 «화면 도출 메모»로 승격 근거를 남기는 것으로 이번 라운드는 해소. 반복 관측되면 R1 문구 후보 |
| 10 | `create-next-app`이 `AGENTS.md`·`CLAUDE.md`·`README.md`를 생성 — 수행 0 보호 경로 목록이 정확히 셋을 막음(복사 직전·직후 201파일 해시 동일) | 관측 | **조치 불요** — ADR-071 D5 보호 규칙이 실제로 작동한 첫 관측. 발견 2는 그 규칙의 *시점*이 좁다는 별개 문제 |
| 11 | `todo-add` 프로토타입에서 「추가」가 `disabled`면 브라우저 암묵 제출이 없어 **공백 입력 + Enter가 무반응** — 브리프의 `invalid` 상태가 구현에서 도달 불가였다 | 관측 | **조치 불요** — R4 인터랙션 계약 테스트가 Red로 잡아 `onKeyDown`으로 해소. ADR-072 D5 «행동 계약은 게이트·테스트»의 실효 사례 |
| 12 | `/plan-workitem` cross-feature seam self-check가 실제 계약 충돌 검출 — PX-M1-todo-empty-error-04(읽기 실패 중 입력 가능) ↔ «실패한 읽기 위에 덮어쓰지 않는다» | 관측 | **조치 불요** — INV-2(«`error` 중 추가는 재읽기 성공 후에만 저장»)로 확정. ADR-057 결정 12가 의도대로 작동 |
| 13 | `--tokens-only`의 단축 hex가 카피 문구를 오탐 — 실측 18건 중 6건이 「PR #412」의 `#412` | P2 | **수정** — 스타일시트에서만 3~8자리, 코드 파일은 6·8자리만 탐지(ADR-072#amend-1 결정 3). 재실측 18 → 12건, 오탐 0건 |
| 14 | builder effort 실험(ADR-004#amend-4 결정 3) 조건 (a)~(d) — `.claude/agents/builder.md` frontmatter 수정이 auto 모드 분류기의 `[Self-Modification]`에 걸려 1차 중단 | 환경 | **사용자 승인 후 수행** — 결과는 `## Builder Effort Experiment` 절. **frontmatter hot-reload 는 «편집 직후 dispatch 하면 반영 안 되고, 시간이 지난 뒤 dispatch 하면 반영된다»**: 편집 직후 preflight(`maxTurns: 1`)는 3 step 완주했고, 대기 후 dispatch 한 조건 (b)(`maxTurns: 20`)는 **tool_uses 정확히 20 에서 상한 중단**됐다. 조건 전환 사이 대기가 실험 설계의 필수 조건이다 |

| 15 | `[Spec-gap]`이 «매핑은 있으나 의미가 빈» 경우를 못 잡는다 — F-002의 FAC-1(새로고침 유지)·FAC-5(쓰기 실패 알림)가 둘 다 T-004:AC-3를 가리키는데 그 AC 본문은 INV-2 시나리오다. unmapped가 아니라 발화하지 않는다 | P2 | **기록만** — ADR-037 커버리지 검사는 «우변이 실재하는가»만 본다. 의미 대조는 자동 판정이 어려워 validate 축 3의 *기록 등급 관찰*로 두는 것이 현실적이다. Round 12에서 재관측 후 문구화 판단. **수정(발견 21·22와 묶음)** — plan 시점 처방으로 전환: `/plan-workitem` **3-S (c)** 가 `## 7-1` 매핑 행마다 «증명: AC-M 의 <조건>이 FAC-N 의 <요구>를 검증한다» 1줄을 요구하고, 쓸 수 없으면 AC 를 고치거나 추가하게 한다. validate-plan `[Plan-FAC-coverage]`·reviewer 동일 차원에 미러(P1, unmapped 와 구분 보고). FEATURE_TEMPLATE `## 7-1` 주석이 행 형식 SSOT (ADR-072#amend-2) |
| 16 | 축 5(UI Design inventory)가 «UI 프로젝트» 신호만으로 매번 spawn — `.tsx`를 하나도 안 건드린 T-003에서도 validator 한 명이 «해당없음»만 반환 | P2 | **기록만** — spawn 신호를 «diff에 UI surface 파일이 있음»으로 좁히는 안. 발견 5와 함께 Round 12 실측 뒤 재보정 |
| 17 | 비용 압력이 실제 규칙 이탈을 만들었다 — T-003 validate에서 foreman이 «1축=1 validator»를 어기고 축 3·8을 한 validator에 합쳤다(리포트 `## Orchestration`에 이탈로 기록) | 관측 | **기록만** — 발견 5의 임계 문제가 «규칙을 어기게 만드는» 형태로 드러난 실측. 실측 비용: T-001 6 dispatch/약 16.3만 토큰, T-003 5 dispatch/약 14.6만 토큰, 최장 축은 둘 다 diff-trace(176초/99초) |

| 18 | **계획이 승인 UI 계약상 배선 불가능한 계측 이벤트를 요구했다** — T-002 `## 3` step 5와 F-001 `## 8-1`이 `todo_add_rejected`(공백 거부) 이벤트를 지정했으나, 승인된 `TodoAdd` 프로토타입은 공백 제출을 **내부에서 삼키고 콜백을 부르지 않는다**. 배선 계층에서는 그 시도를 관측할 수단이 없다 | P1 | **기록만(봉인 후 발견)** — 억지 분기를 넣으면 도달 불가 dead code가 되어 ADR-006 self-check 위반이다. 해소하려면 `TodoAdd`에 `onReject` 콜백이 필요하고 그건 **승인 UI 시그니처 변경**이라 `/design-milestone` 재진입 또는 다음 M 사안이다(ADR-060 D6). **수정** — `/plan-workitem` 3-I에 «승인 UI로 배선 가능한 계측만 authoring한다» 한 줄 추가: 매니페스트 `source[]` 의 컴포넌트 시그니처로 발화 가능성을 대조하고, 불가능하면 line item 대신 «남은 미결정 사항» 에 `- 계측 배선 불가: <이벤트> — 승인 UI `<screen>` 에 콜백 없음` 으로 surface. 원인은 3-P(승인 UI 재사용)와 3-I(계측)가 서로를 보지 않는 것이었다. **최종 조치** — 3-I 의 한 줄을 `/plan-workitem` **3-S (b)** 로 흡수(3-I 는 포인터만) — 발견 15·21·22 와 한 묶음의 «승인 표면 대조 self-check» (ADR-072#amend-2). **4조건 중 2조건(b·c)이 독립적으로 같은 충돌을 발견했고, 나머지 2조건(a·d)은 도달 불가 dead code를 넣었다** — 구조적 결함의 실측이다 |

| 19 | **stack-guard가 생성한 `visual-qa.spec.ts`의 전제가 조용히 무효가 된다** — spec은 `localStorage.todos.v1`을 seed해 populated 상태를 스스로 만든다(ADR-058#amend-3 ①). 그런데 저장소 배선 task(T-004)가 끝나기 전에는 앱이 그 값을 읽지 않아 **seed가 무효**이고, spec은 빈 목록 상태에서 overflow·axe를 돌고 **통과한다** | P2 | **기록만** — «spec이 전제를 소유한다»는 규정은 *spec 쪽*만 보장할 뿐, **앱이 그 전제를 소비하는지**는 보장하지 않는다. ADR-058#amend-3이 막으려던 vacuous pass가 «skip 대신 통과»라는 다른 형태로 나타났다. 후보: spec이 seed 주입 뒤 **그 seed가 화면에 반영됐는지**(대표 항목 1건 존재)를 먼저 단언하고, 아니면 실패시킨다. Round 12(Flutter — seed 수단이 다름)에서 같은 형태가 나오는지 보고 처방 |
| 20 | `--tokens-only` 어댑터가 **단위 없는 숫자 리터럴**을 잡지 못한다 — `style={{ maxWidth: 640 }}` 는 `\b\d+px\b` 에 걸리지 않는다(T-002 실측, foreman이 눈으로 발견해 토큰으로 교체) | P2 | **기록만** — JS 스타일 객체는 단위 없는 숫자를 px로 해석하므로 실질적 raw 리터럴이다. 다만 «모든 숫자»를 잡으면 오탐이 폭발한다(배열 인덱스·카운트). 후보: 스타일 객체 문맥(`style={{ … }}`) 안의 숫자만 보는 좁은 규칙. 발견 13의 반대 방향 문제라 함께 재보정 |

| 21 | **계획이 신규 UI 요소를 DESIGN 인벤토리 등록 없이 지시했다** — T-004 `## 3` step 5가 저장 실패 배너(「저장하지 못했어요…」)를 지시하면서 `+ DESIGN.md ## 7 등록` line item을 두지 않았고, 어떤 AC도 그 배너를 요구하지 않는다. 결과: 승인 프로토타입 3종 어디에도 없는 신규 요소가 DESIGN `## 7` 미등록 상태로 제품에 들어갔다(`P1 [Design-inventory-planless]`) | P1 | **기록만(봉인 후 발견)** — ADR-073 D8은 «인터페이스 요소 신설 시 `## 7` 등록»을 규정하고 implement step 5는 «plan이 박은 등록 line item을 builder가 같은 커밋에 기계적으로 수행»한다고 정한다. **등록의 출발점이 plan인데 plan이 그것을 빠뜨렸다.** 검출 자체는 됐다 — `[Design-reuse-drift]`는 *승인 파일의 변경*만 보므로 새 파일의 신규 요소엔 원리상 발화하지 않지만, **validate 축 5가 `P1 [Design-inventory-planless]`로 잡았다**. 문제는 그 검출이 **계획 시점이 아니라 구현이 끝난 뒤이고 비차단 기록 등급**이라 이미 제품에 들어간 뒤라는 것이다. 발견 18과 **같은 계열의 네 번째 사례**다 — (i) 계측 이벤트가 승인 UI 콜백에서 발화 불가(18) (ii) `source` 구분 불가(T-002) (iii) 재읽기 실패 시 입력 유지 불가(T-004) (iv) 신규 UI 요소 미등록(본 건). 공통 원인은 **`/plan-workitem`이 승인 UI·DESIGN 인벤토리와 대조하지 않고 `## 3`를 authoring하는 것**이다. 3-I에 넣은 규칙은 계측만 덮으므로 3-P 쪽 확장이 필요하다. **수정(발견 15·18·22와 묶음)** — `/plan-workitem` **3-S (a)**: `## 3` 의 사용자 가시 요소는 ① 승인 매니페스트 실재 ② DESIGN `## 7` 재사용 ③ 신규(+ `## 7` 등록 line item, 승인 화면의 시각 표면을 바꾸면 재승인 경로 surface) 중 하나여야 하고, 대응 AC 0개도 surface 한다. validate-plan `[Plan-design]`·reviewer 동일 차원에 미러(P1) (ADR-072#amend-2) |
| 22 | **`[FAC-semantic-hollow]` 누적 6건 — 두 feature 전부, 네 task 전부에서 나왔다** (F-002 FAC-1·FAC-5는 T-003·T-004 두 라운드에서 «미해소»로 재확인, F-001 FAC-2·FAC-3은 T-002에서) | P2 | **승격 후보** — 앞서 발견 15로 «기록만» 처리했으나 재현율이 100%다. ADR-037 커버리지 검사가 «우변이 실재하는 task:AC를 가리키는가»만 보므로 «그 AC가 그 FAC를 검증하는가»는 전 경로에서 아무도 안 본다. **계획 시점 처방만 먼저 적용했다** — 3-S (c) 증명 문장(ADR-072#amend-2). 구현 후 처방인 «validate-workitem 축 3 기록 등급 필수 승격»은 **승격 후보로 유지**하고 Round 12 에서 계획 시점 처방만으로 재현이 끊기는지 먼저 본다(효과가 겹치면 승격 불요) |
| 23 | **승인 스냅샷이 story 데코레이터 마크업을 포함해 «승인본 = 제품» 등식이 깨진다.** 게이트는 `preview: story:*` 를 렌더하므로 데코레이터가 주입한 요소가 승인 이미지에 들어간다. 실측: `TodoEmptyError.stories.tsx` 데코레이터가 `<h1>오늘 할 일</h1>` + 640px 컨테이너 + 패딩을 주입했고 `TodoEmptyError.tsx` 자체에는 h1이 없다. 그 요소는 컴포넌트에도 `handoff.remaining_wiring[]`에도 없어 **배선 task가 제품에 만들 근거를 어디서도 받지 못한다** | **P0** | **규칙 확정 / 탐지기 보류 (ADR-072#amend-3)** — 결과가 결정적이다. proto 재렌더 ↔ 승인 스냅샷 **12/12 바이트 동일**(D5-4 `[Design-reuse-drift]` 통과)인데 제품 empty/error 상태의 h1은 **0개**다(직접 관측). 즉 P7-2 성공 기준 «재사용 task 표현 diff 0»이 **vacuous하게 충족**된다 — 비교 대상이 애초에 제품이 아니다. 같은 메커니즘이 컨테이너 폭(292px vs 640px)도 설명한다. 처방 후보: (a) 매니페스트 `decorator_provides[]` 요구 + `handoff.remaining_wiring[]` 자동 편입 (b) 게이트가 데코레이터 없는 렌더를 추가 대조 (c) `product_entry`가 있는 화면은 승인 시점에 제품 렌더도 함께 승인 (d) 스토리 데코레이터를 레이아웃 전용으로 제한. **§3-V 경험 게이트가 없었다면 M1은 제목 없는 화면으로 졸업했다**. **채택 (2026-09-11)** — 후보 (a)·(c)를 기각하고 (d)를 규칙으로 박았다: «미리보기 하네스(스토리 데코레이터·위젯 테스트 wrapper)는 테마·뷰포트 provider 만 두고 가시 요소를 추가하지 않는다. 화면의 가시 요소는 전부 매니페스트 `source[]` 에서 나온다». fan-out 3곳 — ADR-072 D3·D4 부기 + `/design-milestone` R6-5 승인 체크리스트 「하네스 요소 0」 + `builder.md` ui-authoring 모드. **탐지기(후보 b — 데코레이터 없는 렌더 추가 대조)는 Round 12(Flutter wrapper) 재관측 뒤로 미룬다** — 「규칙은 지금, 탐지기는 나중」 |
| 24 | **stabilize 팬아웃 단위가 verifier `maxTurns`를 보고 전에 소진한다** — qa 16 / reviewer 12. 5단위 중 **4단위**가 보고 0건으로 한도 도달(a11y qa 22 / code reviewer 25 / design reviewer 34 / F-002 qa 21 tool_uses) | P1 | **수정 (ADR-004#amend-6)** — 값을 올리는 대신 **에이전트가 자기 `maxTurns` 를 알고 `maxTurns − 4` 턴에 보고를 시작**하게 했다(report-only 11종 본문에 「턴 예산」 절). 미완 보고를 «확정 사실 + 미확인 항목» 두 묶음으로 내는 것을 정상 산출로 규정했다. **`maxTurns` 값 자체는 올리지 않았다** — 세 번 다 재개로 완주했으므로 상한이 근본적으로 모자란다는 근거가 아직 없고, 반복되면 그때 본다(amend-6 falsifier (a)) |
| 25 | **report-only verifier가 read-only 계약을 깰 뻔했다** — F-002 qa 단위가 «스크립트를 프로젝트 안으로 복사해 실행»(node_modules 경로 해석 회피)을 다음 행동으로 잡은 채 턴 한도에 걸렸다 | P1 | **기록만** — `qa.md` tools에 Bash가 있고 「파일 수정 금지」는 산문 규율뿐이라, 브라우저 구동 검증에서 모듈 해석이 막히면 «프로젝트에 쓰기»가 가장 쉬운 해법으로 보인다. 한도가 아니었으면 썼을 것이다. 처방 후보: qa/validator 위임 프롬프트에 «작업 파일을 프로젝트에 만들지 않는다 — cwd 기준 `node -e` 또는 스크래치 경로» 한 줄, 또는 §3-V·3-P가 검증 스크립트 실행 방법을 미리 지정 |
| 26 | **stabilize 5-2 raw-hex 정규식이 ADR-072#amend-1 fan-out에서 누락됐다** — amend-1 결정 3은 design-gate의 단축 hex를 스타일시트로 한정했는데 동형 정규식을 가진 stabilize §1.0 5-2는 그대로다(그 amend의 `### 적용 surface`에 stabilize가 없다). 실측 오탐 5건(`PR #412`) | P1 | **수정 (2026-09-11)** — stabilize §1.0 5-2 웹 계열을 갈랐다: 스타일시트(`.css`/`.scss`/`.sass`/`.less`)는 3~8자리 그대로, 그 밖의 코드 파일은 **6·8자리만**. design gate 어댑터와 같은 규칙이다. ADR-072#amend-1 의 `### 적용 surface` 에 stabilize 행을 추가해 fan-out 누락을 닫았다. Dart 계열 5-2 는 Round 12 에서 오탐이 관측되지 않아 그대로 둔다(`Color(0x…)` 는 형태가 고유해 «#숫자» 혼동이 없다). amend-1 작성 시 «같은 정규식을 쓰는 다른 surface»를 찾지 않은 것이 원인 — surface 열거가 «이 ADR이 만든 파일»에 갇혔다 |
| 27 | **stabilize 5-2b voice grep이 DESIGN `## 10` 규칙의 적용 범위를 넓힌다** — 「내부 키 노출」은 *화면 카피* 대상인데 grep은 변경 파일 전체를 본다. 실측 오탐 10건(`localStorage`·`todos.v1`·`QuotaExceededError`) | P1 | **기록만** — 저장 어댑터를 가진 모든 프로젝트에서 재현된다. 문자열 리터럴 안인지 식별자인지 구별하려면 파서가 필요하므로, 현실적 처방은 (a) 대상을 «사용자 노출 경로 파일»로 좁히거나 (b) 등급을 기록 등급으로 내리는 것이다. Round 12 재관측 후 판단 |
| 28 | **`[Guard-drift]` (b)가 sha 불일치의 방향을 구분하지 않는다** — 이 fork는 사본(`scripts/design-gate.mjs` = `e0cb8fc…`, 라운드 중 버그 3건을 고친 수정본)이 canonical(`.claude/skills/stack-guard/assets/…` = `4cabb44…`)보다 **새롭다**. 규칙은 「canonical 갱신됨 — `/stack-guard` 재실행 권장」 한 가지만 처방하고, 그 재실행은 사본의 수정을 구본으로 덮는다 | P1 | **기록만** — 처방이 관측된 방향에서 **파괴적**이다. 실프로젝트에서 어댑터 버그를 사본에서 고치는 것은 자연스러운 행동이므로 드문 경로가 아니다. 처방 후보: (b)가 canonical·사본의 mtime이나 내용 포함관계로 방향을 판정하고, 사본이 앞서면 「사본 수정분을 canonical로 역류시킬지」를 묻는 별도 문구를 낸다 |
| 29 | **6.5 시그널 1(DISCOVERY mtime > Charter)이 harness 자신의 쓰기에 발화한다** — `/seal-milestone`이 `## 12` 가정 표에 쓴 원장 상호참조 3줄(`(미검증)` → `(미검증 — 원장 D-012 risk-accepted)`)만으로 P1 「DISCOVERY ↔ Charter drift 의심」이 뜬다 | P2 | **기록만** — 매 마일스톤 재현되는 정기 오탐이다. 처방 후보: charter 공급 절(페르소나·핵심 시나리오·핵심 가정)의 **내용 해시**를 비교하거나, `## 12` 가정 표 갱신을 시그널 1에서 제외 |
| 30 | **`## 6-1`의 «같은 AC 다중 modality 행» 계약이 없다** — T-004 AC-1이 `[자동 테스트]{integration}`와 `[사용자 관측]` 두 행으로 존재한다(둘 다 정당 — 텍스트는 기계 검증, 여백·위계는 사람 관측) | P2 | **기록만** — ADR-065는 「AC마다 modality를 지정한다」고만 해서 행 단위 다중 지정의 허용 여부가 불명이고, 자동화율 분모가 AC 수(3)가 아니라 행 수(4)가 된다(T-004 report 75%, 신뢰도 Medium). 졸업 item 4는 `## 6-1` 전수 스캔이라 정상 동작했다. 허용을 명문화할지 «AC를 쪼개라»로 갈지 Round 12에서 재관측 |
| 31 | **계측 계약 검사가 «속성 값 도메인이 산출 가능한가»를 보지 않는다** — F-002 `## 8-1`의 `todo_load_failed.reason` enum에 읽기 경로에서 산출 불가능한 `quota`가 봉인된 채 들어 있다(`LoadResult.reason`은 `'exception'|'parse'`뿐, `quota`는 `SaveResult` 쪽) | P2 | **기록만** — 발견 18의 변종이다. ADR-072#amend-2 3-S (b)는 「이벤트가 승인 UI 콜백에서 발화 가능한가」까지만 보고 속성 값 도메인은 보지 않는다. 3-S (b)의 자연스러운 확장이나, 지금 넓히면 계획 단계 검사가 구현 타입까지 읽어야 하므로(plan은 아직 코드가 없다) **구현 후 검사(validate 축 3) 쪽이 제자리일 수 있다** — Round 12 재관측 후 위치 결정 |
| 32 | **preflight의 grep 항목이 «검사 대상 파일 0건»과 «위반 0건»을 구분하지 않는다** | P2 | **기록만** — 본 라운드에서 실제로 한 번 그렇게 통과했다(파일 목록 변수가 비어 grep이 전부 «0건»을 반환; 재실행으로 발견). 5-0이 회수 실패를 `[Stabilize-recovery]`로 처리하긴 하나, 회수는 성공했는데 **전달이 비는** 경우는 덮지 못한다. 처방 후보: 5-0이 회수한 파일 수를 출력에 echo하도록 요구(한 줄) |

> **발견 33~51 은 P7-2 11단계(수리·수렴 루프)·P7-3b 회귀 7종·P7-3 Round 12 `/stack-guard` 에서 나왔다.**
> 번호는 harness 발견의 단일 연번이라 관측된 라운드와 무관하게 이어 붙인다.

| 33 | **ADR-070 D1 의 시각 drift 규칙이 발견 23 계열을 구조적으로 비차단으로 내려보낸다.** M1-003(empty/error 의 화면 제목 0개)은 §3-V 경험 게이트가 **잡아낸** 결함인데, 위반 계약을 전수 대조하니 0건이라 D1 대로 `P1 [Experience-drift]` 가 됐다 — 그 요소가 승인본에 있었던 유일한 근거가 하네스 주입이었기 때문이다(발견 23). 즉 **하네스가 주입한 요소는 정의상 어떤 계약에도 없으므로, 그로 인한 제품 결함은 영원히 P1 이고 졸업 item 5 를 통과한다** | P1 | **조치: 기록만 (2026-09-11 사용자 확정)** — ADR-072#amend-3 이 하네스 주입을 금지했으므로 **앞으로는 이 상황이 생기지 않는다.** 33 은 amend-3 *이전에* 만들어진 승인본에만 남는 부채이며, 그 부채를 계약으로 승격하는 자리는 `/design-milestone` R6-5 의 「하네스 요소 0」 체크와 DESIGN `## 7` 등재다. D1 문안은 건드리지 않는다 |
| 34 | **ADR-070 D3 에 «Adopt 이지만 본 skill 책임 경계 밖이라 이번 라운드에 못 고치는» 상태가 없다.** 4-판정 어느 값도 그 항목을 닫지 못하는데 D3 는 「판정 없이 원본을 open 인 채 두지 않는다」고 한다. 실측: repair round 1 에서 `M1-002`(승인 `TodoAdd` 시그니처 변경 필요)·`M1-004`·`M1-003`(화면 셸 신설 = 승인 UI 재구성) 3건이 그 상태였다. `needs-confirmation` 은 «판정된 open» 으로 명문화돼 있는데 이쪽은 대칭 자리가 없다 | P1 | **수정 (ADR-070#amend-1 결정 1)** — `Adopt` 의 하위 상태로 `blocked` 를 뒀다: 원본에 `- 판정: Adopt — blocked: <경로>` 를 달고 `status: open` 을 유지한다. `needs-confirmation` 과 같은 «판정된 open» 이라 졸업 item 5 를 계속 막고, `Reject-context` 로 적어 `resolved` 가 되는 것을 명시 금지했다 |
| 35 | **repair-milestone 2-V (i) 의 «회귀 테스트가 통합 `validate` 에 묶여 있는지» 가 브라우저 매체 결함에 성립하지 않는다.** `M1-001`(reflow 후 같은 좌표 재클릭)·`M1-005`(렌더 폭)은 jsdom 으로 재현되지 않아 e2e 로만 고정된다. e2e 는 `validate:e2e` 이고 졸업 검사도 item 2 가 아니라 item 3(E2E hard-block)이 한다. 문구가 item 2 만 언급해 정상 배치가 «묶이지 않음» 으로 읽힌다 | P2 | **수정 (2026-09-11)** — 2-V (i) 를 「통합 `validate` 에 묶여 있는지」에서 「**그 매체의 졸업 검사**에 묶여 있는지」로 고쳤다. 단위·통합은 item 2, 렌더 엔진이 필요한 회귀는 `validate:e2e`(item 3 E2E hard-block)다 |
| 36 | **IMPROVEMENT_GUIDE `## 5` 스키마가 자기모순이다.** 「본 라운드의 P0/P1 항목 **전부**를 append」와 「본 절은 closed records 이므로 `status: applied` + 수리 판정값을 가진 항목만 담는다」가 같은 절에 있다. Reject-FP·Reject-context 는 `applied` 가 아니다. 실측: round 1 의 Reject-FP 2건을 `M1-repair-4`(`status: applied` + `decision: Reject-FP`)로 적어 형식은 지켰으나 `applied` 가 사실이 아니다 | P2 | **수정 (2026-09-12 사용자 확정 — `status` 를 `closed` 로 고정)** — `## 5` 의 `status` 는 항상 `closed`(「이 건은 끝났다」)이고 **적용 여부는 `decision` 이 말한다**(`Adopt`·`Adopt-modified` = 고쳤다 / `Reject-FP`·`Reject-context` = 고치지 않고 그 판단으로 닫았다). `applied` 를 금지어로 명시했다 — 두 축을 한 칸에 섞으면 **기각 항목을 적을 자리가 없어진다**. IMPROVEMENT_GUIDE 템플릿 + repair-plan·repair-milestone·repair-acceptance 예시 4곳 정정. **부수 증거**: 이번 라운드에 `/repair-plan` 로그를 쓸 때 문서를 안 보고 `status: closed` 를 골라 썼다 — 스키마가 없던 값이 자연스러운 값이었다 |
| 37 | **instruction-improvement 그룹이 repair 회수 대상에 섞인다.** `### M<N> — instruction improvement 후보` 가 `## 2. 열린 항목` 안에 있어 `/repair-milestone` 의 «`## 2` 안 `### M-N` 그룹 open 회수» 규칙에 걸리지만, 그 항목들은 boilerplate harness 대상이라 프로젝트 수리 범위 밖이다. D3 의 「판정 없이 open 두지 않는다」를 지키려면 가짜 판정을 내려야 한다 | P2 | **수정 (2026-09-11)** — repair-milestone 회수 규칙에 「`### M-N — instruction improvement 후보` 그룹은 회수·4-판정 대상이 아니다(boilerplate 저장소 소관)」를 명시하고, D3 의 「판정 없이 open 두지 않는다」가 *프로젝트 결함·개선* 항목에 걸린다는 범위를 적었다 |
| 38 | **monorepo 스캐폴드가 scope 하위에 harness 파일을 심는데 보호 경로 검사가 root 상대라 못 본다.** Round 12 `/stack-guard` 수행 0 에서 `create-next-app` 이 `apps/web/AGENTS.md`(next 규칙 블록 9줄) + `apps/web/CLAUDE.md`(`@AGENTS.md` 1줄)를 만들었다. 루트 201파일 해시는 **완전 동일**(보호 규칙은 정상 작동)인데, 저장소 안에 **두 번째 AGENTS.md** 가 생겼고 `cwd=apps/web` 로 일하는 에이전트는 보일러플레이트 규율 대신 그 파일을 읽는다 | P1 | **수정 (2026-09-11)** — `/stack-guard` 수행 0 에 **2-0 scope 하위 harness 파일 탐지**를 넣었다. 복사 직후 그 scope 트리에서 harness *이름*(`AGENTS.md` `CLAUDE.md` `.claude/` `.codex/` `.agents/` `.boilerplate/`)을 찾아 `Scaffold harness-file in scope: <경로>` 로 보고하고 `## Scaffold` 행에 적는다. **자동 삭제하지 않는다** — `next dev` 처럼 매 실행 되살리는 생성기가 있고 되돌리기는 사용자 결정이다. 2-1·0-H 가 루트 기준이라는 사실도 그 자리에 명시했다 |
| 39 | **발견 24(팬아웃 단위가 maxTurns 를 보고 전에 소진)가 stabilize 밖에서도 재현된다.** `/repair-milestone` 2-V (v) 영향 반경 재감사의 qa 단발 sub-call 이 **tool_uses 20 / 16턴 한도**에서 보고 0건으로 멈췄다(브라우저 구동 검증 포함 단위). 회수 규율 ①(1회 재개)은 여기서도 동작했다. 즉 한도 문제는 «마일스톤 층 팬아웃 단위»가 아니라 **«실행 검증을 포함한 qa 단위» 전반**이다 — 처방 범위를 stabilize 로 좁히면 안 된다 | P1 | **수정 (ADR-004#amend-6 — 발견 24 와 한 처방)** — 덧붙여 **위임 프롬프트에 턴 수를 적는 것이 왜 무효였는지**가 이 라운드에서 드러났다: qa(상한 16)에 「30턴 안에」, reviewer(상한 12)에 「25턴 안에」를 적어 보냈고 둘 다 상한에서 보고 0건으로 멈췄다. **호출자는 피호출자의 상한을 모른다** — 그래서 예산을 잡는 주체를 값을 아는 쪽(에이전트 자신)으로 옮겼다 |
| 40 | **ADR-072 D5 가 승인 컴포넌트의 «행동» 변경을 말하지 않는다.** D5-3·D5-4 는 «표현(마크업·스타일·카피·스토리)» 만 다루고, `[Design-reuse-drift]` 도 표현 기준이라 행동 변경에는 원리상 침묵한다. 실측: repair round 1 이 `TodoList.tsx` 클릭 핸들러에 좌표 가드를 넣어 **삭제 동작을 바꿨는데** 재승인 경로도 drift 발화도 없다. 배선 계층에서는 그 가드가 원리상 불가능하다는 것이 시도 ①의 실패로 증명됐으므로 «승인 컴포넌트 안에서만 고칠 수 있는 행동 결함»은 드문 경로가 아니다 | P1 | **수정 (ADR-072 D5-3-1 신설)** — 판정 기준 한 줄: **브리프 `## 인터랙션 계약` 의 문장을 바꾸면 재승인, 바꾸지 않으면 재승인 없이 고치되 로그 고지**(`## 5` 또는 task `## 8` 에 「승인 컴포넌트 행동 변경: <무엇> — 인터랙션 계약 무변경」). 배선 계층으로 옮길 수 있으면 그쪽이 먼저이며, 승인 파일을 건드리는 것은 **그 신호가 배선 계층에 원리상 없을 때만**이다. 탐지기는 만들지 않았다 |
| 41 | **ADR-070 D4 영향 반경 재감사가 «수리가 만든 새 P0» 를 실제로 잡았다 — 규정의 첫 실효 사례.** repair round 1 의 첫 수정(배선 계층 250ms 삭제 쿨다운)이 「서로 다른 두 행을 빠르게 지우는 정상 사용」을 무성으로 삼키는 P0(`M1-018`)를 만들었고, `validate`·`validate:e2e`·기존 회귀 테스트는 **전부 green** 이었다. 재감사 qa 단위만이 그것을 찾아냈고 같은 라운드에 되돌렸다 | 관측 | **조치 불요** — D4.2·D4.3 이 의도대로 작동했다. 「자기 점검: 새로 열릴 수 있는 P0 후보」에 그 후보를 적어 둔 것이 재감사의 탐색을 좁혔다는 점도 함께 기록한다 |
| 42 | **`cat-web-ui-kit = shadcn/ui` 의 baseline 설치가 DESIGN 토큰 결정 *전에* 완전한 토큰 세트를 선점한다.** Round 12 `/stack-guard` 6-2-b 의 `shadcn init` 이 `src/app/globals.css` 에 `@import "shadcn/tailwind.css"` + `@theme inline` 40여 줄 + `:root` 팔레트를 심었고 「Updating fonts」로 `--font-sans`·`--font-heading` 까지 정의했다. `/bootstrap-design` R6 가 DESIGN `## 2`·`## 3` 토큰을 **같은 파일에** 배선하므로 두 토큰 체계가 충돌한다. 더불어 `shadcn`·`cn`·`@base-ui/react`·`class-variance-authority`·`tw-animate-css` 가 **runtime `dependencies`** 로 들어갔다 — 결정 집합에 없는 5개다 | P1 | **수정 (ADR-071 D6 확장 — 사용자 확정)** — 폰트 예외와 **같은 이유**를 토큰·팔레트에 적용했다: 킷은 설치하되 킷 `init` 이 쓴 토큰 블록은 손대지 않고 `STACK_SETUP_PLAN` 에 「R6-1 재배선 대상」으로 기록만 하고, **R6-1 이 킷 변수를 DESIGN semantic 토큰의 별칭으로 재정의**해 출처를 하나로 만든다(반대 방향 금지). **번들 의존 5개는 «결정의 일부» 라 제거 대상이 아님**을 명시했다 — ADR-071#amend-1 의 「결정 밖 애드온 제거」는 *선택 가능한 애드온*을 가리킨다 |
| 43 | **Reject 된 finding 의 재등재를 막는 규칙이 `[Pattern-spread]`(§1.0 3-1)에만 있다.** stabilize 2회차의 5-2 raw-hex grep 이 round 1 과 **똑같은 5건**(`PR #412`)을 다시 냈고 5-2b voice grep 도 10건을 다시 냈다. 그 둘은 이미 `M1-imp-1`·`M1-imp-2` 로 `decision: rejected-fp / status: resolved` 다. 재등재를 막는 것은 **메인 세션의 판단뿐**이며 skill·ADR-070 D2 어디에도 「기존 원장에 같은 사실이 resolved 로 있으면 새로 적지 않는다」가 없다 | P1 | **수정 (ADR-070#amend-1 결정 2)** — 6-S 에 **등재 전 dedup 을 필수**로 넣었다. 동일성 기준은 §1.0 3-1 과 같은 «`<라벨> <file:line> <증상>`», preflight 정규식 발화는 **경로 집합**으로 비교. 이미 있으면 `open`/`resolved` 무관하게 새 ID 를 만들지 않고 `- 재발화:` 한 줄만 붙인다 |
| 44 | **졸업 item 5 의 «P0 항목 수» 계수 방법이 규정돼 있지 않다.** 원장 항목의 ID 줄에 `status: open` 이 있지만, 그 항목의 **산문 하위 줄**에도 같은 문자열이 나온다(round 1 이 남긴 「`status: open` 유지」 판정 줄). 문자열 grep 으로 세면 2건이 4건이 된다(실측). ADR-068 D3 item 5 는 「`status: resolved` 가 아닌 **항목 수** 0」이라고만 한다 | P2 | **수정 (2026-09-11)** — 졸업 item 5 의 계수 단위를 「`- **<ID>** \|` 로 시작하는 줄만 센다」로 못박았다. 발견 32(0건의 두 뜻)와 같은 계열이다 |
| 45 | **monorepo 에서 probe 를 어느 scope 에 두는지 `/stack-guard` 5-a 가 말하지 않는다.** 5-c 는 「위반 probe 는 한 번에 하나」라고만 하는데 monorepo 파이프라인은 같은 단계가 scope 마다 한 번씩 돌고 앞 scope 가 fail-fast 로 멈춰 뒷 scope 의 판정력이 측정되지 않는다. Round 12 에서는 회차마다 **두 scope 에 하나씩** 두고 멈춘 쪽을 5-c-0 (ii) 의 단독 실행으로 재측정해 5회차를 유지했다 — 성립하는 해법이지만 skill 에 없어 매번 재발명해야 한다 | P2 | **수정 (2026-09-11)** — 5-a 에 monorepo 배치 규정을 넣었다: 회차마다 scope 마다 하나, fail-fast 로 미도달한 scope 는 5-c-0 (ii) 단독 실행으로 재측정, **회차 수는 늘지 않는다** |
| 46 | **`/stack-guard` 가 「생성기 산출물을 그대로 둔다」와 「validate 를 녹색으로 만든다」 사이에서 침묵한다.** 수행 0 step 3 은 예제 페이지를 그대로 두라고 하는데, `create-next-app` 생성 소스는 Biome 형식(작은따옴표)과 달라 `validate` format 단계가 **영구히 실패**한다. 그 상태로는 probe 회차 판정이 프로젝트 실패에 묻힌다(5-b 가 파일 귀속 진단으로 구분하긴 하나 사람이 읽는 출력이 붉다). Round 11 은 Storybook 데모 스토리를 «제거» 로 해소했고 Round 12 는 «1회 형식 정규화» 로 해소했다 — 같은 문제에 서로 다른 처방이 나왔다 | P2 | **수정 (2026-09-11)** — 수행 0 step 3 에 「생성기 산출물을 프로젝트가 고른 formatter 로 1회 정규화한다」를 넣었다. 삭제가 아니라 형식만 맞추는 것이라 「그대로 둔다」와 충돌하지 않는다 |
| 47 | **dogfood 는 구조적으로 `graduation: YES` 에 도달할 수 없다 — 졸업 item 4 가 사람을 요구하기 때문이다.** ADR-065 D1 은 `[사용자 관측]` AC 의 receipt authority 를 사용자에게 두고, `/accept-milestone` 은 「사용자가 판정하지 않은 AC 에 receipt 를 쓰지 않는다」고 못박는다. 세션이 관측을 **수행**할 수는 있어도(실브라우저 렌더 ↔ 승인 스냅샷 8항목 대조를 실제로 했다) 판정을 **소유**할 수는 없다. 그래서 관측 modality AC 가 하나라도 있는 마일스톤은 dogfood 에서 영원히 `PENDING_ACCEPTANCE` 이하다 | 관측 | **수정 (ADR-017 에 명문화 — 사용자 확정)** — 「dogfood 는 `PENDING_ACCEPTANCE` 가 상한이며 성공 기준의 «graduation 미통과 ≤2» 는 그 상한을 전제로 읽는다(item 4 만 미충족은 미통과로 세지 않는다)」를 ADR-017 `## 결정` 에 넣었다. 라운드 기록에는 대행 관측 수행 사실과 receipt 미발급 사실을 **둘 다** 남긴다 |
| 48 | **수렴 실패 브리프의 선택지 A·B 가 가장 흔한 수렴 시나리오에서 빈 선택지가 된다.** ADR-070 D5 는 A(계속 수리)·B(비차단 보류 후 차단분만 수리)·C(병렬 Now)를 제시하는데, **수렴이 일어나는 전형적 원인이 「남은 P0 가 전부 repair 의 책임 경계 밖」** 이다(발견 34 와 같은 뿌리). 그때 A 의 기대 효과는 0 이고 B 의 「차단 항목만 수리」도 대상이 없다. 실측: round 3 종료 시 남은 P0 2건이 둘 다 승인 UI 재구성 요구였고, 브리프를 쓰면서 A·B 를 «기대 효과 0» 으로 적어야 했다 | P2 | **수정 (ADR-070#amend-1 결정 3)** — 남은 `### P0` open 항목이 **전부 `blocked`** 면 브리프가 A·B 를 제시하지 않고 C 와 «재승인·계약 정정 경로 착수» 둘만 낸다. 결정 1 의 `blocked:` 줄이 그 분기의 기계적 입력이다 |
| 49 | **`--fast` 가 DESIGN `## 7`(컴포넌트 인벤토리)을 비운 채 문서를 완성 상태로 만든다.** `--fast` 는 R4 를 생략하는데, 그 뒤 `/design-milestone` R3 브리프의 「재사용 vs 신규」와 ADR-073 D8 의 인벤토리 등록 계약은 **`## 7` 이 채워져 있음을 전제**한다. 인용할 대상이 없으면 모든 요소가 «신규» 가 되고, Round 11 발견 21(신규 UI 요소 미등록)이 구조적으로 재발한다. 실측: 회귀 (b) 에서 `--fast` 후 `## 7` 이 빈 채 `ready` 가 됐다 | P2 | **수정 (2026-09-11)** — `--fast` 종료 출력에 「`## 7` 미작성 — `/design-milestone` 전에 R4 단독 수행 권장」 한 줄을 내도록 했다. 인용할 인벤토리가 없으면 모든 요소가 «신규» 가 되어 발견 21 계열이 구조적으로 재발한다는 사유를 함께 적었다 |
| 50 | **`/bootstrap-design --update` 로 토큰을 하나 바꾸면 이전 M 의 승인 스냅샷이 조용히 무효가 되는데 절차가 그 사실을 내지 않는다.** 실측(회귀 (c)): `--update` 로 accent 1개(`#a63d16` → `#96370f`)를 바꾸고 R6-1 delta 를 재생성한 뒤 M1 매니페스트를 재렌더하니 **승인 스냅샷 12개 중 6개가 바이트 상이**했다. 그런데 게이트는 `blockers: 0 / reports: 0` 이다 — 게이트는 렌더해서 a11y·geometry 만 보고 **승인본과 대조하지 않는다**. `--update` 절의 규정은 「토큰이 바뀌면 R6-1 배선을 delta 재생성한다」까지이며 이전 M 기준선에 대한 언급이 없다. 유일한 장치는 `/amend-ssot` 전파표인데 사용자가 그것을 돌릴 줄 알아야 작동한다 | P1 | **수정 (bootstrap-design R6-3b 신설 — 사용자 확정)** — `--update` 에서 토큰·컴포넌트가 바뀌면 종료 전에 **커밋된 `prototypes/M*/manifest.json` 을 재렌더해 승인 스냅샷과 바이트 대조**하고, 달라진 화면 목록 + 해소 경로 둘(다음 M `supersedes` 재등록 / 봉인 전이면 같은 M 재승인)을 출력한다. **자동으로 옮기지 않는다** — 기준선 이동은 승인 행위다. 게이트에 대조 모드를 신설하는 안은 「탐지기는 나중」 규율대로 보류 |
| 51 | **`/design-milestone` R0 step 2 의 중단-재개 판정이 «두 신호가 어긋날 때» 를 정하지 않았다.** 규정은 「매니페스트 `approved` + feature `## 7` 기입 여부」로 화면별 판정인데, 실제 중단은 그 둘 사이에서 일어난다(매니페스트를 쓰고 feature 를 못 쓴 채 끊기거나 그 반대). 실측(회귀 (e)): `todo-empty-error` 가 `approved=null` + `## 7` 기입=있음 으로 **신호가 엇갈렸다**. 보수적으로 「둘 다 참일 때만 skip」 을 적용해 재개했지만 그 규칙이 문서에 없다 | P2 | **수정 (design-milestone R0 step 2 — 사용자 확정)** — 「두 신호가 어긋나면 **재개**(보수적, 둘 다 참일 때만 skip) + 엇갈림 자체를 `재개 신호 엇갈림: <screen> (…)` 한 줄로 출력」. 중단이 바로 그 둘 사이에서 일어나기 때문이다 |
| 52 | **턴 상한 소진이 `maxTurns: 45` 인 builder 에서도 났다 — 상한 크기의 문제가 아니다.** Round 12 R6-1 테마 배선 dispatch(Flutter 테마·갤러리·위젯 테스트 + 웹 토큰·쇼케이스 + 매니페스트)가 **46 tool_uses / 45턴 상한에서 보고 0건**으로 멈췄다. ADR-004#amend-6 이 그날 아침 builder 를 «report-only 가 아니고 상한 45 라» 제외했는데 같은 날 오후에 반증됐다. **원인은 상한이 아니라 «보고를 남길 턴을 아무도 예약하지 않는다»** 이며, 부수 원인은 dispatch 가 두 플랫폼을 한 slice 에 넣은 것이다 | P1 | **수정 (ADR-004#amend-6 에 builder 편입)** — 「41턴째에는 새 작업을 시작하지 말고 마무리와 보고」 + 「slice 가 41턴에 안 끝날 크기로 보이면 **착수 전에** 그렇게 보고해라 — 쪼개는 것은 foreman 의 일이다」. 이번 실측에서 재개 1회로 완주했으므로 값(45)은 올리지 않는다 |

| 53 | **design gate 의 Flutter 어댑터가 report 에서 뷰포트 축을 잃는다.** 웹 분기는 화면×상태×**뷰포트**마다 `screens[]` 항목을 하나씩 만들지만(Round 12 실측: admin-web 3항목 — 1280×900·375×812·320×720), Flutter 분기는 `flutter test` **실행 하나당 항목 1개**를 만들고 `viewport: null` · `screenshot: null` 로 둔다(`design-gate.mjs:351`). 실측: `theme-showcase-mobile` 이 `blockers: 0` 인데 뷰포트도 스크린샷도 없다. **위젯 테스트는 실제로 390×844·360×800 두 뷰포트를 돌았지만 report 만 보고는 그것을 알 수 없다** — 뷰포트 루프를 빠뜨린 테스트도 똑같은 항목을 만든다. ADR-072 D6 은 「같은 report schema 로 정규화」라고만 해서 구조는 맞지만 축이 빈다 | P1 | **수정 (2026-09-12 사용자 확정 — 범위 한정 + 규칙 한 줄)** — **승인 경로는 이미 보호된다**: R6 은 `--snapshot` 을 요구하고 PNG 파일명 `<screen>-<state>-<w>x<h>.png` 이 뷰포트별 증거다. 노출 구간은 **`--snapshot` 없는 실행**뿐이므로 거기에 규칙을 박았다 — 「**`--snapshot` 없이 돈 Flutter 항목의 `blockers: 0` 을 뷰포트 커버리지 증거로 읽지 마라**」(ADR-072 D6 + design-milestone R6-2). 게이트 코드는 건드리지 않았다 — 이번 라운드에 그 파일에서 P0 3건(54·58·71 계열)이 나왔고 「규칙은 지금, 탐지기는 나중」 규율을 그대로 적용했다. 테스트 이름 파싱은 Round 13 후보. (원 처방 후보: (a) 위젯 테스트가 그룹 이름에 `<w>x<h>` 를 넣게 하고(이미 그렇게 쓰고 있다) 어댑터가 `--reporter json` 의 테스트 이름을 파싱해 뷰포트별 항목으로 쪼갠다 — **탐지기라 「나중」** (b) 규칙만 먼저: 매니페스트 프로필의 뷰포트 수와 `flutter test` 통과 테스트 수가 다르면 어댑터가 `unavailable` 로 보고 (c) `--snapshot` 을 준 실행에서는 PNG 파일명(`<screen>-<state>-<w>x<h>.png`)이 뷰포트 증거이므로 R6 승인 경로에서는 문제가 없다 — `--snapshot` 없는 실행만의 문제로 한정) |
| 54 | **design gate 의 Flutter 스냅샷 경로가 끊겨 있었다 — PNG 가 한 장도 생기지 않는다.** 어댑터는 `DESIGN_GATE_OUT` 을 `--dart-define` 으로만 넘기는데(컴파일 타임 상수) 위젯 테스트가 `Platform.environment` 로 읽으면 null 이 된다. 그런데 게이트는 **`blockers: 0`** 을 내므로 아무도 모른다. 실측: Round 12 R6 에서 `--snapshot` 을 줬는데 웹 PNG 2장만 나오고 Flutter 는 0장. ADR-072 D4(Flutter 승인 스냅샷)·D7 §3-V native 경로가 통째로 성립하지 않는 상태였다 | **P0** | **수정 (2026-09-11)** — canonical 어댑터가 **프로세스 환경변수와 `--dart-define` 둘 다**로 넘기게 고치고(`env: { ...process.env, DESIGN_GATE_OUT: outAbs }`), ADR-072 D3·D6 와 `builder.md` 에 «어느 API 로 읽어도 된다» 를 명시했다. 재실행 검증: `theme-showcase-mobile-default-390x844.png`·`-360x800.png` 가 `--snapshot` 디렉터리에 생성됨 |
| 55 | **Flutter 위젯 테스트 스냅샷은 글자가 전부 네모(tofu)다 — 폰트를 로드하지 않기 때문이다.** 실측: Round 12 테마 쇼케이스의 Flutter 스냅샷(390×844)은 swatch·간격·구조는 정확히 그렸는데 **모든 텍스트가 □** 였다. 같은 쇼케이스의 웹 스냅샷은 한국어 카피·대비비 라벨·대표 화면이 전부 읽힌다(브라우저 폰트 폴백). ADR-072 D4 는 승인 스냅샷을 「사람·AI 육안 대조 참조」로 쓰고 §3-V·accept·reviewer 가 그것을 소비하는데, **Flutter 쪽은 그 참조의 절반(카피·타이포·텍스트 위계)이 원리상 비어 있었다** | **P0** | **수정 (2026-09-11)** — ADR-072 D4 에 글리프 경고를 넣고 위젯 테스트가 **렌더 전 `FontLoader` 로 프로젝트 폰트를 적재**하도록 계약에 박았다. 폰트 미배치 시에는 적재를 건너뛰되 매니페스트 `handoff.remaining_wiring[]` 에 «글리프 없음 — 레이아웃 전용» 을 적어 소비자가 카피 대조에 쓰지 않게 한다. `builder.md` ui-authoring 에도 미러 |
| 56 | **게이트 빌드 출력이 scope 안에 생기는데 scope 도구가 그것을 제외하지 않는다.** 게이트는 각 화면의 `scope` 를 작업 디렉터리로 쓰므로 Storybook 정적 빌드가 `apps/web/design-gate-storybook/` 에 생긴다. 루트 `.gitignore` 의 `design-gate-storybook/` 는 **git 에게는** 어느 깊이든 통하지만(실측: `git check-ignore` 가 루트 39행으로 매칭), `useIgnoreFile` 을 켠 Biome 은 **자기 루트의 ignore 파일만 읽어** 빌드 산출물을 format 대상으로 삼았다. 결과: 루트 `npm run validate` 의 format 단계가 빌드 파일을 훑다 300초 timeout | P1 | **수정 (2026-09-11)** — `/stack-guard` 6-4-1 과 수행 2-1 에 「monorepo 면 scope 의 `.gitignore` **와** 그 scope 도구 config **양쪽에** `design-gate-storybook/`·`design-gate-shots/` 를 넣는다」를 박았다. 루트 ignore 만으로 충분하다는 가정이 scope 도구에서 깨진다는 사실을 사유로 적었다. 발견 38 과 같은 계열 — **루트 기준 규칙이 monorepo scope 에 닿지 않는다** |
| 57 | **DESIGN `## 10` 용어 사전과 같은 문서 안의 카피 예시가 서로 어긋나는데 아무 검사도 그것을 보지 않는다.** Round 12 실측: 용어 사전이 「할 일」을 *습관* 의 **금지 동의어**로 등재했는데 `## 7` `TodayHeader` 행(321)과 `## 10` 카피 예시(469)가 둘 다 「오늘 할 일을 다 했어요」를 쓴다. stabilize 5-2b voice grep 은 **변경된 코드 파일**만 보고 **`DESIGN.md` 자체를 명시적으로 제외**한다(규칙 정의 영역이라는 이유). R3 의 reviewer `[Design-voice]` 가 유일한 포착 경로인데, 이번에는 **designer 가 브리프를 쓰다 스스로 발견**했다 — 즉 우연히 잡혔다 | P2 | **수정 (2026-09-11 사용자 확정)** — `/bootstrap-design` **R5-C 자기 정합 검사** 신설: 저장 직전에 `## 10` 용어 사전의 금지 동의어를 **DESIGN.md 자기 자신**에서 grep 하고, 일치가 나오면 카피를 고치거나 사전에 예외 행을 두기 전에는 저장하지 않는다. 범위가 한 파일이라 문맥이 전부 카피이고 오탐이 거의 없다 — 코드 grep(5-2b)이 DESIGN.md 를 제외하는 이유와 충돌하지 않는다. **이번 라운드의 실제 충돌도 같은 규칙으로 닫았다**: 「오늘 할 일을 다 했어요」 → 「오늘 체크를 다 했어요」 (DESIGN `## 7`·`## 10` · F-001 `## 3`·`## 9` · M1 `## 9` 다섯 곳, 총 9군데). 「체크」는 사전의 내부용어 번역표(`HabitLog` → 「오늘 체크」)와도 일관된다 |
| 58 | **매니페스트 `states[]` 가 상태의 «렌더 조건»을 표현하지 못해, 조건으로 정의된 «못생긴 상태» 의 승인이 vacuous 해진다.** schema v1 의 상태는 `{id, preview, baseline?}` 뿐인데 브리프가 정의하는 상태는 조건을 달고 온다 — 실측 **4건**: `admin-habits/narrow-320`(**뷰포트 320**) · `admin-habits/zoom-200`(**375×812 + 텍스트 2배**) · `today-list/overflow`(**360×800**) · `today-list/long-name`(**textScale 1.3**). 두 화면에 걸쳐 있고 조건 축도 셋이다(뷰포트·textScale·zoom). 기준선 규칙은 «`baseline: true` 상태 × 모든 shot 뷰포트» 라 세 상태 다 **1차·2차 뷰포트에서 기본 textScale 로** 찍힌다. 게다가 320 은 `geometryOnly` 라 스냅샷 대상에서 아예 빠진다. 결과: 「320 에서 3열이 밀리는가」·「360×800 에서 가로 클리핑이 없는가」·「글자 1.3배에서 행 높이가 넘치는가」를 **승인 기준선으로 삼겠다고 적어 놓고 그 조건이 아닌 스냅샷을 승인하게 된다.** 이름과 내용이 어긋난 기준선이다 | **P0** | **확정 후 수정 (2026-09-11 사용자 확정)** — R6 실측이 예측을 확인했다: `admin-habits-narrow-320-1280x900.png` 이 승인 기준선으로 생성됐고 내용은 **1280px 전체 폭의 3열 표가 멀쩡히 나온 장면**이었다. 스토리의 `globals: { viewport: 'admin-320' }` 가 게이트의 `setViewportSize` 에 무시된다. 조건이 «틀리게 찍힌» 것이 아니라 **조용히 버려진** 것이라 사람이 그 스냅샷을 봐도 이상함을 못 느낀다. **수정**: schema v1 **minor** 로 `states[].render: { viewports?, textScale? }` 를 추가하고(`version` 유지) canonical 어댑터가 그 조건에서만 렌더·기준선 캡처하게 했다(`stateRenderViewports()` + `renderScreen({textScale})`; textScale 은 `goto` **뒤에** `:root{zoom}` 주입 — 앞에 걸면 네비게이션이 버린다). **재실행 검증**: `narrow-320-1280x900`+`-375x812` → **`narrow-320-320x800` 한 장**, `zoom-200` → `375x812`(textScale 2) 기준선 생성, `overflow` → `360x800` 한 장. `long-name`(textScale 만 선언)은 두 프로필 뷰포트 유지 — 옳다. 그 320 스냅샷은 이제 **표 래퍼만 가로 스크롤되고 페이지는 넘치지 않는다**는 실제 동작을 보여 준다(PX-M1-admin-habits-01). 수정 전 기준선은 그 동작에 대해 아무것도 말하지 않았다 |
| 59 | **ADR-004#amend-6 의 턴 예산 규칙이 builder 에서 듣지 않았다 — 에이전트는 자기 턴 수를 셀 수 없기 때문이다.** Round 12 R4 웹 dispatch 는 amend-6 적용 **후**였고, `builder.md` 의 「41턴째에는 새 작업을 시작하지 말고 마무리와 보고에 들어간다」와 **dispatch 프롬프트의 같은 문장**을 둘 다 받았는데도 45턴 상한에서 보고 0건으로 멈췄다(마지막 출력이 「Now the stories file.」). 원인은 규칙의 부재가 아니라 **관측 불가**다 — 에이전트에게 「지금 몇 턴째인가」를 보여 주는 것이 없어서, 「41턴째에」는 지킬 수 없는 지시다 | P1 | **수정 (ADR-004#amend-7 — falsifier 발화 후 규정된 응답)** — 같은 라운드에서 **2회째**가 나와 amend-6 falsifier (a)가 발화했다(R4 의 두 builder dispatch 가 둘 다 45턴에서 보고 0건, 둘 다 작업은 거의 끝난 상태였고 죽은 자리는 최종 검증이다). 세 가지를 함께 했다 — ① **턴 수 지시를 작업량 지시로 교체**(「산출물을 먼저 나열하고 절반 시점에 점검, 남은 일이 더 많아 보이면 그때 중간 보고」; 「턴 수를 세려 하지 마라 — 너에게 보여 주는 것이 없다」를 명시) ② **builder `maxTurns` 45 → 60**(falsifier 가 규정한 응답. report-only 에이전트 값은 불변 — 그쪽은 실패가 없었다) ③ **slice 산출물 4개 상한**을 `design-milestone` R4 와 `implement-workitem` 분할 규칙에 박았다. ①만 하면 falsifier 응답을 어기고 ②만 하면 60턴에서 같은 일이 난다 |
| 60 | **Dart `[Design-token-grep]` 규칙이 `Colors.transparent` 를 팔레트 우회로 오탐한다.** stabilize §1.0 5-2 Dart 갈래 ②는 `\b(Colors\|CupertinoColors)\.[a-zA-Z]+` 를 잡아 「프레임워크 기본 팔레트 사용 — 테마에서 가져오도록 교체 권장」을 낸다. 그런데 `Colors.transparent` 는 **색이 아니라 «색을 칠하지 않는다»** 는 뜻이고 토큰화할 대상이 아니다(모든 디자인 시스템에서 동일). 실측: Round 12 R4 의 `--tokens-only` 스캔이 2건을 리포트했고 builder 가 사유 주석으로 방어해야 했다. 발견 13(단축 hex 가 이슈 번호를 오탐)·26 과 같은 계열 — **정규식이 «형태» 만 보고 «의미» 를 못 본다** | P2 | **수정** — (a) 채택: Dart 갈래 ② 를 `\b(Colors|CupertinoColors)\.(?!transparent\b)[a-zA-Z]+` 로 좁혔다. **한 낱말 예외라 미탐 위험이 거의 없고**, 매번 브리프 `## 14` 에 사유 주석을 쓰게 만드는 비용을 없앤다. (b)(«색이 아닌 상수» 목록)는 택하지 않았다 — 현재 Flutter 에서 그 목록은 사실상 `transparent` 하나라 목록을 만드는 것이 비용만 는다. 발견 77 의 예외 설계와 같은 원칙이다: **의미 기준으로 최소 예외만 둔다** |
| 61 | **R6-1 테마 배선이 DESIGN `## 2`(색)만 토큰으로 내보내고 `## 4`(레이아웃) 결정을 빠뜨려, 코드가 그 값을 하드코딩하게 된다.** R6-1 규정은 「DESIGN `## 2~6` 토큰을 CSS 변수로」인데 Round 12 실측 `apps/web/src/styles/tokens.css` 에 **container·max-width 토큰이 0건**이다. DESIGN `## 4` 는 「모바일 max-width 480dp, 관리자 웹 max-width 960px」을 **산문으로** 확정했고 `## 2` 처럼 YAML 토큰 블록에 넣지 않았다. 결과: R4 코드가 `min-w-[480px]`·`min(100% - …, 960px)` 을 하드코딩했고 R6-3 `--tokens-only` 가 6건을 리포트했다 — **결정은 있는데 참조할 토큰이 없어서 생긴 위반**이다 | P1 | **수정 (2026-09-11 사용자 확정 — 원인·그물 둘 다)** — (b) **원인**: ADR-073 D2 에 「`## 4` 의 수치 결정(container max-width·gutter·spacing)은 산문이 아니라 `## 2` 와 같은 형식의 **토큰 블록**으로 적는다」를 박았다. 반응형 invariant 6종 같은 *판정 규칙*은 산문이 맞다 — 코드가 참조하는 것은 값이지 규칙이 아니다. (a) **그물**: `/bootstrap-design` R6-1 에 「`## 2`~`## 6` **각 절이 최소 1개 토큰을 내보냈는지 확인**하고, 없으면 `<절>: 토큰 없음 — <사유>` 를 배선 파일 주석에 남긴다」 + 「색만 내보내고 레이아웃을 빠뜨리는 것이 기본 실패 양식이다」를 실측과 함께 적었다. 프로젝트 쪽은 `--container-max-admin`·`--table-min-width`·`--container-gutter` 를 배선해 `--tokens-only` 6건 → 0건 |
| 62 | **`구성 불확실`(A/B) 이 미선택인 채로 R6 승인과 R7 `contract-ready` 승격을 통과했다.** Round 12 today-list 브리프 `## 13` 은 「E6 「습관 추가」 하단 배치 — R4에서 2안을 만들고 사용자가 고른다(취향 오라클 = 사용자)」를 살려 둔 채이고 `## 15` 리스크 3(「2안 선택 전에는 하단 패딩 수치가 확정되지 않는다」)도 열려 있는데, R7-3 의 승격 조건은 **통과했다**. 원인: R7-3 의 open 검사는 `DECISION_REGISTER.md` 만 본다. 그런데 브리프 `## 13` 은 **원장에 등록되지 않은 병렬 미결 자리**다 — R4 에 「`구성 불확실` 화면마다 원장 행을 만들라」는 지시가 없어서, R5 의 선택 루프를 한 번 건너뛰면 그 뒤 어느 관문도 못 잡는다. 결과적으로 코드의 enum 기본값(`AddButtonLayout.extendedFab`)이 사용자가 자기 몫으로 유보한 선택을 조용히 대신했다 | P1 | **수정 (2026-09-11 사용자 확정 — 원인 + 그물 둘 다)** — **ADR-072 `## Amendment 4` 결정 2**: R4 가 `구성 불확실` 화면마다 `DECISION_REGISTER` 에 `authority: user-choice`·`status: open` 행을 만들고 브리프 `## 13` 이 그 `D-NNN` 을 인용한다. **새 탐지기를 만들지 않았다** — R7-3 의 기존 `open` 검사가 그대로 그물이 된다. **결정 3(그물)**: R6-5 승인 체크리스트에 「브리프 `## 13` 이 「없음」이거나 그 `D-NNN` 이 `closed` 인가」. **결정 4**: R5 는 선택 확정 후 탈락 상태·코드·테스트를 지우고 **남은 상태의 스냅샷을 다시 찍는다**(선택에 딸린 수치가 그때 확정된다). 프로젝트 쪽은 사용자가 A안(확장 FAB)을 확정했다 |
| 63 | **`구성 불확실` A/B 축이 native 경로에는 아예 없다 — 프로필 비대칭.** R4 규정의 「`구성 불확실`이면 `A`/`B`」는 **웹 갈래에만** 붙어 있다(스토리 id 가 variant 축을 자연히 갖는다). Flutter 갈래는 `test/screens/<screen>_prototype_test.dart` 한 줄뿐이고, 매니페스트 `states[]` 에도 게이트 PNG 이름 `<screen>-<state>-<w>x<h>.png` 에도 **variant 슬롯이 없다**. 실측: builder 가 두 안을 전부 위젯 테스트로 렌더했지만(22 케이스 전부 통과) 파일명이 겹치는 것을 피하려 `if (layout == AddButtonLayout.extendedFab)` 로 **PNG 저장을 A안에만 걸었다.** 따라서 R6-4 reviewer 가 연 `design-gate-shots/` 에도 승인 스냅샷 26장에도 **B안 렌더가 한 장도 없다** — 사용자가 「둘 다 보고 정한다」고 유보한 선택인데 볼 것이 처음부터 한쪽뿐이었다. 발견 62 와 한 원인 계열(«A/B 축이 산출물 경로에 모델링돼 있지 않다»)이며, 62 를 고쳐 원장 행을 만들어도 **볼 렌더가 없으면 선택은 여전히 불가능하다**. 사후 확인: 저장 가드를 `<state>-<A|B>` 로 풀어 재실행하니 22장이 충돌 없이 나왔고 두 안의 차이(마지막 행을 가리는 범위)가 그림에서 바로 보였다 | P1 | **수정 (2026-09-11 사용자 확정 — 원인 + 그물 둘 다)** — **ADR-072 `## Amendment 4` 결정 1**: A/B 를 **상태로 모델링**한다 — 선택이 렌더에 보이는 상태마다 `<state>-a`·`<state>-b` 두 상태를 `states[]` 에 등록하고, 웹은 스토리 id 가 Flutter 는 테스트 group·PNG 이름이 그 id 를 따른다. **`variant` 필드를 새로 두지 않았다**: 웹 갈래는 이미 스토리 = 상태로 그렇게 표현해서 표기가 둘이 되고, 게이트 어댑터를 또 건드려야 하는데 이번 라운드에 그 파일에서 이미 P0 2건(54·58)이 나왔으며, 얻는 것(«두 상태가 한 선택의 양안»)은 브리프 `## 13` 과 원장 행이 이미 갖고 있다. **그물**: R6-5 체크리스트의 같은 항목에 「아직 열려 있다면 두 안의 렌더가 **모두** `design-gate-shots/` 에 있는가」 + R5 안내를 「두 안의 렌더 경로를 나란히 제시한다, 한쪽만 있으면 R4 로 되돌아간다」로 |
| 64 | **amend-7 의 「작업량 지시」가 `planner` 에서 2회 연속 듣지 않았다 — 그리고 amend-7 의 분류 자체가 틀렸다.** `/plan-workitem M1` dispatch 가 `maxTurns: 12` 상한에서 **보고 0건**으로 멈췄고(1회차: 28 tool_use / 136.3K 토큰 / 360초, 텍스트 출력 없음), 회수 dispatch 에 **산출물 목록·우선순위·「침묵이 최악이다」를 명시해 다시 보냈는데도 또 멈췄다**(2회차: 12 tool_use / 162.0K 토큰 / 257초, 마지막 출력이 「Now F-002.」 — builder 실패 때의 「Now the stories file.」과 같은 문장 형태다). `planner.md` 12행에는 amend-7 결정 1 문구가 **전문 그대로** 있다. 즉 «지시를 안 받아서»가 아니다. 더 중요한 것은 **amend-7 의 분류가 틀렸다**는 점이다 — 결정 2 는 「report-only 에이전트는 실패가 없었으므로 값을 건드리지 않는다」를 근거로 builder 만 45→60 으로 올렸는데, **`planner` 는 report-only 가 아니다.** `Write`·`Edit` 를 갖고 이번 산출물은 task 문서 5개 + feature 6개 절이었다(11 산출물). 로스터에서 쓰기 도구를 가진 에이전트는 builder·planner·architect·designer·reviewer 5종이고 그중 넷이 `maxTurns` 12~16 이다. **가장 깊은 원인**: Round 11 의 `d3119d3` 이 `/plan-workitem` 에 3-S 승인 표면 대조(매니페스트·브리프·DESIGN `## 7`·승인 컴포넌트 시그니처를 읽는다)를 얹어 **위임 단위의 작업량을 늘렸는데, 규칙을 늘릴 때 그 규칙을 수행할 에이전트의 예산을 보는 단계가 어디에도 없다** — ADR-047 D3 Mutation Contract 6항목에 «예산 영향» 자리가 없다 | P1 | **수정 (2026-09-12 사용자 확정 — (a)+(c), (b)는 Round 13 후보)** — **ADR-004 `## Amendment 8`**: ① **분류 정정** — 예산 축을 «쓰기 도구 보유»로 다시 긋고 `planner`·`architect`·`designer` 를 builder 와 같은 쪽으로 옮겼다 ② **예산 = 읽기 기본 8 + 산출물당 3** — slice 상한 4 산출물이므로 문서 산출 에이전트는 **20**(planner 12→20, designer 16→20, architect **미지정→20** — amend-7 fan-out 이 이 파일을 통째로 빠뜨려 예산 문구도 없었다). builder 는 60 유지(한 산출물이 코드+테스트+검증 루프라 산식이 맞지 않고 amend-7 falsifier 가 그 값에 걸려 있다) ③ **부분 보고 형식 고정** — 「쓴 파일 목록 + 남은 것 1줄」, 서술 금지(이 세션에서는 미검증 — 발견 74)(서술은 예산이 남아 있을 때만 쓸 수 있다) ④ **회수 dispatch 가 이미 쓴 파일 목록을 넘긴다** ⑤ **`/stabilize-milestone` 7-T 에 `턴 소진 0건 보고: N회` 계수** — 지금까지 이 실패는 사람이 알아채야만 보였다. **(c) slice 규율의 형태**(사용자 지정): 마일스톤 **전체 스냅샷 원칙은 불변**(ADR-057#amend-3)이고, 한 실행 안에서 «뼈대(전체 task 목록·ID·공용 task·의존 확정, 메인) → feature 단위 ≤4 산출물로 분할 authoring(위임, 병렬 가능) → 전체 집합 대상 seam·매핑·3-S 대조(메인)» 순서로 간다. **각 조각이 task 목록을 따로 발명하는 것은 금지** — 조각마다 다른 분해가 나오면 3단계의 대조가 성립하지 않는다. **(b) ADR-047 D3 Mutation Contract 의 «예산 영향» 항목은 Round 13 후보**로 남겼다 — 채택 조건(= amend-8 falsifier (a)): «(a)(c) 적용 뒤에도 쓰기 도구 보유 에이전트가 보고 0건으로 상한에 닿으면 1회라도 채택». ADR-047 은 하네스의 중심 계약이라 관측 하나로 항목을 늘리지 않는다 |
| 65 | **R6 승인이 매니페스트만 채우고 코드의 추적 헤더를 두고 간다.** ADR-072 D3-4 는 프로토타입 코드 파일 상단에 `feature: … | PX: … | DESIGN: … | 승인: <YYYY-MM-DD>` 추적 헤더를 두기로 하고, 그것을 «어느 feature·PX·DESIGN 결정에서 왔는가»의 경로이자 validator 의 `Design-reuse-drift` 판정 입력으로 쓴다. 그런데 R6-6 절차에는 매니페스트 `approved{date, by}` 를 채우라는 지시만 있고 **헤더를 채우라는 지시가 없다.** 실측: Round 12 는 세 화면이 전부 승인·스냅샷 동결까지 갔는데 `source[]` 5파일의 헤더가 **전부 `승인: <미정>`** 이었다. 코드만 열어서는 승인 여부를 알 수 없고, 그 상태로 배선 task 가 시작되면 validator 가 기준 없이 drift 를 판정하게 된다 | P2 | **수정** — R6-6 에 「그 화면 매니페스트 `source[]` 의 각 파일 추적 헤더 `승인:` 을 승인 일자로 바꾼다」를 박았다. **`source[]` 밖 파일(테스트·갤러리 진입·테마 배선)은 그대로 둔다** — 승인 표면이 아니다(실측에서 헤더를 가진 14파일 중 승인 표면은 5개였고, `_theme` 매니페스트는 `approved.date: null` 이라 테마 배선 파일에 일자를 찍으면 없는 승인을 지어내는 것이 된다) |
| 66 | **승인 표면이 이미 검증하는 FAC 에 `## 7-1` 매핑 자리가 없다 — ADR-072 가 들인 검증 매체가 ADR-037 의 커버리지 모델에 안 들어간다.** Round 12 `F-003 FAC-4`(좁은 폭에서 표만 가로 스크롤)는 승인 컴포넌트 `AdminHabits.tsx` 가 이미 구현했고 **이번 M 의 어떤 task 도 그 마크업을 건드리지 않는다.** 검증도 이미 있다 — 승인 스냅샷 `admin-habits-narrow-320-320x800.png` 과 게이트의 좁은 폭 geometry 검사. planner 는 `- FAC-4 → (해당 task 없음) — <근거>` 로 적고 「남은 미결정 사항」에 올렸는데 **판단 자체는 옳다**(변경하지 않는 코드에 AC 를 얹지 않는다 — ADR-006). 문제는 ADR-037#amend-3 의 회수 규칙이 「unmapped 또는 비어 있음」을 세므로 이 행이 **`P0 [Spec-gap]` + graduation `NO`** 로 잡힌다는 것이다. 남은 두 선택지는 둘 다 나쁘다 — 억지 AC 는 ADR-006 위반이고 FAC 삭제는 요구를 없앤다 | P1 | **수정** — **ADR-037 `## Amendment 4`**: `## 7-1` 우변에 **제3 형식** `- FAC-N → 승인 스냅샷 <경로> (manifest: <screen id>) — 증명: …` 을 허용한다. **두 조건을 다 만족할 때만** 쓴다 — (i) 검증 산출물이 경로로 실재 (ii) 이번 M 의 어느 task 도 그 화면 `source[]` 를 변경 대상에 넣지 않음. 조건 (ii)가 이 형식의 안전장치 전부다 — 없으면 「승인됐으니 검증됐다」가 배선 변경을 덮는 만능 면제가 된다. preflight·validator·reviewer 의 unmapped 정의에서 이 형식을 빼고, **`/seal-milestone` 이 봉인 직전에 조건 (ii)를 산하 task 변경 파일 목록으로 재확인**한다. 대안 「unmapped 를 경고로 낮춘다」는 기각 — 진짜 unmapped 의 차단력이 같이 내려간다. **형식을 늘리는 쪽이 등급을 낮추는 쪽보다 안전하다**. **처방이 1차에 불완전했다 (정직 기록)**: 처음엔 `## 7-1` 만 고쳤는데, 바로 이어 돌린 `/seal-milestone` 조건 4 가 **`## 7-3` 에 같은 모양의 행**(`- PX-M1-admin-habits-01 → (해당 task 없음)`)을 잡았다 — `PX-M1-admin-habits-01` 은 `F-003 FAC-4` 와 같은 요구·같은 스냅샷이다. 결정 1-b 로 `## 7-3` 에도 같은 형식을 열었다(증명 문장은 요구하지 않는다 — `## 7-3` 은 원래 그 규율 밖이다). **2차 정정**: 봉인 재실행이 결정 4 의 대조 출처가 **없다**는 것도 잡았다 — 「산하 task 의 변경 파일 목록」이라 썼는데 그 칸(`## 4-1`)은 **구현 시점에 채우는 자리**라 봉인 시점엔 5/5 가 비어 있다. 출처를 **task `## 3. 구현 항목` 이 지목한 경로**로 바꾸고, `- 승인 UI 재사용:` 은 대조 대상이 아님을 명시했다(그것은 «재사용» 선언이지 «변경» 선언이 아니다 — 배선은 보통 호출부에서 일어난다). **규칙을 쓴 당일 두 번 고쳤고 두 번 다 실행이 잡았다** |
| 67 | **증명 문장의 동어반복 금지가 «반쪽 채움»을 못 잡는다.** ADR-072#amend-2 결정 4 의 형식은 `AC-M 의 <어느 조건>이 FAC-N 의 <어느 요구>를 검증한다` 로 **슬롯이 둘**인데, 금지 문구는 「AC-M 이 FAC-N 을 검증한다」 형태만 겨냥한다. 실측(Round 12 planner 산출 14행): **3행이 왼쪽 슬롯만 채우고 오른쪽을 「그대로」로 때웠다** — 「AC-2 의 "유효한 이름 제출 시 새 Habit 이 저장되고 시트가 닫히며 목록 마지막에 나타난다" 가 **FAC-2 를 그대로 검증한다**」. AC 조건(어려운 쪽)은 실제로 인용했으므로 순수 동어반복은 아니지만, FAC 의 요구를 적지 않아 **읽는 사람이 FAC 본문을 따로 열어야 다리를 확인할 수 있다** — 증명 문장의 목적이 정확히 그 왕복을 없애는 것이다. 나머지 11행은 진짜 증명이었고 일부는 보강 논거까지 달았다(「남은 개수는 승인 UI 가 checked 목록에서 파생하는 순수 값이므로 checked 반전 검증으로 충분하다」). **즉 amend-2 falsifier (b)(「증명 문장이 동어반복으로 나온다」)는 부분 발화했다 — 21%** | P2 | **수정** — 규칙에 두 줄을 더했다. ① **「두 슬롯을 다 채운다」** + 「그대로·동일하게·바로」를 오른쪽 슬롯의 금지 filler 로 명시(template 주석 · plan-workitem 3-S (c) · validate-plan · reviewer 미러, 등급은 기존 증명 문장 위반과 같은 `P1`) ② **「코드를 인용할 때는 줄 번호가 아니라 식별자」** — 같은 산출물이 `today_list_screen.dart:92` 를 인용했는데 **같은 날 탈락안 삭제 커밋으로 그 줄이 밀렸다**. 문서가 SSOT 인 하네스에서 줄 번호 인용은 다음 커밋에 바로 stale 이 된다 |
| 68 | **amend-8 의 falsifier (a)가 규칙 신설 당일에 발화했다 — 그리고 그것이 ADR-047 D3 «예산 영향» 항목의 사전 등록된 채택 조건이었다.** `/validate-plan M1` 의 `reviewer` 가 `maxTurns: 12` 상한에서 **보고 0건**으로 멈췄다(29 tool_use / 176.0K 토큰 / 455초). 마지막 출력이 **「리뷰 파일 골격을 지금 쓰겠다(early write per budget discipline)」** — **early-write 지시를 받았고 그것을 실행하려다 죽었다.** 회수 dispatch 에 「**이번 턴에 제일 먼저 파일을 써라. 새 파일을 열기 전에 반드시 파일이 디스크에 있어야 한다**」를 넣자 **즉시 완주했다**(12차원 전부 + 신규 4검사, 미검토 0건). 같은 실패의 **5번째**이고 **중간 보고는 5/5 에서 한 번도 나오지 않았다**(builder 2 · planner 2 · reviewer 1). amend-8 이 reviewer 를 예산 상향에서 뺀 근거(「산출물이 보고 1건이므로」)도 틀렸다 — reviewer 의 부담은 산출물 수가 아니라 **회수 문서 수**다(`/validate-plan M<N>` = 15+ 문서 + PX grep) | P1 | **수정 (사용자 사전 등록 조건 충족 — 2026-09-12)** — **ADR-047 `## Amendment 3`**: D3 Mutation Contract 를 **7 필드**로 늘려 **«예산 영향»**(이 변경이 어떤 위임 단위의 작업량을 늘리는가, 그 단위의 `maxTurns`·slice 를 함께 보았는가; 아니면 `없음` 한 줄)을 추가했다. 소급 적용하지 않는다. **ADR-004 `## Amendment 9`**: ① **지시의 형태를 「멈추기 전에 보고해라」에서 「산출물을 먼저 만들고 채워 나가라」로 바꿨다** — amend-6(턴 수)·amend-7(작업량)·amend-8(부분 보고 형식)은 셋 다 *멈추는 순간에 무엇을 하라*는 지시였고 **0/5** 였다. 「그 파일이 디스크에 있는가」는 「지금 몇 턴째인가」와 달리 **에이전트가 볼 수 있다** ② `reviewer` 를 쓰는 쪽으로 옮기고 12 → **24** ③ 산식에 읽기 축: `maxTurns = max(8, 회수 문서 수) + 3 × 산출물 수` ④ slice 기준에 **「회수 문서 10개 이상이면 축을 나눈다」** 추가. 결정 ①의 근거는 **n=1 의 강한 형태**다(약한 형태 「일찍 써라」는 같은 dispatch 에서 실패했다) — falsifier 를 좁게 걸었다 |
| 69 | **DESIGN 이 고른 글꼴이 어디에도 로드되지 않은 채 승인 스냅샷 26장이 찍혔다 — 「전달 방식」 결정에 대응하는 배선 단계가 없다.** DESIGN `## 3` 은 **Pretendard 단일 · mono `(해당 없음)` · 전달 방식 self-host** 를 확정했다(후보 2조합·선택 근거까지 채워진 정상 블록). 그런데 ① `layout.tsx` 는 `create-next-app` 이 심은 **`Geist`·`Geist_Mono`(next/font/google)** 를 그대로 로드하고 ② `tokens.css` 는 `--font-family-base: "Pretendard Variable", system-ui, …` 로 **이름만** 선언하며 `@font-face` 도 폰트 파일도 0건이고 ③ Storybook preview 는 `globals.css` 만 읽으므로 **승인 스냅샷 26장이 fallback 글꼴로 찍혔다.** 게이트는 원리상 못 본다 — 게이트가 보는 것은 스토리 렌더이고 폰트 로딩은 그 바깥(Next 앱 셸)에 있다. **발견 55(Flutter tofu)와 한 원인**이다: 두 플랫폼의 승인 스냅샷이 **모두** 결정된 글꼴 없이 찍혔고 둘 다 검출되지 않았다. 더 나쁜 것은 **방금 박은 그물이 통과시켰다**는 점이다 — R6-1 의 「각 절이 최소 1개 토큰을 내보냈는가」(발견 61 처방)는 `## 3` 이 `--font-family-base` 를 내보냈으므로 통과다. **이름도 토큰이다.** 그리고 계획이 그 위에 한 겹 더 얹었다 — T-005 `## 3` step 3 이 「`Geist`/`Geist_Mono` 에 `preload: true` 명시(self-host 폰트가 첫 렌더 전에 적재되도록)」라고 **기각된 패밀리를 유지하라고 지시**하고 있었고, 붙은 사유가 맞는 말이라 더 잡기 어려웠다 | P0 | **수정 (2026-09-12 사용자 확정 — 순서까지 지정)** — **ADR-073 `## Amendment 1`** 4건: ① R6-1 이 **전달 방식까지 배선**한다(self-host = 파일 + `@font-face`/`next/font/local`, 앱 번들 = `pubspec fonts:` + asset). **패밀리 이름을 CSS 변수·`TextTheme` 에 쓴 것은 배선이 아니다.** 안 하면 DESIGN `## 3` 에 `- 배선: 미배선 — <사유>` ② **스캐폴드가 심은 폰트를 제거**(발견 42 계열) ③ `/design-milestone` **R0 preflight 가 `미배선` 표기·선언 0건이면 스냅샷 승인을 진행하지 않고** R6-1 로 돌려보내고, **R6-5 체크리스트에 「결정 글꼴 실재」** ④ `/plan-workitem` **3-S 에 (d) 축 신설** — 「`## 3` 지시가 DESIGN 확정 결정과 충돌하는가」. **그물은 2단계**(결정 5): **1차 정적**(차단) = 매니페스트 `fonts[]` 의 패밀리에 대한 **선언 실재** — 결정론적이라 blocker 로 쓸 수 있고 **이번 실패를 이것만으로 잡을 수 있었다**(`@font-face` 0건). **2차 런타임**(보고) = `document.fonts.check('16px "<family>"')` — 네트워크·캐시에 좌우돼 차단 불가. `fonts[]` 는 schema v1 minor 로 없으면 두 검사 모두 건너뛴다 |
| 70 | **PX 마커 주석이 여러 줄이면 「그대로 복사」도 「정확 일치」도 정의되지 않는다.** ADR-072 R7-1 은 feature `## 7` PX 인벤토리를 **코드 주석에서 그대로 복사(재추출 금지)** 하라 하고, validate-plan 축 5 ⑥ 은 코드 마커와 인벤토리의 `(id, 설명)` **정확 일치**를 검사한다. 그런데 D3 의 마커 문법은 주석 줄바꿈을 막지 않고, 검사는 `grep -rn "PX-M<K>-"` 라 **마커가 있는 줄만** 본다. 실측: `add_habit_screen.dart` 의 PX-01·02·04 가 여러 줄 주석이고 마커 줄은 그 첫 조각이라, R7 이 「그대로 복사」할 수 없어 **재추출**했고 그 결과 02·04 는 내용까지 달라졌다(코드 「기본 포커스는 안전한 쪽」 vs 인벤토리 「네 경로가 하나의 확인으로 모이고 기본 선택은 「계속 쓰기」」). reviewer 가 `[Plan-FAC-coverage]` mirror drift 로 잡았다 | P2 | **수정** — ADR-072 D3 PX 마커 문법에 **「설명은 한 줄로 쓴다(줄바꿈 금지)」**를 박았다. 그러면 「그대로 복사」도 「정확 일치」도 정의된다. 한 줄에 안 들어가면 **설명을 줄이라는 신호**다 — PX 는 「한 줄 결정」이 정의다 |
| 71 | **폰트 미적재는 육안 대조만 망친 것이 아니라 자동 차단 검사의 판정을 뒤집었다 — 발견 55 의 실제 사정거리.** 발견 55 는 「스냅샷 글자가 tofu 라 읽을 수 없다」로 기록됐는데, 폰트를 실제로 적재하자 **`meetsGuideline(textContrastGuideline)` 가 즉시 실패했다** — 같은 색·같은 크기·같은 코드인데. tofu 는 획이 굵어 표본 픽셀이 진하고, 실제 글리프는 얇아 안티에일리어싱 가장자리가 표본에 섞인다. 즉 **Round 12 의 Flutter 게이트가 내린 a11y 판정 4종 중 하나가 라운드 내내 신뢰 불가였다**(ADR-059#amend-1 결정 2·3 이 요구하는 검사다). 실패 지점은 `error` 상태의 「—」 한 글자였고, 같은 색으로 낱말을 렌더하면 통과한다. **실제 글꼴로 픽셀을 직접 재서 판정했다(2026-09-12)** — 아래 「발견 71 판정」 절. 부수 관측: `MaterialIcons` 도 같은 이유로 미적재라 체크 표시·「+」가 네모로 남아 있었다 | P0 | **수정 (판정 근거는 Round 12 절 「발견 71 판정」 — 실측 결과 실제 렌더 결함)** — ① **적재 방법을 규칙으로 박았다**: 위젯 테스트가 `FontManifest.json` 을 읽어 **선언된 패밀리를 전부** 적재한다(`MaterialIcons` 포함). 패밀리를 손으로 나열하면 폰트 추가 때마다 뒤처진다 — 매니페스트 구동이라 그 문제가 없다. ADR-072 D3 Flutter 갈래 · design-milestone R4 · bootstrap-design R6-1 세 곳에 같은 문구를 박았다 ② **저밀도 기호 한 글자를 텍스트 자리표시자로 쓰지 않는다** — 「—」는 라이브 리전이 읽어 줄 말이 없어 a11y 로도 나쁘고, 이 오탐 자리도 함께 사라진다. 프로젝트는 브리프·코드를 「남은 개수 알 수 없음」으로 고쳤다 ③ 적재 후 M1 스냅샷 26장을 **재촬영·재승인**했다(승인일 2026-09-12) — 한글·아이콘이 제품과 같게 나온다 ④ **이전 Flutter `textContrastGuideline` 판정을 무효로 명시**했다 |
| 72 | **task `## 3` 가 지목하는 코드 심벌의 실재를 아무도 확인하지 않는다.** 실측: `/plan-workitem` 이 T-002 `## 3` 에 `TodayListScreen(…, addButtonLayout: AddButtonLayout.extendedFab, …)` 을 넘기라고 썼는데, **그 enum 은 같은 날 앞선 커밋에서 삭제됐다**(D-010 A/B 확정으로 탈락안 제거). planner 는 회수 dispatch 에서 「A안 확정, 탈락안 코드 삭제는 네 범위가 아니다」를 전달받고도 «A안 = 그 enum 값» 이라는 **이전 판독을 그대로 옮겼다.** 관문 셋이 전부 통과시켰다 — 3-S (a)는 *가시 요소의 출처*(매니페스트 `source[]`·`px[]`·DESIGN `## 7`)를 보고 (b)는 *계측 이벤트*의 배선 가능성만 보며, `/validate-plan` 축 9(`[Plan-design]`)는 가시 요소 출처를, 축 10(`[Plan-arch-iface]`)은 ARCH 7-x 결정을 본다. 봉인 조건 3 은 섹션 완결만 본다. 결과: **봉인된 계획이 존재하지 않는 심벌을 지목한 채 구현 dispatch 로 간다** — builder 는 인자를 지어내거나 멈추거나 조용히 무시한다 | P1 | **수정** — 3-S **(b) 축을 「계측 이벤트」에서 「`## 3` 가 이름으로 지목한 코드 심벌 전부」로 넓혔다**(생성자 인자·enum 값·메서드·prop). 그 축은 **이미 승인 컴포넌트의 시그니처를 열고 있으므로** 추가 비용이 거의 없다 — 새 관문을 만들지 않고 기존 대조의 범위만 넓힌 것이다. 없는 심벌은 고치고, 못 고치면 `- 심벌 부재: <심벌> — <어디서 사라졌는가>` 로 surface. **부수 관측**: 이 결함은 A/B 확정(발견 62·63)의 **하류 파급**이다 — ADR-072#amend-4 R5 는 「탈락안 상태·스토리·코드·테스트를 삭제」하라 하지만 **그 뒤에 쓰인 문서가 탈락안을 참조하는 경우**는 다루지 않는다. 이번엔 계획이 승인보다 나중이라 걸렸다 |
| 73 | **보일러플레이트를 기존 프로젝트에 갱신하는 절차가 없어서, 디렉터리 통째 동기화가 프로젝트 산출물을 지웠다.** 실측: 하네스 동기화 커밋이 `docs/00-meta/` 를 통째로 맞추면서 **`STACK_SETUP_PLAN.md` 를 삭제했다**(fork 커밋 `c16ff49`, 168줄 — `/bootstrap-stack` 이 만든 스택 결정 registry 40행 + `## Design Gate Adapter` 계약). **그 디렉터리가 혼합이기 때문이다** — baseline 문서 6종 + `_templates/` 와 generated 인 `STACK_SETUP_PLAN.md` 가 한 자리에 있다. 지워진 뒤에도 **아무 검사도 울지 않았다**: 그 파일을 읽는 것은 `/design-milestone` R6-1 과 R0 의 `Design Gate Adapter status: ready` 확인인데, 이 라운드는 그 단계를 이미 지났다. 다음 라운드에서야 «게이트 어댑터 없음»으로 나타났을 것이다. **STRUCTURE.md 는 파일별 `presence: baseline \| generated` 를 이미 기록하고 있다** — 판정에 필요한 데이터는 있었고 **그것을 쓰는 절차가 없었다.** 「보일러플레이트 갱신」은 fork 사용자에게 1급 작업인데 문서에 경로가 0건이다(`grep` 확인) | P1 | **수정 (2026-09-12 사용자 확정 — 정책은 harness 문서에)** — **ADR-005 `## Amendment 2`** 로 박았다(인벤토리 SSOT 를 소유한 ADR): 결정 1 `presence: generated` 행 **불가침**(판정은 **행 단위** — 경로·디렉터리로 판단하면 틀린다) · 결정 2 **디렉터리 통째 동기화(`rsync --delete`·`cp -R`)를 갱신 수단으로 금지**(사고는 의도가 아니라 도구에서 났다) · 결정 3 **혼합 디렉터리 명시**(`docs/00-meta/` · `docs/90-decisions/`) · 결정 4 갱신 **절차**는 규칙이 아니라 새 경로라 후속 라운드. STRUCTURE.md 는 인벤토리 표 옆에 운영 3줄 + 정책 SSOT 링크만 남겼다. 프로젝트 쪽은 지워진 파일을 복원했다(fork `3997b1c`). **남은 것: 갱신 절차 자체**(어느 경로를 어떻게 옮기는가)는 규칙이 아니라 **새 경로**라서 이번 라운드에서 만들지 않았다 — Round 13 후보. 이 발견은 **내 수행 오류이자 문서 공백**이며 둘 다 사실이다 |
| 74 | **세션 중에 편집한 에이전트 정의가 그 세션의 dispatch 에 반영되지 않는다 — 「지연」이 아니라 「미반영」이다. ADR-004#amend-5 결정 4 의 재측정 설계가 성립하지 않는다.** Round 12 builder 재측정을 시작하며 `.claude/agents/builder.md` 를 조건 (a)(`maxTurns 20`)로 편집하고 **본문에 마커 한 줄**(「반환문 첫 줄에 `조건=a turns=20 effort=-` 를 적어라」)을 심어 **반영 확인 장치**로 삼았다. 조건 (a) dispatch 는 완주했으나 **반환문에 마커가 없었다.** 편집 6분 뒤 도구를 하나도 쓰지 않는 probe dispatch 로 「네 정의에 `측정 조건` 줄이 있는가」를 물으니 **`마커 없음`** 이 왔다(0 tool_use / 1.9초). **파일에는 있다** — 디스크 상태와 dispatch 가 받는 정의가 갈라져 있다. ADR-004#amend-5 결정 4 는 이 현상을 **「hot-reload 지연」**으로 적고 그 대응으로 **`builder-a`~`builder-d` 변형 파일**을 규정했는데, **변형 파일도 세션 시작 후에 생성되므로 같은 세션에서는 똑같이 안 보인다** — 규정된 대안이 원인 진단 위에 세워져 있었고 진단이 틀렸다. **파급**: (i) 이 세션의 sub-agent 는 전부 **세션 시작 시점 정의**로 돌았다 — planner 12 · reviewer 12 · builder 60. 발견 64·68 의 관측은 **그대로 유효하다**(amend-7 은 이전 세션 산물이라 live 였고, planner 가 그 문구를 받고도 침묵한 것이 관측의 핵심이다). (ii) 반대로 **이 세션에서 에이전트 파일에 넣은 amend-8·9 는 이 세션에서 검증되지 않았다** — amend-9 의 write-first 가 reviewer 회수에서 작동한 것은 **dispatch 프롬프트**를 통해서였지 에이전트 파일을 통해서가 아니다 | P0 | **부분 수정 + 실험 중단 보고** — ① **ADR-004#amend-5 결정 4 의 재측정 설계를 정정**: 조건별 에이전트 정의 측정은 **조건마다 세션을 새로 시작해야** 성립한다(변형 파일이든 canonical 편집이든 동일). ② **반영 확인은 마커 한 줄 + 0-tool probe** 로 한다 — 값싸고(1.9초) 결정적이다. 이번에 그 장치가 없었으면 **조건 (a) 결과를 조건 (a) 의 결과로 오기록했을 것이다.** ③ **측정 자체는 중단하고 사용자에게 보고**했다(사용자 상시 지시: 「auto 모드가 builder.md 편집을 막으면 멈추고 알려라」의 인접 사례 — 편집이 막히지는 않았으나 효과가 없어 측정이 같은 방식으로 무효가 된다). ④ 건진 것: **조건 (a) 는 사실상 canonical 설정(`maxTurns 60` · effort 상속)의 Flutter 배선 task 실측 1건**이다 — 아래 Builder Effort Experiment 절에 그 자격으로 기록했다 |
| 75 | **`product_entry: null` 의 조건부를 아무도 확인하지 않는다.** ADR-072 매니페스트 schema 는 `product_entry` 를 「제품 라우트·딥링크 — R7 이 `## 9`·ARCH 라우팅에서 채우고, **미정이면 `null` + 배선 task line item 이 확정**」으로 정의한다. 즉 `null` 은 **조건부 허용**이다. 그런데 그 조건(확정하는 line item 의 존재)을 보는 관문이 없다 — R7 은 채우거나 `null` 로 두고 끝내고, `/plan-workitem` 은 그 필드를 모르며, 봉인 조건 4 는 매니페스트 존재·`approved.date`·`snapshots[]` 만 본다. 실측: M1 3화면 중 **2화면(`add-habit`·`admin-habits`)이 `null` 인데 그것을 채우는 line item 이 5개 task 어디에도 없었고 봉인이 통과했다.** `today-list` 만 T-002 `## 3` 3번이 우연히 담당했다. 결과: 승인 화면과 제품 라우트의 연결이 **문서 어디에도 없는 채로** 마일스톤이 잠긴다 — 다음 M 의 재사용 판정(ADR-072 D9)이 그 필드를 읽는다 | P1 | **수정** — `/seal-milestone` 조건 4 에 「이 M 매니페스트의 **`product_entry: null` 화면마다 그것을 확정하는 task line item 이 있는가**」를 박았다. 없으면 봉인을 막고 어느 화면이 비었는지 보고한다. **새 데이터를 만들지 않는다** — 매니페스트와 task `## 3` 를 나란히 놓는 것뿐이고, 조건 4 는 이미 그 매니페스트를 열고 있다. 프로젝트 쪽은 T-003·T-005 의 배선 결과로 두 필드를 채웠다 |
| 76 | **「배선만」 계약이 승인 UI 에 배선점이 없으면 성립하지 않는데, 그것을 보는 관문이 없다 — AC 는 충족인데 PX 는 제품에서 미검증인 상태가 봉인을 통과했다.** `PX-M1-add-habit-01` 은 「시트가 열리면 포커스가 이름 필드로 가고, **닫히면 열기 전 위치로 돌아온다**」이고 `## 7-3` 이 그것을 `T-003:AC-1`(열림) · `T-004:AC-3`(복귀)에 매핑했다. 그런데 **승인 UI `TodayListScreen` 이 FAB 에 `focusNode` 슬롯을 노출하지 않는다.** 그래서 (i) 계획은 「`main.dart` 에 `FocusNode` 를 보관하고 `openAddHabitSheet` 후 `requestFocus()`」라고 지시했고 (ii) 구현은 그대로 했으나 그 노드는 **생성·dispose·requestFocus 만 될 뿐 어떤 위젯에도 붙지 않는다** (iii) AC-3 테스트는 **포커스가 연결된 자체 하네스 버튼**으로 그 패턴을 검증해 통과했다. **테스트가 제품이 아니라 하네스를 검증했고 아무도 울지 않았다.** 3-S (b) 축은 발견 72 로 「`## 3` 가 지목한 **심벌**의 실재」까지 넓혔지만 「승인 컴포넌트가 이 PX 를 배선할 **슬롯**을 노출하는가」는 여전히 묻지 않는다 — 심벌은 없는 것이 아니라 **애초에 있어야 할 것이 없다** | P1 | **수정** — 3-S (b) 축에 **「슬롯 유무」**를 더했다: 어떤 PX·AC 가 승인 컴포넌트에 배선점(focus node·controller·scroll controller·key 등)을 요구하는데 그것이 노출되지 않으면 **배선 task 로 달성 불가**이므로 `- 배선점 부재: <무엇> — <어느 컴포넌트가 무엇을 노출하지 않는가>` 로 surface 하고 **재승인 경로를 함께 적는다.** 핵심 문장은 「**「배선만」 계약(ADR-072 D5-3)은 승인 UI 가 배선점을 가질 때만 성립한다**」다 — 그 전제가 어디에도 적혀 있지 않았다. 발견 72 와 같은 축이지만 **심벌 부재가 아니라 슬롯 부재**라 같은 검사로는 안 잡힌다. 프로젝트 쪽은 계획이 지시한 코드를 임의로 지우지 않고 **QA_FINDINGS 에 등재해 stabilize 라운드로 보냈다**(봉인된 계획의 결함 — ADR-057#amend-3 경로) |
| 77 | **raw-hex grep 의 예외 목록이 «하네스가 만들라고 한 파일»을 안 덮어 매 라운드 전건 오탐을 낸다 — 두 갈래 모두.** ① **Dart 정의 라인 예외가 타입 생략형을 놓친다.** 규정된 패턴은 `static +const +Color +[A-Za-z_]+ *=` 인데 실제 토큰 파일은 `static const paper50 = Color(0xFFFBFAF7);` 다 — **중복 타입 생략이 Dart 관례이고 `dart format`·lint 가 그쪽을 민다.** 결과: `tokens.dart` 의 **토큰 정의 전건**(11행)이 `P1 [Design-rawhex]` 로 잡힌다. ② **웹 예외가 R6-1 쇼케이스를 안 덮는다.** 예외는 「CSS custom property 정의 라인」뿐인데, `Theme.stories.tsx` 는 `{ label: 'paper/50 (bg/page)', hex: '#FBFAF7', varName: '--paper-50' }` 처럼 **토큰 값을 라벨로 표시**한다 — 그것이 쇼케이스의 존재 이유다. Flutter 쪽 `theme_gallery.dart` 도 같다. **둘 다 보일러플레이트가 R6-1 에서 생성하라고 규정한 파일**이라 모든 프로젝트에서 매 라운드 반복된다. ③ **자가 검사 fixture 도 안 덮는다.** `test/design_gate/self_bad_test.dart`·`self_ok_test.dart` 는 **색을 의도적으로 박아 둔 입력**이다(known-bad 의 2:1 대비 쌍이 그 파일의 존재 이유다) — 5건이 잡힌다. 이것도 `/stack-guard` 가 생성하라고 규정한 파일이다. 발견 13(단축 hex ↔ 이슈 번호)·26·60(`Colors.transparent`)과 같은 계열이지만 원인이 다르다 — 저쪽은 **정규식이 의미를 못 본다**였고 이쪽은 **예외 목록이 손으로 쓴 코드를 기준으로 만들어졌다**는 것이다 | P2 | **수정** — ① Dart 예외 패턴을 `static +const +(Color +)?[A-Za-z_][A-Za-z0-9_]* *= *Color\(` 로 넓혀 **타입 표기를 선택으로** 만들었다 ② **`_theme` 매니페스트 `source[]` 에 등록된 파일을 검사 대상에서 제외**한다. **파일명 휴리스틱이 아니라 매니페스트를 근거로 삼는 것이 핵심이다** — 기존 원칙(「파일명(`theme`/`tokens`)으로 파일 전체를 빼지 않는다 — 사용처 위반 은폐 방지」)과 충돌하지 않는다. 그 매니페스트에는 토큰 배선·쇼케이스 파일만 있고 **제품 화면 코드는 없으므로** 사용처 위반은 그대로 잡힌다. ③ **`@Tags(['design-gate'])` 가 붙은 자가 검사 fixture 를 제외**한다 — 그 태그는 이미 `--exclude-tags=design-gate` 로 통합 validate 에서 쓰이고 있어 **새 표식을 만들지 않는다.** 세 예외의 공통 설계는 **「하네스가 이미 쓰고 있는 근거(매니페스트·태그)를 재사용하고 파일명 휴리스틱을 만들지 않는다」**이다. **부수 기록**: 이 발견은 내가 skill 의 정규식 대신 임의 grep 으로 5-2 를 돌렸다가 오탐을 의심하고 **규정대로 다시 돌려서** 나왔다 — 첫 grep 은 Dart 문자열 리터럴을 잡아 「규칙이 틀렸다」는 잘못된 결론으로 갈 뻔했다 |
### step 10 `/stabilize-milestone M1` 결과 (2026-09-11)

- 전 단계 실행: deterministic preflight(unmapped FAC 0 / unmapped PX 0 / ADR 참조 전부 실재 / pattern-scan 잔존 0) · `validate` exit 0 · `validate:e2e` web `PASS` 6/6 · §3-V 경험 게이트 실행 · qa 3 + reviewer 2 팬아웃 · `pnpm audit` 취약점 0.
- **6-S 판정 후 등재**: QA_FINDINGS `## M-1` 17건(P0 5 / P1 9 / P2 3, 전부 `confirmed`) · IMPROVEMENT_GUIDE `### M1` 25건(open 22 — P1 11 / P2 11, `rejected-fp` 3) · DECISION_REGISTER D-015~D-017 `open`(`- 발견: 봉인 후 (M1)`).
- **graduation: `NO`** — item 1·2·3 충족, item 4 미충족(`T-004:AC-1` 관측 receipt 미발급), item 5 미충족(P0 5건), item 6 미충족. 우선순위대로 `NO`가 `PENDING_ACCEPTANCE`를 덮는다. 7-T 수렴 `round 0` / P0 재현 첨부율 100% / needs-confirmation 1(P2).
- **P0 5건 전부 메인이 재현 절차를 다시 실행해 관측**했다(ADR-070 D2): 삭제 연속 클릭 캐스케이드(3→1) · 재읽기 실패 시 입력 무성 소실 · empty/error `h1` 0개 · content order 위반(`main` 자식이 `[form, section]`) · `main` 291.94px + 1280에서 버튼 줄바꿈.
- **경험 게이트의 실효 확인**: `validate` 0 · e2e 6/6 · axe 0 · 승인 스냅샷 ↔ proto 재렌더 12/12 바이트 동일 — 전부 green인 상태에서 **제품 렌더 대조만이 P0 3건을 잡았다**. 발견 23이 그 이유를 설명한다.
- 실행 규율: 팬아웃은 「1축 = 1 unit」을 지켰다(qa 3단위 = F-001 / F-002 / a11y·반응형 surface, reviewer 2단위 = code / design) — T-003·T-004에서 어긴 «축 합치기»(발견 17)의 회귀 없음.

### 수정분 커밋
`fix(harness): correct design gate adapter, protected-path timing and Red definition from dogfood round 11`

## 참조 무결성 (P7-1 — 2026-09-11 재실행)

본 라운드의 harness 변경(ADR-070#amend-1 · ADR-004#amend-6 · ADR-071 D6 확장 · ADR-072 D5-3-1·#amend-3 · skill 8종 · agent 12종) **뒤에** 부록 E 스크립트를 다시 돌렸다.

| 검사 | 기준 | 결과 |
|---|---|---|
| 1. ADR 번호·링크 목적지 존재 | count 0 | **0** |
| 2. amend 앵커 존재 | count 0 | **0** |
| 3. Surfaces 역참조 (이번 라운드 ADR) | count 0 | **0** |
| 4. 죽은 ADR 인용 (ADR-027 (현재 SSOT: ADR-073) · ADR-056 (현재 SSOT: ADR-072)) | count 0 | **0** |
| 5. 로스터 집합 (skills ↔ STRUCTURE ↔ README ×2 ↔ wrappers) | ok 4줄 | **ok 4줄** (skill 27종) |
| 6. 인덱스 amend 수 ↔ 본문 `## Amendment N` 수 | count 0 | **0** |
| 3. `--all-surfaces` (전 ADR) | Phase 0 기준선 9 **이하** | **9** — 늘지 않음 |
| 4. `--all-dead` (전체) | Phase 0 기준선 11 **이하** | **11** — 늘지 않음 |

라운드 중 검사 3 이 한 번 발화했다 — ADR-072#amend-3 의 `### 적용 surface` 에 자기 파일 경로를 `ADR-072-…md`(말줄임표)로 적어 «실재하지 않는 파일» 로 읽혔다. 그 줄을 surface 행이 아니라 괄호 주석으로 내려 해소했다. **자기 파일은 surface 행이 아니다** 는 규칙이 문서화돼 있지 않아 생긴 일이며, 검사가 그것을 잡아냈다는 점에서 장치는 의도대로 작동했다.

## Round 12 (2026-09-11~, 습관 메모 앱 + 관리자 웹 / Flutter + Next.js — 프로필·target별 e2e 검증)

> **진행 중** — 본 절은 `/stack-guard`·`/plan-milestone`·`/bootstrap-design`(R1·R3~R6)까지 수행한 시점의 기록이다. `/design-milestone` 이후는 완주 후 채운다.
> isolated fork (baseline `6207cde` + harness sync `13f6485`·`3ead7e4`). 실제 Flutter 3.47.3 / Dart 3.13.3 / Node 24.20 / pnpm 10.33 / Next 16.3.4. **Android 에뮬레이터(`emulator-5554`)와 iOS 시뮬레이터(iPhone 16e)를 실제로 띄워 실행 검증했다.**
> 수행 방법의 한계는 Round 8·9·11과 같다 — 메인 세션 skill 구간은 SKILL.md대로 실제 명령 실행·실제 커밋을 동반해 수작업 재현했고, designer·builder·planner 위임만 진짜 sub-agent 실행이다.

### 이 라운드가 잡은 것 — 요지

Round 12 의 값은 «웹 전용 라운드가 구조적으로 못 보는 것»에 있다. 실제로 **P0급 2건(발견 54·55)이 Flutter 경로에서만 나왔고 둘 다 게이트가 `blockers: 0` 을 내는 동안 성립했다.**

- **발견 54 — Flutter 승인 스냅샷 경로가 끊겨 있었다.** 어댑터가 `DESIGN_GATE_OUT` 을 `--dart-define`(컴파일 타임 상수)으로만 넘기는데 위젯 테스트가 `Platform.environment` 로 읽으면 null 이라 **PNG 가 한 장도 생기지 않는다.** ADR-072 D4(승인 스냅샷)·D7 §3-V native 경로가 통째로 성립하지 않는 상태였다.
- **발견 55 — 생성된 Flutter 스냅샷의 글자가 전부 네모다.** `flutter test` 는 폰트를 로드하지 않으면 tofu 로 그린다. 같은 쇼케이스의 웹 스냅샷은 한국어 카피·대비비 라벨·대표 화면이 전부 읽힌다. 「육안 대조 참조」의 절반이 원리상 비어 있었다.
- **발견 38·56 — 루트 기준 규칙이 monorepo scope 에 닿지 않는다** (같은 계열 2건). 스캐폴드가 `apps/web/AGENTS.md`·`CLAUDE.md` 를 심었는데 루트 201파일 해시는 완전 동일했고, 게이트 빌드 출력이 `apps/web/design-gate-storybook/` 에 생겨 scope 도구가 그것을 format 대상으로 삼아 `validate` 가 300초 timeout 났다.
- **발견 42 — `shadcn init` 이 DESIGN 토큰 결정 전에 `globals.css` 를 선점한다.**

### 1~3단계 `/bootstrap-stack` → `/stack-guard` (2026-09-11)

- **registry**: 확정 37 / 해당 없음 18 / 이관 5 / 미결정 0 / **빈 행 0**. `(scope, id)` 키가 실제로 갈렸다 — `cat-common-package-manager` 가 `apps/mobile: pub` · `apps/web: pnpm` 두 행이다(ADR-071 D2 의도대로, 한 행으로 뭉개지지 않음).
- **수행 0 스캐폴드**: `apps/mobile` = `flutter create` 3.47.3(110파일) · `apps/web` = `create-next-app` 16.3.4(24파일), 두 행 다 `done`. **루트 보호 경로 201파일 해시가 복사 직전·직후 완전 동일**하고 0-H(실행 시작·종료)도 변경 0건, `AGENTS.md` 57줄 유지.
- **자가 검사 4케이스 전부 PASS** — 웹 전용 프로젝트에서 도달 불가였던 **(d) Flutter fixture 가 이 저장소에서 처음 실행됐다**. ADR-072#amend-1 결정 2 의 falsifier (a)가 발화하지 않는다.
- **probe smoke**: 5회차 전부 기대대로 → `PASS (probe verified, project clean)`. monorepo 라 회차마다 두 scope 에 하나씩 두고 fail-fast 로 미도달한 scope 는 단독 실행으로 재측정했다(회차 수 불변 — 발견 45 가 그 규칙을 skill 에 박았다). `flutter analyze` 겸업은 진단 카테고리로 갈랐다 — round 2 `unused_local_variable`(lint 규칙 id), round 3 `return_of_invalid_type`(타입 error).
- **`validate:e2e` 집계: web PASS / android PASS / ios PASS** — 선언 target 3개를 전부 실기기(에뮬레이터·시뮬레이터)에서 돌렸다. `package.json` 어디에도 `-d` 리터럴이 없고 `scripts/e2e-target.mjs` 가 실행 시점에 `flutter devices --machine` 으로 device id 를 해석한다(ADR-059#amend-1 결정 1 의도대로).

### 4~5단계 `/plan-milestone` → `/bootstrap-design` (2026-09-11)

- **`/plan-milestone`**: M1 `draft` 유지 + feature 3개, 셋 다 `## 11` 에 `Design:` 줄 → UI 마일스톤 판정이 정상 작동. `## 9` 화면 전환은 비워 뒀고(design-milestone R1 소관) `## 7-1`·`## 7-3` 도 미작성으로 남겼다.
- **DESIGN `## 0` 프로필표 2행** (consumer-mobile / admin-web), 공유 모드 «공통+delta».
- **프로필 delta 블록은 `## 2`·`## 3` 에만 4개**. `## 1`·`## 4`~`## 11` 은 공통이다. **ADR-073 의 falsifier(«delta 가 §2~§10 전 절에 생기면 D3 재검토»)가 발화하지 않는다** — 두 표면이 실제로 갈린 것은 (a) 다크 모드 차단 방식 (b) 폰트 전달 방식 둘뿐이었다.
- **R6-1 테마 배선**: Flutter `lib/theme/*` + `theme_gallery.dart` + 위젯 테스트, 웹 `tokens.css` + `Theme.stories.tsx` — **둘 다** 생성. `_theme` 매니페스트에 두 화면 등록, 게이트 blockers 0 / reports 0.
- **킷 토큰 충돌 해소**: `globals.css` 의 shadcn 변수 14개를 DESIGN semantic 토큰의 **별칭으로 단방향 재정의**(shadcn → DESIGN). ADR-071 D6 확장으로 그 규칙을 박았다(발견 42).
- **갤러리 라운드(R0-G)는 생략했다** — 세션 예산. DESIGN `## 11` 에 그 사실을 명시했고 플랫폼 공식 가이드라인만 기준 자료로 적었다.


### 6단계 `/design-milestone M1` (2026-09-11, R0~R7)

- **R1 화면 전환표**: M1 `## 9` 에 3화면·primary/failure/recovery 전 path type 기입. 재사용 판정 0건(첫 UI 마일스톤).
- **R3 브리프 3종 승인**. reviewer(design surface)가 `[Design-element-rationale]` **P2 3건**을 냈는데 **셋 다 같은 모양**이었다 — 「없으면 무엇이 깨지는가」를 「화면이 성립하지 않는다」로 답한 동어반복. ADR-072#amend-2 falsifier (b)가 예측한 실패 양식이 **다른 필드에서** 먼저 나온 셈이다(그 falsifier 자체는 `## 7-1` 증명 문장을 겨냥한다 — 7단계 참조).
- **R4 코드 초안**: builder 2 dispatch 가 **둘 다 45턴 상한에서 보고 0건**으로 멈췄다(발견 59 → ADR-004#amend-7). 작업은 거의 끝나 있었고 죽은 자리는 최종 검증이다.
- **R5 선택·수정 루프**: 용어 사전 자기 정합 검사에서 카피 충돌 1건(발견 57) — 「오늘 체크를 다 했어요」로 교체하고 5개 문서를 함께 갱신했다. **A/B 선택은 이 라운드에서 일어나지 않았고 아무 관문도 그것을 잡지 못했다**(발견 62·63 → ADR-072#amend-4).
- **R6 게이트·승인·스냅샷**: 3화면 18상태(4개는 `render` 조건 보유), **승인 스냅샷 26장**, blockers 0 / reports 0. 이 라운드가 P0 3건을 낳았다 — **54**(`DESIGN_GATE_OUT` 이 `--dart-define` 으로만 와서 PNG 가 한 장도 안 생김) · **55**(폰트 미로드로 글자가 전부 tofu) · **58**(상태별 렌더 조건이 조용히 버려져 `narrow-320` 기준선이 1280px 전체 폭으로 찍힘). 셋 다 **게이트가 `blockers: 0` 을 내는 동안** 성립했다.
- **R7 승격**: 3화면 전부 `## 9` 전환표에 있고 PX 13개가 매니페스트 ↔ feature 에서 일치(5+4+4), 원장 open 0건 → feature 3개 먼저, M1 마지막으로 `contract-ready`.
- **뒤늦게 드러난 것**: 승인 표면 5파일의 추적 헤더가 승인 뒤에도 전부 `승인: <미정>` 이었다(발견 65) — R6 절차가 매니페스트만 채우고 코드를 두고 간다.

### 7단계 `/plan-workitem M1` (2026-09-11~12) — **ADR-072#amend-2 falsifier 판정**

- **산출**: task 5개(AC 16개) + feature 3개의 `## 7-1`·`## 7-2`·`## 7-3` 전부 기입. 전 task 가 `- 승인 UI 재사용: <경로> (manifest: <id>) — 배선만: …` line item 을 갖는다.
- **3-S 3축 결과** — (a) UI 지시 출처 **위반 0건**(신규 시각 요소 0개; 대응 AC 0개인 지시 1건만 surface — 브라우저 탭 제목 문구) · (b) 계측 배선 불가 **0건**(세 이벤트가 전부 승인 컴포넌트 콜백에서 발화 가능함을 시그니처로 확인. 부수 관측 1건을 task `## 8` 에 남겼다 — `canSubmit` 이 `name.isNotEmpty`(trim 이전) 이라 공백만 입력해도 콜백이 발화한다) · (c) 증명 문장 **14행 전부 기입**.
- **falsifier (b)(「증명 문장이 동어반복으로 나온다」) 는 부분 발화했다 — 14행 중 3행(21%)**. 다만 순수 동어반복이 아니라 **반쪽 채움**이다: AC 조건(어려운 쪽)은 실제로 인용했고 FAC 의 요구를 「그대로」로 때웠다. 나머지 11행은 진짜 증명이었고 일부는 보강 논거까지 달았다. **규칙이 실패한 것이 아니라 규칙의 금지 문구가 슬롯 하나만 겨냥하고 있었다**(발견 67 → 두 슬롯 강제 + 식별자 인용 규칙).
- **R3 의 동어반복 3건과 대비된다.** 같은 세션·같은 라운드인데 브리프 `근거 4문항` 은 셋 다 동어반복이 나왔고 `## 7-1` 증명 문장은 79% 가 진짜였다. 차이는 **형식이 슬롯을 명시했는가**다 — `## 7-1` 은 `<어느 조건>`·`<어느 요구>` 두 빈칸을 주고 금지형을 예시로 박았다.
- **위임 예산 실패 (발견 64)**: `planner` 가 12턴 상한에서 **2회 연속 보고 0건**으로 멈췄고 3회차에 완주했다 — 누계 463K 토큰·약 15분. 회수 dispatch 에 산출물 목록·우선순위·「침묵이 최악」을 명시했는데도 2회차가 또 침묵했다.
- **`/seal-milestone M1` 이 조건 3-b 에서 2건을 잡았다** — 앞뒤 공백이 붙은 이름의 저장 형태(T-003 AC-2)와 재시도 시 「중복 없음」의 달성 방식(T-004 AC-2). 둘 다 구현이 실질적으로 갈리는 자리이고 **plan·3-S 가 못 잡은 것을 봉인 게이트가 잡았다**. 사용자가 trim 후 저장 / 같은 id 재사용으로 확정했고, 후자는 「같은 이름의 습관을 두 개 만들 수 없다」는 **아무도 약속한 적 없는 제품 규칙**이 구현에 조용히 들어오는 것을 막았다.
- **`/seal-milestone` 조건 4 가 처방의 불완전함도 잡았다** — 발견 66 을 `## 7-1` 만 고쳤더니 `## 7-3` 에 같은 모양의 행이 남아 있었다(ADR-037#amend-4 결정 1-b 로 확장).

### 8단계 `/validate-plan M1` → `/repair-plan M1` → `/seal-milestone M1` (2026-09-12)

**이 경로는 Round 11·12 를 통틀어 처음 실행됐다** — 그 공백 자체가 기록 대상이다(아래 「수행 방법의 한계」).

- **`/validate-plan M1 --reviewer-tag claude-b`** (reviewer 위임): 판정 **ALL_GOOD (P0 0)** / `[seal-blocking]` P1 **2건** / 비차단 P1 2건. **두 라운드에 새로 박은 검사 4종이 전부 실행됐고 오탐 0건**이다 — ⑧ 스냅샷·`approved.date`·`프로토타입:` id 실재(26장·3건·3건 전부 통과) · PX 소유·문법 ①~⑦(코드 13 PX = 3 feature 인벤토리 disjoint union 정확 일치) · 증명 문장 미러 · 제3 형식 조건 (ii). **오탐 0건이 이 라운드에서 가장 값싼 신호다** — 새 검사가 통과만 시키는 것이 아니라 진짜 drift 1건(add-habit PX mirror)을 잡았다.
- **reviewer 가 12턴 상한에서 보고 0건으로 멈췄다**(발견 68) — 회수 dispatch 에 「이번 턴에 제일 먼저 파일을 써라」를 넣자 즉시 완주했다.
- **`/repair-plan M1`**: 4건 전부 판정·처리해 `IMPROVEMENT_GUIDE ## 5` 에 영속(`M1-repair-1`~`4`). 셋은 `Adopt`, 하나는 `Adopt-modified` — `[Plan-arch]` 는 **관측은 맞지만 원인이 계획이 아니라 ARCH 의 계층 그래프**였다(조립 지점 부재). 리뷰 파일 삭제.
- **`/seal-milestone M1`**: 1차 실행이 **조건 3-b 에서 막혔다** — AC 해석 미확정 2건(앞뒤 공백이 붙은 이름의 저장 형태 / 재시도 시 「중복 없음」의 달성 방식). **둘 다 plan 과 3-S 가 못 잡은 것을 봉인 게이트가 잡았다.** 후자는 「같은 이름의 습관을 두 개 만들 수 없다」는 **아무도 약속한 적 없는 제품 규칙**이 구현에 조용히 들어오는 것을 막았다.
- **봉인 게이트가 처방의 결함도 두 번 잡았다** — 조건 4 가 (i) `## 7-3` 에 같은 모양의 미매핑 행이 남은 것과 (ii) 조건 (ii) 대조의 출처(`## 4-1`)가 **구현 시점에 채우는 칸이라 봉인 시점엔 5/5 가 비어 있다**는 것을 잡았다. **규칙을 쓴 당일 돌려 보지 않았으면 둘 다 Round 13 까지 살아 있었을 것이다.**
- 2차 실행: 조건 1~9 전부 통과 → task 5 → feature 3 → M1 순으로 `ready` 승격 + receipt 기록. **feature 3 / task 5 / AC 16 / FAC 14 / PX 13 / INV 3.**

### 9단계 T-001 구현 (2026-09-12)

- 도메인(`habit_models.dart`)·저장 어댑터(`habit_repository.dart`) + 테스트 7건. Red(파일 부재로 2 파일 로드 실패) → Green(7/7) → Refactor 없음. `npm run validate` 전 단계 통과. **AC 4/4 기계 검증 · 자동화율 100%.**
- `flutter pub add shared_preferences` 가 `^2.5.5` 를 넣었다(task `## 3` 는 `^2.3.0` 기재) — 상위 호환 범위라 해석 확정 불필요, `- closure` 줄에 기록.

**부수 관측 — 세션 이전의 에이전트 파일 규칙은 실제로 작동한다 (발견 74 의 반대편 증거).** T-003 dispatch 의 builder 가 **컴파일되는 오답 스텁을 따로 만들어** 어설션 실패를 관측하고 「모듈 부재 컴파일 오류는 Red 로 세지 않았다」고 명시 보고했다. 그 규율은 `builder.md` 27행(ADR-064 D2 / ADR-072 D5 «가짜 Red 금지»)에 있고 **내 dispatch 프롬프트에는 없었다** — T-003 에는 「실패를 실제로 관측한 뒤 구현한다」만 적었다. 즉 **세션 시작 시점에 파일에 있던 규칙은 live 였다.** 발견 74 의 주장은 「에이전트 파일이 안 읽힌다」가 아니라 정확히 **「세션 시작 뒤의 편집이 반영되지 않는다」**이며, 이 관측이 그 경계를 확정한다.

### 발견 71 판정 — 실제 결함인가 측정 산물인가 (2026-09-12 실측)

**판정: 실제 렌더 결함이다.** 측정 산물이 아니다.

실제 Pretendard 를 적재한 위젯 테스트로 같은 스타일(`ink600 #5A5750` on `paper50 #FBFAF7`, 16px/1.6)의 세 텍스트를 390px 폭에 렌더해 PNG 픽셀을 직접 셌다. 저작 대비는 **6.90:1**이다.

| 렌더 텍스트 | 잉크 픽셀 수 | 최암 픽셀 | 최암 픽셀의 대비 |
|---|---:|---|---:|
| 「—」 | **32** | `#726F69` | **4.80:1** |
| 「남은 개수 알 수 없음」 | 830 | `#5A5750` | **6.90:1** |
| 「남은 3개」 | 390 | `#5A5750` | **6.90:1** |

- **낱말은 저작 색에 도달한다** — 최암 픽셀이 `#5A5750` 로 **저작값과 바이트 일치**다. 안티에일리어싱 가장자리가 섞여도 글리프 내부에 완전 커버리지 픽셀이 존재한다.
- **「—」는 어디에서도 저작 색에 도달하지 못한다** — 16px 에서 em dash 의 획이 1 디바이스 픽셀보다 얇아 **모든 픽셀이 부분 커버리지 혼합**이다. 최암 픽셀조차 저작값보다 2.1 낮다.
- 따라서 **「저작 대비 6.90:1 이 화면에 재현되지 않는다」는 사실은 표본 방식과 무관하다.** 게이트가 낸 3.35:1 은 표본 평균에 가까운 값이고 최암은 4.80:1 이라 **「4.5:1 미달」이라는 단정 자체는 표본 방식에 좌우되지만**, 결함의 존재는 좌우되지 않는다.
- **처방(낱말로 교체)이 맞다.** 교체 후 최암 픽셀이 저작값과 일치하므로 결함이 사라진다 — 오탐을 회피한 것이 아니라 결함을 고친 것이다.

**Round 12 의 이전 Flutter a11y 통과는 무효다.**

- 폰트 적재 이전(2026-09-11 R4·R6 전 구간)의 **`meetsGuideline(textContrastGuideline)` 판정은 전부 무효**다. tofu 는 획이 굵어 완전 커버리지 픽셀이 많고, 그 상태의 통과는 **실제 글꼴에 대해 아무것도 보증하지 않는다.** 그 구간의 「guideline 4종 전부 통과」 기록은 **3종 통과 + 1종 미측정**으로 읽어야 한다.
- 나머지 3종(`androidTapTarget`·`iOSTapTarget`·`labeledTapTarget`)은 기하·시맨틱 기반이라 글리프 렌더에 원리상 무관하다. 다만 텍스트 폭이 달라져 레이아웃이 움직일 수는 있으므로 **원리 주장에 기대지 않고 재실행으로 확인했다** — 폰트 적재 후 29 테스트 전부 통과, 실패는 「—」 1건뿐이었다.
- 같은 이유로 **R6 게이트의 `blockers: 0` 도 그 구간에서는 1종 미측정 상태의 0 이었다.** 발견 54(PNG 미생성)·58(렌더 조건 무시)에 이어 **같은 라운드에서 게이트 신뢰도 결함이 3건**이고, 셋 다 게이트가 `blockers: 0` 을 내는 동안 성립했다.

### 10단계 구현 + `/stabilize-milestone M1` (2026-09-12) — **졸업 YES**

- **구현 5 task**: T-001(도메인·저장, 메인 세션 수작업) · T-002~T-004(Flutter 배선, builder dispatch 3회) · T-005(관리자 정적 데이터, builder dispatch 1회). **네 dispatch 전부 승인 UI 바이트 무변경**이고, 넷 다 범위 밖 조치·미구현을 **먼저 보고**했다.
- **Red 관측의 질**: T-003·T-004 가 **컴파일되는 오답 스텁**을 따로 만들어 어설션 실패를 봤다(`pumpAndSettle timed out`·`Expected: true, Actual: <false>`). 「모듈 부재 컴파일 오류는 Red 가 아니다」(`builder.md` 27행 / ADR-064 D2 · ADR-072 D5)를 **dispatch 프롬프트에 없이도** 지켰다.
- **졸업 6항목 전부 통과** — 마감 스냅샷(5/5 `verdict=Pass`) · 통합 validate OK · **e2e 3 target(web·android·ios) 실기기 PASS** · 관측 AC 0건 · M-1 P0 0건 · 추가 기준 0건.
- **열린 항목 1건 (P1, M1-001)**: `PX-M1-add-habit-01` 의 포커스 복귀가 제품 경로에서 배선되지 않았다 → 발견 76.
- **stabilize 가 잡은 내 형식 오류 1건 (정직 기록)**: `- closure` 줄 5건을 ADR-068 D2 의 SSOT 형식(`verdict=` / `기계AC=` / `audit=` / `관측대기=` / `자동화율=`) 없이 **내 임의 형식으로 썼다.** 졸업 item 1 이 그것을 입력으로 읽어 잡았다. 원인은 **`finalize-workitem` 이 그 줄의 단독 writer인데 이 라운드가 그 skill 구간을 수작업 재현하면서 형식 SSOT(TASK_TEMPLATE 주석)를 읽지 않은 것**이다 — 보일러플레이트 결함이 아니라 수행 방법의 한계다.
- **5-2 raw-hex grep 을 규정대로 돌리니 발견 77 이 나왔다** — 그전에 **임의 grep 으로 먼저 돌려 오탐을 의심**했고, 규정대로 다시 돌려서야 진짜 원인(예외 패턴이 Dart 타입 생략형을 놓치고, 하네스가 생성하라고 한 파일들을 안 덮는다)이 보였다. **임의 grep 의 결과로 규칙을 고쳤으면 틀린 처방을 박을 뻔했다.**

### ADR-017 성공 기준 (Round 12)

| 지표 | 목표 | 실측 | 판정 |
|---|---:|---|---|
| 사용자 개입 | ≤1 | **0** — skill 산출물 직접 편집 0건(정의상 «질문 응답 제외». 이 라운드의 사용자 결정 9건은 전부 Decision Brief·A/B 선택·AC 해석 확정·봉인 승인 등 **ADR-060 이 설계상 요구하는 응답**이다) | 통과 |
| placeholder 충원율 | ≥80% | **100%** — 생성·소유 산출물 15개(DISCOVERY/CHARTER/ARCH/DESIGN/STACK_SETUP_PLAN/ADR-100/ADR-101/M1/F×3/T×5) 전부 실콘텐츠. 남은 angle-bracket 7건은 전부 주석·경로 템플릿·예시 문법 | 통과 |
| graduation pre-check 미통과 사유 | ≤2 | **0** — 6항목 전부 통과 | 통과 |

**ADR-017 gate: 3/3 통과. M1 graduation: YES (open P1 1건은 졸업을 막지 않는다 — item 5 는 P0 기준이다).**

**규모**: feature 3 / task 5 / AC 16(unit 5 · integration 11) / FAC 14 / PX 13 / INV 6 / 승인 화면 3 · 상태 18 · 스냅샷 26.

### 결정에 미친 영향 (Round 12)

Round 12 가 **ADR 8종에 개정 14건**을 만들었다(Phase 7 신규 기준 — 위 「Phase 7 개정 목록」 표). 그중 이 라운드가 **없었으면 나오지 않았을** 것만 추린다.

**웹 전용 라운드가 구조적으로 못 보는 것 — 5건**

- **발견 54·55·71 (Flutter 승인 경로)**: PNG 미생성 · tofu 렌더 · **그 tofu 가 `textContrastGuideline` 판정을 뒤집는다**. 셋 다 게이트가 `blockers: 0` 을 내는 동안 성립했고, **웹에는 대응물이 없다**(웹은 Playwright 가 실제 브라우저 폰트로 그린다). ADR-072 D3·D6 과 ADR-073#amend-1 이 여기서 나왔다.
- **발견 38·56 (monorepo scope)**: 루트 기준 규칙이 scope 에 닿지 않는다 — 보호 경로 해시가 루트만 보고, scope 도구가 게이트 빌드 출력을 format 대상으로 삼아 `validate` 가 timeout 났다. 단일 패키지 프로젝트에서는 둘 다 도달 불가다.

**「규칙이 있는데 수행 자리가 없다」 계열 — 4건**

- **발견 61·69 (DESIGN → 배선)**: `## 4` 레이아웃 결정이 산문이라 참조할 토큰이 없었고(61), `## 3` 폰트 결정의 **전달 방식**에 대응하는 배선 단계가 아예 없었다(69). 두 번 다 **결정은 확정돼 있는데 코드가 그것을 가리킬 수 없는** 모양이다.
- **발견 62·63 (`구성 불확실`)**: 사용자가 자기 몫으로 유보한 A/B 선택에 **원장 자리도 렌더 자리도 없었다.** enum 기본값이 선택을 대신했고 승인 스냅샷이 그 값으로 동결됐다.
- **발견 66 (승인 표면이 검증하는 FAC)**: ADR-072 가 새 검증 매체를 들였는데 ADR-037 의 커버리지 모델이 그것을 모른다 — **두 ADR 사이의 이음매**다.

**위임 예산 계열 — 3건, 그리고 이 라운드의 가장 비싼 교훈**

- **발견 59·64·68**: builder 2 · planner 2 · reviewer 1, **총 5회**가 산출물 직전에 보고 없이 멈췄다. **중간 보고는 5/5 에서 한 번도 나오지 않았다.** amend-6(턴 수)·amend-7(작업량)·amend-8(부분 보고 형식)은 셋 다 *멈추는 순간에 무엇을 하라*는 지시였고 전부 실패했다. amend-9 가 지시의 형태를 **«산출물을 먼저 만들어라»** 로 바꿨다 — 에이전트는 언제 멈출지 예측할 수 없지만 **일의 순서는 바꿀 수 있다.**
- **발견 74**: 그리고 그 amend 들이 **이 세션에서 검증되지 않았다** — 에이전트 정의가 세션 시작에 고정되기 때문이다. 이 사실은 **재측정 설계(amend-5 결정 4)가 서 있던 진단이 틀렸다**는 것까지 뒤집었다.

**실행이 규칙을 고친 횟수 — 4건 (이 라운드의 방법론적 결론)**

같은 날 쓴 규칙을 같은 날 돌려 보자 **네 번 고쳐야 했다**: ADR-037#amend-4 가 두 번(`## 7-3` 누락 · 대조 출처 오지정), ADR-073#amend-1 이 한 번(패키지 CSS import 불인정), ADR-005#amend-2 를 낳은 sync 사고가 한 번. **넷 다 실행이 잡았고 리뷰가 잡은 것은 하나도 없다.** Round 13 의 첫 과제를 「새 규칙」이 아니라 「미검증분 실행」으로 둔 근거가 이것이다.

### 수행 방법의 한계 — 교차 검토 경로 (정직 기록)

**Round 11·12 를 통틀어 `/validate-plan` → `/repair-plan` 경로가 한 번도 실행되지 않았다.** 그런데 이 두 라운드는 그 경로에 검사를 여러 개 새로 박았다 — 매니페스트 기반 PX 소유·문법 ①~⑦, ⑧ 스냅샷·`approved.date` 실재, 증명 문장 미러, 제3 형식 판정. **규칙이 아무도 걷지 않는 길에 쌓이고 있었다.** 사용자 지시로 7단계 뒤에 `/validate-plan M1` 을 같은 세션에서 실행해 그 공백을 메웠다(결과는 아래 8단계).

## Phase 7 개정 목록 (P7-4 — 기준 `6207cde`..HEAD, 2026-09-12)

Phase 7 이 건드린 boilerplate ADR 8종. **개정 수**는 `## Amendment` 헤딩 실측이고, **falsifier**는 각 amendment 의 `Mutation delta` 에 사전 등록된 문장의 판정이다. **실행 검증**은 «그 규칙이 실제 라운드에서 한 번이라도 수행됐는가» — 규칙을 쓴 것과 돌려 본 것은 다르다.

| ADR | Phase7 신규 / 총 | falsifier 발화 | 실행 검증 | ADR-045 D6 임계(8) |
|---|---:|---|---|---|
| **004** 모델 별칭·에이전트 예산 | **5 / 9** | **4회 발화** — amend-4(제3의 경우로 규칙 공백 노출) · amend-6 (a)(보고 0건 2회) · amend-7 (b)(반대 방향 — 중간 보고 0건) · amend-8 (a)(**신설 당일**, reviewer) | **부분** — amend-5(effort 제거) 실행됨 / amend-7 `maxTurns: 60` 은 **적용 후 builder dispatch 0건 — 미검증** / amend-9 write-first 는 **dispatch 프롬프트**를 통해 1회 검증(reviewer 회수 — 즉시 완주)이며 **에이전트 파일 표면은 미검증**이다(발견 74 — 세션 중 편집이 반영되지 않는다) | **초과 (9 > 8)** — 재발행 대상 |
| **017** dogfood 시뮬레이션 | 0 / 1 | 해당 없음(본문 절 추가) | ✅ accept-milestone 경로를 밟아 receipt 거부까지 확인 | 1 |
| **037** spec coverage | 1 / 4 | **미발화** — (a) 제3 형식 비율 7%(임계 30%) · (b) 조건 (ii) 위반 0건 | ✅ seal 조건 4 에서 실행 — **그리고 처방이 2회 불완전해 실행이 잡았다**(`## 7-3` 누락 · 대조 출처 오지정) | 4 |
| **047** code-as-agent-harness | 1 / 3 | 미측정(신설 당일 — 3라운드 뒤 판정) | **부분** — amend-9 가 7 필드로 작성돼 1회 적용, 소급 개정은 하지 않음 | 3 |
| **070** finding severity·수렴 | 1 / 1 | 미발화 — (a)~(d) 4종 전부 | ✅ Round 11 stabilize 3라운드 + 수렴 브리프(option C)까지 실행 | 1 |
| **071** stack catalog·scaffold | 1 / 1 | 미발화 — (a)(b)(c) / (d) HYBRID 는 미측정 | ✅ Round 12 `/bootstrap-stack`→`/stack-guard` 전 구간 실행 | 1 |
| **072** design milestone | **4 / 4** | **1회 부분 발화** — amend-2 (b) 증명 문장 동어반복 **14행 중 3행(21%)**. amend-1 (a)(b)·amend-3 (a) 미발화, amend-4 는 신설 당일 미측정 | **부분** — amend-1·2·3 실행됨 / **amend-4 미실행**(그 규칙이 *없어서* 발견 62·63 이 났다) | 4 |
| **073** 인터페이스·DESIGN 내용 | 1 / 1 | **1회 발화** — (a) **신설 당일**: 선언도 파일도 실재하는데 번들러가 복사하지 않아 1차 통과·2차만 검출 → 규정된 응답(파일 실재 확대) 대신 더 좁은 처방(패키지 CSS import 불인정) | ✅ 게이트 2단계 검사 실행 + 스냅샷 26장 재촬영·재승인 | 1 |

### 읽어야 할 것

- **ADR-004 는 임계를 넘었다 — 9 개정.** ADR-045 D6 은 「개정 8개 이상 누적 → 통합 재발행(supersede)」이고 D6 의 grandfather 조항은 *ADR-045 이전에 이미 누적된* ADR 에만 적용된다. ADR-004 의 amend-4~9 는 **전부 Phase 7 이후**이므로 grandfather 대상이 아니다. **다음 변경은 amend 가 아니라 통합 재발행이어야 한다.** 본 라운드에서 재발행하지 않은 이유는 amend-8·9 가 같은 날 falsifier 발화로 연쇄해 **정책이 아직 안정되지 않았기 때문**이다 — 재발행은 amend-9 falsifier 가 판정된 뒤(Round 13)가 맞다. 그 사실을 여기 남긴다.
- **개정 수와 falsifier 발화가 같이 간다.** 5개정 ADR-004 가 4회, 4개정 ADR-072 가 1회 발화했고 1개정 ADR 들은 0~1회다. 발화가 나쁜 신호가 아니라 **사전 등록이 실제로 작동한 신호**다 — 004 의 4회는 전부 규정된 응답을 냈다.
- **「쓴 규칙」과 「돌려 본 규칙」의 간극이 남아 있다.** 8종 중 **완전 실행 검증은 4종**(017·070·071·073)뿐이다. 004 의 `maxTurns: 60` 은 적용 후 builder dispatch 가 0건이고, 072 의 amend-4 는 신설 당일이며, 047 의 7번째 필드는 1회 작성뿐이다. **Round 13 의 첫 과제는 새 규칙을 쓰는 것이 아니라 이 미검증분을 돌리는 것이다.**
- **실행이 처방을 두 번 고쳤다**(037). 규칙을 쓴 날 바로 돌려 보지 않으면 그 두 결함은 Round 13 까지 살아 있었을 것이다.

## Falsifying evaluation 항목별 결과 (P7-4)

> Phase 7 이 건드린 ADR·amendment 의 **사전 등록된 falsifier** 를 하나씩 판정한다. 「미측정」은 실패가 아니라 **아직 그 조건에 닿지 않았다**는 뜻이며, 다음 라운드의 과제 목록이기도 하다.

| ADR | falsifier | 결과 | 근거 |
|---|---|---|---|
| ADR-070 | (a) Reject 항목이 다음 stabilize 에 재등재되면 D3 실패 | **발화하지 않음(단, 규칙이 아니라 판단이 막았다)** | stabilize 2·3회차의 5-2 raw-hex 5건·5-2b voice 10건이 1회차와 동일하게 재발화했고 메인 세션이 `M1-imp-1`·`M1-imp-2`(rejected-fp)와 같은 사실임을 확인해 재등재하지 않았다. **재등재를 막는 규칙은 `[Pattern-spread]`(§1.0 3-1)에만 있다 — 발견 43.** D3 자체는 실패하지 않았으나 그 통과가 규칙이 아니라 메인 판단에 의존한다 |
| ADR-070 | (b) 재현 줄 없는 P0 가 `confirmed` 로 등재되면 D2 실패 | **발화하지 않음** | 본 라운드 등재 P0 6건(M1-001~005, M1-018) 전부 `- 재현:` 줄을 가졌고 그중 M1-018 은 반경 재감사 qa 가 실행한 재현을 그대로 옮겼다 |
| ADR-070 | (c) 반경 재감사가 잡지 못한 결함이 다음 stabilize 에서 새 P0 로 나오면 D4 반경 정의 재조정 | **발화하지 않음 — 오히려 반대 결과** | round 1 의 반경 재감사가 *그 라운드 수정이 만든* P0(M1-018)를 같은 라운드에서 잡았다(발견 41). 이후 stabilize 2·3회차에서 새 P0 등재 0건 |
| ADR-070 | (d) K 카운터가 stabilize 출력에 안 나오면 D5 배선 실패 | **발화하지 않음** | 회고 `## 8` 에 2회차 `7-T 수렴: round 2`, 3회차 `round 3 — 예산 소진`, 회귀 (g)에서 `round 4 — 브리프 억제` 가 각각 기록됐다 |
| ADR-071 | (a) registry 빈 행이 남은 채 bootstrap-stack 성공 종료 | **발화하지 않음** | Round 12 registry 요약: 확정 37 / 해당 없음 18 / 이관 5 / 미결정 0 / **빈 행 0** |
| ADR-071 | (b) 수행 0 복사 직전·직후 보호 경로 해시 불일치 | **발화하지 않음** | Round 12 루트 보호 경로 **201파일 해시 완전 동일**. 0-H(실행 시작·종료)도 변경 0건 |
| ADR-071 | (c) 스캐폴드 뒤 probe smoke 가 `SKIPPED (등록된 소스 루트 부재)` | **발화하지 않음** | Round 12 probe smoke 5회차 전부 기대대로 → `PASS (probe verified, project clean)`. 두 scope 각각 판정 |
| ADR-071 | (d) HYBRID 입력에서 백엔드 결정 라운드 미개설 | **미측정** | Round 12 는 monorepo KEEP-list 입력이라 HYBRID 분기를 타지 않았다. Round 11 에서 측정됨 |
| ADR-072 | (a) 승인 UI 재사용 task 에서 표현 파일 수정 시 `[Design-reuse-drift]` 미발화 | **부분 발화 — 사각지대 확인** | 표현(마크업·스타일·카피) 변경에는 정상 동작. 그러나 **행동만 바꾸면 원리상 침묵한다**(발견 40) — repair round 1·2 가 `TodoList.tsx` 클릭 핸들러를 바꿨는데 drift 가 발화하지 않았고, 그것이 규정상 맞는지도 문서에 없다 |
| ADR-072 | (b) 매니페스트 없이 plan-workitem 진행 시 D9 실패 | **발화하지 않음** | Round 12 `/plan-workitem M1` 이 매니페스트(3화면 18상태·26스냅샷)를 입력으로 받아 전 task 에 `- 승인 UI 재사용: <경로> (manifest: <id>)` line item 을 박았다 |
| ADR-072 | (c) 자가 검사가 known-bad 를 통과시키면 D6 실패 | **발화하지 않음** | Round 12 `--self-test` **4케이스 전부 PASS** — (a) known-bad 가 규칙별로 차단됐고 (d) Flutter known-bad fixture 도 실패가 관측됐다 |
| ADR-072 | (d) §3-V 가 스냅샷 없이 «판독» 보고 시 D7 실패 | **발화하지 않음** | Round 11 §3-V 가 실제 제품 렌더 + 승인 스냅샷 대조로 P0 3건을 냈고, 수용 라운드도 8항목 대조표를 남겼다 |
| ADR-072 | (e) Round 11 세션 분할 없이 화면 6개 완주 불가 시 D10 분할 기준 조정 | **미측정** | Round 11 은 화면 3개였다 |
| ADR-072#amend-1 | (a) `npm run validate:design -- --self-test` 가 4케이스로 돌지 않음 | **발화하지 않음** | Round 12(Flutter monorepo)에서 **4케이스 전부 실행·PASS**. 웹 전용 프로젝트에서 도달 불가였던 (d)가 여기서 처음 돌았다 |
| ADR-072#amend-1 | (b) tokens-only 가 Dart·TS 양쪽에서 실제 색 리터럴을 놓침 | **발화하지 않음 — 반대로 오탐이 나왔다** | Round 12 R6-3 `--tokens-only` 가 Dart 2건·TS 6건을 리포트했다. **놓친 것은 0건**이고 Dart 2건이 `Colors.transparent` 오탐(발견 60), TS 6건은 진짜 위반(레이아웃 토큰 부재 — 발견 61). 미탐이 아니라 과탐 쪽으로 치우친다 |
| ADR-072#amend-2 | (a) 3-S 를 돌렸는데 같은 계열 결함이 또 구현 후에 처음 잡힘 | **판정 보류 — 구현 후에 다시 본다** | Round 12 3-S 3축: (a) UI 지시 출처 위반 0 · (b) 계측 배선 불가 0 · (c) 증명 문장 14/14 기입. 세 축이 Round 11 의 실패(도달 불가 계측·미등록 UI·빈 FAC 매핑)를 계획 시점에 재발시키지 않았다. 이 falsifier 는 **구현 후에야 확정**되므로 9~10단계에서 다시 본다 |
| ADR-072#amend-2 | (b) `## 7-1` 증명 문장이 동어반복으로 나온다 | **부분 발화 — 14행 중 3행(21%)** | 순수 동어반복이 아니라 **반쪽 채움**이다: AC 조건(어려운 쪽)은 실제로 인용하고 FAC 의 요구를 「그대로」로 때웠다. 나머지 11행은 진짜 증명이었고 일부는 보강 논거까지 달았다. 같은 라운드 R3 의 브리프 「근거 4문항」은 **3건 전부** 동어반복이었다 — 차이는 형식이 빈칸을 둘로 명시했는가다. 처방: 두 슬롯 강제 + 금지 filler 명시(발견 67) |
| ADR-072#amend-3 | (a) wrapper 가 여전히 가시 요소를 주입했는데 R6 체크리스트가 통과시킴 | **발화하지 않음** | Round 12 R6-5 「하네스 요소 0」을 3화면에 실행했다. Flutter 위젯 테스트 wrapper 는 `MaterialApp`(테마·textScaler)만 두고 `AppBar`·제목을 두지 않았으며, 웹 스토리 데코레이터는 viewport global·zoom 만 둔다. 날짜 헤더(E1)를 **화면 위젯이 소유**하도록 코드 주석에 명시돼 있다 |
| ADR-072#amend-4 | (a) 상태 접미사가 R6 렌더 시간 2배 초과 / (b) 원장 행이 있는데도 승격 통과 / (c) 3안 이상 사례 | **미측정 (규칙 신설 당일)** | Round 13 대상. Round 12 는 이 규칙이 **없어서** 발견 62·63 이 났다 |
| ADR-037#amend-4 | (a) 제3 형식이 전체 FAC 의 30% 초과 / (b) 조건 (ii) 위반이 봉인에서 반복 검출 | **발화하지 않음 (첫 적용)** | Round 12 M1: FAC 14행 중 제3 형식 **1행(7%)**, PX 13행 중 **1행**. 조건 (ii) 위반 0건 — T-005 의 변경 파일에 `AdminHabits.tsx` 가 없다 |
| ADR-004#amend-7 | (a) `maxTurns: 60` 에서도 builder 보고 0건 상한 도달 1회 / (b) 중간 보고가 자의적 절반으로 매번 초반 | **(a) builder 미측정 · (b) 반대 방향으로 실패** | builder 는 amend-7 적용 후 dispatch 가 아직 없다. (b)는 「자의적 절반」이 아니라 **중간 보고가 0건**이다 — 관측 4/4(builder 2 + planner 2)에서 한 번도 나오지 않았다. planner 2건은 amend-7 문구를 본문·dispatch 양쪽에 받은 상태였다(발견 64 → amend-8) |
| ADR-004#amend-8 | (a) 결정 1~4 뒤에도 쓰기 에이전트가 보고 0건으로 상한 도달 1회 | **미측정 (규칙 신설 당일)** | Round 13 대상. 이 falsifier 가 ADR-047 D3 «예산 영향» 항목 채택의 **조건**이다 |
| ADR-073#amend-1 | (a) 1차 정적 검사가 «선언은 있는데 파일이 없다»를 통과 / (b) 2차 런타임 report 가 3라운드 연속 전부 오탐 | **(a) 신설 당일 발화** | `node_modules` 패키지 CSS 를 `@import` 했더니 그 파일의 상대 `url()` 을 번들러가 자산으로 잡지 않아 **선언도 파일도 실재하는데 빌드에 복사되지 않았다** — 1차 통과, 2차만 검출. 규정된 응답(파일 실재까지 확대)은 같은 결과였을 것이므로 대신 **「패키지 CSS `@import` 는 배선으로 치지 않는다」**로 좁혔다. **2단계 구조의 값이 여기서 증명됐다** — 정적 검사만 있었으면 놓쳤다. (b)는 미측정 |
| ADR-073 | 프로필 delta 가 §2~§10 전 절에 생기면 D3 재검토 | **발화하지 않음** | Round 12 DESIGN 의 delta 블록은 **§2·§3 에만 4개**(consumer-mobile·admin-web 각 2). §1·§4~§11 은 공통. 두 프로필이 실제로 갈린 것은 (a) 다크 모드 차단 방식 (b) 폰트 전달 방식뿐이었다 — D3 의 «공통+delta» 가정이 실측으로 지지된다 |
| ADR-073 | 폰트 블록 항목이 `(해당 없음)` 으로만 채워지면 D4 축소 | **발화하지 않음** | Round 12 §3 폰트 결정 블록에 후보 2조합·선택 근거·라이선스·전달 방식이 실제로 채워졌다(라이선스는 «사용자 확인 미완» 표기) |
| ADR-073 | `[Design-voice]` 오탐률이 리뷰 항목의 절반 초과 시 D6 렌즈 축소 | **발화함 — grep 분만. LLM 판정분은 정확했다** | Round 11 stabilize 5-2b voice grep 실측 **오탐 10/10**(전부 코드 식별자). 다만 이것은 `[Design-voice-grep]`(정규식)이고 reviewer 의 `[Design-voice]`(LLM 판정)는 오탐 0 이다. **Round 12 재관측에서 그 구분이 다시 확인됐다** — R3 브리프 비평의 `[Design-voice]` 는 실제 충돌 1건(사전 금지어 「할 일」)을 정확히 짚었고 오탐 0 이었다. 즉 **D6 렌즈를 축소할 근거가 아니라 grep 쪽을 좁힐 근거다**(발견 27). |
| ADR-004#amend-5 | `maxTurns: 45` 에서도 상한 중단이 2회 이상 반복 | **미측정** | Round 12 builder 재측정 미도달 |
| ADR-058#amend-4 | 갤러리 선택본 0건 반복 / R6 쇼케이스가 exit 2 로 굳음 / 자가 검사가 known-bad 통과 | **부분 — 하나는 발화** | 갤러리 라운드는 Round 12 에서 **생략**했다(세션 예산 — 정직 기록, DESIGN `## 11` 에 명시). R6 쇼케이스는 exit 2 로 굳지 않았다(두 프로필 blockers 0). 자가 검사는 known-bad 를 통과시키지 않았다(4케이스 PASS). **다만 R6 쇼케이스의 Flutter 스냅샷이 «생성되지 않는» 상태였고(발견 54) 생성된 뒤에도 글자가 전부 네모였다(발견 55)** — falsifier 문안이 «exit 2 로 굳음» 만 보므로 이 두 형태를 못 잡는다. **falsifier 자체가 좁다는 것이 이 라운드의 소득이다** |
| ADR-059#amend-1 | target 별 e2e 진입점이 device id 를 실행 시점에 해석하지 못함 | **발화하지 않음** | `scripts/e2e-target.mjs` 가 `flutter devices --machine` 으로 android·ios device 를 각각 해석해 실행했고, `package.json` 어디에도 `-d` 리터럴이 없다. 집계 `validate:e2e` 가 web PASS / android PASS / ios PASS 를 target 별로 냈다 |

### 부수 신호 — falsifier 문안 밖에서 관측된 것

- **ADR-072#amend-2 falsifier (b)(«증명 문장이 형식만 채운 동어반복»)의 실패 양식이 *다른 필드*에서 먼저 나타났다.** Round 12 R3 reviewer 가 `[Design-element-rationale]` P2 3건을 냈는데 전부 「없으면 무엇이 깨지는가」가 «화면이 성립하지 않는다» 류 동어반복이었다. 아직 `## 7-1` 증명 문장 단계(plan-workitem)에 도달하지 않았지만, **«필수 산문 칸이 동어반복으로 채워진다»는 실패 양식이 실재한다**는 것이 이 시점에 이미 확인된다. plan-workitem 단계에서 같은 양식이 나오는지가 amend-2 결정 4 의 실질 시험이다.
- **팬아웃 단위가 상한을 소진한 3건이 전부 ADR-004#amend-6 적용 *전*이었다.** amend-6 적용 후 dispatch 한 designer(브리프 3종)·reviewer(브리프 비평)는 둘 다 보고를 완료했다 — 다만 n=2 라 아직 신호다.


## Phase 7 총계 (P7-4 마감 — 2026-09-12)

| 항목 | 값 |
|---|---|
| 라운드 | Round 11(웹 — Next.js + Storybook) · Round 12(Flutter + Next.js monorepo) |
| 새 발견 | **45건** (33~77) — P0 6 / P1 22 / P2 15 / `관측` 2 (결함 아님 — 규정이 의도대로 작동한 사례와 방법론 한계 각 1) |
| 처분 | **수정 43 · 기록만 1 · 조치 불요 1 · 미정 0** |
| 개정된 ADR | 8종 / 신규 amendment **14건** (ADR-004 5 · ADR-072 4 · ADR-037 1 · ADR-047 1 · ADR-070 1 · ADR-071 1 · ADR-073 1) |
| falsifier 판정 | 30행 — 발화 **6건**(ADR-004 4 · ADR-072#amend-2 부분 1 · ADR-073#amend-1 1) / 미발화 15 / 미측정 9 |
| 졸업 | Round 11 M1 **NO**(수렴 실패 → option C) · Round 12 M1 **YES**(6/6, open P1 1건) |
| ADR-017 gate | Round 11 —(수렴 라운드) · Round 12 **3/3 통과** |

### 이 Phase 가 실제로 바꾼 것 — 한 문단

**규칙을 쓴 날 돌려 보는 것이 규칙을 잘 쓰는 것보다 중요했다.** Phase 7 이 만든 14개 amendment 중 **같은 날 실행이 고친 것이 4건**이고(ADR-037#amend-4 ×2 · ADR-073#amend-1 ×1 · ADR-005#amend-2 를 낳은 sync 사고 ×1), **리뷰가 고친 것은 0건**이다. 더 나아가 **falsifier 가 신설 당일 발화한 것이 2건**이다(ADR-004#amend-8 · ADR-073#amend-1) — 사전 등록이 실제로 작동한다는 뜻이면서, 동시에 **한 번도 돌려 보지 않은 규칙은 절반쯤 틀려 있다**는 뜻이다. 그래서 Round 13 의 첫 과제를 「새 규칙」이 아니라 **「미검증분 실행」**으로 두었다 — Phase 7 이 건드린 8종 중 완전 실행 검증은 4종뿐이다.

## Round 13 첫 과제 (P7-4 인계 — 2026-09-12 사용자 확정)

**Round 13 은 새 규칙을 쓰기 전에 아래 셋을 먼저 한다.** 셋 다 이번 라운드가 만들어 놓고 검증하지 못한 부채다.

### ① ADR-004 통합 재발행 (supersede)

- **근거**: 개정 **9개**로 ADR-045 D6 임계(8)를 넘었다. amend-4~9 가 전부 ADR-045 이후라 **grandfather 대상이 아니다** — 다음 변경은 amend 가 아니라 통합 재발행이어야 한다.
- **이번 라운드에 하지 않은 이유**: amend-8·9 가 **같은 날 falsifier 발화로 연쇄**해 정책이 아직 안정되지 않았다. 재발행은 amend-9 falsifier 가 판정된 뒤가 맞다.
- **재발행 본문에 반드시 담을 관측 (발견 74)**: **«에이전트 정의는 세션 시작 시점에 고정되며, 파일을 고쳐도 그 세션의 dispatch 에는 반영되지 않는다. 검증은 새 세션에서 한다.»** 이것은 amend-5 결정 4 가 「hot-reload 지연」으로 잘못 진단한 자리다 — 재발행본은 **지연이 아니라 미반영**으로 적고, 반영 확인 수단(본문 마커 한 줄 + 도구 0개 probe dispatch, 1.9초)을 함께 규정한다.

### ② 재측정 프로토콜 재설계 — 조건당 새 세션

- **설계**: 조건마다 (i) 에이전트 파일을 그 조건으로 편집·커밋 → (ii) **새 세션 시작** → (iii) 0-tool probe 로 반영 확인 → (iv) 격리 사본에 slice dispatch → (v) 반환·사후 검증 기록. `builder-a`~`builder-d` 변형 파일 방식(amend-5 결정 4)은 **같은 세션 안에서는 작동하지 않으므로 폐기**하거나 세션 분리와 함께 쓴다.
- **조건 표를 현재 기준값으로 갱신한다** — Round 11 의 축(20 vs 45 × 상속 vs medium)은 낡았다. 현재 canonical 은 **`maxTurns: 60` · `effort` 미지정(상속)** 이므로 새 표는 다음과 같다.

| 조건 | maxTurns | effort | 비고 |
|---|---:|---|---|
| (a) **현재 기준값** | **60** | — (상속) | Round 12 에서 **실측 1건 확보**(아래 절) |
| (b) effort만 | 60 | medium | 미측정 |
| (c) 턴만 낮춤 | 20 | — (상속) | 미측정 |
| (d) 둘 다 | 20 | medium | 미측정 |

- **n=2 의 의미**: Round 11 실측은 웹(Next.js) task, Round 12 는 Flutter 배선 task 다. 플랫폼·task 가 다르므로 **셀별 n=2 가 아니라 «같은 결론이 다른 스택에서도 서는가»** 를 본다. 그 한계를 결론 문장에 적는다.

### ③ amend-8·9 를 새 세션에서 검증

- 이 세션에서 에이전트 파일에 넣은 것은 **전부 미검증**이다(발견 74).
- **amend-8 결정 3** — 부분 보고 형식(「쓴 파일 목록 + 남은 것 1줄」): 상한에 닿은 dispatch 가 실제로 그 형식을 내는가.
- **amend-9 결정 1** — write-first(「새 입력을 더 열기 전에 주 산출물 파일이 디스크에 있어야 한다」): **에이전트 파일 경로로** 작동하는가. 이번 라운드에 작동을 확인한 것은 **dispatch 프롬프트** 경로뿐이다.
- **amend-9 결정 2** — `reviewer` `maxTurns: 24`: 적용 후 `/validate-plan M<N>` 이 회수 없이 완주하는가.
- 검증 순서는 ①의 재발행 **전**이 낫다 — 재발행본이 담을 결론이 이 검증에 달려 있다.

## Builder Effort Experiment (ADR-004#amend-4) — 측정일 2026-09-11

- task: **T-002-todo-screen-wiring** (승인 UI 2개 배선 + 도메인 연결 + 계측 이벤트 + 테스트 3건)
- 사본: dogfood-web `bb9645b`(T-001 커밋 완료, T-002·T-003 미포함)에서 뜬 격리 사본 4개. slice 프롬프트 본문은 **바이트 동일**(4,564B — 루트 경로 한 줄만 상이).
- **각 셀 n=1이다.** 아래 수치는 경향 신호이지 통계가 아니다.
- `effort`를 명시하지 않은 (a)·(c)는 **세션 effort를 물려받는다** — 본 측정 세션은 `xhigh`였다. 따라서 실제 비교축은 «xhigh vs medium»이다.

| 조건 | maxTurns | effort | 소요(ms) | tool_uses | subagent 토큰 | 완료 AC | validate | foreman 회수 턴 | Red 보고 |
|---|---:|---|---:|---:|---:|---|---|---:|---|
| (a) 현재 | 20 | — (xhigh 상속) | 132,522 | 17 | 42,761 | 3/3 | OK | 0 | **부분 누락** — `analytics.ts`는 «no-op으로 먼저 만든 뒤 관측을 생략하고 진행»했다고 스스로 보고 |
| (b) effort만 | 20 | medium | 338,873 | 23 (1차 **20에서 상한 중단** → 회수) | 62,019 | 3/3 | OK | **1** | 완전 — AC 3건 전부 실제 DOM 어설션 실패 인용 |
| (c) 턴만 | 45 | — (xhigh 상속) | 161,769 | 18 | 49,451 | 3/3 | OK | 0 | 완전 |
| (d) 둘 다 | 45 | medium | 309,489 | 22 | 76,199 | 3/3 | OK | 0 | 완전 |

### 판정

- **완료율·검증 실패는 4조건 모두 동일하다** — AC 3/3, `pnpm validate` 전 단계 통과, 승인 UI(`TodoAdd.tsx`) 바이트 무변경.
- **`effort: medium`은 느리고 비싸다.** medium 두 조건(b·d)의 소요는 338.9초·309.5초, 상속(xhigh) 두 조건(a·c)은 132.5초·161.8초로 **약 2배**다. 토큰도 62.0K·76.2K 대 42.8K·49.5K로 높다. «깊이보다 완주»라는 채택 근거(#amend-4 결정 2)와 반대 방향이다.
- **`maxTurns: 45`는 값싼 보험이다.** (a)는 17턴으로 20 안에 우연히 들어왔고 (b)는 정확히 20에서 잘려 회수 턴 1회를 썼다. 45는 필요 없을 때 비용이 0이고 필요할 때 foreman 왕복을 없앤다.
- **품질 편차는 effort·turn 축과 정렬되지 않았다.** 도달 불가능한 `todo_add_rejected` 분기를 (a)·(d)는 코드에 넣었고((d)만 리스크로 보고) (b)·(c)는 넣지 않고 사유를 보고했다. 네 조건이 2:2로 갈렸고 조건 축과 무관하다.

### Round 12 재측정 — **중단됨 (발견 74)**. 건진 것은 canonical 설정 실측 1건

ADR-004#amend-5 결정 4 가 규정한 n=2 재측정을 시작했으나 **조건 분리가 성립하지 않아 중단했다.** `.claude/agents/builder.md` 를 조건별로 편집해도 **그 세션의 dispatch 에 반영되지 않는다**(0-tool probe 로 확정 — 발견 74). 조건 (b)(c)(d)는 이 세션에서 측정 불가다.

**조건 (a) 로 띄운 dispatch 는 실제로는 세션 시작 시점의 canonical 정의(`maxTurns: 60` · `effort` 미지정 = 세션 effort 상속)로 돌았다.** 그 자격으로 기록한다 — **Flutter 배선 task 에서 canonical 설정의 첫 실측**이다.

| 항목 | 값 |
|---|---|
| task | **T-002-today-list-wiring** (승인 UI 배선 + 컨트롤러 신설 + 테스트 3건 + 매니페스트 1필드 = 산출물 4개) |
| 설정 | `maxTurns: 60` · effort 상속(세션 `xhigh`) |
| 소요 | 333,073 ms |
| tool_uses | 34 |
| subagent 토큰 | 74,935 |
| 완료 AC | **3/3** |
| 검증 | `flutter analyze` clean · `flutter test test/features/ test/shared/` **10/10** |
| 승인 UI | `today_list_screen.dart` **바이트 무변경** |
| 회수 턴 | **0** (상한 미도달) |
| Red 보고 | **완전** — AC 3건 각각 실제 어설션 실패를 인용(`expect(status, empty)` → 실제 `loading` 등). 「모듈 부재가 아니라 어설션 레벨 실패」임을 스스로 구분해 보고했다 |

**품질 관측 (조건 축과 무관하게 기록)**

- **범위 밖 조치를 먼저 보고했다** — `test/widget_test.dart` 를 지웠는데(스캐폴드 카운터 테스트가 삭제 대상 `MyApp` 을 참조해 `analyze` 가 깨진다) 「스코프 밖이지만 불가피한 부수 조치 + 그 이유」로 명시했다. Round 11 의 (a) 가 `analytics.ts` 를 「no-op 으로 먼저 만들고 관측을 생략」한 것과 대비된다.
- **단순성 self-check 를 자발적으로 수행**했다 — 도입한 `_lastLoadedDate` 필드가 실제로 안 쓰이는 것을 발견해 즉시 제거하고 보고했다.
- **AC 없는 구현을 AC 있는 것처럼 적지 않았다** — lifecycle 재조회·자정 경계는 AC-1~3 에 없어 전용 테스트가 없다는 사실을 리스크로 올렸다.

**Round 11 과의 비교는 하지 않는다** — 플랫폼(웹→Flutter)·task·모델 세션이 전부 달라 통제 비교가 아니다. n=2 는 **조건마다 세션을 새로 시작하는 방식**으로만 얻을 수 있다(발견 74 처방 ①).

### ADR-004#amend-4 결정 4 적용 — **규칙에 공백이 있다**

결정 4는 두 갈래만 규정한다: «(d)가 (a) 대비 저하 없이 **시간이 줄면** 확장 / **저하가 있으면** effort 제거». 관측된 결과는 **저하는 없는데 시간이 늘었다**는 제3의 경우이며 어느 갈래에도 해당하지 않는다. Mutation delta의 falsifier(«(d)에서 완료율·검증 실패가 (a)보다 나쁨») 도 문자 그대로는 발화하지 않았다.

- **조정 결과 (ADR-017 결정 5 / P7-4 «실패한 falsifier는 재검토 트리거에 따라 조정하고 그 조정도 기록한다»)**: 사용자 확인 후 **ADR-004 `## Amendment 5`** 로 박았다 — ① `builder` 의 `effort: medium` 제거, `maxTurns: 45` 유지 ② 결정 4에 **세 번째 갈래**(«완료율·검증 실패에 저하가 없어도 소요·토큰이 유의하게 늘면 그 `effort` 지정을 제거한다») 규정 ③ `effort` 를 validator·qa 로 확장하지 않음.
- **Round 12 재측정 (P7-3에 추가)**: 같은 실험을 Flutter 배선 task 로 1회 더 돌려 **n=2** 로 만든다. 그때는 `.claude/agents/builder.md` 를 반복 수정하지 않고 **`builder-a`~`builder-d` 변형 파일**로 돌린다(조건마다 canonical 파일을 고치면 매번 self-modification 승인이 필요하고 hot-reload 지연 때문에 «어느 정의가 실제로 쓰였는가»가 불확실해진다). 변형 파일은 **측정 전용이며 측정 후 삭제한다** — 상시 두면 `docs/00-meta/STRUCTURE.md` 의 sub-agent 로스터 13종과 어긋난다. 조건마다 **적용 확인 로그**(그 조건의 `maxTurns` 가 실제로 걸렸는지 보이는 관측)를 남긴다.
