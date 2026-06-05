---
name: bootstrap-project
description: Convert discovery output (DISCOVERY.md) or a natural-language brief into charter/architecture/M1/F-001. Re-run safe with update mode.
argument-hint: "[project brief or empty (uses DISCOVERY.md)] [--apply]"
disable-model-invocation: true
allowed-tools: Read Glob Grep Write Edit Agent
context-pack: minimal
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
- `docs/30-workitems/_templates/MILESTONE_TEMPLATE.md` (M1 생성 시 양식 SSOT — graduation checklist 5+1 / `## 8. 회고` 자동 채움 자리)
- `docs/30-workitems/_templates/FEATURE_TEMPLATE.md` (F-001 생성 시 양식 SSOT — `## 0-1. Type` / 12 main sections / `## 7-1. FAC ↔ AC 매핑표` subsection)
- `docs/90-decisions/boilerplate/_ADR_GUIDE.md` (ADR-100 작성 시 권장 섹션·area 태그·Mutation Contract 규약)
- `docs/90-decisions/project/README.md` (project ADR 인덱스 — ADR-100 추가 후 한 줄 갱신 대상)
- `brief-template.md`
- `output-checklist.md`
- `examples/career-saas-example.md`

반드시 수행할 일:
1. 입력 회수 — DISCOVERY.md 또는 자연어 입력.
2. 기존 산출물(charter/architecture/M1/F-001) 존재 여부 점검.
   - 없으면 새로 생성.
   - 있으면 **갱신 모드** — 본 skill은 메인 세션에서 실행된다. 기존 산출물 덮어쓰기는 사고 방지를 위해 명시적 승인(`--apply` 또는 사용자 확인)을 요구한다.
     - `--apply` 인자가 있으면: 기존 산출물을 읽고 architect로 갱신본을 생성해 즉시 반영한다.
     - `--apply` 인자가 없으면: 기존 산출물을 읽고 갱신 제안 diff를 출력에만 표시하고 **종료**한다(파일 수정 없음). 사용자가 검토 후 `/bootstrap-project --apply ...`로 재실행하거나, 메인 세션에서 architect를 직접 호출해 부분 반영한다.
3. 메인 세션이 본 절차를 직접 운전한다(discover-product·bootstrap-design 패턴). 무거운 아키텍처 추론(charter 구조화·ARCHITECTURE 결정·ADR-100 초안)은 `Agent` 도구로 **architect 단발 sub-call**에 위임하고, 반환된 결론을 본 skill이 파일에 반영한다(architect agent의 `model: opus`가 추론 품질을 보장). 종료 후 사용자에게 `/clear` 또는 새 세션 권장.
4. 다음 산출물을 갱신한다.
   - `README.md`
   - `docs/10-charter/PROJECT_CHARTER.md`
   - `docs/20-system/ARCHITECTURE_OVERVIEW.md`
5. 필요하면 다음도 함께 갱신.
   - `docs/20-system/DESIGN.md`는 baseline placeholder (presence: conditional). UI 스택 포함 시 `/bootstrap-design`이 본 파일을 채운다. 비-UI는 fork 직후 본 파일 삭제 (본 skill에서는 갱신 X).
   - `docs/90-decisions/project/ADR-100-initial-project-decisions.md` — bootstrap 단계의 초기 결정 (project ADR은 100+ 번호 — boilerplate/ADR-002는 legacy reserved). _ADR_GUIDE.md 권장 섹션 + Ratchet evidence label 정합. 스택 선택 ADR은 `/bootstrap-stack`이 별도로 생성한다(`project/ADR-101-stack-selection.md` — 본 skill 책임 아님).
   - **ADR-100 작성 시 `docs/90-decisions/project/README.md` 인덱스 표에 한 줄 추가** (인덱스 표 컬럼 양식은 `docs/90-decisions/project/README.md` 본문 표 헤더가 SSOT — _ADR_GUIDE.md "새 ADR 추가 절차" §2 정합).
6. 최초 workitem 문서를 만든다.
   - `docs/30-workitems/milestones/M1-foundation.md`
   - `docs/30-workitems/features/F-001-core-value.md`

반드시 지켜야 할 원칙:
- 추측은 사실처럼 쓰지 말고 가정으로 표시한다.
- 스택이 명시되지 않았다면 stack-specific 자동화는 만들지 않는다.
- hooks, CI, lint/test 스크립트는 스택이 명확할 때만 추가한다.
- 상위 문서와 하위 문서의 역할을 섞지 않는다.
- 꼭 필요한 초기 파일만 만든다.

마지막 출력:
- 갱신한 파일 목록
- 핵심 가정
- 남은 미결정 사항
- 다음 단계 ([WORKFLOW.md "스킬 종료 시 다음 단계 출력 contract"](../../../docs/00-meta/WORKFLOW.md) 양식 정합 — PROJECT_START_CHECKLIST 의 `/bootstrap-project → /bootstrap-stack → /stack-guard → /bootstrap-design(UI) → /plan-workitem` 순서가 SSOT):
  - 기본 권장: `/bootstrap-stack <스택 요약>` (또는 `--recommend` 로 추천 받기) — 스택 확정이 후속 lifecycle 의 전제 (스택 미정 상태에서 plan 은 가짜 작업).
  - 분기 옵션 (해당 시 ≤3):
    - 스택이 이미 brief/charter 에 명시됐고 `/bootstrap-stack` + `/stack-guard` 도 끝났다면: `/plan-workitem M1` — 첫 milestone 의 feature/task 분해
    - UI 프로젝트 + 스택 확정 후: `/bootstrap-design` 다음 `/plan-workitem M1`
    - 기획 신뢰도 재확인 원하면: 다른 세션에서 `/validate-discovery --reviewer-tag <tag>` 후 원본에서 `/repair-discovery`
  - 프롬프트 동봉 권장:
    - charter `## 5. 비목표` 의 핵심 키워드 (다음 plan 라운드의 scope 가드 입력)
    - DISCOVERY.md `## 12. Assumption Tracker` 의 *미검증* 가정 중 우선 검증 대상 (있으면)
    - 남은 미결정 사항 본문 (사용자가 다음 skill 발화 전 결정해야 할 항목)

## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 ADR/architecture 섹션은 task 본문에서 발화 시 인용 — 사전 fork-load 금지.
