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
| 구현 완료 후 범위 검증 | validator | **단위**: workitem 단위 / **종류**: 판정 + report 전용 / **제약**: 코드·문서 수정 금지 (ADR-007). AC ↔ 테스트 매핑, 문서 범위 정합. |
| 중요한 설계 변경, 큰 tradeoff, 상위 아키텍처 수정 | architect | 비용이 크므로 일상 작업에는 사용하지 않음 |
| 요구사항 정리, workitem 분해 | planner | 아키텍처 결정은 architect로 |
| 문서/코드의 모순·누락·숨은 복잡도 검토 | reviewer | **단위**: 코드·문서 단위 / **종류**: 구조적 모순 + 숨은 복잡도 + 정책 drift / **제약**: 수정 권장만, 직접 수정 X. Clean Code 6항목 (ADR-006). |
| 구현 후 회귀 위험·엣지 케이스 점검 | qa | **단위**: milestone / user-flow 단위 / **종류**: 회귀 + 엣지 케이스 + 사용자 위험 / **제약**: 보고만, Write 권한 없음 (stabilize-milestone이 받아 적음). |
| 독립적인 여러 task 동시 처리 | 병렬 패턴 3종 (아래 단락 참조) | 가벼운 → 무거운 순으로 선택 |
| `/plan-workitem` 산출물의 cross-LLM peer review (opt-in) | reviewer (plan surface, Plan Quality 10 차원) | 다른 세션 (Claude 새 창 / Codex 등)에서 `$validate-plan` or `/validate-plan` 호출. 임시 리뷰 파일 1개만 작성, workitem 문서 수정 X (ADR-038). |
| Cross-review 결과 회수 + workitem 문서 수정 | planner | 원본 plan 세션에서 `/repair-plan`. 임시 리뷰 파일 회수 → 결정 → 적용 → 파일 삭제 (ADR-038). |
| DISCOVERY(기획)의 cross-LLM peer review (opt-in) | reviewer (discovery surface, Discovery Quality 8 차원) | 다른 세션에서 `/validate-discovery`. 임시 리뷰 파일 1개, DISCOVERY/charter 수정 X (ADR-044). |
| 기획 cross-review 결과 회수 + DISCOVERY 수정 | architect | 원본 세션에서 `/repair-discovery`. 리뷰 회수 → 결정 → DISCOVERY 수정 → 파일 삭제 (ADR-044). |
| 외부 공식문서·1차 자료·논문 조사 (구현/기획) | researcher | report-only(코드·문서 미수정). 결과는 insights/ 노트 + DISCOVERY Evidence Log 연결. `/research-pack` 또는 메인이 Agent 위임 (ADR-040). |
| 장문 코드/문서 탐색 | Explore 등 built-in subagent | 선택적 사용. 메인 컨텍스트 오염 방지 |

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

`/plan-workitem` 출력의 wave 그룹은 **본 표의 1·2·3과는 독립 차원**이다. 본 표는 메인 세션이 sub-agent를 한 turn 안에서 어떻게 호출하느냐(orchestration). wave 그룹은 *사용자가 여러 터미널·세션을 띄워 동일 wave의 task를 `/implement-workitem`으로 동시 진행*하는 multi-session 시나리오 (ADR-038).

**Wave 그룹 병렬 실행 권장 패턴** (ADR-038#d6 본문이 SSOT):
- `claude --worktree T-NNN -p "/implement-workitem T-NNN"` — 이름은 `--worktree` 인자로 필수. 미명시 시 자동 이름이 붙어 task-id와 매칭 안 됨. 공식 문서: [worktrees](https://code.claude.com/docs/en/worktrees).
- 단일 working tree 다중 implement 동시 실행 비권장. 외부 리소스 격리는 ADR-038 면책 단락 참조.
- `-p` + `--worktree` non-interactive 조합은 자동 cleanup 안 됨 — 작업 후 `git worktree remove .claude/worktrees/T-NNN` 수동 정리.

도구별 bundled batch 지원은 Claude Code의 `/batch`가 유일한 1차 출처다 (Codex 동등 기능 도입 시 본 단락 갱신). 도구별 매핑 SSOT는 [boilerplate/ADR-010](../90-decisions/boilerplate/ADR-010-multi-agent-compatibility.md).

## 중요 원칙
- 중요한 기획/설계는 `architect` agent를 우선 사용한다 (모델 매핑은 agent frontmatter — Claude는 Opus, 다른 도구는 [boilerplate/ADR-010](../90-decisions/boilerplate/ADR-010-multi-agent-compatibility.md) 매핑 표 참조).
- 일반 구현과 검증은 `builder` / `validator` agent로 우선 처리한다 (Claude는 Sonnet 매핑).
- 자동 위임을 기대하되, 중요한 작업은 명시적으로 에이전트를 지정한다.

## 스킬 실행 순서 가이드

일반적인 프로젝트 진행에서의 추천 스킬 순서:

1. `/bootstrap-project` → charter + architecture + 초기 workitem 생성
2. `/bootstrap-stack` → 스택 확정 후 자동화 설계
3. `/plan-workitem` → milestone/feature/task 분해
3a. (선택) `/validate-plan <workitem-id>` — 다른 세션·다른 LLM에서 cross-review. 임시 파일 작성 (ADR-038).
3b. (선택) `/repair-plan <workitem-id>` — 원본 plan 세션에서 임시 파일 회수 + 적용 + 삭제 (ADR-038).
4. `/implement-workitem` → task 구현
5. `/validate-workitem` → 판정 + report 기록
6. `/repair-workitem` (Needs Fix일 때만) → report의 실패 항목 수정
7. `/finalize-workitem` (Pass일 때) → status `done` 갱신 + 명시적 파일 add + Conventional Commits 커밋 (정책: [ADR-007](../90-decisions/boilerplate/ADR-007-workitem-lifecycle.md), [ADR-008](../90-decisions/boilerplate/ADR-008-commit-convention.md))
8. 마일스톤의 모든 task가 `done`이 되면 `/stabilize-milestone` — 통합 점검(코드 수정·커밋·status 변경 금지). 정책: [ADR-007](../90-decisions/boilerplate/ADR-007-workitem-lifecycle.md).
   - `/stabilize-milestone`은 evaluator-optimizer pattern의 evaluator orchestration이다 (ADR-014#amend-1) — generator=`/implement-workitem`, optimizer=`/repair-workitem`.

각 단계에서 중요한 설계 판단이 필요하면 architect를 먼저 사용한다.
문서 품질이 걱정되면 `/review-doc` 또는 reviewer를 사이에 끼운다.

**review-doc vs stabilize 분담 (사용 타이밍)**: `/review-doc`은 *단일 문서 on-demand 심층 비평* — 핵심 문서(charter/ARCHITECTURE/큰 ADR)를 새로 쓰거나 크게 고친 직후, *전파되기 전에* 쓴다. *repo-wide cross-doc 정합*(링크·ADR-ref·FAC↔AC·모드라벨)은 `/stabilize-milestone` deterministic preflight가 매 마일스톤 자동 수행 — review-doc을 `--all`로 확장하지 않는다(stabilize 책임).

**스킬 자동 호출 아님** — `/validate-workitem`이 출력하는 "다음 액션 추천"은 텍스트 제안일 뿐이다. 사용자 또는 메인 세션이 그 제안을 받아 실제 다음 skill을 발화한다.

<a id="delegation-midproject"></a>
## Mid-project 문서 갱신 동선

charter/architecture는 Living Doc로 분류돼 진행 중 재진입이 필요하다. 별도 skill 없이 다음 경로를 따른다.

| 갱신 종류 | 경로 |
|----------|------|
| charter 부분 갱신 | 자연어로 메인 세션에 변경 요청 → `planner` agent에 fork 위임 |
| charter 전면 재정의 | `/discover-product` 재실행(또는 산출물만 갱신) → `/bootstrap-project`로 charter 재생성 |
| architecture 스택 변경 | `/bootstrap-stack` 재실행 후 `/stack-guard` 이어 실행 |
| architecture 시스템 경계만 갱신 | 자연어 + `architect` 단발 호출 |

> 주: `/discover-product`, `/stack-guard`는 현재 `.claude/skills/`에 모두 존재한다.

## 모델 표기 정책

shared 기본값에서는 모델 별칭(`sonnet`, `opus`, `haiku`)만 사용한다.
특정 버전을 강제해야 하면 ADR로 남기고 그 자리에서만 전체 ID를 사용한다.
정책 근거는 [ADR-004-model-alias-policy.md](../90-decisions/boilerplate/ADR-004-model-alias-policy.md)를 참조한다.
