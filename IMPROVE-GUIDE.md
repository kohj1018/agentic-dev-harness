# IMPROVE-GUIDE — 핵심 개선 4건

> 작성 목적: skill·agent 가 *실제로* 정해진 문서를 읽고 정해진 위치에 기록하도록 *진짜 필요한* 누락·모순만 정리한다. 본 가이드는 self-contained — 순서대로 따라가면 전 개선이 완료된다.

## 0. 본 가이드의 범위 (이전 라운드 대비 trim 사유)

이전 라운드는 raw-fork 안전성·context-pack 일관성·문서 polish 같은 *비핵심* 항목 7개를 포함했지만, 다시 검증해 보면 다음 둘로 충분히 가드된다:
- **lifecycle 정상 경로는 skill 경유** — DELEGATION_STRATEGY 는 raw agent fork 도 정당 경로로 두지만 (charter 부분 갱신=planner fork / architecture 시스템 경계 갱신=architect 단발 등), lifecycle 작업 (구현/검증/repair/finalize/stabilize) 은 skill 경유가 read-list·양식 정합·책임 경계를 더 강하게 박는다.
- **ADR-019 minimal/JIT 정책** — 추가 컨텍스트는 발화 시 인용. agent 가 task 본문에서 link 된 sub-section 을 *Read 도구로 동적 회수* 하는 것이 정상 동작.

따라서 본 라운드는 **실제 정책 모순·생성 시점 양식 SSOT 누락·표준 출력 부재** 의 4건만 다룬다.

## 0-1. 본 라운드 개선 항목 4개

| # | FIX | 등급 | 한 줄 사유 |
|---|-----|------|-----------|
| 1 | validator.md 의 IMPROVEMENT_GUIDE 직접 기록 지시 정합화 | **P0 critical** | skill SSOT 와 직접 모순 — raw fork 시 잘못된 파일 write |
| 2 | bootstrap-project 의 read-list 에 workitem TEMPLATE + _ADR_GUIDE + project README 인덱스 추가 | **P0 likely failure** | M1/F-001/ADR-100 생성 시 양식 SSOT 미회수 → 새 필드 누락 위험 |
| 3 | bootstrap-stack 기본 모드도 --migrate 와 동일하게 ADR 가이드 회수 + 인덱스 갱신 명시 | **P1 asymmetry** | --migrate 에만 있는 가드가 기본 모드에 부재 |
| 4 | "skill 종료 시 다음 단계 + 동봉 프롬프트" 출력 contract 표준화 + 누락 3개 보강 | **P1 new contract** | lifecycle skill 17개 중 14개가 이미 부분 구현. 형식 통일 + 누락 3개 (bootstrap-project/review-doc/stabilize-milestone) 보강 |

## 0-2. 사전 점검 (시작 전 1회)

1. 현재 branch 가 `main` 이고 working tree 가 clean 인지 확인 (`git status`).
2. 각 FIX 는 독립적 — 부분 적용 가능. 4 → 1 → 2 → 3 순서로 가는 것도 OK.
3. 각 FIX 끝의 1줄 영어 커밋 메시지는 Conventional Commits 정합 (ADR-008). 한 커밋 = 한 FIX 권장.
4. 줄번호는 *2026-05-28 시점* 기준 — line shift 가능. *내용 매칭* 으로 찾는다.

---

# FIX 1 — validator.md 의 IMPROVEMENT_GUIDE 직접 기록 지시를 report 기록으로 정합화 (P0 critical)

## 문제
- 파일: `.claude/agents/validator.md` (현재 line ~44)
- 모순: `.claude/skills/validate-workitem/SKILL.md` line ~12 ("이 skill 은 **판정 + report 기록 전용**") + line ~47 ("IMPROVEMENT_GUIDE 직접 append 는 stabilize-milestone 이 reviewer 결과 받아 적는 영역") 이 validator 의 write surface 를 *report 파일 단일* 로 명시. 그런데 validator.md 본문은 "테스트 이름에 `AC_N` 또는 `[AC-N]` 식별자 누락 시 IMPROVEMENT_GUIDE에 P1 severity로 보고" 라고 지시 — 정면 충돌.
- 영향: validator 가 메인 세션에서 직접 fork 될 때 (`/validate-workitem` skill 경유 아닐 때) 잘못된 파일을 Write 하게 됨. lifecycle 책임 경계 (ADR-007) 위반.

## 수정 단계

`.claude/agents/validator.md` 본문에서 다음 줄을 찾는다:

```
- 테스트 이름에 `AC_N` 또는 `[AC-N]` 식별자 누락 시 IMPROVEMENT_GUIDE에 P1 severity로 보고. ADR-009 amend 정합.
```

다음으로 교체한다:

```
- 테스트 이름에 `AC_N` 또는 `[AC-N]` 식별자 누락 시 본 검증 report 에 `[P1] [test-id-missing] AC-N — 테스트 이름에 식별자 누락` 한 줄로 기록 — 기록 위치: *Needs Fix 판정 시* `## 실패 항목` 하단에 한 줄, *Pass 판정 시* `## Evidence Bundle` 의 *검증된 것* sub-section 하단에 한 줄 (`## 실패 항목` 은 Needs Fix 일 때만 존재). validate-workitem 책임 경계 정합 — IMPROVEMENT_GUIDE 직접 append 는 stabilize-milestone 이 reviewer 결과 받아 적는 영역. ADR-009 amend 정합.
```

## 검증

핵심 검증은 *옛 지시 부재* + *새 라벨 존재* 두 줄. 단어 자체 (`IMPROVEMENT_GUIDE`) 의 등장 횟수는 정합 표현이 다른 줄에 남아 있어 brittle — exact count 검증은 쓰지 않는다.

- `Grep "IMPROVEMENT_GUIDE에 P1 severity로 보고" .claude/agents/validator.md` → **0 match** (옛 잘못된 직접 기록 지시가 사라졌는지 — 본 FIX 의 핵심 negative check).
- `Grep test-id-missing .claude/agents/validator.md` → **1+ match** (새 라벨이 들어왔는지 — 본 FIX 의 핵심 positive check).
- validate-workitem/SKILL.md 의 책임 경계 단락은 *변경 X*.

## 커밋 메시지
```
fix(agent): align validator test-id-missing finding to report file per validate-workitem SSOT
```

---

# FIX 2 — bootstrap-project 의 read-list 에 workitem TEMPLATE + _ADR_GUIDE + project ADR 인덱스 추가 (P0 likely failure)

## 문제
- 파일: `.claude/skills/bootstrap-project/SKILL.md` (현재 line ~23–31, ~46–47, ~62–63)
- 누락: bootstrap-project 는 `docs/30-workitems/milestones/M1-foundation.md`, `docs/30-workitems/features/F-001-core-value.md`, `docs/90-decisions/project/ADR-100-initial-project-decisions.md` 를 *직접 생성* 한다 (skill 본문 line ~46–50). 그런데 `반드시 먼저 읽을 파일` 목록에 `MILESTONE_TEMPLATE.md` / `FEATURE_TEMPLATE.md` / `_ADR_GUIDE.md` / `project/README.md` 가 빠져 있음.
- 영향: 최신 템플릿의 `## 0-1. Type` / `## 7-1. FAC ↔ AC 매핑표` / milestone graduation checklist 5+1 / ADR 권장 섹션·area 태그·Mutation Contract 트리거를 *상상해서* 채울 위험. 그리고 project README 인덱스 갱신 누락 → **project ADR 인덱스 drift** (stabilize-milestone preflight 의 인덱스 동기 점검 [ADR-index] 는 `boilerplate/README.md` 만 대상 — `project/README.md` 인덱스 drift 는 현재 자동 점검 부재라 사람/리뷰 의존. 이 채널 자체가 끊긴다).
- ADR-019 minimal 정합: bootstrap 은 *최초 생성 시점* 이라 양식 SSOT 는 minimal read-list 의 본질적 일부다 (JIT 가 아님).

## 수정 단계

### 2-A. 읽기 목록 확장

`.claude/skills/bootstrap-project/SKILL.md` 본문에서 다음 블록을 찾는다:

```
반드시 먼저 읽을 파일:
- AGENTS.md (CLAUDE.md는 @AGENTS.md import이므로 본문은 AGENTS.md에서 읽는다)
- `docs/00-meta/STRUCTURE.md`
- `docs/00-meta/WORKFLOW.md`
- `docs/00-meta/GUARDRAILS_STRATEGY.md`
- `docs/00-meta/PROJECT_START_CHECKLIST.md`
- `brief-template.md`
- `output-checklist.md`
- `examples/career-saas-example.md`
```

다음으로 교체한다:

```
반드시 먼저 읽을 파일:
- AGENTS.md (CLAUDE.md는 @AGENTS.md import이므로 본문은 AGENTS.md에서 읽는다)
- `docs/00-meta/STRUCTURE.md`
- `docs/00-meta/WORKFLOW.md`
- `docs/00-meta/GUARDRAILS_STRATEGY.md`
- `docs/00-meta/PROJECT_START_CHECKLIST.md`
- `docs/30-workitems/_templates/MILESTONE_TEMPLATE.md` (M1 생성 시 양식 SSOT — `## 0-1. Type` / graduation checklist 5+1 / `## 8. 회고` 자동 채움 자리)
- `docs/30-workitems/_templates/FEATURE_TEMPLATE.md` (F-001 생성 시 양식 SSOT — `## 0-1. Type` / 12 main sections / `## 7-1. FAC ↔ AC 매핑표` subsection)
- `docs/90-decisions/boilerplate/_ADR_GUIDE.md` (ADR-100 작성 시 권장 섹션·area 태그·Mutation Contract 규약)
- `docs/90-decisions/project/README.md` (project ADR 인덱스 — ADR-100 추가 후 한 줄 갱신 대상)
- `brief-template.md`
- `output-checklist.md`
- `examples/career-saas-example.md`
```

### 2-B. 수행 단계에 인덱스 갱신 명시

같은 파일에서 다음 블록을 찾는다:

```
   - `docs/90-decisions/project/ADR-100-initial-project-decisions.md` — bootstrap 단계의 초기 결정 (project ADR은 100+ 번호 — boilerplate/ADR-002는 legacy reserved). 스택 선택 ADR은 `/bootstrap-stack`이 별도로 생성한다(`project/ADR-101-stack-selection.md` — 본 skill 책임 아님).
```

다음으로 교체한다:

```
   - `docs/90-decisions/project/ADR-100-initial-project-decisions.md` — bootstrap 단계의 초기 결정 (project ADR은 100+ 번호 — boilerplate/ADR-002는 legacy reserved). _ADR_GUIDE.md 권장 섹션 + Ratchet evidence label 정합. 스택 선택 ADR은 `/bootstrap-stack`이 별도로 생성한다(`project/ADR-101-stack-selection.md` — 본 skill 책임 아님).
   - **ADR-100 작성 시 `docs/90-decisions/project/README.md` 인덱스 표에 한 줄 추가** (인덱스 표 컬럼 양식은 `docs/90-decisions/project/README.md` 본문 표 헤더가 SSOT — _ADR_GUIDE.md "새 ADR 추가 절차" §2 정합).
```

## 검증
- `Grep MILESTONE_TEMPLATE .claude/skills/bootstrap-project/SKILL.md` → match.
- `Grep _ADR_GUIDE .claude/skills/bootstrap-project/SKILL.md` → match.
- `Grep "project/README.md 인덱스" .claude/skills/bootstrap-project/SKILL.md` → match.

## 커밋 메시지
```
fix(skill): bootstrap-project reads workitem templates and ADR guide before creating initial artifacts
```

---

# FIX 3 — bootstrap-stack 기본 모드도 ADR 가이드 회수 + project ADR 인덱스 갱신 명시 (P1 asymmetry)

## 문제
- 파일: `.claude/skills/bootstrap-stack/SKILL.md` (현재 line ~22–28, ~32–35)
- 비대칭: `--migrate` 모드 (line ~94–103) 는 *"작성한 project ADR은 `docs/90-decisions/project/README.md` 인덱스에 한 줄 추가"* 를 명시. 그런데 기본 모드 (line ~30–43) 는 `docs/90-decisions/project/ADR-101-stack-selection.md` 를 동일하게 생성하면서도 인덱스 갱신 + _ADR_GUIDE.md 읽기를 요구하지 않음.
- 영향: 기본 모드로 ADR-101 만든 fork 는 인덱스 미갱신 상태로 진행. _ADR_GUIDE 권장 섹션 규약 (area 태그 / Mutation Contract 트리거) 누락 가능. --migrate 와 동일 산출물인데 다른 가드 — 정책 SSOT 위반 (ADR-005).

## 수정 단계

### 3-A. 읽기 목록 확장

`.claude/skills/bootstrap-stack/SKILL.md` 본문에서 다음 블록을 찾는다:

```
반드시 먼저 읽을 파일:
- `docs/00-meta/GUARDRAILS_STRATEGY.md`
- `docs/00-meta/WORKFLOW.md`
- `docs/10-charter/PROJECT_CHARTER.md`
- `docs/20-system/ARCHITECTURE_OVERVIEW.md`
- `stack-brief-template.md`
- `output-checklist.md`
```

다음으로 교체한다:

```
반드시 먼저 읽을 파일:
- `docs/00-meta/GUARDRAILS_STRATEGY.md`
- `docs/00-meta/WORKFLOW.md`
- `docs/10-charter/PROJECT_CHARTER.md`
- `docs/20-system/ARCHITECTURE_OVERVIEW.md`
- `docs/90-decisions/boilerplate/_ADR_GUIDE.md` (ADR-101 작성 시 권장 섹션·area 태그·Mutation Contract 규약)
- `docs/90-decisions/project/README.md` (project ADR 인덱스 — ADR-101 추가 후 한 줄 갱신 대상)
- `stack-brief-template.md`
- `output-checklist.md`
```

### 3-B. 수행 단계에 인덱스 갱신 명시

같은 파일에서 다음 블록을 찾는다:

```
2. 아래 문서를 갱신한다.
   - `docs/20-system/ARCHITECTURE_OVERVIEW.md`
   - `docs/90-decisions/project/ADR-101-stack-selection.md` (project ADR은 100+ 번호 — boilerplate/ADR-003은 legacy reserved)
```

다음으로 교체한다:

```
2. 아래 문서를 갱신한다.
   - `docs/20-system/ARCHITECTURE_OVERVIEW.md`
   - `docs/90-decisions/project/ADR-101-stack-selection.md` (project ADR은 100+ 번호 — boilerplate/ADR-003은 legacy reserved). _ADR_GUIDE.md 권장 섹션 + Ratchet evidence label 정합.
   - **`docs/90-decisions/project/README.md` 인덱스 표에 ADR-101 한 줄 추가** (인덱스 표 컬럼 양식은 `docs/90-decisions/project/README.md` 본문 표 헤더가 SSOT — _ADR_GUIDE.md "새 ADR 추가 절차" §2 정합). `--migrate` 모드와 동일한 형식.
```

## 검증
- `Grep _ADR_GUIDE .claude/skills/bootstrap-stack/SKILL.md` → match.
- `Grep "project/README.md 인덱스" .claude/skills/bootstrap-stack/SKILL.md` → 기본 모드 + --migrate 모드 양쪽 → 2 match 기대.

## 커밋 메시지
```
fix(skill): bootstrap-stack basic mode aligns with --migrate on ADR guide read and index update
```

---

# FIX 4 — "skill 종료 시 다음 단계 + 동봉 프롬프트" 출력 contract 표준화 + 누락 3개 보강 (P1 new contract)

## 배경 (현황 점검)

`Grep "다음 (권장|추천) (단계|액션)" .claude/skills/` 결과 — **lifecycle skill 17개 중 14개가 이미 부분 구현** 되어 있다 (전체 18개 중 boilerplate-context 는 doc 로드용 skill 이라 next-step 비대상 — 17개 중 산정):
- ✓ 잘 갖춤 (next-skill + args + 분기 + 동봉 컨텍스트, 4개): `plan-workitem`, `validate-plan`, `repair-plan`, `validate-workitem`
- ✓ 갖춤 (next-skill + args, 10개): `discover-product`, `bootstrap-stack`, `bootstrap-design`, `stack-guard`, `implement-workitem`, `repair-workitem`, `finalize-workitem`, `validate-discovery`, `repair-discovery`, `research-pack`
- ✗ **누락/모호 (3개)**:
  - `bootstrap-project` (line ~63): "다음 추천 단계 최대 3개" — 모호, 구체 양식 없음
  - `review-doc` (line ~44–49): "다음 단계" 자체 부재
  - `stabilize-milestone` (line ~152–166): 출력은 풍부하나 *후속 skill 발화 가이드* 가 흩어져 있고 명시 next-skill 부재

따라서 본 FIX 는: **(A) 표준 양식 SSOT 1곳 정의 + (B) 누락 3개 skill 에 양식 적용**.

기존 14개 skill 의 형식 정합은 *본 라운드 범위 외* — 자연 발생 amend 로 점진 적용 (ADR-022 enabling 약).

## 4-A. WORKFLOW.md 에 출력 contract 추가

`docs/00-meta/WORKFLOW.md` 본문에서 다음 두 줄을 찾는다 (워크아이템 라이프사이클 단락 끝, line ~89–90):

```
각 단계의 정의와 책임 경계는 [ADR-007-workitem-lifecycle.md](../90-decisions/boilerplate/ADR-007-workitem-lifecycle.md)가 SSOT다.
스킬 간 흐름은 **자동 호출이 아니라 텍스트 제안 → 사용자/메인이 발화**한다.
```

해당 두 줄 *바로 아래* 에 다음 새 섹션을 *추가* 한다 (기존 두 줄은 보존 — 본 outer fence 는 4-backtick 으로 두고 *내용 안의* 3-backtick 블록은 그대로 WORKFLOW.md 에 들어간다):

````

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
````

## 4-B. bootstrap-project — "최대 3개" 를 구체 양식으로 교체

`.claude/skills/bootstrap-project/SKILL.md` 본문에서 다음 블록을 찾는다 (line ~59–63):

```
마지막 출력:
- 갱신한 파일 목록
- 핵심 가정
- 남은 미결정 사항
- 다음 추천 단계 최대 3개
```

다음으로 교체한다:

```
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
```

## 4-C. review-doc — 마지막 출력에 "다음 단계" 추가

`.claude/skills/review-doc/SKILL.md` 본문에서 다음 블록을 찾는다 (line ~44–49):

```
마지막 출력:
- 결과를 P0, P1, P2로 나눈다.
- 어떤 섹션을 어떻게 수정하면 좋을지 구체적으로 제안한다.
- 상위 설계 문제와 하위 구현 문제를 구분한다.
- 막연한 칭찬은 하지 않는다.
- 시간/턴이 부족하면 확인된 범위까지의 핵심 판단만 요약하고 종료한다.
```

다음으로 교체한다 (기존 항목 보존 + 마지막에 "다음 단계" 추가):

```
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
```

## 4-D. stabilize-milestone — "다음 단계" 항목을 출력 끝에 통합

`.claude/skills/stabilize-milestone/SKILL.md` 본문에서 다음 블록을 찾는다 (line ~152–166, "8. 최종 출력:" 블록):

```
8. 최종 출력:
   - 통합 `validate` 결과 + E2E 결과 (있으면)
   - P0 / P1 / P2 후속 작업
   - QA_FINDINGS / IMPROVEMENT_GUIDE 갱신 위치
   - 다음 마일스톤으로 넘기는 항목
   - architect 호출 권장 (있으면)
   - instruction improvement 후보:
     본 마일스톤 동안 builder/validator/reviewer가 반복적으로 막힌 패턴,
     AGENTS.md 또는 agent/skill body 문구가 *비자명하거나 모호*했던 지점,
     새로 박을 만한 *self-check 항목* 후보를
     [IMPROVEMENT_GUIDE.md](../../../docs/40-validation/IMPROVEMENT_GUIDE.md)에 보고.
     각 항목에 [ADR-022](../../../docs/90-decisions/boilerplate/ADR-022-ratchet-principle.md) evidence label 부착.
     *AGENTS.md / agent / skill body는 자동 수정 X — 보고만*.
     - DESIGN.md / ARCH 7-x cross-surface drift 가 본 마일스톤 중에 N회 이상 발견됐다면 *ADR-027#amend-1 적용 본문* 이 누락된 fork 인지 점검 권장.
   - **Telemetry aggregate** (단계 7-T 결과 echo — 수치만, IMPROVEMENT_GUIDE 신규 항목 X).
```

해당 블록 *마지막 줄 (`Telemetry aggregate`) 바로 아래* 에 다음 새 항목을 *추가* (기존 줄들은 보존):

```
   - **다음 단계** ([WORKFLOW.md "스킬 종료 시 다음 단계 출력 contract"](../../../docs/00-meta/WORKFLOW.md) 양식 정합):
     - **졸업 가능 = YES + P0 후속 0건**:
       - 기본 권장: `/plan-workitem M-(N+1)` — 다음 milestone 의 feature/task 분해
       - 프롬프트 동봉 권장: 본 라운드 Telemetry 의 신뢰도 분포 + Cross-stabilize 회귀 신호 (다음 milestone 의 우선순위 조정 입력)
     - **졸업 가능 = NO 또는 P0 후속 있음** (분기 옵션 ≤3):
       - `[Spec-gap]` finding 있음: `/plan-workitem F-NNN` 으로 미커버 task 추가
       - 회귀·엣지케이스 (QA_FINDINGS P0) 있음: `/repair-workitem T-NNN` 으로 해당 task 수정 → 재 validate
       - `[Doc-link]` / `[ADR-ref]` 등 문서 정합 P0: 사용자 직접 수정 (architect 또는 메인)
     - **공통 프롬프트 동봉 권장**:
       - 미해결 P0/P1 라벨 목록 (다음 호출의 우선 처리 대상)
       - Cross-stabilize 회귀 신호 항목 (있으면 — patterned drift 경고)
       - 본 마일스톤의 instruction improvement 후보 (있으면 — 다음 stabilize 라운드에서 회수)
```

## 검증

ripgrep 정규식 충돌(`(` 가 group 시작)을 피하려고 *literal 부분 문자열*로 매칭한다.

- `Grep "스킬 종료 시 \"다음 단계\" 출력 contract" docs/00-meta/WORKFLOW.md` → match (새 섹션 헤더).
- `Grep "스킬 종료 시 다음 단계 출력 contract" .claude/skills/` → 3 files matched (bootstrap-project / review-doc / stabilize-milestone — 각자의 링크 텍스트가 매치).
- bootstrap-project 본문에 "다음 추천 단계 최대 3개" 가 *남아 있지 않은지* 확인 (`Grep "최대 3개" .claude/skills/bootstrap-project/SKILL.md` → 0 match).

## 커밋 메시지
```
feat(workflow): add skill-end next-step output contract and apply to 3 gappy skills
```

---

# 최종 검증 체크리스트 (전 FIX 적용 후)

본 가이드의 4개 FIX 가 모두 적용됐는지 한 번에 점검. Claude Code 의 **Grep 도구** (ripgrep 기반) 로 실행 — Windows PowerShell 환경에서도 동일하게 작동. 정규식 충돌을 피하기 위해 *literal 부분 문자열* 패턴을 쓴다.

```
# FIX 1 (exact count 회피 — 옛 지시 부재 + 새 라벨 존재만 확인)
Grep "IMPROVEMENT_GUIDE에 P1 severity로 보고" .claude/agents/validator.md   → 0 match (옛 잘못된 지시가 제거됨 — 핵심 negative check)
Grep "test-id-missing"   .claude/agents/validator.md                        → 1+ match (새 라벨이 들어옴 — 핵심 positive check)

# FIX 2
Grep "MILESTONE_TEMPLATE"      .claude/skills/bootstrap-project/SKILL.md  → 1+
Grep "_ADR_GUIDE"              .claude/skills/bootstrap-project/SKILL.md  → 1+
Grep "project/README.md 인덱스" .claude/skills/bootstrap-project/SKILL.md  → 1+

# FIX 3
Grep "_ADR_GUIDE"              .claude/skills/bootstrap-stack/SKILL.md    → 1+
Grep "project/README.md 인덱스" .claude/skills/bootstrap-stack/SKILL.md    → 2 (기본 모드 + --migrate 모드)

# FIX 4
Grep "스킬 종료 시"                       docs/00-meta/WORKFLOW.md           → 1+ (새 섹션 헤더)
Grep "최대 3개"                           .claude/skills/bootstrap-project/SKILL.md  → 0 (제거됨)
Grep "스킬 종료 시 다음 단계 출력 contract" .claude/skills/                    → 3 files matched (bootstrap-project / review-doc / stabilize-milestone)
```

모두 통과하면 개선 완료.

# 적용 순서 권장

1. **FIX 1** (validator 모순 — 가장 영향 큼, 1분 작업)
2. **FIX 4-A** (WORKFLOW.md 에 contract 추가 — 4-B/C/D 의 SSOT 가 됨)
3. **FIX 4-B / 4-C / 4-D** (3개 skill 보강 — 4-A 의 contract 를 가리킨다)
4. **FIX 2** (bootstrap-project — read-list + 인덱스 갱신)
5. **FIX 3** (bootstrap-stack — read-list + 인덱스 갱신)

각 FIX 적용 후 위 *최종 검증 체크리스트* 의 해당 줄로 확인.

# 본 가이드 자체의 라이프사이클

본 IMPROVE-GUIDE.md 는 *Living Doc* 이 아니라 *작업 지침*. 모든 FIX 적용 후 본 파일을 *삭제* 한다 (작업 완료 후 의미 상실, 잔존 시 stale doc 위험).

삭제 커밋 메시지:

```
docs: delete IMPROVE-GUIDE after applying all fixes
```
