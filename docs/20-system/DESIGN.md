# 디자인 (UI)

> 모드: Reference + How-to (UI 시각 결정의 SSOT)

## 0. Status
draft

<!-- 본 문서는 UI 프로젝트의 시각 결정 SSOT.
     baseline에는 placeholder로 존재한다 (presence: conditional, STRUCTURE.md 참조).
     - UI 프로젝트: /bootstrap-design이 R0~R4 라운드로 본 파일을 채운다.
     - 비-UI 프로젝트(API 서버 / CLI 도구 등): fork 직후 본 파일을 삭제한다. -->

## 1. Overview
<!-- 디자인 원칙 3~5개 (actionable verb. "modern/clean/sleek" 같은 모호어 금지) -->

## 2. Colors
<!-- 3-tier 토큰 (DTCG): primitive(blue-100..900) → semantic(color/text/primary) → component(button/bg/primary) -->

## 3. Typography
<!-- 1~2 family, 4~5 size scale, modular ratio (1.125/1.25/1.333), weight pair -->

## 4. Layout
<!-- 4 또는 8 단위 base spacing, t-shirt scale 또는 numeric -->

## 5. Elevation & Depth
<!-- shadow scale + radius scale -->

## 6. Shapes
<!-- 컴포넌트 모서리 / 컨테이너 형태 -->

## 7. Components
<!-- primitives (Button/Input/Text/Icon), composites (Card/Modal/Toast), patterns (Form/EmptyState/ErrorState/LoadingState).
     각 컴포넌트마다 상태 매트릭스 강제: default / hover / active / focus / disabled / loading / error / empty. -->

## 8. Motion
<!-- duration/easing + `prefers-reduced-motion` 분기. Material 3 기준: 라우팅 UI 160~240ms, entrance/exit 240~360ms -->

## 9. Do's and Don'ts
<!-- explicit prohibition:
     - 색 5색 이내 / raw hex 금지
     - Inter·Roboto·Arial 디폴트 금지
     - 3-column icon grid 디폴트 금지
     - hierarchy는 size+weight+color 중 2축 이상
     - 한 화면 primary CTA 2개 이상 금지
     - 모든 motion에 `prefers-reduced-motion` 분기
     - 모든 컴포넌트에 ## 7 의 8 상태 매트릭스 정의 (특히 empty/loading/error 누락 빈번) -->
