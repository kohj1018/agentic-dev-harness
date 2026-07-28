# ADR-059 — Flutter/모바일 프로파일 (Android·iOS 직접 지원)

> scope: boilerplate
> area: tooling

## Status
accepted

## 배경
- ADR-031은 mobile native(Flutter 포함)를 *기본 자동화 직접 지원 범위 밖*으로 두고 fork override 경로만 제시했다. 그러나 그 override 절차는 **구현 surface가 없다** — `--override` 발화를 처리하는 skill이 없고, ADR-031에는 `## Surfaces` 블록도 없어 참조 정합 검사가 이 결손을 잡지 못한다.
- [관측됨] 그 사이 도입된 constraint 3종(ADR-052 D3 e2e 졸업 hard-block / ADR-058 D3 design gate fail-closed / ADR-056 결정 3 경험계약 입구 차단)은 ADR-031이 상정하지 않은 것이며, override 지침이 이들을 다루지 않는다.
- [관측됨] Flutter 실측(Flutter 3.44.8 / Dart 3.12.2, Windows 11 + macOS)에서 다음이 확인됐다.
  - 색상 하드코딩 grep이 `.dart`를 검사 대상에 포함하지 않아 **위반 3종 전부 침묵**했다(결과는 "위반 없음"으로 보고됨).
  - `flutter test <e2e디렉터리>`에서 그 디렉터리가 **비어 있으면 유닛 테스트 디렉터리가 대신 실행되고 exit 0**이 나온다. **device 연결 여부와 무관하다** — Android 에뮬레이터를 띄운 상태에서도 같았다(`--machine` 스트림의 suite 경로가 `test/widget_test.dart`·`test/golden_test.dart`이고 `done.success=true`). 즉 종료코드도, device 준비 상태도 "e2e가 돌았는가"의 근거가 되지 못한다.
  - `dart format .`이 iOS 생성 경로 순회 중 실패한다(긴 Windows 경로, 전체 277자). 등록된 source root를 명시하면 정상이나, `lib test`만 지정하면 e2e 디렉터리의 위반을 놓친다.
  - `flutter analyze`의 심각도별 종료코드는 아래와 같다(fork 실측 — 진단 1건씩 넣어 플래그 조합별로 측정).

    | 진단 심각도 | 기본 | `--no-fatal-infos` | `--no-fatal-warnings` | 둘 다 |
    |---|---|---|---|---|
    | info (lint 대부분) | 1 | **0** | 1 | 0 |
    | warning | 1 | 1 | **0** | 0 |
    | error | 1 | 1 | 1 | **1** |

    즉 **`--no-fatal-warnings` 하나만으로는 "에러만 차단"이 되지 않는다** — `flutter_lints`가 내는 진단은 대부분 `info`라서 그대로 exit 1이다. "에러만"을 원하면 `--no-fatal-warnings --no-fatal-infos` 둘을 다 붙여야 한다.
  - golden(픽셀 비교)은 같은 머신에서 5/5 동일하지만 **OS가 다르면 전부 불일치**한다(1.35%~3.33%). 실제 폰트를 로드해도 마찬가지다.
  - 통합 검증 실행 껍데기 중 **npm만 종료코드 0/1/2를 보존**한다. task는 0/201/201, make는 0/2/2로 뭉갠다(Windows·macOS 동일).
  - 웹 프로젝트가 있는 저장소에 Flutter 소스를 추가해도 웹 검증 시간·결과는 변하지 않는다(교대 반복 5쌍, median 차 -8ms).

## 결정

### D1. 지원 범위
- **Android + iOS**를 직접 지원 범위에 넣는다. Flutter web·desktop은 대상이 아니다.
- 웹 프로젝트는 기존 경로(web frontend / API / CLI / monorepo / Supabase)를 그대로 쓴다.
- 지원 OS는 **Windows + macOS**. Linux는 대상이 아니다.
- 본 결정은 ADR-031의 "mobile native = 기본 자동화 범위 밖"을 **Flutter에 한해 해제**한다. 나머지(iOS Swift·Android Kotlin·RN·ML·embedded·game·desktop)는 ADR-031 그대로다.

### D2. 통합 검증 명령
- 실행 껍데기는 **npm**으로 고정한다. 근거 둘: ① design gate가 exit 0/1/2를 구분해야 하는데 task·make는 이를 각각 201·2로 뭉갠다(Windows·macOS 동일 관측) ② design gate 때문에 Node가 이미 필수 의존이므로, 여기에 다른 러너를 하나 더 얹는 것보다 하나로 두는 편이 단순하다(ADR-006). `validate:design`만 npm으로 하고 나머지를 다른 러너로 두는 혼합안도 가능하나, 도구 두 개를 관리하는 비용을 지불할 이득이 없다.
- `validate` 구성(순서 고정):
  1. `dart format --output=none --set-exit-if-changed <등록된 Dart source root 전부>`
  2. `flutter analyze` — **플래그 없이 기본값**을 쓴다
  3. `flutter test`
- **lint 단계에 `--no-fatal-*` 플래그를 붙이지 않는 이유**: 배경의 실측 표대로 `flutter_lints`의 진단은 대부분 `info`라서, 완화 플래그를 붙이면 lint 단계가 사실상 타입 에러만 보게 되고 그건 `flutter test`가 대체로 잡는다. **웹 스택의 lint 단계는 스타일 위반에서 차단**하므로 같은 강도를 유지하는 쪽이 정합적이다(사용자 결정: 속도보다 품질). `flutter create` 직후 프로젝트는 기본 `flutter analyze`를 통과한다(fork 실측 exit 0).
- 다만 **기존 코드가 많은 프로젝트를 이관하면 info가 쏟아질 수 있다.** 그때는 `--no-fatal-infos`로 일시 완화할 수 있으나 **완화했다는 사실과 해제 조건을 `STACK_SETUP_PLAN.md ## 통합 명령 사용법`에 적는다** — 조용히 약한 상태로 굳는 것을 막는다.
- **`dart format .`을 쓰지 않는다.** 대상은 `STACK_SETUP_PLAN.md ## Dart Source Roots`에 등록된 경로 목록이며, 존재하지 않는 경로는 wrapper가 제외한다. `lib test`처럼 일부만 고정하지 않는다(e2e·bin·tool 디렉터리의 위반을 놓친다).
- 명시 열거의 대가는 **표가 늙는다**는 것이다. 새 최상위 소스 디렉터리가 생겼는데 표에 없으면 그 코드는 형식 검사에서 조용히 빠진다. 그래서 검증을 돌릴 때마다 실제 Dart 파일의 최상위 디렉터리 집합과 표를 대조하고, 표에 없는 것이 나오면 표를 먼저 갱신한다(대조 명령은 STACK_SETUP_PLAN 템플릿의 같은 절에 있다).
- **`flutter analyze`가 typecheck를 포함**한다. 별도 typecheck 단계를 요구하지 않으며, 4단계 점검에서 typecheck 누락으로 보고하지 않는다.

### D3. golden(픽셀 비교)
- 도입한다. 정답 사진은 **커밋하지 않는다**(`.gitignore` 대상). 머신마다 자기 기준선을 갖는다.
- golden 테스트는 `flutter test`에 포함되므로 `validate`에서 자동 실행된다. 태그 분리·기준 OS 선언은 두지 않는다.
- 새 체크아웃 직후에는 정답 사진이 없어 실패한다. 이때 1회 `flutter test --update-goldens`로 생성하고 **생성된 이미지를 사람이 확인**한 뒤 진행한다.
- **재생성 규율**: `--update-goldens`는 (a) 정답 사진이 **아예 없을 때**, 또는 (b) UI를 **의도적으로 바꾼 뒤 변경 결과를 확인했을 때**만 실행한다. 정답 사진이 있는데 실패했다고 해서 통과시키려고 덮어쓰지 않는다.
- **한계(사실 기록)**: 정답 사진을 추적하지 않으므로 *새 머신·새 체크아웃에서 첫 생성 시점*에 이미 들어와 있던 회귀는 정상으로 굳는다. 검출 범위는 **한 머신에서 기준선 생성 이후 발생한 변화**다. 이 범위를 넓히려면 정답 사진을 OS별로 나눠 커밋해야 하는데, 그러면 두 머신 모두에서 승인·갱신이 필요해진다. 현재 구성(단독 작업·자동 실행 서버 없음)에서는 추적하지 않는 쪽을 택했다.
- golden 테스트 위젯에는 `debugShowCheckedModeBanner: false`를 준다(디버그 리본이 이미지에 찍힌다).
- **존재 강제는 하지 않는다**: golden 테스트가 0개인 프로젝트는 그대로 통과한다. 작성한 golden이 있으면 `validate`에서 강제될 뿐이다. 접근성 guideline 테스트도 같다(D5).

### D4. e2e
- `integration_test`(Flutter SDK 동봉)를 기본으로 한다. 권한 대화상자·시스템 알림 등 OS UI 조작이 AC에 등장하면 Patrol을 추가한다.
- **의존성**: `integration_test`는 SDK 동봉이지만 `pubspec.yaml`의 `dev_dependencies`에 `integration_test: {sdk: flutter}`를 명시해야 import가 성립한다. 진입점·smoke를 만들 때 의존성 추가와 `flutter pub get`을 함께 수행한다.
- **판정 입력은 `--machine` 구조화 출력**이다. 사람이 읽는 진입점(`validate:e2e`)은 기본 리포터를 쓰고, **판정하는 쪽이 `--machine`을 덧붙여 다시 호출**한다(npm 진입점이므로 `npm run validate:e2e -- --machine` 형태로 전달된다).
- **판정 계약 — 상태 정의와 판정 순서는 `ADR-052#amend-1` 결정 3이 SSOT다. 여기서는 그 순서의 각 항을 `--machine` 스트림으로 *어떻게 관측하는가*만 정한다(재선언 아님).** 앞 항에서 걸리면 뒤 항을 보지 않는다. **순서를 뒤집으면 환경 문제를 "테스트 없음"으로 오분류한다**(아래 실측 참조).
  1. **러너가 기동했는지** (SSOT 1항) — 첫 `start` 이벤트에 `protocolVersion`이 있는가. 없거나 파서가 모르는 major 버전이면 여기서 멈추고, 원인이 device·toolchain 등 환경이면 **`BLOCKED_ENV`**(예: `stderr`의 `No devices are connected`), 진입점·config 부재면 **`FAIL(wiring)`** 로 확정한다. 원인을 함께 보고한다. **이때 `EMPTY`로 분류하지 않는다** — 테스트가 없는 것이 아니라 실행 자체가 불가능한 것이고, 처방이 다르다(작성 vs 환경 복구 vs 배선 수정).
  2. **e2e가 실제로 돌았는지** (SSOT 2항) — `suite` 이벤트의 `path`를 정규화(구분자 통일)했을 때 **선언된 e2e 디렉터리 하위**인 suite에 속한(`testStart.test.suiteID` = 그 suite `id`) 테스트 중, `testDone`이 `hidden=false` · `skipped=false`인 것이 1개 이상인가(**`result`는 보지 않는다 — 실패한 테스트도 "실행됨"이다**). 0개면 **`EMPTY`**. **이 항이 실측 결함의 차단 지점이다** — 빈 디렉터리를 지정하면 러너가 유닛 테스트 디렉터리를 대신 실행하고 `done.success=true` + exit 0을 내는데, 그때 suite 경로가 e2e 디렉터리 밖이라 여기서 걸린다. **suite 파일은 있는데 그 안에 `test()`가 없어 세어질 테스트가 0개인 경우도 `EMPTY`다** — SSOT의 판별자는 suite 개수가 아니라 *실행된 테스트* 개수다.
  3. **그 테스트가 성공했는지** (SSOT 3항) — 2항에서 센 테스트 중 `result="success"`인 것이 1개 이상인가. 0개면 **`FAIL(project)`**.
  4. **러너 전체가 성공했는지** — 마지막 `done` 이벤트가 `success=true`인가. 아니면 **`FAIL(project)`**.
  - 넷을 모두 통과하면 `PASS`다.
  - `testDone`에는 테스트 이름도 suite 경로도 없다. **`suite` → `testStart` → `testDone`을 id로 상관지어야** 판정이 성립한다.
  - 출력 문자열 매칭은 상태 *설명*에만 쓰고, 그것만으로 `PASS`를 만들지 않는다.
  - **[관측됨] 이 순서를 안 지키면 실제로 오분류한다**: 빈 `integration_test/`는 `protocolVersion=0.1.1` + suite `test/widget_test.dart` + `done.success=true` → 2항에서 `EMPTY`. smoke를 넣고 device를 연결하지 않으면 스트림이 아예 비어 `protocolVersion`이 없고 exit 1 → 1항에서 `BLOCKED_ENV`. 순서 없이 suite 개수만 세면 후자도 `EMPTY`가 되어 "테스트를 쓰라"는 잘못된 처방이 나간다.
- **registry는 필요조건이 아니라 강화 수단이다.** `STACK_SETUP_PLAN.md ## E2E Smoke Registry`에 canonical smoke가 등록돼 있으면 위 3항을 *"등록된 smoke 이름과 일치하는 테스트가 성공"* 으로 좁혀 판정한다. 등록이 없으면 **3항을 이름 제약 없이 적용하고**(= 선언된 e2e 디렉터리 안의 아무 테스트든 1개 이상 성공) `P1 [E2E-registry] <target> — canonical smoke 미등록, /stack-guard로 등록 권장`을 기록한다. **등록 부재만으로 졸업을 차단하지 않는다** — 실제로 e2e를 갖고 통과하던 기존 프로젝트를 서류 미비로 막는 것은 ADR-022 ratchet 위반이고, 위 2항만으로 실측 결함은 이미 막힌다.
- **플랫폼별 판정**: 선언된 runtime target마다 각각 `PASS`여야 한다. Android만 통과하고 iOS가 미실행이면 iOS는 `EMPTY` 또는 `BLOCKED_ENV`이며 졸업은 차단된다.
  - **기본 전제는 "한 마일스톤을 한 머신에서 끝낸다"** 다. iOS는 빌드 자체가 macOS + Xcode 전용이므로, **iOS를 target으로 선언한 마일스톤은 macOS에서 작업한다** — 그러면 host 이동도, 증거 이관도 필요 없다.
  - 그럼에도 Windows에서 진행하다 iOS 판정만 남는 상황이 생기면 iOS는 `BLOCKED_ENV`로 남는다. 이때만 예외로, macOS에서 1회 수행한 결과를 registry의 `마지막 PASS(host·날짜·커밋)` 칸에 적어 증거로 쓴다. **유효 조건은 하나 — 기록된 커밋이 지금 판정하려는 커밋과 같을 때만** 인정한다. 다르면 다시 `BLOCKED_ENV`다(코드가 바뀌었는지 사람이 판단하게 두지 않는다).
- registry의 실행 대상 칸에는 `emulator-5554` 같은 **임시 id를 적지 않고** 선택 규칙(예: `연결된 android device 1대`)을 적는다. **단 이 칸은 사람이 읽는 기록이며 실행 명령에 그대로 들어가지 않는다.**
  - **진입점은 `-d`를 아예 생략한다.** 러너가 *`integration_test`를 지원하는 device로 후보를 좁힌 뒤* 하나만 남으면 자동 선택한다. **[관측됨]** `emulator-5554`(android) + `windows` + `chrome` + `edge` 네 device가 붙은 상태에서 `-d` 없이 실행했고 오류 없이 android emulator가 선택돼 통과했다 — 데스크톱·웹 device는 후보에서 걸러진다.
  - 후보가 둘 이상 남으면(예: android emulator 2대) 모호해지므로 그때 호출 측이 `-- -d <id>`로 지정한다. `-d`의 값은 **device id 또는 이름 접두사**만 허용되며 자연어 규칙은 명령으로 성립하지 않는다(`-d emulator-5554` 명시 호출도 동일하게 통과 — 실측).

### D5. 접근성
- `flutter_test`의 Accessibility Guideline API 4종(`androidTapTargetGuideline` / `iOSTapTargetGuideline` / `labeledTapTargetGuideline` / `textContrastGuideline`)을 위젯 테스트에 넣는다.
- 웹의 axe에 해당하는 자동 검사기가 없으므로, 자동으로 못 보는 부분은 **수동 검사 항목**으로 이관한다: TalkBack(Android)·VoiceOver(iOS)·Android Accessibility Scanner·Xcode Accessibility Inspector.

### D6. 색상 하드코딩 검출
- 문자열 검색(grep) 방식으로 `.dart`를 검사 대상에 넣는다. 판정은 **기록만** 하며 진행을 차단하지 않는다.
- 한계(사실): grep은 문법을 이해하지 못해 **주석·문자열 리터럴 안의 색값도 함께 잡는다**(실측 2/2 오탐). 차단 등급의 전제인 오탐 0을 만족하지 못하므로 기록 등급으로 둔다. 문법을 이해하는 검사가 필요하면 수단은 두 가지다 — Dart의 **공식 analyzer plugin 방식**과 별도 패키지인 **`custom_lint`**. 둘은 같은 것이 아니며 선택 시 각각의 설치·작성 방식을 확인해야 한다.

### D7. 모바일 결정 자리
- `ARCHITECTURE_OVERVIEW.md`에 `## 7-5. 모바일 클라이언트 결정`을 신설한다. 채움/삭제 규칙은 기존 `## 7-1`~`## 7-4`와 동일하다(해당 없으면 통째 삭제).
- `## 7-4. 프론트 결정`은 웹 전용으로 유지한다. Flutter 프로젝트는 `## 7-4`를 삭제하고 `## 7-5`를 채운다.

### D8. 프로젝트 유형 판정의 축 분리
- 기존의 "UI 프로젝트인가" 단일 축을 다음 세 축으로 분리한다. 세 축은 상호배타가 아니며 동시에 참일 수 있다.
  - **design surface**: 시각 설계 산출물을 갖는 프로젝트인가. **판정 절차는 기존 그대로 ADR-027#amend-3**(DESIGN.md 존재 → status → 추가 신호)이며 본 ADR이 새 판정 규칙을 만들지 않는다. 이 축이 참이면 design gate(정적 HTML 대상) 대상이다.
  - **runtime target**: 앱이 실제로 도는 곳. canonical 값은 `web` / `native/android` / `native/ios` / `desktop` / `none`이며 한 프로젝트가 여러 개를 선언할 수 있다. `native/*`는 값이 아니라 그 둘을 묶는 **클래스 표기**다 — toolchain 분기는 `native/*` 포함 여부로 하되 **e2e 판정과 registry 행은 개별 값 단위**로 낸다(위 플랫폼별 판정이 성립하는 지점). e2e 도구 선택의 근거.
  - **host environment**: 작업 머신(windows / macos). 실행 가능 범위의 근거.
- design gate(Playwright + axe)는 **정적 HTML만** 대상으로 한다. runtime target이 `native/*`면 앱 e2e를 Playwright에 배선하지 않는다.
- **두 축을 헷갈리면 게이트가 영구히 막힌다**: design surface가 있으면 runtime target이 `native/*`든 `web`이든 **Chromium 바이너리가 필요하다**. canonical adapter는 모듈만 있고 브라우저가 없으면 `exit 2`(실행 불가)를 내고, 그 상태는 registry `status: needs-install`로 굳어 디자인 산출물 승인이 보류되며, 그 보류가 프로토타입 승격과 task 분해까지 연쇄로 막는다. 따라서 native 프로젝트에서 "브라우저를 설치하지 않는다"는 **앱 e2e 목적에 한한 말**이고, design gate 목적의 `npx playwright install chromium`은 target과 무관하게 수행한다.

### D9. 시크릿 취급 2단 분류
- **읽기 차단**(도구가 열지 못하게): Android 서명키(`*.jks`·`*.keystore`), 그 비밀번호(`key.properties`), iOS 배포 인증서·프로비저닝(`*.p12`·`*.mobileprovision`), 서버용 service account 키(`*-firebase-adminsdk-*.json`).
- **비밀로 취급하지 않음(단, 무해하다는 뜻은 아님)**: Firebase 클라이언트 설정(`google-services.json`·`GoogleService-Info.plist`). 이 키는 앱 바이너리에 담겨 배포되므로 숨기는 것이 방어가 되지 않는다. **대신 반드시 해야 하는 것은 키 사용 범위 제한이다** — Firebase/Google Cloud 콘솔에서 그 키가 호출할 수 있는 API를 제한하고, 데이터 접근은 Firebase 보안 규칙과 App Check로 막는다. 제한하지 않은 키는 공개돼도 되는 키가 아니다. 기본으로 git에서 빼면 **새 체크아웃에서 빌드가 깨지므로** 제외 대상에 넣지 않되, 커밋 여부와 키 제한 상태는 flavor·환경 분리 방식에 달린 **프로젝트 결정**이므로 ARCH `## 7-5`의 `### 빌드 flavor·환경변수`에 적는다.
- **차단 수단의 한계(사실)**: 도구 설정의 읽기 차단 목록은 에이전트의 파일 읽기 도구에 적용되며, 셸 하위 프로세스(`cat` 등)까지 막지는 못한다. **1차 통제는 "서명 자산을 저장소 밖에 두는 것"**이고 읽기 차단·git 제외는 보조 통제다.
- **도구별 비대칭을 메운다**: `.claude/settings.json`의 읽기 차단은 Claude Code에만 적용된다. Codex 쪽은 OS 강제가 불가해 `AGENTS.md`의 금지 한 줄에 의존하므로(ADR-010 D5·D8), 같은 목록을 그 줄에도 반영해야 두 도구가 동등해진다.
- **`.gitignore`는 이미 추적 중인 파일을 보호하지 않는다.** 기존 저장소에 서명 자산이 커밋돼 있으면 ignore 규칙을 추가해도 계속 추적된다. 그래서 규칙 추가와 함께 **`git ls-files`로 실제 추적 여부를 확인**하고, 발견 시 ① 저장소 밖으로 옮기고 ② `git rm --cached`로 추적 해제하며 ③ 이미 원격에 올라갔다면 **키 자체를 재발급**한다(히스토리에 남은 키는 ignore로 되돌릴 수 없다).

### D10. AI 도구
- Dart & Flutter MCP 서버는 `STACK_SETUP_PLAN.md ## Optional MCP Connectors`에 등재한 뒤 사용한다(ADR-048). Dart 3.9 이상이 필요하다. 앱 조작 기능은 `--dart-define` 게이트 뒤에 두어 배포 빌드에 포함되지 않게 한다.
- 공식 Flutter Agent Skills·plugin은 **기본 의존이 아니라 opt-in**이다. 도입 전 (a) 포함된 rules 본문 (b) 자동 등록되는 MCP capability (c) 기존 lifecycle skill과의 역할 중복을 감사한다. 충돌 시 **본 저장소의 lifecycle skill이 우선**한다.
- 공식 rules 문서는 통째로 흡수하지 않는다. 시각 지시(배경 노이즈·다층 그림자·glow 등)는 `DESIGN.md ## 9`의 금지 목록과 충돌하므로 **배제**한다. 코드 규율 중 필요한 항목만 ARCH `## 7-5`의 프로젝트 결정으로 옮겨 적는다.

### D11. 경로 길이
- Windows에서 프로젝트 루트 경로가 길면 iOS 생성 경로 순회가 실패한다(관측: 전체 277자에서 실패, 123자에서 정상). D2의 등록 source root 방식은 이 경로를 순회하지 않으므로 영향을 받지 않는다. 다만 프로젝트 루트를 짧게 두는 것을 권장한다.

### D12. 경험 게이트의 native degrade (숨기지 않고 기록한다)
- 마일스톤 안정화의 경험 게이트는 *앱을 띄우고 화면을 캡처해 승인 프로토타입과 대조*하는 절차이며, 기동 명령을 `package.json`의 `dev`/`start`에서 회수한다. **Flutter 앱에는 그 진입점이 없다.**
- 이번 라운드에서는 device 스크린샷 경로를 배선하지 않는다. 대신 **degrade를 명시 기록한다** — native 프로젝트에서 앱 기동 캡처는 `blocked-on-env`로 남고, 대조는 프로토타입 HTML을 `file://`로 렌더한 쪽만 수행한다. 실행 자체를 조용히 건너뛰지 않으며, 미실행 사유를 매번 출력한다.
- **이 결정은 skill 수정을 요구하지 않는다.** 경험 게이트는 이미 *"기동 명령 불명·실패면 `blocked-on-env` 라벨 + 미실행 사유 echo"* 경로를 갖고 있고, Flutter 프로젝트는 `dev`/`start` 스크립트가 없어 그 경로로 자연히 떨어진다. 본 결정은 그 결과가 *의도된 것*임을 기록하는 항이다 — 이 문장을 근거로 게이트 지시문을 고치지 않는다(웹 경로에 손대지 않기 위해서다).
- **이 결정으로 실제 잃는 것**: 구현 화면과 승인 프로토타입의 시각 대조가 native에서는 자동으로 서지 않는다. golden은 커밋하지 않으므로(D3) 대체 증거도 되지 못한다. 즉 이 구간은 사람이 눈으로 보는 것에 의존한다.
- 배선하려면 `flutter drive`/`integration_test`에서 스크린샷을 남기고 그 경로를 게이트에 넘기는 방법이 있다. 실사용에서 시각 회귀를 놓친 사례가 나오면 그때 붙인다(재검토 트리거 7).

## 대안과 트레이드오프
- **대안 A — ADR-031 그대로 두고 fork마다 override**: 보일러플레이트 변경이 0이지만, override 절차에 구현 surface가 없고 Flutter 프로젝트마다 같은 12곳을 다시 패치해야 한다. 기각.
- **대안 B — 별도 프로파일 문서 파일 신설**: Flutter 지시를 한 파일로 통독할 수 있으나, 웹 프로젝트가 쓰지 않는 파일을 계속 달고 다닌다. 기존 자리(ADR·ARCH `## 7-5`·STACK_SETUP_PLAN·skill 인라인)로 충분해 기각.
- **채택 — 기존 자리 분산 + ADR SSOT**: 새 파일·새 디렉터리 0개. 웹 프로젝트는 `## 7-5`를 삭제하고 skill 인라인 몇 줄만 더 읽는다. 대신 Flutter 지시가 네 곳에 나뉘므로 본 ADR의 `## Surfaces`가 위치 색인 역할을 한다.

## 신뢰도와 재검토
- **신뢰도: Medium** — 근거는 Windows 11 + macOS 26.3 / Flutter 3.44.8 / Dart 3.12.2 단일 조합의 실측이다. 프로젝트 1개 규모이고 다른 Flutter 버전·다른 팀 구성에서의 일반화는 확인되지 않았다.
- **재검토 트리거** — 아래 중 하나가 관측되면 해당 결정을 다시 본다.
  1. Flutter 관통 실사용에서 색상 검출이 fixture 3종 중 하나라도 놓침 → D6
  2. 빈 e2e 디렉터리가 `PASS`로 분류됨 → D4와 ADR-052#amend-1
  3. 웹 프로젝트 검증 시간·결과가 기준선 대비 변함 → D8과 skill 인라인 범위
  4. golden 정답 사진 재생성이 회귀를 덮는 사례 발생 → D3
  5. 자동 실행 서버(CI)나 두 번째 작업자가 생김 → D3(golden 추적 여부)·D2(broker)
  6. Flutter 메이저 버전 상승으로 `--machine` 스트림의 `protocolVersion` major가 바뀜 → D4 판정 계약
  7. native 마일스톤에서 시각 회귀를 사람도 못 잡고 넘어간 사례 발생 → D12(device 스크린샷 배선)
  8. `--machine` 스트림을 매 실행 사람이 해석하는 부담이 관측될 만큼 커짐 → D4 판정 계약을 코드(파서)로 물질화. **지금 코드로 만들지 않는 이유**: design gate는 exit 0/1/2 계약과 다중 입력 처리가 필요해 canonical asset이 정당했지만, e2e 판정은 web 스택도 현재 지시문 기반이며 스택 하나를 추가하면서 새 실행 코드를 들이는 것은 ADR-006에 어긋난다. 판정 계약을 글로 고정해 두고 필요가 관측되면 물질화한다.

## Mutation Contract (ADR-047 D3)
1. **Target** — `.claude/skills/stack-guard/SKILL.md`(verify 표·정적분석 표·toolchain·target 분기·boot smoke·registry·출력 계약) / `.claude/skills/stabilize-milestone/SKILL.md`(§3-b·§3-V·§5-2·§5-2b·§5-3·§5-4·dependency hygiene) / `.claude/skills/plan-workitem/SKILL.md`(task 유형 prefilter·컴포넌트 경로·의존성 신호) / `.claude/skills/validate-workitem/SKILL.md`(Arch-iface audit) / `.claude/skills/validate-plan/SKILL.md`(읽기 목록·`[Plan-arch-iface]`) / `.claude/skills/finalize-workitem/SKILL.md`(lockfile whitelist·민감 경로) / `.claude/skills/implement-workitem/SKILL.md`(의존성 도구) / `.claude/skills/bootstrap-stack/SKILL.md`(디렉터리 트리·Dependency Tools·§7-5 채움) / `.claude/skills/bootstrap-design/SKILL.md`(직접 지원 스택 표기) / `.claude/skills/plan-milestone/SKILL.md`(엔지니어링 내부 경계) / `.claude/agents/validator.md`(모바일 인터페이스 CHECK) / `.claude/agents/reviewer.md`(`[Plan-arch-iface]` 열거) / `.claude/agents/builder.md`(인터페이스 SSOT 열거) / `docs/20-system/ARCHITECTURE_OVERVIEW.md`(`## 7-5`) / `docs/30-workitems/_templates/TASK_TEMPLATE.md`(runner 예시·Architecture-Iface 예시) / `docs/30-workitems/_templates/FEATURE_TEMPLATE.md`(Architecture-Iface 예시) / `docs/00-meta/STRUCTURE.md`(산출물 표·Canonical Owner) / `docs/00-meta/PROJECT_START_CHECKLIST.md` / `docs/00-meta/GUARDRAILS_STRATEGY.md`(진입점 단서) / `docs/00-meta/WORKFLOW.md`(7-x 정책 포인터) / `docs/00-meta/_templates/STACK_SETUP_PLAN_TEMPLATE.md`(source root·smoke registry·golden 절차) / `AGENTS.md` / `README.md` / `README_ko.md` / `.gitignore` / `.claude/settings.json` / `docs/90-decisions/boilerplate/ADR-027-interface-decision-allocation.md`(Amendment 8) / `docs/90-decisions/boilerplate/ADR-031-non-web-out-of-scope.md`(Amendment 1) / `docs/90-decisions/boilerplate/ADR-007-workitem-lifecycle.md`(lockfile 목록) / `docs/90-decisions/boilerplate/ADR-021-static-analysis-recommendation.md`(스택별 표) / `docs/90-decisions/boilerplate/README.md`(인덱스)
2. **Failure mode** — Flutter 파일이 검사 대상에서 빠져 위반이 침묵하는데 결과는 "위반 없음"으로 보고됨 / e2e 디렉터리가 비어 있을 때 유닛 테스트가 대신 실행되고 통과 처리됨 / 웹 프로젝트의 동작·검증 시간이 Flutter 지원 추가로 저하됨 (앞 둘은 관측됨).
3. **Predicted improvement** — Flutter 프로젝트에서 색상 검출 3/3, e2e 상태 오분류 0, 웹 검증 median 변화 없음.
4. **Preserved invariants** — lifecycle 단계·순서·스킬 목록 불변 / 문서 계층·상태 전이 불변 / 판정 방식(Pass·Needs Fix·졸업 YES/NO) 불변 / 웹 프로젝트의 검증 명령·소요 시간 불변 / **이미 e2e를 갖고 통과하던 프로젝트의 졸업 판정 불변**(ADR-052#amend-1 결정 4) / 비해당 sub-section 통째 삭제 규칙 불변 / design gate의 차단 등급 불변.
   - **불변이 아닌 것을 밝힌다**: Flutter 분기는 공용 skill 본문에 들어가므로 웹 프로젝트도 그 줄을 읽게 된다(별도 파일을 만들지 않기로 한 대안 채택의 대가). 지키는 것은 *"읽는 줄이 0"* 이 아니라 *"증가량이 관리 가능한 범위"* 이며 그 상한은 아래 falsifier (d)로 고정한다. 경험 게이트의 native 캡처는 D12대로 **degrade한다** — 이 항목은 불변 목록에서 제외한다.
5. **Falsifying evaluation** — Flutter fork에서 (a) 색상 fixture 3종 중 하나라도 미검출 (b) 빈 e2e 디렉터리가 `PASS`로 분류 (c) 웹 프로젝트 `validate` median이 기준선 대비 유의하게 증가 (d) **공용 skill 지시문 총량이 기준선 대비 200줄 넘게 증가** (e) e2e를 갖고 통과하던 기존 프로젝트가 새 판정에서 차단됨 — 중 하나라도 발생하면 해당 결정을 재조정한다.
6. **Rollback path** — 본 ADR을 supersede하는 후속 ADR로 D1을 되돌려 Flutter를 ADR-031 범위로 복귀시킨다. 그 경우 `## 7-5`·npm broker·golden·5상태 e2e 판정 중 Flutter 전용 부분을 제거하고 전역 부분(ADR-052#amend-1)은 유지한다.

## 정책 강도 (ADR-022)
- **constraint(강)** — `[관측됨]`: `flutter analyze` 진단(기본 설정에서 차단되는 것 전부 — info 포함, D2) / 실행된 테스트 실패 / 시크릿 노출. 이 셋은 도입 시점부터 차단한다.
- **enabling(약)** — golden·접근성 guideline 테스트의 **존재 강제**(현재 미적용 — 작성한 것만 검사), 색상 grep(기록 등급), AI 도구 채택. 실사용 관측이 쌓이면 강도를 재조정한다.

## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT)
- .claude/skills/stack-guard/SKILL.md
- .claude/skills/stabilize-milestone/SKILL.md
- .claude/skills/plan-workitem/SKILL.md
- .claude/skills/finalize-workitem/SKILL.md
- .claude/skills/implement-workitem/SKILL.md
- .claude/skills/bootstrap-stack/SKILL.md
- .claude/skills/bootstrap-design/SKILL.md
- .claude/agents/validator.md
- .claude/agents/reviewer.md
- docs/20-system/ARCHITECTURE_OVERVIEW.md
- docs/30-workitems/_templates/TASK_TEMPLATE.md
- docs/00-meta/STRUCTURE.md
- docs/00-meta/PROJECT_START_CHECKLIST.md
- docs/00-meta/GUARDRAILS_STRATEGY.md
- docs/00-meta/_templates/STACK_SETUP_PLAN_TEMPLATE.md
- docs/90-decisions/boilerplate/ADR-027-interface-decision-allocation.md
- docs/90-decisions/boilerplate/ADR-031-non-web-out-of-scope.md
- docs/90-decisions/boilerplate/ADR-007-workitem-lifecycle.md
- docs/90-decisions/boilerplate/ADR-021-static-analysis-recommendation.md
- AGENTS.md
- README.md
- README_ko.md
- .gitignore

> `.claude/settings.json`도 본 ADR로 변경되지만 JSON이라 역참조 주석을 넣을 수 없어 Surfaces가 아닌 Mutation Contract Target에만 둔다.
> **`## 7-5` 자리만 추가되는 소비자**(`validate-workitem`·`validate-plan`·`plan-milestone`·`builder.md`·`FEATURE_TEMPLATE.md`·`WORKFLOW.md`·`bootstrap-stack/output-checklist.md`)는 Flutter 고유 내용을 담지 않으므로 **[ADR-027](ADR-027-interface-decision-allocation.md)#amend-8의 surface**다. 본 ADR은 D7에서 그 자리를 쓰기로 결정할 뿐이고, 자리의 소유·fan-out은 ADR-027이 갖는다. 두 목록이 겹치지 않게 여기서는 제외한다(Mutation Contract Target에는 이번 변경이 실제로 손대는 파일이라 포함).

## 참고
- ADR-031 (비웹 스택 범위 — 본 ADR이 Flutter에 한해 해제), ADR-027 (인터페이스 결정 할당), ADR-052 (e2e readiness), ADR-058 (design gate), ADR-048 (MCP 등재), ADR-022 (강도), ADR-047 (mutation contract), ADR-006 (단순성).
