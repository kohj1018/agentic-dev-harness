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
- **R2/R6 수용 게이트**(D3): full 모드는 concept마다 1280+375 렌더 + 독립 reviewer 픽셀 판정, 320 reflow·populated axe 상시, block/report 등급, repair loop(retry ≤2). UI 판정 뒤 `/stack-guard`가 JIT canonical asset을 project-native `validate:design` adapter로 물질화하고, 고정 fixture conformance와 source digest를 통과한 v2만 사용한다(#amend-1·#amend-2). *진짜 품질 지렛대*.
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
   - **차단(block) — 러너 결정적**(당시 `design-gate.mjs`, 현재 #amend-2 canonical `validate:design` adapter가 계산): serious/critical axe · page overflow · **viewport escape · clipped text**(320/375 geometry). **차단(block) — reviewer 픽셀 판정**(스크린샷으로 판단, 러너가 못 잡는 *주관적* 영역): 위계 붕괴(nested card·장식 rail) · 밀도 · 장식 slop · critical overlap이 primary task를 저해할 때. **보고(report)**: moderate/minor axe + 취향·밀도 finding. **수동 smoke**(자동 불가분): Tab 순서 · visible focus · trap 없음 · Escape close · 색 외 상태표식.
   - **repair loop**(핵심): 실패 selector + 요약을 designer에 되먹여 재실행. **retry ≤2, 초과 시 승인 보류 + brief/source 재검토**(무한 루프 방지), 여전히 fail이면 승인 불가. 통과본 외 임시 렌더/스크린샷은 정리.
   - 게이트는 concept/preview·선택 프로토타입 **1회성에서만**(per-task hot-loop 금지). Playwright/axe는 stack-guard 선설치분 재사용(추가 의존 0).
   - `--fast`/`--update`: research·독립 reviewer 생략은 명시 사유 echo(silent skip 금지). **게이트 적용은 모드가 아니라 산출물 기준** — `--fast`는 R2·R6를 생성하지 않으므로 게이트 적용 대상 없음(N/A), `--update`가 concept/preview를 생성·재생성하면 그 산출물엔 게이트 필수.
4. **R2 시안 카드 REFINE / EXPLORE**: 두 기본안을 **REFINE**(익숙한 task convention 우선 + restrained signature) / **EXPLORE**(signature-led이되 *같은* 익숙한 control/flow 보존)로 정의(안전/과감 아님 — novelty가 목표라는 오해 차단). 3번째 안은 *풀리지 않은 명시적 tension이 있을 때만*. 카드 필드: `task hypothesis | preserved convention | visible signature | failure sign`. **signature가 primary task를 더 빨리 이해시키지 못하면 장식 → 제거**(실험에서 rail·route 장식이 coherence를 해침).
5. **취향 오라클·생성/감사 분리 (D5 — ADR-049 승계)**: 취향 오라클=사용자(선호 추천·순위 금지, 물으면 예외). concept authoring=designer, 구별성·픽셀 감사=reviewer[design](자기 비평 금지). parallel-merge 금지(순차 생성→비평→선택). **harness degradation (Codex 등 독립 subagent 미지원 경로)**: 독립 subagent 격리가 없는 harness에서는 gen/audit가 동일 세션 *순차 페르소나*로 degrade한다 — 이때 (a) designer→reviewer 페르소나 전환을 *명시적 단계*로 끊고, (b) 감사 독립성 저하를 산출물에 `under-verified: 동일 세션 감사`로 명시하며, (c) 완전 독립 감사가 요구되면 사용자 승인 보류. **단 결정적 렌더 게이트(`STACK_SETUP_PLAN.md ## Design Gate Adapter`의 current-ready command)는 세션 격리와 무관하게 그대로 실행**되므로 배포불가 결함(serious/critical axe·320 geometry)은 Codex 경로에서도 결정적으로 차단된다(감사 *독립성*이 degrade해도 *안전 게이트*는 유지).

## 근거
- 대안 A(현행 유지 B0): raw 시각/비용은 최선이나, acceptance gate 없이는 배포불가 결함(serious axe)이 승인까지 통과 — 유지 불가.
- 대안 B(리서치 대폭 강화 B1/B2): 평균 시각 향상 0, 문맥 +76%, 고정 lane이 무관 근거를 끌어와 task 적합도↓ — 채택 안 함(축소).
- 채택(B3형 = 얇은 evidence-on-demand + task 기여 2안 + 독립 렌더/DOM 수용 게이트): 실험상 serious 5/8→0/8, holdout 최고안이 incumbent와 0.5/50 차이.
- 신뢰도: **Medium** — 2브랜드·same-model·static prototype·B3 post-hoc라 cross-project 다양성·작은 시각점수 차는 일반화 금지(design-eval 신뢰도·한계 — SIMULATION_RUN.md). directional 근거.
- 재검토 트리거(SIMULATION_RUN.md design-eval = 원 REPORT §13) 7기준(동일 brief 2회 비교 / archetype별 serious·320·clipping 0안 매 반복 제공 / blind 평균 5% 이내 / quota 없음 확인 / --fast·--update silent skip 없음 / Claude·Codex 축소 경로 실행 / 키보드·focus·escape·SR name·동적 상태 실화면 검사)은 **신뢰도(Medium→High)·외부 일반화 승격 조건**이다(accepted 채택 자체를 막는 조건이 아님 — accepted는 이미 성립, D3 constraint는 [관측됨]으로 충족). 미충족 신호가 누적되면 해당 부분(리서치·카드 등 directional)을 후퇴시킨다. archetype 확대·cross-project 다양성 측정 시 재검토.

## Mutation Contract (ADR-047 D3)
1. **Target** — bootstrap-design SKILL R0~R6·`--fast`·`--update` + `allowed-tools`(렌더·axe 실행) / stack-guard JIT canonical design-gate asset + generated `validate:design` adapter / plan-milestone R5 게이트(allowed-tools + R5-5) / researcher.md 디자인 레퍼런스 모드 / designer.md(카드·signature·PX 마커) / reviewer.md(design surface 렌더 증거·픽셀 판정·bootstrap-design 호출자 등재) / DESIGN_RESEARCH.md 스키마 / stack-guard(populated axe·320 reflow) / DESIGN.md §0 주석 R0~R6 / STRUCTURE·WORKFLOW·.gitignore의 ADR-049→ADR-058 re-point.
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
- .claude/skills/stabilize-milestone/SKILL.md — #amend-3 결정 5 `[Guard-drift]` (e) visual-QA 전제 기록 회수
- docs/20-system/DESIGN.md                  — 현재 디자인 흐름 근거
- docs/00-meta/STRUCTURE.md
- docs/00-meta/GUARDRAILS_STRATEGY.md
- docs/00-meta/_templates/STACK_SETUP_PLAN_TEMPLATE.md
- docs/00-meta/WORKFLOW.md
- docs/00-meta/DELEGATION_STRATEGY.md
- docs/00-meta/PROJECT_START_CHECKLIST.md
- docs/90-decisions/boilerplate/ADR-027-interface-decision-allocation.md
- docs/90-decisions/boilerplate/ADR-040-external-research-capability.md
- docs/90-decisions/boilerplate/ADR-056-milestone-experience-contract.md
- README.md
- README_ko.md
- .gitignore
- .gitattributes                            — canonical asset + materialized `.mjs` adapter LF bytes 보존
- .claude/agents/researcher.md               — 디자인 레퍼런스 모드 evidence-on-demand(Layer A/B/C)
- .claude/agents/designer.md                 — R0 분해 + REFINE/EXPLORE 시안 + repair 되먹임
- .claude/agents/reviewer.md                 — Design Consistency 6차원 + R2-G/R6 게이트 호출자
- scripts/README.md                          — baseline 프로젝트 실행 코드 없음 + UI adapter 생성 경계
- .claude/skills/stack-guard/assets/design-gate.mjs — direct-support Node UI canonical adapter
- .claude/skills/stack-guard/assets/design-gate-conformance.mjs — 고정 fixture·기대값·source digest conformance

## 참고
- ADR-027 (DESIGN 내용·인터페이스 SSOT), ADR-040#amend-4 (researcher 디자인 레퍼런스 모드 — 소스 위계는 ADR-058이 부분 supersede), ADR-056 (R5 프로토타입·경험 계약), ADR-047 (mutation contract), ADR-045 (참조 계약), ADR-053 (parallel-merge 금지), ADR-005 (SSOT).

<a id="adr-058-amend-1"></a>
## Amendment 1 (2026-07-26) — baseline runner 제거 + UI project-native gate 조건부 생성

### 배경
- [관측됨] shared baseline의 `scripts/design-gate.mjs`는 Node·Playwright·axe를 전제하지만, `GUARDRAILS_STRATEGY.md`와 `scripts/README.md`는 런타임 종속 검증 코드를 스택 확정 뒤 생성하도록 규정한다. `STRUCTURE.md`가 이 파일을 `baseline`으로 둔 상태는 문서 중심·cross-stack 보일러플레이트 경계와 충돌한다.
- [관측됨] 비-UI fork 정리 절차는 `DESIGN.md`만 삭제하므로 UI가 없는 API/CLI 프로젝트에도 실행 코드와 스크린샷 ignore가 남는다.
- [관측됨] 게이트 자체는 제거할 수 없다. design-eval에서 serious axe 위반이 repair loop로 5/8→0/8이 되었고, 정적 concept/preview/prototype은 구현 앱용 `visual-qa.spec`보다 먼저 검증돼야 한다.

### 결정
1. **baseline 실행물 제거**: 보일러플레이트는 `scripts/design-gate.mjs`를 포함하지 않는다. ADR-058 D3의 품질 계약은 유지하되 실행 adapter는 UI 판정 후에만 물질화한다.
2. **단일 생성자**: `/stack-guard`가 ADR-027#amend-3으로 UI 확정/의심을 판정한 경우에만 감지된 test runner·package manager에 자연스러운 project-native adapter와 논리 진입점 **`validate:design`**을 생성한다. 비-UI면 adapter·Playwright browser·axe·`validate:design`을 생성하지 않는다.
3. **명령 registry**: `/stack-guard`는 `STACK_SETUP_PLAN.md ## Design Gate Adapter`에 `status | command template | adapter path | output path | capability version`을 기록한다. `/bootstrap-design` R2-G/R6와 `/plan-milestone` R5-5는 경로를 추측하거나 baseline 파일을 찾지 않고 이 표의 `command template`만 실행한다.
4. **fail-closed preflight**: UI 산출물이 있는데 registry가 없거나 adapter self-test가 미통과면 `Needs Design Gate: /stack-guard`로 승인·프로토타입 승격을 보류한다. MCP·LLM 육안·`visual-qa.spec`만으로 대체하거나 silent skip하지 않는다.
5. **capability contract v1**: adapter는 정적 HTML 다중 입력/glob, 뷰포트별 fresh render(1280/375/320), font readiness, 3뷰포트 screenshot, page overflow, narrow viewport escape, self/ancestor clipped text, populated axe(1280/320), serious/critical 차단, moderate/minor·axe incomplete 보고, 구조화된 성공/차단/실행불가 결과를 제공한다. 정상 UI 제외는 sr-only 조상·`aria-hidden`/`inert`/`hidden`·accessible-name과 keyboard focus를 가진 실제 가로 overflow container·ellipsis다. 세로-only scroll은 가로 escape 제외 사유가 아니다. `label-content-name-mismatch`는 experimental 기본 비활성에 의존하지 않고 명시 활성화한다.
6. **생성 직후 conformance self-test**: `/stack-guard`는 adapter를 실제 browser로 검사한다. 최소 케이스는 clean pass / page overflow / viewport escape / self clip / ancestor clip / vertical-scroll escape / accessible horizontal-scroll pass / sr-only·hidden·ellipsis pass / serious axe / `label-content-name-mismatch`이며, 기대 blocker/report와 exit 분류가 모두 일치해야 `status: ready`를 기록한다. 모듈·browser 부재는 `Needs Install`, 구현/fixture 불일치는 `WIRING FAIL`; 둘 다 `ready` 금지다.
7. **구현 앱 검사와 공유**: 기존 `visual-qa.spec`을 유지하되, 가능한 runner에서는 geometry·axe assertion을 같은 generated helper/adapter에서 재사용한다. 기존 spec을 발견했다는 이유로 design adapter 생성을 생략하지 않는다. 두 surface의 차이는 design adapter=정적 승인 artifact, visual QA=구현 앱이다.
8. **마이그레이션**: 기존 fork에 baseline `scripts/design-gate.mjs`가 있으면 `/stack-guard`가 현재 project-native adapter로 흡수하고 registry+self-test 성공 후에만 구 파일 삭제를 제안한다. UI→비-UI 전환은 사용자 확인 뒤 generated adapter/entry만 제거하며 다른 project script는 건드리지 않는다.

### 대안과 트레이드오프
- baseline runner 유지: 검증 재현성은 가장 단순하지만 non-UI baggage와 shared Node 전제 충돌을 보존하므로 기각.
- `.boilerplate/tools` 이동: 제품 코드 경계는 나아지지만 baseline 실행 코드·런타임 전제가 남아 근본 해결이 아니므로 기각.
- version-pinned 외부 CLI: 중앙 패치와 bit-for-bit 재현성은 가장 강하지만 별도 패키지 배포·네트워크·공급망 운영비가 현재 보일러플레이트 규모보다 크다. 외부 다중 repo 운영이 생기면 재검토.
- MCP/LLM/수동 검사: baseline 코드는 없어지지만 결정적 axe·geometry·exit 계약을 보장하지 못해 D3 constraint를 약화하므로 기각.

### 적용 surface
- `.claude/skills/stack-guard/SKILL.md`: UI-only adapter 생성·registry·self-test 단일 writer.
- `.claude/skills/bootstrap-design/SKILL.md`, `.claude/skills/plan-milestone/SKILL.md`: registry command 소비 + missing/not-ready hard stop.
- `docs/00-meta/_templates/STACK_SETUP_PLAN_TEMPLATE.md`: adapter registry schema.
- `docs/00-meta/STRUCTURE.md`, `docs/00-meta/GUARDRAILS_STRATEGY.md`, `scripts/README.md`: baseline→conditional/generated 경계.
- `docs/20-system/DESIGN.md`, `.claude/agents/reviewer.md`, `ADR-027#amend-7`: 특정 파일명 대신 project-native gate capability를 인용.
- `.gitignore`: canonical output 선제 ignore + 비-canonical output의 first-run-before append 계약.

### 강도 및 Mutation delta
- **ADR-045 D6 판단**: 새로 추가되는 surface는 GUARDRAILS_STRATEGY.md와 STACK_SETUP_PLAN_TEMPLATE.md 2개이며, D3의 차단 등급·라운드 구조·repair loop는 바꾸지 않는다. baseline 파일 배치는 design workflow 정책의 reversal이 아니라 실행물 소유 위치 정합화이므로 supersede 대신 amendment로 기록한다. 이후 게이트 강도나 라운드 구조를 바꾸면 신규 superseding ADR을 사용한다.
- D3의 serious/critical axe·320/375 geometry 차단 강도는 **constraint 그대로**다. 바뀌는 것은 실행물의 물질화 시점과 소유자뿐이며, 게이트 미준비 시 fail-closed라 품질 완화가 아니다.
- **Mutation delta (ADR-047 D3)**: failure=baseline runner 삭제 뒤 UI adapter 미생성·미기록·미실행 또는 생성 구현이 v1 capability 일부를 누락 / predicted improvement=비-UI fork 실행 코드 0 + stack-specific 생성 원칙 정합, D3 결함 검출력 보존 / preserved=base Mutation Contract의 DESIGN SSOT·사용자 취향 오라클·생성/감사 분리·gate repair loop·비-UI 삭제 경로 / falsifier=UI dogfood self-test 10케이스 중 하나라도 기대 분류 불일치, runtime caller의 `scripts/design-gate.mjs` hardcode 잔존, 비-UI dogfood에 gate artifact 생성 / rollback=amend-1을 supersede하는 후속 ADR로 baseline runner 복원(ADR-058 D3 자체는 유지).
<a id="adr-058-amend-2"></a>
## Amendment 2 (2026-07-26) — canonical asset + fixed conformance + upgrade/recovery

### 배경과 v1 증거 정정
- [관측됨] v1 UI fixture의 generated adapter는 삭제 전 baseline runner와 138줄·SHA-256이 byte-identical했다. 따라서 기존 `10/10`은 **검증된 legacy 구현의 행동 보존**은 증명했지만, 산문 capability만으로 독립 authoring한 구현의 재현성은 증명하지 않았다. `SIMULATION_RUN.md`의 v1 판정 범위를 이 한계에 맞게 정정한다.
- [관측됨] v1 conformance fixture·기대값도 실행 시 생성돼 구현과 oracle이 같은 산문에서 파생되는 자기참조 위험이 있었다. stale screenshot 정리, 동일 basename 배치, 파일별 render-error 격리, ±1px 허용오차, 예외 경로 browser 종료는 10 logical behavior case가 직접 고정하지 않았다.
- [관측됨] caller의 missing/not-ready preflight 문구는 존재하지만 실제 `Needs Design Gate` 행동 fixture 기록이 없었다.
- **UI 순서 재판정**: 정상 순서가 `/bootstrap-stack → /stack-guard → /bootstrap-design`이라 DESIGN status가 draft인 것은 맞다. 그러나 `/bootstrap-stack`은 frontend면 ARCH 7-4를 채우므로 정상 흐름은 ADR-027#amend-3의 **UI 의심** 분기로 adapter를 만든다. "항상 비-UI 오판"은 사실이 아니다. 다만 초기 신호 부족으로 `n/a`가 된 뒤 frontend가 확인되는 재실행 복구는 명시가 필요하다.

### 결정
1. **JIT canonical asset**: direct-support Node UI의 정본은 `.claude/skills/stack-guard/assets/design-gate.mjs`다. `/stack-guard`는 UI 확정/의심 때만 이 asset을 읽어 project-native 경로로 byte-copy하고 entry를 배선한다. 비-UI에서는 asset을 읽거나 복사하거나 design 의존/browser를 설치하지 않는다. `.boilerplate/`는 검증 Record 전용이므로 executable 정본을 두지 않으며, Git history 회수는 squash/template-copy에서 깨져 정본 경로로 쓰지 않는다.
2. **외부 oracle + source integrity**: `.claude/skills/stack-guard/assets/design-gate-conformance.mjs`가 source digest, 고정 HTML fixture, 기대 exit/blocker/report/screenshot을 소유한다. 현재 suite는 기존 10 behavior case에 same-basename batch, stale screenshot cleanup, per-file render-error isolation, 1px tolerance pass, 2px escape block, bounded process completion을 더한다. 생성 agent가 fixture·기대값을 authoring하지 않는다. oracle은 adapter 인자가 readable file이 아니면 구조화 exit 2를 내고, adapter의 execution-unavailable exit 2를 그대로 승계한다. `.gitattributes`의 `*.mjs text eol=lf`가 canonical asset과 materialized adapter를 함께 고정해 `core.autocrlf=true`인 Windows fresh clone에서도 digest bytes를 보존한다.
3. **capability v2 registry**: current version은 `ADR-058#amend-2/v2`. registry에 `source digest`를 추가하고 direct-support Node UI는 generated bytes가 canonical digest와 같고 fixed conformance가 전부 통과할 때만 `ready`다. v1/누락/낮은 version은 current-ready가 아니다.
4. **재실행·업그레이드**: `/stack-guard`는 매 실행 UI 신호와 registry를 다시 계산한다. 낮은 version의 adapter는 기록된 source digest와 실제 bytes가 같을 때 미수정으로 본다. digest 필드가 없던 legacy v1은 실제 bytes가 canonical digest와 같을 때만 미수정으로 인정한다. 이 경우 canonical v2로 자동 교체 후 전체 conformance를 재실행한다. 어느 기준도 충족하지 않으면 사용자 수정으로 보고 덮어쓰지 않으며 `wiring-fail (local modifications)`로 보류하고 diff/채택 결정을 요청한다. current digest가 같아도 conformance는 다시 실행한다.
5. **UI 재분류 복구**: 기존 `status=n/a`라도 이후 ARCH 7-4/frontend stack 신호가 생기면 같은 `/stack-guard` 재실행이 UI로 재분류해 adapter를 생성한다. caller는 missing/n/a/lower-version/not-ready에서 최종 artifact를 쓰거나 승격하지 않고 `Needs Design Gate: /stack-guard`를 출력한다.
6. **behavior fixture**: caller fail-closed는 ADR-047#amend-1 방식으로 missing / n/a / needs-install / wiring-fail / ready-current 5입력을 대조한다. 앞 4개는 command 미실행 + concept/preview/prototype 최종 경로 bytes 불변, 마지막만 registry command 실행이 기대값이다. 단일 성공 실행을 일반화 증거로 쓰지 않는다.
7. **output ignore 정합**: canonical Node asset의 output은 `design-gate-shots/`로 고정하므로 baseline `.gitignore`를 유지한다. 다른 project-native adapter가 다른 output path를 쓰면 `/stack-guard`가 **첫 실행 전** 그 정확한 경로를 `.gitignore`에 추가한다. Amendment 1의 `.gitignore` surface 설명은 단순 주석 일반화가 아니라 이 producer/output 계약으로 정정한다.

### 대안·거버넌스
- SKILL fenced source: 비-UI 실행도 138줄+를 매번 읽어 ADR-019 JIT에 역행하므로 기각.
- `.boilerplate/tools`: 현재 STRUCTURE상 self-validation Record 영역을 executable template 저장소로 확장하므로 기각.
- `git show <old-commit>`: full-history clone에서는 싸지만 squash/template-copy/새 저장소에서 깨지므로 기각.
- ADR-045 D6: 신규 surface는 canonical asset 2개 + clone-stable bytes용 `.gitattributes` 1개이며 D3의 차단 강도·라운드 구조는 그대로다. v1 materialization의 oracle/recovery를 충돌 없이 강화하므로 amendment로 기록한다.

### Mutation Contract delta (ADR-047 D3)
1. **Target** — stack-guard canonical adapter/conformance assets, 6-1/6-4-1/version migration, bootstrap-design R2-G/R6와 plan-milestone R5-5 current-ready preflight.
2. **Failure mode** — 산문에서 구현·fixture·기대값을 함께 재생성해 같은 오류를 공유하거나, lower/local-modified adapter를 조용히 덮어쓰거나, missing/not-ready caller가 artifact를 승격.
3. **Predicted improvement** — direct-support Node UI generated source digest 100% 일치, fixed conformance 전부 통과, caller negative 4상태 command 실행 0·final bytes 변경 0.
4. **Preserved invariants** — D3 axe/geometry block 등급, 비-UI project runtime artifact 0, 사용자 취향 오라클, visual-QA 별도 surface, project-native registry entry.
5. **Falsifying evaluation** — canonical digest 불일치인데 ready, fixed conformance case 하나라도 오분류, negative caller가 command/final write 수행, n/a→UI 재분류 재실행이 adapter를 생성하지 못하면 rollback/rework.
6. **Rollback path** — Amendment 2를 supersede하는 후속 ADR로 prose-authoring v1 또는 version-pinned external package를 선택한다. D3 품질 게이트 자체는 유지한다.

<a id="adr-058-amend-3"></a>
## Amendment 3 (2026-08-09) — visual-QA 전제 미충족의 표현 고정

### 배경
- [관측됨] `#amend-2`가 규정한 visual-QA scaffold는 *"앱이 비어 있으면 대상 landmark 부재 graceful skip은 허용"* 이라고만 정하고 **그 skip을 어떻게 표현할지를 정하지 않았다.** 실제 파일럿에서 접근성 검사 spec이 `testInfo.annotations.push(...)` + `return`으로 빠져나갔고, 러너는 이를 **passed로 집계**했다 — 레지스트리에 `실행 5 / skip 0`이 기록됐지만 그중 4건은 검사를 한 번도 실행하지 않았다.
- [관측됨] "앱이 비어 있음"을 *대상 landmark 부재* 로 판정하게 되어 있어, **selector·라우트·wiring이 깨진 경우와 구분되지 않는다.** 두 경우가 같은 신호를 내면 배선 결함이 정상 skip으로 숨는다.

### 결정
1. **판정 보류는 runner-native skip으로만 표현한다.** `test.skip()`(또는 그 스택의 동등 API)만 허용하고, **annotation만 남기고 `return`하는 형태를 금지한다.** 러너 통계의 `skipped`가 진실을 담아야 졸업 판정(ADR-052#amend-1)이 성립한다.
2. **전제는 판정하지 말고 소유한다(1차).** spec이 스스로 seed/fixture로 populated 상태를 만든 뒤 검사한다. 그러면 *대상 요소 부재*는 **항상 실패**이며 분기가 사라진다.
3. **소유가 불가능한 표면(로그인·외부 의존 필수)은 2분기로 한다.** (a) **독립적인 empty 신호**(라우트 응답·명시적 seed 상태 표시 등 — 대상 landmark 부재를 근거로 쓰지 않는다)로 앱이 비었다고 확인되면 `test.skip()`. (b) 앱이 populated인데 selector·fixture·라우트 준비가 안 됐으면 **실패한다.** 이 실패는 `validate:e2e`의 `FAIL(project)`로 졸업을 차단한다(ADR-052#amend-1 — 새 게이트를 만들지 않는다).
4. **`/stack-guard`는 e2e 판정 시 조기 반환 패턴을 보고한다** — 선언된 e2e 디렉터리에서 `annotations` 기록 직후 `return`하는 형태를 grep해 발견 시 `P1 [E2E-vacuous-skip] <file:line> — runner-native skip으로 교체 필요`를 출력에 남긴다. **문자열 검사이므로 기록 등급이며 차단하지 않는다**(ADR-063 D6 1문항).
5. **전제 미준비를 영속 기록한다.** 결정 2·3을 만족할 seed·전제 수단이 없어 spec을 만들지 못하면, 출력만 하고 끝내지 않고 `STACK_SETUP_PLAN.md ## 통합 명령 사용법`에 `visual-qa: PENDING (precondition: <무엇이 없는가>) (<YYYY-MM-DD>)` 한 줄을 기록한다(준비되면 `READY (<날짜>)`로 갱신). `/stabilize-milestone` §1.0의 `[Guard-drift]` 점검이 그 값이 `PENDING`이면 `P2 [Guard-drift] visual-QA 전제 미준비 — /plan-workitem 이 전제 line item authoring 후 /stack-guard 재실행 권장`을 기록한다. **`probe smoke:` 기록 → `[Guard-drift]` 회수 경로(ADR-063 D3→D4)와 같은 형태이며 새 게이트를 만들지 않는다** — 기록이 없으면 boot smoke 하나로 e2e가 통과하는 상태가 조용히 잊힌다.
6. **적용 범위**: 본 amendment는 `#amend-2`가 정의한 **UI/web 표면**에 한정된다. Flutter `native/*`의 시각 검증은 golden(ADR-059 D3)·경험 게이트 degrade(ADR-059 D12)가 담당하며 본 결정으로 바뀌지 않는다.

### 근거
- 보일러플레이트가 graceful skip을 *지시* 하면서 표현을 정하지 않았고, 다른 곳에서 러너의 통과/skip 수를 졸업 증거로 소비한다. 지시와 소비가 어긋난 자기유발 결함이다.
- `test.skip()`으로 바꾸면 전부 보류된 경우 실행 0개가 되어 `EMPTY`(졸업 차단)로 드러난다. 다만 boot smoke 하나가 통과하면 전체는 `PASS`이므로(ADR-064 D6이 의도적으로 허용) **표현 고정만으로는 부족하고 결정 2·3의 실패 전환이 필요하다.**

### 강도 (ADR-022)
- **제약(강) — [관측됨]**: 결정 1·3(b). **enabling(약)**: 결정 2 권장, 결정 4 기록 등급.

### 적용 surface
- .claude/skills/stack-guard/SKILL.md
- .claude/skills/stabilize-milestone/SKILL.md
- docs/00-meta/_templates/STACK_SETUP_PLAN_TEMPLATE.md
