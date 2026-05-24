---
name: validate-workitem
description: Validate whether a completed workitem implementation matches its documented scope and is ready for the next step.
argument-hint: "[task or feature identifier]"
disable-model-invocation: true
allowed-tools: Read Glob Grep Write Bash(pnpm validate) Bash(pnpm validate *) Bash(npm run validate) Bash(npm run validate *) Bash(make validate) Bash(make validate *) Bash(task validate) Bash(task validate *) Bash(git diff *) Bash(git log *) Bash(git status *)
context: fork
agent: validator
context-pack: minimal
---

이 skill은 **판정 + report 기록 전용**이다. status 변경, 코드 수정, 커밋은 하지 않는다.

너의 역할은 지정된 workitem 구현 결과를 검증하고 표준 양식의 report를 기록하는 것이다.

입력:
- `$ARGUMENTS`에는 task ID 또는 feature ID가 들어온다.

반드시 먼저 할 일:
1. 통합 검증 명령(`pnpm validate` / `npm run validate` / `make validate` / `task validate` 중 하나)이 있으면 실행하고 stdout/stderr를 수집한다. 없으면 이 단계는 건너뛴다.
   - 다른 빌더(`bun validate`, `mise run validate`, `just validate` 등)를 쓰는 스택은 본 skill의 `allowed-tools`에 해당 패턴(`Bash(bun validate)` 등)을 추가해야 자동 실행된다. 추가하지 않으면 이 단계는 건너뛰고 정적 판정만 한다.
2. 관련 workitem 문서를 읽는다.
3. 필요한 상위 문서를 읽는다.
4. 최근 변경 파일 또는 diff를 기준으로 구현 결과를 본다.

검증 기준:
- 문서 범위와 구현이 일치하는가
- 범위 밖 변경 + diff trace audit (ADR-006 amend1):
  `git diff` 결과의 각 변경 줄(또는 hunk)이 task의 AC-N 또는 명시 요청으로
  거꾸로 추적 가능한가? 추적 불가 줄은 다음 카테고리 중 하나로 분류 보고.

  Needs Fix 트리거 (강 constraint, P0 라벨):
    (c) pre-existing dead code 삭제 — task 범위 밖 *파괴적 변경*. Pass 차단.

  Report only + reviewer 라벨 권장 (약 enabling, P1/P2 라벨):
    (a) 인접 코드 포맷팅/주석 정리 — P1
    (b) 무관 리팩토링 (행동 미변경 코드 구조 변경) — P1
    (d) 스타일 변경 (semicolon, quote, indent 등) — P2

  의도적 (c)는 task 문서에 명시 요청으로 박혀 있을 때만 Pass 통과.
- 빠진 검증 포인트가 있는가
- obvious regression risk가 있는가
- 통합 검증 명령(있으면) 결과는 통과인가
- AC ↔ 테스트 매핑 — task 문서의 AC-N마다 대응하는 테스트가 존재하는가(자연어 매칭 휴리스틱 또는 테스트 이름의 `AC_N` 식별자 매칭).
- 테스트 선행 휴리스틱 — git log에서 동일 task 범위의 테스트 파일 추가/수정이 구현 파일보다 먼저(또는 동일 커밋) 들어왔는지. 단순 경고로만 보고하고 강제 종료하지 않는다(소규모 작업이 한 커밋에 묶이는 경우 정상).
- FAC → AC spec coverage audit ([ADR-037](../../../docs/90-decisions/boilerplate/ADR-037-spec-coverage-audit.md)):
  feature `## 7 FAC`의 각 항목이 본 task의 `## 6 AC` 또는 *연관 task의 AC*에
  매핑되는가? 매핑 안 된 FAC가 있으면 report의 "Spec coverage" 섹션에
  `Spec Gap: FAC-N → unmapped` 명시 + 미커버 task 추가 권장.
  자동 차단 X — ADR-007 책임 경계 정합. legacy fallback은 plan-workitem SKILL.md "feature 분해 시" 단락 참조.
- **UI 프로젝트 — Design inventory audit** (ADR-027 amend 1): 본 task 가 새 컴포넌트를 추가했는데 task `## 3. 구현 항목` 의 *등록 line item* (plan authoring) 이 실행 누락이면 `P1 [Design-inventory]`. 등록 line item 자체가 부재한데 신규 컴포넌트 출현이면 `P1 [Design-inventory-planless]` (plan 보강 권장). repair-workitem 또는 다음 plan 라운드로 회수.
- **API/CLI/백엔드/프론트 — Arch-iface audit**: 본 task 가 ARCH `## 7-1`/`## 7-2`/`## 7-3`/`## 7-4` 의 기존 결정을 위반했거나, 신규 결정을 *7-x 본문 갱신 없이* 도입했으면 report 에 `P1 [Arch-iface-7-N]` 기록 + 7-x 본문 갱신 권장 또는 ADR 후보 표시.

마지막 단계 — report 파일 작성:
판정 결과를 다음 양식으로 `docs/40-validation/reports/<task-id>.md`에 기록한다(이미 있으면 덮어쓴다).

```markdown
# Validation Report: <task-id>

- 검증 시각: <ISO 8601 타임스탬프>
- task-id: <task-id>
- 판정: Pass | Needs Fix

## 통합 명령 실행 결과
<있으면 명령어와 stdout/stderr 요약, 없으면 "통합 명령 미설정 — 정적 판정만 수행">

## 실패 항목 (Needs Fix일 때만)
- [P0] <짧은 설명> — <관련 파일:라인>
- [P1] <...>
- [P2] <...>

## Diff trace audit (ADR-006 amend1)
- 추적 가능 변경 줄: N개 (AC-1: M개, AC-2: ...)
- 추적 불가 변경 줄: K개
  - (a) 인접 포맷팅/주석: <file:line> ... [P1]
  - (b) 무관 리팩토링: ... [P1]
  - (c) pre-existing dead code 삭제: ... [P0 — Needs Fix 트리거]
  - (d) 스타일 변경: ... [P2]
- 판정 영향: <Pass 유지 / Needs Fix 트리거 (오직 (c) 의도 외 발견 시)>

## AC ↔ 테스트 매핑
- AC-1: ✅ tests/foo.spec.ts > test_AC_1_xxx
- AC-2: ❌ (테스트 없음)
- AC-3: ✅ tests/bar.spec.ts > test_AC_3_xxx

## Spec coverage (FAC ↔ AC, ADR-037)
- FAC-1: ✅ T-001:AC-1
- FAC-2: ✅ T-001:AC-2
- FAC-3: ❌ unmapped — 미커버 task 추가 권장 (예: T-XXX [Given]...[When]...[Then]...)

## 다음 권장 액션
- Pass: `/finalize-workitem <task-id>` (자동 호출 아님 — 사용자 또는 메인 세션이 발화한다)
- Needs Fix: `/repair-workitem <task-id>` (자동 호출 아님)
```

마지막 출력 (메인 세션에 텍스트로):
- Pass / Needs Fix
- 핵심 문제 최대 5개
- report 파일 경로
- 다음 추천 단계 (텍스트 제안임을 명시)

## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 ADR/architecture 섹션은 task 본문에서 발화 시 인용 — 사전 fork-load 금지.
