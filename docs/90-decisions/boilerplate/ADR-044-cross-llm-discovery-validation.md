# ADR-044 — Cross-LLM Discovery Validation (기획 층 peer review)

> scope: boilerplate

## Status
accepted

## 배경
- [관측됨] ADR-038의 `/validate-plan`·`/repair-plan`은 *workitem 분해 plan*(milestone/feature/task) 층만 cross-LLM 검토한다 — *제품 기획 층*(DISCOVERY.md)을 비판적으로 교차 검토하는 대응물이 없다. discover-product는 *생성*만, review-doc은 *범용 단일 문서*(기획 전용 차원·repair 루프 없음), stabilize §6.5는 *기계적 staleness*만.
- [외부실증] Teresa Torres / Cagan — discovery는 confirmation bias·leading evidence에 취약해 *외부 시선의 비판적 검토*가 품질의 핵심.

## 결정
1. `/validate-discovery` 신설 — *다른 세션·다른 LLM*에서 DISCOVERY.md(기획 SSOT)를 reviewer `discovery` surface로 비판 검토, 임시 리뷰 파일 1개를 `docs/40-validation/discovery-reviews/DISCOVERY.<tag>.md`에 작성. DISCOVERY/charter 일체 수정 X. (ADR-038 `/validate-plan` 패턴의 discovery 층 mirror)
2. `/repair-discovery` 신설 — 원본 세션에서 리뷰 파일 N개 회수 → adopt/adopt-modified/reject-false-positive/reject-conflict 판단 → DISCOVERY.md 수정 → 리뷰 파일 삭제. **agent: architect** (repair-plan은 planner이나 discovery는 제품 전략 판단이라 architect — bootstrap-project가 architect인 것과 정합).
3. **Discovery Quality 8 차원** (reviewer `discovery` surface): `[Disc-persona]` 증거 기반 · `[Disc-pain]` 빈도×고통 실재 · `[Disc-jtbd]` 진짜 job(solution-in-disguise 아님) · `[Disc-scope]` MVP ruthless(scope creep) · `[Disc-assumption]` 최위험 가정 식별·검증계획(§10/§12) · `[Disc-metric]` 성공기준 측정가능(§9) · `[Disc-evidence]` §14 Evidence 신뢰도·가설↔사실 분리(§14 부재 시 skip) · `[Disc-bias]` confirmation bias·leading·단일출처 과신.
4. 판정 verdict(ALL_GOOD/NEEDS_CHANGES)는 *리뷰 라벨*이지 워크플로 차단 아님(ADR-038·ADR-007 책임 경계 정합). opt-in.
5. charter는 수정하지 않는다 — DISCOVERY=SSOT(ADR-035), charter sync는 `/bootstrap-project --apply`.

## 근거
- 검증된 ADR-038 패턴을 mirror해 일관성 확보. 새 agent 0(reviewer surface 1 + architect 재사용).

## 결과
- `.claude/skills/validate-discovery/SKILL.md`, `.claude/skills/repair-discovery/SKILL.md`, reviewer `discovery` surface(8 차원), `docs/40-validation/discovery-reviews/`.
- **Codex 호환 (의도적 비대칭)**: `validate-discovery`·`repair-discovery`는 *자연어 호출*만 제공한다(`.agents/skills/` wrapper 미생성). ADR-038은 inner-loop 빈도가 높아 wrapper를 만들었으나, discovery cross-review는 호출 빈도가 낮아 ADR-010 Phase 2 자연어 정책을 따른다(자연어 호출 Codex skill의 목록 SSOT = README.md / README_ko.md — ADR-010 #amend-3). — ADR-038 D5와 의도적으로 다른 점을 명시.

## Ratchet 강도 (ADR-022)
- enabling(약) — opt-in peer review. 자동 차단 X.

## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT)
- .claude/skills/validate-discovery/SKILL.md           — #d1 신설
- .claude/skills/repair-discovery/SKILL.md             — #d2 신설 (agent: architect)
- .claude/agents/reviewer.md                            — #d3 discovery surface 8 차원

## 참고
- ADR-038(cross-LLM plan validation — 본 ADR이 mirror), ADR-035(DISCOVERY SSOT + Evidence Log), ADR-007(책임 경계), ADR-027#amend-1(reviewer surface 패턴).
