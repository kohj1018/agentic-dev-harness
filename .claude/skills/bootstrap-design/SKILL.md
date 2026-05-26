---
name: bootstrap-design
description: UI 시각 결정 발굴 라운드 (R0~R5). DESIGN.md 채움. UI 스택 포함 프로젝트 전용.
argument-hint: "[product description | --fast]"
disable-model-invocation: true
allowed-tools: Read Glob Grep Write Edit Agent Bash(rm docs/20-system/design-preview.html)
context-pack: minimal
---

# /bootstrap-design

> 모드: How-to (UI 시각 결정 라운드)
> 패턴: `discover-product` 차용 — `context: fork`를 명시하지 않아 메인 세션이 R0~R5를 직접 운전한다. R0(레퍼런스 분해)과 R1(원칙 추출)의 무거운 추론은 `Agent` 도구로 architect를 단발 sub-call로 위임. 종료 후 사용자가 `/clear` 권장 (R0~R5 인터랙션이 다음 task 컨텍스트에 잡음).

## 트리거
- `/bootstrap-stack` 종료 출력에 "frontend 감지됨. `/bootstrap-design` 권장" 텍스트 한 줄. 사용자 발화로 시작.
- 비-UI 프로젝트는 호출되지 않음 (ADR-031 직접 지원 범위 밖).
- 본 skill은 baseline placeholder DESIGN.md를 *채우는* 흐름. 비-UI 프로젝트는 fork 직후 DESIGN.md를 삭제했음을 전제. 파일 부재 시 작업 중단 + 사용자에게 보고.

## 모드
- `--fast`: R0(레퍼런스 1개) + R1(원칙 1줄 minimal) + R2(토큰) + R4(저장 — 축약 섹션). **R3(컴포넌트 인벤토리)·R5(시안)는 생략** — R4 저장은 *생략하지 않는다* (생략하면 DESIGN.md 가 안 채워져 skill 목적 무산). R1은 *완전 생략 금지* — R2 토큰 결정의 근거가 되므로 *minimal 1줄*(예: "monochrome + 1 accent")이라도 채운다. `--fast`에서 시안이 필요하면 종료 후 사용자가 "design-preview 생성"을 명시 발화 → R5만 단독 수행.
- 기본: R0~R5 모두.

## 반드시 먼저 읽을 파일
- `docs/10-charter/PROJECT_CHARTER.md` (페르소나·시나리오)
- `docs/20-system/ARCHITECTURE_OVERVIEW.md` (스택)
- `docs/20-system/DESIGN.md` (현재 placeholder)

## 반드시 수행할 일
- 본 skill은 baseline placeholder `docs/20-system/DESIGN.md`를 *채운다* (생성 X). 파일이 없으면 fork 사용자가 비-UI 프로젝트로 판단해 삭제한 경우 — 작업 중단 + 사용자에게 *"본 프로젝트는 비-UI라 판단됨. /bootstrap-design 실행 의도 확인 필요"* 보고.
- DESIGN.md 본문 상단 주석(`baseline placeholder`)을 변경하지 않는다 — 정책 SSOT는 STRUCTURE.md presence 컬럼 + 본 파일 주석.

## R0 — 레퍼런스 추출 + 안티-레퍼런스
- 좋아하는 제품 1~3개 (예: Linear / Notion / Stripe / Vercel / Arc / Things)의 시각 메커니즘 분해:
  - color signature
  - typography pairing
  - density
  - motion 톤
- **안티-레퍼런스 1~2개 필수**: "purple gradient generic SaaS 같지 말 것", "indigo-on-slate Tailwind 디폴트 회피".
- architect 단발 sub-call로 분해 가능.
- **(옵션) reference-evidence grounding** (ADR-027 amend 2 결정 26 — 기본 의존 추가 X, *가용한 것*만): 사용자 제공 URL/스크린샷, 또는 연결돼 있다면 MCP 화면 리서치(lazyweb 무료 / mobbin 유료), 또는 사전추출 라이브러리(refero.design / getdesign.md)에서 1~3개 레퍼런스를 근거로 본다. 본 것에서 *what to borrow* / *what to avoid* 를 각 1줄씩 추려 DESIGN.md `## 1 Overview` 에 남긴다. **MCP·계정 도구를 보일러플레이트 기본 의존으로 추가하지 않는다** — agent 가 기본 브라우징 불가하면 사용자가 URL·스크린샷을 직접 제공.

## R1 — 디자인 원칙 3~5개
- actionable verb. 모호어("modern/clean/sleek") 금지.
- 예: "정보 밀도 우선", "monochrome + 1 accent", "motion은 의미 전달용만".
- `--fast` 모드에서도 *최소 1줄*은 필수.

## R2 — 디자인 토큰 (W3C DTCG + Stitch 정렬)
- 3-tier 토큰: primitive → semantic → component.
- color: brand 1 + neutral 1 + accent 1 + semantic 4 (success/warning/error/info), 12~16 hex.
- typography: 1~2 family, 4~5 size scale, modular ratio (1.125/1.25/1.333), weight pair.
- spacing: 4 or 8 base, t-shirt scale 또는 numeric.
- radius / shadow / motion (duration·easing·`prefers-reduced-motion`).
- WCAG 4.5:1 텍스트 대비 검증 권장.

## R3 — 컴포넌트 인벤토리 + 상태 매트릭스
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

## R4 — `docs/20-system/DESIGN.md` 저장
- 섹션 순서를 Stitch DESIGN.md canonical에 정렬: Overview / Colors / Typography / Layout / Elevation & Depth / Shapes / Components / Motion / Do's and Don'ts.
- 토큰은 fenced `yaml` 블록 또는 frontmatter YAML로.

## R5 — 라이브 시안(design-preview.html) 생성 + 검토 루프 + 정리 (ADR-027 amend 2 결정 21·22)

> 목적: plan 으로 넘어가기 *전에* 사용자가 시각 방향을 눈으로 확인·확정한다. DESIGN.md 가 *SSOT*, preview 는 *검토용 임시 파일* (ADR-005 — preview 직접 편집 금지 / 검토 완료 후 삭제).

### R5-1. 생성
- `docs/20-system/DESIGN.md` 의 토큰·컴포넌트만으로 **단일 자기완결 HTML** `docs/20-system/design-preview.html` 를 생성한다 (빌드·외부 의존 0 — CSS 는 `<style>` 인라인).
- DESIGN.md `## 2~6` 토큰은 `:root { --token: value; }` CSS custom property 로 옮기고, 모든 요소가 *그 변수만* 참조하게 한다 (DESIGN.md 가 SSOT 임이 구조로 드러나도록 — raw hex 직접 사용 금지).
- 파일 상단에 GENERATED 헤더 주석(아래) 필수:
  ```html
  <!--
    GENERATED FROM docs/20-system/DESIGN.md — 검토용 임시 파일(검토 완료 시 삭제). 직접 편집 금지.
    SSOT는 DESIGN.md. 수정은 DESIGN.md → /bootstrap-design R5 재생성.
    생성 기준: <DESIGN.md 갱신 시각 / 생성 일시>
  -->
  ```
- preview 가 포함할 섹션(순서):
  1. **Tokens** — color(primitive/semantic/component) swatch + hex + 텍스트 대비비 표시 / typography scale(각 size·weight 샘플) / spacing scale(시각 막대) / radius·shadow 샘플.
  2. **Components** — DESIGN.md `## 7` 인벤토리의 각 컴포넌트를 8 상태(default/hover/active/focus/disabled/loading/error/empty)로 나란히 렌더. hover/active/focus 는 CSS pseudo + *상태 클래스 변형*(예: `.is-hover`)을 둘 다 둬서 정적 캡처에서도 보이게 한다.
  3. **대표 화면 2~3개** — charter `## 2.1 페르소나` / `## 3.1 핵심 시나리오` 에 기반한 실사용 맥락(예: 랜딩 hero / 입력 폼 / 카드 리스트·대시보드 패널). 토큰이 실제 화면에서 어떻게 보이는지 확인용.
- 생성 직후 DESIGN.md `## 9 Do's and Don'ts` 위반을 self-check 해 위반 의심 항목을 출력에 보고(자동 차단 X).

### R5-2. 검토 루프
- 사용자에게 안내: *"브라우저에서 `docs/20-system/design-preview.html` 를 열어 확인하고 피드백 주세요."*
- 피드백 수령 시 **반드시 DESIGN.md(SSOT) 를 먼저 수정** → 그 다음 preview 재생성. (preview 를 먼저 고치지 않는다.)
- 사용자가 *승인*할 때까지 반복. 승인 전에는 R5-3(삭제) 와 `/plan-workitem` 권장을 수행하지 않는다.
- `--fast` 에서는 R5 를 생략(위 `## 모드`). 사용자가 명시 요청 시 R5 만 단독 수행.

### R5-3. 정리 (시안 삭제)
- 검토가 끝나고 사용자가 시안을 *승인*하면 `docs/20-system/design-preview.html` 를 **삭제**한다. 시안은 검토용 임시 산출물이고, 확정된 시각 결정은 이미 DESIGN.md(SSOT)에 반영돼 있으며, 필요하면 언제든 R5 단독 실행으로 재생성 가능하다.
- 삭제 후 사용자에게 "시안 검토 완료 — design-preview.html 삭제됨 (재생성: `/bootstrap-design` R5)" 1줄 안내.
- **예외**: 사용자가 *명시적으로 보존을 요청한 경우에만* 파일을 유지하고, 이때는 `.gitignore` 에 `docs/20-system/design-preview.html` 추가를 권장(영속 commit 방지 — DESIGN.md 와의 drift 회피).

## 종료 후
- 사용자가 `/clear` 권장. R0~R5가 인터랙션 길어지면 다음 task의 컨텍스트에 잡음.

마지막 출력:
- `docs/20-system/DESIGN.md` 경로
- design-preview 시안 상태: 삭제됨(승인 후 — 기본) / 유지(보존 요청 시) / 미생성(`--fast`). 재생성: `/bootstrap-design` R5
- 채워진 섹션 요약
- 남은 열린 질문
- 다음 권장 단계: **사용자가 시안을 승인한 뒤** `/plan-workitem` (또는 `/implement-workitem`). 미승인 상태면 "시안 검토·피드백 먼저" 안내.

## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 ADR/architecture 섹션은 task 본문에서 발화 시 인용 — 사전 fork-load 금지.
