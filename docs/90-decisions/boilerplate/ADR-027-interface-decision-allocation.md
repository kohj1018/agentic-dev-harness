# ADR-027 — 인터페이스 결정 책임 분배

> scope: boilerplate

## Status
accepted

## 현재 유효 결정
- 시각 결정은 `DESIGN.md`(UI 한정, Stitch 8섹션 + Motion 확장), 인터페이스 결정은 ARCHITECTURE `## 7-1`(API)/`## 7-2`(CLI)/`## 7-3`(백엔드)/`## 7-4`(프론트)에 둔다.
- **`/bootstrap-design`의 *워크플로우 라운드 구조*(레퍼런스→원칙→시안→토큰→DESIGN.md→preview 순서·시점)는 ADR-049가 supersede(R0~R6 concept-mockup-first + 레퍼런스 노트). 본 ADR은 *DESIGN.md 내용*(아래 #5 Stitch 8섹션+Motion / #6 3-tier 토큰 / #7·#23 Don'ts)과 *ARCH 7-x 인터페이스 할당* SSOT만 유지.** 본 ADR #3/#13/#21/#d22/#d26/#27의 라운드 구조·시안 시점·preview lifecycle(삭제 시점·gitignore 정책) 기술은 historical(net 규칙은 ADR-049). design-preview.html *산출물*은 ADR-049 R6이 계속 사용.
- `/bootstrap-stack`이 7-1~7-4를 채운다.
- cross-surface enforcement(plan/validate-plan/stabilize/templates/reviewer)는 #amend-1이 SSOT. anti-slop·lint·Motion 정정은 #amend-2. UI 판정 다중신호 절차는 #amend-3. `--update`는 #amend-4(라운드 구조는 ADR-049).
- 적용 파일 전체는 아래 `## Surfaces` 참조.

## 배경
- [외부실증] [prg.sh — Why Your AI Keeps Building the Same Purple Gradient](https://prg.sh/ramblings/Why-Your-AI-Keeps-Building-the-Same-Purple-Gradient-Website) — LLM이 시각 결정 입력 없이 생성하면 median 미감(purple gradient generic SaaS)으로 수렴한다. 명시적 결정 자리가 없으면 매 task마다 LLM이 즉흥 결정한다.
- [관측됨] `DESIGN_SYSTEM.md`가 UI / API·백엔드 / CLI 3 그룹 placeholder를 한 파일에 담아 "광의 SSOT" 시도 → 백엔드 개발자에게 misnomer + ARCHITECTURE 운영성 섹션과 책임 중복.
- [관측됨] ARCHITECTURE_OVERVIEW.md에 API 컨벤션·CLI 출력 포맷·백엔드 핵심 결정·프론트 결정 자리 부재 → 첫 구현 시점에 LLM 즉흥 결정.

## 결정 (15개)

1. `DESIGN_SYSTEM.md` → `DESIGN.md` rename + UI 한정.
2. ARCHITECTURE 7-1(API 컨벤션), 7-2(CLI 컨벤션), 7-3(백엔드 결정), 7-4(프론트 결정) sub-section 신설.
3. `/bootstrap-design` skill 신설 (UI 한정, R0~R4 라운드).
4. `/bootstrap-stack`이 7-1/7-2/7-3/7-4 채움 책임 (스택 감지 → architect 단발 sub-call).
5. UI DESIGN.md는 Stitch DESIGN.md canonical **8섹션** 순서 채택 (Overview / Colors / Typography / Layout / Elevation & Depth / Shapes / Components / Do's and Don'ts) **+ Motion 확장 섹션**. 공식 spec 8섹션에 Motion 은 없으나, 본 보일러플레이트는 a11y·UX 가치(Material 3 motion)를 위해 Motion 을 Components 와 Do's and Don'ts 사이에 *의도적으로 확장*한다 (#amend-2 결정 24). lint 의 section-ordering 은 canonical 8섹션의 상대 순서만 보므로 중간 확장은 위반이 아니다 — 재번호하지 않는다.
6. 3-tier DTCG 토큰 모델 (primitive → semantic → component).
7. 영역별 Don'ts 섹션 필수 — LLM 정확도 향상의 단일 최대 기여.
8. **repo root `DESIGN.md` 두지 않음** — 외부 도구 자동 발견 마찰은 사용자가 root stub으로 ad-hoc 해결.
9. **운영성 ↔ 7-1 경계 가이드**: trace ID/log 포맷/관측 stack=운영성. 응답 envelope/error 레지스트리/네이밍=7-1. 흐릿한 영역(error 응답에 trace ID)은 *주된 결정 맥락*으로 판단.
10. **charter 비목표 가이드**: "미적 트렌드 추종(neumorphism, glassmorphism, 그날의 dribbble)"을 비목표로 박을 것 권장.
11. **API/CLI에 R0~R4 같은 라운드 도입 안 함** (YAGNI, ADR-006). API/CLI는 스택·도메인 강결합이라 `/bootstrap-stack`의 architect 단발 sub-call로 충분.
12. **shadcn/ui 권장이지 강제 아님** — ownership 모델(코드 복사)이라 lock-in 약함. R3 스택별 시작점 표 7개 항목이 대안 커버.
13. **`/bootstrap-design --fast` 도입** — R0(레퍼런스 1개) + R1(원칙 1줄 minimal) + R2(토큰). R3·R4 생략.
14. **fork 격리 풀고 메인 세션이 R0~R4 운전** (discover-product 패턴) — `context: fork` 미명시. R0/R1 무거운 추론은 architect 단발 sub-call. 종료 후 사용자 `/clear` 권장.
15. **ARCHITECTURE 11→14 섹션 비대화 수용** — 7-1~7-4는 모두 "있을 때만 채움" 가이드라 비해당 프로젝트는 통째 삭제 가능.

## 비결정 (영구 No)
- DESIGN_SYSTEM 광의 SSOT 유지 — misnomer + 운영성 중복 비용.
- 영역별 3개 파일 분리 (DESIGN / ARCHITECTURE_API / ARCHITECTURE_BACKEND) — 단순성 1순위(ADR-006) 위반.
- UI까지 ARCHITECTURE 흡수 — "시각"과 "구조" 혼합으로 가독성 저하.

## 마이그레이션 (9 surface 변경)
1. `DESIGN_SYSTEM.md` → `DESIGN.md` rename + UI 한정 본문
2. ARCHITECTURE_OVERVIEW.md 7-1/7-2/7-3/7-4 sub-section 신설
3. STRUCTURE.md 산출물 표 갱신
4. STRUCTURE.md Canonical Owner 매핑 4줄 추가
5. bootstrap-project output-checklist.md 갱신
6. AGENTS.md 인덱스 1줄 추가
7. `/bootstrap-design` skill 신설
8. `/bootstrap-stack` skill 본문 갱신 (인터페이스 채움 + 프론트 감지 시 권장 출력)
9. builder / validator self-check 각 1줄 추가

## 시나리오 검증 표

| 시나리오 | DESIGN.md | 7-1 | 7-2 | 7-3 | 7-4 |
|---------|-----------|-----|-----|-----|-----|
| Next.js SaaS | `/bootstrap-design` 채움 | - | - | - | `/bootstrap-stack` 채움 |
| FastAPI 백엔드 | 미생성 | `/bootstrap-stack` 채움 | - | `/bootstrap-stack` 채움 | - |
| Rust CLI | 미생성 | - | `/bootstrap-stack` 채움 | - | - |
| 풀스택 (Next.js + FastAPI) | `/bootstrap-design` 채움 | `/bootstrap-stack` 채움 | - | `/bootstrap-stack` 채움 | `/bootstrap-stack` 채움 |
| RN+Expo (ADR-031 override) | `/bootstrap-design` 채움 (Tamagui) | - | - | - | `/bootstrap-stack` 채움 |
| 라이브러리 패키지 | 미생성 | - | - | - | - |
| UI + root stub | `/bootstrap-design` 채움 + root에 stub 1줄 별도 | - | - | - | - |
| `--fast` prototype | R2(토큰)만 | - | - | - | - |

## 외부 근거

- [Stitch DESIGN.md spec (Google Labs)](https://github.com/google-labs-code/design.md/blob/main/docs/spec.md) — canonical 섹션 순서 채택 (결정 5).
- [W3C DTCG 2025.10 stable](https://www.w3.org/community/design-tokens/) — 3-tier 토큰 모델 표준 (결정 6).
- [designproject.io — How to write a design.md AI agents follow](https://designproject.io/blog/design-md-file/) — Don'ts가 LLM 정확도 향상의 단일 최대 기여 (결정 7).
- [Brad Frost — Agentic Design Systems in 2026](https://bradfrost.com/blog/post/agentic-design-systems-in-2026/) — deliberate constraint 안에서 AI 출력 품질 상한 (결정 1·11 근거).
- [Material 3 — Motion easing/duration](https://m3.material.io/styles/motion/easing-and-duration) — 라우팅 UI 160~240ms / entrance·exit 240~360ms (DESIGN.md `## 8. Motion` 근거).
- [prg.sh — Why Your AI Keeps Building the Same Purple Gradient](https://prg.sh/ramblings/Why-Your-AI-Keeps-Building-the-Same-Purple-Gradient-Website) — LLM median 회귀 진단 (배경).
- [Smashing — Naming best practices for tokens](https://www.smashingmagazine.com/2024/05/naming-best-practices/) — 3-tier kebab-case 컨벤션 (결정 6).

## 후속 작업
- ADR-017 시뮬레이션 Round 2에서 DESIGN.md 채움 효과 측정 (LLM 시각 결정 일관성 delta).
- ADR-017 Round 2 결과에 따라 shadcn 채움 자동화 가치 입증 시 후속 ADR 검토.

<a id="adr-027-amend-1"></a>
## Amendment 1 — Cross-surface enforcement 보강

### 배경
- 본 ADR 마이그레이션 항목 9 ("builder / validator self-check 각 1줄 추가") 만 박았으나, 실측 결과 *예방 surface (plan-workitem) / 회수 surface (stabilize-milestone) / peer review surface (validate-plan)* 에 DESIGN.md / ARCH 7-1~7-4 cross-reference 가 부재.
- 결과: 채워진 SSOT 가 *fork 사용자 보호 역할*을 수행하지 못함 (단순 self-check 1줄만으로는 LLM 미스 확률 큼 + deterministic 보장 X).

### 결정 (5 추가)
16. `/plan-workitem` 의 *반드시 먼저 읽을 파일* 에 `docs/20-system/DESIGN.md` (UI 프로젝트 한정) + ARCH 의 `## 7-1` / `## 7-2` / `## 7-3` / `## 7-4` (해당 스택 한정) 명시.
17. `/plan-workitem` 의 *정합성 self-check* 에 "프론트 task 가 DESIGN.md `## 7. Components` 인벤토리 외 컴포넌트를 신설하는가? raw hex code 가 AC 본문에 박혔는가? API task 가 7-1 envelope/error 컨벤션 외 응답 형식을 박는가?" 추가.
18. `/validate-plan` Plan Quality 차원 8개 → **10개로 확장**: `[Plan-design]` (UI 프로젝트 한정) + `[Plan-arch-iface]` (API/CLI/백엔드/프론트 컨벤션, 해당 스택 한정).
19. `/stabilize-milestone` deterministic preflight 5번째 항목 추가 — UI 프로젝트: raw hex grep + 컴포넌트 인벤토리 drift + DESIGN.md draft 잔존 검사. API/CLI/백엔드/프론트 스택: 7-x Don'ts 위반 grep.
20. `docs/30-workitems/_templates/TASK_TEMPLATE.md` `## 7. 관련 문서` + `FEATURE_TEMPLATE.md` `## 11. 관련 문서` 에 `Design:` (UI 한정) + `Architecture-Iface:` (해당 스택 한정) 자리 신설.

### 마이그레이션 (결정별 적용 위치)
- 결정 16 → `.claude/skills/plan-workitem/SKILL.md` (필수 read-list + self-check 항목)
- 결정 17 → 위와 동일 파일
- 결정 18 → `.claude/skills/validate-plan/SKILL.md` + `.claude/agents/reviewer.md` Plan Quality 8 → 10 차원
- 결정 19 → `.claude/skills/stabilize-milestone/SKILL.md` `### 1.0` deterministic preflight
- 결정 20 → 2개 템플릿 파일

### Ratchet 강도 (ADR-022 정합)
- 결정 16, 17, 20 → enabling (약, [가설] 라벨 허용)
- 결정 18, 19 → constraint (강, [외부실증] 라벨 — ADR-027 본 ADR 의 외부 근거 5종이 충족)

### 후속 작업
- ADR-017 시뮬레이션 Round 3 — #amend-1 적용 후 LLM 시각·인터페이스 일관성 delta 측정.
- #amend-1 적용 후 `.boilerplate/validation/SIMULATION_RUN.md` 에 실측 라운드 추가.

## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT)
- .claude/skills/plan-workitem/SKILL.md            — #amend-1 read-list+self-check, #amend-3 UI 판정
- .claude/skills/validate-plan/SKILL.md             — #amend-1 [Plan-design]+[Plan-arch-iface]
- .claude/skills/stabilize-milestone/SKILL.md       — #amend-1 §1.0 #5, #amend-3 §5-1
- .claude/agents/reviewer.md                         — #amend-1 Plan Quality 10 + Design Consistency + design surface, #amend-2 [Design-donts]
- .claude/skills/implement-workitem/SKILL.md         — task-linked 등록 line item 실행
- .claude/skills/validate-workitem/SKILL.md          — 인터페이스 CHECK
- .claude/agents/validator.md                        — 인터페이스 CHECK 규칙(UI/API/CLI/7-x)
- docs/30-workitems/_templates/TASK_TEMPLATE.md#7    — #amend-1 Design:/Architecture-Iface: 자리
- docs/30-workitems/_templates/FEATURE_TEMPLATE.md#11 — #amend-1 Design:/Architecture-Iface: 자리
- .claude/skills/bootstrap-design/SKILL.md           — #amend-2 §9 Don'ts self-check(R2 생성·R6 점검) + canonical 8섹션 순서(R5 저장), #amend-4 --update; 라운드 구조·시안 시점은 ADR-049
- docs/20-system/DESIGN.md                            — #amend-2 §9 Don'ts, §8 Motion
- .claude/skills/stack-guard/SKILL.md                — #amend-2 design.md lint 권장
- docs/00-meta/WORKFLOW.md                            — #amend-2 §2 승인 게이트

## 참고
- ADR-006 (단순성 1순위)
- ADR-022 (Ratchet Principle — [외부실증] 라벨)
- ADR-031 (비웹 스택 override 경로)

<a id="adr-027-amend-2"></a>
## Amendment 2 — 디자인 워크플로우 실효 강화 (시안 / anti-slop / lint / Motion 정합)

### 배경
- #amend-1이 cross-surface enforcement(예방/회수/peer review)를 박았으나, *시각 결정의 사전 확인*은 여전히 텍스트(DESIGN.md)뿐 — 사용자가 plan 전에 "실제로 어떻게 보이는지"를 확인할 자리가 없었다.
- [외부실증] Stitch 공식 spec(google-labs-code/design.md `docs/spec.md`)의 canonical 섹션은 **8개이며 Motion을 포함하지 않는다**. 본 ADR 결정 #5가 "canonical 순서 채택"이라며 Motion을 Components/Do's 사이에 끼운 것은 *근거 있는 확장*을 canonical로 잘못 라벨링한 내부 불일치.
- [외부실증] `@google/design.md lint` CLI(broken token ref / WCAG contrast / orphaned token / section ordering 등 7룰)가 DESIGN.md를 기계 검증한다 — 현재 deterministic 검사는 stabilize 5-2 raw hex grep 1종뿐.
- [외부실증] Impeccable(impeccable.style)은 AI 슬롭을 37패턴(8 카테고리)으로 정의 — 현 DESIGN.md `## 9` Don'ts(~7항목)보다 훨씬 풍부.

### 결정 (6 추가)
21. **`/bootstrap-design`에 R5(라이브 시안) 신설** — DESIGN.md 토큰/컴포넌트만으로 자기완결 HTML(`docs/20-system/design-preview.html`)을 생성해 사용자가 브라우저로 확인 → 피드백 → DESIGN.md(SSOT) 수정 → preview 재생성 루프. 사용자 승인 후 **시안을 삭제(R5-3)** 하고 `/plan-workitem` 권장. **preview는 derived view** — SSOT는 DESIGN.md, preview를 직접 편집하지 않으며 검토용 임시 산출물로 취급한다 (ADR-005 정합).
22. **산출물 `docs/20-system/design-preview.html`** 신설 (presence: conditional / lifecycle: **ephemeral** — R5-3에서 검토 완료 후 삭제, commit 안 됨). 빌드·외부 의존 0(인라인 `<style>`). 사용자가 *명시적으로 보존을 요청한 경우에만* 유지하며, 그때는 `.gitignore`에 추가 권장(DESIGN.md와의 drift 회피).
23. **anti-slop Don'ts 강화** — Impeccable 37패턴 중 *대표 룰*을 DESIGN.md `## 9` + reviewer `[Design-donts]`(design surface)에 흡수한다. **외부 skill(impeccable/taste)을 lifecycle에 편입하지 않는다** — 룰 텍스트만 보일러플레이트 자체 규율로 흡수 (ADR-006 단순성).
24. **Motion = 의도된 확장 명문화** — 본 ADR 결정 #5의 "canonical" 표현을 *"Stitch canonical 8섹션 + Motion 확장"*으로 정정. DESIGN.md 섹션 번호는 **재배치/재번호하지 않는다**(lint의 section-ordering은 canonical 8섹션의 상대 순서만 보므로 중간 확장 섹션은 위반이 아님 — churn 회피).
25. **`@google/design.md lint` optional stack guardrail** — UI 프로젝트 + Node 계열일 때만 `/stack-guard`가 *권장 텍스트*로 출력. shared 기본값·강제 X (ADR-025 "권장만" 선례 / GUARDRAILS_STRATEGY "OS·런타임 종속 자동화 강제 X" 정합).
26. **R0 reference-evidence grounding (옵션)** — R0에서 사용자 제공 URL / MCP(lazyweb 무료·mobbin 유료) / 라이브러리(refero·getdesign.md) 중 *가용한 것*으로 레퍼런스를 근거화하고 what-to-borrow / what-to-avoid를 DESIGN.md `## 1 Overview`에 1줄씩 남긴다. **MCP 기본 연결·기본 의존 추가 X** (도구중립 ADR-010 / 계정·요금 의존).

### 비결정 (영구 No)
- Codex `bootstrap-design` wrapper 추가 — ADR-010#amend-2가 자연어 호출 4종으로 의도 분류. (R5로 사용 빈도가 크게 늘면 Phase 3에서 ADR-010 측 재평가 — 본 ADR 범위 아님.)
- Mobbin·Lazyweb MCP 기본 연결 — 계정/요금/환경 의존, shared 기본값 부적합.
- taste-skill·image-to-code 기본 lifecycle 편입 — 이미지생성 의존 + 산출물·승인 단계 폭증. 결정 21(R5)이 더 가볍게 동일 목적 달성.
- DESIGN.md repo root 이동 — 본 ADR 결정 #8(의도적 `docs/20-system/` 배치) 유지. root stub은 ad-hoc.

### 마이그레이션 (결정별 적용 위치)
- 결정 21 → `.claude/skills/bootstrap-design/SKILL.md`(R5 라운드 + `--fast` + 마지막 출력), `docs/00-meta/WORKFLOW.md` §2(승인 게이트), `README.md`/`README_ko.md`(흐름)
- 결정 22 → `docs/00-meta/STRUCTURE.md`(산출물 표 + canonical owner). *staleness 검사 불필요* — 시안은 검토 후 삭제되므로 stale 되지 않음.
- 결정 23 → `docs/20-system/DESIGN.md` `## 9`, `.claude/agents/reviewer.md`(`[Design-donts]` + `[Plan-design]`)
- 결정 24 → 본 ADR 결정 #5 본문 + `docs/20-system/DESIGN.md` `## 8 Motion` 헤더 노트
- 결정 25 → `.claude/skills/stack-guard/SKILL.md`
- 결정 26 → `.claude/skills/bootstrap-design/SKILL.md` R0

### Ratchet 강도 (ADR-022 정합)
- 결정 21, 22, 24, 25, 26 → enabling (약 — 새 라운드/산출물/문서 정정/옵션 권장이라 강제력 없음, 되돌리기 쉬움. fork 데이터 회수 후 재평가)
- 결정 23 → constraint (강, [외부실증] Impeccable 37패턴 — reviewer `[Design-donts]` 검수 차원을 tightening)

### 후속 작업
- ADR-017 시뮬레이션 라운드에서 R5 시안 루프의 시각 결정 confidence delta 측정.
- R5 사용 빈도 회수 후 Codex wrapper 승격 여부를 ADR-010 Phase 3에서 재평가.

<a id="adr-027-amend-3"></a>
## Amendment 3 (2026-05-27) — UI 판정 다중신호 절차 단일 SSOT

### 배경
- [관측됨] "UI 프로젝트 판정 다중신호 절차"(DESIGN.md 부재→비-UI / status≠draft→UI / status=draft→추가신호)가 `plan-workitem` 본문과 `stabilize-milestone` §5-1에 *거의 동일한 산문으로 복제*돼 있다 → 지시문 비대 + 한쪽 수정 시 drift.

### 결정 (canonical 절차 — 인용 대상)
**UI 판정 다중신호 절차** (false UI 판정 회피):
1. `docs/20-system/DESIGN.md` 부재 → **비-UI 확정** → UI 관련 회수/cross-check skip + 사유 echo.
2. DESIGN.md 존재 + `## 0. Status` ≠ `draft`(예: accepted/living) → **UI 확정** → 본문 회수 + cross-check 활성.
3. DESIGN.md 존재 + `## 0. Status` == `draft` → *추가 신호* 점검: (a) ARCH `## 7-4. 프론트 결정` 활성, (b) 대상 workitem 산하 task의 `## 7. 관련 문서`에 `Design:` link 또는 본문 UI 키워드(`component/컴포넌트/page/페이지/screen/view/UI/frontend/프론트`). 신호 ≥1 → *UI 의심* → warning 1줄 echo + 본문 회수 + cross-check 활성. 신호 0 → silent skip.

본 절차가 단일 SSOT(상세·근거)다. **단 ADR-019 JIT 정합상 skill은 절차를 매 호출마다 따라야 하므로, 바 참조만 두면 안 된다** — 각 skill은 *압축 인라인 3-case*(부재→비-UI / status≠draft→UI / status=draft+신호≥1→UI 의심)를 유지하고 `상세: ADR-027#amend-3`로 인용한다. 제거 대상은 *장황한 신호 열거 산문*뿐이며, 절차 자체를 skill 밖으로 빼는 게 아니다.

### 적용 surface (압축 인라인 3-case + ADR 인용으로 교체 — 바 참조 X)
- `.claude/skills/plan-workitem/SKILL.md` DESIGN.md read 항목
- `.claude/skills/stabilize-milestone/SKILL.md` §5-1

### Ratchet 강도 (ADR-022)
- enabling(약) — 순수 리팩토링(동작 동일, 산문 단일화).

<a id="adr-027-amend-4"></a>
## Amendment 4 — bootstrap-design --update 모드

### 배경
- [관측됨] discover-product는 `--update`(mid-project pivot)가 있으나 bootstrap-design은 없다 → 대규모 디자인 변경/재디자인 시 처음부터 R0~R5를 다시 돌아야 해 비용·잡음이 크다.

### 결정
27. `/bootstrap-design --update` 신설 — 기존 DESIGN.md가 있을 때 delta 갱신: R0(레퍼런스 재확인, 선택) → 변경 토큰/컴포넌트만 R2/R3 부분 갱신(미변경 토큰·§1~§9 구조 보존, 전면 재작성 X) → R4 저장 → (시각 방향이 크게 바뀌면) R5 시안 재생성·검토 루프. 대규모 재디자인(브랜드/방향 전환)은 결정 근거를 ADR로 남길 것을 권장.

### Ratchet 강도 (ADR-022)
- enabling(약) — 새 모드, opt-in.
