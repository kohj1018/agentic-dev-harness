---
name: repair-workitem
description: Apply fixes for failed validation report items, scoped to the documented workitem.
argument-hint: "[task id] [optional notes]"
allowed-tools: Read Glob Grep Write Edit Bash
---

이 skill은 직전 `/validate-workitem`이 남긴 report의 실패 항목을 **비판적으로 재점검**한 뒤, 진짜 결함만 수정한다. 메인 세션에서 실행되므로 풀 프로젝트 컨텍스트로 판단한다.
**새 기능 추가, 범위 밖 변경, 자동 커밋은 금지한다.**

입력:
- `$ARGUMENTS`에는 task ID와 (선택) 부분 지정 메모가 들어온다.
  - 예: `T-001`
  - 예: `T-001 "P0 #1, P1 #3만"` — report의 일부 항목만 대상
- **task-id sanitization 강제**: `T-[0-9]+` 패턴만 허용. `/`, 공백, glob 메타문자(`*`, `?`, `[`) 포함 시 *즉시 종료*(rm 경로에 들어가므로 안전 전제 — validate-plan `M[0-9]+`/repair-milestone `M[0-9]+` 가드와 대칭).

반드시 먼저 할 일:
1. 관련 task 문서를 읽는다 (`## 6 AC`, `## 8 메모`의 기존 `해석 확정`/repair 결정 이력 포함).
   - **메인 세션 연쇄 실행으로 직전 단계가 같은 task 문서를 메인 컨텍스트에 올렸고 그 뒤 갱신되지 않았으면 `## 6 AC` 재독은 생략**(ADR-019). 단 **이전 repair 라운드가 `## 8. 메모`를 append(mutate)했다면 그 메모는 반드시 재독**한다 — 직전 라운드의 4-판정 이력을 보고 같은 항목 재출현을 판단해야 하므로.
2. `docs/40-validation/reports/<task-id>.md`를 읽는다 (report는 매 validate phase 새로 쓰이므로 **항상 새로 읽는다** — 캐시 대상 아님).
   - 파일이 없거나 stale(파일 mtime이 task 문서/구현 파일보다 오래됨)하면 `/validate-workitem` 선행을 안내하고 종료한다.
   - 파일 판정이 **`Pass` 또는 `Pending Acceptance`**(ADR-065 D6)면 `/finalize-workitem`을 안내하고 종료한다(repair 대상 없음). **`Pending Acceptance`는 «사람이 볼 것만 남았다»는 뜻이라 코드로 고칠 것이 없다** — `/accept-milestone <M>`으로 보내지도 않는다(그것은 마일스톤 층 단계다).
   - **실패 항목이 전부 `[P0] 감사 미완(unavailable)`이면 즉시 종료한다** — 코드로 고칠 것이 없으므로 4-판정에 들어가지 않고 `/validate-workitem <task-id>` 재실행을 안내한 뒤 종료한다(report를 삭제하지 않는다). **다른 실패 항목이 섞여 있으면** 이 가드에 걸리지 않고 정상 진행하되, `감사 미완` 항목은 4-판정 대상에서 제외한다.
   - **단, 인자에 finding 요약(`/repair-milestone`·`/repair-acceptance`가 per-task 결함을 위임할 때 넘기는 "<finding>")이 있으면 위 종료 조건 전부에 걸리지 않고 그 finding을 대상으로 진행한다(finding-mode)** — 즉 report가 `Pass`·`Pending Acceptance`·**stale**·부재여도, 실패 항목이 전부 감사 미완이어도 종료하지 않는다. **`stale`을 여기 명시하는 것이 중요하다** — 위임하는 skill이 이미 다른 파일을 고친 상태로 부르므로 report는 stale인 것이 정상이고, 앞의 stale 가드가 먼저 걸리면 위임 연쇄가 **첫 고리에서 죽는다.** 아래 "비판적 재점검"을 그 finding에 적용해 코드를 수정하고 task `## 8. 메모`에 결정 이력을 남긴다. finding-mode에서는 (a) `Pass`·`Pending Acceptance` report를 삭제하지 않고(실패 report가 아님), (b) QA_FINDINGS·IMPROVEMENT_GUIDE는 건드리지 않으며(status 종료는 위임한 skill 책임 — 본 skill의 "다른 산출물 미접근" 계약 유지), (c) 마지막 출력에 "/validate-workitem <task-id> 재실행으로 수정 확인" 안내를 포함한다. **위임한 skill이 그 재실행과 이어지는 `/finalize-workitem`까지 자기 루프 안에서 실행하므로, 사용자에게 수동 실행을 요구하지 않는다.**
2-G. **상태별 입구 게이트 (`done` 재개방 — 유일한 역전이·writer 고정, ADR-057#amend-3 결정 5)**: task `## 0. Status`를 확인한다. `draft`/`ready`(아직 구현 전)면 repair를 거부하고 "먼저 `/implement-workitem`으로 착수" 안내 후 종료. `in-progress`면 상태를 쓰지 않는 일반 repair로 계속한다. `done`이면 **report(또는 위 finding-mode 근거)가 검증된 결함을 가리킬 때만** 아래 "수행"의 done 재개방 절차를 따른다 — `/repair-workitem`만이 `done` task를 재개방하는 유일한 writer다. `/repair-milestone`은 ADR-052 D4대로 status를 직접 쓰지 않고 per-task 결함을 본 skill로 위임한다.
3. 사용자가 인자로 부분 지정을 줬으면 그 부분만 대상으로 한다.
4. 실패 항목을 우선순위(P0 > P1 > P2)로 정렬한다.

비판적 재점검 (수정 *전* 1회 — validator가 틀리거나 맥락을 놓쳤을 수 있다):
각 실패 항목마다 *실제 코드·문서·task AC를 직접 확인*해 4가지 중 하나로 판정하고 한 줄 근거를 남긴다 (repair-plan과 동형):
- **Adopt** — 진짜 결함. report 제안대로 수정.
- **Adopt-modified** — 결함은 맞지만 더 나은 방식으로 수정 (다른 수정 + 사유).
- **Reject-false-positive** — validator가 잘못 봄 (예: 이미 충족됨 / 자연어 매핑 휴리스틱 오탐 / placeholder 오인). 수정하지 않는다.
- **Reject-context** — validator가 task 범위·상위 제약을 놓침 (예: task `## 4. 제외 항목`·charter 비목표상 의도된 동작). 수정하지 않는다.
> 자기 판단을 신뢰하되, 애매하면 Adopt 쪽으로 보수적으로. Reject는 *근거가 코드/문서로 확인될 때만*.

수행:
1. Adopt / Adopt-modified 항목을 우선순위(P0 > P1 > P2) 순으로 수정한다. **대상 task가 `done`이었던 경우**: Adopt/Adopt-modified가 하나 이상이면 **첫 코드 수정 직전에** task `## 0. Status`를 `done → in-progress`로 갱신·기록한다(전부 Reject면 코드·status 무변경). 재개방 뒤 이 라운드가 중단되거나 실패하면 `in-progress`로 유지한다(임의로 `done`으로 되돌리지 않음) — 수정 완료 후 fresh `/validate-workitem` Pass를 거쳐 `/finalize-workitem`이 다시 `done`으로 커밋한다.
2. **한 라운드에 P0/P1/P2를 *모두* 4-판정으로 완결**한다(repair-plan과 동형). report를 삭제하므로 defer 금지 — 미처리 항목을 남기면 삭제 시 정보가 사라진다. 작업량을 줄이려면 사용자가 인자로 부분 범위를 지정한다(`T-001 "P0 #1, P1 #3만"`).
2-E. **실행 증거 갱신 (ADR-064 D4 — 외부 경계 코드를 고쳤을 때만)**: 본 라운드의 Adopt/Adopt-modified 수정이 (a) 영속 저장소 쓰기 · (b) 외부 네트워크 호출 · (c) 실행 진입점 코드를 건드렸으면, **그 경계의 실행 증거를 다시 확보하고 task `## 8`에 `- exec-evidence` 줄을 새로 append한다**(기존 줄은 지우지 않는다 — 이력이다). 증거 등급·안전 규정·waiver 규정은 implement 6-E와 동일하다. 확보하지 못하면 `Needs Execution Evidence: <경계 종류> — <사유>`를 출력에 남긴다. **등급 1 증거로 새 파일을 만들었으면 task `## 4-1`에도 그 경로를 추가한다**(finalize 의 add 목록 누락 방지 — 본 skill 은 단독 실행이라 `## 4-1` 단일 writer 규율과 충돌하지 않는다).
   **이 책임이 repair에 있는 이유**: receipt writer를 implement 단독으로 두면 `validate(Needs Fix) → repair(코드 수정) → 재validate` 에서 증거가 낡은 채 남고 그것을 갱신할 주체가 없어 루프가 닫힌다. 코드를 고친 주체가 그 자리에서 증거를 갱신하는 것이 이 계약의 신선도 유지 방식이다.
   본 skill이 `## 8`에 쓰는 시점은 `/validate-workitem` 재실행 *이전*이고 아래 4에서 report를 삭제하므로, task 문서 mtime 갱신이 report를 stale로 만드는 문제는 발생하지 않는다.

2-F. **AC acceptance 무효화 (ADR-065 D3)**: 본 라운드의 Adopt/Adopt-modified 수정이 어떤 AC의 동작 경로를 건드렸고 그 AC의 modality가 `[사용자 관측]`·`[플랫폼 관측]`이면, task `## 8`에 `- invalidated <날짜> <AC-N>: repair-workitem 수정으로 재확인 필요` 한 줄을 append한다(기존 `- ac-acceptance` 줄은 지우지 않는다 — 이력이다). 그 AC는 다음 validate에서 미충족이 되고 receipt 재발급이 필요하다. **에이전트가 새 receipt를 쓰지 않는다.**

2-H. **동일 패턴 전수 검색 (ADR-066 D6)**: Adopt/Adopt-modified한 각 결함에 대해 **같은 패턴의 다른 출현을 저장소 전체에서 읽기 전용으로 검색**한다(Grep). 결과를 task `## 8`에 `- pattern-scan <날짜> <패턴 1줄>: 범위 내 N건 수정 / 범위 밖 M건 <경로 목록>`으로 append하고 마지막 출력에도 한 줄 남긴다. **범위 밖 출현은 고치지 않는다**(task 범위 계약 유지 — 읽기는 범위 제한 대상이 아니다). 범위 밖 항목은 `/stabilize-milestone`·`/repair-milestone`이 회수한다. 검색으로 아무것도 안 나왔으면 `범위 밖 0건`으로 적는다(검색 사실 자체가 기록이다).

3. **결정 이력 영속화 (ADR-047 D7)** — 본 라운드의 P0/P1 항목 전부에 대해 task 문서 `## 8. 메모`에 한 줄씩 append(P2는 cap 보호로 미영속):
   `- repair-workitem <YYYY-MM-DD> <severity> <category>: <Adopt|Adopt-modified|Reject-FP|Reject-context> — <근거 ≤80자>`
   (P0/P1은 Adopt·Reject 모두 기록 — 다음 validate가 같은 항목을 다시 올릴 때 사람이 판단 이력을 본다. P2는 미영속 — 재출현해도 finalize의 AC 게이트를 막지 않아 무해.)
4. **report 삭제** — 대상 항목 *전부*(P0/P1/P2)를 수정 또는 Reject로 완결한 뒤 삭제한다. **`감사 미완(unavailable)` 항목이 남아 있어도 삭제한다** — 그것은 미처리가 아니라 재validate로만 해소되는 항목이라 삭제가 오히려 정확한 처방이다. 사용자가 인자로 **부분 범위를 지정해** 진짜 결함이 미처리로 남은 경우에만 삭제하지 않는다:
   - **삭제 전 echo 강제**: 메인 세션 출력에 삭제 대상 경로를 명시 (예: `삭제 예정: docs/40-validation/reports/T-001.md`) — 사용자가 눈으로 확인.
   - `rm docs/40-validation/reports/<task-id>.md` 1개를 정확히 삭제한다 (다른 task의 report는 건드리지 않는다).
   - 삭제 후, 다음 `/validate-workitem <task-id>`가 새 report를 생성한다는 안내를 출력에 포함.

5. **자체 검증 — 즉시 파손 감지 (위 1~4를 전부 마친 뒤 1회)**: 통합 검증 명령이 `--changed`를 지원하면 `validate --changed`를 1회 실행한다. **이것은 전체 검증이 아니다** — 「방금 한 수정이 즉시 깨졌는가」만 본다. full validate·AC 스코프 정합·diff 추적성은 `/validate-workitem` 책임이다.
   - **고치는 대상은 본 라운드 수정이 만든 실패로 한정한다.** baseline은 report의 `## 통합 명령 실행 결과` 섹션 값이며, **위 「반드시 먼저 할 일 2」에서 report를 읽을 때 그 값을 메모리에 보관해 둔다**(4에서 report를 삭제하므로 여기서 다시 읽을 수 없다 — 경로·값을 미리 회수하는 기존 규율과 동형). baseline에 이미 있던 실패는 고치지 않고 출력에 명시한다.
   - 실패를 고치면 다시 실행한다. **최대 3회.** 초과하면 `Needs Follow-up: <실패 목록>`으로 출력에 명시하고 종료한다(조용히 넘기지 않는다).
   - **`--changed` 미지원이거나 통합 명령이 없으면 이 단계를 skip한다** — 별도 hardstop을 만들지 않는다(`/validate-workitem`이 받는다). skip 사유를 출력에 한 줄 남긴다.

## 봉인 후 새 결정 등재 (ADR-060 D11)
수정 중 *기존 task·AC가 약속하지 않은* 기획 결정이 새로 드러나면(사용자가 정하거나 승인해야 할 것), 임의로 확정하지 말고 `docs/10-charter/DECISION_REGISTER.md`에 `status: open` + `- 발견: 봉인 후 (M<N>)` 줄로 등재하고 사용자에게 보고한다. **이 등재는 착수·구현을 막지 않는다** — 라우팅은 (a) 기존 약속 결함이면 본 skill이 계속 수정, (b) 새 범위면 다음 마일스톤 후보, (c) 불명확하면 사용자 결정 대기(ADR-057#amend-3 결정 6). 원장 파일이 없으면 등재를 건너뛰고 보고만 한다.

책임 경계:
- 새 기능을 추가하지 않는다.
- task 범위 밖 파일을 수정하지 않는다.
- 자동 커밋하지 않는다 — 결과만 반환하고 커밋은 `/finalize-workitem` 또는 사용자가 별도로.
- 본 task-id의 report만 삭제. 다른 산출물(QA_FINDINGS / IMPROVEMENT_GUIDE / 다른 report)은 건드리지 않는다. **예외 1가지**: 위 `## 봉인 후 새 결정 등재`의 `docs/10-charter/DECISION_REGISTER.md` **append**(`status: open` + `- 발견: 봉인 후 (M<N>)`) — ADR-060 D11 writer로 지정된 책임이며, 기존 항목의 상태는 바꾸지 않는다.

마지막 출력:
- 4-판정 카운트: Adopted M / Adopt-modified K / Reject-FP I / Reject-context J
- 수정 파일 목록 + 어떤 실패 항목을 어떻게 해소했는지
- Reject한 항목 + 근거 (있으면)
- `## 8. 메모` append 줄 수
- 삭제한 report 경로
- 미해결 항목 (있으면)
- 실행 증거 갱신 (ADR-064 D4): 갱신 N건(경계 종류) / 해당없음(외부 경계 코드 미수정) / `Needs Execution Evidence`
- AC acceptance 무효화 (ADR-065 D3): N건(AC-N 목록) / 해당없음
- 동일 패턴 전수 검색: 범위 내 N건 / 범위 밖 M건(경로) — 범위 밖은 미수정
- 자체 검증 (즉시 파손 감지): pass / skip(사유) / `Needs Follow-up: <목록>`
- 다음 권장 액션: `/validate-workitem <task-id>` 재실행 (새 report 생성 → `Pass`·`Pending Acceptance`면 `/finalize-workitem`)

정책 근거: 비판적 재점검·전 severity 완결·report 삭제는 [ADR-050](../../../docs/90-decisions/boilerplate/ADR-050-main-session-lifecycle-skills.md) D3 / repair-plan(ADR-038) 대칭. 결정 이력 영속은 ADR-047 D7. 동일 패턴 전수 검색은 [ADR-066](../../../docs/90-decisions/boilerplate/ADR-066-milestone-acceptance.md) D6. 판정값 3종은 [ADR-065](../../../docs/90-decisions/boilerplate/ADR-065-ac-verification-contract.md) D6.

## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 ADR/architecture 섹션은 task 본문에서 발화 시 인용 — 사전 fork-load 금지.
메인 세션 연쇄 실행(validate→repair, ADR-050) 시 직전 단계가 메인 컨텍스트에 올린 task `## 6 AC`는 *갱신되지 않았으면 재독 생략*. 단 직전 repair 라운드가 mutate한 `## 8. 메모`와 매 phase 새로 쓰이는 report는 항상 재독.
