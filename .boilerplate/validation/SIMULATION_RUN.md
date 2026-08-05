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

**결함 아님 1 — validation report의 gitignore (기각).** `M1-instr-7`은 "졸업 기준이 gitignore된 산출물에 의존한다"를 구조적 결함으로 등재했으나, `MILESTONE_TEMPLATE.md:32`가 이미 "이 판정은 stabilize 시점 report(ADR-014상 checkout-local ephemeral) 기준이며, ROADMAP Done은 *영속된 판정*의 파생이지 **fresh clone에서 재도출된 증거가 아니다**"로 명시하고, `WORKFLOW.md:27`이 "validate와 finalize는 **같은 checkout**에서 연속 실행해야 한다"를 못 박으며, `STRUCTURE.md:45`가 lifecycle을 `ephemeral`로 등재한다. **의도된 설계다.** 잔여 사항은 문구뿐 — 재검증 안내가 "stabilize 재실행"만 말하고 **각 task의 `/validate-workitem` 재실행이 선행돼야 report가 생긴다**는 점을 적지 않아, 새 체크아웃에서 ④ 미충족을 만난 사용자가 결함으로 오인한다(본 라운드가 그 실례).

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
