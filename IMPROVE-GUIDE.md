# IMPROVE-GUIDE: DESIGN.md + ARCHITECTURE 7-1~7-4 cross-surface enforcement 보강

> 모드: How-to (수정 행동 지침)
> 적용 범위: boilerplate 본체 (fork 프로젝트는 본 가이드 적용 후 재fork 권장)
> 정책 근거: ADR-022 (Ratchet), ADR-027 (Interface decision allocation), ADR-005 (SSOT), ADR-019 (Context Packs), ADR-038 (Cross-LLM peer review)

---

## 0. 배경 — 왜 이 가이드가 필요한가

### 0-1. 진단 결과 (현황)

`/bootstrap-design` 이 `docs/20-system/DESIGN.md` 를 채우는 흐름, `/bootstrap-stack` 이 `docs/20-system/ARCHITECTURE_OVERVIEW.md` 의 `## 7-1`(API) / `## 7-2`(CLI) / `## 7-3`(백엔드) / `## 7-4`(프론트) sub-section 을 채우는 흐름은 정상 동작한다.

그러나 *채워진 SSOT 가 이후 워크플로우에서 의무 참조되는 surface 가 거의 비어 있다*. 실측 grep 기준:

| Surface | DESIGN.md 참조 | ARCH 7-1~7-4 참조 | 강도 |
|---------|---------------|------------------|------|
| `.claude/skills/plan-workitem/SKILL.md` | 없음 | 일반 read-list 만 (7-x sub-section 강제 X) | 0 |
| `.claude/skills/validate-plan/SKILL.md` | 없음 | `## 3-1` 만 [Plan-arch] | 1 / 8 |
| `.claude/skills/stabilize-milestone/SKILL.md` | 없음 | 비해당 7-x *잔존* 검사 + `## 3-1` 비어 있음 권장 | 1.5 / 4 |
| `.claude/skills/implement-workitem/SKILL.md` | 없음 (builder body 의 self-check 로 간접) | 동일 | 0 (간접만) |
| `.claude/skills/validate-workitem/SKILL.md` | 없음 (validator body 의 self-check 로 간접) | 동일 | 0 (간접만) |
| `.claude/agents/builder.md` self-check L43 | "토큰·컨벤션·Don'ts 위반?" 1 줄 | 동일 | enabling (약) |
| `.claude/agents/validator.md` L44 | "R3 인벤토리 등록 + 상태 매트릭스 충족?" 1 줄 | 동일 | constraint (강) — 그러나 *등록 절차 부재* |
| `.claude/agents/reviewer.md` Plan Quality 8 차원 | 없음 | `[Plan-arch]` 1 차원 (3-1 만) | 1 / 8 |
| `docs/30-workitems/_templates/*TEMPLATE.md` | link 자리 없음 | link 자리 없음 | 0 |

### 0-2. 실제 영향

- 프론트 task 분해 시 컴포넌트 인벤토리 (R3) / 토큰 (R2) / Don'ts (R4) 참조 의무 부재 → 새 컴포넌트 즉흥 박힘, raw hex code AC, 중복 컴포넌트 생산
- API task 분해 시 envelope/error 컨벤션 (7-1) 참조 의무 부재 → endpoint 별 응답 형식 drift
- 마일스톤 종료 시점 디자인·인터페이스 drift 가 자동 회수되지 않음 → 부채 축적
- validator.md 가 "R3 등록" 을 묻지만 등록 절차 자체가 없음 → 자기 모순 (검증 불가능한 질문)

### 0-3. 본 가이드의 목표 + 책임 모델

**핵심 책임 모델 — THINK / EXECUTE / CHECK 분리**:

| 단계 | 역할 | DESIGN.md + ARCH 7-x 와의 관계 |
|------|------|------------------------------|
| plan-workitem | **THINK** | DESIGN.md + ARCH 7-x 를 *읽고 결정을 task 문서에 박는다* (구현 항목 / AC / 관련 문서 link / 신규 요소 등록 line item). 시각·인터페이스 *사고* 의 단일 장소. |
| validate-plan (opt-in) | **CHECK (plan)** | plan 산출물의 디자인·인터페이스 정합을 peer review ([Plan-design] / [Plan-arch-iface]). |
| implement-workitem / builder | **EXECUTE** | task 문서가 *시킨 대로만* 구현. task 가 링크한 DESIGN.md/ARCH 섹션을 읽는 것은 *충실한 실행* 을 위함 — *독립적 디자인 판단·cross-check 안 함*. (builder = minimal executor 정합) |
| validate-workitem / validator | **CHECK (impl)** | 구현이 DESIGN.md/ARCH 위반했는지 + plan 이 박은 등록 line item 이 실행됐는지 점검. report-only. |
| stabilize-milestone | **CHECK (aggregate)** | 마일스톤 누적 drift 점검. |

**왜 implement 는 design-aware 하지 않아도 되는가**: plan 이 결정을 task 문서에 박으면 (THINK), builder 는 그걸 충실히 실행하면 된다 (EXECUTE). builder 가 즉흥 결정을 내릴 여지 자체가 *plan 이 잘 박았다면* 작다. 잔여 위반은 validate-workitem 이 잡는다 (CHECK). builder 에 독립 디자인 cross-check 를 박으면 (a) minimal executor 모델 위반, (b) ADR-019 context 부담 증가, (c) ADR-022 *가설적 예방 과잉 제약* 위반. 따라서 **DESIGN.md/ARCH 의무 참조 surface = plan-workitem + validate-plan + validate-workitem + stabilize-milestone 4종. implement-workitem 은 제외** (task-linked 섹션의 *충실한 읽기* 만, 신규 cross-check 0).

> 단, builder.md 기존 L43 self-check ("인터페이스 요소가 SSOT Don'ts 위반?") 는 *pre-existing 가벼운 enabling 가드* 라 그대로 둔다 (본 가이드가 추가하는 게 아님 — 제거도 본 가이드 scope 밖).
>
> **L43 이 EXECUTE 모델을 깨지 않는 이유**: L43 은 builder 의 *"단순성 self-check (구현 출력 직전 점검)"* 목록의 한 줄이며, 이 목록의 모든 항목과 동일하게 **report-only** 다 — builder 가 *자신의 구현이 SSOT 와 어긋났는지 자기 인지* 해 출력의 "남은 정리 항목" 에 *보고만* 하고, 독립 디자인 결정·수정·재설계·자동 차단은 하지 않는다. 즉 *drift 자기 인지 (report)* 이지 *신규 디자인 판단 (decide)* 이 아니므로 EXECUTE 와 정합. "완전 자아 없는 implement" 의 엄격 해석에서도 *보고만 하는 self-awareness* 는 허용된다 (validator 의 CHECK 와 중복이지만 무해한 cheap 가드).

### 0-4. ADR-022 강도 정책 정합

- **새로 박을 정책 분류**
  - constraint (강): `[Plan-design]` / `[Plan-arch-iface]` Plan Quality 차원 추가 — 외부 실증(ADR-027 의 prg.sh / Brad Frost 외부 자료) 충족
  - constraint (강): stabilize deterministic preflight 의 raw hex / 컴포넌트 인벤토리 drift / 7-x Don'ts grep — 외부 실증(designproject.io 의 Don'ts 가 LLM 정확도 단일 최대 기여) 충족
  - enabling (약): plan-workitem read-list 추가 / TASK_TEMPLATE 의 design·arch link 자리 / plan 의 신규 요소 등록 line-item authoring
- **enabling 항목** 은 [가설] 라벨로 박아도 정책 위반 아님 (ADR-022 표 정합)
- builder pre-write grep 은 enabling 목록에서 제외한다 — implement 는 EXECUTE 전용 (§0-3 책임 모델). 중복 탐지는 plan (§4-2) + validate-workitem (validator) 책임.

---

## 1. 수정 권장 순서 (의존성 그래프)

```
Phase 1 (ADR amend, SSOT 박기)
   ↓
Phase 2 (템플릿 자리 만들기)  ← plan-workitem 이 채울 자리 필요
   ↓
Phase 3 (plan-workitem 강화)
   ↓
Phase 4 (validate-plan + reviewer Plan Quality 차원)
   ↓
Phase 5 (stabilize-milestone deterministic preflight)
   ↓
Phase 6 (implement-workitem 최소 보강 — EXECUTE 전용, builder.md 변경 없음)
   ↓
Phase 7 (validate-workitem + validator 등록 절차)
   ↓
Phase 8 (cross-surface 정합 sync — STRUCTURE.md / AGENTS.md / Codex wrapper 검증)
   ↓
Phase 9 (검증 + 시뮬레이션 + 회귀 점검)
```

**근거**: 정책 SSOT (ADR) 가 먼저 박혀야 다른 surface 가 인용 가능. 템플릿이 먼저 채워야 plan 이 채울 자리가 있음. plan 의 출력이 채워져야 validate-plan / stabilize 가 점검 가능.

---

## 2. Phase 1 — ADR amend (정책 SSOT)

### 2-1. `docs/90-decisions/boilerplate/ADR-027-interface-decision-allocation.md` 에 Amendment 1 추가

**위치**: 파일 끝 "## 참고" 단락 직전.

**추가 내용 (그대로 복사)**:

```markdown
## Amendment 1 — Cross-surface enforcement 보강

### 배경
- 본 ADR 마이그레이션 항목 9 ("builder / validator self-check 각 1줄 추가") 만 박았으나, 실측 결과 *예방 surface (plan-workitem) / 회수 surface (stabilize-milestone) / peer review surface (validate-plan)* 에 DESIGN.md / ARCH 7-1~7-4 cross-reference 가 부재.
- 결과: 채워진 SSOT 가 *fork 사용자 보호 역할*을 수행하지 못함 (단순 self-check 1줄만으로는 LLM 미스 확률 큼 + deterministic 보장 X).

### 결정 (5 추가)
16. `/plan-workitem` 의 *반드시 먼저 읽을 파일* 에 `docs/20-system/DESIGN.md` (UI 프로젝트 한정) + ARCH 의 `## 7-1` / `## 7-2` / `## 7-3` / `## 7-4` (해당 스택 한정) 명시.
17. `/plan-workitem` 의 *정합성 self-check* 에 "프론트 task 가 DESIGN.md `## 7. Components` 인벤토리 외 컴포넌트를 신설하는가? raw hex code 가 AC 본문에 박혔는가? API task 가 7-1 envelope/error 컨벤션 외 응답 형식을 박는가?" 추가.
18. `/validate-plan` Plan Quality 차원 8개 → **10개로 확장**: `[Plan-design]` (UI 프로젝트 한정) + `[Plan-arch-iface]` (API/CLI/백엔드/프론트 컨벤션, 해당 스택 한정).
19. `/stabilize-milestone` deterministic preflight 5번째 항목 추가 — UI 프로젝트: raw hex grep + 컴포넌트 인벤토리 drift + DESIGN.md draft 잔존 검사. API/CLI/백엔드/프론트 스택: 7-x Don'ts 위반 grep.
20. `docs/30-workitems/_templates/TASK_TEMPLATE.md` `## 7. 관련 문서` + `FEATURE_TEMPLATE.md` `## 11. 관련 문서` 에 `Design:` (UI 한정) + `Architecture-Iface:` (해당 스택 한정) 자리 신설.

### 마이그레이션 (결정별 적용 위치)
- 결정 16 → `.claude/skills/plan-workitem/SKILL.md` (필수 read-list + self-check 항목)
- 결정 17 → 위와 동일 파일
- 결정 18 → `.claude/skills/validate-plan/SKILL.md` + `.claude/agents/reviewer.md` Plan Quality 8 → 10 차원
- 결정 19 → `.claude/skills/stabilize-milestone/SKILL.md` `### 1.0` deterministic preflight
- 결정 20 → 2개 템플릿 파일

### Ratchet 강도 (ADR-022 정합)
- 결정 16, 17, 20 → enabling (약, [가설] 라벨 허용)
- 결정 18, 19 → constraint (강, [외부실증] 라벨 — ADR-027 본 ADR 의 외부 근거 5종이 충족)

### 후속 작업
- ADR-017 시뮬레이션 Round 3 — Amendment 1 적용 후 LLM 시각·인터페이스 일관성 delta 측정.
- Amendment 1 적용 후 `.boilerplate/validation/SIMULATION_RUN.md` 에 실측 라운드 추가.
```

### 2-2. ADR-038 본문의 "Plan Quality 8 차원" sync

**배경**: `docs/90-decisions/boilerplate/ADR-038-cross-llm-plan-validation.md` 본문에 `Plan Quality 8 차원` 표현이 2 곳 박혀 있다 (실측: L43, L89). Phase 4 에서 reviewer.md / validate-plan SKILL 만 `10 차원` 으로 바뀌면 ADR-005 SSOT drift 발생.

**행동**:
1. `docs/90-decisions/boilerplate/ADR-038-cross-llm-plan-validation.md` 본문에서 `grep -n "Plan Quality 8"` 으로 모든 표현 위치 회수.
2. 각 위치에서 `8 차원` → `10 차원 (ADR-027 amend 1)` 으로 변경.
3. ADR-038 파일 끝 (또는 본문 적정 위치) 에 다음 Amendment 단락 추가:

```markdown
## Amendment 1 — Plan Quality 차원 8 → 10 (ADR-027 amend 1 양립)

ADR-027 amend 1 결정 18 에 의해 Plan Quality 차원이 8 → 10 으로 확장됨. 추가 2 차원:
- `[Plan-design]` (UI 프로젝트 한정 — DESIGN.md 부재 시 skip)
- `[Plan-arch-iface]` (해당 스택 한정 — ARCH 7-x sub-section 부재 시 skip)

본 Amendment 는 *번호 확장 + 인용 sync* 만 책임. 차원 본문 정의는 ADR-027 amend 1 + reviewer.md `Plan Quality 10 차원` 단락 SSOT.
```

### 2-3. `docs/90-decisions/boilerplate/README.md` ADR 인덱스 표 갱신

**위치**: ADR-027 행.

**변경 전**:
```
| 027 | 인터페이스 결정 책임 분배 | accepted | — | DESIGN.md(UI) + ARCHITECTURE 7-1~7-4(API/CLI/백엔드/프론트) + /bootstrap-design 신설 |
```

**변경 후 (Amendments 컬럼만 수정)**:
```
| 027 | 인터페이스 결정 책임 분배 | accepted | (+amend1: cross-surface enforcement 보강 — plan/validate-plan/stabilize/templates) | DESIGN.md(UI) + ARCHITECTURE 7-1~7-4(API/CLI/백엔드/프론트) + /bootstrap-design 신설 |
```

ADR-038 행도 동일 방식으로 amend 1 추가:

**변경 전**:
```
| 038 | Cross-LLM Plan Validation + Parallel Waves | accepted | — | opt-in peer review (다른 세션·다른 LLM) — /validate-plan + /repair-plan 신설 + wave 그룹 echo + worktree 권장 |
```

**변경 후**:
```
| 038 | Cross-LLM Plan Validation + Parallel Waves | accepted | (+amend1: Plan Quality 8 → 10 차원 — ADR-027 amend 1 양립) | opt-in peer review (다른 세션·다른 LLM) — /validate-plan + /repair-plan 신설 + wave 그룹 echo + worktree 권장 |
```

### 2-4. Phase 1 종료 검증

- `docs/90-decisions/boilerplate/ADR-027-interface-decision-allocation.md` 파일 끝에 `## Amendment 1` 단락 존재
- `docs/90-decisions/boilerplate/ADR-038-cross-llm-plan-validation.md` 본문의 `Plan Quality 8` 모든 출현이 `Plan Quality 10` 으로 갱신 + `## Amendment 1` 단락 존재
- `docs/90-decisions/boilerplate/README.md` 의 ADR-027 행 + ADR-038 행 Amendments 컬럼이 각각 갱신
- 세 파일 git diff 만 발생, 다른 파일 변경 없음

**커밋 메시지**: `docs(adr): add ADR-027/ADR-038 amend 1 for cross-surface DESIGN/ARCH enforcement`
> ADR-027 amend 1 / ADR-038 amend 1 / README 세 파일을 한 커밋에 묶는다 — ADR-027 결정 18 (Plan Quality 8→10) 과 ADR-038 sync 가 동일 의미 변경이라 분리 시 중간 상태에서 reviewer.md ↔ ADR-038 ↔ STRUCTURE.md drift 발생.

---

## 3. Phase 2 — 템플릿 자리 만들기

### 3-1. `docs/30-workitems/_templates/TASK_TEMPLATE.md` 갱신

**위치**: `## 7. 관련 문서` 단락 (현재 L45~L49).

**변경 전**:
```markdown
## 7. 관련 문서
- Milestone: <!-- 예: [M1-foundation](../milestones/M1-foundation.md) -->
- Feature: <!-- 예: [F-001-core-value](../features/F-001-core-value.md) -->
- Architecture: <!-- 예: [ARCHITECTURE_OVERVIEW](../../20-system/ARCHITECTURE_OVERVIEW.md) -->
- ADR: <!-- 예: [ADR-007-workitem-lifecycle](../../90-decisions/boilerplate/ADR-007-workitem-lifecycle.md) -->
```

**변경 후**:
```markdown
## 7. 관련 문서
- Milestone: <!-- 예: [M1-foundation](../milestones/M1-foundation.md) -->
- Feature: <!-- 예: [F-001-core-value](../features/F-001-core-value.md) -->
- Architecture: <!-- 예: [ARCHITECTURE_OVERVIEW](../../20-system/ARCHITECTURE_OVERVIEW.md) -->
- Architecture-Iface: <!-- 해당 스택 한정. 예: [ARCH ## 7-1 API](../../20-system/ARCHITECTURE_OVERVIEW.md#7-1-api-컨벤션) / [## 7-4 프론트](../../20-system/ARCHITECTURE_OVERVIEW.md#7-4-프론트-결정). 비해당 스택은 줄 자체 삭제 (placeholder 잔존 X). -->
- Design: <!-- UI 프로젝트 한정. 예: [DESIGN ## 7 Components](../../20-system/DESIGN.md#7-components) / [## 2 Colors](../../20-system/DESIGN.md#2-colors). 비-UI 프로젝트는 줄 자체 삭제. -->
- ADR: <!-- 예: [ADR-007-workitem-lifecycle](../../90-decisions/boilerplate/ADR-007-workitem-lifecycle.md) -->
```

### 3-2. `docs/30-workitems/_templates/FEATURE_TEMPLATE.md` 갱신

**위치**: `## 11. 관련 문서` 단락 (현재 L43~L47).

**변경 전**:
```markdown
## 11. 관련 문서
- Milestone: <!-- 예: [M1-foundation](../milestones/M1-foundation.md) -->
- Charter: <!-- 예: [PROJECT_CHARTER](../../10-charter/PROJECT_CHARTER.md) -->
- Architecture: <!-- 예: [ARCHITECTURE_OVERVIEW](../../20-system/ARCHITECTURE_OVERVIEW.md) -->
- ADR: <!-- 예: [ADR-007-workitem-lifecycle](../../90-decisions/boilerplate/ADR-007-workitem-lifecycle.md) -->
```

**변경 후**:
```markdown
## 11. 관련 문서
- Milestone: <!-- 예: [M1-foundation](../milestones/M1-foundation.md) -->
- Charter: <!-- 예: [PROJECT_CHARTER](../../10-charter/PROJECT_CHARTER.md) -->
- Architecture: <!-- 예: [ARCHITECTURE_OVERVIEW](../../20-system/ARCHITECTURE_OVERVIEW.md) -->
- Architecture-Iface: <!-- 해당 스택 한정. 예: [## 7-1 API](../../20-system/ARCHITECTURE_OVERVIEW.md#7-1-api-컨벤션). 비해당 스택은 줄 삭제. -->
- Design: <!-- UI 프로젝트 한정. 예: [DESIGN ## 7 Components](../../20-system/DESIGN.md#7-components). 비-UI 프로젝트는 줄 삭제. -->
- ADR: <!-- 예: [ADR-007-workitem-lifecycle](../../90-decisions/boilerplate/ADR-007-workitem-lifecycle.md) -->
```

### 3-3. Phase 2 종료 검증

- 두 템플릿에 `Architecture-Iface:` / `Design:` 자리 추가
- 주석에 *비해당 스택은 줄 삭제* 명시 (placeholder 잔존 → drift 회피)
- 다른 섹션은 건드리지 않음 (Surgical Changes — ADR-006)

**커밋 메시지**: `docs(templates): add Design and Architecture-Iface link slots to task/feature templates`

---

## 4. Phase 3 — plan-workitem 강화

### 4-1. `.claude/skills/plan-workitem/SKILL.md` 의 *반드시 먼저 읽을 파일* 단락 갱신 (L17~L22)

**변경 전**:
```markdown
반드시 먼저 읽을 파일:
- `docs/10-charter/PROJECT_CHARTER.md`
- `docs/20-system/ARCHITECTURE_OVERVIEW.md`
- 입력 ID에 해당하는 상위 workitem 문서(있으면)
- `docs/30-workitems/_templates/MILESTONE_TEMPLATE.md`, `FEATURE_TEMPLATE.md`, `TASK_TEMPLATE.md`
```

**변경 후**:
```markdown
반드시 먼저 읽을 파일:
- `docs/10-charter/PROJECT_CHARTER.md`
- `docs/20-system/ARCHITECTURE_OVERVIEW.md` — *해당 스택 한정 sub-section 만*: `## 7-1` (API 프로젝트), `## 7-2` (CLI), `## 7-3` (백엔드), `## 7-4` (프론트). 비해당 sub-section 은 회수 X (ADR-019 minimal 정합).
- `docs/20-system/DESIGN.md` — *UI 프로젝트 한정*. **UI 판정은 다중 신호 우선순위 (baseline placeholder 존재 회피)**:
  1. DESIGN.md 부재 → 비-UI 확정 (fork 직후 삭제 권장 따른 경우, ADR-027 결정 #1·#15 정합) → DESIGN read skip + skip 사유 echo.
  2. DESIGN.md 존재 + `## 0. Status` ≠ `draft` (예: `accepted` / `living`) → UI 확정 → 본문 회수 + cross-check 활성.
  3. DESIGN.md 존재 + `## 0. Status` == `draft` → *추가 신호* 점검:
     - ARCH `## 7-4. 프론트 결정` sub-section 활성 (본문 비어 있지 않음)
     - 입력 workitem 산하 task 중 `## 7. 관련 문서` 에 `Design:` link 또는 본문에 UI 키워드 (`component`, `컴포넌트`, `page`, `페이지`, `screen`, `view`, `UI`, `frontend`, `프론트`) 등장
     - 위 신호 *1개 이상* 발견 → *UI 의심* → warning 1줄 echo (`DESIGN.md status=draft + UI 신호 감지 — /bootstrap-design 미실행 의심. plan 진행은 허용하지만 시각 결정이 즉흥적이 됨`) + 본문 회수 + cross-check 활성.
     - 신호 0개 → silent skip (false UI 판정 회피).
- 입력 ID에 해당하는 상위 workitem 문서(있으면)
- `docs/30-workitems/_templates/MILESTONE_TEMPLATE.md`, `FEATURE_TEMPLATE.md`, `TASK_TEMPLATE.md`
```

### 4-2. `정합성 self-check` 단락 확장 (L128~L130)

**변경 전**:
```markdown
## 정합성 self-check (분해 직후 1회 실행, ADR-026 amend 1)
- charter `## 5. 비목표` 단락 키워드와 분해된 feature/task를 매칭. 위반 의심 시 출력의 "남은 미결정 사항"에 명시.
- feature 범위가 상위 milestone `## 3. 포함되는 기능`에 매핑되는지 확인. 매핑 실패 시 동일 위치에 명시.
```

**변경 후**:
```markdown
## 정합성 self-check (분해 직후 1회 실행, ADR-026 amend 1 + ADR-027 amend 1)
- charter `## 5. 비목표` 단락 키워드와 분해된 feature/task를 매칭. 위반 의심 시 출력의 "남은 미결정 사항"에 명시.
- feature 범위가 상위 milestone `## 3. 포함되는 기능`에 매핑되는지 확인. 매핑 실패 시 동일 위치에 명시.

### Task type prefilter (context bloat 회피 — 본 prefilter 결과로 아래 cross-check sub-항목 적용 여부 결정)

각 분해된 task 본문 (`## 2. 작업 범위` + `## 3. 구현 항목`) 에서 다음 키워드 매칭으로 task type 자동 분류 — 일치 시만 해당 cross-check 활성. 매칭 안 되면 본 task 의 UI/ARCH cross-check 모두 skip.

- **UI task 신호**: `component`, `컴포넌트`, `page`, `페이지`, `screen`, `view`, `route` (라우팅 결정 시 7-4 도 함께), `UI`, `frontend`, `프론트`, `style`, `theme`, JSX/TSX 파일 path
- **API task 신호**: `endpoint`, `API`, `route`, `handler`, `controller`, `OpenAPI`, `REST`, `GraphQL`, `7-1`
- **CLI task 신호**: `command`, `CLI`, `argv`, `subcommand`, `flag`, `7-2`
- **백엔드 task 신호**: `migration`, `schema`, `auth`, `인증`, `transaction`, `트랜잭션`, `cache`, `queue`, `worker`, `7-3`

> Prefilter 한계 명시: 본 키워드 매칭은 *best-effort*. false positive/negative 가능 — prefilter 가 놓친 task 는 **validate-workitem (validator) 의 CHECK 단계가 catch** (2-layer defense — plan prefilter 가 1차, validator 가 2차). *implement/builder 가 catch 하지 않는다* — implement 는 EXECUTE 전용 (§0-3 정합).

### UI 프로젝트 + UI task 한정 — DESIGN.md cross-check
(DESIGN.md 부재 또는 본 task 가 UI 신호 미매칭 시 본 단락 skip + skip 사유 echo):
- 분해된 task 가 *새 컴포넌트* 를 신설하는가? 중복/재사용 검사는 **두 출처 모두** 대조 (인벤토리 stale 대비 — planner 는 Grep 권한 보유):
  - (a) DESIGN.md `## 7. Components` 인벤토리 (설계 레지스트리)
  - (b) 실제 `src/components/` · `app/components/` · `components/` 디렉터리의 기존 컴포넌트 파일명 (코드 실측 — DESIGN.md 미등록 컴포넌트도 포착)
  - 둘 중 *어느 쪽이라도* 기능 유사 컴포넌트 발견 시 "남은 미결정 사항" 에 `- 컴포넌트 중복 의심: T-NNN 의 X ↔ <DESIGN.md ## 7 의 Y / src/components/Z.tsx>. 재사용 검토 권장` 명시. (b) 에만 있고 (a) 에 없으면 *인벤토리 stale* → `+ DESIGN.md ## 7 등록 보강` 도 권장.
- AC 본문 또는 task `## 3. 구현 항목` 본문에 raw hex 색 코드 (`#[0-9A-Fa-f]{3,6}` 패턴) 가 직접 박혀 있는가? 발견 시 "남은 미결정 사항" 에 `- raw hex 검출: T-NNN AC-N — DESIGN.md ## 2 의 token 으로 교체 권장` 명시.
- **8 상태 매트릭스 점검은 *task 의 use-case 해당 상태* 한정** (DESIGN.md `## 7` 의 *전체* 8 상태 설계는 별도 — reviewer Design Consistency `[Design-state]` 책임). 본 self-check 는 *task 본문이 명시한 상호작용* (예: hover/disabled 가 use-case 에 등장하는데 AC 에서 언급 누락) 만 점검. 누락 상태가 있으면 "남은 미결정 사항" 에 `- use-case 상태 누락: T-NNN — <상태> 가 task 본문에 등장하지만 AC 미언급` 명시. 자동 차단 X.

### API/CLI/백엔드/프론트 스택 + 해당 type task 한정 — ARCH 7-x cross-check
(해당 sub-section 부재 또는 본 task 가 해당 type 신호 미매칭 시 본 단락 skip):
- API task: `## 7-1` envelope/error 컨벤션 외 응답 형식을 박는가? 분해된 task `## 3. 구현 항목` 본문에 envelope 형식 (예: `{ data, error, meta }`) 외 형식 키워드 (`status: ok`, `result:` 등) 등장 시 명시.
- CLI task: `## 7-2` 출력 포맷 컨벤션 외 형식을 박는가? `## 3` 본문에 명시된 출력 형식이 7-2 의 text/JSON/table 모드 외 형식인지 점검.
- 백엔드 task: `## 7-3` 결정 (DB migration / 인증 / 트랜잭션 / Idempotency / Rate limit / Async / Caching / API versioning) 과 어긋나는 새 결정을 즉흥 도입하는가? 도입 시 명시.
- 프론트 task: `## 7-4` 결정 (라우팅 / 상태관리 / SSR-CSR / i18n / SEO / 인증 / 폼 validation) 과 어긋나는 새 결정을 즉흥 도입하는가? 도입 시 명시.

### 신규 인터페이스 요소 → task `## 3. 구현 항목` 에 *등록 line item* authoring (builder 가 독립 판단 없이 실행하도록)

위 cross-check 에서 *정당한 신규 요소* (중복 아닌 새 컴포넌트 / 신규 endpoint / 신규 error code / 신규 출력 모드) 가 필요하다고 판단되면, 해당 task `## 3. 구현 항목` 에 **등록 step 을 명시적 line item 으로 박는다**:
- 예: `- 신규 IconButton 컴포넌트 생성 + DESIGN.md ## 7. Components 에 한 줄 등록 (8 상태 매트릭스 설계 포함)`
- 예: `- 신규 error code USER_LOCKED 도입 + ARCH ## 7-1 error 레지스트리 등록`
- 예: `- 신규 CLI 출력 모드 --json 추가 + ARCH ## 7-2 출력 포맷 등록`

이로써 등록 *결정* 은 plan 이 authoring 하고, builder 는 task 스펙을 *기계적으로 실행* — 등록 책임이 executor 의 독립 판단에 박히지 않는다 (§0-3 책임 모델 / ADR-005 정합). validator 는 본 line item 이 실행됐는지 점검 (Phase 7 §8-1).

**진짜 새 *primitive*** (Button/Input/Card 외 기반 컴포넌트) 는 task line item 이 아니라 architect 또는 `/bootstrap-design` 라운드 권장 (§4-3 architect 호출 신호 #6 정합) — plan 은 그 권장만 출력.

**모두 자동 차단 X — *권장 텍스트만* 출력** (ADR-007 책임 경계 정합).
```

### 4-3. `## architect 호출 권장 신호` 단락 확장 (L132~L137)

**변경 전**:
```markdown
## architect 호출 권장 신호 (감지 시 텍스트 제안만, 자동 호출 금지 — ADR-007)
다음 4 신호 중 하나라도 감지되면 출력 마지막에 `architect 호출 권장: <이유>` 1줄 추가:
1. 새 모듈 디렉터리 생성 (`src/<new>/` 또는 동등 경로).
2. charter `## 7. 제약 조건`에 없는 새 외부 의존 (npm/pip/cargo) 추가.
3. ARCHITECTURE_OVERVIEW.md `## 3-1. 레이어 경계` 변경.
4. "패턴 변경" / "새 boundary" / "도메인 경계" 키워드 등장.
```

**변경 후**:
```markdown
## architect 호출 권장 신호 (감지 시 텍스트 제안만, 자동 호출 금지 — ADR-007)
다음 6 신호 중 하나라도 감지되면 출력 마지막에 `architect 호출 권장: <이유>` 1줄 추가:
1. 새 모듈 디렉터리 생성 (`src/<new>/` 또는 동등 경로).
2. charter `## 7. 제약 조건`에 없는 새 외부 의존 (npm/pip/cargo) 추가.
3. ARCHITECTURE_OVERVIEW.md `## 3-1. 레이어 경계` 변경.
4. "패턴 변경" / "새 boundary" / "도메인 경계" 키워드 등장.
5. **ARCHITECTURE_OVERVIEW.md `## 7-1`/`## 7-2`/`## 7-3`/`## 7-4` 의 *기존 결정* 변경 또는 신규 항목 추가 의심** (예: API versioning 정책 변경 / 인증 방식 변경 / 라우팅 전략 변경). 인터페이스 결정 책임 분배 (ADR-027) 정합.
6. **DESIGN.md `## 7. Components` 인벤토리에 *새 primitive* 추가 의심** (예: 기존 Button/Input/Card 외 패턴 신설). 추가는 architect 또는 별도 `/bootstrap-design` 라운드 권장.
```

### 4-4. 마지막 출력 형식 보강 (L88~L120, "마지막 출력" 단락)

`마지막 출력:` 단락의 기존 항목들 *바로 다음* (병렬 wave 그룹 echo 직전) 에 다음 한 줄 추가:

```markdown
- **인터페이스·디자인 cross-check 결과** (Phase 3 §4-2 self-check 결과 요약):
  ```
  DESIGN cross-check: 컴포넌트 중복 N건, raw hex K건, 상태 매트릭스 누락 M건
  ARCH 7-x cross-check: 7-1 위반 N건, 7-3 위반 K건, ...
  ```
  (UI/스택 비해당 시 "skip" 명시)
```

### 4-5. `feature 분해 시` 단락에 1줄 추가 (L59~L65)

**위치**: `## feature 분해 시 (ADR-036)` 단락 끝.

**추가 (단락 끝에 새 줄)**:
```markdown
feature 분해 시 `## 11. 관련 문서` 에 *해당 스택* 의 `Architecture-Iface:` link 와 (UI 프로젝트 한정) `Design:` link 를 채운다. TEMPLATE 의 비해당 스택 줄은 *삭제* (placeholder 잔존 X — drift 차단).
```

### 4-6. Phase 3 종료 검증

- plan-workitem 호출 시 (UI 프로젝트) DESIGN.md 가 read-list 에 들어감 — 실제 호출 라운드에서 grep 으로 확인
- 출력에 "DESIGN cross-check" / "ARCH 7-x cross-check" 라인이 나타남
- DESIGN.md 부재 (비-UI) 시 본 항목 skip + skip 사유 echo
- 자동 차단 발생 0건 (권장 텍스트만 — ADR-007 정합 유지)

**커밋 메시지**: `feat(plan-workitem): add DESIGN.md + ARCH 7-x read-list, task-type prefilter, and consistency self-check`

---

## 5. Phase 4 — validate-plan + reviewer Plan Quality 차원 확장

### 5-1. `.claude/agents/reviewer.md` 의 `## Plan Quality 8 차원` 단락 → **10 차원** 으로 확장 (L64~L77)

**변경 전 (요약 — 차원 8개)**:
```
1. [Plan-scope]
2. [Plan-sizing]
3. [Plan-AC-form]
4. [Plan-ambiguity]
5. [Plan-FAC-coverage]
6. [Plan-dep]
7. [Plan-arch]
8. [Plan-doc-link]
```

**변경 후 — 단락 헤더 + 항목 추가**:

단락 헤더 (`## Plan Quality 8 차원 (plan surface 전용 — ADR-038)`) 를:
```markdown
## Plan Quality 10 차원 (plan surface 전용 — ADR-038 + ADR-027 amend 1)
```
로 변경.

기존 8 항목 *바로 다음* 에 다음 2 항목 추가:

```markdown
9. **[Plan-design]** (UI 프로젝트 한정 — ADR-027 amend 1) — DESIGN.md `## 7. Components` 인벤토리 외 새 컴포넌트 즉흥 신설 / AC 본문에 raw hex 색 코드 (`#[0-9A-Fa-f]{3,6}`) / DESIGN.md `## 9. Do's and Don'ts` 위반 / **task 본문의 use-case 에 등장하는 상태가 AC 에 누락** (예: hover/disabled 가 본문 시나리오에 있는데 AC 미언급). *전체 8 상태 매트릭스 (default/hover/active/focus/disabled/loading/error/empty) 의 설계 여부는 별도 차원* — DESIGN.md `## 7` 본문에 컴포넌트가 *등록될 때* 8 상태가 함께 설계됐는지는 [Design-state] (stabilize-milestone `design` surface) 책임. plan 단계는 *use-case 한정* 책임. **DESIGN.md 파일 부재 시 본 차원 skip + "핵심 관찰" 에 한 줄 명시** (비-UI 프로젝트 정상 경로). (P1 권장)
10. **[Plan-arch-iface]** (해당 스택 한정 — ADR-027 amend 1) — ARCH `## 7-1` (API envelope/error 컨벤션) / `## 7-2` (CLI 출력 포맷) / `## 7-3` (백엔드 결정 — DB migration / 인증 / 트랜잭션 / Idempotency / Rate limit / Async / Caching / API versioning) / `## 7-4` (프론트 결정 — 라우팅 / 상태관리 / SSR-CSR / i18n / SEO / 인증 / 폼 validation) 의 기존 결정과 어긋나는 신규 결정 즉흥 도입 / 7-x Don'ts 위반 의심. **해당 sub-section 부재 시 본 차원 skip + "핵심 관찰" 에 한 줄 명시.** (P0 권장 — 인터페이스 일관성은 사후 수정 비용이 크므로)
```

라벨링 예 추가 (L77 의 예 다음에 1 줄):
```markdown
라벨링 예: `P1 [Plan-design] T-005:AC-2 — raw hex #FF6B6B 사용. DESIGN.md ## 2 의 token color/semantic/error 로 교체 권장`.
라벨링 예: `P0 [Plan-arch-iface] T-008:AC-1 — response 형식 { status: "ok", payload } 이 ARCH ## 7-1 envelope { data, error, meta } 와 불일치`.
```

### 5-2. `.claude/skills/validate-plan/SKILL.md` 의 *검토 차원* 단락 (L45~L53) 8 → 10 으로 확장

**변경 전**:
```markdown
검토 차원 (8 dimensions — reviewer.md의 *Plan Quality 8 차원* 정합):
1. **[Plan-scope]** ...
...
8. **[Plan-doc-link]** ...
```

**변경 후 — 헤더 + 2 항목 추가**:

헤더:
```markdown
검토 차원 (10 dimensions — reviewer.md의 *Plan Quality 10 차원* 정합 — ADR-027 amend 1):
```

기존 8 항목 바로 뒤에:
```markdown
9. **[Plan-design]** (UI 한정 — DESIGN.md 부재 시 skip) — DESIGN.md `## 7` 인벤토리 외 컴포넌트 신설 / raw hex / Don'ts 위반 / 8 상태 매트릭스 누락. P1 권장.
10. **[Plan-arch-iface]** (해당 스택 한정 — 7-x sub-section 부재 시 skip) — ARCH `## 7-1`/`## 7-2`/`## 7-3`/`## 7-4` 기존 결정 위반 / Don'ts 위반. P0 권장.
```

### 5-3. `반드시 먼저 읽을 파일` 갱신 (L29~L42)

**위치**: 기존 `docs/20-system/ARCHITECTURE_OVERVIEW.md (## 3-1 ...)` 줄 다음.

**추가 (해당 줄 바로 뒤에 1 줄)**:
```markdown
- `docs/20-system/ARCHITECTURE_OVERVIEW.md` `## 7-1`/`## 7-2`/`## 7-3`/`## 7-4` (해당 스택 한정 — [Plan-arch-iface] 참조). *해당 sub-section 부재 시 본 차원 skip*.
- `docs/20-system/DESIGN.md` (UI 프로젝트 한정 — [Plan-design] 참조). *파일 부재 시 본 차원 skip + "핵심 관찰" 에 명시*.
```

### 5-4. `## 카테고리 별 카운트` 표 확장 (L91~L100)

기존 표 끝에 2 행 추가:
```markdown
| Plan-design | 0 | 0 | 0 |
| Plan-arch-iface | 0 | 0 | 0 |
```

### 5-5. Phase 4 종료 검증

- reviewer.md 단락 헤더가 `10 차원` 로 변경
- validate-plan 호출 시 (UI 프로젝트) 리뷰 파일에 `Plan-design` / `Plan-arch-iface` 카테고리 행 등장
- DESIGN.md 부재 시 skip + 사유 echo (자동 차단 X)
- ADR-038 의 review verdict 규칙 (`NEEDS_CHANGES`: P0 ≥1) 정합 유지 — 본 변경은 신규 차원 추가만, 기존 규칙은 그대로

**커밋 메시지**: `feat(validate-plan): expand Plan Quality review to 10 dimensions (Plan-design, Plan-arch-iface)`

---

## 6. Phase 5 — stabilize-milestone deterministic preflight 강화

### 6-1. `.claude/skills/stabilize-milestone/SKILL.md` `### 1.0. Deterministic pre-flight` 단락 5번째 항목 추가 (L29~L51)

**위치**: 기존 4 항목 (markdown link / ADR-ref / FAC↔AC / 모드 라벨) 뒤, "본 단계는 모두 *보고만*" 단락 직전.

**중요 — 정확성 한계 자인**: 본 5번째 항목 중 (5-2) raw hex grep 은 정규식 기반으로 deterministic 에 가깝지만, (5-3) 인벤토리 drift 와 (5-4) Don'ts grep 은 *free-form 문서에서 키워드 추출* 이라 휴리스틱이다. 따라서 본 항목은 `### 1.0. Deterministic pre-flight` 단락 안에 들어가지만 본 5번째 항목 자체는 *mechanical / best-effort* 라벨을 본문에 명시한다 — `### 1.0` 헤더 자체는 살리되 항목별 강도 차이를 echo 로 노출.

**추가 (그대로 복사)**:

```markdown
5. **DESIGN.md + ARCH 7-x cross-surface drift 검출** (ADR-027 amend 1 결정 19) — *(5-2) 는 정규식 기반 deterministic, (5-3)(5-4) 는 mechanical/best-effort heuristic — 휴리스틱 한계는 항목별 echo*:

   5-0. **변경 파일 회수 — git diff 의존 금지**: stabilize-milestone 은 정상 lifecycle 에서 `/finalize-workitem` 으로 *이미 커밋된* 후 호출되므로 working tree `git diff` 는 비어 있다. 본 마일스톤 task 의 변경 파일 회수 우선순위:
   - **(a) 1차 — task 문서**: 본 마일스톤 산하 모든 task (`docs/30-workitems/tasks/T-*.md`) 의 `## 4-1. 변경 예정 파일/경로` 본문 회수. (TASK_TEMPLATE 정합 — finalize 시 `--apply` 또는 명시 update 로 채워짐)
   - **(b) 2차 — commit log fallback**: `## 4-1` 비어 있거나 git 실제 변경과 어긋난 task 는 `git log --grep "Refs: T-NNN" --name-only` 로 commit 로그의 변경 파일 회수 (ADR-008 amend 2 Refs footer 정합).
   - **(c) 3차 — validation report fallback**: 위 둘 다 비어 있는 task 는 `docs/40-validation/reports/<task-id>.md` 의 diff trace audit 단락 회수.
   - **(d) 모두 실패 시**: 본 task 는 *조사 불가* 로 표시 + IMPROVEMENT_GUIDE 에 `P2 [Stabilize-recovery] T-NNN — 변경 파일 회수 불가` 기록 후 다음 task 로 계속.

   5-1. **UI 프로젝트 판정** (Phase 3 §4-1 와 동일 다중 신호 우선순위 적용 — false UI 판정 회피):
   - (i) DESIGN.md 부재 → 비-UI 확정 → 본 5-1 ~ 5-3 모두 skip + skip 사유 echo.
   - (ii) DESIGN.md 존재 + `## 0. Status` ≠ `draft` → UI 확정 → 5-1 ~ 5-3 활성.
   - (iii) DESIGN.md 존재 + `## 0. Status` == `draft` → 추가 신호 (ARCH `## 7-4` 활성 / 본 마일스톤 산하 task 중 `## 7. 관련 문서` 의 `Design:` link 또는 본문 UI 키워드 등장) 1개 이상 → UI 의심 → IMPROVEMENT_GUIDE 에 `P1 [Design-draft] DESIGN.md status=draft + UI 신호 감지 — /bootstrap-design 권장` 기록 + 5-1 ~ 5-3 활성. 신호 0개 → silent skip.

   5-2. **UI 프로젝트 — raw hex grep** (정규식 deterministic): 5-0 에서 회수한 변경 파일 목록 중 확장자가 `.tsx`/`.jsx`/`.ts`/`.js`/`.vue`/`.svelte`/`.astro`/`.css`/`.scss`/`.html` 인 파일에서 `#[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?` 패턴 grep. 일치 발견 시 IMPROVEMENT_GUIDE 에 `P1 [Design-rawhex] <file:line> — DESIGN.md ## 2 token 으로 교체 권장` 기록. **DESIGN.md 자체 파일은 grep 대상 *제외*** (token 정의 영역이라 false positive 회피).

   5-3. **UI 프로젝트 — 컴포넌트 인벤토리 drift** (best-effort heuristic): `src/components/`, `app/components/`, `components/` 중 존재하는 디렉터리의 컴포넌트 파일명 (예: `Button.tsx`, `Card.tsx`) 목록 ↔ DESIGN.md `## 7. Components` 본문에 명시된 컴포넌트 이름 비교. 코드에는 있지만 DESIGN.md 에 없는 컴포넌트 발견 시 `P1 [Design-inventory-drift] <component> — DESIGN.md ## 7 등록 권장` 기록. 반대 (DESIGN.md 에 있는데 코드에 없음) 는 unimplemented planned component → `P2 [Design-inventory-pending] <component>` 기록. **휴리스틱 한계 echo 권장** (`인벤토리 drift 검출은 free-form 문서 키워드 매칭 — false positive/negative 가능`).

   5-4. **API/CLI 스택 한정 — 7-x Don'ts 위반 grep** (best-effort heuristic): ARCH 의 `## 7-1` 의 `### Don'ts` / `## 7-2` 의 `### Don'ts` 본문에서 *명시적 금지 키워드* 를 추출 → 5-0 회수 변경 파일에서 해당 키워드 grep. 위반 의심 발견 시 `P0 [Arch-iface-violation] <file:line> — ARCH ## 7-N Don'ts 위반 의심: <키워드>` 기록. **휴리스틱 한계 echo 강제** (`Don'ts 키워드 추출은 free-form 텍스트 기반 — false negative 多. 본 grep 미작동 시 reviewer 의 design surface 위임이 보조 catch`).

   > **7-3 백엔드 / 7-4 프론트 의 milestone-level deterministic gap 명시**: 현 ARCH TEMPLATE 의 `## 7-3` / `## 7-4` 는 `### Don'ts` 자리가 없어 본 5-4 grep 이 *skip* 한다. 단 이것이 *전면 gap 은 아니다* — 7-3/7-4 결정과의 정합은 **per-task validate-workitem (validator.md L44 — Phase 7) 의 CHECK 단계가 task 단위로 점검**한다 (DB migration / 인증 / 트랜잭션 / 라우팅 / 상태관리 등). 즉 *milestone-level deterministic preflight* 에서만 빠지고, *task-level validation* 에서는 잡힌다. milestone 누적 drift 가 우려되면 stabilize 의 reviewer `code` surface (Step 5) 가 아키텍처 부채로 추가 catch. 향후 7-3/7-4 에 `### Don'ts` 자리를 TEMPLATE 에 추가하면 본 grep 도 확장 가능 (별도 ADR-027 amend 후보).

   5-5. **해당 스택 부재 시 본 항목 skip** + skip 사유 echo: `[Design/Arch-iface] check skipped: <reason>`. 예: `[Design] check skipped: docs/20-system/DESIGN.md 부재 (비-UI 프로젝트)`.
```

### 6-2. `### 1.5. Graduation pre-check` 의 `(선택) 본 마일스톤 한정 추가 기준` 줄에 example 1 줄 추가 (L64)

**추가 (기존 줄 다음 한 줄)**:
```markdown
- *UI 프로젝트의 자연스러운 추가 기준 example*: `DESIGN.md 모든 컴포넌트가 코드에 1+ 회 사용 + 8 상태 매트릭스 충족` — 채택은 사용자 결정.
```

### 6-3. reviewer 위임 (Step 5) 의 입력에 surface 명시 보강 (L74~L76)

**변경 전**:
```markdown
5. **reviewer agent에 리팩토링 후보·아키텍처 부채 점검 위임** — reviewer 입력에 Clean Code 6항목 체크리스트(ADR-006) + `review surface: code` 를 명시 전달한다. reviewer도 보고만 한다. ...
```

**변경 후**:
```markdown
5. **reviewer agent에 리팩토링 후보·아키텍처 부채 점검 위임** — reviewer 입력에 Clean Code 6항목 체크리스트(ADR-006) + `review surface: code` 를 명시 전달한다. **UI 프로젝트의 경우 추가로 `review surface: design` 으로 별도 위임 1회** — DESIGN.md `## 9. Do's and Don'ts` 위반 의심 grep 결과를 입력으로 받아 비판적 검토. reviewer 도 보고만 한다. ...
```

### 6-4. Step 8 의 instruction improvement 후보 단락에 1 줄 추가 (L97~L103)

**추가 (단락 끝에)**:
```markdown
- DESIGN.md / ARCH 7-x cross-surface drift 가 본 마일스톤 중에 N회 이상 발견됐다면 *Phase 1 의 ADR-027 amend 1 적용 본문* 이 누락된 fork 인지 점검 권장.
```

### 6-5. `.claude/agents/reviewer.md` 의 surface 분기 단락 갱신 (L58~L62)

**변경 전**:
```markdown
**호출 surface 명시**: 본 agent가 호출될 때 입력에 *"review surface: code | doc | mixed | plan"*를 명시받는다. surface에 따라 적용 차원:
- `code`: Clean Code 6 + Scope Discipline 4.
- `doc`: Doc Consistency 4 + (해당 시) Scope Discipline 4 (변경 diff가 있을 때만).
- `mixed`: 3 차원 모두 (Clean Code 6 + Scope Discipline 4 + Doc Consistency 4).
- `plan`: Plan Quality 8 (아래 별도 섹션). Clean Code / Scope Discipline / Doc Consistency 미적용.
```

**변경 후 (surface 1종 추가)**:
```markdown
**호출 surface 명시**: 본 agent가 호출될 때 입력에 *"review surface: code | doc | mixed | plan | design"*를 명시받는다. surface에 따라 적용 차원:
- `code`: Clean Code 6 + Scope Discipline 4.
- `doc`: Doc Consistency 4 + (해당 시) Scope Discipline 4 (변경 diff가 있을 때만).
- `mixed`: 3 차원 모두 (Clean Code 6 + Scope Discipline 4 + Doc Consistency 4).
- `plan`: Plan Quality 10 (아래 별도 섹션). Clean Code / Scope Discipline / Doc Consistency 미적용.
- `design`: Design Consistency 4 (아래 별도 섹션 — ADR-027 amend 1). UI 프로젝트에서 stabilize-milestone 이 호출.
```

그리고 `## Plan Quality 10 차원` 단락 *바로 다음* 에 새 단락 추가:

```markdown
## Design Consistency 4 차원 (design surface 전용 — ADR-027 amend 1)

stabilize-milestone 이 UI 프로젝트 surface 호출 시 본 차원 적용.

1. **[Design-token]** — raw hex / 토큰 외 색 사용 / typography family/scale 외 사용. (P1)
2. **[Design-inventory]** — DESIGN.md `## 7. Components` 인벤토리 외 컴포넌트 신설 / 등록 누락. (P1)
3. **[Design-state]** — **DESIGN.md `## 7` 본문에 등록된 컴포넌트 정의** 가 default/hover/active/focus/disabled/loading/error/empty 8 상태 매트릭스를 *모두 설계* 했는가 (문서 설계 기준 — task 구현이 8 상태 모두 구현했는지는 별도 차원). 누락 발견 시 `P1 [Design-state] DESIGN.md ## 7 의 <component> 정의에 <상태> 누락`. *task 구현 단계의 use-case 한정 상태 검증* 은 validator (Phase 7 §8-1) 책임 — 본 차원과 책임 분리. (P1)
4. **[Design-donts]** — DESIGN.md `## 9. Do's and Don'ts` 명시 위반 (예: primary CTA 2+ / color 5색 초과 / motion `prefers-reduced-motion` 미분기). (P0)

**8 상태 매트릭스 책임 분배**:
| 단계 | 책임 surface | 점검 기준 |
|------|------------|----------|
| plan-workitem self-check | planner | task 본문 use-case 에 등장하는 상태가 AC 에 누락? |
| validate-plan [Plan-design] | reviewer (plan surface) | 동일 — use-case 한정 |
| validate-workitem | validator | task 구현이 use-case 해당 상태 코드 구현? |
| stabilize-milestone design surface [Design-state] | reviewer (design surface) | DESIGN.md `## 7` 본문에 *컴포넌트 정의가 8 상태 전체* 설계됐는가? |

**근거**: DESIGN.md 는 *설계 문서* (8 상태 전 설계가 컴포넌트 인벤토리의 책임). task 는 *구현 단위* (1 task 1 RGR 사이클 — 8 상태 전부 1 task 강제는 ADR-026 sizing 위반). 두 surface 가 다른 기준으로 점검해야 정합.

라벨링 예: `P0 [Design-donts] components/Hero.tsx:42 — primary CTA 2개 (DESIGN.md ## 9 위반)`.
```

### 6-6. Phase 5 종료 검증

- stabilize-milestone 호출 시 `### 1.0` deterministic preflight 출력에 5번째 항목 (Design/Arch-iface drift) 결과 등장
- DESIGN.md draft 잔존 + 프론트 task 존재 시 P1 보고 발생
- 비-UI 프로젝트는 skip + 사유 echo
- reviewer.md 의 surface 분기에 `design` 추가, `Plan Quality` 단락 헤더가 `10 차원` 로 변경

**커밋 메시지**: `feat(stabilize-milestone): add design/arch drift preflight and design review surface`

---

## 7. Phase 6 — implement-workitem 최소 보강 (EXECUTE 전용)

> implement-workitem 은 EXECUTE 전용 (§0-3 책임 모델). builder 에 *신규 디자인 cross-check / pre-write grep / 등록 결정* 을 박지 않는다 — 그것들은 plan (THINK) 과 validator (CHECK) 책임. 본 Phase 는 *task 문서가 링크한 SSOT 섹션을 충실히 읽는* + *plan 이 박은 등록 line item 을 기계적으로 실행하는* step 만 추가. builder.md 는 **변경하지 않는다** (기존 L43 self-check 그대로 — pre-existing enabling 가드).

### 7-1. `.claude/skills/implement-workitem/SKILL.md` 의 *반드시 먼저 할 일* 단락 (L18~L23) 에 step 추가

**변경 전**:
```markdown
반드시 먼저 할 일:
1. 관련 task 문서를 읽는다.
2. 필요하면 상위 feature/milestone/architecture 문서를 읽는다.
3. task 문서의 `## 6. Acceptance Criteria`(AC-1, AC-2 ...)를 회수한다.
4. `## 6-2. TDD opt-out`을 점검한다 — ...
```

**변경 후**:
```markdown
반드시 먼저 할 일:
1. 관련 task 문서를 읽는다.
2. 필요하면 상위 feature/milestone/architecture 문서를 읽는다.
3. **task `## 7. 관련 문서` 의 `Design:` / `Architecture-Iface:` link 가 있으면 그 sub-section (예: `DESIGN.md ## 7 Components`, `ARCH ## 7-1`) 만 회수** — *plan 이 박은 결정을 충실히 실행하기 위함* (독립 디자인 판단 X — §0-3 EXECUTE 정합). 전체 fork-load 금지 (ADR-019 minimal). link 없으면 본 step skip.
4. **task `## 3. 구현 항목` 에 *등록 line item* (예: `+ DESIGN.md ## 7 등록`, `+ ARCH ## 7-1 error 레지스트리 등록`) 이 있으면 구현과 *동일 commit* 에 그 등록을 수행** — plan 이 authoring 한 스펙의 기계적 실행 (Phase 3 §4-2 정합). line item 없으면 등록 안 함 (builder 가 등록 여부를 *독립 판단하지 않는다*).
5. task 문서의 `## 6. Acceptance Criteria`(AC-1, AC-2 ...)를 회수한다.
6. `## 6-2. TDD opt-out`을 점검한다 — ...
```

(기존 3·4 → 5·6 으로 번호 재정렬)

### 7-2. `.claude/agents/builder.md` — *변경 없음*

builder 에 pre-write grep / 등록 결정 self-check 를 추가하지 않는다. 근거:
- implement 는 EXECUTE 전용 — 중복 탐지는 plan (§4-2 cross-check), 위반 적발은 validator (Phase 7) 책임.
- builder 에 디자인 cross-check 를 박으면 minimal executor 모델 + ADR-019 context budget + ADR-022 (가설적 예방 과잉 제약) 위반.
- 기존 builder.md L43 self-check ("인터페이스 요소가 SSOT Don'ts 위반?") 는 *pre-existing 가벼운 enabling 가드* 라 그대로 둔다 — **report-only** (남은 정리 항목 보고만, 수정·재설계·차단 X). drift 자기 인지이지 신규 디자인 판단이 아니므로 EXECUTE 모델과 정합 (§0-3 note 상세).

### 7-3. Phase 6 종료 검증

- implement-workitem 호출 시 step 3 에서 task-linked `Design:` / `Architecture-Iface:` 섹션 회수 echo (link 있을 때만)
- step 4 에서 등록 line item 이 있으면 그 등록이 구현과 동일 commit 에 포함됐는지 확인
- `.claude/agents/builder.md` git diff = 0 (변경 없음 확인)

**커밋 메시지**: `feat(implement-workitem): read task-linked SSOT sections and run plan-authored registration line items`

---

## 8. Phase 7 — validate-workitem + validator 등록 절차 명확화

### 8-1. `.claude/agents/validator.md` L44 갱신 — "등록" 절차 명시

**변경 전**:
```markdown
- UI: 컴포넌트가 R3 인벤토리 등록 + 상태 매트릭스 충족? / API: 7-1 envelope·error 컨벤션 준수? / CLI: 7-2 출력 포맷 컨벤션 준수? / 백엔드: 7-3 DB migration·인증·트랜잭션 결정 정합? / 프론트: 7-4 라우팅·상태관리·SSR-CSR 결정 정합?
```

**변경 후**:
```markdown
- UI: 본 task 가 새 컴포넌트를 추가했는가? task `## 3. 구현 항목` 에 *등록 line item* (`+ DESIGN.md ## 7 등록`, plan 이 authoring) 이 있었는가? 있었으면 그 등록이 *실행됐는지* (DESIGN.md `## 7. Components` 본문에 해당 컴포넌트 한 줄 추가됨) 점검. 등록 line item 이 있었는데 실행 누락 시 report 에 `P1 [Design-inventory] <component> — plan 이 박은 DESIGN.md ## 7 등록 line item 미실행` 기록. *등록 line item 자체가 없는데 신규 컴포넌트가 박힌 경우* (plan 누락) 는 `P1 [Design-inventory-planless] <component> — plan 에 등록 line item 부재 + 신규 컴포넌트 출현. plan 보강 권장` 기록. 8 상태 매트릭스 중 *task 의 use-case 에 해당하는 상태* 가 코드에 구현됐는가? (전 8 상태 강제 X — task scope 한정. 전체 8 상태 *설계* 여부는 DESIGN.md `## 7` 의 책임 — stabilize `design` surface [Design-state] 가 점검)
- API: 7-1 envelope·error 컨벤션 준수? 신규 error code 도입 시 7-1 *error 레지스트리* 에 추가됐는가? 누락 시 `P1 [Arch-iface-API] 7-1 error 레지스트리 누락`.
- CLI: 7-2 출력 포맷 컨벤션 준수? 신규 출력 모드 도입 시 7-2 *출력 포맷* 에 추가됐는가?
- 백엔드: 7-3 DB migration·인증·트랜잭션 결정 정합? 본 task 가 7-3 결정 외 새 결정을 도입했는가? 도입 시 ADR 후보로 표시.
- 프론트: 7-4 라우팅·상태관리·SSR-CSR 결정 정합? 본 task 가 7-4 결정 외 새 결정을 도입했는가? 도입 시 ADR 후보로 표시.
```

### 8-2. `.claude/skills/validate-workitem/SKILL.md` 의 *검증 기준* 단락 (L26~L50) 에 1 줄 추가

**위치**: 기존 검증 기준 항목 (`FAC → AC spec coverage audit` 다음) 끝에 1 줄.

**추가**:
```markdown
- **UI 프로젝트 — Design inventory audit** (ADR-027 amend 1): 본 task 가 새 컴포넌트를 추가했는데 task `## 3. 구현 항목` 의 *등록 line item* (plan authoring) 이 실행 누락이면 `P1 [Design-inventory]`. 등록 line item 자체가 부재한데 신규 컴포넌트 출현이면 `P1 [Design-inventory-planless]` (plan 보강 권장). repair-workitem 또는 다음 plan 라운드로 회수.
- **API/CLI/백엔드/프론트 — Arch-iface audit**: 본 task 가 ARCH `## 7-1`/`## 7-2`/`## 7-3`/`## 7-4` 의 기존 결정을 위반했거나, 신규 결정을 *7-x 본문 갱신 없이* 도입했으면 report 에 `P1 [Arch-iface-7-N]` 기록 + 7-x 본문 갱신 권장 또는 ADR 후보 표시.
```

### 8-3. Phase 7 종료 검증

- validator 호출 시 (UI task) plan 이 박은 등록 line item 의 *실행 여부* 점검 → 누락 시 `P1 [Design-inventory]`, plan 누락 시 `P1 [Design-inventory-planless]`
- 검증 기준에 [Design-inventory] / [Design-inventory-planless] / [Arch-iface-7-N] 라벨 등장
- 등록 *결정* 은 plan (THINK), *실행* 은 builder (EXECUTE), *점검* 은 validator (CHECK) 로 3분리 → "등록 절차 부재" 자기 모순 해소 + executor 에 독립 판단 안 박힘 (§0-3 정합)

**커밋 메시지**: `feat(validate-workitem): verify design inventory registration and arch-iface conformance`

---

## 9. Phase 8 — Cross-surface 정합 sync

### 9-1. `docs/00-meta/STRUCTURE.md` Canonical Owner 표 갱신 (1 행 추가 + 1 행 sync)

**1) 기존 L96 *Plan Quality 8 차원* 행 갱신 (SSOT drift 차단)**:

기존 행에서 `Plan Quality 8 차원` 표현을 `Plan Quality 10 차원` 으로 변경하고 ADR-027 amend 1 인용 추가.

**변경 전 (L96 부근 — 링크는 `...` 로 생략)**:
```
| Cross-LLM plan validation (opt-in peer review) | [ADR-038]... (정책 SSOT). 적용 surface: `.claude/skills/validate-plan/SKILL.md` + `.claude/skills/repair-plan/SKILL.md` 본문 + `.claude/agents/reviewer.md` Plan Quality 8 차원 — 세 surface가 한 묶음, ADR-038 본문 변경 시 동기 갱신. |
```

**변경 후 (`Plan Quality 8 차원` → `10 차원` 만 변경)**:
```
| Cross-LLM plan validation (opt-in peer review) | [ADR-038]... (정책 SSOT). 적용 surface: `.claude/skills/validate-plan/SKILL.md` + `.claude/skills/repair-plan/SKILL.md` 본문 + `.claude/agents/reviewer.md` Plan Quality 10 차원 (ADR-027 amend 1 로 8 → 10 확장) — 세 surface가 한 묶음, ADR-038 본문 변경 시 동기 갱신. |
```

**2) 새 행 추가 (ADR-038 행 직후)**:
```markdown
| DESIGN.md + ARCH 7-1~7-4 cross-surface enforcement | [ADR-027](../90-decisions/boilerplate/ADR-027-interface-decision-allocation.md) amend 1 (정책 SSOT). 적용 surface: `.claude/skills/plan-workitem/SKILL.md` (read-list + self-check + task type prefilter + 신규 요소 등록 line-item authoring) + `.claude/skills/validate-plan/SKILL.md` (`[Plan-design]` + `[Plan-arch-iface]` 차원) + `.claude/skills/stabilize-milestone/SKILL.md` `### 1.0` 5번째 항목 (5-0 변경 파일 회수 + 5-1 UI 다중 신호 판정 포함) + `.claude/agents/reviewer.md` (Plan Quality 10 차원 + Design Consistency 4 차원 + `design` surface) + `.claude/skills/implement-workitem/SKILL.md` (task-linked 섹션 회수 + 등록 line item 실행 — *EXECUTE 전용, builder.md 변경 X*) + `.claude/skills/validate-workitem/SKILL.md` + `.claude/agents/validator.md` L44 + 2개 TEMPLATE — 본 묶음이 한 단위, ADR-027 amend 1 본문 변경 시 동기 갱신. |
```

### 9-2. `docs/00-meta/WORKFLOW.md` 의 `## 2. 시스템 설계` 단락 (L8~L10) 보강 (ADR 인용 압축)

**위치**: 기존 L10 의 *비-UI 프로젝트 안내* 직후.

**추가 (ADR-027 인용으로 압축 — SSOT 본문 복제 회피)**:
```markdown
- ARCH `## 7-1`/`## 7-2`/`## 7-3`/`## 7-4` 의 채움/삭제/cross-reference 정책은 [ADR-027](../90-decisions/boilerplate/ADR-027-interface-decision-allocation.md) (amend 1 포함) SSOT.
```

**근거**: ADR-027 결정 #15 + amend 1 결정 16~20 이 본문 SSOT — WORKFLOW.md 는 *링크만* 두는 게 ADR-005 정합.

### 9-3. `AGENTS.md` 의 *깊은 운영 원칙* 단락에 1 줄 추가 (현재 100줄 cap 정합 확인)

**제약**: `AGENTS.md` 는 100줄 hard cap (ADR-011). 현재 길이 확인 후 *기존 줄과 묶음* 으로 압축.

**행동**:
1. `wc -l AGENTS.md` 로 현재 줄 수 확인.
2. 100줄 초과 위험 시 본 추가는 *생략* (Canonical Owner 표 1 행 이 SSOT — Phase 8 §9-1 이미 박았으므로 AGENTS.md 줄 추가는 *선택*).
3. 여유 있으면 *시각 디자인* 줄 직후 1 줄:
   ```markdown
   - [인터페이스 결정 책임 분배](docs/90-decisions/boilerplate/ADR-027-interface-decision-allocation.md) (DESIGN.md UI + ARCH 7-1~7-4 cross-surface enforcement, amend 1)
   ```

### 9-4. Codex wrapper (`.agents/skills/*/SKILL.md`) 검증

**행동**:
1. `.agents/skills/plan-workitem/SKILL.md` / `.agents/skills/validate-plan/SKILL.md` / `.agents/skills/stabilize-milestone/SKILL.md` / `.agents/skills/implement-workitem/SKILL.md` / `.agents/skills/validate-workitem/SKILL.md` 5 파일 grep.
2. 각 파일이 *Source of truth* line (예: `Source of truth: \`.claude/skills/<name>/SKILL.md\`.`) 만 갖고 본문 복제가 없는지 확인.
3. 확인되면 *별도 갱신 불필요* (delegate 만 — gap 자동 mirror).
4. 만약 본문이 복제돼 있으면 본 가이드의 해당 Phase 변경을 동일하게 적용.

### 9-5. `docs/90-decisions/project/README.md` 갱신 불요

**근거**: 본 가이드의 모든 amend 는 boilerplate scope (`docs/90-decisions/boilerplate/`). project scope ADR (`docs/90-decisions/project/`) 는 fork 사용자가 *적용 후* 박을 영역. boilerplate 본체 라운드에서는 변경 없음.

### 9-6. Phase 8 종료 검증

- STRUCTURE.md Canonical Owner 표에 새 행 1 개 추가 확인 (cross-surface 적용 의무 명시 — ADR-005 정합)
- WORKFLOW.md `## 2` 에 7-x 통째 삭제 + cross-reference 안내 1 줄 추가
- AGENTS.md 100줄 cap 위반 0건 (`wc -l` 확인)
- Codex wrapper 5 파일이 delegate-only 확인 → 별도 갱신 0건

**커밋 메시지**: `docs(meta): sync STRUCTURE.md canonical owner and WORKFLOW.md ADR-027 reference`

---

## 10. Phase 9 — 검증 + 시뮬레이션 + 회귀 점검

### 10-1. Dogfood 시뮬레이션 라운드 추가

**행동**:
1. `.boilerplate/validation/SIMULATION_RUN.md` 끝에 새 라운드 헤더 추가 — 예: `## Round N+1 — ADR-027 amend 1 적용 후 (2026-MM-DD)`.
2. 본 라운드의 시뮬레이션 시나리오 5종 (ADR-027 시나리오 검증 표 의 *Next.js SaaS / FastAPI 백엔드 / Rust CLI / 풀스택 / 라이브러리* 5종):
   - 시나리오마다 `/bootstrap-project` → `/bootstrap-stack` → (UI 한정) `/bootstrap-design` → `/plan-workitem M1` → `/validate-plan M1` → `/implement-workitem T-001` → `/validate-workitem T-001` → `/finalize-workitem T-001` → `/stabilize-milestone M1` 전체 흐름 1회.
3. 각 시나리오에서 다음 측정:
   - plan-workitem 출력에 "DESIGN cross-check" / "ARCH 7-x cross-check" 라인 등장 여부
   - validate-plan 리뷰 파일에 `Plan-design` / `Plan-arch-iface` 카테고리 행 등장 여부
   - stabilize-milestone `### 1.0` 5번째 항목 결과 출력 여부
   - 비해당 스택 시나리오 (예: Rust CLI 에서 Design) 의 skip + 사유 echo 확인
4. 결과를 *수치 + 라벨* (`[관측됨]` 라벨, ADR-022 정합) 로 본 라운드 본문에 기록.

### 10-2. 회귀 점검 (기존 정책 위반 0건)

**행동**:
1. 본 가이드의 모든 변경이 *enabling* (약) 또는 *외부실증 충족 constraint* (강) 만 도입 — 자동 차단 신규 0건 확인 (ADR-007 책임 경계 정합).
2. ADR-019 minimal/JIT 정합 확인: 새로 박은 read-list 는 *해당 스택/UI 한정 + sub-section 한정* — *전체 fork-load 금지* 정책 위반 0건.
3. ADR-005 SSOT 정합 확인: DESIGN.md (UI 결정) + ARCH 7-1~7-4 (인터페이스 결정) 의 정의 위치는 그대로, 다른 surface 는 *인용만* (정의 복제 0건).
4. ADR-011 AGENTS.md 100줄 cap 확인 (`wc -l AGENTS.md`).
5. `markdown-link-check docs/**/*.md` 1회 실행 — 본 가이드 추가로 인한 broken link 0건 확인.

### 10-3. Smoke test 시나리오 (`--dry-run` 의미 충돌 회피)

**배경**: 현 `/stabilize-milestone` 의 `--dry-run` 은 `1.5 Graduation pre-check 만 돌리고 종료` 로 정의돼 있다 (`.claude/skills/stabilize-milestone/SKILL.md` L24, L69). 본 가이드의 새 *5번째 deterministic preflight 항목* 은 `### 1.0` 에 들어가므로 *현 `--dry-run` 의 실행 범위 밖*. smoke test 에서 `--dry-run` 으로 본 5번째 항목을 확인하려 하면 모순. 두 해소안:

- **(권장) 해소안 A — smoke test 명령에서 `--dry-run` 제거**: 본 가이드는 `--dry-run` 의미를 변경하지 않는다 (기존 `--dry-run` 사용자의 기대 보존). smoke test 는 full 호출로 진행.
- **(미채택) 해소안 B — `--dry-run` 의미를 `1.0 + 1.5` 로 재정의**: 현 사용자 기대와 어긋남 + 추가 ADR 필요. 본 가이드 scope 밖.

**행동 (해소안 A 적용)**:
1. UI 프로젝트 fresh fork 1개 (Next.js):
   - `/bootstrap-project "Next.js SaaS"`
   - `/bootstrap-stack` (Next.js/pnpm/Playwright)
   - `/bootstrap-design --fast`
   - `/plan-workitem M1` → 출력에 DESIGN cross-check / ARCH 7-x cross-check 라인 확인
   - `/validate-plan M1 --reviewer-tag smoke` → 리뷰 파일에 `Plan-design` / `Plan-arch-iface` 카테고리 행 확인
   - 최소 1개 task `/implement-workitem` + `/validate-workitem` + `/finalize-workitem` 실행 (commit 1+ 회 발생 — 5-0 변경 파일 회수 검증을 위해 필수)
   - `/stabilize-milestone M1` → `### 1.0` 5번째 항목 출력 확인 (5-0 회수 + 5-1 UI 판정 + 5-2 raw hex grep + 5-3 인벤토리 drift + 5-4 N/A skip — 본 시나리오는 API/CLI 미포함)
2. 비-UI CLI 프로젝트 1개 (Rust CLI):
   - 위 흐름 동일 (단 `/bootstrap-design` 미실행 + fork 직후 `docs/20-system/DESIGN.md` 삭제 단계 포함)
   - DESIGN 관련 모든 항목이 skip + 사유 echo 확인 (`[Design] check skipped: docs/20-system/DESIGN.md 부재 (비-UI 프로젝트)`)
   - ARCH 7-2 (CLI) cross-check 만 활성 확인
3. **선택 시나리오 3 — DESIGN.md draft 잔존 + UI 신호 없음** (5-1 silent skip 검증): UI fresh fork 에서 `/bootstrap-design` 미실행 (DESIGN.md draft 그대로) + task 본문에 UI 키워드 없는 backend-only task 만 박은 milestone 으로 `/stabilize-milestone` → silent skip 확인 (false UI warning 발생 0건).
4. 결과를 §10-5 Phase 9 종료 검증의 smoke test 항목에 1 단락으로 기록.

### 10-4. 적용 후 라벨링

본 가이드 적용 후:
- 새 IMPROVEMENT_GUIDE.md 항목들에 `[관측됨+외부실증]` 라벨 부착 (ADR-022 합성 표기)
- ADR-027 amend 1 본문의 *결정 18, 19* 가 `[외부실증]` 충족 (ADR-027 외부 근거 5종) — 본 가이드 적용 후 1차 시뮬레이션 통과 시 `[관측됨+외부실증]` 으로 승격

### 10-5. Phase 9 종료 검증

- `.boilerplate/validation/SIMULATION_RUN.md` 에 새 라운드 1 개 추가
- 회귀 점검 5 항목 모두 PASS
- smoke test 2 시나리오 모두 PASS

**커밋 메시지**: `test(boilerplate): record cross-surface enforcement simulation round`

---

## 11. 적용 commit 분할 권장

### 11-1. Phase 별로 commit 1 개 (총 9 commits)

각 commit 메시지는 해당 Phase 의 *종료 검증* 끝에 **커밋 메시지** 로 명시했다 (Phase 당 1 commit, 총 9). Phase 1 은 ADR-027 amend 1 / ADR-038 amend 1 / README 세 파일을 한 commit 에 묶는다 (사유는 §2-4 끝 주석 참조).

### 11-2. 한 commit 내 변경 파일 수 제약

- Phase 3 / 4 / 5 는 *1 skill + 1 agent + (필요 시) 1 template* 까지 한 commit 에 묶음 (ADR-026 sizing 5 파일 cap 정합)
- Phase 9 는 single file (`SIMULATION_RUN.md`) 만 변경

### 11-3. 각 commit 의 footer 에 `Refs: ADR-027 amend 1` 명시 (ADR-008 amend 2 정합)

---

## 12. 가이드 적용 후 후속 작업

### 12-1. 1주 후 회수

- `docs/40-validation/IMPROVEMENT_GUIDE.md` 에서 본 가이드 적용 후 발생한 `[Plan-design]` / `[Plan-arch-iface]` / `[Design-rawhex]` / `[Design-inventory-drift]` / `[Arch-iface-violation]` 라벨 카운트 측정
- 0 건이면 *enforcement 가 실효성 없거나 fork 사용자가 미적용* — 본 가이드 §10-3 smoke test 재실행 권장
- ≥1 건이면 *enforcement 작동* — `[가설]` → `[관측됨]` 승격 트리거

### 12-2. 1개월 후 회수

- `.boilerplate/validation/SIMULATION_RUN.md` 의 다음 라운드 (Round N+2) 에서 ADR-027 amend 1 의 효과 측정:
  - LLM 시각 결정 일관성 delta (purple gradient 회귀 발생률)
  - 인터페이스 컨벤션 drift 발생률 (envelope/error 형식 일관성)
- 결과에 따라 *추가 amend* 또는 *현 정책 유지* 결정

### 12-3. fork 사용자 안내

본 가이드 적용 후, 기존 fork 프로젝트는 다음 중 하나:
1. **재fork 권장** (변경 surface 가 여러 개라 수동 sync 비용 큼 — clean fork 가 빠름)
2. **수동 sync** — 본 가이드 Phase 3~7 의 변경 본문을 *그대로 복사* 적용
3. **부분 sync** — Phase 3, 5 (가장 큰 결손) 만 적용 + 나머지는 enabling 으로 [가설] 라벨 부착

---

## 부록 A — 변경 파일 전체 목록

```
docs/90-decisions/boilerplate/ADR-027-interface-decision-allocation.md  [Phase 1 §2-1, edit — Amendment 1 단락 추가]
docs/90-decisions/boilerplate/ADR-038-cross-llm-plan-validation.md      [Phase 1 §2-2, edit — Plan Quality 8 → 10 sync + Amendment 1 단락 추가]
docs/90-decisions/boilerplate/README.md                                  [Phase 1 §2-3, edit — ADR-027 + ADR-038 두 행의 Amendments 컬럼]
docs/30-workitems/_templates/TASK_TEMPLATE.md                            [Phase 2 §3-1, edit — Architecture-Iface / Design link 자리 추가]
docs/30-workitems/_templates/FEATURE_TEMPLATE.md                         [Phase 2 §3-2, edit — 동일]
.claude/skills/plan-workitem/SKILL.md                                    [Phase 3, edit — 5 위치 (read-list / task type prefilter / self-check / architect 호출 신호 / feature 분해 / 마지막 출력)]
.claude/skills/validate-plan/SKILL.md                                    [Phase 4, edit — 3 위치 (검토 차원 헤더 + 2 차원 / read-list / 카테고리 표)]
.claude/agents/reviewer.md                                               [Phase 4 + 5, edit — Plan Quality 헤더 + 2 차원 + surface 분기 (+ design) + Design Consistency 4 차원 단락 + 8 상태 책임 분배 표]
.claude/skills/stabilize-milestone/SKILL.md                              [Phase 5, edit — 4 위치 (deterministic preflight 5번째 항목 + Graduation pre-check example + reviewer 위임 design surface + instruction improvement)]
.claude/skills/implement-workitem/SKILL.md                               [Phase 6, edit — task-linked 섹션 회수 step + 등록 line item 실행 step 추가 + 번호 재정렬]
.claude/skills/validate-workitem/SKILL.md                                [Phase 7, edit — 검증 기준 2 줄]
.claude/agents/validator.md                                              [Phase 7, edit — L44 확장 5 줄]
docs/00-meta/STRUCTURE.md                                                [Phase 8, edit — Canonical Owner 1 행 추가 + ADR-038 기존 행 sync (Plan Quality 8 → 10)]
docs/00-meta/WORKFLOW.md                                                 [Phase 8, edit — § 2 1 줄 (ADR-027 인용 압축)]
AGENTS.md                                                                [Phase 8, edit — *선택* (100줄 cap 여유 시)]
.boilerplate/validation/SIMULATION_RUN.md                                [Phase 9, edit — 새 라운드 (Round N+1)]
```

총 **15~16개 파일 edit** (`AGENTS.md` 선택 포함 시 16 / 미포함 시 15), 신규 파일 생성 **0개**.

`.claude/agents/builder.md` 는 *변경하지 않는다* — implement 는 EXECUTE 전용이라 builder 에 디자인 cross-check / 등록 결정을 박지 않는다 (§7-2). 기존 L43 enabling 가드만 유지.

## 부록 B — 적용 전 점검 체크리스트

본 가이드 적용 *시작 전* 다음을 확인:

- [ ] 현재 git 작업 트리가 clean (`git status` 변경 없음)
- [ ] main 브랜치에서 새 브랜치 분기 (예: `git checkout -b feat/adr-027-amend1-enforcement`)
- [ ] `.claude/skills/` 와 `.claude/agents/` 의 모든 파일이 최신 main 정합 (Phase 진행 중 다른 작업 동시 진행 금지)
- [ ] Phase 1 시작 전 ADR-027 본문 1회 정독 (amend 의 *원본 결정 15개* 와 *추가 결정 5개* 가 모순되지 않는지 확인)
- [ ] Phase 9 시뮬레이션 환경 준비 (시나리오 5종 모두 격리된 worktree 또는 fresh fork 디렉터리)

## 부록 C — 적용 중 중단 시 복구 절차

본 가이드는 Phase 단위 atomic — Phase 중간에 중단되면:

1. 해당 Phase 의 부분 변경을 `git stash` 또는 `git restore` 로 되돌림
2. 다음 진입 시 *해당 Phase 처음부터* 재시작 (Phase 간 의존성이 강하므로 중간 진입 비권장)
3. 이미 commit 된 Phase 는 *되돌리지 않음* — 다음 Phase 부터 이어 진행

## 부록 D — 본 가이드의 한계

- **휴리스틱 의존**: Phase 5 의 raw hex grep / 컴포넌트 인벤토리 비교 / 7-x Don'ts 키워드 추출은 *false positive/negative 가능*. deterministic 보장은 *발견된 항목의 IMPROVEMENT_GUIDE 기록* 까지 — 발견 자체의 완전성은 보장 X.
- **fork 사용자 미적용 위험**: 본 가이드 적용 후에도 fork 사용자가 비-UI / 비-API 프로젝트로 skip 만 echo 되는 경우 *실제 enforcement 작동 데이터 부재* — §12-1 회수에서 fork 사용자 응답 확보 필요.
- **shadcn/ui 등 외부 라이브러리 정합**: 본 가이드의 `## 7. Components` 등록 절차는 *fork 사용자가 직접 작성* 한 컴포넌트 기준. shadcn/ui 같은 *복사된* 컴포넌트는 등록 책임이 모호 — 사용자 결정 영역 (ADR-027 결정 #12 *shadcn/ui 권장이지 강제 아님* 정합).
- **Codex parity 측면**: 본 가이드의 핵심 enforcement 변경은 `.claude/skills/` + `.claude/agents/` 에 박힘. Codex wrapper 는 delegate-only 이므로 자동 mirror — 단 Codex 환경에서 *실제* enforcement 가 동일 동작하는지는 ADR-010 multi-tool parity 라운드에서 별도 검증 필요.
