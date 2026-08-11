# IMPROVE-GUIDE

이 문서만 보고 위에서 아래로 순서대로 따라가면 모든 개선이 완료된다.
각 단계는 **파일 → 찾을 문자열(앵커) → 현재 → 바꿀 내용** 순으로 적혀 있다.

**대상 파일 규칙**: 각 절 위의 가장 가까운 `파일: ...` 선언이 그 절의 편집 대상이다. 하위 절에 `파일:` 이 없으면 바로 위에서 마지막으로 선언된 파일을 그대로 쓴다. 파일이 바뀌는 자리에는 반드시 새 `파일:` 줄이 있다.

**적용 순서**: 절 번호 오름차순으로 적용한다. 일부 절의 앵커는 **앞 절이 만든 텍스트**이며 그런 곳은 본문에 «앞 절 적용 후» 라고 명시했다.

**울타리 규칙**: 삽입할 본문 자체에 ` ``` ` 가 들어가는 곳은 바깥 울타리를 `~~~` 로 썼다. `~~~` 안의 내용을 그대로 넣는다.

**용어 — 「채점표」**: `docs/40-validation/reports/<task-id>.md`(= validation report)의 별칭이다. 졸업 item 4가 «채점표에서 읽는 것 / task 문서에서 읽는 것»으로 갈리는 대비를 드러내려고 쓴다. **두 표기는 같은 파일을 가리키며**, 정책 SSOT(ADR-067 D1 item 4)와 실행 절차(`/stabilize-milestone` §1.5)는 첫 등장에서 경로를 병기한다. 본 가이드가 넣는 문장에도 두 표기가 섞여 나타나지만(기존 문장을 보존한 자리는 `report`, 새로 쓴 자리는 `채점표`) **새 개념이 아니다.**

**날짜 규칙**: 새 amendment의 `## Amendment N (2026-08-11)` 날짜는 **본 가이드 작성일**이다. **적용일이 다르면 그 날짜로 바꿔 넣는다** — 대상은 §1.4.1(ADR-045 amend-2)·§1.5.1(ADR-005 amend-1)·§1.6.1(ADR-057 amend-4) 셋이다. `## Amendment 2 (2026-08-09)` 같은 기존 amendment의 날짜는 건드리지 않는다.

---

## 이번 개선의 큰 그림

핵심 변경 6가지다.

1. **`/validate-workitem` 판정값이 3종이 된다** — `Pass` / `Pending Acceptance` / `Needs Fix`. 「사람이 볼 것만 남았다」에 이름을 준다.
2. **졸업 판정값이 4종이 된다** — `YES` / `PENDING_ACCEPTANCE` / `NO` / `BLOCKED`. task 층 3종과 같은 모양.
3. **`[사용자 관측]`·`[플랫폼 관측]` AC는 `/finalize-workitem`을 막지 않는다.** receipt는 마일스톤 수용 라운드에서 모아 발급하고, 미발급은 **졸업**이 잡는다. `--task` 스코프 모드는 삭제한다.
4. **졸업 item 4가 입력을 둘로 나눈다** — 기계 검증 AC는 채점표에서, 관측 AC는 **task `## 8`에서 직접** 읽는다. receipt 발급 후 재validate가 사라진다.
5. **`/repair-milestone`·`/repair-acceptance`가 루프를 끝까지 닫는다** — per-task 결함을 `/repair-workitem`에 위임한 뒤 `/validate-workitem` → `/finalize-workitem`까지 **자동 연쇄**한다. 사용자가 수동으로 3개 명령을 치지 않는다.
   - **연쇄는 «재개방된 task»에만 finalize를 부른다.** 재개방되지 않은 task(out-of-AC 직접 수정분·cross-cutting 영향분)는 **재validate만** 한다 — 그 task는 계속 `done`이므로 마감할 것이 없고, `/finalize-workitem`의 1-G가 `done`을 read-only no-op으로 처리하기 때문이다.
   - **재개방분 연쇄를 그 skill 자신의 cross-cutting 수정·원장 쓰기보다 먼저** 돈다 — `/finalize-workitem` 수행 5-(4)가 «task `## 4-1` 밖 변경»을 `Needs Review`로 차단하므로, 순서를 지켜야 tree에 그 task 변경만 남는다.
   - **커밋 소유권은 유지된다** — 연쇄에서 커밋하는 것은 finalize뿐이고 그것이 커밋하는 것은 그 task 파일뿐이다. cross-cutting 수정·원장은 여전히 사용자가 커밋한다(ADR-047 D7).
6. **원장 5종의 기록 범위를 배타적으로 고정한다** — ROADMAP에 `## Backlog`를 신설하고, 「어느 원장에 적을지」 판별자를 SSOT로 박는다.

### ⚠ 절대 빠뜨리면 안 되는 3개 단계

| 단계 | 빠뜨리면 |
|---|---|
| **3.1.1** — validate 집계 규칙 3값 | 관측 AC가 있는 task의 채점표가 항상 `Needs Fix` → 졸업 item 4 (b) 영구 실패 → receipt를 발급해도 **영원히 `NO`** |
| **3.2.1** — finalize의 무조건 차단 줄 종속화 | 3.2.2가 넣는 새 분기에 도달하기 전에 종료된다. 관측 AC가 여전히 finalize를 막는다 |
| **4.3.1** — repair-milestone 루프 닫기 (⚠ **순서 규칙 (1)과 ②의 «validate만»을 함께 적용해야 한다**) | 재개방만 하고 안 닫는다 → task가 `in-progress` + 채점표 부재로 남아 **졸업 item 1·4가 미충족**. 사용자가 수동으로 validate·finalize를 쳐야 한다. 순서 규칙을 빼면 finalize가 `Needs Review`로 멈춰 연쇄가 첫 task에서 죽고, ②를 옛 형태(validate+finalize)로 적용하면 `done` task에 no-op finalize를 불러 **마감된 것처럼 보이는 거짓 신호**가 남는다 |

## 작업 순서 원칙

정책(ADR) → 템플릿·원장 → task 층 스킬 → 마일스톤 층 스킬 → 메타 문서 → 인용 정리 → 검증.
하류가 상류를 인용하므로 이 순서를 지킨다.

---

# Phase 1 — ADR 층 (정책 SSOT)

**편집 방식이 ADR마다 다르다.**

| ADR | 방식 | 근거 |
|---|---|---|
| ADR-065 · ADR-066 · ADR-067 | **본문 직접 편집** | 직전 라운드 신규·미배포 |
| ADR-045 · ADR-057 · ADR-005 | **`## Amendment` 추가** | 배포된 ADR — 본문을 지우지 않는다 |
| ADR-007 · ADR-009 | 참조 문구 갱신 (개정 아님) | 기존 서술의 사실 정정 — 두 ADR이 «finalize는 Pass일 때만»을 단언하고 있어 새 3값 계약과 어긋난다. 정책을 뒤집는 것이 아니라 이미 바뀐 사실에 문장을 맞추는 것이므로 supersede·amendment 대상이 아니다 (ADR-045 D6 «정책 의미 변경» 기준 미해당) |

---

## 1.1 ADR-065 — AC 검증 계약

파일: `docs/90-decisions/boilerplate/ADR-065-ac-verification-contract.md`

### 1.1.1 `미관측`의 정의를 좁힌다

**앵커**: `- **`미관측`은 *authoring 표기*가 아니라 *판정 결과 라벨*이다.**`

**현재 (그 불릿 전문)**
```
- **`미관측`은 *authoring 표기*가 아니라 *판정 결과 라벨*이다.** 계획자는 `[미관측]`을 쓰지 않는다(쓸 거리가 없으면 AC를 관측 가능하게 다시 쓴다). 판정자는 아래 두 경우에 결과를 `미관측`으로 적는다 — ① 선언된 modality의 증거가 없다 ② 표기가 없는데 legacy 판독(`자동 테스트`)으로도 대응 테스트가 없다. **`미관측`은 항상 미충족이며 어떤 게이트도 통과시키지 않는다.**
```

**바꿀 내용**
```
- **`미관측`은 *authoring 표기*가 아니라 *판정 결과 라벨*이다.** 계획자는 `[미관측]`을 쓰지 않는다(쓸 거리가 없으면 AC를 관측 가능하게 다시 쓴다). 판정자가 `미관측`을 쓰는 경우는 **하나뿐이다 — 표기가 없는데 legacy 판독(`자동 테스트`)으로도 대응 테스트가 없을 때.** **선언된 modality의 증거가 없는 경우는 `미관측`이 아니다** — 그때는 **선언된 modality를 유지한 채 미충족 사유를 적는다**(예: `❌ [사용자 관측] receipt 대기`). modality를 결과 라벨로 덮어쓰면 하류(D6 판정값 산출·`/finalize-workitem` 분기)가 «코드로 고칠 것»과 «사람이 볼 것»을 구분할 근거를 잃는다. **`미관측`은 항상 미충족이며 어떤 게이트도 통과시키지 않는다.**
```

### 1.1.2 receipt 발급 시점을 마일스톤 층으로 옮긴다

**앵커**: `- **`사용자 관측`·`플랫폼 관측` receipt의 발급 시점은 task 층이다**`

**현재 (그 불릿 전문)**
```
- **`사용자 관측`·`플랫폼 관측` receipt의 발급 시점은 task 층이다** — 그 AC를 가진 task가 `/finalize-workitem`에 도달하기 *전*에 발급돼야 한다. 발급 경로는 `/accept-milestone --task <task-id>`(task 스코프 모드 — [ADR-066](ADR-066-milestone-acceptance.md) D1) 또는 사용자 직접 기재다. **마일스톤 수용 라운드(post-stabilize)를 이 발급의 유일한 경로로 두면 lifecycle이 교착된다** — stabilize는 전 task `done`을 요구하는데 그 task는 receipt 없이 `done`이 될 수 없다.
```

**바꿀 내용**
```
- **`사용자 관측`·`플랫폼 관측` receipt의 발급 시점은 마일스톤 층이다** — 발급 경로는 `/accept-milestone <M>`(마일스톤 수용 라운드 — [ADR-066](ADR-066-milestone-acceptance.md) D1) 또는 사용자 직접 기재다. **이 modality의 미충족은 `/finalize-workitem`을 막지 않는다** — 그 AC만 미충족이면 `/validate-workitem` 판정은 `Pending Acceptance`이고(아래 D6), finalize는 통과시켜 task를 `done`으로 마감한다. 그렇지 않으면 `receipt 없어 finalize 불가 → task done 불가 → stabilize 진입 불가 → 수용 라운드 도달 불가 → 발급 불가`의 교착이 생긴다. 미발급 상태는 **졸업 게이트가 잡는다** — 그 receipt 없이는 [ADR-067](ADR-067-milestone-graduation-v2.md) D1 item 4 (a')를 충족하지 못하므로 마일스톤이 졸업하지 못한다(graduation `PENDING_ACCEPTANCE`). **즉 차단 지점을 task 층에서 마일스톤 층으로 옮긴 것이며, 게이트 자체가 사라진 것이 아니다.**
```

### 1.1.3 D3에 `- ac-pending` 줄 형식을 추가한다

**앵커**: `무효화 줄의 형식은 하나로 고정한다.`

이 줄 **바로 앞에** 아래 블록을 삽입한다.

~~~
미발급 상태를 task 문서에 남기는 줄의 형식도 하나로 고정한다. `/implement-workitem`이 구현 직후에, `/finalize-workitem`이 마감 시점에 각각 append한다(같은 AC에 이미 `- ac-pending` 줄이 있으면 중복 append하지 않는다 — **중복 판정 시 HTML 주석(`<!-- ... -->`) 밖의 줄만 센다.** TASK_TEMPLATE `## 8` 주석에 같은 형식의 예시가 들어 있어, 주석까지 세면 «이미 있다»로 오판해 실제 줄이 **영원히 append되지 않는다** — 본 D3 판독 규칙 및 ADR-064 D4와 동형).

```
- ac-pending <날짜> <AC-N>: modality=<사용자 관측|플랫폼 관측> — 마일스톤 수용 라운드에서 확인 예정
```

- **`- ac-pending`은 증거가 아니라 «아직 증거가 없다»는 표시다.** 어떤 게이트도 통과시키지 않는다. `- ac-acceptance`가 발급되면 그 AC의 마지막 이벤트가 바뀌므로 자동으로 무효가 된다(아래 판독 규칙 2).
- **왜 필요한가**: `/finalize-workitem`은 커밋한다. 미충족 AC를 통과시키고 커밋하는데 그 판단의 흔적이 커밋된 산출물에 없으면 사후 추적이 불가능하다.
- **`/accept-milestone`은 이 줄을 회수 힌트로만 쓴다** — 필수 시나리오의 근거는 `## 6-1`의 modality 표기이며, 이 줄이 없어도 modality가 있으면 대상이다.
~~~

### 1.1.4 판독 규칙 2에 `- ac-pending`을 반영한다

**앵커**: `- **판독 규칙 2 — 마지막 이벤트가 현재 상태다**:`

**현재**
```
- **판독 규칙 2 — 마지막 이벤트가 현재 상태다**: 한 AC에 `- ac-acceptance`와 `- invalidated`가 여러 번 나타날 수 있다. **그 AC의 현재 상태는 `## 8` 안에서 문서 순서상 마지막에 나오는 그 AC의 이벤트로 판정한다** — 마지막이 `ac-acceptance`면 충족, `invalidated`면 미충족이다. 줄을 지우지 않으므로 이력이 보존되고, 재발급 후 다시 무효화되는 왕복도 순서로 표현된다.
```
**바꿀 내용**
```
- **판독 규칙 2 — 마지막 이벤트가 현재 상태다**: 한 AC에 `- ac-pending`·`- ac-acceptance`·`- invalidated`가 여러 번 나타날 수 있다. **그 AC의 현재 상태는 `## 8` 안에서 문서 순서상 마지막에 나오는 그 AC의 이벤트로 판정한다** — 마지막이 `ac-acceptance`면 충족, `ac-pending`·`invalidated`면 미충족이다(이벤트가 아예 없어도 미충족). 줄을 지우지 않으므로 이력이 보존되고, 재발급 후 다시 무효화되는 왕복도 순서로 표현된다.
```

### 1.1.5 D3의 receipt 작성자 문장을 고친다

**앵커**: `- **`- ac-acceptance` 줄의 작성자**는 `/accept-milestone`(사용자 응답을 그대로 기록) 또는 사용자 직접이다.`

**현재**
```
- **`- ac-acceptance` 줄의 작성자**는 `/accept-milestone`(사용자 응답을 그대로 기록) 또는 사용자 직접이다. `/validate-workitem`·validator·builder·foreman은 쓰지 않는다. **`- invalidated` 줄의 작성자는 아래 세 repair skill이다.**
```
**바꿀 내용**
```
- **`- ac-acceptance` 줄의 작성자**는 `/accept-milestone`(사용자 응답을 그대로 기록) 또는 사용자 직접이다. `/validate-workitem`·validator·builder·foreman은 쓰지 않는다. **`- ac-pending` 줄의 작성자는 `/implement-workitem`·`/finalize-workitem`이다**(그 줄은 receipt가 아니라 미발급 표시이므로 대행 발급 금지에 걸리지 않는다). **`- invalidated` 줄의 작성자는 아래 세 repair skill이다.**
```

### 1.1.6 D4의 «졸업 item 4 입력» 문장을 고친다

**앵커**: `- **충족률** = (충족 AC 수) / (전체 AC 수) — 전 modality 합산. 졸업 item 4의 입력이다.`

**바꿀 내용**
```
- **충족률** = (충족 AC 수) / (전체 AC 수) — 전 modality 합산. **report 독자용 요약 수치이며 졸업 게이트의 직접 입력은 아니다** — 졸업 item 4는 기계 검증 AC를 채점표에서(item 4 (a)), 관측 AC를 task `## 8`에서(item 4 (a')) 각각 읽는다([ADR-067](ADR-067-milestone-graduation-v2.md) D1).
```

### 1.1.7 D6을 신설한다 — `/validate-workitem` 판정값 3종

**앵커**: `### D5. ADR-063 D6과의 관계`

이 헤딩 **바로 앞에** 아래 블록을 삽입한다.

```
### D6. `/validate-workitem` 판정값 3종

report `- 판정:` 값은 셋이다. **우선순위는 `Needs Fix` > `Pending Acceptance` > `Pass`이며 먼저 성립하는 값으로 확정한다.**

| 값 | 뜻 | 성립 조건 |
|---|---|---|
| `Needs Fix` | **고칠 것이 있다** | 어느 축이라도 P0 finding이 있거나 / 통합 검증 명령 exit≠0 / **«수정 대상 아님»이 아닌 미충족 AC**가 하나라도 있음 |
| `Pending Acceptance` | **사람이 볼 것만 남았다** | 위가 전부 아니고, `사용자 관측`·`플랫폼 관측` AC의 receipt만 미발급 |
| `Pass` | 전부 충족 | 미충족 AC 0건 |

- **`Pending Acceptance`를 별도 값으로 두는 이유**: 이 상태를 `Needs Fix`로 뭉뚱그리면 `/repair-workitem`으로 라우팅되는데 고칠 코드가 없어 순환에 빠지고(본 ADR 배경이 지목한 그 순환), `Pass`로 뭉뚱그리면 「`Pass`인데 AC 행에 ❌」라는 해명이 필요한 상태가 남는다. **판정값마다 다음 액션이 다르다는 것이 이 enum의 존재 이유다** — `/stabilize-milestone`의 graduation 4종(ADR-067 D3)과 같은 원리이며, 같은 개념이 두 층에서 같은 모양으로 나타난다.
- **하류 소비**: `/finalize-workitem`은 `Pass`·`Pending Acceptance`를 통과시키고 `Needs Fix`를 차단한다. `/repair-workitem`은 `Pass`·`Pending Acceptance`면 finalize를 안내하고 종료한다. 졸업 item 4 (b)는 `Pass` **또는** `Pending Acceptance`를 허용한다(ADR-067 D1).
- **`감사 미완(unavailable)`은 `Pending Acceptance`가 아니다** — 그것은 P0이며 `Needs Fix`를 트리거한다. 고칠 것은 없지만 *판정할 수 없는* 상태이므로 `Pass` 계열을 낼 수 없다(ADR-067 D3와 동일 원리).
- **confidence ladder 정합**: Low 조건의 «미충족 AC 있음»은 **기계 검증 AC 한정**으로 읽는다. 사람·플랫폼 관측 비중은 **자동화율 <70%** 가 이미 잡으므로 이중으로 깎지 않는다.
```

### 1.1.8 `## 결과` 절의 발급 경로 문장을 고친다

**앵커**: `- `사용자 관측`·`플랫폼 관측`의 발급 경로는 둘이다`

**현재**
```
- `사용자 관측`·`플랫폼 관측`의 발급 경로는 둘이다 — [ADR-066](ADR-066-milestone-acceptance.md)의 `/accept-milestone`(task 스코프 `--task`는 finalize 전, 마일스톤 스코프는 stabilize 뒤) 또는 사용자 직접 기재. **마일스톤 수용 라운드 자체는 권장이며 의무가 아니다** — 그 modality를 쓰지 않는 프로젝트는 그 단계 없이 진행한다.
```
**바꿀 내용**
```
- `사용자 관측`·`플랫폼 관측`의 발급 경로는 둘이다 — [ADR-066](ADR-066-milestone-acceptance.md)의 `/accept-milestone <M>`(stabilize 뒤) 또는 사용자 직접 기재. **그 modality를 쓴 AC가 하나도 없는 마일스톤에서는 수용 라운드가 권장이며 의무가 아니다.** 그 modality를 쓴 AC가 있으면 receipt 없이는 졸업(item 4 (a'))을 통과하지 못하므로 사실상 이 단계를 거치게 된다.
```

### 1.1.9 Surfaces를 갱신한다

**앵커**: `## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT. 실제 파일 경로 1행 1개)`

이 헤딩 **바로 다음 줄에** 아래 한 줄을 삽입한다.

```
> 등재 기준: 본 ADR의 결정을 **실행하거나 집행하는 파일만** 등재한다. 본 ADR을 배경·역사로 언급만 하는 파일은 등재하지 않는다.
```

이어서 목록의 아래 한 줄을 **교체**한다.

**현재**
```
- .claude/skills/accept-milestone/SKILL.md              — D3 receipt 작성자 (task 스코프 · 마일스톤 스코프)
```
**바꿀 내용**
```
- .claude/skills/accept-milestone/SKILL.md              — D3 receipt 작성자 (마일스톤 스코프 단독)
```

이어서 아래 한 줄도 **교체**한다.

**현재**
```
- docs/90-decisions/boilerplate/ADR-067-milestone-graduation-v2.md — D4 충족률이 졸업 item 4 입력
```
**바꿀 내용**
```
- docs/90-decisions/boilerplate/ADR-067-milestone-graduation-v2.md — D1 modality가 졸업 item 4 (a)/(a') 분기 기준 · D6 판정값이 item 4 (b) 입력
```

마지막으로 목록 **맨 끝에** 아래 두 줄을 추가한다.
```
- .claude/skills/stabilize-milestone/SKILL.md           — D1 item 4 (a') 관측 AC receipt 직접 판독
- docs/30-workitems/_templates/MILESTONE_TEMPLATE.md    — D1 관측 modality의 졸업 게이트 위치
```

### 1.1.10 Mutation Contract Target을 갱신한다

**앵커**: `1. **Target** — TASK_TEMPLATE `## 6-1`·`## 8` / plan-workitem modality authoring`

**현재 (Target 한 줄 전체)**
```
1. **Target** — TASK_TEMPLATE `## 6-1`·`## 8` / plan-workitem modality authoring / implement-workitem·builder.md modality별 RGR 분기 / validate-workitem AC 매핑 판정·report 양식·confidence 입력 / finalize-workitem AC 게이트 / repair-workitem·repair-acceptance·repair-milestone receipt 무효화 / accept-milestone receipt 작성 / validator.md 판정 규칙 / ADR-009 opt-out 명확화 / ADR-067 졸업 item 4.
```
**바꿀 내용**
```
1. **Target** — TASK_TEMPLATE `## 6-1`·`## 8`(`- ac-pending` 포함) / plan-workitem modality authoring / implement-workitem·builder.md modality별 RGR 분기 + `- ac-pending` 기록 / validate-workitem AC 매핑 판정·**D6 판정값 3종**·report 양식·confidence 입력 / finalize-workitem 관측 AC 통과 처리 + `- ac-pending` 기록 / repair-workitem·repair-acceptance·repair-milestone receipt 무효화 / accept-milestone receipt 작성(마일스톤 스코프 단독) / stabilize-milestone 졸업 item 4 (a') 판독 / validator.md 판정 규칙 / ADR-009 opt-out 명확화 / ADR-067 졸업 item 4.
```

---

## 1.2 ADR-066 — 마일스톤 수용 단계

파일: `docs/90-decisions/boilerplate/ADR-066-milestone-acceptance.md`

### 1.2.1 D1의 스코프 2종을 1종으로 줄인다

**교체 범위**: `**스코프 2종 — 이 구분이 lifecycle 교착을 막는 지점이다.**` 로 시작하는 줄부터, `- 마일스톤 스코프 **라운드 상한 3회**.` 로 시작하는 줄 **직전까지**.

**현재 (교체 대상 전체)**
```
**스코프 2종 — 이 구분이 lifecycle 교착을 막는 지점이다.**

| 스코프 | 호출 | 시점 | 다루는 것 | 라운드 카운터 | `## 11` 기록 |
|---|---|---|---|---|---|
| **task 스코프** | `/accept-milestone --task <task-id>` | `/validate-workitem`이 그 task의 `사용자 관측`·`플랫폼 관측` AC를 미충족으로 낸 직후(= `finalize` 전) | **그 task의 해당 AC만.** receipt 발급 또는 미충족 확정 | 소모하지 않음 | 쓰지 않음 |
| **마일스톤 스코프** | `/accept-milestone <M>` | `/stabilize-milestone` 뒤 | 마일스톤 전체 경험 확인 + 자유 탐색 + 피드백 3갈래 라우팅 | 소모(상한 3) | 씀 |

- **task 스코프를 두는 이유**: `사용자 관측` AC의 receipt를 마일스톤 스코프에서만 발급할 수 있으면 `validate 미충족 → finalize 불가 → task done 불가 → stabilize 진입 불가 → 발급 불가`의 순환이 생긴다. 선례는 `/stabilize-milestone --feature F-NNN`의 스코프 모드다(그 모드도 졸업 판정·회고 쓰기를 skip한다).
- **task 스코프가 푸는 것은 «지금 사람이 보면 알 수 있는» 관측이다** — 수동 UI 확인, 실기기 확인, 로컬 실행 결과 확인 등. **커밋·배포 이후에만 일어나는 사실**(CI 실행·배포 후 동작·실제 스케줄 발화)은 애초에 그 task의 AC로 두지 않고 후속 verification task로 분리한다([ADR-065](ADR-065-ac-verification-contract.md) D1 경계) — 그것까지 이 스코프로 풀려 하면 finalize를 무한정 붙잡게 된다.
- **task 스코프는 마일스톤 스코프를 대체하지 않는다** — 전자는 *증거 발급*, 후자는 *경험 수용*이다.
```

**바꿀 내용**
```
**스코프는 하나다 — 마일스톤 스코프(`/accept-milestone <M>`)뿐이다.** `/stabilize-milestone` 뒤에 실행하며, 마일스톤 전체 경험 확인 + 자유 탐색 + 피드백 3갈래 라우팅 + 관측 modality AC의 receipt 발급을 한 라운드에서 함께 처리한다. 라운드 카운터를 소모하고 `## 11`에 기록한다.

- **task 스코프 모드를 두지 않는 이유**: 그 모드는 `receipt 없어 finalize 불가 → task done 불가 → stabilize 진입 불가 → 발급 불가` 교착을 풀기 위한 장치였으나, 같은 교착을 **`/finalize-workitem`이 관측 AC 미충족을 통과시키는 것**으로 더 싸게 풀 수 있다([ADR-065](ADR-065-ac-verification-contract.md) D1·D6). task 스코프를 두면 관측 AC를 쓴 task 수만큼 «수용 → 재validate → finalize» 왕복이 추가로 발생한다.
- **차단은 사라지지 않고 위치가 바뀐다** — 미발급 receipt는 [ADR-067](ADR-067-milestone-graduation-v2.md) D1 item 4 (a')가 졸업 시점에 잡는다. 관측 AC가 하나라도 미발급이면 그 마일스톤의 graduation은 `PENDING_ACCEPTANCE`이며 `YES`가 될 수 없다.
- **커밋·배포 이후에만 일어나는 사실**(CI 실행·배포 후 동작·실제 스케줄 발화)은 애초에 그 task의 AC로 두지 않고 후속 verification task로 분리한다(ADR-065 D1 경계).
```

### 1.2.2 D1의 첫 불릿을 조건부로 바꾼다

**앵커**: `- **졸업 필수 조건이 아니다(권장).** 실행하지 않아도 졸업할 수 있다.`

**현재**
```
- **졸업 필수 조건이 아니다(권장).** 실행하지 않아도 졸업할 수 있다. 단 `사용자 관측`·`플랫폼 관측` modality를 쓴 AC는 receipt 없이 충족되지 않으므로(ADR-065 D1) 그 modality를 쓴 프로젝트는 본 단계를 거치게 된다.
```
**바꿀 내용**
```
- **관측 modality AC가 0건인 마일스톤에서는 졸업 필수 조건이 아니다(권장).** 실행하지 않아도 `YES`로 졸업할 수 있다. 반대로 `사용자 관측`·`플랫폼 관측` modality를 쓴 AC가 1건이라도 있으면 그 receipt 없이는 졸업 item 4 (a')를 충족하지 못하므로(ADR-065 D1 / ADR-067 D1) **본 단계가 사실상 필수 경로가 된다.** 그 상태의 graduation 값이 `PENDING_ACCEPTANCE`다(ADR-067 D3).
```

### 1.2.3 D2 라우팅 표의 «계약 변경» 목적지를 ROADMAP Backlog로 바꾼다

**앵커**: `| 계약 변경(결정) | 계약 자체를 바꾸려는 것(방향 변경·새 기능) | `docs/10-charter/DECISION_REGISTER.md` `status: open` + 다음 M 후보 (ADR-060 D11 경로) | 아니오 |`

**바꿀 내용**
```
| 계약 변경(결정) | 계약 자체를 바꾸려는 것(방향 변경·새 기능) | `docs/30-workitems/ROADMAP.md` `## Backlog` (append — [ADR-057](ADR-057-planning-v2-batch-and-seam.md)#amend-4) | 아니오 |
```

### 1.2.4 D2에 목적지 근거를 추가한다

**앵커**: `**이 분류는 skill이 단독으로 확정하지 않고 사용자에게 확인받는다** — 이것이 수용 라운드가 마일스톤을 무한히 늘리지 않게 하는 지점이다.`

그 줄 **바로 뒤에** 아래 블록을 삽입한다.

```

- **«계약 변경»이 `DECISION_REGISTER`가 아니라 ROADMAP인 이유**: 원장의 유일한 강제력은 **봉인 차단**인데(`open` 항목이 있으면 그 M을 봉인하지 못한다), 「다음 M에 이 기능을 넣을까」는 **아무것도 막지 않는다**. 차단이 필요 없는 항목을 차단 장치에 넣으면 원장이 두꺼워져 봉인 검사와 `/plan-milestone` R1 triage가 매 라운드 무거워진다(원장 자신의 «얇게 유지하는 규칙» 정합). 그리고 R5 시점에는 **사용자가 이미 «바꾸자»고 말한 상태**라 남은 것은 «언제»뿐이다 — 그것은 결정 문제가 아니라 계획 문제다. 원장 5종의 배타적 기록 범위 SSOT는 `docs/00-meta/STRUCTURE.md`의 `## Canonical Owner 매핑`이다([ADR-005](ADR-005-ssot.md)#amend-1).
```

### 1.2.5 D4에 Green 확인·자체 검증·재개방 판별을 추가한다

**앵커**: `- **각 `Adopt` 항목마다 그 결함을 재현하는 실패 테스트를 먼저 추가(Red)한 뒤 고친다.**`

**현재**
```
- **각 `Adopt` 항목마다 그 결함을 재현하는 실패 테스트를 먼저 추가(Red)한 뒤 고친다.** 불가능하면 사유를 결정 이력에 남긴다. 문구·간격류 소수정(코드 3줄 이하·행동 불변)은 면제한다.
```

**바꿀 내용**
```
- **각 `Adopt` 항목마다 그 결함을 재현하는 실패 테스트를 먼저 추가(Red)한 뒤 고치고, 고친 뒤 그 테스트가 통과하는지 확인한다(Green).** 불가능하면 사유를 결정 이력에 남긴다. 문구·간격류 소수정(코드 3줄 이하·행동 불변)은 면제한다. **Red만 관측하고 Green을 확인하지 않으면 그 테스트는 증거가 아니다.**
- **자체 검증(즉시 파손 감지)**: 전 항목 수정이 끝난 뒤 `validate --changed`(미지원이면 통합 `validate`, 통합 명령이 없으면 skip)를 1회 실행한다. **전체 검증이 아니다** — «방금 한 수정이 즉시 깨졌는가»만 본다. 고치는 대상은 **본 라운드 수정이 만든 실패로 한정**하고(baseline = 직전 `/stabilize-milestone` 단계 3의 통합 validate 결과), 그 이전부터 있던 실패는 고치지 않고 출력에 명시한다. **최대 3회 반복**하고 초과하면 `Needs Follow-up: <실패 목록>`으로 명시하고 종료한다. skip 시 별도 hardstop을 만들지 않는다.
- **재개방 판별 (`scope: in-AC | out-of-AC`)**: 각 `Adopt`·`Adopt-modified` 항목마다 **«이 변경 줄을 기존 계약으로 거꾸로 추적할 수 있는가»** 를 판정한다. 계약의 범위는 task `## 6. AC` · task `## 3. 구현 항목`의 line item · feature `## 7. FAC` · feature `## 7-2`의 INV · 승인 프로토타입 · DESIGN.md 계약(§2 토큰·§7 컴포넌트·§9 Don'ts·§10 voice)이다.
  - **`in-AC`(추적 가능)** → **그 task를 재개방해 정상 절차로 마감한다** — `/repair-workitem <T-NNN> "<finding>"` 위임 → `/validate-workitem` → `/finalize-workitem`. per-task 감사(diff-trace·Arch-iface 닫힌 결정·MCP·Design-inventory·AC↔테스트 매핑)를 그대로 받는다. **이 연쇄는 그 skill의 다른 수정·원장 쓰기보다 먼저, task 한 개씩 순차로 돈다** — `/finalize-workitem`이 task `## 4-1` 밖 변경을 `Needs Review`로 차단하므로, 미커밋 cross-cutting 수정이 tree에 쌓인 뒤 부르면 멈춘다.
  - **`out-of-AC`(추적 불가)** → **재개방하지 않는다.** 재개방은 그 task의 잠긴 계획(`## 6 AC`·`## 3`)에 근거가 없는 변경을 사후로 밀어 넣는 것이고, per-task 감사가 그 줄을 정당하게 «추적 불가»로 분류하므로 재개방·재마감을 반복해도 해소되지 않는다. 본 skill이 직접 고치고 아래 계약 부채 등재로 추적한다. **채점표 갱신을 위한 재validate는 한다** — 그때 붙는 `추적 불가` 라벨은 diff-trace audit에서 P1 기록 등급이며 차단이 아니다(`Needs Fix` 트리거는 (c) pre-existing dead code 삭제 하나뿐이다).
  - **애매하면 재개방한다** — 실패 방향을 안전한 쪽(비용만 더 듦)으로 고정한다.
- **`out-of-AC` 계약 부채 등재 (필수)**: `out-of-AC`로 고친 항목마다 `docs/40-validation/IMPROVEMENT_GUIDE.md`의 **`## 4. 보류 항목`**에 `status: open`으로 등재한다 — 「코드에는 들어갔으나 어느 계약에도 근거가 없다」는 사실과, 다음 `/plan-milestone` R0가 회수해 **AC 승격 여부를 사용자에게 묻는다**는 회수 경로를 함께 적는다. 이 등재가 없으면 그 기능은 영구히 계약 밖에 남는다.
```

### 1.2.6 D5에 `(수용)` 태그 위치를 명시한다

**앵커**: `- D2의 3번(개선 제안)을 이번 마일스톤에서 고치기로 사용자가 택한 경우,`

그 불릿 **바로 뒤에** 아래 한 줄을 추가한다.
```
- **`(수용)` 태그의 위치는 «굵은 ID 바로 뒤, 첫 `|` 앞»으로 고정한다** — `- **M1-003** (수용) | P2 | [관측됨] | linked: M1 | status: open`. 두 원장의 `## 항목 스키마`가 첫 토큰을 굵은 ID로 규정하므로 ID 앞에 붙이지 않는다. 회수는 문자열 `(수용)` 정확 일치로 한다.
```

### 1.2.7 D6을 신설한다 (pattern-scan 메커니즘 흡수)

**앵커**: `## 근거`

이 헤딩 **바로 앞에** 아래 블록을 삽입한다.

~~~
### D6. 동일 패턴 전수 검색 (pattern-scan)

repair가 결함 하나를 고칠 때 **같은 패턴의 다른 출현을 저장소 전체에서 읽기 전용으로 검색**하고 그 결과를 기록한다. 범위 계약 때문에 못 고친 출현을 마일스톤 층으로 넘기는 배선이다.

- **수행 주체**: `/repair-workitem`·`/repair-acceptance`·`/repair-milestone`. `Adopt`·`Adopt-modified`한 각 결함마다 1회.
- **기록 위치·형식**: 대상 task `## 8`에 append.
  ```
  - pattern-scan <날짜> <패턴 1줄>: 범위 내 N건 수정 / 범위 밖 M건 <경로 목록>
  ```
  검색 결과가 없으면 `범위 밖 0건`으로 적는다(검색했다는 사실 자체가 기록이다). **어느 task에도 귀속되지 않는 순수 cross-cutting 결함**은 대상 task가 없으므로 `IMPROVEMENT_GUIDE.md ## 5. Repair decision log`의 그 항목 하위 줄에 같은 형식으로 적고, 범위 밖 출현을 그 skill의 마지막 출력에 직접 나열한다.
- **범위 밖 출현은 고치지 않는다** — 읽기는 범위 제한 대상이 아니지만 쓰기는 그 skill의 범위 계약을 따른다.
- **회수**: `/stabilize-milestone` §1.0이 산하 task `## 8`의 (HTML 주석 밖) `- pattern-scan` 줄을 읽어 `범위 밖 M건 ≥ 1`인 항목을 `IMPROVEMENT_GUIDE.md`에 `P1 [Pattern-spread]`로 등재하고, `/repair-milestone`이 그것을 cross-cutting 결함으로 처리한다.
- **재등재 금지(dedup)**: ID는 `<task-id>-pspread-<패턴 슬러그>`로 안정적으로 만들고, 그 ID가 이미 원장에 있으면(`open`이든 `resolved`든) 다시 등재하지 않는다. `- pattern-scan` 줄이 task 문서에 영속되므로 이 규칙이 없으면 매 마일스톤 같은 P1이 재생산된다. **예외**: 기존 ID가 `resolved`인데 **경로 목록이 다른** `- pattern-scan` 줄이 새로 append됐으면 `-2`·`-3` suffix로 새 ID를 발급한다.
~~~

### 1.2.8 Preserved invariants의 status 소유권 문구를 정확히 한다

**앵커**: `4. **Preserved invariants** — `/stabilize-milestone` read-only + 졸업 판정 소유권`

**현재 (그 줄 끝부분)**
```
ADR-047 D7 commit owner / task status 소유권(finalize·repair-workitem 한정).
```
**바꿀 내용**
```
ADR-047 D7 commit owner / task status 소유권(`/finalize-workitem`·`/repair-workitem` 한정 — `/repair-acceptance`·`/repair-milestone`은 status를 직접 쓰지 않고 `in-AC` 결함을 `/repair-workitem`에 위임한다).
```

### 1.2.9 Mutation Contract Target과 Surfaces를 갱신한다

**앵커**: `1. **Target** — `.claude/skills/accept-milestone/SKILL.md` 신규`

**현재 (Target 한 줄 전체)**
```
1. **Target** — `.claude/skills/accept-milestone/SKILL.md` 신규 / `.claude/skills/repair-acceptance/SKILL.md` 신규 / 양 Codex wrapper 신규 / `.gitignore` acceptance-reviews / MILESTONE_TEMPLATE `## 11` / stabilize §3-V (d)·단계 8 다음 단계 / validate-workitem·finalize-workitem의 task 스코프 라우팅 / repair-milestone D5 경계 / IMPROVEMENT_GUIDE `## 5` writer 목록 / ADR-007 단계 추가 note / WORKFLOW lifecycle·실행 순서 / DELEGATION 위임 표·실행 순서 / STRUCTURE 로스터·산출물 표 / README·README_ko wrapper 목록.
```

**바꿀 내용**
```
1. **Target** — `.claude/skills/accept-milestone/SKILL.md` / `.claude/skills/repair-acceptance/SKILL.md` / 양 Codex wrapper / `.gitignore` acceptance-reviews / MILESTONE_TEMPLATE `## 11` / stabilize §3-V (d)·§1.0 pattern-scan 회수·단계 8 다음 단계 / validate-workitem·finalize-workitem의 관측 AC 처리 / repair-milestone D5 경계 + D6 pattern-scan + 수리 규율 + 루프 닫기 / repair-workitem D6 pattern-scan / TASK_TEMPLATE `## 8` pattern-scan 형식 / QA_FINDINGS·IMPROVEMENT_GUIDE `## 항목 스키마`(`(수용)` 태그)·IMPROVEMENT_GUIDE `## 4` 계약 부채 / ROADMAP `## Backlog`(D2 계약 변경 목적지) / ADR-007 단계 추가 note / WORKFLOW lifecycle·실행 순서 / DELEGATION 위임 표·실행 순서 / STRUCTURE 로스터·산출물 표·Canonical Owner 매핑 / README·README_ko wrapper 목록.
```

**앵커**: `## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT. 실제 파일 경로 1행 1개)`

이 헤딩 **바로 다음 줄에** 아래 한 줄을 삽입한다.
```
> 등재 기준: 본 ADR의 결정을 **실행하거나 집행하는 파일만** 등재한다. 본 ADR을 배경·역사로 언급만 하는 파일은 등재하지 않는다.
```

이어서 아래 두 줄을 **교체**한다.

**현재**
```
- .claude/skills/validate-workitem/SKILL.md              — D1 task 스코프 라우팅(미충족 관측 AC → `--task` 안내)
- .claude/skills/finalize-workitem/SKILL.md              — D1 `Needs Acceptance` 종료 + task 스코프 안내
```
**바꿀 내용**
```
- .claude/skills/validate-workitem/SKILL.md              — D1 관측 AC 미충족의 report 표현 + 다음 액션
- .claude/skills/finalize-workitem/SKILL.md              — D1 관측 AC 미충족 통과 처리 + `- ac-pending` 기록
```

목록 **맨 끝에** 아래 네 줄을 추가한다.
```
- .claude/skills/repair-workitem/SKILL.md                — D6 pattern-scan 수행
- docs/30-workitems/_templates/TASK_TEMPLATE.md          — D6 `- pattern-scan` 줄 형식
- docs/40-validation/QA_FINDINGS.md                      — D2 결함 등재 + D5 `(수용)` 태그
- docs/30-workitems/ROADMAP.md                           — D2 계약 변경의 목적지 (`## Backlog`)
```

### 1.2.10 `## 결과` 절을 갱신한다

**앵커**: `- `stabilize → accept → (repair-acceptance) → accept 재확인 → stabilize 재실행 → 졸업` 흐름이 생긴다.`

**현재**
```
- `stabilize → accept → (repair-acceptance) → accept 재확인 → stabilize 재실행 → 졸업` 흐름이 생긴다.
- ADR-065의 `사용자 관측` modality가 발급 경로를 갖는다.
```
**바꿀 내용**
```
- `stabilize(PENDING_ACCEPTANCE) → accept → (repair-acceptance) → accept 재확인 → stabilize 재실행 → 졸업(YES)` 흐름이 생긴다.
- ADR-065의 `사용자 관측` modality가 발급 경로를 갖고, 그 receipt 발급은 **재validate를 유발하지 않는다**(졸업 item 4 (a')가 task `## 8`을 직접 읽는다 — ADR-067 D1).
```

### 1.2.11 D4의 무조건 문장 3개를 분기에 종속시킨다

§1.2.5가 넣은 «재개방 판별»은 `in-AC` 항목에 **task 재개방과 `/repair-workitem` 위임**을 지시한다. 그런데 같은 D4 안에 «기존 task를 재개방하지 않는다»가 무조건으로 남아 있어 **같은 절 안에서 정면 충돌**한다(앞 불릿만 읽은 실행자는 위임을 거부한다). 커밋 경계와 `## 정책 강도` 열거도 같은 가족이다. **skill 층의 같은 문장은 §4.2.1·§4.2.4·§4.2.13이 고치므로, 소유 ADR 본문을 여기서 함께 고쳐야 정책과 실행이 어긋나지 않는다.**

**앵커**: `- **기존 task를 재개방하지 않는다.** task `## 0. Status`와 계획 본문`

**현재 (줄 전체)**
```
- **기존 task를 재개방하지 않는다.** task `## 0. Status`와 계획 본문(`## 3`·`## 6`·`## 6-1`)을 건드리지 않는다. 쓰는 것은 **코드**와 **task `## 8`의 append 2종**(`- invalidated` receipt 무효화 / `- pattern-scan` 검색 기록)뿐이다 — 둘 다 이력 추가이며 계약 수정이 아니다. 추적성은 결정 이력의 `affected: T-NNN` 역참조로 확보한다.
```
**바꿀 내용**
```
- **task 재개방 여부는 아래 «재개방 판별»의 결과에 종속된다** — `in-AC` 항목은 `/repair-workitem`에 위임해 그 task를 재개방하고, `out-of-AC` 항목만 재개방 없이 본 skill이 직접 고친다. **어느 쪽이든 본 skill은 task `## 0. Status`를 직접 쓰지 않고**(재개방 전이 `done → in-progress`의 writer는 `/repair-workitem` 하나다 — ADR-057#amend-3 결정 5) 계획 본문(`## 3`·`## 6`·`## 6-1`)도 건드리지 않는다. **본 skill이 task 문서에 쓰는 것은 `## 8`의 append 2종**(`- invalidated` receipt 무효화 / `- pattern-scan` 검색 기록)뿐이다 — 둘 다 이력 추가이며 계약 수정이 아니다. `out-of-AC` 수정의 추적성은 결정 이력의 `affected: T-NNN` 역참조로 확보한다.
```

**앵커**: `- 커밋하지 않는다(commit owner는 사용자 — ADR-047 D7).`

**바꿀 내용**
```
- **본 skill은 커밋하지 않는다**(ADR-047 D7). 단 `in-AC` 위임 뒤의 연쇄에서 `/finalize-workitem`이 **그 task의 `## 4-1` 파일 + task 문서**를 커밋한다 — `out-of-AC` 수정 파일과 원장 갱신은 여전히 사용자가 커밋한다. 즉 commit owner는 «task 마감분 = `/finalize-workitem` / 그 밖 전부 = 사용자»로 갈린다.
```

**앵커**: `- **제약(약)**: D4의 3+1 판정·회귀 테스트 선행·task 재개방 금지, D5 경계.`

**바꿀 내용**
```
- **제약(약)**: D4의 3+1 판정·회귀 테스트 선행(Red→Green)·`out-of-AC` 항목의 재개방 금지, D5 경계.
```

> **`## 근거`의 «권장(비차단)으로 두는 이유» 줄은 여기서 건드리지 않는다** — 그 줄은 «수용 라운드를 졸업 checklist item으로 승격하지 않은 이유»이고 그 사실은 그대로 유효하다(차단력은 D1 item 4 (a')가 갖는다). 그 줄은 §6.9가 다른 이유(죽은 ADR 인용)로 손대므로 여기서 바꾸면 §6.9의 앵커가 사라진다.

---

## 1.3 ADR-067 — 마일스톤 졸업 계약 v2

파일: `docs/90-decisions/boilerplate/ADR-067-milestone-graduation-v2.md`

### 1.3.1 `## 대체` 절의 역사 보존 선언을 ADR-045 D10에 맞춘다

이 줄은 «"본 D3은 ADR-014 `## Amendment 2`로 박는다"를 바꾸지 말라»고 지시하고 «`[Ref-dead]` 발화는 의도된 상태»라고 선언한다. Phase 6이 그 문장을 재작성하고 4.4.2가 그 발화를 차단하므로, 이 줄을 먼저 고치지 않으면 정책과 실행이 정면 충돌한다.

**앵커**: `- **역사적 서술은 원문을 보존한다.** 다른 ADR이`

**현재**
```
- **역사적 서술은 원문을 보존한다.** 다른 ADR이 *"본 D3은 ADR-014 `## Amendment 2`로 박는다"* 처럼 **과거에 한 행위**를 기록한 문장은 바꾸지 않는다(바꾸면 존재하지 않는 역사가 된다). 그 결과 그 줄들에 `P2 [Ref-dead]`(superseded ADR 인용)가 발화하는데 **의도된 상태**다 — 기록을 거짓으로 만드는 것보다 report-only 등급의 P2가 낫다.
```
**바꿀 내용**
```
- **ADR-014 인용의 처리는 [ADR-045](ADR-045-doc-reference-contract.md)#amend-2의 5종 분류를 따른다.** 살아있는 규칙 인용은 재지정하고, **Rollback path·Mutation Target 같은 «실행 불가가 된 지시»는 현재 유효한 내용으로 재작성하며**(그것은 역사가 아니라 죽은 절차다), 배경 서술은 링크를 제거하고 산문으로 다시 쓴다. **supersede 선언·인덱스 행·실행 기록(Record)만 원문을 보존하고 그 줄 끝에 `(현재 SSOT: ADR-NNN)`을 병기한다** — `/stabilize-milestone`의 `[Ref-dead]` 검사는 그 병기가 있는 줄을 건너뛰므로, 처리를 마치면 이 supersede로 인한 `[Ref-dead]` 발화는 0건이 된다. **과거에 한 행위를 기록한 문장 자체는 바꾸지 않는다**(바꾸면 존재하지 않는 역사가 된다) — 기록은 사실대로 두고 검사 소음은 마커로 없앤다. (현재 SSOT: 본 ADR)
```

**주의 — 본 절이 §6.10.3을 대체한다.** §6.10.3은 같은 줄에 D10 정합 문구를 넣는 단계였다. Phase 1이 이 줄을 먼저 통째로 재작성하므로 6.10.3의 「현재」는 더 이상 존재하지 않는다. 6.10.3은 **적용하지 않는다**(해당 절에 그 표시가 있다). 위 교체문 끝의 `(현재 SSOT: 본 ADR)`이 이 줄의 `[Ref-dead]` 검사 제외 마커다.

### 1.3.2 D1 item 4를 재정의한다

**교체 범위**: `4. **AC 충족 100% + report 유효** — 본 마일스톤 **모든 task**의 최신` 으로 시작하는 줄부터, `   - **report 부재 task는 미충족**으로 처리한다.` 으로 시작하는 줄까지(**포함**).

**현재 (교체 대상 전체)**
```
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
```

**바꿀 내용**
```
4. **AC 충족 100% + report 유효** — 본 마일스톤 **모든 task**에 대해 아래를 **모두** 만족한다. **입력이 둘로 나뉜다** — 기계 검증 AC는 채점표(`docs/40-validation/reports/<task-id>.md`)에서, 관측 AC는 task 문서 `## 8`에서 **직접** 읽는다.
   - (a) **기계 검증 AC 전부 충족** — 채점표 `## AC ↔ 검증 매핑`에서 modality가 `[자동 테스트]`·`[산출물 검사]`이거나 표기 부재(legacy)인 AC가 전부 충족. 판정 기준은 [ADR-065](ADR-065-ac-verification-contract.md) D1 modality이며 `미관측`은 미충족, **`## 6-2. TDD opt-out`은 본 항목의 예외가 아니다**(ADR-065 D2).
   - (a') **관측 AC 전부 receipt 유효** — task `## 6-1`에서 modality가 `[사용자 관측]`·`[플랫폼 관측]`인 AC마다, **그 task `## 8`의 (HTML 주석 밖) 그 AC 마지막 이벤트가 `- ac-acceptance`** 인가(ADR-065 D3 판독 규칙 2). `- ac-pending`·`- invalidated`이거나 이벤트가 없으면 미충족.
     - **채점표를 경유하지 않는 이유(중요)**: receipt는 코드 상태와 무관한 사실이고 커밋된 task 문서에 있다. 채점표를 경유하면 receipt 발급마다 그 task의 `/validate-workitem` 재실행이 강제되어, 수용 라운드 1회마다 관측 AC를 쓴 task 수만큼 재채점이 발생한다.
     - **(a')만 미충족이고 나머지가 전부 충족이면 graduation은 `PENDING_ACCEPTANCE`다**(D3). 처방은 `/accept-milestone <M>`이다.
   - (b) **채점표 판정이 `Pass` 또는 `Pending Acceptance`**(ADR-065 D6). AC 행만 읽으면 다른 축의 미해소 P0(diff-trace 파괴적 변경·닫힌 결정 위반 등)가 졸업을 통과하므로 판정을 함께 읽어 그 구멍을 막는다. **`Needs Fix`는 미충족이다.**
   - (c) **채점표 `## Orchestration`의 `감사 미완(unavailable)` 항목이 없다.** 돌지 않은 감사를 근거로 충족을 단정하지 않는다(D3의 평가 규칙과 동일 원리).
   - (d) **채점표가 stale하지 않다** — 채점표 파일 mtime이 그 task `## 4-1`에 등재된 **구현 파일**들의 최신 mtime보다 오래되지 않았다(같으면 통과 — 저해상도 파일시스템 오차단 방지).
     - **비교 대상에서 task 문서를 제외한다(중요).** `/finalize-workitem`은 stale 검사를 통과한 *뒤에* task `## 0. Status`를 `done`으로 쓰므로, 정상 마감된 모든 task는 task 문서 mtime > 채점표 mtime이 된다. task 문서를 비교에 넣으면 **정상 경로의 전 task가 미충족**이 되어 어떤 마일스톤도 졸업하지 못한다.
     - **task `## 8` 갱신(receipt 발급·무효화)은 이 항의 대상이 아니다** — task 문서를 비교에 넣지 않으므로 receipt 발급이 stale을 만들지 않고, 그 AC의 판정은 **(a')** 가 담당한다.
     - **`## 4-1`에 없는 파일을 고치는 cross-cutting 수정**(`/repair-milestone`)은 mtime으로 잡히지 않는다. 그 경로는 **그 skill이 영향 task의 채점표를 삭제**하는 것으로 처리한다 — 부재 = 미충족이므로 재validate가 강제되고, **그 재validate는 `/repair-milestone`이 자기 루프 안에서 스스로 실행한다**(사용자에게 미루지 않는다).
     - **`## 4-1`이 비어 비교 대상을 얻지 못하는 task는 «비교 불가»로 기록만 하고 차단하지 않는다** — `/stabilize-milestone` §1.5 출력에 한 줄 남긴다(관측 없이 게이트를 조이지 않는다 — ADR-022).
     - stale이면 미충족으로 처리하고 처방은 **그 task의 `/validate-workitem` 재실행**이다.
   - **채점표 부재 task는 미충족**으로 처리한다. 새 체크아웃·다른 worktree가 이에 해당하며(채점표는 gitignore된 checkout-local ephemeral — 설계상 정상), 그때는 각 task의 `/validate-workitem`을 먼저 재실행한 뒤 본 항목을 평가한다.
```

### 1.3.3 D3의 graduation 판정값을 4종으로 늘린다

**교체 범위 (정확히 5줄)**: 아래 시작 줄부터 끝 줄까지 **딱 그 5줄만** 교체한다. **그 다음에 오는 들여쓴 하위 불릿 6개는 건드리지 않는다** — 거기에 감사 미완 평가 규칙·reviewer report-only·host 제약 e2e 처리가 들어 있어 삭제하면 안 된다.

- 시작 줄: `### D3. graduation 판정값 3종`
- 끝 줄: `- **`BLOCKED`** — **평가 실행 불가**. 두 경우다:` 로 시작하는 줄 (그 줄 전체)

**현재 (교체 대상 5줄 전체)**
```
### D3. graduation 판정값 3종
`graduation: <YES | NO | BLOCKED> (<날짜>)`.
- **`YES`** — D1의 5(+선택 6) 항목 전부 충족.
- **`NO`** — 제품·계획 사유로 미충족.
- **`BLOCKED`** — **평가 실행 불가**. 두 경우다: (a) e2e blocked-on-env, (b) **감사 미완** — 졸업 predicate에 입력을 주는 축(qa 팬아웃)의 감사를 회수 규율을 전부 소진해도 완료하지 못한 상태. 표기는 `BLOCKED (audit incomplete: <축>)` / `BLOCKED (e2e blocked-on-env: <target>)`.
```

**바꿀 내용**
```
### D3. graduation 판정값 4종
`graduation: <YES | PENDING_ACCEPTANCE | NO | BLOCKED> (<날짜>)`.
- **`YES`** — D1의 5(+선택 6) 항목 전부 충족. 최종 졸업.
- **`PENDING_ACCEPTANCE`** — **사용자 확인만 남았다.** D1 item 4의 **(a') 관측 AC receipt를 제외한 전부**가 충족이다(item 1·2·3·5 전부 충족 + item 4 (a)(b)(c)(d) 충족). 표기는 `PENDING_ACCEPTANCE (관측 AC 미발급: <task-id>:AC-N 목록)` — 예: `PENDING_ACCEPTANCE (관측 AC 미발급: T-004:AC-3, T-007:AC-2)`. 처방은 `/accept-milestone <M>`이다.
- **`NO`** — 제품·계획 사유로 미충족.
- **`BLOCKED`** — **평가 실행 불가**. 두 경우다: (a) e2e blocked-on-env, (b) **감사 미완** — 졸업 predicate에 입력을 주는 축(qa 팬아웃)의 감사를 회수 규율을 전부 소진해도 완료하지 못한 상태. 표기는 `BLOCKED (audit incomplete: <축>)` / `BLOCKED (e2e blocked-on-env: <target>)`.
```

### 1.3.4 값 정의 뒤의 공통 규칙을 추가한다

위 교체가 끝나면 `BLOCKED`의 **들여쓴 하위 불릿 6개가 그대로 따라온다.** 그 하위 불릿이 끝나면 최상위 불릿 `- 기록 시점은 ...` 이 나온다.

**앵커**: `- 기록 시점은 `/stabilize-milestone` 단계 8이며 1회만 쓴다`

이 줄 **바로 앞에** 아래 네 불릿을 삽입한다(들여쓰기 없음 — 최상위 불릿).

```
- **우선순위 (둘 이상 성립할 때)**: `BLOCKED` > `NO` > `PENDING_ACCEPTANCE` > `YES`. 「못 재봤다」가 어떤 긍정 판정보다 강하고, 「결함이 있다」가 「확인만 남았다」보다 앞선다.
- **`PENDING_ACCEPTANCE`가 별도 값인 이유**: 이 상태를 `NO`로 뭉뚱그리면 사용자가 `/repair-milestone`을 호출하는데 고칠 코드가 없어 헛돈다. 판정값마다 다음 액션이 다르다는 것이 이 enum의 존재 이유이며, task 층의 `/validate-workitem` 판정 3종(ADR-065 D6)과 같은 원리다.
- **`ROADMAP.md`의 Done 전환은 `YES`일 때만이다.** `PENDING_ACCEPTANCE`는 Now를 유지한다.
- **관측 modality AC가 0건인 마일스톤에서는 `PENDING_ACCEPTANCE`가 성립하지 않는다** — 그때는 나머지가 전부 충족이면 곧바로 `YES`이며, `/accept-milestone`은 권장(선택)으로 남는다.
```

### 1.3.5 덮어쓰기 규칙을 일반화한다

**앵커**: `- **`BLOCKED`는 기존에 기록된 `YES`를 덮어쓴다.**`

**현재**
```
  - **`BLOCKED`는 기존에 기록된 `YES`를 덮어쓴다.** 재검증 라운드에서 감사가 미완인데 줄을 쓰지 않으면 낡은 `YES`가 그대로 남아 하류(ROADMAP Done)가 졸업으로 읽는다.
```
**바꿀 내용**
```
  - **매 `/stabilize-milestone` 실행이 이 줄을 그 라운드의 최신 판정으로 덮어쓴다.** 특히 `BLOCKED`·`NO`·`PENDING_ACCEPTANCE`는 기존에 기록된 `YES`를 덮어쓴다 — 재검증 라운드에서 줄을 쓰지 않으면 낡은 `YES`가 그대로 남아 하류(ROADMAP Done)가 졸업으로 읽는다.
```

### 1.3.6 D6을 재작성한다

**앵커**: `### D6. 사용자 수용과의 관계`

이 헤딩 다음 문단을 통째로 교체한다.

**현재**
```
[ADR-066](ADR-066-milestone-acceptance.md)의 `/accept-milestone`은 **졸업 필수 조건이 아니다**(권장). 단 `사용자 관측`·`플랫폼 관측` modality를 쓴 AC는 그 receipt 없이 item 4를 충족하지 못한다(그 receipt는 task 스코프 `--task`나 사용자 직접 기재로도 발급된다 — 마일스톤 수용 라운드를 돌려야만 하는 것은 아니다). 필수 승격 트리거는 *졸업 `YES` 후 사용자가 P0급 경험 결함을 발견한 사례* 이며, 그때 본 ADR을 개정한다.
```

**바꿀 내용**
```
[ADR-066](ADR-066-milestone-acceptance.md)의 `/accept-milestone`은 **관측 modality AC가 0건인 마일스톤에서만 선택이다**(권장·비차단). 관측 AC가 1건이라도 있으면 그 receipt 없이 item 4 (a')를 충족하지 못하므로 사실상 필수 경로가 되며, 그 상태의 판정값이 `PENDING_ACCEPTANCE`다(D3). receipt는 `/accept-milestone <M>` 또는 사용자 직접 기재로 발급된다.

**졸업 판정 소유권은 `/stabilize-milestone`에 유지한다.** 수용 라운드가 코드를 고쳤으면 그 뒤 본 skill을 재실행해 `YES`를 확정한다. **단 receipt 발급 자체는 재validate를 유발하지 않는다** — item 4 (a')가 task `## 8`을 직접 읽기 때문이다.
```

### 1.3.7 Surfaces에 등재 기준과 누락분을 추가한다

**앵커**: `## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT. 실제 파일 경로 1행 1개)`

이 헤딩 **바로 다음 줄에** 아래 한 줄을 삽입한다.
```
> 등재 기준: 본 ADR의 결정을 **실행하거나 집행하는 파일만** 등재한다. 본 ADR을 배경·역사로 언급만 하는 파일(재지정 문구·supersede 선언 등)은 등재하지 않는다.
```

목록 **맨 끝에** 아래 네 줄을 추가한다.
```
- .claude/skills/plan-milestone/SKILL.md               — D1 `## 5` 5+1 default 작성 주체 · D3 판정값 소비(로드맵 재조정)
- .claude/skills/validate-plan/SKILL.md                — D1 `[MP-graduation]` 정합 검사
- .claude/agents/reviewer.md                           — D1 `[MP-graduation]` 정합 검사
- .claude/skills/accept-milestone/SKILL.md             — D3 `PENDING_ACCEPTANCE` 소비 + D6 관계
```

### 1.3.8 Mutation Contract를 갱신한다

**앵커**: `1. **Target** — MILESTONE_TEMPLATE `## 5`·`## 8` / stabilize §1.5·단계 8·회고 책임 경계`

**현재**
```
1. **Target** — MILESTONE_TEMPLATE `## 5`·`## 8` / stabilize §1.5·단계 8·회고 책임 경계 / validate-workitem 감사 미완 판정 / repair-milestone·repair-acceptance report 무효화 / ADR-014 status·supersede note / ADR-014 인용 파일 전수(실행 경로는 재지정, 역사적 서술은 병기).
```
**바꿀 내용**
```
1. **Target** — MILESTONE_TEMPLATE `## 5`·`## 8` / stabilize §1.5(item 4 (a)(a')(b)(c)(d))·단계 8 판정 4종·회고 책임 경계 / plan-milestone `## 5` default 복사·로드맵 재조정 / validate-plan·reviewer `[MP-graduation]` / validate-workitem 감사 미완 판정 / repair-milestone·repair-acceptance 채점표 무효화 / accept-milestone `PENDING_ACCEPTANCE` 소비 / ADR-014 status·supersede note / ADR-014 인용 파일 전수(ADR-045#amend-2 D10 분류에 따라 처리). (현재 SSOT: 본 ADR)
```

**⚠ 마커가 반드시 남아야 한다.** 이 교체문은 `ADR-014`(죽은 ADR)를 두 번 인용한다. 줄 끝의 `(현재 SSOT: 본 ADR)`이 `[Ref-dead]` 검사 제외 마커(ADR-045#amend-2 D10)이며, **이걸 빼면 Phase 7.2의 «22 → 0»이 1건 남아 실패한다.**

**주의 — 본 절이 §6.10.4를 대체한다.** §6.10.4는 같은 줄(Mutation Contract Target)에 마커만 붙이는 단계였다. Phase 1이 이 줄을 먼저 재작성하므로 6.10.4의 앵커는 사라지고, 그 처리는 위 교체문이 흡수한다. 6.10.4는 **적용하지 않는다**(해당 절에 그 표시가 있다).

**앵커**: `5. **Falsifying evaluation** — dogfood 재실행에서 (a) 정상 마일스톤이`

**현재**
```
5. **Falsifying evaluation** — dogfood 재실행에서 (a) 정상 마일스톤이 `BLOCKED (audit incomplete)`로 오차단되거나, (b) item 4가 modality 표기 누락만으로 미충족을 내면 D1·D3을 재조정한다.
```
**바꿀 내용**
```
5. **Falsifying evaluation** — dogfood 재실행에서 (a) 정상 마일스톤이 `BLOCKED (audit incomplete)`로 오차단되거나, (b) item 4가 modality 표기 누락만으로 미충족을 내거나, (c) **관측 AC가 있는 정상 마일스톤이 `PENDING_ACCEPTANCE`가 아니라 `NO`로 나오면**(= item 4 (b)와 (a')가 서로를 막는 상태) D1·D3을 재조정한다.
```

### 1.3.9 `## 결과`를 갱신한다

**앵커**: `- 졸업 판정의 네 소비 지점(plan·validate·finalize·stabilize)이 같은 AC 기준을 읽는다.`

**현재**
```
- 졸업 판정의 네 소비 지점(plan·validate·finalize·stabilize)이 같은 AC 기준을 읽는다.
- 감사가 못 돈 상태가 `BLOCKED`로 드러나며 낡은 `YES`를 덮어쓴다.
- 회고 한 줄로 두 원장의 미해소 합계를 볼 수 있다.
```
**바꿀 내용**
```
- 졸업 판정의 네 소비 지점(plan·validate·finalize·stabilize)이 같은 AC 기준을 읽되, **관측 AC의 판정 입력만은 채점표가 아니라 task `## 8`이다.**
- 감사가 못 돈 상태가 `BLOCKED`로, 사용자 확인만 남은 상태가 `PENDING_ACCEPTANCE`로 드러나며 둘 다 낡은 `YES`를 덮어쓴다.
- 회고 한 줄로 두 원장의 미해소 합계를 볼 수 있다.
- 수용 라운드의 **receipt 발급이 재validate를 유발하지 않는다** — 마일스톤 층 왕복 1회당 task 층 재채점 N회가 사라진다.
```

### 1.3.10 Preserved invariants의 ROADMAP writer 문구를 구간별로 정정한다

ADR-057#amend-4(§1.6)가 `## Backlog`를 append-only 다중 writer로 여는데, 본 ADR의 Preserved invariants가 «ROADMAP 단일 작성자»를 무조건으로 보존 선언하고 있어 충돌한다.

**앵커**: `4. **Preserved invariants** — 5+1 구조·항목 무증설`

**현재 (줄 전체)**
```
4. **Preserved invariants** — 5+1 구조·항목 무증설 / e2e 판정 SSOT는 ADR-052#amend-1 / `/stabilize-milestone` read-only 및 write 대상 4종 / ROADMAP 단일 작성자 = plan-milestone.
```
**바꿀 내용**
```
4. **Preserved invariants** — 5+1 구조·항목 무증설(item 4의 (a)/(a') 분기는 *입력 출처* 분리이며 항목 증설이 아니다) / e2e 판정 SSOT는 ADR-052#amend-1 / `/stabilize-milestone` read-only 및 write 대상 4종 / ROADMAP `Done`·`Now`·`Next`·`Later` 구간은 `/plan-milestone` 단독 작성자(`## Backlog`는 append-only 다중 writer — [ADR-057](ADR-057-planning-v2-batch-and-seam.md)#amend-4) / 졸업 판정 소유권 = `/stabilize-milestone` / commit owner = `/finalize-workitem`·사용자 (ADR-047 D7).
```

**⚠ `단일 작성자 = plan-milestone`이라는 문자열을 그대로 쓰지 않는다.** 7.1의 잔존 문자열 검사 #9가 그 표기를 «구간 구분 없는 옛 문구»로 잡으므로, 재작성문이 같은 형태를 쓰면 **검사가 스스로 실패한다.** 위처럼 «구간은 … 단독 작성자» 어순으로 쓴다.

### 1.3.11 D4 pre-check에 `PENDING_ACCEPTANCE` 예외를 넣는다

§1.3.3이 판정값을 4종으로 늘렸는데 D4(pre-check)는 «미충족 시 `졸업 가능: NO` + 조기 종료 옵션»만 규정한다. `PENDING_ACCEPTANCE`는 **item 4 (a')가 미충족인 상태**이므로, 이 문장을 그대로 두면 §4.4.2·§4.4.3이 skill에 넣는 «계속 진행» 분기가 자기 소유 ADR과 어긋나고, D4만 읽은 실행자는 **관측 AC가 있는 모든 마일스톤을 `NO`로 조기 종료**시킨다.

**앵커**: `` `/stabilize-milestone` §1.5가 D1 각 항목을 deterministic 평가한다. ``

**현재 (줄 전체)**
```
`/stabilize-milestone` §1.5가 D1 각 항목을 deterministic 평가한다. 미충족 시 `졸업 가능: NO` + 미충족 목록 출력 + 조기 종료 옵션 제시(강제 종료 아님). `--dry-run`은 pre-check만 돌리고 종료한다(판정 미기록).
```
**바꿀 내용**
```
`/stabilize-milestone` §1.5가 D1 각 항목을 deterministic 평가한다. 미충족 시 `졸업 가능: NO` + 미충족 목록 출력 + 조기 종료 옵션 제시(강제 종료 아님). **단 item 4 (a')만 미충족이고 나머지가 전부 충족이면 `졸업 가능: PENDING_ACCEPTANCE (관측 AC 미발급: <task-id>:AC-N 목록)`을 출력하고 조기 종료 옵션 없이 다음 단계로 계속 진행한다**(D3 — 결함이 아니라 «사람 확인만 남은» 상태이므로 되돌아가 고칠 것이 없다). `--dry-run`은 pre-check만 돌리고 종료한다(판정 미기록).
```

> **`## 정책 강도`의 «D4 pre-check, D5 명명, D6 비차단 관계» 줄은 건드리지 않는다** — 그 칸은 «본 ADR이 새로 만드는 차단력»의 ADR-022 분류이고, 관측 AC의 차단력은 이미 같은 절의 «제약(강) — D1 item 3·4»가 갖는다. D6 자신은 새 게이트를 만들지 않으므로 분류가 바뀌지 않는다.

---

## 1.4 ADR-045 — `## Amendment 2` (supersede 후 인용 처리)

파일: `docs/90-decisions/boilerplate/ADR-045-doc-reference-contract.md`

본 ADR은 배포된 ADR이고 기존 amendment가 1개(`## Amendment 1 (2026-07-25) — D6 통합 재발행 임계 4→8 상향`)다. 따라서 **본문에 D10을 신설하지 않고 `## Amendment 2`로 추가**한다(D6의 «충돌 없는 확장 → amendment» 기준 그대로).

### 1.4.1 파일 맨 끝에 Amendment 2를 추가한다

```
<a id="adr-045-amend-2"></a>
## Amendment 2 (2026-08-11) — supersede 후 인용 처리 (D10 신설)

### 배경
- [관측됨] ADR을 supersede하면 그 ADR을 인용한 줄들이 남는데, 무엇을 재지정하고 무엇을 보존할지 규정이 없다. 그래서 `/stabilize-milestone`의 `[Ref-dead]` 검사가 매 마일스톤 같은 P2를 재생산하고, 그 수가 회고의 `open 항목 스냅샷`을 부풀린다.
- [관측됨] 인용 중에는 **실행 불가가 된 지시**(Rollback path·Mutation Target)가 섞여 있다. 그것은 역사가 아니라 죽은 절차인데 «역사 보존»으로 묶여 방치됐다.

### 결정 — D10. supersede 후 인용 처리
ADR이 `superseded`가 되면 그 ADR을 인용한 **모든 줄**을 아래 5종으로 분류해 처리한다.

| 종류 | 판별 | 처리 |
|---|---|---|
| **A. 살아있는 규칙 인용** | 그 ADR의 규칙을 *지금 적용하라*는 지시 | **새 ADR로 재지정 (의무)** |
| **B. 낡은 지시** | Rollback path·Mutation Contract Target·Surfaces 등 *실행 절차*인데 대상이 죽어 실행 불가 | **현재 유효한 내용으로 재작성하거나 삭제 (의무)** |
| **C. 배경 서술** | "그 ADR의 이런 점이 문제였다" 류 산문 | **링크를 제거하고 산문으로 재작성 (의무)** |
| **D. supersede 선언·인덱스 행** | "본 ADR은 ADR-NNN을 supersede한다" / 인덱스의 그 ADR 행 | **그대로 둔다** — 정의상 죽은 ADR을 가리켜야 한다 |
| **E. 실행 기록 (Record)** | dogfood 회차 기록 등 *그날 실제로 적용된 규칙*의 서술 | **그대로 둔다** + 문서 상단에 시점 주석 1회 |

- **D·E에는 그 줄 끝에 `(현재 SSOT: ADR-NNN)`을 병기한다.** 병기는 **절 단위가 아니라 줄 단위**다 — 검사가 줄 단위로 판정하기 때문이다. **supersede를 선언하는 ADR 자신의 본문에서는 `(현재 SSOT: 본 ADR)`로 쓴다**(자기 번호를 자기 안에 적는 것은 무의미하다).
- **`/stabilize-milestone`의 `[Ref-dead]` 검사는 `(현재 SSOT:` 문자열이 있는 줄을 건너뛴다.** 이 병기가 검사 제외 마커다.
- E의 시점 주석은 **문서 상단 1회**로 둔다(본문 중간의 리스트·표를 분절하지 않는다).
- **죽은 ADR 판정 자체의 기준**: 그 ADR `## Status` 본문이 `superseded`·`deprecated`로 **시작**할 때만 죽은 것이다. `accepted (부분 superseded — ...)`는 살아 있다.

### 강도 (ADR-022)
- **제약(강) — [관측됨]**: A·B·C의 재작성 의무.
- **enabling(약)**: D·E 병기 형식, 검사 제외 마커.

### Mutation delta (ADR-047 D3)
- failure = 죽은 ADR 인용이 매 마일스톤 P2로 재생산되어 open 스냅샷을 부풀림 / 실행 불가한 rollback 지시가 방치됨
- falsifier = 분류 후에도 `[Ref-dead]`가 0건이 되지 않거나, 병기 마커가 살아있는 규칙 인용까지 숨기면 재조정
- rollback = 본 amend superseded + `[Ref-dead]` 검사의 마커 예외 제거

### 적용 surface
- .claude/skills/stabilize-milestone/SKILL.md (`[Ref-dead]` 검사 제외 마커)
- docs/90-decisions/boilerplate/ (supersede된 ADR을 인용하는 전 파일)
```

### 1.4.2 ADR 인덱스의 amend 목록을 갱신한다

파일: `docs/90-decisions/boilerplate/README.md`

**앵커**: `+#amend-1: D6 재발행 임계 4→8`

**바꿀 내용**
```
+#amend-1: D6 재발행 임계 4→8, +#amend-2: supersede 후 인용 처리(D10)
```

---

## 1.5 ADR-005 — `## Amendment 1` (원장 5종의 배타적 기록 범위)

파일: `docs/90-decisions/boilerplate/ADR-005-ssot.md`

본 ADR은 amendment가 **0개**다. 새 번호는 **1**이다.

### 1.5.1 파일 맨 끝에 Amendment 1을 추가한다

```
<a id="adr-005-amend-1"></a>
## Amendment 1 (2026-08-11) — 원장 5종의 배타적 기록 범위

### 배경
- [관측됨] `DECISION_REGISTER` / `ROADMAP` / `QA_FINDINGS` / `IMPROVEMENT_GUIDE` / `DISCOVERY` 다섯 원장은 각자 등재 범위를 갖지만 **원장끼리의 경계**가 어디에도 없다. 그래서 같은 항목이 둘에 들어갈 수 있고, 실제로 «수용 라운드의 계약 변경»이 원장과 ROADMAP 어느 쪽에도 갈 수 있는 상태였다.
- 본 ADR 결정 1(«정의 1곳, 다른 곳은 링크»)은 *정본 문서*를 대상으로 하고 원장 간 배분은 다루지 않았다.

### 결정
1. **원장 5종의 기록 범위를 «답하는 질문»으로 배타 분할한다.** 표 본문의 SSOT는 `docs/00-meta/STRUCTURE.md`의 `## Canonical Owner 매핑`이며(본 ADR 본문이 이미 그 섹션을 canonical owner 매핑의 SSOT로 지정했다), 본 amend는 정책과 판별자만 박는다.
2. **ADR은 이 표의 대상이 아니다** — ADR은 **정본 문서 중 하나**이며(`DECISION_REGISTER`가 «위치와 처분 상태만» 가리키는 대상), 원장과 같은 층이 아니다. 원장 항목이 `closed`되며 `정본: ADR-NNN`을 가리킬 때 ADR이 작성된다(작성 주체·시점은 ADR-000#amend-2 트리거 표).
3. **판별자 3개** — 애매할 때 아래 순서로 판정한다.
   - **원장 vs ROADMAP Backlog**: «이 항목이 해소되면 무엇이 남는가» — *정본 문서의 한 절이 채워진다* → `DECISION_REGISTER` / *마일스톤 문서 하나가 생긴다* → `ROADMAP ## Backlog`. 보조 검증: 원장 항목은 닫힐 때 `정본:` 앵커가 필수이므로(원장 불변식 2), 앵커를 쓸 정본 문서가 떠오르지 않으면 원장 항목이 아니다.
   - **Backlog vs IMPROVEMENT_GUIDE**: «그것을 하면 마일스톤이 되는가, task 이하가 되는가» — 마일스톤 단위 → Backlog / task 이하(코드·문서 조각) → `IMPROVEMENT_GUIDE`.
   - **QA_FINDINGS vs IMPROVEMENT_GUIDE**: «이번 마일스톤이 그것을 약속했는가» — 예 → `QA_FINDINGS` / 아니오 → `IMPROVEMENT_GUIDE`(ADR-066 D2와 동일 기준).
4. **비중복 불변식 3개**
   - **N-1** 한 사실은 동시에 두 원장에 «열린 채로» 존재하지 않는다.
   - **N-2** 원장 간 이동은 «원본을 닫고 → 새 원장에 등재»로만 한다. 양쪽에 남기지 않는다.
   - **N-3** 이동한 항목의 원본에 목적지 앵커를 남긴다 — `status: resolved (재분류: <목적지> <ID 또는 candidate-key>)`. 목적지가 로드맵이면 `<목적지>`는 `ROADMAP ## Backlog`다(구간까지 적는다 — 로드맵은 구간별 의미가 다르다).
   - 선례: `/repair-acceptance`가 `Out-of-contract` 재분류 시 이미 같은 형태를 쓴다.
5. **차단력을 가진 원장은 둘뿐이다** — `DECISION_REGISTER`(`open` → `/seal-milestone` 봉인 차단)와 `QA_FINDINGS`(본 M `### P0` 미해소 → 졸업 item 5 차단). 나머지 셋은 회수 후 **사용자 결정**이며 자동 차단 로직을 두지 않는다.

### 강도 (ADR-022)
- **제약(강) — [관측됨]**: 결정 3의 판별자, 결정 4의 N-1~N-3.
- **enabling(약)**: 결정 1의 표 위치, 결정 5의 차단력 서술(현행 재확인).

### Mutation delta (ADR-047 D3)
- failure = 같은 항목이 두 원장에 열려 회수 시 중복 처리되거나, 차단이 필요 없는 항목이 원장에 쌓여 봉인 검사·R1 triage가 무거워짐
- falsifier = dogfood에서 한 finding이 두 원장에 동시에 `open`으로 관측되거나, 판별자가 같은 항목을 두 목적지로 보냄
- rollback = 본 amend superseded + STRUCTURE의 원장 범위 표 제거 + ROADMAP `## Backlog` 제거

### 적용 surface
- docs/00-meta/STRUCTURE.md (`## Canonical Owner 매핑` — 표 본문)
- docs/10-charter/DECISION_REGISTER.md (등재 범위 표에 제외 1행)
- docs/40-validation/IMPROVEMENT_GUIDE.md (`## 4` 용도 + 재분류 규칙)
- docs/30-workitems/ROADMAP.md (`## Backlog`)
- .claude/skills/accept-milestone/SKILL.md · repair-acceptance/SKILL.md (라우팅 목적지)
- .claude/skills/plan-milestone/SKILL.md (R0 Backlog 회수 · R1 재분류)
```

### 1.5.2 ADR 인덱스의 amend 칸을 채운다

파일: `docs/90-decisions/boilerplate/README.md`

**앵커**: `| 005 | Single Source of Truth (SSOT) | accepted | — |`

**바꿀 내용**
```
| 005 | Single Source of Truth (SSOT) | accepted | (+#amend-1: 원장 5종 배타적 기록 범위 + 비중복 불변식) |
```

---

## 1.6 ADR-057 — `## Amendment 4` (ROADMAP Backlog)

파일: `docs/90-decisions/boilerplate/ADR-057-planning-v2-batch-and-seam.md`

### 1.6.1 파일 맨 끝에 Amendment 4를 추가한다

```
<a id="adr-057-amend-4"></a>
## Amendment 4 (2026-08-11) — ROADMAP `## Backlog` 구간 + 구간별 writer 규약

### 배경
- [관측됨] `/accept-milestone` 수용 라운드의 «계약 변경»(방향 변경·새 기능)이 `DECISION_REGISTER`에 `status: open`으로 쌓인다. 그런데 그 항목은 **아무것도 막지 않는다** — 원장의 유일한 강제력인 봉인 차단이 불필요한 종류다. 차단이 필요 없는 항목이 원장에 누적되면 `/seal-milestone` 조건 6과 `/plan-milestone` R1 triage가 매 라운드 무거워진다(원장 자신의 «얇게 유지하는 규칙» 정합).
- [관측됨] 「다음에 무엇을 할까」가 원장·ROADMAP·IMPROVEMENT_GUIDE 세 곳에 흩어져 한 장에서 보이지 않는다.

### 결정
1. **`ROADMAP.md`에 `## Backlog` 구간을 신설한다** — 마일스톤 미배정 후보를 담는다. Done/Now/Next/Later와 같은 **얇음 규율**을 따르되 `출처` 한 칸을 더 갖는다.
   ```
   - `<candidate-key>` <목표 1줄> — 출처: <어디서 나왔나> / 확신도: <높음/중간/낮음>
   ```
2. **writer 규약은 구간별로 갈린다.** `Done`/`Now`/`Next`/`Later`는 **`/plan-milestone` 단독**(#amend-1 결정 2 불변 — candidate-key 기반 중복 생성·Now 승격 매칭이 그 규약에 의존한다). **`## Backlog`만 append-only 다중 writer**를 허용한다 — `/accept-milestone`(R5 계약 변경)·`/repair-acceptance`(`Out-of-contract`). 이들은 **행을 추가만 하고 다른 구간을 건드리지 않는다.**
   - 근거: 앞 네 구간은 *계획 산출물*이라 단독 writer가 필수이고, Backlog는 *입력 수집함*이라 여럿이 넣어도 중복 마일스톤 생성 위험이 없다.
3. **회수·정리는 `/plan-milestone`이 한다** — R0가 `## Backlog`를 회수해 R1의 재료로 합류시키고, 사용자가 착수를 결정하면 **Next로 승격하며 Backlog 행을 제거한다**(candidate-key로 매칭 — #amend-1 결정 2의 R0 전이 알고리즘 그대로). **다른 원장에서 재분류해 넘어오는 항목을 `## Backlog`에 등재하는 것도 이 skill이 한다**(R1 — 원본을 닫는 일과 등재를 한 트랜잭션으로 묶어야 [ADR-005](ADR-005-ssot.md)#amend-1의 N-2가 지켜진다). 즉 `## Backlog`의 writer는 결정 2의 두 append-only skill + 본 skill 셋이다.
4. **`deferred` 이관 앵커와의 관계**: `DECISION_REGISTER`의 `deferred` 항목은 여전히 ROADMAP candidate-key를 앵커로 쓴다(원장 «이관 앵커 종류» 표 불변). 차이는 «원장에 항목이 남는가»다 — `deferred`는 한때 `open`이었던 승인 이력이라 원장에 남고 ROADMAP에는 앵커만, `## Backlog`는 애초에 미결정이었던 적이 없어 원장에 들어가지 않는다.
5. **원장 5종의 배타적 기록 범위**는 [ADR-005](ADR-005-ssot.md)#amend-1이 소유하고 표 본문은 `docs/00-meta/STRUCTURE.md`의 `## Canonical Owner 매핑`이 갖는다. 본 amend는 ROADMAP 쪽 구조만 정한다.

### 강도 (ADR-022)
- **enabling(약)** — 구간 1개 신설 + append-only 예외. 얇음 규율은 그대로 적용된다.

### Mutation delta (ADR-047 D3)
- failure = 차단 불요 항목이 원장에 누적돼 봉인 검사·triage가 무거워짐 / 「다음에 할 것」이 세 곳에 흩어짐
- falsifier = Backlog에 마일스톤 단위가 아닌 항목(코드 조각)이 쌓이거나, append-only 예외가 Done/Now/Next/Later 오염으로 번지면 결정 2를 재조정
- rollback = `## Backlog` 구간 제거 + accept-milestone·repair-acceptance 라우팅을 원장으로 복귀

### 적용 surface
- docs/30-workitems/ROADMAP.md
- .claude/skills/plan-milestone/SKILL.md (R0 회수 · R1 재료 · Next 승격 시 제거)
- .claude/skills/accept-milestone/SKILL.md (R5 계약 변경 목적지)
- .claude/skills/repair-acceptance/SKILL.md (`Out-of-contract` 목적지)
- docs/10-charter/DECISION_REGISTER.md (등재 범위 제외 1행)
- docs/00-meta/STRUCTURE.md (산출물 표 writer 갱신)
```

### 1.6.2 `## 현재 유효 결정`에 한 줄을 추가한다

**앵커**: `- 상태·잠금(#amend-3): M/F=`draft→ready`; task=`draft→ready→in-progress→done`, 검증된 완료 결함만 repair-workitem이 `done→in-progress`.`

그 줄 **바로 뒤에** 아래 한 줄을 추가한다.
```
- 로드맵(#amend-1, #amend-4): `Done/Now/Next/Later`는 `/plan-milestone` 단독 writer, **`## Backlog`만 append-only 다중 writer**(accept-milestone·repair-acceptance). 회수는 R0 → R1.
```

### 1.6.3 `## 현재 유효 결정`의 amend 나열을 4로 늘린다

파일: `docs/90-decisions/boilerplate/ADR-057-planning-v2-batch-and-seam.md`

**앵커**: `- 상세는 아래 `## 결정 — A/B` + Amendment 1·2·3.`

**바꿀 내용**
```
- 상세는 아래 `## 결정 — A/B` + Amendment 1·2·3·4.
```

### 1.6.4 ADR 인덱스의 amend 목록을 갱신한다

파일: `docs/90-decisions/boilerplate/README.md`

**앵커**: `+#amend-3: plan-workitem 전체 계획 스냅샷 — 2-tier/draft/refresh 전면 폐기)`

**바꿀 내용**
```
+#amend-3: plan-workitem 전체 계획 스냅샷 — 2-tier/draft/refresh 전면 폐기, +#amend-4: ROADMAP `## Backlog` 구간 + 구간별 writer 규약)
```

---

## 1.7 ADR-007 — 단계 추가 note와 단계 표를 정정한다

파일: `docs/90-decisions/boilerplate/ADR-007-workitem-lifecycle.md`

### 1.7.1 단계 추가 note에서 task 스코프를 제거한다

**앵커**: `> **단계 추가 (2026-08-09)** — `/accept-milestone`(사용자 수용 — 권장, 비차단)`

**현재**
```
> **단계 추가 (2026-08-09)** — `/accept-milestone`(사용자 수용 — 권장, 비차단)과 `/repair-acceptance`(수용 finding 수리 — 기존 task 재개방 X)를 lifecycle에 추가한다. 위치는 `/stabilize-milestone` 뒤이며, `사용자 관측`·`플랫폼 관측` modality AC의 receipt 발급을 위한 **task 스코프 모드**(`--task <task-id>`)는 `/validate-workitem` 뒤·`/finalize-workitem` 앞에서 실행된다. 상세는 [ADR-066](ADR-066-milestone-acceptance.md), 증거 계약은 [ADR-065](ADR-065-ac-verification-contract.md).
```

**바꿀 내용**
```
> **단계 추가 (2026-08-09)** — `/accept-milestone`(사용자 수용)과 `/repair-acceptance`(수용 finding 수리)를 lifecycle에 추가한다. 위치는 **둘 다 `/stabilize-milestone` 뒤**이며 스코프는 마일스톤 단위 하나다. `사용자 관측`·`플랫폼 관측` modality AC는 `/finalize-workitem`을 막지 않으며(그때 판정값은 `Pending Acceptance` — [ADR-065](ADR-065-ac-verification-contract.md) D6) 그 receipt는 수용 라운드에서 발급된다. **`/repair-acceptance`는 결함이 기존 계약으로 추적 가능하면(`in-AC`) 그 task를 재개방해 `/repair-workitem` → `/validate-workitem` → `/finalize-workitem`으로 마감하고, 추적 불가하면(`out-of-AC`) 재개방 없이 직접 고치고 계약 부채로 등재한다**(ADR-066 D4). 상세는 [ADR-066](ADR-066-milestone-acceptance.md), 졸업 판정값은 [ADR-067](ADR-067-milestone-graduation-v2.md) D3.
```

### 1.7.2 단계 표 7행의 finalize 조건을 3값에 맞춘다

**앵커**: `| 7 | finalize (Pass일 때) | `/finalize-workitem` | builder |`

**현재 (줄 전체 — 표의 한 행)**
```
| 7 | finalize (Pass일 때) | `/finalize-workitem` | builder | status `done` 갱신 + 명시적 파일 add + Conventional Commits 커밋 |
```
**바꿀 내용**
```
| 7 | finalize (`Pass` 또는 `Pending Acceptance`일 때 — ADR-065 D6) | `/finalize-workitem` | builder | status `done` 갱신 + 명시적 파일 add + Conventional Commits 커밋. `Pending Acceptance`면 관측 AC를 통과시키고 task `## 8`에 `- ac-pending`을 남긴다 |
```

---

## 1.8 ADR-009 — finalize의 AC 게이트 문장을 3값에 맞춘다

파일: `docs/90-decisions/boilerplate/ADR-009-tdd-default.md`

이 한 줄이 «미충족 AC가 있으면 무조건 `Needs Fix`»를 단언한다. 고치지 않으면 TDD 정책 ADR이 새 finalize 계약과 정면으로 어긋난다.

**앵커**: `- `/finalize-workitem`은 통합 `validate` 명령 통과 외에 AC 미충족 항목이 있으면 `Needs Fix`로 종료.`

**현재**
```
- `/finalize-workitem`은 통합 `validate` 명령 통과 외에 AC 미충족 항목이 있으면 `Needs Fix`로 종료.
```
**바꿀 내용**
```
- `/finalize-workitem`은 통합 `validate` 명령 통과 외에 **«기계 검증» AC 미충족 항목**(`[자동 테스트]`·`[산출물 검사]`·표기 부재)이 있으면 `Needs Fix`로 종료. **`[사용자 관측]`·`[플랫폼 관측]` AC의 receipt 미발급만 남은 경우는 막지 않는다** — 그때 report 판정은 `Pending Acceptance`이고([ADR-065](ADR-065-ac-verification-contract.md) D6) finalize가 통과시키며, 차단은 마일스톤 졸업(`PENDING_ACCEPTANCE` — [ADR-067](ADR-067-milestone-graduation-v2.md) D1 item 4 (a'))이 담당한다. **TDD opt-out은 여전히 AC 충족의 면제가 아니다**(ADR-065 D2).
```

---

**Phase 1 커밋**

```
docs(adr): add validate verdict enum, milestone-owned acceptance, roadmap backlog and ledger scope policy
```

---

# Phase 2 — 템플릿·원장 층

---

## 2.1 MILESTONE_TEMPLATE

파일: `docs/30-workitems/_templates/MILESTONE_TEMPLATE.md`

### 2.1.1 `## 5`의 item 4를 항목명 정렬 + 링크 위임으로 바꾼다

**앵커**: `- [ ] AC 충족 100% (validation report `## AC ↔ 검증 매핑` 기준 — 전 modality 합산).`

**현재**
```
- [ ] AC 충족 100% (validation report `## AC ↔ 검증 매핑` 기준 — 전 modality 합산). 충족 판정은 ADR-065 D1 modality를 따르며 `미관측`은 미충족이고, `## 6-2. TDD opt-out`은 본 항목의 예외가 아니다(ADR-065 D2). report 부재 task는 미충족
```

**바꿀 내용**
```
- [ ] AC 충족 100% + report 유효 — 판정 조건 (a)(a')(b)(c)(d)의 **정책 SSOT는 ADR-067 D1 item 4**이고 그 실행 절차는 `/stabilize-milestone` §1.5다(여기에 재서술하지 않는다 — 정책 중복 금지). 요지: 기계 검증 AC는 validation report에서, `[사용자 관측]`·`[플랫폼 관측]` AC(ADR-065 D1)는 task `## 8`의 `- ac-acceptance`에서 직접 판독. report 부재 task는 미충족
```

**이유**: 4조건 전문을 마일스톤 문서에 복사하면 ADR-067을 고칠 때마다 모든 마일스톤 문서가 어긋난다. 항목명만 맞추면 `/validate-plan`의 `[MP-graduation]` 정합 검사가 통과한다.

**주의**: 교체문에 **`ADR-065`가 반드시 남아야 한다.** 1.1.9가 이 파일을 ADR-065 Surfaces에 등재하므로, 인용이 사라지면 `/stabilize-milestone` §1.0이 매 마일스톤 `P1 [Surface-backref]`를 발화한다.

### 2.1.2 `## 8`의 graduation 주석에 판정값 4종을 반영한다

**앵커**: `- graduation: <YES | NO | BLOCKED> (<날짜>)`

**현재 (그 줄 전체 — 뒤의 HTML 주석 포함)**
```
- graduation: <YES | NO | BLOCKED> (<날짜>)  <!-- stabilize 단계 8 최종 판정(단계 4~6 qa 팬아웃 P0(QA_FINDINGS)만 반영, reviewer report-only 미반영) 영속 — §1.5 사전점검 아님. ROADMAP.md 파생 입력 (ADR-067 D3·ADR-057#amend-1). BLOCKED = 평가 실행 불가 2종: `BLOCKED (e2e blocked-on-env: <target>)` / `BLOCKED (audit incomplete: <축>)`. BLOCKED는 기존 YES를 덮어쓴다. 주: 이 판정은 stabilize 시점 report(checkout-local ephemeral) 기준이며, ROADMAP Done은 이 *영속된 판정*의 파생이지 fresh clone에서 재도출된 증거가 아니다 — **새 체크아웃에서 재검증할 때는 각 task의 `/validate-workitem`을 먼저 재실행해 report를 만든 뒤 stabilize를 돌린다**(report가 없으면 item 4가 전 task 미충족으로 나온다). -->
```

**바꿀 내용**
```
- graduation: <YES | PENDING_ACCEPTANCE | NO | BLOCKED> (<날짜>)  <!-- stabilize 단계 8 최종 판정(단계 4~6 qa 팬아웃 P0(QA_FINDINGS)만 반영, reviewer report-only 미반영) 영속 — §1.5 사전점검 아님. ROADMAP.md 파생 입력이며 **Done 전환은 YES일 때만**이다 (ADR-067 D3·ADR-057#amend-1).
     PENDING_ACCEPTANCE = 관측 AC receipt만 남고 나머지 전부 충족: `PENDING_ACCEPTANCE (관측 AC 미발급: T-004:AC-2, ...)` → 처방은 `/accept-milestone <M>`.
     BLOCKED = 평가 실행 불가 2종: `BLOCKED (e2e blocked-on-env: <target>)` / `BLOCKED (audit incomplete: <축>)`.
     우선순위: BLOCKED > NO > PENDING_ACCEPTANCE > YES. 매 stabilize 실행이 이 줄을 최신 판정으로 덮어쓴다(낡은 YES 잔존 방지).
     주: 기계 검증 AC의 판정은 stabilize 시점 report(checkout-local ephemeral) 기준이다 — **새 체크아웃에서 재검증할 때는 각 task의 `/validate-workitem`을 먼저 재실행해 report를 만든 뒤 stabilize를 돌린다**(report가 없으면 item 4 (a)가 전 task 미충족으로 나온다). 관측 AC는 커밋된 task `## 8`에서 직접 읽으므로 체크아웃과 무관하다. -->
```

### 2.1.3 `## 11` 주석의 무조건 «권장» 문장을 조건부로 바꾼다

**앵커**: `<!-- 수용 라운드를 실행했을 때만 기록된다. 본 단계는 권장이며 졸업 필수 조건이 아니다(ADR-067 D6)`

**현재**
```
<!-- 수용 라운드를 실행했을 때만 기록된다. 본 단계는 권장이며 졸업 필수 조건이 아니다(ADR-067 D6) — 미실행이면 본 섹션은 빈 채로 남는다. 형식(ADR-066 D1/D3):
```
**바꿀 내용**
```
<!-- 수용 라운드를 실행했을 때만 기록된다. **관측 modality AC(`[사용자 관측]`·`[플랫폼 관측]`)가 0건인 마일스톤에서만 권장(선택)이고, 1건이라도 있으면 그 receipt 없이 졸업 item 4 (a')를 충족하지 못하므로 사실상 필수 경로다**(ADR-067 D6 — 그 상태의 graduation은 `PENDING_ACCEPTANCE`) — 미실행이면 본 섹션은 빈 채로 남는다. 형식(ADR-066 D1/D3):
```

### 2.1.4 `## 11`의 라운드 판독 주석에 «주석 밖» 규칙을 넣는다

**앵커**: `- 라운드: <N>   ← 영속 카운터.`

**현재**
```
- 라운드: <N>   ← 영속 카운터. 다음 라운드는 이 값 +1이며 상한은 3이다(세션 파일 수로 세지 않는다 — 라운드가 끝나면 그 파일이 삭제된다). 판정이 `미완`이면 올리지 않는다
```
**바꿀 내용**
```
- 라운드: <N>   ← 영속 카운터. 다음 라운드는 이 값 +1이며 상한은 3이다(세션 파일 수로 세지 않는다 — 라운드가 끝나면 그 파일이 삭제된다). 판정이 `미완`이면 올리지 않는다. **판독 시 HTML 주석 밖의 줄만 센다** — 본 템플릿의 이 예시 줄은 주석 안이므로 항목이 아니다
```

### 2.1.4-b `## 11`의 피드백 라우팅 스키마에서 계약 변경 목적지를 바꾼다

**이 줄을 빼면 템플릿이 새 라우팅과 정면 모순한다** — 1.2.3·4.1.10이 «계약 변경»의 목적지를 `DECISION_REGISTER` → `ROADMAP ## Backlog`로 바꾸는데, 그 결과를 적는 자리가 여전히 옛 목적지를 요구한다.

**앵커**: `- 피드백 라우팅: <결함 N건 → QA_FINDINGS / 계약 변경 M건 → DECISION_REGISTER(다음 M) / 개선 K건 → IMPROVEMENT_GUIDE>`

**바꿀 내용**
```
- 피드백 라우팅: <결함 N건 → QA_FINDINGS / 계약 변경 M건 → ROADMAP `## Backlog`(다음 M 후보) / 개선 K건 → IMPROVEMENT_GUIDE>   ← 정본 문서의 한 절을 고쳐야 성립하는 항목만 예외적으로 DECISION_REGISTER (ADR-005#amend-1 배타 범위)
```

### 2.1.4-c `## 11` 헤딩에서 스코프 수식을 뗀다

**앵커**: `## 11. 수용 기록 (acceptance receipt — /accept-milestone 마일스톤 스코프가 채움)`

**바꿀 내용**
```
## 11. 수용 기록 (acceptance receipt — /accept-milestone이 채움)
```

**이유**: 스코프가 하나만 남으므로(1.2.1) «마일스톤 스코프»라는 수식이 «다른 스코프도 있다»는 오독을 만든다.

### 2.1.5 `## 11` 말미의 task 스코프 문장을 삭제한다

**앵커**: `**판정 기준은 섹션의 *존재*가 아니라 `- 수용일:` 줄의 *채움*이다** — `## 10`과 동형. task 스코프(`--task`) 실행은 본 섹션을 쓰지 않는다.`

**현재**
```
**판정 기준은 섹션의 *존재*가 아니라 `- 수용일:` 줄의 *채움*이다** — `## 10`과 동형. task 스코프(`--task`) 실행은 본 섹션을 쓰지 않는다. -->
```
**바꿀 내용**
```
**판정 기준은 섹션의 *존재*가 아니라 `- 수용일:` 줄의 *채움*이다** — `## 10`과 동형. -->
```

---

## 2.2 TASK_TEMPLATE

파일: `docs/30-workitems/_templates/TASK_TEMPLATE.md`

> **`## 0. Status` 주석의 «유일한 역전이: `done → in-progress`» 문장은 그대로 둔다.** 재개방은 유지되는 경로다.

### 2.2.1 `## 8` 주석에 `- ac-pending` 줄 형식을 추가한다

**앵커**: ``- ac-acceptance <날짜> <AC-N>: modality=<사용자 관측|플랫폼 관측> / authority=사용자``

그 줄 **바로 뒤에** 아래 한 줄을 삽입한다(들여쓰기는 앞 줄과 동일하게 7칸).

```
       `- ac-pending <날짜> <AC-N>: modality=<사용자 관측|플랫폼 관측> — 마일스톤 수용 라운드에서 확인 예정`  (ADR-065 D3 — writer: implement-workitem·finalize-workitem. **증거가 아니라 «아직 증거가 없다»는 표시**이며 어떤 게이트도 통과시키지 않는다. 같은 AC에 이미 있으면 중복 append 금지 — **중복 판정은 이 주석 밖의 줄만 센다**(바로 이 예시 줄을 세면 실제 줄이 영원히 append되지 않는다 — ADR-064 D4 판독 규칙). `- ac-acceptance` 발급 시 마지막 이벤트가 바뀌어 자동 무효)
```

### 2.2.2 `## 6-1` 주석에 관측 modality의 마감 규칙을 넣는다

**앵커**: `     - `[미관측]` — **계획 단계에서 쓰지 않는다**`

이 줄 **바로 앞에** 아래 한 줄을 삽입한다.

```
     - **관측 modality 두 종은 `/finalize-workitem`을 막지 않는다** — 그 AC만 미충족이면 `/validate-workitem` 판정은 `Pending Acceptance`이고(ADR-065 D6) finalize가 통과시켜 task를 `done`으로 마감하며 `## 8`에 `- ac-pending`을 남긴다. receipt는 `/accept-milestone <M>`(마일스톤 수용 라운드) 또는 사용자 직접 기재로 발급되고, 미발급 상태는 **마일스톤 졸업**에서 잡힌다(ADR-067 D1 item 4 (a') — graduation `PENDING_ACCEPTANCE`).
```

### 2.2.3 `## 8`의 `- pattern-scan` writer 목록을 갱신하고 소유 ADR을 단다

**앵커**: `       `- pattern-scan <날짜> <패턴 1줄>: 범위 내 N건 수정 / 범위 밖 M건 <경로 목록>``

**현재**
```
       `- pattern-scan <날짜> <패턴 1줄>: 범위 내 N건 수정 / 범위 밖 M건 <경로 목록>`  (동일 결함 패턴의 다른 출현 전수 검색 결과 — writer: repair-workitem·repair-acceptance. 범위 밖 항목은 stabilize·repair-milestone이 회수) -->
```
**바꿀 내용**
```
       `- pattern-scan <날짜> <패턴 1줄>: 범위 내 N건 수정 / 범위 밖 M건 <경로 목록>`  (동일 결함 패턴의 다른 출현 전수 검색 결과 — ADR-066 D6. writer: repair-workitem·repair-acceptance·repair-milestone. 범위 밖 항목은 stabilize·repair-milestone이 회수) -->
```

**주의**: 교체문에 **`ADR-066`이 반드시 남아야 한다.** 1.2.9가 이 파일을 ADR-066 Surfaces에 등재하므로, 인용이 없으면 `P1 [Surface-backref]`가 발화한다.

### 2.2.4 `## 8`의 `- exec-evidence` writer 목록을 갱신한다

**앵커**: `     증거 receipt 위치이기도 하다 (ADR-064 D4 — writer: implement foreman 및 repair-workitem(외부 경계 코드를 고친 경우).`

**현재 (그 부분)**
```
writer: implement foreman 및 repair-workitem(외부 경계 코드를 고친 경우).
```
**바꿀 내용**
```
writer: implement foreman · repair-workitem · repair-milestone · repair-acceptance(외부 경계 코드를 고친 경우).
```

---

## 2.3 ROADMAP — `## Backlog` 구간 신설

파일: `docs/30-workitems/ROADMAP.md`

### 2.3.1 상단 writer 규약을 구간별로 바꾼다

**앵커**: `> 요약 지도 — 각 마일스톤 상세는 링크된 Mx 문서가 SSOT. 이 파일은 `/plan-milestone`만 갱신한다(R3 생성/갱신, R0 재조정).`

**현재**
```
> 요약 지도 — 각 마일스톤 상세는 링크된 Mx 문서가 SSOT. 이 파일은 `/plan-milestone`만 갱신한다(R3 생성/갱신, R0 재조정). 상태는 `stabilize-milestone`이 마일스톤 회고에 남긴 graduation 판정에서 파생 (ADR-057#amend-1).
```
**바꿀 내용**
```
> 요약 지도 — 각 마일스톤 상세는 링크된 Mx 문서가 SSOT. **`Done`/`Now`/`Next`/`Later`는 `/plan-milestone`만 갱신한다**(R3 생성/갱신, R0 재조정). **`## Backlog`만 append-only 다중 writer**다 — `/accept-milestone`(수용 라운드 계약 변경)·`/repair-acceptance`(`Out-of-contract`)가 행을 **추가만** 하고 다른 구간은 건드리지 않으며, 정리·승격은 `/plan-milestone`이 한다 (ADR-057#amend-1·#amend-4). 상태는 `stabilize-milestone`이 마일스톤 회고에 남긴 graduation 판정에서 파생하며 **Done 전환은 `YES`일 때만**이다.
```

### 2.3.2 `## Backlog` 구간을 추가한다

**앵커**: `## Later`

`## Later` 블록(헤딩 + 그 아래 HTML 주석 한 줄)이 파일의 마지막이다. 그 **뒤에** 아래 블록을 추가한다.

```

## Backlog
<!-- 마일스톤 미배정 후보 (ADR-057#amend-4). Next/Later와 같은 얇음 규율 + `출처` 한 칸.
     형식: - `<candidate-key>` <목표 1줄> — 출처: <어디서 나왔나> / 확신도: <높음/중간/낮음>
     예:   - `offline-merge` 오프라인 편집 병합 — 출처: 수용 라운드 M1 r2 / 확신도: 중간
     writer: /plan-milestone(정리·승격 + 다른 원장에서 재분류해 온 항목 등재) + /accept-milestone·/repair-acceptance(append only)
     회수: 다음 /plan-milestone R0가 읽어 R1 재료로 합류. Next로 승격되면 이 구간에서 제거(candidate-key로 매칭).
     여기에 담는 것: «할 것은 정해졌고 언제만 남은» 마일스톤 단위 후보.
       — 수용 라운드의 «계약 변경» 피드백이 이 구간으로 온다 (ADR-066 D2 3갈래 라우팅의 목적지).
     여기에 담지 않는 것: 아직 정해야 할 결정(→ DECISION_REGISTER) / task 이하의 개선·부채(→ IMPROVEMENT_GUIDE).
     판별 기준 SSOT: docs/00-meta/STRUCTURE.md `## Canonical Owner 매핑` (ADR-005#amend-1). -->
```

**⚠ `ADR-066` 토큰이 반드시 남아야 한다.** 1.2.9가 이 파일을 ADR-066 `## Surfaces`에 등재하는데 이 파일에는 `ADR-066` 인용이 **한 건도 없다.** 위 주석의 `(ADR-066 D2 3갈래 라우팅의 목적지)` 한 줄이 그 역참조다 — 빼면 매 마일스톤 `P1 [Surface-backref] ADR-066 → docs/30-workitems/ROADMAP.md`가 발화한다(ADR-045 D3·D4).

---

## 2.4 IMPROVEMENT_GUIDE

파일: `docs/40-validation/IMPROVEMENT_GUIDE.md`

### 2.4.1 `## 항목 스키마`에 `(수용)` 태그를 정의한다

**앵커**: `- evidence label은 [boilerplate/ADR-022](../90-decisions/boilerplate/ADR-022-ratchet-principle.md)의 `[관측됨]` / `[외부실증]` / `[가설]` (+ 합성 표기) 중 1개.`

그 줄 **바로 뒤에** 아래 한 줄을 추가한다.

```
- **선택 태그 `(수용)`**: `/accept-milestone`이 사용자 수용 라운드에서 등재한 항목에 붙인다. **위치는 굵은 ID 바로 뒤·첫 `|` 앞으로 고정한다** — `- **M1-003** (수용) | P2 | ...`. 이 태그가 `/repair-acceptance`의 유일한 회수 신호이며 문자열 `(수용)` 정확 일치로 grep된다(ADR-066 D5). `/repair-milestone`은 이 태그가 붙은 항목을 4-판정하지 않는다.
```

### 2.4.2 `## 4. 보류 항목`의 용도를 정의한다

**앵커**: `## 4. 보류 항목`

이 헤딩 **바로 뒤에** 아래 블록을 추가한다.

> **⚠ 형식 예시를 HTML 주석 *안*에 둔다 — 코드펜스로 빼지 않는다.** 5.5.2가 이 섹션에서 `scope: out-of-AC` + `status: open`을 술어로 전수 회수하므로, 예시가 주석 밖에 있으면 **매 `/plan-milestone` 라운드마다 `<M>-uat-<N>` 유령 항목이 «AC로 승격할까요?» 질문으로 올라온다.** 같은 버그 클래스가 이미 ADR-064 D4에 박혀 있다(TASK_TEMPLATE 주석의 형식 예시를 세면 상시 오탐).

~~~
<!-- 담는 것 2종:
     ① 지금 고치지 않기로 한 개선 항목 — 다음 /plan-milestone R0가 회수해 사용자에게 surface.
     ② **계약 미반영 (`scope: out-of-AC`)** — `/repair-acceptance`가 이번 마일스톤에서 고쳐 **코드에는 들어갔으나**
        어느 AC·FAC·프로토타입·DESIGN 계약에도 근거가 없는 변경. `affected: T-NNN`이 유일한 역참조다.
        다음 /plan-milestone R0가 회수해 **AC 승격 여부를 사용자에게 묻는다.**
     담지 않는 것: 마일스톤 단위 기능 후보(→ ROADMAP `## Backlog`) / 아직 정해야 할 결정(→ DECISION_REGISTER).
     판별 기준 SSOT: docs/00-meta/STRUCTURE.md `## Canonical Owner 매핑` (ADR-005#amend-1).
     항목이 마일스톤급이라고 판명되면 /plan-milestone R1이 ROADMAP `## Backlog`로 재분류하고
     여기 원본은 `status: resolved (재분류: ROADMAP ## Backlog <candidate-key>)`로 닫는다(비중복 불변식 N-2·N-3).

     형식 (② 계약 미반영) — 아래는 *형식 예시*이며 항목이 아니다.
     판독자(/plan-milestone R0)는 **HTML 주석 밖의 줄만** 항목으로 센다:
     - **<M>-uat-<N>** | P2 | [관측됨] | linked: <M> | affected: T-NNN | scope: out-of-AC | status: open
       - 계약 미반영: <무엇이 코드에 들어갔는지 1줄 — 파일·규모 포함>.
       - 근거 부재: <task>의 어느 AC도 이 동작을 약속하지 않았다.
       - 회수: 다음 /plan-milestone R0 — AC로 승격할지 사용자 결정. -->
~~~

### 2.4.3 `## 5`의 task scope 문장에 마일스톤 층 결정을 추가한다

**앵커**: `- task scope (T-NNN) 결정은 해당 task `## 8. 메모`에 직접 append — 본 섹션 아님.`

**현재** (⚠ 어순 주의 — `routing 한 줄만`이다. `/repair-milestone` SKILL.md의 비슷한 줄은 `한 줄 routing 기록만`이라 **다른 문장**이다)
```
- task scope (T-NNN) 결정은 해당 task `## 8. 메모`에 직접 append — 본 섹션 아님. `/repair-milestone`이 per-task 결함을 `/repair-workitem`으로 위임한 경우 그 task 결정 이력도 task `## 8`에 남고, 본 섹션에는 cross-cutting 결정 + "T-NNN으로 위임함" routing 한 줄만 둔다.
```
**바꿀 내용**
```
- task scope (T-NNN) 결정은 해당 task `## 8. 메모`에 직접 append — 본 섹션 아님. `/repair-milestone`·`/repair-acceptance`가 per-task 결함(`scope: in-AC`)을 `/repair-workitem`으로 위임한 경우 그 task 결정 이력도 task `## 8`에 남고, 본 섹션에는 cross-cutting 결정 + "T-NNN으로 위임함" routing 한 줄만 둔다.
- **재개방 없이 고친 것(`scope: out-of-AC`)은 본 섹션에 적고 `affected: T-NNN`으로 역참조한다** — task 문서를 건드리지 않으므로 이 역참조가 유일한 추적 경로다(ADR-066 D4). 그 항목의 «계약 미반영» 사실은 별도로 `## 4. 보류 항목`에 `status: open`으로 등재한다(수리는 끝났지만 계약 반영은 열려 있다 — 서로 다른 사실이므로 항목도 둘이다).
```

### 2.4.4 ID 컨벤션에 `-uat-`와 `affected`를 추가한다

**앵커**: `- ID 컨벤션: `<workitem-id>-repair-<N>` (예: `F-001-repair-1`, `M1-repair-2`).`

**현재**
```
- ID 컨벤션: `<workitem-id>-repair-<N>` (예: `F-001-repair-1`, `M1-repair-2`).
```
**바꿀 내용**
```
- ID 컨벤션: `<workitem-id>-repair-<N>`(`/repair-plan`·`/repair-milestone` — 예: `F-001-repair-1`, `M1-repair-2`) / `<milestone-id>-uat-<N>`(`/repair-acceptance` — 예: `M1-uat-1`).
- **`affected: T-NNN` 필드**: `scope: out-of-AC` 항목에서 **필수**다(재개방하지 않아 task 문서에 흔적이 없으므로). `in-AC`는 task `## 8`에 이력이 남으므로 권장 수준이다. 여러 task에 걸치면 쉼표로 나열하고, 어느 task에도 귀속되지 않는 순수 cross-cutting은 `affected: —`.
```

---

## 2.5 QA_FINDINGS

파일: `docs/40-validation/QA_FINDINGS.md`

**앵커**: `- evidence label은 [boilerplate/ADR-022](../90-decisions/boilerplate/ADR-022-ratchet-principle.md)의 `[관측됨]` / `[외부실증]` / `[가설]` (+ 합성 표기) 중 1개.`

그 줄 **바로 뒤에** 아래 한 줄을 추가한다(2.4.1과 동일 문장).

```
- **선택 태그 `(수용)`**: `/accept-milestone`이 사용자 수용 라운드에서 등재한 항목에 붙인다. **위치는 굵은 ID 바로 뒤·첫 `|` 앞으로 고정한다** — `- **M1-003** (수용) | P0 | ...`. 이 태그가 `/repair-acceptance`의 유일한 회수 신호이며 문자열 `(수용)` 정확 일치로 grep된다(ADR-066 D5). `/repair-milestone`은 이 태그가 붙은 항목을 4-판정하지 않는다.
```

---

## 2.6 DECISION_REGISTER — 등재 범위에서 마일스톤 후보를 뺀다

파일: `docs/10-charter/DECISION_REGISTER.md`

### 2.6.1 등재 범위 표에 제외 행을 추가한다

**앵커**: `| 일괄 확인에서 사용자가 뒤집은 `agent-delegated` (→ `user-approval`로 등재) | 계획 결함(unmapped FAC/PX·의존성 결함·AC 해석 후보) — 각 소유 문서와 skill 출력이 소유 |`

그 표 행 **바로 뒤에** 아래 행을 추가한다.

```
| — | **마일스톤 미배정 기능 후보**(방향 변경·새 기능 — 수용 라운드의 «계약 변경» 포함) — `docs/30-workitems/ROADMAP.md` `## Backlog`가 소유 |
```

### 2.6.2 판별자 1줄을 추가한다

**앵커**: `원장은 **기획 결정**의 인덱스다. 결함 추적기가 아니다.`

**현재**
```
원장은 **기획 결정**의 인덱스다. 결함 추적기가 아니다.
```
**바꿀 내용**
```
원장은 **기획 결정**의 인덱스다. 결함 추적기가 아니고 **기능 백로그도 아니다.**

**판별자**: 「이 항목이 해소되면 무엇이 남는가」 — *정본 문서(charter/ARCH/DESIGN/ADR/feature)의 한 절이 채워진다* → 본 원장 / *마일스톤 문서 하나가 생긴다* → `ROADMAP ## Backlog`. 보조 검증으로 **닫힐 때 쓸 `정본:` 앵커가 떠오르지 않으면 본 원장 항목이 아니다**(불변식 2). 원장 5종의 배타적 기록 범위 SSOT는 `docs/00-meta/STRUCTURE.md`의 `## Canonical Owner 매핑`이다(ADR-005#amend-1).
```

---

**Phase 2 커밋**

```
docs(templates): add roadmap backlog, ac-pending line, acceptance tag schema and ledger scope discriminators
```

---

# Phase 3 — task 층 스킬

---

## 3.1 `/validate-workitem`

파일: `.claude/skills/validate-workitem/SKILL.md`

### 3.1.1 ⭐ 집계 규칙을 판정값 3종으로 바꾼다 (가장 중요)

**이 단계를 빠뜨리면 이번 개선 전체가 무효가 된다.** 현재 규칙은 «미충족 AC가 하나라도 있으면 `Needs Fix`»인데, 그러면 관측 AC가 있는 task의 채점표는 항상 `Needs Fix`가 되고, 졸업 item 4 (b)가 영원히 실패한다. receipt를 발급해도 채점표는 그 시점 기록이므로 그 마일스톤은 **영구히 `NO`** 가 된다.

**앵커**: `- **Needs Fix 트리거**: 어느 한 축이라도 P0 finding이 있거나, AC↔검증 매핑에 미충족 AC가 하나라도 있거나(`미관측` 포함), 통합 검증 명령이 exit≠0이면`

**현재**
```
- **Needs Fix 트리거**: 어느 한 축이라도 P0 finding이 있거나, AC↔검증 매핑에 미충족 AC가 하나라도 있거나(`미관측` 포함), 통합 검증 명령이 exit≠0이면 → **Needs Fix**(통합 명령 부재 스택은 해당 없음). 그 외 P1/P2만 있으면 Pass(라벨은 report에 전수 기록).
```

**바꿀 내용**
```
- **판정값 3종 (ADR-065 D6) — 우선순위 `Needs Fix` > `Pending Acceptance` > `Pass`, 먼저 성립하는 값으로 확정한다.**
  - **`Needs Fix`**: 어느 한 축이라도 P0 finding이 있거나 / 통합 검증 명령이 exit≠0이거나(통합 명령 부재 스택은 해당 없음) / **`[사용자 관측]`·`[플랫폼 관측]`이 아닌 미충족 AC**가 하나라도 있으면(`미관측` 포함).
  - **`Pending Acceptance`**: 위가 전부 아니고, **`[사용자 관측]`·`[플랫폼 관측]` AC의 receipt만 미발급**일 때. 이 AC에는 고칠 코드가 없다(receipt는 사용자만 발급한다 — ADR-065 D1).
  - **`Pass`**: 미충족 AC 0건.
  - P1/P2 라벨만 있는 것은 판정을 바꾸지 않는다(라벨은 report에 전수 기록).
  - **`감사 미완(unavailable)`은 `Pending Acceptance`가 아니다** — P0이므로 `Needs Fix`다. 고칠 것은 없지만 *판정할 수 없는* 상태이므로 `Pass` 계열을 낼 수 없다(ADR-067 D3와 동일 원리).
  - **하류가 이 값으로 갈린다**: `/finalize-workitem`은 `Pass`·`Pending Acceptance`를 통과시키고 `Needs Fix`를 차단한다. `/repair-workitem`은 `Pass`·`Pending Acceptance`면 종료한다. 졸업 item 4 (b)는 `Pass` 또는 `Pending Acceptance`를 허용한다(ADR-067 D1).
```

### 3.1.2 report 양식의 판정값 줄을 고친다

**앵커**: `- 판정: Pass | Needs Fix`

**바꿀 내용**
```
- 판정: Pass | Pending Acceptance | Needs Fix
```

### 3.1.3 AC 매핑 판정에서 관측 AC의 미충족 표현을 고정한다

**앵커**: `- AC ↔ 검증 매핑 (ADR-065 D1) — task `## 6-1`의 AC마다 `[modality]`를 읽고`

그 긴 불릿의 **끝에** 아래 문장을 이어 붙인다(새 불릿을 만들지 말고 같은 불릿 끝에 추가).

```
 **미충족 표현의 정본형 (중요)**: 어떤 modality든 미충족일 때 **`[modality]` 표기를 결과 라벨로 덮어쓰지 않는다.** `[사용자 관측]`·`[플랫폼 관측]`이 미충족이면 `- AC-N: ❌ [사용자 관측] receipt 대기 — `## 8`에 유효한 `- ac-acceptance` 없음` 형태로 적는다. **`[미관측]`은 «표기 부재 + 대응 테스트 없음»(legacy) 한 경우에만 쓴다**(ADR-065 D1). modality를 지우면 판정값(D6) 산출과 `/finalize-workitem` 분기가 «코드로 고칠 것»과 «사람이 볼 것»을 구분할 수 없다. **관측 AC의 미충족은 `## 실패 항목`에 적지 않는다** — 그 섹션은 `Needs Fix`일 때만 존재하고 이 AC는 판정을 `Needs Fix`로 만들지 않는다. 대신 `## Evidence Bundle`의 «검증하지 못한 것(oracle gap)» 하단에 `- receipt 대기: AC-N [<modality>] — 마일스톤 수용 라운드에서 발급` 한 줄을 남긴다.
```

### 3.1.4 AC 매핑 예시 블록에 미충족 정본형 예시를 넣는다

**앵커**: `- AC-5: ❌ [미관측] 표기 없음 → 자동 테스트 간주(legacy) — 대응 테스트 없음. `P2 [Modality-missing] AC-5` 병기`

그 줄 **바로 앞에** 아래 한 줄을 삽입한다.

```
- AC-4b: ❌ [사용자 관측] receipt 대기 — `## 8`에 유효한 `- ac-acceptance` 없음 (수용 라운드에서 발급 — 판정은 `Pending Acceptance`)
```

이어서 **같은 예시 블록의 마지막 줄(두 수치)을 6행 기준으로 다시 계산해 교체한다.** 행을 하나 늘렸으므로 분모가 5→6이 된다 — 고치지 않으면 이 예시가 3.1.6이 넣는 self-check ③(«분자·분모가 AC 행과 일치하는가»)을 스스로 위반하는 견본이 된다.

**앵커**: `- **충족률: 4/5 (80%) · 자동화율: 2/5 (40%)**`

**바꿀 내용**
```
- **충족률: 4/6 (67%) · 자동화율: 2/6 (33%)**
```

### 3.1.5 `## 다음 권장 액션` 템플릿을 고친다

**앵커**: `- 미충족 AC가 전부 `[사용자 관측]`·`[플랫폼 관측]` receipt 대기: `/accept-milestone --task <task-id>``

**현재**
```
- 미충족 AC가 전부 `[사용자 관측]`·`[플랫폼 관측]` receipt 대기: `/accept-milestone --task <task-id>` (task 스코프 — 라운드 상한·`## 11` 미소모, ADR-066 D1) 또는 사용자 직접 기재. **`/repair-workitem`으로 보내지 않는다**(고칠 코드가 없어 순환에 빠진다)
```
**바꿀 내용**
```
- Pending Acceptance: **`/finalize-workitem <task-id>`** — 이 modality는 마감을 막지 않는다(ADR-065 D1·D6). receipt는 마일스톤 수용 라운드(`/accept-milestone <M>` — ADR-066 D1)에서 발급되고 미발급은 졸업 item 4 (a')가 잡는다(ADR-067 D1). **`/repair-workitem`으로 보내지 않는다**(고칠 코드가 없어 순환에 빠진다)
```

**⚠ `ADR-066` 토큰이 반드시 남아야 한다.** 이 파일에서 `ADR-066`을 인용하는 줄은 **교체 대상인 이 줄 하나뿐**이고, 이 파일은 ADR-066 `## Surfaces`에 등재돼 있다(1.2.9가 그 줄을 갱신한다). 토큰을 빼면 매 마일스톤 `P1 [Surface-backref] ADR-066 → validate-workitem/SKILL.md`가 발화한다(ADR-045 D3·D4).

### 3.1.6 confidence 임계값을 skill 본문으로 끌어올리고 self-check를 넣는다

**앵커**: `- **두 수치 (ADR-065 D4)**: `충족률`(전 modality)과 `자동화율`(`[자동 테스트]`+`[산출물 검사]`)을 따로 계산해 report에 적는다.`

**현재**
```
- **두 수치 (ADR-065 D4)**: `충족률`(전 modality)과 `자동화율`(`[자동 테스트]`+`[산출물 검사]`)을 따로 계산해 report에 적는다. **confidence ladder의 입력은 자동화율이다** — 사람·플랫폼 관측이 많은 task가 자동으로 High가 되지 않게 한다.
```
**바꿀 내용**
```
- **두 수치 (ADR-065 D4)**: `충족률`(전 modality)과 `자동화율`(`[자동 테스트]`+`[산출물 검사]`)을 따로 계산해 report에 적는다. **confidence ladder의 입력은 자동화율이다** — 사람·플랫폼 관측이 많은 task가 자동으로 High가 되지 않게 한다.
- **confidence 임계값 (본문 SSOT — 아래 report 양식의 주석은 이 값의 사본이다)**: 평가 순서는 Low → Medium → High이며 **첫 매치로 확정**한다.
  - **Low** (하나라도 매치): 통합 명령 미통과 / oracle gap 카테고리 미명시(누락 ≥2) / **자동화율 < 70%** / **미충족 «기계 검증» AC 있음**
  - **Medium** (잔여 등급 — Low도 High도 아닌 전부): Low 조건 모두 불일치 + High 조건을 전부 충족하지는 못함(예: 자동화율 70~89% / oracle gap 1개 누락 / diff trace audit 미통과). **미달 개수에 상한을 두지 않는다** — 상한을 두면 «Low 아님 + High 아님 + 3개 미달»이 어느 등급에도 들어가지 못해 아래 self-check ④가 만족 불가능해진다(`out-of-AC` 직접 수정분의 재validate가 diff trace 미통과 + 자동화율 하락을 동시에 만들므로 실제로 도달하는 조합이다).
  - **High**: 통합 명령 통과 + **자동화율 ≥ 90%** + diff trace audit 통과 + oracle gap 카테고리 전부 명시
  - **Low 조건의 «미충족 AC 있음»을 «기계 검증 AC 한정»으로 읽는 이유**: 사람·플랫폼 관측 비중은 자동화율 <70%가 이미 잡는다. 관측 AC의 receipt 미발급까지 세면 이중으로 깎여 정상 `Pending Acceptance` task가 무조건 Low가 된다(ADR-065 D6).
- **report 저장 전 self-check (5항목 — 하나라도 어긋나면 저장하지 않고 재계산한다)**: ① 관측 AC의 receipt 판독이 `## 8`의 «마지막 이벤트» 규칙대로인가 ② 판정값이 D6 우선순위의 첫 매치인가 ③ 충족률·자동화율의 분자·분모가 AC 행과 일치하는가(`VC-N` 제외) ④ confidence가 위 임계값의 첫 매치인가 ⑤ `## 다음 권장 액션`이 판정값과 일치하는가(`Pass`·`Pending Acceptance` → finalize / 감사 미완 → 재validate / **`P0 [Spec-gap]` 있음 → 사용자 보고**(아래 spec coverage audit의 «task 자동 추가 금지»가 일반 repair 안내보다 우선한다 — 계획 누락은 코드 수리로 해소되지 않는다) / 그 외 `Needs Fix` → repair).
```

**⚠ Medium을 «잔여 등급»으로 쓰는 이유 (빼면 게이트가 잠긴다)**: ladder는 세 등급이 입력 공간을 **덮어야** 한다. 옛 문구(«High 조건 중 1~2개 미달»)는 3개 미달 구간을 비워 두는데, self-check ④가 «첫 매치»를 요구하므로 그 구간에 떨어진 report는 **저장되지 못하고 재계산 루프에 들어간다.** 평가 순서(`Low → Medium → High`)는 그대로 둬도 안전하다 — Medium 조건이 «High 조건을 전부 충족하지는 못함»을 포함하므로 High 자격 report는 Medium에서 거짓이 되어 High로 내려간다.

**⚠ ⑤의 `[Spec-gap]` 예외를 빼면 기존 규칙과 충돌한다**: 같은 파일의 spec coverage audit이 «`P0 [Spec-gap]`은 combined verdict가 Needs Fix지만 자동 후속 호출 없이 사용자 보고로 라우팅한다»를 규정한다(근거: ADR-057#amend-3 결정 6 «현재 M task 자동 추가 없음»). ⑤가 «그 외 Needs Fix → repair»를 무조건으로 두면 그 report는 ⑤를 통과할 수 없거나, 통과시키려고 계획 누락을 `/repair-workitem`으로 밀어 넣게 된다.

### 3.1.7 ⭐ report 양식 안의 confidence 주석을 본문과 동기화한다

**3.1.6이 «아래 report 양식의 주석은 이 값의 사본이다»라고 선언하는데, 그 주석 자체를 고치지 않으면 같은 파일 안에서 규칙이 둘로 갈린다.** 그리고 주석 쪽이 남으면 3.1.6이 막으려던 «정상 `Pending Acceptance` task가 무조건 Low» 가 그대로 발생한다(집계자가 report 양식을 그대로 읽어 confidence를 산정하기 때문).

**앵커**: `     - Low (어느 하나라도 매치): 통합 명령 미통과, 또는 oracle gap 카테고리 미명시(누락 카테고리 ≥2), 또는 **자동화율 <70%**, 또는 미충족 AC 있음`

**바꿀 내용**
```
     - Low (어느 하나라도 매치): 통합 명령 미통과, 또는 oracle gap 카테고리 미명시(누락 카테고리 ≥2), 또는 **자동화율 <70%**, 또는 **미충족 «기계 검증» AC 있음**(`[자동 테스트]`·`[산출물 검사]`·표기 부재 한정 — 관측 modality의 receipt 미발급은 세지 않는다. 사람·플랫폼 관측 비중은 자동화율 <70%가 이미 잡으므로 이중으로 깎으면 정상 `Pending Acceptance` task가 무조건 Low가 된다. 본 조건의 SSOT는 skill 본문의 confidence 임계값이며 이 주석은 그 사본이다 — ADR-065 D6)
```

이어서 **같은 주석의 Medium 줄도 본문과 맞춘다**(3.1.6이 Medium을 잔여 등급으로 바꿨으므로, 이 사본을 그대로 두면 집계자가 주석을 읽어 판정 불가 구간을 그대로 재현한다).

**앵커**: `     - Medium: Low 조건 모두 불일치 + High 조건 중 1~2개 미달`

**바꿀 내용**
```
     - Medium (잔여 등급 — Low도 High도 아닌 전부): Low 조건 모두 불일치 + High 조건을 전부 충족하지는 못함 (예: 자동화율 70~89% / oracle gap 카테고리 1개 누락 / diff trace audit 미통과). 미달 개수에 상한을 두지 않는다 — 본 조건의 SSOT는 skill 본문의 confidence 임계값이며 이 주석은 그 사본이다
```

### 3.1.8 마지막 출력의 판정값을 3종으로 늘린다

**앵커**: `- Pass / Needs Fix` (이 파일에서 유일하다 — report 양식의 `- 판정:` 줄과 다른 줄이다)

**바꿀 내용**
```
- Pass / Pending Acceptance / Needs Fix
```

**이유**: 메인 세션이 이 줄을 읽고 다음 액션을 발화하므로 2값으로 남으면 `Pending Acceptance`가 `Needs Fix`로 뭉뚱그려진다. **자동 검사로는 잡히지 않는다** — 7.3의 `Pending Acceptance` 존재 검사는 3.1.1·3.1.2가 이미 통과시키므로 이 줄만 낡아 있어도 통과한다.

### 3.1.9 판정 «2값 전제»로 남은 기록 위치 두 곳을 고친다

3값이 되면서 `Pending Acceptance`에 **정의가 없는 자리**가 두 곳 생긴다. 둘 다 report 작성 지시이므로 그대로 두면 집계자가 쓸 자리를 못 찾거나 거짓 문장을 쓴다.

**앵커**: `기록 위치: *Needs Fix 판정 시* `## 실패 항목` 하단에 한 줄, *Pass 판정 시*`

**교체 대상**: 그 줄의 **조각만** 바꾼다.

**현재 (조각)**
```
기록 위치: *Needs Fix 판정 시* `## 실패 항목` 하단에 한 줄, *Pass 판정 시* `## Evidence Bundle` 의 *검증된 것* sub-section 하단에 한 줄(`## 실패 항목`은 Needs Fix일 때만 존재하므로)
```
**바꿀 내용 (조각)**
```
기록 위치: *Needs Fix 판정 시* `## 실패 항목` 하단에 한 줄, *`Pass`·`Pending Acceptance` 판정 시* `## Evidence Bundle` 의 *검증된 것* sub-section 하단에 한 줄(`## 실패 항목`은 Needs Fix일 때만 존재하므로)
```

**앵커**: `- 판정 영향: <Pass 유지 / Needs Fix 트리거 (오직 (c) 의도 외 발견 시)>`

**바꿀 내용**
```
- 판정 영향: <판정 유지 / Needs Fix 트리거 (오직 (c) 의도 외 발견 시)>
```

**이유**: `Pending Acceptance` task의 diff-trace 감사 결과에 «Pass 유지»라고 쓰면 그 report는 자기 판정값과 어긋난 문장을 갖는다. «판정 유지»는 세 값 모두에 참이다.

> **`Pass`를 그대로 두는 자리**: 0단계 감사 미완 회수 규율의 «④에 도달한 축이 하나라도 있으면 `Pass`를 낼 수 없다»는 **참인 문장이므로 고치지 않는다**(그 상태는 P0 → `Needs Fix`이며, 3.1.1의 D6 불릿이 «`Pass` 계열을 낼 수 없다»로 이미 닫는다). 고치는 것은 *거짓이거나 미정의인* 자리 둘뿐이다.

---

**Phase 3-A 커밋 (3.1까지 — 판정값 자체)**

```
feat(validate): add Pending Acceptance verdict and hoist confidence thresholds into skill body
```

---

## 3.2 `/finalize-workitem`

파일: `.claude/skills/finalize-workitem/SKILL.md`

### 3.2.1 ⭐ 무조건 차단 줄을 분기에 종속시킨다

3.2.2가 새 분기를 넣지만, **그 분기보다 위에 있는 무조건 차단 줄이 먼저 걸려서 분기에 도달하지 못한다.** 이 줄을 먼저 고친다.

**앵커**: `   - 미충족 AC가 하나라도 있으면 `Needs Fix`로 종료하고 `/repair-workitem <task-id>`를 안내한다. **`미관측`도 미충족이다.**`

**현재**
```
   - 미충족 AC가 하나라도 있으면 `Needs Fix`로 종료하고 `/repair-workitem <task-id>`를 안내한다. **`미관측`도 미충족이다.**
```
**바꿀 내용**
```
   - 미충족 AC가 있으면 **아래 「분기 우선순위」에 따라 판정한다**(여기서 무조건 종료하지 않는다). **`미관측`도 미충족이다.**
```

### 3.2.2 AC 게이트의 분기를 재작성한다

**앵커**: `   - **분기 우선순위 (반드시 이 순서로 판정한다)**:`

**현재 (그 줄과 다음 줄 — 두 불릿)**
```
   - **분기 우선순위 (반드시 이 순서로 판정한다)**: ① 미충족 AC 중 `[사용자 관측]`·`[플랫폼 관측]` receipt 대기가 **아닌** 것이 하나라도 있으면 → `Needs Fix` + `/repair-workitem <task-id>` 안내(코드로 고칠 것이 있으므로 이쪽이 우선이다). ② 미충족 AC가 **전부** receipt 대기면 → `Needs Acceptance: <AC-N 목록>`으로 종료하고 **`/accept-milestone --task <task-id>`**(task 스코프 — 라운드 상한·`## 11`을 소모하지 않는다, [ADR-066](../../../docs/90-decisions/boilerplate/ADR-066-milestone-acceptance.md) D1) 또는 사용자 직접 기재를 안내한다. **에이전트가 receipt를 대신 쓰지 않는다**(ADR-065 D1). ③ 미충족 0건이면 통과.
   - `Needs Acceptance`는 `Needs Fix`가 아니다 — `/repair-workitem`으로 보내면 고칠 코드가 없어 순환에 빠진다.
```

**⚠ `ADR-066` 토큰이 반드시 남아야 한다.** 이 파일에서 `ADR-066`을 인용하는 줄은 **교체 대상인 이 두 줄뿐**이고, 이 파일은 ADR-066 `## Surfaces`에 등재돼 있다(1.2.9가 그 줄을 갱신한다). 토큰을 빼면 매 마일스톤 `P1 [Surface-backref] ADR-066 → finalize-workitem/SKILL.md`가 발화한다(ADR-045 D3·D4).

**바꿀 내용 (두 줄을 통째로 교체)**
```
   - **분기 우선순위 (반드시 이 순서로 판정한다 — 근거는 report의 `- 판정:` 값이다, ADR-065 D6)**: ① 판정이 **`Needs Fix`** 면 → `Needs Fix`로 종료 + `/repair-workitem <task-id>` 안내(코드로 고칠 것이 있다). ② 판정이 **`Pending Acceptance`** 면 → **통과시킨다.** 그 AC의 receipt는 마일스톤 수용 라운드(`/accept-milestone <M>` — [ADR-066](../../../docs/90-decisions/boilerplate/ADR-066-milestone-acceptance.md) D1)에서 발급되며(ADR-065 D1), 미발급은 졸업 item 4 (a')가 잡는다([ADR-067](../../../docs/90-decisions/boilerplate/ADR-067-milestone-graduation-v2.md) D1). ③ 판정이 **`Pass`** 면 통과.
   - **②로 통과할 때의 의무 2가지**: (i) 미충족 관측 AC마다 task `## 8`에 `- ac-pending <날짜> <AC-N>: modality=<...> — 마일스톤 수용 라운드에서 확인 예정`을 append한다(같은 AC의 `- ac-pending`이 이미 있으면 중복 append 금지 — **중복 판정은 HTML 주석 밖의 줄만 센다.** TASK_TEMPLATE `## 8` 주석의 형식 예시를 세면 «이미 있다»로 오판해 실제 줄이 영원히 안 남는다). **`## 0. Status`를 `done`으로 쓰는 것과 같은 편집 라운드에서 쓴다**(별도 mtime 갱신을 만들지 않는다). (ii) 마지막 출력에 `수용 라운드 대상 AC: <AC-N 목록>`을 명시하고, 이 마일스톤은 그 receipt 전까지 졸업이 `PENDING_ACCEPTANCE`임을 한 줄 안내한다.
   - **에이전트가 `- ac-acceptance` receipt를 대신 쓰지 않는다**(ADR-065 D1). `- ac-pending`은 receipt가 아니라 미발급 표시이므로 이 금지에 걸리지 않는다.
   - **finalize의 종료값은 `Needs Fix`·`Needs Validation`·`Needs Review`·`Needs Rationale`·`Needs Stack Guard`·정상 마감이다** — 관측 AC 전용 종료값을 따로 두지 않는다(마감을 막지 않으므로 필요 없다).
```

### 3.2.3 마지막 출력에 항목을 추가한다

**앵커**: `마지막 출력:` (이 파일에서 유일하다)

**현재 (그 줄부터 이어지는 5줄)**
```
마지막 출력:
- 커밋 해시
- 커밋 메시지
- 갱신된 task status
- 다음 권장 단계 (다음 task로 진행 또는 마일스톤이면 `/stabilize-milestone`)
```
**바꿀 내용**
```
마지막 출력:
- 커밋 해시
- 커밋 메시지
- 갱신된 task status
- **수용 라운드 대상 AC**: `[사용자 관측]`·`[플랫폼 관측]`로 미충족 통과시킨 AC-N 목록 + `- ac-pending` append 건수 / 해당없음
- 다음 권장 단계 (다음 task로 진행 또는 마일스톤이면 `/stabilize-milestone`)
```

---

## 3.3 `/repair-workitem`

파일: `.claude/skills/repair-workitem/SKILL.md`

> **`2-G` 상태별 입구 게이트(`done` 재개방)와 「수행 1」의 재개방 절차는 그대로 둔다.** 재개방은 유지되는 경로이며 `/repair-milestone`·`/repair-acceptance`가 이 skill로 위임할 때 쓴다.

### 3.3.1 종료 조건에 `Pending Acceptance`를 넣고 가드를 정리한다

**앵커**: `   - 파일이 `Pass`이면 `/finalize-workitem`을 안내하고 종료한다(repair 대상 없음).`

**현재 (그 줄과 다음 두 줄 — 세 불릿)**
```
   - 파일이 `Pass`이면 `/finalize-workitem`을 안내하고 종료한다(repair 대상 없음).
   - **실패 항목이 전부 «수정 대상 아님»이면 즉시 종료한다** — `## 실패 항목`의 항목이 모두 (i) `[사용자 관측]`·`[플랫폼 관측]` receipt 대기이거나 (ii) `[P0] 감사 미완(unavailable)`이면, 코드로 고칠 것이 없으므로 4-판정에 들어가지 않고 안내 후 종료한다(report를 삭제하지 않는다). 안내 문구: (i)이면 `/accept-milestone --task <task-id>` 또는 사용자 직접 receipt 기재(ADR-065 D1 — 에이전트 대행 발급 금지), (ii)이면 `/validate-workitem <task-id>` 재실행. **둘이 섞여 있고 그 외 실패 항목도 있으면** 이 가드에 걸리지 않고 정상 진행하되, 위 두 종류는 4-판정 대상에서 제외하고 그대로 남긴다.
   - **단, 인자에 finding 요약(repair-milestone이 QA_FINDINGS 발견을 위임할 때 넘기는 "<finding>")이 있으면 report가 Pass·부재여도 종료하지 않고 그 finding을 대상으로 진행한다(finding-mode).** 아래 "비판적 재점검"을 그 finding에 적용해 코드를 수정하고 task `## 8. 메모`에 결정 이력을 남긴다. finding-mode에서는 (a) Pass report를 삭제하지 않고(실패 report가 아님), (b) QA_FINDINGS는 건드리지 않으며(status 종료는 위임한 repair-milestone 책임 — 본 skill의 "다른 산출물 미접근" 계약 유지), (c) 마지막 출력에 "/validate-workitem <task-id> 재실행으로 수정 확인" 안내를 포함한다.
```

**바꿀 내용 (세 불릿을 통째로 교체)**
```
   - 파일 판정이 **`Pass` 또는 `Pending Acceptance`**(ADR-065 D6)면 `/finalize-workitem`을 안내하고 종료한다(repair 대상 없음). **`Pending Acceptance`는 «사람이 볼 것만 남았다»는 뜻이라 코드로 고칠 것이 없다** — `/accept-milestone <M>`으로 보내지도 않는다(그것은 마일스톤 층 단계다).
   - **실패 항목이 전부 `[P0] 감사 미완(unavailable)`이면 즉시 종료한다** — 코드로 고칠 것이 없으므로 4-판정에 들어가지 않고 `/validate-workitem <task-id>` 재실행을 안내한 뒤 종료한다(report를 삭제하지 않는다). **다른 실패 항목이 섞여 있으면** 이 가드에 걸리지 않고 정상 진행하되, `감사 미완` 항목은 4-판정 대상에서 제외한다.
   - **단, 인자에 finding 요약(`/repair-milestone`·`/repair-acceptance`가 per-task 결함을 위임할 때 넘기는 "<finding>")이 있으면 위 종료 조건 전부에 걸리지 않고 그 finding을 대상으로 진행한다(finding-mode)** — 즉 report가 `Pass`·`Pending Acceptance`·**stale**·부재여도, 실패 항목이 전부 감사 미완이어도 종료하지 않는다. **`stale`을 여기 명시하는 것이 중요하다** — 위임하는 skill이 이미 다른 파일을 고친 상태로 부르므로 report는 stale인 것이 정상이고, 앞의 stale 가드가 먼저 걸리면 위임 연쇄가 **첫 고리에서 죽는다.** 아래 "비판적 재점검"을 그 finding에 적용해 코드를 수정하고 task `## 8. 메모`에 결정 이력을 남긴다. finding-mode에서는 (a) `Pass`·`Pending Acceptance` report를 삭제하지 않고(실패 report가 아님), (b) QA_FINDINGS·IMPROVEMENT_GUIDE는 건드리지 않으며(status 종료는 위임한 skill 책임 — 본 skill의 "다른 산출물 미접근" 계약 유지), (c) 마지막 출력에 "/validate-workitem <task-id> 재실행으로 수정 확인" 안내를 포함한다. **위임한 skill이 그 재실행과 이어지는 `/finalize-workitem`까지 자기 루프 안에서 실행하므로, 사용자에게 수동 실행을 요구하지 않는다.**
```

### 3.3.2 수행 4의 «미처리» 정의를 명확히 한다

**앵커**: `4. **report 삭제** — 대상 항목 *전부*(P0/P1/P2)를 수정 또는 Reject로 완결한 뒤(미처리 항목이 남아 있으면 삭제하지 않는다):`

**현재**
```
4. **report 삭제** — 대상 항목 *전부*(P0/P1/P2)를 수정 또는 Reject로 완결한 뒤(미처리 항목이 남아 있으면 삭제하지 않는다):
```
**바꿀 내용**
```
4. **report 삭제** — 대상 항목 *전부*(P0/P1/P2)를 수정 또는 Reject로 완결한 뒤 삭제한다. **`감사 미완(unavailable)` 항목이 남아 있어도 삭제한다** — 그것은 미처리가 아니라 재validate로만 해소되는 항목이라 삭제가 오히려 정확한 처방이다. 사용자가 인자로 **부분 범위를 지정해** 진짜 결함이 미처리로 남은 경우에만 삭제하지 않는다:
```

### 3.3.3 자체 검증 단계를 추가한다

**앵커**: `## 봉인 후 새 결정 등재 (ADR-060 D11)`

이 헤딩 **바로 앞에** 아래 블록을 삽입한다.

```
5. **자체 검증 — 즉시 파손 감지 (위 1~4를 전부 마친 뒤 1회)**: 통합 검증 명령이 `--changed`를 지원하면 `validate --changed`를 1회 실행한다. **이것은 전체 검증이 아니다** — 「방금 한 수정이 즉시 깨졌는가」만 본다. full validate·AC 스코프 정합·diff 추적성은 `/validate-workitem` 책임이다.
   - **고치는 대상은 본 라운드 수정이 만든 실패로 한정한다.** baseline은 report의 `## 통합 명령 실행 결과` 섹션 값이며, **위 「반드시 먼저 할 일 2」에서 report를 읽을 때 그 값을 메모리에 보관해 둔다**(4에서 report를 삭제하므로 여기서 다시 읽을 수 없다 — 경로·값을 미리 회수하는 기존 규율과 동형). baseline에 이미 있던 실패는 고치지 않고 출력에 명시한다.
   - 실패를 고치면 다시 실행한다. **최대 3회.** 초과하면 `Needs Follow-up: <실패 목록>`으로 출력에 명시하고 종료한다(조용히 넘기지 않는다).
   - **`--changed` 미지원이거나 통합 명령이 없으면 이 단계를 skip한다** — 별도 hardstop을 만들지 않는다(`/validate-workitem`이 받는다). skip 사유를 출력에 한 줄 남긴다.
```

### 3.3.4 마지막 출력에 항목을 추가한다

**앵커**: `- 다음 권장 액션: `/validate-workitem <task-id>` 재실행 (새 report 생성 → Pass면 `/finalize-workitem`)`

**현재**
```
- 다음 권장 액션: `/validate-workitem <task-id>` 재실행 (새 report 생성 → Pass면 `/finalize-workitem`)
```
**바꿀 내용**
```
- 자체 검증 (즉시 파손 감지): pass / skip(사유) / `Needs Follow-up: <목록>`
- 다음 권장 액션: `/validate-workitem <task-id>` 재실행 (새 report 생성 → `Pass`·`Pending Acceptance`면 `/finalize-workitem`)
```

### 3.3.5 2-H의 근거 인용을 ADR-066 D6으로 바꾼다

**앵커**: `2-H. **동일 패턴 전수 검색 (ADR-047 D7 정합)**`

**현재 (그 줄의 머리 부분)**
```
2-H. **동일 패턴 전수 검색 (ADR-047 D7 정합)**:
```
**바꿀 내용**
```
2-H. **동일 패턴 전수 검색 (ADR-066 D6)**:
```

### 3.3.6 정책 근거 줄을 갱신한다

**앵커**: `정책 근거: 비판적 재점검·전 severity 완결·report 삭제는 [ADR-050]`

**현재 (줄 전체)**
```
정책 근거: 비판적 재점검·전 severity 완결·report 삭제는 [ADR-050](../../../docs/90-decisions/boilerplate/ADR-050-main-session-lifecycle-skills.md) D3 / repair-plan(ADR-038) 대칭. 결정 이력 영속은 ADR-047 D7.
```
**바꿀 내용**
```
정책 근거: 비판적 재점검·전 severity 완결·report 삭제는 [ADR-050](../../../docs/90-decisions/boilerplate/ADR-050-main-session-lifecycle-skills.md) D3 / repair-plan(ADR-038) 대칭. 결정 이력 영속은 ADR-047 D7. 동일 패턴 전수 검색은 [ADR-066](../../../docs/90-decisions/boilerplate/ADR-066-milestone-acceptance.md) D6. 판정값 3종은 [ADR-065](../../../docs/90-decisions/boilerplate/ADR-065-ac-verification-contract.md) D6.
```

---

## 3.4 `/implement-workitem`

파일: `.claude/skills/implement-workitem/SKILL.md`

### 3.4.1 `- ac-pending`의 목적지를 명시한다

**앵커**: `   - **modality 분기 (ADR-065 D1)**: `## 6-1`의 `[modality]`를 먼저 읽는다.`

**현재 (그 불릿의 뒷부분)**
```
그 AC에는 `- verify-power` 줄을 쓰지 않고, 대신 6-R 출력에 `- ac-pending <AC-N>: modality=<...> — 사용자 receipt 대기` 한 줄만 남긴다. 그 AC의 충족은 사용자 발급 `- ac-acceptance`가 담당하며 **foreman이 그 receipt를 쓰지 않는다.**
```
**바꿀 내용**
```
그 AC에는 `- verify-power` 줄을 쓰지 않고, 대신 **6-R에서 task `## 8`에** `- ac-pending <날짜> <AC-N>: modality=<...> — 마일스톤 수용 라운드에서 확인 예정` 한 줄을 append한다(형식 SSOT는 ADR-065 D3 / TASK_TEMPLATE `## 8`). 그 AC의 충족은 사용자 발급 `- ac-acceptance`가 담당하며 **foreman이 그 receipt를 쓰지 않는다.** `- ac-pending`은 receipt가 아니라 «아직 증거가 없다»는 표시이므로 이 금지에 걸리지 않는다.
```

### 3.4.2 6-R의 허용 줄 목록에 추가한다

**앵커**: `   - `- fact-resolved <날짜> <무엇>: <잠정값> → <관측값> / 관측 방법: <1줄>``

그 줄 **바로 뒤에** 아래 한 줄을 삽입한다(같은 들여쓰기).

```
   - `- ac-pending <날짜> <AC-N>: modality=<사용자 관측|플랫폼 관측> — 마일스톤 수용 라운드에서 확인 예정`  (같은 AC에 이미 있으면 중복 append 금지 — **중복 판정은 HTML 주석 밖의 줄만 센다**, TASK_TEMPLATE `## 8` 주석의 형식 예시를 항목으로 세지 않는다)
```

### 3.4.3 마지막 출력의 안내 문구를 고친다

**앵커**: `- 사용자 확인 대기 AC (ADR-065 D1): `[사용자 관측]`·`[플랫폼 관측]` AC-N 목록`

**현재**
```
- 사용자 확인 대기 AC (ADR-065 D1): `[사용자 관측]`·`[플랫폼 관측]` AC-N 목록 — `/validate-workitem` 후 `/accept-milestone --task <task-id>`로 receipt 발급 필요 / 해당없음
```
**바꿀 내용**
```
- 수용 라운드 대상 AC (ADR-065 D1): `[사용자 관측]`·`[플랫폼 관측]` AC-N 목록 + `- ac-pending` append 건수 — 이 AC는 `/finalize-workitem`을 막지 않으며(판정은 `Pending Acceptance`) receipt는 마일스톤 수용 라운드(`/accept-milestone <M>`)에서 발급된다 / 해당없음
```

---

## 3.5 `builder.md` / `validator.md`

### 3.5.1 builder.md — 반환 문구를 정렬한다

파일: `.claude/agents/builder.md`

**앵커**: `구현만 하고 반환에 "`<AC-N>`: modality=<...> — Red 불가, 사용자 receipt 대기"로 보고한다.`

**현재**
```
구현만 하고 반환에 "`<AC-N>`: modality=<...> — Red 불가, 사용자 receipt 대기"로 보고한다.
```
**바꿀 내용**
```
구현만 하고 반환에 "`<AC-N>`: modality=<...> — Red 불가, 수용 라운드 대상"으로 보고한다(foreman이 그 정보로 task `## 8`에 `- ac-pending`을 남긴다).
```

### 3.5.2 validator.md — 관측 AC 미충족의 결과 라벨을 규정한다

파일: `.claude/agents/validator.md`

**앵커**: `  - `[사용자 관측]`·`[플랫폼 관측]` — task `## 8`에서 **그 AC의 마지막 이벤트가 `- ac-acceptance`** 인가`

그 불릿의 **끝에** 아래 문장을 이어 붙인다.

```
 **미충족이면 결과 라벨을 `미관측`으로 바꾸지 않고 `[사용자 관측] receipt 대기`처럼 modality를 유지한 채 사유를 적어 반환한다** — 집계자가 판정값을 `Pending Acceptance`로 낼 수 있어야 한다(ADR-065 D1·D6). **이 미충족은 `Needs Fix` 트리거가 아니다.**
```

**앵커**: `  - **표기 없음** — `[자동 테스트]`로 간주해 판정한다(legacy 호환).`

**현재**
```
  - **표기 없음** — `[자동 테스트]`로 간주해 판정한다(legacy 호환). 대응 테스트가 있으면 충족, 없으면 결과 라벨 `미관측`으로 미충족. 표기 부재 자체는 `P2 [Modality-missing] AC-N` 기록 등급이며 그것만으로 미충족을 만들지 않는다.
```
**바꿀 내용**
```
  - **표기 없음** — `[자동 테스트]`로 간주해 판정한다(legacy 호환). 대응 테스트가 있으면 충족, 없으면 결과 라벨 `미관측`으로 미충족. **`미관측`을 쓰는 경우는 이 한 가지뿐이다**(ADR-065 D1). 표기 부재 자체는 `P2 [Modality-missing] AC-N` 기록 등급이며 그것만으로 미충족을 만들지 않는다.
```

### 3.5.3 ⭐ validator.md — 반환 양식의 «Needs Fix 트리거» 정의를 modality에 종속시킨다

파일: `.claude/agents/validator.md`

**3.5.2가 «관측 AC의 미충족은 `Needs Fix` 트리거가 아니다»를 넣지만, 같은 파일의 반환 양식이 «❌ AC면 트리거»를 무조건으로 정의하고 있어 정면 충돌한다.** 그리고 그 줄은 validator가 **실제로 채우는 필드의 판정 기준**이라, 고치지 않으면 관측 AC 하나만 ❌인 task에서 validator가 «트리거: 예»를 반환하고 집계자가 그것을 받아 `Needs Fix`를 낸다 — **3.1.1이 막으려던 그 순환**(`/repair-workitem`으로 갔는데 고칠 코드가 없음)이 팬아웃 경로로 되살아난다. **자동 검사로는 잡히지 않는다** — 7.1의 `Pass | Needs Fix`(파이프 표기)와 다른 문장이다.

**앵커**: `- 그 축의 partial 판정: 이 축이 Needs Fix를 트리거하는가 (P0 발견 / ❌ AC)`

**현재 (줄 전체)**
```
- 그 축의 partial 판정: 이 축이 Needs Fix를 트리거하는가 (P0 발견 / ❌ AC) — combined 최종 판정은 메인 집계자 책임
```
**바꿀 내용**
```
- 그 축의 partial 판정: 이 축이 Needs Fix를 트리거하는가 (P0 발견 / ❌ AC — **단 `[사용자 관측]`·`[플랫폼 관측]`의 receipt 미발급은 트리거가 아니다**, 위 AC 충족 판정) — combined 최종 판정은 메인 집계자 책임
```

이어서 같은 파일의 **판정값 2종 열거**를 지운다(같은 문장의 뒤쪽에서 이미 «combined 최종 판정»으로만 쓰고 있어 표기가 갈린다. 값 공간의 SSOT는 ADR-065 D6이며 이 파일이 열거를 들고 있을 이유가 없다).

**앵커**: `- 그 축에서 P0를 발견했거나 (AC 축이면) ❌ AC가 있으면 partial에 명시한다`

**현재 (줄 전체)**
```
- 그 축에서 P0를 발견했거나 (AC 축이면) ❌ AC가 있으면 partial에 명시한다 — combined Pass/Needs Fix 판정은 메인 집계자가 내린다.
```
**바꿀 내용**
```
- 그 축에서 P0를 발견했거나 (AC 축이면) ❌ AC가 있으면 partial에 명시한다 — combined 판정은 메인 집계자가 내린다.
```

> **`## 신호 압축` 절의 «Pass/Needs Fix 판정»은 그대로 둔다** — 그것은 «압축 금지 항목» 목록에서 *판정 결과 자체*를 가리키는 항목명이고 값 공간을 규정하지 않는다. 고치는 것은 *판정 기준을 정의하는* 줄과 *값 공간을 열거하는* 줄뿐이다.

---

## 3.6 `/plan-workitem`

파일: `.claude/skills/plan-workitem/SKILL.md`

**앵커**: `   - `[사용자 관측]`·`[플랫폼 관측]`을 지정한 AC가 1개 이상이면 마지막 출력의 "남은 미결정 사항"에`

**현재**
```
   - `[사용자 관측]`·`[플랫폼 관측]`을 지정한 AC가 1개 이상이면 마지막 출력의 "남은 미결정 사항"에 `- 사용자 확인 필요 AC: <task-id>:AC-N (<modality>)`로 surface한다 — 그 AC는 **구현 후 `/validate-workitem` 뒤·`finalize` 전에 `/accept-milestone --task <task-id>`(또는 사용자 직접 기재)로 receipt가 발급돼야** 충족된다(ADR-066 D1).
```
**바꿀 내용**
```
   - `[사용자 관측]`·`[플랫폼 관측]`을 지정한 AC가 1개 이상이면 마지막 출력의 "남은 미결정 사항"에 `- 수용 라운드 대상 AC: <task-id>:AC-N (<modality>)`로 surface한다 — 그 AC는 **`/finalize-workitem`을 막지 않으며**(그때 판정값은 `Pending Acceptance` — ADR-065 D6), receipt는 **`/accept-milestone <M>`(마일스톤 수용 라운드) 또는 사용자 직접 기재**로 발급된다. 미발급이면 그 마일스톤의 graduation이 `PENDING_ACCEPTANCE`에 머문다(ADR-065 D1 / ADR-066 D1 / ADR-067 D1 item 4 (a')).
```

---

**Phase 3-B 커밋 (3.2~3.6 — 판정값을 소비하는 쪽)**

```
feat(inner-loop): route observation ACs through Pending Acceptance verdict and add repair self-check
```

---

# Phase 4 — 마일스톤 층 스킬

---

## 4.1 `/accept-milestone`

파일: `.claude/skills/accept-milestone/SKILL.md`

이 skill에서 하는 일은 셋이다 — ① `--task` 스코프를 통째로 걷어낸다(마일스톤 스코프 하나만 남는다), ② 계약 변경의 목적지를 `DECISION_REGISTER` → `ROADMAP ## Backlog`로 바꾼다, ③ receipt 발급이 재validate를 유발하지 않게 후속 안내를 고친다.

### 4.1.1 frontmatter의 `argument-hint`를 고친다

**앵커**: `argument-hint: "<milestone-id> | --task <task-id>"`

**바꿀 내용**
```
argument-hint: "<milestone-id>"
```

### 4.1.2 도입 2줄을 다시 쓴다

**앵커**: `이 skill은 **사람이 직접 확인하는 단계**다.`

**현재 (그 줄과 다음 줄 — 2줄)**
```
이 skill은 **사람이 직접 확인하는 단계**다. 마일스톤 스코프는 `/stabilize-milestone`(AI 검증) 뒤에, task 스코프(`--task`)는 `/validate-workitem` 뒤·`/finalize-workitem` 앞에 실행한다.
**코드를 수정하지 않고 커밋하지 않으며 workitem status를 바꾸지 않는다.** 정상 write 대상은 넷이며, **task 스코프는 그중 4번과 — 계약 변경을 발견한 경우에 한해 — 2번의 `DECISION_REGISTER.md`만 쓴다**(아래 task 스코프 흐름 3(b)·5).
```
**바꿀 내용 (2줄을 통째로 교체)**
```
이 skill은 **사람이 직접 확인하는 단계**다. `/stabilize-milestone`(AI 검증) 뒤에 **마일스톤 단위로만** 실행한다 — task 단위 수용 스코프는 없다(ADR-066 D1). 관측 modality AC(`[사용자 관측]`·`[플랫폼 관측]`)의 receipt는 task를 마감할 때가 아니라 **이 라운드에서 한꺼번에** 발급된다.
**코드를 수정하지 않고 커밋하지 않으며 workitem status를 바꾸지 않는다.** 정상 write 대상은 아래 넷이다.
```

### 4.1.3 write 대상 2번의 목적지를 바꾼다

**앵커**: `2. `docs/40-validation/QA_FINDINGS.md` / `docs/10-charter/DECISION_REGISTER.md` / `docs/40-validation/IMPROVEMENT_GUIDE.md` — 피드백 3갈래 라우팅 (ADR-066 D2)`

**바꿀 내용**
```
2. `docs/40-validation/QA_FINDINGS.md` / `docs/30-workitems/ROADMAP.md` `## Backlog` / `docs/40-validation/IMPROVEMENT_GUIDE.md` — 피드백 3갈래 라우팅 (ADR-066 D2). **예외 1건**: 정본 문서(charter·ARCH·DESIGN)를 고쳐야 성립하는 계약 변경만 `docs/10-charter/DECISION_REGISTER.md`에 등재한다(아래 R5-2 예외 — ADR-005#amend-1 / ADR-060 D11)
```

**⚠ 예외 문구를 빼면 이 skill이 «선언한 write 목록 밖»을 쓰게 된다.** 이 목록은 바로 위 줄이 «정상 write 대상은 아래 넷이다»로 선언하는 화이트리스트인데, 4.1.10이 R5-2에 **`DECISION_REGISTER` 예외 경로**를 남긴다(정본 문서를 고쳐야 성립하는 항목). 교체 전 목록에는 그 파일이 있었으므로 목록이 완결이었고, 목적지만 바꾸면 **예외 경로가 화이트리스트 밖으로 떨어진다** — 그러면 그 항목이 조용히 어디에도 등재되지 않거나(ADR-060 D11 경로 상실) skill이 자기 선언을 위반한다. `STRUCTURE.md`의 원장 로스터는 이미 본 skill을 `DECISION_REGISTER` writer로 등재하고 있으므로(수용 라운드 `Out-of-contract`) 이 예외는 정책과도 일치한다. 4.1.13-b의 커밋 안내도 같은 조건부 표기를 쓴다.

### 4.1.4 「졸업 필수 조건」 문단에서 task 스코프 예외를 걷어낸다

**앵커**: `**마일스톤 스코프 라운드는 졸업 필수 조건이 아니다**(권장 — ADR-067 D6).`

**현재 (줄 전체)**
```
**마일스톤 스코프 라운드는 졸업 필수 조건이 아니다**(권장 — ADR-067 D6). 졸업 판정은 `/stabilize-milestone`이 소유한다. 단 **task 스코프는 «권장»이 아니다** — `[사용자 관측]`·`[플랫폼 관측]` AC를 쓴 task는 receipt 없이 `finalize`되지 않으므로, 그 receipt를 사용자가 직접 기재하지 않는 한 이 경로를 거쳐야 한다(ADR-065 D1).
```
**바꿀 내용**
```
**이 라운드는 관측 modality AC가 0건인 마일스톤에서만 «권장(선택)»이다**(ADR-067 D6). `[사용자 관측]`·`[플랫폼 관측]` AC가 **1건이라도 있으면** 그 receipt 없이는 졸업 item 4 (a')를 충족하지 못하므로(ADR-067 D1) 사실상 필수 경로가 되며, 그때까지 그 마일스톤의 graduation은 `PENDING_ACCEPTANCE`다(ADR-067 D3). 졸업 판정 자체는 `/stabilize-milestone`이 소유한다.
```

### 4.1.5 입력 절에서 스코프 2종을 1종으로 줄인다

**앵커**: `입력 — **스코프 2종 (ADR-066 D1)**:`

**현재 (그 줄부터 4줄)**
```
입력 — **스코프 2종 (ADR-066 D1)**:
- **마일스톤 스코프**: `$ARGUMENTS` = milestone id. **`M[0-9]+` 패턴만 허용**(미일치 즉시 종료).
- **task 스코프**: `$ARGUMENTS` = `--task <task-id>`. **`T-[0-9]+` 패턴만 허용.** `/validate-workitem`이 그 task의 `[사용자 관측]`·`[플랫폼 관측]` AC를 미충족으로 냈을 때(= `finalize` 전) 호출된다.
- **라운드 번호는 마일스톤 문서 `## 11. 수용 기록`의 `- 라운드:` 값 + 1이다.** 세션 파일 수로 세지 않는다 — 그 파일은 라운드가 끝나면 삭제되므로(승인 시 본 skill, 보류 시 `/repair-acceptance`) 상한이 무력화된다. `## 11`이 비어 있으면 1회차다. **상한 3** — 4회차 진입 시 남은 항목을 다음 마일스톤으로 이관할지 사용자에게 확인하고 종료한다. **task 스코프는 이 카운터를 읽지도 쓰지도 않는다.**
```
**바꿀 내용 (4줄을 통째로 교체)**
```
입력 (ADR-066 D1):
- `$ARGUMENTS` = milestone id. **`M[0-9]+` 패턴만 허용**(미일치 즉시 종료). **다른 스코프는 없다** — `--task` 같은 인자를 받으면 «마일스톤 단위로만 실행한다»를 안내하고 종료한다.
- **라운드 번호는 마일스톤 문서 `## 11. 수용 기록`의 `- 라운드:` 값 + 1이다.** 세션 파일 수로 세지 않는다 — 그 파일은 라운드가 끝나면 삭제되므로(승인 시 본 skill, 보류 시 `/repair-acceptance`) 상한이 무력화된다. **`- 라운드:` 판독은 HTML 주석(`<!-- ... -->`) 밖의 줄만 센다** — 템플릿이 `## 11` 안에 형식 설명을 주석으로 넣어 두므로, 주석 안의 예시 줄을 세면 아직 한 번도 안 돈 마일스톤이 2회차로 시작한다. 주석 밖에 `- 라운드:`가 없으면 1회차다. **상한 3** — 4회차 진입 시 남은 항목을 다음 마일스톤으로 이관할지 사용자에게 확인하고 종료한다.
```

### 4.1.6 `## task 스코프 흐름` 절을 통째로 삭제한다

**삭제 범위**: `## task 스코프 흐름 (`--task <task-id>` — 라운드 카운터·`## 11` 미사용)` 헤딩 줄부터, 그 아래 번호 항목 1~5 전부(5로 시작하는 줄까지). 바로 다음의 `## 마일스톤 스코프 흐름 (`<M>`) — 아래 R0~R6` 헤딩은 **남긴다.**

삭제 후 그 자리에는 아무것도 넣지 않는다(빈 줄 하나만 남긴다).

### 4.1.7 남은 헤딩에서 「마일스톤 스코프」 수식을 뗀다

**앵커**: `## 마일스톤 스코프 흐름 (`<M>`) — 아래 R0~R6`

**바꿀 내용**
```
## 수용 라운드 흐름 (`<M>`) — 아래 R0~R6
```

### 4.1.8 R0에 graduation 4값 분기를 넣는다

**앵커**: `- **graduation이 `NO`/`BLOCKED`면** 그 사유를 출력하고`

**현재 (줄 전체)**
```
- **graduation이 `NO`/`BLOCKED`면** 그 사유를 출력하고 "먼저 `/repair-milestone` 또는 환경 복구 후 `/stabilize-milestone` 재실행 권장"을 안내한 뒤 **사용자가 계속을 원할 때만** R1로 간다(미완 상태 확인도 유효하다).
```
**바꿀 내용**
```
- **graduation 값에 따라 분기한다 (ADR-067 D3 — 4종)**:
  - **`PENDING_ACCEPTANCE`** — 이 단계를 부르라고 나온 값이다. 그대로 R1로 간다(본 라운드의 표준 진입 상태).
  - **`YES`** — 이미 졸업한 마일스톤이다(관측 AC가 0건이거나, 이전 라운드에서 전부 receipt를 받았다). "졸업 확정 상태 — 본 라운드는 선택입니다"를 알리고 사용자가 원하면 R1로 간다.
  - **`NO`/`BLOCKED`** — 그 사유를 출력하고 "먼저 `/repair-milestone` 또는 환경 복구 후 `/stabilize-milestone` 재실행 권장"을 안내한 뒤 **사용자가 계속을 원할 때만** R1로 간다(미완 상태 확인도 유효하다).
```

### 4.1.9 R2 필수 시나리오의 판독 규칙을 명시한다

**앵커**: `   - **필수**: 이 마일스톤 산하 task의 `[사용자 관측]`·`[플랫폼 관측]` modality AC 중 **아직 유효한 receipt가 없는 것 전부**`

그 불릿의 **끝에** 아래 문장을 이어 붙인다.

```
 **판독 규칙**: 그 AC의 `## 8` 마지막 이벤트가 `- ac-acceptance`가 아닌 것이 대상이며 — `- ac-pending`(finalize가 남긴 미발급 표시)·`- invalidated`·이벤트 없음이 전부 여기 해당한다 — **HTML 주석 밖의 줄만 센다**(ADR-065 D3 판독 규칙). `- ac-pending`은 receipt가 아니므로 그 AC는 여전히 미발급이다.
```

이어서 **같은 불릿 안의 아래 조각을 교체**한다(task 스코프가 사라졌으므로 그 근거 서술이 거짓이 된다).

**현재 (조각)**
```
이미 유효 receipt가 있는 AC는 재확인하지 않는다(task 층에서 이미 발급됐을 수 있다 — ADR-065 D1).
```
**바꿀 내용 (조각)**
```
이미 유효 receipt가 있는 AC는 재확인하지 않는다(직전 수용 라운드에서 발급됐거나 사용자가 직접 기재한 경우다 — ADR-065 D1. **task 층 발급 경로는 없다** — 이 라운드가 유일한 발급 자리다).
```

### 4.1.10 R5-2 「계약 변경」의 목적지를 ROADMAP Backlog로 바꾼다

**앵커**: `2. **계약 변경(결정)** — 계약 자체를 바꾸려는 것(방향 변경·새 기능) →`

**현재 (줄 전체)**
```
2. **계약 변경(결정)** — 계약 자체를 바꾸려는 것(방향 변경·새 기능) → `DECISION_REGISTER.md`에 `status: open` + `- 발견: 수용 라운드 (M<N>)`으로 등재(ADR-060 D11 경로) + 다음 마일스톤 후보로 surface. **현재 마일스톤에서 고치지 않는다.**
```
**바꿀 내용**
```
2. **계약 변경(범위)** — 계약 자체를 바꾸려는 것(방향 변경·새 기능) → **`docs/30-workitems/ROADMAP.md`의 `## Backlog`에 한 줄 등재**한다. 형식: `- `<candidate-key>` <한 줄 요약> — 출처: 수용 라운드 M<N> r<라운드> / 확신도: <높음/중간/낮음>`. `<candidate-key>`는 목표 슬러그이며(예: `offline-merge`) 이후 `/plan-milestone` R0이 이 key로 회수·승격한다. **현재 마일스톤에서 고치지 않는다.**
   - **`DECISION_REGISTER.md`에 쓰지 않는다.** 두 원장의 배타 범위는 «해소되면 무엇이 남는가»로 갈린다 — 정본 문서(charter·ARCH·DESIGN)의 한 절이 바뀌면 register, 다음 마일스톤 문서 하나가 생기면 Backlog다. 계약 변경 제안은 후자다.
   - **예외 — 정본 문서를 고쳐야 성립하는 항목**(예: charter `## 5. 비목표`를 뒤집는 요구)은 `DECISION_REGISTER.md`에 `status: open` + `- 발견: 수용 라운드 (M<N>)`으로 등재한다(ADR-060 D11). **한 항목을 양쪽에 동시에 쓰지 않는다.**
```

### 4.1.11 R6 판정에 «receipt 미발급 잔존»을 명시한다

**앵커**: `   - **승인** — 1번(결함) 라우팅 0건 **이고** R2의 필수 시나리오`

**현재**
```
   - **승인** — 1번(결함) 라우팅 0건 **이고** R2의 필수 시나리오(= 유효 receipt가 없던 관측 modality AC 전부)를 모두 확인했다. `- 판정: 승인`.
```
**바꿀 내용**
```
   - **승인** — 1번(결함) 라우팅 0건 **이고** R2의 필수 시나리오(= 유효 receipt가 없던 관측 modality AC 전부)를 모두 확인했다. `- 판정: 승인`. **이 판정이 나면 그 마일스톤의 관측 AC는 전부 receipt를 갖는다** — 즉 `/stabilize-milestone` 재실행 시 graduation이 `PENDING_ACCEPTANCE`에서 벗어난다.
```

### 4.1.12 R6 최종 출력에서 「재validate 필요 task 목록」을 걷어낸다

**앵커**: `   - **재validate 필요 task 목록 (의무)**: 이번 라운드에 `## 8`을 갱신한(receipt 발급 또는 무효화) 모든 task를 나열하고`

**현재 (줄 전체)**
```
   - **재validate 필요 task 목록 (의무)**: 이번 라운드에 `## 8`을 갱신한(receipt 발급 또는 무효화) 모든 task를 나열하고 **`/validate-workitem <task-id>` 재실행이 선행돼야 졸업 판정이 유효함**을 명시한다. 졸업 item 4는 report를 읽고 report의 유일한 writer는 `/validate-workitem`이며 stale report는 미충족 처리되므로(ADR-067 D1 item 4 (d)), 이 재실행 없이 stabilize를 돌리면 그 task가 미충족으로 나온다.
```
**바꿀 내용**
```
   - **receipt 처리 결과**: 발급한 task·AC 목록과 무효화(`- invalidated`)한 task·AC 목록. **receipt 발급만으로는 재validate가 필요 없다** — 졸업 item 4 (a')가 채점표가 아니라 task `## 8`을 직접 읽기 때문이다(ADR-067 D1). 본 skill은 코드를 고치지 않으므로 채점표를 stale하게 만들지도 않는다.
```

### 4.1.13 R6 「다음 단계」를 다시 쓴다

**앵커**: `     - 판정 = 승인: **⓪ `(수용)` 태그를 단 개선 항목이 1건 이상이면 먼저 `/repair-acceptance <M>`**`

**현재 (줄 전체)**
```
     - 판정 = 승인: **⓪ `(수용)` 태그를 단 개선 항목이 1건 이상이면 먼저 `/repair-acceptance <M>`** — 그 항목의 유일한 실행 경로이며(ADR-066 D5), 수리 후에는 그 skill 출력이 지시하는 순서를 따른다 → ① `## 8`을 갱신한 task가 있으면 그 task들 `/validate-workitem <task-id>` 재실행 → ② `/stabilize-milestone <M>` 재실행으로 졸업 판정 확정. **`(수용)` 태그 항목과 `## 8` 갱신이 모두 0건이고 코드 변경도 없었다면 ②만** 수행한다(생략은 이 조건에서만 허용).
```
**바꿀 내용**
```
     - 판정 = 승인: **① `(수용)` 태그를 단 개선 항목이 1건 이상이면 먼저 `/repair-acceptance <M>`** — 그 항목의 유일한 실행 경로이며(ADR-066 D5), 수리 후에는 그 skill 출력이 지시하는 순서를 따른다(코드를 고치므로 그 skill이 자기 루프 안에서 재validate·재finalize를 수행한다). → **② `/stabilize-milestone <M>` 재실행으로 졸업 판정 확정.** `(수용)` 태그 항목이 0건이면 **②만** 수행한다 — receipt 발급은 재validate를 요구하지 않는다(item 4 (a')가 task `## 8`을 직접 읽는다).
```

### 4.1.13-b 커밋 안내 목록에 ROADMAP.md를 넣는다

4.1.3·4.1.10이 이 skill을 ROADMAP `## Backlog`의 writer로 만드는데, 커밋 안내 목록에 그 파일이 없어 «계약 변경 등재가 미커밋으로 남는» 경로가 생긴다.

**앵커**: `   - **커밋 안내**: 본 skill이 갱신한 tracked 파일 목록(`

**현재 (줄 전체)**
```
   - **커밋 안내**: 본 skill이 갱신한 tracked 파일 목록(`QA_FINDINGS.md`·`DECISION_REGISTER.md`·`IMPROVEMENT_GUIDE.md`·마일스톤 문서·task 문서)을 나열하고 **사용자가 직접 커밋해야 함**을 명시한다. 미커밋으로 두면 후속 task의 `/finalize-workitem`이 그 파일을 범위 밖 변경으로 보고 `Needs Review`로 멈춘다.
```
**바꿀 내용**
```
   - **커밋 안내**: 본 skill이 갱신한 tracked 파일 목록(`QA_FINDINGS.md`·`docs/30-workitems/ROADMAP.md`(`## Backlog`)·`IMPROVEMENT_GUIDE.md`·마일스톤 문서·task 문서, 그리고 정본 문서 변경이 필요해 등재한 경우 `DECISION_REGISTER.md`)을 나열하고 **사용자가 직접 커밋해야 함**을 명시한다. 미커밋으로 두면 후속 task의 `/finalize-workitem`이 그 파일을 범위 밖 변경으로 보고 `Needs Review`로 멈춘다.
```

### 4.1.14 책임 경계에 한 줄 추가한다

**앵커**: `- 다른 마일스톤의 원장 항목을 건드리지 않는다.`

그 줄 **바로 뒤에** 아래 한 줄을 추가한다.

```
- **task를 재개방하지 않고 `/validate-workitem`·`/finalize-workitem`을 호출하지 않는다** — 본 skill은 receipt만 남기고 판정 갱신은 `/stabilize-milestone`이 한다.
```

### 4.1.15 정책 근거를 갱신한다

**앵커**: `정책 근거: [ADR-066](../../../docs/90-decisions/boilerplate/ADR-066-milestone-acceptance.md) (단계·라우팅·세션 파일)`

**현재 (줄 전체)**
```
정책 근거: [ADR-066](../../../docs/90-decisions/boilerplate/ADR-066-milestone-acceptance.md) (단계·라우팅·세션 파일), [ADR-065](../../../docs/90-decisions/boilerplate/ADR-065-ac-verification-contract.md) D3 (receipt), [ADR-067](../../../docs/90-decisions/boilerplate/ADR-067-milestone-graduation-v2.md) D6 (졸업과의 관계), [ADR-060](../../../docs/90-decisions/boilerplate/ADR-060-decision-closure-and-milestone-seal.md) D11 (봉인 후 결정 등재).
```
**바꿀 내용**
```
정책 근거: [ADR-066](../../../docs/90-decisions/boilerplate/ADR-066-milestone-acceptance.md) D1/D2/D3 (단일 스코프·라우팅·세션 파일), [ADR-065](../../../docs/90-decisions/boilerplate/ADR-065-ac-verification-contract.md) D1/D3 (receipt authority·형식), [ADR-067](../../../docs/90-decisions/boilerplate/ADR-067-milestone-graduation-v2.md) D1 item 4 (a')·D3 `PENDING_ACCEPTANCE`·D6 (졸업과의 관계), [ADR-005](../../../docs/90-decisions/boilerplate/ADR-005-ssot.md)#amend-1 (원장 배타 범위 — 계약 변경은 ROADMAP `## Backlog`), [ADR-060](../../../docs/90-decisions/boilerplate/ADR-060-decision-closure-and-milestone-seal.md) D11 (봉인 후 결정 등재).
```

---

## 4.2 `/repair-acceptance`

파일: `.claude/skills/repair-acceptance/SKILL.md`

이 skill의 성격은 `/repair-milestone`과 다르다 — **사용자가 직접 만져 보고 낸 결함**이라, 기존 task가 다루지 않은 범위나 계약과 어긋나는 요구가 섞여 들어온다. 그래서 «in-AC인가 out-of-AC인가»를 먼저 가르고, 그에 따라 재개방 여부가 갈린다.

### 4.2.1 도입 2줄을 다시 쓴다

**앵커**: `이 skill은 `/accept-milestone`이 남긴 **사용자 관측 finding**을 수리한다. 코드 수정이 허용된다.`

**현재 (그 줄과 다음 줄 — 2줄)**
```
이 skill은 `/accept-milestone`이 남긴 **사용자 관측 finding**을 수리한다. 코드 수정이 허용된다.
**커밋하지 않고, workitem status를 바꾸지 않으며, 기존 task를 재개방하지 않는다.**
```
**바꿀 내용 (2줄을 통째로 교체)**
```
이 skill은 `/accept-milestone`이 남긴 **사용자 관측 finding**을 수리한다. 코드 수정이 허용된다.
**커밋하지 않는다.** task 재개방은 **finding이 기존 AC 안(in-AC)인지 밖(out-of-AC)인지에 따라 갈린다** — 아래 「재개방 판별」이 SSOT다. 재개방이 필요한 항목은 본 skill이 직접 status를 쓰지 않고 `/repair-workitem`에 위임한다(ADR-057#amend-3 결정 5 — task status writer는 `/repair-workitem` 하나다).
```

### 4.2.2 「재개방 판별」 절을 신설한다

**앵커**: `## 3+1 판정 (수정 *전* 1회)`

이 헤딩 **바로 앞에** 아래 블록을 삽입한다.

~~~
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
~~~

### 4.2.3 3+1 판정의 `Out-of-contract` 목적지를 바꾼다

**앵커**: `- **Out-of-contract** — 결함이 아니라 계약 변경(이번 마일스톤이 약속하지 않은 것).`

**현재 (줄 전체)**
```
- **Out-of-contract** — 결함이 아니라 계약 변경(이번 마일스톤이 약속하지 않은 것). **사용자 확인 후** `DECISION_REGISTER.md`에 `status: open` + `- 발견: 수용 라운드 (M<N>)`으로 등재하고 다음 마일스톤 후보로 남긴다. 코드를 고치지 않는다.
```
**바꿀 내용**
```
- **Out-of-contract** — 결함이 아니라 계약 변경(이번 마일스톤이 약속하지 않은 것이고 이번에 고치지도 않는다). **사용자 확인 후** `docs/30-workitems/ROADMAP.md`의 `## Backlog`에 `- `<candidate-key>` <한 줄 요약> — 출처: 수용 라운드 M<N> r<라운드> / 확신도: <높음/중간/낮음>`로 등재하고 다음 마일스톤 후보로 남긴다. 코드를 고치지 않는다. **정본 문서(charter·ARCH·DESIGN)의 한 절을 고쳐야 성립하는 항목만** `DECISION_REGISTER.md`에 등재한다(ADR-005#amend-1 배타 범위 — 한 항목을 양쪽에 쓰지 않는다).
```

### 4.2.4 「수행 3」의 재개방 금지를 판별 결과에 종속시킨다

**앵커**: `3. **기존 task를 재개방하지 않는다** — task `## 0. Status`를 건드리지 않고,`

**현재 (줄 전체)**
```
3. **기존 task를 재개방하지 않는다** — task `## 0. Status`를 건드리지 않고, `## 6 AC`·`## 3`·`## 6-1` 계획 본문도 고치지 않는다(잠긴 계약이다). **task 문서에 쓰는 것은 `## 8`의 append 2종뿐이다**(아래 4·5의 `- invalidated`·`- pattern-scan`). task 문서 밖 산출물은 각 단계가 따로 규정한다 — 코드(1·2), report 삭제(4-A), 3원장 status(8), decision log(7), 원장 등재(`Out-of-contract`).
```
**바꿀 내용**
```
3. **`in-AC` 항목은 `/repair-workitem <T-NNN> "<finding 요약>"`에 위임한다**(본 skill이 직접 고치지 않는다 — 그 skill이 재개방·4-판정·`## 8` 기록·status 전이를 소유한다). **`out-of-AC` 항목만 본 skill이 직접 고친다.** 어느 쪽이든 본 skill은 task `## 0. Status`를 직접 쓰지 않고, `## 6 AC`·`## 3`·`## 6-1` 계획 본문도 고치지 않는다(잠긴 계약이다). **본 skill이 task 문서에 쓰는 것은 `## 8`의 append 2종뿐이다**(아래 4·5의 `- invalidated`·`- pattern-scan`). task 문서 밖 산출물은 각 단계가 따로 규정한다 — 코드(out-of-AC 한정, 1·2), 채점표 삭제(4-A), 원장 status(8), decision log(7), 계약 변경 등재(`Out-of-contract`).
   - **순서 규칙 (중요)**: `in-AC` 위임과 그 뒤의 「수행 후 연쇄」 ①은 **`out-of-AC` 직접 수정·4·4-A·5·5-E·5-V·7·8·9보다 먼저** 수행한다. 그 순서를 지키면 `/finalize-workitem` 시점의 working tree에 **그 task의 변경만** 남아 그 skill 수행 5-(4)의 범위 비교를 통과한다. 반대로 `out-of-AC` 수정과 원장 쓰기를 먼저 하면 그 파일들이 task `## 4-1` 밖 변경으로 보여 finalize가 `Needs Review`로 멈춘다(본 skill 마지막 출력의 커밋 안내가 경고하는 그 상태다).
```

### 4.2.5 「수행 2」 회귀 테스트에 Green 확인을 넣는다

**앵커**: `2. **회귀 테스트 선행 (ADR-066 D4)**: 각 항목마다 **그 결함을 재현하는 실패 테스트를 먼저 추가해 실패를 관측한 뒤** 고친다. 관측 결과를 결정 이력에 1줄 남긴다.`

**바꿀 내용**
```
2. **회귀 테스트 선행 (ADR-066 D4)**: 각 항목마다 **그 결함을 재현하는 실패 테스트를 먼저 추가해 실패를 관측한 뒤**(Red) 고치고 **그 테스트가 통과하는 것까지 확인한다**(Green). Red·Green 두 관측 결과를 결정 이력에 1줄로 남긴다 — Red만 적고 Green을 확인하지 않으면 «고쳤다고 적었지만 안 고쳐진» 항목이 통과한다.
```

### 4.2.6 실행 증거 갱신과 자체 검증을 추가한다

**앵커**: `6. **한 라운드에 P0/P1/P2를 모두 판정으로 완결한다**(defer 금지).`

이 줄 **바로 앞에** 아래 두 블록을 삽입한다(`5-E` 먼저, 그 다음 `5-V`).

```
5-E. **실행 증거 갱신 (ADR-064 D4 — 외부 경계 코드를 고쳤을 때만)**: 본 라운드의 `Adopt`/`Adopt-modified` 수정이 (a) 영속 저장소 쓰기 · (b) 외부 네트워크 호출 · (c) 실행 진입점 코드를 건드렸으면, **그 경계의 실행 증거를 다시 확보하고 그 task `## 8`에 `- exec-evidence` 줄을 새로 append한다**(기존 줄은 지우지 않는다 — 이력이다). 증거 등급·안전 규정·waiver 규정은 `/implement-workitem` 6-E와 동일하다. 확보하지 못하면 `Needs Execution Evidence: <경계 종류> — <사유>`를 출력에 남긴다.
   - **`scope: in-AC` 항목은 여기서 하지 않는다** — 위임받은 `/repair-workitem`의 2-E가 같은 일을 하므로 중복이다. **`scope: out-of-AC`로 본 skill이 직접 고친 항목만** 대상이다.
   - 등급 1 증거로 새 파일을 만들었어도 **task `## 4-1`은 건드리지 않는다**(계획 본문 불가침 — 본 skill의 책임 경계). 그 경로는 `## 5. Repair decision log` 항목에 적는다.
```

```
5-V. **자체 검증 — 즉시 파손 감지 (실행 순서상 「수행 후 연쇄」 ① 다음, ② *앞*이다)**: 위 1~5-E를 마친 뒤 1회 수행한다. **①(재개방 task 연쇄)은 이 시점에 이미 끝나 있고, ②(`out-of-AC` 영향 task 재validate)는 아직 돌리지 않은 상태다** — 본 단계가 무언가를 고치면 ②가 만들 채점표가 곧바로 stale이 되기 때문이다. 내용은 둘이다: (i) 본 라운드에 추가한 회귀 테스트가 전부 Green인지 확인하고, (ii) 통합 검증 명령이 `--changed`를 지원하면 `validate --changed`를(미지원이면 통합 `validate`를) 1회 실행한다. **이것은 전체 검증이 아니다** — 「방금 한 수정이 즉시 깨졌는가」만 본다.
   - **고치는 대상은 본 라운드 수정이 만든 실패로 한정한다.** baseline은 직전 `/stabilize-milestone` 단계 3의 통합 validate 결과다(같은 메인 세션이면 컨텍스트에 있고, 없으면 본 라운드 시작 시 1회 실행해 잡는다). baseline에 이미 있던 실패는 고치지 않고 출력에 명시한다.
   - 실패를 고치면 다시 실행한다. **최대 3회.** 초과하면 `Needs Follow-up: <실패 목록>`으로 명시하고 종료한다.
   - 통합 명령이 없으면 (ii)를 skip하고 사유를 출력에 남긴다(별도 hardstop 없음).
```

### 4.2.7 「수행 후 연쇄」 절을 신설한다

**앵커**: `책임 경계:` (이 파일에서 유일하다)

이 줄 **바로 앞에** 아래 블록을 삽입한다.

~~~
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
~~~

### 4.2.8 `allowed-tools`에 `Skill`을 추가한다

**앵커**: `allowed-tools: Read Glob Grep Write Edit Bash` (이 파일의 frontmatter 안)

**바꿀 내용**
```
allowed-tools: Read Glob Grep Write Edit Bash Skill
```

**왜 필요한가**: 4.2.7의 연쇄가 `/repair-workitem`·`/validate-workitem`·`/finalize-workitem`을 호출한다. `Skill`이 없으면 그 호출이 «권장 문구»로만 나가고 사용자가 손으로 돌려야 한다.

### 4.2.9 「수행 7」 결정 이력에 `scope` 필드를 넣는다

**앵커**: `   ID 컨벤션은 `<milestone-id>-uat-<N>`이다.`

**현재 (줄 전체)**
```
   ID 컨벤션은 `<milestone-id>-uat-<N>`이다. **`affected: T-NNN`은 필수** — task 문서를 건드리지 않으므로 이 역참조가 "어느 task의 산출물을 나중에 누가 왜 고쳤는지"를 추적하는 유일한 경로다.
```
**바꿀 내용**
```
   ID 컨벤션은 `<milestone-id>-uat-<N>`이다. **`affected: T-NNN`은 필수** — task 계획 본문을 건드리지 않으므로 이 역참조가 "어느 task의 산출물을 나중에 누가 왜 고쳤는지"를 추적하는 유일한 경로다. **`scope: in-AC | out-of-AC`도 필수** — 재개방 여부가 그 값으로 갈렸으므로, 나중에 그 판단을 검증하려면 값이 남아 있어야 한다. `in-AC` 항목의 결정 근거는 `/repair-workitem`이 그 task `## 8`에 남기므로 **여기에는 «T-NNN으로 위임함» 한 줄 routing 기록만** 둔다(중복 기록 금지 — `/repair-milestone` `## 5` 규율과 동형).
```

### 4.2.10 마지막 출력을 갱신한다

**앵커**: `- 판정 카운트: Adopt M / Adopt-modified K / Needs User Clarification I / Out-of-contract J`

**바꿀 내용**
```
- 판정 카운트: Adopt M / Adopt-modified K / Needs User Clarification I / Out-of-contract J
- 재개방 판별: in-AC N건(위임한 task 목록) / out-of-AC M건(직접 수정)
```

**앵커**: `- `Out-of-contract` 항목 + 원장 등재 결과(있으면)`

**바꿀 내용**
```
- `Out-of-contract` 항목 + ROADMAP `## Backlog` 등재 결과(있으면) + 정본 문서 변경이 필요해 `DECISION_REGISTER`로 보낸 항목(있으면)
- 계약 부채 등재 (`## 4. 보류 항목`): out-of-AC 수정 N건 → `IMPROVEMENT_GUIDE.md` `## 4`에 등재한 ID 목록 / 해당없음
- 실행 증거 갱신 (ADR-064 D4): 갱신 N건(경계 종류) / 해당없음(외부 경계 코드 미수정) / `Needs Execution Evidence`
- 자체 검증 (즉시 파손 감지): pass / skip(사유) / `Needs Follow-up: <목록>`
```

### 4.2.11 「재validate 필요 task 목록」과 후속 권장을 연쇄 결과 보고로 바꾼다

**앵커**: `- **재validate 필요 task 목록 (의무)**: 본 라운드가 코드를 고친 task와 `- invalidated`를 append한 task 전부를 나열하고`

**현재 (그 줄과 다음 줄 — 2줄)**
```
- **재validate 필요 task 목록 (의무)**: 본 라운드가 코드를 고친 task와 `- invalidated`를 append한 task 전부를 나열하고 **각 task `/validate-workitem <task-id>` 재실행이 선행돼야 졸업 판정이 유효함**을 명시한다. 졸업 item 4 (d)가 report staleness를 보므로, 재실행 없이 stabilize를 돌리면 그 task는 미충족으로 나온다(반대로 이 항이 없으면 낡은 `Pass` report로 졸업하는 경로가 열린다).
- 후속 권장 (순서 고정): ① 위 목록의 task별 `/validate-workitem <task-id>` 재실행 → ② `/accept-milestone <M>` 재실행(사용자 재확인 — 무효화된 관측 AC의 receipt 재발급 포함) → ③ 그 다음은 `/accept-milestone`의 출력이 지시하는 순서를 따른다(**재발급으로 `## 8`이 또 바뀌므로 stabilize 전에 한 번 더 재validate가 필요하다**).
```
**바꿀 내용 (2줄을 통째로 교체)**
```
- **연쇄 실행 결과 (의무)**: 「수행 후 연쇄」에서 실행한 task별 결과를 표로 남긴다 — `<T-NNN> | scope(in-AC / out-of-AC) | 실행한 skill | 최종 판정 | status`. **`in-AC`는 repair+validate+finalize를, `out-of-AC`는 validate만 실행하며 `out-of-AC`의 status는 `done` 유지다**(재개방되지 않았으므로 마감 대상이 아니다 — finalize 미실행을 «미실행(불요)»으로 적는다). **사용자에게 재실행을 미루지 않는다.** 2회로도 `Needs Fix`인 task, 또는 정상 마감이 아닌 종료값이 나온 task는 `미해결 (<종료값>)`로 명시하고 복구 명령을 함께 적는다.
- 후속 권장 (순서 고정): ① `미해결` task가 있으면 그것부터 해소 → ② `- invalidated`가 1건 이상이면 `/accept-milestone <M>` 재실행(무효화된 관측 AC의 receipt 재발급) → ③ `/stabilize-milestone <M>` 재실행으로 졸업 판정 확정. **receipt 재발급 자체는 재validate를 유발하지 않는다**(item 4 (a')가 task `## 8`을 직접 읽는다).
```

### 4.2.12 정책 근거를 갱신한다

**앵커**: `정책 근거: [ADR-066](../../../docs/90-decisions/boilerplate/ADR-066-milestone-acceptance.md) D4/D5,`

**현재 (줄 전체)**
```
정책 근거: [ADR-066](../../../docs/90-decisions/boilerplate/ADR-066-milestone-acceptance.md) D4/D5, [ADR-065](../../../docs/90-decisions/boilerplate/ADR-065-ac-verification-contract.md) D3, [ADR-047](../../../docs/90-decisions/boilerplate/ADR-047-code-as-agent-harness.md) D7, [ADR-060](../../../docs/90-decisions/boilerplate/ADR-060-decision-closure-and-milestone-seal.md) D11.
```
**바꿀 내용**
```
정책 근거: [ADR-066](../../../docs/90-decisions/boilerplate/ADR-066-milestone-acceptance.md) D2/D4/D5 (라우팅·판정·경계), [ADR-065](../../../docs/90-decisions/boilerplate/ADR-065-ac-verification-contract.md) D3 (receipt 형식·판독), [ADR-057](../../../docs/90-decisions/boilerplate/ADR-057-planning-v2-batch-and-seam.md)#amend-3 결정 5 (task status writer 고정 — 재개방 위임 근거), [ADR-047](../../../docs/90-decisions/boilerplate/ADR-047-code-as-agent-harness.md) D7 (결정 이력 영속·commit owner), [ADR-005](../../../docs/90-decisions/boilerplate/ADR-005-ssot.md)#amend-1 (원장 배타 범위), [ADR-060](../../../docs/90-decisions/boilerplate/ADR-060-decision-closure-and-milestone-seal.md) D11.
```

### 4.2.13 커밋 소유권 경계를 명시한다 (frontmatter · 책임 경계 · 커밋 안내)

4.2.7의 연쇄는 그 라운드 안에서 커밋이 일어나게 만든다. 기존 문장들은 «커밋하지 않는다»·«기존 task를 재개방하지 않는다»를 무조건으로 선언하므로, 그대로 두면 같은 파일 안에서 정면 충돌한다. 세 자리를 고쳐 경계를 명시한다.

**앵커**: `description: /accept-milestone이 수집한 사용자 수용 finding을 3+1 판정으로 수리한다. 기존 task를 재개방하지 않고 코드만 고친다. 커밋 없음 (ADR-066 D4).`

**바꿀 내용**
```
description: /accept-milestone이 수집한 사용자 수용 finding을 3+1 판정으로 수리한다. in-AC는 /repair-workitem에 위임(재개방), out-of-AC는 재개방 없이 직접 수정. 본 skill은 커밋하지 않는다 (ADR-066 D4).
```

**앵커**: `- 자동 커밋하지 않는다 — commit owner는 사용자다(ADR-047 D7).`

**바꿀 내용**
```
- 자동 커밋하지 않는다 — 본 skill은 `git commit`을 실행하지 않는다(ADR-047 D7). 「수행 후 연쇄」 ①의 `/finalize-workitem`이 커밋하지만 그것이 커밋하는 것은 **그 task의 `## 4-1` 파일 + task 문서**뿐이며, **`out-of-AC` 수정 파일과 원장 갱신은 여전히 사용자가 커밋한다.** commit owner는 «task 마감분 = finalize / 그 밖 전부 = 사용자»로 갈린다.
```

**앵커**: `- **커밋 안내**: 본 skill은 커밋하지 않는다 — 위 수정 파일과 문서를 **사용자가 직접 커밋한 뒤** 다음 단계로 진행한다.`

**현재 (줄 전체)**
```
- **커밋 안내**: 본 skill은 커밋하지 않는다 — 위 수정 파일과 문서를 **사용자가 직접 커밋한 뒤** 다음 단계로 진행한다. 미커밋으로 두면 후속 `/finalize-workitem`이 범위 밖 변경으로 보고 `Needs Review`로 멈춘다.
```
**바꿀 내용**
```
- **커밋 안내**: 본 skill은 커밋하지 않는다 — `out-of-AC` 수정 파일과 원장 갱신을 **사용자가 직접 커밋한 뒤** 다음 단계로 진행한다. **「수행 후 연쇄」 ①이 마감한 `in-AC` task의 파일은 그 `/finalize-workitem`이 이미 커밋했으므로 여기 목록에 없다.** 그 잔여분을 미커밋으로 두면 이후 다른 task의 `/finalize-workitem`이 범위 밖 변경으로 보고 `Needs Review`로 멈춘다(연쇄 ①을 `out-of-AC` 수정보다 먼저 도는 이유가 그것이다).
```

### 4.2.14 ⭐ 수행 2·4·4-A·5를 `out-of-AC` 전용으로 좁힌다

**4.2.4가 «in-AC는 위임, out-of-AC만 직접 고친다»로 갈라놓지만, 그 앞뒤 단계들은 여전히 «각 항목마다»로 쓰여 있어 위임분까지 본 skill이 처리하게 된다.** 4.2.6의 5-E는 그 예외를 명시하는데(«`scope: in-AC` 항목은 여기서 하지 않는다») **수행 2·4·5에는 같은 문장이 없다** — `/repair-milestone`의 2-R(4.3.9)·2-P(4.3.4)는 둘 다 갖고 있으므로 이 skill만 빠진 것이다.

**빠뜨리면 연쇄가 첫 task에서 죽는다**: 수행 2가 위임분의 테스트 파일까지 쓰면 그 변경이 그 task `## 4-1` 밖에 남아 연쇄 ①의 `/finalize-workitem`이 수행 5-(4)에서 `Needs Review`로 멈춘다 — 4.2.4의 순서 규칙이 막으려던 바로 그 상태다. 수행 4·5는 연쇄 ①이 **이미 커밋한** task 문서에 사후 append를 만들어 미커밋 변경을 남긴다.

**앵커**: `   - 테스트 작성이 불가능하면(사람 관측만으로 판정되는 시각 결함 등) 그 사유를 적고`

그 줄 **바로 뒤에** 아래 하위 불릿을 추가한다(같은 들여쓰기 3칸).

```
   - **`scope: in-AC` 위임분은 여기서 하지 않는다** — 위임받은 `/repair-workitem`이 자기 규율로 수정과 테스트를 처리한다(중복 금지). **`scope: out-of-AC`로 본 skill이 직접 고치는 항목만** 대상이다. 위임분의 테스트를 본 skill이 쓰면 그 파일이 그 task `## 4-1` 밖 변경으로 남아 「수행 후 연쇄」 ①의 `/finalize-workitem`이 수행 5-(4)에서 `Needs Review`로 멈춘다.
```

**앵커**: `를 append한다(기존 `- ac-acceptance`는 지우지 않는다). **새 receipt를 대신 쓰지 않는다.**`

**교체 대상**: 수행 4 줄의 **끝 조각만** 바꾼다.

**현재 (조각)**
```
를 append한다(기존 `- ac-acceptance`는 지우지 않는다). **새 receipt를 대신 쓰지 않는다.**
```
**바꿀 내용 (조각)**
```
를 append한다(기존 `- ac-acceptance`는 지우지 않는다). **새 receipt를 대신 쓰지 않는다.** **`scope: in-AC` 위임분은 여기서 하지 않는다** — `/repair-workitem`도 무효화 writer이므로(ADR-065 D3) 중복이고, 그 task는 연쇄 ①이 이미 마감·커밋했으므로 사후 append가 미커밋 변경으로 남는다.
```

**앵커**: `4-A. **영향 task report 무효화 (ADR-067 D1 item 4 (d) 보완)**: 코드를 고친 각 task의`

**교체 대상**: 그 줄의 **머리 조각만** 바꾼다.

**현재 (조각)**
```
4-A. **영향 task report 무효화 (ADR-067 D1 item 4 (d) 보완)**: 코드를 고친 각 task의 `docs/40-validation/reports/<task-id>.md`를 **삭제한다**
```
**바꿀 내용 (조각)**
```
4-A. **영향 task report 무효화 (ADR-067 D1 item 4 (d) 보완)**: **본 skill이 `out-of-AC`로 직접 고친** 각 task의 `docs/40-validation/reports/<task-id>.md`를 **삭제한다**(`scope: in-AC` 위임분은 대상이 아니다 — 연쇄 ①의 `/validate-workitem`이 이미 새 채점표를 만들었으므로 여기서 지우면 그 결과를 버리고 ②가 헛돈다)
```

**앵커**: `5. **동일 패턴 전수 검색**: 각 Adopt 결함에 대해`

**현재 (줄 전체)**
```
5. **동일 패턴 전수 검색**: 각 Adopt 결함에 대해 같은 패턴의 다른 출현을 저장소 전체에서 **읽기 전용**으로 검색하고, 대상 task `## 8`에 `- pattern-scan <날짜> <패턴>: 범위 내 N건 수정 / 범위 밖 M건 <경로>`를 append한다. 범위 밖은 고치지 않고 `/repair-milestone` 또는 다음 마일스톤으로 라우팅한다.
```
**바꿀 내용**
```
5. **동일 패턴 전수 검색 (ADR-066 D6)**: **본 skill이 `out-of-AC`로 직접 고친** 각 Adopt 결함에 대해 같은 패턴의 다른 출현을 저장소 전체에서 **읽기 전용**으로 검색하고, 대상 task `## 8`에 `- pattern-scan <날짜> <패턴>: 범위 내 N건 수정 / 범위 밖 M건 <경로>`를 append한다. 범위 밖은 고치지 않고 `/repair-milestone` 또는 다음 마일스톤으로 라우팅한다. **`scope: in-AC` 위임분은 여기서 하지 않는다** — `/repair-workitem` 2-H가 같은 검색을 하므로 중복이고, 그 task는 연쇄 ①이 이미 마감·커밋했다.
```

> **수행 1은 건드리지 않는다** — «Adopt/Adopt-modified 항목을 우선순위 순으로 **처리**한다»는 우산 문장이고, 그 «처리»의 갈림은 수행 3이 규정한다. 여기에 또 스코프를 붙이면 같은 규칙이 두 곳에 생긴다.

### 4.2.15 `Out-of-contract` 재분류 앵커와 결정 이력 예시를 새 계약에 맞춘다

4.2.3이 `Out-of-contract`의 목적지를 `ROADMAP ## Backlog`(기본) + `DECISION_REGISTER`(정본 문서 예외)로 갈랐는데 **수행 8의 재분류 앵커가 옛 목적지에 고정돼 있다.** 앵커가 실제 등재처와 어긋나면 [ADR-005](../../../docs/90-decisions/boilerplate/ADR-005-ssot.md)#amend-1의 비중복 불변식 **N-3**(«이동한 항목의 원본에 목적지 앵커를 남긴다 … 목적지가 로드맵이면 구간까지 적는다»)이 깨진다.

**앵커**: `③ `Out-of-contract`로 재분류한 항목 → 원본을 `status: resolved (재분류: DECISION_REGISTER D-NNN — 다음 M)`로 닫고`

**교체 대상**: 수행 8 줄의 **③ 조각만** 바꾼다.

**현재 (조각)**
```
③ `Out-of-contract`로 재분류한 항목 → 원본을 `status: resolved (재분류: DECISION_REGISTER D-NNN — 다음 M)`로 닫고 원장 등재와 짝을 맞춘다
```
**바꿀 내용 (조각)**
```
③ `Out-of-contract`로 재분류한 항목 → 원본을 **실제 목적지로** 닫는다 — 기본은 `status: resolved (재분류: ROADMAP ## Backlog <candidate-key> — 다음 M)`이고, 정본 문서 변경이 필요해 원장으로 보낸 예외만 `status: resolved (재분류: DECISION_REGISTER D-NNN — 다음 M)`다. **앵커가 실제 등재처와 어긋나면 [ADR-005](../../../docs/90-decisions/boilerplate/ADR-005-ssot.md)#amend-1의 비중복 불변식 N-3이 깨진다**(목적지가 로드맵이면 구간까지 적는다)
```

이어서 **결정 이력 형식 예시에 `scope`를 넣는다.** 4.2.9가 `scope: in-AC | out-of-AC`를 **필수**로 만들었는데 바로 위 예시 줄에 그 칸이 없다 — 에이전트는 예시를 복사하므로 필수 필드가 조용히 빠진다.

**앵커**: `   - **M1-uat-1** | P0 | [관측됨] | linked: M1 | affected: T-004 | status: applied | decision: Adopt`

**바꿀 내용**
```
   - **M1-uat-1** | P0 | [관측됨] | linked: M1 | affected: T-004 | scope: out-of-AC | status: applied | decision: Adopt
```

---

## 4.3 `/repair-milestone`

파일: `.claude/skills/repair-milestone/SKILL.md`

### 4.3.1 ⭐ 재개방 루프를 닫는다 (가장 중요)

**이것이 «stabilize 단계에서 예전 task가 다시 열리고 사람이 손으로 validate·finalize를 돌리게 되는» 현상의 원인이다.** 현재 이 skill은 `/repair-workitem`에 위임해 task를 재개방시켜 놓고, 마지막 출력에서 `/stabilize-milestone` 재실행만 권한다. **그 사이의 `/validate-workitem`·`/finalize-workitem`이 아무 데도 없어서 사용자가 손으로 돌리게 된다.** 여기서 루프를 닫는다.

**⚠ 연쇄 설계의 두 제약 — 이걸 모르고 쓰면 연쇄가 통째로 헛돈다.** `/finalize-workitem`에는 문이 둘 있다.

| 문 | 위치 | 내용 | 연쇄에 주는 제약 |
|---|---|---|---|
| **1-G** | `finalize-workitem/SKILL.md` 반드시 먼저 할 일 1-G | `done`이면 **read-only no-op**(파일·git 무변경) | **`done`인 task에 finalize를 부르면 아무 일도 안 일어난다.** 부르면서 결과 표에 «마감»으로 적으면 거짓 신호다 → **재개방된 task에만 부른다** |
| **5-(4)** | 같은 파일 수행 5-(4) | task `## 4-1`과 git 실제 변경이 어긋나면 `Needs Review`로 즉시 종료 | 본 skill의 cross-cutting 수정·원장 쓰기가 미커밋으로 tree에 쌓인 뒤 finalize를 부르면 **거의 확정적으로 멈춘다** → **per-task 연쇄를 그 수정들보다 *먼저* 돈다** |

아래 두 편집이 그 제약을 배선한다.

**(1) 수행 2의 per-task 라우팅에 순서 규칙을 붙인다**

**앵커**: `   - **per-task 결함** (특정 `T-NNN`에 귀속되는 코드/AC 결함): 직접 고치지 말고`

그 불릿의 **끝에** 아래 문장을 이어 붙인다(새 불릿을 만들지 않는다).

```
 **순서 규칙 (중요)**: per-task 위임과 그 뒤의 2-C 연쇄 ①은 **본 skill 자신의 cross-cutting 직접 수정·2-P·2-R·2-E·2-A·2-B·2-V·수행 4·5·6보다 먼저** 수행한다. 그 순서를 지키면 `/finalize-workitem` 시점의 working tree에 **그 task의 변경만** 남아 수행 5-(4)의 범위 비교를 통과한다. 반대로 cross-cutting 수정과 원장 쓰기를 먼저 하면 그 파일들이 task `## 4-1` 밖 변경으로 보여 finalize가 `Needs Review`로 멈춘다(본 skill 마지막 출력의 커밋 안내가 경고하는 그 상태다).
```

**(2) 2-C를 삽입한다**

**앵커**: `2-B. **AC acceptance 무효화 (ADR-065 D3 — writer 3종 중 하나)**`

이 항목(한 줄이다) **바로 뒤에** 아래 블록을 삽입한다.

~~~
2-C. **위임 후 연쇄 — 재개방한 task를 본 skill이 닫는다 (사용자에게 미루지 않는다)**: 수행 2의 per-task 위임은 그 task를 `in-progress`로 재개방하고, 2-A의 채점표 삭제는 다른 task의 채점표를 없앤다. **두 상태를 남긴 채 끝내지 않는다.** 단 **두 경우의 처방이 다르다** — 재개방된 task는 다시 `done`으로 마감해야 하지만, 채점표만 없어진 task는 계속 `done`이므로 마감할 것이 없다.

   - **① 재개방된 task (per-task 위임분) — validate + finalize.** 수행 2에서 위임한 각 `T-NNN`에 대해, **그 `/repair-workitem` 호출이 끝난 직후** `/validate-workitem <T-NNN>` → 판정이 `Pass`·`Pending Acceptance`면 `/finalize-workitem <T-NNN>` 을 순서대로 실행한다(여기서 `/repair-workitem`을 **다시** 부르지 않는다 — 수행 2가 이미 불렀다). **이 ①은 위 「순서 규칙」대로 cross-cutting 수정·원장 쓰기보다 먼저, task 한 개씩 순차로** 돈다(한 task를 finalize가 커밋해 tree가 다시 깨끗해진 뒤 다음 task로 간다).
     - `Needs Fix`면 `/repair-workitem <T-NNN>`을 한 번 더 보내고 **다시 `/validate-workitem <T-NNN>` → 판정이 `Pass`·`Pending Acceptance`면 `/finalize-workitem <T-NNN>`** 까지 같은 순서로 끝까지 돈다 — **`/repair-workitem` 호출은 task당 최대 2회**. **2회째 validate도 `Needs Fix`면** 그 task를 `미해결 (Needs Fix ×2)`로 명시하고 다음 task로 넘어간다(무한 루프 금지). **2회째가 통과했는데 finalize를 부르지 않으면 그 task가 `in-progress`로 남아 졸업 item 1이 미충족이 된다** — 2-C가 존재하는 이유가 그것이다.
     - **정상 마감도 `Needs Fix`도 아닌 종료값(`Needs Validation`·`Needs Review`·`Needs Rationale`·`Needs Stack Guard`)이 나오면 그 task를 `미해결 (<종료값>)`로 명시하고, 사용자가 그대로 칠 수 있는 복구 명령을 함께 출력한다** — 조용히 멈추지 않는다. `Needs Review`(범위 비교 불일치)의 복구 안내는 «tree의 무관 변경을 커밋하거나 그 task `## 4-1`을 보강한 뒤 `/finalize-workitem <T-NNN>` 재실행»이다.
   - **② 채점표만 삭제된 task (2-A의 영향 task) — validate만. 그리고 2-V(자체 검증)를 마친 뒤에 돈다.** `/repair-workitem`도 `/finalize-workitem`도 부르지 않고 **`/validate-workitem <T-NNN>` 하나만** 실행한다. **2-V가 무언가를 고치면 ②가 방금 만든 채점표가 다시 stale이 되므로 ②는 반드시 2-V 다음이다** — 즉 이 라운드의 실행 순서는 «① → cross-cutting 수정·2-P·2-R·2-E·2-A·2-B → 2-V → ②»다. 고칠 것은 본 skill이 이미 고쳤고, **그 task는 재개방되지 않아 계속 `done`이므로 마감할 것이 없다** — finalize를 부르면 1-G의 read-only no-op에 걸려 아무 일도 안 하면서 «마감»으로 보이는 거짓 신호만 남는다. 졸업 item 4가 요구하는 것은 **새 채점표**이며 그것은 재validate가 만든다.
     - 재validate 결과의 채점표에 cross-cutting 수정 줄이 `추적 불가`로 잡혀 `P1` 라벨이 붙을 수 있다. **정상이며 차단이 아니다** — diff-trace audit에서 `Needs Fix` 트리거는 (c) pre-existing dead code 삭제 하나뿐이다. 그 라벨은 출력에 한 줄 요약만 남긴다.
   - **③ 2-B로 `- invalidated`만 append한 task**는 이 연쇄 대상이 아니다 — 졸업 item 4 (a')가 task `## 8`을 직접 읽으므로 재validate 없이도 무효화가 반영된다. receipt 재발급은 다음 `/accept-milestone <M>` 라운드가 담당한다.
   - **④ 커밋 경계는 그대로다 (ADR-047 D7 / ADR-052 D4).** 본 연쇄에서 커밋이 일어나는 유일한 자리는 ①의 `/finalize-workitem`이고, 그것이 커밋하는 것은 **그 task의 `## 4-1` 파일 + 그 task 문서**뿐이다. **본 skill의 cross-cutting 수정 파일·원장 갱신은 여전히 사용자가 커밋한다** — 본 skill이 스스로 커밋하지 않는다는 계약은 유지된다.
   - **Codex**: 병렬 위임 parity가 없다 → task를 한 개씩 순차로 같은 연쇄를 돈다(①은 애초에 순차이므로 차이는 없다). `Skill` 도구가 없는 환경에서는 각 skill의 `SKILL.md`를 읽어 그 절차를 같은 순서로 직접 수행한다.
~~~

### 4.3.2 `allowed-tools`에 `Skill`을 추가한다

**앵커**: `allowed-tools: Read Glob Grep Write Edit Bash Agent`

**바꿀 내용**
```
allowed-tools: Read Glob Grep Write Edit Bash Agent Skill
```

**왜 필요한가**: 4.3.1의 연쇄가 다른 skill을 호출한다. `Skill`이 없으면 그 호출이 실행되지 않고 **루프가 다시 열린 채로 끝난다** — 이 한 줄을 빠뜨리면 4.3.1이 무효다.

### 4.3.3 자체 검증 단계를 추가한다

**앵커**: `3. **한 라운드에 P0/P1/P2를 *모두* 4-판정으로 완결**한다(repair-plan/repair-workitem과 동형).`

이 줄 **바로 앞에** 아래 블록을 삽입한다.

```
2-V. **자체 검증 — 즉시 파손 감지 (실행 순서상 2-C ① 다음, 2-C ② *앞*이다)**: 위 2의 cross-cutting 직접 수정·2-P·2-R·2-E·2-A·2-B를 마친 뒤 1회 수행한다. **2-C ①(재개방 task 연쇄)은 이 시점에 이미 끝나 있고, 2-C ②(채점표 삭제 task 재validate)는 아직 돌리지 않은 상태다** — 본 단계가 무언가를 고치면 ②가 만들 채점표가 곧바로 stale이 되기 때문이다. 내용은 둘이다: (i) 본 라운드에 추가한 회귀 테스트가 전부 Green인지 확인하고, (ii) 통합 검증 명령이 `--changed`를 지원하면 `validate --changed`를(미지원이면 통합 `validate`를) 1회 실행한다. **이것은 전체 검증이 아니다** — 「방금 한 수정이 즉시 깨졌는가」만 본다. e2e·qa 팬아웃·문서 정합·졸업 판정은 `/stabilize-milestone` 책임이다.
   - **고치는 대상은 본 라운드 수정이 만든 실패로 한정한다.** baseline은 직전 `/stabilize-milestone` 단계 3의 통합 validate 결과다(같은 메인 세션이면 컨텍스트에 있고, 없으면 본 라운드 시작 시 1회 실행해 잡는다). baseline에 이미 있던 실패는 고치지 않고 출력에 명시한다.
   - 실패를 고치면 다시 실행한다. **최대 3회.** 초과하면 `Needs Follow-up: <실패 목록>`으로 명시하고 종료한다.
   - 통합 명령이 없으면 (ii)를 skip하고 사유를 출력에 남긴다(별도 hardstop 없음).
```

### 4.3.4 cross-cutting 수정에 동일 패턴 전수 검색을 넣는다

**앵커**: `2-A. **영향 task report 무효화 (ADR-067 D1 item 4 (d) 보완)**`

이 항목 **바로 앞에** 아래 블록을 삽입한다.

```
2-P. **동일 패턴 전수 검색 (ADR-066 D6)**: 각 `Adopt` cross-cutting 결함에 대해 같은 패턴의 다른 출현을 저장소 전체에서 **읽기 전용**으로 검색한다. 마일스톤 범위 안이면 본 라운드에서 함께 고치고, 범위 밖이면 고치지 않고 `IMPROVEMENT_GUIDE.md`에 `P1 [Pattern-spread]` 항목으로 등재한다(반드시 먼저 할 일 3-1이 다음 라운드에 회수하는 그 항목이다). 검색 결과는 마지막 출력에 `범위 내 N건 수정 / 범위 밖 M건 <경로>`로 남긴다. **per-task 위임분의 패턴 검색은 `/repair-workitem` 2-H가 하므로 여기서 중복하지 않는다.**
```

### 4.3.5 결정 이력에 `affected` 필수를 넣는다

**앵커**: `   ID 컨벤션: `<milestone-id>-repair-<N>` (예: `M1-repair-1`, `M1-repair-2`)`

**현재 (줄 전체)**
```
   ID 컨벤션: `<milestone-id>-repair-<N>` (예: `M1-repair-1`, `M1-repair-2`) — milestone ID 그대로 prefix + `-repair-` + 본 라운드 시퀀스. `linked` 필드로 원본 milestone 역참조. **evidence label은 기본 `[관측됨]`** (finding 자체가 stabilize의 *로컬 문서/코드 관측*에서 나옴). per-task 위임 결과는 해당 task `## 8. 메모`에 `/repair-workitem`이 직접 append하므로 *여기 중복 기록 X* — 본 `## 5`에는 cross-cutting 결정과 "T-NNN으로 위임함" 한 줄 routing 기록만 둔다.
```
**바꿀 내용**
```
   ID 컨벤션: `<milestone-id>-repair-<N>` (예: `M1-repair-1`, `M1-repair-2`) — milestone ID 그대로 prefix + `-repair-` + 본 라운드 시퀀스. `linked` 필드로 원본 milestone 역참조. **evidence label은 기본 `[관측됨]`** (finding 자체가 stabilize의 *로컬 문서/코드 관측*에서 나옴). **cross-cutting 항목에는 `affected: T-NNN`(영향 task 목록, 없으면 `affected: —`)이 필수** — 본 skill은 task 계획 본문을 건드리지 않으므로 이 역참조가 "어느 task의 산출물을 나중에 누가 왜 고쳤는지"를 추적하는 유일한 경로다(`/repair-acceptance` 규율과 동형). per-task 위임 결과는 해당 task `## 8. 메모`에 `/repair-workitem`이 직접 append하므로 *여기 중복 기록 X* — 본 `## 5`에는 cross-cutting 결정과 "T-NNN으로 위임함" 한 줄 routing 기록만 둔다.
```

### 4.3.6 책임 경계와 커밋 안내에서 소유권 문장을 바로잡는다

**앵커**: `- workitem `## 0. Status` 를 변경하지 않는다 — status 소유권은 finalize/사용자에 유지(ADR-052 D4 — repair-milestone 는 코드만 수정, commit·status 미수행).`

**바꿀 내용**
```
- workitem `## 0. Status`를 **직접** 변경하지 않는다 — 재개방은 `/repair-workitem`이, 마감은 `/finalize-workitem`이 쓴다(ADR-057#amend-3 결정 5 — writer 고정). 본 skill은 2-C에서 그 둘을 **호출**할 뿐 status 줄을 스스로 편집하지 않는다.
- **커밋을 직접 하지 않는다 (ADR-052 D4 / ADR-047 D7 불변)** — 본 skill은 `git commit`을 실행하지 않는다. 2-C ①의 `/finalize-workitem`이 커밋하지만 그것이 커밋하는 것은 **그 task의 `## 4-1` 파일 + task 문서**뿐이며, **본 skill의 cross-cutting 수정 파일과 원장 갱신은 여전히 사용자가 커밋한다.** 즉 commit owner는 «task 마감분 = finalize / 그 밖 전부 = 사용자»로 갈리며, 본 skill이 스스로 커밋하는 경로는 없다.
```

**이 두 번째 불릿이 필요한 이유**: 4.3.1의 연쇄는 그 라운드 안에서 커밋이 일어나게 만든다. 기존 문장은 "commit·status 미수행"을 한 덩어리로 선언하므로, 그대로 두면 «커밋하지 않는다»와 «finalize를 호출하라»가 같은 파일에서 충돌한다. 경계를 명시해 불변식을 깨지 않고 연쇄를 허용한다.

**앵커**: `- **커밋 안내**: cross-cutting 수정 파일은 repair-milestone 가 *커밋하지 않는다*(ADR-052 D4)`

**현재 (줄 전체)**
```
- **커밋 안내**: cross-cutting 수정 파일은 repair-milestone 가 *커밋하지 않는다*(ADR-052 D4) — 사용자가 직접 커밋한 뒤 다음 단계로 진행한다. *미커밋 상태로 두면* 후속 task 의 `/finalize-workitem` 이 그 파일을 task `## 4-1` 밖 변경으로 보고 `Needs Review` 로 멈춘다.
```
**바꿀 내용**
```
- **커밋 안내**: cross-cutting 수정 파일과 원장 갱신은 repair-milestone 가 *커밋하지 않는다*(ADR-052 D4) — 사용자가 직접 커밋한 뒤 다음 단계로 진행한다. **2-C ①이 마감한 재개방 task의 파일은 그 `/finalize-workitem`이 이미 커밋했으므로 여기 목록에 없다** — 남는 것은 cross-cutting 수정분과 원장뿐이다. *그 잔여분을 미커밋으로 두면* 이후 다른 task 의 `/finalize-workitem` 이 그 파일을 task `## 4-1` 밖 변경으로 보고 `Needs Review` 로 멈춘다(2-C ①이 cross-cutting 수정보다 먼저 도는 이유가 그것이다).
```

### 4.3.7 마지막 출력을 갱신한다

**앵커**: `- `/repair-workitem`으로 위임한 task 목록 (Codex 순차 degrade 여부 명시)`

**바꿀 내용**
```
- `/repair-workitem`으로 위임한 task 목록 (Codex 순차 degrade 여부 명시)
- **연쇄 실행 결과 (의무, 2-C)**: task별 `<T-NNN> | 경로(① 재개방 / ② 채점표삭제) | 실행한 skill | 최종 판정 | status` 표. **①은 validate+finalize를, ②는 validate만 실행하며 ②의 status는 `done` 유지다**(재개방되지 않았으므로 마감 대상이 아니다 — finalize를 부르지 않았다는 사실을 «미실행(불요)»으로 적는다). **사용자에게 재실행을 미루지 않는다.** 2회로도 `Needs Fix`인 task, 또는 정상 마감이 아닌 종료값이 나온 task는 `미해결 (<종료값>)`로 명시하고 복구 명령을 함께 적는다.
- 동일 패턴 전수 검색 (2-P): 범위 내 N건 수정 / 범위 밖 M건(경로 + `[Pattern-spread]` 등재 결과)
- 자체 검증 (즉시 파손 감지): pass / skip(사유) / `Needs Follow-up: <목록>`
```

**앵커**: `- 삭제한 report (ADR-067 D1 item 4 (d)): <task-id 목록> — 각 task `/validate-workitem` 재실행 필요 / 해당없음`

**바꿀 내용**
```
- 삭제한 채점표 (ADR-067 D1 item 4 (d)): <task-id 목록> — **재validate는 2-C가 이미 수행했다**(위 연쇄 실행 결과 표 참조) / 해당없음
```

**앵커**: `- AC acceptance 무효화 (ADR-065 D3): N건(AC-N 목록) / 해당없음 — **무효화가 1건 이상이면 순서는`

**현재 (줄 전체)**
```
- AC acceptance 무효화 (ADR-065 D3): N건(AC-N 목록) / 해당없음 — **무효화가 1건 이상이면 순서는 «각 task `/validate-workitem` 재실행 → 그 AC가 관측 receipt 대기로 남으면 `/accept-milestone --task <task-id>`로 receipt 재발급 → 다시 재validate → 그 뒤 stabilize»** 다(receipt 없이 stabilize를 돌리면 item 4 (a)가 그 task를 미충족으로 내어 라운드가 한 번 헛돈다)
```
**바꿀 내용**
```
- AC acceptance 무효화 (ADR-065 D3): N건(AC-N 목록) / 해당없음 — **무효화가 1건 이상이면 그 마일스톤의 graduation은 `PENDING_ACCEPTANCE`가 되므로 `/stabilize-milestone` 뒤에 `/accept-milestone <M>`으로 receipt를 재발급한다.** 재발급 자체는 재validate를 요구하지 않는다(item 4 (a')가 task `## 8`을 직접 읽는다).
```

**앵커**: `- 후속 권장 액션: `/stabilize-milestone <M-N>` 재실행 (수정 반영 후 재검증 → 졸업 가능 = YES면`

**현재 (줄 전체)**
```
- 후속 권장 액션: `/stabilize-milestone <M-N>` 재실행 (수정 반영 후 재검증 → 졸업 가능 = YES면 `/plan-milestone`로 새 마일스톤(M-(N+1))+feature 생성·확정 후 `/plan-workitem M-(N+1)`로 전체 계획)
```
**바꿀 내용**
```
- 후속 권장 액션 (순서 고정): ① `미해결` task가 있으면 그것부터 해소 → ② `/stabilize-milestone <M-N>` 재실행으로 졸업 판정 갱신 → ③ 판정이 `PENDING_ACCEPTANCE`면 `/accept-milestone <M-N>`, `YES`면 `/plan-milestone`로 다음 마일스톤(M-(N+1))+feature 생성·확정 후 `/plan-workitem M-(N+1)`로 전체 계획. **①~② 사이에 사용자가 손으로 돌려야 할 `/validate-workitem`·`/finalize-workitem`은 없다** — 2-C가 이미 수행했다.
```

### 4.3.8 정책 근거에 근거를 추가한다

**앵커**: `정책 근거: 비판적 재점검·전 severity 완결은 [ADR-050](../../../docs/90-decisions/boilerplate/ADR-050-main-session-lifecycle-skills.md) D3 / repair-workitem·repair-plan 대칭.`

그 줄의 **끝에** 아래 문장을 이어 붙인다.

```
 위임 후 연쇄(2-C)와 status writer 고정은 [ADR-057](../../../docs/90-decisions/boilerplate/ADR-057-planning-v2-batch-and-seam.md)#amend-3 결정 5. 동일 패턴 전수 검색(2-P)은 [ADR-066](../../../docs/90-decisions/boilerplate/ADR-066-milestone-acceptance.md) D6.
```

---

### 4.3.9 회귀 테스트 선행과 실행 증거 갱신을 추가한다

이 skill에는 **회귀 테스트 규정도 실행 증거 규정도 없다.** 회귀 테스트(Red→Green)는 `/repair-acceptance` 수행 2에 있고 정책은 ADR-066 D4가 소유하며, 실행 증거는 `/repair-workitem` 2-E에 있다 — **cross-cutting 직접 수정만 둘 다 빠져 있어** «테스트 없이 고치고 외부 경계 증거도 갱신하지 않는» 경로가 된다. 4.3.3의 2-V가 *"본 라운드에 추가한 회귀 테스트가 전부 Green인지"* 를 확인하라고 하는데 **추가하라는 규정 자체가 없으므로**, 이 단계가 없으면 2-V의 (i)가 항상 공회전한다.

> **알려진 비대칭 (이번 라운드 범위 밖)**: `/repair-workitem`에는 지금도 Red→Green 규정이 없다(2-E는 *실행 증거*이며 회귀 테스트가 아니다). 따라서 본 라운드 후 세 repair skill 중 둘만 회귀 테스트를 요구한다. 그 skill에 규정을 새로 넣는 것은 이번 개선 범위(수용 루프·원장)를 넘는 확장이므로 **여기서 하지 않는다** — ADR-009(TDD 기본)가 이미 구현 일반에 Red→Green을 요구하므로 공백이 아니라 «명시 부재»다. 다음 라운드 후보로 남긴다.

**앵커**: `2-A. **영향 task report 무효화 (ADR-067 D1 item 4 (d) 보완)**`

이 항목 **바로 앞에** 아래 블록을 삽입한다. **4.3.4를 먼저 적용한 뒤에 하면** 2-P 다음·2-A 앞에 놓인다(의도한 순서다).

```
2-R. **회귀 테스트 선행 (ADR-066 D4 준용)**: 수행 2의 cross-cutting 직접 수정마다 **그 결함을 재현하는 실패 테스트를 먼저 추가해 실패를 관측한 뒤**(Red) 고치고, **그 테스트가 통과하는 것까지 확인한다**(Green). Red·Green 두 관측 결과를 수행 4의 결정 이력에 1줄로 남긴다 — Red만 적고 Green을 확인하지 않으면 «고쳤다고 적었지만 안 고쳐진» 항목이 통과한다.
   - **면제**: 코드 3줄 이하 + 외부 행동 불변인 표기·간격·문구 수정, 그리고 **문서만 고치는 finding**(`[Doc-link]`·`[ADR-ref]`·`[Spec-gap]` 등 — 실행 가능한 테스트 대상이 아니다). 면제 사유를 결정 이력에 적는다.
   - 테스트 작성이 불가능하면 그 사유를 적고 다음 라운드 확인 대상으로 남긴다.
   - **per-task 위임분은 여기서 하지 않는다** — `/repair-workitem`이 자기 규율로 처리한다(중복 금지).

2-E. **실행 증거 갱신 (ADR-064 D4 — 외부 경계 코드를 고쳤을 때만)**: 본 라운드의 cross-cutting 직접 수정이 (a) 영속 저장소 쓰기 · (b) 외부 네트워크 호출 · (c) 실행 진입점 코드를 건드렸으면, **그 경계의 실행 증거를 다시 확보하고 그 task `## 8`에 `- exec-evidence` 줄을 새로 append한다**(기존 줄은 지우지 않는다 — 이력이다). 증거 등급·안전 규정·waiver 규정은 `/implement-workitem` 6-E와 동일하다. 확보하지 못하면 `Needs Execution Evidence: <경계 종류> — <사유>`를 출력에 남긴다.
   - **per-task 위임분은 여기서 하지 않는다** — `/repair-workitem` 2-E가 같은 일을 한다.
   - 등급 1 증거로 새 파일을 만들었어도 **task `## 4-1`은 건드리지 않는다**(계획 본문 불가침 — 본 skill의 책임 경계). 그 경로는 `## 5. Repair decision log` 항목에 적는다.
```

### 4.3.10 마지막 출력에 두 항목을 더한다

**앵커**: `- 자체 검증 (즉시 파손 감지): pass / skip(사유) / `Needs Follow-up: <목록>``  ← **4.3.7을 적용한 뒤에 생기는 텍스트다**(이 파일 안에서 유일해야 하므로 4.3.7을 먼저 끝낸다).

그 줄 **바로 앞에** 아래 두 줄을 삽입한다.

```
- 회귀 테스트 (2-R): 추가 N건 / 면제 M건(사유) / 작성 불가 K건(사유)
- 실행 증거 갱신 (ADR-064 D4): 갱신 N건(경계 종류) / 해당없음(외부 경계 코드 미수정) / `Needs Execution Evidence`
```

### 4.3.11 결정 이력 형식 예시에 `affected`를 넣는다

4.3.5가 cross-cutting 항목에 `affected: T-NNN`을 **필수**로 만들었는데 바로 위의 영속 형식 예시에 그 칸이 없다. 에이전트는 예시를 복사하므로 «유일한 역참조 경로»라고 선언한 필드가 조용히 빠진다(4.2.15의 `scope` 누락과 같은 클래스).

**앵커**: `   - **M1-repair-1** | P0 | [관측됨] | linked: M1 | status: applied | decision: Adopt`

**바꿀 내용**
```
   - **M1-repair-1** | P0 | [관측됨] | linked: M1 | affected: T-004 | status: applied | decision: Adopt
```

---

**Phase 4 (4.1~4.3) 커밋**

```
feat(milestone-loop): make acceptance milestone-scoped and close the reopen loop inside repair skills
```

---

## 4.4 `/stabilize-milestone`

파일: `.claude/skills/stabilize-milestone/SKILL.md`

### 4.4.1 죽은 ADR 인용 검사에 예외를 넣는다

**앵커**: `   - **죽은 ADR 인용**: 인용된 ADR의 `## Status`가 `superseded`/`deprecated`면 `P2 [Ref-dead] <file:line>`.`

**바꿀 내용**
```
   - **죽은 ADR 인용**: 인용된 ADR의 `## Status` **본문이 `superseded` 또는 `deprecated`로 시작할 때만** `P2 [Ref-dead] <file:line>`. **`accepted (부분 superseded — ...)`로 시작하는 ADR은 살아 있다** — 문자열 `superseded`가 괄호 안에 있다고 죽은 것으로 세지 않는다(이 구분을 빼면 부분 supersede된 ADR 하나가 100건 단위의 오탐을 만든다). **예외(오탐 아님, ADR-045#amend-2 D10)**: (a) 같은 줄에 `(현재 SSOT:`이 병기된 인용(역사 서술 + 현행 포인터를 함께 둔 정본형 — D10의 검사 제외 마커), (b) 그 ADR 자신을 가리키는 인용만 있는 줄(`## Status`·`## Amendment` 등), (c) `README.md` 인덱스 표 행의 supersede 계보 칸, (d) `<!-- -->` 주석 안. 예외에 해당하면 기록하지 않는다.
```

이어서 **바로 위 줄(Surfaces forward check)의 죽은-ADR 기준도 같은 «starts with»로 통일한다.** 두 검사가 한 줄 차이로 서로 다른 기준을 쓰면, 느슨한 쪽(`포함`)이 **부분 supersede된 살아있는 ADR의 Surfaces 검사를 조용히 건너뛴다** — 현재 `ADR-038`·`ADR-041`·`ADR-050`이 `accepted (부분 superseded — ...)`이므로 실제로 3개 ADR의 drift가 미검출된다. 오탐이 아니라 **미검출**이라 더 위험하다.

**앵커**: `대상 ADR의 `## Status`가 `superseded`/`deprecated`면 forward-check에서 skip한다`

**교체 대상**: 그 줄의 **조각만** 바꾼다.

**현재 (조각)**
```
대상 ADR의 `## Status`가 `superseded`/`deprecated`면 forward-check에서 skip한다(live sync 소스만 점검 — 죽은 ADR의 잔존 Surfaces는 별도 [Ref-dead]가 담당).
```
**바꿀 내용 (조각)**
```
대상 ADR의 `## Status` **본문이 `superseded` 또는 `deprecated`로 시작할 때만** forward-check에서 skip한다(**아래 «죽은 ADR 인용»과 동일 기준** — `accepted (부분 superseded — ...)`는 살아 있으므로 skip하지 않는다. 느슨하게 «문자열 포함»으로 읽으면 부분 supersede된 **살아있는** ADR의 Surfaces drift가 조용히 검출되지 않는다). live sync 소스만 점검 — 죽은 ADR의 잔존 Surfaces는 별도 [Ref-dead]가 담당.
```

### 4.4.2 §1.5 「AC 충족 100% + report 유효」를 5항으로 재작성한다

**앵커**: `- `AC 충족 100% + report 유효` → 본 milestone의 **모든 task**의 최신 `docs/40-validation/reports/<task-id>.md`가 아래 넷을 **모두** 만족(ADR-067 D1 item 4):`

**교체 범위**: 위 앵커 줄부터, 그 아래 들여쓴 하위 불릿 5개(`(a)` / `(b)` / `(c)` / `(d)` / `report 부재 task는 미충족 —`)까지 **총 6줄**을 통째로 교체한다. 그 다음 줄(`- `P0 severity finding 0건` → ...`)은 건드리지 않는다.

**현재 (교체 대상 6줄 전체)**
```
- `AC 충족 100% + report 유효` → 본 milestone의 **모든 task**의 최신 `docs/40-validation/reports/<task-id>.md`가 아래 넷을 **모두** 만족(ADR-067 D1 item 4):
  - (a) `## AC ↔ 검증 매핑` 전 항목 충족. 판정 기준은 [ADR-065](../../../docs/90-decisions/boilerplate/ADR-065-ac-verification-contract.md) D1 modality — `미관측`은 미충족, 표기 부재는 `[자동 테스트]` 간주(legacy), **`## 6-2. TDD opt-out`은 예외가 아니다**(ADR-065 D2).
  - (b) report `- 판정:` 값이 `Pass`. (AC 행만 읽으면 다른 축의 미해소 P0가 통과한다.)
  - (c) `## Orchestration`의 `감사 미완(unavailable)` 항목이 없음.
  - (d) **report가 stale하지 않음** — report mtime이 그 task `## 4-1` 등재 **구현 파일**들의 최신 mtime보다 오래되지 않음(같으면 통과). **task 문서는 비교 대상이 아니다** — `/finalize-workitem`이 stale 검사 뒤에 status를 쓰므로 넣으면 정상 마감된 전 task가 미충족이 된다(ADR-067 D1 item 4 (d) 주). stale이면 미충족 + 처방은 **그 task `/validate-workitem` 재실행**. `## 4-1` 밖 cross-cutting 수정은 `/repair-milestone`의 report 삭제가 담당한다.
  - report 부재 task는 미충족 — **새 체크아웃·다른 worktree가 이에 해당하므로, 그때는 각 task의 `/validate-workitem`을 먼저 재실행해 report를 만든 뒤 본 skill을 다시 돌리도록 안내한다**(report는 gitignore된 checkout-local ephemeral — 설계상 정상이며 결함이 아니다).
```

**바꿀 내용 (6줄 → 아래 10줄)**
```
- `AC 충족 100% + report 유효` → 본 milestone의 **모든 task**가 아래 다섯을 **모두** 만족(ADR-067 D1 item 4). **입력이 둘로 나뉜다** — (a)(b)(c)(d)는 채점표(`docs/40-validation/reports/<task-id>.md`)에서, (a')는 task 문서 `## 8`에서 직접 읽는다:
  - (a) **기계 검증 AC 전부 충족** — 채점표 `## AC ↔ 검증 매핑`에서 modality가 `[자동 테스트]`·`[산출물 검사]`이거나 표기 부재(legacy)인 AC 전부. 판정 기준은 [ADR-065](../../../docs/90-decisions/boilerplate/ADR-065-ac-verification-contract.md) D1 modality — `미관측`은 미충족, **`## 6-2. TDD opt-out`은 예외가 아니다**(ADR-065 D2).
  - (a') **관측 AC 전부 receipt 유효** — task `## 6-1`에서 modality가 `[사용자 관측]`·`[플랫폼 관측]`인 AC마다, **그 task `## 8`의 (HTML 주석 밖) 그 AC 마지막 이벤트가 `- ac-acceptance`** 인가(ADR-065 D3). `- ac-pending`·`- invalidated`이거나 이벤트가 없으면 미충족. **채점표를 경유하지 않는다** — receipt는 커밋된 task 문서에 있는 사실이고, 경유시키면 receipt 발급마다 재validate가 강제된다.
  - (b) 채점표 `- 판정:` 값이 **`Pass` 또는 `Pending Acceptance`**(ADR-065 D6). **`Needs Fix`는 미충족이다.** (AC 행만 읽으면 다른 축의 미해소 P0가 통과한다.)
  - (c) `## Orchestration`의 `감사 미완(unavailable)` 항목이 없음.
  - (d) **채점표가 stale하지 않음** — 채점표 mtime이 그 task `## 4-1` 등재 **구현 파일**들의 최신 mtime보다 오래되지 않음(같으면 통과). **task 문서는 비교 대상이 아니다** — `/finalize-workitem`이 stale 검사 뒤에 status를 쓰므로 넣으면 정상 마감된 전 task가 미충족이 되고, receipt 발급도 stale을 유발하게 된다. stale이면 미충족 + 처방은 **그 task `/validate-workitem` 재실행**. `## 4-1` 밖 cross-cutting 수정은 `/repair-milestone`의 채점표 삭제 + 그 skill의 2-C 연쇄가 담당한다. **`## 4-1`이 비어 비교 대상이 없는 task는 «비교 불가»로 출력에 한 줄 기록만 하고 차단하지 않는다**(관측 없이 게이트를 조이지 않는다 — ADR-022).
  - 채점표 부재 task는 미충족 — **새 체크아웃·다른 worktree가 이에 해당하므로, 그때는 각 task의 `/validate-workitem`을 먼저 재실행해 채점표를 만든 뒤 본 skill을 다시 돌리도록 안내한다**(채점표는 gitignore된 checkout-local ephemeral — 설계상 정상이며 결함이 아니다).
  - **판정 분기 (중요 — 여기서 `NO`를 외치지 않는다)**: 위 다섯 중 **(a') 하나만 미충족이고 (a)(b)(c)(d)가 전부 충족**이면 그 사실을 `수용 대기: <task-id>:AC-N 목록`으로 기록하고 **item 4를 `NO`로 판정하지 않는다** — 다른 졸업 항목이 전부 충족이면 최종 graduation은 `PENDING_ACCEPTANCE`이며(ADR-067 D3), 처방은 `/accept-milestone <M>`이다. 이 분기를 빠뜨리면 관측 AC를 쓴 모든 마일스톤이 `NO`로 나와 수용 라운드에 도달하지 못한다.
```

### 4.4.3 §1.5 판정 출력을 4값으로 늘린다

**앵커**: `판정 출력:` (이 파일에서 유일하다)

**현재 (그 줄부터 3줄 — `- 미충족 항목 발견 시` / `- 모든 항목 충족 시`)**
```
판정 출력:
- 미충족 항목 발견 시 `졸업 가능: NO` + 미충족 항목 목록을 출력하고 *조기 종료 옵션*을 사용자에게 제시한다(강제 종료 아님).
- 모든 항목 충족 시 `졸업 가능: YES` 출력 후 다음 단계 진행.
```
**바꿀 내용 (3줄 → 아래 4줄)**
```
판정 출력 (ADR-067 D3 — 4종, 우선순위 `BLOCKED` > `NO` > `PENDING_ACCEPTANCE` > `YES`로 먼저 성립하는 값):
- 미충족 항목 발견 시 `졸업 가능: NO` + 미충족 항목 목록을 출력하고 *조기 종료 옵션*을 사용자에게 제시한다(강제 종료 아님).
- **item 4 (a')만 미충족이고 나머지 항목이 전부 충족이면 `졸업 가능: PENDING_ACCEPTANCE (관측 AC 미발급: <task-id>:AC-N 목록)`** 을 출력하고 **다음 단계로 계속 진행한다**(조기 종료 옵션을 제시하지 않는다 — 결함이 아니라 «사람 확인만 남은» 상태다). 처방은 `/accept-milestone <M>`.
- 모든 항목 충족 시 `졸업 가능: YES` 출력 후 다음 단계 진행.
```

### 4.4.4 §3-V (d)의 수용 단계 안내를 고친다

**앵커**: `   - (d) 최종 출력(단계 8)에 갤러리 경로 + **"사용자 육안 확인은 `/accept-milestone <M>`이 수행한다`

**현재 (줄 전체)**
```
   - (d) 최종 출력(단계 8)에 갤러리 경로 + **"사용자 육안 확인은 `/accept-milestone <M>`이 수행한다 — 스펙 자체의 오류는 사람이 잡는다"** 1줄(ADR-066 D1). 본 단계의 AI 판독은 `[Experience-drift]` 후보를 올리는 데까지이며, 그 확인의 실행 자리는 수용 단계다(권장 — 졸업 필수 조건은 아니다).
```
**바꿀 내용**
```
   - (d) 최종 출력(단계 8)에 갤러리 경로 + **"사용자 육안 확인은 `/accept-milestone <M>`이 수행한다 — 스펙 자체의 오류는 사람이 잡는다"** 1줄(ADR-066 D1). 본 단계의 AI 판독은 `[Experience-drift]` 후보를 올리는 데까지이며, 그 확인의 실행 자리는 수용 단계다. **산하 task에 관측 modality AC가 1건이라도 있으면 그 단계는 «권장»이 아니라 사실상 필수 경로다**(receipt 없이는 item 4 (a')를 충족하지 못한다 — ADR-067 D1). 0건이면 권장이며 졸업 필수 조건이 아니다.
```

### 4.4.5 단계 8 「졸업 가능 = YES」 분기를 다시 쓴다

**앵커**: `     - **졸업 가능 = YES + P0 후속 0건**:`

**교체 범위**: 위 앵커 줄부터 그 아래 들여쓴 하위 불릿 4개(`- **기본 권장: /accept-milestone <M>** ...` / `- 수용 판정별 후속 ...` / `- **수용을 건너뛴 경우 ...` / `- 프롬프트 동봉 권장: ...`)까지 **총 5줄**을 통째로 교체한다. 그 다음 줄(`     - **졸업 가능 = NO 또는 P0 후속 있음** ...`)은 건드리지 않는다.

**현재 (교체 대상 5줄 전체)**
```
     - **졸업 가능 = YES + P0 후속 0건**:
       - **기본 권장: `/accept-milestone <M>`** — 사람이 직접 실행·확인하는 수용 단계(ADR-066 D1). **권장이며 졸업 필수 조건은 아니다** — 건너뛰면 아래 `/plan-milestone`으로 바로 진행한다. 단 산하 task에 `[사용자 관측]`·`[플랫폼 관측]` modality AC가 있으면 그 receipt 없이는 item 4가 이미 미충족이므로 이 단계 전에 `/accept-milestone --task <task-id>`가 선행됐어야 한다(ADR-065 D1). **단 마일스톤 문서 `## 11`에 `- 판정: 승인`이 이미 기록돼 있고 그 뒤 코드·receipt 변경이 없으면 재권장하지 않는다** — 그 상태에서 다시 권장하면 라운드 상한 3이 무의미하게 소모된다.
       - 수용 판정별 후속 (**상세는 `/accept-milestone` 출력이 SSOT** — 여기서는 요약): **`승인`** = `(수용)` 태그로 이번 M 수리를 택한 개선 항목이 있으면 먼저 `/repair-acceptance <M>`(그 항목의 유일한 실행 경로 — ADR-066 D5) → `## 8`을 갱신한 task `/validate-workitem` 재실행 → **본 skill 재실행으로 졸업 확정**(졸업 판정 소유권은 본 skill — ADR-066 D1. 변경 0건이면 재실행만). / **`보류`** = `/repair-acceptance <M>` → 영향 task `/validate-workitem` 재실행 → `/accept-milestone <M>` 재실행 → **재발급으로 `## 8`이 또 바뀌므로 한 번 더 영향 task 재validate** → 본 skill 재실행. / **`미완`** = 환경 복구(또는 사용자 재개) 후 `/accept-milestone <M>` 재실행(라운드 카운터 미소모).
       - **수용을 건너뛴 경우(또는 위 재실행으로 졸업이 확정된 뒤)** 기본 권장: `/plan-milestone` — 새 milestone(M-(N+1)) + feature 문서 생성 → `contract-ready`. 뒤이어 `/plan-workitem M-(N+1)`(전체 계획 스냅샷, task는 `draft`) → **`/seal-milestone M-(N+1)`**(검사·승인·일괄 `ready`) 순으로 진행(ADR-057#amend-3 / ADR-060 D7)
       - 프롬프트 동봉 권장: 본 라운드 Telemetry 의 신뢰도 분포 + Cross-stabilize 회귀 신호 (다음 milestone 의 우선순위 조정 입력)
```

**바꿀 내용 (5줄 → 아래 8줄)**
```
     - **졸업 가능 = PENDING_ACCEPTANCE** (item 4 (a')만 미충족):
       - **유일한 권장: `/accept-milestone <M>`** — 사람이 직접 실행·확인하는 수용 라운드이며(ADR-066 D1), 미발급 receipt는 그 자리에서만 발급된다(사용자 authority — ADR-065 D1). 미발급 AC 목록(`<task-id>:AC-N`)을 함께 출력한다.
       - **여기서 `/validate-workitem`·`/finalize-workitem` 재실행을 권장하지 않는다** — item 4 (a')는 채점표가 아니라 task `## 8`을 직접 읽으므로 receipt 발급만으로 충족된다.
       - 수용 라운드 뒤에는 그 skill의 출력이 지시하는 순서를 따른다. 코드 변경이 있었으면 `/repair-acceptance <M>`이 자기 루프 안에서 후속을 끝낸다 — **재개방한 `in-AC` task는 `/validate-workitem` + `/finalize-workitem`까지, 재개방하지 않은 `out-of-AC` 영향 task는 `/validate-workitem`만**(그 task는 계속 `done`이라 마감할 것이 없다). 사용자는 그 뒤 **본 skill을 한 번 더 실행**해 `YES`를 확정한다.
     - **졸업 가능 = YES + P0 후속 0건**:
       - **기본 권장: `/plan-milestone`** — 새 milestone(M-(N+1)) + feature 문서 생성 → `contract-ready`. 뒤이어 `/plan-workitem M-(N+1)`(전체 계획 스냅샷, task는 `draft`) → **`/seal-milestone M-(N+1)`**(검사·승인·일괄 `ready`) 순으로 진행(ADR-057#amend-3 / ADR-060 D7)
       - **`/accept-milestone <M>`은 이 상태에서 선택이다** — `YES`는 관측 modality AC가 0건이거나 그 receipt가 이미 전부 유효하다는 뜻이므로 receipt로 막힐 것이 없다. 사용자가 경험 확인을 원하면 실행한다. **단 마일스톤 문서 `## 11`에 `- 판정: 승인`이 이미 기록돼 있고 그 뒤 코드·receipt 변경이 없으면 재권장하지 않는다** — 그 상태에서 다시 권장하면 라운드 상한 3이 무의미하게 소모된다.
       - 프롬프트 동봉 권장: 본 라운드 Telemetry 의 신뢰도 분포 + Cross-stabilize 회귀 신호 (다음 milestone 의 우선순위 조정 입력)
```

### 4.4.6 단계 8 최종 출력에 수용 대기 항목을 추가한다

**앵커**: `   - 다음 마일스톤으로 넘기는 항목`

그 줄 **바로 앞에** 아래 한 줄을 삽입한다(같은 들여쓰기 3칸).

```
   - **수용 대기 AC (item 4 (a') 미충족)**: `<task-id>:AC-N (<modality>)` 목록 / 해당없음. **`/accept-milestone <M>` 처방은 최종 판정이 `PENDING_ACCEPTANCE`일 때만 붙인다** — `NO`·`BLOCKED`면 목록만 남기고 처방은 아래 「다음 단계」 분기가 소유한다(한 출력이 두 명령을 지시하면 사용자가 어느 쪽을 칠지 알 수 없다)
```

**⚠ 처방을 조건부로 두는 이유**: 이 줄은 판정과 무관하게 항상 출력되는 데이터 행이다. 무조건 `/accept-milestone`을 처방으로 달면 최종 판정이 `NO`·`BLOCKED`인 라운드에서도 수용 명령이 먼저 보이고, 「다음 단계」 분기(`/repair-milestone`·환경 복구)와 **서로 다른 명령을 동시에 지시**하게 된다.

### 4.4.7 책임 경계의 회고 자동 채움 규칙을 갱신한다

**앵커**: `- 누적 문서 갱신 + milestone `## 8. 회고` 자동 채움 — **회고의 `graduation:` 줄은 단계 4~6 종료 후 graduation 5+1 기준 *전체를 최종 상태로 재판정*해 기록**`

**현재 (줄 전체)**
```
- 누적 문서 갱신 + milestone `## 8. 회고` 자동 채움 — **회고의 `graduation:` 줄은 단계 4~6 종료 후 graduation 5+1 기준 *전체를 최종 상태로 재판정*해 기록**(P0 기준은 `QA_FINDINGS.md`의 미해소 P0만 — qa 팬아웃分; reviewer는 report-only로 미반영)(task status·통합 validate·e2e·AC 충족 100% = 단계 3 결과 + P0 0건 = 단계 4~6 반영 + 추가 기준; YES|NO|BLOCKED+날짜; §1.5 사전점검이 아니라 여기서 확정 — ADR-057#amend-1·ADR-067 D3). **감사 미완이 있으면 `BLOCKED (audit incomplete: <단위>)`로 기록하며, 이 값은 이전 라운드에 기록된 `YES`를 덮어쓴다**(줄을 쓰지 않으면 낡은 `YES`가 남아 하류가 졸업으로 읽는다). host 제약 e2e target의 처리는 본 라운드에서 바꾸지 않는다 — 기존대로 ADR-052#amend-1·ADR-059 D4(같은 커밋 registry 증거 또는 `BLOCKED_ENV`)를 따른다. 회고의 `open 항목 스냅샷:` 줄도 여기서 채운다 — `QA_FINDINGS` 미해소 N / `IMPROVEMENT_GUIDE` 미해소 M / 이전 M carry-over K(ADR-067 D2). 로드맵 파일은 안 건드린다(다음 plan-milestone R0가 이 줄을 읽어 재조정).
```
**바꿀 내용**
```
- 누적 문서 갱신 + milestone `## 8. 회고` 자동 채움 — **회고의 `graduation:` 줄은 단계 4~6 종료 후 graduation 5+1 기준 *전체를 최종 상태로 재판정*해 기록**(P0 기준은 `QA_FINDINGS.md`의 미해소 P0만 — qa 팬아웃分; reviewer는 report-only로 미반영)(task status·통합 validate·e2e·AC 충족 100% = 단계 3 결과 + P0 0건 = 단계 4~6 반영 + 추가 기준; **값은 `YES|PENDING_ACCEPTANCE|NO|BLOCKED`+날짜 4종**이며 우선순위는 `BLOCKED` > `NO` > `PENDING_ACCEPTANCE` > `YES`; §1.5 사전점검이 아니라 여기서 확정 — ADR-057#amend-1·ADR-067 D3). **item 4 (a')만 미충족이면 `PENDING_ACCEPTANCE (관측 AC 미발급: <task-id>:AC-N 목록)`로 기록한다** — `NO`로 쓰지 않는다(결함이 아니라 사람 확인 대기다). **감사 미완이 있으면 `BLOCKED (audit incomplete: <단위>)`로 기록하며, 이 값은 이전 라운드에 기록된 `YES`·`PENDING_ACCEPTANCE`를 덮어쓴다**(줄을 쓰지 않으면 낡은 값이 남아 하류가 졸업으로 읽는다). host 제약 e2e target의 처리는 본 라운드에서 바꾸지 않는다 — 기존대로 ADR-052#amend-1·ADR-059 D4(같은 커밋 registry 증거 또는 `BLOCKED_ENV`)를 따른다. 회고의 `open 항목 스냅샷:` 줄도 여기서 채운다 — `QA_FINDINGS` 미해소 N / `IMPROVEMENT_GUIDE` 미해소 M / 이전 M carry-over K(ADR-067 D2). 로드맵 파일은 안 건드린다(다음 plan-milestone R0가 이 줄을 읽어 재조정).
```

### 4.4.8 §1.5의 「graduation 기록 시점」 문장에 4값을 반영한다

**앵커**: `- **graduation은 §1.5에서 기록하지 않는다 — §1.5는 pre-check일 뿐**.`

그 줄 안의 아래 조각을 바꾼다(줄 전체를 다시 쓰지 않는다 — 이 조각만 교체).

**현재 (조각)**
```
최종 graduation(`YES|NO|BLOCKED (날짜)`)은 **단계 8 회고 자동 채움 시점에 최종 P0로 1회만** 기록한다
```
**바꿀 내용 (조각)**
```
최종 graduation(`YES|PENDING_ACCEPTANCE|NO|BLOCKED (날짜)`)은 **단계 8 회고 자동 채움 시점에 최종 P0로 1회만** 기록한다
```

---

### 4.4.9 도입부 회고 스키마의 graduation 값을 4종으로 늘린다

**앵커**: `   - 회고 본문: **graduation 줄(`YES|NO|BLOCKED (날짜)` — 단계 8 판정 영속, ADR-057#amend-1)**`

**현재 (줄 전체)**
```
   - 회고 본문: **graduation 줄(`YES|NO|BLOCKED (날짜)` — 단계 8 판정 영속, ADR-057#amend-1)** + 4 항목: 목표 달성도 / scope creep / 비목표 위반 / 핵심 학습 3개 이내.
```
**바꿀 내용**
```
   - 회고 본문: **graduation 줄(`YES|PENDING_ACCEPTANCE|NO|BLOCKED (날짜)` — 단계 8 판정 영속, ADR-057#amend-1·ADR-067 D3)** + 4 항목: 목표 달성도 / scope creep / 비목표 위반 / 핵심 학습 3개 이내.
```

### 4.4.10 ⭐ 단계 8에 `BLOCKED` 분기를 신설한다

**4.4.3·4.4.7이 판정값을 4종으로 선언하는데 단계 8의 「다음 단계」 분기는 셋뿐이다**(`PENDING_ACCEPTANCE` / `YES` / `NO 또는 P0 후속 있음`). 그래서 `BLOCKED`으로 기록된 라운드는 **처방이 없다.**

**빠뜨리면 감사 미완이 잘못 라우팅된다**: 단계 4의 축 미반환 회수 규율 ④는 `M<N>-audit-<K>`를 **P0로 등재**하고 graduation을 `BLOCKED (audit incomplete: <단위>)`로 기록한다. 그러면 «P0 후속 있음» 조건에 걸려 사용자가 `/repair-milestone`으로 유도되는데, **그 P0는 코드 결함이 아니라 «못 재봤다»라서 4-판정할 대상이 없다** — 재감사가 필요한 자리에서 repair가 헛돌고 마일스톤은 `BLOCKED`에 머문다. ADR-067 D3가 이 값에 별도 이름을 준 이유가 «평가 실행 불가»의 처방이 다르기 때문이다.

**앵커**: `     - **졸업 가능 = NO 또는 P0 후속 있음** (분기 옵션 ≤3):`

이 줄 **바로 앞에** 아래 블록을 삽입한다(같은 들여쓰기 5칸).

```
     - **졸업 가능 = BLOCKED** (평가 실행 불가 — ADR-067 D3). **이 분기가 아래 `NO` 분기보다 우선한다**(우선순위 `BLOCKED` > `NO`) — 감사 미완은 `M<N>-audit-<K>` P0를 등재하므로 «P0 후속 있음»에도 걸리지만, 그 P0의 처방은 repair가 아니다:
       - **감사 미완(`BLOCKED (audit incomplete: <단위>)`)**: 처방은 **그 축의 재감사**다 — 단계 4의 축 미반환 회수 규율 ①~③(1회 재개 → 다른 qa 재위임 → 메인 직접 감사)을 다시 시도하거나 본 skill을 재실행한다. **`/repair-milestone`은 처방이 아니다** — «못 재봤다»는 상태이지 코드 결함이 아니어서 4-판정할 대상이 없다. 등재된 `M<N>-audit-<K>` P0는 감사가 완료된 뒤 `status: resolved`로 닫는다.
       - **e2e blocked-on-env**: 처방은 아래 `NO` 분기의 «e2e blocked-on-env» 불릿과 같다(환경 복구 후 본 skill 재실행 — real failure가 아니므로 repair 대상이 아니다).
       - `BLOCKED`은 이전 라운드에 기록된 `YES`·`PENDING_ACCEPTANCE`를 덮어쓴다(책임 경계의 회고 기록 규칙) — 낡은 값이 남아 하류가 졸업으로 읽는 것을 막는다.
```

> **분기 순서는 바꾸지 않는다** — 선언된 우선순위는 `BLOCKED` > `NO` > `PENDING_ACCEPTANCE` > `YES`이지만 기존 블록 3개를 재배열하면 4.4.5의 교체 결과와 충돌한다. 대신 새 블록을 `NO` 분기 **바로 앞**에 두고 그 안에 «이 분기가 `NO`보다 우선한다»를 명시했다 — 두 차단 상태가 인접해 읽히고, 재배열 없이 우선순위가 지켜진다.
>
> **`e2e blocked-on-env`의 §1.5 표기는 이 라운드에서 바꾸지 않는다** — §1.5는 그 상태를 `졸업 가능: NO (hard, blocked-on-env)`로 내고 있고(사전 상태), 그 사상을 `BLOCKED`으로 옮기는 것은 게이트 의미 변경이라 본 개선 범위(수용 루프·원장) 밖이다. 위 분기는 «그 경우의 처방은 `NO` 분기와 같다»로 연결만 한다.

---

**Phase 4.4 커밋**

```
feat(stabilize): split graduation item 4 by modality and emit PENDING_ACCEPTANCE verdict
```

---

# Phase 5 — 메타 문서 · 로드맵 · Codex wrapper

Phase 1~4가 계약과 skill을 바꿨으니, 이제 그 계약을 요약해 두고 있는 상위 문서를 맞춘다. **여기서 새 정책을 만들지 않는다 — 이미 정한 것을 반영만 한다.**

---

## 5.1 `docs/00-meta/STRUCTURE.md` — 원장 배타 범위 표를 박는다

파일: `docs/00-meta/STRUCTURE.md`

### 5.1.1 ⭐ `## Canonical Owner 매핑`에 원장 5종 표를 추가한다

이 표가 «어떤 사실을 어느 원장에 적는가»의 SSOT다. ADR-005#amend-1이 정책 본문이고, 여기가 그 정책이 가리키는 실행 표다.

**앵커**: `> 압축 규칙 — ADR 본문 자체가 단일 SSOT이고 다른 surface에는 인용만 되는 정책`

이 줄 **바로 앞에** 아래 블록을 삽입한다(Canonical Owner 표 바로 다음, 압축 규칙 주석 앞).

~~~
### 원장 5종 배타 범위 (ADR-005#amend-1)

같은 항목이 두 원장에 동시에 있으면 안 된다. **판별 기준은 «그 항목이 해소되면 무엇이 남는가»다.**

| 원장 | 파일 | 담는 것 | 해소되면 남는 것 | writer |
|------|------|---------|------------------|--------|
| 결정 원장 | `docs/10-charter/DECISION_REGISTER.md` | 사용자가 정하거나 승인해야 할 **열린 결정** | **정본 문서의 한 절**(charter·ARCH·DESIGN·ADR) | 단일 writer 없음 — 발견한 skill이 등재, 닫는 것은 사용자 |
| 로드맵 | `docs/30-workitems/ROADMAP.md` | Done/Now/Next/Later + **`## Backlog`**(범위 후보) | **다음 마일스톤 문서 하나** | **구간별로 갈린다** — `Done`/`Now`/`Next`/`Later` = `/plan-milestone` 단독 / `## Backlog` = append-only 다중 writer(`/accept-milestone`·`/repair-acceptance` 추가, `/plan-milestone` 정리·승격·재분류 등재) — [ADR-057](../90-decisions/boilerplate/ADR-057-planning-v2-batch-and-seam.md)#amend-4 |
| QA 원장 | `docs/40-validation/QA_FINDINGS.md` | 계약 위반 **결함** | **코드 수정 + 회귀 테스트** | 발견자 기록 / status는 repair 계열이 닫는다 |
| 개선 원장 | `docs/40-validation/IMPROVEMENT_GUIDE.md` | 계약 위반은 아닌 **개선 제안·부채** + `## 5` 결정 이력 | **코드·문서 리팩토링** | 발견자 기록 / status는 repair 계열이 닫는다 |
| 발견 원장 | `docs/10-charter/DISCOVERY.md` | 사용자·시장에 대한 **관측·가정** | **charter 스냅샷 갱신** | `/discover-product` (DISCOVERY=SSOT, Charter=snapshot — ADR-035. `/bootstrap-project`는 그 스냅샷을 *읽어* charter를 갱신하는 쪽이다) |

**비중복 불변식 (셋 다 지킨다 — 정의 SSOT는 [ADR-005](../90-decisions/boilerplate/ADR-005-ssot.md)#amend-1 결정 4이며 번호·문구를 그대로 옮긴다)**
- **N-1** — 한 사실은 동시에 두 원장에 «열린 채로» 존재하지 않는다. 두 성격이 섞여 보이면 «해소되면 무엇이 남는가»로 하나를 고른다.
- **N-2** — 원장 간 이동은 «원본을 닫고 → 새 원장에 등재»로만 한다. 양쪽에 남기지 않는다.
- **N-3** — 이동한 항목의 원본에 목적지 앵커를 남긴다 — `status: resolved (재분류: <목적지> <ID 또는 candidate-key>)`. 목적지가 로드맵이면 `재분류: ROADMAP ## Backlog <candidate-key>`로 적는다.
- (불변식 번호가 붙지 않는 일반 규율) 다른 원장을 참조할 때는 **ID 한 줄 링크만** 둔다 — 본문을 복사하지 않는다(본 ADR 결정 1의 «정의 1곳, 다른 곳은 링크»가 원장에도 그대로 적용된다).

**자주 헷갈리는 세 가지**
- 수용 라운드의 «계약 변경» → **ROADMAP `## Backlog`**(다음 마일스톤 후보). 단 정본 문서를 고쳐야 성립하면 DECISION_REGISTER.
- ADR은 원장이 **아니다** — 정본 문서다. 결정 원장은 «아직 안 정한 것», ADR은 «정하고 근거까지 박은 것»이다.
- 마일스톤 `## 8. 회고`·task `## 8. 메모`는 원장이 아니라 **그 문서의 이력**이다. 원장으로 승격할 항목만 원장에 따로 등재한다.
~~~

### 5.1.2 Canonical Owner 표에 두 행을 추가한다

**앵커**: `| task 층 증거 계약 (외부 경계 실행 증거·검증 판정력·`[미실측]` 외부 사실·receipt) | [ADR-064]`

그 줄 **바로 뒤에** 아래 두 행을 추가한다.

```
| 원장 5종 배타 범위 + 비중복 불변식 | [ADR-005](../90-decisions/boilerplate/ADR-005-ssot.md)#amend-1 (정책 SSOT). 실행 표는 본 문서 `## Canonical Owner 매핑`의 «원장 5종 배타 범위». |
| 죽은 ADR 인용 처리 5종 분류 (`[Ref-dead]` 판정 기준) | [ADR-045](../90-decisions/boilerplate/ADR-045-doc-reference-contract.md)#amend-2 (정책 SSOT). → ADR-045 `## Surfaces` 참조. |
```

### 5.1.3 산출물 표에 로드맵 Backlog 행이 필요한지 확인한다

`docs/30-workitems/ROADMAP.md`는 이미 존재하는 산출물이므로 **새 행을 추가하지 않는다.** `## Backlog`는 그 파일 안의 한 절이며 별도 산출물이 아니다(ADR-005#amend-1 — 절은 산출물 표에 박지 않는다).

### 5.1.4 ⭐ 로드맵 두 행의 「단일 작성자」 표기를 구간별로 정정한다

**행을 추가하지는 않지만 기존 두 행의 writer 칸은 반드시 고친다** — ADR-057#amend-4가 `## Backlog`를 append-only 다중 writer로 열었고, 그 amend의 「적용 surface」가 스스로 `docs/00-meta/STRUCTURE.md (산출물 표 writer 갱신)`를 열거한다. 이걸 빼면 정책(amend-4)과 인벤토리가 정면 충돌한다.

**앵커**: `| milestone roadmap | `docs/30-workitems/ROADMAP.md` | `/plan-milestone` (R3 생성/갱신, R0 재조정 — 단일 작성자) | Living | baseline |`

**바꿀 내용**
```
| milestone roadmap | `docs/30-workitems/ROADMAP.md` | `Done`/`Now`/`Next`/`Later` = `/plan-milestone` 단독 (R3 생성/갱신, R0 재조정) · `## Backlog` = append-only 다중 writer (`/accept-milestone`·`/repair-acceptance` 추가, `/plan-milestone` 정리·승격 — ADR-057#amend-4) | Living | baseline |
```

**앵커**: `| 마일스톤 로드맵 SSOT (Done/Now/Next/Later forward 지도) | [ADR-057]`

**현재 (줄 전체 — 표의 한 행)**
```
| 마일스톤 로드맵 SSOT (Done/Now/Next/Later forward 지도) | [ADR-057](../90-decisions/boilerplate/ADR-057-planning-v2-batch-and-seam.md)#amend-1 (정책 SSOT). 파일: `docs/30-workitems/ROADMAP.md` (단일 작성자 = plan-milestone). |
```
**바꿀 내용**
```
| 마일스톤 로드맵 SSOT (Done/Now/Next/Later forward 지도 + `## Backlog` 범위 후보) | [ADR-057](../90-decisions/boilerplate/ADR-057-planning-v2-batch-and-seam.md)#amend-1·#amend-4 (정책 SSOT). 파일: `docs/30-workitems/ROADMAP.md`. 구간별 writer: `Done/Now/Next/Later` = plan-milestone 단독 / `## Backlog` = append-only 다중 writer. |
```

---

## 5.2 `docs/00-meta/WORKFLOW.md`

파일: `docs/00-meta/WORKFLOW.md`

### 5.2.1 `## 5-1. 사용자 수용` 절을 다시 쓴다

**교체 범위**: `## 5-1. 사용자 수용 (권장 — ADR-066)` 헤딩 줄부터, 그 아래 불릿 전부(`- 라운드 상한 3회.`로 시작하는 줄까지) **총 9줄**. 다음의 빈 줄과 `## 6. 의사결정 기록`은 남긴다.

**현재 (교체 대상 9줄 전체)**
```
## 5-1. 사용자 수용 (권장 — ADR-066)
- `/accept-milestone <M>`으로 사람이 직접 실행·확인한다. 환경을 띄우고 확인할 시나리오를 안내하고 피드백을 3갈래(결함=QA_FINDINGS / 계약 변경=DECISION_REGISTER+다음 M / 개선=IMPROVEMENT_GUIDE)로 라우팅한다.
- **졸업 필수 조건이 아니다.** 단 task `## 6-1`에서 AC를 `[사용자 관측]`·`[플랫폼 관측]`으로 지정했으면 그 receipt 없이 졸업 item 4를 충족하지 못한다(ADR-065 D1).
- **task 스코프는 inner-loop 안에 있다** — `/validate-workitem`이 그 AC를 미충족으로 내면 `/accept-milestone --task <task-id>`로 receipt를 발급하고 `/validate-workitem`을 재실행한 뒤 `finalize`한다. 이 경로는 마일스톤 라운드 카운터·`## 11`을 쓰지 않는다. **이 분리가 없으면 «receipt 없어 finalize 불가 → task done 불가 → stabilize 진입 불가 → receipt 발급 불가» 순환이 생긴다.**
  - **판정값 소유권**: `/validate-workitem`의 report 판정은 `Pass | Needs Fix` 둘뿐이고, 이 경로는 그 report의 `## 다음 권장 액션`이 지시한다. **`Needs Acceptance`는 `/finalize-workitem`의 종료값**이다(ADR-066 Surfaces가 validate=«`--task` 안내» / finalize=«`Needs Acceptance` 종료»로 배분). 두 이름을 섞어 쓰지 않는다.
- **수용 라운드가 코드나 receipt를 바꿨으면 영향 task의 `/validate-workitem`을 재실행한 뒤** stabilize를 돌린다 — 졸업 item 4는 report를 읽고 stale report를 미충족 처리한다(ADR-067 D1 item 4 (d)).
- 결함이 있으면 `/repair-acceptance <M>`이 3+1 판정으로 수리한다 — **기존 task를 재개방하지 않고 코드만 고치며**, 추적성은 결정 이력의 `affected: T-NNN`으로 확보한다. 수리 후에는 위 규칙대로 «영향 task 재validate → `/accept-milestone` 재실행 → (승인 시) 다시 재validate → `/stabilize-milestone`» 순으로 진행한다. **`## 8`이 바뀔 때마다 재validate가 한 번씩 들어간다** — 각 skill의 마지막 출력이 그 목록을 준다.
- **판정이 `미완`이면**(환경 기동 실패·사용자 중단으로 필수 시나리오를 다 확인하지 못함) 환경 복구 또는 사용자 재개 후 `/accept-milestone <M>`을 재실행한다 — **라운드 카운터를 소모하지 않는다**(확인을 못 했으므로 회차로 세지 않는다). 판정 3종의 후속은 `/accept-milestone` 출력이 SSOT다.
- 라운드 상한 3회. 초과분은 사용자 확인 후 다음 마일스톤으로 이관한다.
```

**바꿀 내용 (9줄 → 아래 9줄)**
```
## 5-1. 사용자 수용 (ADR-066)
- `/accept-milestone <M>`으로 사람이 직접 실행·확인한다. **마일스톤 단위 하나뿐이다 — task 스코프는 없다.** 환경을 띄우고 확인할 시나리오를 안내하고 피드백을 3갈래(결함=QA_FINDINGS / 계약 변경=ROADMAP `## Backlog` / 개선=IMPROVEMENT_GUIDE)로 라우팅한다.
- **관측 modality AC가 0건인 마일스톤에서만 «권장(선택)»이다.** task `## 6-1`에서 AC를 `[사용자 관측]`·`[플랫폼 관측]`으로 지정했으면 그 receipt 없이 졸업 item 4 (a')를 충족하지 못하므로(ADR-065 D1 / ADR-067 D1) 사실상 필수 경로가 된다.
- **관측 AC는 task 마감을 막지 않는다** — 그 AC만 미충족이면 `/validate-workitem` 판정은 `Pending Acceptance`이고(ADR-065 D6) `/finalize-workitem`이 통과시켜 task를 `done`으로 마감하며 `## 8`에 `- ac-pending`을 남긴다. 차단은 사라지지 않고 **마일스톤 졸업**으로 옮겨간다 — 그 상태의 graduation이 `PENDING_ACCEPTANCE`다(ADR-067 D3).
  - **판정값 소유권**: `/validate-workitem`의 report 판정은 `Pass | Pending Acceptance | Needs Fix` 셋이다(ADR-065 D6). `/finalize-workitem`은 그 값을 읽어 분기할 뿐 관측 AC 전용 종료값을 따로 두지 않는다.
- **receipt 발급만으로는 재validate가 필요 없다** — 졸업 item 4 (a')가 채점표가 아니라 task `## 8`을 직접 읽는다(ADR-067 D1). 재validate가 필요한 것은 «코드가 바뀐 task»뿐이다.
- 결함이 있으면 `/repair-acceptance <M>`이 3+1 판정으로 수리한다. 판별 질문은 «이 변경 줄을 기존 계약(AC·`## 3` line item·FAC·INV·승인 프로토타입·DESIGN)으로 거꾸로 추적할 수 있는가»다 — **`in-AC`(추적 가능)면 `/repair-workitem`에 위임해 그 task를 재개방하고, `out-of-AC`(추적 불가)면 재개방 없이 직접 고친 뒤 계약 부채를 `IMPROVEMENT_GUIDE.md` `## 4. 보류 항목`에 `status: open`으로 등재한다**(ADR-066 D4 / ADR-005#amend-1). **코드를 고친 뒤의 후속은 그 skill이 자기 루프 안에서 실행한다 — 사용자가 손으로 돌리지 않는다.** 재개방한 `in-AC` task는 `/validate-workitem` + `/finalize-workitem`까지, 재개방하지 않은 `out-of-AC` 영향 task는 `/validate-workitem`만 돈다(그 task는 계속 `done`이라 마감할 것이 없다).
- **판정이 `미완`이면**(환경 기동 실패·사용자 중단으로 필수 시나리오를 다 확인하지 못함) 환경 복구 또는 사용자 재개 후 `/accept-milestone <M>`을 재실행한다 — **라운드 카운터를 소모하지 않는다**. 판정 3종의 후속은 `/accept-milestone` 출력이 SSOT다.
- 라운드 상한 3회. 초과분은 사용자 확인 후 다음 마일스톤으로 이관한다.
```

### 5.2.2 lifecycle 그림의 inner-loop 분기를 고친다

**앵커**: `   → implement → validate ─┬─Pass─→ finalize → stabilize(+UI: 경험 게이트)`

**교체 범위**: 위 앵커 줄부터 아래 `└─(미충족이 전부 관측 receipt 대기)─→ ...` 줄까지 **3줄**.

**현재 (3줄)**
```
   → implement → validate ─┬─Pass─→ finalize → stabilize(+UI: 경험 게이트)
                           ├─Needs Fix─→ repair → (validate 재실행)
                           └─(미충족이 전부 관측 receipt 대기)─→ accept-milestone --task T-NNN (사용자 receipt) → (validate 재실행)
```
**바꿀 내용 (3줄 → 아래 3줄)**
```
   → implement → validate ─┬─Pass──────────────→ finalize → stabilize(+UI: 경험 게이트)
                           ├─Pending Acceptance→ finalize (## 8에 ac-pending 기록 — 마감을 막지 않는다)
                           └─Needs Fix─────────→ repair → (validate 재실행)
```

### 5.2.3 lifecycle 그림의 마일스톤 층을 고친다

**앵커**: `(권장, ADR-066)  stabilize → accept-milestone <M> (사람 직접 확인) ─┬─승인─→ (영향 task validate 재실행) → stabilize 재실행 → 졸업`

**교체 범위**: 위 앵커 줄부터 그 아래 두 줄(`├─보류─→ ...` / `└─미완─→ ...`)까지 **3줄**.

**현재 (3줄)**
```
(권장, ADR-066)  stabilize → accept-milestone <M> (사람 직접 확인) ─┬─승인─→ (영향 task validate 재실행) → stabilize 재실행 → 졸업
                                                                  ├─보류─→ repair-acceptance → validate 재실행 → accept-milestone 재실행 ─→ (위 분기 재판정)
                                                                  └─미완─→ 환경 복구·사용자 재개 → accept-milestone 재실행 ─→ (위 분기 재판정, 라운드 카운터 미소모)
```
**바꿀 내용 (3줄 → 아래 5줄)**
```
(ADR-066) stabilize ─┬─YES──────────────────→ 졸업 → plan-milestone (다음 M)
                     ├─PENDING_ACCEPTANCE──→ accept-milestone <M> ─┬─승인─→ stabilize 재실행 → 졸업
                     │                                             ├─보류─→ repair-acceptance (in-AC: validate+finalize / out-of-AC: validate) → accept-milestone 재실행
                     ├─NO──────────────────→ repair-milestone (in-AC: validate+finalize / out-of-AC: validate) → stabilize 재실행
                     └─BLOCKED─────────────→ 감사 미완: 그 축 재감사 / e2e blocked-on-env: 환경 복구 (repair 대상 아님 — ADR-067 D3) → stabilize 재실행
```

**⚠ `NO`와 `BLOCKED`를 한 분기로 묶지 않는다.** `BLOCKED`은 «평가 실행 불가»(ADR-067 D3 — 감사 미완 / e2e blocked-on-env)이고 그 처방은 **재감사·환경 복구**다. 묶어서 `/repair-milestone`으로 보내면, 감사 미완이 등재한 `M<N>-audit-<K>` P0는 코드 결함이 아니라 4-판정할 대상이 없어 repair가 헛돈다(4.4.10이 stabilize 단계 8에 넣는 BLOCKED 분기와 같은 이유다 — lifecycle SSOT인 이 그림이 그 분기와 어긋나면 안 된다).

**⚠ 연쇄를 «validate·finalize»로 뭉뚱그리지 않는다.** 실제 계약은 **`in-AC` 위임분만 validate+finalize이고 `out-of-AC` 영향분은 validate까지**다(그 task는 계속 `done`이라 마감할 것이 없다 — 4.2.7 ②·4.3.1 2-C ②). 뭉뚱그리면 7.6 체크리스트 7-1이 막으려는 «`done` task에 finalize를 부르는» 모델이 되살아난다.

*(`미완` 판정은 그림에 넣지 않는다 — 라운드 카운터를 소모하지 않고 같은 자리로 돌아오는 재시도이므로 분기가 아니다. 상세는 `## 5-1`이 SSOT.)*

### 5.2.4 ⭐ `## 3`의 로드맵 유지 문장을 구간별로 바꾼다

**ROADMAP 단독 writer 주장이 남은 마지막 자리다** — `plan-milestone`(5.5.1·5.5.4)·`STRUCTURE`(5.1.4)·`ADR-067`(1.3.10)을 고쳐도 lifecycle SSOT인 이 문서가 «단독으로 유지한다»를 단언하면 정책(ADR-057#amend-4)과 충돌한다.

**앵커**: `- `/plan-milestone`은 `docs/30-workitems/ROADMAP.md`(Done/Now/Next/Later forward 지도)를 단독으로 유지한다`

**교체 대상**: 그 긴 불릿의 **머리 조각만** 바꾼다(뒤의 R3/R0 서술은 그대로 둔다).

**현재 (조각)**
```
- `/plan-milestone`은 `docs/30-workitems/ROADMAP.md`(Done/Now/Next/Later forward 지도)를 단독으로 유지한다
```
**바꿀 내용 (조각)**
```
- `/plan-milestone`은 `docs/30-workitems/ROADMAP.md`의 **`Done`/`Now`/`Next`/`Later` 네 구간을 단독으로 유지한다**(`## Backlog`는 append-only 다중 writer — `/accept-milestone`·`/repair-acceptance`가 행을 추가하고 본 skill이 정리·승격·재분류 등재를 한다, ADR-057#amend-4)
```

### 5.2.5 새 체크아웃 재검증 Note에서 item 4 판독 대상을 정확히 한다

**앵커**: `> **새 체크아웃·다른 worktree에서 마일스톤을 재검증할 때**: 졸업 item 4(AC 충족 100%)는 report를 읽으므로`

**현재 (줄 전체)**
```
> **새 체크아웃·다른 worktree에서 마일스톤을 재검증할 때**: 졸업 item 4(AC 충족 100%)는 report를 읽으므로 report가 없으면 전 task가 미충족으로 나온다. 이는 결함이 아니라 ephemeral 설계의 정상 귀결이다. 재검증 순서는 **① 각 task `/validate-workitem` 재실행(report 생성) → ② `/stabilize-milestone` 실행**이다. `/stabilize-milestone`만 재실행하면 item 4가 전 task 미충족을 낸다.
```
**바꿀 내용**
```
> **새 체크아웃·다른 worktree에서 마일스톤을 재검증할 때**: 졸업 item 4의 **(a)(b)(c)(d)** 는 report를 읽으므로 report가 없으면 전 task가 그 항들에서 미충족으로 나온다(ADR-067 D1). 이는 결함이 아니라 ephemeral 설계의 정상 귀결이다. **(a') 관측 AC receipt는 커밋된 task `## 8`을 직접 읽으므로 체크아웃과 무관하다** — 재검증 때 다시 확인받을 필요가 없다. 재검증 순서는 **① 각 task `/validate-workitem` 재실행(report 생성) → ② `/stabilize-milestone` 실행**이다. `/stabilize-milestone`만 재실행하면 item 4 (a)가 전 task 미충족을 낸다.
```

### 5.2.6 inner-loop 일반 설명의 finalize 조건을 3값에 맞춘다

`## 3`의 lifecycle 산문이 «검증 실패 시 repair / **검증 통과 시** finalize»라는 2값 틀로 남아 있다. 3값 계약에서 `Pending Acceptance`는 «실패»도 «통과»도 아니게 읽혀, 그 task의 finalize를 건너뛰는 경로가 열린다(그러면 task가 `in-progress`로 남아 졸업 item 1이 미충족이 된다). DELEGATION의 같은 자리는 5.3.5가 이미 «`Pass` 또는 `Pending Acceptance`일 때»로 고쳤으므로, 이 줄만 남으면 두 메타 문서가 어긋난다.

**앵커**: `- 검증 통과 시 `/finalize-workitem`으로 status `done` 갱신 + 커밋.`

**현재 (줄 전체)**
```
- 검증 통과 시 `/finalize-workitem`으로 status `done` 갱신 + 커밋.
```
**바꿀 내용**
```
- 판정이 `Pass` **또는 `Pending Acceptance`**면 `/finalize-workitem`으로 status `done` 갱신 + 커밋(ADR-065 D6 — 관측 AC receipt 미발급은 마감을 막지 않고 `## 8`에 `- ac-pending`을 남긴다).
```

---

## 5.3 `docs/00-meta/DELEGATION_STRATEGY.md`

파일: `docs/00-meta/DELEGATION_STRATEGY.md`

### 5.3.1 위임 트리거 표에서 task 스코프 행을 걷어낸다

**앵커**: `| task AC의 사용자·플랫폼 관측 receipt 발급 | 메인 세션 (accept-milestone `--task`) |`

**현재 (줄 전체 — 표의 한 행)**
```
| task AC의 사용자·플랫폼 관측 receipt 발급 | 메인 세션 (accept-milestone `--task`) | `/accept-milestone --task <task-id>`. `/validate-workitem` report의 `## 다음 권장 액션`이 **미충족 AC가 전부 관측 receipt 대기**라고 알린 그 task의 그 AC만 확인·발급하고 `/validate-workitem` 재실행을 안내한다(validate 판정은 `Needs Fix`이고 `Needs Acceptance`는 `/finalize-workitem`의 종료값이다 — 두 이름을 섞지 않는다). 라운드 카운터·`## 11`·마일스톤 원장을 쓰지 않는다 (ADR-066 D1) |
```
**바꿀 내용 (행 교체)**
```
| task AC의 사용자·플랫폼 관측 receipt 발급 | 메인 세션 (accept-milestone — 마일스톤 스코프) | 별도 위임 경로가 아니다. `/validate-workitem`이 그 task를 `Pending Acceptance`로 내면 `/finalize-workitem`이 통과시키고 `## 8`에 `- ac-pending`을 남긴다. receipt는 마일스톤 수용 라운드(`/accept-milestone <M>`)에서 일괄 발급된다. 미발급 상태는 졸업 `PENDING_ACCEPTANCE`가 잡는다 (ADR-065 D1/D6 · ADR-066 D1 · ADR-067 D1) |
```

### 5.3.2 `/repair-acceptance` 행의 재개방 규칙을 고친다

**앵커**: `| 사용자 수용 finding 수리 | 메인 세션 (repair-acceptance) |`

**현재 (줄 전체)**
```
| 사용자 수용 finding 수리 | 메인 세션 (repair-acceptance) | `/repair-acceptance <M>`. 3+1 판정(Reject-FP 없음 — 사용자 관측은 기각 대상 아님), 회귀 테스트 선행, 기존 task 재개방 X, 커밋 X (ADR-066 D4) |
```
**바꿀 내용**
```
| 사용자 수용 finding 수리 | 메인 세션 (repair-acceptance) | `/repair-acceptance <M>`. 3+1 판정(Reject-FP 없음 — 사용자 관측은 기각 대상 아님), 회귀 테스트 Red→Green 선행, **in-AC는 `/repair-workitem` 위임(재개방) / out-of-AC는 직접 수정 + 계약 부채 등재**, 수정 뒤 후속 연쇄를 자기 루프에서 실행(**in-AC 위임분은 `/validate-workitem`+`/finalize-workitem`, out-of-AC 영향 task는 `/validate-workitem`만** — 그 task는 계속 `done`이라 마감할 것이 없다), 커밋 X (ADR-066 D4) |
```

**⚠ 5.2.3과 같은 이유로 연쇄를 뭉뚱그리지 않는다** — `out-of-AC` 영향 task에 finalize를 부르면 1-G의 read-only no-op에 걸려 «마감»으로 보이는 거짓 신호가 남는다(7.6 체크리스트 7-1).

### 5.3.3 `/repair-milestone` 행에 연쇄를 명시한다

**앵커**: `| stabilize cross-review 결과 회수 + 종합 | 메인 세션 (repair-milestone) |`

**현재 (줄 전체)**
```
| stabilize cross-review 결과 회수 + 종합 | 메인 세션 (repair-milestone) | 원본 세션에서 `/repair-milestone`. stabilize-reviews 회수 → 4-판정·dedup → 적용 → 삭제 (ADR-054). |
```
**바꿀 내용**
```
| stabilize cross-review 결과 회수 + 종합 | 메인 세션 (repair-milestone) | 원본 세션에서 `/repair-milestone`. stabilize-reviews 회수 → 4-판정·dedup → 적용 → 삭제 (ADR-054). **per-task 결함은 `/repair-workitem`에 위임하고, 그 뒤 `/validate-workitem`·`/finalize-workitem`까지 자기 루프에서 실행해 재개방 루프를 닫는다**(ADR-057#amend-3 결정 5). |
```

### 5.3.4 lifecycle 번호 목록에서 5.5를 걷어낸다

**앵커**: `5.5. (validate가 미충족 AC를 **전부 관측 receipt 대기**로 낸 때만`

**교체 범위**: 위 앵커 줄(5.5) **1줄만** 교체한다.

**현재 (줄 전체)**
```
5.5. (validate가 미충족 AC를 **전부 관측 receipt 대기**로 낸 때만 — report `## 다음 권장 액션`이 지시. validate 판정 자체는 `Needs Fix`이고 `Needs Acceptance`는 7의 종료값이다) `/accept-milestone --task T-NNN` — 그 task의 `[사용자 관측]`·`[플랫폼 관측]` AC receipt를 사용자가 발급 → `/validate-workitem T-NNN` 재실행 → 7(finalize). 라운드 카운터·`## 11` 미소모 (ADR-066 D1).
```
**바꿀 내용**
```
5.5. validate 판정은 `Pass | Pending Acceptance | Needs Fix` 셋이다(ADR-065 D6). **`Pending Acceptance`(관측 AC receipt만 미발급)는 6을 건너뛰고 바로 7로 간다** — finalize가 통과시키고 task `## 8`에 `- ac-pending`을 남긴다. 그 receipt는 마일스톤 수용 라운드에서 발급되고, 미발급 상태는 졸업 `PENDING_ACCEPTANCE`가 잡는다 (ADR-066 D1 / ADR-067 D1 item 4 (a')).
```

### 5.3.5 6·7의 조건 표기를 3값에 맞춘다

**앵커**: `6. `/repair-workitem` (Needs Fix일 때만) → report의 실패 항목 수정`

**현재 (그 줄과 다음 줄 — 2줄)**
```
6. `/repair-workitem` (Needs Fix일 때만) → report의 실패 항목 수정
7. `/finalize-workitem` (Pass일 때) → status `done` 갱신 + 명시적 파일 add + Conventional Commits 커밋 (정책: [ADR-007](../90-decisions/boilerplate/ADR-007-workitem-lifecycle.md), [ADR-008](../90-decisions/boilerplate/ADR-008-commit-convention.md)) + feature 전 task done 시 FAC closure 요약(ADR-057 결정 5)
```
**바꿀 내용 (2줄 교체)**
```
6. `/repair-workitem` (`Needs Fix`일 때만) → report의 실패 항목 수정
7. `/finalize-workitem` (`Pass` 또는 `Pending Acceptance`일 때) → status `done` 갱신 + 명시적 파일 add + Conventional Commits 커밋 (정책: [ADR-007](../90-decisions/boilerplate/ADR-007-workitem-lifecycle.md), [ADR-008](../90-decisions/boilerplate/ADR-008-commit-convention.md)) + feature 전 task done 시 FAC closure 요약(ADR-057 결정 5)
```

### 5.3.6 ⭐ lifecycle 번호 목록 8.5·8.6·8.7을 새 계약에 맞춘다

**Phase 5가 WORKFLOW는 꼼꼼히 쓸었는데 DELEGATION의 번호 목록 뒷부분이 통째로 빠져 있다.** 특히 8.7은 *"`## 8`을 갱신한 task가 있으면 그 task의 `/validate-workitem`이 선행돼야 한다"* 를 단언하는데, **이번 개선이 없애는 바로 그 동작이다.**

**앵커**: `8.5. (권장) `/accept-milestone M-N` — 사람이 직접 실행·확인.`

**교체 범위**: 8.5·8.6·8.7 **세 줄**을 통째로 교체한다(각각 한 줄이며 연속한다). 8.5 위의 들여쓴 불릿(`   - `/stabilize-milestone`은 evaluator-optimizer pattern...`)과 8.7 다음의 빈 줄은 건드리지 않는다.

**현재 (3줄 전체)**
```
8.5. (권장) `/accept-milestone M-N` — 사람이 직접 실행·확인. 승인 시 8.7로(단 **`(수용)` 태그로 이번 M 수리를 택한 개선 제안이 있으면 8.6을 먼저** — 그 항목의 유일한 실행 경로다, ADR-066 D5), 보류 시 8.6으로, **`미완`이면 환경 복구·사용자 재개 후 8.5 재실행**(라운드 카운터 미소모 — 확인을 못 했으므로 회차로 세지 않는다) (ADR-066).
8.6. (보류 시 · 또는 위 `(수용)` 개선 항목이 있을 때) `/repair-acceptance M-N` → 영향 task `/validate-workitem` 재실행 → `/accept-milestone M-N` 재실행. 라운드 상한 3.
8.7. `/stabilize-milestone M-N` 재실행 — 수용 라운드의 코드·receipt 변경을 재검증하고 졸업 판정을 확정한다. **`## 8`을 갱신한 task가 있으면 그 task의 `/validate-workitem`이 선행돼야 한다**(졸업 item 4가 report를 읽고 stale을 미충족 처리 — ADR-067 D1 item 4 (d)).
```

**바꿀 내용 (3줄 → 아래 3줄)**
```
8.5. `/accept-milestone M-N` — 사람이 직접 실행·확인. **8의 graduation이 `PENDING_ACCEPTANCE`면 이 단계가 유일한 처방이고, `YES`(= 관측 modality AC가 0건이거나 그 receipt가 이미 전부 유효)면 선택이다** (ADR-067 D3/D6). 승인 시 8.7로(단 **`(수용)` 태그로 이번 M 수리를 택한 개선 제안이 있으면 8.6을 먼저** — 그 항목의 유일한 실행 경로다, ADR-066 D5), 보류 시 8.6으로, **`미완`이면 환경 복구·사용자 재개 후 8.5 재실행**(라운드 카운터 미소모) (ADR-066).
8.6. (보류 시 · 또는 위 `(수용)` 개선 항목이 있을 때) `/repair-acceptance M-N` → 그 skill이 **자기 루프 안에서** in-AC 위임분의 `/repair-workitem`·`/validate-workitem`·`/finalize-workitem`과 out-of-AC 영향 task의 `/validate-workitem`을 수행한다(사용자가 손으로 돌리지 않는다) → `- invalidated`가 있으면 `/accept-milestone M-N` 재실행. 라운드 상한 3.
8.7. `/stabilize-milestone M-N` 재실행 — 수용 라운드의 코드·receipt 변경을 재검증하고 졸업 판정을 확정한다. **receipt 발급만으로는 재validate가 필요 없다** — 졸업 item 4 (a')가 채점표가 아니라 task `## 8`을 직접 읽는다(ADR-067 D1). 재validate가 필요한 것은 «코드가 바뀐 task»뿐이고 그것은 8.6의 skill이 이미 수행했다.
```

### 5.3.7 위임 표의 accept-milestone 행에서 무조건 «권장»을 뗀다

**앵커**: `| 마일스톤 결과의 사용자 직접 확인 (권장) | 메인 세션 (accept-milestone) |`

**현재 (줄 전체 — 표의 한 행)**
```
| 마일스톤 결과의 사용자 직접 확인 (권장) | 메인 세션 (accept-milestone) | `/accept-milestone <M>`. 환경 기동 + 시나리오 안내 + 피드백 3갈래 라우팅. 코드·커밋 X. `- ac-acceptance` receipt는 사용자 응답을 옮겨 적는다(대행 발급 금지 — ADR-065 D1 / ADR-066) |
```
**바꿀 내용**
```
| 마일스톤 결과의 사용자 직접 확인 (관측 AC 0건이면 권장·선택 / 1건 이상이면 사실상 필수) | 메인 세션 (accept-milestone) | `/accept-milestone <M>`. 마일스톤 단위만 — task 스코프 없음. 환경 기동 + 시나리오 안내 + 피드백 3갈래 라우팅(계약 변경 → ROADMAP `## Backlog`). 코드·커밋 X. `- ac-acceptance` receipt는 사용자 응답을 옮겨 적는다(대행 발급 금지 — ADR-065 D1 / ADR-066). 미발급 상태는 졸업 `PENDING_ACCEPTANCE`가 잡는다 (ADR-067 D3) |
```

---

## 5.4 `README.md` / `README_ko.md` — 흐름 다이어그램

두 파일의 흐름 코드블록 마지막 줄을 고친다. **두 파일 모두 적용한다.**

### 5.4.1 `README.md`

파일: `README.md`

**앵커**: `  → /validate-workitem → /repair-workitem (if Needs Fix) → /finalize-workitem`

**교체 범위**: 위 앵커 줄과 그 다음 줄(`  → /stabilize-milestone`) **2줄**.

**현재 (2줄)**
```
  → /validate-workitem → /repair-workitem (if Needs Fix) → /finalize-workitem
  → /stabilize-milestone
```
**바꿀 내용 (2줄 → 아래 3줄)**
```
  → /validate-workitem → /repair-workitem (if Needs Fix) → /finalize-workitem (Pass or Pending Acceptance)
  → /stabilize-milestone
       └─ if PENDING_ACCEPTANCE → /accept-milestone M1 (you try it yourself) → /repair-acceptance (if defects) → /stabilize-milestone again
```

### 5.4.2 `README_ko.md`

파일: `README_ko.md`

**앵커**: `  → /validate-workitem → /repair-workitem (Needs Fix일 때) → /finalize-workitem`

**교체 범위**: 위 앵커 줄과 그 다음 줄(`  → /stabilize-milestone`) **2줄**.

**현재 (2줄)**
```
  → /validate-workitem → /repair-workitem (Needs Fix일 때) → /finalize-workitem
  → /stabilize-milestone
```
**바꿀 내용 (2줄 → 아래 3줄)**
```
  → /validate-workitem → /repair-workitem (Needs Fix일 때) → /finalize-workitem (Pass 또는 Pending Acceptance)
  → /stabilize-milestone
       └─ PENDING_ACCEPTANCE면 → /accept-milestone M1 (사용자가 직접 확인) → /repair-acceptance (결함 있으면) → /stabilize-milestone 재실행
```

---

## 5.5 `/plan-milestone` — ROADMAP `## Backlog` 회수

파일: `.claude/skills/plan-milestone/SKILL.md`

### 5.5.1 R0의 로드맵 재조정에 `## Backlog` 회수와 4값 가드를 넣는다

**앵커**: `- **로드맵 재조정 (ADR-057#amend-1)**: `docs/30-workitems/ROADMAP.md`를 읽어`

**현재 (줄 전체)**
```
- **로드맵 재조정 (ADR-057#amend-1)**: `docs/30-workitems/ROADMAP.md`를 읽어 직전 마일스톤 `## 8. 회고`의 `graduation:` 판정 + task done/total로 Done/Now 구간을 최신화한다(graduation=YES면 Now→Done 스냅샷, 진행 중이면 진척 갱신). **미졸업 Now 가드**: 현재 Now 마일스톤의 graduation이 YES가 아니면(진행 중·NO·BLOCKED) *명시적 병렬 승인이 없는 한* 새 마일스톤을 Now로 추가하지 않는다 — "현재 Now(M<N>) 미졸업 — 완료 후 진행 권장"을 안내하고 새 Now 생성을 보류(단일 Now 규율). Next 후보를 Now로 승격·중복 생성 방지를 위해 각 Next/Later 행은 안정적 candidate key(목표 슬러그)를 갖는다. 로드맵은 plan-milestone만 쓴다.
```
**바꿀 내용**
```
- **로드맵 재조정 (ADR-057#amend-1·#amend-4)**: `docs/30-workitems/ROADMAP.md`를 읽어 직전 마일스톤 `## 8. 회고`의 `graduation:` 판정 + task done/total로 Done/Now 구간을 최신화한다(graduation=YES면 Now→Done 스냅샷, 진행 중이면 진척 갱신). **미졸업 Now 가드**: 현재 Now 마일스톤의 graduation이 `YES`가 아니면(진행 중·`PENDING_ACCEPTANCE`·`NO`·`BLOCKED`) *명시적 병렬 승인이 없는 한* 새 마일스톤을 Now로 추가하지 않는다 — 안내 문구는 판정별로 갈린다: `PENDING_ACCEPTANCE`면 **"현재 Now(M<N>) 수용 대기 — `/accept-milestone M<N>` 후 진행 권장"**, 그 외면 "현재 Now(M<N>) 미졸업 — 완료 후 진행 권장". 어느 쪽이든 새 Now 생성을 보류한다(단일 Now 규율). Next 후보를 Now로 승격·중복 생성 방지를 위해 각 Next/Later 행은 안정적 candidate key(목표 슬러그)를 갖는다. **로드맵의 `Done`/`Now`/`Next`/`Later` 네 구간은 plan-milestone만 쓴다** — `## Backlog`만 append-only 다중 writer이며(ADR-057#amend-4 결정 2) 그 구간의 정리·승격도 본 skill이 한다.
- **`## Backlog` 회수 (ADR-057#amend-4)**: 같은 파일의 `## Backlog` 절을 읽어 **수용 라운드·repair-acceptance가 쌓아 둔 범위 후보**를 전수 회수하고 R1의 목표 후보 재료로 넣는다. 각 행은 `- `<candidate-key>` <요약> — 출처: ... / 확신도: ...` 형식이다. **자동 편입하지 않는다 — R0는 회수만 한다.** 사용자 선택은 R1, 분할 확정은 R2이므로 **R0에서 Backlog 행을 제거·이동하지 않는다**(확정 전에 지우면 R2에서 빠진 항목이 사라진다). 착수·후속 배정이 확정된 뒤 **R1이 그 항목의 `## Backlog` 행을 제거하고 candidate-key를 인계한다**(ADR-057#amend-4 결정 3 «Next로 승격하며 Backlog 행 제거» + `## 현재 유효 결정`의 «회수는 R0 → R1») — 이번에 착수하는 분은 R3의 `Now` 행이, 후속 분은 `## Next` 행이 그 key를 그대로 쓴다(#amend-1 candidate-key 매칭 — 중복 생성 방지). 택하지 않은 항목은 그대로 둔다.
```

**⚠ 제거 시점을 R0에 두지 않는다** — R0는 «직전 마일스톤 회수» 라운드이고 사용자 선택은 R1·분할 확정은 R2다. R0에서 행을 지우면 **R2에서 범위에서 빠진 항목이 아무 원장에도 없이 사라진다.** 또 목적지를 `Now`로 적으면 R3의 «이번 마일스톤 행을 Now로 쓴다»와 같은 행을 두 라운드가 쓰게 되고, ADR-057#amend-4 결정 3의 «Next로 승격» 규정과도 어긋난다. **제거는 R1(5.5.3이 이미 R1을 `## Backlog` writer로 만든다), 실체화는 R3**로 갈라 둔다 — 그러면 5.5.4의 «R3는 `## Backlog`를 건드리지 않는다»도 그대로 유지된다.

### 5.5.2 R0의 개선·QA 회수에 `scope: out-of-AC` surface를 넣는다

`/repair-acceptance`가 `## 4. 보류 항목`에 등재한 «계약 미반영» 항목은 **여기서 회수되지 않으면 영구히 계약 밖에 남는다.** 등재만 하고 읽는 쪽이 없으면 반쪽이다.

**앵커**: `- `docs/40-validation/IMPROVEMENT_GUIDE.md`·`docs/40-validation/QA_FINDINGS.md`의 *open* 항목(특히 P0/P1)을 회수해,`

그 불릿의 **끝에** 아래 문장을 이어 붙인다(새 불릿을 만들지 않는다).

```
 **`scope: out-of-AC` 항목은 별도로 surface한다 (ADR-005#amend-1 / ADR-066 D4)**: `IMPROVEMENT_GUIDE.md` `## 4. 보류 항목`에서 `scope: out-of-AC` + `status: open`인 항목을 전수 회수한다 — **HTML 주석(`<!-- ... -->`) 밖의 줄만 센다**(그 섹션 주석에 같은 술어의 형식 예시가 들어 있어, 주석까지 세면 매 라운드 `<M>-uat-<N>` 유령 항목이 올라온다 — ADR-064 D4 판독 규칙과 동형). 회수한 각 항목에 대해 **«이 동작을 AC로 승격할 것인가»** 를 사용자에게 묻는다. 이것은 「코드에는 들어갔으나 어느 계약에도 근거가 없는 변경」이며, 승격을 택하면 **R4에서 그 feature `## 7. FAC`에 항목으로 넣는다** — **task AC는 본 skill이 만들지 않는다**(위 「경계」: milestone + feature까지. `/plan-workitem`이 그 FAC를 받아 AC로 분해하고 `## 7-1` 매핑을 채운다 — ADR-057 결정 1). 원본은 **그 FAC가 실재한 뒤**(R4 이후) `status: resolved (승격: <feature-id>:FAC-N)`로 닫는다 — N-3 앵커는 실재하는 대상을 가리켜야 한다(ADR-005#amend-1). 택하지 않으면 그대로 열어 둔다. **자동 승격하지 않는다** — 계약을 넓히는 것은 사용자 결정이다.
```

**⚠ «task AC로 넣는다»를 쓰지 않는다.** 이 skill은 도입부에서 **«milestone + feature까지만 만든다 — task 분해는 `/plan-workitem`이 이어 수행한다»** 를 스스로 선언하고, R4의 `## 7-1` 항목도 «빈 shell만 둔다»로 못 박혀 있다. R0 시점엔 그 feature 문서조차 없으므로(R4가 만든다) 원문 그대로 두면 **자기 경계를 위반하는 실행 불가 지시**가 된다. FAC까지만 넣고 원본은 그 FAC가 생긴 뒤 닫는다.

### 5.5.3 R1의 `(미할당)` triage 옆에 원장 재분류 규칙을 붙인다

**앵커**: `  - **`(미할당)` 결정 triage (ADR-060 D1)**: `docs/10-charter/DECISION_REGISTER.md`에서 `영향: (미할당)` + `status: open`인 항목을 전수 회수해,`

그 불릿의 **끝에** 아래 문장을 이어 붙인다.

```
 **원장 재분류 규칙 (ADR-005#amend-1) — 본 라운드에서 두 방향을 함께 처리한다.** ① **DECISION_REGISTER → ROADMAP**: 회수한 결정 항목이 «정본 문서의 한 절»이 아니라 «다음 마일스톤 문서 하나»로 해소되는 것이면 결정 원장이 아니라 ROADMAP `## Backlog`가 제자리다. ② **IMPROVEMENT_GUIDE → ROADMAP**: R0가 회수한 `IMPROVEMENT_GUIDE` open 항목 중 «그것을 하면 task 이하가 아니라 마일스톤 하나가 되는» 것도 Backlog가 제자리다. 어느 방향이든 **원본을 `status: resolved (재분류: ROADMAP ## Backlog <candidate-key>)`로 닫고 Backlog에 등재한다**(N-2·N-3 불변식 — 두 곳에 동시에 열어 두지 않는다). **`## Backlog`는 `/accept-milestone`·`/repair-acceptance`도 append할 수 있는 구간이지만(ADR-057#amend-4 결정 2) «다른 원장에서 옮겨 오는» 재분류는 본 skill만 한다** — 원본을 닫는 일과 등재를 한 트랜잭션으로 묶어야 N-2가 지켜지고, 그 둘을 함께 볼 수 있는 자리가 여기뿐이다. **R0가 회수한 Backlog 항목 중 착수·후속 배정이 확정된 것의 `## Backlog` 행 제거도 이 라운드에서 한다** — 제거한 candidate-key는 R3의 `Now` 행(이번 착수분) 또는 `## Next` 행(후속분)이 그대로 이어받는다(ADR-057#amend-4 결정 3).
```

### 5.5.4 R3의 「로드맵은 plan-milestone만 쓴다」도 구간별로 정정한다

같은 문장이 R0(5.5.1)과 R3에 두 번 있다. 한쪽만 고치면 같은 파일이 서로 다른 계약을 말한다.

**앵커**: `- **로드맵 갱신 (ADR-057#amend-1)**: `docs/30-workitems/ROADMAP.md`(baseline shell 존재 — 없으면 헤더 포함 생성)에 이번 마일스톤 행을 **Now**로 쓴다`

**교체 대상**: 그 긴 불릿의 **마지막 문장**(`로드맵은 plan-milestone만 쓴다.`)만 바꾼다. 줄 전체를 다시 쓰지 않는다.

**현재 (조각)**
```
로드맵은 plan-milestone만 쓴다.
```
**바꿀 내용 (조각)**
```
로드맵의 `Done`/`Now`/`Next`/`Later` 네 구간은 plan-milestone만 쓴다 — `## Backlog`만 append-only 다중 writer다(ADR-057#amend-4 결정 2). **R3는 `## Backlog`를 건드리지 않는다**(회수·승격은 R0·R1 담당).
```

---

## 5.6 `ADR-057` — graduation 4값 반영

파일: `docs/90-decisions/boilerplate/ADR-057-planning-v2-batch-and-seam.md`

**앵커**: `4. **stabilize-milestone 읽기 전용 유지**: 로드맵 파일을 직접 건드리지 않는다.`

**현재 (줄 전체)**
```
4. **stabilize-milestone 읽기 전용 유지**: 로드맵 파일을 직접 건드리지 않는다. graduation 판정(`YES|NO|BLOCKED (날짜)`)만 마일스톤 `## 8. 회고`에 영속하고(ADR-067 D3 회고 스키마 동반), 다음 plan-milestone R0가 그것을 읽어 로드맵을 재조정한다.
```
**바꿀 내용**
```
4. **stabilize-milestone 읽기 전용 유지**: 로드맵 파일을 직접 건드리지 않는다. graduation 판정(`YES|PENDING_ACCEPTANCE|NO|BLOCKED (날짜)` — ADR-067 D3)만 마일스톤 `## 8. 회고`에 영속하고(ADR-067 D3 회고 스키마 동반), 다음 plan-milestone R0가 그것을 읽어 로드맵을 재조정한다.
```

---

## 5.7 Codex wrapper — `accept-milestone`

파일: `.agents/skills/accept-milestone/SKILL.md`

**앵커**: `description: Use ONLY when the user explicitly types `$accept-milestone <milestone-id>` or `$accept-milestone --task <task-id>`. Do not trigger implicitly from generic phrasing.`

**바꿀 내용**
```
description: Use ONLY when the user explicitly types `$accept-milestone <milestone-id>`. Do not trigger implicitly from generic phrasing.
```

**다른 Codex wrapper는 손대지 않는다** — 나머지는 본체 SKILL.md를 그대로 가리키므로 자동으로 새 계약을 따른다.

> **Codex의 연쇄 parity**: Codex에는 `Skill` 도구가 없고 wrapper가 `allowed-tools`를 무시하라고 지시한다. 그래도 4.2.7·4.3.1의 연쇄는 실행 가능하다 — wrapper 패턴 자체가 «본체 `SKILL.md`를 읽고 그 절차를 따른다»이므로, 연쇄 대상 skill의 `SKILL.md`를 읽어 같은 순서로 직접 수행하면 된다(각 연쇄 블록의 마지막 불릿이 그렇게 지시한다). 결과는 동일하고 소요만 늘어난다.

---

## 5.8 `strategist.md` — ROADMAP writer 문구를 구간별로 바꾼다

파일: `.claude/agents/strategist.md`

이 agent는 로드맵을 읽고 우선순위 제안만 한다(그 제약은 안 바뀐다). 다만 근거로 적은 «단독 writer» 사실 주장이 amend-4 이후 거짓이 된다.

**앵커**: `> **ROADMAP 은 `/plan-milestone` 단독 writer다**(ADR-057#amend-1).`

**교체 대상**: 그 줄의 **머리 조각만** 바꾼다(뒤의 «본 agent 는 읽고 …» 서술은 그대로 둔다).

**현재 (조각)**
```
> **ROADMAP 은 `/plan-milestone` 단독 writer다**(ADR-057#amend-1).
```
**바꿀 내용 (조각)**
```
> **ROADMAP 의 `Done`/`Now`/`Next`/`Later` 구간은 `/plan-milestone` 단독 writer다**(ADR-057#amend-1·#amend-4 — `## Backlog`만 append-only 다중 writer이며 그 역시 본 agent 의 write 대상은 아니다).
```

---

## 5.9 ADR 인덱스 — ADR-066 요약 행의 «재개방 X»를 고친다

파일: `docs/90-decisions/boilerplate/README.md`

`/repair-acceptance`가 `in-AC` 항목을 재개방하게 되므로 인덱스 요약이 거짓이 된다.

**앵커**: `| 066 | Milestone acceptance | accepted | — |`

**현재 (줄 전체 — 표의 한 행)**
```
| 066 | Milestone acceptance | accepted | — | /accept-milestone(사람 직접 확인·권장) + /repair-acceptance(3+1 판정·task 재개방 X) + 피드백 3갈래 라우팅 |
```
**바꿀 내용**
```
| 066 | Milestone acceptance | accepted | — | /accept-milestone(사람 직접 확인 — 관측 AC 있으면 사실상 필수, 마일스톤 스코프 단독) + /repair-acceptance(3+1 판정 · in-AC는 repair-workitem 위임(재개방)/out-of-AC는 직접 수정 + 계약 부채) + 피드백 3갈래 라우팅 + D6 pattern-scan |
```

---

**Phase 5 커밋**

```
docs(meta): align workflow, delegation, structure and roadmap docs with the new acceptance contract
```

---

# Phase 6 — 죽은 ADR 인용 정리

ADR-045#amend-2 D10(1.4에서 만든 것)을 **실제로 적용하는** 단계다. 대상은 `## Status`가 `superseded`로 시작하는 ADR 둘 — **ADR-014**(→ ADR-067)와 **ADR-049**(→ ADR-058)를 인용하는 줄이다.

**적용 전 건수: 22건** (필터 적용 후). 적용 후 0건이어야 한다.

파일별 분포 = `ADR-067` 6 + `ADR-058` 4 + `SIMULATION_RUN` 3 + `design-workflow-eval/REPORT` 2 + `ADR-027` 2 + `STRUCTURE`·`ADR-040`·`ADR-047`·`ADR-056`·`ADR-066` 각 1 = **22**. 아래 6.1~6.10이 그 전부이며, **ADR-067 6건 중 2건(6.10.3·6.10.4)은 §1.3.1·§1.3.8이 Phase 1에서 이미 흡수하므로 여기서 건너뛴다.**

> 주: `.boilerplate/validation/design-workflow-eval-20260720/`는 `.gitignore` 대상(로컬 전용)이다. 그 폴더가 없는 체크아웃에서는 기준선이 22가 아니라 20이며, 그 차이는 결함이 아니다.

> **원칙**: 대부분은 «역사·선언»이라 **문장을 고치지 않고 줄 끝에 마커만 붙인다.** 마커를 붙일 수 없는 것(배경 서술·번호 충돌)만 문장을 손본다.

> **⚠ 마커는 리터럴 `(현재 SSOT:` 여야 한다 — 이 형태가 아니면 검사가 그 줄을 건너뛰지 않는다.** ADR-045#amend-2 D10은 «그 줄 끝에 `(현재 SSOT: ADR-NNN)`을 병기한다»로 규정하고, `/stabilize-milestone` §1.0과 아래 7.2는 **`(현재 SSOT:` 문자열이 있는 줄**만 제외한다. 그래서 포인터를 **기존 괄호 안에 넣으면 안 된다** — `(… — ADR-049 supersede, 현재 SSOT: ADR-058)`처럼 쓰면 리터럴 `(현재 SSOT:`가 만들어지지 않아 그 줄이 그대로 `P2 [Ref-dead]`로 발화하고 **7.2의 «22 → 0»이 실패한다.** 기존 괄호를 닫고 **독립 괄호로 덧붙인다** — `(… — ADR-049 supersede) (현재 SSOT: ADR-058)`. 산문형(«현재 SSOT 대응: …», «현재 SSOT는 …이며»)도 같은 이유로 쓰지 않는다.

---

## 6.1 `.boilerplate/validation/SIMULATION_RUN.md` — 3건 (종류 E: 실행 기록)

파일: `.boilerplate/validation/SIMULATION_RUN.md`

### 6.1.1 본문 중간의 시점 주석을 문서 상단으로 옮긴다

현재 이 주석이 Round 기록 리스트 **한가운데**(항목 사이)에 끼어 있어 리스트를 분절한다. D10은 «문서 상단 1회»를 규정한다.

**앵커**: `> 주: 본 문서의 `ADR-014` 인용은 기록 당시 기준이다. 현재 유효 ADR은 ADR-067이다.`

이 줄을 **삭제한다**(앞뒤 빈 줄도 함께 정리해 리스트가 이어지게 한다).

### 6.1.2 문서 상단에 시점 주석을 1회 둔다

이 파일의 **첫 헤딩(`# `로 시작하는 줄) 바로 다음**에 빈 줄 하나와 함께 아래를 삽입한다.

```
> **기록 시점 주석 (ADR-045#amend-2 D10 — 종류 E)**: 본 문서는 회차별 실행 기록이다. 본문의 ADR 인용은 **그 회차에 실제로 적용된 규칙**을 가리키며 현행 SSOT가 아닐 수 있다. **기록을 사실대로 두기 위해 원문을 고치지 않는다.** (현재 SSOT: `ADR-014` → [ADR-067](../../docs/90-decisions/boilerplate/ADR-067-milestone-graduation-v2.md) / `ADR-049` → [ADR-058](../../docs/90-decisions/boilerplate/ADR-058-design-workflow.md))
```

### 6.1.3 남은 두 줄에 마커를 붙인다

**앵커**: `- **stabilize-milestone**: graduation pre-check(ADR-014) 5/5 통과. `--dry-run` 없이 진행.`

**바꿀 내용**
```
- **stabilize-milestone**: graduation pre-check(ADR-014) 5/5 통과. `--dry-run` 없이 진행. (현재 SSOT: ADR-067)
```

**앵커**: `**결함 아님 1 — validation report의 gitignore (기각).**`

이 줄은 매우 길다. **줄 전체를 다시 쓰지 말고 줄 끝에만** 아래를 덧붙인다(줄 마지막 문자 `(본 라운드가 그 실례).` 뒤).

```
 (현재 SSOT: ADR-067)
```

---

## 6.2 `.boilerplate/validation/design-workflow-eval-20260720/REPORT.md` — 2건 (종류 E)

파일: `.boilerplate/validation/design-workflow-eval-20260720/REPORT.md`

### 6.2.1 문서 상단에 시점 주석을 둔다

**앵커**: `> 일자: 2026-07-20`

그 줄 **바로 뒤에** 아래를 삽입한다(같은 인용 블록 안).

```
> **기록 시점 주석 (ADR-045#amend-2 D10 — 종류 E)**: 본 문서는 2026-07-20 시점의 평가 기록이다. 본문의 `ADR-049` 인용은 그때의 현행 ADR을 가리킨다. **기록을 사실대로 두기 위해 원문을 고치지 않는다.** (현재 SSOT: [ADR-058](../../../docs/90-decisions/boilerplate/ADR-058-design-workflow.md))
```

### 6.2.2 두 줄에 마커를 붙인다

**앵커**: `| ADR-049 | 사용자 우선 위계를 뒤집으므로 신규 superseding ADR | 최종 표는 ADR-049 재정렬 | 신규 Design Workflow ADR로 통일 |`

**바꿀 내용** (표의 마지막 칸에 마커를 넣는다 — 표 구조를 깨지 않는다)
```
| ADR-049 | 사용자 우선 위계를 뒤집으므로 신규 superseding ADR | 최종 표는 ADR-049 재정렬 | 신규 Design Workflow ADR로 통일 (현재 SSOT: ADR-058) |
```

**앵커**: `1. **신규 Design Workflow ADR**: ADR-049를 supersede. DS-1 reference flow, DS-3 concept/preview acceptance, DS-5 REFINE/EXPLORE를 소유한다.`

**바꿀 내용**
```
1. **신규 Design Workflow ADR**: ADR-049를 supersede. DS-1 reference flow, DS-3 concept/preview acceptance, DS-5 REFINE/EXPLORE를 소유한다. (현재 SSOT: ADR-058)
```

---

## 6.3 `docs/00-meta/STRUCTURE.md` — 1건 (종류 D: supersede 선언)

파일: `docs/00-meta/STRUCTURE.md`

**앵커**: `| UI 디자인 워크플로우 (R0~R6 + evidence-on-demand 리서치 + 수용 게이트 + REFINE/EXPLORE 시안) |`

**현재 (줄 전체 — 표의 한 행)**
```
| UI 디자인 워크플로우 (R0~R6 + evidence-on-demand 리서치 + 수용 게이트 + REFINE/EXPLORE 시안) | [ADR-058](../90-decisions/boilerplate/ADR-058-design-workflow.md) (정책 SSOT — ADR-049 supersede). → ADR-058 `## Surfaces` 참조. DESIGN.md *내용*·인터페이스 할당은 [ADR-027](../90-decisions/boilerplate/ADR-027-interface-decision-allocation.md). |
```
**바꿀 내용**
```
| UI 디자인 워크플로우 (R0~R6 + evidence-on-demand 리서치 + 수용 게이트 + REFINE/EXPLORE 시안) | [ADR-058](../90-decisions/boilerplate/ADR-058-design-workflow.md) (정책 SSOT — ADR-049 supersede) (현재 SSOT: ADR-058). → ADR-058 `## Surfaces` 참조. DESIGN.md *내용*·인터페이스 할당은 [ADR-027](../90-decisions/boilerplate/ADR-027-interface-decision-allocation.md). |
```

---

## 6.4 `ADR-027` — 2건 (종류 D)

파일: `docs/90-decisions/boilerplate/ADR-027-interface-decision-allocation.md`

두 줄 다 «ADR-058이 ADR-049를 supersede했다»는 선언이다. **문장을 고치지 않고 줄 끝에 마커만 붙인다.**

### 6.4.1

**앵커**: `**디자인 워크플로우 라운드 구조·R0 리서치·수용 게이트·시안 카드 SSOT는 [ADR-058](ADR-058-design-workflow.md)**(ADR-049 supersede).`

**바꿀 내용** (줄 끝 조각만 교체)
```
**디자인 워크플로우 라운드 구조·R0 리서치·수용 게이트·시안 카드 SSOT는 [ADR-058](ADR-058-design-workflow.md)**(ADR-049 supersede) (현재 SSOT: ADR-058).
```

### 6.4.2

**앵커**: `design-preview.html *산출물*은 ADR-058 R6이 계속 사용.`

**바꿀 내용** (줄 끝 조각만 교체)
```
design-preview.html *산출물*은 ADR-058 R6이 계속 사용. (현재 SSOT: ADR-058)
```

---

## 6.5 `ADR-040` — 1건 (종류 C: 배경 서술 → 링크 제거 + 산문 재작성)

파일: `docs/90-decisions/boilerplate/ADR-040-external-research-capability.md`

이 줄은 «그 ADR의 이런 점이 문제였다» 류 배경 서술이다. D10은 C를 **링크 제거 + 산문 재작성**으로 처리한다.

**앵커**: `- [관측됨] bootstrap-design R0의 무거운 분해가 웹 도구 없는 architect에 위임돼 있어 실 웹 grounding 경로가 0 →`

**현재 (줄 전체)**
```
- [관측됨] bootstrap-design R0의 무거운 분해가 웹 도구 없는 architect에 위임돼 있어 실 웹 grounding 경로가 0 → "모델 지식 기반" fallback으로 median 회귀(ADR-049#amend-1 근거가 자인한 슬롭 근본원인). 텍스트 4축 요약은 코드 증거가 없어 R2 concept 생성 입력이 빈약.
```
**바꿀 내용**
```
- [관측됨] bootstrap-design R0의 무거운 분해가 웹 도구 없는 architect에 위임돼 있어 실 웹 grounding 경로가 0 → "모델 지식 기반" fallback으로 median 회귀(당시 디자인 워크플로우 ADR이 개정 근거에서 스스로 인정한 슬롭 근본원인 — 현재 SSOT: ADR-058). 텍스트 4축 요약은 코드 증거가 없어 R2 concept 생성 입력이 빈약.
```

---

## 6.6 `ADR-047` — 1건 (오탐 제거: 미래 ADR 번호 예시가 실재 번호와 충돌)

파일: `docs/90-decisions/boilerplate/ADR-047-code-as-agent-harness.md`

이 줄의 `ADR-049`는 **인용이 아니라 «앞으로 발급할 수도 있는 번호» 예시**다. 그런데 그 번호가 실재하는(그리고 죽은) ADR과 충돌해 검사에 걸린다. **예시에서 번호를 걷어내 오탐을 없앤다.**

**앵커**: `6. **Rollback path** — 본 ADR superseded + ADR-005·ADR-022 단편 정의로 복귀. D5~D9 분리 시 별도 ADR (예: ADR-048 Sandboxed Execution, ADR-049 Contract Formation 등) 로 분할 supersede 가능.`

**바꿀 내용**
```
6. **Rollback path** — 본 ADR superseded + ADR-005·ADR-022 단편 정의로 복귀. D5~D9 분리 시 별도 ADR(주제별 — 예: "Sandboxed Execution", "Contract Formation")로 분할 supersede 가능. **예시에 구체적 ADR 번호를 적지 않는다** — 미발급 번호가 나중에 다른 주제로 발급되면 이 줄이 틀린 참조가 되고, 이미 죽은 번호와 겹치면 `[Ref-dead]` 오탐을 만든다.
```

---

## 6.7 `ADR-056` — 1건 (종류 D)

파일: `docs/90-decisions/boilerplate/ADR-056-milestone-experience-contract.md`

**앵커**: `- ADR-058(R2 원형·carve-out·실카피 라운드 배선 — ADR-049 supersede), ADR-042(#amend-1 — §8-1 delta)`

**바꿀 내용** (줄 앞부분 조각만 교체)
```
- ADR-058(R2 원형·carve-out·실카피 라운드 배선 — ADR-049 supersede) (현재 SSOT: ADR-058), ADR-042(#amend-1 — §8-1 delta)
```

---

## 6.8 `ADR-058` — 4건 (종류 D — 자기 자신이 superseding ADR이다)

파일: `docs/90-decisions/boilerplate/ADR-058-design-workflow.md`

이 ADR이 **ADR-049를 supersede한 당사자**다. 따라서 마커는 `(현재 SSOT: 본 ADR)`로 쓴다.

### 6.8.1 대체 선언

**앵커**: `> 대체: [ADR-049](ADR-049-concept-mockup-first-design.md)를 supersede한다`

**현재 (줄 전체)**
```
> 대체: [ADR-049](ADR-049-concept-mockup-first-design.md)를 supersede한다(디자인 워크플로우 라운드 구조·R0 grounding·시안 정책 전부). ADR-049는 `superseded`로 history 잔존. DESIGN.md *내용*·인터페이스 할당 SSOT는 [ADR-027](ADR-027-interface-decision-allocation.md)이 계속 소유(본 ADR은 흐름·게이트·리서치·시안 카드만).
```
**바꿀 내용**
```
> 대체: [ADR-049](ADR-049-concept-mockup-first-design.md)를 supersede한다(디자인 워크플로우 라운드 구조·R0 grounding·시안 정책 전부) (현재 SSOT: 본 ADR). ADR-049는 `superseded`로 history 잔존. DESIGN.md *내용*·인터페이스 할당 SSOT는 [ADR-027](ADR-027-interface-decision-allocation.md)이 계속 소유(본 ADR은 흐름·게이트·리서치·시안 카드만).
```

### 6.8.2 D5 승계 선언

**앵커**: `5. **취향 오라클·생성/감사 분리 (D5 — ADR-049 승계)**:`

**바꿀 내용** (줄 앞부분 조각만 교체)
```
5. **취향 오라클·생성/감사 분리 (D5 — ADR-049 승계) (현재 SSOT: 본 ADR)**:
```

### 6.8.3 Mutation Target

**앵커**: `STRUCTURE·WORKFLOW·.gitignore의 ADR-049→ADR-058 re-point.`

**바꿀 내용** (줄 끝 조각만 교체)
```
STRUCTURE·WORKFLOW·.gitignore의 ADR-049→ADR-058 re-point. (현재 SSOT: 본 ADR)
```

### 6.8.4 Rollback path

**앵커**: `**ADR-049 status를 accepted로 되돌리지 않는다** — supersede는 history 영속(ADR-045)이라 status 되돌리기는 기록 왜곡이다.`

**바꿀 내용**
```
**ADR-049 status를 accepted로 되돌리지 않는다** — supersede는 history 영속(ADR-045)이라 status 되돌리기는 기록 왜곡이다. (현재 SSOT: 본 ADR)
```

---

## 6.9 `ADR-066` — 1건 (종류 C)

파일: `docs/90-decisions/boilerplate/ADR-066-milestone-acceptance.md`

**앵커**: `- 권장(비차단)으로 두는 이유: 사람 확인 부재로 인한 잘못된 졸업은 아직 관측되지 않았다(ADR-022 ratchet).`

**현재 (줄 전체)**
```
- 권장(비차단)으로 두는 이유: 사람 확인 부재로 인한 잘못된 졸업은 아직 관측되지 않았다(ADR-022 ratchet). 승격 트리거는 *졸업 YES가 난 마일스톤에서 사용자가 P0급 경험 결함을 발견한 사례* 이며, 그때 필수 항목으로 올린다(ADR-014#amend-2가 soft→hard로 올린 방식과 동형).
```
**바꿀 내용**
```
- **관측 modality AC가 0건인 마일스톤에서** 권장(비차단)으로 두는 이유: 사람 확인 부재로 인한 잘못된 졸업은 아직 관측되지 않았다(ADR-022 ratchet). **관측 AC가 1건이라도 있으면 그 receipt가 졸업 item 4 (a')를 막으므로 그 마일스톤에서는 이 단계가 사실상 필수다**(위 D1). 본 단계를 졸업 checklist **항목**으로 승격하는 트리거는 *졸업 YES가 난 마일스톤에서 사용자가 P0급 경험 결함을 발견한 사례* 이며, 그때 필수 항목으로 올린다(과거 graduation contract가 같은 항목을 soft→hard로 올린 방식과 동형 — 현재 SSOT: ADR-067).
```

> **주의**: 이 줄의 «권장(비차단)» 서술 자체는 **1.2에서 이미 손댄 문단과 다른 줄이다.** 1.2를 적용한 뒤에도 이 줄은 그대로 남아 있으므로 여기서 따로 처리한다. **죽은 인용 제거(종류 C)와 함께 스코프도 조인다** — 1.2.2가 D1을 «0건이면 권장 / 1건 이상이면 사실상 필수»로 바꿨는데 이 근거 줄이 «권장(비차단)»을 무조건으로 단언하면 같은 문서가 서로 반대를 말한다. 여기서 «졸업 checklist **항목**으로의 승격»과 «receipt로 인한 사실상 필수»를 구분해 두면 둘이 양립한다.

> **`## 정책 강도`의 «enabling(약): D1 단계 신설(비차단·권장)» 줄은 건드리지 않는다** — 그 칸은 ADR-022의 «**본 ADR이 새로 만드는** 제약의 강도» 분류이고, D1 창설 자체는 새 게이트를 만들지 않는다(차단력은 ADR-067 D1 item 4 (a')가 갖는다). ADR-067의 «D6 비차단 관계»를 1.3에서 건드리지 않은 것과 같은 판단이다.

---

## 6.10 `ADR-067` — 6건 (종류 D + 한 줄 재작성)

파일: `docs/90-decisions/boilerplate/ADR-067-milestone-graduation-v2.md`

### 6.10.1 supersede 선언

**앵커**: `- [ADR-014](ADR-014-milestone-graduation.md)를 **supersede**한다. ADR-014의 결정 3개`

**바꿀 내용** (줄 앞부분 조각만 교체)
```
- [ADR-014](ADR-014-milestone-graduation.md)를 **supersede**한다(현재 SSOT: 본 ADR). ADR-014의 결정 3개
```

### 6.10.2 통합 재발행 사유

**앵커**: `- 통합 재발행 사유(ADR-045 D6): ADR-014#amend-4가`

**현재 (줄 전체)**
```
- 통합 재발행 사유(ADR-045 D6): ADR-014#amend-4가 *"graduation contract 자체를 다시 손대야 할 다음 변경에서는 통합 재발행을 우선 검토"* 를 예약했고, 이번 라운드에 서로 다른 3개 지점을 고치므로 그 조건이 충족된다.
```
**바꿀 내용**
```
- 통합 재발행 사유(ADR-045 D6): ADR-014#amend-4가 *"graduation contract 자체를 다시 손대야 할 다음 변경에서는 통합 재발행을 우선 검토"* 를 예약했고, 이번 라운드에 서로 다른 3개 지점을 고치므로 그 조건이 충족된다. (현재 SSOT: 본 ADR)
```

### 6.10.3 ~~「역사적 서술」 줄~~ — **적용하지 않는다 (§1.3.1이 처리)**

이 줄(`- **역사적 서술은 원문을 보존한다.** ...`)은 **§1.3.1이 Phase 1에서 이미 통째로 재작성한다.** Phase 6에 도달하면 여기 적을 「현재」 문구가 존재하지 않으므로 **이 단계를 건너뛴다.** `[Ref-dead]` 검사 제외 마커는 1.3.1의 교체문 끝에 있는 `(현재 SSOT: 본 ADR)`이 담당한다.

> 왜 이렇게 갈렸나: 이 줄은 «그 P2는 의도된 상태다»라고 선언하는데 D10이 그 입장을 대체하므로 *정책 층에서* 먼저 고쳐야 했다(그렇지 않으면 Phase 6이 적용되기 전 구간에서 정책과 실행이 충돌한다). 그래서 Phase 1로 올렸고, 여기 남은 것은 그 사실의 기록이다.

### 6.10.4 ~~Mutation Target~~ — **적용하지 않는다 (§1.3.8이 처리)**

이 줄(`1. **Target** — MILESTONE_TEMPLATE ... / ADR-014 인용 파일 전수(...)`)은 **§1.3.8이 Phase 1에서 이미 통째로 재작성한다.** 그 교체문 끝에 `(현재 SSOT: 본 ADR)`이 붙어 있으므로 검사 제외도 함께 처리된다. **이 단계를 건너뛴다.**

> **Phase 7.2 카운트 주의**: 위 두 절을 건너뛰어도 «22 → 0»은 성립한다 — ADR-067의 6건 중 이 2건을 Phase 1이 흡수하고 나머지 4건(6.10.1·6.10.2·6.10.5·6.10.6)을 Phase 6이 처리한다. 단 **§1.3.1·§1.3.8 교체문의 `(현재 SSOT: 본 ADR)`을 빠뜨리면 그 2건이 그대로 남아 검사가 실패한다.**

### 6.10.5 Rollback path

**앵커**: `6. **Rollback path** — 본 ADR을 superseded로 두고 **후속 ADR이 net 규칙을 다시 정의한다**`

**현재 (줄 전체)**
```
6. **Rollback path** — 본 ADR을 superseded로 두고 **후속 ADR이 net 규칙을 다시 정의한다**(ADR-014를 `accepted`로 되살리지 않는다 — supersede 이력은 되돌리지 않는 것이 이 저장소의 규약이다). 되돌릴 실질은 셋이다: item 4를 «자동 테스트 매핑 100%» 기준으로, `BLOCKED`를 «e2e blocked-on-env» 한정으로, 회고에서 `open 항목 스냅샷:` 줄 제거.
```
**바꿀 내용**
```
6. **Rollback path** — 본 ADR을 superseded로 두고 **후속 ADR이 net 규칙을 다시 정의한다**(ADR-014를 `accepted`로 되살리지 않는다 — supersede 이력은 되돌리지 않는 것이 이 저장소의 규약이다). 되돌릴 실질은 넷이다: item 4를 «자동 테스트 매핑 100%» 기준으로, 판정값을 3종(`YES`·`NO`·`BLOCKED`)으로, `BLOCKED`를 «e2e blocked-on-env» 한정으로, 회고에서 `open 항목 스냅샷:` 줄 제거. (현재 SSOT: 본 ADR)
```

**⚠ 3종을 `YES`·`NO`·`BLOCKED`(가운뎃점)로 적는다 — `YES|NO|BLOCKED`(파이프)로 쓰지 않는다.** 7.1의 잔존 문자열 검사 #4가 그 파이프 문자열을 «폐지된 3값 표기»로 잡으므로, rollback 서술이 그 형태를 쓰면 **검사가 스스로 실패한다.** 뜻은 동일하다.

### 6.10.6 Surfaces 행 — **마커를 붙이지 않고 삭제한다**

**앵커**: `- docs/90-decisions/boilerplate/ADR-014-milestone-graduation.md — superseded note`

**이 줄을 삭제한다**(앞뒤 줄은 그대로 두고 이 한 줄만 제거).

**왜 마커가 아니라 삭제인가**: §1.3.7이 바로 이 `## Surfaces` 블록 머리에 **등재 기준**을 박았다 — «본 ADR의 결정을 **실행하거나 집행하는 파일만** 등재한다. 본 ADR을 배경·역사로 언급만 하는 파일(**재지정 문구·supersede 선언 등**)은 등재하지 않는다.» `ADR-014`는 `## Status: superseded` + «superseded by ADR-067» 선언만 담은 파일이므로 정확히 그 제외 대상이고, 마커만 붙이면 **같은 블록의 6줄 위 기준을 스스로 위반하는 행**이 남는다. ADR-045#amend-2 D10도 종류 B(Surfaces 등 대상이 죽은 실행 절차)를 «재작성하거나 **삭제**»로 규정한다.

**역사가 사라지지 않는다**: 이 ADR이 ADR-014의 status·supersede note를 바꿨다는 사실은 §1.3.8이 재작성한 **Mutation Contract Target**(«ADR-014 status·supersede note / ADR-014 인용 파일 전수…»)에 마커와 함께 남아 있다. Surfaces는 *지속 동기 대상*, Target은 *이 ADR이 무엇을 바꿨는가*의 기록이며 — 전자에서 빼고 후자에 남기는 것이 두 필드의 역할 분담이다.

> **`ADR-052`의 같은 형태 1행은 이번 범위 밖이다** — `ADR-052 ## Surfaces`에도 `ADR-014 — ## Amendment 2 + Surfaces add (현재 SSOT: ADR-067)` 행이 있는데, 그 마커는 **이번 라운드 이전에 붙은 것**이라 Phase 6의 22건 기준선에 애초에 포함되지 않았고 그 ADR에는 §1.3.7 같은 등재 기준 선언도 없다. 같은 패턴이므로 다음 라운드 후보로 남긴다(지금 손대면 Phase 6의 파일 목록·건수가 어긋난다).

---

**Phase 6 커밋**

```
docs(adr): apply dead-reference classification and mark historical citations with current SSOT
```

---

# Phase 7 — 검증

**전부 적용한 뒤** 아래를 순서대로 돌린다. 하나라도 어긋나면 그 Phase로 돌아가 고친다.

**검사 제외 경로 (모든 검사에 공통 적용)**: `.git/`, `node_modules/`, 그리고 **이 가이드 파일 자신**. 가이드는 «바꾸기 전 텍스트»를 인용하고 있어서 포함하면 모든 «잔존 문자열» 검사가 실패한다.

---

## 7.1 잔존 문자열 검사 — 전부 0건이어야 한다

아래 문자열이 저장소 어디에도 남아 있지 않아야 한다.

| # | 찾을 문자열 | 왜 |
|---|---|---|
| 1 | `accept-milestone --task` | task 스코프 폐지 (Phase 1·3·4·5) |
| 2 | `Needs Acceptance` | finalize 전용 종료값 폐지 (Phase 1.2·3.2·5.2·5.3) |
| 3 | `Pass \| Needs Fix` | 판정 2값 폐지 (Phase 3.1·5.2) |
| 4 | `YES\|NO\|BLOCKED` | graduation 3값 폐지 (Phase 1.3·4.4·5.6) |
| 5 | `사용자 확인 필요 AC` | 용어 통일 → `수용 라운드 대상 AC` (Phase 3.6) |
| 6 | `사용자 receipt 대기` | 용어 통일 (Phase 3.4·3.5) |
| 7 | `graduation 판정값 3종` | D3 헤딩 (Phase 1.3.3) |
| 8 | `계약 변경 M건 → DECISION_REGISTER` | 라우팅 목적지 변경 (Phase 2.1.4-b) |

**주의**: 1번은 `--task`라는 조각이 다른 skill의 정상 인자와 겹치지 않는지 확인한다 — `accept-milestone --task` 전체 문자열로 찾는다.

### ROADMAP 단독 writer 문구 — 표현이 4종이라 따로 본다

`## Backlog`가 append-only 다중 writer가 되므로(ADR-057#amend-4) «plan-milestone이 로드맵을 혼자 쓴다»는 주장은 전부 구간별로 바뀌어야 한다. **같은 사실을 네 가지 문구로 적어 두었으므로 넷 다 찾는다.**

| # | 찾을 문자열 | 어디에 있었나 | 고치는 절 |
|---|---|---|---|
| 9 | `로드맵은 plan-milestone만 쓴다` | `plan-milestone/SKILL.md` R0·R3 (2곳) | 5.5.1 · 5.5.4 |
| 10 | `단일 작성자 = plan-milestone` | `STRUCTURE.md` Canonical Owner 행 · `ADR-067` Preserved invariants | 5.1.4 · 1.3.10 |
| 11 | `forward 지도)를 단독으로 유지한다` | `WORKFLOW.md ## 3` | 5.2.4 |
| 12 | `` ROADMAP 은 `/plan-milestone` 단독 writer다 `` | `.claude/agents/strategist.md` | 5.8 |

**제외 대상 (그대로 둔다)**: `ADR-057` 본문 결정 2·5와 `## 현재 유효 결정`의 «단일 작성자» 서술은 **amendment가 위에서 좁히는 구조**이므로 지우지 않는다(배포된 ADR 본문 불수정 — Phase 1 편집 방식 표. `1.6.2`가 `## 현재 유효 결정`에 구간별 규약 한 줄을 추가해 좁힌다). `STRUCTURE.md`의 산출물 표 행은 **9번이 아니라 5.1.4의 첫 교체**가 담당한다. `.boilerplate/validation/SIMULATION_RUN.md`의 관측 기록은 종류 E(실행 기록)라 원문을 보존한다.

### 무조건형 «재개방 금지» 문구 — 표현이 2종이라 따로 본다

`/repair-acceptance`가 `in-AC` 항목을 재개방(위임)하게 되므로 «기존 task를 재개방하지 않는다»는 **무조건 서술**은 전부 조건부로 바뀌어야 한다. **이 클래스는 정책 ADR·skill·메타 문서에 흩어져 있어 한 곳만 남아도 실행자가 위임을 거부한다.**

| # | 찾을 문자열 | 어디에 있었나 | 고치는 절 |
|---|---|---|---|
| 13 | `기존 task를 재개방하지 않는다` | `ADR-066` D4 · `repair-acceptance/SKILL.md` 도입·수행 3 · `WORKFLOW.md ## 5-1` | 1.2.11 · 4.2.1 · 4.2.4 · 5.2.1 |
| 14 | `재개방 X` | `DELEGATION_STRATEGY.md` 위임 표 · ADR 인덱스 066 행 | 5.3.2 · 5.9 |

**남아 있어야 하는 조건부 표현과 구분한다** — «`out-of-AC`(추적 불가) → 재개방하지 않는다», «`out-of-AC` 항목의 재개방 금지»처럼 **스코프가 붙은 문장은 정상이며 지우지 않는다.** 위 두 검사 문자열은 스코프가 없는 형태만 잡는다.

---

## 7.2 죽은 ADR 인용 0건

**판정 절차**
1. `docs/90-decisions/**/ADR-*.md`에서 `## Status` 본문이 `superseded`·`deprecated`로 **시작하는** ADR 번호를 모은다(현재 **ADR-014**, **ADR-049** 둘). `accepted (부분 superseded — ...)`는 **세지 않는다**.
2. 저장소 전체 `.md`에서 그 번호를 인용한 줄을 찾는다.
3. 아래에 해당하는 줄은 제외한다 — (a) `(현재 SSOT:` 병기, (b) 그 ADR 자신을 가리키는 인용만 있는 줄, (c) `docs/90-decisions/**/README.md` 인덱스 표 행, (d) `<!-- -->` 주석 줄.
4. **남은 건수 = 0**이어야 한다. **적용 전 값은 22건**이므로, 22 → 0을 확인한다.

숫자가 0이 아니면 Phase 6에서 빠뜨린 줄이 있다는 뜻이다 — 그 줄을 6.1~6.10의 5종 분류에 대입해 처리한다.

---

## 7.3 새 마커·앵커가 실재하는지

| 확인할 것 | 있어야 할 곳 |
|---|---|
| `## Amendment 2` (D10) | `ADR-045-doc-reference-contract.md` |
| `## Amendment 1` (원장 배타 범위) | `ADR-005-ssot.md` |
| `## Amendment 4` (ROADMAP Backlog) | `ADR-057-planning-v2-batch-and-seam.md` |
| `## Backlog` | `docs/30-workitems/ROADMAP.md` |
| `### 원장 5종 배타 범위` | `docs/00-meta/STRUCTURE.md` |
| `Pending Acceptance` | validate-workitem · finalize-workitem · repair-workitem SKILL.md |
| `PENDING_ACCEPTANCE` | ADR-067 · stabilize-milestone · accept-milestone · plan-milestone SKILL.md |
| `- ac-pending` | TASK_TEMPLATE · implement-workitem · finalize-workitem · ADR-065 |
| `## 4. 보류 항목` 용도 주석 + `scope: out-of-AC` | IMPROVEMENT_GUIDE.md · repair-acceptance · plan-milestone SKILL.md |
| `- exec-evidence` | repair-workitem(기존) · repair-milestone · repair-acceptance SKILL.md |
| `allowed-tools:` 줄에 `Skill` | repair-milestone · repair-acceptance SKILL.md |

**`Skill` 도구 확인이 가장 중요하다** — 이게 없으면 4.2.7·4.3.1의 연쇄가 실행되지 않아 «사용자가 손으로 validate/finalize를 돌리는» 원래 문제가 그대로 남는다.

---

## 7.4 ADR 인덱스 amend 카운트 정합

`docs/90-decisions/boilerplate/README.md`의 Amendments 칸에 적힌 amend 수 ↔ 그 ADR 본문의 `## Amendment N` 개수(코드펜스·주석 밖)가 일치해야 한다. 이번에 늘어난 셋을 확인한다.

| ADR | 본문 amend 수 | 인덱스 칸 |
|---|---|---|
| 045 | 2 | `+#amend-1: D6 재발행 임계 4→8, +#amend-2: supersede 후 인용 처리(D10)` |
| 005 | 1 | `(+#amend-1: 원장 5종 배타적 기록 범위 + 비중복 불변식)` — §1.5.2 문구와 정확히 일치해야 한다 |
| 057 | 4 | `... +#amend-4: ROADMAP ## Backlog 구간 + 구간별 writer 규약)` + 본문 `## 현재 유효 결정`의 `Amendment 1·2·3·4` (§1.6.3) |

**세는 방법 주의**: `ADR-045` 본문에는 `## Amendment <M> — ...` 라는 *형식 템플릿* 줄이 코드펜스 안에 있다. **펜스 밖의 `## Amendment N` 헤딩만 센다** — 그러면 amend-2 추가 후 정확히 2다.

---

## 7.5 `## Surfaces` 역방향 확인

Phase 1에서 ADR-065·066·067의 `## Surfaces`에 등재한 파일이 **실재**하고, 그 파일 본문이 해당 `ADR-NNN`을 **역참조**하는지 확인한다(ADR-045 D3·D4). 새로 등재한 것만 보면 된다 — 기존 항목은 이미 통과 상태다.

**검사 범위 주의**: `/stabilize-milestone` §1.0의 forward check는 **`## Surfaces` 블록을 가진 ADR만** 대상이다. amendment의 `### 적용 surface` 목록(ADR-005#amend-1·ADR-045#amend-2·ADR-057#amend-4)은 검사되지 않으므로 여기서는 사람이 눈으로만 확인한다.

**반드시 확인할 세 쌍 (이번에 새로 등재됐고 역참조가 «가이드가 넣는 한 줄»에만 의존한다)**
- ADR-065 `## Surfaces` → `MILESTONE_TEMPLATE.md`가 `ADR-065`를 인용하는가 (2.1.1의 교체문이 그 유일한 인용이다)
- ADR-066 `## Surfaces` → `docs/30-workitems/ROADMAP.md`가 `ADR-066`을 인용하는가 (2.3.2 주석의 한 줄이 그 유일한 인용이다 — **적용 전 이 파일의 `ADR-066` 인용은 0건이다**)
- ADR-066 `## Surfaces` → `validate-workitem`·`finalize-workitem`이 `ADR-066`을 인용하는가 (각 파일에서 `ADR-066`을 인용하던 줄이 3.1.5·3.2.2의 교체 대상이라, 교체문에 토큰을 남기지 않으면 0건이 된다)

**이미 통과 상태여서 확인만 하면 되는 것**: ADR-065 → `stabilize-milestone`(§1.5가 인용) / ADR-066 → `repair-workitem`(3.3.5·3.3.6)·`TASK_TEMPLATE`(2.2.3)·`QA_FINDINGS`(2.5) / ADR-067 → `plan-milestone`·`validate-plan`·`reviewer.md`·`accept-milestone`(전부 기존 인용 보유).

---

## 7.6 lifecycle 일관성 체크리스트 (손으로 읽어 확인)

아래 12개 문장이 **전부 참**이어야 한다. 하나라도 거짓이면 그 문장이 가리키는 Phase로 돌아간다.

1. 관측 AC만 미충족인 task의 채점표 판정은 `Pending Acceptance`다. (3.1.1·**3.5.3** — 팬아웃 validator가 그 미충족을 «Needs Fix 트리거»로 반환하면 집계자가 뒤집는다)
2. `Pending Acceptance` task는 `/finalize-workitem`을 통과해 `done`이 된다. (3.2.1·3.2.2)
3. 그때 그 task `## 8`에 `- ac-pending`이 남는다. (3.2.2·2.2.1)
4. `/repair-workitem`은 `Pending Acceptance`를 받으면 아무것도 고치지 않고 종료한다. (3.3.1)
5. 그 마일스톤의 `/stabilize-milestone` graduation은 `PENDING_ACCEPTANCE`다. (4.4.2·4.4.3)
6. `/accept-milestone <M>`이 receipt를 발급하면 **재validate 없이** graduation이 `YES`가 된다. (4.1.12·4.4.2 (a'))
7. `/repair-milestone`·`/repair-acceptance`가 코드를 고치면 **그 skill이 스스로** 후속을 돌린다 — **재개방된 task(in-AC 위임분)는 `/validate-workitem` + `/finalize-workitem`, 재개방되지 않은 task(out-of-AC·cross-cutting 영향분)는 `/validate-workitem`만.** 그리고 **재개방분 연쇄가 cross-cutting 수정·원장 쓰기보다 먼저** 돈다. (4.3.1·4.2.7·4.2.4)
7-1. `done`인 task에 `/finalize-workitem`을 부르는 지시가 가이드 어디에도 없다. (4.3.1 ②·4.2.7 ②) — **부르면 1-G의 read-only no-op에 걸려 «마감»으로 보이는 거짓 신호만 남는다.**
7-2. 세 skill의 커밋 안내가 «연쇄가 마감한 task의 파일은 finalize가 커밋했고, cross-cutting·원장 잔여분은 사용자가 커밋한다»로 갈라져 있다. (4.3.6·4.2.13·4.1.13-b)
8. 수용 라운드의 «계약 변경»은 `ROADMAP.md ## Backlog`에 쌓이고, 다음 `/plan-milestone` R0이 회수한다. (4.1.10·5.5.1)
9. `/repair-acceptance`가 `out-of-AC`로 고친 것의 계약 부채는 **`IMPROVEMENT_GUIDE.md ## 4. 보류 항목`**에 쌓이고, 다음 `/plan-milestone` R0이 회수해 **AC 승격 여부를 사용자에게 묻는다.** (4.2.2·2.4.2·5.5.2)
10. `/repair-milestone`·`/repair-acceptance`가 코드를 고치면 회귀 테스트를 Red→Green으로 관측하고, 외부 경계를 건드렸으면 `- exec-evidence`를 갱신한다. (4.3.9·4.2.5·4.2.6)

**7-1·7-2·9·10을 반드시 손으로 확인한다** — 이 넷은 자동 검사에 걸리지 않는다. 9·10은 「등재하는 쪽」과 「읽는 쪽」이 서로 다른 Phase에 흩어져 있어 한쪽만 적용해도 조용히 통과하고, 7-1·7-2는 «없어야 하는 지시»와 «갈라져야 하는 문구»라 문자열 존재 검사로 잡히지 않는다.

---

## 7.7 dogfood 라운드 (선택 — 실측 확인)

문서 검사만으로는 «연쇄가 실제로 도는가»를 알 수 없다. 확인하려면 작은 마일스톤 하나를 관측 AC 1건과 함께 끝까지 돌려 본다.

**실측할 항목 6개**
1. `Pending Acceptance` task가 `/finalize-workitem`에서 `done`으로 마감되는가.
2. `/stabilize-milestone`이 `PENDING_ACCEPTANCE`를 출력하고 **조기 종료 옵션을 제시하지 않는가**.
3. `/accept-milestone <M>` 후 재validate **없이** `/stabilize-milestone`이 `YES`를 내는가.
4. `/repair-milestone`이 per-task 결함을 위임한 뒤 **자기 세션 안에서** `/validate-workitem`·`/finalize-workitem`을 실행하는가(= `Skill` 도구가 실제로 붙어 있는가).
5. **그 `/finalize-workitem`이 `Needs Review`로 멈추지 않는가** — 즉 2-C ①이 cross-cutting 수정·원장 쓰기보다 먼저 돌아 tree에 그 task 변경만 남았는가. 멈췄다면 순서 규칙이 지켜지지 않은 것이고, 출력에 `미해결 (Needs Review)` + 복구 명령이 실제로 나오는지도 함께 본다.
6. cross-cutting 영향 task에 대해 **`/validate-workitem`만** 실행하고 `/finalize-workitem`은 부르지 않는가(부르면 no-op인데 표에 «마감»으로 적히는지 확인).

4번이 실패하면 **4.3.2 / 4.2.8의 `allowed-tools` 수정이 누락된 것**이다. 5번이 실패하면 **4.3.1 (1)의 순서 규칙 또는 4.2.4의 순서 규칙이 누락된 것**이다. 6번이 실패하면 **4.3.1 ② / 4.2.7 ②를 옛 형태(validate + finalize)로 적용한 것**이다.

---

**Phase 7 커밋** (검사 중 고친 것이 있을 때만)

```
fix(harness): resolve residual references found during post-change verification
```
