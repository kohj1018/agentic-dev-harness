# 개선 실행 가이드

이 문서는 위에서 아래로 순서대로 실행한다. Phase 간 순서를 바꾸면 안 된다(뒤 Phase가 앞 Phase의 산출물을 인용한다).
각 Phase 끝의 커밋 메시지로 커밋한 뒤 다음 Phase로 넘어간다.
각 Phase 안의 단계는 번호 순서대로 실행한다.

---

## Phase 0 — 사전 확인

### 0-1. 현재 상태 확인

```bash
git status --porcelain          # 본 가이드(?? IMPROVE-GUIDE.md) 한 줄만 있어야 한다. 다른 변경이 있으면 먼저 정리한다
ls docs/90-decisions/boilerplate/ | grep -o 'ADR-0[0-9][0-9]' | sort -u | tail -3
```

> **Phase 1~3은 하나의 거버넌스 단위다.** Phase 1 커밋 시점에 ADR-065가 아직 없는 ADR-066·ADR-067을 링크하므로, **Phase 3이 끝나기 전에는 `/stabilize-milestone`을 돌리지 않는다**(돌리면 `P1 [ADR-ref]`·`P1 [Link-anchor]`가 중간 상태 때문에 뜬다). 커밋은 Phase마다 하되 검증은 Phase 13에서 한 번에 한다.

> **모든 grep 검증에서 본 가이드를 제외한다.** 이 파일은 저장소 루트에 있어 `grep -r … .`에 걸리고, 안에 `ADR-014`·구 용어를 대량 인용하고 있다. 아래 모든 검증 명령에는 `--exclude=IMPROVE-GUIDE.md`(또는 `| grep -v IMPROVE-GUIDE`)가 붙어 있으니 빼지 말 것.

마지막 명령의 출력이 `ADR-062 / ADR-063 / ADR-064`여야 한다. 다르면 아래 Phase에서 쓰는 신규 번호를 그 다음 번호로 조정한다.

### 0-2. 이 라운드에서 쓰는 신규 번호

| 번호 | 제목 | 역할 |
|---|---|---|
| ADR-065 | AC 검증 계약 (AC Verification Contract) | AC 충족을 증명하는 modality·authority·receipt의 SSOT |
| ADR-066 | 마일스톤 수용 단계 (Milestone Acceptance) | `/accept-milestone` + `/repair-acceptance` 신규 lifecycle 단계 |
| ADR-067 | 마일스톤 졸업 계약 v2 | ADR-014 통합 재발행(supersede) |

### 0-3. 베이스라인 인용 수 기록 (Phase 3 검증에 쓴다)

```bash
grep -ro "ADR-014" --include="*.md" --exclude=IMPROVE-GUIDE.md . | wc -l    # 64가 나온다(ADR-014 파일 자체 포함)
```

---

## Phase 1 — ADR-065 신규 작성 (AC 검증 계약)

### 1-1. 파일 생성

`docs/90-decisions/boilerplate/ADR-065-ac-verification-contract.md`를 새로 만든다. 아래 내용을 그대로 쓴다.

```markdown
# ADR-065 — AC 검증 계약 (AC Verification Contract)

> scope: boilerplate
> area: process

## Status
accepted

## 배경
- [관측됨] 현행 규칙은 AC 충족을 *자동 테스트 존재* 하나로만 판정한다(`## AC ↔ 테스트 매핑`). 그래서 테스트로 확인할 수 없는 AC는 영구 `❌`가 된다 — `Type: research-spike`의 리서치 노트(ADR-039), 스케줄러 발화·배포 후 관측, 모바일 실기기·스토어 확인, 사람 육안 확인이 그 예다.
- [관측됨] 그 결과 4개 지점이 같은 `❌`를 서로 다르게 취급한다. ADR-009는 *"AC 미충족 0개"* 를 통과 조건으로 규정하고 opt-out에 대해서는 *"finalize 시점에 사유를 사용자에게 명시적으로 보여주고 확인"* 만 요구하는데, `/finalize-workitem`은 그것을 **AC 미충족의 예외**로 확대해 통과시키고, `/validate-workitem`은 예외 없이 `Needs Fix`를 내며, `/stabilize-milestone`의 졸업 item 4는 예외가 없어 마일스톤을 영구 차단한다.
- [관측됨] 그래서 정당한 TDD opt-out task는 `validate(Needs Fix) → repair(고칠 것 없음) → 재validate(같은 Needs Fix)` 순환에 들어가고, 근거 없는 finalize 예외만이 탈출구다. 그 뒤 마일스톤은 졸업하지 못한다.
- [관측됨] ADR-064 D1은 등급 2 receipt의 허용 형태 ⑤로 *사용자 waiver* 를 열거하고 `/validate-workitem`은 *"사용자 waiver로 기록된 줄은 충족으로 보고"* 한다. 실행 증거 축은 기록 등급이라 손해가 제한되지만, 같은 형태를 AC 축에 옮기면 **차단 게이트(졸업 item 4)와 커버리지 %(신뢰도 등급 입력)를 통과하는 위장 경로**가 열린다.

## 결정

### D1. AC 검증 modality 5종
AC 충족은 아래 5종 중 **정확히 하나**의 modality로 증명한다. task `## 6-1`에 AC마다 modality를 표기한다.

| modality | 증명 대상 | 요구 증거 | 발급 주체 |
|---|---|---|---|
| `자동 테스트` | 실행되는 테스트가 그 행동을 단정 | 러너::파일::테스트-id (실제 실행 결과) | 기계 |
| `산출물 검사` | **명령·파서로 재현 가능한** 산출물 사실 | 검사 대상 경로 + **재현 가능한 검사 방법(명령·스키마·파서·grep 패턴)** + 확인 결과 | 기계 |
| `사용자 관측` | 사람이 직접 보고 충족을 판정 | 관측 절차 + 시각 + 환경 + 결과 | **사용자만** |
| `플랫폼 관측` | 외부 플랫폼의 실행·상태로 확인 | 출처 식별자(CI run·배포 로그·스토어 상태) + 첨부한 authority | **사용자만** |
| `미관측` | — | 없음 | — |

- **`산출물 검사`의 범위는 결정적으로 판정 가능한 것까지다** — 파일·경로 존재, 스키마 검증, 필수 헤딩·항목 개수(grep), 명령 exit code, 구조화 파싱 결과. **의미·품질 판정(예: "비교가 충실한가")은 이 modality가 아니다** — 그것은 `사용자 관측`이다. 문법·구조를 이해하지 못하는 검사에 차단력을 주지 않는다는 ADR-063 D6 1문항을 그대로 따른다. 따라서 `Type: research-spike`의 AC는 *구조 사실*(노트 파일 존재 + 필수 섹션 3개 존재)을 `산출물 검사`로, *내용 판단*(권고가 타당한가)을 `사용자 관측`으로 나눠 쓴다.
- **`산출물 검사`의 검사 수단은 통합 `validate` 명령에 묶는다(강).** 그러면 판정이 문자열 읽기가 아니라 **실제 실행의 exit code**가 되어 ADR-063 D6 2문항을 통과하고, 회귀도 기존 게이트가 계속 막는다(ADR-064 D7의 *"구조적 차단이 필요하면 증거를 등급 1로 만든다"* 와 같은 형태). `/validate-workitem`은 그 실행 결과를 읽어 판정하며 **검사 명령을 스스로 실행하지 않는다**(report-only 계약 — 그 skill의 `allowed-tools`에 임의 Bash를 추가하지 않는다).
- **묶을 수 없는 검사는 `산출물 검사`가 아니다** — 그 AC는 `사용자 관측`으로 내린다. 이 규칙이 없으면 grep 한 줄이 차단 게이트의 통과 근거가 되어 D6이 세운 배치 기준이 무너진다.
- **`미관측`은 *authoring 표기*가 아니라 *판정 결과 라벨*이다.** 계획자는 `[미관측]`을 쓰지 않는다(쓸 거리가 없으면 AC를 관측 가능하게 다시 쓴다). 판정자는 아래 두 경우에 결과를 `미관측`으로 적는다 — ① 선언된 modality의 증거가 없다 ② 표기가 없는데 legacy 판독(`자동 테스트`)으로도 대응 테스트가 없다. **`미관측`은 항상 미충족이며 어떤 게이트도 통과시키지 않는다.**
- **legacy 호환 (표기 부재의 판독)**: **modality 표기가 없는 AC는 `자동 테스트`로 간주한다.** 기존 fork의 모든 task는 표기가 없으므로 이 규칙이 없으면 재검증에서 전 task가 일괄 미충족이 된다(ADR-022 ratchet 위반). 그 AC에 대응 테스트가 없으면 기존과 똑같이 미충족이다 — 즉 **현행 판정과 동일하게 동작한다.** 신규 task는 표기를 필수로 하며, 표기 없는 AC를 만나면 `/validate-workitem`이 `P2 [Modality-missing] AC-N` 을 기록 등급으로 남긴다(차단하지 않는다).
- **`사용자 관측`·`플랫폼 관측` receipt의 발급 시점은 task 층이다** — 그 AC를 가진 task가 `/finalize-workitem`에 도달하기 *전*에 발급돼야 한다. 발급 경로는 `/accept-milestone --task <task-id>`(task 스코프 모드 — [ADR-066](ADR-066-milestone-acceptance.md) D1) 또는 사용자 직접 기재다. **마일스톤 수용 라운드(post-stabilize)를 이 발급의 유일한 경로로 두면 lifecycle이 교착된다** — stabilize는 전 task `done`을 요구하는데 그 task는 receipt 없이 `done`이 될 수 없다.
- **경계 — 커밋·배포 이후에만 관측 가능한 사실은 그 task의 AC로 두지 않는다.** CI 실행·배포 후 동작·실제 스케줄 발화처럼 *커밋이 있어야 비로소 일어나는* 사실은 finalize 전에 관측할 수 없으므로, 그것을 AC로 박으면 어떤 modality로도 충족할 수 없다. 그런 사실은 **후속 verification task의 AC로 분리한다**(계획 단계 규율 — 측정 가능 AC(ADR-026) + 새 범위 라우팅(ADR-057#amend-3 결정 6)). 그 task의 AC는 `플랫폼 관측`이며, 선행 task가 배포된 뒤 실행된다. **`플랫폼 관측` modality가 다루는 것은 «이미 발생한 플랫폼 실행의 결과를 사용자가 확인해 첨부하는 것»이지 «아직 일어나지 않은 일을 기다리는 것»이 아니다.**
- **`--waiver`(ADR-064 D1)는 어느 modality에도 쓰지 않는다.** waiver는 *증거가 없다는 사실을 사용자가 승인*하는 것이고 acceptance는 *관측했고 충족했다는 판정*이다. 둘을 섞으면 "검증하지 못했지만 허용"이 "검증 완료"로 바뀐다.
- **`사용자 관측`·`플랫폼 관측`은 에이전트가 대행 발급하지 않는다** — 사유·결과를 발명하지 않는다(ADR-064 D1 waiver 규정과 동일 근거).

### D2. TDD opt-out의 의미 고정
`## 6-2. TDD opt-out`은 **Red-first 절차(RGR 3 phase)의 면제**이며 **AC 충족의 면제가 아니다**(ADR-009 본문 정합). opt-out task도 AC마다 modality와 증거가 필요하다 — 예: `Type: research-spike`는 D1대로 구조 사실을 `산출물 검사`로, 내용 판단을 `사용자 관측`으로 충족한다.

### D3. receipt 위치와 형식
`사용자 관측`·`플랫폼 관측`의 증거는 task `## 8. 메모`에 아래 형식으로 append한다(ADR-064 D4의 receipt 위치를 그대로 쓴다).

```
- ac-acceptance <날짜> <AC-N>: modality=<사용자 관측|플랫폼 관측> / authority=사용자 / source=<출처 식별자 — 플랫폼 관측일 때만, 예: CI run id·배포 로그 id·스토어 상태> / 환경=<대상·버전> / 절차=<무엇을 했는가 1줄> / 결과=<관측 1줄>
```

- **`authority`와 `source`를 분리하는 이유**: 두 modality 모두 *발급 주체는 사용자*이고(D1), 플랫폼 관측이 추가로 갖는 것은 *출처 식별자*다. 한 칸에 몰면 `authority=CI run 123`처럼 적혀 «사람이 붙였다»는 사실이 사라지고 대행 발급 금지(D1)의 반증 지점이 없어진다. `authority`는 항상 `사용자`다.

무효화 줄의 형식은 하나로 고정한다.

```
- invalidated <날짜> <AC-N>: <무엇을 고쳤는가 — 재확인 필요>
```

- **`- ac-acceptance` 줄의 작성자**는 `/accept-milestone`(사용자 응답을 그대로 기록) 또는 사용자 직접이다. `/validate-workitem`·validator·builder·foreman은 쓰지 않는다. **`- invalidated` 줄의 작성자는 아래 세 repair skill이다.**
- **판독 규칙 1 — 주석 제외**: HTML 주석(`<!-- ... -->`) 밖의 줄만 항목으로 센다(ADR-064 D4 공통 판독 규칙).
- **판독 규칙 2 — 마지막 이벤트가 현재 상태다**: 한 AC에 `- ac-acceptance`와 `- invalidated`가 여러 번 나타날 수 있다. **그 AC의 현재 상태는 `## 8` 안에서 문서 순서상 마지막에 나오는 그 AC의 이벤트로 판정한다** — 마지막이 `ac-acceptance`면 충족, `invalidated`면 미충족이다. 줄을 지우지 않으므로 이력이 보존되고, 재발급 후 다시 무효화되는 왕복도 순서로 표현된다.
- **신선도는 자동 검사하지 않는다** — 고친 주체가 갱신한다(ADR-064 D4 결론 승계). **무효화 writer는 셋이다** — `/repair-workitem`·`/repair-acceptance`·`/repair-milestone`(cross-cutting 직접 수정이 그 AC의 동작 경로를 건드린 경우). 세 skill 중 어느 것이든 그 AC의 코드를 고치면 `- invalidated` 줄을 append하고 재확인 대상으로 남긴다.

### D4. 두 수치 분리
`/validate-workitem` report는 커버리지를 두 수치로 적는다.

- **충족률** = (충족 AC 수) / (전체 AC 수) — 전 modality 합산. 졸업 item 4의 입력이다.
- **자동화율** = (`자동 테스트` + `산출물 검사`로 충족한 AC 수) / (전체 AC 수) — **report 신뢰도(confidence) 등급의 입력이다.**

사람·플랫폼 관측이 많은 마일스톤이 자동으로 High 신뢰도가 되지 않게 하기 위해 두 수치를 나눈다. `VC-N`(ADR-064 D2 positive control)은 두 수치의 분자·분모 어디에도 넣지 않는다.

### D5. ADR-063 D6과의 관계
ADR-063 D6은 *기계적 검사에 차단력을 부여할 수 있는가*를 규율한다. 본 계약에서 차단하는 것은 `미관측`이고, receipt를 읽는 판정은 **사용자 authority가 발급한 acceptance를 읽어 차단을 해제**하는 방향이다. 따라서 D6의 판정 대상이 아니다. 대신 위장 통과는 아래 3중 방어로 막는다.

1. 발급 authority 제한 (에이전트 대행 금지 — D1)
2. 필수 필드 강제 (절차·환경·결과 — 발명하려면 거짓을 써야 한다 — D3)
3. 자동화율 별도 집계 (사람 관측이 많으면 신뢰도가 오르지 않는다 — D4)

## 근거
- 4개 지점의 predicate를 하나로 맞추지 않으면 어느 한 곳을 고쳐도 다른 곳에서 같은 교착이 재발한다. modality는 그 단일 predicate를 만드는 최소 장치다.
- `산출물 검사`를 `자동 테스트`에 합치거나 사람 관측으로 내리지 않는 이유: 기계로 판정 가능한 것을 사람 승인으로 내리면 게이트가 오히려 느슨해진다.
- opt-out을 AC 면제로 쓰지 않는 이유: ADR-009 본문에 그 근거가 없고, 면제로 쓰면 `## 6-2` 두 줄을 채우는 것만으로 AC 게이트가 사라진다.

## Mutation Contract (ADR-047 D3)
1. **Target** — TASK_TEMPLATE `## 6-1`·`## 8` / plan-workitem modality authoring / implement-workitem·builder.md modality별 RGR 분기 / validate-workitem AC 매핑 판정·report 양식·confidence 입력 / finalize-workitem AC 게이트 / repair-workitem·repair-acceptance·repair-milestone receipt 무효화 / accept-milestone receipt 작성 / validator.md 판정 규칙 / ADR-009 opt-out 명확화 / ADR-067 졸업 item 4.
2. **Failure mode** — (a) 테스트로 확인 불가한 AC가 영구 `❌`로 남아 마일스톤이 졸업하지 못함 (b) 근거 없는 opt-out 예외가 AC 게이트를 무력화 (c) 사람 관측이 waiver 형태로 기록돼 위장 통과 (d) 사람 관측이 커버리지 %에 섞여 신뢰도 등급이 부풀려짐.
3. **Predicted improvement** — 4개 지점의 판정이 일치하고, `Type: research-spike` task가 완료 가능해지며, report에 충족률·자동화율 두 수치가 남는다.
4. **Preserved invariants** — ADR-009 RGR 3 phase / ADR-064 D2 `VC-N` 집계 제외 및 D4 receipt 위치·판독 규칙 / `/validate-workitem` report-only 계약 / `/stabilize-milestone` read-only 계약 / ADR-063 D6 배치 기준.
5. **Falsifying evaluation** — ADR-017 dogfood 재실행에서 (a) 전 AC가 `자동 테스트`인 일반 task에 표기 부담만 늘고 판정이 달라지지 않거나, (b) **마일스톤 자동화율이 본 계약 도입 전 대비 유의하게 떨어지면**(= `자동 테스트`로 쓸 수 있는 AC가 관측 modality로 새는 신호 — 구 item 4가 유일한 "테스트 존재" 차단 게이트였으므로 이 축을 반드시 관측한다), (c) `사용자 관측`·`플랫폼 관측` receipt가 에이전트 발급으로 관측되거나, (d) legacy 판독(표기 부재=자동 테스트) 때문에 신규 task가 표기를 계속 비워 두면 해당 결정을 재조정한다.
6. **Rollback path** — 본 ADR superseded + `## 6-1` modality 표기 제거 + `## AC ↔ 검증 매핑`을 `## AC ↔ 테스트 매핑`으로 복귀 + finalize opt-out 예외 복원.

## 정책 강도 (ADR-022)
- **제약(강) — [관측됨]**: D1의 `미관측`=미충족, D1의 발급 authority 제한, D1의 `산출물 검사`→통합 `validate` 묶기, D2 opt-out 의미 고정.
- **제약(약)**: D1 post-commit 경계(계획 규율), D3 receipt 형식·작성자·판독 규칙, D4 두 수치 분리.

## 결과
- AC 충족의 증명 수단이 5종으로 명시되고, 그 판정 기준이 plan·validate·finalize·stabilize 네 지점에서 같아진다.
- `사용자 관측`·`플랫폼 관측`의 발급 경로는 둘이다 — [ADR-066](ADR-066-milestone-acceptance.md)의 `/accept-milestone`(task 스코프 `--task`는 finalize 전, 마일스톤 스코프는 stabilize 뒤) 또는 사용자 직접 기재. **마일스톤 수용 라운드 자체는 권장이며 의무가 아니다** — 그 modality를 쓰지 않는 프로젝트는 그 단계 없이 진행한다.

## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT. 실제 파일 경로 1행 1개)
- docs/30-workitems/_templates/TASK_TEMPLATE.md         — D1 `## 6-1` modality 표기 / D3 `## 8` receipt 형식
- .claude/skills/plan-workitem/SKILL.md                 — D1 modality authoring
- .claude/skills/validate-workitem/SKILL.md             — D1·D4 AC 매핑 판정 + report 양식 + confidence 입력
- .claude/skills/finalize-workitem/SKILL.md             — D1·D2 AC 게이트(opt-out 예외 제거)
- .claude/skills/implement-workitem/SKILL.md             — D1 modality별 RGR 대상 분기 + 6-V red 상태
- .claude/agents/builder.md                             — D1 modality별 테스트 작성 범위
- .claude/skills/repair-workitem/SKILL.md               — D3 receipt 무효화
- .claude/skills/repair-acceptance/SKILL.md             — D3 receipt 무효화
- .claude/skills/repair-milestone/SKILL.md              — D3 receipt 무효화 (cross-cutting 수정 시)
- .claude/skills/accept-milestone/SKILL.md              — D3 receipt 작성자 (task 스코프 · 마일스톤 스코프)
- .claude/agents/validator.md                           — D1·D4 축 1 판정 규칙
- docs/90-decisions/boilerplate/ADR-009-tdd-default.md  — D2 opt-out 의미 명확화
- docs/90-decisions/boilerplate/ADR-067-milestone-graduation-v2.md — D4 충족률이 졸업 item 4 입력

## 참고
- ADR-009(TDD — opt-out 범위), ADR-026(측정 가능 AC), ADR-039(workitem Type — research-spike), ADR-057#amend-3 결정 6(새 범위 라우팅), ADR-063 D6(기계적 검사 배치 기준 — D5), ADR-064 D1·D2·D4(waiver·`VC-N`·receipt 위치), ADR-066(수용 단계 — 관측 발급 경로), ADR-067(졸업 item 4 소비처).
```

### 1-2. ADR 인덱스에 행 추가

`docs/90-decisions/boilerplate/README.md`의 표 마지막(`064` 행 다음)에 추가한다.

```
| 065 | AC verification contract | accepted | — | AC 충족 증명 modality 5종(자동 테스트/산출물 검사/사용자 관측/플랫폼 관측/미관측=미충족) + authority·receipt + 충족률·자동화율 2수치 |
```

**커밋**: `docs(adr): add ADR-065 AC verification contract`

---

## Phase 2 — ADR-066 신규 작성 (마일스톤 수용 단계)

### 2-1. 파일 생성

`docs/90-decisions/boilerplate/ADR-066-milestone-acceptance.md`를 새로 만든다.

```markdown
# ADR-066 — 마일스톤 수용 단계 (Milestone Acceptance)

> scope: boilerplate
> area: process

## Status
accepted

## 배경
- [관측됨] `/stabilize-milestone` §3-V(경험 게이트)는 앱을 기동해 스크린샷을 찍고 승인 프로토타입과 대조한 뒤 *"사용자 육안 확인 권장(스펙 자체의 오류는 사람이 잡는다)"* 로 끝난다. **권장만 하고, 사람이 실제로 확인했는지·무엇을 봤는지·그 결과가 판정에 반영되는지가 어디에도 없다.**
- [관측됨] 모든 validation report의 `## Evidence Bundle → 검증하지 못한 것(oracle gap)` 섹션은 그 task가 확인하지 못한 것을 카테고리별로 남기는데, **이 목록을 회수해 소비하는 단계가 없다.**
- [관측됨] dogfood 회고에 *"교훈 6건 중 5건이 검증·게이트 정교화 방향이고 제품을 써 본 경험축 교훈은 1건뿐"* 이라는 메타 관측이 기록돼 있다 — 자동 검증만으로는 제품 경험 결함이 드러나지 않는다.
- [관측됨] ADR-065 D1의 `사용자 관측` modality는 receipt 발급 경로가 필요하다.

## 결정

### D1. `/accept-milestone` 신규 skill
`/stabilize-milestone` **뒤**에 사람이 직접 실행·확인하는 단계를 둔다. 실행 환경을 띄우고, 확인할 시나리오를 제시하고, 사용자 피드백을 구조화해 라우팅한다.

- **졸업 필수 조건이 아니다(권장).** 실행하지 않아도 졸업할 수 있다. 단 `사용자 관측`·`플랫폼 관측` modality를 쓴 AC는 receipt 없이 충족되지 않으므로(ADR-065 D1) 그 modality를 쓴 프로젝트는 본 단계를 거치게 된다.
- **졸업 판정 소유권은 `/stabilize-milestone`에 유지한다.** 수용 라운드의 수리는 코드 변경이므로 그 뒤 테스트·e2e 재검증 없이 졸업시키지 않는다.

**스코프 2종 — 이 구분이 lifecycle 교착을 막는 지점이다.**

| 스코프 | 호출 | 시점 | 다루는 것 | 라운드 카운터 | `## 11` 기록 |
|---|---|---|---|---|---|
| **task 스코프** | `/accept-milestone --task <task-id>` | `/validate-workitem`이 그 task의 `사용자 관측`·`플랫폼 관측` AC를 미충족으로 낸 직후(= `finalize` 전) | **그 task의 해당 AC만.** receipt 발급 또는 미충족 확정 | 소모하지 않음 | 쓰지 않음 |
| **마일스톤 스코프** | `/accept-milestone <M>` | `/stabilize-milestone` 뒤 | 마일스톤 전체 경험 확인 + 자유 탐색 + 피드백 3갈래 라우팅 | 소모(상한 3) | 씀 |

- **task 스코프를 두는 이유**: `사용자 관측` AC의 receipt를 마일스톤 스코프에서만 발급할 수 있으면 `validate 미충족 → finalize 불가 → task done 불가 → stabilize 진입 불가 → 발급 불가`의 순환이 생긴다. 선례는 `/stabilize-milestone --feature F-NNN`의 스코프 모드다(그 모드도 졸업 판정·회고 쓰기를 skip한다).
- **task 스코프가 푸는 것은 «지금 사람이 보면 알 수 있는» 관측이다** — 수동 UI 확인, 실기기 확인, 로컬 실행 결과 확인 등. **커밋·배포 이후에만 일어나는 사실**(CI 실행·배포 후 동작·실제 스케줄 발화)은 애초에 그 task의 AC로 두지 않고 후속 verification task로 분리한다([ADR-065](ADR-065-ac-verification-contract.md) D1 경계) — 그것까지 이 스코프로 풀려 하면 finalize를 무한정 붙잡게 된다.
- **task 스코프는 마일스톤 스코프를 대체하지 않는다** — 전자는 *증거 발급*, 후자는 *경험 수용*이다.
- 마일스톤 스코프 **라운드 상한 3회**. 초과 시 남은 항목은 사용자 확인 후 다음 마일스톤으로 이관한다. **라운드 번호는 세션 파일 수로 계산하지 않는다**(수리 라운드가 그 파일을 삭제하므로 상한이 무력화된다) — 마일스톤 문서 `## 11`에 영속된 `- 라운드:` 값을 읽어 +1 한다.

### D2. 피드백 3갈래 라우팅
사용자 피드백은 성격에 따라 기존 3원장으로 나눈다. **새 백로그 파일을 만들지 않는다.**

| 갈래 | 판정 기준 | 목적지 | 이번 M에서 수리 |
|---|---|---|---|
| 계약 위반(결함) | 이번 마일스톤이 약속한 AC·승인 프로토타입·DESIGN 계약을 안 지킴 | `docs/40-validation/QA_FINDINGS.md` | 예 |
| 계약 변경(결정) | 계약 자체를 바꾸려는 것(방향 변경·새 기능) | `docs/10-charter/DECISION_REGISTER.md` `status: open` + 다음 M 후보 (ADR-060 D11 경로) | 아니오 |
| 개선 제안 | 계약 위반은 아니고 더 나은 방식 제안 | `docs/40-validation/IMPROVEMENT_GUIDE.md` | 사용자 선택 |

**이 분류는 skill이 단독으로 확정하지 않고 사용자에게 확인받는다** — 이것이 수용 라운드가 마일스톤을 무한히 늘리지 않게 하는 지점이다.

### D3. 세션 원본은 ephemeral
사용자 발언·재현 절차의 원본은 `docs/40-validation/acceptance-reviews/<M>.r<N>.md`에 남기고 `.gitignore` 대상으로 둔다(ADR-054의 `stabilize-reviews`와 동형). **삭제 주체는 판정에 따라 둘이다** — 결함이 있어 수리로 넘어가면 `/repair-acceptance`가 회수 후 삭제하고, 결함 0건으로 바로 `승인`이면 `/accept-milestone`이 그 자리에서 삭제한다(수리가 호출되지 않아 삭제 주체가 사라지는 것을 막는다). 판정 결과는 D2의 3원장에, 수용 판정 자체는 마일스톤 문서 `## 11. 수용 기록`(커밋 대상)에 영속한다.

- **저장 전 최소화·마스킹 의무**: ephemeral이라도 디스크에는 남는다. 사용자 발언·화면 내용에 자격증명·토큰·개인정보·내부 식별자가 섞이면 **그 부분을 제거하거나 대체한 뒤 저장한다**(ADR-064 D5 마스킹 규정 준용). 마스킹이 확실하지 않으면 원문을 저장하지 않고 구조 요약만 남긴다. task `## 8`의 `- ac-acceptance` 줄에도 같은 규정을 적용한다(그 줄은 커밋되므로 더 엄격하다).

### D4. `/repair-acceptance` 신규 skill (전용 수리 경로)
수용 finding의 수리는 `/repair-milestone`이 아닌 전용 skill이 담당한다. **입력의 authority가 다르기 때문이다.**

- `/repair-milestone`의 4-판정에는 `Reject-false-positive`(stabilize가 잘못 봄)가 있으나, **사용자가 직접 보고 말한 것에 이 판정을 적용할 수 없다** — 에이전트가 사용자 관측을 오탐으로 기각하는 것은 authority 역전이다.
- 따라서 판정 체계는 **3+1**이다: `Adopt` / `Adopt-modified` / `Needs User Clarification`(재현 조건·기대값 불명확 → 되묻는다) / `Out-of-contract`(결함이 아니라 계약 변경 → 사용자 확인 후 원장 + 다음 M).
- **기존 task를 재개방하지 않는다.** task `## 0. Status`와 계획 본문(`## 3`·`## 6`·`## 6-1`)을 건드리지 않는다. 쓰는 것은 **코드**와 **task `## 8`의 append 2종**(`- invalidated` receipt 무효화 / `- pattern-scan` 검색 기록)뿐이다 — 둘 다 이력 추가이며 계약 수정이 아니다. 추적성은 결정 이력의 `affected: T-NNN` 역참조로 확보한다.
- **각 `Adopt` 항목마다 그 결함을 재현하는 실패 테스트를 먼저 추가(Red)한 뒤 고친다.** 불가능하면 사유를 결정 이력에 남긴다. 문구·간격류 소수정(코드 3줄 이하·행동 불변)은 면제한다.
- 커밋하지 않는다(commit owner는 사용자 — ADR-047 D7).

### D5. 경계
- 입력 출처로 갈린다 — `acceptance-reviews`에서 나온 finding은 `/repair-acceptance`, `/stabilize-milestone`이 만든 finding은 `/repair-milestone`.
- 같은 항목이 양쪽에 있으면 **사용자 관측이 우선 authority**다. `/repair-acceptance`가 처리하고 `/repair-milestone`은 상태만 닫는다(그 규칙은 `/repair-milestone` 본문에 박는다 — 아래 Surfaces).
- `IMPROVEMENT_GUIDE.md ## 5. Repair decision log`의 writer가 셋으로 늘어난다(`/repair-plan`·`/repair-milestone`·`/repair-acceptance`) — 그 파일의 writer 설명도 함께 갱신한다.
- D2의 3번(개선 제안)을 이번 마일스톤에서 고치기로 사용자가 택한 경우, 그 항목은 `IMPROVEMENT_GUIDE.md`에 등재된 뒤 **`(수용)` 태그를 달아** 본 skill의 회수 대상에 포함시킨다(회수 범위가 `QA_FINDINGS`에만 걸리면 그 선택이 실행되지 않는다).

## 근거
- 이 단계는 새 개념이 아니라 §3-V가 남긴 *"사용자 육안 확인 권장"* 의 실행 자리이고, oracle gap 목록의 소비처다. 두 미완성 후단을 잇는다.
- 권장(비차단)으로 두는 이유: 사람 확인 부재로 인한 잘못된 졸업은 아직 관측되지 않았다(ADR-022 ratchet). 승격 트리거는 *졸업 YES가 난 마일스톤에서 사용자가 P0급 경험 결함을 발견한 사례* 이며, 그때 필수 항목으로 올린다(ADR-014#amend-2가 soft→hard로 올린 방식과 동형).
- 전용 repair skill을 두는 이유는 위 D4의 authority 차이다(중복이 아니라 특화).

## Mutation Contract (ADR-047 D3)
1. **Target** — `.claude/skills/accept-milestone/SKILL.md` 신규 / `.claude/skills/repair-acceptance/SKILL.md` 신규 / 양 Codex wrapper 신규 / `.gitignore` acceptance-reviews / MILESTONE_TEMPLATE `## 11` / stabilize §3-V (d)·단계 8 다음 단계 / validate-workitem·finalize-workitem의 task 스코프 라우팅 / repair-milestone D5 경계 / IMPROVEMENT_GUIDE `## 5` writer 목록 / ADR-007 단계 추가 note / WORKFLOW lifecycle·실행 순서 / DELEGATION 위임 표·실행 순서 / STRUCTURE 로스터·산출물 표 / README·README_ko wrapper 목록.
2. **Failure mode** — (a) 자동 검증만으로 졸업해 제품 경험 결함이 사용자에게 처음 발견됨 (b) oracle gap이 어디에서도 소비되지 않음 (c) 사용자 피드백이 분류 없이 쌓여 마일스톤이 끝나지 않음 (d) 사용자 관측이 에이전트에 의해 오탐으로 기각됨.
3. **Predicted improvement** — 수용 라운드가 실행된 마일스톤에 `## 11. 수용 기록`이 남고, 사용자 피드백이 3갈래로 분류돼 계약 변경이 현재 M을 늘리지 않는다.
4. **Preserved invariants** — `/stabilize-milestone` read-only + 졸업 판정 소유권 / ADR-067 졸업 항목 무증설 / ADR-060 D11 봉인 후 결정 등재 경로 / ADR-047 D7 commit owner / task status 소유권(finalize·repair-workitem 한정).
5. **Falsifying evaluation** — ADR-017 dogfood 재실행에서 (a) 비-UI 마일스톤에서 제시할 시나리오가 0건이 되거나, (b) 사용자 피드백 분류가 매번 `Out-of-contract`로 쏠려 수리가 발생하지 않거나, (c) 라운드 상한 3회에 도달하는 사례가 반복되면 D1·D2를 재조정한다.
6. **Rollback path** — 본 ADR superseded + 두 skill과 wrapper 제거 + `## 11` 섹션 제거 + `.gitignore` 패턴 제거 + stabilize §3-V (d) 문구 복원.

## 정책 강도 (ADR-022)
- **enabling(약)**: D1 단계 신설(비차단·권장), D2 라우팅, D3 ephemeral 원본.
- **제약(약)**: D4의 3+1 판정·회귀 테스트 선행·task 재개방 금지, D5 경계.

## 결과
- `stabilize → accept → (repair-acceptance) → accept 재확인 → stabilize 재실행 → 졸업` 흐름이 생긴다.
- ADR-065의 `사용자 관측` modality가 발급 경로를 갖는다.

## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT. 실제 파일 경로 1행 1개)
- .claude/skills/accept-milestone/SKILL.md               — D1 라운드 구조 + D2 라우팅 + D3 세션 파일
- .claude/skills/repair-acceptance/SKILL.md              — D4 3+1 판정 + 회귀 테스트 + D5 경계
- .agents/skills/accept-milestone/SKILL.md               — Codex wrapper
- .agents/skills/repair-acceptance/SKILL.md              — Codex wrapper
- .claude/skills/stabilize-milestone/SKILL.md            — §3-V (d) 후속 호출 + 단계 8 다음 단계
- .claude/skills/repair-milestone/SKILL.md               — D5 중복 finding status-only 처리 + `(수용)` 태그 회수 제외
- .claude/skills/validate-workitem/SKILL.md              — D1 task 스코프 라우팅(미충족 관측 AC → `--task` 안내)
- .claude/skills/finalize-workitem/SKILL.md              — D1 `Needs Acceptance` 종료 + task 스코프 안내
- docs/40-validation/IMPROVEMENT_GUIDE.md                — `## 5` writer 목록에 repair-acceptance 추가
- docs/90-decisions/boilerplate/ADR-007-workitem-lifecycle.md — 단계 추가 note (lifecycle SSOT)
- docs/30-workitems/_templates/MILESTONE_TEMPLATE.md     — `## 11. 수용 기록`
- docs/00-meta/WORKFLOW.md                               — lifecycle 그림 + 단계 5-1
- docs/00-meta/DELEGATION_STRATEGY.md                    — 위임 표 + 실행 순서 8.5/8.6
- docs/00-meta/STRUCTURE.md                              — skill 로스터 + 산출물 표
- .gitignore                                             — acceptance-reviews ephemeral

## 참고
- ADR-054(cross-LLM stabilize 리뷰 — ephemeral 리뷰 파일·4판정·echo-then-rm 원형), ADR-056(경험 계약 — 승인 프로토타입·§3-V), ADR-060 D11(봉인 후 새 결정 등재), ADR-065(AC 검증 modality — `사용자 관측` 발급), ADR-047 D7(commit owner·durable correction history), ADR-039(`Type: bugfix` — 회귀 테스트 규율의 원형).
```

### 2-2. ADR 인덱스에 행 추가

`docs/90-decisions/boilerplate/README.md`의 `065` 행 다음에 추가한다.

```
| 066 | Milestone acceptance | accepted | — | /accept-milestone(사람 직접 확인·권장) + /repair-acceptance(3+1 판정·task 재개방 X) + 피드백 3갈래 라우팅 |
```

### 2-3. ADR-007(lifecycle SSOT)에 단계 추가 note

lifecycle 단계가 2개 늘어나므로 SSOT에 기록한다. **선례**: ADR-060 D7이 `/seal-milestone`을 넣을 때 ADR-007 상단에 `> **단계 추가 (2026-07-29)**` note를 남겼다. 그 형식을 그대로 따른다.

`docs/90-decisions/boilerplate/ADR-007-workitem-lifecycle.md`의 기존 단계-추가 note 블록 **바로 다음**에 아래 한 줄을 추가한다(기존 note를 고치지 않는다).

```markdown
> **단계 추가 (2026-08-09)** — `/accept-milestone`(사용자 수용 — 권장, 비차단)과 `/repair-acceptance`(수용 finding 수리 — 기존 task 재개방 X)를 lifecycle에 추가한다. 위치는 `/stabilize-milestone` 뒤이며, `사용자 관측`·`플랫폼 관측` modality AC의 receipt 발급을 위한 **task 스코프 모드**(`--task <task-id>`)는 `/validate-workitem` 뒤·`/finalize-workitem` 앞에서 실행된다. 상세는 [ADR-066](ADR-066-milestone-acceptance.md), 증거 계약은 [ADR-065](ADR-065-ac-verification-contract.md).
```

**커밋**: `docs(adr): add ADR-066 milestone acceptance stage`

---

## Phase 3 — ADR-067 작성 + ADR-014 supersede + 인용 재지정

이 Phase는 3단계다: (A) 새 ADR 작성 → (B) 구 ADR을 superseded로 전환 → (C) ADR-014를 인용하는 23개 파일 처리(**전부 재지정하는 것이 아니다** — 실행 경로는 재지정, 역사적 서술은 병기, 기록물은 보존). **C를 빠뜨리면 stabilize preflight의 `[Ref-dead]`·`[Surface-backref]` 검사가 깨진다.**

### 3-A. `docs/90-decisions/boilerplate/ADR-067-milestone-graduation-v2.md` 생성

```markdown
# ADR-067 — 마일스톤 졸업 계약 v2 (Milestone Graduation Contract v2)

> scope: boilerplate
> area: process

## Status
accepted

## 대체
- [ADR-014](ADR-014-milestone-graduation.md)를 **supersede**한다. ADR-014의 결정 3개(5+1 checklist / 회고 4항목 / pre-check + `--dry-run`)와 개정 4개(evaluator-optimizer 명명 / E2E MUST-run hard-block / 회고 graduation 줄 / 0-spec 예외 철회)를 본 ADR이 통합 승계하고, 아래 3가지를 변경한다.
  1. item 4의 판정 기준을 *자동 테스트 존재* 에서 **AC 충족(전 modality — ADR-065)** 으로 바꾼다.
  2. `BLOCKED` 판정값의 정의를 *e2e blocked-on-env* 에서 **평가 실행 불가(e2e blocked-on-env | 감사 미완)** 으로 넓힌다.
  3. 회고에 `open 항목 스냅샷` 한 줄을 추가한다.
- 통합 재발행 사유(ADR-045 D6): ADR-014#amend-4가 *"graduation contract 자체를 다시 손대야 할 다음 변경에서는 통합 재발행을 우선 검토"* 를 예약했고, 이번 라운드에 서로 다른 3개 지점을 고치므로 그 조건이 충족된다.
- **역사적 서술은 원문을 보존한다.** 다른 ADR이 *"본 D3은 ADR-014 `## Amendment 2`로 박는다"* 처럼 **과거에 한 행위**를 기록한 문장은 바꾸지 않는다(바꾸면 존재하지 않는 역사가 된다). 그 결과 그 줄들에 `P2 [Ref-dead]`(superseded ADR 인용)가 발화하는데 **의도된 상태**다 — 기록을 거짓으로 만드는 것보다 report-only 등급의 P2가 낫다.

## 배경
- [관측됨] item 4가 *자동 테스트 존재* 만 보므로 테스트로 확인 불가한 AC는 영구 미충족이고, `/finalize-workitem`의 근거 없는 opt-out 예외만이 우회로였다(상세는 ADR-065 배경).
- [관측됨] 검증 팬아웃의 축이 결과를 반환하지 않는 상태(감사 미완)에 판정값이 없어, 그 상태에서도 `graduation: YES`가 기록될 수 있다. 값이 없으면 에이전트가 관대한 답을 발명한다(dogfood에서 `NOT_APPLICABLE` 오분류로 관측).
- [관측됨] open finding이 `QA_FINDINGS.md`와 `IMPROVEMENT_GUIDE.md` 둘로 나뉘어 한 파일만 읽은 쪽이 남은 항목 수를 오독한 사례가 있다.
- [외부실증] Atlassian multi-level DoD — sprint 단위의 외부 검증 가능한 완료 기준이 "릴리즈 품질"과 "구현 완료"를 분리한다.

## 결정

### D1. Graduation checklist 5+1
MILESTONE `## 5. 완료 기준`은 다음 5개 필수 + 1개 선택이다. **항목을 증설하지 않는다.**

1. 모든 task status: `done`
2. 통합 `validate` Pass
3. E2E Pass — E2E-applicable 스택은 MUST. 판정 상태 5종(`NOT_APPLICABLE`/`EMPTY`/`PASS`/`FAIL`/`BLOCKED_ENV`)의 SSOT는 [ADR-052](ADR-052-stack-provisioning-and-e2e-readiness.md)#amend-1이며, **실제 실행된 e2e 1개 이상 성공**이 조건이다(0-spec 예외 없음).
4. **AC 충족 100% + report 유효** — 본 마일스톤 **모든 task**의 최신 `docs/40-validation/reports/<task-id>.md`가 아래 넷을 **모두** 만족한다.
   - (a) **`## AC ↔ 검증 매핑`의 전 항목이 충족.** 충족 판정 기준은 [ADR-065](ADR-065-ac-verification-contract.md) D1의 modality다 — `미관측`은 미충족이며 **`## 6-2. TDD opt-out`은 본 항목의 예외가 아니다**(ADR-065 D2).
   - (b) **report 판정이 `Pass`.** AC 행만 읽으면 다른 축의 미해소 P0(diff-trace 파괴적 변경·닫힌 결정 위반 등)가 졸업을 통과한다. 판정을 함께 읽어 그 구멍을 막는다.
   - (c) **`## Orchestration`의 `감사 미완(unavailable)` 항목이 없다.** 돌지 않은 감사를 근거로 충족을 단정하지 않는다(D3의 평가 규칙과 동일 원리).
   - (d) **report가 stale하지 않다** — report 파일 mtime이 그 task `## 4-1`에 등재된 **구현 파일**들의 최신 mtime보다 오래되지 않았다(같으면 통과 — 저해상도 파일시스템 오차단 방지).
     - **비교 대상에서 task 문서를 제외한다(중요).** `/finalize-workitem`은 stale 검사를 통과한 *뒤에* task `## 0. Status`를 `done`으로 쓰므로, 정상 마감된 모든 task는 task 문서 mtime > report mtime이 된다. task 문서를 비교에 넣으면 **정상 경로의 전 task가 미충족**이 되어 어떤 마일스톤도 졸업하지 못한다.
     - task `## 8` 갱신(receipt 발급·무효화)은 이 항이 아니라 **(a)** 가 잡는다 — receipt를 발급해도 report의 그 AC 행은 여전히 미충족이므로 재validate 없이는 (a)를 통과할 수 없다.
     - **`## 4-1`에 없는 파일을 고치는 cross-cutting 수정**(`/repair-milestone`)은 mtime으로 잡히지 않는다. 그 경로는 **그 skill이 영향 task의 report를 삭제**하는 것으로 처리한다 — report 부재 = 미충족이므로 재validate가 강제된다.
     - stale이면 미충족으로 처리하고 처방은 **그 task의 `/validate-workitem` 재실행**이다.
   - **report 부재 task는 미충족**으로 처리한다. 새 체크아웃·다른 worktree가 이에 해당하며(report는 gitignore된 checkout-local ephemeral — 설계상 정상), 그때는 각 task의 `/validate-workitem`을 먼저 재실행한 뒤 본 항목을 평가한다.
5. P0 severity finding 0건 — `QA_FINDINGS.md`의 본 마일스톤 헤더 `### P0`에서 `status: resolved`가 아닌 항목 수 0.
6. (선택) 본 마일스톤 한정 추가 기준

### D2. 회고 5항목
`## 8. 회고`는 다음을 담는다.
- `graduation:` 판정 줄 (D3)
- `open 항목 스냅샷:` — `QA_FINDINGS.md`와 `IMPROVEMENT_GUIDE.md`의 **미해소 항목 합계 + 이전 마일스톤 carry-over 수** 한 줄(두 원장을 각각 읽어야만 알 수 있는 수를 한 곳에 남긴다)
- 목표 달성도 / scope creep 사례 / 비목표 위반 사례 / 핵심 학습 3개 이내

### D3. graduation 판정값 3종
`graduation: <YES | NO | BLOCKED> (<날짜>)`.
- **`YES`** — D1의 5(+선택 6) 항목 전부 충족.
- **`NO`** — 제품·계획 사유로 미충족.
- **`BLOCKED`** — **평가 실행 불가**. 두 경우다: (a) e2e blocked-on-env, (b) **감사 미완** — 졸업 predicate에 입력을 주는 축(qa 팬아웃)의 감사를 회수 규율을 전부 소진해도 완료하지 못한 상태. 표기는 `BLOCKED (audit incomplete: <축>)` / `BLOCKED (e2e blocked-on-env: <target>)`.
  - **`BLOCKED`는 기존에 기록된 `YES`를 덮어쓴다.** 재검증 라운드에서 감사가 미완인데 줄을 쓰지 않으면 낡은 `YES`가 그대로 남아 하류(ROADMAP Done)가 졸업으로 읽는다.
  - **미실행 감사가 입력을 주는 predicate는 «충족»으로 단정할 수 없다.** 이것은 새 checklist 항목이 아니라 D1 항목의 *평가 규칙*이다.
  - reviewer 팬아웃은 졸업 predicate 입력이 아니므로(report-only) 그 축의 감사 미완은 **기록·echo만 하고 판정을 바꾸지 않는다.**
  - **`YES (… 미검증: <축>)` 같은 병기 통과를 본 ADR은 도입하지 않는다.** `YES`는 D1의 전 항목 충족을 뜻하므로 미검증 축을 병기한 `YES`는 정의와 모순된다. host 제약 e2e target(예: Windows 호스트의 iOS)의 처리는 **본 ADR이 바꾸지 않으며 [ADR-052](ADR-052-stack-provisioning-and-e2e-readiness.md)#amend-1과 [ADR-059](ADR-059-flutter-mobile-profile.md) D4가 그대로 소유한다** — 같은 커밋의 registry PASS 증거가 있으면 그 target을 `PASS`로 보고, 없으면 `BLOCKED_ENV`로 졸업을 차단한다. (그 교착을 완화하는 별도 방향이 dogfood에 기록돼 있으나 아직 채택되지 않았다 — 본 ADR은 그 결정을 대신 내리지 않는다.)
  - 따라서 D3의 `BLOCKED`가 덮는 것은 둘뿐이다: **(a) e2e blocked-on-env**(ADR-052#amend-1 판정 그대로), **(b) 감사 미완**. 계약상 애초에 대상이 아닌 것은 `NOT_APPLICABLE`이다.
  - **validate 층도 같은 규칙을 받는다** — `/validate-workitem`의 감사 축이 회수 규율을 전부 소진해도 미완이면 그 report는 `Pass`를 낼 수 없다(위 D1 item 4 (c)의 입력). 이것은 새 게이트가 아니라 본 D3의 평가 규칙을 task 층에 적용한 것이며, 기록 규율의 근거는 ADR-051#amend-4 결정 2다.
- 기록 시점은 `/stabilize-milestone` 단계 8이며 1회만 쓴다(§1.5 사전점검에서 쓰지 않는다 — 단계 4~6이 새 P0를 찾을 수 있다). P0 기준은 qa 팬아웃이 `QA_FINDINGS.md`에 기록한 것만 반영한다(reviewer는 report-only).
- 이 줄은 `docs/30-workitems/ROADMAP.md` Done/Now의 파생 입력이다(다음 `/plan-milestone` R0가 읽어 재조정 — ADR-057#amend-1). 로드맵 파일 자체는 stabilize가 건드리지 않는다.

### D4. Graduation pre-check + `--dry-run`
`/stabilize-milestone` §1.5가 D1 각 항목을 deterministic 평가한다. 미충족 시 `졸업 가능: NO` + 미충족 목록 출력 + 조기 종료 옵션 제시(강제 종료 아님). `--dry-run`은 pre-check만 돌리고 종료한다(판정 미기록).

### D5. Evaluator-optimizer 패턴 명명
`/stabilize-milestone`이 instantiate하는 패턴을 evaluator-optimizer로 명명한다 — generator = `/implement-workitem`, evaluator = qa + reviewer + deterministic preflight, optimizer = `/repair-workitem`.

### D6. 사용자 수용과의 관계
[ADR-066](ADR-066-milestone-acceptance.md)의 `/accept-milestone`은 **졸업 필수 조건이 아니다**(권장). 단 `사용자 관측`·`플랫폼 관측` modality를 쓴 AC는 그 receipt 없이 item 4를 충족하지 못한다(그 receipt는 task 스코프 `--task`나 사용자 직접 기재로도 발급된다 — 마일스톤 수용 라운드를 돌려야만 하는 것은 아니다). 필수 승격 트리거는 *졸업 `YES` 후 사용자가 P0급 경험 결함을 발견한 사례* 이며, 그때 본 ADR을 개정한다.

## 비결정 (영구 No)
- Release-level DoD — stabilize 출력에 자연 흡수(carry-over 0건 + ADR 후보 0건 = release-ready).
- Fowler 4-quadrant test classification — 정확도 보장 불가, YAGNI.
- METRICS.md — 메트릭 정의는 프로젝트별 결정.
- `--apply-carryover` 자동 이월 — 사용자 명시 결정 필요(ADR-007 책임 경계).
- architect auto-escalation 신호 — 트리거 기준 정의 불가.

## 결과
- 졸업 판정의 네 소비 지점(plan·validate·finalize·stabilize)이 같은 AC 기준을 읽는다.
- 감사가 못 돈 상태가 `BLOCKED`로 드러나며 낡은 `YES`를 덮어쓴다.
- 회고 한 줄로 두 원장의 미해소 합계를 볼 수 있다.

## 정책 강도 (ADR-022)
- **제약(강) — [관측됨]**: D1 item 3·4, D3 `BLOCKED`의 덮어쓰기.
- **enabling(약)**: D2 회고 항목, D4 pre-check, D5 명명, D6 비차단 관계.

## Mutation Contract (ADR-047 D3)
1. **Target** — MILESTONE_TEMPLATE `## 5`·`## 8` / stabilize §1.5·단계 8·회고 책임 경계 / validate-workitem 감사 미완 판정 / repair-milestone·repair-acceptance report 무효화 / ADR-014 status·supersede note / ADR-014 인용 파일 전수(실행 경로는 재지정, 역사적 서술은 병기).
2. **Failure mode** — (a) 테스트 불가 AC로 졸업 영구 차단 (b) 감사 미완 상태에서 `YES` 기록 (c) 낡은 `YES` 보존 (d) 두 원장 중 한쪽만 읽고 남은 항목 오독.
3. **Predicted improvement** — item 4 미충족 사유가 modality로 분해되어 보이고, 감사 미완이 `BLOCKED`로 관측되며, 회고에 open 합계가 남는다.
4. **Preserved invariants** — 5+1 구조·항목 무증설 / e2e 판정 SSOT는 ADR-052#amend-1 / `/stabilize-milestone` read-only 및 write 대상 4종 / ROADMAP 단일 작성자 = plan-milestone.
5. **Falsifying evaluation** — dogfood 재실행에서 (a) 정상 마일스톤이 `BLOCKED (audit incomplete)`로 오차단되거나, (b) item 4가 modality 표기 누락만으로 미충족을 내면 D1·D3을 재조정한다.
6. **Rollback path** — 본 ADR을 superseded로 두고 **후속 ADR이 net 규칙을 다시 정의한다**(ADR-014를 `accepted`로 되살리지 않는다 — supersede 이력은 되돌리지 않는 것이 이 저장소의 규약이다). 되돌릴 실질은 셋이다: item 4를 «자동 테스트 매핑 100%» 기준으로, `BLOCKED`를 «e2e blocked-on-env» 한정으로, 회고에서 `open 항목 스냅샷:` 줄 제거.

## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT. 실제 파일 경로 1행 1개)
- .claude/skills/stabilize-milestone/SKILL.md          — D1 §1.5 / D2·D3 단계 8 회고 / D4 --dry-run / D5 명명 1줄
- .claude/skills/validate-workitem/SKILL.md            — D3 validate 층 평가 규칙(감사 미완 시 Pass 불가) + item 4 (c) 입력 기록
- .claude/skills/repair-milestone/SKILL.md             — D1 item 4 (d) 보완: cross-cutting 수정 시 영향 task report 삭제
- .claude/skills/repair-acceptance/SKILL.md            — D1 item 4 (d) 보완: 수리한 task report 삭제
- .claude/skills/stack-guard/SKILL.md                  — D1 item 3 E2E-applicable 판정
- docs/30-workitems/_templates/MILESTONE_TEMPLATE.md   — D1 `## 5` / D2 `## 8`
- docs/00-meta/DELEGATION_STRATEGY.md                  — D5 evaluator-optimizer 1줄
- docs/90-decisions/boilerplate/ADR-014-milestone-graduation.md — superseded note

## 참고
- ADR-007(lifecycle), ADR-009(TDD), ADR-022(Ratchet), ADR-045 D6(재발행 기준), ADR-052#amend-1(e2e 5상태 SSOT), ADR-057#amend-1(ROADMAP 파생), ADR-065(AC 검증 modality), ADR-066(수용 단계).
```

### 3-B. ADR-014를 superseded로 전환

`docs/90-decisions/boilerplate/ADR-014-milestone-graduation.md`를 다음 **세 곳만** 고친다. **본문·개정은 history로 남기고 지우지 않는다.**

1. `## Status` 아래 값을 `accepted` → `superseded`로 바꾼다.
2. `## Status` 블록 바로 다음에 아래 단락을 삽입한다.

```markdown
> **superseded by [ADR-067](ADR-067-milestone-graduation-v2.md)** (2026-08-09) — 통합 재발행. 본 ADR의 결정 3개와 개정 4개는 ADR-067이 승계하며, item 4 판정 기준(AC 충족 modality)·`BLOCKED` 정의(감사 미완 포함)·회고 open 스냅샷 3가지가 변경됐다. 본 문서는 이력 보존용이며 새 인용은 ADR-067로 한다.
```

3. `## 현재 유효 결정` 헤딩을 `## 현재 유효 결정 (이전 — ADR-067로 이전됨)`으로 바꾼다. superseded 문서가 "현재 유효"를 주장하면 이 저장소의 `## 현재 유효 결정` 규약(net 규칙을 한눈에 보여 주는 자리)이 두 문서에서 충돌한다.

### 3-C. ADR-014를 인용하는 23개 파일 처리 (재지정 / 병기 / 보존)

#### 앵커 매핑표 (이 표대로 치환한다)

| 구 인용 | 신 인용 |
|---|---|
| `ADR-014` (일반 참조) | `ADR-067` |
| `ADR-014#d1` / "5+1 checklist" 문맥 | `ADR-067` D1 |
| `ADR-014#d2` / "회고 4항목" 문맥 | `ADR-067` D2 (항목 수는 **5**로 고쳐 적는다) |
| `ADR-014#d3` / "pre-check·--dry-run" 문맥 | `ADR-067` D4 |
| `ADR-014#amend-1` (evaluator-optimizer) | `ADR-067` D5 |
| `ADR-014#amend-2` / `#amend-4` (E2E hard-block·0-spec 철회) | `ADR-067` D1 item 3 |
| `ADR-014#amend-3` (회고 graduation 줄) | `ADR-067` D3 |
| 링크 경로 `ADR-014-milestone-graduation.md` | `ADR-067-milestone-graduation-v2.md` |

#### 대상 파일 (23개)

```
.boilerplate/validation/SIMULATION_RUN.md
.claude/agents/reviewer.md
.claude/skills/plan-milestone/SKILL.md
.claude/skills/repair-milestone/SKILL.md
.claude/skills/stabilize-milestone/SKILL.md
.claude/skills/stack-guard/SKILL.md
.claude/skills/validate-plan/SKILL.md
docs/00-meta/DELEGATION_STRATEGY.md
docs/00-meta/STRUCTURE.md
docs/30-workitems/_templates/MILESTONE_TEMPLATE.md
docs/90-decisions/boilerplate/ADR-017-dogfood-simulation.md
docs/90-decisions/boilerplate/ADR-047-code-as-agent-harness.md
docs/90-decisions/boilerplate/ADR-049-concept-mockup-first-design.md
docs/90-decisions/boilerplate/ADR-050-main-session-lifecycle-skills.md
docs/90-decisions/boilerplate/ADR-051-main-session-orchestration-and-wave-removal.md
docs/90-decisions/boilerplate/ADR-052-stack-provisioning-and-e2e-readiness.md
docs/90-decisions/boilerplate/ADR-053-high-stakes-design-panel.md
docs/90-decisions/boilerplate/ADR-054-cross-llm-stabilize-review.md
docs/90-decisions/boilerplate/ADR-056-milestone-experience-contract.md
docs/90-decisions/boilerplate/ADR-057-planning-v2-batch-and-seam.md
docs/90-decisions/boilerplate/ADR-063-verification-harness-integrity.md
docs/90-decisions/boilerplate/ADR-064-task-layer-evidence-contract.md
docs/90-decisions/boilerplate/README.md
```

#### 인용을 3분류한다 (일괄 치환 금지)

**분류 1 — 현재 유효 결정·실행 경로 인용 → 재지정한다.** skill 본문, `docs/00-meta/*`, 템플릿, 그리고 ADR 본문 중 *지금도 유효한 규칙을 참조하는* 문장. 위 매핑표대로 바꾼다.

**분류 2 — 역사적 서술 → 그대로 두고 병기만 한다.** *과거에 무엇을 했다*는 기록은 바꾸면 존재하지 않는 역사를 만든다. 예: `ADR-052-stack-provisioning-and-e2e-readiness.md`의 *"본 D3은 ADR-014 `## Amendment 2`로 박는다"*, 그 파일 `## Surfaces`의 `ADR-014-milestone-graduation.md — ## Amendment 2 + Surfaces add`·`— Amendment 4`, ADR-052 `## 배경`의 *"graduation checklist(ADR-014 #1 item 3 …)"*. 이들은 **문자열을 유지하고** 그 줄 끝(또는 그 절 첫 줄)에 `(현재 SSOT: ADR-067)`을 덧붙인다.
- 그 결과 stabilize preflight의 `P2 [Ref-dead]`(superseded ADR 인용)가 그 줄들에 발화한다. **이것을 감수한다** — 기록을 거짓으로 만드는 것보다 P2 보고가 낫고, `[Ref-dead]`는 report-only 등급이다. 이 감수 사실은 3-A의 ADR-067 `## 대체` 절에 이미 한 줄로 박혀 있다(따로 추가하지 않는다).

**분류 3 — 손대지 않는다.**
1. **`.boilerplate/validation/SIMULATION_RUN.md`** — 과거 라운드의 *실측 기록*. **인용을 그대로 두고**, `ADR-014` 첫 등장 줄 위에 아래 한 줄만 추가한다.
   ```markdown
   > 주: 본 문서의 `ADR-014` 인용은 기록 당시 기준이다. 현재 유효 ADR은 ADR-067이다.
   ```
2. **`docs/90-decisions/boilerplate/ADR-014-milestone-graduation.md`** — 자기 자신(3-B에서 처리 완료).

> 판별 기준 한 줄: **"이 문장이 지금 무엇을 하라고 지시하는가"** 면 분류 1, **"과거에 무엇을 했다"** 면 분류 2다.

#### 파일별 지시

- **`.claude/skills/stabilize-milestone/SKILL.md`** — **인용은 7곳이다**(실측): ① 도입부 첫 줄 `ADR-014#amend-1`(evaluator-optimizer) → `ADR-067 D5` ② 책임 경계 3번 항목의 링크 + graduation contract 문구 → `ADR-067`(링크 경로도) ③ `### 1.5. Graduation pre-check (ADR-014)` 헤딩 → `(ADR-067)` ④ §1.5 도입 문구의 `ADR-014 *P0 검증 도구*` → `ADR-067 D4` ⑤ §1.5 `EMPTY` 항목의 `ADR-014#amend-4` → `ADR-067 D1 item 3` ⑥ §1.5 graduation 기록 시점 단락의 `ADR-014` → `ADR-067 D3` ⑦ 단계 8 회고 책임 경계의 `ADR-014` → `ADR-067 D3`. **7곳을 모두 고친다** — 하나라도 남으면 Phase 13 검증 #2에서 걸린다. 본문 *내용* 수정은 Phase 7·10에서 한다.
- **`docs/90-decisions/boilerplate/ADR-052-stack-provisioning-and-e2e-readiness.md`** — 분류 2다. **실측 12줄** 전부 문자열을 유지하고 `## 현재 유효 결정`·`## 배경`·D3·`## Surfaces`·`## 참고`의 해당 줄에 `(현재 SSOT: ADR-067)`을 덧붙인다. **파일 경로·`## Amendment 2`·`Amendment 4` 표기를 바꾸지 않는다.**
- **`docs/90-decisions/boilerplate/README.md`** — 세 가지를 한 번에 처리한다. ① `014` 행의 `Status` 칸을 `superseded`로 바꾸고 요약 칸 끝에 ` → ADR-067로 통합 재발행`을 덧붙인다. ② `052` 행 요약 칸의 `E2E MUST-run hard-block(ADR-014#amend-2)`는 **분류 2**(그 amendment를 만든 사실의 기록)이므로 **문자열을 유지하고** 뒤에 ` → 현재 SSOT: ADR-067`만 덧붙인다(그래서 이 파일이 아래 검증 (2)의 제외 목록에 있다). ③ 표 마지막(`066` 행 다음)에 아래 행을 추가한다.
  ```
  | 067 | Milestone graduation contract v2 | accepted | — | ADR-014 통합 재발행. item 4=AC 충족(전 modality) / BLOCKED=평가 실행 불가(e2e env·감사 미완) / 회고 open 스냅샷 |
  ```
- **`docs/00-meta/STRUCTURE.md`** — Canonical Owner 표의 `Milestone graduation checklist 5+1` 행을 아래로 바꾼다.
  ```
  | Milestone graduation checklist 5+1 | [ADR-067](../90-decisions/boilerplate/ADR-067-milestone-graduation-v2.md) (정책 SSOT — 구 계약 통합 재발행). → ADR-067 `## Surfaces` 참조. |
  ```
  **교체문에 `ADR-014` 문자열을 넣지 않는다** — `docs/00-meta`는 분류 1(실행 경로)이라 Phase 13 검증 #1이 그 디렉터리에 `ADR-014` 0건을 요구한다. 대체 사실은 ADR-067 본문 `## 대체` 절이 이미 담고 있다.
  그리고 같은 표에 아래 두 행을 추가한다.
  ```
  | AC 검증 modality·authority·receipt (충족률/자동화율) | [ADR-065](../90-decisions/boilerplate/ADR-065-ac-verification-contract.md) (정책 SSOT). → ADR-065 `## Surfaces` 참조. |
  | 마일스톤 수용 단계 (accept/repair-acceptance·피드백 3갈래) | [ADR-066](../90-decisions/boilerplate/ADR-066-milestone-acceptance.md) (정책 SSOT). → ADR-066 `## Surfaces` 참조. |
  ```
- **나머지 파일** — 위 매핑표대로 문자열을 치환한다. 개정 앵커(`#amend-N`)가 붙은 인용은 반드시 매핑표의 `D` 번호로 바꾼다(존재하지 않는 앵커를 남기면 preflight `[Ref-anchor]`가 P1을 낸다).

#### 3-C 검증

```bash
# (1) 실행 경로(skill·meta·템플릿)에 ADR-014 인용이 남아 있으면 안 된다 — 분류 1 전수 확인
grep -rn "ADR-014" --include="*.md" .claude .agents docs/00-meta docs/30-workitems
#    기대: 출력 없음

# (2) 존재하지 않는 앵커(ADR-067에 없는 #amend-N)를 가리키는 인용이 남았는지
grep -rn "ADR-014#amend" --include="*.md" --exclude=IMPROVE-GUIDE.md . \
  | grep -v SIMULATION_RUN | grep -v ADR-014-milestone | grep -v ADR-052- | grep -v "boilerplate/README.md" \
  | grep -v "boilerplate/ADR-066-" | grep -v "boilerplate/ADR-067-"
#    기대: 출력 없음
#    제외 대상은 모두 «과거에 무엇을 했다»는 역사적 서술이라 의도적 보존이다 — ADR-052(분류 2),
#    그리고 본 가이드가 Phase 2·3-A에서 **직접 작성하도록 지시한** 두 문장:
#      ADR-066 `## 근거`  — "ADR-014#amend-2가 soft→hard로 올린 방식과 동형"
#      ADR-067 `## 대체`  — "ADR-014#amend-4가 … 통합 재발행을 우선 검토를 예약했고"
#    이 둘을 재지정하면 존재하지 않는 역사가 된다(특히 ADR-067은 자기 자신을 가리키게 된다).
#    두 줄에 `P2 [Ref-dead]`가 발화하는 것은 3-A의 ADR-067 `## 대체` 절이 이미 «의도된 상태»로 선언했다.

# (3) ADR 층에 남은 ADR-014 인용은 전부 분류 2·3이어야 한다 — 눈으로 확인
grep -rln "ADR-014" --include="*.md" --exclude=IMPROVE-GUIDE.md docs/90-decisions .boilerplate | sort
#    기대: ADR-014 자신 + ADR-052 + SIMULATION_RUN + ADR-066·ADR-067(위 (2)의 역사적 인용 각 1건) + (병기 처리한 역사적 서술 보유 ADR들)
#    이 목록의 각 파일에서 남은 인용이 "과거에 무엇을 했다"인지 확인한다. 지시문이면 분류 1이므로 재지정한다.
```

**커밋**: `docs(adr): reissue ADR-014 as ADR-067 and repoint live citations`

---

## Phase 4 — ADR-009 정리 (opt-out 의미 + Surfaces)

`docs/90-decisions/boilerplate/ADR-009-tdd-default.md`를 고친다.

### 4-1. opt-out 범위 명확화 — **본문 편집이 아니라 `## Amendment 2`로 넣는다**

`## 결정`의 `opt-out 절차:` 블록은 **건드리지 않는다.** 배포된 ADR의 결정 블록에 새 규범 문장을 몰래 끼워 넣으면 개정 이력이 사라진다. 파일 맨 끝에 아래를 추가한다(ADR-009는 `## Amendment 1`을 이미 갖고 있으므로 2번이다).

```markdown
<a id="adr-009-amend-2"></a>
## Amendment 2 (2026-08-09) — opt-out 범위 명확화 (Red-first 면제 ≠ AC 충족 면제)

### 결정
`## 결정`의 `opt-out 절차:`가 규정하는 면제 범위를 다음으로 고정한다.
- **opt-out은 Red-first 절차(RGR 3 phase)의 면제까지다 — AC 충족의 면제가 아니다.** 본 ADR의 `## 결정` `검증 흐름:`이 이미 *"AC 미충족 항목이 있으면 `Needs Fix`로 종료"* 를, `## 결과`가 *"finalize-workitem 통과 조건에 AC 미충족 0개 추가"* 를 규정하며, opt-out에 대해 요구한 것은 *"finalize 시점에 사유를 사용자에게 명시적으로 보여주고 확인"* 뿐이다.
- opt-out task도 AC마다 검증 modality와 증거가 필요하다(정의: [ADR-065](ADR-065-ac-verification-contract.md) D1/D2). `Type: research-spike`는 구조 사실을 `산출물 검사`로, 내용 판단을 `사용자 관측`으로 충족한다.
- 따라서 `/finalize-workitem`·`/validate-workitem`·졸업 item 4는 `## 6-2`가 채워졌다는 사실만으로 AC 미충족을 통과시키지 않는다.

### 근거
- [관측됨] `/finalize-workitem`이 *"opt-out 사유가 있는 task는 예외"* 로 AC 미충족을 통과시켜, 본 ADR이 요구한 "사유 표시"가 "게이트 면제"로 확대 해석됐다. 그 결과 `## 6-2` 두 줄을 채우는 것만으로 AC 게이트가 사라졌다.
- [관측됨] 반대편에서 졸업 item 4는 예외가 없어 정당한 opt-out task가 마일스톤을 영구 차단했다. 같은 규정을 두 지점이 반대로 읽었다.

### 강도 (ADR-022)
- 제약(강) — [관측됨]. 기존 규정의 *해석 고정*이며 새 요구를 추가하지 않는다.

### 적용 surface
- .claude/skills/finalize-workitem/SKILL.md
- .claude/skills/validate-workitem/SKILL.md
- docs/90-decisions/boilerplate/ADR-067-milestone-graduation-v2.md
```

그리고 `docs/90-decisions/boilerplate/README.md`의 `009` 행 `Amendments` 칸에 `, +#amend-2: opt-out 범위 명확화(Red-first 면제 ≠ AC 충족 면제)`를 기존 형식 그대로(괄호 안에서 comma 이어쓰기) 덧붙인다.

### 4-2. Surfaces 보정 (누락 파일 추가)

**기존**:
```markdown
## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT)
- docs/30-workitems/_templates/TASK_TEMPLATE.md   — ## 6-1 테스트 시나리오 path 형식 권장 (opt-in, ADR-047 D6 contract formation 정합)
- .claude/skills/validate-workitem/SKILL.md       — AC↔테스트 매핑 path 우선 resolve + [verify-placeholder] P2 라벨
```

**수정** — 아래 두 줄을 추가한다(`## 결과`가 "finalize-workitem 통과 조건에 AC 미충족 0개 추가"를 이미 규정하는데도 그 파일이 Surfaces에 없어 정합 검사가 이 파일을 보지 못했다).
```markdown
- .claude/skills/finalize-workitem/SKILL.md       — AC 미충족 0개 게이트 + opt-out은 사유 표시까지(면제 아님)
- .claude/skills/implement-workitem/SKILL.md      — RGR 3 phase + opt-out 모드 지시
```

**커밋**: `docs(adr): add ADR-009 amendment 2 clarifying opt-out scope`

---

## Phase 5 — 템플릿 수정

### 5-1. `docs/30-workitems/_templates/TASK_TEMPLATE.md` — `## 6-1` modality 표기

`## 6-1. 테스트 시나리오 (TDD Red)` 주석 블록 안, `VC-N 행의 writer는 …` 문장 다음에 아래를 추가한다.

> ⚠ **삽입 위치 주의**: 그 문장은 ` --> `로 끝난다(주석 종료). **닫는 `-->` 앞에** 넣어야 한다. `-->` 뒤에 붙이면 이 지시문이 모든 task 문서에서 *본문으로 보이는 텍스트*가 된다. 원문 마지막 줄의 `-->`를 떼어 새로 추가한 마지막 줄 끝으로 옮긴다.

```
     **검증 modality 표기 (ADR-065 D1 — 필수)**: 각 AC 행의 **AC 번호 바로 뒤**에 그 AC를 무엇으로 증명하는지 `[modality]`를 붙인다.
     - `[자동 테스트]` — `- AC-1 [자동 테스트] → jest::tests/auth/me.spec.ts::test_AC_1_...`
     - `[산출물 검사]` — `- AC-2 [산출물 검사] → npm run validate — insights 노트에 필수 섹션 3개(대안/권고/출처) 존재` (**검사 수단을 통합 `validate`에 묶는다** — 묶이지 않으면 충족 근거가 아니다. 내용의 *질*을 판정하는 AC는 이 modality가 아니라 `[사용자 관측]`이다)
     - `[사용자 관측]` — `- AC-3 [사용자 관측] → 삭제 확인 다이얼로그 문구·간격을 승인 프로토타입과 대조` (증거는 ## 8의 `- ac-acceptance` 줄)
     - `[플랫폼 관측]` — `- AC-4 [플랫폼 관측] → 선행 배포(T-012) 이후 이미 발화한 03:00 스케줄의 배치 완주를 확인 (증거: 실행 로그 run id)`. **커밋·배포 이후에만 일어나는 사실은 그것을 만든 task가 아니라 후속 verification task의 AC다**(ADR-065 D1 경계) — 같은 task에 두면 finalize 전에 관측할 수 없어 영구 미충족이 된다.
     - `[미관측]` — **계획 단계에서 쓰지 않는다**(판정 결과 라벨이지 authoring 표기가 아니다 — ADR-065 D1). 어떤 modality도 정할 수 없으면 AC를 관측 가능하게 다시 쓰거나 task를 쪼갠다.
     - **표기가 없는 AC는 `[자동 테스트]`로 간주한다(legacy 호환)** — 기존 fork의 task는 표기가 없으므로 이 규칙이 없으면 재검증에서 일괄 미충족이 된다. 그 AC에 대응 테스트가 없으면 기존과 같이 미충족이며, 표기 부재 자체는 `P2 [Modality-missing]` 기록 등급이다. **신규 task는 표기를 채운다.**
     modality writer: plan-workitem(계획 시 지정) · builder/foreman(구현 시 실제 경로·테스트 id 확정). `사용자 관측`·`플랫폼 관측`의 증거는 사용자만 발급한다(에이전트 대행 금지).
```

### 5-2. 같은 파일 — `## 8` receipt 형식 2줄 추가

`## 8. 메모` 주석 블록 안, `- fact-resolved …` 줄 다음에 아래 두 줄을 추가한다. **그 줄도 ` -->`로 끝나므로 5-1과 같이 닫는 `-->`를 새 마지막 줄로 옮긴다.**

```
       `- ac-acceptance <날짜> <AC-N>: modality=<사용자 관측|플랫폼 관측> / authority=사용자 / source=<출처 식별자 — 플랫폼 관측만> / 환경=<대상·버전> / 절차=<무엇을 했는가> / 결과=<관측 1줄>`  (ADR-065 D3 — writer: accept-milestone 또는 사용자. `authority`는 항상 `사용자`다. 신선도 자동검사 없음 — 고친 주체가 `- invalidated <날짜> <AC-N>: <사유>`로 무효화)
       `- pattern-scan <날짜> <패턴 1줄>: 범위 내 N건 수정 / 범위 밖 M건 <경로 목록>`  (동일 결함 패턴의 다른 출현 전수 검색 결과 — writer: repair-workitem·repair-acceptance. 범위 밖 항목은 stabilize·repair-milestone이 회수)
```

### 5-3. `docs/30-workitems/_templates/MILESTONE_TEMPLATE.md` — `## 5` item 4

**기존**:
```markdown
- [ ] AC 매핑 100% (validation report 기준)
```

**수정**:
```markdown
- [ ] AC 충족 100% (validation report `## AC ↔ 검증 매핑` 기준 — 전 modality 합산). 충족 판정은 ADR-065 D1 modality를 따르며 `미관측`은 미충족이고, `## 6-2. TDD opt-out`은 본 항목의 예외가 아니다(ADR-065 D2). report 부재 task는 미충족
```

### 5-4. 같은 파일 — `## 8` 회고

> ⚠ **Phase 3-C 적용 후 상태로 매칭한다** — 3-C가 이 블록 안의 `ADR-014`를 이미 `ADR-067`로 바꿨다. 아래 「기존」은 3-C 이전 원문이므로, 실제 파일에서는 `(ADR-014·ADR-057#amend-1)` → `(ADR-067 D3·ADR-057#amend-1)`, `(ADR-014상 …)` → `(ADR-067상 …)`, `(증거 영속 강화는 ADR-014 범위)` → `(… ADR-067 범위)` 로 이미 바뀌어 있다. 그 상태를 찾아 교체한다.

**기존** (첫 줄 — 3-C 이전 원문):
```markdown
- graduation: <YES | NO | BLOCKED> (<날짜>)  <!-- stabilize 단계 8 최종 판정(단계 4~6 qa 팬아웃 P0(QA_FINDINGS)만 반영, reviewer report-only 미반영) 영속 — §1.5 사전점검 아님. ROADMAP.md 파생 입력 (ADR-014·ADR-057#amend-1). BLOCKED = e2e blocked-on-env. 주: 이 판정은 stabilize 시점 report(ADR-014상 checkout-local ephemeral) 기준이며, ROADMAP Done은 이 *영속된 판정*의 파생이지 fresh clone에서 재도출된 증거가 아니다 — 재검증이 필요하면 stabilize 재실행(증거 영속 강화는 ADR-014 범위). -->
```

**수정** (주석 안의 `BLOCKED` 정의를 넓히고, ADR 번호를 바꾸고, 재검증 순서를 명시한다):
```markdown
- graduation: <YES | NO | BLOCKED> (<날짜>)  <!-- stabilize 단계 8 최종 판정(단계 4~6 qa 팬아웃 P0(QA_FINDINGS)만 반영, reviewer report-only 미반영) 영속 — §1.5 사전점검 아님. ROADMAP.md 파생 입력 (ADR-067 D3·ADR-057#amend-1). BLOCKED = 평가 실행 불가 2종: `BLOCKED (e2e blocked-on-env: <target>)` / `BLOCKED (audit incomplete: <축>)`. BLOCKED는 기존 YES를 덮어쓴다. 주: 이 판정은 stabilize 시점 report(checkout-local ephemeral) 기준이며, ROADMAP Done은 이 *영속된 판정*의 파생이지 fresh clone에서 재도출된 증거가 아니다 — **새 체크아웃에서 재검증할 때는 각 task의 `/validate-workitem`을 먼저 재실행해 report를 만든 뒤 stabilize를 돌린다**(report가 없으면 item 4가 전 task 미충족으로 나온다). -->
- open 항목 스냅샷: <QA_FINDINGS 미해소 N건 / IMPROVEMENT_GUIDE 미해소 M건 / 이전 M carry-over(P0/P1) K건>  <!-- ADR-067 D2 — 두 원장을 각각 읽어야만 알 수 있는 수를 한 줄로 남긴다. stabilize 단계 8이 채움. N·M은 전 severity, carry-over는 P0/P1만(다른 마일스톤 항목은 색인 스캔 대상) -->
```

### 5-5. 같은 파일 — `## 11. 수용 기록` 신설

`## 10. 봉인 기록` 블록 **다음**에 아래를 추가한다.

**형식은 `## 10. 봉인 기록`과 동형으로 한다** — 필드 예시를 *주석 안*에 두고, 판정 기준은 «섹션 존재»가 아니라 «`- 수용일:` 줄의 채움»이다. `## 10`이 이미 그 이유를 본문에 적어 뒀다(섹션은 템플릿에 빈 채로 들어가므로 모든 마일스톤에 존재한다). 필드를 주석 밖에 두면 미실행 마일스톤에도 값이 채워진 것처럼 보이고 "미실행이면 비워 둔다"와 모순된다.

```markdown
## 11. 수용 기록 (acceptance receipt — /accept-milestone 마일스톤 스코프가 채움)
<!-- 수용 라운드를 실행했을 때만 기록된다. 본 단계는 권장이며 졸업 필수 조건이 아니다(ADR-067 D6) — 미실행이면 본 섹션은 빈 채로 남는다. 형식(ADR-066 D1/D3):
- 수용일: <YYYY-MM-DD>
- 판정: <승인 | 보류(백로그 N건) | 미완(<사유> — 확인 K/M건)>
- 라운드: <N>   ← 영속 카운터. 다음 라운드는 이 값 +1이며 상한은 3이다(세션 파일 수로 세지 않는다 — 라운드가 끝나면 그 파일이 삭제된다). 판정이 `미완`이면 올리지 않는다
     본 섹션은 매 라운드 **덮어쓴다**(최신 1블록 유지). 라운드별 상세는 세션 파일(ephemeral)과 3원장 기록이 갖는다.
- 확인한 시나리오: <M건 (안내 K건 + 자유 탐색 L건)>
- 피드백 라우팅: <결함 N건 → QA_FINDINGS / 계약 변경 M건 → DECISION_REGISTER(다음 M) / 개선 K건 → IMPROVEMENT_GUIDE>
- 미해소 이관: <있으면 다음 마일스톤 후보 목록, 없으면 "없음">
**판정 기준은 섹션의 *존재*가 아니라 `- 수용일:` 줄의 *채움*이다** — `## 10`과 동형. task 스코프(`--task`) 실행은 본 섹션을 쓰지 않는다. -->
```

**커밋**: `docs(templates): add AC modality, acceptance receipt, and open snapshot fields`

---

## Phase 6 — inner-loop skill 수정 (AC modality 배선)

### 6-1. `.claude/skills/plan-workitem/SKILL.md` — modality authoring

`3-U. 외부 경계 표시 + 미실측 외부 사실 authoring` 블록 **다음**에 새 블록을 삽입한다.

> 단계 이름은 **`3-W`** 를 쓴다. `3-V`는 `/stabilize-milestone` §3-V(경험 게이트)로 ADR-056·ADR-066 본문이 이미 인용하는 이름이라 충돌한다.

```markdown
3-W. **AC 검증 modality 지정 (ADR-065 D1)**:
   - 분해한 각 task의 `## 6-1`에 **AC마다 `[modality]`를 지정한다** — `[자동 테스트]` / `[산출물 검사]` / `[사용자 관측]` / `[플랫폼 관측]`. 형식은 TASK_TEMPLATE `## 6-1` 주석이 SSOT다.
   - **기본은 `[자동 테스트]`다.** 다른 modality는 자동 테스트가 원리적으로 불가능할 때만 쓰고, 그 사유를 그 줄 끝에 괄호로 한 줄 적는다(예: `(외부 스케줄러 발화 — 로컬 재현 불가)`).
   - **`[산출물 검사]`를 지정하면 그 검사 수단을 통합 `validate`에 묶는 것까지 계획한다** — 필요하면 `## 3. 구현 항목`에 그 배선 단계를 line item으로 넣는다. 묶이지 않은 검사 수단은 충족 근거가 아니어서 `/validate-workitem`이 `P1 [Artifact-check-unbound]`로 그 AC를 미충족 처리한다(ADR-065 D1).
   - `[사용자 관측]`·`[플랫폼 관측]`을 지정한 AC가 1개 이상이면 마지막 출력의 "남은 미결정 사항"에 `- 사용자 확인 필요 AC: <task-id>:AC-N (<modality>)`로 surface한다 — 그 AC는 **구현 후 `/validate-workitem` 뒤·`finalize` 전에 `/accept-milestone --task <task-id>`(또는 사용자 직접 기재)로 receipt가 발급돼야** 충족된다(ADR-066 D1).
   - **커밋·배포 이후에만 관측 가능한 사실은 이 task의 AC로 두지 않는다 (ADR-065 D1 경계)** — CI 실행·배포 후 동작·실제 스케줄 발화가 그 예다. finalize 전에 관측할 수 없어 어떤 modality로도 충족되지 않으므로, **후속 verification task의 AC로 분리**하고 그 task를 `## 9. 의존성`으로 선행 task에 건다.
   - `[미관측]`은 지정하지 않는다. 어떤 modality도 정할 수 없으면 그 AC는 아직 검증 가능한 형태가 아니므로 **AC 문안을 관측 가능하게 다시 쓰거나** task를 쪼갠다(측정 가능 AC 규율 — ADR-026).
   - `Type: research-spike`는 **구조 사실**(노트 파일 존재·필수 섹션 존재)을 `[산출물 검사]`로, **내용 판단**(권고가 타당한가)을 `[사용자 관측]`으로 나눠 지정한다(산출은 리서치 노트 — ADR-040 / 분리 근거 — ADR-065 D1). `## 6-2. TDD opt-out`을 채우는 것과 무관하게 modality는 지정한다(opt-out은 Red-first 면제일 뿐 — ADR-065 D2).
```

### 6-2. `.claude/agents/validator.md` — 축 1 판정 규칙

**기존** (`규칙:` 목록의 AC 매핑 줄):
```markdown
- AC 항목과 실제 테스트가 1:1 또는 다대일로 매핑되는지 점검한다. 미매핑 항목은 report에 명시한다(정책: ADR-009).
```

**수정**:
```markdown
- **AC 충족 판정 (ADR-065 D1)**: AC마다 `## 6-1`의 `[modality]`를 읽고 그 modality가 요구하는 증거가 실재하는지 점검한다. 미충족 항목은 partial verdict에 전수 명시한다.
  - `[자동 테스트]` — 대응 테스트 실재(1:1 또는 다대일).
  - `[산출물 검사]` — `## 6-1`에 기록된 검사 수단이 **통합 `validate`에 묶여 있고 그 실행이 통과**했는가(1단계에서 수집한 결과로 판정 — 검사 명령을 여기서 실행하지 않는다). 묶이지 않은 검사 수단은 충족 근거가 아니다 → `P1 [Artifact-check-unbound] AC-N` + 그 AC 미충족.
  - `[사용자 관측]`·`[플랫폼 관측]` — task `## 8`에서 **그 AC의 마지막 이벤트가 `- ac-acceptance`** 인가(ADR-065 D3 판독 규칙 2 — 두 이벤트가 여러 번 나올 수 있으므로 *문서 순서상 마지막* 이 현재 상태다. 마지막이 `- invalidated`면 미충족). **HTML 주석 밖의 줄만 센다.**
  - **표기 없음** — `[자동 테스트]`로 간주해 판정한다(legacy 호환). 대응 테스트가 있으면 충족, 없으면 결과 라벨 `미관측`으로 미충족. 표기 부재 자체는 `P2 [Modality-missing] AC-N` 기록 등급이며 그것만으로 미충족을 만들지 않는다.
  - `## 6-2. TDD opt-out`은 충족의 예외가 아니다(ADR-065 D2).
- **두 수치 반환 (ADR-065 D4)**: 축 1 partial에 `충족률 = 충족/전체`와 `자동화율 = ([자동 테스트]+[산출물 검사] 충족)/전체`를 각각 계산해 반환한다. `VC-N`은 두 수치의 분자·분모에 넣지 않는다.
- **`- ac-acceptance` 줄을 직접 쓰지 않는다** — 사용자 authority 산출물이다(ADR-065 D1/D3).
```

### 6-3. `.claude/skills/validate-workitem/SKILL.md` — 판정 기준

**기존** (실제 파일은 아래 한 줄이며 **뒤에 diff-trace 문장이 더 있다** — 그 문장을 잃지 않도록 전문을 옮긴다):
```markdown
- AC ↔ 테스트 매핑 — task 문서의 AC-N마다 대응하는 테스트가 존재하는가(자연어 매칭 휴리스틱 또는 테스트 이름의 `AC_N` 식별자 매칭). **`## 6-1`의 `VC-N` 행은 AC 행동으로 귀속되지 않는 판정력 확인용(positive control 등)이므로 본 매핑의 분자·분모 어디에도 넣지 않는다 (ADR-064 D2)** — 커버리지 %가 아래 confidence ladder의 입력이라 섞이면 등급이 이동한다. 대신 `VC-N`이 가리키는 테스트 줄은 diff trace audit에서 *추적 가능*으로 분류한다(추적 근거는 `AC-N | 명시 요청 | VC-N` 셋이다 — ADR-006#amend-1 문구의 해석 확장).
```

**수정** (앞부분만 바꾸고 `VC-N`·diff-trace 문장은 **그대로 보존**한다):
```markdown
- AC ↔ 검증 매핑 (ADR-065 D1) — task `## 6-1`의 AC마다 `[modality]`를 읽고 그 modality가 요구하는 증거가 실재하는지 판정한다: `[자동 테스트]`=대응 테스트 실재(자연어 매칭 휴리스틱 또는 `AC_N` 식별자 매칭), `[산출물 검사]`=`## 6-1`에 기록된 검사 수단이 **통합 `validate`에 묶여 있고 그 실행이 통과**했는가(1단계에서 수집한 결과로 판정 — 검사 명령을 여기서 실행하지 않는다). 묶이지 않은 검사 수단은 충족 근거가 아니며 `P1 [Artifact-check-unbound] AC-N`으로 기록하고 그 AC는 미충족, `[사용자 관측]`·`[플랫폼 관측]`=task `## 8`에서 **그 AC의 마지막 이벤트가 `- ac-acceptance`**(ADR-065 D3 판독 규칙 2 — 마지막이 `- invalidated`면 미충족. HTML 주석 밖의 줄만 센다). **modality 표기가 없으면 `[자동 테스트]`로 간주해 판정한다(legacy 호환 — 아래 둘째 불릿)**. `## 6-2. TDD opt-out`은 충족의 예외가 아니다(ADR-065 D2 — 이 예외를 두면 `## 6-2` 두 줄로 AC 게이트가 사라진다). **`## 6-1`의 `VC-N` 행은 AC 행동으로 귀속되지 않는 판정력 확인용(positive control 등)이므로 본 매핑의 분자·분모 어디에도 넣지 않는다 (ADR-064 D2)** — 자동화율이 아래 confidence ladder의 입력이라 섞이면 등급이 이동한다. 대신 `VC-N`이 가리키는 테스트 줄은 diff trace audit에서 *추적 가능*으로 분류한다(추적 근거는 `AC-N | 명시 요청 | VC-N` 셋이다 — ADR-006#amend-1 문구의 해석 확장).
- **modality 표기 부재 (ADR-065 D1 legacy 규칙)**: 표기가 없는 AC는 **`[자동 테스트]`로 간주**한다(기존 fork 호환 — 판정이 현행과 동일해진다). 그 AC에 대응 테스트가 없으면 기존과 같이 미충족이다. 표기 부재 자체는 `P2 [Modality-missing] AC-N`으로 기록만 한다(차단 X).
- **두 수치 (ADR-065 D4)**: `충족률`(전 modality)과 `자동화율`(`[자동 테스트]`+`[산출물 검사]`)을 따로 계산해 report에 적는다. **confidence ladder의 입력은 자동화율이다** — 사람·플랫폼 관측이 많은 task가 자동으로 High가 되지 않게 한다.
```

### 6-4. 같은 파일 — 집계 규칙

> ⚠ 실제 파일의 그 줄은 위 문장 **뒤에 ` 그 외 P1/P2만 있으면 Pass(라벨은 report에 전수 기록).` 가 이어진다.** 아래 「기존」은 앞부분만 옮긴 것이므로 **줄 전체를 통째로 바꾸지 말고 앞부분만 교체**한다(6-3과 같은 함정).

**기존** (줄 앞부분만):
```markdown
- **Needs Fix 트리거**: 어느 한 축이라도 P0 finding이 있거나, AC↔테스트 매핑에 ❌ AC가 하나라도 있거나, 통합 검증 명령이 exit≠0이면 → **Needs Fix**(통합 명령 부재 스택은 해당 없음).
```

**수정**:
```markdown
- **Needs Fix 트리거**: 어느 한 축이라도 P0 finding이 있거나, AC↔검증 매핑에 미충족 AC가 하나라도 있거나(`미관측` 포함), 통합 검증 명령이 exit≠0이면 → **Needs Fix**(통합 명령 부재 스택은 해당 없음).
```

### 6-5. 같은 파일 — report 양식 3곳

**(a) `## AC ↔ 테스트 매핑` 섹션 전체 교체**

**기존**:
```markdown
## AC ↔ 테스트 매핑
- AC-1: ✅ tests/foo.spec.ts > test_AC_1_xxx
- AC-2: ❌ (테스트 없음)
- AC-3: ✅ tests/bar.spec.ts > test_AC_3_xxx
```

**수정**:
```markdown
## AC ↔ 검증 매핑 (ADR-065)
- AC-1: ✅ [자동 테스트] tests/foo.spec.ts > test_AC_1_xxx
- AC-2: ✅ [산출물 검사] validate 통과 — insights 노트 필수 섹션 3개 검사(`scripts/verify` 내 docs 검사 단계)
- AC-3: ✅ [사용자 관측] ac-acceptance 2026-08-09 / authority: 사용자 / 환경: Chrome 128·로컬
- AC-4: ✅ [플랫폼 관측] ac-acceptance 2026-08-09 / authority: 사용자 / source: GH Actions run 12345
- AC-5: ❌ [미관측] 표기 없음 → 자동 테스트 간주(legacy) — 대응 테스트 없음. `P2 [Modality-missing] AC-5` 병기
- **충족률: 4/5 (80%) · 자동화율: 2/5 (40%)**
```

**(b) `## Evidence Bundle → ### 검증된 것` 안의 매핑 줄**

**기존**:
```markdown
- AC↔테스트 매핑: M개 ✅ / K개 ❌ (커버리지 %)
```

**수정**:
```markdown
- AC↔검증 매핑: 충족 M개 / 미충족 K개 — 충족률 <%> · 자동화율 <%> (modality별 내역은 `## AC ↔ 검증 매핑`)
```

**(c) confidence 기준 주석 — 입력을 자동화율로 바꾼다**

**기존**:
```markdown
<!-- 기준 (정의 — 같은 입력에 같은 판정 보장. 평가 순서: Low → Medium → High 의 *첫 매치* 등급으로 확정):
     - Low (어느 하나라도 매치): 통합 명령 미통과, 또는 oracle gap 카테고리 미명시(누락 카테고리 ≥2), 또는 AC↔테스트 매핑 <70%, 또는 AC↔테스트 ❌ 있음
     - Medium: Low 조건 모두 불일치 + High 조건 중 1~2개 미달 (예: 매핑 70~89% / oracle gap 카테고리 1개 누락)
     - High: 통합 명령 통과 + AC↔테스트 매핑 ≥90% + diff trace audit 통과 + oracle gap 카테고리 모두 명시(해당없음 포함) -->
```

**수정**:
```markdown
<!-- 기준 (정의 — 같은 입력에 같은 판정 보장. 평가 순서: Low → Medium → High 의 *첫 매치* 등급으로 확정):
     - Low (어느 하나라도 매치): 통합 명령 미통과, 또는 oracle gap 카테고리 미명시(누락 카테고리 ≥2), 또는 **자동화율 <70%**, 또는 미충족 AC 있음
     - Medium: Low 조건 모두 불일치 + High 조건 중 1~2개 미달 (예: 자동화율 70~89% / oracle gap 카테고리 1개 누락)
     - High: 통합 명령 통과 + **자동화율 ≥90%** + diff trace audit 통과 + oracle gap 카테고리 모두 명시(해당없음 포함)
     자동화율(ADR-065 D4)을 쓰는 이유: 충족률로 계산하면 사람·플랫폼 관측만으로 채운 task가 High가 된다. -->
```

### 6-6. 같은 파일 — 축 목록 1번 이름

**기존**:
```markdown
       1. AC ↔ 테스트 매핑 (+ 테스트 선행 휴리스틱 + `[verify-placeholder]` / `[test-id-missing]`)
```

**수정**:
```markdown
       1. AC ↔ 검증 매핑 (modality별 증거 판정 — ADR-065 D1 + 테스트 선행 휴리스틱 + `[verify-placeholder]` / `[test-id-missing]` + 충족률·자동화율 산정)
```

### 6-7. `.claude/skills/finalize-workitem/SKILL.md` — opt-out 예외 제거

**기존** (`3. AC 미충족 점검` 블록):
```markdown
3. AC 미충족 점검 — 직전 `/validate-workitem`의 report(`docs/40-validation/reports/<task-id>.md`)에서 AC 매핑이 모두 ✅인지 확인한다.
   - report 파일이 없거나 stale(파일 mtime이 task 문서 또는 변경된 구현 파일보다 오래됨)하면 `/validate-workitem <task-id>` 선행을 안내하고 `Needs Validation`으로 종료한다(커밋하지 않음).
   - ❌가 하나라도 있으면 `Needs Fix`로 종료하고 `/repair-workitem <task-id>`를 안내한다.
   - opt-out 사유가 있는 task(task 문서 `## 6-2. TDD opt-out`이 채워진 경우)는 예외 — 출력에 opt-out 사유와 follow-up task ID를 명시한다.
```

**수정**:
```markdown
3. AC 미충족 점검 — 직전 `/validate-workitem`의 report(`docs/40-validation/reports/<task-id>.md`)의 `## AC ↔ 검증 매핑`이 모두 충족인지 확인한다.
   - report 파일이 없거나 stale(파일 mtime이 task 문서 또는 변경된 구현 파일보다 오래됨)하면 `/validate-workitem <task-id>` 선행을 안내하고 `Needs Validation`으로 종료한다(커밋하지 않음).
   - 미충족 AC가 하나라도 있으면 `Needs Fix`로 종료하고 `/repair-workitem <task-id>`를 안내한다. **`미관측`도 미충족이다.**
   - **`## 6-2. TDD opt-out`은 예외가 아니다 (ADR-065 D2)** — opt-out은 Red-first 절차의 면제이지 AC 충족의 면제가 아니다(ADR-009 `opt-out 절차`). opt-out task는 `[산출물 검사]` 등 다른 modality로 충족해야 통과한다. 단 **출력에는 opt-out 사유와 follow-up task ID를 명시한다**(ADR-009가 요구하는 "finalize 시점 사용자 확인").
   - **분기 우선순위 (반드시 이 순서로 판정한다)**: ① 미충족 AC 중 `[사용자 관측]`·`[플랫폼 관측]` receipt 대기가 **아닌** 것이 하나라도 있으면 → `Needs Fix` + `/repair-workitem <task-id>` 안내(코드로 고칠 것이 있으므로 이쪽이 우선이다). ② 미충족 AC가 **전부** receipt 대기면 → `Needs Acceptance: <AC-N 목록>`으로 종료하고 **`/accept-milestone --task <task-id>`**(task 스코프 — 라운드 상한·`## 11`을 소모하지 않는다, [ADR-066](../../../docs/90-decisions/boilerplate/ADR-066-milestone-acceptance.md) D1) 또는 사용자 직접 기재를 안내한다. **에이전트가 receipt를 대신 쓰지 않는다**(ADR-065 D1). ③ 미충족 0건이면 통과.
   - `Needs Acceptance`는 `Needs Fix`가 아니다 — `/repair-workitem`으로 보내면 고칠 코드가 없어 순환에 빠진다.
```

### 6-8. `.claude/skills/repair-workitem/SKILL.md` — receipt 무효화 + pattern-scan

**(a) 입구 가드 추가 — 순환 차단 (필수)**. `반드시 먼저 할 일:` 2번의 `- 파일이 \`Pass\`이면 …` 불릿 **다음**에 아래를 추가한다. 이것이 없으면 «관측 receipt 대기»·«감사 미완»으로 `Needs Fix`가 된 report가 이 skill로 들어와 고칠 코드가 없는 채 순환한다(ADR-065 배경이 지목한 그 순환).

```markdown
   - **실패 항목이 전부 «수정 대상 아님»이면 즉시 종료한다** — `## 실패 항목`의 항목이 모두 (i) `[사용자 관측]`·`[플랫폼 관측]` receipt 대기이거나 (ii) `[P0] 감사 미완(unavailable)`이면, 코드로 고칠 것이 없으므로 4-판정에 들어가지 않고 안내 후 종료한다(report를 삭제하지 않는다). 안내 문구: (i)이면 `/accept-milestone --task <task-id>` 또는 사용자 직접 receipt 기재(ADR-065 D1 — 에이전트 대행 발급 금지), (ii)이면 `/validate-workitem <task-id>` 재실행. **둘이 섞여 있고 그 외 실패 항목도 있으면** 이 가드에 걸리지 않고 정상 진행하되, 위 두 종류는 4-판정 대상에서 제외하고 그대로 남긴다.
```

**(b)** `2-E. 실행 증거 갱신` 블록 **다음**에 아래 두 블록을 추가한다.

> 라벨은 **`2-F`·`2-H`** 를 쓴다. `2-G`는 같은 파일 `반드시 먼저 할 일:`의 `2-G. 상태별 입구 게이트`가 이미 쓰고 있어 중복된다(6-1의 `3-V`→`3-W` 회피와 같은 이유). `2-E`→`2-F`→`2-H`로 한 글자 비는 것은 무해하다 — 그 목록은 이미 `2.`에서 `2-E`로 건너뛴다.

```markdown
2-F. **AC acceptance 무효화 (ADR-065 D3)**: 본 라운드의 Adopt/Adopt-modified 수정이 어떤 AC의 동작 경로를 건드렸고 그 AC의 modality가 `[사용자 관측]`·`[플랫폼 관측]`이면, task `## 8`에 `- invalidated <날짜> <AC-N>: repair-workitem 수정으로 재확인 필요` 한 줄을 append한다(기존 `- ac-acceptance` 줄은 지우지 않는다 — 이력이다). 그 AC는 다음 validate에서 미충족이 되고 receipt 재발급이 필요하다. **에이전트가 새 receipt를 쓰지 않는다.**

2-H. **동일 패턴 전수 검색 (ADR-047 D7 정합)**: Adopt/Adopt-modified한 각 결함에 대해 **같은 패턴의 다른 출현을 저장소 전체에서 읽기 전용으로 검색**한다(Grep). 결과를 task `## 8`에 `- pattern-scan <날짜> <패턴 1줄>: 범위 내 N건 수정 / 범위 밖 M건 <경로 목록>`으로 append하고 마지막 출력에도 한 줄 남긴다. **범위 밖 출현은 고치지 않는다**(task 범위 계약 유지 — 읽기는 범위 제한 대상이 아니다). 범위 밖 항목은 `/stabilize-milestone`·`/repair-milestone`이 회수한다. 검색으로 아무것도 안 나왔으면 `범위 밖 0건`으로 적는다(검색 사실 자체가 기록이다).
```

같은 파일 `마지막 출력:` 목록에 아래 두 줄을 추가한다.

```markdown
- AC acceptance 무효화 (ADR-065 D3): N건(AC-N 목록) / 해당없음
- 동일 패턴 전수 검색: 범위 내 N건 / 범위 밖 M건(경로) — 범위 밖은 미수정
```

### 6-8b. `implement-workitem` + `builder` modality 배선 (빠뜨리면 구현 층이 modality를 모른다)

현재 두 파일은 **모든 AC에 실패 테스트를 쓰고 모든 AC의 판정력을 검사**한다. `[사용자 관측]`·`[플랫폼 관측]` AC에는 성립하지 않으므로 분기를 넣는다.

**(a) `.claude/skills/implement-workitem/SKILL.md`** — `6-V. 검증 판정력 확인` 블록 첫 줄 다음에 아래를 추가한다.

```markdown
   - **modality 분기 (ADR-065 D1)**: `## 6-1`의 `[modality]`를 먼저 읽는다. **`[자동 테스트]`·`[산출물 검사]` AC만 RGR·판정력 확인(6-V) 대상**이다. `[사용자 관측]`·`[플랫폼 관측]` AC는 Red를 만들 수 없으므로 **6-V·6-R의 `verify-power` 대상에서 제외한다** — 그 AC에는 `- verify-power` 줄을 쓰지 않고, 대신 6-R 출력에 `- ac-pending <AC-N>: modality=<...> — 사용자 receipt 대기` 한 줄만 남긴다. 그 AC의 충족은 사용자 발급 `- ac-acceptance`가 담당하며 **foreman이 그 receipt를 쓰지 않는다.**
   - **`red=opt-out(...)`을 modality 사유로 쓰지 않는다** — ADR-064 D2의 `opt-out`은 *task `## 6-2`가 정당하게 채워졌거나 `Type: research-spike`* 인 경우로 정의돼 있다. modality를 그 값에 태우면 그 상태의 의미가 조용히 넓어진다. 상태 집합을 늘리지도, 기존 값을 전용하지도 않고 **대상에서 빼는** 것이 두 ADR을 모두 지키는 유일한 방법이다.
   - `[산출물 검사]` AC는 테스트 대신 **재현 가능한 검사 수단**(명령·스키마·파서·grep 패턴)을 만들어 **통합 `validate`에 묶고**, 그 수단과 결과를 `## 6-1` 그 AC 줄에 적는다. 묶지 않으면 validate가 그 AC를 미충족으로 판정한다(ADR-065 D1).
```

**(b) `.claude/skills/implement-workitem/SKILL.md` — 마지막 출력** 목록에 한 줄 추가한다.

```markdown
- 사용자 확인 대기 AC (ADR-065 D1): `[사용자 관측]`·`[플랫폼 관측]` AC-N 목록 — `/validate-workitem` 후 `/accept-milestone --task <task-id>`로 receipt 발급 필요 / 해당없음
```

**(c) `.claude/agents/builder.md`**

**기존**:
```markdown
- AC가 정의된 task는 Red → Green → Refactor 사이클로 진행한다. opt-out 사유가 task 문서에 있고 follow-up이 같이 적혀 있을 때만 테스트 작성을 건너뛴다(정책: [ADR-009](../../docs/90-decisions/boilerplate/ADR-009-tdd-default.md)).
```

**수정**:
```markdown
- AC가 정의된 task는 Red → Green → Refactor 사이클로 진행한다. opt-out 사유가 task 문서에 있고 follow-up이 같이 적혀 있을 때만 테스트 작성을 건너뛴다(정책: [ADR-009](../../docs/90-decisions/boilerplate/ADR-009-tdd-default.md)).
- **modality 분기 (ADR-065 D1)**: `## 6-1`에 `[사용자 관측]`·`[플랫폼 관측]`으로 표기된 AC는 **테스트를 작성하지 않는다**(Red가 성립하지 않는다) — 구현만 하고 반환에 "`<AC-N>`: modality=<...> — Red 불가, 사용자 receipt 대기"로 보고한다. `[산출물 검사]` AC는 테스트 대신 **재현 가능한 검사 수단**(명령·스키마·파서)을 만들어 **통합 `validate`에 묶고** 그 수단과 확인 결과를 반환에 적는다. 표기가 없는 AC는 `[자동 테스트]`로 간주한다(legacy 호환).
- **`- ac-acceptance` receipt를 쓰지 않는다** — 사용자 authority 산출물이다.
```

**(d) `.claude/skills/validate-workitem/SKILL.md` — 판정력 판정에서 관측 modality AC 제외**

**기존** (`- **판정력 판정** (ADR-064 D2/D7):` 줄 시작 부분):
```markdown
- **판정력 판정** (ADR-064 D2/D7): 각 AC에 대해 task `## 8`에 `- verify-power` 줄이 있고
```

**수정**:
```markdown
- **판정력 판정** (ADR-064 D2/D7): **`[사용자 관측]`·`[플랫폼 관측]` modality AC는 대상에서 제외한다**(Red가 성립하지 않으므로 `- verify-power` 줄이 없는 것이 정상 — ADR-065 D1). 나머지 각 AC에 대해 task `## 8`에 `- verify-power` 줄이 있고
```

같은 파일 report 양식의 `- verify-power:` 예시 줄 끝에 ` / AC-4 해당없음(사용자 관측)` 을 덧붙여 제외 표기를 보인다.

**(e) `.claude/skills/validate-workitem/SKILL.md` — report 양식의 `## 다음 권장 액션`**

**기존**:
```markdown
- Needs Fix: `/repair-workitem <task-id>` (메인 세션이 이어서 직접 발화하거나 사용자가 발화 — ADR-050)
```

**수정**:
```markdown
- Needs Fix: `/repair-workitem <task-id>` (메인 세션이 이어서 직접 발화하거나 사용자가 발화 — ADR-050)
- 미충족 AC가 전부 `[사용자 관측]`·`[플랫폼 관측]` receipt 대기: `/accept-milestone --task <task-id>` (task 스코프 — 라운드 상한·`## 11` 미소모, ADR-066 D1) 또는 사용자 직접 기재. **`/repair-workitem`으로 보내지 않는다**(고칠 코드가 없어 순환에 빠진다)
- `감사 미완(unavailable)` 축 있음: `/validate-workitem <task-id>` 재실행 (수정 대상 아님)
```

### 6-9. 용어 일괄 교체 (남은 파일 전수 — 빠뜨리면 Phase 13 검증이 실패한다)

report 섹션 이름이 `## AC ↔ 테스트 매핑` → `## AC ↔ 검증 매핑`으로 바뀌었으므로 그 이름을 참조하는 **모든 살아 있는 문서**를 함께 고친다.

먼저 대상을 확인한다.
```bash
grep -rn "AC ↔ 테스트 매핑\|AC↔테스트\|AC 매핑 100%" --include="*.md" . | grep -v IMPROVE-GUIDE
```

> 첫 대안을 `AC ↔ 테스트`가 아니라 **`AC ↔ 테스트 매핑`** 으로 좁힌 이유: 본 교체의 대상은 *report 섹션 이름*이다. 공백 있는 `AC ↔ 테스트`로 넓게 잡으면 **`ADR-047` D6의 `양식 SSOT: … ADR-009 (AC ↔ 테스트 식별자)`** 가 함께 걸리는데, 그 괄호는 ADR-009#amend-1의 *테스트 이름 `AC_N` 식별자 컨벤션*(섹션 이름이 아니다)을 가리키므로 **대상이 아니다**. 공백 없는 `AC↔테스트` 대안이 축 이름 잔존을 그대로 잡으므로 검출력 손실은 0이다(실측: 좁힌 뒤 빠지는 줄은 그 한 줄뿐).

**교체 규칙**: `AC ↔ 테스트 매핑`·`AC↔테스트 매핑` → `AC ↔ 검증 매핑`·`AC↔검증 매핑` / `AC 매핑 100%` → `AC 충족 100%` / 축 이름 `AC↔테스트` → `AC↔검증`.

**예외 (고치지 않는다)**:
- `.boilerplate/validation/SIMULATION_RUN.md` — 과거 라운드 실측 기록. Phase 3-C에서 이미 "기록 당시 기준" 주를 달았다.
- `docs/90-decisions/boilerplate/ADR-014-milestone-graduation.md` — superseded. 이력 보존.
- `docs/90-decisions/boilerplate/ADR-065-ac-verification-contract.md` — `## 배경`이 *"무엇이 바뀌었는가"* 를 설명하려고 구 섹션명을 의도적으로 인용한다. 고치면 배경이 자기 근거를 잃는다.
- **`docs/90-decisions/boilerplate/ADR-047-code-as-agent-harness.md`의 D6 `양식 SSOT` 문장** — `ADR-009 (AC ↔ 테스트 식별자)`의 괄호는 ADR-009#amend-1의 *테스트 이름 `AC_N`·`[AC-N]` 식별자 컨벤션*을 가리킨다. 그 컨벤션은 테스트 이름 전용이며 본 라운드에서 바뀌지 않았다 — `검증 식별자`라는 컨벤션은 존재하지 않으므로 고치면 없는 규약을 가리킨다. **이 파일에서 고치는 것은 D1 Executability 문장 하나뿐이다.**
- **`.claude/skills/stabilize-milestone/SKILL.md`의 §1.5 item 4 줄과 단계 8 회고 책임 경계 줄** — 이 두 줄은 **Phase 7-4·7-5가 통째로 교체**한다. 여기서 부분 치환하면 Phase 7의 「기존」 블록이 매칭되지 않는다. **grep 결과에 나와도 건너뛴다**(단계 7-T Telemetry 줄만 여기서 고친다).

**파일별 지시** (6-3~6-6에서 이미 고친 줄은 건너뛴다):

| 파일 | 위치 | 교체 |
|---|---|---|
| `.claude/agents/validator.md` | 호출 계약의 축 예시 | `"AC↔테스트 매핑만"` → `"AC↔검증 매핑만"` |
| `.claude/skills/implement-workitem/SKILL.md` | `VC-N` 등재 단락 | 그 단락이 `AC ↔ 테스트 매핑` 집계를 언급하면 `AC ↔ 검증 매핑`으로 |
| `.claude/skills/validate-workitem/SKILL.md` | 축 조건부 spawn 문장 / 집계 규칙 confidence 입력 문장 / `## Orchestration` spawn 예시 | 남은 `AC↔테스트` 전부 `AC↔검증`으로. confidence 입력 문장은 `AC↔테스트 매핑 %` → `자동화율` |
| `.claude/skills/validate-workitem/SKILL.md` | `- 본 판정의 신뢰도:` 줄의 근거 **예시** 문구 | `"통합 명령 + AC 매핑 100% + diff trace 통과 …"` → `"통합 명령 + 자동화율 100% + diff trace 통과 …"` |
| `.claude/skills/validate-workitem/SKILL.md` | report 양식 `## 실행 증거 · 판정력` 안의 `- VC-N:` 줄 | `(AC 매핑 % 집계 제외)` → `(충족률·자동화율 집계 제외)` — **이 줄은 아래 grep 패턴에 걸리지 않으니 눈으로 찾아 고친다** |
| `.claude/skills/stabilize-milestone/SKILL.md` | 단계 7-T 집계 항목 + Telemetry 출력 예시 | `- AC↔테스트 매핑: A ✅ / B total (A/B %)` → `- AC↔검증 매핑: 충족 A / 전체 B — 충족률 <%> · 자동화율 <%>` (예시 블록도 같은 형식으로) |
| `docs/00-meta/DELEGATION_STRATEGY.md` | 위임 트리거 표 validator 행 | `AC ↔ 테스트 매핑` → `AC ↔ 검증 매핑(modality별 증거 판정 — ADR-065)` |
| `docs/30-workitems/_templates/TASK_TEMPLATE.md` | `## 6-1` 주석의 `VC-N` 문장 | `` `## AC ↔ 테스트 매핑` 커버리지 % `` → `` `## AC ↔ 검증 매핑`의 충족률·자동화율 `` |
| `docs/90-decisions/boilerplate/ADR-009-tdd-default.md` | `검증 흐름:` 첫 줄 · `## 결과` validator 줄 · `## Surfaces` validate-workitem 줄 | 3곳 모두 `AC ↔ 검증 매핑`으로. (Phase 4가 이 파일을 이미 열었으므로 거기서 함께 처리했다면 건너뛴다) |
| `docs/90-decisions/boilerplate/ADR-047-code-as-agent-harness.md` | D1 Executability 문장 **한 곳만** (D6 `양식 SSOT` 문장은 위 예외 — 고치지 않는다) | `AC↔테스트 매핑` → `AC↔검증 매핑` |
| `docs/90-decisions/boilerplate/ADR-051-main-session-orchestration-and-wave-removal.md` | D2 축 목록 | `AC↔테스트` → `AC↔검증` |
| `docs/90-decisions/boilerplate/ADR-061-decision-backed-interface-gate.md` | 해당 인용(있으면) | 같은 규칙 |
| `docs/90-decisions/boilerplate/ADR-063-verification-harness-integrity.md` | D1 "프로젝트 빈 케이스" 단락의 `item 4 AC 매핑 100%` | `item 4 AC 충족 100%` |
| `docs/90-decisions/boilerplate/ADR-064-task-layer-evidence-contract.md` | D2 `VC-N` 집계 제외 문장 · D3 위치 근거 문장 · Mutation Contract Target | `AC ↔ 테스트 매핑` → `AC ↔ 검증 매핑` |

> 이 교체는 **섹션 이름 참조의 정합**이며 각 ADR의 결정 내용을 바꾸지 않는다(용어 동기화라 amend 대상이 아니다).

**커밋**: `feat(inner-loop): wire AC verification modality through plan/implement/validate/finalize/repair`

---

## Phase 7 — 감사 미완(unavailable) 회수 규율

근거는 둘로 나뉜다. **기록 규율**(재개→재위임→직접 감사→`감사 미완(unavailable)` 기록)은 이미 존재한다 — `docs/00-meta/DELEGATION_STRATEGY.md`의 위임 규율 + ADR-051#amend-4 결정 2. 그런데 그 규율에는 **차단 결과가 없다**(기록까지만). 이 Phase가 넣는 "미완이면 통과 불가"의 근거는 **Phase 3에서 작성한 ADR-067 D3의 평가 규칙**(*"미실행 감사가 입력을 주는 predicate는 충족으로 단정할 수 없다"* + validate 층 적용 문장)이다. 따라서 이 Phase는 **ADR-051 본문을 고치지 않고**(그 ADR의 재발행 약속을 발화시키지 않는다) 두 근거를 skill 본문에 전파한다.

### 7-1. `.claude/skills/validate-workitem/SKILL.md` — 회수 규율 + 라벨

0단계의 `**Codex: 서브에이전트는 GA이나 …**` 줄 **앞**에 아래를 삽입한다.

```markdown
     - **축 미반환 회수 규율 (ADR-051#amend-4 결정 2)**: 위임한 validator가 구조화 partial verdict 없이 멈추면 ① 1회 재개(같은 축·같은 형식 명세로 재요청, 이미 확립한 finding 전량 포함을 명시) → ② 그래도 미반환이면 다른 validator에 재위임 → ③ 그래도 불가하면 메인이 그 축을 직접 감사 → ④ 그래도 불가하면 **`감사 미완(unavailable): <축>`으로 기록한다.** "결과 없음"을 조용히 통과시키지 않는다.
     - **④에 도달한 축이 하나라도 있으면 `Pass`를 낼 수 없다** (근거: ADR-067 D3 평가 규칙 — 미실행 감사가 입력을 주는 판정을 충족으로 단정하지 않는다). report `## 실패 항목`에 `[P0] 감사 미완(unavailable): <축> — 재검증 필요(수정 대상 아님)`을 적고 combined verdict는 `Needs Fix`로 낸다. 단 **후속 라우팅은 `/repair-workitem`이 아니라 `/validate-workitem` 재실행**이다(고칠 코드가 없다) — report `## 다음 권장 액션`에 그렇게 적고 자동 후속 호출을 하지 않는다(`[Spec-gap]`의 사용자 보고 라우팅과 동형). 이 축의 존재는 `## Orchestration`에도 남으므로 졸업 item 4 (c)가 그 값을 읽는다.
```

### 7-2. 같은 파일 — `## Orchestration` 양식에 필드 추가

> ⚠ **Phase 6-9 적용 후 상태로 매칭한다** — 6-9가 이 블록의 `spawn된 축` 예시를 이미 `1 AC↔검증`으로 바꿨다. 아래 「기존」은 6-9 이전 원문이므로 실제 파일에서는 그 줄이 `<번호·이름 목록 (예: 1 AC↔검증, 2 diff-trace, 7 Evidence)>`로 되어 있다. **여기서 하는 일은 가운데 두 줄을 새로 넣는 것뿐**이다.

**기존** (6-9 이전 원문):
```markdown
- 모드: fan-out N축 | inline fallback | Codex 순차 degrade
- spawn된 축: <번호·이름 목록 (예: 1 AC↔테스트, 2 diff-trace, 7 Evidence)>
- skip된 축: <축 — 사유 (신호 없음 / 해당없음)>
```

**수정**:
```markdown
- 모드: fan-out N축 | inline fallback | Codex 순차 degrade
- spawn된 축: <번호·이름 목록 (예: 1 AC↔검증, 2 diff-trace, 7 Evidence)>
- 회수된 축: <번호 목록> / 재개 1회로 회수: <번호 목록 또는 없음>
- 감사 미완(unavailable): <축 — 4단계 회수 전부 실패 사유 / 없음>  ← 1건 이상이면 판정은 Pass 불가
- skip된 축: <축 — 사유 (신호 없음 / 해당없음)>
```

### 7-3. `.claude/skills/stabilize-milestone/SKILL.md` — 단계 4·5에 회수 규율

**단계 4**(병렬 qa verifier 팬아웃)의 `- **위임 시 ADR-046#d3 적용 …**` 줄 다음에 추가한다.

```markdown
   - **축 미반환 회수 규율 (ADR-051#amend-4 결정 2)**: qa 단위가 구조화 반환 없이 멈추면 ① 1회 재개(같은 단위·같은 형식, 이미 확립한 finding 전량 포함 명시) → ② 다른 qa에 재위임 → ③ 메인이 그 단위를 직접 감사 → ④ 그래도 불가하면 **`QA_FINDINGS.md`의 본 마일스톤 `### P0`에 `- **M<N>-audit-<K>** | P0 | [관측됨] | linked: M<N> | status: open` + 하위 줄 `- 감사 미완(unavailable): <단위> — <4단계 실패 사유>`를 등재하고**, 단계 8의 graduation을 `BLOCKED (audit incomplete: <단위>)`로 기록한다(ADR-067 D3). **qa 팬아웃은 졸업 predicate ⑤의 유일한 입력이므로, 돌지 않은 감사를 근거로 "P0 0건"을 단정하지 않는다.**
   - 다음 라운드에서 그 단위의 감사가 성공하면 본 skill이 그 `M<N>-audit-<K>` 항목의 `status: open`을 `resolved`로 갱신한다(**본 skill이 자기가 만든 감사-미완 항목에 한해 status를 닫는 유일한 예외** — 그 밖의 finding status는 `/repair-milestone`·`/repair-acceptance` 소유).
```

**단계 5**(병렬 reviewer verifier 팬아웃)의 마지막 줄 다음에 추가한다.

```markdown
   - **축 미반환 회수 규율**: 단계 4와 같은 4단계를 밟는다. 단 ④에 도달해도 **판정을 바꾸지 않는다** — reviewer 결과는 졸업 predicate 입력이 아니다(report-only). `IMPROVEMENT_GUIDE.md`에 `P2 [Audit-unavailable] reviewer:<단위> — 감사 미완`을 기록하고 단계 8 출력에 사유를 echo한다. 미반환을 P0로 올리면 "결과 없음"이 "결과 있음"(정상 반환한 P1 부채는 졸업을 막지 않는다)보다 강해지는 역전이 생긴다.
```

### 7-4. 같은 파일 — §1.5 item 4 predicate + report 부재 안내

**기존**:
```markdown
- `AC 매핑 100%` → 본 milestone의 모든 task의 최신 `docs/40-validation/reports/<task-id>.md` `## AC ↔ 테스트 매핑` 섹션 항목이 모두 `✅`. report 부재 task는 미충족 처리.
```

**수정**:
```markdown
- `AC 충족 100% + report 유효` → 본 milestone의 **모든 task**의 최신 `docs/40-validation/reports/<task-id>.md`가 아래 넷을 **모두** 만족(ADR-067 D1 item 4):
  - (a) `## AC ↔ 검증 매핑` 전 항목 충족. 판정 기준은 [ADR-065](../../../docs/90-decisions/boilerplate/ADR-065-ac-verification-contract.md) D1 modality — `미관측`은 미충족, 표기 부재는 `[자동 테스트]` 간주(legacy), **`## 6-2. TDD opt-out`은 예외가 아니다**(ADR-065 D2).
  - (b) report `- 판정:` 값이 `Pass`. (AC 행만 읽으면 다른 축의 미해소 P0가 통과한다.)
  - (c) `## Orchestration`의 `감사 미완(unavailable)` 항목이 없음.
  - (d) **report가 stale하지 않음** — report mtime이 그 task `## 4-1` 등재 **구현 파일**들의 최신 mtime보다 오래되지 않음(같으면 통과). **task 문서는 비교 대상이 아니다** — `/finalize-workitem`이 stale 검사 뒤에 status를 쓰므로 넣으면 정상 마감된 전 task가 미충족이 된다(ADR-067 D1 item 4 (d) 주). stale이면 미충족 + 처방은 **그 task `/validate-workitem` 재실행**. `## 4-1` 밖 cross-cutting 수정은 `/repair-milestone`의 report 삭제가 담당한다.
  - report 부재 task는 미충족 — **새 체크아웃·다른 worktree가 이에 해당하므로, 그때는 각 task의 `/validate-workitem`을 먼저 재실행해 report를 만든 뒤 본 skill을 다시 돌리도록 안내한다**(report는 gitignore된 checkout-local ephemeral — 설계상 정상이며 결함이 아니다).
```

### 7-5. 같은 파일 — 단계 8 회고 책임 경계

> ⚠ **Phase 3-C 적용 후 상태로 매칭한다** — 3-C ⑦이 이 줄의 `ADR-014`를 이미 `ADR-067 D3`으로 바꿨다. 아래 「기존」의 `ADR-057#amend-1·ADR-014` 부분은 실제 파일에서 `ADR-057#amend-1·ADR-067 D3`으로 되어 있다.

**기존** (`책임 경계:` 두 번째 항목 — 3-C 이전 원문):
```markdown
- 누적 문서 갱신 + milestone `## 8. 회고` 자동 채움 — **회고의 `graduation:` 줄은 단계 4~6 종료 후 graduation 5+1 기준 *전체를 최종 상태로 재판정*해 기록**(P0 기준은 `QA_FINDINGS.md`의 미해소 P0만 — qa 팬아웃分; reviewer는 report-only로 미반영)(task status·통합 validate·e2e·AC 매핑 100% = 단계 3 결과 + P0 0건 = 단계 4~6 반영 + 추가 기준; YES|NO|BLOCKED+날짜; §1.5 사전점검이 아니라 여기서 확정 — ADR-057#amend-1·ADR-014). 로드맵 파일은 안 건드린다(다음 plan-milestone R0가 이 줄을 읽어 재조정).
```

**수정**:
```markdown
- 누적 문서 갱신 + milestone `## 8. 회고` 자동 채움 — **회고의 `graduation:` 줄은 단계 4~6 종료 후 graduation 5+1 기준 *전체를 최종 상태로 재판정*해 기록**(P0 기준은 `QA_FINDINGS.md`의 미해소 P0만 — qa 팬아웃分; reviewer는 report-only로 미반영)(task status·통합 validate·e2e·AC 충족 100% = 단계 3 결과 + P0 0건 = 단계 4~6 반영 + 추가 기준; YES|NO|BLOCKED+날짜; §1.5 사전점검이 아니라 여기서 확정 — ADR-057#amend-1·ADR-067 D3). **감사 미완이 있으면 `BLOCKED (audit incomplete: <단위>)`로 기록하며, 이 값은 이전 라운드에 기록된 `YES`를 덮어쓴다**(줄을 쓰지 않으면 낡은 `YES`가 남아 하류가 졸업으로 읽는다). host 제약 e2e target의 처리는 본 라운드에서 바꾸지 않는다 — 기존대로 ADR-052#amend-1·ADR-059 D4(같은 커밋 registry 증거 또는 `BLOCKED_ENV`)를 따른다. 회고의 `open 항목 스냅샷:` 줄도 여기서 채운다 — `QA_FINDINGS` 미해소 N / `IMPROVEMENT_GUIDE` 미해소 M / 이전 M carry-over K(ADR-067 D2). 로드맵 파일은 안 건드린다(다음 plan-milestone R0가 이 줄을 읽어 재조정).
```

**커밋**: `feat(validate,stabilize): forbid silent pass on unavailable audit axes`

---

## Phase 8 — 신규 skill 2개 + wrapper + .gitignore

### 8-1. `.gitignore` — acceptance-reviews 패턴

**기존**:
```
# stabilize-reviews (ephemeral) — ADR-054
docs/40-validation/stabilize-reviews/*.md
!docs/40-validation/stabilize-reviews/.gitkeep
```

**수정** — 그 블록 다음에 추가한다.
```
# acceptance-reviews (ephemeral) — ADR-066 D3
docs/40-validation/acceptance-reviews/*.md
!docs/40-validation/acceptance-reviews/.gitkeep
```

그리고 빈 디렉터리와 `.gitkeep`을 만든다.
```bash
mkdir -p docs/40-validation/acceptance-reviews && touch docs/40-validation/acceptance-reviews/.gitkeep
```

### 8-2. `.claude/skills/accept-milestone/SKILL.md` 생성

```markdown
---
name: accept-milestone
description: 마일스톤 결과를 사람이 직접 실행·확인하는 수용 단계. 환경을 띄우고 시나리오를 안내하고 피드백을 3갈래로 라우팅한다. 코드 수정·커밋 없음 (ADR-066).
argument-hint: "<milestone-id> | --task <task-id>"
disable-model-invocation: true
allowed-tools: Read Glob Grep Write Edit Bash
---

이 skill은 **사람이 직접 확인하는 단계**다. 마일스톤 스코프는 `/stabilize-milestone`(AI 검증) 뒤에, task 스코프(`--task`)는 `/validate-workitem` 뒤·`/finalize-workitem` 앞에 실행한다.
**코드를 수정하지 않고 커밋하지 않으며 workitem status를 바꾸지 않는다.** 정상 write 대상은 넷이며, **task 스코프는 그중 4번과 — 계약 변경을 발견한 경우에 한해 — 2번의 `DECISION_REGISTER.md`만 쓴다**(아래 task 스코프 흐름 3(b)·5).

1. `docs/40-validation/acceptance-reviews/<M>.r<N>.md` — 본 라운드 세션 원본(gitignore ephemeral)
2. `docs/40-validation/QA_FINDINGS.md` / `docs/10-charter/DECISION_REGISTER.md` / `docs/40-validation/IMPROVEMENT_GUIDE.md` — 피드백 3갈래 라우팅 (ADR-066 D2)
3. 마일스톤 문서 `## 11. 수용 기록` — 수용 판정 receipt
4. 해당 task `## 8` — `사용자 관측`·`플랫폼 관측` AC의 `- ac-acceptance` 줄 (사용자 응답을 그대로 옮겨 적는다 — ADR-065 D3)

**마일스톤 스코프 라운드는 졸업 필수 조건이 아니다**(권장 — ADR-067 D6). 졸업 판정은 `/stabilize-milestone`이 소유한다. 단 **task 스코프는 «권장»이 아니다** — `[사용자 관측]`·`[플랫폼 관측]` AC를 쓴 task는 receipt 없이 `finalize`되지 않으므로, 그 receipt를 사용자가 직접 기재하지 않는 한 이 경로를 거쳐야 한다(ADR-065 D1).

입력 — **스코프 2종 (ADR-066 D1)**:
- **마일스톤 스코프**: `$ARGUMENTS` = milestone id. **`M[0-9]+` 패턴만 허용**(미일치 즉시 종료).
- **task 스코프**: `$ARGUMENTS` = `--task <task-id>`. **`T-[0-9]+` 패턴만 허용.** `/validate-workitem`이 그 task의 `[사용자 관측]`·`[플랫폼 관측]` AC를 미충족으로 냈을 때(= `finalize` 전) 호출된다.
- **라운드 번호는 마일스톤 문서 `## 11. 수용 기록`의 `- 라운드:` 값 + 1이다.** 세션 파일 수로 세지 않는다 — 그 파일은 라운드가 끝나면 삭제되므로(승인 시 본 skill, 보류 시 `/repair-acceptance`) 상한이 무력화된다. `## 11`이 비어 있으면 1회차다. **상한 3** — 4회차 진입 시 남은 항목을 다음 마일스톤으로 이관할지 사용자에게 확인하고 종료한다. **task 스코프는 이 카운터를 읽지도 쓰지도 않는다.**

## task 스코프 흐름 (`--task <task-id>` — 라운드 카운터·`## 11` 미사용)
1. 그 task의 `## 6-1`에서 `[사용자 관측]`·`[플랫폼 관측]` AC를 회수하고, `## 8`의 기존 `- ac-acceptance`/`- invalidated` 이벤트로 **AC별 현재 상태**를 판정한다(마지막 이벤트가 현재 상태 — ADR-065 D3).
2. 미충족인 그 AC들만 대상으로 **R1(환경 기동) → R2(안내된 확인) → R4(구조화)** 를 수행한다. **R3 자유 탐색·R5 3갈래 라우팅은 하지 않는다** — 마일스톤 경험 수용이 아니다.
3. 사용자가 충족이라 판정한 AC는 `## 8`에 `- ac-acceptance` 줄을 append한다. **미충족이라 판정하면 receipt를 쓰지 않고**, 그 사실과 사용자 발언(마스킹 후)을 출력한 뒤 **사용자 확인을 받아 라우팅한다** — (a) 구현 결함이면 `/repair-workitem <task-id> "<finding 요약>"`(그 skill이 4-판정 이력을 task `## 8`에 영속하므로 판단 근거가 남는다), (b) 계약 변경이면 `DECISION_REGISTER.md`에 `status: open` + `- 발견: 수용 라운드 (task 스코프, <task-id>)`로 등재. **어느 쪽이든 판단을 어디에도 남기지 않은 채 종료하지 않는다.** 마일스톤 원장(`QA_FINDINGS`·`IMPROVEMENT_GUIDE`)에는 임의 등재하지 않는다.
4. **R6의 «프로세스 종료»만** 수행한다(세션 파일·`## 11`·판정 기록은 하지 않는다 — 그것들은 마일스톤 스코프의 산출물이다). **마지막 출력의 다음 단계는 3의 라우팅에 따라 분기한다** — 3(a) 라우팅이 없으면 `/validate-workitem <task-id>` 재실행(report를 새로 만들어야 `finalize`가 충족을 본다). **3(a)로 구현 결함을 라우팅했으면 `/repair-workitem <task-id> "<finding 요약>"` → 그 뒤 `/validate-workitem <task-id>`** 순이다 — 고칠 코드가 있는데 바로 재validate하면 같은 미충족이 반복된다(ADR-065 배경이 지목한 그 순환).
5. **`## 11`·`QA_FINDINGS`·`IMPROVEMENT_GUIDE`를 쓰지 않는다.** task 스코프가 쓰는 것은 그 task `## 8`과, **3(b)에 해당할 때의 `DECISION_REGISTER.md` 등재 한 건**뿐이다 — 그 경로가 없으면 계약 변경 발견이 어디에도 남지 않아 3의 *"판단을 어디에도 남기지 않은 채 종료하지 않는다"* 와 모순된다(등재 경로는 ADR-060 D11). 마일스톤 원장 2종은 마일스톤 스코프 전용이다.

## 마일스톤 스코프 흐름 (`<M>`) — 아래 R0~R6

## R0. 맥락 회수 (ADR-019 minimal — 필요한 것만)
1. 마일스톤 문서 `## 3`(포함 기능)·`## 5`(완료 기준)·`## 8`(회고 — graduation 값)·`## 9`(화면 전환, 있으면).
2. 산하 feature `## 7-1`(FAC↔AC)·`## 7-3`(PX↔AC, UI 한정)·`## 7`의 `프로토타입:` 참조 줄.
3. 산하 task `## 6-1`에서 **`[사용자 관측]`·`[플랫폼 관측]` modality AC 전량**과 `## 8`의 기존 `- ac-acceptance`/`- invalidated` 줄.
4. 각 task `docs/40-validation/reports/<task-id>.md`의 `## Evidence Bundle → 검증하지 못한 것(oracle gap)` 섹션 — **기계가 확인하지 못한 것의 목록이며 본 단계의 1차 시나리오 재료다.**
5. `QA_FINDINGS.md` 본 마일스톤 헤더 — AI가 이미 찾은 것(중복 보고 방지용으로만 쓴다. 사용자에게 미리 알려 주지 않는다 — 선입견 차단).
6. `docs/40-validation/visual/M-N/`(있으면) — §3-V 갤러리 경로.
- **graduation이 `NO`/`BLOCKED`면** 그 사유를 출력하고 "먼저 `/repair-milestone` 또는 환경 복구 후 `/stabilize-milestone` 재실행 권장"을 안내한 뒤 **사용자가 계속을 원할 때만** R1로 간다(미완 상태 확인도 유효하다).

## R1. 실행 환경 기동
1. 기동 명령을 **회수**한다(발명하지 않는다): `docs/00-meta/STACK_SETUP_PLAN.md`의 기록 → `package.json` scripts(`dev`/`start`) → Flutter는 `flutter run -d <device id>`(device는 `flutter devices --machine` 실측) → CLI/라이브러리는 진입 명령.
2. **표면별 확인 수단**:
   | 표면 | 사용자에게 제공할 것 |
   |---|---|
   | 웹 UI | dev server URL + 확인할 라우트 목록 |
   | 모바일 | 실행 device·에뮬레이터 + 진입 화면 |
   | API 서버 | 서버 기동 + 요청 예시(curl 또는 `.http` 파일 경로) |
   | CLI | 실행할 명령 시퀀스 + 테스트용 작업 디렉터리 경로 |
   | 배치·스케줄러 | dry-run 명령 + 산출물 확인 경로 |
   | 라이브러리 | 스니펫 파일 경로 + 실행 명령 |
3. **데이터 전제**: 확인에 데이터가 필요하면 **테스트 전용 자원에만** seed한다(일회용 DB·로컬 컨테이너·에뮬레이터·임시 디렉터리). 프로젝트가 제공하는 seed/fixture 수단을 재사용하고, **없으면 새 도메인 seed를 발명하지 않는다** — 그 사실을 알리고 사용자에게 준비를 요청한다. 운영 환경 접속·파괴적 호출·자격증명 요구 자동 실행은 금지(ADR-064 D1 안전 규정).
4. **readiness 확인**(포트 응답/프로세스 기동) 후 사용자에게 알린다. 기동 PID를 보관한다.
5. 기동 실패·불명이면 **blocked-on-env**로 처리한다 — 정확한 명령을 출력해 사용자가 직접 실행하도록 안내하고 R2로 계속한다(단계를 중단하지 않는다).
- **Codex**: 백그라운드 장기 기동 parity가 없다 → 기동을 대행하지 않고 **정확한 명령 시퀀스를 출력해 사용자가 실행**하도록 degrade한다(이후 라운드는 동일).

## R2. 안내된 시나리오 확인 (핵심)
1. 시나리오를 **필수 + 보완** 두 묶음으로 뽑는다. **필수는 개수 상한이 없다** — 상한을 걸면 receipt가 필요한 AC가 잘려 나가 그 task가 영구 미충족이 된다.
   - **필수**: 이 마일스톤 산하 task의 `[사용자 관측]`·`[플랫폼 관측]` modality AC 중 **아직 유효한 receipt가 없는 것 전부**(task `## 8`의 그 AC 마지막 이벤트가 `- ac-acceptance`가 아닌 것 — 미발급이거나 `- invalidated`로 무효화된 것). 이미 유효 receipt가 있는 AC는 재확인하지 않는다(task 층에서 이미 발급됐을 수 있다 — ADR-065 D1). 하나라도 확인하지 못하면 R6 판정은 `승인`이 될 수 없다.
   - **보완(5~8개)**: ① `## 9. 화면 전환`의 존재하는 각 path type(primary/failure/recovery) → ② oracle gap 카테고리 중 이 마일스톤 표면에 해당하는 것 → ③ PX↔AC의 경험 결정 → ④ FAC의 핵심 시나리오. 이 우선순위로 채운다.
   - 필수가 이미 많으면(예: 10건) 보완을 줄인다. 필수를 줄이지 않는다.
2. **한 번에 하나씩** 제시한다. 형식은 3줄로 고정한다.
   ```
   [N/M] <무엇을 할까요 — 구체적 조작 1~2줄>
   기대: <무엇이 보이거나 일어나야 하는가>
   근거: <AC-N | PX-... | 프로토타입 경로 | oracle gap 카테고리>
   ```
3. 사용자 응답을 받는다. **"기대와 달랐다"면 R4의 재현 3필드를 그 자리에서 채운다.**
4. `[사용자 관측]`·`[플랫폼 관측]` AC는 **충족/미충족을 명시적으로 물어** 그 자리에서 판정을 확정한다(뭉뚱그리지 않는다 — 이 응답이 receipt가 된다).
5. UI 마일스톤이면 승인 프로토타입 경로(`docs/20-system/prototypes/M<N>/<screen>.html`)를 함께 제시해 사용자가 나란히 비교할 수 있게 한다.

## R3. 자유 탐색
"이제 자유롭게 만져 보세요. 이상한 점·기대와 다른 점을 말씀해 주세요"로 열고, 사용자가 말하는 것을 받는다. **AI가 먼저 결함을 지목하지 않는다**(사용자 관점을 오염시키지 않는다).

## R4. 피드백 구조화
각 피드백을 아래 3필드로 되물어 확정한다. 사용자는 편하게 말하고, 구조화는 skill이 한다.
```
- 무엇을 했나: <조작 순서>
- 기대: <사용자가 기대한 것>
- 실제: <관측된 것>
```
- 재현이 불확실하면 그 자리에서 1회 재시도를 요청한다. 그래도 불확실하면 `재현 불확실`로 표시하고 **버리지 않는다.**
- UI면 해당 화면 스크린샷 경로 또는 프로토타입 대조 결과를 함께 적는다.

## R5. 3갈래 분류 + 라우팅 (ADR-066 D2)
각 피드백을 아래로 분류하고 **사용자에게 확인받은 뒤** 기록한다.
1. **계약 위반(결함)** — 이번 마일스톤이 약속한 AC·승인 프로토타입·DESIGN 계약을 안 지킴 → `QA_FINDINGS.md` 본 마일스톤 `### P0/P1/P2`에 기존 스키마로 등재(항목 문두에 `(수용)` 태그). 라벨은 기존 체계를 쓴다(`[Experience-drift]`·`[Design-voice]` 등). severity 기준: 사용자가 진행 불가·데이터 손상·약속한 핵심 시나리오 실패 = P0.
2. **계약 변경(결정)** — 계약 자체를 바꾸려는 것(방향 변경·새 기능) → `DECISION_REGISTER.md`에 `status: open` + `- 발견: 수용 라운드 (M<N>)`으로 등재(ADR-060 D11 경로) + 다음 마일스톤 후보로 surface. **현재 마일스톤에서 고치지 않는다.**
3. **개선 제안** — 계약 위반은 아니고 더 나은 방식 → `IMPROVEMENT_GUIDE.md`에 등재. **이번 마일스톤에서 고칠지 사용자에게 묻고**(3갈래 중 이 갈래만 «사용자 선택»이다 — ADR-066 D2), **고치기로 택한 항목에만 문두에 `(수용)` 태그를 단다** — 그 태그가 `/repair-acceptance`의 유일한 회수 신호이며, 없으면 그 선택이 실행되지 않는다(ADR-066 D5). 택하지 않은 항목은 태그 없이 남겨 다음 마일스톤 후보가 된다.
- **분류가 애매하면 사용자에게 그대로 묻는다**: "이건 약속한 것을 안 지킨 걸까요(이번에 고칩니다), 아니면 계약을 바꾸는 걸까요(다음 마일스톤입니다)?"
- `[사용자 관측]`·`[플랫폼 관측]` AC의 충족 판정은 해당 task `## 8`에 `- ac-acceptance` 줄로 기록한다(형식은 ADR-065 D3). **미충족이면 receipt를 쓰지 않고** 1번(결함)으로 라우팅한다.

## R6. 정리 + 판정
1. **R1이 기동한 프로세스를 종료한다**(보관한 PID). 이미 떠 있던 것을 재사용했으면 종료하지 않는다. 종료 결과를 출력에 보고한다.
2. 세션 원본을 `docs/40-validation/acceptance-reviews/<M>.r<N>.md`에 기록한다 — 확인한 시나리오·사용자 발언·재현 3필드·분류 결과. **저장 전 마스킹 의무**: 자격증명·토큰·개인정보·내부 식별자는 제거하거나 대체한다. 확실하지 않으면 원문을 싣지 않고 구조 요약만 남긴다(ADR-066 D3 — ADR-064 D5 준용). task `## 8`의 `- ac-acceptance` 줄은 커밋되므로 더 엄격히 적용한다.
3. 마일스톤 `## 11. 수용 기록`을 **덮어쓴다**(append가 아니라 최신 상태 1블록 유지 — `## 10` 봉인 기록과 동형). `- 라운드:`는 **판정이 `승인`·`보류`일 때만** 이번 회차 번호로 갱신하고, `미완`이면 **이전 값을 그대로 둔다**(확인을 못 했으므로 회차로 세지 않는다). 판정은 셋이다.
   - **승인** — 1번(결함) 라우팅 0건 **이고** R2의 필수 시나리오(= 유효 receipt가 없던 관측 modality AC 전부)를 모두 확인했다. `- 판정: 승인`.
   - **보류** — 결함 1건 이상. `- 판정: 보류(백로그 N건)`.
   - **미완** — 환경 기동 실패(blocked-on-env)나 사용자 중단으로 필수 시나리오를 다 확인하지 못했다. `- 판정: 미완(<사유> — 확인 K/M건)`. **결함 0건이어도 승인으로 쓰지 않는다** — 확인하지 못한 것을 승인으로 기록하면 이 단계의 의미가 사라진다.
3-1. **판정이 `승인`이고 `(수용)` 태그를 단 개선 항목이 0건이면 본 skill이 세션 파일을 삭제한다** — 그때는 `/repair-acceptance`가 호출되지 않으므로 삭제 주체가 없어진다. `삭제 예정: <경로>` echo 후 `rm`으로 이번 라운드 파일 하나만 지운다(판정 결과는 `## 11`과 3원장에 이미 영속). `보류`·`미완`이거나 **`승인`이지만 `(수용)` 태그 개선 항목이 1건 이상이면 보존한다**(각각 `/repair-acceptance`가 회수·삭제 / 다음 라운드가 이어받는다).
4. 최종 출력:
   - 판정 + 라운드 번호(상한 3 중 N회차)
   - 확인한 시나리오 수 / 발견 3갈래 카운트
   - `[사용자 관측]`·`[플랫폼 관측]` AC의 receipt 발급 결과(AC-N 목록)
   - 종료한 프로세스 / 세션 파일 처리 결과(`승인`이면 삭제한 경로, `보류`·`미완`이면 보존한 경로)
   - **커밋 안내**: 본 skill이 갱신한 tracked 파일 목록(`QA_FINDINGS.md`·`DECISION_REGISTER.md`·`IMPROVEMENT_GUIDE.md`·마일스톤 문서·task 문서)을 나열하고 **사용자가 직접 커밋해야 함**을 명시한다. 미커밋으로 두면 후속 task의 `/finalize-workitem`이 그 파일을 범위 밖 변경으로 보고 `Needs Review`로 멈춘다.
   - **재validate 필요 task 목록 (의무)**: 이번 라운드에 `## 8`을 갱신한(receipt 발급 또는 무효화) 모든 task를 나열하고 **`/validate-workitem <task-id>` 재실행이 선행돼야 졸업 판정이 유효함**을 명시한다. 졸업 item 4는 report를 읽고 report의 유일한 writer는 `/validate-workitem`이며 stale report는 미충족 처리되므로(ADR-067 D1 item 4 (d)), 이 재실행 없이 stabilize를 돌리면 그 task가 미충족으로 나온다.
   - **다음 단계**:
     - 판정 = 승인: **⓪ `(수용)` 태그를 단 개선 항목이 1건 이상이면 먼저 `/repair-acceptance <M>`** — 그 항목의 유일한 실행 경로이며(ADR-066 D5), 수리 후에는 그 skill 출력이 지시하는 순서를 따른다 → ① `## 8`을 갱신한 task가 있으면 그 task들 `/validate-workitem <task-id>` 재실행 → ② `/stabilize-milestone <M>` 재실행으로 졸업 판정 확정. **`(수용)` 태그 항목과 `## 8` 갱신이 모두 0건이고 코드 변경도 없었다면 ②만** 수행한다(생략은 이 조건에서만 허용).
     - 판정 = 보류: 기본 권장 `/repair-acceptance <M>` — 수용 finding 수리 후 `/accept-milestone <M>` 재실행
     - 판정 = 미완: 환경 복구(또는 사용자 재개) 후 `/accept-milestone <M>` 재실행. **라운드 카운터를 소모하지 않는다**(확인을 못 했으므로 회차로 세지 않는다 — `## 11`의 `- 라운드:` 값을 올리지 않고 `- 판정: 미완`만 기록한다).
     - 프롬프트 동봉 권장: 미해소 결함 라벨 목록 + `재현 불확실` 항목

책임 경계:
- 코드 수정·커밋·workitem status 변경 금지.
- `- ac-acceptance` 줄은 **사용자 응답을 옮겨 적는 것**이다 — 사용자가 판정하지 않은 AC에 receipt를 쓰지 않는다(ADR-065 D1).
- 결함을 직접 수리하지 않는다 — `/repair-acceptance`로 라우팅한다.
- 다른 마일스톤의 원장 항목을 건드리지 않는다.

정책 근거: [ADR-066](../../../docs/90-decisions/boilerplate/ADR-066-milestone-acceptance.md) (단계·라우팅·세션 파일), [ADR-065](../../../docs/90-decisions/boilerplate/ADR-065-ac-verification-contract.md) D3 (receipt), [ADR-067](../../../docs/90-decisions/boilerplate/ADR-067-milestone-graduation-v2.md) D6 (졸업과의 관계), [ADR-060](../../../docs/90-decisions/boilerplate/ADR-060-decision-closure-and-milestone-seal.md) D11 (봉인 후 결정 등재).

## Context 정책 (ADR-019)
R0의 회수 목록이 *최소 충분*이다 — 사전 fork-load 금지. R1의 기동 명령 회수(`STACK_SETUP_PLAN.md`·`package.json` 등)와 시나리오·피드백에서 발화한 문서는 그 시점에 추가로 읽는다.
```

### 8-3. `.claude/skills/repair-acceptance/SKILL.md` 생성

```markdown
---
name: repair-acceptance
description: /accept-milestone이 수집한 사용자 수용 finding을 3+1 판정으로 수리한다. 기존 task를 재개방하지 않고 코드만 고친다. 커밋 없음 (ADR-066 D4).
argument-hint: "<milestone-id> [optional scope note]"
disable-model-invocation: true
allowed-tools: Read Glob Grep Write Edit Bash
---

이 skill은 `/accept-milestone`이 남긴 **사용자 관측 finding**을 수리한다. 코드 수정이 허용된다.
**커밋하지 않고, workitem status를 바꾸지 않으며, 기존 task를 재개방하지 않는다.**

`/repair-milestone`과의 경계 (ADR-066 D5) — **입력 출처로 갈린다.**
- 본 skill: `docs/40-validation/acceptance-reviews/<M>.r*.md` + 그 라운드가 `QA_FINDINGS.md`·`IMPROVEMENT_GUIDE.md`에 `(수용)` 태그로 등재한 항목.
- `/repair-milestone`: `/stabilize-milestone`이 만든 finding(기계·AI 관측) + `stabilize-reviews` peer 리뷰.
- 같은 항목이 양쪽에 있으면 **사용자 관측이 우선 authority**다 — 본 skill이 처리하고 `/repair-milestone`은 status만 닫는다.

입력:
- `$ARGUMENTS`: milestone id(`M[0-9]+` 패턴만 — 미일치 즉시 종료) + (선택) 부분 범위 메모(예: `M1 "P0만"`).

반드시 먼저 할 일:
1. `docs/40-validation/acceptance-reviews/<M>.r*.md` glob으로 세션 파일을 회수한다(경로 목록을 메모리에 보관 — 삭제 후 재glob 금지).
2. `QA_FINDINGS.md` 본 마일스톤 헤더에서 `(수용)` 태그 항목을 회수한다. **`IMPROVEMENT_GUIDE.md`의 `## 2`/`## 3` 안 `(수용)` 태그 항목도 함께 회수한다** — 사용자가 "개선 제안을 이번 마일스톤에서 고치겠다"고 택한 것이 그 자리에 등재된다(ADR-066 D2/D5).
3. 둘 다 비어 있으면 *"수리 대상 수용 finding 없음 — `/accept-milestone <M>`을 먼저 실행하세요"* 안내 후 종료(문서 수정 금지).
4. 대상 task와 그 `## 6-1`·`## 8`을 읽는다(어떤 AC·modality에 걸린 결함인지 확인).
5. 우선순위(P0 > P1 > P2)로 정렬한다.

## 3+1 판정 (수정 *전* 1회)
**중복 병합 (canonical = 원장 항목)**: 같은 finding이 세션 파일의 분류 결과와 원장(`QA_FINDINGS`·`IMPROVEMENT_GUIDE`)에 **동시에 있는 것이 정상이다** — `/accept-milestone` R5가 원장에 등재하고 R6이 세션 원본에 분류 결과를 함께 남긴다. **판정·수리·기록의 단위는 원장 항목 하나이며**(ID와 `status`를 가진 쪽이 canonical), 세션 파일은 그 항목의 재현 절차·사용자 발언을 보충하는 데만 쓴다. 동일 `<라벨> <경로> <증상>`이면 한 항목으로 합쳐 `<M>-uat-<N>`을 **하나만** 발급한다(`/repair-milestone`의 dedup 규율과 동형). 세션 파일에만 있고 원장에 없는 항목은 R5 라우팅 누락이므로 사용자에게 확인한 뒤 처리한다.
각 finding을 아래 넷 중 하나로 판정하고 한 줄 근거를 남긴다.
- **Adopt** — 진짜 결함. 보고된 대로 수리.
- **Adopt-modified** — 결함은 맞지만 더 나은 방식으로 수리(다른 수정 + 사유).
- **Needs User Clarification** — 재현 조건·기대값이 불명확. **추측으로 고치지 않고 사용자에게 되묻는다**(무엇이 불명확한지 1줄 + 필요한 정보).
- **Out-of-contract** — 결함이 아니라 계약 변경(이번 마일스톤이 약속하지 않은 것). **사용자 확인 후** `DECISION_REGISTER.md`에 `status: open` + `- 발견: 수용 라운드 (M<N>)`으로 등재하고 다음 마일스톤 후보로 남긴다. 코드를 고치지 않는다.

> **`Reject-false-positive`는 없다** — 사용자가 직접 보고 말한 것을 에이전트가 오탐으로 기각하는 것은 authority 역전이다(ADR-066 D4). 불명확하면 `Needs User Clarification`, 계약 밖이면 `Out-of-contract`이며, 그 둘은 모두 **사용자가 판단하는 경로**다.

## 수행
1. Adopt / Adopt-modified 항목을 우선순위 순으로 처리한다.
2. **회귀 테스트 선행 (ADR-066 D4)**: 각 항목마다 **그 결함을 재현하는 실패 테스트를 먼저 추가해 실패를 관측한 뒤** 고친다. 관측 결과를 결정 이력에 1줄 남긴다.
   - **면제**: 코드 3줄 이하 + 외부 행동 불변인 표기·간격·문구 수정. 면제 사유를 결정 이력에 적는다.
   - 테스트 작성이 불가능하면(사람 관측만으로 판정되는 시각 결함 등) 그 사유를 적고 **그 AC의 modality가 `[사용자 관측]`인지 확인**한다 — 그렇다면 다음 수용 라운드의 재확인 대상이다.
3. **기존 task를 재개방하지 않는다** — task `## 0. Status`를 건드리지 않고, `## 6 AC`·`## 3`·`## 6-1` 계획 본문도 고치지 않는다(잠긴 계약이다). **task 문서에 쓰는 것은 `## 8`의 append 2종뿐이다**(아래 4·5의 `- invalidated`·`- pattern-scan`). task 문서 밖 산출물은 각 단계가 따로 규정한다 — 코드(1·2), report 삭제(4-A), 3원장 status(8), decision log(7), 원장 등재(`Out-of-contract`).
4. **AC acceptance 무효화 (ADR-065 D3)**: 수리가 어떤 AC의 동작 경로를 건드렸고 그 AC의 modality가 `[사용자 관측]`·`[플랫폼 관측]`이면 그 task `## 8`에 `- invalidated <날짜> <AC-N>: repair-acceptance 수정으로 재확인 필요`를 append한다(기존 `- ac-acceptance`는 지우지 않는다). **새 receipt를 대신 쓰지 않는다.**
4-A. **영향 task report 무효화 (ADR-067 D1 item 4 (d) 보완)**: 코드를 고친 각 task의 `docs/40-validation/reports/<task-id>.md`를 **삭제한다**(`/repair-workitem`·`/repair-milestone`의 삭제 규율과 동형 — **삭제 전 `삭제 예정: <경로>` echo 강제**, 미리 회수한 경로로 하나씩 `rm`, 삭제 후 재glob 금지). 고친 파일이 그 task `## 4-1`에 없을 수 있어 mtime 비교만으로는 stale이 안 잡힌다. report 부재 = 졸업 item 4 미충족이므로 재validate가 강제된다.
5. **동일 패턴 전수 검색**: 각 Adopt 결함에 대해 같은 패턴의 다른 출현을 저장소 전체에서 **읽기 전용**으로 검색하고, 대상 task `## 8`에 `- pattern-scan <날짜> <패턴>: 범위 내 N건 수정 / 범위 밖 M건 <경로>`를 append한다. 범위 밖은 고치지 않고 `/repair-milestone` 또는 다음 마일스톤으로 라우팅한다.
6. **한 라운드에 P0/P1/P2를 모두 판정으로 완결한다**(defer 금지). 작업량을 줄이려면 사용자가 인자로 부분 범위를 지정한다.
7. **결정 이력 영속화 (ADR-047 D7)** — 본 라운드의 P0/P1 항목 전부를 `docs/40-validation/IMPROVEMENT_GUIDE.md`의 `## 5. Repair decision log` 안 `### M-N` 그룹(없으면 신설)에 append한다. P2는 영속화하지 않는다.
   ```
   - **M1-uat-1** | P0 | [관측됨] | linked: M1 | affected: T-004 | status: applied | decision: Adopt
     - 발견 (수용 라운드 r1): <사용자가 관측한 것 한 줄>.
     - 결정: <Adopt 사유 한 줄> / 회귀 테스트: <추가한 테스트 또는 면제 사유>.
   ```
   ID 컨벤션은 `<milestone-id>-uat-<N>`이다. **`affected: T-NNN`은 필수** — task 문서를 건드리지 않으므로 이 역참조가 "어느 task의 산출물을 나중에 누가 왜 고쳤는지"를 추적하는 유일한 경로다.
8. **원본 finding status 갱신 (4종 전부)** — ① `Adopt`/`Adopt-modified`로 해소한 `QA_FINDINGS.md`의 `(수용)` 항목 → `status: resolved` ② 같은 기준으로 `IMPROVEMENT_GUIDE.md` `## 2`/`## 3`의 `(수용)` 항목 → `status: resolved`(이걸 빠뜨리면 개선 제안이 열린 채 남아 다음 stabilize의 open 스냅샷을 부풀린다) ③ `Out-of-contract`로 재분류한 항목 → 원본을 `status: resolved (재분류: DECISION_REGISTER D-NNN — 다음 M)`로 닫고 원장 등재와 짝을 맞춘다 ④ `Needs User Clarification` 항목 → **닫지 않고 `status: open` 유지**.
9. **세션 파일 삭제 (echo-then-rm)**: 한 파일의 **전 severity finding이 판정 완결됐을 때만** 삭제한다. 삭제 전 `삭제 예정: <경로>`를 출력하고 보관한 경로 목록으로 하나씩 삭제한다(삭제 후 재glob 금지).
   - **미완결 = 보존**: `Needs User Clarification`이 1건이라도 남았거나(사용자 답변 후 재실행이 이어받는다) 부분 범위 지정으로 미처리가 남았으면 **삭제하지 않고** 출력에 `미처리 잔존 — 보존: <경로>`를 명시한다.

책임 경계:
- 새 기능을 추가하지 않는다. 마일스톤 범위 밖 파일을 수정하지 않는다.
- 자동 커밋하지 않는다 — commit owner는 사용자다(ADR-047 D7).
- workitem `## 0. Status`를 변경하지 않는다. task 계획 본문(`## 3`·`## 6`·`## 6-1`)을 고치지 않는다.
- `- ac-acceptance` 줄을 발급하지 않는다(사용자 authority — ADR-065 D1).

마지막 출력:
- 판정 카운트: Adopt M / Adopt-modified K / Needs User Clarification I / Out-of-contract J
- 수정 파일 목록 + 어떤 finding을 어떻게 해소했는지
- 회귀 테스트: 추가 N건 / 면제 M건(사유) / 작성 불가 K건(사유)
- `Needs User Clarification` 항목 + 사용자에게 필요한 정보(있으면)
- `Out-of-contract` 항목 + 원장 등재 결과(있으면)
- AC acceptance 무효화: N건(AC-N 목록)
- 삭제한 report (ADR-067 D1 item 4 (d)): <task-id 목록> / 해당없음
- 동일 패턴 전수 검색: 범위 내 N건 / 범위 밖 M건(경로)
- `## 5. Repair decision log` append 줄 수 / status resolved 토글 수 / 삭제·보존한 세션 파일
- **커밋 안내**: 본 skill은 커밋하지 않는다 — 위 수정 파일과 문서를 **사용자가 직접 커밋한 뒤** 다음 단계로 진행한다. 미커밋으로 두면 후속 `/finalize-workitem`이 범위 밖 변경으로 보고 `Needs Review`로 멈춘다.
- **재validate 필요 task 목록 (의무)**: 본 라운드가 코드를 고친 task와 `- invalidated`를 append한 task 전부를 나열하고 **각 task `/validate-workitem <task-id>` 재실행이 선행돼야 졸업 판정이 유효함**을 명시한다. 졸업 item 4 (d)가 report staleness를 보므로, 재실행 없이 stabilize를 돌리면 그 task는 미충족으로 나온다(반대로 이 항이 없으면 낡은 `Pass` report로 졸업하는 경로가 열린다).
- 후속 권장 (순서 고정): ① 위 목록의 task별 `/validate-workitem <task-id>` 재실행 → ② `/accept-milestone <M>` 재실행(사용자 재확인 — 무효화된 관측 AC의 receipt 재발급 포함) → ③ 그 다음은 `/accept-milestone`의 출력이 지시하는 순서를 따른다(**재발급으로 `## 8`이 또 바뀌므로 stabilize 전에 한 번 더 재validate가 필요하다**).

정책 근거: [ADR-066](../../../docs/90-decisions/boilerplate/ADR-066-milestone-acceptance.md) D4/D5, [ADR-065](../../../docs/90-decisions/boilerplate/ADR-065-ac-verification-contract.md) D3, [ADR-047](../../../docs/90-decisions/boilerplate/ADR-047-code-as-agent-harness.md) D7, [ADR-060](../../../docs/90-decisions/boilerplate/ADR-060-decision-closure-and-milestone-seal.md) D11.

## Context 정책 (ADR-019)
세션 파일 + 대상 task의 `## 6-1`·`## 8`이 *최소 충분* 회수 목록이다 — 사전 fork-load 금지. 원장의 `(수용)` 항목, 수리 대상 코드·테스트, `수행 5`의 패턴 검색 범위는 본문 지시대로 그때 추가로 읽는다.
```

### 8-4. Codex wrapper 2개 생성

**기존 wrapper의 6가지 계약을 그대로 복제한다** (실측: `.agents/skills/repair-milestone/SKILL.md`) — ① `description`은 **영어** `Use ONLY when the user explicitly types \`$<name> …\`. Do not trigger implicitly from generic phrasing.` (한국어 기능 설명으로 바꾸면 Codex 암묵 호출 억제가 깨진다) ② `Source of truth:` 줄 + 신설 근거 ADR ③ frontmatter 무시 규약 ④ 슬래시→`$` 치환 규약 ⑤ `Preserve all repo policies from AGENTS.md and docs/.` ⑥ stale 경고 줄. **`name`과 `description` 외 다른 frontmatter 키를 넣지 않는다.**

`.agents/skills/accept-milestone/SKILL.md`:
```markdown
---
name: accept-milestone
description: Use ONLY when the user explicitly types `$accept-milestone <milestone-id>` or `$accept-milestone --task <task-id>`. Do not trigger implicitly from generic phrasing.
---

Source of truth: `.claude/skills/accept-milestone/SKILL.md` (skill 신설 근거: ADR-066). Read it and follow the workflow.

Treat all frontmatter keys other than `name` and `description` (e.g., `agent:`, `disable-model-invocation:`, `allowed-tools:`, `context:`, `argument-hint:`, `model:`, `effort:`) as Claude-only and ignore them — execute locally in Codex.

**Slash command translation**: 본문 안의 `/accept-milestone` 표기는 Claude 슬래시 커맨드다. Codex에서는 `$accept-milestone`으로 읽고 사용자에게 안내한다 (예: 본문 "다음 단계: `/repair-acceptance M1`" → Codex 응답에서는 "다음 단계: `$repair-acceptance M1`"). Codex CLI는 `/`를 빌트인 슬래시 커맨드에 쓰므로 명시적 치환이 필요.

**Codex degrade — 환경 기동**: 백그라운드 장기 프로세스 기동 parity가 없어 R1에서 환경을 대행 기동하지 않는다. **정확한 명령 시퀀스를 출력해 사용자가 직접 실행**하도록 안내하고 R2로 계속한다(R2~R6와 task 스코프 동작은 동일).

Preserve all repo policies from `AGENTS.md` and `docs/`.

If the source path no longer exists, this wrapper is stale — see ADR-010.
```

`.agents/skills/repair-acceptance/SKILL.md`:
```markdown
---
name: repair-acceptance
description: Use ONLY when the user explicitly types `$repair-acceptance <milestone-id>`. Do not trigger implicitly from generic phrasing.
---

Source of truth: `.claude/skills/repair-acceptance/SKILL.md` (skill 신설 근거: ADR-066 D4). Read it and follow the workflow.

Treat all frontmatter keys other than `name` and `description` (e.g., `agent:`, `disable-model-invocation:`, `allowed-tools:`, `context:`, `argument-hint:`, `model:`, `effort:`) as Claude-only and ignore them — execute locally in Codex.

**Slash command translation**: 본문 안의 `/repair-acceptance` 표기는 Claude 슬래시 커맨드다. Codex에서는 `$repair-acceptance`로 읽고 사용자에게 안내한다 (예: 본문 "다음 단계: `/accept-milestone M1`" → Codex 응답에서는 "다음 단계: `$accept-milestone M1`").

**Codex degrade**: 서브에이전트 위임 없이 메인 세션이 순차 단일 실행한다(판정 결과 동일).

Preserve all repo policies from `AGENTS.md` and `docs/`.

If the source path no longer exists, this wrapper is stale — see ADR-010.
```

**`agents/openai.yaml`** — 실측 결과 기존 18개 파일의 내용은 아래 2줄뿐이다(`name` 필드가 없다). 두 디렉터리에 **그대로 복사**한다.
```yaml
policy:
  allow_implicit_invocation: false
```

**커밋**: `feat(skills): add accept-milestone and repair-acceptance stages`

---

## Phase 9 — visual-QA 조기 반환 차단

### 9-1. `docs/90-decisions/boilerplate/ADR-058-design-workflow.md` — Amendment 3 추가

파일 맨 끝에 추가한다.

```markdown
<a id="adr-058-amend-3"></a>
## Amendment 3 (2026-08-09) — visual-QA 전제 미충족의 표현 고정

### 배경
- [관측됨] `#amend-2`가 규정한 visual-QA scaffold는 *"앱이 비어 있으면 대상 landmark 부재 graceful skip은 허용"* 이라고만 정하고 **그 skip을 어떻게 표현할지를 정하지 않았다.** 실제 파일럿에서 접근성 검사 spec이 `testInfo.annotations.push(...)` + `return`으로 빠져나갔고, 러너는 이를 **passed로 집계**했다 — 레지스트리에 `실행 5 / skip 0`이 기록됐지만 그중 4건은 검사를 한 번도 실행하지 않았다.
- [관측됨] "앱이 비어 있음"을 *대상 landmark 부재* 로 판정하게 되어 있어, **selector·라우트·wiring이 깨진 경우와 구분되지 않는다.** 두 경우가 같은 신호를 내면 배선 결함이 정상 skip으로 숨는다.

### 결정
1. **판정 보류는 runner-native skip으로만 표현한다.** `test.skip()`(또는 그 스택의 동등 API)만 허용하고, **annotation만 남기고 `return`하는 형태를 금지한다.** 러너 통계의 `skipped`가 진실을 담아야 졸업 판정(ADR-052#amend-1)이 성립한다.
2. **전제는 판정하지 말고 소유한다(1차).** spec이 스스로 seed/fixture로 populated 상태를 만든 뒤 검사한다. 그러면 *대상 요소 부재*는 **항상 실패**이며 분기가 사라진다.
3. **소유가 불가능한 표면(로그인·외부 의존 필수)은 2분기로 한다.** (a) **독립적인 empty 신호**(라우트 응답·명시적 seed 상태 표시 등 — 대상 landmark 부재를 근거로 쓰지 않는다)로 앱이 비었다고 확인되면 `test.skip()`. (b) 앱이 populated인데 selector·fixture·라우트 준비가 안 됐으면 **실패한다.** 이 실패는 `validate:e2e`의 `FAIL(project)`로 졸업을 차단한다(ADR-052#amend-1 — 새 게이트를 만들지 않는다).
4. **`/stack-guard`는 e2e 판정 시 조기 반환 패턴을 보고한다** — 선언된 e2e 디렉터리에서 `annotations` 기록 직후 `return`하는 형태를 grep해 발견 시 `P1 [E2E-vacuous-skip] <file:line> — runner-native skip으로 교체 필요`를 출력에 남긴다. **문자열 검사이므로 기록 등급이며 차단하지 않는다**(ADR-063 D6 1문항).
5. **전제 미준비를 영속 기록한다.** 결정 2·3을 만족할 seed·전제 수단이 없어 spec을 만들지 못하면, 출력만 하고 끝내지 않고 `STACK_SETUP_PLAN.md ## 통합 명령 사용법`에 `visual-qa: PENDING (precondition: <무엇이 없는가>) (<YYYY-MM-DD>)` 한 줄을 기록한다(준비되면 `READY (<날짜>)`로 갱신). `/stabilize-milestone` §1.0의 `[Guard-drift]` 점검이 그 값이 `PENDING`이면 `P2 [Guard-drift] visual-QA 전제 미준비 — /plan-workitem 이 전제 line item authoring 후 /stack-guard 재실행 권장`을 기록한다. **`probe smoke:` 기록 → `[Guard-drift]` 회수 경로(ADR-063 D3→D4)와 같은 형태이며 새 게이트를 만들지 않는다** — 기록이 없으면 boot smoke 하나로 e2e가 통과하는 상태가 조용히 잊힌다.
6. **적용 범위**: 본 amendment는 `#amend-2`가 정의한 **UI/web 표면**에 한정된다. Flutter `native/*`의 시각 검증은 golden(ADR-059 D3)·경험 게이트 degrade(ADR-059 D12)가 담당하며 본 결정으로 바뀌지 않는다.

### 근거
- 보일러플레이트가 graceful skip을 *지시* 하면서 표현을 정하지 않았고, 다른 곳에서 러너의 통과/skip 수를 졸업 증거로 소비한다. 지시와 소비가 어긋난 자기유발 결함이다.
- `test.skip()`으로 바꾸면 전부 보류된 경우 실행 0개가 되어 `EMPTY`(졸업 차단)로 드러난다. 다만 boot smoke 하나가 통과하면 전체는 `PASS`이므로(ADR-064 D6이 의도적으로 허용) **표현 고정만으로는 부족하고 결정 2·3의 실패 전환이 필요하다.**

### 강도 (ADR-022)
- **제약(강) — [관측됨]**: 결정 1·3(b). **enabling(약)**: 결정 2 권장, 결정 4 기록 등급.

### 적용 surface
- .claude/skills/stack-guard/SKILL.md
- .claude/skills/stabilize-milestone/SKILL.md
- docs/00-meta/_templates/STACK_SETUP_PLAN_TEMPLATE.md
```

그리고 **같은 파일 `## Surfaces` 블록**의 `- .claude/skills/stack-guard/SKILL.md` 줄 **다음**에 아래 한 줄을 추가한다 — 결정 5가 stabilize에 `[Guard-drift]` (e) 항목을 부여하므로 fan-out SSOT에 등재해야 한다. **선례**: [ADR-063](ADR-063-verification-harness-integrity.md)의 `## Surfaces`가 같은 이유로 `- .claude/skills/stabilize-milestone/SKILL.md — D4 [Guard-drift]`를 등재한다. **등재하면 그 파일에 `ADR-058` 역참조가 필요해지므로 아래 9-2b가 (e) 줄에 근거를 함께 박는다 — 두 편집은 한 쌍이며 둘 중 하나만 하면 `P1 [Surface-backref]`가 발화한다.**

```markdown
- .claude/skills/stabilize-milestone/SKILL.md — #amend-3 결정 5 `[Guard-drift]` (e) visual-QA 전제 기록 회수
```

그리고 `docs/00-meta/_templates/STACK_SETUP_PLAN_TEMPLATE.md`의 `## 통합 명령 사용법` 절 **코드 블록 다음**(그 절의 끝, `## Design Gate Adapter` 앞)에 아래 placeholder 한 줄을 추가한다.

> 참고: 이 절에는 현재 `probe smoke:` placeholder가 **없다**(실측) — `/stack-guard`가 생성 파일에 직접 쓴다. 그래서 placeholder는 *기록을 가능하게 하는 조건*이 아니라 **필드를 발견 가능하게 만드는 문서화**다. `[Guard-drift]` (e)가 읽을 자리를 사람이 미리 볼 수 있게 두는 것이 목적이며, 값이 없으면 (e)는 침묵한다.

```markdown
visual-qa: <READY | PENDING (<사유>)> (<YYYY-MM-DD>)   <!-- UI/web 대상만. /stack-guard 가 매 실행 기록·갱신 (ADR-058#amend-3 결정 5). 비-UI 는 이 줄을 삭제한다. -->
```

### 9-2. `docs/90-decisions/boilerplate/README.md` — ADR-058 행 갱신

`058` 행의 `Amendments` 칸은 **괄호 없이** `+#amend-1: …, +#amend-2: …` 로 comma 이어 쓰는 형식이다(실측 — `009`·`052` 행의 괄호 형식과 다르다). 그 줄 끝에 `, +#amend-3: visual-QA 전제 미충족의 표현 고정(runner-native skip 강제·populated 실패 전환·PENDING 기록)`를 덧붙인다. **그 행의 기존 형식을 그대로 따른다** — 인덱스 amend 수 동기 검사가 `## Amendment N` 개수와 대조하므로 항목을 빠뜨리지 않는 것이 핵심이고 괄호 유무는 행마다 다르다.

### 9-2b. `.claude/skills/stabilize-milestone/SKILL.md` — `[Guard-drift]`에 항목 추가

§1.0 항목 8의 `(d) probe 판정 기록` 블록 **다음**에 아래를 추가한다(ADR-058#amend-3 결정 5).

```markdown
   - (e) **visual-QA 전제 기록 (ADR-058#amend-3 결정 5)** — `## 통합 명령 사용법`의 `visual-qa:` 값이 `PENDING`이면 `P2 [Guard-drift] visual-QA 전제 미준비 — /plan-workitem 이 전제 line item authoring 후 /stack-guard 재실행 권장`. 값이 `READY`거나, 줄이 없거나(비-UI·비대상), **줄은 있으나 미치환 angle-bracket placeholder면 침묵한다** — 비-UI 프로젝트에는 템플릿 복사분이 그대로 남을 수 있고(`/bootstrap-stack`은 *절* 단위로만 비해당 삭제한다) 그 placeholder 문자열 자체에 `PENDING`이 들어 있어, 명시하지 않으면 deterministic 검사가 오발화한다. **여기서 spec을 실행하지 않는다 — 기록된 문자열만 읽는다**((d)와 동형, read-only 계약).
```

그리고 **같은 항목 8의 도입 문구를 동기화한다** — `아래 (a)~(d) 가 전부 정상이면` → `아래 (a)~(e) 가 전부 정상이면`. 침묵 우선 규칙이 새 (e)를 포함하지 않으면 (e)만 규칙 밖에 남는다.

### 9-3. `.claude/skills/stack-guard/SKILL.md` — 6-4-1 Visual-QA 항목 교체

**기존**:
```markdown
     - **구현 앱 Visual-QA (별도 surface)**: e2e scaffold 시 `e2e/visual-qa.spec.*`도 생성해 렌더된 앱을 검사한다. 앱이 비어 있으면 대상 landmark 부재 graceful skip은 허용하지만 정적 adapter conformance를 통과시킨 것으로 간주하지 않는다. breakpoint 320/375/768/1440 page overflow는 차단, 요소 겹침은 권고, populated axe serious/critical은 차단·moderate/minor는 권고. 가능한 runner에서는 generated geometry/axe helper를 두 surface가 재사용한다.
```

**수정**:
```markdown
     - **구현 앱 Visual-QA (별도 surface)**: e2e scaffold 시 `e2e/visual-qa.spec.*`도 생성해 렌더된 앱을 검사한다. breakpoint 320/375/768/1440 page overflow는 차단, 요소 겹침은 권고, populated axe serious/critical은 차단·moderate/minor는 권고. 가능한 runner에서는 generated geometry/axe helper를 두 surface가 재사용한다.
       - **전제 처리 (ADR-058#amend-3 — 표현을 고정한다)**: ① **spec이 전제를 소유한다** — 스스로 seed/fixture로 populated 상태를 만든 뒤 검사하므로 대상 요소 부재는 *항상 실패* 다. ② 소유가 불가능한 표면(로그인·외부 의존 필수)만 2분기로 한다 — **독립적인 empty 신호**(라우트 응답·명시적 seed 상태 표시. **대상 landmark 부재를 empty 근거로 쓰지 않는다** — selector·wiring 파손과 구분되지 않는다)로 앱이 비었음이 확인되면 `test.skip()`, **populated인데 selector·fixture·라우트가 준비되지 않았으면 실패시킨다**(그 실패가 `validate:e2e`의 `FAIL(project)`로 졸업을 차단한다 — 새 게이트를 만들지 않는다).
       - **`annotations`만 남기고 `return`하는 형태를 생성하지 않는다** — 러너가 passed로 집계해 "검사가 돌았다"는 거짓 신호가 된다. 판정 보류는 `test.skip()`(또는 그 스택의 동등 API)으로만 표현한다.
       - 앱이 비어 있어 skip한 경우에도 정적 adapter conformance를 통과시킨 것으로 간주하지 않는다.
       - **기존 spec 점검 (기록 등급)**: 선언된 e2e 디렉터리에서 `annotations` 기록 직후 `return`하는 패턴을 grep해 발견 시 `P1 [E2E-vacuous-skip] <file:line> — runner-native skip으로 교체 필요`를 출력에 남긴다. 문자열 검사라 차단하지 않는다(ADR-063 D6).
       - **전제를 자동으로 만들 수 없으면**(도메인 seed 수단 부재·자격증명 필요) spec을 생성하거나 덮어쓰지 않고 `Needs Visual-QA Precondition — /plan-workitem 이 seed·전제 line item 을 authoring 해야 함`을 출력한다(6-4-a의 `Needs E2E Smoke` 선례와 동형). **stack-guard가 도메인 seed를 발명하지 않는다.**
       - **판정 기록 (필수 — ADR-058#amend-3 결정 5)**: 위 결과를 `docs/00-meta/STACK_SETUP_PLAN.md` 의 `## 통합 명령 사용법` 절에 `visual-qa: <READY|PENDING> (<사유 — PENDING일 때만>) (<YYYY-MM-DD>)` 1줄로 기록한다(이미 있으면 갱신). **UI/web 대상일 때만 쓰고 비-UI에서는 줄을 만들지 않는다.** 이 줄이 `/stabilize-milestone` `[Guard-drift]` (e)의 유일한 입력이며, 없으면 전제 미준비가 조용히 잊힌다. **조기 종료 경로에서도 기록한다**(5-f `probe smoke:` 기록 규율과 동형).
```

**커밋**: `fix(stack-guard): forbid vacuous early-return skips in visual-QA specs`

---

## Phase 10 — `/accept-milestone` 런타임 배선 (이 Phase가 없으면 새 단계가 고아가 된다)

ADR-066의 Mutation Contract Target과 `## Surfaces`가 stabilize의 두 지점을 대상으로 선언한다. 그 편집이 없으면 (a) ADR-066 배경이 지목한 *"권장만 하고 실행 자리가 없다"* 는 줄이 그대로 남고, (b) Phase 13 검증 #5가 `NO-BACKREF(066): .claude/skills/stabilize-milestone/SKILL.md`로 실패한다.

### 10-1. §3-V (d) — 후속 호출로 교체

**기존**:
```markdown
   - (d) 최종 출력(단계 8)에 갤러리 경로 + "사용자 육안 확인 권장(스펙 자체의 오류는 사람이 잡는다)" 1줄.
```

**수정**:
```markdown
   - (d) 최종 출력(단계 8)에 갤러리 경로 + **"사용자 육안 확인은 `/accept-milestone <M>`이 수행한다 — 스펙 자체의 오류는 사람이 잡는다"** 1줄(ADR-066 D1). 본 단계의 AI 판독은 `[Experience-drift]` 후보를 올리는 데까지이며, 그 확인의 실행 자리는 수용 단계다(권장 — 졸업 필수 조건은 아니다).
```

### 10-2. 단계 8 「다음 단계」 — 수용 단계 분기 추가

**기존** (졸업 가능 = YES 분기):
```markdown
     - **졸업 가능 = YES + P0 후속 0건**:
       - 기본 권장: `/plan-milestone` — 새 milestone(M-(N+1)) + feature 문서 생성 → `contract-ready`. 뒤이어 `/plan-workitem M-(N+1)`(전체 계획 스냅샷, task는 `draft`) → **`/seal-milestone M-(N+1)`**(검사·승인·일괄 `ready`) 순으로 진행(ADR-057#amend-3 / ADR-060 D7)
```

**수정** — 그 블록의 `기본 권장:` 줄 **앞**에 수용 단계 권장을 넣고, 기존 `/plan-milestone` 줄은 «수용을 건너뛴 경우 / 졸업 확정 뒤» 경로로 남긴다. **판정 3종(승인·보류·미완)의 후속을 모두 적는다** — 하나라도 빠지면 그 판정을 받은 사용자가 다음 단계를 본 출력에서 찾지 못한다.

> ⚠ **`승인` 뒤에 `/plan-milestone`으로 바로 보내지 않는다.** `ADR-066` D1이 *"졸업 판정 소유권은 `/stabilize-milestone`에 유지한다 — 수용 라운드의 수리는 코드 변경이므로 그 뒤 테스트·e2e 재검증 없이 졸업시키지 않는다"* 를 규정하고, 그 `## 결과`가 흐름을 `… → accept 재확인 → stabilize 재실행 → 졸업`으로 못박는다. 수용 라운드가 `## 8`(receipt)이나 코드를 바꿨으면 **본 skill 재실행이 졸업 확정 단계**다(Phase 12-3의 8.7과 같은 순서).

```markdown
     - **졸업 가능 = YES + P0 후속 0건**:
       - **기본 권장: `/accept-milestone <M>`** — 사람이 직접 실행·확인하는 수용 단계(ADR-066 D1). **권장이며 졸업 필수 조건은 아니다** — 건너뛰면 아래 `/plan-milestone`으로 바로 진행한다. 단 산하 task에 `[사용자 관측]`·`[플랫폼 관측]` modality AC가 있으면 그 receipt 없이는 item 4가 이미 미충족이므로 이 단계 전에 `/accept-milestone --task <task-id>`가 선행됐어야 한다(ADR-065 D1). **단 마일스톤 문서 `## 11`에 `- 판정: 승인`이 이미 기록돼 있고 그 뒤 코드·receipt 변경이 없으면 재권장하지 않는다** — 그 상태에서 다시 권장하면 라운드 상한 3이 무의미하게 소모된다.
       - 수용 판정별 후속 (**상세는 `/accept-milestone` 출력이 SSOT** — 여기서는 요약): **`승인`** = `(수용)` 태그로 이번 M 수리를 택한 개선 항목이 있으면 먼저 `/repair-acceptance <M>`(그 항목의 유일한 실행 경로 — ADR-066 D5) → `## 8`을 갱신한 task `/validate-workitem` 재실행 → **본 skill 재실행으로 졸업 확정**(졸업 판정 소유권은 본 skill — ADR-066 D1. 변경 0건이면 재실행만). / **`보류`** = `/repair-acceptance <M>` → 영향 task `/validate-workitem` 재실행 → `/accept-milestone <M>` 재실행 → **재발급으로 `## 8`이 또 바뀌므로 한 번 더 영향 task 재validate** → 본 skill 재실행. / **`미완`** = 환경 복구(또는 사용자 재개) 후 `/accept-milestone <M>` 재실행(라운드 카운터 미소모).
       - **수용을 건너뛴 경우(또는 위 재실행으로 졸업이 확정된 뒤)** 기본 권장: `/plan-milestone` — 새 milestone(M-(N+1)) + feature 문서 생성 → `contract-ready`. 뒤이어 `/plan-workitem M-(N+1)`(전체 계획 스냅샷, task는 `draft`) → **`/seal-milestone M-(N+1)`**(검사·승인·일괄 `ready`) 순으로 진행(ADR-057#amend-3 / ADR-060 D7)
```

### 10-3. 도입부 write 대상에 수용 단계 note 1줄

stabilize 도입부의 *"다음 네 종류의 문서 갱신만 정상 책임이다"* 목록 **다음**에 아래 한 줄을 추가한다(수용 기록의 writer가 본 skill이 아님을 못 박아 소유권 혼선을 막는다).

```markdown
milestone 문서 `## 11. 수용 기록`은 본 skill의 write 대상이 **아니다** — `/accept-milestone`(마일스톤 스코프) 단독 소유다(ADR-066 D1).
```

**커밋**: `feat(stabilize): wire acceptance stage into experience gate and next-step output`

---

## Phase 11 — 출력 계약·회수 경로 보완 (P2 5건 + `/repair-milestone` 배선 1건)

> 11-1~11-5는 P2다. **11-6은 P2가 아니다** — 빠뜨리면 cross-cutting 수정 뒤 낡은 `Pass` report로 졸업하는 경로가 열린다(졸업 item 4 (d)의 보완이라 여기 묶었을 뿐이다).

### 11-1. 비커밋 skill 공통 종료 계약 (커밋 안내)

아래 4개 파일의 `마지막 출력:` 목록에 **동일한 2줄**을 추가한다(`/repair-milestone`은 이미 갖고 있으므로 건드리지 않는다. `/accept-milestone`·`/repair-acceptance`는 Phase 8에서 이미 포함했다).

추가할 내용:
```markdown
- **변경한 tracked 파일 목록**: <경로 나열>
- **커밋 안내**: 본 skill은 커밋하지 않는다 — 위 파일을 **사용자가 직접 커밋한 뒤** 다음 단계로 진행한다(commit owner는 사용자/`/finalize-workitem`). 미커밋으로 두면 후속 task의 `/finalize-workitem`이 그 파일을 task `## 4-1` 밖 변경으로 보고 `Needs Review`로 멈춘다.
```

> 표기는 **기존 `/repair-milestone`의 커밋 안내 줄과 같은 형식**을 쓴다(그 파일이 이미 `ADR-047 D7 — finalize/user가 commit owner`로 인용하고 있으므로, 근거 표기를 새로 만들지 말고 그 관례를 따른다).

대상:
1. `.claude/skills/stabilize-milestone/SKILL.md` — 단계 8 최종 출력 목록의 `- QA_FINDINGS / IMPROVEMENT_GUIDE 갱신 위치` 줄 다음. **tracked 파일 목록에는 `QA_FINDINGS.md`·`IMPROVEMENT_GUIDE.md`·마일스톤 문서(`## 8` 회고)·`DECISION_REGISTER.md`(등재 시)를 나열한다.**
2. `.claude/skills/seal-milestone/SKILL.md` — 최종 출력 목록 끝. **tracked 파일 목록에는 승격한 task·feature·milestone 문서 전부 + 조건 3-b의 `해석 확정:`을 기록한 task 문서를 나열한다**(status 값과 `## 10` 봉인 기록이 커밋돼야 봉인이 영속된다). **`해석 확정:`을 반드시 포함시킨다** — 그 skill의 write 대상은 «상태값 + `## 10` receipt + `해석 확정:`» 셋이고, `해석 확정:`은 **BLOCKED이어도 유지**되므로(그 파일 책임 경계) 승격 문서만 나열하면 BLOCKED 라운드에서 실제 변경이 목록에서 사라져 사용자가 커밋하지 못하고 다음 실행이 같은 질문을 반복한다.
3. `.claude/skills/repair-plan/SKILL.md` — 최종 출력 목록 끝.
4. `.claude/skills/repair-discovery/SKILL.md` — **이 파일의 `마지막 출력:`은 불릿 목록이 아니라 슬래시로 이어 쓴 1줄이다.** 목록으로 바꾸지 말고 그 줄 **다음 줄**에 위 2줄을 불릿으로 추가한다.

> **파일별 형식 편차 주의**: `seal-milestone`은 `## 마지막 출력` 헤딩 + 코드펜스 「다음 단계」 블록으로 끝난다 — 코드펜스 *안*에 넣지 말고 그 블록 **앞**의 출력 항목 영역에 추가한다. 각 파일의 기존 형식(불릿/1줄/코드펜스)을 그대로 유지하면서 내용만 얹는다.

### 11-2. open finding 통합 스냅샷 (출력)

`.claude/skills/stabilize-milestone/SKILL.md` 단계 7-T의 집계 항목에 아래 한 줄을 추가한다.

**삽입 위치** — 집계 항목의 아래 줄 **바로 다음**(그 다음 줄인 `- Cross-stabilize 회귀 신호: …` 앞).
```markdown
- Findings 분포: P0 X / P1 Y / P2 Z (본 milestone 헤더 산하)
```

**삽입할 내용**:
```markdown
- **Open 전체 스냅샷** — 세 수를 **정의대로** 센다(겹치지 않게 한다).
  - **N** = `QA_FINDINGS.md`의 **본 마일스톤 헤더(`## M-N`)** 아래 미해소 항목 수(P0 a / P1 b / P2 c)
  - **M** = `IMPROVEMENT_GUIDE.md`의 **본 마일스톤 그룹(`### M-N`)** 안 미해소 항목 수(P0 d / P1 e / P2 f). `## 5. Repair decision log`는 closed records라 제외.
  - **K** = **다른(이전) 마일스톤** 헤더·그룹의 미해소 P0/P1 수 = carry-over
  - **합계 = N + M + K**. 형식: `Open 전체: QA_FINDINGS N + IMPROVEMENT_GUIDE M + carry-over(P0/P1) K = (N+M+K)건` — **carry-over에 `(P0/P1)`을 붙여 출력한다**. N·M은 전 severity인데 K는 P0/P1만 세므로(다른 마일스톤 항목은 색인 스캔 대상 — `/repair-milestone` 회수 규율과 동형), 표기하지 않으면 `## 8. 회고`에 영속되는 수치를 읽는 사람이 기준을 오독한다.
  - **두 원장을 각각 읽어야만 알 수 있는 수이므로 한 줄로 합산해 남긴다**(한쪽만 읽고 남은 항목 수를 오독한 사례가 관측됨). 같은 값을 milestone `## 8. 회고`의 `open 항목 스냅샷:` 줄에도 기록한다(ADR-067 D2).
```

그리고 같은 파일의 Telemetry 출력 예시 블록에 한 줄을 추가한다.

**기존**:
```
- Findings: P0 0 / P1 3 / P2 7
- Cross-stabilize 회귀 신호: 0건
```

**수정**:
```
- Findings: P0 0 / P1 3 / P2 7
- Open 전체: QA_FINDINGS 4 + IMPROVEMENT_GUIDE 6 + carry-over(P0/P1) 1 = 11건
- Cross-stabilize 회귀 신호: 0건
```

### 11-3. pattern-scan 회수 계약

`.claude/skills/stabilize-milestone/SKILL.md` §1.0 deterministic pre-flight의 **항목 3 다음**에 새 항목을 넣고, 이후 항목 번호를 그대로 둔다(번호 재정렬 대신 `3-1`을 쓴다).

```markdown
3-1. **pattern-scan 범위 밖 잔존 회수 (deterministic)**: 본 마일스톤 산하 task 문서 `## 8`에서 **HTML 주석 밖의** `- pattern-scan` 줄을 회수해 `범위 밖 M건`이 1 이상인 항목을 모은다. 발견 시 IMPROVEMENT_GUIDE에 아래 스키마로 기록(WORKFLOW 4-A 면제 기록을 stabilize가 회수하는 것과 동형).
     - **ID는 안정적으로 만든다** — `<task-id>-pspread-<패턴 슬러그>` (예: `T-004-pspread-null-guard`). 항목 형식: `- **<ID>** | P1 | [관측됨] | linked: <task-id> | status: open` + 하위 줄 `- [Pattern-spread] <패턴> — 범위 밖 M건 미수정: <경로>`.
     - **재등재 금지(dedup)**: 그 ID가 IMPROVEMENT_GUIDE에 이미 있으면(status가 `open`이든 `resolved`든) **다시 등재하지 않는다.** `- pattern-scan` 줄은 task 문서에 영속되므로 이 규칙이 없으면 매 마일스톤 같은 P1이 재생산된다.
     - **예외 — 같은 패턴의 새 출현**: 기존 ID가 `resolved`인데 그 task `## 8`에 **경로 목록이 다른** `- pattern-scan` 줄이 새로 append됐으면(두 번째 repair 라운드가 더 찾은 경우) `-2`·`-3` suffix를 붙인 새 ID로 등재한다. 판별 기준은 *경로 목록의 차이*이며, 같으면 재등재하지 않는다.
     - 후속은 `/repair-milestone`(cross-cutting) 또는 다음 마일스톤 후보로 라우팅한다. 잔존이 0건이거나 전부 기존 ID면 침묵한다.
```

그리고 `.claude/skills/repair-milestone/SKILL.md`의 `반드시 먼저 할 일:` 3번 다음에 추가한다.

```markdown
3-1. `IMPROVEMENT_GUIDE.md`의 `P1 [Pattern-spread]` 항목을 회수한다 — 이는 `/repair-workitem`·`/repair-acceptance`가 task 범위 밖이라 고치지 못한 **동일 패턴의 다른 출현**이다. cross-cutting 결함으로 취급해 4-판정 후 직접 수정하거나(범위 내), 새 범위면 사용자 보고 + 다음 M 후보로 남긴다. 해소하면 그 ID의 `status`를 `resolved`로 토글한다(수행 5와 동일 경로 — 그러면 stabilize가 재등재하지 않는다).
3-2. **`(수용)` 태그 항목은 본 skill의 수정 대상이 아니다 (ADR-066 D5)**: `QA_FINDINGS.md`·`IMPROVEMENT_GUIDE.md`에서 `(수용)` 태그가 붙은 항목은 **사용자 관측이 우선 authority**이므로 `/repair-acceptance`가 처리한다. 본 skill은 그 항목을 4-판정하지 않고, `/repair-acceptance`가 이미 해소한 항목이면 `status: resolved` 토글만 수행한다(미해소면 그대로 두고 출력에 `수용 finding 미처리 — /repair-acceptance <M> 필요` 한 줄).
```

### 11-4. fresh checkout 재검증 순서 문구

`docs/00-meta/WORKFLOW.md`의 Note를 확장한다.

**기존**:
```markdown
> Note: validation report(`docs/40-validation/reports/<task-id>.md`)는 `.gitignore`된 **checkout-local 임시 파일**이다(커밋되지 않음). 따라서 `/validate-workitem`과 `/finalize-workitem`은 **같은 worktree/checkout**에서 연속 실행해야 한다 — 다른 worktree에서 나눠 실행하면 finalize가 report를 못 찾아 `Needs Validation`으로 종료한다.
```

**수정**:
```markdown
> Note: validation report(`docs/40-validation/reports/<task-id>.md`)는 `.gitignore`된 **checkout-local 임시 파일**이다(커밋되지 않음). 따라서 `/validate-workitem`과 `/finalize-workitem`은 **같은 worktree/checkout**에서 연속 실행해야 한다 — 다른 worktree에서 나눠 실행하면 finalize가 report를 못 찾아 `Needs Validation`으로 종료한다.
> **새 체크아웃·다른 worktree에서 마일스톤을 재검증할 때**: 졸업 item 4(AC 충족 100%)는 report를 읽으므로 report가 없으면 전 task가 미충족으로 나온다. 이는 결함이 아니라 ephemeral 설계의 정상 귀결이다. 재검증 순서는 **① 각 task `/validate-workitem` 재실행(report 생성) → ② `/stabilize-milestone` 실행**이다. `/stabilize-milestone`만 재실행하면 item 4가 전 task 미충족을 낸다.
```

### 11-5. `docs/40-validation/IMPROVEMENT_GUIDE.md` — writer 목록 갱신

**기존** (`## 5. Repair decision log` 도입 문장):
```markdown
`/repair-plan`(plan 단계 feature/milestone 결정) 또는 `/repair-milestone`(stabilize 후 milestone-level finding 수정 결정)이 호출됐을 때 본 라운드의 P0+P1 결정을 영속 기록하는 자리
```

**수정**:
```markdown
`/repair-plan`(plan 단계 feature/milestone 결정) · `/repair-milestone`(stabilize 후 milestone-level finding 수정 결정) · `/repair-acceptance`(사용자 수용 finding 수정 결정 — ADR-066 D4, ID `<M>-uat-<N>`, `affected: T-NNN` 필수)가 호출됐을 때 본 라운드의 P0+P1 결정을 영속 기록하는 자리
```

같은 파일 아래쪽 HTML 주석의 *"`/repair-plan` 또는 `/repair-milestone`만 직접 append"* 문구에도 `/repair-acceptance`를 추가한다(그 주석이 writer 목록의 두 번째 사본이다). **같은 주석의 «`### M1` 그룹 *첫 호출 시* 자동 신설» 문구에도 `/repair-acceptance`를 넣는다** — `/repair-acceptance`는 `### M-N` 그룹이 없으면 직접 신설하므로(그 skill 수행 7), 생성자 목록을 둘로 두면 같은 주석 안에서 append 권한과 생성 권한이 어긋난다.

### 11-6. `/repair-milestone` 배선 (ADR-065 D3 writer + report 무효화) — **빠뜨리면 낡은 `Pass`로 졸업한다**

`/repair-milestone`은 cross-cutting 파일을 **직접 수정**한다. 그 파일들은 어느 task의 `## 4-1`에도 없으므로 졸업 item 4 (d)의 mtime 비교에 걸리지 않는다. 그래서 이 skill이 스스로 영향 task의 report를 무효화해야 한다.

`.claude/skills/repair-milestone/SKILL.md` `수행:` 의 **`2. 라우팅 …` 항목이 끝난 뒤**(그 항목의 하위 불릿 3종 — doc-consistency / e2e wiring / architecture debt — 이 모두 끝나고 `3.` 앞) 아래 두 단계를 삽입한다. 기존 `3.` 이후 번호는 그대로 두고 `2-A`·`2-B`를 쓴다.

```markdown
2-A. **영향 task report 무효화 (ADR-067 D1 item 4 (d) 보완)**: 본 라운드의 cross-cutting 직접 수정이 어떤 task의 **산출물 동작 또는 validate 입력 계약**(ARCH `## 7-x` 인터페이스 결정·FAC↔AC 매핑·DESIGN 계약 등 — report의 축 판정이 그 문서를 근거로 산출된다)을 바꿨으면, 그 task의 `docs/40-validation/reports/<task-id>.md`를 **삭제한다**(`/repair-workitem`의 report 삭제 규율과 동형 — **삭제 전 `삭제 예정: <경로>` echo 강제**, 경로를 미리 회수해 하나씩 `rm`). 수정 파일이 `## 4-1`에 없어 mtime 비교로는 잡히지 않으므로, report 부재(=졸업 item 4 미충족)로 만들어 **재validate를 강제**하는 것이 유일한 경로다. 마지막 출력에 삭제한 report 목록과 `/validate-workitem <task-id>` 재실행 안내를 남긴다.

2-B. **AC acceptance 무효화 (ADR-065 D3 — writer 3종 중 하나)**: 그 수정이 어떤 AC의 동작 경로를 건드렸고 그 AC의 modality가 `[사용자 관측]`·`[플랫폼 관측]`이면 그 task `## 8`에 `- invalidated <날짜> <AC-N>: repair-milestone cross-cutting 수정으로 재확인 필요`를 append한다(기존 `- ac-acceptance`는 지우지 않는다 — 이력이다). **새 receipt를 대신 쓰지 않는다**(사용자 authority).
```

같은 파일 `마지막 출력:` 목록에 두 줄을 추가한다.

```markdown
- 삭제한 report (ADR-067 D1 item 4 (d)): <task-id 목록> — 각 task `/validate-workitem` 재실행 필요 / 해당없음
- AC acceptance 무효화 (ADR-065 D3): N건(AC-N 목록) / 해당없음 — **무효화가 1건 이상이면 순서는 «각 task `/validate-workitem` 재실행 → 그 AC가 `Needs Acceptance`면 `/accept-milestone --task <task-id>`로 receipt 재발급 → 다시 재validate → 그 뒤 stabilize»** 다(receipt 없이 stabilize를 돌리면 item 4 (a)가 그 task를 미충족으로 내어 라운드가 한 번 헛돈다)
```

**커밋**: `feat(skills): standardize commit ownership output, open snapshot, pattern-scan recovery, and cross-cutting report invalidation`

---

## Phase 12 — 로스터·lifecycle 문서 동기

이 Phase를 빠뜨리면 `/stabilize-milestone` §1.0 항목 7(Skill 로스터 fan-out 정합)이 `[Roster-drift]` P1을 낸다.

### 12-1. `docs/00-meta/STRUCTURE.md` — 로스터 2곳

**(a) Claude skill 본문 행**

**기존**: `` `.claude/skills/<name>/SKILL.md` (23종 — bootstrap-project/…/consult-expert) ``
**수정**: 종 수를 **25종**으로 바꾸고 괄호 목록 끝에 `/accept-milestone/repair-acceptance`를 추가한다.

**(b) Codex skill wrapper 행** — 괄호 안 설명은 그대로 두고, wrapper가 18종 → 20종이 된 사실이 목록에 반영되도록 `.agents/skills/<name>/` 설명을 유지한다(수치가 적혀 있지 않으면 수정 불요).

**(c) 산출물 표에 2행 추가** — `stabilize review` 행 다음에 넣는다.
```
| acceptance review (수용 세션 원본) | `docs/40-validation/acceptance-reviews/<M>.r<N>.md` | `/accept-milestone` (마일스톤 스코프) | ephemeral | generated |
| 수용 기록 (acceptance receipt) | milestone 문서 `## 11. 수용 기록` | `/accept-milestone` (마일스톤 스코프 단독) | Record | conditional |
```

**(d) 기존 3행의 `생성 주체` 칸 갱신** — 새 skill도 이 파일들을 쓰므로 단독 표기를 고친다.
- `qa findings` 행: `/stabilize-milestone` → `/stabilize-milestone` · `/accept-milestone`(수용 결함 — `(수용)` 태그) · `/repair-acceptance`(status 토글)
- `improvement guide` 행: `/stabilize-milestone` → `/stabilize-milestone` · `/repair-plan`·`/repair-milestone`·`/repair-acceptance`(`## 5` decision log) · `/accept-milestone`(개선 제안)
- `decision register` 행: 기존 writer 목록 끝에 ` · /accept-milestone`·`/repair-acceptance`(수용 라운드 `Out-of-contract` 등재 — ADR-060 D11)를 덧붙인다

### 12-2. `docs/00-meta/WORKFLOW.md` — lifecycle + 단계

**(a) 워크아이템 라이프사이클 그림**

**기존**:
```
   → implement → validate ─┬─Pass─→ finalize → stabilize(+UI: 경험 게이트)
                           └─Needs Fix─→ repair → (validate 재실행)
(opt-in, ADR-054) stabilize → validate-milestone (별 세션) → repair-milestone (원본 세션)
```

**수정**:
```
   → implement → validate ─┬─Pass─→ finalize → stabilize(+UI: 경험 게이트)
                           ├─Needs Fix─→ repair → (validate 재실행)
                           └─Needs Acceptance─→ accept-milestone --task T-NNN (사용자 receipt) → (validate 재실행)
(opt-in, ADR-054) stabilize → validate-milestone (별 세션) → repair-milestone (원본 세션)
(권장, ADR-066)  stabilize → accept-milestone <M> (사람 직접 확인) ─┬─승인─→ (영향 task validate 재실행) → stabilize 재실행 → 졸업
                                                                  └─보류─→ repair-acceptance → validate 재실행 → accept-milestone 재실행
```

**(b) 새 절 추가** — `## 5. 마일스톤 안정화` 섹션의 **본문 끝**(다운스트림 마이그레이션 단락 다음), `## 6. 의사결정 기록` **앞**에 넣는다.

```markdown
## 5-1. 사용자 수용 (권장 — ADR-066)
- `/accept-milestone <M>`으로 사람이 직접 실행·확인한다. 환경을 띄우고 확인할 시나리오를 안내하고 피드백을 3갈래(결함=QA_FINDINGS / 계약 변경=DECISION_REGISTER+다음 M / 개선=IMPROVEMENT_GUIDE)로 라우팅한다.
- **졸업 필수 조건이 아니다.** 단 task `## 6-1`에서 AC를 `[사용자 관측]`·`[플랫폼 관측]`으로 지정했으면 그 receipt 없이 졸업 item 4를 충족하지 못한다(ADR-065 D1).
- **task 스코프는 inner-loop 안에 있다** — `/validate-workitem`이 그 AC를 미충족으로 내면(`Needs Acceptance`) `/accept-milestone --task <task-id>`로 receipt를 발급하고 `/validate-workitem`을 재실행한 뒤 `finalize`한다. 이 경로는 마일스톤 라운드 카운터·`## 11`을 쓰지 않는다. **이 분리가 없으면 «receipt 없어 finalize 불가 → task done 불가 → stabilize 진입 불가 → receipt 발급 불가» 순환이 생긴다.**
- **수용 라운드가 코드나 receipt를 바꿨으면 영향 task의 `/validate-workitem`을 재실행한 뒤** stabilize를 돌린다 — 졸업 item 4는 report를 읽고 stale report를 미충족 처리한다(ADR-067 D1 item 4 (d)).
- 결함이 있으면 `/repair-acceptance <M>`이 3+1 판정으로 수리한다 — **기존 task를 재개방하지 않고 코드만 고치며**, 추적성은 결정 이력의 `affected: T-NNN`으로 확보한다. 수리 후에는 위 규칙대로 «영향 task 재validate → `/accept-milestone` 재실행 → (승인 시) 다시 재validate → `/stabilize-milestone`» 순으로 진행한다. **`## 8`이 바뀔 때마다 재validate가 한 번씩 들어간다** — 각 skill의 마지막 출력이 그 목록을 준다.
- 라운드 상한 3회. 초과분은 사용자 확인 후 다음 마일스톤으로 이관한다.
```

### 12-3. `docs/00-meta/DELEGATION_STRATEGY.md`

**(a) 위임 트리거 표** — `stabilize cross-review 결과 회수 + 종합` 행 다음에 2행 추가.
```
| 마일스톤 결과의 사용자 직접 확인 (권장) | 메인 세션 (accept-milestone) | `/accept-milestone <M>`. 환경 기동 + 시나리오 안내 + 피드백 3갈래 라우팅. 코드·커밋 X. `- ac-acceptance` receipt는 사용자 응답을 옮겨 적는다(대행 발급 금지 — ADR-065 D1 / ADR-066) |
| task AC의 사용자·플랫폼 관측 receipt 발급 | 메인 세션 (accept-milestone `--task`) | `/accept-milestone --task <task-id>`. `/validate-workitem`이 `Needs Acceptance`로 낸 그 task의 관측 AC만 확인·발급하고 `/validate-workitem` 재실행을 안내한다. 라운드 카운터·`## 11`·마일스톤 원장을 쓰지 않는다 (ADR-066 D1) |
| 사용자 수용 finding 수리 | 메인 세션 (repair-acceptance) | `/repair-acceptance <M>`. 3+1 판정(Reject-FP 없음 — 사용자 관측은 기각 대상 아님), 회귀 테스트 선행, 기존 task 재개방 X, 커밋 X (ADR-066 D4) |
```

**(b) 스킬 실행 순서 가이드** — `5.` 항목 다음과 `8.` 항목 다음에 각각 추가한다.

`5.`(validate) 다음:
```
5.5. (`Needs Acceptance`일 때만) `/accept-milestone --task T-NNN` — 그 task의 `[사용자 관측]`·`[플랫폼 관측]` AC receipt를 사용자가 발급 → `/validate-workitem T-NNN` 재실행 → 7(finalize). 라운드 카운터·`## 11` 미소모 (ADR-066 D1).
```

`8.`(stabilize) 다음:
```
8.5. (권장) `/accept-milestone M-N` — 사람이 직접 실행·확인. 승인 시 8.7로(단 **`(수용)` 태그로 이번 M 수리를 택한 개선 제안이 있으면 8.6을 먼저** — 그 항목의 유일한 실행 경로다, ADR-066 D5), 보류 시 8.6으로 (ADR-066).
8.6. (보류 시 · 또는 위 `(수용)` 개선 항목이 있을 때) `/repair-acceptance M-N` → 영향 task `/validate-workitem` 재실행 → `/accept-milestone M-N` 재실행. 라운드 상한 3.
8.7. `/stabilize-milestone M-N` 재실행 — 수용 라운드의 코드·receipt 변경을 재검증하고 졸업 판정을 확정한다. **`## 8`을 갱신한 task가 있으면 그 task의 `/validate-workitem`이 선행돼야 한다**(졸업 item 4가 report를 읽고 stale을 미충족 처리 — ADR-067 D1 item 4 (d)).
```

### 12-4. `README.md` / `README_ko.md` — wrapper 목록 4곳

두 파일의 `$-prefixed` 나열과 실행 순서 예시 줄에 새 skill 2개를 추가한다.

- `README.md` 2번 항목의 wrapper 나열 끝(`$consult-expert` 다음)에 `, $accept-milestone, $repair-acceptance`를 추가한다. **자연어 호출 목록(`discover-product, review-doc, boilerplate-context, bootstrap-design, research-pack`)은 건드리지 않는다** — wrapper를 만들었으므로 그 목록에 들어가면 로스터 검사가 불일치를 낸다.
- `README.md`의 `- Planning / bootstrap / seal / stabilize:` 줄 끝에 `, \`$accept-milestone M1\`, \`$repair-acceptance M1\``를 추가한다.
- `README_ko.md`의 대응 2곳에 같은 내용을 한국어 문맥으로 추가한다 — ① *"핵심 workflow skill은 Codex wrapper($-prefixed)로 제공: …$consult-expert."* 나열 끝, ② *"- Planning / bootstrap / seal / stabilize:"* 실행 예시 줄 끝. **줄 번호가 아니라 이 문구로 찾는다**(앞 Phase의 편집으로 줄이 밀린다).

**커밋**: `docs: sync skill roster, lifecycle, and delegation for acceptance stage`

---

## Phase 13 — 최종 정합 검증

아래를 순서대로 실행하고 **모든 항목이 기대값과 같아야 한다.** 다르면 해당 Phase로 돌아가 고친다.

```bash
# 1) 실행 경로(skill·wrapper·meta·템플릿)에 ADR-014 인용이 남지 않았는가 — 분류 1 완결 확인
grep -rn "ADR-014" --include="*.md" .claude .agents docs/00-meta docs/30-workitems
#    기대: 출력 없음

# 2) 죽은 앵커(ADR-067에 없는 #amend-N)를 가리키는 지시문이 없는가
#    ADR-052 · ADR-066 · ADR-067의 인용은 분류 2(역사적 서술)로 의도 보존이므로 제외한다
#    — ADR-066 `## 근거` / ADR-067 `## 대체`는 본 가이드가 직접 쓰게 한 문장이다(상세: Phase 3-C 검증 (2))
grep -rn "ADR-014#" --include="*.md" --exclude=IMPROVE-GUIDE.md . \
  | grep -v SIMULATION_RUN | grep -v ADR-014-milestone | grep -v ADR-052- | grep -v "boilerplate/README.md" \
  | grep -v "boilerplate/ADR-066-" | grep -v "boilerplate/ADR-067-"
#    기대: 출력 없음

# 3) 새 ADR 3개가 인덱스에 등재됐는가
grep -c "^| 06[567] " docs/90-decisions/boilerplate/README.md
#    기대: 3

# 4) 새 ADR의 Surfaces에 적힌 파일이 모두 실재하는가
for a in 065 066 067; do
  f=$(ls docs/90-decisions/boilerplate/ADR-$a-*.md)
  awk '/^## Surfaces/{s=1;next}/^## /{s=0}s&&/^- /{print $2}' "$f" | while read -r p; do
    [ -e "$p" ] || echo "MISSING($a): $p"
  done
done
#    기대: 출력 없음

# 5) 새 ADR을 역참조하는가 (Surfaces backref 검사 통과 조건)
for a in 065 066 067; do
  f=$(ls docs/90-decisions/boilerplate/ADR-$a-*.md)
  awk '/^## Surfaces/{s=1;next}/^## /{s=0}s&&/^- /{print $2}' "$f" | while read -r p; do
    grep -q "ADR-$a" "$p" || echo "NO-BACKREF($a): $p"
  done
done
#    기대: 출력 없음

# 6) skill 로스터 일치
ls .claude/skills | wc -l          # 기대: 25
ls .agents/skills | wc -l          # 기대: 20
grep -c "accept-milestone" docs/00-meta/STRUCTURE.md    # 기대: 1 이상
grep -c "accept-milestone" README.md README_ko.md       # 기대: 각 1 이상

# 7) 구 용어 잔존 확인
#    예외 3파일: SIMULATION_RUN(기록) · ADR-014(superseded) · ADR-065(배경이 "무엇이 바뀌었는가"를 설명하려고 구 섹션명을 인용)
#    첫 대안은 `AC ↔ 테스트 매핑`으로 좁혀 둔다 — 넓게 잡으면 ADR-047 D6의 `ADR-009 (AC ↔ 테스트 식별자)`가
#    오검출된다(그 괄호는 테스트 이름 식별자 컨벤션이며 대상이 아니다 — 6-9 예외 참조). 검출력 손실은 없다.
grep -rn "AC ↔ 테스트 매핑\|AC↔테스트\|AC 매핑 100%" --include="*.md" . \
  | grep -v SIMULATION_RUN | grep -v ADR-014-milestone | grep -v ADR-065- | grep -v IMPROVE-GUIDE
#    기대: 출력 없음 (6-9의 전수 교체가 끝났다는 뜻)

# 8) opt-out 예외가 제거됐는가
grep -n "opt-out" .claude/skills/finalize-workitem/SKILL.md
#    기대: "예외가 아니다" 문구가 있고 "는 예외 —" 형태의 면제 문구가 없다

# 8b) 교착 방지 배선 3점 — 하나라도 빠지면 사용자 관측 AC가 순환에 빠진다
grep -c "Needs Acceptance" .claude/skills/finalize-workitem/SKILL.md      # 기대: 1 이상
grep -c -- "--task" .claude/skills/accept-milestone/SKILL.md              # 기대: 1 이상 (task 스코프 모드)
grep -c "accept-milestone" .claude/skills/validate-workitem/SKILL.md      # 기대: 1 이상 (report 다음 액션)
grep -c "accept-milestone" .claude/skills/stabilize-milestone/SKILL.md    # 기대: 2 이상 (§3-V (d) + 단계 8)

# 8c) stale report 졸업 차단 — 4점 배선
grep -c "validate-workitem" .claude/skills/repair-acceptance/SKILL.md    # 기대: 1 이상 (재validate 처방)
grep -n "stale" .claude/skills/stabilize-milestone/SKILL.md              # 기대: item 4 (d) 줄이 나온다
grep -c "삭제 예정" .claude/skills/repair-milestone/SKILL.md              # 기대: 1 이상 (cross-cutting report 무효화 — 11-6)
grep -c "삭제 예정" .claude/skills/repair-acceptance/SKILL.md             # 기대: 2 이상 (report 삭제 + 세션 파일 삭제)

# 9) acceptance-reviews 디렉터리와 ignore 패턴
git check-ignore -v docs/40-validation/acceptance-reviews/M1.r1.md   # 기대: 패턴 매치 출력
ls docs/40-validation/acceptance-reviews/.gitkeep                    # 기대: 파일 존재
#    (.gitkeep을 커밋한 뒤에는 git status에 나타나지 않는다 — status로 확인하지 말 것)

# 10) 문서 링크 유효성 (이미 설치돼 있을 때만 — `--no-install`로 자동 다운로드를 막는다)
npx --no-install markdown-link-check --config <(echo '{"ignorePatterns":[{"pattern":"^https?://"}]}') docs/90-decisions/boilerplate/ADR-065-ac-verification-contract.md docs/90-decisions/boilerplate/ADR-066-milestone-acceptance.md docs/90-decisions/boilerplate/ADR-067-milestone-graduation-v2.md
```

Windows PowerShell에서 4번(경로 실재)만 대체할 수 있다. **5번(backref)·10번(링크)은 이 명령으로 대체되지 않는다** — Git Bash나 WSL에서 4·5·10을 돌린다.
```powershell
# 4번 대체 전용 — Surfaces에 적힌 경로가 실재하는지만 본다
Select-String -Path docs/90-decisions/boilerplate/ADR-06*.md -Pattern '^- \S+\.md' | ForEach-Object { ($_ -split '\s+')[1] } | Sort-Object -Unique | Where-Object { -not (Test-Path $_) }
```

> **범위 밖**: 이 검증은 **이번 라운드가 만든 것**만 본다. 기존 ADR의 Surfaces backref 누락·기존 문서의 링크 오류는 본 라운드 대상이 아니다(발견하면 별도 `[Surface-backref]`·`[Doc-link]` finding으로 남기고 여기서 고치지 않는다).

**커밋**: 이 Phase는 검증만 수행하므로 **변경이 없으면 커밋하지 않는다.** 검증에서 고친 것이 있으면 `fix: correct cross-document inconsistencies found in verification`으로 커밋한다.

---

## 부록 — 커밋 순서 요약

```
Phase 1  docs(adr): add ADR-065 AC verification contract
Phase 2  docs(adr): add ADR-066 milestone acceptance stage
Phase 3  docs(adr): reissue ADR-014 as ADR-067 and repoint live citations
Phase 4  docs(adr): add ADR-009 amendment 2 clarifying opt-out scope
Phase 5  docs(templates): add AC modality, acceptance receipt, and open snapshot fields
Phase 6  feat(inner-loop): wire AC verification modality through plan/implement/validate/finalize/repair
Phase 7  feat(validate,stabilize): forbid silent pass on unavailable audit axes
Phase 8  feat(skills): add accept-milestone and repair-acceptance stages
Phase 9  fix(stack-guard): forbid vacuous early-return skips in visual-QA specs
Phase 10 feat(stabilize): wire acceptance stage into experience gate and next-step output
Phase 11 feat(skills): standardize commit ownership output, open snapshot, pattern-scan recovery, and cross-cutting report invalidation
Phase 12 docs: sync skill roster, lifecycle, and delegation for acceptance stage
Phase 13 (검증 전용 — 변경 없으면 커밋 없음)
```

## 부록 — 순서 의존 근거

- **1·2 → 3**: ADR-067 본문이 ADR-065(item 4 기준)·ADR-066(D6 관계)을 링크한다. 먼저 만들지 않으면 dangling link가 된다.
- **3 → 5·6·7·10**: 템플릿·skill이 `ADR-067`을 인용하고, Phase 7의 «미완이면 통과 불가»는 ADR-067 D3의 평가 규칙이 근거다. 그 파일이 먼저 존재해야 한다.
- **4 → 6**: `finalize`의 opt-out 예외 제거는 ADR-009 `## Amendment 2`가 범위를 명문화한 뒤여야 근거가 생긴다.
- **5 → 6**: skill 본문이 `## 6-1` modality 표기 형식과 `## 8` receipt 형식을 SSOT로 인용한다.
- **6 → 7**: 두 Phase가 `validate-workitem/SKILL.md`의 인접 영역을 고친다. modality 판정을 먼저 넣고 그 위에 감사 미완 규율을 얹는다.
- **6 → 8**: `/accept-milestone`의 task 스코프가 `## 6-1` modality와 report 판정을 읽고, `finalize`의 `Needs Acceptance` 라우팅이 그 skill을 가리킨다(6에서 그 문구를 넣는다).
- **8 → 10**: Phase 10이 stabilize 본문에서 `/accept-milestone`을 호출하므로 그 skill 파일이 먼저 실재해야 한다(Phase 13 #4 경로 실재 검사 대상).
- **8 → 12**: 로스터 동기는 skill·wrapper 파일이 실재한 뒤에만 검증 가능하다.
- **9는 독립** — 다른 Phase와 파일이 거의 겹치지 않는다. 단 9-2b가 stabilize §1.0을 건드리므로 Phase 11의 3-1(같은 §1.0)과 **줄이 겹치지 않게** 각각 다른 항목에 넣는다(9-2b는 항목 8의 (e), 11-3은 항목 3-1).
- **11 → 12 → 13**: 11이 출력 계약을, 12가 로스터·lifecycle을 맞춘 뒤 13이 전수 검증한다. 12를 마지막 편집으로 두면 13의 로스터 검사가 한 번에 통과한다.
