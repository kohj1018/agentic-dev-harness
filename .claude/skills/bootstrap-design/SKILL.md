---
name: bootstrap-design
description: UI 시각 결정 발굴 라운드 (R0~R6). 레퍼런스 노트 + DESIGN.md 작성 전 다중 concept 시안 선택. DESIGN.md 채움. UI 스택 포함 프로젝트 전용.
argument-hint: "[product description | --fast | --update]"
disable-model-invocation: true
allowed-tools: Read Glob Grep Write Edit Agent Bash(rm docs/20-system/design-concepts/concept-*.html) Bash(pnpm validate:design*) Bash(npm run validate:design*) Bash(yarn validate:design*) Bash(bun run validate:design*) Bash(make validate-design*) Bash(task validate:design*) Bash(npx playwright*) Bash(node .claude/skills/bootstrap-design/assets/capture-refs.mjs*) Bash(pnpm build-storybook*) Bash(npm run build-storybook*) Bash(yarn build-storybook*) Bash(bun run build-storybook*) Bash(flutter test*) WebFetch(domain:github.com) WebFetch(domain:getdesign.md)
---

# /bootstrap-design

> 모드: How-to (UI 시각 결정 라운드)
> 패턴: `discover-product` 차용 — `context: fork`를 명시하지 않아 메인 세션이 R0~R6를 직접 운전한다. R0 방향 리서치·값 grounding은 `Agent` 도구로 **researcher**(디자인 레퍼런스 모드) + 분해·시안 authoring은 **designer** 단발 sub-call 위임(ADR-058). 종료 후 사용자가 `/clear` 권장. **R0 캡처(capture-refs)·R6 테마 배선(builder 단발)**은 Bash·코드 작성이 필요해 각각 메인 세션 실행·builder 위임이다(designer는 Bash 없음).
> 라운드 구조·R0 리서치·수용 게이트·시안 카드 SSOT는 ADR-058(design workflow). DESIGN.md *내용*(8섹션+Motion / 3-tier 토큰 / Don'ts / 정체성·a11y·category state·responsive)·인터페이스 할당 SSOT는 ADR-073.

## 트리거
- `/bootstrap-stack` 종료 출력에 "frontend 감지됨. `/bootstrap-design` 권장" 텍스트 한 줄. 사용자 발화로 시작.
- 비-UI 프로젝트(API server·CLI 등)는 호출되지 않음 — **UI surface 가 없어 design 산출물이 불필요하기 때문이며 ADR-031 직접 지원 범위와는 무관하다**(API server·CLI 도 직접 지원 6종에 포함 — ADR-031#amend-1).
- 본 skill은 baseline placeholder DESIGN.md를 *채우는* 흐름. 비-UI 프로젝트는 fork 직후 DESIGN.md를 삭제했음을 전제. 파일 부재 시 작업 중단 + 사용자에게 보고.

**Codex**: 본 skill은 wrapper 미보유(자연어 호출) — Codex에서는 "Follow `.claude/skills/bootstrap-design/SKILL.md`"로 호출한다(목록 SSOT = README, ADR-010#amend-3·#amend-4). 본문의 `Agent` 위임(R0 researcher 디자인 레퍼런스 조사 · R0~R2 designer authoring · R2-1.5 reviewer 구별성 비평 · **R2-G/R6 reviewer 픽셀 판정 · 게이트 repair designer 재생성**)은 Codex에 persona 매핑이 없어 메인 세션이 각 persona 파일(researcher.md/designer.md/reviewer.md)을 읽고 순차 인라인 수행하며 생략하지 않는다(ADR-010). **동일 세션 degrade 계약 (ADR-058 D5)**: (a) designer→reviewer 페르소나 전환을 *명시적 단계*로 끊고, (b) 그 라운드 산출물과 최종 출력에 `under-verified: 동일 세션 감사`를 명시하며, (c) 완전 독립 감사가 요구되면 승인 보류한다. **결정적 렌더 게이트(`STACK_SETUP_PLAN.md ## Design Gate Adapter`의 `ready` command)는 세션 격리와 무관하게 그대로 실행**되므로 배포불가 결함(serious/critical axe·320 geometry)은 Codex 경로에서도 차단된다.

## 모드
- `--fast`: R0(Layer A/B minimal — 있으면 사용자 힌트 우선, 없으면 자율 조사 1~2개로 최소 grounding + minimal 노트) + R1(원칙 1줄 + voice 기본값 확인 1회) + R3(토큰) + R5(저장 — 축약 섹션, §10 포함). **갤러리 라운드(R0-G)·R2 concept·R4·R6-2 reviewer 픽셀 판정 생략 — R6-1 테마 배선·쇼케이스·게이트는 수행**(`_theme/manifest.json`이 design-milestone 필수 입력) — R5 저장은 *생략하지 않는다*. R1은 *완전 생략 금지*(minimal 1줄). 게이트는 산출물 기준 — `--fast`는 R2(concept) 미생성이라 R2-G 게이트 적용 대상 없음(N/A, ADR-058 D3). `--fast`에서 concept이 필요하면 종료 후 명시 발화로 R2 단독 수행. **종료 출력에 «`## 7` 미작성 — `/design-milestone` 전에 R4 단독 수행 권장» 한 줄을 낸다**: `--fast` 는 R4(컴포넌트 인벤토리)를 생략하는데 `/design-milestone` R3 브리프의 «재사용 vs 신규» 와 ADR-073 D8 의 인터페이스 요소 등록 계약은 `## 7` 이 채워져 있음을 전제한다. 인용할 대상이 없으면 모든 요소가 «신규» 가 되어 미등록 신규 UI 가 구조적으로 재발한다(dogfood Round 11 발견 21 계열).
- 기본: R0~R6 모두.
- `--update`: 기존 DESIGN.md가 있을 때의 부분 갱신/재디자인 모드(아래 `## --update 모드`). 처음부터 R0~R6를 다시 돌지 않는다. 프로필 추가·공유 모드 변경·폰트 교체는 R1 브리프 재실행 + R6 재검토(ADR-073 D11); **토큰·컴포넌트가 바뀌면 R6-1 배선을 delta 재생성한다(생략 금지)**; §10이 v1 형식(언어 블록·용어 사전 없음)인 기존 fork는 R5에서 §10 v2로 마이그레이션(기본값 채움 + 확인 1회 — 구 plan-milestone R5의 §10 신설 경로 승계).

## --update 모드 (재디자인/부분 갱신, ADR-058 / ADR-073 D11)
기존 `docs/20-system/DESIGN.md`가 채워져 있을 때:
- 처음부터 R0~R6를 다시 돌지 않는다. 변경 필요한 부분만 갱신:
  - R0(레퍼런스 재확인 + `DESIGN_RESEARCH.md` 갱신) — *선택*. 시각 방향 자체가 바뀔 때만.
  - R2(concept 시안 재탐색) — *시각 방향 전환 시에만*. 토큰/컴포넌트만 손보면 생략.
  - R3/R4 — 바뀐 토큰·컴포넌트만 부분 갱신(미변경 토큰·§1~§9 구조 보존, 전면 재작성 X).
  - R5 — 저장(변경분 반영).
  - R6 — **토큰·컴포넌트가 하나라도 바뀌면 R6-1 테마 배선을 delta 재생성한다(생략 금지 — DESIGN과 제품 테마가 어긋나는 것을 막는다, ADR-058#amend-4 결정 2).** 그리고 **R6-3b 승인 기준선 영향 대조를 반드시 수행한다** — 토큰 하나가 이전 M 의 승인 스냅샷을 조용히 무효로 만든다. 시각 방향이 크게 바뀌면 R6-2 게이트·픽셀 판정까지 다시 돈다.
- 대규모 재디자인(브랜드/방향 전환)은 *결정 근거*를 ADR로 남길 것을 권장(시각 방향 변경은 되돌리기 비용이 큼).

## 반드시 먼저 읽을 파일
- `docs/10-charter/PROJECT_CHARTER.md` (페르소나·시나리오 — concept 대표 화면 입력)
- `docs/20-system/ARCHITECTURE_OVERVIEW.md` (스택)
- `docs/20-system/DESIGN.md` (현재 placeholder)
- `docs/00-meta/STACK_SETUP_PLAN.md` (`## Design Gate Adapter` `status: ready (self-test PASS <날짜>)` — R2-G·R6 게이트 실행 전제; `## Stack Decision Registry`의 UI 킷·스타일링·미리보기 도구 행 — R6 배선 대상)

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
- **관측 기반 주장만**: visual 주장은 실화면/스크린샷 봤을 때만, behavior 주장은 docs/interaction 봤을 때만 기록. broad search·gallery·Dribbble/Behance는 이름 찾는 lead로만 허용 후 canonical로 승격. — 갤러리 캡처가 그 «실화면»이다(R0-G).
- concept 안에서는 **coherent primary system 1개**. 명시 gap 시에만 secondary primitive(**Radix는 색만 fallback** — 타이포/레이아웃/IA/모션은 ground 못함).
- **MCP·계정 도구를 보일러플레이트 기본 의존으로 추가하지 않는다**(불변 — ADR-073 D13 비결정 존중).
### R0-G. 레퍼런스 갤러리 (ADR-058#amend-4 결정 1 — 기본, `--fast` 생략)
1. **소스 후보 수집**(researcher 디자인 레퍼런스 모드 위임): 방향타(primary task·결정 순간·실패/복구·정체성 tension)에 맞춰 4층에서 후보를 모은다 — 1층 큐레이션 허브(uibowl.io·Mobbin·Refero·Screenlane·Page Flows·Nicelydone / Land-book·Godly·Awwwards / App Store·Google Play 스크린샷 / Behance·Dribbble은 concept-only) · 2층 실제 제품 URL · 4층 getdesign.md 분석본 2~4개(방향 일치 브랜드). researcher는 URL·설명·`출처 유형`·`사용 주의`만 반환한다(값 추출은 Layer B 그대로).
2. **캡처(메인 세션)**: 후보를 `docs/20-system/design-refs/refs.json`에 적고 `node .claude/skills/bootstrap-design/assets/capture-refs.mjs`를 실행한다. 1층 허브·스토어 공개 스크린샷·2층 실제 제품을 모두 캡처한다. 뷰포트는 DESIGN `## 0` 매핑표(없으면 웹 1280/375·앱 390×844). 흐름 관측은 관측 목적별 예산 안(기본 ≤3 흐름 × ≤6 화면). 봇 차단·로그인은 `캡처 불가`로 남기고 사용자에게 3층(inbox) 캡처를 요청한다. 자격 증명은 다루지 않는다.
3. **4층 내려받기**: getdesign.md 분석본은 `docs/20-system/design-refs/cache/<brand>.DESIGN.md`로 저장(gitignore). Google 공식 예시는 R5 format fixture로만(Layer C 불변).
4. **큐레이션(사용자)**: `docs/20-system/design-refs/gallery.html`을 열어 마음에 드는 화면을 고르고 메모하게 한다(«원하시면 추천을 요청하실 수 있어요» 노출 — 취향 오라클). 선택 결과(`selection.json` 또는 대화 답변)를 받는다.
5. **분해(designer)**: 선택본 + 4층 분석본만 입력으로 what-to-borrow/avoid·role·토큰 범위를 분해한다. 분석본은 «getdesign.md 분석본(<brand>)»로 인용하고 값·문구 복제는 금지.
6. `DESIGN_RESEARCH.md` 각 항목에 `- 출처 유형:`·`- 사용 주의:`를 적는다. 갤러리·캡처·캐시는 커밋하지 않는다(재생성 가능).

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
  - 출처 유형: live | curated-hub | store-screenshot | user-capture | design-md-analysis
  - 사용 주의: 참고용(재배포 금지) | concept-only | 비공식 분석본
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
- **voice 기본값 확인 1회 (ADR-073 D6)**: DESIGN.md `## 10`의 기본값(어조·CTA 스타일)을 사용자에게 제시하고 "채택 or 변경"을 확인한다. `--fast`도 이 확인 1회는 수행.
- **프로필·공유 모드 결정 (ADR-073 D3, user-choice)**: 표면이 둘 이상(웹+앱 등)이면 `## 0` 매핑표를 채우고 공유 모드(대부분 공통 / 공통+delta / 독립)를 Decision Brief로 확정한다. 단일 표면이면 1행 + 공유 모드 «단일».
- **폰트 조합 후보 (ADR-073 D4, user-choice)**: 후보 2~3조합을 Decision Brief로 제시하되 **확정은 R6 쇼케이스에서 실제 문장을 본 뒤**로 미룬다(원장 `open` → R6에서 `closed`). 라이선스 확인은 사용자 몫임을 브리프에 적는다.

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
- **실카피 렌더 (ADR-073 D6)**: 대표 화면 문구는 charter 페르소나·시나리오 기반 실제 문구(placeholder 금지). §10 확정 전이므로 "방향 선택용 후보 카피"임을 GENERATED 헤더에 1줄 명시.
- 모든 concept은 charter `## 2.1 페르소나` / `## 3.1 핵심 시나리오` 기반 **동일 대표 화면**(예: 랜딩 hero / 입력 폼 / 카드 리스트)을 렌더해 *직접 비교* 가능하게 한다.
- 각 파일 상단 GENERATED 헤더 주석 필수:
  ```html
  <!--
    GENERATED concept 시안 — /bootstrap-design R2. CANDIDATE — DESIGN.md(SSOT) 아님 (방향 선택용 임시 파일).
    선택·승인 후 R6에서 삭제. 직접 편집 금지(피드백은 재생성으로 반영).
    concept: <A/B/C> — <방향 한 줄 요약>
  -->
  ```
- **(옵션) 외부 concept generator**: UI 프로젝트가 원하면 Google Stitch 등 외부 도구를 concept 생성 보조로 쓸 수 있다 — 단 **기본 의존 금지**(계정·도구 의존 — ADR-073 D13 비결정 존중). 산출물은 DESIGN_RESEARCH.md에 provenance 기록 후, 승인된 방향만 DESIGN.md로 정규화(생성/감사 분리·취향 오라클=사용자 불변).

### R2-1.5. 구별성·조화 비평 (순차 1회 — ADR-058)
- 생성 직후 **reviewer(design surface) 단발 sub-call**(입력은 REFINE/EXPLORE 카드 + concept별 토큰 요약 — 이 단계는 렌더 *전* 값싼 개념 점검이라 HTML 전문 투입 금지; *픽셀* 판정은 뒤의 R2-G가 스크린샷으로 한다) 1회로 판정: ① concept 간 실질 구별성(REFINE/EXPLORE 성격이 실제로 다른가, signature가 task를 돕는가) ② `## 9` Don'ts·(있으면) counter-reference 근접도 ③ **시안 내부 조화 — *카드·토큰 수준의 선언된 짜깁기 신호만***(예: 상충하는 소스를 한 시안에 섞겠다는 카드). *렌더 픽셀의 실제 조화*는 R2-G 스크린샷 리뷰가 확인한다(R2-1.5는 카드만 보므로 여기서 픽셀 조화를 단정하지 않는다). designer 자기 비평 금지(생성/감사 분리).
- **합의·병합·순위·추천 금지** — 출력은 "재생성 필요 concept 목록 + 사유"만. 재생성 필요 concept은 카드를 유지한 채 재생성 후 R2-2로.

### R2-G. 수용 게이트 (ADR-058 D3 — full 모드)
`--fast`는 R2 자체를 생성하지 않으므로 본 게이트 N/A(ADR-058 D3 — 산출물 기준). full 모드는:
- **실행 preflight**: `STACK_SETUP_PLAN.md ## Design Gate Adapter`가 `status: ready (self-test PASS <날짜>)`인지 확인한다(ADR-072 D6 — capability 버전·source digest·fixed conformance 계약은 ADR-058#amend-4 결정 4로 폐지). `missing`/`n/a`/`needs-install`/`wiring-fail`이면 command를 실행하지 않고 concept 선택·DESIGN 저장으로 진행하지 않으며 정확히 `Needs Design Gate: /stack-guard` + 현재 status를 출력한다(MCP·육안·visual-qa로 대체 금지). 이 preflight가 frontend 신호를 뒤늦게 발견한 경우 `/stack-guard` 재실행이 n/a→UI를 복구한다. `ready`면 command template의 args에 `--html docs/20-system/design-concepts/concept-*.html`을 대입해 그대로 실행한다 — **exit 0** 통과 / **exit 1** JSON `blockers` 차단(실패 selector를 designer에 되먹여 재생성) / **exit 2** 사유 echo 후 승인 보류(silent skip 금지).
- **렌더**: 각 concept HTML을 Playwright로 **1280 + 375** 캡처(desktop 폭은 프로젝트 target 명시 시 그 값). stack-guard가 깐 Playwright 재사용.
- **상시 결정적 검사**: **320 CSS px reflow**(page overflow / viewport escape / clipped text) + **populated DOM axe**(빈 화면 아님 — 대표 화면에 실데이터 채운 상태).
- **독립 픽셀 판정**: reviewer(design surface)가 1280/375 스크린샷을 Read로 열람해 위계·밀도·domain fit·장식 slop 판정(생성자 designer와 분리). LLM reviewer 1명.
- **차단(block) — `ready` 상태의 `validate:design` adapter가 결정적 계산**: serious/critical axe · page overflow · **viewport escape · clipped text**(320/375 geometry — check-reflow-320.cjs 이식). **차단(block) — reviewer 픽셀 판정**(스크린샷 열람, 러너가 못 잡는 *주관적* 영역): 위계 붕괴(nested card·장식 rail) · 밀도 · 장식 slop · critical overlap이 primary task를 저해할 때. **보고(report)**: moderate/minor axe + 취향·밀도 finding.
- **수동 smoke**(사람 몫): Tab 순서 · visible focus · trap 없음 · Escape close · 색 외 상태표식.
- **repair loop**: 차단 finding이 있으면 실패 selector + 요약을 **designer에 되먹여 재생성** → 재검사. **retry ≤2**, 초과 시 승인 보류 + brief(R0/R1) 재검토. 여전히 fail이면 그 concept은 선택지에서 제외(사용자에게 사유 echo).
- **정리**: 게이트용 임시 렌더/스크린샷은 통과 판정 후 정리(concept HTML은 R2-2 선택까지 유지 — R6-3에서 최종 삭제).

### R2-2. 선택 루프
- 사용자에게 안내: *"브라우저에서 `docs/20-system/design-concepts/concept-*.html`를 열어 비교하고, 선호 방향(또는 하이브리드: 예 'A 색 + B 타이포')을 알려주세요."*
- 피드백 수령 시 필요하면 concept을 *재생성*(직접 편집 X). 사용자가 한 방향(또는 하이브리드)을 *선택*할 때까지 반복.
- **수렴 규칙 (ADR-058)**: 루프가 *2 사이클 내 미수렴*이면 생성 반복 말고 *brief(R0 레퍼런스 / R1 원칙)를 고친다*(soft 권장).
- **선택 전에는 R3~R6로 진행하지 않는다.** 하이브리드 선택이면 그 조합을 메모로 확정.
- 선택 확정 시 *각 concept의 방향·근거 + 최종 선택 이유*를 `docs/20-system/DESIGN_RESEARCH.md`의 `## 시안 옵션` / `## 최종 선택`에 기록(근거 추적 — DESIGN.md는 최종 *결정*만 담는다, ADR-058).
- **취향 오라클 (ADR-058)**: 에이전트는 선택지 폭 담당 — 선호 추천·순위 제시 금지(사용자가 물으면 예외). **시각 방향 선택은 `authority: user-choice`이므로 원장에 등재하고 선택 확정 시 `closed` + 정본 앵커(`DESIGN.md ## 1 Overview`)를 채운다(ADR-060). 취향 오라클 원칙상 Decision Brief의 "추천" 블록은 비워 둔다 — 사용자가 요청하면 채운다.** 사용자 안내 문구에 *"원하시면 추천을 요청하실 수 있어요"*를 노출한다(예외 경로를 사용자가 놓치지 않게). 사용자가 전량 거부하면 REFINE/EXPLORE 카드부터 재설계(수렴 규칙과 결합).

## R3 — 디자인 토큰 (선택 concept에서 추출, W3C DTCG + Stitch 정렬 — ADR-073 D2)
- **선택된 concept(R2)의 CSS에서 토큰을 추출**해 3-tier로 정리: primitive → semantic → component.
- **`--fast` fallback (R2 생략 — concept 없음)**: concept CSS가 없으므로 R1 원칙 + R0 레퍼런스(`DESIGN_RESEARCH.md`)에서 토큰을 *직접* 도출한다(구 `--fast`의 자기완결 토큰 흐름 보존 — concept 결합으로 인한 소스 공백 방지).
- color: brand 1 + neutral 1 + accent 1 + semantic 4 (success/warning/error/info), 12~16 hex.
- typography: 1~2 family, 4~5 size scale, modular ratio (1.125/1.25/1.333), weight pair.
- spacing: 4 or 8 base, t-shirt scale 또는 numeric.
- radius / shadow / motion (duration·easing·`prefers-reduced-motion` — §8 semantic motion contract 정합).
- WCAG 4.5:1 텍스트 대비 검증 권장(정밀 검사는 R6/게이트의 axe가 결정적).
- **밀도 힌트**: 제품 성격에 맞는 밀도를 1줄 — 대시보드=조밀 / 마케팅·랜딩=여유 (DESIGN.md §1 contextual density와 정합).
- **폰트 결정 블록 9항목**(ADR-073 D4)을 채운다. 조합은 R1 후보 중 R6에서 확정될 값으로 잠정 기입.

## R4 — 컴포넌트 인벤토리 + category state 계약 (ADR-073 D2)
- primitives (Button/Input/Text/Icon), composites (Card/Modal/Toast), patterns (Form/EmptyState/ErrorState/LoadingState).
- 상태 = category별 expected (DESIGN.md §7 정합): interactive primitive(default/hover/active/focus-visible/disabled, async면 loading) · data composite/screen(default/loading/empty/error/success) · static primitive(상태 매트릭스 없음). N/A는 category상 expected를 의도적으로 뺄 때만.
- 스택별 시작점:

  | 스택 | 시작점 |
  |------|--------|
  | React/Next.js | shadcn/ui (Radix + CSS 변수) |
  | Vue | shadcn-vue |
  | Svelte | shadcn-svelte |
  | Astro | shadcn 패턴 + Astro 어댑터 |
  | RN/Expo *(범위 밖 — project ADR supersede 시)* | Tamagui |
  | Flutter (Android·iOS — 직접 지원) | ShadCN-Flutter 또는 Material 3 |
  | SwiftUI *(범위 밖 — project ADR supersede 시)* | Apple HIG 토큰 직접 정의 |

  기본 자동화 직접 지원 스택: React/Vue/Svelte/Astro + Flutter(Android·iOS — ADR-059). RN·SwiftUI는 **범위 밖** — project ADR로 ADR-031의 기본 범위 결정을 supersede하는 경로를 쓴다(`--override` 플래그는 미구현 — ADR-031#amend-1).

## R5 — `docs/20-system/DESIGN.md` 저장 (선택 concept에서 authoring, ADR-058)
- 섹션 순서를 Stitch DESIGN.md canonical에 정렬(ADR-073 D2): Overview / Colors / Typography / Layout / Elevation & Depth / Shapes / Components / Motion / Do's and Don'ts.
- 토큰은 fenced `yaml` 블록 또는 frontmatter YAML로.
- `## 1 Overview`에: (a) `DESIGN_RESEARCH.md` 상대경로 링크 + what-to-borrow/avoid 1~2줄, (b) `선택 concept: <X>(+하이브리드 메모)` 한 줄(ADR-058).
- `## 10 Voice & Writing`을 언어별 블록(ADR-073 D6)으로 확정 저장한다 — 용어 사전 표는 charter 시나리오의 핵심 명사·동사로 초기 채움. `## 11 기준 자료`는 baseline 표를 유지하고 R0에서 새로 참고한 자료가 있으면 행을 더한다(확인일 필수).
- **포맷 완성도 point-check (ADR-058 Layer C)**: R5 저장 직후 Google 공식 예시 DESIGN.md(`google-labs-code/design.md/examples` — authoritative, 예: `examples/paws-and-paths/DESIGN.md`(실측 확인된 완성 예시: Brand&Style/Colors/Typography/Layout/Elevation/Shapes/Components + 토큰))와 대조해 메인 세션이 *섹션 완성도·빠짐*만 advisory 점검한다(별도 agent 호출 불요 — 예시 fetch + 비교). **미감·값·시각 방향은 참조 금지**(공식 예시가 glassmorphism/보라 그라디언트라 §9 anti-slop 오염 — format fixture로만). (옵션) UI+Node면 `@google/design.md lint`(stack-guard 권장 명령)도 이 시점에 실행 가능.
- **DESIGN.md 상태 승격 (ADR-073 D9)**: 본 R5 저장 완료 시 `docs/20-system/DESIGN.md` `## 0. Status`를 `draft` → **`living`**으로 갱신한다(정식·`--fast` 경로 모두 수행 — R6 생략 프로젝트도 승격되도록). 비-UI 삭제 경로는 불변.

### R5-C. 자기 정합 검사 (저장 직전 1회 — 필수)
- **용어 사전 ↔ 같은 문서의 카피 예시**: `## 10` 용어 사전의 **금지 동의어** 열에 있는 각 낱말을 **DESIGN.md 자기 자신**에서 grep 한다(`## 7` 상태 칸·`## 10` 카피 예시·`## 1` 원칙 문장 등 카피가 들어가는 모든 자리). 일치가 나오면 **사전을 SSOT 로 보고 카피를 고치거나**, 그 낱말이 다른 뜻으로 쓰인 관용구면 사전에 예외 행을 둔다. 둘 중 하나를 하기 전에는 저장하지 않는다.
- **왜 여기인가**: stabilize 의 5-2b voice grep 은 *변경된 코드 파일*만 보고 **`DESIGN.md` 자체를 제외**한다(규칙 정의 영역이라서). 그래서 문서 안의 자기모순은 어느 기계 검사에도 안 걸리고, 그 카피가 브리프 → 코드로 퍼진 뒤에야 사람 눈에 띈다. 실측(dogfood Round 12): 사전이 「할 일」을 *습관* 의 금지 동의어로 등재했는데 `## 7` `TodayHeader` 행과 `## 10` 카피 예시가 둘 다 「오늘 할 일을 다 했어요」를 썼고, **designer 가 브리프를 쓰다 우연히 발견**했다(5곳으로 이미 번진 뒤였다).
- **범위는 이 한 파일이다** — 코드 grep 이 아니라서 문맥이 전부 카피이고 오탐이 거의 없다. 발견을 출력에 `[Design-voice-self] <줄>: 사전 금지어 «<낱말>»` 로 남긴다.

## R6 — 네이티브 테마 쇼케이스 + 검토 루프 + 정리 (ADR-058#amend-4 결정 2)

> 목적: 확정된 DESIGN.md 토큰이 **실제 스택 테마에 배선되어** 충실히 렌더되는지 확인한다. 옮김 오차(토큰→테마)를 여기서 한 번 승인한다. 배선 파일은 제품 코드이며 커밋한다. `--fast`는 R6-2 reviewer 픽셀 판정만 생략(배선·쇼케이스·게이트는 수행). `--update`는 토큰·컴포넌트 변경 시 R6-1을 delta 재생성.

### R6-1. 테마 배선 + 쇼케이스 생성 (builder 단발 sub-call, dispatch에 `mode: ui-authoring` — designer 스펙 입력)
- 웹: `src/styles/tokens.css`(또는 스택 관례 경로)에 DESIGN `## 2~6` 토큰을 CSS 변수로, Tailwind/테마 설정이 그 변수를 참조하게 배선. **생성형 UI 킷이 이미 쓴 토큰 블록이 있으면**(`/stack-guard` 6-2-b 가 `STACK_SETUP_PLAN` 에 기록해 둔다) **지우지 말고 킷 변수를 DESIGN semantic 토큰의 별칭으로 재정의한다** — `--primary: var(--color-accent)` 처럼 킷 쪽이 DESIGN 을 가리키게 한다. **반대 방향(DESIGN 이 킷 변수를 가리킴)은 금지** — 출처가 둘이 되면 DESIGN 이 SSOT 가 아니게 된다(ADR-071 D6). **DESIGN `## 9` 의 상태 규정 중 의사 클래스가 필요한 것(포커스 링·hover·disabled)은 전역 CSS 로 함께 배선한다** — 인라인 스타일·style prop 으로는 `:focus-visible` 을 표현할 수 없어, 배선하지 않으면 이후 모든 화면에 브라우저 기본 포커스 링(팔레트 밖 색)이 그대로 나온다(dogfood Round 11 관측). Storybook `Theme/Showcase` 스토리 1개 — 섹션 순서: Tokens(swatch+hex+대비비 / typography scale — **폰트 후보 조합별 실제 서비스 문장** / spacing / radius·shadow) → Components(`## 7` 인벤토리 각 category expected 상태 — hover/focus는 상태 클래스 변형 병행) → 대표 화면 2~3개(실카피). 프로필이 둘 이상이면 프로필별 스토리(`Theme/Showcase/<profile>`).
- Flutter: `lib/theme/tokens.dart`·`lib/theme/app_theme.dart`(ThemeData/ColorScheme/TextTheme 배선) + `lib/prototype/theme_gallery.dart` 진입 파일(같은 섹션 순서) + `test/prototype/theme_gallery_test.dart`(프로필 뷰포트 렌더 + Accessibility Guideline 4종 + overflow 0 + 스냅샷 PNG).
- **폰트는 «전달 방식»까지 배선한다 (ADR-073#amend-1 결정 1·2 — 필수)**. 폰트 패키지·파일(예: `@fontsource/*`·`pretendard`, `assets/fonts/`, Flutter `pubspec.yaml` `fonts:`)은 여기서 추가한다(설치 소유 예외 — ADR-071 D6).
  - **패밀리 이름을 CSS 변수·`TextTheme` 에 쓴 것은 배선이 아니다.** DESIGN `## 3` 의 전달 방식이 self-host 면 **폰트 파일 + `@font-face`(또는 프레임워크의 local-font 경로 — Next 는 `next/font/local`)**, 앱 번들이면 **`pubspec.yaml` `fonts:` 선언 + asset 파일**이 있어야 한다. 실측(Round 12): `--font-family-base: "Pretendard Variable", system-ui, …` 만 있고 `@font-face` 가 0건이라 브라우저가 곧장 fallback 으로 떨어졌고, **승인 스냅샷 26장이 결정되지 않은 글꼴로 찍혔다.** 같은 공백이 Flutter 에서는 tofu 로 나타났다(발견 55).
  - **스캐폴드가 심은 폰트를 지운다** — 수행 0 이 만든 `next/font/google` import, 킷 기본 fontstack 등 DESIGN `## 3` 이 고르지 않은 패밀리는 여기서 제거한다(발견 42 와 같은 계열: 스캐폴드 결정이 DESIGN 결정보다 오래 산다).
  - 배선하지 않기로 했다면 **DESIGN `## 3` 에 `- 배선: 미배선 — <사유>` 를 적는다**(침묵 금지). `/design-milestone` R0 preflight 가 그 표기를 보면 스냅샷 승인을 진행하지 않는다.
- 매니페스트: `docs/20-system/prototypes/_theme/manifest.json`(ADR-072 D3 schema, `milestone: "_theme"`)에 쇼케이스 화면을 등록한다.
- **절별 산출 확인 (필수)**: `## 2`~`## 6` **각 절이 최소 1개 토큰을 내보냈는지** 확인한다. 내보낼 것이 없는 절은 배선 파일 주석에 `<절>: 토큰 없음 — <사유>` 를 남긴다. **색만 내보내고 레이아웃을 빠뜨리는 것이 기본 실패 양식이다** — dogfood Round 12 실측: `tokens.css` 에 container·max-width 토큰이 0건이라 화면 코드가 `960px`·`480px` 을 하드코딩했고 `--tokens-only` 가 6건을 리포트했다(ADR-073 D2 — 그 값들은 DESIGN `## 4` 에 산문으로만 있었다).
- 파일 상단 주석: `GENERATED FROM docs/20-system/DESIGN.md — 수정은 DESIGN.md → /bootstrap-design R6 재생성. 토큰 외 값 금지.`
### R6-2. 게이트 + reviewer 픽셀 판정
- `STACK_SETUP_PLAN.md ## Design Gate Adapter`가 `ready`인지 확인 후 `validate:design -- --manifest docs/20-system/prototypes/_theme/manifest.json`을 실행한다(경로 추측 금지; `needs-install`·`n/a`면 `Needs Design Gate: /stack-guard` + 승인 보류). 차단(serious/critical axe·좁은 폭 geometry·Flutter guideline·overflow)은 **DESIGN.md를 먼저 고치고** R6-1 재생성(retry ≤2, 초과 시 brief 재검토).
- reviewer(design surface) 단발 sub-call이 `design-gate-shots/` 스크린샷을 Read로 열람해 위계·밀도·slop·overlap을 판정(Design Consistency 6차원 전부 — DESIGN 확정 후). Codex: 순차 페르소나 + `under-verified` 명시. **reviewer가 차단 등급(위계 붕괴·critical overlap·장식 slop)을 내면 러너 차단과 같은 경로**로 DESIGN.md를 먼저 고치고 R6-1 재생성(retry ≤2, 초과 시 승인 보류 + brief 재검토). moderate/minor·취향은 보고만.
- 게이트 command가 **exit 2(Needs Install)**로 끝나면 사유를 echo하고 승인을 보류한다(fail-closed — ADR-058 D3). 승인 전에는 R6-4 정리와 후속 단계 권장을 수행하지 않는다.
### R6-3. 검토 루프 + 폰트 확정
- 사용자에게 «`npm run storybook`(또는 `flutter run -t lib/prototype/theme_gallery.dart`)으로 열어 확인해 주세요» 안내. 피드백은 **DESIGN.md 먼저 수정 → 재생성**. 2사이클 미수렴 시 brief(R0/R1) 수정.
- 폰트 조합을 여기서 확정하고 원장 `closed` + `DESIGN.md ## 3` 앵커. `## 3` 폰트 블록의 잠정값을 확정값으로 갱신.
### R6-3b. 승인 기준선 영향 대조 (`--update` 필수 — ADR-072 D5-5 / dogfood Round 12 회귀 (c))
- **토큰·컴포넌트가 하나라도 바뀐 `--update` 라운드는 종료 전에 이것을 한다.** 커밋된 `docs/20-system/prototypes/M*/manifest.json` 을 전부 찾아, 각 화면을 `validate:design -- --manifest <경로> --snapshot <임시 디렉터리>` 로 재렌더한 뒤 **그 M 의 커밋된 `snapshots/` 와 바이트 대조**한다.
- 달라진 화면이 있으면 출력에 낸다 — `승인 기준선 영향: M<K>/<screen> (<n>/<m> 스냅샷 상이)` + 해소 경로 두 가지: **(i) 그 화면을 다음 M 매니페스트에 `supersedes: ["M<K>/<screen>"]` 로 재등록**(ADR-072 D5-5 — 이전 M 파일은 불변) **(ii) 봉인 전 M 이면 같은 M 안에서 재승인·대체**(D4). **어느 쪽도 본 skill 이 자동으로 하지 않는다** — 기준선 이동은 승인 행위다.
- **게이트의 `blockers: 0` 은 이 질문에 답하지 않는다** — 게이트는 렌더해서 a11y·geometry 만 보고 승인본과 대조하지 않는다. 실측(Round 12 회귀 (c)): accent 토큰 1개를 바꾸자 M1 승인 스냅샷 **12개 중 6개**가 바이트 상이해졌는데 게이트는 blockers 0 이었다.
- 매니페스트가 0개면(첫 디자인 라운드) 침묵한다. 임시 디렉터리는 대조 후 지운다.

### R6-4. 정리
- 승인 시 `docs/20-system/design-concepts/concept-*.html`만 삭제한다. 테마 배선·쇼케이스·`_theme/manifest.json`은 **유지·커밋 대상**(살아 있는 참조 — `/design-milestone`이 재사용).
- 안내: «concept 삭제됨 / 테마 쇼케이스는 코드로 유지(재생성: `/bootstrap-design` R6)».

## 종료 후
- 사용자가 `/clear` 권장. R0~R6가 인터랙션 길어지면 다음 task의 컨텍스트에 잡음.

마지막 출력:
- `docs/20-system/DESIGN.md` 경로
- `docs/20-system/DESIGN_RESEARCH.md` 경로 (레퍼런스 노트)
- 테마 쇼케이스(Storybook `Theme/Showcase` 또는 `lib/prototype/theme_gallery.dart`) 경로
- 선택된 concept: <A/B/C 또는 하이브리드 메모>
- concept 상태: 삭제됨 / 쇼케이스: 유지(커밋)
- 채워진 섹션 요약
- **원장 요약**: `closed N건 / deferred M건 / open K건` (`docs/10-charter/DECISION_REGISTER.md` — 시각 방향·voice 확정은 `closed`로, 미확정은 `open`으로 등재)
- 후속 권장 단계: **사용자가 시안을 승인한 뒤** `/plan-milestone`(M/F가 아직 없으면 — ADR-057; `contract-ready` M에 task 0건/`draft`가 있으면 `/plan-workitem M<N>` → `/seal-milestone M<N>`(ADR-060); `ready`(봉인 완료) M이면 잠겨 있으므로 다음 M; 이미 구현 중이면 해당 task workflow 또는 다음 M)(UI 마일스톤은 `/plan-milestone` → `/design-milestone M<N>` 순). 미승인 상태면 "concept 선택·쇼케이스 검토 먼저" 안내.

## 결정 마감 (ADR-060)
본 skill이 내리거나 발견하는 기획 결정 중 **사용자가 정하거나 승인해야 할 것**을 `docs/10-charter/DECISION_REGISTER.md`에 등재한다 — 대화 출력으로만 두지 않는다.

1. **등재 시점에 `authority`를 확정한다** (ADR-060 D2): 제품 의도·범위·우선순위·사용자 체감·외부 계약·데이터/보안·비용·위험 허용도·비가역 약속 → `user-choice`. 스택·인증·데이터 경계·되돌리기 비싼 구조 → `user-approval`. 승인된 경계 안의 가역적 내부 선택 → `agent-delegated`. **`user-*`를 `agent-delegated`로 낮추려면 사용자 명시 승인 + 항목에 이력 줄이 필요하다.**
2. **등재 범위 (원장을 얇게 유지)**: `user-*` 결정 전부 + 종류 불문 `open`/`deferred`로 남는 항목만 등재한다. **`agent-delegated`는 개별 등재하지 않고** 4의 일괄 확인으로만 처리한다. **코드 품질·형식 지적과 계획 결함은 원장 대상이 아니다** — 기존 `남은 미결정 사항` 출력 슬롯이 그대로 소유한다.
3. **`user-*` 결정은 Decision Brief 6블록으로 제시한다** (ADR-060 D3 / ADR-046#amend-1 — 압축 예외): 배경(왜 지금) → 용어(배경 없이도 이해되게) → 선택지 2~3안(각각 한 줄 요약·이 프로젝트에서의 체감·장점·감수할 것) → 되돌리기 비용 → 추천+근거 → 답변 방법. **라운드당 3~5개 상한**, `skip` 불허(선택 / 추가 설명 / 리서치 요청 / 연기 중 택1). 답변은 평이한 문장으로 재진술해 확인한 뒤 정본에 기록한다.
4. **라운드 종료 시 일괄 확인 1회**: 그 라운드의 `agent-delegated` 결정을 목록으로 제시하고 "바꿀 것 있으면 알려달라"를 1회 확인받는다. 사용자가 뒤집으면 그 항목은 `user-approval`로 원장에 등재한다.
5. **닫히지 않은 항목**: 현재 M 무영향 + 이관 앵커 + 회수 시점 3개를 모두 갖추면 `deferred`, 아니면 `open`으로 남긴다(ADR-060 D4). **앵커 없는 유예는 금지**한다. 현재 M을 막는 사실 조사는 `deferred`가 아니라 `/research-pack` 선행으로 종결한다.
6. 결정 *본문*은 **본 skill이 소유한 정본 문서**(DISCOVERY / Charter / ARCHITECTURE / DESIGN / ADR 중 해당 단계에 존재하는 것)에 쓰고, 원장에는 위치 앵커와 처분 상태만 적는다(ADR-005). 본 skill이 소유하지 않는 문서는 건드리지 않는다.
7. **마일스톤이 아직 없는 단계**(discover/bootstrap)에서는 `영향: (미할당)`으로 등재한다. `/plan-milestone` R1이 triage한다.

## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 ADR/architecture 섹션은 task 본문에서 발화 시 인용 — 사전 fork-load 금지.
