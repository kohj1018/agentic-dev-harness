# ADR-045 — 문서 참조 계약 (document reference contract)

> scope: boilerplate
> area: process

## Status
accepted

## 현재 유효 결정
- ADR 간 모든 참조는 정규 ID로 쓴다: `ADR-NNN` / `ADR-NNN#amend-M` / `ADR-NNN#dK`. **줄번호/line-number 참조(파일명 뒤 `L+숫자` 형태) 금지.**
- 다른 파일에서 인용되는 amendment 헤딩 위에는 stable anchor를 둔다(결정은 anchor 없이 `#dK` 토큰).
- cross-surface 정책 ADR은 `## Surfaces` 블록을 *fan-out SSOT*로 둔다. STRUCTURE.md Canonical Owner 셀은 그 포인터만 둔다(산문 나열 중복 제거).
- 다개정(amend **4개 이상** 또는 정정성 amend 포함) ADR은 상단에 `## 현재 유효 결정` 요약(≤6줄)을 둔다.
- amend는 작게 유지. 정책 의미 변경·기존 결정 뒤집기·surface 5+ 추가·개정(amend) 4개 이상 누적은 신규 supersede ADR로 간다(ADR-045 이후 *신규 변경* 기준 — 기존 ADR은 grandfather, D6).
- **비-ADR 문서끼리의 링크·섹션 참조도 동일 규약**(상대경로 markdown 링크 + cross-ref 섹션엔 stable anchor) — D9.
- 신규 ADR은 본 계약을 의무 적용. 기존 ADR/문서는 *많이 인용되는 것부터* 점진 이관.

## 배경
- [관측됨] `boilerplate/README.md` ADR-038 행 Amendments 컬럼이 첫 개정만 표기돼 본문 `## Amendment 2`와 어긋났다(인용 drift 실재).
- [관측됨] `STRUCTURE.md` Canonical Owner 표와 `stabilize-milestone/SKILL.md` §1.0 노트가 `validator.md` 줄번호 형태로 참조 — line shift에 취약.
- [관측됨] `amend` 토큰이 39개 파일 131회, `amend N / amendN / Amendment N` 표기 혼재 → grep 일관 검색 불가.
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

- **유일한 hard ban: 줄번호/line 참조**(validator.md 줄번호 참조, WORKFLOW.md §4 줄번호 참조 등) — line shift에 조용히 깨진다. 내용 서술자(예: `validator.md 의 인터페이스 CHECK 규칙(7-x)`)나 섹션 anchor로 대체한다.
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
| 개정(amend) 4개 이상 누적 | 통합 재발행(supersede)로 클린 ADR 재작성. 구 ADR은 `superseded`로 history 잔존 |

**적용 시점(중요)**: 본 기준은 ADR-045 이후의 *새 변경*에만 적용한다. 이미 amend가 누적된 기존 ADR(예: 개정(amend) 4개 + surface 다수인 ADR-027)은 **grandfather** — 즉시 재발행 의무 없음. 기존 ADR은 `## 현재 유효 결정` + `## Surfaces` 정리만 하고, *다음 변경이 발생할 때* amend 대신 통합 재발행을 우선 검토한다.

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
