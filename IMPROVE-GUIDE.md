# 개선 가이드 — 기획 결정 마감(Decision Closure) + 마일스톤 봉인(Milestone Seal)

## 이 개선이 하려는 것

**목표**: 마일스톤 하나의 개발을 시작하는 시점에, 그 마일스톤에 영향을 주는 **알려졌거나 합리적으로 발견 가능한 미결정을 0건**으로 만든다. "불확실성 0"이 아니다 — 모든 결정을 미리 알아내는 건 불가능하므로 **최대한 닫고 가는 것**이 목표다. 가설은 *검증 계획과 위험 수용이 확정된 상태*로 닫는다.

**현재 무엇이 문제인가** (전부 실측 확인됨):
1. `DISCOVERY §11` / `PROJECT_CHARTER §10` / `ARCHITECTURE_OVERVIEW §10`의 "열린 질문" 섹션은 **읽는 skill이 0곳**이다. 死문서.
2. `WORKFLOW.md`의 기본 원칙이 *"애매한 사항은 문서에 가정과 열린 질문으로 남긴다"* 로, **열어두고 진행을 정책이 허용**한다.
3. `bootstrap-stack`이 `ARCHITECTURE_OVERVIEW ## 7-1`~`## 7-5`(인증·트랜잭션·DB migration·권한 흐름·서명 등 되돌리기 비싼 결정)를 **사용자 라운드 없이 architect 단발 호출로 채운다**.
4. `ADR-053` 고-stakes 패널의 종착지가 "ARCH §7 결정 블록 **기록**"이라 **사용자 선택 단계가 없다**.
5. M/F가 task 분해 **전에** `ready`로 잠겨서, 첫 구현 전에 상위 계약 결함을 찾아도 기본 경로가 "다음 마일스톤"이다.

**해결 골자**:
- 결정 원장 `DECISION_REGISTER.md` 1개를 만들고 열린 질문 섹션 5곳을 흡수한다.
- 모든 결정에 **결정권(authority)**을 부여한다 — 사용자가 고를 것 / 사용자가 승인할 것 / AI가 정할 것.
- 사용자 결정에는 **Decision Brief**(배경·용어·선택지·트레이드오프·추천)를 제시한다.
- M/F 상태에 `contract-ready`를 넣어 **task 분해 중에도 상위 계약을 고칠 수 있게** 한다.
- 신규 `/seal-milestone`이 최종 검사 + 사용자 승인 + 일괄 잠금을 담당한다.

---

## 작업 전 확인

- 작업 디렉터리: 저장소 루트. `main`이 아닌 작업 브랜치를 만든다.
- **Phase 1 → 10 순서 의존**이다. 앞 Phase를 건너뛰면 뒤 Phase의 참조가 깨진다.
- 각 Phase 끝의 커밋 메시지를 그대로 쓴다. **명시 파일 add**로 커밋한다 (`git add -A` 금지).
- **중간 커밋은 transitional이다** — Phase 3이 섹션을 폐지한 뒤 Phase 4~8이 소비자를 고치고, Phase 5가 승격을 떼어낸 뒤 Phase 6이 seal을 놓는다. 전 Phase가 끝나기 전에는 `/stabilize-milestone`을 돌리지 않는다(preflight가 과도기 상태를 결함으로 보고한다).
- **"기존" 블록이 줄 전체가 아니라 *일부 문장·조각*을 인용한 곳이 많다**(3.5(b)(b-2) · 4.4(b)(c) · 5.2(b)(d)(e) · 7.1(i) · 7.3(d)(e)(f) · 7.4(b) · 8.1(h) 등). 이런 곳에서는 **인용된 조각만 교체하고 같은 줄의 나머지는 그대로 둔다.** 줄 단위로 통째 치환하면 뒤에 붙은 규칙이 유실된다. 판단 기준: "기존" 블록이 문장 끝의 마침표까지 포함하지 않거나 `…`로 끝나면 조각 인용이다.
- 아래 신규 파일 본문은 **4-backtick 펜스(````)로 감쌌다** — 내부에 3-backtick 블록이 있기 때문이다. 파일에 쓸 때는 바깥 4-backtick 줄을 빼고 내용만 넣는다.
- **Phase 10(dogfood)은 필수다** — ADR-017 재실행 트리거 2종("새 ADR 도입", "lifecycle 단계 변경")이 모두 발동한다.
- 본 개선은 ADR-027·ADR-057 통합 재발행을 **포함하지 않는다** — 의도적 결정이며 누락이 아니다.
  - **근거**: ADR-045 D6는 *"정책 의미 변경·기존 결정 뒤집기·surface 5+ 추가는 **신규 supersede ADR로 간다**"*로 이 케이스의 정답을 지정한다. **통합 재발행은 "개정(amend) 8개 이상 누적" 케이스**의 처방이다. 본 개선은 두 ADR에 amend를 추가하지 않고 신규 ADR-060으로 부분 supersede + 참조 표기 한 줄만 남기므로 누적이 늘지 않는다.
  - **남는 것**: ADR-027(개정 8개, surface 5+ 도달)의 전용 재발행 라운드는 **별도 과제로 그대로 유효**하다. ADR-057도 다음에 *본문을 고칠 때* 재발행 대상이다. 이 개선을 마친 뒤 별도 라운드로 수행한다.
  - **왜 지금 안 하나**: ADR-027 재발행은 앵커 99개 재매핑 + 인용 182개 중 역사 기록 분리가 선행 작업이고, ADR-057 재발행은 결정 15개 + 개정 3개 재작성 + Surfaces 30개 재점검이다. 둘 다 본 개선과 내용상 무관한 정리 작업이라 섞으면 양쪽 품질이 함께 떨어진다.
  - **실제 구동 기준(혼선 방지)**: 본 개선에서 ADR-035·046·053은 amendment로, ADR-007·026·027·036·037·057은 참조 표기로 처리한다. 갈린 기준은 "정책 의미 변경 여부"가 아니라 **개정 누적 여유**다 — 개정이 적어 amend를 더 쌓아도 되는 ADR(035=2, 046=0, 053=1)은 amendment로 본문을 정정하고, 누적이 많거나(027=8) 재발행을 이미 서약한(057) ADR은 참조 표기만 남겨 누적을 늘리지 않는다. 다음 라운드에서 같은 판단을 재연할 수 있도록 명시해 둔다.

---

# Phase 1 — 기반 파일 생성

> 이후 모든 Phase가 이 두 파일을 참조한다. 반드시 먼저 한다.

## 1.1 결정 원장 파일 생성

**새 파일**: `docs/10-charter/DECISION_REGISTER.md`

아래 내용 그대로 작성한다.

````markdown
# 결정 원장 (Decision Register)

> 모드: Living (결정 인덱스). 정책 SSOT는 [ADR-060](../90-decisions/boilerplate/ADR-060-decision-closure-and-milestone-seal.md).
> 결정 *본문*은 각 정본 문서(DISCOVERY / Charter / ARCHITECTURE / DESIGN / ADR / milestone / feature)가 SSOT이고, 본 파일은 **위치와 처분 상태만** 가리킨다 (ADR-005 정합).

## 이 파일의 역할

기획 단계에서 발생한 *사용자가 정하거나 승인해야 할 결정*을 한 곳에 모은다. 각 항목은 닫히거나(`closed`), 앵커를 갖고 미뤄지거나(`deferred`), 열려 있다(`open`).
`/seal-milestone`은 **그 마일스톤에 영향을 주는 `open` 항목이 0건**일 때만 봉인한다(예외: 봉인 도입 전에 이미 구현이 시작된 마일스톤의 grandfather 진입 — 그때는 보고만 하고 차단하지 않는다. ADR-060 D12).

## 등재 범위 (원장을 얇게 유지하는 규칙)

| 등재한다 | 등재하지 않는다 |
|---------|----------------|
| `authority: user-choice` · `user-approval` 결정 **전부** | `agent-delegated` 결정 (라운드 종료 **일괄 확인 1회**로만 처리) |
| 종류 불문 `open` · `deferred`로 남는 항목 | 코드 품질·형식 지적(raw hex·컴포넌트 중복·voice 위반 등) — skill 출력의 `남은 미결정 사항` 슬롯이 소유 |
| 일괄 확인에서 사용자가 뒤집은 `agent-delegated` (→ `user-approval`로 등재) | 계획 결함(unmapped FAC/PX·의존성 결함·AC 해석 후보) — 각 소유 문서와 skill 출력이 소유 |

원장은 **기획 결정**의 인덱스다. 결함 추적기가 아니다.

## 항목 형식 (2줄 — 헤더 + 세부)

```
- **D-NNN** | authority: user-choice|user-approval|agent-delegated | status: open|deferred|closed | disposition: chosen|risk-accepted|n/a
  - 질문: 한 줄
  - 영향: <M1 | M1 / F-003 | (미할당)> | <상황별 칸> | <근거·회수 정보>
```

`영향:` 다음 `<상황별 칸>`은 상태에 따라 다르다 — `closed`면 `정본: <문서#앵커>`, `deferred`면 `앵커: <이관처> | 회수: <시점>`, `open`이면 `필요 시점: <언제까지>`(+ 선택 `blocker: research|dependency`).

`영향:` 칸은 **항상 `M<N>` 또는 `(미할당)`으로 시작**한다 — 봉인 검사가 이 토큰으로 색인하므로, 없으면 그 항목은 어떤 검사에도 잡히지 않는다. feature 단위면 `M1 / F-003`처럼 둘 다 적고, **`deferred`의 "현재 M 무영향" 사유는 M ID 뒤에 괄호로 덧붙인다**: `영향: M1 (현재 M 무영향 — 오프라인 기능이 M2 범위)`. 사유만 적고 M ID를 빼면 `deferred` 3필드 검사와 receipt 집계에서 누락된다.

**`(미할당)` 규약 (필수)**: `/discover-product`·`/bootstrap-project`·`/bootstrap-stack`·`/bootstrap-design`은 **마일스톤이 존재하기 전에** 실행된다(M1 생성은 `/plan-milestone` 단독 — ADR-057 결정 1). 이 시점에 등재되는 항목은 `영향: (미할당)`으로 적는다.
- `/plan-milestone` **R1이 `(미할당)` open 항목을 전수 triage**한다 — 이번 M 범위면 `영향: M<N>`으로 배정, 아니면 앵커를 붙여 `deferred`. triage 없이 넘기지 않는다.
- `/seal-milestone` 조건 6과 `/plan-milestone` Exit는 **`영향: M<N>` 항목 + `영향: (미할당)` 항목을 함께** 회수한다. 그러지 않으면 상류에서 정직하게 등재한 미결정이 봉인 검사에서 통째로 샌다.

### 필드 정의

> `authority` 분류축은 **"정책이냐 구현 방식이냐"**다 — 같은 주제(예: 보안)라도 *무엇을 지킬지·어디까지 감수할지*는 `user-choice`, *그것을 어떤 방식으로 구현할지*는 `user-approval`이다. 한 결정이 두 층을 걸치면 분해하고, 분해가 어려우면 더 높은 쪽으로 올린다 (ADR-060 D2).

| 필드 | 값 | 의미 |
|------|----|----|
| `authority` | `user-choice` | 사용자가 직접 고른다 — 제품 의도·범위·우선순위·사용자 체감·외부 계약·비용·**보안/프라이버시 정책과 위험 허용도**·비가역 약속 |
| | `user-approval` | AI가 안을 내고 사용자가 승인한다 — 스택·**인증 방식**·**데이터 경계 구현**·되돌리기 비싼 구조 |
| | `agent-delegated` | 승인된 경계 안의 **가역적** 내부 구현 선택 — 개별 등재 대상이 아니다(위 등재 범위) |
| `status` | `open` | 미결. **봉인 차단** |
| | `deferred` | 현재 M 무영향 + 이관 앵커 보유. 봉인 허용 |
| | `closed` | 결정 완료. 봉인 허용 |
| `disposition` | `chosen` | 선택지 중 하나를 골라 닫음 |
| | `risk-accepted` | 가설 위험을 사용자가 수용해 닫음 (검증 방법·판정일·중단 기준 필수) |
| | `n/a` | 아직 닫히지 않음 (`open`/`deferred`) |
| `blocker` | `research` / `dependency` | `open`의 하위 사유 (선택) |

### 불변식 (위반 시 봉인 차단)

1. `authority`는 항목이 **열릴 때** 확정한다. 이후 `user-*` → `agent-delegated` **하향은 사용자 명시 승인 없이 불가**하며, 변경 시 항목에 이력 줄을 남긴다: `- authority 변경: user-approval → agent-delegated (사용자 승인 <YYYY-MM-DD>)`. 이력 줄 없는 `agent-delegated`가 되돌리기 비싼 결정을 담고 있으면 `[Plan-decision]`이 오분류로 잡는다.
2. `status: closed` + `authority: user-*` → **승인 근거(날짜/발화)** 필수.
3. `disposition: risk-accepted` → `authority`는 `user-*`만 가능 + **검증 방법·판정일·중단 기준** 3개 모두 필수.
4. `status: deferred` → **현재 M 무영향 근거 + 이관 앵커 + 회수 시점** 3개 모두 필수. 하나라도 없으면 `open`으로 간주한다.
5. `authority: agent-delegated`로 등재된 항목은 승인된 경계 안의 **가역적** 내부 선택에만 허용한다.

### 이관 앵커 종류 (`deferred` 전용)

| 사유 | 앵커 | 회수 시점 |
|------|------|----------|
| 다음 마일스톤 범위 | `docs/30-workitems/ROADMAP.md`의 candidate-key | 그 M의 `/plan-milestone` R1 |
| 검증할 가설 | `docs/10-charter/DISCOVERY.md ## 12` A-N | `/discover-product --update` |
| 프로세스 개선 | `docs/40-validation/IMPROVEMENT_GUIDE.md` `[ADR-candidate]` | 다음 `/plan-milestone` R0 |

**현재 M을 막는 사실 조사는 `deferred`가 아니다** — 봉인 전에 `/research-pack`으로 끝낸다. 마일스톤 안의 research task로 미루면 "봉인해야 조사하고, 조사해야 봉인한다"는 순환이 된다. 연구 자체가 마일스톤 산출물이면 별도 선행 마일스톤으로 분리한다.

### 봉인 후 새 결정 (차단 아님 — 기록 + 라우팅)

봉인 뒤 구현 중에 새 결정이 드러나면 원장에 `status: open`으로 등재하되 항목에 **`- 발견: 봉인 후 (M<N>)`** 줄을 붙인다(`M<N>` = 그 항목이 드러난 시점에 봉인돼 있던 마일스톤). **이 마커는 그 M의 봉인 검사에서만 제외된다** — 항목이 `영향: M2`도 가지면 M2 봉인에서는 정상 검사 대상이다(범위 없는 제외는 후속 마일스톤에서도 항목을 숨긴다).
**이 항목들은 착수를 막지 않는다** — 봉인 시점 검사를 통과한 계획은 그대로 진행하고, 새 항목은 ADR-057#amend-3 결정 6 라우팅을 탄다:
- 기존 task·AC가 이미 약속한 동작의 결함 → `/repair-workitem`
- 담당 task가 없거나 새 범위 → 사용자 보고 + **다음 마일스톤 후보**
- 불명확하거나 현재 M 진행을 막는 상위 P0 → 자동 선택하지 않고 사용자 결정을 기다린다

쓰기 주체: `/repair-workitem`(task 결함과 함께), `/stabilize-milestone`(발견 기록), 사용자 직접 편집.

### 회수 규칙 (ADR-019 정합)

본 파일을 통째로 읽지 않는다. `status:` / `영향: M<N>` **+ `영향: (미할당)`** 색인으로 먼저 걸러 해당 항목만 읽는다(`(미할당)`을 빼면 bootstrap 구간 등재분이 통째로 샌다 — 위 규약 참조).
`closed`·`deferred` 행은 **삭제하지 않는다** — 승인 이력과 다음 마일스톤 회수의 근거다.

## 결정 항목

<!-- 아래에 D-001부터 append. 예시는 지우고 쓴다.

- **D-001** | authority: user-approval | status: closed | disposition: chosen
  - 질문: 로그인 방식을 세션 vs 토큰(JWT) 중 무엇으로 할 것인가
  - 영향: M1 | 정본: ARCHITECTURE_OVERVIEW.md#arch-7-3 | 근거: 2026-07-29 사용자 승인 (세션)

- **D-002** | authority: user-choice | status: deferred | disposition: n/a
  - 질문: 오프라인 편집 충돌 병합 규칙
  - 영향: M1 (현재 M 무영향 — 오프라인 기능 자체가 M2 범위) | 앵커: ROADMAP `offline-merge` | 회수: M2 plan-milestone R1

- **D-003** | authority: user-choice | status: open | disposition: n/a | blocker: research
  - 질문: 결제 대행사 선택
  - 영향: M1 / F-003 | 필요 시점: seal 전 (/research-pack 선행)

- **D-004** | authority: user-approval | status: open | disposition: n/a
  - 질문: 이미지 저장을 로컬 vs 오브젝트 스토리지 중 무엇으로
  - 영향: (미할당) — bootstrap 단계 등재, 다음 /plan-milestone R1이 triage
-->
````

## 1.2 ADR-060 생성

**새 파일**: `docs/90-decisions/boilerplate/ADR-060-decision-closure-and-milestone-seal.md`

아래 내용 그대로 작성한다.

````markdown
# ADR-060 — 기획 결정 마감 + 마일스톤 봉인 (Decision Closure & Milestone Seal)

> scope: boilerplate
> area: process

## Status
accepted

## 현재 유효 결정
- 사용자가 정하거나 승인해야 할 기획 결정은 `docs/10-charter/DECISION_REGISTER.md`에 등재하고, 결정 *본문*은 각 정본 문서가 SSOT다. 문서의 "열린 질문" 섹션 5곳은 폐지한다.
- 각 결정은 열릴 때 `authority`(user-choice / user-approval / agent-delegated)를 부여받는다. 하향 변경은 사용자 승인 + 이력 줄이 필요하다. `agent-delegated`는 개별 등재 대상이 아니라 라운드 일괄 확인 대상이다.
- `user-*` 결정은 **Decision Brief**(배경·용어·선택지·트레이드오프·추천·답변 방법)로 제시한다. 라운드당 3~5개 상한.
- M/F 상태는 `draft → contract-ready → ready`. `contract-ready`는 task 분해 진입 자격이고, `ready`는 `/seal-milestone`만 부여한다.
- 봉인 조건: 현재 M 영향 `open` 0건 + task 완결(AC 해석 확정·TDD 형식 포함) + 재대조 통과 + 사용자 최종 승인. 승격 순서는 task → feature → milestone이며 중단 후 재실행이 나머지를 승격한다.
- 봉인 후 새로 드러난 결정은 원장에 기록하되 **착수를 막지 않고** 기존 finding 라우팅(repair / 사용자 보고 / 다음 M)을 탄다.

## 배경
- [관측됨] `DISCOVERY ## 11` / `PROJECT_CHARTER ## 10` / `ARCHITECTURE_OVERVIEW ## 10`의 "열린 질문" 섹션을 읽는 skill이 0곳이다. 기록은 되지만 아무도 회수하지 않는 dead governance field이며, ADR-056#amend-3이 FEATURE `## 8-1`에 대해 진단한 것과 동형이다.
- [관측됨] `WORKFLOW.md` 기본 원칙이 "애매한 사항은 문서에 가정과 열린 질문으로 남긴다"로, 상위 정책이 *보존*을 기본값으로 둔다. 개발 전 폐쇄를 요구하는 문장이 저장소 어디에도 없다.
- [관측됨] 게이트 분포가 되돌리기 비용과 반대다. task/AC 층에는 3중 차단이 있고, 상류(제품 범위·스택·§7-x 인터페이스·시각 방향)에는 결정 폐쇄 게이트가 없다.
- [관측됨] `bootstrap-stack`이 `ARCH ## 7-1`~`## 7-5` 채움을 "architect 단발 sub-call(라운드 아님)"으로 규정한다. `## 7-3`(DB migration·인증·API versioning)과 `## 7-5`(대상 플랫폼·권한 흐름·서명)는 ADR-053 S1/S4에 정면 해당하는 되돌리기 비싼 결정인데 사용자 확정 없이 자동 확정된다.
- [관측됨] ADR-053 결정 2의 종착지가 "④ ARCHITECTURE §7 결정 블록 기록"이라, 리서치·다각도·적대 검토를 거쳐도 *사용자 선택* 단계가 없다.
- [관측됨] M/F가 task 분해 전에 `ready`로 잠긴다(ADR-057#amend-3 결정 5). 그래서 첫 구현 전에 상위 계약 결함을 찾아도 `repair-plan`이 고치지 못하고 기본 경로가 "다음 마일스톤"이다.

## 결정

### D1. 결정 원장 (Decision Register)
`docs/10-charter/DECISION_REGISTER.md`를 신설한다(presence: baseline, lifecycle: Living). 결정 *본문*은 정본 문서에 두고 원장은 **위치·처분 상태만** 가리킨다(ADR-005 정합).
다음 5개 "열린 질문" 섹션을 **폐지**하고 원장으로 통합한다 — `DISCOVERY ## 11`, `PROJECT_CHARTER ## 10`, `ARCHITECTURE_OVERVIEW ## 10`, `MILESTONE_TEMPLATE ## 7`, `FEATURE_TEMPLATE ## 12`.
섹션 번호는 **재사용하지 않는다**(결번 — ADR-002/003 legacy reserved 선례). 후속 섹션 번호를 당기면 기존 인용이 전부 깨진다.

**등재 범위 (원장을 얇게 유지)**: 등재 대상은 `authority: user-*` 결정 전부 + 종류 불문 `open`/`deferred`로 남는 항목이다. **`agent-delegated`는 개별 등재하지 않고** 라운드 종료 일괄 확인 1회로만 처리한다(그 자리에서 사용자가 뒤집으면 `user-approval`로 등재). **코드 품질·형식 지적(raw hex·컴포넌트 중복·voice 위반)과 계획 결함(unmapped FAC/PX·의존성·AC 해석 후보)은 원장 대상이 아니다** — 기존 skill 출력의 `남은 미결정 사항` 슬롯과 각 소유 문서가 그대로 소유한다. 원장은 결함 추적기가 아니라 기획 결정 인덱스다.

**`(미할당)` 항목**: 마일스톤이 생기기 전(bootstrap 구간)에 등재되는 항목은 `영향: (미할당)`으로 둔다. `/plan-milestone` R1이 이를 전수 triage해 `영향: M<N>` 배정 또는 앵커 붙인 `deferred`로 정리하며, `/seal-milestone` 조건 6과 `/plan-milestone` Exit는 **`M<N>` 항목과 `(미할당)` 항목을 함께 회수**한다. 그러지 않으면 상류에서 정직하게 등재한 미결정이 봉인 검사에서 통째로 샌다.

### D2. 결정권 축 (authority) — 결정 *전* 제약
각 결정은 원장에 등재될 때 `authority`를 받는다. **분류축은 "정책이냐 구현 방식이냐"다** — 같은 주제(예: 보안)라도 *무엇을 지킬지·어디까지 감수할지*는 `user-choice`, *그것을 어떤 방식으로 구현할지*는 `user-approval`이다:
- `user-choice` — 제품 의도·범위·우선순위·사용자 체감·외부 계약·비용·**보안/프라이버시 정책과 위험 허용도**·비가역 약속. (예: "개인정보를 수집할 것인가", "결제 실패를 어디까지 감수할 것인가")
- `user-approval` — AI가 안을 내고 사용자가 승인. 스택·**인증 방식**·**데이터 경계 구현**·되돌리기 비싼 구조. (예: "세션 vs JWT", "테넌트 분리를 스키마로 할 것인가 컬럼으로 할 것인가")
- `agent-delegated` — 승인된 경계 안의 **가역적** 내부 구현 선택.

한 결정이 두 층을 함께 건드리면 **분해한다** — 정책 질문을 `user-choice`로 먼저 닫고, 그 답을 전제로 구현 방식을 `user-approval`로 낸다. 분해가 어려우면 더 높은 쪽(`user-choice`)으로 올린다.

**`authority`는 결정 결과에서 파생하지 않는다** — 결정이 열릴 때 확정하는 *입력 제약*이다. 파생시키면 에이전트가 핵심 결정을 먼저 `agent-delegated`로 분류한 뒤 스스로 닫을 수 있다. `user-*` → `agent-delegated` 하향은 사용자 명시 승인 없이 불가하며, 변경 시 항목에 이력 줄을 남긴다.

본 축은 ADR-056 결정 4의 비대칭("내부 엔지니어링 선택은 자율, 사용자가 보고 느낄 것을 좁히면 무조건 질문")을 상류로 **일반화**한 것이다. 새 taxonomy 발명이 아니다.

**ADR-053 S1~S4는 결정권 축이 아니다** — *분석 깊이*(리서치·다각도·적대 검토 발동 여부) 판정에만 쓴다. S2("합리적 대안 2개 이상")는 가역적 내부 선택에도 성립하므로 결정권 트리거로 쓰면 과발동한다.

### D3. Decision Brief (사용자 결정 지원 포맷)
`authority: user-choice | user-approval` 결정은 다음 6블록으로 제시한다. `agent-delegated`는 대상이 아니다.

```
결정 D-NNN — <질문 한 줄>

1. 배경 — 왜 지금 정해야 하나 (지금 안 정하면 무엇이 막히나)
2. 용어 — <이 결정에 필요한 개념을 아무 배경 없이도 이해하도록 1~2줄씩>
3. 선택지 A / B (/ C) — 각각:
   · 한 줄 요약
   · 이 프로젝트에서 실제로 어떻게 보이나 (사용자 체감)
   · 장점 / 감수할 것
4. 나중에 바꾸려면 — 되돌리기 비용(높음/중간/낮음) + 무엇을 다시 해야 하나
5. 추천 — <안> (이유 2줄, charter `## 5 비목표` / `## 7 제약` 근거)
6. 답변 — "A" / "B" / "추천대로" / "더 설명" / "나중에(→ 이관처 제안)"
```

**운영 규칙**:
- 라운드당 **3~5개 상한**. 초과분은 다음 라운드로.
- 필수 결정에 `skip`을 허용하지 않는다. 사용자는 선택 / 추가 설명 / 리서치 요청 / 연기 요청 중 하나를 고른다.
- 사용자 답변을 **평이한 문장으로 재진술해 확인**한 뒤 정본에 기록한다.
- 라운드 종료 시 **일괄 확인 1회**: 그 라운드의 `agent-delegated` 결정 목록을 한 번에 제시하고 "바꿀 것 있으면 알려달라"고 확인받는다.
- **5번 "추천" 블록의 예외**: 취향이 오라클인 결정(ADR-058 D5 — 시각 방향 선택 등 `/bootstrap-design` R2)에서는 **추천 블록을 비워 둔다.** 대신 "원하시면 추천을 요청하실 수 있어요" 안내를 넣고, 사용자가 요청할 때만 채운다. 그 외 결정에서는 추천이 필수다.

본 포맷은 ADR-046 압축 계약의 **명시적 예외**다(ADR-046#amend-1).

### D4. 유예(deferred) 앵커 규약
`deferred`는 **현재 M 무영향 근거 + 이관 앵커 + 회수 시점** 3개를 모두 가질 때만 성립한다. 하나라도 없으면 `open`으로 간주해 봉인을 막는다. 단순 parked는 허용하지 않는다.
현재 M을 막는 사실 조사는 `deferred`가 아니라 **봉인 전 `/research-pack`**으로 종결한다. 연구 자체가 마일스톤 산출물이면 별도 선행 마일스톤으로 분리한다.

### D5. 가설 처리 (위험도 4단계)
ADR-035의 "미검증 = 행동 차단"과 `DISCOVERY_TEMPLATE`의 "P1 보고(자동 차단 X)" 강도 불일치를 위험도로 정리한다:

| 유형 | 처리 |
|------|------|
| 실패 시 현재 M 목표가 무효가 되는 핵심 가설 | **봉인 차단** — 검증 후 진행 |
| 마일스톤 자체가 그 가설을 검증하는 실험 | `risk-accepted` 허용 — **검증 방법·판정일·중단 기준** 3필드 필수 |
| 낮은 위험의 가역적 가설 | 동일 3필드 갖춘 `risk-accepted` |
| 검증 계획 없는 미검증 가설 | **봉인 차단** |

`risk-accepted`는 `authority: user-*`만 부여할 수 있다. `DISCOVERY.md`가 없는 프로젝트(discovery 생략 — PROJECT_START_CHECKLIST 1단계는 선택)는 본 검사를 skip하고 사유를 echo한다.

### D6. M/F 상태 확장 — `contract-ready`
M/F 상태를 `draft → contract-ready → ready`로 확장한다.
- `contract-ready` — `/plan-milestone`의 라운드(범위·feature·FAC·프로토타입·PX)가 사용자 승인으로 끝났고 **task 분해에 들어갈 수 있는** 상태. **잠금이 아니다.** 전환 조건: 확정 재대조 통과 + **원장에서 이 M을 `영향:`으로 갖는 항목과 `(미할당)` 항목 중 `status: open` 0건**(상위 계약 층의 미결정을 task 분해 전에 닫는다 — 사용자 요구인 "상위 결정을 먼저 확실히 닫기"의 집행 지점).
- `ready` — `/seal-milestone`만 부여한다. 이 시점부터 M/F/task 계획이 잠긴다.

> `contract-ready`의 open-0과 D7 봉인 조건 6의 open-0은 **시점이 다른 두 게이트**다. 전자는 *상위 계약 확정 시점*, 후자는 *task까지 완성된 최종 시점*이며, task 분해 중 새로 드러난 결정은 후자가 잡는다.

**잠금의 실질 기준선은 "첫 구현 시작"이다**: `ready`가 붙어도 그 M에 `in-progress`/`done` task가 **0건이면 task·매핑·의존성 결함을 `/repair-plan`이 그 자리에서 고칠 수 있고**, 고친 뒤 `/seal-milestone M<N>` 재실행으로 receipt를 갱신한다(M/F 계약 층은 여전히 다음 M). `in-progress`가 하나라도 생기면 그때부터 task 계획도 잠긴다 — ADR-057#amend-3의 "구현이 시작되면 task 계획도 변경하지 않는다"와 같은 기준선이다.
근거: 잠금의 목적은 *구현 중 계획이 흔들리지 않는 것*이다. 구현 0건이면 그 목적이 걸리지 않으며, 막으면 "첫 구현 전 결함을 다음 M으로 보낸다"는 본 개선이 없애려던 역설이 한 칸 뒤로 옮겨 재현된다(`/repair-workitem`은 `ready` task repair를 거부하므로 다른 경로가 없다).

`/plan-workitem`은 M·산하 feature가 **모두 `contract-ready`**일 때 동작하며, **task를 `ready`로 승격하지 않는다**(전부 `draft`로 남긴다). 승격 권한은 `/seal-milestone` 단독이다.

**ADR-057#amend-3 결정 5(a)(b)(f)와 plan-workitem의 ready 승격을 본 결정이 supersede한다.** 5(f)의 "열린 질문을 milestone `## 7`·feature `## 12`에 영속"은 D1이 그 섹션을 폐지하므로 원장 등재로 대체된다. 결정 5(c)(d)(e)와 task 상태기계(`draft → ready → in-progress → done`)는 유지한다.

`contract-ready` 구간에서는 상위 계약 수정이 **정상 경로**다 — `/plan-workitem`이나 `/validate-plan`이 상위 계약 결함을 찾으면 다음 마일스톤으로 보내지 않고 `/repair-plan`이 그 자리에서 고친다(ADR-057#amend-3 결정 5(d)의 "다음 M 기본 경로"는 `ready` 이후에만 적용).
**stale task 방지**: `contract-ready`에서 feature `## 3` 시나리오나 `## 7` FAC의 *의미*를 고치면, 그 feature 문서에 `- 계약 수정: <YYYY-MM-DD> — 이 feature의 task 재검증 필요` 마커를 남긴다. `/plan-workitem`은 이 마커가 있는 feature를 완결로 보지 않고 재검증한 뒤 마커를 제거한다(ID·매핑이 유지된 채 의미만 바뀐 stale task 차단).

### D7. `/seal-milestone` 신설
마일스톤 계획의 최종 검사 + 사용자 승인 + 상태 전이를 담당하는 skill을 신설한다(`disable-model-invocation: true`).
**봉인은 task 작성의 하위 모드가 아니라 여러 소유 문서를 가로지르는 lifecycle gate**이므로 authoring skill과 분리한다.

**진입 모드 4종**(skill 본문 0단계가 판정): **정상**(M/F `contract-ready` + task 전부 `draft`) / **재개**(부분 승격 상태) / **마이그레이션**(D12 (가) — `ready`+receipt 미채움+구현 0건) / **grandfather**(D12 (나) — 같은 상태에서 구현 1건 이상).

봉인 조건(전부 충족해야 승격 — 상세 절차는 skill 본문):
1. 상태 — 위 4종 중 하나로 판정될 것(`draft` M과 이미 봉인된 M은 각각 안내 후 종료)
2. task 존재·상태 완결 — **grandfather 진입에서는 미적용**(D12 (나) 3)
3. task 필수 섹션 + **AC 해석 확정** + **TDD opt-out 형식 정합** — implement 착수 게이트 ⑦⑧을 봉인 시점으로 앞당겨 "봉인 통과 후 첫 구현에서 즉시 halt"를 막는다
4. FAC↔AC / PX↔AC / INV 커버리지
5. 의존성 그래프 존재성·비순환·AC-보장
6. **원장** — 이 M 영향 + `(미할당)` 항목의 `open` 0건(**이번에 봉인하는 그 M을 가리키는** `- 발견: 봉인 후 (M<N>)` 항목만 제외), `deferred` 앵커 3필드 완비 — grandfather 진입에서는 보고만
7. 가설 D5 판정 (DISCOVERY 부재 시 skip) — grandfather 진입에서는 보고만
8. 리뷰 증거 — 잔존 review 파일 처리 + 사용자에게 리뷰 수행 여부 1회 확인
9. 사용자 최종 승인 — **재개·마이그레이션·grandfather 진입에서도 반드시 다시 받는다**

**승격 순서**: `task → feature → milestone`. M을 마지막에 써야 "M=`ready` ⇒ 하위 전부 `ready`" 불변식이 성립한다. 파일 순차 쓰기라 원자 트랜잭션이 아니며, **중단 시 재실행이 부분 승격 상태를 재개 진입으로 인식해 나머지만 승격한다**(0단계의 재개 분기 — 이 예외가 없으면 부분 승격 상태가 영구히 갇힌다).

**Seal은 내용을 수정하지 않고 커밋도 하지 않는다.** 실패 시 **어떤 상태도 바꾸지 않고** 소유 skill로 반환한다. 성공 시 상태와 **seal receipt**만 기록한다.

**seal receipt** — 마일스톤 문서 `## 10. 봉인 기록`에 남긴다. 이는 암호학적 digest가 아니라 **사람이 읽는 요약**이며, 내용 변경 탐지 수단이 아니다. **봉인 완료 표식은 섹션의 *존재*가 아니라 그 안에 `- 봉인일:` 줄이 채워졌는지**다 — `## 10`은 MILESTONE_TEMPLATE에 빈 채로 들어 있어 모든 미봉인 마일스톤에도 섹션 자체는 존재한다. `/implement-workitem` 착수 게이트는 `- 봉인일:` 채움을 본다:
```
- 봉인일: <YYYY-MM-DD>
- 승인: 사용자 명시 승인
- 계획 규모: feature <F수> / task <T수> / AC <AC수>
- 리뷰: executed <yes|no> | independence <separate-session|same-session(under-verified)|none> | 처리 <P0 N건 / 차단 P1 M건>
- Register: closed N건 / deferred M건 / open 0건
```
`executed: no`여도 봉인을 막지 않는다(리뷰는 opt-in — ADR-038 유지). 다만 **미실행 사실을 receipt에 남긴다.**

### D8. 봉인 차단 finding 범위
`/validate-plan`을 돌린 경우, **P0 전부** + 아래 P1 카테고리가 미해결이면 봉인 차단이다. 기준은 *"이 finding이 미해결인 채 구현에 들어가면 개발 중 기획 질문이 되는가"*.

| 차단 P1 | 비차단 P1 |
|---------|-----------|
| `[Plan-decision]`(신설) · `[Plan-ambiguity]` · `[Plan-design]` · `[Plan-seam]` · `[MP-FAC-quality]` · `[MP-feature-scope]` · `[MP-graduation]` · `[MP-feature-dep]` | `[Plan-sizing]` · `[Plan-arch]` · `[Plan-doc-link]` |

차단 대상은 (a) 해결하거나 (b) `/repair-plan` 4-판정에서 `Reject-*`로 정당하게 기각하거나 (c) 사용자가 **원장에 `status: closed` + `disposition: chosen`**으로 명시 수용해야 한다. **(c)에 `risk-accepted`를 쓰지 않는다** — `risk-accepted`는 D5의 *가설 위험 수용*(검증 방법·판정일·중단 기준 3필드) 전용이고, 계획 결함을 감수하는 것은 성격이 다른 *선택*이다.
**재리뷰 조건**: `/repair-plan`이 `Adopt`/`Adopt-modified`를 1건 이상 적용해 **문서를 실제로 수정한 경우에만** 최종본 재리뷰를 권장한다(차단 아님 — 리뷰가 opt-in이므로 재리뷰도 opt-in). 전부 `Reject-*`로 무수정 종료면 원 리뷰가 유효하다.

### D9. ARCH `## 7-1`~`## 7-5` 결정권 승격
`bootstrap-stack`의 "`## 7-1`~`## 7-5` 인터페이스 컨벤션 채움 = architect 단발 sub-call(라운드 아님)" 규정을 **부분 supersede**한다. 각 소항목에 `authority`를 다음과 같이 배정한다:

| 섹션 | `user-approval` (Decision Brief 제시) | `agent-delegated` (일괄 확인 1회) |
|------|--------------------------------------|----------------------------------|
| `## 7-1` API | 응답 envelope · 페이지네이션 | HTTP 상태 매핑 · error 레지스트리 · 네이밍 · Don'ts |
| `## 7-2` CLI | 출력 포맷(기본 모드) | 플래그·명령어 · TTY/ANSI · Don'ts |
| `## 7-3` 백엔드 | **DB migration · 인증·인가 · API versioning** | 트랜잭션 경계 · Idempotency · Rate limit · Async job · Caching |
| `## 7-4` 프론트 | **라우팅 · SSR-CSR · 인증(토큰 저장)** | 상태관리 · i18n · SEO · 폼 validation |
| `## 7-5` 모바일 | **대상 플랫폼·최소 OS · 화면 이동 · 권한 요청 흐름 · 로컬 저장·오프라인 · 서명·배포** | 상태관리 · 네이티브 연동 · 빌드 flavor · 백그라운드 · WebView · Don'ts |

배정 기준: 되돌린 뒤 **이미 쓴 코드·데이터·사용자 계정에 파급**이 있으면 `user-approval`, 코드 안에서 끝나면 `agent-delegated`. (`## 7-5` 화면 이동은 `## 7-4` 라우팅과 같은 성격이라 대칭으로 `user-approval`이다 — 라우팅 라이브러리 교체는 전 화면을 건드린다.)

### D10. ADR-053 종결자 이동
ADR-053 결정 2의 `④ ARCHITECTURE §7 결정 블록 기록`을 `④ 사용자 선택(Decision Brief) → ⑤ 기록`으로 정정한다(ADR-053#amend-2). 리서치·다각도·적대 검토는 **선택지를 만드는 과정**이지 결정 자체가 아니다.

### D11. 봉인 후 새 결정의 라우팅 (차단 아님)
봉인 뒤 구현 중에 드러난 결정은 원장에 `status: open` + **`- 발견: 봉인 후 (M<N>)`** 줄로 기록하되 **착수를 막지 않는다.** `/implement-workitem`의 게이트는 *봉인이 있었는지*(부모 M `## 10`의 `- 봉인일:` 채움)를 확인할 뿐이며, 봉인 후 항목은 ADR-057#amend-3 결정 6의 기존 라우팅을 탄다 — (a) 기존 task 약속 결함 → `/repair-workitem`, (b) 새 범위 → 사용자 보고 + 다음 M, (c) 불명확·현재 M 차단 P0 → 사용자 결정 대기.
**마커는 범위를 갖는다** — `(M<N>)`이 가리키는 그 마일스톤의 봉인 검사에서만 제외된다. 항목이 `영향: M2`도 가지면 M2 봉인에서는 정상 검사 대상이다(범위 없는 제외는 후속 마일스톤에서도 항목을 숨긴다).
쓰기 주체: `/repair-workitem`(task 결함 처리와 함께), `/stabilize-milestone`(발견 기록), 사용자 직접. **두 skill 본문에 이 등재 규약을 배선한다** — 배선하지 않으면 D11이 소비자 없는 죽은 계약이 된다.
**근거**: 모든 결정을 미리 알아내는 건 불가능하다. 봉인의 목적은 *최대한 닫는 것*이지 사후 발견을 차단하는 게 아니다. 사후 발견을 차단하면 **정직한 등재가 마일스톤 전체를 멈추는 데드락**이 된다.

### D12. 다운스트림 마이그레이션 (기존 fork)
본 개선 이전에 만들어진 프로젝트는 M/F가 이미 `ready`이고 마일스톤 문서에 `## 10`이 없다. 새 착수 게이트(`- 봉인일:` 채움 요구)를 그대로 적용하면 진행 중 프로젝트가 전부 막힌다. **구현 시작 여부로 두 갈래로 흡수한다**(ADR-056 결정 8 다운스트림 마이그레이션 관례와 동형):

**(가) `ready` M + `- 봉인일:` 미채움 + 그 M에 `in-progress`/`done` task 0건 — 계획만 된 프로젝트**
1. `/seal-milestone M<N>`이 **봉인 조건 2~8을 전수 재검사**한 뒤 사용자 승인을 받아 receipt를 기록한다. `ready`라는 이유로 검사를 건너뛰지 않는다 — 구 lifecycle·수동 편집으로도 `ready`가 붙을 수 있다.
2. 조건 미충족(예: task 0건)이면 **receipt를 쓰지 않고** 소유 skill로 반환한다(빈 마일스톤에 봉인 도장 금지).

**(나) `ready` M + `- 봉인일:` 미채움 + 그 M에 `in-progress`/`done` task 1건 이상 — 이미 구현 중인 프로젝트**
3. **봉인 조건 2(구현 시작 흔적 차단)를 적용하지 않는다.** 적용하면 seal이 거부하고 implement도 receipt가 없어 거부해 **순환 교착**이 된다. 이미 구현이 시작됐으므로 계획 잠금의 실익(구현 전 확정)은 이미 지나갔고 소급 검사는 진행만 막는다.
4. 조건 6(원장)·7(가설)은 **보고만** 하고 차단하지 않는다. 조건 3·4·5는 관측해 receipt에 수치로 남긴다.
5. 사용자에게 소급 검사를 하지 않는다는 사실을 알리고 명시 확인 1회를 받은 뒤, receipt 첫 줄을 `- 봉인일: <날짜> (마이그레이션 — 구현 중 착수, 소급 검사 없음)`로 기록한다. **라벨이 진짜 봉인과 구분한다** — 없으면 사후에 검증된 계획으로 오독된다.
6. 이후 마일스톤(M<N+1>)부터는 정상 경로를 탄다.

**(공통)**
7. `/plan-workitem`·`/plan-milestone`·`/repair-plan`은 "`ready` = 봉인 완료"로 즉시 거부하지 않는다 — **`ready`인데 `- 봉인일:`이 미채움이면 마이그레이션 대상**으로 보고 `/seal-milestone M<N>` 실행을 안내한다.
8. `## 10` 섹션 자체는 MILESTONE_TEMPLATE에 baseline으로 들어가므로, 기존 마일스톤 문서에는 사용자가 수동으로 추가하거나 seal이 기록 시 생성한다.

## 비결정 (No)
- **결정적 실행 checker(별도 프로그램) 신설** — 도입하지 않는다. 봉인 검사는 `/seal-milestone` 본문의 절차적 검사로 수행한다. 결과적으로 "에이전트가 원장에 애초에 적지 않은 결정"은 잡히지 않으며, 이 잔여 gap을 명시 수용한다. `--fast` 경로(discover-product R3 생략)가 이 gap의 상수 경로가 된다는 점도 함께 수용한다.
- **독립 plan review 필수화** — ADR-038의 opt-in을 유지한다.
- `--fast` 플래그 기반 봉인 차단 — 게이트는 **모드가 아니라 산출물 기준**이다(ADR-058 D3 정합).
- 열린 질문 섹션 번호 재사용 — 결번 처리(기존 인용 보호).
- 원장에 결함·품질 지적 등재 — 원장은 기획 결정 인덱스다. 기존 `남은 미결정 사항` 슬롯을 **대체하지 않고 병존**한다.
- 봉인 후 원장 `open`으로 구현 차단 — D11 참조(데드락 방지).
- `repair-plan`에 Charter/ARCHITECTURE/DESIGN 직접 수정 권한 부여 — 저작 소유는 각 bootstrap skill이다(ADR-005/ADR-058). 권장만 하고 고치지 않는다.

## Mutation Contract (ADR-047 D3)
1. Target — DECISION_REGISTER.md 신설 / 열린 질문 5섹션 폐지 / M·F `contract-ready` / seal-milestone 신설 + Codex wrapper + 로스터 / plan-milestone · plan-workitem · repair-plan · repair-workitem · implement-workitem · validate-plan · stabilize-milestone / discover-product · bootstrap-project · bootstrap-stack · bootstrap-design · stack-guard / reviewer · architect · planner / WORKFLOW · STRUCTURE · CHECKLIST · DELEGATION · AGENTS · README ×2 / MILESTONE·FEATURE·TASK 템플릿 / ADR-007 · ADR-026 · ADR-027 · ADR-035 · ADR-036 · ADR-037 · ADR-046 · ADR-053 · ADR-057.
2. Failure mode — 상류 결정이 문서에 열린 채 남거나 대화에서 증발하고, 구현 중에 기획 질문이 되살아난다(관측됨).
3. Predicted improvement — 봉인 시점에 현재 M 영향 미결정 0건. 상위 계약 결함을 첫 구현 전에 그 자리에서 수정 가능.
4. Preserved invariants — ADR-005 SSOT(원장은 인덱스, 정본 저작 소유는 각 bootstrap skill) / ADR-038 opt-in 리뷰 / ADR-019 index-first recall / task 상태기계 / ADR-057 seam 계약(결정 8~14)·결정 6 라우팅 / `남은 미결정 사항` 출력 슬롯 존치 / builder EXECUTE 전용 / 자동 차단 최소화.
5. Falsifying evaluation — 마일스톤당 사용자 결정 카드가 감당 불가로 늘거나(피로), 봉인을 통과했는데 구현 중 기획 질문(`[Planning-escape]`)이 반복 관측되면 `authority` 배정과 봉인 조건을 재조정한다. 봉인 후 등재가 실제로 데드락을 만들면 D11을 재검토한다. 원장 행이 마일스톤당 20건을 넘으면 D1 등재 범위를 다시 좁힌다.
6. Rollback path — superseded → 원장·`contract-ready`·seal-milestone 제거, 열린 질문 5섹션 복원, plan-workitem 승격 복원(ADR-057#amend-3 결정 5 원복).

## Ratchet 강도 (ADR-022)
- **constraint(강, [관측됨])**: D6(`contract-ready` 구간의 계약 수정 허용 + `contract-ready` 전환의 open-0) · D7(봉인 조건 3·6).
- **enabling(약)**: 나머지 전부. 특히 **D11·D12는 *완화* 방향**이다 — 사후 발견과 기존 fork를 막지 않기 위한 예외이므로 새 차단을 만들지 않는다.

## Surfaces
- docs/10-charter/DECISION_REGISTER.md
- docs/10-charter/PROJECT_CHARTER.md
- docs/10-charter/_templates/DISCOVERY_TEMPLATE.md
- docs/20-system/ARCHITECTURE_OVERVIEW.md
- docs/30-workitems/_templates/MILESTONE_TEMPLATE.md
- docs/30-workitems/_templates/FEATURE_TEMPLATE.md
- docs/30-workitems/_templates/TASK_TEMPLATE.md
- .claude/skills/seal-milestone/SKILL.md
- .claude/skills/plan-milestone/SKILL.md
- .claude/skills/plan-workitem/SKILL.md
- .claude/skills/repair-plan/SKILL.md
- .claude/skills/validate-plan/SKILL.md
- .claude/skills/implement-workitem/SKILL.md
- .claude/skills/discover-product/SKILL.md
- .claude/skills/bootstrap-project/SKILL.md
- .claude/skills/bootstrap-stack/SKILL.md
- .claude/skills/bootstrap-design/SKILL.md
- .claude/skills/stack-guard/SKILL.md
- .claude/skills/repair-workitem/SKILL.md
- .claude/skills/stabilize-milestone/SKILL.md
- .claude/agents/reviewer.md
- .claude/agents/architect.md
- .claude/agents/planner.md
- .agents/skills/seal-milestone/SKILL.md
- docs/90-decisions/boilerplate/ADR-007-workitem-lifecycle.md
- docs/90-decisions/boilerplate/ADR-026-plan-workitem-schema.md
- docs/90-decisions/boilerplate/ADR-036-feature-level-prd.md
- docs/90-decisions/boilerplate/ADR-037-spec-coverage-audit.md
- docs/00-meta/WORKFLOW.md
- docs/00-meta/STRUCTURE.md
- docs/00-meta/PROJECT_START_CHECKLIST.md
- docs/00-meta/DELEGATION_STRATEGY.md
- AGENTS.md
- README.md
- README_ko.md

## 참고
- ADR-056(결정 4 비대칭 — D2의 원형), ADR-053(#amend-2 — D10), ADR-046(#amend-1 — D3 carve-out), ADR-035(#amend-3 — D5), ADR-057(결정 5(a)(b)(f) 부분 supersede — D6/D11, 결정 6 라우팅 유지), ADR-027(§7-x "라운드 아님" 규정 부분 supersede — D9), ADR-007(lifecycle 단계 SSOT — D7이 plan과 implement 사이에 봉인 게이트 추가), ADR-026(#amend-4의 "task `ready` 승격" 주체를 D7이 seal로 이전), ADR-037(#amend-3의 "task `ready` 승격 조건"을 D7이 봉인 조건으로 이전), ADR-036(FEATURE 12섹션 → `## 12` 폐지로 11섹션), ADR-038(opt-in 유지), ADR-019, ADR-005, ADR-006, ADR-022, ADR-047 D3.
````

## 1.3 ADR 인덱스 등재

**파일**: `docs/90-decisions/boilerplate/README.md`

`## Boilerplate ADR` 표(헤더 `| # | 제목 | Status | Amendments | 한 줄 요약 |`)의 **마지막 행(`| 059 | Flutter/모바일 프로파일 …`) 바로 다음**에 한 줄을 추가한다.

```
| 060 | 기획 결정 마감 + 마일스톤 봉인 (Decision Closure & Milestone Seal) | accepted | — | 결정 원장 + authority 축 + Decision Brief + contract-ready + /seal-milestone 봉인. 열린 질문 5섹션 폐지 |
```

> `#` 컬럼은 `ADR-060`이 아니라 **`060`**이고, 개정 0건은 `0`이 아니라 **`—`**다(기존 행 양식 그대로).

```
git add docs/10-charter/DECISION_REGISTER.md docs/90-decisions/boilerplate/ADR-060-decision-closure-and-milestone-seal.md docs/90-decisions/boilerplate/README.md
```

**커밋 메시지**: `feat(decisions): add ADR-060 decision closure protocol and decision register`

---

# Phase 2 — 기존 ADR 정합

## 2.1 ADR-027 — supersede 표기 (본문 개정 아님)

**파일**: `docs/90-decisions/boilerplate/ADR-027-interface-decision-allocation.md`

`## 현재 유효 결정` 섹션(있으면) 끝에, 없으면 `## Status` 바로 아래에 한 줄을 추가한다.

```markdown
> **부분 supersede (2026-07-29)**: 본 ADR이 정한 "`## 7-1`~`## 7-5` 인터페이스 컨벤션 채움 = architect 단발 sub-call(라운드 아님)" 규정은 [ADR-060](ADR-060-decision-closure-and-milestone-seal.md) D9가 부분 supersede한다 — 되돌리기 비싼 소항목은 사용자 확정 라운드로 승격한다. 본 ADR의 나머지 결정은 유효하며, 본 표기는 개정(amend)이 아니라 참조 갱신이므로 통합 재발행 서약은 그대로 유효하다.
```

> **주의 2가지**: (1) `## Amendment N` 섹션을 **신설하지 않는다** — ADR-027은 개정 8개로 D6 재발행 임계에 도달해 있어 amend를 늘리면 안 된다. (2) 기존 저장소가 쓰는 `ADR-027#31` 앵커는 실제로 해석되지 않는 참조다. **새 문장에서 그 앵커를 재사용하지 않는다**(위 문장처럼 규정 내용을 풀어 쓴다). 기존 인용의 정정은 ADR-027 재발행 라운드 몫이다.

## 2.2 ADR-057 — supersede 표기 (본문 개정 아님)

**파일**: `docs/90-decisions/boilerplate/ADR-057-planning-v2-batch-and-seam.md`

`## 현재 유효 결정` 섹션의 두 번째 불릿("상태·잠금(#amend-3): …")을 찾아, 그 불릿 **바로 아래**에 한 줄을 추가한다.

```markdown
> **부분 supersede (2026-07-29)**: #amend-3 결정 5의 **(a)(b)(f)** 는 [ADR-060](ADR-060-decision-closure-and-milestone-seal.md) D6/D7/D11이 부분 supersede한다 — (a)(b) M/F는 `draft → contract-ready → ready`이고 `ready` 승격은 `/seal-milestone` 단독이며, (f) 열린 질문의 영속 위치는 `docs/10-charter/DECISION_REGISTER.md`다(milestone `## 7`·feature `## 12`는 폐지). 결정 5(c)(d)(e)·task 상태기계·**결정 6 finding 라우팅**·결정 8~14(seam 계약)는 유효하다. 본 표기는 개정(amend)이 아니라 참조 갱신이다.
```

## 2.3 ADR-007 — lifecycle 단계 참조 표기

**파일**: `docs/90-decisions/boilerplate/ADR-007-workitem-lifecycle.md`

> `STRUCTURE.md`가 워크아이템 라이프사이클의 canonical owner를 ADR-007로 지정하므로, 봉인 단계 추가를 여기에 반영하지 않으면 SSOT가 어긋난다.

`## Status` 바로 아래에 한 줄을 추가한다.

```markdown
> **단계 추가 (2026-07-29)**: 본 ADR이 정의한 lifecycle의 *plan 단계와 implement 단계 사이*에 [ADR-060](ADR-060-decision-closure-and-milestone-seal.md) D7의 봉인 게이트 `/seal-milestone`이 들어간다 — `plan-milestone`(→ M/F `contract-ready`) → `plan-workitem`(task `draft`) → **`seal-milestone`(검사·승인·일괄 `ready`)** → `implement-workitem`. 본 ADR의 단계 정의·책임 경계는 그대로 유효하며, 본 표기는 개정(amend)이 아니라 참조 갱신이다.
```

**추가로 `## 결정`의 lifecycle 단계 표에 seal 행 1줄을 넣는다**(미러 갱신이므로 amend 신설 아님). 위치는 plan 행과 implement 행 사이:
```
| seal | `/seal-milestone` | 계획 최종 검사 + 사용자 승인 + task→feature→milestone 일괄 `ready` 승격. 내용 수정·커밋 없음 (ADR-060 D7) |
```
> 표 컬럼 구성은 **그 표의 헤더를 따른다**(헤더가 SSOT). 본문의 "8단계"는 그대로 두되, 표 아래에 `> 봉인(seal)은 ADR-060 D7이 소유하는 게이트로 plan과 implement 사이에 들어간다.` 한 줄을 덧붙인다. 표에 seal 행이 없으면 lifecycle SSOT를 보는 독자가 봉인 단계를 못 찾는다.

## 2.3-b ADR-026 / ADR-037 / ADR-036 — supersede·정합 표기 (본문 개정 아님)

> 세 ADR이 각각 "plan-workitem이 task를 `ready`로 승격" / "FEATURE 12섹션"을 규정하고 있어, 손대지 않으면 `[Doc-adr-drift]`가 잡는 stale이 된다. 셋 다 **참조 표기 한 줄**만 넣고 amend는 만들지 않는다.

**`docs/90-decisions/boilerplate/ADR-026-plan-workitem-schema.md`** — `## Status` 아래(또는 `## 현재 유효 결정` 끝)에:
```markdown
> **부분 supersede (2026-07-29)**: `## 현재 유효 결정`과 #amend-4의 "누락 참조·순환·AC-보장 미비는 … task `ready` 승격을 막는다"에서 **승격 주체는 [ADR-060](ADR-060-decision-closure-and-milestone-seal.md) D7의 `/seal-milestone`**이다. plan-workitem은 승격하지 않고 성공 종료만 막는다. 검사 항목·P0 강도는 불변.
```

**`docs/90-decisions/boilerplate/ADR-037-spec-coverage-audit.md`** — 동일 위치에:
```markdown
> **부분 supersede (2026-07-29)**: #amend-3의 "FAC↔AC 100%가 task `ready` 승격의 필수 조건"에서 **승격 주체는 [ADR-060](ADR-060-decision-closure-and-milestone-seal.md) D7의 `/seal-milestone`**이다(봉인 조건 4). plan-workitem은 unmapped 발견 시 성공 종료를 막고 task를 `draft`에 둔다. 커버리지 요구 자체는 불변.
```

**`docs/90-decisions/boilerplate/ADR-036-feature-level-prd.md`** — 동일 위치에:
```markdown
> **정합 표기 (2026-07-29)**: [ADR-060](ADR-060-decision-closure-and-milestone-seal.md) D1이 FEATURE_TEMPLATE `## 12. 열린 질문`을 폐지(결번)하므로 본 ADR의 "12섹션"은 **`## 1`~`## 11` 11섹션 + 결번 12**가 된다. 섹션 번호는 재사용하지 않으며, "추가 main section 신설 X" 규율은 불변이다.
```

## 2.4 ADR-053 — Amendment 2 추가

**파일**: `docs/90-decisions/boilerplate/ADR-053-high-stakes-design-panel.md` — 파일 **맨 끝**에 append.

```markdown
<a id="adr-053-amend-2"></a>
## Amendment 2 (2026-07-29) — 패널의 종결자를 사용자 선택으로 이동

### 배경
- [관측됨] 결정 2의 3단 강도가 `① 리서치 → ② 다각도 2~3안 → ③ 적대 재검토 → ④ ARCHITECTURE §7 결정 블록 기록`으로 끝난다. ①~③은 *선택지를 만드는* 과정인데 ④가 곧바로 기록이라 **사용자 선택 단계가 없다**.

### 결정
1. 결정 2의 `④ 기록`을 **`④ 사용자 선택 → ⑤ 기록`**으로 정정한다. ②의 2~3안을 [ADR-060](ADR-060-decision-closure-and-milestone-seal.md) D3 Decision Brief 포맷으로 제시하고, 사용자가 고른 뒤에 §7 결정 블록에 기록한다. **본 amendment로 절차가 ①~⑤가 되므로, "①~④"를 인용하는 skill 본문은 "①~⑤"로 갱신한다.**
2. **S1~S4는 분석 깊이 축 전용임을 명시한다** — *누가 결정하는가*는 ADR-060 D2의 `authority` 축이 소유한다. S2("합리적 대안 2개 이상")는 가역적 내부 선택에도 성립하므로 결정권 트리거로 쓰면 과발동한다.
3. `authority: agent-delegated`로 배정된 결정은 게이트가 발동해도 ④를 건너뛰고 라운드 종료 시 **일괄 확인 1회**에 포함한다(ADR-060 D3).
4. Amendment 1이 인용한 "결정 2의 ④ (해당 시) ADR"은 본 amendment로 **⑤**가 된다(번호 밀림 — 내용 불변).

### 적용 surface
- docs/90-decisions/boilerplate/ADR-053-high-stakes-design-panel.md
- .claude/skills/bootstrap-project/SKILL.md
- .claude/skills/bootstrap-stack/SKILL.md
- .claude/skills/plan-milestone/SKILL.md
- .claude/agents/architect.md

### 강도 (ADR-022)
- enabling(약) — 게이트 발동 조건 불변, 종결 방식만 이동.
- **Mutation delta (ADR-047 D3)**: failure=고-stakes 결정이 사용자 선택 없이 확정 / falsifier=S1~S4 발동 결정이 Decision Brief 없이 §7에 기록됨 / rollback=④ 기록으로 원복.
```

## 2.5 ADR-046 — Amendment 1 추가

**파일**: `docs/90-decisions/boilerplate/ADR-046-signal-first-output.md` — 파일 **맨 끝**에 append.

```markdown
<a id="adr-046-amend-1"></a>
## Amendment 1 (2026-07-29) — Decision Brief 압축 예외

### 배경
- [관측됨] D3 압축 금지 리스트에 "사용자가 선택·결정해야 하는 옵션·후보 목록"과 "사용자가 혼란스러워하는 상황의 설명"은 있으나, **선제적 배경·용어 설명**은 없다. 후자는 사용자가 혼란을 표명한 *뒤에야* 발동하므로, 비전문가가 "인증: 세션 vs JWT"를 1~2줄로 받고 무엇을 고르는지 모른 채 승인하는 경로가 열린다.

### 결정
1. D3 압축 금지 리스트에 **[ADR-060](ADR-060-decision-closure-and-milestone-seal.md) D3 Decision Brief의 6블록 전체**를 추가한다.
2. D2 분량 목표(기본 ≤600 토큰)는 Decision Brief에 적용하지 않는다 — finding 전수 반환 예외와 동형.
3. **적용 범위는 `authority: user-choice | user-approval` 결정에 한정**한다. `agent-delegated` 결정과 그 밖의 라운드 표면 출력은 기존 압축 포맷을 그대로 따른다 — 예외를 좁게 유지해야 전체 출력이 다시 장황해지지 않는다.

### 적용 surface
- docs/90-decisions/boilerplate/ADR-046-signal-first-output.md
- .claude/skills/discover-product/SKILL.md
- .claude/skills/bootstrap-project/SKILL.md
- .claude/skills/bootstrap-stack/SKILL.md
- .claude/skills/bootstrap-design/SKILL.md
- .claude/skills/plan-milestone/SKILL.md
- .claude/skills/plan-workitem/SKILL.md
- .claude/skills/repair-plan/SKILL.md

### 강도 (ADR-022)
- constraint(강) — D3 보존 리스트 확장이므로 base D3와 동일 강도.
- **Mutation delta (ADR-047 D3)**: failure=사용자가 이해하지 못한 채 승인 / falsifier=`user-*` 결정이 6블록 없이 1~2줄로 제시됨 / rollback=예외 항목 제거.
```

## 2.6 ADR-035 — Amendment 3 추가

**파일**: `docs/90-decisions/boilerplate/ADR-035-continuous-discovery.md` — 파일 **맨 끝**에 append.

```markdown
<a id="adr-035-amend-3"></a>
## Amendment 3 (2026-07-29) — 미검증 가정의 차단 강도 정합 (위험도 4단계)

### 배경
- [관측됨] 결정 1은 `## 12. Assumption Tracker`의 빈 결과를 **"미검증 - 행동 차단"**으로 규정하는데, `DISCOVERY_TEMPLATE.md`는 같은 항목을 **"stabilize가 P1으로 보고(자동 차단 X)"**로 적는다. 정책 강도가 서로 다르다.

### 결정
둘 중 하나를 택하지 않고 **위험도로 분기**한다([ADR-060](ADR-060-decision-closure-and-milestone-seal.md) D5와 동일 표):

| 유형 | 처리 |
|------|------|
| 실패 시 현재 마일스톤 목표가 무효가 되는 핵심 가설 | **봉인 차단** — 검증 후 진행 |
| 마일스톤 자체가 그 가설을 검증하는 실험 | `risk-accepted` 허용 — 검증 방법·판정일·중단 기준 3필드 필수 |
| 낮은 위험의 가역적 가설 | 동일 3필드 갖춘 `risk-accepted` |
| 검증 계획 없는 미검증 가설 | **봉인 차단** |

차단 판정 지점은 `/seal-milestone`이고, `stabilize`의 P1 보고는 *구현 후 회수 채널*로 그대로 유지한다(시점이 다르므로 충돌하지 않는다).
`risk-accepted`는 `docs/10-charter/DECISION_REGISTER.md`에 `authority: user-*`로 등재해야 성립한다. **`DISCOVERY.md`가 없는 프로젝트(discovery 생략 — PROJECT_START_CHECKLIST 1단계는 선택)는 본 검사를 skip하고 사유를 echo한다.**

**섹션 수 정정(동반)**: #amend-2가 규정한 "총 13 → 15섹션"은 [ADR-060](ADR-060-decision-closure-and-milestone-seal.md) D1이 `## 11. 열린 질문`을 폐지(결번)하므로 **14섹션 + 결번 11**이 된다. 번호는 재사용하지 않는다.

### 적용 surface
- docs/90-decisions/boilerplate/ADR-035-continuous-discovery.md
- docs/10-charter/_templates/DISCOVERY_TEMPLATE.md
- .claude/skills/seal-milestone/SKILL.md

### 강도 (ADR-022)
- constraint(강) — 1·4행은 봉인 차단.
- **Mutation delta (ADR-047 D3)**: failure=핵심 가설이 검증·수용 없이 구현으로 흘러감 / falsifier=3필드 없는 가정이 봉인을 통과 / rollback=4단계 표 제거 후 P1 보고로 원복.
```

## 2.7 DISCOVERY_TEMPLATE `## 12` 주석 정합

**파일**: `docs/10-charter/_templates/DISCOVERY_TEMPLATE.md`

**기존** (`## 12. Assumption Tracker` 아래 주석 첫 줄):
```
<!-- ## 10 핵심 가정의 *검증 결과 누적*. 빈 결과 = "미검증" — stabilize가 P1으로 보고(자동 차단 X; 가장 위험한 가정이면 "행동 차단 권장"으로 표시).
```

**변경**:
```
<!-- ## 10 핵심 가정의 *검증 결과 누적*. 빈 결과 = "미검증".
     차단 강도는 위험도 4단계(ADR-035#amend-3 / ADR-060 D5) — 현재 마일스톤 목표를 무효화하는 핵심 가설과 검증 계획 없는 가정은 봉인 차단, 나머지는 검증 방법·판정일·중단 기준 3필드를 갖춘 risk-accepted로 DECISION_REGISTER에 등재해 통과. stabilize의 P1 보고는 구현 후 회수 채널로 유지.
```

## 2.8 인덱스 Amendments 컬럼 동기 (필수)

**파일**: `docs/90-decisions/boilerplate/README.md`

> preflight가 *"인덱스 Amendments 컬럼 amend 수 ↔ 본문 `## Amendment N` 수 일치"*를 결정적으로 검사한다. 어긋나면 `P1 [ADR-index]`가 뜬다.

| 행 | 기존 Amendments 칸 | 변경 |
|----|-------------------|------|
| ADR-035 | `(+#amend-1: Charter staleness 보고, +#amend-2: Evidence Log + Insight Backlog)` | 끝에 `, +#amend-3: 미검증 가정 차단 강도 위험도 4단계` 추가 |
| ADR-046 | `—` | `+#amend-1: Decision Brief 압축 예외` |
| ADR-053 | `+#amend-1: ④ ADR 판정 기준` | `(+#amend-1: ④ ADR 판정 기준, +#amend-2: 종결자를 사용자 선택으로 이동)` |

**요약 칸도 1곳 고친다** — ADR-035 행의 `15섹션` → `14섹션(11 결번)` (2.6의 섹션 수 정정과 동기).

> ADR-007·ADR-027·ADR-057 행의 **Amendments 칸**은 건드리지 않는다 — 2.1~2.3은 amend가 아니라 참조 표기라 개정 수가 늘지 않는다.

## 2.9 ADR-049 — superseded 문서의 SSOT 주장 정정 (기존 결함, 본 개선과 무관)

> 본 개선 사항은 아니지만 **1줄 수정에 오독 방지 효과가 커서 함께 처리**한다. ADR-049는 `## Status: superseded (by ADR-058)`인데 `## 현재 유효 결정` 첫 줄이 여전히 *"`/bootstrap-design`의 워크플로우 라운드 구조는 **본 ADR이 SSOT**"*라고 주장한다. `stabilize`의 Surfaces forward-check는 superseded ADR을 skip하므로 자동으로 잡히지 않고, "design workflow SSOT"를 JIT로 찾는 에이전트가 **폐기된 라운드 구조를 따를 수 있다**.

**파일**: `docs/90-decisions/boilerplate/ADR-049-concept-mockup-first-design.md`

**기존** (12행 앞부분):
```
- `/bootstrap-design`의 *워크플로우 라운드 구조*는 본 ADR이 SSOT:
```
**변경**:
```
- (**superseded — 아래는 이력이다. 현재 SSOT는 [ADR-058](ADR-058-design-workflow.md)**) `/bootstrap-design`의 *워크플로우 라운드 구조*는 본 ADR이 SSOT였다:
```

> 나머지 본문은 그대로 둔다(Record 타입 — 이력 보존). 인덱스 Amendments 칸도 건드리지 않는다(amend 아님).

## 2.10 ADR-035 · ADR-053 — `## 현재 유효 결정` 요약 신설 (ADR-045 D5 필수)

> 2.4·2.6이 추가하는 amendment는 **base 결정을 정정하는** amendment다(ADR-053 amend-2 = "④ 기록"을 ④⑤로 정정, ADR-035 amend-3 = 결정 1의 "미검증 - 행동 차단"을 위험도 4단계로 대체). ADR-045 D5와 `_ADR_GUIDE.md` 권장 섹션은 *정정성 amend가 있으면* `## Status` 바로 아래 `## 현재 유효 결정` 요약(≤6줄)을 **필수**로 요구한다. 두 ADR에는 그 섹션이 없어서, 이대로 두면 base 본문의 "13섹션"·"미검증 - 행동 차단"·"④ 기록"을 현재 규칙으로 오독하는 경로가 남는다(base 본문은 이력이므로 고치지 않는다 — 요약이 빠른 경로를 담당).

**파일**: `docs/90-decisions/boilerplate/ADR-035-continuous-discovery.md` — `## Status`의 `accepted` 바로 아래, `## 배경` 앞에 삽입.

```markdown
## 현재 유효 결정
- `DISCOVERY_TEMPLATE`은 **14섹션 + 결번 11**(기존 11 + `## 12` Assumption Tracker·`## 13` Opportunity Backlog + #amend-2의 `## 14` Evidence Log·`## 15` Insight Backlog; `## 11. 열린 질문`은 ADR-060 D1이 폐지 — #amend-3). 번호는 재사용하지 않는다.
- 미검증 가정의 차단 강도는 **위험도 4단계**(#amend-3 = ADR-060 D5) — 현재 마일스톤 목표를 무효화하는 핵심 가설과 검증 계획 없는 가정은 `/seal-milestone` 차단, 나머지는 검증 방법·판정일·중단 기준 3필드를 갖춘 `risk-accepted`로 `DECISION_REGISTER.md`에 등재해 통과. 결정 1의 "미검증 - 행동 차단"은 이 표로 대체됐다.
- `/stabilize-milestone` §6.5의 staleness P1 보고(4 시그널 — #amend-1·#amend-2)는 *구현 후 회수 채널*로 그대로 유지된다(봉인 차단과 시점이 다르다).
- Evidence(`## 14`) → Insight(`## 15`) → Assumption(`## 12`)/Opportunity(`## 13`) → feature 흐름은 #amend-2가 SSOT.
- DISCOVERY=SSOT / Charter=snapshot, `--update` 모드, ID 매칭 idempotency는 결정 2~4 그대로 유효하다.
```

**파일**: `docs/90-decisions/boilerplate/ADR-053-high-stakes-design-panel.md` — 같은 위치에 삽입.

```markdown
## 현재 유효 결정
- stakes 게이트 S1~S5와 판정(S1~S4 중 1+ → full 패널 / S5만 → 리서치-only / 전부 NO → fast path)은 결정 1 그대로다. **S1~S4는 *분석 깊이* 축 전용**이며 *누가 결정하는가*는 ADR-060 D2의 `authority` 축이 소유한다(#amend-2).
- full 패널 절차는 **①~⑤**다(#amend-2) — ① 리서치 → ② 다각도 2~3안 → ③ 적대 재검토 → **④ 사용자 선택(ADR-060 D3 Decision Brief)** → ⑤ 기록(ARCHITECTURE `## 7` 결정 블록 + 해당 시 ADR). 결정 2의 "④ 기록"은 ⑤로 밀렸다.
- ⑤의 "(해당 시) ADR" 판정 기준·작성 주체는 ADR-000#amend-2 결정 3과 그 트리거 표가 SSOT다(#amend-1 — 번호만 ④→⑤로 밀림).
- `authority: agent-delegated`로 배정된 결정은 게이트가 발동해도 ④를 건너뛰고 라운드 종료 시 **일괄 확인 1회**에 포함한다(#amend-2).
- parallel-merge 금지 · `/review-doc` 미사용 · stabilize의 `P2 [Design-rationale]` backstop은 결정 2③·결정 3 그대로 유효하다.
```

> **base 본문은 손대지 않는다** — 결정 1·결정 2의 원문은 이력으로 보존한다(ADR-045 D5: "상세는 아래 본문이 SSOT — 요약은 빠른 경로"). 인덱스 Amendments 칸도 변하지 않는다(amend 신설이 아니다). ADR-046은 amend-1이 *순수 확장*(D3 보존 리스트 추가)이고 개정 1개뿐이라 D5 트리거에 걸리지 않으므로 요약을 넣지 않는다.

```
git add docs/90-decisions/boilerplate/ADR-027-interface-decision-allocation.md docs/90-decisions/boilerplate/ADR-057-planning-v2-batch-and-seam.md docs/90-decisions/boilerplate/ADR-007-workitem-lifecycle.md docs/90-decisions/boilerplate/ADR-026-plan-workitem-schema.md docs/90-decisions/boilerplate/ADR-036-feature-level-prd.md docs/90-decisions/boilerplate/ADR-037-spec-coverage-audit.md docs/90-decisions/boilerplate/ADR-053-high-stakes-design-panel.md docs/90-decisions/boilerplate/ADR-046-signal-first-output.md docs/90-decisions/boilerplate/ADR-035-continuous-discovery.md docs/90-decisions/boilerplate/ADR-049-concept-mockup-first-design.md docs/90-decisions/boilerplate/README.md docs/10-charter/_templates/DISCOVERY_TEMPLATE.md
```

> 2.9(ADR-049)는 본 개선과 무관한 독립 정정이므로 **별도 커밋으로 분리**해도 된다. 한 커밋으로 묶을 때는 아래 메시지를 쓴다.

**커밋 메시지**: `docs(decisions): align ADR-007/026/027/035/036/037/046/053/057 with decision closure protocol`
**커밋 메시지 (2.9를 분리할 경우)**: `docs(decisions): mark ADR-049 round structure as superseded history`

---

# Phase 3 — 정본 문서·템플릿 구조 변경

## 3.1 PROJECT_CHARTER.md — `## 10` 폐지

**기존** (39~40행):
```markdown
## 10. 열린 질문
<!-- 아직 답이 없는 중요한 질문들. -->
```
**변경**:
```markdown
<!-- ## 10. 열린 질문 — 폐지(결번). 기획 미결정은 docs/10-charter/DECISION_REGISTER.md가 소유한다 (ADR-060 D1).
     섹션 번호는 재사용하지 않는다. -->
```

## 3.2 ARCHITECTURE_OVERVIEW.md

### (a) `## 10` 폐지

**기존** (파일 마지막 줄): `## 10. 열린 질문`
**변경**:
```markdown
<!-- ## 10. 열린 질문 — 폐지(결번). 기술 미결정은 docs/10-charter/DECISION_REGISTER.md가 소유한다 (ADR-060 D1).
     섹션 번호는 재사용하지 않는다. -->
```

### (b) `## 7` 주석 정정

**기존**:
```
<!-- 언어, 프레임워크, DB, 인프라 등 주요 기술 선택과 이유. 스택이 미정이면 미정으로 적는다. -->
```
**변경**:
```
<!-- 언어, 프레임워크, DB, 인프라 등 주요 기술 선택과 이유.
     스택이 아직 안 정해졌으면 여기에 "미정"으로 적지 말고 DECISION_REGISTER에 open 항목으로 등재한다 (ADR-060 D1) — 정본에 미정을 적으면 아무도 회수하지 않는다. -->
```

### (c) `## 7-1`·`## 7-2` 주석 정정 (D9와의 충돌 제거)

**기존** (`## 7-1` 아래 첫 줄): `<!-- API 스택일 때만 채운다. /bootstrap-stack이 architect 단발 호출로 채운다.`
**변경**: `<!-- API 스택일 때만 채운다. /bootstrap-stack이 소항목별 authority에 따라 채운다 — 되돌리기 비싼 소항목은 사용자 승인, 나머지는 architect 단발 호출 + 라운드 끝 일괄 확인 (ADR-060 D9).`

**기존** (`## 7-2` 아래 첫 줄): `<!-- CLI 라이브러리 사용 시만 채운다. /bootstrap-stack이 architect 단발 호출로 채운다.`
**변경**: `<!-- CLI 라이브러리 사용 시만 채운다. /bootstrap-stack이 소항목별 authority에 따라 채운다 (ADR-060 D9).`

## 3.3 DISCOVERY_TEMPLATE.md — `## 11` 폐지

**기존** (43~44행):
```markdown
## 11. 열린 질문
<!-- R3: 아직 답이 없는 중요한 질문 -->
```
**변경**:
```markdown
<!-- ## 11. 열린 질문 — 폐지(결번). 기획 미결정은 docs/10-charter/DECISION_REGISTER.md가 소유한다 (ADR-060 D1).
     §12~§15 번호는 그대로 둔다(당기지 않는다 — 기존 인용 보호). -->
```

## 3.4 MILESTONE_TEMPLATE.md

### (a) `## 0. Status` 주석 교체

**기존** (4~5행):
```markdown
draft
<!-- 값은 헤딩+1 줄(위)에 둔다 — 주석은 값 *뒤*(finalize 등 "헤딩+1=상태값" 파서 보호). draft(계획 중) → ready(plan-milestone 확정 재대조 통과·잠금). M·feature는 이 단방향만 쓴다 — 완료 판정은 graduation(`## 8` 회고)이 담당하고 stabilize는 M `## 0. Status`를 바꾸지 않는다. ready 뒤 상위 계약 변경은 새 마일스톤이 기본이고, 현재 M 진행 불가 P0는 자동 역전이가 없이 사용자 보고. plan-workitem은 M·산하 feature가 모두 ready일 때만 동작. ADR-057#amend-3 결정 5. -->
```

**변경**:
```markdown
draft
<!-- 값은 헤딩+1 줄(위)에 둔다 — 주석은 값 *뒤*("헤딩+1=상태값" 파서 보호).
     draft(계획 중) → contract-ready(plan-milestone 라운드 완료·사용자 승인 — task 분해 진입 자격, **잠금 아님**) → ready(/seal-milestone이 봉인).
     M·feature는 이 단방향만 쓴다. 완료 판정은 graduation(`## 8` 회고)이 담당하고 stabilize는 M `## 0. Status`를 바꾸지 않는다.
     contract-ready 구간에서는 상위 계약 수정이 정상 경로다(repair-plan이 그 자리에서 고친다). ready 뒤 상위 계약 변경은 새 마일스톤이 기본이고, 현재 M 진행 불가 P0는 자동 역전이 없이 사용자 보고.
     plan-workitem은 M·산하 feature가 모두 contract-ready일 때 동작하고 task를 ready로 승격하지 않는다. ADR-060 D6/D7 (ADR-057#amend-3 결정 5 부분 supersede). -->
```

### (b) `## 7. 열린 질문` 폐지

**기존** (29행): `## 7. 열린 질문`
**변경**:
```markdown
<!-- ## 7. 열린 질문 — 폐지(결번). 이 마일스톤의 미결정은 docs/10-charter/DECISION_REGISTER.md가 소유한다(항목의 `영향:` 칸에 이 M ID를 적는다 — ADR-060 D1). -->
```

### (c) `## 10. 봉인 기록` 신설

파일 **맨 끝**(`## 9. 화면 전환` 블록 다음)에 append.

```markdown

## 10. 봉인 기록 (seal receipt — /seal-milestone이 채움)
<!-- 봉인 성공 시에만 기록된다. 사람이 읽는 요약이며 내용 변경 탐지용 digest가 아니다. 형식(ADR-060 D7):
- 봉인일: <YYYY-MM-DD>
- 승인: 사용자 명시 승인
- 계획 규모: feature <F수> / task <T수> / AC <AC수>
- 리뷰: executed <yes|no> | independence <separate-session|same-session(under-verified)|none> | 처리 <P0 N건 / 차단 P1 M건>
- Register: closed N건 / deferred M건 / open 0건
**판정 기준은 섹션의 *존재*가 아니라 `- 봉인일:` 줄의 *채움*이다** — 본 섹션은 템플릿에 빈 채로 들어가므로 모든 미봉인 마일스톤에도 존재한다. /implement-workitem 착수 게이트는 `- 봉인일:` 채움을 본다. -->
```

## 3.5 FEATURE_TEMPLATE.md

### (a) `## 0. Status` 주석 교체

**3.4 (a)의 변경본을 그대로** 넣는다(동일 문구).

### (b) `## 7-1` 주석의 승격 주체 정정 — **문장만 교체, 뒤 문장 보존**

**기존** (46행의 *앞부분*. 같은 줄 뒤에 "구현 시작 후 발견되면 validator(ADR-037) 및 stabilize preflight가 P0 [Spec-gap]로 보고 + 사용자 결정." 이 이어진다 — **그 뒤 문장은 그대로 둔다**):
```
     unmapped 0건이 plan-workitem task ready 승격 조건 — 발견 시 성공 종료 금지(ADR-037#amend-3).
```
**변경**:
```
     unmapped 0건이 /seal-milestone 봉인 조건 — plan-workitem은 발견 시 성공 종료 금지, 승격은 하지 않는다(ADR-037#amend-3 / ADR-060 D7).
```

### (b-2) `## 7-1`·`## 7-3` 주석의 "12-섹션" 정정 (47행·63행)

**기존** (두 곳 공통 문구): `ADR-036 12-섹션 구조에 *추가 main section 신설 X*`
**변경** (두 곳 모두): `ADR-036 섹션 구조(## 12 폐지로 11 main section — ADR-060 D1)에 *추가 main section 신설 X*`

### (c) `## 12. 열린 질문` 폐지

**기존** (파일 마지막 줄): `## 12. 열린 질문`
**변경**:
```markdown
<!-- ## 12. 열린 질문 — 폐지(결번). 이 feature의 미결정은 docs/10-charter/DECISION_REGISTER.md가 소유한다(항목의 `영향:` 칸에 M ID와 이 F ID를 함께 적는다 — ADR-060 D1). -->
```

## 3.6 TASK_TEMPLATE.md — 승격 주체 정정

**기존** (5행 주석 중):
```
draft(계획 작성 중) → ready(전 M 계획+[Plan-dep] 성공 시 plan-workitem이 승격) → in-progress(모든 preflight 통과 뒤 implement dispatch 직전) → done(finalize).
```
**변경**:
```
draft(계획 작성 중) → ready(**/seal-milestone이 봉인 시 일괄 승격** — plan-workitem은 승격하지 않는다. ADR-060 D7) → in-progress(모든 preflight 통과 뒤 implement dispatch 직전) → done(finalize).
```

```
git add docs/10-charter/PROJECT_CHARTER.md docs/20-system/ARCHITECTURE_OVERVIEW.md docs/10-charter/_templates/DISCOVERY_TEMPLATE.md docs/30-workitems/_templates/MILESTONE_TEMPLATE.md docs/30-workitems/_templates/FEATURE_TEMPLATE.md docs/30-workitems/_templates/TASK_TEMPLATE.md
```

**커밋 메시지**: `refactor(docs): retire open-question sections and add contract-ready state`

---

# Phase 4 — 상류 skill 배선

## 4.0 4개 skill 공통 삽입 블록

아래 블록을 `discover-product` / `bootstrap-project` / `bootstrap-stack` / `bootstrap-design`의 **`## Context 정책 (ADR-019)` 섹션 바로 위**에 각각 삽입한다.

```markdown
## 결정 마감 (ADR-060)
본 skill이 내리거나 발견하는 기획 결정 중 **사용자가 정하거나 승인해야 할 것**을 `docs/10-charter/DECISION_REGISTER.md`에 등재한다 — 대화 출력으로만 두지 않는다.

1. **등재 시점에 `authority`를 확정한다** (ADR-060 D2): 제품 의도·범위·우선순위·사용자 체감·외부 계약·데이터/보안·비용·위험 허용도·비가역 약속 → `user-choice`. 스택·인증·데이터 경계·되돌리기 비싼 구조 → `user-approval`. 승인된 경계 안의 가역적 내부 선택 → `agent-delegated`. **`user-*`를 `agent-delegated`로 낮추려면 사용자 명시 승인 + 항목에 이력 줄이 필요하다.**
2. **등재 범위 (원장을 얇게 유지)**: `user-*` 결정 전부 + 종류 불문 `open`/`deferred`로 남는 항목만 등재한다. **`agent-delegated`는 개별 등재하지 않고** 4의 일괄 확인으로만 처리한다. **코드 품질·형식 지적과 계획 결함은 원장 대상이 아니다** — 기존 `남은 미결정 사항` 출력 슬롯이 그대로 소유한다.
3. **`user-*` 결정은 Decision Brief 6블록으로 제시한다** (ADR-060 D3 / ADR-046#amend-1 — 압축 예외): 배경(왜 지금) → 용어(배경 없이도 이해되게) → 선택지 2~3안(각각 한 줄 요약·이 프로젝트에서의 체감·장점·감수할 것) → 되돌리기 비용 → 추천+근거 → 답변 방법. **라운드당 3~5개 상한**, `skip` 불허(선택 / 추가 설명 / 리서치 요청 / 연기 중 택1). 답변은 평이한 문장으로 재진술해 확인한 뒤 정본에 기록한다.
4. **라운드 종료 시 일괄 확인 1회**: 그 라운드의 `agent-delegated` 결정을 목록으로 제시하고 "바꿀 것 있으면 알려달라"를 1회 확인받는다. 사용자가 뒤집으면 그 항목은 `user-approval`로 원장에 등재한다.
5. **닫히지 않은 항목**: 현재 M 무영향 + 이관 앵커 + 회수 시점 3개를 모두 갖추면 `deferred`, 아니면 `open`으로 남긴다(ADR-060 D4). **앵커 없는 유예는 금지**한다. 현재 M을 막는 사실 조사는 `deferred`가 아니라 `/research-pack` 선행으로 종결한다.
6. 결정 *본문*은 **본 skill이 소유한 정본 문서**(DISCOVERY / Charter / ARCHITECTURE / DESIGN / ADR 중 해당 단계에 존재하는 것)에 쓰고, 원장에는 위치 앵커와 처분 상태만 적는다(ADR-005). 본 skill이 소유하지 않는 문서는 건드리지 않는다.
7. **마일스톤이 아직 없는 단계**(discover/bootstrap)에서는 `영향: (미할당)`으로 등재한다. `/plan-milestone` R1이 triage한다.
```

### 4.0-b plan-* 변형 (5.1·5.2에서 삽입할 때만)

`/plan-milestone`·`/plan-workitem`은 Charter·ARCHITECTURE·DESIGN을 **소유하지 않는다**(저작 소유는 각 bootstrap skill — ADR-005/ADR-058). 두 skill에 삽입할 때는 위 블록의 **6·7항을 아래로 교체**한다:

```markdown
6. 결정 *본문*은 **본 skill이 소유한 문서**(milestone / feature / task)에 쓰고, 원장에는 위치 앵커와 처분 상태만 적는다(ADR-005). 정본 3종(Charter / ARCHITECTURE / DESIGN) 변경이 필요하면 고치지 말고 소유 skill(`/bootstrap-project --apply` · `/bootstrap-stack` · `/bootstrap-design --update`)을 텍스트로 권장한 뒤 원장에 항목을 남긴다.
7. `영향:` 칸에는 이 마일스톤 ID를 적는다. (`/plan-milestone`은 여기에 더해 R1에서 `(미할당)` 항목을 전수 triage한다 — 위 R1 라운드 본문 참조.)
```

> **7항은 skill별로 다르다**: 위 문장은 `/plan-milestone`용이다. `/plan-workitem`에는 괄호절을 **넣지 않는다**(`영향:` 칸 지시 한 문장만) — triage는 plan-milestone R1의 의무이고 plan-workitem에는 해당 행위가 없다. 또한 괄호 안에서 **본 가이드의 섹션 번호(5.1(f) 등)를 인용하지 않는다** — 본 가이드는 폐기용 문서라 산출물에 남으면 해석 불가 참조가 된다.

## 4.1 discover-product

### (a) R3 라운드 교체

**기존** (54~56행):
```markdown
**R3 — 핵심 가정 + 열린 질문**
- R0~R2에서 사용자가 추측으로 답한 모든 항목을 가정으로 표시.
- 가장 위험한 가정 1~3개에 검증 방법 1줄.
```
**변경**:
```markdown
**R3 — 핵심 가정 + 미결정 등재**
- R0~R2에서 사용자가 추측으로 답한 모든 항목을 가정으로 표시.
- 가장 위험한 가정 1~3개에 검증 방법 1줄 + **위험도 판정**(ADR-035#amend-3 / ADR-060 D5): 실패 시 다음 마일스톤 목표가 무효가 되는 핵심 가설인가, 실험 대상인가, 저위험인가. 실험·저위험이면 검증 방법·판정일·중단 기준 3필드를 채워 원장에 `risk-accepted` 후보로 올린다.
- **미결정은 `DISCOVERY.md`에 남기지 않는다** — `docs/10-charter/DECISION_REGISTER.md`에 등재한다(아래 `## 결정 마감`). DISCOVERY `## 11`은 폐지됐다(ADR-060 D1).
```

### (b) R4 저장 단계 보강

**기존** (58~59행):
```markdown
**R4 — DISCOVERY.md 정리(저장 단계)**
- 위 결과를 `docs/10-charter/_templates/DISCOVERY_TEMPLATE.md` 양식에 맞춰 `docs/10-charter/DISCOVERY.md`에 저장.
```
**변경**:
```markdown
**R4 — DISCOVERY.md 정리(저장 단계)**
- 위 결과를 `docs/10-charter/_templates/DISCOVERY_TEMPLATE.md` 양식에 맞춰 `docs/10-charter/DISCOVERY.md`에 저장. **`## 11`은 폐지 섹션이므로 만들지 않는다.**
- 이 라운드에서 발생한 미결정·가설을 `docs/10-charter/DECISION_REGISTER.md`에 등재한다(아래 `## 결정 마감`).
```

### (c) 마지막 출력 교체

**기존** (67~68행):
```markdown
- DISCOVERY.md 경로
- 핵심 가정과 열린 질문 요약
```
**변경**:
```markdown
- DISCOVERY.md 경로
- 핵심 가정 요약
- **원장 요약**: `closed N건 / deferred M건 / open K건` (open이 있으면 그 항목의 `authority`와 필요 시점을 1줄씩)
```

### (d) 4.0 공통 블록 삽입

## 4.2 bootstrap-project

### (a) 고-stakes 게이트 절차 갱신

**기존** (71행):
```markdown
… → ③(최상위만) 두 번째 architect 적대 검토(review-doc 미사용·parallel-merge 금지) → ④ ARCHITECTURE §7 결정 블록 기록. 저-stakes는 현행 단발. (Codex: 순차 단일 degrade — researcher 인라인/사전 노트.)
```
**변경**:
```markdown
… → ③(최상위만) 두 번째 architect 적대 검토(review-doc 미사용·parallel-merge 금지) → **④ 사용자 선택 — ②의 안을 Decision Brief 6블록으로 제시하고 사용자가 고른다(ADR-053#amend-2 / ADR-060 D3)** → ⑤ ARCHITECTURE §7 결정 블록 기록 + 원장 `closed` 등재. 저-stakes는 현행 단발. **S1~S4는 *분석 깊이* 판정이고 *누가 결정하는가*는 원장의 `authority`가 소유한다** — `agent-delegated`로 배정된 결정은 ④를 건너뛰고 라운드 종료 시 일괄 확인 1회에 포함한다. (Codex: 순차 단일 degrade — researcher 인라인/사전 노트.)
```

### (b) 3번 항목의 "①~④" 번호 갱신

**기존** (37행 중): `아래 \`## 고-stakes 설계 게이트\`의 ①~④ 절차를 따른다`
**변경**: `아래 \`## 고-stakes 설계 게이트\`의 ①~⑤ 절차를 따른다`

### (c) 마지막 출력 — 교체가 아니라 **추가** (기존 슬롯 보존)

**기존** (56~58행):
```markdown
- 갱신한 파일 목록
- 핵심 가정
- 남은 미결정 사항
```
**변경**:
```markdown
- 갱신한 파일 목록
- 핵심 가정
- 남은 미결정 사항 (결정 아닌 품질·형식 지적 — 기존 슬롯 유지)
- **원장 요약**: `closed N건 / deferred M건 / open K건`. open이 있으면 각 항목의 `authority`·필요 시점을 1줄씩 (본문은 `docs/10-charter/DECISION_REGISTER.md`)
```

### (d) 프롬프트 동봉 권장 교체

**기존** (68행): `    - 남은 미결정 사항 본문 (사용자가 다음 skill 발화 전 결정해야 할 항목)`
**변경**: `    - 원장의 \`status: open\` 항목 ID 목록 (사용자가 다음 skill 발화 전 결정해야 할 항목 — 본문은 \`docs/10-charter/DECISION_REGISTER.md\`)`

### (e) 4.0 공통 블록 삽입

## 4.3 bootstrap-stack ← **이번 개선의 핵심**

### (a) BASE 문서화 흐름 2번 — `## 7-1`~`## 7-5` 라운드 승격

**기존** (57행):
```markdown
   - `docs/90-decisions/project/ADR-101-stack-selection.md` — _ADR_GUIDE 권장 섹션 + 옵션·신뢰도·재검토 칸. **`## 7-1`~`## 7-5` 인터페이스 컨벤션 채움은 architect 단발 sub-call(라운드 아님 — ADR-027#31)**. API 감지 → 7-1+7-3, CLI → 7-2, 웹 프론트 → 7-4, 모바일 앱(Flutter) → 7-5.
```

**변경**:
```markdown
   - `docs/90-decisions/project/ADR-101-stack-selection.md` — _ADR_GUIDE 권장 섹션 + 옵션·신뢰도·재검토 칸. API 감지 → 7-1+7-3, CLI → 7-2, 웹 프론트 → 7-4, 모바일 앱(Flutter) → 7-5.
   - **`## 7-1`~`## 7-5` 채움은 소항목별 `authority`를 따른다 (ADR-060 D9 — 구 "라운드 아님" 규정을 부분 supersede)**:

     | 섹션 | `user-approval` — Decision Brief로 제시하고 사용자가 승인 | `agent-delegated` — architect 단발 sub-call, 라운드 끝 일괄 확인 1회 |
     |------|---------------------------------------------------------|--------------------------------------------------------------------|
     | `## 7-1` API | 응답 envelope · 페이지네이션 | HTTP 상태 매핑 · error 레지스트리 · 네이밍 · Don'ts |
     | `## 7-2` CLI | 출력 포맷(기본 모드) | 플래그·명령어 · TTY/ANSI · Don'ts |
     | `## 7-3` 백엔드 | **DB migration · 인증·인가 · API versioning** | 트랜잭션 경계 · Idempotency · Rate limit · Async job · Caching |
     | `## 7-4` 프론트 | **라우팅 · SSR-CSR · 인증(토큰 저장)** | 상태관리 · i18n · SEO · 폼 validation |
     | `## 7-5` 모바일 | **대상 플랫폼·최소 OS · 화면 이동 · 권한 요청 흐름 · 로컬 저장·오프라인 · 서명·배포** | 상태관리 · 네이티브 연동 · 빌드 flavor · 백그라운드 · WebView · Don'ts |

     배정 기준: 되돌린 뒤 **이미 쓴 코드·데이터·사용자 계정에 파급**이 있으면 `user-approval`, 코드 안에서 끝나면 `agent-delegated`.
     `user-approval` 항목만 원장에 등재하고 **라운드당 3~5개 상한**을 지켜 나눠 제시한다(ADR-060 D3). 승인 후 `status: closed` + 정본 앵커(`ARCHITECTURE_OVERVIEW.md#arch-7-N`)를 채운다. `agent-delegated`는 개별 등재 없이 일괄 확인 1회로만 처리한다.
     해당 스택이 아닌 sub-section은 아래 3번대로 삭제하므로 결정 대상이 아니다.
```

### (b) R3 고-stakes 라운드 갱신

**기존** (46행 첫 문장 끝):
```
… ADR-053 게이트(S1~S4 중 1+)에 걸리면 아래 `## 고-stakes 설계 게이트`의 full 패널을 실행.
```
**변경**:
```
… ADR-053 게이트(S1~S4 중 1+)에 걸리면 아래 `## 고-stakes 설계 게이트`의 full 패널을 실행하고, 그 결론을 **Decision Brief로 사용자에게 제시해 확정**한다(ADR-053#amend-2 ④).
```

### (c) 고-stakes 게이트 절차 갱신

**기존** (120행 중): `… → ④ ARCHITECTURE §7 결정 블록 기록. 저-stakes는 단발.`
**변경**: `… → **④ 사용자 선택 — ②의 안을 Decision Brief 6블록으로 제시(ADR-053#amend-2 / ADR-060 D3)** → ⑤ ARCHITECTURE §7 결정 블록 기록 + 원장 \`closed\` 등재. 저-stakes는 단발. **S1~S4는 분석 깊이 판정이고 결정권은 원장 \`authority\`가 소유한다.**`

### (d) 마지막 출력 — 교체가 아니라 **추가**

**기존** (86행): `- 추천 guardrail 목록 + 남은 불확실성`
**변경**:
```markdown
- 추천 guardrail 목록 + 남은 불확실성 (결정 아닌 환경·도구 가정 — 기존 슬롯 유지)
- **원장 요약**: `closed N건 / deferred M건 / open K건` (open이 있으면 `authority`·필요 시점 1줄씩). *결정*은 대화에만 두지 않고 전부 `docs/10-charter/DECISION_REGISTER.md`에 등재한다
```

### (e) 4.0 공통 블록 삽입

## 4.4 bootstrap-design

### (a) 마지막 출력 교체

**기존** (223행): `- 남은 열린 질문`
**변경**:
```markdown
- **원장 요약**: `closed N건 / deferred M건 / open K건` (`docs/10-charter/DECISION_REGISTER.md` — 시각 방향·voice 확정은 `closed`로, 미확정은 `open`으로 등재)
```

### (b) R2-2 취향 오라클 보강

**기존** (142행 첫 문장):
```markdown
- **취향 오라클 (ADR-058)**: 에이전트는 선택지 폭 담당 — 선호 추천·순위 제시 금지(사용자가 물으면 예외).
```
**변경**:
```markdown
- **취향 오라클 (ADR-058)**: 에이전트는 선택지 폭 담당 — 선호 추천·순위 제시 금지(사용자가 물으면 예외). **시각 방향 선택은 `authority: user-choice`이므로 원장에 등재하고 선택 확정 시 `closed` + 정본 앵커(`DESIGN.md ## 1 Overview`)를 채운다(ADR-060). 취향 오라클 원칙상 Decision Brief의 "추천" 블록은 비워 둔다 — 사용자가 요청하면 채운다.**
```

### (c) 후속 안내의 `ready` → `contract-ready` 정정 (206행·224행 2곳)

**기존** (두 곳 공통 문구):
```
확정된 `ready` M에 task 0건/`draft`가 있으면 `/plan-workitem M<N>`
```
**변경** (두 곳 모두):
```
`contract-ready` M에 task 0건/`draft`가 있으면 `/plan-workitem M<N>` → `/seal-milestone M<N>`(ADR-060); `ready`(봉인 완료) M이면 잠겨 있으므로 다음 M
```

### (d) 4.0 공통 블록 삽입

## 4.5 architect.md — 고-stakes 결정의 사용자 선택 단계 명시

> ADR-053#amend-2의 적용 surface에 등재된 파일이다. 고치지 않으면 위임받은 architect가 Decision Brief 없이 ARCH §7에 바로 기록할 수 있어 amend-2의 falsifier와 정확히 일치한다(architect는 Write·Edit 권한 보유).

**파일**: `.claude/agents/architect.md`

### (a) 기존 기록 지시 정정 (35행)

**기존**: `- 결정은 ARCHITECTURE §7 결정 블록(대안/제약/기각/신뢰도/재검토)으로 기록.`
**변경**: `- 결정의 *기록 양식*은 ARCHITECTURE §7 결정 블록(대안/제약/기각/신뢰도/재검토)이다. 단 고-stakes 게이트(ADR-053 S1~S4) 발동 시 **기록 주체는 네가 아니라 호출한 skill**이다 — 아래 \`## 고-stakes 결정의 종결\` 참조.`

> 이 줄을 안 고치면 두 줄 아래 삽입할 블록과 같은 파일 안에서 정면 충돌한다.

### (b) 종결 절차 블록 삽입

`## 출력 계약` 절 **바로 앞**에 한 단락을 삽입한다.

```markdown
## 고-stakes 결정의 종결 (ADR-053#amend-2 / ADR-060 D2·D3)
ADR-053 게이트(S1~S4 중 1+)가 발동한 결정은 **네가 확정하지 않는다.** 다각도 2~3안과 각 안의 트레이드오프·되돌리기 비용을 반환하되, ARCHITECTURE `## 7` 결정 블록에 *선택 결과를 직접 기록하지 않는다* — 호출한 skill이 Decision Brief로 사용자 선택을 받은 뒤 기록한다(④ 사용자 선택 → ⑤ 기록).
`authority: agent-delegated`로 배정된 결정(승인된 경계 안의 가역적 내부 선택)만 네가 확정하고, 그 목록은 라운드 종료 일괄 확인에 실린다.
```

```
git add .claude/skills/discover-product/SKILL.md .claude/skills/bootstrap-project/SKILL.md .claude/skills/bootstrap-stack/SKILL.md .claude/skills/bootstrap-design/SKILL.md .claude/agents/architect.md
```

**커밋 메시지**: `feat(skills): wire decision register and decision briefs into upstream bootstraps`

---

# Phase 5 — 계획 skill 배선

## 5.1 plan-milestone

### (a) 입력 분기 갱신

**기존** (10행 중 (b) 항목):
```
(b) **`ready`(이상) M<N>** → 이미 계획 확정·잠금이므로 **변경 거부** + "그 변경은 다음 마일스톤(M<N+1>)" 안내.
```
**변경**:
```
(b) **`contract-ready` M<N>** → 상위 계약 라운드는 끝났으나 아직 잠기지 않았다. 계약 수정 요청이면 해당 라운드부터 재개하고, 끝나면 다시 `contract-ready`로 둔다(봉인은 `/seal-milestone` 담당). 계약을 고쳤으면 영향받은 feature 문서에 `- 계약 수정: <날짜> — 이 feature의 task 재검증 필요` 마커를 남긴다(ADR-060 D6 stale task 방지). (b-2) **`ready` M<N> + 마일스톤 `## 10`에 `- 봉인일:` 채워짐** → 봉인 완료 상태이므로 **변경 거부** + "그 변경은 다음 마일스톤(M<N+1>)" 안내. (b-3) **`ready` M<N>인데 `## 10` 부재·미채움** → 구 lifecycle에서 온 **마이그레이션 대상**이다(ADR-060 D12). 변경을 거부하지 말고 `/seal-milestone M<N>` 실행을 안내한다(seal이 조건 2~8을 전수 재검사한다).
```

### (b) additive 모드 문장 갱신

**기존** (11행 중): `**\`ready\` 이상 M엔 feature 추가를 금지**한다(결정 5e) — 그 feature는 새 마일스톤(M<N+1>) 범위다.`
**변경**: `**\`ready\` M엔 feature 추가를 금지**한다 — 그 feature는 새 마일스톤(M<N+1>) 범위다. **\`contract-ready\` M에는 feature를 추가할 수 있다**(아직 봉인 전 — ADR-060 D6).`

### (c) Exit 단계 전면 교체 ← 핵심

**기존**: `**Exit — 확정 재대조 → \`ready\` 잠금 …**`으로 시작하는 문단 + 이어지는 `**계획 잠금**:` 문단 + `**단계별 출구**:` 문단 (연속 3문단).

**변경** (세 문단을 통째 교체):
```markdown
**Exit — 확정 재대조 → `contract-ready` (ADR-060 D6)**: plan-milestone 종료 전에 마일스톤 `## 3` 포함기능 ↔ feature `## 3` 시나리오 ↔ **feature `## 7` FAC**가 서로 정합한지 재대조한다(`## 7-1`은 plan-workitem이 나중에 채우는 shell이라 대상 아님). **UI 마일스톤은 추가로** 승인 프로토타입 ↔ `## 3` 시나리오 ↔ PX 인벤토리 ↔ 마일스톤 `## 9` 전환표 정합까지 본다(비-UI는 이 추가분만 skip). 불일치면 해당 라운드로 되돌아가 정합 후 종료.
**재대조 통과 + `docs/10-charter/DECISION_REGISTER.md`에서 이 M을 `영향:`으로 갖는 항목 *및* `영향: (미할당)` 항목의 `status: open` 0건일 때만** — **먼저 산하 feature를 `## 0. Status: contract-ready`로, 마지막에 M을 `contract-ready`로** 전환한다(승격 중 중단 대비). open 항목이 남으면 전환을 보류하고 어느 D-NNN이 막았는지 보고한다. 원장 파일이 없으면 그 사실을 echo하고 이 검사만 skip한다(silent skip 금지).
**`contract-ready`는 잠금이 아니다** — task 분해 진입 자격일 뿐이며, 분해 중 상위 계약 결함이 드러나면 `/repair-plan`이 그 자리에서 고친다. 잠금은 `/seal-milestone`이 `ready`를 부여할 때 발생한다.

**계획 잠금 (ADR-060 D6/D7)**: M/F/task 계획은 `/seal-milestone`이 `ready`를 부여한 시점부터 잠긴다. 그 전(`draft`·`contract-ready`)에는 feature 추가·FAC 수정·프로토타입 갱신·task 수정이 모두 정상 경로다. `ready` 이후의 변경은 다음 마일스톤(M<N+1>)이 기본이고, 구현이 시작되면 task 계획도 변경하지 않는다(근본 충돌은 사용자 중단·보고).
**단계별 출구**: 중단된 산출물은 같은 draft `/plan-milestone M<N>` 재개의 입력이며, 확정 재대조를 통과해 M·전 feature가 `contract-ready`가 된 뒤에만 `/plan-workitem M<N>`을 안내한다(부분 계획 진입 금지).
```

### (d) 마지막 출력 — 교체가 아니라 **추가**

**기존** (120행): `- 남은 미결정 사항 (근거 insight 부재 / 부채 회수 후보 포함)`
**변경**:
```markdown
- 남은 미결정 사항 (근거 insight 부재 / 부채 회수 후보 포함 — 기존 슬롯 유지)
- **원장 요약**: `closed N건 / deferred M건 / open K건`
```

### (e) 다음 단계 블록 교체

마지막 출력의 코드펜스 안 `다음 단계:` 블록을 아래로 교체:
```
다음 단계:
- 기본 권장: `/plan-workitem M<N>` — 본 마일스톤 전 feature의 task·`## 3`·AC·FAC·seam·PX↔AC를 1회 완성(전체 스냅샷). task는 전부 `draft`로 남으며 승격은 `/seal-milestone`이 한다.
- 분기 옵션 (해당 시 — ≤3 개):
  - 마일스톤 plan 교차검토 원하면: 다른 세션·다른 LLM에서 `/validate-plan <M>`(milestone-plan mode) 후 원본에서 `/repair-plan <M>` — **M이 `contract-ready`면 M/F scope·FAC·프로토타입·PX 층 finding도 repair-plan이 그 자리에서 고칠 수 있다**(ADR-060 D6 — `ready` 이후에만 다음 M으로 보낸다)
  - UI feature 포함 + DESIGN.md 미반영 시: `/bootstrap-design --update` 먼저
  - 기획 신뢰도 재확인 원하면: 다른 세션에서 `/validate-discovery --reviewer-tag <tag>` 후 원본에서 `/repair-discovery`
- 프롬프트 동봉 권장:
  - charter `## 5. 비목표` 핵심 키워드
  - R0의 부채 회수 후보
  - 원장의 `status: open` 항목 ID 목록 (있으면 — 봉인 전에 닫아야 한다)
```

### (f) R1 라운드 본문에 `(미할당)` triage 명시

> triage 의무를 `## 결정 마감` 부록 블록에만 두면 라운드를 실행할 때 놓치기 쉽다. R1 서술 자체에 박는다.

**R1 라운드**(입력 intake — 55~60행 부근)의 마지막 불릿 **다음**에 한 줄을 추가한다:
```markdown
- **`(미할당)` 결정 triage (ADR-060 D1)**: `docs/10-charter/DECISION_REGISTER.md`에서 `영향: (미할당)` + `status: open`인 항목을 전수 회수해, 이번 마일스톤 범위면 `영향: M<N>`으로 배정하고 아니면 앵커·회수 시점을 붙여 `deferred`로 정리한다. **bootstrap 구간(마일스톤 존재 전)에 등재된 미결정의 유일한 회수 지점**이므로 건너뛰지 않는다. 원장 파일이 없으면 사유 echo 후 skip.
```

### (g) 4.0 공통 블록 삽입 — **4.0-b 변형 적용**

## 5.2 plan-workitem

### (a) 입구 상태 확인 교체 ← 핵심

**기존**: 13행의 `- **입구 상태 확인 (결정 5b·5d)**: …` 불릿 전체.

**변경**:
```markdown
  - **입구 상태 확인 (ADR-060 D6)**: (i) **M과 산하 feature가 모두 `## 0. Status: contract-ready`**인지 — `draft`(plan-milestone 미완)면 "plan-milestone으로 계약 확정 먼저" 안내 후 종료; `ready` **이고 마일스톤 `## 10`에 `- 봉인일:`이 채워졌으면** "봉인 완료 — 계획 잠금. 변경은 다음 M<N+1>" 안내 후 종료; `ready`인데 **`## 10`이 부재·미채움이면 마이그레이션 대상**이므로 거부하지 말고 `/seal-milestone M<N>` 실행을 안내한다(ADR-060 D12); (ii) 그 M의 task가 하나라도 `draft` 밖(`ready`·`in-progress`·`blocked`·`done`·`deprecated`)이면 계획 변경을 거부한다. 모든 기존 task가 `draft`일 때만 상태별 분기: **(A) task 0건(최초 실행) → 전 feature task를 `draft`로 생성하며 `## 3`·AC·`## 9`·FAC↔AC·(UI)PX↔AC를 작성**; **(B) `draft` task 존재 → 미완 작성분을 이어서 채운다**(기존 task ID 유지, 중복 생성 금지); **(C) 전 task `draft`+완결 → read-only no-op + `/seal-milestone M<N>` 안내**. **본 skill은 어떤 상태도 승격하지 않는다** — task는 전부 `draft`로 남고 `ready` 승격은 `/seal-milestone` 단독이다(ADR-060 D7).
  - **계약 수정 마커 확인 (ADR-060 D6)**: feature 문서에 `- 계약 수정: <날짜> — 이 feature의 task 재검증 필요` 마커가 있으면 그 feature를 **완결로 보지 않고** 재검증한다(FAC/시나리오 의미가 바뀌었는데 ID·매핑이 그대로라 skip되는 stale task 차단). 재검증 후 마커를 제거한다.
```

### (b) 멱등 정의 갱신

**기존** (19행 중): `… + "남은 미결정 사항" 0건이 *모두* 충족된 것만 skip한다.`
**변경**: `… + "남은 미결정 사항" 0건 + **\`- 계약 수정:\` 마커 부재**가 *모두* 충족된 것만 skip한다.`

### (c) 열린 질문 영속 불릿 교체 ← 핵심

**기존**: 22행 전체 (`- **열린 질문 영속 (결정 5)**: …`).

**변경**:
```markdown
- **미결정 등재 (ADR-060 D1/D4)**: *사용자가 정하거나 승인해야 할* 미결정이 발생하면 **`docs/10-charter/DECISION_REGISTER.md`에 등재**한다(milestone `## 7`·feature `## 12`는 폐지 섹션이므로 쓰지 않는다). 등재 시 `authority`를 확정하고(D2), `user-*`면 Decision Brief 6블록으로 제시한다(D3, 라운드당 3~5개). 해결되면 `status: closed` + 정본 앵커를 채우고, 미룰 거면 **현재 M 무영향 근거 + 이관 앵커 + 회수 시점 3개를 모두 갖춘 `deferred`**로 바꾼다(3개 중 하나라도 없으면 `open` 유지). **이 M을 `영향:`으로 갖는 `open`이 하나라도 남으면 `/seal-milestone`이 봉인을 거부한다** — 본 skill은 차단하지 않고 미완 사실만 보고한다(승격 권한 없음). 재실행 시 *출력 기억이 아니라 원장을 읽어* 판정한다.
  **원장 대상이 아닌 것**: 품질·형식 지적(raw hex·컴포넌트 중복·voice 위반·use-case 상태 누락)과 계획 결함(unmapped FAC/PX·미커버 전환 path·AC 해석 후보·부채 회수 후보·새 의존성 도구)은 **기존 "남은 미결정 사항" 출력 슬롯에 그대로** 둔다(ADR-060 D1 등재 범위 — 원장은 결함 추적기가 아니다).
```

### (d) 의존성 계약 문단의 승격 문구 정정

**기존** (24행 중): `중 하나라도 있으면 plan-workitem을 성공 종료시키거나 task를 \`ready\`로 승격하지 않는다.`
**변경**: `중 하나라도 있으면 plan-workitem을 성공 종료시키지 않는다(승격은 본 skill 권한이 아니다 — ADR-060 D7).`

### (e) 확정 후 변경 경계 문단 교체

**기존** (28행 첫 문장):
```markdown
**확정 후 변경 경계 (ADR-057#amend-3 / ADR-056#amend-1)**: plan-workitem은 마일스톤 전체 계획 스냅샷의 작성과 멱등 재개만 제공한다. 프로토타입은 `/plan-milestone M<N>` 확정 시점에 잠기며, 확정 뒤 프로토타입·기획 변경은 새 마일스톤(M<N+1>)에서 처리한다.
```
**변경**:
```markdown
**확정 후 변경 경계 (ADR-060 D6 / ADR-056#amend-1)**: plan-workitem은 마일스톤 전체 계획 스냅샷의 작성과 멱등 재개만 제공한다. **M이 `contract-ready`인 동안에는 상위 계약(프로토타입·FAC·scope)도 아직 잠기지 않았다** — 분해 중 상위 계약 결함이 드러나면 다음 마일스톤으로 보내지 말고 사용자에게 보고해 `/plan-milestone M<N>` 재개 또는 `/repair-plan M<N>`으로 그 자리에서 고친다. 잠금은 `/seal-milestone`이 `ready`를 부여한 뒤에 발생하며, 그 뒤의 기획 변경은 새 마일스톤(M<N+1>)이다.
```

### (f) 마지막 출력 — 교체가 아니라 **추가**

**기존** (133행): `- 남은 미결정 사항`
**변경**:
```markdown
- 남은 미결정 사항 (품질·형식 지적 + 계획 결함 — 기존 슬롯 유지)
- **원장 요약**: `이 M 영향 — closed N건 / deferred M건 / open K건` (open 목록은 ID + `authority` 1줄씩. 봉인 전에 전부 닫아야 한다)
```

### (g) 다음 추천 단계 교체

**기존** (145행): `- 다음 추천 단계 (보통 \`/implement-workitem [task-id]\`, 또는 cross-review를 끼우려면 \`/validate-plan [workitem-id]\` 먼저)`
**변경**:
```markdown
- 다음 추천 단계:
  - 기본 권장: `/seal-milestone M<N>` — 최종 검사 + 사용자 승인 + task/feature/milestone 일괄 `ready` 승격. **봉인 전에는 `/implement-workitem`이 착수하지 않는다.**
  - 권장(opt-in, ADR-038): 봉인 전에 다른 세션·다른 LLM에서 `/validate-plan M<N>` → 원본 세션에서 `/repair-plan M<N>`. M이 `contract-ready`이므로 상위 계약 결함도 이 시점에 고칠 수 있다.
```

### (g-2) 경험 계약 입구 점검의 `ready` 잔존 문구 정정

**기존** (14행 끝): `이미 \`ready\`인 M에서 발견되면 plan-milestone을 자동 재호출하지 말고 상위 P0로 사용자에게 보고한다.`
**변경**: `\`contract-ready\` M에서 발견되면 같은 draft \`/plan-milestone M<N>\`에서 계약을 완성한 뒤 재실행한다. 봉인 완료(\`ready\` + receipt) M에서 발견되면 자동 재호출하지 말고 상위 P0로 사용자에게 보고한다.`

> 새 입구 게이트가 `ready` M을 즉시 종료시키므로, 기존 문구는 도달 불가 지시로 남는다.

### (h) 잔존 "열린 질문" 지시 정정

**기존** (118행): `- 열린 질문이 남으면 문서에 명시한다.`
**변경**: `- 사용자가 정하거나 승인해야 할 미결정이 남으면 \`docs/10-charter/DECISION_REGISTER.md\`에 등재한다 (ADR-060 D1 — 폐지된 "열린 질문" 섹션에 쓰지 않는다).`

### (i) `## 7-1` 책임 경계의 "12 main sections" 정정

**기존** (91행 중): `feature 문서 *본문 12 main sections* + \`## 7 FAC\` 작성 …`
**변경**: `feature 문서 *본문 main sections(\`## 12\` 폐지로 11개 — ADR-060 D1)* + \`## 7 FAC\` 작성 …`

### (j) 4.0 공통 블록 삽입 — **4.0-b 변형 적용**

`/plan-milestone`·`/plan-workitem`은 정본 3종을 소유하지 않으므로, 공통 블록의 **6·7항을 4.0-b 변형으로 바꿔** 삽입한다.

## 5.3 planner.md — 잔존 "열린 질문" 지시 정정

**파일**: `.claude/agents/planner.md`

**기존** (27행): `- 열린 질문이 남으면 문서에 명시한다.`
**변경**: `- 사용자가 정하거나 승인해야 할 미결정이 남으면 \`docs/10-charter/DECISION_REGISTER.md\`에 등재한다 (ADR-060 D1).`

## 5.4 같은 파일 안의 잔존 모순 2건 정정 (5.1(b)·5.2(e)가 만든 것)

> (b)와 (e)가 새 규칙을 심는 동안 **같은 파일의 다른 문장이 구 규칙을 그대로 말하고 있는** 자리가 두 곳 남는다. 둘 다 조각 치환이며, 고치지 않으면 한 파일 안에서 정면 충돌한다.

### (a) plan-milestone — feature 추가 조건 (11행)

5.1(b)가 `contract-ready` M의 feature 추가를 허용하는데, 같은 줄 앞부분은 여전히 `draft` M만 허용한다.

**기존 조각**: `**기존 마일스톤에 *새 feature만* 추가하는 경우는 \`draft\` M<N> 재개 대화 안에서만** 처리한다(별도 \`feature idea\` 진입 제거 — draft 마일스톤이 여럿이면 대상이 모호)`
**변경 조각**: `**기존 마일스톤에 *새 feature만* 추가하는 경우는 \`draft\`·\`contract-ready\` M<N> 재개 대화 안에서만** 처리한다(별도 \`feature idea\` 진입 제거 — 미봉인 마일스톤이 여럿이면 대상이 모호)`

### (b) plan-workitem — 마지막 출력의 배치 모드 요약 (132행)

5.2(e)가 "`contract-ready` 동안 현재 M에서 고친다"로 바꾼 규칙을, 출력 포맷 줄의 괄호가 구 규칙("기획 변경은 다음 마일스톤")으로 되돌린다.

**기존 조각**: `계획 후 재접지 없음, 프로토타입·기획 변경은 다음 마일스톤)`
**변경 조각**: `계획 후 재접지 없음, 봉인(\`/seal-milestone\`) 후 프로토타입·기획 변경은 다음 마일스톤)`

> `계획 후 재접지 없음`은 그대로 둔다 — 코드-stale 확인은 task 실행 시점(implement §4.12b)이라는 ADR-057#amend-3 규칙이 유지된다.

```
git add .claude/skills/plan-milestone/SKILL.md .claude/skills/plan-workitem/SKILL.md .claude/agents/planner.md
```

**커밋 메시지**: `refactor(skills): end plan-milestone at contract-ready and stop plan-workitem promotion`

---

# Phase 6 — `/seal-milestone` 신설

> Phase 5에서 plan-workitem이 승격 권한을 놓은 뒤에 한다.

## 6.1 Claude skill 본문

**새 파일**: `.claude/skills/seal-milestone/SKILL.md`

````markdown
---
name: seal-milestone
description: 마일스톤 계획을 최종 검사하고 사용자 승인을 받아 task/feature/milestone을 일괄 ready로 봉인한다. 내용 수정·커밋은 하지 않는다 (ADR-060).
argument-hint: "<milestone-id>"
disable-model-invocation: true
allowed-tools: Read Glob Grep Edit
---

이 skill은 **검사 + 사용자 승인 + 상태 전이 전용**이다. 문서 내용을 수정하지 않고, 코드를 건드리지 않으며, 커밋하지 않는다.
**실패 시 어떤 상태도 바꾸지 않고** 어느 조건이 막았는지 보고하며 소유 skill로 반환한다.

봉인이 부여하는 것: M/F/task 계획의 **잠금**. 이 시점부터 계획 변경은 다음 마일스톤(M<N+1>)이 기본이다.
봉인의 목적은 *알려졌거나 합리적으로 발견 가능한 미결정을 최대한 닫는 것*이지 사후 발견을 차단하는 게 아니다 — 봉인 후 새로 드러난 결정은 착수를 막지 않는다(ADR-060 D11).

**Codex**: `.agents/skills/seal-milestone/` wrapper 보유 — `$seal-milestone M1`로 호출한다.

입력:
- `$ARGUMENTS`에 마일스톤 ID `M<N>` 하나만 받는다. 형식은 `M[0-9]+`. 그 외 입력은 안내 후 종료.

반드시 먼저 읽을 파일:
- 입력 `M<N>` 마일스톤 문서 (`## 0. Status`·`## 3`·`## 10`)
- 그 `## 3. 포함되는 기능`이 가리키는 각 feature 문서
- 그 feature들이 소유하는 각 task 문서
- `docs/10-charter/DECISION_REGISTER.md` — **이 M을 `영향:`으로 갖는 항목 + `영향: (미할당)` 항목**만 색인 회수(둘 다 조건 6의 검사 대상이다)
- `docs/40-validation/plan-reviews/` 디렉터리 목록 (파일 본문은 잔존 시에만 읽는다)

## 0단계 — 진입 모드 판정 (정상 / 재개)

승격은 파일 순차 쓰기라 중단될 수 있다. **먼저 모드를 판정한다.**

| 관측 상태 | 모드 |
|-----------|------|
| M `contract-ready` + 산하 feature 전부 `contract-ready` + task 전부 `draft` | **정상 진입** — 조건 1~9 전부 검사 |
| M `contract-ready`이고 feature/task에 `ready`가 섞여 있음 | **재개 진입** — 조건 2~8을 **전 문서에 다시 검사**하고 *상태 쓰기만* 이미 승격된 문서에서 생략한다. **승인은 반드시 다시 받는다**(아래) |
| M `ready` + `- 봉인일:` 미채움 + 그 M에 `in-progress`/`done` task **0건** | **마이그레이션 진입(계획만 된 프로젝트)** — 조건 2~8을 전수 재검사한 뒤 승인을 받고 receipt를 기록한다 |
| M `ready` + `- 봉인일:` 미채움 + 그 M에 `in-progress`/`done` task **1건 이상** | **grandfather 진입(이미 구현 중)** — 아래 별도 규칙 |
| M `ready` + `- 봉인일:` 채워짐 | **이미 봉인됨** — 아무것도 바꾸지 않고 종료 |
| M `draft` | `/plan-milestone M<N>` 안내 후 종료 |

**재개 진입에서는 "전부 draft" 요구를 적용하지 않는다** — 이 예외가 없으면 부분 승격 상태가 영구히 갇힌다. **다만 검사 자체는 전 문서에 다시 돌린다** — 이미 `ready`라는 이유로 검사에서 빼면, 중단 이후 오염되거나 바뀐 문서가 무검증으로 봉인된다.

**재개·마이그레이션 진입에서도 사용자 승인을 반드시 다시 받는다.** 승인 증거(receipt)는 모든 상태 변경 *뒤에* 기록되므로, 중단된 실행에서는 승인 사실이 어디에도 영속되지 않는다. "앞선 실행이 승인받았을 것"이라고 가정하면 승인 없는 봉인이 성립한다.

**grandfather 진입 — 이미 구현이 시작된 마일스톤 (ADR-060 D12):**
이 보일러플레이트를 쓰던 프로젝트 중 다수는 M이 `ready`이고 task가 이미 `in-progress`/`done`이다. 이 상태에 조건 2("`in-progress`·`done`이 있으면 중단")를 적용하면 **seal도 못 하고 implement도 못 하는 순환 교착**이 된다(implement 게이트 ④가 receipt를 요구하므로).
따라서 이 진입에서는:
1. **조건 2를 적용하지 않는다.** 이미 구현이 시작됐으므로 계획 잠금의 실익(구현 전 확정)이 이미 지나갔고, 소급 검사는 무의미하며 진행만 막는다.
2. 조건 6(원장 open)·7(가설)은 **보고만** 하고 차단하지 않는다. 조건 3·4·5는 관측해 receipt에 수치로 남긴다.
3. 사용자에게 **이 마일스톤은 봉인 도입 전에 착수됐고 소급 검사를 하지 않는다**는 사실을 알리고 명시 확인 1회를 받는다.
4. receipt의 첫 줄을 `- 봉인일: <YYYY-MM-DD> (마이그레이션 — 구현 중 착수, 소급 검사 없음)`로 기록한다. **진짜 봉인과 라벨로 구분된다** — 이 라벨이 없으면 사후에 "봉인된 계획"으로 오독된다.
5. 이후 마일스톤(M<N+1>)부터는 정상 경로를 탄다.

## 봉인 조건 (하나라도 불충족이면 중단)

순서대로 검사하고, 실패한 첫 항목에서 멈춰 **어느 조건이 왜 막았는지 + 어느 skill로 가야 하는지**를 보고한다.

1. **상태** — 0단계 판정 결과가 **정상 / 재개 / 마이그레이션 / grandfather** 중 하나일 것(`draft` M과 이미 봉인된 M은 0단계에서 이미 종료됐다).
2. **task 존재·상태** — 마일스톤 `## 3`의 모든 feature가 task를 1개 이상 갖고, *아직 승격되지 않은* task가 전부 `draft`. `in-progress`·`blocked`·`done`·`deprecated`가 있으면 중단(구현이 시작된 흔적). **단 0단계가 grandfather 진입으로 판정했으면 본 조건을 적용하지 않는다**(그 분기의 규칙 1).
3. **task 필수 섹션 완결** — 각 task의 `## 3. 구현 항목`(단계별 가이드), `## 6. Acceptance Criteria`(1개 이상), `## 9. 의존성`이 채워졌는가. angle-bracket placeholder(`<runner>` 등)만 남은 칸은 미완으로 본다.
3-b. **AC 해석 확정 (implement 착수 게이트 ⑦ 선행 집행)** — 각 task `## 6` AC를 읽어 *구현을 실질적으로 다르게 만드는 2+ 해석*이 가능한 AC가 있으면, 그 task `## 8. 메모`에 `해석 확정: AC-N = <선택>` 기록이 있는지 확인한다. 없으면 중단하고 해석안 1~3개와 영향을 사용자에게 제시해 결정을 받는다. **사용자가 그 자리에서 고르면 본 skill이 예외적으로 그 task `## 8`에 `해석 확정:` 한 줄만 기록하고 검사를 이어간다** — plan-workitem은 완결된 계획에 대해 read-only no-op이라 이 한 줄을 넣어 줄 경로가 없다(내용 수정 금지 원칙의 좁은 예외이며, 사용자가 명시 선택한 문장을 받아 적는 것이다). 사용자가 보류하면 중단한다. **이 검사가 없으면 봉인을 통과한 계획이 첫 구현에서 즉시 halt한다.**
3-c. **TDD opt-out 형식 (게이트 ⑧ 선행)** — 각 task `## 6-2`가 *사유·follow-up 둘 다 있거나 둘 다 없는* 형식인지 확인. 하나만 있으면 중단.
4. **커버리지** — 각 feature `## 7-1` FAC↔AC unmapped 0건. UI feature는 `## 7-3` PX↔AC unmapped 0건. seam 신호가 발화한 feature는 `## 7-2` INV가 채워지고 unmapped 0건.
5. **의존성 그래프** — task `## 9`의 선행 참조가 (a) 실재하는 task를 가리키고 (b) 순환이 없고 (c) 후행 `## 3`가 전제한 산출이 그 선행 task의 참조 AC에 존재하는가.
6. **결정 원장 (ADR-060 D1/D4)** — 원장에서 이 M을 `영향:`으로 갖는 항목 **및 `영향: (미할당)` 항목**을 회수해 아래를 검사한다. **단 0단계가 grandfather 진입으로 판정했으면 중단하지 않고 보고만 한다**(그 분기의 규칙 2):
   - `status: open`이 **0건**인가. **단 `- 발견: 봉인 후 (M<N>)` 줄이 *이번에 봉인하는 그 M*을 가리키는 항목만 제외한다**(D11 — 다른 M을 가리키는 마커는 제외 사유가 아니다). 1건이라도 남으면 중단하고 그 D-NNN과 `authority`를 보고한다.
   - **`영향: (미할당)` open이 남아 있으면 중단**하고 `/plan-milestone M<N>` R1의 triage를 안내한다(상류 bootstrap에서 등재된 미결정이 배정 없이 새는 것을 막는 지점).
   - `status: deferred` 항목이 전부 **현재 M 무영향 근거 + 이관 앵커 + 회수 시점** 3개를 갖췄는가. 결측이면 `open`으로 간주해 중단한다.
   - `disposition: risk-accepted` 항목이 전부 `authority: user-*`이고 **검증 방법·판정일·중단 기준** 3필드를 갖췄는가.
   - `authority: agent-delegated`인데 되돌리기 비싼 결정(제품 범위·사용자 체감·외부 계약·보안 정책·비가역 약속)을 담고 있고 하향 이력 줄도 없으면 오분류로 보고 중단한다.
   - **원장 파일이 없으면 silent skip하지 않는다** — 원장은 baseline 산출물이므로 부재는 삭제 또는 구 fork를 뜻한다. 사실을 보고하고 *사용자 명시 확인 1회*를 받은 뒤에만 이 조건을 skip한다(확인 사실은 receipt에 `Register: 파일 부재 — 사용자 확인 후 skip`으로 남긴다).
7. **가설 (ADR-035#amend-3 / ADR-060 D5)** — `docs/10-charter/DISCOVERY.md`가 **존재하면** `## 12. Assumption Tracker`의 미검증 가정 중 **실패 시 이 마일스톤 목표가 무효가 되는 핵심 가설**이 있으면 중단한다. 검증 계획 없는 미검증 가정도 중단. 그 외는 원장에 `risk-accepted`로 등재돼 있으면 통과. **DISCOVERY.md가 없으면(discovery 생략 프로젝트 — PROJECT_START_CHECKLIST 1단계는 선택) 본 조건을 skip하고 사유를 echo한다.** **grandfather 진입에서도 중단하지 않고 보고만 한다**(그 분기의 규칙 2).
8. **리뷰 (opt-in — 차단 조건 아님, 기록 대상)**:
   - **잔존 review 파일 확인**: `docs/40-validation/plan-reviews/`에서 이 M(`M<N>.*.md`) **및 산하 feature/task**(`F-NNN.*.md`·`T-NNN.*.md`) 파일을 회수한다. 잔존 파일이 있으면 각 파일의 `- 판정:` 줄과 finding 목록을 읽어:
     - `NEEDS_CHANGES`이거나 **P0 finding 1건 이상**이거나 **`[seal-blocking]` 태그가 붙은 finding**이 남아 있으면 → 중단하고 `/repair-plan M<N>` 안내.
     - `ALL_GOOD` + P0 0건 + 차단 태그 0건이면 → **통과 판정 후 그 파일을 삭제**한다(리뷰를 돌렸고 문제가 없었던 정상 경우 — `validate-plan`은 ALL_GOOD에도 파일을 만들고 `repair-plan`은 고칠 게 없으면 실행되지 않으므로 파일이 남는 게 정상이다). 삭제 경로를 출력에 echo하고 receipt에 `executed: yes`로 기록한다.
       > **삭제하는 이유**: `/implement-workitem` 착수 게이트 ⑤가 "미해결 review 파일 없음"을 요구한다. 남겨 두면 봉인 직후 구현이 ⑤에서 막힌다. review 파일은 gitignored ephemeral이므로 삭제는 "내용 수정 금지" 계약에 걸리지 않는다(판정 결과는 receipt에 남는다).
   - **잔존 파일이 없으면 사용자에게 1회 묻는다**: "이 마일스톤 계획을 `/validate-plan`으로 리뷰하셨습니까? (별도 세션 / 같은 세션 / 안 함)". 답을 그대로 receipt에 기록한다. **추론하지 않는다** — repair 결정 이력은 P0/P1만 남고 finding 0건 리뷰는 흔적이 없어 판정 소스가 될 수 없다.
   - **어느 답이든 봉인을 막지 않는다.** "안 함"이면 그 사실을 receipt에 남기고 "봉인 전 리뷰를 권장한다" 1줄을 출력한다.
9. **사용자 최종 승인** — 아래 봉인 요약표를 제시하고 명시 승인을 받는다. 승인 없이 어떤 상태도 쓰지 않는다.

## 봉인 요약표 (사용자 승인 요청 시 출력)

```
봉인 대상: M<N> — <목표 한 줄>

계획       feature <F수>개 / task <T수>개 / AC <AC수>개
완결성     필수 섹션 미완 0 / AC 해석 미확정 0 / TDD 형식 위반 0
커버리지   FAC↔AC unmapped 0 / PX↔AC unmapped 0 / INV unmapped 0
의존성     순환 0 / 미존재 참조 0 / AC-보장 미충족 0
결정 원장  closed <N> / deferred <M> (전원 앵커 보유) / open 0
가설       핵심 가설 미검증 0 / risk-accepted <K>건 (검증계획 보유)
리뷰       executed <yes|no|안 함> / independence <...> / 차단 finding 0

봉인하면 M/F/task 계획이 잠깁니다. 이후 기획 변경은 다음 마일스톤(M<N+1>)이 기본입니다.
승인하시겠습니까? (승인 / 보류 / <항목> 다시 보여줘)
```

## 승격 (승인 후에만)

**순서를 반드시 지킨다 — `task → feature → milestone`.**
M을 마지막에 써야 "M=`ready` ⇒ 하위 전부 `ready`" 불변식이 성립한다. 중간에 끊기면 0단계가 재개 진입으로 인식해 나머지만 승격한다.

1. 산하 모든 task `## 0. Status`: `draft` → `ready`
2. 산하 모든 feature `## 0. Status`: `contract-ready` → `ready`
3. 마일스톤 `## 0. Status`: `contract-ready` → `ready`
4. 마일스톤 `## 10. 봉인 기록`에 seal receipt 기록 (**`- 봉인일:` 줄의 채움이 봉인 완료 표식**이다 — 섹션은 템플릿에 빈 채로 존재하므로 존재 여부로 판정하면 게이트가 상수 통과가 된다):
   ```
   - 봉인일: <YYYY-MM-DD>
   - 승인: 사용자 명시 승인
   - 계획 규모: feature <F수> / task <T수> / AC <AC수>
   - 리뷰: executed <yes|no> | independence <separate-session|same-session(under-verified)|none> | 처리 <P0 N건 / 차단 P1 M건>
   - Register: closed <N>건 / deferred <M>건 / open 0건
   ```

## 하지 않는 것

- 문서 *내용* 수정 (상태값 + `## 10` receipt + 조건 3-b의 `해석 확정:` 한 줄만 쓴다). 그 밖의 내용 결함은 소유 skill(`/plan-milestone`·`/plan-workitem`·`/repair-plan`)로 반환한다.
- git commit·tag (커밋은 사용자가 별도 발화).
- 코드 수정·테스트 실행.
- 조건 미충족 시의 자동 수정·자동 재계획.
- 조건 미충족인데 receipt 기록 (빈·미완 마일스톤에 봉인 도장 금지).

**"실패 시 어떤 상태도 바꾸지 않는다"의 명시 예외 2가지**:
1. **조건 3-b의 `해석 확정:` 기록** — 사용자가 그 자리에서 실제로 내린 결정이므로, 이후 조건에서 BLOCKED되더라도 **유지한다**(되돌리면 사용자 결정이 유실되고 다음 실행이 같은 질문을 반복한다).
2. **조건 8의 ALL_GOOD review 파일 삭제** — 판정 결과가 receipt 대신 출력 echo로 남고, 파일은 ephemeral이다. 뒤 조건에서 BLOCKED되면 receipt가 없으므로 다음 실행이 조건 8을 "잔존 파일 없음"으로 보고 사용자에게 리뷰 수행 여부를 다시 묻는다(정보 손실은 "리뷰를 돌렸다"는 사실 1건이며 재질문으로 복구된다).

그 외에는 실패 시 어떤 상태·문서도 바꾸지 않는다.

## 마지막 출력

- 판정: `SEALED` / `BLOCKED: <조건 번호> <사유>`
- (SEALED) 승격한 문서 수 — task <N> / feature <M> / milestone 1 + receipt 요약 1줄
- (BLOCKED) 막은 조건 + 가야 할 skill 1개
- 다음 단계:
  ```
  다음 단계:
  - 기본 권장 (SEALED): `/implement-workitem <첫 task-id>` — 의존성 순서상 선행이 없는 task부터.
  - 기본 권장 (BLOCKED): `<막은 조건이 지정한 skill>`
  - 프롬프트 동봉 권장: 원장의 이 M 관련 `deferred` 항목 ID (구현 중 이 범위를 넓히지 않도록)
  ```

## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. plan-review 파일 본문은 *잔존 시에만* 읽고, 원장은 `영향:` 색인으로 **이 M 항목 + `(미할당)` 항목**만 회수한다(통독 금지).
정책 근거: [ADR-060](../../../docs/90-decisions/boilerplate/ADR-060-decision-closure-and-milestone-seal.md).
````

## 6.2 Codex wrapper

**새 파일**: `.agents/skills/seal-milestone/SKILL.md`

기존 wrapper(`.agents/skills/plan-workitem/SKILL.md`)를 열어 형식을 확인한 뒤 같은 형식으로 작성하되, **본문에 `ADR-060` 문자열을 반드시 포함**한다(예: 마지막 줄에 `정책 근거: ADR-060 (decision closure & milestone seal).`). ADR-060 `## Surfaces`에 등재된 파일에 역참조가 없으면 `stabilize` preflight가 `P1 [Surface-backref]`로 잡는다.

**새 파일**: `.agents/skills/seal-milestone/agents/openai.yaml`

`.agents/skills/plan-workitem/agents/openai.yaml`을 **그대로 복제**한다 — 실측상 이 파일은 name/description 키 없이 아래 2줄뿐이다(고칠 값이 없다).
```yaml
policy:
  allow_implicit_invocation: false
```

## 6.3 로스터 동기 + 역참조 (같은 커밋 필수)

> preflight 7이 `(.claude/skills 집합) − (.agents/skills wrapper 집합)`과 README 자연어 목록의 일치를, Surfaces forward check가 역참조를 결정적으로 검사한다.

### (a) README.md

**기존** (111행 중): `… $plan-milestone, $plan-workitem, $validate-plan, …`
**변경**: `$plan-workitem` 다음에 `$seal-milestone` 추가.

**기존** (114행):
```
   - Planning / bootstrap / stabilize: `$plan-milestone <milestone idea>`, `$plan-workitem M1`, `$bootstrap-project <brief>`, …
```
**변경**:
```
   - Planning / bootstrap / seal / stabilize: `$plan-milestone <milestone idea>`, `$plan-workitem M1`, `$seal-milestone M1` (plan lock gate — ADR-060), `$bootstrap-project <brief>`, …
```
> `ADR-060` 문자열이 들어가야 역참조 검사를 통과한다.

### (b) README_ko.md

110행 wrapper 목록에 `$seal-milestone` 추가 + Codex 호출 예시 줄에 `$seal-milestone M1 (계획 잠금 게이트 — ADR-060)` 추가. **`ADR-060` 문자열 포함 필수.**

> 자연어 호출 목록(`discover-product`, `review-doc`, `boilerplate-context`, `bootstrap-design`, `research-pack`)은 **변경하지 않는다**.

### (c) STRUCTURE.md 산출물 표

**기존** (38행): `| Claude skill 본문 | \`.claude/skills/<name>/SKILL.md\` (21종 — …/plan-milestone/plan-workitem/validate-plan/…) | … |`
**변경**: `21종` → `22종`, `plan-workitem/` 다음에 `seal-milestone/` 추가.

**추가** — `project charter` 행 바로 아래:
```
| decision register | `docs/10-charter/DECISION_REGISTER.md` | `/discover-product`·`/bootstrap-*`·`/plan-*`·`/repair-plan` (등재) · `/seal-milestone` (판정) — 정책 ADR-060 | Living | baseline |
```

**추가** — Canonical Owner 표 마지막:
```
| 기획 결정 마감 + 마일스톤 봉인 (원장·authority·contract-ready·seal) | [ADR-060](../90-decisions/boilerplate/ADR-060-decision-closure-and-milestone-seal.md) (정책 SSOT). → ADR-060 `## Surfaces` 참조 (fan-out SSOT). |
```

```
git add .claude/skills/seal-milestone/ .agents/skills/seal-milestone/ README.md README_ko.md docs/00-meta/STRUCTURE.md
```

**커밋 메시지**: `feat(skills): add seal-milestone as the milestone planning gate`

---

# Phase 7 — 하류 skill 배선

## 7.1 validate-plan — `[Plan-decision]` 신설 + 재번호

### (a) 읽을 파일에 원장 추가

`- \`docs/10-charter/PROJECT_CHARTER.md\` (…)` 줄 **바로 다음**에 삽입:
```markdown
- `docs/10-charter/DECISION_REGISTER.md` — 입력 workitem을 `영향:`으로 갖는 항목만 색인 회수 ([Plan-decision] 참조. 파일 부재 시 본 차원 skip + "핵심 관찰"에 명시)
```

### (b) 차원 헤더 갱신

**기존** (51행): `검토 차원 (11 dimensions — reviewer.md의 *Plan Quality 11 차원* 정합 — ADR-027#amend-1):`
**변경**: `검토 차원 (12 dimensions — reviewer.md의 *Plan Quality 12 차원* 정합 — ADR-027#amend-1 / ADR-060 D8):`

### (c) 차원 12 신설

11번 `[Plan-seam]` **바로 다음**에 삽입:
```markdown
12. **[Plan-decision]** (ADR-060 D8 — 결정 마감) — ① 문서 본문에서 *암묵적으로 확정된* **`user-*` 급 결정**(제품 범위·사용자 체감·외부 계약·보안 정책·비가역 약속)이 `docs/10-charter/DECISION_REGISTER.md`에 미등재. **하한선: 되돌리기 비용이 "중간" 이상인 것만 잡는다** — 이 항목은 P0이고 P0는 곧 `[seal-blocking]`이라, 폭을 좁히지 않으면 리뷰어 오탐이 그대로 봉인 차단이 된다 ② **부모 M이 `contract-ready` 이상일 때만** — 이 workitem을 `영향:`으로 갖는 `status: open` 잔존(그 M을 가리키는 `- 발견: 봉인 후 (M<N>)` 항목 제외). *`draft` M을 리뷰할 때는 open이 정상이므로 발화하지 않는다* ③ `deferred`인데 무영향 근거·이관 앵커·회수 시점 중 결측 ④ `authority: agent-delegated`인데 실제로는 되돌리기 비싼 결정이고 하향 이력 줄도 없는 오분류 ⑤ `risk-accepted`인데 검증 방법·판정일·중단 기준 중 결측. **P0 권장**. **`agent-delegated` 결정 자체의 미등재는 지적하지 않는다**(등재 대상이 아님 — ADR-060 D1). 원장 파일이 없으면 skip + "핵심 관찰"에 명시.
```

### (d) milestone-plan 4차원 재번호 ← 필수

**기존** (65~68행): `12. **[MP-FAC-quality]**` / `13. **[MP-feature-scope]**` / `14. **[MP-graduation]**` / `15. **[MP-feature-dep]**`
**변경**: 각각 `13.` / `14.` / `15.` / `16.` (본문 불변). **번호 중복을 남기면 안 된다.**

### (e) milestone-plan mode 활성 목록 갱신

**기존** (46행): `- **비활성**: [Plan-sizing]·[Plan-AC-form]·[Plan-dep] (task 산물 부재). [Plan-seam]은 task 0건이면 비활성.`
**변경**: 끝에 ` **[Plan-decision]은 task 0건이어도 활성**(원장은 task와 무관한 상류 산출물이다).` 추가.

**기존** (49행): `- 혼합 마일스톤은 **feature 단위로** mode 적용. task가 1건+면 11차원.`
**변경**: `11차원` → `12차원`

### (f) 카운트 표

`| Plan-seam | 0 | 0 | 0 |` **다음**에 `| Plan-decision | 0 | 0 | 0 |` 추가.

### (g) 판정 규칙에 봉인 차단 태깅 추가

`- **ALL_GOOD** — P0 finding 0개. …` 줄 **다음**에 삽입:
```markdown
- **봉인 차단 태깅 (ADR-060 D8)**: **모든 P0 finding**과, 아래 카테고리의 **P1 finding**에 줄 끝 ` [seal-blocking]`을 덧붙인다 — `[Plan-decision]`·`[Plan-ambiguity]`·`[Plan-design]`·`[Plan-seam]`·`[MP-FAC-quality]`·`[MP-feature-scope]`·`[MP-graduation]`·`[MP-feature-dep]`. 그 외 P1(`[Plan-sizing]`·`[Plan-arch]`·`[Plan-doc-link]`)과 모든 P2에는 붙이지 않는다. 이 태그가 남아 있으면 `/seal-milestone`이 봉인을 거부한다.
```

### (h) 가드에 원장 추가

**기존**: `- IMPROVEMENT_GUIDE / QA_FINDINGS / report 디렉터리 등 다른 산출물 위치 수정 금지.`
**변경**: `- IMPROVEMENT_GUIDE / QA_FINDINGS / report 디렉터리 / **DECISION_REGISTER.md** 등 다른 산출물 위치 수정 금지 (원장은 읽기만 — 등재·수정은 \`/repair-plan\` 이하 소유 skill 담당).`

### (i) `[Plan-dep]` 차원의 승격 주체 정정

**기존** (57행 중): `세 위반 모두 **P0**(실행 가능한 계획 미완 — plan-workitem 성공·task \`ready\` 승격 차단과 정합)`
**변경**: `세 위반 모두 **P0**(실행 가능한 계획 미완 — plan-workitem 성공 차단 및 \`/seal-milestone\` 봉인 조건 5와 정합 — ADR-060 D7)`

## 7.2 reviewer.md 미러 동기 (4곳 + 차원 추가)

**파일**: `.claude/agents/reviewer.md`

| 행 | 기존 | 변경 |
|----|------|------|
| 62 | `` - `plan`: Plan Quality 11 (아래 별도 섹션). … `` | `11` → `12` |
| 66 | `## Plan Quality 11 차원 (plan surface 전용 — ADR-038 + ADR-027#amend-1 + ADR-057)` | `11 차원` → `12 차원`, 끝에 ` + ADR-060` 추가 |
| 87 | `- **milestone-mode 게이팅**: 하위 task가 0건이면 위 11차원 중 …` | `11차원` → `12차원`. 문장 끝에 ` [Plan-decision]은 task 0건이어도 활성이다.` 추가 |
| 92 | `(혼합 마일스톤은 feature 단위로 mode 적용. task 1건+면 Plan Quality 11 차원.)` | `11 차원` → `12 차원` |
| **75** | `[Plan-dep]` … `세 위반 모두 **P0**(실행 가능한 계획 미완 — plan-workitem 성공·task \`ready\` 승격 차단과 정합).` | 7.1(i)와 **동일하게** `plan-workitem 성공 차단 및 \`/seal-milestone\` 봉인 조건 5와 정합 — ADR-060 D7`로 교체 (미러 drift 방지) |

그리고 `[Plan-seam]` 차원 설명 **바로 다음**에 7.1(c)의 `[Plan-decision]` 항목을 **동일 문구로** 추가한다(미러 관계 — 문구가 어긋나면 drift).

## 7.3 repair-plan — 봉인 경계 + 미결정 마감

### (a) 입구에 봉인 확인 추가 ← 핵심 (봉인 우회 차단)

`2-L` 문단 **바로 앞**에 삽입:
```markdown
2-S. **봉인 확인 (ADR-060 D6/D7 — 2-L보다 먼저)**: 부모 `M<N>` 문서의 `## 0. Status`와 `## 10. 봉인 기록`을 읽는다.
   - **`contract-ready`(= 미봉인)**: 정상 진입. 아래 2-L 이후 절차를 그대로 수행하고, 4-M/4-D의 계약 수정·원장 쓰기 권한도 이 상태에서만 유효하다.
   - **`ready` + `- 봉인일:` 채워짐 + `in-progress`/`done` task 0건** (= 봉인은 됐으나 구현 미착수): **task·매핑·의존성 결함은 그 자리에서 수정한다.** 잠금의 실익은 *구현 중 계획이 흔들리지 않는 것*인데 구현이 0건이면 그 목적이 걸리지 않는다(ADR-057#amend-3도 "구현이 시작되면 task 계획도 변경하지 않는다"로 *구현 시작*을 기준선으로 삼는다). 수정 후 **`/seal-milestone M<N>` 재실행**을 안내해 receipt를 갱신한다. M/F 계약 층 결함은 여전히 고치지 않고 보고만 한다(다음 M).
     > 이 분기가 없으면 봉인 직후 발견된 계획 결함을 **어떤 skill도 고칠 수 없다** — `repair-workitem` 2-G가 `ready` task repair를 거부하기 때문이다. 그러면 "첫 구현 전 결함을 다음 M으로 보낸다"는, 이 개선이 없애려던 원래 역설이 한 칸 뒤로 옮겨 재현된다.
   - **`ready` + `- 봉인일:` 채워짐 + `in-progress`/`done` task 1건 이상** (= 구현 시작됨): **계획을 수정하지 않는다.** 회수한 review 파일의 finding을 (i) 사용자에게 보고하고 (ii) **5-D 형식으로 영속**한 뒤(task scope → 해당 task `## 8`, feature/milestone scope → `IMPROVEMENT_GUIDE ## 5. Repair decision log`; 결정 성격이면 원장에 `status: open` + `- 발견: 봉인 후 (M<N>)`) (iii) **review 파일을 삭제**한다. 라우팅은 (a) 기존 task·AC 약속의 결함이면 `/repair-workitem`, (b) 새 범위면 다음 마일스톤(M<N+1>) 후보로 안내.
     > **파일을 반드시 삭제하는 이유**: `/implement-workitem` 착수 게이트 ⑤가 "미해결 review 파일 없음"을 요구한다. 보존하면 봉인 후 `/validate-plan`을 한 번 돌린 것만으로 그 마일스톤의 모든 task가 영구 차단되고, 수동 `rm` 외에 해제 수단이 없다. finding은 위 (ii)로 영속되므로 삭제해도 유실되지 않는다.
   - **`ready`인데 `## 10` 부재·미채움**: 마이그레이션 대상이다(ADR-060 D12). 계획을 수정하지 않고 `/seal-milestone M<N>` 실행을 안내한 뒤 종료한다. review 파일은 보존한다(seal이 조건 8에서 읽는다).
   - `draft`: `/plan-milestone M<N>` 안내 후 종료.
```

### (b) 4-M 문단 교체

**기존**: `4-M. **M/F/prototype 계약 자체 P0 (ADR-057#amend-3 결정 6)**: …` 문단 전체.
**변경**:
```markdown
4-M. **M/F/prototype 계약 자체 P0 — 봉인 여부로 갈린다 (ADR-060 D6)**: finding이 task·매핑·의존성 결함이 아니라 milestone/feature/prototype *계약 자체*의 근본 결함이면 2-S 판정을 따른다.
   - **`contract-ready`**: 계획이 잠기지 않았으므로 **본 skill이 milestone/feature 문서를 그 자리에서 고친다.** 프로토타입 재승인이 필요한 수정(화면 구성·PX 변경)은 직접 고치지 말고 `/plan-milestone M<N>` 재개를 안내한다(R5 승인 루프가 소유). 수정 후 부모 M 전체 재대조를 다시 통과시키고, **의미가 바뀐 feature 문서에 `- 계약 수정: <YYYY-MM-DD> — 이 feature의 task 재검증 필요` 마커를 남긴다**(ADR-060 D6 stale task 방지 — plan-workitem이 이 마커를 보고 재검증한다). **이것이 본 개선의 요점이다** — 첫 구현 전에 발견한 상위 결함을 다음 마일스톤으로 미루지 않는다.
   - **`ready`(봉인 완료)**: 2-S대로 보고만 한다.
   - **정본 문서(Charter / ARCHITECTURE / DESIGN)는 본 skill이 고치지 않는다** — 저작 소유가 각 bootstrap skill이다(ADR-005 / ADR-058). 변경이 필요하면 `/bootstrap-project --apply`·`/bootstrap-stack`·`/bootstrap-design --update`를 텍스트로 권장하고 원장에 항목을 남긴다.
```

### (c) 미결정 마감 절 신설

`4-M` **바로 다음**에 삽입:
```markdown
4-D. **리뷰가 드러낸 미결정 마감 (ADR-060 D1~D4)**: 리뷰 finding이 *결함*이 아니라 **아직 정해지지 않은 사항**(해석 분기·미확정 정책·누락 결정)을 드러내면, 임의로 확정하지 말고:
   1. `docs/10-charter/DECISION_REGISTER.md`에 등재하고 `authority`를 확정한다(D2). **`user-*` 급만 등재한다** — 품질·형식 지적은 기존 4-판정으로 처리한다.
   2. `authority: user-*`면 **Decision Brief 6블록**으로 제시한다(D3 — 라운드당 3~5개). `agent-delegated`면 확정하고 라운드 끝 일괄 확인에 포함한다.
   3. 사용자가 선택하면 `status: closed` + `disposition: chosen` + 정본 앵커를 채우고, **본 skill이 소유한 문서**(milestone / feature / task)를 그에 맞게 수정한다. 정본(Charter/ARCH/DESIGN) 수정이 필요하면 4-M 마지막 불릿대로 소유 skill을 권장한다.
   4. 사용자가 미루면 **현재 M 무영향 근거 + 이관 앵커 + 회수 시점** 3개를 받아 `deferred`로 둔다. 3개를 못 채우면 `open`으로 남기고, 그러면 `/seal-milestone`이 봉인을 거부한다는 사실을 함께 안내한다.
   5. 원장 수정은 본 skill의 **허용 예외**다(아래 책임 경계). **단 2-S가 `contract-ready`로 판정한 경우에만** 수행한다.
```

### (d) review 파일 삭제 사전조건 (iii) 교체

> **인용 주의**: 실제 64행은 세 항목이 하나의 bold로 묶여 있다 — `**(i) 모든 finding 4-판정·반영 완료, (ii) 부모 M 전체 self-check + [Plan-dep] 성공, (iii) 미해결 열린 질문 0건**일 때만 삭제한다`. bold 안의 `(iii)` **구절만** 갈아끼우고 bold 경계는 건드리지 않는다.

**기존** (bold 안 `(iii)` 구절): `(iii) 미해결 열린 질문 0건`
**변경**: `(iii) \`DECISION_REGISTER.md\`에서 이 M/F를 \`영향:\`으로 갖는 \`status: open\` 0건(그 M을 가리키는 \`- 발견: 봉인 후 (M<N>)\` 항목 제외 — ADR-060 D1)`

### (e) `2-L` 문구 정정 — 봉인 후 `ready` 허용 제거

**기존** (23행 `2-L` 중): `부모 M의 task 상태가 하나라도 \`draft|ready\` 밖(…)이면 …`
**변경**: 같은 문장 **뒤에 한 문장 추가** — `단 2-S가 봉인 완료 + 구현 시작(\`in-progress\`/\`done\` 1건 이상)으로 판정했으면 전 task가 \`ready\`여도 계획을 수정하지 않는다(그 경우 \`ready\`는 "구현 전"이 아니라 "잠김"이다 — ADR-060 D6/D7).`

### (f) step 5 문구 정정 — 수정 허용 구간 명시

**기존** (38행 중): `**구현 전에는 review의 task·매핑·의존성 결함을 현재 \`ready\` 문서에서 직접 수정**하고, …`
**변경**: `**M이 \`contract-ready\`이거나, 봉인됐어도 구현이 0건인 동안에는 review의 task·매핑·의존성 결함을 문서에서 직접 수정**하고, … (구현이 시작된 뒤에는 2-S대로 수정하지 않는다 — ADR-060 D6/D7).`

> (e)(f)를 안 고치면 같은 파일 안에 2-S와 정면 충돌하는 지시가 남는다.

### (g) 다음 권장 액션 정정 (85행)

**기존**: `- 다음 권장 액션: 보통 \`/implement-workitem <task-id>\`. 대규모 변경이면 \`/validate-plan\` 재실행 권장.`
**변경**: `- 다음 권장 액션: **\`/seal-milestone M<N>\`** — 봉인 전이면 봉인이 먼저다(착수 게이트 ④가 receipt를 요구 — ADR-060 D7). 이미 봉인된 M을 구현 전 수정한 경우에도 \`/seal-milestone M<N>\` 재실행으로 receipt를 갱신한다. 대규모 변경이면 \`/validate-plan\` 재실행 권장.`

### (h) 책임 경계 교체

**기존**:
```markdown
- workitem 문서 *외* 다른 산출물(QA_FINDINGS / report / IMPROVEMENT_GUIDE / ADR 등) 수정 금지. **예외**: feature/milestone scope의 위 5-D 영속화 — `docs/40-validation/IMPROVEMENT_GUIDE.md`의 `## 5. Repair decision log` sub-section append만 허용 (다른 섹션 / 다른 산출물은 여전히 금지).
```
**변경**:
```markdown
- workitem 문서 *외* 다른 산출물(QA_FINDINGS / report / ADR / **Charter·ARCHITECTURE·DESIGN** 등) 수정 금지. **예외 2가지**: (1) feature/milestone scope의 위 5-D 영속화 — `IMPROVEMENT_GUIDE.md`의 `## 5. Repair decision log` sub-section append. (2) 위 4-D의 `docs/10-charter/DECISION_REGISTER.md` 등재·상태 갱신 — **2-S가 `contract-ready`로 판정한 경우에만**. 정본 3종은 저작 소유가 각 bootstrap skill이므로 본 skill이 고치지 않고 권장만 한다(ADR-005).
```

## 7.4 implement-workitem — 착수 게이트 갱신

### (a) 게이트 ④·⑥ 교체

**기존** (3-G 게이트 22행 중):
```
④ 부모 milestone·feature 문서 상태 모두 `ready`, ⑤ `docs/40-validation/plan-reviews/`에 해당 M 또는 산하 F/T의 미해결 review 파일 없음, ⑥ milestone `## 7`·산하 feature `## 12`의 미해결 열린 질문 0건,
```
**변경**:
```
④ 부모 milestone·feature 문서 상태 모두 `ready` **이고 부모 milestone `## 10. 봉인 기록`에 `- 봉인일:`이 채워져 있음**(= `/seal-milestone` 봉인 완료. `contract-ready`이거나 `## 10`이 미채움이면 `/seal-milestone M<N>` 안내 후 종료 — ADR-060 D7/D12. 섹션 *존재*가 아니라 `- 봉인일:` *채움*을 본다 — `## 10`은 템플릿에 빈 채로 들어 있다), ⑤ `docs/40-validation/plan-reviews/`에 해당 M 또는 산하 F/T의 미해결 review 파일 없음, ⑥ (게이트 아님 — 참고) 봉인 시점의 원장 상태가 `## 10` receipt에 남아 있다(정상 봉인이면 `open 0건`, `(마이그레이션 — 소급 검사 없음)` 라벨이면 미검사). **봉인 후 새로 등재된 항목(`- 발견: 봉인 후 (M<N>)`)은 착수를 막지 않는다** — ADR-057#amend-3 결정 6 라우팅으로 처리한다(ADR-060 D11),
```

> 같은 문단 첫 줄이 **"아래 ①~⑧을 모두 확인한다"**인데 ⑥이 게이트가 아니게 됐으므로, **"아래 ①~⑧을 확인한다(⑥은 게이트가 아니라 참고 항목)"**로 바꾼다("모두"를 빼고 괄호를 더한다).

### (b) AC 해석 모호성 경로의 봉인 후 분기 추가

**기존** (41행 중): `(a) 그 M의 모든 task 상태가 아직 \`draft|ready\`이면 \`/validate-plan M<N>\` → \`/repair-plan M<N>\`으로 M 전체 task 계획을 검증·수정하도록 안내한다.`
**변경**: `(a) 그 M이 아직 봉인 전(\`contract-ready\`)이면 \`/validate-plan M<N>\` → \`/repair-plan M<N>\`으로 M 전체 task 계획을 검증·수정하도록 안내한다. **봉인 후(\`ready\` + receipt)라면 두 skill이 계획을 고치지 않으므로**(ADR-060 D6/D7) 해석안 1~3개와 영향만 사용자에게 보고하고, 사용자가 고른 해석을 task \`## 8. 메모\`에 \`해석 확정:\`으로 기록한 뒤 같은 \`/implement-workitem\`을 재실행한다(계획 변경이 아니라 잠긴 AC의 해석 확정 — ADR-057#amend-3 결정 5 정합).`

## 7.5 stack-guard — 후속 안내 정정

**기존** (132행):
```
- 후속 권장 단계 (`/plan-milestone` — M/F가 아직 없으면(ADR-057); 확정된 `ready` M에 task 0건/`draft`가 있으면 `/plan-workitem M<N>`; 이미 구현 중이면 `/implement-workitem` 또는 다음 M)
```
**변경**:
```
- 후속 권장 단계 (`/plan-milestone` — M/F가 아직 없으면(ADR-057); `contract-ready` M에 task 0건/`draft`가 있으면 `/plan-workitem M<N>` → `/seal-milestone M<N>`(ADR-060); 이미 봉인·구현 중이면 `/implement-workitem` 또는 다음 M)
```

## 7.6 봉인 후 원장 writer 배선 (D11 — 배선 없으면 죽은 계약)

> ADR-060 D11은 봉인 후 새 결정의 쓰기 주체를 `/repair-workitem`·`/stabilize-milestone`으로 지정한다. 두 skill 본문에 배선하지 않으면 아무도 등재하지 않아 D11이 소비자 없는 계약이 된다(이 개선이 고치려는 dead field 패턴과 동형).

### (a) repair-workitem

**파일**: `.claude/skills/repair-workitem/SKILL.md` — `책임 경계` 또는 마지막 출력 절 **바로 앞**에 삽입:

```markdown
## 봉인 후 새 결정 등재 (ADR-060 D11)
수정 중 *기존 task·AC가 약속하지 않은* 기획 결정이 새로 드러나면(사용자가 정하거나 승인해야 할 것), 임의로 확정하지 말고 `docs/10-charter/DECISION_REGISTER.md`에 `status: open` + `- 발견: 봉인 후 (M<N>)` 줄로 등재하고 사용자에게 보고한다. **이 등재는 착수·구현을 막지 않는다** — 라우팅은 (a) 기존 약속 결함이면 본 skill이 계속 수정, (b) 새 범위면 다음 마일스톤 후보, (c) 불명확하면 사용자 결정 대기(ADR-057#amend-3 결정 6). 원장 파일이 없으면 등재를 건너뛰고 보고만 한다.
```

### (b) stabilize-milestone

**파일**: `.claude/skills/stabilize-milestone/SKILL.md` — 새 범위 발견을 다루는 절(단계 6~8 부근) **뒤**에 삽입:

```markdown
**봉인 후 새 결정 등재 (ADR-060 D11)**: 마일스톤 점검에서 *기획 결정*(사용자가 정하거나 승인해야 할 것)이 드러나면 `docs/10-charter/DECISION_REGISTER.md`에 `status: open` + `- 발견: 봉인 후 (M<N>)` 줄로 등재한다. QA_FINDINGS/IMPROVEMENT_GUIDE는 *결함·개선*을 담고 원장은 *결정*을 담는다(둘 다 해당하면 양쪽에 각자 형식으로). 본 skill의 read-only 계약은 불변 — 원장 등재는 기존 QA_FINDINGS 기록과 동일한 정상 책임 범위다. 원장 파일이 없으면 등재를 건너뛰고 보고만 한다.
```

### (c) stabilize 다음 단계 안내에 seal 추가

**기존** (223행 부근): `- 기본 권장: \`/plan-milestone\` — 새 milestone(M-(N+1)) + feature 문서 생성. 확정 뒤 \`/plan-workitem M-(N+1)\`로 전체 계획 스냅샷 1회 수행(ADR-057#amend-3)`
**변경**: `- 기본 권장: \`/plan-milestone\` — 새 milestone(M-(N+1)) + feature 문서 생성 → \`contract-ready\`. 뒤이어 \`/plan-workitem M-(N+1)\`(전체 계획 스냅샷, task는 \`draft\`) → **\`/seal-milestone M-(N+1)\`**(검사·승인·일괄 \`ready\`) 순으로 진행(ADR-057#amend-3 / ADR-060 D7)`

```
git add .claude/skills/validate-plan/SKILL.md .claude/agents/reviewer.md .claude/skills/repair-plan/SKILL.md .claude/skills/implement-workitem/SKILL.md .claude/skills/stack-guard/SKILL.md .claude/skills/repair-workitem/SKILL.md .claude/skills/stabilize-milestone/SKILL.md
```

**커밋 메시지**: `feat(skills): close review-found decisions before seal and gate implement on the seal receipt`

---

# Phase 8 — 메타 문서

## 8.1 WORKFLOW.md

### (a) 기본 원칙 문장 교체 ← 핵심

**기존** (67행): `- 애매한 사항은 문서에 가정과 열린 질문으로 남긴다.`
**변경**:
```markdown
- 애매한 사항은 **그 단계에서 닫는다**. 지금 닫을 수 없으면 `docs/10-charter/DECISION_REGISTER.md`에 등재하고, 현재 마일스톤 무영향 근거·이관 앵커·회수 시점 3개를 갖춘 `deferred`로 전환한다. **앵커 없는 유예는 허용하지 않는다** (ADR-060 D1/D4).
```

### (b) 2절의 `ready` → `contract-ready` 정정

**기존** (11행 중): `확정된 \`ready\` M에 task 0건/\`draft\`가 있으면 \`/plan-workitem M<N>\``
**변경**: `\`contract-ready\` M에 task 0건/\`draft\`가 있으면 \`/plan-workitem M<N>\` → \`/seal-milestone M<N>\`(ADR-060)`

### (c) 3절 분해 문장 보강

**기존** (20행): `- task 분해는 \`/plan-workitem M<N>\` 1회 **전체 계획 스냅샷**으로 전 feature를 함께 확정한다(ADR-057#amend-3).`
**변경**:
```markdown
- task 분해는 `/plan-workitem M<N>` 1회 **전체 계획 스냅샷**으로 전 feature를 함께 확정한다(ADR-057#amend-3). task는 전부 `draft`로 남으며, **`/seal-milestone M<N>`이 최종 검사 + 사용자 승인 후 task→feature→milestone을 일괄 `ready`로 봉인**한다(ADR-060 D7). 봉인 전에는 `/implement-workitem`이 착수하지 않는다.
```

### (d) `## 3-1. 마일스톤 봉인` 절 신설 (위치 주의)

봉인은 **분해 후·구현 전**이므로 `## 4. 구현 및 검증` **바로 앞**에 삽입한다(`## 4-1` 앞이 아니다 — 시간 순서 역전 방지).

```markdown
## 3-1. 마일스톤 봉인 (seal)
- `/seal-milestone M<N>`이 최종 검사(계획 완결성·AC 해석 확정·커버리지·의존성·결정 원장·가설·리뷰 증거)와 사용자 최종 승인을 거쳐 task→feature→milestone을 일괄 `ready`로 전환한다.
- **내용 수정·커밋을 하지 않는다.** 실패 시 어떤 상태도 바꾸지 않고 소유 skill로 반환한다. 중단 시 재실행이 부분 승격 상태를 재개 진입으로 인식한다.
- 봉인 시점에 **현재 마일스톤에 영향을 주는 `open` 결정이 0건**이어야 한다 — 이것이 "개발 중 기획이 애매하지 않게" 만드는 지점이다.
- 봉인 후 새로 드러난 결정은 원장에 기록하되 **착수를 막지 않고** 기존 finding 라우팅(repair / 사용자 보고 / 다음 M)을 탄다 (ADR-060 D11).
```

### (e) 라이프사이클 다이어그램 교체

**기존** 코드펜스를 아래로 교체:
```
discover → bootstrap → plan-milestone(+UI: 프로토타입 라운드) → [M/F = contract-ready]
   → plan-workitem (task 전부 draft)
   → (opt-in, ADR-038) validate-plan (별 세션) → repair-plan (원본 세션)
   → seal-milestone (검사 + 사용자 승인 + task→feature→milestone 일괄 ready)   ← 리뷰 유무와 무관하게 항상 거친다
   → implement → validate ─┬─Pass─→ finalize → stabilize(+UI: 경험 게이트)
                           └─Needs Fix─→ repair → (validate 재실행)
(opt-in, ADR-054) stabilize → validate-milestone (별 세션) → repair-milestone (원본 세션)
```

### (f) 문서 상태 전이 블록 교체

**기존** 코드펜스를 아래로 교체:
```
M / F  : draft → contract-ready → ready          (ready 부여는 /seal-milestone 단독 — ADR-060 D6/D7)
task   : draft → ready → in-progress → done      (ready 부여는 /seal-milestone 단독)
                              ↓↑
                           blocked
done → in-progress (검증된 완료 결함을 repair-workitem이 재개방할 때만 — ADR-057#amend-3 결정 5)
done → deprecated (필요 시)
```

### (g) 상태 전이 표 — 기존 행 **교체** (추가 아님)

**기존 행**:
```
| draft → ready | 필수 섹션이 채워졌고, 자기 검증 또는 리뷰를 거쳤다 |
```
**이 한 행을 삭제하고** 아래 두 행으로 대체한다:
```
| (M/F) draft → contract-ready | plan-milestone 라운드 완료 + 확정 재대조 통과 + 원장의 이 M 영향 및 `(미할당)` `open` 0건. **잠금 아님** — task 분해 중 계약 수정 가능 |
| (M/F/task) → ready | `/seal-milestone`이 봉인 조건 전부 통과 + 사용자 명시 승인. 이 시점부터 계획 잠금 |
```

### (h) 2절의 깨진 상대경로 정정 (기존 결함, 본 개선과 무관)

> 10행이 AGENTS.md의 링크 줄을 *인용*하는데 markdown 링크로 렌더돼 `docs/00-meta/docs/20-system/DESIGN.md`로 해석된다(존재하지 않음). 인용이므로 **inline code로 감싸** 링크가 아니게 만든다. 이 절을 이미 편집하므로 한계비용이 0이다.

10행 안에서 **아래 조각만** 찾아 바꾼다(줄 전체를 치환하지 않는다).

**기존 조각** (backtick 없이 markdown 링크로 렌더됨):
```
`AGENTS.md`의 [시각 디자인](docs/20-system/DESIGN.md) 링크 줄도
```
**변경 조각** (링크 부분을 inline code로 감싼다):
```
`AGENTS.md`의 `[시각 디자인](docs/20-system/DESIGN.md)` 링크 줄도
```

## 8.2 PROJECT_START_CHECKLIST.md

### (a) 4단계 항목 교체

**기존** (49행):
```markdown
- [ ] bootstrap·plan 후 PROJECT_CHARTER.md / ARCHITECTURE_OVERVIEW.md / M1 / F-NNN의 `## 0. Status`를 `draft → ready`로 전환했다
```
**변경**:
````markdown
- [ ] bootstrap 후 PROJECT_CHARTER.md / ARCHITECTURE_OVERVIEW.md의 `## 0. Status`를 `draft → ready`로 전환했다 (수동 — 이 두 문서에는 상태 writer skill이 없다)
- [ ] M1 / F-NNN은 `/plan-milestone`이 `contract-ready`까지 올렸다 (`ready` 전환은 `/seal-milestone`이 한다 — 수동 전환 금지)
- [ ] `/seal-milestone M1`으로 최종 검사 + 승인 + 일괄 `ready` 봉인을 마쳤다
  ```
  /seal-milestone M1
  ```
````

### (b) 5단계 항목 추가

`## 5. 의사결정 기록` 절 첫 항목 **앞**에 삽입:
```markdown
- [ ] `docs/10-charter/DECISION_REGISTER.md`에 기획 결정이 등재돼 있고, 현재 마일스톤에 영향을 주는 `status: open`이 0건이다 (ADR-060)
- [ ] `deferred` 항목은 전부 현재 M 무영향 근거 + 이관 앵커 + 회수 시점을 갖췄다
```

## 8.3 DELEGATION_STRATEGY.md

### (a) 실행 순서 갱신 (96~101행 부근)

**기존**:
```
3. `/plan-milestone` → (M1 포함) milestone + feature 문서 생성·확정 (+UI: R5 프로토타입 라운드) / `/plan-workitem M<N>` → 마일스톤 전체 계획 스냅샷 1회 (ADR-057#amend-3)
3a. (선택) `/validate-plan <workitem-id>` — 다른 세션·다른 LLM에서 cross-review. 임시 파일 작성 (ADR-038).
3b. (선택) `/repair-plan <workitem-id>` — 원본 plan 세션에서 임시 파일 회수 + 적용 + 삭제 (ADR-038).
4. `/implement-workitem` → task 구현
```
**변경**:
```
3. `/plan-milestone` → (M1 포함) milestone + feature 문서 생성 → **M/F `contract-ready`** (+UI: R5 프로토타입 라운드) / `/plan-workitem M<N>` → 마일스톤 전체 계획 스냅샷 1회, task는 전부 `draft` (ADR-057#amend-3 / ADR-060 D6)
3a. (선택) `/validate-plan <workitem-id>` — 다른 세션·다른 LLM에서 cross-review. 임시 파일 작성 (ADR-038).
3b. (선택) `/repair-plan <workitem-id>` — 원본 plan 세션에서 임시 파일 회수 + 적용 + 삭제. **M이 `contract-ready`면 상위 계약 결함도 이 시점에 수정** (ADR-060 D6).
3c. **`/seal-milestone M<N>`** → 최종 검사 + 사용자 승인 + task→feature→milestone 일괄 `ready` 봉인 (ADR-060 D7). 봉인 전에는 4가 착수하지 않는다.
4. `/implement-workitem` → task 구현
```

### (b) 37행 차원 수 갱신

**기존**: `| … | reviewer (plan surface, Plan Quality 11 차원) | …`
**변경**: `11 차원` → `12 차원`

## 8.3-b README.md 흐름도 정정

### (a) 흐름도 (23행)

**기존**: `  → /plan-milestone (+UI: R5 prototype round) → /plan-workitem M1 (batch)`
**변경**: `  → /plan-milestone (+UI: R5 prototype round) → /plan-workitem M1 (batch) → /seal-milestone M1 (plan lock gate)`

### (b) Step 3 명령 시퀀스 블록 (79~90행) ← **신규 사용자의 첫 경로**

**기존** (코드펜스 안 `# Implement` 앞부분):
```
#   Then back in the origin plan session:
/repair-plan [workitem id]

# Implement
/implement-workitem [task id]
```
**변경**:
```
#   Then back in the origin plan session:
/repair-plan [workitem id]

# Seal — final check + your approval + bulk promotion to ready (ADR-060)
/seal-milestone M1

# Implement (blocked until the milestone is sealed)
/implement-workitem [task id]
```

> **README_ko.md의 대응 블록(78~89행)도 같은 형식으로 함께 고친다.** 이 블록을 안 고치면 README를 그대로 따라 한 신규 사용자가 착수 게이트 ④에서 거부된다.

## 8.4 AGENTS.md

`## 깊은 운영 원칙은 다음 문서를 따른다` 목록의 `[워크플로우 + 문서 상태 전이]` 줄 **바로 다음**에 삽입:
```markdown
- [기획 결정 마감 + 마일스톤 봉인](docs/90-decisions/boilerplate/ADR-060-decision-closure-and-milestone-seal.md) (결정 원장·authority·contract-ready·seal — 열린 질문을 문서에 남기지 않는다)
```
> 삽입 후 `wc -l AGENTS.md`로 **100줄 hard cap**(ADR-011)을 확인한다.

```
git add docs/00-meta/WORKFLOW.md docs/00-meta/PROJECT_START_CHECKLIST.md docs/00-meta/DELEGATION_STRATEGY.md AGENTS.md README.md README_ko.md
```

**커밋 메시지**: `docs(meta): document decision closure and milestone seal across meta docs`

---

# Phase 9 — 자기 검증

> 아래 명령은 **Bash**로 실행한다(Windows에서는 Git Bash / Bash 도구). PowerShell에서는 동작하지 않는다.

## 9.1 폐지된 섹션이 헤딩으로 남아 있지 않은가

```bash
grep -rnE "^## (7|10|11|12)\. 열린 질문" --include="*.md" docs/
```
**기대**: 0건

## 9.2 폐지 섹션을 가리키는 잔존 참조 (점 표기·산문 표기 포함)

```bash
grep -rnE "## 7\.? 열린 질문|## 10\.? 열린 질문|## 11\.? 열린 질문|## 12\.? 열린 질문|미해결 열린 질문|열린 질문이 남으면" \
  --include="*.md" .claude docs AGENTS.md
```
**기대**: 폐지 안내 주석(`— 폐지(결번)`)과 ADR 본문 hit 외 **runtime skill·agent 본문에는 0건**. 허용되는 ADR 본문 hit은 역사 기록(ADR-014·ADR-057)과 **Phase 2가 스스로 넣은 폐지·정합 표기(ADR-035 2건 — 2.6·2.10 / ADR-036 1건 — 2.3-b)**다(ADR-057은 표현에 따라 안 걸릴 수도 있다 — 걸려도 정상). 이 ADR 본문 hit은 고치지 않는다. `열린 질문이 남으면` 패턴이 잡히면 5.2(h)·5.3을 안 한 것이다.
> 참고: `architect.md`·`designer.md`·`AGENTS.md`·`output-checklist.md`의 *"사실/가정/열린 질문을 구분한다"* 류는 **인식론 규율**이지 섹션 지시가 아니므로 존치한다(위 패턴에도 안 걸린다).

## 9.3 승격 주체가 seal 하나인가

```bash
grep -rn "ready.*승격\|승격.*ready" --include="SKILL.md" .claude/skills/plan-workitem .claude/skills/plan-milestone
grep -rn "plan-workitem이 승격\|plan-workitem task ready 승격" --include="*.md" docs/30-workitems/_templates
```
**기대**: plan-workitem에 승격 *수행* 문장 없음(승격 *금지* 문장은 정상). plan-milestone은 `contract-ready`만. 템플릿 2개에 잘못된 승격 주체 0건.

## 9.4 skill 로스터 정합

```bash
ls -d .claude/skills/*/ | wc -l          # 기대: 22
ls -d .agents/skills/*/ | wc -l          # 기대: 17
grep -c "seal-milestone" README.md README_ko.md   # 기대: 각 2 이상
grep -c "22종" docs/00-meta/STRUCTURE.md          # 기대: 1
```

## 9.5 ADR-060 Surfaces 역참조 (preflight 선제 확인)

```bash
for f in docs/10-charter/DECISION_REGISTER.md README.md README_ko.md \
         .agents/skills/seal-milestone/SKILL.md .claude/agents/reviewer.md \
         .claude/agents/architect.md .claude/agents/planner.md \
         .claude/skills/stack-guard/SKILL.md .claude/skills/repair-workitem/SKILL.md \
         .claude/skills/stabilize-milestone/SKILL.md \
         docs/90-decisions/boilerplate/ADR-007-workitem-lifecycle.md \
         docs/90-decisions/boilerplate/ADR-026-plan-workitem-schema.md \
         docs/90-decisions/boilerplate/ADR-036-feature-level-prd.md \
         docs/90-decisions/boilerplate/ADR-037-spec-coverage-audit.md \
         docs/30-workitems/_templates/TASK_TEMPLATE.md docs/00-meta/STRUCTURE.md AGENTS.md; do
  grep -q "ADR-060" "$f" && echo "OK   $f" || echo "MISS $f"
done
```
**기대**: 전부 `OK`. `MISS`가 하나라도 있으면 `stabilize`가 `P1 [Surface-backref]`를 낸다.

> 위 목록은 **역참조를 새로 넣어야 하는 파일**만 추린 것이다. preflight는 `## Surfaces` 전수를 보므로, 아래로 **전수 확인**한다:
> ```bash
> sed -n '/^## Surfaces/,/^## 참고/p' docs/90-decisions/boilerplate/ADR-060-*.md \
>   | grep '^- ' | sed 's/^- //' \
>   | while read -r f; do grep -q "ADR-060" "$f" 2>/dev/null && echo "OK   $f" || echo "MISS $f"; done
> ```

## 9.6 개정 수 정합

```bash
for a in 027:8 057:3 007:6 026:4 036:0 037:3 053:2 046:1 035:3; do
  n=${a%%:*}; e=${a##*:}
  c=$(grep -c "^## Amendment" docs/90-decisions/boilerplate/ADR-$n-*.md)
  [ "$c" = "$e" ] && echo "OK   ADR-$n=$c" || echo "MISS ADR-$n=$c (기대 $e)"
done
```

## 9.7 차원 번호 중복 없음

```bash
grep -nE "^1?[0-9]+\. \*\*\[" .claude/skills/validate-plan/SKILL.md
```
**기대**: 1~16이 중복 없이 오름차순. `12`가 두 번이면 7.1(d) 재번호를 안 한 것.

## 9.8 AGENTS.md 줄 수 + 상태값 정합

```bash
wc -l AGENTS.md                                                        # 기대: 100 이하
grep -rl "contract-ready" --include="*.md" docs .claude AGENTS.md | wc -l   # 기대: 8 이상 (파일 수)
```

> 위 검증에서 실제로 고친 파일만 **명시 add** 한다. 고친 게 없으면 커밋하지 않는다.

**커밋 메시지** (수정이 있었을 때만): `fix: correct decision closure wiring found in self-verification`

---

# Phase 10 — dogfood 시뮬레이션 (필수)

> ADR-017 재실행 트리거 2종("새 ADR 도입 — amendment 포함", "lifecycle 단계 변경")이 모두 발동하므로 **선택이 아니다.**

## 10.0 ADR-017 요건 (이걸 충족해야 gate 통과다)

- **시나리오 고정**: **todo CLI (CRUD + JSON persistence)**. 임의의 "간단한 제품"으로 대체하지 않는다 — calculator류는 lifecycle 결정 포인트를 자극하지 못한다는 것이 ADR-017의 근거다.
- **범위**: **lifecycle 1회 완주** — discover → bootstrap → plan → **seal** → implement → validate → repair → finalize → stabilize. 착수 확인에서 멈추지 않는다.
- **실행 위치**: 별도 fork 디렉터리(`dogfood-todo-cli/`). 본 저장소에는 **결과 기록만** 커밋한다.
- **성공 기준 3개(전부 충족해야 gate 통과)**:
  1. 사용자 개입 ≤ 1회 — **계수법을 이렇게 고정한다**(ADR-017 정의 "skill 산출물에 직접 편집 행위 기준 — 질문 응답 제외"의 본 라운드 적용):
     - **카운트한다**: 사람이 skill 산출물(문서·코드) 파일을 **직접 편집**한 행위 1건 = 1회
     - **카운트하지 않는다**: ① skill 발화 자체(`disable-model-invocation: true` skill은 사용자가 부르는 게 정상 호출 경로다) ② **Decision Brief 응답**(질문 응답) ③ 일괄 확인 응답 ④ `/seal-milestone` 승인 응답 ⑤ 실패 fixture를 만들기 위한 의도적 상태 변조(측정 대상이 아니라 시험 준비다)
     - 이 계수법을 기록에 함께 남긴다 — 명시하지 않으면 회차 간 비교가 불가능하다
  2. 산출물 placeholder 충원율 ≥ 80%
  3. graduation pre-check 미통과 사유 ≤ 2개
- **기록**: `.boilerplate/validation/SIMULATION_RUN.md`에 `## Round N (YYYY-MM-DD, decision-closure todo-cli)` 헤더로 누적.

## 10.1 lifecycle 완주 + 본 개선 특화 관찰

아래 순서로 완주하되, 각 단계에서 괄호 안 항목을 함께 관측해 기록한다.

1. `/discover-product todo CLI (CRUD + JSON persistence)` — Decision Brief가 6블록으로 나오는가, 라운드당 3~5개 상한이 지켜지는가, `user-*`만 등재되고 `agent-delegated`는 일괄 확인으로 처리되는가, **`영향: (미할당)`로 등재되는가**
2. `/bootstrap-project` → `/bootstrap-stack` — todo CLI는 백엔드가 없어 `## 7-3`이 삭제되므로 **`## 7-2` CLI의 `user-approval` 1항목(출력 포맷)이 Decision Brief로 오고, 나머지 3항목(플래그·TTY·Don'ts)이 일괄 확인 1회로 오는가**를 본다. **원장 행 수가 20건을 넘지 않는가**(등재 범위 규칙 작동 — ADR-060 falsifying evaluation 지표)
3. `/plan-milestone` — 종료 시 M/F가 `contract-ready`가 되는가, 원장 `open`이 있으면 전환을 보류하는가, **R1이 `(미할당)` 항목을 전수 triage하는가**
4. `/plan-workitem M1` — task가 전부 `draft`로 남는가, `남은 미결정 사항` 슬롯이 여전히 raw hex·컴포넌트 중복 같은 지적을 담는가(원장으로 새지 않는가)
5. **실패 케이스 A** — 원장에 `open` 1건을 남기고 `/seal-milestone M1` → **BLOCKED + 그 D-NNN 보고**, **어떤 상태도 안 바뀜**
6. **실패 케이스 B** — `deferred`인데 앵커를 비우고 `/seal-milestone M1` → BLOCKED
7. **실패 케이스 C** — 2+ 해석이 가능한 AC에 `해석 확정` 없이 `/seal-milestone M1` → 조건 3-b에서 BLOCKED (이게 없으면 봉인 후 첫 구현이 halt한다)
8. **재개 케이스** — task 일부만 `ready`인 상태를 인위로 만든 뒤 `/seal-milestone M1` 재실행 → **재개 진입으로 인식하고 나머지만 승격**
9. **봉인 우회 케이스** — 봉인 후 `/repair-plan M1` 실행 → 2-S가 `ready`를 감지해 **계획을 고치지 않고 보고만** 하는가
10. 정상 케이스 — 전부 닫고 `/seal-milestone M1` → 승인 후 task→feature→milestone 순 `ready` + `## 10`의 `- 봉인일:` 채워짐
11. `/implement-workitem T-001` → `/validate-workitem` → (필요 시 `/repair-workitem`) → `/finalize-workitem` → `/stabilize-milestone M1` **완주** — 봉인 전이면 착수 거부, 봉인 후엔 착수. **봉인 후 원장에 `open` + `- 발견: 봉인 후 (M1)`을 1건 넣어도 착수가 막히지 않는가**(D11 데드락 방지 확인)

## 10.2 추가 실패 fixture (본 개선 특유의 위험)

> **각 fixture는 독립 상태에서 돌린다** — 앞 fixture의 변조가 뒤 검사를 오염시키지 않도록, fixture 직전 상태를 `git stash`/브랜치/디렉터리 복사 중 하나로 스냅샷하고 fixture 후 되돌린다. 연속 변조로 돌리면 관측이 무의미해진다.

12. **마이그레이션 케이스 A (계획만 됨)** — M을 `ready`로 두고 `- 봉인일:`을 비운 채 task는 전부 `ready`(in-progress/done 0건)로 만든 뒤 `/seal-milestone M1` → **조건 2~8 전수 재검사**하는가. task 0건이면 **receipt를 쓰지 않고** 반환하는가(빈 마일스톤 봉인 금지)
13. **마이그레이션 케이스 B (이미 구현 중)** — 같은 상태에서 task 1개를 `in-progress`로 바꾸고 `/seal-milestone M1` → **grandfather 진입**으로 인식해 조건 2를 적용하지 않고, 사용자 확인 후 `- 봉인일: … (마이그레이션 — 구현 중 착수, 소급 검사 없음)` 라벨로 기록하는가. **그 뒤 `/implement-workitem`이 착수되는가**(P0 교착 해소 확인)
14. **승인 우회 케이스** — 재개 진입에서 **승인을 다시 요구**하는가. 그리고 **이미 `ready`인 문서도 검사에는 포함**되는가(상태 쓰기만 생략)
15. **원장 부재 케이스** — 원장 파일을 지우고 `/seal-milestone M1` → silent skip이 아니라 **사용자 확인 1회**를 요구하고 receipt에 남기는가
16. **`(미할당)` 누출 케이스** — bootstrap에서 등재한 `(미할당)` open을 triage하지 않고 `/seal-milestone M1` → **조건 6에서 BLOCKED**되는가
17. **봉인 후 구현 전 결함 케이스** — 정상 봉인 직후(전 task `ready`, 구현 0건) `/validate-plan M1`로 task 층 P0를 만든 뒤 `/repair-plan M1` → **그 자리에서 수정하고 `/seal-milestone` 재실행을 안내**하는가(dead-end가 아닌가). 이어서 task 1개를 `in-progress`로 바꾼 뒤 같은 절차 → 이번엔 **보고만** 하는가
18. **ALL_GOOD 파일 케이스** — `/validate-plan M1`이 ALL_GOOD 파일을 남긴 상태로 `/seal-milestone M1` → **파일을 삭제하고 통과**하는가. 이어서 `/implement-workitem`이 게이트 ⑤에서 막히지 않는가

## 10.3 (선택) 2차 fixture — D9 부하 측정

todo CLI는 `## 7-2` 1항목뿐이라 **ADR-060 falsifying evaluation 1번 지표(결정 카드 피로)가 측정되지 않는다.** ADR-017 의무는 todo CLI 1회로 충족되므로, 그와 **별개로** 웹 프론트(`## 7-1` 2 + `## 7-3` 3 + `## 7-4` 3 = 8항목) 또는 Flutter(`## 7-5` 6항목) 시나리오에서 `/bootstrap-stack`만 돌려 다음을 측정한다:
- `user-approval` 카드 총 건수와 소요 라운드 수(3~5개/라운드 상한 적용 시)
- 사용자 체감 피로 (주관 1줄)
- 원장 행 수

이 수치가 ADR-060 재조정의 유일한 실측 근거다.

## 10.4 기록

`.boilerplate/validation/SIMULATION_RUN.md`에 `## Round N (YYYY-MM-DD, decision-closure todo-cli)` 헤더로 다음을 기록한다:
- 단계별 마찰점
- **성공 기준 3개 실측값** (사용자 개입 횟수 / placeholder 충원율 / graduation pre-check 미통과 사유 수) + 10.0의 계수법
- **fixture 12~18의 실제 관측 결과**
- **결정 카드 총량**(마일스톤 1개 기준 `user-*` 건수)과 **원장 행 수** — ADR-060 falsifying evaluation의 두 지표(피로 / 원장 20행 초과)
- (10.3을 돌렸으면) 2차 fixture 수치

```
git add .boilerplate/validation/SIMULATION_RUN.md
```

**커밋 메시지**: `docs(validation): record decision closure walkthrough findings`
