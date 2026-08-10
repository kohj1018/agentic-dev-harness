---
name: repair-milestone
description: Critically recheck milestone-level QA/improvement findings and fix real cross-cutting defects (code change allowed). Route per-task fixes to /repair-workitem.
argument-hint: "[milestone id] [optional notes]"
disable-model-invocation: true
allowed-tools: Read Glob Grep Write Edit Bash Agent
---

이 skill은 `/stabilize-milestone`이 누적 기록한 milestone-level finding을 **비판적으로 재점검**한 뒤, 진짜 결함만 수정한다. 메인 세션에서 실행되므로 풀 프로젝트 컨텍스트로 판단한다.
**stabilize와 달리 코드 수정이 명시적으로 허용된다** — 단, 새 기능 추가·milestone 범위 밖 변경·자동 커밋은 금지한다.

`disable-model-invocation: true` — stabilize와 동일하게 사용자가 명시적으로 `/repair-milestone <M-N>`을 호출할 때만 실행한다(파괴적·광범위 수정 권한이라 묵시 트리거 차단).

**Codex: 서브에이전트는 GA이나 본 저장소가 Claude persona 위임을 Codex subagent로 아직 매핑하지 않아 순차 단일 실행으로 degrade** — 아래 cross-cutting 처리 단계의 `/repair-workitem` 병렬 라우팅·복수 task 동시 수정은 (현재) Claude 전용 배선. Codex는 task를 한 개씩 순차로 `$repair-workitem`에 위임한다.

입력:
- `$ARGUMENTS`에는 milestone ID와 (선택) 부분 지정 메모가 들어온다.
  - 예: `M1`
  - 예: `M1 "P0만, doc-consistency 먼저"` — 일부 severity/카테고리만 대상
- **milestone-id sanitization 강제**: `M[0-9]+` 패턴만 허용. `/`, 공백, glob 메타문자(`*`, `?`, `[`) 포함 시 *즉시 종료* (repair-plan과 동형 — 본 skill은 ID로 QA_FINDINGS/IMPROVEMENT_GUIDE의 `## M-N` / `### M-N` 헤더를 grep하므로 안전 전제).

반드시 먼저 할 일:
1. milestone 문서를 읽고 포함된 feature/task 목록을 회수한다 (`## 8. 회고`의 기존 repair 결정 이력 맥락 포함).
2. `docs/40-validation/QA_FINDINGS.md`의 본 milestone 헤더(`## M-N`) 아래 `### P0` / `### P1` / `### P2` 항목을 회수한다. **다른 마일스톤 헤더의 미해소(`status`≠`resolved`) P0/P1은 색인 스캔만 하고 — 본 skill은 본 milestone만 수정(책임 경계) — 고치지 말고 `carry-over 미해결: M-X → /repair-milestone M-X 권장`으로 flag한다**(index-first recall — 본 milestone 헤더로만 자르면 carry-over 누락). *IMPROVEMENT_GUIDE 회수(step 3)도 다른 마일스톤 `### M-X` 미해소 P0/P1을 동일 기준으로 색인 스캔·flag(대칭).*
3. `docs/40-validation/IMPROVEMENT_GUIDE.md`의 본 milestone sub-section(`### M-N` 그룹)에서 `status: open` 항목을 회수한다 — `## 2. 즉시 수정할 항목` / `## 3. 권장 리팩토링` 안의 그룹. **`## 5. Repair decision log`는 회수 대상 아님** (closed records — 이미 지나간 판단).
3-1. `IMPROVEMENT_GUIDE.md`의 `P1 [Pattern-spread]` 항목을 회수한다 — 이는 `/repair-workitem`·`/repair-acceptance`가 task 범위 밖이라 고치지 못한 **동일 패턴의 다른 출현**이다. cross-cutting 결함으로 취급해 4-판정 후 직접 수정하거나(범위 내), 새 범위면 사용자 보고 + 다음 M 후보로 남긴다. 해소하면 그 ID의 `status`를 `resolved`로 토글한다(수행 5와 동일 경로 — 그러면 stabilize가 재등재하지 않는다).
3-2. **`(수용)` 태그 항목은 본 skill의 수정 대상이 아니다 (ADR-066 D5)**: `QA_FINDINGS.md`·`IMPROVEMENT_GUIDE.md`에서 `(수용)` 태그가 붙은 항목은 **사용자 관측이 우선 authority**이므로 `/repair-acceptance`가 처리한다. 본 skill은 그 항목을 4-판정하지 않고, `/repair-acceptance`가 이미 해소한 항목이면 `status: resolved` 토글만 수행한다(미해소면 그대로 두고 출력에 `수용 finding 미처리 — /repair-acceptance <M> 필요` 한 줄).
4. `docs/40-validation/stabilize-reviews/<M>.*.md` glob으로 peer 리뷰 파일 회수(경로 목록 메모리 보관 — 삭제 시 재glob 금지). (ADR-054 — cross-LLM stabilize 리뷰 종합)
   - QA_FINDINGS `## M-N`도 IMPROVEMENT_GUIDE `### M-N`도 *그리고 stabilize-reviews 파일*도 모두 비어 있으면 *"수정 대상 finding 없음 — 다른 세션에서 `/stabilize-milestone <M-N>`을 먼저 실행하세요. (다른 세션·worktree에서 `/validate-milestone`를 돌렸다면 그 리뷰 파일을 이 checkout의 `docs/40-validation/stabilize-reviews/`로 옮긴 뒤 재실행하세요.)"* 안내 후 종료. 문서 수정 금지.
5. 사용자가 인자로 부분 지정을 줬으면 그 부분만 대상으로 한다.
6. 회수한 finding 전부를 우선순위(P0 > P1 > P2)로 정렬한다.

비판적 재점검 (수정 *전* 1회 — stabilize의 qa/reviewer/deterministic preflight가 틀리거나 맥락을 놓쳤을 수 있다):
**peer 리뷰 finding 종합 (ADR-054)**: stabilize-reviews 회수 파일의 finding도 동일 4-판정(Adopt/Adopt-modified/Reject-FP/Reject-context) 처리. **3중 dedup**: (a) 태그 간 동일 finding, (b) peer finding이 이미 QA_FINDINGS/IMPROVEMENT_GUIDE에 기록된 finding, (c) open-item 상태 중복. 동일 `<라벨> <file:line> <증상>` 1건만 남긴다.
각 finding마다 *실제 코드·문서·milestone 완료 기준을 직접 확인*해 4가지 중 하나로 판정하고 한 줄 근거를 남긴다 (repair-workitem과 동형):
- **Adopt** — 진짜 결함. finding 제안대로 수정.
- **Adopt-modified** — 결함은 맞지만 더 나은 방식으로 수정 (다른 수정 + 사유).
- **Reject-false-positive** — stabilize 단계가 잘못 봄 (예: 이미 충족됨 / deterministic preflight 휴리스틱 오탐 / placeholder 오인 / 이미 존재하는 link를 누락이라고 본 경우).
- **Reject-context** — stabilize가 milestone 범위·상위 제약을 놓침 (예: charter `## 5. 비목표`상 의도된 미구현 / ARCH 결정상 정당한 동작).
> 자기 판단을 신뢰하되, 애매하면 Adopt 쪽으로 보수적으로. Reject는 *근거가 코드/문서로 확인될 때만*.

수행:
1. Adopt / Adopt-modified 항목을 우선순위(P0 > P1 > P2) 순으로 처리한다.
2. **라우팅 — finding의 scope에 따라 처리 주체가 다르다**:
   - **per-task 결함** (특정 `T-NNN`에 귀속되는 코드/AC 결함): 직접 고치지 말고 `/repair-workitem <T-NNN> "<finding 요약>"`로 위임한다(repair-workitem이 finding-mode로 report Pass·부재여도 그 finding을 수정 — validate 선행 불요). 위임 반영 후 해당 finding의 QA_FINDINGS/IMPROVEMENT_GUIDE status는 수행 5(원본 finding status 갱신)에서 resolved로 닫는다. (Codex: 서브에이전트는 GA이나 본 저장소가 Claude persona 위임을 Codex subagent로 아직 매핑하지 않아 task별로 순차 단일 실행.)
   - **cross-cutting 결함** (단일 task에 귀속되지 않는 milestone-level 결함): 본 skill이 **직접 수정**한다. 대표 3종:
     - **doc-consistency finding** (예: deterministic preflight가 올린 `[Doc-link]`/`[ADR-ref]`/`[Spec-gap]`/`[Arch-iface-violation]`): 해당 문서·매핑표를 직접 수정.
     - **e2e wiring scaffold/install** (E2E 미정의 스택에 재현 케이스를 영속 테스트로 묶는 scaffold, `validate:e2e` 배선, 의존성 install): 직접 scaffold·install.
     - **architecture debt** (layer 경계·의존성 규칙 위반 등 ARCH 정합 결함): **현재 M 약속(기존 task·AC) 위반이면 본 라운드 cross-cutting repair로 직접 수정**하고, 구조 변경이 커서 *새 범위*가 되면 architect 호출을 텍스트로 제안하며 **사용자에게 보고 + 다음 M 후보**로 남긴다(현재 M에 새 task를 제안하지 않는다 — 과대 수정 금지, ADR-057#amend-3 결정 6).

2-A. **영향 task report 무효화 (ADR-067 D1 item 4 (d) 보완)**: 본 라운드의 cross-cutting 직접 수정이 어떤 task의 **산출물 동작 또는 validate 입력 계약**(ARCH `## 7-x` 인터페이스 결정·FAC↔AC 매핑·DESIGN 계약 등 — report의 축 판정이 그 문서를 근거로 산출된다)을 바꿨으면, 그 task의 `docs/40-validation/reports/<task-id>.md`를 **삭제한다**(`/repair-workitem`의 report 삭제 규율과 동형 — **삭제 전 `삭제 예정: <경로>` echo 강제**, 경로를 미리 회수해 하나씩 `rm`). 수정 파일이 `## 4-1`에 없어 mtime 비교로는 잡히지 않으므로, report 부재(=졸업 item 4 미충족)로 만들어 **재validate를 강제**하는 것이 유일한 경로다. 마지막 출력에 삭제한 report 목록과 `/validate-workitem <task-id>` 재실행 안내를 남긴다.

2-B. **AC acceptance 무효화 (ADR-065 D3 — writer 3종 중 하나)**: 그 수정이 어떤 AC의 동작 경로를 건드렸고 그 AC의 modality가 `[사용자 관측]`·`[플랫폼 관측]`이면 그 task `## 8`에 `- invalidated <날짜> <AC-N>: repair-milestone cross-cutting 수정으로 재확인 필요`를 append한다(기존 `- ac-acceptance`는 지우지 않는다 — 이력이다). **새 receipt를 대신 쓰지 않는다**(사용자 authority).

3. **한 라운드에 P0/P1/P2를 *모두* 4-판정으로 완결**한다(repair-plan/repair-workitem과 동형). defer 금지 — 4결정 카테고리 외의 deferred drop은 허용 X. 작업량을 줄이려면 사용자가 인자로 부분 범위를 지정한다(`M1 "P0만"`).
4. **결정 이력 영속화 (ADR-047 D7 durable correction history + D1 inspectability)** — 본 라운드의 P0/P1 항목 전부를 `docs/40-validation/IMPROVEMENT_GUIDE.md`의 `## 5. Repair decision log` 안 `### M-N` 그룹(없으면 신설)에 IMPROVEMENT_GUIDE 스키마로 append. P2는 영속화 X (cap 보호 — 재출현해도 milestone 졸업 게이트를 막지 않아 무해).

   **영속 형식** (IMPROVEMENT_GUIDE `## 항목 스키마` SSOT 정합):
   ```
   - **M1-repair-1** | P0 | [관측됨] | linked: M1 | status: applied | decision: Adopt
     - 발견 (stabilize <surface>): <한 줄 설명>.
     - 결정: <Adopt|Adopt-modified|Reject-FP|Reject-context 사유 한 줄>.
   ```
   ID 컨벤션: `<milestone-id>-repair-<N>` (예: `M1-repair-1`, `M1-repair-2`) — milestone ID 그대로 prefix + `-repair-` + 본 라운드 시퀀스. `linked` 필드로 원본 milestone 역참조. **evidence label은 기본 `[관측됨]`** (finding 자체가 stabilize의 *로컬 문서/코드 관측*에서 나옴). per-task 위임 결과는 해당 task `## 8. 메모`에 `/repair-workitem`이 직접 append하므로 *여기 중복 기록 X* — 본 `## 5`에는 cross-cutting 결정과 "T-NNN으로 위임함" 한 줄 routing 기록만 둔다.

5. **원본 finding status 갱신** — Adopt/Adopt-modified로 해소한 IMPROVEMENT_GUIDE `### M-N`의 open 항목은 `status: open` → `status: resolved`로 갱신(closed records인 `## 5`로 옮기지 않고 *open 항목의 status만* 토글 — open items와 closed records의 의미 분리 유지). QA_FINDINGS `## M-N`의 해소된 항목도 동일하게 `status: resolved` 표기.
6. **stabilize-reviews 파일 삭제 (echo-then-rm, ADR-054)**: 한 파일의 *전 severity finding이 4-판정 완결됐을 때만* 그 파일을 삭제한다 — 부분 범위(`M1 "P0만"` 등)로 미처리 finding이 남은 파일은 *삭제하지 않고 보존*하고 출력에 "미처리 잔존 — 보존: <경로>"를 명시한다(stabilize-reviews는 gitignore된 ephemeral이라 삭제 시 그 안의 peer finding이 어디에도 안 남는다 — repair-workitem report 삭제 가드와 동형). **삭제 전 경로 echo 강제** — `삭제 예정: <경로>` 출력 후 Bash `rm`으로 한 개씩 정확히 삭제. 미리 회수한 경로 목록을 사용(삭제 후 재glob 금지 — 삭제된 파일이 목록에 없는 다른 파일까지 재수집 오인 방지).

책임 경계:
- 새 기능을 추가하지 않는다.
- milestone 범위 밖 파일을 수정하지 않는다.
- 자동 커밋하지 않는다 — 결과만 반환하고 커밋은 사용자/`/finalize-workitem`이 별도로 (ADR-047 D7 — finalize/user가 commit owner).
- workitem `## 0. Status` 를 변경하지 않는다 — status 소유권은 finalize/사용자에 유지(ADR-052 D4 — repair-milestone 는 코드만 수정, commit·status 미수행).
- per-task 코드 결함은 직접 고치지 말고 `/repair-workitem`으로 위임한다 (task scope SSOT 침범 금지). cross-cutting 결함만 직접 수정.
- QA_FINDINGS / IMPROVEMENT_GUIDE에서 본 milestone(`## M-N` / `### M-N`) 외 다른 milestone 그룹은 건드리지 않는다.

마지막 출력:
- 4-판정 카운트: Adopted M / Adopt-modified K / Reject-FP I / Reject-context J
- cross-cutting 직접 수정 파일 목록 + 어떤 finding을 어떻게 해소했는지
- **커밋 안내**: cross-cutting 수정 파일은 repair-milestone 가 *커밋하지 않는다*(ADR-052 D4) — 사용자가 직접 커밋한 뒤 다음 단계로 진행한다. *미커밋 상태로 두면* 후속 task 의 `/finalize-workitem` 이 그 파일을 task `## 4-1` 밖 변경으로 보고 `Needs Review` 로 멈춘다.
- `/repair-workitem`으로 위임한 task 목록 (Codex 순차 degrade 여부 명시)
- Reject한 항목 + 근거 (있으면)
- `## 5. Repair decision log` `### M-N` append 줄 수 (P0+P1 합)
- status: open → resolved 토글한 finding 수
- architect 호출 권장 (architecture debt가 구조 변경을 요할 때)
- 미해결 항목 (있으면)
- 삭제한 report (ADR-067 D1 item 4 (d)): <task-id 목록> — 각 task `/validate-workitem` 재실행 필요 / 해당없음
- AC acceptance 무효화 (ADR-065 D3): N건(AC-N 목록) / 해당없음 — **무효화가 1건 이상이면 순서는 «각 task `/validate-workitem` 재실행 → 그 AC가 관측 receipt 대기로 남으면 `/accept-milestone --task <task-id>`로 receipt 재발급 → 다시 재validate → 그 뒤 stabilize»** 다(receipt 없이 stabilize를 돌리면 item 4 (a)가 그 task를 미충족으로 내어 라운드가 한 번 헛돈다)
- 후속 권장 액션: `/stabilize-milestone <M-N>` 재실행 (수정 반영 후 재검증 → 졸업 가능 = YES면 `/plan-milestone`로 새 마일스톤(M-(N+1))+feature 생성·확정 후 `/plan-workitem M-(N+1)`로 전체 계획)

정책 근거: 비판적 재점검·전 severity 완결은 [ADR-050](../../../docs/90-decisions/boilerplate/ADR-050-main-session-lifecycle-skills.md) D3 / repair-workitem·repair-plan 대칭. milestone 졸업 contract는 [ADR-067](../../../docs/90-decisions/boilerplate/ADR-067-milestone-graduation-v2.md). 결정 이력 영속·commit owner 분리는 [ADR-047](../../../docs/90-decisions/boilerplate/ADR-047-code-as-agent-harness.md) D7. 단순성·범위 추적은 [ADR-006](../../../docs/90-decisions/boilerplate/ADR-006-simplicity-and-architecture.md). repair-milestone 신규 skill 거버넌스: [ADR-052](../../../docs/90-decisions/boilerplate/ADR-052-stack-provisioning-and-e2e-readiness.md) D4.

## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 ADR/architecture 섹션은 finding 본문에서 발화 시 인용 — 사전 fork-load 금지.
