# ADR-060 — 기획 결정 마감 + 마일스톤 봉인 (Decision Closure & Milestone Seal)

> scope: boilerplate
> area: process

## Status
accepted

## 현재 유효 결정
- 사용자가 정하거나 승인해야 할 기획 결정은 `docs/10-charter/DECISION_REGISTER.md`에 등재하고, 결정 *본문*은 각 정본 문서가 SSOT다. 문서의 "열린 질문" 섹션 5곳은 폐지한다.
- 각 결정은 열릴 때 `authority`(user-choice / user-approval / agent-delegated)를 부여받는다. 하향 변경은 사용자 승인 + 이력 줄이 필요하다. `agent-delegated`는 개별 등재 대상이 아니라 라운드 일괄 확인 대상이다.
- `user-*` 결정은 **Decision Brief**(배경·용어·선택지·트레이드오프·추천·답변 방법)로 제시한다. 라운드당 3~5개 상한.
- M/F 상태는 `draft → contract-ready → ready`. `contract-ready`는 task 분해 진입 자격이고, `ready`는 `/seal-milestone`만 부여한다.
- 봉인 조건: 현재 M 영향 `open` 0건 + task 완결(AC 해석 확정·TDD 형식 포함) + 재대조 통과 + 사용자 최종 승인. 승격 순서는 task → feature → milestone이며 중단 후 재실행이 나머지를 승격한다.
- 봉인 후 새로 드러난 결정은 원장에 기록하되 **착수를 막지 않고** 기존 finding 라우팅(repair / 사용자 보고 / 다음 M)을 탄다.

## 배경
- [관측됨] `DISCOVERY ## 11` / `PROJECT_CHARTER ## 10` / `ARCHITECTURE_OVERVIEW ## 10`의 "열린 질문" 섹션을 읽는 skill이 0곳이다. 기록은 되지만 아무도 회수하지 않는 dead governance field이며, ADR-056#amend-3이 FEATURE `## 8-1`에 대해 진단한 것과 동형이다.
- [관측됨] `WORKFLOW.md` 기본 원칙이 "애매한 사항은 문서에 가정과 열린 질문으로 남긴다"로, 상위 정책이 *보존*을 기본값으로 둔다. 개발 전 폐쇄를 요구하는 문장이 저장소 어디에도 없다.
- [관측됨] 게이트 분포가 되돌리기 비용과 반대다. task/AC 층에는 3중 차단이 있고, 상류(제품 범위·스택·§7-x 인터페이스·시각 방향)에는 결정 폐쇄 게이트가 없다.
- [관측됨] `bootstrap-stack`이 `ARCH ## 7-1`~`## 7-5` 채움을 "architect 단발 sub-call(라운드 아님)"으로 규정한다. `## 7-3`(DB migration·인증·API versioning)과 `## 7-5`(대상 플랫폼·권한 흐름·서명)는 ADR-053 S1/S4에 정면 해당하는 되돌리기 비싼 결정인데 사용자 확정 없이 자동 확정된다.
- [관측됨] ADR-053 결정 2의 종착지가 "④ ARCHITECTURE §7 결정 블록 기록"이라, 리서치·다각도·적대 검토를 거쳐도 *사용자 선택* 단계가 없다.
- [관측됨] M/F가 task 분해 전에 `ready`로 잠긴다(ADR-057#amend-3 결정 5). 그래서 첫 구현 전에 상위 계약 결함을 찾아도 `repair-plan`이 고치지 못하고 기본 경로가 "다음 마일스톤"이다.

## 결정

### D1. 결정 원장 (Decision Register)
`docs/10-charter/DECISION_REGISTER.md`를 신설한다(presence: baseline, lifecycle: Living). 결정 *본문*은 정본 문서에 두고 원장은 **위치·처분 상태만** 가리킨다(ADR-005 정합).
다음 5개 "열린 질문" 섹션을 **폐지**하고 원장으로 통합한다 — `DISCOVERY ## 11`, `PROJECT_CHARTER ## 10`, `ARCHITECTURE_OVERVIEW ## 10`, `MILESTONE_TEMPLATE ## 7`, `FEATURE_TEMPLATE ## 12`.
섹션 번호는 **재사용하지 않는다**(결번 — ADR-002/003 legacy reserved 선례). 후속 섹션 번호를 당기면 기존 인용이 전부 깨진다.

**등재 범위 (원장을 얇게 유지)**: 등재 대상은 `authority: user-*` 결정 전부 + 종류 불문 `open`/`deferred`로 남는 항목이다. **`agent-delegated`는 개별 등재하지 않고** 라운드 종료 일괄 확인 1회로만 처리한다(그 자리에서 사용자가 뒤집으면 `user-approval`로 등재). **코드 품질·형식 지적(raw hex·컴포넌트 중복·voice 위반)과 계획 결함(unmapped FAC/PX·의존성·AC 해석 후보)은 원장 대상이 아니다** — 기존 skill 출력의 `남은 미결정 사항` 슬롯과 각 소유 문서가 그대로 소유한다. 원장은 결함 추적기가 아니라 기획 결정 인덱스다.

**`(미할당)` 항목**: 마일스톤이 생기기 전(bootstrap 구간)에 등재되는 항목은 `영향: (미할당)`으로 둔다. `/plan-milestone` R1이 이를 전수 triage해 `영향: M<N>` 배정 또는 앵커 붙인 `deferred`로 정리하며, `/seal-milestone` 조건 6과 `/plan-milestone` Exit는 **`M<N>` 항목과 `(미할당)` 항목을 함께 회수**한다. 그러지 않으면 상류에서 정직하게 등재한 미결정이 봉인 검사에서 통째로 샌다.

### D2. 결정권 축 (authority) — 결정 *전* 제약
각 결정은 원장에 등재될 때 `authority`를 받는다. **분류축은 "정책이냐 구현 방식이냐"다** — 같은 주제(예: 보안)라도 *무엇을 지킬지·어디까지 감수할지*는 `user-choice`, *그것을 어떤 방식으로 구현할지*는 `user-approval`이다:
- `user-choice` — 제품 의도·범위·우선순위·사용자 체감·외부 계약·비용·**보안/프라이버시 정책과 위험 허용도**·비가역 약속. (예: "개인정보를 수집할 것인가", "결제 실패를 어디까지 감수할 것인가")
- `user-approval` — AI가 안을 내고 사용자가 승인. 스택·**인증 방식**·**데이터 경계 구현**·되돌리기 비싼 구조. (예: "세션 vs JWT", "테넌트 분리를 스키마로 할 것인가 컬럼으로 할 것인가")
- `agent-delegated` — 승인된 경계 안의 **가역적** 내부 구현 선택.

한 결정이 두 층을 함께 건드리면 **분해한다** — 정책 질문을 `user-choice`로 먼저 닫고, 그 답을 전제로 구현 방식을 `user-approval`로 낸다. 분해가 어려우면 더 높은 쪽(`user-choice`)으로 올린다.

**`authority`는 결정 결과에서 파생하지 않는다** — 결정이 열릴 때 확정하는 *입력 제약*이다. 파생시키면 에이전트가 핵심 결정을 먼저 `agent-delegated`로 분류한 뒤 스스로 닫을 수 있다. `user-*` → `agent-delegated` 하향은 사용자 명시 승인 없이 불가하며, 변경 시 항목에 이력 줄을 남긴다.

본 축은 ADR-056 결정 4의 비대칭("내부 엔지니어링 선택은 자율, 사용자가 보고 느낄 것을 좁히면 무조건 질문")을 상류로 **일반화**한 것이다. 새 taxonomy 발명이 아니다.

**ADR-053 S1~S4는 결정권 축이 아니다** — *분석 깊이*(리서치·다각도·적대 검토 발동 여부) 판정에만 쓴다. S2("합리적 대안 2개 이상")는 가역적 내부 선택에도 성립하므로 결정권 트리거로 쓰면 과발동한다.

### D3. Decision Brief (사용자 결정 지원 포맷)
`authority: user-choice | user-approval` 결정은 다음 6블록으로 제시한다. `agent-delegated`는 대상이 아니다.

```
결정 D-NNN — <질문 한 줄>

1. 배경 — 왜 지금 정해야 하나 (지금 안 정하면 무엇이 막히나)
2. 용어 — <이 결정에 필요한 개념을 아무 배경 없이도 이해하도록 1~2줄씩>
3. 선택지 A / B (/ C) — 각각:
   · 한 줄 요약
   · 이 프로젝트에서 실제로 어떻게 보이나 (사용자 체감)
   · 장점 / 감수할 것
4. 나중에 바꾸려면 — 되돌리기 비용(높음/중간/낮음) + 무엇을 다시 해야 하나
5. 추천 — <안> (이유 2줄, charter `## 5 비목표` / `## 7 제약` 근거)
6. 답변 — "A" / "B" / "추천대로" / "더 설명" / "나중에(→ 이관처 제안)"
```

**운영 규칙**:
- 라운드당 **3~5개 상한**. 초과분은 다음 라운드로.
- 필수 결정에 `skip`을 허용하지 않는다. 사용자는 선택 / 추가 설명 / 리서치 요청 / 연기 요청 중 하나를 고른다.
- 사용자 답변을 **평이한 문장으로 재진술해 확인**한 뒤 정본에 기록한다.
- 라운드 종료 시 **일괄 확인 1회**: 그 라운드의 `agent-delegated` 결정 목록을 한 번에 제시하고 "바꿀 것 있으면 알려달라"고 확인받는다.
- **5번 "추천" 블록의 예외**: 취향이 오라클인 결정(ADR-058 D5 — 시각 방향 선택 등 `/bootstrap-design` R2)에서는 **추천 블록을 비워 둔다.** 대신 "원하시면 추천을 요청하실 수 있어요" 안내를 넣고, 사용자가 요청할 때만 채운다. 그 외 결정에서는 추천이 필수다.

본 포맷은 ADR-046 압축 계약의 **명시적 예외**다(ADR-046#amend-1).

### D4. 유예(deferred) 앵커 규약
`deferred`는 **현재 M 무영향 근거 + 이관 앵커 + 회수 시점** 3개를 모두 가질 때만 성립한다. 하나라도 없으면 `open`으로 간주해 봉인을 막는다. 단순 parked는 허용하지 않는다.
현재 M을 막는 사실 조사는 `deferred`가 아니라 **봉인 전 `/research-pack`**으로 종결한다. 연구 자체가 마일스톤 산출물이면 별도 선행 마일스톤으로 분리한다.

### D5. 가설 처리 (위험도 4단계)
ADR-035의 "미검증 = 행동 차단"과 `DISCOVERY_TEMPLATE`의 "P1 보고(자동 차단 X)" 강도 불일치를 위험도로 정리한다:

| 유형 | 처리 |
|------|------|
| 실패 시 현재 M 목표가 무효가 되는 핵심 가설 | **봉인 차단** — 검증 후 진행 |
| 마일스톤 자체가 그 가설을 검증하는 실험 | `risk-accepted` 허용 — **검증 방법·판정일·중단 기준** 3필드 필수 |
| 낮은 위험의 가역적 가설 | 동일 3필드 갖춘 `risk-accepted` |
| 검증 계획 없는 미검증 가설 | **봉인 차단** |

`risk-accepted`는 `authority: user-*`만 부여할 수 있다. `DISCOVERY.md`가 없는 프로젝트(discovery 생략 — PROJECT_START_CHECKLIST 1단계는 선택)는 본 검사를 skip하고 사유를 echo한다.

### D6. M/F 상태 확장 — `contract-ready`
M/F 상태를 `draft → contract-ready → ready`로 확장한다.
- `contract-ready` — `/plan-milestone`의 라운드(범위·feature·FAC·프로토타입·PX)가 사용자 승인으로 끝났고 **task 분해에 들어갈 수 있는** 상태. **잠금이 아니다.** 전환 조건: 확정 재대조 통과 + **원장에서 이 M을 `영향:`으로 갖는 항목과 `(미할당)` 항목 중 `status: open` 0건**(상위 계약 층의 미결정을 task 분해 전에 닫는다 — 사용자 요구인 "상위 결정을 먼저 확실히 닫기"의 집행 지점).
- `ready` — `/seal-milestone`만 부여한다. 이 시점부터 M/F/task 계획이 잠긴다.

> `contract-ready`의 open-0과 D7 봉인 조건 6의 open-0은 **시점이 다른 두 게이트**다. 전자는 *상위 계약 확정 시점*, 후자는 *task까지 완성된 최종 시점*이며, task 분해 중 새로 드러난 결정은 후자가 잡는다.

**잠금의 실질 기준선은 "첫 구현 시작"이다**: `ready`가 붙어도 그 M에 `in-progress`/`done` task가 **0건이면 task·매핑·의존성 결함을 `/repair-plan`이 그 자리에서 고칠 수 있고**, 고친 뒤 `/seal-milestone M<N>` 재실행으로 receipt를 갱신한다(M/F 계약 층은 여전히 다음 M). `in-progress`가 하나라도 생기면 그때부터 task 계획도 잠긴다 — ADR-057#amend-3의 "구현이 시작되면 task 계획도 변경하지 않는다"와 같은 기준선이다.
근거: 잠금의 목적은 *구현 중 계획이 흔들리지 않는 것*이다. 구현 0건이면 그 목적이 걸리지 않으며, 막으면 "첫 구현 전 결함을 다음 M으로 보낸다"는 본 개선이 없애려던 역설이 한 칸 뒤로 옮겨 재현된다(`/repair-workitem`은 `ready` task repair를 거부하므로 다른 경로가 없다).

`/plan-workitem`은 M·산하 feature가 **모두 `contract-ready`**일 때 동작하며, **task를 `ready`로 승격하지 않는다**(전부 `draft`로 남긴다). 승격 권한은 `/seal-milestone` 단독이다.

**ADR-057#amend-3 결정 5(a)(b)(f)와 plan-workitem의 ready 승격을 본 결정이 supersede한다.** 5(f)의 "열린 질문을 milestone `## 7`·feature `## 12`에 영속"은 D1이 그 섹션을 폐지하므로 원장 등재로 대체된다. 결정 5(c)(d)(e)와 task 상태기계(`draft → ready → in-progress → done`)는 유지한다.

`contract-ready` 구간에서는 상위 계약 수정이 **정상 경로**다 — `/plan-workitem`이나 `/validate-plan`이 상위 계약 결함을 찾으면 다음 마일스톤으로 보내지 않고 `/repair-plan`이 그 자리에서 고친다(ADR-057#amend-3 결정 5(d)의 "다음 M 기본 경로"는 `ready` 이후에만 적용).
**stale task 방지**: `contract-ready`에서 feature `## 3` 시나리오나 `## 7` FAC의 *의미*를 고치면, 그 feature 문서에 `- 계약 수정: <YYYY-MM-DD> — 이 feature의 task 재검증 필요` 마커를 남긴다. `/plan-workitem`은 이 마커가 있는 feature를 완결로 보지 않고 재검증한 뒤 마커를 제거한다(ID·매핑이 유지된 채 의미만 바뀐 stale task 차단).

### D7. `/seal-milestone` 신설
마일스톤 계획의 최종 검사 + 사용자 승인 + 상태 전이를 담당하는 skill을 신설한다(`disable-model-invocation: true`).
**봉인은 task 작성의 하위 모드가 아니라 여러 소유 문서를 가로지르는 lifecycle gate**이므로 authoring skill과 분리한다.

**진입 모드 4종**(skill 본문 0단계가 판정): **정상**(M/F `contract-ready` + task 전부 `draft`) / **재개**(부분 승격 상태) / **마이그레이션**(D12 (가) — `ready`+receipt 미채움+구현 0건) / **grandfather**(D12 (나) — 같은 상태에서 구현 1건 이상).

봉인 조건(전부 충족해야 승격 — 상세 절차는 skill 본문):
1. 상태 — 위 4종 중 하나로 판정될 것(`draft` M과 이미 봉인된 M은 각각 안내 후 종료)
2. task 존재·상태 완결 — **grandfather 진입에서는 미적용**(D12 (나) 3)
3. task 필수 섹션 + **AC 해석 확정** + **TDD opt-out 형식 정합** — implement 착수 게이트 ⑦⑧을 봉인 시점으로 앞당겨 "봉인 통과 후 첫 구현에서 즉시 halt"를 막는다
4. FAC↔AC / PX↔AC / INV 커버리지
5. 의존성 그래프 존재성·비순환·AC-보장
6. **원장** — 이 M 영향 + `(미할당)` 항목의 `open` 0건(**이번에 봉인하는 그 M을 가리키는** `- 발견: 봉인 후 (M<N>)` 항목만 제외), `deferred` 앵커 3필드 완비 — grandfather 진입에서는 보고만
7. 가설 D5 판정 (DISCOVERY 부재 시 skip) — grandfather 진입에서는 보고만
8. 리뷰 증거 — 잔존 review 파일 처리 + 사용자에게 리뷰 수행 여부 1회 확인
9. 사용자 최종 승인 — **재개·마이그레이션·grandfather 진입에서도 반드시 다시 받는다**

**승격 순서**: `task → feature → milestone`. M을 마지막에 써야 "M=`ready` ⇒ 하위 전부 `ready`" 불변식이 성립한다. 파일 순차 쓰기라 원자 트랜잭션이 아니며, **중단 시 재실행이 부분 승격 상태를 재개 진입으로 인식해 나머지만 승격한다**(0단계의 재개 분기 — 이 예외가 없으면 부분 승격 상태가 영구히 갇힌다).

**Seal은 내용을 수정하지 않고 커밋도 하지 않는다.** 실패 시 **어떤 상태도 바꾸지 않고** 소유 skill로 반환한다. 성공 시 상태와 **seal receipt**만 기록한다.

**seal receipt** — 마일스톤 문서 `## 10. 봉인 기록`에 남긴다. 이는 암호학적 digest가 아니라 **사람이 읽는 요약**이며, 내용 변경 탐지 수단이 아니다. **봉인 완료 표식은 섹션의 *존재*가 아니라 그 안에 `- 봉인일:` 줄이 채워졌는지**다 — `## 10`은 MILESTONE_TEMPLATE에 빈 채로 들어 있어 모든 미봉인 마일스톤에도 섹션 자체는 존재한다. `/implement-workitem` 착수 게이트는 `- 봉인일:` 채움을 본다:
```
- 봉인일: <YYYY-MM-DD>
- 승인: 사용자 명시 승인
- 계획 규모: feature <F수> / task <T수> / AC <AC수>
- 리뷰: executed <yes|no> | independence <separate-session|same-session(under-verified)|none> | 처리 <P0 N건 / 차단 P1 M건>
- Register: closed N건 / deferred M건 / open 0건
```
`executed: no`여도 봉인을 막지 않는다(리뷰는 opt-in — ADR-038 유지). 다만 **미실행 사실을 receipt에 남긴다.**

### D8. 봉인 차단 finding 범위
`/validate-plan`을 돌린 경우, **P0 전부** + 아래 P1 카테고리가 미해결이면 봉인 차단이다. 기준은 *"이 finding이 미해결인 채 구현에 들어가면 개발 중 기획 질문이 되는가"*.

| 차단 P1 | 비차단 P1 |
|---------|-----------|
| `[Plan-decision]`(신설) · `[Plan-ambiguity]` · `[Plan-design]` · `[Plan-seam]` · `[MP-FAC-quality]` · `[MP-feature-scope]` · `[MP-graduation]` · `[MP-feature-dep]` | `[Plan-sizing]` · `[Plan-arch]` · `[Plan-doc-link]` |

차단 대상은 (a) 해결하거나 (b) `/repair-plan` 4-판정에서 `Reject-*`로 정당하게 기각하거나 (c) 사용자가 **원장에 `status: closed` + `disposition: chosen`**으로 명시 수용해야 한다. **(c)에 `risk-accepted`를 쓰지 않는다** — `risk-accepted`는 D5의 *가설 위험 수용*(검증 방법·판정일·중단 기준 3필드) 전용이고, 계획 결함을 감수하는 것은 성격이 다른 *선택*이다.
**재리뷰 조건**: `/repair-plan`이 `Adopt`/`Adopt-modified`를 1건 이상 적용해 **문서를 실제로 수정한 경우에만** 최종본 재리뷰를 권장한다(차단 아님 — 리뷰가 opt-in이므로 재리뷰도 opt-in). 전부 `Reject-*`로 무수정 종료면 원 리뷰가 유효하다.

### D9. ARCH `## 7-1`~`## 7-5` 결정권 승격
`bootstrap-stack`의 "`## 7-1`~`## 7-5` 인터페이스 컨벤션 채움 = architect 단발 sub-call(라운드 아님)" 규정을 **부분 supersede**한다. 각 소항목에 `authority`를 다음과 같이 배정한다:

| 섹션 | `user-approval` (Decision Brief 제시) | `agent-delegated` (일괄 확인 1회) |
|------|--------------------------------------|----------------------------------|
| `## 7-1` API | 응답 envelope · 페이지네이션 | HTTP 상태 매핑 · error 레지스트리 · 네이밍 · Don'ts |
| `## 7-2` CLI | 출력 포맷(기본 모드) | 플래그·명령어 · TTY/ANSI · Don'ts |
| `## 7-3` 백엔드 | **DB migration · 인증·인가 · API versioning** | 트랜잭션 경계 · Idempotency · Rate limit · Async job · Caching |
| `## 7-4` 프론트 | **라우팅 · SSR-CSR · 인증(토큰 저장)** | 상태관리 · i18n · SEO · 폼 validation |
| `## 7-5` 모바일 | **대상 플랫폼·최소 OS · 화면 이동 · 권한 요청 흐름 · 로컬 저장·오프라인 · 서명·배포** | 상태관리 · 네이티브 연동 · 빌드 flavor · 백그라운드 · WebView · Don'ts |

배정 기준: 되돌린 뒤 **이미 쓴 코드·데이터·사용자 계정에 파급**이 있으면 `user-approval`, 코드 안에서 끝나면 `agent-delegated`. (`## 7-5` 화면 이동은 `## 7-4` 라우팅과 같은 성격이라 대칭으로 `user-approval`이다 — 라우팅 라이브러리 교체는 전 화면을 건드린다.)

### D10. ADR-053 종결자 이동
ADR-053 결정 2의 `④ ARCHITECTURE §7 결정 블록 기록`을 `④ 사용자 선택(Decision Brief) → ⑤ 기록`으로 정정한다(ADR-053#amend-2). 리서치·다각도·적대 검토는 **선택지를 만드는 과정**이지 결정 자체가 아니다.

### D11. 봉인 후 새 결정의 라우팅 (차단 아님)
봉인 뒤 구현 중에 드러난 결정은 원장에 `status: open` + **`- 발견: 봉인 후 (M<N>)`** 줄로 기록하되 **착수를 막지 않는다.** `/implement-workitem`의 게이트는 *봉인이 있었는지*(부모 M `## 10`의 `- 봉인일:` 채움)를 확인할 뿐이며, 봉인 후 항목은 ADR-057#amend-3 결정 6의 기존 라우팅을 탄다 — (a) 기존 task 약속 결함 → `/repair-workitem`, (b) 새 범위 → 사용자 보고 + 다음 M, (c) 불명확·현재 M 차단 P0 → 사용자 결정 대기.
**마커는 범위를 갖는다** — `(M<N>)`이 가리키는 그 마일스톤의 봉인 검사에서만 제외된다. 항목이 `영향: M2`도 가지면 M2 봉인에서는 정상 검사 대상이다(범위 없는 제외는 후속 마일스톤에서도 항목을 숨긴다).
쓰기 주체: `/repair-workitem`(task 결함 처리와 함께), `/stabilize-milestone`(발견 기록), 사용자 직접. **두 skill 본문에 이 등재 규약을 배선한다** — 배선하지 않으면 D11이 소비자 없는 죽은 계약이 된다.
**근거**: 모든 결정을 미리 알아내는 건 불가능하다. 봉인의 목적은 *최대한 닫는 것*이지 사후 발견을 차단하는 게 아니다. 사후 발견을 차단하면 **정직한 등재가 마일스톤 전체를 멈추는 데드락**이 된다.

### D12. 다운스트림 마이그레이션 (기존 fork)
본 개선 이전에 만들어진 프로젝트는 M/F가 이미 `ready`이고 마일스톤 문서에 `## 10`이 없다. 새 착수 게이트(`- 봉인일:` 채움 요구)를 그대로 적용하면 진행 중 프로젝트가 전부 막힌다. **구현 시작 여부로 두 갈래로 흡수한다**(ADR-056 결정 8 다운스트림 마이그레이션 관례와 동형):

**(가) `ready` M + `- 봉인일:` 미채움 + 그 M에 구현 흔적 task 0건 — 계획만 된 프로젝트**
> **구현 흔적 task** = `in-progress` · `blocked` · `done` · `deprecated`. `blocked`는 `in-progress`에서만, `deprecated`는 `done`에서만 도달하므로 4종 모두 구현 시작 후의 상태다. `in-progress`/`done`만으로 갈래를 나누면 `blocked`만 남은 마일스톤이 (가)로 분류돼 조건 2에서 차단되고 receipt가 없어 implement도 거부되는 교착이 남는다.
1. `/seal-milestone M<N>`이 **봉인 조건 2~8을 전수 재검사**한 뒤 사용자 승인을 받아 receipt를 기록한다. `ready`라는 이유로 검사를 건너뛰지 않는다 — 구 lifecycle·수동 편집으로도 `ready`가 붙을 수 있다.
2. 조건 미충족(예: task 0건)이면 **receipt를 쓰지 않고** 소유 skill로 반환한다(빈 마일스톤에 봉인 도장 금지).

**(나) `ready` M + `- 봉인일:` 미채움 + 그 M에 구현 흔적 task 1건 이상 — 이미 구현 중인 프로젝트**
3. **봉인 조건 2(구현 시작 흔적 차단)를 적용하지 않는다.** 적용하면 seal이 거부하고 implement도 receipt가 없어 거부해 **순환 교착**이 된다. 이미 구현이 시작됐으므로 계획 잠금의 실익(구현 전 확정)은 이미 지나갔고 소급 검사는 진행만 막는다.
4. 조건 6(원장)·7(가설)은 **보고만** 하고 차단하지 않는다. 조건 3·4·5는 관측해 receipt에 수치로 남긴다. receipt의 `Register:` 줄도 **실측값**으로 쓴다 — 이 갈래에서는 `open`이 0이 아닐 수 있으므로 정상 봉인용 `open 0건` 문구를 쓰지 않고 `open <K>건 (보고만 — 소급 검사 없음)`으로 적는다.
5. 사용자에게 소급 검사를 하지 않는다는 사실을 알리고 명시 확인 1회를 받은 뒤, receipt 첫 줄을 `- 봉인일: <날짜> (마이그레이션 — 구현 중 착수, 소급 검사 없음)`로 기록한다. **라벨이 진짜 봉인과 구분한다** — 없으면 사후에 검증된 계획으로 오독된다.
6. 이후 마일스톤(M<N+1>)부터는 정상 경로를 탄다.

**(공통)**
7. `/plan-workitem`·`/plan-milestone`·`/repair-plan`은 "`ready` = 봉인 완료"로 즉시 거부하지 않는다 — **`ready`인데 `- 봉인일:`이 미채움이면 마이그레이션 대상**으로 보고 `/seal-milestone M<N>` 실행을 안내한다.
8. `## 10` 섹션 자체는 MILESTONE_TEMPLATE에 baseline으로 들어가므로, 기존 마일스톤 문서에는 사용자가 수동으로 추가하거나 seal이 기록 시 생성한다.

## 비결정 (No)
- **결정적 실행 checker(별도 프로그램) 신설** — 도입하지 않는다. 봉인 검사는 `/seal-milestone` 본문의 절차적 검사로 수행한다. 결과적으로 "에이전트가 원장에 애초에 적지 않은 결정"은 잡히지 않으며, 이 잔여 gap을 명시 수용한다. `--fast` 경로(discover-product R3 생략)가 이 gap의 상수 경로가 된다는 점도 함께 수용한다.
- **독립 plan review 필수화** — ADR-038의 opt-in을 유지한다.
- `--fast` 플래그 기반 봉인 차단 — 게이트는 **모드가 아니라 산출물 기준**이다(ADR-058 D3 정합).
- 열린 질문 섹션 번호 재사용 — 결번 처리(기존 인용 보호).
- 원장에 결함·품질 지적 등재 — 원장은 기획 결정 인덱스다. 기존 `남은 미결정 사항` 슬롯을 **대체하지 않고 병존**한다.
- 봉인 후 원장 `open`으로 구현 차단 — D11 참조(데드락 방지).
- `repair-plan`에 Charter/ARCHITECTURE/DESIGN 직접 수정 권한 부여 — 저작 소유는 각 bootstrap skill이다(ADR-005/ADR-058). 권장만 하고 고치지 않는다.

## Mutation Contract (ADR-047 D3)
1. Target — DECISION_REGISTER.md 신설 / 열린 질문 5섹션 폐지 / M·F `contract-ready` / seal-milestone 신설 + Codex wrapper + 로스터 / plan-milestone · plan-workitem · repair-plan · repair-workitem · implement-workitem · validate-plan · stabilize-milestone / discover-product · bootstrap-project · bootstrap-stack · bootstrap-design · stack-guard / reviewer · architect · planner / WORKFLOW · STRUCTURE · CHECKLIST · DELEGATION · AGENTS · README ×2 / MILESTONE·FEATURE·TASK 템플릿 / ADR-007 · ADR-026 · ADR-027 · ADR-035 · ADR-036 · ADR-037 · ADR-046 · ADR-053 · ADR-057.
2. Failure mode — 상류 결정이 문서에 열린 채 남거나 대화에서 증발하고, 구현 중에 기획 질문이 되살아난다(관측됨).
3. Predicted improvement — 봉인 시점에 현재 M 영향 미결정 0건. 상위 계약 결함을 첫 구현 전에 그 자리에서 수정 가능.
4. Preserved invariants — ADR-005 SSOT(원장은 인덱스, 정본 저작 소유는 각 bootstrap skill) / ADR-038 opt-in 리뷰 / ADR-019 index-first recall / task 상태기계 / ADR-057 seam 계약(결정 8~14)·결정 6 라우팅 / `남은 미결정 사항` 출력 슬롯 존치 / builder EXECUTE 전용 / 자동 차단 최소화.
5. Falsifying evaluation — 마일스톤당 사용자 결정 카드가 감당 불가로 늘거나(피로), 봉인을 통과했는데 구현 중 기획 질문(`[Planning-escape]`)이 반복 관측되면 `authority` 배정과 봉인 조건을 재조정한다. 봉인 후 등재가 실제로 데드락을 만들면 D11을 재검토한다. 원장 행이 마일스톤당 20건을 넘으면 D1 등재 범위를 다시 좁힌다.
6. Rollback path — superseded → 원장·`contract-ready`·seal-milestone 제거, 열린 질문 5섹션 복원, plan-workitem 승격 복원(ADR-057#amend-3 결정 5 원복).

## Ratchet 강도 (ADR-022)
- **constraint(강, [관측됨])**: D6(`contract-ready` 구간의 계약 수정 허용 + `contract-ready` 전환의 open-0) · D7(봉인 조건 3·6).
- **enabling(약)**: 나머지 전부. 특히 **D11·D12는 *완화* 방향**이다 — 사후 발견과 기존 fork를 막지 않기 위한 예외이므로 새 차단을 만들지 않는다.

## Surfaces
- docs/10-charter/DECISION_REGISTER.md
- docs/10-charter/PROJECT_CHARTER.md
- docs/10-charter/_templates/DISCOVERY_TEMPLATE.md
- docs/20-system/ARCHITECTURE_OVERVIEW.md
- docs/30-workitems/_templates/MILESTONE_TEMPLATE.md
- docs/30-workitems/_templates/FEATURE_TEMPLATE.md
- docs/30-workitems/_templates/TASK_TEMPLATE.md
- .claude/skills/seal-milestone/SKILL.md
- .claude/skills/plan-milestone/SKILL.md
- .claude/skills/plan-workitem/SKILL.md
- .claude/skills/repair-plan/SKILL.md
- .claude/skills/validate-plan/SKILL.md
- .claude/skills/implement-workitem/SKILL.md
- .claude/skills/discover-product/SKILL.md
- .claude/skills/bootstrap-project/SKILL.md
- .claude/skills/bootstrap-stack/SKILL.md
- .claude/skills/bootstrap-design/SKILL.md
- .claude/skills/stack-guard/SKILL.md
- .claude/skills/repair-workitem/SKILL.md
- .claude/skills/stabilize-milestone/SKILL.md
- .claude/agents/reviewer.md
- .claude/agents/architect.md
- .claude/agents/planner.md
- .agents/skills/seal-milestone/SKILL.md
- docs/90-decisions/boilerplate/ADR-007-workitem-lifecycle.md
- docs/90-decisions/boilerplate/ADR-026-plan-workitem-schema.md
- docs/90-decisions/boilerplate/ADR-036-feature-level-prd.md
- docs/90-decisions/boilerplate/ADR-037-spec-coverage-audit.md
- docs/00-meta/WORKFLOW.md
- docs/00-meta/STRUCTURE.md
- docs/00-meta/PROJECT_START_CHECKLIST.md
- docs/00-meta/DELEGATION_STRATEGY.md
- AGENTS.md
- README.md
- README_ko.md

## 참고
- ADR-056(결정 4 비대칭 — D2의 원형), ADR-053(#amend-2 — D10), ADR-046(#amend-1 — D3 carve-out), ADR-035(#amend-3 — D5), ADR-057(결정 5(a)(b)(f) 부분 supersede — D6/D11, 결정 6 라우팅 유지), ADR-027(§7-x "라운드 아님" 규정 부분 supersede — D9), ADR-007(lifecycle 단계 SSOT — D7이 plan과 implement 사이에 봉인 게이트 추가), ADR-026(#amend-4의 "task `ready` 승격" 주체를 D7이 seal로 이전), ADR-037(#amend-3의 "task `ready` 승격 조건"을 D7이 봉인 조건으로 이전), ADR-036(FEATURE 12섹션 → `## 12` 폐지로 11섹션), ADR-038(opt-in 유지), ADR-019, ADR-005, ADR-006, ADR-022, ADR-047 D3.
