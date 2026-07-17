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
- **여전히 미실측**: Codex 관통, bootstrap-design researcher/reviewer sub-call, **validate-workitem validator fan-out**(전 task inline), 위 (b)(c). 순수 fresh-session 실측은 별도 세션 필요(구조적 한계).
