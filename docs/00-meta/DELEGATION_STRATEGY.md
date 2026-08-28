# Delegation Strategy

> 모드: Reference (위임 트리거 + 메인 세션 역할)

## 목적
이 저장소는 메인 세션이 모든 작업을 직접 처리하는 방식보다,
메인 세션이 오케스트레이션을 담당하고 서브에이전트가 실제 작업을 수행하는 방식을 우선한다.

## 메인 세션의 역할
- 현재 목표와 우선순위를 정리한다
- 관련 workitem과 상위 문서를 확인한다
- 적절한 서브에이전트에 작업을 위임한다
- 돌아온 결과를 통합하고 다음 결정을 내린다
- 위임한 서브에이전트가 구조화 최종 반환 없이 멈추면 1회 재개한다. 그래도 미반환이면: **파일 생성 에이전트(builder)** 는 그 slice가 건드린 파일을 직접 확인해 회수; **report-only 감사자(validator/qa/reviewer — 산출 파일 없음)** 는 재실행 → 안 되면 다른 감사자에 재위임하거나 메인이 그 축을 직접 감사 → 그래도 불가하면 `감사 미완(unavailable): <축>`을 명시 기록한다("결과 없음"을 조용히 통과 금지 — ADR-051#amend-4)
- 긴 로그, 장문의 탐색 결과, 세부 구현 과정을 메인 컨텍스트에 오래 보존하지 않는다

## 서브에이전트 우선 원칙
다음 작업은 가능하면 메인 세션이 직접 하지 않고 서브에이전트에 먼저 위임한다.
- 대량 코드/문서 탐색
- 특정 task 구현
- 문서 리뷰
- QA 및 회귀 위험 검토
- 중요한 설계/아키텍처 판단

## 위임 트리거

| 상황 | 우선 위임 대상 | 비고 |
|------|---------------|------|
| task 문서가 존재하는 구현 작업 | builder | 범위 밖 변경 금지 |
| 구현 완료 후 범위 검증 | validator | **단위**: workitem 단위 / **종류**: 판정 + report 전용 / **제약**: 코드·문서 수정 금지 (ADR-007). AC ↔ 검증 매핑(modality별 증거 판정 — ADR-065), 문서 범위 정합. |
| 중요한 설계 변경, 큰 tradeoff, 상위 아키텍처 수정 | architect | 비용이 크므로 일상 작업에는 사용하지 않음 |
| 시각/UX 디자인 authoring (레퍼런스 분해·원칙·concept 시안·마일스톤 프로토타입) | designer | **생성 전담** — 감사·비평은 reviewer(design surface). 취향 추천 금지(오라클=사용자). /bootstrap-design R0~R2·plan-milestone R5가 호출 (ADR-058). Codex: 메인이 designer.md 인라인 수행. |
| 요구사항 정리, workitem 분해 | planner | 아키텍처 결정은 architect로 |
| 문서/코드의 모순·누락·숨은 복잡도 검토 | reviewer | **단위**: 코드·문서 단위 / **종류**: 구조적 모순 + 숨은 복잡도 + 정책 drift / **제약**: 수정 권장만, 직접 수정 X. Clean Code 6항목 (ADR-006). |
| 구현 후 회귀 위험·엣지 케이스 점검 | qa | **단위**: milestone / user-flow 단위 / **종류**: 회귀 + 엣지 케이스 + 사용자 위험 / **제약**: 보고만, Write 권한 없음 (stabilize-milestone이 받아 적음). |
| 독립적인 여러 task 동시 처리 | 병렬 패턴 3종 (아래 단락 참조) | 가벼운 → 무거운 순으로 선택 |
| `/plan-workitem` 산출물의 cross-LLM peer review (opt-in) | reviewer (plan surface, Plan Quality 12 차원) | 다른 세션 (Claude 새 창 / Codex 등)에서 `$validate-plan` or `/validate-plan` 호출. 임시 리뷰 파일 1개만 작성, workitem 문서 수정 X (ADR-038). |
| Cross-review 결과 회수 + workitem 문서 수정 | planner | 원본 plan 세션에서 `/repair-plan`. 임시 리뷰 파일 회수 → 결정 → 적용 → 파일 삭제 (ADR-038). |
| DISCOVERY(기획)의 cross-LLM peer review (opt-in) | reviewer (discovery surface, Discovery Quality 8 차원) | 다른 세션에서 `/validate-discovery`. 임시 리뷰 파일 1개, DISCOVERY/charter 수정 X (ADR-044). |
| 기획 cross-review 결과 회수 + DISCOVERY 수정 | architect | 원본 세션에서 `/repair-discovery`. 리뷰 회수 → 결정 → DISCOVERY 수정 → 파일 삭제 (ADR-044). |
| 마일스톤 stabilize 결과의 cross-LLM peer review (opt-in) | reviewer/qa (stabilize surface — qa 엣지케이스·회귀 + reviewer 부채) | 다른 세션·다른 LLM에서 `/validate-milestone`. 임시 리뷰 파일 1개, 코드·문서·실행 X (ADR-054). |
| stabilize cross-review 결과 회수 + 종합 | 메인 세션 (repair-milestone) | 원본 세션에서 `/repair-milestone`. stabilize-reviews 회수 → 4-판정·dedup → 적용 → 삭제 (ADR-054). **per-task 결함도 직접 고친다 — 재개방하지 않는다**(ADR-068 D1). 추적은 `IMPROVEMENT_GUIDE ## 5`의 `affected`·`files`·`scope` 세 필드가 담당한다. |
| 마일스톤 결과의 사용자 직접 확인 (관측 AC 0건이면 권장·선택 / 1건 이상이면 사실상 필수) | 메인 세션 (accept-milestone) | `/accept-milestone <M>`. 마일스톤 단위만 — task 스코프 없음. 환경 기동 + 시나리오 안내 + 피드백 3갈래 라우팅(계약 변경 → ROADMAP `## Backlog`). 코드·커밋 X. `- ac-acceptance` receipt는 사용자 응답을 옮겨 적는다(대행 발급 금지 — ADR-065 D1 / ADR-066). 미발급 상태는 졸업 `PENDING_ACCEPTANCE`가 잡는다 (ADR-068 D4) |
| task AC의 사용자·플랫폼 관측 receipt 발급 | 메인 세션 (accept-milestone — 마일스톤 스코프) | 별도 위임 경로가 아니다. `/validate-workitem`이 그 task를 `Pending Acceptance`로 내면 `/finalize-workitem`이 통과시키고 `## 8`에 `- ac-pending`을 남긴다. receipt는 마일스톤 수용 라운드(`/accept-milestone <M>`)에서 일괄 발급된다. 미발급 상태는 졸업 `PENDING_ACCEPTANCE`가 잡는다 (ADR-065 D1/D6 · ADR-066 D1 · ADR-068 D3) |
| 사용자 수용 finding 수리 | 메인 세션 (repair-acceptance) | `/repair-acceptance <M>`. 3+1 판정(Reject-FP 없음 — 사용자 관측은 기각 대상 아님), 회귀 테스트 Red→Green 선행, **scope와 무관하게 직접 수정**(재개방 없음 — ADR-068 D1). `out-of-AC`는 계약 부채 등재. 후속 연쇄 없음. 커밋 X (ADR-066 D4) |
| 외부 공식문서·1차 자료·논문 조사 (구현/기획) | researcher | report-only(코드·문서 미수정). 결과는 insights/ 노트 + DISCOVERY Evidence Log 연결. `/research-pack` 또는 메인이 Agent 위임. **Standing auto-trigger (ADR-040#amend-2)**: 메인 세션 오케스트레이터 중 `Agent` 도구 보유 skill(implement foreman / plan-milestone)는 sub-agent가 `Needs Research`를 emit하면 researcher에 **Agent로 자동 위임**→findings 주입→재개한다(`/research-pack` 호출 아님 — disable-model-invocation). Codex: `Agent` 도구는 Claude 전용이고 본 저장소가 researcher 위임을 Codex subagent로 아직 매핑하지 않아 → foreman(메인 세션)이 `researcher.md` 인라인 조사 또는 사전 `$research-pack` 노트 참조로 재개(degrade). **디자인 레퍼런스 모드 (ADR-040#amend-4)**: /bootstrap-design R0가 레퍼런스별 코드 수준 토큰 추출(소스 위계 ①사용자 URL ②오픈소스 토큰 패키지 ③정성 소스)을 본 모드로 위임한다. |
| 법률·규제 판단 (관할별 규제, 처리방침·약관 요건, 라이선스 호환성) | counsel | `/consult-expert legal <관할> <질문>`. **관할 필수** — 없으면 되묻고 종료. 1차 출처 조회 기반(기억 인용 금지), 신뢰 등급 분류(`확인됨-조문`/`확인됨-가이드`/`해석필요`/`전문가검토권장`/`전문가검토필수`), 변호사 필요 구간 명시. report-only (ADR-062) |
| 사업 전략 판단 (수익 구조·가격·유닛 이코노믹스·시장 규모·경쟁 포지셔닝) | strategist | `/consult-expert strategy <질문>`. 수치는 인수 분해 + 출처 등급 필수, 자기반박 1개 필수. 가격 *표현*은 marketer 소유. report-only (ADR-062) |
| 제품 표면 마케팅 (포지셔닝·랜딩/가격 카피·SEO 구조·제품 발송 이메일) | marketer | `/consult-expert marketing <표면> <질문>`. **광고·채널 운영·PR·콘텐츠 발행은 범위 밖.** DESIGN.md `## 10` voice 준수(정의는 designer 소유). report-only (ADR-062) |
| 데이터 계측 설계 + 수집 데이터 해석 | analyst | `/consult-expert data <측정 대상>`. `/plan-milestone` **R4** 가 `## 8-1` 계측 필드를 채울 근거가 없으면 `Needs Instrumentation` 으로 **자동 위임**. n·편향·confidence 기준 필수. 도구 설치 X (ADR-062 D10 / ADR-042#amend-2) |
| 설계층 보안 (위협 모델·보호 등급·인증/인가 경계) | security | `/consult-expert security <대상 자산>`. **코드 취약점 스캔·secret 검출은 범위 밖** — 전자는 **보일러플레이트 미소유**(도구 빌트인·프로젝트 SAST), 후자는 `/stack-guard` 의 scanner 권장(ADR-021#amend-1)·추적 시크릿 점검(ADR-059 D9). 위협 표 전 칸(**잔여 위험 + 근거 URL·확인일 포함**) 필수. 구조 결정은 architect 소유. report-only (ADR-062) |
| 장문 코드/문서 탐색 | Explore 등 built-in subagent | 선택적 사용. 메인 컨텍스트 오염 방지 |
| 확정된 상위 정본의 절 단위 부분 개정 | 메인 세션 (amend-ssot) | `/amend-ssot "<변경>" [--from <출처>] [--dry-run]`. 사용자 호출 전용 — 다른 skill·agent는 `Needs SSOT Amendment: <문서/절/근거>` 제안만 만든다. 발굴·재생성 라운드는 하지 않고 foundation 변경은 heavy skill로 라우팅 (ADR-069) |

> **실행 컨텍스트 노트 (ADR-050)**: 본 표의 agent 매핑은 *책임 경계 정의*다(ADR-007#amend-2). 일부 lifecycle skill(validate-workitem/repair-workitem 등)은 이제 메인 세션에서 실행되지만(ADR-050) **같은 책임 경계**를 따른다 — 메인 세션이 그 경계대로 직접 수행하거나, 같은 역할의 agent를 `Agent`로 직접 fork 위임할 수 있다. `.claude/agents/*.md` persona 파일은 그대로 존재한다.
> **검증 위임 규율 (ADR-050#amend-1)**: 검증/감사(validator·reviewer·qa)를 위임할 때, 일 시키는 쪽은 검증자에게 *무엇을 지적하지 말라*고 미리 말하거나 *심각도를 미리 정해* 주지 않는다(자기검증 편향 차단). 계획·구현과 충돌하는 발견은 숨기지 말고 사람에게 올린다. 단 *지켜야 할 기준·계약*(AC·승인 프로토타입·DESIGN 토큰·seam INV 등)을 그대로 전달하는 것은 필수 맥락이지 사전판정이 아니다 — 이 선을 지킨다.
> **도메인 자문 규율 (ADR-062)**: 위 도메인 agent 5종은 *계획 이전* 단계의 자문이다 — 구현 결과를 감사하지 않는다(감사는 validator/reviewer/qa 소유). **종속 도메인은 순차**로 부르고(입력을 만드는 쪽 먼저) **서로 독립인 도메인은 병렬 가능**하다 — agent 간 직접 통신이 금지돼 조율 오버헤드가 생길 자리가 없다. 단 한 라운드에 사용자에게 제시하는 결정은 **3~5개 상한**(ADR-060 D3)을 지킨다. 도메인 A 의 결론은 정본 문서·원장에 기록된 뒤에야 B 가 읽는다(agent 간 직접 통신 금지). 남의 소유 사실을 고쳐야 하면 `재자문 필요: <도메인>` 을 반환하고 사용자가 결정한다.

## 메인 세션에서 유지할 정보
- 현재 milestone / feature / task
- 최근 결정 사항
- 다음 액션
- 남은 리스크와 열린 질문

## 메인 세션에서 최소화할 정보
- 긴 로그 전문
- 대량 파일 탐색 결과
- 하위 task의 세부 시행착오
- 이미 끝난 서브에이전트의 긴 reasoning 흔적

## 기본 실행 흐름
1. 메인이 현재 workitem을 식별한다
2. 관련 상위 문서를 확인한다
3. 적절한 서브에이전트에 위임한다
4. 서브에이전트는 결과를 짧게 요약해 반환한다
5. 메인은 결과를 반영하고 다음 작업을 정한다

## 병렬 작업 원칙
- 서로 독립적인 작업은 아래 "병렬 패턴 3종" 중 작업의 독립성·격리 필요성에 맞는 패턴을 선택한다
- 같은 파일을 크게 건드리는 작업은 동시에 병렬화하지 않는다
- background 작업은 애매하거나 추가 질문이 필요한 작업보다, 독립적이고 경계가 명확한 작업에 사용한다

## 병렬 패턴 3종

가벼운 순으로 정리한다. 작업의 독립성과 격리 필요성에 맞춰 선택한다.

| # | 패턴 | 설명 | 적합한 작업 |
|---|------|------|-------------|
| 1 | 한 turn에 독립 sub-agent 다중 호출 | 메인이 한 turn에 sub-agent 도구를 여러 번 호출 (Claude: Agent tool). Codex는 wrapper skill로 같은 본문을 실행하지만 sub-agent / 병렬 위임 parity는 도구별 다름 — [boilerplate/ADR-010](../90-decisions/boilerplate/ADR-010-multi-agent-compatibility.md) 매핑 참조. 결과만 통합. | 일상 위임의 기본. 독립적인 짧은 sub-agent 작업 여러 개. |
| 2 | 격리 git worktree 분기 단일 호출 | sub-agent 호출 시 격리 git worktree 지정 (도구별 지원은 [boilerplate/ADR-010](../90-decisions/boilerplate/ADR-010-multi-agent-compatibility.md) 매핑 표 참조). 변경 없으면 자동 cleanup, 있으면 worktree 경로·브랜치를 결과에 포함. | 같은 파일 충돌 가능성 있는 단일 작업. |
| 3 | 도구별 bundled batch | Claude Code: 공식 `/batch` skill. Codex: 동등 기능 미지원 (자연어 분기). 사용자가 직접 발화. 작업 단위당 background agent + worktree 자동 생성. | 큰 마이그레이션·codebase-wide 변경 같은 코드 단위 분리가 분명한 큰 작업. |

선택 기준 — 가벼운 병렬: 1, 같은 파일 충돌 가능성 있는 단일 작업: 2, 작업 단위가 분명한 codebase-wide 분산 작업: 3.

도구별 bundled batch 지원은 Claude Code의 `/batch`가 유일한 1차 출처다 (Codex 동등 기능 도입 시 본 단락 갱신). 도구별 매핑 SSOT는 [boilerplate/ADR-010](../90-decisions/boilerplate/ADR-010-multi-agent-compatibility.md).

## 중요 원칙
- 중요한 기획/설계는 `architect` agent를 우선 사용한다 (모델 매핑은 agent frontmatter — Claude는 Opus, 다른 도구는 [boilerplate/ADR-010](../90-decisions/boilerplate/ADR-010-multi-agent-compatibility.md) 매핑 표 참조).
- 일반 구현과 검증은 `builder` / `validator` agent로 우선 처리한다 (Claude는 Sonnet 매핑).
- 자동 위임을 기대하되, 중요한 작업은 명시적으로 에이전트를 지정한다.

## 스킬 실행 순서 가이드

일반적인 프로젝트 진행에서의 추천 스킬 순서:

1. `/bootstrap-project` → charter + architecture + ADR-100 (workitem 생성 X — ADR-057)
2. `/bootstrap-stack` → 스택 확정 후 자동화 설계
3. `/plan-milestone` → (M1 포함) milestone + feature 문서 생성 → **M/F `contract-ready`** (+UI: R5 프로토타입 라운드) / `/plan-workitem M<N>` → 마일스톤 전체 계획 스냅샷 1회, task는 전부 `draft` (ADR-057#amend-3 / ADR-060 D6)
3a. (선택) `/validate-plan <workitem-id>` — 다른 세션·다른 LLM에서 cross-review. 임시 파일 작성 (ADR-038).
3b. (선택) `/repair-plan <workitem-id>` — 원본 plan 세션에서 임시 파일 회수 + 적용 + 삭제. **M이 `contract-ready`면 상위 계약 결함도 이 시점에 수정** (ADR-060 D6).
3c. **`/seal-milestone M<N>`** → 최종 검사 + 사용자 승인 + task→feature→milestone 일괄 `ready` 봉인 (ADR-060 D7). 봉인 전에는 4가 착수하지 않는다.
4. `/implement-workitem` → task 구현
5. `/validate-workitem` → 판정 + report 기록
5.5. validate 판정은 `Pass | Pending Acceptance | Needs Fix` 셋이다(ADR-065 D6). **`Pending Acceptance`(관측 AC receipt만 미발급)는 6을 건너뛰고 바로 7로 간다** — finalize가 통과시키고 task `## 8`에 `- ac-pending`을 남긴다. 그 receipt는 마일스톤 수용 라운드에서 발급되고, 미발급 상태는 졸업 `PENDING_ACCEPTANCE`가 잡는다 (ADR-066 D1 / ADR-068 D3 item 4).
6. `/repair-workitem` (`Needs Fix`일 때만) → report의 실패 항목 수정
7. `/finalize-workitem` (`Pass` 또는 `Pending Acceptance`일 때) → status `done` 갱신 + 명시적 파일 add + Conventional Commits 커밋 (정책: [ADR-007](../90-decisions/boilerplate/ADR-007-workitem-lifecycle.md), [ADR-008](../90-decisions/boilerplate/ADR-008-commit-convention.md)) + feature 전 task done 시 FAC closure 요약(ADR-057 결정 5)
7.5. task가 done이면 finalize가 커밋하고 다음 의존성 task(implement) 또는 마일스톤 전 task done 시 `/stabilize-milestone M-N`을 제안한다 (feature refresh 없음 — ADR-057#amend-3).
8. 마일스톤의 모든 task가 `done`이 되면 **그 마일스톤은 «마일스톤 층»이다** — task 문서·task status·validation report는 불변이고(**예외는 `## 8`의 AC receipt 2종** — `- ac-acceptance`·`- invalidated`) 네 inner-loop skill을 호출하지 않는다(ADR-068 D1). `/stabilize-milestone`으로 통합 점검(코드 수정·커밋·status 변경 금지).
   - `/stabilize-milestone`은 evaluator-optimizer pattern의 evaluator orchestration이다 (ADR-068 D8) — generator=`/implement-workitem`, optimizer=`/repair-milestone`.
8.5. `/accept-milestone M-N` — 사람이 직접 실행·확인. **8의 graduation이 `PENDING_ACCEPTANCE`면 이 단계가 유일한 처방이고, `YES`면 선택이다** (ADR-068 D4/D8). 승인 시 8.7로(단 `(수용)` 태그로 이번 M 수리를 택한 개선 제안이 있으면 8.6을 먼저 — ADR-066 D5), 보류 시 8.6으로, `미완`이면 환경 복구·사용자 재개 후 8.5 재실행(라운드 카운터 미소모).
8.6. (보류 시 · 또는 위 `(수용)` 개선 항목이 있을 때) `/repair-acceptance M-N` → **재개방 없이 직접 고치고 회귀 테스트(Red→Green)를 통합 `validate`에 묶는다**(ADR-068 D6). `- invalidated`가 있으면 `/accept-milestone M-N` 재실행. 라운드 상한 3.
8.7. `/stabilize-milestone M-N` 재실행 — 수리·receipt 변경을 재검증하고 졸업 판정을 확정한다. **사용자가 돌릴 `/validate-workitem`·`/finalize-workitem`은 없다** (ADR-068 D1).

각 단계에서 중요한 설계 판단이 필요하면 architect를 먼저 사용한다.
문서 품질이 걱정되면 `/review-doc` 또는 reviewer를 사이에 끼운다.

**review-doc vs stabilize 분담 (사용 타이밍)**: `/review-doc`은 *단일 문서 on-demand 심층 비평* — 핵심 문서(charter/ARCHITECTURE/큰 ADR)를 새로 쓰거나 크게 고친 직후, *전파되기 전에* 쓴다. *repo-wide cross-doc 정합*(링크·ADR-ref·FAC↔AC·모드라벨)은 `/stabilize-milestone` deterministic preflight가 매 마일스톤 자동 수행 — review-doc을 `--all`로 확장하지 않는다(stabilize 책임).

**스킬 자동 호출 (ADR-050)** — task 실행 inner-loop(implement/validate/repair/finalize-workitem)는 model-invocable이라 메인 세션이 "다음 액션 추천"을 직접 실행할 수 있다. 그 외 skill(bootstrap/plan/stabilize·cross-session 리뷰)은 텍스트 제안일 뿐이며 사용자/메인의 명시 발화로 진행한다.

<a id="delegation-midproject"></a>
## Mid-project 문서 갱신 동선

charter/architecture는 Living Doc로 분류돼 진행 중 재진입이 필요하다. 갱신 종류에 따라 아래 경로를 따른다.

| 갱신 종류 | 경로 |
|----------|------|
| **정본의 절 단위 부분 개정** (charter 한 절·ARCH 시스템 경계·DESIGN 토큰 등 — 답을 이미 알고 문장만 넣으면 되는 변경) | **`/amend-ssot "<변경>"`** — 분류·authority 판정·파생 전파·봉인 충돌 검사를 한 번에 수행 (ADR-069) |
| charter 전면 재정의 (문제 정의 자체가 바뀜) | `/discover-product --update` 재실행(또는 산출물만 갱신) → `/bootstrap-project --apply`로 charter 재생성 |
| 페르소나 교체·pain 재발굴 | `/discover-product --update` |
| architecture 스택 변경 (T2 — 언어/런타임/프레임워크/DB/인증 등 토대 변경, ADR-055) | `/bootstrap-stack --migrate` (타깃 미정이면 DEEP 라운드로 수렴) 후 `/stack-guard` 이어 실행 |
| 라이브러리 몇 개 추가 (T3 — 토대 미변경) | 해당 마일스톤의 `/plan-workitem M<N>`이 task `## 3` install line-item으로 처리 (ADR-040#amend-1). 누적이 T2 임계를 넘으면 stabilize `[Stack-drift]`가 ADR-101 갱신을 감지 |
| 시각 방향 전환 (concept 시안 재탐색 필요) | `/bootstrap-design --update` |

> 판별 기준은 «위험한가»가 아니라 **«답을 아직 모르고 그것을 찾는 라운드가 필요한가»** 다(ADR-069 D4). 위험 관리는 `/amend-ssot`의 authority 확인·전파 검사·봉인 충돌 검사가 담당한다.

> 주: `/discover-product`, `/stack-guard`는 현재 `.claude/skills/`에 모두 존재한다.

## ADR 작성 트리거 (ADR-000#amend-2 SSOT — 요약 게시)

| 신호 | 작성 주체 | 시점 |
|---|---|---|
| 초기 결정 | /bootstrap-project (ADR-100) · /bootstrap-stack (ADR-101) | 즉시 |
| T2 스택 변경 | /bootstrap-stack --migrate (ADR-1NN) | 계약 시점 |
| 고-stakes 설계 (ADR-053 게이트) | 라운드 운전 skill → architect sub-call 초안 | 결정 확정 시점 |
| stabilize ADR 후보 (validator는 P1-finding 경로 — ADR-000 결정 2) | IMPROVEMENT_GUIDE `[ADR-candidate]` → 다음 /plan-milestone R0 회수·작성 | 다음 plan 라운드 |
| 수동 결정 (MCP 등) | 사용자 | — |

## 모델 표기 정책

shared 도구 설정 파일(`.claude/settings.json` · `.codex/config.toml`)에는 모델·추론 강도 키를 두지 않는다 — 사용자 계층과 계정·CLI 기본값이 승계한다 (ADR-004#amend-2·#amend-3).
별칭(`sonnet`, `opus`, `haiku`)은 역할별 고정이 필요한 `.claude/agents/<name>.md` frontmatter `model:`에서만 쓴다. 전체 버전 ID 금지는 불변.
특정 버전·강도를 강제해야 하면 ADR로 남기고 그 자리에서만 고정한다.
정책 근거는 [ADR-004-model-alias-policy.md](../90-decisions/boilerplate/ADR-004-model-alias-policy.md)를 참조한다.

메인 세션 오케스트레이션(foreman·fan-out·wave 제거) 정책은 [ADR-051](../90-decisions/boilerplate/ADR-051-main-session-orchestration-and-wave-removal.md) 참조.
