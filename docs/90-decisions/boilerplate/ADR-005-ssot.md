# ADR-005 단일 출처(SSOT) 원칙

> scope: boilerplate

## Status
accepted

## 배경
이 보일러플레이트의 모든 가치(fork 후 안정성, 변경 비용 최소화, 사용자 혼선 최소화)는 같은 사실이 한 곳에서 정의되고 다른 곳은 그것을 참조한다는 단일 출처(Single Source of Truth, 이하 SSOT) 원칙에 달려 있다.

본 ADR 이전 시점의 정적 분석에서 다음과 같은 다중 정의가 발견됐다:
- 문서 계층 정의: 5곳 (CLAUDE.md, TEMPLATE_GUIDE.md, boilerplate-context skill, README.md, README_ko.md)
- 위임 트리거 표: 2곳 (CLAUDE.md, DELEGATION_STRATEGY.md, planner 행 누락 모순 포함)
- 상태값 + 전이 규칙: 4곳
- 모델 ID/별칭 표기: 4곳
- Bootstrap 사용 흐름: 5곳

표현 차이가 누적되면 사용자 혼선을 만들고, 변경 시 어느 한 곳이라도 빠뜨리면 stale로 노출된다.

## 결정
다음 다섯 패턴을 보일러플레이트의 SSOT 운영 방식으로 채택한다.

1. **"정의 1곳, 다른 곳은 링크" 패턴** — 각 사실은 단 하나의 canonical 문서에 정의된다. 다른 문서는 한 줄 요약 + canonical 링크만 둔다. 정의 본문을 복제하지 않는다.
2. **"인덱스 README" 패턴** — `docs/90-decisions/README.md`가 ADR 인덱스를 담는다. 새 ADR 추가 시 README 갱신이 기본 절차.
3. **"산출물 인벤토리" 패턴** — `docs/00-meta/STRUCTURE.md`가 모든 산출물의 위치·생성 주체·라이프사이클을 단일 표로 관리. 신규 산출물은 이 표에 등록.
4. **"정책 = ADR" 패턴** — 보일러플레이트가 도입하는 모든 정책(모델 별칭, 단순성, TDD, commit convention, lifecycle, SSOT 등)은 ADR로 박고, agent/skill 본문에는 정책 설명을 길게 박지 않는다.
5. **"진입 페이지" 패턴** — 도구별 진입점(`AGENTS.md`가 캐노니컬, `CLAUDE.md`는 `@AGENTS.md` import)은 fork된 새 세션이 자동 로드한다. 모든 운영 원칙을 다 박지 않고 목적·권위 있는 문서로의 링크 인덱스·핵심 행동 규율만 둔다. (정책 근거: ADR-010)

Canonical Owner 매핑 표는 `docs/00-meta/STRUCTURE.md`의 "Canonical Owner 매핑(SSOT 부록)" 섹션이 SSOT다.

## 근거
- 변경 비용 비대칭 해소 — 모델 별칭 1개 바꿀 때 4 surface 동시 변경하던 것이 1곳 변경으로 끝난다.
- 표현 drift 방지 — 같은 디렉터리를 어떤 곳은 "운영 원칙"이라 부르고 다른 곳은 "guardrail 철학"이라 부르던 혼선이 사라진다.
- 정책 권위 강화 — 정책이 ADR에 박히면 6개월 뒤 fork한 사용자가 "왜 이 정책인가"를 ADR로 추적할 수 있다.
- README cross-language drift 표면 축소 — README 본문이 짧아지면 ko/en 동기화 부담이 줄어든다.

## 결과
- `docs/00-meta/STRUCTURE.md` 신설.
- `docs/90-decisions/README.md` 신설.
- `CLAUDE.md`, `README.md`, `README_ko.md` 등이 슬림화되어 정의 대신 링크를 사용한다.
- agent 본문은 행동 규율 + ADR 링크 형태로 정리된다.

## 후속 작업
- 새 정책이 도입될 때마다 ADR로 박고 README 인덱스에 한 줄 추가.
- 새 산출물이 도입될 때마다 STRUCTURE.md 인벤토리에 등록.
- agent/skill 본문에 정책 설명이 길게 들어 있으면 ADR 링크로 줄이는 후속 정리.
- `/stabilize-milestone`이 SSOT drift 점검을 수행하도록 후속 항목 검토.

<a id="adr-005-amend-1"></a>
## Amendment 1 (2026-08-11) — 원장 5종의 배타적 기록 범위

### 배경
- [관측됨] `DECISION_REGISTER` / `ROADMAP` / `QA_FINDINGS` / `IMPROVEMENT_GUIDE` / `DISCOVERY` 다섯 원장은 각자 등재 범위를 갖지만 **원장끼리의 경계**가 어디에도 없다. 그래서 같은 항목이 둘에 들어갈 수 있고, 실제로 «수용 라운드의 계약 변경»이 원장과 ROADMAP 어느 쪽에도 갈 수 있는 상태였다.
- 본 ADR 결정 1(«정의 1곳, 다른 곳은 링크»)은 *정본 문서*를 대상으로 하고 원장 간 배분은 다루지 않았다.

### 결정
1. **원장 5종의 기록 범위를 «답하는 질문»으로 배타 분할한다.** 표 본문의 SSOT는 `docs/00-meta/STRUCTURE.md`의 `## Canonical Owner 매핑`이며(본 ADR 본문이 이미 그 섹션을 canonical owner 매핑의 SSOT로 지정했다), 본 amend는 정책과 판별자만 박는다.
2. **ADR은 이 표의 대상이 아니다** — ADR은 **정본 문서 중 하나**이며(`DECISION_REGISTER`가 «위치와 처분 상태만» 가리키는 대상), 원장과 같은 층이 아니다. 원장 항목이 `closed`되며 `정본: ADR-NNN`을 가리킬 때 ADR이 작성된다(작성 주체·시점은 ADR-000#amend-2 트리거 표).
3. **판별자 3개** — 애매할 때 아래 순서로 판정한다.
   - **원장 vs ROADMAP Backlog**: «이 항목이 해소되면 무엇이 남는가» — *정본 문서의 한 절이 채워진다* → `DECISION_REGISTER` / *마일스톤 문서 하나가 생긴다* → `ROADMAP ## Backlog`. 보조 검증: 원장 항목은 닫힐 때 `정본:` 앵커가 필수이므로(원장 불변식 2), 앵커를 쓸 정본 문서가 떠오르지 않으면 원장 항목이 아니다.
   - **Backlog vs IMPROVEMENT_GUIDE**: «그것을 하면 마일스톤이 되는가, task 이하가 되는가» — 마일스톤 단위 → Backlog / task 이하(코드·문서 조각) → `IMPROVEMENT_GUIDE`.
   - **QA_FINDINGS vs IMPROVEMENT_GUIDE**: «이번 마일스톤이 그것을 약속했는가» — 예 → `QA_FINDINGS` / 아니오 → `IMPROVEMENT_GUIDE`(ADR-066 D2와 동일 기준).
4. **비중복 불변식 3개**
   - **N-1** 한 사실은 동시에 두 원장에 «열린 채로» 존재하지 않는다.
   - **N-2** 원장 간 이동은 «원본을 닫고 → 새 원장에 등재»로만 한다. 양쪽에 남기지 않는다.
   - **N-3** 이동한 항목의 원본에 목적지 앵커를 남긴다 — `status: resolved (재분류: <목적지> <ID 또는 candidate-key>)`. 목적지가 로드맵이면 `<목적지>`는 `ROADMAP ## Backlog`다(구간까지 적는다 — 로드맵은 구간별 의미가 다르다).
   - 선례: `/repair-acceptance`가 `Out-of-contract` 재분류 시 이미 같은 형태를 쓴다.
5. **차단력을 가진 원장은 둘뿐이다** — `DECISION_REGISTER`(`open` → `/seal-milestone` 봉인 차단)와 `QA_FINDINGS`(본 M `### P0` 미해소 → 졸업 item 5 차단). 나머지 셋은 회수 후 **사용자 결정**이며 자동 차단 로직을 두지 않는다.

### 강도 (ADR-022)
- **제약(강) — [관측됨]**: 결정 3의 판별자, 결정 4의 N-1~N-3.
- **enabling(약)**: 결정 1의 표 위치, 결정 5의 차단력 서술(현행 재확인).

### Mutation delta (ADR-047 D3)
- failure = 같은 항목이 두 원장에 열려 회수 시 중복 처리되거나, 차단이 필요 없는 항목이 원장에 쌓여 봉인 검사·R1 triage가 무거워짐
- falsifier = dogfood에서 한 finding이 두 원장에 동시에 `open`으로 관측되거나, 판별자가 같은 항목을 두 목적지로 보냄
- rollback = 본 amend superseded + STRUCTURE의 원장 범위 표 제거 + ROADMAP `## Backlog` 제거

### 적용 surface
- docs/00-meta/STRUCTURE.md (`## Canonical Owner 매핑` — 표 본문)
- docs/10-charter/DECISION_REGISTER.md (등재 범위 표에 제외 1행)
- docs/40-validation/IMPROVEMENT_GUIDE.md (`## 4` 용도 + 재분류 규칙)
- docs/30-workitems/ROADMAP.md (`## Backlog`)
- .claude/skills/accept-milestone/SKILL.md · repair-acceptance/SKILL.md (라우팅 목적지)
- .claude/skills/plan-milestone/SKILL.md (R0 Backlog 회수 · R1 재분류)
