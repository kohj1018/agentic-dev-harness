---
name: bootstrap-design
description: UI 시각 결정 발굴 라운드 (R0~R6). 레퍼런스 노트 + DESIGN.md 작성 전 다중 concept 시안 선택. DESIGN.md 채움. UI 스택 포함 프로젝트 전용.
argument-hint: "[product description | --fast | --update]"
disable-model-invocation: true
allowed-tools: Read Glob Grep Write Edit Agent Bash(rm docs/20-system/design-preview.html) Bash(rm docs/20-system/design-concepts/concept-*.html) Bash(pnpm validate:design*) Bash(npm run validate:design*) Bash(yarn validate:design*) Bash(bun run validate:design*) Bash(make validate-design*) Bash(task validate:design*) Bash(npx playwright*) WebFetch(domain:github.com)
---

# /bootstrap-design

> 모드: How-to (UI 시각 결정 라운드)
> 패턴: `discover-product` 차용 — `context: fork`를 명시하지 않아 메인 세션이 R0~R6를 직접 운전한다. R0 방향 리서치·값 grounding은 `Agent` 도구로 **researcher**(디자인 레퍼런스 모드) + 분해·시안 authoring은 **designer** 단발 sub-call 위임(ADR-058). 종료 후 사용자가 `/clear` 권장.
> 라운드 구조·R0 리서치·수용 게이트·시안 카드 SSOT는 ADR-058(design workflow). DESIGN.md *내용*(8섹션+Motion / 3-tier 토큰 / Don'ts / 정체성·a11y·category state·responsive)·인터페이스 할당 SSOT는 ADR-027.

## 트리거
- `/bootstrap-stack` 종료 출력에 "frontend 감지됨. `/bootstrap-design` 권장" 텍스트 한 줄. 사용자 발화로 시작.
- 비-UI 프로젝트는 호출되지 않음 (ADR-031 직접 지원 범위 밖).
- 본 skill은 baseline placeholder DESIGN.md를 *채우는* 흐름. 비-UI 프로젝트는 fork 직후 DESIGN.md를 삭제했음을 전제. 파일 부재 시 작업 중단 + 사용자에게 보고.

**Codex**: 본 skill은 wrapper 미보유(자연어 호출) — Codex에서는 "Follow `.claude/skills/bootstrap-design/SKILL.md`"로 호출한다(목록 SSOT = README, ADR-010#amend-3·#amend-4). 본문의 `Agent` 위임(R0 researcher 디자인 레퍼런스 조사 · R0~R2 designer authoring · R2-1.5 reviewer 구별성 비평 · **R2-G/R6 reviewer 픽셀 판정 · 게이트 repair designer 재생성**)은 Codex에 persona 매핑이 없어 메인 세션이 각 persona 파일(researcher.md/designer.md/reviewer.md)을 읽고 순차 인라인 수행하며 생략하지 않는다(ADR-010). **동일 세션 degrade 계약 (ADR-058 D5)**: (a) designer→reviewer 페르소나 전환을 *명시적 단계*로 끊고, (b) 그 라운드 산출물과 최종 출력에 `under-verified: 동일 세션 감사`를 명시하며, (c) 완전 독립 감사가 요구되면 승인 보류한다. **결정적 렌더 게이트(`STACK_SETUP_PLAN.md ## Design Gate Adapter`의 current-ready v2 command)는 세션 격리와 무관하게 그대로 실행**되므로 배포불가 결함(serious/critical axe·320 geometry)은 Codex 경로에서도 차단된다.

## 모드
- `--fast`: R0(Layer A/B minimal — 있으면 사용자 힌트 우선, 없으면 자율 조사 1~2개로 최소 grounding + minimal 노트) + R1(원칙 1줄 + voice 기본값 확인 1회) + R3(토큰) + R5(저장 — 축약 섹션, §10 포함). **R2(concept 시안)·R4(컴포넌트 인벤토리)·R6(preview)는 생략** — R5 저장은 *생략하지 않는다*. R1은 *완전 생략 금지*(minimal 1줄). 게이트는 산출물 기준 — `--fast`는 R2·R6(concept/preview) 미생성이라 게이트 적용 대상 없음(N/A, ADR-058 D3). `--fast`에서 concept·preview가 필요하면 종료 후 명시 발화로 R2/R6 단독 수행.
- 기본: R0~R6 모두.
- `--update`: 기존 DESIGN.md가 있을 때의 부분 갱신/재디자인 모드(아래 `## --update 모드`). 처음부터 R0~R6를 다시 돌지 않는다.

## --update 모드 (재디자인/부분 갱신, ADR-058 / ADR-027#amend-4)
기존 `docs/20-system/DESIGN.md`가 채워져 있을 때:
- 처음부터 R0~R6를 다시 돌지 않는다. 변경 필요한 부분만 갱신:
  - R0(레퍼런스 재확인 + `DESIGN_RESEARCH.md` 갱신) — *선택*. 시각 방향 자체가 바뀔 때만.
  - R2(concept 시안 재탐색) — *시각 방향 전환 시에만*. 토큰/컴포넌트만 손보면 생략.
  - R3/R4 — 바뀐 토큰·컴포넌트만 부분 갱신(미변경 토큰·§1~§9 구조 보존, 전면 재작성 X).
  - R5 — 저장(변경분 반영).
  - R6 — 시각 방향이 크게 바뀌면 preview 재생성·검토 루프(아니면 생략).
- 대규모 재디자인(브랜드/방향 전환)은 *결정 근거*를 ADR로 남길 것을 권장(시각 방향 변경은 되돌리기 비용이 큼).

## 반드시 먼저 읽을 파일
- `docs/10-charter/PROJECT_CHARTER.md` (페르소나·시나리오 — concept 대표 화면 입력)
- `docs/20-system/ARCHITECTURE_OVERVIEW.md` (스택)
- `docs/20-system/DESIGN.md` (현재 placeholder)
- `docs/00-meta/STACK_SETUP_PLAN.md` (R2/R6 산출물을 만드는 경우 `## Design Gate Adapter` current version·source digest·conformance registry; `--fast`로 둘 다 생략하면 N/A)

## 반드시 수행할 일
- 본 skill은 baseline placeholder `docs/20-system/DESIGN.md`를 *채운다* (생성 X). 파일이 없으면 fork 사용자가 비-UI 프로젝트로 판단해 삭제한 경우 — 작업 중단 + 사용자에게 *"본 프로젝트는 비-UI라 판단됨. /bootstrap-design 실행 의도 확인 필요"* 보고.
- DESIGN.md 본문 상단 주석(`baseline placeholder`)을 변경하지 않는다 — 정책 SSOT는 STRUCTURE.md presence 컬럼 + 본 파일 주석.

## R0 — 리서치: evidence-on-demand (ADR-058)

> 디폴트는 **AI 자율 리서치**. 사용자 제공 URL·취향은 *우선 힌트*(prerequisite 아님) — 있으면 Layer A에 우선 반영, 없어도 확인 게이트 없이 자율 진행.

- **먼저 방향타를 적는다**: primary task / 결정 순간 / 실패·복구 / 정체성 tension을 1줄씩. 리서치는 이 방향타를 채우는 것.
- **Layer A (방향 — 자율)**: charter 기획 방향·서비스 성격에 맞는 디자인 방향·레퍼런스 제품을 **researcher(디자인 레퍼런스 모드)** 위임으로 탐색 → 방향 어휘 + what-to-borrow/avoid. (Codex: 메인 세션이 researcher.md를 읽고 인라인 수행.)
- **Layer B (값 grounding)**: Layer A 방향에 맞는 오픈소스 토큰 패키지에서 실제 값 추출 — researcher 핀 목록(Primer/Radix/Polaris/Tailwind/shadcn). raw CSS 없으면 JSON 토큰 엔드포인트. 닫힌 제품은 "추출 불가 — <사유>" 정직 표기.
- **Layer C (포맷)**: Google 공식 예시 DESIGN.md는 **R5에서만** format fixture로 씀 — R0~R2 창작 컨텍스트에 넣지 않는다(glassmorphism/보라 예시가 §9 anti-slop 오염).
- **role 3종**: `task/behavior` · `identity/craft` · `implementation system`. counter-reference(안티-레퍼런스)는 *미해결 tension이나 실제 monoculture가 있을 때만* — **필수 아님**(구 "안티-레퍼런스 1~2개 필수"를 조건부로 완화).
- **정지 규칙**: 고정 최소 개수 없음 — evidence coverage가 차면 멈춘다. designer 최종 입력 보통 **3~5개 이하**(단순 내부 도구는 더 적게).
- **관측 기반 주장만**: visual 주장은 실화면/스크린샷 봤을 때만, behavior 주장은 docs/interaction 봤을 때만 기록. broad search·gallery·Dribbble/Behance는 이름 찾는 lead로만 허용 후 canonical로 승격.
- concept 안에서는 **coherent primary system 1개**. 명시 gap 시에만 secondary primitive(**Radix는 색만 fallback** — 타이포/레이아웃/IA/모션은 ground 못함).
- **MCP·계정 도구를 보일러플레이트 기본 의존으로 추가하지 않는다**(불변 — ADR-027#amend-2 비결정 존중).
- **레퍼런스 노트 영속화 (필수, `--fast`는 minimal)**: `docs/20-system/DESIGN_RESEARCH.md`에 **최소 schema**로 남긴다:

  ```markdown
  # 디자인 리서치 (레퍼런스 + 시안 선택 근거)

  > 모드: Reference (/bootstrap-design R0/R2 산출). SSOT는 DESIGN.md(확정 결정).
  - 조사일: <YYYY-MM-DD>

  ## 레퍼런스   <!-- R0 — 각 항목 최소 schema (ADR-058) -->
  ### <source/canonical> — <URL>
  - role: task/behavior | identity/craft | implementation system
  - 뒷받침한 결정: <이 레퍼런스가 뒷받침하는 디자인 결정>
  - 검증(provenance): visual | behavior | code   <!-- 실제로 본 것 기준 (provenance) -->
  - 관측일: <YYYY-MM-DD>
  - borrow: <1줄> / avoid: <1줄>
  - confidence/caveat: <1줄>
  #### 추출 토큰 (코드)   <!-- Layer B — hex/font/spacing/radius/shadow·JSON 실값. 미추출 시 "추출 불가 — <사유>" -->

  (레퍼런스는 coverage가 찰 때까지 — 보통 3~5개 이하)

  ## counter-reference   <!-- 조건부 — 미해결 tension·실제 monoculture 시에만 -->
  - <"~같지 말 것"> — <이유 1줄>

  ## grounding 출처   <!-- 자율 조사 / 사용자 URL / "추출 불가" 등 -->

  ## 시안 옵션   <!-- R2 REFINE/EXPLORE 카드 (선택 후 채움) -->
  ## 최종 선택   <!-- R2 -->
  ```

- DESIGN.md `## 1 Overview`는 본 노트를 상대경로 링크(`[디자인 리서치](DESIGN_RESEARCH.md)`) + borrow/avoid 1~2줄 + 긍정적 정체성(§1 필드)만 인라인. `## 시안 옵션`·`## 최종 선택`은 R2 종료 후 채운다(아래 R2-2).

## R1 — 디자인 원칙 3~5개
- actionable verb. 모호어("modern/clean/sleek") 금지.
- 예: "정보 밀도 우선", "monochrome + 1 accent", "motion은 의미 전달용만".
- `--fast` 모드에서도 *최소 1줄*은 필수.
- **voice 기본값 확인 1회 (ADR-056)**: DESIGN.md `## 10`의 기본값(어조·CTA 스타일)을 사용자에게 제시하고 "채택 or 변경"을 확인한다. `--fast`도 이 확인 1회는 수행.

## R2 — 다중 concept 시안 (DESIGN.md 작성 *전* 시각 방향 선택, ADR-058)

> 목적: DESIGN.md(토큰 텍스트)를 쓰기 *전에* 사용자가 **눈으로 시각 방향을 선택**한다. 방향 확정 후 토큰/DESIGN.md를 그 방향에서 파생 → DESIGN.md 전면 재작성 비용 회피. (`--fast`는 본 라운드 생략.)

### R2-1. 생성
- R1 원칙 + R0 레퍼런스(`DESIGN_RESEARCH.md`) + DESIGN.md `## 9` Don'ts에 근거해 **서로 다른 시각 방향 2~3개**를 생성한다. 각 방향을 자기완결 HTML/CSS 파일로 `docs/20-system/design-concepts/concept-A.html`, `concept-B.html`, (`concept-C.html`)에 저장(빌드·외부 의존 0 — CSS는 `<style>` 인라인). 디렉터리가 없으면 생성.
- **REFINE / EXPLORE 카드 (ADR-058 — 안전/과감 아님)**: 두 기본안을 이렇게 정의한다:
  - **REFINE**: 익숙한 task convention 우선 + restrained signature (검증된 패턴을 깔끔하게).
  - **EXPLORE**: signature-led이되 *같은* 익숙한 control/flow를 보존 (개성은 시각·마감에, 조작 흐름은 익숙하게).
  - 3번째 안은 *풀리지 않은 명시적 tension이 있을 때만*.
  각 concept 카드에 `task hypothesis | preserved convention | visible signature | failure sign`을 명시하고 `DESIGN_RESEARCH.md ## 시안 옵션`에 기록한다. **signature가 primary task를 더 빨리 이해시키지 못하면 장식 → 제거**(실험에서 rail·route 장식이 coherence를 해침). counter-reference(안티-레퍼런스)는 R0에서 조건부로 확보된 경우에만 공통 회피 대상으로 둔다. 모든 concept은 `## 9` Don'ts를 공통 회피. **익숙한 control/flow(조작 흐름)는 두 안 모두 보존하는 *공통 통제변수*** — 달라야 하는 건 layout hypothesis·visible signature다. 두 concept이 같은 **layout hypothesis·signature**를 공유하면 재생성(control/flow가 같은 건 재생성 사유 아님 — 통제변수). **concept 대표 화면은 실카피 + 대표 실데이터로 채워 렌더한다(빈 화면 금지 — R2-G populated axe가 유효하려면; dogfood 빈-화면 3.70:1 맹점 방지).**
- concept HTML authoring은 **designer 단발 sub-call**로 위임한다(HTML 전문이 메인 컨텍스트에 쌓이지 않게 — 파일 적재 + 경로 반환).
- **실카피 렌더 (ADR-056)**: 대표 화면 문구는 charter 페르소나·시나리오 기반 실제 문구(placeholder 금지). §10 확정 전이므로 "방향 선택용 후보 카피"임을 GENERATED 헤더에 1줄 명시.
- 모든 concept은 charter `## 2.1 페르소나` / `## 3.1 핵심 시나리오` 기반 **동일 대표 화면**(예: 랜딩 hero / 입력 폼 / 카드 리스트)을 렌더해 *직접 비교* 가능하게 한다.
- 각 파일 상단 GENERATED 헤더 주석 필수:
  ```html
  <!--
    GENERATED concept 시안 — /bootstrap-design R2. CANDIDATE — DESIGN.md(SSOT) 아님 (방향 선택용 임시 파일).
    선택·승인 후 R6에서 삭제. 직접 편집 금지(피드백은 재생성으로 반영).
    concept: <A/B/C> — <방향 한 줄 요약>
  -->
  ```
- **(옵션) 외부 concept generator**: UI 프로젝트가 원하면 Google Stitch 등 외부 도구를 concept 생성 보조로 쓸 수 있다 — 단 **기본 의존 금지**(계정·도구 의존 — ADR-027#amend-2 비결정 존중). 산출물은 DESIGN_RESEARCH.md에 provenance 기록 후, 승인된 방향만 DESIGN.md로 정규화(생성/감사 분리·취향 오라클=사용자 불변).

### R2-1.5. 구별성·조화 비평 (순차 1회 — ADR-058)
- 생성 직후 **reviewer(design surface) 단발 sub-call**(입력은 REFINE/EXPLORE 카드 + concept별 토큰 요약 — 이 단계는 렌더 *전* 값싼 개념 점검이라 HTML 전문 투입 금지; *픽셀* 판정은 뒤의 R2-G가 스크린샷으로 한다) 1회로 판정: ① concept 간 실질 구별성(REFINE/EXPLORE 성격이 실제로 다른가, signature가 task를 돕는가) ② `## 9` Don'ts·(있으면) counter-reference 근접도 ③ **시안 내부 조화 — *카드·토큰 수준의 선언된 짜깁기 신호만***(예: 상충하는 소스를 한 시안에 섞겠다는 카드). *렌더 픽셀의 실제 조화*는 R2-G 스크린샷 리뷰가 확인한다(R2-1.5는 카드만 보므로 여기서 픽셀 조화를 단정하지 않는다). designer 자기 비평 금지(생성/감사 분리).
- **합의·병합·순위·추천 금지** — 출력은 "재생성 필요 concept 목록 + 사유"만. 재생성 필요 concept은 카드를 유지한 채 재생성 후 R2-2로.

### R2-G. 수용 게이트 (ADR-058 D3 — full 모드)
`--fast`는 R2 자체를 생성하지 않으므로 본 게이트 N/A(ADR-058 D3 — 산출물 기준). full 모드는:
- **실행 preflight**: `STACK_SETUP_PLAN.md ## Design Gate Adapter`가 `status: ready`, capability `ADR-058#amend-2/v2`, 기록된 `source digest`(direct-support Node UI는 canonical), fixed conformance PASS인지 모두 확인한다. missing/n/a/needs-install/wiring-fail/lower-version/digest·conformance 누락이면 command를 실행하지 않고 concept 선택·DESIGN 저장으로 진행하지 않으며 정확히 `Needs Design Gate: /stack-guard` + 현재 status/version을 출력한다(MCP·육안·visual-qa로 대체 금지). 이 preflight가 frontend 신호를 뒤늦게 발견한 경우 `/stack-guard` 재실행이 n/a→UI를 복구한다. current-ready면 command template의 `<html...>`에 `docs/20-system/design-concepts/concept-*.html`을 대입해 그대로 실행한다 — **exit 0** 통과 / **exit 1** JSON `blockers` 차단(실패 selector를 designer에 되먹여 재생성) / **exit 2** 사유 echo 후 승인 보류(silent skip 금지).
- **렌더**: 각 concept HTML을 Playwright로 **1280 + 375** 캡처(desktop 폭은 프로젝트 target 명시 시 그 값). stack-guard가 깐 Playwright 재사용.
- **상시 결정적 검사**: **320 CSS px reflow**(page overflow / viewport escape / clipped text) + **populated DOM axe**(빈 화면 아님 — 대표 화면에 실데이터 채운 상태).
- **독립 픽셀 판정**: reviewer(design surface)가 1280/375 스크린샷을 Read로 열람해 위계·밀도·domain fit·장식 slop 판정(생성자 designer와 분리). LLM reviewer 1명.
- **차단(block) — source-verified current-v2 `validate:design` adapter가 결정적 계산**: serious/critical axe · page overflow · **viewport escape · clipped text**(320/375 geometry — check-reflow-320.cjs 이식). **차단(block) — reviewer 픽셀 판정**(스크린샷 열람, 러너가 못 잡는 *주관적* 영역): 위계 붕괴(nested card·장식 rail) · 밀도 · 장식 slop · critical overlap이 primary task를 저해할 때. **보고(report)**: moderate/minor axe + 취향·밀도 finding.
- **수동 smoke**(사람 몫): Tab 순서 · visible focus · trap 없음 · Escape close · 색 외 상태표식.
- **repair loop**: 차단 finding이 있으면 실패 selector + 요약을 **designer에 되먹여 재생성** → 재검사. **retry ≤2**, 초과 시 승인 보류 + brief(R0/R1) 재검토. 여전히 fail이면 그 concept은 선택지에서 제외(사용자에게 사유 echo).
- **정리**: 게이트용 임시 렌더/스크린샷은 통과 판정 후 정리(concept HTML은 R2-2 선택까지 유지 — R6-3에서 최종 삭제).

### R2-2. 선택 루프
- 사용자에게 안내: *"브라우저에서 `docs/20-system/design-concepts/concept-*.html`를 열어 비교하고, 선호 방향(또는 하이브리드: 예 'A 색 + B 타이포')을 알려주세요."*
- 피드백 수령 시 필요하면 concept을 *재생성*(직접 편집 X). 사용자가 한 방향(또는 하이브리드)을 *선택*할 때까지 반복.
- **수렴 규칙 (ADR-058)**: 루프가 *2 사이클 내 미수렴*이면 생성 반복 말고 *brief(R0 레퍼런스 / R1 원칙)를 고친다*(soft 권장).
- **선택 전에는 R3~R6로 진행하지 않는다.** 하이브리드 선택이면 그 조합을 메모로 확정.
- 선택 확정 시 *각 concept의 방향·근거 + 최종 선택 이유*를 `docs/20-system/DESIGN_RESEARCH.md`의 `## 시안 옵션` / `## 최종 선택`에 기록(근거 추적 — DESIGN.md는 최종 *결정*만 담는다, ADR-058).
- **취향 오라클 (ADR-058)**: 에이전트는 선택지 폭 담당 — 선호 추천·순위 제시 금지(사용자가 물으면 예외). 사용자 안내 문구에 *"원하시면 추천을 요청하실 수 있어요"*를 노출한다(예외 경로를 사용자가 놓치지 않게). 사용자가 전량 거부하면 REFINE/EXPLORE 카드부터 재설계(수렴 규칙과 결합).

## R3 — 디자인 토큰 (선택 concept에서 추출, W3C DTCG + Stitch 정렬 — ADR-027#d6)
- **선택된 concept(R2)의 CSS에서 토큰을 추출**해 3-tier로 정리: primitive → semantic → component.
- **`--fast` fallback (R2 생략 — concept 없음)**: concept CSS가 없으므로 R1 원칙 + R0 레퍼런스(`DESIGN_RESEARCH.md`)에서 토큰을 *직접* 도출한다(구 `--fast`의 자기완결 토큰 흐름 보존 — concept 결합으로 인한 소스 공백 방지).
- color: brand 1 + neutral 1 + accent 1 + semantic 4 (success/warning/error/info), 12~16 hex.
- typography: 1~2 family, 4~5 size scale, modular ratio (1.125/1.25/1.333), weight pair.
- spacing: 4 or 8 base, t-shirt scale 또는 numeric.
- radius / shadow / motion (duration·easing·`prefers-reduced-motion` — §8 semantic motion contract 정합).
- WCAG 4.5:1 텍스트 대비 검증 권장(정밀 검사는 R6/게이트의 axe가 결정적).
- **밀도 힌트**: 제품 성격에 맞는 밀도를 1줄 — 대시보드=조밀 / 마케팅·랜딩=여유 (DESIGN.md §1 contextual density와 정합).

## R4 — 컴포넌트 인벤토리 + category state 계약 (ADR-027#amend-7)
- primitives (Button/Input/Text/Icon), composites (Card/Modal/Toast), patterns (Form/EmptyState/ErrorState/LoadingState).
- 상태 = category별 expected (DESIGN.md §7 정합): interactive primitive(default/hover/active/focus-visible/disabled, async면 loading) · data composite/screen(default/loading/empty/error/success) · static primitive(상태 매트릭스 없음). N/A는 category상 expected를 의도적으로 뺄 때만.
- 스택별 시작점:

  | 스택 | 시작점 |
  |------|--------|
  | React/Next.js | shadcn/ui (Radix + CSS 변수) |
  | Vue | shadcn-vue |
  | Svelte | shadcn-svelte |
  | Astro | shadcn 패턴 + Astro 어댑터 |
  | RN/Expo *(ADR-031 override 시)* | Tamagui |
  | Flutter *(ADR-031 override 시)* | ShadCN-Flutter 또는 Material 3 |
  | SwiftUI *(ADR-031 override 시)* | Apple HIG 토큰 직접 정의 |

  기본 자동화 직접 지원 스택: React/Vue/Svelte/Astro. RN·Flutter·SwiftUI는 ADR-031 override 경로.

## R5 — `docs/20-system/DESIGN.md` 저장 (선택 concept에서 authoring, ADR-058)
- 섹션 순서를 Stitch DESIGN.md canonical에 정렬(ADR-027#d5): Overview / Colors / Typography / Layout / Elevation & Depth / Shapes / Components / Motion / Do's and Don'ts.
- 토큰은 fenced `yaml` 블록 또는 frontmatter YAML로.
- `## 1 Overview`에: (a) `DESIGN_RESEARCH.md` 상대경로 링크 + what-to-borrow/avoid 1~2줄, (b) `선택 concept: <X>(+하이브리드 메모)` 한 줄(ADR-058).
- `## 10 Voice & Writing`을 R1 확인 결과(기본값 채택/변경)로 확정 저장한다 (ADR-056).
- **포맷 완성도 point-check (ADR-058 Layer C)**: R5 저장 직후 Google 공식 예시 DESIGN.md(`google-labs-code/design.md/examples` — authoritative, 예: `examples/paws-and-paths/DESIGN.md`(실측 확인된 완성 예시: Brand&Style/Colors/Typography/Layout/Elevation/Shapes/Components + 토큰))와 대조해 메인 세션이 *섹션 완성도·빠짐*만 advisory 점검한다(별도 agent 호출 불요 — 예시 fetch + 비교). **미감·값·시각 방향은 참조 금지**(공식 예시가 glassmorphism/보라 그라디언트라 §9 anti-slop 오염 — format fixture로만). (옵션) UI+Node면 `@google/design.md lint`(stack-guard 권장 명령)도 이 시점에 실행 가능.
- **DESIGN.md 상태 승격 (ADR-027#amend-3 / ADR-056)**: 본 R5 저장 완료 시 `docs/20-system/DESIGN.md` `## 0. Status`를 `draft` → **`living`**으로 갱신한다(정식·`--fast` 경로 모두 수행 — R6 생략 프로젝트도 승격되도록). 비-UI 삭제 경로는 불변.

## R6 — DESIGN.md 파생 최종 preview + 검토 루프 + 정리 (ADR-058, 구 ADR-027#d21·#d22 계승)

> 목적: 확정된 DESIGN.md(SSOT)가 *충실히 렌더되는지* 최종 확인. R2에서 방향은 이미 선택됨 — R6은 SSOT 충실도 확인. DESIGN.md가 *SSOT*, preview는 *검토용 임시 파일*(ADR-005). 사용자가 R2 concept 승인으로 충분하다 판단하면 R6 preview 생략 가능(그 경우 concept만 정리).

### R6-1. 생성
- `docs/20-system/DESIGN.md`의 토큰·컴포넌트만으로 **단일 자기완결 HTML** `docs/20-system/design-preview.html`를 생성한다(빌드·외부 의존 0 — CSS는 `<style>` 인라인).
- DESIGN.md `## 2~6` 토큰은 `:root { --token: value; }` CSS custom property로 옮기고, 모든 요소가 *그 변수만* 참조하게 한다(DESIGN.md가 SSOT임이 구조로 드러나도록 — raw hex 직접 사용 금지).
- 파일 상단 GENERATED 헤더 주석 필수:
  ```html
  <!--
    GENERATED FROM docs/20-system/DESIGN.md — 검토용 임시 파일(검토 완료 시 삭제). 직접 편집 금지.
    SSOT는 DESIGN.md. 수정은 DESIGN.md → /bootstrap-design R6 재생성.
    생성 기준: <DESIGN.md 갱신 시각 / 생성 일시>
  -->
  ```
- preview가 포함할 섹션(순서):
  1. **Tokens** — color(primitive/semantic/component) swatch + hex + 텍스트 대비비 표시 / typography scale(각 size·weight 샘플) / spacing scale(시각 막대) / radius·shadow 샘플.
  2. **Components** — DESIGN.md `## 7` 인벤토리의 각 컴포넌트를 그 category의 expected 상태(§7 계약 — interactive: default/hover/active/focus-visible/disabled[+loading] · data/screen: default/loading/empty/error/success · static: 없음)로 나란히 렌더. hover/active/focus-visible는 CSS pseudo + *상태 클래스 변형*(예: `.is-hover`)을 둘 다 둬서 정적 캡처에서도 보이게 한다.
  3. **대표 화면 2~3개** — charter `## 2.1 페르소나` / `## 3.1 핵심 시나리오` 기반 실사용 맥락. (R2 선택 concept과 일관되어야 — 불일치 시 DESIGN.md를 먼저 점검.)
  - 대표 화면 preview는 실카피(`## 10` 준수)로 렌더한다 (ADR-056 결정 9 / ADR-058).
- 생성 직후 DESIGN.md `## 9 Do's and Don'ts` 위반을 self-check해 위반 의심 항목을 출력에 보고(자동 차단 X).
- **수용 게이트 (ADR-058 D3 — full 모드)**: R2-G와 같은 current v2 + source digest + fixed conformance preflight를 거쳐 command template의 `<html...>`에 `docs/20-system/design-preview.html`을 대입해 검사한다(경로 추측 금지; missing/n/a/lower/not-ready면 command 미실행 + preview 승인·정리 보류 + `Needs Design Gate: /stack-guard`). R2-G와 동일 분리 — **러너 결정적 차단**: serious/critical axe·320/375 geometry(page overflow·viewport escape·clipped text); **reviewer 픽셀 차단**(스크린샷): 위계 붕괴·밀도·장식 slop·critical overlap; moderate/minor+취향 = 보고. **픽셀 판정은 R2-G와 동일하게 reviewer(design surface)를 단발 호출해 1280/375 스크린샷을 Read로 열람·판정한다**(생성자 designer와 분리, LLM reviewer 1명 — R6에도 이 호출이 명시적으로 있어야 선언한 픽셀 차단이 실제로 집행된다). 차단 발견 시 **DESIGN.md(SSOT)를 먼저 고치고** preview 재생성(retry ≤2, 초과 시 승인 보류 + brief 재검토). exit 2(Needs Install)면 사유 echo 후 승인 보류. `--fast`는 preview(R6) 미생성이라 본 게이트 N/A(산출물 기준).

### R6-2. 검토 루프
- 사용자에게 안내: *"브라우저에서 `docs/20-system/design-preview.html`를 열어 확인하고 피드백 주세요."*
- 피드백 수령 시 **반드시 DESIGN.md(SSOT)를 먼저 수정** → 그 다음 preview 재생성. (preview를 먼저 고치지 않는다.)
- **수렴 규칙 (ADR-058)**: 루프가 *2 사이클 내 미수렴*이면 생성 반복 말고 *brief(R0 레퍼런스 / R1 원칙)를 고친다*(soft 권장).
- 사용자가 *승인*할 때까지 반복. 승인 전에는 R6-3(정리)과 `/plan-milestone`(M/F가 아직 없으면 — ADR-057; 확정된 `ready` M에 task 0건/`draft`가 있으면 `/plan-workitem M<N>`; 이미 구현 중이면 해당 task workflow 또는 다음 M) 권장을 수행하지 않는다.
- `--fast`에서는 R6를 생략(위 `## 모드`). 사용자가 명시 요청 시 R6만 단독 수행.

### R6-3. 정리 (concept 시안 + preview 삭제)
- 사용자가 *승인*하면 `docs/20-system/design-concepts/concept-*.html` (R2 산출) + `docs/20-system/design-preview.html` (R6 산출)를 **삭제**한다. 둘 다 검토용 임시 산출물이고, 확정 시각 결정은 DESIGN.md(SSOT)에, 레퍼런스 근거는 `DESIGN_RESEARCH.md`에 영속돼 있으며, 필요하면 R2/R6 단독 실행으로 재생성 가능하다.
- 삭제 후 사용자에게 "시안·preview 검토 완료 — concept/preview 삭제됨 (재생성: `/bootstrap-design` R2/R6)" 1줄 안내.
- **참고**: `docs/20-system/design-concepts/`·`docs/20-system/design-preview.html`는 `.gitignore`에 *기본 등재*돼 있어(커밋 방지 — ADR-058) 보존 요청 시 *로컬 유지*만 하면 된다(commit 안 됨). 삭제가 정상 경로 — 확정 결정은 DESIGN.md(SSOT)·근거는 DESIGN_RESEARCH.md에 영속.

## 종료 후
- 사용자가 `/clear` 권장. R0~R6가 인터랙션 길어지면 다음 task의 컨텍스트에 잡음.

마지막 출력:
- `docs/20-system/DESIGN.md` 경로
- `docs/20-system/DESIGN_RESEARCH.md` 경로 (레퍼런스 노트)
- 선택된 concept: <A/B/C 또는 하이브리드 메모>
- concept/preview 시안 상태: 삭제됨(승인 후 — 기본) / 유지(보존 요청 시) / 미생성(`--fast`). 재생성: `/bootstrap-design` R2/R6
- 채워진 섹션 요약
- 남은 열린 질문
- 후속 권장 단계: **사용자가 시안을 승인한 뒤** `/plan-milestone`(M/F가 아직 없으면 — ADR-057; 확정된 `ready` M에 task 0건/`draft`가 있으면 `/plan-workitem M<N>`; 이미 구현 중이면 해당 task workflow 또는 다음 M). 미승인 상태면 "concept 선택·preview 검토 먼저" 안내.

## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 ADR/architecture 섹션은 task 본문에서 발화 시 인용 — 사전 fork-load 금지.
