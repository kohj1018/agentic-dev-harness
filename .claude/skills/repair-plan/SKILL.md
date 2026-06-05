---
name: repair-plan
description: 원본 plan 세션에서 실행. docs/40-validation/plan-reviews/<workitem-id>.*.md의 모든 리뷰를 회수해 수용·기각을 판단하고 workitem 문서를 수정한 뒤 리뷰 파일을 삭제한다 (ADR-038).
argument-hint: "[milestone or feature or task id]"
disable-model-invocation: true
allowed-tools: Read Glob Grep Write Edit Bash(rm docs/40-validation/plan-reviews/*.md)
context-pack: minimal
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
2. 입력 ID에 해당하는 workitem 문서 + 모든 하위 문서를 읽는다 (`/validate-plan`과 동일 범위).
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
5. Adopt / Adopt-modified로 결정된 항목에 대해 workitem 문서를 수정. 수정 후에도 양식 정합을 점검 (TEMPLATE의 섹션 번호 유지, FAC↔AC `## 7-1` 매핑 갱신, AC Given-When-Then 형식 유지). `## 9. 의존성`이 수정된 경우 그 사실을 *기록*해 아래 "마지막 출력" 단락의 wave 재emit 안내에 포함.
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
6. **삭제 전 사전 조건 점검** — 모든 P0/P1/P2 항목이 4결정 중 하나로 판정됐는가. 정합이면 삭제 진행.
   **삭제 전 echo 강제**: 메인 세션 출력에 *삭제 대상 경로 목록 전체를 echo* (예: `삭제 예정: M1.claude-b.md, M1.codex.md`). 사용자가 *눈으로* 검증 가능하게 함 — frontmatter `allowed-tools`의 `Bash(rm ...*.md)`가 기술적으로는 모든 plan-review md 삭제를 허용하므로, 본 echo가 *prompt-level safety* 마지막 가드.
   삭제는 *반드시 먼저 할 일 step 1*에서 회수한 파일 경로 목록을 *한 개씩 정확히* 수행 — `rm <path>` 반복 (glob 재실행 금지). 다른 workitem ID의 파일은 *건드리지 않는다*. 마지막 점검 — 회수한 모든 경로가 `docs/40-validation/plan-reviews/<workitem-id>.` 접두 + `.md` 접미 정합.

책임 경계:
- 코드 일체 수정 금지.
- 자동 커밋 금지 — 결과만 출력하고 commit은 사용자/메인 세션이 별도 발화.
- workitem 문서 *외* 다른 산출물(QA_FINDINGS / report / IMPROVEMENT_GUIDE / ADR 등) 수정 금지. **예외**: feature/milestone scope의 위 5-D 영속화 — `docs/40-validation/IMPROVEMENT_GUIDE.md`의 `## 5. Repair decision log` sub-section append만 허용 (다른 섹션 / 다른 산출물은 여전히 금지).
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
- **`## 9. 의존성` 수정 여부 플래그**: 수정됐으면 한 줄 안내 — `의존성 수정됨 → 기존 wave 그룹 stale. /plan-workitem <id> 재실행해 wave 재산출 권장.`
- 다중 리뷰어 충돌이 있었던 항목 별 결정 근거 (있으면)
- 삭제된 리뷰 파일 목록 (*반드시 먼저 할 일 step 1*에서 회수한 경로와 1:1 정합)
- 다음 권장 액션: 보통 `/implement-workitem <task-id>`. 의존성 수정이 있었으면 `/plan-workitem <id>` 재실행이 먼저, 대규모 변경이면 `/validate-plan` 재실행 권장.

## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 ADR/architecture 섹션은 task 본문에서 발화 시 인용 — 사전 fork-load 금지.
