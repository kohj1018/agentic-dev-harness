# ADR-026 — plan-workitem 강화 (TASK_TEMPLATE schema)

> scope: boilerplate

## Status
accepted

## 배경
- [관측됨+외부실증] vague AC가 LLM TDD 실패의 단일 최대 원인 (Fowler SDD analysis: https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html).
- `docs/30-workitems/_templates/TASK_TEMPLATE.md`의 `## 6. Acceptance Criteria` 주석은 "Given-When-Then 또는 명세 형태"라 "or" 옵션 → 자유도 큼. AC 개수 cap·verb whitelist·의존성 자리 없음.
- sizing 한계(1 task = 1 RGR / 변경 파일 수) 가이드 부재로 과대 task 발생.

## 결정

다음 5종을 결정한다.

### 1. AC Given-When-Then 형식 강력 권장
- TASK_TEMPLATE `## 6` 주석 교체 — measurable verb 권장 + 강력 금지 verb 4개("works"/"looks good"/"is correct"/"is fine") 명시.
- 문맥상 허용 verb("handles"/"supports")는 *무엇을 / 어떻게*가 명시되면 통과.
- AC-1/AC-2 형식을 `[Given]...[When]...[Then]...`으로 변경.

### 2. Sizing 3한계
- 1 task = 1 RGR 사이클.
- AC 3개 이하 권장 (4개 이상이면 재분해 *권장 텍스트*).
- 변경 예정 파일 5개 이하 권장 (초기 scaffolding·auth task 예외 — 사용자 결정).

### 3. `## 9. 의존성` 신설
TASK_TEMPLATE `## 8. 메모` 뒤에 추가. 형식: `- T-002: T-001의 X 정의 후 시작 가능`.

### 4. planner self-check 3줄
plan-workitem skill "반드시 수행할 일"에 항목 8/9/10 추가.

### 5. 출력 매트릭스
plan-workitem 마지막 출력에 `Milestone | Feature | Task | AC 수 | 의존성` 표 추가.

## quality lint 모델
- hard gate 아닌 *권장 + 재분해 텍스트*. LLM이 자주 막히지 않도록 자동 차단 없음.
- ADR-007의 *판정+권장만* 책임 경계와 정합.
- ADR-022 Ratchet 약 적용 정합 (예방적 가설을 강제로 박지 않음).

## 비결정 (No)
- 2-pass planning — 토큰 2배 + stabilize reviewer 책임 중복.
- risk·effort 추정 — 보일러플레이트가 정확도 보장 불가, YAGNI.
- hard gate verb whitelist 자동 차단 — 과강제, LLM 빈번 막힘 위험.

## 결과
- TASK_TEMPLATE AC 자리가 구조화되어 `/implement-workitem`의 RGR 진입 기준이 명확해진다.
- planner self-check로 과대 task를 조기에 식별한다.

## 잔여 모니터링
첫 마일스톤 *재분해 권장 텍스트 발화율* > 50% 시 verb 정의 재검토.

## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT)
- docs/30-workitems/_templates/TASK_TEMPLATE.md   — AC 구조화 (base)
- docs/30-workitems/_templates/TASK_TEMPLATE.md   — ## 9 의존성 구조화 5필드 (opt-in, ADR-047 D9 workflow topology 정합)
- .claude/skills/plan-workitem/SKILL.md            — #amend-1 planner self-check + architect 신호 + sizing

## 참고
- ADR-009 (TDD default)
- ADR-007 (workitem lifecycle)
- ADR-022 (Ratchet Principle)

<a id="adr-026-amend-1"></a>
## Amendment 1 (2026-05-15) — planner self-check + architect 신호 + sizing SSOT
- planner skill에 charter 정합 self-check 단락 (비목표 키워드 매칭 + milestone 매핑 확인).
- architect 호출 권장 신호 4종 (텍스트 제안만, 자동 호출 X — ADR-007 정합).
- **monorepo·백엔드 sizing 가이드의 SSOT는 plan-workitem skill 본문** (Step 9.5에서 추가됨). ADR-005 패턴 4(정책=ADR)의 *경계 영역* — 운영 가이드는 정책이 아니라 skill 본문에 둔다. 추적성을 본 amend에서 명시.
- 잔여 모니터링: 첫 마일스톤 stabilize에서 architect 신호 4종의 false positive 비율 측정. 50% 초과 시 신호 정밀도 강화.

<a id="adr-026-amend-2"></a>
## Amendment 2 (2026-06-05) — task `## 3. 구현 항목`을 단계별 구현 가이드로
### 결정
plan-workitem은 각 task의 `## 3. 구현 항목`을 *그 문서만 보고 따라 하면 구현이 끝나는* 번호 매긴 절차로 작성한다. 단계 형식: `N. <파일[:라인]> — 현재: <상태> → 변경: <정확한 수정(필요 시 before/after)> → 확인: <검증>` (+ `(AC-N)` 태그). 작성 전 대상 파일을 JIT로 읽어 *실제 현재 상태*를 근거로 한다(ADR-019 minimal — 대상 파일 한정). AC(`## 6`)는 여전히 RGR 측정 단위이고 `## 3`은 그 집행 절차다.
### 근거
- [관측됨] terse line item만 있는 task는 implement 단계에서 재해석·왕복을 유발. before/after가 박힌 가이드는 builder의 해석 여지를 줄인다(ADR-006#amend-2 2-layer defense 강화).
### 강도 (ADR-022)
- enabling(약) — 모호 단계는 재분해 권장 텍스트만, 자동 차단 X.
### 적용 surface
- docs/30-workitems/_templates/TASK_TEMPLATE.md  — `## 3` 주석
- .claude/skills/plan-workitem/SKILL.md           — "반드시 수행할 일" 3-G + 마지막 출력 self-check
