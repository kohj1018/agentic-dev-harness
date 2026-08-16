# 개선 가이드

> 본 문서는 Living Doc이다. 각 섹션 안에서 `### M1`, `### M2` 식의 마일스톤 단위 그룹핑을 권장한다.
> `/stabilize-milestone`이 reviewer 결과를 누적 기록할 때 마일스톤 헤더를 사용한다.

## 항목 스키마

각 발견 항목은 다음 형식으로 박는다.

- 필수 4필드: `ID | severity | evidence label | linked workitem`
- 권장 2필드: `status | decision`
- evidence label은 [boilerplate/ADR-022](../90-decisions/boilerplate/ADR-022-ratchet-principle.md)의 `[관측됨]` / `[외부실증]` / `[가설]` (+ 합성 표기) 중 1개.
- **선택 태그 `(수용)`**: `/accept-milestone`이 사용자 수용 라운드에서 등재한 항목에 붙인다. **위치는 굵은 ID 바로 뒤·첫 `|` 앞으로 고정한다** — `- **M1-003** (수용) | P2 | ...`. 이 태그가 `/repair-acceptance`의 유일한 회수 신호이며 문자열 `(수용)` 정확 일치로 grep된다(ADR-066 D5). `/repair-milestone`은 이 태그가 붙은 항목을 4-판정하지 않는다.

예시:
```
- **F-M1-001** | P1 | [관측됨] | linked: T-002 | status: open
  - 발견: FAC-4 → T-002:AC-N 매핑 누락, validate 통과인데 spec gap.
  - 결정: 다음 라운드 plan에서 T-002에 AC-3 추가.
```

## 2. 열린 항목

<!-- 마일스톤 단위 `### M1`, `### M2` 그룹으로 누적한다. severity(P0/P1/P2)가 우선순위를 표현하므로
     별도의 «즉시/권장» 구분을 두지 않는다. 회수자는 /repair-milestone(이번 마일스톤)이다. -->

<!-- ## 0. 요약 · ## 1. 우선순위 — 폐지(결번). 파생 요약은 다중 writer 환경에서 본문과 drift한다.
     번호는 재사용하지 않는다. -->

<!-- ## 3. 권장 리팩토링 — 폐지(결번). `## 2. 열린 항목`으로 통합했다.
     번호는 재사용하지 않는다. -->

## 4. 보류 항목

<!-- 담는 것 2종:
     ① 지금 고치지 않기로 한 개선 항목 — 다음 /plan-milestone R0가 회수해 사용자에게 surface.
     ② **계약 미반영 (`scope: out-of-AC`)** — `/repair-acceptance`가 이번 마일스톤에서 고쳐 **코드에는 들어갔으나**
        어느 AC·FAC·프로토타입·DESIGN 계약에도 근거가 없는 변경. `affected: T-NNN`이 유일한 역참조다.
        다음 /plan-milestone R0가 회수해 **AC 승격 여부를 사용자에게 묻는다.**
     담지 않는 것: 마일스톤 단위 기능 후보(→ ROADMAP `## Backlog`) / 아직 정해야 할 결정(→ DECISION_REGISTER).
     판별 기준 SSOT: docs/00-meta/STRUCTURE.md `## Canonical Owner 매핑` (ADR-005#amend-1).
     항목이 마일스톤급이라고 판명되면 /plan-milestone R1이 ROADMAP `## Backlog`로 재분류하고
     여기 원본은 `status: resolved (재분류: ROADMAP ## Backlog <candidate-key>)`로 닫는다(비중복 불변식 N-2·N-3).

     형식 (② 계약 미반영) — 아래는 *형식 예시*이며 항목이 아니다.
     판독자(/plan-milestone R0)는 **HTML 주석 밖의 줄만** 항목으로 센다:
     - **<M>-uat-<N>** | P2 | [관측됨] | linked: <M> | affected: T-NNN | scope: out-of-AC | status: open
       - 계약 미반영: <무엇이 코드에 들어갔는지 1줄 — 파일·규모 포함>.
       - 근거 부재: <task>의 어느 AC도 이 동작을 약속하지 않았다.
       - 회수: 다음 /plan-milestone R0 — AC로 승격할지 사용자 결정. -->

## 5. Repair decision log

`/repair-plan`(plan 단계 feature/milestone 결정) · `/repair-milestone`(stabilize 후 milestone-level finding 수정 결정) · `/repair-acceptance`(사용자 수용 finding 수정 결정 — ADR-066 D4, ID `<M>-uat-<N>`, `affected: T-NNN` 필수)가 호출됐을 때 본 라운드의 P0+P1 결정을 영속 기록하는 자리 (ADR-047 D7 durable correction history + D1 inspectability). **`## 2. 열린 항목`에는 박지 않는다** — 그 섹션은 *open items*(해야 할 일)이고 결정 이력은 *closed records*(지나간 판단)라 의미가 다르다.

- **폐쇄 전** task scope (T-NNN) 결정은 해당 task `## 8. 메모`에 직접 append — 본 섹션 아님(`/repair-workitem`이 마일스톤 폐쇄 전에 수행한 라운드).
- **폐쇄 후** 마일스톤 층이 고친 것은 `scope`와 무관하게 **전부 본 섹션에 적는다**(ADR-068 D1 — 마일스톤 층은 task 문서를 건드리지 않는다). `scope: out-of-AC` 항목은 그 «계약 미반영» 사실을 별도로 `## 4. 보류 항목`에 `status: open`으로 등재한다(수리는 끝났지만 계약 반영은 열려 있다 — 서로 다른 사실이므로 항목도 둘이다).
- **동일 패턴 전수 검색(pattern-scan) 결과**도 폐쇄 후에는 본 섹션의 그 항목 하위 줄에 적는다(ADR-066#amend-1).
- ID 컨벤션: `<workitem-id>-repair-<N>`(`/repair-plan`·`/repair-milestone` — 예: `F-001-repair-1`, `M1-repair-2`) / `<milestone-id>-uat-<N>`(`/repair-acceptance` — 예: `M1-uat-1`).
- **필수 필드 3종 (ADR-068 D6)** — `/repair-milestone`·`/repair-acceptance` 항목에 **전부 필수**다. 마일스톤 층은 task를 재개방하지 않으므로 task 문서에 흔적이 남지 않고, 이 세 필드가 유일한 추적 경로다.
  - `affected: T-NNN` — 영향 task. 여러 개면 쉼표 나열, 순수 cross-cutting은 `affected: —`.
  - `files:` — 이 항목이 실제로 고친 파일 목록. 문서만 고쳤으면 `files: docs-only`.
  - `scope: in-AC | out-of-AC` — 그 변경 줄을 기존 계약(task `## 6` AC · task `## 3` line item · feature `## 7` FAC · feature `## 7-2` INV · 승인 프로토타입 · DESIGN 계약)으로 거꾸로 추적할 수 있는가. **애매하면 `out-of-AC`.** `out-of-AC`면 `## 4. 보류 항목`에 계약 부채를 별도 등재한다.
- evidence label은 기본 `[관측됨]` (finding 자체는 리뷰어/stabilize의 *로컬 문서·코드 관측*에서 나옴 — cross-review 방식의 외부실증은 ADR-038 본문이 owning).
- 형식은 본 파일 `## 항목 스키마` SSOT 따름.

형식:
```
- **M1-repair-1** | P0 | [관측됨] | linked: M1 | affected: T-004 | files: src/auth/session.ts, tests/auth/session.spec.ts | scope: in-AC | status: applied | decision: Adopt
  - 발견 (stabilize qa): 세션 만료 후 재요청이 500을 낸다.
  - 결정: Adopt — AC-2가 401을 약속했다 / 회귀 테스트: tests/auth/session.spec.ts::expired_session_returns_401 (Red→Green 관측, validate에 묶임).
  - exec-evidence 2026-09-02 (a): 등급1 재실행 가능 — 테스트 전용 DB / 결과: 만료 세션 row 정리 확인.
  - pattern-scan 2026-09-02 만료 세션 401 처리: 범위 내 1건 수정 / 범위 밖 0건.
```

<!-- 마일스톤별 그룹핑(`### M1`, `### M2`)은 `/repair-plan`·`/repair-milestone`·`/repair-acceptance`가 *첫 호출 시* 해당 마일스톤 헤더를 자동 신설하고 그 아래에 append. /stabilize-milestone은 본 sub-section을 *추가하거나 수정하지 않음* — /repair-plan·/repair-milestone·/repair-acceptance만 직접 append. 본 ## 5 sub-section은 *신설 시 헤더 + 본 안내 주석만* 두고 `### M-N` 그룹은 비워둔다. -->
