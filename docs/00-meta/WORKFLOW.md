# 워크플로우

> 모드: Reference + How-to (워크플로우 정의 + 단계별 절차)

## 1. 범위 정의
- `docs/10-charter/PROJECT_CHARTER.md`에서 문제, 목표, 비목표, 제약을 정리한다.

## 2. 시스템 설계
- `docs/20-system/ARCHITECTURE_OVERVIEW.md`에서 시스템 구조를 정리한다.
- `docs/20-system/DESIGN.md`는 baseline placeholder(presence: conditional). UI 프로젝트는 `/bootstrap-design`이 본 파일을 채우고, 비-UI 프로젝트는 fork 직후 본 파일을 삭제한다. **삭제 시 `AGENTS.md`의 `[시각 디자인](docs/20-system/DESIGN.md)` 링크 줄도 함께 제거한다**(dangling 방지).
- UI 프로젝트의 `/bootstrap-design` 라운드 구조는 ADR-049(concept-mockup-first): R0(레퍼런스 + `DESIGN_RESEARCH.md`) → R1(원칙) → **R2(DESIGN.md 작성 *전* 다중 concept 시안 — 사용자가 시각 방향 선택)** → R3(토큰)·R4(컴포넌트) → R5(DESIGN.md 저장) → R6(DESIGN.md 파생 preview 최종 확인). **사용자가 R2 concept 방향을 선택하고 R6 preview를 승인한 뒤** concept/preview 시안을 삭제하고 `/plan-workitem`으로 진행 권장 (ADR-049#d29·#d31). DESIGN.md *내용*·인터페이스 할당 SSOT는 ADR-027.
- ARCH `## 7-1`/`## 7-2`/`## 7-3`/`## 7-4` 의 채움/삭제/cross-reference 정책은 [ADR-027](../90-decisions/boilerplate/ADR-027-interface-decision-allocation.md) (ADR-027#amend-1 포함) SSOT.

## 3. 작업 단위 분해
- 마일스톤 단위 목표를 `docs/30-workitems/milestones`에 만든다.
- 기능 단위 문서를 `docs/30-workitems/features`에 만든다.
- 실제 구현 단위 문서를 `docs/30-workitems/tasks`에 만든다.
- **선택**: `/plan-workitem` 직후 plan 품질 cross-validate가 필요하면, 다른 세션·다른 LLM에서 `/validate-plan <workitem-id>` 1+ 회 → 원본 세션에서 `/repair-plan <workitem-id>`로 회수 (ADR-038). opt-in — 건너뛰어도 정상.
- **선택**: `/plan-workitem` 출력의 wave 그룹을 참조해 동일 wave task를 별 worktree에서 동시 `/implement-workitem` 가능. 권장 패턴은 `claude --worktree T-NNN -p "..."` (이름은 `--worktree` 인자로 필수, ADR-038#d6). 단일 working tree 동시 implement는 비권장.

## 4. 구현 및 검증
- 구현은 `/implement-workitem`으로 시작한다.
- 검증은 `/validate-workitem`으로 수행한다 — 판정 + `docs/40-validation/reports/<task-id>.md` 기록.
> Note: validation report(`docs/40-validation/reports/<task-id>.md`)는 `.gitignore`된 **checkout-local 임시 파일**이다(커밋되지 않음). 따라서 `/validate-workitem`과 `/finalize-workitem`은 **같은 worktree/checkout**에서 연속 실행해야 한다 — 다른 worktree에서 나눠 실행하면 finalize가 report를 못 찾아 `Needs Validation`으로 종료한다.
- 검증 실패 시 `/repair-workitem`으로 report의 실패 항목을 수정한다.
- 검증 통과 시 `/finalize-workitem`으로 status `done` 갱신 + 커밋.
- 마일스톤 단위 종합 점검은 `/stabilize-milestone`에서 수행한다.
- 누적 QA 결과는 `docs/40-validation/QA_FINDINGS.md`에 기록한다.
- 개선 제안은 `docs/40-validation/IMPROVEMENT_GUIDE.md`에 정리한다.
- task `## 4-1. 변경 예정 파일/경로`는 implement 중 채운다 — plan 단계에서 미리 채울 의무 없음.

## 4-A. 문서 선갱신 예외

AGENTS.md의 *"상위 문서 없이 하위 문서를 먼저 만들지 않는다"* 규칙은 다음 케이스에서 면제한다.

1. 보안 hotfix
2. 단순 typo / 오타 수정
3. 명시적으로 비목표(charter `## 5`)에 박힌 영역의 긴급 패치

면제 적용 시 해당 task 문서 `## 8. 메모`에 *"상위 문서 후행 갱신 필요 (WORKFLOW 4-A 면제) — <어떤 상위 문서>"* 를 기록한다. `/finalize-workitem`이 이 task 문서를 커밋에 포함하므로 기록이 영속되고, 다음 `/plan-workitem` 또는 `/stabilize-milestone` 라운드에서 이 메모를 회수해 상위 문서 sync용 후속 task로 연결한다.

## 4-1. 마감 (finalize)
- `/finalize-workitem`이 task 문서 status를 `done`으로 갱신한다.
- 명시적 파일 add — `git add -A` / `git add .` 금지.
- 커밋 메시지는 Conventional Commits 스타일(ADR-008).
- 다중 task 묶음 커밋: `/finalize-workitem T-001 T-002` 형태로 다중 ID 허용.

## 5. 마일스톤 안정화
- `/stabilize-milestone [milestone-id]`으로 통합 점검을 수행한다.
- E2E + 회귀 + 리팩토링 후보 + ADR 후보 점검.
- **코드 수정·커밋·status 변경 금지** — 결과는 `QA_FINDINGS.md`와 `IMPROVEMENT_GUIDE.md`에 누적 기록.
- 후속 작업이 필요하면 `/repair-workitem` 또는 새 task로 연결.

다운스트림 마이그레이션: 이미 평면 양식의 QA 데이터를 가진 프로젝트는 (1) 기존 항목을 `## M1` 또는 `## 일반` 묶음으로 감싸고 (2) 다음 회차부터 새 마일스톤 헤더로 누적한다.

## 6. 의사결정 기록
- 중요한 기술적 선택은 `docs/90-decisions`에 ADR로 남긴다.

## 기본 원칙
- 상위 문서 없이 하위 문서만 먼저 만들지 않는다.
- 흩어진 메모보다 정해진 위치의 문서를 갱신한다.
- 애매한 사항은 문서에 가정과 열린 질문으로 남긴다.
- 작업을 완료(done)로 전환하기 전에 최소한 다음을 확인한다:
    - 구현 범위가 관련 workitem 문서와 일치한다
    - 관련 검증 항목(테스트 포인트, 검증 방법)이 통과했다
    - 필요한 경우 관련 문서가 함께 갱신되었다

## 문서 운영 방식

| 유형 | 예시 | 운영 방식 |
|------|------|-----------|
| Living Doc | Charter, Architecture, UI Design, Workflow | 현재 기준으로 계속 갱신한다. 과거 버전은 Git 이력으로 확인한다. |
| Record | ADR, QA Findings | 기록 보존 우선. 기존 항목을 덮어쓰지 않고 추가 또는 대체한다. |

- ADR은 기존 결정을 뒤집을 때 새 ADR로 대체하는 것을 기본으로 한다.
- QA Findings는 회차 또는 날짜 기준으로 누적 기록한다.
- Improvement Guide는 Living Doc이지만, 완료된 항목은 삭제하지 않고 상태를 갱신한다.

## 워크아이템 라이프사이클

```
discover → bootstrap → plan ─┬─→ implement → validate ─┬─Pass─→ finalize → stabilize
                              │                          └─Needs Fix─→ repair → (validate 재실행)
                              └─(opt-in, ADR-038)─→ validate-plan (별 세션) → repair-plan (원본 세션) → implement
```

> Note: wave 그룹 병렬 implement 시 `claude --worktree T-NNN -p "/implement-workitem T-NNN"` 권장 (ADR-038#d6 — 이름은 `--worktree` 인자로 필수).

각 단계의 정의와 책임 경계는 [ADR-007-workitem-lifecycle.md](../90-decisions/boilerplate/ADR-007-workitem-lifecycle.md)가 SSOT다.
스킬 간 흐름은 **자동 호출이 아니라 텍스트 제안 → 사용자/메인이 발화**한다.

## 스킬 종료 시 "다음 단계" 출력 contract

각 lifecycle skill 의 마지막 출력은 사용자가 *복사·붙여넣기* 로 후속 skill 을 즉시 발화할 수 있도록 다음 양식을 따른다. ADR-046#d1 "다음 액션 1개 (분기 시 ≤3)" 의 구체화 — 대부분 lifecycle skill 이 `context: fork` 라 sub-agent context 정합.

```
다음 단계:
- 기본 권장: `/<next-skill> <args>` — <이 명령을 실행할 1줄 이유>
- 분기 옵션 (해당 시 — ≤3 개):
  - <조건 A> 시: `/<alt-skill> <args>`
  - <조건 B> 시: `/<alt-skill> <args>`
- 프롬프트 동봉 권장 (다음 skill 호출 시 자연어로 함께 전달할 컨텍스트 — 해당 시):
  - <미결정 / 해석안 / 선택 옵션 / 이번 회차 의 미해결 finding 등>
```

본 contract 의 **목적**: 사용자가 매번 *어느 skill 을 어떤 인자로 호출하고, 무엇을 함께 전달해야 하는지* 를 다시 계산하지 않도록 — skill 출력 자체가 후속 발화 template 을 제공.

**자동 호출 금지**: skill 간 chain 은 위 출력이 *텍스트 제안* 일 뿐이고, 사용자/메인이 명시 발화로만 진행한다 (ADR-007 책임 경계 / ADR-046 signal-first).

## 문서 상태 전이

```
draft → ready → in-progress → done
                     ↓↑
                  blocked
done → deprecated (필요 시)
```

| 전이 | 최소 조건 |
|------|-----------|
| draft → ready | 필수 섹션이 채워졌고, 자기 검증 또는 리뷰를 거쳤다 |
| ready → in-progress | 실제 구현/작업이 시작됐다 |
| in-progress → blocked | 외부 의존성이나 미결 질문으로 진행 불가 |
| blocked → in-progress | 블로킹 원인이 해소됐다 |
| in-progress → done | 완료 기준을 충족했다 |
| done → deprecated | 대체되었거나 더 이상 유효하지 않다 |

이 규칙은 가이드 수준이며, 훅이나 스크립트로 강제하지 않는다.

## 문서 충돌 해결

문서 간 내용이 모순될 때:
1. 상위 문서가 하위 문서보다 권위가 높다 (charter > architecture > workitems).
2. 상위가 맞다면 하위를 수정하고, 상위가 outdated라면 상위를 먼저 갱신한 뒤 하위를 맞춘다.
3. 의도적 범위/기술 변경이라면 ADR을 남긴다.

## 7. 프로젝트별 자동화 추가
- 프로젝트의 OS/셸/런타임/프레임워크가 정해진 뒤 guardrail을 설계한다.
- shared 보일러플레이트는 구조와 원칙만 제공한다.
- 실제 scripts/hooks/CI는 프로젝트 상황에 맞게 생성한다.
- 관련 원칙은 docs/00-meta/GUARDRAILS_STRATEGY.md를 따른다.

## Mid-project 문서 갱신 동선

charter/architecture/스택 관련 mid-project 갱신 경로는 [DELEGATION_STRATEGY.md — Mid-project 문서 갱신 동선](DELEGATION_STRATEGY.md#delegation-midproject)을 참조한다.

## 단계별 에이전트 위임

각 단계에서의 에이전트 선택과 위임 조건은 [DELEGATION_STRATEGY.md](DELEGATION_STRATEGY.md)를 참조한다.
