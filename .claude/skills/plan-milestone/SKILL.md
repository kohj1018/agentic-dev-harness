---
name: plan-milestone
description: Run a multi-round main-session conversation to author milestone(s) (M1 included — ADR-057) and their feature docs. Additive — never overwrites existing milestones; hand off to /plan-workitem for tasks.
argument-hint: "[milestone idea | M<N>]"
disable-model-invocation: true
allowed-tools: Read Glob Grep Write Edit Agent Bash(rm docs/20-system/prototypes/*/_drafts/*.html) Bash(pnpm validate:design*) Bash(npm run validate:design*) Bash(yarn validate:design*) Bash(bun run validate:design*) Bash(make validate-design*) Bash(task validate:design*) Bash(npx playwright*)
---

이 skill은 메인 세션이 R0~R4(+UI 마일스톤은 R5 프로토타입 라운드)를 직접 운전해 마일스톤(M1 포함)과 그 feature 문서를 작성하는 절차서다.
**첫 마일스톤(M1) 포함 모든 마일스톤**을 다룬다(ADR-057 결정 1 — bootstrap-project는 charter/ARCH까지, 마일스톤 생성은 본 skill 단일 경로). **입력 분기 (상태기계 — ADR-057#amend-3 결정 5)**: (a) **기존 `draft` M<N>** → 그 M의 최초 미완 라운드부터 **재개**(완료 라운드는 멱등 skip). (b) **`ready`(이상) M<N>** → 이미 계획 확정·잠금이므로 **변경 거부** + "그 변경은 다음 마일스톤(M<N+1>)" 안내. (c) **존재하지 않는 M ID** → 오류 종료. (d) **새 아이디어**(자유 텍스트) → 다음 번호 M 생성.
**additive 모드**(기존 마일스톤을 재생성·덮어쓰기 하지 않는다). **기존 마일스톤에 *새 feature만* 추가하는 경우는 `draft` M<N> 재개 대화 안에서만** 처리한다(별도 `feature idea` 진입 제거 — draft 마일스톤이 여럿이면 대상이 모호): 예: 진행 중인 draft M1에 F-00X를 추가할 때 M1 문서는 재생성하지 않고 feature 문서만 새로 작성한 뒤 M1 `## 3. 포함되는 기능`에 링크 한 줄을 추가한다. **`ready` 이상 M엔 feature 추가를 금지**한다(결정 5e) — 그 feature는 새 마일스톤(M<N+1>) 범위다. task 분해는 마일스톤 전체 계획 스냅샷에서 수행한다(역할 경계 유지).
무거운 추론(R2의 마일스톤 분할 판단)은 `Agent` 도구로 architect를 단발 sub-call로 위임한다.
각 라운드(R0~R5) 산출물은 메인 컨텍스트에 누적시키지 않고 milestone/feature 문서에 적재한다.

**패턴 차용** — `discover-product`/`bootstrap-design`와 동일하게 `context: fork`를 명시하지 않아 메인 세션이 라운드를 직접 운전한다. 종료 후 사용자가 `/clear` 또는 새 세션으로 컨텍스트를 정리할 것을 권장한다(라운드 인터랙션이 다음 task 컨텍스트에 잡음).

**Codex**: 서브에이전트는 GA이나 본 저장소가 Claude persona 위임을 Codex subagent로 아직 매핑하지 않아 순차 단일 실행으로 degrade — R2의 architect·R5-2의 designer 단발 sub-call은 이 매핑 부재로 메인 세션이 직접 추론한다(품질 보장을 위해 충분히 깊게 사고).

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
- UI R5를 수행할 때 `docs/00-meta/STACK_SETUP_PLAN.md ## Design Gate Adapter` current version·source digest·fixed conformance registry

라운드 구성:

**R0 — 직전 마일스톤 회수 (additive 입력)**
- 직전 마일스톤 문서가 있으면 다음만 회수한다(ADR-019 minimal — 전체 fork-load 금지):
  - `## 8. 회고` (graduation 판정·목표 달성도·scope creep·핵심 학습) — `/stabilize-milestone`이 채운 내용.
  - `## 5. 완료 기준` 졸업 상태(graduation 미충족 항목이 남아 있으면 carry-over 후보).
  - 직전 마일스톤에서 *stabilize 이월*된 미완 항목(졸업 안 된 task / open finding).
- **로드맵 재조정 (ADR-057#amend-1)**: `docs/30-workitems/ROADMAP.md`를 읽어 직전 마일스톤 `## 8. 회고`의 `graduation:` 판정 + task done/total로 Done/Now 구간을 최신화한다(graduation=YES면 Now→Done 스냅샷, 진행 중이면 진척 갱신). **미졸업 Now 가드**: 현재 Now 마일스톤의 graduation이 YES가 아니면(진행 중·NO·BLOCKED) *명시적 병렬 승인이 없는 한* 새 마일스톤을 Now로 추가하지 않는다 — "현재 Now(M<N>) 미졸업 — 완료 후 진행 권장"을 안내하고 새 Now 생성을 보류(단일 Now 규율). Next 후보를 Now로 승격·중복 생성 방지를 위해 각 Next/Later 행은 안정적 candidate key(목표 슬러그)를 갖는다. 로드맵은 plan-milestone만 쓴다.
- `docs/40-validation/IMPROVEMENT_GUIDE.md`·`docs/40-validation/QA_FINDINGS.md`의 *open* 항목(특히 P0/P1)을 회수해, 다음 마일스톤이 회수할 부채 후보로 surface(자동 편입 X — 사용자 결정). `[ADR-candidate]` 라벨 항목은 별도로 surface하고, 사용자가 채택하면 **R3 진입 전에 architect 단발 sub-call(입력: 후보 결정 줄·linked workitem·`_ADR_GUIDE` 권장 섹션·project 인덱스의 다음 빈 번호 — ADR-000#amend-2 결정 4 필독 + 번호 충돌 방지)로 `docs/90-decisions/project/ADR-1NN-<slug>.md` 초안(proposed) 작성 + project 인덱스 등재 + 해당 후보 항목 status를 open → resolved(adopted: ADR-1NN)로 갱신**까지 수행한다(ADR-000#amend-2 — 미갱신 시 다음 R0가 이미 채택된 후보를 재surface해 중복 ADR 위험). 기각 시에도 IMPROVEMENT_GUIDE 후보 status를 open → rejected로 갱신한다.
- 직전 마일스톤 부재(첫 호출 — 마일스톤 0개, M1 생성 회차)면 R0를 건너뛰고 회고 carry-over는 "없음"으로 표시.

**R1 — 입력 intake (다음 마일스톤의 재료)**
- 다음 입력을 모아 사용자와 정렬한다:
  - 개발자 아이디어(`$ARGUMENTS`).
  - `docs/10-charter/DISCOVERY.md` `## 14. Evidence Log`(새 증거) + `## 15. Insight Backlog`(미반영 insight) + CHARTER(범위/비목표).
  - 사용자 인터뷰·최근 큰 버그 발견·리팩토링 부채(R0의 IMPROVEMENT_GUIDE/QA_FINDINGS 회수분).
- 위 재료를 *다음 마일스톤이 다룰 목표 후보*로 묶어 1~N개 제시. 사용자가 우선순위를 정한다.

**R2 — architect 단발 sub-call: 분할 vs 단일 협상**
- R1의 목표 후보를 *여러 마일스톤으로 쪼갤지, 한 마일스톤으로 묶을지* `Agent`(architect) 단발 sub-call로 판단(스코프 크기·의존·졸업 가능성 기준). (Codex: 서브에이전트는 GA이나 본 저장소가 Claude persona 위임을 Codex subagent로 아직 매핑하지 않아 메인 세션이 직접 판단.)
- architect 결론(분할 권고·각 마일스톤 한 줄 목표·feature 후보 목록)을 받아 사용자와 협상한다. 사용자가 분할 구조를 확정할 때까지 반복.
- architect 지시에 포함: "feature 경계를 가로지르는 상태 전이·2차-write·멱등 seam 후보가 보이면 각 feature 후보의 시나리오 메모와 ARCH §4-1(상태 모델) 기록 권장을 결론에 포함하라" (ADR-057 결정 13 — 라운드 신설 X).
- **고-stakes 설계 게이트 (ADR-053)**: R2 분할에 외부 기술 불확실성이 있으면 ADR-053 리서치-only 게이트(researcher 위임). 분할 자체는 다각도 패널 불요. **라운드 중 비-스택 프로세스·제품 범위·보안·boilerplate supersede·cross-milestone 재검토 결정(ADR-000#amend-2 결정 3의 5개 기준 — 전부)이 확정되면 그 시점에 architect 단발 sub-call로 project ADR 초안(proposed) 작성 + 인덱스 등재까지 수행한다(작성 주체·시점 SSOT = ADR-000#amend-2 트리거 표·ADR-053#amend-1 — 분할의 research-only와 별개; R0의 [ADR-candidate] 회수 authoring과 동일 경로).**

**R3 — 마일스톤 문서 authoring (MILESTONE_TEMPLATE에서)**
- **지금 착수하는 마일스톤만 실체화 (rolling-wave — ADR-057#amend-1)**: R2에서 확정한 분할 중 *이번에 착수하는* 마일스톤(기본 1개 = Now)만 `docs/30-workitems/_templates/MILESTONE_TEMPLATE.md`를 복사해 `docs/30-workitems/milestones/M<N>-<이름>.md`로 작성한다. `<N>`은 기존 마일스톤 다음 번호(첫 호출이면 M1 — additive, 기존 보존). **R2 분할이 식별한 *후속* 마일스톤은 지금 Mx 문서를 만들지 않는다 — 그 마일스톤의 feature 문서·R5 프로토타입도 만들지 않는다** (로드맵 Next/Later에 얇은 행(미번호 `(M?)`)으로만; R4 컴포넌트·R5 프로토타입은 지금 착수하는 Now 마일스톤의 화면에만 적용). 후속 마일스톤의 feature·프로토타입은 그 마일스톤이 *Now가 되는 회차*에 생성한다. (이래야 "미번호 얇은 후보 vs 실체 문서"가 어긋나지 않는다 — rolling-wave 핵심.)
- **로드맵 갱신 (ADR-057#amend-1)**: `docs/30-workitems/ROADMAP.md`(baseline shell 존재 — 없으면 헤더 포함 생성)에 이번 마일스톤 행을 **Now**로 쓴다(id·**`candidate-key`**(안정 목표 슬러그 — Later/Next에서 승격됐으면 그 key 그대로 유지, 신규면 새로 발급)·목표·진척·주요 기능 링크·의존). **진척 칸은 `tasks: unplanned`로 둔다** — R3 시점엔 plan-workitem 미실행이라 총 task 수 N을 모른다. plan-workitem이 task를 만든 뒤 다음 plan-milestone R0 재조정이 이 칸을 실제 `done/total`로 갱신한다(`0/N`처럼 미확정 N을 지금 박지 말 것). **직전 Now 행의 Done 전환은 R3가 강제하지 않는다** — 그 마일스톤 회고 `graduation:`이 YES일 때만 Done이며, 판정 반영은 R0 재조정이 담당한다(graduation 확인 없이 Done 박기 금지). R2 분할의 후속 마일스톤은 Next/Later에 얇게만(목표 1줄 + 확신도, `(M?)` 잠정 — 기능·AC·졸업 칸 만들지 말 것). Now 기본 1개(병렬은 명시 결정 시만). 로드맵은 plan-milestone만 쓴다.
- `## 5. 완료 기준`은 graduation checklist 5+1 default 그대로 복사(ADR-014). 사용자가 협상한 추가 기준만 "(선택)" 행에 채운다 — 정책 중복 금지(MILESTONE_TEMPLATE·ADR-014가 SSOT).
- `## 8. 회고`는 비워둔다 — `/stabilize-milestone`이 자동 채움(ADR-014).
- `## 6. 관련 문서`에 Charter / Architecture / 관련 ADR 링크를 채운다.

**R4 — feature 문서 authoring (FEATURE_TEMPLATE에서)**
- **지금 착수하는 Now 마일스톤(R3에서 실체화한 그 마일스톤)의 feature 후보만** `docs/30-workitems/_templates/FEATURE_TEMPLATE.md`를 복사해 `docs/30-workitems/features/F-<NNN>-<이름>.md`로 작성한다(기존 feature 다음 번호, 첫 호출이면 F-001 — additive). **R2 분할이 식별한 후속 마일스톤의 feature는 지금 만들지 않는다** — 그 마일스톤이 *Now가 되는 회차*에 생성한다(R3 불릿과 정합, rolling-wave 핵심). 나머지 불릿(`## 0-1 Type`·`## 3 시나리오`·`## 7 FAC`·`## 7-1 빈 shell` 등)은 그 Now 마일스톤 feature에 대해 기존대로.
- `## 0-1. Type`을 채운다(ADR-039). `feature`면 `## 2`를 User Story로, 비-feature(technical-enabler/bugfix/refactor/migration/research-spike)면 기술적 근거 + 서비스하는 DISCOVERY ID·ADR 링크로 채운다(정책은 FEATURE_TEMPLATE 주석·ADR-039가 SSOT).
- `## 3. 핵심 시나리오`(feature가 만족시킬 사용자 시나리오)와 `## 10. 의존성`(feature 간 선후·병렬)을 채운다 — FAC가 추적할 시나리오 + feature 의존 검토의 전제. 이 두 섹션 *신설*은 `/plan-milestone` 책임이다(plan-workitem 아님).
- `## 7. Feature-level Acceptance Criteria`(FAC)를 시나리오 수준 측정 기준으로 채운다.
- `## 7-1. FAC ↔ AC 매핑표`는 **빈 shell만** 둔다(`- FAC-1 →` 등 우변 미채움) — task 분해 시 `/plan-workitem`이 채운다(영속 SSOT, ADR-036/ADR-037). 이 skill은 task를 만들지 않으므로 매핑을 채우지 않는다.
- `## 11. 관련 문서`의 Milestone 링크를 R3 마일스톤으로 채운다. 비해당 스택의 Architecture-Iface/Design 줄은 삭제(placeholder 잔존 금지).

**R5 — 프로토타입 라운드 (경험 계약, UI 마일스톤 한정 — ADR-056)**

UI 판정은 ADR-027#amend-3 다중신호 절차. 비-UI 마일스톤은 본 라운드 skip + "R5 skip: 비-UI" echo. **DESIGN.md `## 10` 부재(§10 신설 전 기존 fork)면 R5-4 전에 §10을 기본값으로 신설 + 채택/변경 확인 1회**(ADR-056 결정 8의 다운스트림 마이그레이션). feature 수가 많으면(3+) R4 종료 시 `/clear` 후 같은 `/plan-milestone M<N>`을 재실행해 R5부터 이어간다(R0~R4는 텍스트 협상, R5는 HTML 왕복이라 성격이 다름 — 입력 분기 (a) 미완 라운드 재개).

- **R5-1 화면 목록 확정 + 화면 전환 표(다화면·복구 흐름)**: R4 feature 문서들의 `## 3 핵심 시나리오`에서 프로토타입 대상 화면을 도출(기본 feature당 대표 1화면 — 다화면 feature는 사용자 협의, 총 6~8화면 초과 시 우선순위 협상). 프로토타입이 무의미한 feature(순수 백엔드·내부 설정 등)는 이 시점에 해당 feature 문서 `## 7`에 `프로토타입 면제: <사유>` 한 줄을 기록한다(ADR-056 — plan-workitem 입구 계약의 통과 조건). **화면이 2개 이상이거나(다화면), 단일 화면이라도 비가역/파괴 동작(삭제·결제·전송)·분기·다단계 오류→복구·modal이 있으면 마일스톤 문서 `## 9. 화면 전환`에 전환 표를 채운다**(ADR-056#amend-3 — 트리거는 화면 수가 아니라 비가역·분기·복구 상태 존재): `path type(primary/failure/recovery) | 현재 화면/상태 | 사용자 행동 | 다음 화면/상태 | owner feature | prototype`(각 행 = 한 path type). 순수 정적 단일 화면·비-UI는 "(해당 없음)".
- **R5-2 브로드 시안**: 화면(군)마다 designer 단발 sub-call로 *구성 방향이 다른* 시안 2~3안을 생성(REFINE/EXPLORE 카드 차용 — ADR-058; 단 축은 색이 아니라 **레이아웃·정보 위계·인터랙션 모델**: 예 A=테이블 고밀도 / B=카드 / C=분할 뷰). 모든 시안은 DESIGN.md `:root` 토큰만 참조(raw hex 금지 — 시각 아이덴티티는 R2에서 이미 확정, 여기선 구성만 탐색). 저장: `docs/20-system/prototypes/M<N>/_drafts/<screen>-{A,B,C}.html` (gitignore — 탐색용). GENERATED 헤더 주석 필수.
- **R5-3 선택·수정 루프**: "브라우저에서 `_drafts/`를 열어 비교, 선호 방향(하이브리드 허용)을 알려주세요 — *원하시면 추천을 요청하실 수도 있어요*" 안내 → 피드백은 재생성으로 반영(직접 편집 X). 취향 오라클=사용자(먼저 추천·순위 제시 금지 — 사용자가 물으면 예외). 2사이클 미수렴 시 시안 반복 대신 brief(화면 정의·feature 시나리오)를 고친다.
- **R5-4 경험 계약 완성 (의무 체크리스트 — 하나라도 빠지면 미완성)**:
  1. 해피 패스 (정상 데이터 화면)
  2. **못생긴 상태 5종** — 같은 파일 내 섹션으로 나란히: 긴 제목 / 빈 목록 / 로딩 / 에러 / 항목 과다
  3. 실카피 — DESIGN.md `## 10` Voice & Writing 준수, placeholder 금지 (ADR-056 결정 9)
  4. 인터랙션 캡션 — "이 버튼을 누르면 <무엇이 일어난다>"를 각 인터랙션 요소에 명시(정적 HTML의 '눌렀을 때' 계약)
  5. `:root` 토큰만 참조 — 자기완결을 위해 DESIGN.md 토큰의 `:root` 정의 블록은 파일 내 포함하고, 정의 밖 스타일 규칙의 **토큰 대상 값**(색·타이포·spacing·radius·shadow)은 `var(--…)`만 사용 — 레이아웃 등 비토큰 속성은 무관 (DESIGN.md 파생임이 구조로 드러나게)
  *확정하지 않는 것*(명시): 상태관리·fetch·컴포넌트 분리 등 엔지니어링 내부 — ARCH §7-4/§7-5 영역.
- **R5-5 승인·저장** (게이트-우선 순서 — **검사한 bytes = 저장한 bytes**): 사용자 승인 후 아래 순서로 처리한다. **게이트·승격을 feature 문서 기입보다 *먼저*** 한다(게이트 실패 시 최종 `<screen>.html`가 안 생기므로, 참조 줄·PX를 먼저 쓰면 없는 파일을 가리키는 dangling 참조가 남는다).
  1. **draft raw-hex 정합 (게이트 前)**: 승인 예정 draft(`_drafts/`)에 raw hex 정규식 1회 grep — **제외는 `--<name>: #hex` custom-property *정의 라인*만**(`:root` 안이라도 *정의 밖 사용처* hex는 검사 — ADR-056#amend-2; 파일 전체·`:root` 블록 전체 제외 금지). 발견 시 토큰으로 수정 → **수정했으면 그 수정본으로 사용자 재승인**(승인·게이트·저장 bytes 동일). PX 마커는 `PX-M<N>-<screen>-NN`(번호 `01`부터 — 화면 revision 없음, 마일스톤 번호가 버전). §4로 승격한(=PX 아님) 결정은 마커를 달지 않는다(있으면 제거). 이 draft 확정 후 재승인 → gate → 무수정 승격(2·3단계 정합).
  2. **게이트**: **UI 프로토타입이면 항상** `STACK_SETUP_PLAN.md ## Design Gate Adapter`의 `status: ready` + capability `ADR-058#amend-2/v2` + 기록된 `source digest`(direct-support Node UI는 canonical) + fixed conformance PASS를 확인한다. missing/n/a/needs-install/wiring-fail/lower-version/digest·conformance 누락이면 command를 실행하지 않고 final `<screen>.html` 생성·feature 참조 기입·승격을 전부 보류하며 정확히 `Needs Design Gate: /stack-guard` + 현재 status/version을 출력한다(MCP·육안·visual-qa로 대체 금지). current-ready에서만 command template의 `<html...>`에 승인된 draft 경로를 대입해 그대로 검사한다(경로 추측 금지). source-verified current-v2 adapter의 **결정적 차단**은 serious/critical axe·320/375 geometry(page overflow·viewport escape·clipped text)다. **픽셀 취향(위계·밀도·slop·overlap)은 R5-3 사용자 선택·수정 루프가 오라클 — R5엔 별도 reviewer[design] agent 호출이 없다**(취향 오라클=사용자; concept 단계 R2-G와 달리 프로토타입은 사용자가 직접 고른다). 러너 차단이면 designer 재생성 → **1로 되돌아가** 재검사(retry ≤2, repair 후 재승인 포함). retry 소진해도 차단이면 **승격 안 함**·그 화면 미완으로 남긴다(dangling 방지). **exit 2(Needs Install)면 사유 echo 후 승인 보류 — 설치·재실행 전까지 승격 금지**(R2-G/R6와 동일; silent skip·미검증 승격 불가 — ADR-058 constraint "여전히 fail이면 승인 불가"). 승인 프로토타입도 concept과 같은 1회성 게이트 대상.
  3. **승격 (무수정)**: 게이트 통과 후 **통과한 그 bytes를 수정 없이** **화면 단위**로 `docs/20-system/prototypes/M<N>/<screen>.html`로 승격 저장한다(**커밋 대상** — Record; 같은 draft M의 R5 피드백 반복 중 승인 후보가 바뀌면 같은 파일을 대체하되, M `ready` 뒤 재승인은 없음. 화면-키인 이유: 한 화면은 여러 feature 표면의 합성 — ADR-056 결정 1). 승격 시점엔 내용을 더 이상 바꾸지 않는다(raw-hex 정합·재검토는 1에서 이미 끝).
  4. **feature 문서 기입**: 각 구현 feature `## 7`에 `프로토타입: [화면 파일](상대경로) (진입: <라우트/상태 진입 메모>)` 참조 줄(§3-V가 이 메모로 화면을 찾음) + **`경험 결정(PX):` 인벤토리**를 기입한다 — 승인 HTML의 `<!-- PX-M<N>-<screen>-NN: ... -->` 마커를 **그대로 복사**(재추출·재해석 금지 — drift 차단)해 `- PX-M<N>-<screen>-NN: <한 줄>`로. 화면이 여러 feature에 걸치면 **각 PX를 그것을 구현하는 feature의 `## 7`에 분산 기록**(화면 통째로 대표 feature에 몰지 않음 — INST-1 사각 방지); 화면-공통은 shell/layout feature 또는 DESIGN.md §4, cross-feature 정합은 `## 7-2` INV/seam. **완전성 확인 (화면별)**: 기입 후 **그 화면**의 HTML 마커 = 관련 feature 인벤토리 중 **`^PX-M<N>-<현재 screen>-\d{2,}$`로 정확 매칭한 부분집합**과 일치하는지 본다(다중 화면 feature는 여러 화면 PX가 섞이므로 screen 정확 필터 — prefix-only면 `user`가 `user-settings`를 오매칭; 마커 있는데 미기입=orphan 방지). *복사 시점 1차 확인일 뿐* — 이후 문서 drift는 **`M<N>` 입력 validate-plan이 프로토타입 HTML을 독립 회수해 재검증**(plan-workitem도 HTML을 읽음).
  5. **정리**: `_drafts/` 내 시안 파일을 삭제한다(빈 디렉터리 잔존 무해). 승인(=전 화면 게이트 통과·승격) 전에는 종료 출력으로 진행하지 않는다.

**Evidence/Insight 연결 (ADR-035#amend-2)**: `Type: feature`이고 DISCOVERY `## 15. Insight Backlog`의 insight를 구현하는 feature면 `## 1. 요약`에 `근거 insight: I-N` 한 줄을 박고, 해당 Insight Backlog 행의 `status=planned` + `linked feature` 갱신을 *출력에 권장*한다(이 skill은 DISCOVERY를 직접 수정하지 않음 — `/discover-product --update`가 회수). 근거 insight 없는 즉흥 feature는 출력 "남은 미결정 사항"에 `- 근거 insight 부재: F-NNN — DISCOVERY 회수 권장` 명시. 비-feature 타입은 가정/기회·ADR 링크로 정당화되므로 insight 부재 경고를 내지 않는다.

**Exit — 확정 재대조 → `ready` 잠금 (신규 exit 단계, ADR-057#amend-3 결정 5)**: plan-milestone 종료 전에 **모든 마일스톤**에서 마일스톤 `## 3` 포함기능 ↔ feature `## 3` 시나리오 ↔ **feature `## 7` FAC**가 서로 정합한지 재대조한다(FAC 본문은 `## 7` — `## 7-1`은 plan-workitem이 *나중에* 채우는 FAC↔AC 매핑이라 이 시점엔 빈 shell, 재대조 대상 아님). **UI 마일스톤은 추가로** 승인 프로토타입 ↔ `## 3` 시나리오 ↔ PX 인벤토리 ↔ 마일스톤 `## 9` 전환표 정합까지 본다(비-UI는 *이 추가분만* skip — M↔feature↔FAC 재대조는 공통). 불일치면 해당 라운드로 되돌아가 정합 후 종료. **재대조 통과 + milestone `## 7 열린 질문`·feature `## 12 열린 질문`의 미해결 열린 질문 0건일 때만** — **먼저 산하 feature를 `## 0. Status: ready`로, 마지막에 M을 `ready`로** 전환한다(승격 중 중단 대비 — M `ready`면 전부 `ready` 보장). 미해결 열린 질문이 남으면 `ready` 전환 보류.
**계획 잠금**: feature 추가는 **`draft` 마일스톤에만**(`ready` 이상은 확정·잠금 → 그 변경은 다음 M<N+1>). `validate-plan`→`repair-plan`의 **task·매핑·의존성 수정**은 산하 모든 task 상태가 `draft|ready`일 때까지만(= 구현 시작 전) 허용한다. `in-progress`·`blocked`·`done`·`deprecated` 중 하나라도 있으면 잠금이다. M/F scope·FAC·프로토타입·PX는 plan-milestone `ready`에서 이미 잠기며 repair-plan 대상이 아니다. 구현이 시작되면 task 계획도 변경하지 않는다(이후 근본 충돌은 사용자 중단·보고 — ADR-057#amend-3 결정 4·5).
**단계별 출구**: 중단된 산출물은 같은 draft `/plan-milestone M<N>` 재개의 입력일 뿐이며, 확정 재대조를 통과해 M·전 feature가 `ready`가 된 뒤에만 `/plan-workitem M<N>`을 안내한다(부분 계획 진입 금지).

**다국어**: 입력 언어를 따른다. 한국어 입력이면 산출물도 한국어, 영문 입력이면 영문.

종료 후:
- 사용자가 `/clear` 권장 — R0~R5 인터랙션이 다음 task 컨텍스트에 잡음.

마지막 출력 ([WORKFLOW.md "스킬 종료 시 다음 단계 출력 contract"](../../../docs/00-meta/WORKFLOW.md) 양식 정합):
- 생성·갱신한 문서 목록(상대 경로 — 마일스톤·feature) — (UI 마일스톤) 승인 프로토타입 경로 목록 + 면제 feature 목록
- **로드맵 갱신됨: `docs/30-workitems/ROADMAP.md` (Done/Now/Next/Later 반영 — ADR-057#amend-1)**
- 마일스톤 ↔ feature 구조 한 줄 요약
- 핵심 가정
- 남은 미결정 사항 (근거 insight 부재 / 부채 회수 후보 포함)
- 다음 단계:
  ```
  다음 단계:
  - 기본 권장: `/plan-workitem M<N>` — 본 마일스톤 전 feature task·`## 3`·AC·FAC·seam·PX↔AC를 1회 완성(전체 스냅샷 — ADR-057#amend-3; draft/refresh 없음).
  - 분기 옵션 (해당 시 — ≤3 개):
    - 마일스톤 plan 교차검토 원하면: 다른 세션·다른 LLM에서 `/validate-plan <M>`(milestone-plan mode) 후 원본에서 `/repair-plan <M>` — **단 M/F scope·FAC·프로토타입·PX 층 finding은 `ready` 잠금 대상이라 repair-plan이 고치지 않고 사용자에게 사실·영향을 보고한다(기본 경로 = 다음 M<N+1>)**. repair-plan이 첫 구현 전 고칠 수 있는 건 task·매핑·의존성뿐(ADR-057#amend-3 결정 5d)
    - UI feature 포함 + DESIGN.md 미반영 시: `/bootstrap-design --update` 먼저
    - 기획 신뢰도 재확인 원하면: 다른 세션에서 `/validate-discovery --reviewer-tag <tag>` 후 원본에서 `/repair-discovery`
  - 프롬프트 동봉 권장 (다음 skill 호출 시 함께 전달):
    - charter `## 5. 비목표` 핵심 키워드 (다음 plan 라운드의 scope 가드)
    - R0의 부채 회수 후보 (IMPROVEMENT_GUIDE/QA_FINDINGS open 항목 중 이번 마일스톤 편입분)
    - 남은 미결정 사항 본문
  ```

## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 ADR/architecture 섹션은 task 본문에서 발화 시 인용 — 사전 fork-load 금지.
정책 근거: milestone·feature 분해 skill 신설은 [ADR-051](../../../docs/90-decisions/boilerplate/ADR-051-main-session-orchestration-and-wave-removal.md) D4.
