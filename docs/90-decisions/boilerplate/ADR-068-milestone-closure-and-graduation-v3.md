# ADR-068 — 마일스톤 폐쇄 경계 + 졸업 계약 v3 (Milestone Closure Boundary & Graduation v3)

> scope: boilerplate
> area: process

## Status
accepted

## 대체
- [ADR-067](ADR-067-milestone-graduation-v2.md)을 **supersede**한다(현재 SSOT: 본 ADR). ADR-067의 D1~D6을 본 ADR이 승계하고 아래 다섯을 변경한다.
  1. **task 층 폐쇄 경계를 신설**한다(D1) — 마일스톤 층 skill이 task 문서·task status·validation report를 수정하지 않는다(예외는 task `## 8`의 AC receipt 이벤트 2종뿐).
  2. **closure receipt를 신설**한다(D2) — 졸업 판정의 입력이 checkout-local ephemeral 채점표에서 **커밋된 task 문서**로 옮겨진다.
  3. **졸업 item 4의 (a)(b)(c)(d)와 mtime 판정을 폐지**한다(D3) — (a)(b)(c)는 item 1의 closure receipt로 흡수되고 (d)는 삭제된다.
  4. **`/stabilize-milestone`의 두 플래그를 폐지**한다 — `--dry-run`(ADR-067 D4 철회, 사유는 D3 아래 주석) · `--feature F-NNN`(D1-b).
  5. **원장 구조 정리 + 아카이브 회전을 신설**한다(D7) — `IMPROVEMENT_GUIDE.md`의 죽은 절 2개 폐지·`## 3` 통합·졸업 마일스톤 회전.
- ADR-067 인용의 처리는 [ADR-045](ADR-045-doc-reference-contract.md)#amend-2의 5종 분류를 따른다. 살아있는 규칙 인용은 본 ADR로 재지정하고, supersede 선언·인덱스 행·실행 기록만 원문을 보존한 뒤 그 줄 끝에 `(현재 SSOT: ADR-068)`을 병기한다.

## 부분 supersede (본 ADR이 다른 ADR의 일부만 대체하는 지점)
아래 둘은 `superseded`로 만들지 않는다 — 나머지 결정이 살아 있어 전체 재발행 비용이 이득을 넘는다([ADR-052](ADR-052-stack-provisioning-and-e2e-readiness.md)#amend-1이 같은 이유로 amendment를 택한 선례). 각 파일에 표기 노트를 남긴다.

- **[ADR-052](ADR-052-stack-provisioning-and-e2e-readiness.md) D4** — *"단일 task로 격리되는 결함은 `/repair-workitem T-NNN`으로 라우팅"* 은 본 ADR D1이 부분 supersede한다. **폐쇄 후에는 라우팅 없이 `/repair-milestone`이 직접 고친다.** D4의 나머지(코드 수정 허용 · 자동 커밋·status 변경 금지 · `## 5` 결정 이력)는 유효하다.
- **[ADR-057](ADR-057-planning-v2-batch-and-seam.md)** — 둘을 부분 supersede한다.
  - `## 현재 유효 결정`의 *"검증된 완료 결함만 repair-workitem이 `done→in-progress`"* (= #amend-3 결정 5의 task 상태기계 역전이): **폐쇄 후에 한해** 폐지된다(D1). 폐쇄 전 task 층의 재개방은 유효하다.
  - **결정 6 `/stabilize-milestone --feature F-NNN` 스코프**: 폐지된다(D1-b). #amend-3이 *"계획이 아니라 검사 범위라 유지"* 로 존치를 선언했으나 본 ADR이 그 존치를 뒤집는다.

## 배경
- [관측됨] 졸업 판정이 `docs/40-validation/reports/<task-id>.md`(gitignore된 checkout-local ephemeral)를 지속 입력으로 읽는다. 그 결과 새 체크아웃에서 마일스톤을 재평가하려면 산하 전 task의 `/validate-workitem`을 다시 돌려야 한다.
- [관측됨] 그 의존에서 세 가지가 파생됐다 — (a) 마일스톤 층 수리가 채점표를 되살리려 task를 재개방하는 연쇄, (b) 그 연쇄가 `/finalize-workitem`의 범위 비교에 걸리지 않도록 만든 실행 순서 규칙, (c) 그 순서 규칙 때문에 원장 쓰기가 뒤로 밀려 같은 라운드에 발급한 채점표를 stale로 만드는 자기무효화.
- [관측됨] 27 task 규모의 마일스톤에서 위 (c)가 관측됐다 — 라운드마다 최소 6건이 stale로 남고, 닫는 수와 새로 여는 수가 상쇄되어 **수렴하지 않았다.**
- [관측됨] 마일스톤 층 수정은 그 task의 AC로 역추적되지 않으므로, 재validate의 diff-trace 감사가 **구조적으로 반드시** `추적 불가`를 낸다. 현행 문서 세 곳이 그 결과를 "정상이며 차단이 아니다"로 해명하고 있다.

## 결정

### D1. 마일스톤 층 폐쇄 경계
**한 마일스톤 산하 task가 전부 `done`이 되는 순간부터 그 마일스톤은 «마일스톤 층»이다.** 이 상태에서:

- **마일스톤 층 skill**(`/stabilize-milestone`·`/repair-milestone`·`/accept-milestone`·`/repair-acceptance`)은 task 문서·task `## 0. Status`·validation report를 **읽기만 한다.**
- 그 skill들은 `/implement-workitem`·`/validate-workitem`·`/repair-workitem`·`/finalize-workitem`을 **호출하지 않는다.** 사용자에게 그 호출을 권하지도 않는다.
- **`/repair-workitem`의 `done` 재개방은 «마일스톤 층에서만» 폐지한다 (조건부).** 산하에 `done`이 아닌 task가 하나라도 남아 있으면 그 마일스톤은 아직 task 층이고, 그때의 `done → in-progress` 재개방은 **그대로 유효하다** — `/implement-workitem` 3-R (1)이 «선행 task가 done인데 약속한 산출이 없으면 그 선행 task를 현재 M에서 repair→validate→finalize» 를 명시 지시하므로, 이 경로를 막으면 그 지시가 실행 불가가 된다. **폐지되는 것은 «산하 전 task done» 이후의 재개방뿐이다.**
- **동결 대상**: task 문서 전체 · task status · validation report.
- **동결 아님**: 제품 코드·테스트. 마일스톤 층 수리가 고칠 수 있으며 기록은 D6을 따른다.
- **예외는 둘이다 — task `## 8`의 AC receipt 이벤트 2종뿐이다.** 그 둘은 같은 AC의 **단일 순서 로그**를 이루므로 분리할 수 없다([ADR-065](ADR-065-ac-verification-contract.md) D3 판독 규칙 2 «마지막 이벤트가 현재 상태»).
  - `- ac-acceptance` — writer는 `/accept-milestone`.
  - `- invalidated` — writer는 `/repair-milestone`·`/repair-acceptance`(그 수정이 관측 modality AC의 동작 경로를 건드렸을 때).
  - **이 둘 외에는 어떤 줄도 task 문서에 쓰지 않는다.** 폐쇄 후의 `- exec-evidence`·`- pattern-scan`은 task `## 8`이 아니라 `IMPROVEMENT_GUIDE.md` `## 5`의 그 항목 하위 줄에 적는다(D6).
  - **`- invalidated`를 `## 5`로 옮기면 안 되는 이유**: 졸업 item 4와 `/accept-milestone` R2의 필수 시나리오 산정이 **둘 다 task `## 8`의 마지막 이벤트만** 읽는다. 무효화를 다른 파일로 옮기면 그 AC는 여전히 `- ac-acceptance`가 마지막 이벤트로 남아 **무효화가 졸업에도 다음 수용 라운드에도 반영되지 않는다.**
  - 두 append 모두 재개방도 재validate도 유발하지 않는다(D3에서 mtime 판정이 삭제되므로).
- **판정 신호에 새 필드를 만들지 않는다** — «전 task `done`»은 졸업 item 1이 이미 읽는 값이다. 별도의 폐쇄 마커·폐쇄일·확인 프롬프트를 두지 않는다.

### D1-b. `/stabilize-milestone --feature F-NNN` 폐지
[ADR-057](ADR-057-planning-v2-batch-and-seam.md) 결정 6(#amend-3이 명시 존치)의 `--feature` 스코프를 **폐지한다.**
- **사유**: 그 플래그는 «마일스톤 중간에 한 feature만 점검»하는 도구인데, 본 ADR D1이 마일스톤 층의 시작을 «산하 전 task done»으로 정의하므로 **마일스톤 층 skill 안에 task 층 도구가 들어 있는 구조**가 된다. 대체 지점은 `/finalize-workitem` 수행 9의 feature-완료 체크포인트(FAC closure 요약)이며 이미 존재한다.
- **비용**: 그 플래그는 `/stabilize-milestone` 본문에서 가장 긴 단일 조건 블록(입력 검증 2종 · preflight 부분 적용 · 단계 5·6·6.5·7·7-T skip · composite 화면 부분 판정 · QA_FINDINGS scope 태그)을 차지한다.
- ADR-057 결정 6은 본 ADR이 **부분 supersede**하며 그 파일에 표기 노트를 남긴다(ADR-057의 기존 «부분 supersede» 헤더 노트와 동형).

### D2. closure receipt
`/finalize-workitem`은 task를 `done`으로 마감할 때 그 task `## 8. 메모`에 아래 한 줄을 append한다. **`## 0. Status`를 `done`으로 쓰는 것과 같은 편집 라운드에서 쓴다.**

```
- closure <YYYY-MM-DD> <task-id>: verdict=<Pass|Pending Acceptance> / 기계AC=<충족/전체> / audit=<complete|미완:<축>> / 관측대기=<AC-N 목록|없음> / 자동화율=<%>
```

- **출처**: 직전 `/validate-workitem`이 만든 채점표의 `- 판정:` · `## AC ↔ 검증 매핑` · `## Orchestration`의 `감사 미완(unavailable)` 행. finalize는 이미 그 파일을 읽으므로 새 읽기가 없다.
- **`관측대기=`의 정의 (중요)** — «그 라운드에 `- ac-pending`을 남긴 AC»가 **아니다.** 그렇게 정의하면 구멍이 난다: `- ac-pending`의 writer는 `/implement-workitem` 6-R과 `/finalize-workitem` 둘이고 finalize는 중복 append를 금지하므로, implement가 이미 남긴 관측 AC는 finalize 라운드에 append가 0건이 되어 `관측대기=없음`이 되고 **receipt 없는 관측 AC가 졸업을 통과한다.**
  - **정의**: 그 task `## 6-1`에서 modality가 `[사용자 관측]`·`[플랫폼 관측]`인 AC 중, task `## 8`의 (HTML 주석 밖) **그 AC 마지막 이벤트가 `- ac-acceptance`가 아닌 것 전부.** 즉 `## 6-1`을 직접 스캔한다(구 ADR-067 item 4 (a')와 같은 입력원).
  - 관측 modality AC가 0건이거나 전부 이미 유효 receipt를 가졌으면 `관측대기=없음`.
- **판독 규칙**: HTML 주석(`<!-- ... -->`) 밖의 줄만 항목으로 센다([ADR-064](ADR-064-task-layer-evidence-contract.md) D4 공통 판독 규칙). 같은 task에 `- closure` 줄이 이미 있으면 **덮어쓰지 않고 새 줄을 append**한다(이력 보존 — 마지막 줄이 현재 상태다).
- **이 줄이 커밋되기 때문에** 졸업 판정이 새 체크아웃·다른 worktree에서도 성립한다. 채점표에 대한 졸업 의존이 0이 된다.
- **closure는 «마감 시점의 스냅샷»이며 그 이후의 코드 변경으로 무효화되지 않는다.** 폐쇄 후 수정의 *현재성*은 졸업 item 2(통합 `validate` — 그 수정의 회귀 테스트가 묶여 있다)와 item 5(P0 0건)가 담당하고, *추적성*은 D6의 `files:`·`scope:`가 담당한다. closure에 무효화 개념을 두면 폐쇄 후 수리마다 재validate가 필요해져 본 ADR의 목적이 무너진다.
- **[ADR-064](ADR-064-task-layer-evidence-contract.md) D4와의 관계**: D4는 receipt writer를 «implement foreman·repair-workitem», 시점을 «`/validate-workitem` 실행 이전»으로 규정한다. `- closure`는 그 규정의 **예외**다 — writer가 `/finalize-workitem`이고 시점이 validate *이후*다. 안전한 이유는 `- ac-pending`과 같다: **`## 0. Status`를 `done`으로 쓰는 것과 동일한 편집 라운드**에서 append하므로 별도의 mtime 갱신을 만들지 않고, 그 뒤에 이어지는 것은 커밋뿐이다.

### D3. 졸업 checklist 5+1 (v3)
MILESTONE `## 5. 완료 기준`은 다음 5개 필수 + 1개 선택이다. **항목을 증설하지 않는다.**

1. **마감 스냅샷 유효** — 산하 모든 task의 `## 0. Status`가 `done`이고, 각 task `## 8`의 마지막 `- closure` 줄이 (a) `verdict=Pass` 또는 `verdict=Pending Acceptance`이며 (b) `audit=complete`이다. `- closure` 줄이 없는 task는 미충족.
   - **`- closure` 부재의 처방은 skill 재실행이 아니라 «사용자 직접 기재»다.** `/finalize-workitem` 1-G는 `done` task에 read-only no-op이고 `/validate-workitem`도 폐쇄 상태에서 종료하므로, 이 개선 이전에 마감된 task는 그 두 skill로 closure를 얻을 수 없다. 그 task `## 8`에 사용자가 `- closure <날짜> <task-id>: verdict=Pass / 기계AC=<n/n> / audit=complete / 관측대기=<...> / 자동화율=<%> (마이그레이션 — 소급 기재)` 한 줄을 직접 적는다. **별도의 백필 skill·모드를 만들지 않는다.**
   - `audit=미완:<축>` 분기는 방어적 검사다 — `/validate-workitem`이 감사 미완이면 `Needs Fix`를 내고 finalize가 차단하므로 정상 경로에서는 도달하지 않는다. 수기 기재분을 잡기 위해 남긴다.
2. **통합 `validate` Pass** — 현재 코드 상태 기준. **마일스톤 층 수리가 추가한 회귀 테스트는 이 명령에 묶여 있어야 하며**(D6), 따라서 본 항목이 그 테스트의 통과까지 함께 검사한다.
3. **E2E Pass** — 판정 상태 5종의 SSOT는 [ADR-052](ADR-052-stack-provisioning-and-e2e-readiness.md)#amend-1이며 **실제 실행된 e2e 1개 이상 성공**이 조건이다(0-spec 예외 없음).
4. **관측 AC receipt 유효** — **대상 AC의 authoritative 출처는 task `## 6-1`의 modality 표기다.** 각 task `## 6-1`에서 modality가 `[사용자 관측]`·`[플랫폼 관측]`인 AC를 전수 회수하고, 그 AC마다 task `## 8`의 (HTML 주석 밖) **마지막 이벤트가 `- ac-acceptance`** 인지 본다(ADR-065 D3 판독 규칙 2). `- ac-pending`·`- invalidated`이거나 이벤트가 없으면 미충족.
   - `- closure`의 `관측대기=` 목록은 **회수 편의용 색인**이며 판정의 근거가 아니다. 그 목록과 `## 6-1` 스캔 결과가 어긋나면 **`## 6-1`을 신뢰한다**(수기 기재·구 정의로 작성된 closure 줄 방어).
   - **본 항목만 미충족이고 1·2·3·5가 전부 충족이면 graduation은 `PENDING_ACCEPTANCE`다**(D4).
5. **P0 severity finding 0건** — `QA_FINDINGS.md`의 본 마일스톤 헤더 `### P0`에서 `status: resolved`가 아닌 항목 수 0.
6. (선택) 본 마일스톤 한정 추가 기준.

- **채점표(`docs/40-validation/reports/`)는 졸업 판정의 입력이 아니다.** ADR-067 D1 item 4의 (a)(b)(c)(d)와 mtime 비교는 전부 폐지된다.
- **`--dry-run` 폐지 사유**: v3의 item 1·4·5가 파일 읽기만으로 판정되므로 «싸게 미리 보기»의 대상이 item 2·3(validate·e2e)뿐인데, 그 둘은 졸업하려면 어차피 실행해야 한다. 별도 모드가 만드는 예외 분기(§1.5 안의 validate 1회 실행 / e2e 표기 / 판정 미기록 / §3-V 제외)만 남는다.
- **조기 종료 옵션은 유지한다** (ADR-067 D4에서 승계). 정적 항목(item 1·4) 평가에서 미충족이 나오면 `/stabilize-milestone`은 그 목록과 함께 **조기 종료 옵션을 사용자에게 제시**한다(강제 종료 아님 — 계속 진행을 택할 수 있다). item 1이 깨진 상태에서 qa·reviewer 팬아웃을 끝까지 도는 것은 낭비다. **단 item 4만 미충족인 경우는 조기 종료 옵션을 제시하지 않는다** — 결함이 아니라 «사람 확인만 남은» 상태이므로 되돌아가 고칠 것이 없다(D4 `PENDING_ACCEPTANCE`).

### D4. graduation 판정값 4종
`graduation: <YES | PENDING_ACCEPTANCE | NO | BLOCKED> (<날짜>)`. **ADR-067 D3을 그대로 승계한다** — 값·정의·우선순위(`BLOCKED` > `NO` > `PENDING_ACCEPTANCE` > `YES`)·덮어쓰기 규칙·`ROADMAP` Done 전환은 `YES`일 때만·관측 AC 0건이면 `PENDING_ACCEPTANCE` 불성립, 전부 불변이다.
- `BLOCKED`이 덮는 것도 둘 그대로다 — (a) e2e blocked-on-env, (b) 감사 미완.
- 기록 시점은 `/stabilize-milestone` 단계 8이며 1회만 쓴다.

### D5. 회고 항목
`## 8. 회고`는 다음을 담는다(ADR-067 D2 + 한 줄 추가).
- `graduation:` 판정 줄 (D4)
- `open 항목 스냅샷:` — 두 원장의 미해소 합계 + 이전 마일스톤 carry-over
- **`post-close 수정:`** — 폐쇄 이후 마일스톤 층이 고친 건수. 형식: `<N건 (in-AC K / out-of-AC L)> — 상세: IMPROVEMENT_GUIDE ## 5 ### M<N>`. 0건이면 `없음`.
- 목표 달성도 / scope creep 사례 / 비목표 위반 사례 / 핵심 학습 3개 이내

### D6. post-close 수리 계약
마일스톤 층 수리(`/repair-milestone`·`/repair-acceptance`)는 아래를 지킨다.

- **재개방하지 않는다**(D1). 특정 task에 귀속되는 결함이라도 그 skill이 **직접 고친다.**
- **회귀 테스트 선행** — 결함을 재현하는 실패 테스트를 먼저 추가해 Red를 관측하고, 고친 뒤 Green을 확인한다. **그 테스트는 통합 `validate`에 묶는다**(묶지 않으면 졸업 item 2가 검사하지 못한다). 면제는 «코드 3줄 이하 + 외부 행동 불변» 또는 «문서만 고치는 finding»이며 사유를 결정 이력에 적는다.
- **검증 집합** — 재validate 대신 아래 넷을 돈다.
  1. 본 라운드가 추가·수정한 회귀 테스트 전부 Green
  2. 변경 파일과 교차하는 task의 `## 6-1` 자동 테스트 매핑 대상
  3. 외부 경계·핵심 journey를 건드렸으면 해당 integration/e2e smoke
  4. `validate --changed` 1회(미지원이면 통합 `validate`)
  전체 검증은 다음 `/stabilize-milestone`의 통합 `validate` + e2e가 담당한다.
- **결정 이력 필수 필드** — `IMPROVEMENT_GUIDE.md` `## 5. Repair decision log`에 P0/P1 전부를 append하고 아래 두 필드를 **양 skill 공통 필수**로 한다.
  - `files:` — 이 항목이 고친 파일 목록. 문서만 고쳤으면 `files: docs-only`. **재개방이 없으므로 이것이 «어느 파일을 고쳤나»의 유일한 영속 자리다.**
  - `scope: in-AC | out-of-AC` — «이 변경 줄을 기존 계약으로 거꾸로 추적할 수 있는가». 계약의 범위는 여섯이다: task `## 6. AC` · task `## 3`의 line item · feature `## 7. FAC` · feature `## 7-2`의 INV · 승인 프로토타입 · `DESIGN.md` 계약. **애매하면 `out-of-AC`로 적는다**(추적 부채를 남기는 쪽이 안전하다).
  - `out-of-AC`면 `IMPROVEMENT_GUIDE.md` `## 4. 보류 항목`에 계약 부채를 `status: open`으로 등재한다. **양 skill 공통 의무다.**
  - `affected: T-NNN` 은 기존대로 필수다.
- **수리 부산물의 기록 위치 (양 skill 공통)** — 폐쇄 후에는 task 문서에 쓸 수 없으므로(D1) 아래 셋을 `## 5`의 그 항목 **하위 줄**에 적는다. 형식 문자열은 [ADR-064](ADR-064-task-layer-evidence-contract.md) D4 / [ADR-066](ADR-066-milestone-acceptance.md) D6의 것을 그대로 쓰되 위치만 바뀐다.
  - `- exec-evidence <날짜> <경계 a|b|c>: …` (외부 경계 코드를 고쳤을 때)
  - `- pattern-scan <날짜> <패턴>: 범위 내 N건 / 범위 밖 M건 <경로>`
  - `- invalidated`는 **여기가 아니다** — D1의 예외대로 task `## 8`에 적는다(그 AC 이벤트 로그의 일부이기 때문).
  - **이 이동은 [ADR-064](ADR-064-task-layer-evidence-contract.md) D4와 충돌하지 않고 오히려 정합을 회복한다** — D4의 receipt 작성자는 «`/implement-workitem` foreman **및** `/repair-workitem`» 둘뿐이며 `/repair-milestone`·`/repair-acceptance`는 애초에 등재돼 있지 않다. 두 skill이 task `## 8`에 `- exec-evidence`를 쓰던 현행 문구가 D4를 벗어나 있었고, 본 항목이 그것을 `## 5`로 옮겨 해소한다.
- **봉인된 계약 본문은 고치지 않는다.** `[Spec-gap]`·`[Arch-iface-violation]` 같은 finding이 feature `## 7. FAC`·`## 7-1` 매핑표나 milestone `## 3`처럼 **`ready` 봉인으로 잠긴 계약 본문**을 고쳐야 성립하면, 그 수정을 하지 않고 사용자에게 보고 + 다음 M 후보로 남긴다([ADR-060](ADR-060-decision-closure-and-milestone-seal.md) D6/D7 잠금 / ADR-057#amend-3 결정 6). 고칠 수 있는 것은 **코드·테스트·잠기지 않은 문서**(원장·ARCH 산문·링크·인덱스)뿐이다.

### D7. 원장 구조 정리 + 아카이브 회전
두 원장이 폐쇄 후 수리의 **유일한 추적 자리**가 되므로(D6) 회수 비용과 성장 속도를 함께 잡는다.

**D7-1. `IMPROVEMENT_GUIDE.md` 섹션 폐지·통합**
- `## 0. 요약`·`## 1. 우선순위`를 **폐지(결번)** 한다. 두 절은 writer도 reader도 0이었다 — 파생 요약은 다중 writer 환경에서 본문과 drift하기 때문에 실패했다.
- `## 3. 권장 리팩토링`을 **폐지(결번)** 하고 `## 2`로 통합한다. 세 소비자(`/repair-milestone` 회수·`/stabilize-milestone` 7-T·`/plan-milestone` R0)가 두 절을 이미 동일하게 취급하며, «즉시/권장» 구분은 `severity` 필드가 이미 표현한다.
- `## 2`를 **`## 2. 열린 항목`** 으로 개칭한다. `## 4`·`## 5`의 번호는 **바꾸지 않는다**(`## 5`는 인용이 많다). 폐지 번호는 재사용하지 않는다 — charter `## 10`·DISCOVERY `## 11`·milestone `## 7`의 결번 처리와 동형이다([ADR-060](ADR-060-decision-closure-and-milestone-seal.md) D1 선례).
- 절 이름을 지목하는 소비자는 **함께 재지정한다**. 누락하면 `/repair-acceptance`가 존재하지 않는 절에서 `(수용)` 태그를 회수·토글하게 되어 사용자가 이번 마일스톤에서 고치기로 택한 개선이 실행되지 않는다.

**D7-2. 아카이브 회전** — **`/plan-milestone` R0가 수행한다.**
- 직전 마일스톤의 회고 `graduation:`이 **`YES`일 때만** 수행한다. `YES`가 아니면 아무것도 옮기지 않는다.
- 대상: 그 마일스톤 블록의 **`status: resolved` 항목** + `IMPROVEMENT_GUIDE.md` `## 5`의 그 `### M-N` 그룹 **전체**(closed records라 전량 대상).
- **`status: open` 항목은 옮기지 않는다** — 활성 파일에 남아 carry-over가 된다.
- 목적지: `docs/40-validation/archive/<M>.md` 1파일. 안에 `## QA_FINDINGS` / `## IMPROVEMENT_GUIDE` 두 절을 두어 출처를 보존한다. **gitignore 대상이 아니다**(Record — `40-validation/` 하위의 다른 5개 디렉터리와 반대다).
- **순서 고정**: ① 아카이브 파일에 append → ② 원본에서 제거. 중단으로 양쪽에 남으면 다음 R0가 «아카이브에 이미 있는 ID를 원본에서 제거»로 정리한다. 유실보다 중복이 안전하다.
- 아카이브는 닫힌 항목만 담으므로 [ADR-005](ADR-005-ssot.md)#amend-1의 비중복 불변식 N-1(«열린 채로» 두 원장에 존재 금지)의 대상이 아니다.
- **회전과 함께 포인터를 갱신한다** — 회고 `post-close 수정:` 줄의 상세 포인터가 `IMPROVEMENT_GUIDE ## 5 ### M<N>`를 가리키는데 그 그룹이 아카이브로 옮겨가므로, 회전 시 그 포인터를 `docs/40-validation/archive/<M>.md`로 바꾼다. 갱신하지 않으면 졸업한 마일스톤의 회고가 빈 위치를 가리킨다.

### D8. 승계 항목 (1건은 재지정 포함)
- **evaluator-optimizer 패턴 명명** — `/stabilize-milestone`이 evaluator orchestration이다. generator = `/implement-workitem`, evaluator = qa + reviewer + deterministic preflight. **optimizer는 ADR-067 D5의 `/repair-workitem`에서 `/repair-milestone`으로 재지정한다** — 폐쇄 후 수리 주체가 마일스톤 층으로 옮겨졌기 때문이며, 이것이 D8에서 유일하게 «변경»된 항목이다. 폐쇄 *전* 라운드의 optimizer는 여전히 `/repair-workitem`이다.
- **사용자 수용과의 관계 (변경 없음)** — [ADR-066](ADR-066-milestone-acceptance.md)의 `/accept-milestone`은 관측 modality AC가 0건인 마일스톤에서만 선택이며, 1건이라도 있으면 그 receipt 없이 item 4를 충족하지 못하므로 사실상 필수 경로다. 졸업 판정 소유권은 `/stabilize-milestone`에 유지한다.

## 비결정 (영구 No)
- 폐쇄 마커 필드·폐쇄일·폐쇄 확인 프롬프트 — 「전 task `done`」이 이미 그 신호다.
- **폐쇄 후에도** 사용자가 명시 호출하면 `done`을 재개방할 수 있는 탈출구 — 남기면 마일스톤 층 skill이 «사용자에게 재개방을 권하는» 경로가 되살아나고, `/finalize-workitem` 범위 비교 교착도 함께 돌아온다. **폐쇄 *전* task 층의 재개방은 폐지 대상이 아니다**(D1).
- 원장의 요약 인덱스 블록 — 파생 요약은 다중 writer 환경에서 반드시 drift한다(폐지된 `## 0. 요약`·`## 1. 우선순위`가 그 실패 사례다). D7 회전이 같은 문제를 부작용 없이 푼다.
- 채점표의 content-hash 기반 신선도 판정 — ADR-064 D4가 같은 이유로 이미 기각했다.

## 결과
- 졸업 판정의 전 입력이 **커밋된 파일**에서 나온다 — 새 체크아웃 재검증이 불필요해진다.
- 재개방 연쇄·실행 순서 규칙·채점표 자기무효화가 함께 사라진다.
- 마일스톤 층 수정의 추적성이 `## 5`의 `affected` + `files` + `scope` 세 필드로 확보된다.
- 두 원장의 활성 크기가 마일스톤 수와 무관한 상수에 수렴한다.

## 정책 강도 (ADR-022)
- **제약(강) — [관측됨]**: D1 폐쇄 경계, D2 closure receipt 발급, D3 item 1·4, D6 회귀 테스트 선행 및 필수 필드, **D7-1의 소비자 재지정**(누락 시 `(수용)` 태그 회수가 죽는다).
- **enabling(약)**: D5 회고 항목, D7-1의 절 폐지·통합, D7-2 회전, D8 명명.

## Mutation Contract (ADR-047 D3)
1. **Target** — stabilize-milestone(§1.5·단계 8·플래그 2종 제거) / repair-milestone(2-A·2-C 삭제, `## 5` 필드, 부산물 위치) / repair-acceptance(재개방 판별→scope 분류값, 연쇄 삭제) / repair-workitem(2-G 조건부 `done` 거부) / finalize-workitem(closure 발급) / validate-workitem(폐쇄 가드) / accept-milestone(후속 안내) / plan-milestone(R0 회전) / MILESTONE_TEMPLATE `## 5`·`## 8` / TASK_TEMPLATE `## 8` / IMPROVEMENT_GUIDE `## 0`·`## 1`·`## 3` 폐지·`## 2` 개칭·`## 5` 필드 + 그 절 이름을 지목하는 소비자 전부 / WORKFLOW lifecycle·상태 전이 / DELEGATION 실행 순서 / ADR-066 D4 / ADR-052 D4·ADR-057 부분 supersede / ADR-067 전체.
2. **Failure mode** — (a) 채점표 자기무효화로 졸업 게이트가 수렴하지 않음 (b) 마일스톤 층 수리가 task를 재개방해 finalize 범위 비교 교착 (c) 새 체크아웃에서 전 task 재validate 강제 (d) 재개방 폐지 후 수정 파일이 어디에도 영속되지 않음.
3. **Predicted improvement** — 마일스톤 라운드 1회당 task 층 재실행 0회, 새 체크아웃 재validate 0회, `## 5` 항목마다 `files`·`scope`가 채워짐.
4. **Preserved invariants** — 졸업 항목 5+1 무증설 / 판정값 4종과 우선순위 / e2e 판정 SSOT = ADR-052#amend-1 / `/stabilize-milestone` read-only(코드·커밋·status 미변경) / commit owner = `/finalize-workitem`·사용자 / 원장 5종 배타 범위 / 관측 AC receipt의 사용자 authority.
5. **Falsifying evaluation** — dogfood 재실행에서 (a) 정상 마일스톤이 item 1에서 `- closure` 부재로 오차단되거나, (b) 마일스톤 층 수리가 회귀 테스트를 `validate`에 묶지 않아 item 2가 그것을 검사하지 못하거나, (c) `## 5`의 `files`·`scope`가 비어 추적이 끊기면 D2·D6을 재조정한다.
6. **Rollback path** — 본 ADR을 superseded로 두고 후속 ADR이 net 규칙을 다시 정의한다(ADR-067을 `accepted`로 되살리지 않는다). 되돌릴 실질은 넷이다: 폐쇄 경계 제거와 `done` 재개방 복원, closure receipt 폐지와 채점표 입력 복원, 졸업 item 4에 (a)(b)(c)(d) 복원, 아카이브 회전 제거.

## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT. 실제 파일 경로 1행 1개)
> 등재 기준: 본 ADR의 결정을 **실행하거나 집행하는 파일만** 등재한다.
- .claude/skills/stabilize-milestone/SKILL.md          — D3 §1.5 / D4·D5 단계 8 / D8 명명
- .claude/skills/repair-milestone/SKILL.md             — D1 재개방 금지 / D6 수리 계약·필수 필드
- .claude/skills/repair-acceptance/SKILL.md            — D1 재개방 금지 / D6 수리 계약·필수 필드
- .claude/skills/repair-workitem/SKILL.md              — D1 `done` 재개방 폐지
- .claude/skills/finalize-workitem/SKILL.md            — D2 closure receipt 발급
- .claude/skills/validate-workitem/SKILL.md            — D1 폐쇄 후 실행 가드
- .claude/skills/accept-milestone/SKILL.md             — D1 예외 2종 중 `- ac-acceptance` writer / D4 판정값 소비
- .claude/skills/plan-milestone/SKILL.md               — D3 `## 5` default 작성 / D7-2 아카이브 회전
- .claude/skills/validate-plan/SKILL.md                — D3 `[MP-graduation]` 정합 검사
- .claude/agents/reviewer.md                           — D3 `[MP-graduation]` 정합 검사
- .claude/skills/stack-guard/SKILL.md                  — D3 item 3 E2E-applicable 판정
- docs/30-workitems/_templates/MILESTONE_TEMPLATE.md   — D3 `## 5` / D5 `## 8`
- docs/30-workitems/_templates/TASK_TEMPLATE.md        — D2 `## 8` closure 형식
- docs/40-validation/IMPROVEMENT_GUIDE.md              — D6 `## 5` 필수 필드 / D7-1 절 폐지·개칭
- docs/00-meta/WORKFLOW.md                             — D1 lifecycle·상태 전이
- docs/00-meta/DELEGATION_STRATEGY.md                  — D1 실행 순서 / D8 명명
- docs/00-meta/STRUCTURE.md                            — D7-2 아카이브 산출물 행
- docs/90-decisions/boilerplate/ADR-052-stack-provisioning-and-e2e-readiness.md — D1 부분 supersede(D4의 per-task 위임 라우팅)
- docs/90-decisions/boilerplate/ADR-057-planning-v2-batch-and-seam.md — D1 부분 supersede(폐쇄 후 `done` 재개방) · D1-b 부분 supersede(결정 6 `--feature`)

## 참고
- ADR-007(lifecycle), ADR-022(Ratchet), ADR-045 D6(재발행 기준), ADR-052#amend-1(e2e 5상태 SSOT), ADR-057#amend-1(ROADMAP 파생), ADR-064 D4(receipt 위치·판독 규칙), ADR-065(AC 검증 modality), ADR-066(수용 단계), ADR-067(대체 대상).
