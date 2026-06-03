---
name: stabilize-milestone
description: Stabilize a milestone — run E2E + regression + refactoring/ADR review. No code changes, no commits.
argument-hint: "[milestone id] [--dry-run]"
disable-model-invocation: true
allowed-tools: Read Glob Grep Write Edit Bash Agent
context-pack: minimal
---

본 skill은 evaluator-optimizer pattern의 evaluator orchestration이다 (ADR-014#amend-1).

이 skill은 **코드 수정·커밋·workitem status 변경을 하지 않는다.**
다음 세 종류의 문서 갱신만 정상 책임이다:
1. `docs/40-validation/QA_FINDINGS.md` 누적 기록 (qa 위임 결과).
2. `docs/40-validation/IMPROVEMENT_GUIDE.md` 누적 기록 (reviewer 위임 결과 + deterministic preflight 결과).
3. milestone 문서의 `## 8. 회고` 섹션 자동 채움 ([ADR-014](../../../docs/90-decisions/boilerplate/ADR-014-milestone-graduation.md) graduation contract — status 변경 X, 본문 단락 갱신만).
   - 회고 본문 4 항목: 목표 달성도 / scope creep / 비목표 위반 / 핵심 학습 3개 이내.

그 외 변경은 금지한다 — milestone 문서의 `## 0. Status` / `## 1~7` 섹션 / 다른 workitem 문서 / 코드 일체.
후속 작업이 필요하면 `/repair-workitem` 또는 새 task로 텍스트 제안만 출력한다.

입력:
- `$ARGUMENTS`에는 milestone ID(예: `M1`)가 들어온다.
- `--dry-run` 플래그가 있으면 1.5 Graduation pre-check만 돌리고 종료(P0 검증 도구 — 전체 QA 없이 빠른 졸업 가능 여부 확인).

수행:
1. milestone 문서를 읽고 포함된 feature/task 목록을 회수한다.

### 1.0. Deterministic pre-flight (LLM 위임 전 cheap mechanical check)

LLM 호출 전 다음을 순서대로 점검 (모두 deterministic, fail-fast X — 보고만):

1. **docs/ 내부 markdown link 유효성** (기본: *내부 / ADR 참조 / 로컬 파일* 만 점검 — 외부 URL 검사는 optional):

   - **기본 (내부 link only — deterministic 보장)**: `markdown-link-check --config <(echo '{"ignorePatterns":[{"pattern":"^https?://"}]}') docs/**/*.md` (외부 URL 무시).
     - OS 별 glob 처리:
       - Unix/macOS bash: `markdown-link-check docs/**/*.md` (bash glob 자동 확장).
       - Windows PowerShell (glob 미확장 안전 패턴): `Get-ChildItem docs -Recurse -Filter *.md | ForEach-Object { markdown-link-check $_.FullName }`.
       - OS 무관 fallback: repo 의 `scripts/verify.{sh,ps1,mjs}` 에 한 줄 helper 박거나 `npx markdown-link-check` 를 *각 파일 인자로 직접 호출* — `glob` npm 패키지 의존 회피.
   - **optional (외부 URL 검사 — 네트워크 의존 / flaky)**: 위 명령에서 `ignorePatterns` 제거. 단 *deterministic preflight 의 기본 단계가 아님* — `--with-external-links` 플래그로 사용자 명시 발화 시만.
   - 깨진 link 발견 시 IMPROVEMENT_GUIDE.md 에 `P1 [Doc-link] <file:line> — <broken link>` 라벨 기록.
   - `markdown-link-check` 미설치 환경은 본 항목만 skip + 출력에 명시 (`Doc-link check skipped: markdown-link-check not installed`).
2. **ADR 참조 유효성 (ADR-045#d1·#d8)**:
   - `ADR-NNN` 참조 → 실제 파일 존재 매칭. 예외(오류 아님): (a) `<!-- -->` 주석 안 참조, (b) **allowlist된 ADR-100/101**의 bootstrap 전 미존재, (c) Reserved/Parked/Dropped 표 등재 번호. boilerplate(001~099) 미존재 → `P1 [ADR-ref]`. **그 외 project ADR(102+) 미존재 → `P2 [ADR-ref-project]`** (무시 X).
   - **앵커 존재 (ADR-045#d2)**: `ADR-NNN#amend-M` → 대상 ADR에 `## Amendment M`(또는 `<a id="adr-NNN-amend-M">`) 존재. 누락 시 `P1 [Ref-anchor] <file:line>`. (`#dK`는 token-only — 대상 ADR에 "K." 결정 항목 존재는 *best-effort*, 미존재 의심만 `P2`.)
   - **내부 anchor 링크 (ADR-045#d9)**: `[label](file.md#anchor)`의 anchor가 대상 파일에 `<a id>` 또는 대응 heading으로 실재. 누락 시 `P1 [Link-anchor] <file:line>`.
   - **Surfaces forward check (ADR-045#d3·#d4)**: `## Surfaces` 블록을 가진 각 ADR에 대해 — 등재 파일이 모두 존재하고 본문에 `ADR-NNN` 역참조를 갖는가. 누락 시 `P1 [Surface-backref] ADR-NNN → <file>`. **이 forward 방향만 Phase 4 범위** (역방향은 휴리스틱이라 Phase 5 검토).
   - **죽은 ADR 인용**: 인용된 ADR의 `## Status`가 `superseded`/`deprecated`면 `P2 [Ref-dead] <file:line>`.
   - **인덱스 amend 동기**: `boilerplate/README.md` Amendments 컬럼 amend 수 ↔ 본문 `## Amendment N` 수 일치(불일치 `P1 [ADR-index]`). (review-doc과 중복 가능.)
3. **FAC ↔ AC unmapped 검출** ([ADR-037](../../../docs/90-decisions/boilerplate/ADR-037-spec-coverage-audit.md)#amend-1 영속 SSOT `## 7-1` 정합):
   - 본 마일스톤의 모든 feature 문서 `## 7-1. FAC ↔ AC 매핑표`에서 *unmapped* 또는 *비어 있음* 항목 회수.
   - 발견 시 IMPROVEMENT_GUIDE에 `P0 [Spec-gap] F-NNN:FAC-N → unmapped` 기록 + 미커버 task 추가 권장.
4. **모드 라벨 ↔ 본문 정합 휴리스틱** (ADR-012): 모든 `docs/00-meta/` 파일의 `> 모드: ...` 라벨이 본문과 명백히 어긋나는지 점검 (휴리스틱 한계 명시).
   - mismatch 시 P2 `[Doc-mode] <file>` 기록.

5. **DESIGN.md + ARCH 7-x cross-surface drift 검출** (ADR-027#d19) — *(5-2) 는 정규식 기반 deterministic, (5-3)(5-4) 는 mechanical/best-effort heuristic — 휴리스틱 한계는 항목별 echo*:

   5-0. **변경 파일 회수 — git diff 의존 금지**: stabilize-milestone 은 정상 lifecycle 에서 `/finalize-workitem` 으로 *이미 커밋된* 후 호출되므로 working tree `git diff` 는 비어 있다. 본 마일스톤 task 의 변경 파일 회수 우선순위:
   - **(a) 1차 — task 문서**: 본 마일스톤 산하 모든 task (`docs/30-workitems/tasks/T-*.md`) 의 `## 4-1. 변경 예정 파일/경로` 본문 회수. (TASK_TEMPLATE 정합 — finalize 시 `--apply` 또는 명시 update 로 채워짐)
   - **(b) 2차 — commit log fallback**: `## 4-1` 비어 있거나 git 실제 변경과 어긋난 task 는 `git log --grep "Refs: T-NNN" --name-only` 로 commit 로그의 변경 파일 회수 (ADR-008#amend-2 Refs footer 정합).
   - **(c) 3차 — validation report fallback**: 위 둘 다 비어 있는 task 는 `docs/40-validation/reports/<task-id>.md` 의 diff trace audit 단락 회수.
   - **(d) 모두 실패 시**: 본 task 는 *조사 불가* 로 표시 + IMPROVEMENT_GUIDE 에 `P2 [Stabilize-recovery] T-NNN — 변경 파일 회수 불가` 기록 후 다음 task 로 계속.

   5-1. **UI 프로젝트 판정** — **ADR-027#amend-3 "UI 판정 다중신호 절차"** 적용(부재→비-UI: 5-1~5-3 skip+사유 echo / status≠draft→UI: 5-1~5-3 활성 / status=draft+추가신호≥1→UI 의심: IMPROVEMENT_GUIDE에 `P1 [Design-draft] DESIGN.md status=draft + UI 신호 감지 — /bootstrap-design 권장` 기록 + 5-1~5-3 활성 / 신호 0→silent skip).

   5-2. **UI 프로젝트 — raw hex grep** (정규식 deterministic): 5-0 에서 회수한 변경 파일 목록 중 확장자가 `.tsx`/`.jsx`/`.ts`/`.js`/`.vue`/`.svelte`/`.astro`/`.css`/`.scss`/`.html` 인 파일에서 `#[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?` 패턴 grep. 일치 발견 시 IMPROVEMENT_GUIDE 에 `P1 [Design-rawhex] <file:line> — DESIGN.md ## 2 token 으로 교체 권장` 기록. **DESIGN.md 자체 파일은 grep 대상 *제외*** (token 정의 영역이라 false positive 회피).

   5-3. **UI 프로젝트 — 컴포넌트 인벤토리 drift** (best-effort heuristic): `src/components/`, `app/components/`, `components/` 중 존재하는 디렉터리의 컴포넌트 파일명 (예: `Button.tsx`, `Card.tsx`) 목록 ↔ DESIGN.md `## 7. Components` 본문에 명시된 컴포넌트 이름 비교. 코드에는 있지만 DESIGN.md 에 없는 컴포넌트 발견 시 `P1 [Design-inventory-drift] <component> — DESIGN.md ## 7 등록 권장` 기록. 반대 (DESIGN.md 에 있는데 코드에 없음) 는 unimplemented planned component → `P2 [Design-inventory-pending] <component>` 기록. **휴리스틱 한계 echo 권장** (`인벤토리 drift 검출은 free-form 문서 키워드 매칭 — false positive/negative 가능`).

   5-4. **API/CLI 스택 한정 — 7-x Don'ts 위반 grep** (best-effort heuristic): ARCH 의 `## 7-1` 의 `### Don'ts` / `## 7-2` 의 `### Don'ts` 본문에서 *명시적 금지 키워드* 를 추출 → 5-0 회수 변경 파일에서 해당 키워드 grep. 위반 의심 발견 시 `P0 [Arch-iface-violation] <file:line> — ARCH ## 7-N Don'ts 위반 의심: <키워드>` 기록. **휴리스틱 한계 echo 강제** (`Don'ts 키워드 추출은 free-form 텍스트 기반 — false negative 多. 본 grep 미작동 시 reviewer 의 design surface 위임이 보조 catch`).

   > **7-3 백엔드 / 7-4 프론트 의 milestone-level deterministic gap 명시**: 현 ARCH TEMPLATE 의 `## 7-3` / `## 7-4` 는 `### Don'ts` 자리가 없어 본 5-4 grep 이 *skip* 한다. 단 이것이 *전면 gap 은 아니다* — 7-3/7-4 결정과의 정합은 **per-task validate-workitem (validator.md 의 인터페이스 CHECK 규칙 — UI/API/CLI/7-x) 의 CHECK 단계가 task 단위로 점검**한다 (DB migration / 인증 / 트랜잭션 / 라우팅 / 상태관리 등). 즉 *milestone-level deterministic preflight* 에서만 빠지고, *task-level validation* 에서는 잡힌다. milestone 누적 drift 가 우려되면 stabilize 의 reviewer `code` surface (Step 5) 가 아키텍처 부채로 추가 catch. 향후 7-3/7-4 에 `### Don'ts` 자리를 TEMPLATE 에 추가하면 본 grep 도 확장 가능 (별도 ADR-027 amend 후보).

   5-5. **해당 스택 부재 시 본 항목 skip** + skip 사유 echo: `[Design/Arch-iface] check skipped: <reason>`. 예: `[Design] check skipped: docs/20-system/DESIGN.md 부재 (비-UI 프로젝트)`.

본 단계는 모두 *보고만* — 발견이 있어도 stabilize 후속 단계 차단 X (LLM 위임 단계로 계속). 다음 라운드의 `/plan-workitem`이 후속 task로 회수.

**review-doc 책임 분담**: [review-doc](../review-doc/SKILL.md)은 *단일 문서 ad-hoc 검토*에 한정. cross-doc / link / FAC↔AC는 본 deterministic preflight가 담당 — review-doc을 `--all`/`--milestone` 모드로 확장하지 않는다.

### 1.5. Graduation pre-check (ADR-014)

MILESTONE 문서의 `## 5. 완료 기준` 각 항목을 다음 deterministic 평가로 체크 (LLM 즉흥 판정 금지 — ADR-014 *P0 검증 도구* 정합):

- `모든 task status: done` → 본 milestone에 속한 모든 task 파일(`docs/30-workitems/tasks/T-*.md`)의 `## 0. Status` 값이 모두 `done`.
- `통합 validate Pass` → `validate` 명령 exit code 0. **normal 모드**: 단계 3에서 실행되므로 본 항목 판정은 단계 3 실행 후 확정된다 (1.5 가 단계 3 보다 먼저 와도 졸업 판정은 단계 3 결과를 반영). **`--dry-run` 모드**: 단계 3을 돌지 않으므로 본 1.5 단계 안에서 `validate` 를 1회 실행한다.
- `E2E Pass (스택 정의 시)` → 단계 3의 E2E 명령 exit code 0. E2E 미정의 스택은 *해당 없음*으로 처리(통과).
- `AC 매핑 100%` → 본 milestone의 모든 task의 최신 `docs/40-validation/reports/<task-id>.md` `## AC ↔ 테스트 매핑` 섹션 항목이 모두 `✅`. report 부재 task는 미충족 처리.
- `P0 severity finding 0건` → `docs/40-validation/QA_FINDINGS.md`의 본 milestone 헤더(`## M-N`) 아래 `### P0` 섹션 항목 수 0.
- `(선택) 본 마일스톤 한정 추가 기준` → 본문 텍스트 그대로 평가(사용자가 자유 기재한 영역 — 해당 항목만 LLM 해석 허용).
- *UI 프로젝트의 자연스러운 추가 기준 example*: `DESIGN.md 모든 컴포넌트가 코드에 1+ 회 사용 + 8 상태 매트릭스 충족` — 채택은 사용자 결정.

판정 출력:
- 미충족 항목 발견 시 `졸업 가능: NO` + 미충족 항목 목록을 출력하고 *조기 종료 옵션*을 사용자에게 제시한다(강제 종료 아님).
- 모든 항목 충족 시 `졸업 가능: YES` 출력 후 다음 단계 진행.
- `--dry-run` 플래그가 켜져 있으면 위 평가만 돌리고 즉시 종료(qa·reviewer 위임 단계 4~6 생략).

2. 각 task의 status를 점검 — `done`이 아닌 항목이 있으면 명단을 출력하고 종료(완료를 강제하지 않음).
3. 통합 `validate` 명령을 실행한다 + (있으면) E2E 명령을 실행한다.
3-P. **(옵션) 탐색적 QA via browser/E2E MCP** (ADR-048#d6 registry-driven / ADR-043 보안 — STACK_SETUP_PLAN `## Optional MCP Connectors`에 browser/E2E capability MCP가 *등재 + `agent access` 부여* + UI 프로젝트일 때만; 미등재·access 미부여·비-UI는 silent skip + 사유 echo): 실제 앱을 구동해 본 마일스톤 feature의 시나리오(happy/alt/fail) + qa 엣지케이스를 *탐색*한다(accessibility 트리·클릭/입력·스크린샷·네트워크). 발견한 결함을 `docs/40-validation/QA_FINDINGS.md`에 기록하고, **재현 케이스를 영속 E2E 테스트(`validate:e2e`에 묶이는 커밋 가능한 파일)로 남길 것을 권장**(자동 커밋 X — stabilize는 코드·커밋 금지, 후속 task 제안). 실패는 `Type: bugfix` task(ADR-039)로 라우팅. **보안: `browser_run_code_unsafe`류 RCE급 도구는 사용하지 않는다** — accessibility snapshot·표준 브라우저 조작만.
4. **qa agent에 회귀·엣지케이스 점검 위임** — qa는 보고만 한다(qa.md의 tools에 Write 없음). 반환된 보고를 본 skill이 받아 `docs/40-validation/QA_FINDINGS.md`에 누적 기록한다. **위임 시 ADR-046#d3 적용: finding은 cap 때문에 누락하지 말고 전수 반환 — cap은 서술/과정 설명에만.**
5. **reviewer agent에 리팩토링 후보·아키텍처 부채 점검 위임** — reviewer 입력에 Clean Code 6항목 체크리스트(ADR-006) + `review surface: code` + **ADR-046#d3(finding 전수 반환 — report-only이므로 본 skill이 받아 적는다)** 를 명시 전달한다. **UI 프로젝트의 경우 추가로 `review surface: design` 으로 별도 위임 1회** — DESIGN.md `## 9. Do's and Don'ts` 위반 의심 grep 결과를 입력으로 받아 비판적 검토. reviewer 도 보고만 한다. 반환된 보고를 본 skill이 받아 `docs/40-validation/IMPROVEMENT_GUIDE.md`에 정리.
   - reviewer 결과에 구조 변경이 필요해 보이면 메인 세션에 architect 추가 호출을 텍스트로 제안.
6. 미흡한 ADR 후보 제안 — 마일스톤 중에 내려진 결정인데 ADR이 없는 것을 식별. ADR 후보 기준에 "layer 경계·의존성 규칙 변경"도 포함(ADR-006 정책).
   - ARCHITECTURE_OVERVIEW.md에 비해당 7-x sub-section이 *잔존*하면 IMPROVEMENT_GUIDE.md에 P2 보고 — *"조건부 sub-section 미삭제. /bootstrap-stack 재실행 또는 수동 삭제 권장."*
   - layer 경계·의존성 규칙 변경(ARCHITECTURE_OVERVIEW의 ## 3-1)이 마일스톤 중에 발생했으면 ADR 후보로 표시한다(정책: ADR-006).
### 6.5. DISCOVERY ↔ Charter staleness 감지 (ADR-035#amend-1)

다음 4 시그널을 점검한다 (보고만, 자동 차단 X — validator 책임 경계 정합).

1. `docs/10-charter/DISCOVERY.md`의 mtime이 `docs/10-charter/PROJECT_CHARTER.md`의 mtime보다 최신인지.
2. DISCOVERY.md `## 12. Assumption Tracker` 표에서 *"미검증"* 결과 항목 수.
3. PROJECT_CHARTER.md `## 2.1 페르소나` / `## 3.1 핵심 시나리오` / `## 9 핵심 가정` 섹션 중 비어 있거나 DISCOVERY.md와 명백히 어긋난 섹션 수.
4. (ADR-035#amend-2) DISCOVERY.md `## 15. Insight Backlog`에서 `status=open`(미반영) 인사이트 수 — 있으면 *"미반영 인사이트 N건 — /plan-workitem 회수 권장"* P1 보고.

위 1~3 시그널 중 1개라도 *stale 의심* 판정 시 IMPROVEMENT_GUIDE.md에 P1 보고:
*"DISCOVERY ↔ Charter drift 의심 — /bootstrap-project --apply 또는 수동 갱신 권장."*
(시그널 4는 drift가 아니라 *미반영 인사이트* 신호 — 위 4번 줄에서 별도 P1 보고하므로 본 집계에 포함하지 않는다.)

7. ARCHITECTURE_OVERVIEW의 `## 3-1. 레이어 경계 + 의존성 규칙` 섹션이 비어 있고 모듈 수가 3개 이상이면 채울 것을 권장 출력한다(정책: ADR-006).

7-T. **Telemetry aggregate** ([ADR-047](../../../docs/90-decisions/boilerplate/ADR-047-code-as-agent-harness.md) D7 deep telemetry + D1 inspectability 정합). 본 마일스톤 산하 task의 *이미 수집된 데이터*를 수치 dashboard로 echo. 새 데이터 수집 X — surface만.

수집 소스:
- 본 마일스톤 산하 모든 task의 `docs/40-validation/reports/<task-id>.md` (존재 시).
- 본 마일스톤 산하 feature의 `## 7-1. FAC ↔ AC 매핑표`.
- `docs/40-validation/QA_FINDINGS.md` 본 milestone 헤더(`## M-N`) 아래.
- `docs/40-validation/IMPROVEMENT_GUIDE.md`의 `## 2. 즉시 수정할 항목` 및 `## 3. 권장 리팩토링` 안의 본 milestone sub-section (`### M-N` 그룹) — Cross-stabilize 회귀 신호 grep 대상. **`## 5. Repair decision log`는 제외** (Step 3 신설 영역, *closed records*라 *open finding 재등장* 측정 대상 아님).

집계 항목:
- Tasks: M done / N total (M/N %)
- AC↔테스트 매핑: A ✅ / B total (A/B %)
- FAC coverage: C ✅ / D total (C/D %)
- Evidence Bundle 신뢰도 분포: High K / Medium L / Low J (Step 2 도입 후 채워짐 — 미도입 마일스톤은 "해당없음" 한 줄)
- Validate exit code (가장 최근 실행): 0 / non-zero / 미설정
- Findings 분포: P0 X / P1 Y / P2 Z (본 milestone 헤더 산하)
- Cross-stabilize 회귀 신호: *이전 모든 milestone들*(`## M-1` ~ `## M-(N-1)`)의 P1 라벨 finding이 본 milestone의 **QA_FINDINGS(`## M-N`)** 또는 **IMPROVEMENT_GUIDE 의 `## 2. 즉시 수정할 항목`/`## 3. 권장 리팩토링` 안 `### M-N`** 두 sub-section에 *재등장*한 항목 수 (라벨 grep, 휴리스틱 한계 echo — 동의어/오타 false-negative 가능. 본 grep은 *정확한 라벨 매칭*만 잡음. `## 5. Repair decision log`는 *closed records*라 회귀 신호 대상 아님).

본 단계는 *수치 echo만* — IMPROVEMENT_GUIDE / QA_FINDINGS에 새 항목 박지 않음. Cross-stabilize 회귀 신호가 1+ 건이면 단계 8 출력의 "P1 / P2 후속 작업"에 *patterned drift 의심* 한 줄 추가.

출력 형식 (단계 8의 최종 출력에 *Telemetry* 단락으로 포함):
```
Telemetry — M1
- Tasks: 12 / 12 (100%)
- AC↔테스트 매핑: 34 / 36 (94.4%)
- FAC coverage: 8 / 8 (100%)
- Evidence Bundle 신뢰도: High 9 / Medium 2 / Low 1
- Validate exit code: 0
- Findings: P0 0 / P1 3 / P2 7
- Cross-stabilize 회귀 신호: 0건
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

책임 경계:
- 코드 수정·커밋·workitem status 변경 금지.
- 누적 문서 갱신 + milestone `## 8. 회고` 자동 채움.
- *상세 SSOT 는 본 skill 도입부 책임 경계 단락* — 본 단락은 단순 재확인.

E2E 명령이 없는 스택은 3단계에서 통합 `validate`만 돌리고 E2E는 skip한다(출력에 명시).

## Dependency hygiene
> 실행 시점: 단계 4~5(qa·reviewer 위임)와 함께 수행하고 결과를 단계 8 최종 출력 *전에* IMPROVEMENT_GUIDE 에 기록한다 — 본 섹션이 문서 끝에 있다고 *마지막에* 실행하는 것이 아니다.
- `npm audit` / `pip-audit` (스택별 대응) 1회 실행.
- 결과를 IMPROVEMENT_GUIDE.md에 P1 severity로 보고.
- 6개월 unused deps는 P2로 자동 등록.

## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 ADR/architecture 섹션은 task 본문에서 발화 시 인용 — 사전 fork-load 금지.
