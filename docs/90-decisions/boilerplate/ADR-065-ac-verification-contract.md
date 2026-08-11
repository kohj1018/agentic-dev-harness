# ADR-065 — AC 검증 계약 (AC Verification Contract)

> scope: boilerplate
> area: process

## Status
accepted

## 배경
- [관측됨] 현행 규칙은 AC 충족을 *자동 테스트 존재* 하나로만 판정한다(`## AC ↔ 테스트 매핑`). 그래서 테스트로 확인할 수 없는 AC는 영구 `❌`가 된다 — `Type: research-spike`의 리서치 노트(ADR-039), 스케줄러 발화·배포 후 관측, 모바일 실기기·스토어 확인, 사람 육안 확인이 그 예다.
- [관측됨] 그 결과 4개 지점이 같은 `❌`를 서로 다르게 취급한다. ADR-009는 *"AC 미충족 0개"* 를 통과 조건으로 규정하고 opt-out에 대해서는 *"finalize 시점에 사유를 사용자에게 명시적으로 보여주고 확인"* 만 요구하는데, `/finalize-workitem`은 그것을 **AC 미충족의 예외**로 확대해 통과시키고, `/validate-workitem`은 예외 없이 `Needs Fix`를 내며, `/stabilize-milestone`의 졸업 item 4는 예외가 없어 마일스톤을 영구 차단한다.
- [관측됨] 그래서 정당한 TDD opt-out task는 `validate(Needs Fix) → repair(고칠 것 없음) → 재validate(같은 Needs Fix)` 순환에 들어가고, 근거 없는 finalize 예외만이 탈출구다. 그 뒤 마일스톤은 졸업하지 못한다.
- [관측됨] ADR-064 D1은 등급 2 receipt의 허용 형태 ⑤로 *사용자 waiver* 를 열거하고 `/validate-workitem`은 *"사용자 waiver로 기록된 줄은 충족으로 보고"* 한다. 실행 증거 축은 기록 등급이라 손해가 제한되지만, 같은 형태를 AC 축에 옮기면 **차단 게이트(졸업 item 4)와 커버리지 %(신뢰도 등급 입력)를 통과하는 위장 경로**가 열린다.

## 결정

### D1. AC 검증 modality 5종
AC 충족은 아래 5종 중 **정확히 하나**의 modality로 증명한다. task `## 6-1`에 AC마다 modality를 표기한다.

| modality | 증명 대상 | 요구 증거 | 발급 주체 |
|---|---|---|---|
| `자동 테스트` | 실행되는 테스트가 그 행동을 단정 | 러너::파일::테스트-id (실제 실행 결과) | 기계 |
| `산출물 검사` | **명령·파서로 재현 가능한** 산출물 사실 | 검사 대상 경로 + **재현 가능한 검사 방법(명령·스키마·파서·grep 패턴)** + 확인 결과 | 기계 |
| `사용자 관측` | 사람이 직접 보고 충족을 판정 | 관측 절차 + 시각 + 환경 + 결과 | **사용자만** |
| `플랫폼 관측` | 외부 플랫폼의 실행·상태로 확인 | 출처 식별자(CI run·배포 로그·스토어 상태) + 첨부한 authority | **사용자만** |
| `미관측` | — | 없음 | — |

- **`산출물 검사`의 범위는 결정적으로 판정 가능한 것까지다** — 파일·경로 존재, 스키마 검증, 필수 헤딩·항목 개수(grep), 명령 exit code, 구조화 파싱 결과. **의미·품질 판정(예: "비교가 충실한가")은 이 modality가 아니다** — 그것은 `사용자 관측`이다. 문법·구조를 이해하지 못하는 검사에 차단력을 주지 않는다는 ADR-063 D6 1문항을 그대로 따른다. 따라서 `Type: research-spike`의 AC는 *구조 사실*(노트 파일 존재 + 필수 섹션 3개 존재)을 `산출물 검사`로, *내용 판단*(권고가 타당한가)을 `사용자 관측`으로 나눠 쓴다.
- **`산출물 검사`의 검사 수단은 통합 `validate` 명령에 묶는다(강).** 그러면 판정이 문자열 읽기가 아니라 **실제 실행의 exit code**가 되어 ADR-063 D6 2문항을 통과하고, 회귀도 기존 게이트가 계속 막는다(ADR-064 D7의 *"구조적 차단이 필요하면 증거를 등급 1로 만든다"* 와 같은 형태). `/validate-workitem`은 그 실행 결과를 읽어 판정하며 **검사 명령을 스스로 실행하지 않는다**(report-only 계약 — 그 skill의 `allowed-tools`에 임의 Bash를 추가하지 않는다).
- **묶을 수 없는 검사는 `산출물 검사`가 아니다** — 그 AC는 `사용자 관측`으로 내린다. 이 규칙이 없으면 grep 한 줄이 차단 게이트의 통과 근거가 되어 D6이 세운 배치 기준이 무너진다.
- **`미관측`은 *authoring 표기*가 아니라 *판정 결과 라벨*이다.** 계획자는 `[미관측]`을 쓰지 않는다(쓸 거리가 없으면 AC를 관측 가능하게 다시 쓴다). 판정자가 `미관측`을 쓰는 경우는 **하나뿐이다 — 표기가 없는데 legacy 판독(`자동 테스트`)으로도 대응 테스트가 없을 때.** **선언된 modality의 증거가 없는 경우는 `미관측`이 아니다** — 그때는 **선언된 modality를 유지한 채 미충족 사유를 적는다**(예: `❌ [사용자 관측] receipt 대기`). modality를 결과 라벨로 덮어쓰면 하류(D6 판정값 산출·`/finalize-workitem` 분기)가 «코드로 고칠 것»과 «사람이 볼 것»을 구분할 근거를 잃는다. **`미관측`은 항상 미충족이며 어떤 게이트도 통과시키지 않는다.**
- **legacy 호환 (표기 부재의 판독)**: **modality 표기가 없는 AC는 `자동 테스트`로 간주한다.** 기존 fork의 모든 task는 표기가 없으므로 이 규칙이 없으면 재검증에서 전 task가 일괄 미충족이 된다(ADR-022 ratchet 위반). 그 AC에 대응 테스트가 없으면 기존과 똑같이 미충족이다 — 즉 **현행 판정과 동일하게 동작한다.** 신규 task는 표기를 필수로 하며, 표기 없는 AC를 만나면 `/validate-workitem`이 `P2 [Modality-missing] AC-N` 을 기록 등급으로 남긴다(차단하지 않는다).
- **`사용자 관측`·`플랫폼 관측` receipt의 발급 시점은 마일스톤 층이다** — 발급 경로는 `/accept-milestone <M>`(마일스톤 수용 라운드 — [ADR-066](ADR-066-milestone-acceptance.md) D1) 또는 사용자 직접 기재다. **이 modality의 미충족은 `/finalize-workitem`을 막지 않는다** — 그 AC만 미충족이면 `/validate-workitem` 판정은 `Pending Acceptance`이고(아래 D6), finalize는 통과시켜 task를 `done`으로 마감한다. 그렇지 않으면 `receipt 없어 finalize 불가 → task done 불가 → stabilize 진입 불가 → 수용 라운드 도달 불가 → 발급 불가`의 교착이 생긴다. 미발급 상태는 **졸업 게이트가 잡는다** — 그 receipt 없이는 [ADR-067](ADR-067-milestone-graduation-v2.md) D1 item 4 (a')를 충족하지 못하므로 마일스톤이 졸업하지 못한다(graduation `PENDING_ACCEPTANCE`). **즉 차단 지점을 task 층에서 마일스톤 층으로 옮긴 것이며, 게이트 자체가 사라진 것이 아니다.**
- **경계 — 커밋·배포 이후에만 관측 가능한 사실은 그 task의 AC로 두지 않는다.** CI 실행·배포 후 동작·실제 스케줄 발화처럼 *커밋이 있어야 비로소 일어나는* 사실은 finalize 전에 관측할 수 없으므로, 그것을 AC로 박으면 어떤 modality로도 충족할 수 없다. 그런 사실은 **후속 verification task의 AC로 분리한다**(계획 단계 규율 — 측정 가능 AC(ADR-026) + 새 범위 라우팅(ADR-057#amend-3 결정 6)). 그 task의 AC는 `플랫폼 관측`이며, 선행 task가 배포된 뒤 실행된다. **`플랫폼 관측` modality가 다루는 것은 «이미 발생한 플랫폼 실행의 결과를 사용자가 확인해 첨부하는 것»이지 «아직 일어나지 않은 일을 기다리는 것»이 아니다.**
- **`--waiver`(ADR-064 D1)는 어느 modality에도 쓰지 않는다.** waiver는 *증거가 없다는 사실을 사용자가 승인*하는 것이고 acceptance는 *관측했고 충족했다는 판정*이다. 둘을 섞으면 "검증하지 못했지만 허용"이 "검증 완료"로 바뀐다.
- **`사용자 관측`·`플랫폼 관측`은 에이전트가 대행 발급하지 않는다** — 사유·결과를 발명하지 않는다(ADR-064 D1 waiver 규정과 동일 근거).

### D2. TDD opt-out의 의미 고정
`## 6-2. TDD opt-out`은 **Red-first 절차(RGR 3 phase)의 면제**이며 **AC 충족의 면제가 아니다**(ADR-009 본문 정합). opt-out task도 AC마다 modality와 증거가 필요하다 — 예: `Type: research-spike`는 D1대로 구조 사실을 `산출물 검사`로, 내용 판단을 `사용자 관측`으로 충족한다.

### D3. receipt 위치와 형식
`사용자 관측`·`플랫폼 관측`의 증거는 task `## 8. 메모`에 아래 형식으로 append한다(ADR-064 D4의 receipt 위치를 그대로 쓴다).

```
- ac-acceptance <날짜> <AC-N>: modality=<사용자 관측|플랫폼 관측> / authority=사용자 / source=<출처 식별자 — 플랫폼 관측일 때만, 예: CI run id·배포 로그 id·스토어 상태> / 환경=<대상·버전> / 절차=<무엇을 했는가 1줄> / 결과=<관측 1줄>
```

- **`authority`와 `source`를 분리하는 이유**: 두 modality 모두 *발급 주체는 사용자*이고(D1), 플랫폼 관측이 추가로 갖는 것은 *출처 식별자*다. 한 칸에 몰면 `authority=CI run 123`처럼 적혀 «사람이 붙였다»는 사실이 사라지고 대행 발급 금지(D1)의 반증 지점이 없어진다. `authority`는 항상 `사용자`다.

미발급 상태를 task 문서에 남기는 줄의 형식도 하나로 고정한다. `/implement-workitem`이 구현 직후에, `/finalize-workitem`이 마감 시점에 각각 append한다(같은 AC에 이미 `- ac-pending` 줄이 있으면 중복 append하지 않는다 — **중복 판정 시 HTML 주석(`<!-- ... -->`) 밖의 줄만 센다.** TASK_TEMPLATE `## 8` 주석에 같은 형식의 예시가 들어 있어, 주석까지 세면 «이미 있다»로 오판해 실제 줄이 **영원히 append되지 않는다** — 본 D3 판독 규칙 및 ADR-064 D4와 동형).

```
- ac-pending <날짜> <AC-N>: modality=<사용자 관측|플랫폼 관측> — 마일스톤 수용 라운드에서 확인 예정
```

- **`- ac-pending`은 증거가 아니라 «아직 증거가 없다»는 표시다.** 어떤 게이트도 통과시키지 않는다. `- ac-acceptance`가 발급되면 그 AC의 마지막 이벤트가 바뀌므로 자동으로 무효가 된다(아래 판독 규칙 2).
- **왜 필요한가**: `/finalize-workitem`은 커밋한다. 미충족 AC를 통과시키고 커밋하는데 그 판단의 흔적이 커밋된 산출물에 없으면 사후 추적이 불가능하다.
- **`/accept-milestone`은 이 줄을 회수 힌트로만 쓴다** — 필수 시나리오의 근거는 `## 6-1`의 modality 표기이며, 이 줄이 없어도 modality가 있으면 대상이다.

무효화 줄의 형식은 하나로 고정한다.

```
- invalidated <날짜> <AC-N>: <무엇을 고쳤는가 — 재확인 필요>
```

- **`- ac-acceptance` 줄의 작성자**는 `/accept-milestone`(사용자 응답을 그대로 기록) 또는 사용자 직접이다. `/validate-workitem`·validator·builder·foreman은 쓰지 않는다. **`- ac-pending` 줄의 작성자는 `/implement-workitem`·`/finalize-workitem`이다**(그 줄은 receipt가 아니라 미발급 표시이므로 대행 발급 금지에 걸리지 않는다). **`- invalidated` 줄의 작성자는 아래 세 repair skill이다.**
- **판독 규칙 1 — 주석 제외**: HTML 주석(`<!-- ... -->`) 밖의 줄만 항목으로 센다(ADR-064 D4 공통 판독 규칙).
- **판독 규칙 2 — 마지막 이벤트가 현재 상태다**: 한 AC에 `- ac-pending`·`- ac-acceptance`·`- invalidated`가 여러 번 나타날 수 있다. **그 AC의 현재 상태는 `## 8` 안에서 문서 순서상 마지막에 나오는 그 AC의 이벤트로 판정한다** — 마지막이 `ac-acceptance`면 충족, `ac-pending`·`invalidated`면 미충족이다(이벤트가 아예 없어도 미충족). 줄을 지우지 않으므로 이력이 보존되고, 재발급 후 다시 무효화되는 왕복도 순서로 표현된다.
- **신선도는 자동 검사하지 않는다** — 고친 주체가 갱신한다(ADR-064 D4 결론 승계). **무효화 writer는 셋이다** — `/repair-workitem`·`/repair-acceptance`·`/repair-milestone`(cross-cutting 직접 수정이 그 AC의 동작 경로를 건드린 경우). 세 skill 중 어느 것이든 그 AC의 코드를 고치면 `- invalidated` 줄을 append하고 재확인 대상으로 남긴다.

### D4. 두 수치 분리
`/validate-workitem` report는 커버리지를 두 수치로 적는다.

- **충족률** = (충족 AC 수) / (전체 AC 수) — 전 modality 합산. **report 독자용 요약 수치이며 졸업 게이트의 직접 입력은 아니다** — 졸업 item 4는 기계 검증 AC를 채점표에서(item 4 (a)), 관측 AC를 task `## 8`에서(item 4 (a')) 각각 읽는다([ADR-067](ADR-067-milestone-graduation-v2.md) D1).
- **자동화율** = (`자동 테스트` + `산출물 검사`로 충족한 AC 수) / (전체 AC 수) — **report 신뢰도(confidence) 등급의 입력이다.**

사람·플랫폼 관측이 많은 마일스톤이 자동으로 High 신뢰도가 되지 않게 하기 위해 두 수치를 나눈다. `VC-N`(ADR-064 D2 positive control)은 두 수치의 분자·분모 어디에도 넣지 않는다.

### D6. `/validate-workitem` 판정값 3종

report `- 판정:` 값은 셋이다. **우선순위는 `Needs Fix` > `Pending Acceptance` > `Pass`이며 먼저 성립하는 값으로 확정한다.**

| 값 | 뜻 | 성립 조건 |
|---|---|---|
| `Needs Fix` | **고칠 것이 있다** | 어느 축이라도 P0 finding이 있거나 / 통합 검증 명령 exit≠0 / **«수정 대상 아님»이 아닌 미충족 AC**가 하나라도 있음 |
| `Pending Acceptance` | **사람이 볼 것만 남았다** | 위가 전부 아니고, `사용자 관측`·`플랫폼 관측` AC의 receipt만 미발급 |
| `Pass` | 전부 충족 | 미충족 AC 0건 |

- **`Pending Acceptance`를 별도 값으로 두는 이유**: 이 상태를 `Needs Fix`로 뭉뚱그리면 `/repair-workitem`으로 라우팅되는데 고칠 코드가 없어 순환에 빠지고(본 ADR 배경이 지목한 그 순환), `Pass`로 뭉뚱그리면 「`Pass`인데 AC 행에 ❌」라는 해명이 필요한 상태가 남는다. **판정값마다 다음 액션이 다르다는 것이 이 enum의 존재 이유다** — `/stabilize-milestone`의 graduation 4종(ADR-067 D3)과 같은 원리이며, 같은 개념이 두 층에서 같은 모양으로 나타난다.
- **하류 소비**: `/finalize-workitem`은 `Pass`·`Pending Acceptance`를 통과시키고 `Needs Fix`를 차단한다. `/repair-workitem`은 `Pass`·`Pending Acceptance`면 finalize를 안내하고 종료한다. 졸업 item 4 (b)는 `Pass` **또는** `Pending Acceptance`를 허용한다(ADR-067 D1).
- **`감사 미완(unavailable)`은 `Pending Acceptance`가 아니다** — 그것은 P0이며 `Needs Fix`를 트리거한다. 고칠 것은 없지만 *판정할 수 없는* 상태이므로 `Pass` 계열을 낼 수 없다(ADR-067 D3와 동일 원리).
- **confidence ladder 정합**: Low 조건의 «미충족 AC 있음»은 **기계 검증 AC 한정**으로 읽는다. 사람·플랫폼 관측 비중은 **자동화율 <70%** 가 이미 잡으므로 이중으로 깎지 않는다.

### D5. ADR-063 D6과의 관계
ADR-063 D6은 *기계적 검사에 차단력을 부여할 수 있는가*를 규율한다. 본 계약에서 차단하는 것은 `미관측`이고, receipt를 읽는 판정은 **사용자 authority가 발급한 acceptance를 읽어 차단을 해제**하는 방향이다. 따라서 D6의 판정 대상이 아니다. 대신 위장 통과는 아래 3중 방어로 막는다.

1. 발급 authority 제한 (에이전트 대행 금지 — D1)
2. 필수 필드 강제 (절차·환경·결과 — 발명하려면 거짓을 써야 한다 — D3)
3. 자동화율 별도 집계 (사람 관측이 많으면 신뢰도가 오르지 않는다 — D4)

## 근거
- 4개 지점의 predicate를 하나로 맞추지 않으면 어느 한 곳을 고쳐도 다른 곳에서 같은 교착이 재발한다. modality는 그 단일 predicate를 만드는 최소 장치다.
- `산출물 검사`를 `자동 테스트`에 합치거나 사람 관측으로 내리지 않는 이유: 기계로 판정 가능한 것을 사람 승인으로 내리면 게이트가 오히려 느슨해진다.
- opt-out을 AC 면제로 쓰지 않는 이유: ADR-009 본문에 그 근거가 없고, 면제로 쓰면 `## 6-2` 두 줄을 채우는 것만으로 AC 게이트가 사라진다.

## Mutation Contract (ADR-047 D3)
1. **Target** — TASK_TEMPLATE `## 6-1`·`## 8`(`- ac-pending` 포함) / plan-workitem modality authoring / implement-workitem·builder.md modality별 RGR 분기 + `- ac-pending` 기록 / validate-workitem AC 매핑 판정·**D6 판정값 3종**·report 양식·confidence 입력 / finalize-workitem 관측 AC 통과 처리 + `- ac-pending` 기록 / repair-workitem·repair-acceptance·repair-milestone receipt 무효화 / accept-milestone receipt 작성(마일스톤 스코프 단독) / stabilize-milestone 졸업 item 4 (a') 판독 / validator.md 판정 규칙 / ADR-009 opt-out 명확화 / ADR-067 졸업 item 4.
2. **Failure mode** — (a) 테스트로 확인 불가한 AC가 영구 `❌`로 남아 마일스톤이 졸업하지 못함 (b) 근거 없는 opt-out 예외가 AC 게이트를 무력화 (c) 사람 관측이 waiver 형태로 기록돼 위장 통과 (d) 사람 관측이 커버리지 %에 섞여 신뢰도 등급이 부풀려짐.
3. **Predicted improvement** — 4개 지점의 판정이 일치하고, `Type: research-spike` task가 완료 가능해지며, report에 충족률·자동화율 두 수치가 남는다.
4. **Preserved invariants** — ADR-009 RGR 3 phase / ADR-064 D2 `VC-N` 집계 제외 및 D4 receipt 위치·판독 규칙 / `/validate-workitem` report-only 계약 / `/stabilize-milestone` read-only 계약 / ADR-063 D6 배치 기준.
5. **Falsifying evaluation** — ADR-017 dogfood 재실행에서 (a) 전 AC가 `자동 테스트`인 일반 task에 표기 부담만 늘고 판정이 달라지지 않거나, (b) **마일스톤 자동화율이 본 계약 도입 전 대비 유의하게 떨어지면**(= `자동 테스트`로 쓸 수 있는 AC가 관측 modality로 새는 신호 — 구 item 4가 유일한 "테스트 존재" 차단 게이트였으므로 이 축을 반드시 관측한다), (c) `사용자 관측`·`플랫폼 관측` receipt가 에이전트 발급으로 관측되거나, (d) legacy 판독(표기 부재=자동 테스트) 때문에 신규 task가 표기를 계속 비워 두면 해당 결정을 재조정한다.
6. **Rollback path** — 본 ADR superseded + `## 6-1` modality 표기 제거 + `## AC ↔ 검증 매핑`을 `## AC ↔ 테스트 매핑`으로 복귀 + finalize opt-out 예외 복원.

## 정책 강도 (ADR-022)
- **제약(강) — [관측됨]**: D1의 `미관측`=미충족, D1의 발급 authority 제한, D1의 `산출물 검사`→통합 `validate` 묶기, D2 opt-out 의미 고정.
- **제약(약)**: D1 post-commit 경계(계획 규율), D3 receipt 형식·작성자·판독 규칙, D4 두 수치 분리.

## 결과
- AC 충족의 증명 수단이 5종으로 명시되고, 그 판정 기준이 plan·validate·finalize·stabilize 네 지점에서 같아진다.
- `사용자 관측`·`플랫폼 관측`의 발급 경로는 둘이다 — [ADR-066](ADR-066-milestone-acceptance.md)의 `/accept-milestone <M>`(stabilize 뒤) 또는 사용자 직접 기재. **그 modality를 쓴 AC가 하나도 없는 마일스톤에서는 수용 라운드가 권장이며 의무가 아니다.** 그 modality를 쓴 AC가 있으면 receipt 없이는 졸업(item 4 (a'))을 통과하지 못하므로 사실상 이 단계를 거치게 된다.

## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT. 실제 파일 경로 1행 1개)
> 등재 기준: 본 ADR의 결정을 **실행하거나 집행하는 파일만** 등재한다. 본 ADR을 배경·역사로 언급만 하는 파일은 등재하지 않는다.
- docs/30-workitems/_templates/TASK_TEMPLATE.md         — D1 `## 6-1` modality 표기 / D3 `## 8` receipt 형식
- .claude/skills/plan-workitem/SKILL.md                 — D1 modality authoring
- .claude/skills/validate-workitem/SKILL.md             — D1·D4 AC 매핑 판정 + report 양식 + confidence 입력
- .claude/skills/finalize-workitem/SKILL.md             — D1·D2 AC 게이트(opt-out 예외 제거)
- .claude/skills/implement-workitem/SKILL.md             — D1 modality별 RGR 대상 분기 + 6-V red 상태
- .claude/agents/builder.md                             — D1 modality별 테스트 작성 범위
- .claude/skills/repair-workitem/SKILL.md               — D3 receipt 무효화
- .claude/skills/repair-acceptance/SKILL.md             — D3 receipt 무효화
- .claude/skills/repair-milestone/SKILL.md              — D3 receipt 무효화 (cross-cutting 수정 시)
- .claude/skills/accept-milestone/SKILL.md              — D3 receipt 작성자 (마일스톤 스코프 단독)
- .claude/agents/validator.md                           — D1·D4 축 1 판정 규칙
- docs/90-decisions/boilerplate/ADR-009-tdd-default.md  — D2 opt-out 의미 명확화
- docs/90-decisions/boilerplate/ADR-067-milestone-graduation-v2.md — D1 modality가 졸업 item 4 (a)/(a') 분기 기준 · D6 판정값이 item 4 (b) 입력
- .claude/skills/stabilize-milestone/SKILL.md           — D1 item 4 (a') 관측 AC receipt 직접 판독
- docs/30-workitems/_templates/MILESTONE_TEMPLATE.md    — D1 관측 modality의 졸업 게이트 위치

## 참고
- ADR-009(TDD — opt-out 범위), ADR-026(측정 가능 AC), ADR-039(workitem Type — research-spike), ADR-057#amend-3 결정 6(새 범위 라우팅), ADR-063 D6(기계적 검사 배치 기준 — D5), ADR-064 D1·D2·D4(waiver·`VC-N`·receipt 위치), ADR-066(수용 단계 — 관측 발급 경로), ADR-067(졸업 item 4 소비처).
