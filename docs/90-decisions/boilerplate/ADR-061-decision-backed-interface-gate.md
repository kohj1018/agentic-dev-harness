# ADR-061 — 닫힌 사용자 결정 위반의 인터페이스 게이트 (Decision-Backed Interface Gate)

> scope: boilerplate

## Status
accepted

## 배경

- **[관측됨]** inner-loop 벤치 실측(2026-08-01, sonnet): ARCH `## 7-2`에 `authority: user-approval` + `status: closed`로 원장에 등재된 결정(*목록을 출력하는 모든 명령은 `--json`을 지원한다*)을 구현이 위반했다. `/validate-workitem`은 그것을 **정확히 찾아 `P1 [Arch-iface-7-2]`로 기록하고 ARCH `### Don'ts` 문구까지 인용**했으나, 집계 규칙상 P1은 Needs Fix 트리거가 아니라 **Pass**가 나왔고 `/finalize-workitem`이 `done` + 커밋까지 진행했다. 즉 *사용자가 승인해 닫은 결정이 보고만 남기고 출하됐다*. 눈먼 통과가 아니라 **등급 문제**다.
- **[관측됨]** 같은 실패는 [SIMULATION_RUN](../../../.boilerplate/validation/SIMULATION_RUN.md) Round 9의 "구멍 B"로 이미 기록됐다. 그때의 처방은 `/validate-plan` 차원 10 확장이었으나 그 skill은 **opt-in**([ADR-038](ADR-038-cross-llm-plan-validation.md))이라 리뷰를 돌리지 않는 inner-loop 단독 경로에서는 발화하지 않는다 — Round 9가 그 사실을 "잔여 한계"로 남겼다.
- **[관측됨]** 대조군을 둔 paired 실측(같은 fixture·같은 모델, 처방 2줄만 차이): 위반 task는 Pass → **Needs Fix**로 뒤집혀 repair 1회로 실제 수정됐고(`--json` 동작 확인), 깨끗한 task 2건은 **무변화**였다. 뒤집힘은 2회 시행에서 모두 재현됐다.
- **[관측됨]** 정밀성 fixture: task AC가 같은 `## 7-2`의 *agent-delegated 컨벤션*(단문자 별칭 금지)을 의도적으로 뒤집는 경우, 처방은 **P0로 올리지 않고 P1을 유지**했다. 판정 리포트가 두 발동 조건(Don'ts 위반 / 원장 앵커 결정 위반)을 각각 불충족으로 대조한 뒤 P1을 선택했다 — 블랭킷 승격이 아니라 *판단 절차*로 작동함이 실측됐다.
- **[관측됨] 모델 의존**: 상위 등급 모델은 같은 fixture에서 implement 단계에 그 닫힌 결정을 스스로 회수해 결함이 발생하지 않았고, 그 코드 줄을 *"7-2 / 원장 결정 바인딩 계약"*으로 추적 가능 처리했다. 따라서 본 게이트는 **보편적 맹점의 수정이 아니라 약한·빠른 모델 경로에 대한 보험**이다.
- **[관측됨] 위반 발생 자체는 확률적**: 같은 fixture·같은 약한 모델에서 implement가 그 결정을 회수한 회차와 누락한 회차가 섞였다(3회 중 2회 누락). 따라서 게이트의 효과는 implement를 매개로 재지 않고, **위반 구현을 고정 입력으로 심은 뒤 `/validate-workitem`만 실행하는 결정론 비교**로 확인했다 — 동일 입력에서 변경 전 문구는 **Pass**(같은 위반을 `P1`로 정확히 적고 *"P1이라 Needs Fix를 트리거하지 않는다"*고 명시), 변경 후 문구는 **Needs Fix**(`P0`, D-003의 `status: closed` / `authority: user-approval` / 정본 앵커를 인용). **탐지력이 아니라 등급이 유일한 차이임이 같은 입력에서 증명됐다.**
- **선례**: [.claude/agents/validator.md](../../../.claude/agents/validator.md)의 모바일 `## 7-5` `### Don'ts` 위반은 이미 `P0 [Arch-iface-violation]`이다([ADR-059](ADR-059-flutter-mobile-profile.md) D7). 본 ADR은 그 패턴을 `## 7-1`~`## 7-5` 전체로 일반화하고 *원장으로 뒷받침된 결정* 축을 더한다.

## 결정

### D1. `[Arch-iface-7-N]` 등급 분기
`/validate-workitem`의 Arch-iface audit은 위반의 **출처**에 따라 등급을 나눈다.

- **P0 (Needs Fix 트리거)** — 다음 중 하나라도 해당할 때:
  1. 위반된 7-x 항목이 [DECISION_REGISTER](../../10-charter/DECISION_REGISTER.md)의 `status: closed` + `authority: user-choice|user-approval` 항목으로 추적된다(그 항목의 `정본:` 앵커가 해당 7-x를 가리킨다).
  2. 그 7-x의 `### Don'ts`를 위반한다. **이 조건의 근거는 authority가 아니다** — [ADR-060](ADR-060-decision-closure-and-milestone-seal.md) D9는 `Don'ts` 소항목을 `agent-delegated`로 배정했으므로 "사용자가 승인한 결정"이라는 논거는 여기 적용되지 않는다. 근거는 **금지 규정은 성질상 AC로 회수될 수 없다**는 것이다 — 금지는 "무엇을 하라"가 아니라 "무엇을 하지 말라"라서 어떤 AC·테스트도 대응시킬 수 없고, 따라서 구현 시점 외에 검출 지점이 없다(상류 회수 안 D로도 커버되지 않는다 — 아래 `## 근거`). **현 ARCH에서 `### Don'ts`는 `## 7-1`/`## 7-2`/`## 7-5`에만 존재한다** — `## 7-3`/`## 7-4`에서는 본 조건이 발화하지 않고 조건 1만 적용된다(같은 사실을 `stabilize-milestone` §5-4가 grep 경로에 이미 기록했다). 7-3/7-4의 고-stakes 항목은 [ADR-060](ADR-060-decision-closure-and-milestone-seal.md) D9상 `user-approval`이라 조건 1로 커버되므로 검출 공백은 아니다.
- **P1 (기존 — 보고만)** — 그 외. agent-delegated 컨벤션 불일치, 7-x 본문 문구 미갱신(신규 결정을 도입했으나 본문에 반영 안 됨) 등. **위 두 P0 조건이 P1 규칙보다 우선한다** — `Don'ts` 위반이 `agent-delegated` 소항목이라는 이유로 P1로 내려가지 않는다(두 절에 동시 해당하는 유일한 케이스라 명시한다).
- 원장 파일이 없거나 해당 앵커 항목을 찾지 못하면 **P1**로 두고 그 사실을 report에 한 줄 남긴다(게이트가 조용히 열리지 않게).

집계 규칙은 바꾸지 않는다 — 기존 "어느 한 축이라도 P0면 Needs Fix"가 그대로 적용된다.

### D2. 닫힌 결정 바인딩을 추적 근거로 인정
[ADR-006](ADR-006-simplicity-and-architecture.md)#amend-1의 *"변경한 모든 줄은 task의 AC 또는 명시 요청으로 거꾸로 추적 가능해야 한다"* 에서, **원장의 `closed` + `authority: user-*` 항목(`D-NNN`) 바인딩은 "명시 요청"에 포함된다**.

- 즉 닫힌 결정을 이행해 추가된 줄은 대응 AC가 없어도 diff trace audit에서 *추적 가능*으로 분류하고, 근거를 `D-NNN` + 7-x 앵커로 적는다.
- **ADR-006 본문은 수정하지 않는다** — 기존 문구의 해석을 고정하는 것이며 supersede가 아니다.
- 근거: D1을 켜면 repair가 닫힌 결정을 이행하는데, 그 코드·테스트가 어떤 AC에도 대응하지 않아 *추적 불가*로 오분류되는 충돌이 실측됐다(축 간 판정 불일치 1건). 상위 등급 모델은 이미 이 표기로 해소하고 있었다.

## 근거 (대안 비교)

| 안 | 편익 | 제약 |
|---|---|---|
| **A. 현행 유지(전부 P1)** | 차단 0 · 비용 증가 0 · 결정 카드 증가 0 | 승인해 닫은 결정이 출하되고 graduation까지 통과한다(실측). 리뷰 opt-in을 건너뛰면 회수 경로가 없다 |
| **B. 7-x 위반 전부 P0** | 규칙이 단순하고 누락이 없다 | agent-delegated 컨벤션 불일치·문구 미갱신까지 Pass를 막아 **과잉 차단**(정밀성 fixture가 그 케이스). 문서 갱신 권장이 상시 repair 비용으로 바뀐다 |
| **C. 원장 앵커·Don'ts로 좁힌 분기 (채택 = D1)** | 실측에서 결함만 차단(과잉 차단 0/4) · 깨끗한 task 비용 증가 0 | **원장 품질에 의존한다** — 원장이 비거나 앵커가 부실하면 P1로 떨어져 게이트가 열린다(그래서 그 사실을 report에 남기게 했다) |
| **D. 상류 강제 — 봉인 조건에 "ARCH 7-x `user-approval` 결정 ↔ AC 회수" 추가** (미채택, 차기 라운드) | 구현 *전*에 막아 implement·repair 낭비가 0 · 결정이 AC로 회수되면 **기존 AC↔테스트 ❌ 트리거가 이미 차단**하므로 새 등급 의미가 0개 · D2도 불필요해진다 | 봉인 차단 범위·결정 카드를 넓히는 변경이라 SIMULATION_RUN Round 9가 명시적으로 범위 밖에 파킹했다(같은 문서의 "잔여 한계"). **D1과 배타적이지 않고 상보적**이다 — `Don'ts` 류 금지 규정(위 D1 조건 2)과 봉인 후 닫힌 결정은 이 안으로 커버되지 않는다 |

## 신뢰도
**Medium-High** — 게이트 자체는 *동일 고정 입력*에 대한 결정론 비교로 검증됐다(변경 전 Pass / 변경 후 Needs Fix). 정밀성(agent-delegated 컨벤션 위반은 P1 유지)도 실측이다. 낮추는 요인: fixture 4종·시행 ≤2의 소표본, 상위 등급 모델 경로에서는 애초에 발동하지 않음, 그리고 upstream(implement)의 위반 발생률 자체가 확률적이라 *게이트가 실제로 얼마나 자주 구제하는지*는 미측정. **실측 축은 `## 7-2` 단독이다** — 7-1/7-3/7-4/7-5 적용은 같은 조건문의 논리적 확장이며 미실측이다(그래서 D1을 축별 항목에 복제하지 않고 7-x 공통 항목 1개로 뒀다 — 축마다 문구가 갈리면 실측한 축과 다른 규칙이 도는 것을 막을 수 없다).

## 재검토 트리거
1. 벤치 fixture가 계획-정합(plan-clean)한 상태에서 **False-Fix(정상 산출물인데 Needs Fix)가 1건 이상** 나오면 발동 조건을 재검토한다.
2. **원장 앵커 부재로 P1로 떨어진 사례가 2회 이상** 누적되면 **상류 강제**(위 `## 근거` 안 D — `/seal-milestone` 조건에 ARCH 7-x `user-approval` 결정 ↔ AC 회수 검사 추가, [ADR-060](ADR-060-decision-closure-and-milestone-seal.md) D7 조건군)를 검토한다. *본 게이트 자체를 봉인 시점으로 옮기는 것은 불가하다* — 봉인은 구현 **전**이므로(D7 진입 모드가 "구현 0건" 기준) 구현이 결정을 뒤집었는지 그 시점에 관측할 수 없다. 옮길 수 있는 것은 결정↔AC 회수 검사뿐이다.
3. 상위 등급 모델이 기본 경로가 되어 약한 경로가 사라지면 본 게이트의 편익이 줄어든다 → enabling(약)으로 강등 검토.

## 결과
- 사용자가 승인해 닫은 인터페이스 결정을 구현이 뒤집으면 **opt-in 리뷰 없이도 inner loop가 차단**한다.
- agent-delegated 컨벤션·문서 문구 미갱신은 종전대로 보고만 — 차단 범위가 넓어지지 않는다.
- 닫힌 결정에서 파생된 코드가 AC 부재로 *추적 불가*로 오분류되지 않는다(D2).

## Mutation Contract (ADR-047 D3)
1. **Target** — `.claude/skills/validate-workitem/SKILL.md`의 Arch-iface audit 판정 기준(등급 분기 + D2 추적 근거) · `.claude/agents/validator.md`의 **7-x 공통 등급 분기 항목 1개**(축별 항목 위에 두고 그 기본 등급보다 우선하게 둔다 — 축 하나만 scoped로 받는 validator가 자기 축 항목만 읽고 기본 등급을 발급하는 것을 막는다).
2. **Failure mode** — 원장에서 `closed` + `authority: user-*`로 닫힌 7-x 결정을 구현이 뒤집었는데 P1 보고만 남고 Pass→finalize→커밋까지 진행됨(관측됨 — 위 `## 배경` 1번, SIMULATION_RUN Round 9 "구멍 B"의 inner-loop 재현).
3. **Predicted improvement** — 같은 fixture에서 그 task의 판정이 Needs Fix로 바뀌고 repair 후 Pass로 돌아오며, 정상 task의 판정·비용은 변하지 않는다.
4. **Preserved invariants** — P1의 report-only 기본값 · 집계 규칙("P0 있으면 Needs Fix") · report 양식/섹션 · `[Arch-iface-7-N]` 라벨 이름 · validator의 partial verdict 계약(report 파일 미작성).
5. **Falsifying evaluation** — 행동 fixture 4종을 대조군(본 ADR 적용 전 문구)과 비교해 사람이 확인한다([ADR-047](ADR-047-code-as-agent-harness.md)#amend-1 #3의 체크리스트 형식. 러너는 로컬 inner-loop 벤치 프로토타입 — 미커밋):
   - (a) **[결정론 — 필수]** ARCH 7-x의 *원장 앵커 결정*을 위반한 **완성된 구현을 고정 입력으로 심고** `/validate-workitem`만 실행 → **Needs Fix**(P0). 같은 입력에서 대조군(변경 전 문구)은 Pass였다. *implement를 매개로 재지 않는다 — 위반 발생 자체가 확률적이라 신호가 흐려진다.*
   - (b) 그 위반을 repair가 고친 뒤 재검증 → **Pass** + 원장 재대조 기록.
   - (c) task AC가 *agent-delegated 컨벤션*을 뒤집는 구현 → **Pass**(P1 유지). P0로 올라가면 본 변경을 되돌린다.
   - (d) 7-x와 무관한 정상 task 2종 → 판정·비용 **무변화**.
   (a)가 뒤집히지 않거나 (c)가 P0로 올라가면 본 ADR을 되돌린다.
6. **Rollback path** — 본 ADR을 `superseded`로 두고 위 2파일의 해당 부분을 원복한다(SKILL.md 1문장 원복 · validator.md 7-x 공통 등급 분기 bullet 1개 삭제 — 축별 항목은 손대지 않았으므로 삭제만으로 변경 전 동작이다). D2만 문제면 D2 문장만 제거(D1은 독립적으로 유효).

## 정책 강도 (ADR-022 정합)
**constraint(강) — [관측됨]**. Pass를 막는 변경이므로 강 제약이며, 근거는 위 `## 배경`의 대조군 실측이다. 단 (i) 발동 조건이 *원장 앵커 또는 Don'ts*로 좁게 한정되고, (ii) 정당화는 **"약한·빠른 모델 경로에 대한 보험"**이다 — 상위 등급 모델 경로에서는 결함 자체가 관측되지 않았다. 이 한정을 지우고 7-x 위반 전체를 P0로 넓히는 변경은 본 ADR의 근거로 정당화되지 않는다(대안 B의 제약 참조).

## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT)
- .claude/skills/validate-workitem/SKILL.md      — D1 등급 분기 + D2 추적 근거
- .claude/agents/validator.md                    — D1 (7-x 공통 등급 분기 항목 — 축별 항목보다 우선)
- docs/00-meta/STRUCTURE.md                      — Canonical Owner 표 1행

## 후속 작업
- **[ADR-017](ADR-017-dogfood-simulation.md) 재실행 트리거 발화**(신규 ADR 도입). ADR-047#amend-1 #4에 따라 값싼 앞단 게이트(위 `## Mutation Contract` 5의 fixture 4종)를 먼저 통과시켰고, 전체 lifecycle dogfood는 다음 라운드에 묶어 실행한다.
- **False-Fix(정상 산출물인데 Needs Fix)를 게이트 지표로 쓰려면 그 fixture 자체가 계획-정합(plan-clean)이어야 한다** — 매핑표가 인용한 AC가 실제로 그 시나리오를 검증하지 않으면 validator의 정당한 `[Spec-gap]` P0가 과잉 차단으로 오분류된다(실측 1건: 매핑 결함 2개를 고친 뒤 같은 fixture·같은 모델에서 `[Spec-gap]` 해당없음으로 전환됨).
- task `## 6-1. 테스트 시나리오`가 구현 후에도 빈 채로 남는 별개 결함(모델에 따라 보고 여부가 갈림)은 본 ADR 범위 밖 — 별도 처방.

## 참고
- ADR-006#amend-1 (diff trace audit — D2가 해석 고정), ADR-017 (dogfood 트리거), ADR-022 (Ratchet — 정책 강도), ADR-027 (인터페이스 결정 할당), ADR-037 (spec coverage), ADR-038 (cross-LLM plan validation — opt-in 한계), ADR-045 (참조 계약), ADR-047 D3/D8 (mutation contract / oracle adequacy), ADR-051 (validate fan-out), ADR-059 D7 (모바일 Don'ts P0 — 본 결정의 선례), ADR-060 D1/D2/D7 (원장·authority·봉인)
