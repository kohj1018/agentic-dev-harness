# ADR-006 단순성·Clean Code·Clean Architecture 우선순위

> scope: boilerplate

## 상태
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
| 단순성·YAGNI | `AGENTS.md` | 6개 항목(Amendment 1 Surgical Changes 포함), fork된 새 세션이 자동 로드. |
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
- `AGENTS.md`에 단순성 6개 항목 단락 (`CLAUDE.md`는 `@AGENTS.md` import. 초기 5개 + Amendment 1 Surgical Changes 1개).
- builder, validator, reviewer, architect의 규칙에 self-check / 체크리스트 / 규모 점검 추가.
- `/implement-workitem` skill이 구현 시 단순성 self-check + Clean Code 6항목을 참조.
- ARCHITECTURE_OVERVIEW의 `## 3-1. 레이어 경계 + 의존성 규칙` 섹션이 "프로젝트 규모가 정당화될 때만 채운다" YAGNI 보호 단서와 함께 도입된다(이 ADR과 같은 적용 사이클의 후속 변경).
- `/stabilize-milestone`이 reviewer 입력에 Clean Code 6항목 체크리스트를 명시한다.

## 후속 작업
- 단순성 self-check 4항목이 builder 출력 비용을 늘리는지 측정. 비용이 크면 축약 검토.
- `legacy 코드`의 premature abstraction은 즉시 제거하지 않고 `/stabilize-milestone`이 후보로만 보고하는 정책을 유지한다(사용자 결정 우선).

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
