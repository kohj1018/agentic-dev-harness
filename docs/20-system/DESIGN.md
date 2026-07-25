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
     + 긍정적 정체성 (ADR-027#amend-7 — 금지 목록(§9)만으론 '안 촌스러움'까지, 개성·세련은 여기서):
       - design thesis: 이 제품 디자인이 뭘 지향하는가 한 문장 (actionable — 공허한 미사여구 금지).
       - signature mechanism 1개: 이 제품만의 시각/인터랙션 특징 (예: "모든 액션은 커맨드바 한 곳에서"). primary task 이해를 더 빨리 돕지 못하면 두지 않는다(장식이면 제거).
       - imagery/icon 방향: 사진/일러스트/아이콘 스타일 (해당 없으면 "N/A").
       - contextual density: 대시보드=조밀 / 마케팅=여유 등 강도 1줄.
     + [디자인 리서치](DESIGN_RESEARCH.md) 링크 + what-to-borrow/avoid 1~2줄 (ADR-058).
     + `선택 concept: <X>(+하이브리드 메모)` 한 줄 (ADR-058 — /bootstrap-design R2 선택 결과). -->

<a id="design-2-colors"></a>
## 2. Colors
<!-- 3-tier 토큰 (DTCG): primitive(blue-100..900) → semantic(color/text/primary) → component(button/bg/primary) -->

## 3. Typography
<!-- 1~2 family, 4~5 size scale, modular ratio (1.125/1.25/1.333), weight pair.
     + Data-table 계약 (ADR-027#amend-7): 표·정렬이 필요한 숫자 열은 tabular figures(`font-variant-numeric: tabular-nums`)로 정렬 흔들림 방지. -->

## 4. Layout
<!-- 4 또는 8 단위 base spacing, t-shirt scale 또는 numeric.
     + 반응형 = invariant 소유 (ADR-027#amend-7 — 임의 breakpoint 숫자 목록 강제 아님):
       content order(작은 화면에서도 읽기 순서 보존) / container transition(고정폭→유동) / table strategy(가로 스크롤은 표 자체 영역만, page 넘침 금지) / sticky occlusion(고정 요소가 콘텐츠 가림 방지) / 320 CSS px reflow(가로 스크롤·클리핑 없음) / text fit(말줄임보다 줄바꿈 우선) / essential-2D exception(표·캔버스 등 본질적 2차원은 contained region만 스크롤 + 그 region은 keyboard focus/name 보유). -->

## 5. Elevation & Depth
<!-- shadow scale + radius scale -->

## 6. Shapes
<!-- 컴포넌트 모서리 / 컨테이너 형태 -->

<a id="design-7-components"></a>
## 7. Components
<!-- primitives (Button/Input/Text/Icon), composites (Card/Modal/Toast), patterns (Form/EmptyState/ErrorState/LoadingState).
     상태 = category 계약 (ADR-027#amend-7 — 전 컴포넌트 8상태 강제 대체):
     - interactive primitive (Button/Input 등): default / hover / active / focus-visible / disabled (비동기 동작이면 loading 추가).
     - data composite / screen (Card·리스트·화면): default / loading / empty / error / success.
     - static primitive (Text/Icon 등): 상태 매트릭스 없음.
     - 역할별 semantic 상태(해당 컴포넌트에 한): checkbox/radio=checked·indeterminate, tab/segmented=selected, disclosure/accordion=expanded, input=invalid·read-only 등 — 역할이 요구하는 상태를 위 category 위에 추가.
     N/A는 category상 expected 상태를 *의도적으로* 뺄 때만 명시. -->

<a id="design-8-motion"></a>
## 8. Motion
<!-- (보일러플레이트 확장 섹션 — Stitch 공식 canonical 8섹션 외. 근거: Material 3 motion / a11y. ADR-027#d24)
     semantic motion contract (ADR-027#amend-7 — 5항목):
     - 목적: 각 모션이 feedback / continuity / orientation / state-change 중 무엇을 전달하는가 (장식 목적 금지).
     - 빈도: 반복 흐름일수록 motion budget↓ (자주 보는 전환은 짧고 절제).
     - 실행: duration·easing은 project token으로 (interruptible, layout shift 없음).
     - 접근성: `prefers-reduced-motion`에서 정보손실 없는 대체 상태 제공.
     - 금지: decorative infinite/repeated 모션.
     수치는 project token의 *시작 default*로만 (보편 법칙 아님): 버튼 100~160ms / 라우팅 UI 160~240ms / entrance·exit 240~360ms (Material 3 참고). -->

<a id="design-9-donts"></a>
## 9. Do's and Don'ts
<!-- explicit prohibition (LLM 정확도 단일 최대 기여 — ADR-027 #7):
     [기존 규율]
     - 색 5색 이내 / raw hex 금지
     - Inter·Roboto·Arial 디폴트 금지
     - 3-column icon grid 디폴트 금지
     - hierarchy는 size+weight+color 중 2축 이상
     [접근성 — WCAG 2.2, ADR-027#amend-7]
     - 대비: 정상 텍스트 4.5:1 / 큰 텍스트(굵은 18.66px+ 또는 24px+) 3:1 / 비텍스트 UI·아이콘·상태 경계 3:1
     - 포커스 링 제거(`outline:none`만) 금지 — 대체 visible focus 필수
     - 키보드: 모든 인터랙션은 키보드로 도달·조작 가능
     - 아이콘 버튼: accessible name 확보 — 브라우저 computed name(aria-label·aria-labelledby·감싼 visible text·alt·title 등 *어느 출처든*; aria-label 강제 아님). 정밀 판정은 실화면 axe(design-gate.mjs 러너·stack-guard)
     - 색-단독 금지: 상태·의미를 색으로만 표시 금지(아이콘·텍스트·패턴 병행)
     - 한 화면 primary CTA 2개 이상 금지
     - 모든 motion에 `prefers-reduced-motion` 분기
     - 모든 컴포넌트에 ## 7 의 category별 expected 상태 정의 (interactive/data/static — 특히 empty/loading/error/success 누락 빈번)
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
