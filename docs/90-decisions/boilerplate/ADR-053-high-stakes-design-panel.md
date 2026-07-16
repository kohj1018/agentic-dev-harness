# ADR-053 — 고-stakes 설계 패널 (stakes-gated design protocol)

> scope: boilerplate
> area: process

## Status
accepted

## 배경
- [관측됨] 중요한 설계 결정(스택·구조·마일스톤 분할)이 architect *단발 호출*로 빠르게 내려지고, 웹리서치는 옵션, 다중 후보·적대 검증이 없다 → 결정 품질이 비중에 못 미친다.
- [외부실증] arXiv 2606.01490 (2026) *LLM Consortium for Software Design Refinement* — single-shot 설계는 낮은 품질 baseline; 구조적 적대 리뷰(전면 재작성 요구)가 최상위 + cross-model review가 차순위; **parallel-merge(N개 완성안 병합)는 최악**(토큰 기아). arXiv 2604.04990 (2026) *Architecture Without Architects* — 에이전트가 프롬프트만으로 프레임워크/DB를 초 단위 결정, 근거 0.

## 결정
1. **stakes 게이트** — 메인 세션(설계 skill)이 자가점검:
   - (S1) 되돌리기 비싼 기술 토대(언어/런타임/프레임워크/DB·영속성/인증·인가/배포 토폴로지/핵심 외부 의존).
   - (S2) 합리적 대안 2개 이상 실재.
   - (S3) 영향이 3+ 모듈 또는 여러 surface(API+FE+DB 등) 가로지름.
   - (S4) charter 제약·비목표 / 보안 경계 / 개인정보·데이터 모델 / 마이그레이션.
   - (S5) ADR-031 직접지원 5종 밖 라이브러리거나, 모델이 그 lib의 *현재 버전/API*에 확신 없음.
   - **판정**: S1~S4 중 1+ YES → **full 패널**. **S5만 YES**(설계 트레이드오프 자명) → **리서치-only**(다각도·적대 불요 — 버전 확인이면 충분). 전부 NO → **fast path**(architect 단발, 현행).
2. **3단 강도** (full 패널):
   - ① **웹 리서치 (must-or-flag)**: 외부 lib/version 걸리면 researcher에 Agent 위임(ADR-040 — 최신 공식문서·버전, 품질 규율 ADR-040#amend-3). 오프라인/미발견이면 *날조 말고* `Needs Research` emit + 나머지 작성 계속(hard-block 아님).
   - ② **다각도 2~3안 (default)**: architect가 *다른 각도*(MVP/risk/scale-first)로 후보. 비용 ≈ 프롬프트 1줄.
   - ③ **적대 재검토 (recommend — 최상위만)**: S1·S3·S4 중 *2개 이상* YES면 *두 번째 architect*가 red-team("패치 말고 전면 재작성" 요구) 후 종합. **`/review-doc` 미사용**(그 skill은 문서 비평 전용). cross-model(별 Codex 세션)은 opt-in 상위. **parallel-merge 금지 — 순차 생성→비평→종합.**
   - ④ **기록**: ARCHITECTURE §7 결정 블록 + (해당 시) ADR.
3. **backstop (executable governance, best-effort)**: stabilize preflight가 ARCHITECTURE_OVERVIEW `## 7`의 *실제 작성된*(HTML 주석 placeholder 제외) 결정 블록에서 필수 칸(옵션≥2/신뢰도/재검토)이 비면 `P2 [Design-rationale]` 보고. **한계**: 고-stakes 결정을 *한 줄 산문으로* 써버린 경우는 못 잡는다(블록 부재를 고-stakes로 단정 불가) — 게이트의 1차 책임은 설계 skill 자가점검.

## 근거
- 게이트로 사소한 결정은 빠르게(ADR-006), 중요한 결정만 무겁게. S5를 리서치-only로 분리 — 버전 모름은 리서치로 해결되지 다각도 패널 불요.
- 적대 패스는 architect(도메인 일치)로 — review-doc 의도(문서 비평) 보존. parallel-merge는 연구상 최악이라 명시 금지.

## 결과
- architect.md(행동) + bootstrap-stack/bootstrap-project/plan-milestone(게이트 참조) + ARCHITECTURE_OVERVIEW/_ADR_GUIDE(기록 양식) + stabilize-milestone(backstop) + researcher.md(리서치 품질, ADR-040#amend-3).

## Surfaces
- .claude/agents/architect.md
- .claude/skills/bootstrap-stack/SKILL.md
- .claude/skills/bootstrap-project/SKILL.md
- .claude/skills/plan-milestone/SKILL.md
- docs/20-system/ARCHITECTURE_OVERVIEW.md
- docs/90-decisions/boilerplate/_ADR_GUIDE.md
- .claude/skills/stabilize-milestone/SKILL.md

## Mutation Contract (ADR-047 D3)
1. Target — architect.md 고-stakes 행동 / 3 design skill 게이트 참조 / ARCHITECTURE §7 결정 블록 + _ADR_GUIDE 신뢰도·재검토 필드 / stabilize §1.0 backstop.
2. Failure mode — 중요한 설계가 single-shot·근거 미기록으로 품질 저하.
3. Predicted improvement — 고-stakes 결정에 리서치+다각도+(최상위)적대+근거기록 → 품질·추적성 상승.
4. Preserved invariants — fast path(저-stakes 단발) 유지 / researcher report-only / review-doc 용도 불변 / parallel-merge 금지.
5. Falsifying evaluation — 게이트가 사소한 결정에 과발동(매 결정 8칸) 또는 고-stakes에 미발동이면 게이트 신호 재조정.
6. Rollback path — 본 ADR superseded + 3 skill 게이트 참조 블록 제거(ARCHITECTURE/_ADR_GUIDE 양식은 무해 잔존).

## Ratchet 강도 (ADR-022)
- enabling(약, [외부실증]) — full 패널은 게이트 발동 시; ①만 hard-ish(날조 금지), ②③ default/recommend.

## 참고
- ADR-006(단순성 게이트), ADR-040(researcher·리서치 품질), ADR-038(cross-LLM 정신), ADR-031(지원 스택), ADR-014(마일스톤), ADR-047 D3(Mutation Contract).

<a id="adr-053-amend-1"></a>
## Amendment 1 (2026-07-16) — ④ "(해당 시) ADR"의 판정 기준·작성 주체 구체화
결정 2의 ④ "(해당 시) ADR"은 [ADR-000 Amendment 2](ADR-000-boilerplate-decision-policy.md#adr-000-amend-2) 결정 3의 판정 기준(비-스택 프로세스/제품 범위/보안 결정 · boilerplate supersede · cross-마일스톤 재검토 트리거 필요)을 따르고, 작성 주체·시점은 그 트리거 표(그 라운드를 운전한 skill이 결정 확정 시점에 architect sub-call로 초안)가 SSOT다.
