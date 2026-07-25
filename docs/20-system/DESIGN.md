# 디자인 (UI)

> 모드: Reference + How-to (UI 시각 결정의 SSOT)

## 0. Status
draft

<!-- 본 문서는 UI 프로젝트의 시각 결정 SSOT.
     baseline에는 placeholder로 존재한다 (presence: conditional, STRUCTURE.md 참조).
     - UI 프로젝트: /bootstrap-design이 R0~R6 라운드로 본 파일을 채운다 (ADR-058).
     - 비-UI 프로젝트(API 서버 / CLI 도구 등): fork 직후 본 파일을 삭제한다. -->

## 1. Overview
<!-- 디자인 원칙 3~5개 (actionable verb. "modern/clean/sleek" 같은 모호어 금지).
     + [디자인 리서치](DESIGN_RESEARCH.md) 링크 + what-to-borrow/avoid 1~2줄 (ADR-058).
     + `선택 concept: <X>(+하이브리드 메모)` 한 줄 (ADR-058 — /bootstrap-design R2 선택 결과). -->

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
     - sparkline 등 데이터 시각요소를 장식으로 사용 금지
     [클래스 레벨 규율 — 특정 유행 인스턴스 추격 대신, ADR-058]
     - 브랜드 근거 없이 *현재 인기 fontstack·시각 트렌드*를 디폴트로 쓰지 않는다(Inter 단독 금지의 일반화). 채택 시 ## 1 Overview에 브랜드 근거 명시. -->

<a id="design-10-voice"></a>
## 10. Voice & Writing
<!-- UX writing 규칙서 (ADR-056 결정 8). 아래 기본값은 /bootstrap-design R1에서 "채택 or 변경" 1회 확인 후 확정.
     비-UI 프로젝트는 본 파일 삭제 시 함께 삭제. -->

### 어조 규정 (기본값 — R1에서 확인)
- 한국어: 해요체 (예: "저장했어요"). 명령형 CTA (예: "시작하기", "저장"). 과도한 사과·의인화 금지.
- 영어(해당 시): sentence case, 능동태, 명령형 CTA.

### 내부용어 → 사용자 언어 번역표
<!-- 형식: | 내부 용어 | 사용자 표면 문구 | — 코드·DB의 용어를 화면에 그대로 노출하지 않는다. 프로젝트가 채움. -->
| 내부 용어 | 사용자 표면 문구 |
|---|---|
| (예: workspace_member) | (예: 멤버) |

### 금지 표현
<!-- 2분류 (ADR-056 결정 10): [grep 가능 — 정규식] 은 stabilize preflight가 기계 점검, [LLM-판정] 은 reviewer [Design-voice]가 점검. -->
- [grep 가능] placeholder 카피: `lorem ipsum`, `TODO copy`, `sample text`, `여기에 텍스트`
- [grep 가능] (프로젝트별 정규식 — 예: 해요체 프로젝트에서 합쇼체 어미 `습니다\.` 혼입)
- [LLM-판정] 책임 회피 문구("문제가 발생했습니다"만 있고 원인·다음 행동 없음), 내부 에러코드 노출, 과도한 감탄사

### 표면별 예시 카피 (기본값 — 프로젝트 카피로 교체)
- 버튼: 동사 우선, 2~4어절 (예: "회고 작성하기")
- 에러: 원인 1줄 + 다음 행동 1줄 (예: "링크가 만료됐어요. 새 링크를 요청해 주세요.")
- 빈 상태: 상황 설명 + 첫 행동 유도 (예: "아직 항목이 없어요 — 첫 항목을 추가해 보세요.")
- 확인 다이얼로그: 결과 명시 + 되돌림 가능 여부 (예: "삭제하면 되돌릴 수 없어요. 삭제할까요?")
