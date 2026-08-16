# ADR-066 — 마일스톤 수용 단계 (Milestone Acceptance)

> scope: boilerplate
> area: process

## Status
accepted

## 배경
- [관측됨] `/stabilize-milestone` §3-V(경험 게이트)는 앱을 기동해 스크린샷을 찍고 승인 프로토타입과 대조한 뒤 *"사용자 육안 확인 권장(스펙 자체의 오류는 사람이 잡는다)"* 로 끝난다. **권장만 하고, 사람이 실제로 확인했는지·무엇을 봤는지·그 결과가 판정에 반영되는지가 어디에도 없다.**
- [관측됨] 모든 validation report의 `## Evidence Bundle → 검증하지 못한 것(oracle gap)` 섹션은 그 task가 확인하지 못한 것을 카테고리별로 남기는데, **이 목록을 회수해 소비하는 단계가 없다.**
- [관측됨] dogfood 회고에 *"교훈 6건 중 5건이 검증·게이트 정교화 방향이고 제품을 써 본 경험축 교훈은 1건뿐"* 이라는 메타 관측이 기록돼 있다 — 자동 검증만으로는 제품 경험 결함이 드러나지 않는다.
- [관측됨] ADR-065 D1의 `사용자 관측` modality는 receipt 발급 경로가 필요하다.

## 결정

### D1. `/accept-milestone` 신규 skill
`/stabilize-milestone` **뒤**에 사람이 직접 실행·확인하는 단계를 둔다. 실행 환경을 띄우고, 확인할 시나리오를 제시하고, 사용자 피드백을 구조화해 라우팅한다.

- **관측 modality AC가 0건인 마일스톤에서는 졸업 필수 조건이 아니다(권장).** 실행하지 않아도 `YES`로 졸업할 수 있다. 반대로 `사용자 관측`·`플랫폼 관측` modality를 쓴 AC가 1건이라도 있으면 그 receipt 없이는 졸업 item 4를 충족하지 못하므로(ADR-065 D1 / ADR-068 D3) **본 단계가 사실상 필수 경로가 된다.** 그 상태의 graduation 값이 `PENDING_ACCEPTANCE`다(ADR-068 D4).
- **졸업 판정 소유권은 `/stabilize-milestone`에 유지한다.** 수용 라운드의 수리는 코드 변경이므로 그 뒤 테스트·e2e 재검증 없이 졸업시키지 않는다.

**스코프는 하나다 — 마일스톤 스코프(`/accept-milestone <M>`)뿐이다.** `/stabilize-milestone` 뒤에 실행하며, 마일스톤 전체 경험 확인 + 자유 탐색 + 피드백 3갈래 라우팅 + 관측 modality AC의 receipt 발급을 한 라운드에서 함께 처리한다. 라운드 카운터를 소모하고 `## 11`에 기록한다.

- **task 스코프 모드를 두지 않는 이유**: 그 모드는 `receipt 없어 finalize 불가 → task done 불가 → stabilize 진입 불가 → 발급 불가` 교착을 풀기 위한 장치였으나, 같은 교착을 **`/finalize-workitem`이 관측 AC 미충족을 통과시키는 것**으로 더 싸게 풀 수 있다([ADR-065](ADR-065-ac-verification-contract.md) D1·D6). task 스코프를 두면 관측 AC를 쓴 task 수만큼 «수용 → 재validate → finalize» 왕복이 추가로 발생한다.
- **차단은 사라지지 않고 위치가 바뀐다** — 미발급 receipt는 [ADR-068](ADR-068-milestone-closure-and-graduation-v3.md) D3 item 4가 졸업 시점에 잡는다. 관측 AC가 하나라도 미발급이면 그 마일스톤의 graduation은 `PENDING_ACCEPTANCE`이며 `YES`가 될 수 없다.
- **커밋·배포 이후에만 일어나는 사실**(CI 실행·배포 후 동작·실제 스케줄 발화)은 애초에 그 task의 AC로 두지 않고 후속 verification task로 분리한다(ADR-065 D1 경계).
- 마일스톤 스코프 **라운드 상한 3회**. 초과 시 남은 항목은 사용자 확인 후 다음 마일스톤으로 이관한다. **라운드 번호는 세션 파일 수로 계산하지 않는다**(수리 라운드가 그 파일을 삭제하므로 상한이 무력화된다) — 마일스톤 문서 `## 11`에 영속된 `- 라운드:` 값을 읽어 +1 한다.

### D2. 피드백 3갈래 라우팅
사용자 피드백은 성격에 따라 기존 3원장으로 나눈다. **새 백로그 파일을 만들지 않는다.**

| 갈래 | 판정 기준 | 목적지 | 이번 M에서 수리 |
|---|---|---|---|
| 계약 위반(결함) | 이번 마일스톤이 약속한 AC·승인 프로토타입·DESIGN 계약을 안 지킴 | `docs/40-validation/QA_FINDINGS.md` | 예 |
| 계약 변경(결정) | 계약 자체를 바꾸려는 것(방향 변경·새 기능) | `docs/30-workitems/ROADMAP.md` `## Backlog` (append — [ADR-057](ADR-057-planning-v2-batch-and-seam.md)#amend-4) | 아니오 |
| 개선 제안 | 계약 위반은 아니고 더 나은 방식 제안 | `docs/40-validation/IMPROVEMENT_GUIDE.md` | 사용자 선택 |

**이 분류는 skill이 단독으로 확정하지 않고 사용자에게 확인받는다** — 이것이 수용 라운드가 마일스톤을 무한히 늘리지 않게 하는 지점이다.

- **«계약 변경»이 `DECISION_REGISTER`가 아니라 ROADMAP인 이유**: 원장의 유일한 강제력은 **봉인 차단**인데(`open` 항목이 있으면 그 M을 봉인하지 못한다), 「다음 M에 이 기능을 넣을까」는 **아무것도 막지 않는다**. 차단이 필요 없는 항목을 차단 장치에 넣으면 원장이 두꺼워져 봉인 검사와 `/plan-milestone` R1 triage가 매 라운드 무거워진다(원장 자신의 «얇게 유지하는 규칙» 정합). 그리고 R5 시점에는 **사용자가 이미 «바꾸자»고 말한 상태**라 남은 것은 «언제»뿐이다 — 그것은 결정 문제가 아니라 계획 문제다. 원장 5종의 배타적 기록 범위 SSOT는 `docs/00-meta/STRUCTURE.md`의 `## Canonical Owner 매핑`이다([ADR-005](ADR-005-ssot.md)#amend-1).

### D3. 세션 원본은 ephemeral
사용자 발언·재현 절차의 원본은 `docs/40-validation/acceptance-reviews/<M>.r<N>.md`에 남기고 `.gitignore` 대상으로 둔다(ADR-054의 `stabilize-reviews`와 동형). **삭제 주체는 판정에 따라 둘이다** — 결함이 있어 수리로 넘어가면 `/repair-acceptance`가 회수 후 삭제하고, 결함 0건으로 바로 `승인`이면 `/accept-milestone`이 그 자리에서 삭제한다(수리가 호출되지 않아 삭제 주체가 사라지는 것을 막는다). 판정 결과는 D2의 3원장에, 수용 판정 자체는 마일스톤 문서 `## 11. 수용 기록`(커밋 대상)에 영속한다.

- **저장 전 최소화·마스킹 의무**: ephemeral이라도 디스크에는 남는다. 사용자 발언·화면 내용에 자격증명·토큰·개인정보·내부 식별자가 섞이면 **그 부분을 제거하거나 대체한 뒤 저장한다**(ADR-064 D5 마스킹 규정 준용). 마스킹이 확실하지 않으면 원문을 저장하지 않고 구조 요약만 남긴다. task `## 8`의 `- ac-acceptance` 줄에도 같은 규정을 적용한다(그 줄은 커밋되므로 더 엄격하다).

### D4. `/repair-acceptance` 신규 skill (전용 수리 경로)
수용 finding의 수리는 `/repair-milestone`이 아닌 전용 skill이 담당한다. **입력의 authority가 다르기 때문이다.**

- `/repair-milestone`의 4-판정에는 `Reject-false-positive`(stabilize가 잘못 봄)가 있으나, **사용자가 직접 보고 말한 것에 이 판정을 적용할 수 없다** — 에이전트가 사용자 관측을 오탐으로 기각하는 것은 authority 역전이다.
- 따라서 판정 체계는 **3+1**이다: `Adopt` / `Adopt-modified` / `Needs User Clarification`(재현 조건·기대값 불명확 → 되묻는다) / `Out-of-contract`(결함이 아니라 계약 변경 → 사용자 확인 후 원장 + 다음 M).
- **task 재개방 여부는 아래 «재개방 판별»의 결과에 종속된다** — `in-AC` 항목은 `/repair-workitem`에 위임해 그 task를 재개방하고, `out-of-AC` 항목만 재개방 없이 본 skill이 직접 고친다. **어느 쪽이든 본 skill은 task `## 0. Status`를 직접 쓰지 않고**(재개방 전이 `done → in-progress`의 writer는 `/repair-workitem` 하나다 — ADR-057#amend-3 결정 5) 계획 본문(`## 3`·`## 6`·`## 6-1`)도 건드리지 않는다. **본 skill이 task 문서에 쓰는 것은 `## 8`의 append 2종**(`- invalidated` receipt 무효화 / `- pattern-scan` 검색 기록)뿐이다 — 둘 다 이력 추가이며 계약 수정이 아니다. `out-of-AC` 수정의 추적성은 결정 이력의 `affected: T-NNN` 역참조로 확보한다.
- **각 `Adopt` 항목마다 그 결함을 재현하는 실패 테스트를 먼저 추가(Red)한 뒤 고치고, 고친 뒤 그 테스트가 통과하는지 확인한다(Green).** 불가능하면 사유를 결정 이력에 남긴다. 문구·간격류 소수정(코드 3줄 이하·행동 불변)은 면제한다. **Red만 관측하고 Green을 확인하지 않으면 그 테스트는 증거가 아니다.**
- **자체 검증(즉시 파손 감지)**: 전 항목 수정이 끝난 뒤 `validate --changed`(미지원이면 통합 `validate`, 통합 명령이 없으면 skip)를 1회 실행한다. **전체 검증이 아니다** — «방금 한 수정이 즉시 깨졌는가»만 본다. 고치는 대상은 **본 라운드 수정이 만든 실패로 한정**하고(baseline = 직전 `/stabilize-milestone` 단계 3의 통합 validate 결과), 그 이전부터 있던 실패는 고치지 않고 출력에 명시한다. **최대 3회 반복**하고 초과하면 `Needs Follow-up: <실패 목록>`으로 명시하고 종료한다. skip 시 별도 hardstop을 만들지 않는다.
- **재개방 판별 (`scope: in-AC | out-of-AC`)**: 각 `Adopt`·`Adopt-modified` 항목마다 **«이 변경 줄을 기존 계약으로 거꾸로 추적할 수 있는가»** 를 판정한다. 계약의 범위는 task `## 6. AC` · task `## 3. 구현 항목`의 line item · feature `## 7. FAC` · feature `## 7-2`의 INV · 승인 프로토타입 · DESIGN.md 계약(§2 토큰·§7 컴포넌트·§9 Don'ts·§10 voice)이다.
  - **`in-AC`(추적 가능)** → **그 task를 재개방해 정상 절차로 마감한다** — `/repair-workitem <T-NNN> "<finding>"` 위임 → `/validate-workitem` → `/finalize-workitem`. per-task 감사(diff-trace·Arch-iface 닫힌 결정·MCP·Design-inventory·AC↔테스트 매핑)를 그대로 받는다. **이 연쇄는 그 skill의 다른 수정·원장 쓰기보다 먼저, task 한 개씩 순차로 돈다** — `/finalize-workitem`이 task `## 4-1` 밖 변경을 `Needs Review`로 차단하므로, 미커밋 cross-cutting 수정이 tree에 쌓인 뒤 부르면 멈춘다.
  - **`out-of-AC`(추적 불가)** → **재개방하지 않는다.** 재개방은 그 task의 잠긴 계획(`## 6 AC`·`## 3`)에 근거가 없는 변경을 사후로 밀어 넣는 것이고, per-task 감사가 그 줄을 정당하게 «추적 불가»로 분류하므로 재개방·재마감을 반복해도 해소되지 않는다. 본 skill이 직접 고치고 아래 계약 부채 등재로 추적한다. **채점표 갱신을 위한 재validate는 한다** — 그때 붙는 `추적 불가` 라벨은 diff-trace audit에서 P1 기록 등급이며 차단이 아니다(`Needs Fix` 트리거는 (c) pre-existing dead code 삭제 하나뿐이다).
  - **애매하면 재개방한다** — 실패 방향을 안전한 쪽(비용만 더 듦)으로 고정한다.
- **`out-of-AC` 계약 부채 등재 (필수)**: `out-of-AC`로 고친 항목마다 `docs/40-validation/IMPROVEMENT_GUIDE.md`의 **`## 4. 보류 항목`**에 `status: open`으로 등재한다 — 「코드에는 들어갔으나 어느 계약에도 근거가 없다」는 사실과, 다음 `/plan-milestone` R0가 회수해 **AC 승격 여부를 사용자에게 묻는다**는 회수 경로를 함께 적는다. 이 등재가 없으면 그 기능은 영구히 계약 밖에 남는다.
- **본 skill은 커밋하지 않는다**(ADR-047 D7). 단 `in-AC` 위임 뒤의 연쇄에서 `/finalize-workitem`이 **그 task의 `## 4-1` 파일 + task 문서**를 커밋한다 — `out-of-AC` 수정 파일과 원장 갱신은 여전히 사용자가 커밋한다. 즉 commit owner는 «task 마감분 = `/finalize-workitem` / 그 밖 전부 = 사용자»로 갈린다.

### D5. 경계
- 입력 출처로 갈린다 — `acceptance-reviews`에서 나온 finding은 `/repair-acceptance`, `/stabilize-milestone`이 만든 finding은 `/repair-milestone`.
- 같은 항목이 양쪽에 있으면 **사용자 관측이 우선 authority**다. `/repair-acceptance`가 처리하고 `/repair-milestone`은 상태만 닫는다(그 규칙은 `/repair-milestone` 본문에 박는다 — 아래 Surfaces).
- `IMPROVEMENT_GUIDE.md ## 5. Repair decision log`의 writer가 셋으로 늘어난다(`/repair-plan`·`/repair-milestone`·`/repair-acceptance`) — 그 파일의 writer 설명도 함께 갱신한다.
- D2의 3번(개선 제안)을 이번 마일스톤에서 고치기로 사용자가 택한 경우, 그 항목은 `IMPROVEMENT_GUIDE.md`에 등재된 뒤 **`(수용)` 태그를 달아** 본 skill의 회수 대상에 포함시킨다(회수 범위가 `QA_FINDINGS`에만 걸리면 그 선택이 실행되지 않는다).
- **`(수용)` 태그의 위치는 «굵은 ID 바로 뒤, 첫 `|` 앞»으로 고정한다** — `- **M1-003** (수용) | P2 | [관측됨] | linked: M1 | status: open`. 두 원장의 `## 항목 스키마`가 첫 토큰을 굵은 ID로 규정하므로 ID 앞에 붙이지 않는다. 회수는 문자열 `(수용)` 정확 일치로 한다.

### D6. 동일 패턴 전수 검색 (pattern-scan)

repair가 결함 하나를 고칠 때 **같은 패턴의 다른 출현을 저장소 전체에서 읽기 전용으로 검색**하고 그 결과를 기록한다. 범위 계약 때문에 못 고친 출현을 마일스톤 층으로 넘기는 배선이다.

- **수행 주체**: `/repair-workitem`·`/repair-acceptance`·`/repair-milestone`. `Adopt`·`Adopt-modified`한 각 결함마다 1회.
- **기록 위치·형식**: 대상 task `## 8`에 append.
  ```
  - pattern-scan <날짜> <패턴 1줄>: 범위 내 N건 수정 / 범위 밖 M건 <경로 목록>
  ```
  검색 결과가 없으면 `범위 밖 0건`으로 적는다(검색했다는 사실 자체가 기록이다). **어느 task에도 귀속되지 않는 순수 cross-cutting 결함**은 대상 task가 없으므로 `IMPROVEMENT_GUIDE.md ## 5. Repair decision log`의 그 항목 하위 줄에 같은 형식으로 적고, 범위 밖 출현을 그 skill의 마지막 출력에 직접 나열한다.
- **범위 밖 출현은 고치지 않는다** — 읽기는 범위 제한 대상이 아니지만 쓰기는 그 skill의 범위 계약을 따른다.
- **회수**: `/stabilize-milestone` §1.0이 산하 task `## 8`의 (HTML 주석 밖) `- pattern-scan` 줄을 읽어 `범위 밖 M건 ≥ 1`인 항목을 `IMPROVEMENT_GUIDE.md`에 `P1 [Pattern-spread]`로 등재하고, `/repair-milestone`이 그것을 cross-cutting 결함으로 처리한다.
- **재등재 금지(dedup)**: ID는 `<task-id>-pspread-<패턴 슬러그>`로 안정적으로 만들고, 그 ID가 이미 원장에 있으면(`open`이든 `resolved`든) 다시 등재하지 않는다. `- pattern-scan` 줄이 task 문서에 영속되므로 이 규칙이 없으면 매 마일스톤 같은 P1이 재생산된다. **예외**: 기존 ID가 `resolved`인데 **경로 목록이 다른** `- pattern-scan` 줄이 새로 append됐으면 `-2`·`-3` suffix로 새 ID를 발급한다.

## 근거
- 이 단계는 새 개념이 아니라 §3-V가 남긴 *"사용자 육안 확인 권장"* 의 실행 자리이고, oracle gap 목록의 소비처다. 두 미완성 후단을 잇는다.
- **관측 modality AC가 0건인 마일스톤에서** 권장(비차단)으로 두는 이유: 사람 확인 부재로 인한 잘못된 졸업은 아직 관측되지 않았다(ADR-022 ratchet). **관측 AC가 1건이라도 있으면 그 receipt가 졸업 item 4를 막으므로 그 마일스톤에서는 이 단계가 사실상 필수다**(위 D1). 본 단계를 졸업 checklist **항목**으로 승격하는 트리거는 *졸업 YES가 난 마일스톤에서 사용자가 P0급 경험 결함을 발견한 사례* 이며, 그때 필수 항목으로 올린다(과거 graduation contract가 같은 항목을 soft→hard로 올린 방식과 동형 — 현재 SSOT: ADR-068).
- 전용 repair skill을 두는 이유는 위 D4의 authority 차이다(중복이 아니라 특화).

## Mutation Contract (ADR-047 D3)
1. **Target** — `.claude/skills/accept-milestone/SKILL.md` / `.claude/skills/repair-acceptance/SKILL.md` / 양 Codex wrapper / `.gitignore` acceptance-reviews / MILESTONE_TEMPLATE `## 11` / stabilize §3-V (d)·§1.0 pattern-scan 회수·단계 8 다음 단계 / validate-workitem·finalize-workitem의 관측 AC 처리 / repair-milestone D5 경계 + D6 pattern-scan + 수리 규율 + 루프 닫기 / repair-workitem D6 pattern-scan / TASK_TEMPLATE `## 8` pattern-scan 형식 / QA_FINDINGS·IMPROVEMENT_GUIDE `## 항목 스키마`(`(수용)` 태그)·IMPROVEMENT_GUIDE `## 4` 계약 부채 / ROADMAP `## Backlog`(D2 계약 변경 목적지) / ADR-007 단계 추가 note / WORKFLOW lifecycle·실행 순서 / DELEGATION 위임 표·실행 순서 / STRUCTURE 로스터·산출물 표·Canonical Owner 매핑 / README·README_ko wrapper 목록.
2. **Failure mode** — (a) 자동 검증만으로 졸업해 제품 경험 결함이 사용자에게 처음 발견됨 (b) oracle gap이 어디에서도 소비되지 않음 (c) 사용자 피드백이 분류 없이 쌓여 마일스톤이 끝나지 않음 (d) 사용자 관측이 에이전트에 의해 오탐으로 기각됨.
3. **Predicted improvement** — 수용 라운드가 실행된 마일스톤에 `## 11. 수용 기록`이 남고, 사용자 피드백이 3갈래로 분류돼 계약 변경이 현재 M을 늘리지 않는다.
4. **Preserved invariants** — `/stabilize-milestone` read-only + 졸업 판정 소유권 / ADR-068 졸업 항목 무증설 / ADR-060 D11 봉인 후 결정 등재 경로 / ADR-047 D7 commit owner / task status 소유권(`/finalize-workitem`·`/repair-workitem` 한정 — `/repair-acceptance`·`/repair-milestone`은 status를 직접 쓰지 않고 `in-AC` 결함을 `/repair-workitem`에 위임한다).
5. **Falsifying evaluation** — ADR-017 dogfood 재실행에서 (a) 비-UI 마일스톤에서 제시할 시나리오가 0건이 되거나, (b) 사용자 피드백 분류가 매번 `Out-of-contract`로 쏠려 수리가 발생하지 않거나, (c) 라운드 상한 3회에 도달하는 사례가 반복되면 D1·D2를 재조정한다.
6. **Rollback path** — 본 ADR superseded + 두 skill과 wrapper 제거 + `## 11` 섹션 제거 + `.gitignore` 패턴 제거 + stabilize §3-V (d) 문구 복원.

## 정책 강도 (ADR-022)
- **enabling(약)**: D1 단계 신설(비차단·권장), D2 라우팅, D3 ephemeral 원본.
- **제약(약)**: D4의 3+1 판정·회귀 테스트 선행(Red→Green)·`out-of-AC` 항목의 재개방 금지, D5 경계.

## 결과
- `stabilize(PENDING_ACCEPTANCE) → accept → (repair-acceptance) → accept 재확인 → stabilize 재실행 → 졸업(YES)` 흐름이 생긴다.
- ADR-065의 `사용자 관측` modality가 발급 경로를 갖고, 그 receipt 발급은 **재validate를 유발하지 않는다**(졸업 item 4가 task `## 8`을 직접 읽는다 — ADR-068 D3).

## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT. 실제 파일 경로 1행 1개)
> 등재 기준: 본 ADR의 결정을 **실행하거나 집행하는 파일만** 등재한다. 본 ADR을 배경·역사로 언급만 하는 파일은 등재하지 않는다.
- .claude/skills/accept-milestone/SKILL.md               — D1 라운드 구조 + D2 라우팅 + D3 세션 파일
- .claude/skills/repair-acceptance/SKILL.md              — D4 3+1 판정 + 회귀 테스트 + D5 경계
- .agents/skills/accept-milestone/SKILL.md               — Codex wrapper
- .agents/skills/repair-acceptance/SKILL.md              — Codex wrapper
- .claude/skills/stabilize-milestone/SKILL.md            — §3-V (d) 후속 호출 + 단계 8 다음 단계
- .claude/skills/repair-milestone/SKILL.md               — D5 중복 finding status-only 처리 + `(수용)` 태그 회수 제외
- .claude/skills/validate-workitem/SKILL.md              — D1 관측 AC 미충족의 report 표현 + 다음 액션
- .claude/skills/finalize-workitem/SKILL.md              — D1 관측 AC 미충족 통과 처리 + `- ac-pending` 기록
- docs/40-validation/IMPROVEMENT_GUIDE.md                — `## 5` writer 목록에 repair-acceptance 추가
- docs/90-decisions/boilerplate/ADR-007-workitem-lifecycle.md — 단계 추가 note (lifecycle SSOT)
- docs/30-workitems/_templates/MILESTONE_TEMPLATE.md     — `## 11. 수용 기록`
- docs/00-meta/WORKFLOW.md                               — lifecycle 그림 + 단계 5-1
- docs/00-meta/DELEGATION_STRATEGY.md                    — 위임 표 + 실행 순서 8.5/8.6
- docs/00-meta/STRUCTURE.md                              — skill 로스터 + 산출물 표
- .gitignore                                             — acceptance-reviews ephemeral
- .claude/skills/repair-workitem/SKILL.md                — D6 pattern-scan 수행
- docs/30-workitems/_templates/TASK_TEMPLATE.md          — D6 `- pattern-scan` 줄 형식
- docs/40-validation/QA_FINDINGS.md                      — D2 결함 등재 + D5 `(수용)` 태그
- docs/30-workitems/ROADMAP.md                           — D2 계약 변경의 목적지 (`## Backlog`)

## 참고
- ADR-054(cross-LLM stabilize 리뷰 — ephemeral 리뷰 파일·4판정·echo-then-rm 원형), ADR-056(경험 계약 — 승인 프로토타입·§3-V), ADR-060 D11(봉인 후 새 결정 등재), ADR-065(AC 검증 modality — `사용자 관측` 발급), ADR-047 D7(commit owner·durable correction history), ADR-039(`Type: bugfix` — 회귀 테스트 규율의 원형).

<a id="adr-066-amend-1"></a>
## Amendment 1 (2026-08-17) — 재개방 판별 폐지 (마일스톤 층 폐쇄 경계 정합)

### 배경
- [관측됨] D4의 `in-AC` 분기는 그 task를 재개방해 `/repair-workitem` → `/validate-workitem` → `/finalize-workitem` 연쇄를 돌게 한다. 이 연쇄가 실행 순서 규칙과 채점표 자기무효화의 직접 원인이었다.
- [ADR-068](ADR-068-milestone-closure-and-graduation-v3.md) D1이 마일스톤 층의 task 재개방을 전면 폐지한다.

### 결정
- **D4의 「재개방 판별」에서 «재개방» 부분을 폐지한다.** `in-AC`·`out-of-AC` 어느 쪽이든 `/repair-acceptance`가 **직접 고친다.** `/repair-workitem` 위임과 그 뒤의 연쇄(`/validate-workitem`·`/finalize-workitem`)는 수행하지 않는다.
- **`scope: in-AC | out-of-AC` 판별 자체는 유지한다** — 라우팅 분기가 아니라 `IMPROVEMENT_GUIDE.md` `## 5`의 **필수 분류값**으로 남는다(ADR-068 D6). 판별 질문과 계약 여섯 범위는 D4 본문 그대로다.
- `out-of-AC` 계약 부채 등재(`## 4. 보류 항목`) 의무는 유지하며 `/repair-milestone`에도 동일하게 적용된다(ADR-068 D6).
- D4의 «본 skill은 커밋하지 않는다»는 유지된다. 연쇄가 사라졌으므로 **커밋 주체는 사용자 하나**가 된다(`/finalize-workitem`이 이 경로에서 호출되지 않는다).
- D6 pattern-scan의 기록 위치는 task `## 8`이 아니라 `IMPROVEMENT_GUIDE.md` `## 5`의 그 항목 하위 줄로 옮긴다(폐쇄 후 task 문서 불가침 — ADR-068 D1). `/repair-workitem`이 폐쇄 **전**에 수행하는 pattern-scan은 기존대로 task `## 8`이다.

### 강도 (ADR-022)
- 제약(강) — [관측됨]. 기존 경로의 제거이며 새 요구를 추가하지 않는다.

### 적용 surface
- .claude/skills/repair-acceptance/SKILL.md
- .claude/skills/repair-milestone/SKILL.md
- .claude/skills/repair-workitem/SKILL.md
