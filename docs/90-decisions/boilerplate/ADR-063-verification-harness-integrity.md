# ADR-063 — 검증 장치의 실측 검증과 유지 주기 (Verification Harness Integrity)

> scope: boilerplate
> area: tooling

## Status
accepted

## 배경
- [관측됨] `/stack-guard`의 smoke test는 생성된 `validate` 명령을 1회 실행하는 것이 전부이고, 4단계(format/lint/typecheck/test) 커버리지 판정은 **모델이 자기 산출물을 읽고 산문으로 추론**한다. 확인 장치가 없다.
- [관측됨] 정상 lifecycle(`PROJECT_START_CHECKLIST` 3단계 `/stack-guard` → 4단계 `/plan-milestone`)에서 stack-guard 실행 시점의 소스 파일 수는 0이다. 스캐폴드 단계가 체크리스트에 없다. 이 상태에서 검사 도구가 실패 코드를 내면 현행 판정 표는 `WIRING FAIL → 종료`로 흘러, **정상 경로가 산출물 결함으로 오분류**된다.
- [관측됨] 프로젝트 도구(formatter/linter)의 기본 검사 범위는 프로젝트 전역이라 `.claude/skills/stack-guard/assets/design-gate*.mjs`(canonical)와 `scripts/design-gate.mjs`(materialized 사본)가 포맷 대상에 들어간다. 포맷되면 SHA-256 digest가 바뀌어 conformance oracle이 `source-integrity: false` + exit 1로 게이트를 차단하고, `status: wiring-fail`로 굳는다.
- [관측됨] `/stack-guard` 산출물은 최초 1회 생성 후 drift 감지 트리거가 없다. registry 4종·design gate digest는 재실행 시 실측 갱신되지만 `validate` 커버리지와 `scripts/verify.*` 재실행 정책은 정의되지 않았다.
- [관측됨] 재실행 시 무엇이 갱신되고 무엇이 보존되는지의 정책이 SKILL 본문 6곳에 흩어져 한눈에 보이지 않는다.
- [외부실증] ADR-047 D8(Oracle Adequacy) — pass/fail 단일 신호는 과신을 만든다. verifier는 무엇을 검증하지 못했는지 선언해야 한다. 현행 smoke test는 정확히 그 과신 상태다.

## 결정

### D1. probe 기반 실측 smoke test
`/stack-guard`는 생성한 `validate`의 판정력을 **시험용 파일(probe)로 실측**한다. 산문 추론으로 4단계 커버리지를 판정하지 않는다.

- probe 세트는 **통과용 1세트 + 단계별 위반용 1개씩**이다. 통과 fixture만으로는 *"아무 대상도 잡지 않는 검사"*와 구분되지 않는다.
- probe 파일 내용은 스택에 맞춰 생성하되, **기대값(oracle)은 고정**한다 — 어느 probe가 어느 회차에서 어떻게 판정돼야 하는지는 SKILL 본문의 판정 표가 소유한다.
- **probe는 등록된 소스/테스트 루트 안에, 그 스택의 include·test glob에 걸리는 이름으로 만든다.** 닷 디렉터리나 `.gitignore` 등재 경로에 두지 않는다 — 다수 formatter/linter가 `.gitignore`를 기본 존중하고, TypeScript `include`의 `**/*`는 `.`으로 시작하는 세그먼트를 매칭하지 않으며, 테스트 러너 glob은 dot 파일을 기본 제외한다. 그런 위치에 두면 위반 probe가 실패하지 않아 **판정력이 정상인 검사도 FAIL로 오분류**되고, 본 D1이 고치려던 오분류를 새 라벨로 재생산한다.
- **판정 단위는 전체 exit code가 아니라 "probe 파일 경로가 진단에 등장하는가"다.** brownfield fork는 기존 위반으로 전체 코드가 이미 1일 수 있어, 전체 코드로 판정하면 배선 실패와 프로젝트 실패를 구분할 수 없다.
- **위반 probe는 한 번에 하나만 둔다.** `validate`는 4단계를 순차 fail-fast로 묶으므로 여러 위반을 동시에 두면 첫 단계에서 멈춰 뒤 단계의 판정력을 측정할 수 없다.
- **판정의 두 전제 — 단계 실재와 실행 도달.** 각 회차의 판정은 (i) 그 단계를 수행하는 명령이 `validate` 파이프라인에 **실재**하고 (ii) 이번 실행에서 그 단계까지 **실제로 도달**했을 때만 성립한다.
  - (i)이 아니면 *probe가 범위 밖*이 아니라 **커버리지 누락**이다 — 기존 `missing: <단계>` 보고 경로로 적고 그 회차만 건너뛰고 다음 회차를 계속한다(겸업 도구가 그 단계를 겸하는 경우는 부재가 아니다). 둘을 합쳐 `SKIPPED — 범위 밖`으로 적으면 **본 ADR이 잡으려는 배선 누락이 비차단 SKIPPED로 숨는다.**
  - (ii)이 아니면(brownfield의 기존 위반이 앞 단계에서 fail-fast를 유발) 그 단계 명령을 **단독 실행**해 같은 기준(경로 귀속)으로 판정하고, 단독 실행이 불가하면 `SKIPPED(미도달)`로 보고한다.
  - **(i)·(ii) 어느 경우도 `PROBE FAIL`로 적지 않는다** — 배선 결함이 아닌 것을 결함으로 적으면 D1이 고치려던 오분류를 방향만 바꿔 재생산한다.
- **범위 확인을 먼저 한다.** 파이프라인에 실재하는 **첫 단계**의 회차에서 명백한 위반 probe 1개가 진단에 등장하지 않으면 `SKIPPED — probe가 검사 범위 밖`이며 이후 회차를 돌리지 않는다(배치 문제는 뒤 회차에서도 같은 이유로 재현되므로 더 돌려서 얻을 정보가 없다). 이 확인이 *"검사에 판정력이 없다"*·*"그 단계가 아예 없다"*·*"probe가 범위 밖이다"* 셋을 구분한다.
- 판정 후 생성 파일을 **전부 삭제**하고 **삭제 결과를 출력에 보고**한다. 실패 경로·조기 종료 경로에서도 정리한다.
- probe 생성 자체가 차단되면(권한·sandbox·이름 충돌) `SKIPPED — probe 생성 불가: <사유>`로 보고하고 **`WIRING FAIL`로 판정하지 않으며 종료하지 않는다**.
- **미검증 상태는 기록으로 남긴다 — 졸업 차단 항목은 신설하지 않는다.** 범위 밖·생성 불가·미도달 SKIPPED와 단계 부재로 인한 `PARTIAL`은 프로비저닝 단계에서 정상이고, 최종 판정을 `STACK_SETUP_PLAN.md ## 통합 명령 사용법`에 `probe smoke: <판정> (<확인일>)` 1줄로 기록해 **D4 (d)가 다음 마일스톤에 회수**한다. 졸업 게이트(ADR-014)에 새 항목을 넣지 않는 근거는 본 ADR의 D6 기준 그대로다 — 기록 문자열을 읽는 검사는 문법을 이해하지 못하므로 **기록 등급 상한**이고(1문항), *SKIPPED 상태로 졸업한 사례*는 관측된 바 없다(2문항). 기록이 없으면 재실행 권고 자체가 발화하지 않으므로 이 1줄은 필수다.
- **프로젝트 빈 케이스는 차단하지 않는다** — probe가 전부 기대대로인데 프로젝트 lint 룰이 비었거나 프로젝트 테스트가 0건이면 비차단 경고로 보고한다. 프로비저닝 단계에서 정상인 상태이며, 졸업 시점의 판정은 **ADR-014의 기존 5+1 항목이 소유한다**(테스트 0건은 item 4 `AC 매핑 100%`에서 드러난다 — 본 ADR은 졸업 항목을 추가하지 않는다).
- 선례: `design-gate-conformance.mjs`가 동일 패턴(fixture 생성 → 통과/위반 양쪽 판정 → `finally` 삭제)을 이미 수행한다.

**같은 원리를 design gate conformance 에도 적용한다**: [관측됨] `design-gate-conformance.mjs` 는 `spawnSync` 의 `result.error`(자식 프로세스를 **띄우지 못한** 경우 — 관리 환경의 EPERM 등)를 `status === 2` 분기에 걸지 않고 `bounded-process-completion: false` 로만 기록해, 최종 exit 1(= `wiring-fail`)로 보고한다. 그러나 프로세스 기동 실패는 **환경 문제(execution unavailable)** 이지 산출물 결함이 아니며, ADR-058#amend-2 는 *"oracle exit 2는 needs-install/실행불가로 그대로 승계"* 를 이미 규정한다. 따라서 **기동 실패만** exit 2 로 승계한다 — `result.error.code` 가 `EPERM`·`EACCES`·`ENOENT` 계열일 때다. **기동 후 실패**(`ETIMEDOUT` 시간 초과·`ENOBUFS` 출력 초과)는 *adapter 가 유계 시간에 끝나지 않았다*는 뜻이므로 `bounded-process-completion` 결함으로 남긴다 — 구분 없이 승계하면 그 record 에 도달하기 전에 exit 2 로 빠져 **check 가 영구히 참**이 되고 ADR-058#amend-2 가 세운 판정이 사라진다. 승계는 **conformance 의 모든 `spawnSync` 호출**(core / same-basename batch / render-error isolation / pixel tolerance — 4회)에 동일하게 적용한다. 한 곳만 걸면 뒤 회차의 기동 실패가 같은 오분류를 재생산한다. 이 수정은 conformance asset 내부이며 adapter 의 canonical digest 를 바꾸지 않으므로 capability 승격이 필요 없다.

**부수 효과**: 한 도구가 두 단계를 겸하는 경우(Biome=format+lint, `flutter analyze`=lint+typecheck)의 `missing: <단계>` 오보고가 실측으로 자동 해소된다 — 겸업 여부를 산문으로 예외 처리할 필요가 없다. **단 겸업은 회차를 줄이지 않는다** — 한 단계의 probe 통과를 다른 단계의 판정으로 대체하지 않는다. format 진단은 lint 규칙의 판정력을 증명하지 않으며(겸업 도구도 linter 를 따로 끌 수 있다), 대체를 허용하면 D1이 막으려는 얕은 검증이 겸업이라는 이름으로 되돌아온다. 겸업이 바꾸는 것은 *단계 귀속을 판정하는 방법*뿐이다 — 명령을 구분할 수 없으므로 **진단의 규칙·카테고리**로 귀속을 판정한다.

### D2. harness 경로 배제 원칙
`/stack-guard`가 생성하는 도구 config 중 **아래 `적용 대상 도구`** 의 검사 범위에서 다음을 제외한다. 이들은 프로젝트 소스가 아니라 agent harness다.

- `.claude/`, `.codex/`, `.agents/`, `.boilerplate/`
- `STACK_SETUP_PLAN.md ## Design Gate Adapter`에 기록된 **materialized adapter 경로**(기본 `scripts/design-gate.mjs`) — 이 사본은 프로젝트 소스 트리 안에 있으므로 harness 디렉터리 제외만으로는 보호되지 않는다.
- **formatter의 Markdown 대상에서 `docs/`** — 이 저장소의 기계 점검 다수가 문서 문자열에 의존한다(로스터의 종 수 표기, ADR 인덱스 행, Amendments 칸, `## Amendment N` 카운트). formatter가 표를 재정렬하면 그 점검들이 조용히 깨진다. lint·typecheck와는 무관한 항목이다.

**적용 대상 도구**: formatter · linter · 타입 검사 include 범위 · 테스트 커버리지 집계 · 의존성 그래프 도구.

**⚠️ secret scanner는 배제 대상이 아니다 — 반대로 harness 경로를 포함해야 한다.** `.claude/settings.json`·`.codex/config.toml`·agent 설정에 토큰·키가 유입될 수 있고, 그것이 정확히 secret scanner가 잡아야 하는 대상이다. 포맷·타입 검사의 배제와 보안 스캔의 범위를 분리한다.

정확한 exclude 설정 키는 도구·버전마다 다르므로 **실행 시점에 해당 도구 문서로 확인**한다. SKILL 본문에 특정 키를 박지 않는다(도구 버전업 시 틀린 지시가 된다).

### D3. 재실행 계약 (idempotent)
`/stack-guard`는 재실행 가능하며, **변경이 필요한 것만 건드린다**. 무엇이 갱신되고 무엇이 보존되는지는 SKILL 본문의 `## 재실행 계약` 표가 SSOT다.

미정의였던 세 항목을 다음으로 확정한다.
- `scripts/verify.*` 본문: **존재하면 덮어쓰지 않는다.** 4단계 커버리지 부족만 출력에 보고한다(도구 감지 우선순위의 "기존 도구 미덮어씀" 원칙 정합 — 사용자가 손으로 고친 verify를 파괴하지 않는다).
- 임시 probe: 실행 시 생성 → 판정 → 삭제. 저장소에 잔존하지 않는다.
- probe 판정 기록: `STACK_SETUP_PLAN.md ## 통합 명령 사용법`의 `probe smoke: <판정> (<확인일>)` 1줄을 **매 실행 실측으로 갱신**한다. probe 파일은 지우지만 판정은 남는다 — 이 줄이 D4 (d)의 유일한 입력이다.

### D4. `[Guard-drift]` — 검증 장치 노후 감지 (침묵 우선)
`/stabilize-milestone` §1.0 deterministic pre-flight가 검증 장치의 노후를 마일스톤마다 점검한다.

- 점검 대상 4항목:
  - **(a) registry 경로 실재** — `STACK_SETUP_PLAN`에 기록된 **영속 산출물 경로**가 실제로 존재하는가. registry 절마다 스키마가 다르므로(절-수준 status / 행-수준 status / status 열 없음) **대상 절·검사할 경로 열·status 조건을 SKILL 본문의 표가 고정한다** — 그것이 없으면 본 항목은 deterministic 이 아니다. `status: n/a`·미대상 행은 대상이 아니다(e2e 비대상·비-UI 프로젝트에서 경로가 없는 것은 정상이다). **ephemeral 산출물 경로는 검사하지 않는다** — design gate 의 `output path`(`design-gate-shots/`)는 `.gitignore` 대상이고 매 실행 생성·초기화되므로 fresh clone 에서 부재가 정상이며, 검사하면 매 마일스톤 오탐이 되어 침묵 우선 원칙과 충돌한다.
  - **(b) design gate digest** — `## Design Gate Adapter`의 `status`가 `ready`인 경우에만, 기록된 source digest ↔ 실제 adapter 파일의 SHA-256 일치.
  - **(c) 등록 밖 소스 디렉터리** — **소스 루트 registry를 갖는 스택에서만** 수행한다. 현재 그 registry를 갖는 것은 `## Dart Source Roots`(Dart/Flutter)뿐이며 비-Dart 스택에서는 `/bootstrap-stack`이 그 절을 삭제하므로 **판정 기준이 없다 → 이 항목을 건너뛴다.** 기준 없이 "등록 밖"을 판정하면 TS/Python/Go의 `src/`·`tests/`가 매 마일스톤 오탐으로 찍혀 침묵 우선 원칙과 정면 충돌한다.
  - **(d) probe 판정 기록** — `## 통합 명령 사용법`의 `probe smoke:` 값이 `PROBE FAIL`·`PARTIAL`·`SKIPPED` 이거나 **줄 자체가 없으면** `P2 [Guard-drift] validate 판정력 미검증 — /stack-guard 재실행 권장`. **`PASS (…)`와 `PROBE OK, PROJECT FAIL`은 정상이다** — 후자는 probe 전 회차가 기대대로였고 프로젝트 코드만 실패한 상태라 검증 장치의 노후가 아니고(그 실패는 졸업 item 2·stabilize 단계 3이 이미 잡는다) 재실행 처방도 무의미하다. 판정력이 검증된 상태를 재실행 권고로 채우면 D4의 침묵 우선이 무너진다. **여기서 probe를 다시 돌리지 않는다** — 기록된 문자열만 읽는다(stabilize read-only 계약). 이것이 D1의 미검증 상태가 조용히 잊히지 않는 유일한 경로다.
- **`STACK_SETUP_PLAN.md`가 부재하면**(`/bootstrap-stack` 미실행 또는 산출 누락) 본 항목 전체를 skip 하고 `Guard-drift check skipped: STACK_SETUP_PLAN.md 부재` 1줄만 남긴다(§1.0의 `markdown-link-check` 미설치·원장 부재 선례와 동형).
- 불일치 시 `P2 [Guard-drift] <항목> — /stack-guard 재실행 권장`을 IMPROVEMENT_GUIDE에 기록한다.
- **전부 일치하면 출력에 한 줄도 남기지 않는다** — skip 사유 echo도 하지 않는다(위 파일 부재 skip은 예외 — 점검을 아예 못 했다는 사실은 알려야 한다). 정상 상태를 매번 보고하면 그것이 노이즈이고, 검증 장치가 매 마일스톤 변경되는 것도 정상이 아니다.
- 회수는 다음 `/plan-milestone` R0의 IMPROVEMENT_GUIDE open 항목 회수 경로를 그대로 탄다(신설 없음 — `[ADR-candidate]`·`[Stack-drift]`와 동형).
- `validate` 4단계 커버리지의 **재측정**은 본 항목이 아니다 — 실측은 `/stack-guard` 재실행 시 D1의 probe가 하고, 본 항목은 (d)로 그 **기록**만 읽는다(중복 회피 + read-only 유지).

### D5. 유지 주기 안내
검증 장치가 어떤 주기로 유지되는지를 `docs/00-meta/GUARDRAILS_STRATEGY.md`가 표 하나로 소유한다. 사용자가 파이프라인 전체를 한눈에 볼 수 있어야 재실행 권고가 실제로 실행된다.

### D6. 새 기계적 검사의 배치 기준 (2문항)
새 기계적 검사를 도입할 때 차단(hard-block) 등급을 줄 수 있는지 다음 2문항으로 판정한다.

1. 이 검사가 **문법·구조를 이해**하는가, 문자열만 보는가? → 문자열만 보면 **기록 등급 상한**(차단 금지).
2. 막으려는 실패가 **실제로 관측**됐는가(ADR-022)? → 가설뿐이면 **권장 등급**까지만.

둘 다 통과할 때만 차단이 가능하다. 기존 검사의 등급 분포(`validate` exit code·E2E `EMPTY` 졸업 차단·design gate digest = 차단 / raw-hex grep·Don'ts grep·인벤토리 drift = 기록)가 이 기준과 이미 정합한다 — 본 D6은 기준을 명문화해 새 검사 추가 시의 재발명을 막는다. **본 ADR이 새로 넣는 D4 (d)(`probe smoke:` 기록 읽기)도 이 기준을 적용받아 기록 등급이다** — 상태 문자열을 읽을 뿐이므로 1문항에서 차단 자격이 없다.

### D7. `validate:design` 출력의 single-origin
canonical design gate adapter는 매 실행 `design-gate-shots/`를 통째로 초기화한다(stale 픽셀 차단). 같은 checkout에서 `validate:design`을 **동시에 2개 실행하지 않는다** — 뒤에 시작한 실행이 앞 실행의 스크린샷을 지운다. `/stabilize-milestone`의 실행 single-origin 규약(ADR-054)과 동형이다.

adapter 코드는 본 ADR에서 수정하지 않는다 — digest 변경은 capability 버전 승격과 전 fork 재실행을 유발하고, 관측된 실패가 0건이므로 규약(문서)으로 처리한다. 코드 정정(자기 입력분만 삭제)은 다음 capability 승격 시 함께 반영한다.

### D8. 줄바꿈 전역 규칙
`.gitattributes`는 확장자 열거 대신 **전역 규칙 `* text=auto eol=lf`** 를 기준으로 하고 Windows 전용 스크립트(`*.ps1`/`*.bat`)만 `eol=crlf` 예외로 둔다.

- [관측됨] 열거 방식은 `.ts`/`.tsx`/`.js`/`.css` 등을 커버하지 않아 `core.autocrlf=true`(Windows Git 설치 기본값) 환경의 fresh clone에서 CRLF 체크아웃이 발생하고, LF를 기대하는 형식 검사가 코드 변경 없이 실패한다. 열거는 완결될 수 없다 — 새 확장자를 계속 놓친다(`.gitignore`의 service account 키 열거에 대해 이미 인정한 논리와 동형).
- `/stack-guard`는 재실행 시 이 전역 규칙의 존재를 확인하고 없으면 추가한다. 기존 fork에 처음 넣으면 `git add --renormalize .` 1회 커밋이 필요하며, 그 안내를 출력에 포함한다.
- digest 안정성이 `.mjs`에 의존하므로(ADR-058#amend-2) 전역 규칙에 포함되더라도 `*.mjs` 명시 줄과 주석을 방어적으로 유지한다.

## 근거
- probe는 "얕은 검증"을 구조적으로 불가능하게 만든다 — 위반 fixture가 실패하지 않으면 그 단계는 판정력이 없다는 사실이 즉시 드러난다. 산문 규정("4단계를 다 묶어라")은 확인 장치가 없어 지켜지지 않는다.
- 재실행 계약을 표 하나로 모으면 D4의 처방(`/stack-guard 재실행 권장`)이 실행 가능해진다. 무엇이 보존되는지 모르면 재실행하지 않는다.
- D4를 침묵 우선으로 둔 이유: 검증 장치의 노후는 드문 사건이고, 매 마일스톤 정상 보고를 내면 알림 피로가 발생해 실제 신호가 묻힌다.

## 결과
- `/stack-guard`의 4단계 커버리지 판정이 추론에서 실측으로 바뀐다.
- 소스 0개 상태(정상 경로)가 산출물 결함으로 오분류되지 않는다.
- harness 자산이 프로젝트 도구에 의해 변형되어 게이트가 굳는 경로가 막힌다.
- 검증 장치의 유지 주기가 문서 한 곳에서 확인 가능해진다.

## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT)
- .claude/skills/stack-guard/SKILL.md                          — D1 probe / D2 harness 경로 / D3 재실행 계약 / D7 규약 / D8 전역 규칙 확인
- .claude/skills/stack-guard/assets/design-gate-conformance.mjs — D1 환경 실패 승계(spawn 실패 → exit 2)
- .claude/skills/stabilize-milestone/SKILL.md                   — D4 `[Guard-drift]`
- docs/00-meta/GUARDRAILS_STRATEGY.md                           — D5 유지 주기 표 / D6 배치 기준
- .gitattributes                                                — D8 전역 줄바꿈 규칙

## Mutation Contract (ADR-047 D3)
1. **Target** — stack-guard SKILL 수행-5(smoke test 판정 + `probe smoke:` 기록)·수행-1/2(도구 config 생성)·수행-4(`.gitattributes` 전역 규칙 확인)·신설 `## 재실행 계약` / `design-gate-conformance.mjs` 의 spawn 실패 분기 / stabilize SKILL §1.0 8번째 항목 / GUARDRAILS 유지 주기·배치 기준 단락 / `.gitattributes` 전문.
2. **Failure mode** — (a) 4단계 커버리지를 산문 추론으로 판정해 검사 누락이 통과됨 (b) 소스 0개 정상 상태가 `WIRING FAIL`로 오분류돼 lifecycle이 막힘 (c) harness 자산 포맷으로 design gate digest가 깨져 게이트가 `wiring-fail`로 굳음 (d) 프로젝트 성장 후 `validate`가 절반만 검사하면서 "통과"를 보고함 (e) 확장자 열거 누락으로 fresh clone이 CRLF 체크아웃돼 형식 검사가 코드 변경 없이 실패함.
3. **Predicted improvement** — probe 회차별 판정이 실측 결과로 채워짐 / 소스 0개·brownfield 기존 위반 상태에서 stack-guard가 종료하지 않음(미도달 회차가 `PROBE FAIL` 대신 단독 실행 재측정 또는 `SKIPPED(미도달)`로 분류됨) / 단계 부재가 `SKIPPED`가 아니라 `missing: <단계>`로 드러남 / `probe smoke:`가 `PROBE FAIL`·`PARTIAL`·`SKIPPED`(또는 줄 부재)로 남으면 다음 마일스톤에 `[Guard-drift]`로 회수됨(`PROBE OK, PROJECT FAIL`은 정상이므로 회수 대상이 아니다) / design gate digest 불일치가 도구 config 단계에서 예방됨 / `[Guard-drift]`가 registry 경로 부재를 마일스톤마다 감지 / `git check-attr eol`이 전 텍스트 확장자에서 `lf`를 반환.
4. **Preserved invariants** — 기존 도구 미덮어씀 정책 / `Needs Install` graceful fallback / e2e 5상태 판정(ADR-052#amend-1) / design gate capability version·digest 정책(ADR-058#amend-2) / stabilize read-only 계약 / adapter 코드 불변(digest 안정) / **secret scanner의 harness 경로 포함**(D2 배제는 포맷·타입·커버리지 한정) / 프로비저닝 단계 빈 케이스의 비차단 등급 / **졸업 게이트 무증설** — ADR-014의 5+1 항목은 그대로이며 본 ADR은 기록·권고까지만 한다.
5. **Falsifying evaluation** — 실패 유형은 *모양 실패*(규칙을 따르려 하나 출력 형태가 틀림)이므로 금지문이 아니라 긍정 레시피(실행별 판정 표 + 기대값)로 작성했다(ADR-047#amend-1). 검증: 소스 0개 green-field와 기존 위반이 있는 brownfield 두 fork에서 `/stack-guard`를 실행해 (a) 1회차의 위반 probe 경로가 진단에 등장하는지(범위 확인 통과) (b) 각 실행이 해당 단계에서 그 경로를 지적하는지 (c) 마지막 실행에서 준수 probe에 귀속된 진단이 0건인지 (d) brownfield에서 전체 exit code가 1이어도 도달한 단계는 `PROBE OK, PROJECT FAIL`, 미도달 단계는 `PARTIAL`/`SKIPPED(미도달)`로 분류되고 **`PROBE FAIL`이 아닌지** (e) 생성한 probe 파일이 종료 후 전부 부재인지 (f) 기존 format 위반이 있는 brownfield에서 뒤 단계 회차가 **단독 실행으로 재측정**되는지 (g) 종료 후 `STACK_SETUP_PLAN.md`에 `probe smoke:` 줄이 실제로 남는지를 확인한다. **1회차 (a)가 범위 밖으로 나오면 probe 배치 경로를 고치고, brownfield에서 `PROBE FAIL(pass)`가 나오면 5-b 판정 단위를 되돌린다.**
6. **Rollback path** — 본 ADR superseded + stack-guard 수행-5를 단일 `validate` 1회 실행 판정으로 복귀 + stabilize §1.0 8번째 항목 제거(GUARDRAILS 표·`.gitattributes` 전역 규칙은 무해 잔존).

## 정책 강도 (ADR-022)
- **제약(강) — [관측됨]**: D1 probe(판정 절차 고정 + 환경 실패 승계)·D2 harness 경로 배제·D8 전역 줄바꿈 규칙. 셋 다 관측된 실패에 근거한다.
- **enabling(약)**: D3 재실행 계약(문서화)·D4 `[Guard-drift]`(report-only)·D5 안내·D6 배치 기준·D7 규약. 자동 차단 없음.

## 참고
- ADR-014(졸업 게이트 — **본 ADR은 여기에 새 항목을 넣지 않는다**; probe 미검증은 D4 (d)의 기록·권고 경로로 처리), ADR-021(정적 분석·secret scanner 권장), ADR-022(Ratchet), ADR-047 D1·D8(Executability·Oracle Adequacy), ADR-052#amend-1(e2e 5상태 — 프로비저닝/졸업 2단 판정의 원형), ADR-054(실행 single-origin 원형), ADR-058#amend-2(design gate capability·digest), ADR-059 D2(Flutter 겸업 단계·source root drift 경고의 원형).
