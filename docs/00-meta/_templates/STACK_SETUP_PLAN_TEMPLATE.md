# Stack Setup Plan
<!-- 본 파일은 /bootstrap-stack이 docs/00-meta/STACK_SETUP_PLAN.md를 *최초 생성*할 때 복사하는 template.
     baseline에는 본 template만 존재. 실제 STACK_SETUP_PLAN.md는 스택 결정 후 생성된다. -->

> 모드: Reference (스택 설정 절차 + 자동화 권장)

## Dependency Tools
<!-- scope → 의존성 도구 SSOT (ADR-051#amend-4). 정보 흐름: `/bootstrap-stack`이 확정 도구를 기록 →
     `/stack-guard`가 실제 lockfile과 교차 확인·보완 → `/plan-workitem`이 설치 line item의 도구를 이 표에 맞춤 →
     `/implement-workitem` 3-DT가 slice별로 회수해 builder에 전달 → builder는 지정 scope 도구만 실행.
     모노레포는 scope별 1행(경로 prefix), 단일 패키지는 `.` 1행. 비-JS 스택도 같은 표에 적는다.
     적는 대상은 *builder가 프로젝트·기능 의존성을 설치할 때 쓰는 PM*뿐 — 검증 도구 자체를 설치하는 PM은
     그 도구의 registry(`## Design Gate Adapter` 등)가 기록하므로 이 표에 넣지 않는다(ADR-059 D2).
     예: Flutter 루트는 pubspec.lock·package-lock.json이 함께 있어도 `pub` 1행이다.
     근거 컬럼엔 그 판정을 뒷받침한 *tool-specific* 신호(lockfile·tool-manifest)를 적는다 — 일반 manifest만으론 단정 금지.
     lockfile이 아직 없는 green-field는 `(신규 — lockfile 미생성)`. 표↔저장소 불일치는 자동 수정하지 않고 사용자 결정.
     도구 *선택 근거*는 ARCHITECTURE `## 7. 기술 선택`, 설치 소유 경계는 ADR-052. -->
| scope | 도구 | 근거 (lockfile / tool-manifest) |
|-------|------|----------------------------------|
| (예: `.`) | (예: npm) | (예: `package-lock.json`) |
| (예: `apps/api`) | (예: uv) | (예: `uv.lock`) |

## 외부 의존 부트업 (DB / Redis / S3 등, ADR-025)
`/bootstrap-stack`이 스택 감지 시 다음 권장 출력:
- Postgres: `docker-compose.yml` 또는 `supabase start` 권장.
- Redis: `docker-compose.yml` 권장.
- S3: localstack 또는 MinIO 권장.

사용자가 채택 시 README에 1단락 + `make dev` / `pnpm dev` 등의 통합 진입점에 wiring.

## 통합 명령 사용법
스택 확정 후 `/stack-guard`가 생성하는 통합 검증 명령:
```
pnpm validate   # 또는 npm run validate / make validate / task validate
```
visual-qa: <READY | PENDING (<사유>)> (<YYYY-MM-DD>)   <!-- UI/web 대상만. /stack-guard 가 매 실행 기록·갱신 (ADR-058#amend-3 결정 5). 비-UI 는 이 줄을 삭제한다. -->

## Design Gate Adapter
<!-- UI 프로젝트에서만 /stack-guard가 채우는 실행 registry (ADR-058#amend-2).
     bootstrap-design R2-G/R6와 plan-milestone R5-5는 command template을 그대로 사용하며 경로를 추측하지 않는다.
     비-UI면 status=n/a만 기록하고 adapter/entry를 생성하지 않는다.
     UI에서 current version·source digest·fixed conformance 중 하나라도 확인되지 않으면 승인·프로토타입 승격을 보류한다. -->
| field | value |
|-------|-------|
| status | `n/a` (`ready` / `needs-install` / `wiring-fail`) |
| command template | (예: `pnpm validate:design -- <html...>`) |
| adapter path | (canonical asset을 복사한 project-native path) |
| output path | (screenshots/result path) |
| capability version | `ADR-058#amend-2/v2` |
| source digest | (canonical asset SHA-256; non-canonical override면 근거) |
| conformance | (fixed-suite 결과·실행 시각) |

## CI (ADR-025#amend-1)
- CI: <generated (.github/workflows/validate.yml) | existing (preserved) | opt-out (사용자 지정) | n/a (<사유>)>
<!-- git remote가 GitHub이고 스택이 확정되면 /stack-guard 가 기본 생성한다. --no-ci 로 opt-out.
     기존 파일은 덮어쓰지 않고 `existing (preserved)`로 기록한다. 생성 YAML은 런타임 setup → 의존성 설치 → 통합 validate 3단계를 포함한다. -->

`/stack-guard`가 위 조건 충족 시 아래 형식으로 생성한다(미충족 시 텍스트만 출력):

```yaml
# .github/workflows/validate.yml (생성 형식)
name: validate
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4  # 스택에 맞는 런타임 setup (setup-python/setup-go/flutter-action 등 1종)
        with:
          node-version: <버전>
      - run: <의존성 설치 명령>
      - run: <stack의 validate 명령>
```

GUARDRAILS_STRATEGY *"OS/셸 종속 hook 강제 X"* 정신 — 조건 미충족 시 권장만.

## Optional MCP Connectors
<!-- 기본 자동 연결 X (ADR-043). RCE급 도구(예: Playwright browser_run_code_unsafe)는 신뢰 클라이언트 한정. secret은 .env(커밋 X).
     연결 절차(ADR-043 + ADR-048, 전용 skill 없음 — 1회성 셋업): (a) researcher(ADR-040)로 해당 능력의 최신 공식 MCP 설정 조회; (b) Claude(`claude mcp add <name> --scope project` 또는 `.mcp.json`) + Codex(`.codex/config.toml [mcp_servers.<name>]`) 설정을 *사용자가 직접 실행*; (c) project ADR(ADR-1NN)에 purpose/official docs/scope/read-only/secret/왜 기록 + project README 인덱스 갱신; (d) 아래 표에 행 추가;
     (e) **사용 강제 셋업 (ADR-048#d2)**: `lifecycle usage`(어느 phase/skill이 어떤 capability에 이 MCP를 우선 쓰는가) 결정 + `agent access` 부여 — (1) 해당 skill `allowed-tools`에 `mcp__<server>__*` 추가(Claude: SKILL frontmatter / Codex: `.codex/config.toml` permissions) + (2) **acceptEdits 기본 모드는 MCP 호출에 confirm을 요구**하므로(GUARDRAILS) fork sub-agent의 비대화 자율 호출이 필요한 *read-only* MCP 도구를 `.claude/settings(.local).json` `permissions.allow`에도 등재(RCE급 도구는 등재 X). 둘 다 안 하면 plan은 line item만 박고 implement는 `Needs MCP Access`로 멈춘다. read-only default 유지·secret은 .env. -->
| name | purpose | official docs | scope | read-only | secret | lifecycle usage | agent access | smoke check | last-verified |
|------|---------|---------------|-------|-----------|--------|-----------------|--------------|-------------|---------------|
| (예: jetbrains) | IDE 연동 | (URL) | project | - | - | (예: implement — 코드 심볼 조회) | (예: implement-workitem / main-session) | - | - |

> Flutter/Dart 프로젝트는 공식 Dart & Flutter MCP 서버를 이 표에 등재할 수 있다(Dart 3.9 이상 필요). 앱 조작 기능을 쓰려면 앱 코드에 개발 빌드에서만 켜지는 진입점을 두고 배포 빌드에서 제외한다. 공식 Agent Skills·plugin은 기본 의존이 아니라 opt-in이며, 도입 전 포함된 rules 본문·자동 등록되는 MCP capability·기존 lifecycle skill과의 역할 중복을 감사한다. 충돌 시 본 저장소의 lifecycle skill이 우선한다.

## Dart Source Roots
<!-- **Dart/Flutter 스택이 아니면 이 절을 통째 삭제한다** (순수 Dart CLI·패키지는 남긴다 —
     `dart format` 대상이 있으면 필요하다). ARCH `## 7-1`~`## 7-5`의 비해당 sub-section
     삭제 규칙과 동형이며, /bootstrap-stack이 이 template을 복사할 때 수행한다.
     **아래 `## Golden 초기 절차`의 조건은 이 절보다 좁다** — 화면이 있는 native 스택에서만
     남긴다(자세한 조건은 그 절의 주석). (`## E2E Smoke Registry`는 스택 무관이라 남긴다 —
     비대상이면 `status: n/a`만 적는다. `## Design Gate Adapter`와 같은 방식.)
     Flutter/Dart 코드에서 `dart format` 대상이 되는 경로 목록.
     `.`을 쓰지 않는다 — 생성 디렉터리 순회 실패와 긴 경로 문제를 피하고,
     존재하는 소스 루트를 빠짐없이 포함하기 위해 명시 열거한다.
     `pubspec.yaml`이 여러 개인 저장소(monorepo)는 pubspec 하나당 한 묶음을 적고
     경로는 그 pubspec 디렉터리 기준 상대경로로 쓴다.
     존재하지 않는 경로는 실행 wrapper가 제외한다. -->

| pubspec 위치 | 경로 | 비고 |
|---|---|---|
| (예: . 또는 apps/mobile) | (예: lib) | |

**루트 누락 점검 (매 검증 실행 시)**: 실제 소스 트리가 이 표보다 넓어지면 새 코드가 형식 검사에서 조용히 빠진다. 표를 신뢰하기 전에 아래로 대조하고, 표에 없는 디렉터리가 나오면 표를 먼저 갱신한다.

```bash
# pubspec 디렉터리에서 실행 — 최상위 Dart 소스 디렉터리 실제 목록
find . -name '*.dart' -not -path './.dart_tool/*' -not -path './build/*' \
  | cut -d/ -f2 | sort -u
```

## E2E Smoke Registry
<!-- 졸업 판정이 "실제로 e2e가 돌았는가"를 확인할 때 쓰는 등록부.
     선언한 runtime target마다 한 행을 적는다(`native/android`와 `native/ios`를 함께 내면 두 행).
     canonical 값은 web / native/android / native/ios / desktop / none이며 `native` 단독은 적지 않는다(ADR-059 D8).
     판정도 행마다 따로 난다 — 한 target의 통과를 다른 target 근거로 쓰지 않는다.
     이 표는 판정을 *좁히는* 수단이다 — 등록이 있으면 그 이름의 테스트가 성공했는지까지
     확인하고, 없으면 "선언된 e2e 디렉터리 하위에서 1개 이상 성공"만 확인한 뒤
     P1 [E2E-registry] 를 기록한다. 미등록 자체로 졸업을 막지 않는다.
     실행 대상 칸에는 재부팅하면 달라지는 임시 id(`emulator-5554` 등)를 적지 않고
     "무엇을 고를지"의 규칙을 적는다. 이 칸은 사람이 읽는 기록이며
     실행 명령에 그대로 들어가지 않는다(진입점은 -d 를 생략한다).
     마지막 PASS 칸은 host 제약으로 지금 실행할 수 없는 target의 증거를 보존한다.
     **유효 조건은 하나 — 기록된 커밋이 지금 판정하려는 커밋과 정확히 같을 때만 인정한다.**
     다르면 다시 BLOCKED_ENV다. "코드가 바뀌었는지"를 사람이 판단하게 두지 않는다
     (판단 여지를 주면 증거가 슬며시 늘어난다 — ADR-059 D4). -->

| runtime target | status | smoke 파일 경로 | 테스트 이름 | 실행 대상 선택 규칙 | 마지막 PASS (host·날짜·커밋) | 등록일 |
|---|---|---|---|---|---|---|
| (예: native/android) | ready / n/a | (예: integration_test/boot_smoke_test.dart) | (예: BOOT_SMOKE) | (예: 연결된 Android device 1대) | | |
| (예: native/ios) | ready / n/a | | | (예: 부팅된 iOS 시뮬레이터 1대, host가 macOS일 때만) | (예: macos · 2026-07-28 · abc1234) | |
| (예: web) | ready / n/a | (예: e2e/smoke.spec.ts) | | (예: chromium) | | |

## Golden 초기 절차 (해당 시)
<!-- **화면이 있는 native 스택에서만 남긴다** — runtime target에 `native/*`가 포함되고
     design surface가 있을 때. golden은 위젯 렌더 픽셀 비교라 화면 없는 Dart CLI·패키지에는
     `flutter test --update-goldens` 자체가 성립하지 않으므로 그 경우 이 절을 통째 삭제한다
     (`## Dart Source Roots`는 그런 프로젝트에도 남는다 — 조건이 다르다. ADR-059 D3).
     golden 정답 사진은 커밋하지 않으며 머신마다 로컬 생성한다.
     새 체크아웃 직후 첫 validate는 정답 사진 부재로 실패한다.
     `flutter test --update-goldens`를 1회 실행하고
     생성된 이미지를 육안 확인한 뒤 진행한다.
     재생성은 (a) 정답 사진이 아직 없을 때, (b) UI를 의도적으로 바꾸고
     새 모습을 육안 확인했을 때만. 실패를 통과시키려고 덮어쓰지 않는다. -->
