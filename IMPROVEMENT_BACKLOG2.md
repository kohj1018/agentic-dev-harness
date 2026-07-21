# 개선 후보 정리 2 — 저장소를 뜯어보고 + 실측하고 + 외부 사례를 비교해 찾은 것들

이 문서는 **이 저장소(보일러플레이트)를 꼼꼼히 분석하고, 디자인 레퍼런스를 실제로 웹에서 뽑아보고(실측), 유명한 외부 레포 5개를 뜯어본 데서 나온 개선 후보들**을, 처음 보는 사람도 이해할 수 있게 풀어 쓴 것입니다. 쭉 읽으면 각 항목이 무엇이고, 왜 문제이며, 어떻게 고칠 수 있고, 고치면 뭐가 좋고 나쁜지까지 파악해서 "할지 말지"를 직접 결정할 수 있습니다.

> **앞 문서(`IMPROVEMENT_BACKLOG.md`)와 뭐가 다른가**: 그건 앱을 하나 실제로 만들어 본 *실행 실험(dogfood)*에서 나온 문제(INST-1~6)입니다. 이 문서는 코드를 돌린 게 아니라 **틀을 분석하고 + 웹에서 실측하고 + 외부 사례와 비교**해서 나온 개선 후보입니다. 둘은 겹치지 않는 별개의 회차입니다.

> **2차 검토 반영(2026-07-20)**: 이 문서는 *다른 AI의 독립 리뷰*와 교차검증했습니다. 그쪽이 지적한 것 중 **저장소에서 실제로 확인된** 것들을 반영했습니다 — ① 레퍼런스가 "토큰"에만 있고 **다른 DESIGN.md 모범 사례·화면/정보구조 레퍼런스는 안 봄**(DS-1 확장) ② 접근성 미검사에 대한 **dogfood 실측 증거**(3.70:1 대비 실패가 실제로 통과됨 — DS-2) ③ 시안 다양성만으론 부족, **긍정적 정체성(design thesis·signature)**이 필요(DS-5 P1로 승격) ④ **8상태 강제·반응형 미설계** 교정(DS-7) ⑤ Now/Next/Later 로드맵 어휘·"미래 M번호 미발급" 규율(RD-1). 반대로 **과하다고 판단해 반영 안 한 것**도 명시했습니다(variance/motion 다이얼 통째 도입 등 — 각 항목에 표시).

> **⚠️ 3차 검토 재검증 + 정정 (2026-07-20) — 이 블록이 본문과 충돌하면 이 블록이 우선**: 3차 독립 리뷰를 받고 **모든 검증 가능한 주장을 직접 파일 읽기·웹 fetch·git으로 재확인**한 결과, 아래 사실 오류·과장을 정정합니다.
> **[하드 사실 정정]**
> - **HN-1 전제 틀림**: 실제는 `.claude/skills` 21 vs `.agents/skills` **16**(15 아님). 없는 5개(boilerplate-context·bootstrap-design·discover-product·research-pack·review-doc)는 **누락이 아니라 ADR-010#amend-4 결정5가 정한 "의도적 자연어 호출 Codex skill"**이고, roster/wrapper 정합은 **stabilize preflight 7이 이미 기계 점검**함. → HN-1의 "5개 누락 → 조용한 기능 상실" 프레임 폐기. 남는 진짜 가치 = **문서 상대링크 무결성 체커**(문서 이동 시 JIT 경로 깨짐) + 기존 preflight 검사를 repo-local 실행 스크립트로.
> - **HN-5 전제 틀림**: Codex도 **native Memories 있음**(CLI v0.128, `~/.codex/memories/`, 자동 생성, cross-machine sync 없음). "Codex엔 memory 없음"은 거짓. 올바른 원칙 = **도구별 memory(Claude MEMORY.md·Codex memories 둘 다)는 로컬·생성물·비이식·비캐노니컬 → 필수 결정은 checked-in 문서(마일스톤/ADR)에.**
> - **HN-6 대부분 중복**: red-team/적대 검토는 **ADR-053 결정③에 이미 존재**(2번째 architect red-team + parallel-merge 금지). → 반대자 항목 폐기. fixture→HN-2, frontmatter 검사→HN-1로 흡수. 잔존 = index-first recall 1건뿐.
> - **DS-1 "brand-fit↔groundability 구조적 반비례"는 과장**: 반례 **REI Cedar**(cedar.rei.com — 소비자 아웃도어 브랜드 + web/iOS/Android 토큰 + npm)·**Shopware Meteor**(shopware.design — 커머스 브랜드 + 150+ Vue 컴포넌트 + 디자인 토큰). 브랜드+groundable 겸비가 실재. → "법칙"이 아니라 **흔한 tension**. 가능하면 *둘 다인* 레퍼런스 우선, 안 될 때만 역할 분리.
> - **DS-2 "접근성이 아예 없음"은 과장**: reduced-motion·focus 규칙은 §9에 이미 있음. 정확히는 **reviewer[design] 5차원에 a11y 차원이 없고, §9에 대비/키보드/aria가 없음.**
> - **Google 공식 예시 = 포맷 fixture일 뿐 시각 벤치마크 아님(하드 증거)**: 공식 예시 `atmospheric-glass`가 **glassmorphism + Deep-Blue/Vivid-Purple/Soft-Pink 그라디언트 + backdrop-blur** — 우리 anti-slop §9를 정면 위반. → DS-1 (5)의 exemplar는 *포맷·완성도 점검용*으로만(미감 참조 금지) 재확인됨.
> **[거버넌스 정정 — ADR-045 D6 실측]** D6 표: *"기존 결정 뒤집기 → 신규 ADR로 supersede(amend 흡수 금지)"*, *"amend 4개+ 누적 → 통합 재발행"*.
> - **DS-1은 amend 아님**: 사용자 URL 1순위를 뒤집으므로 **ADR-049를 supersede하는 신규 ADR** 필요("amend-2 갱신"은 틀림).
> - **ADR-027은 amend 6개** → DS-2/5/6/7의 §9·§1·§8 변경은 "Amendment 7"이 아니라 **ADR-027 통합 재발행(consolidated re-issue)** 경로(D6 grandfather: 다음 변경 시 재발행 우선).
> **[완화·정제]** ANTI-POLE "필수" → *미해결 tension 있을 때 조건부 counter-reference*. 토큰 "≥3, T1≥2" 고정 쿼터 → *일관된 primary 공식 시스템 1개 + gap 있을 때만 secondary*. "Radix 만능 브릿지" → *선택적 color primitive fallback(색만 — 타이포/레이아웃/IA/모션은 ground 못함, semantic mapping+대비검증 별도)*. "최종 6–8개" → *후보 6–8개, 최종 designer 입력 3–5개*. DS-6 Emil 정확 수치(ease-in 전면금지·exit 60–70%)는 보편법칙 아님 → *의미·빈도·중단가능성·reduced-motion 원칙 + 수치는 시작 디폴트*, tabular-nums는 §3 Typography로. DS-7 반응형은 임의 breakpoint보다 *reflow/container/table invariant*. HN-3 → **보류**(설명문이 이미 상당히 구분; 실 오호출 재현 시에만). DS-4 "주인 아예 없음" → *§8-1이 dead field라 실질 주인 부재*.
> **[정책 상태 정정]** "모든 결정이 문서에 박혔다"는 **부정확**: `IMPROVEMENT_BACKLOG2.md`는 **git untracked 세션 메모**이지 정책 SSOT가 아님. 실제 정책화 = ADR/skill 반영 + 커밋. "결정 완료"는 *방향을 backlog에 기록*했다는 뜻이지 정책 확정이 아님.
> **[실험 강도 정정]** DS-1 선정법 실험은 **탐색적 파일럿**(브랜드 2·반복 1·평가자 1·검색 예산 불균등·expectancy bias·픽셀 품질 미평가·합성 알고리즘 미검증)이다. 점수(1/1/1 등)·임계(≥3 등)는 **지시적(directional) 관찰**이지 검증된 상수가 아니다 — hard 수치로 박지 말 것. 엄밀 재검증(동일 예산·반복 2회·블라인드 2인 평가·실제 렌더)은 후속 과제.

> **✅ 4차·5차 검토 반영 (2026-07-20) — 엄밀 실험 + 정합 정리**: 엄밀 재검증이 실제로 수행됨(**Stage1 24안 × 블라인드 평가자 2명 + post-hoc B3 8안 + 별도 holdout 평가자 2명**, 2브랜드, 실제 1280/375/320 렌더+axe — 근거 `.boilerplate/validation/design-workflow-eval-20260720/REPORT.md`). *(정정: "32시안·평가자 4"는 부정확 — 총 32안이나 4명이 32안을 다 본 건 아님.)* 결과를 각 항목 본문·§2 요약표·§부록 최종표에 반영했다. 남은 정규화: 아래 2·3·4차 정정 블록은 changelog 성격으로 축소 예정. 핵심:
> - **우선순위 역전**: 리서치 강화(DS-1)는 시각품질을 못 올림(문맥 +76%, 평균 향상 0). 실제 배포불가 결함을 없앤 건 **수용 게이트 폐쇄 루프(DS-2/3/7)** — serious axe **5/8→0/8**. → **DS-2/3/7 먼저, DS-1/5는 얇게 뒤에.**
> - **DS-1 대폭 축소**: 5축·mandatory anti-pole·쿼터·tier·Radix 만능 폐기 → evidence-on-demand·role 3종·coverage 정지·최종 3–5개.
> - **DS-3 갱신**: 3차 조건부 4-트리거 → *full 모드 항상 렌더 + 320/populated-axe 상시 + repair loop*. **DS-5**: 안전/과감 → REFINE/EXPLORE. **DS-6**: 의미 중심(수치=token 시작값). **DS-7**: category state + responsive invariant.
> - **거버넌스 3묶음**: ① 신규 Design Workflow ADR(**ADR-049 supersede** — DS-1/3/5) ② **ADR-027 consolidated 재발행**(DESIGN 내용 — DS-2/5/6/7) ③ **ADR-056 focused amendment**(R5 transition map·DS-4).
> - **맹점(정직)**: cross-project *다양성*은 2브랜드로 미측정 · same-model·static prototype·B3 post-hoc · 평가자 상관 r≈0.53–0.57이라 작은 시각점수 차는 일반화 금지 → **정책 승격 전 REPORT §13 수용기준 충족 필요.**

---

## 0. 30초 요약

- **이 저장소가 뭐냐**: "AI가 소프트웨어를 만들 때 이런 순서·규칙으로 만들어라"를 문서와 스킬로 정해둔 **틀(보일러플레이트)**입니다. 사람이 규칙을 정해두면 AI가 그대로 따라 만듭니다.
- **무슨 분석을 했나**: 9개의 분석 AI를 병렬로 돌려 ① 밀스톤 관리 방식 ② 디자인/UX 파이프라인 ③ 유명 외부 레포 5개(superpowers, claude-mem, marketing-skills, remotion, ui-ux-pro-max)를 각각 깊게 뜯어봤습니다. 특히 디자인 레퍼런스 뽑기는 **말로만 확인하지 않고 실제로 웹에서 값을 뽑아 봤습니다(실측).**
- **결과**: 개선 후보를 **세 덩어리**로 정리했습니다 — (A) 밀스톤 **로드맵**(이번에 방향 결정 완료), (B) 디자인/UX **품질**, (C) 외부 레포에서 배운 **틀 안정성**.
- **가장 큰 실측 발견**: 디자인 레퍼런스에서 "실제 색·폰트 값 뽑기"는 **오픈소스 디자인 패키지에서는 잘 되지만(5개 다 성공), 실제 제품 페이지(Linear·Stripe·Vercel)에서는 3개 다 실패**했습니다. 즉 사용자가 동경하는 바로 그 레퍼런스가 실패 케이스라, 지금은 자주 "평범한 디자인"으로 조용히 후퇴할 위험이 있습니다.
- **가장 놀라운 수렴**: 서로 다른 외부 레포 **3개가 독립적으로 우리의 같은 약점 하나**를 가리켰습니다 — "틀을 바꿀 때 그 변경이 진짜 잘 됐는지 검증하는 방법"이 규정만 있고 **실제 도구가 없다**는 점.
- **좋은 소식**: 후보들이 거의 전부 **"문서 몇 줄 + 작은 스크립트 하나"** 수준으로 닫힙니다. 새 런타임 의존이나 큰 기계 없이, 지금 새는 구멍만 값싸게 막는 것들입니다.

---

## 1. 먼저 알아야 할 배경 (용어 7개)

항목들을 이해하려면 이 일곱 가지만 알면 됩니다.

1. **작업 흐름(lifecycle)과 스킬** — AI가 소프트웨어를 만드는 정해진 순서입니다: *발굴 → 기획 → 기술 선택 → 디자인 → 마일스톤/작업 계획 → 구현 → 검증 → 마감 → 마일스톤 "졸업".* 각 단계마다 **"스킬"**이라는 작업 안내서가 있습니다(예: `plan-milestone`=마일스톤 계획, `bootstrap-design`=디자인 계획).

2. **ADR** — "이런 결정을 이런 이유로 내렸다"를 적어둔 **결정 기록 문서**입니다. 이 틀의 규칙이 전부 ADR 번호로 박혀 있습니다(예: ADR-057=마일스톤/계획 규칙, ADR-049=디자인 흐름 규칙). **새 규칙은 새 ADR로** 박는 게 이 틀의 원칙입니다.

3. **SSOT (단일 진실 공급원)** — "하나의 사실은 딱 하나의 문서만 소유하고, 나머지 문서는 그걸 **링크**만 한다"는 규칙입니다. 같은 내용을 두 곳에 적으면 나중에 서로 어긋나기(drift) 때문입니다. 이 틀에서 제일 중요한 규율입니다.

4. **DESIGN.md와 토큰** — UI 프로젝트의 **모든 시각 결정을 담은 SSOT 문서**입니다. 여기서 색은 `#0e0f12`처럼 직접 쓰지 않고 `--color-bg` 같은 **이름(토큰)**으로 씁니다(나중에 한 번에 바꾸기 쉽게). §9에는 "이런 건 하지 마라"(anti-slop) 금지 목록, §10에는 글쓰기 톤 규칙이 있습니다.

5. **레퍼런스 grounding** — 디자인을 시작할 때 좋아하는 제품(Linear·Stripe 등)을 참고 삼아, 그 제품의 **실제 색·폰트·간격 값을 근거로 확보**하는 과정입니다. 이게 없으면 AI는 "가장 흔한 평균적 디자인"(예: 보라 gradient)으로 회귀합니다.

6. **마일스톤** — 여러 기능을 묶은 **큰 작업 단위**입니다. 다 끝나면 정해진 기준(graduation)을 통과해 "졸업"합니다. 지금은 마일스톤 문서가 **각각 따로** 있고, 서로를 한눈에 보는 지도가 없습니다.

7. **하청 AI·감사관·Codex** — 큰 일은 메인 AI가 **하청 AI**에게 위임합니다(코드 짜는 builder, 디자인하는 designer, 검사하는 **reviewer/감사관**). 그리고 이 틀은 **Claude Code와 OpenAI Codex** 두 도구에서 다 돌아가야 하므로, 새로 넣는 건 **양쪽에서 작동(또는 우아하게 축소)**해야 합니다.

> 이 문서를 어떻게 쓰나: 각 항목 맨 아래에 **"내 추천"과 "당신의 결정" 칸**이 있습니다. 읽고 나서 채택/보류/기각을 정하면 됩니다. (밀스톤 로드맵 RD-1은 **이번 세션에서 이미 방향이 결정**돼 그 칸에 결정 내용이 채워져 있습니다.)

---

## 2. 한눈에 보기 (우선순위)

세 덩어리로 나눠 정리했습니다. **A=밀스톤 / B=디자인·UX / C=틀 안정성.**

> 이 표는 **§부록 최종 실행표와 동일한 판정**을 요약한 것입니다(4·5차 검토 반영, 게이트-우선 순서). 상세 근거는 각 항목 본문.

| 착수 | 항목 | 한 줄 요약 | 심각도 |
|---|---|---|---|
| — | **[RD-1]** 밀스톤 로드맵 SSOT | 마일스톤 forward 지도 부재 (방향 결정됨 — 별도 라운드 초안화) | 큰 개선 |
| **P1·Phase1** | **[DS-3]** 렌더·DOM 수용 게이트 부재 | 독립 감사가 픽셀·DOM을 안 봐 배포불가 결함 통과(실측 serious 12/24). **실험상 진짜 지렛대** | **높음(P1)** |
| **P1·Phase1** | **[DS-2]** 접근성 감사 *차원* 부재 | reviewer 5차원에 a11y 없음 + §9에 대비/포커스/키보드/name 없음(reduced-motion·2축위계는 있음) | **높음(P1)** |
| **P1·Phase1** | **[DS-7]** 반응형 미설계(+8상태 강제 현실화) | 320 미검사·반응형 설계 없음(=Phase1) / 전 컴포넌트 8상태 강제→category state(=Phase2) | **높음(P1, 반응형)** |
| **P1** | **[HN-2]** 변경 검증 *방법·runner* 부재 | ADR-047이 falsifying eval을 의무화했으나 만드는 방법·러너가 없음(외부 3레포 지목) | **높음(P1)** |
| **P1·Phase2** | **[DS-5]** 시안이 "다르기만" — 긍정적 정체성 부재 | REFINE/EXPLORE + signature(task 기여 시만)로 "AI스럽지 않은" 디자인 *(가설 — 실험 미검증)* | **높음(P1)** |
| **P2·Phase2** | **[DS-1]** 레퍼런스 찾기 (**축소**) | 실제 값 자주 실패 + 모범 DESIGN.md 미참조 → **evidence-on-demand로 축소**(무거운 방식은 품질 향상 0·문맥 +76%) | 중간(P2) |
| **P1·Phase3** | **[DS-4]** 화면 *사이* 흐름 소비자 약함 | §8-1이 dead field + cross-screen 전환 자리 없음 *(가설 — 다화면·복구 흐름 한정)* | **높음(P1)** |
| **P2·Phase3** | **[DS-6]** 모션 규칙 빈약 | §8 한 줄 → semantic motion contract(수치=token 시작값) *(가설 — 실제 모션 미검증)* | 중간(P2) |
| **P2** | **[HN-1]** 문서 상대링크 무결성(+roster 정합) | 문서 이동 시 링크 조용히 깨짐. ※"Codex 스킬 5개 누락"은 **오류**(의도적 자연어 호출·기존 preflight가 이미 검사) | 중간(P2)↓ |
| **P2** | **[HN-4]** 자기가 만든 걸 자기가 검증 | dispatcher가 원하는 verdict/severity 하향을 주입할 위험 | 중간(P2) |
| **P2** | **[HN-5]** 도구별 memory는 비캐노니컬 | Claude·Codex **둘 다 memory 있음** → 필수 결정은 checked-in 문서에(원 전제 "Codex엔 없음"은 오류) | 중간(P2) |
| **보류** | **[HN-3]** 비슷한 스킬 혼동 | 설명문이 이미 상당히 구분 — 실 오호출 재현 시에만 | 보류 |
| **흡수** | **[HN-6]** (대부분 타 항목 흡수) | red-team=ADR-053 기존·fixture→HN-2·frontmatter→HN-1. 잔존=index-first recall | 조건부 |

> **가져오지 않기로 한 것들**(외부 레포에서 봤지만 우리 원칙에 안 맞는 것)은 아래 별도 섹션(§4)에 이유와 함께 있습니다.

---

## 3. 항목 하나씩 (자세히)

### A. 밀스톤 로드맵

---

### RD-1 — 마일스톤들을 한눈에 보는 "로드맵" 지도가 없다  ·  `[RD-1]`  ·  **이번에 방향 결정 완료**

**📖 배경 (상황)**
지금은 마일스톤(큰 작업 묶음)이 각각 **따로 떨어진 문서**(`M1-...md`, `M2-...md`)로 있습니다. 그리고 마일스톤을 계획하는 스킬(`plan-milestone`)은 **직전 마일스톤 1개**만 돌아봅니다.

**⚠️ 무엇이 문제였나**
"끝난 것 / 지금 하는 것 / 앞으로 할 것"을 **한 장에서 보는 지도가 없습니다.** 게다가 계획 중 AI가 "이 목표는 사실 마일스톤 3개로 쪼개야 한다"고 판단해도, 그 결론이 대화를 정리(`/clear`)하면 **증발**해서 다음 계획 때 처음부터 다시 계산합니다. 이게 실제 낭비입니다.
(비슷해 보이는 문서 4종 — 부채 목록·회귀 목록·제품기회·insight — 은 전부 **고도가 다른** 것이라 이 지도를 대신하지 못합니다.)

**💡 어떻게 고칠까 (이번에 결정된 방식)**
`docs/30-workitems/ROADMAP.md`(또는 더 명시적으로 `MILESTONE_ROADMAP.md`) 한 장을 만들고, **한 줄 = 한 마일스톤**으로 표를 씁니다: `id │ 목표(1줄) │ 상태 │ 졸업 스냅샷 │ 주요 기능(링크) │ 순서·의존 │ 확신도`.
- **한 명만 씁니다**(`plan-milestone`이 유일 작성자): 첫 호출 때 만들고, 매번 현재 마일스톤 행을 갱신 + 직전 행을 "졸업"으로 정리.
- **Done / Now / Next / Later 4구간(rolling-wave)으로 얇음 강제** (5차 검토로 3→4구간 통일 — 상세·표·착수순서 horizon 일치):
  - **Done**(졸업): Mx §8 회고에서 파생한 `graduated <date>, gate N/N` 스냅샷만.
  - **Now**(현재): 상세 `Mx`/feature 문서로 실체화됨. 로드맵엔 진척 스냅샷(`task 3/5, as-of 날짜`)만. **기본 Now는 1개**(병렬 마일스톤은 명시 결정 시만).
  - **Next**(다음): outcome 1~2줄만. 상세 문서 없음.
  - **Later**(그 뒤): 후보 한 줄만.
  - **M 번호는 Done/Now(실체화)만 발급, Next/Later는 미번호 후보**(`(M3?)`처럼 잠정) + **날짜·퍼센트·story point 기본 제외**.
- **핵심 안전장치("얇음" 규율)**: *예정(Next/Later)* 행은 **목표 1줄 + 확신도=낮음만**. 기능·조건(AC)·졸업 항목은 **적을 칸 자체를 안 만듭니다.** (안 그러면 "아직 안 정한 걸 정한 척"하는 소설이 되어 오히려 해롭기 때문 — 이게 이 기능의 성패를 가릅니다.)
- **상태 갱신 경로(2차 검토로 명확해짐)**: `stabilize-milestone`은 지금처럼 **읽기 전용 계약을 지키며** 마일스톤 회고에 `graduation: YES|NO|BLOCKED (날짜)`만 영속하고, **다음 `plan-milestone` R0가** 그 회고 + task done/total을 읽어 로드맵을 재조정합니다. (이러면 "누가 상태를 갱신하나"가 stabilize 계약을 안 깨고 단일 작성자로 수렴 — 내 원래 결정과 일치.)
- 로드맵=요약 지도 / 각 `Mx`=상세 원본(SSOT). 로드맵은 링크만 하고 내용을 복제하지 않습니다.
- **드래프트 라운드 세부 결정(아직 열림)**: ⓐ 파일명 `ROADMAP.md` vs `MILESTONE_ROADMAP.md`(후자가 덜 헷갈림) ⓑ 템플릿 파일을 둘지 — 2차 검토는 `_templates/MILESTONE_ROADMAP_TEMPLATE.md`를 두자고 제안했으나, 나는 **단일 인스턴스라 템플릿 없이 스키마를 ADR-057 amend + 파일 헤더에** 두는 쪽을 권장(불필요한 템플릿 = YAGNI). 이 두 가지는 초안 만들 때 확정.

**⚖️ 고치면 (장단점)**
- 좋음: 마일스톤 진척과 앞 계획을 한눈에. "3개로 쪼갠다"는 판단이 `/clear` 후에도 살아남음.
- 나쁨: 갱신할 문서가 하나 늘어남(단, 작성자가 한 명이고 기존에 이미 읽는 정보라 부담 최소). 예정 행이 낡을 위험 → "얇음" 규율로 방어.

**🎯 고칠 곳**: ADR-057 **Amendment 1**(새 ADR 아님) + `plan-milestone` 스킬(R0/R3) + STRUCTURE.md 산출물 표.
**✅ 내 추천**: **채택 — 이미 결정됨.** 단 "얇음" 규율이 전부. 지킬 수 없으면 "존재하는 것만 표시(생성 전용)"로 후퇴.
**🙋 당신의 결정**: ✅ **결정 완료(이번 세션)** — ① 만든다(얇은 forward) ② ADR-057 amend + plan-milestone R3에서 생성 ③ 예정 행은 R2 분할이 만든 얇은 행만.

---

### B. 디자인 · UX 품질

---

### DS-1 — 실제 제품에서 "디자인 값 뽑기"가 자주 실패한다 (실측 확인)  ·  `[DS-1]`  ·  심각도: 높음(P1)

**📖 배경 (상황)**
디자인을 시작하면, 좋아하는 제품을 레퍼런스로 넣어 그 제품의 **실제 색·폰트·간격 값(토큰)을 코드 수준으로 뽑아** 근거로 삼게 돼 있습니다. 이 "실제 값 근거"가 평범한 디자인으로의 회귀를 막는 **가장 강한 장치**입니다.

**⚠️ 무엇이 문제였나 (말이 아니라 실제로 뽑아봤습니다)**
- ✅ **오픈소스 디자인 패키지**(Primer, Radix, Polaris, Tailwind, shadcn): 5개 다 **진짜 값이 그대로** 나옴.
- ❌ **실제 제품 페이지**(Linear, Stripe, Vercel): **3개 다 실패** — 웹페이지를 텍스트로 바꾸는 과정에서 CSS(색·폰트 정의)가 통째로 사라짐.
- ⚠️ 압축된 파일은 몇 개 값만 찔끔 나오고, 주소를 추측하다 **404로 턴 낭비**.

즉 사용자가 실제로 동경하는 세련된 앱(Linear 등)이 **정확히 실패 케이스**라, 지금은 "운 좋게 올바른 주소를 맞히면 되는" 상태입니다.

**⚠️ 왜 문제인가**
레퍼런스 값 확보에 실패하면 **"모델 기억(=평균적 디자인)으로 조용히 후퇴"**합니다. 결과는 흔한 보라 gradient류. 사용자가 원한 방향과 멀어집니다.

**💡 어떻게 고칠까**
레퍼런스 뽑는 에이전트(researcher)의 지침에:
1. **확실히 되는 주소 목록을 핀으로 고정**(검증된 Primer/Radix/Polaris/Tailwind/shadcn 원본 주소) → 추측·404 제거,
2. "raw CSS"를 **JSON 형식 토큰 엔드포인트까지 확장**(shadcn류는 CSS 파일이 없고 JSON에 있음),
3. **압축 안 된 개별 토큰 파일 우선**,
4. 가짜 요약 사이트(mobbin·copycats류)는 **명시적으로 거부**.
(새 ADR 불필요 — 기존 규칙 ADR-040#amend-4가 하려던 걸 실제로 되게 만드는 것.)

**➕ 같은 뿌리의 추가 결함 (2차 검토가 짚음 — 저장소에서 확인됨)**
지금 레퍼런스는 **"토큰(색·글꼴 값)"에만** 있습니다. 당신이 원래 물어보셨던 **"다른 DESIGN.md 같은 걸 잘 레퍼런스로 찾아오는 과정"이 실제로는 없습니다:**
- **모범 DESIGN.md 예시를 안 봅니다** — R0은 제품(Linear 등)과 토큰 패키지만 참고하고, R5은 Google 포맷의 *섹션 순서*만 맞춥니다. 정작 **Google이 공식으로 제공하는 예시 DESIGN.md 3종**과 `designmd.directory`의 실제 사례를 **포맷·완성도 레퍼런스로 안 씁니다.**
- **화면 구성·정보구조·상호작용 레퍼런스가 없습니다** — 토큰은 뽑지만 "이 화면을 어떻게 배치하는가"의 근거는 없습니다.
→ **추가 수정**: (5) R0에 **"모범 DESIGN.md 예시를 포맷·완성도 레퍼런스로 참조"** 한 단계 추가(단, **미적 레퍼런스가 아니라 포맷·빠짐 점검용** — 남의 미감을 베끼는 게 아님). **출처 등급(실험 반영)**: Google 공식 예시 3종(`google-labs-code/design.md/examples` — authoritative, fetch 검증됨: paws-and-paths 등) *만* authoritative로 취급. `designmd.directory`·커뮤니티 DESIGN.md 미러는 **lead로만**(역추출·라이선스 불명 — authoritative 금지, canonical 대조 필요). (6) 레퍼런스 **역할 분리** — *(4차 최종형은 아래 🧪의 **3역할** `task/behavior · identity/craft · implementation system`)*; anti-reference는 별도 role이 아니라 *실제 monoculture/미해결 tension일 때만* 추가. 각 레퍼런스에 최소 schema(role·검증유형(visual/behavior/code)·관측일·borrow·avoid·confidence) 기록.

**🔄 R0 흐름 변경 (사용자 요청 — "AI가 알아서 리서치"를 디폴트로)**
현재 R0은 *①사용자 URL이 1순위 → 없으면 researcher가 검색*입니다. 이걸 뒤집어 **디폴트를 "AI 자율 리서치"**로 바꿉니다(사용자 의존↓). 3층으로 분리:
- **Layer A (방향 리서치 — 디폴트·신설 강화)**: charter의 *기획 방향·서비스 브랜드 성격*에 어울리는 **디자인 방향·레퍼런스 제품을 AI가 스스로 찾음**(정성 방향 어휘 확보). *지금 tier②는 토큰 추출만이라 이 "방향 찾기"가 사실상 빠져 있음 — 여기서 신설.*
- **Layer B (값 grounding)**: Layer A가 정한 방향에 맞는 오픈소스 토큰 패키지에서 **실제 값** 추출(핀 고정 목록).
- **Layer C (포맷·완성도)**: Google 예시 DESIGN.md로 포맷·빠짐 점검.
- **사용자 입력 = 옵션 힌트**: 원하는 사이트·느낌이 있으면 Layer A에 *우선 반영*, 없으면 그냥 자율 진행(확인 게이트 없이).

**🔬 결정 전 미니 검증 (2026-07-20, 실제 웹 fetch — 요청하신 사전 시뮬레이션 통과)**
- **Layer B(값)** — Radix `slate.css` 재확인: 실제 hex(`--slate-1:#fcfcfd … --slate-12:#1c2024`)+p3 그대로. ✅ 핀 고정 방식 지금도 됨.
- **Layer C(포맷)** — Google `examples/paws-and-paths/DESIGN.md` fetch: 6~7섹션(Brand&Style/Colors/Typography/Layout/Elevation/Shapes/Components)+YAML 토큰(`primary:'#855300'`)+brand voice까지 있는 **진짜 완성 예시**(예시마다 `design_tokens.json`·`tailwind.config.js` 동봉). ✅ 포맷·완성도 참조로 유용.
- **Layer A(방향)** — 샘플 브랜드("차분·에디토리얼·몰입형 저널링 앱")로 WebSearch: 실제 방향·원칙(필요할 때만 뜨는 미니 툴바, 현재 문단만 강조하는 focus mode, 눈 편한 파스텔, 난독증 모드)+레퍼런스 제품(Calmly Writer)을 찾아옴. ✅ **단 정직한 한계**: 방향은 잘 나오지만 대부분 **2차 소스**라 값 추출은 안 됨 → 그래서 B가 별도로 필요(3층 분리가 정답).
- **결론**: "AI 자율 리서치 디폴트" 흐름이 **실제로 됨**. 단 A(방향·자율)+B(값·핀)+C(포맷·예시)로 나눠야 각 층이 제 역할.

**🧪 레퍼런스 선정법 — 4차 검토(엄밀 실험)로 재정의 (2026-07-20)**
> ⚠️ **내 초기 파일럿(4전략×2브랜드·평가자1·반복1)의 5축·쿼터·tier는 폐기.** 더 엄밀한 후속 실험(**Stage1 24안×평가자2 + B3 8안 + holdout 평가자2**, 2브랜드, 실제 1280/375/320 렌더 + axe — 근거: `.boilerplate/validation/design-workflow-eval-20260720/REPORT.md`)이 뒤집었습니다:
- **레퍼런스 규칙을 잔뜩 더해도 시각 품질이 안 올랐다** — 무거운 방식(broad lanes+identity)이 현재 방식 대비 **평균 시각점수 향상 0, 문맥 +76%**. 고정 lane은 오히려 **무관한 근거**(Ops 화면에 트레이딩 PDF·어워드 연감)를 끌어와 task 적합도를 낮췄다(가설 H1 **기각**).
- **품질을 만든 건 리서치가 아니라 "수용 게이트 폐쇄 루프"** — 최초 24시안 중 **12개가 serious axe 위반**. 실제 selector 되먹임 **1회 수정으로 3/8 → 8/8** 통과. → **진짜 지렛대는 DS-2/3/7(게이트)이고 DS-1은 얇아야 한다.**
- **"고정 다양성 쿼터"는 역효과** → mandatory anti-pole·5축·global tier·Radix 만능론 폐기. 대신 *task 근거 + 실제 monoculture일 때만 counter-reference*.
- 내 파일럿 수치(1/1/1·≥3쿼터 등)는 **directional 관찰**이지 상수 아님 — hard로 박지 말 것.
- ⚠️ **미검증(맹점)**: cross-project *다양성*("여러 프로젝트가 서로 비슷해지나" — 당신 원래 우려)은 2브랜드 실험으로 **직접 측정 안 됨**(REPORT §14 남은 과제). 얇은 방식이 sameness를 부른다는 반증은 아직 없음.

**인코딩할 최종 규칙 (R0 — evidence-on-demand):**
1. 먼저 **primary task·결정 순간·실패/복구·정체성 tension**을 적는다(리서치의 방향타).
2. 사용자 레퍼런스는 **우선 힌트**(prerequisite 아님). 없어도 자율 조사하고 **부족한 evidence role만** 채운다.
3. **role 3종만**: `task/behavior` · `identity/craft` · `implementation system`. **counter-reference는 unresolved tension이나 실제 monoculture가 있을 때만**(mandatory 아님).
4. broad search·gallery·Dribbble/Behance = **이름 찾는 lead로만 허용**(blanket 금지 아님). 최종 근거는 **canonical 제품·공식 behavior 문서·live 스크린샷·source/token 코드로 검증**해 승격.
5. **visual 주장은 실제 화면을 봤을 때만, behavior 주장은 docs/interaction을 봤을 때만** 기록. "official"은 provenance이지 품질 점수 아님.
6. **고정 최소 개수 없음 — evidence coverage가 차면 멈춤.** designer 최종 입력 **보통 3–5개 이하**(단순 내부 도구는 더 적게).
7. concept 안에서는 **coherent primary system 1개**. 명시 gap 있을 때만 secondary primitive(**Radix는 *색만* fallback** — 타이포/레이아웃/IA/모션은 ground 못함, semantic mapping·대비검증 별도).
- **최소 기록 schema**: `source/canonical | role | 뒷받침한 결정 | 검증(visual/behavior/code) | 관측일 | borrow | avoid | confidence/caveat`. quality-tier·cluster-quota·groundable-count 같은 실험용 label은 **정책 필드로 만들지 않음**(기록 비용 > 결정 품질).
- **Google 예시 = 창작 컨텍스트(R0~R2)에 넣지 않음**(glassmorphism/보라 예시가 anti-slop 오염) — **선택 끝난 R5에서 section 완성도 format fixture로만**.

**⚖️ 고치면 (장단점)**
- 좋음: 레퍼런스가 "운 좋으면 됨" → **"안정적으로 진짜 값 확보"** + 남의 모범 DESIGN.md에서 **빠진 섹션·완성도**를 배움 + **사용자 입력 없이도** AI가 브랜드에 맞는 방향을 자율로 확보. ⚠️ **"다양성·품질이 구조적으로 보장된다"고는 쓰지 않는다** — cross-project 다양성은 미측정(REPORT §14)이고, evidence-on-demand의 주효과는 *비용 절감*이다(무거운 축·쿼터는 4차 실험에서 폐기).
- 나쁨: 거의 없음(지침에 목록 몇 줄). 단, 닫힌 제품(Linear 등)은 여전히 값 추출 불가 — 이 경우 "추출 불가"를 솔직히 표기하는 현재 규칙이 오히려 맞음.

**🎯 고칠 곳**: `researcher.md` "디자인 레퍼런스 모드"(핀 URL·JSON·거부목록) + `bootstrap-design` R0(Layer A 방향 리서치 신설 + 사용자입력 옵션화) + **ADR-049를 supersede하는 신규 ADR**(3차 정정 — 사용자 URL 1순위를 뒤집으므로 amend 아님, ADR-045 D6) + DESIGN_RESEARCH.md 스키마(역할분리·provenance).
**✅ 내 추천**: **채택 — 개인적 1순위.** 실측+미니 검증 모두 통과.
**🙋 당신의 결정**: ✅ **결정(4차 실험으로 축소)** — R0 = AI 자율 리서치 디폴트 + 모범 DESIGN.md 포맷 참조 유지하되, **선정 알고리즘은 evidence-on-demand로 축소**(5축·쿼터·tier·Radix만능 폐기 — 위 🧪). 구현 우선순위는 **DS-2/3/7 게이트 다음**(Phase 2).

---

### DS-2 — 디자인 감사에 "접근성" 검사가 하나도 없다  ·  `[DS-2]`  ·  심각도: 높음(P1)

**📖 배경 (상황)**
다 만든 UI를 감사관(reviewer[design])이 검사합니다. 검사 항목은 5개 — 토큰/컴포넌트/상태/anti-slop(촌스러움)/글쓰기 톤.

**⚠️ 무엇이 문제였나 (3차 정정 — "아예 없음"은 과장)**
정확히는: §9에 **reduced-motion·(2축 위계) 규칙은 이미 있으나**, **reviewer[design] 5차원에 a11y *차원*이 없고**, §9에 **대비·키보드 조작·aria·포커스 규칙이 없습니다.** 그래서 이런 게 아무 검사 없이 통과합니다:
- 포커스 링 제거(`outline:none`), 아이콘만 있는 버튼에 라벨 없음, **색깔로만** 상태 표시, 본문 대비 미달.
우리 기본 스택은 웹 프론트엔드라, 접근성은 "있으면 좋은 것"이 아니라 **기본기**입니다.

**⚠️ 왜 문제인가**
스크린리더·키보드 사용자에게 **안 보이거나 못 쓰는 UI**가 검사망을 그냥 통과해 출시됩니다. 실사용자 불만으로만 뒤늦게 드러납니다.

**🔬 실측 증거 (이건 가설이 아니라 실제로 일어났습니다 — 2차 검토가 짚음)**
앞선 dogfood(QuickTodo)에서 **완료 텍스트 대비가 3.70:1로 AA 기준(4.5:1) 미달**인 채로 통과됐습니다(`opacity .65`). 더 문제는, 있던 자동 접근성 검사(axe)가 **빈 화면만 검사 + 결과 무관 권고(advisory)**라 이 대비 실패를 **못 잡았습니다.** 즉 접근성이 문서 계약으로도, 자동 검사로도 사실상 무방비라는 게 **실측으로 확인**됐습니다. (근거: `SIMULATION_RUN.md` Round 4 — 대비 3.70:1 carry-over.)

**💡 어떻게 고칠까 (3차 검토로 강화 — §9 문구만으론 부족)**
1. DESIGN.md §9에 **접근성 규칙 추가** — **WCAG 2.2 구분 정확히**: *정상 텍스트 4.5:1 / 큰 텍스트 3:1 / 비텍스트 UI·아이콘 3:1* / 포커스 링 제거 금지 / 키보드 조작 / **아이콘 버튼 accessible name 확보**(aria-label·visible label·alt 중 하나 — aria-label 강제 아님) / 색-단독 표시 금지.
2. §9 echo만으론 약함 → **reviewer[design]에 a11y *차원*을 신설**(5→6차원) + **대표 populated state에 axe·대비 검사 배선**(dogfood axe는 빈 화면만 봐서 3.70:1을 놓침 — 실제 데이터 채운 화면을 검사해야 함).

**⚖️ 고치면 (장단점)**
- 좋음: 기본 웹 스택의 **가장 큰 품질 구멍을 거의 공짜로** 닫음(기존 배선 재사용).
- 나쁨: LLM이 정확한 대비 *비율*은 계산 못 함 → "포커스 제거/라벨 누락/색-단독" 같은 **확실히 잡히는 것**만 강하게, 정밀 비율은 권고로. (외부 레포 ui-ux-pro-max에서 유일하게 가져올 가치 있던 조각.)

**🎯 고칠 곳**: **ADR-027 통합 재발행(consolidated re-issue)**(3차 정정 — amend 6개 누적이라 D6상 다음 변경은 재발행) + DESIGN.md §9(WCAG 2.2 규칙) + **reviewer.md a11y 차원 신설(코드 변경 있음)** + 대표 populated state axe·대비 배선.
**✅ 내 추천**: **채택.** 최대 품질 구멍 — 단 §9 echo만으론 부족(reviewer 차원 필요).
**🙋 당신의 결정**: ______________

---

### HN-1 — 문서 상대링크가 조용히 깨진다 (+ 스킬 roster 정합 체커)  ·  `[HN-1]`  ·  심각도: 중간(P2, 4차 하향 — 전제 정정)

**📖 배경 (상황)**
이 틀은 문서들이 **경로로 서로 연결**돼 돌아갑니다("먼저 `docs/.../ADR-026`을 읽어라" 같은 지시가 스킬 안에 박혀 있음). 또 스킬은 Claude용(`.claude/skills`)과 Codex용(`.agents/skills`) **두 벌**로 존재해야 합니다.

**⚠️ 무엇이 문제였나 (3차 검토로 재확인 — 전제 정정)**
- **(진짜 문제) 문서 상대링크 무결성**: 문서를 **옮기거나 이름 바꾸면** 그 경로가 죽고, 에이전트는 죽은 경로로 안내받아 **헛돌거나 없는 내용을 지어냅니다.** (최근 커밋에 ADR 리네임·문서 삭제가 실제로 많음.) — 이건 실재하는 real 문제.
- **~~5개 스킬 누락~~ (정정: 오류였음)**: 실제는 21 vs **16**이고, 없는 5개(boilerplate-context·bootstrap-design·discover-product·research-pack·review-doc)는 **ADR-010#amend-4 결정5가 정한 "의도적 자연어 호출 Codex skill"**이다(누락·기능 상실 아님). roster/wrapper 정합은 **stabilize preflight 7이 이미 기계 점검**한다. → 이 항목의 남는 가치는 "5개 누락 잡기"가 아니라 **기존 preflight의 link·roster 검사를 repo-local 실행 스크립트 하나로 통합**하는 것.

**⚠️ 왜 문제인가**
둘 다 **"조용한 실패"**입니다 — 지금 당장 안 보이고, 나중 실행에서야 터져 진단에 시간이 듭니다. 예: 리네임된 ADR을 놓치면 builder가 그 제약 없이 코드 생성 → 한참 뒤 검증에서 발각.

**💡 어떻게 고칠까 (5차 정정 — 단일 checker, "스크립트 2개/5개 결함" 프레임 폐기)**
하나의 **repo-local checker 계약**부터:
1. **(진짜 새 가치) 문서 상대링크·앵커 무결성**: 모든 `.md`의 상대 링크·`#anchor`가 실제 파일/헤딩을 가리키는지 검사, dead면 "파일 → 죽은 경로" 목록으로 실패.
2. **roster 정합은 새로 만들 필요 없음** — `stabilize-milestone` preflight 7이 이미 skill dir↔STRUCTURE·README 자연어목록·cross-LLM wrapper 존재를 deterministic 검사함(`SKILL.md:83-86`). 이 link checker를 그 preflight가 호출하거나 같은 실행기로 통합.

**⚖️ 고치면 (장단점)**
- 좋음: 링크 dead-path(문서 이동 시 JIT 경로 깨짐)를 사전 차단. Node라 Claude·Codex 공통. HN-2의 falsifying-eval runner로도 쓰임.
- 나쁨: 자동 CI 없으니 "변경 시 실행" 규율 필요.

**🎯 고칠 곳**: 단일 link/anchor checker(`scripts/`) + 기존 stabilize preflight 7 재사용/연결 + ADR-047(검증 러너로 지목).
**✅ 내 추천**: **축소 채택(P2).** 링크 무결성만 새 가치 — roster는 이미 있음. ("5개 결함 실측" 프레임은 오류라 폐기.)
**🙋 당신의 결정**: ______________

---

### DS-3 — 촌스러운 디자인(슬롭)을 만들기 전에 못 잡고, 다 만든 뒤에 잡는다  ·  `[DS-3]`  ·  심각도: 높음(P1)

**📖 배경 (상황)**
이 파이프라인의 원칙은 **"만드는 놈(designer)과 검사하는 놈(reviewer)은 분리"**입니다(자기가 만든 걸 자기가 검사하지 않음).

**⚠️ 무엇이 문제였나 (4차 정정 — "빌드 후에만"은 과장)**
사실 **빌드 전 시안은 이미 있습니다**(R2 concept 2~3안 + plan-milestone R5 승인 프로토타입). 진짜 gap은:
- 독립 감사(reviewer)가 **요약 카드/토큰만 보고 실제 렌더 픽셀·DOM은 안 봄** → HTML 속 보라 gradient·대비 실패·overflow는 안 걸림.
- preview 검사는 **생성자가 자기 걸 자기가 검사** ← 생성/감사 분리 위반.
- **실측**: 최초 24시안 중 **12개가 serious axe 위반**이었고, 스크린샷만 본 평가자는 그중 **serious 결함을 0건 확정** — 눈에 예뻐 보이는 작은 회색 글자가 실제 대비 실패를 숨김.

**⚠️ 왜 문제인가**
렌더·DOM을 안 보면 실제 배포불가 결함이 사용자 승인까지 통과합니다. 세 검사(HTML-read / 스크린샷 / axe·320)가 **서로 다른 결함**을 잡으므로 어느 하나로 대체 불가(실측 확인).

**✅ 수용 게이트 (4차 실험으로 갱신 — 3차의 조건부 "4-트리거"를 대체)**
> 왜 바뀌나: 375만 검사하면 실제 **320px 실패를 놓친다**(실측 반례 `r2-b1/ops-b`), 렌더는 Playwright 선설치라 사실상 공짜, 조건부 트리거는 *필요한 렌더를 건너뛸* 위험. → **full 모드는 항상 렌더 + 값싼 검사는 상시.**
- **항상(값싼·결정적)**: **320 CSS px reflow**(page overflow/viewport escape/clipped text) + **populated DOM axe**(빈 화면 아님 — 실데이터 채운 화면. dogfood axe가 빈 화면만 봐 3.70:1을 놓친 문제 해결).
- **full 모드**: 각 concept을 **1280 + 375 렌더** → 독립 reviewer가 **픽셀**로 위계·밀도·domain fit·장식 slop 판정(HTML-read는 source 감사, 렌더는 pixel 감사 — 별개).
- **차단(block)**: serious/critical axe · page overflow · viewport escape · primary-task 텍스트 clipping · critical overlap. **보고(report)**: moderate/minor axe + 취향 finding. **수동 smoke**: Tab 순서·visible focus·trap 없음·Escape·색 외 상태표식(axe가 자동으로 못 잡는 subset — 제거 불가).
- **repair loop (핵심 지렛대)**: 실패 selector+요약을 designer에 되먹여 **재실행** — 실측에서 3/8→8/8을 만든 건 좋은 프롬프트가 아니라 이 폐쇄 루프. **retry ≤2, 초과 시 승인 보류 + brief/source 재검토**(무한 루프 방지). 여전히 fail이면 승인 X. **산출물 정리**: 통과본 외 임시 렌더/스크린샷은 정리(ADR-049 ephemeral 정합).
- **`--fast` / `--update`**: research·스크린샷 reviewer는 명시 생략 가능(사유 echo — silent skip 금지)하나, browser 있는 UI면 **값싼 axe/reflow는 유지** 권장. **비용**: concept/preview·선택 프로토타입 **1회성 게이트에서만**(per-task hot-loop 금지). LLM reviewer는 **1명이면 충분**(실험의 2명은 노이즈 측정용).

**⚖️ 고치면 (장단점)**
- 좋음: 배포불가 결함을 빌드 전에 실제로 제거(실측: serious 5/8→0/8). 계산은 axe/browser가 담당(LLM 추정 아님).
- 나쁨: 렌더/axe 실행 시간(단 Playwright 선설치라 추가 의존 0). 수동 smoke는 사람 몫으로 남음(자동 불가분).

**🎯 고칠 곳**: `bootstrap-design` R2/R6(렌더·axe·320·repair loop) + `reviewer.md`(렌더 증거·픽셀 판정) + stack-guard 기존 Playwright/axe 재사용. 거버넌스: **ADR-049 supersede 신규 Design Workflow ADR**(DS-1·DS-5와 한 묶음).
**✅ 내 추천**: **강하게 채택 — 실험상 진짜 지렛대.** DS-1보다 **먼저** 구현.
**🙋 당신의 결정**: ⚠️ **3차의 "계층형 4-트리거"를 4차 실험 근거로 갱신** — full 모드 항상 렌더 + 320/populated-axe 상시 + repair loop. (이전 4-트리거 선택을 뒤집는 변경이라 반대시 말씀 — 근거는 320 실패 반례·render 사실상 공짜.)

---

### HN-2 — "틀을 바꿀 때 잘 됐는지 검증하는 방법"이 규정만 있고 텅 비어 있다  ·  `[HN-2]`  ·  심각도: 높음(P1)  ·  **외부 레포 3개가 지목**

**📖 배경 (상황)**
이 틀은 스스로를 "규칙을 바꾸면 그 변경이 진짜 효과 있는지 **검증(falsifying evaluation)**을 붙여야 한다"고 의무화(ADR-047)해 뒀습니다.

**⚠️ 무엇이 문제였나**
그런데 **그 검증을 *어떻게* 만드는지 방법도, 도구도 없습니다**(문서 전체를 뒤져 확인). 그래서 실제로는 "검증했다"고 글로만 적고 넘어갑니다. 놀랍게도 **서로 다른 외부 레포 3개가 독립적으로 이 구멍을 가리켰습니다:**
- **superpowers = 방법론**: "규칙 문구 시험법". 특히 **금지문("~하지 마라")은 '모양이 틀린 출력'을 고치는 데는 오히려 역효과**라는 걸 실측으로 보여줌(대조군보다 더 나쁜 출력을 냄) → 그런 건 금지 대신 "이렇게 해라" 긍정 레시피로. + 대조군을 둔 초저비용 문구 테스트.
- **remotion = 도구**: HN-1의 링크/anchor checker(+기존 preflight)가 그 검증의 **실제 러너**가 됨.
- **marketing-skills = 픽스처**: 스킬별로 "이 입력이면 이렇게 나와야 함" 작은 회귀 예시 파일.

**⚠️ 왜 문제인가**
검증 방법이 없으면, 문구를 고쳐도 **그게 AI 행동을 진짜 바꿨는지 모른 채** 배포합니다. 특히 우리 문서는 "금지" 문구가 많은데, 그중 일부는 오히려 품질을 **더 나쁘게** 만들고 있을 수 있습니다(그걸 구분하는 표가 있음).

**💡 어떻게 고칠까**
ADR-047에 **작은 하위절 하나** 추가: (1) 바꾸려는 규칙의 실패 유형을 분류("규율 실패 → 금지문 OK / 모양 실패 → 긍정 레시피") + (2) 대조군을 둔 초저비용 문구 테스트를 기본 검증으로 삼고, (3) HN-1의 스크립트를 그 검증 러너로 지목. **새 스킬·기계 없음**, 방법(글)만 채웁니다.

**⚖️ 고치면 (장단점)**
- 좋음: 우리 스스로 의무화한 필드에 **실체**가 생김. 안 먹히는 문구를 값싼 5회 테스트로 걸러냄(비싼 전체 재실행 전에). Codex에서도 동일(작성 시점 활동).
- 나쁨: ADR-047이 이미 큼 → 표 + 3줄 레시피 + 포인터로 **딱 끊어야** 함(과하면 문서 비대).

**🎯 고칠 곳**: ADR-047(하위절) + `_ADR_GUIDE.md` 한 줄 포인터.
**✅ 내 추천**: **채택(강추).** 우리 거버넌스의 실제 구멍을 메우고, 외부 3개가 수렴 지목한 지점.
**🙋 당신의 결정**: ______________

---

### DS-4 — 색·글꼴은 꼼꼼한데, 화면 *사이* 흐름은 설계 주인이 없다  ·  `[DS-4]`  ·  심각도: 높음(P1)

**📖 배경 (상황)**
디자인 품질에는 두 층이 있습니다 — **화면 안**(색·글꼴·컴포넌트)과 **화면 사이**(어느 화면에서 어디로 가나, 정보구조, 내비게이션).

**⚠️ 무엇이 문제였나 (4차 정정 — "주인 아예 없음"은 과장)**
화면 *안*은 다중 감사받는데 화면 *사이* 흐름은 약합니다. 정확히는: **§8-1(primary task·empty/loading/error 복구·a11y·HEART)는 이미 있으나 downstream 소비자가 없어 dead field**이고, cross-screen 전환(A→행동→B, 실패/복구)을 담는 자리가 없습니다.

**⚠️ 왜 문제인가**
사용자 여정·정보구조·복구 경로가 설계 없이 즉흥으로 만들어져 **"화면은 예쁜데 흐름이 어색한"** 결과가 나옵니다.

**💡 어떻게 고칠까 (새 UX 문서·에이전트 없이 기존 자리에)**
- plan-milestone **R5-1에 화면 전환 표**: `현재 화면/상태 | 사용자 행동 | 다음 화면/상태 | 실패/복구 | owner feature/prototype`.
- **downstream 소비자 배선(중요 — 안 그러면 또 dead field)**: `plan-workitem`이 그 feature 행을 **task/AC로 회수**, `validate-plan`이 **primary path + recovery path가 프로토타입·AC에 존재**하는지 검사.

**⚖️ 고치면 (장단점)**
- 좋음: 화면 사이 흐름에 처음으로 설계 주인이 생김. 텍스트 한 장이라 저비용.
- 나쁨: 계획 단계가 조금 늘어남(단, 화면 그리기 전이라 값이 큼).

**🎯 고칠 곳**: `plan-milestone` R5-1 + ADR-056(또는 ADR-042) amendment.
**✅ 내 추천**: **채택.** 시각 대비 구조적으로 홀대된 축을 저비용으로 메움.
**🙋 당신의 결정**: ______________

---

### DS-5 — 시안이 서로 "다르기만" 하고, 다들 안전하다 (= "AI스럽지 않은 디자인"의 핵심)  ·  `[DS-5]`  ·  심각도: **높음(P1)** — 2차 검토 반영해 P2→P1 승격

**📖 배경 (상황)**
디자인 시안을 2~3개 만들 때, "카드"로 **서로 확실히 다르게** 만들도록 강제합니다(한 안은 색을, 다른 안은 밀도를 다르게).

**⚠️ 무엇이 문제였나**
카드는 "다름"만 보장하고 **"과감함/야심"은 안 봅니다.** 그래서 두 시안이 서로 다르면서 **둘 다 안전·평범**할 수 있습니다(예: '조밀한 표' vs '카드 격자' — 둘 다 무난). 사용자가 취향 입력이 약하면 **뻔한 선택지 2~3개**만 받게 됩니다.

**⚠️ 왜 문제인가**
"AI스럽지 않은 세련·독창"으로 밀어붙이는 장치가 없어, **안전하지만 개성 없는** 디자인이 생존합니다.

**💡 어떻게 고칠까 (두 가지 — 2차 검토로 강화)**
1. **(4차 정정: "안전 vs 과감" → REFINE / EXPLORE)** "안전/과감"은 *novelty가 목표*로 오해되기 쉬워 두 기본안을 이렇게 정의: **REFINE**(익숙한 task convention 우선 + restrained signature), **EXPLORE**(signature-led이되 *같은* 익숙한 control/flow 보존). 3번째 안은 *풀리지 않은 명시적 tension이 있을 때만*. 각 시안 카드: `task hypothesis | preserved convention | visible signature | failure sign`. **signature가 primary task를 더 빨리 이해시키지 못하면 장식 → 제거**(실험에서 rail·route 장식이 coherence를 해친 사례).
2. **(정체성) DESIGN §1에 "긍정적 정체성"을 명시** — 지금 §9는 "하지 마라"(금지)만 잔뜩이고 "이렇게 되어라"(긍정)가 없어, 결과가 **깨끗하지만 평범한** UI로 수렴합니다. 그래서 §1에 다음을 적게 합니다:
   - **design thesis**(이 제품 디자인이 뭘 지향하는가, 한 문장),
   - **signature mechanism 1개**(이 제품만의 시각/인터랙션 특징 — 예: "모든 액션은 커맨드바 한 곳에서"),
   - **imagery/icon 방향**(사진이냐 일러스트냐 아이콘 스타일 등),
   - (선택) **density / variance / motion 다이얼**(대시보드는 조밀·차분, 랜딩은 여유·생동 — 강도를 눈금으로).
   → 금지 목록만으로는 "안 촌스러움"까지고, **개성·세련**은 이 긍정적 정체성이 만듭니다. 이게 당신이 원하신 **"AI스럽지 않은 좋은 디자인"의 실제 지렛대**입니다.

**⚖️ 고치면 (장단점)**
- 좋음: 창의성에 "위쪽으로 당기는 힘"이 생김. 시안이 뻔함에서 벗어나 **의도된 개성**을 갖게 됨.
- 나쁨: §1이 조금 길어짐 + design thesis가 공허한 미사여구가 되지 않게 "actionable" 규율 유지 필요. '과감' 안이 취향과 안 맞으면 버려질 수 있음(원래 선택지니 손해 아님).
- **반영 안 함(과함)**: 2차 검토의 "variance/motion 다이얼을 통째 도입"은 우리 divergence 카드(다양성)·Motion §8과 **중복**이라 스킵. **density 다이얼과 "정체성 명시"만** 가져옵니다.

**🎯 고칠 곳**: `bootstrap-design` 시안 카드(REFINE/EXPLORE) + `designer.md`(task hypothesis·signature) + DESIGN.md §1(정체성) + **신규 Design Workflow ADR(ADR-049 supersede) + ADR-027 재발행**(DS-1·DS-3과 한 묶음).
**✅ 내 추천**: **채택 — P1.** 당신의 핵심 목표("세련되고 창의적인, AI스럽지 않은 디자인")를 정면으로 겨냥. 저비용.
**🙋 당신의 결정**: ✅ **풀(4차 정정 형태)** — REFINE/EXPLORE 두 안(안전/과감 아님) + signature는 primary task를 설명할 때만 + DESIGN §1에 thesis·signature·imagery(또는 N/A)·contextual density. variance/motion 다이얼 제외. actionable 가드로 buzzword 방지.

---

### C. 틀 안정성 (외부 레포에서 배운 것)

---

### HN-3 — 비슷하게 생긴 스킬끼리 헷갈려 잘못 부른다  ·  `[HN-3]`  ·  심각도: 중간(P2)

**📖 배경 (상황)**
스킬 중엔 이름이 닮은 무리가 있습니다 — `validate-workitem`/`validate-plan`/`validate-milestone`/`validate-discovery`, `repair-*` 무리, `plan-milestone`/`plan-workitem`.

**⚠️ 무엇이 문제였나**
설명문이 "언제 쓰는지"를 명확히 안 갈라줘서, **엉뚱한 형제 스킬을 부를** 수 있습니다(잘못 부르면 한 턴 낭비 후 복구).

**💡 어떻게 고칠까 (marketing-skills 차용)**
각 스킬 설명문이 두 가지를 하게: (a) **언제 쓰는지 트리거 문구**, (b) 경계에서 **형제 스킬을 서로 가리키는 참조**("작업 하나면 → validate-workitem, 마일스톤이면 → validate-milestone"). 양방향으로 적어야 안 썩습니다.

**⚖️ 고치면 (장단점)**
- 좋음: 닮은 스킬 오인 감소. 순수 텍스트라 Claude·Codex 동일.
- 나쁨: 설명문이 길어질 수 있음 → 경계당 한 구절로 제한.

**🎯 고칠 곳**: STRUCTURE.md의 스킬 인벤토리 근처 규약 + 혼동 무리 8개 설명문.
**✅ 내 추천**: 채택(저비용). 우리 라이프사이클은 대부분 순차라 이득은 3개 무리에 집중.
**🙋 당신의 결정**: ______________

---

### HN-4 — 구현한 AI가 자기 검증을 무르게 만들 수 있다  ·  `[HN-4]`  ·  심각도: 중간(P2)

**📖 배경 (상황)**
지금은 구현하는 세션(메인 AI)이 **자기가 만든 걸 검증**하기도 합니다(검증 스킬을 직접 실행).

**⚠️ 무엇이 문제였나**
그럼 **자기가 낸 지름길을 "이 정도는 괜찮다"고 프레이밍**해 통과시킬 편향 위험이 있습니다. 지금 규칙은 *감사관*이 "수정 금지·보고만"이라고만 정하고, **일을 시키는 쪽이 어떻게 프레이밍하는지**는 안 막습니다.

**💡 어떻게 고칠까 (superpowers 차용)**
"검증자에게 **무엇을 지적하지 마라고 미리 말하거나, 심각도를 미리 정해주지 마라**"는 한 줄 규칙. 계획과 충돌하는 발견은 숨기지 말고 **사람에게 올리기**(이미 있는 '사람 결정 필요' 패턴과 동일). 단, "지켜야 할 기준을 그대로 넘기는 것"은 필수 맥락이지 사전판정이 아님 — 이 선을 명시.

**⚖️ 고치면 (장단점)**
- 좋음: 자기검증 편향으로 인한 거짓 통과를 막음. 한 줄.
- 나쁨: 거의 없음(과하게 읽으면 "기준 넘기기"까지 겁낼 수 있어 예외를 명시).

**🎯 고칠 곳**: DELEGATION_STRATEGY 검증/감사 행 + (정책이면) ADR-050 amendment.
**✅ 내 추천**: 채택(한 줄, 실제 편향 차단).
**🙋 당신의 결정**: ______________

---

### HN-5 — 도구별 기억(MEMORY)은 비이식·비캐노니컬이라 결정이 사라질 수 있다  ·  `[HN-5]`  ·  심각도: 중간(P2)

**📖 배경 (상황) — 3차 검토로 전제 정정**
Claude Code는 내장 `MEMORY.md`, **Codex도 native Memories**(CLI v0.128, `~/.codex/memories/`, 자동 생성)를 갖습니다. *"Codex엔 memory 없음"은 틀렸습니다.* 진짜 문제는 **둘 다 로컬·생성물이라 cross-machine sync가 없고 비캐노니컬**이라는 점(Codex memories는 공식 문서상 머신 간 동기화 없음).

**⚠️ 무엇이 문제였나**
"OAuth는 M3로 미룸" 같은 결정이 **오직 도구 memory에만**(Claude MEMORY.md든 Codex memories든) 있으면, 다른 도구·다른 머신·fresh 세션으로 이어받은 팀원은 그걸 못 보고 **다시 계획**합니다(연속성 깨짐 + SSOT 위반).

**💡 어떻게 고칠까 (claude-mem에서 얻은 교훈 — 정정된 형태)**
규율 한 줄: **"도구별 memory(Claude MEMORY.md·Codex memories 둘 다)는 로컬 *가속기*일 뿐, 사실의 유일한 소유자가 되면 안 된다."** 지속돼야 할 결정은 반드시 **마일스톤 문서나 ADR(=checked-in 문서)에도** 내려가야 함. 프로젝트 시작 시 한 번 점검.

**⚖️ 고치면 (장단점)**
- 좋음: Codex 연속성 손실 방지 + "기억이 유일 소유자"를 금지해 SSOT·양도구 원칙 강화.
- 나쁨: 강제 불가(내장 기억은 자동 기록) → 규율 + 주기 점검으로 유지. 과하게 자동화하면 오히려 우리가 거부한 런타임 비대.

**🎯 고칠 곳**: ADR-010(양도구 호환) 규율 한 줄 + PROJECT_START_CHECKLIST 점검 항목.
**✅ 내 추천**: 채택(실제 연속성/SSOT 구멍, 한 줄 규율).
**🙋 당신의 결정**: ______________

---

### DS-6 — 모션(움직임) 규칙이 한 줄뿐이다  ·  `[DS-6]`  ·  심각도: 중간(P2)

**📖 배경 (상황)**
DESIGN.md §8은 애니메이션/모션 규칙인데, 지금은 "Material 3 기준 몇 ms" 한 줄 수준입니다.

**⚠️ 무엇이 문제였나**
구체 지침이 없어 모션이 즉흥적이거나 촌스러워지기 쉽습니다.

**💡 어떻게 고칠까 (4차 정정 — 의미 중심, 보편 상수 아님)**
§8은 **semantic motion contract**만 정책화: **목적**(feedback/continuity/orientation/state-change 중 무엇), **빈도**(반복 흐름일수록 motion budget↓), **실행**(project duration/easing *token* · interruptible · layout shift 없음), **접근성**(reduced-motion에서 정보손실 없는 대체 상태), **금지**(decorative infinite/repeated). Emil의 정확 수치(버튼 100–160ms·`ease-in` 전면금지·exit 60–70%)는 **universal law가 아니라 project token의 *시작 default*로만**. `tabular-nums`는 **모션 아님 → §3 Typography/Data-table 계약으로 이동**.

**⚖️ 고치면 (장단점)**
- 좋음: 모션이 프로젝트 의미에 맞게 — 특정 개인 수치를 법으로 굳히지 않음.
- 나쁨: §8이 조금 길어짐 → 계약 5항목만.

**🎯 고칠 곳**: DESIGN.md §8(내용은 **ADR-027 재발행**) — 수치는 project token.
**✅ 내 추천**: 채택(의미 중심, 저비용).
**🙋 당신의 결정**: ______________

---

### DS-7 — 디자인 소품 묶음 (작은 것들)  ·  `[DS-7]`  ·  심각도: 낮음(P2)

**📖 배경·문제·해법 (묶음 — 4차 검토로 정정)**
아래는 개별로는 작지만 있으면 좋은 것들입니다(거버넌스: **ADR-027 재발행**에 함께):
- **시안 내부 조화 검사**: 시안을 "서로 다르게"만 보지 말고 **"한 시안 안에서 빌려온 요소들이 서로 어울리는지"** 한 줄 검사(짜깁기 방지).
- **근거 표시(provenance)**: 레퍼런스마다 검증 유형(visual/behavior/code) 표시 → 뒤 단계가 어느 게 단단한 근거인지 앎(DS-1과 짝).
- **반응형 = invariant(4차 정정 — 임의 breakpoint 아님)**: §4가 **content order · container transition · table strategy · sticky occlusion · 320 reflow · text fit · essential-2D exception** invariant를 소유(breakpoint 숫자 목록 강제 아님). dogfood 근거: overflow·axe가 결과무관 통과라 반응형이 설계·검증 안 됨.
- **상태 = category 계약(4차 정정 — 8상태 강제 폐기)**: **category별 expected states** — *interactive primitive*(default/hover/active/focus-visible/disabled, async면 loading) · *data composite/screen*(default/loading/empty/error/**success**) · *static primitive*(state matrix 없음). N/A는 category상 expected를 의도적으로 뺄 때만. **실측: 8상태 강제 136개 planning entry → category 74개(-46%) + 빠졌던 success 추가.**
- **표 숫자 정렬(tabular figures)**: **§3 Typography/Data-table**로(§9 아님). 밀도 힌트(대시보드=조밀/마케팅=여유): R3 한 줄.
- (옵션) `@google/design.md lint`: UI+Node일 때 stack-guard 권장. **(4차 정정)** **version-pin(`@google/design.md@x.y.z`) + runtime `spec --rules` 조회, rule 개수는 문서에 박지 않음**(실제 9개·alpha라 변동 — 실검 완료). Windows는 `npx -p @google/design.md designmd ...`. **format/declared-token 보조일 뿐 browser a11y gate 아님**(그건 DS-2/3 axe·render). YAML frontmatter migration은 중복 SSOT라 현재 이득 없음. lint/공식 예시는 포맷 교정에만, 미감 참조 금지.

**⚖️ 고치면**: 작은 품질 이득 여럿 + 상태 paperwork 46%↓. **나쁨**: §3/§4/§7이 조금 길어짐 → 확실한 것만.
**🎯 고칠 곳**: DESIGN.md §3/§4/§7/§9 + `bootstrap-design` R3/R4 + `reviewer.md`(category state) + (옵션) stack-guard. 거버넌스: **ADR-027 재발행**.
**✅ 내 추천**: 골라서 채택 — **category state·반응형 invariant·표 숫자 정렬**은 값 분명.
**🙋 당신의 결정**: ______________

---

### HN-6 — 틀 관리 소품 묶음 (조건부)  ·  `[HN-6]`  ·  심각도: 낮음/조건부

**📖 배경·문제·해법 (묶음)**
외부 레포에서 봤지만 우리엔 "작게·조건부로만" 가져올 것들:
- **스킬별 회귀 픽스처(marketing-skills)**: 드리프트 잦은 스킬(validate-*/bootstrap-stack)에만 "이 입력→이 판정" 예시 3~5개. 단 우리 스킬은 여러 파일·상태를 다뤄 자동 실행이 안 되므로 **사람이 확인하는 체크리스트**로만, 소수 스킬에 한정(안 그러면 관리 안 되는 파일 21개).
- **~~패널에 반대자 강제~~ (4차 정정: 폐기 — 이미 있음)**: ADR-053 결정③이 이미 **2번째 architect red-team**("패치 말고 전면 재작성") + parallel-merge 금지를 요구함(직접 확인). 중복이라 드롭.
- **스킬 형식 검사(marketing-skills)**: 스킬 frontmatter가 잘 형성됐는지 최소 검사 → HN-1 스크립트에 한 모드로 접어 넣기(별도 CI는 과함).
- **점진적 공개 회수(claude-mem)**: 계속 길어지는 두 로그(QA_FINDINGS·IMPROVEMENT_GUIDE)를 읽을 때 **통째로 읽지 말고 "색인(상태·심각도)으로 먼저 걸러 해당 항목만"** 읽는 규율. 지금은 파일이 짧아 이득이 작지만, 마일스톤 10+ 쌓인 다운스트림에서 토큰을 아낌. **주의**: 반드시 *상태·심각도로* 걸러야 함(마일스톤 헤더로 자르면 이전 마일스톤에서 넘어온 미해결 P0을 놓침).

**⚖️ 고치면**: 회귀·형식 오류를 싸게 잡음 + 큰 프로젝트에서 회수 토큰 절약. **나쁨**: 과하게 키우면 우리가 거부한 "무거운 테스트 스위트"가 됨 → 전부 **얇게/조건부**로.
**🎯 고칠 곳**: ADR-047(픽스처 계층) / ADR-053(반대자) / HN-1 스크립트(형식 검사 모드).
**✅ 내 추천**: 조건부 채택 — HN-1·HN-2와 묶어서. 반대자는 ADR-053 확인 후.
**🙋 당신의 결정**: ______________

---

## 4. 가져오지 않기로 한 것들 (범위 밖 · 중복 — 정직하게)

외부 레포에서 봤지만 **일부러 안 가져오는** 것들입니다. 크기에 혹하지 않기 위해 이유를 남깁니다.

- **마케팅/GTM/런칭 스킬 전체(marketing-skills)** — 우리는 개발 틀이지 마케팅 도구가 아님(ADR-031 스코프). 포지셔닝의 최소분은 이미 discover-product/charter가 담음.
- **프로그래밍 영상 기능(remotion)** — 데모 영상 자동 생성은 멋지지만 우리 5개 스택 밖 + 미래 대비 코드(YAGNI). 정말 필요한 fork는 이미 있는 "override 경로"로 추가 가능 → **핵심 틀은 아무것도 안 함**이 정답. **(2차 검토 보정)** 게다가 Remotion은 **영리 조직에 라이선스**가 걸려 있어, 도입 시 라이선스 선확인 필요 — 기본 의존으로 넣지 않을 또 하나의 이유.
- **claude-mem의 런타임 엔진 전체(SQLite/벡터DB/백그라운드 워커/훅)** — 별도 프로세스 의존이라 우리 "런타임 의존 0 + Codex 호환" 원칙 위반. 그 아이디어(타입 기록·요약·점진적 회수)는 우리가 이미 문서로 구현함.
- **ui-ux-pro-max의 디자인 DB(스타일 84·팔레트 192·규칙 98…)** — 우리는 "실제 레퍼런스에서 근거를 뽑는" 방식인데, 이건 "정답표 검색" 방식이라 철학 충돌 + 데이터 유지보수 부담. 유일하게 접근성만 가져옴(DS-2).
- **플러그인 마켓·버전 관리·업데이트 알림(marketing-skills/remotion)** — 우리는 "복제해서 시작"하는 틀이라 git 이력이 곧 버전. 마켓 설치 모델은 안 맞음.
- **스킬 강제 자동 호출(superpowers)** — 우리는 일부러 "사용자/메인이 명시 호출"로 설계(ADR-050). 강제 자동 호출은 이 설계와 충돌 + Codex 축소가 약함.

### 조건부 옵션 (기본은 아니고, 프로젝트가 실제로 요구할 때만 — 2차 검토 반영)

아래는 "기본 틀에 넣지는 않되, 특정 프로젝트에서 필요하면 opt-in 어댑터로만" 붙일 것들입니다. 공통 규율: **결과는 DESIGN_RESEARCH.md 등에 출처(provenance)를 남기고, 승인된 결정만 정식 문서(DESIGN.md 등)로 정규화.**

- **Google Stitch를 concept 생성기로(옵션)** — Stitch(코드·디자인 입력 → 실시간 steering, 공식 Agent Skills 제공)를 **필수 도구가 아니라 선택적 concept generator**로. 단 계정·도구 의존이라 **기본 의존 금지**(ADR-027#amend-2), UI 프로젝트가 원할 때만.
- **마케팅/랜딩 UI 한정 포지셔닝 필드(marketing-skills)** — 마케팅·랜딩 화면을 만들 때에 한해 `audience / JTBD / objection / proof / voice / key action`을 **기존 Discovery·Feature 문서 필드에 매핑**(별도 마케팅 SSOT·스킬 설치는 안 함). 카피 품질(§10 Voice)과 자연히 이어짐. 이건 "마케팅 스코프 도입"이 아니라 **랜딩 카피의 근거를 기존 문서에 적는** 수준.

각 항목을 실제 개선 작업으로 옮길 때 참고용. (`대상` = 무엇을 고치나, `추천` = AI 의견, `결정` = 당신이 채움)

| ID | 덩어리 | 심각도 | 고칠 대상 | 출처 | AI 추천 | 당신의 결정 |
|---|---|---|---|---|---|---|
| RD-1 | 밀스톤 | 큰 개선 | ADR-057 amend(또는 R3 의미 바뀌면 supersede) + plan-milestone(R3 seed·R0 reconcile) + STRUCTURE | 분석 | ✅ **결정됨**(얇은 forward) | Done/Now/Next/Later·baseline shell(critique refined) |
| **DS-3** | 디자인 | **P1 (Phase1·최우선)** | R2/R6 렌더 + 320 reflow + populated axe + **repair loop** + reviewer 픽셀 | 분석+**4차실험** | **강하게 채택 (진짜 지렛대)** | ✅ full 렌더+320+populated axe+repair — 4트리거 **대체** |
| **DS-2** | 디자인 | **P1 (Phase1)** | **reviewer a11y 차원** + populated axe hard gate + §9 WCAG2.2 + 수동 smoke | ui-ux-pro-max+실측+**4차실험** | 강하게 채택 | |
| **DS-7** | 디자인 | **P1 (Phase1)**↑ | **category state**(interactive/data/static) + responsive **invariant** + tabular→§3 | 분석+ui-ux+**4차실험** | 채택(상태 paperwork -46%) | |
| DS-1 | 디자인 | P2 (**Phase2·축소**) | R0 **evidence-on-demand**(role3·coverage정지·최종3–5) + researcher 핀URL | 실측+미니검증+**4차실험** | **축소 채택** (5축·쿼터·tier·Radix만능 폐기) | ✅ 축소형 |
| DS-5 | 디자인 | P1 (Phase2) | 카드 **REFINE/EXPLORE**(signature=task 설명 시만) + §1 정체성 | 분석+2차+**4차실험** | 채택 | ✅ 풀(REFINE/EXPLORE 형태) |
| DS-4 | 디자인 | P1 (Phase3) | R5-1 transition map(현재→행동→다음→복구→owner) + plan-workitem·validate-plan 소비 | 분석 *(가설 — static 실험이 화면전환 미검증)* | 조건부 채택(다화면·복구 흐름) | |
| DS-6 | 디자인 | P2 (Phase3) | §8 **semantic motion contract**(수치=token 시작값) | SOTA *(가설 — static 실험이 실제 모션 미검증)* | 채택(의미 중심) | |
| HN-2 | 안정성 | P1 | ADR-047 하위절(변경 검증법 = 정적 checker + 행동 fixture 분리) | superpowers(+remotion+mkt) | **강추** | |
| HN-1 | 안정성 | **P2** (4차 하향) | 문서 링크 체커 + 기존 preflight roster 통합 (**"스킬 누락" 전제는 오류**) | remotion | 축소 채택 | |
| HN-4 | 안정성 | P2 | DELEGATION_STRATEGY + ADR-050(사전판정 금지) | superpowers | 채택 | |
| HN-5 | 안정성 | P2 | ADR-010 규율(도구별 memory 비캐노니컬 — Codex도 memory 있음) + 시작 체크리스트 | claude-mem | 채택 | |
| HN-3 | 안정성 | P2 | 스킬 설명문(트리거+형제참조) | marketing-skills | **보류**(실 오호출 재현 시) | |
| HN-6 | 안정성 | 조건부 | index-first recall만 잔존(red-team=ADR-053 기존·fixture→HN-2·frontmatter→HN-1) | marketing/claude-mem | 대부분 흡수 | |

**거버넌스(3묶음, ADR-045 D6)**: ① 신규 **Design Workflow ADR**(ADR-049 supersede — DS-1/3/5) · ② **ADR-027 consolidated 재발행**(DESIGN 내용 — DS-2/5/6/7) · ③ **ADR-056 focused amendment**(R5 transition map — DS-4). ADR "amendment"로 처리하던 이전 표기는 폐기.

**추천 착수 순서 (4차 실험으로 역전 — 게이트 먼저, 리서치 나중)**:
- **Phase 0 — 문서 정규화**: 본문·§2 요약표·§부록 최종표는 5차 검토로 정합 정리 **완료**. 남은 것: 정정 블록(2·3·4차)을 changelog로 축소 + 각 항목에 evidence level·구현 status 컬럼 분리. **여전히 untracked 세션 메모이므로 정책화(3 ADR) 전엔 정책 근거로 인용 금지.**
- **Phase 1 — 측정 가능한 수용 게이트(진짜 지렛대)**: DS-2(reviewer a11y + populated axe) · DS-3(R2/R6 렌더·320 reflow·독립 리뷰·repair loop) · **DS-7의 320/responsive invariant**(값싼 결정적 검사). 기존 Playwright/axe 재사용, 새 runtime 0.
- **Phase 2 — 얇은 synthesis**: DS-1(evidence-on-demand·최소 schema) · DS-5(REFINE/EXPLORE) · **DS-7의 category-state 문서화**(설계 문서 작업이라 게이트 아님). mandatory 축·tier·쿼터 금지.
- **Phase 3 — UX 연결·polish**: DS-4(transition map + downstream consumer) · DS-6(semantic motion). Google lint/Stitch는 optional adapter.
- **HN 트랙**(독립 병행): HN-2(변경 검증법·강추) → HN-1(링크 체커·축소) → HN-4/5(규율 한 줄). HN-3 보류.
- **RD-1(로드맵)**: 별도 라운드에서 초안화(critique refined: **Done/Now/Next/Later** · baseline 빈 shell · validate-plan/repair-plan/WORKFLOW surface 포함. 진짜 rolling-wave로 R3 의미가 바뀌면 amend가 아니라 **superseding ADR** 검토).
- **거버넌스 3묶음**: 신규 Design Workflow ADR(ADR-049 supersede) · ADR-027 consolidated 재발행 · ADR-056 focused amendment.
> ⚠️ 이 순서는 "리서치부터 키우는" 이전 판(DS-1 우선)을 **역전**한 것 — 실험에서 리서치 강화는 평균 미적 향상 0이었고, acceptance loop만 defect를 5/8→0/8로 바꿨기 때문.

> **검토 라운드별 갈린 지점(투명하게)**: ㉠ 로드맵 **템플릿 파일** — 안 둠(단일 인스턴스, YAGNI). ㉡ **variance/motion 다이얼 통째 도입** — 안 함(divergence 카드·Motion §8과 중복 → **density·정체성만**). ㉢ **렌더 리뷰** — *(4차 실험으로 정정: 이전엔 "비용 때문에 옵션"이라 했으나 320 실패 반례 + Playwright 선설치로 **full 모드 항상 렌더 + 320/populated-axe 상시**로 확정 — 옵션 아님).*

> 근거가 되는 상세 분석·실측 기록은 이번 세션의 9-에이전트 분석 결과(밀스톤 설계 / 디자인 감사 / 레퍼런스 실측 / SOTA 리서치 / 외부 레포 5개)에 있습니다. 실측 요지: 오픈소스 토큰 패키지 5개 추출 성공 / 실제 제품 페이지 3개 추출 실패(0/3).
