# Flutter/모바일 프로파일 도입 — 개선 실행 가이드

## 0. 시작 전

### 0-1. 작업 브랜치 생성

```bash
git checkout -b feat/flutter-mobile-profile
git status --porcelain    # 이 가이드 파일 한 줄(`?? IMPROVE-GUIDE.md`) 외에 0건이어야 함
```

이 가이드 자체가 untracked 상태로 존재하므로 출력이 완전히 비지는 않는다. 그 한 줄 외에 다른 변경이 없으면 시작해도 된다.

**커밋 방식**: 각 단계 끝에 `git add ...` 와 커밋 메시지 한 줄이 있다. **한 단계 = 한 커밋**이며 실제 `git commit` 은 사용자가 수행한다. 여러 단계를 스테이징만 하고 몰아서 커밋하면 논리 단위가 깨지므로, 단계를 넘기기 전에 그 단계의 커밋을 마친다.

**amendment 제목의 날짜**: 이 가이드의 amendment 제목은 `## Amendment N — <제목>` 형태로만 써 두었다. 저장소의 최근 관례는 여기에 **적용 날짜**를 넣는 것이므로(`## Amendment 7 (2026-07-26) — ...`), 파일에 붙일 때 **실제 작업하는 날짜**로 채운다. 가이드에 박힌 날짜를 그대로 옮기지 않는다 — 이 가이드에는 날짜를 넣지 않았다.

> **[실측 경고] 이 항목은 단계 1~3에서 4번 연속 누락됐다**(ADR-052#1·ADR-014#4·ADR-031#1·ADR-027#8 — 모두 사후 수정). 원인은 아래 amendment 블록들이 코드펜스 안에 있어 *그대로 복사*되기 때문이다. 그래서 **날짜를 넣어야 하는 지점마다 그 자리에 재고지**해 두었고(5-10(a)·5-10(b)), **11-6이 이번 라운드 amendment 6건의 날짜를 기계적으로 검사**한다. 붙여 넣은 직후 제목 줄을 다시 보고 날짜를 채우는 것을 습관으로 삼는다.

### 0-2. 웹 무회귀 기준선 확보 (반드시 수정 전에)

이 저장소를 고치고 나면 "고치기 전 수치"를 만들 수 없다. 지금 떠 둔다.

```bash
# 기존 웹 dogfood 프로젝트에서
cd C:/tmp/dogfood-ui-todo
npm run validate            # 1회 warm-up (기록 제외)
for i in 1 2 3 4 5; do
  s=$(date +%s%3N); npm run validate >/dev/null 2>&1; e=$(date +%s%3N); echo "run$i: $((e-s))ms"
done
```

기록해 둘 것: 5회 소요 시간의 median, exit code.
(직전 실측 median: **9,056ms / exit 0**. 크게 다르면 환경 차이이므로 그 값을 새 기준선으로 쓴다.)

지시문 분량도 함께 기록한다. 개선 후 웹 프로젝트가 읽는 양이 늘지 않았는지 비교할 근거다.

```bash
cd C:/Users/kbwdesktop/Desktop/dev/agentic-dev-harness
wc -l AGENTS.md CLAUDE.md
cat .claude/skills/*/SKILL.md | wc -l
cat docs/00-meta/*.md | wc -l
```

직전 실측: AGENTS.md **55**줄 / skills 전체 **2,382**줄 / docs/00-meta **692**줄.

### 0-3. 이 개선의 전제 (결정된 사항)

| 항목 | 결정 |
|---|---|
| 대상 플랫폼 | **Android + iOS**. Flutter web/desktop은 대상 아님 |
| 웹 프로젝트 | 기존 경로 유지. **동작·성능 무회귀가 최우선 제약** |
| 통합 검증 실행 껍데기 | **npm** (종료코드 0/1/2를 보존하는 유일한 선택지) |
| golden(픽셀 비교) | 도입. 정답 사진은 **커밋하지 않음(로컬 전용)**, `validate`에 포함 |
| 색상 하드코딩 검출 | grep 방식, **기록만**(진행 차단 안 함) |
| Flutter 지시 위치 | 새 파일 없음. ADR-059(정책) / ARCH `## 7-5`(결정 자리) / STACK_SETUP_PLAN(실행 정보) / skill 인라인(기계 목록) |
| 지원 OS | Windows + macOS. Linux는 대상 아님 |

### 0-4. 웹·API·CLI 프로젝트에 실제로 달라지는 것 (무회귀 계약)

이 개선의 최우선 제약은 **기존 스택의 동작·성능 무회귀**다. 아래가 그 전체 목록이며, 여기 없는 것은 달라지지 않아야 한다. 적용 중 이 목록 밖의 변화가 보이면 그 수정을 되돌린다.

| 무엇이 | 어떻게 달라지나 | 왜 감수하나 |
|---|---|---|
| **졸업 판정 — e2e 0건 프로젝트** | 전에는 `0 spec` → PASS-with-warning → 졸업 YES. 이제 `EMPTY` → 졸업 NO | 단계 1의 목적 자체. ADR-052 D2("최소 1개 smoke")와 D3(예외)의 내부 충돌을 D2 쪽으로 해소한다. **e2e를 갖고 통과하던 프로젝트는 판정이 그대로다** |
| **졸업 판정 — 판정 입력** | 종료코드 → 구조화된 러너 출력(+ suite 경로 확인) | 종료코드 0이 "e2e가 돌았다"를 뜻하지 않는 사례가 실측됐다 |
| **프로비저닝 단계 표기** | 프로젝트 e2e가 실패할 때 표기가 `PASS (wiring OK)` → `FAIL(project)` 로 바뀐다 | **차단 여부는 그대로**(프로젝트 책무로 분리 보고, 종료 X). 통과가 아닌 것을 통과로 적지 않으려는 표기 정정이다 |
| **기존 프로젝트의 finding 1건** | `## E2E Smoke Registry`가 아직 없는 프로젝트는 `P1 [E2E-registry] 미등록` 이 한 줄 기록된다 | 등록되면 판정이 *더 정확해지므로* 권장은 남긴다. **P1은 졸업을 막지 않는다** — 막는 설계였다면 기존 프로젝트가 전부 차단됐다 |
| **읽는 지시문 분량** | 공용 skill에 Flutter 분기가 섞여 몇 줄 늘어난다 | 새 파일·새 디렉터리를 만들지 않기로 한 대안 선택의 대가. 상한은 11-2가 검사한다(skills 합계 +200줄 이내). STACK_SETUP_PLAN의 Dart 전용 두 절은 비-Dart 프로젝트에서 **삭제**되므로 누적되지 않는다(단계 8) |
| **`.gitignore`** | Flutter 빌드 산출물·서명 자산 패턴이 늘어난다 | 웹 프로젝트에는 매칭되는 경로가 없다(11-1(b)-3이 확인) |
| **도구 읽기 차단 목록** | 서명·인증 확장자 6종 추가 | 웹 프로젝트가 읽어야 하는 파일이 아니다 |

**달라지지 않아야 하는 것** — `validate` 구성과 소요 시간 / e2e 도구 선택(웹은 계속 Playwright) / design gate의 물질화·차단 등급 / 이미 생성된 진입점(소급 교체 없음) / lifecycle 단계와 순서 / 문서 상태 전이 / `## 7-4` 프론트 결정의 소항목 / STACK_SETUP_PLAN의 웹 관련 절.

---

# 단계 1. 전역 0-spec 결함 수정

**이 단계는 Flutter와 무관하다.** 현재 웹 프로젝트에도 존재하는 결함이며, Flutter 배선보다 먼저 고쳐야 뒤 단계가 올바른 토대 위에 얹힌다.

> **[적용 완료 2026-07-28 — 되돌리지 말 것]** 단계 1은 이미 적용됐다. 리뷰에서 **5상태가 상호배타가 아님**이 발견돼(테스트 실패가 `EMPTY`와 `FAIL(project)`에 동시 성립, registry 이름 불일치는 무상태) 아래 세 항이 가이드 원문과 **다르게** 들어갔다. 사용자 승인 사항이며 원문으로 되돌리지 않는다.
>
> 1. **`ADR-052#amend-1` 결정 3에 `판정 순서` 4단을 추가**했다(아래 1-1 블록에 반영). 이것이 **5상태 정의·순서의 유일한 SSOT**이며 단계 2의 `ADR-059 D4`가 여기에 종속된다.
> 2. **`EMPTY`의 판별자를 "성공한 테스트 0개" → "실행된 테스트 0개"** 로 교정했다(skip·러너 내부 항목 제외, 성공·실패 무관). 1-3(stack-guard)·1-5(stabilize §1.5) 블록의 해당 문구가 저장소에서는 이렇게 되어 있다.
> 3. **1-6(stabilize §3-b)은 정의를 재서술하지 않고 SSOT 포인터**로 대체했다(상태 이름·순서는 인라인 유지 — 순수 포인터는 강제성이 약해진다). 결과적으로 불릿 5개 → 3개.
>
> 1-3·1-5·1-6 블록 본문은 기록으로 남겨 두었다(저장소가 SSOT). 1-1 블록만 갱신한 이유는 그 블록이 **이후 단계가 인용하는 대상**이기 때문이다.

## 문제

`ADR-052`에 서로 충돌하는 두 조항이 있다.

- **D2**(본문 22행): *"e2e harness가 **최소 1개 smoke**로 wiring 검증(앱 부팅 + 1개 시나리오)을 통과하는지 점검한다"*
- **D3**(본문 26행): *"**단 0-spec 예외**: 미통과가 `No tests found`(0 spec)이면 real failure 아님 → PASS-with-warning"*

현재 구현은 D3를 따르므로 **e2e 테스트가 0개인 UI 마일스톤이 졸업할 수 있다.**

추가로 판정이 `"No tests found"`라는 **출력 문자열 매칭**에 의존한다. 스택마다 문구가 달라 오분류가 발생한다.

## 1-1. ADR-052에 Amendment 1 추가

**파일**: `docs/90-decisions/boilerplate/ADR-052-stack-provisioning-and-e2e-readiness.md`

**기존**: Amendment 섹션이 없다(`## 참고`가 마지막 섹션).

**수정**: 파일 맨 끝에 아래를 추가한다.

```markdown

<a id="adr-052-amend-1"></a>
## Amendment 1 — 0-spec 판정 정합화 (D2 우선, 문자열 매칭 폐기)

### 배경
- [관측됨] 본 ADR의 D2("최소 1개 smoke 통과")와 D3의 "0-spec 예외"(PASS-with-warning)가 **같은 ADR 안에서 충돌**한다. 현재 구현은 D3를 따르므로 e2e 0건인 UI 마일스톤이 졸업한다.
- [관측됨] 0-spec 판정이 `"No tests found"` **출력 문자열 매칭**에 의존한다. 스택마다 문구가 달라(예: Flutter는 다른 메시지) 정상 상태를 real failure로, 또는 그 반대로 오분류한다.
- [관측됨] 실측에서 e2e 대상 디렉터리가 *비어 있을 때* 러너가 **다른 디렉터리의 유닛 테스트를 대신 실행하고 exit 0**을 내는 경우가 확인됐다. 종료코드만으로는 "e2e가 실제로 돌았는가"를 알 수 없다.

### 결정
1. **D2 우선**: E2E-applicable 마일스톤은 **실제 실행된 e2e 테스트가 1개 이상 성공**해야 졸업한다. D3의 "0-spec = PASS-with-warning"은 **졸업 시점에는 적용하지 않는다**.
2. **단계별 5상태 분류**로 대체한다.

   | 상태 | 정의 | 처리 |
   |---|---|---|
   | `NOT_APPLICABLE` | E2E 대상 아님(비-UI ∧ graduation item 6 미선언) | 통과 |
   | `EMPTY` | 대상이지만 실행된 e2e 테스트 0개 | **stack-guard 프로비저닝 단계에서는 허용**(scaffold 직후 정상) / **졸업 시점에는 차단** — `Needs E2E Smoke` |
   | `PASS` | 선언된 e2e 경로 하위에서 1개 이상이 실제 실행·성공 | 통과 |
   | `FAIL` | 실행된 테스트가 실패, 또는 wiring 실패 | 졸업 차단. **하위 라벨 `FAIL(wiring)`/`FAIL(project)`를 구분해 기록한다** — 프로비저닝 단계에서 처리 주체가 다르기 때문이다(wiring은 stack-guard 산출물 수정, project는 프로젝트 책무로 분리 보고). 졸업 시점에는 둘 다 차단이라 구분이 판정을 바꾸지 않는다 |
   | `BLOCKED_ENV` | device/toolchain/provision 불가 | 졸업 차단(환경 복구 안내, real failure와 라벨 구분) |

3. **판정 근거는 구조화된 러너 출력**을 쓴다. 출력 문자열 매칭은 **보조 fallback**으로만 허용하고 졸업 판정의 1차 근거로 삼지 않는다. `PASS`의 필요조건은 넷이다.
   - 실행된 테스트가 러너 내부/로딩 항목이 아닐 것
   - skip이 아닐 것
   - **그 테스트가 속한 suite의 경로가 선언된 e2e 디렉터리 하위일 것** — 이 항이 위 세 번째 관측(빈 디렉터리 → 다른 디렉터리 실행 → exit 0)을 막는 지점이다
   - 러너 전체 종료 상태가 성공일 것

   여기서 **"선언된 e2e 디렉터리"는 `validate:e2e` 진입점이 실제로 대상으로 삼는 디렉터리**다(Playwright면 config의 `testDir`, Flutter면 `flutter test <디렉터리>`의 인자). 진입점에서 읽어 내며 별도 선언 자리를 새로 만들지 않는다. 진입점이 디렉터리를 특정하지 않으면 그 사실 자체가 `FAIL(wiring)`이다 — 무엇이 e2e인지 모르는 상태로는 위 판정이 성립하지 않는다.

   **판정 순서 — 아래 순서로 보고 먼저 성립하는 상태로 확정한다. 이 순서가 5상태의 상호배타를 보장하는 지점이므로, 소비 surface는 순서를 재정의하지 않고 그대로 적용한다.** 순서를 뒤집으면 기동 불가나 테스트 실패를 "테스트 없음"으로 오분류해 처방이 틀어진다(작성 vs 환경 복구 vs 수정).
   1. **러너가 기동조차 못 함** — 진입점·config 부재면 `FAIL(wiring)`, device·브라우저·대상 앱 미기동 등 환경 원인이면 `BLOCKED_ENV`.
   2. **선언된 e2e 디렉터리 하위 suite에서 실행된 테스트가 0개** → `EMPTY`. 러너 내부/로딩 항목과 skip은 실행으로 세지 않으며, **성공·실패는 구분하지 않는다**(실패한 테스트도 "실행됨"이다).
   3. **실행된 테스트는 있으나 위 필요조건을 못 채움** — 테스트 실패 / 러너 전체 종료 상태 실패 / 등록이 있는데 이름 일치 성공 테스트 없음 → `FAIL(project)`.
   4. 넷 모두 충족 → `PASS`.
4. **canonical smoke 등록은 판정을 *좁히는* 수단이다(필요조건 아님)**: `STACK_SETUP_PLAN.md`에 e2e smoke의 파일 경로·테스트 이름·실행 대상 선택 규칙·마지막 PASS 기록을 **선언된 runtime target별로 한 행씩** 적는다. 등록이 있으면 3항을 *"등록된 이름과 일치하는 테스트가 성공"* 으로 좁혀 판정하고, **등록이 없으면 이름 제약 없이 3항만 적용하고 `P1 [E2E-registry] <target> — canonical smoke 미등록` 을 기록**한다. 등록 부재 자체로 졸업을 차단하지 않는다 — 실제로 e2e를 갖고 통과하던 프로젝트를 서류 미비로 막는 것은 ADR-022 ratchet 위반이며, 3항만으로 관측된 결함은 이미 차단된다. target이 둘 이상이면 판정도 target마다 따로 나며, 한 target의 `PASS`가 다른 target을 대신하지 않는다.

### 강도 (ADR-022)
- constraint(강) — `[관측됨]`. E2E-applicable 마일스톤의 `EMPTY` 졸업 차단.
- **기존 프로젝트 무회귀 확인**: 본 amendment는 *"e2e가 있고 통과하던 프로젝트"* 의 판정을 바꾸지 않는다. 바뀌는 것은 *"e2e가 실행되지 않았는데 통과로 보고되던 경우"* 뿐이다. registry를 필요조건으로 두지 않은 이유가 이것이다.

> **amend 근거 (ADR-045#d6)**: 본 amendment는 D3의 0-spec 예외를 철회하므로 D6 표상 *"기존 결정 뒤집기"* = 신규 ADR supersede 대상에 해당한다. 그런데 뒤집는 대상이 **D3 안의 예외 단서 하나**이고 본 ADR의 나머지 결정(D1 install provision·D2 provision/smoke·D4 repair-milestone)은 그대로 유효하므로, ADR 전체를 `superseded`로 만들면 살아 있는 결정 셋의 인용 21개 파일을 함께 재지정해야 한다. 비용이 이득을 넘어 **최소 churn을 택해 amendment로 처리**한다(상단 `## 현재 유효 결정`이 net 규칙을 요약해 본문 D3만 읽고 오해할 위험을 제거한다). 이 예외를 넘어 D2·D3의 구조를 다시 손대야 할 다음 변경이 오면 그때는 통합 재발행을 우선 검토한다.

### 적용 surface
- .claude/skills/stack-guard/SKILL.md — 프로비저닝 단계 5상태 판정 + canonical smoke 등록
- .claude/skills/stabilize-milestone/SKILL.md — §1.5 item 3, §3-b 5상태 판정
- docs/30-workitems/_templates/MILESTONE_TEMPLATE.md — `## 5` item 3 문구
- docs/90-decisions/boilerplate/ADR-014-milestone-graduation.md — Amendment 4
- docs/00-meta/_templates/STACK_SETUP_PLAN_TEMPLATE.md — `## E2E Smoke Registry` 절
```

**추가 수정**: ADR-045 D5는 *"base 결정을 정정·뒤집는 amendment가 있으면 `## 현재 유효 결정` 필수"* 라고 못 박는다(`_ADR_GUIDE.md` 권장 섹션에도 동일). 본 amendment가 D3를 정정하므로 이 절을 신설한다.

**기존** (파일 앞부분):

```
## Status
accepted

## 배경
```

**수정**:

```
## Status
accepted

## 현재 유효 결정
- D3의 **0-spec 예외는 Amendment 1로 철회**됐다 — 졸업 시점에는 `No tests found`류를 통과로 처리하지 않는다. 본문 D3의 "단 0-spec 예외" 단서는 historical이다.
- e2e 판정은 **종료코드가 아니라 구조화된 러너 출력**으로 하며 상태는 `NOT_APPLICABLE`/`EMPTY`/`PASS`/`FAIL`/`BLOCKED_ENV` 5종이다(Amendment 1). `EMPTY`는 프로비저닝 단계에서 허용, 졸업 시점에는 차단.
- D1(install provision)·D2(provision/smoke)·D4(repair-milestone) 결정은 그대로 유효하다.

## 배경
```

## 1-2. ADR-014에 Amendment 4 추가

**파일**: `docs/90-decisions/boilerplate/ADR-014-milestone-graduation.md`

**기존**: `## Amendment 3 (2026-07-26)`이 마지막 섹션.

**수정**: 파일 맨 끝에 추가한다.

```markdown

<a id="adr-014-amend-4"></a>
## Amendment 4 — graduation item 3의 0-spec 예외 철회

### 결정
`## Amendment 2`가 남겨 둔 **0-spec 예외**("`No tests found`면 PASS-with-warning")를 **졸업 판정에서 철회**한다. E2E-applicable 마일스톤은 **실제 실행된 e2e 테스트 1개 이상 성공**이 졸업 조건이다. 실행된 e2e가 0개면 `졸업 가능: NO`이며 상태 라벨은 `EMPTY`다.

프로비저닝(스택 확정) 단계에서 e2e가 0개인 것은 여전히 정상이며 차단하지 않는다. 차단은 **졸업 시점에만** 적용한다.

### 근거
- [관측됨] 0-spec 예외로 인해 UI 마일스톤이 e2e 0건으로 졸업 가능했다.
- [관측됨] e2e 대상 디렉터리가 비어 있을 때 러너가 다른 디렉터리의 유닛 테스트를 실행하고 exit 0을 내는 사례가 확인됐다. 종료코드 기반 판정으로는 구분되지 않는다.

### 강도 (ADR-022)
- constraint(강) — Amendment 2의 강도를 유지하며 예외만 제거.

### 적용 surface
- .claude/skills/stabilize-milestone/SKILL.md — §1.5 item 3
- .claude/skills/stack-guard/SKILL.md — 프로비저닝 판정
- docs/30-workitems/_templates/MILESTONE_TEMPLATE.md — `## 5` item 3
- docs/90-decisions/boilerplate/ADR-052-stack-provisioning-and-e2e-readiness.md — Amendment 1

> **amend 근거 (ADR-045#d6)**: 본 amendment는 `## Amendment 2`가 남긴 예외를 철회하므로 D6 표상 *"기존 결정 뒤집기"* 다. 다만 ① 본 ADR은 ADR-045(2026-05-27)보다 먼저 만들어져 누적 임계는 **grandfather**이고 ② 뒤집는 대상이 예외 단서 하나이며 판정 SSOT는 ADR-052#amend-1이 소유하므로, 본 ADR은 그 결과를 graduation item 3에 반영하는 역할만 한다. **최소 churn을 택해 amendment로 처리**하고 상단 `## 현재 유효 결정`으로 net 규칙을 노출한다. graduation contract 자체(5+1 구조)를 다시 손대야 할 다음 변경에서는 통합 재발행을 우선 검토한다.
```

**추가 수정**: 본 ADR은 이번 변경으로 amendment가 4개가 되고(ADR-045 D5의 첫 트리거) 그중 하나가 정정성이다(두 번째 트리거). 요약 절을 신설한다.

**기존** (파일 앞부분):

```
## Status
accepted

## 배경
```

**수정**:

```
## Status
accepted

## 현재 유효 결정
- graduation checklist는 5+1 구조 + 회고 + pre-check + `--dry-run`(본문 결정). 평가는 `졸업 가능: YES/NO`로만 낸다.
- item 3 `E2E Pass`는 **E2E-applicable 스택 한정 hard-block**(#amend-2)이며, #amend-2가 남긴 **0-spec 예외는 #amend-4로 철회**됐다 — 실제 실행된 e2e 1개 이상 성공이 조건이고 판정 상태 5종의 SSOT는 [ADR-052](ADR-052-stack-provisioning-and-e2e-readiness.md)#amend-1이다.
- 회고에 graduation 판정 줄을 남긴다(#amend-3). evaluator-optimizer 명명은 #amend-1.

## 배경
```

## 1-3. stack-guard의 e2e 판정 표 교체

**파일**: `.claude/skills/stack-guard/SKILL.md`

**기존** (`validate:e2e` 판정 행 블록 전체):

```
   `validate:e2e` 판정 행 (UI/web 한정):
   - **e2e wiring 성공 + 스펙 0건 / placeholder** (scaffold 직후 정상 케이스) → `validate:e2e smoke test: PASS (wiring OK, no specs yet)`.
   - **e2e wiring 성공 + 스펙 실행됨** → `validate:e2e smoke test: PASS (wiring OK)` (프로젝트 e2e 실패는 *프로젝트 책무* 로 분리 보고, 차단 X).
   - **e2e wiring 실패** (browser 미설치 / playwright config 누락 / `validate:e2e` 진입점 없음) → `validate:e2e smoke test: WIRING FAIL` + stderr + 제안 (browser 미설치 → `npx playwright install`; 진입점 누락 → 수행-6 재작업). **stack-guard 산출물 수정 필요** — 종료.
   - **browser 설치가 `Needs Install` 로 보류** → `validate:e2e smoke test: SKIPPED (browsers not installed — Needs Install: npx playwright install)`. 종료 X.
```

**수정** (위 블록을 통째로 아래로 교체):

```
   `validate:e2e` 판정 행 (e2e 대상 프로젝트 한정, ADR-052#amend-1 5상태):
   - **`NOT_APPLICABLE`** (e2e 대상 아님) → `validate:e2e: NOT_APPLICABLE (비-e2e 스택)`. 종료 X.
   - **`EMPTY`** (선언된 e2e 디렉터리 하위 suite에서 실제 실행·성공한 테스트 0개 — 디렉터리가 비었거나 러너가 다른 디렉터리를 대신 실행한 경우 포함) → `validate:e2e: EMPTY (프로비저닝 단계 정상 — 졸업 시점엔 차단)`. **본 단계에서는 종료하지 않는다.**
   - **`PASS`** (선언된 e2e 디렉터리 하위에서 1개 이상 실제 실행·성공 + 러너 전체 성공) → `validate:e2e: PASS (wiring OK)`.
   - **`FAIL`** — 두 원인을 **하위 라벨로 분리해 보고한다**(수행-5 smoke 의 wiring/프로젝트 책무 분리 원칙 유지). `FAIL(wiring)`: 진입점·config 부재로 러너가 기동조차 못 함 → **stack-guard 산출물 수정 필요**, 종료. `FAIL(project)`: 러너는 정상 기동했고 프로젝트 e2e 가 실패 → 프로젝트 책무로 분리 보고, 본 단계에서 종료하지 않는다(졸업 시점에는 차단).
   - **`BLOCKED_ENV`** (browser/device/toolchain 미설치·미기동) → `validate:e2e: BLOCKED_ENV — Needs Install: <실제 명령>`. 종료 X.

   상태 판정은 **구조화된 러너 출력**으로 한다(출력 문자열 매칭은 보조 fallback). `STACK_SETUP_PLAN.md ## E2E Smoke Registry`에 등록이 있으면 **선언된 runtime target별로** 읽어 `PASS` 조건을 *등록된 smoke 이름 일치*까지 좁히고, target마다 상태를 따로 낸다. **등록이 없어도 명령은 실행한다** — 위 경로 기준으로 판정하고 `P1 [E2E-registry] <target> — canonical smoke 미등록` 만 함께 기록한다(ADR-052#amend-1 결정 4).
```

## 1-4. stack-guard에 E2E Smoke Registry 기록 항목 추가

**파일**: `.claude/skills/stack-guard/SKILL.md`

**기존** (수행-3의 "본 skill이 채울 섹션" 목록):

```
     - 통합 명령 사용법
     - `## Design Gate Adapter` — UI면 실제 command template·adapter/output 경로·current capability version·source digest·fixed conformance 결과를 기록하고, 비-UI면 `status: n/a`만 기록(ADR-058#amend-2).
```

**수정**: 위 두 줄 사이(`통합 명령 사용법` 바로 다음)에 아래 한 줄을 삽입한다.

```
     - `## E2E Smoke Registry` — e2e 대상 프로젝트면 **선언한 runtime target마다 한 행**으로 `status | 파일 경로 | 테스트 이름 | 실행 대상 선택 규칙 | 마지막 PASS(host·날짜·커밋) | 등록일`을 기록. 실행 대상 칸에는 재부팅하면 달라지는 임시 id 대신 선택 규칙을 적는다(이 칸은 기록용이며 실행 명령에 그대로 들어가지 않는다). 대상 아니면 `status: n/a`만 기록(ADR-052#amend-1).
```

## 1-5. stabilize §1.5 item 3 교체

**파일**: `.claude/skills/stabilize-milestone/SKILL.md`

**기존** (§1.5의 `E2E Pass` 블록 전체 — 하위 5개 불릿 포함):

```
- `E2E Pass (needed → must pass)` → 단계 3의 e2e 판정 결과를 그대로 반영(ADR-052). **`--dry-run` 모드**: 단계 3 미실행이라 e2e 판정 입력이 없으므로 `E2E: dry-run skipped (졸업 판정 보류)` 로 표기(heavy e2e 는 normal 모드 재실행에서 확정):
  - **e2e 불필요** (UI 아님 ∧ graduation item 6에 e2e 미선언) → *해당 없음*(통과).
  - **e2e 필요** (UI 프로젝트 — ADR-027#amend-3 다중신호 UI 판정 ∨ graduation item 6이 e2e를 명시 선언) ∧ `validate:e2e` exit code 0 → 통과.
  - **e2e 필요 ∧ exit ≠ 0 이지만 "No tests found"(0 spec — scaffold 직후)** → real failure 아님 → `졸업 가능: YES` + `E2E: 0 spec (coverage 권장)` PASS-with-warning (stack-guard 0-spec=PASS 정합).
  - **e2e 필요 ∧ `validate:e2e` exit code ≠ 0 (스펙 실행 후 real failure)** → **`졸업 가능: NO` (hard)**. 조기 종료 옵션이 아니라 *졸업 차단*이다. 후속은 단계 8의 `/repair-milestone` 분기로 라우팅.
  - **e2e 필요 ∧ `validate:e2e` 실행 불가 (ENVIRONMENT failure — 브라우저 미설치 / 대상 앱 미기동 / E2E MCP 미등재)** → **`졸업 가능: NO` (hard, blocked-on-env)**. 단 이것은 *실제 e2e 실패가 아니다* — 사용자에게 환경 복구를 안내(`E2E 환경 미충족: <원인> — 브라우저 설치 / 앱 기동 후 재실행 권장`)하고, real failure와 라벨을 구분해 출력한다.
```

**수정**:

```
- `E2E Pass (needed → must pass)` → 단계 3의 e2e 상태 판정을 그대로 반영(ADR-052#amend-1 5상태). **`--dry-run` 모드**: 단계 3 미실행이라 입력이 없으므로 `E2E: dry-run skipped (졸업 판정 보류)` 로 표기:
  - **`NOT_APPLICABLE`** (비-UI ∧ graduation item 6에 e2e 미선언) → *해당 없음*(통과).
  - **`PASS`** (선언된 e2e 디렉터리 하위에서 1개 이상이 실제 실행·성공 ∧ 러너 전체 성공. registry 등록이 있으면 그 이름 일치까지) → 통과.
  - **`EMPTY`** (선언된 e2e 디렉터리 하위에서 실행·성공한 테스트 0개 — 디렉터리가 비어 있거나 다른 디렉터리 테스트가 대신 실행됨) → **`졸업 가능: NO` (hard)** + `Needs E2E Smoke`. 프로비저닝 단계와 달리 졸업 시점에는 차단한다(ADR-014#amend-4). *registry 미등록은 이 상태의 사유가 아니다* — 미등록은 `P1 [E2E-registry]` 기록 대상일 뿐이다.
  - **`FAIL`** (실행된 테스트 실패) → **`졸업 가능: NO` (hard)**. 후속은 단계 8의 `/repair-milestone` 분기로 라우팅.
  - **`BLOCKED_ENV`** (device/브라우저/toolchain 미설치·미기동) → **`졸업 가능: NO` (hard, blocked-on-env)**. real failure가 아니므로 라벨을 구분해 출력하고 환경 복구를 안내한다.
```

## 1-6. stabilize §3-b 교체

**파일**: `.claude/skills/stabilize-milestone/SKILL.md`

**기존** (§3-b 블록 전체):

```
   - **3-b. 필요 시 `validate:e2e` 실행 (silent-skip 금지)**: e2e가 필요하면 반드시 `validate:e2e`(또는 스택의 e2e 명령)를 실행하고 exit code를 기록한다.
     - exit code 0 → 통과.
     - exit code ≠ 0 인데 출력이 환경 원인(브라우저/드라이버 미설치, 대상 앱 미기동, E2E MCP 미등재·access 미부여)으로 판명 → **ENVIRONMENT failure**로 분류(real failure 아님). 단계 8과 §1.5에 `blocked-on-env`로 전달하고 사용자에게 환경 복구 안내.
     - exit code ≠ 0 이지만 출력이 **"No tests found" / 0 spec**(scaffold 직후 e2e 미작성)이면 → real failure 아님. `E2E: 0 spec (wiring OK, coverage 권장)` PASS-with-warning 으로 처리(stack-guard 0-spec=PASS 정합 — 졸업 차단 X, IMPROVEMENT_GUIDE 에 'e2e coverage 미작성' P1 권장만).
     - exit code ≠ 0 이고 환경 원인도 0-spec 도 아님(스펙이 실행돼 실패) → **real e2e failure**로 분류. §1.5 item 3을 `졸업 가능: NO (hard)`로 만든다.
```

**수정**:

```
   - **3-b. 필요 시 `validate:e2e` 실행 (silent-skip 금지)**: e2e가 필요하면 반드시 실행하고 **구조화된 러너 출력**을 수집해 ADR-052#amend-1의 5상태로 분류한다. exit code만으로 판정하지 않는다.
     - **선행 확인**: `STACK_SETUP_PLAN.md ## E2E Smoke Registry`를 읽어 **선언된 runtime target 목록**과 각 target의 등록 여부를 회수한다. target이 둘 이상이면 아래 판정을 **target마다 따로** 내고, 하나라도 `PASS`가 아니면 졸업은 차단된다. **등록이 없는 target도 명령은 실행한다** — 판정은 아래 경로 기준으로 하고 `P1 [E2E-registry] <target> — canonical smoke 미등록`만 기록한다(ADR-052#amend-1 결정 4).
     - **`PASS`** — 다음을 모두 만족: ① 실행된 테스트 중 러너 내부/로딩 항목이 아니고 skip도 아닌 것이 1개 이상 ② 그 테스트가 속한 suite 경로가 **선언된 e2e 디렉터리 하위** ③ 러너 전체 종료 상태가 성공 ④ registry에 등록이 있으면 ①의 테스트가 **등록된 smoke 이름과 일치**.
     - **`EMPTY`** — 위 ①~③ 중 하나라도 불충족(특히 **실행된 suite가 전부 e2e 경로 밖**인 경우 — 러너가 다른 디렉터리 테스트를 대신 실행한 상황). 종료코드가 0이어도 `EMPTY`다.
     - **`FAIL`** — 실행된 테스트가 실패(`FAIL(project)`)했거나 진입점·config 부재로 러너가 기동하지 못함(`FAIL(wiring)`). 두 하위 라벨을 구분해 기록한다 — 후속 처리 주체가 다르다(프로젝트 코드 vs stack-guard 산출물).
     - **`BLOCKED_ENV`** — 출력이 환경 원인(브라우저/드라이버 미설치, device 미연결, 대상 앱 미기동, E2E MCP 미등재)으로 판명. real failure와 라벨을 구분한다.
     - 출력 문자열 매칭은 위 판정을 보조하는 용도로만 쓴다.
```

## 1-7. MILESTONE_TEMPLATE item 3 교체

**파일**: `docs/30-workitems/_templates/MILESTONE_TEMPLATE.md`

**기존** (19행):

```
- [ ] E2E Pass (needed → must pass; needed + not-runnable = block) — UI 프로젝트(ADR-027#amend-3) 또는 아래 item 6에서 e2e 선언 시 필요; 필요한데 미통과(real)면 졸업 차단, 실행 불가(env)면 환경 복구 후 재실행 (ADR-052)
```

**수정**:

```
- [ ] E2E Pass — UI 프로젝트(ADR-027#amend-3) 또는 아래 item 6에서 e2e 선언 시 필요. **선언된 e2e 디렉터리에서 실제 실행된 테스트가 1개 이상 성공**해야 통과(registry 등록이 있으면 그 smoke 이름 일치까지 확인). 실행 0개(EMPTY)·실패(FAIL)·환경 불가(BLOCKED_ENV)는 모두 졸업 차단 (ADR-052#amend-1 / ADR-014#amend-4)
```

## 1-8. Surfaces 주석과 ADR 인덱스 동기화

이 저장소에는 **amendment를 추가하면 두 곳이 함께 바뀌어야 하는 검사**가 있다. 안 맞추면 다음 안정화에서 `P1 [ADR-index]`로 잡힌다(stabilize의 인덱스 amend 동기 항목 + `review-doc`의 Amendments 컬럼 대조).

**(a) 각 ADR의 `## Surfaces` 주석에 새 amendment 표기 추가**

- `ADR-052`의 Surfaces에서 stack-guard·stabilize·MILESTONE_TEMPLATE 행 주석 끝에 `, #amend-1 5상태 판정`을 덧붙이고, 아래 한 행을 추가한다.

  ```
  - docs/00-meta/_templates/STACK_SETUP_PLAN_TEMPLATE.md          — #amend-1 `## E2E Smoke Registry`
  ```

- `ADR-014`의 Surfaces에서 stabilize·stack-guard·MILESTONE_TEMPLATE 행 주석 끝에 `, #amend-4 0-spec 예외 철회`를 덧붙인다.

**(b) `docs/90-decisions/boilerplate/README.md` 인덱스의 Amendments 칸 갱신**

- `| 014 |` 행: 기존 목록 끝에 `, +#amend-4: 0-spec 예외 철회 — 실행된 e2e 1개 이상 성공` 추가.
- `| 052 |` 행: Amendments 칸의 `—`를 `(+#amend-1: 0-spec 판정 정합화 — 5상태 분류, 문자열 매칭 폐기)`로 교체.

## 1-9. 확인

```bash
grep -rn "No tests found" .claude/skills/ | grep -v "보조 fallback"
```

위 명령의 결과가 **0건**이어야 한다(문자열 매칭 의존이 남아 있지 않음).

```bash
# 인덱스 Amendments 칸 ↔ 본문 ## Amendment N 개수 일치 (stabilize가 검사하는 것과 같은 대조)
# 반드시 Amendments '컬럼'만 센다 — 요약 칸에 다른 ADR의 #amend-N 인용이 섞여 있어
# 행 전체를 grep하면 없는 amendment를 세어 거짓 불일치가 난다(예: 052 행의 ADR-014#amend-2).
for n in 007 014 021 027 031 052; do
  f=$(ls docs/90-decisions/boilerplate/ADR-$n-*.md)
  body=$(grep -c "^## Amendment " "$f")
  idx=$(awk -F'|' -v k=" $n " '$2==k{print $5}' docs/90-decisions/boilerplate/README.md \
        | grep -o "#amend-[0-9]" | wc -l)
  printf 'ADR-%s: 본문 %s / 인덱스 %s  %s\n' "$n" "$body" "$idx" "$([ "$body" = "$idx" ] && echo OK || echo MISMATCH)"
done
```

**합격 기준**: 여섯 줄 모두 `OK`. (적용 전 기준선에서도 여섯 줄 전부 `OK`임을 확인했다 — 이 검사가 잡는 것은 *이번 개선이 만든 어긋남*이다.)

```
git add docs/90-decisions/boilerplate/ADR-052-stack-provisioning-and-e2e-readiness.md docs/90-decisions/boilerplate/ADR-014-milestone-graduation.md docs/90-decisions/boilerplate/README.md .claude/skills/stack-guard/SKILL.md .claude/skills/stabilize-milestone/SKILL.md docs/30-workitems/_templates/MILESTONE_TEMPLATE.md
```

> **커밋 메시지**
> `fix(e2e): replace 0-spec pass-with-warning by 5-state classification`

---

# 단계 2. ADR-059 신설 (Flutter/모바일 프로파일 정책)

이후 모든 단계가 이 ADR을 인용하므로 먼저 만든다.

## 2-1. ADR 파일 생성

**파일**: `docs/90-decisions/boilerplate/ADR-059-flutter-mobile-profile.md` (신규)

아래 내용을 그대로 작성한다.

```markdown
# ADR-059 — Flutter/모바일 프로파일 (Android·iOS 직접 지원)

> scope: boilerplate
> area: tooling

## Status
accepted

## 배경
- ADR-031은 mobile native(Flutter 포함)를 *기본 자동화 직접 지원 범위 밖*으로 두고 fork override 경로만 제시했다. 그러나 그 override 절차는 **구현 surface가 없다** — `--override` 발화를 처리하는 skill이 없고, ADR-031에는 `## Surfaces` 블록도 없어 참조 정합 검사가 이 결손을 잡지 못한다.
- [관측됨] 그 사이 도입된 constraint 3종(ADR-052 D3 e2e 졸업 hard-block / ADR-058 D3 design gate fail-closed / ADR-056 결정 3 경험계약 입구 차단)은 ADR-031이 상정하지 않은 것이며, override 지침이 이들을 다루지 않는다.
- [관측됨] Flutter 실측(Flutter 3.44.8 / Dart 3.12.2, Windows 11 + macOS)에서 다음이 확인됐다.
  - 색상 하드코딩 grep이 `.dart`를 검사 대상에 포함하지 않아 **위반 3종 전부 침묵**했다(결과는 "위반 없음"으로 보고됨).
  - `flutter test <e2e디렉터리>`에서 그 디렉터리가 **비어 있으면 유닛 테스트 디렉터리가 대신 실행되고 exit 0**이 나온다. **device 연결 여부와 무관하다** — Android 에뮬레이터를 띄운 상태에서도 같았다(`--machine` 스트림의 suite 경로가 `test/widget_test.dart`·`test/golden_test.dart`이고 `done.success=true`). 즉 종료코드도, device 준비 상태도 "e2e가 돌았는가"의 근거가 되지 못한다.
  - `dart format .`이 iOS 생성 경로 순회 중 실패한다(긴 Windows 경로, 전체 277자). 등록된 source root를 명시하면 정상이나, `lib test`만 지정하면 e2e 디렉터리의 위반을 놓친다.
  - `flutter analyze`의 심각도별 종료코드는 아래와 같다(fork 실측 — 진단 1건씩 넣어 플래그 조합별로 측정).

    | 진단 심각도 | 기본 | `--no-fatal-infos` | `--no-fatal-warnings` | 둘 다 |
    |---|---|---|---|---|
    | info (lint 대부분) | 1 | **0** | 1 | 0 |
    | warning | 1 | 1 | **0** | 0 |
    | error | 1 | 1 | 1 | **1** |

    즉 **`--no-fatal-warnings` 하나만으로는 "에러만 차단"이 되지 않는다** — `flutter_lints`가 내는 진단은 대부분 `info`라서 그대로 exit 1이다. "에러만"을 원하면 `--no-fatal-warnings --no-fatal-infos` 둘을 다 붙여야 한다.
  - golden(픽셀 비교)은 같은 머신에서 5/5 동일하지만 **OS가 다르면 전부 불일치**한다(1.35%~3.33%). 실제 폰트를 로드해도 마찬가지다.
  - 통합 검증 실행 껍데기 중 **npm만 종료코드 0/1/2를 보존**한다. task는 0/201/201, make는 0/2/2로 뭉갠다(Windows·macOS 동일).
  - 웹 프로젝트가 있는 저장소에 Flutter 소스를 추가해도 웹 검증 시간·결과는 변하지 않는다(교대 반복 5쌍, median 차 -8ms).

## 결정

### D1. 지원 범위
- **Android + iOS**를 직접 지원 범위에 넣는다. Flutter web·desktop은 대상이 아니다.
- 웹 프로젝트는 기존 경로(web frontend / API / CLI / monorepo / Supabase)를 그대로 쓴다.
- 지원 OS는 **Windows + macOS**. Linux는 대상이 아니다.
- 본 결정은 ADR-031의 "mobile native = 기본 자동화 범위 밖"을 **Flutter에 한해 해제**한다. 나머지(iOS Swift·Android Kotlin·RN·ML·embedded·game·desktop)는 ADR-031 그대로다.

### D2. 통합 검증 명령
- 실행 껍데기는 **npm**으로 고정한다. 근거 둘: ① design gate가 exit 0/1/2를 구분해야 하는데 task·make는 이를 각각 201·2로 뭉갠다(Windows·macOS 동일 관측) ② design gate 때문에 Node가 이미 필수 의존이므로, 여기에 다른 러너를 하나 더 얹는 것보다 하나로 두는 편이 단순하다(ADR-006). `validate:design`만 npm으로 하고 나머지를 다른 러너로 두는 혼합안도 가능하나, 도구 두 개를 관리하는 비용을 지불할 이득이 없다.
- `validate` 구성(순서 고정):
  1. `dart format --output=none --set-exit-if-changed <등록된 Dart source root 전부>`
  2. `flutter analyze` — **플래그 없이 기본값**을 쓴다
  3. `flutter test`
- **lint 단계에 `--no-fatal-*` 플래그를 붙이지 않는 이유**: 배경의 실측 표대로 `flutter_lints`의 진단은 대부분 `info`라서, 완화 플래그를 붙이면 lint 단계가 사실상 타입 에러만 보게 되고 그건 `flutter test`가 대체로 잡는다. **웹 스택의 lint 단계는 스타일 위반에서 차단**하므로 같은 강도를 유지하는 쪽이 정합적이다(사용자 결정: 속도보다 품질). `flutter create` 직후 프로젝트는 기본 `flutter analyze`를 통과한다(fork 실측 exit 0).
- 다만 **기존 코드가 많은 프로젝트를 이관하면 info가 쏟아질 수 있다.** 그때는 `--no-fatal-infos`로 일시 완화할 수 있으나 **완화했다는 사실과 해제 조건을 `STACK_SETUP_PLAN.md ## 통합 명령 사용법`에 적는다** — 조용히 약한 상태로 굳는 것을 막는다.
- **`dart format .`을 쓰지 않는다.** 대상은 `STACK_SETUP_PLAN.md ## Dart Source Roots`에 등록된 경로 목록이며, 존재하지 않는 경로는 wrapper가 제외한다. `lib test`처럼 일부만 고정하지 않는다(e2e·bin·tool 디렉터리의 위반을 놓친다).
- 명시 열거의 대가는 **표가 늙는다**는 것이다. 새 최상위 소스 디렉터리가 생겼는데 표에 없으면 그 코드는 형식 검사에서 조용히 빠진다. 그래서 검증을 돌릴 때마다 실제 Dart 파일의 최상위 디렉터리 집합과 표를 대조하고, 표에 없는 것이 나오면 표를 먼저 갱신한다(대조 명령은 STACK_SETUP_PLAN 템플릿의 같은 절에 있다).
- **`flutter analyze`가 typecheck를 포함**한다. 별도 typecheck 단계를 요구하지 않으며, 4단계 점검에서 typecheck 누락으로 보고하지 않는다.

### D3. golden(픽셀 비교)
- 도입한다. 정답 사진은 **커밋하지 않는다**(`.gitignore` 대상). 머신마다 자기 기준선을 갖는다.
- golden 테스트는 `flutter test`에 포함되므로 `validate`에서 자동 실행된다. 태그 분리·기준 OS 선언은 두지 않는다.
- 새 체크아웃 직후에는 정답 사진이 없어 실패한다. 이때 1회 `flutter test --update-goldens`로 생성하고 **생성된 이미지를 사람이 확인**한 뒤 진행한다.
- **재생성 규율**: `--update-goldens`는 (a) 정답 사진이 **아예 없을 때**, 또는 (b) UI를 **의도적으로 바꾼 뒤 변경 결과를 확인했을 때**만 실행한다. 정답 사진이 있는데 실패했다고 해서 통과시키려고 덮어쓰지 않는다.
- **한계(사실 기록)**: 정답 사진을 추적하지 않으므로 *새 머신·새 체크아웃에서 첫 생성 시점*에 이미 들어와 있던 회귀는 정상으로 굳는다. 검출 범위는 **한 머신에서 기준선 생성 이후 발생한 변화**다. 이 범위를 넓히려면 정답 사진을 OS별로 나눠 커밋해야 하는데, 그러면 두 머신 모두에서 승인·갱신이 필요해진다. 현재 구성(단독 작업·자동 실행 서버 없음)에서는 추적하지 않는 쪽을 택했다.
- golden 테스트 위젯에는 `debugShowCheckedModeBanner: false`를 준다(디버그 리본이 이미지에 찍힌다).
- **존재 강제는 하지 않는다**: golden 테스트가 0개인 프로젝트는 그대로 통과한다. 작성한 golden이 있으면 `validate`에서 강제될 뿐이다. 접근성 guideline 테스트도 같다(D5).

### D4. e2e
- `integration_test`(Flutter SDK 동봉)를 기본으로 한다. 권한 대화상자·시스템 알림 등 OS UI 조작이 AC에 등장하면 Patrol을 추가한다.
- **의존성**: `integration_test`는 SDK 동봉이지만 `pubspec.yaml`의 `dev_dependencies`에 `integration_test: {sdk: flutter}`를 명시해야 import가 성립한다. 진입점·smoke를 만들 때 의존성 추가와 `flutter pub get`을 함께 수행한다.
- **판정 입력은 `--machine` 구조화 출력**이다. 사람이 읽는 진입점(`validate:e2e`)은 기본 리포터를 쓰고, **판정하는 쪽이 `--machine`을 덧붙여 다시 호출**한다(npm 진입점이므로 `npm run validate:e2e -- --machine` 형태로 전달된다).
- **판정 계약 — 상태 정의와 판정 순서는 `ADR-052#amend-1` 결정 3이 SSOT다. 여기서는 그 순서의 각 항을 `--machine` 스트림으로 *어떻게 관측하는가*만 정한다(재선언 아님).** 앞 항에서 걸리면 뒤 항을 보지 않는다. **순서를 뒤집으면 환경 문제를 "테스트 없음"으로 오분류한다**(아래 실측 참조).
  1. **러너가 기동했는지** (SSOT 1항) — 첫 `start` 이벤트에 `protocolVersion`이 있는가. 없거나 파서가 모르는 major 버전이면 여기서 멈추고, 원인이 device·toolchain 등 환경이면 **`BLOCKED_ENV`**(예: `stderr`의 `No devices are connected`), 진입점·config 부재면 **`FAIL(wiring)`** 로 확정한다. 원인을 함께 보고한다. **이때 `EMPTY`로 분류하지 않는다** — 테스트가 없는 것이 아니라 실행 자체가 불가능한 것이고, 처방이 다르다(작성 vs 환경 복구 vs 배선 수정).
  2. **e2e가 실제로 돌았는지** (SSOT 2항) — `suite` 이벤트의 `path`를 정규화(구분자 통일)했을 때 **선언된 e2e 디렉터리 하위**인 suite에 속한(`testStart.test.suiteID` = 그 suite `id`) 테스트 중, `testDone`이 `hidden=false` · `skipped=false`인 것이 1개 이상인가(**`result`는 보지 않는다 — 실패한 테스트도 "실행됨"이다**). 0개면 **`EMPTY`**. **이 항이 실측 결함의 차단 지점이다** — 빈 디렉터리를 지정하면 러너가 유닛 테스트 디렉터리를 대신 실행하고 `done.success=true` + exit 0을 내는데, 그때 suite 경로가 e2e 디렉터리 밖이라 여기서 걸린다. **suite 파일은 있는데 그 안에 `test()`가 없어 세어질 테스트가 0개인 경우도 `EMPTY`다** — SSOT의 판별자는 suite 개수가 아니라 *실행된 테스트* 개수다.
  3. **그 테스트가 성공했는지** (SSOT 3항) — 2항에서 센 테스트 중 `result="success"`인 것이 1개 이상인가. 0개면 **`FAIL(project)`**.
  4. **러너 전체가 성공했는지** — 마지막 `done` 이벤트가 `success=true`인가. 아니면 **`FAIL(project)`**.
  - 넷을 모두 통과하면 `PASS`다.
  - `testDone`에는 테스트 이름도 suite 경로도 없다. **`suite` → `testStart` → `testDone`을 id로 상관지어야** 판정이 성립한다.
  - 출력 문자열 매칭은 상태 *설명*에만 쓰고, 그것만으로 `PASS`를 만들지 않는다.
  - **[관측됨] 이 순서를 안 지키면 실제로 오분류한다**: 빈 `integration_test/`는 `protocolVersion=0.1.1` + suite `test/widget_test.dart` + `done.success=true` → 2항에서 `EMPTY`. smoke를 넣고 device를 연결하지 않으면 스트림이 아예 비어 `protocolVersion`이 없고 exit 1 → 1항에서 `BLOCKED_ENV`. 순서 없이 suite 개수만 세면 후자도 `EMPTY`가 되어 "테스트를 쓰라"는 잘못된 처방이 나간다.
- **registry는 필요조건이 아니라 강화 수단이다.** `STACK_SETUP_PLAN.md ## E2E Smoke Registry`에 canonical smoke가 등록돼 있으면 위 3항을 *"등록된 smoke 이름과 일치하는 테스트가 성공"* 으로 좁혀 판정한다. 등록이 없으면 **3항을 이름 제약 없이 적용하고**(= 선언된 e2e 디렉터리 안의 아무 테스트든 1개 이상 성공) `P1 [E2E-registry] <target> — canonical smoke 미등록, /stack-guard로 등록 권장`을 기록한다. **등록 부재만으로 졸업을 차단하지 않는다** — 실제로 e2e를 갖고 통과하던 기존 프로젝트를 서류 미비로 막는 것은 ADR-022 ratchet 위반이고, 위 2항만으로 실측 결함은 이미 막힌다.
- **플랫폼별 판정**: 선언된 runtime target마다 각각 `PASS`여야 한다. Android만 통과하고 iOS가 미실행이면 iOS는 `EMPTY` 또는 `BLOCKED_ENV`이며 졸업은 차단된다.
  - **기본 전제는 "한 마일스톤을 한 머신에서 끝낸다"** 다. iOS는 빌드 자체가 macOS + Xcode 전용이므로, **iOS를 target으로 선언한 마일스톤은 macOS에서 작업한다** — 그러면 host 이동도, 증거 이관도 필요 없다.
  - 그럼에도 Windows에서 진행하다 iOS 판정만 남는 상황이 생기면 iOS는 `BLOCKED_ENV`로 남는다. 이때만 예외로, macOS에서 1회 수행한 결과를 registry의 `마지막 PASS(host·날짜·커밋)` 칸에 적어 증거로 쓴다. **유효 조건은 하나 — 기록된 커밋이 지금 판정하려는 커밋과 같을 때만** 인정한다. 다르면 다시 `BLOCKED_ENV`다(코드가 바뀌었는지 사람이 판단하게 두지 않는다).
- registry의 실행 대상 칸에는 `emulator-5554` 같은 **임시 id를 적지 않고** 선택 규칙(예: `연결된 android device 1대`)을 적는다. **단 이 칸은 사람이 읽는 기록이며 실행 명령에 그대로 들어가지 않는다.**
  - **진입점은 `-d`를 아예 생략한다.** 러너가 *`integration_test`를 지원하는 device로 후보를 좁힌 뒤* 하나만 남으면 자동 선택한다. **[관측됨]** `emulator-5554`(android) + `windows` + `chrome` + `edge` 네 device가 붙은 상태에서 `-d` 없이 실행했고 오류 없이 android emulator가 선택돼 통과했다 — 데스크톱·웹 device는 후보에서 걸러진다.
  - 후보가 둘 이상 남으면(예: android emulator 2대) 모호해지므로 그때 호출 측이 `-- -d <id>`로 지정한다. `-d`의 값은 **device id 또는 이름 접두사**만 허용되며 자연어 규칙은 명령으로 성립하지 않는다(`-d emulator-5554` 명시 호출도 동일하게 통과 — 실측).

### D5. 접근성
- `flutter_test`의 Accessibility Guideline API 4종(`androidTapTargetGuideline` / `iOSTapTargetGuideline` / `labeledTapTargetGuideline` / `textContrastGuideline`)을 위젯 테스트에 넣는다.
- 웹의 axe에 해당하는 자동 검사기가 없으므로, 자동으로 못 보는 부분은 **수동 검사 항목**으로 이관한다: TalkBack(Android)·VoiceOver(iOS)·Android Accessibility Scanner·Xcode Accessibility Inspector.

### D6. 색상 하드코딩 검출
- 문자열 검색(grep) 방식으로 `.dart`를 검사 대상에 넣는다. 판정은 **기록만** 하며 진행을 차단하지 않는다.
- 한계(사실): grep은 문법을 이해하지 못해 **주석·문자열 리터럴 안의 색값도 함께 잡는다**(실측 2/2 오탐). 차단 등급의 전제인 오탐 0을 만족하지 못하므로 기록 등급으로 둔다. 문법을 이해하는 검사가 필요하면 수단은 두 가지다 — Dart의 **공식 analyzer plugin 방식**과 별도 패키지인 **`custom_lint`**. 둘은 같은 것이 아니며 선택 시 각각의 설치·작성 방식을 확인해야 한다.

### D7. 모바일 결정 자리
- `ARCHITECTURE_OVERVIEW.md`에 `## 7-5. 모바일 클라이언트 결정`을 신설한다. 채움/삭제 규칙은 기존 `## 7-1`~`## 7-4`와 동일하다(해당 없으면 통째 삭제).
- `## 7-4. 프론트 결정`은 웹 전용으로 유지한다. Flutter 프로젝트는 `## 7-4`를 삭제하고 `## 7-5`를 채운다.

### D8. 프로젝트 유형 판정의 축 분리
- 기존의 "UI 프로젝트인가" 단일 축을 다음 세 축으로 분리한다. 세 축은 상호배타가 아니며 동시에 참일 수 있다.
  - **design surface**: 시각 설계 산출물을 갖는 프로젝트인가. **판정 절차는 기존 그대로 ADR-027#amend-3**(DESIGN.md 존재 → status → 추가 신호)이며 본 ADR이 새 판정 규칙을 만들지 않는다. 이 축이 참이면 design gate(정적 HTML 대상) 대상이다.
  - **runtime target**: 앱이 실제로 도는 곳. canonical 값은 `web` / `native/android` / `native/ios` / `desktop` / `none`이며 한 프로젝트가 여러 개를 선언할 수 있다. `native/*`는 값이 아니라 그 둘을 묶는 **클래스 표기**다 — toolchain 분기는 `native/*` 포함 여부로 하되 **e2e 판정과 registry 행은 개별 값 단위**로 낸다(위 플랫폼별 판정이 성립하는 지점). e2e 도구 선택의 근거.
  - **host environment**: 작업 머신(windows / macos). 실행 가능 범위의 근거.
- design gate(Playwright + axe)는 **정적 HTML만** 대상으로 한다. runtime target이 `native/*`면 앱 e2e를 Playwright에 배선하지 않는다.
- **두 축을 헷갈리면 게이트가 영구히 막힌다**: design surface가 있으면 runtime target이 `native/*`든 `web`이든 **Chromium 바이너리가 필요하다**. canonical adapter는 모듈만 있고 브라우저가 없으면 `exit 2`(실행 불가)를 내고, 그 상태는 registry `status: needs-install`로 굳어 디자인 산출물 승인이 보류되며, 그 보류가 프로토타입 승격과 task 분해까지 연쇄로 막는다. 따라서 native 프로젝트에서 "브라우저를 설치하지 않는다"는 **앱 e2e 목적에 한한 말**이고, design gate 목적의 `npx playwright install chromium`은 target과 무관하게 수행한다.

### D9. 시크릿 취급 2단 분류
- **읽기 차단**(도구가 열지 못하게): Android 서명키(`*.jks`·`*.keystore`), 그 비밀번호(`key.properties`), iOS 배포 인증서·프로비저닝(`*.p12`·`*.mobileprovision`), 서버용 service account 키(`*-firebase-adminsdk-*.json`).
- **비밀로 취급하지 않음(단, 무해하다는 뜻은 아님)**: Firebase 클라이언트 설정(`google-services.json`·`GoogleService-Info.plist`). 이 키는 앱 바이너리에 담겨 배포되므로 숨기는 것이 방어가 되지 않는다. **대신 반드시 해야 하는 것은 키 사용 범위 제한이다** — Firebase/Google Cloud 콘솔에서 그 키가 호출할 수 있는 API를 제한하고, 데이터 접근은 Firebase 보안 규칙과 App Check로 막는다. 제한하지 않은 키는 공개돼도 되는 키가 아니다. 기본으로 git에서 빼면 **새 체크아웃에서 빌드가 깨지므로** 제외 대상에 넣지 않되, 커밋 여부와 키 제한 상태는 flavor·환경 분리 방식에 달린 **프로젝트 결정**이므로 ARCH `## 7-5`의 `### 빌드 flavor·환경변수`에 적는다.
- **차단 수단의 한계(사실)**: 도구 설정의 읽기 차단 목록은 에이전트의 파일 읽기 도구에 적용되며, 셸 하위 프로세스(`cat` 등)까지 막지는 못한다. **1차 통제는 "서명 자산을 저장소 밖에 두는 것"**이고 읽기 차단·git 제외는 보조 통제다.
- **도구별 비대칭을 메운다**: `.claude/settings.json`의 읽기 차단은 Claude Code에만 적용된다. Codex 쪽은 OS 강제가 불가해 `AGENTS.md`의 금지 한 줄에 의존하므로(ADR-010 D5·D8), 같은 목록을 그 줄에도 반영해야 두 도구가 동등해진다.
- **`.gitignore`는 이미 추적 중인 파일을 보호하지 않는다.** 기존 저장소에 서명 자산이 커밋돼 있으면 ignore 규칙을 추가해도 계속 추적된다. 그래서 규칙 추가와 함께 **`git ls-files`로 실제 추적 여부를 확인**하고, 발견 시 ① 저장소 밖으로 옮기고 ② `git rm --cached`로 추적 해제하며 ③ 이미 원격에 올라갔다면 **키 자체를 재발급**한다(히스토리에 남은 키는 ignore로 되돌릴 수 없다).

### D10. AI 도구
- Dart & Flutter MCP 서버는 `STACK_SETUP_PLAN.md ## Optional MCP Connectors`에 등재한 뒤 사용한다(ADR-048). Dart 3.9 이상이 필요하다. 앱 조작 기능은 `--dart-define` 게이트 뒤에 두어 배포 빌드에 포함되지 않게 한다.
- 공식 Flutter Agent Skills·plugin은 **기본 의존이 아니라 opt-in**이다. 도입 전 (a) 포함된 rules 본문 (b) 자동 등록되는 MCP capability (c) 기존 lifecycle skill과의 역할 중복을 감사한다. 충돌 시 **본 저장소의 lifecycle skill이 우선**한다.
- 공식 rules 문서는 통째로 흡수하지 않는다. 시각 지시(배경 노이즈·다층 그림자·glow 등)는 `DESIGN.md ## 9`의 금지 목록과 충돌하므로 **배제**한다. 코드 규율 중 필요한 항목만 ARCH `## 7-5`의 프로젝트 결정으로 옮겨 적는다.

### D11. 경로 길이
- Windows에서 프로젝트 루트 경로가 길면 iOS 생성 경로 순회가 실패한다(관측: 전체 277자에서 실패, 123자에서 정상). D2의 등록 source root 방식은 이 경로를 순회하지 않으므로 영향을 받지 않는다. 다만 프로젝트 루트를 짧게 두는 것을 권장한다.

### D12. 경험 게이트의 native degrade (숨기지 않고 기록한다)
- 마일스톤 안정화의 경험 게이트는 *앱을 띄우고 화면을 캡처해 승인 프로토타입과 대조*하는 절차이며, 기동 명령을 `package.json`의 `dev`/`start`에서 회수한다. **Flutter 앱에는 그 진입점이 없다.**
- 이번 라운드에서는 device 스크린샷 경로를 배선하지 않는다. 대신 **degrade를 명시 기록한다** — native 프로젝트에서 앱 기동 캡처는 `blocked-on-env`로 남고, 대조는 프로토타입 HTML을 `file://`로 렌더한 쪽만 수행한다. 실행 자체를 조용히 건너뛰지 않으며, 미실행 사유를 매번 출력한다.
- **이 결정은 skill 수정을 요구하지 않는다.** 경험 게이트는 이미 *"기동 명령 불명·실패면 `blocked-on-env` 라벨 + 미실행 사유 echo"* 경로를 갖고 있고, Flutter 프로젝트는 `dev`/`start` 스크립트가 없어 그 경로로 자연히 떨어진다. 본 결정은 그 결과가 *의도된 것*임을 기록하는 항이다 — 이 문장을 근거로 게이트 지시문을 고치지 않는다(웹 경로에 손대지 않기 위해서다).
- **이 결정으로 실제 잃는 것**: 구현 화면과 승인 프로토타입의 시각 대조가 native에서는 자동으로 서지 않는다. golden은 커밋하지 않으므로(D3) 대체 증거도 되지 못한다. 즉 이 구간은 사람이 눈으로 보는 것에 의존한다.
- 배선하려면 `flutter drive`/`integration_test`에서 스크린샷을 남기고 그 경로를 게이트에 넘기는 방법이 있다. 실사용에서 시각 회귀를 놓친 사례가 나오면 그때 붙인다(재검토 트리거 7).

## 대안과 트레이드오프
- **대안 A — ADR-031 그대로 두고 fork마다 override**: 보일러플레이트 변경이 0이지만, override 절차에 구현 surface가 없고 Flutter 프로젝트마다 같은 12곳을 다시 패치해야 한다. 기각.
- **대안 B — 별도 프로파일 문서 파일 신설**: Flutter 지시를 한 파일로 통독할 수 있으나, 웹 프로젝트가 쓰지 않는 파일을 계속 달고 다닌다. 기존 자리(ADR·ARCH `## 7-5`·STACK_SETUP_PLAN·skill 인라인)로 충분해 기각.
- **채택 — 기존 자리 분산 + ADR SSOT**: 새 파일·새 디렉터리 0개. 웹 프로젝트는 `## 7-5`를 삭제하고 skill 인라인 몇 줄만 더 읽는다. 대신 Flutter 지시가 네 곳에 나뉘므로 본 ADR의 `## Surfaces`가 위치 색인 역할을 한다.

## 신뢰도와 재검토
- **신뢰도: Medium** — 근거는 Windows 11 + macOS 26.3 / Flutter 3.44.8 / Dart 3.12.2 단일 조합의 실측이다. 프로젝트 1개 규모이고 다른 Flutter 버전·다른 팀 구성에서의 일반화는 확인되지 않았다.
- **재검토 트리거** — 아래 중 하나가 관측되면 해당 결정을 다시 본다.
  1. Flutter 관통 실사용에서 색상 검출이 fixture 3종 중 하나라도 놓침 → D6
  2. 빈 e2e 디렉터리가 `PASS`로 분류됨 → D4와 ADR-052#amend-1
  3. 웹 프로젝트 검증 시간·결과가 기준선 대비 변함 → D8과 skill 인라인 범위
  4. golden 정답 사진 재생성이 회귀를 덮는 사례 발생 → D3
  5. 자동 실행 서버(CI)나 두 번째 작업자가 생김 → D3(golden 추적 여부)·D2(broker)
  6. Flutter 메이저 버전 상승으로 `--machine` 스트림의 `protocolVersion` major가 바뀜 → D4 판정 계약
  7. native 마일스톤에서 시각 회귀를 사람도 못 잡고 넘어간 사례 발생 → D12(device 스크린샷 배선)
  8. `--machine` 스트림을 매 실행 사람이 해석하는 부담이 관측될 만큼 커짐 → D4 판정 계약을 코드(파서)로 물질화. **지금 코드로 만들지 않는 이유**: design gate는 exit 0/1/2 계약과 다중 입력 처리가 필요해 canonical asset이 정당했지만, e2e 판정은 web 스택도 현재 지시문 기반이며 스택 하나를 추가하면서 새 실행 코드를 들이는 것은 ADR-006에 어긋난다. 판정 계약을 글로 고정해 두고 필요가 관측되면 물질화한다.

## Mutation Contract (ADR-047 D3)
1. **Target** — `.claude/skills/stack-guard/SKILL.md`(verify 표·정적분석 표·toolchain·target 분기·boot smoke·registry·출력 계약) / `.claude/skills/stabilize-milestone/SKILL.md`(§3-b·§3-V·§5-2·§5-2b·§5-3·§5-4·dependency hygiene) / `.claude/skills/plan-workitem/SKILL.md`(task 유형 prefilter·컴포넌트 경로·의존성 신호) / `.claude/skills/validate-workitem/SKILL.md`(Arch-iface audit) / `.claude/skills/validate-plan/SKILL.md`(읽기 목록·`[Plan-arch-iface]`) / `.claude/skills/finalize-workitem/SKILL.md`(lockfile whitelist·민감 경로) / `.claude/skills/implement-workitem/SKILL.md`(의존성 도구) / `.claude/skills/bootstrap-stack/SKILL.md`(디렉터리 트리·Dependency Tools·§7-5 채움) / `.claude/skills/bootstrap-design/SKILL.md`(직접 지원 스택 표기) / `.claude/skills/plan-milestone/SKILL.md`(엔지니어링 내부 경계) / `.claude/agents/validator.md`(모바일 인터페이스 CHECK) / `.claude/agents/reviewer.md`(`[Plan-arch-iface]` 열거) / `.claude/agents/builder.md`(인터페이스 SSOT 열거) / `docs/20-system/ARCHITECTURE_OVERVIEW.md`(`## 7-5`) / `docs/30-workitems/_templates/TASK_TEMPLATE.md`(runner 예시·Architecture-Iface 예시) / `docs/30-workitems/_templates/FEATURE_TEMPLATE.md`(Architecture-Iface 예시) / `docs/00-meta/STRUCTURE.md`(산출물 표·Canonical Owner) / `docs/00-meta/PROJECT_START_CHECKLIST.md` / `docs/00-meta/GUARDRAILS_STRATEGY.md`(진입점 단서) / `docs/00-meta/WORKFLOW.md`(7-x 정책 포인터) / `docs/00-meta/_templates/STACK_SETUP_PLAN_TEMPLATE.md`(source root·smoke registry·golden 절차) / `AGENTS.md` / `README.md` / `README_ko.md` / `.gitignore` / `.claude/settings.json` / `docs/90-decisions/boilerplate/ADR-027-interface-decision-allocation.md`(Amendment 8) / `docs/90-decisions/boilerplate/ADR-031-non-web-out-of-scope.md`(Amendment 1) / `docs/90-decisions/boilerplate/ADR-007-workitem-lifecycle.md`(lockfile 목록) / `docs/90-decisions/boilerplate/ADR-021-static-analysis-recommendation.md`(스택별 표) / `docs/90-decisions/boilerplate/README.md`(인덱스)
2. **Failure mode** — Flutter 파일이 검사 대상에서 빠져 위반이 침묵하는데 결과는 "위반 없음"으로 보고됨 / e2e 디렉터리가 비어 있을 때 유닛 테스트가 대신 실행되고 통과 처리됨 / 웹 프로젝트의 동작·검증 시간이 Flutter 지원 추가로 저하됨 (앞 둘은 관측됨).
3. **Predicted improvement** — Flutter 프로젝트에서 색상 검출 3/3, e2e 상태 오분류 0, 웹 검증 median 변화 없음.
4. **Preserved invariants** — lifecycle 단계·순서·스킬 목록 불변 / 문서 계층·상태 전이 불변 / 판정 방식(Pass·Needs Fix·졸업 YES/NO) 불변 / 웹 프로젝트의 검증 명령·소요 시간 불변 / **이미 e2e를 갖고 통과하던 프로젝트의 졸업 판정 불변**(ADR-052#amend-1 결정 4) / 비해당 sub-section 통째 삭제 규칙 불변 / design gate의 차단 등급 불변.
   - **불변이 아닌 것을 밝힌다**: Flutter 분기는 공용 skill 본문에 들어가므로 웹 프로젝트도 그 줄을 읽게 된다(별도 파일을 만들지 않기로 한 대안 채택의 대가). 지키는 것은 *"읽는 줄이 0"* 이 아니라 *"증가량이 관리 가능한 범위"* 이며 그 상한은 아래 falsifier (d)로 고정한다. 경험 게이트의 native 캡처는 D12대로 **degrade한다** — 이 항목은 불변 목록에서 제외한다.
5. **Falsifying evaluation** — Flutter fork에서 (a) 색상 fixture 3종 중 하나라도 미검출 (b) 빈 e2e 디렉터리가 `PASS`로 분류 (c) 웹 프로젝트 `validate` median이 기준선 대비 유의하게 증가 (d) **공용 skill 지시문 총량이 기준선 대비 200줄 넘게 증가** (e) e2e를 갖고 통과하던 기존 프로젝트가 새 판정에서 차단됨 — 중 하나라도 발생하면 해당 결정을 재조정한다.
6. **Rollback path** — 본 ADR을 supersede하는 후속 ADR로 D1을 되돌려 Flutter를 ADR-031 범위로 복귀시킨다. 그 경우 `## 7-5`·npm broker·golden·5상태 e2e 판정 중 Flutter 전용 부분을 제거하고 전역 부분(ADR-052#amend-1)은 유지한다.

## 정책 강도 (ADR-022)
- **constraint(강)** — `[관측됨]`: `flutter analyze` 진단(기본 설정에서 차단되는 것 전부 — info 포함, D2) / 실행된 테스트 실패 / 시크릿 노출. 이 셋은 도입 시점부터 차단한다.
- **enabling(약)** — golden·접근성 guideline 테스트의 **존재 강제**(현재 미적용 — 작성한 것만 검사), 색상 grep(기록 등급), AI 도구 채택. 실사용 관측이 쌓이면 강도를 재조정한다.

## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT)
- .claude/skills/stack-guard/SKILL.md
- .claude/skills/stabilize-milestone/SKILL.md
- .claude/skills/plan-workitem/SKILL.md
- .claude/skills/finalize-workitem/SKILL.md
- .claude/skills/implement-workitem/SKILL.md
- .claude/skills/bootstrap-stack/SKILL.md
- .claude/skills/bootstrap-design/SKILL.md
- .claude/agents/validator.md
- .claude/agents/reviewer.md
- docs/20-system/ARCHITECTURE_OVERVIEW.md
- docs/30-workitems/_templates/TASK_TEMPLATE.md
- docs/00-meta/STRUCTURE.md
- docs/00-meta/PROJECT_START_CHECKLIST.md
- docs/00-meta/GUARDRAILS_STRATEGY.md
- docs/00-meta/_templates/STACK_SETUP_PLAN_TEMPLATE.md
- docs/90-decisions/boilerplate/ADR-027-interface-decision-allocation.md
- docs/90-decisions/boilerplate/ADR-031-non-web-out-of-scope.md
- docs/90-decisions/boilerplate/ADR-007-workitem-lifecycle.md
- docs/90-decisions/boilerplate/ADR-021-static-analysis-recommendation.md
- AGENTS.md
- README.md
- README_ko.md
- .gitignore

> `.claude/settings.json`도 본 ADR로 변경되지만 JSON이라 역참조 주석을 넣을 수 없어 Surfaces가 아닌 Mutation Contract Target에만 둔다.
> **`## 7-5` 자리만 추가되는 소비자**(`validate-workitem`·`validate-plan`·`plan-milestone`·`builder.md`·`FEATURE_TEMPLATE.md`·`WORKFLOW.md`·`bootstrap-stack/output-checklist.md`)는 Flutter 고유 내용을 담지 않으므로 **[ADR-027](ADR-027-interface-decision-allocation.md)#amend-8의 surface**다. 본 ADR은 D7에서 그 자리를 쓰기로 결정할 뿐이고, 자리의 소유·fan-out은 ADR-027이 갖는다. 두 목록이 겹치지 않게 여기서는 제외한다(Mutation Contract Target에는 이번 변경이 실제로 손대는 파일이라 포함).

## 참고
- ADR-031 (비웹 스택 범위 — 본 ADR이 Flutter에 한해 해제), ADR-027 (인터페이스 결정 할당), ADR-052 (e2e readiness), ADR-058 (design gate), ADR-048 (MCP 등재), ADR-022 (강도), ADR-047 (mutation contract), ADR-006 (단순성).
```

## 2-2. ADR 인덱스에 행 추가

**파일**: `docs/90-decisions/boilerplate/README.md`

**기존**: 인덱스 표의 마지막 행이 `| 058 | Design Workflow ... |`.

**수정**: 그 아래에 한 행을 추가한다(Amendments 칸의 빈 표기는 이 표의 관례대로 em dash `—`를 쓴다).

```
| 059 | Flutter/모바일 프로파일 (Android·iOS 직접 지원) | accepted | — | ADR-031을 Flutter에 한해 해제 — npm broker + 등록 source root format + analyze 심각도 분리 + 로컬 golden + e2e 5상태·suite 경로 판정 + ARCH 7-5 + 시크릿 2단 분류 |
```

**추가 수정**: 같은 표의 `| 031 |` 행 Amendments 칸의 `—`를 아래로 교체한다(2-3이 amendment를 추가하므로 인덱스 대조가 어긋나지 않게).

```
(+#amend-1: Flutter를 직접 지원 범위로 이관 — ADR-059, --override 미구현 명시)
```

## 2-3. ADR-031에 Amendment 1 추가

**파일**: `docs/90-decisions/boilerplate/ADR-031-non-web-out-of-scope.md`

**기존**: `## 참고` 섹션이 마지막이며 `## Surfaces` 블록이 없다.

**수정 (1) — `## Surfaces` 블록은 `## 참고` *앞*에 넣는다.** ADR-045 D3가 위치를 그렇게 정해 뒀다(같은 저장소의 ADR-052·ADR-014도 Surfaces가 참고 앞에 있다). 아래 블록을 `## 참고` 바로 위에 삽입한다.

```markdown
## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT)
- .claude/skills/bootstrap-stack/SKILL.md          — 스택 조합 평가 시 직접지원 유형 정합 확인
- .claude/skills/bootstrap-design/SKILL.md         — 컴포넌트 시작점 표의 override 표기
- .claude/skills/stack-guard/SKILL.md              — 비-Node/override adapter 경로
- docs/90-decisions/boilerplate/ADR-027-interface-decision-allocation.md
- docs/90-decisions/boilerplate/ADR-053-high-stakes-design-panel.md
- AGENTS.md
- README.md
- README_ko.md
```

위 8개 파일은 **전부 이미 `ADR-031`을 본문에서 인용하고 있다**(확인: `grep -c ADR-031 <각 파일>`). 그래서 Surfaces 신설만으로 역참조 정합이 성립한다 — 단 하나 예외가 `bootstrap-design`이며, 그 인용 문구가 지금 틀렸으므로 2-4에서 함께 고친다.

**수정 (2) — `## Amendment 1`은 파일 맨 끝에 추가한다.** amendment는 `## 참고` 뒤가 관례다(ADR-052·ADR-014 동일).

```markdown

<a id="adr-031-amend-1"></a>
## Amendment 1 — Flutter를 직접 지원 범위로 이관

### 결정
본문 `## 결정`의 *기본 자동화 범위 밖* 목록에서 **Flutter를 제외**한다. Flutter(Android·iOS 타깃)는 ADR-059가 정의하는 직접 지원 프로파일을 따른다. 목록의 나머지(iOS Swift / Android Kotlin / RN / ML·data science / embedded·firmware / game / desktop native)는 변경 없다.

`## fork 사용자 override 절차`의 `--override` 항목은 **구현 surface가 없는 미구현 절차**임을 명시한다. 범위 밖 스택으로 진행하려는 fork 사용자는 플래그가 아니라 **자기 project ADR을 발행해 본 ADR을 supersede**하는 경로를 쓴다.

### 근거
- [관측됨] `--override`는 본 ADR 본문 외 어디에도 존재하지 않으며 이를 처리하는 skill이 없다.
- [관측됨] 본 ADR에 `## Surfaces` 블록이 없어 참조 정합 검사가 이 결손을 검출하지 못했다. 본 amendment에서 함께 신설한다.

### 강도 (ADR-022)
- enabling(약) — 범위 표기 정정 + 미구현 절차 명시.
```

**추가 수정**: `## 결정` 본문의 범위 밖 목록은 **고치지 않는다.** ADR은 기록물이므로 기존 항목을 덮어쓰지 않고 amendment가 정정을 선언한다(같은 저장소의 ADR-056이 base 결정을 amendment로 정정하고 상단에 `## 현재 유효 결정`을 둔 것과 동일한 방식).

대신 **읽는 사람이 본문만 보고 잘못 따라가지 않도록** 상단에 현재 상태 요약을 추가한다.

**기존** (파일 앞부분):

```
## Status
accepted

## 배경
```

**수정**:

```
## Status
accepted

## 현재 유효 결정
- 본문 `## 결정`의 범위 밖 목록에서 **Flutter는 Amendment 1로 제외**됐다 — Flutter(Android·iOS)는 ADR-059의 직접 지원 프로파일을 따른다. 목록의 나머지는 그대로 유효하다.
- `## fork 사용자 override 절차`의 `--override`는 **구현 surface가 없는 미구현 절차**다(Amendment 1). 범위 밖 스택은 project ADR로 본 ADR을 supersede하는 경로를 쓴다.

## 배경
```

## 2-4. bootstrap-design의 "override 경로" 표기 정정

2-3이 `## Surfaces`에 `bootstrap-design/SKILL.md — 컴포넌트 시작점 표의 override 표기`를 등재한다. **그 표기가 지금 ADR-031#amend-1과 정면으로 어긋나므로 함께 고친다** — 안 고치면 등재하자마자 fan-out이 갈라진다.

**파일**: `.claude/skills/bootstrap-design/SKILL.md`

**기존** (컴포넌트 시작점 표의 두 행 + 아래 안내 문장):

```
  | Flutter *(ADR-031 override 시)* | ShadCN-Flutter 또는 Material 3 |
```

```
  기본 자동화 직접 지원 스택: React/Vue/Svelte/Astro. RN·Flutter·SwiftUI는 ADR-031 override 경로.
```

**수정**:

```
  | Flutter (Android·iOS — 직접 지원) | ShadCN-Flutter 또는 Material 3 |
```

**시작점 제안(오른쪽 칸)은 바꾸지 않는다** — 고칠 대상은 *"override 경로"라는 범위 표기*뿐이고, 어떤 컴포넌트 라이브러리를 권하느냐는 이번 개선의 범위가 아니다.

```
  기본 자동화 직접 지원 스택: React/Vue/Svelte/Astro + Flutter(Android·iOS — ADR-059). RN·SwiftUI는 ADR-031 override 경로.
```

**추가 확인**: 같은 파일의 `- 비-UI 프로젝트는 호출되지 않음 (ADR-031 직접 지원 범위 밖).` 줄은 *비-UI*를 가리키므로 그대로 둔다.

```bash
grep -n "ADR-031\|Flutter" .claude/skills/bootstrap-design/SKILL.md
```

**합격 기준**: `Flutter`가 `override` 와 같은 줄에 남아 있지 않을 것.

## 2-5. 확인

```bash
grep -c "ADR-059" docs/90-decisions/boilerplate/README.md   # 1 이상
ls docs/90-decisions/boilerplate/ADR-059-flutter-mobile-profile.md
grep -n "## Surfaces" docs/90-decisions/boilerplate/ADR-031-non-web-out-of-scope.md
grep -n "^| 031 " docs/90-decisions/boilerplate/README.md   # Amendments 칸에 #amend-1
```

```
git add docs/90-decisions/boilerplate/ADR-059-flutter-mobile-profile.md docs/90-decisions/boilerplate/README.md docs/90-decisions/boilerplate/ADR-031-non-web-out-of-scope.md .claude/skills/bootstrap-design/SKILL.md
```

> **커밋 메시지**
> `docs(adr): add ADR-059 Flutter/mobile profile and carve Flutter out of ADR-031`

---

# 단계 3. ARCH `## 7-5` 신설 + 소비자 배선

## 3-1. ARCHITECTURE_OVERVIEW.md에 `## 7-5` 추가

**파일**: `docs/20-system/ARCHITECTURE_OVERVIEW.md`

**기존**: `## 7-4. 프론트 결정` 블록이 끝나고 빈 줄 두 개 뒤에 `## 8. 품질 속성`이 온다.

**수정**: `## 7-4` 블록의 마지막 항목(`### 폼 validation` 주석)과 `## 8. 품질 속성` 사이에 아래를 삽입한다.

```markdown
<a id="arch-7-5"></a>
## 7-5. 모바일 클라이언트 결정
<!-- 모바일 앱 스택(Flutter 등)일 때만 채운다. /bootstrap-stack이 채운다.
     **비-모바일 프로젝트는 스택 확정 시 /bootstrap-stack이 본 sub-section을 통째 삭제.**
     웹 전용 결정(SSR·SEO·쿠키 토큰 등)은 `## 7-4`가 소유한다 — 중복 기재 금지. -->

### 대상 플랫폼·최소 OS
<!-- Android / iOS 중 무엇을 지원하는가, 각 최소 버전. 졸업 기준의 "선언된 target"이 여기서 나온다. -->

### 화면 이동
<!-- 라우팅 방식과 라이브러리. 딥링크 처리 위치. 예: go_router / Navigator 2.0. -->

### 상태관리
<!-- 무엇을 쓰는가와 그 이유. 프레임워크 내장 수단으로 충분한지, 외부 라이브러리를 쓰는지. -->

### 로컬 저장·오프라인
<!-- 저장소 종류, 스키마 마이그레이션, 오프라인 큐·동기화 정책. -->

### 권한 요청 흐름
<!-- 어떤 권한을, 언제, 거부 시 어떤 화면으로. -->

### 네이티브 연동
<!-- platform channel 사용 여부와 경계. 네이티브 코드가 들어가는 위치. -->

### 빌드 flavor·환경변수
<!-- dev/staging/prod 분리 방식, `--dart-define` 키 이름. -->

### 백그라운드·앱 생명주기
<!-- 백그라운드 작업, 푸시 수신, 포그라운드 복귀 시 갱신 정책. -->

### WebView 브리지 (해당 시)
<!-- 앱 안에 웹 화면을 넣는 경우: 로드할 주소, 앱↔웹 데이터 교환 방식, 인증 토큰 전달 방법.
     해당 없으면 "N/A". -->

### 서명·배포
<!-- 서명키 보관 위치(저장소 밖), 스토어 계정, 버전 규칙, 크래시 리포팅. -->

### Don'ts
<!-- 예:
     - 화면 위젯에서 저장소·네트워크 직접 호출 금지
     - 권한 요청을 앱 시작 시 일괄 요청 금지
     - 서명키·인증서를 저장소에 커밋 금지
     - 배포 빌드에 디버그 전용 진입점(테스트 드라이버 등) 포함 금지 -->

```

## 3-2. ADR-027에 Amendment 8 추가

**파일**: `docs/90-decisions/boilerplate/ADR-027-interface-decision-allocation.md`

**수정**: 파일 맨 끝에 추가한다.

```markdown

<a id="adr-027-amend-8"></a>
## Amendment 8 — ARCH `## 7-5` 모바일 클라이언트 결정 신설

> **amend 근거 (ADR-045#d6)**: `## Amendment 7`이 grandfather 조항을 근거로 amend를 택하면서 *"다음 변경 시 통합 재발행 우선 검토"* 를 남겼고, 본 amendment가 그 다음 변경이다. 검토 결과 **다시 amend를 택한다** — 근거 셋: ① 본 변경은 기존 결정을 뒤집지 않고 *결정 자리 하나를 추가*하며 #amend-3의 신호 목록만 정정한다(D6 표의 "충돌 없는 확장 + 문구 정정" 칸). `## Surfaces` **신규 추가는 2개**(`ARCHITECTURE_OVERVIEW.md`·`bootstrap-stack`)이고 나머지는 기존 항목에 주석을 더한 것이라 "surface 5+ 추가" 트리거에 닿지 않는다 ② 통합 재발행은 결정 15개 + 개정 7개를 재작성하고 Surfaces 14개 파일의 인용을 재지정해야 해 이번 변경 규모에 비해 churn이 압도적이다 ③ `## 현재 유효 결정`이 net 규칙을 이미 요약하므로 fold 부담이 낮다. **다만 개정이 8개에 도달했으므로 다음 변경에서는 amend를 기본값으로 두지 않고 통합 재발행을 먼저 설계한다.**

### 배경
- [관측됨] `## 7-4. 프론트 결정`의 소항목이 웹 전용이다(SSR-CSR·SEO·쿠키/스토리지 토큰 저장·폼 validation 라이브러리). 모바일 앱에 존재하지 않는 개념이다.
- [관측됨] 모바일에 필요한 결정(대상 플랫폼·최소 OS·권한 흐름·딥링크·오프라인 동기화·빌드 flavor·서명·스토어)이 앉을 자리가 저장소 어디에도 없다.

### 결정
1. `ARCHITECTURE_OVERVIEW.md`에 **`## 7-5. 모바일 클라이언트 결정`**을 신설한다. 채움 주체는 `/bootstrap-stack`이며, 비해당 프로젝트는 **통째 삭제**한다(`## 7-1`~`## 7-4`와 동일 규칙).
2. `## 7-4`는 **웹 전용으로 유지**한다. 모바일 프로젝트는 `## 7-4`를 삭제하고 `## 7-5`를 채운다. 두 섹션에 같은 결정을 중복 기재하지 않는다.
3. 인터페이스 CHECK 대상에 `## 7-5`를 추가한다 — **본 ADR `## Surfaces`가 열거하는 소비자 전부**가 대상이다: validator의 인터페이스 CHECK 규칙, `validate-workitem`의 Arch-iface audit, reviewer의 `[Plan-arch-iface]`, `validate-plan`의 읽기 목록과 같은 차원, plan-workitem의 task 유형 prefilter, stabilize의 `### Don'ts` 키워드 grep, TASK/FEATURE 템플릿의 `Architecture-Iface:` 예시, builder의 인터페이스 SSOT 열거. **agent 정의(validator.md·reviewer.md)만 고치고 skill 사본을 빼면 실제 감사는 여전히 `## 7-5`를 보지 않는다.**
4. **#amend-3 canonical 절차 3항을 정정한다** — 추가 신호 (a)를 *"ARCH `## 7-4. 프론트 결정` **또는** `## 7-5. 모바일 클라이언트 결정` 활성"* 으로, (b)의 UI 키워드 목록에 **`widget` / `위젯`** 을 더한 것으로 읽는다. #amend-3 본문은 기록이므로 고치지 않고 본 항이 유효 판정을 대체한다(#amend-2 결정 24·#amend-5와 동일 방식).

### 강도 (ADR-022)
- enabling(약) — 결정 자리 신설 + 기존 검사 대상 확장.

### 적용 surface
- docs/20-system/ARCHITECTURE_OVERVIEW.md
- docs/90-decisions/boilerplate/ADR-027-interface-decision-allocation.md (`## 현재 유효 결정` + `## Surfaces`)
- .claude/skills/bootstrap-stack/SKILL.md
- .claude/skills/plan-workitem/SKILL.md
- .claude/skills/plan-milestone/SKILL.md
- .claude/skills/validate-workitem/SKILL.md
- .claude/skills/validate-plan/SKILL.md
- .claude/skills/stabilize-milestone/SKILL.md
- .claude/skills/stack-guard/SKILL.md
- .claude/agents/validator.md
- .claude/agents/reviewer.md
- .claude/agents/builder.md
- docs/30-workitems/_templates/TASK_TEMPLATE.md
- docs/30-workitems/_templates/FEATURE_TEMPLATE.md
- docs/00-meta/WORKFLOW.md
- docs/00-meta/STRUCTURE.md
```

**추가 수정 (1)**: 같은 파일의 `## Surfaces` 블록에 아래 두 행을 추가한다(기존 14행에 `ARCHITECTURE_OVERVIEW.md`·`bootstrap-stack`이 없어 fan-out 목록이 실제 소비자보다 좁다).

```
- docs/20-system/ARCHITECTURE_OVERVIEW.md              — #amend-8 `## 7-5` 모바일 결정 자리
- .claude/skills/bootstrap-stack/SKILL.md              — #amend-8 7-1~7-5 채움/삭제 규칙
```

**추가 수정 (2)**: 같은 블록의 `validate-plan` / `validate-workitem` / `validator.md` / `reviewer.md` / `plan-workitem` / `TASK_TEMPLATE.md#7` / `FEATURE_TEMPLATE.md#11` 행 주석 끝에 `, #amend-8 7-5`를 덧붙인다.

**추가 수정 (3)**: `docs/90-decisions/boilerplate/README.md` 인덱스 `| 027 |` 행에서 —

- Amendments 칸은 `(+#amend-1: ... , +#amend-7: ...)` 형태의 한 괄호다. **그 괄호를 닫는 마지막 `)` 바로 앞**에 `, +#amend-8: ARCH 7-5 모바일 결정 자리 신설 + #amend-3 신호 정정`을 삽입한다.
- 한 줄 요약의 `ARCHITECTURE 7-1~7-4(API/CLI/백엔드/프론트)`를 `ARCHITECTURE 7-1~7-5(API/CLI/백엔드/프론트/모바일)`로 바꾼다.

## 3-3. bootstrap-stack의 채움/삭제 규칙 확장

**파일**: `.claude/skills/bootstrap-stack/SKILL.md`

### (a) `## 7-1`~`## 7-4` 범위 표기를 이 파일 전체에서 갱신

> **주의 — 줄 전체를 갈아끼우지 말 것.** 이 파일의 해당 줄들은 뒤에 문장이 더 이어진다(예: `## 3-1` 디렉터리 트리 안내, ADR-101 매핑, monorepo KEEP-list 설명). **`` `## 7-1`~`## 7-4` `` 라는 토큰만 치환**한다. 아래 (b)~(e)도 같다.

**대상 확인**:

```bash
grep -n '7-1`~`## 7-4\|7-1~7-4' .claude/skills/bootstrap-stack/SKILL.md
```

**수정**: 나오는 **모든** 위치에서 `## 7-4` → `## 7-5`로 범위 끝을 올린다. 현재 4곳이며 각각 역할이 다르다.

| 위치 | 역할 |
|---|---|
| ARCHITECTURE_OVERVIEW 갱신 목록 불릿 | 채울 sub-section 범위 |
| ADR-101-stack-selection 불릿 | architect sub-call이 채우는 범위 |
| 비해당 sub-section 처리 항목 | 삭제/보존 규칙 범위 |
| monorepo KEEP-list 주석 (`§7-1~7-4 삭제 금지`) | 다중 스택 보존 범위 |

치환 후 예(첫 번째 위치):

```
   - `docs/20-system/ARCHITECTURE_OVERVIEW.md` — **`## 7. 기술 선택`**(고-stakes는 §7 결정 블록: 옵션≥2/신뢰도/재검토) + 해당 **`## 7-1`~`## 7-5`** 컨벤션 + ...(이하 기존 문장 그대로)
```

### (b) 비해당 sub-section 삭제 규칙에 모바일 분기 한 문장 추가

(a)의 토큰 치환은 이미 끝났다고 보고, 여기서는 **문장 하나를 덧붙인다.** 대상은 `**비해당 ... 처리 — 단일 스택은 통째 삭제, 다중 스택(monorepo)은 KEEP-list**`로 시작하는 항목이며, 그 항목 **끝**에 아래를 붙인다.

```
 **모바일 앱 스택이면 `## 7-5`를 채우고 `## 7-4`를 삭제한다**(웹 화면이 함께 있는 경우에만 둘 다 보존 — ADR-027#amend-8).
```

### (c) architect sub-call 매핑

**기존** (BASE 문서화 흐름 2의 ADR-101 불릿 안):

```
API 감지 → 7-1+7-3, CLI → 7-2, 프론트 → 7-4.
```

**수정**:

```
API 감지 → 7-1+7-3, CLI → 7-2, 웹 프론트 → 7-4, 모바일 앱(Flutter) → 7-5.
```

### (d) 디폴트 디렉터리 구조 표에 Flutter 행 추가

**기존** (표 마지막 행):

```
| Python CLI | `src/<pkg>/{cli,core,...}/`, `tests/` |
```

**수정**: 그 아래에 추가한다.

```
| Flutter (Android·iOS) | `lib/{app,features,shared}/`, `test/`, `integration_test/` |
```

이 행에서 실제로 의미 있는 것은 뒤 두 칸이다. `test/`(위젯·유닛)와 `integration_test/`(실제 device e2e)는 Flutter 도구체인이 **디렉터리 이름으로** 구분하므로 이름을 바꾸면 검증 배선이 끊긴다. `lib/` 아래 구획은 다른 행들과 같은 수준의 출발점 제안일 뿐이며, 프로젝트가 필요로 하기 전에 계층을 더 쪼개지 않는다.

### (e) 마지막 출력의 후속 안내

**기존**:

```
5. 프론트 스택 감지 시 마지막 출력에 "frontend 감지됨. `/bootstrap-design` 권장" 1줄.
```

**수정**:

```
5. 화면이 있는 스택(웹 프론트 또는 모바일 앱) 감지 시 마지막 출력에 "UI 스택 감지됨. `/bootstrap-design` 권장" 1줄.
```

## 3-4. validator의 인터페이스 CHECK 확장

**파일**: `.claude/agents/validator.md`

**기존**: 인터페이스 CHECK 항목이 `- UI:` / `- MCP:` / `- API:` / `- CLI:` 네 줄로 나열돼 있고 모바일 항목이 없다.

**수정**: `- CLI: 7-2 출력 포맷 컨벤션 준수?` 로 시작하는 줄 **바로 다음 줄**에 아래 한 줄을 삽입한다.

```
- 모바일: 본 task 가 ARCH `## 7-5. 모바일 클라이언트 결정` 의 항목(대상 플랫폼·권한 흐름·화면 이동·로컬 저장·빌드 flavor·네이티브 연동)을 건드렸는가? 건드렸다면 그 결정과 어긋나지 않는가. `## 7-5` 의 `### Don'ts` 위반이 보이면 `P0 [Arch-iface-violation] <file:line> — ARCH ## 7-5 Don'ts 위반 의심: <키워드>` 기록. `## 7-5` 부재 시 본 항목 skip + 사유 명시. (ADR-059 D7)
```

## 3-5. reviewer의 `[Plan-arch-iface]` 확장

**파일**: `.claude/agents/reviewer.md`

**기존** (`[Plan-arch-iface]` 차원 설명의 열거 부분):

```
/ `## 7-4` (프론트 결정 — 라우팅 / 상태관리 / SSR-CSR / i18n / SEO / 인증 / 폼 validation) 의 기존 결정과 어긋나는
```

**수정**:

```
/ `## 7-4` (웹 프론트 결정 — 라우팅 / 상태관리 / SSR-CSR / i18n / SEO / 인증 / 폼 validation) / `## 7-5` (모바일 클라이언트 결정 — 대상 플랫폼 / 화면 이동 / 상태관리 / 로컬 저장 / 권한 흐름 / 네이티브 연동 / 빌드 flavor / 서명·배포, ADR-059 D7) 의 기존 결정과 어긋나는
```

> 같은 파일의 Design Consistency 차원에 있는 `7-4` 언급은 시각 설계 맥락이므로 **건드리지 않는다.**

## 3-6. plan-workitem의 task 유형 prefilter 확장

**파일**: `.claude/skills/plan-workitem/SKILL.md`

**기존**:

```
- **UI task 신호**: `component`, `컴포넌트`, `page`, `페이지`, `screen`, `view`, `route` (라우팅 결정 시 7-4 도 함께), `UI`, `frontend`, `프론트`, `style`, `theme`, JSX/TSX 파일 path
```

**수정**:

```
- **UI task 신호**: `component`, `컴포넌트`, `widget`, `위젯`, `page`, `페이지`, `screen`, `view`, `route` (라우팅 결정 시 7-4/7-5 도 함께), `UI`, `frontend`, `프론트`, `style`, `theme`, JSX/TSX/`.dart` 파일 path
- **모바일 task 신호**: `권한`, `permission`, `deep link`, `딥링크`, `푸시`, `push`, `flavor`, `platform channel`, `네이티브`, `background`, `백그라운드`, `서명`, `signing`, `store`, `스토어`, `WebView` — 매칭 시 ARCH `## 7-5` cross-check 활성
```

## 3-7. stabilize의 `### Don'ts` grep 대상 확장

**파일**: `.claude/skills/stabilize-milestone/SKILL.md`

**기존** (5-4 항목의 첫 문장):

```
   5-4. **API/CLI 스택 한정 — 7-x Don'ts 위반 grep** (best-effort heuristic): ARCH 의 `## 7-1` 의 `### Don'ts` / `## 7-2` 의 `### Don'ts` 본문에서 *명시적 금지 키워드* 를 추출
```

**수정**:

```
   5-4. **7-x Don'ts 위반 grep** (best-effort heuristic): ARCH 의 `## 7-1` / `## 7-2` / `## 7-5` 의 `### Don'ts` 본문에서 *명시적 금지 키워드* 를 추출
```

**추가 수정**: 같은 항목 아래의 gap 명시 문단에서 `## 7-3` / `## 7-4`만 남기도록 문구를 조정한다.

**기존**:

```
   > **7-3 백엔드 / 7-4 프론트 의 milestone-level deterministic gap 명시**: 현 ARCH TEMPLATE 의 `## 7-3` / `## 7-4` 는 `### Don'ts` 자리가 없어 본 5-4 grep 이 *skip* 한다.
```

**수정**:

```
   > **7-3 백엔드 / 7-4 프론트 의 milestone-level deterministic gap 명시**: 현 ARCH TEMPLATE 의 `## 7-3` / `## 7-4` 는 `### Don'ts` 자리가 없어 본 5-4 grep 이 *skip* 한다(`## 7-5`는 `### Don'ts`를 가지므로 대상이다).
```

## 3-8. 나머지 인터페이스 CHECK 소비자 (여기가 빠지면 `## 7-5`는 아무도 검사하지 않는다)

3-4·3-5는 **agent 정의**(`validator.md`·`reviewer.md`)를 고쳤다. 그런데 실제 감사를 도는 **skill 쪽에 같은 열거의 사본**이 있고, task/feature 템플릿에도 링크 예시가 있다. ADR-027 `## Surfaces`가 이 파일들을 이미 fan-out 대상으로 열거해 두었으므로 함께 고친다.

**대상 확인**:

```bash
grep -rn "7-4" .claude/skills/validate-workitem/SKILL.md .claude/skills/validate-plan/SKILL.md \
  .claude/skills/plan-milestone/SKILL.md .claude/skills/bootstrap-stack/output-checklist.md \
  .claude/agents/builder.md docs/30-workitems/_templates/TASK_TEMPLATE.md \
  docs/30-workitems/_templates/FEATURE_TEMPLATE.md docs/00-meta/WORKFLOW.md
```

각 파일에서 아래대로 고친다. **모두 열거 안에 `7-5`를 끼워 넣는 부분 치환이며 문장 전체를 갈아끼우지 않는다.**

| 파일 | 무엇을 고치나 |
|---|---|
| `.claude/skills/validate-workitem/SKILL.md` | 요약 목록의 `Arch-iface 7-1/7-2/7-3/7-4 audit (API/CLI/백엔드/프론트)` → `... 7-1/7-2/7-3/7-4/7-5 audit (API/CLI/백엔드/프론트/모바일)`. 본문 audit 항목의 `**API/CLI/백엔드/프론트 — Arch-iface audit**` 제목에 `/모바일` 추가 + `` `## 7-4` `` 뒤에 `` / `## 7-5` `` 추가 |
| `.claude/skills/validate-plan/SKILL.md` | 읽기 목록의 `` `## 7-4` `` 뒤와 `[Plan-arch-iface]` 차원 열거의 `` `## 7-4` `` 뒤에 각각 `` / `## 7-5` `` 추가 |
| `.claude/agents/builder.md` | 인터페이스 SSOT 열거 `... / 7-4 프론트)` → `... / 7-4 프론트 / 7-5 모바일)` |
| `docs/30-workitems/_templates/TASK_TEMPLATE.md` | `Architecture-Iface:` 주석의 링크 예시에 `[## 7-5 모바일](../../20-system/ARCHITECTURE_OVERVIEW.md#arch-7-5)` 추가 |
| `docs/30-workitems/_templates/FEATURE_TEMPLATE.md` | 같은 자리에 같은 예시 추가 |
| `docs/00-meta/WORKFLOW.md` | 7-x 정책 포인터 줄의 `` `## 7-4` `` 뒤에 `` / `## 7-5` `` 추가 |
| `.claude/skills/bootstrap-stack/output-checklist.md` | `비-UI 프로젝트는 7-4(프론트) 섹션 생략` → `비-UI 프로젝트는 7-4(프론트)·7-5(모바일) 섹션 생략, 모바일 앱은 7-5만 채움` |
| `.claude/skills/plan-milestone/SKILL.md` | `엔지니어링 내부 — ARCH §7-4 영역` → `엔지니어링 내부 — ARCH §7-4/§7-5 영역` |

**남은 두 곳**(범위 표기)도 함께 고친다.

- `AGENTS.md`의 ADR-027 링크 줄: `ARCH 7-1~7-4 cross-surface enforcement` → `ARCH 7-1~7-5 cross-surface enforcement`. (한 줄 안 치환이므로 100줄 상한에 영향 없다.)
- `docs/00-meta/STRUCTURE.md` Canonical Owner 표: `DESIGN.md + ARCH 7-1~7-4 cross-surface enforcement` → `... 7-1~7-5 ...`.

## 3-9. 확인

```bash
grep -n "arch-7-5" docs/20-system/ARCHITECTURE_OVERVIEW.md
# 7-4로 끝나는 범위 표기가 살아 있는 지시문에 남았는지
# (ADR-055 "Preserved invariants"·ADR-027 결정 15·#amend-1 마이그레이션 항목은 기록물이라 제외)
grep -rn "7-1~7-4\|7-1\`~\`## 7-4" .claude AGENTS.md docs/00-meta docs/30-workitems \
  docs/90-decisions/boilerplate/README.md
grep -n "7-1~7-4" docs/90-decisions/boilerplate/ADR-027-interface-decision-allocation.md
```

**합격 기준**: 첫 명령은 결과가 있고, 두 번째는 **출력이 없을 것**. 세 번째(ADR-027 본문)는 `## 결정` 15번과 `## Amendment 1` 마이그레이션 항목 두 줄만 남아야 한다 — 그 둘은 *그때의 기록*이므로 고치지 않는다. 상단 `## 현재 유효 결정`에 `7-1~7-4`가 남아 있으면 5-5를 안 한 것이다.

```bash
# 7-5를 실제로 아는 파일 수 (agent 3 + skill 7~8 + 템플릿 2 + meta 3 + AGENTS 1)
grep -rln "7-5" .claude/agents .claude/skills docs/30-workitems/_templates docs/00-meta AGENTS.md | wc -l
```

**합격 기준**: **10 이상**.

```
git add docs/20-system/ARCHITECTURE_OVERVIEW.md docs/90-decisions/boilerplate/ADR-027-interface-decision-allocation.md docs/90-decisions/boilerplate/README.md \
        .claude/skills/bootstrap-stack/SKILL.md .claude/skills/bootstrap-stack/output-checklist.md \
        .claude/skills/plan-workitem/SKILL.md .claude/skills/plan-milestone/SKILL.md \
        .claude/skills/validate-workitem/SKILL.md .claude/skills/validate-plan/SKILL.md \
        .claude/skills/stabilize-milestone/SKILL.md \
        .claude/agents/validator.md .claude/agents/reviewer.md .claude/agents/builder.md \
        docs/30-workitems/_templates/TASK_TEMPLATE.md docs/30-workitems/_templates/FEATURE_TEMPLATE.md \
        docs/00-meta/WORKFLOW.md docs/00-meta/STRUCTURE.md AGENTS.md
```

> **커밋 메시지**
> `feat(arch): add section 7-5 for mobile client decisions and wire its consumers`

---

# 단계 4. stack-guard Flutter 배선

## 4-1. verify 풀세트 표에 Flutter 행 추가

**파일**: `.claude/skills/stack-guard/SKILL.md`

**기존** (표 마지막 행):

```
| Rust | `cargo fmt --check` | `clippy` | `cargo check` | `cargo test` | (선택) |
```

**수정**: 그 아래에 추가한다.

```
| Flutter/Dart (유형: 모바일 앱 — Android·iOS) | `dart format --output=none --set-exit-if-changed <등록 source root>` | `flutter analyze` (플래그 없이 — 완화하면 info 진단이 전부 빠진다, ADR-059 D2) | (lint 단계에 포함 — `flutter analyze`가 타입 검사를 겸한다) | `flutter test` | `flutter test integration_test` |
```

**추가 수정**: 표 아래 설명 문단의 4단계 규칙에 예외를 명시한다.

> **주의**: 아래 두 "추가 수정"은 **같은 한 줄**의 서로 다른 부분을 고친다. 그 줄에는 인용에 안 보이는 문장이 더 있으니(`e2e는 validate:e2e 별도 명령으로 분리` 등) **줄 전체를 갈아끼우지 말고 인용된 조각만 치환**한다.

**기존**:

```
생성된 `validate` 명령은 위 표의 **format / lint / typecheck / unit test 4단계**를 *순서대로* 묶고,
```

**수정**:

```
생성된 `validate` 명령은 위 표의 **format / lint / typecheck / unit test 4단계**를 *순서대로* 묶고(**Flutter/Dart는 `flutter analyze`가 lint와 typecheck를 겸하므로 3단계이며, 이때 "missing: typecheck"로 보고하지 않는다** — ADR-059 D2),
```

**추가 수정**: 같은 문단의 UI/web e2e 서술을 target 기준으로 바꾼다.

**기존**:

```
**UI/web 프로젝트(ADR-027#amend-3 UI 판정)면 stack-guard 가 `validate:e2e` 진입점 + 최소 playwright config 를 scaffold 하고 browser 를 설치한 뒤(`npx playwright install`) `validate:e2e` 까지 smoke 한다**(수행-6 + Step 5). 비-UI 는 e2e scaffold 를 skip 하되 toolchain 설치는 수행한다.
```

**수정**:

```
**runtime target 이 web 이면** stack-guard 가 `validate:e2e` 진입점 + 최소 playwright config 를 scaffold 하고 browser 를 설치한 뒤(`npx playwright install`) `validate:e2e` 까지 smoke 한다(수행-6 + Step 5). **runtime target 이 native(Android·iOS) 면** `validate:e2e` 를 `flutter test integration_test` 로 배선하고 **앱 e2e 를 Playwright 에 배선하지 않는다**(ADR-059 D8 — 단 design surface 가 있으면 design gate 용 chromium 은 설치한다). e2e 대상이 아니면 scaffold 를 skip 하되 toolchain 설치는 수행한다.
```

## 4-2. 정적 분석 표에 Dart 행 추가

**기존** (표 마지막 행):

```
| Rust | `cargo deny` + `cargo udeps` | unused deps + license/advisory 동시 점검 |
```

**수정**: 그 아래에 추가한다.

```
| Dart / Flutter | `flutter analyze`(내장) + `dependency_validator` | layer 위반 룰은 `custom_lint` 로 확장 가능. 보안 취약점은 `dart pub get` 이 표시하는 advisory + `pubspec.lock` 대상 OSV 스캐너 |
```

## 4-3. 6-1 판정을 3축으로 교체

**파일**: `.claude/skills/stack-guard/SKILL.md`

**기존** (수행-6의 6-1 항목 전체):

```
   - **6-1. UI 판정 + 재분류** (ADR-027#amend-3, ADR-058#amend-2): 매 실행 현재 파일로 다시 판정한다. `docs/20-system/DESIGN.md` 부재 → 비-UI. DESIGN.md 존재 + `## 0. Status` ≠ `draft` → UI 확정. DESIGN.md 존재 + status == `draft` → 추가 신호((a) ARCH `## 7-4. 프론트 결정` 활성, (b) ARCHITECTURE_OVERVIEW 기술 선택이 web frontend 유형) ≥1 → UI 의심(UI 로 취급). 신호 0 → 비-UI. 정상 `/bootstrap-stack → /stack-guard → /bootstrap-design` 순서에서는 DESIGN draft가 정상이고 `/bootstrap-stack`이 frontend의 ARCH 7-4를 채워 UI 의심이 발화한다. 기존 registry가 `n/a`여도 이후 frontend 신호가 생기면 이번 실행에서 UI로 재분류해 6-3~6-4-1을 수행한다. 상세: ADR-027#amend-3.
```

**수정**:

```
   - **6-1. 판정 (3축, 상호배타 아님 — ADR-059 D8 / ADR-027#amend-3 / ADR-058#amend-2)**: 매 실행 현재 파일로 다시 판정한다. 세 축을 **각각** 결정하며 동시에 참일 수 있다.
     - **design surface**: `docs/20-system/DESIGN.md` 부재 → 없음. 존재 + `## 0. Status` ≠ `draft` → 있음. 존재 + status == `draft` → 추가 신호((a) ARCH `## 7-4` 또는 `## 7-5` 활성, (b) ARCHITECTURE_OVERVIEW 기술 선택이 화면 있는 유형) ≥1 → 있음(의심 포함). 신호 0 → 없음. **design gate(6-4-1)는 이 축만 본다.**
     - **runtime target**: ARCH `## 7. 기술 선택`과 프로젝트 manifest로 판정. canonical 값은 `web`(브라우저에서 도는 앱) / `native/android` / `native/ios` / `desktop` / `none`(라이브러리·CLI)이다 — **Android 와 iOS 는 개별 값이며 `native` 하나로 합쳐 적지 않는다**(합치면 ADR-059 D4 플랫폼별 판정이 성립하지 않는다). `native/*`는 값이 아니라 그 둘을 묶는 클래스 표기이며 toolchain 분기에만 쓴다. **e2e 도구 선택(6-3·6-4)은 이 축만 본다.** 여러 값이 동시에 참일 수 있다.
     - **host environment**: 현재 OS(`windows` / `macos`). 실행 가능 범위 판단에만 쓴다. iOS 관련 항목은 `macos` 에서만 수행하고, 그 외에서는 `[미수행 — host 제약]` 으로 기록한다.
     정상 `/bootstrap-stack → /stack-guard → /bootstrap-design` 순서에서는 DESIGN status 가 draft 이고 `/bootstrap-stack` 이 ARCH `## 7-4` 또는 `## 7-5` 를 채우므로 design surface 가 "있음(의심)" 으로 발화한다. 기존 registry 가 `n/a` 여도 이후 신호가 생기면 이번 실행에서 재분류한다.
```

## 4-4. 6-2 toolchain 설치에 Flutter 추가

**기존** (6-2의 명령 열거 부분):

```
감지된 패키지 매니저로 authored devDeps 를 설치한다 — `pnpm install` / `npm install` / `pip install -e .` (또는 `uv sync`) / `go mod download` / `cargo fetch` 중 스택에 자연스러운 1종.
```

**수정**:

```
감지된 패키지 매니저로 authored devDeps 를 설치한다 — `pnpm install` / `npm install` / `pip install -e .` (또는 `uv sync`) / `go mod download` / `cargo fetch` / `flutter pub get` 중 스택에 자연스러운 1종.
```

## 4-5. 6-3 / 6-4를 target 기준으로 교체

**기존**:

```
   - **6-3. Playwright browser 설치 (UI/web 한정)**: 6-1 이 UI 면 `npx playwright install` (CI/Linux 환경이면 `npx playwright install --with-deps` 제안만 부기, 자동 실행 X — OS 패키지 sudo 필요).
```

**수정**:

```
   - **6-3. e2e 실행 환경 준비 (runtime target 기준)**:
     - **target 에 `web` 포함**: `npx playwright install` (CI/Linux 환경이면 `npx playwright install --with-deps` 제안만 부기, 자동 실행 X — OS 패키지 sudo 필요). **웹 경로는 개선 전과 동일하다.**
     - **target 에 `native/*` 포함**: **앱 e2e 목적의** 브라우저는 설치하지 않는다. 대신 `flutter doctor` 로 device 준비 상태를 확인하고, 연결된 device 가 없으면 `Needs Device: <에뮬레이터/시뮬레이터 기동 명령>` 을 출력한다. iOS 는 host 가 `macos` 일 때만 확인한다.
     - **design surface 가 있음**: target 과 무관하게 `@playwright/test` 와 `@axe-core/playwright` 를 **devDep 으로 설치**하고 **`npx playwright install chromium` 까지 수행한다.** 모듈만 있고 브라우저 바이너리가 없으면 design gate adapter 가 `exit 2`(실행 불가)를 내고 registry 가 `status: needs-install` 로 굳어 **디자인 산출물 승인·프로토타입 승격·task 분해가 연쇄로 막힌다.** 즉 native 프로젝트에서도 design gate 용 chromium 은 필수다(ADR-059 D8). 이때 설치하는 Playwright 버전은 같은 저장소의 다른 웹 패키지와 맞추면 브라우저 캐시를 공유한다 — 버전이 다르면 브라우저 세트를 새로 내려받는다.
```

**기존**:

```
   - **6-4. `validate:e2e` scaffold (UI/web 한정, e2e 필요 시)**: `playwright.config.*` 가 *부재* 하면 최소 config(`testDir: 'e2e'`, 단일 chromium project, `webServer` 는 주석 placeholder)를 생성하고, `package.json` 의 `scripts` 에 `validate:e2e` 진입점(예: `playwright test`)을 박는다. *이미 존재* 하면 덮어쓰지 않고 발견 사실만 출력에 기록(도구 감지 우선순위 정합 — 기존 도구 미덮어씀). 비-UI 프로젝트는 6-3·6-4 를 skip 하되 6-2 toolchain 설치는 수행한다. 이 e2e provision/smoke 는 milestone graduation 의 E2E MUST-run hard-block(ADR-014#amend-2 / ADR-052 D3)이 검사할 대상을 선readiness 한다.
```

**수정**:

```
   - **6-4. `validate:e2e` scaffold (runtime target 기준, e2e 필요 시)**:
     - **target 에 `web` 포함**: `playwright.config.*` 가 *부재* 하면 최소 config(`testDir: 'e2e'`, 단일 chromium project, `webServer` 는 주석 placeholder)를 생성하고 `validate:e2e` 진입점(`playwright test`)을 박는다.
     - **target 에 `native/*` 포함**: 아래 셋을 모두 한다. **Playwright 에 배선하지 않는다** — `package.json` 이 design gate 때문에 존재하더라도 그것을 앱 e2e 의 근거로 삼지 않는다(ADR-059 D8).
       1. `flutter pub add "dev:integration_test:{sdk: flutter}"` 로 dev 의존성을 명시하고 `flutter pub get` 을 수행한다. `integration_test` 는 SDK 동봉이지만 `pubspec.yaml` 에 적히지 않으면 `import 'package:integration_test/...'` 가 해석되지 않아 e2e 파일이 컴파일조차 안 된다.
       2. `integration_test/` 디렉터리를 만든다.
       3. `validate:e2e` 진입점을 **`flutter test integration_test` 로 박는다 — `-d` 를 넣지 않는다.** 이유: `-d` 는 device id 또는 이름 접두사만 받으므로 `emulator-5554` 처럼 재부팅하면 달라지는 값이나 `연결된 Android device 1대` 같은 자연어를 넣으면 명령 자체가 성립하지 않는다. `-d` 를 생략하면 러너가 **`integration_test` 지원 device 로 후보를 좁힌 뒤** 하나만 남으면 자동 선택한다(실측: android emulator + windows + chrome + edge 4개가 붙은 상태에서 emulator 자동 선택, 오류 없음). 후보가 둘 이상 남을 때만 호출 측이 `npm run validate:e2e -- -d <id>` 로 지정한다. 어떤 device 를 골라야 하는지의 *규칙*은 registry 에 적는다.
       4. **`--machine` 을 진입점에 박지 않는다** — 사람이 읽을 때는 기본 리포터가 낫고, 판정하는 쪽이 `npm run validate:e2e -- --machine` 으로 덧붙여 다시 호출한다(ADR-059 D4).
     - **공통**: *이미 존재* 하면 덮어쓰지 않고 발견 사실만 출력에 기록한다(도구 감지 우선순위 정합 — 기존 도구 미덮어씀). 이 e2e provision/smoke 는 milestone graduation 의 E2E hard-block(ADR-052#amend-1 / ADR-014#amend-4)이 검사할 대상을 선readiness 한다.
     - **6-4-a. canonical boot smoke (조건부 생성)**: e2e 대상이고 등록된 smoke 가 없을 때 —
       - **새 프로젝트이고 앱 진입점이 결정적이면**: 프레임워크 수준 boot smoke 를 1개 생성한다. 내용은 *"앱이 기동하고 첫 프레임이 예외 없이 렌더된다"* 까지이며 **어떤 화면을 볼지 고르지 않는다**(화면 선택은 제품 결정이라 계획 단계 소관).
       - **기존 코드가 있거나 로그인·외부 의존이 필요해 부팅만으로 성립하지 않으면**: 생성하지 않고 `Needs E2E Smoke — /plan-workitem 이 작성 line item 을 authoring 해야 함` 을 출력한다.
       - 생성했든 아니든 결과를 `STACK_SETUP_PLAN.md ## E2E Smoke Registry` 에 **runtime target 별로 한 행씩** 기록한다. **`native/*` 는 클래스 표기이므로 행으로 쓰지 않는다** — `native/android` 와 `native/ios` 를 함께 선언했으면 **두 행**이고 `web` 까지 선언했으면 세 행이다(ADR-059 D8). 판정도 각 행마다 따로 난다 — 한쪽 target 의 통과를 다른 쪽 근거로 쓰지 않는다.
     - e2e 대상이 아니면 6-3·6-4 를 skip 하되 6-2 toolchain 설치는 수행한다.
```

## 4-6. design gate 실행 껍데기를 npm으로 고정

**주의**: 이 불릿은 인용 뒤로 문장이 더 이어진다(`산문을 보고 재작성하지 않는다.` + adapter 의 입력 확장·출력 형식·`exit 0/1/2` 계약). **불릿을 갈아끼우지 말고, 아래 문장을 인용 지점 바로 뒤에 삽입**한다. **`**direct-support Node UI 물질화**` 라는 라벨도 그대로 둔다** — 다른 문서(PROJECT_START_CHECKLIST·ADR-058#amend-2)가 이 표현으로 이 항목을 가리킨다.

**기존** (6-4-1의 direct-support Node UI 물질화 항목 앞부분):

```
     - **direct-support Node UI 물질화**: canonical `design-gate.mjs`를 project-native 경로(기본 `scripts/design-gate.mjs`)에 **byte-copy**하고 감지된 package manager에 논리 entry `validate:design`을 배선한다.
```

**수정** (`배선한다.` 뒤에 이어 붙임 — 뒤 문장들은 그대로 유지):

```
 **이 진입점은 npm 계열(`npm run` / `pnpm` / `yarn` / `bun run`)로 박는다** — `task` 와 `make` 는 하위 명령의 종료코드를 자기 코드로 바꿔(각각 201, 2) adapter 의 `exit 1`(차단)과 `exit 2`(실행 불가) 구분을 없앤다(ADR-059 D2). Flutter 등 비-Node 스택에서도 design gate 진입점만은 npm 으로 둔다.
```

## 4-7. GUARDRAILS의 통합 진입점 문구 보강

**파일**: `docs/00-meta/GUARDRAILS_STRATEGY.md`

**기존**:

```
- 통합 진입점 — 이름은 `validate`로 고정 (`pnpm validate` / `npm run validate` / `make validate` / `task validate` 중 스택에 자연스러운 1종).
```

**수정**:

```
- 통합 진입점 — 이름은 `validate`로 고정 (`pnpm validate` / `npm run validate` / `make validate` / `task validate` 중 스택에 자연스러운 1종). **단 design gate(`validate:design`)를 쓰는 프로젝트는 그 진입점을 npm 계열로 둔다** — `task`·`make`는 하위 명령의 종료코드를 자기 코드로 대체해 adapter의 차단/실행불가 구분을 없앤다 (ADR-059 D2).
```

## 4-8. 통합 진입점 후보에서 러너 제약 명시

**파일**: `.claude/skills/stack-guard/SKILL.md`

**기존** (원칙 목록의 통합 진입점 줄):

```
- 통합 진입점 — 이름은 **`validate`로 고정** (`pnpm validate` / `npm run validate` / `make validate` / `task validate` 중 스택에 자연스러운 단일 명령).
```

**수정**:

```
- 통합 진입점 — 이름은 **`validate`로 고정** (`pnpm validate` / `npm run validate` / `make validate` / `task validate` 중 스택에 자연스러운 단일 명령). **단 `validate:design` 진입점만은 npm 계열로 둔다** — `make`·`task`는 하위 명령의 종료코드를 자기 코드로 대체해 adapter의 차단(`exit 1`)/실행불가(`exit 2`) 구분을 없앤다. Flutter 스택은 `validate` 자체도 npm으로 둔다(ADR-059 D2). **이미 생성된 진입점은 소급 교체하지 않는다**(도구 감지 우선순위 정합 — 기존 도구 미덮어씀); 기존 `validate:design`이 `make`·`task`로 물려 있으면 자동 변경 없이 출력에 1줄 보고 + 사용자 결정으로 넘긴다.
```

**범위를 좁게 둔 이유**: 종료코드 보존이 필요한 것은 **design gate adapter를 호출하는 진입점 하나**다. 통합 `validate` 전체까지 npm으로 강제하면 `make`로 잘 돌던 기존 웹·API 프로젝트를 이유 없이 바꾸게 된다. Flutter만 `validate` 전체가 npm인 것은 그 스택의 결정(D2)이며 다른 스택에 전파하지 않는다.

## 4-9. 마지막 출력 계약을 3축·5상태로 갱신

**파일**: `.claude/skills/stack-guard/SKILL.md`

4-3(3축 판정)과 1-3(5상태)이 만든 산출물과 **출력 계약이 어긋난다.** 출력 항목 목록의 두 줄을 고친다.

**기존**:

```
- UI 판정 결과 (UI 확정 / UI 의심 / 비-UI — ADR-027#amend-3 근거 신호)
```

**수정**:

```
- 판정 결과 3축 (design surface: 있음(의심 포함)/없음 — ADR-027#amend-3 근거 신호 / runtime target: web·native/android·native/ios·desktop·none — 복수 선언 가능, `native` 단독 표기 금지 / host: windows·macos) — ADR-059 D8
```

**기존**:

```
- validate:e2e smoke test 결과 (UI/web 한정 — PASS (no specs yet) / PASS / WIRING FAIL / SKIPPED)
```

**수정**:

```
- validate:e2e 상태 (e2e 대상 한정, runtime target별 — NOT_APPLICABLE / EMPTY / PASS / FAIL(wiring) / FAIL(project) / BLOCKED_ENV — ADR-052#amend-1)
```

**추가 확인**: 같은 파일에 `UI 판정`이라는 표현이 여러 곳에 남아 있다. 3축 개편 뒤에도 **design surface 축을 가리키는 말로는 유효**하므로 일괄 치환하지 않는다. 다만 *e2e 도구 선택*이나 *toolchain 분기*를 `UI 판정`으로 설명하는 자리가 있으면 그 자리만 `runtime target`으로 고친다.

```bash
grep -n "UI 판정" .claude/skills/stack-guard/SKILL.md
```

## 4-10. 확인

```bash
grep -n "Flutter/Dart" .claude/skills/stack-guard/SKILL.md
grep -n "runtime target" .claude/skills/stack-guard/SKILL.md | head -5
grep -n "E2E Smoke Registry" .claude/skills/stack-guard/SKILL.md
grep -c "no specs yet" .claude/skills/stack-guard/SKILL.md   # 0이어야 함
```

앞 세 명령은 결과가 있어야 하고, 마지막은 **0**이어야 한다.

```
git add .claude/skills/stack-guard/SKILL.md docs/00-meta/GUARDRAILS_STRATEGY.md
```

> **커밋 메시지**
> `feat(stack-guard): wire Flutter toolchain, split detection into three axes, pin design gate to npm`

---

# 단계 5. 조용한 검사 구멍 메우기

이 단계의 항목들은 **현재 "위반 없음"으로 보고되지만 실제로는 파일을 열지도 않는** 검사들이다.

## 5-1. 색상 하드코딩 grep 확장

**파일**: `.claude/skills/stabilize-milestone/SKILL.md`

**기존** (5-2 항목):

```
   5-2. **UI 프로젝트 — raw hex grep** (정규식 deterministic): 5-0 에서 회수한 변경 파일 목록 중 확장자가 `.tsx`/`.jsx`/`.ts`/`.js`/`.vue`/`.svelte`/`.astro`/`.css`/`.scss`/`.html` 인 파일에서 `#([0-9A-Fa-f]{8}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{3})\b` 패턴 grep(ERE — 3·4·6·8자리 hex 전부; `\b`로 더 긴 hex 런의 부분매치 방지. 구 `{3}([0-9A-Fa-f]{3})?`는 4자리 `#RGBA`·8자리 `#RRGGBBAA`를 놓쳤다). 일치 발견 시 IMPROVEMENT_GUIDE 에 `P1 [Design-rawhex] <file:line> — DESIGN.md ## 2 token 으로 교체 권장` 기록.
```

**수정**: 위 문장의 확장자 목록과 패턴 부분을 아래로 바꾼다(뒤에 이어지는 "**제외 (ADR-056#amend-2 …)**" 문장은 그대로 둔다).

```
   5-2. **UI 프로젝트 — raw color grep** (정규식 deterministic, **기록 등급 — 진행 차단 안 함**): 5-0 에서 회수한 변경 파일 중 아래 두 갈래로 검사한다.
   - **웹 계열** — 확장자 `.tsx`/`.jsx`/`.ts`/`.js`/`.vue`/`.svelte`/`.astro`/`.css`/`.scss`/`.html`: `#([0-9A-Fa-f]{8}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{3})\b` 패턴 grep(ERE — 3·4·6·8자리 hex 전부; `\b`로 더 긴 hex 런의 부분매치 방지). 일치 시 `P1 [Design-rawhex] <file:line> — DESIGN.md ## 2 token 으로 교체 권장`.
   - **Dart 계열** — 확장자 `.dart`: ① `Color\(0x[0-9A-Fa-f]{6,8}\)` 및 `Color\.fromARGB\(` → `P1 [Design-rawhex] <file:line>` ② `\bColors\.[a-zA-Z]+` (프레임워크 기본 팔레트 사용 — 값을 박은 것은 아니나 프로젝트 토큰을 우회함) → `P1 [Design-token-grep] <file:line> — 테마에서 가져오도록 교체 권장`. 두 라벨은 원인과 수정 방법이 달라 분리한다. **`[Design-token]`(접미 없음)은 reviewer 의 LLM 판정 차원이 이미 쓰는 라벨이므로 grep 결정분에는 `-grep` 접미를 붙인다** — `[Design-voice-grep]`/`[Design-voice]` 분리와 같은 규칙이며, 회귀 신호 집계가 라벨 정확 일치로 동작하므로 겹치면 오집계된다.
   - **Dart 정의 라인 예외**: `static +const +Color +[A-Za-z_]+ *=` 형태의 줄은 토큰 *정의*이므로 제외한다(웹의 CSS custom property 정의 라인 예외와 동형).
   - **한계(사실 기록)**: 본 검사는 문자열 검색이라 문법을 이해하지 못한다. **주석 안·문자열 리터럴 안의 색값도 함께 잡는다**(실측 확인). 그래서 본 항목은 기록 등급이며 진행을 차단하지 않는다. 문법을 이해하는 검사가 필요하면 Dart 의 공식 analyzer plugin 방식과 별도 패키지인 `custom_lint` 중 하나를 고른다(둘은 같은 것이 아니다 — ADR-059 D6).
```

> **위 두 갈래 뒤에 이어지는 기존 문장** `**제외 (ADR-056#amend-2 — 정의/사용처 라인 구분)**: ...` 은 **웹 계열 갈래에 속한다.** 문장을 옮기지 말고, 그 문장 맨 앞에 `웹 계열의 ` 를 붙여 소속을 분명히 한다(Dart 계열의 정의 라인 예외는 위 세 번째 불릿이 담당).

## 5-2. voice grep 확장

**기존** (5-2b의 첫 문장):

```
   5-2b. **UI 프로젝트 — voice grep** (정규식 deterministic — ADR-056 결정 10): 5-0 회수 변경 파일(5-2와 동일 확장자 집합)에서
```

**수정**:

```
   5-2b. **UI 프로젝트 — voice grep** (정규식 deterministic — ADR-056 결정 10): 5-0 회수 변경 파일(5-2의 웹 계열 확장자 집합 + `.dart`)에서
```

## 5-3. 컴포넌트 인벤토리 경로 확장

**기존** (5-3의 첫 문장):

```
   5-3. **UI 프로젝트 — 컴포넌트 인벤토리 drift** (best-effort heuristic): `src/components/`, `app/components/`, `components/` 중 존재하는 디렉터리의 컴포넌트 파일명 (예: `Button.tsx`, `Card.tsx`) 목록
```

**수정**:

```
   5-3. **UI 프로젝트 — 컴포넌트 인벤토리 drift** (best-effort heuristic): `src/components/`, `app/components/`, `components/`, `lib/widgets/`, `lib/**/widgets/` 중 존재하는 디렉터리의 컴포넌트 파일명 (예: `Button.tsx`, `Card.tsx`, `primary_button.dart`) 목록
```

## 5-4. plan-workitem의 컴포넌트 실측 경로 확장

**파일**: `.claude/skills/plan-workitem/SKILL.md`

**기존**:

```
  - (b) 실제 `src/components/` · `app/components/` · `components/` 디렉터리의 기존 컴포넌트 파일명 (코드 실측 — DESIGN.md 미등록 컴포넌트도 포착)
```

**수정**:

```
  - (b) 실제 `src/components/` · `app/components/` · `components/` · `lib/widgets/` · `lib/**/widgets/` 디렉터리의 기존 컴포넌트 파일명 (코드 실측 — DESIGN.md 미등록 컴포넌트도 포착)
```

## 5-5. UI 판정 신호 확장을 ADR-027 상단 요약에 반영

**배경**: UI 판정 다중신호 절차의 canonical 텍스트는 ADR-027 Amendment 3 본문 한 곳에만 있다(skill들은 압축 3-case만 인라인으로 두고 `상세: ADR-027#amend-3`로 인용한다 — Amendment 3이 그렇게 규정한다). 신호를 넓히는 정정은 **단계 3-2의 Amendment 8 결정 4**가 이미 선언했다. Amendment 3 본문은 기록이므로 고치지 않는다.

남은 일은 하나 — 파일 상단 `## 현재 유효 결정`은 "지금 무엇이 유효한가"를 요약하는 **살아 있는 절**이므로 여기에 반영한다.

**파일**: `docs/90-decisions/boilerplate/ADR-027-interface-decision-allocation.md`

> **주의 — 줄을 갈아끼우지 말 것.** 이 절의 첫 항목은 매우 길다(DESIGN.md 섹션 구성·ADR-058 supersede 표기 등). 아래는 **그 안의 짧은 조각을 찾아 치환**하는 지시이며, 생략 표시(`…`)를 실제 문서에 붙여 넣으면 본문이 사라진다.

**치환 1** — 첫 항목 안에서 이 조각을 찾는다.

```
`## 7-4`(프론트)에 둔다
```

이렇게 바꾼다.

```
`## 7-4`(프론트)/`## 7-5`(모바일 — #amend-8)에 둔다
```

**치환 2** — 넷째 항목 안에서 이 조각을 찾는다.

```
UI 판정 다중신호 절차는 #amend-3.
```

이렇게 바꾼다.

```
UI 판정 다중신호 절차는 #amend-3 + 신호 정정 #amend-8 결정 4.
```

같은 절의 세 번째 항목도 범위가 낡았다.

**기존**:

```
- `/bootstrap-stack`이 7-1~7-4를 채운다.
```

**수정**:

```
- `/bootstrap-stack`이 7-1~7-5를 채운다(모바일 앱은 7-5, 웹 프론트는 7-4 — #amend-8).
```

**skill 인라인 사본**: stack-guard의 압축 3-case는 단계 4-3에서 이미 `## 7-5`를 포함하도록 교체했다. 다른 skill의 인라인 사본에는 신호 열거가 없으므로 (Amendment 3이 "장황한 신호 열거 산문"을 제거하도록 규정) 추가 수정이 없다. 확인:

```bash
grep -rn "component/컴포넌트/page" .claude/skills/   # 0줄이어야 함
grep -rln "amend-3" .claude/skills/                  # 인용만 있는지 눈으로 확인
```

## 5-6. finalize의 lockfile 자동 허용 목록 확장

**파일**: `.claude/skills/finalize-workitem/SKILL.md`

**기존**:

```
     `pnpm-lock.yaml`, `package-lock.json`, `yarn.lock`, `bun.lockb`, `Cargo.lock`, `Gemfile.lock`, `composer.lock`, `go.sum`, `Pipfile.lock`, `poetry.lock`, `uv.lock`
```

**수정**:

```
     `pnpm-lock.yaml`, `package-lock.json`, `yarn.lock`, `bun.lockb`, `Cargo.lock`, `Gemfile.lock`, `composer.lock`, `go.sum`, `Pipfile.lock`, `poetry.lock`, `uv.lock`, `pubspec.lock`
```

## 5-7. 의존성 도구 감지에 pub 추가

**파일**: `.claude/skills/bootstrap-stack/SKILL.md`

**기존** (Dependency Tools 기록 항목):

```
확정한 **scope별 의존성 도구**(npm/pnpm/yarn/bun · pip/poetry/uv · cargo · go 등)를 STACK_SETUP_PLAN `## Dependency Tools` 표에 기록한다
```

**수정**:

```
확정한 **scope별 의존성 도구**(npm/pnpm/yarn/bun · pip/poetry/uv · cargo · go · **pub(Flutter/Dart)** 등)를 STACK_SETUP_PLAN `## Dependency Tools` 표에 기록한다
```

> bootstrap-stack의 이 문장 뒤에는 신호를 *총칭*(`tool-specific 신호(lockfile·tool-manifest)`)으로만 적어 열거가 없다. 그러니 그쪽에는 추가할 목록이 없다. **열거가 실재하는 세 곳**을 아래에서 각각 고친다.

**파일**: `.claude/skills/implement-workitem/SKILL.md`

**기존** (3-DT 항목):

```
② 매핑이 없을 때만 각 slice 경로에 *인접한 고신뢰 신호*(`pnpm-lock.yaml`·`poetry.lock`·`uv.lock`·`Cargo.lock`·`go.mod` 등 tool-specific)로 추론
```

**수정**:

```
② 매핑이 없을 때만 각 slice 경로에 *인접한 고신뢰 신호*(`pnpm-lock.yaml`·`poetry.lock`·`uv.lock`·`Cargo.lock`·`go.mod`·`pubspec.lock` 등 tool-specific)로 추론
```

**파일**: `.claude/skills/plan-workitem/SKILL.md`

**기존** (의존성 도구 항목 안):

```
표·행이 없을 때만 그 경로에 *인접한 tool-specific* 신호(`pnpm-lock.yaml`·`poetry.lock`·`uv.lock`·`Cargo.lock`·`go.mod` 등)로 추론한다
```

**수정**:

```
표·행이 없을 때만 그 경로에 *인접한 tool-specific* 신호(`pnpm-lock.yaml`·`poetry.lock`·`uv.lock`·`Cargo.lock`·`go.mod`·`pubspec.lock` 등)로 추론한다
```

**파일**: `.claude/skills/stack-guard/SKILL.md` — **여기가 빠지면 Flutter 프로젝트의 Dependency Tools 교차확인이 `pub`을 못 본다.**

**기존** (6-2-0 Dependency Tools 교차 확인 항목 안):

```
저장소의 실제 *tool-specific* 신호(`package-lock.json`·`pnpm-lock.yaml`·`yarn.lock`·`bun.lockb`·`poetry.lock`·`uv.lock`·`Cargo.lock`·`go.mod` 등)를 **scope별로 대조**한다
```

**수정**:

```
저장소의 실제 *tool-specific* 신호(`package-lock.json`·`pnpm-lock.yaml`·`yarn.lock`·`bun.lockb`·`poetry.lock`·`uv.lock`·`Cargo.lock`·`go.mod`·`pubspec.yaml`+`pubspec.lock` 등)를 **scope별로 대조**한다
```

**확인**:

```bash
grep -rc "pubspec.lock" .claude/skills/implement-workitem/SKILL.md .claude/skills/plan-workitem/SKILL.md .claude/skills/stack-guard/SKILL.md .claude/skills/finalize-workitem/SKILL.md
```

네 파일 모두 1 이상이어야 한다.

## 5-8. dependency hygiene에 Dart 대응 추가

**파일**: `.claude/skills/stabilize-milestone/SKILL.md`

**기존**:

```
- `npm audit` / `pip-audit` (스택별 대응) 1회 실행.
```

**수정**:

```
- `npm audit` / `pip-audit` (스택별 대응) 1회 실행. **Dart/Flutter 는 audit 에 정확히 대응하는 명령이 없다** — `flutter pub outdated`(갱신 가능 여부)와 `dependency_validator`(미선언·미사용 의존)를 돌리고, 취약점 점검은 `dart pub get` 이 표시하는 advisory 와 `pubspec.lock` 을 대상으로 한 OSV 스캐너로 대체한다. 세 가지는 목적이 서로 달라 하나로 묶어 보고하지 않는다.
```

## 5-9. task 문서 템플릿의 runner 예시 확장

**파일**: `docs/30-workitems/_templates/TASK_TEMPLATE.md`

**기존**:

```
       runner는 jest|pytest|go|cargo 등 — 실제 실행 가능한 명령으로 채울 것.
```

**수정**:

```
       runner는 jest|vitest|pytest|go|cargo|flutter 등 — 실제 실행 가능한 명령으로 채울 것.
```

## 5-10. 목록을 소유한 ADR 동기화

5-6과 4-2는 **다른 문서가 canonical로 소유한 목록의 사본**을 고쳤다. 원본을 함께 고치지 않으면 사본과 원본이 갈라진다.

> **먼저 다음 amendment 번호를 확인한다.** 이 단계와 단계 1~3이 amendment를 붙이는 ADR들의 현재 개수를 눌러 보고, `N+1`을 쓴다. 번호를 눌러 보지 않고 쓰면 기존 amendment와 충돌한다.
>
> ```bash
> for n in 007 014 021 027 031 052; do
>   f=$(ls docs/90-decisions/boilerplate/ADR-$n-*.md)
>   echo "ADR-$n: 현재 $(grep -c '^## Amendment ' "$f")개 -> 다음 번호 $(( $(grep -c '^## Amendment ' "$f") + 1 ))"
> done
> ```
>
> **단계 3 적용 완료 시점 실측**(= 이 단계가 시작될 때의 값): **007=5개(다음 6)** / **021=1개(다음 2)** — 이 둘이 본 단계가 쓰는 값이다. 나머지는 단계 1~3이 이미 붙여 놓았다: 014=4 / 027=8 / 031=1 / 052=1. 아래 지시는 007→6, 021→2를 전제로 쓰였다 — 위 명령 결과가 다르면 실제 값으로 바꾼다.
>
> **두 amendment 모두 제목에 적용 날짜가 필요하다** — 아래 두 블록의 제목에는 날짜가 없다(§0-1). 붙여 넣은 뒤 `## Amendment N (YYYY-MM-DD) — ...` 형태로 실제 작업일을 채운다. 11-6이 검사한다.

**(a) lockfile 화이트리스트**

**파일**: `docs/90-decisions/boilerplate/ADR-007-workitem-lifecycle.md`

이 ADR의 `## Amendment 1`이 화이트리스트를 **"다음 11종"** 으로 못 박고 열거한다. 5-6이 `pubspec.lock`을 더하면 12종이 된다.

- `## 현재 유효 결정`의 `- lock file 자동 화이트리스트 11종은 #amend-1.` → `- lock file 자동 화이트리스트 12종은 #amend-1(+#amend-6: `pubspec.lock`).`
- 파일 맨 끝에 amendment를 추가한다. **번호는 6**이다(이 ADR엔 이미 1~5가 있다). **아래 블록 제목의 `## Amendment 6` 바로 뒤에 `(YYYY-MM-DD)` 형태로 적용 날짜를 끼워 넣는다**(제목 문구는 그대로) — 이 ADR의 #amend-1~#amend-5가 **전부 날짜를 갖고 있어** 안 넣으면 파일 안에서 어긋난다.

```markdown

<a id="adr-007-amend-6"></a>
## Amendment 6 — lock file 화이트리스트에 `pubspec.lock` 추가

### 결정
`## Amendment 1`의 11종에 **`pubspec.lock`(Dart/Flutter)** 을 더해 12종으로 한다. 근거는 Flutter가 직접 지원 범위에 들어왔기 때문이며(ADR-059 D1), 다른 매니저의 lock 파일과 성격이 같다(도구가 생성하고 커밋 대상이며 task 문서에 명시되지 않아도 finalize가 자동 add).

### 강도 (ADR-022)
- enabling(약) — 목록 1종 추가.

### 적용 surface
- .claude/skills/finalize-workitem/SKILL.md
```

- 인덱스 `| 007 |` 행 Amendments 칸 끝에 `, +#amend-6: pubspec.lock 추가`를 더한다.

**(b) 스택별 정적 분석 도구**

**파일**: `docs/90-decisions/boilerplate/ADR-021-static-analysis-recommendation.md`

`### 1. 스택별 정적 분석 1종 권장`의 표가 canonical이고 stack-guard의 표는 그 사본이다. 4-2가 사본에만 Dart 행을 넣었으므로 원본 쪽도 맞춰야 한다.

**단 본문 표를 직접 고치지 않는다.** 이 파일의 `## Amendment 1`이 이미 *"secret scanner 추가"* 를 **표 밖의 amendment로** 처리한 선례를 만들어 뒀다 — 즉 이 ADR의 관례는 *"본문 표 = 최초 목록, 이후 확장은 amendment"* 다. 같은 방식으로 간다.

**수정**: 파일 맨 끝에 추가한다. **번호는 2**다(현재 1개). **아래 블록 제목의 `## Amendment 2` 바로 뒤에 `(YYYY-MM-DD)` 형태로 적용 날짜를 끼워 넣는다**(제목 문구는 그대로) — 이 ADR의 #amend-1도 날짜를 갖고 있다(`## Amendment 1 (2026-05-15)`).

```markdown

<a id="adr-021-amend-2"></a>
## Amendment 2 — Dart/Flutter 정적 분석 도구

### 결정
- Dart/Flutter 스택의 권장 도구는 **`flutter analyze`(내장) + `dependency_validator`** 1조합이다. 본문 `### 1` 표에는 Dart 행이 없으므로 본 항이 그 행을 정의한다.
- 내장 `flutter analyze`가 정적 분석과 타입 검사를 겸하므로 추가 도구는 **의존성 위생**만 담당한다.
- layer 위반 룰이 필요하면 Dart의 공식 analyzer plugin 방식 또는 별도 패키지 `custom_lint`로 확장한다(둘은 다른 것 — ADR-059 D6).
- *강제 X, 권장만* — 본문 `### 2. 적용 원칙`을 그대로 따른다.

### 강도 (ADR-022)
- enabling(약) — 스택 1종의 권장 도구 추가.

### 적용 surface
- .claude/skills/stack-guard/SKILL.md (정적 분석 표 Dart 행)
```

- 인덱스 `| 021 |` 행 Amendments 칸 끝에 `, +#amend-2: Dart/Flutter 도구`를 더한다.
- **도구 이름은 4-2(stack-guard의 사본)와 같은 문자열로 맞춘다.** 원본/사본이 갈라지면 어느 쪽이 맞는지 알 수 없게 된다. 비고 문장은 지금도 두 곳이 조금씩 다르므로(예: Rust 행) 굳이 통일하지 않는다 — 맞춰야 하는 것은 **어떤 도구를 권하는가**다.

## 5-11. 확인 (실측 대조)

아래를 임시 디렉터리에 만들고 5-1의 규칙이 의도대로 동작하는지 확인한다. 확인 후 임시 디렉터리는 삭제한다.

```bash
mkdir -p /tmp/colorcheck && cd /tmp/colorcheck
cat > sample.dart <<'EOF'
import 'package:flutter/material.dart';
// 주석 안의 Color(0xFFFFFFFF) — 이 검사는 이것도 잡는다(알려진 한계)
class Tokens { static const Color primary = Color(0xFF6750A4); }
class Bad extends StatelessWidget {
  const Bad({super.key});
  @override
  Widget build(BuildContext c) => const ColoredBox(color: Color(0xFFAB1234));
}
class Palette extends StatelessWidget {
  const Palette({super.key});
  @override
  Widget build(BuildContext c) => const ColoredBox(color: Colors.blue);
}
EOF
echo "--- rawhex (정의 라인 제외 후):"
grep -nE 'Color\(0x[0-9A-Fa-f]{6,8}\)|Color\.fromARGB\(' sample.dart | grep -vE 'static +const +Color +[A-Za-z_]+ *='
echo "--- token bypass:"
grep -nE '\bColors\.[a-zA-Z]+' sample.dart
cd / && rm -rf /tmp/colorcheck
```

기대 결과: rawhex 검사가 **주석 1줄 + 실제 위반 1줄**을 잡고 **정의 라인은 제외**되며, token bypass가 `Colors.blue` 1줄을 잡는다. 주석이 잡히는 것이 5-1에 기록한 알려진 한계다.

```
git add .claude/skills/stabilize-milestone/SKILL.md .claude/skills/plan-workitem/SKILL.md .claude/skills/finalize-workitem/SKILL.md .claude/skills/implement-workitem/SKILL.md .claude/skills/bootstrap-stack/SKILL.md .claude/skills/stack-guard/SKILL.md docs/90-decisions/boilerplate/ADR-027-interface-decision-allocation.md docs/90-decisions/boilerplate/ADR-007-workitem-lifecycle.md docs/90-decisions/boilerplate/ADR-021-static-analysis-recommendation.md docs/90-decisions/boilerplate/README.md docs/30-workitems/_templates/TASK_TEMPLATE.md
```

> **커밋 메시지**
> `fix(checks): include Dart files and paths so Flutter violations stop passing silently`

---

# 단계 6. golden 배선

## 6-1. `.gitignore`에 golden 출력 제외 추가

**파일**: `.gitignore`

**기존** (마지막 두 줄):

```
# canonical validate:design output (다른 output path는 stack-guard가 첫 실행 전에 추가 — ADR-058#amend-2)
design-gate-shots/
```

**수정**: 파일 끝에 아래를 추가한다.

```
# Flutter/Dart 빌드 산출물 (경로 앞에 **/ 를 붙여 monorepo 하위 패키지까지 매칭 — 앞에 / 가 있는 패턴은 루트에만 걸린다)
.dart_tool/
.flutter-plugins
.flutter-plugins-dependencies
**/ios/Pods/
**/ios/Flutter/ephemeral/
**/android/.gradle/
**/android/local.properties
*.iml
# golden 정답 사진 — 머신마다 로컬 생성, 커밋하지 않음 (ADR-059 D3)
**/test/goldens/
**/test/failures/
```

> `ios/Pods/`처럼 슬래시가 중간에 있는 패턴은 git이 **저장소 루트 기준**으로만 해석한다. 같은 가이드가 `## Dart Source Roots`에서 `pubspec.yaml`이 여러 개인 저장소를 명시 지원하므로, `apps/mobile/ios/Pods/`가 걸리도록 `**/`를 붙인다. `.dart_tool/`·`*.iml`처럼 슬래시가 끝에만 있거나 없는 패턴은 이미 모든 깊이에 매칭되므로 그대로 둔다.

## 6-2. stack-guard에 golden 초기 절차 안내 추가

**파일**: `.claude/skills/stack-guard/SKILL.md`

**수정**: 수행-6의 6-4-a 다음에 아래 항목을 추가한다.

```
   - **6-4-b. golden 초기 절차 안내 (runtime target 이 `native` 이고 화면이 있을 때)**: golden(픽셀 비교) 정답 사진은 **커밋하지 않으며 머신마다 로컬 생성**한다(ADR-059 D3). `.gitignore` 에 `**/test/goldens/` 가 있는지 확인하고 없으면 추가한다. 그리고 `STACK_SETUP_PLAN.md` 에 아래 절차를 1회성 안내로 기록한다 — *"새 체크아웃 직후 첫 `validate` 는 정답 사진 부재로 실패한다. `flutter test --update-goldens` 를 1회 실행하고 생성된 이미지를 육안 확인한 뒤 진행한다."* golden 테스트 위젯에는 `debugShowCheckedModeBanner: false` 를 준다. **재생성 규율도 함께 적는다** — *"`--update-goldens` 는 (a) 정답 사진이 아직 없을 때, (b) UI 를 의도적으로 바꾸고 새 모습을 육안 확인했을 때만 쓴다. golden 실패를 통과시키려고 덮어쓰지 않는다 — 그러면 회귀가 정답으로 굳는다."*
```

## 6-3. 확인

```bash
grep -n "test/goldens" .gitignore
grep -n "update-goldens" .claude/skills/stack-guard/SKILL.md
```

```
git add .gitignore .claude/skills/stack-guard/SKILL.md
```

> **커밋 메시지**
> `feat(golden): keep golden baselines local and document first-run generation`

---

# 단계 7. 시크릿 보호

## 7-1. `.gitignore`에 서명 자산 추가

**파일**: `.gitignore`

**수정**: 파일 끝에 아래를 추가한다.

```
# 모바일 서명·인증서 (유출 시 사칭 배포 가능 — 절대 커밋 금지)
*.jks
*.keystore
key.properties
*.p12
*.mobileprovision
# 서버용 service account 키 (관리자 권한 — 유출 시 백엔드 전체 접근)
*-firebase-adminsdk-*.json
```

**여기 없는 것 — 의도적이다.** `google-services.json` 과 `GoogleService-Info.plist` 는 넣지 않는다. 이 두 파일은 Firebase **클라이언트** 설정이며 앱 바이너리에 담겨 배포되므로 숨기는 것이 방어가 되지 않는다. 반면 빌드에는 반드시 필요해서, 기본으로 git 에서 빼면 **새 체크아웃에서 빌드가 깨지고** 팀원마다 파일을 따로 주고받는 상태가 된다. **대신 반드시 해야 하는 것은 콘솔에서 그 키의 사용 가능 API 를 제한하고 데이터 접근은 보안 규칙·App Check 로 막는 것이다** — 제한하지 않은 키는 공개돼도 되는 키가 아니다. 여러 환경(dev/prod)을 쓰는 프로젝트가 flavor 별로 분리하기로 정했다면 그건 그 프로젝트의 결정이므로 ARCH `## 7-5` 의 `### 빌드 flavor·환경변수` 에 적고 그 프로젝트의 `.gitignore` 에서 처리한다. 보일러플레이트 기본값으로 강제하지 않는다.

**추가 지시 — 이미 추적 중인 파일 점검**: `.gitignore` 는 **이미 추적 중인 파일을 보호하지 않는다.** 기존 프로젝트에 서명 자산이 커밋돼 있으면 규칙을 추가해도 계속 추적된다. 그래서 규칙 추가 직후 아래를 실행한다.

```bash
git ls-files | grep -Ei '\.(jks|keystore|p12|mobileprovision)$|key\.properties|-firebase-adminsdk-.*\.json'
```

- **출력이 없으면** 그대로 진행한다(이 저장소는 보일러플레이트라 없는 것이 정상).
- **출력이 있으면** 순서대로 처리한다 — ① 파일을 저장소 밖으로 옮긴다 ② `git rm --cached <path>` 로 추적을 끊는다 ③ **이미 원격에 올라갔다면 키 자체를 재발급한다**(히스토리에 남은 키는 ignore 로 되돌릴 수 없다).

## 7-2. 도구 읽기 차단 목록 확장

**파일**: `.claude/settings.json`

**기존**:

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "model": "opus",
  "permissions": {
    "defaultMode": "acceptEdits",
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./secrets/**)"
    ]
  }
}
```

**수정**:

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "model": "opus",
  "permissions": {
    "defaultMode": "acceptEdits",
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./secrets/**)",
      "Read(**/*.jks)",
      "Read(**/*.keystore)",
      "Read(**/key.properties)",
      "Read(**/*.p12)",
      "Read(**/*.mobileprovision)",
      "Read(**/*-firebase-adminsdk-*.json)"
    ]
  }
}
```

> Firebase 클라이언트 설정(`google-services.json`·`GoogleService-Info.plist`)은 **읽기 차단 목록에 넣지 않는다.** 앱 바이너리에 담겨 배포되므로 읽기를 막는 것이 방어가 되지 않고, 빌드가 읽어야 하는 파일이다. 대신 콘솔에서 **키 사용 범위를 제한**한다(7-1의 설명 참조).

**이 목록이 무엇을 하고 무엇을 못 하는지 정확히 알고 넣는다.** `permissions.deny` 는 에이전트의 **파일 읽기 도구**에 적용된다. 셸에서 도는 하위 프로세스(`cat`, 빌드 스크립트 등)가 같은 파일을 읽는 것까지 막지는 못한다. 즉 이건 *실수로 서명 키를 대화에 붙여 넣는 사고*를 줄이는 2차 방어막이고, **1차 통제는 "서명 자산을 애초에 저장소 밖에 두는 것"** 이다 — keystore 와 provisioning profile 은 저장소 바깥 경로에 두고 빌드 설정이 절대경로나 환경변수로 참조하게 한다. 이 원칙을 ARCH `## 7-5` 의 `### 서명·배포` 에 적는다.

## 7-3. AGENTS.md의 금지 한 줄 확장 (Codex 쪽 비대칭 제거)

7-2가 고친 읽기 차단 목록은 **Claude Code에만 적용된다.** 다른 도구(Codex)는 OS 수준 차단이 불가해 `AGENTS.md`의 금지 문장에 의존한다(ADR-010 D5·D8이 "AGENTS 정책 의존"을 명시). 그래서 같은 목록을 그 줄에도 반영해야 두 도구가 동등해진다.

**파일**: `AGENTS.md`

**기존**:

```
- 🚫 `.env`, `secrets/` 같은 민감 파일은 건드리지 않는다.
```

**수정** (한 줄 안 치환이므로 100줄 상한에 영향 없다):

```
- 🚫 `.env`, `secrets/`, 서명키·배포 인증서·service account 키 같은 민감 파일은 읽지도 쓰지도 않는다.
```

**확장자를 열거하지 않는 이유**: `AGENTS.md`는 모든 프로젝트가 모든 세션에서 읽는 진입 문서다. 여기에 모바일 전용 확장자 6종을 박으면 웹 프로젝트도 매번 그 목록을 읽게 되고, 이 문서의 "한 줄 + 링크" 원칙에도 어긋난다. **기계가 매칭할 목록은 이미 세 곳에 있다** — `.claude/settings.json`의 읽기 차단(7-2), `.gitignore`(7-1), finalize의 민감 경로 가드(7-4). AGENTS.md에는 *스택과 무관한 금지 원칙*만 두고, 판단이 필요한 도구는 그 세 곳을 참조한다.

## 7-4. finalize의 민감 경로 가드 확장

**파일**: `.claude/skills/finalize-workitem/SKILL.md`

**기존**:

```
     - 민감 경로(`.env*`, `secrets/**`)
```

**수정**:

```
     - 민감 경로(`.env*`, `secrets/**`, `*.jks`, `*.keystore`, `key.properties`, `*.p12`, `*.mobileprovision`, `*-firebase-adminsdk-*.json`)
```

## 7-5. 확인 (시크릿 보호)

```bash
grep -c "jks" .gitignore .claude/settings.json .claude/skills/finalize-workitem/SKILL.md
grep -n "서명키" AGENTS.md      # AGENTS.md는 확장자 열거 없이 원칙 한 줄만
wc -l AGENTS.md                  # 55줄 그대로여야 함
node -e "JSON.parse(require('fs').readFileSync('.claude/settings.json','utf8')); console.log('settings.json 파싱 OK')"
```

```
git add .gitignore .claude/settings.json .claude/skills/finalize-workitem/SKILL.md AGENTS.md
```

> **커밋 메시지**
> `feat(security): keep mobile signing assets out of commits and agent reads`

---

# 단계 8. STACK_SETUP_PLAN 템플릿 확장

**파일**: `docs/00-meta/_templates/STACK_SETUP_PLAN_TEMPLATE.md`

**수정**: 파일 끝에 아래 세 섹션을 추가한다. (바깥 울타리는 물결표 4개다 — 안에 백틱 코드블록이 들어 있기 때문이며, 물결표 줄 자체는 붙여 넣지 않는다.)

~~~~markdown

## Dart Source Roots
<!-- **Dart/Flutter 스택이 아니면 이 절과 아래 `## Golden 초기 절차`를 통째 삭제한다.**
     ARCH `## 7-1`~`## 7-5`의 비해당 sub-section 삭제 규칙과 동형이며, /bootstrap-stack이
     이 template을 복사할 때 수행한다. (`## E2E Smoke Registry`는 스택 무관이라 남긴다 —
     비대상이면 `status: n/a`만 적는다. `## Design Gate Adapter`와 같은 방식.)
     Flutter/Dart 코드에서 `dart format` 대상이 되는 경로 목록.
     `.`을 쓰지 않는다 — 생성 디렉터리 순회 실패와 긴 경로 문제를 피하고,
     존재하는 소스 루트를 빠짐없이 포함하기 위해 명시 열거한다.
     `pubspec.yaml`이 여러 개인 저장소(monorepo)는 pubspec 하나당 한 묶음을 적고
     경로는 그 pubspec 디렉터리 기준 상대경로로 쓴다.
     존재하지 않는 경로는 실행 wrapper가 제외한다. -->

| pubspec 위치 | 경로 | 비고 |
|---|---|---|
| (예: . 또는 apps/mobile) | (예: lib) | |

**루트 누락 점검 (매 검증 실행 시)**: 실제 소스 트리가 이 표보다 넓어지면 새 코드가 형식 검사에서 조용히 빠진다. 표를 신뢰하기 전에 아래로 대조하고, 표에 없는 디렉터리가 나오면 표를 먼저 갱신한다.

```bash
# pubspec 디렉터리에서 실행 — 최상위 Dart 소스 디렉터리 실제 목록
find . -name '*.dart' -not -path './.dart_tool/*' -not -path './build/*' \
  | cut -d/ -f2 | sort -u
```

## E2E Smoke Registry
<!-- 졸업 판정이 "실제로 e2e가 돌았는가"를 확인할 때 쓰는 등록부.
     선언한 runtime target마다 한 행을 적는다(`native/android`와 `native/ios`를 함께 내면 두 행).
     canonical 값은 web / native/android / native/ios / desktop / none이며 `native` 단독은 적지 않는다(ADR-059 D8).
     판정도 행마다 따로 난다 — 한 target의 통과를 다른 target 근거로 쓰지 않는다.
     이 표는 판정을 *좁히는* 수단이다 — 등록이 있으면 그 이름의 테스트가 성공했는지까지
     확인하고, 없으면 "선언된 e2e 디렉터리 하위에서 1개 이상 성공"만 확인한 뒤
     P1 [E2E-registry] 를 기록한다. 미등록 자체로 졸업을 막지 않는다.
     실행 대상 칸에는 재부팅하면 달라지는 임시 id(`emulator-5554` 등)를 적지 않고
     "무엇을 고를지"의 규칙을 적는다. 이 칸은 사람이 읽는 기록이며
     실행 명령에 그대로 들어가지 않는다(진입점은 -d 를 생략한다).
     마지막 PASS 칸은 host 제약으로 지금 실행할 수 없는 target의 증거를 보존한다 —
     기록된 커밋 이후 앱 코드가 바뀌면 증거는 무효다. -->

| runtime target | status | smoke 파일 경로 | 테스트 이름 | 실행 대상 선택 규칙 | 마지막 PASS (host·날짜·커밋) | 등록일 |
|---|---|---|---|---|---|---|
| (예: native/android) | ready / n/a | (예: integration_test/boot_smoke_test.dart) | (예: BOOT_SMOKE) | (예: 연결된 Android device 1대) | | |
| (예: native/ios) | ready / n/a | | | (예: 부팅된 iOS 시뮬레이터 1대, host가 macOS일 때만) | (예: macos · 2026-07-28 · abc1234) | |
| (예: web) | ready / n/a | (예: e2e/smoke.spec.ts) | | (예: chromium) | | |

## Golden 초기 절차 (해당 시)
<!-- golden 정답 사진은 커밋하지 않으며 머신마다 로컬 생성한다.
     새 체크아웃 직후 첫 validate는 정답 사진 부재로 실패한다.
     `flutter test --update-goldens`를 1회 실행하고
     생성된 이미지를 육안 확인한 뒤 진행한다.
     재생성은 (a) 정답 사진이 아직 없을 때, (b) UI를 의도적으로 바꾸고
     새 모습을 육안 확인했을 때만. 실패를 통과시키려고 덮어쓰지 않는다. -->
~~~~

**추가 수정 (삭제 규칙 배선)**: 위 두 Dart 전용 절은 **웹·API·CLI 프로젝트에는 영구히 쓸모가 없다.** 그런 프로젝트가 40줄짜리 Dart 안내를 계속 들고 다니지 않도록 삭제 주체를 명시한다.

**파일**: `.claude/skills/bootstrap-stack/SKILL.md`

**기존** (BASE 문서화 흐름 4):

```
4. 필요하면 `docs/00-meta/_templates/STACK_SETUP_PLAN_TEMPLATE.md`를 복사해 `docs/00-meta/STACK_SETUP_PLAN.md` 생성(이미 있으면 갱신 제안).
```

**수정** (문장 뒤에 이어 붙임 — 나머지는 그대로):

```
 **복사 시 Dart/Flutter 스택이 아니면 `## Dart Source Roots`·`## Golden 초기 절차` 두 절을 통째 삭제한다**(ARCH `## 7-1`~`## 7-5` 비해당 삭제 규칙과 동형 — ADR-059 D2/D3). `## E2E Smoke Registry`는 스택 무관이라 남기고 비대상이면 `status: n/a`만 적는다.
```

**추가 수정**: 같은 파일의 `## Optional MCP Connectors` 표 아래에 아래 안내를 추가한다.

```markdown
> Flutter/Dart 프로젝트는 공식 Dart & Flutter MCP 서버를 이 표에 등재할 수 있다(Dart 3.9 이상 필요). 앱 조작 기능을 쓰려면 앱 코드에 개발 빌드에서만 켜지는 진입점을 두고 배포 빌드에서 제외한다. 공식 Agent Skills·plugin은 기본 의존이 아니라 opt-in이며, 도입 전 포함된 rules 본문·자동 등록되는 MCP capability·기존 lifecycle skill과의 역할 중복을 감사한다. 충돌 시 본 저장소의 lifecycle skill이 우선한다.
```

**확인**

```bash
grep -n "Dart Source Roots\|E2E Smoke Registry\|Golden 초기 절차" docs/00-meta/_templates/STACK_SETUP_PLAN_TEMPLATE.md
grep -n "Dart Source Roots" .claude/skills/bootstrap-stack/SKILL.md   # 삭제 규칙 배선 확인
```

```
git add docs/00-meta/_templates/STACK_SETUP_PLAN_TEMPLATE.md .claude/skills/bootstrap-stack/SKILL.md
```

> **커밋 메시지**
> `feat(setup-plan): add Dart source roots, e2e smoke registry, and golden bootstrap sections`

---

# 단계 9. 인벤토리·체크리스트 정합

## 9-1. STRUCTURE.md 산출물 표 보강

**파일**: `docs/00-meta/STRUCTURE.md`

**수정**: 산출물 표(첫 번째 표)에서 `design gate adapter (UI)` 행 아래에 두 행을 추가한다.

```
| golden 정답 사진 (모바일 앱, 로컬 전용 — 커밋 X) | 프로젝트의 `test/goldens/` | 개발자 1회 생성(`flutter test --update-goldens` — ADR-059 D3) | Reference | conditional |
| E2E smoke registry | `STACK_SETUP_PLAN.md ## E2E Smoke Registry` | `/stack-guard` (ADR-052#amend-1) | Reference | conditional |
```

라이프사이클을 `ephemeral`로 두지 않는 이유: 이 표의 정의에서 `ephemeral`은 *"회차마다 덮어쓴다"* 인데, golden 정답 사진은 **의도적으로 덮어쓰지 않는 로컬 기준선**이다(덮어쓰면 회귀가 정답으로 굳는다 — D3의 재생성 규율). 갱신 빈도가 낮은 보조 자료라는 성격이 `Reference`에 맞다.

**추가 수정**: 같은 파일의 `## Canonical Owner 매핑` 표 두 행을 고친다.

- `| 보일러플레이트 직접 지원 스택 범위 | ... ADR-031-non-web-out-of-scope.md |` → Owner 칸 끝에 ` + [ADR-059](../90-decisions/boilerplate/ADR-059-flutter-mobile-profile.md)(Flutter는 직접 지원 — ADR-031#amend-1)`를 덧붙인다.
- `| DESIGN.md + ARCH 7-1~7-4 cross-surface enforcement | ... |` → 사실 칸의 `7-1~7-4`를 `7-1~7-5`로 바꾼다(3-8에서 이미 처리했다면 건너뛴다).

## 9-2. PROJECT_START_CHECKLIST에 모바일 경로 추가

**파일**: `docs/00-meta/PROJECT_START_CHECKLIST.md`

**기존** (3. guardrail 추가 절의 bootstrap-stack 예시 — 백틱 3개로 감싼 코드블록):

~~~~
  ```
  /bootstrap-stack Next.js 16 + TypeScript + pnpm + Supabase + Playwright + Vercel
  ```
~~~~

**수정**: 그 코드블록 아래에 아래를 추가한다.

```
  모바일 앱이면 예: `/bootstrap-stack Flutter + Android/iOS + Firebase`
```

**추가 수정**: `## 6. 첫 커밋 전` 절의 마지막 항목 아래에 두 줄을 추가한다.

```
- [ ] (모바일 앱) `ARCHITECTURE_OVERVIEW.md`의 `## 7-5. 모바일 클라이언트 결정`을 채웠고, 웹 화면이 없는 프로젝트면 `## 7-4. 프론트 결정`을 삭제했다 (웹 화면이 함께 있으면 둘 다 보존 — ADR-027#amend-8)
- [ ] (모바일 앱) 서명키·인증서가 저장소 밖에 있고 `.gitignore`로 제외돼 있다
```

**확인**

```bash
grep -n "7-5" docs/00-meta/PROJECT_START_CHECKLIST.md docs/00-meta/STRUCTURE.md
```

```
git add docs/00-meta/STRUCTURE.md docs/00-meta/PROJECT_START_CHECKLIST.md
```

> **커밋 메시지**
> `docs(meta): register mobile artifacts in structure inventory and start checklist`

---

# 단계 10. AGENTS.md 한 줄 갱신

**파일**: `AGENTS.md`

**기존**:

```
보일러플레이트의 기본 자동화·문서 템플릿이 직접 다루는 스택은 web frontend / API server / CLI / monorepo / Supabase 통합 5종이다. 그 외(mobile / ML / embedded / game / desktop)는 fork 사용자 override 경로 제공 (ADR-031).
```

**수정**:

```
보일러플레이트의 기본 자동화·문서 템플릿이 직접 다루는 스택은 web frontend / API server / CLI / monorepo / Supabase 통합 / Flutter(Android·iOS) 6종이다. 그 외(iOS Swift / Android Kotlin / RN / ML / embedded / game / desktop)는 project ADR로 supersede하는 경로 (ADR-031#amend-1, ADR-059).
```

`override 경로 제공` 이라는 표현을 함께 고치는 이유: ADR-031 Amendment 1이 그 절차를 **구현 surface 없는 미구현**으로 명시했으므로(2-3), 진입 문서가 계속 있는 것처럼 안내하면 안 된다.

**확인**: AGENTS.md는 100줄 상한이 있다. 줄 수가 늘지 않았는지 본다.

```bash
wc -l AGENTS.md    # 기존과 동일해야 함 (한 줄 치환이므로)
```

**추가 수정**: `README.md`와 `README_ko.md`의 대응 문장도 같은 취지로 바꾼다.

```bash
grep -n "ADR-031" README.md README_ko.md
```

**`README.md` 기존**:

```
Default automation directly covers web frontend, API server, CLI, monorepo, and Supabase integration. Non-web stacks (mobile, ML, embedded, game, native desktop) follow fork-user override paths — see [ADR-031](docs/90-decisions/boilerplate/ADR-031-non-web-out-of-scope.md).
```

**수정**:

```
Default automation directly covers web frontend, API server, CLI, monorepo, Supabase integration, and Flutter (Android/iOS). Other stacks (iOS Swift, Android Kotlin, React Native, ML, embedded, game, native desktop) are superseded by a project ADR — see [ADR-031](docs/90-decisions/boilerplate/ADR-031-non-web-out-of-scope.md) and [ADR-059](docs/90-decisions/boilerplate/ADR-059-flutter-mobile-profile.md).
```

**`README_ko.md` 기존**:

```
기본 자동화가 직접 다루는 스택은 web frontend / API server / CLI / monorepo / Supabase 통합 5종이다. 비웹 스택(mobile / ML / embedded / game / desktop)은 fork 사용자 override 경로를 따른다 — 자세한 내용은 [ADR-031](docs/90-decisions/boilerplate/ADR-031-non-web-out-of-scope.md) 참조.
```

**수정**:

```
기본 자동화가 직접 다루는 스택은 web frontend / API server / CLI / monorepo / Supabase 통합 / Flutter(Android·iOS) 6종이다. 그 외(iOS Swift / Android Kotlin / RN / ML / embedded / game / desktop)는 project ADR로 supersede하는 경로를 쓴다 — 자세한 내용은 [ADR-031](docs/90-decisions/boilerplate/ADR-031-non-web-out-of-scope.md), [ADR-059](docs/90-decisions/boilerplate/ADR-059-flutter-mobile-profile.md) 참조.
```

```
git add AGENTS.md README.md README_ko.md
```

> **커밋 메시지**
> `docs: list Flutter as a directly supported stack`

---

# 단계 11. 전체 검증

## 11-1. 웹 무회귀 확인

**먼저 이 확인이 무엇을 증명하고 무엇을 증명하지 못하는지 분명히 한다.** 이번 개선은 문서와 skill 지시문을 고쳤을 뿐, 기존 웹 프로젝트에 이미 생성돼 있는 `package.json` 스크립트를 건드리지 않는다. 그래서 기존 프로젝트에서 `npm run validate`를 다시 재는 것은 *스크립트가 안 바뀌었음*만 확인해 줄 뿐, **바뀐 판정 규칙이 웹에서 여전히 같은 답을 내는지**는 알려주지 않는다. 그 부분을 따로 확인해야 한다.

**(a) 기존 프로젝트가 그대로 도는지 (스모크)**

```bash
cd C:/tmp/dogfood-ui-todo
npm run validate; echo "exit=$?"
node -e "const s=require('./package.json').scripts; console.log('validate:design 존재:', 'validate:design' in s)"
```

**합격 기준**: `validate` exit 0. 두 번째 명령은 **`false`가 정상**이다 — 이 fixture는 design gate adapter가 도입되기 전 상태이므로 `validate:design` 진입점이 없다. 없는 진입점을 호출하면 npm이 missing-script 오류를 내며, 그것은 이번 개선의 결과가 아니다. `true`가 나오면 그때만 `npm run validate:design`을 돌려 0-2 기준선과 종료코드를 대조한다.

소요 시간은 이번 변경으로 달라질 이유가 없으므로 크게 벌어지면 환경 요인부터 의심한다.

**(b) 바뀐 규칙이 웹에서 같은 답을 내는지 (여기가 실제 검사다)**

바뀐 규칙 셋을 웹 프로젝트 상태에 손으로 적용해 보고, 개선 전 판정과 같은지 대조한다.

1. **3축 판정(4-3)** — `docs/20-system/DESIGN.md`가 있고 status가 `draft`가 아니므로 design surface = **있음**. ARCH `## 7`의 기술 선택이 웹이므로 runtime target = **web**. 따라서 6-3·6-4에서 고르는 경로는 개선 전과 같은 **Playwright**여야 한다. `native` 분기나 `flutter` 명령이 선택되면 판정 규칙이 잘못된 것이다.
2. **e2e 5-state 분류(1-3)** — 이 fixture에는 `## E2E Smoke Registry`가 **없다**(도입 전 프로젝트라 정상). 새 규칙은 그 경우 *"선언된 e2e 디렉터리 하위에서 1개 이상 실제 실행·성공"* 만 보고 `PASS`를 내며 `P1 [E2E-registry] 미등록`을 함께 기록한다. 즉 **기대값은 `PASS` + P1 기록 1건**이다. `EMPTY`가 나오면 registry를 필요조건으로 잘못 구현한 것이다(ADR-052#amend-1 결정 4 위반).

   ```bash
   cd C:/tmp/dogfood-ui-todo
   npx playwright test --list        # 수집된 spec이 0개가 아닐 것
   npm run validate:e2e; echo "exit=$?"
   ```
3. **새 차단 목록(7-1·7-2)이 웹 파일을 건드리지 않는지** — 추가한 패턴이 이 프로젝트의 기존 파일과 하나도 겹치지 않아야 한다.

   ```bash
   cd C:/tmp/dogfood-ui-todo
   git ls-files | grep -E '\.(jks|keystore|p12|mobileprovision)$|key\.properties|-firebase-adminsdk-.*\.json'
   ```

   **합격 기준**: 출력이 없을 것(있으면 기존 추적 파일이 새로 무시되기 시작한다는 뜻).

**(c) 새 프로젝트 경로 확인** — 웹 스택에 대해 `/stack-guard`를 새로 돌렸을 때도 같은 결과가 나오는지는 스크립트로 흉내 낼 수 없다. 이는 단계 12(실사용 확인)에서 웹 프로젝트 1개로 확인한다.

## 11-2. 지시문 분량 확인

```bash
cd C:/Users/kbwdesktop/Desktop/dev/agentic-dev-harness
wc -l AGENTS.md
cat .claude/skills/*/SKILL.md | wc -l
cat docs/00-meta/*.md | wc -l
```

**합격 기준**: `AGENTS.md`는 **55줄 그대로**일 것(모든 변경이 한 줄 안 치환이다). skills 합계 증가분이 200줄 이내일 것(기준선 2,382줄).

초과했으면 어디가 불었는지 파일별로 본다. 증가가 몰려도 되는 곳은 `stack-guard`(Flutter 배선의 주 소비자)뿐이고, 다른 skill은 각 10줄 안쪽이어야 한다.

```bash
for f in .claude/skills/*/SKILL.md; do printf '%-52s %s\n' "$f" "$(wc -l < "$f")"; done
```

## 11-3. 문서 참조 정합

```bash
# ADR 참조가 실제 파일과 맞는가
# 인덱스 하단 표에 reserved/dropped/parked로 적힌 번호는 "파일이 없는 것이 정상"이므로 제외한다.
# (이 제외 없이 돌리면 개선 전에도 13건이 나온다 — ADR-002/003/013/015/016/018/023/028~030/032~034)
gone=$(grep -oE "^\| ADR-0[0-9][0-9] \| [a-z ]*(reserved|dropped|parked)" docs/90-decisions/boilerplate/README.md \
        | grep -oE "ADR-0[0-9][0-9]" | sort -u)
grep -roh "ADR-0[0-9][0-9]" docs .claude AGENTS.md README.md README_ko.md | sort -u | while read a; do
  echo "$gone" | grep -qx "$a" && continue
  ls docs/90-decisions/boilerplate/${a}-*.md >/dev/null 2>&1 || echo "없는 ADR 참조: $a"
done

# amendment 앵커가 실재하는가
grep -roh "ADR-0[0-9][0-9]#amend-[0-9]" docs .claude | sort -u | while read r; do
  n=$(echo $r | sed 's/ADR-\([0-9]*\)#amend-\([0-9]*\)/\1 \2/')
  set -- $n
  f=$(ls docs/90-decisions/boilerplate/ADR-$1-*.md 2>/dev/null | head -1)
  [ -n "$f" ] && grep -q "adr-$1-amend-$2\|## Amendment $2" "$f" || echo "없는 앵커: $r"
done
```

**합격 기준**: 두 명령 모두 출력이 없을 것.

## 11-4. Surfaces 역참조 정합

ADR-059의 `## Surfaces` 23개 항목은 **각 파일 본문에 `ADR-059` 인용이 있어야** 참조 정합 검사를 통과한다. 앞 단계에서 이미 인용이 들어간 12곳(`stack-guard`, `bootstrap-design`, `validator.md`, `reviewer.md`, `GUARDRAILS_STRATEGY.md`, `ADR-031`, `ADR-007`, `ADR-021`, `AGENTS.md`, `README.md`, `README_ko.md`, `.gitignore`)을 뺀 나머지 11개에 아래대로 인용을 넣는다. **각 파일에 한 곳이면 충분하다.**

> 앞 단계의 수정문 안에 이미 `ADR-059` 인용이 들어간 파일은 **건너뛴다**(예: stabilize는 5-1의 한계 문장, STRUCTURE.md는 9-1 golden 행의 생성 주체 칸). 아래 표는 *한 곳도 없을 때* 어디에 넣을지의 지침이며, 같은 파일에 인용을 두 번 넣을 필요는 없다.

| 파일 | 인용을 넣을 위치 | 넣을 문구 |
|---|---|---|
| `.claude/skills/stabilize-milestone/SKILL.md` | 5-1에서 새로 쓴 `5-2.` 항목 제목 끝 | `(ADR-059 D6)` |
| `.claude/skills/plan-workitem/SKILL.md` | 3-6에서 추가한 `**모바일 task 신호**` 줄 끝 | `(ADR-059 D7)` |
| `.claude/skills/finalize-workitem/SKILL.md` | 7-4에서 확장한 민감 경로 줄 끝 | `(ADR-059 D9)` |
| `.claude/skills/implement-workitem/SKILL.md` | 5-7에서 `pubspec.lock`을 추가한 문장 끝 | `(ADR-059)` |
| `.claude/skills/bootstrap-stack/SKILL.md` | 3-3(b) 삭제 규칙 문장 끝의 `ADR-027#amend-8` 옆 | `, ADR-059 D7` |
| `docs/20-system/ARCHITECTURE_OVERVIEW.md` | 3-1에서 추가한 `## 7-5` 첫 주석 블록 끝 | `ADR-059 D7.` |
| `docs/30-workitems/_templates/TASK_TEMPLATE.md` | 5-9에서 고친 runner 예시 줄 끝 | `(Flutter는 ADR-059)` |
| `docs/00-meta/STRUCTURE.md` | 9-1에서 추가한 golden 행의 **생성 주체 칸 안** (이 표엔 비고 칸이 없다 — 다른 행들도 `/plan-milestone` (M1 포함 — ADR-057) 처럼 그 칸에 인용을 둔다) | `ADR-059 D3` |
| `docs/00-meta/PROJECT_START_CHECKLIST.md` | 9-2에서 추가한 모바일 체크 항목 끝 | `(ADR-059)` |
| `docs/00-meta/_templates/STACK_SETUP_PLAN_TEMPLATE.md` | 8에서 추가한 `## Dart Source Roots` 주석 끝 | `ADR-059 D2.` |
| `docs/90-decisions/boilerplate/ADR-027-...md` | 3-2 Amendment 8의 `### 배경` 첫 줄 끝 | `(ADR-059 D7이 이 자리를 사용한다)` |

넣은 뒤 아래로 확인한다.

```bash
sed -n '/^## Surfaces/,/^## 참고/p' docs/90-decisions/boilerplate/ADR-059-flutter-mobile-profile.md \
  | grep -oE '^\- [^ ]+' | sed 's/^- //' | while read f; do
  [ -e "$f" ] || { echo "없는 파일: $f"; continue; }
  grep -q "ADR-059" "$f" || echo "역참조 없음: $f"
done
```

**합격 기준**: 출력이 없을 것. 역참조가 없다고 나온 파일에는 해당 수정 지점에 `(ADR-059)` 인용을 한 곳 추가한다.

**추가 검사 — 이번 라운드가 손댄 ADR *전부*의 Surfaces forward check.** 위 명령은 ADR-059만 본다. 그런데 **`## Surfaces`에 행을 새로 등재하면 그 대상 파일도 그 ADR을 역참조해야 한다**(ADR-045 D4). 단계 1~3에서 실제로 이 결손이 났다 — 단계 3이 `ARCHITECTURE_OVERVIEW.md`를 ADR-027 Surfaces에 등재했는데 그 파일에 `ADR-027` 인용이 0건이었고, ADR-059와 달리 **자동 보정 경로가 없어 영구 `P1`이 될 뻔했다**(리뷰에서 사후 수정). 아래로 라운드 전체를 한 번에 검사한다.

```bash
for n in 014 027 031 052 059; do
  f=$(ls docs/90-decisions/boilerplate/ADR-$n-*.md)
  sed -n '/^## Surfaces/,/^## /p' "$f" | grep -oE '^- [^ ]+' | sed 's/^- //; s/#.*//' \
  | while read -r t; do
      [ -d "$t" ] && continue          # 디렉터리 등재(ADR-052의 Codex wrapper)는 역참조 대상 아님
      [ -e "$t" ] || { echo "ADR-$n: 없는 파일 $t"; continue; }
      grep -q "ADR-$n" "$t" || echo "ADR-$n: 역참조 없음 $t"
    done
done
```

**합격 기준**: 출력이 없을 것. `역참조 없음`이 나오면 그 파일의 *이번 라운드가 고친 지점*에 `(ADR-NNN)` 인용을 한 곳 넣는다(새 문장을 만들지 말고 이미 고친 줄·주석 끝에 붙인다). ADR-007·ADR-021은 `## Surfaces` 블록이 없어 대상이 아니다.

## 11-5. 0-spec 문자열 매칭 잔존 확인

```bash
grep -rn "0 spec\|0-spec\|No tests found" .claude/skills/ | grep -v "보조 fallback"
```

**합격 기준**: 출력이 없을 것. (적용 전 기준선은 `stabilize-milestone/SKILL.md` 3줄 — 102·125·126행이며 **전부 1-5·1-6이 통째로 교체하는 블록 안**에 있다. 하이픈 표기 `0-spec`까지 잡아야 126행이 걸린다. `docs/90-decisions`의 ADR 본문에는 `0-spec`이 정당하게 남으므로 검사 범위를 `.claude/skills/`로 한정한다.)

## 11-6. amendment 제목 날짜 확인

이번 라운드는 amendment를 **6건** 붙인다. 저장소 관례는 제목에 적용 날짜를 넣는 것이고(§0-1), **단계 1~3에서 4번 연속 누락됐다** — 블록이 코드펜스 안에 있어 그대로 복사되기 때문이다. 기계로 확인한다.

```bash
for s in 052:1 014:4 031:1 027:8 007:6 021:2; do
  n=${s%%:*}; a=${s##*:}
  f=$(ls docs/90-decisions/boilerplate/ADR-$n-*.md)
  if grep -qE "^## Amendment $a \([0-9]{4}-[0-9]{2}-[0-9]{2}\) —" "$f"; then
    echo "ADR-$n#amend-$a: OK"
  elif grep -qE "^## Amendment $a " "$f"; then
    echo "ADR-$n#amend-$a: *** 날짜 누락 *** $(grep -nE "^## Amendment $a " "$f")"
  else
    echo "ADR-$n#amend-$a: *** amendment 자체가 없음 — 해당 단계 미적용 ***"
  fi
done
```

**합격 기준**: 여섯 줄 모두 `OK`. `날짜 누락`이면 제목을 `## Amendment N (<적용일>) — <제목>` 으로 고친다 — **날짜만 넣고 제목 문구·번호·`<a id>` 앵커는 건드리지 않는다**(다른 문서가 `#amend-N`으로 이 절을 가리킨다). `amendment 자체가 없음`이면 그 단계를 건너뛴 것이므로 해당 단계로 돌아간다(007#6·021#2는 5-10, 나머지 넷은 단계 1~3 소관).

11-4에서 인용을 넣느라 손댄 파일만 명시해 담는다(`git add -A`는 검증하며 생긴 임시 파일까지 함께 담을 수 있다).

```
git add docs/90-decisions/boilerplate/ADR-027-interface-decision-allocation.md \
        docs/90-decisions/boilerplate/ADR-059-flutter-mobile-profile.md \
        docs/20-system/ARCHITECTURE_OVERVIEW.md \
        docs/00-meta/STRUCTURE.md docs/00-meta/PROJECT_START_CHECKLIST.md \
        docs/00-meta/_templates/STACK_SETUP_PLAN_TEMPLATE.md \
        docs/30-workitems/_templates/TASK_TEMPLATE.md \
        .claude/skills/stabilize-milestone/SKILL.md \
        .claude/skills/plan-workitem/SKILL.md \
        .claude/skills/finalize-workitem/SKILL.md \
        .claude/skills/implement-workitem/SKILL.md \
        .claude/skills/bootstrap-stack/SKILL.md
git status --short          # 의도하지 않은 파일이 섞였는지 눈으로 확인
```

> **커밋 메시지**
> `chore: add ADR-059 back-references across mutated surfaces`

---

# 단계 12. 실사용 확인 (사용자 지시 시)

**이 단계는 사용자가 명시적으로 지시할 때만 수행한다.**

> **정책과의 관계를 밝혀 둔다.** ADR-017은 재실행 트리거 3종(**새 ADR 도입 — amendment 포함** / lifecycle 단계 변경 / skill 본문 큰 변경)을 두고 있고, 이번 개선은 **세 트리거를 모두 발화시킨다**(ADR-059 신설 + amendment 5건 + skill 다수 개편). 그래도 이 단계를 사용자 지시 시로 두는 것은 **사용자의 명시 결정**이며, 정책이 요구하지 않는다는 뜻이 아니다. 따라서 개선 적용 후 dogfood를 돌리기 전까지는 *"gate 미검증 상태"* 로 취급하고, 아래 확인 항목을 지운 것으로 간주하지 않는다.

축소판 관통 확인: feature 1개 / task 2~3개 규모로 별도 폴더에 fork를 만들어 기획 → 마일스톤 → 작업 분해 → 구현 → 검증 → 마감 → 안정화(졸업 판정)까지 한 바퀴 돌린다.

특히 아래 4가지가 의도대로 작동하는지 본다.

1. `/bootstrap-stack`이 `## 7-5`를 채우고 (웹 화면이 없는 fork이므로) `## 7-4`를 삭제하는가
2. `/stack-guard`가 `validate`를 npm 진입점으로, `validate:e2e`를 `flutter test integration_test`로 배선하고 Playwright에 배선하지 **않는가**
3. e2e 디렉터리를 비운 상태에서 졸업을 시도하면 `EMPTY`로 차단되는가
4. `.dart` 파일에 색을 직접 박으면 안정화 단계가 그것을 기록하는가

**웹 쪽도 같은 자리에서 한 번 본다** (11-1이 스크립트로 확인할 수 없던 부분). 웹 스택으로 별도 fork를 하나 더 만들어 `/bootstrap-stack → /stack-guard`까지만 돌리고 아래를 확인한다.

- `## 7-4`가 채워지고 `## 7-5`가 삭제되는가 (모바일 분기가 웹으로 새지 않음)
- `validate:e2e`가 여전히 Playwright로 배선되고 `flutter` 명령이 등장하지 않는가
- design gate가 개선 전과 같은 `ready` 상태로 물질화되는가

발견 사항은 `docs/40-validation/IMPROVEMENT_GUIDE.md`에 기록하고, 강도 조정이 필요하면 ADR-059의 `## 정책 강도` 항목을 갱신한다.

> **커밋 메시지**
> `test(dogfood): record findings from Flutter walkthrough`

---

# 부록. 이번 개선에서 의도적으로 하지 않은 것

아래는 검토했으나 이번 범위에 넣지 않기로 한 항목이다. 나중에 논의가 반복되지 않도록 사유를 남긴다.

| 항목 | 사유 |
|---|---|
| Patrol(네이티브 UI 조작 도구) 배선 | 권한 대화상자·시스템 알림이 실제 요구사항에 등장할 때 추가한다. 현재 그런 요구가 없다 |
| `custom_lint` 기반 색상 검사 | 실제 코드가 쌓인 뒤 규칙을 써야 정확하다. 현재는 grep 기록 등급 |
| Flutter web·desktop 지원 | 대상 플랫폼이 Android·iOS로 한정됐다 |
| Linux 지원 | 검증 환경이 없다 |
| CI 구성 | 사용하지 않기로 했다. 그로 인해 golden 정답 사진을 커밋하지 않는 설계를 택했다 |
| 성능 게이트 | ARCH `## 8 품질 속성`에 성능 요구가 실제로 적힌 프로젝트에서만 둔다 |
| e2e 판정을 코드(파서)로 물질화 | design gate는 exit 0/1/2 계약과 다중 입력 처리 때문에 canonical asset이 정당했지만, e2e 판정은 웹 스택도 지시문 기반이다. 스택 하나 추가하며 새 실행 코드를 들이는 것은 ADR-006 위반. 판정 계약을 ADR-059 D4에 글로 고정하고 부담이 관측되면 물질화 (재검토 트리거 8) |
| 경험 게이트의 device 스크린샷 배선 | native에서 앱 기동 캡처가 서지 않는 것을 **degrade로 명시 기록**했다(ADR-059 D12). 시각 회귀를 실제로 놓친 사례가 나오면 배선 (재검토 트리거 7) |
| device 선택 broker | 진입점에서 `-d`를 생략해 러너 자체의 단일-device 규칙에 맡기는 것으로 해결했다. 여러 device를 자동 선별하는 계층은 그 상황이 실제로 생길 때 만든다 |
