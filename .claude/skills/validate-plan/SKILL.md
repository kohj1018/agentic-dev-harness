---
name: validate-plan
description: 다른 세션·다른 LLM에서 `/plan-workitem`이 생성·갱신한 workitem 문서를 비판적으로 교차 검토하고 임시 리뷰 파일 1개를 작성한다. workitem 문서 자체는 수정하지 않는다 (ADR-038).
argument-hint: "[milestone or feature or task id] [--reviewer-tag <tag>]"
disable-model-invocation: true
allowed-tools: Read Glob Grep Write
context: fork
agent: reviewer
context-pack: minimal
---

이 skill은 **판정 + 임시 리뷰 파일 기록 전용**이다. milestone/feature/task 문서 일체 수정 금지. 코드 수정 금지. 커밋 금지.

너의 역할은 입력 workitem ID에 해당하는 plan 문서를 *외부 시선*으로 비판적으로 검토하고, 임시 리뷰 파일 1개를 작성하는 것이다.

**호출 시나리오**: 사용자는 원본 plan 세션과 *다른 터미널·다른 세션·다른 LLM*에서 본 skill을 호출한다. 본 skill의 출력 리뷰 파일은 원본 세션의 `/repair-plan`이 회수한다.

**⚠ 같은 checkout/worktree 운영 제약**: `/validate-plan`이 작성하는 리뷰 파일은 `docs/40-validation/plan-reviews/`의 *로컬 파일*이며 `.gitignore`된 상태. 다른 worktree 또는 다른 checkout에서 호출하면 원본 세션의 `/repair-plan`이 파일을 *못 본다*. **두 skill을 같은 checkout/worktree에서 실행**하거나, 다른 worktree에서 실행했다면 *원본 checkout으로 파일을 수동 이동* 후 `/repair-plan` 호출.

**다중 리뷰어 동시 실행 시 `--reviewer-tag` 필수 권장** — 각 리뷰어 호출 시 *서로 다른 tag 명시* (예: `--reviewer-tag claude-b`, `--reviewer-tag codex`). 미지정 시 둘 다 `default` 태그로 저장되어 충돌 가능성 발생 — 자동 suffix 부여 동작은 아래 입력 단락 참조.

입력:
- `$ARGUMENTS`에는 milestone ID(`M1`) / feature ID(`F-001`) / task ID(`T-001`) + 선택 플래그 `--reviewer-tag <tag>`가 들어온다.
- `--reviewer-tag` 미지정 시 `default` 사용.
- **tag 형식 제약**: `[A-Za-z0-9._-]{1,32}` (파일 경로에 들어가므로). **미일치 시 *즉시 종료*** (silent fallback X — silent overwrite 위험 회피). 사용자에게 valid tag 형식 안내 후 종료.
- **workitem-id 형식 제약**: `M[0-9]+` / `F-[0-9]+` / `T-[0-9]+` 만 허용. `/`, 공백, glob 메타문자(`*`, `?`, `[`) 포함 시 즉시 종료.
- **파일 존재 시 자동 suffix**: 호출 시점에 `docs/40-validation/plan-reviews/<workitem-id>.<tag>.md`가 이미 존재하면 `<tag>-2.md`, `<tag>-3.md`로 *자동 suffix 부여* (silent overwrite 방지). 출력에 "기존 리뷰 파일 존재 — `<id>.<tag>-N.md`로 저장" 한 줄 안내.

반드시 먼저 읽을 파일:
- `docs/10-charter/PROJECT_CHARTER.md` (`## 5. 비목표`, `## 7. 제약 조건` 참조)
- `docs/20-system/ARCHITECTURE_OVERVIEW.md` (`## 3-1. 레이어 경계` 참조 — *부재* 시 [Plan-arch] 차원 skip + 리뷰 파일 "핵심 관찰"에 그 사실 명시)
- `docs/20-system/ARCHITECTURE_OVERVIEW.md` `## 7-1`/`## 7-2`/`## 7-3`/`## 7-4` (해당 스택 한정 — [Plan-arch-iface] 참조). *해당 sub-section 부재 시 본 차원 skip*.
- `docs/20-system/DESIGN.md` (UI 프로젝트 한정 — [Plan-design] 참조). *파일 부재 시 본 차원 skip + "핵심 관찰" 에 명시*.
- 입력 ID에 해당하는 workitem 문서 + **모든 하위 문서**:
  - `M1` 입력 → `docs/30-workitems/milestones/M1-*.md` + 본 마일스톤 산하 feature/task 전체
  - `F-001` 입력 → 해당 feature 문서 + 본 feature 산하 task 전체
  - `T-001` 입력 → 해당 task 문서 + (있으면) 상위 feature + 상위 milestone
- **하위 문서 탐색 규칙**:
  1. **파일명 prefix glob**: `M1-*.md`, `F-001-*.md`, `T-NNN-*.md` 패턴.
  2. **상위 문서 link 본문**: milestone `## 3. 포함되는 기능` / feature `## 7-1. FAC ↔ AC 매핑표` / task `## 7. 관련 문서`에서 명시 link.
  3. **본문 link**: 상위/하위 문서가 서로 인용한 markdown link 추적.
  세 단계 모두 결과 0건이면 *"하위 문서 회수 0건"* 한 줄 echo 후 본 workitem만 회수하고 진행 (자동 차단 X).
- `docs/30-workitems/_templates/MILESTONE_TEMPLATE.md`, `FEATURE_TEMPLATE.md`, `TASK_TEMPLATE.md` (양식 정합 점검용)

**큰 milestone budget 가이드 (ADR-019 minimal/JIT 정합)**: 산하 task 합산 ≥10개면 다음 순서로 budget — (a) feature 문서 전체 + 각 task `## 6 AC` 섹션만 1차 회수, (b) 그 결과로 P0 의심 task 후보를 좁힌 뒤 (c) 후보 task 본문 전체를 깊게 읽는다. 모든 task 본문을 사전 fork-load 금지.

검토 차원 (10 dimensions — reviewer.md의 *Plan Quality 10 차원* 정합 — ADR-027#amend-1):
1. **[Plan-scope]** — Charter `## 5. 비목표` 키워드 위반 / 상위 milestone `## 4. 제외되는 기능` 위반. P0 권장.
2. **[Plan-sizing]** — 1 task = 1 RGR 위반 / AC 4개 이상 / 변경 예정 파일 5개 초과 (초기 scaffolding·auth 예외). P1 권장.
3. **[Plan-AC-form]** — Given-When-Then 형식 부재 / 강력 금지 verb ("works"/"looks good"/"is correct"/"is fine"). P0 권장.
4. **[Plan-ambiguity]** — 1 AC에 2+ 합리적 해석 가능. P1 권장.
5. **[Plan-FAC-coverage]** — feature `## 7-1. FAC ↔ AC 매핑표`의 unmapped FAC. P0 권장.
6. **[Plan-dep]** — task `## 9. 의존성` 누락 / 잘못된 병렬 주장. P1 권장.
7. **[Plan-arch]** — ARCHITECTURE_OVERVIEW `## 3-1` 레이어 경계 위반 의심. *`## 3-1` 섹션 자체가 부재한 fork*에서는 본 차원 *skip* + "핵심 관찰"에 "[Plan-arch] skipped: `## 3-1` 부재" 한 줄 명시. P1 권장.
8. **[Plan-doc-link]** — task `## 7. 관련 문서` / feature `## 11. 관련 문서` link 누락·깨짐. P2 권장.
9. **[Plan-design]** (UI 한정 — DESIGN.md 부재 시 skip) — DESIGN.md `## 7` 인벤토리 외 컴포넌트 신설 / raw hex / Don'ts 위반 / 8 상태 매트릭스 누락. P1 권장.
10. **[Plan-arch-iface]** (해당 스택 한정 — 7-x sub-section 부재 시 skip) — ARCH `## 7-1`/`## 7-2`/`## 7-3`/`## 7-4` 기존 결정 위반 / Don'ts 위반. P0 권장.

판정 규칙 (review verdict — 워크플로우 차단 아님):
- **NEEDS_CHANGES** — P0 finding 1개 이상.
- **ALL_GOOD** — P0 finding 0개. (P1/P2는 ALL_GOOD을 막지 않음.)
- 본 판정은 *리뷰 파일에 박는 severity 라벨*이지 자동 차단 트리거 아님 (ADR-038 enabling 약 + ADR-007 책임 경계). `/repair-plan`이 본 판정을 입력 신호로 받아 사용자 결정에 따라 적용.

마지막 단계 — 리뷰 파일 작성:

1. 출력 파일 경로: `docs/40-validation/plan-reviews/<workitem-id>.<reviewer-tag>.md`
   - 동일 tag로 재호출 시 기존 파일은 보존하고 `<tag>-2.md`/`<tag>-3.md`로 자동 suffix 부여 (위 입력 단락 — silent overwrite 방지).
   - 다른 tag로 동시 검토 시 파일 충돌 없음.
2. 다음 양식 그대로 작성:

```markdown
# Plan Review: <workitem-id>

- 리뷰어 태그: <reviewer-tag>
- 리뷰 시각: <ISO 8601 — LLM 컨텍스트의 today's date 사용. 예: `2026-05-23T00:00:00Z`>
- 대상 workitem: <workitem-id>
- 대상 문서 경로 (회수한 모든 문서):
  - <path 1>
  - <path 2>
- 판정: ALL_GOOD | NEEDS_CHANGES

## 발견

### P0 (수용 강력 권장 — plan 품질 critical, repair-plan에서 우선 처리)
- [P0] [Plan-AC-form] T-002:AC-1 — verb "works"는 비측정. [Given]..[When]..[Then] 형식 + measurable verb로 재작성 권장.
- [P0] [Plan-FAC-coverage] F-001:FAC-3 — unmapped. 본 FAC를 커버할 task 추가 (예: T-007) 권장.

### P1 (수용 권장 — plan 품질 저하)
- [P1] [Plan-sizing] T-001 — AC 4개. 1 task = 1 RGR 사이클 정합 위해 T-001a/T-001b로 분리 권장.

### P2 (개선 제안 — accept 선택)
- [P2] [Plan-doc-link] T-003 — `## 7. 관련 문서`에 Architecture 링크 누락.

## 카테고리 별 카운트
| Category | P0 | P1 | P2 |
|----------|----|----|----|
| Plan-scope | 0 | 0 | 0 |
| Plan-sizing | 0 | 1 | 0 |
| Plan-AC-form | 1 | 0 | 0 |
| Plan-ambiguity | 0 | 0 | 0 |
| Plan-FAC-coverage | 1 | 0 | 0 |
| Plan-dep | 0 | 0 | 0 |
| Plan-arch | 0 | 0 | 0 |
| Plan-doc-link | 0 | 0 | 1 |
| Plan-design | 0 | 0 | 0 |
| Plan-arch-iface | 0 | 0 | 0 |

## 핵심 관찰 (3개 이내)
- ...
- ...

## 다음 권장 액션 (원본 plan 세션에서)
`/repair-plan <workitem-id>` — 본 파일 + 다른 리뷰어 파일을 일괄 회수.
```

마지막 출력 (메인 세션에 텍스트로):
- 판정 (ALL_GOOD / NEEDS_CHANGES) — *review verdict, 워크플로우 차단 아님*을 한 줄 명시. **ALL_GOOD 의미 보강**: P0 finding 0개를 의미 — P1/P2 finding은 있을 수 있고 `/repair-plan`에서 4결정 중 하나로 다뤄짐.
- 실제 사용된 `<reviewer-tag>` (입력 그대로 또는 자동 suffix 부여된 `<tag>-N`). suffix 부여 시 사유 1줄 함께 출력 ("기존 파일 존재 — `-N` suffix 부여").
- P0 / P1 / P2 카운트
- 리뷰 파일 경로
- 다음 권장 액션: "원본 plan 세션에서 `/repair-plan <workitem-id>` 실행" + (다른 worktree에서 호출했을 시) "리뷰 파일을 원본 checkout으로 이동 후 호출"

가드:
- workitem 문서(milestone / feature / task) 일체 수정 금지.
- IMPROVEMENT_GUIDE / QA_FINDINGS / report 디렉터리 등 다른 산출물 위치 수정 금지.
- 코드 일체 수정 금지.
- 커밋 금지.

## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 ADR/architecture 섹션은 task 본문에서 발화 시 인용 — 사전 fork-load 금지.
