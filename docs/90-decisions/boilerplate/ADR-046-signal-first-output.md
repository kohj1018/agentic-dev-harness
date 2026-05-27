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
