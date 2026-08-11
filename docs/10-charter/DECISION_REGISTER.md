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
| — | **마일스톤 미배정 기능 후보**(방향 변경·새 기능 — 수용 라운드의 «계약 변경» 포함) — `docs/30-workitems/ROADMAP.md` `## Backlog`가 소유 |

원장은 **기획 결정**의 인덱스다. 결함 추적기가 아니고 **기능 백로그도 아니다.**

**판별자**: 「이 항목이 해소되면 무엇이 남는가」 — *정본 문서(charter/ARCH/DESIGN/ADR/feature)의 한 절이 채워진다* → 본 원장 / *마일스톤 문서 하나가 생긴다* → `ROADMAP ## Backlog`. 보조 검증으로 **닫힐 때 쓸 `정본:` 앵커가 떠오르지 않으면 본 원장 항목이 아니다**(불변식 2). 원장 5종의 배타적 기록 범위 SSOT는 `docs/00-meta/STRUCTURE.md`의 `## Canonical Owner 매핑`이다(ADR-005#amend-1).

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

쓰기 주체: `/repair-workitem`(task 결함과 함께), `/stabilize-milestone`(발견 기록), `/repair-plan`(봉인 후 리뷰 finding — append만), 사용자 직접 편집.

### 회수 규칙 (ADR-019 정합)

본 파일을 통째로 읽지 않는다. `status:` / `영향: M<N>` **+ `영향: (미할당)`** 색인으로 먼저 걸러 해당 항목만 읽는다(`(미할당)`을 빼면 bootstrap 구간 등재분이 통째로 샌다 — 위 규약 참조).
**색인 히트는 항목이 아니다 — `## 결정 항목` 아래에 있고 헤더의 `D-NNN`이 실제 번호인 것만 항목으로 센다.** 위 설명 섹션의 형식 예시(`D-NNN` placeholder·`open|deferred|closed` 열거)와 규칙 본문의 인용은 같은 토큰을 담지만 미결정이 아니다. 이 구분을 건너뛰면 빈 원장에서도 `open`이 잡혀 봉인이 막힌다.
`closed`·`deferred` 행은 **삭제하지 않는다** — 승인 이력과 다음 마일스톤 회수의 근거다.

## 결정 항목

<!-- 아래에 D-001부터 append한다. 필드·표기 규약은 위 `## 항목 형식` 섹션이 SSOT다.

     이 주석 안에 예시 항목을 두지 않는다. 봉인·triage 검사는 본 파일을 통째로 읽지 않고
     `status:` / `영향:` 토큰을 색인으로 회수하며(위 `### 회수 규칙`), 이 색인은 주석
     여부를 구분하지 못한다 — 주석 안의 예시도 실제 미결정으로 잡혀 마일스톤 봉인을 막는다. -->
