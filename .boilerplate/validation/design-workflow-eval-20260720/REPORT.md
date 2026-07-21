# 디자인 워크플로우 재검증 보고서

> 일자: 2026-07-20  
> 범위: `IMPROVEMENT_BACKLOG2.md`의 실제 상태, 현재 보일러플레이트 디자인 흐름, DS-1~DS-7의 실험적 재검증  
> 상태: 검증 기록. 정책 SSOT가 아니며, 이 보고서 작성 과정에서 ADR/skill/template은 수정하지 않았다.  
> 금지 범위: 요청에 따라 `IMPROVEMENT_BACKLOG.md`는 읽지 않았다.

## 0. 결론

`IMPROVEMENT_BACKLOG2.md`를 그대로 구현하면 안 된다. 상단의 3차 정정은 여러 사실 오류를 바로잡았지만, 본문과 최종 표에는 정정 전 결론이 그대로 남아 문서 내부에서 서로 충돌한다. 이 파일은 현재 git untracked 세션 메모이므로, "결정 완료"나 "정책 반영 완료" 상태도 아니다.

디자인 성능에 관한 가장 강한 결론은 다음과 같다.

1. 레퍼런스 규칙을 많이 추가한 B1/B2는 현재 방식 B0보다 평균 시각 점수가 높지 않았다.
2. B1/B2의 레퍼런스 문맥은 B0보다 68~76% 길었지만, 합산 시각 점수는 각각 0.72점, 1.19점 낮았다.
3. 어떤 리서치 방식도 접근성 결함을 예방하지 못했다. 최초 24개 시안 중 12개에 serious `axe` 위반이 있었다.
4. 개선된 B3도 생성 직후에는 8개 중 5개가 serious 위반이었다. 그러나 실제 selector를 되먹인 1회 수정 후 8/8이 1280/375 렌더, 320 리플로우, serious/critical `axe` 게이트를 모두 통과했다.
5. 새 블라인드 홀드아웃에서 B3 최고안은 OpsRelay 전체 1위와 0.5/50 차이였고, Stillroom에서는 자동 게이트를 통과한 최고점이었다.

따라서 현재 증거상 최적안은 **얇고 적응적인 증거 수집 + 과업에 기여하는 두 시안 + 독립 렌더/DOM 수용 게이트**다. B3의 프롬프트가 미적 품질을 보장한 것이 아니라, 경쟁력 있는 시각 품질을 유지하면서 결함을 실제로 제거하는 폐쇄 루프가 성능을 만들었다.

정책화 우선순위도 바꿔야 한다. BACKLOG2의 DS-1 우선이 아니라, 먼저 DS-2/DS-3/DS-7의 수용 게이트를 닫고 그 위에 DS-1/DS-5의 얇은 리서치와 정체성 계약을 얹는 편이 근거가 강하다.

## 1. 실제 저장소 상태

| 표면 | 현재 확인된 상태 | 의미 |
|---|---|---|
| `IMPROVEMENT_BACKLOG2.md` | `git status`상 untracked | 검토 메모이지 정책 SSOT나 구현 완료 기록이 아님 |
| `docs/20-system/DESIGN.md` | `draft` placeholder | baseline에서 정상이나, 제안된 identity/a11y/state 계약은 아직 없음 |
| `DESIGN_RESEARCH.md` | 없음 | UI 프로젝트에서 `/bootstrap-design`을 아직 수행하지 않은 baseline 상태 |
| R0 | 사용자 URL 우선, 1~3개, 토큰 추출 중심 | 자율적인 task/flow/visual reference discovery는 없음 |
| R2 | 2~3 HTML concept + anti-reference + divergence card | 실제 시안은 만들지만 독립 reviewer는 HTML/픽셀을 보지 않음 |
| R2 reviewer | divergence card와 token summary만 입력 | hierarchy, overflow, 실제 slop, contrast를 판정할 증거가 부족 |
| R6 | 생성자 self-check + 사용자 브라우저 확인 | 생성/감사 분리가 복원되지 않음 |
| reviewer design surface | token/inventory/state/don'ts/voice 5차원 | 별도 a11y 차원 없음 |
| Component state | 모든 컴포넌트에 8상태 강제 | static primitive까지 가짜 N/A 문서를 만들 위험 |
| plan-milestone R5 | 화면 목록, 2~3 구성안, 브라우저 선택, happy/ugly state, 승인 prototype이 이미 있음 | "빌드 전 시안 없음"이라는 DS-3 서술은 과장 |
| Feature §8-1 | primary task, empty/loading/error 복구, accessibility, HEART가 이미 있음 | DS-4의 정확한 결함은 필드 부재가 아니라 cross-screen consumer/enforcement 부재 |
| stack-guard | UI에서 Playwright와 browser를 provision하고 375/768/1440 overflow 및 advisory axe를 scaffold | 새 런타임보다 기존 runner를 concept/preview 단계에 재사용하면 됨 |

직접 근거:

- 현재 R0 위계: [bootstrap-design/SKILL.md](../../../.claude/skills/bootstrap-design/SKILL.md), lines 46-59.
- 현재 R2와 reviewer 입력: 같은 파일 lines 106-132.
- 현재 R3/R4의 고정 color 수와 8상태: 같은 파일 lines 137-148.
- 현재 R6 self-check: 같은 파일 lines 172-196.
- reviewer 5차원: [reviewer.md](../../../.claude/agents/reviewer.md), lines 109-125.
- 기존 milestone prototype 라운드: [plan-milestone/SKILL.md](../../../.claude/skills/plan-milestone/SKILL.md), lines 81-95.
- 기존 UX 필드: [FEATURE_TEMPLATE.md](../../../docs/30-workitems/_templates/FEATURE_TEMPLATE.md), lines 57-63.

추가로 현재 계약에는 내부 모순이 있다. R3는 12~16 hex를 요구하지만 DESIGN §9는 raw hex 금지를 일반문으로 적고, plan-milestone만 `:root` 선언은 예외라고 명시한다. 최종 규칙은 **canonical primitive token 선언에서 literal 허용, semantic/component 사용처와 코드/AC에서는 token만 허용**으로 한 번만 정의해야 한다. `색 5색 이내`도 필수 semantic status 색과 충돌하므로 숫자 제한 대신 각 색의 역할과 대비를 검사하는 편이 낫다.

## 2. BACKLOG2 무결성 판정

[IMPROVEMENT_BACKLOG2.md](../../../IMPROVEMENT_BACKLOG2.md)의 상단 정정 블록은 유용하지만, "상단이 본문보다 우선"이라는 구조 자체가 SSOT 문서로는 실패다. 네 번째 정정 블록을 더하지 말고 본문을 현재 판정으로 직접 고쳐야 한다.

| 충돌 | 상단의 현재 판정 | 남아 있는 낡은 본문 | 필요한 정리 |
|---|---|---|---|
| ANTI-POLE | unresolved tension일 때 조건부 | lines 171, 175, 179에서 필수 | 필수 축/쿼터 삭제 |
| 실험 강도 | 탐색적 pilot, hard 상수 금지 | lines 184, 188-189, 513에서 구조적 보장/검증 통과 | directional evidence로 낮춤 |
| ADR-049 | 사용자 우선 위계를 뒤집으므로 신규 superseding ADR | 최종 표는 ADR-049 재정렬 | 신규 Design Workflow ADR로 통일 |
| ADR-027 | amendment 6개라 다음 변경은 consolidated reissue | DS-5/DS-7 본문은 amendment 제안 | 통합 재발행으로 통일 |
| 접근성 | 일부 reduced-motion/state 흔적은 있음 | "아예 없음" | visible focus, contrast, keyboard, name, ARIA, color-independent state가 정확한 gap |
| DS-2 강도 | populated DOM 검사가 필요 | line 215는 정밀 대비를 advisory로 낮춤 | 계산은 LLM이 아니라 axe/browser hard gate가 담당 |
| DS-3 | pre-build independent pixel audit가 없음 | "빌드 후에만 잡음" | 기존 R2/R5를 인정하고 누락된 reviewer evidence만 추가 |
| DS-4 | §8-1이 있지만 consumer가 약함 | "주인이 아예 없음" | existing field + state transition map + downstream validator 연결 |
| DS-5 | positive identity 필요 | safe/bold를 보편 축으로 강제 | REFINE/EXPLORE + task-helping signature로 변경 |
| DS-6 | exact 수치는 시작값 | lines 443-451은 ease-in 전면금지, exit 60~70% 유지 | semantic motion contract만 정책화 |
| DS-7 | category state와 reflow invariant | breakpoint token + 전 컴포넌트 N/A 방식 | category별 expected states로 교체 |
| Google lint | alpha 도구, rule set 변동 가능 | line 465는 7개로 고정 | version pin + `spec --rules`, count 문서화 금지 |
| HN 항목 | HN-1/3/5/6의 전제가 상단에서 철회/완화됨 | 우선순위 표와 본문은 과거 프레임 유지 | residual value만 별도 행으로 재작성 |

권장 상태 열은 `관측됨 | 가설 | 실험됨 | 방향 채택 | 정책화됨 | 구현됨`이다. 현재의 "당신의 결정" 한 칸으로는 방향 합의와 실제 정책 반영을 구분할 수 없다.

## 3. 재검증 설계

### 3.1 질문과 조건

[실험 프로토콜](README.md)은 "어떤 R0-R2 흐름이 과도한 비용 없이 가장 쓸 수 있는 디자인 방향을 만드는가"를 비교했다.

| 조건 | 핵심 |
|---|---|
| B0 current | 현재 1~3 reference, token-first, anti-reference, divergence card |
| B1 backlog intent | autonomous A/B/C, broad role lanes, positive identity, safe/signature |
| B2 task-first | task tension, role-specific evidence, coherent primary system, convention-preserving signature |
| B3 adaptive | Stage 1 뒤 만든 post-hoc 조건. B2 evidence를 재사용하고 quota 제거, REFINE/EXPLORE, browser acceptance loop 추가 |

두 개의 성격이 다른 고정 brief를 사용했다.

- OpsRelay: 고밀도 incident command 화면. owner 미확정, state transition, stakeholder update, stale telemetry가 핵심이다.
- Stillroom Coffee: 소비자 구독 구성 화면. taste, amount, cadence, recurring price, first date가 핵심이다.

B0/B1/B2는 각 brief당 2안, generator 2회로 총 24안을 만들었다. B3는 별도로 8안을 만들었다. 모든 시안은 standalone HTML/CSS와 실제 brief copy를 사용했다.

### 3.2 평가

- 시각: 1280x900과 375x812 full-page screenshot.
- 리플로우: 320 CSS px에서 page overflow, viewport escape, clipped text 검사.
- DOM: populated 화면에 `@axe-core/playwright` 적용.
- 블라인드: condition을 숨긴 fresh evaluator 2명.
- 시각 차원: task clarity 2, hierarchy 1.5, coherence 1.5, domain identity 1.5, realism/state 1, mobile 1.5, visible affordance 1. 총 50점.
- 결함 fixture: source slop, low contrast, mobile overlap, horizontal overflow, localized clipping, clean control.

프로덕션 skill에 이 50점 rubric을 그대로 넣을 필요는 없다. 점수는 실험 비교용이며, 실제 흐름은 독립 reviewer의 finding과 사용자 취향 선택이면 충분하다.

### 3.3 한계

- 같은 모델 계열이며 실제 사용자 task completion을 측정하지 않았다.
- archetype은 2개뿐이고 static prototype이라 keyboard, screen reader, 동적 async state를 완전히 검증하지 못한다.
- reference shortlist와 generation의 완전한 격리는 아니며, B3는 Stage 1 결과를 보고 만든 post-hoc 조건이다.
- reference pack 단어 수와 HTML byte는 비용 proxy이지 실제 token/time 청구량이 아니다.
- 홀드아웃 incumbent는 Stage 1 최고안을 미리 선별했지만 B3는 8개 전량을 넣었다. B3 평균에 불리한 비교다.
- 작은 시각 점수 차이는 일반화하면 안 된다. evaluator 상관은 Stage 1 `r=0.526`, holdout `r=0.571`이었다.

## 4. Stage 1 결과

### 4.1 품질, 비용, 수용률

| 조건 | Reference words | B0 대비 | HTML 평균 | Blind 평균 /50 | serious concept | 320 failure | 완전 통과 |
|---|---:|---:|---:|---:|---:|---:|---:|
| B0 | 369 | baseline | 9,411 B | **45.594** | 5/8 | 0/8 | 3/8 |
| B1 | 650 | +76% | 12,458 B | 44.875 | 4/8 | 2/8 | 3/8 |
| B2 | 620 | +68% | 13,357 B | 44.406 | 3/8 | 0/8 | **5/8** |

B0는 raw visual/cost 효율에서 승자였다. B0와 B1/B2의 차이는 5% 이내이고, 더 긴 문맥은 품질 향상으로 이어지지 않았다. H0는 raw 효율 기준으로 유지한다.

그러나 B0를 그대로 배포 기본값으로 유지할 수는 없다. B0의 coffee 시안은 두 generator 반복 모두 serious-free 선택지가 없었다. B1도 repeat 2에서 두 제품 모두 완전 통과안이 없었다. B2만 각 반복에서 두 제품에 최소 한 개의 완전 통과안을 냈다.

### 4.2 제품별 차이

| 제품 | B0 | B1 | B2 | 판정 |
|---|---:|---:|---:|---|
| OpsRelay | 44.375 | 43.250 | **46.000** | task-first evidence가 도움 됨 |
| Stillroom | **46.813** | 46.500 | 42.813 | task-first 규칙이 오히려 무거워짐 |

B2는 high-stakes stateful ops에서는 이겼지만, 짧은 consumer choice에서는 크게 졌다. 따라서 task evidence를 모든 프로젝트에 같은 양으로 강제하면 안 된다. 프로젝트의 낯섦, 실패 비용, state complexity에 따라 깊이를 조절해야 한다.

### 4.3 Reference 실험의 실제 관찰

- B0의 generic query는 junk만 만든 것이 아니다. WatchHouse, Sunday Coffee, Shopware Meteor처럼 쓸 수 있는 lead도 나왔다.
- B1의 고정 lane은 Ops에 Oracle trade PDF와 award yearbook을 끌어와 task relevance를 낮췄다.
- B2는 incident lifecycle, Grafana pattern, Baymard, Onyx처럼 정확한 task evidence를 확보했다.
- global quality tier는 잘못된 모델이다. token package는 implementation 근거로 강하지만 task UX나 brand identity의 상위 소스는 아니다.
- broad gallery, Dribbble, Behance를 authoritative evidence로 쓰면 안 되지만 discovery lead로 blanket 금지할 이유도 없다. canonical/live/code 검증으로 승격 여부를 판정하면 된다.
- exact token source가 있어도 contrast 결함은 발생했다. groundability는 accessibility나 coherent composition의 대체 지표가 아니다.

### 4.4 자동화와 픽셀 검토는 서로 대체할 수 없음

최초 24개 중 12개에 serious/critical 결함이 있었다. 주요 실패는 작은 coral/gray text의 3.3~4.49:1 대비와 ARIA misuse였다.

두 번째 블라인드 evaluator는 screenshot만 보고 serious 결함을 하나도 확정하지 못했다. 첫 evaluator의 visible-a11y 평균도 axe-clean 4.25, axe-serious 4.33으로 역전됐다. 즉 사람이 보기 좋은 작은 회색 글자는 실제 대비 실패를 숨길 수 있다.

반대로 source-slop fixture는 deterministic layout과 axe가 모두 clean이었다. hierarchy, decorative rail, nested card, visual density는 screenshot reviewer가 봐야 한다.

375px도 충분하지 않았다. `r2-b1/ops-b`는 375에서는 통과했지만 320에서 horizontal overflow/escape가 추가로 검출됐다. 권장 조합은 다음과 같다.

| 실패 종류 | 필요한 검사 |
|---|---|
| source rule, token misuse, forbidden pattern | HTML/source read |
| hierarchy, density, domain fit, decorative signature | screenshot reviewer |
| contrast, ARIA, accessible-name 일부 | populated DOM axe |
| page reflow, escape, clipping | browser geometry at 320/375/desktop |
| focus order, keyboard trap, overlay close, color-independent meaning | manual keyboard/interaction smoke |
| 취향과 brand direction | 사용자 선택 |

## 5. Stage 2: B3 adaptive holdout

[B3 method](reference-packs/b3-adaptive-method.md)은 B2 evidence를 재사용하되 강제 lane과 장식적 signature를 제거했다. concept A는 convention-led `REFINE`, B는 task-helping signature를 쓰는 `EXPLORE`로 만들었다.

### 5.1 생성 직후와 수정 후

| 상태 | serious concept | contrast nodes | 기타 | 320 reflow |
|---|---:|---:|---|---:|
| Preflight | 5/8 | 13 | mobile scrollable-region 1, 375 escape 1 | 8/8 pass |
| Selector 기반 1회 repair 후 | **0/8** | **0** | overflow/escape/clipping 0 | **8/8 pass** |

수정은 color token 5개와 mobile state row wrapping에 한정됐다. identity나 layout을 다시 설계하지 않았다. 원본은 `preflight/`, 전후 수치는 [preflight metrics](metrics-stage2-preflight.json)와 [final metrics](metrics-stage2-final.json)에 보존했다.

이 결과의 정확한 해석은 "좋은 prompt가 접근성을 예방한다"가 아니다. B3도 최초 통과율은 3/8로 B0/B1과 같았다. **실제 selector를 반환하고 재실행하는 acceptance loop가 3/8을 8/8로 바꿨다.**

### 5.2 Fresh blind holdout

[홀드아웃 결과](holdout/RESULTS.md)는 B3 8개 전량과 B0/B1/B2의 제품별 Stage 1 최고안 6개를 opaque ID로 섞었다.

| 비교 | 결과 |
|---|---|
| B3 전량 평균 | 44.875/50 |
| 미리 선별된 incumbent 평균 | 46.000/50 |
| Ops 최고 B3 | 47.00, 전체 1위 B2의 47.50과 0.5 차이 |
| Coffee 최고 B3 | 48.75, raw 공동 2위 |
| Coffee incumbent acceptance | B0/B1/B2 최고안 3개 모두 serious axe로 fail |
| Holdout evaluator 상관 | `r=0.571` |

B3는 미적 평균에서 압승하지 않았다. 그러나 incumbent는 이미 최고안만 골랐고 B3는 모든 안을 포함했다. 이 보수적 조건에서도 두 제품 모두 상위권 안을 제공했고 B3 8개는 전부 배포 후보 기준을 통과했다. 따라서 B3는 **미적 우월성**이 아니라 **상위권 시각 품질과 수용 신뢰도의 결합**에서 가장 좋은 실측 결과다.

## 6. 가설 판정

| 가설 | 판정 | 근거 |
|---|---|---|
| H0 current가 충분 | 부분 유지 | raw visual/cost는 B0 승리. 단 acceptance gate 없이 current 유지 불가 |
| H1 broad lanes + identity가 향상 | 기각 | B1 aggregate 개선 없음, context +76%, forced lane의 relevance 저하 |
| H2 task-first가 최적 default | 조건부 | Ops 승리, Coffee 패배. state complexity에 따라 적응 필요 |
| H3 HTML-read만으로 부족 | 강하게 지지 | screenshot, axe, 320 geometry가 서로 다른 결함 검출 |
| H4 signature는 convention 보존 시 유효 | 조건부 지지 | rail/route 장식은 coherence를 해쳤고 task-helping signature는 상위권 가능 |
| H5 Google example은 format-only | 실험 미조작 | 공식 예시 분석은 지지하지만 포함/미포함 A/B는 하지 않음 |

## 7. DS-1~DS-7 최종 권고

| ID | 판정 | 그대로 두지 말아야 할 부분 | 최종 형태 |
|---|---|---|---|
| DS-1 | 수정 채택 | 5축 최소, mandatory anti-pole, award/token quota, global tier, Radix universal bridge | evidence-on-demand, role-specific verification, stop rule, final 3~5 max |
| DS-2 | 강하게 채택 | §9 문구만 추가하거나 contrast를 advisory로 처리 | reviewer a11y + populated axe hard gate + manual keyboard/focus |
| DS-3 | 수정 채택 | conditional trigger만으로 render를 생략, 375/1280만 사용 | full R2/R6 always render, 320 automated reflow, R5 selected prototype만 독립 검토 |
| DS-4 | 수정 채택 | 새 UX 문서/에이전트, "owner 없음" 프레임 | 기존 R5-1/Feature §8-1에 state transition map과 consumer 추가 |
| DS-5 | 조건부 채택 | safe/bold와 mandatory decorative signature | REFINE/EXPLORE, signature가 primary task를 설명할 때만 |
| DS-6 | 의미 중심 채택 | ease-in 전면금지, exit 60~70% 같은 보편 상수 | purpose, frequency, interruptibility, no layout shift, reduced-motion; 숫자는 project token 시작값 |
| DS-7 | 선별 채택 | arbitrary breakpoint quota, 전 컴포넌트 8상태 N/A, Google lint hard gate | category state, responsive invariant, provenance, coherence, tabular figures |

### DS-1: 권장 reference 알고리즘

1. 먼저 primary task, 결정 순간, failure/recovery, identity tension을 적는다.
2. 사용자가 준 reference는 high-priority hint로 사용한다. 사용자 입력이 없어도 자율 조사하고, 부족한 evidence role만 채운다.
3. role은 `task/behavior`, `identity/craft`, `implementation system` 세 가지로 제한한다. counter-reference는 unresolved tension이나 실제 monoculture가 있을 때만 추가한다.
4. broad search/gallery/community는 이름을 찾는 lead로 허용한다. 최종 근거는 canonical product, official behavior doc, live screenshot, source/token code로 검증한다.
5. visual claim은 실제 화면/screenshot을 봤을 때만 기록하고, behavior claim은 docs/interaction을 봤을 때만 기록한다. "official"은 provenance이지 품질 점수가 아니다.
6. 고정 최소 개수 대신 evidence coverage가 차면 멈춘다. 최종 designer 입력은 보통 3~5개 이하이며, 단순 내부 도구는 더 적어도 된다.
7. 한 concept 안에서는 coherent primary system 하나를 쓴다. 명시된 gap이 있을 때만 secondary primitive를 추가한다.

최소 `DESIGN_RESEARCH.md` schema:

```text
source/canonical | role | exact decision supported |
verification(visual/behavior/code) | observed date |
borrow | avoid | confidence/caveat
```

quality tier, cluster quota, groundable count 같은 실험용 label은 정책 필드로 만들지 않는다. 기록 비용이 실제 결정 품질보다 커진다.

### DS-2/DS-3: 권장 수용 게이트

- R2 full mode: 각 concept을 1280 desktop과 375 mobile에서 렌더한다. desktop 폭은 프로젝트 target이 명시되면 그 값으로 바꿀 수 있다.
- 모든 R2/R6: 320 CSS px deterministic reflow를 실행한다. 본질적으로 2차원인 table/canvas는 page 전체가 아니라 명시적 contained region만 scroll 가능하고, 해당 region은 keyboard focus/name을 가져야 한다.
- 모든 R2/R6: real copy와 representative populated data에서 axe를 실행한다.
- block: serious/critical axe, page overflow, viewport escape, clipped primary-task text, incoherent critical overlap.
- report: moderate/minor axe와 visual taste finding.
- manual: primary task의 Tab 순서, visible focus, trap 없음, Escape close, color 외 상태 표식.
- repair: selector와 failure summary를 designer에게 반환한 뒤 재실행한다. 여전히 fail이면 승인하지 않고 brief/source를 재검토한다.
- `--fast`: research/divergence/screenshot reviewer는 명시적으로 생략할 수 있지만, browser가 provision된 UI라면 cheap deterministic axe/reflow는 유지하는 편이 안전하다.

두 LLM reviewer를 매 프로젝트에 두는 것은 과하다. 이번 실험의 2명은 평가 노이즈를 측정하기 위한 것이고, 프로덕션 기본은 생성자와 분리된 reviewer 1명 + 사용자 취향 선택이면 충분하다.

### DS-4: 화면 사이 UX

별도 UX SSOT를 만들지 말고 plan-milestone R5-1 안에 다음 표를 둔다.

```text
현재 화면/상태 | 사용자 행동 | 다음 화면/상태 | 실패/복구 | owner feature/prototype
```

`plan-workitem`은 해당 feature의 행을 task/AC로 회수하고, `validate-plan`은 primary path와 recovery path가 prototype 및 AC에 존재하는지 검사해야 한다. consumer가 없으면 다시 dead field가 된다.

### DS-5: 긍정적 정체성

`safe/bold`는 novelty를 목표로 오해하기 쉽다. 두 기본안은 다음처럼 정의한다.

- `REFINE`: 익숙한 task convention을 우선하고 restrained signature를 둔다.
- `EXPLORE`: signature-led이지만 동일한 익숙한 control/flow를 보존한다.
- 세 번째 안: 아직 풀리지 않은 명시적 tension이 있을 때만 만든다.

각 시안 카드는 `task hypothesis | preserved convention | visible signature | failure sign`을 적는다. signature가 primary task를 더 빠르게 이해시키지 못하면 장식이므로 제거한다.

### DS-6: 모션

정책에는 다음만 둔다.

- 목적: feedback, continuity, orientation, state change 중 무엇을 설명하는가.
- 빈도: 반복 사용 흐름일수록 motion budget을 줄인다.
- 실행: project duration/easing token, interruptible, layout shift 없음.
- 접근성: reduced-motion에서 정보 손실 없는 대체 상태.
- 반복: decorative infinite/repeated motion 금지.

100~300ms 범위와 easing 값은 시작 default일 뿐 universal law가 아니다. `tabular-nums`는 motion이 아니라 Typography/Data table 계약으로 이동한다.

### DS-7: 상태와 반응형

두 brief의 대표 inventory에서 현재 8상태 강제는 136개 planning entry를 만들었다. category contract는 74개로 46% 줄이면서 빠져 있던 success state를 추가했다. [상태 simulation](microtests/ds7-state-matrix-simulation.md)을 참고한다.

| category | expected states |
|---|---|
| interactive primitive | default, hover, active, focus-visible, disabled; async면 loading |
| data composite/screen | default, loading, empty, error, success |
| static primitive | state matrix 없음 |

N/A 사유는 category상 expected state를 의도적으로 빼는 경우에만 쓴다. 존재하지 않는 8칸을 모두 채우는 paperwork는 만들지 않는다.

responsive 계약은 breakpoint 숫자 목록보다 다음 invariant를 소유해야 한다: content order, container transition, table strategy, sticky control occlusion, 320 reflow, text fit, essential 2D exception.

## 8. 권장 최종 R0-R6 흐름

1. **R0 intent**: primary task, decision, recovery, state complexity, visual identity tension을 확정한다.
2. **R0 evidence needs**: 필요한 role만 표시한다. 사용자 reference는 우선 힌트이고 prerequisite가 아니다.
3. **R0 discovery**: lead를 찾고 canonical visual/behavior/code 근거로 승격한다. quota가 아니라 coverage로 멈춘다.
4. **R0 record**: 최소 schema로 `DESIGN_RESEARCH.md`에 기록하고 designer 입력을 3~5개 이하로 압축한다.
5. **R1 contract**: actionable principle, thesis, task-helping signature, preserved convention, imagery 또는 N/A, contextual density를 정한다.
6. **R2 authoring**: 같은 실제 데이터로 REFINE/EXPLORE 두 안을 만든다.
7. **R2 preflight**: source read + 1280/375 screenshot + 320 reflow + populated axe + independent reviewer를 실행한다.
8. **R2 repair/selection**: hard finding을 selector 기반으로 수정하고 재실행한 뒤 사용자가 방향을 선택한다.
9. **R3 tokens**: 선택된 concept에서 coherent primitive/semantic/component token을 파생한다. palette count를 채우지 않는다.
10. **R4 inventory**: category별 expected state만 설계한다.
11. **R5 DESIGN save**: DESIGN.md를 living으로 승격한다. Google format check는 선택적 advisory로만 둔다.
12. **plan-milestone R5**: state transition map을 만들고 기존 prototype 라운드를 수행한다. 선택된 integrated prototype만 독립 렌더 검토한다.
13. **R6 final preview**: DESIGN.md 충실도와 representative states를 같은 acceptance gate로 재검증한다.

Google DESIGN.md example은 R0/R1/R2 creative context에 넣지 않는다. 선택이 끝난 R5에서 section completeness를 검사하는 format fixture로만 사용해야 glassmorphism 예시와 프로젝트 anti-slop이 서로 오염되지 않는다.

## 9. DESIGN.md 목표 계약

기존 0~10 구조를 유지하면서 내용을 다음처럼 바꾸는 것이 가장 작은 변경이다.

| Section | 목표 계약 |
|---|---|
| §1 Overview | thesis, task-helping signature, preserved convention, imagery/icon 또는 N/A, contextual density, research link, selected concept |
| §2 Colors | selected concept의 coherent tokens, semantic pair와 contrast expectation. hard palette count 제거 |
| §3 Typography | family/scale/weight, numeric/data에 tabular figures |
| §4 Layout | spacing과 container/reflow/table/sticky invariants. arbitrary breakpoint quota 없음 |
| §5-6 | 실제로 선택된 depth/shape만 기록 |
| §7 Components | category + expected state, static matrix 제거 |
| §8 Motion | purpose/frequency/interruptibility/no-shift/reduced-motion + project tokens |
| §9 Do/Don'ts | accessible name, contrast, visible focus, keyboard, color-independent state, reduced motion + 짧은 project-specific anti-slop |
| §10 Voice | 기존 계약 유지 |

Google의 공식 철학도 DESIGN.md를 exhaustive implementation spec보다 clear intent와 specific reference를 담는 prose로 본다. 따라서 research evidence 전체를 DESIGN.md에 복제하지 말고 `DESIGN_RESEARCH.md`에 두고 §1은 결정만 요약해야 한다.

## 10. Google DESIGN.md, Stitch, 외부 방식 판정

### Google DESIGN.md CLI

실제 `@google/design.md@0.3.0`으로 검사했다.

- 현재 `DESIGN.md`: YAML frontmatter 없음 warning, errors 0.
- `designmd spec --rules-only --format json`: 9 rules. 문서의 7개 주장은 이미 drift.
- declared token pair 4.48:1 fixture: warning, exit 0.
- implementation HTML/CSS에만 있는 undeclared low contrast fixture: warning 0.

따라서 이 CLI는 format/declared-token 보조 검사이지 browser accessibility gate가 아니다. alpha version을 pin하고 runtime `spec --rules`를 조회해야 하며, rule 개수를 ADR에 쓰지 않는다. YAML token을 body token과 중복 SSOT로 만들 정도의 format migration은 현재 이득이 없다.

### Google examples와 Stitch

- 공식 `atmospheric-glass` example은 glassmorphism, purple/pink gradient, backdrop blur를 사용한다. authoritative format fixture이지 universal visual benchmark가 아니다.
- Stitch에서 가져올 것은 도구 의존이 아니라 workflow다: business objective/feeling/inspiration, diverge/converge canvas, design system 분리, interactive flow 확인.
- Stitch `taste-design` skill의 universal font ban, 모든 multi-column collapse, 큰 radius, 반복 animation 같은 규칙은 이 보일러플레이트에 통째로 들여오면 안 된다.
- Stitch 자체는 optional concept generator로만 허용하고, 결과는 동일한 screenshot/axe/reflow/user gate를 거친다.

### 공식 근거

- [Google design.md philosophy](https://github.com/google-labs-code/design.md/blob/main/PHILOSOPHY.md)
- [Google design.md repository and CLI](https://github.com/google-labs-code/design.md)
- [Official atmospheric-glass example](https://github.com/google-labs-code/design.md/blob/main/examples/atmospheric-glass/DESIGN.md)
- [Google Stitch 2026 workflow](https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-ai-ui-design/)
- [Official Stitch skills](https://github.com/google-labs-code/stitch-skills)
- [Stitch taste-design skill](https://github.com/google-labs-code/stitch-skills/blob/main/plugins/stitch-utilities/skills/taste-design/SKILL.md)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [WCAG non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)
- [axe-core scope and automated coverage](https://github.com/dequelabs/axe-core)
- [Radix Colors scale scope](https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale)
- [Motion reduced-motion guidance](https://motion.dev/docs/react-accessibility)
- [Responsive design basics](https://web.dev/articles/responsive-web-design-basics)

`axe-core` 자체도 자동 검사가 평균적으로 WCAG 문제의 일부만 잡는다고 명시한다. 이 때문에 serious/critical hard gate와 별도로 keyboard, focus, screen reader, dynamic state의 수동 검사가 남는다.

## 11. 거버넌스와 구현 묶음

ADR-045 D6를 따르면 세 묶음이면 충분하다.

1. **신규 Design Workflow ADR**: ADR-049를 supersede. DS-1 reference flow, DS-3 concept/preview acceptance, DS-5 REFINE/EXPLORE를 소유한다.
2. **ADR-027 consolidated reissue**: DESIGN 내용 계약인 identity, accessibility, motion, category state, responsive invariant를 깨끗하게 재발행한다.
3. **ADR-056 focused amendment**: plan-milestone R5 state transition map, selected integrated prototype review, Feature/plan/validator consumer를 연결한다.

주요 수정 surface:

- `.claude/agents/researcher.md`: role-specific discovery와 provenance/verification.
- `.claude/agents/designer.md`: task hypothesis, REFINE/EXPLORE, coherent system.
- `.claude/agents/reviewer.md`: screenshot evidence와 a11y 차원, category state.
- `.claude/skills/bootstrap-design/SKILL.md`: R0-R6 흐름과 acceptance loop.
- `docs/20-system/DESIGN.md`: §1/2/3/4/7/8/9 계약.
- `docs/00-meta/STRUCTURE.md`: conditional `DESIGN_RESEARCH.md` schema/ownership.
- `.claude/skills/plan-milestone/SKILL.md`: R5 transition map과 selected prototype review.
- `FEATURE_TEMPLATE.md`, `plan-workitem`, `validate-plan`: flow-map consumer와 AC 추적.

## 12. 권장 착수 순서

### Phase 0: BACKLOG2 정규화

- 상단 정정과 충돌하는 본문/최종 표를 직접 고친다.
- 각 항목에 evidence level과 implementation status를 분리한다.
- 이 작업이 끝나기 전 BACKLOG2를 정책 근거로 인용하지 않는다.

### Phase 1: 측정 가능한 수용 게이트

- DS-2 reviewer a11y와 populated axe.
- DS-3 R2/R6 render, 320 reflow, independent screenshot review.
- DS-7 category state와 responsive invariant.
- 기존 Playwright/axe wiring을 재사용하고 새 runtime dependency는 만들지 않는다.

### Phase 2: 얇은 synthesis

- DS-1 evidence-on-demand research와 최소 schema.
- DS-5 task-helping identity, REFINE/EXPLORE.
- mandatory axes, tier, quota는 넣지 않는다.

### Phase 3: UX 연결과 polish

- DS-4 state transition map과 downstream consumer.
- DS-6 semantic motion.
- Google lint/Stitch는 optional adapter로 남긴다.

이 순서는 reference 연구를 먼저 키우는 BACKLOG2의 순서와 다르다. 이번 실험에서 reference 강화는 평균 미적 향상을 보이지 않았고, acceptance loop만 실제 defect rate를 5/8 fail에서 0/8 fail로 바꿨기 때문이다.

## 13. 정책화 전 수용 기준

다음 조건을 만족해야 Design Workflow ADR을 `accepted`로 올리는 것이 타당하다.

1. 동일 brief에서 current와 새 흐름을 generator 2회 이상 비교한다.
2. 새 흐름은 각 archetype에서 serious/critical 0, page-level 320 overflow 0, clipped primary text 0인 선택지 1개 이상을 매 반복 제공한다.
3. fresh blind visual 평균 또는 제품별 최고안이 current 대비 5% 이내를 유지한다.
4. reference context와 human/tool time을 기록하고, fixed quota가 없음을 확인한다.
5. `--fast`와 `--update` 경로에서도 silent skip 없이 실행/생략 사유를 남긴다.
6. Claude와 Codex 양쪽에서 persona 축소 경로를 실제로 수행한다.
7. keyboard primary path, visible focus, modal escape, screen reader name, dynamic loading/error/success를 실제 구현 화면에서 검사한다.

B3는 항목 2와 3의 탐색적 증거를 제공했다. 나머지는 아직 미검증이다.

## 14. 남은 실험

- archetype 확대: dense ops, form-heavy SaaS, mobile-first consumer, editorial/content, marketing/landing, accessibility-heavy flow.
- 동일 search 시간/결과 수/token budget으로 B0형 lean discovery와 evidence-on-demand 흐름을 직접 A/B.
- Google example creative context 포함/미포함으로 H5 별도 시험.
- 사용자 5명 안팎의 task completion time, error, backtrack, confidence 수집.
- keyboard, screen reader, forced colors, 200/400% zoom, dynamic state 검사.
- 검색 날짜/locale 반복과 canonical page drift 확인.
- 다른 model family로 generator와 reviewer를 교차해 same-model style bias 확인.
- repair 횟수, false positive, browser 실행 시간, token/tool 비용을 함께 측정.

최종적으로 최적화해야 할 지표는 "레퍼런스 수"나 "독창성 점수" 하나가 아니다. **사용자가 핵심 과업을 성공하는가, 선택 가능한 정체성이 있는가, 수용 게이트를 통과하는가, 그 과정의 비용이 합리적인가**의 네 축이다.

## 15. 검증 산출물

- [프로토콜](README.md)
- [B0/B1/B2 reference packs](reference-packs/)
- [32개 concept HTML](concepts/)
- [렌더/axe/layout 최종 수치](metrics-stage2-final.json)
- [320 reflow 최종 수치](reflow-320-stage2-final.json)
- [serious axe 상세](axe-details-stage2-final.json)
- [B3 원본 preflight 보존](preflight/)
- [Blind evaluation 1](blind-evaluation-1.md)
- [Blind evaluation 2](blind-evaluation-2.md)
- [Fresh holdout evaluation 1](blind-holdout-1.md)
- [Fresh holdout evaluation 2](blind-holdout-2.md)
- [Holdout mapping/result](holdout/)
- [DS-3 결함 fixtures](microtests/ds3/)
- [DS-7 state simulation](microtests/ds7-state-matrix-simulation.md)

