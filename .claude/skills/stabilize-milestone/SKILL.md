---
name: stabilize-milestone
description: Stabilize a milestone — run E2E + regression + refactoring/ADR review. No code changes, no commits.
argument-hint: "[milestone id] [--dry-run | --feature F-NNN]"
disable-model-invocation: true
allowed-tools: Read Glob Grep Write Edit Bash Agent
---

본 skill은 evaluator-optimizer pattern의 evaluator orchestration이다 (ADR-014#amend-1).

이 skill은 **코드 수정·커밋·workitem status 변경을 하지 않는다.**
다음 네 종류의 문서 갱신만 정상 책임이다:
1. `docs/40-validation/QA_FINDINGS.md` 누적 기록 (qa 위임 결과).
2. `docs/40-validation/IMPROVEMENT_GUIDE.md` 누적 기록 (reviewer 위임 결과 + deterministic preflight 결과).
3. milestone 문서의 `## 8. 회고` 섹션 자동 채움 ([ADR-014](../../../docs/90-decisions/boilerplate/ADR-014-milestone-graduation.md) graduation contract — status 변경 X, 본문 단락 갱신만).
   - 회고 본문: **graduation 줄(`YES|NO|BLOCKED (날짜)` — 단계 8 판정 영속, ADR-057#amend-1)** + 4 항목: 목표 달성도 / scope creep / 비목표 위반 / 핵심 학습 3개 이내.
4. `docs/10-charter/DECISION_REGISTER.md` **append** — 점검에서 드러난 *기획 결정*을 `status: open` + `- 발견: 봉인 후 (M<N>)`으로 등재(ADR-060 D11 writer). 기존 항목의 상태는 바꾸지 않는다. 상세는 아래 `봉인 후 새 결정 등재` 절.

그 외 변경은 금지한다 — milestone 문서의 `## 0. Status` / `## 1~7` 섹션 / 다른 workitem 문서 / 코드 일체.
후속 작업이 필요하면 `/repair-workitem` 또는 새 task로 텍스트 제안만 출력한다.

**실행 single-origin (ADR-054)**: `validate`/`validate:e2e`/`npm audit` 실행 + QA_FINDINGS/IMPROVEMENT_GUIDE/회고 *쓰기*는 본 skill(origin)이 *한 번만*. **같은 checkout에서 stabilize 2개 동시 실행 금지**(포트·테스트DB·Playwright outputDir·빌드캐시 충돌 + tracked-doc clobber). 다른 모델 2nd opinion은 *읽기 전용* `/validate-milestone <M> --reviewer-tag <tag>` 병렬 → `/repair-milestone`이 종합(실행은 origin 1회).

입력:
- `$ARGUMENTS`에는 milestone ID(예: `M1`)가 들어온다.
- `--dry-run` 플래그가 있으면 1.5 Graduation pre-check만 돌리고 종료(P0 검증 도구 — 전체 QA 없이 빠른 졸업 가능 여부 확인).
- `--feature F-NNN` 플래그(ADR-057 결정 6): **입력 검증 먼저 — (a) F-NNN이 milestone `## 3. 포함되는 기능`에 없으면 "해당 milestone 소속 아님" 안내 후 종료(QA finding 오기록 방지), (b) `--dry-run`과 상호배타 — 둘 다 주면 안내 후 종료(`--dry-run`은 §1.5만 실행, `--feature`는 §1.5 skip이라 충돌).** 통과 시 **feature 스코프 점검** — §1.0 preflight는 항목 3(FAC unmapped)만 — **그 항목도 해당 feature의 `## 7-1`으로 한정**(뒤 feature의 unmapped FAC를 P0로 올리지 않는다 — 스코프 일탈 방지), **단계 2(task status 점검)는 해당 feature의 task만 대상**(뒤 feature의 미완료 task 명단으로 종료하지 않는다 — 마일스톤 중간 실행이 본 플래그의 존재 이유), §1.5 graduation pre-check는 skip(**졸업 판정은 milestone 전용** — 출력에 "본 실행은 졸업 판정이 아님"을 명시), 단계 3 validate 1회 + 3-P/3-V(ADR-056)/단계 4 qa fan-out을 해당 feature의 화면·시나리오 한정(**단, 3-V의 screen-keyed 프로토타입 대조는 composite 화면(여러 feature 합성)에서 그 feature가 소유한 영역만 판정 — 미구현 sibling feature 영역은 "부분 구현 — 판정 보류"로 처리해 false `[Experience-drift]`를 억제**). **skip 단계는 실제 헤딩 기준으로 단계 5(reviewer)·6(ADR 후보 제안)·6.5(staleness)·7(ARCH 3-1 권장)·7-T(telemetry)**. **단, 단계 4 qa fan-out을 실행하므로 그 결과 기록을 위해 6-S(self-synthesis)는 수행하되 qa 축만 종합**한다(reviewer(5)를 skip하므로 IMPROVEMENT_GUIDE의 reviewer 기록분은 없고 QA_FINDINGS만 갱신 — qa fan-out 결과가 미종합으로 유실되지 않게). **milestone 문서 `## 8. 회고` 자동 채움도 skip**(회고는 milestone 전체 stabilize 전용 — 중간 상태 덮어쓰기 방지). QA_FINDINGS 기록은 기존 스키마 유지 — `## M-N` 아래 `### P0/P1/P2` 섹션에 적되 각 항목 문두에 `(F-NNN)` scope 태그를 붙인다(**별도 `### F-NNN` 헤더 금지** — graduation의 "`### P0` 섹션 항목 수" 카운트와 repair-milestone 회수가 severity 섹션 스키마를 소비한다). read-only·실행 single-origin(ADR-054) 불변.

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
   - **Surfaces forward check (ADR-045#d3·#d4)**: `## Surfaces` 블록을 가진 각 ADR에 대해 — 등재 파일이 모두 존재하고 본문에 `ADR-NNN` 역참조를 갖는가. 누락 시 `P1 [Surface-backref] ADR-NNN → <file>`. 대상 ADR의 `## Status`가 `superseded`/`deprecated`면 forward-check에서 skip한다(live sync 소스만 점검 — 죽은 ADR의 잔존 Surfaces는 별도 [Ref-dead]가 담당). **이 forward 방향만 Phase 4 범위** (역방향은 휴리스틱이라 Phase 5 검토).
   - **죽은 ADR 인용**: 인용된 ADR의 `## Status`가 `superseded`/`deprecated`면 `P2 [Ref-dead] <file:line>`.
   - **인덱스 amend 동기**: `boilerplate/README.md` Amendments 컬럼 amend 수 ↔ 코드펜스(```)·`<!-- -->` 주석 *밖의* 본문 `## Amendment N` 수 일치(예시·주석 헤딩 제외; 불일치 `P1 [ADR-index]`). (review-doc과 중복 가능.)
3. **FAC ↔ AC unmapped 검출** ([ADR-037](../../../docs/90-decisions/boilerplate/ADR-037-spec-coverage-audit.md)#amend-1 영속 SSOT `## 7-1` 정합):
   - 본 마일스톤의 모든 feature 문서 `## 7-1. FAC ↔ AC 매핑표`에서 *unmapped* 또는 *비어 있음* 항목 회수.
   - 발견 시 IMPROVEMENT_GUIDE에 `P0 [Spec-gap] F-NNN:FAC-N → unmapped` 기록 + graduation NO 유지 + 사용자 보고. 구현 후에는 plan-workitem으로 task를 자동 추가하지 않으며, 담당 task가 있으면 repair, 없으면 ADR-057#amend-3 결정 6의 사용자 명시 결정 경로를 따른다.
4. **모드 라벨 ↔ 본문 정합 휴리스틱** (ADR-012): 모든 `docs/00-meta/` 파일의 `> 모드: ...` 라벨이 본문과 명백히 어긋나는지 점검 (휴리스틱 한계 명시).
   - mismatch 시 P2 `[Doc-mode] <file>` 기록.

5. **DESIGN.md + ARCH 7-x cross-surface drift 검출** (ADR-027#d19) — *(5-2) 는 정규식 기반 deterministic, (5-3)(5-4) 는 mechanical/best-effort heuristic — 휴리스틱 한계는 항목별 echo*:

   5-0. **변경 파일 회수 — git diff 의존 금지**: stabilize-milestone 은 정상 lifecycle 에서 `/finalize-workitem` 으로 *이미 커밋된* 후 호출되므로 working tree `git diff` 는 비어 있다. 본 마일스톤 task 의 변경 파일 회수 우선순위:
   - **(a) 1차 — task 문서**: 본 마일스톤 산하 모든 task (`docs/30-workitems/tasks/T-*.md`) 의 `## 4-1. 변경 예정 파일/경로` 본문 회수. (TASK_TEMPLATE 정합 — finalize 시 `--apply` 또는 명시 update 로 채워짐)
   - **(b) 2차 — commit log fallback**: `## 4-1` 비어 있거나 git 실제 변경과 어긋난 task 는 `git log --grep "Refs: T-NNN" --name-only` 로 commit 로그의 변경 파일 회수 (ADR-008#amend-2 Refs footer 정합).
   - **(c) 3차 — validation report fallback**: 위 둘 다 비어 있는 task 는 `docs/40-validation/reports/<task-id>.md` 의 diff trace audit 단락 회수.
   - **(d) 모두 실패 시**: 본 task 는 *조사 불가* 로 표시 + IMPROVEMENT_GUIDE 에 `P2 [Stabilize-recovery] T-NNN — 변경 파일 회수 불가` 기록 후 다음 task 로 계속.

   5-1. **UI 프로젝트 판정** — **ADR-027#amend-3 "UI 판정 다중신호 절차"** 적용(부재→비-UI: 5-1~5-3 skip+사유 echo / status≠draft→UI: 5-1~5-3 활성 / status=draft+추가신호≥1→UI 의심: IMPROVEMENT_GUIDE에 `P1 [Design-draft] DESIGN.md status=draft + UI 신호 감지 — /bootstrap-design 권장` 기록 + 5-1~5-3 활성 / 신호 0→silent skip).

   5-2. **UI 프로젝트 — raw color grep** (정규식 deterministic, **기록 등급 — 진행 차단 안 함**): 5-0 에서 회수한 변경 파일 중 아래 두 갈래로 검사한다.
   - **웹 계열** — 확장자 `.tsx`/`.jsx`/`.ts`/`.js`/`.vue`/`.svelte`/`.astro`/`.css`/`.scss`/`.html`: `#([0-9A-Fa-f]{8}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{3})\b` 패턴 grep(ERE — 3·4·6·8자리 hex 전부; `\b`로 더 긴 hex 런의 부분매치 방지). 일치 시 `P1 [Design-rawhex] <file:line> — DESIGN.md ## 2 token 으로 교체 권장`.
   - **Dart 계열** — 확장자 `.dart`: ① `Color\(0x[0-9A-Fa-f]{6,8}\)` 및 `Color\.from(ARGB|RGBO)\(` → `P1 [Design-rawhex] <file:line>` ② `\b(Colors|CupertinoColors)\.[a-zA-Z]+` (프레임워크 기본 팔레트 사용 — 값을 박은 것은 아니나 프로젝트 토큰을 우회함) → `P1 [Design-token-grep] <file:line> — 테마에서 가져오도록 교체 권장`. 두 라벨은 원인과 수정 방법이 달라 분리한다. **`[Design-token]`(접미 없음)은 reviewer 의 LLM 판정 차원이 이미 쓰는 라벨이므로 grep 결정분에는 `-grep` 접미를 붙인다** — `[Design-voice-grep]`/`[Design-voice]` 분리와 같은 규칙이며, 회귀 신호 집계가 라벨 정확 일치로 동작하므로 겹치면 오집계된다.
   - **Dart 정의 라인 예외**: `static +const +Color +[A-Za-z_]+ *=` 형태의 줄은 토큰 *정의*이므로 제외한다(웹의 CSS custom property 정의 라인 예외와 동형).
   - **한계(사실 기록)**: 본 검사는 문자열 검색이라 문법을 이해하지 못한다. **주석 안·문자열 리터럴 안의 색값도 함께 잡는다**(실측 확인). 그래서 본 항목은 기록 등급이며 진행을 차단하지 않는다. 문법을 이해하는 검사가 필요하면 Dart 의 공식 analyzer plugin 방식과 별도 패키지인 `custom_lint` 중 하나를 고른다(둘은 같은 것이 아니다 — ADR-059 D6).

   > 웹 계열의 **제외 (ADR-056#amend-2 — 정의/사용처 라인 구분)**: (a) DESIGN.md 자체 파일, (b) `docs/20-system/prototypes/` 하위(자기완결 프로토타입), (c) **CSS custom property *정의* 라인**(`--<name>: #hex` 형태 — 토큰 정의는 정상; dogfood `src/index.css :root` 오탐 해소). **파일명(`theme`/`tokens` 등)으로 파일 전체를 빼지 않는다**(사용처 위반 은폐 방지 — 정의/사용처는 (c) 라인 형태로만 구분). 검사 대상은 정의 밖 *사용처*(`color:#hex`·`background:#hex` 등) raw hex — 전면 `:root` 제외 금지.

   5-2b. **UI 프로젝트 — voice grep** (정규식 deterministic — ADR-056 결정 10): 5-0 회수 변경 파일(5-2의 웹 계열 확장자 집합 + `.dart`)에서 (a) placeholder 카피 패턴(`lorem ipsum`/`TODO copy`/`sample text`/`여기에 텍스트`), (b) DESIGN.md `## 10` "금지 표현"의 `[grep 가능]` 정규식을 grep. 일치 시 `P1 [Design-voice-grep] <file:line> — DESIGN.md ## 10 위반` 기록. DESIGN.md `## 10` 부재 시 (a)만 수행. **DESIGN.md 자체는 grep 대상 제외** (규칙 정의 영역 — 5-2와 동형).

   5-3. **UI 프로젝트 — 컴포넌트 인벤토리 drift** (best-effort heuristic): `src/components/`, `app/components/`, `components/`, `lib/widgets/`, `lib/**/widgets/` 중 존재하는 디렉터리의 컴포넌트 파일명 (예: `Button.tsx`, `Card.tsx`, `primary_button.dart`) 목록 ↔ DESIGN.md `## 7. Components` 본문에 명시된 컴포넌트 이름 비교. 코드에는 있지만 DESIGN.md 에 없는 컴포넌트 발견 시 `P1 [Design-inventory-drift] <component> — DESIGN.md ## 7 등록 권장` 기록. 반대 (DESIGN.md 에 있는데 코드에 없음) 는 unimplemented planned component → `P2 [Design-inventory-pending] <component>` 기록. **휴리스틱 한계 echo 권장** (`인벤토리 drift 검출은 free-form 문서 키워드 매칭 — false positive/negative 가능`).

   5-4. **7-x Don'ts 위반 grep** (best-effort heuristic): ARCH 의 `## 7-1` / `## 7-2` / `## 7-5` 의 `### Don'ts` 본문에서 *명시적 금지 키워드* 를 추출 → 5-0 회수 변경 파일에서 해당 키워드 grep. 위반 의심 발견 시 `P1 [Arch-iface-violation] <file:line> — ARCH ## 7-N Don'ts 위반 의심: <키워드>` 기록 — **free-form 키워드 적중은 확정 위반이 아니라 *확인 후보*이므로 P1 로 적고 `/repair-milestone` 의 4-판정에서 확인한다**(확정 위반과 같은 라벨을 쓰면 라벨을 읽는 쪽이 차단력을 오인한다 — 실측). **휴리스틱 한계 echo 강제** (`Don'ts 키워드 추출은 free-form 텍스트 기반 — false negative 多. 본 grep 미작동 시 reviewer 의 design surface 위임이 보조 catch`).

   > **7-3 백엔드 / 7-4 프론트 의 milestone-level deterministic gap 명시**: 현 ARCH TEMPLATE 의 `## 7-3` / `## 7-4` 는 `### Don'ts` 자리가 없어 본 5-4 grep 이 *skip* 한다(`## 7-5`는 `### Don'ts`를 가지므로 대상이다). 단 이것이 *전면 gap 은 아니다* — 7-3/7-4 결정과의 정합은 **per-task validate-workitem (validator.md 의 인터페이스 CHECK 규칙 — UI/API/CLI/7-x) 의 CHECK 단계가 task 단위로 점검**한다 (DB migration / 인증 / 트랜잭션 / 라우팅 / 상태관리 등). 즉 *milestone-level deterministic preflight* 에서만 빠지고, *task-level validation* 에서는 잡힌다. milestone 누적 drift 가 우려되면 stabilize 의 reviewer `code` surface (Step 5) 가 아키텍처 부채로 추가 catch. 향후 7-3/7-4 에 `### Don'ts` 자리를 TEMPLATE 에 추가하면 본 grep 도 확장 가능 (별도 ADR-027 amend 후보).

   5-5. **해당 스택 부재 시 본 항목 skip** + skip 사유 echo: `[Design/Arch-iface] check skipped: <reason>`. 예: `[Design] check skipped: docs/20-system/DESIGN.md 부재 (비-UI 프로젝트)`.

6. **고-stakes 설계 근거 누락 (ADR-053 backstop, best-effort)**: ARCHITECTURE_OVERVIEW `## 7`의 *실제 작성된*(HTML 주석 placeholder 제외) 결정 블록에서 필수 칸(옵션≥2/신뢰도/재검토)이 비면 `P2 [Design-rationale] <위치>` 기록. **한계**: 고-stakes 결정을 한 줄 산문으로 쓴 경우는 못 잡음(휴리스틱).

7. **Skill 로스터 fan-out 정합 (cross-doc, deterministic — ADR-010#amend-3 README SSOT + STRUCTURE 로스터 정합 집행)**:
   - `.claude/skills/*/` 디렉터리명 집합 ↔ `docs/00-meta/STRUCTURE.md`의 `Claude skill 본문` 행 괄호 목록이 일치하는가. 불일치 시 `P1 [Roster-drift] <skill> — STRUCTURE 로스터`.
   - `README.md`/`README_ko.md`의 *자연어 호출 skill 목록 두 곳*(정책 요약 문단의 "Remaining skills/나머지 skill" + "For remaining skills/나머지 skill(...)" 명시 목록)이 서로 일치하고, `(.claude/skills 집합) − (.agents/skills wrapper 집합)`과 같은가. 불일치 시 `P1 [Roster-drift] <skill> — README 자연어 목록(<어느 위치>)`.
   - **cross-LLM 리뷰 skill 등재 (D3 재발 지점, deterministic)**: `validate-plan`·`validate-discovery`·`validate-milestone` 각각이 `docs/00-meta/DELEGATION_STRATEGY.md` 위임 표에 등장하는가(skill 이름 grep). 미등재 시 `P2 [Roster-drift] <skill> — DELEGATION 위임 표`.
   - **cross-LLM 리뷰 skill wrapper 존재 (ADR-010#amend-4, deterministic)**: `validate-plan`·`validate-discovery`·`validate-milestone`과 각 repair 짝(`repair-plan`·`repair-discovery`·`repair-milestone`)에 `.agents/skills/<name>/SKILL.md`가 존재하는가. 부재 시 `P1 [Roster-drift] <skill> — Codex wrapper 부재 (ADR-010#amend-4)`.
   - 발견은 IMPROVEMENT_GUIDE에 기록(보고만 — 차단 X). **한계**: WORKFLOW 산문 흐름 등재는 본 grep 범위 밖(reviewer 위임이 보조 catch).

8. **검증 장치 노후 감지 `[Guard-drift]` (deterministic — ADR-063 D4)**: **침묵 우선 — 아래 (a)~(d) 가 전부 정상이면 출력에 한 줄도 남기지 않는다** (skip 사유 echo 도 하지 않는다. 정상 상태를 매번 보고하면 그것이 노이즈이고, 검증 장치가 매 마일스톤 변경되는 것은 정상이 아니다). **단 아래 "선행: 파일 부재 처리" 는 예외다** — 점검을 아예 수행하지 못했다는 사실은 침묵하면 안 된다.
   - **선행: 파일 부재 처리** — `docs/00-meta/STACK_SETUP_PLAN.md` 는 baseline 이 아니라 `/bootstrap-stack` 생성물이다. 부재 시 본 항목 전체를 skip 하고 `Guard-drift check skipped: STACK_SETUP_PLAN.md 부재` 1줄만 남긴다(§1.0 의 `markdown-link-check` 미설치·원장 부재 선례와 동형).
   - (a) **registry 경로 실재** — **대상 절·검사할 열·조건을 아래로 고정한다**(deterministic 이려면 같은 입력에 같은 판정이 나야 한다. 절마다 스키마가 다르므로 "registry 행"만으로는 무엇을 볼지 정해지지 않는다). 부재 시 `P2 [Guard-drift] <절>:<경로> 부재 — /stack-guard 재실행 권장`.

     | 대상 절 | 검사할 열 | 조건 |
     |---|---|---|
     | `## E2E Smoke Registry` | `smoke 파일 경로` | 그 **행**의 `status` 가 `n/a` 가 아닐 때 |
     | `## Design Gate Adapter` | `adapter path` **만** | **절**의 `status` 가 `ready` 일 때 |
     | `## Dart Source Roots` | `경로` (pubspec 위치 기준 상대경로) | 그 절이 존재할 때 (비-Dart 스택은 `/bootstrap-stack` 이 절을 삭제하므로 대상 0) |

     - **`output path` 는 검사하지 않는다** — `design-gate-shots/` 는 `.gitignore` 대상이고 adapter 가 매 실행 통째로 생성·초기화하는 ephemeral 산출물이라 **fresh clone·정리 직후 부재가 정상**이다. 검사하면 매 마일스톤 오탐이 나 침묵 우선 원칙과 충돌한다.
     - `## Dependency Tools` 는 경로 열이 없어 대상이 아니다. `status: n/a`·미대상 행도 대상이 아니다 — e2e 비대상·비-UI 프로젝트에서 경로가 없는 것은 정상이다.
     - 템플릿 예시 행(`(예: …)`)이 남아 있으면 그 경로는 실재하지 않으므로 그대로 `P2` 가 되며 처방(`/stack-guard` 재실행)이 정확하다 — 별도 예외를 두지 않는다.
   - (b) **design gate digest** — `## Design Gate Adapter` 의 `status` 가 **`ready` 인 경우에만**, 기록된 source digest ↔ 실제 adapter 파일의 SHA-256 일치를 확인한다. 불일치 시 `P2 [Guard-drift] design gate adapter digest 불일치 — /stack-guard 재실행 권장` (읽기 전용 — 여기서 고치지 않는다). 실행 명령은 OS 별로 — Unix/macOS `shasum -a 256 <path>` (또는 `sha256sum`), Windows PowerShell `Get-FileHash -Algorithm SHA256 <path>`. 두 도구 모두 없으면 이 항목만 skip + `digest check skipped: no sha256 tool`.
   - (c) **등록 밖 소스 디렉터리** — **소스 루트 registry 를 갖는 스택에서만 수행한다.** 현재 그 registry 를 갖는 것은 `## Dart Source Roots`(Dart/Flutter)뿐이며, **비-Dart 스택에서는 `/bootstrap-stack` 이 그 절을 삭제하므로 판정 기준이 없다 → 이 항목을 건너뛴다**(사유 echo 불요 — 침묵). 기준 없이 "등록 밖"을 판정하면 TS/Python/Go 의 `src/`·`tests/` 가 매 마일스톤 오탐으로 찍혀 침묵 우선 원칙과 정면 충돌한다. Dart 스택에서 발견 시 `P2 [Guard-drift] 등록 밖 Dart source root: <경로> — /stack-guard 재실행 권장`.
   - (d) **probe 판정 기록** — `## 통합 명령 사용법` 의 `probe smoke:` 값으로 판정한다.
     - **정상(무출력)**: `PASS (probe verified, …)` 2종 · **`PROBE OK, PROJECT FAIL`**. 후자는 probe 전 회차가 기대대로였고 **프로젝트 코드만** 실패한 상태이므로 검증 장치의 노후가 아니다 — 재실행해도 같은 결과이니 처방이 무의미하고, 그 프로젝트 실패는 졸업 item 2(`통합 validate Pass`)와 단계 3 이 이미 잡는다.
     - **`P2 [Guard-drift] validate 판정력 미검증 — /stack-guard 재실행 권장`**: `PROBE FAIL(<단계>)` · `PARTIAL` · `SKIPPED (…)` · **줄 자체 부재**.
     - **여기서 probe 를 다시 돌리지 않는다 — 기록된 문자열만 읽는다**(read-only 계약). 이것이 `/stack-guard` 의 미검증 상태가 조용히 잊히지 않는 유일한 경로다(ADR-063 D3 기록 → D4 회수).
   - `validate` 4단계 커버리지의 **재측정**은 본 항목이 아니다 — 실측은 `/stack-guard` 재실행 시 probe 가 하고, 본 항목은 (d) 로 그 **기록**만 읽는다(ADR-063 D1·D4 — 중복 회피 + read-only 유지).
   - 회수 경로는 기존과 동일하다 — IMPROVEMENT_GUIDE 에 기록하면 다음 `/plan-milestone` R0 의 open 항목 회수가 사용자에게 재실행을 안내한다(`[ADR-candidate]`·`[Stack-drift]` 와 동형, 신설 없음).

본 단계는 모두 *보고만* — 발견이 있어도 stabilize 후속 단계 차단 X (LLM 위임 단계로 계속). 후속 처리는 ADR-057#amend-3 결정 6 분기(기존 task 약속 결함=repair, cross-cutting=repair-milestone, 담당 없는 새 범위=사용자 보고+다음 M 후보)를 따른다.

**봉인 후 새 결정 등재 (ADR-060 D11)**: 마일스톤 점검에서 *기획 결정*(사용자가 정하거나 승인해야 할 것)이 드러나면 `docs/10-charter/DECISION_REGISTER.md`에 `status: open` + `- 발견: 봉인 후 (M<N>)` 줄로 등재한다. QA_FINDINGS/IMPROVEMENT_GUIDE는 *결함·개선*을 담고 원장은 *결정*을 담는다(둘 다 해당하면 양쪽에 각자 형식으로). 본 skill의 read-only 계약은 불변 — 원장 등재는 기존 QA_FINDINGS 기록과 동일한 정상 책임 범위다. 원장 파일이 없으면 등재를 건너뛰고 보고만 한다.

**review-doc 책임 분담**: [review-doc](../review-doc/SKILL.md)은 *단일 문서 ad-hoc 검토*에 한정. cross-doc / link / FAC↔AC는 본 deterministic preflight가 담당 — review-doc을 `--all`/`--milestone` 모드로 확장하지 않는다.

### 1.5. Graduation pre-check (ADR-014)

MILESTONE 문서의 `## 5. 완료 기준` 각 항목을 다음 deterministic 평가로 체크 (LLM 즉흥 판정 금지 — ADR-014 *P0 검증 도구* 정합):

- `모든 task status: done` → 본 milestone에 속한 모든 task 파일(`docs/30-workitems/tasks/T-*.md`)의 `## 0. Status` 값이 모두 `done`.
- `통합 validate Pass` → `validate` 명령 exit code 0. **normal 모드**: 단계 3에서 실행되므로 본 항목 판정은 단계 3 실행 후 확정된다 (1.5 가 단계 3 보다 먼저 와도 졸업 판정은 단계 3 결과를 반영). **`--dry-run` 모드**: 단계 3을 돌지 않으므로 본 1.5 단계 안에서 `validate` 를 1회 실행한다.
- `E2E Pass (needed → must pass)` → 단계 3의 e2e 상태 판정을 그대로 반영(ADR-052#amend-1 5상태). **`--dry-run` 모드**: 단계 3 미실행이라 입력이 없으므로 `E2E: dry-run skipped (졸업 판정 보류)` 로 표기:
  - **`NOT_APPLICABLE`** (비-UI ∧ graduation item 6에 e2e 미선언) → *해당 없음*(통과).
  - **`PASS`** (선언된 e2e 디렉터리 하위에서 1개 이상이 실제 실행·성공 ∧ 러너 전체 성공. registry 등록이 있으면 그 이름 일치까지) → 통과.
  - **`EMPTY`** (선언된 e2e 디렉터리 하위에서 **실행된** 테스트 0개 — 디렉터리가 비어 있거나 다른 디렉터리 테스트가 대신 실행됨. 실행됐는데 실패한 것은 `EMPTY`가 아니라 `FAIL`이다) → **`졸업 가능: NO` (hard)** + `Needs E2E Smoke`. 프로비저닝 단계와 달리 졸업 시점에는 차단한다(ADR-014#amend-4). *registry 미등록은 이 상태의 사유가 아니다* — 미등록은 `P1 [E2E-registry]` 기록 대상일 뿐이다.
  - **`FAIL`** (실행된 테스트 실패) → **`졸업 가능: NO` (hard)**. 후속은 단계 8의 `/repair-milestone` 분기로 라우팅.
  - **`BLOCKED_ENV`** (device/브라우저/toolchain 미설치·미기동) → **`졸업 가능: NO` (hard, blocked-on-env)**. real failure가 아니므로 라벨을 구분해 출력하고 환경 복구를 안내한다.
- `AC 매핑 100%` → 본 milestone의 모든 task의 최신 `docs/40-validation/reports/<task-id>.md` `## AC ↔ 테스트 매핑` 섹션 항목이 모두 `✅`. report 부재 task는 미충족 처리.
- `P0 severity finding 0건` → `docs/40-validation/QA_FINDINGS.md`의 본 milestone 헤더(`## M-N`) 아래 `### P0` 섹션에서 **`status: resolved`가 아닌(미해소) 항목 수 0**(`/repair-milestone`이 해소한 P0는 항목을 제거하지 않고 `status: resolved`만 표기하므로 이를 카운트에서 제외한다). 미해소 항목이 1+면 `졸업 가능: NO`.
- `(선택) 본 마일스톤 한정 추가 기준` → 본문 텍스트 그대로 평가(사용자가 자유 기재한 영역 — 해당 항목만 LLM 해석 허용).
- *UI 프로젝트의 자연스러운 추가 기준 example*: `DESIGN.md 모든 컴포넌트가 코드에 1+ 회 사용 + category expected 상태 충족(ADR-027#amend-7)` — 채택은 사용자 결정.

판정 출력:
- 미충족 항목 발견 시 `졸업 가능: NO` + 미충족 항목 목록을 출력하고 *조기 종료 옵션*을 사용자에게 제시한다(강제 종료 아님).
- 모든 항목 충족 시 `졸업 가능: YES` 출력 후 다음 단계 진행.
- **graduation은 §1.5에서 기록하지 않는다 — §1.5는 pre-check일 뿐**. 단계 4~6(qa·reviewer 팬아웃)이 *새 P0를 찾을 수 있으므로*, 최종 graduation(`YES|NO|BLOCKED (날짜)`)은 **단계 8 회고 자동 채움 시점에 최종 P0로 1회만** 기록한다(아래 회고 항목 정의 + 단계 8). 여기서 '최종 P0'는 **ADR-014 predicate 그대로 `QA_FINDINGS.md`의 본 마일스톤 `### P0` 미해소 0건**을 뜻한다 — 단계 4~6 중 **qa 팬아웃이 발견한 P0만 6-S에서 `QA_FINDINGS.md`에 기록되어** 이 predicate에 반영된다(**reviewer finding은 `IMPROVEMENT_GUIDE.md`로 가는 report-only — graduation predicate에 미반영**, stabilize §6-S 라우팅). preflight/reviewer finding을 *별도 predicate로* 세지 않는다(단일 predicate — ADR-014와 stabilize §1.5가 동일 기준). §1.5에서 조기 기록하면 이후 발견된 P0를 못 반영해 잘못된 YES가 박힌다.
- `--dry-run` 플래그가 켜져 있으면 위 평가만 돌리고 즉시 종료(qa·reviewer 위임 단계 4~6 생략 — 회고 미기록, graduation 판정 보류).

2. 각 task의 status를 점검 — `done`이 아닌 항목이 있으면 명단을 출력하고 종료(완료를 강제하지 않음).
3. 통합 `validate` 명령을 실행한다 + **e2e 필요성 판정 후 필수 실행**(ADR-052 — silent-skip 금지):
   - **3-a. e2e 필요성 판정**: 본 마일스톤이 e2e를 필요로 하는가를 deterministic 신호로 결정한다 —
     (i) **UI 프로젝트** (ADR-027#amend-3 다중신호 UI 판정: DESIGN.md status≠draft, 또는 status=draft+신호≥1) → 필요,
     (ii) graduation item 6 `(선택) 본 마일스톤 한정 추가 기준`이 e2e를 명시 선언 → 필요.
     둘 다 아니면 *불필요* → `E2E: 불필요 (비-UI ∧ item 6 미선언)` 한 줄 echo 후 통과 처리(이 경우만 skip 허용 — 사유 명시).
   - **3-b. 필요 시 `validate:e2e` 실행 (silent-skip 금지)**: e2e가 필요하면 반드시 실행하고 **구조화된 러너 출력**을 수집해 ADR-052#amend-1의 5상태로 분류한다. exit code만으로 판정하지 않는다.
     - **선행 확인**: `STACK_SETUP_PLAN.md ## E2E Smoke Registry`를 읽어 **선언된 runtime target 목록**과 각 target의 등록 여부를 회수한다. target이 둘 이상이면 아래 판정을 **target마다 따로** 내고, 하나라도 `PASS`가 아니면 졸업은 차단된다. **판정이 target마다 나므로 실행도 target마다 한다** — 진입점은 `validate:e2e` 하나이므로 target이 둘 이상이면 `npm run validate:e2e -- -d <device id>` 로 **target마다 한 번씩** 호출한다. `<device id>`는 registry의 *실행 대상 선택 규칙* 칸을 `flutter devices --machine`(Flutter) 등 러너의 device 조회 출력에 대입해 그때의 실제 id를 얻어 쓴다 — 규칙 문자열을 명령에 그대로 넣지 않는다(ADR-059 D4). target이 하나면 `-d` 없이 1회 호출로 충분하다. **등록이 없는 target도 명령은 실행한다** — 판정은 아래 경로 기준으로 하고 `P1 [E2E-registry] <target> — canonical smoke 미등록`만 기록한다(ADR-052#amend-1 결정 4).
     - **판정 규칙은 여기서 재서술하지 않는다** — `PASS` 필요조건 넷과 **판정 순서**(`FAIL(wiring)`·`BLOCKED_ENV` → `EMPTY` → `FAIL(project)` → `PASS`, 먼저 성립하는 상태로 확정)는 **ADR-052#amend-1 결정 3이 SSOT**다. 그 절을 읽고 그대로 적용한다. 순서를 뒤집으면 기동 불가나 테스트 실패를 `EMPTY`로 오분류해 "테스트를 쓰라"는 틀린 처방이 나간다. 종료코드가 0이어도 e2e 경로 밖 suite만 돌았으면 `EMPTY`다.
     - `FAIL`은 **`FAIL(wiring)`/`FAIL(project)` 하위 라벨을 구분해 기록**하고, `BLOCKED_ENV`는 real failure와 라벨을 구분한다 — 후속 처리 주체가 다르다(stack-guard 산출물 / 프로젝트 코드 / 환경 복구).
     - **host 제약으로 `BLOCKED_ENV`인 target은 registry의 `마지막 PASS(host·날짜·커밋)` 칸을 증거로 쓸 수 있다**(예: Windows에서 iOS). **유효 조건은 하나 — 기록된 커밋이 지금 판정하려는 커밋과 정확히 같을 때만** 인정하고 그 target을 `PASS`로 본다. 커밋이 다르면 `BLOCKED_ENV`를 유지한다 — **"그 사이 앱 코드가 바뀌었는지"를 판단하지 않는다**(판단 여지를 주면 증거가 슬며시 늘어난다 — ADR-059 D4). 증거를 채택했으면 출력에 `<target>: PASS (registry 증거 — <host>·<커밋>)`로 근거를 남긴다.
     - 출력 문자열 매칭은 위 판정을 보조하는 용도로만 쓴다.
   - **stabilize는 read-only다 — 여기서 e2e/코드를 고치지 않는다.** 실패(real/env 무관)는 단계 8의 `/repair-milestone` 분기로 텍스트 라우팅만 한다.
3-P. **(옵션) 탐색적 QA via browser/E2E MCP** (ADR-048#d6 registry-driven / ADR-043 보안 — STACK_SETUP_PLAN `## Optional MCP Connectors`에 browser/E2E capability MCP가 *등재 + `agent access` 부여* + UI 프로젝트일 때만; 미등재·access 미부여·비-UI는 silent skip + 사유 echo): 실제 앱을 구동해 본 마일스톤 feature의 시나리오(happy/alt/fail) + qa 엣지케이스를 *탐색*한다(accessibility 트리·클릭/입력·스크린샷·네트워크). 발견한 결함을 `docs/40-validation/QA_FINDINGS.md`에 기록하고, **재현 케이스를 영속 E2E 테스트(`validate:e2e`에 묶이는 커밋 가능한 파일)로 남길 것을 권장**(자동 커밋 X — stabilize는 코드·커밋 금지, 후속 task 제안). 실패는 `Type: bugfix` task(ADR-039)로 라우팅. **보안: `browser_run_code_unsafe`류 RCE급 도구는 사용하지 않는다** — accessibility snapshot·표준 브라우저 조작만.
3-V. **경험 게이트 — 구현 화면 vs 승인 프로토타입 대조 (ADR-056 결정 5, UI 확정 마일스톤 한정)**: 3-P(옵션·MCP-gated *탐색* QA)와 별개의 **MCP 불요 체계 감사**다. **UI 확정 마일스톤에서 실행 자체는 의무 — silent skip 금지**(미실행 시 사유를 단계 8 출력에 echo; 판정은 report-only). `--dry-run`에는 포함하지 않는다.
   - (a) 앱 기동(dev server) — **기동 명령은 `docs/00-meta/STACK_SETUP_PLAN.md`의 기록·`package.json` scripts(`dev`/`start`)에서 회수**(불명·실패면 blocked-on-env 라벨: §3-b 환경 실패 처리와 동형 — 사용자 환경 복구 안내 + 미실행 사유 echo). 본 마일스톤 핵심 화면(승인 프로토타입 보유 화면, ≤6~8개, 기본 뷰포트 1종)을 Playwright CLI로 스크린샷 → `docs/40-validation/visual/M-N/`에 저장(gitignore ephemeral). **각 화면의 진입 라우트·상태는 feature 문서 `프로토타입:` 참조 줄의 진입 메모에서 회수**. **촬영 전 readiness 확인(포트 응답 대기) 후 촬영하고, 완료 후 본 단계가 기동한 dev server를 종료한다**(기동 시 PID 회수 → 촬영 후 kill; 프로세스 누수·포트 잔류 방지. 3-P 등이 이미 서버를 띄운 상태면 재기동 대신 재사용 — "본 단계가 처음 기동" 가정 금지).
   - (b) 각 스크린샷을 Read(멀티모달)로 열람해 대조. **앵커 위계**: ① `docs/20-system/prototypes/M<N>/<screen>.html`(커밋된 승인본 — 존재 시. 같은 뷰포트로 `file://` 렌더-캡처해 나란히 대조 가능) ② 부재·면제 화면은 DESIGN.md §2 토큰/§7 컴포넌트/§9 Don'ts/§10 voice 파생 체크리스트로 fallback. 대조 관점: 레이아웃·상태(빈/에러 표현)·카피·토큰 준수 — 픽셀 일치가 아니라 *경험 계약 준수*(best-effort — 최종 확인은 사용자 육안).
   - (c) 불일치는 QA_FINDINGS에 `P1 [Experience-drift] <화면> — <불일치 1줄> (앵커: 프로토타입|DESIGN 파생)` report-only 기록(졸업 차단 X — item 6 채택 시만 차단). 판독 자체가 불확실하면 finding 대신 "판독 불확실" 명시.
   - (d) 최종 출력(단계 8)에 갤러리 경로 + "사용자 육안 확인 권장(스펙 자체의 오류는 사람이 잡는다)" 1줄.
   - Codex: 멀티모달 편차 시 (a) 갤러리 생성까지 수행 + (b) 대조는 "사용자 수동 검토" 안내로 degrade.
4. **병렬 qa verifier 팬아웃 — 고정 1개가 아니라 *필요한 만큼*** (feature / user-flow / surface 단위로 분할). 메인 세션이 본 마일스톤의 feature·핵심 시나리오·surface 목록을 회수해 *독립 점검 단위*로 쪼개고, 각 단위마다 qa agent를 1개씩 병렬 위임한다(회귀·엣지케이스 점검). qa는 보고만 한다(qa.md의 tools에 Write 없음).
   - **위임 시 ADR-046#d3 적용: finding은 cap 때문에 누락하지 말고 전수 반환 — cap은 서술/과정 설명에만.**
   - **Codex: 서브에이전트는 GA이나 본 저장소가 Claude persona 위임을 Codex subagent로 아직 매핑하지 않아 순차 단일 실행으로 degrade** (동일한 분할 단위를 *순차 단일 qa 호출*로 한 단위씩 처리, 결과는 동일하게 누적).
5. **병렬 reviewer verifier 팬아웃 — 필요한 만큼** (리팩토링 후보·아키텍처 부채). 각 reviewer 입력에 Clean Code 6항목 체크리스트(ADR-006) + `review surface: code` + **ADR-046#d3(finding 전수 반환 — report-only)** 를 명시 전달한다. **UI 프로젝트는 추가로 `review surface: design` reviewer를 1개 더 팬아웃** — DESIGN.md `## 9. Do's and Don'ts` 위반 의심 grep 결과를 입력으로 받아 비판적 검토. reviewer도 보고만 한다. design reviewer 입력에는 grep 결과에 더해 **렌더 증거**를 주입한다 — §3-V 갤러리 경로(`docs/40-validation/visual/M-N/`) + visual-qa.spec 최근 결과(존재 시). reviewer는 Read로 이미지를 열람한다(ADR-027#amend-6). Codex: 경로 echo + 텍스트 결과만 전달로 degrade.
   - **Codex: 서브에이전트는 GA이나 본 저장소가 Claude persona 위임을 Codex subagent로 아직 매핑하지 않아 순차 단일 실행으로 degrade** (분할 단위를 순차 reviewer 호출로 처리).
6-S. **메인 세션 self-synthesis (report-only 계약 유지)**: 위 4·5의 *모든* 병렬 verifier가 반환한 보고를 메인 세션이 직접 종합한다.
   - qa 보고 → `docs/40-validation/QA_FINDINGS.md`에 누적 기록. reviewer 보고 → `docs/40-validation/IMPROVEMENT_GUIDE.md`에 정리.
   - **no-cap-drop (ADR-046#d3)**: 여러 verifier의 finding을 합칠 때도 cap 때문에 누락 금지 — finding은 전수 기록하고, cap은 *대화 출력의 서술/과정 요약*에만 적용한다.
   - **dedup**: 분할 단위가 겹쳐 동일 finding이 여러 verifier에서 중복 반환될 수 있다. 동일 `<라벨> <file:line> <증상>` 항목은 1건으로 병합하되, *서로 다른 단위에서 관측됨*은 근거로 보존(병합 시 관측 surface를 한 줄로 합산).
   - reviewer 결과에 구조 변경이 필요해 보이면 메인 세션에 architect 추가 호출을 텍스트로 제안.
   - **stabilize는 여전히 read-only다** — self-synthesis는 *문서 누적 기록*까지만. 코드·커밋·workitem status 변경 없음(도입부 책임 경계 정합).
6. 미흡한 ADR 후보 제안 — 마일스톤 중에 내려진 결정인데 ADR이 없는 것을 식별하고, **IMPROVEMENT_GUIDE 항목 스키마(필수 4필드)로 영속 기록**한다: `- **M<N>-adrc-<K>** | P2 | [관측됨] | linked: M<N> | status: open` + 하위 줄 `- [ADR-candidate] <결정 한 줄> — 회수: 다음 /plan-milestone R0` (ADR-000#amend-2 — 기록 전 _ADR_GUIDE의 ADR 대상 기준 self-check, 남발 방지. 후보 ≠ 자동 작성). ADR 후보 기준에 "layer 경계·의존성 규칙 변경"도 포함(ADR-006 정책).
   - ARCHITECTURE_OVERVIEW.md에 비해당 7-x sub-section이 *잔존*하면 IMPROVEMENT_GUIDE.md에 P2 보고 — *"조건부 sub-section 미삭제. /bootstrap-stack 재실행 또는 수동 삭제 권장."*
   - layer 경계·의존성 규칙 변경(ARCHITECTURE_OVERVIEW의 ## 3-1)이 마일스톤 중에 발생했으면 ADR 후보로 표시한다(정책: ADR-006).
   - **[Stack-drift] ADR-101 staleness 감지 (ADR-055, report-only)**: 본 마일스톤에서 순증한 dep(산하 task `## 3` install line-item / lockfile diff)을 T2 임계 카테고리(언어/런타임/프레임워크/DB·영속성/인증/배포 토폴로지/핵심 외부 의존, 또는 ARCH §7 결정·charter §7 제약을 뒤엎음 — 개별로 사소해도 cluster로 넘으면 포함)와 대조. 임계를 넘으면 `P2 [Stack-drift] ADR-101 stale — 누적 dep가 T2 임계 도달 → /bootstrap-stack --migrate 후보 또는 ADR-101 amend`를 IMPROVEMENT_GUIDE에 기록. 임계 미달 누적은 침묵(피로 방지 — ADR-101은 dep 원장이 아님). 휴리스틱 한계 echo(키워드/lockfile diff 기반 — false negative 가능).
### 6.5. DISCOVERY ↔ Charter staleness 감지 (ADR-035#amend-1)

다음 4 시그널을 점검한다 (보고만, 자동 차단 X — validator 책임 경계 정합).

1. `docs/10-charter/DISCOVERY.md`의 mtime이 `docs/10-charter/PROJECT_CHARTER.md`의 mtime보다 최신인지.
2. DISCOVERY.md `## 12. Assumption Tracker` 표에서 *"미검증"* 결과 항목 수.
3. PROJECT_CHARTER.md `## 2.1 페르소나` / `## 3.1 핵심 시나리오` / `## 9 핵심 가정` 섹션 중 비어 있거나 DISCOVERY.md와 명백히 어긋난 섹션 수.
4. (ADR-035#amend-2) DISCOVERY.md `## 15. Insight Backlog`에서 `status=open`(미반영) 인사이트 수 — 있으면 *"미반영 인사이트 N건 — 다음 /plan-milestone 후보로 회수 권장"* P1 보고.

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
   - (UI) 경험 게이트 결과: [Experience-drift] N건 + 스크린샷 갤러리 경로 (사용자 육안 확인 권장) — 미실행 시 사유 필수 echo (silent skip 금지)
   - architect 호출 권장 (있으면)
   - ADR 후보 (있으면): `[ADR-candidate]` 라벨 목록 — 다음 /plan-milestone R0가 회수 (ADR-000#amend-2)
   - instruction improvement 후보:
     본 마일스톤 동안 builder/validator/reviewer가 반복적으로 막힌 패턴,
     AGENTS.md 또는 agent/skill body 문구가 *비자명하거나 모호*했던 지점,
     새로 박을 만한 *self-check 항목* 후보를
     [IMPROVEMENT_GUIDE.md](../../../docs/40-validation/IMPROVEMENT_GUIDE.md)에 보고.
     각 항목에 [ADR-022](../../../docs/90-decisions/boilerplate/ADR-022-ratchet-principle.md) evidence label 부착.
     *AGENTS.md / agent / skill body는 자동 수정 X — 보고만*.
     **경험·사용 관점 교훈(제품을 실제로 써 본 결과에서 나온 것) 유무를 별도로 확인**한다 — 교훈이 검증-정교화 방향으로만 쌓이는 편향 방지([관측됨] 실사용에서 경험 축 교훈 0건).
     - DESIGN.md / ARCH 7-x cross-surface drift 가 본 마일스톤 중에 N회 이상 발견됐다면 *ADR-027#amend-1 적용 본문* 이 누락된 fork 인지 점검 권장.
   - **Telemetry aggregate** (단계 7-T 결과 echo — 수치만, IMPROVEMENT_GUIDE 신규 항목 X).
   - **다음 단계** ([WORKFLOW.md "스킬 종료 시 다음 단계 출력 contract"](../../../docs/00-meta/WORKFLOW.md) 양식 정합):
     - **졸업 가능 = YES + P0 후속 0건**:
       - 기본 권장: `/plan-milestone` — 새 milestone(M-(N+1)) + feature 문서 생성 → `contract-ready`. 뒤이어 `/plan-workitem M-(N+1)`(전체 계획 스냅샷, task는 `draft`) → **`/seal-milestone M-(N+1)`**(검사·승인·일괄 `ready`) 순으로 진행(ADR-057#amend-3 / ADR-060 D7)
       - 프롬프트 동봉 권장: 본 라운드 Telemetry 의 신뢰도 분포 + Cross-stabilize 회귀 신호 (다음 milestone 의 우선순위 조정 입력)
     - **졸업 가능 = NO 또는 P0 후속 있음** (분기 옵션 ≤3):
       - **milestone-level P0/P1 (여러 task 교차) 또는 e2e real failure 있음: `/repair-milestone M-N` 권장** (ADR-052) — 단일 task로 격리되지 않는 회귀·교차 결함과 실제 e2e 수정은 milestone 단위 repair로 라우팅. stabilize가 read-only로 남기 위한 코드 수정 경로다.
       - QA_FINDINGS 발견(P0/P1)은 단일 task 격리든 교차든 `/repair-milestone M-N` 로 회수한다 — repair-milestone이 4-판정 후 cross-cutting은 직접 수정하고, per-task 코드 결함은 finding 요약과 함께 repair-workitem에 위임(아래 finding-mode)한 뒤 QA_FINDINGS status를 닫는다. (직전 validate가 Needs Fix report를 남긴 task는 기존대로 `/repair-workitem T-NNN` 직접 — report 기반이라 정상.)
       - `[Spec-gap]` finding 있음: 미커버 FAC를 분기 — (i) M-N이 *약속한* FAC의 구현 누락·버그이고 담당 task가 있으면 **현재 M-N에서 `/repair-workitem`(단일) 또는 `/repair-milestone`(교차)**; **담당 task 자체가 없으면**(정상적으론 plan-time `[Plan-FAC-coverage]` 100% 게이트가 막으므로 드묾) 현재 M-N의 미이행 약속으로 graduation `NO`를 유지하고 사용자에게 보고한다. 현재 M에 새 task를 자동·권장 생성하거나 FAC 취소로 거짓 통과시키지 않는다. 본 계약에 정해진 자동 해소 경로는 없으며 사용자 판단을 기다린다. (ii) *새 기능·기획 변경*(M-N 약속 아님)이면 다음 마일스톤(M-(N+1)), (iii) 계획이 근본적으로 잘못됐으면 자동 수정 없이 **사용자 중단·보고** (ADR-057#amend-3 결정 6 — F-NNN 재계획 경로 없음)
       - `[Doc-link]` / `[ADR-ref]` 등 문서 정합 P0: 사용자 직접 수정 (architect 또는 메인)
       - **e2e blocked-on-env (ENVIRONMENT failure)**: real failure가 아니므로 repair 대상 아님 — 사용자에게 환경 복구(브라우저 설치 / 앱 기동 / E2E MCP 등재·access)를 안내하고 환경 복구 후 `/stabilize-milestone M-N` 재실행 권장.
     - **공통 프롬프트 동봉 권장**:
       - 미해결 P0/P1 라벨 목록 (다음 호출의 우선 처리 대상)
       - Cross-stabilize 회귀 신호 항목 (있으면 — patterned drift 경고)
       - 본 마일스톤의 instruction improvement 후보 (있으면 — 다음 stabilize 라운드에서 회수)

책임 경계:
- 코드 수정·커밋·workitem status 변경 금지.
- 누적 문서 갱신 + milestone `## 8. 회고` 자동 채움 — **회고의 `graduation:` 줄은 단계 4~6 종료 후 graduation 5+1 기준 *전체를 최종 상태로 재판정*해 기록**(P0 기준은 `QA_FINDINGS.md`의 미해소 P0만 — qa 팬아웃分; reviewer는 report-only로 미반영)(task status·통합 validate·e2e·AC 매핑 100% = 단계 3 결과 + P0 0건 = 단계 4~6 반영 + 추가 기준; YES|NO|BLOCKED+날짜; §1.5 사전점검이 아니라 여기서 확정 — ADR-057#amend-1·ADR-014). 로드맵 파일은 안 건드린다(다음 plan-milestone R0가 이 줄을 읽어 재조정).
- *상세 SSOT 는 본 skill 도입부 책임 경계 단락* — 본 단락은 단순 재확인.

E2E는 단계 3-a의 *필요성 판정*으로 결정한다 — e2e 불필요(비-UI ∧ graduation item 6 미선언) 마일스톤만 통합 `validate`만 돌리고 e2e를 skip한다(사유 출력 명시). **e2e 필요 마일스톤은 silent-skip 금지** — `validate:e2e`를 반드시 실행하고, 미통과(real) 시 졸업 hard-block, 실행 불가(env) 시 사용자 환경 복구 안내(ADR-052).

## Dependency hygiene
> 실행 시점: 단계 4~5(qa·reviewer 위임)와 함께 수행하고 결과를 단계 8 최종 출력 *전에* IMPROVEMENT_GUIDE 에 기록한다 — 본 섹션이 문서 끝에 있다고 *마지막에* 실행하는 것이 아니다.
- `npm audit` / `pip-audit` (스택별 대응) 1회 실행. **Dart/Flutter 는 audit 에 정확히 대응하는 명령이 없어 아래 셋으로 나뉜다** — 목적이 서로 달라 하나로 묶어 보고하지 않는다. **셋 다 읽기 전용 경로만 쓰고, 도구를 설치하지 않는다**(본 skill 은 파일을 고치지 않는다). 미설치 도구는 그 항목만 skip 하고 사유를 출력에 명시한다(`Doc-link check skipped` 와 동형).
  - **갱신 가능 여부**: `flutter pub outdated` — 내장이고 `pubspec.lock` 을 바꾸지 않는다.
  - **미선언·미사용 의존**: `dart pub global run dependency_validator`. 미활성이면 skip + `dep hygiene skipped: dependency_validator not activated (dart pub global activate dependency_validator — 사용자/stack-guard 소관)`.
  - **취약점**: `pubspec.lock` 을 대상으로 `osv-scanner` 실행. 미설치면 skip + 사유 명시. **`dart pub get` 의 advisory 출력을 쓰려면 반드시 `--enforce-lockfile` 을 붙인다** — 플래그 없는 `pub get` 은 해결 결과를 `pubspec.lock` 에 **쓰므로** read-only 계약을 깨뜨린다. 플래그를 못 쓰는 환경이면 이 경로를 생략하고 `osv-scanner` 결과만 쓴다.
- 결과를 IMPROVEMENT_GUIDE.md에 P1 severity로 보고.
- 6개월 unused deps는 P2로 자동 등록.

## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 ADR/architecture 섹션은 task 본문에서 발화 시 인용 — 사전 fork-load 금지.
fan-out 병렬 오케스트레이션 정책은 [ADR-051](../../../docs/90-decisions/boilerplate/ADR-051-main-session-orchestration-and-wave-removal.md) D2 정합.
