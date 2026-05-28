---
name: review-doc
description: 문서의 모호함, 누락, 모순, 숨은 복잡도를 비판적으로 검토할 때 사용한다.
argument-hint: "[doc path]"
disable-model-invocation: true
allowed-tools: Read Glob Grep Write Edit
context: fork
agent: reviewer
context-pack: minimal
---

너의 역할은 입력 경로의 문서를 비판적으로 검토하는 것이다.

입력:
- `$ARGUMENTS`에는 검토할 문서의 경로가 들어온다(예: `docs/10-charter/PROJECT_CHARTER.md`).

반드시 먼저 할 일:
1. 입력 경로의 문서를 읽는다.
2. 필요하면 관련 상위/하위 문서를 함께 읽어 맥락을 파악한다.

검토 항목:
- 누락된 요구사항
- 모순된 진술
- 모호하거나 검증 불가능한 표현
- 숨은 복잡도
- 빠진 엣지 케이스
- 본문 내용이 첫 줄의 모드 라벨(`> 모드: ...`)과 정합한지 점검.
- mismatch 발견 시 `docs/40-validation/IMPROVEMENT_GUIDE.md`에 **P1 severity**로 보고.

*아래 항목은 검토 대상 문서가 그 항목의 대상일 때만 적용한다* (review-doc 은 단일 문서 도구 — 예: AGENTS.md 검토 시 길이 점검 / boilerplate README 검토 시 표 점검 / `docs/00-meta/` 문서 검토 시 파일 수 점검. repo 전체 상시 감사는 `/stabilize-milestone` deterministic preflight 책임 — stabilize-milestone SKILL "review-doc 책임 분담" 단락 정합):
- AGENTS.md 길이 점검: 100줄 초과 시 IMPROVEMENT_GUIDE에 P0 severity로 보고. 80~100줄 사이는 P1.
- `docs/90-decisions/boilerplate/README.md`의 *Reserved / Parked / Dropped 번호* 표가 git log의 실제 누락 번호와 일치하는지 점검. 새 dropped 번호 발견 시 P2 보고.
- `docs/90-decisions/boilerplate/README.md` ADR 표의 *Amendments* 컬럼이 각 ADR 본문의 실제 `## Amendment N` 단락과 일치하는지 점검. 누락 발견 시 P1 보고.
- `docs/00-meta/` 파일 수가 ADR-012의 *6개* 원칙과 일치하는지 (`_templates/`는 카운트 제외). 위반 시 P0 보고.
- 검토 대상이 `## Surfaces` 블록을 가진 ADR이면, 등재된 각 surface 파일에 해당 `ADR-NNN` 역참조가 있는지 spot-check. 누락 시 P1 `[Surface-backref]` 보고 (ADR-045#d4).
- reviewer 위임 시 입력에 `review surface: doc` 를 명시한다 (reviewer.md 의 Document Consistency 차원 정합 — Clean Code / Scope Discipline / Document Consistency 3 차원 중 doc surface 선택).

Write 범위 제한 (수정 대상 파일 제한 — frontmatter `allowed-tools` 와 직교):
- frontmatter `allowed-tools` 의 Write/Edit 는 *도구 호출 가능성* 만 정한다 (그래야 IMPROVEMENT_GUIDE 에 기록 가능).
- 본문은 *수정 대상 파일* 을 `docs/40-validation/IMPROVEMENT_GUIDE.md` **단일 파일** 로 제한한다 — 그 외 어떤 파일도 Write/Edit 금지.
- 본문 외 변경이 필요해 보이면 출력에 "후속 task 권장" 텍스트만 남긴다 — `/plan-workitem` 또는 사용자가 후속 발화.
- 위반 발견 시 IMPROVEMENT_GUIDE.md 에 *self-report* (예: `P1 [Self-violation] review-doc edited <file>`) + 다음 라운드 stabilize 가 회수.

마지막 출력:
- 결과를 P0, P1, P2로 나눈다.
- 어떤 섹션을 어떻게 수정하면 좋을지 구체적으로 제안한다.
- 상위 설계 문제와 하위 구현 문제를 구분한다.
- 막연한 칭찬은 하지 않는다.
- 시간/턴이 부족하면 확인된 범위까지의 핵심 판단만 요약하고 종료한다.
- 다음 단계 ([WORKFLOW.md "스킬 종료 시 다음 단계 출력 contract"](../../../docs/00-meta/WORKFLOW.md) 양식 정합):
  - 기본 권장: P0 finding 이 0건이면 후속 skill 없이 종료. P0/P1 이 있으면 검토 대상 문서 종류별 분기.
  - 분기 옵션 (해당 시 ≤3):
    - workitem 문서 (milestone/feature/task) 면: 메인 세션이 `planner` 위임 또는 `/plan-workitem <id>` 로 회수 + 후속 task 박기
    - charter / architecture / ADR 이면: 메인이 `architect` 단발 위임으로 갱신
    - AGENTS.md / 운영 문서이면: 사용자 직접 수정 (Living Doc 갱신)
  - 프롬프트 동봉 권장:
    - 본 review 출력의 P0/P1 finding 라벨 + 라인 위치 (수정자의 컨텍스트 회수용)
    - 본 review 가 *건너뛴 영역* (시간/턴 부족 시) — 다음 라운드 review-doc 호출의 우선순위 입력

## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 ADR/architecture 섹션은 task 본문에서 발화 시 인용 — 사전 fork-load 금지.
