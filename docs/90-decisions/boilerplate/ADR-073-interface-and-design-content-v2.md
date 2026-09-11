# ADR-073 — 인터페이스 결정 책임 분배 + DESIGN.md 내용 계약 v2

> scope: boilerplate
> area: design

## Status
accepted

> 대체: [ADR-027](ADR-027-interface-decision-allocation.md)을 통합 재발행으로 supersede한다(개정 8개 + surface 5+ 도달 — ADR-045 D6·ADR-027#amend-8 예고). ADR-027은 `superseded`로 history 잔존. 디자인 워크플로우(라운드·리서치·게이트·시안 카드) SSOT는 [ADR-058](ADR-058-design-workflow.md), 화면 프로토타입·UI 제작 계약은 [ADR-072](ADR-072-design-milestone-and-code-prototype.md)가 소유한다. 본 ADR은 **DESIGN.md 내용 + ARCH 7-x 인터페이스 할당 + cross-surface enforcement + UI 판정 절차**만 소유한다.

## 현재 유효 결정
- (본문 D1~D13이 net 규칙이다 — 개정 없음. 개정이 4개에 이르면 이 절을 요약으로 채운다.)

## 배경
- [외부실증] LLM은 시각 결정 입력이 없으면 median 미감으로 수렴한다(prg.sh purple gradient). 명시적 결정 자리가 없으면 매 task 즉흥 결정한다. (ADR-027 배경 승계)
- [관측됨] DESIGN.md에 플랫폼 축이 없어 웹+앱 프로젝트가 한 파일로 두 표면을 기술할 수 없고, 폰트는 «1~2 family» 한 줄뿐이며, §10은 한국어 기본값 하나로 언어별 규칙·서비스 전체 일관성 규칙이 없다(사용자 fork 보고).
- [관측됨] §9 glassmorphism 금칙의 예외가 «브랜드 근거»뿐이라 플랫폼 관례(예: iOS 26 Liquid Glass)를 따르는 앱이 근거 없이 위반으로 잡힌다.
- [관측됨] DESIGN 근거 자료(Google design.md spec, DTCG, Material 3, HIG, WCAG)의 확인일이 어디에도 없어 «최신인가»를 판단할 수 없다.
- ADR-027 개정 8개 누적 + 본 라운드가 surface 5+를 추가하므로 통합 재발행한다(ADR-045 D6).

## 결정

### D1. 자리 배분 (ADR-027 결정 1·2·4·8·9·15 + #amend-8 승계)
- 시각·문구 결정은 `docs/20-system/DESIGN.md`(UI 한정). 인터페이스 결정은 `ARCHITECTURE_OVERVIEW.md ## 7-1`(API)·`## 7-2`(CLI)·`## 7-3`(백엔드)·`## 7-4`(프론트)·`## 7-5`(모바일). `/bootstrap-stack`이 7-1~7-5를 채우고 비해당 sub-section은 통째 삭제한다(모바일은 7-5, 웹 화면이 함께 있을 때만 7-4 병존). 7-x 소항목의 authority는 ADR-060 D9, 카탈로그 행은 ADR-071 D3.
- 운영성 ↔ 7-1 경계: trace ID·log 포맷·관측 stack = 운영성 / 응답 envelope·error 레지스트리·네이밍 = 7-1.
- repo root `DESIGN.md`를 두지 않는다. ARCHITECTURE 섹션 비대화는 «있을 때만 채움»으로 수용한다.

### D2. DESIGN.md 섹션 구성
Stitch canonical 8섹션(Overview / Colors / Typography / Layout / Elevation & Depth / Shapes / Components / Do's and Don'ts) + 확장 3개: `## 8. Motion`(Components와 Do's 사이), `## 10. Voice & Writing`(Do's 뒤), `## 11. 기준 자료`(맨 끝). lint의 section-ordering은 canonical 상대 순서만 보므로 확장은 비위반이며 재번호하지 않는다. 토큰은 3-tier DTCG(primitive → semantic → component), fenced yaml 또는 frontmatter.
- `## 0. Status` 아래에 **표면→프로필 매핑표**를 둔다(D3).
- `## 1 Overview`: 원칙 3~5개 + 긍정적 정체성(design thesis / signature mechanism / imagery·icon / contextual density) + `[디자인 리서치](DESIGN_RESEARCH.md)` 링크 + `선택 concept:` 한 줄 + **§9 예외 근거(있으면)**.
- **절별 내용 계약(ADR-027#amend-7 승계 — 규칙 텍스트는 DESIGN.md 각 절 주석이 소유)**: §1 긍정적 정체성(thesis·signature·imagery·density) / §3 tabular figures + 폰트 블록(D4) / §4 responsive invariant(content order·container transition·table strategy·sticky occlusion·320 reflow·text fit·essential-2D exception) / §7 category state(interactive: default·hover·active·focus-visible·disabled[+loading] / data·screen: default·loading·empty·error·success / static: 없음, 역할별 semantic 상태 추가) / §8 semantic motion 5항목(목적·빈도·실행·접근성·금지 + Material 3 시작 default) / §9 D5 / §10 D6 / §11 D7.

- **`## 4` 의 수치 결정은 산문이 아니라 토큰 블록으로 적는다 (2026-09-11)**: container max-width·gutter·spacing scale 처럼 **코드가 참조해야 하는 값**은 `## 2` 색 토큰과 같은 형식의 블록에 둔다. 산문에만 있으면 R6-1 배선이 그것을 CSS 변수·Dart 상수로 내보내지 못하고, 그 결정을 구현하는 코드는 값을 **하드코딩할 수밖에 없다** — 그러면 `--tokens-only` 가 그 코드를 위반으로 잡는다. **결정은 있는데 참조할 토큰이 없어서 생기는 위반**이며 dogfood Round 12 에서 6건이 그렇게 나왔다(`min-w-[480px]`·`min(…, 960px)` — DESIGN `## 4` 가 「모바일 max-width 480dp, 관리자 웹 max-width 960px」을 산문으로 확정했다). 반응형 invariant 6종처럼 **판정 규칙**은 산문이 맞다 — 코드가 참조하는 것은 값이지 규칙이 아니다.
### D3. 디자인 프로필 (웹 + 앱 한 파일)
- `## 0`의 매핑표: `| surface | profile | platform | 기준 뷰포트 | 공유 모드 |`. 예: `admin | admin-web | web | 1280×900, 375×812 | 공통+delta` / `customer | consumer-mobile | native/android, native/ios | 390×844, 360×800 | 공통+delta`.
- **공유 모드**는 `/bootstrap-design` R1에서 사용자가 고른다(`authority: user-choice`): `대부분 공통`(프로필 delta 최소) / `공통+delta` / `독립`(프로필별 전 절). 원장 등재 + `## 0` 앵커.
- 프로필별 차이는 §2~§10 각 절 안에 `### profile: <name>` 하위 블록으로 **delta만** 적는다. 하위 블록이 없는 절은 전 프로필 공통이다. 단일 프로필 프로젝트는 표 1행 + delta 블록 없음.
- 기준 뷰포트 기본값: 웹 `1280×900`·`375×812`(+ 게이트 넘침 검사 전용 `320×720`), 앱 `390×844`·`360×800`. 태블릿은 범위에 있을 때만 추가. 글자 확대 1.3배 상태는 권장 항목.
- 소비자: design gate 매니페스트(ADR-072 D3 — profile → 뷰포트), design-milestone 화면 배정, stabilize §3-V 스냅샷 크기, e2e target별 진입점(ADR-059#amend-1).

### D4. §3 Typography — 폰트 결정 블록
`## 3`에 아래 항목을 **모두** 채운다(`(해당 없음)` 명시 허용): 조합(display/body/mono) · fallback stack · 라이선스 확인(사용자가 직접 확인, 확인일) · 전달 방식(self-host / CDN / 앱 번들) · weight 세트 · CJK 행간·자간 · 숫자 정렬(tabular-nums — 표·정렬 열 필수) · 로딩 전략(`font-display`·preload / 앱은 번들) · 모바일 번들 크기 상한. **결정은 실제 서비스 문장(charter 시나리오 카피)을 R6 테마 쇼케이스로 렌더해 본 뒤 내린다**(ADR-058#amend-4). 폰트 조합은 `authority: user-choice`(Decision Brief, 추천 블록은 사용자가 요청할 때만).

### D5. §9 Do's and Don'ts (ADR-027 결정 7 · #amend-2 결정 23 · #amend-7 결정 2 승계)
- 기존 규율(5색·raw hex 금지·디폴트 폰트 금지·2축 위계) + WCAG 2.2 a11y(대비 4.5:1/3:1, 포커스 링, 키보드, accessible name, 색-단독 금지, primary CTA 1개, reduced-motion, category state) + anti-slop(보라 gradient·nested cards·gradient heading·glassmorphism/neon·전면 center·획일 grid·icon-tile·monospace 장식·bounce easing·장식 sparkline) + 클래스 레벨 규율(브랜드 근거 없는 유행 fontstack 금지).
- **예외 근거 2종 (시각 스타일 금칙 한정)**: anti-slop·기존 시각 규율(glassmorphism·neon, 보라 gradient, 유행 fontstack 등) 중 하나를 채택하려면 `## 1 Overview`에 근거를 적는다 — (a) **브랜드 근거** 또는 (b) **플랫폼 관례**(예: iOS 26 Liquid Glass 머티리얼, Material 3 Expressive 표현). 근거 없는 채택은 위반이다. **§9의 `[접근성 — WCAG 2.2]` 블록에는 예외가 없다** — 브랜드·플랫폼 관례는 접근성 요구를 면제하지 못한다(본 ADR `## 정책 강도`가 a11y를 제약(강)으로 분류한 것과 정합).
- reviewer `[Design-donts]`·`[Design-a11y]`가 미러(ADR-027 #amend-7 결정 7 승계).

### D6. §10 Voice & Writing v2 — 언어별 블록 + 검토 렌즈 + 일관성
- **언어별 하위 블록**: `### 한국어`, `### English`, (추가 언어). 각 블록에 (a) 어조·존댓말·CTA 스타일, (b) 내부용어→사용자 언어 번역표, (c) 금지 표현 — `[grep 가능]` 정규식 / `[LLM-판정]`, (d) 표면별 예시 카피 4종(버튼/에러/빈 상태/확인 다이얼로그), (e) **검토 렌즈**.
- **검토 렌즈(한국어)**: 토스 UX writing 8원칙을 체크 질문으로 — 예상 가능한 힌트 / 잡초 제거 / 빈 문장 지우기 / 핵심 메시지에 집중 / 말하듯 쉽게 / 강요 대신 제안 / 보편적인 단어 / 숨은 감정 찾기 — 각 질문에 «이 카피가 통과하는가»를 designer 자기 점검·reviewer `[Design-voice]`가 본다. **Humanize KR(im-not-ai) A~J 범주는 AI 문체 탐지 렌즈로만** 쓴다(범주 이름만 등재, 변경률 임계값·자동 치환은 UI 문구에 적용하지 않는다 — 문구는 짧아 통계가 성립하지 않는다).
- **검토 렌즈(English)**: sentence case, 능동태, plain language, 명령형 CTA, 약어 최초 전개.
- **서비스 전체 일관성**: 같은 행동은 같은 동사(예: 저장/보관 혼용 금지), 같은 상태는 같은 표현, 같은 대상은 같은 명사 — `### 용어 사전` 표(대상 | 한국어 | English | 금지 동의어)를 §10에 둔다. `/design-milestone` R3 브리프 카피는 이 표를 먼저 읽는다.
- **검토 시점**: 카피는 사용자 승인 **전**에 reviewer `[Design-voice]`가 본다(design-milestone R3 — ADR-072).
- 기본값 채움 + `/bootstrap-design` R1 «채택 or 변경» 1회 확인은 유지. 비-UI 삭제 경로 유지. FEATURE §8-1 copy 톤은 «§10 대비 feature-특이 delta만»(ADR-042#amend-1 승계).

### D7. §11 기준 자료 (확인일 기록)
`## 11. 기준 자료` 표: `| 자료 | 확인일 | 확인한 버전·일자 | 적용 변경점 |`. «최신 갱신» 같은 포괄 문구 대신 확인한 사실만 적는다. baseline 초기 행:
| Google design.md spec (Stitch canonical) | 2026-09-11 | alpha (spec.md) | 섹션 순서·lint |
| W3C DTCG | 2026-09-11 | 2025.10 stable (2025-10-28) | 3-tier 토큰 |
| Material 3 Expressive | 2026-09-11 | 최초 공개 2025-05-13 · I/O 2026 업데이트 세션 존재 | 모션·형태 default 참고 |
| Apple HIG (Liquid Glass) | 2026-09-11 | iOS 26 | §9 플랫폼 관례 예외 근거 |
| WCAG | 2026-09-11 | 2.2 (3.0 draft) | §9 a11y |
| Toss UX writing 8원칙 | 2026-09-11 | 2022-11-15 | §10 한국어 렌즈 |
| Humanize KR (im-not-ai) | 2026-09-11 | v2.3.2 (2026-08) | §10 A~J 렌즈 |
baseline 행의 확인일은 **실제로 확인한 날짜**만 적는다 — 위 값은 2026-09-11 설계 시 확인한 것이며, 실행 시점이 다르면 researcher로 재확인해 확인일을 갱신하고, 확인하지 못한 행은 확인일을 비운다(빈 확인일 = 미확인). `/bootstrap-design --update`와 `/design-milestone` R0가 이 표의 확인일이 12개월을 넘으면 researcher 재확인을 권장한다(자동 갱신 아님).

### D8. cross-surface enforcement (ADR-027#amend-1 결정 16~20 · #amend-6 승계)
- `/plan-workitem` 필수 read-list에 DESIGN.md(UI) + ARCH 7-x(해당 스택); self-check에 «DESIGN `## 7` 인벤토리 외 컴포넌트 신설? raw hex? 7-1 envelope 외 응답? §10 정합?».
- `/validate-plan` Plan Quality `[Plan-design]`(UI) + `[Plan-arch-iface]`(해당 스택).
- `/stabilize-milestone` preflight 5: raw hex grep(웹·Dart) + voice grep + 인벤토리 drift + 7-x Don'ts grep + DESIGN draft 잔존.
- TASK `## 7`·FEATURE `## 11`에 `Design:`·`Architecture-Iface:` 자리.
- design-surface reviewer 입력에 렌더 증거(§3-V 갤러리 + **승인 스냅샷**(ADR-072 D4) + visual-qa 결과) 주입, Read로 열람.

### D9. UI 판정 다중신호 절차 (ADR-027#amend-3 + #amend-8 결정 4 통합)
1. `docs/20-system/DESIGN.md` 부재 → 비-UI 확정.
2. 존재 + `## 0. Status` ≠ `draft` → UI 확정.
3. 존재 + `draft` → 추가 신호: (a) ARCH `## 7-4` **또는** `## 7-5` 활성, (b) 대상 workitem 산하 task `## 7`에 `Design:` 링크 또는 UI 키워드(`component/컴포넌트/page/페이지/screen/view/UI/frontend/프론트/widget/위젯`). 신호 ≥1 → UI 의심(경고 + 활성). 0 → skip.
각 skill은 압축 인라인 3-case를 유지하고 `상세: ADR-073 D9`로 인용한다.
- **UI 마일스톤 판정(ADR-072 소비)**: UI 프로젝트에서 산하 feature 중 하나라도 `## 11` `Design:` 줄이 있으면 UI 마일스톤이다.

### D10. lint 권장 (ADR-027#amend-2 결정 25 승계)
UI + Node 계열에서만 `/stack-guard`가 `@google/design.md lint`를 권장 텍스트로 낸다(강제 X). Motion·Voice·기준 자료 확장 섹션 경고는 무시 가능.

### D11. `--update` 내용 규칙 (ADR-027#amend-4 승계 — 라운드 구조는 ADR-058)
delta 갱신: 미변경 토큰·§1~§11 구조 보존, 전면 재작성 X. 프로필 추가·공유 모드 변경·폰트 교체는 되돌리기 비용이 커 ADR(project) 권장.

### D12. Codex 비대칭 (ADR-027#amend-2 비결정 승계)
`/bootstrap-design` Codex wrapper는 두지 않는다(자연어 호출 — README SSOT, ADR-010#amend-3).

### D13. 비결정 (영구 No — ADR-027 승계)
DESIGN_SYSTEM 광의 SSOT / 영역별 3파일 분리 / UI의 ARCHITECTURE 흡수 / Mobbin·Lazyweb MCP 기본 연결 / taste-skill·image-to-code 기본 편입 / repo root DESIGN.md / 플랫폼별 DESIGN 파일 분리(본 라운드 — 프로필로 대체).

## 외부 근거
- (ADR-027 외부 근거 7종 승계 — Stitch spec, DTCG, designproject.io, Brad Frost, Material 3 motion, prg.sh, Smashing naming)
- [외부실증] Toss — 토스의 UX writing 8원칙 (2022-11-15). Humanize KR v2.3.2 (github epoko77-ai/im-not-ai, 2026-08). Apple HIG Liquid Glass (iOS 26). WCAG 2.2.

## 대안과 제약 (ADR-053)
- 플랫폼별 DESIGN 파일 분리 — 읽기 쉽지만 공통 규칙이 두 파일에서 어긋난다. 기각.
- §10을 별도 VOICE.md로 — 파일 분리 기각(ADR-056 비결정 승계).
- 채택: 단일 파일 + 프로필 delta + 언어별 §10.

## 신뢰도
Medium — 내용 계약 확장의 효과는 design-eval 방법으로 재측정 전 [가설]. a11y·anti-slop은 승계분([외부실증]).

## 재검토 트리거
1. 프로필 delta 블록이 절마다 생겨 «독립» 모드가 사실상 되면 파일 분리 재검토.
2. §10 렌즈가 `[Design-voice]` 오탐을 유의하게 늘리면 LLM-판정분 후퇴.
3. §11 확인일 12개월 초과 자료가 3개 이상이면 researcher 일괄 재확인 라운드.

## 정책 강도 (ADR-022)
- 제약(강, [외부실증]/[관측됨] 승계): D5 a11y grep 가능분·anti-slop, D8 `[Plan-design]`·`[Plan-arch-iface]`·preflight 5.
- enabling(약): D3 프로필, D4 폰트 블록, D6 렌즈·용어 사전, D7 기준 자료.

## Mutation Contract (ADR-047 D3)
1. Target — `docs/20-system/DESIGN.md`(§0 매핑표·§3 폰트 블록·§9 예외 근거·§10 언어별·§11) / `.claude/skills/bootstrap-design/SKILL.md`(R1 공유 모드·폰트, R3 폰트 렌더, R5 §10·§11) / `.claude/agents/reviewer.md`(`[Design-voice]` 렌즈, 스냅샷 증거) / `.claude/agents/designer.md`(용어 사전·렌즈 자기 점검) / `.claude/skills/{plan-workitem,validate-plan,stabilize-milestone,validate-workitem}/SKILL.md`·`.claude/agents/{validator,builder}.md`(ADR-027 인용 재지정 + D9 인용) / 템플릿 2종 / `docs/00-meta/{STRUCTURE,WORKFLOW}.md`.
2. Failure mode — 플랫폼 축 부재로 웹+앱 프로젝트가 DESIGN을 둘로 쪼개거나 한쪽만 적음 / 폰트 결정이 이름 한 줄로 끝나 라이선스·로딩·CJK 문제가 구현 중 드러남 / §10이 언어·일관성 규칙 없이 즉흥 카피 / 플랫폼 관례가 위반으로 오판 / 기준 자료 노후 미감지 (전부 관측됨).
3. Predicted improvement — 웹+앱 dogfood(Round 12)에서 DESIGN 1파일로 두 프로필 렌더 / 폰트 블록 9항목 충원 / `[Design-voice]`가 용어 사전 위반을 잡음 / §11 확인일 존재.
4. Preserved invariants — DESIGN.md 시각 SSOT / canonical 8섹션 상대 순서 / 3-tier 토큰 / 비-UI 삭제 경로 / 취향 오라클=사용자 / ADR-058 라운드 SSOT / ADR-060 D9 authority.
5. Falsifying evaluation — Round 12에서 프로필 delta가 §2~§10 전 절에 생기면(사실상 독립) D3 재검토 / 폰트 블록 항목이 `(해당 없음)`으로만 채워지면 D4 항목 축소 / `[Design-voice]` 오탐률이 리뷰 항목의 절반을 넘으면 D6 렌즈 축소.
6. Rollback path — 본 ADR을 supersede하는 후속 ADR로 ADR-027 net 규칙을 재채택하고 §0 매핑표·§3 블록·§10 언어별·§11을 제거한다(ADR-027 status는 되돌리지 않는다 — ADR-045).

## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT. 실제 파일 경로 1행 1개)
- docs/20-system/DESIGN.md                            — D2·D3·D4·D5·D6·D7
- docs/20-system/ARCHITECTURE_OVERVIEW.md              — D1 `## 7-1`~`## 7-5`
- .claude/skills/bootstrap-design/SKILL.md            — D3 공유 모드·D4 폰트·D6·D7·D11
- .claude/skills/bootstrap-stack/SKILL.md             — D1 7-x 채움/삭제
- .claude/skills/bootstrap-stack/output-checklist.md  — D1 7-4/7-5 생략 안내
- .claude/skills/plan-milestone/SKILL.md              — D9 UI 마일스톤 판정
- .claude/skills/plan-workitem/SKILL.md               — D8 read-list·self-check, D9
- .claude/skills/validate-plan/SKILL.md               — D8 [Plan-design]·[Plan-arch-iface]
- .claude/skills/stabilize-milestone/SKILL.md         — D8 preflight 5, D9 §5-1
- .claude/skills/validate-workitem/SKILL.md           — D8 인터페이스 CHECK
- .claude/skills/stack-guard/SKILL.md                 — D10 lint 권장
- .claude/agents/reviewer.md                          — D5·D6·D8 Design Consistency
- .claude/agents/validator.md                         — D8 인터페이스 CHECK
- .claude/agents/builder.md                           — D1 인터페이스 SSOT 열거
- .claude/agents/designer.md                          — D6 렌즈·용어 사전
- docs/30-workitems/_templates/TASK_TEMPLATE.md       — D8 `Design:`·`Architecture-Iface:`
- docs/30-workitems/_templates/FEATURE_TEMPLATE.md    — D8 `Design:`·`Architecture-Iface:`
- docs/00-meta/WORKFLOW.md                            — D2 승인 게이트·프로필
- docs/00-meta/STRUCTURE.md                           — 산출물·Canonical Owner

## 참고
- ADR-027(superseded — 본 ADR이 승계), ADR-031(직접 지원 범위 — 새 스택 진입 시 D1에 `## 7-N` 자리 신설), ADR-058(워크플로우), ADR-072(프로토타입·UI 제작 계약), ADR-056(superseded → ADR-072), ADR-060 D9, ADR-071 D3, ADR-042#amend-1, ADR-059 D7, ADR-045, ADR-022.

## Amendment 1 (2026-09-12) — 폰트 «전달 방식» 결정에 대응하는 배선 단계가 없다

### 배경
D4 는 `## 3` 폰트 결정 블록에 **전달 방식(self-host / CDN / 앱 번들)**을 요구한다. 그런데 그 결정을 **실제 로딩까지 끌고 가는 단계가 어디에도 없다.** dogfood Round 12 가 그 공백을 전부 통과했다.

- [관측됨] DESIGN `## 3` 은 **Pretendard 단일 · mono `(해당 없음)` · 전달 방식 self-host** 를 확정했다(후보 2조합 비교·선택 근거까지 채워진 정상 블록이다).
- [관측됨] `apps/web/src/app/layout.tsx` 는 `create-next-app` 스캐폴드가 심은 **`Geist`·`Geist_Mono`(next/font/google)** 를 그대로 로드한다. DESIGN 이 기각한 패밀리이고 `mono` 는 「해당 없음」인데 살아 있다.
- [관측됨] `apps/web/src/styles/tokens.css` 는 `--font-family-base: "Pretendard Variable", system-ui, …` 로 **이름만** 선언한다. `@font-face` 도 폰트 파일도 없다 — **패밀리 이름을 CSS 변수에 쓰는 것은 배선이 아니다.** 브라우저는 곧장 fallback 으로 떨어진다.
- [관측됨] Storybook preview 는 `globals.css` 만 import 한다. 따라서 **승인 스냅샷 26장이 결정된 글꼴이 아닌 fallback 으로 찍혔다.** 게이트는 이것을 원리상 못 본다 — 게이트가 보는 것은 스토리 렌더이고, 폰트 로딩은 그 바깥(Next 앱 셸)에 있다.
- [관측됨] Flutter 쪽은 같은 공백이 **다른 증상**으로 났다 — `flutter test` 가 폰트를 로드하지 않아 스냅샷 글자가 전부 tofu 였다(발견 55). **두 플랫폼의 승인 스냅샷이 모두 결정된 글꼴 없이 찍혔고 둘 다 검출되지 않았다.**
- [관측됨] `/bootstrap-design` R6-1 에 방금 박은 그물(「`## 2`~`## 6` 각 절이 최소 1개 토큰을 내보냈는지 확인」 — 발견 61)은 **통과시켰다.** `## 3` 이 `--font-family-base` 를 내보냈기 때문이다. **이름도 토큰이다.**

### 결정
1. **R6-1 은 전달 방식까지 배선한다** — self-host 면 폰트 파일 + `@font-face`(또는 프레임워크의 local-font 경로), 앱 번들이면 `pubspec.yaml` `fonts:` 선언과 asset 파일. **패밀리 이름을 CSS 변수·테마에 쓴 것은 배선으로 치지 않는다.** 배선하지 않으면 DESIGN `## 3` 에 `- 배선: 미배선 — <사유>` 를 적는다(침묵 금지).
2. **스캐폴드가 심은 폰트를 제거한다** — 수행 0 이 만든 `next/font/google` import, 킷 기본 fontstack 등 DESIGN `## 3` 이 고르지 않은 패밀리는 R6-1 에서 지운다(발견 42 와 같은 계열 — 스캐폴드 결정이 DESIGN 결정보다 오래 산다).
3. **`/design-milestone` 가 두 지점에서 막는다** — R0 preflight 가 DESIGN `## 3` 에 `미배선` 표기를 발견하면 **스냅샷 승인을 진행하지 않고** R6-1 로 돌려보낸다. R6-5 승인 체크리스트에 **「결정 글꼴 실재」**를 더한다(렌더에 그 패밀리가 실제로 적용됐는가).
4. **`/plan-workitem` 3-S 에 축을 더한다** — task `## 3` 의 지시가 **DESIGN 확정 결정과 충돌하지 않는가**(§3 글꼴이 첫 사례다). Round 12 의 T-005 `## 3` step 3 은 「`Geist`/`Geist_Mono` 에 `preload: true` 명시」라고 **기각된 패밀리를 유지하라고 지시**하고 있었다.
5. **그물은 2단계로 둔다** — **1차 정적 검사**(필수): 결정된 패밀리에 대한 **선언이 실재하는가** — 웹은 `@font-face` 또는 `next/font/local`, Flutter 는 `pubspec.yaml` `fonts:`. 선언이 없으면 **blocker**. **2차 런타임 검사**(보고 등급): 렌더 직후 `document.fonts.check('16px "<family>"')` 가 false 면 `report`(차단 아님 — 네트워크·캐시 상태에 좌우된다). Flutter 는 `FontLoader` 로드 여부.

### 근거
- 결정 1 의 핵심은 **「이름 ≠ 배선」** 한 줄이다. 그것이 없으면 R6-1 의 토큰 그물이 계속 통과시킨다 — 실제로 그랬다.
- 결정 5 를 정적/런타임 2단계로 가른 이유: 런타임 검사만 두면 CI·오프라인에서 흔들려 blocker 로 못 쓴다. 정적 선언 검사는 결정론적이라 blocker 로 쓸 수 있고, **이번 실패를 정적 검사만으로 잡을 수 있었다**(`@font-face` 0건 · `pubspec fonts:` 0건).
- 결정 3 을 R0 와 R6 **둘 다**에 건 이유: R0 만이면 배선을 나중에 푼 경우를 못 막고, R6 만이면 화면을 다 그린 뒤에야 막혀 비용이 크다.
- 대가: R6-1 이 폰트 파일을 확보해야 하므로 라이선스 확인(D4)이 **실제 차단 경로**가 된다. 그것이 의도다 — 라이선스 미확인 폰트를 번들하는 것보다 낫다.

### 강도 (ADR-022)
- 제약(강, [관측됨]): 결정 3·5 의 1차 정적 검사.
- 제약(중, [관측됨]): 결정 1·2·4.

### Mutation delta (ADR-047 D3 — 7 필드)
- target = `.claude/skills/bootstrap-design/SKILL.md` R6-1 · `.claude/skills/design-milestone/SKILL.md` R0·R6-5 · `.claude/skills/plan-workitem/SKILL.md` 3-S · `.claude/skills/stack-guard/assets/design-gate.mjs`.
- failure = DESIGN 이 고른 글꼴이 어디에도 로드되지 않은 채 승인 스냅샷이 찍히고, 제품은 스캐폴드 기본 글꼴로 나간다(관측 2건, 웹·Flutter 각 1 — 증상은 fallback 렌더와 tofu 로 달랐다).
- predicted = Round 13 에서 R6-1 종료 시 `@font-face`/`pubspec fonts:` 선언이 실재하거나 DESIGN `## 3` 에 `미배선` 사유가 있다. 게이트 1차 정적 검사 blocker 0.
- preserved = D4 블록 9항목 불변 · 게이트 기존 검사 의미 불변 · 폰트 조합은 여전히 `user-choice`.
- falsifier = (a) 1차 정적 검사가 «선언은 있는데 파일이 없다»를 통과시키는 사례가 1건이라도 나면 검사를 파일 실재까지 넓힌다 (b) 2차 런타임 검사의 `report` 가 3라운드 연속 전부 오탐이면(네트워크·헤드리스 사유) 2차를 제거하고 1차만 남긴다.
- rollback = 본 amend superseded → R6-1 배선 규칙·게이트 폰트 검사 제거, D4 블록만 복원.
- **예산 영향** = `/bootstrap-design` R6-1 의 산출물이 1~2개(폰트 파일·선언) 는다. `designer`·`builder` 의 `maxTurns` 재검토 불필요 — 산출물 4개 상한 안이다.

### 적용 surface
- .claude/skills/bootstrap-design/SKILL.md — 결정 1·2
- .claude/skills/design-milestone/SKILL.md — 결정 3
- .claude/skills/plan-workitem/SKILL.md — 결정 4
- .claude/skills/stack-guard/assets/design-gate.mjs — 결정 5
