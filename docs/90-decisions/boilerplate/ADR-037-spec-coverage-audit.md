# ADR-037 — Spec Coverage Self-audit

> scope: boilerplate

## Status
accepted

## 현재 유효 결정
- feature `## 7` FAC와 `## 7-1` FAC↔AC 매핑이 coverage SSOT다(#amend-1); 대화 출력은 요약만 둔다(#amend-2).
- `/plan-workitem M<N>`은 FAC↔AC 100%와 unmapped 0건을 task ready 승격 조건으로 삼는다. 첫 구현 전 validate/reviewer는 누락을 P0로 보고하고 repair-plan이 task·AC·매핑을 수정한다(#amend-3).
- 구현 시작 뒤 unmapped FAC는 `P0 [Spec-gap]`+`Needs Fix`, stabilize graduation `NO`로 사용자에게 보고한다. 현재 M task 자동 추가·FAC 자동 취소·plan-workitem 재호출은 없다(#amend-3, ADR-057#amend-3 결정 6, 기록 위치는 QA_FINDINGS — ADR-073#amend-2 결정 4).

> **부분 supersede (2026-07-29)**: #amend-3의 "FAC↔AC 100%가 task `ready` 승격의 필수 조건"에서 **승격 주체는 [ADR-060](ADR-060-decision-closure-and-milestone-seal.md) D7의 `/seal-milestone`**이다(봉인 조건 4). plan-workitem은 unmapped 발견 시 성공 종료를 막고 task를 `draft`에 둔다. 커버리지 요구 자체는 불변.

## 배경
- [외부실증] Osmani self-audit — feature FAC(Feature-level Acceptance Criteria)와 task AC 매핑 누락이 *spec gap*의 핵심 원인.
- ADR-036으로 FEATURE_TEMPLATE에 `## 7 FAC`가 생겼지만 FAC→AC 매핑을 추적하는 메커니즘 부재.
- 매핑 없이 구현하면 feature 수준 품질이 검증되지 않은 채 마일스톤이 종료된다.

## 결정

### 1. validator self-audit 1 step
validate 시 feature `## 7 FAC` 각 항목이 task `## 6 AC`로 매핑됐는지 확인. 매핑 안 된 FAC가 있으면 report에 `Spec Gap: FAC-N → unmapped` 명시 + 미커버 task 추가 권장.

**자동 차단 X (제안만)** — ADR-007 validator 책임 경계 정합.

### 2. plan-workitem 출력 형식에 FAC ↔ AC 매핑표 추가
feature 분해 후 출력에 `FAC-N → T-xxx:AC-N` 형식 매핑표. 미커버 FAC는 `unmapped` 표시.

## 토큰 비용
~1K/task. 6개월 뒤 spec gap 발견 비용보다 작음.

## 결과
- feature 단위 spec coverage가 plan 단계와 validate 단계 양쪽에서 자동 추적됨.
- `Spec Gap` 보고로 미구현 스펙을 조기 발견.

## 후속 작업
없음

<a id="adr-037-amend-1"></a>
## Amendment 1 (2026-05-16) — FAC ↔ AC 매핑표 영속 SSOT 위치

### 결정

FAC ↔ AC 매핑은 *plan-workitem 출력 echo* 가 아니라 **feature 문서의 `## 7-1. FAC ↔ AC 매핑표` subsection** 에 영속 저장한다. plan 출력은 사람 확인용 echo.

- `## 7-1` 위치: ADR-036 의 12-섹션 main 구조를 보존하기 위해 `## 7 FAC` 의 *subsection* 으로 박는다 (추가 main section 신설 X).
- 영속 SSOT 가 있어야 다음 라운드의 validate-workitem (본 ADR 결정 1 의 Spec coverage audit) 과 stabilize-milestone deterministic preflight 가 cross-round 추적 가능.
- legacy feature 문서 (template 변경 전 생성) 는 *Legacy fallback* 3-단계로 회수 — (1) `## 7-1` 존재 / (2) `## 7 FAC` 본문 inline 매핑 휴리스틱 / (3) `Spec Gap` P1 라벨.

### 근거

- 기존 본 ADR 결정 2 ("plan-workitem 출력 형식에 매핑표 추가") 는 *출력 텍스트만* 명시 — 세션 종료 시 사라져 cross-round 추적 surface 부재.
- [관측됨] plan-workitem 출력 텍스트만 있고 영속 자리 부재 — feature 문서 본문 / task 본문 어느 곳에도 매핑이 저장되지 않아 다음 round 의 validator / stabilize 가 점검 surface 가 없음.

### 적용 surface

- [FEATURE_TEMPLATE.md](../../../docs/30-workitems/_templates/FEATURE_TEMPLATE.md) `## 7-1` subsection 신설.
- [plan-workitem/SKILL.md](../../../.claude/skills/plan-workitem/SKILL.md) "feature 분해 시" 단락 — 영속 저장 + plan 출력은 echo 정합.
- [validate-workitem/SKILL.md](../../../.claude/skills/validate-workitem/SKILL.md) Spec coverage audit (본 ADR 결정 1 의 surface 확장).
- [stabilize-milestone/SKILL.md](../../../.claude/skills/stabilize-milestone/SKILL.md) deterministic preflight FAC unmapped 점검.

### 후속 작업

- 기존 feature 문서 (template 변경 전 생성) 의 `## 7-1` 보강 — Legacy fallback 3-단계로 운영 차단 없이 회수되므로 fork 별로 일괄 migration / lazy migration / 신규 feature 부터만 적용 중 선택. plan-workitem 호출 자연 발생 시점에 보강 가능.

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

## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT)
- docs/30-workitems/_templates/FEATURE_TEMPLATE.md     — #amend-1 §7-1 FAC↔AC 매핑표
- .claude/skills/plan-workitem/SKILL.md                — #amend-1 영속 저장 + #amend-2 출력 echo 축소(요약만)
- .claude/skills/validate-workitem/SKILL.md            — #d1 Spec coverage audit
- .claude/agents/validator.md                           — #d1 FAC→AC 매핑 점검
- .claude/skills/stabilize-milestone/SKILL.md          — #amend-1 §1.0 FAC unmapped 점검
- .claude/skills/validate-plan/SKILL.md                — #amend-3 [Plan-FAC-coverage] 구현-후 사용자 결정 라우팅
- .claude/agents/reviewer.md                            — #amend-3 [Plan-FAC-coverage] 미러

## 참고
- ADR-036 (FEATURE_TEMPLATE 12섹션)
- ADR-026 (TASK_TEMPLATE schema)
- ADR-007 (validator 책임 경계 — 판정+권장만)

<a id="adr-037-amend-3"></a>
## Amendment 3 (2026-07-26) — unmapped FAC의 계획-시점 차단 + 구현-후 사용자 결정

### 결정
1. `/plan-workitem M<N>` 전체 스냅샷에서는 FAC↔AC 100%가 task `ready` 승격의 필수 조건이다. unmapped FAC가 하나라도 있으면 self-check 실패로 전 task를 `draft`에 두고 성공 종료하지 않는다.
2. 첫 구현 전 `validate-plan`/reviewer의 `[Plan-FAC-coverage]`는 unmapped FAC를 P0로 보고하며, `/repair-plan M<N>`이 부모 M 전체의 **task·AC·FAC↔AC 매핑**을 고친 뒤 재검증한다(M/F의 FAC 자체를 바꾸는 경로 아님).
3. 구현이 시작된 뒤 validator/validate-workitem이 unmapped FAC를 발견하면 report에 `P0 [Spec-gap] FAC-N → unmapped`를 기록하고 combined verdict를 `Needs Fix`로 둔다. **미커버 task 자동 추가·`/plan-workitem` 재호출·`/repair-workitem` 자동 진입은 하지 않는다**. 다음 액션은 사용자 중단·보고다. 사용자가 현재 M 약속을 어떻게 처리할지 명시적으로 결정해야 하며, 새 요구·기획 변경은 다음 마일스톤이 기본이다.
4. stabilize preflight에서도 같은 finding은 graduation `NO`를 유지하고 사용자에게 보고한다. 자동 corrective task·자동 FAC 취소 문법은 두지 않는다.

### 적용 surface
- .claude/skills/plan-workitem/SKILL.md (FAC↔AC 100% ready gate)
- .claude/skills/validate-plan/SKILL.md · .claude/agents/reviewer.md (`[Plan-FAC-coverage]` P0)
- .claude/skills/validate-workitem/SKILL.md · .claude/agents/validator.md (P0 report + 사용자 결정 라우팅)
- .claude/skills/stabilize-milestone/SKILL.md (graduation NO)
- docs/30-workitems/_templates/FEATURE_TEMPLATE.md (`## 7-1` 주석)

### 강도 (ADR-022)
- constraint(강) — 계획 완료 조건과 구현 후 계획 잠금을 동시에 보존. validator는 report-only이고 문서·코드를 직접 수정하지 않는다.

## Amendment 4 (2026-09-12) — 승인 표면이 검증하는 FAC 에 매핑 자리가 없다

### 배경
ADR-072 가 «승인 프로토타입 + 게이트» 라는 검증 매체를 새로 들였는데, `## 7-1` 은 여전히 **task AC 만** 우변으로 안다. 그 사이에 낀 FAC 가 unmapped 로 오검출된다.

- [관측됨] dogfood Round 12 `F-003 FAC-4`(좁은 폭에서 표만 가로 스크롤한다)는 승인 컴포넌트 `AdminHabits.tsx` 가 이미 구현했고 **이번 M 의 어떤 task 도 그 마크업을 건드리지 않는다.** 검증도 이미 있다 — 승인 스냅샷 `admin-habits-narrow-320-320x800.png` 과 게이트의 좁은 폭 geometry 검사가 그것이다.
- [관측됨] planner 는 `- FAC-4 → (해당 task 없음) — <근거>` 로 적고 "남은 미결정 사항" 에 올렸다. 판단 자체는 옳다 — **변경하지 않는 코드에 새 AC 를 얹지 않는다**(ADR-006). 그런데 amend-3 결정 1·4 의 회수 규칙은 「unmapped 또는 비어 있음」을 세므로 이 행은 **`P0 [Spec-gap]` + graduation `NO`** 로 잡힌다.
- 남은 두 선택지는 둘 다 나쁘다: 억지 AC 를 만들면 ADR-006 을 어기고, FAC 를 지우면 요구가 사라진다.

### 결정
1. **`## 7-1` 우변에 제3의 형식을 허용한다** — `- FAC-N → 승인 스냅샷 <경로> (manifest: <screen id>) — 증명: <그 스냅샷/게이트 검사의 어느 결과>가 FAC-N 의 <어느 요구>를 검증한다`. 증명 문장 규율(ADR-072#amend-2 결정 4)은 그대로 적용된다.
1-b. **`## 7-3` PX↔AC 에도 같은 형식을 허용한다** — `- PX-M<N>-<screen>-NN → 승인 스냅샷 <경로> (manifest: <screen id>)`. 같은 원인이 같은 모양으로 나타나기 때문이다: 승인 컴포넌트가 이미 구현한 경험 결정은 이번 M 의 어느 AC 도 참조하지 않는다(실측 Round 12 `PX-M1-admin-habits-01` 은 `F-003 FAC-4` 와 **같은 요구·같은 스냅샷**이다). 증명 문장은 요구하지 않는다 — `## 7-3` 은 원래 그 규율 밖이다(ADR-072#amend-2 결정 4). 조건 2·3·4 는 그대로 적용된다.
2. **이 형식은 두 조건을 모두 만족할 때만 쓴다** — (i) 그 FAC 를 실제로 검증하는 승인 산출물(스냅샷·게이트 검사)이 **경로로 실재**하고 (ii) 이번 M 의 **어느 task 도 그 화면 `source[]` 파일을 변경 대상에 넣지 않는다.** 하나라도 어기면 쓸 수 없다 — task 가 그 파일을 건드리는 순간 배선이 표현을 바꿀 수 있고, 그때는 AC 가 필요하다.
3. **회수 규칙 정정** — amend-3 결정 1·4 와 `/stabilize-milestone` preflight 3 의 «unmapped» 정의에서 이 형식을 **뺀다**. 우변이 비었거나 `(해당 task 없음)` 처럼 **검증자를 지목하지 않은** 행만 unmapped 다.
4. **봉인 시 재확인** — `/seal-milestone` 은 이 형식의 행마다 조건 (ii)를 다시 본다. **대조 출처는 task `## 3. 구현 항목` 이 지목한 경로들**이다 — `## 4-1. 변경 예정 파일/경로` 는 **구현 시점에 채우는 칸**이라 봉인 시점엔 비어 있는 것이 정상이다(TASK_TEMPLATE 주석). **`- 승인 UI 재사용:` line item 은 대조 대상이 아니다** — 그것은 «재사용»을 선언할 뿐 «변경»을 선언하지 않는다(배선은 보통 호출부에서 일어난다). 봉인 직전에 그 파일을 `## 3` 에서 건드리는 task 가 있으면 봉인을 막고 보고한다.

### 근거
- 대안 「FAC 를 design 층으로 옮긴다」는 기각했다 — FAC 는 feature 의 수용 조건이고, 검증 매체가 다르다고 요구의 소속이 바뀌지는 않는다.
- 대안 「unmapped 를 경고로 낮춘다」도 기각했다 — 진짜 unmapped 의 차단력이 같이 내려간다. **형식을 늘리는 쪽이 등급을 낮추는 쪽보다 안전하다.**
- 조건 (ii)가 이 형식의 안전장치 전부다. 그것이 없으면 「승인됐으니 검증됐다」가 배선 변경을 덮는 만능 면제가 된다.

### 강도 (ADR-022)
- 제약(강, [관측됨]): 결정 2·4 — 조건 두 개와 봉인 재확인.
- enabling(중, [관측됨]): 결정 1·3.

### Mutation delta (ADR-047 D3)
- failure = 승인 표면이 이미 검증하는 FAC 가 `P0 [Spec-gap]` 로 오검출돼 졸업을 막거나, 그것을 피하려 변경하지 않는 코드에 억지 AC 가 생긴다(관측 1건, Round 12 `F-003 FAC-4`).
- predicted = Round 13 에서 이 형식을 쓴 행은 preflight·validator 에서 unmapped 로 세지 않고, 조건 (ii) 위반은 봉인에서 잡힌다.
- falsifier = (a) 이 형식이 **전체 FAC 의 30% 를 넘게** 쓰이면 task 분해가 승인 표면 뒤로 숨는 것이므로 조건을 더 좁힌다(예: 「그 화면이 이번 M 의 어느 feature 의 주 화면도 아닐 때」) (b) 조건 (ii)를 어긴 행이 봉인에서 걸리는 일이 반복되면 형식 자체가 오용되기 쉬운 것이므로 결정 1 을 되돌린다.
- rollback = 본 amend superseded → 제3 형식 제거, unmapped 정의 원복.

### 적용 surface
- docs/30-workitems/_templates/FEATURE_TEMPLATE.md — `## 7-1`·`## 7-3` 주석에 제3 형식
- .claude/skills/plan-workitem/SKILL.md — 결정 1·2 (분해 시 이 형식을 쓸 조건)
- .claude/skills/stabilize-milestone/SKILL.md — 결정 3 (preflight 3 의 unmapped 정의)
- .claude/skills/seal-milestone/SKILL.md — 결정 4 (봉인 재확인)
- .claude/skills/validate-plan/SKILL.md · .claude/agents/reviewer.md — 결정 3 (`[Plan-FAC-coverage]` 판정)
- .claude/skills/validate-workitem/SKILL.md · .claude/agents/validator.md — 결정 3
