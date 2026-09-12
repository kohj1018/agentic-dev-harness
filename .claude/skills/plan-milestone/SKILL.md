---
name: plan-milestone
description: Run a multi-round main-session conversation to author milestone(s) (M1 included — ADR-057) and their feature docs. Additive — never overwrites existing milestones; hand off to /plan-workitem for tasks.
argument-hint: "[milestone idea | M<N>]"
disable-model-invocation: true
allowed-tools: Read Glob Grep Write Edit Agent
---

이 skill은 메인 세션이 R0~R4를 직접 운전해 마일스톤(M1 포함)과 그 feature 문서를 작성하는 절차서다.
**첫 마일스톤(M1) 포함 모든 마일스톤**을 다룬다(ADR-057 결정 1 — bootstrap-project는 charter/ARCH까지, 마일스톤 생성은 본 skill 단일 경로). **입력 분기 (상태기계 — ADR-057#amend-3 결정 5)**: (a) **기존 `draft` M<N>** → 그 M의 최초 미완 라운드부터 **재개**(완료 라운드는 멱등 skip). **UI 마일스톤(ADR-073 D9)의 draft M이 R0~R4를 모두 마쳤으면 라운드를 재실행하지 않고 «다음: `/design-milestone M<N>`»만 안내한다**(화면 층은 그 skill 소관 — ADR-072 D8). **단 사용자가 텍스트 계약(scope·FAC·시나리오) 수정을 명시 요청했거나 `/repair-plan`이 그 층의 finding을 회수해 온 경우에는 해당 라운드부터 재개한다** — `/repair-plan`은 `draft` M을 본 skill로 돌려보내므로(그 skill 2-M), 이 예외가 없으면 draft UI M의 계획 결함을 고칠 경로가 사라진다. (b) **`contract-ready` M<N>** → 상위 계약 라운드는 끝났으나 아직 잠기지 않았다. 계약 수정 요청이면 해당 라운드부터 재개하고(텍스트 계약 — 화면·PX·스냅샷 층은 `/design-milestone M<N>` 재진입), 끝나면 다시 `contract-ready`로 둔다(봉인은 `/seal-milestone` 담당). 계약을 고쳤으면 영향받은 feature 문서에 `- 계약 수정: <날짜> — 이 feature의 task 재검증 필요` 마커를 남긴다(ADR-060 D6 stale task 방지). (b-2) **`ready` M<N> + 마일스톤 `## 10`에 `- 봉인일:` 채워짐** → 봉인 완료 상태이므로 **변경 거부** + "그 변경은 다음 마일스톤(M<N+1>)" 안내. (b-3) **`ready` M<N>인데 `## 10` 부재·미채움** → 구 lifecycle에서 온 **마이그레이션 대상**이다(ADR-060 D12). 변경을 거부하지 말고 `/seal-milestone M<N>` 실행을 안내한다(seal이 조건 2~8을 전수 재검사한다). (c) **존재하지 않는 M ID** → 오류 종료. (d) **새 아이디어**(자유 텍스트) → 다음 번호 M 생성.
**additive 모드**(기존 마일스톤을 재생성·덮어쓰기 하지 않는다). **기존 마일스톤에 *새 feature만* 추가하는 경우는 `draft`·`contract-ready` M<N> 재개 대화 안에서만** 처리한다(별도 `feature idea` 진입 제거 — 미봉인 마일스톤이 여럿이면 대상이 모호): 예: 진행 중인 draft M1에 F-00X를 추가할 때 M1 문서는 재생성하지 않고 feature 문서만 새로 작성한 뒤 M1 `## 3. 포함되는 기능`에 링크 한 줄을 추가한다. **`ready` M엔 feature 추가를 금지**한다 — 그 feature는 새 마일스톤(M<N+1>) 범위다. **`contract-ready` M에는 feature를 추가할 수 있다**(아직 봉인 전 — ADR-060 D6). task 분해는 마일스톤 전체 계획 스냅샷에서 수행한다(역할 경계 유지).
무거운 추론(R2의 마일스톤 분할 판단)은 `Agent` 도구로 architect를 단발 sub-call로 위임한다.
각 라운드(R0~R4) 산출물은 메인 컨텍스트에 누적시키지 않고 milestone/feature 문서에 적재한다.

**패턴 차용** — `discover-product`/`bootstrap-design`와 동일하게 `context: fork`를 명시하지 않아 메인 세션이 라운드를 직접 운전한다. 종료 후 사용자가 `/clear` 또는 새 세션으로 컨텍스트를 정리할 것을 권장한다(라운드 인터랙션이 다음 task 컨텍스트에 잡음).

**Codex**: 서브에이전트는 GA이나 본 저장소가 Claude persona 위임을 Codex subagent로 아직 매핑하지 않아 순차 단일 실행으로 degrade — R2의 architect 단발 sub-call은 이 매핑 부재로 메인 세션이 직접 추론한다(품질 보장을 위해 충분히 깊게 사고).

**경계** — 이 skill은 milestone + feature까지만 만든다. task 분해(`## 7-1` FAC↔AC 매핑·sizing)는 만들지 않는다 — `/plan-workitem`이 이어 수행한다(자동 호출 아님).

입력:
- `$ARGUMENTS`에 개발자의 다음 마일스톤/feature 아이디어가 자연어로 들어온다(비어 있으면 R1에서 입력 출처들을 회수해 사용자와 정한다).

사용자 응답 수단:
- 라운드별 응답은 자연어로만 받는다.
- 매 라운드 끝에 `skip` / `good` / `refine: …`로 응답할 수 있다.

라운드 출력 포맷 (ADR-046 출력 스타일 — 사용자-facing 표면만 압축, 내부 분석·문서 적재 내용은 불변):
각 라운드는 다음 고정 포맷으로 압축해 출력한다.
```
이번 결정: <1~2줄>
확인 필요: <있으면 ≤3개, 없으면 생략>
답변: skip / good / refine: …
```
사용자가 *선택해야 하는* 옵션(R2의 분할 vs 단일 등)은 선택 가능하도록 보존한다 — 압축은 framing·서술에만 적용한다(ADR-046#d3). architect 단발 sub-call의 *과정*은 대화에 풀어쓰지 않는다.

반드시 먼저 읽을 파일:
- `docs/10-charter/PROJECT_CHARTER.md` (페르소나·비목표 — 새 마일스톤 scope 가드)
- `docs/30-workitems/_templates/MILESTONE_TEMPLATE.md` (마일스톤 양식 SSOT)
- `docs/30-workitems/_templates/FEATURE_TEMPLATE.md` (feature 양식 SSOT)
- 직전 마일스톤 문서(있으면 — `docs/30-workitems/milestones/` 최신 Mx)

라운드 구성:

**R0 — 직전 마일스톤 회수 (additive 입력)**
- 직전 마일스톤 문서가 있으면 다음만 회수한다(ADR-019 minimal — 전체 fork-load 금지):
  - `## 8. 회고` (graduation 판정·목표 달성도·scope creep·핵심 학습) — `/stabilize-milestone`이 채운 내용.
  - `## 5. 완료 기준` 졸업 상태(graduation 미충족 항목이 남아 있으면 carry-over 후보).
  - 직전 마일스톤에서 *stabilize 이월*된 미완 항목(졸업 안 된 task / open finding).
- **로드맵 재조정 (ADR-057#amend-1·#amend-4)**: `docs/30-workitems/ROADMAP.md`를 읽어 직전 마일스톤 `## 8. 회고`의 `graduation:` 판정 + task done/total로 Done/Now 구간을 최신화한다(graduation=YES면 Now→Done 스냅샷, 진행 중이면 진척 갱신). **미졸업 Now 가드**: 현재 Now 마일스톤의 graduation이 `YES`가 아니면(진행 중·`PENDING_ACCEPTANCE`·`NO`·`BLOCKED`) *명시적 병렬 승인이 없는 한*(수렴 실패 브리프에서 사용자가 선택지 C를 택한 경우가 명시적 병렬 승인이다 — ADR-070 D5. 그 M의 open P0는 carry-over로 계속 표시된다) 새 마일스톤을 Now로 추가하지 않는다 — 안내 문구는 판정별로 갈린다: `PENDING_ACCEPTANCE`면 **"현재 Now(M<N>) 수용 대기 — `/accept-milestone M<N>` 후 진행 권장"**, 그 외면 "현재 Now(M<N>) 미졸업 — 완료 후 진행 권장". 어느 쪽이든 새 Now 생성을 보류한다(단일 Now 규율). Next 후보를 Now로 승격·중복 생성 방지를 위해 각 Next/Later 행은 안정적 candidate key(목표 슬러그)를 갖는다. **로드맵의 `Done`/`Now`/`Next`/`Later` 네 구간은 plan-milestone만 쓴다** — `## Backlog`만 append-only 다중 writer이며(ADR-057#amend-4 결정 2) 그 구간의 정리·승격도 본 skill이 한다. 선택지 C로 진입하면 DECISION_REGISTER의 그 `[Convergence]` 항목을 `closed`(앵커: ROADMAP `## Now` 행)로 쓰고 `IMPROVEMENT_GUIDE.md ## 5 ### M<N>`에 `- convergence-decision: C (round K, <날짜>)`를 append한다(ADR-070 D5).
- **`## Backlog` 회수 (ADR-057#amend-4)**: 같은 파일의 `## Backlog` 절을 읽어 **수용 라운드·repair-acceptance가 쌓아 둔 범위 후보**를 전수 회수하고 R1의 목표 후보 재료로 넣는다. 각 행은 `- `<candidate-key>` <요약> — 출처: ... / 확신도: ...` 형식이다. **자동 편입하지 않는다 — R0는 회수만 한다.** 사용자 선택은 R1, 분할 확정은 R2이므로 **R0에서 Backlog 행을 제거·이동하지 않는다**(확정 전에 지우면 R2에서 빠진 항목이 사라진다). 착수·후속 배정이 확정된 뒤 **R1이 그 항목의 `## Backlog` 행을 제거하고 candidate-key를 인계한다**(ADR-057#amend-4 결정 3 «Next로 승격하며 Backlog 행 제거» + `## 현재 유효 결정`의 «회수는 R0 → R1») — 이번에 착수하는 분은 R3의 `Now` 행이, 후속 분은 `## Next` 행이 그 key를 그대로 쓴다(#amend-1 candidate-key 매칭 — 중복 생성 방지). 택하지 않은 항목은 그대로 둔다.
- `docs/40-validation/IMPROVEMENT_GUIDE.md`·`docs/40-validation/QA_FINDINGS.md`의 *open* 항목(특히 P0/P1)을 회수해, 다음 마일스톤이 회수할 부채 후보로 surface(자동 편입 X — 사용자 결정). `[ADR-candidate]` 라벨 항목은 별도로 surface하고, 사용자가 채택하면 **R3 진입 전에 architect 단발 sub-call(입력: 후보 결정 줄·linked workitem·`_ADR_GUIDE` 권장 섹션·project 인덱스의 다음 빈 번호 — ADR-000#amend-2 결정 4 필독 + 번호 충돌 방지)로 `docs/90-decisions/project/ADR-1NN-<slug>.md` 초안(proposed) 작성 + project 인덱스 등재 + 해당 후보 항목 status를 open → resolved(adopted: ADR-1NN)로 갱신**까지 수행한다(ADR-000#amend-2 — 미갱신 시 다음 R0가 이미 채택된 후보를 재surface해 중복 ADR 위험). 기각 시에도 IMPROVEMENT_GUIDE 후보 status를 open → rejected로 갱신한다. **`scope: out-of-AC` 항목은 별도로 surface한다 (ADR-005#amend-1 / ADR-066 D4)**: `IMPROVEMENT_GUIDE.md` `## 4. 보류 항목`에서 `scope: out-of-AC` + `status: open`인 항목을 전수 회수한다 — **HTML 주석(`<!-- ... -->`) 밖의 줄만 센다**(그 섹션 주석에 같은 술어의 형식 예시가 들어 있어, 주석까지 세면 매 라운드 `<M>-uat-<N>` 유령 항목이 올라온다 — ADR-064 D4 판독 규칙과 동형). 회수한 각 항목에 대해 **«이 동작을 AC로 승격할 것인가»** 를 사용자에게 묻는다. 이것은 「코드에는 들어갔으나 어느 계약에도 근거가 없는 변경」이며, 승격을 택하면 **R4에서 그 feature `## 7. FAC`에 항목으로 넣는다** — **task AC는 본 skill이 만들지 않는다**(위 「경계」: milestone + feature까지. `/plan-workitem`이 그 FAC를 받아 AC로 분해하고 `## 7-1` 매핑을 채운다 — ADR-057 결정 1). 원본은 **그 FAC가 실재한 뒤**(R4 이후) `status: resolved (승격: <feature-id>:FAC-N)`로 닫는다 — N-3 앵커는 실재하는 대상을 가리켜야 한다(ADR-005#amend-1). 택하지 않으면 그대로 열어 둔다. **자동 승격하지 않는다** — 계약을 넓히는 것은 사용자 결정이다. 회수한 항목 중 «상위 정본의 한 절을 고치면 해소되는» 것은 `/amend-ssot "<변경>"`을 처방으로 함께 안내한다(ADR-069).
- **아카이브 회전 (ADR-068 D7-2)**: 직전 마일스톤의 회고 `graduation:`이 **`YES`일 때만** 수행한다(`YES`가 아니면 아무것도 옮기지 않는다).
  - 대상: `QA_FINDINGS.md`의 그 `## M-N` 블록에서 `status: resolved`인 항목 + `IMPROVEMENT_GUIDE.md` `## 2`·`## 4`의 그 `### M-N` 그룹에서 `status: resolved`인 항목 + `## 5. Repair decision log`의 그 `### M-N` 그룹 **전체**(closed records라 전량 대상).
  - **`status: open` 항목은 옮기지 않는다** — 활성 파일에 남아 carry-over가 된다.
  - 목적지: `docs/40-validation/archive/<M>.md`. 파일이 없으면 아래 골격으로 만든다.
    ```markdown
    # <M> 아카이브 (졸업: <YYYY-MM-DD>)

    ## QA_FINDINGS

    ## IMPROVEMENT_GUIDE
    ```
    `## 5` 그룹은 `## IMPROVEMENT_GUIDE` 절 아래 `### Repair decision log` 하위 절에 넣는다.
  - **순서 고정**: ① 아카이브 파일에 append → ② 원본에서 제거. 중단으로 양쪽에 남으면 다음 R0가 «아카이브에 이미 있는 ID를 원본에서 제거»로 정리한다.
  - **회고 포인터 갱신 (ADR-068 D7-2)**: 그 마일스톤 문서 `## 8. 회고`의 `post-close 수정:` 줄이 `IMPROVEMENT_GUIDE ## 5 ### M<N>`를 가리키고 있으면, 그 그룹이 아카이브로 옮겨졌으므로 포인터를 `docs/40-validation/archive/<M>.md`로 바꾼다. 그 줄이 `없음`이면 손대지 않는다.
  - 아카이브는 커밋 대상이다(gitignore 아님). 옮긴 항목 수를 R0 출력에 한 줄 남긴다.
- 직전 마일스톤 부재(첫 호출 — 마일스톤 0개, M1 생성 회차)면 R0를 건너뛰고 회고 carry-over는 "없음"으로 표시.

**R1 — 입력 intake (다음 마일스톤의 재료)**
- 다음 입력을 모아 사용자와 정렬한다:
  - 개발자 아이디어(`$ARGUMENTS`).
  - `docs/10-charter/DISCOVERY.md` `## 14. Evidence Log`(새 증거) + `## 15. Insight Backlog`(미반영 insight) + CHARTER(범위/비목표).
  - 사용자 인터뷰·최근 큰 버그 발견·리팩토링 부채(R0의 IMPROVEMENT_GUIDE/QA_FINDINGS 회수분).
  - **`(미할당)` 결정 triage (ADR-060 D1)**: `docs/10-charter/DECISION_REGISTER.md`에서 `영향: (미할당)` + `status: open`인 항목을 전수 회수해, 이번 마일스톤 범위면 `영향: M<N>`으로 배정하고 아니면 앵커·회수 시점을 붙여 `deferred`로 정리한다. **bootstrap 구간(마일스톤 존재 전)에 등재된 미결정의 유일한 회수 지점**이므로 건너뛰지 않는다. 원장 파일이 없으면 사유 echo 후 skip. **원장 재분류 규칙 (ADR-005#amend-1) — 본 라운드에서 두 방향을 함께 처리한다.** ① **DECISION_REGISTER → ROADMAP**: 회수한 결정 항목이 «정본 문서의 한 절»이 아니라 «다음 마일스톤 문서 하나»로 해소되는 것이면 결정 원장이 아니라 ROADMAP `## Backlog`가 제자리다. ② **IMPROVEMENT_GUIDE → ROADMAP**: R0가 회수한 `IMPROVEMENT_GUIDE` open 항목 중 «그것을 하면 task 이하가 아니라 마일스톤 하나가 되는» 것도 Backlog가 제자리다. 어느 방향이든 **원본을 `status: resolved (재분류: ROADMAP ## Backlog <candidate-key>)`로 닫고 Backlog에 등재한다**(N-2·N-3 불변식 — 두 곳에 동시에 열어 두지 않는다). **`## Backlog`는 `/accept-milestone`·`/repair-acceptance`도 append할 수 있는 구간이지만(ADR-057#amend-4 결정 2) «다른 원장에서 옮겨 오는» 재분류는 본 skill만 한다** — 원본을 닫는 일과 등재를 한 트랜잭션으로 묶어야 N-2가 지켜지고, 그 둘을 함께 볼 수 있는 자리가 여기뿐이다. **R0가 회수한 Backlog 항목 중 착수·후속 배정이 확정된 것의 `## Backlog` 행 제거도 이 라운드에서 한다** — 제거한 candidate-key는 R3의 `Now` 행(이번 착수분) 또는 `## Next` 행(후속분)이 그대로 이어받는다(ADR-057#amend-4 결정 3). **`status: deferred`이고 `회수:` 시점이 «이번 M plan-milestone R1»인 항목**(스택 카탈로그 `이관`분 — ADR-071 D2)도 회수해 결정하거나 재이관한다(회수 시점을 다시 앞으로 미루는 무한 이관은 사용자 확인 필요).
- 위 재료를 *다음 마일스톤이 다룰 목표 후보*로 묶어 1~N개 제시. 사용자가 우선순위를 정한다.

**R2 — architect 단발 sub-call: 분할 vs 단일 협상**
- R1의 목표 후보를 *여러 마일스톤으로 쪼갤지, 한 마일스톤으로 묶을지* `Agent`(architect) 단발 sub-call로 판단(스코프 크기·의존·졸업 가능성 기준). (Codex: 서브에이전트는 GA이나 본 저장소가 Claude persona 위임을 Codex subagent로 아직 매핑하지 않아 메인 세션이 직접 판단.)
- architect 결론(분할 권고·각 마일스톤 한 줄 목표·feature 후보 목록)을 받아 사용자와 협상한다. 사용자가 분할 구조를 확정할 때까지 반복.
- architect 지시에 포함: "feature 경계를 가로지르는 상태 전이·2차-write·멱등 seam 후보가 보이면 각 feature 후보의 시나리오 메모와 ARCH §4-1(상태 모델) 기록 권장을 결론에 포함하라" (ADR-057 결정 13 — 라운드 신설 X).
- **고-stakes 설계 게이트 (ADR-053)**: R2 분할에 외부 기술 불확실성이 있으면 ADR-053 리서치-only 게이트(researcher 위임). 분할 자체는 다각도 패널 불요. **라운드 중 비-스택 프로세스·제품 범위·보안·boilerplate supersede·cross-milestone 재검토 결정(ADR-000#amend-2 결정 3의 5개 기준 — 전부)이 확정되면 그 시점에 architect 단발 sub-call로 project ADR 초안(proposed) 작성 + 인덱스 등재까지 수행한다(작성 주체·시점 SSOT = ADR-000#amend-2 트리거 표·ADR-053#amend-1 — 분할의 research-only와 별개; R0의 [ADR-candidate] 회수 authoring과 동일 경로).**

**R3 — 마일스톤 문서 authoring (MILESTONE_TEMPLATE에서)**
- **지금 착수하는 마일스톤만 실체화 (rolling-wave — ADR-057#amend-1)**: R2에서 확정한 분할 중 *이번에 착수하는* 마일스톤(기본 1개 = Now)만 `docs/30-workitems/_templates/MILESTONE_TEMPLATE.md`를 복사해 `docs/30-workitems/milestones/M<N>-<이름>.md`로 작성한다. `<N>`은 기존 마일스톤 다음 번호(첫 호출이면 M1 — additive, 기존 보존). **R2 분할이 식별한 *후속* 마일스톤은 지금 Mx 문서를 만들지 않는다 — 그 마일스톤의 feature 문서·화면 프로토타입(`/design-milestone`)도 만들지 않는다** (로드맵 Next/Later에 얇은 행으로만). 후속 마일스톤의 feature·프로토타입은 그 마일스톤이 *Now가 되는 회차*에 생성한다. (이래야 "미번호 얇은 후보 vs 실체 문서"가 어긋나지 않는다 — rolling-wave 핵심.)
- **로드맵 갱신 (ADR-057#amend-1)**: `docs/30-workitems/ROADMAP.md`(baseline shell 존재 — 없으면 헤더 포함 생성)에 이번 마일스톤 행을 **Now**로 쓴다(id·**`candidate-key`**(안정 목표 슬러그 — Later/Next에서 승격됐으면 그 key 그대로 유지, 신규면 새로 발급)·목표·진척·주요 기능 링크·의존). **진척 칸은 `tasks: unplanned`로 둔다** — R3 시점엔 plan-workitem 미실행이라 총 task 수 N을 모른다. plan-workitem이 task를 만든 뒤 다음 plan-milestone R0 재조정이 이 칸을 실제 `done/total`로 갱신한다(`0/N`처럼 미확정 N을 지금 박지 말 것). **직전 Now 행의 Done 전환은 R3가 강제하지 않는다** — 그 마일스톤 회고 `graduation:`이 YES일 때만 Done이며, 판정 반영은 R0 재조정이 담당한다(graduation 확인 없이 Done 박기 금지). R2 분할의 후속 마일스톤은 Next/Later에 얇게만(목표 1줄 + 확신도, `(M?)` 잠정 — 기능·AC·졸업 칸 만들지 말 것). Now 기본 1개(병렬은 명시 결정 시만). 로드맵의 `Done`/`Now`/`Next`/`Later` 네 구간은 plan-milestone만 쓴다 — `## Backlog`만 append-only 다중 writer다(ADR-057#amend-4 결정 2). **R3는 `## Backlog`를 건드리지 않는다**(회수·승격은 R0·R1 담당).
- `## 5. 완료 기준`은 graduation checklist 5+1 default 그대로 복사(ADR-068). 사용자가 협상한 추가 기준만 "(선택)" 행에 채운다 — 정책 중복 금지(MILESTONE_TEMPLATE·ADR-068이 SSOT).
- `## 8. 회고`는 비워둔다 — `/stabilize-milestone`이 자동 채움(ADR-068).
- `## 6. 관련 문서`에 Charter / Architecture / 관련 ADR 링크를 채운다.

**R4 — feature 문서 authoring (FEATURE_TEMPLATE에서)**
- **지금 착수하는 Now 마일스톤(R3에서 실체화한 그 마일스톤)의 feature 후보만** `docs/30-workitems/_templates/FEATURE_TEMPLATE.md`를 복사해 `docs/30-workitems/features/F-<NNN>-<이름>.md`로 작성한다(기존 feature 다음 번호, 첫 호출이면 F-001 — additive). **R2 분할이 식별한 후속 마일스톤의 feature는 지금 만들지 않는다** — 그 마일스톤이 *Now가 되는 회차*에 생성한다(R3 불릿과 정합, rolling-wave 핵심). 나머지 불릿(`## 0-1 Type`·`## 3 시나리오`·`## 7 FAC`·`## 7-1 빈 shell` 등)은 그 Now 마일스톤 feature에 대해 기존대로.
- `## 0-1. Type`을 채운다(ADR-039). `feature`면 `## 2`를 User Story로, 비-feature(technical-enabler/bugfix/refactor/migration/research-spike)면 기술적 근거 + 서비스하는 DISCOVERY ID·ADR 링크로 채운다(정책은 FEATURE_TEMPLATE 주석·ADR-039가 SSOT).
- `## 3. 핵심 시나리오`(feature가 만족시킬 사용자 시나리오)와 `## 10. 의존성`(feature 간 선후·병렬)을 채운다 — FAC가 추적할 시나리오 + feature 의존 검토의 전제. 이 두 섹션 *신설*은 `/plan-milestone` 책임이다(plan-workitem 아님).
- `## 7. Feature-level Acceptance Criteria`(FAC)를 시나리오 수준 측정 기준으로 채운다.
- `## 7-1. FAC ↔ AC 매핑표`는 **빈 shell만** 둔다(`- FAC-1 →` 등 우변 미채움) — task 분해 시 `/plan-workitem`이 채운다(영속 SSOT, ADR-036/ADR-037). 이 skill은 task를 만들지 않으므로 매핑을 채우지 않는다.
- **`## 8-1. UX 흐름 품질`을 채운다** (ADR-042 / #amend-2). UI·사용자 행동이 있는 feature 한정이며 비-UI 는 `(해당 없음)` 으로 명시한다. `success metric`(HEART signal 1개)과 **계측 필드**(이벤트명·발생 지점·속성·도구)를 함께 채운다.
  - **`Needs Instrumentation` (ADR-062 D10 이 정의 소유)**: 계측 필드를 채울 근거가 없으면(측정 대상은 정해졌으나 어떤 이벤트·속성·도구로 잡을지 미정) `analyst` 에 **`Agent` 로 위임**해 계측 설계를 회수하고 그 결과로 필드를 채운다. **데이터는 소급 수집이 불가능하므로 이 시점을 놓치면 다음 측정 주기를 다시 기다려야 한다.**
  - **수집 최소화**: "나중에 못 모으니 전부 수집"이 아니다. **측정 목표에서 역산해 그 목표에 필요한 속성만** 적는다(ADR-006 단순성). 개인정보 항목이 포함되면 `analyst` 가 `재자문 필요: legal`(고지)·`재자문 필요: security`(보호 등급)를 반환하며, 그 항목은 **`user-choice` 로 원장 등재를 제안**한다 — 자동 위임이 개인정보 수집 결정을 사용자 몰래 확정하지 않는다.
  - 위임 결과는 `## 8-1` 필드 자체가 영속 기록이 된다(auto 경로는 `insights/` 노트를 만들지 않는다 — ADR-062 D10). 도구 선택 근거가 필요하면 사용자에게 `/consult-expert data` 명시 호출을 안내한다.
  - 위임이 불가한 환경(Codex 등)에서는 `.claude/agents/analyst.md` 를 인라인 수행하거나 `/consult-expert data` 선행을 안내한다.
- `## 11. 관련 문서`의 Milestone 링크를 R3 마일스톤으로 채운다. 비해당 스택의 Architecture-Iface/Design 줄은 삭제(placeholder 잔존 금지).
- **UI feature 표시**: 화면이 있는 feature는 `## 11. 관련 문서`의 `Design:` 줄을 채운다(DESIGN.md 링크). 이 줄이 UI feature·UI 마일스톤 판정 신호다(ADR-073 D9). 비-UI feature는 그 줄을 삭제한다.

**(UI 마일스톤) 화면 층은 본 skill이 만들지 않는다 (ADR-072 D8)**: 화면 목록·전환표·브리프·코드 프로토타입·스냅샷·PX 인벤토리·`## 9` 전환표는 `/design-milestone M<N>`이 채운다. R4 종료 시 `## 9`는 비워 둔다(«(해당 없음)» 기입 금지 — design-milestone R1이 판정).

**Evidence/Insight 연결 (ADR-035#amend-2)**: `Type: feature`이고 DISCOVERY `## 15. Insight Backlog`의 insight를 구현하는 feature면 `## 1. 요약`에 `근거 insight: I-N` 한 줄을 박고, 해당 Insight Backlog 행의 `status=planned` + `linked feature` 갱신을 *출력에 권장*한다(이 skill은 DISCOVERY를 직접 수정하지 않음 — `/discover-product --update`가 회수). 근거 insight 없는 즉흥 feature는 출력 "남은 미결정 사항"에 `- 근거 insight 부재: F-NNN — DISCOVERY 회수 권장` 명시. 비-feature 타입은 가정/기회·ADR 링크로 정당화되므로 insight 부재 경고를 내지 않는다.

**Exit — 확정 재대조 (ADR-060 D6 / ADR-072 D8)**: 종료 전 마일스톤 `## 3` ↔ feature `## 3` ↔ feature `## 7` FAC 정합을 재대조한다(`## 7-1`은 shell). 불일치면 해당 라운드로.
- **비-UI 마일스톤**: 재대조 통과 + `DECISION_REGISTER.md`의 이 M `영향:` 및 `(미할당)` `status: open` 0건일 때만 **feature 먼저, M 마지막** `contract-ready`. open이 남으면 보류 + D-NNN 보고. 원장 부재는 echo 후 skip.
- **UI 마일스톤(산하 feature `Design:` 줄 ≥1)**: 재대조만 통과시키고 **`draft` 유지**. `contract-ready` 전환은 `/design-milestone M<N>`이 화면 층 정합(프로토타입↔`## 3`↔PX↔`## 9`)까지 본 뒤 수행한다. 출력에 «다음: `/design-milestone M<N>`».
**`contract-ready`는 잠금이 아니다** — task 분해 진입 자격일 뿐이며, 분해 중 상위 계약 결함이 드러나면 `/repair-plan`이 그 자리에서 고친다. 잠금은 `/seal-milestone`이 `ready`를 부여할 때 발생한다.

**계획 잠금 (ADR-060 D6/D7)**: M/F/task 계획은 `/seal-milestone`이 `ready`를 부여한 시점부터 잠긴다. 그 전(`draft`·`contract-ready`)에는 feature 추가·FAC 수정·프로토타입 갱신·task 수정이 모두 정상 경로다. `ready` 이후의 변경은 다음 마일스톤(M<N+1>)이 기본이고, 구현이 시작되면 task 계획도 변경하지 않는다(근본 충돌은 사용자 중단·보고).
**단계별 출구**: 중단된 산출물은 같은 draft `/plan-milestone M<N>` 재개의 입력이며, 비-UI는 M·전 feature가 `contract-ready`가 된 뒤 `/plan-workitem M<N>`, UI는 `draft` 상태에서 `/design-milestone M<N>`을 안내한다(부분 계획 진입 금지).

**다국어**: 입력 언어를 따른다. 한국어 입력이면 산출물도 한국어, 영문 입력이면 영문.

종료 후:
- 사용자가 `/clear` 권장 — R0~R4 인터랙션이 다음 task 컨텍스트에 잡음.

마지막 출력 ([WORKFLOW.md "스킬 종료 시 다음 단계 출력 contract"](../../../docs/00-meta/WORKFLOW.md) 양식 정합):
- 생성·갱신한 문서 목록(상대 경로 — 마일스톤·feature) — (UI 마일스톤) `draft` 유지·화면 층은 `/design-milestone M<N>`
- **로드맵 갱신됨: `docs/30-workitems/ROADMAP.md` (Done/Now/Next/Later 반영 — ADR-057#amend-1)**
- 마일스톤 ↔ feature 구조 한 줄 요약
- 핵심 가정
- 남은 미결정 사항 (근거 insight 부재 / 부채 회수 후보 포함 — 기존 슬롯 유지)
- **원장 요약**: `closed N건 / deferred M건 / open K건`
- 다음 단계:
  ```
  다음 단계:
  - (UI 마일스톤) 기본 권장: `/design-milestone M<N>` — 화면 브리프·코드 프로토타입·스냅샷·PX 인벤토리 완성 후 `contract-ready`. 그 뒤 `/plan-workitem M<N>`.
  - (비-UI) 기본 권장: `/plan-workitem M<N>` — 본 마일스톤 전 feature의 task·`## 3`·AC·FAC·seam·PX↔AC를 1회 완성(전체 스냅샷). task는 전부 `draft`로 남으며 승격은 `/seal-milestone`이 한다.
  - 분기 옵션 (해당 시 — ≤3 개):
    - 마일스톤 plan 교차검토 원하면: 다른 세션·다른 LLM에서 `/validate-plan <M>`(milestone-plan mode) 후 원본에서 `/repair-plan <M>` — **M이 `contract-ready`면 M/F scope·FAC 층 finding은 repair-plan이, 프로토타입·PX 층은 `/design-milestone` 재진입이 그 자리에서 고칠 수 있다**(ADR-060 D6 — `ready` 이후에만 다음 M으로 보낸다)
    - UI feature 포함 + DESIGN.md 미반영 시: `/bootstrap-design --update` 먼저
    - 기획 신뢰도 재확인 원하면: 다른 세션에서 `/validate-discovery --reviewer-tag <tag>` 후 원본에서 `/repair-discovery`
  - 프롬프트 동봉 권장:
    - charter `## 5. 비목표` 핵심 키워드
    - R0의 부채 회수 후보
    - 원장의 `status: open` 항목 ID 목록 (있으면 — 봉인 전에 닫아야 한다)
  ```

## 결정 마감 (ADR-060)
본 skill이 내리거나 발견하는 기획 결정 중 **사용자가 정하거나 승인해야 할 것**을 `docs/10-charter/DECISION_REGISTER.md`에 등재한다 — 대화 출력으로만 두지 않는다.

1. **등재 시점에 `authority`를 확정한다** (ADR-060 D2): 제품 의도·범위·우선순위·사용자 체감·외부 계약·데이터/보안·비용·위험 허용도·비가역 약속 → `user-choice`. 스택·인증·데이터 경계·되돌리기 비싼 구조 → `user-approval`. 승인된 경계 안의 가역적 내부 선택 → `agent-delegated`. **`user-*`를 `agent-delegated`로 낮추려면 사용자 명시 승인 + 항목에 이력 줄이 필요하다.**
2. **등재 범위 (원장을 얇게 유지)**: `user-*` 결정 전부 + 종류 불문 `open`/`deferred`로 남는 항목만 등재한다. **`agent-delegated`는 개별 등재하지 않고** 4의 일괄 확인으로만 처리한다. **코드 품질·형식 지적과 계획 결함은 원장 대상이 아니다** — 기존 `남은 미결정 사항` 출력 슬롯이 그대로 소유한다.
3. **`user-*` 결정은 Decision Brief 6블록으로 제시한다** (ADR-060 D3 / ADR-046#amend-1 — 압축 예외): 배경(왜 지금) → 용어(배경 없이도 이해되게) → 선택지 2~3안(각각 한 줄 요약·이 프로젝트에서의 체감·장점·감수할 것) → 되돌리기 비용 → 추천+근거 → 답변 방법. **라운드당 3~5개 상한**, `skip` 불허(선택 / 추가 설명 / 리서치 요청 / 연기 중 택1). 답변은 평이한 문장으로 재진술해 확인한 뒤 정본에 기록한다.
4. **라운드 종료 시 일괄 확인 1회**: 그 라운드의 `agent-delegated` 결정을 목록으로 제시하고 "바꿀 것 있으면 알려달라"를 1회 확인받는다. 사용자가 뒤집으면 그 항목은 `user-approval`로 원장에 등재한다.
5. **닫히지 않은 항목**: 현재 M 무영향 + 이관 앵커 + 회수 시점 3개를 모두 갖추면 `deferred`, 아니면 `open`으로 남긴다(ADR-060 D4). **앵커 없는 유예는 금지**한다. 현재 M을 막는 사실 조사는 `deferred`가 아니라 `/research-pack` 선행으로 종결한다.
6. 결정 *본문*은 **본 skill이 소유한 문서**(milestone / feature / task)에 쓰고, 원장에는 위치 앵커와 처분 상태만 적는다(ADR-005). 정본 3종(Charter / ARCHITECTURE / DESIGN) 변경이 필요하면 고치지 말고 소유 skill(`/bootstrap-project --apply` · `/bootstrap-stack` · `/bootstrap-design --update`)을 텍스트로 권장한 뒤 원장에 항목을 남긴다.
7. `영향:` 칸에는 이 마일스톤 ID를 적는다. (`/plan-milestone`은 여기에 더해 R1에서 `(미할당)` 항목을 전수 triage한다 — 위 R1 라운드 본문 참조.)

## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 ADR/architecture 섹션은 task 본문에서 발화 시 인용 — 사전 fork-load 금지.
정책 근거: milestone·feature 분해 skill 신설은 [ADR-075](../../../docs/90-decisions/boilerplate/ADR-075-main-session-orchestration-v2.md) D4.
