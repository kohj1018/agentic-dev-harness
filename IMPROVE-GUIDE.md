# IMPROVE-GUIDE — 문서/ADR 참조 체계 개선 실행 가이드

> 이 문서는 *작업용(ephemeral)* 가이드다. 모든 Phase 완료 후 삭제한다(`docs: delete IMPROVE-GUIDE`).
> STRUCTURE.md 산출물 인벤토리에 등록하지 않는다.

## 0. 이 가이드가 해결하는 문제 (왜)

장기 운영 시 계층·링크형 문서 시스템에서 실제로 *이미 관측된* 드리프트:

1. **인용 drift** — `docs/90-decisions/boilerplate/README.md`의 ADR-038 행이 `+amend1`만 적었으나 본문엔 Amendment 2가 있음.
2. **줄번호 참조 rot** — `validator.md L44~48` / `L44` 참조는 그 위 한 줄만 바뀌어도 조용히 어긋남.
3. **참조 표기 비균일** — `amend` 토큰이 39개 파일 131회, `amend 1 / amend1 / Amendment 1`이 혼재해 grep 일관 검색 불가.
4. **fan-out 이중 산문화** — cross-surface 묶음(ADR-027/038)이 ADR 본문 "적용 위치"와 STRUCTURE.md Canonical Owner 셀에 *둘 다 산문*으로 중복. 기계 점검 불가.
5. **개정 누적** — ADR-027은 base 15결정 + 4개정 + amend2의 base 결정 정정. "현재 유효 규칙"을 알려면 전체를 fold해야 함.
6. **checker false positive 위험** — 템플릿 예시 링크(`<!-- 예: ... -->`), 생성 예정 project ADR(ADR-100/101)이 naive checker엔 "깨진 링크/누락"으로 잡힘.

**해결 전략**: 사람이 읽는 링크와 기계가 읽는 참조를 분리해 둘 다 안정화한다. 새 정책은 이 저장소 규율대로 ADR로 박고(ADR-005 "정책=ADR" 패턴 + STRUCTURE.md "새 정책 도입 시" 절차), fan-out을 ADR 안의 단일 `## Surfaces` 블록으로 모은 뒤(ADR-019 JIT 정합 — ADR 읽을 때 fan-out도 같이 옴), 기존 grep 기반 deterministic preflight를 "파일 존재"에서 "앵커 존재 + 양방향 정합"으로 확장한다(새 런타임 강제 X — GUARDRAILS 정합). **그리고 저장소의 기존 *ADR citation·markdown 링크·section 링크·fan-out surface*를 이 형식으로 일괄 통일한다(산문 속 단순 언급은 대상 아님 — D9) — Phase 5(전체 이관) + Phase 6(전수 검증)가 그 완전성을 보장한다.**

## 의도적으로 *하지 않는* 것 (scope 경계)

- ❌ 모든 ADR에 YAML frontmatter 전면 도입 — 30+ ADR 일괄 reformat은 churn·위험이 크고, 같은 데이터를 `## Status`/`> scope:`/`## Surfaces`/인덱스 컬럼이 이미 보유(ADR-006/ADR-022 위반). *필요해지면 별도 ADR로.*
- ❌ 8종 참조 타입 분류(owns/implements/validates/...) 전면 도입 — checker가 실제로 필요로 하는 구분(추적 surface / 일상 언급 / 주석 예시 / 생성예정 project ADR)만 둔다.
- ❌ 백링크 그래프 파일 hand-maintain — forward `## Surfaces`를 SSOT로 두고 backlink는 grep으로 충분(둘 다 필요해지면 *생성물*로).
- ❌ 독립 검증 스크립트 강제 — 기존 stabilize preflight(grep)와 review-doc에 흡수.

---

## Phase 0 — 즉시 사실 수정 (정책 의존 없음, 단독 커밋)

> ADR-038 인덱스 행이 본문 Amendment 2를 누락. 독립 버그라 가장 먼저 고친다.

### 0.1 ADR-038 인덱스 Amendments 컬럼 동기화

**파일**: `docs/90-decisions/boilerplate/README.md` (ADR-038 행)

**현재(before)** — Amendments 컬럼:
```
(+amend1: Plan Quality 8 → 10 차원 — ADR-027 amend 1 양립)
```

**변경(after)**:
```
(+amend1: Plan Quality 8 → 10 차원 — ADR-027 amend 1 양립, +amend2: 리뷰 파일 충돌 정정 — 덮어쓰기→자동 suffix)
```

즉 해당 행 전체:
```
| 038 | Cross-LLM Plan Validation + Parallel Waves | accepted | (+amend1: Plan Quality 8 → 10 차원 — ADR-027 amend 1 양립, +amend2: 리뷰 파일 충돌 정정 — 덮어쓰기→자동 suffix) | opt-in peer review (다른 세션·다른 LLM) — /validate-plan + /repair-plan 신설 + wave 그룹 echo + worktree 권장 |
```

**검증**: `docs/90-decisions/boilerplate/ADR-038-cross-llm-plan-validation.md`에 `## Amendment 1`과 `## Amendment 2`가 둘 다 있고, 인덱스가 둘 다 언급하면 OK.

**Commit**: `docs(adr): sync ADR-038 index amendments column with body`

---

## Phase 1 — 참조 계약 ADR 신설 (모든 후속의 기반)

> 규약을 먼저 박아야 기존 ADR 이관·checker 확장이 그것을 참조할 수 있다.

### 1.1 ADR-045 본문 작성

**신규 파일**: `docs/90-decisions/boilerplate/ADR-045-doc-reference-contract.md`

아래 내용을 *그대로* 작성한다:

````markdown
# ADR-045 — 문서 참조 계약 (document reference contract)

> scope: boilerplate
> area: process

## Status
accepted

## 현재 유효 결정
- ADR 간 모든 참조는 정규 ID로 쓴다: `ADR-NNN` / `ADR-NNN#amend-M` / `ADR-NNN#dK`. **줄번호 참조(`file.md L44`) 금지.**
- 다른 파일에서 인용되는 amendment 헤딩 위에는 stable anchor를 둔다(결정은 anchor 없이 `#dK` 토큰).
- cross-surface 정책 ADR은 `## Surfaces` 블록을 *fan-out SSOT*로 둔다. STRUCTURE.md Canonical Owner 셀은 그 포인터만 둔다(산문 나열 중복 제거).
- 다개정(amend **4개 이상** 또는 정정성 amend 포함) ADR은 상단에 `## 현재 유효 결정` 요약(≤6줄)을 둔다.
- amend는 작게 유지. 정책 의미 변경·기존 결정 뒤집기·surface 5+ 추가·amend 4+ 누적은 신규 supersede ADR로 간다(ADR-045 이후 *신규 변경* 기준 — 기존 ADR은 grandfather, D6).
- **비-ADR 문서끼리의 링크·섹션 참조도 동일 규약**(상대경로 markdown 링크 + cross-ref 섹션엔 stable anchor) — D9.
- 신규 ADR은 본 계약을 의무 적용. 기존 ADR/문서는 *많이 인용되는 것부터* 점진 이관.

## 배경
- [관측됨] `boilerplate/README.md` ADR-038 행 Amendments 컬럼이 `+amend1`만 적혀 본문 Amendment 2와 어긋났다(인용 drift 실재).
- [관측됨] `STRUCTURE.md` Canonical Owner 표와 `stabilize-milestone/SKILL.md` §1.0 노트가 `validator.md L44~48` / `L44` 줄번호로 참조 — line shift에 취약.
- [관측됨] `amend` 토큰이 39개 파일 131회, `amend 1 / amend1 / Amendment 1` 표기 혼재 → grep 일관 검색 불가.
- [관측됨] cross-surface 묶음(ADR-027/038)이 ADR 본문 "적용 위치" + Canonical Owner 셀 두 곳에 산문으로 중복 — fan-out 레지스트리 자신이 SSOT를 위반.
- 본 repo 관측만으로 [관측됨] 충족. 외부 다중 repo 실증은 미인용.

## 결정

### D1. 정규 참조 ID
ADR·하위 단위의 *canonical 참조 ID*는 다음으로 통일한다. 인용 시 적어도 한 번은 canonical 형태를 본문에 남겨 grep 단일 타깃을 확보한다.

| 대상 | canonical 참조 ID |
|------|-------------------|
| ADR | `ADR-027` |
| 개정 | `ADR-027#amend-1` |
| ADR 내 결정 | `ADR-027#d5` |
| 문서 섹션 | `ARCHITECTURE_OVERVIEW.md#arch-7-1` (stable anchor — D9·부록 B) |

- **유일한 hard ban: 줄번호/line 참조**(`validator.md L44`, `WORKFLOW.md §4 line 25` 등) — line shift에 조용히 깨진다. 내용 서술자(예: `validator.md 의 인터페이스 CHECK 규칙(7-x)`)나 섹션 anchor로 대체한다.
- `ARCH 7-1`, `DESIGN.md ## 9` 같은 **사람이 읽는 shorthand는 허용**한다(현 문서 스타일 존중). 단 그 shorthand가 *그 자리의 주된/유일한 참조*일 때는 canonical 형태를 1회 병기한다 — 예: `ARCH 7-1 (ARCHITECTURE_OVERVIEW.md#arch-7-1)`. 문맥상 보조 언급은 shorthand 단독 허용.
- amend 인용 토큰은 `ADR-027#amend-1`로 통일한다(본문 헤딩 `## Amendment 1`은 그대로 둔다). `amend 1 / amend1 / amendment-1`을 *인용 식별자*로 쓰지 않는다.
- navigational markdown 링크(`[ADR-027](...path...)`)는 그대로 쓴다.
- **`#amend-M`은 클릭 anchor(D2)로 박지만, `#dK`는 *grep 식별 토큰*일 뿐 — 결정마다 `<a id>`를 박지 않는다**(ADR-027만 27개가 되어 과잉). `ADR-027#d21`은 "ADR-027을 열어 결정 21" 의미의 안정 grep 문자열.

### D2. stable anchor
다른 파일에서 인용되는 **amendment 헤딩** *바로 위 줄*에 명시 anchor를 둔다(한글 자동 anchor의 heading-edit rot 회피). *결정(decision)은 헤딩이 아니라 번호 목록 항목이라 anchor를 박지 않는다 — `#dK`는 grep 토큰일 뿐(D1).*
```
<a id="adr-027-amend-1"></a>
## Amendment 1 — ...
```
anchor id 규칙: `adr-<번호>-amend-<M>`. *외부 인용이 없는* amendment에는 강제하지 않는다(enabling — cited-only, Phase 5.A 정합).

### D3. `## Surfaces` 블록 (fan-out SSOT)
**surface 정의**: ADR의 *결정이 구체적으로 반영된* 파일 — **그 결정이 바뀌면 그 파일 내용도 반드시 함께 바뀌어야 하는** 강제 동기화 대상만. 다음은 surface가 **아니다**(등재 금지): 단순/문맥 언급, 역사적 언급, README·인덱스 요약, `## 참고` cross-ref, 예시 링크.

한 ADR의 결정이 *여러 파일에 동기 반영되어야 하면*, ADR 본문 끝(`## 참고` 앞)에 `## Surfaces` 블록을 둔다. 형식: 파일 경로 한 줄에 하나, 선택적 `#anchor`, 선택적 `— <설명/dK>`.
```
## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT)
- .claude/skills/plan-workitem/SKILL.md          — #d16 read-list + self-check
- .claude/agents/reviewer.md                      — #d18 Plan Quality 차원
- docs/30-workitems/_templates/TASK_TEMPLATE.md#7  — #d20 Design/Iface 자리
```
이 블록이 fan-out의 *유일한 정의*다. `STRUCTURE.md` Canonical Owner 셀은 surface를 산문 나열하지 않고 `→ ADR-NNN ## Surfaces 참조`로 가리킨다(정책 성격·SSOT 표기만 남김).

### D4. 역참조(backref) + forward 정합
`## Surfaces`에 등재된 각 파일은 본문 어딘가에 자신을 고정하는 ADR을 정규 ID(`ADR-NNN`, 또는 명시 마커 `REF: ADR-NNN#amend-M`)로 *역참조*한다. stabilize preflight는 **forward 방향(Surfaces→파일 존재 + backref)**을 *보고만* 점검한다(D8). 역방향(파일→미등재 surface)은 "동기 surface vs 단순 언급" 구분이 휴리스틱이라 false positive가 커서 후속 검토(Phase 5)로 미룬다.

### D5. `## 현재 유효 결정` 요약 섹션
트리거: amendment가 **4개 이상**이거나 base 결정을 *정정/뒤집는* amendment가 있으면 **필수**(순수 확장 amend만 3개 이하면 base+추가로 읽어도 fold 부담이 작아 불필요 — sync 지점 증식 회피). 그 외는 권장. 위치: `## Status` 바로 아래. 내용: 과거 결정·amend를 안 읽어도 현재 net 규칙을 ≤6줄로 파악 가능하게. 상세는 아래 본문이 SSOT — 요약은 빠른 경로일 뿐(SSOT 위반 아님).

### D6. amend vs supersede vs 신규 ADR
| 변경 성격 | 처리 |
|-----------|------|
| 문구 정정·surface 1~2개 추가·충돌 없는 확장 | `## Amendment N` 추가 |
| 정책 의미 변경·기존 결정 뒤집기·surface 5+ 추가 | 신규 ADR로 supersede(amend 흡수 금지) |
| amend 4개 이상 누적 | 통합 재발행(supersede)로 클린 ADR 재작성. 구 ADR은 `superseded`로 history 잔존 |

**적용 시점(중요)**: 본 기준은 ADR-045 이후의 *새 변경*에만 적용한다. 이미 amend가 누적된 기존 ADR(예: amend 4개 + surface 다수인 ADR-027)은 **grandfather** — 즉시 재발행 의무 없음. 기존 ADR은 `## 현재 유효 결정` + `## Surfaces` 정리만 하고, *다음 변경이 발생할 때* amend 대신 통합 재발행을 우선 검토한다.

supersede 절차는 기존 `_ADR_GUIDE.md` "대체 절차"를 그대로 따른다(상태 변경 + 상단 "대체: ADR-NNN" + 신규 ADR이 구 ADR 참조).

### D7. lifecycle 메타
- Dropped/Parked 번호 표의 사유는 *git log 없이도* 한 줄로 파악되게 적는다. **신규 drop부터 의무**(기존 행은 그대로) — 일회성·무비용.
- `last-reviewed` 컬럼은 **migration 범위 밖**: 0-fork 보일러플레이트엔 연 1회 검토 cadence가 없어 stale 시 *거짓 메타*가 된다. 정기 검토를 실제 도입하는 fork에서만 추가(그 전엔 두지 않는다 — 상시 운영비용 회피).

### D8. checker 건전성 규칙 (false positive 회피 — 단, 과도하게 넓히지 않는다)
preflight/checker는 다음을 *오류로 잡지 않는다*.
- `<!-- ... -->` 주석 안의 링크·참조(템플릿 예시).
- **명시 allowlist된 generated placeholder만**: `ADR-100`(`/bootstrap-project` 생성)·`ADR-101`(`/bootstrap-stack` 생성)이 bootstrap 전 미존재인 경우. **그 외 project ADR(102+) 참조가 파일을 못 찾으면 무시하지 않고 `P2 [ADR-ref-project]`로 보고**(프로젝트 진행 후 실제 누락 가능 — 검증 무력화 방지). boilerplate ADR(001~099) 미존재는 `P1`.
- Reserved/Parked/Dropped 표에 등재된 번호(ADR-002/003/013 등) 참조.

### D9. 비-ADR 문서 참조 (doc-to-doc 일반)
ADR 외 문서끼리의 참조도 동일 원칙을 따른다 — *이 계약은 ADR 전용이 아니라 문서 전반의 참조 계약이다.*
1. **링크 형식 통일**: 다른 문서를 *링크로* 가리키면 *상대경로 markdown 링크* `[label](rel/path.md)`, 섹션이면 `[label](rel/path.md#anchor)`(bare 파일명 단독 링크·절대경로·줄번호 금지). 단 **산문 속 단순 언급**(예: "DISCOVERY.md를 갱신", "DESIGN.md가 SSOT")은 graph edge가 아니므로 링크 강제 X — 전수 linkify하지 않고 grep 대상으로 둔다(과잉·churn 회피).
2. **cross-referenced 섹션엔 stable anchor**: 다른 파일에서 *링크로 가리켜지는* 비-ADR 섹션은 한글 자동 anchor(heading 텍스트가 바뀌면 rot)에 의존하지 말고 헤딩 *바로 위 줄*에 영문 slug `<a id="...">`를 둔다(D2와 동일 원리). slug 규칙: `<문서약칭>-<섹션키>` (예: `arch-7-1`, `design-7-components`, `guardrails-stack-guard-scope`, `delegation-midproject`, `structure-doc-linking`). 대상·링크 사이트는 부록 B.
3. **"관련 문서" 라벨 블록이 표준**: workitem→상위 참조는 TASK `## 7. 관련 문서` / FEATURE `## 11. 관련 문서`의 `Milestone / Feature / Architecture / Architecture-Iface / Design / ADR` 라벨 + markdown 링크 형식을 쓴다(이미 템플릿에 박힘 — *형식 보존*이 규율, 신규 라벨도 동일 패턴).
4. **shorthand 병기**: `ARCH 7-1`·`DESIGN.md ## 7` 같은 읽기용 표기는 허용(D1). 단 *링크가 필요한 자리*에선 stable anchor 링크를 쓴다.
5. preflight가 모든 내부 `.md#anchor` 링크의 anchor 실재를 점검(D8 확장 / Phase 6 #9).

## 정책 강도 (ADR-022 정합)
- **constraint(강, [관측됨])**: D1 줄번호 금지, D3 Surfaces 필수 — ADR-038 drift·줄번호 참조 실재가 증거.
- **enabling(약)**: D2 anchor, D5 요약, D7 메타 — 점진 적용, 되돌리기 쉬움.
- 신규 ADR엔 D1~D6 적용 의무. 기존 ADR은 인용 빈도 높은 순 점진 이관.

## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT)
- docs/90-decisions/boilerplate/_ADR_GUIDE.md      — 참조·섹션 작성 규약(D1·D2·D3·D5·D6)
- docs/00-meta/STRUCTURE.md#structure-doc-linking   — D3 Canonical Owner 포인터화 + 절차
- .claude/skills/stabilize-milestone/SKILL.md       — D8 preflight 확장
- .claude/skills/review-doc/SKILL.md                — D4 단일문서 backref 점검

## 참고
- ADR-005 (SSOT — 정의 1곳 + 링크)
- ADR-019 (JIT 컨텍스트 — Surfaces가 ADR와 동거해 사전 fork-load 불필요)
- ADR-022 (Ratchet Principle)
- ADR-000 (scope/번호 정책)
````

### 1.2 인덱스 행 추가

**파일**: `docs/90-decisions/boilerplate/README.md` — "Boilerplate ADR" 표의 ADR-044 행 *바로 아래*에 추가:

```
| 045 | Document reference contract | accepted | — | 참조 ID 규약 + ## Surfaces fan-out SSOT + 현재 유효 결정 + amend/supersede 기준 + checker 건전성 |
```

**검증**: 인덱스 행과 본문 파일이 1:1, 본문에 `## Surfaces`·`## 현재 유효 결정`이 있어 자기 계약을 dogfood하는지 확인.

**Commit**: `docs(adr): add ADR-045 document reference contract`

---

## Phase 2 — 계약을 표준 가이드 문서에 반영 (ADR-045 의존)

> 규약이 "찾아 읽는 ADR"에만 있으면 새 ADR 작성자가 놓친다. _ADR_GUIDE와 STRUCTURE에 박는다.

### 2.1 `_ADR_GUIDE.md` 갱신

**파일**: `docs/90-decisions/boilerplate/_ADR_GUIDE.md`

**(a) "대체 절차" 섹션 아래에 amend 기준 추가.**

현재(before) — `## 대체 절차` 블록 끝:
```
3. 새 ADR에서 기존 ADR을 참조한다.
```
변경(after) — 그 아래에 새 섹션 추가:
```
## amend / supersede / 신규 ADR 기준 (ADR-045 D6)
- 문구 정정·surface 1~2개 추가·충돌 없는 확장 → `## Amendment N` 추가.
- 정책 의미 변경·기존 결정 뒤집기·surface 5+ 추가 → 신규 ADR로 supersede.
- amend 4개 이상 누적 → 통합 재발행(supersede)로 클린 ADR 재작성, 구 ADR은 `superseded`로 잔존.
```

**(b) "권장 섹션" 목록에 두 항목 추가.**

현재(before):
```
## 권장 섹션
- 상태
- 배경 (왜 이 결정이 필요했는가)
- 결정 (무엇을 선택했는가)
- 근거 (왜 이 선택인가, 대안은 무엇이었는가)
- 결과 (이 결정으로 무엇이 달라지는가)
- 후속 작업
```
변경(after):
```
## 권장 섹션
- 상태
- 현재 유효 결정 (amend ≥4 또는 정정성 amend 포함 시 필수 — ADR-045 D5)
- 배경 (왜 이 결정이 필요했는가)
- 결정 (무엇을 선택했는가)
- 근거 (왜 이 선택인가, 대안은 무엇이었는가)
- 결과 (이 결정으로 무엇이 달라지는가)
- Surfaces (여러 파일에 동기 반영되는 정책이면 필수 — fan-out SSOT, ADR-045 D3)
- 후속 작업
```

**(c) "참고" 섹션 위에 참조 표기 규약 추가.**

현재(before) — `## 참고` 직전:
```
## 참고
- 짧아도 된다. 핵심은 "왜 이 선택을 했는가"를 기록하는 것이다.
```
변경(after) — `## 참고` 앞에 새 섹션 삽입:
```
## 참조 표기 (ADR-045 D1·D2)
- ADR 간 참조는 정규 ID로: `ADR-027` / `ADR-027#amend-1` / `ADR-027#d5`. **줄번호 참조 금지** — 대신 내용 서술자나 섹션 anchor.
- 다른 파일에서 인용되는 amendment 헤딩 위에 stable anchor를 둔다: `<a id="adr-027-amend-1"></a>` (결정은 anchor 없이 `#dK` 토큰).
- `## Surfaces`에 등록된 파일은 본문에 `ADR-NNN` 역참조를 둔다(양방향 정합 — stabilize preflight가 점검).

## 참고
- 짧아도 된다. 핵심은 "왜 이 선택을 했는가"를 기록하는 것이다.
```

### 2.2 `STRUCTURE.md` 갱신

**파일**: `docs/00-meta/STRUCTURE.md`

**(a) "문서 연결 원칙" 섹션 보강.**

현재(before):
```
## 문서 연결 원칙
- 상위 문서는 하위 문서를 링크한다.
- 기능 문서는 관련 마일스톤, 설계 문서, ADR을 링크한다.
- QA 문서는 기능/작업 ID를 기준으로 역참조한다.
```
변경(after):
```
## 문서 연결 원칙
- 상위 문서는 하위 문서를 링크한다.
- 기능 문서는 관련 마일스톤, 설계 문서, ADR을 링크한다.
- QA 문서는 기능/작업 ID를 기준으로 역참조한다.
- ADR 간 참조·anchor·fan-out(`## Surfaces`) 규약은 [ADR-045](../90-decisions/boilerplate/ADR-045-doc-reference-contract.md) SSOT.
- cross-surface 정책의 적용 파일 목록은 해당 ADR의 `## Surfaces` 블록이 SSOT다. 아래 Canonical Owner 표는 산문으로 재나열하지 않고 그 블록을 가리킨다(ADR-045 D3).
```

**(a-2) `## 문서 연결 원칙` 헤딩 *바로 위 줄*에 `<a id="structure-doc-linking"></a>` 추가** — ADR-045 `## Surfaces`가 이 stable anchor로 가리킨다(D9 self-dogfood).

**(b) "새 정책 도입 시" 절차에 Surfaces 단계 추가.**

현재(before):
```
### 새 정책 도입 시
1. ADR을 만든다 — 정책 본문은 ADR이 SSOT.
2. `docs/90-decisions/README.md`에 한 줄 추가.
3. 관련 agent/skill 본문에는 정책 설명 대신 ADR 링크 + 자기 영역 행동 규율(self-check 등)만 둔다.
4. canonical owner 매핑이 변하면 본 문서의 Canonical Owner 표 갱신.
```
변경(after):
```
### 새 정책 도입 시
1. ADR을 만든다 — 정책 본문은 ADR이 SSOT.
2. `docs/90-decisions/README.md`(또는 boilerplate/project 인덱스)에 한 줄 추가.
3. 관련 agent/skill 본문에는 정책 설명 대신 ADR 링크 + 자기 영역 행동 규율(self-check 등)만 둔다 + 자신을 고정하는 `ADR-NNN` 역참조(ADR-045 D4).
4. 여러 파일에 동기 반영되는 정책이면 ADR 본문에 `## Surfaces` 블록을 둔다(fan-out SSOT — ADR-045 D3). Canonical Owner 표에는 산문 나열 대신 `→ ADR-NNN ## Surfaces` 포인터만 둔다.
5. canonical owner 매핑이 변하면 본 문서의 Canonical Owner 표 갱신.
```

**검증**: `_ADR_GUIDE.md`와 `STRUCTURE.md`만 읽어도 새 ADR 작성자가 D1~D6을 알 수 있는가.

**Commit**: `docs(adr): codify reference contract in ADR guide and structure inventory`

---

## Phase 3 — 파일럿 ADR 이관 + 줄번호 참조 제거 (ADR-045 의존, dogfood)

> 가장 많이 개정·인용되는 ADR-027/038을 먼저 이관해 *레퍼런스 예시(canonical 본보기)*를 만들고, 줄번호/line 참조를 전수 없앤다(Phase 3 합계 4곳). **저장소 전체 통일은 이 예시를 본떠 Phase 5가 일괄 수행한다.**

### 3.1 ADR-027 이관

**파일**: `docs/90-decisions/boilerplate/ADR-027-interface-decision-allocation.md`

> **grandfather (ADR-045 D6)**: ADR-027은 amend 4개 + surface 다수라 D6 기준상 통합 재발행 후보지만, 지금은 재발행하지 **않는다**. `## 현재 유효 결정` + anchor + `## Surfaces` 정리만 하고, *다음 변경이 생길 때* 재발행을 검토한다.

**(a) `## 현재 유효 결정` 추가** — `## Status` / `accepted` 바로 아래(`## 배경` 앞)에 삽입:
```
## 현재 유효 결정
- 시각 결정은 `DESIGN.md`(UI 한정, Stitch 8섹션 + Motion 확장), 인터페이스 결정은 ARCHITECTURE `## 7-1`(API)/`## 7-2`(CLI)/`## 7-3`(백엔드)/`## 7-4`(프론트)에 둔다.
- `/bootstrap-design`(R0~R5 + `--fast` + `--update`)이 DESIGN.md를, `/bootstrap-stack`이 7-1~7-4를 채운다.
- cross-surface enforcement(plan/validate-plan/stabilize/templates/reviewer)는 #amend-1이 SSOT. anti-slop·lint·R5 시안·Motion 정정은 #amend-2. UI 판정 다중신호 절차는 #amend-3. `--update`는 #amend-4.
- 적용 파일 전체는 아래 `## Surfaces` 참조.
```

**(b) 4개 amendment 헤딩 위에 stable anchor 추가.** 각 헤딩 *바로 위 줄*에:

| 현재 헤딩 | 위에 추가할 줄 |
|-----------|----------------|
| `## Amendment 1 — Cross-surface enforcement 보강` | `<a id="adr-027-amend-1"></a>` |
| `## Amendment 2 — 디자인 워크플로우 실효 강화 ...` | `<a id="adr-027-amend-2"></a>` |
| `## Amendment 3 (2026-05-27) — UI 판정 다중신호 절차 단일 SSOT` | `<a id="adr-027-amend-3"></a>` |
| `## Amendment 4 — bootstrap-design --update 모드` | `<a id="adr-027-amend-4"></a>` |

**(c) `## Surfaces` 블록 추가** — `## 참고`(`- ADR-006 ...`) *앞*에 삽입:
```
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
- .claude/skills/bootstrap-design/SKILL.md           — #amend-2 R5/R0, #amend-4 --update
- docs/20-system/DESIGN.md                            — #amend-2 §9 Don'ts, §8 Motion
- .claude/skills/stack-guard/SKILL.md                — #amend-2 design.md lint 권장
- docs/00-meta/WORKFLOW.md                            — #amend-2 §2 승인 게이트
```

### 3.2 STRUCTURE.md ADR-027 Canonical Owner 셀 포인터화 + 줄번호 제거

**파일**: `docs/00-meta/STRUCTURE.md` — Canonical Owner 표의 `DESIGN.md + ARCH 7-1~7-4 cross-surface enforcement` 행.

**현재(before)** — 그 행의 값 셀은 surface를 산문으로 길게 나열하고 `validator.md L44~48`을 포함한다.

**변경(after)** — 값 셀을 다음으로 교체:
```
[ADR-027](../90-decisions/boilerplate/ADR-027-interface-decision-allocation.md) #amend-1 (정책 SSOT). 적용 파일 전체는 ADR-027 `## Surfaces` 참조 (fan-out SSOT — ADR-045 D3). UI 판정 다중신호 절차 = ADR-027#amend-3 SSOT.
```
> 이 한 줄이 기존의 긴 산문 나열을 대체한다. `validator.md L44~48` 줄번호 표기는 이 교체로 제거된다.

### 3.3 ADR-038 이관

**파일**: `docs/90-decisions/boilerplate/ADR-038-cross-llm-plan-validation.md`

**(a) `## 현재 유효 결정` 추가** — `## Status`/`accepted` 아래(`## 배경` 앞):
```
## 현재 유효 결정
- `/validate-plan`(타 세션·타 LLM 비판 리뷰, 문서 수정 X) + `/repair-plan`(회수·수용·기각 후 문서 수정) opt-in 추가.
- 리뷰 파일은 `docs/40-validation/plan-reviews/<workitem-id>.<reviewer-tag>.md`(ephemeral). 같은 tag 재실행은 #amend-2로 *덮어쓰기 대신 `<tag>-N` 자동 suffix*.
- `/plan-workitem`이 `## 9. 의존성` 위상정렬 wave 그룹을 echo(영속 저장 X). 병렬 implement는 `claude --worktree T-NNN` 권장.
- Plan Quality 차원은 #amend-1로 8→10(ADR-027#amend-1 양립).
```

**(b) Amendment anchor 2개 추가** — 각 헤딩 바로 위:

| 현재 헤딩 | 위에 추가할 줄 |
|-----------|----------------|
| `## Amendment 1 — Plan Quality 차원 8 → 10 ...` | `<a id="adr-038-amend-1"></a>` |
| `## Amendment 2 — 리뷰 파일 충돌 정책 정정 ...` | `<a id="adr-038-amend-2"></a>` |

**(c) `## 결과`의 인라인 surface 나열을 `## Surfaces`로 승격.**

현재(before) — `## 결과` 안:
```
- 적용 surface (8곳):
  1. `.claude/skills/validate-plan/SKILL.md` 신설.
  2. `.claude/skills/repair-plan/SKILL.md` 신설.
  3. `.claude/skills/plan-workitem/SKILL.md` parallel waves 출력 + cross-review hook 안내 + worktree 권장.
  4. `.claude/agents/reviewer.md` 4번째 surface "plan" + Plan Quality 10 차원 (ADR-027 amend 1) + Write 범위 확장.
  5. `.agents/skills/validate-plan/` Codex wrapper.
  6. `.agents/skills/repair-plan/` Codex wrapper.
  7. `docs/00-meta/STRUCTURE.md` + `docs/00-meta/WORKFLOW.md` + `docs/00-meta/DELEGATION_STRATEGY.md` sub-loop + worktree 권장.
  8. `.gitignore` `plan-reviews/*.md` + `.claude/worktrees/` 패턴 + `README.md` + `README_ko.md` flow 다이어그램.
```
변경(after) — 위 8줄(중복 산문)을 `## Surfaces`로 *이전*한다(ADR=Record 정합 — 내용은 소실되지 않고 이동). `## 결과`에는 삭제가 아니라 이전을 명시하는 포인터 한 줄을 남긴다:
```
- 적용 surface(구 "8곳" 목록)는 본 ADR `## Surfaces`로 이전 (fan-out SSOT — ADR-045 D3).
```
그리고 `## 후속 작업` *앞*(또는 `## 참고` 앞)에 새 블록 추가:
```
## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT)
- .claude/skills/validate-plan/SKILL.md         — D1 신설
- .claude/skills/repair-plan/SKILL.md            — D1 신설
- .claude/skills/plan-workitem/SKILL.md          — D3 wave echo + cross-review hook + worktree
- .claude/agents/reviewer.md                      — D4 plan surface + Plan Quality 10(#amend-1)
- .agents/skills/validate-plan/                   — D5 Codex wrapper
- .agents/skills/repair-plan/                     — D5 Codex wrapper
- docs/00-meta/STRUCTURE.md                        — 산출물 표(plan review) + Canonical Owner
- docs/00-meta/WORKFLOW.md                         — §3 opt-in sub-loop
- docs/00-meta/DELEGATION_STRATEGY.md              — 위임 트리거 echo
- .gitignore                                       — plan-reviews/*.md + .claude/worktrees/
- README.md / README_ko.md                         — flow 다이어그램
```

### 3.4 줄번호/line 참조 전수 제거 (Phase 3 합계 4곳 — 3.2 STRUCTURE 1곳 + 본 단계 3곳)

**파일**: `.claude/skills/stabilize-milestone/SKILL.md` (§1.0 #5의 "7-3 백엔드 / 7-4 프론트" 노트)

**현재(before)**:
```
per-task validate-workitem (validator.md L44) 의 CHECK 단계가 task 단위로 점검
```
**변경(after)**:
```
per-task validate-workitem (validator.md 의 인터페이스 CHECK 규칙 — UI/API/CLI/7-x) 의 CHECK 단계가 task 단위로 점검
```

**추가 — `§N line N` 줄참조 2곳** (`WORKFLOW.md §4 line 25` 형태): `docs/90-decisions/boilerplate/ADR-038-cross-llm-plan-validation.md`(D3 본문)와 `.claude/skills/plan-workitem/SKILL.md`의 `WORKFLOW.md §4 line 25` → `WORKFLOW.md \`## 4\`(task \`## 4-1\` 채움 시점 정책)`로 교체(`line 25` 제거 — 내용 서술자).

**검증**: `git grep -nE "[A-Za-z0-9_.-]+\.md.{0,2}L[0-9]+"` + `git grep -nE "§ ?[0-9]+ ?line"` 둘 다 0건(템플릿 예시·코드블록 제외). ADR-027/038에 `## Surfaces`·`## 현재 유효 결정`·anchor가 존재.

**Commit**: `docs(adr): migrate ADR-027/038 to reference contract and drop line-number refs`

---

## Phase 4 — deterministic preflight / review-doc 점검 확장 (계약 의존)

> 계약이 지켜지는지 기계가 *보고만* 하게 만든다(자동 차단 X — stabilize 책임 경계 정합).

### 4.1 stabilize preflight 확장

**파일**: `.claude/skills/stabilize-milestone/SKILL.md` — `### 1.0. Deterministic pre-flight`

현재 항목 2는 `[ADR-NNN]` 패턴 존재만 점검한다. 항목 2를 다음으로 *교체/확장*한다:

```
2. **ADR 참조 유효성 (ADR-045 D1·D8)**:
   - `ADR-NNN` 참조 → 실제 파일 존재 매칭. 예외(오류 아님): (a) `<!-- -->` 주석 안 참조, (b) **allowlist된 ADR-100/101**의 bootstrap 전 미존재, (c) Reserved/Parked/Dropped 표 등재 번호. boilerplate(001~099) 미존재 → `P1 [ADR-ref]`. **그 외 project ADR(102+) 미존재 → `P2 [ADR-ref-project]`** (무시 X).
   - **앵커 존재 (ADR-045 D2)**: `ADR-NNN#amend-M` → 대상 ADR에 `## Amendment M`(또는 `<a id="adr-NNN-amend-M">`) 존재. 누락 시 `P1 [Ref-anchor] <file:line>`. (`#dK`는 token-only — 대상 ADR에 "K." 결정 항목 존재는 *best-effort*, 미존재 의심만 `P2`.)
   - **내부 anchor 링크 (ADR-045 D9)**: `[label](file.md#anchor)`의 anchor가 대상 파일에 `<a id>` 또는 대응 heading으로 실재. 누락 시 `P1 [Link-anchor] <file:line>`.
   - **Surfaces forward check (ADR-045 D3·D4)**: `## Surfaces` 블록을 가진 각 ADR에 대해 — 등재 파일이 모두 존재하고 본문에 `ADR-NNN` 역참조를 갖는가. 누락 시 `P1 [Surface-backref] ADR-NNN → <file>`. **이 forward 방향만 Phase 4 범위** (역방향은 휴리스틱이라 Phase 5 검토).
   - **죽은 ADR 인용**: 인용된 ADR의 `## Status`가 `superseded`/`deprecated`면 `P2 [Ref-dead] <file:line>`.
   - **인덱스 amend 동기**: `boilerplate/README.md` Amendments 컬럼 amend 수 ↔ 본문 `## Amendment N` 수 일치(불일치 `P1 [ADR-index]`). (review-doc과 중복 가능.)
```

### 4.2 review-doc 단일 문서 점검 보강

**파일**: `.claude/skills/review-doc/SKILL.md`

현재(before) — 조건부 점검 목록(`docs/90-decisions/boilerplate/README.md` ... 점검) 끝에 한 줄 추가:
```
- 검토 대상이 `## Surfaces` 블록을 가진 ADR이면, 등재된 각 surface 파일에 해당 `ADR-NNN` 역참조가 있는지 spot-check. 누락 시 P1 `[Surface-backref]` 보고 (ADR-045 D4).
```

**검증**: stabilize를 `--dry-run` 없이 1회 돌렸을 때 새 라벨(`[Ref-anchor]`, `[Surface-backref]`)이 동작하고, 정상 상태에선 새 P1이 0건.

**Commit**: `feat(stabilize): extend doc-reference preflight with anchor and surfaces checks`

---

## Phase 5 — 전체 통일 (full migration)

> 저장소의 기존 *ADR citation·markdown 링크·section 링크·fan-out surface*를 ADR-045 형식으로 일괄 통일한다(산문 속 단순 언급은 대상 아님 — D9). 민감·대규모라 (a) 카테고리별 1 sub-step = 1 commit, (b) 각 step 끝에 **Phase 6 검증 배터리의 해당 항목**을 돌려 green일 때만 다음으로 간다.
>
> **불변 원칙 (절대 위반 금지)**: ADR은 Record(WORKFLOW "문서 운영"). **결정 본문 텍스트는 한 글자도 바꾸지 않는다** — 추가하는 것은 *anchor 줄 / `## Surfaces` 블록 / `## 현재 유효 결정` 요약 / 참조 토큰 표기 정규화*뿐. 결정의 *의미*가 바뀌면 그건 이관이 아니라 새 ADR(D6) 사안이다.

### 5.0 사전 안전장치 (먼저)
```bash
git switch -c chore/doc-reference-contract          # 전용 브랜치
# baseline 기록 (Phase 6에서 비교)
git grep -nE "amend[ -]?[0-9]|[Aa]mendment[ -]?[0-9]" -- ':(exclude)IMPROVE-GUIDE.md' | wc -l   # 시작 amend 토큰 수(~131; 가이드 자신 제외)
```
- 각 sub-step은 독립 commit — 문제 시 그 commit만 `git revert`.
- 실행 순서: **amend 토큰(5.B) → cited anchor(5.A) → 결정 참조(5.C) → Surfaces(5.D) → 표 포인터(5.E) → backref(5.F) → 비-ADR 링크(5.I)**. (5.A를 5.B 뒤에 두는 이유: 정규화된 `#amend-M` 인용을 grep해 *cited 대상*만 정확히 추리기 위함. 5.G는 D7 트리밍으로 제외.)

### 5.A cross-cited amendment 헤딩에 stable anchor (전수 X — D2 정합, 5.B 뒤 실행) — 부록 A1
**다른 파일에서 `ADR-NNN#amend-M`으로 인용되는 amendment에만** 헤딩 *바로 위 줄*에 `<a id="adr-NNN-amend-M"></a>`를 추가한다(소비자 없는 anchor는 박지 않음 — D2 "외부 인용 시에만"). 5.B 정규화 후 인용 타깃을 grep으로 추출해 *그 파일이 해당 ADR이 아닌* 경우의 타깃에만 anchor.
```bash
git grep -hoE "ADR-[0-9]+#amend-[0-9]+" | sort -u   # 인용된 (ADR, amend) 쌍 → 그 타깃에만 anchor
```
- cited 집합 예: ADR-027 #amend-1/2/3 · ADR-038 #amend-1/2 · ADR-035 #amend-2. **이 중 027·038은 Phase 3에서 anchor 완료** → 5.A 신규 작업 = ADR-035 #amend-2 + grep로 드러나는 나머지. 정확 집합은 grep으로 확정.
- 인용 안 되는 amendment는 anchor 불필요 — 처음 인용될 때 lazy 추가.
- 검증(Phase 6 #3): 모든 `ADR-NNN#amend-M` 링크 타깃에 anchor 존재.
- **Commit**: `docs(adr): add stable anchors to cross-cited amendment headings`

### 5.B amend 인용 토큰 전수 정규화 → `ADR-NNN#amend-M`
**규칙(엄수)**:
- 본문 헤딩 `## Amendment N`은 **보존**(위에 anchor만 붙는다).
- 인용 정규화: cross-file은 완전형 `ADR-NNN#amend-M`, *같은 ADR 본문 내 자기참조*는 짧은 `#amend-M` 허용(파일 안이라 ADR 번호 자명 — verbose 회피). bare `amend 1`·`amend1`·`amendment 1` prose는 전부 제거.
- **`amend M 결정 K`처럼 결정과 붙은 compound는 5.B에서 건드리지 않는다** — 5.C가 통째로 `ADR-NNN#dK`로 변환(amend 토큰 흡수). 5.B는 *standalone amend 인용*만 정규화(이중 처리·순서 충돌 회피).
- 빈도순 작업(부록 A4): `ADR-027`(본문) → `reviewer.md` → `ADR-006` → `stabilize-milestone` → `plan-workitem` → `ADR-038` → … 전 39파일.
- 검증(Phase 6 #1): `git grep -nE "amend[ -]?[0-9]"`에서 `## Amendment`·`#amend-` 제외 시 **0줄**.
- **Commit**: `docs(adr): normalize all amendment citation tokens to ADR-NNN#amend-M`

### 5.C 결정-번호 cross-file 참조 정규화 → `ADR-NNN#dK` — 부록 A3
부록 A3 표의 *파일 간* 결정 참조를 `ADR-NNN#dK`로 바꾼다(결정 번호는 ADR 안에서 전역 유일 → `amend M` 중간 토큰 제거: `ADR-027 amend 2 결정 21` → `ADR-027#d21`, `ADR-038 D6` → `ADR-038#d6`).
- **같은 ADR 본문 내부**의 로컬 결정 목록·자기참조(`결정 (15개)`, `1.`~`27.`, 마이그레이션의 `결정 21 →`)는 **보존**(로컬 맥락·가독성).
- 검증(Phase 6 #7): cross-file 결정 참조 grep 결과가 부록 A3 외(=같은-ADR 로컬)만 남음.
- **Commit**: `docs(adr): normalize cross-file decision references to ADR-NNN#dK`

### 5.D 나머지 cross-surface ADR Surfaces — 부록 A2
- **Surfaces 추가(6개)**: ADR-014/022/035/037/039/044에 부록 A2의 pre-written `## Surfaces` 블록을 `## 참고` 앞에 삽입(027/038은 Phase 3 완료).
- **현재 유효 결정**: Phase 5 추가분 없음 — D5 트리거가 *amend ≥4 또는 정정성*이라 027·038(둘 다 Phase 3 완료)만 해당. ADR-007(순수 확장 amend 3개)은 fold 부담이 작아 요약 불필요(과잉 sync 지점 회피).
- **후보 확인(executor 판단)**: ADR-010/026 등 `적용 surface`(또는 마이그레이션)가 *2개 파일 이상*이면 Surfaces 추가, 1파일이면 skip(예: ADR-042 §8-1 단일 → skip). 판정 근거 = D3 정의("결정 바뀌면 그 파일도 반드시 바뀜").
- 검증(Phase 6 #4): 부록 A2의 8개 ADR 모두 `## Surfaces` 존재.
- **Commit**: `docs(adr): add Surfaces blocks to remaining cross-surface ADRs`

### 5.E Canonical Owner 표 전체 포인터화 — 부록 A6
`docs/00-meta/STRUCTURE.md` Canonical Owner 표의 cross-surface 행(014/022/035/037/038/039; 027은 Phase 3 완료)에서 *산문 surface 나열*을 `→ ADR-NNN ## Surfaces (fan-out SSOT)` 포인터로 교체(정책 SSOT·특이사항 1줄은 유지). 표에 없던 **044**(cross-surface)는 pointer 행 추가. **042는 단일 surface(§8-1 1곳)라 `## Surfaces` 블록이 없으므로 Canonical Owner pointer 행도 만들지 않는다**(압축 규칙 — Surfaces 없는 ADR을 포인터로 가리키면 dangling).
- **Commit**: `docs(structure): collapse canonical-owner cells to ADR Surfaces pointers`

### 5.F 등재 surface 파일 backref 보강 (D4)
5.D에서 `## Surfaces`에 등재한 모든 파일이 본문 어딘가에 자신을 고정하는 `ADR-NNN`(또는 `ADR-NNN#amend-M`) 역참조를 갖는지 확인 — 없으면 자기 영역 규율 줄에 `(ADR-NNN)` 1개 추가. **Codex wrapper(`.agents/skills/...`) 포함.**
- 검증(Phase 6 #4 backref): green.
- **Commit**: `docs: add ADR backrefs to all registered surface files`

### 5.G (제외됨) last-reviewed 컬럼 — migration 범위 밖 (D7 트리밍)
*수행하지 않는다.* 0-fork 보일러플레이트엔 검토 cadence가 없어 컬럼이 stale 거짓 메타가 된다. 정기 검토를 실제 도입하는 fork에서만 별도 추가. (D7의 **dropped 사유 인라인**은 신규 drop 발생 시에만 — 현재 작업 없음.)

### 5.I 비-ADR 문서 cross-ref 섹션 stable anchor + 링크 정규화 (D9) — 부록 B
부록 B의 *링크로 가리켜지는* 비-ADR 섹션에 영문 slug `<a id>` anchor를 추가하고, 그것을 가리키는 모든 링크(부록 B "링크 사이트")를 stable anchor로 교체한다.
- 템플릿의 *예시 링크*(`<!-- 예: ... -->` 안)도 새 anchor로 갱신 — fork 사용자가 복제하는 형식이라 여기서 통일돼야 전파된다.
- 한글 자동 anchor는 그대로 두되(병존), *링크*만 stable anchor로 이동.
- 검증(Phase 6 #9): 모든 내부 `.md#anchor` 링크가 실재 anchor로 해소.
- **Commit**: `docs: add stable anchors to cross-referenced doc sections and normalize links (ADR-045 D9)`

### 5.H 신규 ADR 의무화 (작업 없음, 문서화 확인만)
ADR-045 D-정책상 이후 새 ADR은 작성 시점부터 형식 적용 — 별도 마이그레이션 불필요.

---

## Phase 6 — 전수 검증 배터리 (완벽 통일 확인)

> 아래 9개가 **모두 expected**면 "전체 통일 완료". `git grep`은 OS 공통이지만 **파이프라인(`| grep -v`, `wc -l`, `sort -u`)은 Git Bash에서 실행**한다(순수 PowerShell이면 `git grep` 결과를 `Select-String -NotMatch`·`Sort-Object -Unique`로 대체). markdown-link-check 미설치 항목만 skip 가능(#6 참조).
>
> **⚠️ 본 가이드 자신(`IMPROVE-GUIDE.md`)은 검색 대상에서 제외한다** — 가이드는 예시로 *제거 대상 'bad' 패턴*(`§4 line 25`, `amend 1`, `ADR-038 D6` 등)을 담고 있어 grep이 자기 자신을 false-positive로 잡는다. 가이드를 untracked로 두면 `git grep`이 자동 제외하지만, 커밋했다면 **각 명령 끝에 `-- ':(exclude)IMPROVE-GUIDE.md'`** 를 붙인다.

1. **amend 토큰 정규화** — 헤딩·`#amend-` 외 잔존 0:
   ```bash
   git grep -nE "amend[ -]?[0-9]|[Aa]mendment[ -]?[0-9]" | grep -vE "## Amendment|#amend-"
   ```
   expected: 출력 없음(대·소문자 변형 모두 포함).
2. **줄번호/line 참조 0**:
   ```bash
   git grep -nE "[A-Za-z0-9_.-]+\.md.{0,2}L[0-9]+"   # validator.md L44 형태
   git grep -nE "§ ?[0-9]+ ?line"                      # WORKFLOW.md §4 line 25 형태
   ```
   expected: 둘 다 출력 없음(`§1.0`·`§5-1`·`§14` 등 섹션 앵커는 `line` 토큰이 없어 안 걸림 — 정상).
3. **cited amendment에 anchor**(전수 25 아님 — cited-only, D2): 모든 `ADR-NNN#amend-M` 링크 타깃에 `<a id>` 존재.
   ```bash
   git grep -hoE "ADR-[0-9]+#amend-[0-9]+" | sort -u   # 인용 타깃 추출 → 각 ADR에서 anchor 확인
   ```
4. **Surfaces 완비**: 부록 A2의 8개 ADR(+ ADR-045 자신 = 9개+ 파일)에 `## Surfaces`가 있고, A2 8개의 등재 파일이 모두 (a) 실제 존재 (b) 본문에 `ADR-NNN` backref 보유.
   ```bash
   git grep -l "^## Surfaces" docs/90-decisions/boilerplate   # 9개+ (A2 8개 + ADR-045 자기 dogfood; 5.D 후보 010/026 채택 시 그만큼 더)
   ```
5. **인덱스 amend 동기**: 각 ADR 본문 `## Amendment` 수 == `boilerplate/README.md` Amendments 컬럼(15개 ADR 전부 일치).
6. **내부 링크**: `markdown-link-check`(주석·외부 URL·100+ project ADR 제외 — ADR-045 D8). 깨진 내부 링크 0. 동일 도구가 stabilize §1.0 #1(=#8 checker)에도 쓰여 일반 `[label](file.md)` 파일 존재를 커버한다. *도구가 아예 없으면* 일반 파일-링크 존재는 grep으로 완전 대체 불가 → 수동 spot-check(anchor 해소는 #9, ADR·Surfaces 참조는 #3·#4가 grep 커버).
7. **결정-참조 정규화**:
   ```bash
   git grep -nE "ADR-[0-9]+ ?(amend ?[0-9] ?)?(결정|[Dd])[ #]?[0-9]"
   ```
   expected: 부록 A3 외(=같은-ADR 본문 로컬 참조)만 남음.
8. **checker green**: Phase 4 preflight 1회(또는 `/stabilize-milestone --dry-run` 후속) — 새 라벨 `[Ref-anchor]`/`[Surface-backref]`/`[ADR-index]`/`[ADR-ref-project]`/`[Link-anchor]` 0건.
9. **내부 anchor 링크 해소 (D9)** — 모든 `[label](*.md#anchor)`의 anchor가 대상 파일에 `<a id="anchor">` 또는 대응 heading으로 실재(부록 B로 대조):
   ```bash
   git grep -noE "\]\([^)]*\.md#[^)]*\)"
   ```
   expected: 각 anchor가 대상 파일에 실재(깨진 anchor 0).

하나라도 fail이면 해당 Phase 5 sub-step으로 돌아가 수정 후 재검증.

---

## 완료 체크리스트

- [ ] Phase 0: ADR-038 인덱스 amend2 반영
- [ ] Phase 1: ADR-045 본문 + 인덱스 행
- [ ] Phase 2: _ADR_GUIDE(amend기준·권장섹션·참조표기) + STRUCTURE(연결원칙·절차)
- [ ] Phase 3: ADR-027/038 이관(현재유효결정·anchor·Surfaces) + 줄번호/line 참조 전수 제거(4곳) + STRUCTURE 셀 포인터화
- [ ] Phase 4: stabilize preflight 확장 + review-doc backref 점검
- [ ] Phase 5.A: cross-cited amendment anchor (전수 X, 5.B 뒤)
- [ ] Phase 5.B: amend 인용 토큰 전수 정규화 (헤딩·#amend- 외 0)
- [ ] Phase 5.C: 결정-번호 cross-file 참조 정규화 (→ #dK)
- [ ] Phase 5.D: cross-surface ADR 6개 Surfaces
- [ ] Phase 5.E: Canonical Owner 표 전체 포인터화
- [ ] Phase 5.F: 등재 surface 파일 backref 보강
- [ ] Phase 5.G: (제외 — last-reviewed, D7 트리밍)
- [ ] Phase 5.I: 비-ADR 문서 섹션 stable anchor + 링크 정규화 (D9)
- [ ] Phase 6: 전수 검증 배터리 9/9 green
- [ ] 모든 Phase 완료 후 본 `IMPROVE-GUIDE.md` 삭제 — `docs: delete IMPROVE-GUIDE`

## 실행 순서 근거 (의존관계)

```
Phase 0 (독립 버그)  ──┐
Phase 1 (ADR-045 계약) ─┼─→ Phase 2 (가이드 문서 반영) ─→ Phase 3 (파일럿 이관) ─→ Phase 4 (checker) ─→ Phase 5 (전체 통일) ─→ Phase 6 (전수 검증)
                        └  Phase 2~6은 모두 Phase 1의 계약 정의에 의존
```
- Phase 0은 정책 의존이 없어 가장 먼저(또는 병렬).
- Phase 4(checker)는 report-only라 Phase 5 앞에 둬도 안전하고, Phase 5 각 step의 *검증 도구*로 재사용된다.
- Phase 5 실행 순서는 5.B→5.A→5.C→5.D→5.E→5.F→5.I (5.0 참조; 5.G 제외, D7 트리밍).
- Phase 6 전수 검증 9/9 green이어야 "전체 통일 완료".

---

## 부록 A — 전수 인벤토리 (Phase 5/6의 obsessive 데이터)

### A1. 전체 amendment 목록 (참고용 — 5.A anchor 대상은 cited-only, 표 아래 주석 참조)

| ADR | 개정 | anchor id | 날짜 |
|-----|------|-----------|------|
| 000 | 1 | adr-000-amend-1 | 2026-05-16 |
| 004 | 1 | adr-004-amend-1 | 2026-05-16 |
| 006 | 1,2 | adr-006-amend-1, -2 | 05-16, 05-27 |
| 007 | 1,2,3 | adr-007-amend-1, -2, -3 | 05-15, 05-16, 05-27 |
| 008 | 1,2 | adr-008-amend-1, -2 | 05-15 |
| 009 | 1 | adr-009-amend-1 | 05-15 |
| 010 | 1,2 | adr-010-amend-1, -2 | 05-16 |
| 014 | 1 | adr-014-amend-1 | 05-16 |
| 017 | 1 | adr-017-amend-1 | 05-16 |
| 021 | 1 | adr-021-amend-1 | 05-15 |
| 026 | 1 | adr-026-amend-1 | 05-15 |
| 027 | 1~4 *(Phase 3)* | adr-027-amend-1 … -4 | amend3: 05-27 |
| 035 | 1,2 | adr-035-amend-1, -2 | 05-16, 05-27 |
| 037 | 1 | adr-037-amend-1 | 05-16 |
| 038 | 1,2 *(Phase 3)* | adr-038-amend-1, -2 | — |

(위는 전체 amendment *참고용 인벤토리*. 5.A anchor 대상은 cross-cited만 — 예: ADR-035 #amend-2 [027·038은 Phase 3 완료]. 정확 집합은 5.B 후 grep로 확정.)

### A2. Surfaces 블록 (cross-surface ADR 8개 — 027·038은 Phase 3 본문, 아래 6개 그대로 삽입)

**ADR-014**:
```
## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT)
- .claude/skills/stabilize-milestone/SKILL.md         — #d3 graduation pre-check §1.5, #amend-1 evaluator-optimizer 1줄
- docs/30-workitems/_templates/MILESTONE_TEMPLATE.md  — #d1 §5 완료기준 5+1, #d2 §8 회고
- docs/00-meta/DELEGATION_STRATEGY.md                 — #amend-1 evaluator-optimizer 1줄
```
**ADR-022**:
```
## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT)
- docs/40-validation/QA_FINDINGS.md                   — evidence label 스키마
- docs/40-validation/IMPROVEMENT_GUIDE.md             — evidence label 스키마
- .claude/agents/builder.md                            — self-check 1줄(제약 vs 권장)
- docs/90-decisions/boilerplate/_ADR_GUIDE.md          — Ratchet Principle 단락
```
**ADR-035**:
```
## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT)
- AGENTS.md                                            — DISCOVERY=SSOT 1줄
- docs/10-charter/PROJECT_CHARTER.md                   — 본문 끝 staleness 안내
- docs/10-charter/_templates/DISCOVERY_TEMPLATE.md     — #amend-2 §14 Evidence / §15 Insight
- .claude/skills/stabilize-milestone/SKILL.md          — #amend-1 §6.5 staleness (#amend-2 4번째 시그널)
- .claude/skills/discover-product/SKILL.md             — #amend-2 R-E Evidence 회수 / --update
```
**ADR-037**:
```
## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT)
- docs/30-workitems/_templates/FEATURE_TEMPLATE.md     — #amend-1 §7-1 FAC↔AC 매핑표
- .claude/skills/plan-workitem/SKILL.md                — #amend-1 영속 저장 + 출력 echo
- .claude/skills/validate-workitem/SKILL.md            — #d1 Spec coverage audit
- .claude/agents/validator.md                           — #d1 FAC→AC 매핑 점검
- .claude/skills/stabilize-milestone/SKILL.md          — #amend-1 §1.0 FAC unmapped 점검
```
**ADR-039**:
```
## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT)
- docs/30-workitems/_templates/TASK_TEMPLATE.md        — #d1 §0-1 Type 필드 + 분기 주석
- docs/30-workitems/_templates/FEATURE_TEMPLATE.md     — #d1 §0-1 Type 필드
- .claude/skills/plan-workitem/SKILL.md                — #d3 Type 라우팅 단락
```
**ADR-044**:
```
## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT)
- .claude/skills/validate-discovery/SKILL.md           — #d1 신설
- .claude/skills/repair-discovery/SKILL.md             — #d2 신설 (agent: architect)
- .claude/agents/reviewer.md                            — #d3 discovery surface 8 차원
```
> `docs/40-validation/discovery-reviews/`(ADR-044)·`plan-reviews/`(ADR-038)는 *산출물 위치*지 content surface가 아니다 — Surfaces 등재·backref 대상에서 제외(STRUCTURE 산출물 표가 담당).

### A3. 결정-번호 cross-file 참조 사이트 (Phase 5.C 대상)

| 현재 표기 | 정규형 | 위치 |
|-----------|--------|------|
| ADR-038 D6 | ADR-038#d6 | WORKFLOW.md(2), DELEGATION_STRATEGY.md, plan-workitem/SKILL.md |
| ADR-038 D3 | ADR-038#d3 | plan-workitem/SKILL.md |
| ADR-038 D2 | ADR-038#d2 | reviewer.md |
| ADR-027 amend 1 결정 19 | ADR-027#d19 | stabilize-milestone/SKILL.md |
| ADR-027 amend 1 결정 18 | ADR-027#d18 | ADR-038(#amend-1 본문) |
| ADR-027 amend 2 결정 21 | ADR-027#d21 | bootstrap-design/SKILL.md, WORKFLOW.md |
| (amend 2) 결정 22 | ADR-027#d22 | bootstrap-design/SKILL.md |
| (amend 2) 결정 23 | ADR-027#d23 | DESIGN.md |
| (amend 2) 결정 24 | ADR-027#d24 | stack-guard/SKILL.md, DESIGN.md |
| (amend 2) 결정 25 | ADR-027#d25 | stack-guard/SKILL.md |
| ADR-027 amend 1 결정 16~20 | ADR-027#d16…#d20 | .boilerplate/validation/SIMULATION_RUN.md *(boilerplate-only meta — 우선순위 낮음)* |

### A4. amend 토큰 baseline (Phase 5.B 진척 추적)
시작 ~131건/39파일. 빈도 상위: ADR-027 본문(10) · reviewer.md(9) · ADR-006(9) · stabilize-milestone(8) · plan-workitem(8) · ADR-038(7) · finalize-workitem(4) · validate-workitem(4) · STRUCTURE.md(4) · ADR-000/007/008/bootstrap-design(각 3). `git grep -c`로 파일별 0(헤딩·`#amend-` 제외)까지 추적.

### A5. `## 현재 유효 결정` 필수 ADR (D5 트리거 = amend ≥4 또는 정정성 amend)
{ ADR-027(amend 4 + #amend-2 정정) · ADR-038(#amend-2 정정) } — **둘 다 Phase 3 완료**. Phase 5 추가분 없음. (ADR-007은 순수 확장 amend 3개라 트리거 미달 → 요약 불필요.)

### A6. Canonical Owner 표 포인터화 행 (Phase 5.E)
014 · 022 · 027*(Phase 3)* · 035 · 037 · 038 · 039 + (표에 없던 신규 pointer 행) **044**. (042는 단일 surface → `## Surfaces` 없음 → Canonical Owner 등재·포인터 안 함.)

## 부록 B — 비-ADR 문서 참조 인벤토리 (Phase 5.I — D9)

### B1. stable anchor 대상 섹션 + 링크 사이트
헤딩 *바로 위 줄*에 `<a id="...">`를 추가하고, "링크 사이트"의 링크 anchor를 한글 자동 anchor → stable slug로 교체한다(한글 anchor는 병존).

| 문서 | 섹션 | 추가 anchor | 링크 사이트(현재 자동 anchor) |
|------|------|-------------|-------------------------------|
| ARCHITECTURE_OVERVIEW.md | ## 7-1 API | arch-7-1 | TASK·FEATURE_TEMPLATE (#7-1-api-컨벤션) |
| ARCHITECTURE_OVERVIEW.md | ## 7-2 CLI | arch-7-2 | (현재 링크 무 — 일관성 위해 권장) |
| ARCHITECTURE_OVERVIEW.md | ## 7-3 백엔드 | arch-7-3 | (현재 링크 무 — 일관성 위해 권장) |
| ARCHITECTURE_OVERVIEW.md | ## 7-4 프론트 | arch-7-4 | TASK_TEMPLATE (#7-4-프론트-결정) |
| DESIGN.md | ## 2 Colors | design-2-colors | TASK_TEMPLATE (#2-colors) |
| DESIGN.md | ## 7 Components | design-7-components | TASK·FEATURE_TEMPLATE (#7-components) |
| DESIGN.md | ## 8 Motion | design-8-motion | (ADR-027 본문 shorthand — 링크화 시) |
| DESIGN.md | ## 9 Do's and Don'ts | design-9-donts | (reviewer shorthand — 링크화 시) |
| GUARDRAILS_STRATEGY.md | ## /stack-guard 1단계 산출물 범위 | guardrails-stack-guard-scope | stack-guard/SKILL.md (#stack-guard-1단계-산출물-범위) |
| DELEGATION_STRATEGY.md | (Mid-project 문서 갱신 동선 섹션) | delegation-midproject | WORKFLOW.md (#mid-project-문서-갱신-동선) |
| STRUCTURE.md | ## 문서 연결 원칙 | structure-doc-linking | ADR-045 `## Surfaces` — anchor는 **Phase 2.2(a-2)**, 링크는 **Phase 1에서 이미 `#structure-doc-linking`** → **5.I 작업 없음** |

> 7-2·7-3은 현재 inbound 링크가 없어 *선택*(7-1·7-4와 형제 일관성 권장). 나머지는 실제 링크가 있어 *필수*.

### B2. 라벨 블록 표준 (형식 보존 — 신규 작업 아님)
workitem→상위 참조의 표준 = TASK `## 7. 관련 문서` / FEATURE `## 11. 관련 문서`의 `Milestone / Feature / Architecture / Architecture-Iface / Design / ADR` 라벨 + markdown 링크. 본 형식을 유지하고, B1 anchor 도입에 맞춰 **템플릿 예시 링크의 anchor만 갱신**(`#7-1-api-컨벤션` → `#arch-7-1`, `#7-components` → `#design-7-components` 등).

---

> **요약**: 모든 변경은 ADR=Record 원칙상 *결정 본문 불변, 참조·anchor·Surfaces·요약 부가만*. Phase 0→1→2→3→4→5→6 순서로 실행하고 매 step마다 Phase 6 해당 항목으로 검증한다. 전 Phase 완료 + Phase 6 9/9 green 후 본 `IMPROVE-GUIDE.md` 삭제(`docs: delete IMPROVE-GUIDE`).