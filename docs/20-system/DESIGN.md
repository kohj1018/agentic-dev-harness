# 디자인 (UI)

> 모드: Reference + How-to (UI 시각 결정의 SSOT)

## 0. Status
draft

<!-- 본 문서는 UI 프로젝트의 시각 결정 SSOT.
     baseline에는 placeholder로 존재한다 (presence: conditional, STRUCTURE.md 참조).
     - UI 프로젝트: /bootstrap-design이 R0~R6 라운드로 본 파일을 채운다 (ADR-058).
     - 비-UI 프로젝트(API 서버 / CLI 도구 등): fork 직후 본 파일을 삭제한다. -->

<a id="design-0-profiles"></a>
### 표면 → 디자인 프로필 (ADR-073 D3)
<!-- 단일 표면이면 1행. 웹+앱이면 표면마다 1행. 공유 모드는 /bootstrap-design R1에서 사용자가 고른다(user-choice).
     프로필별 차이는 §2~§10 안 `### profile: <name>` 하위 블록에 delta만 적는다. 하위 블록이 없는 절은 전 프로필 공통.
     기준 뷰포트는 design gate 매니페스트·승인 스냅샷·stabilize §3-V가 그대로 쓴다(ADR-072). -->
| surface | profile | platform | 기준 뷰포트 | 공유 모드 |
|---|---|---|---|---|
| (예: customer) | (예: consumer-mobile) | (예: native/android, native/ios) | (예: 390×844, 360×800) | (예: 공통+delta) |
| (예: admin) | (예: admin-web) | web | 1280×900, 375×812 | 공통+delta |

## 1. Overview
<!-- 디자인 원칙 3~5개 (actionable verb. "modern/clean/sleek" 같은 모호어 금지).
     + 긍정적 정체성 (ADR-073 D2 — 금지 목록(§9)만으론 '안 촌스러움'까지, 개성·세련은 여기서):
       - design thesis: 이 제품 디자인이 뭘 지향하는가 한 문장 (actionable — 공허한 미사여구 금지).
       - signature mechanism 1개: 이 제품만의 시각/인터랙션 특징 (예: "모든 액션은 커맨드바 한 곳에서"). primary task 이해를 더 빨리 돕지 못하면 두지 않는다(장식이면 제거).
       - imagery/icon 방향: 사진/일러스트/아이콘 스타일 (해당 없으면 "N/A").
       - contextual density: 대시보드=조밀 / 마케팅=여유 등 강도 1줄.
     + [디자인 리서치](DESIGN_RESEARCH.md) 링크 + what-to-borrow/avoid 1~2줄 (ADR-058).
     + `선택 concept: <X>(+하이브리드 메모)` 한 줄 (ADR-058 — /bootstrap-design R2 선택 결과).
     + §9 **시각 스타일** 금칙 예외 채택 시 근거 1줄 — (a) 브랜드 근거 또는 (b) 플랫폼 관례(예: iOS 26 Liquid Glass). `[접근성 — WCAG 2.2]` 블록은 예외 대상이 아니다 (ADR-073 D5). -->

<a id="design-2-colors"></a>
## 2. Colors
<!-- 3-tier 토큰 (DTCG): primitive(blue-100..900) → semantic(color/text/primary) → component(button/bg/primary) -->

<a id="design-3-typography"></a>
## 3. Typography
<!-- 1~2 family, 4~5 size scale, modular ratio (1.125/1.25/1.333), weight pair.
     + Data-table 계약: 표·정렬 숫자 열은 tabular figures(`font-variant-numeric: tabular-nums`).
     + 폰트 결정 블록 (ADR-073 D4 — 아래 항목을 전부 채운다. 해당 없으면 "(해당 없음)" 명시):
       - 조합: display / body / mono
       - fallback stack
       - 라이선스: <라이선스명> — 사용자 확인 <YYYY-MM-DD>
       - 전달 방식: self-host | CDN | 앱 번들
       - weight 세트
       - CJK: 행간·자간·한글/한자/가나 혼용 규칙
       - 숫자 정렬: tabular-nums 적용 범위
       - 로딩: font-display·preload / 앱은 번들 크기
       - 모바일 번들 상한
     결정은 실제 서비스 문장을 R6 테마 쇼케이스로 렌더해 본 뒤 내린다(ADR-058#amend-4). 조합은 user-choice. -->

## 4. Layout
<!-- 4 또는 8 단위 base spacing, t-shirt scale 또는 numeric.
     + 반응형 = invariant 소유 (ADR-073 D2 — 임의 breakpoint 숫자 목록 강제 아님):
       content order(작은 화면에서도 읽기 순서 보존) / container transition(고정폭→유동) / table strategy(가로 스크롤은 표 자체 영역만, page 넘침 금지) / sticky occlusion(고정 요소가 콘텐츠 가림 방지) / 320 CSS px reflow(가로 스크롤·클리핑 없음) / text fit(말줄임보다 줄바꿈 우선) / essential-2D exception(표·캔버스 등 본질적 2차원은 contained region만 스크롤 + 그 region은 keyboard focus/name 보유). -->

## 5. Elevation & Depth
<!-- shadow scale + radius scale -->

## 6. Shapes
<!-- 컴포넌트 모서리 / 컨테이너 형태 -->

<a id="design-7-components"></a>
## 7. Components
<!-- primitives (Button/Input/Text/Icon), composites (Card/Modal/Toast), patterns (Form/EmptyState/ErrorState/LoadingState).
     상태 = category 계약 (ADR-073 D2 — 전 컴포넌트 8상태 강제 대체):
     - interactive primitive (Button/Input 등): default / hover / active / focus-visible / disabled (비동기 동작이면 loading 추가).
     - data composite / screen (Card·리스트·화면): default / loading / empty / error / success.
     - static primitive (Text/Icon 등): 상태 매트릭스 없음.
     - 역할별 semantic 상태(해당 컴포넌트에 한): checkbox/radio=checked·indeterminate, tab/segmented=selected, disclosure/accordion=expanded, input=invalid·read-only 등 — 역할이 요구하는 상태를 위 category 위에 추가.
     N/A는 category상 expected 상태를 *의도적으로* 뺄 때만 명시. -->

<a id="design-8-motion"></a>
## 8. Motion
<!-- (보일러플레이트 확장 섹션 — Stitch 공식 canonical 8섹션 외. 근거: Material 3 motion / a11y. ADR-073 D2)
     semantic motion contract (ADR-073 D2 — 5항목):
     - 목적: 각 모션이 feedback / continuity / orientation / state-change 중 무엇을 전달하는가 (장식 목적 금지).
     - 빈도: 반복 흐름일수록 motion budget↓ (자주 보는 전환은 짧고 절제).
     - 실행: duration·easing은 project token으로 (interruptible, layout shift 없음).
     - 접근성: `prefers-reduced-motion`에서 정보손실 없는 대체 상태 제공.
     - 금지: decorative infinite/repeated 모션.
     수치는 project token의 *시작 default*로만 (보편 법칙 아님): 버튼 100~160ms / 라우팅 UI 160~240ms / entrance·exit 240~360ms (Material 3 참고). -->

<a id="design-9-donts"></a>
## 9. Do's and Don'ts
<!-- explicit prohibition (LLM 정확도 단일 최대 기여 — ADR-073 D5):
     [기존 규율]
     - 색 5색 이내 / raw hex 금지
     - Inter·Roboto·Arial 디폴트 금지
     - 3-column icon grid 디폴트 금지
     - hierarchy는 size+weight+color 중 2축 이상
     [접근성 — WCAG 2.2, ADR-073 D5]
     - 대비: 정상 텍스트 4.5:1 / 큰 텍스트(굵은 18.66px+ 또는 24px+) 3:1 / 비텍스트 UI·아이콘·상태 경계 3:1
     - 포커스 링 제거(`outline:none`만) 금지 — 대체 visible focus 필수
     - 키보드: 모든 인터랙션은 키보드로 도달·조작 가능
     - 아이콘 버튼: accessible name 확보 — 브라우저 computed name(aria-label·aria-labelledby·감싼 visible text·alt·title 등 *어느 출처든*; aria-label 강제 아님). 정밀 판정은 실화면 axe(`validate:design` v3 — ADR-072 D6)
     - 색-단독 금지: 상태·의미를 색으로만 표시 금지(아이콘·텍스트·패턴 병행)
     - 한 화면 primary CTA 2개 이상 금지
     - 모든 motion에 `prefers-reduced-motion` 분기
     - 모든 컴포넌트에 ## 7 의 category별 expected 상태 정의 (interactive/data/static — 특히 empty/loading/error/success 누락 빈번)
     [anti-slop 추가 — Impeccable 37패턴에서 흡수, ADR-073 D5]
     - 보라/violet gradient·cyan-on-dark 디폴트 금지 (가장 흔한 AI 슬롭 시그니처)
     - 카드 안의 카드(nested cards) 금지 — 중첩 대신 spacing·divider로 구분
     - heading에 gradient text 금지
     - glassmorphism·neon glow 디폴트 금지 (## 1 Overview에 근거를 적을 때만 — (a) 브랜드 근거 또는 (b) 플랫폼 관례(예: iOS 26 Liquid Glass 머티리얼) — ADR-073 D5)
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
<!-- UX writing 규칙서 v2 (ADR-073 D6). 언어별 하위 블록 + 용어 사전 + 검토 렌즈.
     기본값은 /bootstrap-design R1에서 "채택 or 변경" 1회 확인 후 확정. 비-UI 프로젝트는 본 파일 삭제 시 함께 삭제.
     카피 검토 시점: /design-milestone R3 브리프 — 사용자 승인 전 reviewer [Design-voice] (ADR-072). -->

### 용어 사전 (서비스 전체 일관성)
<!-- 같은 행동은 같은 동사, 같은 상태는 같은 표현, 같은 대상은 같은 명사. 프로젝트가 채운다. -->
| 대상 | 한국어 | English | 금지 동의어 |
|---|---|---|---|
| (예: 저장 동작) | 저장 | Save | 보관·기록 |

### 한국어
- 어조: 해요체 (예: "저장했어요"). 명령형 CTA (예: "시작하기", "저장"). 과도한 사과·의인화 금지.
- 내부용어 → 사용자 언어 번역표: (§10 용어 사전과 별개 — 코드·DB 용어를 화면에 노출하지 않는다)
  | 내부 용어 | 사용자 표면 문구 |
  |---|---|
  | (예: workspace_member) | (예: 멤버) |
- 금지 표현
  - [grep 가능] placeholder 카피: `lorem ipsum`, `TODO copy`, `sample text`, `여기에 텍스트`
  - [grep 가능] (프로젝트별 정규식 — 예: 해요체 프로젝트에서 합쇼체 어미 `습니다\.` 혼입)
  - [LLM-판정] 책임 회피 문구("문제가 발생했습니다"만 있고 원인·다음 행동 없음), 내부 에러코드 노출, 과도한 감탄사
- 표면별 예시 카피: 버튼(동사 우선, 2~4어절) / 에러(원인 1줄 + 다음 행동 1줄) / 빈 상태(상황 + 첫 행동) / 확인 다이얼로그(결과 + 되돌림 가능 여부)
- 검토 렌즈 — 토스 UX writing 8원칙 체크 질문(각 카피가 통과하는가): ① 예상 가능한 힌트를 주는가 ② 잡초(불필요한 말)를 뺐는가 ③ 빈 문장이 없는가 ④ 핵심 메시지 하나에 집중하는가 ⑤ 말하듯 쉬운가 ⑥ 강요 대신 제안인가 ⑦ 보편적인 단어인가 ⑧ 숨은 감정을 다뤘는가
- 검토 렌즈 — Humanize KR(im-not-ai v2.3.2) A~J 범주는 **AI 문체 탐지 렌즈로만** 쓴다 — A 번역투 / B 영어 인용·용어 과다 / C 구조적 AI 패턴 / D AI 특유 관용구 / E 리듬 균일성 / F 수식·중복 / G Hedging 남용 / H 접속사 남발 / I 형식명사 과다 / J 시각 장식 남용. 변경률 임계값·자동 치환은 UI 문구에 적용하지 않는다.

### English (해당 시)
- Tone: sentence case, active voice, imperative CTAs, plain language, expand acronyms on first use.
- Term table / forbidden patterns / examples: (한국어 블록과 같은 4항목을 영어로)
- Review lens: one idea per sentence, no filler, say what happened and what to do next.

<!-- 추가 언어는 위 형식으로 `### <언어>` 블록을 더한다. 프로필별 delta가 필요하면 블록 안에 `#### profile: <name>`. -->

<a id="design-11-sources"></a>
## 11. 기준 자료 (ADR-073 D7)
<!-- 확인한 자료·확인일·버전·적용 변경점만 적는다("최신 갱신" 같은 포괄 문구 금지). 확인일 12개월 초과 시 /bootstrap-design --update·/design-milestone R0가 재확인을 권장한다. -->
| 자료 | 확인일 | 확인한 버전·일자 | 적용 변경점 |
|---|---|---|---|
| Google design.md spec (Stitch canonical) | 2026-09-11 | alpha (`docs/spec.md`) | 섹션 순서·lint |
| W3C DTCG | 2026-09-11 | 2025.10 stable (2025-10-28) | 3-tier 토큰 |
| Material 3 Expressive | 2026-09-11 | 최초 공개 2025-05-13 · I/O 2026 업데이트 세션 존재 | 모션·형태 시작 default |
| Apple HIG (Liquid Glass) | 2026-09-11 | iOS 26 | §9 플랫폼 관례 예외 근거 |
| WCAG | 2026-09-11 | 2.2 (3.0 draft) | §9 a11y |
| Toss UX writing 8원칙 | 2026-09-11 | 2022-11-15 | §10 한국어 렌즈 |
| Humanize KR (im-not-ai) | 2026-09-11 | v2.3.2 (2026-08) | §10 A~J 렌즈 |
