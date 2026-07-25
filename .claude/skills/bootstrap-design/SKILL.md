---
name: bootstrap-design
description: UI 시각 결정 발굴 라운드 (R0~R6). 레퍼런스 노트 + DESIGN.md 작성 전 다중 concept 시안 선택. DESIGN.md 채움. UI 스택 포함 프로젝트 전용.
argument-hint: "[product description | --fast | --update]"
disable-model-invocation: true
allowed-tools: Read Glob Grep Write Edit Agent Bash(rm docs/20-system/design-preview.html) Bash(rm docs/20-system/design-concepts/concept-*.html)
---

# /bootstrap-design

> 모드: How-to (UI 시각 결정 라운드)
> 패턴: `discover-product` 차용 — `context: fork`를 명시하지 않아 메인 세션이 R0~R6를 직접 운전한다. R0(레퍼런스 분해)과 R1(원칙 추출)의 무거운 추론은 `Agent` 도구로 **designer**를 단발 sub-call로 위임(ADR-058 — 코드 증거 수집은 researcher 디자인 레퍼런스 모드). 종료 후 사용자가 `/clear` 권장 (R0~R6 인터랙션이 다음 task 컨텍스트에 잡음).
> 라운드 구조 SSOT는 ADR-058(design workflow). DESIGN.md *내용*(8섹션+Motion / 3-tier 토큰 / Don'ts)·인터페이스 할당 SSOT는 ADR-027.

## 트리거
- `/bootstrap-stack` 종료 출력에 "frontend 감지됨. `/bootstrap-design` 권장" 텍스트 한 줄. 사용자 발화로 시작.
- 비-UI 프로젝트는 호출되지 않음 (ADR-031 직접 지원 범위 밖).
- 본 skill은 baseline placeholder DESIGN.md를 *채우는* 흐름. 비-UI 프로젝트는 fork 직후 DESIGN.md를 삭제했음을 전제. 파일 부재 시 작업 중단 + 사용자에게 보고.

**Codex**: 본 skill은 wrapper 미보유(자연어 호출) — Codex에서는 "Follow `.claude/skills/bootstrap-design/SKILL.md`"로 호출한다(목록 SSOT = README, ADR-010#amend-3·#amend-4). 본문의 `Agent` 위임(R0 researcher 디자인 레퍼런스 조사 · R0~R2 designer authoring · R2-1.5 reviewer 구별성 비평)은 Codex에 persona 매핑이 없어 메인 세션이 각 persona 파일(researcher.md/designer.md/reviewer.md)을 읽고 순차 인라인 수행하며 생략하지 않는다(ADR-010).

## 모드
- `--fast`: R0(위계 ①·⑤만 — 사용자 URL 있으면 사용, 없으면 확인 게이트 후 모델 지식 + minimal 노트) + R1(원칙 1줄 + voice 기본값 확인 1회) + R3(토큰) + R5(저장 — 축약 섹션, §10 포함). **R2(concept 시안)·R4(컴포넌트 인벤토리)·R6(preview)는 생략** — R5 저장은 *생략하지 않는다*(생략하면 DESIGN.md 가 안 채워져 skill 목적 무산). R1은 *완전 생략 금지* — R3 토큰 결정의 근거이므로 *minimal 1줄*(예: "monochrome + 1 accent")이라도 채운다. `--fast`에서 concept 시안이나 preview가 필요하면 종료 후 사용자가 "concept 시안 생성" 또는 "design-preview 생성"을 명시 발화 → R2 또는 R6만 단독 수행.
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

## 반드시 수행할 일
- 본 skill은 baseline placeholder `docs/20-system/DESIGN.md`를 *채운다* (생성 X). 파일이 없으면 fork 사용자가 비-UI 프로젝트로 판단해 삭제한 경우 — 작업 중단 + 사용자에게 *"본 프로젝트는 비-UI라 판단됨. /bootstrap-design 실행 의도 확인 필요"* 보고.
- DESIGN.md 본문 상단 주석(`baseline placeholder`)을 변경하지 않는다 — 정책 SSOT는 STRUCTURE.md presence 컬럼 + 본 파일 주석.

## R0 — 레퍼런스 추출 + 안티-레퍼런스 + 레퍼런스 노트 영속화 (ADR-058)
- 좋아하는 제품 1~3개 (예: Linear / Notion / Stripe / Vercel / Arc / Things)의 시각 메커니즘 분해:
  - color signature
  - typography pairing
  - density
  - motion 톤
- **안티-레퍼런스 1~2개 필수**: "purple gradient generic SaaS 같지 말 것", "indigo-on-slate Tailwind 디폴트 회피".
- **grounding 소스 위계 (ADR-058 — 위에서부터 시도, 확보된 소스만 사용)**:
  1. 사용자 제공 URL/스크린샷 — raw CSS URL이면 researcher가 직접 추출, 스크린샷은 메인 세션이 Read로 vision 분해.
  2. **researcher 디자인 레퍼런스 모드 위임 (웹 가용 시 기본, ADR-040#amend-4)**: 레퍼런스 1~3개에 대해 `Agent`(researcher — 디자인 레퍼런스 모드 명시)로 코드 수준 토큰 추출(hex/font/spacing/radius/shadow). 오픈소스 디자인 토큰 패키지(Primer/Polaris/Carbon/Spectrum 등)가 주력 소스 — 값 통째 복제 금지(구조 학습용), what-to-borrow/avoid 판단은 본 라운드 책임.
  3. 연결된 디자인 MCP (STACK_SETUP_PLAN `## Optional MCP Connectors`에 agent access 부여된 경우만 — ADR-048).
  4. 정성 소스(디자인 요약 사이트) — 방향 어휘 보조로만, 값 추출 소스 아님.
  5. 모델 지식 — **①~④ 전부 불가 시, 사용자 확인 게이트 1회 후에만**: "레퍼런스 확보 0건 — URL/스크린샷을 주시겠어요, 아니면 모델 지식 기반으로 진행할까요?" 진행 시 `DESIGN_RESEARCH.md` `## grounding 출처`에 `모델 지식 기반 + <사유>` 명시(silent degrade 금지 — #amend-1 계승).
- 분해(위계로 확보한 증거 → 4축 + borrow/avoid)는 **designer 단발 sub-call**로 위임한다(architect 아님 — ADR-058).
- **MCP·계정 도구를 보일러플레이트 기본 의존으로 추가하지 않는다** (불변 — ADR-027#amend-2 비결정 존중).
- **레퍼런스 노트 영속화 (필수, `--fast`는 minimal)**: 위 분해 결과를 `docs/20-system/DESIGN_RESEARCH.md`에 *문서로* 남긴다. 양식:

  ```markdown
  # 디자인 리서치 (레퍼런스 + 시안 선택 근거)

  > 모드: Reference (DESIGN.md 시각 방향의 근거 — /bootstrap-design R0/R2 산출)
  > SSOT는 DESIGN.md(확정 결정). 본 노트는 *왜 그 방향인가*의 근거 보존.
  - 조사일: <YYYY-MM-DD>

  ## 레퍼런스   <!-- R0 -->
  ### <제품명> — <URL 또는 출처(사용자 제공 / MCP / 라이브러리)>
  - color signature: <...>
  - typography pairing: <...>
  - density: <...>
  - motion 톤: <...>
  - **what to borrow**: <1~2줄>
  - **what to avoid**: <1~2줄>

  #### 추출 토큰 (코드)   <!-- researcher 디자인 레퍼런스 모드 산출 (ADR-040#amend-4) — fenced block에 hex/font/spacing/radius/shadow 실값. 미추출 시 "추출 불가 — <사유>" 1줄 -->

  (레퍼런스 1~3개 반복)

  ## 안티-레퍼런스   <!-- R0 -->
  - <"~같지 말 것"> — <이유 1줄>

  ## grounding 출처   <!-- R0 -->
  - <사용자 URL / 디자인 MCP 이름 / refero·getdesign.md / "직접 제공 없음 — 모델 지식 기반">

  ## 시안 옵션   <!-- R2 — concept별 방향·근거 (선택 후 채움) -->
  - concept A: <방향 한 줄> — <레퍼런스/원칙 근거>
  - concept B: <...>
  - (concept C: <...>)

  ## 최종 선택   <!-- R2 -->
  - 선택: <A / B / 하이브리드("A 색 + B 타이포")> — <선택 이유 1~2줄>
  ```

- DESIGN.md `## 1 Overview`는 본 노트를 *상대경로 링크*(`[디자인 리서치](DESIGN_RESEARCH.md)`)하고 핵심 1~2줄(what to borrow / avoid 요약)만 인라인. `## 시안 옵션`·`## 최종 선택`은 R2 종료 후 채운다(아래 R2-2).

## R1 — 디자인 원칙 3~5개
- actionable verb. 모호어("modern/clean/sleek") 금지.
- 예: "정보 밀도 우선", "monochrome + 1 accent", "motion은 의미 전달용만".
- `--fast` 모드에서도 *최소 1줄*은 필수.
- **voice 기본값 확인 1회 (ADR-056)**: DESIGN.md `## 10`의 기본값(어조·CTA 스타일)을 사용자에게 제시하고 "채택 or 변경"을 확인한다. `--fast`도 이 확인 1회는 수행.

## R2 — 다중 concept 시안 (DESIGN.md 작성 *전* 시각 방향 선택, ADR-058)

> 목적: DESIGN.md(토큰 텍스트)를 쓰기 *전에* 사용자가 **눈으로 시각 방향을 선택**한다. 방향 확정 후 토큰/DESIGN.md를 그 방향에서 파생 → DESIGN.md 전면 재작성 비용 회피. (`--fast`는 본 라운드 생략.)

### R2-1. 생성
- R1 원칙 + R0 레퍼런스(`DESIGN_RESEARCH.md`) + DESIGN.md `## 9` Don'ts에 근거해 **서로 다른 시각 방향 2~3개**를 생성한다. 각 방향을 자기완결 HTML/CSS 파일로 `docs/20-system/design-concepts/concept-A.html`, `concept-B.html`, (`concept-C.html`)에 저장(빌드·외부 의존 0 — CSS는 `<style>` 인라인). 디렉터리가 없으면 생성.
- **divergence 카드 (ADR-058)**: 각 concept에 {① 배타적 레퍼런스 borrow 축(R0 레퍼런스 중 concept별 배정 — 공유 금지; 레퍼런스 수 < concept 수면 동일 레퍼런스의 서로 다른 축(색/밀도/타이포/모션)을 배타 배정), ② 전용 안티-레퍼런스 1개, ③ 밀도/타이포/색 전략 중 최소 2축 상이}를 명시 배정하고 `DESIGN_RESEARCH.md ## 시안 옵션`에 카드를 기록한다. 두 concept이 같은 accent 전략·같은 borrow를 공유하면 재생성. 단 모든 concept이 R0 안티-레퍼런스와 `## 9` Don'ts는 공통 회피.
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

### R2-1.5. 구별성 비평 (순차 1회 — ADR-058)
- 생성 직후 **reviewer(design surface) 단발 sub-call**(입력은 divergence 카드 + concept별 토큰 요약만, HTML 전문 투입 금지) 1회로 판정: ① concept 간 실질 구별성(같은 카드 축을 침범했는가) ② 안티-레퍼런스·`## 9` Don'ts 근접도. designer 자기 비평 금지(생성/감사 분리).
- **합의·병합·순위·추천 금지** — 출력은 "재생성 필요 concept 목록 + 사유"만. 재생성 필요 concept은 카드를 유지한 채 재생성 후 R2-2로.

### R2-2. 선택 루프
- 사용자에게 안내: *"브라우저에서 `docs/20-system/design-concepts/concept-*.html`를 열어 비교하고, 선호 방향(또는 하이브리드: 예 'A 색 + B 타이포')을 알려주세요."*
- 피드백 수령 시 필요하면 concept을 *재생성*(직접 편집 X). 사용자가 한 방향(또는 하이브리드)을 *선택*할 때까지 반복.
- **수렴 규칙 (ADR-058)**: 루프가 *2 사이클 내 미수렴*이면 생성 반복 말고 *brief(R0 레퍼런스 / R1 원칙)를 고친다*(soft 권장).
- **선택 전에는 R3~R6로 진행하지 않는다.** 하이브리드 선택이면 그 조합을 메모로 확정.
- 선택 확정 시 *각 concept의 방향·근거 + 최종 선택 이유*를 `docs/20-system/DESIGN_RESEARCH.md`의 `## 시안 옵션` / `## 최종 선택`에 기록(근거 추적 — DESIGN.md는 최종 *결정*만 담는다, ADR-058).
- **취향 오라클 (ADR-058)**: 에이전트는 선택지 폭 담당 — 선호 추천·순위 제시 금지(사용자가 물으면 예외). 사용자 안내 문구에 *"원하시면 추천을 요청하실 수 있어요"*를 노출한다(예외 경로를 사용자가 놓치지 않게). 사용자가 전량 거부하면 divergence 카드부터 재설계(수렴 규칙과 결합).

## R3 — 디자인 토큰 (선택 concept에서 추출, W3C DTCG + Stitch 정렬 — ADR-027#d6)
- **선택된 concept(R2)의 CSS에서 토큰을 추출**해 3-tier로 정리: primitive → semantic → component.
- **`--fast` fallback (R2 생략 — concept 없음)**: concept CSS가 없으므로 R1 원칙 + R0 레퍼런스(`DESIGN_RESEARCH.md`)에서 토큰을 *직접* 도출한다(구 `--fast`의 자기완결 토큰 흐름 보존 — concept 결합으로 인한 소스 공백 방지).
- color: brand 1 + neutral 1 + accent 1 + semantic 4 (success/warning/error/info), 12~16 hex.
- typography: 1~2 family, 4~5 size scale, modular ratio (1.125/1.25/1.333), weight pair.
- spacing: 4 or 8 base, t-shirt scale 또는 numeric.
- radius / shadow / motion (duration·easing·`prefers-reduced-motion`).
- WCAG 4.5:1 텍스트 대비 검증 권장.

## R4 — 컴포넌트 인벤토리 + 상태 매트릭스 (ADR-027#d6/#d7)
- primitives (Button/Input/Text/Icon), composites (Card/Modal/Toast), patterns (Form/EmptyState/ErrorState/LoadingState).
- 각 컴포넌트마다 상태 매트릭스 강제: default / hover / active / focus / disabled / loading / error / empty.
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
  2. **Components** — DESIGN.md `## 7` 인벤토리의 각 컴포넌트를 8 상태(default/hover/active/focus/disabled/loading/error/empty)로 나란히 렌더. hover/active/focus는 CSS pseudo + *상태 클래스 변형*(예: `.is-hover`)을 둘 다 둬서 정적 캡처에서도 보이게 한다.
  3. **대표 화면 2~3개** — charter `## 2.1 페르소나` / `## 3.1 핵심 시나리오` 기반 실사용 맥락. (R2 선택 concept과 일관되어야 — 불일치 시 DESIGN.md를 먼저 점검.)
  - 대표 화면 preview는 실카피(`## 10` 준수)로 렌더한다 (ADR-056 결정 9 / ADR-058).
- 생성 직후 DESIGN.md `## 9 Do's and Don'ts` 위반을 self-check해 위반 의심 항목을 출력에 보고(자동 차단 X).

### R6-2. 검토 루프
- 사용자에게 안내: *"브라우저에서 `docs/20-system/design-preview.html`를 열어 확인하고 피드백 주세요."*
- 피드백 수령 시 **반드시 DESIGN.md(SSOT)를 먼저 수정** → 그 다음 preview 재생성. (preview를 먼저 고치지 않는다.)
- **수렴 규칙 (ADR-058)**: 루프가 *2 사이클 내 미수렴*이면 생성 반복 말고 *brief(R0 레퍼런스 / R1 원칙)를 고친다*(soft 권장).
- 사용자가 *승인*할 때까지 반복. 승인 전에는 R6-3(정리)과 `/plan-milestone`(마일스톤·feature 미생성 시 — ADR-057; 이미 분해된 feature가 있으면 `/plan-workitem`) 권장을 수행하지 않는다.
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
- 다음 권장 단계: **사용자가 시안을 승인한 뒤** `/plan-milestone`(마일스톤·feature 미생성 시 — ADR-057; 이미 분해된 feature가 있으면 `/plan-workitem`). 미승인 상태면 "concept 선택·preview 검토 먼저" 안내.

## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 ADR/architecture 섹션은 task 본문에서 발화 시 인용 — 사전 fork-load 금지.
