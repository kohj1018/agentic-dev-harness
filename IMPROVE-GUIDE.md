# 개선 실행 가이드

이 문서 하나만 보고 순서대로 따라가면 이번 라운드 개선이 전부 끝난다.

## 무엇을 고치는가

파일럿 fork에서 관측된 결함 4건을 고친다.

1. **실행 오라클 부재** — 외부 경계(영속 저장소 쓰기·외부 네트워크 호출·실행 진입점)를 건드린 task가 *한 번도 실제로 실행되지 않은 채* done이 된다. 모든 검증이 손으로 만든 스텁 안에서만 돌아, 스텁이 현실과 다르면 아무것도 잡지 못한다.
2. **검증 판정력 미확인** — 테스트가 "원하는 이유로 실패"했는지 확인하는 규정(ADR-009 Red)이 있으나 그 관측이 기록되지 않아 반증 불가능하다. 그래서 아무것도 보고 있지 않은 테스트가 통과로 남는다.
3. **외부 사실의 미실측 상태 부재** — 계획이 서드파티 API의 엔드포인트·파라미터·필드를 검증 없이 AC에 확정으로 박는다. 틀리면 구현자가 매번 "AC를 따를까 관측을 따를까"를 사용자에게 물어야 한다.
4. **`/finalize-workitem` 다중 ID 미정의** — 다중 ID가 문서화돼 있으나 파싱 규칙이 없어 무관한 task를 처리한 사례가 관측됐다. **사용자 결정으로 단일 ID로 축소한다**(dogfood에서 3-ID finalize가 실제 수행된 적이 있으므로 "쓰인 적 없는 기능"이 아니라 *쓰지 않기로 한* 기능이다).

팬아웃 임계(`validate-workitem` inline vs fan-out) 문제는 **이번 범위가 아니다** — ADR-051 통합 재발행이 필요해 별도 라운드로 미룬다.

## 설계상 반드시 지켜야 할 3가지 (어기면 lifecycle이 막힌다)

작업 전에 이 셋을 이해하고 들어간다. 아래 Stage들은 전부 이 셋을 전제로 쓰여 있다.

**(1) 차단은 `/implement-workitem`이 하고, `/validate-workitem`은 기록만 한다.**
`/validate-workitem`은 실행 권한이 없다 — `allowed-tools`에 범용 `Bash`도 해시 도구도 없고(`validate`/`git`/`wc`뿐), 본 개선에서도 추가하지 않는다. validate가 할 수 있는 일은 `## 8`의 receipt **문자열을 읽는 것**뿐인데, 저장소 규칙(`GUARDRAILS_STRATEGY.md`의 "새 기계적 검사의 배치 기준" 1문항)은 *"문자열만 보면 기록 등급 상한 — 차단 금지"*다. 직전 선례인 ADR-063 D4(d)(`probe smoke:` 문자열 읽기)도 그래서 기록 등급이다.
→ 실질 차단은 **implement가 증거를 못 만들면 task를 완료하지 않는 것**이 담당한다. 이것은 기계적 검사가 아니라 실행자가 날조를 거부하고 멈추는 것이며, 기존 `Needs Install` · `Needs Research` · `Needs MCP Access` 선례와 동형이다.

**(2) 증거는 가능하면 *재실행 가능한 형태*로 남긴다.**
일회용 실자원(테스트 DB·로컬 컨테이너·에뮬레이터)에 대고 도는 테스트로 남기면, 그 테스트가 통합 `validate`에 묶여 **기존 exit code 게이트가 구조적으로 차단**한다. 문자열 검사가 아니므로 배치 기준 2문항을 모두 통과한다. 1회성 관측 receipt는 재실행 가능 증거를 만들 수 없을 때의 차선이다.

**(3) receipt는 모든 파일 변경이 끝난 뒤, `/validate-workitem` 실행 *이전*에 쓴다.**
순서가 틀리면 둘이 깨진다 — (i) receipt를 쓴 뒤 테스트·픽스처를 추가하면 그 증거가 최종 코드를 덮지 못하고 `## 4-1`에서도 누락된다, (ii) validate가 report를 쓴 *뒤에* `## 8`을 건드리면 task 문서 mtime이 갱신돼 finalize가 report를 stale로 판정하고 `Needs Validation`으로 종료한다(재validate → 재기록의 무한 후퇴). 그래서 implement의 단계 순서를 **판정력(6-V) → 실행 증거(6-E) → `## 4-1` 갱신 → receipt 기록(6-R) → 최종 sanity**로 고정한다.

## 실행 규칙 (전 단계 공통)

- **단계 순서를 지킨다.** Stage 1의 ADR이 없으면 Stage 2~4의 본문이 존재하지 않는 ADR을 인용하게 되고, 문서 정합 점검(`P1 [ADR-ref]`)에 걸린다.
- **이 가이드에 적힌 파일만 수정한다.** 인접 코드·문구 개선, 무관 포맷팅, 오탈자 수정 금지.
- **날짜를 채워 넣을 자리는 없다.** ADR-064는 amendment가 아니라 신규 ADR이라 본문에 날짜 필드가 없고, 다른 편집에도 날짜가 들어가지 않는다. **receipt 양식 안의 `<날짜>`·`<오늘 날짜>`·`YYYY-MM-DD`는 그대로 placeholder로 둔다** — 그 skill이 실제로 실행될 때 채워지는 값이므로 지금 특정 날짜로 치환하면 양식이 깨진다.
- **저장소 어느 파일에도 이 가이드를 언급·링크하지 않는다.** 작업이 끝나면 이 파일은 삭제된다.
- Before/After가 있는 항목은 **Before 문자열을 파일에서 찾아 그 자리에** After로 교체한다. Before가 안 보이면 이미 적용됐거나 파일이 다르므로 멈추고 확인한다.
- 커밋은 각 Stage 끝의 "커밋" 항목에서만 한다. `git add -A` / `git add .` 금지 — 그 Stage에서 만진 파일만 명시적으로 add한다.
- 확인용 `grep` 명령은 환경에 따라 한글 패턴을 놓치는 구현이 있다(구버전 GNU grep 등). **`rg`(ripgrep)가 있으면 같은 패턴을 `rg`로 한 번 더 돌려 결과가 같은지 확인한다.**

## 손대지 말 것 (일부러 남기는 것)

- `docs/90-decisions/boilerplate/ADR-008-commit-convention.md:71` 의 `다중 task 묶음 commit은 Refs: T-001, T-002 형식` — finalize가 단일 ID가 돼도 repair-milestone의 cross-cutting 수정 등은 여전히 다중 task 커밋을 만든다. 이 줄은 유효하다.
- `.boilerplate/validation/SIMULATION_RUN.md` — 과거 실행 기록(Record). 다중 ID 언급이 있어도 고치지 않는다.
- `.agents/skills/**` — 전부 `.claude` 본문을 가리키는 포인터 wrapper라 이중 수정이 불요하다. `finalize-workitem` wrapper는 이미 `<task-id>` 단수다.
- `README.md` / `README_ko.md` — 이미 `[task id]` 단수. 수정 불요.
- `docs/00-meta/GUARDRAILS_STRATEGY.md` — 검증 장치 *유지 주기* 표는 ADR-063 D5 소관이고 이번 계약은 주기 항목이 아니다. **특히 "새 기계적 검사의 배치 기준" 2문항에는 예외 조항을 추가하지 않는다** — 이번 설계는 그 규칙을 *따르는* 방식으로 만들어졌다.
- `docs/30-workitems/_templates/MILESTONE_TEMPLATE.md` · ADR-014 — 졸업 게이트 5+1에 항목을 추가하지 않는다. 이번 변경은 task 층만 건드린다.
- `.claude/skills/validate-workitem/SKILL.md` 의 `allowed-tools` — **범용 Bash·해시 도구를 추가하지 않는다.** report-only 계약이 이 skill의 정체성이다.

---

# Stage 0 — finalize 단일 ID 축소

선행 없음. 다른 Stage와 독립이므로 먼저 끝낸다.

## 0-1. `docs/00-meta/WORKFLOW.md`

`## 4-1. 마감 (finalize)` 섹션의 마지막 줄.

**Before**
```
- 다중 task 묶음 커밋: `/finalize-workitem T-001 T-002` 형태로 다중 ID 허용.
```

**After**
```
- `/finalize-workitem`은 **task ID 1개**만 받는다(여러 ID를 받던 이전 형태는 파싱 규칙 부재로 무관 task를 처리한 사례가 관측돼 철회). 여러 task를 함께 마감해야 하면 각각 순차로 finalize한다.
```

## 0-2. `.claude/skills/finalize-workitem/SKILL.md` — frontmatter

**Before**
```
argument-hint: "[task identifier(s)] [--apply --rationale \"<why>\"]"
```

**After**
```
argument-hint: "<task-id> [--apply --rationale \"<why>\"]"
```

## 0-3. `.claude/skills/finalize-workitem/SKILL.md` — 입력

**Before**
```
- `$ARGUMENTS`에는 task ID(또는 다중 ID, 예: `T-001 T-002`)가 들어온다.
```

**After**
```
- `$ARGUMENTS`에는 **task ID 1개**가 들어온다. 여러 ID를 받던 이전 형태는 파싱 규칙이 정의되지 않아 무관 task를 처리한 사례가 관측돼 철회했다 — 여러 task를 함께 마감해야 하면 각각 순차로 호출한다.
  - **task-id sanitization 강제**: `T-[0-9]+` 패턴 정확히 1개만 허용. ID가 0개이거나 2개 이상이면 "task ID 1개만 지정" 안내 후 종료한다(파일·git index 무변경). `/`, 공백, glob 메타문자(`*`, `?`, `[`)가 포함되면 즉시 종료 (`/repair-workitem` 가드와 대칭).
  - **플래그·값과 ID를 분리해 파싱한다**: `--`로 시작하는 토큰과 그 값은 ID 후보에서 제외한다. `--rationale`의 값은 따옴표로 감싼 문자열 *전체*가 하나의 값이며, **그 안에 `T-NNN`이 등장해도 task ID로 해석하지 않는다**.
  - **정의되지 않은 플래그가 있거나, 같은 플래그가 2회 이상이거나, `--rationale` 값이 빈 문자열이면** 추측하지 말고 안내 후 종료한다(파일·git index 무변경).
```

## 0-4. `.claude/skills/finalize-workitem/SKILL.md` — 1-G 착수 상태 게이트

해당 줄의 **마지막 문장만** 교체한다. *"어느 단계에서 종료해도 무변경"* 같은 전역 주장을 넣지 않는다 — 수행 6번이 status를 쓴 뒤 commit hook이 실패하는 경로가 있어 그 주장은 참이 아니다.

**Before**
```
`done`이면 read-only no-op("이미 완료" 안내, 파일·git 무변경). **다중 task 입력이면 하나라도 상태가 틀리면 파일·git index·status를 전혀 건드리지 않고 일괄 중단**한다(부분 커밋·부분 staging 방지).
```

**After**
```
`done`이면 read-only no-op("이미 완료" 안내, 파일·git 무변경). **본 게이트에서 종료하는 경우 파일·git index·`## 0. Status`를 전혀 건드리지 않는다.**
```

## 0-5. `.claude/skills/finalize-workitem/SKILL.md` — 수행 9번

⚠ 아래 Before/After는 **그 줄의 앞부분만**이다. 줄 전체를 After로 갈아치우면 뒤에 이어지는 지시문(sibling task 회수·Feature-완료 블록)이 통째로 사라진다. `각 task` → `본 task` 두 글자만 바꾼다.

**Before**
```
9. **feature-완료 감지 (ADR-057 결정 5)**: 직전 단계에서 status를 `done`으로 갱신한 각 task(⚠ 0C-6이
```

**After**
```
9. **feature-완료 감지 (ADR-057 결정 5)**: 직전 단계에서 status를 `done`으로 갱신한 본 task(⚠ 0C-6이
```

## 0-6. `.claude/skills/finalize-workitem/SKILL.md` — 다중 ID 처리 섹션 삭제

**Before** (3줄)
```
다중 ID 처리:
- `$ARGUMENTS`에 여러 task ID가 있으면 모든 ID의 status를 갱신하고 한 커밋에 묶는다.
- 커밋 메시지에 모든 ID를 명시한다.
```

**After**: 위 3줄을 **삭제**한다. 삭제 후 `## Context 정책 (ADR-019)` 앞에 빈 줄이 1개만 남게 정리한다.

## Stage 0 확인

```
grep -n "다중 ID\|다중 task" .claude/skills/finalize-workitem/SKILL.md
grep -n "다중 ID\|다중 task" docs/00-meta/WORKFLOW.md
```
→ 두 명령 모두 0건이어야 한다. **`docs/00-meta/WORKFLOW.md`에 bare `다중`으로 grep하지 말 것** — 11번째 줄의 `다중 concept`(디자인 시안, 무관)이 걸려 false failure가 난다.

## Stage 0 커밋

```
fix(finalize): accept a single task id and define argument parsing
```

---

# Stage 1 — ADR-064 신설

Stage 2~4가 전부 이 ADR을 인용하므로 반드시 먼저 만든다.

## 1-1. 새 파일 `docs/90-decisions/boilerplate/ADR-064-task-layer-evidence-contract.md`

아래 내용을 그대로 작성한다.

````markdown
# ADR-064 — task 층 증거 계약 (Task-Layer Evidence Contract)

> scope: boilerplate
> area: tooling

## Status
accepted

## 배경
- [관측됨] 외부 파일럿 fork(외부 사이트 18곳 수집 배치 파이프라인, task 27개)에서 P0 2건이 **task 20개를 전부 통과한 뒤** 진입점을 처음 실제 실행한 지 3분 만에 드러났다. (a) 생산 코드가 float를 내는데 DB 컬럼이 integer라 첫 write에서 배치 전체가 죽었고, (b) 외부 API가 특정 조건에 필드를 null로 주어 해당 커넥터 전체가 죽었다. 두 결함 모두 **모든 스텁이 그 값을 정수 상수로 하드코딩**하고 **픽스처가 그 필드를 항상 채웠기** 때문에 전 검증 계층을 통과했다. 직접 원인은 *현실을 대표하지 못하는 픽스처*이며, 그것을 방치한 통제 공백이 **픽스처 출처(provenance) 규정의 부재**다(저장소 전체에 관련 규정 0건).
- [관측됨] 현행 `/validate-workitem`은 이 상태를 `## Evidence Bundle`의 *검증하지 못한 것*에 `외부 서비스 실패·timeout: <mocked / not covered>`로 **선언만** 하게 하고, 미명시 시 벌칙도 *신뢰도 Low 강등*(자동 차단 없음)뿐이다.
- [관측됨] 실행 오라클을 강제하는 유일한 게이트는 마일스톤 졸업의 E2E(ADR-014#amend-4 / ADR-052#amend-1)인데, 그 적용 조건이 **UI 프로젝트 ∨ graduation item 6의 명시 선언**이라 UI 신호가 없는 프로젝트는 기본값이 `NOT_APPLICABLE`이다. `/plan-milestone`은 item 6에 e2e를 선언하도록 유도하지 않는다(본문에 `e2e` 문자열 0건).
- [관측됨] 그 결과 보일러플레이트 자신의 dogfood(`.boilerplate/validation/SIMULATION_RUN.md`)에서도 Round 1의 CLI 마일스톤이 *"E2E 명령 미설정으로 skip"* 상태로 완료 기준 5/5를 충족해 졸업했고, Round 5 이후 등장한 subprocess E2E는 졸업 게이트가 요구한 것이 아니라 그 프로젝트 task의 AC 선택에서 나온 **task-specific 산물**이다(Round 9 graduation 표의 item 3은 여전히 `E2E N/A`).
- [관측됨] ADR-009는 Red phase 종료 조건을 *"원하는 이유로 실패함을 확인"*으로 규정하지만 **그 관측이 어디에도 기록되지 않는다.** 하류에서 이를 재확인하는 유일한 장치는 `/validate-workitem`의 git-log 테스트 선행 휴리스틱인데, 본문이 *"단순 경고로만 보고하고 강제 종료하지 않는다"*로 못 박고 있다. 즉 반증 불가능한 규율이다.
- [관측됨] 같은 파일럿에서 AC를 지키는 테스트가 아무것도 보고 있지 않은 사례 3종이 확인됐다 — 검사 대상 가드를 통째로 무력화해도 그 파일 테스트 전부 통과 / 종료 코드 단정이 `expect(undefined).not.toBe(0)` 형태라 "종료 코드를 아예 설정하지 않는" 회귀를 통과 / stderr 캡처 헬퍼가 항상 빈 문자열을 반환해 "로그가 없어야 한다" 쪽 단정이 항상 참.
- [관측됨] 같은 파일럿에서 plan 층이 서드파티 API의 엔드포인트·파라미터·필드 구조를 문서와 참고 구현만 보고 AC 본문에 확정으로 박아 한 마일스톤에 6~7건이 틀렸다(존재하지 않는 쿼리 파라미터명·잘못된 페이지네이션 단위·이전된 호스트·404 경로·누락된 필드 매핑·잘못된 필드 타입). 잘못된 파라미터가 **0건을 반환해 "원천이 차단했다"처럼 보인** 조용한 오진 사례가 포함된다. 추정값과 확정값을 구분하는 표기가 task 스키마에 없다.
- [외부실증] ADR-047 D8(Oracle Adequacy) — pass/fail 단일 신호는 과신을 만든다. ADR-063 D1 — *"통과 fixture만으로는 「아무 대상도 잡지 않는 검사」와 구분되지 않는다"*, *"산문 추론으로 커버리지를 판정하지 않는다."* 본 ADR은 그 원리를 **도구 층에서 task 층으로** 확장한다.

세 결함은 한 문장의 세 얼굴이다 — **task 층이 관측하지 않은 것을 관측한 것처럼 단정한다.** 그래서 하나의 계약으로 묶는다.

## 결정

### D1. 실행 증거 (Execution Evidence)
**외부 경계를 건드린 task는 그 경계를 실제로 밟은 증거 없이 완료되지 않는다.**

- **대상 판정(외부 경계 task)**: task `## 3. 구현 항목` 또는 `## 4-1. 변경 예정 파일/경로`가 다음을 건드리면 그 종류가 대상이다.
  - **(a) 영속 저장소 쓰기** — DB write/마이그레이션, 파일·오브젝트 스토리지 write, 캐시·큐 적재
  - **(b) 외부 네트워크 호출** — **서드파티·타 시스템** API·서비스·웹훅 송수신. **같은 저장소·같은 배포 단위 안의 서비스 간 호출은 (b)가 아니다**(모노레포에서 자기 API 서버를 부르는 프론트 task로 게이트가 오발동하지 않게 한다). 그런 호출은 (c) 또는 로컬 기동으로 판정한다.
  - **(c) 실행 진입점** — CLI 명령, 배치 잡, 스케줄러, 워커 등 프로세스로 기동되는 것
  셋 중 어느 것도 해당하지 않으면 본 D1은 적용되지 않는다(순수 로직·표시 계열 task는 대상 아님).
- **표시 형식**: `/plan-workitem`이 그 task `## 2. 작업 범위` 끝에 `- 외부 경계: <해당 종류만 나열> — 구현 시 경계 종류마다 실행 증거 필요` 한 줄을 남긴다. **해당하는 종류만 적는다** — "(a)/(b)/(c) 중 해당"처럼 뭉뚱그리면 어느 경계에 증거가 필요한지 알 수 없어 표시가 무용해진다. **표시가 없거나 틀려도 `/implement-workitem`·`/validate-workitem`은 실제 변경으로 재판정한다** — 표시는 판정을 *돕는* 입력이지 유일 근거가 아니다.
- **해당하는 경계 *종류마다* 각각 1건 이상의 증거가 필요하다.** (a)와 (b)에 모두 해당하면 2건이다. 한 종류의 증거가 다른 종류를 대신하지 못한다 — 마스킹된 응답 재생은 응답 파싱을 증명하지만 DB 스키마 write를 증명하지 않고, 진입점 기동은 요청 URL·인증 형식을 증명하지 않는다.
- **증거의 두 등급 — 1순위를 먼저 시도한다.**
  1. **재실행 가능 증거(권장)** — 일회용 실자원(테스트 전용 DB·로컬 컨테이너·에뮬레이터)에 대고 도는 테스트를 만들어 **통합 `validate` 명령에 묶는다.** 이 경우 회귀 차단은 기존 `validate` exit code 게이트가 담당하며, 그 판정은 문자열이 아니라 실제 실행이므로 구조적이다. 증거가 1회성으로 증발하지 않고 다음 라운드에도 계속 지킨다. **이미 있는 e2e가 그 경계를 실제로 밟는다면 새로 만들 필요 없이 그 실행이 등급 1 증거다**(D6 — 무엇이 그 경계를 밟았는지 receipt에 1줄로 명시).
  2. **1회성 관측 receipt(차선)** — 위가 불가능할 때만 쓴다(유료·rate-limited API / 자격증명 필요 / 수동 환경 / dry-run만 제공되는 대상). 허용 형태는 ① 일회용 실자원에 대한 수동 1회 실행 ② 읽기 전용 실 호출 1회 관측 ③ 마스킹된 실 응답 재생 ④ dry-run ⑤ 사용자 waiver.
- **안전 규정 (전부 강제)**
  - **자사 운영 환경(project-owned production)에 접속하지 않는다.** 서드파티 공개 엔드포인트는 *읽기 전용*에 한해 허용한다 — 이 둘을 구분하지 않으면 "운영 금지"가 서드파티 실측 자체를 봉쇄한다.
  - **파괴적 호출(외부 상태를 바꾸는 write·삭제·결제·발송)을 자동 실행하지 않는다.** 그 경로는 등급 1(일회용 실자원) 또는 dry-run으로 대체한다.
  - **개인정보가 반환될 수 있거나, 유료이거나, rate limit이 있는 엔드포인트는 사용자 승인 후에만 호출한다.** 호출 전에 *필요한 최소 필드*만 받도록 요청을 좁힌다 — 마스킹은 사후 방어일 뿐이므로 애초에 덜 받는 것이 1차 방어다.
  - **raw 응답 전문을 출력·로그·receipt에 싣지 않는다.** 구조 확인에 필요한 최소 발췌만 남기고, 그 발췌도 D5의 마스킹 규정을 따른다. 출처 URL에 민감한 쿼리 문자열이 있으면 그 부분을 가린다.
  - `.env`·자격증명 파일 접근 금지 정책은 그대로 적용된다 — 본 D1은 그 정책의 예외가 아니다.
- **미확보 시**: 날조·우회하지 않고 `Needs Execution Evidence: <경계 종류> — <무엇을 못 했는지 1줄> / 가능한 대안: <있으면>`으로 **멈춘다**(task를 완료하지 않는다).
- **waiver는 사용자만 발급한다** — 에이전트가 면제를 스스로 판단하거나 사유를 발명하지 않는다(`/finalize-workitem`의 `--rationale` 규정과 동일 근거). 입력 경로는 `/implement-workitem`의 `--waiver "<사유>"` 플래그다.
- 증거의 기록 위치·작성자·시점은 **D4**가 소유한다.

### D2. 검증 판정력 (Verification Power)
**테스트가 실제로 무언가를 보고 있는지 확인하고, 그 확인을 기록한다.**

기본 경로는 **코드를 변형하지 않는 3수단**이며 이 순서로 적용한다.

1. **Red 관측 기록** — ADR-009의 Red phase 종료 조건(*"원하는 이유로 실패"*)을 **관측 사실로 남긴다**. 구현 전에 통과해 버리면 그 테스트는 판정력이 없으므로 테스트를 먼저 고친다.
2. **반례 테스트(counterexample)** — 거부·차단돼야 할 입력을 넣고 실제로 거부되는지 단정한다. **이것은 대개 AC 본연의 행동("잘못된 입력을 거부한다")이므로 `AC-N`으로 매핑한다** — 아래 `VC-N`으로 빼지 않는다.
3. **positive control** — 검사 헬퍼·수집기 자체가 살아 있는지 확인한다. 예: "로그가 없어야 한다"를 단정하기 전에 **일부러 로그를 하나 심어 헬퍼가 그것을 잡는지** 확인한다. 부재(absence)를 단정하는 AC는 1만으로 판정력이 증명되지 않으므로 이 수단이 필수다.

- **`VC-N` 등재 범위**: `## 6-1. 테스트 시나리오`에 `VC-N`으로 등재하는 것은 **AC의 행동으로 귀속되지 않는 판정력 확인용 테스트**(대표적으로 positive control)뿐이다. 제품 행동을 검증하는 반례 테스트는 `AC-N`으로 매핑한다 — 그것까지 `VC-N`으로 빼면 실제 AC 커버리지가 집계에서 사라져 커버리지 %가 부풀려진다.
- **`VC-N`은 `## AC ↔ 테스트 매핑` 집계(커버리지 %)의 분자·분모 어디에도 넣지 않는다.** 그 %가 신뢰도 등급의 입력이므로 섞으면 등급이 조용히 이동한다. 등재 목적은 그 테스트 줄이 diff trace audit(ADR-006#amend-1)에서 `AC-N | 명시 요청 | VC-N`으로 역추적되게 하는 것이다. **포괄 면제를 두지 않는다** — 면제는 임의 테스트 헬퍼·도구 추가가 범위 감사에서 빠지는 창구가 된다.
- **`## 6-1`의 writer는 사람 · builder · foreman 셋이며, `VC-N` 행의 writer는 foreman 단독이다**(`## 4-1` 단일 writer 규율과 동형).
- **Red 관측의 허용 상태는 넷이다** — 모든 task가 Red를 가질 수 있는 것은 아니다.
  - `observed` — 정상 경로. 구현 전 실패를 관측했다.
  - `opt-out(<사유>)` — task `## 6-2. TDD opt-out`이 정당하게 채워졌거나 `Type: research-spike`인 경우(ADR-009). Red가 존재할 수 없으므로 결함이 아니다.
  - `characterization(<사유>)` — `Type: refactor` 등 외부 행동 불변이 목표라 기존 동작을 고정하는 테스트가 구현 전에도 통과하는 경우.
  - `unrecoverable(<사유>)` — 세션 중단 등으로 구현 후 재개해 원래 Red를 재현할 수 없는 경우. 이때는 **반례 테스트 또는 positive control로 판정력을 대체 확인하고 그 결과를 `<사유>` 안에 함께 적는다**(예: `unrecoverable(세션 중단 — 대체 확인: 반례 테스트 2건 RED 관측)`). Red 관측 유실이 영구 차단으로 굳지 않게 하는 회복 경로다.

**격리 변이(mutation) 승격** — 위 3수단으로 판정력이 확인되지 않을 때에 한해, **격리된 작업 사본에서만** 코드를 일시 변형해 민감도를 측정할 수 있다. 아래 **4 게이트를 전부 충족할 때만** 승격하며, 하나라도 미달이면 승격하지 않고 그 사실을 receipt에 한 줄 남긴다(재량 0).

- **G1 손해 등급** — 그 AC가 막는 실패가 다음 중 하나다: 데이터 손상·유실 / 보안·권한 경계 / 비가역 외부 부작용(결제·삭제·발송·외부 상태 변경). 표시·성능·편의 계열은 대상이 아니다.
- **G2 3수단으로 미수렴** — 의심이 *특정 단정*으로 좁혀지지 않아 반례·positive control을 **설계할 수 없다**. 어느 단정이 공허한지 특정할 수 없다는 사실을 파일·단정 수준으로 적을 수 있어야 한다. 좁혀지면 3수단으로 충분하므로 승격하지 않는다.
- **G3 관측 신호** — 막연한 불안이 아니다. 다음 중 1개 이상: (a) 구현 전에도 통과했던 테스트가 있다, (b) 같은 파일에서 이미 공허한 단정이 1건 확인됐다, (c) 그 AC 경로에 실행되지 않는 분기가 있다, (d) 이 AC가 막는 결함이 과거 실제로 유출된 적이 있다.
- **G4 격리 가능** — 별도 작업 사본에서 그 테스트를 독립 실행할 수 있다. 공유 DB·고정 포트·외부 자원에 묶여 사본에서 돌릴 수 없으면 **승격을 금지한다** — 사본에서 못 돌리면 결국 원본 작업 트리를 변형하게 되고 그것이 관측된 사고 경로다.

승격 시 실행 규율(전부 의무):

- **R1** 별도 worktree 또는 사본에서만 수행한다. **현재 작업 트리의 변형은 예외 없이 금지.**
- **R2** 한 번에 변이 1개. 여러 개를 동시에 넣으면 첫 실패에서 멈춰 뒤 것의 판정력을 측정할 수 없다.
- **R3** **적용 확인을 먼저 한다** — 변이가 실제로 코드에 반영됐는지 확인한 뒤 실행한다. 미적용 상태의 초록불을 커버 증거로 읽으면 안 된다.
- **R4** 판정 단위는 전체 종료코드가 아니라 **"그 변이가 어느 테스트를 빨갛게 만들었는가"** 다.
- **R5** 종료 시 사본을 삭제하고 **삭제 결과를 출력에 보고**한다. 실패 경로·조기 종료 경로에서도 정리한다.
- **R6** G1~G4 판정 결과와 변이 내용·관측을 receipt에 남긴다. **이 기록이 없는 승격은 규칙 위반이며 산출물로 반증된다.**
- **R7** 승격 권한은 foreman 단독이다. **builder는 어떤 경우에도 작업 트리를 고의로 변형하지 않는다** — builder는 자기 slice만 보므로 G4를 판정할 수 없다. builder에게 금지되는 것은 *민감도 확인을 위한 일시적 변이*이며, Red phase의 실패 테스트 작성·반례 테스트·positive control 추가는 정상 작업이다.

### D3. 외부 사실의 미실측 표기 (`[미실측]`)
**계획은 관측하지 않은 외부 사실을 확정으로 적지 않는다.**

- **위치는 task `## 3. 구현 항목`이다. AC(`## 6`)에 적지 않는다** — AC는 봉인으로 잠기는 행동 계약이고 FAC↔AC·AC↔테스트 매핑의 입력이므로, 배선 세부가 바뀔 때마다 계약을 여는 것은 비용이 맞지 않는다. AC는 *행동*을, `## 3`는 *배선 사실*을 담는다.
- **대상**: 외부 엔드포인트 경로·호스트, 쿼리/바디 파라미터명, 응답 필드명, 필드 타입, nullable 여부, 페이지네이션 단위·방식, 인증 헤더 형식. 이 목록 밖으로 확장하지 않는다(전 AC에 붙으면 표기의 신호가 죽는다).
- **형식** (한 줄 line item — `## 3`의 번호 단계 아래 하위 불릿으로 둘 수 있다. **이후 참조 키는 단계 번호가 아니라 `<무엇>` 문자열이다** — 번호 단계에 종속시키면 단계가 재배치될 때 참조가 깨진다):
  `- [미실측] <무엇> — 잠정값: <값> / 출처: <URL 또는 문서> / 확인 방법: <어떻게 실측하는가> / 해소: 구현 1단계`
- **해소**: `/implement-workitem`이 분할·dispatch 전에 실측해, 그 line item의 `[미실측]`을 `[실측 YYYY-MM-DD]`로 바꾸고 잠정값을 관측값으로 교체한다. 관측 사실의 **기록은 D4 receipt(`fact-resolved`)로 남기며 그 시점은 D4가 정한다**(그 라운드의 파일 변경이 끝난 뒤 — 실측 직후가 아니다). **이것은 계획 변경이 아니라 계획이 예약해 둔 해소 절차의 집행이므로, 봉인을 다시 열지 않고 사용자에게 묻지 않는다.**
- **실측 주체**: foreman이 직접 수행한다(자기 `Bash`·연결된 MCP 도구). *웹 문서 조사*가 필요하면 researcher에 위임한다(ADR-040#amend-2). **문서 조사만으로는 실측이 아니다** — 실제 응답·스키마를 본 뒤에만 `[실측]`이 된다.
- **해소하지 못하면 멈춘다**: 그 사실이 구현에 필요한데 실측이 막히면(네트워크·자격증명·승인 차단) 추측으로 진행하지 않고 `Needs Fact Resolution: <무엇> — <막힌 사유>`로 그 부분을 미완으로 둔다(그 사실이 필요 없는 다른 AC 구현은 계속).
- **예외 — 사용자 보고로 돌리는 경우**: 실측 결과가 AC의 **행동·범위·보안 계약**을 바꾸면(예: 원천이 그 데이터를 제공하지 않아 AC가 성립 불가) 자동 해소하지 않고 기존 근본 충돌 경로대로 중단·보고한다.
- **ADR-060 D4와의 경계 (부분 정정)**: ADR-060 D4는 *"현재 M을 막는 사실 조사는 `deferred`가 아니라 봉인 전 `/research-pack`으로 종결한다"*고 규정한다. 본 D3은 그 규정을 **좁힌다** — `[미실측]`은 *결정*이 아니라 *아직 관측하지 않은 외부 배선 사실*이므로 결정 원장 등재 대상이 아니고 봉인을 막지 않는다. **단 그 사실이 계획 자체를 가르는 경우**(그 API의 존재 여부에 따라 feature 범위·AC 문안이 달라지는 경우)는 `[미실측]`으로 미루지 말고 ADR-060 D4대로 **봉인 전 `/research-pack`으로 종결**한다. 구분 기준은 하나다 — **해소 결과가 AC 문안을 바꾸면 봉인 전 종결 대상, `## 3` 배선만 바꾸면 `[미실측]` 대상.**

### D4. 공통 receipt 계약 (D1·D2·D3 공유)
- **위치**: task 문서 `## 8. 메모`. ADR-047 D7의 durable correction history 위치를 그대로 쓴다.
- **작성자**: `/implement-workitem` foreman **및** `/repair-workitem`(그 라운드가 외부 경계 코드를 수정했을 때 한정). builder·validator는 쓰지 않는다.
- **시점: 그 라운드의 파일 변경이 전부 끝난 뒤, `/validate-workitem` 실행 *이전*.**
  - *파일 변경 뒤*인 이유: 판정력 확인(D2)이 추가하는 테스트·헬퍼가 증거보다 뒤에 생기면 그 증거가 최종 코드를 덮지 못하고 `## 4-1` 회수에서도 빠진다.
  - *validate 이전*인 이유: validate가 report를 쓴 뒤에 `## 8`을 append하면 task 문서 mtime이 갱신되어 `/finalize-workitem`이 report를 stale로 판정하고 `Needs Validation`으로 종료한다 → 재validate → 재append의 무한 후퇴가 된다. 같은 계열의 교착이 host 제약 e2e 증거에서 이미 관측됐다(증거를 기록하는 커밋이 판정 대상 커밋을 한 칸 밀어내는 구조).
- **신선도는 자동 검사를 두지 않는다 — 고친 주체가 갱신하는 것이 유일한 유지 방식이다**(위 작성자 규정). 세 후보를 모두 기각했다: (i) **파일 digest 비교** — `/validate-workitem`이 계산할 도구를 갖지 않고, report-only 계약상 부여하지도 않는다. (ii) **커밋 동일성 비교** — 위 무한 후퇴의 직접 원인이다. (iii) **`## 8` 안의 줄 순서**(마지막 `repair-workitem` 줄이 마지막 `exec-evidence` 줄보다 뒤면 stale) — **정상 경로에서 오탐이 난다.** `/repair-workitem`은 증거를 갱신한 라운드에서도 그 뒤에 결정 이력 줄을 append하고, 코드를 안 고친 all-Reject 라운드나 외부 경계 밖 수정 라운드도 결정 이력 줄만 남긴다. 두 경우 모두 "갱신 누락"과 구분되지 않는다. 정상 상태에서 울리는 검사는 라벨 신뢰를 떨어뜨리므로(침묵 우선) 두지 않는다.
  - **한계(사실 기록)**: 그 결과 `/repair-workitem`이 외부 경계 코드를 고치고도 위 갱신 책임을 *조용히 건너뛰면* 아무 장치도 잡지 못한다 — `- exec-evidence` 줄은 implement가 남긴 것이 그대로 있어 `[Exec-evidence-missing]`이 발화하지 않는다. 현재 방어는 repair의 명시 책임과 그 마지막 출력의 `실행 증거 갱신` 줄(사용자 가시성)뿐이다. **이 구멍을 검사로 막으려면 receipt를 순서·날짜가 아니라 라운드 식별자를 갖는 구조화 스키마로 바꿔야 하며, 그 전에 위 세 후보를 다시 꺼내면 오탐이 그대로 돌아온다.**
- **형식** (해당하는 것만 1줄씩 append):
  ```
  - exec-evidence <날짜> <경계 종류 a|b|c>: <등급 1 재실행 가능 | 등급 2 1회성 — 형태> — <무엇에 대고 실행했는가> / 결과: <관측 1줄>
  - verify-power <날짜> <AC-N>: red=<observed|opt-out(사유)|characterization(사유)|unrecoverable(사유)> / vc=<VC-N 목록 또는 없음> / mutation=<미승격(G# 미충족) | 승격(변이·관측·사본 삭제 결과)>
  - fact-resolved <날짜> <무엇>: <잠정값> → <관측값> / 관측 방법: <1줄>
  ```
- **판독 규칙 (D1·D2·D3·D4 공통 — 지키지 않으면 검사가 전부 무너진다)**: 위 receipt 세 줄, D1의 `- 외부 경계:` 표시, D2의 `- VC-N` 행, D3의 `[미실측]` 표기는 **HTML 주석(`<!-- ... -->`) 밖의 줄만** 실제 항목으로 센다. TASK_TEMPLATE의 각 섹션 주석에는 *같은 형식의 예시*가 들어 있어, 주석까지 세면 (i) `- 외부 경계:`·`[미실측]`이 모든 task에서 검출돼 순수 로직 task까지 오탐이 나고, (ii) `- exec-evidence` 줄이 항상 존재하는 것으로 보여 **`[Exec-evidence-missing]`이 영원히 발화하지 않는다**(오탐보다 나쁜 조용한 사망). 원장 조회의 *"설명 섹션의 형식 예시는 항목이 아니다"* 규칙과 동형이다.

### D5. 픽스처 provenance + 마스킹
- 새로 만들거나 갱신하는 픽스처·스텁 데이터에는 출처를 표기한다: **`docs-verified`**(공식 문서로 확인) / **`live-observed`**(실제 응답을 관측) / **`synthetic`**(사람이 지어냄) + 출처 + 관측일.
- **`live-observed`는 저장 전 마스킹이 의무다.** 개인정보·자격증명·토큰·내부 식별자를 제거하거나 대체한다. 마스킹이 확실하지 않으면 **저장하지 않고** receipt에 구조 요약만 남긴다.
- 마스킹은 사후 방어이므로 **호출 전 최소 수집**을 함께 적용한다(D1 안전 규정) — 필요한 최소 필드만 요청하고, 민감 데이터가 올 수 있는 엔드포인트는 사용자 승인 후에만 호출한다.
- 이 표기는 픽스처 파일 상단 주석 또는 그 옆의 README 한 줄 등 프로젝트에 자연스러운 위치에 둔다. 새 파일 형식을 강제하지 않는다.

### D6. 마일스톤 E2E와의 관계
**게이트 판정은 서로 대체하지 않는다.** 졸업 E2E `PASS`가 D1을 충족시키지 않고, D1 증거가 E2E 졸업 게이트를 대체하지 않는다. 두 장치는 대상이 다르다 — 졸업 E2E는 *마일스톤 단위로 앱이 기동·동작하는가*를, D1은 *이 task가 바꾼 외부 경계가 실제로 동작하는가*를 본다. 졸업 E2E의 `PASS` 조건은 "선언된 e2e 디렉터리 하위에서 실행된 테스트 1개 이상 성공"이므로 기동만 확인하는 boot smoke 하나로도 충족될 수 있고, 그 경우 커넥터·DB write 경로는 한 줄도 밟지 않는다.

**단 *실행*은 재사용할 수 있다.** 어떤 e2e 실행이 이 task의 해당 경계를 실제로 밟았다면 그 실행을 D1의 증거로 인용해 receipt에 적을 수 있다(무엇이 그 경계를 밟았는지 1줄로 명시). 금지되는 것은 *게이트 통과 사실의 상호 인용*이지 *실행 사실의 재사용*이 아니다.

### D7. 등급 배치 (ADR-063 D6 2문항 적용)
저장소 규칙은 *"검사가 문자열만 보면 기록 등급 상한(차단 금지)"*이다. 본 계약은 그 규칙을 **우회하거나 예외를 요청하지 않고 따른다.**

- **차단은 `/implement-workitem`이 한다** — 증거를 확보하지 못하면 `Needs Execution Evidence`, 필요한 외부 사실을 실측하지 못하면 `Needs Fact Resolution`으로 **task를 완료하지 않는다.** 이것은 새 기계적 검사가 아니라 실행자가 날조를 거부하고 멈추는 것이며, 기존 `Needs Install`·`Needs Research`·`Needs MCP Access`·`Needs Dependency Tool Decision` 선례와 동형이라 D6의 판정 대상이 아니다.
- **구조적 차단이 필요하면 증거를 등급 1(재실행 가능)로 만든다** — 그 테스트가 통합 `validate`에 묶이면 기존 exit code 게이트가 차단하며, 그 판정은 실제 실행이므로 2문항을 모두 통과한다. 이것이 본 계약이 등급 1을 권장 등급으로 두는 이유다.
- **`/validate-workitem`의 receipt 판정은 기록 등급(P1)이다** — validate는 `## 8`의 문자열을 읽을 뿐이라 1문항을 통과하지 못한다. 같은 구조인 ADR-063 D4(d)(`probe smoke:` 문자열 읽기)도 기록 등급이며 그 선례를 따른다. **receipt 부재를 P0 Needs Fix로 걸지 않는다.**
- 결과적으로 방어선은 셋이다 — implement의 정지(실질 차단) / 등급 1 증거의 `validate` exit code(구조적 차단) / validate의 P1 기록(가시성). 어느 하나도 문자열 검사에 차단력을 부여하지 않는다.

## 근거
- 실행 오라클을 *task 층*에 두는 이유: 마일스톤 졸업 E2E는 (i) 적용 조건이 UI 신호에 묶여 있어 headless 스택에서 기본 비활성이고, (ii) 발견 시점이 20개 task 뒤라 수정 범위가 넓어지며, (iii) 통과 조건이 실행된 테스트 1개라 boot smoke로 충족될 수 있다. 세 이유 모두 관측으로 확인됐다.
- 차단을 implement에 두고 validate를 기록 등급에 두는 이유: 판정 주체가 실행 능력을 갖지 않는 한 그 판정은 문자열 검사이며, 문자열 검사에 차단력을 주면 ADR-063이 세운 배치 기준이 첫 예외로 무너진다. 실행 능력을 validate에 부여하는 대안은 report-only 계약을 깨뜨려 더 비싸다.
- 자동 신선도 검사를 두지 않는 이유: 세 후보가 모두 정상 경로를 깬다 — digest는 판정자가 해시 도구를 갖지 않아 산문 단정으로 귀결되고, 커밋 동일성은 증거를 기록하는 커밋이 판정 대상을 한 칸 밀어내며, `## 8` 줄 순서는 증거를 제대로 갱신한 repair 라운드와 갱신이 필요 없던 라운드를 "누락"과 구분하지 못한다. "고친 주체가 갱신한다"가 같은 목적을 오탐 없이 달성한다.
- `VC-N`을 positive control로 한정하는 이유: 반례 테스트는 대개 AC 본연의 행동이라 `VC-N`으로 빼면 실제 커버리지가 집계에서 사라져 신뢰도 등급이 부풀려진다.
- 경계 *종류별* 증거를 요구하는 이유: 증거 1건만 요구하면 네트워크+DB write+진입점을 함께 건드린 task가 `--help` 실행 한 번으로 통과해, 본 ADR이 근거로 삼은 첫 P0(DB write 타입 불일치)가 그대로 샌다.

## Mutation Contract (ADR-047 D3)
1. **Target** — TASK_TEMPLATE `## 2`·`## 3`·`## 6-1`·`## 8` 주석 / plan-workitem 신설 3-U / implement-workitem 신설 3-U·6-V·6-E·6-R + `--waiver` 플래그 / builder 규칙·출력 계약 / validator 축 7 판정 규칙 / repair-workitem receipt 갱신 책임 / validate-workitem 감사 축 7 설명·AC↔테스트 매핑 기준·검증 기준·report 양식 / ADR-060 D4 경계 note / STRUCTURE Canonical Owner 표.
2. **Failure mode** — (a) 외부 경계를 한 번도 실행하지 않은 채 전 검증 계층을 통과 (b) 아무것도 보고 있지 않은 테스트가 커버로 오독됨 (c) 미관측 외부 사실이 확정으로 박혀 구현 중 반복 중단 (d) 손으로 지어낸 픽스처가 현실과 갈라져 (a)·(b)를 동시에 유발.
3. **Predicted improvement** — 외부 경계 task의 `## 8`에 경계 종류별 exec-evidence 줄이 실측 결과로 채워짐 / 그중 등급 1 비율이 라운드마다 관측 가능 / Red 관측이 반증 가능한 기록으로 남음 / 마일스톤당 `[미실측]` 해소가 사용자 질의 없이 처리됨 / 픽스처에 provenance 표기가 붙음.
4. **Preserved invariants** — `/validate-workitem`의 **report-only 계약**(코드 미수정 · `allowed-tools`에 범용 Bash·해시 도구 미추가) / `/stabilize-milestone` read-only 계약 / 졸업 게이트 5+1 무증설 / validate 감사 축 무증설(축 7 내부에서 처리) / ADR-009 RGR 3 phase 및 정당한 TDD opt-out / `## 4-1` 단일 writer / 결정 원장 등재 범위(ADR-060 D1 — `[미실측]`은 등재 대상 아님) / 민감 파일 접근 금지 정책 / **ADR-063 D6 배치 기준 무예외**(본 계약은 예외를 요청하지 않고 차단 지점을 옮겨 규칙을 만족시킨다).
5. **Falsifying evaluation** — ADR-017 dogfood 재실행에서 (a) 외부 경계가 없는 순수 로직 task가 `Needs Execution Evidence`로 오차단되거나, (b) 모노레포 내부 서비스 호출이 (b) 경계로 오판정돼 백엔드 없는 프론트 마일스톤이 막히거나, (c) `[미실측]` 표기가 AC 절반 이상에 붙어 신호가 죽거나, (d) receipt 기록이 report를 stale로 만들어 finalize가 막히거나, (e) 정당한 TDD opt-out task가 `verify-power` 때문에 막히거나, (f) `validate(Needs Fix) → repair → 재validate` 가 증거 갱신 주체 부재로 루프에 빠지면 해당 결정을 재조정한다. **추가 관측 항목**: repair가 외부 경계 코드를 고치고도 증거를 갱신하지 않은 사례(D4 한계)가 2회 이상 누적되면 receipt를 라운드 식별자 기반 구조화 스키마로 승격한다.
6. **Rollback path** — 본 ADR superseded + D1 증거 요구를 Evidence Bundle 선언 방식으로 복귀 + `VC-N`·`[미실측]`·`- 외부 경계:` 표기 제거 + TASK_TEMPLATE 주석 원복 + repair-workitem receipt 책임 철회.

## 정책 강도 (ADR-022)
- **제약(강) — [관측됨]**: D1의 *증거 미확보 시 implement 정지*, D2의 *Red 관측 기록*, D1 안전 규정(운영 환경·파괴적 호출·민감 엔드포인트). 셋 다 관측된 실패 또는 비가역 위험에 근거한다.
- **제약(약)**: D2의 격리 변이 4 게이트·7 규율, D4 receipt 형식·작성자·시점, D5 마스킹·최소 수집.
- **enabling(약)**: D1 등급 1 권장, D3 `[미실측]`, D6 관계 명시, D7 배치 근거. **`/validate-workitem`·`validator` 층의 모든 판정은 기록 등급(P1)이며 새 P0를 신설하지 않는다** — 강도 표와 판정 등급이 어긋나지 않도록 이 문장을 계약의 일부로 둔다.

## 결과
- 외부 경계 task가 "가짜 데이터 안에서만 통과"한 채 완료되는 경로가 막힌다 — 실행자가 멈추기 때문이지, 문자열 검사가 막기 때문이 아니다.
- 증거를 재실행 가능한 형태로 남기면 기존 `validate` 게이트가 그대로 회귀를 막는다.
- 판정력 없는 테스트가 커버로 읽히는 경로가 반증 가능한 기록으로 바뀐다.
- 미관측 외부 사실이 확정 대신 예약된 해소 절차로 처리되어, 구현 중 사용자 질의가 줄어든다.
- 검증 실행 권한은 여전히 implement/repair에만 있고 validate는 기록을 읽는 report-only로 남는다.

## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT)
- docs/30-workitems/_templates/TASK_TEMPLATE.md      — D1 `## 2` 외부 경계 표시 / D3 `## 3` 표기 / D2 `## 6-1` VC-N / D4 `## 8` receipt 형식
- .claude/skills/plan-workitem/SKILL.md              — D1 외부 경계 표시 + D3 `[미실측]` authoring
- .claude/skills/implement-workitem/SKILL.md         — D3 해소 / D2 판정력 / D1 실행 증거 / D4 receipt 작성자·시점 / `--waiver`
- .claude/agents/builder.md                          — D2 변이 금지 범위·Red 관측 반환 / D5 픽스처 provenance
- .claude/skills/repair-workitem/SKILL.md            — D4 외부 경계 수정 시 receipt 갱신 책임
- .claude/skills/validate-workitem/SKILL.md          — D1·D2·D3 기록 등급 판정 (P1, 차단 없음)
- .claude/agents/validator.md                        — 축 7 partial verdict의 동일 판정 규칙
- docs/90-decisions/boilerplate/ADR-060-decision-closure-and-milestone-seal.md — D3의 D4 경계 부분 정정 note
- docs/00-meta/STRUCTURE.md                          — Canonical Owner 표

## 참고
- ADR-006#amend-1(diff trace audit — `VC-N` 추적 근거 확장), ADR-009(RGR — Red 종료 조건의 기록화 + opt-out 존중), ADR-014#amend-4 / ADR-052#amend-1(졸업 e2e — D6), ADR-022(Ratchet — 강도), ADR-040#amend-2(researcher 위임 — D3 실측 주체), ADR-047 D7(durable correction history — receipt 위치) · D8(Oracle Adequacy), ADR-060 D4(봉인 전 사실 조사 종결 — D3이 부분 정정), ADR-063 D1(probe 원리) · D4(d)(문자열 기록의 등급 선례) · D6(기계적 검사 배치 2문항).
````

## 1-2. `docs/90-decisions/boilerplate/README.md` — 인덱스 행 추가

`| 063 | 검증 장치의 실측 검증과 유지 주기 ... |` 줄 **바로 아래**에 다음 한 줄을 추가한다.

```
| 064 | task 층 증거 계약 (Task-Layer Evidence Contract) | accepted | — | 외부 경계 실행 증거(implement 정지로 차단, validate는 기록 등급) + Red 관측·VC-N 판정력 + `[미실측]` 외부 사실 해소 + 공통 receipt(`## 8`, writer=implement·repair, validate 이전) |
```

## 1-3. `docs/90-decisions/boilerplate/ADR-060-decision-closure-and-milestone-seal.md` — D4 경계 note

`### D4. 유예(deferred) 앵커 규약` 블록의 마지막 문장 뒤에 인용 블록 한 줄을 추가한다.

**Before**
```
현재 M을 막는 사실 조사는 `deferred`가 아니라 **봉인 전 `/research-pack`**으로 종결한다. 연구 자체가 마일스톤 산출물이면 별도 선행 마일스톤으로 분리한다.
```

**After**
```
현재 M을 막는 사실 조사는 `deferred`가 아니라 **봉인 전 `/research-pack`**으로 종결한다. 연구 자체가 마일스톤 산출물이면 별도 선행 마일스톤으로 분리한다.
> 부분 정정 (ADR-064 D3): 위 규정의 대상은 *계획을 가르는* 사실 조사다. 해소 결과가 AC 문안을 바꾸지 않고 `## 3` 배선 세부(엔드포인트·파라미터명·필드 타입 등)만 바꾸는 외부 사실은 봉인 전 종결 대상이 아니며, task `## 3`의 `[미실측]` 표기로 두고 구현 1단계에서 해소한다. 구분 기준은 *"해소 결과가 AC 문안을 바꾸는가"* 하나다.
```

## Stage 1 확인

```
ls docs/90-decisions/boilerplate/ADR-064-task-layer-evidence-contract.md
grep -n "^| 064 " docs/90-decisions/boilerplate/README.md
grep -n "ADR-064" docs/90-decisions/boilerplate/ADR-060-decision-closure-and-milestone-seal.md
grep -n "^> area:" docs/90-decisions/boilerplate/ADR-064-task-layer-evidence-contract.md
```
→ 마지막 명령은 `> area: tooling` 이어야 한다. 허용값은 `product | design | dev | infra | process | tooling` 뿐이며 그 밖의 값은 형식 위반이다.

## Stage 1 커밋

```
feat(adr): add ADR-064 task-layer evidence contract
```

---

# Stage 2 — 계획 층 (TASK_TEMPLATE · plan-workitem)

Stage 1 완료 후 진행한다. 구현 층(Stage 3)이 해소할 대상을 먼저 존재하게 만든다.

## 2-1. `docs/30-workitems/_templates/TASK_TEMPLATE.md` — `## 2` 주석 신설

**Before**
```
## 2. 작업 범위
```

**After**
```
## 2. 작업 범위
<!-- 이 task가 외부 경계를 건드리면 plan-workitem이 범위 끝에 다음 한 줄을 박는다 (ADR-064 D1).
     종류는 (a) 영속 저장소 쓰기 / (b) 외부(서드파티·타 시스템) 네트워크 호출 / (c) 실행 진입점 세 가지이고, **해당하는 것만 골라 적는다** — "(a)/(b)/(c) 중 해당" 처럼 뭉뚱그리면 구현·검증이 어느 경계에 증거가 필요한지 알 수 없다.
     예: `- 외부 경계: (a) 영속 저장소 쓰기, (c) 실행 진입점 — 구현 시 경계 종류마다 실행 증거 필요`
     같은 저장소·같은 배포 단위 안의 서비스 간 호출은 (b)가 아니다. 셋 다 해당 없으면 이 줄을 적지 않는다. -->
```

## 2-2. `docs/30-workitems/_templates/TASK_TEMPLATE.md` — `## 3` 주석

주석 블록의 마지막 문장 뒤, 닫는 `-->` **앞**에 추가한다.

**Before**
```
     단계가 feature ## 7-2의 invariant를 집행하면 끝에 (INV-N) 태그를 붙일 수 있다 (ADR-057). -->
```

**After**
```
     단계가 feature ## 7-2의 invariant를 집행하면 끝에 (INV-N) 태그를 붙일 수 있다 (ADR-057).
     외부 계약 사실(엔드포인트·파라미터명·응답 필드명/타입/nullable·페이지네이션·인증 헤더 형식)을 아직 실측하지 않았으면 확정으로 적지 말고 다음 형식으로 박는다 (ADR-064 D3):
       `- [미실측] <무엇> — 잠정값: <값> / 출처: <URL 또는 문서> / 확인 방법: <어떻게 실측> / 해소: 구현 1단계`
     번호 단계 아래 하위 불릿으로 둘 수 있고, 이후 참조 키는 단계 번호가 아니라 `<무엇>` 문자열이다(단계 재배치에 깨지지 않게). implement가 실측 후 `[실측 YYYY-MM-DD]`로 바꾸고 관측값으로 교체한다. AC(## 6)에는 이 표기를 쓰지 않는다 — AC는 행동을, ## 3는 배선 사실을 담는다. -->
```

## 2-3. `docs/30-workitems/_templates/TASK_TEMPLATE.md` — `## 6-1` 주석

**Before**
```
       **angle-bracket placeholder(`<runner>` 등)만 남기는 것 금지** — 안 채울 거면 자연어 양식으로 작성. 잔존 placeholder는 validator가 *미설정*으로 간주하고 자연어 매칭 fallback하지만, report에 P2 라벨로 기록. -->
```

**After**
```
       **angle-bracket placeholder(`<runner>` 등)만 남기는 것 금지** — 안 채울 거면 자연어 양식으로 작성. 잔존 placeholder는 validator가 *미설정*으로 간주하고 자연어 매칭 fallback하지만, report에 P2 라벨로 기록.
     검증 판정력 확인용 테스트 중 **AC 행동으로 귀속되지 않는 것**(대표적으로 positive control — 검사 헬퍼 자체가 살아 있는지 확인하는 테스트)은 `- VC-N → <file> > <test-name>` 형식으로 등재한다 (ADR-064 D2). 반례 테스트("잘못된 입력을 거부한다")는 대개 AC 본연의 행동이므로 VC-N이 아니라 `AC-N`으로 매핑한다.
     VC-N 행의 writer는 implement foreman 단독이며, **`## AC ↔ 테스트 매핑` 커버리지 % 집계에는 포함하지 않는다**(그 %가 신뢰도 등급 입력이라 섞이면 등급이 이동한다). 등재 목적은 그 테스트 줄이 diff trace audit에서 `AC-N | 명시 요청 | VC-N`으로 역추적되게 하는 것이다. -->
```

## 2-4. `docs/30-workitems/_templates/TASK_TEMPLATE.md` — `## 8` 주석

**Before**
```
<!-- task scope /repair-plan이 본 라운드의 P0/P1 결정을 1줄씩 append하는 영속 위치 (ADR-047 D7 durable correction history + D1 inspectability). feature/milestone scope는 IMPROVEMENT_GUIDE.md `## 5. Repair decision log`로 라우트. 그 외 메모도 자유. -->
```

**After**
```
<!-- task scope /repair-plan이 본 라운드의 P0/P1 결정을 1줄씩 append하는 영속 위치 (ADR-047 D7 durable correction history + D1 inspectability). feature/milestone scope는 IMPROVEMENT_GUIDE.md `## 5. Repair decision log`로 라우트. 그 외 메모도 자유.
     증거 receipt 위치이기도 하다 (ADR-064 D4 — writer: implement foreman 및 repair-workitem(외부 경계 코드를 고친 경우). 시점: 그 라운드의 파일 변경이 전부 끝난 뒤 · /validate-workitem 실행 *이전*. validate 이후 append하면 task 문서 mtime이 갱신돼 finalize가 report를 stale로 보고 Needs Validation 교착이 된다):
       `- exec-evidence <날짜> <경계 a|b|c>: <등급 1 재실행 가능 | 등급 2 1회성 — 형태> — <무엇에 대고 실행했는가> / 결과: <관측 1줄>`
       `- verify-power <날짜> <AC-N>: red=<observed|opt-out(사유)|characterization(사유)|unrecoverable(사유)> / vc=<VC-N 목록 또는 없음> / mutation=<미승격(G# 미충족) | 승격(변이·관측·사본 삭제 결과)>`
       `- fact-resolved <날짜> <무엇>: <잠정값> → <관측값> / 관측 방법: <1줄>` -->
```

## 2-5. `.claude/skills/plan-workitem/SKILL.md` — 신설 단계 3-U

`3-P. **승인 프로토타입 참조 + PX↔AC 매핑 + 전환 흐름 authoring ...**` 블록이 끝나고 `4. 관련 문서 링크를 함께 기록한다.` 가 시작되기 **직전**에 아래 블록을 삽입한다.

```
3-U. **외부 경계 표시 + 미실측 외부 사실 authoring (ADR-064 D1/D3)**:
   - **외부 경계 표시**: 분해된 task의 `## 3`가 (a) 영속 저장소 쓰기(DB write·마이그레이션·파일/오브젝트 스토리지·캐시/큐 적재), (b) **외부(서드파티·타 시스템)** 네트워크 호출, (c) 실행 진입점(CLI 명령·배치 잡·스케줄러·워커) 중 하나라도 건드리면 그 task `## 2. 작업 범위` 끝에 `- 외부 경계: <해당 종류만 나열> — 구현 시 경계 종류마다 실행 증거 필요` 한 줄을 박는다 (형식 SSOT: ADR-064 D1 — 정책 참조를 그 줄 안에 적지 않는다). **해당하는 종류만 골라 적는다** — 예 `- 외부 경계: (a) 영속 저장소 쓰기, (c) 실행 진입점 — …`. "(a)/(b)/(c) 중 해당"처럼 뭉뚱그리면 구현·검증이 어느 경계에 증거가 필요한지 알 수 없어 마커가 무용해진다. 종류 이름 뒤에 괄호 예시(`CLI 명령` 등)를 덧붙이지 않는다 — 아래 task type prefilter 키워드와 우연히 겹친다. **같은 저장소·같은 배포 단위 안의 서비스 간 호출은 (b)가 아니다**(모노레포에서 자기 API 서버를 부르는 프론트 task로 게이트가 오발동하지 않게 한다). 셋 다 해당 없으면 적지 않는다.
   - **미실측 외부 사실**: 그 task가 외부 계약 사실(엔드포인트 경로·호스트 / 쿼리·바디 파라미터명 / 응답 필드명 / 필드 타입 / nullable 여부 / 페이지네이션 단위·방식 / 인증 헤더 형식)을 지정하는데 **plan 시점에 실측할 수단이 없으면**(웹 접근 없음 — ADR-040) 확정으로 적지 말고 `## 3`에 다음 형식으로 박는다: `- [미실측] <무엇> — 잠정값: <값> / 출처: <URL 또는 문서> / 확인 방법: <어떻게 실측> / 해소: 구현 1단계`. 이 표기는 **`## 3` 전용**이며 AC(`## 6`)에는 쓰지 않는다 — AC는 행동을, `## 3`는 배선 사실을 담는다. 참조 키는 단계 번호가 아니라 `<무엇>` 문자열이다.
   - **원장 대상이 아니다**: `[미실측]`은 *결정*이 아니라 *아직 관측하지 않은 사실*이므로 `DECISION_REGISTER.md`에 등재하지 않고 봉인도 막지 않는다. **단 그 사실이 계획 자체를 가르면**(그 API 존재 여부에 따라 feature 범위·AC 문안이 달라짐) `[미실측]`으로 미루지 말고 ADR-060 D4대로 **봉인 전 `/research-pack` 선행**으로 종결한다. 구분 기준: *해소 결과가 AC 문안을 바꾸면 봉인 전 종결, `## 3` 배선만 바꾸면 `[미실측]`*.
   - 대상 목록 밖으로 표기를 확장하지 않는다 — 전 AC에 붙으면 표기의 신호가 죽는다.
```

## Stage 2 확인

```
grep -c "ADR-064" docs/30-workitems/_templates/TASK_TEMPLATE.md
grep -c "ADR-064" .claude/skills/plan-workitem/SKILL.md
```
→ TASK_TEMPLATE 4건, plan-workitem 2건 (`grep -c`는 *줄 수*를 센다 — 한 줄에 두 번 나와도 1이다).

## Stage 2 커밋

```
feat(plan): author execution-boundary marks and unmeasured external facts
```

---

# Stage 3 — 실행 층 (implement-workitem · builder · repair-workitem)

Stage 2 완료 후 진행한다. **단계 순서(6-V → 6-E → `## 4-1` → 6-R)를 반드시 지킨다** — 순서가 바뀌면 증거가 최종 코드를 덮지 못하거나 finalize가 교착한다.

## 3-1. `.claude/skills/implement-workitem/SKILL.md` — frontmatter

**Before**
```
argument-hint: "[task identifier] [--fast]"
```

**After**
```
argument-hint: "[task identifier] [--fast] [--waiver \"<why>\"]"
```

## 3-2. `.claude/skills/implement-workitem/SKILL.md` — 입력에 `--waiver` 추가

아래 한 줄을 `--fast` 줄 **앞**에 삽입한다(기존 `--fast` 줄은 그대로 둔다).

**Before**
```
- `--fast` 플래그가 있으면
```

**After**
```
- `--waiver "<사유>"` 플래그는 **사용자만** 넘긴다 — 실행 증거(ADR-064 D1)를 확보할 수 없는 환경에서 사용자가 그 사실을 알고 진행을 승인하는 경로다. foreman은 이 플래그를 스스로 만들지 않고 사유도 발명하지 않으며(`/finalize-workitem`의 `--rationale`과 동일 근거), 값이 있으면 그 문자열을 그대로 receipt에 인용한다.
- `--fast` 플래그가 있으면
```

## 3-3. `.claude/skills/implement-workitem/SKILL.md` — 신설 단계 3-U

`3-G. **착수 게이트 — \`ready → in-progress\` ...**` 블록이 끝나고 `4. **분할 (partition) ...**` 이 시작되기 **직전**에 삽입한다.

```
3-U. **미실측 외부 사실 해소 (ADR-064 D3 — 분할·dispatch 전에 1회)**: task `## 3`에 `[미실측]` line item이 있으면 각 항목의 *확인 방법*대로 실측해 확정한다. **표기를 찾을 때는 HTML 주석(`<!-- -->`) 밖의 줄만 본다** — TASK_TEMPLATE `## 3` 주석에 같은 형식의 예시가 있어 주석까지 세면 모든 task에 미실측 항목이 있는 것으로 보인다(D4 판독 규칙). **실측 주체는 foreman이다** — 자기 `Bash`·연결된 MCP 도구로 직접 관측하고, *웹 문서 조사*가 필요하면 researcher에 위임한다(ADR-040#amend-2). **문서 조사만으로는 실측이 아니다** — 실제 응답·스키마를 본 뒤에만 `[실측]`이 된다. 실측 수단·안전 규정은 아래 6-E와 같다(자사 운영 환경 접속 금지 / 파괴적 호출 자동 실행 금지 / 민감·유료·rate-limited 엔드포인트는 사용자 승인 후 / raw 응답 전문 미출력).
   실측 후 (i) 그 line item의 `[미실측]`을 `[실측 <오늘 날짜>]`로 바꾸고 잠정값을 관측값으로 교체하고, (ii) 결과를 6-R에서 `## 8`에 기록한다. **이것은 계획 변경이 아니라 계획이 예약해 둔 해소 절차의 집행이므로 봉인을 다시 열지 않고 사용자에게 묻지 않는다.**
   - 실측 결과가 AC의 **행동·범위·보안 계약**을 바꾸면(예: 원천이 그 데이터를 제공하지 않아 AC가 성립 불가) 자동 해소하지 않고 3-R의 근본 충돌 경로대로 **중단·사용자 보고**한다. **본 단계는 3-G가 이미 `ready → in-progress`를 쓴 뒤이므로 상태를 되돌리지 않고 `in-progress`를 유지한 채** 중단한다(다음 호출을 재개 진입으로 받는다).
   - 실측이 막히면(네트워크·자격증명·승인 차단) 추측으로 진행하지 않고 `Needs Fact Resolution: <무엇> — <막힌 사유>`를 출력하고 **그 사실이 필요한 부분을 미완으로 둔다**(그 사실이 필요 없는 다른 AC 구현은 계속).
```

## 3-4. `.claude/skills/implement-workitem/SKILL.md` — 신설 6-V · 6-E

`**메인 foreman 은 모든 builder 의 변경 파일 목록을 합쳐 ...**` 문단이 시작되기 **직전**에 아래 두 블록을 이 순서로 삽입한다.

```
6-V. **검증 판정력 확인 (ADR-064 D2 — 메인 foreman이 1회. `## 4-1` 갱신보다 *먼저* 수행한다 — 여기서 테스트가 추가되기 때문)**: 각 AC에 대해 그 테스트가 실제로 무언가를 보고 있는지 확인하고 기록한다. **코드를 변형하지 않는 3수단이 기본**이며 이 순서로 적용한다 — ① builder가 보고한 **Red 관측**(어떤 테스트가 구현 전에 어떤 이유로 실패했는지). 구현 전에 통과했다면 그 테스트는 판정력이 없으므로 테스트를 먼저 고친다. ② **반례 테스트** — 거부·차단돼야 할 입력을 넣고 실제로 거부되는지 단정(**이것은 대개 AC 본연의 행동이므로 `AC-N`으로 매핑한다** — VC로 빼지 않는다). ③ **positive control** — 검사 헬퍼·수집기 자체가 살아 있는지 확인(예: "로그가 없어야 한다"를 단정하기 전에 일부러 로그를 하나 심어 헬퍼가 잡는지). **부재를 단정하는 AC는 ①만으로 판정력이 증명되지 않으므로 ③이 필수다.**
   - **Red 관측의 허용 상태는 넷이다** — `observed`(정상) / `opt-out(<사유>)`(task `## 6-2. TDD opt-out`이 정당하게 채워졌거나 `Type: research-spike` — Red가 존재할 수 없으므로 결함이 아니다) / `characterization(<사유>)`(`Type: refactor` 등 기존 동작 고정 테스트가 구현 전에도 통과) / `unrecoverable(<사유>)`(세션 중단 후 재개라 원래 Red를 재현할 수 없음 — 이때는 ②·③으로 판정력을 대체 확인하고 그 결과를 함께 적는다).
   - ③으로 추가한, **AC 행동으로 귀속되지 않는** 테스트만 `## 6-1`에 `- VC-N → <file> > <test-name>` 으로 등재한다(이 행의 writer는 foreman 단독). **`## AC ↔ 테스트 매핑` 커버리지 % 집계 대상이 아니다.**
   - **격리 변이 승격**: 3수단으로 판정력이 확인되지 않을 때만, 아래 **4 게이트를 전부 충족하면** 격리된 작업 사본에서 코드를 일시 변형해 민감도를 측정할 수 있다 — **G1** 그 AC가 막는 실패가 데이터 손상·유실 / 보안·권한 경계 / 비가역 외부 부작용 중 하나다(표시·성능·편의는 대상 아님), **G2** 의심이 특정 단정으로 좁혀지지 않아 반례·positive control을 설계할 수 없다(좁혀지면 승격하지 않는다), **G3** 관측 신호가 있다(구현 전에도 통과했던 테스트 / 같은 파일에서 확인된 공허한 단정 / 실행되지 않는 분기 / 과거 유출 이력 중 1개 이상), **G4** 별도 작업 사본에서 그 테스트를 독립 실행할 수 있다(공유 DB·고정 포트·외부 자원에 묶여 사본에서 못 돌리면 **승격 금지**). **하나라도 미달이면 승격하지 않고 그 사실을 receipt에 남긴다(재량 0).**
   - 승격 시 규율(전부 의무): **R1** 별도 worktree·사본에서만, **현재 작업 트리 변형은 예외 없이 금지** / **R2** 한 번에 변이 1개 / **R3** 변이가 실제로 코드에 적용됐는지 **먼저 확인**(미적용 상태의 초록불을 커버 증거로 읽지 않는다) / **R4** 판정 단위는 전체 종료코드가 아니라 "그 변이가 어느 테스트를 빨갛게 만들었는가" / **R5** 종료 시 사본 삭제 + 삭제 결과 보고(실패·조기 종료 경로 포함) / **R6** G1~G4 판정 결과를 receipt에 기록 / **R7** 승격 권한은 foreman 단독 — **builder에게 위임하지 않는다**.

6-E. **실행 증거 (ADR-064 D1 — 6-V 뒤, `## 4-1` 갱신 앞)**: task `## 2`에 `- 외부 경계:` 표시가 있거나(plan authoring — **HTML 주석 밖의 줄만 표시로 센다**. 템플릿 주석에 같은 형식의 예시가 있다. D4 판독 규칙), 표시가 없더라도 합쳐진 변경이 (a) 영속 저장소 쓰기 · (b) **외부(서드파티·타 시스템)** 네트워크 호출 · (c) 실행 진입점 중 하나를 건드렸으면 **해당하는 경계 *종류마다* 각각 1건 이상의 실행 증거를 확보한다.** 한 종류의 증거가 다른 종류를 대신하지 못한다(응답 재생은 DB 스키마 write를 증명하지 않고, 진입점 기동은 요청 URL·인증 형식을 증명하지 않는다). **같은 저장소·같은 배포 단위 안의 서비스 간 호출은 (b)가 아니다.**
   - **등급 1(권장 — 재실행 가능)**: 일회용 실자원(테스트 전용 DB·로컬 컨테이너·에뮬레이터)에 대고 도는 테스트를 만들어 **통합 `validate` 명령에 묶는다.** 회귀 차단을 기존 exit code 게이트가 맡게 되어 증거가 1회성으로 증발하지 않는다. 가능하면 항상 이쪽을 택한다. **이미 있는 e2e가 그 경계를 실제로 밟는다면 새로 만들지 말고 그 실행을 등급 1 증거로 인용한다**(무엇이 그 경계를 밟았는지 receipt에 1줄 — D6).
   - **등급 2(차선 — 1회성 관측)**: 등급 1이 불가능할 때만(유료·rate-limited API / 자격증명 필요 / 수동 환경 / dry-run만 제공). 형태는 ① 일회용 실자원 수동 1회 실행 ② 읽기 전용 실 호출 1회 관측 ③ 마스킹된 실 응답 재생 ④ dry-run ⑤ 사용자 waiver(`--waiver`).
   - **안전 규정(전부 강제)**: 자사 운영 환경(project-owned production)에 접속하지 않는다 — 서드파티 공개 엔드포인트는 *읽기 전용*에 한해 허용한다. 파괴적 호출(외부 상태를 바꾸는 write·삭제·결제·발송)을 자동 실행하지 않는다(등급 1 또는 dry-run으로 대체). **개인정보가 반환될 수 있거나 유료이거나 rate limit이 있는 엔드포인트는 사용자 승인 후에만 호출하고, 호출 전에 필요한 최소 필드만 받도록 요청을 좁힌다.** raw 응답 전문을 출력·로그·receipt에 싣지 않는다(구조 확인에 필요한 최소 발췌만, 그 발췌도 마스킹). 출처 URL의 민감한 쿼리 문자열은 가린다. `.env`·자격증명 파일 접근 금지 정책은 그대로 적용된다.
   - **waiver는 사용자만 발급한다** — foreman이 면제를 스스로 판단하거나 사유를 발명하지 않는다. 입력 경로는 `--waiver "<사유>"` 플래그뿐이다.
   - 새로 만들거나 갱신한 픽스처에는 출처를 표기한다 — `docs-verified` / `live-observed` / `synthetic` + 출처 + 관측일 (ADR-064 D5). **`live-observed`는 저장 전 마스킹이 의무**이며, 마스킹이 확실하지 않으면 저장하지 않고 receipt에 구조 요약만 남긴다.
   - **확보하지 못하면 날조·우회하지 않고 `Needs Execution Evidence: <경계 종류> — <무엇을 못 했는지 1줄> / 가능한 대안: <있으면>` 을 출력하고 그 부분을 미완으로 둔다**(다른 AC 구현은 계속). **이 정지가 본 계약의 실질 차단 지점이다** — `/validate-workitem`은 기록만 하므로(ADR-064 D7) 여기서 통과시키면 방어선이 없다.
```

## 3-5. `.claude/skills/implement-workitem/SKILL.md` — `## 4-1` 갱신 문단에 한 줄 추가

**Before**
```
**메인 foreman 은 모든 builder 의 변경 파일 목록을 합쳐 task 문서의 `## 4-1. 변경 예정 파일/경로` 를 *한 번* 갱신한다** (slice 별 중복 제거 — finalize 의 add 참조 목록). builder 가 같은 `## 4-1` 을 동시에 쓰지 않게 갱신 주체는 메인으로 단일화한다.
```

**After**
```
**메인 foreman 은 모든 builder 의 변경 파일 목록을 합쳐 task 문서의 `## 4-1. 변경 예정 파일/경로` 를 *한 번* 갱신한다** (slice 별 중복 제거 — finalize 의 add 참조 목록). builder 가 같은 `## 4-1` 을 동시에 쓰지 않게 갱신 주체는 메인으로 단일화한다. **6-V·6-E 가 추가한 VC 테스트·픽스처 파일도 이 목록에 포함한다** (ADR-064 — 그 둘이 본 갱신보다 먼저 수행되는 이유다. 빠지면 finalize 의 add 대상에서 누락된다).
```

## 3-6. `.claude/skills/implement-workitem/SKILL.md` — 신설 6-R (receipt 기록)

`최종 sanity 검증 (메인 foreman 이 모든 builder 수합 후 1회 — *minimal*):` 이 시작되기 **직전**에 삽입한다.

```
6-R. **receipt 기록 (ADR-064 D4 — 파일 변경이 전부 끝난 뒤, `/validate-workitem` 실행 *이전*)**: 3-U·6-V·6-E의 결과를 task 문서 `## 8. 메모`에 해당하는 것만 1줄씩 append한다. **writer는 foreman 단독이다.**
   - `- exec-evidence <날짜> <경계 a|b|c>: <등급 1 재실행 가능 | 등급 2 1회성 — 형태> — <무엇에 대고 실행했는가> / 결과: <관측 1줄>`
   - `- verify-power <날짜> <AC-N>: red=<observed|opt-out(사유)|characterization(사유)|unrecoverable(사유)> / vc=<VC-N 목록 또는 없음> / mutation=<미승격(G# 미충족) | 승격(변이·관측·사본 삭제 결과)>`
   - `- fact-resolved <날짜> <무엇>: <잠정값> → <관측값> / 관측 방법: <1줄>`

   **순서가 계약의 일부다.** (i) 파일 변경이 끝난 뒤에 써야 증거가 최종 코드를 덮고 `## 4-1`에도 반영된다. (ii) `/validate-workitem`이 report를 쓴 *뒤에* `## 8`을 건드리면 task 문서 mtime이 갱신돼 `/finalize-workitem`이 report를 stale로 판정하고 `Needs Validation`으로 종료한다 — 재validate → 재append의 무한 후퇴가 된다. **digest·커밋 비교로 신선도를 판정하지 않는다**(판정자에게 그 도구가 없고, 커밋 비교는 위 무한 후퇴의 직접 원인이다) — 코드를 고친 주체가 그 자리에서 receipt를 갱신하는 것이 신선도 유지 방식이며 `/repair-workitem`도 같은 책임을 진다.
```

## 3-7. `.claude/skills/implement-workitem/SKILL.md` — 마지막 출력 항목 추가

**Before**
```
- 최종 sanity (`validate --changed`) 결과: pass / skip / broken(+원인 slice)
```

**After**
```
- 최종 sanity (`validate --changed`) 결과: pass / skip / broken(+원인 slice)
- 실행 증거 (ADR-064 D1): 경계 종류별 확보 현황(a/b/c) + 등급(1 재실행 가능 / 2 1회성) / 해당없음(외부 경계 아님) / `Needs Execution Evidence: <경계 종류>`
- 판정력 (ADR-064 D2): AC별 red 상태 / VC-N 추가분 / 격리 변이 승격 여부
- 미실측 해소 (ADR-064 D3): 해소 N건 / `Needs Fact Resolution` K건(사유)
```

## 3-8. `.claude/agents/builder.md` — 규칙 3줄 추가

**Before**
```
- 범위 밖 변경은 하지 않는다.
```

**After**
```
- 범위 밖 변경은 하지 않는다.
- **작업 트리를 고의로 변형해 테스트 민감도를 확인하지 않는다 (ADR-064 D2 R7)** — 검증 장치의 판정력 측정은 foreman이 격리된 사본에서만 수행한다. 너는 peer slice를 볼 수 없어 격리 가능 여부를 판정할 수 없다. **금지되는 것은 *민감도 확인용 일시 변형*뿐이며, Red phase의 실패 테스트 작성·반례 테스트·positive control 추가는 정상 작업이다.**
- **Red 관측을 반환에 포함한다 (ADR-064 D2)** — 각 AC에 대해 "어떤 테스트가 구현 전에 어떤 이유로 실패했는지" 한 줄. 구현 전에 통과해 버렸으면 그 사실을 그대로 보고한다(그 테스트는 판정력이 없으므로 foreman이 처리한다). TDD opt-out task는 "opt-out"이라고만 적는다.
- **픽스처를 새로 만들거나 갱신하면 출처를 표기한다 (ADR-064 D5)** — `docs-verified` / `live-observed` / `synthetic` + 출처 + 관측일. **실제 응답을 옮겨 적는 경우 저장 전 마스킹이 의무**이며(개인정보·자격증명·토큰·내부 식별자), 마스킹이 확실하지 않으면 저장하지 않고 그 사실을 "남은 리스크"에 적는다.
```

## 3-9. `.claude/agents/builder.md` — 출력 요약 항목 추가

**Before**
```
  - 테스트/검증 여부
```

**After**
```
  - 테스트/검증 여부
  - AC별 Red 관측 (구현 전 실패 이유 1줄씩, opt-out이면 그 사실 — ADR-064 D2)
```

## 3-10. `.claude/skills/repair-workitem/SKILL.md` — receipt 갱신 책임 추가

아래 블록을 기존 `3. **결정 이력 영속화 (ADR-047 D7)**` **앞**에 삽입한다(기존 번호는 다시 매기지 않는다 — 본 skill 본문의 다른 곳이 이 번호를 참조하지 않는다).

**Before**
```
3. **결정 이력 영속화 (ADR-047 D7)**
```

**After**
```
2-E. **실행 증거 갱신 (ADR-064 D4 — 외부 경계 코드를 고쳤을 때만)**: 본 라운드의 Adopt/Adopt-modified 수정이 (a) 영속 저장소 쓰기 · (b) 외부 네트워크 호출 · (c) 실행 진입점 코드를 건드렸으면, **그 경계의 실행 증거를 다시 확보하고 task `## 8`에 `- exec-evidence` 줄을 새로 append한다**(기존 줄은 지우지 않는다 — 이력이다). 증거 등급·안전 규정·waiver 규정은 implement 6-E와 동일하다. 확보하지 못하면 `Needs Execution Evidence: <경계 종류> — <사유>`를 출력에 남긴다. **등급 1 증거로 새 파일을 만들었으면 task `## 4-1`에도 그 경로를 추가한다**(finalize 의 add 목록 누락 방지 — 본 skill 은 단독 실행이라 `## 4-1` 단일 writer 규율과 충돌하지 않는다).
   **이 책임이 repair에 있는 이유**: receipt writer를 implement 단독으로 두면 `validate(Needs Fix) → repair(코드 수정) → 재validate` 에서 증거가 낡은 채 남고 그것을 갱신할 주체가 없어 루프가 닫힌다. 코드를 고친 주체가 그 자리에서 증거를 갱신하는 것이 이 계약의 신선도 유지 방식이다.
   본 skill이 `## 8`에 쓰는 시점은 `/validate-workitem` 재실행 *이전*이고 아래 4에서 report를 삭제하므로, task 문서 mtime 갱신이 report를 stale로 만드는 문제는 발생하지 않는다.

3. **결정 이력 영속화 (ADR-047 D7)**
```

## 3-11. `.claude/skills/repair-workitem/SKILL.md` — 마지막 출력 항목 추가

**Before**
```
- 다음 권장 액션: `/validate-workitem <task-id>` 재실행
```

**After**
```
- 실행 증거 갱신 (ADR-064 D4): 갱신 N건(경계 종류) / 해당없음(외부 경계 코드 미수정) / `Needs Execution Evidence`
- 다음 권장 액션: `/validate-workitem <task-id>` 재실행
```

## Stage 3 확인

```
grep -c "ADR-064" .claude/skills/implement-workitem/SKILL.md
grep -c "ADR-064" .claude/agents/builder.md
grep -c "ADR-064" .claude/skills/repair-workitem/SKILL.md
grep -n "^6-V\|^6-E\|^6-R\|^\*\*메인 foreman 은 모든 builder\|^최종 sanity 검증" .claude/skills/implement-workitem/SKILL.md
```
→ implement 11건, **builder 4건**, repair 2건 (`grep -c`는 *줄 수*를 센다). 마지막 명령의 줄 번호로 **6-V < 6-E < `## 4-1` 문단 < 6-R < 최종 sanity** 순서를 확인한다.

## Stage 3 커밋

```
feat(implement): require execution evidence and verification-power records
```

---

# Stage 4 — 판정 층 (validate-workitem · validator · STRUCTURE)

Stage 3 완료 후 진행한다.

> **중요**: `/validate-workitem`은 **report-only 계약을 유지한다.** 실행하지 않고 `## 8`의 receipt만 읽는다. `allowed-tools`에 범용 `Bash`·해시 도구를 추가하지 않고, digest·커밋 비교도 하지 않는다. 새 감사 축도 만들지 않고 기존 **축 7(Evidence Bundle)** 안에서 처리한다. **여기서 만드는 판정은 전부 P1 기록 등급이며 새 P0를 만들지 않는다** — validate가 하는 일은 문자열 읽기이고, 저장소 배치 기준(1문항)상 문자열 검사는 차단 등급을 가질 수 없다. 실질 차단은 Stage 3의 implement 정지가 담당한다.

## 4-1. `.claude/skills/validate-workitem/SKILL.md` — 축 7 설명 갱신

**Before**
```
       7. Evidence Bundle 축(통합 명령 실행 결과 + oracle gap surface 점검)
```

**After**
```
       7. Evidence Bundle 축(통합 명령 실행 결과 + oracle gap surface 점검 + ADR-064 receipt 판정 — 실행 증거/판정력/미실측 잔존, 전부 P1 기록 등급. 별도 축을 만들지 않는다)
```

## 4-2. `.claude/skills/validate-workitem/SKILL.md` — AC↔테스트 매핑 기준에 VC 제외 추가

**Before**
```
- AC ↔ 테스트 매핑 — task 문서의 AC-N마다 대응하는 테스트가 존재하는가(자연어 매칭 휴리스틱 또는 테스트 이름의 `AC_N` 식별자 매칭).
```

**After**
```
- AC ↔ 테스트 매핑 — task 문서의 AC-N마다 대응하는 테스트가 존재하는가(자연어 매칭 휴리스틱 또는 테스트 이름의 `AC_N` 식별자 매칭). **`## 6-1`의 `VC-N` 행은 AC 행동으로 귀속되지 않는 판정력 확인용(positive control 등)이므로 본 매핑의 분자·분모 어디에도 넣지 않는다 (ADR-064 D2)** — 커버리지 %가 아래 confidence ladder의 입력이라 섞이면 등급이 이동한다. 대신 `VC-N`이 가리키는 테스트 줄은 diff trace audit에서 *추적 가능*으로 분류한다(추적 근거는 `AC-N | 명시 요청 | VC-N` 셋이다 — ADR-006#amend-1 문구의 해석 확장).
```

## 4-3. `.claude/skills/validate-workitem/SKILL.md` — 검증 기준에 3개 항목 추가

**Before**
```
- **Evidence Bundle 양식 강제** (ADR-047 D8 oracle adequacy + D1 inspectability 정합): 위 양식의 "검증된 것 / 검증하지 못한 것 / 신뢰도" 3 sub-section을 *모두* 채운다. Pass 판정이라도 oracle gap이 명시 안 되면 *신뢰도: Low*로 강등 (자동 차단 X — report 신뢰 등급만 영향).
```

**After**
```
- **Evidence Bundle 양식 강제** (ADR-047 D8 oracle adequacy + D1 inspectability 정합): 위 양식의 "검증된 것 / 검증하지 못한 것 / 신뢰도" 3 sub-section을 *모두* 채운다. Pass 판정이라도 oracle gap이 명시 안 되면 *신뢰도: Low*로 강등 (자동 차단 X — report 신뢰 등급만 영향).
- **아래 세 판정의 공통 판독 규칙 (ADR-064 D4)**: `- 외부 경계:` · `[미실측]` · `- exec-evidence`/`- verify-power` 를 찾을 때는 **HTML 주석(`<!-- ... -->`) 밖의 줄만** 센다. TASK_TEMPLATE 주석에 같은 형식의 예시가 들어 있어, 주석까지 세면 앞의 둘은 모든 task에서 오탐이 나고 `- exec-evidence`는 항상 존재로 보여 검사가 조용히 죽는다(원장 조회의 "설명 섹션의 형식 예시는 항목이 아니다"와 동형).
- **실행 증거 판정** (ADR-064 D1/D7 — 본 skill은 실행하지 않고 *기록만 읽는다*): 본 task가 외부 경계를 건드렸는가를 diff와 task `## 2`의 `- 외부 경계:` 표시로 판정한다((a) 영속 저장소 쓰기 / (b) **외부** 네트워크 호출 — 같은 배포 단위 안의 서비스 간 호출은 제외 / (c) 실행 진입점). 해당하는 **경계 종류마다** task `## 8`에 `- exec-evidence` 줄이 있어야 한다. 없으면 `P1 [Exec-evidence-missing] <경계 종류>`. 사용자 waiver로 기록된 줄은 충족으로 보고 사유를 report에 인용한다. **줄의 존재 여부만 본다 — 신선도는 판정하지 않는다**(digest·커밋 비교는 도구가 없고, 줄 순서 기반 판정은 정상 repair 라운드에서 오탐이 난다. 근거는 ADR-064 D4). 증거 갱신은 코드를 고친 `/repair-workitem`의 책임이다. **본 항목은 기록 등급이며 Needs Fix를 트리거하지 않는다** — 실질 차단은 `/implement-workitem`의 `Needs Execution Evidence` 정지가 담당한다(ADR-064 D7).
- **판정력 판정** (ADR-064 D2/D7): 각 AC에 대해 task `## 8`에 `- verify-power` 줄이 있고 `red=` 값이 `observed|opt-out(사유)|characterization(사유)|unrecoverable(사유)` 중 하나인가. 없거나 값이 비면 `P1 [Verify-power-missing] AC-N`. **`opt-out`·`characterization`은 정상이며 결함이 아니다**(정당한 TDD opt-out·`Type: research-spike`·`Type: refactor`). `mutation=미승격`도 정상이다. 기록 등급 — Needs Fix를 트리거하지 않는다.
- **미실측 잔존 판정** (ADR-064 D3): task `## 3`에 `[미실측]` 표기가 남아 있으면 `P1 [Unmeasured-fact] <무엇> — 구현 시 해소되지 않음`. 기록 등급.
```

## 4-4. `.claude/skills/validate-workitem/SKILL.md` — report 양식에 섹션 추가

`## Spec coverage (FAC ↔ AC, ADR-037)` 블록이 끝나고 `## Evidence Bundle (ADR-047 D8 oracle adequacy 정합)` 이 시작되기 **직전**에 아래를 삽입한다(양식 코드펜스 안이다).

```
## 실행 증거 · 판정력 (ADR-064 — 전부 기록 등급, Needs Fix 미트리거)
- 외부 경계: 해당(a 영속 저장소 / b 외부 네트워크 / c 진입점) | 해당없음
- exec-evidence: (a) ✅ 등급1 재실행 가능 / (b) ❌ `P1 [Exec-evidence-missing]` / waiver(<사유>) | 해당없음
- verify-power: AC-1 ✅ observed / AC-2 ✅ opt-out(spike) / AC-3 ❌ `P1 [Verify-power-missing]`
- VC-N: <등재 목록 또는 없음> (AC 매핑 % 집계 제외)
- 미실측 잔존: 0건 | `P1 [Unmeasured-fact] <무엇>`
```

## 4-5. `.claude/agents/validator.md` — 축 7 판정 규칙 1줄 추가

fan-out 모드의 validator가 inline 모드와 다른 판정을 내지 않게 같은 규칙을 준다. 아래 한 줄을 기존 FAC 줄 **앞**에 삽입한다.

**Before**
```
- feature `## 7 FAC`의 각 항목이 task `## 6 AC`로 매핑됐는가?
```

**After**
```
- **Evidence 축 (ADR-064 — 축 7을 받았을 때만)**: task `## 8`의 receipt를 *읽어서만* 판정한다(실행·해시 계산 금지). **표기를 찾을 때는 HTML 주석(`<!-- -->`) 밖의 줄만 센다** — TASK_TEMPLATE 주석의 형식 예시를 세면 `- 외부 경계:`·`[미실측]`은 상시 오탐, `- exec-evidence`는 상시 존재로 보여 검사가 죽는다(ADR-064 D4 판독 규칙). 외부 경계 종류(a 영속 저장소 쓰기 / b 외부 네트워크 호출 — 같은 배포 단위 안의 서비스 간 호출 제외 / c 실행 진입점)마다 `- exec-evidence` 줄이 있는가(없으면 `P1 [Exec-evidence-missing] <종류>`. **줄의 존재만 보고 신선도는 판정하지 않는다** — 줄 순서 기반 stale 판정은 정상 repair 라운드에서 오탐이 난다), AC마다 `- verify-power` 줄의 `red=` 값이 `observed|opt-out|characterization|unrecoverable` 중 하나인가(아니면 `P1 [Verify-power-missing] AC-N`), `## 3`에 `[미실측]` 잔존이 있는가(있으면 `P1 [Unmeasured-fact] <무엇>`). **전부 P1 기록 등급이며 Needs Fix 트리거로 반환하지 않는다** — 실질 차단은 implement의 정지가 담당한다(ADR-064 D7).
- feature `## 7 FAC`의 각 항목이 task `## 6 AC`로 매핑됐는가?
```

## 4-6. `docs/00-meta/STRUCTURE.md` — Canonical Owner 표에 행 추가

`| 검증 장치의 실측 검증 + 유지 주기 ... ADR-063 ... |` 줄 **바로 아래**에 추가한다.

```
| task 층 증거 계약 (외부 경계 실행 증거·검증 판정력·`[미실측]` 외부 사실·receipt) | [ADR-064](../90-decisions/boilerplate/ADR-064-task-layer-evidence-contract.md) (정책 SSOT). → ADR-064 `## Surfaces` 참조. |
```

## Stage 4 확인

```
grep -c "ADR-064" .claude/skills/validate-workitem/SKILL.md
grep -c "ADR-064" .claude/agents/validator.md
grep -c "ADR-064" docs/00-meta/STRUCTURE.md
grep -n "^allowed-tools" .claude/skills/validate-workitem/SKILL.md
grep -n "P0 \[Exec-evidence\|P0 \[Verify-power\|P0 \[Unmeasured" .claude/skills/validate-workitem/SKILL.md .claude/agents/validator.md
```
→ validate 7건, validator 1건, STRUCTURE 1건. **`allowed-tools` 줄이 변경되지 않았어야 하고**, 마지막 명령은 **0건**이어야 한다(validate 층에 P0를 만들지 않는다).

## Stage 4 커밋

```
feat(validate): record execution-evidence and verification-power findings
```

---

# Stage 5 — 최종 정합 점검

5-1~5-3은 기계 확인, 5-4는 육안, 5-5는 반증 점검이다. 실패 항목이 있으면 해당 Stage로 돌아가 고친 뒤 별도 커밋한다.

## 5-1. ADR 참조 정합

```
grep -rn "ADR-064" --include="*.md" . | grep -v "^./IMPROVE-GUIDE.md"
```
`ADR-064` 본문 + README 인덱스 1 + **Surfaces에 등재된 9개 파일 전부**에 역참조가 있어야 한다. Surfaces에 적혔는데 `ADR-064` 문자열이 없는 파일이 있으면 안 된다(`P1 [Surface-backref]` 대상).

## 5-2. Surfaces 등재 파일 실재

```
ls docs/30-workitems/_templates/TASK_TEMPLATE.md .claude/skills/plan-workitem/SKILL.md .claude/skills/implement-workitem/SKILL.md .claude/agents/builder.md .claude/skills/repair-workitem/SKILL.md .claude/skills/validate-workitem/SKILL.md .claude/agents/validator.md docs/90-decisions/boilerplate/ADR-060-decision-closure-and-milestone-seal.md docs/00-meta/STRUCTURE.md
```

## 5-3. 다중 ID 잔존 없음

```
grep -rn "다중 ID\|다중 task" --include="*.md" . | grep -v "^./IMPROVE-GUIDE.md" | grep -v SIMULATION_RUN | grep -v ADR-008
```
→ 0건. **`rg`가 있으면 같은 패턴을 `rg`로도 돌려 결과가 같은지 확인한다**(일부 grep 구현이 한글 패턴을 놓친다).

## 5-4. 계약 위반 없음 (육안 확인 5가지)

1. `validate-workitem/SKILL.md`의 `allowed-tools`에 범용 `Bash`·해시 도구가 추가되지 않았다.
2. validate·validator 어디에도 `P0 [Exec-evidence-*]` / `P0 [Verify-power-*]` / `P0 [Unmeasured-fact]`가 없다 — 문자열 검사에 차단력을 주지 않는다.
3. `implement-workitem/SKILL.md`에서 **6-V → 6-E → `## 4-1` 문단 → 6-R → 최종 sanity** 순서가 지켜졌다.
4. ADR-014(졸업 게이트 5+1)·MILESTONE_TEMPLATE에 항목이 추가되지 않았다.
5. `GUARDRAILS_STRATEGY.md`의 "새 기계적 검사의 배치 기준" 2문항에 예외 조항이 추가되지 않았다.

## 5-5. 반증 점검 (scratch 시나리오 — 실제 프로젝트에 적용하기 전 1회)

새 계약이 *정상 경로를 막지 않고 결함 경로를 잡는지* 확인한다. 임시 디렉터리나 fork에서 아래 10개를 짧게 돌려 보고 예상과 다르면 그 결정을 재조정한다.

| # | 입력 | 기대 |
|---|---|---|
| 1 | 외부 경계 0개인 순수 로직 task | `Needs Execution Evidence` 미발화. exec-evidence 줄 없음이 정상 |
| 1b | **템플릿 주석을 그대로 둔** task 문서(마커 미기입) | `- 외부 경계:`·`[미실측]`·`- exec-evidence` **전부 0건으로 판정**. 주석 안 예시를 세면 앞의 둘은 상시 오탐, 셋째는 검사가 조용히 죽는다 |
| 2 | (a)+(b)+(c) 전부 해당하는 복합 task | exec-evidence **3줄**(종류별). 1줄만 있으면 `P1 [Exec-evidence-missing]` 2건 |
| 3 | 모노레포 자기 API 호출만 있는 프론트 task | (b) 미해당으로 판정 — 게이트 오발동 없음 |
| 4 | `## 6-2. TDD opt-out`이 정당하게 채워진 task | `red=opt-out(사유)`로 통과. `[Verify-power-missing]` 미발화 |
| 5 | 부재를 단정하는 AC(로그가 없어야 함) | positive control이 VC-N으로 등재되고 AC 매핑 %에는 미포함 |
| 6 | validate Needs Fix → repair가 외부 경계 코드 수정 → 재validate | repair 출력에 "실행 증거 갱신 N건"이 뜨고 `## 8`에 새 `exec-evidence` 줄이 append됨. 재validate에서 새 finding 없음(**루프 없음**) |
| 6b | 코드 수정 없이 전부 Reject한 repair 라운드 → 재validate | 증거 관련 finding **0건**(정상 라운드가 오탐으로 걸리지 않는다) |
| 7 | `[미실측]` 3건 중 1건이 환경 차단으로 실측 불가 | 2건은 `[실측]`으로 해소, 1건은 `Needs Fact Resolution`으로 미완 표시 |
| 8 | implement → validate → finalize 연속 실행 | finalize가 `Needs Validation`으로 종료하지 **않는다**(receipt가 validate 이전에 기록됐으므로) |

**6 · 6b · 8이 가장 중요하다** — 6·8이 깨지면 lifecycle이 막히고, 6b가 깨지면 정상 라운드마다 오탐이 쌓여 라벨이 무시된다.

## 5-6. 작업 트리 정리

```
git status
```
→ 이 가이드 파일(`IMPROVE-GUIDE.md`) 외에 미커밋 변경이 없어야 한다.

---

# 부록 — 남긴 개선 후보 (이번에 고치지 않음)

아래는 **이번 라운드 범위 밖**이다. 지금 손대지 말고, 다음 개선 라운드의 입력으로만 기억한다.

1. **팬아웃 임계 구조 결함** — `validate-workitem`의 inline 허용 조건 두 번째 연접(`UI/Arch-iface/MCP/spec-coverage 중 둘 이상 해당없음`)이 UI 프로젝트에서 충족하기 어려워, 7-x를 스치는 작은 UI 구현 task가 크기와 무관하게 팬아웃을 강제당한다(순수 CSS·카피 변경처럼 Arch-iface·MCP가 모두 해당없는 경우만 inline이 열린다). 수정하려면 ADR-051 통합 재발행이 필요하다(그 ADR이 `#amend-4`에서 "다음 변경 시 통합 재발행"을 이미 서약했고, 인용이 28파일 87곳이다). **판정이 틀리는 게 아니라 느리고 비싼 문제**라 별도 라운드가 맞다.
2. **졸업 e2e 게이트의 자기충족** — `stack-guard`가 자동 생성하는 boot smoke 1개가 "실행된 e2e 1개 이상 성공"이라는 졸업 조건을 그대로 충족한다. ADR-064 D6이 "E2E와 실행 증거는 게이트로서 서로를 대체하지 않는다"로 완충했으므로 급하지 않다.
3. **finalize 단일 ID 축소의 ADR 근거** — 이번에는 WORKFLOW·skill 본문에 철회 사유를 인라인으로 남겼다. 더 강한 영속성이 필요하다고 판단되면 ADR-007에 amendment 한 줄("finalize는 단일 ID — 다중 ID는 파싱 모호성으로 철회")을 추가하는 것이 자리다.
4. **등급 1 증거의 표준 배선** — 일회용 실자원 테스트를 `validate`에 묶는 방법은 스택마다 다르다(testcontainers / docker-compose / 에뮬레이터). `/stack-guard`가 그 배선을 프로비저닝 단계에서 제안하도록 확장하면 등급 1 채택률이 올라간다. 이번 라운드는 계약만 세우고 배선 자동화는 넣지 않았다.
5. **receipt의 구조화 + 증거 신선도 검사** — 지금 receipt는 `## 8`의 자유 텍스트 한 줄이라, "이 증거가 *어느 라운드*의 코드에 대한 것인가"를 기계가 판정할 수 없다. 그래서 이번 라운드는 신선도 자동 검사를 두지 않았고(ADR-064 D4 한계), repair가 갱신 책임을 조용히 건너뛰는 경로가 열려 있다. 라운드 식별자를 갖는 구조화 스키마(예: `round: <implement|repair-N>`)로 승격하면 오탐 없는 신선도 검사가 가능해진다. **D4의 falsifying evaluation이 이 승격의 발동 조건을 이미 정해 두었다**(해당 사례 2회 누적).
