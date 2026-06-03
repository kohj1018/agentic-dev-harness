# 디자인 (UI)

> 모드: Reference + How-to (UI 시각 결정의 SSOT)

## 0. Status
draft

<!-- 본 문서는 UI 프로젝트의 시각 결정 SSOT.
     baseline에는 placeholder로 존재한다 (presence: conditional, STRUCTURE.md 참조).
     - UI 프로젝트: /bootstrap-design이 R0~R6 라운드로 본 파일을 채운다 (ADR-049).
     - 비-UI 프로젝트(API 서버 / CLI 도구 등): fork 직후 본 파일을 삭제한다. -->

## 1. Overview
<!-- 디자인 원칙 3~5개 (actionable verb. "modern/clean/sleek" 같은 모호어 금지).
     + [디자인 리서치](DESIGN_RESEARCH.md) 링크 + what-to-borrow/avoid 1~2줄 (ADR-049#d28).
     + `선택 concept: <X>(+하이브리드 메모)` 한 줄 (ADR-049#d30 — /bootstrap-design R2 선택 결과). -->

<a id="design-2-colors"></a>
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

<a id="design-7-components"></a>
## 7. Components
<!-- primitives (Button/Input/Text/Icon), composites (Card/Modal/Toast), patterns (Form/EmptyState/ErrorState/LoadingState).
     각 컴포넌트마다 상태 매트릭스 강제: default / hover / active / focus / disabled / loading / error / empty. -->

<a id="design-8-motion"></a>
## 8. Motion
<!-- (보일러플레이트 확장 섹션 — Stitch 공식 canonical 8섹션 외. 근거: Material 3 motion / a11y. ADR-027#d24)
     duration/easing + `prefers-reduced-motion` 분기. Material 3 기준: 라우팅 UI 160~240ms, entrance/exit 240~360ms -->

<a id="design-9-donts"></a>
## 9. Do's and Don'ts
<!-- explicit prohibition (LLM 정확도 단일 최대 기여 — ADR-027 #7):
     [기존 규율]
     - 색 5색 이내 / raw hex 금지
     - Inter·Roboto·Arial 디폴트 금지
     - 3-column icon grid 디폴트 금지
     - hierarchy는 size+weight+color 중 2축 이상
     - 한 화면 primary CTA 2개 이상 금지
     - 모든 motion에 `prefers-reduced-motion` 분기
     - 모든 컴포넌트에 ## 7 의 8 상태 매트릭스 정의 (특히 empty/loading/error 누락 빈번)
     [anti-slop 추가 — Impeccable 37패턴에서 흡수, ADR-027#d23]
     - 보라/violet gradient·cyan-on-dark 디폴트 금지 (가장 흔한 AI 슬롭 시그니처)
     - 카드 안의 카드(nested cards) 금지 — 중첩 대신 spacing·divider로 구분
     - heading에 gradient text 금지
     - glassmorphism·neon glow 디폴트 금지 (의도된 brand 결정일 때만 ## 1 Overview에 근거 명시)
     - 전(全) 섹션 center-align 금지 — 본문은 좌측 정렬 기본
     - 동일 형태 card grid 무한 반복(획일적 3-card row 남발) 지양
     - icon-tile-above-heading 패턴 반복 지양
     - monospace를 "기술적 느낌" 장식용으로 남용 금지 (실제 코드·수치에만)
     - bounce/elastic easing 디폴트 금지 (모션은 의미 전달 목적에 한정 — 장식 모션 회피)
     - sparkline 등 데이터 시각요소를 장식으로 사용 금지 -->
