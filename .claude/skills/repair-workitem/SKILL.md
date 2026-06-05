---
name: repair-workitem
description: Apply fixes for failed validation report items, scoped to the documented workitem.
argument-hint: "[task id] [optional notes]"
allowed-tools: Read Glob Grep Write Edit Bash
context-pack: minimal
---

이 skill은 직전 `/validate-workitem`이 남긴 report의 실패 항목만 수정한다.
**새 기능 추가, 범위 밖 변경, 자동 커밋은 금지한다.**

입력:
- `$ARGUMENTS`에는 task ID와 (선택) 부분 지정 메모가 들어온다.
  - 예: `T-001`
  - 예: `T-001 "P0 #1, P1 #3만"` — report의 일부 항목만 수정

반드시 먼저 할 일:
1. 관련 task 문서를 읽는다.
2. `docs/40-validation/reports/<task-id>.md`를 읽는다.
   - 파일이 없거나 stale(파일 mtime이 task 문서의 변경보다 오래됨)하면, 사용자에게 `/validate-workitem` 선행을 안내하고 종료한다.
   - 파일이 `Pass`이면 `/finalize-workitem`을 안내하고 종료한다(repair 대상 없음).
3. 사용자가 인자로 부분 지정을 줬으면 그 부분만 대상으로 한다.
4. 실패 항목을 우선순위(P0 > P1 > P2)로 정렬한다.

수행:
1. 우선순위 순으로 실패 항목을 수정한다.
2. 한 라운드에는 P0/P1만 처리하고 P2 이하는 다음 라운드로 추천한다(가능하면).

책임 경계:
- 새 기능을 추가하지 않는다.
- task 범위 밖 파일을 수정하지 않는다.
- 자동 커밋하지 않는다 — 결과만 반환하고 커밋은 `/finalize-workitem` 또는 사용자가 별도로.

마지막 출력:
- 수정 파일 목록
- 어떤 실패 항목을 어떻게 해소했는지
- 미해결 항목 (있으면)
- 다음 권장 액션 (보통 `/validate-workitem <task-id>` 재실행)

## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 ADR/architecture 섹션은 task 본문에서 발화 시 인용 — 사전 fork-load 금지.
