# IMPROVE-GUIDE — Signal-first 출력 개선 실행 가이드

> 성격: 임시 실행 가이드(transient). 이 문서만 보고 순서대로 따라가면 모든 개선이 완료된다.
> 개선 완료 후 이 파일은 삭제해도 된다(STRUCTURE.md 산출물 인벤토리에 등록하지 않는다).
> 작성 근거: caveman skill(github.com/JuliusBrussee/caveman) 분석 + 본 repo 실측.

---

## 0. TL;DR

문제: skill/agent 답변이 너무 길어 사용자가 피로하고 핵심이 안 읽힌다. 특히 프로젝트 초기 멀티라운드.

원인(실측):
1. 7개 서브에이전트가 전부 "반환 요약 1,000~2,000 토큰"을 허용 → 한 라운드에 여러 agent를 거치면 메인에 장문 누적.
2. `plan-workitem`이 이미 파일에 영속된 FAC↔AC 표를 대화에 통째로 echo(중복).
3. `discover-product` 라운드별 표면 출력 포맷 미규정.
4. 출력 측 정책 부재(ADR-019는 입력만 담당).

해결: caveman의 *문체*가 아니라 *정보 밀도 원칙*만 차용해 **signal-first 출력 계약**을 박는다.
핵심 안전 논리: **상세는 이미 파일(report/IMPROVEMENT_GUIDE/QA_FINDINGS/workitem 문서)에 영속**되므로, 반환·대화 출력 압축은 정보 손실이 아니라 *중복 제거*다. 라운드 수·분석 깊이는 그대로 둔다.
단, 이 논리가 성립 *안 하는* 예외(qa·reviewer·researcher가 report-only로 동작해 반환이 곧 적재 산출물인 경우 + discovery 사용자 선택지)는 §4.5에서 cap 면제·호출부 강제로 무력화했다 — 그래서 최종적으로 영향이 표면 표현에 한정되도록 설계했다("불변" 단정이 아니라 *영향 범위 한정* — 정확한 표현은 §4.5 결론).

작업량: 커밋 3개. 새 ADR 1개(ADR-046) + 기존 파일 14개 수정(7 agents + 3 skills + AGENTS.md + STRUCTURE.md + README.md + ADR-037).

---

## 1. 분석 종합 (왜 이 방향인가)

### 1-1. caveman에서 가져올 것 / 버릴 것

| caveman 요소 | 본 repo 적용 | 판정 |
|---|---|---|
| "사고는 그대로, 출력만 압축" | 라운드·분석 깊이 유지, 반환·대화 표면만 압축 | ✅ 채택 |
| auto-clarity 보존 리스트(보안/코드/경로/다단계/혼란) | 그대로 + **문서 산출물 본문** 추가 보존 | ✅ 채택(확장) |
| 정보 밀도(결론 우선, filler 제거) | signal-first 계약 | ✅ 채택 |
| 관사 생략·문장 조각·wenyan 문체 | 한국어 전문 문서/ADR에 부적합·어색 | 🚫 거부 |
| 압축 레벨(lite/full/ultra) | 단일 계약으로 충분, YAGNI(ADR-006) | 🚫 거부 |
| caveman-compress / MCP middleware / cavecrew | 과잉, AGENTS.md는 이미 ADR-011 cap으로 규율 | 🚫 거부 |

### 1-2. 공통 결론 + 본 가이드의 결정

- 공통 합의: caveman 문체 거부, 원칙만 차용, 새 ADR로 박기, 문서 본문은 압축 금지.
- 추가 채택(고레버리지): **서브에이전트 반환 cap 1,000~2,000 → 기본 ≤600 토큰** 축소.
- 안전 근거: detail은 파일에 영속됨 → 반환 압축 = 중복 제거(정보 손실 아님).

### 1-3. 변경 범위 한 눈에

```
Commit 1 (정책)   : ADR-046 신설 + ADR-037 Amendment 2(plan echo 축소 — drift 해소)
                    + README index(046 행 + 037 amend 컬럼) + STRUCTURE Canonical Owner 1행 + AGENTS.md 1섹션
Commit 2 (agents) : 7개 .claude/agents/*.md 의 `## 출력 cap` → `## 출력 계약 (ADR-046)` 교체
Commit 3 (skills) : plan-workitem(FAC↔AC echo 제거+footer) + discover-product(라운드 micro-output+footer)
                    + stabilize-milestone(qa/reviewer 위임 시 finding 전수 반환 강제)
```

---

## 2. Commit 1 — 출력 계약 정책 박기

### 2-1. 새 파일 생성: `docs/90-decisions/boilerplate/ADR-046-signal-first-output.md`

아래 내용을 **그대로** 새 파일로 저장한다.

```markdown
# ADR-046 — Signal-first 출력 계약 (signal-first output contract)

> scope: boilerplate
> area: process

## Status
accepted

## 배경
- [관측됨] 7개 sub-agent(architect/planner/builder/validator/reviewer/qa/researcher)가 모두 `## 출력 cap = 반환 요약 1,000~2,000 토큰`을 둔다. builder/validator/reviewer는 lifecycle에서 반복 fork되므로, 한 라운드에 여러 agent를 거치면 메인 컨텍스트에 장문이 누적되어 사용자 피로 + 토큰 경합이 커진다.
- [관측됨] `plan-workitem`의 마지막 출력이 feature `## 7-1. FAC↔AC 매핑표`(영속 SSOT, ADR-037#amend-1)를 전체 echo한다 — 이미 파일에 적힌 내용을 대화에 재출력(ADR-005 SSOT 정신과 어긋남 + 토큰 낭비).
- [관측됨] `discover-product`는 라운드형이라 라운드마다 자유 산문이 누적된다. 산출은 이미 DISCOVERY.md에 적재되는데 사용자-facing 표면 출력 포맷은 미규정.
- [외부실증] caveman skill(github.com/JuliusBrussee/caveman)은 "기술 정확도 유지 + filler 제거"로 출력 토큰 평균 ~65% 감소를 보고. 단 관사 생략·문장 조각·wenyan 등 *문체*는 한국어 전문 문서에 부적합 — 본 ADR은 caveman의 *문체*가 아니라 *정보 밀도 원칙*만 차용한다.
- 입력 컨텍스트 절감은 ADR-019(context-pack + JIT)가 이미 담당. 본 ADR은 미규정 영역인 *출력* 측을 다룬다.

## 결정

### D1. signal-first 반환 계약 (sub-agent)
메인에 반환하는 요약은 다음 형태로 쓴다:
판정/결론 1~3줄 → 핵심 항목 ≤5 → 리스크·미결정 ≤3 → 다음 액션 1개(분기 시 ≤3).
긴 reasoning·탐색 과정·로그 전문은 반환하지 않는다 — sub-agent 내부 또는 report/문서에 두고 반환에는 그 위치만 가리킨다.

### D2. 반환 분량 목표
기본 ≤ 600 토큰, 보존 항목이 많은 일반적 경우 ≤ 1,200 토큰. *수치는 휴리스틱(hard cap 아님)* — builder.md sizing 휴리스틱과 동일 정신.
**단, *반환이 곧 적재 산출물인 finding 전수*(D3)는 이 분량 목표에 묶이지 않는다** — 분량 때문에 finding을 누락·생략하면 문서 커버리지가 약해지므로, 그 경우 분량 목표는 서술·process 부분에만 적용한다(finding은 길이와 무관하게 전수 반환).

### D3. 압축 금지 (auto-clarity 보존 리스트)
다음은 정확히 보존하며 절대 압축·생략하지 않는다:
- 코드·파일 경로·명령어·에러 문자열·AC 식별자 및 그 Pass/Needs Fix 판정.
- 모든 P0/P1/P2 finding, report 파일 경로.
- **report-only 위임에서 *반환 자체가 호출 측의 적재 산출물*인 경우(qa→QA_FINDINGS, reviewer→IMPROVEMENT_GUIDE, researcher→insights 노트 등)의 finding·발견·출처 전수** — 이때 D2 분량 목표는 *서술·process 부분에만* 적용하고 항목은 누락하지 않는다.
- 사용자가 선택·결정해야 하는 옵션·후보 목록(예: discover-product 페르소나 후보·pain 목록).
- 보안 경고·되돌릴 수 없는 작업 경고·순서가 중요한 다단계 절차.
- 사용자가 혼란스러워하는 상황의 설명.
(caveman의 "auto-clarity" 규칙과 동형.)

### D4. 문서 산출물은 비대상
본 계약은 *대화/반환 표면*에만 적용한다. charter/ADR/architecture/workitem/AC/검증 report 등 *영속 문서 본문*은 압축하지 않는다 — 정밀성·전문성 유지가 SSOT 가치(ADR-005).
**validator·reviewer가 *직접 작성*하는 report/plan-review/discovery-review 파일 본문도 비대상**이다 — 출력 계약은 *메인 반환*에만 적용하며, 작성 파일은 각 skill(validate-workitem/validate-plan/validate-discovery)이 박은 양식·정밀도를 그대로 따른다.

### D5. 대화 출력의 중복 echo 금지
이미 파일에 영속된 내용(예: feature `## 7-1` FAC↔AC 매핑표, validation report 상세)은 대화에 전체 재출력하지 않고 *위치 + 요약 수치*만 가리킨다(ADR-005 정합). plan-workitem의 FAC↔AC *전체표 echo* 폐지는 owning ADR인 ADR-037#amend-2가 정의한다(본 ADR은 정합만 — 충돌 회피).

## 근거
- detail은 이미 파일에 적재되므로(report/IMPROVEMENT_GUIDE/QA_FINDINGS/workitem 문서) 반환 압축은 정보 손실이 아니라 *중복 제거*다 — 독자는 파일을 열어 상세를 본다.
- 대안 A: caveman을 문체까지 그대로 도입 → 한국어 문서성 훼손 + 과도. 기각.
- 대안 B: 출력 레벨(lite/full/ultra) 도입 → YAGNI 위반(ADR-006). 단일 계약으로 충분. 기각.

## 결과
- sub-agent 반환 cap이 1,000~2,000 → 기본 ≤600 토큰으로 축소. 멀티 agent 라운드의 메인 컨텍스트 부담·사용자 피로 감소.
- plan-workitem·discover-product의 사용자-facing 출력이 가벼워짐(라운드 수·분석 깊이는 불변).
- 문서 품질은 불변.

## 정책 강도 (ADR-022 정합)
- constraint(강, [관측됨]): D3 보존 리스트, D4 문서 비대상, D5 중복 echo 금지.
- enabling(약, 휴리스틱): D1 형태, D2 분량 목표 — 점진 적용·되돌리기 쉬움.

## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT)
- .claude/agents/architect.md       — ## 출력 계약 (D1·D2·D3)
- .claude/agents/planner.md         — ## 출력 계약
- .claude/agents/builder.md         — ## 출력 계약
- .claude/agents/validator.md       — ## 출력 계약
- .claude/agents/reviewer.md        — ## 출력 계약
- .claude/agents/qa.md              — ## 출력 계약
- .claude/agents/researcher.md      — ## 출력 계약
- .claude/skills/plan-workitem/SKILL.md    — 출력 스타일 footer (FAC↔AC echo 제거 자체는 ADR-037#amend-2가 owning)
- .claude/skills/discover-product/SKILL.md — 라운드 micro-output + 출력 스타일 footer
- .claude/skills/stabilize-milestone/SKILL.md — qa/reviewer 위임 시 finding 전수 반환 명시 (D3 호출부 강제)
- AGENTS.md                          — 출력 스타일 1줄 정책

## 참고
- ADR-005 (SSOT)
- ADR-006 (단순성·YAGNI)
- ADR-019 (입력 컨텍스트 — 본 ADR은 출력 측 보완)
- ADR-022 (Ratchet Principle)
- ADR-037 (#amend-2가 plan FAC↔AC echo 축소를 owning — 본 ADR과 정합)
- caveman skill — https://github.com/JuliusBrussee/caveman ([외부실증] 출처)
```

### 2-2. `docs/90-decisions/boilerplate/README.md` 인덱스 표에 1행 추가

**위치**: "Boilerplate ADR" 표의 마지막 행(045) 바로 아래.

**Before** (현재 마지막 행):
```
| 045 | Document reference contract | accepted | — | 참조 ID 규약 + ## Surfaces fan-out SSOT + 현재 유효 결정 + amend/supersede 기준 + checker 건전성 |
```

**After** (045 행 다음에 새 행 추가):
```
| 045 | Document reference contract | accepted | — | 참조 ID 규약 + ## Surfaces fan-out SSOT + 현재 유효 결정 + amend/supersede 기준 + checker 건전성 |
| 046 | Signal-first output contract | accepted | — | sub-agent 반환 cap 축소(1~2k→≤600) + signal-first 대화/반환 계약 + auto-clarity 보존 리스트 |
```

### 2-3. `docs/00-meta/STRUCTURE.md` Canonical Owner 표에 1행 추가

**위치**: Canonical Owner 매핑 표에서 "Workitem Type 분류" 행(ADR-039) 바로 아래, 표 종료 직전.

**Before**:
```
| Workitem Type 분류 (feature/technical-enabler/bugfix/refactor/migration/research-spike) | [ADR-039](../90-decisions/boilerplate/ADR-039-workitem-type.md) (정책 SSOT). → ADR-039 `## Surfaces` 참조 (fan-out SSOT). |
```

**After** (ADR-039 행 다음에 새 행 추가):
```
| Workitem Type 분류 (feature/technical-enabler/bugfix/refactor/migration/research-spike) | [ADR-039](../90-decisions/boilerplate/ADR-039-workitem-type.md) (정책 SSOT). → ADR-039 `## Surfaces` 참조 (fan-out SSOT). |
| 출력 스타일 (signal-first 대화/반환 계약) | [ADR-046](../90-decisions/boilerplate/ADR-046-signal-first-output.md) (정책 SSOT). → ADR-046 `## Surfaces` 참조 (fan-out SSOT). |
```

> 근거: STRUCTURE.md 압축 규칙상 *cross-surface 적용* 정책만 본 표에 등재한다. ADR-046은 7 agents + 3 skills + AGENTS.md에 동기 반영되는 cross-surface 정책이므로 등재 대상이다.

### 2-4. `AGENTS.md`에 출력 스타일 1섹션 추가

**위치**: "## Discovery → Charter SSOT 정책" 섹션과 "## AGENTS.md 길이 정책" 섹션 사이.

**Before**:
```
## Discovery → Charter SSOT 정책
**DISCOVERY=SSOT, Charter=snapshot** — DISCOVERY.md 갱신 시 Charter는 자동 sync 안 됨. `/bootstrap-project`로 갱신 제안을 받은 뒤 `--apply`로 적용하거나 직접 편집. (ADR-035)

## AGENTS.md 길이 정책
```

**After**:
```
## Discovery → Charter SSOT 정책
**DISCOVERY=SSOT, Charter=snapshot** — DISCOVERY.md 갱신 시 Charter는 자동 sync 안 됨. `/bootstrap-project`로 갱신 제안을 받은 뒤 `--apply`로 적용하거나 직접 편집. (ADR-035)

## 출력 스타일 (signal-first)
대화·반환 출력은 signal-first: 결론/판정 → 핵심 변경 → 리스크 → 다음 액션. 긴 reasoning·로그·중복 echo는 report/문서에 두고 대화엔 요지만 남긴다. 문서 본문(charter/ADR/AC 등)·코드·경고는 압축하지 않는다 (ADR-046).

## AGENTS.md 길이 정책
```

> 확인: AGENTS.md는 100줄 hard cap(ADR-011). 현재 50줄 → 추가 후 약 53줄로 cap 이내.
> AGENTS.md는 정책마다 `##` 섹션을 두는 기존 패턴(TDD·Discovery SSOT·plan 모드)을 따른다 — 본 섹션도 헤더 + 1줄 + ADR 링크로 ADR-011 정신("본문에 정책 전문 X, 링크만") 충족.

### 2-5. (정책 충돌 해소) `ADR-037`에 Amendment 2 추가 + 인덱스 동기

**왜 필요한가**: ADR-037 결정 2 + Amendment 1은 "plan 출력은 FAC↔AC 매핑표 echo(사람 확인용)"를 *정책으로 명시*한다. Commit 3에서 plan-workitem의 전체표 echo를 제거하므로, owning ADR인 ADR-037을 함께 갱신하지 않으면 정책 drift가 생긴다(ADR-046#d5는 정합만 가리킬 뿐 owning이 아님).

**(a)** `docs/90-decisions/boilerplate/ADR-037-spec-coverage-audit.md`에서 **기존 `## Amendment 1` 블록 전체가 끝난 다음, `## Surfaces` 블록 바로 앞**에 아래를 추가한다(즉 Amendment 1과 Surfaces 사이):

```markdown
<a id="adr-037-amend-2"></a>
## Amendment 2 (2026-05-27) — plan 출력 echo 축소 (ADR-046 정합)

### 결정
plan-workitem의 FAC↔AC *전체 매핑표 echo*를 폐지한다. plan 출력에는 `unmapped N건` 요약 + feature `## 7-1` 위치 포인터만 둔다. 전체 매핑표 SSOT는 feature 문서 `## 7-1`(본 ADR #amend-1) — 변경 없음.

### 근거
- 전체표 echo는 이미 `## 7-1`에 영속된 내용의 *대화 중복 출력* — ADR-005 SSOT 정신 및 ADR-046#d5(중복 echo 금지)와 어긋난다.
- 본 ADR 결정 1(validator self-audit)·#amend-1(영속 SSOT)의 *추적 메커니즘*은 불변 — 바뀌는 것은 plan의 *대화 출력 형식*뿐.
- #d2 및 #amend-1의 "plan 출력은 echo" 문구 중 *전체표 echo* 부분만 본 amendment가 대체한다(narrowing).

### 적용 surface
- [plan-workitem/SKILL.md](../../../.claude/skills/plan-workitem/SKILL.md) "feature 분해 시"·"마지막 출력" — 전체표 echo 제거, unmapped 요약 + 위치 포인터.
- 정합 정책: [ADR-046](ADR-046-signal-first-output.md)#d5.
```

**(b)** 같은 파일의 `## Surfaces` 블록에서 plan-workitem 줄을 갱신한다:

Before:
```
- .claude/skills/plan-workitem/SKILL.md                — #amend-1 영속 저장 + 출력 echo
```
After:
```
- .claude/skills/plan-workitem/SKILL.md                — #amend-1 영속 저장 + #amend-2 출력 echo 축소(요약만)
```

**(c)** `docs/90-decisions/boilerplate/README.md` 인덱스의 **037 행** Amendments 컬럼을 갱신한다(ADR-045#d8 — 인덱스 amend 수 ↔ 본문 `## Amendment N` 수 일치, 불일치 시 stabilize preflight가 `P1 [ADR-index]` 보고):

Before:
```
| 037 | Spec coverage self-audit | accepted | (+#amend-1: FAC↔AC 매핑표 영속 SSOT 위치 `## 7-1`) | FAC→AC 매핑 추적, Spec Gap report, 자동 차단 X |
```
After:
```
| 037 | Spec coverage self-audit | accepted | (+#amend-1: FAC↔AC 매핑표 영속 SSOT 위치 `## 7-1`, +#amend-2: plan 출력 echo 축소 — ADR-046 정합) | FAC→AC 매핑 추적, Spec Gap report, 자동 차단 X |
```

> **ADR-045#d5(`## 현재 유효 결정` 요약) 판단 — 신설하지 않음**: amend-2가 decision 2의 *출력 형식*을 narrowing하므로 d5의 "정정성 amend" 트리거 해당 여부는 논쟁 여지가 있으나 — (1) amend 2개로 "4개 이상" 임계 미만, (2) spec-coverage 추적의 핵심(decision 1·#amend-1 영속 SSOT)은 *불변*이라 fold 부담이 작고, (3) d5는 enabling(약)·deterministic 강제 없음. → ADR-037에 `## 현재 유효 결정` 요약 섹션은 신설하지 않는다. (향후 리뷰어가 d5 누락으로 오인하지 않도록 판단을 명시.)

> **선택적·비필수 정리(기능·checker 무관 — 생략 가능)**: `ADR-040` `## 배경` 11번 줄은 Anthropic subagent 가이드를 인용하며 "1,000~2,000 토큰 요약만 반환"이라 적는다. 이는 *외부 가이드 [외부실증] 인용*이지 researcher 반환 cap을 박는 규범이 아니다(researcher cap의 owning은 ADR-046). 그대로 둬도 모순이 아니므로 본 가이드의 필수 단계에 넣지 않는다. 문서 위생을 더 챙기려면 그 줄 끝에 "(본 repo 현 반환 계약은 ADR-046 ≤600)" 한 마디만 병기 — 토큰 숫자를 grep하는 checker는 없어 미적용 시에도 P-finding은 안 뜬다.

### ✅ Commit 1

```
docs: add ADR-046 output contract and amend ADR-037 plan echo
```

---

## 3. Commit 2 — 7개 서브에이전트 반환 계약 교체

대상 파일 7개. 각 파일 **맨 끝의 `## 출력 cap` 블록**을 아래 새 블록으로 교체한다.

대상:
- `.claude/agents/architect.md`
- `.claude/agents/planner.md`
- `.claude/agents/builder.md`
- `.claude/agents/validator.md`
- `.claude/agents/reviewer.md`
- `.claude/agents/qa.md`
- `.claude/agents/researcher.md`

**Before** (6개 파일 — architect/planner/builder/validator/reviewer/qa 는 이 문구가 동일):
```
## 출력 cap
반환 요약은 1,000~2,000 토큰. 긴 reasoning은 본 sub-agent 안에 둔다(메인 컨텍스트 토큰 경합 방지 — Anthropic 가이드).
```

**Before** (researcher.md 만 "긴 탐색"으로 단어가 다름):
```
## 출력 cap
반환 요약은 1,000~2,000 토큰. 긴 탐색은 본 sub-agent 안에 둔다(메인 컨텍스트 토큰 경합 방지 — Anthropic 가이드).
```

**After** (7개 파일 모두 동일하게 교체):
```
## 출력 계약 (ADR-046)
메인 반환 요약은 signal-first: 판정/결론 1~3줄 → 핵심 항목 ≤5 → 리스크·미결정 ≤3 → 다음 액션 1개(분기 시 ≤3).
기본 ≤ 600 토큰, 보존 항목이 많을 때만 ≤ 1,200 토큰(수치는 휴리스틱, hard cap 아님).
*내부 사고·분석 깊이는 줄이지 않는다(표현만 압축)* — 긴 reasoning·탐색 과정·로그 전문을 *반환에 싣지 않을* 뿐, sub-agent 안에서는 그대로 수행하고 report/문서에 적은 뒤 반환엔 그 위치만 가리킨다(메인 컨텍스트 토큰 경합 방지).
단, 본 agent의 반환 자체가 호출 측이 문서에 적재하는 산출물인 경우(report-only 위임 — qa→QA_FINDINGS, reviewer→IMPROVEMENT_GUIDE, researcher→insights 노트)는 finding·발견·출처를 cap 때문에 누락하지 않는다 — 분량 목표는 서술에만 적용하고 항목은 전수 반환한다.
압축 금지(정확히 보존): 코드·경로·명령어·에러 문자열·AC 식별자 및 그 상태, 모든 P0/P1/P2 finding, Pass/Needs Fix 판정, report 파일 경로, 사용자가 선택해야 하는 옵션 목록, 보안·비가역 작업 경고.
```

> 주의 1: 이 교체는 *기능 추가가 아니라 형태 변경*이다. builder.md의 기존 요약 6항목(수정 파일/핵심 변경/테스트/리스크/정리/AC 상태)은 그대로 유지된다 — 새 계약은 그것들을 signal-first 형태로 *재배치*할 뿐이며, "AC 식별자 및 그 상태"는 보존 리스트에 포함된다.
> 주의 2: researcher.md의 별도 `출력:` 섹션(핵심 발견 ≤7 등)은 건드리지 않는다 — `## 출력 cap` 블록만 교체.
> 주의 3: 본 계약의 "핵심 항목 ≤5" 등 형태 수치는 *구조 없는 일반 반환*의 휴리스틱이다. skill이 "마지막 출력" 같은 *구체적 출력 계약*을 정의한 경우(예: plan-workitem의 문서목록/매트릭스/미결정/waves/다음단계)는 그 skill 계약이 우선하며, 본 형태는 그것을 signal-first로 *제시하는 방식*만 가이드한다(정의된 출력 섹션 수를 강제 삭감하지 않는다).

### ✅ Commit 2

```
refactor(agents): tighten sub-agent return to signal-first contract (ADR-046)
```

---

## 4. Commit 3 — 사용자-facing skill 출력 trim

### 4-1. `.claude/skills/plan-workitem/SKILL.md` — FAC↔AC 전체 echo 제거 (D5)

"마지막 출력:" 블록 안에 feature 매핑표를 대화에 통째로 재출력하는 항목이 있다. 이를 *위치 + 수치 요약*으로 축소한다.

**Before** (제거 대상 — "feature 분해 시:" 로 시작하는 항목 전체. *바깥 4-backtick은 본 가이드의 표시용 펜스 — plan-workitem에서 찾을 실제 텍스트는 그 안쪽*):
````
- feature 분해 시: 매핑표를 *feature 문서의 `## 7-1`에 직접 기록* + plan 출력 요약에 동일 표 echo
  (`## 7-1` 본문이 SSOT, plan 출력은 사람 확인용):
  ```
  ## 7-1. FAC ↔ AC 매핑표
  FAC-1 → T-001:AC-1, T-002:AC-2
  FAC-2 → T-003:AC-1
  FAC-3 → unmapped  ← 미커버 task 필요
  ```
````

**After** (위 블록을 아래 한 줄 + 한 항목으로 교체):
```
- feature 분해 시: 매핑표는 feature 문서 `## 7-1`에 직접 기록(SSOT). plan 출력에는 **전체 표를 echo하지 않고** `unmapped N건`만 요약한다(ADR-037#amend-2 owning — ADR-005·ADR-046#d5 정합). 사람은 feature `## 7-1`을 연다.
```

> 다른 출력 항목(생성 문서 목록 / 분해 매트릭스 / 핵심 가정 / 남은 미결정 / cross-check 수치 요약 / wave 그룹 / 다음 추천 단계)은 *그대로 둔다* — 이미 요약형이거나 의사결정에 필요한 signal이다. 본 편집은 "이미 파일에 영속된 표를 통째로 재출력"하는 단 한 군데만 surgical하게 제거한다.

이어서 plan-workitem 맨 끝의 `## Context 정책 (ADR-019)` 블록 **바로 위**에 footer를 추가한다(ADR-046 backref 확보 — ADR-045#d4).

**Before**:
```
## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 ADR/architecture 섹션은 task 본문에서 발화 시 인용 — 사전 fork-load 금지.
```

**After**:
```
## 출력 스타일 (ADR-046)
마지막 출력은 signal-first(문서 목록 → 매트릭스 → 미결정 → 다음 액션). 파일에 영속된 상세(FAC↔AC 전체표·cross-check 세부)는 위치만 가리키고 echo하지 않는다.

## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 ADR/architecture 섹션은 task 본문에서 발화 시 인용 — 사전 fork-load 금지.
```

### 4-2. `.claude/skills/discover-product/SKILL.md` — 라운드 micro-output (D1)

"사용자 응답 수단:" 섹션 바로 뒤(즉 "라운드 구성:" 바로 앞)에 라운드 출력 포맷 규약을 추가한다.

**Before**:
```
사용자 응답 수단:
- 라운드별 응답은 자연어로만 받는다(`AskUserQuestion`은 [공식 문서](https://code.claude.com/docs/en/agent-sdk/user-input)의 Limitations 섹션 기준 sub-agent에서 사용 불가).
- 매 라운드 끝에 `skip` / `good` / `refine: ...`로 응답할 수 있다.

라운드 구성:
```

**After** (*바깥 4-backtick은 본 가이드의 표시용 펜스 — discover-product에 넣을 실제 내용은 그 안쪽이며, 안쪽 3-backtick "이번 결정…" 박스는 skill 본문에 그대로 들어간다*):
````
사용자 응답 수단:
- 라운드별 응답은 자연어로만 받는다(`AskUserQuestion`은 [공식 문서](https://code.claude.com/docs/en/agent-sdk/user-input)의 Limitations 섹션 기준 sub-agent에서 사용 불가).
- 매 라운드 끝에 `skip` / `good` / `refine: ...`로 응답할 수 있다.

라운드 출력 포맷 (ADR-046 출력 스타일 — 사용자-facing 표면만 압축, 내부 분석·DISCOVERY.md 적재 내용은 불변):
각 라운드는 다음 고정 포맷으로 압축해 출력한다.
```
이번 결정: <1~2줄>
확인 필요: <있으면 ≤3개, 없으면 생략>
답변: skip / good / refine: …
```
단, 사용자가 *선택해야 하는* 옵션(R0 페르소나 후보·R1 pain 목록 등)은 선택 가능하도록 보존한다 — 압축은 framing·서술에만 적용하고 선택지 자체는 빠뜨리지 않는다(ADR-046#d3). architect 단발 sub-call의 *과정*만 대화에 풀어쓰지 않는다.

라운드 구성:
````

이어서 discover-product 맨 끝의 `## Context 정책 (ADR-019)` 블록 **바로 위**에 footer를 추가한다.

**Before**:
```
## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 ADR/architecture 섹션은 task 본문에서 발화 시 인용 — 사전 fork-load 금지.
```

**After**:
```
## 출력 스타일 (ADR-046)
라운드 표면 출력은 위 "라운드 출력 포맷"을 따른다 — 라운드 수·분석 깊이는 줄이지 않고 표면 분량만 압축한다.

## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 ADR/architecture 섹션은 task 본문에서 발화 시 인용 — 사전 fork-load 금지.
```

### 4-3. `.claude/skills/stabilize-milestone/SKILL.md` — qa/reviewer 위임 시 finding 전수 반환 명시 (호출부 강제)

**왜 필요한가**: qa·reviewer는 본 skill에서 *report-only*로 위임되고, 그 **반환을 stabilize가 받아 QA_FINDINGS.md / IMPROVEMENT_GUIDE.md에 적재**한다(SKILL 본문 단계 4·5). sub-agent 파일(qa.md/reviewer.md)에만 "finding 전수 보존" 예외가 있고 *호출 지시*에 없으면, 모델이 cap을 더 강하게 해석해 finding을 누락할 수 있다(sub-agent 예외만으로는 호출 시점의 해석을 강제하지 못함). 호출부에도 한 줄 박아 2중으로 막는다.

수행 단계 4("qa agent에 위임")와 5("reviewer agent에 위임")에 각각 다음 문장을 한 줄 덧붙인다(기존 문장 끝에 append — 기존 지시는 보존).

**Before** (단계 4 — 현재 문장 끝):
```
**qa agent에 회귀·엣지케이스 점검 위임** — qa는 보고만 한다(qa.md의 tools에 Write 없음). 반환된 보고를 본 skill이 받아 `docs/40-validation/QA_FINDINGS.md`에 누적 기록한다.
```
**After**:
```
**qa agent에 회귀·엣지케이스 점검 위임** — qa는 보고만 한다(qa.md의 tools에 Write 없음). 반환된 보고를 본 skill이 받아 `docs/40-validation/QA_FINDINGS.md`에 누적 기록한다. **위임 시 ADR-046#d3 적용: finding은 cap 때문에 누락하지 말고 전수 반환 — cap은 서술/과정 설명에만.**
```

**Before** (단계 5 — 현재 문장의 첫 부분):
```
**reviewer agent에 리팩토링 후보·아키텍처 부채 점검 위임** — reviewer 입력에 Clean Code 6항목 체크리스트(ADR-006) + `review surface: code` 를 명시 전달한다.
```
**After**:
```
**reviewer agent에 리팩토링 후보·아키텍처 부채 점검 위임** — reviewer 입력에 Clean Code 6항목 체크리스트(ADR-006) + `review surface: code` + **ADR-046#d3(finding 전수 반환 — report-only이므로 본 skill이 받아 적는다)** 를 명시 전달한다.
```

> **구현 주의**: 위 단계 5의 Before는 *줄 전체가 아니라 접두부*다 — 실제 줄은 "…명시 전달한다." 뒤에 "**UI 프로젝트의 경우 추가로 `review surface: design`…**"가 이어진다. Before 접두부 문자열만 매칭해 After로 교체하면 뒤의 UI 연속 텍스트는 자동으로 보존된다(줄 전체를 지우지 말 것).
> 본 편집으로 stabilize-milestone 본문에 `ADR-046` 토큰이 생겨 ADR-046 `## Surfaces` 역참조(ADR-045#d4)도 충족된다. (footer는 별도로 두지 않는다 — 이미 본문 backref 확보 + churn 최소화.)

### ✅ Commit 3

```
refactor(skills): trim plan/discovery output and enforce stabilize finding-passthrough (ADR-046)
```

---

## 4.5. 영향 범위 점검 (중요 — 성능·기존 기능 영향 범위)

본 개선은 전부 *지시문(prompt) 텍스트* 편집이며, 의도한 변경 대상은 **사용자-facing/메인 반환 표면의 표현 방식**뿐이다.

**바뀌지 않는 것:**
- agent의 내부 작업·분석 깊이 — 긴 reasoning은 여전히 sub-agent 내부에서 수행(블록에 명시). 반환만 짧아질 뿐 사고량은 그대로.
- 파일에 영속되는 산출물 — code, task/feature/charter/ADR 문서, validation report, feature `## 7-1` FAC↔AC 표는 그대로 기록된다(plan은 *echo만* 제거, **write 단계 불변** — plan-workitem 본문의 "## 7-1에 직접 기록" 지시는 유지).
- lifecycle·게이트·판정 — Pass/Needs Fix, AC 매핑, graduation pre-check, stabilize deterministic preflight 전부 동일. (state 전이는 원래 hook/script 강제가 아님 — WORKFLOW.md.)
- 라운드 수·discovery 깊이 — discover-product는 표면 포맷만 압축, R0~R4 구조·architect 위임 불변.
- 자동화/CI — 출력 토큰을 파싱하는 hook이 없으므로 깨질 자동 검사 없음.
- 성능 — 반환 토큰 감소는 메인 컨텍스트 부담을 *줄이는* 방향(중립~긍정). 모델 내부 추론은 줄이지 않도록 블록에 명시(표현만 압축) — 단 지시 기반이라 절대 보장은 아님.

**유일하게 바뀌는 것:**
- 메인에 반환되는 *요약*의 분량/형태(1~2k 토큰 → 기본 ≤600, signal-first).
- plan-workitem이 대화에 *중복 출력*하던 FAC↔AC 표 → 위치 포인터로 대체(표 자체는 feature `## 7-1`에 그대로 존재).
- discover-product 라운드의 *표면 출력* 포맷.

**검토 중 발견해 가이드에서 무력화한 위험(반드시 아래 예외/조치를 포함해 적용할 것):**
1. **finding 누락 위험(기능 저하)** — qa·reviewer는 일부 surface(`/stabilize-milestone` 등)에서 *report-only*라 그 **반환이 곧 QA_FINDINGS/IMPROVEMENT_GUIDE에 적재되는 산출물**이다(qa.md=Write 권한 없음, reviewer.md "그 외 surface=report-only, 호출 측이 받아 적는다"). researcher도 동형(반환→`/research-pack`이 insights 노트로 적재). token cap을 그대로 걸면 finding·발견이 누락돼 *문서 커버리지가 약해진다*. → ① 출력 계약 블록 + ADR-046 D2·D3 "finding 전수 보존(qa/reviewer/researcher), cap은 서술에만" + ② **호출부 강제(4-3)** — stabilize 위임 지시에도 동일 문구를 박아 2중 방어.
2. **선택지 과압축 위험** — discover-product에서 사용자가 *골라야 하는* 페르소나 후보·pain 목록을 과도 압축하면 선택 품질이 떨어진다. → 4-2 After "사용자 선택 옵션은 보존" 예외로 무력화.
3. **정책 drift(기능 저하 아님, 정합성)** — plan echo 제거는 ADR-037#amend-1("plan 출력은 echo")과 충돌한다. → 2-5에서 ADR-037 Amendment 2로 owning ADR을 함께 갱신해 drift 차단.

**결론(정직하게)**: 이건 *지시문(prompt)* 변경이라 효과는 모델의 지시 준수에 의존한다(코드 게이트가 아님). 단 ① 기존에도 동일 방식의 cap(1~2k)이 있어 *강제 메커니즘은 안 바뀌고 숫자만 조정*되고, ② finding·선택지·판정·경로를 보존 리스트 + 호출부 강제로 명시해 **오늘보다 더 안전하게 보호**된다. 따라서 "하나도 안 바뀐다"기보다 **"직접적인 코드/CI/성능 영향은 없고, 보존 예외(D2·D3·4-2·4-3)가 지켜지는 한 영속 산출물·lifecycle 의미는 유지되며, 바뀌는 것은 반환·대화 표면의 정보량으로 *한정되도록 설계했다*"**가 정확한 표현이다.

---

## 5. 완료 후 검증 (전부 통과해야 끝)

1. **파일 존재**: `docs/90-decisions/boilerplate/ADR-046-signal-first-output.md` 가 생성됐다.
2. **인덱스/Canonical Owner**: README 인덱스에 046 행, **037 행 Amendments 컬럼에 `+#amend-2`**, STRUCTURE Canonical Owner에 출력 스타일 행이 있다.
3. **ADR-037 amend 동기 (ADR-045#d8)**: ADR-037 본문의 `## Amendment N` 헤딩 수(=2) ↔ README 037 행 Amendments 표기 수(=2) 일치. 불일치 시 stabilize preflight가 `P1 [ADR-index]`.
4. **AGENTS.md cap**: 전체 줄 수 ≤ 100 (ADR-011). 확인: `(Get-Content AGENTS.md | Measure-Object -Line).Lines`.
5. **agents 교체 완수**: 7개 agent 파일에 `## 출력 cap` 문자열이 **하나도 남아 있지 않고**, 모두 `## 출력 계약 (ADR-046)` 로 바뀌었다.
   - 확인(잔존 0이어야 정상): Grep `## 출력 cap` in `.claude/agents` → 0 hits.
   - 확인(7이어야 정상): Grep `## 출력 계약 (ADR-046)` in `.claude/agents` → 7 hits.
   - 확인(기능 저하 방지 — 7이어야 정상): Grep `report-only 위임` in `.claude/agents` → 7 hits (qa/reviewer finding 전수 보존 예외 문구 포함).
6. **호출부 강제(4-3) 적용**: stabilize-milestone SKILL.md 단계 4·5에 `ADR-046#d3` 문구가 들어갔다. 확인: Grep `ADR-046#d3` in `.claude/skills/stabilize-milestone/SKILL.md` → ≥2 hits.
7. **Surfaces backref 정합 (ADR-045#d4)**: ADR-046 `## Surfaces`에 등재된 11개 파일(7 agents + 3 skills + AGENTS.md) 각각이 본문에 `ADR-046` 토큰을 가진다.
   - 확인: Grep `ADR-046` in 각 surface 파일 → 모두 ≥1 hit. (agents=`## 출력 계약 (ADR-046)`, plan-workitem/discover-product=footer, stabilize-milestone=단계 4·5 본문, AGENTS.md=출력 스타일 섹션.)
   - 이걸 만족해야 `/stabilize-milestone` deterministic preflight의 `[Surface-backref]` 점검을 통과한다.
8. **ADR-037#amend-2 anchor (ADR-045#d2)**: ADR-046이 `ADR-037#amend-2`를 인용하므로 ADR-037에 `<a id="adr-037-amend-2"></a>`가 `## Amendment 2` 바로 위에 있다.
9. **plan-workitem echo 제거**: SKILL.md "마지막 출력"에 `## 7-1. FAC ↔ AC 매핑표` 예시 코드블록이 더는 없다.
10. (선택) **markdown link 점검**: `markdown-link-check` 설치 시 ADR-046·ADR-037의 링크가 깨지지 않는지 확인.

---

## 6. 하지 말 것 (out of scope — 의도적 비범위)

- ❌ 관사 생략·문장 조각·wenyan 등 caveman *문체*를 한국어 출력/문서에 도입.
- ❌ 압축 레벨(lite/full/ultra) 도입 — 단일 계약으로 충분(ADR-006 YAGNI).
- ❌ `/compress` 류 신규 skill, MCP middleware, cavecrew 서브에이전트 추가.
- ❌ 문서 산출물(charter/ADR/architecture/workitem/AC/report/template) 본문 압축.
- ❌ reviewer 라벨 포맷(`P0 [label] file:line — desc`) 재작성 — 이미 충분히 terse.
- ❌ 18개 전 skill에 footer 일괄 추가 — churn. 본 가이드는 직접 손대는 skill을 3개로 한정한다: plan-workitem·discover-product(출력이 무거움) + stabilize-milestone(qa/reviewer 호출부 강제). 나머지는 AGENTS.md 전역 정책 + ADR-046이 커버.
- ❌ validate-plan/validate-discovery/validate-workitem을 surface로 추가 — 이들이 *작성*하는 review/report 파일 본문은 ADR-046 D4가 "비대상"으로 정책 레벨에서 보호하므로 개별 편집 불필요(SSOT 우선, churn 회피).
- ❌ `/research-pack` 호출부에 finding 전수 반환을 별도 강제(4-3 같은 호출부 보강) — researcher 보호는 *agent 측*(researcher.md 출력 계약 블록의 "researcher→insights 노트" 예외 + 기존 `출력:` 섹션 ≤7 발견)으로 충분. stabilize와 달리 호출부 2중 보강은 생략(scope 3 skill 한정).
- ❌ 라운드 수 축소 — 사용자 명시 요구사항(라운드는 유지, 표면만 압축).

---

## 7. 커밋 메시지 모음 (순서대로)

```
docs: add ADR-046 output contract and amend ADR-037 plan echo
refactor(agents): tighten sub-agent return to signal-first contract (ADR-046)
refactor(skills): trim plan/discovery output and enforce stabilize finding-passthrough (ADR-046)
```
