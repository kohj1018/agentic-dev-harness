---
name: design-milestone
description: UI 마일스톤의 화면 경험 계약을 코드 프로토타입으로 확정한다 — 화면 브리프(요소 근거) → 스택 네이티브 presentational 코드·상태별 fixture → 게이트·픽셀 판정 → 사용자 승인·스냅샷 동결 → feature ## 7 기입 → contract-ready. plan-milestone 뒤, plan-workitem 앞.
argument-hint: "M<N> [--fast] [--screens <id,...>]"
disable-model-invocation: true
allowed-tools: Read Glob Grep Write Edit Agent Bash(node .claude/skills/bootstrap-design/assets/capture-refs.mjs*) Bash(pnpm validate:design*) Bash(npm run validate:design*) Bash(yarn validate:design*) Bash(bun run validate:design*) Bash(pnpm build-storybook*) Bash(npm run build-storybook*) Bash(yarn build-storybook*) Bash(bun run build-storybook*) Bash(flutter test*) Bash(npx playwright*) Bash(git ls-files*)
---

# /design-milestone

> 모드: How-to (UI 마일스톤 경험 계약 라운드 — ADR-072)
> 패턴: 메인 세션이 R0~R7을 직접 운전한다(`context: fork` 미명시). 브리프 authoring은 designer, 코드 authoring은 builder(UI 제작 계약 모드), 비평·픽셀 판정은 reviewer(design surface), 갤러리 후보는 researcher — 전부 `Agent` 단발 sub-call. 종료 후 `/clear` 권장.
> 계약 SSOT: 라운드·코드 규칙·매니페스트·스냅샷·UI 제작 계약은 ADR-072. 게이트 품질 계약은 ADR-058 D3, 실행물은 ADR-072 D6. DESIGN.md 내용·프로필·§10은 ADR-073. 갤러리 절차는 ADR-058#amend-4.

**Codex**: wrapper `$design-milestone`. `Agent` 위임(designer·builder·reviewer·researcher)은 메인 세션이 각 persona 파일을 읽고 **순차 인라인** 수행하며 생략하지 않는다. 생성(designer/builder)→감사(reviewer) 전환은 명시적 단계로 끊고 산출물·최종 출력에 `under-verified: 동일 세션 감사`를 적는다(ADR-058 D5). 게이트·캡처는 그대로 실행한다.

## 입력·모드
- `$ARGUMENTS` = `M<N>`(`M[0-9]+`만 허용). `--fast`: R2 갤러리 생략 + 브리프 요소 근거를 «핵심 요소만»으로 축약. 다른 라운드는 생략하지 않는다.
- **입력 분기**: (a) `draft` M + 대상 화면 미완 → 미완 라운드부터 재개(완료 화면 skip — 매니페스트 `approved.date` 유무로 판정). (b) `draft`·`contract-ready` M의 재진입 대상은 셋 — (i) `프로토타입:`·`프로토타입 면제:` 둘 다 없는 UI feature의 화면(최초·추가) (ii) `- 계약 수정:` 마커가 남은 UI feature의 승인 화면(브리프 delta → 재승인; 마커 자체는 plan-workitem 재검증 규칙대로 남긴다) (iii) `--screens <id,...>`로 지정된 승인 화면(`/repair-plan` 4-M·사용자 요청). (ii)(iii)는 R3부터 돌고 같은 M 스냅샷을 대체한다. **(iii)로 화면·PX·카피 의미를 바꾸면 그 화면을 쓰는 feature에 `- 계약 수정: <날짜> — 이 feature의 task 재검증 필요` 마커를 남긴다**(ADR-060 D6 — 이미 만들어진 task가 재검증 없이 통과하는 것을 막는다; 마커 회수는 plan-workitem 규칙 그대로). **매니페스트에 등록됐는데 `approved`가 비어 있는 화면은 (i)(ii)(iii)와 무관하게 항상 재개 대상이다**(재승인 중 중단 복구 — feature `## 7`에 이전 참조가 남아 있어도 누락되지 않는다). `contract-ready`는 유지(강등 없음). (c) `ready` + `- 봉인일:` 채움 → 거부 + «변경은 M<N+1>». (d) 비-UI M(산하 feature `## 11` `Design:` 줄 0) → «비-UI 마일스톤 — /plan-workitem M<N>» 안내 후 종료.

## 반드시 먼저 읽을 파일
- 마일스톤 문서 `## 1~4`·`## 9`, 산하 feature `## 2`·`## 3`·`## 7`·`## 8-1`·`## 11`
- `docs/20-system/DESIGN.md` 전체 (`## 0` 프로필 매핑표 · `## 1` 정체성(thesis·signature·imagery — 브랜드 근거) · `## 2`~`## 11`)
- `docs/20-system/prototypes/_theme/manifest.json` (R6 테마 배선 — 재사용 대상)
- 이전 마일스톤 `docs/20-system/prototypes/M<K>/manifest.json`(있으면 — 공용 컴포넌트·`supersedes` 후보 판정)
- `docs/00-meta/STACK_SETUP_PLAN.md ## Design Gate Adapter`·`## Stack Decision Registry`(UI 킷·미리보기 도구)
- `docs/20-system/ARCHITECTURE_OVERVIEW.md ## 3-1`(컴포넌트 디렉터리)·`## 7-4`/`## 7-5`

## R0 — preflight + 회수
1. 전제 확인(하나라도 아니면 무엇을 먼저 돌릴지 안내 후 종료): M `draft`(또는 분기 b) / 산하 feature에 `## 3`·`## 7 FAC` 있음 / DESIGN `## 0 Status` ≠ draft + 프로필 매핑표 있음 / Design Gate Adapter `status: ready` / `_theme/manifest.json` 존재(없으면 «`/bootstrap-design` R6 먼저»).
2. 대상 화면 = 입력 분기 (b)의 (i)(ii)(iii). 비-UI feature는 `## 7`에 `프로토타입 면제: 비-UI feature` 자동 기입. 중단 재개는 화면별로 판정한다(매니페스트 `approved` + feature `## 7` 기입 여부). **두 신호가 어긋나면 재개한다**(보수적 — 둘 다 참일 때만 skip). 중단은 바로 그 둘 사이에서 일어나기 때문이다 — 매니페스트를 쓰고 feature 를 못 쓴 채 끊기거나 그 반대. 엇갈림 자체를 출력에 `재개 신호 엇갈림: <screen> (매니페스트 <값> / feature `## 7` <값>)` 한 줄로 남긴다 — 직전 실행이 중간에 끊겼다는 신호다(dogfood Round 12 회귀 (e) 실측).
2-F. **폰트 배선 확인 (ADR-073#amend-1 결정 3 — 차단)**: DESIGN `## 3` 에 `- 배선: 미배선` 표기가 있으면 **스냅샷 승인을 진행하지 않고** «`/bootstrap-design --update` R6-1 로 폰트를 먼저 배선하세요» 안내 후 종료한다. 표기가 없어도 전달 방식이 self-host·앱 번들이면 **선언 실재를 1회 대조한다** — 웹 `@font-face`/`next/font/local`, Flutter `pubspec.yaml` `fonts:`. 0건이면 같은 경로로 돌려보낸다. **이유**: 글꼴이 없는 채로 찍힌 기준선은 «승인본 = 제품» 등식을 깨는데, 그림 자체는 정상으로 보여 사람이 알아채지 못한다(Round 12 실측 — 웹은 fallback 렌더, Flutter 는 tofu).
3. DESIGN `## 11` 확인일이 12개월 초과면 «researcher 재확인 권장» 1줄(자동 갱신 아님).
4. 이전 M 매니페스트에서 공용 컴포넌트 목록을 회수한다(재사용 후보). 대상 화면이 이전 M 승인 화면의 공용 컴포넌트·토큰을 바꾸면 그 화면을 이 M에 `supersedes`로 재등록할 후보로 표시한다(ADR-072 D5-5).
5. DESIGN `## 10`이 v1 형식(언어 블록·용어 사전 없음)이면 «`/bootstrap-design --update`로 §10 v2 마이그레이션 먼저» 안내 후 종료(구 plan-milestone R5의 §10 신설 경로 승계).

## R1 — 화면 목록 · 전환표 · 프로필 배정
- feature `## 3` 시나리오에서 화면을 도출한다(feature당 대표 1화면 기본, 다화면은 협의, 총 6~8화면 초과 시 우선순위 협상 + 세션 분할 안내).
- **이전 M 승인 화면 재사용 판정**: 도출한 화면이 이전 M 매니페스트에 이미 승인돼 있고 이번 M에서 **구성·카피·PX가 바뀌지 않으면** 새로 제작하지 않는다 — 제작 대상에서 빼고 R7에서 그 feature `## 7`에 `프로토타입: M<K>/<screen>`을 기입한다(ADR-072 D9 재사용 형식). 공용 컴포넌트·토큰이 바뀌었으면 재사용이 아니라 R0 4의 `supersedes` 재등록 대상이다.
- 각 화면에 프로필(DESIGN `## 0` 매핑표)을 배정한다 — 기준 뷰포트가 여기서 정해진다.
- **화면이 2개 이상이거나(다화면), 단일 화면이라도 비가역·파괴 동작(삭제·결제·전송)·분기·다단계 오류→복구·modal이 있으면** 마일스톤 `## 9. 화면 전환` 표를 채운다(ADR-072 D1 — ADR-056#amend-3(현재 SSOT: ADR-072 D1) 승계, 그 amendment의 적용 범위가 «다화면·복구 흐름»이다; 순수 정적 단일 화면이면 «(해당 없음)»).
- 화면 id는 kebab-case(`<screen>`) — 매니페스트·PX·브리프·코드 디렉터리가 같은 id를 쓴다. **숫자로 끝나지 않는다**(PX 문법 `\d{2,}$` 파싱 보호).
- **제작 대상이 0개면**(전 화면이 이전 M 재사용·면제) R2~R6를 건너뛰고 **R7만 수행한다** — feature `## 7`에 재사용 참조·PX를 기입하고 정합 재대조 후 `contract-ready`. 이 M 매니페스트는 만들지 않는다(하류 검사는 `프로토타입:` id가 가리키는 M을 본다).
- 출력 압축 포맷(`이번 결정 / 확인 필요 / 답변`)으로 사용자 확인 1회.

## R2 — 레퍼런스 갤러리 (ADR-058#amend-4 절차 공유 — `--fast` 생략)
- 화면 유형별(온보딩·목록·상세·폼·결제·오류 복구 등)로 researcher에 갤러리 후보를 요청한다(1층 uibowl.io·Mobbin·Refero·스토어 스크린샷 우선, 2층 실제 제품, 4층 getdesign.md 분석본은 R0 노트 재사용).
- `docs/20-system/design-refs/refs.json` 작성 → `node .claude/skills/bootstrap-design/assets/capture-refs.mjs` 실행 → `gallery.html`을 사용자에게 열게 하고 선택·메모를 받는다(취향 오라클 — 추천은 요청 시만). 3층 inbox 캡처 요청은 여기서 한다.
- 선택본을 `DESIGN_RESEARCH.md ## 레퍼런스`에 항목 추가(`출처 유형`·`사용 주의` 포함, 뒷받침한 결정 = 화면 id).

## R3 — 화면 브리프 (designer) → reviewer 비평 → 사용자 승인
- 화면마다 designer 단발 sub-call로 `docs/20-system/prototypes/M<N>/briefs/<screen>.md`를 작성한다(ADR-072 D2 항목 전부 — 목적(비즈니스 목표·시나리오), 브랜드 정체성 부합(DESIGN `## 1`), **요소마다 근거 4문항**, 상태, 카피(§10 언어 블록·용어 사전), 인터랙션 계약, 접근성, 프로필, 재사용 vs 신규, PX 후보, `구성 불확실` 표시).
- **reviewer(design surface) 단발 sub-call이 사용자보다 먼저 본다**: `[Design-element-rationale]`(근거 없는 요소) · `[Design-donts]` · `[Design-voice]`(렌즈·용어 사전) · `[Design-inventory]`(인벤토리 외 신설) · 과잉 요소. 차단 항목은 designer 재작성(≤2회).
- 사용자 승인(화면 단위, 압축 포맷). `구성 불확실` 화면은 방향 2안을 Decision Brief로(user-choice, 추천 블록은 요청 시). 승인된 브리프의 카피가 곧 실카피다.

## R4 — 코드 초안 (builder, UI 제작 계약 모드)
- **slice 크기 (ADR-004#amend-7 결정 3)**: 한 dispatch 의 산출물이 **4개를 넘으면 쪼갠다.** 실측(Round 12 R4): «화면 1개 + fixtures + 스토리/위젯 테스트 + 갤러리 등록 + 검증»을 한 dispatch 에 넣었더니 **두 builder 가 다 턴 상한에서 보고 없이 멈췄다**(작업은 거의 끝난 상태였다). 화면이 둘이면 화면마다, 한 화면의 산출물이 많으면 «코드+fixtures» / «스토리·테스트» 로 가른다.
- 화면마다 builder 단발 sub-call(dispatch에 `mode: ui-authoring` 명시 — 입력: 승인 브리프 + DESIGN 토큰·`_theme` 배선 경로 + 재사용 컴포넌트 목록 + ADR-072 D3 규칙 + 추적 헤더 형식 + PX 마커 문법). **presentational만** — props-in/callbacks-out, fetch·store·router 금지.
- 웹: `screens/<screen>/<Screen>.<ext>` + `<Screen>.stories.<ext>`(확장자는 스택 관례 — `.tsx`/`.vue`/`.svelte`; 상태별 스토리: happy + 못생긴 상태 5종 + category state, `구성 불확실`이면 `A`/`B`) + `fixtures.<ext>`(출처 표기). Flutter: `lib/screens/<screen>/` + `lib/prototype/main.dart` 갤러리 등록 + `test/screens/<screen>_prototype_test.dart`(프로필 크기 렌더 + guideline 4종 + overflow 0 + PNG — ADR-059#amend-1 결정 2·3). **폰트·아이콘 적재 (ADR-073#amend-1)**: 위젯 테스트는 pubspec 선언 폰트를 자동 적재하지 않는다 — `test/support/load_fonts.dart` 를 두고 `setUpAll(loadAppFonts)` 로 부른다. **`FontManifest.json` 을 읽어 선언된 패밀리를 전부 적재**한다(패밀리를 손으로 나열하면 폰트를 추가할 때마다 뒤처진다). **`MaterialIcons` 도 그 매니페스트에 있다** — 빠뜨리면 체크 표시·「+」가 네모로 남는다. 적재하지 않으면 스냅샷이 육안 대조에 못 쓰일 뿐 아니라 **`meetsGuideline(textContrastGuideline)` 의 판정이 뒤집힌다**(tofu 는 획이 굵어 통과하고 실제 글꼴은 실패한다 — Round 12 실측).
- 각 코드에 PX 마커 주석을 단다(브리프 PX 후보 → 확정 id). 토큰 외 리터럴 금지.
- 매니페스트 `docs/20-system/prototypes/M<N>/manifest.json`에 화면을 등록한다(**`scope`는 그 화면 코드가 있는 패키지 디렉터리 — 단일 패키지는 `.`, monorepo는 `apps/web`·`apps/mobile` 등. 게이트가 어댑터 명령을 돌릴 작업 디렉터리다**; `states[]`는 `{id, preview}`로 상태별 스토리 id·테스트 group까지, 브리프의 «승인 필요 상태»는 `baseline: true`; `approved`·`product_entry`는 비움).
- **`구성 불확실`(A/B) 화면 (ADR-072#amend-4)** — 두 가지를 함께 한다.
  - **상태 쌍으로 등록**: 선택이 **렌더에 보이는 상태마다** `<state>-a`·`<state>-b` 두 상태를 `states[]` 에 둔다(`default-a`/`default-b`/`overflow-a`/`overflow-b` …). 웹은 스토리 id 가, Flutter 는 위젯 테스트 group 과 PNG 이름이 그 id 를 따른다. **`variant` 필드를 새로 만들지 마라** — 상태로 두면 `baseline`·`render`·스냅샷 명명이 전부 기존 기계를 그대로 쓴다. Flutter 에서 A/B 를 위젯 파라미터로 받아 한 테스트 안에서 돌리면 **PNG 파일명이 겹쳐 한 안이 조용히 덮인다**(Round 12 실측: 그래서 builder 가 저장을 A안에만 걸었고 B안 렌더가 한 장도 남지 않았다).
  - **원장 행을 만든다**: `DECISION_REGISTER.md` 에 `authority: user-choice` · `status: open` 행을 만들고, 브리프 `## 13` 이 그 `D-NNN` 을 인용하도록 고친다. R7-3 의 기존 `open` 검사가 그대로 그물이 되므로 새 검사기는 만들지 않는다.
- builder 반환은 경로·PX 목록·남은 리스크만(코드 전문 금지).

## R5 — 선택·수정 루프 (사용자)
- 안내: «`npm run storybook`에서 `Screens/<screen>` 스토리(또는 `flutter run -t lib/prototype/main.dart`)를 열어 상태별로 확인해 주세요. 원하시면 추천을 요청하실 수 있어요.»
- 피드백은 builder 재생성으로 반영(사용자 직접 편집 X). 브리프와 어긋나는 변경 요청은 브리프를 먼저 고친다. 2사이클 미수렴 시 브리프 재검토.
- **`A`/`B` 화면은 두 안의 렌더 경로를 나란히 제시한다** — `design-gate-shots/<screen>-<state>-a-…png` 와 `-b-…png` 를 상태별로 짝지어 안내한다. 한쪽만 있으면 R4 로 되돌아간다(선택을 요청해 놓고 볼 것을 한쪽만 주지 않는다).
- 선택 확정 후: 탈락안 상태·스토리·코드(enum 값·분기)·테스트를 **삭제**하고, 그 `D-NNN` 을 원장에서 `closed`(disposition·근거 기입)로 닫고, 브리프 `## 13` 을 「없음 — D-NNN 에서 <선택> 확정」으로 고친다. **남은 상태의 스냅샷은 다시 찍는다** — 선택에 딸린 수치(하단 패딩·컨테이너 폭 등)가 그때 확정되기 때문이다.

## R6 — 게이트 + 픽셀 판정 + 승인 + 스냅샷
1. `STACK_SETUP_PLAN.md ## Design Gate Adapter` `status: ready`가 아니면 `Needs Design Gate: /stack-guard` + 승격 보류(silent skip 금지).
2. `validate:design -- --manifest docs/20-system/prototypes/M<N>/manifest.json --only <이번 대상 화면>` 실행(같은 세션에서 **코드 변경 없이** 반복할 때만 `--no-build` — builder 재생성 뒤에는 반드시 재빌드한다, ADR-072 D6). exit 1 blocker는 builder에 selector·요약을 되먹여 재생성(≤2회), 초과 시 승인 보류 + 브리프 재검토. exit 2면 사유 echo + 보류.
3. `--tokens-only <screens 경로>` 결과가 0건이 아니면 고치거나 브리프에 사유를 적는다(승인 체크리스트 항목 — 이 모드는 렌더 출력을 지우지 않는다).
4. reviewer(design surface) 단발 sub-call이 `design-gate-shots/`를 Read로 열람해 위계·밀도·slop·overlap·도메인 fit을 판정(차단은 재생성).
5. 사용자 최종 승인(화면 단위). **승인 체크리스트**: happy + 못생긴 상태 5종 + category state 렌더됨 / 실카피(§10) / 인터랙션 계약 테스트(키보드·포커스·취소·콜백) 존재·통과 / PX 마커 ≥1 / 토큰 외 리터럴 0 또는 사유 / 접근성 blocker 0 / **하네스 요소 0**(ADR-072#amend-3) — 렌더에 보이는 가시 요소가 전부 그 화면 `source[]` 파일 안에 있는가. 데코레이터·wrapper 가 넣은 제목·헤더·랜드마크·폭 컨테이너가 하나라도 보이면 **승인하지 않는다**: 컴포넌트로 옮기거나 공용 셸을 별도 화면으로 등록한 뒤 재렌더한다. 대조는 `design-gate-shots/` 렌더와 매니페스트 `source[]` 를 나란히 놓고 한다. / **결정 글꼴 실재**(ADR-073#amend-1 결정 3) — 렌더에 DESIGN `## 3` 이 고른 패밀리가 실제로 적용됐는가. 게이트 2차 런타임 검사(`document.fonts.check`)가 `report` 를 냈으면 그 사유를 확인하고, 스캐폴드 기본 글꼴(`Geist`·`Inter` 등 DESIGN 이 고르지 않은 패밀리)이 보이면 **승인하지 않는다**. / **`구성 불확실` 마감**(ADR-072#amend-4) — 대상 화면 브리프 `## 13` 이 「없음」이거나 그 `D-NNN` 이 원장에서 `closed` 인가, 그리고 아직 열려 있다면 **두 안의 렌더가 모두** `design-gate-shots/` 에 있는가. 한쪽 렌더만 있는 채로 승인하지 않는다.
6. 승인 직후 `validate:design -- --manifest <경로> --only <화면> --snapshot docs/20-system/prototypes/M<N>/snapshots/`로 기준선 스냅샷(각 뷰포트 default + 1차 뷰포트 empty·error + `baseline: true` 상태)을 `snapshots/<screen>-<state>-<w>x<h>.png`로 저장한다(500KB 초과 경고). **그 화면 매니페스트 `source[]` 의 각 파일 추적 헤더 `승인: <미정>` 을 승인 일자로 바꾼다**(ADR-072 D3-4 의 추적 헤더가 승인 일자를 담기로 돼 있는데 R6 가 매니페스트만 채우고 코드를 두고 가면, 코드만 읽어서는 그 화면이 승인됐는지 알 수 없다 — Round 12 실측: 승인 후에도 `source[]` 5파일이 전부 `<미정>` 이었다). `source[]` 밖 파일(테스트·갤러리 진입·테마 배선)은 그대로 둔다 — 승인 표면이 아니다. 매니페스트 `approved{date, by: user}`·`snapshots[]`·`product_entry`(`## 9`·ARCH 라우팅에서 도출, 미정이면 `null`)·`handoff{run, remaining_wiring[]}` 채움. 이전 M 승인 화면에 영향(공용 컴포넌트·토큰 변경)이 있으면 그 화면을 **이 M 매니페스트에 `supersedes: ["M<K>/<screen>"]`로 재등록**해 함께 렌더·승인·스냅샷(이전 M 파일은 불변 — ADR-072 D5-5).

## R7 — feature 기입 · 정합 재대조 · contract-ready
1. 각 구현 feature `## 7`에 `프로토타입: <screen id> (manifest: docs/20-system/prototypes/M<N>/manifest.json, 진입: <story id | entry>)` — **R1이 재사용으로 판정한 화면은 `프로토타입: M<K>/<screen> (manifest: docs/20-system/prototypes/M<K>/manifest.json, 진입: …)`로 이전 M을 가리킨다**(이 M에 화면을 새로 등록하지 않는다) + `승인 스냅샷: <경로들>` + `경험 결정(PX):` 인벤토리(코드 주석에서 **그대로 복사** — 재추출 금지; 화면이 여러 feature에 걸치면 PX별 구현 feature에 분산). 완전성 확인: 그 화면 코드의 PX 마커 집합 = 관련 feature 인벤토리 부분집합.
2. 확정 재대조: M `## 3` ↔ F `## 3` ↔ F `## 7` FAC ↔ 매니페스트 화면·PX ↔ M `## 9` 전환표. 불일치면 해당 라운드로.
3. `DECISION_REGISTER.md`에서 이 M `영향:` + `(미할당)`의 `open` 0건일 때만 **feature 먼저, M 마지막** `contract-ready`. open이 남으면 어느 D-NNN이 막았는지 보고.
4. 커밋하지 않는다. 출력에 `권장 커밋: feat(ui): approve M<N> screen prototypes` 한 줄.

## 결정 마감 (ADR-060)
bootstrap-design과 동일 규율 — `user-*` 결정(구성 방향 선택·프로필 배정 변경 등)은 Decision Brief 6블록, `agent-delegated`는 라운드 끝 일괄 확인 1회, 미결은 `deferred`(앵커 3필드) 또는 `open`.

## 마지막 출력 (WORKFLOW 다음 단계 contract 정합)
- 대상 화면 목록 + 브리프 경로 + 코드 경로 + 매니페스트 경로 + 스냅샷 경로
- 면제 feature 목록
- 게이트 결과(blocker 0 / report 경로) + reviewer 판정 요약 + `under-verified` 여부
- 원장 요약 `closed N / deferred M / open K`
- 상태: M·feature `contract-ready` 전환됨 | 보류(사유)
- 권장 커밋 메시지
- 다음 단계: `/plan-workitem M<N>` (또는 교차검토 `/validate-plan M<N>` → `/repair-plan M<N>`; 화면 층 수정은 본 skill 재진입)
- `/clear` 권장

## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 최소 충분. 코드 전문·스크린샷은 sub-agent 안에서만 읽고 메인에는 경로·판정만 올린다.
