# ADR-007 워크아이템 라이프사이클

> scope: boilerplate

## Status
accepted

## 배경
이 보일러플레이트의 워크아이템 흐름은 단순한 "구현 → 검증" 두 단계가 아니라 다음 8단계로 정의되어야 한다. 각 단계의 책임이 분리되어 있어야 sub-agent fork 환경에서 결과 회수와 책임 경계가 명확해진다.

본 ADR 이전의 워크플로우에서는 검증과 마감이 한 명령에 묶이지 않아 사람이 매번 status 갱신과 커밋을 수동으로 했고, `/validate-workitem`이 검증 외 작업까지 떠안는 경향이 생겼다.

## 결정
워크아이템 라이프사이클을 다음 8단계로 정의한다.

| # | 단계 | skill | 주체 agent | 책임 경계 |
|---|------|-------|-----------|----------|
| 1 | discover | `/discover-product` | (메인 세션 운전) | persona/pain/JTBD/시나리오 발굴 → DISCOVERY.md |
| 2 | bootstrap | `/bootstrap-project` | architect | DISCOVERY.md → charter/architecture/M1/F-001 |
| 3 | plan | `/plan-workitem` | planner | milestone/feature/task 분해 |
| 4 | implement | `/implement-workitem` | builder | task 구현 (Red→Green→Refactor 사이클, ADR-009) |
| 5 | validate | `/validate-workitem` | validator | 판정 + report 기록. **status 변경·코드 수정·커밋 금지.** |
| 6 | repair (Needs Fix일 때만) | `/repair-workitem` | builder | report의 실패 항목만 수정. **자동 커밋 금지, 새 기능 금지, 범위 밖 변경 금지.** |
| 7 | finalize (Pass일 때) | `/finalize-workitem` | builder | status `done` 갱신 + 명시적 파일 add + Conventional Commits 커밋 |
| 8 | stabilize | `/stabilize-milestone` | (qa, reviewer를 위임) | 마일스톤 단위 종합 점검. **코드 수정·커밋·status 변경 금지.** |

skill 간 흐름은 **자동 호출이 아니라 텍스트 제안 → 사용자/메인이 발화**한다. 예: validate Pass 출력은 "다음 액션: `/finalize-workitem T-001`"을 텍스트로 제안한다. 자동 호출이 아니다.

## 근거
- 책임 분리로 sub-agent fork 환경에서 각 단계의 입출력이 명확해진다.
- "검증" 단계와 "마감" 단계 분리로 "검증은 통과인데 status가 in-progress"인 모순이 사라진다.
- 라이프사이클 정의가 ADR로 박혀 있으면 fork된 미래 프로젝트에서 6개월 뒤 사용자가 "왜 이런 단계 분리인가"를 추적할 수 있다.

## 결과
- 8개 skill이 각 단계에 1:1로 대응한다.
- `docs/00-meta/WORKFLOW.md`가 이 라이프사이클을 단계별 사용법으로 풀어 적는다.
- `docs/00-meta/DELEGATION_STRATEGY.md`가 단계별 위임 대상을 정의한다.
- `/validate-workitem`은 **판정 + report 기록 전용**. 자동 수정·자동 마감 금지.
- repair 한 라운드는 P0/P1만 처리하고 P2 이하는 다음 라운드 추천 — 한 라운드의 작업량을 제한해 검증 가능성을 유지한다.

## 후속 작업
- `/finalize-workitem`이 통합 검증 명령(`validate`)을 한 번 더 돌리는 정책 — 직전 `/validate-workitem` 통과 후에도 안전성을 위해 한 번 더(상태가 변했을 수 있음).
- `/stabilize-milestone`은 코드 수정·커밋을 하지 않고 점검 결과를 누적 기록한다 — 후속 작업이 필요하면 `/repair-workitem` 또는 새 task로 연결.

<a id="adr-007-amend-1"></a>
## Amendment 1 (2026-05-15) — finalize lock file 화이트리스트

### 결정
`/finalize-workitem`의 우선순위 (3) 제외 규칙에 다음 11종 lock 파일을 자동 화이트리스트로 추가한다 (TASK_TEMPLATE `## 4-1`에 명시되지 않아도 자동 add 허용):
- `pnpm-lock.yaml`
- `package-lock.json`
- `yarn.lock`
- `bun.lockb`
- `Cargo.lock`
- `Gemfile.lock`
- `composer.lock`
- `go.sum`
- `Pipfile.lock`
- `poetry.lock`
- `uv.lock`

그 외 신규 dependency 변경(예: `package.json`의 `dependencies`/`devDependencies` 키 추가)은 reviewer P1로 보고.

### 근거
lock file은 task 단위 변경의 부산물 → `## 4-1` 강제는 단순성 위반.

### 잔여 모니터링
11종 외 신규 패키지 매니저 등장 시 누락 위험. stabilize가 staged된 `*.lock` / `*-lock.*` 패턴 중 화이트리스트 미일치 1건 발견 시 P1로 보고.

## Amendment 2 (2026-05-16) — agent 단위 판정 범위 경계 SSOT

### 결정
본 ADR의 8단계 lifecycle 표는 *skill 단위* 책임을 정의한다. *agent 단위* 판정 범위 경계는 다음과 같이 별도 SSOT를 둔다.

- **위치**: `docs/00-meta/DELEGATION_STRATEGY.md`의 위임 트리거 표.
- **형식**: validator / reviewer / qa 세 agent에 *판정 단위 / 판정 종류 / 책임 제약* 3축으로 행 박음.

### 근거
- fork 사용자가 *milestone stabilize 시 qa vs reviewer 어느 쪽 호출*을 매번 판단하지 않도록 경계 규칙 명문화.
- skill 단위 책임(본 ADR)과 agent 단위 경계(DELEGATION_STRATEGY)가 분리 SSOT라 변경 비용 분리.

<a id="adr-007-amend-3"></a>
## Amendment 3 (2026-05-27) — validate 게이트 강화 + finalize --apply 사유

### 결정
1. **validate 부재 게이트** — `/validate-workitem`·`/finalize-workitem`의 통합 검증 명령 단계에서, *스택 확정 신호*(`docs/00-meta/STACK_SETUP_PLAN.md` 존재)가 있는데 `validate` 명령(`pnpm/npm/make/task validate`)이 없으면 **skip이 아니라 `Needs Stack Guard`로 종료**하고 `/stack-guard` 실행을 안내한다. STACK_SETUP_PLAN.md가 없으면(스택 미정) 기존대로 skip.
2. **finalize --apply 사유** — `/finalize-workitem --apply`는 사용자가 **`--rationale "<왜 4-1과 다른지>"`** 를 함께 넘겨야 한다(`$ARGUMENTS`에서 파싱). finalize는 이 사유를 커밋 body의 `--apply rationale: <...>` 줄에 기록한다. `--apply`인데 `--rationale`이 없으면 finalize는 **사유를 스스로 만들지 않고**(executor가 사유를 발명하면 다시 "자아") `Needs Rationale`로 종료하고 `--rationale` 동봉 재실행을 안내한다.

### 근거
- [관측됨] validate 부재 silent skip은 스택 확정 프로젝트에서 *기계 게이트가 항상 켜져 있다*는 보장을 깬다(A13 장기 운영 리스크).
- [관측됨] `--apply`는 실제 변경을 신뢰하므로 남용 시 finalize에 "자아"가 생긴다 — commit body 사유 강제로 추적성 확보(ADR-008 Refs footer 정신).

### 강도 (ADR-022)
- constraint(강, [관측됨]) — 둘 다 종료/강제. 단 스택 확정 신호가 있을 때만(green-field 미정 프로젝트 면제).

### 적용 surface
- [.claude/skills/validate-workitem/SKILL.md](../../../.claude/skills/validate-workitem/SKILL.md) step 1
- [.claude/skills/finalize-workitem/SKILL.md](../../../.claude/skills/finalize-workitem/SKILL.md) — validate 단계 + `--apply` 플래그 정의 + 커밋 메시지 단계
