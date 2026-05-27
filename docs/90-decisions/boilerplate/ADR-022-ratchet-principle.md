# ADR-022 — Ratchet Principle 명문화 + 적용 범위 한정

> scope: boilerplate

## Status
accepted

## 배경
- 본 보일러플레이트는 fork 사례 0건이라 모든 *예방적 정책*이 가설 카테고리다.
- 문자 그대로의 Ratchet Principle("AGENTS.md의 모든 줄은 specific failure로 추적 가능해야 한다")을 본 보일러플레이트에 적용하면 P0 결정 다수가 [관측됨] 데이터 부재로 P2 강등된다.
- 그러나 보일러플레이트의 존재 의의가 *fork 사용자 보호*라면, 모든 정책을 [관측됨]에만 의존시키면 보호 역할을 못 한다.

## 결정
정책을 두 종류로 구분하고 Ratchet 강도를 차등 적용한다.

| 정책 종류 | 정의 | Ratchet 강도 |
|---------|------|----------------|
| **제약 정책** (constraint) | 새 reviewer 룰 / self-check / ADR 본문 / P0 분류 기준 — *agent 행동을 좁히는 정책* | **강** — [관측됨] *또는* [외부실증] 필수 |
| **enabling 정책** (enabling) | cap·budget·convention·tooling 권장 — *agent에게 도구/한계 제공* | **약** — [관측됨] / [외부실증] / [가설] 중 어느 하나라도 가능 |

## 운영 규칙
- 새 ADR의 `## 배경` 섹션은 (a) 본 보일러플레이트/fork에서 관측된 실패·발견·이슈, 또는 (b) 외부 다중 repo 실증 자료의 출처를 1~3문장으로 명시한다. 둘 다 비어 있고 *예방적 가설*만 있다면 본 ADR은 *제약*이 아닌 *enabling*(소프트 권장)이어야 한다.
- IMPROVEMENT_GUIDE·QA_FINDINGS의 모든 새 항목에 evidence label `[관측됨]`/`[외부실증]`/`[가설]` 중 하나를 박는다.
- **합성 evidence 표기**: 본 가이드는 다음 합성 표기를 사용한다. 모두 위 3종의 조합이며 Ratchet 분류는 *가장 강한 라벨*을 기준으로 한다.
  - `[관측됨+외부실증]` — 보일러플레이트/fork 관측 + 외부 실증 둘 다 있음 (제약 강하게 가능)
  - `[가설→실증]` — 현재 [가설]이지만 Phase 1·12 시뮬레이션 통과 후 [관측됨]으로 승격 예정.
  - `[가설→트리거]` — [가설] 상태로 P1·P2 보류, 트리거 발동 시 재라벨링
- builder self-check에 1줄 추가: *"이번 추가/변경이 어떤 구체적 실패를 막는가? 관측된 실패가 없고 가설적 예방이라면 제약 형태로 강제하지 말고 권장 형태로 둔다(ADR-022)."*

## 결과
- 본 보일러플레이트의 모든 P0 결정이 자기 일관성 검증을 통과한다.
- fork 사용자가 새 ADR을 박을 때 *제약 vs enabling* 결정 기준이 명확.

## 후속 작업
없음 — 본 ADR이 다른 ADR의 근거.

## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT)
- docs/40-validation/QA_FINDINGS.md                   — evidence label 스키마
- docs/40-validation/IMPROVEMENT_GUIDE.md             — evidence label 스키마
- .claude/agents/builder.md                            — self-check 1줄(제약 vs 권장)
- docs/90-decisions/boilerplate/_ADR_GUIDE.md          — Ratchet Principle 단락

## 참고
- Addy Osmani — agent harness engineering (https://addyosmani.com/blog/agent-harness-engineering/)
