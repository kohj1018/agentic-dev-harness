---
name: repair-acceptance
description: /accept-milestone이 수집한 사용자 수용 finding을 3+1 판정으로 수리한다. 기존 task를 재개방하지 않고 코드만 고친다. 커밋 없음 (ADR-066 D4).
argument-hint: "<milestone-id> [optional scope note]"
disable-model-invocation: true
allowed-tools: Read Glob Grep Write Edit Bash
---

이 skill은 `/accept-milestone`이 남긴 **사용자 관측 finding**을 수리한다. 코드 수정이 허용된다.
**커밋하지 않고, workitem status를 바꾸지 않으며, 기존 task를 재개방하지 않는다.**

`/repair-milestone`과의 경계 (ADR-066 D5) — **입력 출처로 갈린다.**
- 본 skill: `docs/40-validation/acceptance-reviews/<M>.r*.md` + 그 라운드가 `QA_FINDINGS.md`·`IMPROVEMENT_GUIDE.md`에 `(수용)` 태그로 등재한 항목.
- `/repair-milestone`: `/stabilize-milestone`이 만든 finding(기계·AI 관측) + `stabilize-reviews` peer 리뷰.
- 같은 항목이 양쪽에 있으면 **사용자 관측이 우선 authority**다 — 본 skill이 처리하고 `/repair-milestone`은 status만 닫는다.

입력:
- `$ARGUMENTS`: milestone id(`M[0-9]+` 패턴만 — 미일치 즉시 종료) + (선택) 부분 범위 메모(예: `M1 "P0만"`).

반드시 먼저 할 일:
1. `docs/40-validation/acceptance-reviews/<M>.r*.md` glob으로 세션 파일을 회수한다(경로 목록을 메모리에 보관 — 삭제 후 재glob 금지).
2. `QA_FINDINGS.md` 본 마일스톤 헤더에서 `(수용)` 태그 항목을 회수한다. **`IMPROVEMENT_GUIDE.md`의 `## 2`/`## 3` 안 `(수용)` 태그 항목도 함께 회수한다** — 사용자가 "개선 제안을 이번 마일스톤에서 고치겠다"고 택한 것이 그 자리에 등재된다(ADR-066 D2/D5).
3. 둘 다 비어 있으면 *"수리 대상 수용 finding 없음 — `/accept-milestone <M>`을 먼저 실행하세요"* 안내 후 종료(문서 수정 금지).
4. 대상 task와 그 `## 6-1`·`## 8`을 읽는다(어떤 AC·modality에 걸린 결함인지 확인).
5. 우선순위(P0 > P1 > P2)로 정렬한다.

## 3+1 판정 (수정 *전* 1회)
**중복 병합 (canonical = 원장 항목)**: 같은 finding이 세션 파일의 분류 결과와 원장(`QA_FINDINGS`·`IMPROVEMENT_GUIDE`)에 **동시에 있는 것이 정상이다** — `/accept-milestone` R5가 원장에 등재하고 R6이 세션 원본에 분류 결과를 함께 남긴다. **판정·수리·기록의 단위는 원장 항목 하나이며**(ID와 `status`를 가진 쪽이 canonical), 세션 파일은 그 항목의 재현 절차·사용자 발언을 보충하는 데만 쓴다. 동일 `<라벨> <경로> <증상>`이면 한 항목으로 합쳐 `<M>-uat-<N>`을 **하나만** 발급한다(`/repair-milestone`의 dedup 규율과 동형). 세션 파일에만 있고 원장에 없는 항목은 R5 라우팅 누락이므로 사용자에게 확인한 뒤 처리한다.
각 finding을 아래 넷 중 하나로 판정하고 한 줄 근거를 남긴다.
- **Adopt** — 진짜 결함. 보고된 대로 수리.
- **Adopt-modified** — 결함은 맞지만 더 나은 방식으로 수리(다른 수정 + 사유).
- **Needs User Clarification** — 재현 조건·기대값이 불명확. **추측으로 고치지 않고 사용자에게 되묻는다**(무엇이 불명확한지 1줄 + 필요한 정보).
- **Out-of-contract** — 결함이 아니라 계약 변경(이번 마일스톤이 약속하지 않은 것). **사용자 확인 후** `DECISION_REGISTER.md`에 `status: open` + `- 발견: 수용 라운드 (M<N>)`으로 등재하고 다음 마일스톤 후보로 남긴다. 코드를 고치지 않는다.

> **`Reject-false-positive`는 없다** — 사용자가 직접 보고 말한 것을 에이전트가 오탐으로 기각하는 것은 authority 역전이다(ADR-066 D4). 불명확하면 `Needs User Clarification`, 계약 밖이면 `Out-of-contract`이며, 그 둘은 모두 **사용자가 판단하는 경로**다.

## 수행
1. Adopt / Adopt-modified 항목을 우선순위 순으로 처리한다.
2. **회귀 테스트 선행 (ADR-066 D4)**: 각 항목마다 **그 결함을 재현하는 실패 테스트를 먼저 추가해 실패를 관측한 뒤** 고친다. 관측 결과를 결정 이력에 1줄 남긴다.
   - **면제**: 코드 3줄 이하 + 외부 행동 불변인 표기·간격·문구 수정. 면제 사유를 결정 이력에 적는다.
   - 테스트 작성이 불가능하면(사람 관측만으로 판정되는 시각 결함 등) 그 사유를 적고 **그 AC의 modality가 `[사용자 관측]`인지 확인**한다 — 그렇다면 다음 수용 라운드의 재확인 대상이다.
3. **기존 task를 재개방하지 않는다** — task `## 0. Status`를 건드리지 않고, `## 6 AC`·`## 3`·`## 6-1` 계획 본문도 고치지 않는다(잠긴 계약이다). **task 문서에 쓰는 것은 `## 8`의 append 2종뿐이다**(아래 4·5의 `- invalidated`·`- pattern-scan`). task 문서 밖 산출물은 각 단계가 따로 규정한다 — 코드(1·2), report 삭제(4-A), 3원장 status(8), decision log(7), 원장 등재(`Out-of-contract`).
4. **AC acceptance 무효화 (ADR-065 D3)**: 수리가 어떤 AC의 동작 경로를 건드렸고 그 AC의 modality가 `[사용자 관측]`·`[플랫폼 관측]`이면 그 task `## 8`에 `- invalidated <날짜> <AC-N>: repair-acceptance 수정으로 재확인 필요`를 append한다(기존 `- ac-acceptance`는 지우지 않는다). **새 receipt를 대신 쓰지 않는다.**
4-A. **영향 task report 무효화 (ADR-067 D1 item 4 (d) 보완)**: 코드를 고친 각 task의 `docs/40-validation/reports/<task-id>.md`를 **삭제한다**(`/repair-workitem`·`/repair-milestone`의 삭제 규율과 동형 — **삭제 전 `삭제 예정: <경로>` echo 강제**, 미리 회수한 경로로 하나씩 `rm`, 삭제 후 재glob 금지). 고친 파일이 그 task `## 4-1`에 없을 수 있어 mtime 비교만으로는 stale이 안 잡힌다. report 부재 = 졸업 item 4 미충족이므로 재validate가 강제된다.
5. **동일 패턴 전수 검색**: 각 Adopt 결함에 대해 같은 패턴의 다른 출현을 저장소 전체에서 **읽기 전용**으로 검색하고, 대상 task `## 8`에 `- pattern-scan <날짜> <패턴>: 범위 내 N건 수정 / 범위 밖 M건 <경로>`를 append한다. 범위 밖은 고치지 않고 `/repair-milestone` 또는 다음 마일스톤으로 라우팅한다.
6. **한 라운드에 P0/P1/P2를 모두 판정으로 완결한다**(defer 금지). 작업량을 줄이려면 사용자가 인자로 부분 범위를 지정한다.
7. **결정 이력 영속화 (ADR-047 D7)** — 본 라운드의 P0/P1 항목 전부를 `docs/40-validation/IMPROVEMENT_GUIDE.md`의 `## 5. Repair decision log` 안 `### M-N` 그룹(없으면 신설)에 append한다. P2는 영속화하지 않는다.
   ```
   - **M1-uat-1** | P0 | [관측됨] | linked: M1 | affected: T-004 | status: applied | decision: Adopt
     - 발견 (수용 라운드 r1): <사용자가 관측한 것 한 줄>.
     - 결정: <Adopt 사유 한 줄> / 회귀 테스트: <추가한 테스트 또는 면제 사유>.
   ```
   ID 컨벤션은 `<milestone-id>-uat-<N>`이다. **`affected: T-NNN`은 필수** — task 문서를 건드리지 않으므로 이 역참조가 "어느 task의 산출물을 나중에 누가 왜 고쳤는지"를 추적하는 유일한 경로다.
8. **원본 finding status 갱신 (4종 전부)** — ① `Adopt`/`Adopt-modified`로 해소한 `QA_FINDINGS.md`의 `(수용)` 항목 → `status: resolved` ② 같은 기준으로 `IMPROVEMENT_GUIDE.md` `## 2`/`## 3`의 `(수용)` 항목 → `status: resolved`(이걸 빠뜨리면 개선 제안이 열린 채 남아 다음 stabilize의 open 스냅샷을 부풀린다) ③ `Out-of-contract`로 재분류한 항목 → 원본을 `status: resolved (재분류: DECISION_REGISTER D-NNN — 다음 M)`로 닫고 원장 등재와 짝을 맞춘다 ④ `Needs User Clarification` 항목 → **닫지 않고 `status: open` 유지**.
9. **세션 파일 삭제 (echo-then-rm)**: 한 파일의 **전 severity finding이 판정 완결됐을 때만** 삭제한다. 삭제 전 `삭제 예정: <경로>`를 출력하고 보관한 경로 목록으로 하나씩 삭제한다(삭제 후 재glob 금지).
   - **미완결 = 보존**: `Needs User Clarification`이 1건이라도 남았거나(사용자 답변 후 재실행이 이어받는다) 부분 범위 지정으로 미처리가 남았으면 **삭제하지 않고** 출력에 `미처리 잔존 — 보존: <경로>`를 명시한다.

책임 경계:
- 새 기능을 추가하지 않는다. 마일스톤 범위 밖 파일을 수정하지 않는다.
- 자동 커밋하지 않는다 — commit owner는 사용자다(ADR-047 D7).
- workitem `## 0. Status`를 변경하지 않는다. task 계획 본문(`## 3`·`## 6`·`## 6-1`)을 고치지 않는다.
- `- ac-acceptance` 줄을 발급하지 않는다(사용자 authority — ADR-065 D1).

마지막 출력:
- 판정 카운트: Adopt M / Adopt-modified K / Needs User Clarification I / Out-of-contract J
- 수정 파일 목록 + 어떤 finding을 어떻게 해소했는지
- 회귀 테스트: 추가 N건 / 면제 M건(사유) / 작성 불가 K건(사유)
- `Needs User Clarification` 항목 + 사용자에게 필요한 정보(있으면)
- `Out-of-contract` 항목 + 원장 등재 결과(있으면)
- AC acceptance 무효화: N건(AC-N 목록)
- 삭제한 report (ADR-067 D1 item 4 (d)): <task-id 목록> / 해당없음
- 동일 패턴 전수 검색: 범위 내 N건 / 범위 밖 M건(경로)
- `## 5. Repair decision log` append 줄 수 / status resolved 토글 수 / 삭제·보존한 세션 파일
- **커밋 안내**: 본 skill은 커밋하지 않는다 — 위 수정 파일과 문서를 **사용자가 직접 커밋한 뒤** 다음 단계로 진행한다. 미커밋으로 두면 후속 `/finalize-workitem`이 범위 밖 변경으로 보고 `Needs Review`로 멈춘다.
- **재validate 필요 task 목록 (의무)**: 본 라운드가 코드를 고친 task와 `- invalidated`를 append한 task 전부를 나열하고 **각 task `/validate-workitem <task-id>` 재실행이 선행돼야 졸업 판정이 유효함**을 명시한다. 졸업 item 4 (d)가 report staleness를 보므로, 재실행 없이 stabilize를 돌리면 그 task는 미충족으로 나온다(반대로 이 항이 없으면 낡은 `Pass` report로 졸업하는 경로가 열린다).
- 후속 권장 (순서 고정): ① 위 목록의 task별 `/validate-workitem <task-id>` 재실행 → ② `/accept-milestone <M>` 재실행(사용자 재확인 — 무효화된 관측 AC의 receipt 재발급 포함) → ③ 그 다음은 `/accept-milestone`의 출력이 지시하는 순서를 따른다(**재발급으로 `## 8`이 또 바뀌므로 stabilize 전에 한 번 더 재validate가 필요하다**).

정책 근거: [ADR-066](../../../docs/90-decisions/boilerplate/ADR-066-milestone-acceptance.md) D4/D5, [ADR-065](../../../docs/90-decisions/boilerplate/ADR-065-ac-verification-contract.md) D3, [ADR-047](../../../docs/90-decisions/boilerplate/ADR-047-code-as-agent-harness.md) D7, [ADR-060](../../../docs/90-decisions/boilerplate/ADR-060-decision-closure-and-milestone-seal.md) D11.

## Context 정책 (ADR-019)
세션 파일 + 대상 task의 `## 6-1`·`## 8`이 *최소 충분* 회수 목록이다 — 사전 fork-load 금지. 원장의 `(수용)` 항목, 수리 대상 코드·테스트, `수행 5`의 패턴 검색 범위는 본문 지시대로 그때 추가로 읽는다.
