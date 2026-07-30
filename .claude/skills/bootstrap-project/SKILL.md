---
name: bootstrap-project
description: Convert discovery output (DISCOVERY.md) or a natural-language brief into charter/architecture/ADR-100. Milestones are created by /plan-milestone (ADR-057). Re-run safe with update mode.
argument-hint: "[project brief or empty (uses DISCOVERY.md)] [--apply]"
disable-model-invocation: true
allowed-tools: Read Glob Grep Write Edit Agent
---

너의 역할은 이 보일러플레이트를 기준으로 새 프로젝트의 초기 문서 세팅을 완료하는 것이다.

입력 우선순위:
1. `$ARGUMENTS`에 brief 내용이 있으면(비어 있지 않으면) 그것을 우선 입력으로 사용한다. `docs/10-charter/DISCOVERY.md`가 함께 있으면 보조 컨텍스트로만 참조하고, 둘이 어긋나면 출력에 명시한다(silent override 금지).
2. `$ARGUMENTS`가 비어 있고 `docs/10-charter/DISCOVERY.md`가 있으면 그것을 입력으로 사용한다.
3. 둘 다 없으면 `/discover-product` 선행 또는 brief 입력을 안내하고 종료한다(강제 진행하지 않는다).

이 skill은 발굴이 아니라 변환을 한다 — 발굴은 `/discover-product`에서.

반드시 먼저 읽을 파일:
- AGENTS.md (CLAUDE.md는 @AGENTS.md import이므로 본문은 AGENTS.md에서 읽는다)
- `docs/00-meta/STRUCTURE.md`
- `docs/00-meta/WORKFLOW.md`
- `docs/00-meta/GUARDRAILS_STRATEGY.md`
- `docs/00-meta/PROJECT_START_CHECKLIST.md`
- `docs/90-decisions/boilerplate/_ADR_GUIDE.md` (ADR-100 작성 시 권장 섹션·area 태그·Mutation Contract 규약)
- `docs/90-decisions/project/README.md` (project ADR 인덱스 — ADR-100 추가 후 한 줄 갱신 대상)
- `brief-template.md`
- `output-checklist.md`
- `examples/career-saas-example.md`

반드시 수행할 일:
1. 입력 회수 — DISCOVERY.md 또는 자연어 입력.
2. 기존 산출물(charter/architecture/ADR-100) 존재 여부 점검.
   - 없으면 새로 생성.
   - 있으면 **갱신 모드** — 본 skill은 메인 세션에서 실행된다. 기존 산출물 덮어쓰기는 사고 방지를 위해 명시적 승인(`--apply` 또는 사용자 확인)을 요구한다.
     - `--apply` 인자가 있으면: 기존 산출물을 읽고 architect로 갱신본을 생성해 즉시 반영한다.
     - `--apply` 인자가 없으면: 기존 산출물을 읽고 갱신 제안 diff를 출력에만 표시하고 **종료**한다(파일 수정 없음). 사용자가 검토 후 `/bootstrap-project --apply ...`로 재실행하거나, 메인 세션에서 architect를 직접 호출해 부분 반영한다.
3. 메인 세션이 본 절차를 직접 운전한다(discover-product·bootstrap-design 패턴). 무거운 아키텍처 추론(charter 구조화·ARCHITECTURE 결정·ADR-100 초안)은 `Agent` 도구로 **architect 단발 sub-call**에 위임하고, 반환된 결론을 본 skill이 파일에 반영한다(architect agent의 `model: opus`가 추론 품질을 보장). **단, 설계 결정이 ADR-053 게이트(S1~S4 중 1+)에 걸리면 단발 sub-call 대신 아래 `## 고-stakes 설계 게이트`의 ①~⑤ 절차를 따른다** — 신규 프로젝트 초기 아키텍처(DB·인증·데이터 모델)는 거의 항상 게이트 대상. 종료 후 사용자에게 `/clear` 또는 새 세션 권장.
4. 다음 산출물을 갱신한다.
   - `README.md` · `README_ko.md` — **2종 동시 갱신**(한쪽만 고치면 drift. 두 README는 자연어 호출 skill 목록의 SSOT이자 fork 후에도 남는 프로젝트 표지 — ADR-010#amend-3)
   - `docs/10-charter/PROJECT_CHARTER.md`
   - `docs/20-system/ARCHITECTURE_OVERVIEW.md`
5. 필요하면 다음도 함께 갱신.
   - `docs/20-system/DESIGN.md`는 baseline placeholder (presence: conditional). UI 스택 포함 시 `/bootstrap-design`이 본 파일을 채운다. 비-UI는 fork 직후 본 파일 삭제 (본 skill에서는 갱신 X).
   - `docs/90-decisions/project/ADR-100-initial-project-decisions.md` — bootstrap 단계의 초기 결정 (project ADR은 100+ 번호 — boilerplate/ADR-002는 legacy reserved). _ADR_GUIDE.md 권장 섹션 + Ratchet evidence label 정합. 스택 선택 ADR은 `/bootstrap-stack`이 별도로 생성한다(`project/ADR-101-stack-selection.md` — 본 skill 책임 아님).
   - **ADR-100 작성 시 `docs/90-decisions/project/README.md` 인덱스 표에 한 줄 추가** (인덱스 표 컬럼 양식은 `docs/90-decisions/project/README.md` 본문 표 헤더가 SSOT — _ADR_GUIDE.md "새 ADR 추가 절차" §2 정합).
6. workitem 문서(milestone/feature)는 만들지 않는다 — 마일스톤 생성은 `/plan-milestone` 단일 경로다(ADR-057 결정 1). 종료 출력에서 안내한다.

반드시 지켜야 할 원칙:
- 추측은 사실처럼 쓰지 말고 가정으로 표시한다.
- 스택이 명시되지 않았다면 stack-specific 자동화는 만들지 않는다.
- hooks, CI, lint/test 스크립트는 스택이 명확할 때만 추가한다.
- 상위 문서와 하위 문서의 역할을 섞지 않는다.
- 꼭 필요한 초기 파일만 만든다.

마지막 출력:
- 갱신한 파일 목록
- 핵심 가정
- 남은 미결정 사항 (결정 아닌 품질·형식 지적 — 기존 슬롯 유지)
- **원장 요약**: `closed N건 / deferred M건 / open K건`. open이 있으면 각 항목의 `authority`·필요 시점을 1줄씩 (본문은 `docs/10-charter/DECISION_REGISTER.md`)
- 후속 단계 ([WORKFLOW.md "스킬 종료 시 후속 단계 출력 contract"](../../../docs/00-meta/WORKFLOW.md) 양식 정합 — PROJECT_START_CHECKLIST 의 `/bootstrap-project → /bootstrap-stack → /stack-guard → /bootstrap-design(UI) → /plan-milestone → /plan-workitem` 순서가 SSOT):
  - 기본 권장: `/bootstrap-stack <스택 요약>` (스택 미정이면 **무입력**으로 실행 → 리서치+라운드 추천) — 스택 확정이 후속 lifecycle 의 전제 (스택 미정 상태에서 plan 은 가짜 작업).
  - 분기 옵션 (해당 시 ≤3):
    - 스택이 이미 brief/charter 에 명시됐고 `/bootstrap-stack` + `/stack-guard` 도 끝났다면: `/plan-milestone` — 첫 마일스톤(M1)과 feature 문서를 라운드 협상으로 생성 (ADR-057)
    - UI 프로젝트 + 스택 확정 후: `/bootstrap-design` 다음 `/plan-milestone`
    - 기획 신뢰도 재확인 원하면: 다른 세션에서 `/validate-discovery --reviewer-tag <tag>` 후 원본에서 `/repair-discovery`
  - 프롬프트 동봉 권장:
    - charter `## 5. 비목표` 의 핵심 키워드 (다음 plan 라운드의 scope 가드 입력)
    - DISCOVERY.md `## 12. Assumption Tracker` 의 *미검증* 가정 중 우선 검증 대상 (있으면)
    - 원장의 `status: open` 항목 ID 목록 (사용자가 다음 skill 발화 전 결정해야 할 항목 — 본문은 `docs/10-charter/DECISION_REGISTER.md`)

## 고-stakes 설계 게이트 (ADR-053)
설계 결정이 ADR-053 게이트(S1~S4 중 1+ → full 패널 / S5만 → 리서치-only / 전부 NO → 단발)면, architect 단발 대신: ① researcher 웹 패스(must-or-flag, 오프라인 `Needs Research`) → ② architect 다각도 2~3안 → ③(최상위만) 두 번째 architect 적대 검토(review-doc 미사용·parallel-merge 금지) → **④ 사용자 선택 — ②의 안을 Decision Brief 6블록으로 제시하고 사용자가 고른다(ADR-053#amend-2 / ADR-060 D3)** → ⑤ ARCHITECTURE §7 결정 블록 기록 + 원장 `closed` 등재. 저-stakes는 현행 단발. **S1~S4는 *분석 깊이* 판정이고 *누가 결정하는가*는 원장의 `authority`가 소유한다** — `agent-delegated`로 배정된 결정은 ④를 건너뛰고 라운드 종료 시 일괄 확인 1회에 포함한다. (Codex: 순차 단일 degrade — researcher 인라인/사전 노트.)

## 결정 마감 (ADR-060)
본 skill이 내리거나 발견하는 기획 결정 중 **사용자가 정하거나 승인해야 할 것**을 `docs/10-charter/DECISION_REGISTER.md`에 등재한다 — 대화 출력으로만 두지 않는다.

1. **등재 시점에 `authority`를 확정한다** (ADR-060 D2): 제품 의도·범위·우선순위·사용자 체감·외부 계약·데이터/보안·비용·위험 허용도·비가역 약속 → `user-choice`. 스택·인증·데이터 경계·되돌리기 비싼 구조 → `user-approval`. 승인된 경계 안의 가역적 내부 선택 → `agent-delegated`. **`user-*`를 `agent-delegated`로 낮추려면 사용자 명시 승인 + 항목에 이력 줄이 필요하다.**
2. **등재 범위 (원장을 얇게 유지)**: `user-*` 결정 전부 + 종류 불문 `open`/`deferred`로 남는 항목만 등재한다. **`agent-delegated`는 개별 등재하지 않고** 4의 일괄 확인으로만 처리한다. **코드 품질·형식 지적과 계획 결함은 원장 대상이 아니다** — 기존 `남은 미결정 사항` 출력 슬롯이 그대로 소유한다.
3. **`user-*` 결정은 Decision Brief 6블록으로 제시한다** (ADR-060 D3 / ADR-046#amend-1 — 압축 예외): 배경(왜 지금) → 용어(배경 없이도 이해되게) → 선택지 2~3안(각각 한 줄 요약·이 프로젝트에서의 체감·장점·감수할 것) → 되돌리기 비용 → 추천+근거 → 답변 방법. **라운드당 3~5개 상한**, `skip` 불허(선택 / 추가 설명 / 리서치 요청 / 연기 중 택1). 답변은 평이한 문장으로 재진술해 확인한 뒤 정본에 기록한다.
4. **라운드 종료 시 일괄 확인 1회**: 그 라운드의 `agent-delegated` 결정을 목록으로 제시하고 "바꿀 것 있으면 알려달라"를 1회 확인받는다. 사용자가 뒤집으면 그 항목은 `user-approval`로 원장에 등재한다.
5. **닫히지 않은 항목**: 현재 M 무영향 + 이관 앵커 + 회수 시점 3개를 모두 갖추면 `deferred`, 아니면 `open`으로 남긴다(ADR-060 D4). **앵커 없는 유예는 금지**한다. 현재 M을 막는 사실 조사는 `deferred`가 아니라 `/research-pack` 선행으로 종결한다.
6. 결정 *본문*은 **본 skill이 소유한 정본 문서**(DISCOVERY / Charter / ARCHITECTURE / DESIGN / ADR 중 해당 단계에 존재하는 것)에 쓰고, 원장에는 위치 앵커와 처분 상태만 적는다(ADR-005). 본 skill이 소유하지 않는 문서는 건드리지 않는다.
7. **마일스톤이 아직 없는 단계**(discover/bootstrap)에서는 `영향: (미할당)`으로 등재한다. `/plan-milestone` R1이 triage한다.

## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 ADR/architecture 섹션은 task 본문에서 발화 시 인용 — 사전 fork-load 금지.
