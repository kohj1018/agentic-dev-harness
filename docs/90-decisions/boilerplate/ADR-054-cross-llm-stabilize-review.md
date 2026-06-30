# ADR-054 — Cross-LLM Stabilize Review (마일스톤 안정화 층 peer review)

> scope: boilerplate

## Status
accepted

## 배경
- [관측됨] ADR-038(plan)·ADR-044(discovery)는 cross-LLM peer review를 제공하나 *마일스톤 안정화 층*(stabilize의 qa·reviewer 판단)엔 대응물이 없다. stabilize는 read-only 리뷰와 stateful 실행(validate/e2e/audit + tracked-doc 쓰기)을 한 skill에 묶어, 멀티모델 병렬 시 e2e 충돌(포트·테스트DB·Playwright outputDir·빌드캐시 — ADR-038 면책 단락) + tracked-doc(QA_FINDINGS/IMPROVEMENT_GUIDE) clobber.
- [관측됨] 실행은 고정 checkout에서 결정적 → 2번째 모델 신호 0, 충돌만. 다양성 가치는 판단(qa/reviewer)에만.
- [외부실증] Ning et al. 2026, *Code as Agent Harness* (arXiv:2605.18747) §4.1.2 — cross-LLM critique-and-repair(ADR-038/044 계승).

## 결정
1. `/validate-milestone [M] [--reviewer-tag <tag>]` 신설 — read-only 검토(qa 엣지케이스·회귀 + reviewer 부채), 임시 파일 `docs/40-validation/stabilize-reviews/<M>.<tag>.md`. **코드·문서·실행 X(Bash 없음 — e2e 충돌 차단).** 결정적 preflight·validate·e2e·audit 재실행 안 함. ADR-038 `/validate-plan` 패턴의 stabilize 층 mirror.
2. **실행 single-origin**: stabilize-milestone(origin)이 validate/e2e/audit + tracked-doc 쓰기 + 졸업판정을 *한 번만*. 같은 checkout 동시 stabilize 금지.
3. `repair-milestone`(stabilize 짝, ADR-052 D4 소유) 확장 — stabilize-reviews 회수·4-판정·3중 dedup·적용·삭제. **종료 가드 확장**: QA_FINDINGS·IMPROVEMENT_GUIDE *그리고 stabilize-reviews*가 모두 비었을 때만 종료(peer P0 누락 방지). 삭제는 echo-then-rm(무제한 Bash라 prompt-level echo가 안전 가드).
4. verdict는 리뷰 라벨이지 워크플로 차단 아님(ADR-038/007). opt-in.
5. **Codex 호환 (의도적 비대칭 — ADR-044 D-codex 선례)**: `validate-milestone`은 *자연어 호출*만(`.agents/skills/` wrapper 미생성 — 저빈도 cross-review, ADR-010 Phase 2 / 목록 SSOT=README). repair-milestone은 기존 Codex 경로 유지.

## 근거
- 검증된 ADR-038/044 패턴 mirror로 일관성. 새 agent 0(qa/reviewer 재사용). read-only/single-origin 분리로 e2e 충돌 차단.

## 결과
- `.claude/skills/validate-milestone/SKILL.md`(신규), repair-milestone(확장), stabilize-milestone(single-origin), `docs/40-validation/stabilize-reviews/`, .gitignore. STRUCTURE 산출물 표·로스터 + README 자연어 Codex 목록(양 README의 정책 요약 문단·명시 목록 *둘 다*) + DELEGATION_STRATEGY 위임 표 + WORKFLOW §5·라이프사이클 흐름은 migration 적용 대상(Surfaces 아님).

## Mutation Contract (ADR-047 D3)
1. Target — validate-milestone 신설 / repair-milestone 회수·dedup·종료가드·echo-rm / stabilize single-origin / .gitignore / STRUCTURE 산출물 표+로스터 / README 자연어 Codex 목록 / DELEGATION_STRATEGY 위임 표 / WORKFLOW §5·라이프사이클 흐름.
2. Failure mode — stabilize가 read-only 리뷰와 stateful 실행을 묶어 멀티모델 병렬 시 e2e 충돌 + tracked-doc clobber; repair-milestone 종료가드가 peer P0 누락.
3. Predicted improvement — read-only 리뷰만 모델별 병렬 → 다양성 + 충돌 0; repair-milestone이 origin·peer finding 단일 종합.
4. Preserved invariants — stabilize read-only 본질(코드·커밋·status 미변경) / 실행 origin 단일 / repair-milestone cross-cutting·per-task routing(ADR-052 D4) 불변 / opt-in.
5. Falsifying evaluation — dogfood에서 peer가 origin과 거의 동일 finding만 내면 validate-milestone을 opt-in 최소로 후퇴.
6. Rollback path — superseded → validate-milestone·stabilize-reviews 제거, repair-milestone를 stabilize-only 회수로 환원.

## Ratchet 강도 (ADR-022)
- enabling(약) — opt-in. 자동 차단 X.

## Surfaces
- .claude/skills/validate-milestone/SKILL.md
- .claude/skills/repair-milestone/SKILL.md
- .claude/skills/stabilize-milestone/SKILL.md
- .gitignore

## 참고
- ADR-038(plan cross-LLM — mirror), ADR-044(discovery cross-LLM — mirror + Codex 자연어 비대칭 선례), ADR-052 D4(repair-milestone 소유), ADR-014(졸업), ADR-007(책임 경계), ADR-047 D3(Mutation Contract), Ning et al. 2026 (arXiv:2605.18747).
