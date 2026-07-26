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

---

## Round 4 (2026-07-17, 2026-07 개선 라운드 적용 기록 — ADR-056 경험 계약 + ADR-057 플래닝 v2)

> 본 라운드는 신규 제품 시뮬레이션이 아닌 **보일러플레이트 자체 개선 적용 기록**(Round 3과 동형)이다. 2026-07 개선 라운드(Stage 0A~5, 신규 ADR-056·057 + amend 14건(12개 ADR))의 적용 완료 직후 정적 회귀 점검 + fresh-fork UI 마일스톤 시나리오의 새 lifecycle 관통을 `[가설]`로 기록한다(ADR-017 재실행 트리거 3종 — 새 ADR·lifecycle 변경·skill 큰 변경 — 전부 해당). fresh-fork 실측 및 Codex `$validate-milestone` 자동완성 실측은 IMPROVE-GUIDE item 11의 사용자 후속 항목으로 남는다. **⚠ 본 라운드는 ADR-017 gate 3지표(사용자 개입 ≤1 / placeholder 충원율 ≥80% / graduation pre-check 미통과 ≤2)를 측정하지 않는 *정적 적용 기록*이다 — 별도 fork 실행이 필요한 gate '통과'가 아니라 fresh-fork 실측 '예약'이다(Round 1/2 = 실측치 보유, Round 3·4 = 정적 기록·[가설]).**

### 적용 범위

| Stage | 핵심 변경 | 결과 |
|-------|----------|------|
| 2 — ADR-056 경험 계약 | plan-milestone R5 + plan-workitem 입구 계약/9-1/3-P + stabilize §3-V + DESIGN §10 Voice + builder/reviewer/템플릿 (+ADR-007#5·027#6) | 프로토타입 라운드 + 입구 계약(이중 잠금) + 스크린샷 게이트 + Voice 규칙서 배선 |
| 3 (커밋 1~3) — ADR-057 플래닝 v2 | bootstrap-project M1 seed 제거 / plan-milestone M1 포함 / plan-workitem 배치·refresh·seam self-check / implement Needs Plan Refresh / finalize 체크포인트 / stabilize --feature / FEATURE §7-2·ARCH §4-1 / reviewer·validate-plan 11차원 (+ADR-007 표·026#3·051#3) | 생성 통일 + 배치 2-tier + feature 체크포인트 + seam 계약 |
| 4 — ADR-000#amend-2 | ADR 작성 트리거 표 + [ADR-candidate] 회수(stabilize→plan R0) + ADR-053#amend-1 | 작성 주체·시점 SSOT + 후보 증발 차단 |
| 5 — 정합 검증 | grep sweep 기계 불일치 0; 리뷰서 의미 불일치 1건(trigger 표 ↔ plan-milestone) → sync 수정 | cross-surface 정합 확인 |

이번 라운드(Stage 0A~5) 신규: **ADR 2개(056·057 umbrella) + amend 14건(12개 ADR) + agent 1개(designer — Stage 1C, 73c21f7)**. skill 신설 0. 나머지 정책은 기존 ADR Amendment.

### 관통 시나리오 예측 — fresh-fork UI 마일스톤 (ADR-022 정합 라벨)

시나리오: UI 웹앱(할 일 관리), M1 = "홈 목록 + 상세" 화면. 실측은 다음 fresh fork에서 수행, 본 라운드는 코드 정적 분석 기반 `[가설]`.

1. **생성 통일** `[가설]`: `/bootstrap-project` → charter/ARCH/ADR-100까지만, **M1/F-001 seed 안 함**(ADR-057 결정 1). 종료 출력이 `/plan-milestone` 안내. `/plan-milestone`이 R0(첫 호출 — carry-over 없음)~R4로 M1 + feature 문서 생성.
2. **R5 프로토타입 라운드** `[가설]`: UI 확정(ADR-027#amend-3) → R5 발동. R5-1 화면 목록 → R5-2 designer 단발 sub-call 시안 2~3안(레이아웃/위계/인터랙션 축 divergence, DESIGN `:root` 토큰만) → R5-3 사용자 선택 → R5-4 못생긴 상태 5종 + 실카피(§10) + 인터랙션 캡션 → R5-5 승인본 `docs/20-system/prototypes/M1/home.html` **커밋** + feature `## 7`에 `프로토타입:` 참조 줄. DESIGN §10 부재 시 R5-4 전 기본값 신설 + 확인 1회.
3. **배치 분해 (2-tier)** `[가설]`: `/plan-workitem M1` → **입구 계약 통과**(승인 프로토타입 존재 — ADR-056 결정 3). 안정 tier(전 feature AC·의존성·§7-1 매핑·seam self-check 1회) 완성 + 가이드 tier는 첫 feature만 full `## 3`, 나머지 draft 마커. 3-P가 각 UI task `## 3`에 프로토타입 참조 line item authoring(Lock 2). seam 신호 미발화(단순 CRUD)면 §7-2 "(해당 없음)".
4. **draft 하드스탑** `[가설]`: 둘째 feature 구현 진입 시 `/implement-workitem`이 `## 3 상태: draft` 감지 → **`Needs Plan Refresh` 하드스탑**(ADR-057 결정 4) → `/plan-workitem F-002 --refresh`로 그 시점 코드 기준 재접지 + 마커 제거.
5. **feature 체크포인트** `[가설]`: feature 전 task done 시 `/finalize-workitem`이 FAC closure 요약 + 다음 단계 제안(ADR-057 결정 5).
6. **§3-V 경험 게이트** `[가설]`: `/stabilize-milestone M1` → 앱 기동 → 핵심 화면 Playwright 스크린샷 → `docs/40-validation/visual/M-1/` 갤러리 → Read 멀티모달로 **승인 프로토타입 `home.html` vs 실제 렌더 대조**. 불일치 시 `P1 [Experience-drift]` report-only + 갤러리 경로 출력(사용자 육안 확인). 환경 실패 시 blocked-on-env echo(silent skip 금지).
7. **Codex 관통** `[가설]`: Codex 세션에서 `$validate-milestone M1`(read-only 2nd opinion) 발견·실행 — wrapper GA. §3-V는 멀티모달 편차로 갤러리 생성 + 사용자 수동 대조 degrade.

### 회귀 점검 (Stage 5 정적 sweep 재현)

1. **로스터 정합** `[관측됨]`: `.claude/skills` 21 / `.claude/agents` 8(designer 포함) / `.agents/skills` 16 ↔ STRUCTURE·README·DELEGATION 일치. 21−16=5 자연어 정합. ✓
2. **Plan Quality 11 카운트** `[관측됨]`: reviewer.md·validate-plan·DELEGATION 3곳 일치, 잔여 "10" 7건 전부 amend-1 이력/전이 서술(ADR-027:98·114·ADR-038:52·100·README:34·ADR-057:12·32). ✓
3. **anchor 14종** `[관측됨]`: 신규 인용 amend anchor 14개 전부 정확히 1건 실재. ✓
4. **금지 참조·구체제 잔존 0** `[관측됨]`: ADR-058~061=0, `initial/초기 workitem·milestone·seed된 첫 feature`=0, M2+·`plan-workitem F-001` hit 전부 whitelist(제거-서술 ADR + CHECKLIST 단일예시). ✓
5. **0C sweep 완결** `[관측됨]`: `^context-pack:`=0(0C-8), `병렬 미지원/파리티`=0(0C-10), `Bash 없음 — e2e 충돌`=0(0C-9). ✓
6. **gitignore 정합** `[관측됨]`: `prototypes/*/_drafts/`·`visual/` ignore / `prototypes/M1/home.html` tracked(승인본 영속). ✓
7. **비의도 자동 차단 신규 0건** `[관측됨]`: **의도된 신규 hard-stop 2건은 설계** — 입구 계약 `Needs Experience Contract`(ADR-056 결정3) + draft `Needs Plan Refresh`(ADR-057 결정4)만 constraint(강). 그 외 seam/experience-drift/voice는 전부 report-only 또는 IMPROVEMENT_GUIDE 기록 — 비의도 차단 0. ✓
8. **git diff --check + Stage 5 sync** `[관측됨]`: 기계 grep 불일치 0. 단 *의미 수준* 불일치 1건(ADR-000#amend-2 트리거 표가 plan-milestone에 부여한 high-stakes ADR authoring 경로가 skill에 부재)은 정적 sweep이 못 잡아 리뷰서 발견 → plan-milestone R2 + ADR-000 Target sync 커밋 1건. **그 sync 커밋 + 본 dogfood 커밋 후 working tree clean.** ✓

### 성공 기준

- `[관측됨]` 정적 정합 8/8 PASS (로스터·카운트·anchor·잔존·0C·gitignore·차단강도·clean).
- `[가설]` 관통 시나리오 7단계 예측 PASS — fresh-fork 실측 후 `[관측됨]` 승격 예정.
- `[가설]` Codex `$validate-milestone` 발견 — item 11 (a) 사용자 자동완성 실측 대기.
- `[관측됨]` builder.md는 경험 좁힘 비대칭 1줄 외 EXECUTE 전용 정합 유지 / Codex wrapper delegate-only.

### 결정에 미친 영향

- ADR-056·057 Predicted improvement 항목은 현재 `[가설]` — fresh-fork 5종 중 UI 2종+ 실측 통과 시 `[관측됨]` 승격.
- **Falsifying evaluation 입력 수집 예정**(item 11 (b)): R5 프로토타입 라운드가 마일스톤당 계획 시간을 과도하게 늘리는지 / 배치 세션 컨텍스트 소진으로 부분 완료가 나는지 / seam 신호 소형 feature 과발동 / [Experience-drift] 재실행 불일치율.
- **미수행으로 남는 실측**(정적 기록이 대체 못 함): (a) 이 라운드 fresh-fork 관통 실측, (b) Round 3이 예고한 ADR-027#amend-1 #d16…#d20 fresh-fork 실측(여전히 미수행), (c) Codex 자동 팬아웃 여부 실측(→ Codex-parity 재프레이밍 별도 라운드).

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
6. **§3-V 경험 게이트** `[관측됨 — 핵심 수확]` — 앱 기동 + Playwright 6-상태 스크린샷(`visual/M1/`) + 멀티모달 대조 → **P1 [Experience-drift] 실제 검출**: 프로토타입 §2-e의 입력 sticky-pin 구성결정이 구현에 없음(`.stage padding:28vh` 고정, sticky 부재). per-task validate·unit·e2e 전부 green이었으나 경험 계약 drift는 §3-V만 잡음. **게이트가 plan→implement 갭을 설계대로 catch — ADR-056 가치 실증.** ✓✓
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

- **ADR-056 §3-V 경험 게이트** → `[관측됨]` 승격: 실 drift(sticky-pin) 검출로 가치 실증(정적 [가설]에서 승격). 다관점 fan-out(qa가 broken 커밋·design reviewer가 sticky-pin/대비 독립 검출)도 실효 확인.
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