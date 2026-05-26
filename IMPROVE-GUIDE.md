# IMPROVE-GUIDE (Part 1 / 2) — 철학·정확성 + 학습 루프 기반

> 이 문서는 보일러플레이트 장기 운영 빈틈을 메우기 위한 **실행 가이드**다. 위에서 아래로 순서대로 따라가면 모든 개선이 완료된다.
> Part 1은 Step 1~7 (P0 정확성·철학 + 학습 루프 기반), Part 2(`IMPROVE-GUIDE2.md`)는 Step 8~18 (가치형 확장 + 위생).
> **Part 2는 Part 1의 산출물(특히 Step 5 researcher, Step 6 Evidence Log)에 의존한다 — Part 1을 먼저 끝낸다.**

---

## 0. 사용법 · 공통 규약

### 0-1. 사용법
- 각 Step은 **목적 → 대상 파일 → 변경 (Before/After 또는 신규 파일 전문) → SSOT 후속 → 커밋 메시지** 순서다.
- "기존 (Before)" 블록은 **현재 파일에 있는 정확한 텍스트**다. 그대로 찾아서 "변경 후 (After)"로 바꾼다.
- 신규 파일은 코드블록 전문을 그대로 새 파일로 저장한다.
- 커밋은 각 Step 끝의 한 줄 메시지를 쓴다 (ADR-008 Conventional Commits). 본문/footer는 자유, footer에 `Refs: ADR-0NN` 권장.
- 한 Step 안의 변경은 한 커밋으로 묶는다. Step 경계에서 커밋한다.

### 0-2. 공통 규약 — SSOT 후속 체크리스트 (skill/agent/ADR 추가 시 매번)
이 보일러플레이트는 SSOT(ADR-005)와 canonical owner 표를 엄격히 운영한다. **신규 산출물·정책을 추가할 때마다 아래를 갱신**한다. 각 Step의 "SSOT 후속"에 무엇을 갱신할지 명시했다.
- 신규 skill/agent → `docs/00-meta/STRUCTURE.md` 산출물 표에 행 추가 + (skill 본문 줄·agent 종수 카운트 문자열 갱신).
- 신규 ADR → `docs/90-decisions/boilerplate/README.md` 인덱스 표에 행 추가.
- ADR amendment → README 인덱스의 해당 행 `Amendments` 컬럼 갱신.
- cross-surface 정책 → STRUCTURE.md `## Canonical Owner 매핑` 표에 행 추가/갱신.
- 신규 위임 트리거 → `docs/00-meta/DELEGATION_STRATEGY.md` 위임 트리거 표.

### 0-3. Step 인덱스 & 의존 관계
```
[P0 정확성·철학]
 Step 1  Workitem Type 필드 + bugfix 트러블슈팅 템플릿        (독립)
 Step 2  implement ambiguity 하드스탑 + ADR-006 amend2        (독립, Step 7-D가 참조)
 Step 3  validate/finalize: 스택확정 후 validate 부재=실패     (독립)
 Step 4  finalize --apply 사유 commit-body 강제               (Step 3과 같은 파일·ADR)
[P1 학습 루프 기반]
 Step 5  researcher agent + research-pack skill               (Step 7-C·8·10이 의존)
 Step 6  DISCOVERY Evidence Log/Insight Backlog + ADR-035amd2 (Step 7-A·9가 의존)
 Step 7  plan-workitem 업그레이드 (type/evidence/docs-check/ambiguity)
          └ 의존: Step 1(type) · Step 2(ambiguity) · Step 5(researcher) · Step 6(evidence)
```
> Step 5·6은 상호 독립(순서 무관). Step 7은 1·2·5·6 모두 완료 후.

Part 2(Step 8~18)는 `IMPROVE-GUIDE2.md` 참조.

---

## Step 1 — Workitem `Type` 필드 + bugfix 트러블슈팅 템플릿 (P0)

**목적:** 순수 개발 작업(SDK 추가·로깅·의존성), 버그픽스, 리팩토링, 마이그레이션, 리서치 스파이크가 워크아이템 체계에 1급 자리를 갖게 한다. 새 skill/agent 없이 *분류 필드 하나*로 해결(단순성 1순위). bugfix 타입은 트러블슈팅 절차를 task 안에 박아 "증상→근본원인→회귀테스트" 흐름을 강제한다.

### 1-A. 신규 파일: `docs/90-decisions/boilerplate/ADR-039-workitem-type.md`
아래 전문을 새 파일로 저장한다.

````markdown
# ADR-039 — Workitem Type 분류

> scope: boilerplate

## 상태
accepted

## 배경
- [관측됨] FEATURE_TEMPLATE는 `## 2. 사용자 가치 (User Story)`(persona + benefit)를 요구한다. 그래서 순수 기술 작업(분석 SDK 추가, 로깅, 의존성 업그레이드, CI), 버그픽스, 대형 리팩토링, 스택 마이그레이션, 리서치 스파이크는 워크아이템 체계에 *1급 자리가 없다* → M1-foundation에 욱여넣거나 억지 User Story를 발명하게 된다.
- [관측됨] 트러블슈팅(증상만 있고 AC가 없는 작업)은 `repair-workitem`(이미 알려진 검증 실패 수정)과 다른 흐름인데 전용 자리가 없다.
- [외부실증] Conventional Commits의 `fix`/`refactor`/`chore`/`build`/`ci` 타입, dual-track agile의 enabler 개념 — 작업 종류 어휘는 이미 표준화돼 있다.

## 결정
1. `TASK_TEMPLATE.md`와 `FEATURE_TEMPLATE.md`에 선택 필드 **`Type:`** 를 추가한다. 값: `feature | technical-enabler | bugfix | refactor | migration | research-spike`. 미기재 시 기본 `feature`.
2. 타입별 규칙:
   - **feature**: User Story 필수(기존 그대로).
   - **technical-enabler**: User Story 대신 *기술적 근거(Technical rationale)* 한 줄 + *어떤 가정/기회/상위 결정을 서비스하는지* 링크(DISCOVERY assumption/insight ID 또는 ADR). 시나리오는 "N/A — 내부".
   - **bugfix**: TASK `## 3. 구현 항목` 대신 트러블슈팅 sub-template(증상/재현/기대·실제/관측/가설/root cause/회귀 테스트 AC)을 채운다. AC는 *회귀 방지 테스트* 형태.
   - **refactor**: 외부 행동 불변 명시. AC는 "행동 동일 + 구조 개선 측정"(예: 중복 N→1, 함수 길이↓). ADR-006 Surgical Changes 정합.
   - **migration**: bootstrap-stack `--migrate` contract(ADR-041)와 연결. 단독 마이그레이션 task는 expand-contract 단계를 `## 3`에 명시.
   - **research-spike**: 산출은 코드가 아니라 *리서치 노트*(research-pack, ADR-040)와 연결. TDD opt-out 기본(사유=탐색, follow-up=후속 구현 task).
3. `/plan-workitem`이 `Type:`을 읽어 분해·self-check를 라우팅한다(ADR-026 정합 — 적용 surface는 plan-workitem SKILL).

## 근거
- 새 skill/agent를 늘리지 않고 *필드 1개*로 작업 종류 분류 → 단순성 1순위(ADR-006).
- 트러블슈팅을 `bugfix` task로 흡수해, 반복 빈도가 충분히 쌓이면 그때 `diagnose-workitem` skill로 승격(YAGNI — 지금 새 skill은 과설계).

## 결과
- 두 템플릿에 `Type:` 줄 + technical-enabler/bugfix 분기 주석.
- plan-workitem이 type 인식(적용 surface: plan-workitem SKILL의 Type 라우팅 단락).

## Ratchet 강도 (ADR-022)
- enabling (약, [관측됨]+[외부실증]) — 필드는 *선택적*, 미기재 시 기본 feature. 자동 차단 X.

## 참고
- ADR-026 (plan-workitem TASK_TEMPLATE schema), ADR-041 (migration contract), ADR-040 (research capability), ADR-006 (단순성·Surgical Changes).
````

### 1-B. `docs/30-workitems/_templates/TASK_TEMPLATE.md` 수정

**기존 (Before)** — 파일 상단:
```markdown
# T-xxx-이름

## 0. Status
draft

## 1. 작업 목적
```

**변경 후 (After)**:
```markdown
# T-xxx-이름

## 0. Status
draft

## 0-1. Type
<!-- feature | technical-enabler | bugfix | refactor | migration | research-spike. 미기재 시 feature.
     - technical-enabler: 사용자 시나리오가 없는 기술 작업(SDK/로깅/의존성/CI). ## 1에 기술적 근거 + 어떤 가정/기회(DISCOVERY assumption ID)·상위 결정(ADR)을 서비스하는지 링크.
     - bugfix: 아래 ## 3-T 트러블슈팅 sub-template을 채운다(## 3 대신).
     - refactor: 외부 행동 불변. AC는 "행동 동일 + 구조 개선 측정".
     - migration: bootstrap-stack --migrate contract(ADR-041)와 연결. expand-contract 단계를 ## 3에 명시.
     - research-spike: 산출은 리서치 노트(/research-pack, ADR-040). TDD opt-out 기본.
     정책: ADR-039. -->
feature

## 1. 작업 목적
```

다음으로, `## 3. 구현 항목` 바로 **아래**에 트러블슈팅 sub-template을 추가한다.

**기존 (Before)**:
```markdown
## 3. 구현 항목

## 4. 제외 항목
```

**변경 후 (After)**:
```markdown
## 3. 구현 항목

## 3-T. 트러블슈팅 (Type=bugfix 일 때만 — 아니면 본 섹션 삭제)
<!-- 증상만 있고 AC가 없는 작업의 root-cause 절차. 채운 뒤 회귀 테스트 AC를 ## 6에 박는다. -->
- **증상(Symptom):** <사용자가 본 잘못된 동작>
- **재현 절차(Repro):** <1. … 2. … 결정적 재현 순서>
- **기대 / 실제(Expected / Actual):**
- **관측(Observed):** <로그·에러·스택트레이스·네트워크 등 1차 증거>
- **가설(Hypotheses):** <1~3개, 각 검증 방법 1줄>
- **근본 원인(Root cause):** <확정된 원인 — 가설 검증 후 채움>
- **회귀 테스트 AC:** <이 버그를 재현하는 실패 테스트를 ## 6 AC-N으로 박는다(Red→Green)>

## 4. 제외 항목
```

### 1-C. `docs/30-workitems/_templates/FEATURE_TEMPLATE.md` 수정

**기존 (Before)**:
```markdown
# F-xxx-이름

## 0. Status
draft

## 1. 요약

## 2. 사용자 가치 (User Story)
<!-- "As a <persona>, I want to <goal>, so that <benefit>." 1개 이상.
     persona는 PROJECT_CHARTER.md `## 2.1` ID 인용 — 자체 발명 X. -->
```

**변경 후 (After)**:
```markdown
# F-xxx-이름

## 0. Status
draft

## 0-1. Type
<!-- feature | technical-enabler | bugfix | refactor | migration | research-spike. 미기재 시 feature.
     technical-enabler/bugfix/refactor/migration/research-spike 면 아래 ## 2는 "User Story" 대신
     "기술적 근거(Technical rationale)" 한 줄 + 서비스하는 가정/기회(DISCOVERY ID)·상위 결정(ADR) 링크로 채운다.
     정책: ADR-039. -->
feature

## 1. 요약

## 2. 사용자 가치 (User Story) — Type=feature 일 때
<!-- "As a <persona>, I want to <goal>, so that <benefit>." 1개 이상.
     persona는 PROJECT_CHARTER.md `## 2.1` ID 인용 — 자체 발명 X.
     Type≠feature 면 본 섹션 제목을 "기술적 근거"로 바꾸고: 무엇을/왜 + 서비스하는 DISCOVERY assumption/insight ID 또는 ADR 링크. -->
```

### 1-D. SSOT 후속
- `docs/00-meta/STRUCTURE.md` `## Canonical Owner 매핑` 표에 행 추가 (Type은 템플릿 2곳 + plan-workitem을 함께 바꾸는 cross-surface 정책) — 사실: `Workitem Type 분류 (feature/technical-enabler/bugfix/refactor/migration/research-spike)`, Canonical Owner: `ADR-039 (정책 SSOT). 적용 surface: TASK_TEMPLATE ## 0-1 + FEATURE_TEMPLATE ## 0-1 + plan-workitem Type 라우팅 — 세 surface 동기 갱신`.
- `docs/90-decisions/boilerplate/README.md` 인덱스 표 맨 아래에 행 추가:
  ```markdown
  | 039 | Workitem Type 분류 | accepted | — | task/feature에 Type 필드(feature/technical-enabler/bugfix/refactor/migration/research-spike) |
  ```

> **커밋:** `feat(workitems): add Type field and bugfix troubleshooting template (ADR-039)`

---

## Step 2 — implement ambiguity 하드스탑 + ADR-006 Amendment 2 (P0)

**목적:** *implement는 자아 없이 plan 문서만 집행한다*는 원칙을 강제한다. 현재 implement-workitem은 AC가 2+ 해석 가능하면 *스스로 해석을 골라 진행*한다(ADR-006 amend1: "자동 차단 X"). 이를 **"plan이 해석을 기록했으면 따르고, 기록이 없는데 2+ 해석이면 중단(Needs Plan Decision)"** 으로 바꾼다. ADR-006 amend1의 강도 분류를 바꾸는 것이므로 **반드시 ADR amendment를 함께 박는다.**

### 2-A. `docs/90-decisions/boilerplate/ADR-006-simplicity-and-architecture.md` 에 Amendment 2 추가
파일 맨 끝(Amendment 1 단락 다음)에 아래를 append:

````markdown
## Amendment 2 (2026-05-27) — implement 단계 ambiguity 하드스탑

### 결정
Amendment 1의 *Ambiguity surfacing*을 다음과 같이 정정한다.
- **plan 단계(planner)**: AC가 2+ 해석 가능하면 plan-workitem 9-1 self-check가 *해석안 + 권장 선택*을 "남은 미결정 사항"에 박는다(기존 유지). **추가**: 권장 선택을 채택했으면 해당 task `## 8. 메모`에 `해석 확정: AC-N = <선택>` 한 줄로 *기록*한다(implement가 따를 근거).
- **implement 단계(builder)**: builder는 먼저 task `## 8. 메모`의 `해석 확정:` 기록을 찾는다.
  - 기록 있음 → 그 해석을 *기계적으로 따른다*(자체 재해석 X).
  - 기록 없음 + 2+ 해석이 *구현을 실질적으로 다르게* 만듦(사소한 표현 차이는 제외) → **구현을 시작하지 않고 `Needs Plan Decision`으로 종료**한다. 출력에 해석안을 나열하고 `/repair-plan <id>`(cross-review 했을 때) 또는 `/plan-workitem <id>` 재실행으로 해석을 확정하도록 안내한다.

### 강도 분류 (ADR-022 정합) — Amendment 1에서 변경
- Amendment 1은 implement의 ambiguity를 *enabling(약)* 으로 뒀다.
- 본 Amendment 2는 *plan 결정 부재 + 2+ 해석이 **구현 결과를 실질적으로 다르게** 만드는 경우*에 한해 **constraint(강)** 으로 승격한다. 사소한 표현 차이(동일 구현으로 수렴)는 해당 없음 — false-stop 회피.
- 근거 라벨 `[외부실증]`: *실행자가 모호성을 침묵 속에 자체 해석하면 결함이 새어든다*는 실패 모드는 amend1이 인용한 Karpathy silent-assumption testimony로 뒷받침된다(ADR-022 constraint 요건 충족).
- `context: fork`라 실시간 질의 불가 → *차단 = 종료 + 안내*이지 무한 대기 아님. plan 9-1/Step 7-D가 해석을 선기록하면 hard-stop은 거의 발화 안 함(2-layer 예방).

### 적용 surface
- [.claude/skills/implement-workitem/SKILL.md](../../../.claude/skills/implement-workitem/SKILL.md) — ambiguity 단계 재작성.
- [.claude/agents/builder.md](../../../.claude/agents/builder.md) — ambiguity 규칙 1줄 교정.
- [.claude/skills/plan-workitem/SKILL.md](../../../.claude/skills/plan-workitem/SKILL.md) — 9-1에 "해석 확정 기록" 1줄.

### 근거
- 사용자 의도: implement/finalize는 *기계적*, plan/validate가 *사고* 담당. implement가 해석을 자체 결정하면 그 경계가 무너진다.
- 2-layer 방어 유지: plan 9-1이 1차로 해석을 확정 → implement는 그 결정을 *집행만*. plan이 놓쳤을 때만 implement가 중단해 plan으로 되돌린다.
````

### 2-B. `.claude/skills/implement-workitem/SKILL.md` 수정

**기존 (Before)** — 41~44줄:
```markdown
AC가 2+ 해석이 가능하다고 판단되면 해석안을 1~3개 나열하고
*자기가 선택한 해석*을 표시한다(예: "해석 A를 따른다 — 이유: ...").
자동 차단 X — 사용자가 출력 보고 차단/수정 결정 (ADR-006 amend1 ambiguity surfacing).
```

**변경 후 (After)**:
```markdown
AC 해석 처리 (ADR-006 amend2 — 하드스탑):
1. 먼저 task `## 8. 메모`의 `해석 확정: AC-N = <선택>` 기록을 찾는다.
   - 기록 있음 → 그 해석을 *기계적으로 따른다*. 자체 재해석 금지.
2. 기록 없음 + 2+ 해석이 *구현을 실질적으로 다르게* 만듦(사소한 표현 차이는 제외) → **구현을 시작하지 않고 `Needs Plan Decision`으로 즉시 종료**한다.
   - 출력에 해석안 1~3개를 나열하고, `/plan-workitem <id>` 재실행(또는 cross-review 했으면 `/repair-plan <id>`)으로 해석을 확정하도록 안내한다.
   - builder는 *자기 해석을 골라 진행하지 않는다* (자아 차단 — plan이 사고, implement는 집행). 단 해석 차이가 사소(동일 구현 수렴)하면 멈추지 말고 진행.
```

### 2-C. `.claude/agents/builder.md` 수정

**기존 (Before)** — 56줄:
```markdown
- AC가 Given-When-Then 형식이 아니거나 강력 금지 verb 사용 시 Red phase 진입 직전에 *재분해 요청 텍스트*를 출력 — 자동 차단은 하지 않고 사용자가 진행/재분해 결정 (ADR-007 lifecycle 정합 — 자동 차단 X).
```

**변경 후 (After)**:
```markdown
- AC가 Given-When-Then 형식이 아니거나 강력 금지 verb 사용 시 Red phase 진입 직전에 *재분해 요청 텍스트*를 출력 — 자동 차단은 하지 않고 사용자가 진행/재분해 결정 (ADR-007 lifecycle 정합 — 자동 차단 X).
- **AC ambiguity 하드스탑 (ADR-006 amend2)**: task `## 8. 메모`에 `해석 확정:` 기록이 있으면 그 해석을 기계적으로 따른다. 기록이 없고 *2+ 해석이 구현을 실질적으로 다르게 만들면*(사소한 표현 차이는 제외) *자기 해석을 고르지 말고* `Needs Plan Decision`으로 종료 + plan 재실행 안내. implement는 집행 전용 — 해석 결정은 plan 책임.
```

### 2-D. SSOT 후속
- `docs/90-decisions/boilerplate/README.md` 인덱스 ADR-006 행 `Amendments` 컬럼:
  - **기존:** `(+amend1: Surgical Changes + ambiguity surfacing)`
  - **변경 후:** `(+amend1: Surgical Changes + ambiguity surfacing, +amend2: implement ambiguity 하드스탑)`

> **커밋:** `feat(implement): hard-stop on unresolved AC ambiguity, defer to plan (ADR-006 amend2)`

---

## Step 3 — validate/finalize: 스택 확정 후 `validate` 부재 = 실패 (P0)

**목적:** 장기 운영에서 누군가 `validate` 명령 wiring을 빠뜨리면 검증이 *조용히 skip*되어 게이트가 무력화된다. **스택이 확정된 프로젝트**(= `docs/00-meta/STACK_SETUP_PLAN.md`가 존재)에서는 `validate` 부재를 skip이 아니라 `Needs Stack Guard`로 처리한다. 스택 미정 프로젝트는 기존대로 skip.

### 3-A. `docs/90-decisions/boilerplate/ADR-007-workitem-lifecycle.md` 에 Amendment 3 추가
파일 맨 끝에 append:

````markdown
## Amendment 3 (2026-05-27) — validate 게이트 강화 + finalize --apply 사유

### 결정
1. **validate 부재 게이트** — `/validate-workitem`·`/finalize-workitem`의 통합 검증 명령 단계에서, *스택 확정 신호*(`docs/00-meta/STACK_SETUP_PLAN.md` 존재)가 있는데 `validate` 명령(`pnpm/npm/make/task validate`)이 없으면 **skip이 아니라 `Needs Stack Guard`로 종료**하고 `/stack-guard` 실행을 안내한다. STACK_SETUP_PLAN.md가 없으면(스택 미정) 기존대로 skip.
2. **finalize --apply 사유** — `/finalize-workitem --apply`는 사용자가 **`--rationale "<왜 4-1과 다른지>"`** 를 함께 넘겨야 한다(`$ARGUMENTS`에서 파싱). finalize는 이 사유를 커밋 body의 `--apply rationale: <...>` 줄에 기록한다. `--apply`인데 `--rationale`이 없으면 finalize는 **사유를 스스로 만들지 않고**(executor가 사유를 발명하면 다시 "자아") `Needs Rationale`로 종료하고 `--rationale` 동봉 재실행을 안내한다.

### 근거
- [관측됨] validate 부재 silent skip은 스택 확정 프로젝트에서 *기계 게이트가 항상 켜져 있다*는 보장을 깬다(A13 장기 운영 리스크).
- [관측됨] `--apply`는 실제 변경을 신뢰하므로 남용 시 finalize에 "자아"가 생긴다 — commit body 사유 강제로 추적성 확보(ADR-008 Refs footer 정신).

### 강도 (ADR-022)
- constraint(강, [관측됨]) — 둘 다 종료/강제. 단 스택 확정 신호가 있을 때만(green-field 미정 프로젝트 면제).

### 적용 surface
- [.claude/skills/validate-workitem/SKILL.md](../../../.claude/skills/validate-workitem/SKILL.md) step 1
- [.claude/skills/finalize-workitem/SKILL.md](../../../.claude/skills/finalize-workitem/SKILL.md) — validate 단계 + `--apply` 플래그 정의 + 커밋 메시지 단계
````

### 3-B. `.claude/skills/validate-workitem/SKILL.md` 수정

**기존 (Before)** — 20~21줄:
```markdown
1. 통합 검증 명령(`pnpm validate` / `npm run validate` / `make validate` / `task validate` 중 하나)이 있으면 실행하고 stdout/stderr를 수집한다. 없으면 이 단계는 건너뛴다.
   - 다른 빌더(`bun validate`, `mise run validate`, `just validate` 등)를 쓰는 스택은 본 skill의 `allowed-tools`에 해당 패턴(`Bash(bun validate)` 등)을 추가해야 자동 실행된다. 추가하지 않으면 이 단계는 건너뛰고 정적 판정만 한다.
```

**변경 후 (After)**:
```markdown
1. 통합 검증 명령(`pnpm validate` / `npm run validate` / `make validate` / `task validate` 중 하나)이 있으면 실행하고 stdout/stderr를 수집한다.
   - **명령이 없을 때 (ADR-007 amend3)**: `docs/00-meta/STACK_SETUP_PLAN.md`가 *존재*하면(스택 확정) skip하지 않고 **`Needs Stack Guard`로 종료** + `/stack-guard` 실행 안내. STACK_SETUP_PLAN.md가 *없으면*(스택 미정) 기존대로 이 단계 skip하고 정적 판정만 한다.
   - 다른 빌더(`bun validate`, `mise run validate`, `just validate` 등)를 쓰는 스택은 본 skill의 `allowed-tools`에 해당 패턴(`Bash(bun validate)` 등)을 추가해야 자동 실행된다.
```

### 3-C. `.claude/skills/finalize-workitem/SKILL.md` 수정

**기존 (Before)** — 22~23줄:
```markdown
   - `--changed` 옵션 지원 시 `validate --changed`로 변경 파일만 빠르게 검증 권장 (ADR-020). full validate는 `/stabilize-milestone`에서 실행.
   - 실패 → `Needs Fix`로 종료. 커밋하지 않음. `/repair-workitem <task-id>`를 텍스트로 제안.
   - 통합 명령이 없으면(스택 미정) 이 단계는 건너뛴다.
```

**변경 후 (After)**:
```markdown
   - `--changed` 옵션 지원 시 `validate --changed`로 변경 파일만 빠르게 검증 권장 (ADR-020). full validate는 `/stabilize-milestone`에서 실행.
   - 실패 → `Needs Fix`로 종료. 커밋하지 않음. `/repair-workitem <task-id>`를 텍스트로 제안.
   - **통합 명령이 없을 때 (ADR-007 amend3)**: `docs/00-meta/STACK_SETUP_PLAN.md`가 존재하면(스택 확정) **`Needs Stack Guard`로 종료** + `/stack-guard` 안내. STACK_SETUP_PLAN.md가 없으면(스택 미정) 이 단계 skip.
```

### 3-D. SSOT 후속
- `docs/90-decisions/boilerplate/README.md` 인덱스 ADR-007 행 `Amendments` 컬럼:
  - **기존:** `(+amend1: lock file whitelist 11종, +amend2: agent 단위 판정 경계 SSOT)`
  - **변경 후:** `(+amend1: lock file whitelist 11종, +amend2: agent 단위 판정 경계 SSOT, +amend3: validate 게이트 강화 + finalize --apply 사유)`

> **커밋:** `feat(validate): treat missing validate command as failure once stack is set (ADR-007 amend3)`

---

## Step 4 — finalize `--apply` 사유 commit-body 강제 (P0)

**목적:** Step 3의 ADR-007 amend3 결정 2를 finalize 본문에 적용. (ADR·README는 Step 3에서 이미 갱신됨 — 본 Step은 skill 본문만.)

### 4-A. `.claude/skills/finalize-workitem/SKILL.md` 수정

**(1) frontmatter `argument-hint` 변경**:
- **기존:** `argument-hint: "[task identifier(s)] [--apply]"`
- **변경 후:** `argument-hint: "[task identifier(s)] [--apply --rationale \"<why>\"]"`

**(2) `--apply` 플래그 설명 — 기존 (Before)** — 16줄:
```markdown
- 선택 플래그 `--apply` — task 문서 `## 4-1. 변경 예정 파일/경로`와 git 실제 변경이 어긋나도 git 실제 변경을 신뢰하고 진행(아래 5-(4) 차이 처리에서 종료하지 않는다). 단 민감 경로 가드는 그대로 적용된다.
```

**변경 후 (After)**:
```markdown
- 선택 플래그 `--apply` — task 문서 `## 4-1. 변경 예정 파일/경로`와 git 실제 변경이 어긋나도 git 실제 변경을 신뢰하고 진행(아래 5-(4) 차이 처리에서 종료하지 않는다). 단 민감 경로 가드는 그대로 적용된다.
  - **사유 입력 (ADR-007 amend3)**: `--apply`는 사용자가 **`--rationale "<왜 4-1과 다른지>"`** 를 함께 넘겨야 한다(`$ARGUMENTS` 파싱). finalize는 이 사유를 커밋 body의 `--apply rationale: <...>` 줄에 기록한다. `--apply`인데 `--rationale`이 없으면 **사유를 스스로 만들지 않고** `Needs Rationale`로 종료 + `--rationale` 동봉 재실행 안내(executor가 사유를 발명하면 다시 "자아"가 생긴다).
```

**기존 (Before)** — 47~48줄 (step 7 커밋 메시지 단락):
```markdown
   - 본문에 변경 요약 한 단락 + task ID 참조.
   - footer에 `Refs: T-NNN (AC-X, AC-Y)` 형식 포함 (ADR-008 amend 2). 누락 시 *footer 추가 권장 텍스트* 출력 — 자동 차단은 하지 않음 (사용자 결정).
```

**변경 후 (After)**:
```markdown
   - 본문에 변경 요약 한 단락 + task ID 참조.
   - **`--apply` 모드면** body에 사용자가 넘긴 `--rationale` 값을 `--apply rationale: <...>` 한 줄로 포함 (ADR-007 amend3). `--rationale` 부재 시 `Needs Rationale` 종료(커밋 X).
   - footer에 `Refs: T-NNN (AC-X, AC-Y)` 형식 포함 (ADR-008 amend 2). 누락 시 *footer 추가 권장 텍스트* 출력 — 자동 차단은 하지 않음 (사용자 결정).
```

> **커밋:** `feat(finalize): require commit-body rationale when --apply overrides 4-1`

---

## Step 5 — `researcher` agent + `research-pack` skill (P1)

**목적:** 6개 에이전트 중 *어느 것도 웹 접근이 없다*. 이 하나가 (a) 구현 중 외부 라이브러리 최신 공식문서 확인, (b) 기획용 딥리서치, (c) 스택 추천 그라운딩(Step 8), (d) MCP 최신 설정 조회(Part 2 Step 10)를 동시에 푼다. 웹 도구는 *새 권한 표면*이라 기존 에이전트에 붙이지 않고 *최소권한 전용 에이전트*로 격리한다(Anthropic context 가이드: 리서치는 서브에이전트 정전 용도 — 검색 노이즈를 메인에서 격리, 결론만 반환).

### 5-A. 신규 파일: `docs/90-decisions/boilerplate/ADR-040-external-research-capability.md`
````markdown
# ADR-040 — 외부 리서치 capability (researcher agent + research-pack)

> scope: boilerplate

## 상태
accepted

## 배경
- [관측됨] 기존 6개 agent(architect/planner/builder/validator/reviewer/qa)의 tools에 WebSearch/WebFetch가 없다 → 구현 중 외부 라이브러리(결제/인증/SDK)의 *최신 공식문서*를 확인할 수 없고, 모델 지식 컷오프로 stale API를 쓸 위험이 있다.
- [관측됨] 딥리서치·스택 추천·MCP 최신 설정 조회 모두 "사용자가 직접 붙여넣기"에만 의존.
- [외부실증] Anthropic "Effective context engineering" / subagent 가이드 — 리서치/딥다이브는 서브에이전트의 정전(canonical) 용도(탐색 노이즈 격리, 1,000~2,000 토큰 요약만 반환).

## 결정
1. **`researcher` agent 신설** — tools: `Read, Glob, Grep, WebSearch, WebFetch`. **코드·문서 직접 수정 권한 없음(Write/Edit 없음)** = report-only. model: sonnet. context-pack: minimal.
2. **`research-pack` skill 신설** — 메인 세션에서 실행(discover-product 패턴, `context: fork`/`agent:` 미지정). 무거운 웹 조사는 **researcher agent에 `Agent` 위임**(노이즈 격리, 결론만 반환), 반환된 결론으로 리서치 노트 1개를 `docs/10-charter/insights/<date>-<slug>.md`에 작성(Write는 본 skill의 allowed-tools, 대상은 insights/ 단일 위치). **researcher agent는 report-only(Write 없음) 유지** — 노트 작성은 research-pack skill의 책임이라 `agent: researcher`와 Write 권한이 충돌하지 않는다.
3. **신뢰도·출처 규율**: 모든 발견에 출처 URL + 발행일 + *공식/1차/2차* 신뢰도 라벨 + "제품에 대한 추론"(사실과 분리). 외부 리서치 결과는 DISCOVERY Evidence Log(ADR-035 amend2)의 `external-research` type 항목으로 연결.
4. **`data-analyst`·별도 insight agent는 만들지 않는다** — insight 합성은 discover-product/--update의 한 단계(skill)로 충분(역할 중복·복잡도 회피).
5. **위임 경로**: implement-workitem이 외부 라이브러리 불확실성에 부딪히면 builder가 직접 웹서핑하지 않고 *메인 세션이 researcher에 위임*(builder 컨텍스트 오염 회피). MCP 연결 절차(ADR-043)·bootstrap-stack --recommend(ADR-041)도 researcher로 최신 설정/지형을 조회한다 — fork+Agent 미보유 skill(bootstrap-stack 등)은 *사전 `/research-pack` 노트*를 참조하는 방식.

## 근거
- 웹 도구를 기존 agent(예: reviewer)에 붙이면 그 agent의 권한 표면이 부적절히 넓어진다(reviewer가 코드리뷰 중 웹서핑 = scope creep). 전용 최소권한 agent가 더 깨끗하다.
- agent는 1개만 추가(researcher) — debugger·data-analyst는 만들지 않음(ADR-006 단순성, 역할 중복 회피).

## 결과
- `.claude/agents/researcher.md`, `.claude/skills/research-pack/SKILL.md`, `docs/10-charter/insights/` 디렉터리.

## Ratchet 강도 (ADR-022)
- enabling (약) — 새 capability, opt-in. 단 researcher의 "report-only(코드/문서 미수정)"는 constraint(약) 가드.

## 참고
- ADR-035 (Evidence Log 연결), ADR-041 (스택 추천 그라운딩), ADR-043 (MCP 설정 조회), ADR-019 (context-pack minimal).
````

### 5-B. 신규 파일: `.claude/agents/researcher.md`
````markdown
---
name: researcher
description: Use for gathering and distilling external information — official docs, primary sources, papers — when implementation or planning needs current, citable facts. Report-only; never edits code or docs.
tools: Read, Glob, Grep, WebSearch, WebFetch
model: sonnet
maxTurns: 12
color: white
context-pack: minimal
---

너는 외부 리서치 전담 에이전트다. **코드·문서를 수정하지 않는다 (report-only).**

역할:
- 공식문서 / 1차 자료 / 논문 / 신뢰할 만한 레퍼런스를 수집·요약한다.
- 구현에 필요한 외부 라이브러리·API의 *최신* 사용법을 확인한다(모델 지식 컷오프 보완).
- 기획용 딥리서치 — 시장·경쟁·기술 동향을 1차 자료 기준으로 정리한다.

규칙:
- **신뢰도 라벨 필수**: 각 발견에 출처 URL + 발행일 + `[공식]`/`[1차]`/`[2차]` 라벨.
- **사실과 추론 분리**: "출처가 말한 것" vs "제품에 대한 나의 추론"을 별도 단락으로.
- 출처가 오래됐거나 상충하면 그 사실을 명시한다 — 추측을 사실처럼 쓰지 않는다.
- 공식 1차 출처를 2차 블로그보다 우선한다.
- 검색·탐색의 긴 과정은 본 에이전트 안에 두고, 메인에는 *증류된 결론만* 반환한다.

출력:
- 핵심 발견(신뢰도 라벨 포함) 최대 7개.
- "제품/구현에 대한 시사점(so-what)" 단락.
- 출처 목록(URL + 발행일).
- 시간/턴 부족 시 확인된 범위까지 요약하고 종료.

## 출력 cap
반환 요약은 1,000~2,000 토큰. 긴 탐색은 본 sub-agent 안에 둔다(메인 컨텍스트 토큰 경합 방지 — Anthropic 가이드).
````

### 5-C. 신규 파일: `.claude/skills/research-pack/SKILL.md`
````markdown
---
name: research-pack
description: 외부 공식문서·1차 자료·논문을 조사해 신뢰도 라벨이 붙은 리서치 노트를 작성한다. 기획 evidence 또는 구현 전 docs 확인용. (report + 노트 작성 전용 — 코드·기획 문서 수정 X)
argument-hint: "[research question or topic]"
disable-model-invocation: true
allowed-tools: Read Glob Grep WebSearch WebFetch Write Agent
context-pack: minimal
---

이 skill은 **리서치 + 노트 작성 전용**이다. 코드·workitem·charter 문서를 수정하지 않는다 (노트 파일 1개만 작성).
> 메인 세션에서 실행한다(`context: fork`/`agent:` 미지정 — discover-product 패턴). 무거운 웹 조사는 researcher agent에 `Agent` 위임해 메인 컨텍스트 오염을 막는다. researcher는 report-only이고, 노트 Write는 본 skill이 한다.

너의 역할은 입력 질문을 *1차/공식 출처* 기준으로 조사해 신뢰도 라벨이 붙은 리서치 노트를 작성하는 것이다.

입력:
- `$ARGUMENTS`에 리서치 질문/주제가 들어온다 (예: "Stripe Payment Intents 최신 idempotency 정책", "회고 SaaS 경쟁 제품 onboarding 패턴").

반드시 할 일:
1. 질문을 검증 가능한 하위 질문 2~4개로 쪼갠다.
2. **조사**: 무거운 웹 조사는 researcher agent에 `Agent` 위임(노이즈 격리 — 결론 1~2K 토큰만 반환). 가벼운 단건 확인은 본 skill의 WebSearch/WebFetch로 직접. *공식문서·1차 자료·논문* 우선, 2차 블로그는 보조.
3. 각 발견에 출처 URL + 발행일 + `[공식]`/`[1차]`/`[2차]` 신뢰도 라벨.
4. "사실"과 "제품/구현 시사점(추론)"을 분리한다.

마지막 단계 — 리서치 노트 작성:
- 경로: `docs/10-charter/insights/<YYYY-MM-DD>-<slug>.md` (slug는 주제 kebab-case).
- 양식:

```markdown
# Research: <주제>

- 작성일: <YYYY-MM-DD>
- 질문: <원 질문>
- type: research | external-research

## 발견 (신뢰도 라벨)
- [공식] <발견> — <URL> (<발행일>)
- [1차] ...
- [2차] ...

## 사실 ↔ 추론 분리
- 사실: ...
- 제품/구현 시사점(추론): ...

## DISCOVERY 연결 제안
- Evidence Log(§14) 추가 후보: source=<URL>, type=external-research, finding=<...>, confidence=<상/중/하>
- 관련 가정/기회: <A-N 또는 신규>
```

마지막 출력 (메인에 텍스트로):
- 노트 경로
- 핵심 발견 3개 + 신뢰도 라벨
- DISCOVERY Evidence Log 반영 권장 (자동 반영 X — `/discover-product --update`가 회수)

가드:
- workitem / charter / 코드 일체 수정 금지 (insights/ 노트 1개만 Write).
- 추측을 사실처럼 쓰지 않는다. 출처 없는 주장 금지.

## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 자료는 발화 시 인용 — 사전 fork-load 금지.
````

### 5-D. SSOT 후속
1. `docs/00-meta/STRUCTURE.md` 산출물 표 — **Claude sub-agent 행과 skill 행 수정 + 신규 행 2개 추가.**

   **기존 (Before)** — 33~34줄:
   ```markdown
   | Claude skill 본문 | `.claude/skills/<name>/SKILL.md` (15종 — bootstrap-project/bootstrap-stack/bootstrap-design/discover-product/plan-workitem/validate-plan/repair-plan/implement-workitem/validate-workitem/repair-workitem/finalize-workitem/stabilize-milestone/stack-guard/review-doc/boilerplate-context) | 수동 (boilerplate 제공) | Reference | baseline |
   | Claude sub-agent | `.claude/agents/<name>.md` (6종: architect/builder/validator/planner/reviewer/qa) | 수동 (boilerplate 제공) | Reference | baseline |
   ```
   **변경 후 (After)** (research-pack 추가로 16종; Step 18에서 validate-discovery/repair-discovery 2종이 더해져 최종 18종):
   ```markdown
   | Claude skill 본문 | `.claude/skills/<name>/SKILL.md` (16종 — bootstrap-project/bootstrap-stack/bootstrap-design/discover-product/plan-workitem/validate-plan/repair-plan/implement-workitem/validate-workitem/repair-workitem/finalize-workitem/stabilize-milestone/stack-guard/review-doc/boilerplate-context/research-pack) | 수동 (boilerplate 제공) | Reference | baseline |
   | Claude sub-agent | `.claude/agents/<name>.md` (7종: architect/builder/validator/planner/reviewer/qa/researcher) | 수동 (boilerplate 제공) | Reference | baseline |
   ```
2. `docs/00-meta/STRUCTURE.md` 산출물 표에 **신규 행 추가** (discovery template 행 근처):
   ```markdown
   | research note | `docs/10-charter/insights/<date>-<slug>.md` | `/research-pack` | Record | generated |
   ```
3. `docs/00-meta/DELEGATION_STRATEGY.md` 위임 트리거 표에 행 추가 (37줄 "장문 코드/문서 탐색" 행 위/아래):
   ```markdown
   | 외부 공식문서·1차 자료·논문 조사 (구현/기획) | researcher | report-only(코드·문서 미수정). 결과는 insights/ 노트 + DISCOVERY Evidence Log 연결. `/research-pack` 또는 메인이 Agent 위임 (ADR-040). |
   ```
4. `docs/90-decisions/boilerplate/README.md` 인덱스에 행 추가:
   ```markdown
   | 040 | 외부 리서치 capability | accepted | — | researcher agent + /research-pack skill, report-only 웹 접근 |
   ```
5. `docs/10-charter/insights/` 디렉터리 생성 + `.gitkeep` 파일 추가(빈 디렉터리 보존).

> **커밋:** `feat(research): add researcher agent and /research-pack skill (ADR-040)`

---

## Step 6 — DISCOVERY Evidence Log / Insight Backlog + ADR-035 Amendment 2 (P1)

**목적:** "인터뷰/정량 데이터/딥리서치 → 인사이트 → 기획" 루프의 *빠진 1조각*(raw 증거 적재 자리)을 채운다. 새 폴더·파이프라인 대신 DISCOVERY.md에 표 2개를 추가하고(§14 Evidence Log, §15 Insight Backlog), 기존 §12 Assumption Tracker·§13 Opportunity Backlog와 흐름으로 연결한다. 번호는 *append*(기존 13섹션 보존, 재번호 X — drift 회피).

### 6-A. `docs/10-charter/_templates/DISCOVERY_TEMPLATE.md` 수정
파일 맨 끝(§13 Opportunity Backlog 표) **다음**에 append:

````markdown

## 14. Evidence Log
<!-- raw 증거 적재(인터뷰 요약·정량 지표 스냅샷·딥리서치). Evidence → Insight(§15) → Assumption(§12)/Opportunity(§13) 흐름의 입구.
     /discover-product --update 가 새 증거를 회수해 §15·§12·§13을 갱신. /research-pack 노트(docs/10-charter/insights/)도 external-research 항목으로 옮긴다.
     type: qual(인터뷰·관찰) | quant(지표·실험) | research(내부 정리) | external-research(외부 1차 자료). 정책: ADR-035 amend2. -->
| ID  | source | date | type | finding | linked (A-N 가정 / I-N 인사이트) | confidence |
|-----|--------|------|------|---------|------------------------------|-----------|
| E-1 | (예: 사용자 인터뷰 5명) | 2026-05-27 | qual | (예: 3/5가 주간 갱신 안 함) | A-1 | 중 |

## 15. Insight Backlog
<!-- Evidence(§14)를 해석한 인사이트. status: open(미반영) | planned(feature 연결됨) | rejected.
     plan-workitem이 feature/task 생성 시 본 ID를 연결한다. 미반영 open 인사이트는 stabilize §6.5가 보고. -->
| ID  | insight (so-what) | 근거 evidence | status | linked feature | 비고 |
|-----|-------------------|--------------|--------|----------------|-----|
| I-1 | (예: 갱신 리마인더가 핵심 가치) | E-1 | open | - | M1 후보 |
````

### 6-B. `docs/90-decisions/boilerplate/ADR-035-continuous-discovery.md` 에 Amendment 2 추가
파일 맨 끝(Amendment 1 다음)에 append:

````markdown
## Amendment 2 (2026-05-27) — Evidence Log + Insight Backlog (데이터→인사이트→기획 루프)

### 배경
- [관측됨] DISCOVERY는 정성 발굴(persona/pain/JTBD)에서 곧장 가정으로 점프 — *raw 증거(인터뷰 원문 요약·정량 지표·딥리서치 결과)를 적재할 1급 자리*가 없었다. 검증 "결과"는 §12의 한 칸 텍스트로만 남았다.
- [외부실증] Teresa Torres Opportunity Solution Tree / Cagan dual-track — discovery는 evidence → insight → opportunity → solution 흐름이 끊기지 않아야 한다.

### 결정
1. DISCOVERY_TEMPLATE에 **§14 Evidence Log**(source/date/type/finding/linked/confidence) + **§15 Insight Backlog**(insight/근거 evidence/status/linked feature) 신설. type: `qual | quant | research | external-research`. **append(재번호 X)** — 기존 13섹션 보존, 총 **13 → 15섹션**(ADR-035 결정 1의 "13섹션" 표현을 본 amend가 갱신).
2. 흐름: Evidence(§14) → Insight(§15) → Assumption(§12)/Opportunity(§13) → feature(plan-workitem이 §15 ID 연결).
3. `/discover-product --update`가 새 증거(§14 신규 행 + `docs/10-charter/insights/` 리서치 노트)를 회수해 §15·§12·§13 갱신. `--fast --update`는 §12 + §14만 빠르게 갱신.
4. `/stabilize-milestone` §6.5 staleness에 4번째 시그널 추가: §15 Insight Backlog의 `status=open`(미반영) 인사이트 수 → 있으면 P1 보고.

### 결과
- 데이터/인터뷰/딥리서치가 같은 입구(§14)로 수렴 → 반복 루프(계측→데이터→증거→인사이트→기획)가 닫힌다.

### Ratchet 강도 (ADR-022)
- enabling(약, [관측됨]+[외부실증]) — 표는 선택적 채움, 자동 차단 X.

### 적용 surface
- `docs/10-charter/_templates/DISCOVERY_TEMPLATE.md` §14·§15
- `.claude/skills/discover-product/SKILL.md` --update 단락
- `.claude/skills/stabilize-milestone/SKILL.md` §6.5
- `.claude/skills/plan-workitem/SKILL.md` feature/task evidence 연결
````

### 6-C. `.claude/skills/discover-product/SKILL.md` 수정

**기존 (Before)** — 61~64줄:
```markdown
## --update 모드 (mid-project pivot, ADR-035)
기존 DISCOVERY.md 있으면:
- R0 (페르소나 재확인) → R1·R2 (opportunity backlog 갱신·새 pain 추가) → R3 (assumption tracker 갱신) → R4 저장.
- **`--fast --update`**: assumption tracker만 갱신 (가장 빈번한 mid-project use case).
```

**변경 후 (After)**:
```markdown
## --update 모드 (mid-project pivot, ADR-035 + amend2)
기존 DISCOVERY.md 있으면:
- **R-E (Evidence 회수)**: 지난 갱신 이후 추가된 §14 Evidence Log 신규 행 + `docs/10-charter/insights/`의 리서치 노트(/research-pack 산출)를 읽어 §15 Insight Backlog를 갱신(새 insight는 새 I-N, evidence는 §14에 적재).
- R0 (페르소나 재확인) → R1·R2 (opportunity backlog 갱신·새 pain 추가) → R3 (assumption tracker 갱신 — §14 evidence로 §12 검증 결과 갱신) → R4 저장.
- **`--fast --update`**: §12 Assumption Tracker + §14 Evidence Log만 빠르게 갱신 (가장 빈번한 mid-project use case).
```

### 6-D. `.claude/skills/stabilize-milestone/SKILL.md` 수정 (§6.5 4번째 시그널)

**기존 (Before)** — 105~109줄:
```markdown
다음 3 시그널을 점검한다 (보고만, 자동 차단 X — validator 책임 경계 정합).

1. `docs/10-charter/DISCOVERY.md`의 mtime이 `docs/10-charter/PROJECT_CHARTER.md`의 mtime보다 최신인지.
2. DISCOVERY.md `## 12. Assumption Tracker` 표에서 *"미검증"* 결과 항목 수.
3. PROJECT_CHARTER.md `## 2.1 페르소나` / `## 3.1 핵심 시나리오` / `## 9 핵심 가정` 섹션 중 비어 있거나 DISCOVERY.md와 명백히 어긋난 섹션 수.
```

**변경 후 (After)**:
```markdown
다음 4 시그널을 점검한다 (보고만, 자동 차단 X — validator 책임 경계 정합).

1. `docs/10-charter/DISCOVERY.md`의 mtime이 `docs/10-charter/PROJECT_CHARTER.md`의 mtime보다 최신인지.
2. DISCOVERY.md `## 12. Assumption Tracker` 표에서 *"미검증"* 결과 항목 수.
3. PROJECT_CHARTER.md `## 2.1 페르소나` / `## 3.1 핵심 시나리오` / `## 9 핵심 가정` 섹션 중 비어 있거나 DISCOVERY.md와 명백히 어긋난 섹션 수.
4. (ADR-035 amend2) DISCOVERY.md `## 15. Insight Backlog`에서 `status=open`(미반영) 인사이트 수 — 있으면 *"미반영 인사이트 N건 — /plan-workitem 회수 권장"* P1 보고.
```

### 6-E. SSOT 후속
- `docs/90-decisions/boilerplate/README.md` 인덱스 ADR-035 행 `Amendments` 컬럼:
  - **기존:** `(+amend1: Charter staleness 보고)`
  - **변경 후:** `(+amend1: Charter staleness 보고, +amend2: Evidence Log + Insight Backlog)`
- 같은 README ADR-035 행 `한 줄 요약` 컬럼: `13섹션` → `15섹션` 으로 수정(§14 Evidence Log + §15 Insight Backlog 반영). *Before:* `13섹션 + --update 모드 + DISCOVERY=SSOT/Charter=snapshot` → *After:* `15섹션 + --update 모드 + DISCOVERY=SSOT/Charter=snapshot`.

> **커밋:** `feat(discovery): add Evidence Log and Insight Backlog to discovery loop (ADR-035 amend2)`

---

## Step 7 — plan-workitem 업그레이드 (P1)

**목적:** plan-workitem이 (a) Evidence/Insight ID를 feature/task에 연결, (b) `Type:` 필드를 인식해 분해를 라우팅, (c) 외부 SDK/API/결제/인증 도입 task에 "최신 공식문서 확인(researcher 위임)" line item 자동 생성, (d) AC 해석을 *기록*(Step 2 하드스탑의 plan 측). **의존: Step 1·2·5·6 완료 후.**

> 주의: plan-workitem은 이미 길다(207줄, 매 호출 fork-load되는 핫스팟). 본 Step은 *최소한의 4줄급 추가*만 한다. **Step 13(지시문 다이어트)은 옵션이 아니라 본 Step의 필수 짝이다 — Step 7을 적용하면 Step 13도 반드시 함께 적용**해 순 비대를 상쇄한다(7-C 키워드 트리거가 광범위해 line item 자동 주입이 늘 수 있으므로 더더욱).

### 7-A. Evidence/Insight 연결 — `## feature 분해 시 (ADR-036)` 단락 보강

**기존 (Before)** — 81줄:
```markdown
feature 분해 시 `## 11. 관련 문서` 에 *해당 스택* 의 `Architecture-Iface:` link 와 (UI 프로젝트 한정) `Design:` link 를 채운다. TEMPLATE 의 비해당 스택 줄은 *삭제* (placeholder 잔존 X — drift 차단).
```

**변경 후 (After)**:
```markdown
feature 분해 시 `## 11. 관련 문서` 에 *해당 스택* 의 `Architecture-Iface:` link 와 (UI 프로젝트 한정) `Design:` link 를 채운다. TEMPLATE 의 비해당 스택 줄은 *삭제* (placeholder 잔존 X — drift 차단).

**Evidence/Insight 연결 (ADR-035 amend2)**: feature가 DISCOVERY `## 15. Insight Backlog`의 인사이트를 구현하는 것이면, feature `## 1. 요약`에 `근거 insight: I-N` 한 줄을 박고, 해당 Insight Backlog 행의 `status`를 `planned` + `linked feature`를 채울 것을 plan 출력에 권장(plan은 DISCOVERY를 직접 수정하지 않음 — `/discover-product --update`가 회수). **`Type: feature` 한정** — 근거 인사이트가 없는 즉흥 feature면 "남은 미결정 사항"에 `- 근거 insight 부재: F-NNN — DISCOVERY 회수 권장` 명시. technical-enabler 등 비-feature 타입은 가정/기회·ADR 링크로 정당화되므로 insight 부재 경고를 내지 않는다.
```

### 7-B. Type 인식 — `## feature 분해 시` 단락 위에 신규 단락 추가

**기존 (Before)** — 67~68줄:
```markdown
## feature 분해 시 (ADR-036)
feature 분해 시 12 main sections + `## 7-1` mapping subsection 모두 채운다.
```

**변경 후 (After)**:
```markdown
## Workitem Type 라우팅 (ADR-039)
분해된 각 feature/task의 `## 0-1. Type`을 읽어 처리를 라우팅한다 (미기재 시 feature):
- **technical-enabler**: User Story 대신 기술적 근거 + 서비스하는 가정/기회(DISCOVERY ID)·상위 결정(ADR) 링크를 채운다. 시나리오 cross-check skip.
- **bugfix**: TASK `## 3-T. 트러블슈팅`(증상/재현/관측/가설/root cause/회귀 테스트 AC)을 채운다. AC는 *버그 재현 실패 테스트* 형태로.
- **refactor**: 외부 행동 불변을 AC에 명시("행동 동일 + 구조 개선 측정"). Surgical Changes(ADR-006) 정합 — 범위 밖 변경 금지를 task `## 4`에 박는다.
- **migration**: bootstrap-stack `--migrate` contract(ADR-041)를 상위 참조로 link. expand-contract 단계를 `## 3`에 분해.
- **research-spike**: 산출은 `/research-pack` 리서치 노트(ADR-040). TDD opt-out 기본(`## 6-2`에 사유=탐색 + follow-up 구현 task).

## feature 분해 시 (ADR-036)
feature 분해 시 12 main sections + `## 7-1` mapping subsection 모두 채운다.
```

### 7-C. 외부 docs-check line item — `### 신규 인터페이스 요소 → task ## 3. 구현 항목 에 *등록 line item* authoring` 단락 보강

**기존 (Before)** — 184줄:
```markdown
**진짜 새 *primitive*** (Button/Input/Card 외 기반 컴포넌트) 는 task line item 이 아니라 architect 또는 `/bootstrap-design` 라운드 권장 (아래 `## architect 호출 권장 신호` #6 정합) — plan 은 그 권장만 출력.
```

**변경 후 (After)**:
```markdown
**진짜 새 *primitive*** (Button/Input/Card 외 기반 컴포넌트) 는 task line item 이 아니라 architect 또는 `/bootstrap-design` 라운드 권장 (아래 `## architect 호출 권장 신호` #6 정합) — plan 은 그 권장만 출력.

**외부 라이브러리 docs-check line item (ADR-040)**: task `## 2/## 3` 본문에 *외부 SDK·API·결제·인증·외부 서비스 연동* 키워드(예: `결제`, `payment`, `Stripe`, `OAuth`, `auth provider`, `SDK`, `webhook`, `외부 API`)가 등장하면, 해당 task `## 3. 구현 항목`에 line item을 자동 추가: `- 구현 전 최신 공식문서 확인 (/research-pack 또는 researcher 위임 — 모델 지식 컷오프 보완)`. builder는 이 line item을 보고 불확실하면 researcher 위임을 메인에 요청(직접 웹서핑 X).
```

### 7-D. AC 해석 기록 — `9-1. AC interpretation diversity self-check` 단락 보강

**기존 (Before)** — 48~53줄:
```markdown
- AC-N (T-NNN): 해석 A=<...>, 해석 B=<...>, 권장 선택=<...>
  (이유: charter ## 7. 제약 조건 또는 ## 5. 비목표 정합 / 비용 정합 등)

자동 차단 X — 사용자가 plan 검토 시 *해석 결정 협상*.

본 self-check가 plan 단계에서 발화하면 [implement-workitem ambiguity surfacing](../implement-workitem/SKILL.md)은
*재확인 surface*가 됨 — 2-layer defense (plan에서 잡으면 RGR 1회 절감).
```

**변경 후 (After)**:
```markdown
- AC-N (T-NNN): 해석 A=<...>, 해석 B=<...>, 권장 선택=<...>
  (이유: charter ## 7. 제약 조건 또는 ## 5. 비목표 정합 / 비용 정합 등)

자동 차단 X — 사용자가 plan 검토 시 *해석 결정 협상*.

**해석 확정 기록 (ADR-006 amend2)**: 권장 선택이 채택될 만큼 명확하면 해당 task `## 8. 메모`에 `해석 확정: AC-N = <선택>` 한 줄을 *기록*한다. 이 기록이 있으면 implement(builder)는 그 해석을 기계적으로 따르고, *기록이 없는데 2+ 해석이면 implement는 진행을 중단(Needs Plan Decision)* 한다 — plan에서 해석을 확정해 두면 implement 하드스탑을 예방한다 (2-layer defense — plan이 사고, implement는 집행).
```

### 7-E. `.claude/skills/implement-workitem/SKILL.md` — docs-check line item 수용 규칙 (ADR-040)

plan(7-C)이 박은 "최신 공식문서 확인" line item을 implement가 처리하도록 규칙 추가. **builder는 웹 접근이 없으므로 직접 조사하지 않고** 메인/사용자에게 리서치를 요청한다(7-C가 *생성*, 7-E가 *수용* — 둘이 짝이라 같은 Step·커밋으로 묶는다).

**기존 (Before)** — 74~76줄 (`## Context 정책` 단락 바로 위):
```markdown
정책 근거:
- TDD: [ADR-009-tdd-default.md](../../../docs/90-decisions/boilerplate/ADR-009-tdd-default.md)
- 단순성·Clean Code: [ADR-006-simplicity-and-architecture.md](../../../docs/90-decisions/boilerplate/ADR-006-simplicity-and-architecture.md)
```

**변경 후 (After)** (위 블록 **앞**에 한 단락 추가):
```markdown
외부 docs-check line item 처리 (ADR-040):
- task `## 3. 구현 항목`에 `구현 전 최신 공식문서 확인` line item(plan이 박음)이 있고, 그 외부 라이브러리·API의 *최신 사용법 확신*이 없으면 **구현을 시작하지 않고** 출력에 `Needs Research: <대상> — /research-pack <대상> 실행 후 재개 권장`을 명시한다. builder는 웹 접근이 없어 *직접 웹서핑하지 않는다*. 이미 확신이 있으면 line item을 체크하고 진행한다.

정책 근거:
- TDD: [ADR-009-tdd-default.md](../../../docs/90-decisions/boilerplate/ADR-009-tdd-default.md)
- 단순성·Clean Code: [ADR-006-simplicity-and-architecture.md](../../../docs/90-decisions/boilerplate/ADR-006-simplicity-and-architecture.md)
```

> **커밋:** `feat(plan): wire task types, evidence links, and external-docs delegation (plan + implement)`

---

## Part 1 완료 체크
- [ ] Step 1: TASK/FEATURE 템플릿 Type 필드 + bugfix 트러블슈팅 + ADR-039 + README
- [ ] Step 2: implement 하드스탑 + builder.md + ADR-006 amend2 + README
- [ ] Step 3: validate/finalize 게이트 강화 + ADR-007 amend3 + README
- [ ] Step 4: finalize --apply 사유 강제 (skill 본문)
- [ ] Step 5: researcher.md + research-pack/SKILL.md + ADR-040 + insights/ + STRUCTURE + DELEGATION + README
- [ ] Step 6: DISCOVERY §14/§15 + ADR-035 amend2 + discover-product + stabilize §6.5 + README
- [ ] Step 7: plan-workitem 4개 보강(7-A~7-D) + implement docs-check 수용(7-E)

**→ Part 2(`IMPROVE-GUIDE2.md`)로 계속.** Part 2는 Step 5(researcher)·Step 6(Evidence Log)에 의존한다.
