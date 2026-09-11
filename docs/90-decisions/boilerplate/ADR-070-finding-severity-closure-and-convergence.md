# ADR-070 — finding 심각도·종결·수렴 계약 (Finding Severity, Closure & Convergence)

> scope: boilerplate
> area: process

## Status
accepted

## 배경
- [관측됨] `/stabilize-milestone` → `/repair-milestone` 반복에서 P0가 계속 새로 나타나 졸업이 수렴하지 않는다(사용자 fork 보고). 원인 셋이 문서에서 확인된다.
  1. **종결 누락** — `/repair-milestone` 수행 5는 Adopt/Adopt-modified만 `status: resolved`로 토글한다. Reject-FP·Reject-context로 판정한 원본 finding은 `open`으로 남아 §1.5 item 5가 다음 라운드에 다시 센다.
  2. **P0 정의·재현 요구 부재** — `qa.md`·`reviewer.md`에 P0 기준이 없다. 정적 추론만으로 P0가 등재되고, 6-S는 보고자별로 원장을 나눌 뿐(qa→QA_FINDINGS, reviewer→IMPROVEMENT_GUIDE) 채택 전 검토가 없다.
  3. **수정 후 영향 반경 미검사** — `/repair-milestone` 2-V는 «방금 한 수정이 즉시 깨졌는가»만 본다. 수정이 다른 파일에 새로 여는 결함은 다음 stabilize 전수 감사에서야 드러나고, 그때 새 P0로 보인다.
- [관측됨] ADR-067 D3은 미검증 축을 병기한 `YES`를 도입하지 않는다고 명시했고 ADR-068 D4가 그대로 승계한다. 따라서 수렴 실패의 출구는 판정값 신설이 아니라 **사용자 결정으로 진행 경로를 여는 것**이어야 한다(ROADMAP 병렬 Now 승인 경로가 이미 있다 — plan-milestone R0). ADR-067은 superseded (현재 SSOT: ADR-068).
- [외부실증] ADR-047 D8(Oracle Adequacy) — pass/fail 단일 신호는 과신을 만든다. finding도 «관측됨/재현됨/미확인»을 구분하지 않으면 P0 인플레이션이 생긴다.

## 결정

### D1. P0 정의표 (사후 판정 기준)
severity는 **영향**이고, 채택 여부는 **증거 상태**다. 둘을 섞지 않는다.

| severity | 정의 |
|---|---|
| P0 | **재현 가능하게 관측됨** + 다음 중 하나: 데이터 손실·손상 / 보안 노출(비밀·인증 우회·권한 상승) / Now 범위 핵심 시나리오(feature `## 3`) 완료 불가 / 빌드·기동·통합 `validate`·e2e 실패 / 봉인된 AC·FAC·INV·승인 프로토타입·DESIGN 계약 위반으로 사용자 체감이 달라짐 |
| P1 | 기능 저하이나 우회 가능 / 비핵심 흐름 차단 / a11y serious / 계약 불일치이나 체감 무변화 / 재현 가능한 회귀 후보 |
| P2 | 품질·정리·권고·휴리스틱 의심 |

- **P0 보고 형식**: 항목 하위 줄에 `- 재현: <명령 또는 단계> → <관측 출력>`이 **필수**다. 재현을 시도하지 못했으면 `- 재현: 미시도 — <사유>`로 적고 evidence label은 `[가설]`로 둔다. 재현 줄이 없는 P0는 6-S가 `[Finding-unreproduced]`를 붙여 D2의 `needs-confirmation`으로 보낸다.
- 이 표는 검증자에게 **지켜야 할 기준을 전달**하는 것이며 «무엇을 지적하지 말라»나 «심각도를 미리 정해 주는» 사전 유도가 아니다(ADR-050#amend-1 결정 2의 예외 범주). dispatcher는 여전히 개별 finding의 심각도를 미리 지정하지 않는다.
- **적용 범위**: 본 표는 구현 결함(QA_FINDINGS — stabilize·accept·repair 경로)에 적용한다. plan·discovery 리뷰 차원(`[Plan-*]`·`[MP-*]`·`[Disc-*]`)의 P0/P1 의미(봉인 차단 등)는 ADR-038·ADR-044·ADR-060 D8 그대로다.
- **시각 drift**: 승인 스냅샷과의 시각 불일치 자체는 `P1 [Experience-drift]` report-only다(ADR-072 D7). 그 불일치가 봉인 AC·PX↔AC 위반을 동반하고 재현되면 별도 P0 결함(재현 줄 포함)으로 등재한다 — 같은 결함이 발견 경로에 따라 다른 severity를 받지 않는다.

### D2. 채택 전 검토 (6-S, 등재 전 1회)
메인 세션은 verifier가 반환한 각 P0·P1을 원장에 적기 **전에** 아래 5값 중 하나로 판정하고 `decision:`에 적는다.

| decision | 뜻 | status |
|---|---|---|
| `confirmed` | P0: 재현 줄을 qa 단발 sub-call(명령 1회면 메인)이 **다시 실행해 관측**했다 / P1: 보고의 재현·근거를 코드·문서로 확인했다(재실행 불요) | `open` (repair 대상) |
| `rejected-fp` | 코드·문서로 오탐임이 확인됨 | `resolved` |
| `rejected-context` | charter 비목표·ARCH 결정·의도된 동작 | `resolved` |
| `needs-confirmation` | 구체 의심이나 확인 미완 — `대상 / 확인 방법 / 막힌 이유` 3필드 하위 줄 필수 | `open` (item 5가 센다 — 미확인 P0는 졸업을 막는다) |
| `unsubstantiated` | 근거 없는 가능성 | `resolved` + `### 관찰 메모`에 한 줄 |

- **P0는 `confirmed`가 되기 전에 채택하지 않는다.** 재현이 명령 한 번인 경우(빌드 실패 등)도 그 명령을 돌린다.
- **재현 재실행의 경계**: 코드·문서·상태를 바꾸지 않는 명령만 메인이 직접 돌린다. dev server·테스트 DB가 필요한 재현은 stabilize 단계 3이 이미 띄운 환경에서 qa 단발 sub-call로 돌리고, 그것도 불가하면 `needs-confirmation`(확인 방법 = `/repair-milestone`이 수행)으로 둔다. 6-S의 read-only 계약(코드·status 미변경)은 유지된다.
- 이 검토는 사후 판정이다. verifier 입력에는 D1 표만 준다.
- **어휘 경계**: 위 5값은 **원본 finding 항목**의 `decision`이다. `IMPROVEMENT_GUIDE.md ## 5. Repair decision log`의 `decision`은 **그 로그를 쓴 skill의 수리 판정값**을 그대로 쓴다(`/repair-plan` `Reject-conflict` · `/repair-milestone` `Reject-context` · `/repair-acceptance` `Out-of-contract`·`Needs User Clarification` — 경로마다 다르다). 전자는 증거 상태, 후자는 수리 처분이라 축이 다르다. 두 어휘를 섞지 않는다. 라운드가 판정을 못 내린 항목은 `## 5`에 적지 않는다 — 그 영속 자리는 원본 항목의 `status: open` + `decision: needs-confirmation` + 막힌 이유다(D3).

### D3. 종결 규칙 (4-판정 전부가 원본을 닫는다)
`/repair-milestone`의 4-판정은 원본 finding의 `status`를 **전부** 갱신한다.
- Adopt / Adopt-modified → 수정 후 **원본 `- 재현:` 절차를 다시 실행해 통과를 관측**한 뒤에만 `status: resolved`. 통과 관측 줄 `- 재현 재실행: <날짜> 통과`를 원본 항목 하위에 남긴다. 관측 없이 resolved로 적지 않는다.
- Reject-FP → `status: resolved` + `decision: rejected-fp` + 근거 한 줄. Reject-context → `status: resolved` + `decision: rejected-context` + 근거.
- **재현 줄이 없는 항목(P1·P2·개선·문서 정합)**의 종결 증거는 `- 종결 근거: <검증 수단 → 결과>`(테스트 통과·grep 0건·문서 대조 등) 한 줄이다. 원본 재현 재실행은 P0에만 요구한다.
- `needs-confirmation` 항목은 repair-milestone이 확인을 시도한다. 확인되면 `confirmed`로 바꿔 Adopt 경로, 반증되면 rejected-*, 여전히 불가면 `needs-confirmation` 유지 + 막힌 이유 갱신. `needs-confirmation`은 **판정된 open**이다(판정 없이 방치된 open과 구분) — stabilize-reviews 파일 삭제 조건의 «전 severity 4-판정 완결»에서 완결로 센다(3필드가 QA_FINDINGS로 옮겨졌으므로).
- **P0·P1은 처리된 뒤 `status`와 `decision`이 필수 필드다**(QA_FINDINGS·IMPROVEMENT_GUIDE 스키마 갱신). 미처리 항목만 두 필드가 비어 있을 수 있다.

### D4. 원인 단위 수정 + 영향 반경 재감사
`/repair-milestone`는 다음을 지킨다.
1. Adopt 항목을 **원인(root cause) 단위로 묶어** 하나의 수정으로 처리한다. 증상마다 따로 고치지 않는다. `## 5` 로그의 그 항목에 `- 원인: <한 줄>` · `- 영향 반경: <변경 파일 + 그것을 import/참조하는 파일·화면>`을 적는다.
2. 수정 뒤 ADR-068 D6 검증 집합 4항목에 **다섯째 항목**을 더한다: **영향 반경 재감사** — 변경 파일과 그 의존 파일·화면을 대상으로 qa 단발 sub-call(또는 메인 직접)로 회귀·엣지 점검. 결과를 `- 재감사: <대상 N파일> / 새 finding K건`으로 로그에 남기고, 새 finding은 D2 검토를 거쳐 등재한다.
3. 종료 전 `- 자기 점검: 이 수정으로 새로 열릴 수 있는 P0 후보 — <없음 | 목록>` 한 줄을 남긴다. 후보가 있으면 같은 라운드에서 확인한다.
4. 라운드 자체가 "전체 재감사"가 아니라는 ADR-068 D6 원칙은 유지한다 — 전수 감사는 다음 stabilize다. 다섯째 항목은 **변경분 반경**으로 한정한다.

### D5. 라운드 예산 3 + 수렴 실패 옵션
- `/repair-milestone`는 실행 시작 시 `IMPROVEMENT_GUIDE.md ## 5`의 `### M-N` 그룹에 `- round: <K> (<YYYY-MM-DD>)`를 append한다(K = 기존 최대값 + 1, 첫 실행은 1).
- `/stabilize-milestone` 단계 8은 그 K를 읽는다. **K ≥ 3이고 여전히 `### P0`에 `status: open`이 있으면** 판정은 그대로(`NO` 또는 `BLOCKED`) 두고 아래 **수렴 실패 브리프**를 출력한다(Decision Brief 6블록, `authority: user-choice`, DECISION_REGISTER 등재 `영향: M<N>`):
  - 남은 P0/P1 목록: 각각 `decision`·근거·영향·수리 범위 추정·**보류 가능 여부**(비차단이면 가능).
  - 선택지 A: 계속 수리(한 라운드 더).
  - 선택지 B: 비차단 항목에 하위 줄 `- 수렴-보류: 회수 M<N+1> 착수 시 | 조건: …`를 달아 이번 라운드 수리 대상에서 빼고 차단 항목만 수리한다. **`status`는 `open`으로 유지한다** — severity는 영향이므로(D1) 미해소 P0는 졸업 item 5를 계속 막고, `/plan-milestone` R0의 기존 *open* 회수가 다음 M에서 그 항목을 surface한다. **finding 원장에 `deferred` 상태를 신설하지 않는다** — 읽는 소비자(R0 회수·아카이브 회전·item 5)가 전부 `open`/`resolved`만 보므로 항목이 새는 자리가 된다. 보류라는 *선택* 자체는 `[Convergence]` 원장 항목이 담는다(ADR-060 D1의 «결함을 감수한다는 선택» 예외). 다음 `/repair-milestone`는 `- 수렴-보류:` 줄이 달린 항목을 그 라운드 대상에서 제외한다.
  - 선택지 C: `NO`를 유지한 채 **병렬 Now 승인**으로 다음 마일스톤을 연다(plan-milestone R0 «명시적 병렬 승인» 경로). 남은 P0는 `carry-over`로 매 라운드 표시되며(다음 M의 `/repair-milestone`는 책임 경계상 그 항목을 고치지 않고 flag만 한다), 결함이 해소된 뒤 **이전 M ID로 `/repair-milestone M<N>`을 돌려 D3 종결 규칙(재현 재실행 관측)으로 원본을 닫은 다음** 그 M의 `/stabilize-milestone` 재실행으로 정상 `YES`를 낸다.
  - 금지: 판정값 신설·`YES` 병기·P0의 P1 재분류(D1 위반).
- 브리프 출력에는 `[Convergence]` 라벨을 붙인다. stabilize는 그 항목을 DECISION_REGISTER에 `open`으로 등재한다(정상 책임 4). **답변 기록**: 사용자가 같은 세션에서 답하면 stabilize가 *자기 등재 항목에 한해* DECISION_REGISTER를 `closed` + 앵커(ROADMAP `## Now` 행 또는 QA_FINDINGS 항목)로 쓴다(기존 항목 상태 변경 금지는 유지). **`IMPROVEMENT_GUIDE.md ## 5` `### M-N`의 `- convergence-decision: <A|B|C> (round K, <YYYY-MM-DD>)` 줄은 답변 시점과 무관하게 후속 skill이 남긴다** — A·B는 다음 `/repair-milestone` 1-R, C는 `/plan-milestone` R0(병렬 승인). 세션이 끝난 뒤 답한 경우에는 그 skill이 DECISION_REGISTER `closed` 기록도 함께 쓴다(이미 닫혀 있으면 그대로 둔다). **stabilize는 `## 5`에 쓰지 않는다** — 그 절의 writer는 repair 3종 + 본 줄에 한한 `/plan-milestone`이다(IMPROVEMENT_GUIDE `## 5` writer 주석).
- **재발화 억제**: `- convergence-decision:` 줄이 있으면 그 뒤로는 (i) 새 P0 ID가 등재됐거나 (ii) 현재 K − 결정 round ≥ 2일 때만 브리프를 다시 낸다.

### D6. 새 P0의 기록 사실 (원인 추정 대신 확인 가능한 사실)
같은 마일스톤의 두 번째 이후 stabilize에서 **새로** 등재되는 P0는 하위 줄에 아래 4가지 사실만 적는다. 원인 추정 문장(`missed-by: …`)은 요구하지 않는다 — 날조를 유도한다.
- `- 이전 감사 범위: 포함 | 미포함 | 불명`
- `- 새 근거: <이번에 새로 관측된 것>`
- `- 종결 항목과 동일성: 없음 | <ID>와 동일 → 그 항목 재개(재개 사유 기록)`
- `- 종결을 뒤집는 증거: 없음 | <무엇>`
**재개 조건**: 종결 항목과 동일해도 재개는 이번 판정이 `confirmed`일 때만이다. `rejected-*`·`unsubstantiated`로 다시 판정됐으면 종결을 유지하고 그 항목 하위에 `- 재보고: <날짜> — 동일 증상, 종결 유지(<decision> 근거)` 한 줄만 남긴다(새 ID도 만들지 않는다) — 근거 없이 재개하면 같은 오탐이 매 라운드 졸업을 막아 D3의 종결 규칙이 무의미해진다.
`원인 미확인`도 허용값이다.

### D7. 보고자 기준 라우팅 폐지 — 성격 기준
6-S는 finding을 **성격**으로 라우팅한다: 동작·데이터·보안·계약 위반(= 결함) → `QA_FINDINGS.md`(severity 부여, item 5 대상) / 구조·중복·명명·부채·문서 정합(= 개선) → `IMPROVEMENT_GUIDE.md`. reviewer가 찾은 결함도 QA_FINDINGS로 간다. 보고자 이름은 항목 하위 줄 `- 출처: qa | reviewer(<surface>) | preflight | peer(<tag>)`로만 남긴다.
**본 결정은 졸업 item 5의 입력원을 넓힌다** — 기존에는 qa 팬아웃 결함만 세었고 reviewer 결함은 report-only였다. reviewer 축의 *미반환*은 여전히 판정을 바꾸지 않는다(`P2 [Audit-unavailable]`) — 결함 감사의 필수 축은 qa 팬아웃이다. 수용 경로(`/accept-milestone`·`/repair-acceptance`)의 finding도 같은 `decision` 값을 쓴다(사용자 관측이 곧 재현 관측 → 등재 시 `confirmed`). 단 그 경로에는 `rejected-fp`가 없다(ADR-066 D4 — 사용자 보고를 오탐으로 기각하지 않는다): 3+1 판정의 Out-of-contract → `rejected-context`, Needs User Clarification → `needs-confirmation`. 종결 증거는 회귀 테스트 Green 또는 재확인 receipt다(D3의 «재현 재실행»에 해당).

### D8. 수렴 지표 (telemetry)
stabilize 7-T에 다음 줄을 더한다: `- 수렴: round K / P0 신규 a · 해소 b · 재개 c / 재현 첨부율 <%> / needs-confirmation d`. 새 데이터 수집이 아니라 원장 계수다.

## 대안과 제약 (ADR-053)
- A. 면제 판정값(`WAIVED`) 신설 — 편익: 마일스톤이 깔끔히 닫힘. 제약: 졸업·수용·ROADMAP·아카이브·다음 M 진입 규칙 전부 재정의, ADR-067 D3 명시 배제와 충돌. 기각(재검토 트리거 2 도달 시 별도 ADR). ADR-067은 superseded (현재 SSOT: ADR-068).
- B. 미재현 P0를 P1로 자동 강등 — 편익: 구현 단순. 제약: severity(영향)와 증거 상태를 혼동해 기록이 거짓이 됨. 기각.
- C. 채택(본 ADR) — 정의표·재현·검토·종결·반경 재감사·예산.

## 신뢰도
Medium — 원인 셋은 문서·사용자 보고로 관측됐으나, 예산 3과 반경 재감사의 수렴 효과는 dogfood 전 [가설].

## 재검토 트리거
1. Round 11·12 dogfood에서 2 라운드 내 수렴 못 하면 D4 반경 정의·D5 예산 재조정.
2. 수렴 실패 브리프가 마일스톤 2회 연속 발화하면 면제 계약(대안 A) 설계.
3. `needs-confirmation`이 P0의 30%를 넘으면 D1 재현 형식이 과한지 재검토.

## 정책 강도 (ADR-022)
- 제약(강, [관측됨]): D1 P0 재현 필수, D2 P0 채택 전 confirmed, D3 종결 규칙(4-판정 전부), **D7 성격 기준 라우팅(졸업 item 5 입력원 확대 — reviewer 결함 포함)**.
- enabling(약): D4·D5·D6·D8.

## Mutation Contract (ADR-047 D3)
1. Target — `.claude/skills/stabilize-milestone/SKILL.md`(6-S 검토·라우팅, 단계 8 수렴 실패 브리프, 7-T 지표) / `.claude/skills/repair-milestone/SKILL.md`(round 카운터, 원인 묶기, 2-V 다섯째 항목, 수행 5 종결 전부) / `.claude/agents/qa.md`(D1 표·재현 줄) / `.claude/agents/reviewer.md`(D1 참조·결함 라우팅) / `docs/40-validation/{QA_FINDINGS,IMPROVEMENT_GUIDE}.md`(스키마) / `.claude/skills/plan-milestone/SKILL.md`(R0 병렬 Now 승인에 수렴 실패 이관 명시) / `.claude/skills/accept-milestone/SKILL.md`·`.claude/skills/repair-acceptance/SKILL.md`(수용 경로 decision·종결) / `docs/30-workitems/_templates/MILESTONE_TEMPLATE.md`(`## 8` 주석) / `docs/00-meta/WORKFLOW.md`(NO 분기 주석).
2. Failure mode — Reject 판정 원본이 open으로 남아 재등재 / 정적 추론 P0 / 수정이 여는 새 결함을 다음 라운드에서야 발견 / 수렴 실패 출구 부재 (전부 관측됨).
3. Predicted improvement — 같은 ID 재등재 0건, P0 재현 첨부율 100%, 라운드 3 이내 수렴 또는 사용자 결정 발화.
4. Preserved invariants — graduation 4값·우선순위(ADR-068 D4) / item 5 계수 정의(QA_FINDINGS P0 `status≠resolved` 0건 — 단 D7로 입력원이 reviewer 결함까지 넓어진다) / stabilize read-only / repair-milestone 재개방 없음(ADR-068 D1) / dispatcher 사전판정 금지(ADR-050#amend-1) / `(수용)` 태그 항목은 repair-acceptance 소유.
5. Falsifying evaluation — Round 11에서 (a) Reject 항목이 다음 stabilize에 재등재되면 D3 실패 (b) 재현 줄 없는 P0가 `confirmed`로 등재되면 D2 실패 (c) 반경 재감사가 잡지 못한 결함이 다음 stabilize에서 새 P0로 나오면 D4 반경 정의 재조정 (d) K 카운터가 stabilize 출력에 안 나오면 D5 배선 실패.
6. Rollback path — 본 ADR superseded → 6-S 검토·round 카운터·2-V 다섯째 항목·브리프 제거, 스키마의 필수 2필드를 권장으로 되돌림.

## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT. 실제 파일 경로 1행 1개)
- .claude/skills/stabilize-milestone/SKILL.md      — D2 6-S 검토 / D5 단계 8 브리프 / D7 라우팅 / D8 7-T
- .claude/skills/repair-milestone/SKILL.md         — D3 종결 / D4 원인·반경 / D5 round 카운터
- .claude/agents/qa.md                              — D1 정의표·재현 줄
- .claude/agents/reviewer.md                        — D1 참조·D7 결함 라우팅
- docs/40-validation/QA_FINDINGS.md                 — D3 스키마(P0·P1 필수 2필드) · D2 decision 값
- docs/40-validation/IMPROVEMENT_GUIDE.md           — D2 어휘 경계 · D3 스키마 · D5 round·convergence-decision 줄 형식과 writer 예외
- .claude/skills/plan-milestone/SKILL.md            — D5 병렬 Now 승인(수렴 실패 이관 · convergence-decision C 기록)
- .claude/skills/accept-milestone/SKILL.md          — D2 decision 등재 형식(사용자 관측 = 재현)
- .claude/skills/repair-acceptance/SKILL.md         — D3 종결
- docs/30-workitems/_templates/MILESTONE_TEMPLATE.md — D7 `## 8` 주석
- docs/00-meta/WORKFLOW.md                          — D5 NO 분기 주석

## 참고
- ADR-068(졸업 계약 v3 — D3 item 5·D4·D6), ADR-067(D3 병기 YES 배제 — superseded) (현재 SSOT: ADR-068), ADR-050#amend-1(사전판정 금지), ADR-054(single-origin), ADR-066(수용 finding — decision·종결은 본 ADR), ADR-060 D1(«결함을 감수한다는 선택» 원장 예외 — D5 B), ADR-038·ADR-044·ADR-060 D8(plan·discovery 리뷰 severity — 본 ADR 범위 밖), ADR-022, ADR-047 D3·D8.
