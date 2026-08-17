---
name: repair-acceptance
description: /accept-milestone이 수집한 사용자 수용 finding을 3+1 판정으로 직접 수리한다. task 재개방 없음 — scope(in-AC/out-of-AC)는 결정 이력의 분류값이다. 본 skill은 커밋하지 않는다 (ADR-066#amend-1 / ADR-068 D1).
argument-hint: "<milestone-id> [optional scope note]"
disable-model-invocation: true
allowed-tools: Read Glob Grep Write Edit Bash Skill
---

이 skill은 `/accept-milestone`이 남긴 **사용자 관측 finding**을 수리한다. 코드 수정이 허용된다.
**커밋하지 않는다.** **task 재개방은 없다** — `in-AC`든 `out-of-AC`든 본 skill이 직접 고친다(ADR-066#amend-1 / ADR-068 D1). `in-AC`·`out-of-AC` 판별은 라우팅 분기가 아니라 결정 이력의 **필수 분류값**으로만 남는다.

**재개방 금지 (ADR-068 D1)**: 본 skill은 `/implement-workitem`·`/validate-workitem`·`/repair-workitem`·`/finalize-workitem`을 **호출하지 않는다.** task `## 0. Status`·validation report도 건드리지 않는다. task 문서에 쓰는 것은 **수행 4의 `- invalidated` 한 줄뿐이다**(`## 8`의 AC 이벤트 로그 — D1의 예외 2종 중 하나. `- ac-acceptance`는 `/accept-milestone` 소유). 사용자에게 «그 task를 다시 열어라»를 권하지 않는다 — 그 권고 자체가 금지 대상이다.

`/repair-milestone`과의 경계 (ADR-066 D5) — **입력 출처로 갈린다.**
- 본 skill: `docs/40-validation/acceptance-reviews/<M>.r*.md` + 그 라운드가 `QA_FINDINGS.md`·`IMPROVEMENT_GUIDE.md`에 `(수용)` 태그로 등재한 항목.
- `/repair-milestone`: `/stabilize-milestone`이 만든 finding(기계·AI 관측) + `stabilize-reviews` peer 리뷰.
- 같은 항목이 양쪽에 있으면 **사용자 관측이 우선 authority**다 — 본 skill이 처리하고 `/repair-milestone`은 status만 닫는다.

입력:
- `$ARGUMENTS`: milestone id(`M[0-9]+` 패턴만 — 미일치 즉시 종료) + (선택) 부분 범위 메모(예: `M1 "P0만"`).

반드시 먼저 할 일:
1. `docs/40-validation/acceptance-reviews/<M>.r*.md` glob으로 세션 파일을 회수한다(경로 목록을 메모리에 보관 — 삭제 후 재glob 금지).
2. `QA_FINDINGS.md` 본 마일스톤 헤더에서 `(수용)` 태그 항목을 회수한다. **`IMPROVEMENT_GUIDE.md`의 `## 2` 안 `(수용)` 태그 항목도 함께 회수한다** — 사용자가 "개선 제안을 이번 마일스톤에서 고치겠다"고 택한 것이 그 자리에 등재된다(ADR-066 D2/D5).
3. 둘 다 비어 있으면 *"수리 대상 수용 finding 없음 — `/accept-milestone <M>`을 먼저 실행하세요"* 안내 후 종료(문서 수정 금지).
4. 대상 task와 그 `## 6-1`·`## 8`을 읽는다(어떤 AC·modality에 걸린 결함인지 확인).
5. 우선순위(P0 > P1 > P2)로 정렬한다.

## scope 판별 (`scope: in-AC | out-of-AC` — 3+1 판정과 함께 finding마다 1회)

수용 라운드 finding은 «기존 계약이 약속한 것»과 «약속하지 않은 것»이 섞여 들어온다. **둘 다 본 skill이 직접 고치지만**, 계약 근거 유무는 기록해야 한다.

**판별 질문은 하나다 — «이 변경 줄을 기존 계약으로 거꾸로 추적할 수 있는가».** 계약의 범위는 여섯이다: task `## 6. AC` · task `## 3. 구현 항목`의 line item · feature `## 7. FAC` · feature `## 7-2`의 INV · 승인 프로토타입 · `DESIGN.md` 계약(§2 토큰·§7 컴포넌트·§9 Don'ts·§10 voice). **AC 하나만 보지 않는다.**

- **`in-AC`(추적 가능)** → 직접 고친다. 결정 이력에 `scope: in-AC`를 적는다. 별도 부채 등재는 없다.
- **`out-of-AC`(추적 불가)** → 직접 고친다. 결정 이력에 `scope: out-of-AC`를 적고 **아래 계약 부채 등재를 반드시 수행한다.**
- **애매하면 `out-of-AC`로 본다** — 추적 부채를 남기는 쪽이 안전하다(놓친 계약 밖 변경은 조용히 영구화된다).
- **`out-of-contract`와 혼동하지 않는다**: `out-of-AC`는 «이번에 고칠 것»이고, `Out-of-contract`(3+1 판정)는 «이번에 안 고치고 다음으로 넘길 것»이다. 사용자 확인으로 갈린다.

**`out-of-AC` 계약 부채 등재 (필수)** — `out-of-AC`로 고친 항목마다 `docs/40-validation/IMPROVEMENT_GUIDE.md`의 **`## 4. 보류 항목`**에 `status: open`으로 등재한다. 「코드에는 들어갔으나 어느 계약에도 근거가 없다」는 사실과, 다음 `/plan-milestone` R0가 회수해 **AC 승격 여부를 사용자에게 묻는다**는 회수 경로를 함께 적는다. **이 등재가 없으면 그 기능은 영구히 계약 밖에 남는다.** 형식은 `## 4. 보류 항목` 주석의 「② 계약 미반영」 스키마를 그대로 쓴다.

```
- **<M>-uat-<N>** | P2 | [관측됨] | linked: <M> | affected: T-NNN | scope: out-of-AC | status: open
  - 계약 미반영: <무엇이 코드에 들어갔는지 1줄 — 파일·규모 포함>.
  - 근거 부재: <task>의 어느 AC도 이 동작을 약속하지 않았다.
  - 회수: 다음 /plan-milestone R0 — AC로 승격할지 사용자 결정.
```

- **`## 5. Repair decision log` 항목과 별개의 항목이다.** `## 5`는 «무엇을 어떻게 고쳤나»(수리 완결), `## 4`는 «그 수정이 아직 계약에 없다»(열린 채로 남음)를 담는다 — 서로 다른 사실이므로 항목도 둘이다.
- **마일스톤 문서·task 문서에는 쓰지 않는다.**

## 3+1 판정 (수정 *전* 1회)
**중복 병합 (canonical = 원장 항목)**: 같은 finding이 세션 파일의 분류 결과와 원장(`QA_FINDINGS`·`IMPROVEMENT_GUIDE`)에 **동시에 있는 것이 정상이다** — `/accept-milestone` R5가 원장에 등재하고 R6이 세션 원본에 분류 결과를 함께 남긴다. **판정·수리·기록의 단위는 원장 항목 하나이며**(ID와 `status`를 가진 쪽이 canonical), 세션 파일은 그 항목의 재현 절차·사용자 발언을 보충하는 데만 쓴다. 동일 `<라벨> <경로> <증상>`이면 한 항목으로 합쳐 `<M>-uat-<N>`을 **하나만** 발급한다(`/repair-milestone`의 dedup 규율과 동형). 세션 파일에만 있고 원장에 없는 항목은 R5 라우팅 누락이므로 사용자에게 확인한 뒤 처리한다.
각 finding을 아래 넷 중 하나로 판정하고 한 줄 근거를 남긴다.
- **Adopt** — 진짜 결함. 보고된 대로 수리.
- **Adopt-modified** — 결함은 맞지만 더 나은 방식으로 수리(다른 수정 + 사유).
- **Needs User Clarification** — 재현 조건·기대값이 불명확. **추측으로 고치지 않고 사용자에게 되묻는다**(무엇이 불명확한지 1줄 + 필요한 정보).
- **Out-of-contract** — 결함이 아니라 계약 변경(이번 마일스톤이 약속하지 않은 것이고 이번에 고치지도 않는다). **사용자 확인 후** `docs/30-workitems/ROADMAP.md`의 `## Backlog`에 `- `<candidate-key>` <한 줄 요약> — 출처: 수용 라운드 M<N> r<라운드> / 확신도: <높음/중간/낮음>`로 등재하고 다음 마일스톤 후보로 남긴다. 코드를 고치지 않는다. **정본 문서(charter·ARCH·DESIGN)의 한 절을 고쳐야 성립하는 항목만** `DECISION_REGISTER.md`에 등재한다(ADR-005#amend-1 배타 범위 — 한 항목을 양쪽에 쓰지 않는다).

> **`Reject-false-positive`는 없다** — 사용자가 직접 보고 말한 것을 에이전트가 오탐으로 기각하는 것은 authority 역전이다(ADR-066 D4). 불명확하면 `Needs User Clarification`, 계약 밖이면 `Out-of-contract`이며, 그 둘은 모두 **사용자가 판단하는 경로**다.

## 수행
1. Adopt / Adopt-modified 항목을 우선순위 순으로 처리한다.
2. **회귀 테스트 선행 (ADR-066 D4)**: 각 항목마다 **그 결함을 재현하는 실패 테스트를 먼저 추가해 실패를 관측한 뒤**(Red) 고치고 **그 테스트가 통과하는 것까지 확인한다**(Green). Red·Green 두 관측 결과를 결정 이력에 1줄로 남긴다 — Red만 적고 Green을 확인하지 않으면 «고쳤다고 적었지만 안 고쳐진» 항목이 통과한다.
   - **면제**: 코드 3줄 이하 + 외부 행동 불변인 표기·간격·문구 수정, 그리고 **문서만 고치는 finding**(실행 가능한 테스트 대상이 아니다 — ADR-068 D6이 양 repair skill 공통으로 규정한 면제 2종). 면제 사유를 결정 이력에 적는다.
   - 테스트 작성이 불가능하면(사람 관측만으로 판정되는 시각 결함 등) 그 사유를 적고 **그 AC의 modality가 `[사용자 관측]`인지 확인**한다 — 그렇다면 다음 수용 라운드의 재확인 대상이다.
   - **`scope`와 무관하게 본 라운드가 고치는 전 항목이 대상이다** — 위임이 없으므로 «누가 테스트를 쓰는가»가 갈리지 않는다. 추가한 테스트는 통합 `validate`에 묶는다(ADR-068 D6).
3. **모든 항목을 본 skill이 직접 고친다 (ADR-068 D1).** `scope`와 무관하게 위임하지 않는다. 본 skill은 task `## 0. Status`를 쓰지 않고 `## 6 AC`·`## 3`·`## 6-1` 계획 본문도 고치지 않는다(잠긴 계약이다). **task 문서에 쓰는 것은 `## 8`의 `- invalidated` 한 종류뿐이다**(수행 4 — ADR-068 D1의 예외 2종 중 하나). 그 밖의 산출물별 목적지는 각 단계가 규정한다 — 코드(1·2), 채점표 미접근(4-A), pattern-scan·exec-evidence는 `## 5`(5·5-E), 원장 status(8), decision log(7), 계약 변경 등재(`Out-of-contract`).
4. **AC acceptance 무효화 (ADR-065 D3)**: 수리가 어떤 AC의 동작 경로를 건드렸고 그 AC의 modality가 `[사용자 관측]`·`[플랫폼 관측]`이면 그 task `## 8`에 `- invalidated <날짜> <AC-N>: repair-acceptance 수정으로 재확인 필요`를 append한다(기존 `- ac-acceptance`는 지우지 않는다). **새 receipt를 대신 쓰지 않는다.** **`scope`와 무관하게 본 skill이 직접 append한다** — 위임이 사라졌으므로 중복 writer가 없다. 이 append는 [ADR-068](../../../docs/90-decisions/boilerplate/ADR-068-milestone-closure-and-graduation-v3.md) D1이 허용하는 예외 2종(`- ac-acceptance`·`- invalidated`) 중 하나이며, 그 AC 이벤트 로그의 일부라 `## 5`로 옮기면 졸업 item 4와 다음 수용 라운드가 무효화를 읽지 못한다. **이 줄은 사용자가 커밋한다**(본 skill은 커밋하지 않는다).
4-A. **채점표를 삭제하지 않는다 (ADR-068 D3)**: 졸업 판정이 채점표를 읽지 않으므로 무효화할 대상이 없다. `docs/40-validation/reports/`를 건드리지 않는다.
5. **동일 패턴 전수 검색 (ADR-066 D6 / #amend-1)**: **`Adopt`·`Adopt-modified`한 각 결함에 대해** 같은 패턴의 다른 출현을 저장소 전체에서 **읽기 전용**으로 검색하고, **task `## 8`이 아니라** 수행 7의 `## 5` 항목 하위 줄에 `- pattern-scan <날짜> <패턴>: 범위 내 N건 수정 / 범위 밖 M건 <경로>`를 적는다. 범위 밖은 고치지 않고 `/repair-milestone` 또는 다음 마일스톤으로 라우팅한다.
5-E. **실행 증거 갱신 (ADR-064 D4 — 외부 경계 코드를 고쳤을 때만)**: 본 라운드의 `Adopt`/`Adopt-modified` 수정이 (a) 영속 저장소 쓰기 · (b) 외부 네트워크 호출 · (c) 실행 진입점 코드를 건드렸으면, 그 경계의 실행 증거를 다시 확보하고 수행 7의 `## 5` 항목 하위 줄에 `- exec-evidence ...`를 적는다. 증거 등급·안전 규정·waiver 규정은 `/implement-workitem` 6-E와 동일하다. 확보하지 못하면 `Needs Execution Evidence: <경계 종류> — <사유>`를 출력에 남긴다.
   - 등급 1 증거로 새 파일을 만들었어도 task `## 4-1`은 건드리지 않는다(계획 본문 불가침 — 본 skill의 책임 경계). 그 경로는 `## 5. Repair decision log` 항목의 `files:`에 적는다.

5-V. **자체 검증 — 즉시 파손 감지 (ADR-068 D6 검증 집합)**: 위 1~5-E를 마친 뒤 1회 수행한다. 내용은 넷이다: (i) 본 라운드에 추가한 회귀 테스트가 전부 Green이고 통합 `validate`에 묶여 있는지 확인한다, (ii) 변경 파일과 교차하는 task의 `## 6-1` 자동 테스트 매핑 대상을 실행한다, (iii) 외부 경계·핵심 journey를 건드렸으면 해당 integration/e2e smoke를 실행한다, (iv) 통합 검증 명령이 `--changed`를 지원하면 `validate --changed`를(미지원이면 통합 `validate`를) 1회 실행한다. **이것은 전체 검증이 아니다** — 「방금 한 수정이 즉시 깨졌는가」만 본다.
   - **고치는 대상은 본 라운드 수정이 만든 실패로 한정한다.** baseline은 직전 `/stabilize-milestone` 단계 3의 통합 validate 결과다(같은 메인 세션이면 컨텍스트에 있고, 없으면 본 라운드 시작 시 1회 실행해 잡는다). baseline에 이미 있던 실패는 고치지 않고 출력에 명시한다.
   - 실패를 고치면 다시 실행한다. **최대 3회.** 초과하면 `Needs Follow-up: <실패 목록>`으로 명시하고 종료한다.
   - 통합 명령이 없으면 (ii)를 skip하고 사유를 출력에 남긴다(별도 hardstop 없음).

6. **한 라운드에 P0/P1/P2를 모두 판정으로 완결한다**(defer 금지). 작업량을 줄이려면 사용자가 인자로 부분 범위를 지정한다.
7. **결정 이력 영속화 (ADR-047 D7)** — 본 라운드의 P0/P1 항목 전부를 `docs/40-validation/IMPROVEMENT_GUIDE.md`의 `## 5. Repair decision log` 안 `### M-N` 그룹(없으면 신설)에 append한다. P2는 영속화하지 않는다.
   ```
   - **M1-uat-1** | P0 | [관측됨] | linked: M1 | affected: T-004 | files: <경로 목록 또는 docs-only> | scope: out-of-AC | status: applied | decision: Adopt
     - 발견 (수용 라운드 r1): <사용자가 관측한 것 한 줄>.
     - 결정: <Adopt 사유 한 줄> / 회귀 테스트: <추가한 테스트 또는 면제 사유>.
     - pattern-scan: 범위 내 N건 수정 / 범위 밖 M건 <경로>.   ← 검색을 수행한 항목만
   ```
   ID 컨벤션은 `<milestone-id>-uat-<N>`이다. **`affected: T-NNN` · `files:` · `scope: in-AC | out-of-AC` 세 필드가 전부 필수다** — task 계획 본문을 건드리지 않으므로 이 셋이 "어느 task의 산출물을, 어느 파일에서, 어떤 계약 근거로 고쳤는지"를 추적하는 유일한 경로다. **`scope`와 무관하게 결정 전문을 여기에 적는다** — 위임이 없으므로 routing 기록이라는 것이 존재하지 않는다.
8. **원본 finding status 갱신 (4종 전부)** — ① `Adopt`/`Adopt-modified`로 해소한 `QA_FINDINGS.md`의 `(수용)` 항목 → `status: resolved` ② 같은 기준으로 `IMPROVEMENT_GUIDE.md` `## 2`의 `(수용)` 항목 → `status: resolved`(이걸 빠뜨리면 개선 제안이 열린 채 남아 다음 stabilize의 open 스냅샷을 부풀린다) ③ `Out-of-contract`로 재분류한 항목 → 원본을 **실제 목적지로** 닫는다 — 기본은 `status: resolved (재분류: ROADMAP ## Backlog <candidate-key> — 다음 M)`이고, 정본 문서 변경이 필요해 원장으로 보낸 예외만 `status: resolved (재분류: DECISION_REGISTER D-NNN — 다음 M)`다. **앵커가 실제 등재처와 어긋나면 [ADR-005](../../../docs/90-decisions/boilerplate/ADR-005-ssot.md)#amend-1의 비중복 불변식 N-3이 깨진다**(목적지가 로드맵이면 구간까지 적는다) ④ `Needs User Clarification` 항목 → **닫지 않고 `status: open` 유지**.
9. **세션 파일 삭제 (echo-then-rm)**: 한 파일의 **전 severity finding이 판정 완결됐을 때만** 삭제한다. 삭제 전 `삭제 예정: <경로>`를 출력하고 보관한 경로 목록으로 하나씩 삭제한다(삭제 후 재glob 금지).
   - **미완결 = 보존**: `Needs User Clarification`이 1건이라도 남았거나(사용자 답변 후 재실행이 이어받는다) 부분 범위 지정으로 미처리가 남았으면 **삭제하지 않고** 출력에 `미처리 잔존 — 보존: <경로>`를 명시한다.

## 수행 후 (연쇄 없음 — ADR-068 D1)

본 라운드가 코드를 고쳤어도 **task를 재개방하지 않으므로 닫을 것이 없다.** `/repair-workitem`·`/validate-workitem`·`/finalize-workitem`을 호출하지 않는다.

1. 고친 것의 즉시 검증은 5-V(자체 검증)가 담당한다.
2. 전체 검증과 졸업 판정은 다음 `/stabilize-milestone <M>`이 담당한다.
3. `- invalidated`가 1건 이상이면 그 관측 AC의 receipt 재발급을 위해 `/accept-milestone <M>`을 먼저 재실행한다.
4. **커밋은 사용자가 한다.** 본 skill은 `git commit`을 실행하지 않으며(ADR-047 D7), 연쇄가 사라졌으므로 이 경로에서 `/finalize-workitem`이 커밋하는 일도 없다 — **commit owner는 사용자 하나다.**

책임 경계:
- 새 기능을 추가하지 않는다. 마일스톤 범위 밖 파일을 수정하지 않는다.
- 본 경로에는 `/finalize-workitem` 호출이 없으므로 **commit owner는 사용자 하나다.**
- workitem `## 0. Status`를 변경하지 않는다. task 계획 본문(`## 3`·`## 6`·`## 6-1`)을 고치지 않는다.
- `- ac-acceptance` 줄을 발급하지 않는다(사용자 authority — ADR-065 D1).

마지막 출력:
- 판정 카운트: Adopt M / Adopt-modified K / Needs User Clarification I / Out-of-contract J
- scope 분해: in-AC N건 / out-of-AC M건 (→ `## 4` 등재 ID 목록)
- 수정 파일 목록 + 어떤 finding을 어떻게 해소했는지
- 수정 파일 (files 필드 합계): <경로 목록>
- 회귀 테스트: 추가 N건 / 면제 M건(사유) / 작성 불가 K건(사유)
- `Needs User Clarification` 항목 + 사용자에게 필요한 정보(있으면)
- `Out-of-contract` 항목 + ROADMAP `## Backlog` 등재 결과(있으면) + 정본 문서 변경이 필요해 `DECISION_REGISTER`로 보낸 항목(있으면)
- 계약 부채 등재 (`## 4. 보류 항목`): out-of-AC 수정 N건 → `IMPROVEMENT_GUIDE.md` `## 4`에 등재한 ID 목록 / 해당없음
- 실행 증거 갱신 (ADR-064 D4): 갱신 N건(경계 종류) / 해당없음(외부 경계 코드 미수정) / `Needs Execution Evidence`
- 자체 검증 (즉시 파손 감지): pass / skip(사유) / `Needs Follow-up: <목록>`
- AC acceptance 무효화: N건(AC-N 목록)
- 동일 패턴 전수 검색: 범위 내 N건 / 범위 밖 M건(경로)
- `## 5. Repair decision log` append 줄 수 / status resolved 토글 수 / 삭제·보존한 세션 파일
- 본 skill은 커밋하지 않는다 — 수정 파일과 원장 갱신을 **사용자가 직접 커밋한 뒤** 다음 단계로 진행한다. 재개방이 없으므로 이 경로에 `/finalize-workitem` 커밋분은 없다.
- 후속 권장 (순서 고정): ① `- invalidated`가 1건 이상이면 `/accept-milestone <M>` 재실행(무효화된 관측 AC의 receipt 재발급) → ② `/stabilize-milestone <M>` 재실행으로 졸업 판정 확정. **사용자가 돌릴 `/validate-workitem`·`/finalize-workitem`은 없다.**

정책 근거: [ADR-066](../../../docs/90-decisions/boilerplate/ADR-066-milestone-acceptance.md) D2/D4/D5 (라우팅·판정·경계), [ADR-065](../../../docs/90-decisions/boilerplate/ADR-065-ac-verification-contract.md) D3 (receipt 형식·판독), [ADR-047](../../../docs/90-decisions/boilerplate/ADR-047-code-as-agent-harness.md) D7 (결정 이력 영속·commit owner), [ADR-005](../../../docs/90-decisions/boilerplate/ADR-005-ssot.md)#amend-1 (원장 배타 범위), [ADR-060](../../../docs/90-decisions/boilerplate/ADR-060-decision-closure-and-milestone-seal.md) D11. 재개방 폐지는 [ADR-068](../../../docs/90-decisions/boilerplate/ADR-068-milestone-closure-and-graduation-v3.md) D1 · [ADR-066](../../../docs/90-decisions/boilerplate/ADR-066-milestone-acceptance.md)#amend-1.

## Context 정책 (ADR-019)
세션 파일 + 대상 task의 `## 6-1`·`## 8`이 *최소 충분* 회수 목록이다 — 사전 fork-load 금지. 원장의 `(수용)` 항목, 수리 대상 코드·테스트, `수행 5`의 패턴 검색 범위는 본문 지시대로 그때 추가로 읽는다.
