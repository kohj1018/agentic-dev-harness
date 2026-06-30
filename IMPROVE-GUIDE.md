# IMPROVE-GUIDE — 하네스 개선 실행 지시서

이 문서만 보고 위에서 아래로 따라가면 6개 영역 개선이 전부 완료된다.

## 0. 사용법 · 전제 · 규칙

- **순서 엄수**: Phase 1→7은 *의존성 순서*(참조하는 ADR이 항상 먼저 생성됨). 건너뛰지 말 것.
- **각 단계 형식**: `파일` / `기존:`(현재 상태) / `수정:`(삽입 텍스트는 코드블록) / `검증:`.
- **줄번호는 표류한다**: 위치는 *섹션 이름/앵커*로 찾는다.
- **ADR 거버넌스**:
  - **새 ADR**: `## Mutation Contract`(6필드) + `## Surfaces` 필수. `boilerplate/README.md` 인덱스 표에 한 줄.
  - **Amendment**: `### 적용 surface`만(기존 amend 관례 — Mutation Contract 미부착). 부모 ADR이 `## 현재 유효 결정`을 가지고 amend가 4개째가 되면 그 섹션도 sync.
  - **현재 amend 개수**(작성 직전 재확인): ADR-027=4, ADR-038=3, ADR-040=2, ADR-049=0, ADR-051=0, ADR-052=0.
  - **Surfaces 처리**: `## Surfaces`는 코드/문서 surface를 1행 1파일로 — *README·문맥 언급은 등재 금지*(ADR-045#d3, migration 대상은 Mutation Contract Target에만). amend가 *기존 `## Surfaces`에 없던 새 파일*을 건드리면 부모 ADR의 `## Surfaces`에도 `#amend-N` 라벨로 추가하고, 그 파일 본문에 `ADR-NNN` 역참조가 있는지 확인(stabilize Surface-backref 점검 정합). `## Surfaces` 블록이 없는 ADR(ADR-040)은 `### 적용 surface`만.
  - **cross-LLM review는 surface별 별도 ADR**(선례 ADR-044=discovery). 정정성 변경은 amendment로(선례 ADR-038#amend-3) — 본문 in-place 재작성 금지.
- **커밋**: 각 Phase 끝에 `git add <명시 파일들>` 후 제시 메시지. `git add -A`/`.` 금지(ADR-008). 푸시 금지.
- **Codex 패리티**: 본문만 바뀌는 기존 skill은 `.agents` stub이 포인터라 자동 전파. 신규 cross-LLM review skill(validate-milestone)은 ADR-044 선례대로 Codex stub 미생성 — 자연어 호출만(README 목록).

## 작업 총량
- 새 skill 1(`validate-milestone`, Codex stub 없음) · 새 agent 0
- 새 ADR 2(ADR-053 설계패널, ADR-054 stabilize cross-LLM) · amend 4(040#3, 038#4, 049#1, 051#1)
- 새 gitignore lane 1 + 새 디렉터리 1(stabilize-reviews)

## 개선 순서

| Phase | 영역 | 핵심 | ADR |
|---|---|---|---|
| 1 | researcher 품질 | 소스 권위·최신·1차성 + stale-note 정정 | ADR-040#amend-3 |
| 2 | A6 설계 강화 | 문서 양식 + 고-stakes 패널 (한 커밋) | ADR-053(신규) |
| 3 | A3 마일스톤 검증 | validate-plan milestone-mode | ADR-038#amend-4 |
| 4 | A5 동시성 | 공유 런타임 리소스 partition 가드 | ADR-051#amend-1 |
| 5 | A1 디자인 | R0 필수 + §9 클래스룰 + visual-QA | ADR-049#amend-1 |
| 6 | A2 정합 | validate-workitem fossil 라벨 | (없음) |
| 7 | A4 stabilize 병렬 | validate-milestone 신설 + repair 종합 | ADR-054(신규) |

---

# Phase 1 — researcher 품질 규율 + stale-note 정정 (ADR-040#amend-3)

> Phase 2(ADR-053)가 ADR-040#amend-3을 참조하므로 먼저 한다. 한 amend로 (a) 소스 품질 + (b) "Agent 미보유" stale 표현 정정을 묶는다.

### 1.1 `.claude/agents/researcher.md` — 소스 품질 규율 3줄
**기존**: `규칙` 목록에 `- 공식 1차 출처를 2차 블로그보다 우선한다.`
**수정**: 그 줄 *바로 뒤에* 추가.
```markdown
- **소스 품질 능동 선택(ADR-040#amend-3)**: 검색 상위가 아니라 *권위 있는 1차*를 찾아 읽는다. 위계 — ① 공식 문서/공식 레포(README·CHANGELOG·릴리스 노트·*현재 메이저 버전* 문서)·1차 스펙 → ② maintainer/저자 1차 → ③ 평판 2차. SEO팜·aggregator·내용 빈 요약·출처 불명 회피.
- **버전 currency**: 라이브러리는 *현재 메이저 버전을 먼저 확정*하고 그 버전 문서를 읽는다(stale API 회피). 발행일/업데이트일 확인.
- **품질 게이트**: 끌어오기 *전에* 권위·최신·1차성을 평가. 양질 출처를 못 찾으면 약한 정보를 단단한 것처럼 제시하지 말고 "양질 출처 부족"을 명시.
```
**검증**: researcher.md 규칙에 소스 품질 3줄.

### 1.2 stale-note 인라인 포인터 (in-place 재작성 X)
**대상**: `grep -rn "Agent 미보유\|fork+Agent" docs/90-decisions/` 로 발견되는 모든 곳(현재 확인: ADR-040 D5, ADR-040#amend-2 D2; ADR-041에 있으면 동일 처리).
**기존**: 예) ADR-040 D5 `... fork+Agent 미보유 skill(bootstrap-stack 등) ...`. 그러나 bootstrap-stack/bootstrap-project/plan-milestone은 모두 `allowed-tools`에 `Agent` 보유 + 메인 세션 실행이라 researcher 직접 위임 가능(확인됨).
**수정**: 본문을 재작성하지 말고, 각 해당 문장 끝에 인라인 포인터만 부기: ` (→ ADR-040#amend-3 정정 — 이 세 skill은 Agent 보유)`.
**검증**: 각 발생처에 인라인 포인터 + 원문 보존.

### 1.3 `docs/90-decisions/boilerplate/ADR-040-external-research-capability.md` — Amendment 3
**기존**: 마지막 amend는 `## Amendment 2`. ADR-040은 `## Surfaces` 블록 없음(`### 적용 surface`만 사용).
**수정**: 본문 끝에 추가.
```markdown
<a id="adr-040-amend-3"></a>
## Amendment 3 (2026-06-30) — 소스 품질 규율 + Agent-보유 stale note 정정
### 결정
1. **소스 품질 능동 선택**: researcher는 위계 ① 공식 문서/공식 레포(README·CHANGELOG·릴리스 노트·*현재 메이저 버전* 문서)·1차 스펙 → ② maintainer 1차 → ③ 평판 2차로 *찾아 읽는다*. 라이브러리는 현재 메이저 버전 먼저 확정 후 그 버전 문서. 양질 출처 미발견 시 "양질 출처 부족" 명시(약한 정보를 단단히 제시 금지).
2. **stale note 정정**: 본 ADR D5 + #amend-2 D2의 "fork+Agent 미보유 skill(bootstrap-stack 등)" 표현은 현재와 어긋난다 — bootstrap-stack/bootstrap-project/plan-milestone 모두 `Agent` 보유 + 메인 세션 실행이라 researcher 직접 위임 가능. 본 amend가 그 "미보유" 표현을 supersede(사전 `/research-pack` 노트 참조는 *Agent 미보유 환경 fallback*). 원문은 인라인 포인터로 보존.
### 강도 (ADR-022)
- constraint(약, 소스 품질) + 정정성(행동 불변).
### 적용 surface
- .claude/agents/researcher.md — 소스 품질 규율(standing)
```
**README 인덱스**: ADR-040 행 Amendments 컬럼 +1.
**검증**: ADR-040 Amendment 3 + README 일치.

**커밋**: `feat(researcher): authoritative source-quality discipline + correct stale Agent-availability note (ADR-040#amend-3)`

---

# Phase 2 — A6 설계 강화: 문서 양식 + 고-stakes 패널 (ADR-053, 한 커밋)

> ADR-053과 그 surface(architect·3 skill·stabilize backstop·_ADR_GUIDE)는 상호참조라 분리 커밋 시 중간 커밋에 dangling ADR-ref가 생긴다. **한 커밋으로 처리.**

### 2.1 새 ADR `docs/90-decisions/boilerplate/ADR-053-high-stakes-design-panel.md`
**기존**: 없음(다음 가용 번호 053 — README Reserved/Parked/Dropped 표 점검).
**수정**: 아래 전체를 새 파일로.
```markdown
# ADR-053 — 고-stakes 설계 패널 (stakes-gated design protocol)

> scope: boilerplate
> area: process

## Status
accepted

## 배경
- [관측됨] 중요한 설계 결정(스택·구조·마일스톤 분할)이 architect *단발 호출*로 빠르게 내려지고, 웹리서치는 옵션, 다중 후보·적대 검증이 없다 → 결정 품질이 비중에 못 미친다.
- [외부실증] arXiv 2606.01490 (2026) *LLM Consortium for Software Design Refinement* — single-shot 설계가 최저 품질 baseline; 구조적 적대 리뷰(전면 재작성 요구)가 최상위; **parallel-merge(N개 완성안 병합)는 최악**(토큰 기아). arXiv 2604.04990 (2026) *Architecture Without Architects* — 에이전트가 프롬프트만으로 프레임워크/DB를 초 단위 결정, 근거 0.

## 결정
1. **stakes 게이트** — 메인 세션(설계 skill)이 자가점검:
   - (S1) 되돌리기 비싼 기술 토대(언어/런타임/프레임워크/DB·영속성/인증·인가/배포 토폴로지/핵심 외부 의존).
   - (S2) 합리적 대안 2개 이상 실재.
   - (S3) 영향이 3+ 모듈 또는 여러 surface(API+FE+DB 등) 가로지름.
   - (S4) charter 제약·비목표 / 보안 경계 / 개인정보·데이터 모델 / 마이그레이션.
   - (S5) ADR-031 직접지원 5종 밖 라이브러리거나, 모델이 그 lib의 *현재 버전/API*에 확신 없음.
   - **판정**: S1~S4 중 1+ YES → **full 패널**. **S5만 YES**(설계 트레이드오프 자명) → **리서치-only**(다각도·적대 불요 — 버전 확인이면 충분). 전부 NO → **fast path**(architect 단발, 현행).
2. **3단 강도** (full 패널):
   - ① **웹 리서치 (must-or-flag)**: 외부 lib/version 걸리면 researcher에 Agent 위임(ADR-040 — 최신 공식문서·버전, 품질 규율 ADR-040#amend-3). 오프라인/미발견이면 *날조 말고* `Needs Research` emit + 나머지 작성 계속(hard-block 아님).
   - ② **다각도 2~3안 (default)**: architect가 *다른 각도*(MVP/risk/scale-first)로 후보. 비용 ≈ 프롬프트 1줄.
   - ③ **적대 재검토 (recommend — 최상위만)**: S1·S3·S4 중 *2개 이상* YES면 *두 번째 architect*가 red-team("패치 말고 전면 재작성" 요구) 후 종합. **`/review-doc` 미사용**(그 skill은 문서 비평 전용). cross-model(별 Codex 세션)은 opt-in 상위. **parallel-merge 금지 — 순차 생성→비평→종합.**
   - ④ **기록**: ARCHITECTURE §7 결정 블록 + (해당 시) ADR.
3. **backstop (executable governance, best-effort)**: stabilize preflight가 ARCHITECTURE_OVERVIEW `## 7`의 *실제 작성된*(HTML 주석 placeholder 제외) 결정 블록에서 필수 칸(옵션≥2/신뢰도/재검토)이 비면 `P2 [Design-rationale]` 보고. **한계**: 고-stakes 결정을 *한 줄 산문으로* 써버린 경우는 못 잡는다(블록 부재를 고-stakes로 단정 불가) — 게이트의 1차 책임은 설계 skill 자가점검.

## 근거
- 게이트로 사소한 결정은 빠르게(ADR-006), 중요한 결정만 무겁게. S5를 리서치-only로 분리 — 버전 모름은 리서치로 해결되지 다각도 패널 불요.
- 적대 패스는 architect(도메인 일치)로 — review-doc 의도(문서 비평) 보존. parallel-merge는 연구상 최악이라 명시 금지.

## 결과
- architect.md(행동) + bootstrap-stack/bootstrap-project/plan-milestone(게이트 참조) + ARCHITECTURE_OVERVIEW/_ADR_GUIDE(기록 양식) + stabilize-milestone(backstop) + researcher.md(리서치 품질, ADR-040#amend-3).

## Surfaces
- .claude/agents/architect.md
- .claude/skills/bootstrap-stack/SKILL.md
- .claude/skills/bootstrap-project/SKILL.md
- .claude/skills/plan-milestone/SKILL.md
- docs/20-system/ARCHITECTURE_OVERVIEW.md
- docs/90-decisions/boilerplate/_ADR_GUIDE.md
- .claude/skills/stabilize-milestone/SKILL.md

## Mutation Contract (ADR-047 D3)
1. Target — architect.md 고-stakes 행동 / 3 design skill 게이트 참조 / ARCHITECTURE §7 결정 블록 + _ADR_GUIDE 신뢰도·재검토 필드 / stabilize §1.0 backstop.
2. Failure mode — 중요한 설계가 single-shot·근거 미기록으로 품질 저하.
3. Predicted improvement — 고-stakes 결정에 리서치+다각도+(최상위)적대+근거기록 → 품질·추적성 상승.
4. Preserved invariants — fast path(저-stakes 단발) 유지 / researcher report-only / review-doc 용도 불변 / parallel-merge 금지.
5. Falsifying evaluation — 게이트가 사소한 결정에 과발동(매 결정 8칸) 또는 고-stakes에 미발동이면 게이트 신호 재조정.
6. Rollback path — 본 ADR superseded + 3 skill 게이트 참조 블록 제거(ARCHITECTURE/_ADR_GUIDE 양식은 무해 잔존).

## Ratchet 강도 (ADR-022)
- enabling(약, [외부실증]) — full 패널은 게이트 발동 시; ①만 hard-ish(날조 금지), ②③ default/recommend.

## 참고
- ADR-006(단순성 게이트), ADR-040(researcher·리서치 품질), ADR-038(cross-LLM 정신), ADR-031(지원 스택), ADR-014(마일스톤), ADR-047 D3(Mutation Contract).
```
**README 인덱스**: `boilerplate/README.md`에 ADR-053 행 추가.

### 2.2 `docs/20-system/ARCHITECTURE_OVERVIEW.md` — §7 결정 블록 (HTML 주석)
**기존**: `## 7. 기술 선택` + `<!-- ... 스택이 미정이면 미정으로 적는다. -->` 주석.
**수정**: 그 주석 *바로 아래에* 추가(전부 HTML 주석).
```html
<!-- 고-stakes 결정(되돌리기 비쌈 / 대안 2+ / 3+ 모듈·cross-surface / 보안·데이터·마이그레이션 — ADR-053 게이트)은 아래 *결정 블록*으로 기록한다. 저-stakes 선택은 한 줄로 족하다(과기록 금지 — ADR-006).

### 결정: <무엇을 정했나>
- 고려한 옵션 (≥2): <A> / <B> / <C>
- 선택: <고른 것>
- 이유: <편익> + <받아들인 제약·비용>   ← 편익만 적지 말 것
- 기각한 대안 + 이유: <왜 A/B를 안 골랐나>
- 신뢰도: High | Medium | Low — <근거 한 줄>
- 재검토 트리거: <어떤 조건이 되면 다시 본다>
- 관련 품질속성(§8): <민감점·트레이드오프점 — 해당 시>
-->
```
**검증**: §7에 결정 블록 주석(placeholder는 주석 안 — backstop이 채워진 블록만 점검).

### 2.3 `docs/90-decisions/boilerplate/_ADR_GUIDE.md` — 권장 섹션
**기존**: `## 권장 섹션`의 `- 근거 (왜 이 선택인가, 대안은 무엇이었는가)` 줄.
**수정**: 그 줄을 아래 3줄로 교체(필드를 고-stakes/기술 결정 한정으로 — process ADR 과적용 회피).
```markdown
- 근거 (왜 이 선택인가 — 고-stakes/기술 결정은 **대안 ≥2개를 편익 AND 제약 둘 다로** 명시. 장점만 적지 않는다 — ADR-053)
- 신뢰도 (High | Medium | Low + 근거 한 줄 — *고-stakes/기술 결정 한정* 필수, ADR-053)
- 재검토 트리거 (어떤 조건에서 다시 보는가 — *고-stakes/기술 결정 한정* 필수, ADR-053)
```
**검증**: 권장 섹션에 신뢰도·재검토(고-stakes 한정).

### 2.4 `.claude/agents/architect.md` — 고-stakes 설계 행동
**수정**: `## 출력 계약` *앞에* 추가.
```markdown
## 고-stakes 설계 행동 (ADR-053)
설계 결정이 ADR-worthy(되돌리기 비쌈 / 대안 2+ / 3+ 모듈·cross-surface / 보안·데이터·마이그레이션)면:
- *다른 각도로 2~3안*을 내고 편익 AND 제약을 함께 적는다(장점만 강조 금지). 단일 자명 선택이면 생략.
- 외부 lib/version 불확실 시 *직접 추측 말고* 메인에 `Needs Research`(researcher 위임 — ADR-040, 오프라인이면 날조 금지). architect는 웹 접근 없음.
- *두 번째 architect로 호출돼 적대 리뷰 역할*일 때는 패치가 아니라 *전면 재작성*을 요구하며 실패 모드를 적극 찾는다. **parallel-merge 금지 — 순차 생성→비평→종합.**
- 결정은 ARCHITECTURE §7 결정 블록(대안/제약/기각/신뢰도/재검토)으로 기록.
```

### 2.5 설계 skill 3종 — 게이트 참조 (.claude만)
**대상**: `bootstrap-stack`, `bootstrap-project`, `plan-milestone`. **수정**: architect 단발 sub-call 단락 근처에 추가.
```markdown
## 고-stakes 설계 게이트 (ADR-053)
설계 결정이 ADR-053 게이트(S1~S4 중 1+ → full 패널 / S5만 → 리서치-only / 전부 NO → 단발)면, architect 단발 대신: ① researcher 웹 패스(must-or-flag, 오프라인 `Needs Research`) → ② architect 다각도 2~3안 → ③(최상위만) 두 번째 architect 적대 검토(review-doc 미사용·parallel-merge 금지) → ④ ARCHITECTURE §7 결정 블록 기록. 저-stakes는 현행 단발. (Codex: 순차 단일 degrade — researcher 인라인/사전 노트.)
```
*plan-milestone R2*는 위 대신 1줄: `R2 분할에 외부 기술 불확실성이 있으면 ADR-053 리서치-only 게이트(researcher 위임). 분할 자체는 다각도 패널 불요.`

### 2.6 `.claude/skills/stabilize-milestone/SKILL.md` — preflight backstop
**기존**: `### 1.0. Deterministic pre-flight` 5개 점검(링크/ADR참조/FAC/모드라벨/DESIGN drift).
**수정**: 6번 추가.
```markdown
6. **고-stakes 설계 근거 누락 (ADR-053 backstop, best-effort)**: ARCHITECTURE_OVERVIEW `## 7`의 *실제 작성된*(HTML 주석 placeholder 제외) 결정 블록에서 필수 칸(옵션≥2/신뢰도/재검토)이 비면 `P2 [Design-rationale] <위치>` 기록. **한계**: 고-stakes 결정을 한 줄 산문으로 쓴 경우는 못 잡음(휴리스틱).
```
**검증**: stabilize §1.0에 6번.

**커밋**: `feat(design): add stakes-gated high-stakes design protocol (ADR-053) + decision-record templates`

---

# Phase 3 — A3: validate-plan milestone-mode (ADR-038#amend-4)

> plan-milestone 산출(task 0 → `## 7-1` 빈 shell)에 validate-plan을 돌릴 때의 *가짜 P0*(correctness 버그) 제거 + 마일스톤 4차원. ADR-038은 amend 3개 → amend-4가 4개째(`## 현재 유효 결정` sync + amend 근거 명시).

### 3.1 `.claude/skills/validate-plan/SKILL.md` — milestone-mode
**기존**: "검토 차원 (10 dimensions)" + 10차원. `[Plan-FAC-coverage]`는 unmapped FAC를 P0.
**수정 A**: "검토 차원" 헤더 *앞에* 삽입.
```markdown
## 입력 형태 판정 — milestone-plan mode (ADR-038#amend-4)
하위 문서 회수 결과 **분해된 task가 0건**이면(plan-milestone 직후·plan-workitem 미실행) **milestone-plan mode**:
- **비활성**: [Plan-sizing]·[Plan-AC-form]·[Plan-dep] (task 산물 부재).
- **[Plan-FAC-coverage] 반전**: `## 7-1` 빈 shell은 *정상* — unmapped FAC를 P0로 올리지 **않는다**. shell이 *형식적으로 깨졌을 때만* P2.
- **활성**: milestone-plan 4차원(아래).
- 혼합 마일스톤은 **feature 단위로** mode 적용. task가 1건+면 기존 10차원.
```
**수정 B**: 10차원 끝(`[Plan-arch-iface]` 뒤)에 추가.
```markdown
**milestone-plan 4차원 (milestone-mode 한정, ADR-038#amend-4):**
11. **[MP-FAC-quality]** — FAC가 *시나리오 수준 + 측정 가능*('works' 류 금지), feature `## 3` 시나리오 추적. P0.
12. **[MP-feature-scope]** — feature가 charter `## 5 비목표` / milestone `## 4 제외되는 기능` 침범 여부. P0.
13. **[MP-graduation]** — milestone `## 5 완료 기준` graduation 5+1(ADR-014) 정합 + UI/e2e 시 e2e 선언(ADR-052). P1.
14. **[MP-feature-dep]** — feature 간 의존(순환·잘못된 병렬). P1.
```
**수정 C**: 카운트 표에 4행(각 0/0/0).
**검증**: mode 블록·4차원·표.

### 3.2 `.claude/agents/reviewer.md` — Milestone-Plan Quality sub-block
**수정**: "Plan Quality 10 차원" 블록 *뒤에* 추가.
```markdown
### Milestone-Plan Quality 4 (milestone-mode — 하위 task 0건, ADR-038#amend-4)
- [MP-FAC-quality] P0 — FAC 시나리오 수준 + 측정 가능, `## 3` 추적.
- [MP-feature-scope] P0 — charter 비목표 / milestone 제외 침범.
- [MP-graduation] P1 — graduation 5+1(ADR-014) + e2e 선언(ADR-052).
- [MP-feature-dep] P1 — feature 간 순환·잘못된 병렬.
(task 1건+면 Plan Quality 10 차원.)
```

### 3.3 `.claude/skills/repair-plan/SKILL.md` — 1줄
**수정**: 끝에 `- milestone-plan mode 리뷰(ADR-038#amend-4)도 동일 회수·적용 — M/F id 이미 처리.`

### 3.4 `docs/90-decisions/boilerplate/ADR-038-...md` — Amendment 4 + 현재 유효 결정 sync
**기존**: amend 3개. `## 현재 유효 결정` 섹션 보유. `## Surfaces` 블록 보유(validate-plan·reviewer·repair-plan 모두 이미 등재).
**수정 A (현재 유효 결정)**: `## 현재 유효 결정`에 1줄 추가: `- validate-plan은 입력에 task 0건(plan-milestone 직후)이면 milestone-plan mode — FAC 빈 shell 정상 처리 + milestone 4차원(#amend-4).`
**수정 B (Surfaces 라벨)**: 새 surface 없음 — main `## Surfaces`의 validate-plan/reviewer/repair-plan 행에 `#amend-4` 라벨만 부기(관례).
**수정 C (Amendment)**:
```markdown
<a id="adr-038-amend-4"></a>
## Amendment 4 (2026-06-30) — milestone-plan mode (plan-milestone 산출 검토)
> **amend 근거(ADR-045#d6 정합)**: validate-plan mode 확장 = *충돌 없는 확장*이라 amend로 충분. ADR-038은 ADR-051 정리 라운드에서 통합 재발행 후보이나, 단발 mode 추가는 supersede 불요.
### 결정
1. validate-plan은 하위 task 0건이면 milestone-plan mode: task형 차원([Plan-sizing]/[Plan-AC-form]/[Plan-dep]) 비활성, [Plan-FAC-coverage]를 "빈 `## 7-1` shell 정상, 형식 깨짐만 flag"로 반전, milestone 4차원([MP-FAC-quality]/[MP-feature-scope]/[MP-graduation]/[MP-feature-dep]) 활성. 혼합은 feature 단위.
2. 리뷰 파일·repair-plan 회수·삭제 계약 불변(plan-reviews/ 재사용).
### 근거
- [관측됨] plan-milestone이 `## 7-1`을 의도적 빈 shell로 두는데 [Plan-FAC-coverage]가 P0를 올려 *갓 만든 산출에 가짜 P0* → 리뷰 신뢰 훼손(correctness 버그). + 마일스톤 레벨 품질 차원 부재.
### 강도 (ADR-022)
- constraint(약) 버그픽스 + enabling(약) 4차원.
### 적용 surface
- .claude/skills/validate-plan/SKILL.md
- .claude/agents/reviewer.md
- .claude/skills/repair-plan/SKILL.md
```
**README**: ADR-038 Amendments +1.
**검증**: amend-4 + 현재 유효 결정 1줄 + amend 근거 + README.

**커밋**: `feat(validate-plan): milestone-plan mode — fix FAC false-positive + milestone dims (ADR-038#amend-4)`

---

# Phase 4 — A5: 동시성 (공유 런타임 리소스 partition 가드, ADR-051#amend-1)

> file-disjoint만으로 못 막는 *공유 런타임 리소스*(테스트 DB·포트·Supabase·빌드캐시) 충돌. race 지식은 ADR-038 면책 단락(69-76)에 이미 있고, foreman partition(ADR-051) 트리거로 승격.

### 4.1 `.claude/skills/implement-workitem/SKILL.md` — partition 트리거
**기존**: "분할(partition)" step 4의 "공유 변이 지점..." 불릿이 `*의심되면 단일 builder*.`로 끝남.
**수정**: 그 뒤에 추가.
```markdown
   - **공유 런타임 리소스 주의(병렬 안전, ADR-051#amend-1 / ADR-038 면책 단락)**: 두 slice의 테스트가 *격리 없이* 공유 런타임 리소스(테스트 DB·고정 포트·로컬 Supabase 54321/54322·단일 dev server·공유 빌드/codegen 캐시 `tsbuildinfo`·`.next/cache`)를 동시에 건드리면, file-disjoint라도 병렬 시 충돌(최악: 한 builder의 seed가 다른 builder 단언을 우연히 충족하는 *false-Green*) → 그 slice들은 *순차 dispatch(또는 단일 builder)*. 격리(testcontainers·트랜잭션 롤백·랜덤 포트)가 보장되면 병렬 유지. **soft(hard-block 아님)** — 격리된 unit-test 일반 케이스 병렬 속도는 죽이지 않는다.
```

### 4.2 `.claude/agents/builder.md` — 프레이밍 교정 (line 24)
**기존**: `- **테스트 실행은 자기 slice 범위로 한정**한다 (병렬 builder 가 같은 checkout 에서 돌 때 전체 스위트 실행은 공유 DB/포트/snapshot/build-cache 충돌로 flaky 를 부른다 — 전체 통합 검증은 foreman 최종 \`validate --changed\` 담당, ADR-051 D1).`
**수정**: 교체.
```markdown
- **테스트 실행은 자기 slice 범위로 한정**한다 (전체 스위트는 공유 DB/포트/snapshot/build-cache 충돌로 flaky). *단, 범위 한정은 폭발 반경을 줄일 뿐 공유 런타임 리소스 충돌을 없애지 못한다* — 격리 없이 공유 DB/포트를 쓰는 slice는 *foreman이 순차화*해야 한다(implement-workitem partition, ADR-051#amend-1). builder는 peer slice를 못 보므로 직접 해결 불가 — 충돌 신호는 foreman에 보고. 전체 통합 검증은 foreman 최종 `validate --changed`(ADR-051 D1).
```

### 4.3 `.claude/skills/stack-guard/SKILL.md` — 격리 권장
**기존**: §6-2 toolchain 설치. stack-guard는 playwright wiring·validate만 authoring하지 unit-test DB/port setup은 authoring 안 함.
**수정**: §6-2 뒤에 권장 1줄(과대 프레이밍 회피 — '디폴트로 박는다' 아님).
```markdown
   - **6-2-1. 테스트 격리 권장 (ADR-051#amend-1)**: 생성하는 e2e/통합 설정에 *가능한 범위에서* 격리를 권장한다 — playwright `webServer`는 동적 포트, 통합 테스트는 트랜잭션 롤백/임시 스키마/testcontainers. stack-guard가 unit-test 격리를 직접 authoring하긴 어려우므로, 미보장 시 `STACK_SETUP_PLAN.md`에 "테스트 격리 미설정 — 병렬 builder 시 foreman 순차 권장" 1줄 부기(implement partition이 실제 보호).
```

### 4.4 `docs/90-decisions/boilerplate/ADR-051-...md` — Amendment 1
**기존**: amend 0개. `## Surfaces` 블록 보유(implement-workitem·builder는 이미 등재 추정; stack-guard는 미등재).
**수정 A (Amendment)**:
```markdown
<a id="adr-051-amend-1"></a>
## Amendment 1 (2026-06-30) — 공유 런타임 리소스 partition 가드
### 결정
1. foreman partition(D6 `## 3` 경로 분할)에 *공유 런타임 리소스* 트리거 추가: 두 slice의 테스트가 격리 없이 공유 DB·고정 포트·로컬 Supabase 스택·단일 dev server·공유 빌드/codegen 캐시를 동시에 건드리면 file-disjoint라도 순차/단일. 격리 보장 시 병렬 유지. soft(hard-block 아님).
2. builder는 *테스트 범위 한정이 완화책이지 해결책 아님*을 명시 — 충돌 신호는 foreman 보고. stack-guard는 e2e/통합 격리를 *권장*(unit 격리 authoring 한계).
### 근거
- [관측됨] D7은 disjoint를 *file* 속성으로만 봤으나, ADR-038 면책 단락(빌드캐시 race / 포트·임시DB·fixture)이 *런타임 리소스* 충돌을 이미 명시 → same-checkout 병렬 builder에 그대로 재현(최악 false-Green). race 지식을 partition 트리거로 승격.
### 강도 (ADR-022)
- enabling(약) — 격리 보장 시 병렬 유지, hard-block 아님.
### 적용 surface
- .claude/skills/implement-workitem/SKILL.md
- .claude/agents/builder.md
- .claude/skills/stack-guard/SKILL.md
```
**수정 B (main Surfaces)**: ADR-051 `## Surfaces` 블록에 *미등재였던* `.claude/skills/stack-guard/SKILL.md`를 `#amend-1` 라벨로 추가(implement-workitem·builder가 이미 있으면 `#amend-1` 라벨만 부기).
**README**: ADR-051 Amendments +1.
**검증**: amend-1 + Surfaces에 stack-guard + README.

**커밋**: `fix(implement): serialize shared-runtime-resource tests in foreman partition (ADR-051#amend-1)`

---

# Phase 5 — A1: 디자인 (R0 필수 + §9 클래스룰 + visual-QA, ADR-049#amend-1)

> R0 reference grounding은 ADR-049 #d28 소관(ADR-027은 amend 4개 + design-flow는 ADR-049가 supersede). visual-QA도 디자인 품질 enforcement라 ADR-049(area:design, amend 0개)로 통합. DESIGN.md §9 *내용*은 ADR-027 #7/#23 SSOT — 클래스룰은 cross-ref.

### 5.1 `.claude/skills/bootstrap-design/SKILL.md` — R0 필수 + 수렴
**기존**: R0 grounding이 `(옵션)`(ADR-027#d26 / ADR-049#d28). R2/R6 루프 무한.
**수정 A (R0)**: R0의 grounding 불릿 *뒤에*.
```markdown
- **레퍼런스 grounding 필수화 (ADR-049#amend-1)**: R0는 *최소 1개* 레퍼런스(사용자 URL/스크린샷, 또는 가용 디자인 MCP/라이브러리)를 근거로 한다. 없으면 *silent degrade 금지* — `레퍼런스 없음: 모델 지식 기반 + <사유>`를 `DESIGN_RESEARCH.md` `## grounding 출처`에 **명시 기록** 후 진행(검증된 슬롭 근본원인 = R0 옵션→median).
```
**수정 B (수렴)**: R2-2·R6-2 루프에 각 1줄.
```markdown
- **수렴 규칙 (ADR-049#amend-1)**: 루프가 *2 사이클 내 미수렴*이면 생성 반복 말고 *brief(R0 레퍼런스 / R1 원칙)를 고친다*(soft 권장).
```

### 5.2 `docs/20-system/DESIGN.md` — §9 클래스룰 (HTML 주석 경계 주의)
**기존**: `## 9`의 anti-slop은 **전체가 하나의 HTML 주석**이고, *마지막 줄* `- sparkline 등 데이터 시각요소를 장식으로 사용 금지 -->`가 `-->` 종료자를 *같이* 달고 있다.
**수정**: 그 줄의 `-->`를 떼고, 클래스룰을 *그 앞(주석 안)*에 넣은 뒤 `-->`로 닫는다. 결과:
```markdown
     - sparkline 등 데이터 시각요소를 장식으로 사용 금지
     [클래스 레벨 규율 — 특정 유행 인스턴스 추격 대신, ADR-049#amend-1]
     - 브랜드 근거 없이 *현재 인기 fontstack·시각 트렌드*를 디폴트로 쓰지 않는다(Inter 단독 금지의 일반화). 채택 시 ## 1 Overview에 브랜드 근거 명시. -->
```
**검증**: 클래스룰이 `-->` *안쪽* + 주석 정상 종료. (인스턴스 금지어 대량 추가 없음.)

### 5.3 `.claude/skills/stack-guard/SKILL.md` — §6-4에 visual-QA scaffold
**기존**: §6-4 `validate:e2e scaffold`가 playwright config + 진입점 생성.
**수정**: §6-4 뒤에 §6-4-1(빈 앱 vacuous-pass + 겹침은 권고).
```markdown
   - **6-4-1. Visual-QA smoke scaffold (UI/web 한정, ADR-049#amend-1)**: e2e scaffold 시 `e2e/visual-qa.spec.*`도 생성 — *렌더된 화면*의 기계적 결함을 잡는다. **scaffold 시점엔 앱이 비어 있을 수 있으므로 대상 landmark 부재 시 graceful skip(vacuous PASS — 0-spec=PASS 정합)**, 실제 UI 생성 후 의미 발동.
     - breakpoint 루프(375/768/1440): (a) **가로 overflow** — `document.scrollingElement.scrollWidth > clientWidth` false 단언(가로 스크롤 없음). **차단**: 졸업 e2e 실패(진짜 버그, FP 드묾). (b) **요소 겹침** — `getBoundingClientRect()` 교차 점검. **권고만**(sticky header·모달·툴팁 등 정당한 겹침 FP 가능 → 차단 X, P1 기록). (c) **a11y** `@axe-core/playwright` wcag2aa — **권고만**.
     - 이미 `e2e/visual-qa.spec.*` 있으면 덮어쓰지 않는다. **스크린샷 vision 비평은 hot-loop 제외**(토큰 트랩 — 탐색/사람 검토는 stabilize §3-P).
     - 졸업 e2e 게이트는 ADR-052 D3 / ADR-014#amend-2가 SSOT — 본 spec은 그 위에 *가로 overflow 차단*만 추가.
```
**검증**: §6-4-1에 graceful skip + overflow만 차단 + 겹침/a11y 권고.

### 5.4 `docs/90-decisions/boilerplate/ADR-049-...md` — Amendment 1
**기존**: amend 0개. `## Surfaces` 보유(bootstrap-design·DESIGN.md·STRUCTURE·WORKFLOW·.gitignore; stack-guard 미등재).
**수정 A (Amendment)**:
```markdown
<a id="adr-049-amend-1"></a>
## Amendment 1 (2026-06-30) — 디자인 품질 강화 (R0 필수 + 수렴 + 렌더 visual-QA + 클래스 anti-slop)
### 결정
1. **R0 레퍼런스 필수화**: #d28 grounding을 옵션→필수로. 없으면 silent degrade 금지 — DESIGN_RESEARCH.md `## grounding 출처`에 "모델 지식 기반 + 사유" 명시.
2. **수렴 규칙**: R2/R6 루프 2 사이클 미수렴 시 brief(R0/R1)를 고친다(생성 반복 금지, soft).
3. **렌더 visual-QA**: stack-guard가 UI e2e scaffold 시 `e2e/visual-qa.spec.*` 생성(breakpoint × 가로 overflow 차단 / 겹침·a11y 권고, 빈 앱 graceful skip). 졸업 e2e 게이트(ADR-052 D3 / ADR-014#amend-2) 위에 가로 overflow 차단만 추가.
4. **클래스 anti-slop**: DESIGN.md `## 9`(내용 SSOT는 ADR-027 #7/#23)에 *인스턴스 금지어 추격 대신* 클래스 규율("브랜드 근거 없이 인기 fontstack/트렌드 디폴트 금지") 1줄.
### 근거
- [관측됨] R0 grounding이 옵션이라 median으로 degrade(슬롭 근본원인, #d26/#d28 계승). 토큰 스펙은 overflow/레이아웃 깨짐을 못 잡고 렌더 검증이 inner-loop에 없다. 유행 금지어를 SSOT에 박으면 그 자체가 drift(패션 트레드밀).
- [외부실증] DOM `scrollWidth/clientWidth`·`getBoundingClientRect`·axe-core는 0-LLM 결정적; 스크린샷 vision은 hot-loop 토큰 트랩.
### 강도 (ADR-022)
- enabling(약). 가로 overflow만 차단(진짜 버그), 나머지 권고. designer 페르소나 미신설.
### 적용 surface
- .claude/skills/bootstrap-design/SKILL.md  — R0 필수 + 수렴
- docs/20-system/DESIGN.md                  — §9 클래스룰(내용 SSOT ADR-027)
- .claude/skills/stack-guard/SKILL.md       — §6-4-1 visual-QA scaffold
### 참고
- ADR-027(DESIGN §9 내용 SSOT), ADR-052 D3(졸업 e2e 게이트), ADR-014#amend-2(e2e MUST-run).
```
**수정 B (main Surfaces)**: ADR-049 `## Surfaces` 블록에 *미등재였던* `.claude/skills/stack-guard/SKILL.md`를 `#amend-1` 라벨로 추가(bootstrap-design·DESIGN.md는 이미 등재).
**README**: ADR-049 Amendments +1.
**검증**: amend-1 + Surfaces에 stack-guard + README.

**커밋**: `feat(design): mandatory R0 grounding + class slop rule + visual-QA scaffold (ADR-049#amend-1)`

---

# Phase 6 — A2: validate-workitem fossil 라벨

### 6.1 `.claude/skills/validate-workitem/SKILL.md` — line 69
**기존**: `... legacy fallback은 plan-workitem SKILL.md "feature 분해 시" 단락 참조.` (plan-workitem엔 그 헤딩 없음 — 현재 `## task 분해 + ## 7-1 AC 측 채움`).
**수정**: 포인터를 실제 위치로: `... legacy fallback은 plan-workitem SKILL.md의 "task 분해 + ## 7-1 AC 측 채움" 섹션 **Legacy fallback** 단락 참조.`
**검증**: `grep "feature 분해 시" .claude/skills/validate-workitem/SKILL.md` → 0건.

**커밋**: `docs(validate-workitem): retarget stale plan-workitem legacy-fallback pointer`

---

# Phase 7 — A4: stabilize 병렬 (validate-milestone 신설 + repair 종합, 새 ADR-054)

> cross-LLM은 surface별 별도 ADR(ADR-044 선례). validate-milestone은 Codex stub 미생성(ADR-044 비대칭). repair-milestone 종료 가드 버그 동시 수정.

### 7.1 신규 skill `.claude/skills/validate-milestone/SKILL.md`
**수정**: 새 파일.
```markdown
---
name: validate-milestone
description: 다른 세션·다른 LLM에서 stabilize 대상 마일스톤을 읽기 전용 교차 리뷰하고 임시 리뷰 파일 1개를 작성한다. 코드·문서·실행 일체 없음 (ADR-054).
argument-hint: "[milestone id] [--reviewer-tag <tag>]"
disable-model-invocation: true
allowed-tools: Read Glob Grep Write
context-pack: minimal
---

이 skill은 **판정 + 임시 리뷰 파일 기록 전용**이다. 코드·문서 수정 금지, **`validate`/`validate:e2e`/`npm audit` 등 실행 금지**(allowed-tools에 Bash 없음 — e2e 충돌 원천 차단). stabilize-milestone(origin)이 실행·졸업판정·문서기록을 단일 수행하고, 본 skill은 *추가 모델의 읽기전용 2nd opinion*만 만든다.

**⚠ 같은 checkout 제약**: 리뷰 파일은 `docs/40-validation/stabilize-reviews/`의 gitignore된 로컬 파일. origin의 `/repair-milestone`이 회수하려면 *같은 checkout*에서 실행(다른 worktree면 수동 이동).

입력:
- `$ARGUMENTS`: milestone id(`M1`) + 선택 `--reviewer-tag <tag>`.
- tag `[A-Za-z0-9._-]{1,32}`, milestone-id `M[0-9]+`만 허용(미일치 즉시 종료). 파일 존재 시 자동 suffix(`-2`,`-3`) — validate-plan과 동형.

반드시 먼저 읽을 파일:
- milestone 문서 + 산하 feature/task + (있으면) `docs/40-validation/reports/<task>.md`
- `docs/10-charter/PROJECT_CHARTER.md`, `docs/20-system/ARCHITECTURE_OVERVIEW.md`, `DESIGN.md`(UI 한정)

검토 (읽기 전용): stabilize의 *판단* 단계를 리뷰로 재수행 — qa 엣지케이스·회귀 + reviewer 리팩토링/디자인 부채. **결정적 preflight(grep)와 validate/e2e/audit는 재실행 안 함**(origin과 동일 결과). 발견 P0/P1/P2 + file:line.

리뷰 파일: `docs/40-validation/stabilize-reviews/<M>.<reviewer-tag>.md` — 양식(판정 ALL_GOOD/NEEDS_CHANGES + 발견 + 카운트 표 + 핵심 관찰 ≤3)은 validate-plan 차용.

가드: 코드·문서·실행·커밋 금지. 마지막 출력: 판정 + 카운트 + 파일 경로 + "origin에서 `/repair-milestone <M>`이 종합" 안내.

**Codex**: 본 skill은 ADR-054 D5(ADR-044 선례)대로 Codex wrapper 미생성 — Codex에선 `$validate-milestone` 자연어 호출(README 목록).

## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 최소 충분.
```
**검증**: 파일 존재. **`.agents/skills/validate-milestone/` 생성 안 함**(의도적 — ADR-054 D5).

### 7.2 `.claude/skills/repair-milestone/SKILL.md` — 리뷰 종합 + 종료 가드 버그 수정
**기존**: `반드시 먼저 할 일`이 QA_FINDINGS `## M-N` + IMPROVEMENT_GUIDE `### M-N`만 회수. **line 27 종료 가드**: 둘 다 비면 종료. `allowed-tools`(line 6)는 *이미 무제한 `Bash` 보유*.
**수정 A (회수)**: `반드시 먼저 할 일`에 추가: `- \`docs/40-validation/stabilize-reviews/<M>.*.md\` glob으로 peer 리뷰 파일 회수(경로 목록 메모리 보관 — 삭제 시 재glob 금지). (ADR-054 — cross-LLM stabilize 리뷰 종합)`
**수정 B (종료 가드 버그)**: line 27 가드를 *확장* — `QA_FINDINGS·IMPROVEMENT_GUIDE *그리고 stabilize-reviews 파일*까지 모두 비었을 때만 종료`. (stabilize가 clean 통과해도 peer가 P0를 냈으면 종합해야 하므로.)
**수정 C (4-판정·dedup)**: `peer 리뷰 finding도 4-판정. **3중 dedup**: (a) 태그 간, (b) peer vs stabilize가 이미 QA_FINDINGS/IMPROVEMENT_GUIDE에 기록, (c) open-item. 동일 \`<라벨> <file:line> <증상>\` 1건 병합.`
**수정 D (삭제)**: 처리 후 회수 경로를 한 개씩 `rm`. **`allowed-tools`는 이미 무제한 `Bash`라 스코프드 추가 불요** — repair-plan의 스코프드-rm 안전 모델이 전이되지 않으므로, **삭제 전 경로 echo를 prompt-level 가드로 강제**(`삭제 예정: <목록>` 출력 후 한 개씩 정확히 rm, glob 재실행 금지).
**검증**: 회수(ADR-054 ref 포함)·종료가드 확장·dedup·echo-then-rm. (allowed-tools에 스코프드 Bash 추가 *안 함*.)

### 7.3 `.claude/skills/stabilize-milestone/SKILL.md` — 실행 single-origin
**수정**: 도입부 책임 경계 근처에 추가.
```markdown
**실행 single-origin (ADR-054)**: `validate`/`validate:e2e`/`npm audit` 실행 + QA_FINDINGS/IMPROVEMENT_GUIDE/회고 *쓰기*는 본 skill(origin)이 *한 번만*. **같은 checkout에서 stabilize 2개 동시 실행 금지**(포트·테스트DB·Playwright outputDir·빌드캐시 충돌 + tracked-doc clobber). 다른 모델 2nd opinion은 *읽기 전용* `/validate-milestone <M> --reviewer-tag <tag>` 병렬 → `/repair-milestone`이 종합(실행은 origin 1회).
```

### 7.4 `.gitignore` — stabilize-reviews lane
**수정**: discovery-reviews 블록 *뒤에* 추가 + `docs/40-validation/stabilize-reviews/.gitkeep` 생성.
```gitignore
# stabilize-reviews (ephemeral) — ADR-054
docs/40-validation/stabilize-reviews/*.md
!docs/40-validation/stabilize-reviews/.gitkeep
```
**검증**: `git check-ignore docs/40-validation/stabilize-reviews/M1.codex.md` 매치.

### 7.5 새 ADR `docs/90-decisions/boilerplate/ADR-054-cross-llm-stabilize-review.md`
**수정**: 새 파일. (`## Surfaces`는 핵심 skill/파일만 — STRUCTURE·README는 migration 대상이라 등재 X, ADR-045#d3.)
```markdown
# ADR-054 — Cross-LLM Stabilize Review (마일스톤 안정화 층 peer review)

> scope: boilerplate

## Status
accepted

## 배경
- [관측됨] ADR-038(plan)·ADR-044(discovery)는 cross-LLM peer review를 제공하나 *마일스톤 안정화 층*(stabilize의 qa·reviewer 판단)엔 대응물이 없다. stabilize는 read-only 리뷰와 stateful 실행(validate/e2e/audit + tracked-doc 쓰기)을 한 skill에 묶어, 멀티모델 병렬 시 e2e 충돌(포트·테스트DB·Playwright outputDir·빌드캐시 — ADR-038 면책 단락) + tracked-doc(QA_FINDINGS/IMPROVEMENT_GUIDE) clobber.
- [관측됨] 실행은 고정 checkout에서 결정적 → 2번째 모델 신호 0, 충돌만. 다양성 가치는 판단(qa/reviewer)에만.
- [외부실증] Ning et al. 2026, *Code as Agent Harness* (arXiv:2605.18747) §4.1.2 — cross-LLM critique-and-repair(ADR-038/044 계승).

## 결정
1. `/validate-milestone [M] [--reviewer-tag <tag>]` 신설 — read-only 검토(qa 엣지케이스·회귀 + reviewer 부채), 임시 파일 `docs/40-validation/stabilize-reviews/<M>.<tag>.md`. **코드·문서·실행 X(Bash 없음 — e2e 충돌 차단).** 결정적 preflight·validate·e2e·audit 재실행 안 함. ADR-038 `/validate-plan` 패턴의 stabilize 층 mirror.
2. **실행 single-origin**: stabilize-milestone(origin)이 validate/e2e/audit + tracked-doc 쓰기 + 졸업판정을 *한 번만*. 같은 checkout 동시 stabilize 금지.
3. `repair-milestone`(stabilize 짝, ADR-052 D4 소유) 확장 — stabilize-reviews 회수·4-판정·3중 dedup·적용·삭제. **종료 가드 확장**: QA_FINDINGS·IMPROVEMENT_GUIDE *그리고 stabilize-reviews*가 모두 비었을 때만 종료(peer P0 누락 방지). 삭제는 echo-then-rm(무제한 Bash라 prompt-level echo가 안전 가드).
4. verdict는 리뷰 라벨이지 워크플로 차단 아님(ADR-038/007). opt-in.
5. **Codex 호환 (의도적 비대칭 — ADR-044 D-codex 선례)**: `validate-milestone`은 *자연어 호출*만(`.agents/skills/` wrapper 미생성 — 저빈도 cross-review, ADR-010 Phase 2 / 목록 SSOT=README). repair-milestone은 기존 Codex 경로 유지.

## 근거
- 검증된 ADR-038/044 패턴 mirror로 일관성. 새 agent 0(qa/reviewer 재사용). read-only/single-origin 분리로 e2e 충돌 차단.

## 결과
- `.claude/skills/validate-milestone/SKILL.md`(신규), repair-milestone(확장), stabilize-milestone(single-origin), `docs/40-validation/stabilize-reviews/`, .gitignore. STRUCTURE 산출물 표·로스터 + README 자연어 Codex 목록은 migration 적용 대상(Surfaces 아님).

## Mutation Contract (ADR-047 D3)
1. Target — validate-milestone 신설 / repair-milestone 회수·dedup·종료가드·echo-rm / stabilize single-origin / .gitignore / STRUCTURE 산출물 표+로스터 / README 자연어 Codex 목록.
2. Failure mode — stabilize가 read-only 리뷰와 stateful 실행을 묶어 멀티모델 병렬 시 e2e 충돌 + tracked-doc clobber; repair-milestone 종료가드가 peer P0 누락.
3. Predicted improvement — read-only 리뷰만 모델별 병렬 → 다양성 + 충돌 0; repair-milestone이 origin·peer finding 단일 종합.
4. Preserved invariants — stabilize read-only 본질(코드·커밋·status 미변경) / 실행 origin 단일 / repair-milestone cross-cutting·per-task routing(ADR-052 D4) 불변 / opt-in.
5. Falsifying evaluation — dogfood에서 peer가 origin과 거의 동일 finding만 내면 validate-milestone을 opt-in 최소로 후퇴.
6. Rollback path — superseded → validate-milestone·stabilize-reviews 제거, repair-milestone를 stabilize-only 회수로 환원.

## Ratchet 강도 (ADR-022)
- enabling(약) — opt-in. 자동 차단 X.

## Surfaces
- .claude/skills/validate-milestone/SKILL.md
- .claude/skills/repair-milestone/SKILL.md
- .claude/skills/stabilize-milestone/SKILL.md
- .gitignore

## 참고
- ADR-038(plan cross-LLM — mirror), ADR-044(discovery cross-LLM — mirror + Codex 자연어 비대칭 선례), ADR-052 D4(repair-milestone 소유), ADR-014(졸업), ADR-007(책임 경계), ADR-047 D3(Mutation Contract), Ning et al. 2026 (arXiv:2605.18747).
```
**README 인덱스**: ADR-054 행 추가.

### 7.6 `docs/00-meta/STRUCTURE.md` — 산출물 표 + 로스터 + Codex 목록
**수정 A (skill 로스터)**: "Claude skill 본문" 행의 20종 목록에 `validate-milestone` 추가(20→21). (다른 곳의 "20종" 표기도 `grep -rn "20종" docs/`로 확인해 sync.)
**수정 B (산출물 표)**: plan review·discovery review 행 옆에 stabilize review 행 신규:
```markdown
| stabilize review | `docs/40-validation/stabilize-reviews/<M>.<reviewer-tag>.md` | `/validate-milestone` (다른 세션·다른 LLM) | ephemeral | generated |
```
**수정 C (README 자연어 Codex 목록)**: validate-milestone은 자연어 호출이라 `.agents` wrapper 행에 추가 안 함 — `README.md`/`README_ko.md`의 *자연어 Codex 호출 skill 목록*(validate-discovery가 있는 그 목록)에 `validate-milestone` 추가.
**검증**: 로스터 21종 + stabilize review 산출물 행 + README 자연어 목록.

**커밋**: `feat(stabilize): validate-milestone read-only peer review + repair-milestone consolidation (ADR-054)`

---

# 8. 최종 검증 체크리스트 (전체 완료 후)

- [ ] **Phase1**: researcher 소스 품질 3줄 + stale-note 인라인 포인터(전 발생처) + ADR-040#amend-3.
- [ ] **Phase2**: ADR-053(MC+Surfaces) + ARCH §7 블록(주석) + _ADR_GUIDE 필드(고-stakes 한정) + architect.md + 3 skill 게이트 + stabilize backstop. **한 커밋**(dangling ref 없음).
- [ ] **Phase3**: validate-plan milestone-mode(빈 `## 7-1` 가짜P0 0) + 4차원 + reviewer + ADR-038#amend-4(현재 유효 결정 sync + amend 근거 + Surfaces #amend-4 라벨).
- [ ] **Phase4**: implement partition 절 + builder 프레이밍 + stack-guard 격리 권장 + ADR-051#amend-1(Surfaces에 stack-guard).
- [ ] **Phase5**: bootstrap-design R0 필수+수렴 + DESIGN §9 클래스룰(**`-->` 안쪽**) + stack-guard visual-QA(graceful + overflow만 차단) + ADR-049#amend-1(Surfaces에 stack-guard).
- [ ] **Phase6**: validate-workitem fossil 0건.
- [ ] **Phase7**: validate-milestone 신설(**Codex stub 없음**) + repair-milestone(**종료 가드 확장** + ADR-054 ref + echo-rm, 스코프드 Bash 추가 안 함) + stabilize single-origin + .gitignore + ADR-054(MC + Surfaces 4개) + STRUCTURE 로스터 21 + **산출물 표 stabilize review 행** + README 자연어 목록.
- [ ] **거버넌스**: 새 ADR 2개만 MC+Surfaces / amend 4개는 적용 surface만 / 새 surface는 부모 main `## Surfaces`에 #amend 라벨로 추가 + 그 파일에 ADR-NNN 역참조 / 모든 amend·새 ADR README 인덱스 정합 / `grep -rn "ADR-05[34]"`가 가리키는 파일 모두 존재(forward-ref 0).
- [ ] **자기 점검**: `/stabilize-milestone` deterministic preflight(있으면) 1회 — [ADR-ref]/[Link-anchor]/[Surface-backref] P0/P1 0건.
- [ ] 본 `IMPROVE-GUIDE.md` 삭제(작업 완료 후 — 사용자가 직접).

## 부록 — 커밋 순서
1. `feat(researcher): authoritative source-quality discipline + correct stale Agent-availability note (ADR-040#amend-3)`
2. `feat(design): add stakes-gated high-stakes design protocol (ADR-053) + decision-record templates`
3. `feat(validate-plan): milestone-plan mode — fix FAC false-positive + milestone dims (ADR-038#amend-4)`
4. `fix(implement): serialize shared-runtime-resource tests in foreman partition (ADR-051#amend-1)`
5. `feat(design): mandatory R0 grounding + class slop rule + visual-QA scaffold (ADR-049#amend-1)`
6. `docs(validate-workitem): retarget stale plan-workitem legacy-fallback pointer`
7. `feat(stabilize): validate-milestone read-only peer review + repair-milestone consolidation (ADR-054)`
