---
name: repair-plan
description: 원본 plan 세션에서 실행. docs/40-validation/plan-reviews/<workitem-id>.*.md의 모든 리뷰를 회수해 수용·기각을 판단하고 workitem 문서를 수정한 뒤, 아래 성공 조건을 모두 통과한 뒤에만 리뷰 파일을 삭제한다 (ADR-038 / ADR-057#amend-3).
argument-hint: "[milestone or feature or task id]"
disable-model-invocation: true
allowed-tools: Read Glob Grep Write Edit Bash(rm docs/40-validation/plan-reviews/*.md)
---

이 skill은 `/validate-plan`이 생성한 임시 리뷰 파일을 모두 회수해 plan 문서를 수정하는 단계다. **코드 수정·커밋 금지**.

너의 역할: 임시 리뷰 파일 N개의 발견 항목을 종합해 수용 / 기각 / 수정 결정을 내리고, workitem 문서(milestone/feature/task)를 수정한 뒤, 임시 리뷰 파일을 삭제한다.

입력:
- `$ARGUMENTS`에는 milestone / feature / task ID가 들어온다 (예: `M1`, `F-001`, `T-001`).
- **workitem-id sanitization 강제**: `M[0-9]+` / `F-[0-9]+` / `T-[0-9]+` 패턴만 허용. `/`, 공백, glob 메타문자(`*`, `?`, `[`) 포함 시 *즉시 종료* — 본 skill은 ID로 glob 삭제하므로 안전 전제.

반드시 먼저 할 일:
1. 임시 리뷰 파일 회수: `docs/40-validation/plan-reviews/<workitem-id>.*.md` glob.
   - **glob 결과 → 실제 파일 경로 목록을 메모리에 회수.** 이후 *수행 step 6*의 삭제는 이 목록의 각 파일을 한 개씩 정확히 삭제한다 (glob 재실행 금지 — race 차단).
   - 결과 0건: 사용자에게 *"리뷰 파일이 없음 — 다른 세션에서 `/validate-plan <workitem-id>`를 먼저 실행하세요."* 안내 후 종료. workitem 문서 수정 금지.
   - 결과 1건 이상: 모두 읽는다.
2. 입력 ID에 해당하는 workitem 문서 + 모든 하위 문서를 읽는다 (`/validate-plan`과 동일 범위). milestone-plan mode 리뷰(ADR-038#amend-4 — 하위 task 0건의 M/F id)도 동일하게 회수·적용한다(M/F id는 sanitization step에서 이미 처리).
2-S. **봉인 확인 (ADR-060 D6/D7 — 2-L보다 먼저)**: 부모 `M<N>` 문서의 `## 0. Status`와 `## 10. 봉인 기록`을 읽는다.
   - **`contract-ready`(= 미봉인)**: 정상 진입. 아래 2-L 이후 절차를 그대로 수행하고, 4-M/4-D의 계약 수정·원장 쓰기 권한도 이 상태에서만 유효하다.
   - **`ready` + `- 봉인일:` 채워짐 + 구현 흔적 task 0건** (= 봉인은 됐으나 구현 미착수. **구현 흔적** = `in-progress`·`blocked`·`done`·`deprecated` — `blocked`/`deprecated`도 구현 시작 후 상태다, ADR-060 D12): **task·매핑·의존성 결함은 그 자리에서 수정한다.** 잠금의 실익은 *구현 중 계획이 흔들리지 않는 것*인데 구현이 0건이면 그 목적이 걸리지 않는다(ADR-057#amend-3도 "구현이 시작되면 task 계획도 변경하지 않는다"로 *구현 시작*을 기준선으로 삼는다). 수정 후 **`/seal-milestone M<N>` 재실행**을 안내해 receipt를 갱신한다. M/F 계약 층 결함은 여전히 고치지 않고 보고만 한다(다음 M).
     > 이 분기가 없으면 봉인 직후 발견된 계획 결함을 **어떤 skill도 고칠 수 없다** — `repair-workitem` 2-G가 `ready` task repair를 거부하기 때문이다. 그러면 "첫 구현 전 결함을 다음 M으로 보낸다"는, 이 개선이 없애려던 원래 역설이 한 칸 뒤로 옮겨 재현된다.
   - **`ready` + `- 봉인일:` 채워짐 + 구현 흔적 task 1건 이상** (= 구현 시작됨): **계획을 수정하지 않는다.** 회수한 review 파일의 finding을 (i) 사용자에게 보고하고 (ii) **5-D 형식으로 영속**한 뒤(task scope → 해당 task `## 8`, feature/milestone scope → `IMPROVEMENT_GUIDE ## 5. Repair decision log`; 결정 성격이면 원장에 `status: open` + `- 발견: 봉인 후 (M<N>)`) (iii) **review 파일을 삭제**한다. 라우팅은 (a) 기존 task·AC 약속의 결함이면 `/repair-workitem`, (b) 새 범위면 다음 마일스톤(M<N+1>) 후보로 안내.
     > **파일을 반드시 삭제하는 이유**: `/implement-workitem` 착수 게이트 ⑤가 "미해결 review 파일 없음"을 요구한다. 보존하면 봉인 후 `/validate-plan`을 한 번 돌린 것만으로 그 마일스톤의 모든 task가 영구 차단되고, 수동 `rm` 외에 해제 수단이 없다. finding은 위 (ii)로 영속되므로 삭제해도 유실되지 않는다.
   - **`ready`인데 `## 10` 부재·미채움**: 마이그레이션 대상이다(ADR-060 D12). 계획을 수정하지 않고 `/seal-milestone M<N>` 실행을 안내한 뒤 종료한다. review 파일은 보존한다(seal이 조건 8에서 읽는다).
   - `draft`: `/plan-milestone M<N>` 안내 후 종료.

2-L. **부모 M 잠금 확인 (ADR-057#amend-3)**: 입력이 M/F/T 어느 것이든 먼저 부모 `M<N>`을 해석하고 **부모 M 문서 + 산하 전 feature/task**를 읽는다. 부모 M의 task 상태가 하나라도 `draft|ready` 밖(`in-progress`·`blocked`·`done`·`deprecated`)이면 `/repair-plan`은 계획 변경을 거부하고 "구현 시작/종료 상태 — 현재 M 계획 잠금; 새 요구는 다음 M, 현재 계획으로 진행 불가한 근본 문제는 사용자 중단·보고"로 종료한다(F/T 입력으로 M 잠금을 우회 금지). 모든 기존 task가 `draft|ready`일 때만 아래 수행 단계로 진행한다. **단 2-S가 봉인 완료 + 구현 시작(`in-progress`/`done` 1건 이상)으로 판정했으면 전 task가 `ready`여도 계획을 수정하지 않는다(그 경우 `ready`는 "구현 전"이 아니라 "잠김"이다 — ADR-060 D6/D7).**
3. `docs/10-charter/PROJECT_CHARTER.md` `## 5. 비목표` / `## 7. 제약 조건`을 읽는다 (수용 판단 근거).
4. `docs/20-system/ARCHITECTURE_OVERVIEW.md`를 읽는다.

수행:
1. 모든 리뷰 파일의 발견 항목을 한 표로 모은다:
   - 컬럼: severity (P0/P1/P2), category, 대상 (file:section), 설명, 제안 수정, 리뷰어 태그.
2. 각 항목마다 4가지 중 하나의 결정을 내리고 한 줄 근거를 적는다:
   - **Adopt** — 그대로 수용. 제안 수정을 workitem 문서에 적용.
   - **Adopt-modified** — 수용하되 다르게 수정 (한 줄 사유 + 적용된 다른 수정 명시).
   - **Reject-false-positive** — 리뷰어가 잘못 본 경우 (예: 이미 수정됨, 문맥상 정합).
   - **Reject-conflict** — 다른 리뷰어와 반대 의견 + 본 plan이 더 정합 (한 줄 사유 — 어느 리뷰어의 어떤 주장이 본 plan과 정합 안 되는지 명시).
3. 결정 우선순위: P0 > P1 > P2. **한 라운드에 P0 + P1 + P2 모두 판정 + 처리한다** — P2 deferred 자리 신설 X (ADR-038 비결정 정합 — "다음 stabilize 라운드 instruction improvement 후보" 같은 *defer-식 reject 사유는 표면 정합/실질 모순*이므로 금지). P2도 동일하게 4결정 중 하나로 판정: trivially 수용 가능 시 Adopt / Adopt-modified, 리뷰어가 잘못 본 경우(예: 이미 있는 link를 누락이라고 보고) Reject-false-positive, 본 plan이 더 정합한 경우 Reject-conflict. 4결정 카테고리 *외의 deferred drop은 허용 X* — 정직하게 *수용* 또는 *기각*만.
4. **다중 리뷰어 충돌 처리**: 같은 항목에 대해 리뷰어 A는 Adopt 권장, 리뷰어 B는 다른 수정 권장한 경우, 본 skill이 charter / architecture 정합 기준으로 어느 쪽을 더 받아들였는지 결정 + 결정 근거 1줄. 자동 합의 / 다수결 X — *본 skill(메인 세션) 판단 책임* (ADR-007 책임 경계 정합).
4-M. **M/F/prototype 계약 자체 P0 — 봉인 여부로 갈린다 (ADR-060 D6)**: finding이 task·매핑·의존성 결함이 아니라 milestone/feature/prototype *계약 자체*의 근본 결함이면 2-S 판정을 따른다.
   - **`contract-ready`**: 계획이 잠기지 않았으므로 **본 skill이 milestone/feature 문서를 그 자리에서 고친다.** 프로토타입 재승인이 필요한 수정(화면 구성·PX 변경)은 직접 고치지 말고 `/plan-milestone M<N>` 재개를 안내한다(R5 승인 루프가 소유). 수정 후 부모 M 전체 재대조를 다시 통과시키고, **의미가 바뀐 feature 문서에 `- 계약 수정: <YYYY-MM-DD> — 이 feature의 task 재검증 필요` 마커를 남긴다**(ADR-060 D6 stale task 방지 — plan-workitem이 이 마커를 보고 재검증한다). **이것이 본 개선의 요점이다** — 첫 구현 전에 발견한 상위 결함을 다음 마일스톤으로 미루지 않는다.
   - **`ready`(봉인 완료)**: 2-S대로 보고만 한다.
   - **정본 문서(Charter / ARCHITECTURE / DESIGN)는 본 skill이 고치지 않는다** — 저작 소유가 각 bootstrap skill이다(ADR-005 / ADR-058). 변경이 필요하면 `/bootstrap-project --apply`·`/bootstrap-stack`·`/bootstrap-design --update`를 텍스트로 권장하고 원장에 항목을 남긴다.

4-D. **리뷰가 드러낸 미결정 마감 (ADR-060 D1~D4)**: 리뷰 finding이 *결함*이 아니라 **아직 정해지지 않은 사항**(해석 분기·미확정 정책·누락 결정)을 드러내면, 임의로 확정하지 말고:
   1. `docs/10-charter/DECISION_REGISTER.md`에 등재하고 `authority`를 확정한다(D2). **`user-*` 급만 등재한다** — 품질·형식 지적은 기존 4-판정으로 처리한다.
   2. `authority: user-*`면 **Decision Brief 6블록**으로 제시한다(D3 — 라운드당 3~5개). `agent-delegated`면 확정하고 라운드 끝 일괄 확인에 포함한다.
   3. 사용자가 선택하면 `status: closed` + `disposition: chosen` + 정본 앵커를 채우고, **본 skill이 소유한 문서**(milestone / feature / task)를 그에 맞게 수정한다. 정본(Charter/ARCH/DESIGN) 수정이 필요하면 4-M 마지막 불릿대로 소유 skill을 권장한다.
   4. 사용자가 미루면 **현재 M 무영향 근거 + 이관 앵커 + 회수 시점** 3개를 받아 `deferred`로 둔다. 3개를 못 채우면 `open`으로 남기고, 그러면 `/seal-milestone`이 봉인을 거부한다는 사실을 함께 안내한다.
   5. 원장 수정은 본 skill의 **허용 예외**다(아래 책임 경계). 범위는 2-S 판정에 따라 갈린다 — **`contract-ready`**(또는 봉인 후 구현 0건): 등재·`closed` 전환·앵커 채움 등 **전체 갱신** 허용. **봉인 후 구현 시작됨**: 2-S 세 번째 분기의 **`status: open` + `- 발견: 봉인 후 (M<N>)` append만** 허용하고 기존 항목의 상태는 바꾸지 않는다(ADR-060 D11 — 사후 발견을 정직하게 등재하되 잠긴 계획을 되돌리지 않는다).
5. Adopt / Adopt-modified로 결정된 항목에 대해 workitem 문서를 수정. 수정 후에도 양식 정합을 점검 (TEMPLATE의 섹션 번호 유지, FAC↔AC `## 7-1` 매핑 갱신, AC Given-When-Then 형식 유지, feature `## 7-2` invariant 표 갱신(task 재분해로 INV의 관련 task:AC가 바뀌면 동기 — ADR-057 결정 14)). **M이 `contract-ready`이거나, 봉인됐어도 구현이 0건인 동안에는 review의 task·매핑·의존성 결함을 문서에서 직접 수정**하고, 입력 ID의 하위 범위만이 아니라 **부모 M 전체** self-check + `[Plan-dep]`를 다시 통과시킨다(상태는 `ready` 유지). (구현이 시작된 뒤에는 2-S대로 수정하지 않는다 — ADR-060 D6/D7).
5-D. **P0/P1 결정 이력 영속화** (ADR-047 D7 durable correction history + D1 inspectability 정합). 본 라운드의 *P0 + P1 항목 전부*에 대해 결정 요약을 영속한다. P2는 영속화 X (cap 보호).

**영속 위치 — workitem 타입별로 다름** (open items와 closed decision의 의미 분리):
- **task (T-NNN)**: 해당 task 문서 `## 8. 메모`에 1줄 append (`## 8`이 자유 메모란).
- **feature (F-NNN)** 또는 **milestone (M-N)**: `docs/40-validation/IMPROVEMENT_GUIDE.md`의 `## 5. Repair decision log` sub-section(없으면 신설)에 IMPROVEMENT_GUIDE 스키마(`ID | severity | evidence | linked workitem | status | decision`)로 append. **`## 2. 즉시 수정할 항목` / `## 3. 권장 리팩토링`에는 박지 않는다** — 이 둘은 *open items*(해야 할 일)이고 결정 이력은 *closed records*(지나간 판단)라 의미가 다르다. (feature `## 8`은 NFR, milestone `## 8`은 회고 — 결정 이력 위치 아님.)

**task scope 영속 형식 (한 줄 = 한 결정)**:
```
- repair-plan <YYYY-MM-DD> [<reviewer-tag>] <severity> <category>: <Adopt|Adopt-modified|Reject-FP|Reject-conflict> — <한 줄 근거 (≤80자)>
```

예 (task):
```
- repair-plan 2026-05-28 [claude-b] P0 Spec-gap: Adopt — FAC-3 매핑 누락이 charter §5 비목표와 직접 충돌
- repair-plan 2026-05-28 [codex] P1 Plan-design: Reject-FP — 리뷰어가 본 DESIGN.md 이전 버전 참조
```

**feature/milestone scope 영속 형식** (IMPROVEMENT_GUIDE 스키마 정합 — `docs/40-validation/IMPROVEMENT_GUIDE.md` 본문 `## 항목 스키마` SSOT):
```
- **F-001-repair-1** | P0 | [관측됨] | linked: F-001 | status: applied | decision: Adopt
  - 발견 (cross-LLM review <reviewer-tag>): <한 줄 설명>.
  - 결정: <Adopt|Adopt-modified|Reject-FP|Reject-conflict 사유 한 줄>.
```

ID 컨벤션: `<workitem-id>-repair-<N>` (예: `F-001-repair-1`, `M1-repair-2`) — workitem ID 그대로 prefix + `-repair-` + 본 라운드 시퀀스. `linked workitem` 필드로 원본 workitem 역참조. **evidence label은 기본 `[관측됨]`** — finding 자체가 리뷰어의 *로컬 문서 관측*에서 나왔으므로. cross-LLM peer review *방식* 자체의 외부실증은 ADR-038 본문에 박혀 있고, 본 finding의 label과는 별개.
6. **삭제 전 사전 조건 점검 (ADR-057#amend-3)** — 처음 회수한 review 파일은 **(i) 모든 finding 4-판정·반영 완료, (ii) 부모 M 전체 self-check + `[Plan-dep]` 성공, (iii) `DECISION_REGISTER.md`에서 이 M/F를 `영향:`으로 갖는 `status: open` 0건(그 M을 가리키는 `- 발견: 봉인 후 (M<N>)` 항목 제외 — ADR-060 D1)**일 때만 삭제한다. 하나라도 실패하거나 실행이 중단되면 review 파일을 그대로 보존해 미해결 상태를 영속하며, `/implement-workitem`은 해당 M 또는 산하 F/T의 미해결 plan-review가 있으면 착수하지 않는다.
   **삭제 전 echo 강제**: 메인 세션 출력에 *삭제 대상 경로 목록 전체를 echo* (예: `삭제 예정: M1.claude-b.md, M1.codex.md`). 사용자가 *눈으로* 검증 가능하게 함 — frontmatter `allowed-tools`의 `Bash(rm ...*.md)`가 기술적으로는 모든 plan-review md 삭제를 허용하므로, 본 echo가 *prompt-level safety* 마지막 가드.
   삭제는 *반드시 먼저 할 일 step 1*에서 회수한 파일 경로 목록을 *한 개씩 정확히* 수행 — `rm <path>` 반복 (glob 재실행 금지). 다른 workitem ID의 파일은 *건드리지 않는다*. 마지막 점검 — 회수한 모든 경로가 `docs/40-validation/plan-reviews/<workitem-id>.` 접두 + `.md` 접미 정합.

책임 경계:
- 코드 일체 수정 금지.
- 자동 커밋 금지 — 결과만 출력하고 commit은 사용자/메인 세션이 별도 발화.
- workitem 문서 *외* 다른 산출물(QA_FINDINGS / report / ADR / **Charter·ARCHITECTURE·DESIGN** 등) 수정 금지. **예외 2가지**: (1) feature/milestone scope의 위 5-D 영속화 — `IMPROVEMENT_GUIDE.md`의 `## 5. Repair decision log` sub-section append. (2) 위 4-D의 `docs/10-charter/DECISION_REGISTER.md` 쓰기 — **2-S가 `contract-ready`(또는 봉인 후 구현 0건)로 판정하면 등재·상태 갱신 전체**, **봉인 후 구현이 시작된 경우엔 `- 발견: 봉인 후 (M<N>)` append만**(ADR-060 D11 writer). 정본 3종은 저작 소유가 각 bootstrap skill이므로 본 skill이 고치지 않고 권장만 한다(ADR-005).
- 본 workitem ID의 plan-review 파일만 삭제. 다른 ID의 plan-review 파일은 건드리지 않는다.

마지막 출력:
- 처리한 리뷰 파일 수 + 각 reviewer-tag 명단
- 결정 별 카운트:
  - Adopted: M개
  - Adopt-modified: K개
  - Rejected (false-positive): I개
  - Rejected (conflict): J개
- 수정된 workitem 문서 목록 (상대 경로)
- **결정 이력 영속화 결과**: P0+P1 합 append 줄 수 + 영속 위치 (task scope면 task `## 8`, feature/milestone scope면 `IMPROVEMENT_GUIDE.md` `## 5. Repair decision log`).
- 다중 리뷰어 충돌이 있었던 항목 별 결정 근거 (있으면)
- 삭제된 리뷰 파일 목록 (*반드시 먼저 할 일 step 1*에서 회수한 경로와 1:1 정합)
- 다음 권장 액션: **`/seal-milestone M<N>`** — 봉인 전이면 봉인이 먼저다(착수 게이트 ④가 receipt를 요구 — ADR-060 D7). 이미 봉인된 M을 구현 전 수정한 경우에도 `/seal-milestone M<N>` 재실행으로 receipt를 갱신한다. 대규모 변경이면 `/validate-plan` 재실행 권장.

## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 ADR/architecture 섹션은 task 본문에서 발화 시 인용 — 사전 fork-load 금지.
