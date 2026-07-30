---
name: seal-milestone
description: 마일스톤 계획을 최종 검사하고 사용자 승인을 받아 task/feature/milestone을 일괄 ready로 봉인한다. 내용 수정·커밋은 하지 않는다 (ADR-060).
argument-hint: "<milestone-id>"
disable-model-invocation: true
allowed-tools: Read Glob Grep Edit Bash(rm docs/40-validation/plan-reviews/*.md)
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
| M `ready` + `- 봉인일:` 미채움 + 그 M에 **구현 흔적 task 0건** | **마이그레이션 진입(계획만 된 프로젝트)** — 조건 2~8을 전수 재검사한 뒤 승인을 받고 receipt를 기록한다 |
| M `ready` + `- 봉인일:` 미채움 + 그 M에 **구현 흔적 task 1건 이상** | **grandfather 진입(이미 구현 중)** — 아래 별도 규칙 |
| M `ready` + `- 봉인일:` 채워짐 + 구현 흔적 task **0건** | **재봉인 진입** — 구현 전 계획 수정 후의 재봉인이다. 조건 2~9를 **전수 재검사**하고 사용자 승인을 다시 받아 **receipt를 갱신(덮어쓰기)**한다. 이미 `ready`인 문서는 *상태 쓰기만* 생략한다(재개 진입과 동일) |
| M `ready` + `- 봉인일:` 채워짐 + 구현 흔적 task **1건 이상** | **이미 봉인됨(구현 중)** — 계획이 잠겼다. 아무것도 바꾸지 않고 종료 |
| M `draft` | `/plan-milestone M<N>` 안내 후 종료 |

**재봉인 진입이 필요한 이유**: `/repair-plan` 2-S는 *봉인됐지만 구현이 0건인* M의 task·매핑·의존성 결함을 그 자리에서 고치고 **본 skill 재실행으로 receipt를 갱신하라고 안내**한다(ADR-060 D6 — 잠금의 실질 기준선은 첫 구현 시작). 재실행을 "이미 봉인됨"으로 즉시 종료하면 그 안내가 **막힌 경로**가 되고, 고친 계획이 무검증·무승인 상태로 남는다. 구현이 시작된 뒤에는 계획이 실제로 잠기므로 그때만 no-op으로 종료한다. 바뀐 게 없는 재실행은 그냥 재검사 후 같은 내용의 receipt를 다시 쓰므로 무해하다.

**구현 흔적 task** = `in-progress` · `blocked` · `done` · `deprecated` 중 하나인 task. `blocked`는 `in-progress`에서만, `deprecated`는 `done`에서만 도달하므로(WORKFLOW 상태 전이 표) 이 4종은 모두 *구현이 시작된 뒤*의 상태다. **`in-progress`/`done`만으로 판정하면** `blocked`만 남은 legacy 마일스톤이 마이그레이션 진입으로 분류돼 조건 2에서 차단되고, receipt가 없어 implement도 거부되는 **교착**이 된다(D12가 없애려던 순환과 동형).

**재개 진입에서는 "전부 draft" 요구를 적용하지 않는다** — 이 예외가 없으면 부분 승격 상태가 영구히 갇힌다. **다만 검사 자체는 전 문서에 다시 돌린다** — 이미 `ready`라는 이유로 검사에서 빼면, 중단 이후 오염되거나 바뀐 문서가 무검증으로 봉인된다.

**재개·재봉인·마이그레이션 진입에서도 사용자 승인을 반드시 다시 받는다.** 승인 증거(receipt)는 모든 상태 변경 *뒤에* 기록되므로, 중단된 실행에서는 승인 사실이 어디에도 영속되지 않는다. "앞선 실행이 승인받았을 것"이라고 가정하면 승인 없는 봉인이 성립한다.

**grandfather 진입 — 이미 구현이 시작된 마일스톤 (ADR-060 D12):**
이 보일러플레이트를 쓰던 프로젝트 중 다수는 M이 `ready`이고 task가 이미 구현 흔적 상태(`in-progress`·`blocked`·`done`·`deprecated`)다. 이 상태에 조건 2("구현 흔적이 있으면 중단")를 적용하면 **seal도 못 하고 implement도 못 하는 순환 교착**이 된다(implement 게이트 ④가 receipt를 요구하므로).
따라서 이 진입에서는:
1. **조건 2를 적용하지 않는다.** 이미 구현이 시작됐으므로 계획 잠금의 실익(구현 전 확정)이 이미 지나갔고, 소급 검사는 무의미하며 진행만 막는다.
2. 조건 6(원장 open)·7(가설)은 **보고만** 하고 차단하지 않는다. 조건 3·4·5는 관측해 receipt에 수치로 남긴다.
3. 사용자에게 **이 마일스톤은 봉인 도입 전에 착수됐고 소급 검사를 하지 않는다**는 사실을 알리고 명시 확인 1회를 받는다.
4. receipt의 첫 줄을 `- 봉인일: <YYYY-MM-DD> (마이그레이션 — 구현 중 착수, 소급 검사 없음)`로 기록한다. **진짜 봉인과 라벨로 구분된다** — 이 라벨이 없으면 사후에 "봉인된 계획"으로 오독된다.
4-b. **receipt의 `Register:` 줄은 실측값으로 쓴다** — 이 진입에서는 조건 6이 보고만 하므로 `open`이 0이 아닐 수 있다. 정상 봉인용 `open 0건` 문구를 그대로 쓰지 말고 `- Register: closed <N>건 / deferred <M>건 / open <K>건 (보고만 — 소급 검사 없음)`으로 기록한다. 0을 적으면 receipt가 검증되지 않은 사실을 검증된 것처럼 주장한다.
5. 이후 마일스톤(M<N+1>)부터는 정상 경로를 탄다.

## 봉인 조건 (하나라도 불충족이면 중단)

순서대로 검사하고, 실패한 첫 항목에서 멈춰 **어느 조건이 왜 막았는지 + 어느 skill로 가야 하는지**를 보고한다.

1. **상태** — 0단계 판정 결과가 **정상 / 재개 / 재봉인 / 마이그레이션 / grandfather** 중 하나일 것(`draft` M과 이미 봉인됨(구현 중) M은 0단계에서 이미 종료됐다).
2. **task 존재·상태** — 마일스톤 `## 3`의 모든 feature가 task를 1개 이상 갖고, *아직 승격되지 않은* task가 전부 `draft`. `in-progress`·`blocked`·`done`·`deprecated`가 있으면 중단(구현이 시작된 흔적). **단 0단계가 grandfather 진입으로 판정했으면 본 조건을 적용하지 않는다**(그 분기의 규칙 1).
3. **task 필수 섹션 완결** — 각 task의 `## 3. 구현 항목`(단계별 가이드), `## 6. Acceptance Criteria`(1개 이상)이 채워졌는가. `## 9. 의존성`은 **섹션이 존재하는지만 본다 — 빈 값은 "선행 의존 없음"이라는 정상 선언이다**(TASK_TEMPLATE `## 9` 정의 / plan-workitem "의존성이 없는 task는 비워둔다"). 빈 값을 미완으로 보면 선행이 없는 첫 task 때문에 모든 마일스톤이 봉인 불가가 된다. 참조가 *적혀 있을 때*의 정합성은 조건 5가 본다. angle-bracket placeholder(`<runner>` 등)만 남은 칸은 미완으로 본다.
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
     - `ALL_GOOD` + P0 0건 + 차단 태그 0건이면 → **통과 판정 후 그 파일을 삭제**한다(리뷰를 돌렸고 문제가 없었던 정상 경우 — `validate-plan`은 ALL_GOOD에도 파일을 만들고 `repair-plan`은 고칠 게 없으면 실행되지 않으므로 파일이 남는 게 정상이다). 삭제 경로를 출력에 echo하고 receipt에 `executed: yes`로 기록한다. **`independence`는 파일에서 알 수 없다**(review 파일 스키마에 `리뷰어 태그`는 있어도 세션 분리 정보는 없다) — 추론하지 말고 이 분기에서도 사용자에게 1회만 묻는다: "그 리뷰는 별도 세션이었습니까? (별도 세션 / 같은 세션)". 답을 그대로 receipt에 적는다.
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
