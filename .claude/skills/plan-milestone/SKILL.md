---
name: plan-milestone
description: Run a multi-round main-session conversation to author the next milestone(s) (M2+) and their feature docs. Additive — does not re-seed M1; hand off to /plan-workitem for tasks.
argument-hint: "[milestone idea | feature idea]"
disable-model-invocation: true
allowed-tools: Read Glob Grep Write Edit Agent
context-pack: minimal
---

이 skill은 메인 세션이 R0~R4 라운드를 직접 운전해 *다음* 마일스톤(M2+)과 그 feature 문서를 작성하는 절차서다.
`/bootstrap-project`가 seed한 초기 M1/F-001 *이후*의 마일스톤을 다룬다 — **additive 모드**(기존 M1을 재생성·덮어쓰기 하지 않는다). **기존 마일스톤에 *새 feature만* 추가하는 경우도 본 skill(additive)이 담당** (외부 리뷰 반영 — 경계 공백 메움): 예: 진행 중인 M1에 F-00X를 추가할 때 M1 문서는 재생성하지 않고 feature 문서만 새로 작성한 뒤 M1 `## 3. 포함되는 기능`에 링크 한 줄을 추가한다. 그 feature를 *task로 분해*하는 것은 `/plan-workitem`이다(역할 경계 유지).
무거운 추론(R2의 마일스톤 분할 판단)은 `Agent` 도구로 architect를 단발 sub-call로 위임한다.
R0~R4 산출물은 메인 컨텍스트에 누적시키지 않고 milestone/feature 문서에 적재한다.

**패턴 차용** — `discover-product`/`bootstrap-design`와 동일하게 `context: fork`를 명시하지 않아 메인 세션이 라운드를 직접 운전한다. 종료 후 사용자가 `/clear` 또는 새 세션으로 컨텍스트를 정리할 것을 권장한다(라운드 인터랙션이 다음 task 컨텍스트에 잡음).

**Codex**: 병렬 위임 미지원 시 순차 단일 실행으로 degrade — R2의 architect 단발 sub-call은 Codex에서 sub-agent 병렬 parity가 없으므로 메인 세션이 직접 추론한다(품질 보장을 위해 충분히 깊게 사고).

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
  - `## 8. 회고` (목표 달성도·scope creep·핵심 학습) — `/stabilize-milestone`이 채운 내용.
  - `## 5. 완료 기준` 졸업 상태(graduation 미충족 항목이 남아 있으면 carry-over 후보).
  - 직전 마일스톤에서 *stabilize 이월*된 미완 항목(졸업 안 된 task / open finding).
- `docs/40-validation/IMPROVEMENT_GUIDE.md`·`docs/40-validation/QA_FINDINGS.md`의 *open* 항목(특히 P0/P1)을 회수해, 다음 마일스톤이 회수할 부채 후보로 surface(자동 편입 X — 사용자 결정).
- 직전 마일스톤 부재(첫 호출 — M1만 존재)면 R0를 건너뛰고 회고 carry-over는 "없음"으로 표시.

**R1 — 입력 intake (다음 마일스톤의 재료)**
- 다음 입력을 모아 사용자와 정렬한다:
  - 개발자 아이디어(`$ARGUMENTS`).
  - `docs/10-charter/DISCOVERY.md` `## 14. Evidence Log`(새 증거) + `## 15. Insight Backlog`(미반영 insight) + CHARTER(범위/비목표).
  - 사용자 인터뷰·최근 큰 버그 발견·리팩토링 부채(R0의 IMPROVEMENT_GUIDE/QA_FINDINGS 회수분).
- 위 재료를 *다음 마일스톤이 다룰 목표 후보*로 묶어 1~N개 제시. 사용자가 우선순위를 정한다.

**R2 — architect 단발 sub-call: 분할 vs 단일 협상**
- R1의 목표 후보를 *여러 마일스톤으로 쪼갤지, 한 마일스톤으로 묶을지* `Agent`(architect) 단발 sub-call로 판단(스코프 크기·의존·졸업 가능성 기준). (Codex: 병렬 위임 미지원 시 메인 세션이 직접 판단.)
- architect 결론(분할 권고·각 마일스톤 한 줄 목표·feature 후보 목록)을 받아 사용자와 협상한다. 사용자가 분할 구조를 확정할 때까지 반복.
- **고-stakes 설계 게이트 (ADR-053)**: R2 분할에 외부 기술 불확실성이 있으면 ADR-053 리서치-only 게이트(researcher 위임). 분할 자체는 다각도 패널 불요.

**R3 — 마일스톤 문서 authoring (MILESTONE_TEMPLATE에서)**
- 확정된 각 마일스톤을 `docs/30-workitems/_templates/MILESTONE_TEMPLATE.md`를 복사해 `docs/30-workitems/milestones/M<N>-<이름>.md`로 작성한다. `<N>`은 기존 마일스톤 다음 번호(additive — M1 보존).
- `## 5. 완료 기준`은 graduation checklist 5+1 default 그대로 복사(ADR-014). 사용자가 협상한 추가 기준만 "(선택)" 행에 채운다 — 정책 중복 금지(MILESTONE_TEMPLATE·ADR-014가 SSOT).
- `## 8. 회고`는 비워둔다 — `/stabilize-milestone`이 자동 채움(ADR-014).
- `## 6. 관련 문서`에 Charter / Architecture / 관련 ADR 링크를 채운다.

**R4 — feature 문서 authoring (FEATURE_TEMPLATE에서)**
- 각 마일스톤의 feature 후보를 `docs/30-workitems/_templates/FEATURE_TEMPLATE.md`를 복사해 `docs/30-workitems/features/F-<NNN>-<이름>.md`로 작성한다(기존 F-001 다음 번호 — additive).
- `## 0-1. Type`을 채운다(ADR-039). `feature`면 `## 2`를 User Story로, 비-feature(technical-enabler/bugfix/refactor/migration/research-spike)면 기술적 근거 + 서비스하는 DISCOVERY ID·ADR 링크로 채운다(정책은 FEATURE_TEMPLATE 주석·ADR-039가 SSOT).
- `## 3. 핵심 시나리오`(feature가 만족시킬 사용자 시나리오)와 `## 10. 의존성`(feature 간 선후·병렬)을 채운다 — FAC가 추적할 시나리오 + feature 의존 검토의 전제. 이 두 섹션 *신설*은 `/plan-milestone` 책임이다(plan-workitem 아님).
- `## 7. Feature-level Acceptance Criteria`(FAC)를 시나리오 수준 측정 기준으로 채운다.
- `## 7-1. FAC ↔ AC 매핑표`는 **빈 shell만** 둔다(`- FAC-1 →` 등 우변 미채움) — task 분해 시 `/plan-workitem`이 채운다(영속 SSOT, ADR-036/ADR-037). 이 skill은 task를 만들지 않으므로 매핑을 채우지 않는다.
- `## 11. 관련 문서`의 Milestone 링크를 R3 마일스톤으로 채운다. 비해당 스택의 Architecture-Iface/Design 줄은 삭제(placeholder 잔존 금지).

**Evidence/Insight 연결 (ADR-035#amend-2)**: `Type: feature`이고 DISCOVERY `## 15. Insight Backlog`의 insight를 구현하는 feature면 `## 1. 요약`에 `근거 insight: I-N` 한 줄을 박고, 해당 Insight Backlog 행의 `status=planned` + `linked feature` 갱신을 *출력에 권장*한다(이 skill은 DISCOVERY를 직접 수정하지 않음 — `/discover-product --update`가 회수). 근거 insight 없는 즉흥 feature는 출력 "남은 미결정 사항"에 `- 근거 insight 부재: F-NNN — DISCOVERY 회수 권장` 명시. 비-feature 타입은 가정/기회·ADR 링크로 정당화되므로 insight 부재 경고를 내지 않는다.

**단계별 출구 보장**: 어느 라운드에서 멈춰도 그때까지의 산출물(마일스톤 문서·feature 문서)이 `/plan-workitem`의 입력으로 의미가 있다.

**다국어**: 입력 언어를 따른다. 한국어 입력이면 산출물도 한국어, 영문 입력이면 영문.

종료 후:
- 사용자가 `/clear` 권장 — R0~R4 인터랙션이 다음 task 컨텍스트에 잡음.

마지막 출력 ([WORKFLOW.md "스킬 종료 시 다음 단계 출력 contract"](../../../docs/00-meta/WORKFLOW.md) 양식 정합):
- 생성·갱신한 문서 목록(상대 경로 — 마일스톤·feature)
- 마일스톤 ↔ feature 구조 한 줄 요약
- 핵심 가정
- 남은 미결정 사항 (근거 insight 부재 / 부채 회수 후보 포함)
- 다음 단계:
  ```
  다음 단계:
  - 기본 권장: 본 skill이 만든 각 feature마다 `/plan-workitem F-NNN` — feature를 task로 분해 (milestone+feature는 본 skill이 작성 완료; plan-workitem은 feature→task 전용)
  - 분기 옵션 (해당 시 — ≤3 개):
    - 마일스톤 plan 교차검토 원하면: 다른 세션·다른 LLM에서 `/validate-plan <M>`(milestone-plan mode) 후 원본에서 `/repair-plan <M>`
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
