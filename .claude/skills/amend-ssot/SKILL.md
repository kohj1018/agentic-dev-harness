---
name: amend-ssot
description: 확정된 상위 정본(DISCOVERY·Charter·ARCHITECTURE·DESIGN)의 절 단위 부분 개정 + 파생 문서 전파. 발굴·재생성 라운드는 하지 않고 heavy skill로 라우팅한다.
argument-hint: "\"<변경 요청>\" [--from <출처>] [--dry-run]"
disable-model-invocation: true
allowed-tools: Read Glob Grep Write Edit
---

이 skill은 **이미 확정된 정본 문서의 부분 개정**만 한다. 빈 문서를 채우거나(authoring), 발굴·스택 결정·시안 라운드를 돌지 않는다 — 그것은 각 bootstrap skill 소유다.

**Codex**: 본 skill은 wrapper 미보유(자연어 호출) — "Follow `.claude/skills/amend-ssot/SKILL.md`"로 호출한다(목록 SSOT = README, ADR-010#amend-3).

입력:
- `$ARGUMENTS`의 따옴표 문자열 = 변경 요청(무엇을 어떻게 바꿀지).
- `--from <출처>` (선택) — 이 변경이 어디서 나왔는지. `사용자` / `T-NNN` / finding ID.
- `--dry-run` (선택) — change-set만 출력하고 파일을 쓰지 않는다.
- **기본 동작은 적용이다.** 사용자 호출 자체가 적용 의도이므로 별도 승인 플래그를 두지 않는다.

## A0. 변경 요청 정규화
자연어 요청을 «어느 정본의 어느 절이 어떻게 바뀌는가»의 change-set으로 바꾼다. **대상 정본은 넷뿐이다** — `docs/10-charter/DISCOVERY.md` · `docs/10-charter/PROJECT_CHARTER.md` · `docs/20-system/ARCHITECTURE_OVERVIEW.md` · `docs/20-system/DESIGN.md`.
- **ADR은 대상이 아니다.** `docs/90-decisions/**/ADR-*.md`의 개정은 amend vs supersede 임계([ADR-045](../../../docs/90-decisions/boilerplate/ADR-045-doc-reference-contract.md) D6)와 작성 주체·시점 트리거([ADR-000](../../../docs/90-decisions/boilerplate/ADR-000-boilerplate-decision-policy.md)#amend-2)가 별도로 규율하며, boilerplate ADR은 fork 후 read-only이고 project ADR로 supersede하는 경로가 정해져 있다. ADR 개정 요청을 받으면 그 경로를 안내하고 종료한다.
- 대상 절을 특정할 수 없으면 **추측하지 않고** 후보 2~3개를 제시해 사용자에게 묻는다.
- 대상 파일이 없으면(예: 비-UI 프로젝트의 DESIGN.md) 그 사실을 알리고 종료한다.

## A1. 분류 (ADR-069 D2)
change-set을 넷 중 하나로 분류한다.
- **editorial** — 오탈자·표현·형식.
- **local semantic** — 한 절 안에서 의미가 바뀌나 A3 전파표에 걸리지 않음.
- **cross-SSOT** — A3 전파표에 걸림.
- **foundation** — 아래 라우팅 목록에 해당 → **거부하고 종료**한다.

**foundation 라우팅 (ADR-069 D4 — 절-키 고정. 판단이 아니라 열거다)**
| 트리거 | 안내할 명령 |
|---|---|
| DISCOVERY `## 1` 문제 한 줄 · `## 2` 페르소나 **교체** | `/discover-product --update` |
| ARCH의 T2 카테고리 결정(언어·런타임·프레임워크·DB·영속성·인증·배포 토폴로지) | `/bootstrap-stack --migrate` |
| DESIGN 시각 방향 전환(원칙·팔레트 교체) | `/bootstrap-design --update` |
| Charter 문제 정의 전면 재정의 | `/bootstrap-project --apply` |

페르소나 «문구 수정»은 foundation이 아니다 — **대상 자체가 바뀌는 교체**만 해당한다. 애매하면 사용자에게 «이건 다시 발굴해야 하는 변경입니까»를 1회 묻는다.

## A2. authority 판정 (ADR-060 D2 — 절차 SSOT는 그 ADR)
- 제품 의도·범위·우선순위·사용자 체감·외부 계약·데이터/보안·비용·위험 허용도·비가역 약속 → `user-choice`
- 스택·인증·데이터 경계·되돌리기 비싼 구조 → `user-approval`
- 승인된 경계 안의 가역적 내부 선택 → `agent-delegated`

`user-*`면 Decision Brief 6블록으로 제시해 확인받는다(ADR-060 D3). 사용자가 이미 그 문장을 말한 경우에는 **재진술 확인 1회**로 갈음한다 — 없던 선택지를 만들어 되묻지 않는다.

## A3. 전파 계산 (ADR-069 D3 전파표 적용)
change-set의 각 대상 절을 전파표에 대입해 «함께 볼 곳»과 «잔여 액션»을 산출한다. 전파표는 ADR-069 D3가 SSOT이며 여기에 재서술하지 않는다 — 그 절을 읽고 그대로 적용한다.
- **`/stack-guard`·design gate는 직접 실행하지 않는다** — 필요 여부만 판정해 A7의 잔여 액션에 낸다.
- ARCH `## 7-x` 변경 시 산하 task의 `Architecture-Iface` 링크는 **읽기 검사만** 한다. task 문서를 수정하지 않는다.

## A4. 봉인 충돌 검사 (ADR-069 D5)
**봉인 여부는 milestone 문서로 판정한다** — `- 봉인일:`이 있는 `## 10. 봉인 기록`은 **milestone 문서에만** 존재한다(feature·task 문서에는 없다). 영향받는 workitem이 feature·task면 그 **부모 milestone**의 `## 0. Status`가 `ready`이고 `## 10`에 `- 봉인일:`이 채워졌는지를 본다.

- 봉인된 계약에 영향이 있으면 **그 workitem 문서를 수정하지 않는다.** 정본만 고치고, 충돌 사실을 아래로 처리한 뒤 출력에 명시한다.
  - **정본 문서의 한 절이 더 바뀌어야 성립** → `docs/10-charter/DECISION_REGISTER.md`에 `status: open` + `- 발견: 봉인 후 (M<N>)`으로 **본 skill이 등재한다**(ADR-060 D11 writer 계열 — STRUCTURE의 원장 writer 목록에 본 skill이 등재돼 있다).
  - **다음 마일스톤 문서 하나가 생기면 해소** → `docs/30-workitems/ROADMAP.md`의 `## Backlog`가 제자리다. **본 skill은 그 파일에 쓰지 않고 «권장 등재 행»을 출력에 낸다** — `## Backlog`의 writer는 `/accept-milestone`·`/repair-acceptance`(append)와 `/plan-milestone`(정리·승격)으로 고정돼 있고([ADR-057](../../../docs/90-decisions/boilerplate/ADR-057-planning-v2-batch-and-seam.md)#amend-4), 본 skill을 writer로 늘리지 않는다. 사용자가 그 행을 붙여 넣거나 다음 `/plan-milestone` R0가 회수한다.
  - **한 항목을 양쪽에 쓰지 않는다** (ADR-005#amend-1 비중복 불변식).

## A5. 적용
- `--dry-run`이면 change-set과 A3·A4 결과만 출력하고 **파일을 쓰지 않고 종료**한다.
- 분류가 **cross-SSOT**면 change-set(파일별 before/after 요약)을 제시하고 **in-session 확인 1회**를 받은 뒤 적용한다.
- **editorial·local semantic**은 확인 없이 적용한다.
- 적용 순서는 **정본 → 파생** 이다. 정본이 먼저 확정돼야 파생 갱신의 근거가 생긴다.
- 지명되지 않은 절을 함께 고치지 않는다. 인접 정리·재포맷 금지(ADR-006).

## A6. 결정 기록
A2에서 `user-*`로 판정해 사용자가 확정한 항목은 `docs/10-charter/DECISION_REGISTER.md`에 `status: closed` + `정본:` 앵커로 등재한다(이미 있으면 상태·앵커만 갱신 — 중복 등재 금지). **항목 형식·필수 필드의 SSOT는 그 파일 상단의 「항목 형식」 블록과 [ADR-060](../../../docs/90-decisions/boilerplate/ADR-060-decision-closure-and-milestone-seal.md)이며 여기 재서술하지 않는다** — 신규 등재면 `D-NNN`·`authority`·`disposition`·`질문:`·`영향:`을 그 형식대로 채운다(`closed` + `user-*`는 승인 근거 필수 — 불변식 2). `agent-delegated`는 개별 등재하지 않고 출력의 일괄 확인으로만 처리한다.

## A7. 마지막 출력
- 분류: editorial | local semantic | cross-SSOT | foundation(라우팅)
- 수정한 파일 + 절 목록 (before/after 1줄 요약)
- 전파 결과: 함께 갱신한 파생 문서 / 읽기 검사만 한 대상
- **잔여 액션** (해당 시): `/stack-guard` 재실행 필요 / design gate 재실행 필요 / `/bootstrap-design --update` 권장 등
- 봉인 충돌: 등재한 항목 (DECISION_REGISTER D-NNN) / **권장 등재 행 (ROADMAP `## Backlog` — 붙여 넣을 수 있는 완성된 한 줄. 본 skill이 쓰지 않는다)** / 없음
- **원장 요약**: `closed N건 / deferred M건 / open K건`
- **커밋 안내**: 본 skill은 커밋하지 않는다 — 수정 파일을 사용자가 직접 커밋한다.

책임 경계:
- 발굴·재생성·시안 라운드를 돌지 않는다. foundation 변경은 A1에서 거부한다.
- 봉인된 M/F/task 문서를 수정하지 않는다.
- 코드를 수정하지 않는다. `/stack-guard`·design gate를 실행하지 않는다.
- 커밋하지 않는다.

정책 근거: [ADR-069](../../../docs/90-decisions/boilerplate/ADR-069-bounded-ssot-amendment.md) D1~D6. authority·Decision Brief는 [ADR-060](../../../docs/90-decisions/boilerplate/ADR-060-decision-closure-and-milestone-seal.md) D2/D3. 정본 소유권은 [ADR-005](../../../docs/90-decisions/boilerplate/ADR-005-ssot.md).

## Context 정책 (ADR-019)
A0에서 특정한 대상 절과 A3 전파표가 지목한 파일을 읽는다. **절차 수행에 필요한 아래 셋도 해당 단계에서 읽는다** — [ADR-069](../../../docs/90-decisions/boilerplate/ADR-069-bounded-ssot-amendment.md) D3 전파표(A3) · 부모 milestone의 `## 0. Status`와 `## 10. 봉인 기록`(A4) · `docs/10-charter/DECISION_REGISTER.md`(A4·A6 등재 — `영향:` 색인으로 관련 항목만). 그 밖의 사전 fork-load는 금지한다.
