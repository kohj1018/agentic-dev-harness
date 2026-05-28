# ADR-006 단순성·Clean Code·Clean Architecture 우선순위

> scope: boilerplate

## Status
accepted

## 배경
이 보일러플레이트의 핵심 가치는 fork된 미래 프로젝트에서 AI 에이전트가 "요구한 범위만, 오버엔지니어링 없이, 가독성 좋게" 코드를 작성하게 만드는 것이다.

이 요구는 다음 세 층으로 분해된다.
1. **단순성·YAGNI** — 요구한 범위만 구현, 추측성 추상화 금지, 미래 대비 코드 금지.
2. **Clean Code** — 명확한 네이밍, 한 함수 한 가지 일, 중복 회피, WHY 주석.
3. **Clean Architecture** — 의존성 규칙, 레이어 경계 — 단 프로젝트 규모가 정당화할 때만.

순서가 중요하다. Clean Architecture를 단순성 위에 두면 작은 prototype에 4-layer를 강제해 사용자의 "오버하지 않으면서"와 직접 충돌한다.

## 결정
보일러플레이트는 위 세 층을 다음 우선순위로 적용한다(우선순위가 높을수록 강하게 강제한다).

1. **단순성·YAGNI (1순위)** — 모든 코드 변경에 강제 적용.
2. **Clean Code 6항목 (2순위)** — reviewer agent가 호출될 때마다 라벨링.
3. **Clean Architecture (3순위)** — 모듈이 3개 이상이거나 프로젝트 규모가 정당화할 때만 적용.

각 층의 surface 매핑:

| 층 | Surface | 형태 |
|----|---------|------|
| 단순성·YAGNI | `AGENTS.md` | 6개 항목(#amend-1 Surgical Changes 포함), fork된 새 세션이 자동 로드. |
| 단순성·YAGNI | `.claude/agents/builder.md` | 구현 출력 직전 self-check 4항목. 미통과 항목은 "남은 정리 항목"에 명시. |
| Clean Code 6항목 | `.claude/agents/reviewer.md` | 6항목 체크리스트, P0/P1/P2 + 항목 라벨링. |
| Clean Architecture | `.claude/agents/architect.md` | "프로젝트 규모가 정당화하는가" self-check. |
| Clean Architecture | `docs/20-system/ARCHITECTURE_OVERVIEW.md`의 `## 3-1. 레이어 경계 + 의존성 규칙` | 모듈 ≥3 시 채울 것을 권장. |

## 근거
- 사용자가 명시적으로 "오버엔지니어링 회피·가독성 우선"을 핵심 가치로 강조했다.
- prototype 단계에서 4-layer를 강제하면 ceremony가 가치를 압도한다 — 단순성을 1순위로 두는 이유.
- Clean Code는 라벨링 비용이 낮으므로 reviewer가 매번 적용해도 비용 부담이 작다.
- Clean Architecture는 적용 비용이 크므로 규모가 정당화할 때만 강제한다.

## 결과
- `AGENTS.md`에 단순성 6개 항목 단락 (`CLAUDE.md`는 `@AGENTS.md` import. 초기 5개 + #amend-1 Surgical Changes 1개).
- builder, validator, reviewer, architect의 규칙에 self-check / 체크리스트 / 규모 점검 추가.
- `/implement-workitem` skill이 구현 시 단순성 self-check + Clean Code 6항목을 참조.
- ARCHITECTURE_OVERVIEW의 `## 3-1. 레이어 경계 + 의존성 규칙` 섹션이 "프로젝트 규모가 정당화될 때만 채운다" YAGNI 보호 단서와 함께 도입된다(이 ADR과 같은 적용 사이클의 후속 변경).
- `/stabilize-milestone`이 reviewer 입력에 Clean Code 6항목 체크리스트를 명시한다.

## 후속 작업
- 단순성 self-check 4항목이 builder 출력 비용을 늘리는지 측정. 비용이 크면 축약 검토.
- `legacy 코드`의 premature abstraction은 즉시 제거하지 않고 `/stabilize-milestone`이 후보로만 보고하는 정책을 유지한다(사용자 결정 우선).

<a id="adr-006-amend-1"></a>
## Amendment 1 (2026-05-16) — Surgical Changes 명시 + ambiguity surfacing protocol

### 결정
단순성 1순위에 다음 2개 sub-원칙을 명시한다.

**Surgical Changes (sub-원칙 1)**
- 변경 줄은 모두 task의 AC 또는 명시 요청으로 거꾸로 추적 가능.
- 인접 코드 개선·무관 포맷팅·기존 스타일 무시·pre-existing dead code 삭제 금지.
- pre-existing dead code는 *언급*만, *삭제는 명시 요청 시*.

**Ambiguity surfacing (sub-원칙 2)**
- AC가 2+ 해석 가능 시 builder는 해석안을 나열하고 자기 선택을 표시.
- 자동 차단 X — 사용자가 출력 보고 차단/수정 결정 ([ADR-007](ADR-007-workitem-lifecycle.md) 정합).

### 강도 분류 (ADR-022 정합)
- **제약(강)** — pre-existing dead code 의도 외 *삭제*는 validator의 Pass 차단 트리거. 근거 라벨: `[관측됨+외부실증]` (builder.md 내 dead code 문구 drift 관측 + Karpathy testimony).
- **enabling(약)** — 나머지 sub-원칙(diff trace 라벨링 / 인접 포맷팅 / 스타일 무시 / ambiguity surfacing 권장 텍스트)은 *report only* / *권장 텍스트 출력*. 근거 라벨: `[가설]`. 향후 fork 프로젝트에서 [관측됨] 회수 시 [가설→실증] 승격 검토.

### 적용 surface
- [AGENTS.md](../../../AGENTS.md) 단순성 단락 1줄 (Surgical Changes 진입 SSOT).
- [.claude/agents/builder.md](../../../.claude/agents/builder.md) self-check 3 항목 (dead code wording 교정 + diff trace + LOC sanity heuristic — Simplicity First sub-원칙).
- [.claude/agents/reviewer.md](../../../.claude/agents/reviewer.md) *별도 Scope Discipline 섹션* (Clean Code 6은 그대로 유지).
- [.claude/skills/validate-workitem/SKILL.md](../../../.claude/skills/validate-workitem/SKILL.md) diff trace audit + report 섹션 (카테고리 (c) Needs Fix 트리거).
- [.claude/skills/implement-workitem/SKILL.md](../../../.claude/skills/implement-workitem/SKILL.md) Red phase plan + ambiguity gate.
- [.claude/skills/plan-workitem/SKILL.md](../../../.claude/skills/plan-workitem/SKILL.md) AC interpretation diversity self-check.

> Document Consistency 라벨링 (reviewer.md 의 Doc Consistency 섹션) 은 *문서 review surface 의 별도 차원* — 본 amendment 의 Surgical Changes / Ambiguity surfacing 범위 외다. reviewer.md 본문 자체가 Doc Consistency 라벨링의 SSOT 다.

본 amendment의 적용은 단일 task로 박지 않고 surface별로 분할 — 각 적용 task가 *amendment 본문의 적용 surface 완성*임을 amendment 자체에 명시.

### 근거
- Karpathy 직접 testimony (2026-01-26 X post): "silent assumptions", "collateral damage" 실패 모드 명명.
- Chang의 4-원칙 정리본의 커뮤니티 widespread adoption (단 star 수는 *adoption signal*이지 *outcome 검증 evidence*는 아님 — [ADR-022](ADR-022-ratchet-principle.md) 정합).
- 내부 [관측됨]: [.claude/agents/builder.md](../../../.claude/agents/builder.md) self-check 4번 "dead code 정리" 문구와 핵심 행동 규율 "범위 밖 변경 금지" 사이의 방향 모순.

### 후속 작업
- 본 Amendment 적용 후 builder self-check 비용 측정. 항목 추가가 builder 출력 토큰을 크게 늘리면 축약 검토.
- fork 프로젝트에서 [관측됨] 데이터 회수 후 enabling 부분을 [가설→실증]로 승격 검토.

<a id="adr-006-amend-2"></a>
## Amendment 2 (2026-05-27) — implement 단계 ambiguity 하드스탑

### 결정
#amend-1의 *Ambiguity surfacing*을 다음과 같이 정정한다.
- **plan 단계(planner)**: AC가 2+ 해석 가능하면 plan-workitem 9-1 self-check가 *해석안 + 권장 선택*을 "남은 미결정 사항"에 박는다(기존 유지). **추가**: 권장 선택을 채택했으면 해당 task `## 8. 메모`에 `해석 확정: AC-N = <선택>` 한 줄로 *기록*한다(implement가 따를 근거).
- **implement 단계(builder)**: builder는 먼저 task `## 8. 메모`의 `해석 확정:` 기록을 찾는다.
  - 기록 있음 → 그 해석을 *기계적으로 따른다*(자체 재해석 X).
  - 기록 없음 + 2+ 해석이 *구현을 실질적으로 다르게* 만듦(사소한 표현 차이는 제외) → **구현을 시작하지 않고 `Needs Plan Decision`으로 종료**한다. 출력에 해석안을 나열하고 `/repair-plan <id>`(cross-review 했을 때) 또는 `/plan-workitem <id>` 재실행으로 해석을 확정하도록 안내한다.

### 강도 분류 (ADR-022 정합) — #amend-1에서 변경
- #amend-1은 implement의 ambiguity를 *enabling(약)* 으로 뒀다.
- 본 #amend-2는 *plan 결정 부재 + 2+ 해석이 **구현 결과를 실질적으로 다르게** 만드는 경우*에 한해 **constraint(강)** 으로 승격한다. 사소한 표현 차이(동일 구현으로 수렴)는 해당 없음 — false-stop 회피.
- 근거 라벨 `[외부실증]`: *실행자가 모호성을 침묵 속에 자체 해석하면 결함이 새어든다*는 실패 모드는 #amend-1이 인용한 Karpathy silent-assumption testimony로 뒷받침된다(ADR-022 constraint 요건 충족).
- `context: fork`라 실시간 질의 불가 → *차단 = 종료 + 안내*이지 무한 대기 아님. plan 9-1/Step 7-D가 해석을 선기록하면 hard-stop은 거의 발화 안 함(2-layer 예방).

### 적용 surface
- [.claude/skills/implement-workitem/SKILL.md](../../../.claude/skills/implement-workitem/SKILL.md) — ambiguity 단계 재작성.
- [.claude/agents/builder.md](../../../.claude/agents/builder.md) — ambiguity 규칙 1줄 교정.
- [.claude/skills/plan-workitem/SKILL.md](../../../.claude/skills/plan-workitem/SKILL.md) — 9-1에 "해석 확정 기록" 1줄.

### 근거
- 사용자 의도: implement/finalize는 *기계적*, plan/validate가 *사고* 담당. implement가 해석을 자체 결정하면 그 경계가 무너진다.
- 2-layer 방어 유지: plan 9-1이 1차로 해석을 확정 → implement는 그 결정을 *집행만*. plan이 놓쳤을 때만 implement가 중단해 plan으로 되돌린다.
