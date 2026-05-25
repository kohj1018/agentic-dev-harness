---
name: bootstrap-design
description: UI 시각 결정 발굴 라운드 (R0~R4). DESIGN.md 채움. UI 스택 포함 프로젝트 전용.
argument-hint: "[product description | --fast]"
disable-model-invocation: true
allowed-tools: Read Glob Grep Write Edit Agent
context-pack: minimal
---

# /bootstrap-design

> 모드: How-to (UI 시각 결정 라운드)
> 패턴: `discover-product` 차용 — `context: fork`를 명시하지 않아 메인 세션이 R0~R4를 직접 운전한다. R0(레퍼런스 분해)과 R1(원칙 추출)의 무거운 추론은 `Agent` 도구로 architect를 단발 sub-call로 위임. 종료 후 사용자가 `/clear` 권장 (R0~R4 인터랙션이 다음 task 컨텍스트에 잡음).

## 트리거
- `/bootstrap-stack` 종료 출력에 "frontend 감지됨. `/bootstrap-design` 권장" 텍스트 한 줄. 사용자 발화로 시작.
- 비-UI 프로젝트는 호출되지 않음 (ADR-031 직접 지원 범위 밖).
- 본 skill은 baseline placeholder DESIGN.md를 *채우는* 흐름. 비-UI 프로젝트는 fork 직후 DESIGN.md를 삭제했음을 전제. 파일 부재 시 작업 중단 + 사용자에게 보고.

## 모드
- `--fast`: R0(레퍼런스 1개) + R1(원칙 1줄 minimal) + R2(토큰) + R4(저장 — 축약 섹션). **R3(컴포넌트 인벤토리)만 생략** — R4 저장은 *생략하지 않는다* (생략하면 DESIGN.md 가 안 채워져 skill 목적 무산). R1은 *완전 생략 금지* — R2 토큰 결정의 근거가 되므로 *minimal 1줄*(예: "monochrome + 1 accent")이라도 채운다.
- 기본: R0~R4 모두.

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

## 종료 후
- 사용자가 `/clear` 권장. R0~R4가 인터랙션 길어지면 다음 task의 컨텍스트에 잡음.

마지막 출력:
- `docs/20-system/DESIGN.md` 경로
- 채워진 섹션 요약
- 남은 열린 질문
- 다음 권장 단계 (`/plan-workitem` 또는 `/implement-workitem`)

## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 ADR/architecture 섹션은 task 본문에서 발화 시 인용 — 사전 fork-load 금지.
