---
name: stack-guard
description: After /bootstrap-stack, generate verify scripts and a unified `validate` command for the project's stack.
argument-hint: "[stack summary | empty to read existing docs]"
disable-model-invocation: true
allowed-tools: Read Glob Grep Write Edit Bash
---

너의 역할은 스택이 확정된 직후 통합 검증 명령(`validate`)과 검증 스크립트를 생성하는 것이다.

이 skill의 1단계 범위:
- 통합 진입점 — 이름은 **`validate`로 고정** (`pnpm validate` / `npm run validate` / `make validate` / `task validate` 중 스택에 자연스러운 단일 명령). **단 `validate:design` 진입점만은 npm 계열로 둔다** — `make`·`task`는 하위 명령의 종료코드를 자기 코드로 대체해 adapter의 차단(`exit 1`)/실행불가(`exit 2`) 구분을 없앤다. Flutter 스택은 `validate` 자체도 npm으로 둔다(ADR-059 D2) — **이때 `package.json` 이 없으면**(순수 Dart/Flutter 프로젝트엔 기본적으로 없다) **최소 형태로 생성하고 `scripts` 에 진입점을 박는다.** 생성하지 않으면 `npm run validate` 자체가 성립하지 않는다. **이미 생성된 진입점은 소급 교체하지 않는다**(도구 감지 우선순위 정합 — 기존 도구 미덮어씀); 기존 `validate:design`이 `make`·`task`로 물려 있으면 자동 변경 없이 출력에 1줄 보고 + 사용자 결정으로 넘긴다.
- `scripts/verify.{sh,ps1,mjs,py}` 중 스택에 가장 자연스러운 런타임 1종.
- UI 판정 시 canonical asset byte-copy + project-native `validate:design` entry + fixed browser conformance + `STACK_SETUP_PLAN.md ## Design Gate Adapter` registry 기록(ADR-058#amend-2). 비-UI는 asset을 읽거나 복사하지 않는다.
- cross-platform 차이가 큰 팀이면 `.claude/settings.local.json` 예시 동봉 권장.
- 생성된 `docs/00-meta/STACK_SETUP_PLAN.md`에 hook 절차 SSOT([GUARDRAILS_STRATEGY.md "## PostToolUse hook 매뉴얼 등록 절차"](../../../docs/00-meta/GUARDRAILS_STRATEGY.md))를 link하는 1줄 안내. 절차 본문은 embed 금지 (SSOT 정합).

**1단계 비범위**: PostToolUse hook 자동 등록은 본 skill에서 수행하지 않는다(prototyping 미완료 — 자세한 이유는 [GUARDRAILS_STRATEGY.md의 "/stack-guard 1단계 산출물 범위" 섹션](../../../docs/00-meta/GUARDRAILS_STRATEGY.md#guardrails-stack-guard-scope) 참조). 사용자가 GUARDRAILS_STRATEGY.md 절차에 따라 매뉴얼 등록.

입력:
- `$ARGUMENTS`가 있으면 스택 요약을 받아 사용한다.
- 비어 있으면 `docs/20-system/ARCHITECTURE_OVERVIEW.md`의 "기술 선택" 섹션을 읽어 스택을 추정한다.

반드시 먼저 읽을 파일:
- `docs/00-meta/GUARDRAILS_STRATEGY.md`
- `docs/00-meta/STACK_SETUP_PLAN.md` (있으면)
- `docs/20-system/ARCHITECTURE_OVERVIEW.md`
- UI 판정 시에만 `docs/90-decisions/boilerplate/ADR-058-design-workflow.md#adr-058-amend-2`와 `.claude/skills/stack-guard/assets/design-gate*.mjs`

R0 — 운영 환경 가정 확인:
- 단일 OS/셸인가, mixed env인가?
- 단일 OS/셸이면 단일 verify 스크립트로 충분.
- mixed env면 cross-platform 친화적 런타임(예: Node.js, Python) 우선, 또는 `scripts/verify.sh` + `scripts/verify.ps1` 모두 생성.
- `.gitattributes`로 line ending 통일은 항상 1단계 산출물에 포함한다(예: `* text=auto eol=lf`).
- 단일 OS/셸이 Windows로 판정되면 `scripts/verify.ps1` 우선 + 매뉴얼 hook 예시는 PowerShell exec form ([GUARDRAILS_STRATEGY.md Windows 예시](../../../docs/00-meta/GUARDRAILS_STRATEGY.md)).
- macOS/Linux 판정 또는 mixed env면 `scripts/verify.sh` 우선 + exec form 그대로 (Unix/macOS 예시).
- mixed env면 *두 verify 스크립트 모두 생성* (`.sh` + `.ps1`) + 두 hook 예시 모두 출력.
- 두 OS 모두 매뉴얼 hook 예시 본문은 `${CLAUDE_PROJECT_DIR}` + `args` 배열로 박는다 (Anthropic open issue #50960 다중 reproducer 대응).

수행:
1. `package.json`/`pyproject.toml`/`Makefile`/`Taskfile.yaml` 중 스택에 자연스러운 곳에 `validate` 진입점을 만든다.
2. `scripts/verify.{sh,ps1,mjs,py}` 중 자연스러운 런타임 1종을 생성. 내용은 스택의 `format + lint + typecheck + test` 통합(아래 `## 스택별 verify 풀세트` 의 4단계와 같다 — 이 줄이 3단계로 남으면 수행-5 1회차의 format probe 가 갈 곳이 없고 `missing: format` 이 매 실행 발화한다). **이미 존재하면 덮어쓰지 않고 4단계 커버리지 부족만 출력에 보고한다**(아래 `## 재실행 계약` 표 정합).
2-1. **harness 경로 배제 (ADR-063 D2)**: 생성하는 도구 config 중 **formatter / linter / 타입 검사 include / 테스트 커버리지 집계 / 의존성 그래프**의 검사 범위에서 아래를 제외한다 — 이들은 프로젝트 소스가 아니라 agent harness다.
   - `.claude/`, `.codex/`, `.agents/`, `.boilerplate/`
   - `STACK_SETUP_PLAN.md ## Design Gate Adapter` 에 기록된 **materialized adapter 경로**(기본 `scripts/design-gate.mjs`). 이 사본은 프로젝트 소스 트리 안에 있어 harness 디렉터리 제외만으로는 보호되지 않는다. **포맷되면 SHA-256 digest 가 바뀌어 conformance oracle 이 게이트를 차단하고 `status: wiring-fail` 로 굳는다.**
   - **formatter 의 Markdown 대상에서 `docs/`** — 이 저장소의 기계 점검 다수가 문서 문자열에 의존한다(로스터의 종 수 표기·ADR 인덱스 행·Amendments 칸·`## Amendment N` 카운트). formatter 가 표를 재정렬하면 그 점검들이 조용히 깨진다. lint·typecheck 와는 무관한 항목이다.
   - **⚠️ secret scanner 는 배제 대상이 아니다 — 반대로 harness 경로를 포함해야 한다.** `.claude/settings.json`·`.codex/config.toml`·agent 설정에 토큰·키가 유입될 수 있고 그것이 정확히 scanner 가 잡아야 하는 대상이다. 포맷·타입 검사의 배제와 보안 스캔의 범위를 분리한다.
   - **정확한 exclude 설정 키는 도구·버전마다 다르므로 실행 시점에 그 도구 문서로 확인한다** — 본 SKILL 에 특정 키를 박지 않는다(도구 버전업 시 틀린 지시가 된다).
   - 기존 config 가 있으면 배제 항목만 **추가**하고 기존 규칙을 덮어쓰지 않는다.
3. `docs/00-meta/STACK_SETUP_PLAN.md`을 다음 규칙으로 처리한다:
   - **소유 책임 분리**: STACK_SETUP_PLAN.md는 `/bootstrap-stack`이 *최초 골격*(스택 선택 사실 + 추후 추가 필요한 자동화 목록)을 만들고, 본 `/stack-guard`는 거기에 *통합 명령 사용법 + hook 등록 안내 섹션*을 **append/갱신**한다. `/bootstrap-stack`이 만든 기존 섹션을 통째로 덮어쓰지 않는다.
   - 본 skill이 채울 섹션:
     - 통합 명령 사용법
     - `## Dart Source Roots` — Dart/Flutter 스택이면 **실제 소스 트리를 조회해 채운다**(`pubspec.yaml` 하나당 한 묶음, 경로는 그 pubspec 디렉터리 기준 상대경로). **예시 행을 그대로 두면 안 된다** — `dart format` 이 예시 경로를 대상으로 돌아 형식 검사가 조용히 통과한다. 조회는 pubspec 디렉터리에서 아래 중 host OS 에 맞는 것으로 한다(§1.0-1 의 OS 별 분기 규율과 동형). 둘 다 의도가 같다 — *"`.dart` 파일을 품은 최상위 디렉터리 목록"*.
        - Unix/macOS: `find . -name '*.dart' -not -path './.dart_tool/*' -not -path './build/*' | cut -d/ -f2 | sort -u`
        - Windows PowerShell: `Get-ChildItem -Directory | Where-Object { $_.Name -notin '.dart_tool','build' } | Where-Object { Get-ChildItem $_ -Recurse -Filter *.dart -File | Select-Object -First 1 } | Select-Object -ExpandProperty Name`

     비-Dart 프로젝트는 `/bootstrap-stack` 이 이 절을 이미 삭제했으므로 대상이 아니다(ADR-059 D2).
     - `## E2E Smoke Registry` — e2e 대상 프로젝트면 **선언한 runtime target마다 한 행**으로 `status | 파일 경로 | 테스트 이름 | 실행 대상 선택 규칙 | 마지막 PASS(host·날짜·커밋) | 등록일`을 기록. 실행 대상 칸에는 재부팅하면 달라지는 임시 id 대신 선택 규칙을 적는다(이 칸은 기록용이며 실행 명령에 그대로 들어가지 않는다). 대상 아니면 `status: n/a`만 기록(ADR-052#amend-1).
     - `## Design Gate Adapter` — UI면 실제 command template·adapter/output 경로·current capability version·source digest·fixed conformance 결과를 기록하고, 비-UI면 `status: n/a`만 기록(ADR-058#amend-2).
     - `## Dependency Tools` — **보완만**(ADR-051#amend-4 수행-6-2-0): 표·행이 없으면 관측 신호로 채우고, `/bootstrap-stack`이 기록한 행은 덮어쓰지 않는다(불일치는 출력 보고 + 사용자 결정).
     - PostToolUse hook 자동 등록은 prototyping 후 별도 항목 — 현재 단계에서는 매뉴얼 등록 안내
     - hook 등록 절차는 [GUARDRAILS_STRATEGY.md "## PostToolUse hook 매뉴얼 등록 절차"](../../../docs/00-meta/GUARDRAILS_STRATEGY.md) link만 박는다 (SSOT — 본 skill이 절차 본문 embed 금지).
   - 파일이 아예 없으면(`/bootstrap-stack` 산출물이 빠진 경우) `/stack-guard`가 새로 생성하되, 출력에 "`/bootstrap-stack`이 STACK_SETUP_PLAN.md를 만들지 않았음 — 사후 검토 권장"을 명시.
4. `.gitattributes` 처리 — **전역 규칙 우선**: 파일이 없으면 `* text=auto eol=lf` + Windows 전용 스크립트(`*.ps1`/`*.bat`) `eol=crlf` 예외로 생성한다. 파일이 있으면 **전역 규칙(`* text=auto eol=lf`)이 존재하는지 먼저 확인**하고 없으면 추가한다. 확장자 열거 방식만 있는 경우 새 확장자를 조용히 놓치므로 전역 규칙으로 보강한다(열거 줄은 제거하지 않는다 — 의도 문서화로 유지 가능). 기존 fork 에 전역 규칙을 새로 넣으면 `git add --renormalize .` 1회 커밋이 필요하다는 안내를 출력에 포함한다.
5. **Smoke test (필수)**: 수행-6 의 toolchain 설치가 성공한 경우 생성된 `validate` 명령을 **아래 5-c 실행 표대로 돌린다**(probe 배치를 바꿔가며 **최대 5회** — 부재 단계가 있으면 그만큼 줄어든다. ADR-063 D1) (`allowed-tools` 의 Bash 권한 활용 — 신규 권한 추가 불필요). e2e 대상 프로젝트(수행-6 의 runtime target 이 e2e 대상)면 `validate:e2e` 도 실행한다 — **선언된 e2e 대상 target 이 하나면 1회**(러너가 후보를 좁혀 자동 선택), **둘 이상이면 target 마다 `npm run validate:e2e -- -d <device id>` 로 한 번씩** 실행한다. `<device id>` 는 6-3 이 `flutter devices --machine` 으로 회수한 target 별 후보에서 고른다(ADR-059 D4).
   본 smoke test 는 *wiring 검증* 이 목적 (명령이 올바르게 연결됐는지) — *프로젝트 자체의 lint/test 통과 여부* 와 분리해 보고한다.
   설치가 `Needs Install` 로 보류된 경우(수행-6) smoke test 를 실행하지 못하므로 `validate smoke test: SKIPPED (deps not installed — Needs Install)` 로 보고하고 종료하지 않는다(사용자 설치 후 재실행 안내).

   **5-a. probe 배치 (ADR-063 D1)** — 프로젝트 도구의 **검사 범위 안**에 만든다.

   > ⚠️ **닷 디렉터리(`.stack-guard-probe/` 등)나 `.gitignore` 등재 경로에 만들면 안 된다.** (i) 다수 formatter/linter 가 `.gitignore` 를 기본 존중해 대상에서 제외하고, (ii) TypeScript `include` 의 `**/*` 는 `.` 로 시작하는 세그먼트를 매칭하지 않으며, (iii) 테스트 러너의 glob 은 dot 파일을 기본 제외한다. 그러면 위반 probe 가 실패하지 않아 **판정력이 정상인 검사도 FAIL 로 오분류**된다.

   - **위치**: 등록된 소스 루트 / 테스트 루트 **안**. 파일명은 그 스택의 include·test glob 에 걸리는 형태 + 명백한 표식. 예: `src/__stackguard_probe__.ts` · `src/__stackguard_probe__.test.ts` · `lib/__stackguard_probe__.dart` · `test/__stackguard_probe___test.dart` · `tests/test___stackguard_probe__.py`
   - **`.gitignore` 에 등재하지 않는다.** 잔여물은 5-d 삭제로만 통제하고, 남았을 때 `git status` 에 보이는 것이 정상이다(조용히 무시되는 것보다 안전하다).
   - 같은 이름의 파일이 이미 있으면 **덮어쓰지 않고** 그 항목만 건너뛰고 사유를 보고한다.

   **5-b. 판정 단위 — 파일 귀속 진단** (전체 exit code 가 아니다): probe 판정은 **`validate` 출력에 그 probe 파일 경로가 진단으로 등장하는가**로 한다. brownfield fork 는 기존 위반으로 전체 exit code 가 이미 1일 수 있어, 전체 코드로 판정하면 *배선 실패*와 *프로젝트 실패*를 구분할 수 없다.

   **5-c. 실행 순서 — 위반 probe 는 한 번에 하나만 둔다**: `validate` 는 4단계를 **순차 fail-fast** 로 묶으므로(본 SKILL 의 `## 스택별 verify 풀세트` 정합), 위반을 여러 개 동시에 두면 첫 단계에서 멈춰 뒤 단계의 판정력을 측정할 수 없다.

   **5-c-0. 회차별 판정의 두 전제 (ADR-063 D1 — 아래 표보다 먼저 적용한다)**

   - **(i) 단계 실재** — 대상 단계를 수행하는 명령이 `validate` 파이프라인에 있는가. **없으면 `missing: <단계>` 로 보고하고 그 회차만 건너뛰고 다음 회차를 계속한다.** 이것은 *probe 가 범위 밖*이 아니라 **커버리지 누락**이며, 둘을 합쳐 `SKIPPED` 로 적으면 **본 검증이 잡으려는 배선 누락이 비차단 SKIPPED 로 숨는다.** **겸업 도구가 그 단계를 겸하면 부재가 아니다** — 아래 겸업 규칙을 먼저 적용하고 `missing` 으로 보고하지 않는다.
   - **(ii) 실행 도달** — 이번 실행에서 그 단계까지 실제로 도달했는가. **앞 단계가 *프로젝트 소유* 위반으로 fail-fast 를 유발해 도달하지 못했으면**(brownfield 의 기존 format 위반 등) 그 단계 명령을 **단독 실행**해 5-b 기준으로 판정하고, 단독 실행이 불가하면 `SKIPPED(미도달: <사유>)` 로 보고한다.
   - **(i)·(ii) 어느 경우도 `PROBE FAIL` 이 아니다.** 아래 표의 `불일치 시` 열은 **그 단계가 실재하고 도달한 회차**에만 적용한다 — 배선 결함이 아닌 것을 결함으로 적으면 오분류를 방향만 바꿔 재생산한다.
   - **1회차의 (a) 범위 확인은 파이프라인에 실재하는 *첫* 단계의 회차에서 수행한다** — format 단계가 없으면 그 역할을 lint 회차가 이어받는다.

   | 실행 | probe 배치 | 판정 | 불일치 시 |
   |---|---|---|---|
   | **1회** | 명백한 **형식 위반** probe 1개만 | **(a) 범위 확인** — 그 파일 경로가 진단에 등장하는가 / **(b) format 판정력** — 그 진단이 format 단계에서 나왔는가 | **(a) 실패** → `SKIPPED — probe 가 검사 범위 밖: <추정 원인>`. **FAIL 아님, 종료 X.** 2~5회를 돌리지 않고 **5-d 정리 → 5-e 판정 → 5-f 기록** 순으로 마친다(정리를 건너뛰면 probe 가 저장소에 남고, 기록을 건너뛰면 이 SKIPPED 가 잊힌다) / **(b) 실패** → `PROBE FAIL(format)` |
   | **2회** | 위반 probe 를 **lint 위반 1개로 교체** | lint 단계 진단에 그 경로 | `PROBE FAIL(lint)` |
   | **3회** | **타입 오류 1개로 교체** | typecheck 단계 진단에 그 경로 | `PROBE FAIL(typecheck)` |
   | **4회** | **실패 테스트 1개로 교체** | test 단계 진단에 그 경로 | `PROBE FAIL(test)` |
   | **5회** | 위반 probe 전부 제거 + 규칙 준수 소스 1개 + 통과 테스트 1개 | probe 파일에 귀속된 진단 **0건** (전체 exit 0 을 요구하지 않는다) | `PROBE FAIL(pass)` — 준수 파일이 지적됨 = 규칙 설정 문제 |

   **`validate` 실행은 최대 5회다** — 1회차의 (a)(b)는 *같은 실행의 두 판정*이다(같은 probe·같은 명령이므로 따로 돌리지 않는다). **단계 부재로만** 회차가 줄어든다(겸업은 줄이지 않는다 — 아래 규칙). 5-c-0 (ii) 의 단독 실행은 그 회차의 **재측정**이므로 새 회차로 세지 않는다.

   **한 도구가 두 단계를 겸해도 회차는 줄이지 않는다** — Biome = format + lint, `flutter analyze` = lint + typecheck 면 **같은 명령을 두 회차에서 각각 다른 위반 probe 로 호출**한다. 겸업 도구도 linter 나 개별 규칙을 따로 끌 수 있으므로 **format 진단은 lint 규칙의 판정력을 증명하지 않는다** — 한 단계의 통과를 다른 단계 판정으로 대체하면 D1 이 막으려는 얕은 검증이 *겸업*이라는 이름으로 되돌아온다.
   - 겸업 시 **단계 귀속은 명령이 아니라 진단의 규칙·카테고리로 판정한다** — Biome 은 formatter 진단과 lint 규칙 id 로, `flutter analyze` 는 타입 오류와 lint 규칙 이름으로 구분한다.
   - 겸업 단계는 `missing: <단계>` 로 보고하지 않는다(단계는 실재한다 — 5-c-0 (i)). 겸업 여부를 산문으로 예외 처리할 필요도 없다.
   - 한 명령이 두 단계를 함께 보고하므로 **그 두 회차 사이에는 fail-fast 가 없다**(5-c-0 (ii) 의 미도달이 겸업 단계끼리는 발생하지 않는다). 그래도 위반 probe 는 회차당 하나만 둔다 — 진단 귀속을 단순하게 유지한다.

   **5-d. probe 정리 (필수)**: 생성한 probe 파일을 **전부 삭제**하고 결과를 보고한다 — `probe cleanup: DONE (<n>개)` 또는 `probe cleanup: FAILED — 수동 삭제 필요: <경로 목록>`. 실패 경로·조기 종료 경로에서도 정리한다. **조용히 남기지 않는다.**

   **5-e. 판정 표**:
   - **전 회차 기대대로 + 프로젝트 진단 0건** → `validate smoke test: PASS (probe verified, project clean)`.
   - **전 회차 기대대로 + 프로젝트 빈 케이스**(빈 lint 룰 / **프로젝트 테스트 0건**) → `validate smoke test: PASS (probe verified, empty rules/tests warning)`. **프로비저닝 단계에서는 정상이며 차단하지 않는다.**
   - **전 회차 기대대로 + 프로젝트 실 위반** → `validate smoke test: PROBE OK, PROJECT FAIL` + stderr 요약. stack-guard 자체는 성공이라 종료 X, 사용자에게 *프로젝트 수정* 안내.
   - **일부 단계 미도달**(5-c-0 (ii) — 앞 단계의 기존 프로젝트 위반으로 멈추고 단독 실행도 불가) → `validate smoke test: PARTIAL (probe verified: <단계 목록> / not reached: <단계 목록>)` + 프로젝트 수정 안내. **종료 X — 배선 결함이 아니다.**
   - **일부 단계 부재**(5-c-0 (i)) → `missing: <단계>` 를 함께 출력하고 남은 회차의 판정으로 위 행 중 하나를 낸다. 단계 부재만으로 종료하지 않는다 — **이번 실행에서 방금 생성한** 파이프라인이면 4단계를 채워 다시 구성하고, **이미 존재해 보존한** `validate`/`scripts/verify.*` 는 **덮어쓰지 않고 커버리지 부족만 보고**한다(`## 재실행 계약` 정합).
   - **1회차 (a) 실패**(범위 밖) → `validate smoke test: SKIPPED (probe out of tool scope — <추정 원인>)` + 확인 권고(도구 include·ignore 설정). **종료 X.** 프로비저닝 단계에서는 정상이며, 아래 5-f 기록을 통해 다음 마일스톤의 `[Guard-drift]` 가 재실행을 권고한다(ADR-063 D4 — **졸업 차단 항목은 없다**).
   - **probe 생성 불가**(권한·sandbox·이름 충돌) → `validate smoke test: SKIPPED (probe unavailable — <사유>)`. **종료 X.**
   - **1회차 (b) 또는 2~5회 불일치**(그 단계가 실재하고 도달한 회차에서) → `validate smoke test: PROBE FAIL(<단계>)` + 생성된 명령 + 실패 stderr + 제안 대체(예: pnpm 비호환 → `npm run validate`). **stack-guard 산출물 수정 필요** — 5-d 정리 + 5-f 기록 후 종료.

   **5-f. 판정 기록 (필수 — ADR-063 D3)**: 위 최종 판정을 `docs/00-meta/STACK_SETUP_PLAN.md` 의 `## 통합 명령 사용법` 절에 `probe smoke: <판정> (<YYYY-MM-DD>)` 1줄로 기록한다(이미 있으면 갱신). probe 파일은 지워도 판정은 남는다 — 이 줄이 `/stabilize-milestone` `[Guard-drift]` (d) 의 유일한 입력이며, 없으면 `SKIPPED`·`PARTIAL` 이 조용히 잊힌다. **조기 종료 경로에서도 기록한다.**

   `validate:e2e` 판정 행 (e2e 대상 프로젝트 한정, ADR-052#amend-1 5상태):
   - **`NOT_APPLICABLE`** (e2e 대상 아님) → `validate:e2e: NOT_APPLICABLE (비-e2e 스택)`. 종료 X.
   - **`EMPTY`** (선언된 e2e 디렉터리 하위 suite에서 실제 **실행된** 테스트 0개 — 디렉터리가 비었거나 러너가 다른 디렉터리를 대신 실행한 경우) → `validate:e2e: EMPTY (프로비저닝 단계 정상 — 졸업 시점엔 차단)`. **본 단계에서는 종료하지 않는다.**
   - **`PASS`** (선언된 e2e 디렉터리 하위에서 1개 이상 실제 실행·성공 + 러너 전체 성공) → `validate:e2e: PASS (wiring OK)`.
   - **`FAIL`** — 두 원인을 **하위 라벨로 분리해 보고한다**(수행-5 smoke 의 wiring/프로젝트 책무 분리 원칙 유지). `FAIL(wiring)`: 진입점·config 부재로 러너가 기동조차 못 함 → **stack-guard 산출물 수정 필요**, 종료. `FAIL(project)`: 러너는 정상 기동했고 프로젝트 e2e 가 실패 → 프로젝트 책무로 분리 보고, 본 단계에서 종료하지 않는다(졸업 시점에는 차단).
   - **`BLOCKED_ENV`** (browser/device/toolchain 미설치·미기동) → `validate:e2e: BLOCKED_ENV — Needs Install: <실제 명령>`. 종료 X.

   **상태 정의와 판정 순서의 SSOT는 ADR-052#amend-1 결정 3이다** — 위 행은 *본 단계의 처리*(종료/비종료)만 정하고 정의를 재선언하지 않는다. 순서는 `FAIL(wiring)`·`BLOCKED_ENV` → `EMPTY` → `FAIL(project)` → `PASS`이며 먼저 성립하는 상태로 확정한다(행 나열 순서가 아니라 이 순서다 — 뒤집으면 진입점 부재를 `EMPTY`로 오분류해 고쳐야 할 산출물 결함을 통과시킨다). 상태 판정은 **구조화된 러너 출력**으로 한다(출력 문자열 매칭은 보조 fallback). `STACK_SETUP_PLAN.md ## E2E Smoke Registry`에 등록이 있으면 **선언된 runtime target별로** 읽어 `PASS` 조건을 *등록된 smoke 이름 일치*까지 좁히고, target마다 상태를 따로 낸다. **등록이 없어도 명령은 실행한다** — 위 경로 기준으로 판정하고 `P1 [E2E-registry] <target> — canonical smoke 미등록` 만 함께 기록한다(ADR-052#amend-1 결정 4).
   `validate:design` 판정 행 (UI 한정, ADR-058#amend-2):
   - **direct-support Node UI는 generated bytes=canonical source digest + fixed conformance 전부 통과**; override는 기록된 source basis + 동등한 v2 conformance 전부 통과 → registry `status: ready`, `validate:design self-test: PASS (fixed suite, capability ADR-058#amend-2/v2)`. digest/conformance 어느 하나라도 빠지면 ready 금지.
   - **module/browser 설치 실패** → registry `status: needs-install`, `Needs Install: <실제 명령>`; design artifact 승인 보류.
   - **entry/source digest/fixed fixture 기대 분류 불일치 또는 local modification** → registry `status: wiring-fail`, `validate:design self-test: WIRING FAIL`; 자동 덮어쓰기 없이 원인을 고치고 fixed suite 전체 재실행 전까지 종료.
   - **비-UI** → registry `status: n/a`; canonical asset read/copy, adapter·entry·browser 설치를 design gate 목적으로 수행하지 않음.


   > 핵심 구분: stack-guard 의 책무는 *wiring* (`validate` + `validate:e2e` + UI `validate:design` entry·browser·conformance 까지). 프로젝트 실 위반은 *프로젝트 책무* 라 smoke test 가 잡되 stack-guard 가 차단하지 않는다.

6. **Toolchain 선설치 + E2E readiness** (실행 순서상 step 5 smoke test *앞*에 수행 — `allowed-tools` 의 Bash 활용, 신규 권한 불필요):
   - **6-1. 판정 (3축, 상호배타 아님 — ADR-059 D8 / ADR-027#amend-3 / ADR-058#amend-2)**: 매 실행 현재 파일로 다시 판정한다. 세 축을 **각각** 결정하며 동시에 참일 수 있다.
     - **design surface**: `docs/20-system/DESIGN.md` 부재 → 없음. 존재 + `## 0. Status` ≠ `draft` → 있음. 존재 + status == `draft` → 추가 신호((a) ARCH `## 7-4` 또는 `## 7-5` 활성, (b) ARCHITECTURE_OVERVIEW 기술 선택이 화면 있는 유형) ≥1 → 있음(의심 포함). 신호 0 → 없음. **design gate(6-4-1)는 이 축만 본다.**
     - **runtime target**: ARCH `## 7. 기술 선택`과 프로젝트 manifest로 판정. canonical 값은 `web`(브라우저에서 도는 앱) / `native/android` / `native/ios` / `desktop` / `none`(라이브러리·CLI)이다 — **Android 와 iOS 는 개별 값이며 `native` 하나로 합쳐 적지 않는다**(합치면 ADR-059 D4 플랫폼별 판정이 성립하지 않는다). `native/*`는 값이 아니라 그 둘을 묶는 클래스 표기이며 toolchain 분기에만 쓴다. **e2e 도구 선택(6-3·6-4)은 이 축만 본다.** 여러 값이 동시에 참일 수 있다.
     - **host environment**: 현재 OS(`windows` / `macos`). 실행 가능 범위 판단에만 쓴다. iOS 관련 항목은 `macos` 에서만 수행하고, 그 외에서는 `[미수행 — host 제약]` 으로 기록한다.
     정상 `/bootstrap-stack → /stack-guard → /bootstrap-design` 순서에서는 DESIGN status 가 draft 이고 `/bootstrap-stack` 이 ARCH `## 7-4` 또는 `## 7-5` 를 채우므로 design surface 가 "있음(의심)" 으로 발화한다. 기존 registry 가 `n/a` 여도 이후 신호가 생기면 이번 실행에서 재분류한다.
   - **6-2-0. Dependency Tools 교차 확인 (ADR-051#amend-4)**: `docs/00-meta/STACK_SETUP_PLAN.md` `## Dependency Tools` 표(있으면)와 저장소의 실제 *tool-specific* 신호(`package-lock.json`·`pnpm-lock.yaml`·`yarn.lock`·`bun.lockb`·`poetry.lock`·`uv.lock`·`Cargo.lock`·`go.mod`·`pubspec.yaml`+`pubspec.lock` 등)를 **scope별로 대조**한다. **표·행 부재 → 관측 신호로 보완 기록**(green-field면 이번 6-2 설치로 생성될 도구를 적는다). **표↔저장소 불일치 → 자동 수정하지 않고** 출력에 `Dependency Tool 불일치: <scope> 표=<A> 저장소=<B>`로 보고 + 사용자 결정 요청(아래 "도구 감지 우선 순서" 4와 동일 정책). **검증 도구 자체를 설치하는 PM 의 신호는 이 대조에서 제외한다** — 이 표는 *builder 가 프로젝트·기능 의존성을 설치할 때 쓰는 PM* 만 적는다(ADR-059 D2). 그래서 Flutter scope 의 `package-lock.json`(design gate·통합 명령용 npm)은 `pubspec.lock` 과의 *동일 scope 신호 충돌* 로 보지 않고, 표에는 `pub` 1행만 둔다. 웹 프로젝트의 `@playwright/test` 를 이 표에 적지 않는 것과 같은 경계다. 아래 6-2 설치는 이 확인을 통과한 scope 도구로 실행한다.
   - **6-2. Toolchain 설치 (전 스택 공통, 기계적 — 기본은 진행)**: 감지된 패키지 매니저로 authored devDeps 를 설치한다 — `pnpm install` / `npm install` / `pip install -e .` (또는 `uv sync`) / `go mod download` / `cargo fetch` / `flutter pub get` 중 스택에 자연스러운 1종. lockfile 존재 시 frozen 설치(`pnpm install --frozen-lockfile` / `npm ci`) 우선. 설치 후 lock 파일 변경은 그대로 둔다(finalize 자동 화이트리스트, ADR-007#amend-1). **주의 — *validate 가 부르는 도구 자체*가 깔리는지 확인**: 패키지 deps 만 받는 명령은 lint/type/test 도구를 빠뜨릴 수 있다(예: `pip install -e .` 는 dev 도구 미설치 → `pip install -e '.[dev]'` 또는 `uv sync --all-extras`; Go `golangci-lint`·Rust `clippy` 는 별도 설치). step 5 smoke 가 command-not-found 면 도구 설치 명령을 보강한다.
   - **6-2-1. 테스트 격리 권장 (ADR-051#amend-1)**: 생성하는 e2e/통합 설정에 *가능한 범위에서* 격리를 권장한다 — playwright `webServer`는 동적 포트, 통합 테스트는 트랜잭션 롤백/임시 스키마/testcontainers. stack-guard가 unit-test 격리를 직접 authoring하긴 어려우므로, 미보장 시 `STACK_SETUP_PLAN.md`에 "테스트 격리 미설정 — 병렬 builder 시 foreman 순차 권장" 1줄 부기(implement partition이 실제 보호).
   - **6-3. e2e 실행 환경 준비 (runtime target 기준)**:
     - **target 에 `web` 포함**: `npx playwright install` (CI/Linux 환경이면 `npx playwright install --with-deps` 제안만 부기, 자동 실행 X — OS 패키지 sudo 필요). **웹 경로는 개선 전과 동일하다.**
     - **target 에 `native/*` 포함**: **앱 e2e 목적의** 브라우저는 설치하지 않는다. 대신 **`flutter devices --machine` 으로 연결된 device 를 조회**해 선언된 target 별 후보(android / ios)와 각 device id 를 회수한다 — `flutter doctor` 는 toolchain 점검이 본업이고 device 는 개수만 요약해 *어느 것이 android/ios 인지* 와 *후보가 몇 개인지* 를 알 수 없다(ADR-059 D4). 어떤 target 의 후보가 0개면 그 target 에 대해 `Needs Device: <에뮬레이터/시뮬레이터 기동 명령>` 을 출력한다. iOS 는 host 가 `macos` 일 때만 확인한다.
     - **design surface 가 있음**: target 과 무관하게 `@playwright/test` 와 `@axe-core/playwright` 를 **devDep 으로 설치**하고 **`npx playwright install chromium` 까지 수행한다.** 모듈만 있고 브라우저 바이너리가 없으면 design gate adapter 가 `exit 2`(실행 불가)를 내고 registry 가 `status: needs-install` 로 굳어 **디자인 산출물 승인·프로토타입 승격·task 분해가 연쇄로 막힌다.** 즉 native 프로젝트에서도 design gate 용 chromium 은 필수다(ADR-059 D8). 이때 설치하는 Playwright 버전은 같은 저장소의 다른 웹 패키지와 맞추면 브라우저 캐시를 공유한다 — 버전이 다르면 브라우저 세트를 새로 내려받는다.
   - **6-4. `validate:e2e` scaffold (runtime target 기준, e2e 필요 시)**:
     - **target 에 `web` 포함**: `playwright.config.*` 가 *부재* 하면 최소 config(`testDir: 'e2e'`, 단일 chromium project, `webServer` 는 주석 placeholder)를 생성하고 `validate:e2e` 진입점(`playwright test`)을 박는다.
     - **target 에 `native/*` 포함**: 아래 셋을 모두 한다. **Playwright 에 배선하지 않는다** — `package.json` 이 design gate 때문에 존재하더라도 그것을 앱 e2e 의 근거로 삼지 않는다(ADR-059 D8).
       1. `flutter pub add "dev:integration_test:{sdk: flutter}"` 로 dev 의존성을 명시하고 `flutter pub get` 을 수행한다. `integration_test` 는 SDK 동봉이지만 `pubspec.yaml` 에 적히지 않으면 `import 'package:integration_test/...'` 가 해석되지 않아 e2e 파일이 컴파일조차 안 된다.
       2. `integration_test/` 디렉터리를 만든다.
       3. `validate:e2e` 진입점을 **`flutter test integration_test` 로 박는다 — `-d` 를 넣지 않는다.** 이유: `-d` 는 device id 또는 이름 접두사만 받으므로 `emulator-5554` 처럼 재부팅하면 달라지는 값이나 `연결된 Android device 1대` 같은 자연어를 넣으면 명령 자체가 성립하지 않는다. `-d` 를 생략하면 러너가 **`integration_test` 지원 device 로 후보를 좁힌 뒤** 하나만 남으면 자동 선택한다(실측: android emulator + windows + chrome + edge 4개가 붙은 상태에서 emulator 자동 선택, 오류 없음). 후보가 둘 이상 남을 때만 호출 측이 `npm run validate:e2e -- -d <id>` 로 지정한다. 어떤 device 를 골라야 하는지의 *규칙*은 registry 에 적는다.
       4. **`--machine` 을 진입점에 박지 않는다** — 사람이 읽을 때는 기본 리포터가 낫고, 판정하는 쪽이 `npm run validate:e2e -- --machine` 으로 덧붙여 다시 호출한다(ADR-059 D4).
     - **공통**: *같은 계열로 이미 존재* 하면 덮어쓰지 않고 발견 사실만 출력에 기록한다(도구 감지 우선순위 정합 — 기존 도구 미덮어씀). **단 `validate:e2e` 가 *다른 계열* 로 물려 있으면**(예: `web` 이 `playwright test` 로 잡고 있는데 `native/*` 도 선언됨, 또는 그 반대) **덮어쓰지 않고 `FAIL(wiring)` 으로 보고하고 종료한다** — 진입점은 하나이므로 두 도구가 나눠 가질 수 없고, 조용히 놔두면 나중 target 이 영구 `EMPTY` 가 되어 *"테스트를 쓰라"* 는 틀린 처방이 나가고 실제 원인(배선 부재)이 드러나지 않는다(ADR-059 D4). 이 e2e provision/smoke 는 milestone graduation 의 E2E hard-block(ADR-052#amend-1 / ADR-014#amend-4)이 검사할 대상을 선readiness 한다.
     - **6-4-a. canonical boot smoke (조건부 생성)**: e2e 대상이고 등록된 smoke 가 없을 때 —
       - **새 프로젝트이고 앱 진입점이 결정적이면**: 프레임워크 수준 boot smoke 를 1개 생성한다. 내용은 *"앱이 기동하고 첫 프레임이 예외 없이 렌더된다"* 까지이며 **어떤 화면을 볼지 고르지 않는다**(화면 선택은 제품 결정이라 계획 단계 소관).
       - **기존 코드가 있거나 로그인·외부 의존이 필요해 부팅만으로 성립하지 않으면**: 생성하지 않고 `Needs E2E Smoke — /plan-workitem 이 작성 line item 을 authoring 해야 함` 을 출력한다.
       - 생성했든 아니든 결과를 `STACK_SETUP_PLAN.md ## E2E Smoke Registry` 에 **runtime target 별로 한 행씩** 기록한다. **`native/*` 는 클래스 표기이므로 행으로 쓰지 않는다** — `native/android` 와 `native/ios` 를 함께 선언했으면 **두 행**이고 `web` 까지 선언했으면 세 행이다(ADR-059 D8). 판정도 각 행마다 따로 난다 — 한쪽 target 의 통과를 다른 쪽 근거로 쓰지 않는다.
     - **6-4-b. golden 초기 절차 안내 (runtime target 에 `native/*` 가 포함되고 화면이 있을 때)**: golden(픽셀 비교) 정답 사진은 **커밋하지 않으며 머신마다 로컬 생성**한다(ADR-059 D3). `.gitignore` 에 `**/test/**/goldens/` 와 `**/test/**/failures/` 가 있는지 확인하고 없으면 추가한다 — **`**/test/goldens/` 처럼 한 단계만 쓰면 안 된다**: golden key 는 그 테스트 파일이 있는 디렉터리 기준 상대경로라(`LocalFileComparator.basedir`) `test/widgets/foo_test.dart` 의 `goldens/foo.png` 는 `test/widgets/goldens/` 에 생성되고 한 단계 패턴에는 걸리지 않는다. 그리고 `STACK_SETUP_PLAN.md` 에 아래 절차를 1회성 안내로 기록한다 — *"새 체크아웃 직후 첫 `validate` 는 정답 사진 부재로 실패한다. `flutter test --update-goldens` 를 1회 실행하고 생성된 이미지를 육안 확인한 뒤 진행한다."* golden 테스트 위젯에는 `debugShowCheckedModeBanner: false` 를 준다. **재생성 규율도 함께 적는다** — *"`--update-goldens` 는 (a) 정답 사진이 아직 없을 때, (b) UI 를 의도적으로 바꾸고 새 모습을 육안 확인했을 때만 쓴다. golden 실패를 통과시키려고 덮어쓰지 않는다 — 그러면 회귀가 정답으로 굳는다."*
     - e2e 대상이 아니면 6-3·6-4 를 skip 하되 6-2 toolchain 설치는 수행한다.
   - **6-4-1. Canonical design acceptance adapter + Visual-QA scaffold (UI/web 한정, ADR-058#amend-2)**:
     - **JIT read 경계**: 6-1이 UI 확정/의심일 때만 `.claude/skills/stack-guard/assets/design-gate.mjs`와 `design-gate-conformance.mjs`를 읽고 실행한다. 비-UI는 두 asset을 컨텍스트에 로드하거나 project로 복사하지 않는다(ADR-019).
     - **direct-support Node UI 물질화**: canonical `design-gate.mjs`를 project-native 경로(기본 `scripts/design-gate.mjs`)에 **byte-copy**하고 감지된 package manager에 논리 entry `validate:design`을 배선한다. **이 진입점은 npm 계열(`npm run` / `pnpm` / `yarn` / `bun run`)로 박는다** — `task` 와 `make` 는 하위 명령의 종료코드를 자기 코드로 바꿔(각각 201, 2) adapter 의 `exit 1`(차단)과 `exit 2`(실행 불가) 구분을 없앤다(ADR-059 D2). Flutter 등 비-Node 스택에서도 design gate 진입점만은 npm 으로 둔다. 산문을 보고 재작성하지 않는다. adapter는 다중 HTML/glob 입력을 직접 확장하고 `{ blockers, reports, screenshots }` + exit 0(pass)/1(blocker)/2(execution unavailable)를 낸다.
     - **source integrity + fixed conformance (direct-support Node UI)**: generated adapter SHA-256이 conformance asset의 canonical digest와 같은지 먼저 확인한 뒤 `node .claude/skills/stack-guard/assets/design-gate-conformance.mjs <generated-adapter-path>`를 실제 Chromium으로 실행한다. oracle exit 2는 `needs-install`/실행불가로 그대로 승계하고, exit 1은 source/conformance `wiring-fail`로 기록한다. fixture·기대값은 conformance asset이 소유하며 생성하지 않는다. 기존 10 behavior case + same-basename batch + stale cleanup + per-file render-error isolation + 1px tolerance pass/2px escape block + bounded completion을 전부 통과하기 전 `ready` 금지.
     - **version/re-run policy**: current capability는 `ADR-058#amend-2/v2`. registry가 v1/누락/lower-version이면 (a) 기록된 `source digest`가 있는 경우 실제 bytes와 같거나, (b) digest 필드가 없던 legacy v1의 실제 bytes가 canonical digest와 같을 때만 미수정으로 인정해 canonical v2로 교체하고 fixed suite 전체를 재실행한다. 어느 기준도 충족하지 않으면 local modification으로 판정해 **덮어쓰지 않고** `wiring-fail (local modifications)` + diff/채택 사용자 결정을 요청한다. current version/digest도 conformance는 재실행한다.
     - **output ignore**: canonical output `design-gate-shots/`는 baseline `.gitignore`가 선제 보호한다. override adapter가 다른 output path를 쓰면 **첫 adapter 실행 전에** 그 정확한 project-relative 경로를 `.gitignore`에 추가한다.
     - **registry 기록**: `STACK_SETUP_PLAN.md ## Design Gate Adapter`에 `status | command template | adapter path | output path | capability version=ADR-058#amend-2/v2 | source digest | conformance`를 실제 값으로 채운다. 비-UI는 `status: n/a`만. module/browser 부재=`needs-install`, source/entry/conformance/local-modification 불일치=`wiring-fail`.
     - **비-Node/범위밖-스택**: ADR-031 범위 밖 스택(project ADR supersede 경로 — `--override` 플래그는 미구현)이 canonical Node asset을 쓸 수 없으면 동등한 project-native adapter와 별도 source 근거를 기록하되, v2 behavior/fixed fixture 기대값을 실제 browser로 만족하기 전 `ready`로 표시하지 않는다.
     - **구현 앱 Visual-QA (별도 surface)**: e2e scaffold 시 `e2e/visual-qa.spec.*`도 생성해 렌더된 앱을 검사한다. 앱이 비어 있으면 대상 landmark 부재 graceful skip은 허용하지만 정적 adapter conformance를 통과시킨 것으로 간주하지 않는다. breakpoint 320/375/768/1440 page overflow는 차단, 요소 겹침은 권고, populated axe serious/critical은 차단·moderate/minor는 권고. 가능한 runner에서는 generated geometry/axe helper를 두 surface가 재사용한다.
     - 기존 `e2e/visual-qa.spec.*`는 덮어쓰지 않되 capability가 약하면 별도 adapter/helper로 보완한다. **스크린샷 vision 비평은 hot-loop 제외**(탐색/사람 검토는 stabilize §3-P). 졸업 e2e 게이트는 ADR-052 D3 / ADR-014#amend-2가 SSOT.
   - **6-5. Graceful fallback (날조·우회 금지)**: 6-2/6-3 의 설치 명령이 sandbox/네트워크/승인 차단으로 *실제 실패* 하면 fabricate 하지 않고 `Needs Install: <명령> — 메인 세션/사용자 실행 필요` 를 출력하고, 가능한 산출(진입점·config·verify 스크립트)은 계속 생성한다. 이후 step 5 smoke 는 해당 항목을 SKIPPED 로 처리한다. (implement-workitem 의 ADR-040#amend-1 `Needs Install` 패턴과 동일.)
   - **설치-소유 경계 주의(SSOT)**: 본 step 이 까는 것은 *toolchain + e2e 의존*(biome/tsc/vitest/@playwright/test + browser)뿐이다. *task 단위 런타임/기능 패키지*(결제 SDK 등)는 plan-workitem 이 authoring → implement-workitem 이 설치한다(ADR-040#amend-1). 경계 결정은 ADR-052(install-ownership 3분할)에 기록 — 본 step 은 toolchain+e2e 소유만 집행한다.

마지막 출력:
- 생성/갱신한 파일 목록
- 운영 환경 가정 (R0 결과)
- 통합 명령 호출 방법 (예: `pnpm validate`; UI/web 이면 `pnpm validate:e2e` 도)
- 판정 결과 3축 (design surface: 있음(의심 포함)/없음 — ADR-027#amend-3 근거 신호 / runtime target: web·native/android·native/ios·desktop·none — 복수 선언 가능, `native` 단독 표기 금지 / host: windows·macos) — ADR-059 D8
- Toolchain 설치 결과 (`deps install: DONE (<pkg-manager>)` / `Needs Install: <명령>`); UI/web 이면 browser 설치 결과 (`playwright install: DONE` / `Needs Install: npx playwright install`)
- 매뉴얼 hook 등록 절차 SSOT 위치 ([GUARDRAILS_STRATEGY.md "## PostToolUse hook 매뉴얼 등록 절차"](../../../docs/00-meta/GUARDRAILS_STRATEGY.md)) — 생성된 STACK_SETUP_PLAN.md에는 link만 박힘.
- validate smoke test 결과 (`PASS (probe verified, project clean)` / `PASS (probe verified, empty rules/tests warning)` / `PROBE OK, PROJECT FAIL` / `PARTIAL (probe verified: … / not reached: …)` / `PROBE FAIL(<단계>)` / `SKIPPED (probe out of tool scope — …)` / `SKIPPED (probe unavailable — …)`) + 해당 시 `missing: <단계>` + **probe cleanup 결과** (`DONE (<n>개)` / `FAILED — 수동 삭제 필요: <경로 목록>`) + `STACK_SETUP_PLAN` 의 `probe smoke:` 기록 갱신 여부
- validate:e2e 상태 (e2e 대상 한정, runtime target별 — NOT_APPLICABLE / EMPTY / PASS / FAIL(wiring) / FAIL(project) / BLOCKED_ENV — ADR-052#amend-1)
- validate:design adapter 결과 (UI 한정 — current capability/source digest + registry status + command/path + fixed conformance 또는 Needs Install/WIRING FAIL; 비-UI는 n/a)
- 후속 권장 단계 (`/plan-milestone` — M/F가 아직 없으면(ADR-057); `contract-ready` M에 task 0건/`draft`가 있으면 `/plan-workitem M<N>` → `/seal-milestone M<N>`(ADR-060); 이미 봉인·구현 중이면 `/implement-workitem` 또는 다음 M)
- 스택별 default verify template은 본 skill의 "스택별 verify 풀세트" 표 기준. 도구 변경 시 ARCHITECTURE_OVERVIEW.md ## 7-X 갱신.
- **옵션: Claude PostToolUse async adapter 예시** (사용자가 채택 시 `.claude/settings.local.json` 에 복사). GUARDRAILS_STRATEGY.md 의 PostToolUse 동기 hook 예시와 동일하게 *Unix / Windows 2 OS 예시* 모두 제공 — 동일 schema 에 `async: true` + `asyncRewake: true` 만 추가:

**Unix/macOS 예시:**

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Write|Edit",
      "hooks": [{
        "type": "command",
        "command": "${CLAUDE_PROJECT_DIR}/scripts/verify.sh",
        "args": ["--changed"],
        "async": true,
        "asyncRewake": true
      }]
    }]
  }
}
```

**Windows 예시 (PowerShell 또는 `verify.mjs` 대응):**

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Write|Edit",
      "hooks": [{
        "type": "command",
        "command": "powershell",
        "args": ["-File", "${CLAUDE_PROJECT_DIR}/scripts/verify.ps1", "--changed"],
        "async": true,
        "asyncRewake": true
      }]
    }]
  }
}
```

**Schema 주의**: 위 GUARDRAILS_STRATEGY.md PostToolUse 동기 hook 예시와 동일 패턴 — `matcher` 만 사용 (도구 이름 필터). 파일 확장자 필터는 *verify 스크립트 내부* 에서 처리 — Anthropic [hooks docs](https://code.claude.com/docs/en/hooks) 의 `if` 필드 단일-rule 제약 (`|`/`&&` 미지원) 회피. `asyncRewake: true` 는 verify 가 **exit code 2** 로 종료 시 Claude 를 깨워 stderr 를 system reminder 로 주입. Windows `command`/`args` 조합은 fork 적용 시 docs 직접 확인 — **본 예시는 1 차 해석이며 schema variant 가 발견되면 SSOT 가 아님**.

도입은 사용자 결정. 본 hook은 *조기 피드백 adapter* — 실패 시 Claude를 깨워 stderr를 system reminder로 주입. **차단형 게이트 아님** (완료 판정은 동기 `validate-workitem` / `finalize-workitem` / `stabilize-milestone`이 책임).

## 재실행 계약 (idempotent — ADR-063 D3)

본 skill 은 재실행 가능하며 **변경이 필요한 것만 건드린다**. 아래 표가 그 경계의 SSOT다.

| 산출물 | 재실행 동작 |
|---|---|
| `validate` / `validate:e2e` / `validate:design` 진입점 | 존재하면 **교체하지 않는다** |
| 도구 선택 (Biome / ESLint / Vitest / Jest 등) | 존재하면 **교체하지 않는다** (도구 감지 우선 순서 2) |
| toolchain 설치 | 이미 설치돼 있으면 재설치하지 않고 `deps already present` 출력 |
| `scripts/verify.*` 본문 | **존재하면 덮어쓰지 않는다.** 4단계 커버리지 부족만 출력에 보고한다 |
| 도구 config 의 harness 경로 배제 | 누락된 배제 항목만 **추가** (기존 규칙 미수정 — 수행-2-1) |
| `## Dart Source Roots` | 매 실행 **실측 갱신** (실제 소스 트리 조회) |
| `## E2E Smoke Registry` | 매 실행 **실측 갱신** (runtime target 별 재판정) |
| `## Design Gate Adapter` | 매 실행 **digest + conformance 재검증**, 낮은 capability version 은 승격 |
| `## Dependency Tools` | **보완만** — `/bootstrap-stack` 기록 행 미수정, 불일치는 보고 + 사용자 결정 |
| `.gitattributes` | 전역 규칙 존재 확인 + 누락 규칙만 추가 (수행-4) |
| 임시 probe (`src/__stackguard_probe__.*` 등 등록 소스·테스트 루트 안) | 실행 시 생성 → 회차별 판정 → **전부 삭제**. `.gitignore` 에 등재하지 않는다(등재하면 도구가 검사에서 제외해 판정 불가) |
| `STACK_SETUP_PLAN ## 통합 명령 사용법` 의 `probe smoke:` 줄 | 매 실행 **최종 판정으로 갱신** (수행-5-f — `[Guard-drift]` (d) 의 유일한 입력) |

**재실행 시점**: `/bootstrap-stack --migrate` 직후, `/stabilize-milestone` 이 `P2 [Guard-drift]` 를 기록한 뒤(다음 `/plan-milestone` R0 가 회수해 안내), design gate capability version 승격 시.

## 정적 분석 도구 권장 (스택별 1종, ADR-021)

| 스택 | 도구 | 비고 |
|------|------|------|
| TypeScript / JS | `dependency-cruiser` | layer 위반 룰을 ARCHITECTURE_OVERVIEW `## 3-1` 채움 시 함께 권장. |
| Python | `import-linter` | 동일 layer 룰 패턴 |
| Go | `go vet` (built-in) | 후속 보강 가능 |
| Rust | `cargo deny` + `cargo udeps` | unused deps + license/advisory 동시 점검 |
| Dart / Flutter | `flutter analyze`(내장) + `dependency_validator` | layer 위반 룰은 `custom_lint` 로 확장 가능. 보안 취약점은 `dart pub get` 이 표시하는 advisory + `pubspec.lock` 대상 OSV 스캐너 |

## 스택별 verify 풀세트 (default template)

본 표는 *runtime / 언어* 축으로 verify 도구 default 를 박는다. [ADR-031](../../../docs/90-decisions/boilerplate/ADR-031-non-web-out-of-scope.md) 의 *프로젝트 유형 축* (web frontend / API server / CLI / monorepo / Supabase / Flutter(Android·iOS) — 범위 SSOT는 ADR-031#amend-1·ADR-059 D1) 과는 *직교 차원* — 한 프로젝트는 *유형 1 + runtime 1* 의 조합으로 자기 verify 명령을 박는다 (예: *TS web frontend* = 유형 "web frontend" × runtime "TS" → TS web 행 적용). 본 표 자체는 ADR-031 의 직접 지원 유형 집합을 *축소하거나 대체하지 않는다*.

| runtime / 언어 (예시 프로젝트 유형) | format | lint | typecheck | unit test | e2e test |
|------|--------|------|-----------|-----------|----------|
| TS web (Next/Vite — 유형: web frontend) | Biome (또는 Prettier) | Biome (또는 ESLint) | `tsc --noEmit` | Vitest | Playwright |
| TS API (Express/Fastify/Hono — 유형: API server) | Biome (또는 Prettier) | Biome (또는 ESLint) | `tsc --noEmit` | Vitest | supertest 또는 동등 |
| TS CLI (유형: CLI) | Biome (또는 Prettier) | Biome (또는 ESLint) | `tsc --noEmit` | Vitest | (선택, snapshot) |
| TS monorepo (유형: monorepo — Nx/Turbo) | Biome (또는 Prettier) | Biome (또는 ESLint) | `tsc --noEmit` (workspace 별) | Vitest | 패키지별 적용 |
| TS + Supabase (유형: Supabase 통합) | Biome (또는 Prettier) | Biome (또는 ESLint) | `tsc --noEmit` | Vitest | Supabase test runner |
| Python | `ruff format` | `ruff` | `mypy --strict` (또는 pyright) | pytest | (선택, 스택별) |
| Go | `gofmt -l` | `golangci-lint` | `go vet` (built-in) | `go test` | (선택) |
| Rust | `cargo fmt --check` | `clippy` | `cargo check` | `cargo test` | (선택) |
| Flutter/Dart (유형: 모바일 앱 — Android·iOS) | `dart format --output=none --set-exit-if-changed <등록 source root>` | `flutter analyze` (플래그 없이 — 완화하면 info 진단이 전부 빠진다, ADR-059 D2) | (lint 단계에 포함 — `flutter analyze`가 타입 검사를 겸한다) | `flutter test` | `flutter test integration_test` |

생성된 `validate` 명령은 위 표의 **format / lint / typecheck / unit test 4단계**를 *순서대로* 묶고(**Flutter/Dart는 `flutter analyze`가 lint와 typecheck를 겸하므로 3단계이며, 이때 "missing: typecheck"로 보고하지 않는다** — ADR-059 D2), **e2e는 `validate:e2e` 별도 명령으로 분리**한다 (task 단위 finalize는 e2e 제외, milestone 단위 stabilize만 실행). 4단계 중 어느 하나라도 빠지면 출력에 *"missing: <단계>"* 명시. **Dart/Flutter 의 `<등록 source root>` 는 placeholder 가 아니다** — verify 스크립트가 `STACK_SETUP_PLAN.md ## Dart Source Roots` 의 경로 목록을 읽어 인자로 넘기고, 존재하지 않는 경로는 제외한다. 그리고 **매 실행마다 표 ↔ 실제 소스 트리를 대조**해(위 `find … | cut -d/ -f2 | sort -u`) 표에 없는 최상위 Dart 디렉터리가 있으면 `Dart source root drift: <디렉터리> — STACK_SETUP_PLAN ## Dart Source Roots 갱신 필요` 를 출력한다(ADR-059 D2). **이 대조는 경고이며 종료코드를 바꾸지 않는다** — 문서 drift 로 무관한 작업을 막지 않되, 새 디렉터리가 형식 검사에서 조용히 빠지는 것은 알린다. **runtime target 이 web 이면** stack-guard 가 `validate:e2e` 진입점 + 최소 playwright config 를 scaffold 하고 browser 를 설치한 뒤(`npx playwright install`) `validate:e2e` 까지 smoke 한다(수행-6 + Step 5). **runtime target 에 `native/*`(Android·iOS) 가 포함되면** `validate:e2e` 를 `flutter test integration_test` 로 배선하고 **앱 e2e 를 Playwright 에 배선하지 않는다**(ADR-059 D8 — 단 design surface 가 있으면 design gate 용 chromium 은 설치한다). e2e 대상이 아니면 scaffold 를 skip 하되 toolchain 설치는 수행한다.

도구 선택은 **첫 fork에서 결정 + ARCHITECTURE_OVERVIEW.md `## 7-X`에 박힌다** — 이후 변경 시 [/bootstrap-stack](../bootstrap-stack/SKILL.md) 재실행 또는 수동 갱신.

**TS-first depth 권고**: TS 스택은 본 보일러플레이트 직접 지원 ratio가 가장 큼 → default를 `Biome (format+lint 통합) + tsc + Vitest + Playwright`로 박는다 (`Biome` 단일 선택으로 paralysis 차단). 사용자가 ESLint+Prettier 분리 선호 시 ARCHITECTURE_OVERVIEW.md에 명시 후 verify 갱신.

**도구 감지 우선 순서** (기존 프로젝트에 fork되는 경우):

1. **감지**: `package.json` 의존성·devDependencies / `.eslintrc*` / `.prettierrc*` / `biome.json` / `vitest.config.*` / `jest.config.*` / `playwright.config.*` 등 *기존 도구 흔적* 먼저 확인.
2. **존재 → 그대로 사용**: 위 도구 중 어느 것이 *이미 박혀 있으면* default로 *덮어쓰지 않는다*. 예: ESLint+Prettier+Jest가 박힌 프로젝트에 Biome+Vitest를 강제 install 금지. 발견 도구를 ARCHITECTURE_OVERVIEW.md `## 7-X`에 기록.
3. **부재 → Biome+tsc+Vitest+Playwright default 박음**: green-field 또는 도구 미정 프로젝트에만 적용.
4. **충돌(Biome ↔ ESLint+Prettier 둘 다 박힘 등)**: 사용자에게 출력으로 보고 + 결정 요청. 자동 선택 X.

**Dependency 설치 정책** (toolchain 선설치 — 기본은 *설치한다*, 차단 시 graceful fallback):

- `/stack-guard` 는 *authored toolchain 을 기본 설치* 한다(수행-6). 산출은 `package.json` 의 `scripts.validate`(+ UI/web 이면 `scripts.validate:e2e`) 진입점 + verify 스크립트 본문 + 실제 설치된 devDeps(예: `biome / typescript / vitest / @playwright/test`) + (UI/web) playwright browser.
- 패키지 매니저 설치는 lockfile 존재 시 frozen(`pnpm install --frozen-lockfile` / `npm ci`) 우선, 부재 시 일반 install. 설치된 devDeps 목록을 출력에 박는다.
- **설치 범위 경계(SSOT)**: stack-guard 가 까는 것은 *toolchain + e2e 의존* 뿐이다. *task 단위 기능 패키지*는 plan-workitem authoring → implement-workitem 설치(ADR-040#amend-1). 경계 결정 기록은 ADR-052(install-ownership 3분할).
- **Graceful fallback (날조·우회 금지)**: 네트워크 / 사용자 승인 / lockfile 충돌 / monorepo workspace 라우팅 / sandbox 정책으로 설치가 *실제 실패* 하면 fabricate 하지 않고 `Needs Install: <명령> — 메인 세션/사용자 실행 필요` 를 출력하고 가능한 산출(진입점·config·verify 스크립트)은 계속 생성한다(implement-workitem ADR-040#amend-1 패턴 동일). 이후 smoke 는 SKIPPED.
- 이미 설치돼 있으면(노드 모듈/lock 정합) 재설치하지 않고 verify 스크립트만 박되, 설치 상태를 `deps already present` 로 출력한다.

## Secret scanner 권장 (전 스택, ADR-021)
- `gitleaks` 또는 `trufflehog`. 둘 중 1종 선택.
- finalize 직전 staged 파일에 secret 패턴 검출 시 보고 → 프로젝트가 `validate`/CI fail 처리 선택.
- *강제 X, 권장만* (ADR-010 multi-tool 호환).

**이미 추적 중인 서명·인증 자산 점검 (전 스택, 필수 보고 — ADR-059 D9)**: 위 scanner 는 *staged 내용*을 보는 권장 도구이고, 이 항목은 **이미 커밋돼 추적 중인 파일**을 찾는 별개 점검이다. `.gitignore` 는 이미 추적 중인 파일을 보호하지 않으므로 brownfield 저장소에서는 규칙 추가만으로 해결되지 않는다. 매 실행 1회 확인한다.

```bash
git ls-files | grep -Ei '\.(jks|keystore|p12|mobileprovision|p8)$|key\.properties|-firebase-adminsdk-.*\.json|service-?account.*\.json'
```

- **출력 없음** → `tracked secrets: none` 1줄 보고.
- **출력 있음** → `Needs Secret Rotation: <경로 목록>` 을 출력하고 순서대로 안내한다 — ① 파일을 저장소 밖으로 옮긴다 ② `git rm --cached <path>` 로 추적을 끊는다 ③ **원격에 올라간 이력이 있으면 키 자체를 재발급한다**(히스토리에 남은 키는 ignore 로 되돌릴 수 없다). **stack-guard 가 직접 옮기거나 `rm` 하지 않는다** — 키 취급은 사용자 결정이고 잘못 지우면 복구가 불가능하다. 종료하지 않고 보고만 한다.
- 파일명 열거의 한계는 ADR-059 D9와 같다 — 경계 있는 통제는 credential 을 `secrets/` 하위에 두는 것이다.

`validate` 명령에 lint 단계로 통합 권장 — CI fail 처리는 프로젝트 결정.

## DESIGN.md lint 권장 (UI + Node 계열 한정, ADR-027#d25)
- **조건**: `docs/20-system/DESIGN.md` 존재(UI 프로젝트) **그리고** 스택이 Node 계열(npx 사용 가능)일 때만.
- **권장 명령** (강제 X, shared 기본값 미등록 — 사용자가 채택 시 `validate` 의 lint 단계 또는 CI에 wiring):
  ```bash
  npx @google/design.md@<x.y.z> lint docs/20-system/DESIGN.md   # version-pin (alpha라 변동 — 실제 버전 고정)
  # 규칙 목록은 문서에 박지 말고 runtime 조회: npx -p @google/design.md@<x.y.z> designmd spec --rules
  # Windows: npx -p @google/design.md@<x.y.z> designmd lint docs/20-system/DESIGN.md
  ```
- 검사 항목은 버전마다 다르므로 `spec --rules`로 조회한다(현재 broken token ref / WCAG contrast / orphaned token / section ordering 등). **format·declared-token 보조일 뿐 browser a11y 게이트가 아니다** — 실화면 접근성은 위 breakpoint 루프 (c)의 populated axe·렌더가 담당. exit 1 on error.

**설치 배선 — `@axe-core/playwright` devDep**: 6-2 toolchain 설치 또는 6-4-1 scaffold 시점에 `@axe-core/playwright`를 **devDep로 설치**한다(감지된 PM으로, 예: `npm i -D @axe-core/playwright`) — 설치하지 않으면 generated visual-qa spec·`validate:design` adapter가 `needs-install`/exit 2로 끝난다. 설치 실패는 stack-guard 6-5 `Needs Install` fallback(날조 금지). UI 프로젝트는 Playwright(재사용) + `@axe-core/playwright`(신규 devDep) 둘을 갖는다.

> **기존 fork 마이그레이션**: 기존 `e2e/visual-qa.spec.*`는 덮어쓰지 않는다. v1/lower adapter는 위 digest 정책으로 v2 업그레이드하고, local modification은 자동 덮어쓰기 금지. 기존 `status=n/a`도 frontend 신호가 생긴 재실행에서 UI로 승격한다. UI→비-UI 전환은 사용자 확인 뒤 generated adapter/entry만 제거한다(ADR-058#amend-2).
- **Motion 확장 주의**: 본 보일러플레이트는 Motion 을 canonical 8섹션 외 확장으로 둔다(ADR-027#d24). lint 의 section-ordering 은 canonical 8섹션 상대 순서만 보므로 통과하지만, 만약 특정 버전이 비-canonical 섹션을 경고하면 그 경고는 *무시 가능*(의도된 확장).
- 비-Node 스택·비-UI 프로젝트는 본 항목 skip. *GUARDRAILS_STRATEGY "OS·런타임 종속 자동화 강제 X" 정합 — npm 의존이라 shared 기본값에는 넣지 않는다.*

## CI 권장 출력 (ADR-025)
`.github/workflows/validate.yml` 형식 권장 텍스트를 출력한다. **스택 확정 후엔 출력에 그치지 말고 opt-in 파일 생성을 제안**한다 — 사용자가 명시 승인할 때만 `.github/workflows/validate.yml`을 생성(미승인 시 텍스트만; GUARDRAILS "강제 X" 정신). 로컬 PostToolUse hook 1-명령 설정 안내([GUARDRAILS_STRATEGY.md "## PostToolUse hook 매뉴얼 등록 절차"](../../../docs/00-meta/GUARDRAILS_STRATEGY.md))도 함께 출력:
```yaml
name: validate
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: <stack의 validate 명령>
```
GUARDRAILS_STRATEGY *"OS/셸 종속 hook 강제 X"* 정신 — 권장만.

## validate --changed (incremental, ADR-020)
- git diff 기반 변경 파일만 lint/typecheck/test.
- Nx affected / Turbo affected 패턴 차용.
- **사용 시점**:
  - `/finalize-workitem` 직전 → `--changed`만 (빠른 회전).
  - `/stabilize-milestone` → full validate (누락 차단).

## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 ADR/architecture 섹션은 task 본문에서 발화 시 인용 — 사전 fork-load 금지.
