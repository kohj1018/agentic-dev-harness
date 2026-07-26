# ADR-058 — Design Workflow (reference flow + acceptance gate + concept cards)

> scope: boilerplate
> area: design

## Status
accepted

> 대체: [ADR-049](ADR-049-concept-mockup-first-design.md)를 supersede한다(디자인 워크플로우 라운드 구조·R0 grounding·시안 정책 전부). ADR-049는 `superseded`로 history 잔존. DESIGN.md *내용*·인터페이스 할당 SSOT는 [ADR-027](ADR-027-interface-decision-allocation.md)이 계속 소유(본 ADR은 흐름·게이트·리서치·시안 카드만).
> 승격 범위(정직 — *status 축*과 *검증 축*은 별개다):
> - **status = `accepted`** — 저장소 `_ADR_GUIDE`상 accepted는 *운영 채택*을 뜻하지 검증 완료가 아니다(wiring이 이미 accepted 전제로 짜여 정합; `trial`은 허용 status가 아니라 분리 불가).
> - **D3 수용 게이트는 지금 constraint** — ADR-022는 constraint에 `[관측됨]` *또는* `[외부실증]`을 요구하고(둘 중 하나면 자격 충족), repo-local `[관측됨]`으로 충족된다. **실측 개선 축은 serious/critical axe**(design-eval — repair loop로 serious 5/8→0/8). 320 overflow·clip은 게이트가 *결정적으로 상시 검사*하는 축이지만 이 eval에서 5/8→0/8 수치를 낸 건 axe다(320/clip을 같은 수치로 뭉뚱그리지 않는다). 별도 "강 승격" 관문은 없다(constraint 자체가 ADR-022 '강').
> - **나머지(R0 evidence-on-demand·REFINE/EXPLORE·cross-model·실화면 a11y)는 directional/enabling — 미검증 명시.**
> - **REPORT §13 용어 정정**: REPORT는 7기준을 "`accepted` 승격 조건"으로 적었으나, 이는 저장소 status(accepted=채택)보다 엄격한 *완전 실증* 의미다. 저장소 거버넌스에선 그 7기준을 **신뢰도(Medium→High)·외부 일반화 승격 조건**으로 읽는다(원본 REPORT는 local-only/gitignored이고 핵심 판정은 SIMULATION_RUN.md design-eval에 distill·보존, 본 ADR이 용어를 정정 — 조용한 덮어쓰기 아님). 기준 2(게이트 결함 0)·3(blind visual 5% 이내 — *게이트와 다른 축*)만 탐색적 충족, 나머지 5개 미검증. 미검증 부분은 아래 재검토 트리거가 관장(충족 시 신뢰도·일반화 승격; 미충족 신호 누적 시 그 부분 후퇴).

## 현재 유효 결정
- `/bootstrap-design` 라운드 구조 SSOT는 본 ADR: R0(리서치 + `DESIGN_RESEARCH.md`) → R1(원칙 + voice 기본값) → R2(다중 concept 시안 — DESIGN.md 작성 *전* 시각 방향 선택) → R3(토큰) → R4(컴포넌트) → R5(DESIGN.md 저장) → R6(파생 preview 확인 + 정리).
- **R0 = evidence-on-demand**(D2): AI 자율 리서치가 디폴트, 사용자 입력은 옵션 힌트. Layer A(방향)/B(값 grounding — 핀 URL)/C(포맷 — R5 fixture만). role 3종, counter-reference 조건부, 고정 쿼터 없음(coverage 정지, 최종 3~5개), 최소 기록 schema.
- **R2/R6 수용 게이트**(D3): full 모드는 concept마다 1280+375 렌더 + 독립 reviewer 픽셀 판정, 320 reflow·populated axe 상시, block/report 등급, repair loop(retry ≤2). *진짜 품질 지렛대*.
- **R2 시안 카드 = REFINE / EXPLORE**(D4): 안전/과감 아님. signature는 primary task 이해를 도울 때만.
- 취향 오라클=사용자, 생성(designer)/감사(reviewer[design]) 분리 유지(D5).

## 배경
- [관측됨] 실사용 fork에서 시안이 단조롭고 어디서 본 듯함 + R0 grounding이 median으로 조용히 후퇴(슬롭 근본원인). 레퍼런스 값 추출이 실제 제품 페이지에서 자주 실패(Linear/Stripe/Vercel 0/3 — markdown 변환으로 CSS 소실).
- [관측됨] repo-local 엄밀 재검증(`.boilerplate/validation/SIMULATION_RUN.md`의 "Design Workflow Eval" 섹션 — Stage1 24안 블라인드 2인 + B3 8안 + holdout 2인, 2브랜드, 실제 1280/375/320 렌더+axe. 원본 산출물(REPORT·concept HTML·metrics)은 무거워 local-only/gitignored, distill이 판정 기록 보존(원자료 수치검산·재현은 불가). ADR-022상 저장소-로컬 평가는 `[관측됨]` — `[외부실증]`은 외부 다중 repo 실증에만): ① 레퍼런스 규칙을 잔뜩 더해도 평균 시각 점수 향상 0, 문맥 +76% ② 최초 24안 중 12안이 serious axe 위반 ③ 실패 selector 되먹임 1회 repair로 3/8→8/8 통과. → 품질을 만든 건 리서치가 아니라 **수용 게이트 폐쇄 루프**.

## 결정
1. **라운드 구조 R0~R6** — 위 현재 유효 결정 순서. `--fast`(R2·R4·R6 생략, R5 저장은 유지) / `--update`(부분 갱신) 존재.
2. **R0 evidence-on-demand**:
   - 디폴트는 **AI 자율 리서치**. 사용자 제공 URL·취향은 *우선 힌트*(prerequisite 아님) — 있으면 Layer A에 우선 반영, 없어도 확인 게이트 없이 자율 진행.
   - **Layer A (방향)**: charter의 기획 방향·서비스 성격에 맞는 디자인 방향·레퍼런스 제품을 AI가 스스로 탐색(정성 방향 어휘).
   - **Layer B (값 grounding)**: Layer A 방향에 맞는 오픈소스 토큰 패키지에서 실제 값 추출 — **핀 고정 목록**(Primer/Radix/Polaris/Tailwind/shadcn 검증된 원본 주소)으로 추측·404 제거. raw CSS + JSON 토큰 엔드포인트까지. mobbin·copycats류 가짜 요약 사이트 거부. 닫힌 제품(Linear 등)은 "추출 불가 — <사유>" 정직 표기.
   - **Layer C (포맷·완성도)**: Google 공식 예시 DESIGN.md(`google-labs-code/design.md/examples`)로 섹션 완성도·빠짐 점검 — **선택이 끝난 R5에서 format fixture로만**(창작 컨텍스트 R0~R2에 넣지 않는다 — 공식 예시 `atmospheric-glass`가 glassmorphism/보라 그라디언트로 §9 anti-slop 위반이라 미감 오염). authoritative는 Google 공식 예시 3종만, `designmd.directory`·커뮤니티 미러는 lead로만.
   - **role 3종**: `task/behavior` · `identity/craft` · `implementation system`. **한 canonical 레퍼런스가 여러 role을 겸하면 우선**(brand-fit과 groundable을 동시에 만족하는 소스 — role은 다중값 허용); 겸비가 불가할 때만 role별로 분리한다(겸용 우선, 안 될 때 분리). counter-reference(안티-레퍼런스)는 별도 role이 아니라 *미해결 tension이나 실제 monoculture가 있을 때만* 추가(mandatory anti-pole 폐기).
   - **고정 최소 개수 없음** — evidence coverage가 차면 정지. designer 최종 입력 보통 3~5개 이하(단순 내부 도구는 더 적게). primary task·결정 순간·실패/복구·정체성 tension을 먼저 적어 리서치의 방향타로 삼는다.
   - concept 안에서는 **coherent primary system 1개**. 명시 gap 시에만 secondary primitive(**Radix는 *색만* fallback** — 타이포/레이아웃/IA/모션은 ground 못함, semantic mapping·대비검증 별도).
   - **관측 기반 주장만**: visual 주장은 실제 화면/스크린샷을 봤을 때만, behavior 주장은 docs/interaction을 봤을 때만 기록. broad search·gallery·Dribbble/Behance는 이름 찾는 lead로만 허용 후 canonical 제품·공식 문서·live 스크린샷·source/token 코드로 승격.
   - **최소 기록 schema** (DESIGN_RESEARCH.md): `source/canonical | role | 뒷받침한 결정 | 검증유형(visual/behavior/code) | 관측일 | borrow | avoid | confidence/caveat`. quality-tier·cluster-quota·groundable-count 같은 실험용 label은 정책 필드로 만들지 않는다(기록 비용 > 결정 품질).
3. **R2/R6 수용 게이트**:
   - **항상(값싼·결정적 — 러너가 계산)**: **320px 브라우저 geometry** — page overflow + **element viewport escape + clipped/truncated text**(narrow ≤375 — design-workflow eval(SIMULATION_RUN.md design-eval; 원본 local-only)의 `check-reflow-320.cjs` `getBoundingClientRect`·overflow-clip 로직 이식) + **populated-state axe**(실데이터 채운 화면 *전제* — 입력 계약; 러너는 axe를 돌리고 "실제로 채워졌는지"는 reviewer 스크린샷이 backstop으로 확인). **overflow·escape·clip은 러너가 결정적으로 잡는다**(design-eval 실측 검증분 — geometry는 픽셀 취향이 아니라 좌표 계산이라 결정 가능). **단 정상 UI 오탐 제외**: sr-only/visually-hidden(1px·clip/clip-path)·aria-hidden/inert/닫힌 drawer·overflow scroll/auto 조상 안(contained 가로스크롤=의도적, 예: 넓은 표)·의도적 `text-overflow:ellipsis`는 escape/clip에서 뺀다(실브라우저 검증분 — 러너 코드에 반영). reviewer 픽셀은 *주관적* 판정(위계·밀도·slop·overlap)만 담당한다.
   - **full 모드**: 각 concept을 1280 + 375로 항상 렌더 → **독립 reviewer(design surface)가 픽셀로** 위계·밀도·domain fit·장식 slop 판정(HTML-read source 감사와 별개 — 세 검사가 서로 다른 결함을 잡아 대체 불가). LLM reviewer는 1명이면 충분.
   - **차단(block) — 러너 결정적**(design-gate.mjs가 계산): serious/critical axe · page overflow · **viewport escape · clipped text**(320/375 geometry). **차단(block) — reviewer 픽셀 판정**(스크린샷으로 판단, 러너가 못 잡는 *주관적* 영역): 위계 붕괴(nested card·장식 rail) · 밀도 · 장식 slop · critical overlap이 primary task를 저해할 때. **보고(report)**: moderate/minor axe + 취향·밀도 finding. **수동 smoke**(자동 불가분): Tab 순서 · visible focus · trap 없음 · Escape close · 색 외 상태표식.
   - **repair loop**(핵심): 실패 selector + 요약을 designer에 되먹여 재실행. **retry ≤2, 초과 시 승인 보류 + brief/source 재검토**(무한 루프 방지), 여전히 fail이면 승인 불가. 통과본 외 임시 렌더/스크린샷은 정리.
   - 게이트는 concept/preview·선택 프로토타입 **1회성에서만**(per-task hot-loop 금지). Playwright/axe는 stack-guard 선설치분 재사용(추가 의존 0).
   - `--fast`/`--update`: research·독립 reviewer 생략은 명시 사유 echo(silent skip 금지). **게이트 적용은 모드가 아니라 산출물 기준** — `--fast`는 R2·R6를 생성하지 않으므로 게이트 적용 대상 없음(N/A), `--update`가 concept/preview를 생성·재생성하면 그 산출물엔 게이트 필수.
4. **R2 시안 카드 REFINE / EXPLORE**: 두 기본안을 **REFINE**(익숙한 task convention 우선 + restrained signature) / **EXPLORE**(signature-led이되 *같은* 익숙한 control/flow 보존)로 정의(안전/과감 아님 — novelty가 목표라는 오해 차단). 3번째 안은 *풀리지 않은 명시적 tension이 있을 때만*. 카드 필드: `task hypothesis | preserved convention | visible signature | failure sign`. **signature가 primary task를 더 빨리 이해시키지 못하면 장식 → 제거**(실험에서 rail·route 장식이 coherence를 해침).
5. **취향 오라클·생성/감사 분리 (D5 — ADR-049 승계)**: 취향 오라클=사용자(선호 추천·순위 금지, 물으면 예외). concept authoring=designer, 구별성·픽셀 감사=reviewer[design](자기 비평 금지). parallel-merge 금지(순차 생성→비평→선택). **harness degradation (Codex 등 독립 subagent 미지원 경로)**: 독립 subagent 격리가 없는 harness에서는 gen/audit가 동일 세션 *순차 페르소나*로 degrade한다 — 이때 (a) designer→reviewer 페르소나 전환을 *명시적 단계*로 끊고, (b) 감사 독립성 저하를 산출물에 `under-verified: 동일 세션 감사`로 명시하며, (c) 완전 독립 감사가 요구되면 사용자 승인 보류. **단 결정적 렌더 게이트(`design-gate.mjs`)는 세션 격리와 무관하게 그대로 실행**되므로 배포불가 결함(serious/critical axe·320 geometry)은 Codex 경로에서도 결정적으로 차단된다(감사 *독립성*이 degrade해도 *안전 게이트*는 유지).

## 근거
- 대안 A(현행 유지 B0): raw 시각/비용은 최선이나, acceptance gate 없이는 배포불가 결함(serious axe)이 승인까지 통과 — 유지 불가.
- 대안 B(리서치 대폭 강화 B1/B2): 평균 시각 향상 0, 문맥 +76%, 고정 lane이 무관 근거를 끌어와 task 적합도↓ — 채택 안 함(축소).
- 채택(B3형 = 얇은 evidence-on-demand + task 기여 2안 + 독립 렌더/DOM 수용 게이트): 실험상 serious 5/8→0/8, holdout 최고안이 incumbent와 0.5/50 차이.
- 신뢰도: **Medium** — 2브랜드·same-model·static prototype·B3 post-hoc라 cross-project 다양성·작은 시각점수 차는 일반화 금지(design-eval 신뢰도·한계 — SIMULATION_RUN.md). directional 근거.
- 재검토 트리거(SIMULATION_RUN.md design-eval = 원 REPORT §13) 7기준(동일 brief 2회 비교 / archetype별 serious·320·clipping 0안 매 반복 제공 / blind 평균 5% 이내 / quota 없음 확인 / --fast·--update silent skip 없음 / Claude·Codex 축소 경로 실행 / 키보드·focus·escape·SR name·동적 상태 실화면 검사)은 **신뢰도(Medium→High)·외부 일반화 승격 조건**이다(accepted 채택 자체를 막는 조건이 아님 — accepted는 이미 성립, D3 constraint는 [관측됨]으로 충족). 미충족 신호가 누적되면 해당 부분(리서치·카드 등 directional)을 후퇴시킨다. archetype 확대·cross-project 다양성 측정 시 재검토.

## Mutation Contract (ADR-047 D3)
1. **Target** — bootstrap-design SKILL R0~R6·`--fast`·`--update` + `allowed-tools`(렌더·axe 실행) / `scripts/design-gate.mjs` 러너 / plan-milestone R5 게이트(allowed-tools + R5-5) / researcher.md 디자인 레퍼런스 모드 / designer.md(카드·signature·PX 마커) / reviewer.md(design surface 렌더 증거·픽셀 판정·bootstrap-design 호출자 등재) / DESIGN_RESEARCH.md 스키마 / stack-guard(populated axe·320 reflow) / DESIGN.md §0 주석 R0~R6 / STRUCTURE·WORKFLOW·.gitignore의 ADR-049→ADR-058 re-point.
2. **Failure mode** — R0 grounding이 median으로 조용히 후퇴 + 독립 감사가 렌더·DOM을 안 봐 배포불가 결함(serious axe·320 overflow) 통과 + 시안이 "다르기만" 하고 안전·평범(전부 관측됨/실측).
3. **Predicted improvement** — serious axe 제거(실측 5/8→0/8) + 320 geometry 결함 차단(별도 결정적 축 — 같은 수치로 뭉뚱그리지 않음), 레퍼런스 값 확보 안정화, REFINE/EXPLORE로 의도된 개성.
4. **Preserved invariants** — DESIGN.md 시각 SSOT / preview·concept ephemeral(ADR-005) / 취향 오라클=사용자 / 생성·감사 분리 / RGR inner-loop 스크린샷 hot-loop 금지(게이트는 1회성 carve-out) / 비-UI DESIGN.md 삭제 경로 / skill auto-invocation 금지 / ADR-027 DESIGN 내용·인터페이스 SSOT 지위.
5. **Falsifying evaluation** — SIMULATION_RUN.md design-eval의 재검토 트리거(= REPORT §13 7기준) 재실행에서 새 흐름이 archetype별 serious/320/clipping 0안을 매 반복 제공 못 하거나 blind 평균이 current 대비 5% 초과 하락하면 게이트·리서치 강도 재조정(ADR-047#amend-1 방법 — 대조군을 둔 저비용 비교 먼저). 정적 검사는 프로젝트 스택 확정 후 해당 도구로 구성한다.
6. **Rollback path** — ADR-058을 *새 supersede ADR*로 되돌린다: ADR-058을 supersede하는 신규 ADR을 발행해 라운드 구조(R0 5단 위계·divergence 카드·visual-QA scaffold)를 재채택하고 렌더 게이트·evidence-on-demand·REFINE/EXPLORE를 제거하며 surface를 새 ADR로 re-point한다. **ADR-049 status를 accepted로 되돌리지 않는다** — supersede는 history 영속(ADR-045)이라 status 되돌리기는 기록 왜곡이다.

## 정책 강도 (ADR-022)
- D3 수용 게이트의 block 등급(serious/critical axe·320 overflow·viewport escape·clipped text)은 **constraint(ADR-022 '강')**. ADR-022는 constraint에 `[관측됨]` *또는* `[외부실증]`을 요구하는데(둘 중 하나면 충족), 게이트가 배포불가 결함(serious/critical axe·320 geometry — WCAG·브라우저 기준)을 제거하는 효과가 `[관측됨]` repo-local 평가(design-eval — serious 5/8→0/8)로 확인되므로 **지금 constraint 자격을 충족**한다. 신뢰도는 Medium 유지 — 외부 다중 repo 실증이 쌓이면 `[관측됨+외부실증]`으로 신뢰도·일반화가 오른다(ADR-022 "제약 강하게"; constraint *자격*은 이미 충족이라 별도 승격 관문 아님). R0 evidence-on-demand·REFINE/EXPLORE·report 등급은 enabling(약).

## 결과
- 디자인 흐름의 품질 지렛대가 "리서치 양"에서 "수용 게이트 폐쇄 루프"로 이동. 레퍼런스는 얇게, 게이트는 결정적으로.

## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT)
- .claude/skills/bootstrap-design/SKILL.md
- .claude/skills/plan-milestone/SKILL.md    — R5-5 프로토타입 수용 게이트 caller(allowed-tools + R5-5; R2-G/R6는 bootstrap-design 소관)
- .claude/skills/stack-guard/SKILL.md
- docs/20-system/DESIGN.md                  — 현재 디자인 흐름 근거
- docs/00-meta/STRUCTURE.md
- docs/00-meta/WORKFLOW.md
- docs/00-meta/DELEGATION_STRATEGY.md
- docs/00-meta/PROJECT_START_CHECKLIST.md
- docs/90-decisions/boilerplate/ADR-027-interface-decision-allocation.md
- docs/90-decisions/boilerplate/ADR-040-external-research-capability.md
- docs/90-decisions/boilerplate/ADR-056-milestone-experience-contract.md
- README.md
- README_ko.md
- .gitignore
- .claude/agents/researcher.md               — 디자인 레퍼런스 모드 evidence-on-demand(Layer A/B/C)
- .claude/agents/designer.md                 — R0 분해 + REFINE/EXPLORE 시안 + repair 되먹임
- .claude/agents/reviewer.md                 — Design Consistency 6차원 + R2-G/R6 게이트 호출자
- scripts/design-gate.mjs                    — D3 수용 게이트 러너(신설)

## 참고
- ADR-027 (DESIGN 내용·인터페이스 SSOT), ADR-040#amend-4 (researcher 디자인 레퍼런스 모드 — 소스 위계는 ADR-058이 부분 supersede), ADR-056 (R5 프로토타입·경험 계약), ADR-047 (mutation contract), ADR-045 (참조 계약), ADR-053 (parallel-merge 금지), ADR-005 (SSOT).
