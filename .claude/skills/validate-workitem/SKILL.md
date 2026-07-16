---
name: validate-workitem
description: Validate whether a completed workitem implementation matches its documented scope and is ready for the next step.
argument-hint: "[task identifier]"
allowed-tools: Read Glob Grep Write Agent Bash(pnpm validate) Bash(pnpm validate *) Bash(npm run validate) Bash(npm run validate *) Bash(make validate) Bash(make validate *) Bash(task validate) Bash(task validate *) Bash(git diff *) Bash(git log *) Bash(git status *)
---

이 skill은 **판정 + report 기록 전용**이다. status 변경, 코드 수정, 커밋은 하지 않는다.

너의 역할은 지정된 workitem 구현 결과를 검증하고 표준 양식의 report를 기록하는 것이다.
큰 diff에서는 **메인 세션이 감사 축(audit AXIS)별 validator를 병렬 팬아웃**하고(아래 0단계),
각 validator가 반환한 **partial verdict**(findings + 그 축의 evidence)를 *메인이 집계해
단일 report 1개를 작성*한다. **report 작성과 confidence 산정은 집계자(메인 세션) 책임이다 —
validator는 report 파일을 쓰지 않는다**(clobber 방지: report 경로는 `<task-id>.md` 단일 파일).

입력:
- `$ARGUMENTS`에는 task ID가 들어온다 (feature 단위 검토는 `/validate-plan` 책임). FAC↔AC spec coverage 점검 시 본 task 의 상위 feature 문서를 *참조로* 읽는다.

반드시 먼저 할 일:
0. **감사 축 분할 + 병렬 validator 팬아웃 (orchestration)** — diff 규모로 분기한다.
   - **diff가 작으면 (cost guard)**: 팬아웃하지 않고 메인 세션이 직접 단일 inline validator로 1~5단계를 그대로 수행한다(아래 fallback 기준).
   - **diff가 크면**: 메인 세션이 아래 **감사 축**을 독립 sub-task로 분할하고, [DELEGATION 병렬 패턴 #1](../../../docs/00-meta/DELEGATION_STRATEGY.md#병렬-패턴-3종)(한 turn에 `validator` sub-agent 다중 호출)로 *한 turn에* 팬아웃한다. 각 validator는 **자기 축 하나만** scoped로 받고 **partial verdict만 반환**한다(report 작성 금지).
     - 축 목록 (1축 = 1 validator sub-task):
       1. AC ↔ 테스트 매핑 (+ 테스트 선행 휴리스틱 + `[verify-placeholder]` / `[test-id-missing]`)
       2. 범위 밖 변경 + diff trace audit (ADR-006#amend-1)
       3. FAC → AC spec coverage audit (ADR-037)
       4. Arch-iface 7-1/7-2/7-3/7-4 audit (API/CLI/백엔드/프론트)
       5. UI Design inventory audit (ADR-027#amend-1) — UI 프로젝트에 한해 spawn
       6. MCP 사용 audit (ADR-048#d5)
       7. Evidence Bundle 축(통합 명령 실행 결과 + oracle gap surface 점검)
     - **신호 기반 조건부 spawn (cost guard 확장)**: 축 3(FAC spec)·4(Arch-iface)·5(UI)·6(MCP)는 *해당 신호가 있을 때만* spawn한다 — 3 = task가 feature에 연결(`## 7 Feature` 링크), 4 = API/CLI/백엔드/프론트 신호(7-x 키워드·path), 5 = UI 프로젝트(ADR-027#amend-3), 6 = task `## 3`에 MCP 사용 line item. 신호 없는 축은 spawn하지 않고 메인이 "해당없음"으로 인라인 기록한다(중간 크기 task의 과다 팬아웃 방지). 축 1(AC↔테스트)·2(diff-trace)·7(Evidence Bundle)은 항상 해당.
     - **통합 검증 명령(1단계)은 메인 세션이 1회만 실행**하고 그 결과(exit code + stdout/stderr 요약)를 7번 축 validator와 집계에 공유한다 — N개 validator가 `pnpm validate`를 중복 실행하지 않는다.
     - **small-diff fallback 기준** (cost guard): `git status --porcelain` 변경 파일 집합의 줄 합계(tracked 변경은 `git diff HEAD` 줄 수, untracked 신규 파일은 파일 전체 줄 수) ≤ 50, *또는* (변경 파일 ≤ 2 *이고* 줄 합계 ≤ 200), *그리고* UI/Arch-iface/MCP/spec-coverage 중 둘 이상이 명백히 해당없음이면 팬아웃을 건너뛰고 단일 inline validator로 수행한다(휴리스틱 — 경계값은 메인 세션 판단. "2파일이면 줄 수 무관 inline"이던 구 기준은 구현+테스트 2파일의 대형 TDD diff를 놓쳐 보정됨 — ADR-051#amend-2). 어느 경로를 탔든 report `## Orchestration` 기록은 의무다.
     - **Codex: 병렬 위임 미지원 시 순차 단일 실행으로 degrade** — Codex는 sub-agent 병렬 파리티가 없으므로(ADR-010 매핑) 위 축을 순차로 단일 실행해 같은 partial들을 모은 뒤 동일하게 메인이 집계·작성한다.
1. 통합 검증 명령(`pnpm validate` / `npm run validate` / `make validate` / `task validate` 중 하나)이 있으면 **항상 실행**하고 stdout/stderr를 수집한다 (메인 세션 연쇄 실행이라도 implement 이후 코드 상태가 바뀌었으므로 직전 결과를 재사용하지 않는다).
   - **명령이 없을 때 (ADR-007#amend-3)**: `docs/00-meta/STACK_SETUP_PLAN.md`가 *존재*하면(스택 확정) skip하지 않고 **`Needs Stack Guard`로 종료** + `/stack-guard` 실행 안내. STACK_SETUP_PLAN.md가 *없으면*(스택 미정) 기존대로 이 단계 skip하고 정적 판정만 한다.
   - 다른 빌더(`bun validate`, `mise run validate`, `just validate` 등)를 쓰는 스택은 본 skill의 `allowed-tools`에 해당 패턴(`Bash(bun validate)` 등)을 추가해야 자동 실행된다.
2. 관련 workitem 문서를 읽는다 — **메인 세션 연쇄 실행으로 직전 단계가 이미 같은 task 문서를 메인 컨텍스트에 올렸고 그 뒤 문서가 갱신되지 않았으면 재독을 생략**하고, 없거나 갱신됐으면 읽는다 (ADR-019 minimal sufficiency).
3. 필요한 상위 문서를 읽는다 (사전 fork-load 금지 — task 본문에서 발화 시 인용).
4. 최근 변경 파일 또는 diff를 기준으로 구현 결과를 본다 — **직전 단계 이후 코드/diff가 바뀌었으므로 diff는 항상 새로 확인**한다.

검증 기준:
- 문서 범위와 구현이 일치하는가
- 범위 밖 변경 + diff trace audit (ADR-006#amend-1):
  변경 파일 회수를 `git status --porcelain`(untracked 신규 파일 포함) 기준으로 한다 — tracked 변경은 `git diff HEAD`의 각 줄로(staged+unstaged 모두 — plain `git diff`는 staged를 놓침), untracked 신규 파일은 파일 전체 내용을 대상으로, 각각이 task의 AC-N 또는 명시 요청으로
  거꾸로 추적 가능한지 감사한다(신규 파일이 감사에서 누락되지 않게 — finalize의 `git status` 방식 정합). 추적 불가 줄은 다음 카테고리 중 하나로 분류 보고.

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
  - `## 6-1. 테스트 시나리오` 항목이 `→ <runner>::<file>::<test-id>` 형식이고 *값에 angle-bracket placeholder(`<...>`)가 포함되지 않으면* path 우선 resolve (deterministic, ADR-047 D6 contract formation + D1 inspectability 정합).
  - 값에 `<runner>` / `<file>` / `<test-id>` 같은 angle-bracket placeholder가 잔존하면 *미설정*으로 간주 + 본 report에 P2 `[verify-placeholder]` 라벨로 기록 — 기록 위치: *Needs Fix 판정 시* `## 실패 항목` 하단에 한 줄, *Pass 판정 시* `## Evidence Bundle` 의 *검증된 것* sub-section 하단에 한 줄(`## 실패 항목`은 Needs Fix일 때만 존재하므로). 자연어 매칭 fallback으로 계속 진행 (validate-workitem 책임 경계 정합 — IMPROVEMENT_GUIDE 직접 append는 stabilize-milestone이 reviewer 결과 받아 적는 영역).
- 테스트 선행 휴리스틱 — git log에서 동일 task 범위의 테스트 파일 추가/수정이 구현 파일보다 먼저(또는 동일 커밋) 들어왔는지. 단순 경고로만 보고하고 강제 종료하지 않는다(소규모 작업이 한 커밋에 묶이는 경우 정상).
- FAC → AC spec coverage audit ([ADR-037](../../../docs/90-decisions/boilerplate/ADR-037-spec-coverage-audit.md)):
  feature `## 7 FAC`의 각 항목이 본 task의 `## 6 AC` 또는 *연관 task의 AC*에
  매핑되는가? 매핑 안 된 FAC가 있으면 report의 "Spec coverage" 섹션에
  `Spec Gap: FAC-N → unmapped` 명시 + 미커버 task 추가 권장.
  자동 차단 X — ADR-007 책임 경계 정합. legacy fallback은 plan-workitem SKILL.md의 "task 분해 + ## 7-1 AC 측 채움" 섹션 **Legacy fallback** 단락 참조.
- **UI 프로젝트 — Design inventory audit** (ADR-027#amend-1): 본 task 가 새 컴포넌트를 추가했는데 task `## 3. 구현 항목` 의 *등록 line item* (plan authoring) 이 실행 누락이면 `P1 [Design-inventory]`. 등록 line item 자체가 부재한데 신규 컴포넌트 출현이면 `P1 [Design-inventory-planless]` (plan 보강 권장). repair-workitem 또는 다음 plan 라운드로 회수.
- **MCP 사용 audit** (ADR-048#d5): task `## 3. 구현 항목`에 `<capability> 작업 시 <mcp-name> MCP 사용` line item(plan authoring)이 있었는데 실행 흔적(diff / test / 출력)이 없으면 report에 `P2 [MCP-unused] <mcp-name> — plan이 박은 MCP 사용 line item 미실행` 기록. implement가 `Needs MCP Access`로 멈춘 경우(권한 미부여)는 `P2 [MCP-access] <mcp-name> — agent access 미부여(연결 절차 (e))`로 구분 기록. 자동 차단 X(report 신뢰 등급만 영향).
- **API/CLI/백엔드/프론트 — Arch-iface audit**: 본 task 가 ARCH `## 7-1`/`## 7-2`/`## 7-3`/`## 7-4` 의 기존 결정을 위반했거나, 신규 결정을 *7-x 본문 갱신 없이* 도입했으면 report 에 `P1 [Arch-iface-7-N]` 기록 + 7-x 본문 갱신 권장 또는 ADR 후보 표시.
- **Evidence Bundle 양식 강제** (ADR-047 D8 oracle adequacy + D1 inspectability 정합): 위 양식의 "검증된 것 / 검증하지 못한 것 / 신뢰도" 3 sub-section을 *모두* 채운다. Pass 판정이라도 oracle gap이 명시 안 되면 *신뢰도: Low*로 강등 (자동 차단 X — report 신뢰 등급만 영향).

마지막 단계 — partial 집계 + report 파일 작성 (집계자=메인 세션 단독):
0단계에서 팬아웃했으면 각 validator가 반환한 partial verdict(축별 findings + 그 축의 evidence)를
*메인 세션이* 모아 아래 양식의 report 1개를 `docs/40-validation/reports/<task-id>.md`에 기록한다(이미 있으면 덮어쓴다).
validator는 이 파일을 쓰지 않는다(clobber 방지). inline fallback이면 메인 세션이 자기 판정을 그대로 기록한다.

집계 규칙 (combined verdict):
- **Needs Fix 트리거**: 어느 한 축이라도 P0 finding이 있거나, AC↔테스트 매핑에 ❌ AC가 하나라도 있거나, 통합 검증 명령이 exit≠0이면 → **Needs Fix**(통합 명령 부재 스택은 해당 없음). 그 외 P1/P2만 있으면 Pass(라벨은 report에 전수 기록).
- 각 축의 partial findings(P0/P1/P2)·`[verify-placeholder]`·`[test-id-missing]`·`Spec Gap`·`[Design-inventory*]`·`[MCP-*]`·`[Arch-iface-7-N]`를 누락 없이 해당 report 섹션에 전수 합친다(ADR-046#d3 — cap 때문에 finding 누락 금지).
- **confidence는 메인 세션이 *집계 후* 재계산**한다(개별 validator의 신뢰도 추정을 그대로 신뢰하지 않는다). 아래 confidence ladder의 입력(통합 명령 통과 여부 / AC↔테스트 매핑 % / diff trace 통과 / oracle gap 카테고리 명시 여부)을 *집계된 전체*에서 평가해 Low→Medium→High 첫 매치로 확정한다.

```markdown
# Validation Report: <task-id>

- 검증 시각: <ISO 8601 타임스탬프>
- task-id: <task-id>
- 판정: Pass | Needs Fix

## Orchestration (ADR-051#amend-2)
<!-- 5줄 이내. 팬아웃/inline 여부를 산출물로 검증 가능하게 하는 관측 섹션 -->
- 모드: fan-out N축 | inline fallback | Codex 순차 degrade
- spawn된 축: <번호·이름 목록 (예: 1 AC↔테스트, 2 diff-trace, 7 Evidence)>
- skip된 축: <축 — 사유 (신호 없음 / 해당없음)>
- fallback 사유 (해당 시): 파일 N개 · 변경 줄 M줄 (`git status --porcelain` 기준 — tracked=`git diff HEAD`, untracked=파일 전체)

## 통합 명령 실행 결과
<있으면 명령어와 stdout/stderr 요약, 없으면 "통합 명령 미설정 — 정적 판정만 수행">

## 실패 항목 (Needs Fix일 때만)
- [P0] <짧은 설명> — <관련 파일:라인>
- [P1] <...>
- [P2] <...>

## Diff trace audit (ADR-006#amend-1)
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

## Evidence Bundle (ADR-047 D8 oracle adequacy 정합)
<!-- 본 검증 라운드가 *무엇을 봤고 무엇을 못 봤는지* 명시. green test가 곧 충분한 검증이라는 착각을 줄인다. -->

### 검증된 것 (verified)
- 통합 명령 exit code: <0 / non-zero / 미설정>
- AC↔테스트 매핑: M개 ✅ / K개 ❌ (커버리지 %)
- diff trace audit: 추적 가능 N줄, 추적 불가 K줄(카테고리별)
- FAC↔AC spec coverage: <% / 부재>
- 기타 deterministic 점검: <markdown-link-check / static analysis 등 / 해당없음>

### 검증하지 못한 것 (oracle gap)
<!-- 다음 카테고리 중 *본 task의 surface area에 해당하는 것만* 명시. 해당없으면 "해당없음" 한 줄.
     UI 외에도 backend API에 i18n / 접근성 응답이 있으면 본 카테고리도 surface로 본다. -->
- 동시성·race condition 시나리오: <검증 가능 여부 / 가능 시 도구>
- 운영 환경 부하·성능: <검증 가능 여부>
- 외부 서비스 실패·timeout: <mocked / not covered>
- 보안 (인증 우회·권한 escalation·인젝션): <not covered / partial / not applicable>
- 접근성·국제화 (task surface가 해당하면): <not covered / partial / not applicable>
- 회귀: 이전 milestone의 어떤 시나리오를 본 변경이 깰 위험이 있나 — <명시 또는 "관련 없음">

### 신뢰도 (confidence)
<!-- 기준 (정의 — 같은 입력에 같은 판정 보장. 평가 순서: Low → Medium → High 의 *첫 매치* 등급으로 확정):
     - Low (어느 하나라도 매치): 통합 명령 미통과, 또는 oracle gap 카테고리 미명시(누락 카테고리 ≥2), 또는 AC↔테스트 매핑 <70%, 또는 AC↔테스트 ❌ 있음
     - Medium: Low 조건 모두 불일치 + High 조건 중 1~2개 미달 (예: 매핑 70~89% / oracle gap 카테고리 1개 누락)
     - High: 통합 명령 통과 + AC↔테스트 매핑 ≥90% + diff trace audit 통과 + oracle gap 카테고리 모두 명시(해당없음 포함) -->
- 본 판정의 신뢰도: <High / Medium / Low> — <한 줄 근거 (예: "통합 명령 + AC 매핑 100% + diff trace 통과 + 외부 서비스 의존 없음" / "통합 명령만 통과, 동시성·외부 의존 미검증")>

## 다음 권장 액션
- Pass: `/finalize-workitem <task-id>` (메인 세션이 이어서 직접 발화하거나 사용자가 발화 — ADR-050)
- Needs Fix: `/repair-workitem <task-id>` (메인 세션이 이어서 직접 발화하거나 사용자가 발화 — ADR-050)
```

마지막 출력 (메인 세션에 텍스트로):
- Pass / Needs Fix
- 핵심 문제 최대 5개
- report 파일 경로
- orchestration 모드 1줄 (예: "fan-out 4축" / "inline fallback — 1파일 12줄")
- 다음 추천 단계 (텍스트 제안임을 명시)

## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 ADR/architecture 섹션은 task 본문에서 발화 시 인용 — 사전 fork-load 금지.
메인 세션 연쇄 실행(implement→validate→repair, ADR-050) 시 직전 단계가 메인 컨텍스트에 올린 task 문서는 *갱신되지 않았으면 재독 생략*(ADR-051 D8 + ADR-019#amend-1 정합). 단 통합 검증 명령 재실행·diff 재확인·report 신규 작성은 항상 수행(코드 상태/산출물이 매 phase 변한다).
