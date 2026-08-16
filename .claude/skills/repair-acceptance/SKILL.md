---
name: repair-acceptance
description: /accept-milestone이 수집한 사용자 수용 finding을 3+1 판정으로 수리한다. in-AC는 /repair-workitem에 위임(재개방), out-of-AC는 재개방 없이 직접 수정. 본 skill은 커밋하지 않는다 (ADR-066 D4).
argument-hint: "<milestone-id> [optional scope note]"
disable-model-invocation: true
allowed-tools: Read Glob Grep Write Edit Bash Skill
---

이 skill은 `/accept-milestone`이 남긴 **사용자 관측 finding**을 수리한다. 코드 수정이 허용된다.
**커밋하지 않는다.** task 재개방은 **finding이 기존 AC 안(in-AC)인지 밖(out-of-AC)인지에 따라 갈린다** — 아래 「재개방 판별」이 SSOT다. 재개방이 필요한 항목은 본 skill이 직접 status를 쓰지 않고 `/repair-workitem`에 위임한다(ADR-057#amend-3 결정 5 — task status writer는 `/repair-workitem` 하나다).

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

## 재개방 판별 (`scope: in-AC | out-of-AC` — 3+1 판정과 함께 finding마다 1회)

수용 라운드 finding은 «기존 계약이 약속한 것»과 «약속하지 않은 것»이 섞여 들어온다. 먼저 가른다.

**판별 질문은 하나다 — «이 변경 줄을 기존 계약으로 거꾸로 추적할 수 있는가».** 계약의 범위는 여섯이다: task `## 6. AC` · task `## 3. 구현 항목`의 line item · feature `## 7. FAC` · feature `## 7-2`의 INV · 승인 프로토타입 · `DESIGN.md` 계약(§2 토큰·§7 컴포넌트·§9 Don'ts·§10 voice). **AC 하나만 보지 않는다.**

- **`in-AC`(추적 가능)** → **그 task를 재개방해 정상 절차로 마감한다.** 직접 고치지 말고 `/repair-workitem <T-NNN> "<finding 요약>"`로 위임하고, 아래 「수행 후 연쇄」를 돈다. 판정 이력·`## 8` 기록·status 전이·per-task 감사(diff-trace·Arch-iface 닫힌 결정·MCP·Design-inventory·AC↔테스트 매핑)를 그대로 받는다.
- **`out-of-AC`(추적 불가)** → **재개방하지 않는다.** 재개방은 그 task의 잠긴 계획(`## 6 AC`·`## 3`)에 근거가 없는 변경을 사후로 밀어 넣는 것이고, per-task 감사가 그 줄을 정당하게 «추적 불가»로 분류하므로 재개방·재마감을 반복해도 해소되지 않는다. 본 skill이 직접 고치고, 결정 이력은 `IMPROVEMENT_GUIDE.md` `## 5`에 `affected: T-NNN` 역참조로 남긴다(task 계획 본문 불가침). **채점표 갱신을 위한 재validate는 한다**(「수행 후 연쇄」 ②) — 그때 붙는 `추적 불가` 라벨은 P1 기록 등급이며 차단이 아니다.
- **애매하면 `in-AC`로 본다** — 실패 방향을 안전한 쪽으로 고정한다(재개방은 비용만 더 들지만, 놓친 계약 위반은 졸업을 조용히 통과한다).
- **`out-of-contract`와 혼동하지 않는다**: `out-of-AC`는 «이번에 고칠 것»이고, `Out-of-contract`(아래 3+1 판정)는 «이번에 안 고치고 다음으로 넘길 것»이다. 사용자 확인으로 갈린다.

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
   - **면제**: 코드 3줄 이하 + 외부 행동 불변인 표기·간격·문구 수정. 면제 사유를 결정 이력에 적는다.
   - 테스트 작성이 불가능하면(사람 관측만으로 판정되는 시각 결함 등) 그 사유를 적고 **그 AC의 modality가 `[사용자 관측]`인지 확인**한다 — 그렇다면 다음 수용 라운드의 재확인 대상이다.
   - **`scope: in-AC` 위임분은 여기서 하지 않는다** — 위임받은 `/repair-workitem`이 자기 규율로 수정과 테스트를 처리한다(중복 금지). **`scope: out-of-AC`로 본 skill이 직접 고치는 항목만** 대상이다. 위임분의 테스트를 본 skill이 쓰면 그 파일이 그 task `## 4-1` 밖 변경으로 남아 「수행 후 연쇄」 ①의 `/finalize-workitem`이 수행 5-(4)에서 `Needs Review`로 멈춘다.
3. **`in-AC` 항목은 `/repair-workitem <T-NNN> "<finding 요약>"`에 위임한다**(본 skill이 직접 고치지 않는다 — 그 skill이 재개방·4-판정·`## 8` 기록·status 전이를 소유한다). **`out-of-AC` 항목만 본 skill이 직접 고친다.** 어느 쪽이든 본 skill은 task `## 0. Status`를 직접 쓰지 않고, `## 6 AC`·`## 3`·`## 6-1` 계획 본문도 고치지 않는다(잠긴 계약이다). **본 skill이 task 문서에 쓰는 것은 `## 8`의 append 2종뿐이다**(아래 4·5의 `- invalidated`·`- pattern-scan`). task 문서 밖 산출물은 각 단계가 따로 규정한다 — 코드(out-of-AC 한정, 1·2), 채점표 삭제(4-A), 원장 status(8), decision log(7), 계약 변경 등재(`Out-of-contract`).
   - **순서 규칙 (중요)**: `in-AC` 위임과 그 뒤의 「수행 후 연쇄」 ①은 **`out-of-AC` 직접 수정·4·4-A·5·5-E·5-V·7·8·9보다 먼저** 수행한다. 그 순서를 지키면 `/finalize-workitem` 시점의 working tree에 **그 task의 변경만** 남아 그 skill 수행 5-(4)의 범위 비교를 통과한다. 반대로 `out-of-AC` 수정과 원장 쓰기를 먼저 하면 그 파일들이 task `## 4-1` 밖 변경으로 보여 finalize가 `Needs Review`로 멈춘다(본 skill 마지막 출력의 커밋 안내가 경고하는 그 상태다).
4. **AC acceptance 무효화 (ADR-065 D3)**: 수리가 어떤 AC의 동작 경로를 건드렸고 그 AC의 modality가 `[사용자 관측]`·`[플랫폼 관측]`이면 그 task `## 8`에 `- invalidated <날짜> <AC-N>: repair-acceptance 수정으로 재확인 필요`를 append한다(기존 `- ac-acceptance`는 지우지 않는다). **새 receipt를 대신 쓰지 않는다.** **`scope: in-AC` 위임분은 여기서 하지 않는다** — `/repair-workitem`도 무효화 writer이므로(ADR-065 D3) 중복이고, 그 task는 연쇄 ①이 이미 마감·커밋했으므로 사후 append가 미커밋 변경으로 남는다.
4-A. **영향 task report 무효화 (ADR-067 D1 item 4 (d) 보완)**: **본 skill이 `out-of-AC`로 직접 고친** 각 task의 `docs/40-validation/reports/<task-id>.md`를 **삭제한다**(`scope: in-AC` 위임분은 대상이 아니다 — 연쇄 ①의 `/validate-workitem`이 이미 새 채점표를 만들었으므로 여기서 지우면 그 결과를 버리고 ②가 헛돈다)(`/repair-workitem`·`/repair-milestone`의 삭제 규율과 동형 — **삭제 전 `삭제 예정: <경로>` echo 강제**, 미리 회수한 경로로 하나씩 `rm`, 삭제 후 재glob 금지). 고친 파일이 그 task `## 4-1`에 없을 수 있어 mtime 비교만으로는 stale이 안 잡힌다. report 부재 = 졸업 item 4 미충족이므로 재validate가 강제된다.
5. **동일 패턴 전수 검색 (ADR-066 D6)**: **본 skill이 `out-of-AC`로 직접 고친** 각 Adopt 결함에 대해 같은 패턴의 다른 출현을 저장소 전체에서 **읽기 전용**으로 검색하고, 대상 task `## 8`에 `- pattern-scan <날짜> <패턴>: 범위 내 N건 수정 / 범위 밖 M건 <경로>`를 append한다. 범위 밖은 고치지 않고 `/repair-milestone` 또는 다음 마일스톤으로 라우팅한다. **`scope: in-AC` 위임분은 여기서 하지 않는다** — `/repair-workitem` 2-H가 같은 검색을 하므로 중복이고, 그 task는 연쇄 ①이 이미 마감·커밋했다.
5-E. **실행 증거 갱신 (ADR-064 D4 — 외부 경계 코드를 고쳤을 때만)**: 본 라운드의 `Adopt`/`Adopt-modified` 수정이 (a) 영속 저장소 쓰기 · (b) 외부 네트워크 호출 · (c) 실행 진입점 코드를 건드렸으면, **그 경계의 실행 증거를 다시 확보하고 그 task `## 8`에 `- exec-evidence` 줄을 새로 append한다**(기존 줄은 지우지 않는다 — 이력이다). 증거 등급·안전 규정·waiver 규정은 `/implement-workitem` 6-E와 동일하다. 확보하지 못하면 `Needs Execution Evidence: <경계 종류> — <사유>`를 출력에 남긴다.
   - **`scope: in-AC` 항목은 여기서 하지 않는다** — 위임받은 `/repair-workitem`의 2-E가 같은 일을 하므로 중복이다. **`scope: out-of-AC`로 본 skill이 직접 고친 항목만** 대상이다.
   - 등급 1 증거로 새 파일을 만들었어도 **task `## 4-1`은 건드리지 않는다**(계획 본문 불가침 — 본 skill의 책임 경계). 그 경로는 `## 5. Repair decision log` 항목에 적는다.

5-V. **자체 검증 — 즉시 파손 감지 (실행 순서상 「수행 후 연쇄」 ① 다음, ② *앞*이다)**: 위 1~5-E를 마친 뒤 1회 수행한다. **①(재개방 task 연쇄)은 이 시점에 이미 끝나 있고, ②(`out-of-AC` 영향 task 재validate)는 아직 돌리지 않은 상태다** — 본 단계가 무언가를 고치면 ②가 만들 채점표가 곧바로 stale이 되기 때문이다. 내용은 둘이다: (i) 본 라운드에 추가한 회귀 테스트가 전부 Green인지 확인하고, (ii) 통합 검증 명령이 `--changed`를 지원하면 `validate --changed`를(미지원이면 통합 `validate`를) 1회 실행한다. **이것은 전체 검증이 아니다** — 「방금 한 수정이 즉시 깨졌는가」만 본다.
   - **고치는 대상은 본 라운드 수정이 만든 실패로 한정한다.** baseline은 직전 `/stabilize-milestone` 단계 3의 통합 validate 결과다(같은 메인 세션이면 컨텍스트에 있고, 없으면 본 라운드 시작 시 1회 실행해 잡는다). baseline에 이미 있던 실패는 고치지 않고 출력에 명시한다.
   - 실패를 고치면 다시 실행한다. **최대 3회.** 초과하면 `Needs Follow-up: <실패 목록>`으로 명시하고 종료한다.
   - 통합 명령이 없으면 (ii)를 skip하고 사유를 출력에 남긴다(별도 hardstop 없음).

6. **한 라운드에 P0/P1/P2를 모두 판정으로 완결한다**(defer 금지). 작업량을 줄이려면 사용자가 인자로 부분 범위를 지정한다.
7. **결정 이력 영속화 (ADR-047 D7)** — 본 라운드의 P0/P1 항목 전부를 `docs/40-validation/IMPROVEMENT_GUIDE.md`의 `## 5. Repair decision log` 안 `### M-N` 그룹(없으면 신설)에 append한다. P2는 영속화하지 않는다.
   ```
   - **M1-uat-1** | P0 | [관측됨] | linked: M1 | affected: T-004 | scope: out-of-AC | status: applied | decision: Adopt
     - 발견 (수용 라운드 r1): <사용자가 관측한 것 한 줄>.
     - 결정: <Adopt 사유 한 줄> / 회귀 테스트: <추가한 테스트 또는 면제 사유>.
   ```
   ID 컨벤션은 `<milestone-id>-uat-<N>`이다. **`affected: T-NNN`은 필수** — task 계획 본문을 건드리지 않으므로 이 역참조가 "어느 task의 산출물을 나중에 누가 왜 고쳤는지"를 추적하는 유일한 경로다. **`scope: in-AC | out-of-AC`도 필수** — 재개방 여부가 그 값으로 갈렸으므로, 나중에 그 판단을 검증하려면 값이 남아 있어야 한다. `in-AC` 항목의 결정 근거는 `/repair-workitem`이 그 task `## 8`에 남기므로 **여기에는 «T-NNN으로 위임함» 한 줄 routing 기록만** 둔다(중복 기록 금지 — `/repair-milestone` `## 5` 규율과 동형).
8. **원본 finding status 갱신 (4종 전부)** — ① `Adopt`/`Adopt-modified`로 해소한 `QA_FINDINGS.md`의 `(수용)` 항목 → `status: resolved` ② 같은 기준으로 `IMPROVEMENT_GUIDE.md` `## 2`의 `(수용)` 항목 → `status: resolved`(이걸 빠뜨리면 개선 제안이 열린 채 남아 다음 stabilize의 open 스냅샷을 부풀린다) ③ `Out-of-contract`로 재분류한 항목 → 원본을 **실제 목적지로** 닫는다 — 기본은 `status: resolved (재분류: ROADMAP ## Backlog <candidate-key> — 다음 M)`이고, 정본 문서 변경이 필요해 원장으로 보낸 예외만 `status: resolved (재분류: DECISION_REGISTER D-NNN — 다음 M)`다. **앵커가 실제 등재처와 어긋나면 [ADR-005](../../../docs/90-decisions/boilerplate/ADR-005-ssot.md)#amend-1의 비중복 불변식 N-3이 깨진다**(목적지가 로드맵이면 구간까지 적는다) ④ `Needs User Clarification` 항목 → **닫지 않고 `status: open` 유지**.
9. **세션 파일 삭제 (echo-then-rm)**: 한 파일의 **전 severity finding이 판정 완결됐을 때만** 삭제한다. 삭제 전 `삭제 예정: <경로>`를 출력하고 보관한 경로 목록으로 하나씩 삭제한다(삭제 후 재glob 금지).
   - **미완결 = 보존**: `Needs User Clarification`이 1건이라도 남았거나(사용자 답변 후 재실행이 이어받는다) 부분 범위 지정으로 미처리가 남았으면 **삭제하지 않고** 출력에 `미처리 잔존 — 보존: <경로>`를 명시한다.

## 수행 후 연쇄 (사용자에게 미루지 않는다)

본 라운드가 코드를 고쳤으면 그 결과를 **본 skill이 자기 루프 안에서** 채점표까지 되돌린다. **단 «재개방된 task»와 «채점표만 없어진 task»의 처방이 다르다** — 앞은 다시 `done`으로 마감해야 하고, 뒤는 계속 `done`이므로 마감할 것이 없다. 근거는 `/finalize-workitem`의 두 문이다: **1-G**(`done`이면 read-only no-op)와 **수행 5-(4)**(task `## 4-1`과 git 실제 변경이 어긋나면 `Needs Review` 종료).

1. **① `in-AC` 위임분 (재개방됨) — validate + finalize.** 위임한 각 `T-NNN`에 대해 `/repair-workitem` 완료 후 **`/validate-workitem <T-NNN>` → 판정이 `Pass`·`Pending Acceptance`면 `/finalize-workitem <T-NNN>`** 을 순서대로 실행한다. **이 ①은 위 「수행 3 순서 규칙」대로 `out-of-AC` 수정·원장 쓰기보다 먼저, task 한 개씩 순차로** 돈다(한 task를 finalize가 커밋해 tree가 다시 깨끗해진 뒤 다음 task로 간다).
   - `Needs Fix`가 나오면 그 task를 `/repair-workitem <T-NNN>`으로 한 번 더 보내고 **다시 `/validate-workitem <T-NNN>` → 판정이 `Pass`·`Pending Acceptance`면 `/finalize-workitem <T-NNN>`** 까지 같은 순서로 끝까지 돈다 — **`/repair-workitem` 호출은 task당 최대 2회**. **2회째 validate도 `Needs Fix`면** 그 task를 `미해결 (Needs Fix ×2)`로 명시하고 다음 task로 넘어간다(무한 루프 금지). **2회째가 통과했는데 finalize를 부르지 않으면 그 task가 `in-progress`로 남아 졸업 item 1이 미충족이 된다** — 이 절이 존재하는 이유가 그것이다.
   - **정상 마감도 `Needs Fix`도 아닌 종료값(`Needs Validation`·`Needs Review`·`Needs Rationale`·`Needs Stack Guard`)이 나오면 그 task를 `미해결 (<종료값>)`로 명시하고 사용자가 그대로 칠 복구 명령을 함께 출력한다** — 조용히 멈추지 않는다. `Needs Review`(범위 비교 불일치)의 복구 안내는 «tree의 무관 변경을 커밋하거나 그 task `## 4-1`을 보강한 뒤 `/finalize-workitem <T-NNN>` 재실행»이다.
2. **② `out-of-AC` 직접 수정분 (재개방 안 됨) — validate만.** 4-A로 채점표를 삭제한 각 task에 대해 **`/validate-workitem <T-NNN>` 하나만** 실행한다. **이 ②는 5-V(자체 검증)를 마친 뒤에 돈다** — 5-V가 무언가를 고치면 ②가 방금 만든 채점표가 다시 stale이 된다. 즉 라운드 실행 순서는 «① → `out-of-AC` 수정(1·2) → 4·4-A·5·5-E → 5-V → 7·8·9 → ②»다. `/repair-workitem`도 `/finalize-workitem`도 부르지 않는다 — 고칠 것은 이미 고쳤고, **그 task는 계속 `done`이라** finalize를 부르면 1-G의 read-only no-op에 걸려 아무 일도 안 하면서 «마감»으로 보이는 거짓 신호만 남는다. 졸업 item 4가 요구하는 것은 **새 채점표**이며 그것은 재validate가 만든다.
   - 재validate 결과의 채점표에 `out-of-AC` 수정 줄이 `추적 불가`로 잡혀 `P1` 라벨이 붙을 수 있다. **정상이며 차단이 아니다** — diff-trace audit에서 `Needs Fix` 트리거는 (c) pre-existing dead code 삭제 하나뿐이다. 그 라벨은 출력에 한 줄 요약만 남기고, 계약 근거 부재 자체는 `## 4. 보류 항목`의 계약 부채 등재가 추적한다.
3. **재validate가 필요 없는 경우**: 코드를 하나도 고치지 않은 라운드(전부 `Needs User Clarification`·`Out-of-contract`)는 이 연쇄를 돌지 않는다.
4. **`- invalidated`만 남기고 코드를 고치지 않은 task**도 재validate가 필요 없다 — 졸업 item 4 (a')가 task `## 8`을 직접 읽으므로 무효화 사실이 그대로 반영된다. 그 AC의 receipt 재발급은 다음 `/accept-milestone <M>` 라운드가 담당한다.
5. **커밋 경계는 그대로다 (ADR-047 D7).** 본 연쇄에서 커밋이 일어나는 유일한 자리는 ①의 `/finalize-workitem`이고, 그것이 커밋하는 것은 **그 task의 `## 4-1` 파일 + 그 task 문서**뿐이다. **본 skill의 `out-of-AC` 수정 파일·원장 갱신은 여전히 사용자가 커밋한다** — 본 skill이 스스로 커밋하지 않는다는 계약은 유지된다.
6. **Codex**: `Skill` 도구가 없는 환경에서는 각 skill의 `SKILL.md`를 읽어 그 절차를 같은 순서로 직접 수행한다(결과 동일).

책임 경계:
- 새 기능을 추가하지 않는다. 마일스톤 범위 밖 파일을 수정하지 않는다.
- 자동 커밋하지 않는다 — 본 skill은 `git commit`을 실행하지 않는다(ADR-047 D7). 「수행 후 연쇄」 ①의 `/finalize-workitem`이 커밋하지만 그것이 커밋하는 것은 **그 task의 `## 4-1` 파일 + task 문서**뿐이며, **`out-of-AC` 수정 파일과 원장 갱신은 여전히 사용자가 커밋한다.** commit owner는 «task 마감분 = finalize / 그 밖 전부 = 사용자»로 갈린다.
- workitem `## 0. Status`를 변경하지 않는다. task 계획 본문(`## 3`·`## 6`·`## 6-1`)을 고치지 않는다.
- `- ac-acceptance` 줄을 발급하지 않는다(사용자 authority — ADR-065 D1).

마지막 출력:
- 판정 카운트: Adopt M / Adopt-modified K / Needs User Clarification I / Out-of-contract J
- 재개방 판별: in-AC N건(위임한 task 목록) / out-of-AC M건(직접 수정)
- 수정 파일 목록 + 어떤 finding을 어떻게 해소했는지
- 회귀 테스트: 추가 N건 / 면제 M건(사유) / 작성 불가 K건(사유)
- `Needs User Clarification` 항목 + 사용자에게 필요한 정보(있으면)
- `Out-of-contract` 항목 + ROADMAP `## Backlog` 등재 결과(있으면) + 정본 문서 변경이 필요해 `DECISION_REGISTER`로 보낸 항목(있으면)
- 계약 부채 등재 (`## 4. 보류 항목`): out-of-AC 수정 N건 → `IMPROVEMENT_GUIDE.md` `## 4`에 등재한 ID 목록 / 해당없음
- 실행 증거 갱신 (ADR-064 D4): 갱신 N건(경계 종류) / 해당없음(외부 경계 코드 미수정) / `Needs Execution Evidence`
- 자체 검증 (즉시 파손 감지): pass / skip(사유) / `Needs Follow-up: <목록>`
- AC acceptance 무효화: N건(AC-N 목록)
- 삭제한 report (ADR-067 D1 item 4 (d)): <task-id 목록> / 해당없음
- 동일 패턴 전수 검색: 범위 내 N건 / 범위 밖 M건(경로)
- `## 5. Repair decision log` append 줄 수 / status resolved 토글 수 / 삭제·보존한 세션 파일
- **커밋 안내**: 본 skill은 커밋하지 않는다 — `out-of-AC` 수정 파일과 원장 갱신을 **사용자가 직접 커밋한 뒤** 다음 단계로 진행한다. **「수행 후 연쇄」 ①이 마감한 `in-AC` task의 파일은 그 `/finalize-workitem`이 이미 커밋했으므로 여기 목록에 없다.** 그 잔여분을 미커밋으로 두면 이후 다른 task의 `/finalize-workitem`이 범위 밖 변경으로 보고 `Needs Review`로 멈춘다(연쇄 ①을 `out-of-AC` 수정보다 먼저 도는 이유가 그것이다).
- **연쇄 실행 결과 (의무)**: 「수행 후 연쇄」에서 실행한 task별 결과를 표로 남긴다 — `<T-NNN> | scope(in-AC / out-of-AC) | 실행한 skill | 최종 판정 | status`. **`in-AC`는 repair+validate+finalize를, `out-of-AC`는 validate만 실행하며 `out-of-AC`의 status는 `done` 유지다**(재개방되지 않았으므로 마감 대상이 아니다 — finalize 미실행을 «미실행(불요)»으로 적는다). **사용자에게 재실행을 미루지 않는다.** 2회로도 `Needs Fix`인 task, 또는 정상 마감이 아닌 종료값이 나온 task는 `미해결 (<종료값>)`로 명시하고 복구 명령을 함께 적는다.
- 후속 권장 (순서 고정): ① `미해결` task가 있으면 그것부터 해소 → ② `- invalidated`가 1건 이상이면 `/accept-milestone <M>` 재실행(무효화된 관측 AC의 receipt 재발급) → ③ `/stabilize-milestone <M>` 재실행으로 졸업 판정 확정. **receipt 재발급 자체는 재validate를 유발하지 않는다**(item 4 (a')가 task `## 8`을 직접 읽는다).

정책 근거: [ADR-066](../../../docs/90-decisions/boilerplate/ADR-066-milestone-acceptance.md) D2/D4/D5 (라우팅·판정·경계), [ADR-065](../../../docs/90-decisions/boilerplate/ADR-065-ac-verification-contract.md) D3 (receipt 형식·판독), [ADR-057](../../../docs/90-decisions/boilerplate/ADR-057-planning-v2-batch-and-seam.md)#amend-3 결정 5 (task status writer 고정 — 재개방 위임 근거), [ADR-047](../../../docs/90-decisions/boilerplate/ADR-047-code-as-agent-harness.md) D7 (결정 이력 영속·commit owner), [ADR-005](../../../docs/90-decisions/boilerplate/ADR-005-ssot.md)#amend-1 (원장 배타 범위), [ADR-060](../../../docs/90-decisions/boilerplate/ADR-060-decision-closure-and-milestone-seal.md) D11.

## Context 정책 (ADR-019)
세션 파일 + 대상 task의 `## 6-1`·`## 8`이 *최소 충분* 회수 목록이다 — 사전 fork-load 금지. 원장의 `(수용)` 항목, 수리 대상 코드·테스트, `수행 5`의 패턴 검색 범위는 본문 지시대로 그때 추가로 읽는다.
