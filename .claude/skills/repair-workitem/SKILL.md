---
name: repair-workitem
description: Apply fixes for failed validation report items, scoped to the documented workitem.
argument-hint: "[task id] [optional notes]"
allowed-tools: Read Glob Grep Write Edit Bash
context-pack: minimal
---

이 skill은 직전 `/validate-workitem`이 남긴 report의 실패 항목을 **비판적으로 재점검**한 뒤, 진짜 결함만 수정한다. 메인 세션에서 실행되므로 풀 프로젝트 컨텍스트로 판단한다.
**새 기능 추가, 범위 밖 변경, 자동 커밋은 금지한다.**

입력:
- `$ARGUMENTS`에는 task ID와 (선택) 부분 지정 메모가 들어온다.
  - 예: `T-001`
  - 예: `T-001 "P0 #1, P1 #3만"` — report의 일부 항목만 대상

반드시 먼저 할 일:
1. 관련 task 문서를 읽는다 (`## 6 AC`, `## 8 메모`의 기존 `해석 확정`/repair 결정 이력 포함).
2. `docs/40-validation/reports/<task-id>.md`를 읽는다.
   - 파일이 없거나 stale(파일 mtime이 task 문서/구현 파일보다 오래됨)하면 `/validate-workitem` 선행을 안내하고 종료한다.
   - 파일이 `Pass`이면 `/finalize-workitem`을 안내하고 종료한다(repair 대상 없음).
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
1. Adopt / Adopt-modified 항목을 우선순위(P0 > P1 > P2) 순으로 수정한다.
2. **한 라운드에 P0/P1/P2를 *모두* 4-판정으로 완결**한다(repair-plan과 동형). report를 삭제하므로 defer 금지 — 미처리 항목을 남기면 삭제 시 정보가 사라진다. 작업량을 줄이려면 사용자가 인자로 부분 범위를 지정한다(`T-001 "P0 #1, P1 #3만"`).
3. **결정 이력 영속화 (ADR-047 D7)** — 본 라운드의 P0/P1 항목 전부에 대해 task 문서 `## 8. 메모`에 한 줄씩 append(P2는 cap 보호로 미영속):
   `- repair-workitem <YYYY-MM-DD> <severity> <category>: <Adopt|Adopt-modified|Reject-FP|Reject-context> — <근거 ≤80자>`
   (P0/P1은 Adopt·Reject 모두 기록 — 다음 validate가 같은 항목을 다시 올릴 때 사람이 판단 이력을 본다. P2는 미영속 — 재출현해도 finalize의 AC 게이트를 막지 않아 무해.)
4. **report 삭제** — 대상 항목 *전부*(P0/P1/P2)를 수정 또는 Reject로 완결한 뒤(미처리 항목이 남아 있으면 삭제하지 않는다):
   - **삭제 전 echo 강제**: 메인 세션 출력에 삭제 대상 경로를 명시 (예: `삭제 예정: docs/40-validation/reports/T-001.md`) — 사용자가 눈으로 확인.
   - `rm docs/40-validation/reports/<task-id>.md` 1개를 정확히 삭제한다 (다른 task의 report는 건드리지 않는다).
   - 삭제 후, 다음 `/validate-workitem <task-id>`가 새 report를 생성한다는 안내를 출력에 포함.

책임 경계:
- 새 기능을 추가하지 않는다.
- task 범위 밖 파일을 수정하지 않는다.
- 자동 커밋하지 않는다 — 결과만 반환하고 커밋은 `/finalize-workitem` 또는 사용자가 별도로.
- 본 task-id의 report만 삭제. 다른 산출물(QA_FINDINGS / IMPROVEMENT_GUIDE / 다른 report)은 건드리지 않는다.

마지막 출력:
- 4-판정 카운트: Adopted M / Adopt-modified K / Reject-FP I / Reject-context J
- 수정 파일 목록 + 어떤 실패 항목을 어떻게 해소했는지
- Reject한 항목 + 근거 (있으면)
- `## 8. 메모` append 줄 수
- 삭제한 report 경로
- 미해결 항목 (있으면)
- 다음 권장 액션: `/validate-workitem <task-id>` 재실행 (새 report 생성 → Pass면 `/finalize-workitem`)

정책 근거: 비판적 재점검·전 severity 완결·report 삭제는 [ADR-050](../../../docs/90-decisions/boilerplate/ADR-050-main-session-lifecycle-skills.md) D3 / repair-plan(ADR-038) 대칭. 결정 이력 영속은 ADR-047 D7.

## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 ADR/architecture 섹션은 task 본문에서 발화 시 인용 — 사전 fork-load 금지.
