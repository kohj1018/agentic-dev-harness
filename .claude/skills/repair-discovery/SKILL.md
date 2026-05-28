---
name: repair-discovery
description: 원본 세션에서 실행. docs/40-validation/discovery-reviews/*.md 리뷰를 회수해 수용·기각을 판단하고 DISCOVERY.md를 수정한 뒤 리뷰 파일을 삭제한다 (ADR-044).
argument-hint: ""
disable-model-invocation: true
allowed-tools: Read Glob Grep Write Edit Bash(rm docs/40-validation/discovery-reviews/*.md)
context: fork
agent: architect
context-pack: minimal
---

`/validate-discovery`가 만든 임시 리뷰 파일을 모두 회수해 DISCOVERY.md를 수정하는 단계. **charter·코드 수정·커밋 금지.** (ADR-038 `/repair-plan` 패턴의 discovery 층 mirror)

반드시 먼저 할 일:
1. `docs/40-validation/discovery-reviews/DISCOVERY.*.md` glob → **실제 경로 목록을 메모리에 회수**(이후 삭제는 이 목록 기준 — glob 재실행 금지). 0건이면 *"리뷰 파일 없음 — 다른 세션에서 `/validate-discovery` 먼저 실행"* 안내 후 종료(DISCOVERY 수정 금지).
2. `docs/10-charter/DISCOVERY.md`를 읽는다.

수행:
1. 모든 리뷰 파일의 발견을 한 표로(severity / category / 대상 섹션 / 설명 / 제안 / 리뷰어 태그).
2. 각 항목 4결정 중 하나 + 한 줄 근거: **Adopt** / **Adopt-modified** / **Reject-false-positive** / **Reject-conflict**. P0>P1>P2 — **한 라운드에 모두 판정**(defer-drop 금지, ADR-038 정합).
3. 다중 리뷰어 충돌은 architect가 *제품 전략* 기준으로 어느 쪽이 더 정합한지 판단 + 근거 1줄(자동 다수결 X).
4. Adopt/Adopt-modified 항목을 DISCOVERY.md에 반영 — 섹션 구조 유지, §12 Assumption Tracker / §14 Evidence / §15 Insight 정합 유지. **charter는 건드리지 않는다**(DISCOVERY=SSOT; charter sync는 `/bootstrap-project --apply`).
4-D. **P0/P1 결정 이력 영속화** (ADR-047 D7 + D1 정합): 본 라운드의 P0+P1 결정을 DISCOVERY.md `## 12. Assumption Tracker` *표 끝 아래의 보조 단락* `### Repair history`(없으면 신설)에 한 줄씩 append. 형식: `- repair-discovery <YYYY-MM-DD> [<reviewer-tag>] <severity> <category>: <결정> — <근거 ≤80자>`. P2는 영속 X.
5. **삭제 전 echo 강제**: 삭제 대상 경로 목록 전체를 출력에 echo → *step 1에서 회수한 경로*를 한 개씩 `rm`(glob 재실행 X). 모든 경로가 `docs/40-validation/discovery-reviews/DISCOVERY.` 접두 + `.md` 접미인지 마지막 점검.

책임 경계: charter·workitem·코드·다른 산출물 수정 금지. 자동 커밋 금지.

마지막 출력: 처리 리뷰 수 + reviewer-tag 명단 / 결정별 카운트(Adopt·Adopt-modified·Reject-fp·Reject-conflict) / 수정된 DISCOVERY 섹션 / 결정 이력 영속화 (§12 Repair history append 줄 수) / 다중 리뷰어 충돌 결정 근거(있으면) / 삭제된 리뷰 파일 목록 / 다음 권장(`/bootstrap-project --apply`로 charter sync, 또는 `/plan-workitem`).

## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 자료는 발화 시 인용 — 사전 fork-load 금지.
