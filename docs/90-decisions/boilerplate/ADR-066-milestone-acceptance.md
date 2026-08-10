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

- **졸업 필수 조건이 아니다(권장).** 실행하지 않아도 졸업할 수 있다. 단 `사용자 관측`·`플랫폼 관측` modality를 쓴 AC는 receipt 없이 충족되지 않으므로(ADR-065 D1) 그 modality를 쓴 프로젝트는 본 단계를 거치게 된다.
- **졸업 판정 소유권은 `/stabilize-milestone`에 유지한다.** 수용 라운드의 수리는 코드 변경이므로 그 뒤 테스트·e2e 재검증 없이 졸업시키지 않는다.

**스코프 2종 — 이 구분이 lifecycle 교착을 막는 지점이다.**

| 스코프 | 호출 | 시점 | 다루는 것 | 라운드 카운터 | `## 11` 기록 |
|---|---|---|---|---|---|
| **task 스코프** | `/accept-milestone --task <task-id>` | `/validate-workitem`이 그 task의 `사용자 관측`·`플랫폼 관측` AC를 미충족으로 낸 직후(= `finalize` 전) | **그 task의 해당 AC만.** receipt 발급 또는 미충족 확정 | 소모하지 않음 | 쓰지 않음 |
| **마일스톤 스코프** | `/accept-milestone <M>` | `/stabilize-milestone` 뒤 | 마일스톤 전체 경험 확인 + 자유 탐색 + 피드백 3갈래 라우팅 | 소모(상한 3) | 씀 |

- **task 스코프를 두는 이유**: `사용자 관측` AC의 receipt를 마일스톤 스코프에서만 발급할 수 있으면 `validate 미충족 → finalize 불가 → task done 불가 → stabilize 진입 불가 → 발급 불가`의 순환이 생긴다. 선례는 `/stabilize-milestone --feature F-NNN`의 스코프 모드다(그 모드도 졸업 판정·회고 쓰기를 skip한다).
- **task 스코프가 푸는 것은 «지금 사람이 보면 알 수 있는» 관측이다** — 수동 UI 확인, 실기기 확인, 로컬 실행 결과 확인 등. **커밋·배포 이후에만 일어나는 사실**(CI 실행·배포 후 동작·실제 스케줄 발화)은 애초에 그 task의 AC로 두지 않고 후속 verification task로 분리한다([ADR-065](ADR-065-ac-verification-contract.md) D1 경계) — 그것까지 이 스코프로 풀려 하면 finalize를 무한정 붙잡게 된다.
- **task 스코프는 마일스톤 스코프를 대체하지 않는다** — 전자는 *증거 발급*, 후자는 *경험 수용*이다.
- 마일스톤 스코프 **라운드 상한 3회**. 초과 시 남은 항목은 사용자 확인 후 다음 마일스톤으로 이관한다. **라운드 번호는 세션 파일 수로 계산하지 않는다**(수리 라운드가 그 파일을 삭제하므로 상한이 무력화된다) — 마일스톤 문서 `## 11`에 영속된 `- 라운드:` 값을 읽어 +1 한다.

### D2. 피드백 3갈래 라우팅
사용자 피드백은 성격에 따라 기존 3원장으로 나눈다. **새 백로그 파일을 만들지 않는다.**

| 갈래 | 판정 기준 | 목적지 | 이번 M에서 수리 |
|---|---|---|---|
| 계약 위반(결함) | 이번 마일스톤이 약속한 AC·승인 프로토타입·DESIGN 계약을 안 지킴 | `docs/40-validation/QA_FINDINGS.md` | 예 |
| 계약 변경(결정) | 계약 자체를 바꾸려는 것(방향 변경·새 기능) | `docs/10-charter/DECISION_REGISTER.md` `status: open` + 다음 M 후보 (ADR-060 D11 경로) | 아니오 |
| 개선 제안 | 계약 위반은 아니고 더 나은 방식 제안 | `docs/40-validation/IMPROVEMENT_GUIDE.md` | 사용자 선택 |

**이 분류는 skill이 단독으로 확정하지 않고 사용자에게 확인받는다** — 이것이 수용 라운드가 마일스톤을 무한히 늘리지 않게 하는 지점이다.

### D3. 세션 원본은 ephemeral
사용자 발언·재현 절차의 원본은 `docs/40-validation/acceptance-reviews/<M>.r<N>.md`에 남기고 `.gitignore` 대상으로 둔다(ADR-054의 `stabilize-reviews`와 동형). **삭제 주체는 판정에 따라 둘이다** — 결함이 있어 수리로 넘어가면 `/repair-acceptance`가 회수 후 삭제하고, 결함 0건으로 바로 `승인`이면 `/accept-milestone`이 그 자리에서 삭제한다(수리가 호출되지 않아 삭제 주체가 사라지는 것을 막는다). 판정 결과는 D2의 3원장에, 수용 판정 자체는 마일스톤 문서 `## 11. 수용 기록`(커밋 대상)에 영속한다.

- **저장 전 최소화·마스킹 의무**: ephemeral이라도 디스크에는 남는다. 사용자 발언·화면 내용에 자격증명·토큰·개인정보·내부 식별자가 섞이면 **그 부분을 제거하거나 대체한 뒤 저장한다**(ADR-064 D5 마스킹 규정 준용). 마스킹이 확실하지 않으면 원문을 저장하지 않고 구조 요약만 남긴다. task `## 8`의 `- ac-acceptance` 줄에도 같은 규정을 적용한다(그 줄은 커밋되므로 더 엄격하다).

### D4. `/repair-acceptance` 신규 skill (전용 수리 경로)
수용 finding의 수리는 `/repair-milestone`이 아닌 전용 skill이 담당한다. **입력의 authority가 다르기 때문이다.**

- `/repair-milestone`의 4-판정에는 `Reject-false-positive`(stabilize가 잘못 봄)가 있으나, **사용자가 직접 보고 말한 것에 이 판정을 적용할 수 없다** — 에이전트가 사용자 관측을 오탐으로 기각하는 것은 authority 역전이다.
- 따라서 판정 체계는 **3+1**이다: `Adopt` / `Adopt-modified` / `Needs User Clarification`(재현 조건·기대값 불명확 → 되묻는다) / `Out-of-contract`(결함이 아니라 계약 변경 → 사용자 확인 후 원장 + 다음 M).
- **기존 task를 재개방하지 않는다.** task `## 0. Status`와 계획 본문(`## 3`·`## 6`·`## 6-1`)을 건드리지 않는다. 쓰는 것은 **코드**와 **task `## 8`의 append 2종**(`- invalidated` receipt 무효화 / `- pattern-scan` 검색 기록)뿐이다 — 둘 다 이력 추가이며 계약 수정이 아니다. 추적성은 결정 이력의 `affected: T-NNN` 역참조로 확보한다.
- **각 `Adopt` 항목마다 그 결함을 재현하는 실패 테스트를 먼저 추가(Red)한 뒤 고친다.** 불가능하면 사유를 결정 이력에 남긴다. 문구·간격류 소수정(코드 3줄 이하·행동 불변)은 면제한다.
- 커밋하지 않는다(commit owner는 사용자 — ADR-047 D7).

### D5. 경계
- 입력 출처로 갈린다 — `acceptance-reviews`에서 나온 finding은 `/repair-acceptance`, `/stabilize-milestone`이 만든 finding은 `/repair-milestone`.
- 같은 항목이 양쪽에 있으면 **사용자 관측이 우선 authority**다. `/repair-acceptance`가 처리하고 `/repair-milestone`은 상태만 닫는다(그 규칙은 `/repair-milestone` 본문에 박는다 — 아래 Surfaces).
- `IMPROVEMENT_GUIDE.md ## 5. Repair decision log`의 writer가 셋으로 늘어난다(`/repair-plan`·`/repair-milestone`·`/repair-acceptance`) — 그 파일의 writer 설명도 함께 갱신한다.
- D2의 3번(개선 제안)을 이번 마일스톤에서 고치기로 사용자가 택한 경우, 그 항목은 `IMPROVEMENT_GUIDE.md`에 등재된 뒤 **`(수용)` 태그를 달아** 본 skill의 회수 대상에 포함시킨다(회수 범위가 `QA_FINDINGS`에만 걸리면 그 선택이 실행되지 않는다).

## 근거
- 이 단계는 새 개념이 아니라 §3-V가 남긴 *"사용자 육안 확인 권장"* 의 실행 자리이고, oracle gap 목록의 소비처다. 두 미완성 후단을 잇는다.
- 권장(비차단)으로 두는 이유: 사람 확인 부재로 인한 잘못된 졸업은 아직 관측되지 않았다(ADR-022 ratchet). 승격 트리거는 *졸업 YES가 난 마일스톤에서 사용자가 P0급 경험 결함을 발견한 사례* 이며, 그때 필수 항목으로 올린다(ADR-014#amend-2가 soft→hard로 올린 방식과 동형).
- 전용 repair skill을 두는 이유는 위 D4의 authority 차이다(중복이 아니라 특화).

## Mutation Contract (ADR-047 D3)
1. **Target** — `.claude/skills/accept-milestone/SKILL.md` 신규 / `.claude/skills/repair-acceptance/SKILL.md` 신규 / 양 Codex wrapper 신규 / `.gitignore` acceptance-reviews / MILESTONE_TEMPLATE `## 11` / stabilize §3-V (d)·단계 8 다음 단계 / validate-workitem·finalize-workitem의 task 스코프 라우팅 / repair-milestone D5 경계 / IMPROVEMENT_GUIDE `## 5` writer 목록 / ADR-007 단계 추가 note / WORKFLOW lifecycle·실행 순서 / DELEGATION 위임 표·실행 순서 / STRUCTURE 로스터·산출물 표 / README·README_ko wrapper 목록.
2. **Failure mode** — (a) 자동 검증만으로 졸업해 제품 경험 결함이 사용자에게 처음 발견됨 (b) oracle gap이 어디에서도 소비되지 않음 (c) 사용자 피드백이 분류 없이 쌓여 마일스톤이 끝나지 않음 (d) 사용자 관측이 에이전트에 의해 오탐으로 기각됨.
3. **Predicted improvement** — 수용 라운드가 실행된 마일스톤에 `## 11. 수용 기록`이 남고, 사용자 피드백이 3갈래로 분류돼 계약 변경이 현재 M을 늘리지 않는다.
4. **Preserved invariants** — `/stabilize-milestone` read-only + 졸업 판정 소유권 / ADR-067 졸업 항목 무증설 / ADR-060 D11 봉인 후 결정 등재 경로 / ADR-047 D7 commit owner / task status 소유권(finalize·repair-workitem 한정).
5. **Falsifying evaluation** — ADR-017 dogfood 재실행에서 (a) 비-UI 마일스톤에서 제시할 시나리오가 0건이 되거나, (b) 사용자 피드백 분류가 매번 `Out-of-contract`로 쏠려 수리가 발생하지 않거나, (c) 라운드 상한 3회에 도달하는 사례가 반복되면 D1·D2를 재조정한다.
6. **Rollback path** — 본 ADR superseded + 두 skill과 wrapper 제거 + `## 11` 섹션 제거 + `.gitignore` 패턴 제거 + stabilize §3-V (d) 문구 복원.

## 정책 강도 (ADR-022)
- **enabling(약)**: D1 단계 신설(비차단·권장), D2 라우팅, D3 ephemeral 원본.
- **제약(약)**: D4의 3+1 판정·회귀 테스트 선행·task 재개방 금지, D5 경계.

## 결과
- `stabilize → accept → (repair-acceptance) → accept 재확인 → stabilize 재실행 → 졸업` 흐름이 생긴다.
- ADR-065의 `사용자 관측` modality가 발급 경로를 갖는다.

## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT. 실제 파일 경로 1행 1개)
- .claude/skills/accept-milestone/SKILL.md               — D1 라운드 구조 + D2 라우팅 + D3 세션 파일
- .claude/skills/repair-acceptance/SKILL.md              — D4 3+1 판정 + 회귀 테스트 + D5 경계
- .agents/skills/accept-milestone/SKILL.md               — Codex wrapper
- .agents/skills/repair-acceptance/SKILL.md              — Codex wrapper
- .claude/skills/stabilize-milestone/SKILL.md            — §3-V (d) 후속 호출 + 단계 8 다음 단계
- .claude/skills/repair-milestone/SKILL.md               — D5 중복 finding status-only 처리 + `(수용)` 태그 회수 제외
- .claude/skills/validate-workitem/SKILL.md              — D1 task 스코프 라우팅(미충족 관측 AC → `--task` 안내)
- .claude/skills/finalize-workitem/SKILL.md              — D1 `Needs Acceptance` 종료 + task 스코프 안내
- docs/40-validation/IMPROVEMENT_GUIDE.md                — `## 5` writer 목록에 repair-acceptance 추가
- docs/90-decisions/boilerplate/ADR-007-workitem-lifecycle.md — 단계 추가 note (lifecycle SSOT)
- docs/30-workitems/_templates/MILESTONE_TEMPLATE.md     — `## 11. 수용 기록`
- docs/00-meta/WORKFLOW.md                               — lifecycle 그림 + 단계 5-1
- docs/00-meta/DELEGATION_STRATEGY.md                    — 위임 표 + 실행 순서 8.5/8.6
- docs/00-meta/STRUCTURE.md                              — skill 로스터 + 산출물 표
- .gitignore                                             — acceptance-reviews ephemeral

## 참고
- ADR-054(cross-LLM stabilize 리뷰 — ephemeral 리뷰 파일·4판정·echo-then-rm 원형), ADR-056(경험 계약 — 승인 프로토타입·§3-V), ADR-060 D11(봉인 후 새 결정 등재), ADR-065(AC 검증 modality — `사용자 관측` 발급), ADR-047 D7(commit owner·durable correction history), ADR-039(`Type: bugfix` — 회귀 테스트 규율의 원형).
