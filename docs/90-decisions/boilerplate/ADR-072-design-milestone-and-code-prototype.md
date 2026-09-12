# ADR-072 — 디자인 마일스톤 + 코드 프로토타입 + UI 제작 계약 + design gate v3

> scope: boilerplate
> area: design/process

## Status
accepted

> 대체: [ADR-056](ADR-056-milestone-experience-contract.md)을 supersede한다(비결정 «프로토타입 코드의 구현 재사용 — 스펙이지 코드가 아니다»를 뒤집고, R5 라운드를 `/plan-milestone`에서 분리한다). ADR-056은 `superseded`로 history 잔존. 경험 계약의 목적(사용자 승인 artifact가 오라클, 구현 전 시각 확인, PX 커버리지, §10 voice 집행, 전환표)은 전부 승계한다. 디자인 워크플로우(R0~R6)는 [ADR-058](ADR-058-design-workflow.md), DESIGN.md 내용은 [ADR-073](ADR-073-interface-and-design-content-v2.md).
> 부분 supersede: ADR-058#amend-1 결정 5·6, #amend-2 전부(게이트 실행물 계약) → 본 ADR D6. [ADR-060](ADR-060-decision-closure-and-milestone-seal.md) D7 «봉인 전 구현 없음» → 본 ADR D5의 UI 제작 계약이 명시 예외. [ADR-009](ADR-009-tdd-default.md) TDD 기본 → D5가 시각 탐색 코드에 한해 Red-first를 면제. [ADR-059](ADR-059-flutter-mobile-profile.md) D12 native degrade → #amend-1이 갱신. 각 ADR에는 참조 갱신 줄만 둔다.

## 현재 유효 결정
- `/design-milestone M<N>`이 UI M의 화면 층(브리프 → 코드 프로토타입 → 게이트·스냅샷 → contract-ready)을 소유한다(D1~D4·D8). 재진입 3경로, 봉인 뒤 변경은 다음 M.
- UI 제작 계약(D5): presentational만·가짜 Red 금지·재사용 추적·행동 변경은 인터랙션 계약 기준(D5-3-1)·공용 컴포넌트 변경은 supersedes.
- 게이트 v3(D6): 매니페스트 모드·자가 검사·copied-from. PM `--`·케이스 수·단축 hex(#amend-1), Flutter 뷰포트별 report + viewport-coverage(#amend-5).
- 계획은 승인 표면과 대조한다(#amend-2 3-S). 미리보기 하네스는 provider만(#amend-3). A/B는 상태로 모델링 + 원장 행(#amend-4). 승인본 충실도 묶음(#amend-5).

## 배경
- [관측됨] 프로토타입이 HTML이라 같은 화면을 구현 때 React/Flutter로 다시 만든다. Flutter는 HTML과 간극이 커 §3-V 대조가 native에서 서지 않는다(ADR-059 D12). ADR-056은 «스펙이지 코드가 아니다»를 비결정으로 못 박았으나 이중 제작 비용이 사용자 fork에서 반복 보고됐다.
- [관측됨] plan-milestone R0~R4 뒤 R5 HTML 왕복이 컨텍스트를 소진해 skill 스스로 «feature 3+면 /clear 후 재실행»을 안내한다.
- [관측됨] 화면 요소·문구에 근거를 남기는 자리가 없다. 브리프 없이 시안부터 만들어 «왜 이 요소가 여기 있는가»를 사용자가 되묻는다. 카피 검토(§10)는 stabilize 사후 grep이 유일하다.
- [관측됨] 게이트 실행물 계약(digest·capability·conformance)은 인용 규모(`ADR-058#amend-2` 16파일/31줄)에 비해 «이 프로젝트에 맞는가»를 증명하지 못하고, Flutter 어댑터가 생기면 전제가 깨진다.
- [외부실증] Storybook은 웹 컴포넌트 개발의 사실상 표준으로 상태별 스토리·a11y·viewport 애드온·정적 빌드 URL을 제공한다. Playwright 컴포넌트 테스트는 실험 표기이며 사람이 브라우저로 둘러볼 수 없다. Flutter는 위젯 테스트로 논리 크기 렌더·Accessibility Guideline 검사·스크린샷이 가능하나 픽셀은 host OS마다 1~3% 다르다(ADR-059 D3 실측).

## 결정

### D1. `/design-milestone M<N>` 신설 — 위치·전제·라운드
- **위치**: `/plan-milestone`(R0~R4, UI M은 `draft` 유지) 뒤, `/plan-workitem` 앞. UI 마일스톤(ADR-073 D9 — 산하 feature `## 11` `Design:` 줄 ≥1)에서만. `disable-model-invocation: true`, 메인 세션 운전, `Agent`로 designer(브리프)·builder(코드)·reviewer(비평·픽셀)·researcher(갤러리 후보) 단발 위임.
- **전제(R0 preflight)**: M `draft` + 산하 feature `## 3`·`## 7 FAC` 존재 / DESIGN.md `## 0` ≠ draft + `## 0` 프로필 매핑표 / `STACK_SETUP_PLAN.md ## Design Gate Adapter` `ready` / `docs/20-system/prototypes/_theme/manifest.json`(R6 테마 배선) 존재. 하나라도 없으면 무엇을 먼저 돌릴지 안내하고 종료.
- **라운드**: R0 회수 → R1 화면 목록·전환표·프로필 배정·면제 → R2 레퍼런스 갤러리(ADR-058#amend-4 절차 공유, `--fast` 생략) → R3 화면 브리프(designer) + reviewer 비평 + 사용자 승인 → R4 코드 초안(builder) → R5 선택·수정 루프(사용자) → R6 게이트 + reviewer 픽셀 판정 + 사용자 승인 + 스냅샷 → R7 feature `## 7` 기입 + 정합 재대조 + `contract-ready` 전환. 각 라운드 산출물은 문서·코드·매니페스트에 적재한다(메인 컨텍스트 누적 금지). 중단 시 같은 `/design-milestone M<N>` 재실행이 미완 라운드부터 재개한다(멱등 — 완료 화면은 skip).
- **재진입(봉인 전)**: `draft`·`contract-ready` UI M에서 대상 화면은 셋이다 — (i) `프로토타입:`도 `프로토타입 면제:`도 없는 UI feature의 화면(최초 제작·feature 추가), (ii) `- 계약 수정:` 마커가 남은 UI feature의 승인 화면(텍스트 계약 변경 → 브리프 delta 재검토·재승인), (iii) `--screens <id,...>`로 명시된 승인 화면(`/repair-plan` 4-M·사용자 요청 — 기존 화면 수정). (ii)(iii)는 R3 브리프 delta → R4 재생성 → R6 재승인(같은 M 스냅샷 대체)으로 돈다. 중단 재개는 매니페스트 `approved`·feature `## 7` 기입 여부로 화면별 판정한다. 봉인(`ready` + receipt) 뒤에는 재진입하지 않는다 — 변경은 다음 M(ADR-057#amend-3 결정 4). `contract-ready`는 유지된다(강등 전이 없음).

### D2. 화면 브리프 (R3 — 요소마다 근거)
화면마다 `docs/20-system/prototypes/M<N>/briefs/<screen>.md`(커밋)에 다음을 채운다: 목적 1문장(어느 비즈니스 목표·핵심 시나리오를 위한 화면인가 — M `## 1`·feature `## 2`·`## 3` 참조) / 사용자 상황(페르소나·시나리오 참조) / 브랜드 정체성 부합(DESIGN `## 1` thesis·signature를 이 화면이 어떻게 드러내는가 1줄) / 정보 위계(1차·2차·3차) / **요소 목록 — 각 요소의 근거(왜 있는가 · 왜 그 위치 · 어떤 결정을 돕는가 · 없으면 무엇이 깨지는가)** / 상태(못생긴 상태 5종 + category state) / 카피 초안(§10 언어 블록·용어 사전 준수) / 인터랙션 계약(키보드 도달·포커스·취소·확인·콜백) / 접근성 노트 / 프로필·기준 뷰포트 / 재사용 vs 신규(DESIGN `## 7` 인벤토리·이전 M 컴포넌트 대조 — 신규면 `## 7` 등록 line) / PX 후보 목록. 구성 방향이 둘 이상 합리적이면 `구성 불확실`로 표시(R4에서 2안 제작).
- **reviewer[design] 비평이 사용자 승인보다 먼저다**: 근거 없는 요소 `[Design-element-rationale]`, §9·§10 위반, 과잉 요소, 인벤토리 외 신설을 본다. 카피 렌즈(ADR-073 D6) 적용.
- 사용자 승인은 화면 단위. `구성 불확실` 화면의 방향 선택은 `user-choice`(추천 블록은 요청 시만).

### D3. 코드 프로토타입 + 매니페스트
- **코드 위치·규칙**: 웹은 ARCH `## 3-1` 트리의 컴포넌트 디렉터리 하위 `screens/<screen>/` — `<Screen>.<ext>`(presentational: props-in/callbacks-out, fetch·store·router import 금지; 확장자는 스택 관례 `.tsx`/`.vue`/`.svelte`/Astro 컴포넌트) + `<Screen>.stories.<ext>`(상태별 스토리 = fixture — Storybook 프레임워크 통합 관례) + `fixtures.<ext>`(출처 표기 — ADR-064 D5). Flutter는 `lib/screens/<screen>/`(위젯, 데이터는 생성자 인자) + `lib/prototype/main.dart`(갤러리 진입 — 화면·상태 목록) + `test/screens/<screen>_prototype_test.dart`(프로필 뷰포트 렌더 + Accessibility Guideline 4종 + overflow 0 + 스냅샷 PNG). **폰트·아이콘 적재 (ADR-073#amend-1)**: 위젯 테스트는 pubspec 선언 폰트를 자동 적재하지 않는다 — `test/support/load_fonts.dart` 를 두고 `setUpAll(loadAppFonts)` 로 부른다. **`FontManifest.json` 을 읽어 선언된 패밀리를 전부 적재**한다(패밀리를 손으로 나열하면 폰트를 추가할 때마다 뒤처진다). **`MaterialIcons` 도 그 매니페스트에 있다** — 빠뜨리면 체크 표시·「+」가 네모로 남는다. 적재하지 않으면 스냅샷이 육안 대조에 못 쓰일 뿐 아니라 **`meetsGuideline(textContrastGuideline)` 의 판정이 뒤집힌다**(tofu 는 획이 굵어 통과하고 실제 글꼴은 실패한다 — Round 12 실측). **PNG 출력 경로는 `DESIGN_GATE_OUT` 으로 온다 — 어댑터가 프로세스 환경변수와 `--dart-define` **둘 다**로 넘기므로 `Platform.environment['DESIGN_GATE_OUT']` 와 `const String.fromEnvironment('DESIGN_GATE_OUT')` 중 아무거나 쓰면 된다. 파일명은 `<screen>-<state>-<w>x<h>.png` 로 고정이며 어댑터의 공용 스냅샷 복사 블록이 그 이름으로 `--snapshot` 디렉터리에 옮긴다(웹과 같은 규약).. 파일 상단 **추적 헤더** 주석: `feature: F-NNN | PX: PX-M<N>-<screen>-01..NN | DESIGN: §2 <token set>, §7 <components> | 승인: <YYYY-MM-DD>`.
- **PX 마커**: 코드 주석 `// PX-M<N>-<screen>-NN: <한 줄 결정>`(JSX 안 `{/* … */}`). 문법·불변식·소유 규칙은 ADR-056#amend-1 승계(마일스톤 번호=버전, 한 화면 내 중복 금지, 각 PX는 구현 feature 정확히 1곳 `## 7`). **설명은 한 줄로 쓴다 — 줄바꿈 금지**(2026-09-12): R7-1 은 인벤토리를 「코드 주석에서 **그대로 복사**」하라 하고 `/validate-plan` 축 5 ⑥ 은 `(id, 설명)` **정확 일치**를 검사하는데, 그 검사는 마커가 있는 **줄만** 본다. 주석이 여러 줄이면 두 규칙 다 정의되지 않고 R7 이 재추출하게 되어 drift 가 구조적으로 생긴다(Round 12 실측 3건). 한 줄에 안 들어가면 **설명을 줄이라는 신호**다 — PX 는 「한 줄 결정」이 정의다.
- **매니페스트** `docs/20-system/prototypes/M<N>/manifest.json`(커밋, 필드 정의는 본 ADR `## 매니페스트 schema (v1)` — 이 ADR이 schema SSOT다): `version`, `milestone`, `profiles`(name → viewports), `screens[]` — `id`, `feature`, `profile`, `scope`(monorepo 실행 scope — 기본 `.`), `preview`(`story:<storybook-id>` 또는 `flutter:<test file>` + `entry: lib/prototype/main.dart#<screen>`), `source[]`(코드 경로), `states[]`(각 `{ id, preview, baseline? }` — 상태별 스토리 id 또는 위젯 테스트 group; `baseline: true`는 브리프의 «승인 필요 상태»), `px[]`, `snapshots[]`, `brief`, `product_entry`(제품 라우트·딥링크 — R7이 `## 9`·ARCH 라우팅에서 채우고, 미정이면 `null` + 배선 task line item이 확정), `approved{date, by}`, `supersedes[]`(이전 M 화면 참조 `M<K>/<screen>` — 공용 컴포넌트·토큰 변경으로 그 화면의 기준선을 이 M이 새로 잡을 때), `handoff{ run, remaining_wiring[] }`. **이 파일이 게이트·validate-plan·seal·stabilize·accept의 단일 입력**이다(경로 추측 금지).
- **fixture 보존**: 스토리·fixture·위젯 테스트는 삭제하지 않는다(테스트 자산 — 구현 task가 그대로 쓴다).
- **미리보기 하네스에 가시 요소 금지 ([#amend-3](#adr-072-amend-3))**: 스토리 데코레이터(웹)·위젯 테스트 wrapper(Flutter)는 **테마·뷰포트 provider 만** 둔다 — 제목·헤더·랜드마크·네비게이션·카드 테두리·폭 컨테이너를 주입하지 않는다. **화면의 가시 요소는 전부 `source[]` 에서 나온다**: 승인 렌더에 보이는데 `source[]` 파일에 없으면 그 화면은 승인 대상이 아니며, 그 요소를 컴포넌트로 옮기거나 화면 밖 공용 셸이면 셸을 별도 화면으로 등록한다.
- **미리보기**: 웹 Storybook(정적 빌드는 게이트가 `design-gate-storybook/`에 생성), Flutter `flutter run -t lib/prototype/main.dart`. 제품 라우트에 개발 전용 페이지를 두지 않는다(불가한 스택만 예외 — 사유를 매니페스트 `handoff.run`에 적음).
- **불확실 화면 2안**: 브리프 `구성 불확실` 화면만 `<Screen>.stories.<ext>`에 `A`/`B` 스토리(또는 Flutter 갤러리 항목 2개). 선택 후 탈락안 삭제.

### D4. 승인 스냅샷 (동결 기준선)
- R6 사용자 승인 직후 게이트가 캡처해 `snapshots/<screen>-<state>-<w>x<h>.png`로 저장한다. **형식은 PNG**(Playwright·Flutter 위젯 테스트가 직접 만드는 형식 — 변환 의존 없음). 기준선 집합 = 각 뷰포트의 `default` 상태 + 1차 뷰포트의 `empty`·`error` 상태 + 매니페스트 `states[].baseline: true` 상태. 파일당 500KB 초과는 게이트가 경고한다(차단 아님 — 화면 단순화 권고). **커밋 대상**. `approved.date`와 함께 동결된다 — 같은 M 안에서(봉인 전) 재승인하면 같은 파일을 대체하고, **봉인 뒤에는 그 M의 스냅샷·매니페스트를 다시 쓰지 않는다**(D5-5).
- **스냅샷은 `source[]` 가 렌더한 것만 담는다 ([#amend-3](#adr-072-amend-3))** — 하네스가 주입한 요소가 들어가면 「승인본 = 제품」 등식이 깨져 배선 task 가 재현할 근거 없는 요소가 기준선에 굳는다. 실측: 데코레이터 `h1` 이 12/12 스냅샷에 들어가 D5-4 `[Design-reuse-drift]` 는 바이트 동일로 통과했는데 제품의 그 요소는 0개였다(Round 11).
- 용도: stabilize §3-V·accept·validate-plan의 **사람·AI 육안 대조 참조**. **픽셀 diff 오라클로 쓰지 않는다**(Flutter는 host마다 1~3% 다름 — ADR-059 D3). golden(`test/**/goldens/`, 로컬 전용)과 별개 경로·별개 목적이다.
- Flutter 스냅샷은 위젯 테스트가 논리 크기로 렌더해 생성한다(디바이스 불요). 안전 영역·글자 확대 1.3배는 권장 상태.
- **글리프 경고 (2026-09-11 — dogfood Round 12 실측)**: `flutter test` 는 폰트를 로드하지 않으면 **모든 글자를 네모(tofu)로 렌더한다.** 그 스냅샷은 레이아웃·간격·색은 증명하지만 **카피·타이포그래피·텍스트 위계는 증명하지 못한다** — D4 가 말하는 「육안 대조 참조」의 절반이 빈다. 그래서 위젯 테스트는 **렌더 전에 프로젝트 폰트를 `FontLoader` 로 적재한다**. 폰트가 아직 배치되지 않았으면(라이선스 미확인 등) 적재를 건너뛰되 **매니페스트 그 화면의 `handoff.remaining_wiring[]` 에 `글리프 없음 — 폰트 적재 전 스냅샷은 레이아웃 전용` 을 적어** 소비자(§3-V·accept·reviewer)가 카피 대조에 쓰지 않게 한다. **웹에는 이 문제가 없다** — 브라우저가 폰트 폴백을 하므로 스냅샷에 실제 글자가 나온다(같은 라운드에서 웹 쇼케이스는 한국어 카피·대비비·대표 화면이 모두 읽혔다).

### D5. UI 제작 계약 (봉인 전 예외 — ADR-060 D7·ADR-009 carve-out)
1. **범위**: `/design-milestone` R4~R6가 만드는 presentational 코드·스토리·fixture·위젯 테스트·테마 배선(ADR-058#amend-4 R6)만. 데이터·권한·저장·라우팅 배선은 만들지 않는다.
2. **TDD**: 시각 탐색 코드에 Red-first를 요구하지 않는다. **행동 계약**(키보드 도달·포커스 순서·취소·확인·콜백 호출)은 R6에서 게이트(axe/guideline) + 스토리 interaction test 또는 위젯 테스트로 검사한다 — 브리프의 인터랙션 계약 항목이 그 테스트의 명세다.
3. **가짜 Red 금지**: 이후 구현 task는 승인 UI를 «재사용»한다. task `## 3`에 `- 승인 UI 재사용: <컴포넌트 경로> (manifest: <screen id>) — 배선만: <데이터/권한/저장 연결>` line item을 두고, builder는 그 컴포넌트의 표현을 다시 쓰지 않으며 Red 관측은 **배선 AC에 대해서만** 보고한다. 이미 통과하는 표현 테스트를 «Red였다»고 적지 않는다.
3-1. **표현이 아닌 «행동» 변경 (2026-09-11 — dogfood Round 11 실측)**: D5-3·D5-4 는 *표현*(마크업·스타일·카피·스토리)을 다루고 `[Design-reuse-drift]` 도 표현 기준이라, 승인 컴포넌트의 **이벤트 핸들러·포커스 관리·가드 로직**만 바꾸면 아무것도 발화하지 않는다. 판정 기준은 하나다 — **그 변경이 브리프 `## 인터랙션 계약` 의 문장을 바꾸면 재승인 대상이고, 바꾸지 않으면 재승인 없이 고치되 로그에 고지한다**(`/repair-milestone` 은 `## 5` 항목에, 구현 task 는 `## 8` 에 «승인 컴포넌트 행동 변경: <무엇> — 인터랙션 계약 무변경» 한 줄). 배선 계층으로 옮길 수 있는 변경이면 그쪽이 먼저다 — 승인 파일을 건드리는 것은 **그 신호가 배선 계층에 원리상 없을 때**만이다(실측: `onDelete(id)` 시그니처에 포인터 좌표가 없어 reflow 클릭 통과를 배선에서 가를 수 없었다).
4. **추적**: 추적 헤더 + PX 마커 + 매니페스트 `source[]`가 «어느 feature·PX·DESIGN 결정에서 왔는가»의 경로다. validator는 `승인 UI 재사용` task의 diff가 배선(props·데이터·이벤트 연결)에 한정되는지 보고, 표현 마크업이 바뀌었는데 재승인 등재가 없으면 `P1 [Design-reuse-drift]`.
5. **공용 컴포넌트·토큰 변경 → 새 기준선 append(이전 M 불변)**: M<N+1>에서 이전 M 승인 화면에 쓰인 공용 컴포넌트·토큰을 바꾸면, 그 화면을 M<N+1> 매니페스트 `screens[]`에 **다시 등록**하고 `supersedes: ["M<K>/<screen>"]`을 적어 R6에서 렌더·승인·스냅샷을 M<N+1> `snapshots/`에 저장한다. 이전 M의 매니페스트·스냅샷·봉인 증거는 **건드리지 않는다**(마일스톤 번호 = 버전 — ADR-056#amend-1 승계, ADR-057#amend-3 결정 4). 소비자(stabilize §3-V·accept·validate-plan)는 화면의 현재 기준선을 «가장 최근 M의 등록 또는 supersedes»로 해석한다. 봉인 전(`contract-ready`)이면 같은 M 안에서 재승인·대체한다. `/amend-ssot` 전파표 행(ADR-069#amend-1)이 이 판정을 낸다.
6. **세션 인계**: 매니페스트 `handoff`에 실행 방법·남은 배선 목록을 적는다(별도 HANDOFF 파일 없음).
7. **커밋**: 본 skill은 커밋하지 않는다. 종료 출력에 권장 커밋 메시지(`feat(ui): approve M<N> screen prototypes`)를 낸다. 사용자 커밋 후 `/plan-workitem`.

### D6. design gate v3 (매니페스트 모드 + 설치 시 자가 검사)
- **실행물**: canonical `.claude/skills/stack-guard/assets/design-gate.mjs` v3를 `/stack-guard`가 project-native 경로(기본 `scripts/design-gate.mjs`)에 복사하고 `validate:design`(npm 계열)에 배선한다. **`design-gate-conformance.mjs`(고정 적합성 oracle)·capability version 핸드셰이크는 폐지**한다. 복사 시점의 canonical sha256은 registry `copied-from`에 남긴다 — caller는 대조하지 않으며, stack-guard 재실행의 local-modification 판별과 stabilize의 canonical 갱신 감지에만 쓴다.
- **모드**: `--html <files|glob>`(concept HTML — bootstrap-design R2-G) / `--manifest <path> [--only <screen id,...>] [--snapshot <dir>] [--no-build]`(화면·쇼케이스 — R6·design-milestone·stabilize·validate-workitem) / `--self-test`(설치 시) / `--tokens-only <glob>`(토큰 외 리터럴 스캔 — 기록 등급, 렌더 출력을 건드리지 않는다). 렌더 모드(`--html`·`--manifest`·`--self-test`)만 `design-gate-shots/`를 초기화한다. 출력 `design-gate-shots/report.json` + 스크린샷. exit `0`(pass) / `1`(blocker) / `2`(실행 불가 — Needs Install·미정의 플래그·모르는 매니페스트 `version`). 자식 프로세스 기동 실패(EPERM·EACCES·ENOENT)는 exit 2, 기동 후 시간 초과·출력 초과는 exit 1(ADR-063 D1 spawn 3분기 승계).
- **실행 scope(monorepo)**: 각 화면의 `scope`(기본 `.`)를 어댑터 명령의 **작업 디렉터리**로 쓴다 — `build-storybook`은 Storybook이 설치된 scope(예 `apps/web`), `flutter test`는 `pubspec.yaml`이 있는 scope(예 `apps/mobile`)에서 돈다. `source[]`·`preview` 파일 경로는 **그 화면의 `scope` 기준 상대**, `brief`·`snapshots[]`는 **매니페스트 디렉터리 상대**, 게이트 출력은 **저장소 루트 기준**으로 해석한다(`## 매니페스트 schema (v1)` 참조 — Flutter 러너에 넘기는 `DESIGN_GATE_OUT`도 루트 절대 경로다).
- **웹 어댑터**: `preview: "story:<id>"` → Storybook 정적 빌드(`build-storybook -o design-gate-storybook/` — **매 실행 재빌드**; 같은 세션 반복에서만 `--no-build`로 재사용, mtime 캐시 없음) + 내장 정적 서버(임시 포트) → 화면의 `states[]` 각 `preview`(없으면 화면 `preview` 1개)를 `iframe.html?id=<id>&viewMode=story`로 프로필 뷰포트마다 fresh render → populated axe(serious/critical 차단, moderate/minor 보고) + 좁은 폭 geometry(page overflow·viewport escape·clipped text — 기존 v2 로직·오탐 제외 유지). `--html`은 `file://` 렌더로 같은 검사.
- **Flutter 어댑터**: `preview: "flutter:<test file>"` → `flutter test <file> --reporter json`(위젯 테스트가 프로필 논리 크기 렌더 + `meetsGuideline` 4종 + `FlutterError`(RenderFlex overflow) 0 + PNG 저장 — 캡처 이름 `<screen>-<state>-<w>x<h>.png`). **`DESIGN_GATE_OUT` 은 프로세스 환경변수와 `--dart-define` 두 경로로 전달한다** — 한쪽만 주면 테스트가 반대쪽 API 로 읽었을 때 조용히 PNG 0장이 되고, 게이트는 `blockers: 0` 을 내므로 아무도 모른다(dogfood Round 12 실측) → 결과를 같은 report schema로 정규화. 차단 = guideline 실패·overflow·예외. **report 의 뷰포트 축은 Flutter 갈래에서 비어 있다 (2026-09-12)**: 웹은 화면×상태×뷰포트마다 `screens[]` 항목을 만들지만 Flutter 는 `flutter test` **실행 하나당 항목 1개**에 `viewport: null`·`screenshot: null` 이다. 따라서 **`--snapshot` 없이 돈 Flutter 항목의 `blockers: 0` 을 「뷰포트 커버리지 증거」로 읽지 마라** — 뷰포트 루프를 통째로 빠뜨린 테스트도 같은 항목을 만든다(발견 53). **승인 경로는 보호된다**: R6 은 `--snapshot` 을 요구하고 PNG 파일명 `<screen>-<state>-<w>x<h>.png` 이 뷰포트별 증거다. 테스트 이름을 파싱해 뷰포트별 항목으로 쪼개는 것은 탐지기이며 후속 라운드 후보다(#amend-5 결정 2가 대체 — 현재 SSOT: 본 ADR #amend-5). **컴파일 오류·러너 기동 실패는 exit 2**(blocker가 아니라 실행 불가)로 구분한다.
- **자가 검사(4케이스)**: `--self-test`는 (a) 내장 known-bad HTML — **규칙별 기대**: `page-overflow`(320) ≥1 · `color-contrast` ≥1 · `button-name` ≥1이 각각 blocker로 잡혀야 한다(합계가 아니라 규칙별 — 한 규칙의 다중 검출이 다른 규칙의 결함을 가리지 않게) (b) 내장 known-good HTML — blocker 0 (c) 내장 정적 HTML 2개를 임시 매니페스트(`preview: "url:<path>"`)로 서빙해 매니페스트 경로·report·`--snapshot` 저장까지 exit 0 (d) Flutter 프로젝트면 `test/design_gate/self_bad_test.dart`(known-bad: 탭 타겟 20px + 대비 2:1) 실패 + `test/design_gate/self_ok_test.dart`(known-good) 통과 — 컴파일 오류는 exit 2로 구분. 넷 다 기대와 같아야 `self-test: PASS`. 불일치 → `status: wiring-fail`. 통과하면 registry `status: ready (self-test PASS <YYYY-MM-DD>)`.
- **registry 6필드**: `status | command template | adapter path | manifest 규약 | self-test 일자 | copied-from(복사 시 canonical sha256)`. caller는 `status: ready`만 확인한다(missing/n/a/needs-install/wiring-fail면 `Needs Design Gate: /stack-guard` + 승인 보류 — fail-closed 유지). `adapter path`는 stabilize §1.0 (a) 실재 검사용, `copied-from`은 stack-guard 재실행(사본 sha == copied-from이면 무수정 → 새 canonical로 교체 + copied-from 갱신, 다르면 diff 보고 + 사용자 결정)과 stabilize §1.0 (b)(canonical 현재 sha ≠ copied-from → `/stack-guard` 재실행 권장)에만 쓴다.
- **품질 계약 불변**: ADR-058 D3(serious/critical axe·좁은 폭 geometry 차단, reviewer 픽셀 판정, repair ≤2, populated 전제). 토큰 외 리터럴 스캔은 문자열 검사라 기록 등급(ADR-063 D6) — design-milestone 승인 체크리스트가 «0건 또는 사유 기입»을 요구한다.
- **single-origin**: `design-gate-shots/`는 렌더 모드 매 실행 초기화, `design-gate-storybook/`는 **빌드를 수행할 때만** 재생성한다(`--no-build` 실행은 기존 빌드를 보존한다 — 초기화하면 재사용할 대상이 사라진다). `--no-build`는 **같은 세션에서 코드 변경 없이 반복 실행할 때만** 쓴다(빌드 입력이 바뀌었으면 재빌드 — mtime 캐시를 두지 않으므로 호출 측 책임이다). 같은 checkout에서 동시 2실행 금지(ADR-063 D7 승계).

### D7. stabilize §3-V v2
- 웹: 매니페스트 `screens[]`마다 (a) 스토리 렌더(게이트 `--manifest`)와 (b) 제품 라우트 렌더(dev server + 매니페스트 `product_entry` — `null`이면 «제품 진입점 미기록» 사유 echo + (a) 대조만)를 프로필 뷰포트로 캡처해 `docs/40-validation/visual/M-N/`에 두고, **승인 스냅샷과 나란히** Read로 대조한다. Flutter: (a) 위젯 테스트 스냅샷 재생성 + (b) 통합 테스트 스크린샷(가능 시, 아니면 `blocked-on-env` 명시). 화면의 현재 기준선은 «가장 최근 M의 등록·supersedes»다(D5-5). **매니페스트에 없는 UI 화면**(`프로토타입 면제:` feature · 이전 M 승인본을 변경 없이 재사용하는 화면)도 제품 렌더 (b)는 만들어 ② 경로로 대조한다 — 순회 대상을 매니페스트로만 좁히면 ADR-056 결정 5의 면제·부재 화면 fallback이 사라진다. 앵커 위계: ① 승인 스냅샷(그 화면을 등록한 M의 것) ② DESIGN 파생 체크리스트. 불일치 `P1 [Experience-drift]` report-only(승계) — 봉인 AC·PX↔AC 위반을 동반해 재현되면 별도 P0 결함(ADR-070 D1). 실행 의무·silent skip 금지 승계.

### D8. `/plan-milestone` 분리
R5 라운드 제거. UI 마일스톤은 R4 뒤 텍스트 정합 재대조(M `## 3` ↔ F `## 3` ↔ F `## 7` FAC)까지 하고 **`draft` 유지**(최초 작성 한정 — #amend-5 결정 8) + 출력 «다음: `/design-milestone M<N>`». 비-UI는 기존대로 `contract-ready`. draft UI M 재실행 시 R0~R4 완료면 재실행 없이 같은 안내를 낸다. `contract-ready` UI M의 텍스트 계약 수정은 plan-milestone, 화면 층 수정은 design-milestone 재진입.

### D9. 하류 소비자 배선
- `/plan-workitem` 입구 계약: `contract-ready` + feature `## 7` `프로토타입:`(매니페스트 screen id) 또는 `프로토타입 면제:`. 부재 시 `Needs Experience Contract` + «`/design-milestone M<N>`» 안내(ADR-007#amend-5 문구 갱신). task `## 3`에 `승인 UI 재사용` line item authoring, PX↔AC는 매니페스트 `px[]`에서.
- `/validate-plan`·reviewer `[Plan-FAC-coverage]`: PX 소유·문법 검사의 source = 매니페스트 `px[]` + 코드 주석 grep(`^PX-M<N>-<screen>-\d{2,}$`). 매니페스트 화면마다 스냅샷 파일 실재 + 각 feature `프로토타입:` id가 매니페스트에 존재.
- `/seal-milestone` 조건 4에 UI M «매니페스트 존재 + 스냅샷 실재» 추가. **`프로토타입:` 값은 `<screen>`(이 M 등록) 또는 `M<K>/<screen>`(이전 M 승인본을 변경 없이 재사용)이며, 검사는 그 id가 가리키는 M의 매니페스트·스냅샷을 본다** — 이 M이 등록한 화면이 0개인 재사용 전용 UI 마일스톤을 매니페스트 부재로 오차단하지 않는다.
- `/implement-workitem` 3-R (b): «승인 프로토타입 경로 실재» = 매니페스트 entry + `source[]` 파일 실재.
- `/validate-workitem`·validator: `[Design-reuse-drift]`(D5-4). 게이트 재실행은 «task `## 3`에 `승인 UI 재사용` line item이 있고 diff가 그 화면의 매니페스트 `source[]`를 건드릴 때만» `--manifest <M> --only <screen id>`로 한다(task마다 Storybook 재빌드 비용을 막는다).
- 배선 task가 라우트를 확정하면 task `## 3`의 `- product_entry 확정: <route> → 매니페스트 갱신` line item(plan-workitem authoring)을 implement가 실행해 매니페스트 `product_entry`만 갱신한다(다른 필드 write 금지).
- `/accept-milestone`: 승인 스냅샷 경로 + 미리보기 실행 명령 제시.
- `/repair-plan` 4-M: 화면 층 수정은 `/design-milestone M<N>` 재진입 안내.
- `/amend-ssot`: ADR-069#amend-1 행.
- 원장 SSOT 삼각(ADR-056 결정 1 승계): DESIGN.md 토큰 > 승인 스냅샷+브리프 > FAC 텍스트(화면·카피·상태의 구체 해석 한정).

### D10. 비-UI·Codex·컨텍스트
- 비-UI 마일스톤은 본 skill을 부르지 않는다. UI 프로젝트의 비-UI feature는 R1이 `프로토타입 면제: 비-UI feature`를 자동 기입.
- Codex: designer/builder/reviewer 위임을 메인 인라인(순차 페르소나 + `under-verified`)으로 degrade. 게이트·캡처는 그대로 실행.
- 종료 후 `/clear` 권장. 화면 6~8개 초과면 두 세션 분할(R3까지 / R4~R7) — 같은 M 재실행이 재개.

## 매니페스트 schema (v1)
```json
{
  "version": 1,
  "milestone": "M1",
  "profiles": {
    "consumer-mobile": { "platform": ["native/android", "native/ios"], "viewports": [{ "w": 390, "h": 844 }, { "w": 360, "h": 800 }] },
    "admin-web": { "platform": ["web"], "viewports": [{ "w": 1280, "h": 900 }, { "w": 375, "h": 812 }] }
  },
  "screens": [
    {
      "id": "onboarding",
      "feature": "F-001",
      "profile": "consumer-mobile",
      "scope": "apps/mobile",
      "preview": "flutter:test/screens/onboarding_prototype_test.dart",
      "entry": "lib/prototype/main.dart#onboarding",
      "source": ["lib/screens/onboarding/onboarding_screen.dart", "lib/screens/onboarding/fixtures.dart"],
      "states": [
        { "id": "default", "preview": "flutter:test/screens/onboarding_prototype_test.dart#default" },
        { "id": "loading", "preview": "flutter:test/screens/onboarding_prototype_test.dart#loading" },
        { "id": "error", "preview": "flutter:test/screens/onboarding_prototype_test.dart#error" },
        { "id": "empty", "preview": "flutter:test/screens/onboarding_prototype_test.dart#empty" },
        { "id": "long-title", "preview": "flutter:test/screens/onboarding_prototype_test.dart#long-title", "baseline": true },
        { "id": "overflow", "preview": "flutter:test/screens/onboarding_prototype_test.dart#overflow" }
      ],
      "px": ["PX-M1-onboarding-01", "PX-M1-onboarding-02"],
      "brief": "briefs/onboarding.md",
      "snapshots": [
        "snapshots/onboarding-default-390x844.png", "snapshots/onboarding-default-360x800.png",
        "snapshots/onboarding-empty-390x844.png", "snapshots/onboarding-error-390x844.png",
        "snapshots/onboarding-long-title-390x844.png"
      ],
      "product_entry": null,
      "approved": { "date": "2026-09-20", "by": "user" },
      "supersedes": [],
      "handoff": {
        "run": "flutter run -t lib/prototype/main.dart",
        "remaining_wiring": ["habits 목록 데이터 소스", "완료 토글 저장", "오류 상태 실제 예외 매핑"]
      }
    },
    {
      "id": "admin-list",
      "feature": "F-003",
      "profile": "admin-web",
      "scope": "apps/web",
      "preview": "story:screens-adminlist--default",
      "source": ["src/components/screens/admin-list/AdminList.tsx", "src/components/screens/admin-list/AdminList.stories.tsx", "src/components/screens/admin-list/fixtures.ts"],
      "states": [
        { "id": "default", "preview": "story:screens-adminlist--default" },
        { "id": "loading", "preview": "story:screens-adminlist--loading" },
        { "id": "error", "preview": "story:screens-adminlist--error" },
        { "id": "empty", "preview": "story:screens-adminlist--empty" },
        { "id": "long-title", "preview": "story:screens-adminlist--long-title" },
        { "id": "overflow", "preview": "story:screens-adminlist--overflow" }
      ],
      "px": ["PX-M1-admin-list-01"],
      "brief": "briefs/admin-list.md",
      "snapshots": [
        "snapshots/admin-list-default-1280x900.png", "snapshots/admin-list-default-375x812.png",
        "snapshots/admin-list-empty-1280x900.png", "snapshots/admin-list-error-1280x900.png"
      ],
      "product_entry": "/admin/items",
      "approved": { "date": "2026-09-20", "by": "user" },
      "supersedes": [],
      "handoff": { "run": "npm run storybook", "remaining_wiring": ["목록 fetch", "권한 가드"] }
    }
  ]
}
```
- `preview`는 `story:<storybook id>`·`flutter:<test file>[#<group>]`·(게이트 자가 검사 전용) `url:<path>` 중 하나. `entry`는 사람이 여는 진입점(선택). `states[].preview`가 상태별 렌더 대상이고, 화면 `preview`는 default 상태 fallback이다.
- `scope`는 **어댑터 명령을 돌릴 작업 디렉터리**다(단일 패키지는 `.` — 생략 시 기본값). `build-storybook`은 Storybook이 설치된 scope, `flutter test`는 `pubspec.yaml`이 있는 scope에서 돈다. 경로 기준은 셋으로 갈린다 — **`source[]`·`preview`의 파일 경로는 그 화면의 `scope` 기준 상대**(위 예시의 `lib/screens/…`·`test/screens/…`는 `scope: apps/mobile` 기준이다 — 어댑터가 그 scope를 작업 디렉터리로 돌기 때문), **`brief`·`snapshots[]`는 매니페스트 디렉터리 상대**(`briefs/<screen>.md`·`snapshots/<screen>-<state>-<w>x<h>.png` — D4 저장 규칙 그대로), **게이트 출력(`design-gate-shots/`)은 저장소 루트 기준**(scope가 여럿이어도 스크린샷이 한 곳에 모여야 reviewer가 나란히 본다).
- `snapshots[]` 파일명은 `<screen>-<state>-<w>x<h>.png`. 기준선 집합 = 각 뷰포트 `default` + 1차 뷰포트 `empty`·`error` + `baseline: true` 상태.
- **`states[].render` (선택 — schema v1 minor, 2026-09-11)**: 그 상태가 **렌더 조건으로 정의될 때** 그 조건을 적는다. `{ "viewports": [{"w":320,"h":800}], "textScale": 2 }`. 선언이 있으면 게이트는 **그 조건에서만** 렌더·기준선 캡처하고(프로필 밖 폭도 허용 — 기준선 대상이다), 없으면 프로필 뷰포트 전체를 쓴다. **왜 필요한가**: 브리프의 «못생긴 상태»는 조건을 달고 온다(`narrow-320`·`overflow`@360×800·`long-name`@textScale 1.3·`zoom-200`). 조건을 표현할 자리가 없으면 게이트가 그것을 **조용히 버리고** 프로필 뷰포트로 찍는다 — dogfood Round 12 실측: `admin-habits-narrow-320-1280x900.png` 이 승인 기준선으로 생성됐고 내용은 **1280px 전체 폭의 3열 표가 멀쩡히 나온 장면**이었다(스토리의 viewport global 은 게이트의 `setViewportSize` 에 무시된다). 이름과 내용이 어긋난 기준선은 사람이 봐도 이상함을 못 느낀다 — 그림 자체는 정상이기 때문이다. `version` 은 올리지 않는다(필드 추가는 minor).
- **`profiles.<name>.fonts[]` (선택 — schema v1 minor, 2026-09-12)**: **DESIGN `## 3` 이 그 프로필에 확정한 글꼴 패밀리 이름**을 적는다(웹 `["Pretendard Variable"]` / 앱 `["Pretendard"]`). **프로필별인 이유**: DESIGN 의 «전달 방식»이 프로필 delta 이고, 같은 글꼴이라도 플랫폼마다 패밀리 이름이 다르다(웹 variable woff2 는 `Pretendard Variable`, Flutter `pubspec fonts:` 는 `Pretendard`). 게이트가 두 검사를 건다 — **1차(차단)**: 그 패밀리의 **선언**이 실재하는가(`@font-face`·`next/font/local`·`pubspec.yaml fonts:`). **2차(보고)**: 렌더 직후 `document.fonts.check('16px "<family>"')`. 선언이 없으면 두 검사를 건너뛴다(기존 매니페스트 호환). **왜 필요한가**: 글꼴이 없는 채로 찍힌 기준선은 「승인본 = 제품」 등식을 깨는데 **그림 자체는 정상으로 보여** 사람이 못 알아챈다 — Round 12 실측: 웹 승인 스냅샷 26장이 fallback 글꼴로 찍혔고, 같은 공백이 Flutter 에서는 tofu 로 났다(발견 55·69, ADR-073#amend-1).
- **`구성 불확실`(A/B) 의 표현 — 새 필드가 아니라 상태 쌍 (2026-09-11, amend-4)**: 브리프 `## 13` 이 방향 2안을 남긴 화면은 **그 선택이 렌더에 보이는 상태마다** `<state>-a`·`<state>-b` 두 상태를 `states[]` 에 등록한다(`default-a`·`default-b`·`overflow-a`·`overflow-b` …). `variant` 필드를 새로 두지 **않는다** — 웹 갈래는 이미 스토리 = 상태로 그렇게 표현하고 있어서(«`구성 불확실`이면 `A`/`B`» 스토리) 필드를 더하면 같은 것을 가리키는 표기가 둘이 된다. 상태로 두면 `preview`·`baseline`·`render`·스냅샷 명명·게이트 렌더가 전부 기존 기계를 그대로 쓴다. **왜 필요한가**: 상태 축이 없으면 두 안의 렌더가 같은 파일명으로 충돌한다 — dogfood Round 12 실측: builder 가 충돌을 피하려 PNG 저장을 A안에만 걸었고, 그 결과 R6-4 reviewer 가 연 `design-gate-shots/` 에도 승인 스냅샷 26장에도 **B안이 한 장도 없었다.** 사용자가 「둘 다 보고 정한다」고 유보한 선택인데 볼 것이 처음부터 한쪽뿐이었다. 선택 확정 후 탈락 상태는 `states[]` 에서 지운다(R5).
- `product_entry`는 제품 라우트·딥링크. design-milestone R7이 `## 9`·ARCH 라우팅에서 채우고, 미정이면 `null` → 배선 task line item이 확정해 implement가 이 필드만 갱신한다. stabilize §3-V ②(제품 렌더)의 입력.
- `supersedes[]`는 이전 M 화면 참조 `M<K>/<screen>` — 공용 컴포넌트·토큰 변경으로 이 M이 그 화면의 기준선을 새로 잡을 때. 이전 M 파일은 불변. 소비자는 «가장 최근 M의 등록·supersedes»를 현재 기준선으로 해석한다.
- `_theme/manifest.json`은 `milestone: "_theme"`, 화면 id `theme-showcase`(프로필별 `theme-showcase-<profile>`), `feature: "—"`, `px: []`, `product_entry: null`.
- 화면 id는 kebab-case이며 숫자로 끝나지 않는다. 게이트는 `version !== 1`이면 exit 2. 필드 추가는 minor로 하되 `version`은 호환 깨질 때만 올린다.

## 비결정 (No)
- HTML 프로토타입 병행 유지 — 이중 절차. 제품 라우트 개발 전용 페이지 기본화 — 제품 코드 오염. Chromatic·Widgetbook 기본 도입 — 의존 증가. 픽셀 diff 오라클 — host 편차. 면제 판정값 — ADR-070.

## 대안과 제약 (ADR-053)
- HTML 유지(B) — 검증 장치 불변이나 이중 제작·Flutter 간극 잔존. 기각.
- 웹만 HTML, Flutter만 코드(C) — 두 절차 병행 비용. 기각.
- Playwright CT를 미리보기로 — 실험 표기·사람 열람 불가. 기각(불가 스택 fallback으로만).
- 채택(A) — 코드 + 매니페스트 + 스냅샷 + Storybook/갤러리 진입.

## 신뢰도
Low~Medium — 코드 재사용·브리프·갤러리 효과는 [가설]. 게이트 v3의 검출기는 v2 실측분 승계.

## 재검토 트리거
1. Round 11에서 승인 UI 재사용 task가 표현을 다시 쓰는 비율 > 30% → D5-3 규율 강화 또는 컴포넌트 경계 재설계.
2. 브리프 라운드가 화면당 20분을 넘으면 브리프 항목 축소.
3. 스냅샷 용량이 M당 5MB를 넘으면 해상도·형식 재조정.
4. Flutter 위젯 테스트 스냅샷이 호스트 간 육안 판별에 방해될 만큼 다르면 프로필별 host 고정 명시.
5. Playwright CT가 GA로 안정되고 Storybook 유지 비용이 문제되면 D3 미리보기 재검토.

## 정책 강도 (ADR-022)
- 제약(강, [관측됨] 승계): plan-workitem 입구 계약(ADR-056 결정 3 승계), 게이트 fail-closed(ADR-058 D3 승계), D5-3 가짜 Red 금지.
- enabling(약, [가설]): D2 브리프, D3 코드 규칙, D4 스냅샷, D5 재승인, D7.

## Mutation Contract (ADR-047 D3)
1. Target — `.claude/skills/design-milestone/SKILL.md` 신설 / `.agents/skills/design-milestone/*` / `.claude/skills/plan-milestone/SKILL.md`(R5 제거·Exit 분기·allowed-tools) / `.claude/skills/{plan-workitem,validate-plan,seal-milestone,implement-workitem,validate-workitem,accept-milestone,repair-plan,stabilize-milestone,amend-ssot,stack-guard,bootstrap-design}/SKILL.md` / `.claude/agents/{designer,builder,reviewer,validator}.md` / `.claude/skills/stack-guard/assets/design-gate.mjs`(v3) + conformance 삭제 / 템플릿 3종 / `.gitignore` / `docs/00-meta/{STRUCTURE,WORKFLOW,DELEGATION_STRATEGY,PROJECT_START_CHECKLIST,GUARDRAILS_STRATEGY}.md` / `STACK_SETUP_PLAN_TEMPLATE.md` / README 2종.
2. Failure mode — 화면 이중 제작 / plan-milestone 컨텍스트 소진 / 요소 근거·카피 검토 부재 / 게이트 계약이 Flutter에서 불성립 / native 시각 대조 부재 (전부 관측됨).
3. Predicted improvement — Round 11·12에서 UI task 구현이 배선만으로 끝남(표현 diff 0) / 매니페스트·스냅샷 커밋 / §3-V가 스냅샷 대조로 native에서도 실행 / 게이트 자가 검사 PASS·conformance 인용 0.
4. Preserved invariants — 봉인 이후 프로토타입 잠금(마일스톤 번호=버전) / plan-workitem 입구 계약 constraint / 취향 오라클=사용자 / 생성(designer·builder)·감사(reviewer) 분리 / stabilize read-only / graduation 4값 / 비-UI 무영향 / hot-loop 스크린샷 금지(게이트는 승인·마일스톤 1회) / DESIGN 토큰 우선.
5. Falsifying evaluation — (a) 승인 UI 재사용 task에서 builder가 표현 파일을 수정하면 `[Design-reuse-drift]`가 발화해야 한다 — 미발화면 D5-4 실패 (b) 매니페스트 없이 plan-workitem이 진행되면 D9 실패 (c) 자가 검사가 known-bad를 통과시키면 D6 실패 (d) §3-V가 스냅샷 없이 «판독»을 보고하면 D7 실패 (e) Round 11 세션 분할 없이 화면 6개를 완주 못 하면 D10 분할 기준 조정.
6. Rollback path — 본 ADR을 supersede하는 후속 ADR로 ADR-056의 HTML 프로토타입·plan-milestone R5를 재채택하고 design-milestone·매니페스트·스냅샷·게이트 v3를 제거한다(ADR-056 status는 되돌리지 않는다).

## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT. 실제 파일 경로 1행 1개)
- .claude/skills/design-milestone/SKILL.md                — D1~D5·D10
- .agents/skills/design-milestone/SKILL.md                — Codex wrapper
- .claude/skills/plan-milestone/SKILL.md                  — D8
- .claude/skills/plan-workitem/SKILL.md                   — D9 입구 계약·재사용 line item·PX 매핑
- .claude/skills/validate-plan/SKILL.md                   — D9 PX 검사 source
- .claude/skills/seal-milestone/SKILL.md                  — D9 조건 4
- .claude/skills/implement-workitem/SKILL.md              — D9 3-R
- .claude/skills/validate-workitem/SKILL.md               — D5-4
- .claude/skills/accept-milestone/SKILL.md                — D9 스냅샷 제시
- .claude/skills/repair-plan/SKILL.md                     — D9 4-M
- .claude/skills/repair-milestone/SKILL.md               — D5-3-1 행동 변경 로그 고지 (**2026-09-11 추가**)
- .claude/skills/stabilize-milestone/SKILL.md             — D7 §3-V·§1.0 게이트 항목·§5-2 제외 정리
- .claude/skills/amend-ssot/SKILL.md                      — D5-5 (A3 인용 줄에 #amend-1 표기 — 전파표 재서술 없음)
- .claude/skills/stack-guard/SKILL.md                     — D6 게이트 v3·registry
- .claude/skills/stack-guard/assets/design-gate.mjs       — D6 canonical v3
- .claude/skills/bootstrap-design/SKILL.md                — D6 R2-G·R6 caller
- .claude/agents/designer.md                              — D2 브리프
- .claude/agents/builder.md                               — D3·D5 UI 제작 계약 모드
- .claude/agents/reviewer.md                              — D2 비평·[Design-element-rationale]·PX source
- .claude/agents/validator.md                             — D5-4 [Design-reuse-drift]
- docs/30-workitems/_templates/FEATURE_TEMPLATE.md        — D9 `## 7` 프로토타입 참조 형식
- docs/30-workitems/_templates/MILESTONE_TEMPLATE.md      — D1 `## 9` 채움 주체
- docs/30-workitems/_templates/TASK_TEMPLATE.md           — D5-3 재사용 line item·PX 태그
- docs/00-meta/_templates/STACK_SETUP_PLAN_TEMPLATE.md    — D6 registry 6필드
- scripts/README.md                                       — D6 UI adapter 생성 경계(ADR-058#amend-2 인용 재지정)
- .gitignore                                              — D3·D6 경로
- docs/00-meta/STRUCTURE.md                               — 산출물·로스터
- docs/00-meta/WORKFLOW.md                                — lifecycle·상태 전이
- docs/00-meta/DELEGATION_STRATEGY.md                     — 위임 표·스킬 순서
- docs/00-meta/PROJECT_START_CHECKLIST.md                 — 4단계
- docs/00-meta/GUARDRAILS_STRATEGY.md                     — 게이트 v3·유지 주기
- README.md                                               — 흐름·wrapper 목록
- README_ko.md                                            — 흐름·wrapper 목록

## 참고
- ADR-056(superseded — 승계 원천), ADR-058(#amend-4), ADR-073, ADR-059(#amend-1), ADR-060 D6·D7, ADR-009, ADR-064 D5, ADR-069(#amend-1), ADR-063 D6·D7, ADR-057#amend-3 결정 4, ADR-007#amend-5, ADR-047 D3, ADR-022.

<a id="adr-072-amend-1"></a>
## Amendment 1 (2026-09-11) — design gate 어댑터 3건 정정 (PM `--` / 자가 검사 케이스 수 / 단축 hex 오탐)

### 배경
dogfood Round 11(웹)에서 D6 어댑터를 실제로 돌려 얻은 실측 3건이다.
- [관측됨] **command template이 pnpm에서 깨진다.** D6과 템플릿은 `<pm> validate:design -- <args>`를 규정하는데, npm은 `--`를 제거해 스크립트에 넘기고 **pnpm은 리터럴로 그대로 넘긴다**. 어댑터의 `parseArgs`가 그 `--`를 «미정의 플래그»로 보고 `exit 2` 하므로, pnpm 프로젝트에서는 registry에 적힌 그대로의 명령이 실행되지 않는다.
- [관측됨] **«자가 검사 4케이스»가 웹 전용 프로젝트에서 도달 불가.** 케이스 (d)는 `pubspec.yaml`이 있는 scope의 Flutter fixture라 Dart가 없는 프로젝트에서는 실행되지 않는다. 정상 결과는 (a)(b)(c) 3케이스 PASS인데, 문구가 4를 요구해 «정상 통과»가 미달로 읽힌다.
- [관측됨] **`--tokens-only`의 단축 hex가 산문을 오탐한다.** 실측 18건 중 6건이 카피 문구 「PR #412 리뷰 반영」의 `#412`였다(fixture·테스트·컴포넌트). 3~5자리 단축 hex는 «#숫자» 형태의 이슈·번호 표기와 구별되지 않는다.

### 결정
1. **어댑터가 bare `--`를 무시한다.** 같은 command template이 npm·pnpm 양쪽에서 성립한다. registry에 기록할 때는 그 프로젝트 PM으로 **실제 1회 실행해 본 형태**를 적는다.
2. **자가 검사 통과 판정은 «케이스 수»가 아니라 «실행된 케이스가 전부 기대와 같은가»다.** (d)는 `pubspec.yaml`이 있는 scope에서만 실행되며, Dart가 없는 프로젝트의 정상 결과는 3케이스 PASS다. registry `self-test 일자` 칸에 실행 케이스 수를 함께 적는다.
3. **`--tokens-only`의 단축 hex 탐지를 스타일시트로 한정한다.** `.css`/`.scss`/`.sass`/`.less`에서는 3~8자리를 그대로 잡고, 코드 파일에서는 **6·8자리만** 잡는다. 대가는 «코드에 직접 쓴 `#abc` 단축 색을 놓친다»이며, 토큰 규율상 코드에 색 리터럴 자체를 두지 않으므로 수용한다.

### 근거
- 결정 1의 대안: 템플릿 문구를 PM별로 갈라 적는다 — 규정은 늘고 어댑터는 여전히 깨지기 쉬우며, caller가 `--`를 넣을지 판단하게 만든다. 기각.
- 결정 3의 대안: 문맥(색 속성 인접 여부)으로 판정한다 — 파서가 필요해 어댑터가 커지고, 프레임워크마다 스타일 표기가 달라 일반화가 어렵다. 기각. **오탐을 줄이되 미탐 방향으로 기운다** — `--tokens-only`는 보고 등급이고 차단하지 않으므로 이쪽이 안전하다.

### 강도 (ADR-022)
- enabling(약, [관측됨]) — 전부 기존 결정의 집행 정정이다. 새 차단·새 산출물이 없다.

### Mutation delta (ADR-047 D3)
- failure = registry의 command template이 그 프로젝트에서 실제로 안 돌거나, 정상 자가 검사가 미달로 읽히거나, tokens-only 보고가 오탐으로 채워져 신호가 죽는다 / falsifier = Round 12(Flutter monorepo)에서 (a) `npm run validate:design -- --self-test`가 4케이스로 돌지 않거나 (b) tokens-only가 Dart·TS 양쪽에서 실제 색 리터럴을 놓치면 결정 2·3 실패 / rollback = 본 amend superseded → `parseArgs`의 `--` 분기 제거, `LITERAL` 정규식 단일화, 문구 원복.

### 적용 surface
- .claude/skills/stack-guard/assets/design-gate.mjs       — 결정 1·3 (canonical sha 변경 — 재실행 계약대로 `copied-from` 갱신)
- .claude/skills/stack-guard/SKILL.md                     — 결정 1·2 문구
- docs/00-meta/_templates/STACK_SETUP_PLAN_TEMPLATE.md    — `## Design Gate Adapter` command template·self-test 일자 칸
- .claude/skills/stabilize-milestone/SKILL.md             — 결정 3 (§1.0 5-2 웹 계열 raw-hex 정규식 — **2026-09-11 추가**. amend-1 작성 시 «같은 정규식을 쓰는 다른 surface» 를 찾지 않아 누락됐고 Round 11 이 오탐 5건으로 잡았다 — dogfood 발견 26)

<a id="adr-072-amend-2"></a>
## Amendment 2 (2026-09-11) — plan 이 승인 표면을 대조하지 않는다 (계획 self-check 3축)

### 배경
dogfood Round 11(웹)에서 **같은 원인의 결함이 4건** 나왔다 — 전부 `/plan-workitem` 이 승인된 표면(매니페스트·DESIGN 인벤토리·FAC)을 보지 않고 task `## 3` 와 `## 7-1` 을 authoring 한 데서 나온다.
- [관측됨] **계측 이벤트가 승인 UI 콜백에서 발화 불가.** 계획이 `todo_add_rejected`(공백 거부)를 지시했으나 승인된 `TodoAdd` 는 공백 제출을 내부에서 삼키고 콜백을 부르지 않는다. 4개 격리 구현 중 **2개가 도달 불가 dead code 를 넣었고** 2개는 충돌을 스스로 발견했다.
- [관측됨] **신규 UI 요소가 인벤토리 등록 없이 제품에 들어갔다.** 저장 실패 배너를 `## 3` 가 지시하면서 `+ DESIGN.md ## 7 등록` line item 을 두지 않았고 어떤 AC 도 그 배너를 요구하지 않았다. validate 축 5 가 `P1 [Design-inventory-planless]` 로 **잡기는 했으나 구현이 끝난 뒤이고 비차단 기록 등급**이다. `[Design-reuse-drift]`(D5-4)는 *승인 파일의 변경*만 보므로 새 파일의 신규 요소에는 원리상 발화하지 않는다.
- [관측됨] **FAC↔AC 매핑이 «우변은 실재하나 의미가 빈» 상태.** `[FAC-semantic-hollow]` 가 두 feature·네 task **전부에서 6/6 재현**됐다(예: 「새로고침 유지」와 「쓰기 실패 알림」 두 FAC 가 같은 AC 를 가리키는데 그 AC 본문은 제3의 시나리오). ADR-037 커버리지 검사는 «우변이 실재하는 task:AC 를 가리키는가»만 보므로 아무도 의미를 대조하지 않는다.
- [관측됨] 나머지 2건(`source` 구분 불가 / 재읽기 실패 시 입력 유지 불가)도 동일 계열이다.

### 결정
1. **`/plan-workitem` 에 `3-S. 승인 표면 대조 self-check` 를 둔다** — 분해 직후 1회, 3축. 자동 차단은 하지 않고 전부 "남은 미결정 사항" 으로 surface 한다(ADR-007 책임 경계 유지).
2. **(a) UI 지시의 출처** — `## 3` 가 지시하는 사용자 가시 요소는 ① 승인 매니페스트 `source[]`·`px[]` 실재 ② DESIGN `## 7` 인벤토리 재사용 ③ 신규 중 하나여야 한다. ③이면 `+ DESIGN.md ## 7 등록` line item 을 같이 박고, 그 요소가 **승인 화면의 시각 표면을 바꾸면** 재승인 경로(`/design-milestone` 재진입 또는 다음 M — ADR-060 D6)를 surface 한다. 어디에도 못 넣는 UI 지시는 `## 3` 에 쓰지 않는다. 대응 AC 가 0개인 UI 지시도 surface 한다.
3. **(b) 계측의 배선 가능성** — 3-I 로 옮긴 각 이벤트를 매니페스트 `source[]` 의 컴포넌트 시그니처와 대조해 발화 가능한 것만 line item 으로 만든다. 불가능하면 `- 계측 배선 불가: …` 로 surface 한다. 판정 규칙 SSOT 는 3-S (b) 이고 3-I 는 포인터만 둔다.
4. **(c) FAC 매핑 행의 증명 문장** — `## 7-1` 의 각 매핑 행에 `— 증명: AC-M 의 <조건>이 FAC-N 의 <요구>를 검증한다` 1줄을 붙인다. 쓸 수 없으면 AC 문안을 고치거나 AC 를 추가한다. 둘 다 불가능하면 `- FAC 증명 불가: …` 로 surface 하되 **봉인을 자동 차단하지는 않는다**(unmapped 와 등급이 다르다). `## 7-3` PX 행에는 적용하지 않는다.
5. **validate-plan `[Plan-design]`·`[Plan-FAC-coverage]` 에 미러**한다(reviewer 동일 차원 포함) — plan 이 놓쳐도 계획 검증이 잡는 2-layer. 등급은 둘 다 `P1` 이며, 증명 문장 위반은 **unmapped 와 구분해** 보고한다.

### 근거
- 개별 패치(3-I 에 한 줄, 축 5 에 한 줄)를 4번 반복하는 대안은 기각했다 — 네 건의 원인이 하나이므로 규칙도 한 곳에 모아야 다음 사례가 같은 곳에서 걸린다. 대가는 3-S 가 plan 실행마다 3축을 돌아 **토큰·시간이 늘고 오탐 surface 가 늘 수 있다**는 것이다. 자동 차단을 붙이지 않아 오탐 비용을 사용자 판독으로 흡수한다.
- 증명 문장을 **차단 등급으로 올리지 않은** 이유: 의미 대조는 자동 판정이 어렵다. 사람이 읽는 한 줄을 강제하는 쪽이 기계 판정을 흉내 내는 것보다 정직하다.
- 대안 «validate-workitem 축 3 을 기록 등급 필수로 승격»은 **아직 채택하지 않고 승격 후보로 남긴다**(Round 12 재관측 후 판단) — 본 amend 는 계획 시점 처방이고, 그쪽은 구현 후 처방이라 효과가 겹치는지 먼저 본다.

### 강도 (ADR-022)
- 제약(중, [관측됨]): 결정 2 의 «어디에도 못 넣는 UI 지시는 쓰지 않는다».
- enabling(약, [관측됨]): 나머지 — 전부 surface 이며 차단하지 않는다.

### Mutation delta (ADR-047 D3)
- failure = plan 이 승인 표면과 무관한 `## 3`·`## 7-1` 을 쓰고, 결함이 구현 후에야 비차단 등급으로 드러난다(관측 4건) / predicted = Round 12 에서 dead code·미등록 요소 0건, `## 7-1` 전 행에 증명 문장 존재 / falsifier = Round 12 에서 (a) 3-S 를 돌렸는데 같은 계열 결함이 또 구현 후에 처음 잡히면 결정 1 실패 (b) 증명 문장이 형식만 채운 동어반복으로 나오면 결정 4 실패(그때는 문장 형식을 예시로 더 좁힌다) (c) surface 가 노이즈로 채워져 사용자가 전부 무시하면 오탐 비용이 편익을 넘는다 / rollback = 본 amend superseded → 3-S 제거, 3-I 의 계측 규칙 복원, 미러 2줄 삭제.

### 적용 surface
- .claude/skills/plan-workitem/SKILL.md                   — 결정 1~4 (3-S 신설, 3-I 는 포인터)
- .claude/skills/validate-plan/SKILL.md                   — 결정 5 미러
- .claude/agents/reviewer.md                              — 결정 5 미러
- docs/30-workitems/_templates/FEATURE_TEMPLATE.md        — 결정 4 `## 7-1` 행 형식

<a id="adr-072-amend-3"></a>
## Amendment 3 (2026-09-11) — 미리보기 하네스가 승인 화면에 가시 요소를 주입한다 (「승인본 = 제품」 등식 파손)

### 배경
dogfood Round 11(웹)에서 `/stabilize-milestone` §3-V 경험 게이트**만이** 잡아낸 P0 3건의 공통 원인이다.
- [관측됨] **게이트는 매니페스트 `preview: story:<id>` 를 렌더한다.** 그래서 스토리 데코레이터가 주입한 마크업이 그대로 승인 스냅샷에 들어간다. 실측: `TodoEmptyError.stories.tsx` 의 데코레이터가 `<h1>오늘 할 일</h1>` + 640px 컨테이너 + 패딩을 주입했고, 컴포넌트 `TodoEmptyError.tsx` 자체에는 `h1` 이 없다.
- [관측됨] **그 요소는 배선 task 가 제품에 만들 근거를 어디서도 받지 못한다.** 컴포넌트에도 `handoff.remaining_wiring[]` 에도 없기 때문이다. 결과: 제품 empty/error 상태의 `h1` **0개**, `main` 폭 **291.94px**(승인본 640px).
- [관측됨] **D5-4 `[Design-reuse-drift]` 는 통과했다** — proto 재렌더 ↔ 승인 스냅샷 **12/12 바이트 동일**. 즉 「재사용 task 표현 diff 0」이 *vacuous 하게* 충족된다. 비교 대상이 애초에 제품이 아니기 때문이다. `validate` exit 0 · `validate:e2e` 6/6 · axe 0 도 전부 green 이었다.
- Flutter 위젯 테스트 wrapper(`MaterialApp`·`Scaffold`·`AppBar`)도 정확히 같은 자리에 있다 — 웹 전용 현상이 아니다.

### 결정
1. **미리보기 하네스는 테마·뷰포트 provider 만 둔다.** 스토리 데코레이터(웹)·위젯 테스트 wrapper(Flutter)에 제목·헤더·랜드마크·네비게이션·카드 테두리·폭 컨테이너 같은 **가시 요소를 두지 않는다.** 허용은 렌더에 필요한 **무가시 provider** 뿐이다 — 테마/토큰 provider, 뷰포트·`setSurfaceSize`, 라우터·로케일·스토어 stub.
2. **화면의 가시 요소는 전부 매니페스트 `source[]` 에서 나온다.** 승인 렌더에 보이는데 `source[]` 파일에 없는 요소가 있으면 그 화면은 승인 대상이 아니다. 해소는 둘 중 하나다 — (i) 그 요소를 컴포넌트로 옮긴다(기본) (ii) 그 요소가 화면 밖 공용 셸이면 **셸을 별도 화면으로 등록**해 자기 `source[]`·스냅샷·배선 경로를 갖게 한다. 어느 쪽도 아닌 채로 승인하지 않는다.
3. **R6 승인 체크리스트에 「하네스 요소 0」 항목을 둔다**(design-milestone R6-5). 승인 직전에 렌더와 `source[]` 를 사람이 대조한다.
4. **탐지기는 이번에 만들지 않는다.** 게이트가 «데코레이터 없는 렌더를 추가 대조»하는 안은 Round 12(Flutter — wrapper 형태가 다르다) 재관측 뒤에 형태를 정한다. 지금은 규칙만 박는다.

### 근거
- 기각한 대안 (a) **매니페스트에 `decorator_provides[]` 를 두고 `handoff.remaining_wiring[]` 에 자동 편입**: 하네스가 가시 요소를 갖는 것을 *정상 경로로 승인*하게 된다. 그러면 승인 스냅샷은 영원히 제품보다 큰 화면이고, 배선 task 는 매번 「승인본에는 있으나 컴포넌트에는 없는 것」을 재현해야 한다 — 재현의 오라클이 스냅샷 이미지뿐이라 D5-3 의 «표현을 다시 쓰지 않는다» 와 정면으로 충돌한다.
- 기각한 대안 (c) **`product_entry` 가 있는 화면은 승인 시점에 제품 렌더도 함께 승인**: 제품 라우트는 배선 task 가 끝나야 존재하므로 승인 시점에 렌더할 것이 없다. 순서가 성립하지 않는다.
- 채택 근거: 원인은 «승인 대상의 경계가 어디까지인가»가 규정돼 있지 않았다는 것이다. D3 는 `source[]` 를 *코드 경로*로만 정의했고 «렌더에 보이는 것과 같은 집합인가»는 말하지 않았다. 결정 2 가 그 등식을 명시한다.
- 대가: 데코레이터로 세워 두던 화면 셸(제목·컨테이너)을 컴포넌트 안으로 옮기면 **컴포넌트가 자기 셸을 갖는다** — presentational 경계(D3)는 깨지지 않지만 화면 단위가 커진다. 셸을 공유하는 화면이 여럿이면 결정 2 (ii)의 별도 화면 등록이 그 비용을 흡수한다.

### 강도 (ADR-022)
- 제약(강, [관측됨]): 결정 1·2 — 승인 대상의 정의이며 위반 시 승인 자체가 무효다.
- enabling(약, [관측됨]): 결정 3·4.

### Mutation delta (ADR-047 D3)
- failure = 승인 스냅샷이 제품에 도달할 수 없는 요소를 포함하고, 그 사실을 §3-V 경험 게이트(마일스톤 말미)까지 아무도 모른다. 그 사이 D5-4·게이트·e2e·axe 는 전부 green 이다(관측됨).
- predicted = Round 12 에서 승인 화면의 가시 요소가 전부 `source[]` 안에 있고, §3-V 제품 대조가 「승인본에 있으나 제품에 없는 요소」 0건을 낸다.
- falsifier = (a) Round 12 에서 wrapper 가 여전히 가시 요소를 주입했는데 R6 체크리스트가 통과시키면 결정 3 실패(그때 탐지기를 만든다) (b) 결정 2 (i) 대로 셸을 컴포넌트에 넣었더니 화면 간 셸 중복이 3회 이상 생기면 (ii) 의 별도 화면 등록을 기본값으로 승격한다.
- rollback = 본 amend superseded → 데코레이터 제약 해제 + (a) 안(`decorator_provides[]`)으로 전환.

### 적용 surface
  (본 ADR 자신의 D3 `source[]`·D4 스냅샷에도 부기했다 — 자기 파일이라 surface 행으로 세지 않는다)
- .claude/skills/design-milestone/SKILL.md                — 결정 3 R6-5 체크리스트 항목
- .claude/agents/builder.md                               — 결정 1·2 ui-authoring 모드 산출물 규칙

## Amendment 4 (2026-09-11) — `구성 불확실` 이 미선택인 채로 `contract-ready` 를 통과한다

### 배경
dogfood Round 12 `today-list` 은 브리프 `## 13` 에 「E6 「습관 추가」 하단 배치 — R4에서 2안을 만들고 사용자가 고른다(취향 오라클 = 사용자)」를 남겼고, `## 15` 리스크 3(「2안 선택 전에는 하단 패딩 수치가 확정되지 않는다」)도 열어 뒀다. 그런데 R6 승인과 R7 `contract-ready` 승격이 **둘 다 통과했다.**

- [관측됨] R7-3 의 승격 조건은 `DECISION_REGISTER.md` 의 `open` 0건이다. 원장은 D-001~D-009 로 `closed 6 / deferred 3 / open 0` 이었다 — **A/B 선택은 원장에 행이 없다.** 브리프 `## 13` 은 원장 밖의 **병렬 미결 자리**이고, 어느 관문도 그 자리를 보지 않는다(발견 62).
- [관측됨] 결과적으로 코드의 enum 기본값 `AddButtonLayout.extendedFab` 이 사용자가 자기 몫으로 유보한 선택을 조용히 대신했고, 승인 스냅샷 26장이 그 기본값으로 동결됐다.
- [관측됨] 더 근본적으로, **볼 것이 한쪽뿐이었다.** R4 규정의 「`구성 불확실`이면 `A`/`B`」는 **웹 갈래에만** 붙어 있다(스토리 id 가 축을 자연히 갖는다). Flutter 갈래는 테스트 파일 한 줄뿐이고 PNG 이름 `<screen>-<state>-<w>x<h>.png` 에 축이 없다. builder 는 두 안을 전부 렌더했지만(22 케이스 통과) 파일명 충돌을 피하려 저장을 A안에만 걸었다 — 프로필 비대칭이다(발견 63).
- [관측됨] 사후 확인: 저장 가드를 상태 접미사(`<state>-A|B`)로 풀어 재실행하니 22장이 충돌 없이 나왔고, 두 안의 차이(마지막 행을 가리는 범위)가 그림에서 바로 보였다. **상태 축 하나면 충분하다.**

### 결정
1. **A/B 를 상태로 모델링한다** — `구성 불확실` 화면은 선택이 렌더에 보이는 상태마다 `<state>-a`·`<state>-b` 두 상태를 매니페스트에 등록한다. 새 스키마 필드를 두지 않는다(`## 매니페스트 schema (v1)` 주석 참조). Flutter 위젯 테스트는 그 상태 id 로 group·PNG 이름을 낸다.
2. **R4 가 원장 행을 만든다** — `구성 불확실` 화면마다 `DECISION_REGISTER.md` 에 `authority: user-choice` · `status: open` 행을 만들고 브리프 `## 13` 이 그 `D-NNN` 을 인용한다. 새 탐지기를 만들지 않는다 — **R7-3 의 기존 `open` 검사가 그대로 그물이 된다.**
3. **R6-5 승인 체크리스트에 두 줄** — (i) 대상 화면 브리프 `## 13` 이 「없음」이거나 그 `D-NNN` 이 원장에서 `closed` 인가 (ii) A/B 화면은 **두 안의 렌더가 모두** `design-gate-shots/` 에 있는가(선택 전 시점 — #amend-5 결정 7 (iv)).
4. **R5 는 선택 확정 후 재촬영한다** — 탈락 상태·코드·테스트를 지우고 남은 상태의 스냅샷을 다시 찍는다. 선택에 딸린 수치(하단 패딩 등)가 그때 확정되기 때문이다.

### 근거
- 결정 2 만 하면 원장 행은 생기지만 **볼 렌더가 없어 선택 자체가 불가능하다** — 62 를 고쳐도 63 이 남는다. 결정 1 만 하면 렌더는 둘 다 남지만 아무도 선택을 요구하지 않는다. **둘 다 한다.**
- 결정 1 의 대안 「`states[].variant` 필드 신설 + 게이트 PNG 명명 확장」을 택하지 않았다: (i) 웹은 이미 스토리 = 상태로 표현하므로 표기가 둘이 된다 (ii) 게이트 어댑터를 또 건드려야 한다 — 이번 라운드에 그 파일에서 이미 P0 2건(발견 54·58)이 나왔다 (iii) 얻는 것은 «두 상태가 한 선택의 양안임» 을 기계가 아는 것뿐인데, 그 정보는 브리프 `## 13` 과 원장 행이 이미 갖고 있다.
- 대가: 상태 수가 는다(선택이 보이는 상태 × 2). R6 렌더 시간이 그만큼 늘고, 선택 후 R5 가 절반을 지운다.

### 강도 (ADR-022)
- 제약(강, [관측됨]): 결정 2·3 — 미선택 상태로는 `contract-ready` 에 닿지 못한다.
- 제약(중, [관측됨]): 결정 1·4.

### Mutation delta (ADR-047 D3)
- failure = 사용자가 자기 몫으로 유보한 구성 선택이 코드 기본값으로 조용히 결정되고, 그 상태로 승인 스냅샷 동결과 `contract-ready` 승격까지 간다(관측 1건, Round 12 `today-list`).
- predicted = Round 13 에서 `구성 불확실` 화면은 (i) 원장에 `open` 행을 갖고 (ii) 두 안의 렌더가 모두 남고 (iii) 선택 전에는 R7-3 이 승격을 막는다.
- falsifier = (a) 상태 접미사가 상태 수를 불려 R6 렌더 시간이 유의하게 늘면(웹 Storybook 재빌드 포함 1화면 기준 2배 이상) 결정 1 을 `variant` 필드로 되돌린다 (b) 원장 행이 있는데도 승격이 통과하면 원인은 원장이 아니라 **R5 진입 자체**이므로 R5 를 silent-skip 금지 관문으로 승격한다 (c) `구성 불확실` 이 3안 이상으로 나오는 실측이 1건이라도 있으면 `-a`/`-b` 명명을 `-<slug>` 로 일반화한다.
- rollback = 본 amend superseded → 상태 접미사·원장 행·체크리스트 2줄 제거, 웹 갈래의 `A`/`B` 스토리 규정만 복원.

### 적용 surface
- .claude/skills/design-milestone/SKILL.md — 결정 1·2·3·4 (R4·R5·R6-5)

<a id="adr-072-amend-5"></a>
## Amendment 5 (2026-09-13) — 게이트 보류 탐지기 4건 + 승인본 충실도 묶음 + R1 화면 정의

### 배경
- [관측됨] `--tokens-only`가 JS 스타일 객체의 단위 없는 숫자(`style={{ maxWidth: 640 }}`)를 잡지 못한다(발견 20). 반대로 stabilize 5-2는 `Colors.transparent`를 예외로 뒀는데 게이트는 아직 잡는다(불일치).
- [관측됨] Flutter 어댑터는 `flutter test` 실행당 항목 1개에 `viewport: null`이라 뷰포트 루프를 빠뜨린 테스트도 `blocker 0`이다(발견 53). 규칙(«--snapshot 없는 0건을 커버리지 증거로 읽지 마라»)만 있고 report는 정직하지 않다. 테스트 이름에는 이미 `<w>x<h>`가 들어 있다.
- [관측됨] 승인본이 결정을 담지 않은 세 사례(23 데코레이터 주입·58 렌더 조건 무시·69 글꼴 미적재)가 한 라운드에 나왔다. R6-5 체크리스트에 항목은 있으나 흩어져 있고, 자가 검사는 렌더 조건 적용을 검사하지 않는다.
- [관측됨] 승인 컴포넌트의 행동 변경 규칙(D5-3-1)은 있으나 고지 누락을 아무도 보지 않는다(발견 40). 단일 라우트 앱에서 «화면»이 흔들렸다(발견 9).

### 결정
1. **`--tokens-only` 확장**: 코드 파일에서 같은 줄에 `style={{` 또는 `style: {`가 있으면 그 줄의 `\b(width|height|maxWidth|minWidth|maxHeight|minHeight|margin\w*|padding\w*|top|left|right|bottom|gap|fontSize|borderRadius)\s*:\s*(?:[2-9]|[1-9]\d+)\b`를 리터럴로 잡는다(0·1은 토큰 대상이 아니고 `lineHeight`는 배수라 제외). `Colors.transparent`는 제외한다(stabilize 5-2와 정합).
2. **Flutter report 뷰포트 축(기록 등급)**: 어댑터는 `flutter test`가 `DESIGN_GATE_OUT`에 남긴 PNG 파일명 `<screen>-<state>-<w>x<h>.png`(ADR-072 D6의 기존 계약)에서 **실제로 렌더된 (상태 × 뷰포트)**를 읽어 (화면 × 뷰포트)마다 `screens[]` 항목을 만든다(`viewport: {w,h}`, `state` 필드 추가). 각 상태의 기대 뷰포트는 `states[].render.viewports`가 있으면 그것, 없으면 프로필 뷰포트다. 기대에 없는 (상태 × 뷰포트)는 `reports: [{ rule: 'viewport-coverage', state, detail: 'expected …, rendered …' }]`로 **보고**한다 — 차단이 아니다. **PNG가 하나도 없으면 `viewport: null` 항목 하나로 하위 호환하되 `reports`를 비우지 않고 `viewport-coverage-unavailable`(«측정 불가»)를 남긴다** — 「대상 0건」과 「위반 0건」을 구분하는 것은 ADR-073#amend-2 결정 3과 같은 원칙이고, 침묵하면 R4 규약 미적용이 통과로 읽혀 아래 falsifier (a)를 관측할 수 없다. 이유: 위젯 테스트의 group 이름에 `<w>x<h>`를 넣는 규약은 아직 어디에도 적혀 있지 않고(기존 복제본은 관행일 뿐), 문자열 검사만으로 차단 등급을 주지 않는다(ADR-063 D6). R4 생성 규칙과 builder ui-authoring 모드에 «상태·뷰포트마다 `group('<state> <w>x<h>')` + PNG 저장» 규약을 이번에 박고, 차단 승격은 그 규약이 실제 생성물에 들어간 다음 라운드 후보다. D6의 «--snapshot 없는 0건을 증거로 읽지 마라» 문장은 «report의 `viewport-coverage`와 PNG 파일명이 증거다»로 대체한다.
3. **자가 검사 (e) 렌더 조건**: 임시 매니페스트에 두 번째 known-good HTML(`good2`)을 가리키는 상태 `{ id: 'narrow', preview: 'url:<good2>', baseline: true, render: { viewports: [{w:320,h:720}] } }`를 두고, `--snapshot` 결과에 `self-good-narrow-320x720.png`가 있고 report의 `preview`가 `good2`인 항목의 `viewport.w`가 320인지 본다(`baseline: true`가 없으면 스냅샷 분기가 그 상태를 건너뛴다 — 코드 455행 `isBaseline`).
4. **하네스 주입 정적 관찰(기록 등급)**: `--manifest` 실행 시 웹은 화면 `source[]`의 `*.stories.*`에서 `decorators` 배열 안 JSX 태그 중 provider·wrapper 허용 목록(`ThemeProvider|MemoryRouter|div(style만)|Fragment`) 밖의 태그(`h1~h6|header|nav|main|footer|aside|p|span|button|a`)가 있으면, Flutter는 `test/screens/*_prototype_test.dart`의 `pumpWidget(` 인자 안에서 화면 위젯 밖에 `Scaffold(|AppBar(|Text(|Icon(`이 있으면 `reports: [{ rule: 'harness-injection-suspect', … }]`를 낸다. 차단 아님 — R6-5 «하네스 요소 0» 사람 확인이 여전히 관문이다.
5. **행동 변경 고지 관찰(기록 등급)**: validator는 `승인 UI 재사용` task의 `source[]` diff에 행동 토큰(`on[A-Z]\w+\s*[:=]`, `setState(`, `useState(`, `useEffect(`, `useReducer(`, `useCallback(`, `Timer(`, `debounce|throttle`, `.then(`, `await `)이 있는데 task `## 8`(또는 repair `## 5`)에 `승인 컴포넌트 행동 변경:` 고지 줄이 없으면 `P2 [Design-behavior-drift] <file> — 고지 누락`을 낸다.
6. **R1 화면 정의**: 화면은 라우트가 아니라 «사용자가 한 번에 보는 상태 묶음»이다. 단일 라우트 앱은 상태 묶음 단위로 화면을 도출하고, 브리프 첫 줄에 `- 화면 도출 메모: <라우트/상태 묶음 근거>`를 남긴다(D1 R1 부기).
7. **R6-5 «승인본 충실도» 묶음**: 승인 체크리스트의 흩어진 항목을 한 묶음으로 둔다 — (i) 하네스 요소 0(#amend-3) (ii) 결정 글꼴 실재(ADR-073#amend-1) (iii) 렌더 조건 적용(스냅샷 파일명 `-<w>x<h>`·report viewport·`viewport-coverage` 0) (iv) A/B 화면은 **R5 선택 전**에 두 안의 렌더가 있었고, **선택 후**에는 선택본 렌더 + 원장 `D-NNN` `closed`(#amend-4 결정 3(ii)의 «두 안 모두 실재»는 선택 전 시점을 뜻한다 — 이 문장으로 정정) (v) 렌더 카피 = 브리프 카피. 하나라도 아니면 승인하지 않는다.
8. **D8 재진입 상태 문구 정정**: «UI 마일스톤은 `draft` 유지»는 **최초 작성**의 규칙이다. `contract-ready` UI M을 텍스트 계약 수정으로 재실행하면 상태를 바꾸지 않는다(강등 전이 없음 — ADR-060 D6). plan-milestone Exit 문장을 «UI 마일스톤: 재대조만 통과시키고 **상태는 그대로 둔다**(최초 작성이면 `draft`, 재진입이면 `contract-ready`)»로 고친다.

### 강도 (ADR-022)
- 제약(중, [관측됨]): 결정 7.
- enabling(약): 결정 1·2·3·4·5·6·8.

### Mutation delta (ADR-047 D3)
- failure = 단위 없는 숫자 미검출 / Flutter 뷰포트 누락 침묵 / 렌더 조건 자가 검사 부재 / 주입·행동 변경 미관찰 / 재진입 상태 문구 충돌 (관측됨). predicted = Round 14 R6에서 `viewport-coverage` 0·자가 검사 (e) PASS, 주입 의심 report가 사람 확인과 일치, contract-ready 재진입이 상태를 바꾸지 않음. falsifier = (a) PNG 파일명 파싱이 정상 테스트에서 «rendered 없음»을 내면(테스트가 PNG를 안 남김) R4 규약 위반으로 분류하고 그 규약을 먼저 박는다 (b) harness-injection-suspect 오탐이 report의 절반을 넘으면 허용 목록을 넓힌다 (c) 결정 1이 카운트·인덱스 값을 잡으면 속성 목록을 좁힌다. rollback = 각 결정 개별 삭제.
- 예산 영향 = validator(축 5)에 관찰 항목 1개 추가 — `maxTurns 16` 유지, slice 기준 무변경. 그 외 없음.

### 적용 surface
- .claude/skills/stack-guard/assets/design-gate.mjs — 결정 1·2·3·4
- .claude/skills/design-milestone/SKILL.md — 결정 2(R4 group·PNG 규약·R6-2 문장)·6(R1)·7(R6-5)
- .claude/skills/plan-milestone/SKILL.md — 결정 8 (Exit 문장)
- .claude/agents/builder.md — 결정 2 (ui-authoring 모드의 위젯 테스트 group·PNG 규약)
- .claude/agents/validator.md — 결정 5
- .claude/skills/validate-workitem/SKILL.md — 결정 5 (UI 항목 한 줄)
- .claude/skills/stack-guard/SKILL.md — 자가 검사 케이스 수 (e) 반영
