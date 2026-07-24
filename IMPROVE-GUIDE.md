# 보일러플레이트 개선 실행 가이드

두 개선 백로그(`IMPROVEMENT_BACKLOG.md`의 INST-1~6, `IMPROVEMENT_BACKLOG2.md`의 RD-1·DS-1~7·HN-1~6)에서 채택된 모든 항목을 실제로 적용하기 위한 단계별 편집 지침이다. 위에서부터 순서대로 따라가면 된다. 각 단계는 **어떤 파일의 어디를 / 기존에 무엇이 있었고 / 무엇으로 바꾸는지 / 왜**를 담는다. Phase 경계와 논리 단위마다 커밋 메시지를 한 줄로 제시한다.

## 이 가이드를 쓰는 법 (먼저 읽기)

- **순서가 곧 의존관계다.** Phase 1에서 변경 검증 방법과 디자인 거버넌스 ADR을 먼저 확정한다. Phase 3(디자인 구현)은 Phase 4(경험 계약)가 참조하는 게이트를 먼저 놓는다.
- **날짜**: 아래 ADR amendment/신규 ADR의 날짜는 placeholder다(가이드 작성 중 `2026-07-20`·`2026-07-21`이 혼재). **실제로 커밋하는 날짜 하나로 통일해 기입**한다(placeholder를 그대로 두지 말 것). (거버넌스 스킴의 grandfather 판정용 *생성일*은 실제 ADR 생성일이므로 바꾸지 않는다 — amendment 날짜만 통일.)
- **원문 인용 규칙**: "기존:" 블록은 저장소의 현재 원문 그대로다. 편집 시 그 문자열을 찾아 "변경:"으로 교체한다. 줄번호는 참고용이며(파일이 편집되며 밀린다) 실제 매칭은 문자열로 한다.
- **커밋**: 각 커밋 메시지는 영어 Conventional Commits 한 줄이다. 제시된 위치에서 커밋한다. 커밋 전 관련 문서와 구현 범위가 일치하는지 확인한다(AGENTS.md 규율).

## 전역 거버넌스 스킴 (이번 개선의 ADR 배치 — 확정)

| 개선 | 거버넌스 처리 | 비고 |
|---|---|---|
| DS-1 · DS-3 · DS-5 | **신규 `ADR-058` (Design Workflow)** — `ADR-049`를 supersede | ADR-049 status → `superseded` |
| DS-2 · DS-5 · DS-6 · DS-7 (DESIGN.md 내용) | **`ADR-027` Amendment 7** + `## 현재 유효 결정` 갱신 | 번호 유지(최소 churn) — D6의 "재발행" 대신 amend 선택(사용자 결정). ADR-027은 이미 `## 현재 유효 결정` 보유 |
| INST-1 | **`ADR-056` Amendment 1** (PX 커버리지) | ADR-056 현재 amend 0개 |
| INST-2 | **`ADR-056` Amendment 2** (raw-hex 토큰 정의 예외) | |
| DS-4 | **`ADR-056` Amendment 3** (화면 전환 표) | |
| RD-1 | **`ADR-057` Amendment 1** (마일스톤 로드맵) | ADR-057 현재 amend 0개 |
| INST-3 | **`ADR-057` Amendment 2** (seam 기재 위치 규칙) | |
| INST-6 · INST-4a · INST-4b | **`ADR-051` Amendment 4** (fan-out 자동 판정 + 회수 규율 + PM 고정) | **amend 4개째 → `## 현재 유효 결정` 요약 섹션 신설 필수**(ADR-045 D5 — 트리거: amend 4개+ *또는* 정정/뒤집기 amend) |
| HN-4 | **`ADR-050` Amendment 1** (dispatcher 사전판정 금지) | ADR-050 현재 amend 0개 |
| HN-5 | **`ADR-010` Amendment 5** (도구별 memory 비캐노니컬) | ADR-010 현재 amend 4개 |
| HN-2 | **`ADR-047` Amendment 1** (변경 검증법) | 보일러플레이트 공통 검증 런타임은 추가하지 않음 |
| RD-1 (graduation 영속) | **`ADR-014` Amendment 3** (회고 graduation 영속) | MILESTONE_TEMPLATE 동반 |

- **amendment 양식** (모든 amend 공통): 헤딩 바로 위 줄에 stable anchor `<a id="adr-NNN-amend-M"></a>` → `## Amendment M (2026-07-20) — <제목>` → `### 결정`(번호 목록) → `### 적용 surface`(파일 경로 1줄 1개). 필요 시 `### 근거`(evidence label `[관측됨]`/`[외부실증]`/`[가설]`) + `### 강도 (ADR-022)`.
- **Mutation Contract (ADR-047 D3 — *enabling*, 자동 차단 0)**: D3는 enabling이라 계약/delta 누락은 reviewer **P2 보고**에 그치고 *어떤 게이트도 막지 않는다*(ADR-047 §정책강도 원문: "자동 차단 0건. 6 필드 누락 시 reviewer P2 라벨로 보고만"). 따라서 어떤 amend도 계약 누락으로 차단되지 않는다 — 아래는 그 위에서의 이번 라운드 관례일 뿐(하드 요건 아님):
  - **신규 standalone `ADR-058` = 본문에 `## Mutation Contract` full 6필드**(Target / Failure mode / Predicted improvement / Preserved invariants / Falsifying evaluation / Rollback path). Phase 12+ 신규 harness ADR이라 full이 자연스럽다. 그 "Falsifying evaluation"은 Phase 1에서 만든 방법(ADR-047 Amendment 1)을 따른다.
  - **base에 `## Mutation Contract`가 있는 ADR(051·010·047·050·056·057 — grep 확인)의 harness amend = base 계약 승계 + `### 결정`/`### 강도`에 delta 한 줄**(failure·falsifier·rollback 축). 반전·강도변경 amend(ADR-051 amend-4가 fan-out을 enabling→constraint로 승격, ADR-057 amend-2가 seam canonical 위치를 정정)엔 특히 이 delta를 명시한다. (enabling이라 누락은 P2 — 하드 요건 아님.)
  - **base 계약이 없는 pre-047 ADR(027·014)의 amend = 새 계약을 억지로 붙이지 않는다.** ADR-047:121 "기존 ADR 사후 retrofit X (Surgical Changes)"는 *기존 본문을 소급 개조하지 말라*는 뜻이지 "신규 amend가 면제"란 뜻이 아니다 — 다만 D3가 enabling이라 신규 amend의 계약 부재는 P2에 그치고, 저장소 관례상 pre-047 ADR의 amend는 계약을 두지 않는다(ADR-027 amend-5/6·ADR-040 amend-4 실측 0개). 정책 강도를 바꾸는 pre-047 amend라면 `### 결정`에 그 사실 한 줄만 남기면 충분.
  - amend는 full 6필드를 반복하지 않는다(양식: 헤딩 anchor → `### 결정` → `### 적용 surface` (+ `### 근거`/`### 강도`)).
- **인덱스 동기**: 모든 신규 ADR/amend는 `docs/90-decisions/boilerplate/README.md` 인덱스 행의 Amendments 컬럼을 **그 ADR을 만드는 같은 커밋에서** 갱신한다(stabilize preflight가 amend 수 불일치를 `P1 [ADR-index]`로 잡음). Phase 5는 최종 감사만 한다.

### D6 거버넌스: grandfather vs 의도적 override (정직 명시)

이번 라운드 amend 중 일부는 ADR-045 D6상 *통합 재발행/supersede* 우선 대상이다. 생성일 기준으로 **grandfather**(ADR-045 = 2026-05-27 *이전* 생성)와 **override**(이후 생성 → D6 적용)를 구분한다:

- **grandfather (amend 정당)**: `ADR-027`(2026-05-16)·`ADR-010`(2026-05-16) — D6 grandfather 조항이 재발행을 "우선 검토(권고)"로만 두므로 amend + `## 현재 유효 결정` 정리로 충분.
- **의도적 override (D6는 재발행을 요구하나 minimal-churn 적용)**: 아래는 ADR-045 *이후* 생성이라 grandfather가 아니며 D6 트리거에 해당한다. **§1.3에서 amend-count 재발행 임계를 4→8로 올렸으므로, "amend 4개 누적" 사유는 override 대상에서 제거**됐다 — 아래는 *reversal·surface-5+* 트리거만 남은 것. 이번 라운드는 사용자 minimal-churn 결정으로 amend override한다:
  - `ADR-051`(생성 2026-06-26) amend-4: #amend-2 정책 뒤집기(enabling→constraint) — **reversal** 트리거(4개 amend 사유는 §1.3으로 소멸).
  - `ADR-056`(생성 2026-07-16) amend-1: **surface 5+** 추가(PX가 7 surface).
  - `ADR-057`(생성 2026-07-16) amend-1: **surface 5+** (로드맵 6 surface) + R3 의미 변경.
  - `ADR-045` amend-1 (§1.3, 재발행 임계 4→8): 재발행 임계 *자체*를 바꾸는 것은 D6상 **정책 파라미터 변경**(경계적 "정책 의미 변경")이라 엄밀히는 supersede 대상이다. **self-amend 특수성** — D6를 *완화*하는 변경을 D6가 제약하는 amend로 처리하므로(부트스트랩 역설), override임을 특히 명시적으로 남긴다. 정책의 *의미*(누적 amend가 많으면 재발행)는 유지하고 트리거 *수치*만 조정하는 enabling 변경이라 amend가 과하지 않다는 판단.
  → **각 해당 amend 본문(`### 결정` 말미 또는 `### 강도`)에** "D6 재발행 대신 minimal-churn amend — 근거: 이번 개선 라운드 결정, 다음 변경 시 통합 재발행" **한 줄을 영속 기록**한다(override 출처가 삭제될 이 가이드가 아니라 ADR에 남게 — 거버넌스 추적성). 위치는 amend마다 다를 수 있으나(예: ADR-045 amend-1은 `### 결정`, ADR-056 amend-1은 `### 강도`, ADR-051 amend-4는 별도 거버넌스 주 callout) *ADR 본문 어딘가에 반드시 영속*되면 된다.
- **대안(strict D6)**: override가 부담스러우면 위 override 대상들(콘텐츠 ADR 051·056·057)을 각각 신규 번호로 통합 재발행(supersede)하고 참조를 re-point한다 — 단 각 ADR#dK 인용이 많아 churn이 커서 "minimal-churn" 취지와 상충한다. (ADR-045 self-amend의 strict 대안은 *ADR-045 자체를 supersede*하는 신규 doc-reference-contract ADR 발행이다 — 콘텐츠 ADR 재발행과 별개 축.) **어느 쪽을 택할지는 사용자 결정**(기본은 override — 사용자가 minimal-churn 선택).

## 착수하지 않는 항목 (명시 — 누락 아님)

아래는 백로그에서 **보류/측정 숙제/폐기**로 판정돼 이 가이드에 편집 단계를 두지 않는다. 나중에 "왜 이건 안 했나" 헷갈리지 않도록 근거를 남긴다.

- **INST-4(관찰)** — 하청이 최종 보고 직전 멈추는 현상. 회수 규율(재시도→직접 확인)은 채택해 Phase 2에서 문서화하지만, **멈춤의 근본 원인(모델 turn 한계·런타임 종료 추정)이 불확실**하므로 위임 문서를 더 손대지 않고 관찰만 유지한다.
- **INST-5** — 디자인 조사·시안 검토 하청 생략. 스킬은 이미 부르라고 돼 있어 **규칙 문제 아님**(깨끗한 별도 세션 재측정 숙제).
- **기타 미검증 3건** — Codex 동일 흐름 / fresh 세션 자동 로드 / 큰 작업 정식 fan-out 실측. 별도 세션 필요, 재측정 숙제.
- **HN-3** — 형제 스킬 혼동. 설명문이 이미 상당히 구분돼 **실제 오호출 재현 시에만** 착수(지금은 보류).
- **HN-1** — repo-local 공통 문서 검증 스크립트. 보일러플레이트는 프로젝트 스택이 정해지기 전 특정 런타임에 의존하지 않는다는 상위 규칙과 충돌하므로 **도입하지 않는다**. 링크 검증은 프로젝트가 선택한 스택·CI 도구로 프로젝트 초기화 후 구성한다.
- **백로그 문서 정규화(PH-0)** — 두 백로그는 곧 삭제할 세션 메모라 정규화 편집은 무의미(이 가이드가 그 내용을 정책으로 옮긴다).

---

# Phase 1 — 거버넌스 기반 (HN-2 + 디자인 정책 SSOT)

**왜 먼저**: 이후 모든 harness ADR은 `## Mutation Contract`의 "Falsifying evaluation" 필드가 필요하므로 그 작성법(HN-2)을 먼저 정한다. 또한 디자인 구현보다 먼저 ADR-058·ADR-049 상태·평가 provenance를 한 커밋에서 확정해, Phase 3의 모든 surface가 이미 존재하는 상위 정책을 참조하게 한다.

## 1.1 ADR-047 Amendment 1 — 변경 검증법 (HN-2)

**기존**: `docs/90-decisions/boilerplate/ADR-047-code-as-agent-harness.md`의 D3(6필드)·D4(falsifying eval default = ADR-017 dogfood 재실행)는 *무엇을 적어야 하는지*만 정하고, **그 falsifying evaluation을 어떻게 값싸게 만드는지 방법이 없다**. 그래서 실제로는 "검증했다"고 글로만 적고 넘어간다. `## 참고` 다음이 파일 끝이며 amendment는 0개다.

**변경**: 파일 맨 끝(`## 참고` 뒤)에 Amendment 1을 추가한다:

```
<a id="adr-047-amend-1"></a>
## Amendment 1 (2026-07-20) — 변경 검증법 (falsifying evaluation을 값싸게 만드는 방법)

### 배경
- [관측됨] D3/D4는 falsifying evaluation을 *의무화*했으나 *만드는 방법·러너*가 없어, 실제로는 "검증함"을 산문으로만 적고 넘어갔다(문서 전수 확인).
- [외부실증] 규칙 문구 실패는 두 종류다 — **규율 실패**(모델이 규칙을 무시)와 **모양 실패**(모델이 규칙을 따르려 하나 출력 형태가 틀림). superpowers 실측: *금지문("~하지 마라")*은 규율 실패엔 유효하나 **모양 실패엔 오히려 역효과**(대조군보다 나쁜 출력)이며, 모양 실패는 "이렇게 해라" 긍정 레시피로 고쳐야 한다.

### 결정
1. **실패 유형 분류 먼저**: harness 문구를 바꾸기 전에 막으려는 실패가 *규율 실패*인지 *모양 실패*인지 분류한다. 규율 실패 → 금지문 OK. 모양 실패 → 금지문 금지, 긍정 레시피("이 입력이면 이렇게 출력")로 작성.
2. **대조군을 둔 초저비용 문구 테스트를 기본 falsifying evaluation으로**: 바꾼 문구가 실제로 행동을 바꿨는지, *바꾸기 전 문구(대조군)* 대비 소수(≈5회) 시행으로 비교한다. 비싼 전체 dogfood 재실행(D4 default) 전에 이 값싼 테스트를 먼저 통과해야 한다.
3. **정적 검사 vs 행동 fixture 분리**:
   - *정적 검사*는 프로젝트 스택이 정해진 뒤 그 스택의 formatter·linter·CI로 구성한다. 보일러플레이트 공통 런타임·검증 스크립트는 두지 않는다.
   - *행동 fixture*(스킬이 특정 입력에 특정 판정을 내리는지)는 드리프트 잦은 소수 스킬(validate-*·bootstrap-stack 등)에 한해 "이 입력 → 이 판정" 예시 3~5개를 **사람이 확인하는 체크리스트**로 둔다(자동 실행 X — 스킬은 여러 파일·상태를 다뤄 자동화 불가, 21개 파일화 금지).
4. D4의 dogfood 재실행 default는 유지하되, 본 Amendment의 값싼 테스트가 그 *앞단 게이트*임을 명시.

### 적용 surface
- docs/90-decisions/boilerplate/_ADR_GUIDE.md

### 강도 (ADR-022)
- enabling(약) — 방법·러너 명시. 자동 차단 없음.
```

**왜**: 우리 스스로 의무화한 필드에 실체를 준다. 외부 레포 3개(superpowers 방법론·remotion 러너·marketing-skills 픽스처)가 독립적으로 이 구멍을 지목했다.

## 1.2 _ADR_GUIDE.md 포인터 (HN-2)

**기존** (`docs/90-decisions/boilerplate/_ADR_GUIDE.md` 마지막 섹션):

```
## Harness Mutation Contract (ADR-047)

본 ADR이 `.claude/skills` / `.claude/agents` / `AGENTS.md` / `.agents/skills` / `.codex/config.toml` / lifecycle ADR 중 *어느 하나라도* 수정한다면 ([ADR-047](ADR-047-code-as-agent-harness.md) D3 대상 surface), 본문에 `## Mutation Contract` 섹션 6 필드(Target / Failure mode / Predicted improvement / Preserved invariants / Falsifying evaluation / Rollback path)를 명시한다. ADR-022와 양립 — evidence label은 그대로, Mutation Contract는 변경 governance 양식.
```

**변경**: 이 문단 끝에 한 줄을 덧붙인다:

```
- **"Falsifying evaluation" 필드 작성법**: 실패 유형(규율 실패→금지문 / 모양 실패→긍정 레시피)을 분류하고, 대조군을 둔 초저비용 문구 테스트를 기본 검증으로 삼는다. 정적 검사는 프로젝트 스택 확정 후 그 스택의 도구로 구성하고, 행동 fixture는 소수 스킬 사람-확인 체크리스트로 둔다(상세: [ADR-047](ADR-047-code-as-agent-harness.md)#amend-1).
```

**왜**: ADR-047 본문이 SSOT이고, _ADR_GUIDE는 한 줄 포인터만 둔다(문서 비대 방지).

## 1.3 ADR-045 Amendment 1 — D6 통합 재발행 임계 4→8 상향 (사용자 결정)

**왜 먼저**: 이 규칙 상향이 뒤 Phase의 override 판단에 영향을 주므로 Phase 1(거버넌스 기반)에서 먼저 반영한다.

**배경**: D6는 "개정(amend) **4개 이상** 누적 → 통합 재발행"을 요구한다. 그러나 D5가 amend 4개+에서 `## 현재 유효 결정` 요약을 이미 의무화해 *가독성은 그 요약이 담당*한다 — 4개는 요약 도입 전 기준이라 과하게 낮다. 재발행은 요약이 있어도 탐색이 실제로 힘들어지는 수준(≈8)에서만 강제한다.

**변경 (a) — D6 표 행은 *그대로 둔다* (append-only Record — ADR-051 선례)**.

ADR은 Record라 원 결정 텍스트를 덮어쓰지 않는다(convention 확인: ADR-051은 corrective amendment에서도 원 `## 결정`을 유지하고 변경을 Amendment에만 기록 — STRUCTURE.md#l12 ADR=Record). 따라서 ADR-045 D6 표의 다음 행은 **손대지 않는다**:

```
| 개정(amend) 4개 이상 누적 | 통합 재발행(supersede)로 클린 ADR 재작성. 구 ADR은 `superseded`로 history 잔존 |
```

4→8 변경은 아래 **(d) Amendment 1**(신규 규칙 기록)과 **(b) `## 현재 유효 결정`**(net 현재 규칙 = 8)이 담당한다 — 원 표 행(4)은 historical Record로 남고, D5 fast-path 요약과 Amendment가 현재 규칙(8)을 전달한다(D5 설계: 상단 요약=빠른 현재-규칙 경로, 본문 표=역사; body-vs-amendment 분기는 append-only의 정상 상태).

**변경 (b) — 상단 `## 현재 유효 결정` 요약 줄**.

**기존**:

```
- amend는 작게 유지. 정책 의미 변경·기존 결정 뒤집기·surface 5+ 추가·개정(amend) 4개 이상 누적은 신규 supersede ADR로 간다(ADR-045 이후 *신규 변경* 기준 — 기존 ADR은 grandfather, D6).
```

**변경**:

```
- amend는 작게 유지. 정책 의미 변경·기존 결정 뒤집기·surface 5+ 추가는 신규 supersede ADR로 간다. 개정(amend) 8개 이상 누적도 통합 재발행(4~7개는 D5 요약으로 충분 — #amend-1로 4→8 상향). (ADR-045 이후 *신규 변경* 기준 — 기존 ADR은 grandfather, D6.)
```

**변경 (c) — `docs/90-decisions/boilerplate/_ADR_GUIDE.md`**.

**기존**:

```
- 개정(amend) 4개 이상 누적 → 통합 재발행(supersede)로 클린 ADR 재작성, 구 ADR은 `superseded`로 잔존.
```

**변경**:

```
- 개정(amend) 8개 이상 누적 → 통합 재발행(supersede)로 클린 ADR 재작성, 구 ADR은 `superseded`로 잔존. 4~7개는 `## 현재 유효 결정` 요약(D5)이 가독성 담당(재발행 불요 — ADR-045#amend-1).
```

**변경 (d) — ADR-045 파일 맨 끝에 Amendment 1 추가**.

```
<a id="adr-045-amend-1"></a>
## Amendment 1 (2026-07-21) — D6 통합 재발행 임계 4→8 상향

### 결정
D6의 "개정(amend) 4개 이상 누적 → 통합 재발행" 임계를 **8개 이상**으로 올린다. 근거: D5가 amend 4개+에서 `## 현재 유효 결정` 요약을 의무화해 **4~7개 구간의 가독성을 이미 담당**하므로, 하드 재발행 캡은 요약이 있어도 탐색이 힘들어지는 수준(≈8)에 두는 게 맞다. (원래 '4'는 ADR-045 첫 커밋부터 **D5 요약 의무화 임계와 같은 값으로 함께 설정된** 초기 보수값이다 — D5 도입과 선후 관계가 아니라 동시 설정. 실사용상 과소로 판단해 상향.) **정책 의미 변경·기존 결정 뒤집기·surface 5+ 추가 트리거는 불변** — 그건 *변경 규모* 기준이지 *누적* 기준이 아니다.

거버넌스 주: 재발행 임계 자체를 바꾸는 것은 D6상 경계적 "정책 의미 변경"이라 엄밀히는 supersede 대상이나, 정책의 *의미*는 유지하고 트리거 *수치*만 조정하는 enabling 변경이므로 이번 라운드 minimal-churn 결정에 따라 amend로 처리한다(D6 재발행 대신 minimal-churn amend — 근거: 이번 개선 라운드 결정, 다음 변경 시 통합 재발행).

### 적용 surface
- docs/90-decisions/boilerplate/ADR-045-doc-reference-contract.md (`## 현재 유효 결정` 요약 — D6 표 원행은 Record로 *보존*, 덮어쓰지 않음)
- docs/90-decisions/boilerplate/_ADR_GUIDE.md (amend/supersede 기준 줄 — 운영 가이드라 현재 규칙 반영)
- .claude/skills/stabilize-milestone/SKILL.md (`[ADR-index]` fence-aware amendment count)

### 강도 (ADR-022)
- enabling(약) — 임계 조정, 되돌리기 쉬움.
```

**변경 (e) — `[ADR-index]` preflight 오탐 차단 (F2)**. ADR-045 `### D2` 예시 블록 안에 리터럴 `## Amendment 1 — ...`(anchor `adr-027-amend-1`)이 있다. stabilize `[ADR-index]` preflight는 `## Amendment N` 헤딩 수 ↔ README Amendments 컬럼을 대조하는데, 코드펜스를 무시하지 않으면 이 *예시* 헤딩까지 세어 README와 어긋난다(실제로 amend-1 추가 전인 지금도 "예시 1 vs README 0"으로 잠복 중; amend-1 추가 후엔 "2 vs 1"). 경고 문구만으론 안 고쳐지므로 둘 다 손본다:

**(e-1)** ADR-045 D2 예시 헤딩을 숫자 없는 placeholder로 바꿔 리터럴 충돌을 제거한다.

기존:
```
<a id="adr-027-amend-1"></a>
## Amendment 1 — ...
```
변경:
```
<a id="adr-027-amend-M"></a>
## Amendment <M> — ...
```
(D2 본문 규칙 "anchor id 규칙: `adr-<번호>-amend-<M>`"과 일관된 예시가 된다.)

**(e-2)** stabilize `[ADR-index]` preflight를 fence-aware로 만든다. `.claude/skills/stabilize-milestone/SKILL.md`의 인덱스 동기 항목 문구를 "본문 `## Amendment N` 수 일치"에서 **"코드펜스(```)·`<!-- -->` 주석 *밖의* 본문 `## Amendment N` 수 일치(예시·주석 헤딩 제외)"** 로 바꾼다. 그래야 앞으로 어떤 ADR이 D2류 예시를 둬도 오탐이 없다.

**왜**: 4개는 (D5 요약 의무화 임계와 같은 값으로 첫 커밋부터 함께 설정된) 초기 보수값으로, D5 요약이 4~7 구간 가독성을 담당하는 지금 기준으론 과소다. 8로 올리면 **ADR-051(4 amends)의 *amend-count* 재발행 트리거가 사라진다**(→ 아래 §2.1의 override 근거가 "reversal(정책 뒤집기)"만 남음). surface-5+·reversal 트리거는 그대로라 ADR-056(7 surface)·ADR-057(6 surface+정책변경) override는 유지된다.

**같은 커밋의 인덱스 동기** (`docs/90-decisions/boilerplate/README.md`): ADR-047 행에 `+#amend-1: 변경 검증법(falsifying evaluation 작성법)`, ADR-045 행에 `+#amend-1: D6 재발행 임계 4→8`을 추가한다. 본문 amendment와 인덱스 중 하나만 있는 중간 커밋을 만들지 않는다.

> **커밋 (Phase 1-A — 변경 거버넌스)**:
> `feat(governance): raise D6 reissue threshold and add change-verification method (ADR-045/047 amend 1)`


## 1.4 신규 `ADR-058` — Design Workflow (ADR-049 supersede) [DS-1 · DS-3 · DS-5]

**변경**: 새 파일 `docs/90-decisions/boilerplate/ADR-058-design-workflow.md`를 만든다:

```markdown
# ADR-058 — Design Workflow (reference flow + acceptance gate + concept cards)

> scope: boilerplate
> area: design

## Status
accepted

> 대체: [ADR-049](ADR-049-concept-mockup-first-design.md)를 supersede한다(디자인 워크플로우 라운드 구조·R0 grounding·시안 정책 전부). ADR-049는 `superseded`로 history 잔존. DESIGN.md *내용*·인터페이스 할당 SSOT는 [ADR-027](ADR-027-interface-decision-allocation.md)이 계속 소유(본 ADR은 흐름·게이트·리서치·시안 카드만).
> 승격 범위(정직 — *status 축*과 *검증 축*은 별개다):
> - **status = `accepted`** — 저장소 `_ADR_GUIDE`상 accepted는 *운영 채택*을 뜻하지 검증 완료가 아니다(wiring이 이미 accepted 전제로 짜여 정합; `trial`은 허용 status가 아니라 분리 불가).
> - **D3 수용 게이트는 지금 constraint** — ADR-022는 constraint에 `[관측됨]` *또는* `[외부실증]`을 요구하고(둘 중 하나면 자격 충족), repo-local `[관측됨]`으로 충족된다. **실측 개선 축은 serious/critical axe**(design-eval — repair loop로 serious 5/8→0/8). 320 overflow·clip은 게이트가 *결정적으로 상시 검사*하는 축이지만 이 eval에서 5/8→0/8 수치를 낸 건 axe다(320/clip을 같은 수치로 뭉뚱그리지 않는다). 별도 "강 승격" 관문은 없다(constraint 자체가 ADR-022 '강').
> - **나머지(R0 evidence-on-demand·REFINE/EXPLORE·cross-model·실화면 a11y)는 directional/enabling — 미검증 명시.**
> - **REPORT §13 용어 정정**: REPORT는 7기준을 "`accepted` 승격 조건"으로 적었으나, 이는 저장소 status(accepted=채택)보다 엄격한 *완전 실증* 의미다. 저장소 거버넌스에선 그 7기준을 **신뢰도(Medium→High)·외부 일반화 승격 조건**으로 읽는다(원본 REPORT는 local-only/gitignored이고 핵심 판정은 SIMULATION_RUN.md design-eval에 distill·보존, 본 ADR이 용어를 정정 — 조용한 덮어쓰기 아님). 기준 2(게이트 결함 0)·3(blind visual 5% 이내 — *게이트와 다른 축*)만 탐색적 충족, 나머지 5개 미검증. 미검증 부분은 아래 재검토 트리거가 관장(충족 시 신뢰도·일반화 승격; 미충족 신호 누적 시 그 부분 후퇴).

## 현재 유효 결정
- `/bootstrap-design` 라운드 구조 SSOT는 본 ADR: R0(리서치 + `DESIGN_RESEARCH.md`) → R1(원칙 + voice 기본값) → R2(다중 concept 시안 — DESIGN.md 작성 *전* 시각 방향 선택) → R3(토큰) → R4(컴포넌트) → R5(DESIGN.md 저장) → R6(파생 preview 확인 + 정리).
- **R0 = evidence-on-demand**(D2): AI 자율 리서치가 디폴트, 사용자 입력은 옵션 힌트. Layer A(방향)/B(값 grounding — 핀 URL)/C(포맷 — R5 fixture만). role 3종, counter-reference 조건부, 고정 쿼터 없음(coverage 정지, 최종 3~5개), 최소 기록 schema.
- **R2/R6 수용 게이트**(D3): full 모드는 concept마다 1280+375 렌더 + 독립 reviewer 픽셀 판정, 320 reflow·populated axe 상시, block/report 등급, repair loop(retry ≤2). *진짜 품질 지렛대*.
- **R2 시안 카드 = REFINE / EXPLORE**(D4): 안전/과감 아님. signature는 primary task 이해를 도울 때만.
- 취향 오라클=사용자, 생성(designer)/감사(reviewer[design]) 분리 유지(D5).

## 배경
- [관측됨] 실사용 fork에서 시안이 단조롭고 어디서 본 듯함 + R0 grounding이 median으로 조용히 후퇴(슬롭 근본원인). 레퍼런스 값 추출이 실제 제품 페이지에서 자주 실패(Linear/Stripe/Vercel 0/3 — markdown 변환으로 CSS 소실).
- [관측됨] repo-local 엄밀 재검증(`.boilerplate/validation/SIMULATION_RUN.md`의 "Design Workflow Eval" 섹션 — Stage1 24안 블라인드 2인 + B3 8안 + holdout 2인, 2브랜드, 실제 1280/375/320 렌더+axe. 원본 산출물(REPORT·concept HTML·metrics)은 무거워 local-only/gitignored, distill이 판정 기록 보존(원자료 수치검산·재현은 불가). ADR-022상 저장소-로컬 평가는 `[관측됨]` — `[외부실증]`은 외부 다중 repo 실증에만): ① 레퍼런스 규칙을 잔뜩 더해도 평균 시각 점수 향상 0, 문맥 +76% ② 최초 24안 중 12안이 serious axe 위반 ③ 실패 selector 되먹임 1회 repair로 3/8→8/8 통과. → 품질을 만든 건 리서치가 아니라 **수용 게이트 폐쇄 루프**.

## 결정
1. **라운드 구조 R0~R6** — 위 현재 유효 결정 순서. `--fast`(R2·R4·R6 생략, R5 저장은 유지) / `--update`(부분 갱신) 존재.
2. **R0 evidence-on-demand**:
   - 디폴트는 **AI 자율 리서치**. 사용자 제공 URL·취향은 *우선 힌트*(prerequisite 아님) — 있으면 Layer A에 우선 반영, 없어도 확인 게이트 없이 자율 진행.
   - **Layer A (방향)**: charter의 기획 방향·서비스 성격에 맞는 디자인 방향·레퍼런스 제품을 AI가 스스로 탐색(정성 방향 어휘).
   - **Layer B (값 grounding)**: Layer A 방향에 맞는 오픈소스 토큰 패키지에서 실제 값 추출 — **핀 고정 목록**(Primer/Radix/Polaris/Tailwind/shadcn 검증된 원본 주소)으로 추측·404 제거. raw CSS + JSON 토큰 엔드포인트까지. mobbin·copycats류 가짜 요약 사이트 거부. 닫힌 제품(Linear 등)은 "추출 불가 — <사유>" 정직 표기.
   - **Layer C (포맷·완성도)**: Google 공식 예시 DESIGN.md(`google-labs-code/design.md/examples`)로 섹션 완성도·빠짐 점검 — **선택이 끝난 R5에서 format fixture로만**(창작 컨텍스트 R0~R2에 넣지 않는다 — 공식 예시 `atmospheric-glass`가 glassmorphism/보라 그라디언트로 §9 anti-slop 위반이라 미감 오염). authoritative는 Google 공식 예시 3종만, `designmd.directory`·커뮤니티 미러는 lead로만.
   - **role 3종**: `task/behavior` · `identity/craft` · `implementation system`. **한 canonical 레퍼런스가 여러 role을 겸하면 우선**(brand-fit과 groundable을 동시에 만족하는 소스 — role은 다중값 허용); 겸비가 불가할 때만 role별로 분리한다(겸용 우선, 안 될 때 분리). counter-reference(안티-레퍼런스)는 별도 role이 아니라 *미해결 tension이나 실제 monoculture가 있을 때만* 추가(mandatory anti-pole 폐기).
   - **고정 최소 개수 없음** — evidence coverage가 차면 정지. designer 최종 입력 보통 3~5개 이하(단순 내부 도구는 더 적게). primary task·결정 순간·실패/복구·정체성 tension을 먼저 적어 리서치의 방향타로 삼는다.
   - concept 안에서는 **coherent primary system 1개**. 명시 gap 시에만 secondary primitive(**Radix는 *색만* fallback** — 타이포/레이아웃/IA/모션은 ground 못함, semantic mapping·대비검증 별도).
   - **관측 기반 주장만**: visual 주장은 실제 화면/스크린샷을 봤을 때만, behavior 주장은 docs/interaction을 봤을 때만 기록. broad search·gallery·Dribbble/Behance는 이름 찾는 lead로만 허용 후 canonical 제품·공식 문서·live 스크린샷·source/token 코드로 승격.
   - **최소 기록 schema** (DESIGN_RESEARCH.md): `source/canonical | role | 뒷받침한 결정 | 검증유형(visual/behavior/code) | 관측일 | borrow | avoid | confidence/caveat`. quality-tier·cluster-quota·groundable-count 같은 실험용 label은 정책 필드로 만들지 않는다(기록 비용 > 결정 품질).
3. **R2/R6 수용 게이트**:
   - **항상(값싼·결정적 — 러너가 계산)**: **320px 브라우저 geometry** — page overflow + **element viewport escape + clipped/truncated text**(narrow ≤375 — design-workflow eval(SIMULATION_RUN.md design-eval; 원본 local-only)의 `check-reflow-320.cjs` `getBoundingClientRect`·overflow-clip 로직 이식) + **populated-state axe**(실데이터 채운 화면 *전제* — 입력 계약; 러너는 axe를 돌리고 "실제로 채워졌는지"는 reviewer 스크린샷이 backstop으로 확인). **overflow·escape·clip은 러너가 결정적으로 잡는다**(design-eval 실측 검증분 — geometry는 픽셀 취향이 아니라 좌표 계산이라 결정 가능). **단 정상 UI 오탐 제외**: sr-only/visually-hidden(1px·clip/clip-path)·aria-hidden/inert/닫힌 drawer·overflow scroll/auto 조상 안(contained 가로스크롤=의도적, 예: 넓은 표)·의도적 `text-overflow:ellipsis`는 escape/clip에서 뺀다(실브라우저 검증분 — 러너 코드에 반영). reviewer 픽셀은 *주관적* 판정(위계·밀도·slop·overlap)만 담당한다.
   - **full 모드**: 각 concept을 1280 + 375로 항상 렌더 → **독립 reviewer(design surface)가 픽셀로** 위계·밀도·domain fit·장식 slop 판정(HTML-read source 감사와 별개 — 세 검사가 서로 다른 결함을 잡아 대체 불가). LLM reviewer는 1명이면 충분.
   - **차단(block) — 러너 결정적**(design-gate.mjs가 계산): serious/critical axe · page overflow · **viewport escape · clipped text**(320/375 geometry). **차단(block) — reviewer 픽셀 판정**(스크린샷으로 판단, 러너가 못 잡는 *주관적* 영역): 위계 붕괴(nested card·장식 rail) · 밀도 · 장식 slop · critical overlap이 primary task를 저해할 때. **보고(report)**: moderate/minor axe + 취향·밀도 finding. **수동 smoke**(자동 불가분): Tab 순서 · visible focus · trap 없음 · Escape close · 색 외 상태표식.
   - **repair loop**(핵심): 실패 selector + 요약을 designer에 되먹여 재실행. **retry ≤2, 초과 시 승인 보류 + brief/source 재검토**(무한 루프 방지), 여전히 fail이면 승인 불가. 통과본 외 임시 렌더/스크린샷은 정리.
   - 게이트는 concept/preview·선택 프로토타입 **1회성에서만**(per-task hot-loop 금지). Playwright/axe는 stack-guard 선설치분 재사용(추가 의존 0).
   - `--fast`/`--update`: research·독립 reviewer 생략은 명시 사유 echo(silent skip 금지). **게이트 적용은 모드가 아니라 산출물 기준** — `--fast`는 R2·R6를 생성하지 않으므로 게이트 적용 대상 없음(N/A), `--update`가 concept/preview를 생성·재생성하면 그 산출물엔 게이트 필수.
4. **R2 시안 카드 REFINE / EXPLORE**: 두 기본안을 **REFINE**(익숙한 task convention 우선 + restrained signature) / **EXPLORE**(signature-led이되 *같은* 익숙한 control/flow 보존)로 정의(안전/과감 아님 — novelty가 목표라는 오해 차단). 3번째 안은 *풀리지 않은 명시적 tension이 있을 때만*. 카드 필드: `task hypothesis | preserved convention | visible signature | failure sign`. **signature가 primary task를 더 빨리 이해시키지 못하면 장식 → 제거**(실험에서 rail·route 장식이 coherence를 해침).
5. **취향 오라클·생성/감사 분리 (D5 — ADR-049 승계)**: 취향 오라클=사용자(선호 추천·순위 금지, 물으면 예외). concept authoring=designer, 구별성·픽셀 감사=reviewer[design](자기 비평 금지). parallel-merge 금지(순차 생성→비평→선택). **harness degradation (Codex 등 독립 subagent 미지원 경로)**: 독립 subagent 격리가 없는 harness에서는 gen/audit가 동일 세션 *순차 페르소나*로 degrade한다 — 이때 (a) designer→reviewer 페르소나 전환을 *명시적 단계*로 끊고, (b) 감사 독립성 저하를 산출물에 `under-verified: 동일 세션 감사`로 명시하며, (c) 완전 독립 감사가 요구되면 사용자 승인 보류. **단 결정적 렌더 게이트(`design-gate.mjs`)는 세션 격리와 무관하게 그대로 실행**되므로 배포불가 결함(serious/critical axe·320 geometry)은 Codex 경로에서도 결정적으로 차단된다(감사 *독립성*이 degrade해도 *안전 게이트*는 유지).

## 근거
- 대안 A(현행 유지 B0): raw 시각/비용은 최선이나, acceptance gate 없이는 배포불가 결함(serious axe)이 승인까지 통과 — 유지 불가.
- 대안 B(리서치 대폭 강화 B1/B2): 평균 시각 향상 0, 문맥 +76%, 고정 lane이 무관 근거를 끌어와 task 적합도↓ — 채택 안 함(축소).
- 채택(B3형 = 얇은 evidence-on-demand + task 기여 2안 + 독립 렌더/DOM 수용 게이트): 실험상 serious 5/8→0/8, holdout 최고안이 incumbent와 0.5/50 차이.
- 신뢰도: **Medium** — 2브랜드·same-model·static prototype·B3 post-hoc라 cross-project 다양성·작은 시각점수 차는 일반화 금지(design-eval 신뢰도·한계 — SIMULATION_RUN.md). directional 근거.
- 재검토 트리거(SIMULATION_RUN.md design-eval = 원 REPORT §13) 7기준(동일 brief 2회 비교 / archetype별 serious·320·clipping 0안 매 반복 제공 / blind 평균 5% 이내 / quota 없음 확인 / --fast·--update silent skip 없음 / Claude·Codex 축소 경로 실행 / 키보드·focus·escape·SR name·동적 상태 실화면 검사)은 **신뢰도(Medium→High)·외부 일반화 승격 조건**이다(accepted 채택 자체를 막는 조건이 아님 — accepted는 이미 성립, D3 constraint는 [관측됨]으로 충족). 미충족 신호가 누적되면 해당 부분(리서치·카드 등 directional)을 후퇴시킨다. archetype 확대·cross-project 다양성 측정 시 재검토.

## Mutation Contract (ADR-047 D3)
1. **Target** — bootstrap-design SKILL R0~R6·`--fast`·`--update` + `allowed-tools`(렌더·axe 실행) / `scripts/design-gate.mjs` 러너 / plan-milestone R5 게이트(allowed-tools + R5-5) / researcher.md 디자인 레퍼런스 모드 / designer.md(카드·signature·PX 마커) / reviewer.md(design surface 렌더 증거·픽셀 판정·bootstrap-design 호출자 등재) / DESIGN_RESEARCH.md 스키마 / stack-guard(populated axe·320 reflow) / DESIGN.md §0 주석 R0~R6 / STRUCTURE·WORKFLOW·.gitignore의 ADR-049→ADR-058 re-point.
2. **Failure mode** — R0 grounding이 median으로 조용히 후퇴 + 독립 감사가 렌더·DOM을 안 봐 배포불가 결함(serious axe·320 overflow) 통과 + 시안이 "다르기만" 하고 안전·평범(전부 관측됨/실측).
3. **Predicted improvement** — serious axe 제거(실측 5/8→0/8) + 320 geometry 결함 차단(별도 결정적 축 — 같은 수치로 뭉뚱그리지 않음), 레퍼런스 값 확보 안정화, REFINE/EXPLORE로 의도된 개성.
4. **Preserved invariants** — DESIGN.md 시각 SSOT / preview·concept ephemeral(ADR-005) / 취향 오라클=사용자 / 생성·감사 분리 / RGR inner-loop 스크린샷 hot-loop 금지(게이트는 1회성 carve-out) / 비-UI DESIGN.md 삭제 경로 / skill auto-invocation 금지 / ADR-027 DESIGN 내용·인터페이스 SSOT 지위.
5. **Falsifying evaluation** — SIMULATION_RUN.md design-eval의 재검토 트리거(= REPORT §13 7기준) 재실행에서 새 흐름이 archetype별 serious/320/clipping 0안을 매 반복 제공 못 하거나 blind 평균이 current 대비 5% 초과 하락하면 게이트·리서치 강도 재조정(ADR-047#amend-1 방법 — 대조군을 둔 저비용 비교 먼저). 정적 검사는 프로젝트 스택 확정 후 해당 도구로 구성한다.
6. **Rollback path** — ADR-058을 *새 supersede ADR*로 되돌린다: ADR-058을 supersede하는 신규 ADR을 발행해 라운드 구조(R0 5단 위계·divergence 카드·visual-QA scaffold)를 재채택하고 렌더 게이트·evidence-on-demand·REFINE/EXPLORE를 제거하며 surface를 새 ADR로 re-point한다. **ADR-049 status를 accepted로 되돌리지 않는다** — supersede는 history 영속(ADR-045)이라 status 되돌리기는 기록 왜곡이다.

## 정책 강도 (ADR-022)
- D3 수용 게이트의 block 등급(serious/critical axe·320 overflow·viewport escape·clipped text)은 **constraint(ADR-022 '강')**. ADR-022는 constraint에 `[관측됨]` *또는* `[외부실증]`을 요구하는데(둘 중 하나면 충족), 게이트가 배포불가 결함(serious/critical axe·320 geometry — WCAG·브라우저 기준)을 제거하는 효과가 `[관측됨]` repo-local 평가(design-eval — serious 5/8→0/8)로 확인되므로 **지금 constraint 자격을 충족**한다. 신뢰도는 Medium 유지 — 외부 다중 repo 실증이 쌓이면 `[관측됨+외부실증]`으로 신뢰도·일반화가 오른다(ADR-022 "제약 강하게"; constraint *자격*은 이미 충족이라 별도 승격 관문 아님). R0 evidence-on-demand·REFINE/EXPLORE·report 등급은 enabling(약).

## 결과
- 디자인 흐름의 품질 지렛대가 "리서치 양"에서 "수용 게이트 폐쇄 루프"로 이동. 레퍼런스는 얇게, 게이트는 결정적으로.

## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT)
- .claude/skills/bootstrap-design/SKILL.md
- .claude/skills/stack-guard/SKILL.md
- docs/20-system/DESIGN.md                  — 현재 디자인 흐름 근거
- docs/00-meta/STRUCTURE.md
- docs/00-meta/WORKFLOW.md
- docs/00-meta/DELEGATION_STRATEGY.md
- docs/00-meta/PROJECT_START_CHECKLIST.md
- docs/90-decisions/boilerplate/ADR-027-interface-decision-allocation.md
- docs/90-decisions/boilerplate/ADR-040-external-research-capability.md
- docs/90-decisions/boilerplate/ADR-056-milestone-experience-contract.md
- README.md
- README_ko.md
- .gitignore

## 참고
- ADR-027 (DESIGN 내용·인터페이스 SSOT), ADR-040#amend-4 (researcher 디자인 레퍼런스 모드), ADR-056 (R5 프로토타입·경험 계약), ADR-047 (mutation contract), ADR-045 (참조 계약), ADR-053 (parallel-merge 금지), ADR-005 (SSOT).
```

**왜**: 사용자 URL 1순위(ADR-049 R0)를 "AI 자율 디폴트"로 뒤집는 것은 기존 결정 번복이라 ADR-045 D6상 amend가 아니라 supersede(신규 ADR)가 맞다. 게이트를 constraint로 박아 배포불가 결함을 빌드 전에 실제로 제거한다.

**Surface 순서 규칙**: Phase 3/4에서 실제 producer·caller를 만들 때 `researcher.md`·`designer.md`·`reviewer.md`·`scripts/design-gate.mjs`·`plan-milestone/SKILL.md`를 각각 **그 producer/caller 커밋에서** ADR-058 `## Surfaces`에 추가한다. 존재하지 않거나 ADR-058 역참조가 없는 surface를 Phase 1에서 미리 등재하지 않는다.

## 1.5 design-workflow eval 산출물 처리 — gitignore + SIMULATION_RUN.md distill (사용자 결정, 이번 라운드 선반영)

ADR-058이 `[관측됨]`으로 인용하는 평가 산출물(`design-workflow-eval-20260720/` — 293파일·~35MB: REPORT 462줄 + concept HTML 32안 + metrics JSON + blind/holdout + microtests)은 무겁다. **소형 evidence bundle을 커밋하는 대신, 폴더 전체를 gitignore(local-only)하고 핵심 판정만 `.boilerplate/validation/SIMULATION_RUN.md`의 "Design Workflow Eval" 섹션에 distill한다**(사용자 결정 — bundle 커밋의 backlog dead-link·이미지 참조·로컬 절대경로·내부 링크 깨짐 문제를 한 번에 회피). ADR-058의 `[관측됨]` provenance는 그 distill 섹션이 소유한다.

**이 처리는 ADR-058과 같은 Phase 1-B 커밋에서 실행한다**:
- `.gitignore`에 `.boilerplate/validation/design-workflow-eval-20260720/` 폴더 전체 ignore(기존 PNG/JPG-only 블록 대체).
- `git rm -r --cached`로 기존 tracked 산출물 79파일 untrack(worktree엔 local-only로 잔존).
- `SIMULATION_RUN.md` "Design Workflow Eval" 섹션 = 질문·설계 · 핵심 판정 6건 · DS-1~7 판정 · 신뢰도 · §13 재검토 트리거 distill(판정 기록 보존 — 원자료 수치검산·재현은 local-only라 불가; `[관측됨]` provenance).

**ADR-058 작성과 같은 Phase 1-B 커밋에서**: `[관측됨]` 근거·Falsifying evaluation 재검토 트리거는 폴더 경로가 아니라 **`.boilerplate/validation/SIMULATION_RUN.md`의 "Design Workflow Eval" 섹션**을 가리킨다(ADR-058 본문 §배경·Falsifying evaluation에 반영됨). 별도 evidence-bundle 커밋은 **없다**.

## 1.6 ADR-049 → superseded 표기

**기존** (`docs/90-decisions/boilerplate/ADR-049-concept-mockup-first-design.md` 상단 — `## Status` 아래 값 줄만 대상):

```
## Status
accepted
```

**변경**: `_ADR_GUIDE` "대체 절차"를 정확히 따른다 — **Status 값은 상태어(`superseded`)만** 두고, 대체 정보는 **ADR 제목 아래 별도 줄**로 기록한다(저장소 관례상 Status 값에 긴 설명을 욱여넣지 않는다 — 부분 supersede만 짧은 괄호를 달고 그건 `accepted` 유지; ADR-049는 *전면* supersede라 bare `superseded`). `## 현재 유효 결정` 헤딩·본문은 건드리지 않는다(history 잔존).

(1) `## Status` 값 교체:
```
## Status
superseded
```
(2) ADR-049 제목(H1) 바로 아래에 대체 줄 1개 추가:
```
> 대체: [ADR-058](ADR-058-design-workflow.md) (2026-07-21 — 라운드 구조·R0 grounding·시안 정책 전부 ADR-058로 이관; 본 ADR 본문은 history로 보존)
```

**왜**: `_ADR_GUIDE` "대체 절차"(① status→`superseded` ② 상단 "대체: ADR-xxx" 별도 표기 ③ 신규 ADR이 구 ADR 참조) 준수 — Status 값에 서술을 섞지 않는다.

**변경 (b) — orphan `## Surfaces` 제거 (F1 — [Surface-backref] 오탐 차단)**: ADR-049는 본문 끝에 `## Surfaces` 블록(fan-out SSOT)을 갖는다. §1.7이 그 등재 파일들의 `ADR-049` 역참조를 `ADR-058`로 re-point하면 역참조가 사라지는데, stabilize `[Surface-backref]` forward-check(`.claude/skills/stabilize-milestone/SKILL.md`의 "Surfaces forward check" 항목)는 `## Surfaces`를 가진 *모든* ADR에 각 파일의 `ADR-NNN` 역참조 존재를 요구하며 **superseded 예외가 없다** → 완전 re-point된 파일마다 `P1 [Surface-backref] ADR-049 → <file>`가 터진다(이건 인용의 [Ref-dead] P2와는 *별개* 검사라 P2 강등으로 안 덮인다). 그래서 supersede 시 **ADR-049 본문 끝의 `## Surfaces` 블록을 통째로 삭제**한다 — superseded ADR은 live sync 소스가 아니고, 그 surface는 이제 ADR-058 `## Surfaces`가 소유한다(결정 본문·`## 현재 유효 결정`은 history로 남기고, fan-out 포인터인 Surfaces 블록만 제거 — 결정 history 손실 0).

**변경 (c) — forward-check에 superseded 예외 (F1 일반화 — 미래 supersede 대비)**: (b)와 별개로, 앞으로의 어떤 supersede에서도 같은 오탐이 안 나게 `.claude/skills/stabilize-milestone/SKILL.md`의 "Surfaces forward check" 항목 문구에 한 줄을 더한다 — **"대상 ADR의 `## Status`가 `superseded`/`deprecated`면 forward-check에서 skip한다(live sync 소스만 점검 — 죽은 ADR의 잔존 Surfaces는 별도 [Ref-dead]가 담당)."** (b)는 지금 ADR-049를 정리하고, (c)는 클래스 전체를 막는다.

## 1.7 ADR-058 인덱스·현재 정책 참조 동기 (Phase 1-B 원자성)

ADR-058 생성과 ADR-049 supersede를 커밋한 뒤 Phase 5까지 참조 정리를 미루지 않는다. **다음 항목을 1.4~1.6과 같은 커밋에서 함께 처리**한다.

1. `docs/90-decisions/boilerplate/README.md`에 ADR-058 행을 057 다음에 추가하고, ADR-049 행 Status를 `superseded (by ADR-058)`로 바꾼다.
   ```
   | 058 | Design Workflow (reference flow + acceptance gate + concept cards) | accepted | — | /bootstrap-design R0~R6 SSOT(ADR-049 supersede) — evidence-on-demand R0 + R2/R6 수용 게이트(렌더·320·populated axe·repair loop) + REFINE/EXPLORE 시안 카드 |
   ```
2. `README.md`·`README_ko.md` Overall Flow의 `/bootstrap-design` 정책 근거를 ADR-049에서 ADR-058로 바꾸고 evidence-on-demand·수용 게이트를 반영한다. 두 언어 파일은 같은 커밋에서 동기한다.
   ```
     → /bootstrap-design (frontend only — evidence-on-demand reference research into DESIGN_RESEARCH.md, multiple concept mockups (REFINE/EXPLORE) to pick a direction *before* writing DESIGN.md with a render/axe acceptance gate, then a temporary design-preview.html for final review; mockups removed after approval) [ADR-058]
   ```
   `README_ko.md`도 같은 정보량의 한국어 문장으로 바꾸며 Codex wrapper 목록은 변경하지 않는다.
3. `docs/00-meta/STRUCTURE.md` Canonical Owner 표의 "UI 디자인 워크플로우" owner를 ADR-058로 바꾼다. `docs/00-meta/WORKFLOW.md`의 R0~R6 설명도 ADR-058을 현재 정책으로 가리키게 한다. **로드맵 행·design-gate runner 산출물 행은 아직 만들지 않는다** — 각각 Phase 4·Phase 3의 producer 커밋에서 추가한다.
   ```
   | UI 디자인 워크플로우 (R0~R6 + evidence-on-demand 리서치 + 수용 게이트 + REFINE/EXPLORE 시안) | [ADR-058](../90-decisions/boilerplate/ADR-058-design-workflow.md) (정책 SSOT — ADR-049 supersede). → ADR-058 `## Surfaces` 참조. DESIGN.md *내용*·인터페이스 할당은 [ADR-027](../90-decisions/boilerplate/ADR-027-interface-decision-allocation.md). |
   ```
   WORKFLOW의 디자인 흐름은 아래 완결 문장으로 교체한다.
   ```
   - UI 프로젝트의 `/bootstrap-design` 라운드 구조는 ADR-058(design workflow): R0(evidence-on-demand 리서치 + `DESIGN_RESEARCH.md`) → R1(원칙 + voice 기본값 확인 — ADR-056) → **R2(DESIGN.md 작성 *전* 다중 concept 시안 REFINE/EXPLORE — 실카피 렌더 + 수용 게이트(320·populated axe·repair loop), 사용자가 시각 방향 선택)** → R3(토큰)·R4(컴포넌트) → R5(DESIGN.md 저장) → R6(DESIGN.md 파생 preview 최종 확인 + 게이트). **사용자가 R2 concept 방향을 선택하고 R6 preview를 승인한 뒤** concept/preview 시안을 삭제하고 `/plan-milestone`으로 진행 권장한다(첫 마일스톤·feature 생성 — ADR-057; 이미 분해된 feature가 있으면 `/plan-workitem`). DESIGN.md *내용*·인터페이스 할당 SSOT는 ADR-027.
   ```
4. `rg --hidden -n "ADR-049" --glob "*.md" --glob ".gitignore" --glob "!.git/**" --glob "!IMPROVE-GUIDE.md" --glob "!.boilerplate/validation/design-workflow-eval-20260720/**" .`로 전수 분류한다(**`--hidden`과 `.gitignore` glob이 필수** — 이 둘이 없으면 rg가 숨김 디렉터리 `.claude/`와 비-md `.gitignore`를 뒤지지 않아 아래 대상 중 bootstrap-design·stack-guard·`.gitignore`를 통째로 놓친다. eval 번들 REPORT.md의 ADR-049는 historical이라 제외). 현재 정책 인용만 ADR-058로 바꾸고, ADR-049의 역사적 사실은 유지한다. 대상은 bootstrap-design·stack-guard·ADR-027·ADR-056·DELEGATION_STRATEGY·PROJECT_START_CHECKLIST·DESIGN.md(§0·§1·§9 주석)·ADR-040 amend-4·`.gitignore` 주석이다. `#dK`/`#amend-M` 접미는 ADR-058에 실제 대응 anchor가 없으면 제거하고 bare `ADR-058`로 쓴다. **Phase 3·4가 나중에 절 전체를 재작성하는 design surface(bootstrap-design R0~R6·DESIGN.md §1/§9·ADR-027 amend roster 등)의 ADR-049 인용도 예외 없이 여기서 함께 ADR-058로 shallow-swap한다** — 그래야 Phase 1-B 커밋이 superseded ADR-049의 live 인용 없이 자기정합한다. Phase 3·4는 이미 ADR-058이 된 텍스트 위에서 *내용만* 재작성하므로 그 절들의 "기존" 블록은 ADR-058 기준이다(중복 re-point 아님).
5. 위에서 re-point한 `README.md`·`README_ko.md`·`docs/00-meta/DELEGATION_STRATEGY.md`·`docs/00-meta/PROJECT_START_CHECKLIST.md`가 ADR-058 `## Surfaces`에 빠짐없이 등재됐는지 확인한다. 각 등재 파일에는 ADR-058 역참조가 같은 커밋에 존재해야 한다.
6. 커밋 직전 `rg --hidden -n "ADR-049|ADR-058\s*#" --glob "*.md" --glob ".gitignore" --glob "!.git/**" --glob "!IMPROVE-GUIDE.md" --glob "!.boilerplate/validation/design-workflow-eval-20260720/**" .` 결과를 다시 분류하고, 변경한 Markdown 상대 링크의 파일·fragment를 실제 대상에서 직접 확인한다.

> **커밋 (Phase 1-B — 디자인 정책 SSOT·평가 provenance)**:
> `feat(design): establish ADR-058 and preserve design-workflow evaluation provenance`

---

# Phase 2 — 오케스트레이션·위임 규율 (INST-6 · INST-4a · INST-4b · HN-4 · HN-5 · HN-6c)

작고 서로 독립적인 규율들이다. Phase 1 뒤, Phase 3(디자인) 앞에 둔다.

## 2.1 ADR-051 Amendment 4 + `## 현재 유효 결정` 신설 (INST-6 · INST-4a · INST-4b)

**기존**: `docs/90-decisions/boilerplate/ADR-051-main-session-orchestration-and-wave-removal.md`는 amendment 3개(현재 4개째가 없음)이고 `## 현재 유효 결정` 요약 섹션이 **없다**. Amendment 2 근거(L114)가 명시적으로 *"팬아웃 강제 강화는 하지 않는다"*라고 선언했고, D2 fan-out은 정책 강도상 enabling(약)이다.

**변경 (a) — `## 현재 유효 결정` 신설**: amend가 4개째가 되므로 ADR-045 D5에 따라 요약 섹션이 **필수**다. `## Status` 섹션(값 `accepted`) 바로 아래에 다음을 삽입한다:

```
## 현재 유효 결정
- implement는 foreman(메인 세션)이 운전 — `## 3` step 파일 경로로 file-disjoint slice를 나눠 병렬 builder, 작거나 겹치면 단일/순차(D1·#d6).
- validate/stabilize는 report-only fan-out. **inline vs fan-out은 dispatch 전 파일·줄 수 기계 계산으로 결정** — 임계 초과면 inline 불가(강행=규칙 위반), 임계 미달이어도 inline을 택하면 `## Orchestration`에 계산값+"임계 미달" 기록(#amend-4가 #amend-2를 이 축에서 뒤집음).
- plan de-fork + plan-milestone 신설, ADR-038 wave(#d3/#d6)·write_set 5필드 제거(D5).
- 하청이 구조화 반환 없이 멈추면 foreman/dispatcher가 1회 재개→실패 시 결과 직접 회수 — builder는 파일 확인, report-only 감사자는 재실행→재위임→직접 감사→unavailable 기록(always-verify, #amend-4).
- 위임 시 scope별 의존성 도구 고정 — builder는 기존 도구만(새 도구 도입·전환 금지); scope→tool은 STACK_SETUP_PLAN `## Dependency Tools`가 SSOT(모노레포·비-JS 지원, #amend-4).
- 공유 런타임 리소스 partition 가드(#amend-1), validate orchestration 관측 기록(#amend-2), D4 범위 M1 통일(#amend-3).
```

**변경 (b) — Amendment 4 추가**: 파일 맨 끝에 추가한다:

```
<a id="adr-051-amend-4"></a>
## Amendment 4 (2026-07-20) — fan-out 크기 판정 기계화 + 하청 정지 회수 + 패키지 매니저 고정

### 배경
- [관측됨] SIMULATION_RUN Round 4 — T-002(10파일 +249/-380 = 629줄)가 small-diff 임계를 명백히 초과했는데 "단일 vertical slice"라는 실행자 판단으로 inline 처리됐다(경계 판단 오용). 뒤늦게 fan-out 오케스트레이션 패턴으로 재검증하니 inline이 놓친 P1 2건([Doc-code-mismatch]·[Repair-bookkeeping-gap])이 검출됐다. #amend-2의 "경계값은 메인 세션 판단" 문구가 명확한 규칙을 우회하는 핑계가 됐다.
- [관측됨] 서브에이전트가 구조화 최종 반환 전 중간 사고 문장에서 정지하는 패턴 5+건(빌더 2·qa 1·validator 1은 빈 반환) — foreman이 재개·직접 회수로 매번 챙겼으나 규범 문서엔 없었다.
- [관측됨] builder가 npm 프로젝트에서 무심코 `pnpm`을 실행해 stray `pnpm-lock.yaml` 생성.

### 결정
1. **fan-out 크기 판정 기계화**: validate-workitem의 inline vs fan-out은 dispatch 전 계산한 값으로 결정한다 — 변경 파일 수 F, 줄 합계 L(`git status --porcelain`; tracked=`git diff HEAD`, untracked=파일 전체). inline 허용은 **(L≤50) 또는 (F≤2 그리고 L≤200)**, *그리고* UI/Arch-iface/MCP/spec-coverage 중 둘 이상 명백히 해당없음 — 셋 다 충족일 때만. 하나라도 미충족이면 **fan-out 필수(inline 재량 0)**. 조건 충족 시에도 inline을 택했으면 `## Orchestration`에 F·L과 "임계 미달"을 기록. **임계 초과인데 inline이면 그 자체가 규칙 위반**(산출물로 반증 가능). #amend-2의 "팬아웃 강제 강화 안 함"을 *이 축에 한해* 뒤집는다.
2. **하청 정지 회수 규율**: foreman/dispatcher는 위임한 서브에이전트가 구조화 최종 반환 없이 멈추면 1회 재개(예: SendMessage) → 그래도 미반환이면 결과를 직접 회수한다 — **builder**는 그 slice가 건드린 파일을 직접 열어 회수, **report-only 감사자(validator/qa/reviewer — 산출 파일 없음)**는 재실행→다른 감사자 재위임→메인 직접 감사→불가 시 `감사 미완(unavailable): <축>` 기록(DELEGATION_STRATEGY 정합). "결과 없음"을 조용히 통과시키지 않는다. *멈춤의 근본 원인은 모델/런타임 행동으로 추정되어 불확실하므로, 위임 프롬프트 문구를 더 늘리지 않고 회수 규율만 둔다*(원인 확정 전 과잉 문구 금지).
3. **의존성 도구 고정 (scope별)**: builder는 프로젝트/워크스페이스가 *이미 쓰는* 의존성 도구만 쓰고 새 도구 도입·전환을 하지 않는다. 전역 단일 PM이 아니라 **scope별 도구**(모노레포·비-JS 지원). 정보 흐름: bootstrap-stack이 확정한 scope→tool을 STACK_SETUP_PLAN `## Dependency Tools`에 기록 → stack-guard가 실제 lockfile과 교차 확인·보완 → plan-workitem은 설치 line item 작성 시 그 표로 도구를 맞추고 → implement preflight가 scope→tool을 회수(표 우선, 없으면 slice 인접 lockfile/tool-manifest 추론)해 slice별 dispatch에 전달 → builder는 지정 scope 도구만 실행. 동일 scope 신호 충돌·표↔저장소 불일치·slice→scope 불명확이면 그 slice만 `Needs Dependency Tool Decision`으로 중단. (install-ownership 경계는 [ADR-052](ADR-052-stack-provisioning-and-e2e-readiness.md); 도구 선택 *근거*는 ARCHITECTURE §7.)

### 근거
- [관측됨] 위 3건 전부 SIMULATION_RUN Round 4 실측.

### 강도 (ADR-022)
- **결정 1(fan-out 크기 판정)은 constraint(강)로 승격** — #amend-2 D2의 enabling에서 올린다(큰 변경에서 검증 누락은 파괴적, 실측으로 효과 입증). 결정 2·3은 enabling(약).

### 적용 surface
- .claude/skills/validate-workitem/SKILL.md
- .claude/skills/implement-workitem/SKILL.md
- .claude/agents/builder.md
- docs/00-meta/DELEGATION_STRATEGY.md
- .claude/skills/bootstrap-stack/SKILL.md
- .claude/skills/bootstrap-stack/stack-brief-template.md
- .claude/skills/stack-guard/SKILL.md
- .claude/skills/plan-workitem/SKILL.md
- docs/00-meta/_templates/STACK_SETUP_PLAN_TEMPLATE.md
```

> **거버넌스 주의 (ADR-045 D6 — 의도적 override + 검증)**: amend-4는 #amend-2의 "팬아웃 강제 강화 안 함"을 *뒤집는다*(fan-out 크기 판정 enabling→constraint) — D6의 **"기존 결정 뒤집기(reversal)" 트리거**에 해당해 통합 재발행 대상이다. (§1.3에서 amend-count 재발행 임계를 4→8로 올렸으므로 "4번째 amend"는 더 이상 트리거가 아니다 — 남는 건 *reversal* 하나. 단 amend 4개라 D5 `## 현재 유효 결정` 요약은 여전히 필수 — 위 변경(a).) **ADR-051은 grandfather가 아니다**(2026-06-26 생성 > ADR-045 2026-05-27 — grandfather는 ADR-045 *이전* 생성 ADR(예: ADR-027·010)만). 따라서 D6는 이 reversal에 통합 재발행을 요구한다. 이번 개선 라운드는 사용자 **minimal-churn 결정**으로 이를 *의도적으로 override*하여 amend로 처리한다 — **override 근거는 (삭제될 이 가이드가 아니라) 본 amend `### 결정` 말미에 "D6 reversal 재발행 대신 minimal-churn amend 적용 — 근거: 이번 라운드 결정, 다음 변경 시 ADR-051 통합 재발행" 한 줄로 영속 기록**한다. (전면 재발행을 원하면 §전역 거버넌스의 대안 경로 참조.) **검증(ADR-047#amend-1)**: 이 기계 판정이 실제로 놓친 결함을 잡는지는 SIMULATION_RUN 재실행(대조군=구 inline 재량)으로 확인 — falsifying eval은 ADR-051 base Mutation Contract를 승계하되 이 축의 반증 신호("임계 초과 diff를 inline으로 보내 P0 누락")를 추가 관찰.

**왜**: "규칙은 있는데 실행자가 우회 가능"한 구조를 없앤다. 크기 판정을 계산으로 확정하고 예외를 기록으로 강제하면 재량 우회가 불가능해진다.

## 2.2 validate-workitem — 크기 판정 기계화 (INST-6)

**변경 (frontmatter) — 크기 계산 도구 권한 (실행 가능성)**: 아래 recipe는 `git diff`·`git status`(이미 allowed) 외에 untracked 줄 수 집계에 `wc`를 쓴다. `.claude/skills/validate-workitem/SKILL.md`의 `allowed-tools`엔 `Bash(git diff *)`·`Bash(git log *)`·`Bash(git status *)`만 있고 `Bash(wc *)`가 **없다** → recipe가 실행 불가다. `allowed-tools` 끝에 `Bash(wc *)`를 추가한다(git-bash `wc`; wc가 없는 환경이면 대체로 `git diff --no-index --numstat -- /dev/null <file>`가 untracked 줄 수를 주고 이건 이미 `Bash(git diff *)`로 허용됨).

**기존** (`.claude/skills/validate-workitem/SKILL.md` — small-diff fallback 기준 줄):

```
     - **small-diff fallback 기준** (cost guard): `git status --porcelain` 변경 파일 집합의 줄 합계(tracked 변경은 `git diff HEAD` 줄 수, untracked 신규 파일은 파일 전체 줄 수) ≤ 50, *또는* (변경 파일 ≤ 2 *이고* 줄 합계 ≤ 200), *그리고* UI/Arch-iface/MCP/spec-coverage 중 둘 이상이 명백히 해당없음이면 팬아웃을 건너뛰고 단일 inline validator로 수행한다(휴리스틱 — 경계값은 메인 세션 판단. "2파일이면 줄 수 무관 inline"이던 구 기준은 구현+테스트 2파일의 대형 TDD diff를 놓쳐 보정됨 — ADR-051#amend-2). 어느 경로를 탔든 report `## Orchestration` 기록은 의무다.
```

**변경**: 위 줄을 다음으로 교체한다:

```
     - **small-diff fallback 기준 — 계산이 먼저, 초과 시 재량 0** (cost guard, ADR-051#amend-4): dispatch 전에 크기를 *결정적 명령으로 계산한다*. **tracked 줄 변경** = `git diff HEAD --numstat` 각 행의 (added+deleted) 합(**binary 파일은 numstat이 `-\t-`로 표기 → 0으로 취급**; rename 행 `{old => new}`도 숫자 열은 그대로라 합산 정상); **untracked 신규** = `git status --porcelain --untracked-files=all`(= `-uall`)의 `??` 항목 각 *파일* 줄 수 합(`wc -l`). **`-uall`이 핵심** — 기본 `git status --porcelain`은 untracked 디렉터리를 `?? dir/` 한 줄로 접어 파일 수를 놓치고 `wc -l`을 디렉터리에 돌리면 깨진다(예: untracked 대량 디렉터리가 1로 오계산). **L = 둘의 합, F = numstat 행 수 + untracked 파일 수.** **기준은 working tree 전체(HEAD 대비)** — 정상 lifecycle은 직전 task가 finalize로 커밋돼 tree엔 본 task 변경분만 남으므로 별도 '관련 파일' 선별이 불요하다. **over-count는 안전하다**(크게 세면 fan-out으로 기울 뿐 — 검증을 *더* 하는 쪽). 그래서 무관한 dirty/untracked가 섞여도 **임의 제외하지 말고**(제외가 재량 우회 창구가 된다) 전부 센 뒤 `## Orchestration`에 "오염 tree(무관 파일 포함 가능)" 사유만 적는다. 정확한 수가 필요하면 무관분을 stash 후 재계산해도 되지만 필수 아님 — **공유 worktree에서 사용자 변경을 강제 커밋/stash하지 않는다**. inline 허용은 **(L ≤ 50) 또는 (F ≤ 2 이고 L ≤ 200)**, *그리고* UI/Arch-iface/MCP/spec-coverage 중 둘 이상이 명백히 해당없음 — **셋 다 충족일 때만**. 하나라도 미충족이면 **fan-out 필수 — inline 선택 불가(재량 0)**. 조건 충족이어도 "vertical slice라 하나로 본다" 류 사유로 inline을 택하려면 `## Orchestration`의 fallback 사유에 계산한 F·L + "임계 미달"을 명시 기록한다. **임계 초과인데 inline이면 규칙 위반**(산출물로 반증 가능 — SIMULATION_RUN Round 4 T-002 우회 재발 방지). 경계값(50/200)은 실측 전 추정치라 #amend-4가 재보정 창구다. 어느 경로를 탔든 report `## Orchestration` 기록은 의무다.
```

**기존** (`## Orchestration` 섹션의 fallback 사유 불릿):

```
- fallback 사유 (해당 시): 파일 N개 · 변경 줄 M줄 (`git status --porcelain` 기준 — tracked=`git diff HEAD`, untracked=파일 전체)
```

**변경**:

```
- fallback 사유 (inline 모드일 때만 기록): 파일 F개 · 변경 줄 L줄 (`git status --porcelain` 기준 — tracked=`git diff HEAD`, untracked=파일 전체) — **임계 미달 확인**(inline 정당 근거). **임계 초과면 inline 불가(fan-out 필수)** — "임계 초과 예외 inline"은 없다(재량 0). fan-out 모드에선 본 필드를 비우고 spawn 축을 적는다.
```

**왜**: 실행자가 계산값을 산출물에 남기게 강제하면, 임계 초과 inline을 사후에 반증할 수 있다. (백로그의 "자동계산 도구" 취지는 *별도 스크립트가 아니라* 이 recipe(dispatch 전 git 계산) + `## Orchestration` 산출물 기록으로 실현한다 — 계산값이 산출물로 남아 반증 가능하므로 executor 우회를 막는다. 별도 sizing 스크립트는 YAGNI이나, 팀이 원하면 이 계산을 `scripts/`로 뽑아도 무방.)

## 2.3 implement-workitem — 패키지 매니저 preflight + dispatch 전달 (INST-4b) + 정지 회수 (INST-4a)

**기존** (`.claude/skills/implement-workitem/SKILL.md` "반드시 먼저 할 일" 초입):

```
반드시 먼저 할 일 (메인 세션이 1회 수행):
1. 관련 task 문서를 읽는다 (메인 세션이 *한 번*만 읽는다 — builder 에 task 전문을 넘기지 않는다).
2. 필요하면 상위 feature/milestone/architecture 문서를 읽는다.
3. task 문서의 `## 6. Acceptance Criteria`(AC-1, AC-2 ...)와 `## 3. 구현 항목`을 회수한다.
```

**변경**: step 3 다음에 새 step을 삽입한다(`3-R. draft 가이드 하드스탑` 앞 — 이 3-R step은 Phase 4 §4.12b가 '접지 경량 preflight'로 개명하나 3-DT 삽입 위치는 불변):

```
3-DT. **의존성 도구 확인 (scope별, ADR-051#amend-4)**: slice별로 쓸 의존성 도구(npm/pnpm/yarn/bun · pip/poetry/uv · cargo · go 등)를 회수한다 — ① `docs/00-meta/STACK_SETUP_PLAN.md`의 `## Dependency Tools`(scope→tool)를 *우선* 조회 + 인접 lockfile 등 실제 신호와 모순 없는지 교차 확인, ② 매핑이 없을 때만 각 slice 경로에 *인접한 고신뢰 신호*(`pnpm-lock.yaml`·`poetry.lock`·`uv.lock`·`Cargo.lock`·`go.mod` 등 tool-specific)로 추론(일반 manifest만으로 단정 금지), ③ slice 경로와 가장 구체적으로 일치하는 scope의 도구를 그 slice dispatch(step 5)에 전달(한 slice가 여러 scope면 각 도구 함께). **충돌·불일치·slice→scope 불명확이면 그 slice만 `Needs Dependency Tool Decision`으로 중단**(출력에 scope·관측 신호·충돌 사유·해결 포함; 명확한 slice는 계속). 도구 명령이 불필요한 slice는 lockfile 변경 없이 진행.
```

**기존** (dispatch step 5, builder 1개에 넘기는 것 목록의 마지막 즈음):

```
   - 병렬 builder 는 *file-disjoint* slice 에만 띄운다. 같은 파일에 실제 write-conflict 가능성이 있으면 *그 slice 들은 순차로* 돌린다(또는 사용자가 별도 worktree 로 격리) — disjoint 인 일반 경우엔 불필요.
```

**변경**: 이 줄 바로 위에 새 불릿을 추가한다:

```
   - **이 slice의 의존성 도구**(3-DT에서 scope별 회수 — 예: `apps/web`→npm, `apps/api`→uv). builder는 지정된 scope의 그 도구만 쓴다 — 새 도구 도입·전환·다른 scope 도구 실행 금지(stray lock·오도구 방지 — ADR-051#amend-4).
```

**기존** (builder 결과 반환 지점):

```
각 builder 는 *자기 slice 가 건드린 파일* 을 메인 foreman 에 반환한다.
```

**변경**:

```
각 builder 는 *자기 slice 가 건드린 파일* 을 메인 foreman 에 반환한다.
**builder가 구조화 최종 반환 없이 멈추면** foreman은 1회 재개를 시도(SendMessage 등)하고, 그래도 미반환이면 그 slice가 건드렸을 파일을 직접 열어 결과를 회수한다(always-verify — "결과 없음"을 조용히 통과 금지, ADR-051#amend-4).
```

**왜**: 도구 오용(새 도구 도입·전환)을 dispatch 시점에 차단하고, 하청 정지를 foreman이 반드시 회수하게 한다. **(리뷰 후 확장 — polyglot 정합)**: PM 고정을 *전역 단일 PM(JS 락파일 4종)*에서 *scope별 의존성 도구*로 일반화했다 — 근본원인은 bootstrap-stack이 확정한 도구 정보가 STACK_SETUP_PLAN에 구조적으로 안 남아 implement가 JS 락파일로 재추측한 것. 그래서 결정→기록(bootstrap-stack)→교차확인(stack-guard)→설치 authoring(plan-workitem)→회수(implement)→실행(builder)의 정보흐름을 `## Dependency Tools`(scope→tool) 표로 잇는다(비-JS·모노레포 지원). 추가 surface: bootstrap-stack/SKILL·stack-brief-template·stack-guard/SKILL·plan-workitem/SKILL·STACK_SETUP_PLAN_TEMPLATE.

## 2.4 builder.md — 패키지 매니저 규칙 (INST-4b)

**기존** (`.claude/agents/builder.md` 규칙 목록 초입):

```
규칙:
- 범위 밖 변경은 하지 않는다.
```

**변경**: "범위 밖 변경은 하지 않는다." 다음에 한 줄 추가:

```
- 패키지 설치·의존성 명령은 **dispatch에서 지정된 scope의 의존성 도구만** 쓴다 — 새 도구 도입·전환, 다른 scope 도구 실행 금지(stray lock·오도구 방지 — ADR-051#amend-4). 도구 사용이 불필요한 slice는 lockfile을 건드리지 않는다.
```

**왜**: builder 페르소나에 PM 규율이 전혀 없었다(dossier 확인). 하청 측에도 못박아 이중 방어.

## 2.5 DELEGATION_STRATEGY — 회수 규율(INST-4a) + dispatcher 사전판정 금지(HN-4)

**기존** (`docs/00-meta/DELEGATION_STRATEGY.md` 메인 세션 역할):

```
## 메인 세션의 역할
- 현재 목표와 우선순위를 정리한다
- 관련 workitem과 상위 문서를 확인한다
- 적절한 서브에이전트에 작업을 위임한다
- 돌아온 결과를 통합하고 다음 결정을 내린다
- 긴 로그, 장문의 탐색 결과, 세부 구현 과정을 메인 컨텍스트에 오래 보존하지 않는다
```

**변경**: "돌아온 결과를 통합하고 다음 결정을 내린다" 다음에 한 줄 추가:

```
- 위임한 서브에이전트가 구조화 최종 반환 없이 멈추면 1회 재개한다. 그래도 미반환이면: **파일 생성 에이전트(builder)** 는 그 slice가 건드린 파일을 직접 확인해 회수; **report-only 감사자(validator/qa/reviewer — 산출 파일 없음)** 는 재실행 → 안 되면 다른 감사자에 재위임하거나 메인이 그 축을 직접 감사 → 그래도 불가하면 `감사 미완(unavailable): <축>`을 명시 기록한다("결과 없음"을 조용히 통과 금지 — ADR-051#amend-4)
```

**기존** (위임 트리거 표 아래 실행 컨텍스트 노트):

```
> **실행 컨텍스트 노트 (ADR-050)**: 본 표의 agent 매핑은 *책임 경계 정의*다(ADR-007#amend-2). 일부 lifecycle skill(validate-workitem/repair-workitem 등)은 이제 메인 세션에서 실행되지만(ADR-050) **같은 책임 경계**를 따른다 — 메인 세션이 그 경계대로 직접 수행하거나, 같은 역할의 agent를 `Agent`로 직접 fork 위임할 수 있다. `.claude/agents/*.md` persona 파일은 그대로 존재한다.
```

**변경**: 이 노트 바로 다음에 새 노트를 추가한다:

```
> **검증 위임 규율 (ADR-050#amend-1)**: 검증/감사(validator·reviewer·qa)를 위임할 때, 일 시키는 쪽은 검증자에게 *무엇을 지적하지 말라*고 미리 말하거나 *심각도를 미리 정해* 주지 않는다(자기검증 편향 차단). 계획·구현과 충돌하는 발견은 숨기지 말고 사람에게 올린다. 단 *지켜야 할 기준·계약*(AC·승인 프로토타입·DESIGN 토큰·seam INV 등)을 그대로 전달하는 것은 필수 맥락이지 사전판정이 아니다 — 이 선을 지킨다.
```

**왜**: 메인 세션이 구현·검증을 다 운전하므로 자기가 낸 지름길을 무르게 프레이밍할 편향이 있다. 감사자 제약만 있고 dispatcher 프레이밍 제약이 없던 구멍을 한 줄로 막는다.

## 2.6 ADR-050 Amendment 1 (HN-4)

**기존**: `docs/90-decisions/boilerplate/ADR-050-main-session-lifecycle-skills.md`는 amendment 0개이고 `## 참고`로 끝난다.

**변경**: 파일 맨 끝에 추가한다:

```
<a id="adr-050-amend-1"></a>
## Amendment 1 (2026-07-20) — dispatcher 사전판정 금지 (자기검증 편향 차단)

### 배경
- [관측됨] 메인 세션이 구현·계획을 하고 그 검증(validate-workitem 등)도 직접 운전하므로(D2 model-invocable), 자기가 낸 지름길을 "이 정도는 괜찮다"고 프레이밍해 통과시킬 편향 위험. 기존 규칙은 *감사자*의 "수정 금지·보고만"만 정하고 *일 시키는 쪽*의 프레이밍은 막지 않는다.

### 결정
1. 검증/감사 위임 시 dispatcher는 검증자에게 **무엇을 지적하지 말라고 미리 말하거나 심각도를 미리 정해 주지 않는다**. 계획·구현과 충돌하는 발견은 숨기지 말고 사람에게 에스컬레이션한다.
2. 단, *지켜야 할 기준·계약*(AC·승인 프로토타입·DESIGN 토큰·seam INV 등)을 그대로 전달하는 것은 필수 맥락이지 사전판정이 아니다 — 예외로 명시.

### 적용 surface
- docs/00-meta/DELEGATION_STRATEGY.md

### 강도 (ADR-022)
- enabling(약) — 한 줄 규율.
```

**같은 커밋의 인덱스·surface 동기**: `docs/90-decisions/boilerplate/README.md`의 ADR-051 행에 `+#amend-4: fan-out 크기 판정 기계화 + 하청 정지 회수 + PM 고정`, ADR-050 행에 `+#amend-1: dispatcher 사전판정 금지`를 추가한다. 두 amend의 `### 적용 surface`가 base `## Surfaces`에 이미 있는지 확인하고, 실제로 없는 파일만 같은 커밋에 추가한다.

> **커밋 (2.1~2.6 — 오케스트레이션·위임)**:
> `feat(orchestration): mechanize validate fan-out sizing, foreman recovery, PM pinning, dispatcher pre-judgment ban (ADR-051 amend 4, ADR-050 amend 1)`

## 2.7 ADR-010 Amendment 5 + PROJECT_START_CHECKLIST (HN-5)

**기존**: `docs/90-decisions/boilerplate/ADR-010-multi-agent-compatibility.md`는 amendment 4개(이미 `## 현재 유효 결정` 보유)이며 도구별 memory 규율은 없다(memory 언급은 근거 bullet 1곳뿐).

**변경 (a)**: 파일 맨 끝에 Amendment 5를 추가한다:

```
<a id="adr-010-amend-5"></a>
## Amendment 5 (2026-07-20) — 도구별 memory는 비캐노니컬 (필수 결정은 checked-in 문서에)

### 배경
- [관측됨] Claude Code는 내장 `MEMORY.md`, Codex도 native Memories 기능(`~/.codex/memories/`)을 갖는다 — *둘 다 존재*한다("Codex엔 memory 없음"은 오류). 단 Codex 쪽은 **버전에 따라 experimental·기본 비활성일 수 있다**(예: 일부 codex-cli 배포에서 memories=experimental off — 구체 버전은 핀하지 않는다). on이든 off든 본 amend 결정(비캐노니컬)은 불변이다. 둘 다 로컬·생성물이라 cross-machine sync가 없고 비캐노니컬이다.
- 위험: "OAuth는 M3로 미룸" 같은 결정이 *오직 도구 memory에만* 있으면, 다른 도구·다른 머신·fresh 세션으로 이어받은 사람은 그걸 못 보고 다시 계획한다(연속성 깨짐 + SSOT 위반).

### 결정
1. **도구별 memory(Claude `MEMORY.md`·Codex memories 둘 다)는 로컬 가속기일 뿐 사실의 유일 소유자가 되면 안 된다.** 지속돼야 할 결정(범위·마일스톤 순서·연기 결정·기술 선택 등)은 반드시 checked-in 문서(마일스톤/feature 문서 또는 ADR)에도 내려가야 한다.
2. 프로젝트 시작 시 1회 점검(PROJECT_START_CHECKLIST).

### 적용 surface
- docs/00-meta/PROJECT_START_CHECKLIST.md

### 강도 (ADR-022)
- enabling(약) — 규율 + 프로젝트 시작 시 점검(강제 불가 — 내장 memory는 자동 기록).
- **Mutation Contract delta**(base 승계): failure = 결정이 memory에만 남아 다른 도구·머신·세션에서 증발; falsifier(ADR-047#amend-1) = dogfood에서 checked-in 없이 memory에만 기록되는지; rollback = 체크리스트 §5 항목 제거.
```

**변경 (b)**: `docs/00-meta/PROJECT_START_CHECKLIST.md`의 `## 5. 의사결정 기록` 항목에 한 줄 추가한다.

**기존**:

```
## 5. 의사결정 기록
- [ ] 중요한 선택을 `docs/90-decisions`에 ADR로 남겼다
```

**변경**:

```
## 5. 의사결정 기록
- [ ] 중요한 선택을 `docs/90-decisions`에 ADR로 남겼다
- [ ] 지속돼야 할 결정(범위·마일스톤 순서·연기 결정 등)이 도구 memory(Claude MEMORY.md·Codex memories)에만 있지 않고 checked-in 문서(마일스톤/feature/ADR)에도 있다 (ADR-010#amend-5 — 도구별 memory는 비캐노니컬)
```

**변경 (c) — ADR-010 `## 현재 유효 결정` 요약 갱신 (ADR-045 D5)**: amend 5개라 요약이 (본문·amend를 안 읽어도) 현재 규칙을 전달해야 하므로 `## 현재 유효 결정`에 한 줄 추가: `- 도구별 memory(Claude MEMORY.md·Codex memories)는 비캐노니컬 — 지속될 결정은 checked-in 문서(마일스톤/feature/ADR)에도 (#amend-5).`

> **거버넌스 주의 (D6)**: amend-5는 ADR-010의 5번째 amend라 D6상 재발행 "우선 검토" 대상이나, grandfather 조항 + 최소-churn 방침 + ADR-010이 이미 `## 현재 유효 결정`을 보유(fold 부담 낮음)해 amend로 처리한다(enabling 한 줄 확장 — 기존 결정 반전 아님).

**왜**: 도구별 memory에만 남은 결정이 다른 도구·머신·세션에서 증발하는 연속성/SSOT 구멍을 규율 한 줄로 막는다.

## 2.8 index-first recall 규율 (HN-6c)

**배경**: `QA_FINDINGS.md`·`IMPROVEMENT_GUIDE.md`는 마일스톤별로 계속 길어진다. 이걸 통째로 읽지 말고 **상태·심각도 색인으로 먼저 걸러 해당 항목만** 읽는 규율이다. **반드시 상태·심각도로 걸러야 한다** — 마일스톤 헤더로만 자르면 이전 마일스톤에서 넘어온 미해결 P0(carry-over)를 놓친다. 지금은 파일이 짧아 이득이 작지만 마일스톤 10+ 다운스트림에서 토큰을 아낀다.

**기존** (`docs/00-meta/WORKFLOW.md` §5 마일스톤 안정화, 기록 줄):

```
- **코드 수정·커밋·status 변경 금지** — 결과는 `QA_FINDINGS.md`와 `IMPROVEMENT_GUIDE.md`에 누적 기록.
```

**변경**: 이 줄 다음에 한 줄 추가:

```
- **index-first recall (ADR-019 정합)**: 누적된 `QA_FINDINGS.md`·`IMPROVEMENT_GUIDE.md`를 회수할 때는 통째로 읽지 말고 *상태·심각도 색인*(open·P0/P1)으로 먼저 걸러 해당 항목만 읽는다. **마일스톤 헤더로만 자르지 않는다** — 이전 마일스톤에서 넘어온 미해결 P0(carry-over)를 놓치기 때문.
```

**기존** (`.claude/skills/repair-milestone/SKILL.md` 회수 단계 2):

```
2. `docs/40-validation/QA_FINDINGS.md`의 본 milestone 헤더(`## M-N`) 아래 `### P0` / `### P1` / `### P2` 항목을 회수한다.
```

**변경**:

```
2. `docs/40-validation/QA_FINDINGS.md`의 본 milestone 헤더(`## M-N`) 아래 `### P0` / `### P1` / `### P2` 항목을 회수한다. **다른 마일스톤 헤더의 미해소(`status`≠`resolved`) P0/P1은 색인 스캔만 하고 — 본 skill은 본 milestone만 수정(책임 경계) — 고치지 말고 `carry-over 미해결: M-X → /repair-milestone M-X 권장`으로 flag한다**(index-first recall — 본 milestone 헤더로만 자르면 carry-over 누락). *IMPROVEMENT_GUIDE 회수(step 3)도 다른 마일스톤 `### M-X` 미해소 P0/P1을 동일 기준으로 색인 스캔·flag(대칭).*
```

**왜**: 마일스톤 헤더로만 자르는 기존 회수가 carry-over P0를 놓칠 수 있다는 백로그 경고를 반영. `stabilize`/`plan-milestone R0`는 이미 마일스톤 무관 open 항목을 회수하므로 별도 편집 불요(WORKFLOW 규율로 커버).

**같은 커밋의 인덱스 동기**: `docs/90-decisions/boilerplate/README.md` ADR-010 행에 `+#amend-5: 도구별 memory 비캐노니컬`을 추가한다. ADR-010에는 base `## Surfaces` 블록이 없으므로 이번 amend를 이유로 새 블록을 만들지 않고 amendment의 `### 적용 surface`만 유지한다.

> **커밋 (2.7~2.8 — memory·recall 규율)**:
> `feat(continuity): make tool memory non-canonical and add index-first recall (ADR-010 amend 5)`

---

# Phase 3 — 디자인 게이트·정체성 (DS-1 · DS-2 · DS-3 · DS-5 · DS-6 · DS-7)

당신의 핵심 목표("세련되고 창의적인, AI스럽지 않은 디자인")를 정면으로 겨냥하는 Phase다. Phase 1-B에서 이미 확정한 ADR-058을 전제로 DESIGN.md 내용 계약을 갱신한 뒤 스킬·에이전트·게이트 러너를 배선한다.

> **선행조건**: Phase 1-B의 ADR-058 생성·ADR-049 supersede·현재 정책 참조 re-point가 한 커밋으로 끝나 있어야 한다. Phase 3에서는 새 상위 정책을 만들지 않고 그 정책의 surface를 구현한다.

## 3.1 ADR-027 Amendment 7 + `## 현재 유효 결정` 갱신 [DS-2 · DS-5 · DS-6 · DS-7]

**기존** (`docs/90-decisions/boilerplate/ADR-027-interface-decision-allocation.md`의 `## 현재 유효 결정` 첫·넷째 불릿):

```
- 시각 결정은 `DESIGN.md`(UI 한정, Stitch 8섹션 + Motion 확장 + Voice & Writing 확장(§10 — ADR-056)), 인터페이스 결정은 ARCHITECTURE `## 7-1`(API)/`## 7-2`(CLI)/`## 7-3`(백엔드)/`## 7-4`(프론트)에 둔다.
```

**변경 (a)**: 첫 불릿 끝에 내용 계약 확장을 덧붙이고, 흐름 SSOT(ADR-058) 참조를 명시한다(ADR-049 인용 자체는 §1.7에서 이미 re-point됨 — 여기선 SSOT 문장 추가). 첫 불릿을 다음으로 교체:

```
- 시각 결정은 `DESIGN.md`(UI 한정, Stitch 8섹션 + Motion 확장 + Voice & Writing 확장(§10 — ADR-056) + **내용 계약 확장(§1 긍정적 정체성 · §3 tabular · §4 responsive invariant · §7 category state · §8 semantic motion · §9 WCAG 2.2 a11y — #amend-7)**), 인터페이스 결정은 ARCHITECTURE `## 7-1`(API)/`## 7-2`(CLI)/`## 7-3`(백엔드)/`## 7-4`(프론트)에 둔다. **디자인 워크플로우 라운드 구조·R0 리서치·수용 게이트·시안 카드 SSOT는 [ADR-058](ADR-058-design-workflow.md)**(ADR-049 supersede).
```

**기존** (amend roster 불릿):

```
- cross-surface enforcement(plan/validate-plan/stabilize/templates/reviewer)는 #amend-1이 SSOT. anti-slop·lint·Motion 정정은 #amend-2. UI 판정 다중신호 절차는 #amend-3. `--update`는 #amend-4(라운드 구조는 ADR-058). #amend-5(§10 Voice 규칙서 — ADR-056). #amend-6(design reviewer 렌더 증거 주입).
```
(위 "기존" roster의 `ADR-058`은 §1.7 re-point 반영분 — Phase 3 진입 시 이미 이 상태다. 본 절은 amend-7만 덧붙인다.)

**변경 (b)**: 끝에 amend-7을 덧붙인다:

```
- cross-surface enforcement(plan/validate-plan/stabilize/templates/reviewer)는 #amend-1이 SSOT. anti-slop·lint·Motion 정정은 #amend-2. UI 판정 다중신호 절차는 #amend-3. `--update`는 #amend-4(라운드 구조는 ADR-058). #amend-5(§10 Voice 규칙서 — ADR-056). #amend-6(design reviewer 렌더 증거 주입). #amend-7(DESIGN 내용 계약 확장 — §1 정체성·§9 a11y·§8 semantic motion·§7 category state·§4 responsive invariant·§3 tabular; reviewer a11y 차원·category state 미러).
```

**변경 (c)**: 파일 맨 끝(마지막 Amendment 뒤)에 Amendment 7을 추가한다:

```
<a id="adr-027-amend-7"></a>
## Amendment 7 (2026-07-20) — DESIGN.md 내용 계약 확장 (정체성 · a11y · semantic motion · category state · responsive invariant · tabular)

### 배경
- [관측됨] §9는 "하지 마라"(금지)만 잔뜩이고 "이렇게 되어라"(긍정)가 없어 결과가 *깨끗하지만 평범한* UI로 수렴. §9에 reduced-motion·2축 위계는 있으나 **대비/키보드/aria/포커스 규칙이 없다**("아예 없음"은 과장, 부재는 이 넷). §8 Motion은 Material 3 수치 한 줄뿐. §7은 전 컴포넌트 8상태 강제라 planning paperwork 과다(실측 136 entry→category 74, -46% + 빠졌던 success 추가). §4에 반응형 설계 규정 부재, dogfood에서 overflow·axe가 결과무관 통과라 반응형 미검증.
- [관측됨] dogfood(QuickTodo)에서 완료 텍스트 대비 3.70:1(AA 4.5:1 미달)이 통과됨 — 빈 화면만 본 axe advisory가 못 잡음.

### 결정 (DESIGN.md 내용 계약 — SSOT는 ADR-027, 실제 규칙 텍스트는 DESIGN.md 각 섹션 주석)
1. **§1 긍정적 정체성**: design thesis 1문장 + signature mechanism 1개 + imagery/icon 방향(또는 N/A) + contextual density. actionable 가드(공허한 buzzword 금지). variance/motion 다이얼은 도입 안 함(divergence 카드·§8과 중복).
2. **§9 접근성 (WCAG 2.2)**: 정상 텍스트 4.5:1 / 큰 텍스트 3:1 / 비텍스트 UI·아이콘 3:1 / 포커스 링 제거 금지 / 키보드 조작 / 아이콘 버튼 accessible name(computed name — aria-label·aria-labelledby·visible text·alt·title 등 어느 출처든; aria-label 강제 아님) / 색-단독 표시 금지. LLM이 정밀 비율·computed name을 못 계산하므로 포커스 제거·색-단독은 강하게, 정밀 대비·name은 권고 + 실화면 axe(stack-guard populated axe · design-gate.mjs 러너)가 결정적으로 잡음.
3. **§8 semantic motion contract**: 목적(feedback/continuity/orientation/state-change) · 빈도(반복 흐름일수록 budget↓) · 실행(project token duration/easing · interruptible · no layout shift) · 접근성(reduced-motion 정보손실 없는 대체) · 금지(decorative infinite/repeated). Emil 정확 수치는 project token *시작 default*로만(보편 법칙 아님). tabular-nums는 모션 아님 → §3으로.
4. **§7 category state 계약**: interactive primitive(default/hover/active/focus-visible/disabled, async면 loading) · data composite/screen(default/loading/empty/error/success) · static primitive(상태 매트릭스 없음). N/A는 category상 expected를 의도적으로 뺄 때만. 전 컴포넌트 8상태 강제 폐기.
5. **§4 responsive invariant**: content order / container transition / table strategy / sticky occlusion / 320 reflow / text fit / essential-2D exception 소유. 임의 breakpoint 숫자 목록 강제 아님.
6. **§3 tabular figures**: 표·정렬 숫자 열은 tabular-nums.
7. **reviewer 미러**: reviewer[design] 5→**6차원**(a11y 신설), [Design-state]는 8상태→category state 판정으로, [Plan-design]의 "8 상태 매트릭스" 문구도 category로 동기(#amend-1 미러 계약 유지).

### 적용 surface
- docs/20-system/DESIGN.md (§1/§3/§4/§7/§8/§9)
- .claude/agents/reviewer.md (a11y 차원 신설 + [Design-state] category + [Plan-design] 미러)
- .claude/skills/validate-plan/SKILL.md ([Plan-design] 미러)
- .claude/skills/bootstrap-design/SKILL.md (R4 category state · R6 preview 상태 렌더 문구)

### 근거
- [관측됨] 위 배경 + design-eval(SIMULATION_RUN.md) serious axe 12/24·category state -46%. [외부실증] WCAG 2.2.

### 강도 (ADR-022)
- §9 a11y의 grep 가능분(포커스 제거·색-단독)·§4 320 reflow는 constraint(강). 나머지 enabling(약).
```

**변경 (d) — grandfather amend 근거 명시**: Amendment 7 헤딩 바로 아래에 한 줄을 넣어, ADR-027이 grandfather라 D6 재발행 강제 없이 amend가 정당함을 남긴다(검증자·유지보수자 혼동 방지):

```
> **amend 근거(ADR-045 D6 grandfather 조항)**: ADR-027은 ADR-045(2026-05-27) *이전* 생성(2026-05-16)이라 **grandfather** — D6 재발행은 "우선 검토(권고)"일 뿐 즉시 강제가 아니다. 본 개선 라운드는 *최소 churn*을 택해 Amendment 7로 처리한다(사용자 결정 — 번호·참조 churn 회피). `## 현재 유효 결정`이 이미 net 규칙을 요약하므로 fold 부담은 낮다. 다음 변경 시 통합 재발행 우선 검토.
```

**왜**: 사용자가 Q3에서 "최소 churn: 027 번호 유지"를 택했다. §1 긍정적 정체성이 당신 목표("AI스럽지 않은 좋은 디자인")의 실제 지렛대이고, a11y·category state·responsive는 기본 웹 스택의 최대 품질 구멍을 값싸게 닫는다.

## 3.2 DESIGN.md §1 — 긍정적 정체성 (DS-5)

**기존**:

```
## 1. Overview
<!-- 디자인 원칙 3~5개 (actionable verb. "modern/clean/sleek" 같은 모호어 금지).
     + [디자인 리서치](DESIGN_RESEARCH.md) 링크 + what-to-borrow/avoid 1~2줄 (ADR-058).
     + `선택 concept: <X>(+하이브리드 메모)` 한 줄 (ADR-058 — /bootstrap-design R2 선택 결과). -->
```

**변경**:

```
## 1. Overview
<!-- 디자인 원칙 3~5개 (actionable verb. "modern/clean/sleek" 같은 모호어 금지).
     + 긍정적 정체성 (ADR-027#amend-7 — 금지 목록(§9)만으론 '안 촌스러움'까지, 개성·세련은 여기서):
       - design thesis: 이 제품 디자인이 뭘 지향하는가 한 문장 (actionable — 공허한 미사여구 금지).
       - signature mechanism 1개: 이 제품만의 시각/인터랙션 특징 (예: "모든 액션은 커맨드바 한 곳에서"). primary task 이해를 더 빨리 돕지 못하면 두지 않는다(장식이면 제거).
       - imagery/icon 방향: 사진/일러스트/아이콘 스타일 (해당 없으면 "N/A").
       - contextual density: 대시보드=조밀 / 마케팅=여유 등 강도 1줄.
     + [디자인 리서치](DESIGN_RESEARCH.md) 링크 + what-to-borrow/avoid 1~2줄 (ADR-058).
     + `선택 concept: <X>(+하이브리드 메모)` 한 줄 (ADR-058 — /bootstrap-design R2 선택 결과). -->
```

## 3.3 DESIGN.md §3 — tabular figures (DS-6/DS-7)

**기존**:

```
## 3. Typography
<!-- 1~2 family, 4~5 size scale, modular ratio (1.125/1.25/1.333), weight pair -->
```

**변경**:

```
## 3. Typography
<!-- 1~2 family, 4~5 size scale, modular ratio (1.125/1.25/1.333), weight pair.
     + Data-table 계약 (ADR-027#amend-7): 표·정렬이 필요한 숫자 열은 tabular figures(`font-variant-numeric: tabular-nums`)로 정렬 흔들림 방지. -->
```

## 3.4 DESIGN.md §4 — responsive invariant (DS-7)

**기존**:

```
## 4. Layout
<!-- 4 또는 8 단위 base spacing, t-shirt scale 또는 numeric -->
```

**변경**:

```
## 4. Layout
<!-- 4 또는 8 단위 base spacing, t-shirt scale 또는 numeric.
     + 반응형 = invariant 소유 (ADR-027#amend-7 — 임의 breakpoint 숫자 목록 강제 아님):
       content order(작은 화면에서도 읽기 순서 보존) / container transition(고정폭→유동) / table strategy(가로 스크롤은 표 자체 영역만, page 넘침 금지) / sticky occlusion(고정 요소가 콘텐츠 가림 방지) / 320 CSS px reflow(가로 스크롤·클리핑 없음) / text fit(말줄임보다 줄바꿈 우선) / essential-2D exception(표·캔버스 등 본질적 2차원은 contained region만 스크롤 + 그 region은 keyboard focus/name 보유). -->
```

## 3.5 DESIGN.md §7 — category state 계약 (DS-7)

**기존**:

```
## 7. Components
<!-- primitives (Button/Input/Text/Icon), composites (Card/Modal/Toast), patterns (Form/EmptyState/ErrorState/LoadingState).
     각 컴포넌트마다 상태 매트릭스 강제: default / hover / active / focus / disabled / loading / error / empty. -->
```

**변경**:

```
## 7. Components
<!-- primitives (Button/Input/Text/Icon), composites (Card/Modal/Toast), patterns (Form/EmptyState/ErrorState/LoadingState).
     상태 = category 계약 (ADR-027#amend-7 — 전 컴포넌트 8상태 강제 대체):
     - interactive primitive (Button/Input 등): default / hover / active / focus-visible / disabled (비동기 동작이면 loading 추가).
     - data composite / screen (Card·리스트·화면): default / loading / empty / error / success.
     - static primitive (Text/Icon 등): 상태 매트릭스 없음.
     - 역할별 semantic 상태(해당 컴포넌트에 한): checkbox/radio=checked·indeterminate, tab/segmented=selected, disclosure/accordion=expanded, input=invalid·read-only 등 — 역할이 요구하는 상태를 위 category 위에 추가.
     N/A는 category상 expected 상태를 *의도적으로* 뺄 때만 명시. -->
```

## 3.6 DESIGN.md §8 — semantic motion contract (DS-6)

**기존**:

```
## 8. Motion
<!-- (보일러플레이트 확장 섹션 — Stitch 공식 canonical 8섹션 외. 근거: Material 3 motion / a11y. ADR-027#d24)
     duration/easing + `prefers-reduced-motion` 분기. Material 3 기준: 라우팅 UI 160~240ms, entrance/exit 240~360ms -->
```

**변경**:

```
## 8. Motion
<!-- (보일러플레이트 확장 섹션 — Stitch 공식 canonical 8섹션 외. 근거: Material 3 motion / a11y. ADR-027#d24)
     semantic motion contract (ADR-027#amend-7 — 5항목):
     - 목적: 각 모션이 feedback / continuity / orientation / state-change 중 무엇을 전달하는가 (장식 목적 금지).
     - 빈도: 반복 흐름일수록 motion budget↓ (자주 보는 전환은 짧고 절제).
     - 실행: duration·easing은 project token으로 (interruptible, layout shift 없음).
     - 접근성: `prefers-reduced-motion`에서 정보손실 없는 대체 상태 제공.
     - 금지: decorative infinite/repeated 모션.
     수치는 project token의 *시작 default*로만 (보편 법칙 아님): 버튼 100~160ms / 라우팅 UI 160~240ms / entrance·exit 240~360ms (Material 3 참고). -->
```

## 3.7 DESIGN.md §9 — 접근성 + category 정합 (DS-2)

**기존** (§9 주석 내 두 줄):

```
     - hierarchy는 size+weight+color 중 2축 이상
     - 한 화면 primary CTA 2개 이상 금지
     - 모든 motion에 `prefers-reduced-motion` 분기
     - 모든 컴포넌트에 ## 7 의 8 상태 매트릭스 정의 (특히 empty/loading/error 누락 빈번)
```

**변경**: "8 상태 매트릭스" 줄을 category로 바꾸고, "hierarchy는 …" 다음에 접근성 블록을 삽입한다:

```
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
```

**왜**: 접근성은 기본 웹 스택의 기본기다. LLM이 못 잡는 정밀 비율은 §3.15의 실화면 axe가 결정적으로 잡고, 여기 문서 계약은 "확실히 잡히는 것"을 강하게 못박는다.

**같은 커밋의 인덱스·surface 동기**: `docs/90-decisions/boilerplate/README.md` ADR-027 행에 `+#amend-7: DESIGN 내용 계약 확장(정체성·a11y·semantic motion·category state·responsive·tabular)`을 추가한다. Amendment 7의 새 적용 surface가 base `## Surfaces`에 없으면 같은 커밋에만 추가한다.

> **중간 커밋 금지**: ADR-027/DESIGN 내용 계약만 먼저 커밋하지 않는다. 아래 스킬·에이전트·게이트 러너까지 배선한 뒤 Phase 3 종료 지점에서 한 번에 커밋한다.

## 3.8 researcher.md — 디자인 레퍼런스 모드 재설계 (DS-1)

**기존** (`.claude/agents/researcher.md` `## 디자인 레퍼런스 모드` 전체):

```
## 디자인 레퍼런스 모드 (ADR-040#amend-4)
호출 측이 "디자인 레퍼런스 모드"를 명시하면(주로 /bootstrap-design R0):
- 목적: 레퍼런스의 시각 시스템을 **코드 증거**로 추출한다 — 텍스트 인상 요약("미니멀하고 모던함")이 아니라 실제 값.
- 소스 위계: ① 사용자 제공 URL(raw CSS 파일이면 WebFetch로 직접 추출) → ② 오픈소스 디자인 토큰 패키지(WebSearch로 발견 → unpkg/GitHub raw에서 fetch — 예: GitHub Primer, Shopify Polaris, IBM Carbon, Adobe Spectrum, Atlassian) → ③ 정성 소스(디자인 요약 사이트 — 방향 어휘 보조로만).
- 추출 대상: `:root` CSS custom property / font-family stack / hex·rgba 색 상위 N개 / spacing·radius·shadow 수치. minified 전문 반환 금지 — 증류만.
- 한계 정직 보고: 일반 HTML 페이지는 markdown 변환으로 stylesheet URL·CSS가 소실됨 — 발견 불가면 "추출 불가 — <사유>"를 반환하고 날조하지 않는다. CSS-in-JS/Tailwind JIT는 수율 낮음 명시.
- 값 복제 금지: 반환에 "추출 토큰은 구조 학습용 — 통째 복제는 특정 서비스 클론화" 1줄 포함.
- 반환 양식: DESIGN_RESEARCH.md 레퍼런스 섹션(color signature/typography/density/motion) + `### 추출 토큰 (코드)` fenced block(hex/font/spacing/radius/shadow 실값).
```

**변경**:

```
## 디자인 레퍼런스 모드 (ADR-040#amend-4 / ADR-058)
호출 측이 "디자인 레퍼런스 모드"를 명시하면(주로 /bootstrap-design R0):
- 목적: 레퍼런스를 **관측 기반 증거**로 확보한다 — 방향 어휘(behavior)는 docs·상호작용을 봤을 때만, 값(color/type/spacing)은 실제 코드/토큰을 봤을 때만 기록. "official"은 provenance이지 품질 점수 아님.
- **역할별 수집 (ADR-058 role 3종)**:
  - `task/behavior`·`identity/craft` 방향(Layer A): charter 기획 방향·서비스 성격에 맞는 디자인 방향·레퍼런스 제품을 WebSearch로 자율 탐색 → 방향 어휘 + what-to-borrow/avoid. 대부분 2차 소스라 값 추출은 안 됨(그래서 Layer B 별도).
  - `implementation system` 값 grounding(Layer B): 아래 핀 목록에서 실제 토큰 값 추출.
- **값 grounding 핀 목록 (검증된 원본 — 추측·404 금지)**:
  - Primer — `@primer/primitives` (unpkg `dist/css/...`·`dist/tokens/...json`)
  - Radix Colors — `@radix-ui/colors` (`*.css` — 예: `slate.css`의 `--slate-1..12` 실 hex + p3)
  - Shopify Polaris — `@shopify/polaris-tokens` (`dist/...` CSS/JSON)
  - Tailwind — 공개 default theme(색 스케일·spacing)
  - shadcn/ui — 토큰이 CSS가 아니라 JSON/registry에 있으므로 **JSON 엔드포인트** fetch
  - **비압축 개별 토큰 파일 우선**(minified 번들은 몇 값만 나옴). raw CSS가 없으면 **JSON 토큰 엔드포인트로 확장**.
  - **예시 URL + 버전 해석 규칙**(404 재발 방지): 정확 버전 고정 `unpkg.com/<pkg>@<x.y.z>/<path>` 권장. 버전 미상이면 `@latest`로 시도 → 404면 GitHub raw(`raw.githubusercontent.com/<org>/<repo>/<tag>/<path>`) fallback. 예: `unpkg.com/@radix-ui/colors/slate.css` · `unpkg.com/@primer/primitives/dist/tokens/` · `unpkg.com/@shopify/polaris-tokens/dist/` · Tailwind 색은 공식 문서/`tailwindcss` 패키지 `theme`. (정확 경로·파일명은 패키지 버전마다 다르므로 fetch 전 디렉터리 확인 — 추측 금지.)
- **거부 목록**: mobbin·copycats류 "가짜 요약/갤러리" 사이트는 값 추출 소스로 쓰지 않는다(이름 찾는 lead로만, 최종 근거는 canonical 제품·공식 문서·source/token 코드로 승격).
- 추출 대상: `:root` CSS custom property / font-family stack / hex·rgba 상위 N개 / spacing·radius·shadow 수치 / JSON 토큰. minified 전문 반환 금지 — 증류만.
- 한계 정직 보고: 실제 제품 페이지(Linear/Stripe/Vercel 등)는 markdown 변환으로 CSS가 소실돼 값 추출이 자주 실패([관측됨] 0/3). stylesheet/토큰 URL을 못 찾으면 "추출 불가 — <사유>" 반환, 날조 금지.
- 값 복제 금지: "추출 토큰은 구조 학습용 — 통째 복제는 클론화" 1줄 포함.
- 반환 양식: DESIGN_RESEARCH.md 최소 schema(source/canonical | role | 뒷받침한 결정 | 검증(visual/behavior/code) | 관측일 | borrow | avoid | confidence) + `#### 추출 토큰 (코드)` fenced block.
```

**기존** (`.claude/agents/researcher.md` frontmatter — `model: sonnet`): DS-1은 웹 리서치 품질을 요구하지만 이 가이드는 모델 별칭 정책(ADR-004)을 건드리지 않는다. **frontmatter는 수정하지 않는다**(현행 `model: sonnet` 유지 — 별칭 변경은 범위 밖).

**추가 — ADR-040 부분 supersede 명시 (SSOT 충돌 해소)**: ADR-040#amend-4가 아직 소스 위계 "①사용자 URL 1순위"를 정책 SSOT로 유지해 ADR-058(AI 자율 디폴트)과 모순된다. ADR-040 `## 현재 유효 결정`의 디자인 레퍼런스 모드 줄을 부분 supersede로 표기한다.

**기존** (`docs/90-decisions/boilerplate/ADR-040-external-research-capability.md` `## 현재 유효 결정` 마지막 줄):

```
- 디자인 레퍼런스 모드(#amend-4): 호출 측 명시 시 코드 수준 토큰 추출 — 소스 위계 ①사용자 URL ②오픈소스 토큰 패키지 ③정성 소스, 추출 불가 시 정직 보고·값 통째 복제 금지.
```

**변경**:

```
- 디자인 레퍼런스 모드(#amend-4): 호출 측 명시 시 코드 수준 토큰 추출 — **소스 위계·"사용자 URL 1순위"는 [ADR-058](ADR-058-design-workflow.md)이 evidence-on-demand(AI 자율 리서치 디폴트 + 핀 목록 값 grounding, 사용자 입력=옵션 힌트)로 부분 supersede**. 추출 대상·정직 보고·값 통째 복제 금지 규율은 유효.
```

> ADR-058 `## 참고`의 "ADR-040#amend-4" 항목도 "(소스 위계는 ADR-058이 부분 supersede)"로 한 조각 보강한다.

**왜**: 레퍼런스 값 확보가 "운 좋으면 됨"에서 "핀 목록으로 안정적 확보 + 방향은 자율 리서치"로 바뀐다. ADR-040이 구 위계를 SSOT로 남기면 두 ADR이 모순되므로 부분 supersede를 명문화(ADR-045 부분 supersede 관례 — ADR-041/050 동형).

## 3.9 bootstrap-design R0 — evidence-on-demand (DS-1) + DESIGN_RESEARCH 최소 schema (DS-1e/DS-7b)

**기존**(§1.7 re-point 후 상태 — ADR 토큰은 ADR-058): `.claude/skills/bootstrap-design/SKILL.md`의 `## R0 — 레퍼런스 추출 + 안티-레퍼런스 + 레퍼런스 노트 영속화 (ADR-058)` 라운드 전체(heading부터 `## R1` 직전까지). 현재 R0는 5단 grounding 위계(①=사용자 URL 1순위), 안티-레퍼런스 1~2개 **필수**, DESIGN_RESEARCH.md 템플릿(color signature/typography/density/motion 4축). (절 전체를 교체하므로 매칭은 `## R0` heading으로 하고 내용은 아래로 갈음.)

**변경**: 그 R0 라운드 전체를 아래로 교체한다:

```
## R0 — 리서치: evidence-on-demand (ADR-058)

> 디폴트는 **AI 자율 리서치**. 사용자 제공 URL·취향은 *우선 힌트*(prerequisite 아님) — 있으면 Layer A에 우선 반영, 없어도 확인 게이트 없이 자율 진행.

- **먼저 방향타를 적는다**: primary task / 결정 순간 / 실패·복구 / 정체성 tension을 1줄씩. 리서치는 이 방향타를 채우는 것.
- **Layer A (방향 — 자율)**: charter 기획 방향·서비스 성격에 맞는 디자인 방향·레퍼런스 제품을 **researcher(디자인 레퍼런스 모드)** 위임으로 탐색 → 방향 어휘 + what-to-borrow/avoid. (Codex: 메인 세션이 researcher.md를 읽고 인라인 수행.)
- **Layer B (값 grounding)**: Layer A 방향에 맞는 오픈소스 토큰 패키지에서 실제 값 추출 — researcher 핀 목록(Primer/Radix/Polaris/Tailwind/shadcn). raw CSS 없으면 JSON 토큰 엔드포인트. 닫힌 제품은 "추출 불가 — <사유>" 정직 표기.
- **Layer C (포맷)**: Google 공식 예시 DESIGN.md는 **R5에서만** format fixture로 씀 — R0~R2 창작 컨텍스트에 넣지 않는다(glassmorphism/보라 예시가 §9 anti-slop 오염).
- **role 3종**: `task/behavior` · `identity/craft` · `implementation system`. counter-reference(안티-레퍼런스)는 *미해결 tension이나 실제 monoculture가 있을 때만* — **필수 아님**(구 "안티-레퍼런스 1~2개 필수"를 조건부로 완화).
- **정지 규칙**: 고정 최소 개수 없음 — evidence coverage가 차면 멈춘다. designer 최종 입력 보통 **3~5개 이하**(단순 내부 도구는 더 적게).
- **관측 기반 주장만**: visual 주장은 실화면/스크린샷 봤을 때만, behavior 주장은 docs/interaction 봤을 때만 기록. broad search·gallery·Dribbble/Behance는 이름 찾는 lead로만 허용 후 canonical로 승격.
- concept 안에서는 **coherent primary system 1개**. 명시 gap 시에만 secondary primitive(**Radix는 색만 fallback** — 타이포/레이아웃/IA/모션은 ground 못함).
- **MCP·계정 도구를 보일러플레이트 기본 의존으로 추가하지 않는다**(불변 — ADR-027#amend-2 비결정 존중).
- **레퍼런스 노트 영속화 (필수, `--fast`는 minimal)**: `docs/20-system/DESIGN_RESEARCH.md`에 **최소 schema**로 남긴다:

  ```markdown
  # 디자인 리서치 (레퍼런스 + 시안 선택 근거)

  > 모드: Reference (/bootstrap-design R0/R2 산출). SSOT는 DESIGN.md(확정 결정).
  - 조사일: <YYYY-MM-DD>

  ## 레퍼런스   <!-- R0 — 각 항목 최소 schema (ADR-058) -->
  ### <source/canonical> — <URL>
  - role: task/behavior | identity/craft | implementation system
  - 뒷받침한 결정: <이 레퍼런스가 뒷받침하는 디자인 결정>
  - 검증(provenance): visual | behavior | code   <!-- 실제로 본 것 기준 (provenance) -->
  - 관측일: <YYYY-MM-DD>
  - borrow: <1줄> / avoid: <1줄>
  - confidence/caveat: <1줄>
  #### 추출 토큰 (코드)   <!-- Layer B — hex/font/spacing/radius/shadow·JSON 실값. 미추출 시 "추출 불가 — <사유>" -->

  (레퍼런스는 coverage가 찰 때까지 — 보통 3~5개 이하)

  ## counter-reference   <!-- 조건부 — 미해결 tension·실제 monoculture 시에만 -->
  - <"~같지 말 것"> — <이유 1줄>

  ## grounding 출처   <!-- 자율 조사 / 사용자 URL / "추출 불가" 등 -->

  ## 시안 옵션   <!-- R2 REFINE/EXPLORE 카드 (선택 후 채움) -->
  ## 최종 선택   <!-- R2 -->
  ```

- DESIGN.md `## 1 Overview`는 본 노트를 상대경로 링크(`[디자인 리서치](DESIGN_RESEARCH.md)`) + borrow/avoid 1~2줄 + 긍정적 정체성(§1 필드)만 인라인. `## 시안 옵션`·`## 최종 선택`은 R2 종료 후 채운다(아래 R2-2).
```

**기존** (skill 헤더 패턴 줄):

```
> 패턴: `discover-product` 차용 — `context: fork`를 명시하지 않아 메인 세션이 R0~R6를 직접 운전한다. R0(레퍼런스 분해)과 R1(원칙 추출)의 무거운 추론은 `Agent` 도구로 **designer**를 단발 sub-call로 위임(ADR-058 — 코드 증거 수집은 researcher 디자인 레퍼런스 모드). 종료 후 사용자가 `/clear` 권장 (R0~R6 인터랙션이 다음 task 컨텍스트에 잡음).
> 라운드 구조 SSOT는 ADR-058(concept-mockup-first). DESIGN.md *내용*(8섹션+Motion / 3-tier 토큰 / Don'ts)·인터페이스 할당 SSOT는 ADR-027.
```
(ADR 토큰은 §1.7 re-point 반영분. §1.7은 토큰만 swap하므로 옛 제목 `(concept-mockup-first)`이 남아 있고, 아래 변경이 위임 구조와 함께 이를 정리한다.)

**변경**: 위임 구조를 researcher(방향·값 grounding)+designer(분해·시안)로 갱신하고 SSOT 문구를 정리한다(ADR 토큰 자체는 §1.7에서 이미 ADR-058):

```
> 패턴: `discover-product` 차용 — `context: fork`를 명시하지 않아 메인 세션이 R0~R6를 직접 운전한다. R0 방향 리서치·값 grounding은 `Agent` 도구로 **researcher**(디자인 레퍼런스 모드) + 분해·시안 authoring은 **designer** 단발 sub-call 위임(ADR-058). 종료 후 사용자가 `/clear` 권장.
> 라운드 구조·R0 리서치·수용 게이트·시안 카드 SSOT는 ADR-058(design workflow). DESIGN.md *내용*(8섹션+Motion / 3-tier 토큰 / Don'ts / 정체성·a11y·category state·responsive)·인터페이스 할당 SSOT는 ADR-027.
```

**기존** (`--fast` 모드 R0 정의):

```
- `--fast`: R0(위계 ①·⑤만 — 사용자 URL 있으면 사용, 없으면 확인 게이트 후 모델 지식 + minimal 노트) + R1(원칙 1줄 + voice 기본값 확인 1회) + R3(토큰) + R5(저장 — 축약 섹션, §10 포함). **R2(concept 시안)·R4(컴포넌트 인벤토리)·R6(preview)는 생략** — R5 저장은 *생략하지 않는다*(생략하면 DESIGN.md 가 안 채워져 skill 목적 무산). R1은 *완전 생략 금지* — R3 토큰 결정의 근거이므로 *minimal 1줄*(예: "monochrome + 1 accent")이라도 채운다. `--fast`에서 concept 시안이나 preview가 필요하면 종료 후 사용자가 "concept 시안 생성" 또는 "design-preview 생성"을 명시 발화 → R2 또는 R6만 단독 수행.
```

**변경**: R0를 evidence-on-demand minimal로 바꾼다(위계 표현 제거):

```
- `--fast`: R0(Layer A/B minimal — 있으면 사용자 힌트 우선, 없으면 자율 조사 1~2개로 최소 grounding + minimal 노트) + R1(원칙 1줄 + voice 기본값 확인 1회) + R3(토큰) + R5(저장 — 축약 섹션, §10 포함). **R2(concept 시안)·R4(컴포넌트 인벤토리)·R6(preview)는 생략** — R5 저장은 *생략하지 않는다*. R1은 *완전 생략 금지*(minimal 1줄). 게이트는 산출물 기준 — `--fast`는 R2·R6(concept/preview) 미생성이라 게이트 적용 대상 없음(N/A, ADR-058 D3). `--fast`에서 concept·preview가 필요하면 종료 후 명시 발화로 R2/R6 단독 수행.
```

## 3.9b bootstrap-design R5 — Google 포맷 fixture point-check (DS-1 Layer C)

**기존** (`.claude/skills/bootstrap-design/SKILL.md` R5 상태 승격 불릿):

```
- **DESIGN.md 상태 승격 (ADR-027#amend-3 / ADR-056)**: 본 R5 저장 완료 시 `docs/20-system/DESIGN.md` `## 0. Status`를 `draft` → **`living`**으로 갱신한다(정식·`--fast` 경로 모두 수행 — R6 생략 프로젝트도 승격되도록). 비-UI 삭제 경로는 불변.
```

**변경**: 그 불릿 *앞*에 포맷 fixture 점검 불릿을 추가한다(삽입만):

```
- **포맷 완성도 point-check (ADR-058 Layer C)**: R5 저장 직후 Google 공식 예시 DESIGN.md(`google-labs-code/design.md/examples` — authoritative, 예: `examples/paws-and-paths/DESIGN.md`(실측 확인된 완성 예시: Brand&Style/Colors/Typography/Layout/Elevation/Shapes/Components + 토큰))와 대조해 메인 세션이 *섹션 완성도·빠짐*만 advisory 점검한다(별도 agent 호출 불요 — 예시 fetch + 비교). **미감·값·시각 방향은 참조 금지**(공식 예시가 glassmorphism/보라 그라디언트라 §9 anti-slop 오염 — format fixture로만). (옵션) UI+Node면 `@google/design.md lint`(stack-guard 권장 명령)도 이 시점에 실행 가능.
- **DESIGN.md 상태 승격 (ADR-027#amend-3 / ADR-056)**: 본 R5 저장 완료 시 `docs/20-system/DESIGN.md` `## 0. Status`를 `draft` → **`living`**으로 갱신한다(정식·`--fast` 경로 모두 수행 — R6 생략 프로젝트도 승격되도록). 비-UI 삭제 경로는 불변.
```

**왜**: ADR-058 D2의 Layer C("R5에서 format fixture")가 실제 R5 단계로 실체화된다 — 지금까진 정책만 있고 실행 지점이 없었다.

## 3.10 bootstrap-design R2 — REFINE/EXPLORE 카드 (DS-5) + 수용 게이트 (DS-3)

**기존** (`## R2 — 다중 concept 시안` 의 R2-1 divergence 카드 불릿):

```
- **divergence 카드 (ADR-058)**: 각 concept에 {① 배타적 레퍼런스 borrow 축(R0 레퍼런스 중 concept별 배정 — 공유 금지; 레퍼런스 수 < concept 수면 동일 레퍼런스의 서로 다른 축(색/밀도/타이포/모션)을 배타 배정), ② 전용 안티-레퍼런스 1개, ③ 밀도/타이포/색 전략 중 최소 2축 상이}를 명시 배정하고 `DESIGN_RESEARCH.md ## 시안 옵션`에 카드를 기록한다. 두 concept이 같은 accent 전략·같은 borrow를 공유하면 재생성. 단 모든 concept이 R0 안티-레퍼런스와 `## 9` Don'ts는 공통 회피.
```

**변경**:

```
- **REFINE / EXPLORE 카드 (ADR-058 — 안전/과감 아님)**: 두 기본안을 이렇게 정의한다:
  - **REFINE**: 익숙한 task convention 우선 + restrained signature (검증된 패턴을 깔끔하게).
  - **EXPLORE**: signature-led이되 *같은* 익숙한 control/flow를 보존 (개성은 시각·마감에, 조작 흐름은 익숙하게).
  - 3번째 안은 *풀리지 않은 명시적 tension이 있을 때만*.
  각 concept 카드에 `task hypothesis | preserved convention | visible signature | failure sign`을 명시하고 `DESIGN_RESEARCH.md ## 시안 옵션`에 기록한다. **signature가 primary task를 더 빨리 이해시키지 못하면 장식 → 제거**(실험에서 rail·route 장식이 coherence를 해침). counter-reference(안티-레퍼런스)는 R0에서 조건부로 확보된 경우에만 공통 회피 대상으로 둔다. 모든 concept은 `## 9` Don'ts를 공통 회피. **익숙한 control/flow(조작 흐름)는 두 안 모두 보존하는 *공통 통제변수*** — 달라야 하는 건 layout hypothesis·visible signature다. 두 concept이 같은 **layout hypothesis·signature**를 공유하면 재생성(control/flow가 같은 건 재생성 사유 아님 — 통제변수). **concept 대표 화면은 실카피 + 대표 실데이터로 채워 렌더한다(빈 화면 금지 — R2-G populated axe가 유효하려면; dogfood 빈-화면 3.70:1 맹점 방지).**
```

**기존** (R2-1.5 구별성 비평):

```
### R2-1.5. 구별성 비평 (순차 1회 — ADR-058)
- 생성 직후 **reviewer(design surface) 단발 sub-call**(입력은 divergence 카드 + concept별 토큰 요약만, HTML 전문 투입 금지) 1회로 판정: ① concept 간 실질 구별성(같은 카드 축을 침범했는가) ② 안티-레퍼런스·`## 9` Don'ts 근접도. designer 자기 비평 금지(생성/감사 분리).
- **합의·병합·순위·추천 금지** — 출력은 "재생성 필요 concept 목록 + 사유"만. 재생성 필요 concept은 카드를 유지한 채 재생성 후 R2-2로.
```

**변경**: 판정 항목에 **시안 내부 조화 검사(DS-7a)**를 추가하고 카드 기준을 REFINE/EXPLORE로 갱신:

```
### R2-1.5. 구별성·조화 비평 (순차 1회 — ADR-058)
- 생성 직후 **reviewer(design surface) 단발 sub-call**(입력은 REFINE/EXPLORE 카드 + concept별 토큰 요약 — 이 단계는 렌더 *전* 값싼 개념 점검이라 HTML 전문 투입 금지; *픽셀* 판정은 뒤의 R2-G가 스크린샷으로 한다) 1회로 판정: ① concept 간 실질 구별성(REFINE/EXPLORE 성격이 실제로 다른가, signature가 task를 돕는가) ② `## 9` Don'ts·(있으면) counter-reference 근접도 ③ **시안 내부 조화 — *카드·토큰 수준의 선언된 짜깁기 신호만***(예: 상충하는 소스를 한 시안에 섞겠다는 카드). *렌더 픽셀의 실제 조화*는 R2-G 스크린샷 리뷰가 확인한다(R2-1.5는 카드만 보므로 여기서 픽셀 조화를 단정하지 않는다). designer 자기 비평 금지(생성/감사 분리).
- **합의·병합·순위·추천 금지** — 출력은 "재생성 필요 concept 목록 + 사유"만. 재생성 필요 concept은 카드를 유지한 채 재생성 후 R2-2로.
```

**변경 (신규 게이트 단계)**: R2-1.5 다음, R2-2 앞에 새 단계 R2-G를 삽입한다:

```
### R2-G. 수용 게이트 (ADR-058 D3 — full 모드)
`--fast`는 R2 자체를 생성하지 않으므로 본 게이트 N/A(ADR-058 D3 — 산출물 기준). full 모드는:
- **실행**: 각 concept을 `node scripts/design-gate.mjs docs/20-system/design-concepts/concept-*.html`로 검사 — **exit 0** 통과 / **exit 1** JSON `blockers`(serious·critical axe·320/375 geometry) 차단(실패 selector를 designer에 되먹여 재생성) / **exit 2**(Needs Install) 사유 echo 후 승인 보류(silent skip 금지).
- **렌더**: 각 concept HTML을 Playwright로 **1280 + 375** 캡처(desktop 폭은 프로젝트 target 명시 시 그 값). stack-guard가 깐 Playwright 재사용.
- **상시 결정적 검사**: **320 CSS px reflow**(page overflow / viewport escape / clipped text) + **populated DOM axe**(빈 화면 아님 — 대표 화면에 실데이터 채운 상태).
- **독립 픽셀 판정**: reviewer(design surface)가 1280/375 스크린샷을 Read로 열람해 위계·밀도·domain fit·장식 slop 판정(생성자 designer와 분리). LLM reviewer 1명.
- **차단(block) — 러너 결정적**(design-gate.mjs가 계산): serious/critical axe · page overflow · **viewport escape · clipped text**(320/375 geometry — check-reflow-320.cjs 이식). **차단(block) — reviewer 픽셀 판정**(스크린샷 열람, 러너가 못 잡는 *주관적* 영역): 위계 붕괴(nested card·장식 rail) · 밀도 · 장식 slop · critical overlap이 primary task를 저해할 때. **보고(report)**: moderate/minor axe + 취향·밀도 finding.
- **수동 smoke**(사람 몫): Tab 순서 · visible focus · trap 없음 · Escape close · 색 외 상태표식.
- **repair loop**: 차단 finding이 있으면 실패 selector + 요약을 **designer에 되먹여 재생성** → 재검사. **retry ≤2**, 초과 시 승인 보류 + brief(R0/R1) 재검토. 여전히 fail이면 그 concept은 선택지에서 제외(사용자에게 사유 echo).
- **정리**: 게이트용 임시 렌더/스크린샷은 통과 판정 후 정리(concept HTML은 R2-2 선택까지 유지 — R6-3에서 최종 삭제).
```

**왜**: 실측상 진짜 품질 지렛대는 이 폐쇄 루프(serious 5/8→0/8)다. 스크린샷만 본 사람은 대비 실패를 놓치므로 axe·320이 결정적으로 잡고, 픽셀 감사는 장식 slop·위계를 잡는다.

## 3.11 bootstrap-design R3 밀도 힌트 (DS-7f) + R6 게이트 (DS-3) + R4 category state (DS-7d)

**기존** (R3 토큰 불릿 마지막):

```
- radius / shadow / motion (duration·easing·`prefers-reduced-motion`).
- WCAG 4.5:1 텍스트 대비 검증 권장.
```

**변경**: 밀도 힌트 한 줄 추가:

```
- radius / shadow / motion (duration·easing·`prefers-reduced-motion` — §8 semantic motion contract 정합).
- WCAG 4.5:1 텍스트 대비 검증 권장(정밀 검사는 R6/게이트의 axe가 결정적).
- **밀도 힌트**: 제품 성격에 맞는 밀도를 1줄 — 대시보드=조밀 / 마케팅·랜딩=여유 (DESIGN.md §1 contextual density와 정합).
```

**기존** (R4 헤더 + 8상태 강제):

```
## R4 — 컴포넌트 인벤토리 + 상태 매트릭스 (ADR-027#d6/#d7)
- primitives (Button/Input/Text/Icon), composites (Card/Modal/Toast), patterns (Form/EmptyState/ErrorState/LoadingState).
- 각 컴포넌트마다 상태 매트릭스 강제: default / hover / active / focus / disabled / loading / error / empty.
```

**변경**: category state 계약으로:

```
## R4 — 컴포넌트 인벤토리 + category state 계약 (ADR-027#amend-7)
- primitives (Button/Input/Text/Icon), composites (Card/Modal/Toast), patterns (Form/EmptyState/ErrorState/LoadingState).
- 상태 = category별 expected (DESIGN.md §7 정합): interactive primitive(default/hover/active/focus-visible/disabled, async면 loading) · data composite/screen(default/loading/empty/error/success) · static primitive(상태 매트릭스 없음). N/A는 category상 expected를 의도적으로 뺄 때만.
```

**기존** (R6-1 preview Components 렌더 줄):

```
  2. **Components** — DESIGN.md `## 7` 인벤토리의 각 컴포넌트를 8 상태(default/hover/active/focus/disabled/loading/error/empty)로 나란히 렌더. hover/active/focus는 CSS pseudo + *상태 클래스 변형*(예: `.is-hover`)을 둘 다 둬서 정적 캡처에서도 보이게 한다.
```

**변경**:

```
  2. **Components** — DESIGN.md `## 7` 인벤토리의 각 컴포넌트를 그 category의 expected 상태(§7 계약 — interactive: default/hover/active/focus-visible/disabled[+loading] · data/screen: default/loading/empty/error/success · static: 없음)로 나란히 렌더. hover/active/focus-visible는 CSS pseudo + *상태 클래스 변형*(예: `.is-hover`)을 둘 다 둬서 정적 캡처에서도 보이게 한다.
```

**변경 (R6 게이트)**: R6-2 검토 루프에 R2-G와 동일한 결정적 검사를 얹는다. R6-1 self-check 줄 다음에 한 단락 추가:

**기존**:

```
- 생성 직후 DESIGN.md `## 9 Do's and Don'ts` 위반을 self-check해 위반 의심 항목을 출력에 보고(자동 차단 X).
```

**변경**:

```
- 생성 직후 DESIGN.md `## 9 Do's and Don'ts` 위반을 self-check해 위반 의심 항목을 출력에 보고(자동 차단 X).
- **수용 게이트 (ADR-058 D3 — full 모드)**: preview를 `node scripts/design-gate.mjs docs/20-system/design-preview.html`로 검사한다(R2-G와 동일 분리 — **러너 결정적 차단**: serious/critical axe·320/375 geometry(page overflow·viewport escape·clipped text); **reviewer 픽셀 차단**(스크린샷): 위계 붕괴·밀도·장식 slop·critical overlap; moderate/minor+취향 = 보고). **픽셀 판정은 R2-G와 동일하게 reviewer(design surface)를 단발 호출해 1280/375 스크린샷을 Read로 열람·판정한다**(생성자 designer와 분리, LLM reviewer 1명 — R6에도 이 호출이 명시적으로 있어야 선언한 픽셀 차단이 실제로 집행된다). 차단 발견 시 **DESIGN.md(SSOT)를 먼저 고치고** preview 재생성(retry ≤2, 초과 시 승인 보류 + brief 재검토). exit 2(Needs Install)면 사유 echo 후 승인 보류. `--fast`는 preview(R6) 미생성이라 본 게이트 N/A(산출물 기준).
```

**왜**: R2(concept)와 R6(preview) 두 지점에서 렌더·DOM을 결정적으로 검사해 배포불가 결함을 승인 전에 제거한다.

## 3.12 designer.md — R0 evidence-on-demand + REFINE/EXPLORE + repair 되먹임 (DS-1/5/3)

**기존** (`.claude/agents/designer.md` 역할 목록):

```
역할:
- 레퍼런스 분해(R0): 코드 증거(추출 토큰 — researcher 디자인 레퍼런스 모드 산출)를 입력으로 color signature / typography pairing / density / motion 톤 + what-to-borrow / what-to-avoid를 분해한다.
- 디자인 원칙(R1): actionable verb 원칙 3~5개. 모호어("modern/clean/sleek") 금지.
- concept 시안(R2): divergence 카드에 따라 *서로 확실히 다른* 방향의 자기완결 HTML/CSS 시안을 authoring한다.
```

**변경**:

```
역할:
- 레퍼런스 분해(R0): researcher가 확보한 방향(Layer A) + 추출 토큰(Layer B)을 입력으로 what-to-borrow/avoid + role별(task/behavior·identity/craft·implementation system) 정리를 분해한다(ADR-058 evidence-on-demand).
- 디자인 원칙(R1): actionable verb 원칙 3~5개. 모호어("modern/clean/sleek") 금지.
- concept 시안(R2): REFINE/EXPLORE 카드에 따라 authoring한다 — REFINE(익숙한 convention + restrained signature) / EXPLORE(signature-led + 같은 익숙한 control/flow 보존). signature가 primary task를 더 빨리 이해시키지 못하면 장식이므로 넣지 않는다(ADR-058). 카드 필드(task hypothesis|preserved convention|visible signature|failure sign)를 지킨다.
- **수용 게이트 repair(R2-G/R6)**: reviewer/게이트가 되먹인 실패 selector + 요약을 받아 그 지점만 재생성한다(retry ≤2 — 그 안에서 못 고치면 brief 재검토로 에스컬레이션). identity·layout 전면 재설계가 아니라 지목된 결함(대비·overflow·clipping 등)만 고친다.
```

**왜**: designer가 evidence-on-demand 입력과 REFINE/EXPLORE 카드, repair 되먹임을 명시적으로 다루게 한다. (R5 프로토타입 PX 마커 의무는 `ADR-056#amend-1` surface라 Phase 4 §4.1에서 amend와 *원자 적용*한다 — Phase 3 forward-ref 방지. **§3.12 designer 편집은 PX를 참조하지 않는다** — P1-6.)

## 3.13 reviewer.md — a11y 차원 신설 + category state + bootstrap-design 게이트 호출자 (DS-2/3/7)

**기존** (호출 surface `design` 줄):

```
- `design`: Design Consistency 5 (아래 별도 섹션 — ADR-027#amend-1). UI 프로젝트에서 stabilize-milestone 이 호출.
```

**변경**:

```
- `design`: Design Consistency 6 (아래 별도 섹션 — ADR-027#amend-1·#amend-7). UI 프로젝트에서 stabilize-milestone(구현 후 감사) 및 **bootstrap-design R2-G/R6 수용 게이트(ADR-058 — concept/preview 픽셀·구별성 판정)**가 호출.
```

**기존** (Design Consistency 섹션 헤더 + 3·4번 차원):

```
## Design Consistency 5 차원 (design surface 전용 — ADR-027#amend-1 / ADR-056)

stabilize-milestone 이 UI 프로젝트 surface 호출 시 본 차원 적용. 호출 측이 렌더 증거(스크린샷 갤러리 경로·visual-qa 결과)를 주입하면 Read로 이미지를 열람해 판단에 사용한다(ADR-027#amend-6). 증거 없으면 기존 grep·문서 기반 판정만.
```

**변경** (헤더를 6차원으로, 호출자·게이트 문구 보강):

```
## Design Consistency 6 차원 (design surface 전용 — ADR-027#amend-1·#amend-7 / ADR-056 / ADR-058)

stabilize-milestone(구현 후) 및 bootstrap-design R2-G/R6 수용 게이트(ADR-058 — concept/preview)에서 호출. 호출 측이 렌더 증거(스크린샷·1280/375 캡처·axe 결과)를 주입하면 Read로 이미지를 열람해 픽셀 판정(위계·밀도·domain fit·장식 slop)에 쓴다. 증거 없으면 grep·문서 기반 판정만.

**단계 스코프 (중요)**: **concept(R2-G)** 단계는 DESIGN.md 확정 전이라 `[Design-token]`·`[Design-inventory]`·`[Design-state]`·`[Design-donts]`·`[Design-voice]`(= DESIGN.md 계약 의존 5차원)를 **적용하지 않는다** — 픽셀 판정(위계·밀도·domain fit·slop) + `[Design-a11y]`만(concept의 *정상* raw hex·미등록 컴포넌트 P1 오판 금지). **preview(R6)·stabilize**에서만 6차원 전부(DESIGN.md 확정 후).
```

**기존** ([Design-state] 차원):

```
3. **[Design-state]** — **DESIGN.md `## 7` 본문에 등록된 컴포넌트 정의** 가 default/hover/active/focus/disabled/loading/error/empty 8 상태 매트릭스를 *모두 설계* 했는가 (문서 설계 기준 — task 구현이 8 상태 모두 구현했는지는 별도 차원). 누락 발견 시 `P1 [Design-state] DESIGN.md ## 7 의 <component> 정의에 <상태> 누락`. *task 구현 단계의 use-case 한정 상태 검증* 은 validator (validate-workitem) 책임 — 본 차원과 책임 분리. (P1)
```

**변경**:

```
3. **[Design-state]** — **DESIGN.md `## 7` 본문에 등록된 컴포넌트 정의**가 그 category의 expected 상태(ADR-027#amend-7 — interactive: default/hover/active/focus-visible/disabled[+loading] · data/screen: default/loading/empty/error/success · static: 없음)를 *모두 설계* 했는가. 누락 발견 시 `P1 [Design-state] DESIGN.md ## 7 의 <component>(category) 정의에 <상태> 누락`. *task 구현 단계의 use-case 한정 상태 검증*은 validator 책임 — 본 차원과 분리. (P1)
```

**변경 (a11y 차원 신설)**: [Design-voice] (5번) 다음에 6번 차원을 추가한다:

```
6. **[Design-a11y]** (ADR-027#amend-7) — WCAG 2.2 접근성. *deterministic·강*(렌더 증거 있으면 axe 결과 반영, 없으면 grep): 포커스 링 제거(`outline:none`만) / 아이콘 버튼 accessible name 누락(computed name 부재 — aria-label·aria-labelledby·visible text·alt·title 어느 것도 없음) / 색-단독 상태표시. *LLM·권고*: 대비 비율 미달 의심(정밀 비율·computed name은 실화면 axe가 결정적 — stack-guard populated axe·design-gate.mjs). 색·포커스·라벨은 P1, 정밀 대비는 P2 권고. DESIGN.md 부재 시 skip + 명시. (P1)
```

**변경 (8상태 책임 분배 표 정합)**: 그 아래 "8 상태 매트릭스 책임 분배" 표의 마지막 행(stabilize design surface) 기준 문구를 category로 갱신한다.

**기존**:

```
| stabilize-milestone design surface [Design-state] | reviewer (design surface) | DESIGN.md `## 7` 본문에 *컴포넌트 정의가 8 상태 전체* 설계됐는가? |
```

**변경**:

```
| stabilize-milestone design surface [Design-state] | reviewer (design surface) | DESIGN.md `## 7` 본문에 *컴포넌트 정의가 그 category의 expected 상태 전부* 설계됐는가? (ADR-027#amend-7) |
```

**변경 (표 제목 + 근거 정합 — DS-7)**: 같은 "8 상태 매트릭스 책임 분배" 표의 *제목*과 *근거*도 category로 바꾼다(안 그러면 위 category [Design-state]와 한 파일 안에서 모순).

**기존**:

```
**8 상태 매트릭스 책임 분배**:
```

**변경**:

```
**상태 매트릭스 책임 분배 (category 계약 — ADR-027#amend-7)**:
```

**기존**:

```
**근거**: DESIGN.md 는 *설계 문서* (8 상태 전 설계가 컴포넌트 인벤토리의 책임). task 는 *구현 단위* (1 task 1 RGR 사이클 — 8 상태 전부 1 task 강제는 ADR-026 sizing 위반). 두 surface 가 다른 기준으로 점검해야 정합.
```

**변경**:

```
**근거**: DESIGN.md 는 *설계 문서* (category별 expected 상태 전 설계가 컴포넌트 인벤토리의 책임). task 는 *구현 단위* (1 task 1 RGR 사이클 — category 전체를 1 task 에 강제하면 ADR-026 sizing 위반). 두 surface 가 다른 기준으로 점검해야 정합.
```

**기존** ([Plan-design] 차원 — Plan Quality 섹션 9번, "8 상태 매트릭스" 문구):

```
9. **[Plan-design]** (UI 프로젝트 한정 — ADR-027#amend-1) — DESIGN.md `## 7. Components` 인벤토리 외 새 컴포넌트 즉흥 신설 / AC 본문에 raw hex 색 코드 (`#[0-9A-Fa-f]{3,6}`) / DESIGN.md `## 9. Do's and Don'ts` 위반 (anti-slop 패턴 포함 — gradient·nested cards 등) / **task 본문의 use-case 에 등장하는 상태가 AC 에 누락** (예: hover/disabled 가 본문 시나리오에 있는데 AC 미언급). *전체 8 상태 매트릭스 (default/hover/active/focus/disabled/loading/error/empty) 의 설계 여부는 별도 차원* — DESIGN.md `## 7` 본문에 컴포넌트가 *등록될 때* 8 상태가 함께 설계됐는지는 [Design-state] (stabilize-milestone `design` surface) 책임. plan 단계는 *use-case 한정* 책임. **DESIGN.md 파일 부재 시 본 차원 skip + "핵심 관찰" 에 한 줄 명시** (비-UI 프로젝트 정상 경로). / **UI task 카피가 DESIGN.md §10 위반·미참조** (ADR-056) (P1 권장)
```

**변경**: "8 상태 매트릭스"를 category로 바꾸고 a11y 언급을 더한다. 위 문단에서 `*전체 8 상태 매트릭스 (default/hover/active/focus/disabled/loading/error/empty) 의 설계 여부는 별도 차원*` 부분을 다음으로 교체(같은 문단 뒤쪽의 `등록될 때 8 상태가 함께 설계됐는지` cross-ref도 `그 category의 expected 상태`로 정합):

```
*전체 category state (ADR-027#amend-7 — interactive/data/static) 의 설계 여부는 별도 차원*
```

그리고 문단 끝 `/ **UI task 카피가 DESIGN.md §10 위반·미참조** (ADR-056) (P1 권장)` 앞에 a11y 한 조각을 더한다:

```
/ **AC·task 본문에 색-단독 상태표시·포커스 제거·아이콘 버튼 라벨 누락이 명시적으로 드러나면** DESIGN.md §9 a11y 위반 의심(ADR-027#amend-7) / **UI task 카피가 DESIGN.md §10 위반·미참조** (ADR-056) (P1 권장)
```

**왜**: reviewer가 접근성을 6번째 차원으로 감사하고, 8상태→category 정합을 맞추며, bootstrap-design 게이트의 픽셀 판정자로 등재된다.

## 3.14 validate-plan [Plan-design] 미러 (DS-2/DS-7d)

**기존** (`.claude/skills/validate-plan/SKILL.md` 차원 9 — **validate-plan 전용**. reviewer.md의 [Plan-design]는 문구가 다른 별도 버전으로 §3.13가 이미 처리했다 — 여기서 다시 손대지 않는다):

```
9. **[Plan-design]** (UI 한정 — DESIGN.md 부재 시 skip) — DESIGN.md `## 7` 인벤토리 외 컴포넌트 신설 / raw hex / Don'ts 위반 / 8 상태 매트릭스 누락 / **UI task 카피가 DESIGN.md §10 위반·미참조** (ADR-056). P1 권장.
```

**변경** (validate-plan 차원 9만 — reviewer.md는 §3.13에서 이미 category/a11y로 바뀜):

```
9. **[Plan-design]** (UI 한정 — DESIGN.md 부재 시 skip) — DESIGN.md `## 7` 인벤토리 외 컴포넌트 신설 / raw hex / Don'ts 위반 / task use-case 에 등장하는 category state(§7 — interactive/data/static)가 AC 에 누락 / **AC·task 본문의 색-단독·포커스 제거·아이콘 라벨 누락 = §9 a11y 위반 의심**(ADR-027#amend-7) / **UI task 카피가 DESIGN.md §10 위반·미참조** (ADR-056). P1 권장.
```

**왜**: plan surface의 [Plan-design]을 category state·a11y로 정합. reviewer.md [Plan-design]은 §3.13가 담당한다(둘은 *개념적* 미러 — 각자 형식이 달라 byte-identical 아님). 차원 *개수*를 안 늘리므로 카운트 표는 그대로다.

## 3.15 stack-guard — populated axe·320 reflow (DS-3) + @google/design.md lint version-pin (DS-7g)

**기존** (`.claude/skills/stack-guard/SKILL.md` 6-4-1 visual-QA breakpoint 루프):

```
     - breakpoint 루프(375/768/1440): (a) **가로 overflow** — `document.scrollingElement.scrollWidth > clientWidth` false 단언(가로 스크롤 없음). **차단**: 졸업 e2e 실패(진짜 버그, FP 드묾). (b) **요소 겹침** — `getBoundingClientRect()` 교차 점검. **권고만**(sticky header·모달·툴팁 등 정당한 겹침 FP 가능 → 차단 X, P1 기록). (c) **a11y** `@axe-core/playwright` wcag2aa — **권고만**.
```

**변경**: 320을 루프에 넣고, populated 화면에서 axe를 돌리며 serious/critical을 차단으로 올린다:

```
     - breakpoint 루프(**320**/375/768/1440): (a) **가로 overflow** — `document.scrollingElement.scrollWidth > clientWidth` false 단언(가로 스크롤 없음). **차단**: 졸업 e2e 실패(진짜 버그, FP 드묾). 320은 375만으로 놓치는 좁은 화면 실패를 잡는다(실측 반례 존재). (b) **요소 겹침** — `getBoundingClientRect()` 교차 점검. **권고만**(sticky header·모달·툴팁 등 정당한 겹침 FP 가능 → 차단 X, P1 기록). (c) **a11y** `@axe-core/playwright` — **실데이터가 채워진 대표 화면(빈 화면 아님)**에서 실행하고, **serious/critical 위반은 차단**(졸업 e2e 실패), moderate/minor는 권고. (빈 화면만 검사해 대비 실패를 놓친 dogfood 문제 해결 — ADR-058 D3.)
```

**기존** (DESIGN.md lint 권장 명령):

```
- **권장 명령** (강제 X, shared 기본값 미등록 — 사용자가 채택 시 `validate` 의 lint 단계 또는 CI에 wiring):
  ```bash
  npx @google/design.md lint docs/20-system/DESIGN.md
  ```
- 검사 항목: broken token reference / missing primary color / WCAG contrast / orphaned token / **section ordering** 등. exit 1 on error.
```

**변경** (version-pin + runtime rule 조회 + Windows):

```
- **권장 명령** (강제 X, shared 기본값 미등록 — 사용자가 채택 시 `validate` 의 lint 단계 또는 CI에 wiring):
  ```bash
  npx @google/design.md@<x.y.z> lint docs/20-system/DESIGN.md   # version-pin (alpha라 변동 — 실제 버전 고정)
  # 규칙 목록은 문서에 박지 말고 runtime 조회: npx -p @google/design.md@<x.y.z> designmd spec --rules
  # Windows: npx -p @google/design.md@<x.y.z> designmd lint docs/20-system/DESIGN.md
  ```
- 검사 항목은 버전마다 다르므로 `spec --rules`로 조회한다(현재 broken token ref / WCAG contrast / orphaned token / section ordering 등). **format·declared-token 보조일 뿐 browser a11y 게이트가 아니다** — 실화면 접근성은 위 breakpoint 루프 (c)의 populated axe·렌더가 담당. exit 1 on error.
```

**변경 (설치 배선) — `@axe-core/playwright` devDep (Blocking 해소)**: 현재 stack-guard는 visual-qa.spec에서 `@axe-core/playwright`를 *쓰기만* 하고 **설치하지 않아** design-gate·visual-qa가 exit 2(Needs Install)로 죽는다(실측 확인). 6-2 toolchain 설치 또는 6-4-1 scaffold 시점에 `@axe-core/playwright`를 **devDep로 설치**한다(감지된 PM으로, 예: `npm i -D @axe-core/playwright`). 설치 실패는 stack-guard 6-5 `Needs Install` fallback(날조 금지). — 즉 UI 프로젝트는 Playwright(재사용) + `@axe-core/playwright`(신규 devDep) 둘을 갖는다.

> **기존 fork 마이그레이션**: stack-guard는 `이미 e2e/visual-qa.spec.* 있으면 덮어쓰지 않는다`. 그래서 이 변경 *전에* scaffold된 fork는 여전히 advisory axe·375-only다 — 그 fork에서는 `e2e/visual-qa.spec.*`의 axe 단언을 blocking으로, breakpoint에 320을 수동으로 올려야 한다(신규 scaffold만 자동 반영). 신규 프로젝트는 해당 없음.

**왜**: 렌더·DOM 검사(populated axe·320)를 stack-guard 런타임에 심어 bootstrap-design 게이트(§3.10/3.13)와 졸업 e2e가 같은 결정적 검사를 공유한다. google lint는 버전 변동에 안전하게 pin + runtime 조회로.

## 3.16 DS-3 게이트 실행 배선 — allowed-tools + 러너 스크립트 (실행 불가 결함 해소)

**왜 필요**: §3.10 R2-G·§3.11 R6 게이트가 "Playwright로 렌더 + axe"를 요구하지만, 현재 `bootstrap-design` frontmatter의 `allowed-tools`는 `Bash(rm ...)` 2개뿐이라 **렌더·axe를 실행할 권한이 없다**(게이트가 글로만 존재). 실행 배선을 준다.

**변경 (a) — bootstrap-design allowed-tools 확장**.

**기존** (`.claude/skills/bootstrap-design/SKILL.md` frontmatter):

```
allowed-tools: Read Glob Grep Write Edit Agent Bash(rm docs/20-system/design-preview.html) Bash(rm docs/20-system/design-concepts/concept-*.html)
```

**변경**:

```
allowed-tools: Read Glob Grep Write Edit Agent Bash(rm docs/20-system/design-preview.html) Bash(rm docs/20-system/design-concepts/concept-*.html) Bash(node scripts/design-gate.mjs*) Bash(npx playwright*) WebFetch(domain:github.com)
```

**변경 (b) — 게이트 러너 신설**. 새 파일 `scripts/design-gate.mjs`(Node ESM). concept/preview HTML을 1280/375/320에서 렌더 → **결정적 검사**(page-overflow[전 뷰포트] + viewport escape·clipped text[narrow ≤375만; sr-only·aria-hidden/inert·contained-scroll·ellipsis 제외] + populated axe serious/critical[1280·320]) → `{blockers[], reports[], screenshots[]}` JSON(블록에 실패 selector 포함 — designer repair 되먹임용) + blocker 있으면 exit 1. **위계·밀도·slop·overlap(장식 요소 겹침)은 러너가 검출하지 않는다** — 대신 1280/375 스크린샷(`screenshots[]`)을 출력해 reviewer가 픽셀로 판정한다(design-eval 실측: source-slop·hierarchy는 axe·layout으로 clean이라 vision 필요). geometry(overflow·escape·clip)는 러너가 결정적으로 잡으므로 reviewer 몫이 아니다. `@axe-core/playwright`가 `browser.newContext()`에서 만든 page를 요구하므로 러너는 context→page로 생성한다(`browser.newPage()` 직접 사용 시 예외 — 실브라우저 검증됨). Playwright/axe 미설치면 `Needs Install` echo 후 exit 2(승인 보류는 호출 측 판단 — 날조·통과 위장 금지). stack-guard가 UI 프로젝트에 깐 **Playwright를 재사용** + **`@axe-core/playwright`를 devDep로 추가**(stack-guard가 설치 — §3.15; 비-UI 프로젝트엔 둘 다 없음). 없으면 러너가 exit 2(Needs Install)로 정직하게 멈춘다. **최초 1회는 의도적 결함(저대비·가로 overflow) 샘플 HTML로 스모크 확인** 후 신뢰:

```javascript
#!/usr/bin/env node
// 디자인 수용 게이트 러너 (ADR-058 D3). 입력: concept/preview/prototype HTML 경로들.
// 각 파일 1280/375/320 렌더 → 320 page-overflow + populated axe(1280·320). blocker에 실패 selector 포함.
import { resolve, basename, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { mkdirSync, rmSync, readdirSync } from 'node:fs';
let chromium, AxeBuilder;
try {
  // stack-guard가 까는 것은 @playwright/test(standalone playwright 아님) — playwright 우선 시도, 없으면 @playwright/test에서 chromium 회수(둘 다 chromium을 export).
  try { ({ chromium } = await import('playwright')); }
  catch { ({ chromium } = await import('@playwright/test')); }
  ({ default: AxeBuilder } = await import('@axe-core/playwright'));
} catch (e) {
  console.error('Needs Install: npm i -D @playwright/test @axe-core/playwright && npx playwright install — 게이트 미실행(모듈 부재). 사유: ' + e.message);
  process.exit(2); // 실행 불가 = skip(사유 echo). 승인 보류 여부는 호출 측(bootstrap-design)이 판단
}
// 셸이 glob을 확장하지 않는 환경(PowerShell·cmd·Codex는 concept-*.html을 리터럴로 Node에 전달) 대비 — arg에 '*'가 있으면 러너가 직접 확장한다(bash에서 이미 확장됐으면 '*' 없어 no-op).
const expandGlob = (pat) => {
  if (!pat.includes('*')) return [pat];
  const slash = Math.max(pat.lastIndexOf('/'), pat.lastIndexOf('\\'));
  const dir = slash >= 0 ? pat.slice(0, slash) : '.';
  const rx = new RegExp('^' + pat.slice(slash + 1).replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
  try { return readdirSync(dir).filter((f) => rx.test(f)).map((f) => (slash >= 0 ? dir + '/' + f : f)); } catch { return []; }
};
const files = process.argv.slice(2).filter((a) => !a.startsWith('-')).flatMap(expandGlob);
if (!files.length) { console.error('usage: node scripts/design-gate.mjs <html...>'); process.exit(2); }
const SHOTS = 'design-gate-shots';
rmSync(SHOTS, { recursive: true, force: true }); // 이전 실행 잔여 스크린샷 제거 — reviewer가 stale 픽셀을 읽지 않도록 결정적 초기화(재실행마다 정확히 이번 입력분만)
mkdirSync(SHOTS, { recursive: true });
const VIEWPORTS = [{ w: 1280, h: 900 }, { w: 375, h: 812 }, { w: 320, h: 720 }];
let browser;
try {
  browser = await chromium.launch();
} catch (e) {
  // 모듈은 있으나 브라우저 바이너리 미설치 → 구조화된 exit 2(Needs Install), raw exit 1 아님(fail-closed 계약)
  console.error('Needs Install: npx playwright install (chromium 바이너리 부재) — 게이트 미실행. 사유: ' + e.message);
  process.exit(2);
}
const findings = [];
const screenshots = [];
try {
  for (const [idx, f] of files.entries()) {
    const context = await browser.newContext(); // @axe-core/playwright는 context에서 만든 page를 요구(browser.newPage() 직접 사용 시 예외)
    try {
      const page = await context.newPage();
      const name = `${idx}-${basename(f).replace(/\.html?$/i, '')}`; // idx 접두 — 동일 basename(예: M1/M2의 같은 화면명) 스크린샷 덮어쓰기 방지
      for (const vp of VIEWPORTS) {
        await page.setViewportSize({ width: vp.w, height: vp.h });
        await page.goto(pathToFileURL(resolve(f)).href, { waitUntil: 'networkidle' }); // 뷰포트별 fresh 렌더 — 한 번 로드 후 resize만 하면 load-time 반응형 JS를 놓치므로 뷰포트마다 재로드
        await page.evaluate(() => (document.fonts && document.fonts.ready) ? document.fonts.ready : null).catch(() => {}); // 웹폰트 안정화(스크린샷·geometry flakiness 방지)
        // 결정적 차단 (320px 브라우저 geometry — design-workflow eval의 check-reflow-320.cjs 로직 이식, 원본 local-only): page overflow(전 뷰포트) + element viewport escape·clipped text(narrow ≤375만 — desktop 의도적 off-canvas 오탐 회피). 이 셋은 러너가 결정적으로 잡는다(design-eval 실측 검증분).
        const geo = await page.evaluate((wide) => {
          const vis = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
          const sel = (el) => el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/)[0] : '');
          // 정상 UI 오탐 제외(실브라우저 검증분):
          // (1) sr-only/visually-hidden — 1px 클립 또는 clip/clip-path (2) aria-hidden/inert/hidden 조상(닫힌 drawer·off-canvas) (3) overflow scroll/auto 조상 안(contained 가로스크롤=의도적, 예: 넓은 표)
          const srOnly = (el) => { const s = getComputedStyle(el); return (el.clientWidth <= 1 && el.clientHeight <= 1) || (s.clip && s.clip !== 'auto') || (s.clipPath && s.clipPath !== 'none'); };
          const inaccessible = (el) => el.closest('[aria-hidden="true"],[inert],[hidden]') != null;
          const inScrollable = (el) => { let p = el.parentElement; while (p && p !== document.body) { const s = getComputedStyle(p); if (/(auto|scroll)/.test(s.overflowX)) return true; p = p.parentElement; } return false; }; // 가로 escape 판정용 — *가로* 스크롤 조상만 제외(세로 전용 스크롤 조상은 가로 넘침을 담지 못하므로 escape 유효). 조상 overflow:hidden clipping 검출은 미구현 — §5.3 smoke fixture로 검증 후 추가(테스트 없이 미검증 로직 투입 금지).
          const skip = (el) => !vis(el) || srOnly(el) || inaccessible(el);
          const overflow = document.documentElement.scrollWidth > innerWidth + 1;
          let escapes = [], clips = [];
          if (!wide) {
            escapes = [...document.querySelectorAll('body *')].filter((el) => { if (skip(el) || inScrollable(el)) return false; const r = el.getBoundingClientRect(); return r.left < -1 || r.right > innerWidth + 1; }).slice(0, 5).map(sel);
            // clip = overflow hidden/clip으로 *잘린* 텍스트. 의도적 text-overflow:ellipsis(정상 truncation)는 제외
            clips = [...document.querySelectorAll('h1,h2,h3,p,span,button,a,label,[data-check-text]')].filter((el) => { if (skip(el)) return false; const s = getComputedStyle(el); if (s.textOverflow === 'ellipsis') return false; const clipping = ['hidden', 'clip'].includes(s.overflowX) || ['hidden', 'clip'].includes(s.overflowY); return clipping && (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1); }).slice(0, 5).map(sel);
          }
          return { overflow, escapes, clips };
        }, vp.w > 375);
        if (geo.overflow) findings.push({ file: f, viewport: vp.w, block: true, kind: 'page-overflow', selector: 'document' });
        for (const s of geo.escapes) findings.push({ file: f, viewport: vp.w, block: true, kind: 'viewport-escape', selector: s });
        for (const s of geo.clips) findings.push({ file: f, viewport: vp.w, block: true, kind: 'clipped-text', selector: s });
        // reviewer 픽셀 판정용 스크린샷 — *주관적* 판정만(위계·밀도·slop·decorative-overlap). geometry(overflow·escape·clip)는 위에서 러너가 이미 결정적으로 잡았다. 세 뷰포트 전부 캡처
        {
          const shot = join(SHOTS, `${name}-${vp.w}.png`);
          await page.screenshot({ path: shot, fullPage: true });
          screenshots.push(shot);
        }
        // 결정적 차단 #2: populated axe (파일이 실카피·실데이터 렌더 전제). WCAG 태그 명시(stack-guard 선언 wcag2aa + 2.2 AA 정합), serious/critical만 block
        if (vp.w === 1280 || vp.w === 320) {
          const res = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
          for (const v of res.violations) {
            const block = v.impact === 'serious' || v.impact === 'critical';
            findings.push({ file: f, viewport: vp.w, block, kind: 'axe:' + v.id, impact: v.impact, selector: v.nodes.map((n) => n.target).flat().slice(0, 5) });
          }
          for (const v of res.incomplete) findings.push({ file: f, viewport: vp.w, block: false, kind: 'axe-incomplete:' + v.id, note: '자동 판정 불가 — 수동 검토' }); // incomplete = 수동 검토 대상(보고, 비차단)
        }
      }
    } catch (e) {
      // 렌더/분석 자체가 실패한 파일은 fail-closed로 blocker 처리(전체 배치 크래시 대신 그 파일만 차단)
      findings.push({ file: f, block: true, kind: 'render-error', selector: String(e && e.message || e).slice(0, 200) });
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close(); // 예외 경로에서도 chromium 프로세스 leak 방지
}
const blockers = findings.filter((x) => x.block);
console.log(JSON.stringify({ blockers, reports: findings.filter((x) => !x.block), screenshots }, null, 2));
process.exit(blockers.length ? 1 : 0);
```

**변경 (c) — R2-G·R6 게이트가 이 러너를 호출**. §3.10 R2-G와 §3.11 R6의 "렌더/axe" 검사는 다음으로 실체화된다:
- 실행: `node scripts/design-gate.mjs <concept 또는 preview HTML 경로들>`.
- exit 1 + JSON `blockers`(page-overflow / serious·critical axe) → **차단**: 실패 selector를 designer에 되먹여 재생성(repair loop, retry ≤2). `reports`(moderate/minor·취향) → 보고.
- exit 2(Needs Install) → 게이트 **미실행 사유를 echo하고 승인 보류**(silent skip 금지 — ADR-058 D3). browser 미가용(비-UI 환경 등)도 동일.
- 독립 픽셀 판정(위계·밀도·domain fit·장식 slop)은 러너 JSON에 더해 reviewer(design surface)가 1280/375 스크린샷을 Read로 열람해 수행(§3.13 — 게이트 자동 검사 ≠ 픽셀 취향 판정, 둘 다 필요).

**변경 (d) — producer와 같은 커밋에서 ADR-058 surface 추가**: ADR-058 `## Surfaces`에 이번 Phase에서 실제로 배선한 `.claude/agents/researcher.md`·`designer.md`·`reviewer.md`와 새 `scripts/design-gate.mjs`를 추가한다. 각 파일에는 ADR-058 역참조가 있어야 하며, 러너 파일을 만들기 전 Phase 1에서 경로만 미리 등재하지 않는다. Mutation Contract `Target`은 최종 목표 목록이므로 그대로 둔다. `plan-milestone` caller는 Phase 4 producer 커밋에서 별도로 추가한다.

**변경 (e) — `design-gate-shots/` gitignore (F6 — stray-commit 방지)**: 러너는 스크린샷을 cwd의 `design-gate-shots/`에 쓴다(reviewer 픽셀 판정 입력 — 통과 후 정리 대상, ephemeral). `git add -A`류에 딸려 커밋되지 않게 `.gitignore`에 한 줄을 추가한다:
```
design-gate-shots/
```
(concept/preview 임시 렌더가 이미 ephemeral 취급되는 것과 동일 — tracked 대상은 통과본 프로토타입뿐.)

**왜**: 게이트가 "글"에서 "실행 가능한 결정적 검사"가 된다. axe·overflow는 러너(도구)가 판정(LLM 추정 아님), 픽셀 취향은 reviewer가. Playwright 미설치 UI 환경은 Needs Install로 정직 처리(통과 위장 금지).

**같은 커밋의 산출물 인벤토리 동기**: `docs/00-meta/STRUCTURE.md` 산출물 표의 verify scripts 근처에 다음 행을 추가한다. 러너 파일·ADR-058 surface·`.gitignore`의 `design-gate-shots/`와 한 커밋으로 묶는다.
```
| design gate runner (UI) | `scripts/design-gate.mjs` | 수동 (UI 프로젝트에서 stack-guard Playwright/axe 재사용) | Reference | baseline |
```

> **커밋 (Phase 3 — DESIGN 계약 + 디자인 배선 + 러너)**:
> `feat(design): expand DESIGN contract and wire the ADR-058 acceptance workflow (ADR-027 amend 7)`

---

# Phase 4 — 계획·경험 계약 + 로드맵 (INST-1 · INST-2 · INST-3 · DS-4 · RD-1)

`ADR-056`(경험 계약)·`ADR-057`(플래닝)과 그 surface(plan-milestone·plan-workitem·validate-plan·stabilize·templates)가 한 덩어리로 얽힌 Phase다. 같은 파일을 여러 항목이 건드리므로 이 순서대로 편집한다.

> **INST-1 PX 설계 확정** (이 가이드가 정한 구체안): ① 프로토타입의 각 *경험 결정*에 `PX-M<N>-<screen>-NN` id를 붙인다(screen=화면 키, NN=화면 내 번호; **마일스톤 번호가 버전 — `/plan-milestone M<N>`에서 최종 승인 후 잠기고, 화면 변경은 다음 마일스톤의 새 `PX-M2-<screen>-NN`. 화면 revision·재승인 원자 교체·retire 없음**; 화면당 대략 3~8개 — 상태군·인터랙션군·핵심 카피를 *결정 단위*로, AC 3개 sizing과 충돌하지 않게 굵게). ② 그 목록은 feature 문서 `## 7`에 **PX 인벤토리**로 영속(plan-milestone R5-5가 승인 프로토타입에서 추출). ③ PX↔AC 매핑은 feature `## 7-3` subsection(FAC↔AC의 `## 7-1`과 동형). ④ 미참조 PX는 기존 `[Plan-FAC-coverage]` 차원을 *확장*해 잡는다(새 차원 신설 X — 차원 개수·미러·카운트표 불변). ⑤ 한 화면 PX가 여러 feature에 걸치면 **각 PX를 그것을 *구현하는* feature 하나에 귀속**(화면 통째로 몰지 않음 — 비소유 feature의 plan-workitem이 자기 PX를 못 매핑하는 INST-1 사각 방지); 화면-공통(shell/layout) 결정은 그 shell 담당 feature에 귀속하거나 DESIGN.md §4로 승격(PX 아님), cross-feature 정합은 PX owner가 아니라 `## 7-2` INV/seam으로(ADR-057#amend-2).

## 4.1 ADR-056 Amendment 1 — 프로토타입 경험 결정 PX 커버리지 (INST-1)

**기존**: `docs/90-decisions/boilerplate/ADR-056-milestone-experience-contract.md`는 amendment 0개, `## 현재 유효 결정` 없이 `## 참고`로 끝난다. 결정 3(입구 계약)은 프로토타입 참조/면제 *존재*만 점검하고, 결정 4(경험 좁힘)는 해석 분기 시에만 발화하는 해석-레벨 장치라 **프로토타입의 모든 경험 결정이 AC로 빠짐없이 내려갔는지(coverage)는 아무도 점검하지 않는다**(dogfood에서 sticky-pin 결정이 §3-V까지 안 잡힘 — 이번 실험 최대 수확이자 유일 졸업 차단 원인). Amendment 1이 base의 재승인·부분 진행 규칙도 정정하므로 ADR-045 D5상 net 규칙 요약이 필요하다.

**변경 (a) — `## 현재 유효 결정` 신설**: `## Status` 값 `accepted` 바로 뒤에 아래를 넣는다. 역사 본문을 삭제하지 않고 최종 적용자가 이 요약을 먼저 읽게 한다.

```
## 현재 유효 결정
- UI 마일스톤 경험 계약은 `/plan-milestone M<N>`의 R5에서 사용자 피드백·게이트를 거쳐 최종 화면 HTML로 승인한다. 같은 draft M 재실행만 미완 R5를 재개하며, M/F `ready` 뒤 `--prototype` 재진입·재승인·부분 보류는 없다. 변경은 다음 M(#amend-1, ADR-057#amend-3).
- 각 새/변경 경험 결정은 `PX-M<N>-<screen>-NN`; 승인 HTML 마커가 source, 구현 feature 한 곳의 `## 7` 인벤토리가 mirror. `/plan-workitem M<N>` 1회가 PX↔AC를 매핑하고 unmapped·중복·drift를 `[Plan-FAC-coverage]`가 검사(#amend-1).
- 프로토타입 raw hex는 custom-property 정의 라인만 예외이며 사용처는 검사한다(#amend-2). 마일스톤 `## 9` 화면 전환표의 존재 path(primary/failure/recovery)는 프로토타입·AC가 커버한다(#amend-3).
- stabilize의 경험 스크린샷 대조·DESIGN.md §10 voice·비-UI 면제 등 나머지 base 결정은 유지한다.
```

**변경 (b)**: 파일 맨 끝에 Amendment 1을 추가한다:

```
<a id="adr-056-amend-1"></a>
## Amendment 1 (2026-07-21) — 프로토타입 경험 결정 PX 커버리지 (계획 단계 coverage 대조)

### 배경
- [관측됨] SIMULATION_RUN Round 4 — 프로토타입의 "입력창 sticky-pin" 구성 결정이 어떤 task AC에도 안 내려갔고, 단위·E2E·per-task validate 전부 green이었는데 마일스톤 끝 §3-V 스크린샷 대조에서야 처음 발견됐다(되돌리기 비용 큼). 입구 계약(결정 3)은 프로토타입 *존재*만, 경험 좁힘(결정 4)은 *해석 분기*만 본다 — coverage 점검이 없다.

### 결정
1. **PX 식별자 (마일스톤 번호 = 버전)**: 승인 프로토타입의 각 *경험 결정*(레이아웃·인터랙션 결과·핵심 카피·못생긴 상태 처리 등, 결정 단위 — 화면당 대략 3~8개)에 **`PX-M<N>-<screen>-NN`** id를 부여한다(예 `PX-M1-dashboard-01` — 마일스톤·화면 슬러그·번호). designer가 R5-4/R5-5에서 프로토타입 HTML에 `<!-- PX-M<N>-<screen>-NN: <한 줄 결정> -->` 마커를 **의무로** 단다(이 HTML 마커가 PX의 *단일 source*, R5-5가 그대로 복사). **마일스톤 번호가 버전이다 (핵심)**: `/plan-milestone M<N>`에서 프로토타입을 사용자 피드백으로 여러 번 고쳐 **최종 승인**한 뒤 M<N>·feature를 확정하며, 그 시점부터 M<N>의 화면·PX는 **잠긴다**. 마일스톤 진행 중에는 프로토타입·기획을 바꾸지 않는다 — 다음 마일스톤에서 그 화면이 바뀌면 **새 마일스톤 id로 `PX-M2-<screen>-NN`**(별도 화면 revision·재승인·원자 교체·retire 없음 — *마일스톤 경계가 곧 버전 경계*). **PX는 그 마일스톤에서 *새로 도입·변경하는* 경험 결정만 표시**한다 — 합성 화면에 함께 보이는 *이전 마일스톤의 변경 없는* 영역은 시각적 문맥일 뿐 새 PX·AC 매핑 대상이 아니다(M2가 안 바꾼 M1 영역까지 범위에 끌려오지 않게). 승인 前 draft 반복·게이트 repair는 최종 승인본 하나로 수렴할 뿐 별도 버전을 남기지 않는다(`_drafts/` 시안은 R5-5 승격 후 삭제 — 최종 승인 화면 HTML만 커밋되고 이전 draft는 보존하지 않는다). **문법(정확 매칭)**: `^PX-M<N>-<screen>-\d{2,}$`(`<screen>`는 delimiter-anchored 정확 일치 — `user`가 `user-settings`를 오매칭하지 않음; 번호 2자리+). **불변식**: 한 화면 HTML 내 id 중복 금지 · id의 `M`/`<screen>`이 파일 경로 `M<N>/<screen>.html`와 일치 · 각 PX는 구현 feature 정확히 1곳 `## 7`에만. **소유(per-PX · 화면단위 합성 HTML)**: 최종 프로토타입은 feature별이 아니라 **여러 feature가 합성된 화면 단위 HTML**이다 — 각 PX를 *구현하는* feature 하나의 `## 7`에 기록(화면 통째로 대표 feature에 몰지 않음 — 비소유 feature의 plan-workitem이 자기 PX를 못 매핑하는 INST-1 사각 방지). 화면-공통(shell/layout) 결정은 shell 담당 feature 귀속 또는 DESIGN.md §4로 승격(PX 아님); cross-feature 정합은 owner가 아니라 `## 7-2` INV/seam(ADR-057#amend-2).
2. **PX 인벤토리 (계획 미러 — 재추출 금지)**: plan-milestone R5-5가 최종 승인 시 프로토타입 HTML의 PX 마커를 **그대로 복사**(재추출·재해석 금지 — drift 차단)해 각 구현 feature `## 7`의 `프로토타입:` 참조 아래 `경험 결정(PX):` 블록에 `- PX-M<N>-<screen>-NN: <한 줄>`로 기입한다. 한 화면이 여러 feature에 걸치면 PX별로 구현 feature에 분산 기록. (마일스톤 확정 후 프로토타입은 잠기므로 revision 원자 교체·재승인 재기입은 없다 — 변경은 다음 마일스톤의 새 M<N>.)
3. **PX ↔ AC 매핑 (마일스톤 단위 — 1회 완성)**: `/plan-workitem M<N>`이 **한 번의 실행으로 전 feature의** task·AC를 만들고 각 PX를 구현 AC로 매핑해 feature `## 7-3. 프로토타입 경험(PX) ↔ AC 매핑` subsection에 영속(형식 `PX-M<N>-<screen>-NN → T-NNN:AC-M`, FAC↔AC `## 7-1`과 동형; ADR-036 12-section에 main section 신설 X — subsection). task `## 6` AC는 `(PX-M<N>-<screen>-NN)` 태그 가능. **사용자-facing 계약 = `/plan-workitem M<N>` 하나**(feature 단위 `F-NNN` 호출·`--refresh` 모두 없음 — 내부 feature별 순차 authoring은 허용하되 M<N> 1회 실행으로 전 task·AC·PX↔AC 완성). 프로토타입이 마일스톤 확정 시점에 잠겨 있으므로 계획 후 재동기(refresh)가 필요 없다 — 프로토타입·기획을 바꾸려면 다음 마일스톤에서 새 M<N>로 처리(구현 중 근본 충돌이 드러나면 자동 재계획 없이 사용자에게 중단·보고).
4. **coverage 대조**: 어떤 AC도 참조하지 않는 PX(unmapped PX)를 골라낸다 — plan-workitem self-check가 "남은 미결정 사항"에 surface, `[Plan-FAC-coverage]`(reviewer·validate-plan 미러) 차원이 unmapped FAC와 **동일하게 unmapped PX도 P0**로 잡는다(새 차원 신설 X — 기존 coverage 차원 확장). *별도 parser는 없다 — unmapped 판정은 매핑 표 기준의 coverage 점검을 reviewer/self-check(LLM)가 수행*(마커 복사(R5-5)만 verbatim으로 기계적). 이러면 §3-V는 "정말 놓친 것"만 잡는 최후 보루로 정상화.
5. **base 결정 정정 (refresh·재승인·`--prototype`·부분-보류 폐기 — ADR-057#amend-3 정합)**: 본 라운드가 이들을 폐기하므로 ADR-056 base 결정도 다음으로 **정정(supersede)**한다 — **base 결정 1**의 "재승인 시 같은 파일 대체"는 *plan-milestone R5 반복 내 덮어쓰기*로만 한정(확정=`ready` 후 재승인 없음, 변경은 다음 M<N>); **base 결정 2**의 R5 `--prototype [F-NNN]` 재진입 모드는 **제거**(같은 `/plan-milestone M<N>` 재실행이 미완 R5를 이어감 — §4.11); **base 결정 3**의 배치 단서 "하나라도 미충족이면 그 feature만 보류하고 나머지 진행"은 **"한 feature라도 계약 미비면 task를 쓰기 전에 일괄 중단"**으로 정정(부분 계획 금지 — §4.12 입구 preflight). ADR-056 `## 현재 유효 결정`이 있으면 이 정정을 반영.
   ADR-056 base `## Mutation Contract`의 Target도 `plan-milestone(R5+--prototype)`을 **`plan-milestone(R5, 같은 draft M<N> 재실행으로 미완 라운드 재개)`**로 고친다. Mutation Contract가 폐기된 사용자 진입을 다시 canonical surface처럼 보이게 두지 않는다.

### 적용 surface
- .claude/skills/plan-milestone/SKILL.md (R5-5 PX 인벤토리)
- .claude/skills/plan-workitem/SKILL.md (3-P PX↔AC + self-check)
- .claude/skills/validate-plan/SKILL.md ([Plan-FAC-coverage] 확장)
- .claude/agents/reviewer.md ([Plan-FAC-coverage] 미러)
- .claude/agents/designer.md (PX 마커)
- docs/30-workitems/_templates/FEATURE_TEMPLATE.md (## 7 PX 인벤토리 + ## 7-3)
- docs/30-workitems/_templates/TASK_TEMPLATE.md (## 6 (PX-M<N>-<screen>-NN) 태그)

### 강도 (ADR-022)
- enabling(약) — coverage surface + self-check. 자동 차단은 [Plan-FAC-coverage] 기존 강도(P0 권장, 차단 아님)를 따른다.
- **D6 override (ADR-045)**: 본 amend는 surface 5+ 추가(7 surface)라 D6상 통합 재발행 대상이나, 이번 라운드는 minimal-churn으로 amend 처리한다 — 근거: 이번 개선 라운드 결정, 다음 변경 시 ADR-056 통합 재발행. (ADR-056은 grandfather 아님 — 2026-07-16 생성.)
- **Mutation delta (ADR-047 D3)**: failure=PX가 어떤 AC에도 안 매핑돼 dead field · PX가 실제 구현 feature와 다른 feature에 귀속(오배정) / falsifier=unmapped PX·오배정을 `[Plan-FAC-coverage]`(구조+의미, plan 단계)가 못 잡음 / rollback=PX 인벤토리·매핑·`(PX-…)` 태그 제거.
```

**변경 (designer.md — PX 마커, ADR-056#amend-1 surface)**: `.claude/agents/designer.md`의 R5 프로토타입 authoring 불릿 끝에 **각 경험 결정에 `<!-- PX-M<N>-<screen>-NN: <한 줄 결정> -->` 마커를 의무로 단다**(이 마커가 PX 단일 source, R5-5가 그대로 복사; 재추출 drift 방지)를 추가한다. — *AGENTS.md 상위-우선 정합: designer(하위)의 PX 참조를 ADR-056 amend-1(상위)과 **같은 Phase(4)·적용 단위**로 묶어 Phase 3 forward-ref를 없앤다(§3.12 designer 편집은 PX를 전혀 참조하지 않는다 — R5 PX 마커 의무는 본 §4.1가 유일 소유).*

## 4.2 ADR-056 Amendment 2 — raw-hex 토큰 정의 예외 (INST-2)

**변경**: 파일 맨 끝(Amendment 1 뒤)에 추가한다:

```
<a id="adr-056-amend-2"></a>
## Amendment 2 (2026-07-21) — raw hex 스캔의 토큰 정의 예외

### 배경
- [관측됨] SIMULATION_RUN Round 4 — stabilize §5-2 raw-hex grep이 fork의 DTCG 토큰 *정의* CSS(`src/index.css`의 `:root`)를 위반으로 오탐(false positive). 정의(당연히 hex가 있어야 함)와 사용처를 구분하지 못했다. 현행 제외는 DESIGN.md 자체 + `docs/20-system/prototypes/`뿐.

### 결정
1. §5-2 raw-hex grep 결과에서 **CSS custom property *정의* 라인**(`--<name>: #hex` 형태)은 제외한다(토큰 정의는 정상 — dogfood의 `src/index.css :root` 오탐 케이스가 이걸로 해소). 검사 대상은 정의 밖 *사용처*(`color:#hex` / `background:#hex` 등)의 raw hex.
2. **파일명 기반 전체 제외는 하지 않는다** — 파일명(`theme`/`tokens` 등)으로 파일 전체를 빼면 그 파일 안의 *사용처* 위반도 함께 숨는다(false negative). 정의/사용처 구분은 오직 (1)의 *라인 형태*로 판정(정밀). 프로젝트가 순수 정의 파일 경로를 밝히고 싶으면 DESIGN.md §2에 적되, 검사 기준은 여전히 (1) 라인.
3. **전면 제외 금지**: 모든 `:root` 블록을 무조건 빼면 진짜 위반이 숨으므로, 오직 (1)의 *정의 라인*만 예외 — `:root` 안이라도 사용처 hex는 검사.

### 적용 surface
- .claude/skills/stabilize-milestone/SKILL.md (§5-2)

### 강도 (ADR-022)
- enabling(약) — 오탐 제거(검사는 report-only라 코드 차단 아님).
- **Mutation delta (ADR-047 D3)**: failure=토큰 *정의*를 위반으로 오탐하거나 `:root` 내 *사용처* hex를 놓침 / falsifier=`--x: #hex` 정의 라인이 다시 flag되거나 정의 밖 hex가 통과 / rollback=정의-라인 예외 제거(전면 grep 복귀).
```

## 4.3 ADR-056 Amendment 3 — 화면 전환 표 (DS-4)

**변경**: 파일 맨 끝(Amendment 2 뒤)에 추가한다:

```
<a id="adr-056-amend-3"></a>
## Amendment 3 (2026-07-21) — 화면 사이 흐름: 전환 표 + downstream 소비자 (다화면·복구 흐름 한정)

### 배경
- [관측됨] 화면 *안*(색·글꼴·컴포넌트)은 다중 감사받지만 화면 *사이* 흐름은 약하다. FEATURE §8-1(primary task·empty/loading/error 복구·a11y·HEART)은 이미 있으나 **downstream 소비자가 없어 dead field**이고, cross-screen 전환(A→행동→B, 실패/복구)을 담는 자리가 없다. *가설 — static prototype 실험이 화면 전환을 직접 검증하지 못함(다화면·복구 흐름에 한정 채택).*

### 결정
1. **plan-milestone R5-1 전환 표**: 마일스톤 문서에 `## 9. 화면 전환 (UI)` 표를 도출한다 — `path type(primary/failure/recovery) | 현재 화면/상태 | 사용자 행동 | 다음 화면/상태 | owner feature | prototype`(**각 행이 하나의 path type** — primary happy-path, failure 전이, recovery 복귀; downstream이 문장 해석 없이 행 단위로 소비). **트리거는 *화면 수*가 아니라 *비가역 동작·분기·복구 상태의 존재*다**: (i) 화면 2개 이상(다화면 전환), 또는 (ii) **단일 화면이라도** 비가역/파괴적 동작(삭제·결제·전송)·분기·다단계 오류→복구(submit→error→retry)·modal·확인 dialog가 있으면 그 상태·복구 경로를 `## 9`에 적는다. 둘 다 아니면(순수 정적 단일 화면·비-UI) "(해당 없음)".
2. **downstream 소비자 배선** (안 그러면 §8-1처럼 또 dead field): plan-workitem이 분해하는 feature가 전환 표의 owner인 행을 회수해 그 **존재하는 각 path type 행(primary/failure/recovery)**이 task AC로 커버되게 하고(FEATURE §8-1의 복구 흐름과 정합; 모든 흐름에 failure·recovery를 억지로 만들 필요는 없다 — *표에 존재하는* 행만), validate-plan `[Plan-design]`이 **owner의 존재하는 각 path type 행이 프로토타입·AC에 존재**하는지 점검한다.
3. ADR-042 결정 3("흐름 점검은 기존 시나리오·상태 self-check가 담당, plan-workitem에 별도 UX self-check 안 둠")과의 관계: 본 결정은 별도 UX self-check 신설이 아니라 *기존 [Plan-design] 차원 확장 + §8-1 소비 배선*이다(ADR-042 정신 유지).

### 적용 surface
- .claude/skills/plan-milestone/SKILL.md (R5-1)
- .claude/skills/plan-workitem/SKILL.md (owner 행 회수)
- .claude/skills/validate-plan/SKILL.md ([Plan-design] recovery path)
- docs/30-workitems/_templates/MILESTONE_TEMPLATE.md (## 9 화면 전환)

### 강도 (ADR-022)
- enabling(약) — 다화면·복구 흐름 한정 조건부. *가설*이라 design-eval 재검토 트리거류 실측 전 정책 확정 아님.
- **Mutation delta (ADR-047 D3)**: failure=화면 사이 흐름이 §8-1처럼 dead field / falsifier=owner 행을 plan-workitem이 회수 안 하거나 recovery path가 AC에서 누락 / rollback=`## 9` 표·downstream 소비 배선 제거.
```

## 4.4 ADR-057 Amendment 1 — 마일스톤 로드맵 SSOT (RD-1)

**기존**: `docs/90-decisions/boilerplate/ADR-057-planning-v2-batch-and-seam.md`는 amendment 0개, `## Status`(accepted) 다음이 바로 `## 배경`이라 **`## 현재 유효 결정` 요약 섹션이 없다**.

**변경 (a) — `## 현재 유효 결정` 신설 (필수)**: amend-2(§4.5)가 base 결정 9의 seam canonical *위치 규칙을 정정*하므로 ADR-045 D5상 요약 섹션이 필수다(정정성 amend). `## Status`(accepted) 바로 아래에 삽입:

```
## 현재 유효 결정
- M1 포함 모든 마일스톤·feature 문서는 `/plan-milestone`이 최종 프로토타입·FAC·열린 질문을 재대조한 뒤 `ready`로 확정(bootstrap-project는 charter/ARCH까지). task 분해는 `/plan-workitem M<N>` 1회 **전체 계획 스냅샷**(2-tier/draft/refresh·F 입력 폐기 — #amend-3), 코드-stale 방지는 task 실행-시점 경량 접지 확인(근본 충돌은 사용자 보고).
- 상태·잠금(#amend-3): M/F=`draft→ready`; task=`draft→ready→in-progress→done`, 검증된 완료 결함만 repair-workitem이 `done→in-progress`. M/F `ready` 뒤 새 scope·프로토타입·기획 변경은 다음 M. task 계획 repair는 첫 구현 전에만, 구현 뒤 finding은 기존 task 약속 결함=repair / 담당 없음·새 범위=사용자 보고+다음 M(현재 M task 자동 추가 없음).
- cross-task seam 계약: 신호 4종 감지 시 feature `## 7-2`에 INV 표. cross-feature canonical 위치 = **① 데이터 소유(write-through) → ② 최초 사용 → ③ 낮은 번호(fallback)**(#amend-2가 결정 9의 "낮은 번호 우선"을 이 우선순위로 정정 — 낮은 번호는 최종 fallback으로 잔존).
- **마일스톤 로드맵 SSOT**: `docs/30-workitems/ROADMAP.md`(Done/Now/Next/Later 4구간 + 얇음 규율) — plan-milestone 단독 작성(R3=Now 실체화, R0=graduation 재조정), stabilize는 회고 graduation만 영속(#amend-1).
- 상세는 아래 `## 결정 — A/B` + Amendment 1·2·3.
```

**변경 (b) — Amendment 1**: 파일 맨 끝에 추가한다:

```
<a id="adr-057-amend-1"></a>
## Amendment 1 (2026-07-21) — 마일스톤 로드맵 SSOT (얇은 forward 지도)

### 배경
- [관측됨] 마일스톤 forward 지도가 없다 — "끝난 것/지금/앞으로"를 한 장에서 못 본다. plan-milestone은 직전 1개만 회고하고, 계획 중 "이 목표는 마일스톤 3개로 쪼개야 한다"는 판단이 `/clear`로 증발해 다음에 처음부터 재계산한다.

### 결정
1. **docs/30-workitems/ROADMAP.md 신설** — 1행=1마일스톤, **Done / Now / Next / Later 4구간(rolling-wave)**, 구간별 맞춤 컬럼(Done: id·`candidate-key`·목표·졸업·주요 기능 / Now: id·`candidate-key`·목표·진척·주요 기능·의존 / Next·Later: `candidate-key` + 목표 1줄 + 확신도 목록). **`candidate-key`는 전 구간 공통 안정 식별자** — Later→Next→Now→Done 승격 내내 *같은 key*를 유지하고 Now/Done에서 id(M-number)를 추가로 발급한다(정체성이 goal-text 매칭에 의존하지 않게; Now/Done도 key를 보존해야 전 구간 추적이 닫힌다). baseline **빈 shell**로 커밋(presence: baseline), plan-milestone이 채운다. **템플릿 파일 없음**(단일 인스턴스 — 스키마는 본 amend + ROADMAP.md 헤더가 SSOT).
2. **단일 작성자 = plan-milestone**: R3는 *지금 착수하는* 마일스톤만 Now 행으로 쓴다(직전 행의 Done 전환은 R3가 강제하지 않는다 — 회고 `graduation:`=YES일 때만 Done이며 그 판정 반영은 R0 재조정이 담당). R2 분할이 식별한 후속 마일스톤은 Next/Later 얇은 행.
   **R0 전이 알고리즘(reconcile — candidate-key로 정체성 유지)**: (a) 직전 Now의 회고 `graduation:`=YES면 그 행을 **Done**으로(candidate-key·id 보존). (b) 착수할 Next 후보(candidate-key로 식별)를 **Now**로 승격하며 id(M-number) 발급 — *같은 candidate-key 유지*(중복 생성 방지·전 구간 추적). (c) 직전 Now가 미졸업(YES 아님)이면 단일-Now 규율상 새 Now 승격을 **보류**(명시적 병렬 승인이 있을 때만 병렬 Now 허용). (d) 마지막 마일스톤 종료(후속 Next 없음)면 Now→Done 후 Now를 비운다. (e) 기존 프로젝트에 로드맵을 처음 도입(backfill)하면 현존 마일스톤에 candidate-key를 부여해 Done/Now로 seed한다. **progress(`task done/total`)는 plan-workitem이 task를 만든 뒤 R0가 갱신하는 *계획-시점 스냅샷*** — 실시간 현황이 아니다(실시간은 task 문서가 SSOT). 그래서 R3 신규 행은 `tasks: unplanned`.
3. **얇음 규율(성패 관건)**: Next/Later 행은 *`candidate-key`(안정 슬러그) + 목표 1줄 + 확신도만* — 기능·AC·졸업 칸 자체를 만들지 않는다(아직 안 정한 걸 정한 척 = 소설, 오히려 해로움). candidate-key는 R0 재조정이 중복 생성·Now 승격을 매칭하는 유일 안정 식별자(목표 문구가 바뀌어도 고정). M 번호는 Done/Now(실체화)만 발급, Next/Later는 `(M3?)`처럼 잠정. 날짜·%·story point 기본 제외. Now 기본 1개(병렬 마일스톤은 명시 결정 시만).
4. **stabilize-milestone 읽기 전용 유지**: 로드맵 파일을 직접 건드리지 않는다. graduation 판정(`YES|NO|BLOCKED (날짜)`)만 마일스톤 `## 8. 회고`에 영속하고(ADR-014 회고 스키마 amend 동반), 다음 plan-milestone R0가 그것을 읽어 로드맵을 재조정한다.
5. **repair-plan은 로드맵을 건드리지 않는다**(단일 작성자 유지 — 다음 R0 재조정이 흡수). **validate-plan은 로드맵 drift 전용 차원을 신설하지 않는다**(요약 지도라 R0 재조정이 흡수 — 미러·카운트 비용 회피).
6. **로드맵=요약 / 각 Mx=상세 SSOT** — 링크만, 내용 복제 금지. 지킬 수 없으면 "존재하는 것만 표시(생성 전용)"로 후퇴.

### 적용 surface
- docs/30-workitems/ROADMAP.md
- .claude/skills/plan-milestone/SKILL.md
- .claude/skills/stabilize-milestone/SKILL.md
- docs/30-workitems/_templates/MILESTONE_TEMPLATE.md
- docs/00-meta/STRUCTURE.md
- docs/00-meta/WORKFLOW.md

### 강도 (ADR-022)
- enabling(약) — 얇음 규율이 전부. 작성자 1명·기존에 이미 읽는 정보라 부담 최소.
- **D6 override (ADR-045)**: 본 amend는 surface 6개 + R3 의미 변경(모든 마일스톤 실체화 → Now만)이라 D6상 통합 재발행 대상이나, 이번 라운드는 minimal-churn으로 amend 처리한다 — 근거: 이번 개선 라운드 결정, 다음 변경 시 ADR-057 통합 재발행. (ADR-057은 grandfather 아님 — 2026-07-16 생성.)
- **Mutation delta (ADR-047 D3)**: failure=로드맵 drift·중복 마일스톤 생성 / falsifier=candidate-key 미보존으로 같은 목표가 중복 마일스톤으로 재생성 / rollback=ROADMAP.md·R0/R3 배선 제거.
```

## 4.5 ADR-057 Amendment 2 — seam canonical 위치 (소유 우선, INST-3)

**변경**: 파일 맨 끝(Amendment 1 뒤)에 추가한다:

```
<a id="adr-057-amend-2"></a>
## Amendment 2 (2026-07-21) — cross-feature seam canonical 위치 규칙 (소유 우선)

### 배경
- [관측됨] SIMULATION_RUN Round 4 — 비대칭 seam(한 feature가 write-through 소유)에서 결정 9의 "낮은 번호 feature canonical" 규칙이 *관련 거의 없는* 낮은 번호 feature에 INV를 배치해 "왜 이 규칙이 여기 있지?" 가독성 역전을 낳았다.

### 결정
결정 9의 cross-feature invariant canonical 기재 위치 *규칙을 정정한다* — 소유·최초사용 우선순위를 앞에 추가하고 기존 "낮은 번호"는 최종 fallback으로 **강등**한다. **비대칭 seam에서 canonical 위치가 낮은번호→소유자로 바뀌므로 "충돌 없는 확장"이 아니라 정정**이다(그래서 D5 `## 현재 유효 결정` 요약 의무 트리거 — 본 ADR `## 현재 유효 결정`과 정합). ADR-057은 이미 §거버넌스의 intentional override 대상이라 이 정정도 minimal-churn amend로 처리한다(D6 재발행 대신 amend — 근거: 이번 라운드 결정, 다음 변경 시 통합 재발행). 정정된 규칙: **① 그 데이터를 실제 소유(write-through)하는 feature → ② 애매하면 최초 사용 feature → ③ 그래도 불명확하면 낮은 번호 feature(기존 결정 9의 규칙 — 결정적 fallback)**. 상대 feature `## 7-2`엔 참조 링크 1줄만(SSOT 중복 금지 — 불변). 소유가 명확할 때만 ①, 불명확하면 ③으로 결정적 판정(도구가 위치를 찾을 수 있게 기계적 판정 가능성 유지).

### 적용 surface
- .claude/skills/plan-workitem/SKILL.md

### 강도 (ADR-022)
- enabling(약) — 가독성 개선, 기능 불변.
- **Mutation delta (ADR-047 D3)**: failure=cross-feature seam이 양쪽 feature에 중복 canonical(SSOT 소실) / falsifier=소유 우선 위반해 seam이 2곳에 기재 / rollback=소유 우선 규칙 제거(base 결정 9 낮은-번호 우선 복귀).
```

## 4.5b ADR-057 Amendment 3 — plan-workitem 전체 계획 스냅샷 · 2-tier/draft/refresh 전면 폐기 (INST-1 후속)

**변경**: 파일 맨 끝(Amendment 2 뒤)에 추가한다:

```
<a id="adr-057-amend-3"></a>
## Amendment 3 (2026-07-24) — plan-workitem 전체 계획 스냅샷 (2-tier/draft/refresh 전면 폐기 · 마일스톤 단위 계획 잠금)

### 배경
- [관측됨] 사용자 운영 요구 = 최종 합성 화면 + **마일스톤 단위 전체 계획**. 결정 2/3/4의 2-tier(첫 feature만 `## 3` full, 나머지 `## 3 상태: draft` + `F-NNN --refresh` 요구 + implement 진입 draft 하드스탑)는 (a) 사용자에게 feature 단위 재호출을 강제하고, (b) "나머지 feature `## 3`를 미리 draft로 써 두고 구현 직전 refresh"라는 *지연-계획*이라 — 이미 쓴 draft가 앞 feature 구현으로 stale해지는 위험을 그대로 안는다. 완전 스냅샷도 JIT도 아닌 어정쩡한 중간이다.

### 결정
결정 2/3/4의 2-tier/draft/`F-NNN --refresh` 메커니즘 + 결정 5의 feature-완료 refresh 체크포인트 + 결정 7의 단일 feature 조망 echo를 **supersede**하고, **재계획(refresh) 기능 자체를 두지 않는다**(결정 6 `--feature F-NNN` stabilize 스코프는 계획이 아니라 검사 범위라 유지).
1. **전체 계획 스냅샷 (계획 후 잠금)**: `/plan-workitem M<N>` **1회 실행으로 전 feature의 task·`## 3`·AC·FAC↔AC·PX↔AC를 완성**한다(계획 시점 전체 스냅샷). `## 3 상태: draft` tier·feature별 `F-NNN` 직접 입력·`F-NNN --refresh`·`M<N> --refresh`를 **모두 폐기**한다. 사용자-facing 진입은 **`/plan-workitem M<N>` 하나뿐**(내부 feature별 순차 authoring은 허용 — 사용자 재호출 강제 없음). 이후 lifecycle: 의존성 순서대로 implement → validate → (실패 시만) repair → validate → finalize, 마지막에 `/stabilize-milestone M<N>`.
2. **후행 task는 선행 task의 계획된 완료 결과를 전제로 작성**: 전 task를 한 번에 상세히 만들므로, 후행 task의 `## 3`·AC는 *선행 task가 무엇을 보장할지*(계획에 이미 적힌 완료 결과·AC·인터페이스)를 전제로 작성한다(예: `T-002`가 `T-001`이 만들 인증 인터페이스를 사용, `T-003`이 `T-002`가 만들 세션을 전제). 이래야 refresh 없이 후행 계획이 성립한다.
3. **코드-stale 근거 → 실행-시점 경량 접지 확인 (재계획 아님)**: base 결정 3의 목적(계획이 구현 시점 실제 코드와 어긋나지 않게)은 폐기하지 않되, draft 지연-계획이 아니라 **task 실행 직전 implement-workitem의 경량 접지 확인**으로 옮긴다. 일반 오류(테스트 실패·타입 오류·구현 누락·프로토타입 불일치·작은 내부 구현 차이)는 **repair**(또는 AC·범위 안 처리)로 다룬다. 정말로 기존 M<N> 계획대로 구현할 수 없는 *근본* 충돌이 드러나면 에이전트가 임의로 계획을 바꾸지 않고 **사용자에게 중단·보고**한다(자동 refresh 없음 — 예외적 사용자 결정). base 결정 4 + `ADR-026#amend-3`의 `## 3 상태: draft` 하드스탑도 이 접지 확인으로 대체 — ADR-026는 별도 정정 amendment(**amend-4**, §4.5c)로 supersede.
4. **프로토타입·기획 변경은 다음 마일스톤**: 마일스톤 확정 후 새 기능·프로토타입 변경·기획 변경은 M<N> 계획을 다시 고치는 게 아니라 **M<N+1>에 넣는다**(마일스톤 경계가 곧 계획 잠금 경계 — 화면 revision·retire·재승인 재동기 불요). 프로토타입 반복은 `/plan-milestone M<N>` 내부(R5-3 사용자 피드백 루프)에서 최종 승인까지 끝낸다. 선택적 `validate-plan`→`repair-plan`은 첫 구현 전에 **plan-workitem 산출물(task·매핑·의존성)의 결함만** 고칠 수 있다(M/F scope·FAC·프로토타입·PX 변경 아님). 구현이 시작되면 이 수정도 잠그고, 이후 변경은 사용자 중단·보고 또는 다음 마일스톤으로 보낸다.
5. **잠금 상태기계 (`draft → ready → in-progress → done` — 정상 경로 우선, cross-session 강제)**: 문서 `## 0. Status`로 정상 lifecycle만 강제한다. (a) `/plan-milestone M<N>`은 `draft` M에서 동작하고, 확정 재대조 통과 시 **먼저 산하 feature를 `ready`로, 마지막에 M을 `ready`로** 전환한다(승격 중 중단 대비 — M `ready`면 전부 `ready` 보장). M·feature는 **`draft → ready`만** 쓴다. 새 feature·상위 scope·FAC·프로토타입·PX 변경은 `ready` 이후 자동 재개방하지 않고 다음 마일스톤이 기본이며, 현재 M으로 진행 자체가 불가능한 P0면 임의 역전이 없이 사용자에게 중단·보고한다. (b) `/plan-workitem M<N>`은 M과 산하 feature가 모두 `ready`일 때만 동작한다. 최초에는 전 task를 `draft`로 만들고, 전 M 계획 + `[Plan-dep]` + self-check 성공 후 모든 task를 `ready`로 승격한다. 파일 순차 쓰기 중 끊겨 `ready`/`draft`가 섞였고 **모든 task 상태가 여전히 `draft|ready`**이면 같은 `/plan-workitem M<N>` 재실행이 전체를 재검증하고 남은 `draft`만 승격한다. **`ready → draft` 자동 역전이는 두지 않는다**: `ready` 문서가 불완전하거나 plan review가 task·매핑 결함을 찾으면 첫 구현 전에 `/repair-plan`이 문서를 직접 고치고 전체 self-check를 다시 통과시킨다. 상위 M/F/prototype P0는 자동 복구하지 않고 사용자 결정으로 넘긴다. (c) `/implement-workitem`은 **① 같은 M에 `draft` task 없음, ② 대상 task가 `ready`(신규) 또는 `in-progress`(재개), ③ 선행 task가 모두 `done`이고 약속한 산출도 존재, ④ 부모 M·feature가 모두 `ready`**인지 확인한다. 상태·접지 preflight를 모두 통과한 뒤 dispatch 직전에만 `ready → in-progress`를 기록한다. preflight가 순서 대기·선행 repair·사용자 보고로 끝나면 신규 대상은 `ready`를 유지한다. (d) task 하나라도 상태가 `draft|ready` 밖(`in-progress`·`blocked`·`done`·`deprecated`)이면 구현이 시작됐거나 종료된 것으로 보아 `/plan-workitem`·`repair-plan`이 계획을 변경하지 않는다. 전 task가 `ready`+완결이면 `/plan-workitem` 재실행은 read-only no-op다. `blocked`·`deprecated`는 기존 WORKFLOW의 예외 상태지만 본 amend가 새 writer/복구 전이를 만들지 않으며, 발견 시 사용자에게 보고한다. (e) task의 유일한 **본 amend 추가 역전이**는 검증된 완료 결함에 대한 `done → in-progress`다. 실제 task writer인 `/repair-workitem`만 4-판정에서 Adopt/Adopt-modified가 하나 이상일 때 첫 수정 직전에 재개방한다. `/repair-milestone`은 status를 쓰지 않고 task 결함을 `/repair-workitem`에 위임한다. 전부 기각이면 `done` 유지, 재개방 뒤 중단·실패면 `in-progress` 유지, fresh validate 통과 뒤 `/finalize-workitem`이 다시 `done`으로 커밋한다. (f) 열린 질문은 milestone `## 7`·feature `## 12`에 미해결 항목만 영속하고, 하나라도 있으면 M/F 또는 task의 `ready` 승격을 막는다. 해결 시 행을 제거하며, 이력은 메모·결정 이력에 남긴다.
6. **잠금 뒤 finding 라우팅 (현재 M task 자동 추가 금지)**: 구현 시작 뒤 발견사항은 종류로만 나눈다. (a) 현재 M의 기존 task·AC가 이미 약속한 동작의 결함이면 그 task의 `/repair-workitem`으로 고치고, 여러 task에 걸치면 `/repair-milestone`이 조정한다. (b) 담당 task가 없거나 새 기능·새 정책·큰 구조 변경이면 현재 M에 task를 끼워 넣지 않고 사용자에게 사실·영향을 보고해 **다음 `/plan-milestone M<N+1>` 후보**로 보낸다. (c) 어느 쪽인지 불명확하거나 현재 M 진행을 막는 상위 P0면 자동 선택하지 않고 사용자를 기다린다. `review-doc`·validator·stabilize·bootstrap/stack 안내도 이 분기를 사용하며, generic `/plan-workitem <id>`·"다음 plan-workitem이 후속 task 생성" 문구를 두지 않는다.
D5상 `## 현재 유효 결정`의 plan-workitem 진입 줄도 이 M 단위 전체 스냅샷(refresh 없음)으로 갱신.

**잠금 경계 명시**: M/F의 `ready`는 plan-milestone 소유 필드(scope·시나리오·FAC·프로토타입·PX)를 잠근다는 뜻이다. plan-workitem이 나중에 채우도록 예약된 feature `## 7-1`/`## 7-3` 매핑 shell·새 task 문서와, task 승격을 막는 **미해결 질문을 M `## 7`/feature `## 12`에 기록·해결 후 제거하는 것**은 잠금 위반이 아닌 coordination write다. 첫 구현 전 repair-plan은 task·매핑·의존성 결함만 고칠 수 있다. 이 경계를 넘어 M/F/prototype을 바꾸는 것은 자동 repair 대상이 아니다.
**열린 질문 게이트의 시점**: plan-milestone 중 발견된 미해결 질문은 M/F `ready`를 막는다. M/F가 `ready`가 된 뒤 plan-workitem이 새로 발견한 질문은 M/F를 `draft`로 되돌리지 않고 **task `ready` 승격만** 막는다. 질문은 같은 M/F 열린 질문 섹션에 영속하고, 해결·행 제거 후 같은 `/plan-workitem M<N>` 재실행이 task 승격을 완료한다.

### 적용 surface
- .claude/skills/plan-workitem/SKILL.md (argument-hint·배치·`--refresh`/`F-NNN` 제거·`## 3` 상태 요약 출력·마지막 출력)
- .claude/skills/plan-milestone/SKILL.md (`--retire-screen`·재승인 refresh 안내 제거 — 프로토타입 변경은 다음 마일스톤)
- .claude/skills/implement-workitem/SKILL.md (3-R `draft` 하드스탑 → 경량 접지 확인, 근본 충돌 시 사용자 보고)
- docs/30-workitems/_templates/TASK_TEMPLATE.md (`## 3` draft 마커 언어 제거)
- .claude/skills/finalize-workitem/SKILL.md (다음-단계 refresh/F-NNN 제거 — §4.12c; `in-progress → done` 입구 게이트 — §4.12d g)
- .claude/skills/stabilize-milestone/SKILL.md ([Spec-gap] F-NNN 재계획 경로 정리 — §4.12c)
- docs/00-meta/WORKFLOW.md (계획 진입 줄 2-tier/refresh 제거 — §4.12c)
- docs/00-meta/DELEGATION_STRATEGY.md (7.5 feature refresh 제거 — §4.12c)
- docs/00-meta/PROJECT_START_CHECKLIST.md (F-NNN 단일 제거 — §4.12c)
- docs/00-meta/STRUCTURE.md (프로토타입 producer의 `--prototype` 재진입 표기 제거 — §4.12c)
- docs/90-decisions/boilerplate/ADR-007-workitem-lifecycle.md (lifecycle 표 정정 — §4.12c f)
- docs/90-decisions/boilerplate/ADR-051-main-session-orchestration-and-wave-removal.md (amend-3 단일 feature 문구 정정 — §4.12c j)
- .claude/skills/repair-milestone/SKILL.md (다음 액션 `M<N>` 전체 + per-task 결함은 status를 직접 쓰지 않고 repair-workitem 위임 — §4.12c h·§4.12d h)
- .claude/skills/repair-plan/SKILL.md (첫 구현 전 ready 문서 제자리 수정·self-check, 미완 시 review 파일 보존, 구현 시작 후 변경 거부 — 결정 5d, §4.12d)
- .claude/skills/repair-workitem/SKILL.md (검증된 결함 시 `done → in-progress` 재개방 — §4.12d h)
- docs/30-workitems/_templates/MILESTONE_TEMPLATE.md·FEATURE_TEMPLATE.md (`## 0. Status` `draft → ready` 단방향 — 결정 5, §4.12d)
- .claude/agents/reviewer.md·.claude/skills/validate-plan/SKILL.md (`[Plan-dep]` 차원 — §4.12d f)
- .claude/agents/validator.md·.claude/skills/validate-workitem/SKILL.md (unmapped FAC 자동 task 추가 권장 제거·사용자 결정 — ADR-037#amend-3, §4.5d)
- .claude/skills/review-doc/SKILL.md (문서 finding의 현재-M 후속 task 자동 생성 제거 — 결정 6, §4.12c n)
- .claude/skills/bootstrap-design/SKILL.md·bootstrap-stack/SKILL.md·stack-guard/SKILL.md·repair-discovery/SKILL.md (다음 단계의 generic plan-workitem 안내를 M 단위·잠금 경계에 맞춤 — 결정 6, §4.12c n)
- docs/90-decisions/boilerplate/ADR-037-spec-coverage-audit.md (Amendment 3 — §4.5d)
- (별도 amendment) docs/90-decisions/boilerplate/ADR-026-plan-workitem-schema.md — `## 3` SSOT는 ADR-026#amend-4(§4.5c)가 정정

### 강도 (ADR-022)
- enabling(약)이나 base 메커니즘 supersede라 실질 변경. 자동 차단은 늘리지 않는다(preflight는 안내·중단이지 자동 재계획 아님).
- **D6 override (ADR-045)**: 본 amend는 surface 15+개(2-tier/draft/refresh 폐기 + `draft→ready→in-progress→done` 잠금 상태기계·`[Plan-dep]`가 plan-milestone·plan-workitem·implement·finalize·stabilize·repair-milestone·repair-plan·repair-workitem·validate-plan·validate-workitem·validator·reviewer·WORKFLOW·DELEGATION·CHECKLIST·MILESTONE/FEATURE/TASK_TEMPLATE·ADR-007·ADR-037·ADR-051 전반; `## 3` SSOT는 ADR-026#amend-4, unmapped FAC 실행 후 라우팅은 ADR-037#amend-3)라 D6상 통합 재발행 대상이나, 이번 라운드는 minimal-churn으로 amend 처리한다 — 근거: 이번 개선 라운드 결정, 다음 변경 시 ADR-057 통합 재발행. (ADR-057은 grandfather 아님 — 2026-07-16 생성.)
- **Mutation delta (ADR-047 D3)**: failure=사용자가 여전히 `F-NNN`/`--refresh` 재호출 강제 · `## 3 상태: draft` task가 stale인 채 구현됨 · preflight 전 task를 `in-progress`로 기록 · `blocked`/`done` task가 있는데 계획 수정 허용 · repair-milestone이 task status를 직접 변경 · 구현 뒤 finding을 generic plan-workitem이 현재 M 새 task로 생성 · 에이전트가 근본 충돌을 사용자 보고 없이 임의 재계획 / falsifier=runtime surface에 `draft`/`F-NNN`/`--refresh`/`Needs Plan Refresh`/generic 후속 plan-workitem 잔존, 정상 경로에 `ready→draft` 자동 역전이 존재, 또는 plan-workitem/repair-plan 잠금이 `draft|ready` 밖 상태를 놓침 / rollback=2-tier/draft/refresh·draft 하드스탑 복원.
```

## 4.5c ADR-026 Amendment 4 — `## 3` 전체 계획 스냅샷 (draft/refresh 예외 폐기)

**기존**: `docs/90-decisions/boilerplate/ADR-026-plan-workitem-schema.md`는 amend-3(2026-07-16)에서 "배치 분해의 `## 3` draft 예외 + refresh 계약"을 codify했고 `## 현재 유효 결정`이 없다 — ADR-057#amend-3가 그 전제(per-feature 지연 계획)를 폐기했으므로 `## 3` 규칙의 SSOT인 ADR-026에도 **정정 amendment가 필요**(참조-supersede만으로는 ADR-026 본문이 stale). 이번 amend-4는 amend 누적 4개 + 이전 결정 정정이라 ADR-045 D5 요약도 필수다.

**변경 (a) — `## 현재 유효 결정` 신설**: `## Status` 값 뒤에 추가한다.

```
## 현재 유효 결정
- task 문서 스키마·필수 섹션은 base를 유지하고, `/plan-workitem M<N>`이 전 feature의 task를 한 번에 만든다.
- 모든 task `## 3`는 계획 시점에 단계별 구현 가이드로 완성한다. draft 마커·feature별 refresh 예외는 폐기(#amend-2·#amend-4가 #amend-3을 supersede).
- 후행 task는 선행 task의 계획된 완료 결과를 전제로 하며 `## 9`에서 `T-NNN:AC-M`으로 참조한다. 누락·순환·참조 AC의 보장 부재는 계획 성공·task ready 승격을 막는다(#amend-4).
- planner self-check·architect 신호·task sizing 규칙은 #amend-1을 유지한다.
```

**변경 (b)**: 파일 맨 끝(Amendment 3 뒤)에 추가한다:

```
<a id="adr-026-amend-4"></a>
## Amendment 4 (2026-07-24) — `## 3` 전체 계획 스냅샷 (draft/refresh 예외 폐기)

### 배경
- [관측됨] ADR-057#amend-3가 2-tier/draft/refresh를 폐기하고 `/plan-workitem M<N>` 1회 전체 계획 스냅샷으로 전환. amend-3(배치 draft 예외 + refresh 계약)의 전제(per-feature 지연 계획)가 사라졌다.

### 결정
amend-3의 "`## 3` draft 예외 + refresh 계약"을 **supersede**한다.
1. `/plan-workitem M<N>`은 전 feature의 `## 3`를 **계획 시점에 완성**한다 — `## 3 상태: draft` 마커·구현-직전 refresh 재작성 없음. amend-2의 "현재 상태 근거" 원칙은 유지하되 *보장 시점 = 계획 스냅샷 1회*(지연 아님).
2. 전 task를 한 번에 만들므로 **후행 task의 `## 3`·AC는 선행 task의 *계획된* 완료 결과(인터페이스·산출·AC)를 전제로 작성**한다. `## 9. 의존성`은 선행을 `T-NNN:AC-M` 단위로 참조하고, **누락 참조·순환·AC-보장 미비는 모두 plan-workitem 성공 종료와 task `ready` 승격을 막는다**(실행 가능한 순서·보장이 없는 계획 — validate/reviewer `[Plan-dep]` P0).
3. 코드-stale 방지는 draft/refresh가 아니라 **task 실행 직전 implement-workitem 경량 접지 확인**(선행 done + 약속 산출 존재)으로 옮긴다. 근본 충돌은 자동 재계획 없이 사용자 보고(ADR-057#amend-3).

### 적용 surface
- docs/30-workitems/_templates/TASK_TEMPLATE.md (`## 3` draft 마커 제거 + **`## 9` `T-NNN:AC-M` 의존성 형식** — canonical)
- .claude/skills/plan-workitem/SKILL.md (`## 3`·`## 9` 전체 스냅샷)
- .claude/skills/implement-workitem/SKILL.md (3-R 접지 확인 — canonical)

### 강도 (ADR-022)
- enabling(약) — amend-3 supersede. 자동 차단 늘리지 않음.
- **Mutation delta (ADR-047 D3)**: failure=`## 3`가 여전히 draft/refresh 전제 · 후행 task가 선행 결과를 전제 안 함 / falsifier=`## 3 상태: draft` 마커 생성·refresh 재작성 잔존 / rollback=amend-3 draft/refresh 예외 복원.
```

## 4.5d ADR-037 Amendment 3 — unmapped FAC의 계획-시점 차단 + 구현-후 사용자 결정

**기존**: ADR-037 결정 1은 validator가 unmapped FAC를 찾으면 "미커버 task 추가 권장"하고 자동 차단하지 않도록 하고 `## 현재 유효 결정`이 없다. 이는 task를 계획 후에도 추가하던 종전 lifecycle에는 맞지만, ADR-057#amend-3의 **M 단위 전체 계획 스냅샷 + 첫 구현 후 계획 잠금**과 충돌한다. 실제 surface도 validator·validate-workitem·FEATURE_TEMPLATE·stabilize 네 곳에서 옛 권장을 반복한다. amend-3이 base의 강도를 뒤집으므로 ADR-045 D5 요약이 필수다.

**변경 (a) — `## 현재 유효 결정` 신설**: `docs/90-decisions/boilerplate/ADR-037-spec-coverage-audit.md`의 `## Status` 값 뒤에 추가한다.

```
## 현재 유효 결정
- feature `## 7` FAC와 `## 7-1` FAC↔AC 매핑이 coverage SSOT다(#amend-1); 대화 출력은 요약만 둔다(#amend-2).
- `/plan-workitem M<N>`은 FAC↔AC 100%와 unmapped 0건을 task ready 승격 조건으로 삼는다. 첫 구현 전 validate/reviewer는 누락을 P0로 보고하고 repair-plan이 task·AC·매핑을 수정한다(#amend-3).
- 구현 시작 뒤 unmapped FAC는 `P0 [Spec-gap]`+`Needs Fix`, stabilize graduation `NO`로 사용자에게 보고한다. 현재 M task 자동 추가·FAC 자동 취소·plan-workitem 재호출은 없다(#amend-3, ADR-057#amend-3 결정 6).
```

**변경 (b)**: Amendment 2 뒤에 추가한다:

```
<a id="adr-037-amend-3"></a>
## Amendment 3 (2026-07-24) — unmapped FAC의 계획-시점 차단 + 구현-후 사용자 결정

### 결정
1. `/plan-workitem M<N>` 전체 스냅샷에서는 FAC↔AC 100%가 task `ready` 승격의 필수 조건이다. unmapped FAC가 하나라도 있으면 self-check 실패로 전 task를 `draft`에 두고 성공 종료하지 않는다.
2. 첫 구현 전 `validate-plan`/reviewer의 `[Plan-FAC-coverage]`는 unmapped FAC를 P0로 보고하며, `/repair-plan M<N>`이 부모 M 전체의 **task·AC·FAC↔AC 매핑**을 고친 뒤 재검증한다(M/F의 FAC 자체를 바꾸는 경로 아님).
3. 구현이 시작된 뒤 validator/validate-workitem이 unmapped FAC를 발견하면 report에 `P0 [Spec-gap] FAC-N → unmapped`를 기록하고 combined verdict를 `Needs Fix`로 둔다. **미커버 task 자동 추가·`/plan-workitem` 재호출·`/repair-workitem` 자동 진입은 하지 않는다**. 다음 액션은 사용자 중단·보고다. 사용자가 현재 M 약속을 어떻게 처리할지 명시적으로 결정해야 하며, 새 요구·기획 변경은 다음 마일스톤이 기본이다.
4. stabilize preflight에서도 같은 finding은 graduation `NO`를 유지하고 사용자에게 보고한다. 자동 corrective task·자동 FAC 취소 문법은 두지 않는다.

### 적용 surface
- .claude/skills/plan-workitem/SKILL.md (FAC↔AC 100% ready gate)
- .claude/skills/validate-plan/SKILL.md · .claude/agents/reviewer.md (`[Plan-FAC-coverage]` P0)
- .claude/skills/validate-workitem/SKILL.md · .claude/agents/validator.md (P0 report + 사용자 결정 라우팅)
- .claude/skills/stabilize-milestone/SKILL.md (graduation NO)
- docs/30-workitems/_templates/FEATURE_TEMPLATE.md (`## 7-1` 주석)

### 강도 (ADR-022)
- constraint(강) — 계획 완료 조건과 구현 후 계획 잠금을 동시에 보존. validator는 report-only이고 문서·코드를 직접 수정하지 않는다.
```

**surface follow-exactly**:
- `validator.md`의 `Spec Gap ... + 미커버 task 추가 권장 (자동 차단 X)`을 **`P0 [Spec-gap] ... 기록; task 자동 추가 금지; 집계자에게 Needs Fix + 사용자 결정 라우팅 반환`**으로 바꾼다.
- `validate-workitem/SKILL.md` FAC audit(:65~69)와 report 예시(:125)의 "미커버 task 추가 권장"을 **`P0 [Spec-gap] — 계획 누락, 사용자 결정 필요`**로 바꾼다. 집계 규칙상 P0라 `Needs Fix`; 마지막 액션은 이 라벨이 있으면 일반 `/repair-workitem`보다 우선해 **자동 후속 호출 없이 사용자 보고**다.
- `FEATURE_TEMPLATE.md` `## 7-1` 주석의 "unmapped 항목은 미커버 task 추가 권장"을 **"unmapped 0건이 plan-workitem task ready 승격 조건; 발견 시 성공 종료 금지"**로 바꾼다.
- `stabilize-milestone`은 §4.12c(m)의 graduation NO 문구를 적용한다.

## 4.6 ADR-014 Amendment 3 — 회고에 graduation 줄 (RD-1)

**기존**: `docs/90-decisions/boilerplate/ADR-014-milestone-graduation.md` 결정 2("회고 4 항목")는 목표 달성도/scope creep/비목표 위반/핵심 학습만 정한다. accepted ADR이므로 결정을 in-place로 덮어쓰지 않고 **amendment로 확장**한다(Record 문서 규약 — 충돌 없는 확장은 `## Amendment N`).

**변경**: 파일 맨 끝에 **Amendment 3**을 추가한다(현재 본문·README 인덱스 모두 amend-2까지 실측됨):

```
<a id="adr-014-amend-3"></a>
## Amendment 3 (2026-07-21) — 회고에 graduation 판정 줄 (로드맵 파생 입력)

### 결정
`## 8. 회고`에 4 항목 위로 `graduation:` 줄을 추가한다: `YES | NO | BLOCKED (<날짜>)`. **판정 기록 시점은 stabilize 단계 8(회고 자동 채움)** — 단계 4~6 중 **qa 팬아웃이 `QA_FINDINGS.md`에 기록한 P0만** 반영한 *최종* 판정을 1회 기록한다(reviewer 팬아웃은 `IMPROVEMENT_GUIDE.md` report-only — graduation predicate에 미반영, stabilize §6-S 라우팅과 정합)(§1.5 사전점검이 아님 — §1.5에서 기록하면 이후 P0를 못 잡아 '잘못된 YES'가 박힌다). 회고는 stabilize의 정상 write 대상 — read-only 계약 불변. BLOCKED = e2e blocked-on-env. 이 줄은 `docs/30-workitems/ROADMAP.md` Done/Now 파생 입력(다음 plan-milestone R0가 읽어 재조정 — ADR-057#amend-1). 로드맵 파일 자체는 stabilize가 건드리지 않는다.

### 적용 surface
- docs/30-workitems/_templates/MILESTONE_TEMPLATE.md (§8 회고)
- .claude/skills/stabilize-milestone/SKILL.md (단계 8 판정 영속 + 회고 항목)

### 강도 (ADR-022)
- enabling(약) — 회고 항목 1줄 확장.
```

**왜**: 로드맵 상태 파생의 출처가 되는 graduation 판정을 회고에 영속. accepted ADR의 결정을 덮어쓰지 않고 amendment로 확장해 Record 규약을 지킨다. (MILESTONE_TEMPLATE §8·stabilize 실제 편집은 §4.8·§4.14에서 수행 — 본 amendment는 그 정책 근거.)

## 4.7 ROADMAP.md 신설 (RD-1)

**변경**: 새 파일 `docs/30-workitems/ROADMAP.md`를 아래 빈 shell로 만든다(baseline — plan-milestone이 채움):

```markdown
# 마일스톤 로드맵

> 요약 지도 — 각 마일스톤 상세는 링크된 Mx 문서가 SSOT. 이 파일은 `/plan-milestone`만 갱신한다(R3 생성/갱신, R0 재조정). 상태는 `stabilize-milestone`이 마일스톤 회고에 남긴 graduation 판정에서 파생 (ADR-057#amend-1).
> **얇음 규율**: Next/Later 행은 "목표 1줄 + 확신도"만 — 기능·AC·졸업 칸을 만들지 않는다(아직 안 정한 걸 정한 척 금지). M 번호는 Done/Now만 발급, Next/Later는 `(M3?)`처럼 잠정. 날짜·%·story point 기본 제외. Now 기본 1개(병렬은 명시 결정 시만).

## Done
<!-- 졸업한 마일스톤 스냅샷만. -->
| id | candidate-key | 목표 | 졸업 | 주요 기능 |
|----|---------------|------|------|-----------|

## Now
<!-- 현재 진행(기본 1개). 진척 스냅샷만 — 상세는 Mx 문서. -->
| id | candidate-key | 목표 | 진척 | 주요 기능 | 의존 |
|----|---------------|------|------|-----------|------|

## Next
<!-- 다음 후보 — `candidate-key` + 목표 1줄 + 확신도만. 상세 문서 없음.
     형식: - (M3?) `<candidate-key>` <목표 1줄> — 확신도: <높음/중간/낮음>
     첫 backtick 토큰 = 안정 candidate key(목표 슬러그, 예 `offline-merge`) — R0 재조정이 *이 key로* 중복 생성·Now 승격을 매칭한다(목표 문구가 바뀌어도 key는 고정). 예: - (M3?) `offline-merge` 오프라인 편집 병합 — 확신도: 낮음 -->

## Later
<!-- 그 뒤 후보 한 줄. 같은 `candidate-key` 형식. 예: - `team-collab` 팀 협업 — 확신도: 낮음 -->
```

## 4.8 MILESTONE_TEMPLATE — 회고 graduation 줄 (RD-1) + 화면 전환 §9 (DS-4)

**기존** (`docs/30-workitems/_templates/MILESTONE_TEMPLATE.md` §8 회고):

```
## 8. 회고 (stabilize 자동 채움)
- 목표 달성도: <정량/정성 1줄>
- scope creep 사례: <있으면 1줄, 없으면 "없음">
- 비목표(charter ## 5) 위반 사례: <있으면 1줄>
- 핵심 학습 3개 이내
```

**변경**: graduation 줄 추가 + §9 화면 전환 섹션 신설(파일 끝에):

```
## 8. 회고 (stabilize 자동 채움)
- graduation: <YES | NO | BLOCKED> (<날짜>)  <!-- stabilize 단계 8 최종 판정(단계 4~6 qa 팬아웃 P0(QA_FINDINGS)만 반영, reviewer report-only 미반영) 영속 — §1.5 사전점검 아님. ROADMAP.md 파생 입력 (ADR-014·ADR-057#amend-1). BLOCKED = e2e blocked-on-env. 주: 이 판정은 stabilize 시점 report(ADR-014상 checkout-local ephemeral) 기준이며, ROADMAP Done은 이 *영속된 판정*의 파생이지 fresh clone에서 재도출된 증거가 아니다 — 재검증이 필요하면 stabilize 재실행(증거 영속 강화는 ADR-014 범위). -->
- 목표 달성도: <정량/정성 1줄>
- scope creep 사례: <있으면 1줄, 없으면 "없음">
- 비목표(charter ## 5) 위반 사례: <있으면 1줄>
- 핵심 학습 3개 이내

## 9. 화면 전환 (UI — 다화면 또는 단일 화면의 비가역·분기·복구 흐름 시 — ADR-056#amend-3)
<!-- 순수 정적 단일 화면·비-UI 마일스톤은 "(해당 없음)"; 단일 화면이라도 비가역/파괴 동작(삭제·결제·전송)·분기·다단계 오류→복구(submit→error→retry)·modal·확인 dialog가 있으면 채운다(트리거=화면 수가 아니라 비가역 동작·분기·복구 상태 존재 — ADR-056#amend-3). /plan-milestone R5-1이 채운다.
     형식: | path type(primary/failure/recovery) | 현재 화면/상태 | 사용자 행동 | 다음 화면/상태 | owner feature | prototype |
     plan-workitem이 owner feature의 **존재하는** 각 path type 행(primary·failure·recovery)을 task AC로 회수, validate-plan [Plan-design]이 존재 점검. -->
```

## 4.9 FEATURE_TEMPLATE — PX 인벤토리 + `## 7-3` (INST-1)

**기존** (`docs/30-workitems/_templates/FEATURE_TEMPLATE.md` `## 7` 주석 + `## 7-2` 뒤):

```
## 7. Feature-level Acceptance Criteria
<!-- FAC-1, FAC-2 ... 시나리오 수준 측정 가능 기준.
     task `## 6 AC`는 FAC를 만족시키는 구현 단위.
     구 `## 8 검증 방법`을 흡수.
     UI feature는 승인 프로토타입 참조 줄을 둔다(ADR-056 — 화면 단위 파일, 그 feature가 등장하는 화면마다 1줄):
     `프로토타입: [M<N>/<screen>.html](../../20-system/prototypes/M<N>/<screen>.html) (진입: <라우트/상태 진입 메모>)`.
     프로토타입이 무의미한 UI feature는 `프로토타입 면제: <사유>` 한 줄로 대체(plan-workitem 입구 계약의 통과 조건 — 둘 다 없으면 Needs Experience Contract). -->
```

**변경**: `## 7` 주석 끝에 PX 인벤토리 규약을 덧붙인다:

```
## 7. Feature-level Acceptance Criteria
<!-- FAC-1, FAC-2 ... 시나리오 수준 측정 가능 기준.
     task `## 6 AC`는 FAC를 만족시키는 구현 단위.
     구 `## 8 검증 방법`을 흡수.
     UI feature는 승인 프로토타입 참조 줄을 둔다(ADR-056 — 화면 단위 파일, 그 feature가 등장하는 화면마다 1줄):
     `프로토타입: [M<N>/<screen>.html](../../20-system/prototypes/M<N>/<screen>.html) (진입: <라우트/상태 진입 메모>)`.
     프로토타입이 무의미한 UI feature는 `프로토타입 면제: <사유>` 한 줄로 대체(plan-workitem 입구 계약의 통과 조건 — 둘 다 없으면 Needs Experience Contract).
     경험 결정(PX) 인벤토리(ADR-056#amend-1 — plan-milestone R5-5가 승인 프로토타입 HTML의 `<!-- PX-M<N>-<screen>-NN: <한 줄 결정> -->` 마커를 *그대로 복사*, **이 feature가 *구현하는* PX만**; 한 화면이 여러 feature에 걸치면 PX별로 구현 feature에 분산 기록(화면 통째로 몰지 않음 — INST-1 사각 방지); 화면-공통은 shell/layout feature 또는 DESIGN.md §4, cross-feature 정합은 `## 7-2` INV/seam):
     `경험 결정(PX):`
     `- PX-M<N>-<screen>-01: <한 줄 결정 (예: 입력창을 화면 상단에 sticky 고정)>`
     `- PX-M<N>-<screen>-02: <...>` -->
```

**기존** (`## 7-2` 주석 다음 — `## 8`이 오기 전. 실제로는 `## 7-2` 블록 뒤에 §8이 옴):

```
## 7-2. Cross-task invariant 계약 (subsection of ## 7)
<!-- seam 신호(2+ task 동일 엔티티 write / 상태 머신 / 2차-write / 멱등 — ADR-057 결정 8) 발화 시에만 /plan-workitem이 채운다.
     미발화 시 "(해당 없음 — seam 신호 미발화)" 한 줄.
     형식: INV-N | 보장 (상태 전이 / 멱등 / 2차-write 재검증 / task 간 계약) | 관련 task:AC | 검증 방법
     예: INV-1 | 주문 상태는 draft→paid→shipped 단방향 — 어떤 task도 역방향 write 금지 | T-003:AC-2, T-005:AC-1 | 상태 전이 가드 단위 테스트
     unmapped INV는 plan 출력 "남은 미결정 사항"에 surface. validator가 task 검증 시 위반·테스트 커버를 점검. -->
```

**변경**: `## 7-2` 블록 바로 뒤에 새 subsection `## 7-3`을 추가한다:

```
## 7-2. Cross-task invariant 계약 (subsection of ## 7)
<!-- (위와 동일 — 변경 없음) -->

## 7-3. 프로토타입 경험(PX) ↔ AC 매핑 (subsection of ## 7)
<!-- UI feature 한정(ADR-056#amend-1). /plan-workitem 3-P가 채운다(영속 SSOT — plan 출력은 echo).
     형식: PX-M<N>-<screen>-NN → T-NNN:AC-M, T-MMM:AC-K (다대다 허용)
     `## 7` PX 인벤토리의 어떤 PX도 참조하지 않는 AC/미매핑 PX(unmapped PX)는 [Plan-FAC-coverage]가 unmapped FAC와 동일 기준으로 잡는다(P0 권장).
     본 subsection은 ## 7과 한 묶음 — ADR-036 12-섹션 구조에 *추가 main section 신설 X* (## 7-1·## 7-2 선례). 비-UI feature는 "(해당 없음)". -->
- PX-M<N>-<screen>-01 →
- PX-M<N>-<screen>-02 →
```

> 주의: `## 7-2`의 주석 본문은 바꾸지 않는다 — `## 7-2` 블록 *뒤에* `## 7-3`을 삽입하는 것뿐이다. 위 "변경"에서 `## 7-2` 주석을 `(위와 동일 — 변경 없음)`으로 축약 표기했으니, 실제 편집은 `## 7-2` 블록을 원문 그대로 두고 그 다음 줄부터 `## 7-3` 블록을 넣는다.

## 4.10 TASK_TEMPLATE — `(PX-M<N>-<screen>-NN)` 태그 (INST-1)

**기존** (`docs/30-workitems/_templates/TASK_TEMPLATE.md` `## 6` 주석 마지막 부분):

```
## 6. Acceptance Criteria
<!-- AC는 Given-When-Then *형식 강력 권장*. measurable verb 사용:
     권장(좋은 예): returns, displays, persists, rejects, emits, responds with, contains, matches
     강력 금지(절대 비측정): works, looks good, is correct, is fine
     문맥상 허용: handles, supports — 단 *무엇을 / 어떻게*까지 명시되면 허용
     AC 3개 이하 권장(4개 이상이면 task 분해 *권장 텍스트*).
     위반 시 planner는 *재분해 권장 텍스트*를 출력, builder는 *재분해 요청 텍스트*를 Red phase 직전 출력 — 자동 차단은 하지 않는다(사용자 결정). 정책: ADR-026. -->
```

**변경**: 주석 끝에 PX 태그 규약 한 줄 추가:

```
## 6. Acceptance Criteria
<!-- AC는 Given-When-Then *형식 강력 권장*. measurable verb 사용:
     권장(좋은 예): returns, displays, persists, rejects, emits, responds with, contains, matches
     강력 금지(절대 비측정): works, looks good, is correct, is fine
     문맥상 허용: handles, supports — 단 *무엇을 / 어떻게*까지 명시되면 허용
     AC 3개 이하 권장(4개 이상이면 task 분해 *권장 텍스트*).
     위반 시 planner는 *재분해 권장 텍스트*를 출력, builder는 *재분해 요청 텍스트*를 Red phase 직전 출력 — 자동 차단은 하지 않는다(사용자 결정). 정책: ADR-026.
     UI task로 프로토타입 경험 결정을 구현하는 AC는 끝에 `(PX-M<N>-<screen>-NN)` 태그를 붙일 수 있다(ADR-056#amend-1 — (AC-N)·(INV-N) 태그와 동형). feature `## 7-3` PX↔AC 매핑의 근거. -->
```

> **중간 커밋 금지**: 경험 계약 ADR·로드맵·템플릿만 먼저 커밋하지 않는다. 아래 plan/implement/validate/stabilize skill 배선과 메타 문서 동기까지 끝낸 뒤 Phase 4 종료 지점에서 한 번에 커밋한다.

## 4.11 plan-milestone — R0 로드맵 재조정 + R3 로드맵 갱신 + R5-1 전환 표 + R5-5 PX 인벤토리 + R5 게이트 권한 + 출력 (RD-1 · DS-4 · INST-1 · DS-3)

**변경 (frontmatter) — R5 게이트 실행 권한 (DS-3)**: plan-milestone `allowed-tools`에 게이트 실행 권한이 없어(현재 `Bash(rm ...)`뿐) R5-5 게이트가 실행 불가다.

**기존**:

```
allowed-tools: Read Glob Grep Write Edit Agent Bash(rm docs/20-system/prototypes/*/_drafts/*.html)
```

**변경**:

```
allowed-tools: Read Glob Grep Write Edit Agent Bash(rm docs/20-system/prototypes/*/_drafts/*.html) Bash(node scripts/design-gate.mjs*) Bash(npx playwright*)
```

> ADR-058 `## Surfaces`·Mutation Contract Target에도 `plan-milestone`(R5 게이트 호출자)이 추가돼 있어야 한다(Phase 4 같은 커밋에서 반영). `_drafts/*.html` rm은 R5-5 승격 후 시안 정리용(active 화면은 Write로 대체 — 별도 삭제 권한 불요).

**변경 (프로토타입 확정 재대조 · `--prototype` 재진입 제거 · additive feature 제한)**: 화면 폐기 모드(`--retire-screen`)는 **두지 않고**, 별도 `--prototype` 재진입 모드도 **제거**한다(마일스톤 확정 후 화면·계획 변경은 다음 마일스톤의 새 M<N> — 마일스톤 경계 = 버전 경계, ADR-056#amend-1 / ADR-057#amend-3).
- **argument-hint**: `"[milestone idea | M<N>]"` (`--prototype [F-NNN]`·`--retire-screen`·별도 `feature idea` 진입 제거; `M<N>`으로 기존 M 재개·상태 판정, `milestone idea`로 신규 M).
- **입력 분기 (상태기계 — 결정 5)**: (a) **기존 `draft` M<N>** → 그 M의 최초 미완 라운드부터 **재개**(완료 라운드는 멱등 skip; base의 `--prototype [F-NNN]` 재진입 모드(:95)는 **삭제** — 같은 `M<N>` 재실행이 그 역할을 대신한다). (b) **`ready`(이상) M<N>** → 이미 계획 확정·잠금이므로 **변경 거부** + "그 변경은 다음 마일스톤(M<N+1>)" 안내. (c) **존재하지 않는 M ID** → 오류 종료. (d) **새 아이디어**(`milestone idea`) → 다음 번호 M 생성. **feature 추가는 `draft` M<N> 재개 대화 안에서만** 처리한다(별도 `feature idea` 진입 제거 — draft 마일스톤이 여럿이면 대상이 모호하므로; P1-8). `ready` 이상 M엔 feature 추가 금지(결정 5e).
- **확정 재대조 → `ready` 잠금 (신규 exit 단계 — 결정 5)**: plan-milestone 종료 전에 **모든 마일스톤**에서 마일스톤 `## 3` 포함기능 ↔ feature `## 3` 시나리오 ↔ **feature `## 7` FAC**가 서로 정합한지 재대조한다(FAC 본문은 `## 7` — `## 7-1`은 plan-workitem이 *나중에* 채우는 FAC↔AC 매핑이라 이 시점엔 빈 shell, 재대조 대상 아님). **UI 마일스톤은 추가로** 승인 프로토타입 ↔ `## 3` 시나리오 ↔ PX 인벤토리 ↔ 마일스톤 `## 9` 전환표 정합까지 본다(비-UI는 *이 추가분만* skip — M↔feature↔FAC 재대조는 공통). 불일치면 해당 라운드로 되돌아가 정합 후 종료. **재대조 통과 + milestone `## 7 열린 질문`·feature `## 12 열린 질문`의 미해결 열린 질문 0건일 때만** — **먼저 산하 feature를 `## 0. Status: ready`로, 마지막에 M을 `ready`로** 전환한다(승격 중 중단 대비 — M `ready`면 전부 `ready` 보장; 결정 5a). 미해결 열린 질문이 남으면 `ready` 전환 보류.
- **계획 잠금 (상태기계 — 결정 5)**: feature 추가는 **`draft` 마일스톤에만**(`ready` 이상은 확정·잠금 → 그 변경은 다음 M<N+1>; `:9`/`:10`의 additive 경로도 `draft` 한정). `validate-plan`→`repair-plan`의 **task·매핑·의존성 수정**은 산하 모든 task 상태가 `draft|ready`일 때까지만(= 구현 시작 전) 허용한다. `in-progress`·`blocked`·`done`·`deprecated` 중 하나라도 있으면 잠금이다. M/F scope·FAC·프로토타입·PX는 plan-milestone `ready`에서 이미 잠기며 repair-plan 대상이 아니다. 구현이 시작되면 task 계획도 변경하지 않는다(이후 근본 충돌은 사용자 중단·보고 — ADR-057#amend-3 결정 4·5).
- **base 출력(:114)의 `2-tier` 문구 정정**: plan-milestone 출력이 `/plan-workitem M<N>`를 "2-tier 배치 분해"로 설명하는 부분을 **"전 feature task·`## 3`·AC·FAC·seam·PX↔AC를 1회 완성(전체 스냅샷 — ADR-057#amend-3; draft/refresh 없음)"**로 바꾼다.
- **단계별 출구(:99) 정정**: "어느 라운드에서 멈춰도 그때까지 산출물이 `/plan-workitem` 입력으로 의미가 있다"를 제거한다. **중단된 산출물은 같은 draft `/plan-milestone M<N>` 재개의 입력일 뿐**이며, 확정 재대조를 통과해 M·전 feature가 `ready`가 된 뒤에만 `/plan-workitem M<N>`을 안내한다(부분 계획 진입 금지).

**기존** (R0 회수 블록 초입):

```
**R0 — 직전 마일스톤 회수 (additive 입력)**
- 직전 마일스톤 문서가 있으면 다음만 회수한다(ADR-019 minimal — 전체 fork-load 금지):
  - `## 8. 회고` (목표 달성도·scope creep·핵심 학습) — `/stabilize-milestone`이 채운 내용.
  - `## 5. 완료 기준` 졸업 상태(graduation 미충족 항목이 남아 있으면 carry-over 후보).
  - 직전 마일스톤에서 *stabilize 이월*된 미완 항목(졸업 안 된 task / open finding).
```

**변경**: 이 블록 끝에 로드맵 재조정 불릿을 추가한다:

```
**R0 — 직전 마일스톤 회수 (additive 입력)**
- 직전 마일스톤 문서가 있으면 다음만 회수한다(ADR-019 minimal — 전체 fork-load 금지):
  - `## 8. 회고` (graduation 판정·목표 달성도·scope creep·핵심 학습) — `/stabilize-milestone`이 채운 내용.
  - `## 5. 완료 기준` 졸업 상태(graduation 미충족 항목이 남아 있으면 carry-over 후보).
  - 직전 마일스톤에서 *stabilize 이월*된 미완 항목(졸업 안 된 task / open finding).
- **로드맵 재조정 (ADR-057#amend-1)**: `docs/30-workitems/ROADMAP.md`를 읽어 직전 마일스톤 `## 8. 회고`의 `graduation:` 판정 + task done/total로 Done/Now 구간을 최신화한다(graduation=YES면 Now→Done 스냅샷, 진행 중이면 진척 갱신). **미졸업 Now 가드**: 현재 Now 마일스톤의 graduation이 YES가 아니면(진행 중·NO·BLOCKED) *명시적 병렬 승인이 없는 한* 새 마일스톤을 Now로 추가하지 않는다 — "현재 Now(M<N>) 미졸업 — 완료 후 진행 권장"을 안내하고 새 Now 생성을 보류(단일 Now 규율). Next 후보를 Now로 승격·중복 생성 방지를 위해 각 Next/Later 행은 안정적 candidate key(목표 슬러그)를 갖는다. 로드맵은 plan-milestone만 쓴다.
```

**기존** (R3 authoring 초입):

```
**R3 — 마일스톤 문서 authoring (MILESTONE_TEMPLATE에서)**
- 확정된 각 마일스톤을 `docs/30-workitems/_templates/MILESTONE_TEMPLATE.md`를 복사해 `docs/30-workitems/milestones/M<N>-<이름>.md`로 작성한다. `<N>`은 기존 마일스톤 다음 번호(첫 호출이면 M1 — additive, 기존 보존).
```

**변경**: R3 첫 불릿 뒤에 로드맵 갱신 불릿을 추가한다(R3 블록 내, `## 5 완료 기준` 불릿 앞):

```
**R3 — 마일스톤 문서 authoring (MILESTONE_TEMPLATE에서)**
- **지금 착수하는 마일스톤만 실체화 (rolling-wave — ADR-057#amend-1)**: R2에서 확정한 분할 중 *이번에 착수하는* 마일스톤(기본 1개 = Now)만 `docs/30-workitems/_templates/MILESTONE_TEMPLATE.md`를 복사해 `docs/30-workitems/milestones/M<N>-<이름>.md`로 작성한다. `<N>`은 기존 마일스톤 다음 번호(첫 호출이면 M1 — additive, 기존 보존). **R2 분할이 식별한 *후속* 마일스톤은 지금 Mx 문서를 만들지 않는다 — 그 마일스톤의 feature 문서·R5 프로토타입도 만들지 않는다** (로드맵 Next/Later에 얇은 행(미번호 `(M?)`)으로만; R4 컴포넌트·R5 프로토타입은 지금 착수하는 Now 마일스톤의 화면에만 적용). 후속 마일스톤의 feature·프로토타입은 그 마일스톤이 *Now가 되는 회차*에 생성한다. (이래야 "미번호 얇은 후보 vs 실체 문서"가 어긋나지 않는다 — rolling-wave 핵심.)
- **로드맵 갱신 (ADR-057#amend-1)**: `docs/30-workitems/ROADMAP.md`(baseline shell 존재 — 없으면 헤더 포함 생성)에 이번 마일스톤 행을 **Now**로 쓴다(id·**`candidate-key`**(안정 목표 슬러그 — Later/Next에서 승격됐으면 그 key 그대로 유지, 신규면 새로 발급)·목표·진척·주요 기능 링크·의존). **진척 칸은 `tasks: unplanned`로 둔다** — R3 시점엔 plan-workitem 미실행이라 총 task 수 N을 모른다. plan-workitem이 task를 만든 뒤 다음 plan-milestone R0 재조정이 이 칸을 실제 `done/total`로 갱신한다(`0/N`처럼 미확정 N을 지금 박지 말 것). **직전 Now 행의 Done 전환은 R3가 강제하지 않는다** — 그 마일스톤 회고 `graduation:`이 YES일 때만 Done이며, 판정 반영은 R0 재조정이 담당한다(graduation 확인 없이 Done 박기 금지). R2 분할의 후속 마일스톤은 Next/Later에 얇게만(목표 1줄 + 확신도, `(M?)` 잠정 — 기능·AC·졸업 칸 만들지 말 것). Now 기본 1개(병렬은 명시 결정 시만). 로드맵은 plan-milestone만 쓴다.
```

**기존** (R4 feature authoring 초입 — 현재는 *모든* 확정 마일스톤의 feature를 생성):

```
**R4 — feature 문서 authoring (FEATURE_TEMPLATE에서)**
- 각 마일스톤의 feature 후보를 `docs/30-workitems/_templates/FEATURE_TEMPLATE.md`를 복사해 `docs/30-workitems/features/F-<NNN>-<이름>.md`로 작성한다(기존 feature 다음 번호, 첫 호출이면 F-001 — additive).
```

**변경 (rolling-wave 정합 — 필수)**: R3가 Now 마일스톤만 실체화하는데 R4가 "각 마일스톤"이면 미래 마일스톤 feature가 선생성돼 R3와 모순된다. 첫 불릿의 "각 마일스톤"을 "지금 착수하는 Now 마일스톤"으로 좁힌다:

```
**R4 — feature 문서 authoring (FEATURE_TEMPLATE에서)**
- **지금 착수하는 Now 마일스톤(R3에서 실체화한 그 마일스톤)의 feature 후보만** `docs/30-workitems/_templates/FEATURE_TEMPLATE.md`를 복사해 `docs/30-workitems/features/F-<NNN>-<이름>.md`로 작성한다(기존 feature 다음 번호, 첫 호출이면 F-001 — additive). **R2 분할이 식별한 후속 마일스톤의 feature는 지금 만들지 않는다** — 그 마일스톤이 *Now가 되는 회차*에 생성한다(R3 불릿과 정합, rolling-wave 핵심). 나머지 불릿(`## 0-1 Type`·`## 3 시나리오`·`## 7 FAC`·`## 7-1 빈 shell` 등)은 그 Now 마일스톤 feature에 대해 기존대로.
```

> R5 프로토타입은 R5-1이 R4 feature의 `## 3`에서 화면을 도출하므로, R4를 Now-한정하면 R5도 자동으로 Now-한정된다(별도 수정 불요).

**기존** (R5-1 화면 목록 확정):

```
- **R5-1 화면 목록 확정**: R4 feature 문서들의 `## 3 핵심 시나리오`에서 프로토타입 대상 화면을 도출(기본 feature당 대표 1화면 — 다화면 feature는 사용자 협의, 총 6~8화면 초과 시 우선순위 협상). 프로토타입이 무의미한 feature(순수 백엔드·내부 설정 등)는 이 시점에 해당 feature 문서 `## 7`에 `프로토타입 면제: <사유>` 한 줄을 기록한다(ADR-056 — plan-workitem 입구 계약의 통과 조건).
```

**변경**: 화면 목록 도출 뒤에 전환 표 authoring을 덧붙인다(다화면·복구 흐름 — 트리거는 §9 heading의 조건):

```
- **R5-1 화면 목록 확정 + 화면 전환 표(다화면·복구 흐름)**: R4 feature 문서들의 `## 3 핵심 시나리오`에서 프로토타입 대상 화면을 도출(기본 feature당 대표 1화면 — 다화면 feature는 사용자 협의, 총 6~8화면 초과 시 우선순위 협상). 프로토타입이 무의미한 feature(순수 백엔드·내부 설정 등)는 이 시점에 해당 feature 문서 `## 7`에 `프로토타입 면제: <사유>` 한 줄을 기록한다(ADR-056 — plan-workitem 입구 계약의 통과 조건). **화면이 2개 이상이거나(다화면), 단일 화면이라도 비가역/파괴 동작(삭제·결제·전송)·분기·다단계 오류→복구·modal이 있으면 마일스톤 문서 `## 9. 화면 전환`에 전환 표를 채운다**(ADR-056#amend-3 — 트리거는 화면 수가 아니라 비가역·분기·복구 상태 존재): `path type(primary/failure/recovery) | 현재 화면/상태 | 사용자 행동 | 다음 화면/상태 | owner feature | prototype`(각 행 = 한 path type). 순수 정적 단일 화면·비-UI는 "(해당 없음)".
```

**기존** (R5-5 승인·저장 — **본문 전체**. 현재는 "승인 시 곧바로 `<screen>.html` 저장" 모델이라, 아래 게이트-우선 재정렬과 충돌하지 않도록 본문 전체를 교체한다 — 파일의 R5-5 한 줄 전체와 일치):

```
- **R5-5 승인·저장**: 사용자 승인 시 최종본을 **화면 단위**로 `docs/20-system/prototypes/M<N>/<screen>.html`에 저장한다(**커밋 대상** — Record; 재승인 시 같은 파일 대체. 화면-키인 이유: 한 화면은 여러 feature 표면의 합성 — ADR-056 결정 1). 저장 직전 **raw hex 정규식 1회 grep — `:root` 정의 블록은 검사 제외**(자기완결 파일이라 정의값 hex는 정상, 검사 대상은 정의 밖 사용처. 발견 시 토큰으로 수정 후 저장 — 상시 grep 제외(결정 7)의 승인-시점 보완). 각 feature 문서 `## 7`에 `프로토타입: [화면 파일](상대경로) (진입: <라우트/상태 진입 메모>)` 참조 줄을 기입한다(그 feature가 등장하는 화면 파일마다 1줄 — §3-V가 이 진입 메모로 화면을 찾는다). `_drafts/` 내 시안 파일을 삭제한다(빈 디렉터리 잔존 무해). 승인 전에는 종료 출력으로 진행하지 않는다.
```

**변경**: R5-5 전체를 **게이트-우선 순서**로 재정렬한다(게이트·승격을 feature 문서 기입보다 먼저 — raw-hex grep·PX 번호 부여는 draft 단계(1), 게이트(2)·무수정 승격(3) 후 feature 기입(4), `_drafts` 삭제는 정리 단계(5)로 한 번만). preamble의 "승인 시 곧바로 저장"과 "게이트 통과 후에만 승격"이 한 섹션에서 충돌하지 않게 한다:

```
- **R5-5 승인·저장** (게이트-우선 순서 — **검사한 bytes = 저장한 bytes**): 사용자 승인 후 아래 순서로 처리한다. **게이트·승격을 feature 문서 기입보다 *먼저*** 한다(게이트 실패 시 최종 `<screen>.html`가 안 생기므로, 참조 줄·PX를 먼저 쓰면 없는 파일을 가리키는 dangling 참조가 남는다).
   1. **draft raw-hex 정합 (게이트 前)**: 승인 예정 draft(`_drafts/`)에 raw hex 정규식 1회 grep — **제외는 `--<name>: #hex` custom-property *정의 라인*만**(`:root` 안이라도 *정의 밖 사용처* hex는 검사 — ADR-056#amend-2; 파일 전체·`:root` 블록 전체 제외 금지). 발견 시 토큰으로 수정 → **수정했으면 그 수정본으로 사용자 재승인**(승인·게이트·저장 bytes 동일). PX 마커는 `PX-M<N>-<screen>-NN`(번호 `01`부터 — 화면 revision 없음, 마일스톤 번호가 버전). §4로 승격한(=PX 아님) 결정은 마커를 달지 않는다(있으면 제거). 이 draft 확정 후 재승인 → gate → 무수정 승격(2·3단계 정합).
   2. **게이트**: **UI 프로토타입이면 항상** 승인된 draft를 `node scripts/design-gate.mjs <그 HTML 경로>`로 검사한다(ADR-058 D3 — **러너 결정적 차단**: serious/critical axe·320/375 geometry(page overflow·viewport escape·clipped text)). **픽셀 취향(위계·밀도·slop·overlap)은 R5-3 사용자 선택·수정 루프가 오라클 — R5엔 별도 reviewer[design] agent 호출이 없다**(취향 오라클=사용자; concept 단계 R2-G와 달리 프로토타입은 사용자가 직접 고른다). 러너 차단이면 designer 재생성 → **1로 되돌아가** 재검사(retry ≤2, repair 후 재승인 포함). retry 소진해도 차단이면 **승격 안 함**·그 화면 미완으로 남긴다(dangling 방지). **exit 2(Needs Install)면 사유 echo 후 승인 보류 — 설치·재실행 전까지 승격 금지**(R2-G/R6와 동일; silent skip·미검증 승격 불가 — ADR-058 constraint "여전히 fail이면 승인 불가"). 승인 프로토타입도 concept과 같은 1회성 게이트 대상.
   3. **승격 (무수정)**: 게이트 통과 후 **통과한 그 bytes를 수정 없이** **화면 단위**로 `docs/20-system/prototypes/M<N>/<screen>.html`로 승격 저장한다(**커밋 대상** — Record; 같은 draft M의 R5 피드백 반복 중 승인 후보가 바뀌면 같은 파일을 대체하되, M `ready` 뒤 재승인은 없음. 화면-키인 이유: 한 화면은 여러 feature 표면의 합성 — ADR-056 결정 1). 승격 시점엔 내용을 더 이상 바꾸지 않는다(raw-hex 정합·재검토는 1에서 이미 끝).
   4. **feature 문서 기입**: 각 구현 feature `## 7`에 `프로토타입: [화면 파일](상대경로) (진입: <라우트/상태 진입 메모>)` 참조 줄(§3-V가 이 메모로 화면을 찾음) + **`경험 결정(PX):` 인벤토리**를 기입한다 — 승인 HTML의 `<!-- PX-M<N>-<screen>-NN: ... -->` 마커를 **그대로 복사**(재추출·재해석 금지 — drift 차단)해 `- PX-M<N>-<screen>-NN: <한 줄>`로. 화면이 여러 feature에 걸치면 **각 PX를 그것을 구현하는 feature의 `## 7`에 분산 기록**(화면 통째로 대표 feature에 몰지 않음 — INST-1 사각 방지); 화면-공통은 shell/layout feature 또는 DESIGN.md §4, cross-feature 정합은 `## 7-2` INV/seam. **완전성 확인 (화면별)**: 기입 후 **그 화면**의 HTML 마커 = 관련 feature 인벤토리 중 **`^PX-M<N>-<현재 screen>-\d{2,}$`로 정확 매칭한 부분집합**과 일치하는지 본다(다중 화면 feature는 여러 화면 PX가 섞이므로 screen 정확 필터 — prefix-only면 `user`가 `user-settings`를 오매칭; 마커 있는데 미기입=orphan 방지). *복사 시점 1차 확인일 뿐* — 이후 문서 drift는 **`M<N>` 입력 validate-plan이 프로토타입 HTML을 독립 회수해 재검증**(plan-workitem도 HTML을 읽음).
   5. **정리**: `_drafts/` 내 시안 파일을 삭제한다(빈 디렉터리 잔존 무해). 승인(=전 화면 게이트 통과·승격) 전에는 종료 출력으로 진행하지 않는다.
```

**기존** (마지막 출력 계약):

```
마지막 출력 ([WORKFLOW.md "스킬 종료 시 다음 단계 출력 contract"](../../../docs/00-meta/WORKFLOW.md) 양식 정합):
- 생성·갱신한 문서 목록(상대 경로 — 마일스톤·feature) — (UI 마일스톤) 승인 프로토타입 경로 목록 + 면제 feature 목록
- 마일스톤 ↔ feature 구조 한 줄 요약
```

**변경**: 로드맵 갱신 줄을 추가한다:

```
마지막 출력 ([WORKFLOW.md "스킬 종료 시 다음 단계 출력 contract"](../../../docs/00-meta/WORKFLOW.md) 양식 정합):
- 생성·갱신한 문서 목록(상대 경로 — 마일스톤·feature) — (UI 마일스톤) 승인 프로토타입 경로 목록 + 면제 feature 목록
- **로드맵 갱신됨: `docs/30-workitems/ROADMAP.md` (Done/Now/Next/Later 반영 — ADR-057#amend-1)**
- 마일스톤 ↔ feature 구조 한 줄 요약
```

## 4.12 plan-workitem — 3-P PX↔AC + 전환 표 소비 (INST-1·DS-4) + seam 소유 우선 (INST-3) + unmapped PX self-check

**변경 — 전체 계획 스냅샷으로 통일 (ADR-057 결정 2·3·4의 2-tier/draft/`F-NNN --refresh` 메커니즘 supersede — §4.5b ADR-057 amend-3로 기록)**: plan-workitem 사용자 진입을 **`/plan-workitem M<N>` 하나로 고정**하고(`--refresh`·`F-NNN` 사용자 경로 없음), 전 feature task·`## 3`를 한 번에 완성한다(draft tier 없음).
- **argument-hint를 M 단위로**: `"<milestone-id>"` — feature-id `F-NNN` 직접 입력·`--refresh`를 *모두 제거*(내부 feature별 순차 처리는 M<N> 1회 안에서만).
- **2-tier(첫 feature만 `## 3` full, 나머지 draft + `F-NNN --refresh` 요구) 제거** — `/plan-workitem M<N>` **한 번의 실행으로 전 feature의 task·`## 3`·AC·FAC↔AC·PX↔AC를 완성**한다(내부적으로 feature별 순차 authoring은 허용하되 *사용자에게 재호출을 요구하지 않는다*).
- **3-P(PX↔AC)·FAC↔AC를 전 feature에 적용**(첫 feature만이 아님).
- **마지막 출력에서 `F-NNN`·`--refresh` 호출 안내 모두 제거** — 계획은 1회 완성·잠금이라 재호출/재접지 안내가 없다(다음 단계는 의존순 implement → validate → (실패 시) repair → finalize).
- **후행 task는 선행 task의 계획된 완료 결과·AC를 전제로 작성** (ADR-057#amend-3): 전 task를 한 번에 만들므로 후행 task `## 3`·AC는 선행 task가 보장할 인터페이스·완료 결과를 전제로 적는다(refresh 없이 후행 계획이 성립하도록).
- **근거**: 사용자 요구 = 최종 합성 화면 + 마일스톤 단위 전체 계획·잠금(ADR-057#amend-3). 2-tier/draft/`F-NNN --refresh`·`M<N> --refresh`를 모두 폐기하고 전 feature task를 한 번에 완성한다. 코드-stale 방지 근거(base 결정 3)는 draft 지연-계획이 아니라 **task 실행 직전 implement-workitem 경량 접지 확인**으로 옮긴다(§4.12b; 근본 충돌은 사용자 보고).

**적용 상세 (plan-workitem SKILL 실제 편집 — follow-exactly, 위 directive의 구체화)**:
- frontmatter `description`의 "기존 feature 문서를 task 단위로 분해"·"M<N> 배치 분해(2-tier)"를 **"입력 마일스톤의 전 feature를 task로 분해하고 전 AC·매핑을 1회 완성"**으로 바꾼다. 역할 줄(:9)만 바꾸고 frontmatter 설명을 stale로 남기지 않는다.
- frontmatter `argument-hint: "[feature id | milestone id] [--refresh]"` → `argument-hint: "<milestone-id>"` (`--refresh`·feature-id 모두 제거).
- `M<N>` 배치 모드의 ***가이드 tier*** 불릿에서 "**첫 구현 대상 feature(의존성상 최선두)만** 3-G full JIT로 작성. 나머지 feature의 task는 의도 수준 초안만 적고 `## 3` 본문 첫 줄에 HTML 주석 마커 `<!-- ## 3 상태: draft — 구현 직전 /plan-workitem F-NNN --refresh 필요 -->`를 박는다"를 **"`## 3` 단계별 가이드를 *모든 feature*에 대해 3-G로 완성한다(draft 마커·`첫 feature만` tier 폐기 — `## 3 상태: draft` 주석 박지 않음)"**로 교체한다 — draft 마커 생성 자체를 삭제(ADR-057#amend-3).
- **`F-NNN --refresh` — 가이드 재접지 모드** 불릿(+ 하위 *seam 재점검* 불릿)을 **통째로 삭제**한다(refresh 기능 자체 없음). 전 feature `## 3`가 배치 시점에 완성·잠기므로 재접지 모드가 필요 없다. cross-task seam 재점검(ADR-057 결정 9)은 **배치 시점 전 task 집합에 1회** 수행한다(전 feature `## 3`가 full이라 구현 세부까지 보임 — draft 시절처럼 refresh로 미루지 않는다). 구현 중 계획과 *근본* 충돌이 드러나면 자동 재계획 없이 **사용자에게 중단·보고**(일반 오류는 repair — §4.5b amend-3 결정 3).
- **역할 줄(:9)**: "입력으로 받은 feature ID를 task 단위로 분해"를 **"입력 마일스톤 `M<N>`의 *전 feature*를 task로 분해하고 그 AC를 각 feature `## 7-1`에 채운다"**로 바꾼다(feature-단위 역할 문구 제거).
- **입력(:12)**: "feature ID(예 `F-001`) 또는 milestone ID(`M<N>`)"를 **"마일스톤 ID `M<N>`만 받는다 — `F-NNN` 단독 입력은 거부(‘`M<N>` 단위로 실행’ 안내 후 종료)"**로. 내부 feature별 순차 처리는 `M<N>` 실행 *안*에서만. **입구 상태 확인(결정 5b·5d)**: (i) **M과 산하 feature가 모두 `## 0. Status: ready`**인지 — `draft`(plan-milestone 미확정)면 "plan-milestone으로 확정 먼저" 안내 후 종료; (ii) 그 M의 task 상태가 하나라도 `draft|ready` 밖(`in-progress`·`blocked`·`done`·`deprecated`)이면 계획 변경 거부("이미 구현 시작/종료 상태 — 현재 M 계획 잠금; 근본 문제면 사용자 중단·보고 또는 다음 M"). 모든 기존 task가 `draft|ready`일 때만 상태별 분기: **(A) task 0건(최초 실행) → 전 feature task를 `draft`로 생성하며 `## 3`·AC·`## 9`·FAC↔AC·(UI)PX↔AC를 작성 → 전체 self-check+`[Plan-dep]` → `ready` 순차 승격**; **(B) `draft`가 1개 이상(전부 draft 또는 ready/draft 혼합) → 전체 계획 재검증 후 남은 `draft`를 `ready`로 승격**(미완 작성·승격 재개 — 혼합은 dead state 아님); **(C) 전 task `ready`+완결 → read-only no-op**; **(D) `ready`인데 문서 불완전(완결 판정 미충족) → 자동 하향·수정하지 않고 `Needs Plan Repair`로 중단**, 첫 구현 전 `/validate-plan M<N>`→`/repair-plan M<N>`으로 고친 뒤 전체 self-check를 다시 통과시킨다(`ready → draft` 역전이 없음). task `ready` 승격은 **전체 self-check + `[Plan-dep]` 성공 후·마지막 출력 前** 단계에서 수행한다.
- **입구 preflight 실패 정책(:18)**: "하나라도 미충족이면 그 feature만 보류 목록으로 출력하고 나머지는 진행(전체 차단 X)"를 **"한 feature라도 경험 계약(프로토타입/면제)·상위 계약이 빠지면 *task를 하나도 쓰기 전에* 일괄 중단하고 어떤 feature가 왜 막혔는지 보고 — 부분 계획 금지(plan-milestone에서 계약 확정 후 같은 `M<N>` 재실행)"**로. *단, 이미 완결된 feature의 멱등 skip은 부분 계획이 아니라 재개다(아래).*
- **경험 계약 입구 안내(:13)**: 누락 시 기존 ``/plan-milestone M<N> --prototype F-NNN`` 안내를 제거하고 **"이 M은 확정 계약이 불완전하므로 task 0건 상태로 중단한다. 같은 draft `/plan-milestone M<N>`에서 프로토타입/면제를 완성한 뒤 다시 `/plan-workitem M<N>`"**으로 바꾼다. 이미 `ready`인 M에서 발견되면 plan-milestone을 자동 재호출하지 말고 상위 P0로 사용자에게 보고한다.
- **멱등 재개·완결 판정(:17)**: **완결 feature = 전 task 필수 섹션(`## 3` 구현항목·`## 6` AC·`## 9` 의존성) + feature `## 7-1` FAC↔AC 매핑 + (UI) `## 7-3` PX↔AC + (seam 신호 시) `## 7-2` INV + "남은 미결정 사항" 0건**이 *모두* 충족된 것만 skip한다. 하나라도 빠지면 *미완결* — 재개 시 **기존 task ID를 유지한 채 이어서 채운다**(부분 문서 재작성·중복 생성 금지). 컨텍스트가 끊기면 *같은 `/plan-workitem M<N>`* 재실행으로 재개(다른 명령·`F-NNN` 아님). feature 5+로 한 번에 못 끝내면 같은 `M<N>` 재실행으로 이어서(‘2회 분할 실행’ = 재개일 뿐 별도 모드 아님).
- **출력(:120) 단일 feature 조망 제거**: "(단일 feature 모드) 같은 milestone의 미분해 feature 목록 — 다음 `/plan-workitem` 대상 (ADR-057 결정 7)" 줄을 **삭제**한다(단일 feature 모드가 없다 — ADR-057#amend-3; ADR-057 결정 7의 조망 echo도 폐기).
- **열린 질문 영속 (결정 5 — "남은 미결정 사항" 출력 배선)**: plan-workitem의 "남은 미결정 사항"을 *대화 출력으로만* 두지 않는다 — 질문 발생 시 **소유 milestone `## 7 열린 질문` 또는 feature `## 12 열린 질문`에 1줄로 영속**(대화가 아니라 문서), 해결되면 **그 줄을 제거**(섹션엔 미해결만 — `resolved` 표시 문법 없음; 이력 필요 시 메모/결정 이력으로). **미해결 열린 질문이 하나라도 남으면 그 M의 task `ready` 승격을 막는다**(전 계획 성공이어도 미승격 — 별도 blocking 문법 없이 미해결=차단; 비차단 메모는 가정/메모에; 결정 5b·5). 재실행 시 *출력 기억이 아니라 그 섹션을 읽어* 판정한다(컨텍스트가 끊겨도 유지). plan-milestone의 `ready` 전환도 동일 섹션의 "미해결 열린 질문 0건"을 요구(§4.11).

**추가 — 의존성 계약(`## 9`) 정밀화 (ADR-057#amend-3 후행-task 전제 배선)**: 전체 스냅샷이라 후행 task는 선행 task의 *계획된* 완료 결과를 전제로 쓴다. plan-workitem이 `## 9. 의존성`을 채울 때 **선행을 `T-NNN:AC-M` 단위로 참조**한다(그 task가 보장할 AC/산출 명시 — 후행 `## 3`가 이 결과를 전제로 참조). 배치 시점 self-check에서 **(i) 누락 참조(존재하지 않는 선행 task), (ii) 의존성 그래프 순환, (iii) 후행 `## 3`가 전제한 산출이 선행 task의 참조 AC에 없음** 중 하나라도 있으면 plan-workitem을 성공 종료시키거나 task를 `ready`로 승격하지 않는다. 그 M을 미완으로 두고 원인을 보고하며, 수정 후 같은 M 실행으로 재검증한다. 독립 재확인은 validate-plan/reviewer **[Plan-dep]**(존재성·비순환·AC-보장 모두 P0). *구현 시점 재확인은 §4.12b preflight (c).*

**잔여 문구 정리 — 의존성 설치 line item(:198)**: `STACK_SETUP_PLAN.md ## Dependency Tools`를 "설치 line item 작성·`--refresh` 시" 읽는다는 문구를 **"전체 스냅샷에서 설치 line item을 작성할 때"** 읽는 것으로 바꾼다. 삭제된 refresh를 보조 규칙에서 되살리지 않는다.

**기존** (3-P 승인 프로토타입 참조 authoring):

```
3-P. **승인 프로토타입 참조 authoring (ADR-056 결정 3 — 이중 잠금 2/2)**:
   입력 feature가 UI 확정·비면제이면, feature `## 7`의 `프로토타입:` 참조 줄에서 화면 파일 경로를 회수해 읽고(UI 확정·비면제 한정 JIT — ADR-019 minimal 정합), 그 화면을 구현하는 *모든* UI task `## 3`에 프로토타입 참조 line item을 authoring한다(신규 요소 유무와 무관 — builder는 기계 실행). 형식: `- 구현 시 승인 프로토타입 참조 — <경로>의 <상태/섹션>과 동일 상태·문구로 구현 (AC-N)`.
```

**변경**: PX↔AC 매핑 + 전환 표 owner 행 소비를 덧붙인다:

```
3-P. **승인 프로토타입 참조 + PX↔AC 매핑 + 전환 흐름 authoring (ADR-056 결정 3·#amend-1·#amend-3 — 이중 잠금 2/2)**:
   입력 feature가 UI 확정·비면제이면, feature `## 7`의 `프로토타입:` 참조 줄에서 화면 파일 경로를 회수해 읽고(UI 확정·비면제 화면만 — ADR-019 minimal-context: 계획 시점 1회 읽기, draft 지연 아님), 그 화면을 구현하는 *모든* UI task `## 3`에 프로토타입 참조 line item을 authoring한다(신규 요소 유무와 무관 — builder는 기계 실행). 형식: `- 구현 시 승인 프로토타입 참조 — <경로>의 <상태/섹션>과 동일 상태·문구로 구현 (AC-N)`.
   - **PX↔AC 매핑 (ADR-056#amend-1)**: feature `## 7`의 `경험 결정(PX):` 인벤토리 각 PX를 그것을 구현하는 AC로 매핑해 feature `## 7-3. 프로토타입 경험(PX) ↔ AC 매핑`에 `PX-M<N>-<screen>-NN → T-NNN:AC-M`으로 기입한다(해당 AC 본문에 `(PX-M<N>-<screen>-NN)` 태그 가능). 어떤 AC도 참조하지 않는 PX(unmapped PX)는 "남은 미결정 사항"에 `- unmapped PX: <PX-M<N>-<screen>-NN> — 커버 task/AC 없음`으로 surface(unmapped FAC 패턴과 동형 — [Plan-FAC-coverage]가 재점검).
   - **전환 흐름 소비 (ADR-056#amend-3 — `## 9` 전환 표 존재 시)**: 마일스톤 `## 9. 화면 전환`에서 이 feature가 owner인 행을 회수해, 그 **존재하는 각 path type 행(primary·failure·recovery)**이 task AC로 커버되는지 확인한다(FEATURE §8-1 복구 흐름과 정합). 미커버 path는 "남은 미결정 사항"에 surface. `## 9`가 "(해당 없음)"이면 skip.
```

**기존** (seam self-check 배치 모드 줄 — L153):

```
- **배치 모드(M<N>)에서는 마일스톤 전체 task 집합 대상 1회 수행** — cross-feature invariant는 **낮은 번호 feature `## 7-2`에 canonical 기재 + 상대 feature `## 7-2`엔 참조 링크 1줄**(ADR-005 SSOT — 양쪽 본문 중복 금지).
```

**변경**:

```
- **배치 모드(M<N>)에서는 마일스톤 전체 task 집합 대상 1회 수행** — cross-feature invariant는 **① 데이터를 실제 소유(write-through)하는 feature → ② 애매하면 최초 사용 feature → ③ 그래도 불명확하면 낮은 번호 feature(결정적 fallback)** 순으로 canonical feature를 정해 그 `## 7-2`에 기재 + 상대 feature `## 7-2`엔 참조 링크 1줄(ADR-005 SSOT — 양쪽 본문 중복 금지; ADR-057#amend-2 소유 우선).
```

**refresh·retire 배선 없음 (ADR-057#amend-3 / ADR-056#amend-1)**: plan-workitem에 `--refresh` 모드·화면 폐기 재동기·PX revision 재동기 배선을 **두지 않는다**. 프로토타입은 `/plan-milestone M<N>` 확정 시점에 잠기므로 계획 후 재동기가 필요 없고(옛 revision·stale·retire 정리 개념 자체가 없음), 프로토타입·기획 변경은 다음 마일스톤(M<N+1>)에서 새 M<N>로 처리한다. 구현 중 계획과 *근본* 충돌이 드러나면 자동 재계획이 아니라 **사용자에게 중단·보고**(§4.5b amend-3 결정 3); 일반 오류(테스트·타입·프로토타입 불일치)는 repair. **plan-milestone 별도 `--prototype` 재진입 모드는 제거됐다(§4.11)** — 미완 R5는 같은 `/plan-milestone M<N>` 재실행으로 이어가고, `ready` 확정 후의 프로토타입·기획 변경은 다음 마일스톤(M<N+1>)에서 처리한다.

**추가 — 배치 출력에서 `draft` tier 제거 (ADR-057#amend-3)**: plan-workitem 마지막 출력의 `## 3` 상태 요약이 여전히 2-tier를 전제한다.

**기존** (`.claude/skills/plan-workitem/SKILL.md` 출력):

```
- (배치 모드) feature별 ## 3 상태 요약: full N개 / draft M개 (draft는 구현 직전 --refresh)
```

**변경**:

```
- (배치 모드) feature별 task·`## 3` 완성 요약: 전 feature full N개 (draft tier·refresh 폐기 — ADR-057#amend-3 전체 스냅샷; 계획 후 재접지 없음, 프로토타입·기획 변경은 다음 마일스톤)
```

## 4.12b implement-workitem — `draft` 하드스탑 → 경량 preflight (ADR-057#amend-3)

**배경**: base 2-tier가 폐기되면 `## 3 상태: draft` task가 더는 생기지 않으므로 implement-workitem의 `3-R. draft 가이드 하드스탑`(draft 마커에서 `Needs Plan Refresh`로 정지)은 죽은 분기가 된다. 사용자가 요구한 **task 실행-시점 경량 preflight**로 재정의한다 — draft 개념 없이, 그 task의 접지가 상위 변경으로 *실제* 어긋났을 때만 재접지를 안내(자동 재계획 아님).

**기존** (`.claude/skills/implement-workitem/SKILL.md` step 3-R):

```
3-R. **draft 가이드 하드스탑 (ADR-057 결정 4 / ADR-026#amend-3)**: task `## 3`에 `## 3 상태: draft` 문자열(HTML 주석 마커 내)이 있으면 **분할·dispatch를 시작하지 않고 `Needs Plan Refresh`로 즉시 종료**한다 — `/plan-workitem F-NNN --refresh` 실행을 안내(배치 분해된 가이드는 앞 feature 구현으로 낡았을 수 있다 — 낡은 before/after는 기계 실행 builder에 파괴적).
```

**변경**:

```
3-R. **접지 경량 preflight (ADR-057#amend-3 / ADR-026#amend-4 — base 결정 4·구 draft 하드스탑 대체)**: 계획은 `/plan-workitem M<N>` 전체 스냅샷이라 `## 3`는 이미 완성돼 있다(draft tier 없음). 분할·dispatch 전, 그 task의 접지가 여전히 유효한지만 *가볍게* 확인한다 — `## 3`가 참조하는 (a) 상위 계약(feature `## 7` FAC·`## 7-2` INV/seam·상위 ADR)과 (b) UI면 승인 프로토타입 경로가 **실제로 바뀌었거나 사라졌는지**, (c) 이 task `## 9. 의존성`의 **선행 task가 모두 done인지 + 선행이 약속한 산출(파일·인터페이스·AC)이 실제 존재하는지**(후행 `## 3`가 선행의 *계획된* 완료 결과를 전제로 쓰였으므로 — ADR-057#amend-3). 선행 task가 아직 done이 아니면 이 task는 의존순상 아직 dispatch 대상이 아니다(순서 대기 — 오류 아님). 어긋남이 **없으면 그대로 진행**(기본 경로 — 재계획 아님). 어긋남이 있으면 **원인별로 라우팅**한다 — (1) **선행 task가 done인데 약속한 산출(파일·인터페이스)이 없음**: 대개 그 *선행 task의 구현·검증 누락*이므로 **현재 M에서 그 선행 task를 repair→validate→finalize한 뒤 이 task 재시도**(current-M repair 라우팅 — 사용자 중단 아님). (2) **상위 기획·계약 자체가 틀림**(참조 프로토타입 경로 삭제·상위 `## 7`/INV 변경 등 계획 전제 붕괴): 그 task만 **중단하고 사용자에게 보고**(근본 충돌 — 자동 재계획·refresh 아님; §4.5b amend-3 결정 3, 변경은 다음 마일스톤). 일반 오류(테스트·타입·구현 누락·프로토타입 세부 불일치)는 중단 없이 repair. *`## 3 상태: draft` 문자열 검사·`Needs Plan Refresh`·refresh 안내는 하지 않는다*(draft 마커·refresh 개념이 없다).
```

**추가 (TASK_TEMPLATE — draft 마커 언어 제거, ADR-057#amend-3 surface)**:

**기존** (`docs/30-workitems/_templates/TASK_TEMPLATE.md` `## 3` 주석):

```
     배치 분해(ADR-057)된 뒤 feature의 task는 본 섹션이 의도 수준 초안 + 본문 첫 줄 draft 마커 HTML 주석일 수 있다(정확한 마커 문자열은 plan-workitem SKILL 배치 모드 단락이 SSOT) — implement는 draft 마커에서 Needs Plan Refresh로 정지한다(ADR-026#amend-3).
```

**변경** (그 줄을 전체 스냅샷 문구로 대체):

```
     `/plan-workitem M<N>`이 전 feature의 `## 3`를 한 번에 완성한다(ADR-026#amend-4 — `## 3` SSOT; ADR-057#amend-3 — draft tier 폐기; 의도-수준 draft 마커 없음). implement 진입 preflight는 draft 검사가 아니라 접지 유효성만 가볍게 본다(ADR-057#amend-3).
```

**왜**: JIT의 원래 목적(구현 시점 코드와 계획의 정합)을 *계획-지연*이 아니라 *실행 직전 값싼 확인*으로 옮긴다 — 완전 스냅샷을 유지하면서 stale 위험만 실행 경계에서 잡는다. base 결정 4·`ADR-026#amend-3`의 draft 하드스탑 문구는 **ADR-026#amend-4(§4.5c)가 정정 supersede**하고, implement-workitem 3-R은 그 접지 확인으로 재정의된다.

**AC 해석 모호성 경로 (`implement-workitem` 기존 Needs Plan Decision 블록 이동·안내 교체)**: AC 해석 점검을 builder 내부(Red 직전)에서 **메인 foreman의 dispatch 전 preflight**로 옮긴다. 그래야 신규 task가 아직 `ready`인 동안 판정되고, 모호한 task를 `in-progress`로 먼저 쓰지 않는다. 기존 ``/plan-workitem <id> 재실행(또는 /repair-plan <id>)`` 안내는 제거한다. (a) 그 M의 모든 task 상태가 아직 `draft|ready`이면 `/validate-plan M<N>` → `/repair-plan M<N>`으로 M 전체 task 계획을 검증·수정한다. (b) 하나라도 `draft|ready` 밖 상태면 계획 skill을 우회 호출하지 않고 **신규 대상은 `ready`를 유지한 채** 사용자에게 해석안 1~3개와 영향을 보고해 결정을 기다린다. 사용자가 명시적으로 선택한 경우에만 task `## 8. 메모`에 `해석 확정: AC-N = <선택>`을 기록하고 같은 `/implement-workitem T-NNN`을 재실행한다. 이미 `in-progress`인 중단 작업을 재개하다 새 모호성이 드러난 예외는 상태를 되돌리지 않고 `in-progress`를 유지한다. 이는 새 scope·자동 재계획이 아니라 잠긴 AC의 사용자 해석 확정이며, 에이전트가 임의 선택하지 않는다.

## 4.12c cross-surface — `--refresh`·`F-NNN` 계획 경로 정리 (ADR-057#amend-3)

2-tier/draft/refresh 폐기의 잔재가 lifecycle 산출·문서에 남아 있다. 아래를 정리한다. *(stabilize의 `--feature F-NNN`은 *계획*이 아니라 stabilize 스코핑이라 유지 — 여기서 건드리지 않는다.)*

**(a) finalize-workitem 다음-단계 제안** — **기존**:

```
   - 다음 단계 제안(텍스트만): 미-refresh feature 있으면 `/plan-workitem F-next --refresh`, FAC 시나리오 통합 확인 원하면 `/stabilize-milestone M-N --feature F-NNN`, 마일스톤 마지막 feature면 `/stabilize-milestone M-N`.
```

**변경**:

```
   - 다음 단계 제안(텍스트만): 다음 의존성 task가 있으면 그 task를 `/implement-workitem`, 마일스톤 전 task가 done이면 `/stabilize-milestone M-N` (refresh·F-NNN 재계획 경로 없음 — ADR-057#amend-3).
```

**(b) stabilize-milestone `[Spec-gap]` 다음-단계** — **기존**:

```
        - `[Spec-gap]` finding 있음: `/plan-workitem F-NNN` 으로 미커버 task 추가
```

**변경**:

```
        - `[Spec-gap]` finding 있음: 미커버 FAC를 분기 — (i) M-N이 *약속한* FAC의 구현 누락·버그이고 담당 task가 있으면 **현재 M-N에서 `/repair-workitem`(단일) 또는 `/repair-milestone`(교차)**; **담당 task 자체가 없으면**(정상적으론 plan-time `[Plan-FAC-coverage]` 100% 게이트가 막으므로 드묾) 현재 M-N의 미이행 약속으로 graduation `NO`를 유지하고 사용자에게 보고한다. 현재 M에 새 task를 자동·권장 생성하거나 FAC 취소로 거짓 통과시키지 않는다. 본 계약에 정해진 자동 해소 경로는 없으며 사용자 판단을 기다린다. (ii) *새 기능·기획 변경*(M-N 약속 아님)이면 다음 마일스톤(M-(N+1)), (iii) 계획이 근본적으로 잘못됐으면 자동 수정 없이 **사용자 중단·보고** (ADR-057#amend-3 결정 6 — F-NNN 재계획 경로 없음)
```

**(c) WORKFLOW.md 계획 진입 줄** — **기존**:

```
- 배치 분해는 `/plan-workitem M<N>`(2-tier + --refresh — ADR-057), 단일 feature는 `/plan-workitem F-NNN`.
```

**변경**:

```
- task 분해는 `/plan-workitem M<N>` 1회 **전체 계획 스냅샷**(2-tier/draft/refresh 없음, feature 단위 `F-NNN`·refresh 사용자 경로 없음 — ADR-057#amend-3).
```

**(d) DELEGATION_STRATEGY.md 7.5** — **기존**:

```
7.5. feature의 모든 task가 done이면 finalize가 FAC closure를 요약하고 다음 feature refresh 또는 `/stabilize-milestone M-N --feature F-NNN`을 제안한다 (ADR-057).
```

**변경**:

```
7.5. task가 done이면 finalize가 커밋하고 다음 의존성 task(implement) 또는 마일스톤 전 task done 시 `/stabilize-milestone M-N`을 제안한다 (feature refresh 없음 — ADR-057#amend-3).
```

**(e) PROJECT_START_CHECKLIST.md** — **기존**:

```
- [ ] `/plan-workitem M1`로 M1 전체 feature를 배치 분해했다 (또는 `/plan-workitem F-001` 단일)
```

**변경**:

```
- [ ] `/plan-workitem M1`로 M1 전 feature의 task를 1회 전체 계획했다 (전체 스냅샷 — `F-NNN` 단일·`--refresh` 없음, ADR-057#amend-3)
```

**(f) ADR-007 lifecycle 표(:26)** — **기존**:

```
| 3 | plan | `/plan-milestone`(모든 milestone+feature — M1 포함, ADR-057) · `/plan-workitem`(feature→task; `M<N>` 배치 모드 — ADR-057) | 메인 세션 (architect 위임) | milestone/feature 생성(plan-milestone — M1 포함) + task 분해(plan-workitem — 단일/배치) |
```

**변경**:

```
| 3 | plan | `/plan-milestone`(모든 milestone+feature — M1 포함, ADR-057) · `/plan-workitem M<N>`(마일스톤 전체 계획 스냅샷 — ADR-057#amend-3) | 메인 세션 (architect 위임) | milestone/feature 생성(plan-milestone — M1 포함) + task 분해(plan-workitem — `M<N>` 1회 전체) |
```

**(g) DELEGATION_STRATEGY.md(:99)** — **기존**:

```
3. `/plan-milestone` → (M1 포함) milestone + feature 문서 생성 (+UI: R5 프로토타입 라운드) / `/plan-workitem M<N>` → 마일스톤 배치 task 분해 (또는 `F-NNN` 단일; 구현 직전 `--refresh`)
```

**변경**:

```
3. `/plan-milestone` → (M1 포함) milestone + feature 문서 생성·확정 (+UI: R5 프로토타입 라운드) / `/plan-workitem M<N>` → 마일스톤 전체 계획 스냅샷 1회 (feature 단위 `F-NNN`·`--refresh` 없음 — ADR-057#amend-3)
```

**(h) repair-milestone(:80)** — **기존**:

```
- 다음 권장 액션: `/stabilize-milestone <M-N>` 재실행 (수정 반영 후 재검증 → 졸업 가능 = YES면 `/plan-milestone`로 다음 마일스톤(M-(N+1))+feature 생성 후 `/plan-workitem F-NNN`로 task 분해)
```

**변경**:

```
- 다음 권장 액션: `/stabilize-milestone <M-N>` 재실행 (수정 반영 후 재검증 → 졸업 가능 = YES면 `/plan-milestone`로 다음 마일스톤(M-(N+1))+feature 생성·확정 후 `/plan-workitem M-(N+1)`로 전체 계획)
```

**(i) stabilize-milestone 졸업 후 안내(:216)**: "이후 `/plan-workitem M-(N+1)` 배치 분해" 문구의 **‘배치 분해’를 ‘전체 계획 스냅샷(1회)’**로 바꾼다(진입 `M-(N+1)`은 이미 맞음 — 문구만 정정).

**(j) ADR-051 amend-3(:133) 단일 feature 모드 문구** — **기존**(마지막 문장):

```
plan-workitem의 feature→task 집중(D4 후단)은 ADR-057 결정 2의 배치 모드(M<N> 입력)로 보완된다(단일 feature 모드 유지).
```

**변경**:

```
plan-workitem의 feature→task 집중(D4 후단)은 ADR-057#amend-3의 `/plan-workitem M<N>` 전체 계획 스냅샷으로 대체된다(단일 feature 모드·refresh 폐기 — `M<N>` 1회만).
```

**(k) WORKFLOW.md 상태 전이(`## 문서 상태 전이`, :116) — 단일 역전이 등재**: 다이어그램의 `blocked`와 `done → deprecated` 사이에 **`done → in-progress (검증된 완료 결함을 repair-workitem이 재개방할 때만 — ADR-057#amend-3 결정 5)`** 한 줄을 추가한다. 바로 아래 상태 의미 표에도 같은 전이·조건·writer 행을 추가한다. **`ready → draft`는 추가하지 않는다**: 계획 review 수정은 첫 구현 전 `ready` 문서를 제자리에서 고치고 재검증하며, 상위 계약 P0는 자동 역전이 없이 사용자에게 보고한다.

**(l) STRUCTURE.md 프로토타입 producer** — `R5 (--prototype 재진입 포함)`을 **`R5 (draft M<N> 재실행으로 미완 라운드 재개)`**로 바꾼다. 산출물 인벤토리에서 폐기된 진입을 노출하지 않는다.

**(m) stabilize-milestone preflight FAC unmapped(:55)** — 기존 `P0 [Spec-gap] ... 기록 + 미커버 task 추가 권장`을 **`P0 [Spec-gap] ... 기록 + graduation NO 유지 + 사용자 보고`**로 바꾼다. 구현 후에는 plan-workitem으로 task를 자동 추가하지 않으며, 담당 task가 있으면 repair, 없으면 ADR-057#amend-3 결정 6의 사용자 명시 결정 경로를 따른다.

**(n) 잠금 뒤 후속 finding 라우팅 전수 정리 (ADR-057#amend-3 결정 6)** — 아래 기존 문구는 모두 현재 M에 계획되지 않은 task를 뒤늦게 넣거나 M 아닌 인자로 plan-workitem을 호출할 수 있으므로 정확히 교체한다.

- `WORKFLOW.md:42`의 "다음 `/plan-workitem` 또는 `/stabilize-milestone`이 상위 문서 sync용 후속 task로 연결"을 **"`/stabilize-milestone`이 회수한다. 기존 task 약속의 누락이면 그 task repair, cross-cutting이면 repair-milestone, 새 범위면 사용자 보고 후 다음 M 후보"**로 바꾼다. 현재 M task 자동 생성은 하지 않는다.
- `review-doc/SKILL.md:42,54`의 generic `/plan-workitem`·`/plan-workitem <id>` 라우팅을 제거한다. workitem finding은 **구현 전 task·매핑·의존성 결함이면 `/validate-plan M<N>`→`/repair-plan M<N>`, M/F/prototype 계약 결함이면 사용자 보고, 구현 시작 뒤 기존 약속 결함이면 소유 task repair, 담당 task 없음·새 범위면 사용자 보고+다음 M 후보**로 분기한다. review-doc은 계속 report-only다.
- `stabilize-milestone/SKILL.md:90`의 "다음 `/plan-workitem`이 후속 task로 회수"를 제거하고 결정 6 분기를 쓴다. `:128` 탐색 QA 결함도 기존 소유 task repair/cross-cutting repair-milestone으로 보내며 **담당 없는 새 범위만** 다음 M 후보로 보고한다. `:157` open insight는 `/plan-workitem`이 아니라 **다음 `/plan-milestone` 후보**다. `:216`은 다음 M을 확정한 뒤 `/plan-workitem M-(N+1)` 전체 스냅샷만 안내하고, `:221` Spec-gap의 `F-NNN` task 추가는 §4.5d 문구로 교체한다.
- `repair-milestone/SKILL.md:47`의 큰 architecture debt "후속 task 제안"은 **현재 M 약속 위반이면 본 라운드 cross-cutting repair, 새 구조 범위면 사용자 보고+다음 M 후보**로 바꾼다. 현재 M에 새 task를 제안하지 않는다.
- `validator.md:48`·`validate-workitem/SKILL.md:70`의 `[Design-inventory-planless] ... plan 보강 권장/다음 plan 라운드`를 **기존 task AC에 필요한 컴포넌트면 repair-workitem이 구현 또는 DESIGN 등록 누락을 고치고(잠긴 task 계획을 사후 조작하지 않음), 불필요한 컴포넌트면 제거, 새 디자인 범위면 사용자 보고+다음 M 후보**로 바꾼다.
- 선행 단계의 모호한 generic 안내도 명령 계약과 맞춘다. `bootstrap-design:204,222`·`WORKFLOW.md:11`·`stack-guard:93`은 **M/F가 아직 없으면 plan-milestone, 확정된 ready M에 task 0/draft가 있으면 `/plan-workitem M<N>`, 이미 구현 중이면 해당 task workflow 또는 다음 M**으로 쓴다. `repair-discovery:27`의 "기존 feature면 plan-workitem"은 제거하고 discovery/charter 변경을 draft M 재검토 또는 다음 M으로 보낸다. `bootstrap-stack:69,75`·`DELEGATION_STRATEGY.md:127`의 migration/T3는 즉시 generic plan-workitem을 호출하지 않고 **다음 plan-milestone의 범위에 포함한 뒤 그 M 전체 snapshot에서 task화**한다(아직 계획 전인 draft M이면 그 안에서 반영).

위 (n)에서 새로 ADR-057 `## Surfaces`에 들어가는 파일(`review-doc`·bootstrap/stack 계열·repair-discovery 등)의 교체 문장에는 **`ADR-057#amend-3` 역참조를 최소 1회 명시**한다. 규칙만 복사하고 출처 토큰을 빼서 `[Surface-backref]`가 실패하지 않게 한다.

## 4.12d 잠금 상태기계·의존성 배선 (ADR-057#amend-3 결정 5 · [Plan-dep])

상태기계(`draft → ready → in-progress → done`)를 실제 문서·skill에 배선한다(선언을 cross-session 강제로).

**(a) MILESTONE_TEMPLATE·FEATURE_TEMPLATE `## 0. Status`** — 값 주석 신설(두 템플릿 공통):

**기존**:

```
## 0. Status
draft
```

**변경**:

```
## 0. Status
draft
<!-- 값은 헤딩 바로 다음 줄(위)에 둔다 — 주석은 값 *뒤*(finalize 등 "헤딩+1=상태값" 파서 보호). draft(계획 중) → ready(plan-milestone 확정 재대조 통과·잠금). M·feature는 이 단방향만 쓴다 — 완료 판정은 graduation(`## 8` 회고)이 담당하고 stabilize는 M `## 0. Status`를 바꾸지 않는다. ready 뒤 상위 계약 변경은 다음 마일스톤이 기본이고, 현재 M 진행 불가 P0는 자동 역전이 없이 사용자 보고. plan-workitem은 M·산하 feature가 모두 ready일 때만 동작. ADR-057#amend-3 결정 5. -->
```

**(b) TASK_TEMPLATE `## 0. Status`** — `in-progress` 추가:

**기존**:

```
## 0. Status
draft
```

**변경**:

```
## 0. Status
draft
<!-- 값은 헤딩 바로 다음 줄(위)에 둔다 — 주석은 값 *뒤*("헤딩+1=상태값" 파서 보호). draft(계획 작성 중) → ready(전 M 계획+[Plan-dep] 성공 시 plan-workitem이 승격) → in-progress(모든 preflight 통과 뒤 implement dispatch 직전) → done(finalize). 유일한 역전이: 검증된 완료 결함을 repair-workitem이 Adopt/Adopt-modified한 경우의 `done → in-progress`. implement는 ready 신규 착수/in-progress 재개만, finalize는 in-progress만 done. ADR-057#amend-3 결정 5. -->
```

**(c) TASK_TEMPLATE `## 9. 의존성` 형식** — `T-NNN:AC-M` 참조(ADR-026#amend-4):

**기존**:

```
## 9. 의존성
<!-- 자연어 1줄로 선행 task를 선언한다: `- T-002: T-001의 X 정의 후 시작 가능`. 비어 있으면 선행 의존 없음.
     plan-workitem이 본 선언을 읽어 분해 결과 매트릭스의 의존성 컬럼을 채운다. 단순 순차 진행 기준이며 별도 형식을 강제하지 않는다. -->
```

**변경**:

```
## 9. 의존성
<!-- 선행 task를 그 task가 보장할 AC 단위로 참조: `- T-002 ← T-001:AC-2 (인증 인터페이스 정의)`. 비어 있으면 선행 의존 없음.
     후행 `## 3`는 이 선행 결과를 전제로 작성한다(ADR-057#amend-3 후행-task 전제). plan-workitem이 본 선언을 읽어 의존성 컬럼을 채우고, **누락 참조·순환은 성공 종료를 막는다**(실행 순서 부재). -->
```

**(d) implement-workitem — `ready → in-progress` (착수 게이트·기록 순서)**: `/implement-workitem`은 **① 같은 M에 `draft` task 없음**(승격 완료), **② 대상 task=`ready`(신규) 또는 `in-progress`(재개)**(`done` 거부), **③ 대상 선행 task 모두 `done`**, **④ 부모 milestone·feature 모두 `ready`**, **⑤ `docs/40-validation/plan-reviews/`에 해당 M 또는 산하 F/T의 미해결 review 파일 없음**, **⑥ milestone `## 7`·산하 feature `## 12` 미해결 열린 질문 0건**, **⑦ 대상 AC의 구현을 실질적으로 갈라놓는 미확정 해석 0건**을 확인한 뒤 3-R에서 선행 약속 산출·상위 계약 경로까지 검사한다. ⑦은 기존 builder 내부 Needs Plan Decision 판정을 이 위치로 옮긴 것이며, task `## 8`의 기존 `해석 확정`을 먼저 읽는다. **모든 상태·접지 preflight가 통과한 뒤, partition/dispatch 직전에만** 신규 대상을 `ready → in-progress`로 갱신한다. 선행 미완·선행 산출 누락·상위 전제 붕괴·plan review·열린 질문·AC 해석 미해결로 dispatch하지 않으면 신규 대상은 `ready` 유지; 이미 `in-progress`인 재개 호출은 상태를 다시 쓰지 않는다. 이 기록이 다른 세션의 계획 잠금 판정 근거다.

**(e) plan-workitem·repair-plan — 첫 구현 전 수정, 구현 후 잠금**: 입력이 M/F/T 어느 것이든 먼저 부모 `M<N>`을 해석하고 **부모 M 문서 + 산하 전 feature/task**를 읽는다. 부모 M의 task 상태가 하나라도 `draft|ready` 밖(`in-progress`·`blocked`·`done`·`deprecated`)이면 `/plan-workitem`·`/repair-plan`은 계획 변경을 거부하고 "구현 시작/종료 상태 — 현재 M 계획 잠금; 새 요구는 다음 M, 현재 계획으로 진행 불가한 근본 문제는 사용자 중단·보고"로 종료한다(F/T 입력으로 M 잠금을 우회 금지). 구현 전에는 `/repair-plan`이 review의 task·매핑·의존성 결함을 **현재 `ready` 문서에서 직접 수정**하고, 입력 ID의 하위 범위만이 아니라 **부모 M 전체** self-check + `[Plan-dep]`를 다시 통과시킨다(`ready → draft` 역전이 없음). frontmatter `description`·역할 줄의 "수정 후 리뷰 파일 삭제"도 **"아래 성공 조건을 모두 통과한 뒤 삭제"**로 고친다. 처음 회수한 review 파일은 (i) 모든 finding 4-판정·반영 완료, (ii) 부모 M 전체 self-check+[Plan-dep] 성공, (iii) 미해결 열린 질문 0건일 때만 삭제한다. 하나라도 실패하거나 실행이 중단되면 review 파일을 그대로 보존해 미해결 상태를 영속하며, implement는 해당 M 또는 산하 F/T의 미해결 plan-review가 있으면 착수하지 않는다. M/F/prototype 자체 P0는 repair-plan이 자동 수정·재개방하지 않고 사용자에게 사실·영향을 보고한다. **기본 경로는 다음 마일스톤이며, 본 계약에는 현재 M 재개방 명령·상태 전이를 두지 않는다**(사용자 판단이 필요한 예외를 에이전트가 lifecycle로 발명하지 않음).

**(f) validate-plan / reviewer `[Plan-dep]` 차원 *확장* (신설 아님)**: `[Plan-dep]`는 이미 validate-plan(`## 9` 누락/잘못된 병렬)·reviewer의 **차원 6**으로 존재하고 카운트 표 행도 있다 — **신설·행 추가 금지(중복)**. 기존 6번 문구를 `M<N>` 입력 시 task `## 9` 의존성 그래프의 **존재성**(참조 선행 task 실재) · **비순환**(순환=실행 순서 부재) · **AC-보장**(후행 `## 3`가 전제한 선행 산출이 그 선행 task의 참조 AC에 존재)까지 검사하도록 **확장**한다. 세 위반 모두 **P0**(실행 가능한 계획 미완 — plan-workitem 성공·task ready 승격 차단과 정합). reviewer.md 6번 미러 동일 문구. **전체 차원 수(11) 불변**.

**(g) finalize-workitem — `in-progress → done` 입구 게이트**: `/finalize-workitem`은 입력 task가 **`in-progress`일 때만** `done`으로 전환한다 — `draft`/`ready`(구현 안 함)면 "`/implement-workitem` 먼저" 안내 후 종료(**`ready → done` 건너뛰기 차단** — 구현 없이 validate·finalize만으로 done 방지), `done`이면 read-only no-op("이미 완료"). 다중 task 입력이면 **하나라도 상태가 틀리면 파일·git index·status를 전혀 건드리지 않고 일괄 중단**(부분 커밋·부분 staging 방지). **삽입 위치(정확)**: task 문서를 읽은 **직후** — 통합 검증·`git status`·staging(현 finalize step 4~5)보다 *먼저*, status 갱신(step 6)보다도 먼저. (step 6 직전이 아니다 — 그러면 이미 staging된 뒤라 늦다.)

**(h) `done` task 재개방 (유일한 역전이·writer 고정)**: `done` task의 검증된 결함은 실제 task를 수정하는 `/repair-workitem`만 재개방한다. 상태별 입구는 `draft`/`ready`=구현 전이므로 repair 거부, `in-progress`=일반 repair, `done`=아래 한정 절차다. report가 없고 implement preflight가 선행 산출 누락을 직접 관측했다면 호출자가 **`/repair-workitem T-NNN "<관측한 finding>"`**으로 finding-mode 근거를 넘긴다. repair-workitem은 기존 report/finding을 먼저 읽고 4-판정한 뒤, Adopt/Adopt-modified가 하나 이상일 때만 **첫 코드 수정 직전에** `done → in-progress`를 기록한다. 전부 Reject면 코드·status 무변경, 재개방 뒤 중단·실패면 `in-progress` 유지, 수정 후 fresh `/validate-workitem` Pass를 거쳐 `/finalize-workitem`이 다시 `done`으로 커밋한다. `/repair-milestone`은 ADR-052 D4대로 status를 직접 쓰지 않고 per-task 결함을 위 명령으로 위임한다. cross-cutting 수정은 기존처럼 repair-milestone 직접 수정 + 사용자 커밋이며 task status와 연결하지 않는다.

## 4.13 validate-plan + reviewer — [Plan-FAC-coverage] PX 확장 (INST-1) + [Plan-design] recovery path (DS-4)

**기존** (`.claude/skills/validate-plan/SKILL.md` 차원 5):

```
5. **[Plan-FAC-coverage]** — feature `## 7-1. FAC ↔ AC 매핑표`의 unmapped FAC. P0 권장.
```

**변경**:

```
5. **[Plan-FAC-coverage]** — feature `## 7-1. FAC ↔ AC 매핑표`의 unmapped FAC + (UI feature) feature `## 7-3. PX ↔ AC 매핑`의 unmapped PX(ADR-056#amend-1 — 어떤 AC도 참조 안 한 경험 결정) + **PX 소유·문법 (구조 — `M<N>` 입력 전용, task 수 무관)**: `M<N>` 입력이면 **`docs/20-system/prototypes/M<N>/*.html` glob**(`_drafts/` 제외)로 현재 active 화면 HTML 전체를 회수해 — ① **각 active 화면에 PX ≥1개** · ② **id 문법·화면 경로 일치**(`^PX-M<N>-<screen>-\d{2,}$`; id의 `M`/`<screen>`이 파일 경로 `M<N>/<screen>.html`와 일치 — 화면 revision 없음, 마일스톤 번호가 버전) · ③ **한 화면 HTML 내 id 중복 없음** · ④ **승인 HTML active PX = 모든 feature `## 7` 인벤토리의 disjoint union**(**orphan**=HTML엔 있으나 미인벤토리 · **중복**=2+ feature · **누락**=인벤토리엔 있으나 HTML엔 없음 — 완전-orphan HTML도 glob이 잡음, R5-5 이후 drift까지 검출; 매핑 `## 7-3`과 별개) · ⑤ **각 active PX 정확히 1 feature `## 7`에** · ⑥ **HTML 마커 ↔ feature 인벤토리는 `(id, 설명)` 쌍으로 정확 일치**(같은 id인데 설명이 다르면 mirror drift = fail — 현재 HTML 미러 drift 검사) · ⑦ **task `## 6`의 `(PX-…)` 태그는 선택이지만 *존재하면* 그 `(PX, task:AC)`가 feature `## 7-3` 매핑 RHS와 일치**(태그가 매핑과 다른 task:AC를 가리키면 태그-매핑 불일치 = P1) — 를 검사한다. **`F`/`T` 단독 입력은 sibling·glob 미독이라 이 cross-feature 검사 skip(P0 금지)**. **task 0건이라도 `M<N>` 입력이면 위 소유·문법 검사는 실행**(M입력은 feature 전체·HTML을 읽으므로 가능 — task 산물 부재는 PX↔AC coverage만 유예). *귀속 feature 적합성은 LLM 판정(엉뚱한 feature면 오배정)*. P0 권장.
```

**기존** (`.claude/agents/reviewer.md` Plan Quality 차원 5 — 미러):

```
5. **[Plan-FAC-coverage]** (ADR-037) — feature `## 7-1. FAC ↔ AC 매핑표`의 unmapped FAC / 누락 매핑. (P0 권장)
```

**변경**:

```
5. **[Plan-FAC-coverage]** (ADR-037 / ADR-056#amend-1) — feature `## 7-1. FAC ↔ AC 매핑표`의 unmapped FAC / 누락 매핑 + (UI feature) feature `## 7-3. PX ↔ AC 매핑`의 unmapped PX(어떤 AC도 참조 안 한 프로토타입 경험 결정) + **PX 소유·문법 (구조 — `M<N>` 입력 전용, task 수 무관)**: `M<N>`이면 `prototypes/M<N>/*.html` glob(`_drafts` 제외)로 — 각 active 화면 PX ≥1 · 문법·경로 일치(`^PX-M<N>-<screen>-\d{2,}$` — 화면 revision 없음) · HTML 내 중복 id 없음 · **HTML active PX = 인벤토리 disjoint union**(orphan·중복·누락, 완전-orphan HTML도 glob이 잡음) · 각 active PX 1 feature · **HTML 마커 ↔ 인벤토리 `(id, 설명)` 정확 일치**(같은 id인데 설명 다르면 mirror drift=fail) · **task `## 6` `(PX-…)` 태그 존재 시 `## 7-3` 매핑 RHS와 일치**(불일치=P1) — 검사(validate-plan ①~⑦ 미러). **`F`/`T`는 skip(sibling·glob 미독). task0이라도 M입력이면 실행**(coverage만 유예). *귀속 적합성=LLM 오배정 판정*. (P0 권장)
```

**추가 — milestone-mode 반전을 PX에도 확장 (F9 — 거짓 P0 방지)**: [Plan-FAC-coverage]를 unmapped PX까지 P0로 확장했으므로, milestone-mode(task 0건 — plan-milestone 직후·plan-workitem 미실행) 반전도 PX를 포함해야 한다. 안 그러면 R5-5가 PX 인벤토리만 채우고 plan-workitem 전이라 `## 7-3` PX↔AC 매핑이 비어 있는 정상 상태가 P0로 폭주한다. **validate-plan과 reviewer.md 양쪽의 milestone-mode 반전 문구를 동일하게 고친다**:

**기존** (`.claude/skills/validate-plan/SKILL.md` milestone-plan mode):

```
- **[Plan-FAC-coverage] 반전**: `## 7-1` 빈 shell은 *정상* — unmapped FAC를 P0로 올리지 **않는다**. shell이 *형식적으로 깨졌을 때만* P2.
```

**변경**:

```
- **[Plan-FAC-coverage] 반전**: `## 7-1`(FAC) *및 `## 7-3`(PX)* 빈 shell은 *정상* — task 0건이면 unmapped FAC·**unmapped PX**를 P0로 올리지 **않는다**(R5-5가 PX 인벤토리만 채우고 plan-workitem 전이라 PX↔AC 매핑이 비어 있는 게 정상 — ADR-056#amend-1). shell이 *형식적으로 깨졌을 때만* P2.
```

> reviewer.md의 milestone-mode 게이팅 문장("빈 `## 7-1` shell은 정상이므로 unmapped FAC를 P0로 올리지 않고…")에도 같은 취지로 "및 `## 7-3` PX 빈 매핑" 을 더한다(미러 동기).

**기존** (`.claude/skills/validate-plan/SKILL.md` 차원 9 — **§3.14에서 이미 category/a11y로 바뀐 상태**):

```
9. **[Plan-design]** (UI 한정 — DESIGN.md 부재 시 skip) — DESIGN.md `## 7` 인벤토리 외 컴포넌트 신설 / raw hex / Don'ts 위반 / task use-case 에 등장하는 category state(§7 — interactive/data/static)가 AC 에 누락 / **AC·task 본문의 색-단독·포커스 제거·아이콘 라벨 누락 = §9 a11y 위반 의심**(ADR-027#amend-7) / **UI task 카피가 DESIGN.md §10 위반·미참조** (ADR-056). P1 권장.
```

**변경**: DS-4 recovery path 절을 §10 절 앞에 삽입한다:

```
9. **[Plan-design]** (UI 한정 — DESIGN.md 부재 시 skip) — DESIGN.md `## 7` 인벤토리 외 컴포넌트 신설 / raw hex / Don'ts 위반 / task use-case 에 등장하는 category state(§7 — interactive/data/static)가 AC 에 누락 / **AC·task 본문의 색-단독·포커스 제거·아이콘 라벨 누락 = §9 a11y 위반 의심**(ADR-027#amend-7) / **마일스톤 `## 9. 화면 전환`(있으면) owner의 존재하는 각 path type 행(primary/failure/recovery)이 프로토타입·AC에 존재**(ADR-056#amend-3) / **UI task 카피가 DESIGN.md §10 위반·미참조** (ADR-056). P1 권장.
```

> 주의: reviewer.md의 `[Plan-design]`(§3.13에서 category/a11y로 바뀐 상태)에도 DS-4 recovery path 절을 같은 문구로 더한다(미러 동기). reviewer.md `[Plan-design]` 문단 끝의 `/ **UI task 카피가 …** (ADR-056) (P1 권장)` 앞에 `/ **마일스톤 ## 9 화면 전환(있으면) owner의 존재하는 각 path type 행(primary/failure/recovery)이 프로토타입·AC에 존재**(ADR-056#amend-3)`를 삽입.
>
> **milestone-mode 가드 (F9와 동형 — 거짓 P1 방지)**: 이 recovery-path 절의 "…**·AC**에 존재" 절반은 plan-workitem이 AC를 만든 뒤에만 성립한다. task 0건(plan-milestone 직후 milestone-mode)에서는 **프로토타입 존재만 확인하고 AC 커버 절반은 유예**한다 — `## 9` 전환 표의 존재하는 각 path type 행(primary/failure/recovery)이 승인 프로토타입에 나타나는지만 보고, AC 매핑 미비는 P0/P1로 올리지 않는다(정상 상태). AC 커버는 plan-workitem 후 정상 모드 재점검에서 확인. validate-plan·reviewer.md 양쪽 milestone-mode 문구에 이 유예를 명시(F9의 `## 7-3` PX 유예와 같은 절에 한 줄 추가).

**왜**: coverage 차원(dim 5)을 PX까지 확장하되 *차원 개수를 안 늘려* reviewer 미러·카운트 표를 건드리지 않는다(INST-1 최소 침습). recovery path는 [Plan-design]에 흡수(DS-4).

## 4.14 stabilize-milestone — raw-hex 토큰 예외 (INST-2) + graduation 영속 (RD-1)

**기존** (`.claude/skills/stabilize-milestone/SKILL.md` §5-2 raw hex grep):

```
   5-2. **UI 프로젝트 — raw hex grep** (정규식 deterministic): 5-0 에서 회수한 변경 파일 목록 중 확장자가 `.tsx`/`.jsx`/`.ts`/`.js`/`.vue`/`.svelte`/`.astro`/`.css`/`.scss`/`.html` 인 파일에서 `#[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?` 패턴 grep. 일치 발견 시 IMPROVEMENT_GUIDE 에 `P1 [Design-rawhex] <file:line> — DESIGN.md ## 2 token 으로 교체 권장` 기록. **DESIGN.md 자체 파일과 `docs/20-system/prototypes/` 하위는 grep 대상 *제외*** (token 정의 영역·자기완결 프로토타입 — false positive 회피, ADR-056 결정 7).
```

**변경**: 토큰 정의 예외를 추가한다:

```
   5-2. **UI 프로젝트 — raw hex grep** (정규식 deterministic): 5-0 에서 회수한 변경 파일 목록 중 확장자가 `.tsx`/`.jsx`/`.ts`/`.js`/`.vue`/`.svelte`/`.astro`/`.css`/`.scss`/`.html` 인 파일에서 `#([0-9A-Fa-f]{8}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{3})\b` 패턴 grep(ERE — 3·4·6·8자리 hex 전부; `\b`로 더 긴 hex 런의 부분매치 방지. 구 `{3}([0-9A-Fa-f]{3})?`는 4자리 `#RGBA`·8자리 `#RRGGBBAA`를 놓쳤다). 일치 발견 시 IMPROVEMENT_GUIDE 에 `P1 [Design-rawhex] <file:line> — DESIGN.md ## 2 token 으로 교체 권장` 기록. **제외 (ADR-056#amend-2 — 정의/사용처 라인 구분)**: (a) DESIGN.md 자체 파일, (b) `docs/20-system/prototypes/` 하위(자기완결 프로토타입), (c) **CSS custom property *정의* 라인**(`--<name>: #hex` 형태 — 토큰 정의는 정상; dogfood `src/index.css :root` 오탐 해소). **파일명(`theme`/`tokens` 등)으로 파일 전체를 빼지 않는다**(사용처 위반 은폐 방지 — 정의/사용처는 (c) 라인 형태로만 구분). 검사 대상은 정의 밖 *사용처*(`color:#hex`·`background:#hex` 등) raw hex — 전면 `:root` 제외 금지.
```

**기존** (§1.5 graduation pre-check 판정 출력):

```
판정 출력:
- 미충족 항목 발견 시 `졸업 가능: NO` + 미충족 항목 목록을 출력하고 *조기 종료 옵션*을 사용자에게 제시한다(강제 종료 아님).
- 모든 항목 충족 시 `졸업 가능: YES` 출력 후 다음 단계 진행.
- `--dry-run` 플래그가 켜져 있으면 위 평가만 돌리고 즉시 종료(qa·reviewer 위임 단계 4~6 생략).
```

**변경**: graduation 판정을 회고에 영속하는 규정을 추가한다(단, 회고 자동 채움 시점에 기록 — read-only 계약 유지):

```
판정 출력:
- 미충족 항목 발견 시 `졸업 가능: NO` + 미충족 항목 목록을 출력하고 *조기 종료 옵션*을 사용자에게 제시한다(강제 종료 아님).
- 모든 항목 충족 시 `졸업 가능: YES` 출력 후 다음 단계 진행.
- **graduation은 §1.5에서 기록하지 않는다 — §1.5는 pre-check일 뿐**. 단계 4~6(qa·reviewer 팬아웃)이 *새 P0를 찾을 수 있으므로*, 최종 graduation(`YES|NO|BLOCKED (날짜)`)은 **단계 8 회고 자동 채움 시점에 최종 P0로 1회만** 기록한다(아래 회고 항목 정의 + 단계 8). 여기서 '최종 P0'는 **ADR-014 predicate 그대로 `QA_FINDINGS.md`의 본 마일스톤 `### P0` 미해소 0건**을 뜻한다 — 단계 4~6 중 **qa 팬아웃이 발견한 P0만 6-S에서 `QA_FINDINGS.md`에 기록되어** 이 predicate에 반영된다(**reviewer finding은 `IMPROVEMENT_GUIDE.md`로 가는 report-only — graduation predicate에 미반영**, stabilize §6-S 라우팅). preflight/reviewer finding을 *별도 predicate로* 세지 않는다(단일 predicate — ADR-014와 stabilize §1.5가 동일 기준). §1.5에서 조기 기록하면 이후 발견된 P0를 못 반영해 잘못된 YES가 박힌다.
- `--dry-run` 플래그가 켜져 있으면 위 평가만 돌리고 즉시 종료(qa·reviewer 위임 단계 4~6 생략 — 회고 미기록, graduation 판정 보류).
```

**기존** (stabilize 도입부 회고 항목 정의):

```
3. milestone 문서의 `## 8. 회고` 섹션 자동 채움 ([ADR-014](../../../docs/90-decisions/boilerplate/ADR-014-milestone-graduation.md) graduation contract — status 변경 X, 본문 단락 갱신만).
   - 회고 본문 4 항목: 목표 달성도 / scope creep / 비목표 위반 / 핵심 학습 3개 이내.
```

**변경**:

```
3. milestone 문서의 `## 8. 회고` 섹션 자동 채움 ([ADR-014](../../../docs/90-decisions/boilerplate/ADR-014-milestone-graduation.md) graduation contract — status 변경 X, 본문 단락 갱신만).
   - 회고 본문: **graduation 줄(`YES|NO|BLOCKED (날짜)` — 단계 8 판정 영속, ADR-057#amend-1)** + 4 항목: 목표 달성도 / scope creep / 비목표 위반 / 핵심 학습 3개 이내.
```

**기존** (stabilize `책임 경계` — 회고 채움 줄):

```
책임 경계:
- 코드 수정·커밋·workitem status 변경 금지.
- 누적 문서 갱신 + milestone `## 8. 회고` 자동 채움.
```

**변경**: 회고 채움 시점에 graduation을 최종 P0로 기록하도록 명시한다:

```
책임 경계:
- 코드 수정·커밋·workitem status 변경 금지.
- 누적 문서 갱신 + milestone `## 8. 회고` 자동 채움 — **회고의 `graduation:` 줄은 단계 4~6 종료 후 graduation 5+1 기준 *전체를 최종 상태로 재판정*해 기록**(P0 기준은 `QA_FINDINGS.md`의 미해소 P0만 — qa 팬아웃分; reviewer는 report-only로 미반영)(task status·통합 validate·e2e·AC 매핑 100% = 단계 3 결과 + P0 0건 = 단계 4~6 반영 + 추가 기준; YES|NO|BLOCKED+날짜; §1.5 사전점검이 아니라 여기서 확정 — ADR-057#amend-1·ADR-014). 로드맵 파일은 안 건드린다(다음 plan-milestone R0가 이 줄을 읽어 재조정).
```

**왜**: stabilize는 로드맵을 직접 안 쓰고 graduation 판정만 회고에 남긴다(read-only 계약 유지). 그 줄을 다음 plan-milestone R0가 읽어 로드맵을 재조정 — 단일 작성자 규율이 안 깨진다. **판정 시점은 단계 4~6 뒤**라 이번 라운드가 찾은 P0까지 반영된다(§1.5 조기 기록 금지).

**같은 커밋의 인덱스·surface·메타 동기**:

1. `docs/90-decisions/boilerplate/README.md`에서 ADR-056 amend 1~3, ADR-057 amend 1~3, ADR-014 amend-3(graduation 영속), ADR-026 amend-4, ADR-037 amend-3을 본문과 같은 번호·요약으로 갱신한다. ADR-057 요약은 `M 단위 전체 계획 스냅샷·잠금`, ADR-037 요약은 `plan ready gate + 구현 후 Spec Gap 사용자 결정`을 반영한다.
2. base `## Surfaces`에 실제 신규 surface만 추가한다: ADR-056=`TASK_TEMPLATE`; ADR-057=`ROADMAP`·`MILESTONE_TEMPLATE`·repair-workitem/milestone·review-doc·bootstrap-design/stack·stack-guard·repair-discovery·PROJECT_START_CHECKLIST·ADR-037; ADR-026=`implement-workitem`; ADR-037=`validate-plan`·`reviewer`. 각 파일의 역참조도 같은 커밋에서 확인한다.
3. ADR-058 `## Surfaces`에 이번 Phase에서 실제 게이트 caller가 된 `.claude/skills/plan-milestone/SKILL.md`를 추가한다. Phase 1에서 미리 등재하지 않는다.
4. `docs/00-meta/STRUCTURE.md` 산출물 표에 ROADMAP 행을, Canonical Owner 표에 로드맵 SSOT 행을 추가한다. `docs/00-meta/WORKFLOW.md`에도 plan-milestone 단일 작성자·R3 기록·R0 graduation 재조정 규칙을 같은 커밋에서 반영한다.
   ```
   | milestone roadmap | `docs/30-workitems/ROADMAP.md` | `/plan-milestone` (R3 생성/갱신, R0 재조정 — 단일 작성자) | Living | baseline |
   | 마일스톤 로드맵 SSOT (Done/Now/Next/Later forward 지도) | [ADR-057](../90-decisions/boilerplate/ADR-057-planning-v2-batch-and-seam.md)#amend-1 (정책 SSOT). 파일: `docs/30-workitems/ROADMAP.md` (단일 작성자 = plan-milestone). |
   ```
   WORKFLOW `## 3. 작업 단위 분해`에는 다음 줄을 추가한다.
   ```
   - `/plan-milestone`은 `docs/30-workitems/ROADMAP.md`(Done/Now/Next/Later forward 지도)를 단독으로 유지한다 — **R3에서 현재(Now) 행 + 미래 후보(Next/Later) 기록(candidate-key 포함), R0에서 회고 `graduation:` 기반으로 Done/Now 재조정**(직전 Now 행의 Done 전환은 **R0가 담당** — R3는 강제하지 않음; candidate-key는 전 구간 보존) (ADR-057#amend-1). 예정(Next/Later) 행은 "목표 1줄 + 확신도"만 둔다.
   ```
   같은 파일의 `/bootstrap-design` 흐름 문장 후반도 새 잠금 모델에 맞춘다: draft M은 `/plan-milestone M<N>`으로 재개하고, `ready` M은 `/plan-workitem M<N>` 전체 스냅샷으로 진행하며, 구현 시작 뒤 변경은 다음 M을 따른다고 명시한다(ADR-057#amend-3). Phase 1-B에서 이미 바꾼 ADR-058 디자인 흐름 전반은 보존한다.
5. `ROADMAP.md`·템플릿·skill·ADR·인덱스·STRUCTURE·WORKFLOW 중 하나라도 빠지면 Phase 4 커밋을 만들지 않는다.

> **커밋 (Phase 4 — 계획·경험 계약 + 전체 실행 배선)**:
> `feat(planning): wire PX/transition/roadmap/seam + full-snapshot preflight into plan-milestone, plan-workitem, implement-workitem, validate-plan, reviewer, stabilize, TASK_TEMPLATE`

---

# Phase 5 — 원자성 최종 감사 · 조건부 옵션 · 검증

앞선 Phase 커밋에서 닫은 인덱스·surface·메타 문서 정합을 최종 감사하고 조건부 옵션만 처리한다.

## 5.1 원자 커밋 정합 최종 감사

Phase 5는 인덱스·surface·현재 정책 참조를 **처음 반영하는 단계가 아니다**. 아래 표로 앞선 커밋이 스스로 닫혔는지 확인하고, 누락이 있으면 Phase 5 커밋에 섞지 말고 해당 Phase 변경으로 되돌려 보완한 뒤 그 커밋 경계를 다시 검토한다.

| 커밋 | 같은 커밋에 반드시 포함된 것 |
|---|---|
| Phase 1-A | ADR-047/045 amendment + `_ADR_GUIDE`/stabilize 변경 + 두 ADR 인덱스 |
| Phase 1-B | ADR-058 생성 + ADR-049 supersede + eval bundle gitignore/untrack + SIMULATION_RUN distill + 058/049 인덱스 + 현재 정책 re-point + 활성 Surfaces |
| Phase 2-A | ADR-051/050 amendment + 실행 surface + 인덱스·신규 surface |
| Phase 2-B | ADR-010 amendment + PROJECT_START_CHECKLIST + 인덱스 |
| Phase 3 | ADR-027 amend-7 + DESIGN 내용 + bootstrap/researcher/designer/reviewer/validate/stack-guard + design-gate runner·shots ignore + ADR 인덱스·Surfaces·STRUCTURE runner 행 |
| Phase 4 | ADR-056/057/014/026/037 amendments + ROADMAP·templates + 모든 plan/implement/validate/stabilize surface + 인덱스·Surfaces·STRUCTURE·WORKFLOW |

**실패 조건**: README Amendments 수 불일치, base `## Surfaces`의 파일 부재·역참조 부재, superseded ADR-049의 live 정책 인용, producer 없는 `.gitignore` 항목, producer와 산출물 인벤토리 행이 서로 다른 커밋이면 최종 감사 실패다.

## 5.2 조건부 옵션 (OPT-1 · OPT-2 — opt-in 기록만)

기본 틀에 강제 도입하지 않고, 프로젝트가 실제로 요구할 때만 쓰는 opt-in 어댑터로 **기록만** 남긴다. 공통 규율: 결과는 `DESIGN_RESEARCH.md`에 provenance를 남기고, 승인된 결정만 정식 문서로 정규화.

**OPT-1 — Google Stitch를 concept 생성기로 (옵션)**. `.claude/skills/bootstrap-design/SKILL.md` R2-1 생성 불릿 끝에 opt-in 한 줄 추가:

```
- **(옵션) 외부 concept generator**: UI 프로젝트가 원하면 Google Stitch 등 외부 도구를 concept 생성 보조로 쓸 수 있다 — 단 **기본 의존 금지**(계정·도구 의존 — ADR-027#amend-2 비결정 존중). 산출물은 DESIGN_RESEARCH.md에 provenance 기록 후, 승인된 방향만 DESIGN.md로 정규화(생성/감사 분리·취향 오라클=사용자 불변).
```

**OPT-2 — 마케팅/랜딩 한정 포지셔닝 필드 (옵션)**. `docs/30-workitems/_templates/FEATURE_TEMPLATE.md` §8-1 주석 끝에 opt-in 한 줄 추가:

```
     - (옵션, 마케팅·랜딩 화면 한정) 포지셔닝: audience / JTBD / objection / proof / voice / key action을 *이 필드에 매핑*해 랜딩 카피 근거로 둔다(별도 마케팅 SSOT·스킬 설치 없음 — §10 Voice와 자연 연결). 마케팅 스코프 도입이 아니라 카피 근거 기록 수준.
```

**왜**: "가져오지 않기로 한 것"과 구분해, 프로젝트가 필요로 할 때의 경로만 최소 기록(과잉 도입 회피).

## 5.3 최종 검증

1. **링크·앵커 감사(런타임 비종속)**: 이번 diff에서 추가·변경한 Markdown 상대 링크를 `git diff --unified=0 -- '*.md'`로 목록화하고 각 대상 파일·fragment를 직접 대조한다. 새 anchor(`adr-045-amend-1`, `adr-027-amend-7`, `adr-056-amend-1..3`, `adr-057-amend-1..3`, `adr-051-amend-4`, `adr-050-amend-1`, `adr-010-amend-5`, `adr-047-amend-1`, `adr-014-amend-3`, `adr-026-amend-4`, `adr-037-amend-3`)는 정의 1개·참조 대상 실재를 `rg`로 확인한다. ADR-058은 amendment가 없어 fragment 없는 파일 링크만 허용한다. 프로젝트 초기화 후에는 선택한 스택의 문서 검사 도구를 CI에 구성한다.
2. **인덱스 amend + 현재 규칙 요약 동기**: 각 ADR 본문 `## Amendment N` 개수 ↔ `docs/90-decisions/boilerplate/README.md` Amendments 컬럼이 각 Phase 동기 지시와 일치하는지 확인한다(§5.1은 원자 커밋 최종 감사표). 추가로 정정/뒤집기 또는 amend 4개 임계에 걸린 **ADR-056·ADR-057·ADR-026·ADR-037** 모두 `## Status` 바로 뒤 `## 현재 유효 결정`이 있고, 각각 `--prototype/부분보류 폐기`, `M 전체 snapshot/잠금/후속 finding`, `## 3 full+T:AC 의존성`, `FAC ready gate+구현후 사용자 보고`라는 net 규칙을 담는지 확인한다. 역사 amendment만 고치고 fast-path 요약을 stale로 두면 실패. stabilize preflight 항목 2의 `P1 [ADR-index]` + ADR-045 D5 수기 확인과 동일.
3. **Surfaces 정합**: 새 ADR-058 `## Surfaces`에 등재한 파일들이 실제로 `ADR-058` 역참조를 갖는지(preflight 항목 2 Surfaces forward check). 각 surface 파일에 ADR-058 링크를 이미 박았으므로 통과해야 한다.
4. **미러 동기 확인**: (a) reviewer.md **Plan Quality 차원** ↔ validate-plan **검토 차원 + 카테고리 카운트 표** 미러 일치 — [Plan-FAC-coverage](PX 확장·PX 태그↔매핑 ⑦·milestone-mode PX 반전 포함)·[Plan-design](category/a11y/recovery)·**기존 [Plan-dep] 6번 차원 확장(존재성·비순환·AC-보장 — 신설·행 추가 아님, 전체 차원 수 11 불변)**을 *양쪽 동일 문구*로 바꿨는지(§4.12d f). (b) reviewer.md **Design Consistency**는 *reviewer 내부* 검사라 validate-plan엔 없다 — reviewer.md 안에서만 헤더가 `6 차원`이고 [Design-state] category·신설 [Design-a11y]·"상태 매트릭스 책임 분배" 표 제목·근거까지 category로 바뀌었는지 확인.
5. **Mutation Contract 준수 (D3 enabling — P2 보고만, 하드 게이트 아님)**: ADR-058에 full 6필드가 있는지(신규 standalone ADR 관례). base 계약이 있는 ADR(051·010·047·050·056·057)의 harness amend에 delta 한 줄(failure/falsifier/rollback)이 있는지 — *권장*, 누락은 P2. pre-047 ADR(027·014) amend는 계약 불요. **어느 것도 통과 차단 조건이 아니다**(ADR-047 §정책강도: 자동 차단 0)(§전역 거버넌스).
6. **DS-3 게이트 러너 스모크 (필수 — 가장 위험한 신규 실행물)**: 의도적 결함 샘플 HTML로 `node scripts/design-gate.mjs`를 실제로 돌려 검증한다 — (a) 저대비 텍스트 샘플 → `blockers`에 `axe:color-contrast`(serious) 잡힘, (b) 320에서 page가 넘치는 샘플 → `blockers`에 `page-overflow`, (c) 320에서 요소가 viewport 밖으로 나가거나(escape) overflow:hidden으로 텍스트가 잘리는 샘플 → `blockers`에 `viewport-escape`/`clipped-text`, (d) 정상 sr-only·`overflow-x:auto` 표·의도적 ellipsis 샘플 → **오탐 없이 통과**(제외 로직 검증), (e) clean 샘플 → blocker 0·exit 0·`screenshots[]` 생성. Playwright/axe 미설치 환경은 exit 2(Needs Install), 브라우저 바이너리 부재도 exit 2 확인. **이 스모크가 통과해야 R2-G/R6/R5 게이트가 실제 작동**한다(러너가 declared 계약대로 도는지 확인 — **러너 결정적 = axe + geometry(overflow·escape·clip)**, reviewer 픽셀 = 위계·밀도·slop·overlap임을 재확인). **추가 fixture (P1-6 대응)**: (f) 세로 전용 스크롤(`overflow-y:auto`) 조상 안에서 가로로 viewport 밖으로 나가는 요소 → `viewport-escape` 잡힘(가로 스크롤 조상만 제외하는지 검증) · (g) 조상 `overflow:hidden`에 잘린 텍스트(자신은 안 잘림) → `clipped-text` 잡힘(*현재 미구현 — 이 fixture로 조상-clipping 로직을 추가·검증한 뒤에만 계약 '완료'*) · (h) axe 태그에 `wcag21a` 포함 확인(Level-A 2.1 serious 규칙 실행 — **`wcag22a`는 axe-core 공식 태그 아님이라 제외**; 문자열 포함이 아니라 *설치된 axe 버전에서 특정 규칙이 실제 실행되는지* negative fixture로 확인).

7. **PX·계획 스냅샷 회귀 acceptance — 3 종 표 (필수 — 이 계약이 반복해서 깨진 지점)**: 아래를 **실제 fixture로 실행**해(기대값 재확인=grep-theater 금지) 각 단계의 *실입력·실출력·actor별 읽은 파일 목록*을 `.boilerplate/validation/SIMULATION_RUN.md`에 기록한다 — *문구 존재*가 아니라 *계획 스냅샷 후 계약이 닫히는지* 검증. **주의: 이 실행은 Phase 4가 실제 적용된 뒤(plan-milestone·plan-workitem·validate-plan·implement-workitem에 계약이 배선된 상태)에만 가능**하다(가이드 명세 단계에선 실행 불가). 세 표(계획 스냅샷 / 읽기전용 validator / 실행-시점 preflight)는 성격이 달라 보장 항목도 다르다. *(화면 revision·재승인 재동기·retire·refresh가 없으므로 그 lifecycle 표는 두지 않는다 — 마일스톤 확정 후 화면·계획 변경은 다음 M\<N>.)*

**7-A. 계획 스냅샷 (plan-milestone R5-5 + plan-workitem M\<N> — 상태를 쓰는 1회 스냅샷)**. 보장: **검사한 bytes = 저장한 bytes**(R5-5 프로토타입 게이트는 verbatim 승격이라 결정적) + *plan-workitem 재실행 시 중복 생성 없이 안전 재개(부분 결과 이어서 완성)하고 동일 구조 불변식 충족* — LLM 계획이라 산문의 byte-level 결정성은 보장 대상 아님.

| 단계 | 조작 | 기대 결과 |
|---|---|---|
| A1 프로토타입 최종 승인 | `/plan-milestone M1`에서 dashboard 최종 승인, PX-M1-dashboard-01·02·03 | 인벤토리 = HTML 마커(01·02·03), 번호 `01`부터, 마일스톤 번호가 버전(화면 revision 없음) |
| A2 다중 feature 귀속 | dashboard PX 일부는 F-001, 일부는 F-002가 구현 | 각 PX를 *구현하는* feature 하나의 `## 7`에 분산 기록(화면 통째로 대표 feature에 몰지 않음 — INST-1 사각 방지) |
| A3 전체 계획 1회 | `/plan-workitem M1` (전체 스냅샷) | 전 feature task·`## 3`·AC·FAC↔AC·PX↔AC(`## 7-3`)를 1회 완성, 후행 task는 선행 완료 결과·AC 전제, unmapped PX는 surface. `--refresh`·`F-NNN` 없음 |
| A4 F/--refresh 입력 거부 | `/plan-workitem F-001` 또는 `/plan-workitem M1 --refresh` | 거부 — "`M<N>` 단위로 실행" 안내 후 종료(단일 feature·refresh 사용자 경로 없음) |
| A5 중단 후 재개(5+ feature) | feature 6개 M1을 1회에 못 끝내고 `/plan-workitem M1` 재실행 | 완결 feature는 멱등 skip, 미완결만 이어서 완성 — 중복 생성 없음(같은 명령 재개, 다른 모드 아님) |
| A6 입구 계약 누락 halt | 한 UI feature에 프로토타입·면제 둘 다 없음 | task를 하나도 쓰기 전에 **일괄 중단**하고 막힌 feature·사유 보고(부분 계획 금지) |
| A7 plan-milestone 상태 분기 | `draft` M1 재실행 / `ready` M1 재실행 / 없는 M9 / 새 아이디어 | draft=미완 라운드 재개 · **ready=변경 거부+다음 M 안내** · 없는 ID=오류 · 새=다음 번호 M 생성 |
| A8 확정 재대조→ready | plan-milestone 종료 시 (UI/비-UI 모두) | M↔feature↔`## 7` FAC 정합(+UI: 프로토타입·PX·`## 9` 전환표)+미해결 열린 질문 0건 통과 시에만 M·feature `## 0. Status`=`ready` |
| A9 ready 승격 중단 안전 | feature 승격 중 컨텍스트 끊김(일부 feature `ready`, M 아직 `draft`) | M이 `draft`면 미확정 — `/plan-milestone M<N>` 재개(feature 먼저·M 마지막이라 M `ready`=전부 `ready` 보장) |
| A10 ready 승격 중단·혼합 재개 | plan-workitem이 task 파일 순차 `ready` 쓰다 N번째서 중단(모든 상태가 ready/draft) | 혼합=**미완 승격**(dead state 아님) → `/plan-workitem M1` 재실행이 전체 재검증 후 남은 `draft`를 `ready`로 마저 승격 |
| A11 M1 최초 실행(task 0→N) | plan-milestone로 M1·feature `ready` 확정 후 `/plan-workitem M1`(task 0건) | 전 feature task를 `draft`로 생성·작성 → self-check+[Plan-dep] → `ready` **순차 승격**(완료 상태는 전부 ready; 0→N; 입력분기 (A)) |

**7-B. 읽기전용 validator negative fixture (validate-plan/reviewer가 잡아야 할 결함 — 상태 안 바꿈)**. 보장: **입력 HTML 미변경(무수정) + 멱등 재실행(같은 입력 = 같은 finding)**. 각 행에 실행 명령·기대 finding·severity(P0/P1) 기록.

| fixture | 기대 finding (severity) |
|---|---|
| B1 완전-orphan HTML | HTML PX가 어느 인벤토리에도 없음 = orphan (P0) — glob이 완전-orphan HTML까지 회수 |
| B2 같은 HTML 내 중복 id | 한 화면 마커 id 중복 (P0) |
| B3 feature 간 중복 소유 | 한 PX가 2+ feature `## 7`에 (P0) |
| B4 prefix 충돌 | 완전성 필터가 `^PX-M1-dashboard-\d{2,}$` 정확 매칭 — `user`가 `user-settings`를 오매칭 안 함(같은 feature가 여러 화면 소유 시 화면별 정확 필터) |
| B5 (id, 설명) mirror drift | 같은 id인데 HTML 마커와 인벤토리 설명이 다름 = mirror drift (P0) |
| B6 M1/task0 검증 | `/validate-plan M1`(task 0건) → 소유·문법·경로·중복ID·`≥1 PX/화면`·disjoint·(id,설명) 검사 **실행**(M입력이라 가능), PX↔AC coverage만 유예. `F`/`T` 단독은 이 cross-feature 검사 skip |
| B7 PX 태그↔매핑 불일치 | task `## 6` `(PX-x)` 태그가 `## 7-3`의 그 PX 매핑(T:AC)과 다른 task:AC를 가리킴 ⇒ 태그-매핑 불일치 (P1) — validate/reviewer ⑦ |
| B8 의존성 누락·순환·AC 보장 부재 | `## 9`가 없는 선행 task 참조 / T-a→T-b→T-a 순환 / 후행이 요구한 산출이 선행의 참조 AC에 없음 ⇒ **plan-workitem 성공·task ready 승격 거부** + validate/reviewer `[Plan-dep]` 존재성·비순환·AC-보장 P0 |
| B9 Status 주석 파싱 | `## 0. Status` 헤딩+값(`ready`)+주석(값 뒤) ⇒ 상태 파서가 헤딩 바로 다음 줄 값(`ready`)을 읽음(주석을 값으로 오독 안 함) |

**7-C. 실행-시점 lifecycle fixture**. 보장: 신규 대상 task는 모든 preflight 통과 전 `ready`를 유지한다. preflight가 라우팅한 별도 repair는 선행 task만 검증된 결함 절차로 재개방할 수 있다.

| 단계 | 조작 | 기대 결과 |
|---|---|---|
| C1 선행 미완 | T-002의 선행 T-001이 아직 done 아닌데 T-002 dispatch 시도 | 의존순 대기 — T-001 먼저(오류 아님, refresh 아님) |
| C2 선행 산출 부재 | T-001은 done인데 `## 9`가 전제한 인터페이스·파일이 실제 없음 | 대상 T-002는 `ready` 유지. `/repair-workitem T-001 "<관측 finding>"` → Adopt 시 T-001 `done→in-progress` → repair → fresh validate → finalize(`done` 재커밋) 후 T-002 재시도 |
| C3 상위 전제 붕괴 | 참조 프로토타입 경로 삭제·상위 `## 7`/INV 변경 | 그 task 중단하고 **사용자 보고**(근본 충돌 — 자동 재계획·refresh 없음, 변경은 다음 M) |
| C4 repair-plan 잠금 | M1에 `in-progress`/`blocked`/`done` task 있는데 `/repair-plan M1` | 계획 변경 **거부** + 사유 보고(`draft`/`ready` 밖 상태는 전부 잠금). repair-plan의 ready 문서 수정은 첫 구현 전 review 처리에만 허용(C11) |
| C5 implement in-progress 기록 | `/implement-workitem T-001` 착수 | 상태·부모·의존성·산출·상위계약·plan-review·열린질문·AC해석 preflight 전부 통과 후 dispatch 직전에만 T-001 `in-progress`; preflight 중단이면 `ready` 유지 |
| C6 draft task implement 거부 | 미승격(`draft`) task를 `/implement-workitem` | 착수 거부(`ready`만 착수 — plan-workitem 승격 먼저); `done` task도 거부 |
| C7 구현 후 plan-workitem 거부 | M1(ready)에 `in-progress` task 있는데 `/plan-workitem M1` | 계획 변경 **거부**(repair-plan과 동일 잠금 — 결정 5d) |
| C8 완결 M plan no-op | 전 task `ready`+완결인 M1에 `/plan-workitem M1` | **read-only no-op**(중복 생성·수정 없음) |
| C9 stabilize 누락 FAC → NO 차단 | 졸업 시 담당 task 없는 약속 FAC 발견 | graduation **NO 유지** + 사용자 보고(자동 corrective/취소 경로 없음 — 사용자 명시 결정; plan-time coverage 게이트가 정상적으론 선제 차단) |
| C10 조기 implement 거부(draft 존재) | 같은 M에 `draft`(미승격) task가 하나라도 있는데 다른 `ready` task를 `/implement-workitem` | **착수 거부**(승격 미완 — plan-workitem 먼저). *`draft` 없이 `ready`/`in-progress`/`done` 혼재는 정상 착수* |
| C11 ready 계획 repair | 구현 전(전 task 상태가 `draft`/`ready`) `ready` task·매핑 finding에 `/repair-plan M1` | status 역전이 없이 문서 제자리 수정 → 전체 self-check+[Plan-dep]. 미완·중단이면 review 파일 보존 + implement 게이트 ⑤가 차단; 완결 뒤에만 review 파일 삭제 |
| C12 in-progress 재개 | `in-progress`인 T-001에 `/implement-workitem T-001` | 구현 **재개**(거부 아님 — 대상이 in-progress면 재개 허용); 같은 M의 다른 done/ready sibling 무관 |
| C13 done 후 다음 task | T-001 `done`, T-002 `ready`에 `/implement-workitem T-002` | draft·미해결 plan-review 없음 + 부모 ready + T-001 status·약속 산출 확인 통과 시 T-002 정상 착수("전 task ready" 요구 안 함) |
| C14 ready task finalize 거부 | 구현 안 한 `ready` task에 `/finalize-workitem` | **거부** + "implement 먼저" 안내(`in-progress`만 done 전환 — ready→done 건너뛰기 차단; §4.12d g) |
| C15 상위 P0 | 구현 전 M/F/prototype 자체 P0 발견 | 자동 `ready→draft`·부분 재계획 없음. implement 중단 + 사용자에게 사실·영향 보고(기본=다음 M; 현재 M 재개방 명령·상태 전이는 본 계약에 없음) |
| C16 잘못된 상태 finalize index 무변경 | 다중 task 중 하나가 `ready`(구현 안 함)인데 finalize | 파일·git index·status **전혀 무변경** 일괄 중단(부분 커밋 방지; §4.12d g) |
| C17 완료 task repair actor | repair-milestone이 done T-001 결함을 채택 | repair-milestone은 status 무변경 + `/repair-workitem T-001 "<finding>"` 위임; repair-workitem만 Adopt 후 `done→in-progress` 기록 |
| C18 F/T repair-plan 잠금 우회 | T-002 또는 F-002 review에 `/repair-plan T-002`/`F-002`, 같은 M의 T-001은 blocked 또는 done | 입력의 부모 M 전체 상태를 읽어 **계획 변경 거부**(하위 ID로 잠금 우회 불가) |
| C19 repair-plan 검증 실패 | 구현 전 review를 반영했지만 부모 M 전체 self-check/[Plan-dep] 실패 | 처음 회수한 review 파일 **보존**, implement 게이트 ⑤ 계속 차단; 성공한 다음 repair-plan 실행에서만 삭제 |
| C20 done repair 전부 Reject/중단 | done T-001 finding을 repair-workitem이 전부 Reject / Adopt 후 첫 수정 뒤 중단 | 전부 Reject면 code·status 무변경(`done` 유지) / 재개방 뒤 중단이면 `in-progress` 유지 후 repair→validate→finalize 재개 |
| C21 AC 해석 모호성 | ready T-002 AC에 구현을 가르는 해석 2개, M의 앞 task는 done | builder dispatch **전** 중단, T-002 `ready` 유지 + 사용자에게 해석안·영향 보고; `/plan-workitem`·`repair-plan` 우회 호출 없음, 사용자 선택을 `## 8`에 기록한 뒤 재실행 |
| C22 구현 후 unmapped FAC | T-002 validate 중 feature FAC-3이 어느 task AC에도 매핑되지 않음을 발견 | `P0 [Spec-gap]` + `Needs Fix`; `/repair-workitem`·새 task 자동 호출 없이 사용자 중단·보고, stabilize graduation NO와 동일 라우팅 |
| C23 stabilize 새 범위 finding | 구현 완료 뒤 탐색 QA/insight가 기존 task·AC에 없는 새 요구를 발견 | 현재 M task 생성·`/plan-workitem` 호출 없음; 사용자 보고 + 다음 `/plan-milestone M2` 후보 |
| C24 stabilize 기존 약속 결함 | 탐색 QA가 T-002 AC의 기존 약속 위반을 재현 | T-002 `/repair-workitem`(cross-cutting이면 repair-milestone) → validate → finalize; 새 task 생성 없음 |
| C25 review-doc 구현 전/후 분기 | 구현 전 task 매핑 finding / ready M의 prototype finding / 구현 시작 뒤 새 문서 범위 finding | task 매핑=`validate-plan M1`→`repair-plan M1`; 잠긴 M/F/prototype·구현 뒤 새 범위=사용자 보고+다음 M 후보. `/plan-workitem <id>` 없음 |

8. **runtime surface 폐기 계약 residual scan (Phase 4/5 적용 후 필수)**: 역사 보존 ADR 본문은 latest amendment가 supersede하므로 검색 대상에서 분리하고, 실제 실행·템플릿·운영 surface에서 아래 토큰이 **0건**인지 확인한다.
   - `rg -n -- '--refresh|--prototype|Needs Plan Refresh|## 3 상태: draft|2-tier|단일 feature 모드|미커버 task 추가 권장' .claude docs/00-meta docs/30-workitems/_templates`
   - `rg -n -- 'ready\s*→\s*draft' .claude docs/00-meta docs/30-workitems/_templates`
   - `rg -n -- '/plan-workitem (F-|<id>)|다음 .*plan-workitem|다음 라운드의 .*plan-workitem|/plan-workitem 회수 권장|plan 보강 권장|이미 분해된 feature가 있으면 .*plan-workitem' .claude docs/00-meta docs/30-workitems/_templates`
   - 0건이 아니면 "제거를 설명하는 문구"라는 이유로 runtime surface에 남기지 말고 해당 skill/template/meta 규범을 고친다. ADR의 과거 결정은 삭제하지 않되 ADR-056/057 latest amendment·`현재 유효 결정`·README 인덱스 요약이 새 계약을 가리키는지 별도로 확인한다.

한 행이라도 규칙과 어긋나면 그 규칙(§4.1 결정1~4 / §4.12 plan-workitem 전체 스냅샷·의존성 self-check / §4.11 R5-5·확정 재대조 / §4.12b preflight(접지·선행·산출))을 먼저 고친다.

> **커밋 (Phase 5 — 최종 감사 + 조건부 옵션)**:
> `docs: audit atomic phase boundaries and record optional adapters`

---

# 완료 후

- 이 `IMPROVE-GUIDE.md`는 개선 실행용 임시 문서다 — 모든 Phase 적용·커밋이 끝나면 삭제한다(저장소 어디에서도 이 파일을 참조하지 않는다).
- 커밋 순서: Phase 1-A → Phase 1-B → Phase 2-A(2.1~2.6) → Phase 2-B(2.7~2.8) → Phase 3 → Phase 4 → Phase 5. 각 커밋은 해당 ADR 인덱스·신규 surface까지 함께 닫고, 커밋 전 변경된 Markdown 상대 링크를 실제 대상과 대조한다.
- **Phase 커밋은 스스로 정합해야 한다**: ADR 본문·인덱스 행·새 surface·역참조를 해당 커밋에서 함께 반영한다. Phase 5는 앞선 커밋의 누락을 정상 절차로 보충하는 단계가 아니라 최종 감사다. 중간 커밋에서 `[ADR-index]`·`[Surface-backref]`·`[Ref-anchor]` 불일치를 남긴 채 다음 Phase로 넘기지 않는다.
- **가설 표시 항목**(DS-4 화면 전환·DS-5 signature·DS-6 motion 세부)은 정책상 채택했으나 design-eval 재검토 트리거(SIMULATION_RUN.md) 실측 전까지는 *directional*이다 — 다운스트림에서 과신 금지(각 amend `### 강도`에 명시).
- **전체 검증(ADR-017 dogfood)은 *의무*다 — 권장 아님**: [ADR-017](docs/90-decisions/boilerplate/ADR-017-dogfood-simulation.md)은 "재실행 트리거 3종"(신규 ADR(amendment 포함)·lifecycle 단계 변경·skill 본문 큰 변경) 중 1개라도 발생하면 Round N+1 dogfood를 **의무화**한다. 이번 라운드는 셋 다 해당하므로 적용 후 todo-CLI baseline dogfood 1회가 **필수**다(ADR-017 gate). **Phase 5는 정적 정합(링크·인덱스·미러·게이트 스모크)만** 결정적으로 확인 — 그것으로 dogfood 의무가 면제되지 않는다. 회귀 검출은 이 적용-후 dogfood가 담당하고(ADR-047 D4: falsifying evaluation 기본값 = ADR-017 baseline 재실행; falsifying eval은 사전 게이트가 아니라 rollback 트리거이므로 *적용 후*가 맞다), 검출 시 해당 Mutation Contract의 rollback path로 되돌린다.
- **착수 안 한 항목**은 이 문서 상단 "착수하지 않는 항목"에 근거와 함께 명시돼 있다(INST-4 관찰·INST-5·기타 미검증·HN-3·백로그 정규화).
