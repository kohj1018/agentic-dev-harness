# IMPROVE-GUIDE.md — DESIGN.md 디자인 워크플로우 강화 실행 가이드

> 이 문서는 **실행 가이드**다. 위에서 아래로 순서대로 따라 하면 모든 개선이 완료된다.
> 각 변경은 **AS-IS(기존) → TO-BE(변경)** 블록으로 박혀 있으니, AS-IS를 그대로 찾아 TO-BE로 바꾸면 된다.
> 표기된 `line NN`은 *원본(미편집) 파일* 기준 위치 힌트다 — 같은 파일에 여러 편집을 적용하면 번호가 밀리니, 번호가 아니라 **AS-IS 텍스트로 찾는다**.
> 모든 변경이 끝나면 마지막 §8 통합 검증 체크리스트를 돌린다.
>
> 작성 기준일: 2026-05-26 / 대상 브랜치: main

---

## 0. 이 가이드가 다루는 것

칼럼("디자인 킬러 DESIGN.md 워크플로우 6단계")과 두 건의 분석을 종합·검증한 결과,
이 보일러플레이트는 이미 칼럼의 ❶(DESIGN.md=SSOT)·❷(Stitch 포맷)·❻(Don'ts 구조)을 **칼럼보다 더 엄밀하게** 구현하고 있다.
따라서 "새 도구 도입"이 아니라 **기존 surface의 실효 강화 + 사용자 요청 신규 1건**만 채택한다.

### 0-1. 검증된 외부 사실 (직접 확인 완료)

| 주장 | 검증 결과 | 출처 |
|------|-----------|------|
| Stitch 공식 spec canonical 섹션 = 8개, **Motion 없음** | ✅ 사실. Overview/Colors/Typography/Layout/Elevation&Depth/Shapes/Components/Do's and Don'ts. "present should appear in the sequence listed" | google-labs-code/design.md `docs/spec.md` |
| `@google/design.md lint` CLI 실재 | ✅ 사실. `npx @google/design.md lint DESIGN.md`. 7 룰(broken token ref / missing primary / WCAG contrast / orphaned token / **section ordering** 등), exit 1 on error, JSON 출력 | google-labs-code/design.md `README.md` |
| Impeccable 슬롭 패턴 개수 | ✅ **37패턴** (칼럼의 "24"는 구버전). 25 deterministic(`npx impeccable detect`) + 12 LLM(critique). 8 카테고리 | impeccable.style/slop |
| Codex `bootstrap-design` wrapper 누락 = "drift" | ❌ **틀린 진단.** ADR-010 amend2 + README가 `bootstrap-design`을 *자연어 호출 4종*으로 **의도적 분류**. wrapper 추가는 ADR-010과 모순 → 기각 | `docs/90-decisions/boilerplate/ADR-010-multi-agent-compatibility.md` amend 2 |

### 0-2. 결정 요약

**채택 (6건):**

| ID | 개선 | 가치 | 복잡도 | 근거 |
|----|------|------|--------|------|
| **A** | `bootstrap-design`에 **R5 — 라이브 HTML/CSS 시안 + 검토 루프 + 검토 후 시안 삭제** 신설 (사용자 요청) | 매우 높음 | 중 | plan 전 시각 확인 → 잘못된 방향을 코드 전에 차단. 검토 후 삭제 → drift 원천 제거. taste-skill(이미지생성 의존)보다 가볍고 도구중립 |
| **B** | DESIGN.md `## 9` Don'ts + reviewer `[Design-donts]`에 **anti-slop 패턴 흡수** | 높음 | 낮음 | ADR-027 #7("Don'ts = LLM 정확도 단일 최대 기여")이 직접 지지. Impeccable 37패턴 재료 확보 |
| **C** | `@google/design.md lint` **optional stack guardrail** (UI+Node, 강제 X) | 중 | 낮음 | broken token/contrast/section order를 기계적으로 catch. ADR-025 "권장만" 선례 정합 |
| **D** | Motion 섹션 = **의도된 확장 명문화** (재배치/재번호 **안 함**) | 중(정합성) | 매우 낮음 | ADR-027 #5가 "canonical 채택"이라며 비-canonical Motion을 끼운 내부 불일치 정정 |
| **E** | `bootstrap-design` R0에 **reference-evidence grounding** (옵션) | 중 | 낮음 | R0가 LLM 기억에만 의존하는 한계 보완. MCP/라이브러리는 *옵션*, 기본 의존 X |
| — | 위 정책을 **ADR-027 Amendment 2**로 박음 (선행 작업) | — | — | 보일러플레이트 규율: 정책 = ADR SSOT (STRUCTURE.md "새 정책 도입 시") |

**기각 (4건) — 근거는 §7 참조:**
Codex `bootstrap-design` wrapper / Mobbin·Lazyweb MCP 기본 연결 / taste-skill·image-to-code 기본 lifecycle 편입 / DESIGN.md repo root 이동.

### 0-3. 실행 순서 + 영향 파일 맵

먼저 **§1 (ADR-027 amend 2)** 를 박고 — 정책 SSOT가 먼저 존재해야 나머지가 그것을 인용한다 — 그 다음 A→B→D→C→E 순으로 진행한다.

| 단계 | 편집 파일 |
|------|-----------|
| §1 ADR | `docs/90-decisions/boilerplate/ADR-027-interface-decision-allocation.md`, `docs/90-decisions/boilerplate/README.md` |
| §2 Item A | `.claude/skills/bootstrap-design/SKILL.md`, **임시 생성 후 삭제** `docs/20-system/design-preview.html`(스킬이 생성·삭제), `docs/00-meta/STRUCTURE.md`, `docs/00-meta/WORKFLOW.md`, `README.md`, `README_ko.md` |
| §3 Item B | `docs/20-system/DESIGN.md`, `.claude/agents/reviewer.md` |
| §4 Item D | `docs/90-decisions/boilerplate/ADR-027-...md`, `docs/20-system/DESIGN.md` |
| §5 Item C | `.claude/skills/stack-guard/SKILL.md` |
| §6 Item E | `.claude/skills/bootstrap-design/SKILL.md` |

> ⚠️ **주의**: 여러 문서가 `## 8` / `## 9`를 쓰지만 **DESIGN.md 맥락**의 번호만 본 가이드 대상이다. Charter `## 9 핵심 가정`, ARCH `## 8 품질 속성`, TASK `## 9 의존성` 등은 **건드리지 않는다**.

> **커밋 전략**: §1~§6 각각을 **독립 커밋 1개**로 나눈다 (AGENTS.md "작고 논리적인 단위"). 실행 순서(§1→A→B→D→C→E)대로 커밋하면 하위 surface 커밋이 *이미 커밋된 ADR-027 amend 2*를 참조한다. 각 섹션 끝에 한 줄 커밋 메시지를 박아 뒀다 (ADR-008 Conventional Commits).

---

## 1. [선행] ADR-027 Amendment 2 작성

`docs/90-decisions/boilerplate/ADR-027-interface-decision-allocation.md` 파일 **맨 끝**(현재 마지막은 `## 참고` 섹션, line 102~106)의 **뒤에** 아래 블록을 그대로 추가한다.

```markdown

## Amendment 2 — 디자인 워크플로우 실효 강화 (시안 / anti-slop / lint / Motion 정합)

### 배경
- amend 1이 cross-surface enforcement(예방/회수/peer review)를 박았으나, *시각 결정의 사전 확인*은 여전히 텍스트(DESIGN.md)뿐 — 사용자가 plan 전에 "실제로 어떻게 보이는지"를 확인할 자리가 없었다.
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
- Codex `bootstrap-design` wrapper 추가 — ADR-010 amend 2가 자연어 호출 4종으로 의도 분류. (R5로 사용 빈도가 크게 늘면 Phase 3에서 ADR-010 측 재평가 — 본 ADR 범위 아님.)
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
```

그리고 ADR 인덱스를 갱신한다. `docs/90-decisions/boilerplate/README.md`를 열어 **ADR-027 행**을 찾는다. 그 행이 amendment를 표기하는 형식(예: 끝에 "(amend 1)")이면 동일 형식으로 **"amend 2"**를 덧붙인다. (인덱스가 amendment를 표기하지 않는 형식이면 행 변경 없이 넘어간다 — 본 가이드는 인덱스 형식을 강제하지 않는다.)

> **커밋 메시지** (한 줄): `docs(boilerplate): add ADR-027 amend2 (design preview, anti-slop, design.md lint, Motion)`

---

## 2. Item A — `bootstrap-design` R5: 라이브 HTML/CSS 시안 + 검토 루프 + 정리 (최우선)

**목표**: `/bootstrap-design`이 DESIGN.md를 채운 뒤(R4), 그 토큰/컴포넌트만으로 **브라우저로 바로 열리는 자기완결 HTML 시안**을 생성한다. 사용자가 눈으로 확인 → 피드백 → (DESIGN.md 수정 → 재생성) 루프 → 승인 후 **시안 삭제** → `/plan-workitem`으로 진행. 이렇게 디자인 완성도를 코드 작성 *전에* 끌어올린다.

> **SSOT 원칙 (절대 규칙)**: `design-preview.html`은 DESIGN.md의 *파생 뷰*다. 피드백은 **항상 DESIGN.md를 먼저 고치고** preview를 재생성한다. preview를 먼저 편집하지 않으며, 검토가 끝나면 삭제한다 (ADR-005). 다시 필요하면 DESIGN.md로부터 R5 단독 실행으로 재생성한다.

### 2-1. 산출물 정의 — `docs/20-system/design-preview.html`

이 파일은 스킬(R5)이 **생성**한다(가이드에서 손으로 만들지 않음). **검토용 임시 산출물**이며 R5-3에서 삭제된다(영속 산출물 아님). R5가 만들어야 할 구조를 §2-2에 체크리스트로 박는다. 파일 상단에는 항상 아래 헤더 주석이 들어가야 한다(스킬이 박음):

```html
<!--
  GENERATED FROM docs/20-system/DESIGN.md — 검토용 임시 파일(검토 완료 시 삭제). 직접 편집 금지.
  SSOT는 DESIGN.md. 수정은 DESIGN.md를 고친 뒤 /bootstrap-design R5로 재생성.
  생성 기준: <DESIGN.md 갱신 시각 / 생성 일시>
-->
```

### 2-2. `.claude/skills/bootstrap-design/SKILL.md` 편집

#### (a) `## 모드` 단락 — `--fast`에 R5 처리 추가

**AS-IS** (line 20~22):
```markdown
## 모드
- `--fast`: R0(레퍼런스 1개) + R1(원칙 1줄 minimal) + R2(토큰) + R4(저장 — 축약 섹션). **R3(컴포넌트 인벤토리)만 생략** — R4 저장은 *생략하지 않는다* (생략하면 DESIGN.md 가 안 채워져 skill 목적 무산). R1은 *완전 생략 금지* — R2 토큰 결정의 근거가 되므로 *minimal 1줄*(예: "monochrome + 1 accent")이라도 채운다.
- 기본: R0~R4 모두.
```

**TO-BE**:
```markdown
## 모드
- `--fast`: R0(레퍼런스 1개) + R1(원칙 1줄 minimal) + R2(토큰) + R4(저장 — 축약 섹션). **R3(컴포넌트 인벤토리)·R5(시안)는 생략** — R4 저장은 *생략하지 않는다* (생략하면 DESIGN.md 가 안 채워져 skill 목적 무산). R1은 *완전 생략 금지* — R2 토큰 결정의 근거가 되므로 *minimal 1줄*(예: "monochrome + 1 accent")이라도 채운다. `--fast`에서 시안이 필요하면 종료 후 사용자가 "design-preview 생성"을 명시 발화 → R5만 단독 수행.
- 기본: R0~R5 모두.
```

#### (b) `## R4` 뒤에 `## R5` 라운드 신설

`## R4 — docs/20-system/DESIGN.md 저장` 단락(line 72~74) **바로 뒤**, `## 종료 후`(line 76) **앞에** 아래 블록을 삽입한다.

````markdown
## R5 — 라이브 시안(design-preview.html) 생성 + 검토 루프 + 정리 (ADR-027 amend 2 결정 21·22)

> 목적: plan 으로 넘어가기 *전에* 사용자가 시각 방향을 눈으로 확인·확정한다. DESIGN.md 가 *SSOT*, preview 는 *검토용 임시 파일* (ADR-005 — preview 직접 편집 금지 / 검토 완료 후 삭제).

### R5-1. 생성
- `docs/20-system/DESIGN.md` 의 토큰·컴포넌트만으로 **단일 자기완결 HTML** `docs/20-system/design-preview.html` 를 생성한다 (빌드·외부 의존 0 — CSS 는 `<style>` 인라인).
- DESIGN.md `## 2~6` 토큰은 `:root { --token: value; }` CSS custom property 로 옮기고, 모든 요소가 *그 변수만* 참조하게 한다 (DESIGN.md 가 SSOT 임이 구조로 드러나도록 — raw hex 직접 사용 금지).
- 파일 상단에 GENERATED 헤더 주석(아래) 필수:
  ```html
  <!--
    GENERATED FROM docs/20-system/DESIGN.md — 검토용 임시 파일(검토 완료 시 삭제). 직접 편집 금지.
    SSOT는 DESIGN.md. 수정은 DESIGN.md → /bootstrap-design R5 재생성.
    생성 기준: <DESIGN.md 갱신 시각 / 생성 일시>
  -->
  ```
- preview 가 포함할 섹션(순서):
  1. **Tokens** — color(primitive/semantic/component) swatch + hex + 텍스트 대비비 표시 / typography scale(각 size·weight 샘플) / spacing scale(시각 막대) / radius·shadow 샘플.
  2. **Components** — DESIGN.md `## 7` 인벤토리의 각 컴포넌트를 8 상태(default/hover/active/focus/disabled/loading/error/empty)로 나란히 렌더. hover/active/focus 는 CSS pseudo + *상태 클래스 변형*(예: `.is-hover`)을 둘 다 둬서 정적 캡처에서도 보이게 한다.
  3. **대표 화면 2~3개** — charter `## 2.1 페르소나` / `## 3.1 핵심 시나리오` 에 기반한 실사용 맥락(예: 랜딩 hero / 입력 폼 / 카드 리스트·대시보드 패널). 토큰이 실제 화면에서 어떻게 보이는지 확인용.
- 생성 직후 DESIGN.md `## 9 Do's and Don'ts` 위반을 self-check 해 위반 의심 항목을 출력에 보고(자동 차단 X).

### R5-2. 검토 루프
- 사용자에게 안내: *"브라우저에서 `docs/20-system/design-preview.html` 를 열어 확인하고 피드백 주세요."*
- 피드백 수령 시 **반드시 DESIGN.md(SSOT) 를 먼저 수정** → 그 다음 preview 재생성. (preview 를 먼저 고치지 않는다.)
- 사용자가 *승인*할 때까지 반복. 승인 전에는 R5-3(삭제) 와 `/plan-workitem` 권장을 수행하지 않는다.
- `--fast` 에서는 R5 를 생략(위 `## 모드`). 사용자가 명시 요청 시 R5 만 단독 수행.

### R5-3. 정리 (시안 삭제)
- 검토가 끝나고 사용자가 시안을 *승인*하면 `docs/20-system/design-preview.html` 를 **삭제**한다. 시안은 검토용 임시 산출물이고, 확정된 시각 결정은 이미 DESIGN.md(SSOT)에 반영돼 있으며, 필요하면 언제든 R5 단독 실행으로 재생성 가능하다.
- 삭제 후 사용자에게 "시안 검토 완료 — design-preview.html 삭제됨 (재생성: `/bootstrap-design` R5)" 1줄 안내.
- **예외**: 사용자가 *명시적으로 보존을 요청한 경우에만* 파일을 유지하고, 이때는 `.gitignore` 에 `docs/20-system/design-preview.html` 추가를 권장(영속 commit 방지 — DESIGN.md 와의 drift 회피).
````

#### (c) `## 종료 후` + `마지막 출력` — 승인 게이트 + 시안 삭제 반영

**AS-IS** (line 76~83):
```markdown
## 종료 후
- 사용자가 `/clear` 권장. R0~R4가 인터랙션 길어지면 다음 task의 컨텍스트에 잡음.

마지막 출력:
- `docs/20-system/DESIGN.md` 경로
- 채워진 섹션 요약
- 남은 열린 질문
- 다음 권장 단계 (`/plan-workitem` 또는 `/implement-workitem`)
```

**TO-BE**:
```markdown
## 종료 후
- 사용자가 `/clear` 권장. R0~R5가 인터랙션 길어지면 다음 task의 컨텍스트에 잡음.

마지막 출력:
- `docs/20-system/DESIGN.md` 경로
- design-preview 시안 상태: 삭제됨(승인 후 — 기본) / 유지(보존 요청 시) / 미생성(`--fast`). 재생성: `/bootstrap-design` R5
- 채워진 섹션 요약
- 남은 열린 질문
- 다음 권장 단계: **사용자가 시안을 승인한 뒤** `/plan-workitem` (또는 `/implement-workitem`). 미승인 상태면 "시안 검토·피드백 먼저" 안내.
```

### 2-3. `docs/00-meta/STRUCTURE.md` — 산출물 표 + canonical owner

#### (a) 산출물 표에 행 추가

**AS-IS** (line 31 — design 행):
```markdown
| design (UI only) | `docs/20-system/DESIGN.md` | `/bootstrap-design` (UI 스택 포함 시) | Living | conditional |
```

**TO-BE** (design 행 **바로 아래**에 1행 추가):
```markdown
| design (UI only) | `docs/20-system/DESIGN.md` | `/bootstrap-design` (UI 스택 포함 시) | Living | conditional |
| design preview (UI only, 검토용 임시 — 승인 후 삭제) | `docs/20-system/design-preview.html` | `/bootstrap-design` (R5, 검토 후 삭제) | ephemeral | conditional |
```

#### (b) Canonical Owner 매핑 — DESIGN.md 행 갱신

**AS-IS** (line 91):
```markdown
| UI 시각 디자인 | `docs/20-system/DESIGN.md` |
```

**TO-BE**:
```markdown
| UI 시각 디자인 | `docs/20-system/DESIGN.md` (SSOT). 검토용 파생 뷰 `docs/20-system/design-preview.html` 는 `/bootstrap-design` R5 가 *DESIGN.md 로부터* 생성하고 검토 완료 후 삭제 — 직접 편집·영속 금지 (ADR-027 amend 2 / ADR-005). |
```

### 2-4. `docs/00-meta/WORKFLOW.md` §2 — 시안 승인 게이트

**AS-IS** (line 10):
```markdown
- `docs/20-system/DESIGN.md`는 baseline placeholder(presence: conditional). UI 프로젝트는 `/bootstrap-design`이 본 파일을 채우고, 비-UI 프로젝트는 fork 직후 본 파일을 삭제한다.
```

**TO-BE**:
```markdown
- `docs/20-system/DESIGN.md`는 baseline placeholder(presence: conditional). UI 프로젝트는 `/bootstrap-design`이 본 파일을 채우고, 비-UI 프로젝트는 fork 직후 본 파일을 삭제한다.
- UI 프로젝트는 `/bootstrap-design` R5가 `docs/20-system/design-preview.html`(DESIGN.md 파생 뷰, 검토용 임시 파일)을 생성한다. **사용자가 시안을 브라우저로 확인·승인한 뒤** R5가 시안을 삭제하고 `/plan-workitem`으로 진행 권장 (ADR-027 amend 2 결정 21).
```

### 2-5. `README.md` / `README_ko.md` — 흐름 한 줄

`README.md` "Overall Flow" 코드블록(line 18~28)에서:

**AS-IS** (line 21):
```
  → /bootstrap-design (frontend only — fills DESIGN.md)
```

**TO-BE**:
```
  → /bootstrap-design (frontend only — fills DESIGN.md + a temporary design-preview.html for review, removed after approval)
```

`README_ko.md`의 대응하는 동일 흐름 줄도 같은 취지로 갱신한다(예: `→ /bootstrap-design (프론트 전용 — DESIGN.md 채움 + 검토용 임시 design-preview.html 생성, 승인 후 삭제)`). 정확한 한국어 문구는 README_ko.md의 기존 표현 톤에 맞춘다.

### 2-6. preview staleness 검사 — 불필요 (의도적 비채택)

시안은 R5-3에서 검토 완료 후 삭제되므로 **stale 될 수 없다**. 따라서 `stabilize-milestone`에 preview staleness 검사를 추가하지 않는다 (복잡도 절감 — 삭제 정책이 staleness 문제를 원천 제거). `stabilize-milestone/SKILL.md`는 본 Item A에서 **편집하지 않는다**.

> **커밋 메시지** (한 줄): `feat(boilerplate): add bootstrap-design R5 live design-preview with review loop and cleanup`

---

## 3. Item B — anti-slop Don'ts 강화

**근거**: ADR-027 #7이 이미 *"Don'ts = LLM 정확도 향상 단일 최대 기여"*라고 박았다. Impeccable 37패턴(검증됨)에서 *현 목록에 없는 대표 룰*만 흡수한다. 외부 skill은 편입하지 않고 **룰 텍스트만** 보일러플레이트 자체 규율로 가져온다.

### 3-1. `docs/20-system/DESIGN.md` `## 9` 편집

**AS-IS** (line 38~46):
```markdown
## 9. Do's and Don'ts
<!-- explicit prohibition:
     - 색 5색 이내 / raw hex 금지
     - Inter·Roboto·Arial 디폴트 금지
     - 3-column icon grid 디폴트 금지
     - hierarchy는 size+weight+color 중 2축 이상
     - 한 화면 primary CTA 2개 이상 금지
     - 모든 motion에 `prefers-reduced-motion` 분기
     - 모든 컴포넌트에 ## 7 의 8 상태 매트릭스 정의 (특히 empty/loading/error 누락 빈번) -->
```

**TO-BE**:
```markdown
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
     [anti-slop 추가 — Impeccable 37패턴에서 흡수, ADR-027 amend 2 결정 23]
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
```

### 3-2. `.claude/agents/reviewer.md` 편집

#### (a) `[Design-donts]` 차원 (design surface) 확장

**AS-IS** (line 91):
```markdown
4. **[Design-donts]** — DESIGN.md `## 9. Do's and Don'ts` 명시 위반 (예: primary CTA 2+ / color 5색 초과 / motion `prefers-reduced-motion` 미분기). (P0)
```

**TO-BE**:
```markdown
4. **[Design-donts]** — DESIGN.md `## 9. Do's and Don'ts` 명시 위반. *deterministic 예*(grep 가능): primary CTA 2+ / color 5색 초과 / raw hex / motion `prefers-reduced-motion` 미분기. *LLM-판정 anti-slop 예*(ADR-027 amend 2 결정 23 — grep 어려움): 보라/violet gradient·cyan-on-dark 디폴트, nested cards, gradient heading text, glassmorphism·neon glow, 전면 center-align, 획일적 card grid 반복, icon-tile-above-heading, monospace 장식 남용, bounce/elastic easing, 장식용 sparkline. (P0) *DESIGN.md `## 9` 가 SSOT — 본 목록은 그 일부를 echo한 것이며, 프로젝트의 `## 9` 추가 룰도 함께 점검한다.*
```

#### (b) `[Plan-design]` 차원 — anti-slop 한 구절 추가

reviewer.md line 77 `[Plan-design]` 정의는 길어서 *부분 문자열만* 1회 치환한다 (아래 **찾기** 문자열은 reviewer.md에 유일하게 등장 — line 91 `[Design-donts]`는 "명시 위반"이라 매칭되지 않는다).

**찾기**:
```text
Don'ts` 위반 / **task 본문의 use-case
```
**바꾸기**:
```text
Don'ts` 위반 (anti-slop 패턴 포함 — gradient·nested cards 등) / **task 본문의 use-case
```

> **커밋 메시지** (한 줄): `docs(boilerplate): expand DESIGN.md Don'ts and reviewer with anti-slop patterns`

---

## 4. Item D — Motion = 의도된 확장 명문화 (재배치·재번호 **안 함**)

**근거**: Stitch 공식 spec은 8섹션(Motion 없음)인데 ADR-027 #5가 "canonical 채택"이라며 Motion을 끼웠다 — 내부 불일치. 단 lint의 section-ordering은 canonical 8섹션의 *상대 순서*만 검사하므로 중간 확장 섹션은 위반이 아니다 → **재번호 churn 없이 ADR 문구와 DESIGN.md 노트만 정직하게 고친다.**

### 4-1. ADR-027 결정 #5 정정

**AS-IS** (line 19):
```markdown
5. UI DESIGN.md는 Stitch DESIGN.md canonical 섹션 순서 채택 (Overview / Colors / Typography / Layout / Elevation & Depth / Shapes / Components / Motion / Do's and Don'ts).
```

**TO-BE**:
```markdown
5. UI DESIGN.md는 Stitch DESIGN.md canonical **8섹션** 순서 채택 (Overview / Colors / Typography / Layout / Elevation & Depth / Shapes / Components / Do's and Don'ts) **+ Motion 확장 섹션**. 공식 spec 8섹션에 Motion 은 없으나, 본 보일러플레이트는 a11y·UX 가치(Material 3 motion)를 위해 Motion 을 Components 와 Do's and Don'ts 사이에 *의도적으로 확장*한다 (amend 2 결정 24). lint 의 section-ordering 은 canonical 8섹션의 상대 순서만 보므로 중간 확장은 위반이 아니다 — 재번호하지 않는다.
```

### 4-2. `docs/20-system/DESIGN.md` `## 8 Motion` 헤더 노트

**AS-IS** (line 35~36):
```markdown
## 8. Motion
<!-- duration/easing + `prefers-reduced-motion` 분기. Material 3 기준: 라우팅 UI 160~240ms, entrance/exit 240~360ms -->
```

**TO-BE**:
```markdown
## 8. Motion
<!-- (보일러플레이트 확장 섹션 — Stitch 공식 canonical 8섹션 외. 근거: Material 3 motion / a11y. ADR-027 amend 2 결정 24)
     duration/easing + `prefers-reduced-motion` 분기. Material 3 기준: 라우팅 UI 160~240ms, entrance/exit 240~360ms -->
```

> ℹ️ `bootstrap-design` R4의 섹션 순서 줄(line 73)과 ADR-027 line 66("DESIGN.md `## 8. Motion` 근거")은 **현 번호(## 8)를 유지하므로 변경 불필요**. 재번호하지 않기로 했으니 reviewer.md / stabilize-milestone.md의 `## 9 Do's and Don'ts` 참조도 **그대로 둔다**.

> **커밋 메시지** (한 줄): `docs(boilerplate): clarify Motion as intentional extension beyond Stitch 8 sections`

---

## 5. Item C — `@google/design.md lint` optional stack guardrail

**근거**: 실재하는 CLI(검증됨). broken token ref / WCAG contrast / orphaned token / section ordering을 기계 검증 → 현재 deterministic 디자인 검사(raw hex grep 1종)를 보강. ADR-025 "권장만"·GUARDRAILS "런타임 종속 강제 X" 선례 정합 → **강제 아님, UI + Node 한정 권장 텍스트.**

### 5-1. `.claude/skills/stack-guard/SKILL.md` 섹션 추가

`## Secret scanner 권장 (전 스택, ADR-021)` 단락(line 159~164) **뒤**, `## CI 권장 출력 (ADR-025)`(line 166) **앞**에 아래 블록을 삽입한다.

````markdown
## DESIGN.md lint 권장 (UI + Node 계열 한정, ADR-027 amend 2 결정 25)
- **조건**: `docs/20-system/DESIGN.md` 존재(UI 프로젝트) **그리고** 스택이 Node 계열(npx 사용 가능)일 때만.
- **권장 명령** (강제 X, shared 기본값 미등록 — 사용자가 채택 시 `validate` 의 lint 단계 또는 CI에 wiring):
  ```bash
  npx @google/design.md lint docs/20-system/DESIGN.md
  ```
- 검사 항목: broken token reference / missing primary color / WCAG contrast / orphaned token / **section ordering** 등. exit 1 on error.
- **Motion 확장 주의**: 본 보일러플레이트는 Motion 을 canonical 8섹션 외 확장으로 둔다(ADR-027 amend 2 결정 24). lint 의 section-ordering 은 canonical 8섹션 상대 순서만 보므로 통과하지만, 만약 특정 버전이 비-canonical 섹션을 경고하면 그 경고는 *무시 가능*(의도된 확장).
- 비-Node 스택·비-UI 프로젝트는 본 항목 skip. *GUARDRAILS_STRATEGY "OS·런타임 종속 자동화 강제 X" 정합 — npm 의존이라 shared 기본값에는 넣지 않는다.*
````

> **커밋 메시지** (한 줄): `docs(boilerplate): recommend optional @google/design.md lint in stack-guard (UI+Node)`

---

## 6. Item E — R0 reference-evidence grounding (옵션)

**근거**: 현 R0는 LLM *학습 기억*으로 제품을 분해 → 최신성·구체성 한계. 실제 레퍼런스로 근거화하면 median 회귀를 더 막는다. 단 MCP/도구는 **옵션**, 기본 의존 추가 X(도구중립 ADR-010).

### 6-1. `.claude/skills/bootstrap-design/SKILL.md` R0 편집

**AS-IS** (line 33~40):
```markdown
## R0 — 레퍼런스 추출 + 안티-레퍼런스
- 좋아하는 제품 1~3개 (예: Linear / Notion / Stripe / Vercel / Arc / Things)의 시각 메커니즘 분해:
  - color signature
  - typography pairing
  - density
  - motion 톤
- **안티-레퍼런스 1~2개 필수**: "purple gradient generic SaaS 같지 말 것", "indigo-on-slate Tailwind 디폴트 회피".
- architect 단발 sub-call로 분해 가능.
```

**TO-BE**:
```markdown
## R0 — 레퍼런스 추출 + 안티-레퍼런스
- 좋아하는 제품 1~3개 (예: Linear / Notion / Stripe / Vercel / Arc / Things)의 시각 메커니즘 분해:
  - color signature
  - typography pairing
  - density
  - motion 톤
- **안티-레퍼런스 1~2개 필수**: "purple gradient generic SaaS 같지 말 것", "indigo-on-slate Tailwind 디폴트 회피".
- architect 단발 sub-call로 분해 가능.
- **(옵션) reference-evidence grounding** (ADR-027 amend 2 결정 26 — 기본 의존 추가 X, *가용한 것*만): 사용자 제공 URL/스크린샷, 또는 연결돼 있다면 MCP 화면 리서치(lazyweb 무료 / mobbin 유료), 또는 사전추출 라이브러리(refero.design / getdesign.md)에서 1~3개 레퍼런스를 근거로 본다. 본 것에서 *what to borrow* / *what to avoid* 를 각 1줄씩 추려 DESIGN.md `## 1 Overview` 에 남긴다. **MCP·계정 도구를 보일러플레이트 기본 의존으로 추가하지 않는다** — agent 가 기본 브라우징 불가하면 사용자가 URL·스크린샷을 직접 제공.
```

> **커밋 메시지** (한 줄): `docs(boilerplate): add optional R0 reference-evidence grounding to bootstrap-design`

---

## 7. 기각 항목 + 근거

| 기각 항목 | 출처 | 기각 근거 |
|-----------|------|-----------|
| Codex `bootstrap-design` wrapper 추가 | 다른 AI #1 | **사실관계 오류.** ADR-010 amend 2 + README가 `bootstrap-design`을 자연어 호출 4종(discover-product/review-doc/boilerplate-context/bootstrap-design)으로 **의도 분류**. wrapper 추가는 ADR-010과 모순. (R5로 사용 빈도 급증 시 ADR-010 Phase 3에서 재평가 — 지금 아님) |
| Mobbin·Lazyweb MCP 기본 연결 | 칼럼 ❹ / 다른 AI | 계정·요금(mobbin 유료)·환경 의존 → shared 기본값 부적합 (GUARDRAILS / ADR-010). Item E에서 *옵션*으로만 흡수 |
| taste-skill·image-to-code 기본 lifecycle 편입 | 칼럼 ❺ / 다른 AI | 이미지생성 모델 의존 + 도구 종속 + 산출물·승인 단계 폭증(TDD lifecycle 충돌). **Item A(R5)가 더 가볍고 도구중립적으로 동일 목적(코드 전 시각 확인) 달성** |
| DESIGN.md repo root 이동 | 칼럼 ❶ 전제 / 다른 AI도 기각 | ADR-027 #8이 `docs/20-system/` 배치를 의도 결정. 문서 계층·SSOT 정합. 외부 도구가 root만 찾으면 root stub ad-hoc |
| Motion 섹션 재배치/재번호 | 다른 AI #2 | lint는 canonical 8섹션 상대순서만 검사 → 중간 확장은 위반 아님. 재번호는 reviewer×3 + stabilize×1 참조 churn만 발생. **Item D(문구 명문화)로 대체** |
| `/critique` Nielsen 휴리스틱 UX 평가 신설 | 칼럼 ❻ | 안티슬롭(미감)과 다른 축(사용성). reviewer에 차원 통째 신설 = 순수 신규 scope. 칼럼 핵심 가치와 결 다름 → 필요 시 별도 ADR |

---

## 8. 통합 검증 체크리스트

모든 변경 후 아래를 확인한다.

- [ ] **§1** `ADR-027` 파일 끝에 `## Amendment 2` 블록 존재 + 결정 21~26 + 비결정 + 마이그레이션 + Ratchet 강도 기재.
- [ ] **§1** `docs/90-decisions/boilerplate/README.md` ADR-027 행 amendment 표기(형식상 해당 시).
- [ ] **§2 (A)** `bootstrap-design/SKILL.md`에 `## R5`(R5-1 생성 / R5-2 검토 루프 / **R5-3 시안 삭제**) 존재, `## 모드`가 R0~R5 / `--fast` R5 생략 반영, `마지막 출력`이 승인 게이트 + 시안 삭제 안내 반영.
- [ ] **§2** `STRUCTURE.md` 산출물 표에 `design preview` 행(lifecycle: **ephemeral** — 검토 후 삭제) + Canonical Owner의 DESIGN.md 행 갱신.
- [ ] **§2** `WORKFLOW.md` §2에 preview 승인 게이트 + 삭제 줄.
- [ ] **§2** `README.md`/`README_ko.md` Overall Flow에 design-preview(임시·승인 후 삭제) 언급.
- [ ] **§2** `stabilize-milestone/SKILL.md`는 **변경하지 않았다** (staleness 검사 비채택 — §2-6).
- [ ] **§3 (B)** `DESIGN.md ## 9`에 anti-slop 10룰 추가, `reviewer.md`의 `[Design-donts]`·`[Plan-design]` 확장.
- [ ] **§4 (D)** `ADR-027 #5` 문구 정정(8섹션 + Motion 확장), `DESIGN.md ## 8 Motion` 헤더 노트. (재번호 안 함 — reviewer/stabilize의 `## 9` 참조는 그대로인지 확인.)
- [ ] **§5 (C)** `stack-guard/SKILL.md`에 `## DESIGN.md lint 권장` 섹션.
- [ ] **§6 (E)** `bootstrap-design/SKILL.md` R0에 옵션 reference-evidence grounding.
- [ ] **회귀 확인**: Charter `## 9`, ARCH `## 8`, TASK `## 9` 등 **DESIGN.md 아닌** 문서의 섹션 번호는 변경되지 않았다.
- [ ] **(선택)** 실제 UI 프로젝트에서 `/bootstrap-design` 실행 → `design-preview.html`이 브라우저로 열리고 토큰/8상태/대표화면이 보인 뒤, 승인 시 삭제되는지 1회 dogfood.
- [ ] **(있으면)** `markdown-link-check docs/**/*.md` 또는 repo의 link 검사로 새 cross-reference 깨짐 없음 확인.

---

### 부록 — 외부 출처 (검증에 사용)
- Stitch DESIGN.md spec (canonical 8섹션): `https://github.com/google-labs-code/design.md/blob/main/docs/spec.md`
- `@google/design.md` CLI(lint/diff/export): `https://github.com/google-labs-code/design.md`
- Impeccable 37 slop patterns: `https://impeccable.style/slop`
- (배경) prg.sh "Why Your AI Keeps Building the Same Purple Gradient" — ADR-027 기존 인용
