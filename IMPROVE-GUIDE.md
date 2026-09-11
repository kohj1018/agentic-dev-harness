# 개선 실행 가이드 (2026-09 라운드)

이 문서는 실행 지침이다. 위에서 아래로 따라가면 개선 전체가 끝난다. 각 단계는 "현재 → 변경"으로 적었고, 문장 그대로 옮겨도 되는 텍스트는 코드 블록에 두었다. 커밋 메시지는 단계 끝에 있다. 이 문서 자체는 어떤 산출물에서도 링크하거나 인용하지 않는다. 완료 후 삭제한다.

---

## 0. 읽는 법과 전제

- **실행 위치**: 저장소 루트, `main` 브랜치 그대로. 브랜치를 만들지 않는다.
  ```bash
  git branch --show-current   # main 이어야 한다
  git status --short          # 시작 전 깨끗해야 한다
  ```
- **커밋 규율**: `git add`는 파일을 명시 열거한다(`-A`·`.` 금지). `--no-verify`·`--amend`·`push` 금지. 메시지는 Conventional Commits 한 줄. 본 문서가 지정한 지점에서만 커밋한다(더 잘게 나눠도 된다).
- **문서 수정 원칙**: 기존 표·주석·형식을 유지한다. formatter로 `docs/`를 재정렬하지 않는다(로스터 종 수·인덱스 행·`## Amendment N` 카운트를 기계 점검이 읽는다).
- **"현재" 인용은 grep 앵커다**: 각 단계의 `현재:` 문장은 파일에 실재하는 짧은 문자열이다. 못 찾으면 그 파일의 해당 절을 읽고 같은 뜻의 문장을 찾는다. 줄번호는 참고용이며 정확한 앵커는 문자열이다.
- **ADR 작성 규약**: `docs/90-decisions/boilerplate/_ADR_GUIDE.md`를 따른다. harness surface(`.claude/skills`·`.claude/agents`·`AGENTS.md`·`.agents/skills`·lifecycle ADR)를 건드리는 ADR은 `## Mutation Contract` 6필드 필수. 인용은 `ADR-NNN`·`ADR-NNN#amend-M`·`ADR-NNN#dK` 정규 ID만, 줄번호 인용 금지. 다른 파일이 인용하는 amendment 헤딩 위에는 `<a id="adr-NNN-amend-M"></a>`를 둔다. `## Surfaces`에 등재한 파일 본문에는 `ADR-NNN` 역참조를 둔다.
- **supersede 후 인용 처리**: ADR-045#amend-2 D10의 5종 분류(A 살아있는 규칙 → 재지정 / B 낡은 지시 → 재작성 / C 배경 서술 → 링크 제거 / D supersede 선언·인덱스 행 → 유지 + `(현재 SSOT: ADR-NNN)` 병기 / E 실행 기록 → 유지 + 병기)를 그대로 적용한다. 병기는 줄 단위다.
- **ratchet**: 새 제약(강)은 `[관측됨]`·`[외부실증]` 근거가 있을 때만. 본 라운드의 코드 프로토타입·시각 리서치 효과는 `[가설]`이므로 enabling(약)으로 두고 재검토 트리거를 적는다.
- **날짜**: 본 라운드 기준일은 2026-09-11이다. ADR·amendment 날짜에 실제 작성일을 쓴다.
- **환경 전제(Phase 7에서 필요)**: Node 20+, npm, Playwright 설치 가능한 네트워크, Flutter SDK(안정 채널) + Android 에뮬레이터 1대(Round 12). macOS면 iOS 시뮬레이터는 선택.

---

## 1. 확정된 결정 요약

| ID | 결정 |
|---|---|
| D-1 | 프로토타입을 실제 스택의 presentational 코드 + 상태별 fixture로 만들고 구현 task는 배선만 한다. design gate는 화면 매니페스트를 읽는 v3로 재정의한다. |
| D-2 | `/design-milestone M<N>` 신설. UI 마일스톤은 `/plan-milestone`이 문서를 만들고 `draft`로 두며, `/design-milestone`이 `contract-ready`로 올린다. 비-UI는 기존대로. 봉인 전 재진입 대상은 셋 — 프로토타입 없는 새 feature 화면 / `- 계약 수정:` 마커가 남은 승인 화면 / `--screens`로 지정한 승인 화면. `contract-ready` 강등 전이는 없다. |
| D-3 | 승인 스냅샷을 커밋한다. 크기는 디자인 프로필의 기준 뷰포트를 따른다(웹 1280×900·375×812, 앱 390×844·360×800). **형식은 PNG**(Playwright·Flutter 위젯 테스트가 직접 만드는 형식 — 변환 의존 없음), 파일당 500KB 초과는 경고(차단 아님). 기준선 집합 = 각 뷰포트의 default 상태 + 1차 뷰포트의 empty·error 상태 + 브리프의 «승인 필요 상태». 픽셀 오라클로 쓰지 않는다. **봉인 뒤 이전 M 기준선은 불변** — 다음 M이 `supersedes`로 새 기준선을 append한다. |
| D-4 | 웹 미리보기는 Storybook(애드온은 a11y·viewport만). Flutter는 별도 진입 파일 갤러리 + 위젯 테스트 스냅샷. |
| D-5 | UI 제작 계약을 ADR로 명시한다(봉인 전 예외, 시각 탐색 Red-first 면제, 행동 계약은 게이트·테스트, 가짜 Red 금지, 재사용 추적). |
| D-6 | 판정값 4종 유지. 라운드 한도 도달 시 사용자 옵션 제시. 면제 판정값 없음. P0 정의표 + 재현 필수 + 채택 전 검토 + 원인 단위 수정 + 영향 반경 재감사. |
| D-7 | finding 처분 5값(`confirmed / rejected-fp / rejected-context / needs-confirmation / unsubstantiated`), P0·P1은 처리 후 `status`·`decision` 필수, 라운드 예산 3. |
| D-8 | `/stack-guard`가 green-field 스캐폴드(검증 진입점 생성보다 **먼저**인 «수행 0», scope별 생성기) + 기초 라이브러리 설치 + 실측까지 맡는다. 폰트 패키지는 예외(DESIGN §3 확정 뒤 bootstrap-design R6가 추가). |
| D-9 | 스택 결정 카탈로그를 두고 전 행에 disposition 필수. 되돌리기 비싼 행만 개별 승인. 부분 입력 라우팅(HYBRID) 신설. |
| D-10 | builder만 `maxTurns: 45`·`effort: medium`으로 바꾸고 대조군 실험. 판단 역할은 유지. |
| D-11 | 단일 DESIGN.md + 표면→프로필 매핑표 + 공통/프로필 delta. e2e는 target별 진입점 + 집계. |
| D-12 | 레퍼런스 4층 소스(큐레이션 허브·실제 제품·사용자 캡처·DESIGN.md 분석본) + 사람 큐레이션 라운드 기본. |
| D-13 | ADR-027 통합 재발행(→ ADR-073), ADR-056 대체(→ ADR-072), 새 ADR-070·071, 개정 004·058·059·069, 참조 갱신 007·009·042·050·052·055·057·060·063·066·068. |
| D-14 | 전부 적용 후 마지막에 1회 검증(참조 무결성 + dogfood 웹 1회·Flutter 1회). |
| D-15 | 게이트 축소: capability 버전 핸드셰이크·고정 적합성 묶음(conformance oracle) 제거 → 설치 시 자가 검사(known-bad 규칙별 기대·known-good·매니페스트 경로·Flutter — 4케이스). 등록표 6필드(status·command template·adapter path·manifest 규약·self-test 일자·copied-from). copied-from(복사 시 canonical sha256)은 caller 게이트가 아니라 재실행 시 local-modification·canonical 갱신 판별에만 쓴다. |
| D-16 | R2 concept은 HTML 유지, R6 프리뷰는 스택 네이티브 테마 쇼케이스. `--fast`도 R6 배선·쇼케이스·게이트는 수행한다(reviewer 픽셀 판정만 생략) — `_theme/manifest.json`이 design-milestone의 필수 입력이기 때문. |

**리뷰 반영으로 바뀐 합의 사항 (2026-09-11)** — 원 브리프·초안 대비 달라진 점만 적는다.
1. D-3: WebP·화면당 300KB → **PNG·파일당 500KB 경고**. Playwright와 Flutter 위젯 테스트는 WebP를 만들지 못하고, 변환 라이브러리를 baseline에 더하지 않기로 했다. 기준선 상태 집합(default + empty·error)도 명시했다.
2. D-15: 등록표 4필드 → **6필드**(adapter path·copied-from 추가). copied-from은 복사 시 canonical sha256이며 caller는 대조하지 않는다 — stack-guard 재실행의 local-modification 판별과 stabilize의 canonical 갱신 감지에만 쓴다. 자가 검사는 1케이스 → **4케이스**(규칙별 기대·known-good·매니페스트 경로·Flutter). conformance oracle·capability 버전 제거는 그대로.
3. D-8: 스캐폴드 위치가 «수행 6 안의 수행 0»에서 **«수행 0»(검증 진입점 생성 앞)**으로 바뀐다. 뒤에 두면 생성기 manifest와 harness가 먼저 만든 manifest가 충돌한다. scope별 생성기·보호 경로 검사·폰트 패키지 예외를 추가했다.
4. 일괄 확인 5(공용 컴포넌트·토큰 변경 → 재승인): «이전 M 매니페스트 갱신» → **다음 M 매니페스트에 `supersedes`로 append, 이전 M 파일 불변**. 봉인 경계(마일스톤 번호 = 버전)와 정합시킨 것이다.
5. ADR-070 D7(성격 기준 라우팅)은 졸업 item 5의 입력원을 reviewer 결함까지 넓히므로 **제약(강)**으로 분류한다.
6. D-16 부속: `--fast`도 R6 테마 배선·쇼케이스·게이트는 수행하고 픽셀 판정만 생략한다. `--update`는 토큰이 바뀌면 배선을 delta 재생성한다.
7. D-11 부속: Flutter target별 e2e 진입점은 `scripts/e2e-target.mjs`가 **실행 시점에 device id를 해석**한다 — `package.json`에 `-d <id>`를 박지 않는다(기존 원칙 유지).
8. D-12 부속: 1층 큐레이션 허브(uibowl.io·Mobbin 등)도 **자동 캡처 대상**이다(사용자 결정 — 캡처는 내부 참고용이며 상업적 재배포가 아니다). 로그인 벽·봇 차단으로 못 찍은 것만 3층 사용자 캡처로 보완한다.
9. §11 기준 자료의 baseline 값은 2026-09-11 확인분이며, 실행 시 researcher가 재확인해 확인일을 실행일로 갱신한다(확인 못 한 행은 확인일을 비운다).

---

## 2. 이름·번호 고정표

아래 이름을 그대로 쓴다. 바꾸면 하류 인용이 어긋난다.

**새 ADR (boilerplate, `docs/90-decisions/boilerplate/`)**

| 번호 | 파일명 | 제목 | 대체·개정 관계 |
|---|---|---|---|
| ADR-070 | `ADR-070-finding-severity-closure-and-convergence.md` | finding 심각도·종결·수렴 계약 | ADR-050#amend-1·ADR-068 D6 참조 갱신 |
| ADR-071 | `ADR-071-stack-decision-catalog-and-scaffold.md` | 스택 결정 카탈로그 + 스캐폴드 소유 | ADR-052 D1·ADR-055 결정 1·ADR-063 D1 부분 supersede(참조 갱신) |
| ADR-072 | `ADR-072-design-milestone-and-code-prototype.md` | 디자인 마일스톤 + 코드 프로토타입 + UI 제작 계약 + design gate v3 | **ADR-056 supersede**, ADR-058#amend-1 결정 5·6·#amend-2 부분 supersede, ADR-060 D7·ADR-009 참조 갱신 |
| ADR-073 | `ADR-073-interface-and-design-content-v2.md` | 인터페이스 결정 책임 분배 + DESIGN.md 내용 계약 v2 | **ADR-027 통합 재발행(supersede)** |

**개정(amendment)**

| 대상 | 번호 | 내용 |
|---|---|---|
| ADR-004 | #amend-4 | agent frontmatter `effort` 허용(역할별 고정, 버전 고정 아님) + builder 실험 |
| ADR-058 | #amend-4 | 레퍼런스 갤러리 절차(4층 소스·큐레이션 라운드) + R6 네이티브 테마 쇼케이스 + 게이트 실행물 계약을 ADR-072로 이관 |
| ADR-059 | #amend-1 | target별 e2e 진입점 + 집계, Flutter 승인 스냅샷·design gate 어댑터, D12 갱신 |
| ADR-069 | #amend-1 | D3 전파표에 "승인 UI 코드·공용 컴포넌트·토큰 변경" 행 추가 |

**새 스킬·에이전트·자산**

| 종류 | 경로 |
|---|---|
| 스킬 | `.claude/skills/design-milestone/SKILL.md` |
| Codex wrapper | `.agents/skills/design-milestone/SKILL.md`, `.agents/skills/design-milestone/agents/openai.yaml` |
| 카탈로그 | `.claude/skills/bootstrap-stack/stack-catalog.md` |
| 게이트 v3 | `.claude/skills/stack-guard/assets/design-gate.mjs` (재작성) — `design-gate-conformance.mjs`는 **삭제** |
| 레퍼런스 캡처 | `.claude/skills/bootstrap-design/assets/capture-refs.mjs` (신설) |

**새 산출물 경로(프로젝트 측)**

| 산출물 | 경로 | 커밋 |
|---|---|---|
| 화면 매니페스트 | `docs/20-system/prototypes/M<N>/manifest.json` | O |
| 승인 스냅샷 | `docs/20-system/prototypes/M<N>/snapshots/<screen>-<state>-<w>x<h>.png` | O |
| 프로토타입 코드(웹) | ARCH `## 3-1` 트리의 컴포넌트 디렉터리 하위 `screens/<screen>/` (`<Screen>.tsx`, `<Screen>.stories.tsx`, `fixtures.ts`) | O |
| 프로토타입 코드(Flutter) | `lib/screens/<screen>/`, `lib/prototype/main.dart`, `test/screens/<screen>_prototype_test.dart` | O |
| 테마 배선(웹) | `src/styles/tokens.css`(또는 스택 관례 경로) + Tailwind/테마 설정 + `Theme/Showcase` 스토리 | O |
| 테마 배선(Flutter) | `lib/theme/tokens.dart`, `lib/theme/app_theme.dart`, `lib/prototype/theme_gallery.dart` | O |
| e2e target resolver (native) | `scripts/e2e-target.mjs` (stack-guard 생성 — 실행 시점 device id 해석) | O |
| 레퍼런스 갤러리 | `docs/20-system/design-refs/{inbox/,cache/,gallery.html,shots/}` | X (gitignore) |
| 게이트 출력 | `design-gate-shots/`(기존), `design-gate-storybook/`(정적 빌드) | X (gitignore) |

**STACK_SETUP_PLAN 새 절**: `## Stack Decision Registry`, `## Scaffold`(scope별 행). `## Design Gate Adapter`는 6필드(status·command template·adapter path·manifest 규약·self-test 일자·copied-from)로 재정의.

**DESIGN.md 새 절·앵커**: `## 0` 프로필 매핑표(`design-0-profiles`), `## 3` 폰트 결정 블록(`design-3-typography`), `## 10` 언어별 하위 블록, `## 11. 기준 자료`(`design-11-sources`).

**QA_FINDINGS·IMPROVEMENT_GUIDE `decision` 값**: `confirmed | rejected-fp | rejected-context | needs-confirmation | unsubstantiated`. repair 로그(`## 5`)의 `decision`은 기존 `Adopt | Adopt-modified | Reject-FP | Reject-context` 유지. **두 어휘의 경계는 스키마 본문에도 한 줄로 박는다**(P1-3 — 같은 파일 안에서 `## 항목 스키마`와 `## 5` 예시가 모순되지 않게).

**finding 하위 줄 마커 신설**: `- 재현:` · `- 재현 재실행:` · `- 종결 근거:` · `- 출처:` (ADR-070 D1·D3·D7) / `- 수렴-보류: 회수 <시점> | 조건: …` (ADR-070 D5 B — 보류해도 `status`는 `open` 유지. finding 원장에 `deferred` 상태를 신설하지 않는다) / `## 5` 그룹 줄 `- round:` · `- convergence-decision:` (D5).

**라벨 신설**: `[Design-element-rationale]`(브리프 요소 근거 부재), `[Design-reuse-drift]`(승인 UI 재사용 이탈), `[Finding-unreproduced]`(재현 줄 없는 P0 보고), `[Convergence]`(라운드 예산 도달), `[Experience-contract]`(UI M 매니페스트 부재).

**PX 마커(코드)**: 웹 `// PX-M<N>-<screen>-NN: <한 줄 결정>` (JSX 안은 `{/* PX-… */}`), Dart `// PX-M<N>-<screen>-NN: <한 줄 결정>`. 문법 `^PX-M<N>-<screen>-\d{2,}$` 불변. 화면 id는 kebab-case이며 **숫자로 끝나지 않는다**(`-\d+$` 금지 — `\d{2,}$` 파싱 보호).

**graduation 값**: `YES | PENDING_ACCEPTANCE | NO | BLOCKED` 불변. 면제값 없음.

---

## 3. 실행 순서와 의존 관계

```
Phase 0 준비
Phase 1 finding 계약 (ADR-070)            ← 독립. 가장 먼저(가장 안전).
Phase 2 스택 카탈로그·스캐폴드 (ADR-071)   ← Phase 5의 Storybook 설치·게이트 자가 검사가 여기 stack-guard 단계에 얹힌다.
Phase 3 builder 실험 (ADR-004#amend-4)     ← 독립. 짧다.
Phase 4 DESIGN 내용 v2 (ADR-073) + 디자인 워크플로우 v2 (ADR-058#amend-4)
                                            ← 프로필·폰트·§10·기준자료·갤러리·R6 네이티브. Phase 5의 design-milestone이 이 산출물을 입력으로 쓴다.
Phase 5 design-milestone (ADR-072) + gate v3 + 하류 배선 + ADR-059#amend-1
                                            ← Phase 2(설치)·Phase 4(프로필·테마 배선)에 의존.
Phase 6 로스터·인덱스·인용 재지정          ← Phase 1~5 뒤.
Phase 7 검증 1회 (참조 무결성 + dogfood 2회)
```

Phase 안의 단계 번호(`P1-1` 등)는 순서다. 한 Phase 안에서 ADR을 먼저 쓰고 surface를 고친다(ADR이 surface의 역참조 대상이므로).

---

## Phase 0. 준비

### P0-1. 번호 확인
```bash
ls docs/90-decisions/boilerplate/ | grep -E 'ADR-07[0-3]' ; echo "(비어 있어야 정상)"
grep -n "^| 069" docs/90-decisions/boilerplate/README.md
```
070~073이 비어 있어야 한다. 아니면 다음 빈 번호로 밀고 본 문서의 번호를 전부 치환한다.

### P0-2. 현재 인용 규모 기록(검증 기준선)
```bash
for k in ADR-027 ADR-056 ADR-058 ADR-052 ADR-063 ADR-055 ADR-050 ADR-004 ADR-060 ADR-069; do
  printf "%-8s files=%3s refs=%4s\n" "$k" "$(grep -rl --exclude-dir=.git --exclude-dir=node_modules "$k" . | wc -l | tr -d ' ')" "$(grep -ro --exclude-dir=.git --exclude-dir=node_modules "$k" . | wc -l | tr -d ' ')"
done
grep -rho --exclude-dir=.git "ADR-027#[a-z0-9-]*" . | sort | uniq -c | sort -rn
grep -rho --exclude-dir=.git "ADR-056#[a-z0-9-]*" . | sort | uniq -c | sort -rn
```
출력을 `/tmp/improve-baseline.txt`에 저장해 둔다. Phase 6에서 재지정 누락 대조에 쓴다. 부록 E 스크립트를 지금 `/tmp/check-refs.sh`로 저장하고(`chmod +x`), 같은 파일에 `bash /tmp/check-refs.sh --all-surfaces --all-dead` 검사 3·4 `count`도 적어 둔다(기존 drift 기준선 — 2026-09-11 실측 검사 3 = 9(전 ADR `## Surfaces` 기준), 검사 4 = 11 — Phase 7에서 «늘지 않았는가»만 본다. 기본 모드는 현재 저장소에서 이미 전부 0이다).

### P0-3. 읽을 파일(한 번)
`AGENTS.md`, `docs/00-meta/{STRUCTURE,WORKFLOW,DELEGATION_STRATEGY,GUARDRAILS_STRATEGY,PROJECT_START_CHECKLIST}.md`, `docs/90-decisions/boilerplate/_ADR_GUIDE.md`, `ADR-045`, `ADR-047`, `ADR-022`. 그 외는 각 단계에서 지정한다.


---

## Phase 1. finding 심각도·종결·수렴 계약 (ADR-070)

목표: stabilize → repair-milestone 반복이 수렴하게 한다. (1) P0 정의와 재현 의무, (2) 채택 전 검토 5값, (3) 4-판정 전부의 종결, (4) 원인 단위 수정 + 영향 반경 재감사, (5) 라운드 예산 3과 사용자 옵션, (6) 보고자 기준 라우팅 폐지.

### P1-1. ADR-070 작성 — `docs/90-decisions/boilerplate/ADR-070-finding-severity-closure-and-convergence.md`

아래 골격을 그대로 채운다. 표현은 다듬어도 결정 번호·이름·값은 유지한다.

```markdown
# ADR-070 — finding 심각도·종결·수렴 계약 (Finding Severity, Closure & Convergence)

> scope: boilerplate
> area: process

## Status
accepted

## 배경
- [관측됨] `/stabilize-milestone` → `/repair-milestone` 반복에서 P0가 계속 새로 나타나 졸업이 수렴하지 않는다(사용자 fork 보고). 원인 셋이 문서에서 확인된다.
  1. **종결 누락** — `/repair-milestone` 수행 5는 Adopt/Adopt-modified만 `status: resolved`로 토글한다. Reject-FP·Reject-context로 판정한 원본 finding은 `open`으로 남아 §1.5 item 5가 다음 라운드에 다시 센다.
  2. **P0 정의·재현 요구 부재** — `qa.md`·`reviewer.md`에 P0 기준이 없다. 정적 추론만으로 P0가 등재되고, 6-S는 보고자별로 원장을 나눌 뿐(qa→QA_FINDINGS, reviewer→IMPROVEMENT_GUIDE) 채택 전 검토가 없다.
  3. **수정 후 영향 반경 미검사** — `/repair-milestone` 2-V는 «방금 한 수정이 즉시 깨졌는가»만 본다. 수정이 다른 파일에 새로 여는 결함은 다음 stabilize 전수 감사에서야 드러나고, 그때 새 P0로 보인다.
- [관측됨] ADR-067 D3은 미검증 축을 병기한 `YES`를 도입하지 않는다고 명시했고 ADR-068 D4가 그대로 승계한다. 따라서 수렴 실패의 출구는 판정값 신설이 아니라 **사용자 결정으로 진행 경로를 여는 것**이어야 한다(ROADMAP 병렬 Now 승인 경로가 이미 있다 — plan-milestone R0). ADR-067은 superseded (현재 SSOT: ADR-068).
- [외부실증] ADR-047 D8(Oracle Adequacy) — pass/fail 단일 신호는 과신을 만든다. finding도 «관측됨/재현됨/미확인»을 구분하지 않으면 P0 인플레이션이 생긴다.

## 결정

### D1. P0 정의표 (사후 판정 기준)
severity는 **영향**이고, 채택 여부는 **증거 상태**다. 둘을 섞지 않는다.

| severity | 정의 |
|---|---|
| P0 | **재현 가능하게 관측됨** + 다음 중 하나: 데이터 손실·손상 / 보안 노출(비밀·인증 우회·권한 상승) / Now 범위 핵심 시나리오(feature `## 3`) 완료 불가 / 빌드·기동·통합 `validate`·e2e 실패 / 봉인된 AC·FAC·INV·승인 프로토타입·DESIGN 계약 위반으로 사용자 체감이 달라짐 |
| P1 | 기능 저하이나 우회 가능 / 비핵심 흐름 차단 / a11y serious / 계약 불일치이나 체감 무변화 / 재현 가능한 회귀 후보 |
| P2 | 품질·정리·권고·휴리스틱 의심 |

- **P0 보고 형식**: 항목 하위 줄에 `- 재현: <명령 또는 단계> → <관측 출력>`이 **필수**다. 재현을 시도하지 못했으면 `- 재현: 미시도 — <사유>`로 적고 evidence label은 `[가설]`로 둔다. 재현 줄이 없는 P0는 6-S가 `[Finding-unreproduced]`를 붙여 D2의 `needs-confirmation`으로 보낸다.
- 이 표는 검증자에게 **지켜야 할 기준을 전달**하는 것이며 «무엇을 지적하지 말라»나 «심각도를 미리 정해 주는» 사전 유도가 아니다(ADR-050#amend-1 결정 2의 예외 범주). dispatcher는 여전히 개별 finding의 심각도를 미리 지정하지 않는다.
- **적용 범위**: 본 표는 구현 결함(QA_FINDINGS — stabilize·accept·repair 경로)에 적용한다. plan·discovery 리뷰 차원(`[Plan-*]`·`[MP-*]`·`[Disc-*]`)의 P0/P1 의미(봉인 차단 등)는 ADR-038·ADR-044·ADR-060 D8 그대로다.
- **시각 drift**: 승인 스냅샷과의 시각 불일치 자체는 `P1 [Experience-drift]` report-only다(ADR-072 D7). 그 불일치가 봉인 AC·PX↔AC 위반을 동반하고 재현되면 별도 P0 결함(재현 줄 포함)으로 등재한다 — 같은 결함이 발견 경로에 따라 다른 severity를 받지 않는다.

### D2. 채택 전 검토 (6-S, 등재 전 1회)
메인 세션은 verifier가 반환한 각 P0·P1을 원장에 적기 **전에** 아래 5값 중 하나로 판정하고 `decision:`에 적는다.

| decision | 뜻 | status |
|---|---|---|
| `confirmed` | P0: 재현 줄을 qa 단발 sub-call(명령 1회면 메인)이 **다시 실행해 관측**했다 / P1: 보고의 재현·근거를 코드·문서로 확인했다(재실행 불요) | `open` (repair 대상) |
| `rejected-fp` | 코드·문서로 오탐임이 확인됨 | `resolved` |
| `rejected-context` | charter 비목표·ARCH 결정·의도된 동작 | `resolved` |
| `needs-confirmation` | 구체 의심이나 확인 미완 — `대상 / 확인 방법 / 막힌 이유` 3필드 하위 줄 필수 | `open` (item 5가 센다 — 미확인 P0는 졸업을 막는다) |
| `unsubstantiated` | 근거 없는 가능성 | `resolved` + `### 관찰 메모`에 한 줄 |

- **P0는 `confirmed`가 되기 전에 채택하지 않는다.** 재현이 명령 한 번인 경우(빌드 실패 등)도 그 명령을 돌린다.
- **재현 재실행의 경계**: 코드·문서·상태를 바꾸지 않는 명령만 메인이 직접 돌린다. dev server·테스트 DB가 필요한 재현은 stabilize 단계 3이 이미 띄운 환경에서 qa 단발 sub-call로 돌리고, 그것도 불가하면 `needs-confirmation`(확인 방법 = `/repair-milestone`이 수행)으로 둔다. 6-S의 read-only 계약(코드·status 미변경)은 유지된다.
- 이 검토는 사후 판정이다. verifier 입력에는 D1 표만 준다.
- **어휘 경계**: 위 5값은 **원본 finding 항목**의 `decision`이다. `IMPROVEMENT_GUIDE.md ## 5. Repair decision log`의 `decision`은 수리 판정값 `Adopt | Adopt-modified | Reject-FP | Reject-context`를 그대로 쓴다 — 전자는 증거 상태, 후자는 수리 처분이라 축이 다르다. 두 어휘를 섞지 않는다.

### D3. 종결 규칙 (4-판정 전부가 원본을 닫는다)
`/repair-milestone`의 4-판정은 원본 finding의 `status`를 **전부** 갱신한다.
- Adopt / Adopt-modified → 수정 후 **원본 `- 재현:` 절차를 다시 실행해 통과를 관측**한 뒤에만 `status: resolved`. 통과 관측 줄 `- 재현 재실행: <날짜> 통과`를 원본 항목 하위에 남긴다. 관측 없이 resolved로 적지 않는다.
- Reject-FP → `status: resolved` + `decision: rejected-fp` + 근거 한 줄. Reject-context → `status: resolved` + `decision: rejected-context` + 근거.
- **재현 줄이 없는 항목(P1·P2·개선·문서 정합)**의 종결 증거는 `- 종결 근거: <검증 수단 → 결과>`(테스트 통과·grep 0건·문서 대조 등) 한 줄이다. 원본 재현 재실행은 P0에만 요구한다.
- `needs-confirmation` 항목은 repair-milestone이 확인을 시도한다. 확인되면 `confirmed`로 바꿔 Adopt 경로, 반증되면 rejected-*, 여전히 불가면 `needs-confirmation` 유지 + 막힌 이유 갱신. `needs-confirmation`은 **판정된 open**이다(판정 없이 방치된 open과 구분) — stabilize-reviews 파일 삭제 조건의 «전 severity 4-판정 완결»에서 완결로 센다(3필드가 QA_FINDINGS로 옮겨졌으므로).
- **P0·P1은 처리된 뒤 `status`와 `decision`이 필수 필드다**(QA_FINDINGS·IMPROVEMENT_GUIDE 스키마 갱신). 미처리 항목만 두 필드가 비어 있을 수 있다.

### D4. 원인 단위 수정 + 영향 반경 재감사
`/repair-milestone`는 다음을 지킨다.
1. Adopt 항목을 **원인(root cause) 단위로 묶어** 하나의 수정으로 처리한다. 증상마다 따로 고치지 않는다. `## 5` 로그의 그 항목에 `- 원인: <한 줄>` · `- 영향 반경: <변경 파일 + 그것을 import/참조하는 파일·화면>`을 적는다.
2. 수정 뒤 ADR-068 D6 검증 집합 4항목에 **다섯째 항목**을 더한다: **영향 반경 재감사** — 변경 파일과 그 의존 파일·화면을 대상으로 qa 단발 sub-call(또는 메인 직접)로 회귀·엣지 점검. 결과를 `- 재감사: <대상 N파일> / 새 finding K건`으로 로그에 남기고, 새 finding은 D2 검토를 거쳐 등재한다.
3. 종료 전 `- 자기 점검: 이 수정으로 새로 열릴 수 있는 P0 후보 — <없음 | 목록>` 한 줄을 남긴다. 후보가 있으면 같은 라운드에서 확인한다.
4. 라운드 자체가 "전체 재감사"가 아니라는 ADR-068 D6 원칙은 유지한다 — 전수 감사는 다음 stabilize다. 다섯째 항목은 **변경분 반경**으로 한정한다.

### D5. 라운드 예산 3 + 수렴 실패 옵션
- `/repair-milestone`는 실행 시작 시 `IMPROVEMENT_GUIDE.md ## 5`의 `### M-N` 그룹에 `- round: <K> (<YYYY-MM-DD>)`를 append한다(K = 기존 최대값 + 1, 첫 실행은 1).
- `/stabilize-milestone` 단계 8은 그 K를 읽는다. **K ≥ 3이고 여전히 `### P0`에 `status: open`이 있으면** 판정은 그대로(`NO` 또는 `BLOCKED`) 두고 아래 **수렴 실패 브리프**를 출력한다(Decision Brief 6블록, `authority: user-choice`, DECISION_REGISTER 등재 `영향: M<N>`):
  - 남은 P0/P1 목록: 각각 `decision`·근거·영향·수리 범위 추정·**보류 가능 여부**(비차단이면 가능).
  - 선택지 A: 계속 수리(한 라운드 더).
  - 선택지 B: 비차단 항목에 하위 줄 `- 수렴-보류: 회수 M<N+1> 착수 시 | 조건: …`를 달아 이번 라운드 수리 대상에서 빼고 차단 항목만 수리한다. **`status`는 `open`으로 유지한다** — severity는 영향이므로(D1) 미해소 P0는 졸업 item 5를 계속 막고, `/plan-milestone` R0의 기존 *open* 회수가 다음 M에서 그 항목을 surface한다. **finding 원장에 `deferred` 상태를 신설하지 않는다** — 읽는 소비자(R0 회수·아카이브 회전·item 5)가 전부 `open`/`resolved`만 보므로 항목이 새는 자리가 된다. 보류라는 *선택* 자체는 `[Convergence]` 원장 항목이 담는다(ADR-060 D1의 «결함을 감수한다는 선택» 예외). 다음 `/repair-milestone`는 `- 수렴-보류:` 줄이 달린 항목을 그 라운드 대상에서 제외한다.
  - 선택지 C: `NO`를 유지한 채 **병렬 Now 승인**으로 다음 마일스톤을 연다(plan-milestone R0 «명시적 병렬 승인» 경로). 남은 P0는 `carry-over`로 매 라운드 표시되며(다음 M의 `/repair-milestone`는 책임 경계상 그 항목을 고치지 않고 flag만 한다), 결함이 해소된 뒤 **이전 M ID로 `/repair-milestone M<N>`을 돌려 D3 종결 규칙(재현 재실행 관측)으로 원본을 닫은 다음** 그 M의 `/stabilize-milestone` 재실행으로 정상 `YES`를 낸다.
  - 금지: 판정값 신설·`YES` 병기·P0의 P1 재분류(D1 위반).
- 브리프 출력에는 `[Convergence]` 라벨을 붙인다. stabilize는 그 항목을 DECISION_REGISTER에 `open`으로 등재한다(정상 책임 4). **답변 기록**: 사용자가 같은 세션에서 답하면 stabilize가 *자기 등재 항목에 한해* DECISION_REGISTER를 `closed` + 앵커(ROADMAP `## Now` 행 또는 QA_FINDINGS 항목)로 쓴다(기존 항목 상태 변경 금지는 유지). **`IMPROVEMENT_GUIDE.md ## 5` `### M-N`의 `- convergence-decision: <A|B|C> (round K, <YYYY-MM-DD>)` 줄은 답변 시점과 무관하게 후속 skill이 남긴다** — A·B는 다음 `/repair-milestone` 1-R, C는 `/plan-milestone` R0(병렬 승인). 세션이 끝난 뒤 답한 경우에는 그 skill이 DECISION_REGISTER `closed` 기록도 함께 쓴다(이미 닫혀 있으면 그대로 둔다). **stabilize는 `## 5`에 쓰지 않는다** — 그 절의 writer는 repair 3종 + 본 줄에 한한 `/plan-milestone`이다(IMPROVEMENT_GUIDE `## 5` writer 주석).
- **재발화 억제**: `- convergence-decision:` 줄이 있으면 그 뒤로는 (i) 새 P0 ID가 등재됐거나 (ii) 현재 K − 결정 round ≥ 2일 때만 브리프를 다시 낸다.

### D6. 새 P0의 기록 사실 (원인 추정 대신 확인 가능한 사실)
같은 마일스톤의 두 번째 이후 stabilize에서 **새로** 등재되는 P0는 하위 줄에 아래 4가지 사실만 적는다. 원인 추정 문장(`missed-by: …`)은 요구하지 않는다 — 날조를 유도한다.
- `- 이전 감사 범위: 포함 | 미포함 | 불명`
- `- 새 근거: <이번에 새로 관측된 것>`
- `- 종결 항목과 동일성: 없음 | <ID>와 동일 → 그 항목 재개(재개 사유 기록)`
- `- 종결을 뒤집는 증거: 없음 | <무엇>`
`원인 미확인`도 허용값이다.

### D7. 보고자 기준 라우팅 폐지 — 성격 기준
6-S는 finding을 **성격**으로 라우팅한다: 동작·데이터·보안·계약 위반(= 결함) → `QA_FINDINGS.md`(severity 부여, item 5 대상) / 구조·중복·명명·부채·문서 정합(= 개선) → `IMPROVEMENT_GUIDE.md`. reviewer가 찾은 결함도 QA_FINDINGS로 간다. 보고자 이름은 항목 하위 줄 `- 출처: qa | reviewer(<surface>) | preflight | peer(<tag>)`로만 남긴다.
**본 결정은 졸업 item 5의 입력원을 넓힌다** — 기존에는 qa 팬아웃 결함만 세었고 reviewer 결함은 report-only였다. reviewer 축의 *미반환*은 여전히 판정을 바꾸지 않는다(`P2 [Audit-unavailable]`) — 결함 감사의 필수 축은 qa 팬아웃이다. 수용 경로(`/accept-milestone`·`/repair-acceptance`)의 finding도 같은 `decision` 값을 쓴다(사용자 관측이 곧 재현 관측 → 등재 시 `confirmed`). 단 그 경로에는 `rejected-fp`가 없다(ADR-066 D4 — 사용자 보고를 오탐으로 기각하지 않는다): 3+1 판정의 Out-of-contract → `rejected-context`, Needs User Clarification → `needs-confirmation`. 종결 증거는 회귀 테스트 Green 또는 재확인 receipt다(D3의 «재현 재실행»에 해당).

### D8. 수렴 지표 (telemetry)
stabilize 7-T에 다음 줄을 더한다: `- 수렴: round K / P0 신규 a · 해소 b · 재개 c / 재현 첨부율 <%> / needs-confirmation d`. 새 데이터 수집이 아니라 원장 계수다.

## 대안과 제약 (ADR-053)
- A. 면제 판정값(`WAIVED`) 신설 — 편익: 마일스톤이 깔끔히 닫힘. 제약: 졸업·수용·ROADMAP·아카이브·다음 M 진입 규칙 전부 재정의, ADR-067 D3 명시 배제와 충돌. 기각(재검토 트리거 2 도달 시 별도 ADR). ADR-067은 superseded (현재 SSOT: ADR-068).
- B. 미재현 P0를 P1로 자동 강등 — 편익: 구현 단순. 제약: severity(영향)와 증거 상태를 혼동해 기록이 거짓이 됨. 기각.
- C. 채택(본 ADR) — 정의표·재현·검토·종결·반경 재감사·예산.

## 신뢰도
Medium — 원인 셋은 문서·사용자 보고로 관측됐으나, 예산 3과 반경 재감사의 수렴 효과는 dogfood 전 [가설].

## 재검토 트리거
1. Round 11·12 dogfood에서 2 라운드 내 수렴 못 하면 D4 반경 정의·D5 예산 재조정.
2. 수렴 실패 브리프가 마일스톤 2회 연속 발화하면 면제 계약(대안 A) 설계.
3. `needs-confirmation`이 P0의 30%를 넘으면 D1 재현 형식이 과한지 재검토.

## 정책 강도 (ADR-022)
- 제약(강, [관측됨]): D1 P0 재현 필수, D2 P0 채택 전 confirmed, D3 종결 규칙(4-판정 전부), **D7 성격 기준 라우팅(졸업 item 5 입력원 확대 — reviewer 결함 포함)**.
- enabling(약): D4·D5·D6·D8.

## Mutation Contract (ADR-047 D3)
1. Target — `.claude/skills/stabilize-milestone/SKILL.md`(6-S 검토·라우팅, 단계 8 수렴 실패 브리프, 7-T 지표) / `.claude/skills/repair-milestone/SKILL.md`(round 카운터, 원인 묶기, 2-V 다섯째 항목, 수행 5 종결 전부) / `.claude/agents/qa.md`(D1 표·재현 줄) / `.claude/agents/reviewer.md`(D1 참조·결함 라우팅) / `docs/40-validation/{QA_FINDINGS,IMPROVEMENT_GUIDE}.md`(스키마) / `.claude/skills/plan-milestone/SKILL.md`(R0 병렬 Now 승인에 수렴 실패 이관 명시) / `.claude/skills/accept-milestone/SKILL.md`·`.claude/skills/repair-acceptance/SKILL.md`(수용 경로 decision·종결) / `docs/30-workitems/_templates/MILESTONE_TEMPLATE.md`(`## 8` 주석) / `docs/00-meta/WORKFLOW.md`(NO 분기 주석).
2. Failure mode — Reject 판정 원본이 open으로 남아 재등재 / 정적 추론 P0 / 수정이 여는 새 결함을 다음 라운드에서야 발견 / 수렴 실패 출구 부재 (전부 관측됨).
3. Predicted improvement — 같은 ID 재등재 0건, P0 재현 첨부율 100%, 라운드 3 이내 수렴 또는 사용자 결정 발화.
4. Preserved invariants — graduation 4값·우선순위(ADR-068 D4) / item 5 계수 정의(QA_FINDINGS P0 `status≠resolved` 0건 — 단 D7로 입력원이 reviewer 결함까지 넓어진다) / stabilize read-only / repair-milestone 재개방 없음(ADR-068 D1) / dispatcher 사전판정 금지(ADR-050#amend-1) / `(수용)` 태그 항목은 repair-acceptance 소유.
5. Falsifying evaluation — Round 11에서 (a) Reject 항목이 다음 stabilize에 재등재되면 D3 실패 (b) 재현 줄 없는 P0가 `confirmed`로 등재되면 D2 실패 (c) 반경 재감사가 잡지 못한 결함이 다음 stabilize에서 새 P0로 나오면 D4 반경 정의 재조정 (d) K 카운터가 stabilize 출력에 안 나오면 D5 배선 실패.
6. Rollback path — 본 ADR superseded → 6-S 검토·round 카운터·2-V 다섯째 항목·브리프 제거, 스키마의 필수 2필드를 권장으로 되돌림.

## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT. 실제 파일 경로 1행 1개)
- .claude/skills/stabilize-milestone/SKILL.md      — D2 6-S 검토 / D5 단계 8 브리프 / D7 라우팅 / D8 7-T
- .claude/skills/repair-milestone/SKILL.md         — D3 종결 / D4 원인·반경 / D5 round 카운터
- .claude/agents/qa.md                              — D1 정의표·재현 줄
- .claude/agents/reviewer.md                        — D1 참조·D7 결함 라우팅
- docs/40-validation/QA_FINDINGS.md                 — D3 스키마(P0·P1 필수 2필드) · D2 decision 값
- docs/40-validation/IMPROVEMENT_GUIDE.md           — D2 어휘 경계 · D3 스키마 · D5 round·convergence-decision 줄 형식과 writer 예외
- .claude/skills/plan-milestone/SKILL.md            — D5 병렬 Now 승인(수렴 실패 이관 · convergence-decision C 기록)
- .claude/skills/accept-milestone/SKILL.md          — D2 decision 등재 형식(사용자 관측 = 재현)
- .claude/skills/repair-acceptance/SKILL.md         — D3 종결
- docs/30-workitems/_templates/MILESTONE_TEMPLATE.md — D7 `## 8` 주석
- docs/00-meta/WORKFLOW.md                          — D5 NO 분기 주석

## 참고
- ADR-068(졸업 계약 v3 — D3 item 5·D4·D6), ADR-067(D3 병기 YES 배제 — superseded) (현재 SSOT: ADR-068), ADR-050#amend-1(사전판정 금지), ADR-054(single-origin), ADR-066(수용 finding — decision·종결은 본 ADR), ADR-060 D1(«결함을 감수한다는 선택» 원장 예외 — D5 B), ADR-038·ADR-044·ADR-060 D8(plan·discovery 리뷰 severity — 본 ADR 범위 밖), ADR-022, ADR-047 D3·D8.
```

### P1-2. `docs/40-validation/QA_FINDINGS.md`
- 현재: `## 항목 스키마` 아래 `- 권장 2필드: `status | decision``.
- 변경: 그 줄을 다음 두 줄로 교체.
  ```
  - 처리 후 필수 2필드(P0·P1): `status | decision` — 6-S 검토(ADR-070 D2)나 `/repair-milestone` 4-판정(ADR-070 D3)을 거친 P0·P1은 두 필드가 비어 있을 수 없다. P2와 미처리 항목은 권장.
  - `decision` 값: `confirmed | rejected-fp | rejected-context | needs-confirmation | unsubstantiated`(ADR-070 D2). P0 항목은 하위 줄 `- 재현: <명령/단계> → <관측 출력>`이 필수이며, 미시도면 `- 재현: 미시도 — <사유>` + evidence `[가설]`(ADR-070 D1).
  ```
- 예시 블록을 다음으로 교체.
  ```
  - **F-M1-001** | P0 | [관측됨] | linked: T-002 | status: open | decision: confirmed
    - 발견 (qa): 세션 만료 후 재요청이 500을 낸다.
    - 재현: `npm run validate:e2e -- --grep expired` → `Expected 401, received 500`
    - 출처: qa
  ```
- `## 다운스트림 마이그레이션 가이드`에 (3) 추가: `기존 항목의 decision 값이 자유 텍스트면 위 5값 중 하나로 정규화한다(불명이면 needs-confirmation).`
- evidence label 줄 다음에 `- 수렴-보류:` 마커 한 줄 추가(ADR-070 D5 B의 grep 신호 — `(수용)` 태그와 같은 이유로 스키마가 소유한다).
  ```
  - **선택 마커 `- 수렴-보류:`**: 수렴 실패 브리프에서 사용자가 선택지 B를 택한 항목에 붙는 하위 줄 — `- 수렴-보류: 회수 <시점> | 조건: <…>`. `status`는 `open`으로 유지한다(졸업 item 5 계수 불변). `/repair-milestone`이 그 라운드 수리 대상에서 제외하는 유일한 신호이며 문자열 정확 일치로 grep된다(ADR-070 D5).
  ```

### P1-3. `docs/40-validation/IMPROVEMENT_GUIDE.md`
- `## 항목 스키마`: P1-2와 동일하게 두 줄 교체(재현 줄 문장은 "결함이면 QA_FINDINGS가 제자리다(ADR-070 D7)"로 바꿈). **둘째 줄은 5값의 적용 범위를 «원본 finding 항목 한정»으로 못 박고 `## 5` 로그의 `decision`이 `Adopt | Adopt-modified | Reject-FP | Reject-context`임을 같은 줄에 병기한다** — 그러지 않으면 같은 문서의 `## 5` 예시(`decision: Adopt`)와 「형식은 `## 항목 스키마` SSOT 따름」이 서로 모순된다(§2 고정표 · ADR-070 D2 어휘 경계).
  ```
  - `decision` 값(**원본 finding 항목** 한정): `confirmed | rejected-fp | rejected-context | needs-confirmation | unsubstantiated`(ADR-070 D2). **`## 5. Repair decision log`의 `decision`은 수리 판정값 `Adopt | Adopt-modified | Reject-FP | Reject-context`를 그대로 쓴다** — 증거 상태와 수리 처분은 축이 다르므로 두 어휘를 섞지 않는다(ADR-070 D2 어휘 경계). 결함이면 QA_FINDINGS가 제자리다(ADR-070 D7).
  ```
- `## 5. Repair decision log` 안내 단락 끝에 추가:
  ```
  - **round 줄 (ADR-070 D5)**: `/repair-milestone`는 실행 시작 시 그 `### M-N` 그룹(없으면 신설)에 `- round: <K> (<YYYY-MM-DD>)`를 append한다. K는 기존 최대값 + 1. `/stabilize-milestone` 단계 8이 최대 K를 읽어 예산(3)과 대조한다.
  - **원인·반경·재감사 줄 (ADR-070 D4)**: Adopt 항목 하위에 `- 원인:` · `- 영향 반경:` · `- 재감사: <대상 N파일> / 새 finding K건` · 라운드 끝에 `- 자기 점검: …` 한 줄.
  ```
- 형식 예시 블록에 위 하위 줄 예를 한 줄씩 추가한다(`- round:`는 `### M-N` 그룹 줄이라 항목 예시에 넣지 않는다).
- `## 5` 끝 HTML 주석의 writer 목록(`/repair-plan`·`/repair-milestone`·`/repair-acceptance`만 append)에 예외 한 줄 추가 — ADR-070 D5가 `/plan-milestone` R0에 `- convergence-decision: C` 기록을 맡기므로 목록과 충돌한다.
  ```
       예외 1종: /plan-milestone R0는 `- convergence-decision: C (round K, <날짜>)` 줄 하나만 해당 `### M-N`에 append한다 (ADR-070 D5 — 선택지 C 기록 writer).
  ```

### P1-4. `.claude/agents/qa.md`
- 현재: `- 결과는 P0, P1, P2로 나눈다.`
- 변경: 그 줄 아래에 추가.
  ```
  - **severity 정의표(ADR-070 D1)를 따른다** — P0 = 재현 가능하게 관측됨 + (데이터 손실·손상 / 보안 노출 / Now 핵심 시나리오 완료 불가 / 빌드·기동·validate·e2e 실패 / 봉인 계약 위반으로 체감 변화). P1 = 우회 가능한 저하·비핵심 차단·a11y serious·체감 무변화 계약 불일치. P2 = 품질·권고.
  - **P0에는 `- 재현: <명령/단계> → <관측 출력>` 줄이 필수다.** 재현을 못 했으면 `- 재현: 미시도 — <사유>`로 적고 label을 `[가설]`로 둔다. 재현 없는 P0는 메인이 채택하지 않고 확인 경로로 보낸다 — 그것은 네 판단을 낮추는 것이 아니라 증거 상태를 구분하는 것이다.
  - **반경 재감사 위임**을 받으면(입력에 `scope: delta` + 파일 목록) 그 파일과 그것을 참조하는 파일·화면만 본다. 전수 감사가 아니다.
  ```

### P1-5. `.claude/agents/reviewer.md`
- 현재: `- 결과는 P0, P1, P2로 나눈다.`
- 변경: 아래 두 줄 추가.
  ```
  - severity 정의는 ADR-070 D1 표를 따른다. 결함(동작·데이터·보안·계약 위반)을 찾으면 그것은 `QA_FINDINGS.md` 대상이며 P0면 재현 줄을 함께 적는다(ADR-070 D7 — 보고자가 아니라 성격이 원장을 정한다). 구조·중복·명명·부채·문서 정합은 IMPROVEMENT_GUIDE 대상이다.
  - 호출 측이 D1 표를 전달하는 것은 기준 전달이지 사전판정이 아니다(ADR-050#amend-1 결정 2).
  ```

### P1-6. `.claude/skills/stabilize-milestone/SKILL.md`
- (a) 6-S 첫 불릿 현재: `- qa 보고 → `docs/40-validation/QA_FINDINGS.md`에 누적 기록. reviewer 보고 → `docs/40-validation/IMPROVEMENT_GUIDE.md`에 정리.`
  변경:
  ```
  - **성격 기준 라우팅 (ADR-070 D7)**: 보고자와 무관하게 결함(동작·데이터·보안·계약 위반)은 `docs/40-validation/QA_FINDINGS.md`, 개선(구조·중복·명명·부채·문서 정합)은 `docs/40-validation/IMPROVEMENT_GUIDE.md`에 적는다. 항목 하위 줄 `- 출처: qa | reviewer(<surface>) | preflight | peer(<tag>)`로 보고자를 남긴다.
  - **채택 전 검토 (ADR-070 D2 — 등재 전 1회, P0·P1 전부)**: 각 항목을 `confirmed | rejected-fp | rejected-context | needs-confirmation | unsubstantiated` 중 하나로 판정해 `decision:`에 적는다. **P0는 `- 재현:` 절차를 qa 단발 sub-call(명령 1회면 메인)이 다시 실행해 관측했을 때만 `confirmed`다. 코드·문서·상태를 바꾸는 재현은 메인이 직접 돌리지 않는다 — 단계 3이 띄운 환경에서 qa로, 불가하면 `needs-confirmation`(확인 방법 = `/repair-milestone`).** P1은 보고의 재현·근거를 코드·문서로 확인하면 `confirmed`(재실행 불요). 재현 줄이 없으면 `[Finding-unreproduced]`를 붙여 `needs-confirmation`(하위 줄 `- 대상 / 확인 방법 / 막힌 이유` 3필드)으로 둔다. `rejected-*`·`unsubstantiated`는 `status: resolved`로 등재한다(unsubstantiated는 `### 관찰 메모`에 한 줄). 판정 근거 한 줄을 남긴다. 이것은 사후 판정이며 verifier에게 심각도를 미리 지정하는 것이 아니다.
  - **같은 마일스톤의 2회차 이후 stabilize에서 새로 등재하는 P0**는 ADR-070 D6의 4가지 사실 줄(이전 감사 범위 / 새 근거 / 종결 항목과 동일성 / 종결을 뒤집는 증거)을 하위에 적는다. 종결 항목과 동일하면 새 ID를 만들지 않고 그 항목을 `status: open`으로 재개하고 재개 사유를 적는다.
  ```
- (b) 단계 4 qa 팬아웃 입력에 추가(`- **위임 시 ADR-046#d3 적용…` 불릿 다음):
  ```
  - **입력에 ADR-070 D1 severity 정의표를 그대로 전달한다**(기준 전달 — 사전판정 아님). P0 재현 줄 형식도 함께 전달한다.
  ```
- (c) 7-T 집계 항목에 추가(`- Cross-stabilize 회귀 신호:` 다음):
  ```
  - **수렴 (ADR-070 D8)**: `round K`(IMPROVEMENT_GUIDE `## 5` `### M-N`의 `- round:` 최대값, 없으면 0) / P0 신규 a · 해소 b · 재개 c / P0 재현 첨부율 <%> / needs-confirmation d건
  ```
  출력 형식 예시 블록에 `- 수렴: round 2 / P0 신규 1 · 해소 3 · 재개 0 / 재현 첨부율 100% / needs-confirmation 0` 한 줄 추가.
- (d) 단계 8 `**졸업 가능 = NO 또는 P0 후속 있음**` 분기 첫머리에 추가:
  ```
  - **수렴 실패 브리프 (ADR-070 D5)**: 7-T의 `round K`가 **3 이상**이고 `### P0`에 `status: open`이 남아 있으면, 판정은 그대로 두고 `[Convergence]` 라벨로 Decision Brief 6블록(`authority: user-choice`, `영향: M<N>`, DECISION_REGISTER 등재)을 출력한다 — 남은 P0/P1 각각의 `decision`·근거·영향·수리 범위·보류 가능 여부 + 선택지 A(계속 수리) / B(비차단 항목에 `- 수렴-보류: 회수 <시점> | 조건: …` 하위 줄을 달아 이번 라운드 대상에서 빼고 차단 항목만 수리 — `status`는 `open` 유지, finding 원장에 `deferred` 상태를 만들지 않는다) / C(`NO` 유지 + 병렬 Now 승인으로 다음 마일스톤 진행 — carry-over 표시 지속, 해소 후 `/repair-milestone M<N>`이 원본을 닫고 본 skill 재실행으로 `YES`). **판정값 신설·`YES` 병기·P0의 P1 재분류는 하지 않는다.** 항목을 DECISION_REGISTER에 `open`으로 등재하고(정상 책임 4), 사용자가 같은 세션에서 답하면 *그 항목에 한해* `closed` + 앵커를 쓴다. **`## 5`의 `- convergence-decision:` 줄은 답변 시점과 무관하게 후속 skill이 남긴다**(A·B → `/repair-milestone` 1-R, C → `/plan-milestone` R0 — 본 skill은 `## 5`에 쓰지 않는다, ADR-070 D5). `## 5` `### M-N`에 `- convergence-decision:` 줄이 이미 있으면 새 P0 ID가 생겼거나 K − 결정 round ≥ 2일 때만 다시 낸다. **`BLOCKED` 분기에서도 같은 조건(round ≥ 3 + open P0)이면 동일 브리프를 낸다** — 감사 미완·환경 불가와 별개로 남은 P0의 진행 경로를 사용자가 정해야 한다.
  ```
- (e) 책임 경계 단락의 `- P0 기준은 `QA_FINDINGS.md`의 미해소 P0만 반영한다(qa 팬아웃分 — reviewer는 report-only로 미반영).` → `- P0 기준은 `QA_FINDINGS.md`의 미해소 P0만 반영한다(성격 기준으로 등재된 결함 — 보고자 무관, ADR-070 D7).`
- (f) 도입부 정상 책임 1 문장 `(qa 위임 결과)` → `(결함 — 보고자 무관, ADR-070 D7)`, 2 `(reviewer 위임 결과 + deterministic preflight 결과)` → `(개선 — 보고자 무관 + deterministic preflight 결과)`.
- (g) 단계 5 «축 미반환 회수 규율» 문단 끝에: `reviewer가 정상 반환한 **결함**은 6-S가 QA_FINDINGS로 보내 졸업 입력이 된다(ADR-070 D7). 미반환 자체는 여전히 판정을 바꾸지 않는다.`
- (h) `docs/30-workitems/_templates/MILESTONE_TEMPLATE.md` `## 8` `graduation:` 주석의 `(단계 4~6 qa 팬아웃 P0(QA_FINDINGS)만 반영, reviewer report-only 미반영)` → `(QA_FINDINGS `### P0` 미해소 항목만 반영 — 보고자 무관, 성격 기준 등재 ADR-070 D7)`.

### P1-7. `.claude/skills/repair-milestone/SKILL.md`
- (a) 반드시 먼저 할 일 1 다음에 추가:
  ```
  1-R. **round 카운터 (ADR-070 D5)**: `IMPROVEMENT_GUIDE.md ## 5`의 `### M-N` 그룹(없으면 신설)에 `- round: <K> (<YYYY-MM-DD>)`를 append한다. K = 그 그룹의 기존 `- round:` 최대값 + 1(첫 실행 1). 이 줄이 `/stabilize-milestone` 단계 8 수렴 판정의 유일한 입력이다. 사용자가 수렴 실패 브리프(ADR-070 D5)에 A·B로 답한 뒤의 첫 실행이면(답변이 같은 세션이었는지와 무관) 같은 그룹에 `- convergence-decision: <A|B> (round K, <날짜>)`를 append하고 DECISION_REGISTER의 그 `[Convergence]` 항목을 `closed`로 쓴다(이미 닫혀 있으면 그대로 둔다). **선택지 B로 답했으면 `- 수렴-보류:` 줄이 달린 finding을 이 라운드의 4-판정·수정 대상에서 제외한다**(ADR-070 D5 B — 원본은 `open`으로 남아 다음 M `/plan-milestone` R0가 회수한다).
  ```
- (b) 비판적 재점검 단락 끝 `> 자기 판단을 신뢰하되, 애매하면 Adopt 쪽으로 보수적으로. Reject는 *근거가 코드/문서로 확인될 때만*.` 다음에 추가:
  ```
  > **severity는 ADR-070 D1 표로 판정한다.** Adopt-modified에서 severity를 낮출 수 있으나(예: 재현되나 우회 가능 → P1) 사유를 한 줄 적는다. **`decision: needs-confirmation` 항목은 먼저 확인을 시도한다** — 확인되면 `confirmed`로 바꾸고 Adopt 경로, 반증되면 Reject-*, 여전히 불가면 `needs-confirmation` 유지 + 막힌 이유 갱신(그 P0는 졸업을 계속 막는다).
  ```
- (c) 수행 1 `Adopt / Adopt-modified 항목을 우선순위(P0 > P1 > P2) 순으로 처리한다.` 뒤에 추가:
  ```
  1-C. **원인 단위 묶기 (ADR-070 D4)**: Adopt 항목을 root cause로 묶어 한 수정으로 처리한다(증상마다 따로 고치지 않는다). 각 항목의 `## 5` 로그에 `- 원인: <한 줄>` · `- 영향 반경: <변경 파일 + 그것을 참조하는 파일·화면>`을 적는다.
  ```
- (d) 2-V의 `내용은 넷이다` → `내용은 다섯이다`. `(iv) … 1회 실행한다.` 문장 뒤(`**이것은 전체 검증이 아니다**` 앞)에 추가:
  ```
  (v) **영향 반경 재감사 (ADR-070 D4)** — 1-C의 영향 반경(변경 파일 + 의존 파일·화면)을 대상으로 qa 단발 sub-call(`scope: delta` + 파일 목록 + ADR-070 D1 표)로 회귀·엣지 점검을 돌린다(Codex: 메인이 qa.md 인라인). 결과를 `- 재감사: <대상 N파일> / 새 finding K건`으로 로그에 남기고 새 finding은 6-S와 같은 채택 전 검토(ADR-070 D2)를 거쳐 등재한다. 종료 전 `- 자기 점검: 이 수정으로 새로 열릴 수 있는 P0 후보 — <없음 | 목록>`을 남기고 후보가 있으면 같은 라운드에서 확인한다.
  ```
- (e) 수행 5 현재: `5. **원본 finding status 갱신** — Adopt/Adopt-modified로 해소한 …`
  변경(전체 교체):
  ```
  5. **원본 finding 종결 — 4-판정 전부 (ADR-070 D3)**: IMPROVEMENT_GUIDE `### M-N`·QA_FINDINGS `## M-N`의 원본 항목에 대해 — Adopt/Adopt-modified는 **원본 `- 재현:` 절차를 다시 실행해 통과를 관측한 뒤** `status: resolved` + 하위 줄 `- 재현 재실행: <날짜> 통과`; Reject-FP는 `status: resolved` + `decision: rejected-fp` + 근거; Reject-context는 `status: resolved` + `decision: rejected-context` + 근거; needs-confirmation 유지분은 `status: open` 그대로 + 막힌 이유 갱신(판정된 open). 재현 줄이 없는 항목(P1·P2·개선·문서)은 `- 종결 근거: <검증 수단 → 결과>` 한 줄이 종결 증거다. **판정 없이 원본을 `open`인 채 두지 않는다**(Reject 원본이 열려 있으면 다음 stabilize가 같은 P0를 다시 센다). closed records인 `## 5`로 옮기지 않고 *status만* 토글한다.
  ```
- (e-2) 수행 6(stabilize-reviews 삭제)의 «전 severity finding이 4-판정 완결» 판정에서 `needs-confirmation`은 완결로 센다(3필드가 QA_FINDINGS로 옮겨졌으므로 — ADR-070 D3).
- (f) 마지막 출력에 추가: `- round: K (ADR-070 D5)` · `- 반경 재감사: 대상 N파일 / 새 finding K건 / 자기 점검 결과` · `- 종결: resolved N건(Adopt M / Reject K) · needs-confirmation 유지 J건`.
- (g) 정책 근거 문단에 `finding 심각도·종결·수렴은 [ADR-070](../../../docs/90-decisions/boilerplate/ADR-070-finding-severity-closure-and-convergence.md).` 추가.

### P1-8. `.claude/skills/plan-milestone/SKILL.md` (R0 병렬 Now 문구)
- 현재: `*명시적 병렬 승인이 없는 한* 새 마일스톤을 Now로 추가하지 않는다`
- 변경: 그 문장 뒤에 `(수렴 실패 브리프에서 사용자가 선택지 C를 택한 경우가 명시적 병렬 승인이다 — ADR-070 D5. 그 M의 open P0는 carry-over로 계속 표시된다)` 삽입.
- 같은 R0 문단 끝에: `선택지 C로 진입하면 DECISION_REGISTER의 그 `[Convergence]` 항목을 `closed`(앵커: ROADMAP `## Now` 행)로 쓰고 `IMPROVEMENT_GUIDE.md ## 5 ### M<N>`에 `- convergence-decision: C (round K, <날짜>)`를 append한다(ADR-070 D5).`
- R1 `(미할당)` 결정 triage 문단 끝에: `**`status: deferred`이고 `회수:` 시점이 «이번 M plan-milestone R1»인 항목**(스택 카탈로그 `이관`분 — ADR-071 D2)도 회수해 결정하거나 재이관한다(회수 시점을 다시 앞으로 미루는 무한 이관은 사용자 확인 필요).`

### P1-8b. `accept-milestone`·`repair-acceptance` (수용 경로에 같은 스키마)
- `accept-milestone` R5 1번 «계약 위반(결함)» 문장 `기존 스키마로 등재(항목 문두에 `(수용)` 태그)` 뒤에 추가: `등재 시 `| status: open | decision: confirmed`와 하위 줄 `- 재현: 사용자 관측 — 시나리오 [N/M] <조작> → <관측>`을 함께 적는다(사용자 관측이 곧 재현 관측 — ADR-070 D2). severity는 ADR-070 D1 표를 따른다(아래 «severity 기준» 문장은 그 표의 요약이다).`
- `repair-acceptance` 수행 8 «원본 finding status 갱신 (4종 전부)»를 ADR-070 D3에 맞춰 보강한다(3+1 판정에는 `Reject-false-positive`가 없으므로 `rejected-fp`는 쓰지 않는다 — ADR-066 D4 유지): ① Adopt/Adopt-modified → `status: resolved` + `decision: confirmed` + 하위 줄 `- 종결 근거: 회귀 테스트 <경로> Green` (면제 항목은 `- 종결 근거: 면제 — <사유> / 재확인: invalidated → /accept-milestone`) ③ Out-of-contract → 기존 재분류 앵커 그대로 + `decision: rejected-context` ④ Needs User Clarification → `status: open` + `decision: needs-confirmation` + 하위 줄 `- 대상 / 확인 방법: 사용자 답변 / 막힌 이유`. 문장 끝에 `(ADR-070 D3 — 수용 경로 종결)`을 붙인다. `(수용)` 태그 항목 소유는 불변(ADR-066 D5).

### P1-9. `docs/00-meta/WORKFLOW.md`
- lifecycle 다이어그램의 `├─NO──────────────────→ repair-milestone (직접 수정 — 재개방 없음) → stabilize 재실행` 줄 뒤에 주석 줄 추가:
  ```
                     │      (round ≥ 3인데 P0 open이면 stabilize가 수렴 실패 브리프 출력 — 계속 수리 / 비차단 보류 / NO 유지 + 병렬 Now. 면제 판정값 없음 — ADR-070 D5)
  ```

### P1-10. 참조 갱신(amend 아님)
- `ADR-050` `## Amendment 1` 결정 2 뒤에 한 줄: `> 참조 갱신 (2026-09): 검증자에게 severity 정의표(ADR-070 D1)를 전달하는 것은 본 결정 2의 «기준·계약 전달»에 해당한다. 사전판정 금지와 사후 판정 기록 규칙(ADR-070 D2)은 별개다.`
- `ADR-068` D6 검증 집합 목록 뒤에 한 줄: `> 참조 갱신 (2026-09): [ADR-070](ADR-070-finding-severity-closure-and-convergence.md) D4가 검증 집합에 다섯째 항목(영향 반경 재감사)을 더한다. 본 D6의 네 항목은 그대로다.`
- `ADR-068` D3 item 5 뒤에 한 줄: `> 참조 갱신 (2026-09): `status`·`decision` 값과 종결 규칙은 ADR-070 D2·D3이 소유한다. item 5의 계수 정의는 불변이나 입력원은 D7로 reviewer 결함까지 넓어진다.`
- `ADR-066` D4(피드백 3갈래 라우팅) 뒤에 한 줄: `> 참조 갱신 (2026-09): 수용 finding의 `decision` 값·종결 규칙은 [ADR-070](ADR-070-finding-severity-closure-and-convergence.md) D2·D3을 따른다(사용자 관측이 재현 관측이다. 본 D4의 «Reject-false-positive 없음»은 유지 — 수용 경로에 `rejected-fp`는 없다). `(수용)` 태그·소유는 불변.`

### P1-11. 커밋
```
docs(adr): add ADR-070 finding severity, closure and convergence contract
feat(skills): wire finding triage, closure of all verdicts and round budget into stabilize and repair-milestone
```
(두 커밋으로 나눈다: ADR + 스키마 / 스킬·에이전트·WORKFLOW.)


---

## Phase 2. 스택 결정 카탈로그 + 스캐폴드 소유 (ADR-071)

목표: (1) `/bootstrap-stack`이 모든 스택 항목을 카탈로그로 검토해 disposition을 남기고, 부분 입력도 라우팅한다. (2) `/stack-guard`가 green-field 스캐폴드와 기초 라이브러리(카탈로그의 `설치: baseline` 행)를 설치하고 실제 코드 위에서 probe·boot smoke·게이트·CI를 실측한다. (3) Storybook 설치 자리를 여기에 둔다(Phase 5가 사용).

### P2-1. 카탈로그 파일 신설 — `.claude/skills/bootstrap-stack/stack-catalog.md`
부록 D의 초안을 그대로 파일로 만든다. 열 정의:

| 열 | 값 |
|---|---|
| id | `cat-<유형>-<슬러그>` (예 `cat-web-ui-kit`) |
| 항목 | 사람이 읽는 이름 |
| tier | T1 / T2 / T3 (ADR-055 결정 4 기준) |
| authority 기본값 | `user-choice` / `user-approval` / `agent-delegated` (ADR-060 D2 3축 — user-choice: 제품 의도·외부 계약·비용·비가역 약속 / user-approval: 되돌린 뒤 코드·데이터·계정 파급 / agent-delegated: 코드 안에서 끝남) |
| 설치 | `baseline`(stack-guard 6-2-b가 설치) / `task`(plan-workitem authoring → implement 설치) / `n/a` |
| 정본 앵커 | 결정 본문이 적히는 자리(ARCH `## 7-N` 소항목 / ADR-101 / STACK_SETUP_PLAN 절) |
| 기본 후보 | 스택별 기본 추천 1~2개(없으면 비움) |

원칙: **카탈로그는 색인이다.** 결정 본문은 정본 앵커에만 적고 registry에는 disposition·앵커만 남긴다(제2 SSOT 금지).

### P2-2. ADR-071 작성 — `docs/90-decisions/boilerplate/ADR-071-stack-decision-catalog-and-scaffold.md`

```markdown
# ADR-071 — 스택 결정 카탈로그 + 스캐폴드 소유 (Stack Decision Catalog & Scaffold Ownership)

> scope: boilerplate
> area: tooling/process

## Status
accepted

> 부분 supersede: [ADR-052](ADR-052-stack-provisioning-and-e2e-readiness.md) D1의 install-ownership 3분할에 **네 번째 class(기초 라이브러리 baseline 설치 + 스캐폴드)**를 더한다. [ADR-055](ADR-055-input-adaptive-stack-flow.md) 결정 1의 BASE/DEEP 2분기를 **BASE/HYBRID/DEEP 3분기**로 확장한다. [ADR-063](ADR-063-verification-harness-integrity.md) D1의 «소스 루트를 새로 만들지 않는다»는 **probe 단계에 한해 유지**되고, 소스 루트 생성은 본 ADR D5의 스캐폴드 단계가 probe 앞에서 수행한다. 세 ADR에는 참조 갱신 줄만 둔다(본문 결정은 유효).

## 배경
- [관측됨] `/bootstrap-stack` 입력 서식(`stack-brief-template.md`)은 7칸이고, R0는 프레임워크 토큰이 1개라도 있으면 BASE로 보내 나머지를 «추천을 원하면 스택 없이 재실행» 한 줄로 끝낸다. UI 킷·스타일링·폼·상태관리·계측·에러 리포팅·호스팅 등은 물어볼 자리가 없어 마일스톤 중간에 즉흥 결정되고, 그때마다 ARCH·ADR-101을 다시 고친다(사용자 fork 보고).
- [관측됨] ADR-060 D9 표는 ARCH `## 7-1`~`## 7-5` 소항목(라우팅·인증·SSR 등 정책 수준)에만 authority를 배정한다. 패키지·provider 수준(어떤 UI 킷, 어떤 에러 리포팅 provider)과 슬롯이 없는 항목은 배정 대상이 아니다.
- [관측됨] 정상 lifecycle에서 `/stack-guard` 실행 시점의 소스 파일 수는 0이다(ADR-063 배경). probe는 `SKIPPED (등록된 소스 루트 부재)`, e2e는 `EMPTY`, design gate는 자가 검사만 통과한다. 첫 마일스톤의 첫 task가 사실상 «초기 세팅»이 되어 계획 층이 인프라 결정을 떠안는다(SIMULATION_RUN probe 실측 1순위 미실측 항목).
- [관측됨] `output-checklist.md`는 STACK_SETUP_PLAN을 «선택 생성 문서»로 두고 «자동 작성 X» 문구가 남아 있으나, 실제로는 stack-guard·plan-workitem·implement가 그 파일을 SSOT로 읽는다(ADR-051#amend-4 Dependency Tools).

## 결정

### D1. 스택 결정 카탈로그 (색인)
`.claude/skills/bootstrap-stack/stack-catalog.md`가 프로젝트 유형별(web frontend / API server / CLI / monorepo / Supabase / Flutter) 결정 항목의 **색인**이다. 열: id · 항목 · tier · authority 기본값 · 설치(baseline/task/n/a) · 정본 앵커 · 기본 후보. 결정 본문은 정본 앵커(ARCH `## 7-N` / ADR-101 / STACK_SETUP_PLAN)에만 적는다.

### D2. disposition 필수 + registry
`docs/00-meta/STACK_SETUP_PLAN.md ## Stack Decision Registry`에 카탈로그의 **해당 유형 행 전부**를 한 행씩 적는다. 열: `id | 항목 | disposition | authority | 정본 앵커 | 확인일`. disposition 값은 넷뿐이다.

| disposition | 뜻 | 요건 |
|---|---|---|
| `확정` | 결정됨 | 정본 앵커 필수 |
| `해당 없음` | 이 프로젝트에 존재하지 않는 항목 | 사유 한 줄 |
| `이관` | 지금 결정하지 않음 | registry 행에 `사유 + 회수 시점` **그리고** DECISION_REGISTER에 `deferred` 항목(무영향 근거·이관 앵커 = registry 행·회수 시점 — ADR-060 D4 3필드). `/plan-milestone` R1이 회수 시점이 된 `deferred`를 회수한다 |
| `미결정` | 결정해야 하는데 못 함 | `/bootstrap-stack` 종료 출력에 open으로 보고 + DECISION_REGISTER `open` 등재 |

빈 행(disposition 없음)이 하나라도 있으면 `/bootstrap-stack`은 성공 종료하지 않는다.

### D3. authority 배정
- 카탈로그의 `authority 기본값`을 출발점으로 한다. `user-choice`·`user-approval` 행은 Decision Brief 6블록으로 제시하고(라운드당 3~5개, ADR-060 D3), `agent-delegated` 행은 라운드 끝 **일괄 확인 1회**로 처리한다(ADR-060 D2·bootstrap-stack 결정 마감 4).
- 사용자가 일괄 확인에서 어떤 행을 뒤집으면 그 행은 `user-approval`로 승격해 원장에 등재한다.
- 배정 기준은 ADR-060 D2·D9와 같다 — 제품 의도·외부 계약·비용·비가역 약속은 `user-choice`, 되돌린 뒤 코드·데이터·사용자 계정·외부 계약에 파급이 있으면 `user-approval`, 코드 안에서 끝나면 `agent-delegated`.

### D4. 부분 입력 라우팅 (BASE / HYBRID / DEEP)
R0 분기를 셋으로 한다.
- **DEEP**: 해석 가능한 프레임워크 토큰 없음 → 기존 DEEP R1~R4.
- **BASE**: 프레임워크 토큰 있음 **그리고** 카탈로그 T1 행이 모두 입력에서 결정됨 → 문서화 + **카탈로그 라운드 R-C**(T2/T3 미결정 행만).
- **HYBRID**: 프레임워크 토큰은 있으나 T1 행에 미결정이 남음(예: 프론트만 주고 백엔드 미정) → DEEP R1~R2를 **미결정 T1 행에 한정**해 실행 → R-C → R4 저장. «추천을 원하면 재실행» 한 줄 echo는 폐지한다.
- brownfield(manifest 존재)는 감지 결과로 registry를 채우고 미관측 행만 R-C에서 묻는다.
- **프로젝트 유형 판별**: 유형 = 입력·감지에서 활성화된 ARCH sub-section 집합으로 정한다 — `## 7-4` → web frontend, `## 7-1`/`## 7-3` → API server, `## 7-2` → CLI, `## 7-5` → Flutter, workspace manifest → monorepo, Supabase 토큰·`supabase/` → Supabase 통합. 복수 가능. 판별이 애매하면(예: Next.js가 API route를 겸하는가) R0 첫 확인에서 사용자에게 유형을 1회 묻는다.

### D5. 스캐폴드 소유 — `/stack-guard` 수행 0 (검증 진입점보다 먼저)
- **위치**: 수행 1(`validate` 진입점 생성)·수행 2(verify 스크립트·도구 config)보다 **앞**인 «수행 0»이다. 그래야 생성기가 만든 manifest(`package.json`·`pubspec.yaml`·`pyproject.toml`)가 원본이 되고, 수행 1은 그 위에 `validate*` 스크립트 키만 더한다(기존 키·의존 보존). 스캐폴드를 수행 1 뒤에 두면 harness가 먼저 만든 manifest와 생성기 manifest가 충돌한다.
- **조건**: green-field = 그 scope에 등록 소스 루트 0 **그리고** 프레임워크 manifest 부재. brownfield·부분 초기화(소스 루트 있음, 또는 manifest 존재)는 그 scope의 스캐폴드를 건너뛰고 `skipped (<사유>)`를 남긴다.
- **scope 단위**: registry `cat-common-repo-layout`이 정한 scope(단일 패키지 `.` / monorepo `apps/web`·`apps/mobile` 등)마다 생성기 1종을 **그 scope 디렉터리에** 돌린다. `## Scaffold`는 scope별 1행.
- **생성기**: 각 유형의 `cat-<유형>-framework` 확정 행의 공식 생성기(예 `create-next-app`, `npm create vite`, `flutter create`, `uv init`). 옵션은 registry `확정` 행에서 도출(언어·PM·스타일링·라우팅·src 디렉터리·테스트 도구). 도출 불가 옵션은 생성기 기본값 + 출력에 명시. 공식 생성기가 없는 유형(일부 API·CLI)은 «최소 골격» — 소스 루트 1 + 테스트 루트 1 + manifest — 만 만들고 `## Scaffold`에 `generator: minimal`로 적는다.
- **병합 규칙**: 임시 디렉터리에 생성 → scope 디렉터리로 복사하되 harness 파일은 **절대 덮어쓰지 않는다** — `README.md`·`README_ko.md`·`LICENSE`·`docs/**`·`.claude/**`·`.codex/**`·`.agents/**`·`.boilerplate/**`·`AGENTS.md`·`CLAUDE.md`·`.github/**`. 루트 `.gitignore`는 줄 단위 합집합(저장소 기존 줄 우선, 중복 제거). 그 외 충돌 파일(green-field에서는 정상적으로 없다)은 덮어쓰지 않고 `Scaffold conflict: <경로>`로 사용자 결정에 넘긴다. 생성기가 만든 `.git`은 버린다.
- **보호 경로 검사**: 복사 직후 `git status --porcelain -- README.md README_ko.md LICENSE AGENTS.md CLAUDE.md docs .claude .codex .agents .boilerplate .github`가 비어 있어야 한다. 비어 있지 않으면 `Scaffold protected-path violation: <경로>`를 출력하고 종료한다(되돌리기는 사용자 결정 — 자동 `checkout` 하지 않는다).
- **기록**: `STACK_SETUP_PLAN.md ## Scaffold`에 scope별 `scope | status | 생성기·버전 | 옵션 | 생성 파일 수 | 제외·충돌 | 실행일`. 생성 파일 전량은 `git status --porcelain`으로 사용자가 본다(문서 복사 금지).
- **커밋하지 않는다.** 출력에 권장 커밋 메시지 한 줄(`chore(scaffold): initialize <framework> project skeleton`).
- ADR-063 D1의 probe는 이 뒤(수행 5)에 돈다. probe는 여전히 소스 루트를 만들지 않는다.

### D6. 기초 라이브러리 baseline 설치 — `/stack-guard` 6-2-b
카탈로그 `설치: baseline`이고 registry `확정`인 행의 패키지를 스캐폴드 직후 설치한다(UI 킷·스타일링·아이콘·UI 미리보기 도구·lint/format 도구·계측 SDK 등). 버전은 registry `확인일` 기준 researcher 고정값. **예외 — 폰트 패키지·파일**: 폰트 선택은 DESIGN `## 3`(ADR-073 D4)이 `/bootstrap-design` R6 쇼케이스에서 확정하므로 stack-guard가 미리 설치하지 않는다. 확정 뒤 R6 배선(builder 단발)이 그 패키지·파일을 추가한다(ADR-058#amend-4 결정 2) — 설치 소유의 명시 예외다. `설치: task` 행은 기존대로 plan-workitem authoring → implement 설치(ADR-040#amend-1·ADR-052 D1). install-ownership은 이제 **4분할**이다: authoring / per-task 실행 / baseline toolchain·e2e / **baseline 라이브러리·스캐폴드(본 ADR)**.
- 웹 UI 프로젝트에서 registry `cat-web-ui-preview`가 `Storybook`이면 여기서 설치한다: 프레임워크 공식 통합 패키지 + 애드온은 `a11y`·`viewport`만(추가 애드온·Chromatic·MDX 강제 없음). `package.json`에 `storybook`·`build-storybook` 스크립트가 없으면 추가한다. Flutter는 미리보기 도구를 설치하지 않는다(별도 진입 파일 갤러리 — ADR-072).

### D7. 버전 currency
새로 결정하거나 불확실한 행만 researcher 단발 sub-call로 현재 메이저·호환성·발행일을 확인해 registry `확인일`에 적는다. 이미 실측된 스택(brownfield lockfile)은 재조사하지 않는다.

### D8. STACK_SETUP_PLAN은 필수 산출물
`/bootstrap-stack`은 STACK_SETUP_PLAN을 **항상** 생성·갱신한다(기존 «선택 생성» 폐지). `output-checklist.md`의 «자동 작성 X» 문구는 삭제한다.

## 대안과 제약 (ADR-053)
- A. 카탈로그를 권장 체크리스트로만(강제 없음) — 편익: 부담 0. 제약: 누락이 재발하고 ADR-060 D9와 같은 «자리 없음»이 남는다. 기각.
- B. 전 행 개별 승인 — 편익: 확실. 제약: 결정 피로(라운드당 3~5개 상한 위반). 기각.
- C. 채택 — 색인 + disposition 필수 + 되돌리기 비싼 행만 개별 승인.
- 스캐폴드 위치 대안: plan-milestone M1 첫 task(현행 사실상) — 계획 층이 인프라를 떠안고 probe 실측이 M1 뒤로 밀린다. 기각.

## 신뢰도
Medium — 누락·즉흥 결정은 관측됐고, 카탈로그 행의 완결성은 dogfood에서 보정 대상.

## 재검토 트리거
1. Round 11·12에서 registry `미결정`이 5행 이상 남으면 카탈로그 행·authority 기본값 재조정.
2. 병합 규칙이 harness 파일을 한 번이라도 덮어쓰면 D5를 «생성기 출력 미리보기 후 사용자 승인»으로 강화.
3. baseline 설치 패키지가 첫 마일스톤에서 미사용으로 남는 비율이 높으면 `설치: baseline` 집합 축소.

## 정책 강도 (ADR-022)
- 제약(강, [관측됨]): D2 disposition 필수(빈 행이면 성공 종료 금지), D5 harness 파일 미덮어쓰기.
- enabling(약): D1·D3·D4·D6·D7·D8.

## Mutation Contract (ADR-047 D3)
1. Target — `.claude/skills/bootstrap-stack/SKILL.md`(R0 3분기, R-C 카탈로그 라운드, BASE 4 registry, 마지막 출력) / `stack-catalog.md` 신설 / `stack-brief-template.md` / `output-checklist.md` / `.claude/skills/stack-guard/SKILL.md`(수행 0 스캐폴드, 6-2-b baseline 설치, 5-a 문구, 재실행 계약 행) / `docs/00-meta/_templates/STACK_SETUP_PLAN_TEMPLATE.md`(`## Stack Decision Registry`·`## Scaffold`) / `.claude/skills/plan-workitem/SKILL.md`(설치 line item에서 baseline 설치분 제외) / `docs/00-meta/{PROJECT_START_CHECKLIST,GUARDRAILS_STRATEGY,STRUCTURE,DELEGATION_STRATEGY}.md`.
2. Failure mode — 카탈로그에 없는 항목의 즉흥 결정 / 프레임워크 한 토큰이 라운드를 건너뜀 / 소스 0개 위에서 검증 장치가 SKIPPED로 굳음 / 첫 task가 인프라 세팅이 됨 (전부 관측됨).
3. Predicted improvement — registry 빈 행 0 / probe smoke가 M1 전에 `PASS`·`PARTIAL` 실측 / e2e boot smoke `PASS` / 마일스톤 중 ARCH §7·ADR-101 재편집 횟수 감소.
4. Preserved invariants — `disable-model-invocation` / bootstrap-stack에 Bash 없음(스캐폴드는 stack-guard) / probe가 소스 루트를 만들지 않음(ADR-063 D1) / 기존 도구 미덮어씀·재실행 계약(ADR-063 D3) / T1/T2/T3 taxonomy(ADR-055) / Dependency Tools 표 의미(ADR-051#amend-4) / Needs Install graceful fallback.
5. Falsifying evaluation — Round 11(web)·12(Flutter)에서 (a) registry에 빈 행이 남은 채 bootstrap-stack이 성공 종료하면 D2 실패 (b) 수행 0 직후 보호 경로 검사(`git status --porcelain -- <보호 경로>`)가 비어 있지 않으면 D5 실패(수행 3의 STACK_SETUP_PLAN 갱신은 그 뒤이므로 검사 대상이 아니다) (c) 스캐폴드 뒤 probe smoke가 `SKIPPED (등록된 소스 루트 부재)`면 D5 배선 실패 (d) HYBRID 입력(프론트만 지정)에서 백엔드 결정 라운드가 열리지 않으면 D4 실패.
6. Rollback path — 본 ADR superseded → 수행 0·6-2-b·R-C·registry 제거, R0 2분기 복원, ADR-052/055/063 참조 갱신 줄 삭제. 생성된 프로젝트 스캐폴드는 프로젝트 소유라 되돌리지 않는다.

## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT. 실제 파일 경로 1행 1개)
- .claude/skills/bootstrap-stack/SKILL.md                 — D2·D3·D4·D7·D8
- .claude/skills/bootstrap-stack/stack-catalog.md         — D1
- .claude/skills/bootstrap-stack/stack-brief-template.md  — D1 행 참조
- .claude/skills/bootstrap-stack/output-checklist.md      — D8
- .claude/skills/stack-guard/SKILL.md                     — D5·D6
- docs/00-meta/_templates/STACK_SETUP_PLAN_TEMPLATE.md    — D2·D5 절
- .claude/skills/plan-workitem/SKILL.md                   — D6 설치 line item 경계
- docs/00-meta/PROJECT_START_CHECKLIST.md                 — 2·3절 문구
- docs/00-meta/GUARDRAILS_STRATEGY.md                     — stack-guard 산출물 범위·유지 주기
- docs/00-meta/STRUCTURE.md                               — 산출물 표·Canonical Owner
- docs/00-meta/DELEGATION_STRATEGY.md                     — Mid-project T3 행 갱신

## 참고
- ADR-052(install-ownership 3분할 → 4분할), ADR-055(T1/T2/T3·입력 적응형), ADR-063(probe·재실행 계약), ADR-060 D9(authority 배정 기준), ADR-051#amend-4(Dependency Tools), ADR-040#amend-1, ADR-047 D3, ADR-022.
```

### P2-3. `.claude/skills/bootstrap-stack/SKILL.md`
- (a) 첫 문단 `정책 SSOT는 ADR-055(입력 적응형 흐름·taxonomy) + ADR-041 D2(--migrate contract).` → `정책 SSOT는 ADR-055(입력 적응형 흐름·taxonomy) + ADR-071(카탈로그·disposition·HYBRID 라우팅) + ADR-041 D2(--migrate contract).`
- (b) R0 2 분기 현재: `- **구체적 스택 감지** — … → **BASE 문서화 흐름**.` 과 `- **비어 있음/모호/불확실** … → **DEEP 결정 흐름**.`
  변경: 셋으로 교체.
  ```
  - **BASE** — 프레임워크/언어/런타임 토큰이 있고 **`stack-catalog.md`의 해당 유형 T1 행이 모두 입력에서 결정됨**(또는 brownfield manifest에서 감지됨) → `## BASE 문서화 흐름` + `## R-C 카탈로그 라운드`(T2/T3 미결정 행만).
  - **HYBRID** — 프레임워크 토큰은 있으나 T1 행에 미결정이 남음(예: "Next.js"만 주고 백엔드·DB 미정) → `## DEEP 결정 흐름`의 R1~R2를 **미결정 T1 행에 한정**해 실행 → R-C → R4 저장. (ADR-071 D4)
  - **DEEP** — 해석 가능한 프레임워크 토큰이 없거나 불확실 마커("추천"·"골라줘") → `## DEEP 결정 흐름` 전체.
  ```
- (c) 가드 `- **오라우팅 방지** — 프레임워크 토큰이 하나라도 있으면 BASE로 가되, 산출이 §7에 미달(…)이면 "추천을 원하면 스택 없이 재실행" 1줄만 echo — 몰래 라운드로 승격하지 않는다.` → 삭제하고 다음으로 교체: `- **오라우팅 방지** — 토큰이 있는데 T1 미결정이 남으면 HYBRID다. 사용자가 명시적으로 "나머지는 나중에"라고 하면 그 행들을 registry `이관`(사유 + 회수 시점)으로 적고 BASE로 간다. 조용히 건너뛰지 않는다.`
- (d) `반드시 먼저 읽을 파일`에 `- `stack-catalog.md`` 추가.
- (e) `## BASE 문서화 흐름` 4번(STACK_SETUP_PLAN) 현재: `4. 필요하면 `docs/00-meta/_templates/STACK_SETUP_PLAN_TEMPLATE.md`를 복사해 … 생성(이미 있으면 갱신 제안).` → `4. `docs/00-meta/_templates/STACK_SETUP_PLAN_TEMPLATE.md`를 복사해 `docs/00-meta/STACK_SETUP_PLAN.md`를 **항상** 생성·갱신한다(ADR-071 D8 — 선택 산출물 아님).` 나머지 문장 유지. 같은 항목 끝에 추가:
  ```
   - **Stack Decision Registry 기록 (ADR-071 D2)**: `stack-catalog.md`의 해당 유형 행 전부를 `## Stack Decision Registry`에 한 행씩 적고 disposition(`확정 | 해당 없음 | 이관 | 미결정`)·authority·정본 앵커·확인일을 채운다. **빈 행이 남으면 성공 종료하지 않는다.** 결정 본문은 앵커(ARCH `## 7-N`·ADR-101)에만 적는다 — registry는 색인이다.
  ```
- (f) `## --migrate (T2) 흐름` 앞에 새 절 삽입:
  ```
  ## R-C — 카탈로그 라운드 (BASE·HYBRID·DEEP R4 공통, ADR-071)
  1. `stack-catalog.md`에서 프로젝트 유형(들)의 행을 회수한다 — 유형은 ADR-071 D4 판별 규칙(활성 ARCH sub-section·workspace·Supabase 신호, 애매하면 사용자 확인 1회)으로 정하고 monorepo·풀스택은 해당 유형 전부.
  2. 이미 결정된 행(입력·brownfield 감지·DEEP R2 결론)은 `확정`으로 registry에 적는다.
  3. 나머지 행을 authority로 나눈다 — `user-approval` 행은 Decision Brief 6블록으로 **라운드당 3~5개씩** 제시(ADR-060 D3, `skip` 불허 — 선택/설명/리서치/`이관` 중 택1). `agent-delegated` 행은 architect 단발 sub-call이 기본 후보와 근거를 정하고 **라운드 끝 일괄 확인 1회**로 제시한다. 사용자가 뒤집은 행은 `user-approval`로 원장에 등재한다.
  4. 새로 정하거나 불확실한 행만 researcher 단발 sub-call로 현재 메이저·호환·발행일을 확인해 `확인일`에 적는다(ADR-071 D7). 기존 실측 스택은 재조사하지 않는다.
  5. 사용자가 지금 정하지 않겠다는 행은 `이관`(사유 + 회수 시점 — 보통 `M1 plan-milestone R1`)으로 적고 **DECISION_REGISTER에 `deferred`**(무영향 근거·이관 앵커 = registry 행·회수 시점)로 등재한다(ADR-060 D4 3필드 — plan-milestone R1이 회수). 정해야 하는데 못 정한 행은 `미결정` + DECISION_REGISTER `open`(`영향: (미할당)`)으로 적는다.
  6. 결정 본문은 정본 앵커에 쓴다: 7-x 소항목 → ARCH `## 7-N`, 스택·주요 라이브러리 → ADR-101 `## 결정` 표, 운영 사실 → ARCH `## 7` 하위, 설치 시점·PM → STACK_SETUP_PLAN.
  7. 종료 조건: registry에 빈 행 0.
  ```
- (g) 마지막 출력에 추가: `- **registry 요약**: 확정 N / 해당 없음 M / 이관 K(회수 시점 목록) / 미결정 J(0이어야 정상 종료)`.
- (h) `## 스택별 디폴트 디렉터리 구조` 표 위에 한 줄: `스캐폴드 생성은 `/stack-guard` 수행 0이 수행한다(ADR-071 D5). 본 표는 생성기 옵션·`## 3-1` 기록의 기준이다.`

### P2-4. `stack-brief-template.md`
- `## 추가 요구사항` 뒤에 절 추가:
  ```
  ## 카탈로그 행 (선택 — 아는 것만)
  [`stack-catalog.md`의 id로 이미 정한 항목을 적는다(ADR-071 D1). 예: `cat-web-ui-kit: shadcn/ui`, `cat-web-ui-preview: Storybook`, `cat-common-error-reporting: 이관(M1 이후)`. 적지 않은 행은 R-C 라운드에서 묻는다.]
  ```

### P2-5. `output-checklist.md`
- `## 선택 생성 문서` 절을 삭제하고 `## 필수 갱신 문서`에 `- `docs/00-meta/STACK_SETUP_PLAN.md` (`## Stack Decision Registry` 빈 행 0 — ADR-071 D2·D8)` 추가.
- 현재: `근거: 본 보일러플레이트는 *Living Doc* 패턴 정합 — 운영 기술 사실은 fork 직후 곧장 검증되는 surface로 박힌다. ADR-027 인터페이스 결정 책임 분배는 변경 없음 (체크리스트가 ARCHITECTURE_OVERVIEW `## 7-X` 갱신을 *권장* 만 한다 — 자동 작성 X).` → `근거: 본 보일러플레이트는 *Living Doc* 패턴 정합 — 운영 기술 사실은 fork 직후 곧장 검증되는 surface로 박힌다. 7-x 자리 배분은 ADR-027, 소항목 authority는 ADR-060 D9, 카탈로그 행의 disposition은 ADR-071 D2가 소유한다.` (전방 참조 없음 — 이 줄의 `ADR-027`은 Phase 6 P6-5가 `ADR-073 D1`로 재지정한다.)

### P2-6. `docs/00-meta/_templates/STACK_SETUP_PLAN_TEMPLATE.md`
`## Dependency Tools` 앞에 두 절 삽입:
```markdown
## Stack Decision Registry
<!-- 스택 결정 카탈로그(.claude/skills/bootstrap-stack/stack-catalog.md)의 해당 유형 행 전부를 한 행씩 적는다(ADR-071 D2).
     이 표는 색인이다 — 결정 본문은 정본 앵커(ARCH ## 7-N / ADR-101 / 본 파일 다른 절)에만 있다.
     disposition: 확정(앵커 필수) / 해당 없음(사유) / 이관(사유 + 회수 시점) / 미결정(원장 open 등재).
     빈 행이 남으면 /bootstrap-stack은 성공 종료하지 않는다. /stack-guard 6-2-b는 `설치: baseline` 행 중 확정만 설치한다. -->
| id | 항목 | disposition | authority | 정본 앵커 | 확인일 |
|---|---|---|---|---|---|
| (예: cat-web-framework) | 프레임워크 | 확정 | user-approval | ADR-101 ## 결정 | 2026-09-11 |
| (예: cat-web-ui-preview) | UI 미리보기 도구 | 확정 (Storybook) | agent-delegated | ARCH ## 7-4 | 2026-09-11 |
| (예: cat-common-error-reporting) | 에러 리포팅 | 이관 — 사유: 배포 전 불요 / 회수: M2 plan-milestone R1 | agent-delegated | — | |

## Scaffold
<!-- /stack-guard 수행 0이 green-field scope마다 공식 생성기로 뼈대를 만든 뒤 기록한다(ADR-071 D5). 검증 진입점(수행 1)보다 먼저다.
     brownfield·부분 초기화 scope는 `skipped (<사유>)`. harness 파일은 절대 덮어쓰지 않는다(복사 직후 보호 경로 검사). -->
| scope | status | 생성기·버전 | 옵션 | 생성 파일 수 | 제외·충돌 | 실행일 |
|---|---|---|---|---|---|---|
| (예: `.`) | done | (예: `create-next-app@15.x`) | (예: `--ts --tailwind --app --src-dir`) | | (예: `.gitignore` 줄 병합 12줄 / 충돌 0) | |
| (예: `apps/mobile`) | done | `flutter create` | (예: `--platforms android,ios --org com.example`) | | | |
| (예: `apps/api`) | skipped (brownfield — 소스 루트 존재) | | | | | |
```

### P2-7. `.claude/skills/stack-guard/SKILL.md`
- (a) 첫 문단 `이 skill의 1단계 범위:` 목록에 첫 항목으로 추가: `- green-field 스캐폴드(공식 생성기 1종, harness 파일 미덮어쓰기) + 카탈로그 `설치: baseline` 행의 기초 라이브러리 설치 — 그 뒤에 probe·boot smoke·design gate·CI를 실제 코드 위에서 실측한다(ADR-071 D5·D6).`
- (b) `반드시 먼저 읽을 파일`에 `- `docs/00-meta/STACK_SETUP_PLAN.md ## Stack Decision Registry`(수행 0·6-2-b 입력)` 추가.
- (c) 수행 1(`1. `package.json`/`pyproject.toml`/`Makefile`/`Taskfile.yaml` 중 스택에 자연스러운 곳에 `validate` 진입점을 만든다.`) **앞**에 새 단계 «0»을 삽입한다(검증 진입점보다 먼저 — 생성기 manifest가 원본이 되도록. 6 안에 넣지 않는다):
  ```
   0. **스캐폴드 (green-field scope 한정 — ADR-071 D5)**: scope(registry `cat-common-repo-layout`)마다 «등록 소스 루트 0 **그리고** 프레임워크 manifest 부재»면 아래를 수행하고, 아니면 `## Scaffold`에 `skipped (<사유>)`를 적고 다음 scope로. 전 scope 처리 후 수행 1로 간다.
     1. 생성기 = 그 scope 유형의 `cat-<유형>-framework` 확정 행의 공식 생성기 1종(없으면 최소 골격 — 소스 루트 1 + 테스트 루트 1 + manifest, `generator: minimal`). 옵션은 registry `확정` 행에서 도출(언어·PM·스타일링·라우팅·src 디렉터리·테스트 도구). 도출 불가 옵션은 생성기 기본값 + 출력에 명시.
     2. **임시 디렉터리에 생성**한 뒤 scope 디렉터리로 복사한다. 아래는 **절대 덮어쓰지 않는다**: `README.md` `README_ko.md` `LICENSE` `AGENTS.md` `CLAUDE.md` `docs/**` `.claude/**` `.codex/**` `.agents/**` `.boilerplate/**` `.github/**`. `.gitignore`는 줄 단위 합집합(저장소 기존 줄 우선, 중복 제거). 그 외 충돌 파일은 덮어쓰지 않고 `Scaffold conflict: <경로>` 출력 + 사용자 결정.
     2-1. **보호 경로 검사**: `git status --porcelain -- README.md README_ko.md LICENSE AGENTS.md CLAUDE.md docs .claude .codex .agents .boilerplate .github`가 비어 있어야 한다. 아니면 `Scaffold protected-path violation: <경로>` 출력 + 종료(되돌리기는 사용자 결정 — 자동 checkout 금지).
     3. 생성기가 만든 `README`류·예제 페이지는 그대로 둔다(정리는 M1 계획 소관). 생성기가 만든 `.git`은 버린다.
     4. `## Scaffold`에 scope별 1행(scope·status·생성기·버전·옵션·생성 파일 수·제외·충돌·실행일)을 적는다. 생성 파일 전량은 `git status --porcelain`으로 보여 준다(문서 복사 금지).
     5. **커밋하지 않는다.** 출력에 `권장 커밋: chore(scaffold): initialize <framework> project skeleton` 한 줄.
     6. Dart/Flutter면 수행 0 직후 `## Dart Source Roots`를 실측 갱신한다(생성기가 `lib/`·`test/`를 만들었으므로).
     7. 이 뒤 수행 1은 생성기 manifest의 `scripts`에 `validate*` 키를 **추가**한다(기존 키·의존 보존 — 덮어쓰기 금지). 도입부의 «Flutter는 `package.json`이 없으면 최소 형태로 생성» 규칙은 그 scope에 `pubspec.yaml`만 있고 `package.json`이 없을 때만 적용된다.
  ```
- (d) 6-2-1 뒤(6-3 앞)에 삽입:
  ```
   - **6-2-b. 기초 라이브러리 baseline 설치 (ADR-071 D6)**: registry에서 `disposition: 확정` **그리고** 카탈로그 `설치: baseline`인 행의 패키지를 6-2와 같은 PM으로 설치한다(UI 킷·스타일링·아이콘·UI 미리보기 도구·계측 SDK 등 — 폰트 제외). 버전은 registry `확인일`의 researcher 고정값. `설치: task` 행은 설치하지 않는다(plan-workitem → implement). 설치 실패는 6-5 `Needs Install` fallback.
     - **Storybook (웹 UI + registry `cat-web-ui-preview` = Storybook)**: 프레임워크 공식 통합으로 설치하고 애드온은 `a11y`·`viewport`만 둔다. `package.json`에 `storybook`·`build-storybook` 스크립트가 없으면 추가한다. 정적 빌드 출력 `design-gate-storybook/`이 `.gitignore`에 없으면 추가한다(보일러플레이트 기본 `.gitignore`에는 P5-19가 넣는다 — design gate v3가 이 경로에 빌드해 서빙; Phase 5 P5-6에서 ADR-072 D6 인용을 더한다). Flutter는 미리보기 도구를 설치하지 않는다.
     - **폰트 패키지·파일은 설치하지 않는다** — DESIGN `## 3` 확정 뒤 `/bootstrap-design` R6가 추가한다(ADR-071 D6 예외).
     - 설치 결과를 출력에 `baseline libs: <패키지 목록> (installed | Needs Install)`로 낸다.
  ```
- (e) 5-a 현재: `- **등록된 소스/테스트 루트가 아직 없으면**(프레임워크 스캐폴드 전 — 정상 lifecycle 에서 본 skill 이 도는 시점의 기본 상태다) probe 를 둘 자리가 없으므로 …` → `- **등록된 소스/테스트 루트가 아직 없으면**(수행 0 스캐폴드가 `skipped`인 brownfield·부분 초기화 상태 — green-field는 수행 0이 먼저 만들므로 정상 경로에서는 발생하지 않는다, ADR-071 D5) probe 를 둘 자리가 없으므로 …` 나머지 유지.
- (f) `## 재실행 계약` 표에 두 행 추가:
  ```
  | `## Scaffold` (수행 0) | `status: done`이면 **재실행하지 않는다**. `skipped`인데 이후 소스 루트가 생겼으면 그대로 `skipped` 유지(brownfield 승격) |
  | 6-2-b baseline 라이브러리 | registry 확정 행 중 **미설치분만** 설치. registry가 바뀌어 새 확정 행이 생기면 그것만 |
  ```
- (g) 마지막 출력에 `- 스캐폴드 결과 (`done <생성기>` / `skipped <사유>`) + 권장 커밋 메시지` · `- baseline libs 설치 결과`를 추가.
- (h) `**설치-소유 경계 주의(SSOT)**` 불릿 현재: `본 step 이 까는 것은 *toolchain + e2e 의존*(…)뿐이다.` → `본 step 이 까는 것은 *toolchain + e2e 의존* + **카탈로그 `설치: baseline` 확정 행**(6-2-b)이다. *task 단위 런타임/기능 패키지*(…)는 plan-workitem 이 authoring → implement-workitem 이 설치한다(ADR-040#amend-1). 경계 결정은 ADR-052(3분할) + ADR-071(baseline 라이브러리·스캐폴드 4번째 class).` `## 스택별 verify 풀세트` 절 끝의 `- **설치 범위 경계(SSOT)**: stack-guard 가 까는 것은 *toolchain + e2e 의존* 뿐이다.` 불릿도 같은 취지로 갱신.

### P2-8. `.claude/skills/plan-workitem/SKILL.md`
- `### Stack-decision tier 라우팅 (ADR-055)` 절 끝에 한 줄 추가: `- **baseline 설치분 제외 (ADR-071 D6)**: `STACK_SETUP_PLAN.md ## Stack Decision Registry`에서 `확정` + 카탈로그 `설치: baseline`인 패키지는 `/stack-guard`가 이미 설치했으므로 task `## 3` install line item으로 다시 만들지 않는다(registry를 먼저 읽는다).`

### P2-9. `docs/00-meta/PROJECT_START_CHECKLIST.md`
- `## 2. 운영 결정 (스택 확정)` 목록 끝에: `- [ ] (선택) `stack-catalog.md`의 id로 이미 정한 항목을 적어 두었다 — 나머지는 `/bootstrap-stack`의 R-C 라운드가 묻는다 (ADR-071)`
- `## 3` stack-guard 항목 현재: `- [ ] `STACK_SETUP_PLAN.md`를 검토한 뒤 `/stack-guard`를 실행해 통합 `validate` 진입점·verify 스크립트를 생성했다. UI 판정이면 `## Design Gate Adapter`가 current `ADR-058#amend-2/v2` + source digest(direct-support Node UI는 canonical)의 `ready`이고 fixed conformance를 통과했는지 확인했다`
  → `- [ ] `STACK_SETUP_PLAN.md`(`## Stack Decision Registry` 빈 행 0)를 검토한 뒤 `/stack-guard`를 실행했다 — green-field면 스캐폴드·기초 라이브러리가 설치되고(`## Scaffold`), 통합 `validate`·verify 스크립트가 생성되며, UI 판정이면 `## Design Gate Adapter`가 `ready (self-test PASS <날짜>)`다 (ADR-071·ADR-072). 권장 커밋 메시지로 스캐폴드를 커밋했다`
- `- [ ] (선택) 프레임워크 스캐폴드를 이미 돌렸다면 … (ADR-063 D3·D4)` 항목 → `- [ ] (brownfield) 이미 소스가 있는 저장소면 `/stack-guard`가 스캐폴드를 건너뛰고(`## Scaffold` `skipped`) 기존 코드 위에서 probe를 실측한다. 소스 루트가 없는데 `skipped`면 `## Stack Decision Registry`의 프레임워크 행을 확인한다 (ADR-071 D5)`

### P2-10. `docs/00-meta/GUARDRAILS_STRATEGY.md`
- `## /stack-guard 1단계 산출물 범위` 목록 첫 항목으로: `- (green-field) 공식 생성기 스캐폴드 + 카탈로그 `설치: baseline` 확정 행의 기초 라이브러리 설치. harness 파일은 덮어쓰지 않는다 (ADR-071 D5·D6).`
- 유지 주기 표 첫 행 `| 스택 확정 직후 1회 | `validate` 생성 + probe 실측 검증 | `/stack-guard` |` → `| 스택 확정 직후 1회 | (green-field) 스캐폴드·기초 라이브러리 설치 → `validate` 생성 + probe 실측 검증 + design gate 자가 검사 | `/stack-guard` |`

### P2-11. `docs/00-meta/STRUCTURE.md`
- 산출물 표에 행 추가(`stack setup plan` 행 근처):
  ```
  | 스택 결정 카탈로그 | `.claude/skills/bootstrap-stack/stack-catalog.md` | 수동 (boilerplate 제공 — ADR-071 D1) | Reference | baseline |
  | 스택 결정 registry | `STACK_SETUP_PLAN.md ## Stack Decision Registry` | `/bootstrap-stack` (R-C, 빈 행 0) | Reference | generated |
  | 스캐폴드 기록 | `STACK_SETUP_PLAN.md ## Scaffold` | `/stack-guard` 수행 0 (ADR-071 D5) | Record | generated |
  ```
- Canonical Owner 표(2열 `사실 | Canonical Owner`)에 행: `| 스택 결정 색인(disposition·앵커) | `STACK_SETUP_PLAN.md ## Stack Decision Registry` — 결정 본문은 ARCH `## 7-N`·ADR-101에만(색인은 제2 SSOT 아님, ADR-071 D1) |`

### P2-12. `docs/00-meta/DELEGATION_STRATEGY.md`
- `## Mid-project 문서 갱신 동선` 표의 T3 라이브러리 행 끝에 `— registry `설치: baseline` 확정분은 `/stack-guard`가 이미 설치(ADR-071 D6)` 부기.

### P2-13. 참조 갱신 줄
- `ADR-052` `## 현재 유효 결정` 끝: `> 참조 갱신 (2026-09): D1의 install-ownership 3분할에 [ADR-071](ADR-071-stack-decision-catalog-and-scaffold.md) D5·D6이 네 번째 class(스캐폴드 + 카탈로그 baseline 라이브러리)를 더한다. 본 표기는 개정이 아니라 참조 갱신이다.`
- `ADR-055` `## 결정` 1 뒤: `> 참조 갱신 (2026-09): BASE/DEEP 2분기는 [ADR-071](ADR-071-stack-decision-catalog-and-scaffold.md) D4가 BASE/HYBRID/DEEP 3분기로 확장한다. 카탈로그·disposition은 ADR-071 D1·D2.`
- `ADR-063` D1의 `소스 루트를 새로 만들지 않는다 — 소스 트리 구조는 스캐폴드·계획의 소관이다.` 문장 뒤: `(참조 갱신 2026-09: green-field 스캐폴드는 [ADR-071](ADR-071-stack-decision-catalog-and-scaffold.md) D5가 `/stack-guard` 수행 0으로 소유한다 — probe는 그 뒤에 돌며 여전히 루트를 만들지 않는다.)`
- `ADR-060` D9 표 아래: `> 참조 갱신 (2026-09): 패키지·provider 수준 항목과 슬롯 없는 항목의 authority 기본값은 [ADR-071](ADR-071-stack-decision-catalog-and-scaffold.md) D3(카탈로그 열)이 배정한다. 본 표의 7-x 정책 수준 배정은 불변이다.`

### P2-14. 커밋
```
docs(adr): add ADR-071 stack decision catalog and scaffold ownership
feat(skills): add stack catalog round, decision registry and stack-guard scaffold step
```


---

## Phase 3. builder 속도 실험 (ADR-004#amend-4)

목표: builder만 `maxTurns: 45`·`effort: medium`으로 바꾸고, 대조군을 둔 실험으로 확장 여부를 정한다. 판단 역할(architect·designer·reviewer 등)은 손대지 않는다.

### P3-1. `docs/90-decisions/boilerplate/ADR-004-model-alias-policy.md` — `## Amendment 4` 추가
파일 끝에 append:
```markdown
<a id="adr-004-amend-4"></a>
## Amendment 4 (2026-09-11) — agent frontmatter `effort` 허용 + builder 실험

### 배경
- [관측됨] 보조 AI(sub-agent)가 메인 세션의 추론 깊이를 그대로 물려받아, 이미 문서로 결정된 slice를 구현하는 builder가 과도하게 오래 생각한다(사용자 fork 보고 — 중간 중단 다수, SIMULATION_RUN Round 4 INST-1~5).
- [외부실증] Claude Code sub-agent frontmatter는 `effort: low|medium|high|xhigh|max`를 지원하며 세션 effort를 덮는다. 단 환경변수 `CLAUDE_CODE_EFFORT_LEVEL`이 설정돼 있으면 그것이 우선한다. `maxTurns`는 행동 횟수 상한이며 속도를 높이지 않는다(부분 출력 마커만 남긴다).
- [관측됨] 이 저장소의 sub-agent 13개는 `model:`만 고정하고 `effort:`는 어디에도 없다. Codex는 `.claude/agents/*.md`를 읽지 않으므로(persona 매핑 없음 — ADR-010) 이 키는 Codex 경로에 영향이 없다.

### 결정
1. **`effort`는 역할별 고정 대상이다** — 별칭(`model:`)과 같은 자리(`.claude/agents/<name>.md` frontmatter)에서만 쓴다. shared 설정 파일(`.claude/settings.json`)에는 여전히 두지 않는다(#amend-2·#amend-3 불변). 값은 `low|medium|high|xhigh|max` 중 하나이며 버전 고정이 아니므로 본 정책의 «비고정» 원칙과 충돌하지 않는다.
2. **1차 적용은 builder만**: `maxTurns: 20 → 45`, `effort: medium` 추가. 근거 — builder는 «이미 문서화된 결정을 집행»하는 역할이라 깊이보다 완주가 중요하다. 판단 역할(architect·designer·reviewer·qa·validator·planner·researcher·자문 5종)은 변경하지 않는다.
3. **실험 설계(ADR-047#amend-1 — 대조군)**: Round 11 dogfood의 같은 task 1개를 네 조건으로 돌린다 — (a) 현재(20·effort 없음) (b) effort만(20·medium) (c) 턴만(45·effort 없음) (d) 둘 다(45·medium). 측정: 소요 시간, 완료율(AC 충족), foreman 회수 턴, `validate` 실패 수, Red 관측 보고 누락. 결과를 SIMULATION_RUN `## Builder Effort Experiment`에 기록한다.
4. **확장 규칙**: (d)가 (a) 대비 완료율·검증 실패에서 저하 없이 시간이 줄면 validator·qa에 `effort: medium`을 다음 라운드 후보로 올린다(별도 amendment). 저하가 있으면 builder의 `effort`를 제거하고 `maxTurns`만 유지한다.
5. **사용자 환경 안내**: 메인 세션은 사용자 계층에서 `high` 이상을 권장하고, `CLAUDE_CODE_EFFORT_LEVEL`을 전역 환경변수로 두지 않는다(두면 agent `effort`가 무력화된다). 이 안내는 DELEGATION_STRATEGY `## 모델 표기 정책`에 둔다.
6. **Codex parity**: 본 저장소는 Claude persona 위임을 Codex subagent로 매핑하지 않아 builder가 메인 인라인으로 돈다(ADR-010). 따라서 본 실험은 Codex 경로에 적용하지 않으며, Codex 쪽 추론 강도는 `.codex/config.toml`의 비지정 정책(ADR-010#amend-6)을 그대로 둔다. Codex subagent별 effort 지원 여부는 매핑을 도입할 때 확인한다.

### 적용 surface
- `.claude/agents/builder.md` — frontmatter
- `docs/00-meta/DELEGATION_STRATEGY.md` `## 모델 표기 정책`
- `.boilerplate/validation/SIMULATION_RUN.md` — 실험 기록
- `docs/90-decisions/boilerplate/README.md` 인덱스 행

### 강도 (ADR-022)
- enabling(약, [관측됨]+[외부실증]) — 1개 agent 한정 + 대조군 실험. 확장은 실측 후.

### Mutation delta (ADR-047 D3)
- failure = builder가 slice 중간에 턴 소진으로 멈추거나 과도한 추론으로 지연 / falsifier = (d)에서 완료율·검증 실패가 (a)보다 나쁨 / rollback = frontmatter 두 줄 원복.
```

### P3-2. `.claude/agents/builder.md` frontmatter
- 현재:
  ```
  model: sonnet
  maxTurns: 20
  ```
- 변경:
  ```
  model: sonnet
  effort: medium
  maxTurns: 45
  ```
  적용 전에 현재 Claude Code 공식 문서(sub-agent frontmatter)로 `effort` 키 지원을 **재확인**한다(2026-09-11 확인분). 미지원이면 `effort:` 줄을 넣지 않고 `maxTurns: 45`만 적용하며, 그 사실을 ADR-004#amend-4 배경에 한 줄 적고 실험 조건 (b)(d)는 건너뛴다.
  본문 `- 턴이 부족하거나 범위가 예상보다 크면, …` 문장은 유지. 그 앞에 한 줄 추가: `- 너는 이미 문서로 결정된 slice를 집행한다. 설계를 다시 고민하지 말고 slice 명세·AC·참조 문서대로 구현한다. 불확실하면 `Needs Plan Decision`·`Needs Research`로 멈추는 것이 깊이 고민하는 것보다 낫다(ADR-004#amend-4).`

### P3-3. `docs/00-meta/DELEGATION_STRATEGY.md` `## 모델 표기 정책`
- `별칭(`sonnet`, `opus`, `haiku`)은 역할별 고정이 필요한 …` 줄 뒤에 추가:
  ```
  추론 강도 `effort:`도 같은 자리(agent frontmatter)에서만 역할별로 고정한다 — 현재 builder만 `medium`(ADR-004#amend-4). 메인 세션은 사용자 계층에서 `high` 이상을 권장하며, `CLAUDE_CODE_EFFORT_LEVEL` 환경변수를 전역에 두면 agent `effort`가 무력화되므로 두지 않는다.
  ```

### P3-4. `docs/90-decisions/boilerplate/README.md` 004 행
- Amendments 칸에 `, +#amend-4: agent frontmatter effort 허용 + builder 실험` 추가.

### P3-4b. `.boilerplate/validation/SIMULATION_RUN.md` 실험 절 stub
- 파일 끝에 `## Builder Effort Experiment (ADR-004#amend-4)` 헤딩과 한 줄 `- 상태: Round 11에서 측정 예정(P7-2 8번) — 조건 (a)~(d) 결과 표는 그때 채운다.`를 append한다(적용 surface 역참조가 Phase 7 검사 전에 실재하도록). P7-4가 이 절을 채운다.

### P3-5. 커밋
```
feat(agents): set builder effort medium and turn budget 45 per ADR-004 amend-4
```

---

## Phase 4. DESIGN.md 내용 계약 v2 (ADR-073) + 디자인 워크플로우 v2 (ADR-058#amend-4)

목표: (1) ADR-027을 ADR-073으로 통합 재발행하며 프로필(웹+앱)·폰트 블록·언어별 UX writing·§9 예외 근거·기준 자료 절을 넣는다. (2) `/bootstrap-design`에 레퍼런스 갤러리 절차(4층 소스 + 큐레이션 라운드)와 R6 네이티브 테마 쇼케이스를 넣는다. (3) researcher·designer·reviewer의 역할을 맞춘다.

### P4-1. ADR-073 작성 — `docs/90-decisions/boilerplate/ADR-073-interface-and-design-content-v2.md`

ADR-027의 살아 있는 결정을 전부 흡수해 **클린 본문**으로 다시 쓴다. 아래 D-번호는 부록 A의 앵커 매핑이 참조하므로 바꾸지 않는다.

```markdown
# ADR-073 — 인터페이스 결정 책임 분배 + DESIGN.md 내용 계약 v2

> scope: boilerplate
> area: design

## Status
accepted

> 대체: [ADR-027](ADR-027-interface-decision-allocation.md)을 통합 재발행으로 supersede한다(개정 8개 + surface 5+ 도달 — ADR-045 D6·ADR-027#amend-8 예고). ADR-027은 `superseded`로 history 잔존. 디자인 워크플로우(라운드·리서치·게이트·시안 카드) SSOT는 [ADR-058](ADR-058-design-workflow.md), 화면 프로토타입·UI 제작 계약은 [ADR-072](ADR-072-design-milestone-and-code-prototype.md)가 소유한다. 본 ADR은 **DESIGN.md 내용 + ARCH 7-x 인터페이스 할당 + cross-surface enforcement + UI 판정 절차**만 소유한다.

## 현재 유효 결정
- (본문 D1~D13이 net 규칙이다 — 개정 없음. 개정이 4개에 이르면 이 절을 요약으로 채운다.)

## 배경
- [외부실증] LLM은 시각 결정 입력이 없으면 median 미감으로 수렴한다(prg.sh purple gradient). 명시적 결정 자리가 없으면 매 task 즉흥 결정한다. (ADR-027 배경 승계)
- [관측됨] DESIGN.md에 플랫폼 축이 없어 웹+앱 프로젝트가 한 파일로 두 표면을 기술할 수 없고, 폰트는 «1~2 family» 한 줄뿐이며, §10은 한국어 기본값 하나로 언어별 규칙·서비스 전체 일관성 규칙이 없다(사용자 fork 보고).
- [관측됨] §9 glassmorphism 금칙의 예외가 «브랜드 근거»뿐이라 플랫폼 관례(예: iOS 26 Liquid Glass)를 따르는 앱이 근거 없이 위반으로 잡힌다.
- [관측됨] DESIGN 근거 자료(Google design.md spec, DTCG, Material 3, HIG, WCAG)의 확인일이 어디에도 없어 «최신인가»를 판단할 수 없다.
- ADR-027 개정 8개 누적 + 본 라운드가 surface 5+를 추가하므로 통합 재발행한다(ADR-045 D6).

## 결정

### D1. 자리 배분 (ADR-027 결정 1·2·4·8·9·15 + #amend-8 승계)
- 시각·문구 결정은 `docs/20-system/DESIGN.md`(UI 한정). 인터페이스 결정은 `ARCHITECTURE_OVERVIEW.md ## 7-1`(API)·`## 7-2`(CLI)·`## 7-3`(백엔드)·`## 7-4`(프론트)·`## 7-5`(모바일). `/bootstrap-stack`이 7-1~7-5를 채우고 비해당 sub-section은 통째 삭제한다(모바일은 7-5, 웹 화면이 함께 있을 때만 7-4 병존). 7-x 소항목의 authority는 ADR-060 D9, 카탈로그 행은 ADR-071 D3.
- 운영성 ↔ 7-1 경계: trace ID·log 포맷·관측 stack = 운영성 / 응답 envelope·error 레지스트리·네이밍 = 7-1.
- repo root `DESIGN.md`를 두지 않는다. ARCHITECTURE 섹션 비대화는 «있을 때만 채움»으로 수용한다.

### D2. DESIGN.md 섹션 구성
Stitch canonical 8섹션(Overview / Colors / Typography / Layout / Elevation & Depth / Shapes / Components / Do's and Don'ts) + 확장 3개: `## 8. Motion`(Components와 Do's 사이), `## 10. Voice & Writing`(Do's 뒤), `## 11. 기준 자료`(맨 끝). lint의 section-ordering은 canonical 상대 순서만 보므로 확장은 비위반이며 재번호하지 않는다. 토큰은 3-tier DTCG(primitive → semantic → component), fenced yaml 또는 frontmatter.
- `## 0. Status` 아래에 **표면→프로필 매핑표**를 둔다(D3).
- `## 1 Overview`: 원칙 3~5개 + 긍정적 정체성(design thesis / signature mechanism / imagery·icon / contextual density) + `[디자인 리서치](DESIGN_RESEARCH.md)` 링크 + `선택 concept:` 한 줄 + **§9 예외 근거(있으면)**.
- **절별 내용 계약(ADR-027#amend-7 승계 — 규칙 텍스트는 DESIGN.md 각 절 주석이 소유)**: §1 긍정적 정체성(thesis·signature·imagery·density) / §3 tabular figures + 폰트 블록(D4) / §4 responsive invariant(content order·container transition·table strategy·sticky occlusion·320 reflow·text fit·essential-2D exception) / §7 category state(interactive: default·hover·active·focus-visible·disabled[+loading] / data·screen: default·loading·empty·error·success / static: 없음, 역할별 semantic 상태 추가) / §8 semantic motion 5항목(목적·빈도·실행·접근성·금지 + Material 3 시작 default) / §9 D5 / §10 D6 / §11 D7.

### D3. 디자인 프로필 (웹 + 앱 한 파일)
- `## 0`의 매핑표: `| surface | profile | platform | 기준 뷰포트 | 공유 모드 |`. 예: `admin | admin-web | web | 1280×900, 375×812 | 공통+delta` / `customer | consumer-mobile | native/android, native/ios | 390×844, 360×800 | 공통+delta`.
- **공유 모드**는 `/bootstrap-design` R1에서 사용자가 고른다(`authority: user-choice`): `대부분 공통`(프로필 delta 최소) / `공통+delta` / `독립`(프로필별 전 절). 원장 등재 + `## 0` 앵커.
- 프로필별 차이는 §2~§10 각 절 안에 `### profile: <name>` 하위 블록으로 **delta만** 적는다. 하위 블록이 없는 절은 전 프로필 공통이다. 단일 프로필 프로젝트는 표 1행 + delta 블록 없음.
- 기준 뷰포트 기본값: 웹 `1280×900`·`375×812`(+ 게이트 넘침 검사 전용 `320×720`), 앱 `390×844`·`360×800`. 태블릿은 범위에 있을 때만 추가. 글자 확대 1.3배 상태는 권장 항목.
- 소비자: design gate 매니페스트(ADR-072 D3 — profile → 뷰포트), design-milestone 화면 배정, stabilize §3-V 스냅샷 크기, e2e target별 진입점(ADR-059#amend-1).

### D4. §3 Typography — 폰트 결정 블록
`## 3`에 아래 항목을 **모두** 채운다(`(해당 없음)` 명시 허용): 조합(display/body/mono) · fallback stack · 라이선스 확인(사용자가 직접 확인, 확인일) · 전달 방식(self-host / CDN / 앱 번들) · weight 세트 · CJK 행간·자간 · 숫자 정렬(tabular-nums — 표·정렬 열 필수) · 로딩 전략(`font-display`·preload / 앱은 번들) · 모바일 번들 크기 상한. **결정은 실제 서비스 문장(charter 시나리오 카피)을 R6 테마 쇼케이스로 렌더해 본 뒤 내린다**(ADR-058#amend-4). 폰트 조합은 `authority: user-choice`(Decision Brief, 추천 블록은 사용자가 요청할 때만).

### D5. §9 Do's and Don'ts (ADR-027 결정 7 · #amend-2 결정 23 · #amend-7 결정 2 승계)
- 기존 규율(5색·raw hex 금지·디폴트 폰트 금지·2축 위계) + WCAG 2.2 a11y(대비 4.5:1/3:1, 포커스 링, 키보드, accessible name, 색-단독 금지, primary CTA 1개, reduced-motion, category state) + anti-slop(보라 gradient·nested cards·gradient heading·glassmorphism/neon·전면 center·획일 grid·icon-tile·monospace 장식·bounce easing·장식 sparkline) + 클래스 레벨 규율(브랜드 근거 없는 유행 fontstack 금지).
- **예외 근거 2종**: 금칙 항목을 채택하려면 `## 1 Overview`에 근거를 적는다 — (a) **브랜드 근거** 또는 (b) **플랫폼 관례**(예: iOS 26 Liquid Glass 머티리얼, Material 3 Expressive 표현). 근거 없는 채택은 위반이다.
- reviewer `[Design-donts]`·`[Design-a11y]`가 미러(ADR-027 #amend-7 결정 7 승계).

### D6. §10 Voice & Writing v2 — 언어별 블록 + 검토 렌즈 + 일관성
- **언어별 하위 블록**: `### 한국어`, `### English`, (추가 언어). 각 블록에 (a) 어조·존댓말·CTA 스타일, (b) 내부용어→사용자 언어 번역표, (c) 금지 표현 — `[grep 가능]` 정규식 / `[LLM-판정]`, (d) 표면별 예시 카피 4종(버튼/에러/빈 상태/확인 다이얼로그), (e) **검토 렌즈**.
- **검토 렌즈(한국어)**: 토스 UX writing 8원칙을 체크 질문으로 — 예상 가능한 힌트 / 잡초 제거 / 빈 문장 지우기 / 핵심 메시지에 집중 / 말하듯 쉽게 / 강요 대신 제안 / 보편적인 단어 / 숨은 감정 찾기 — 각 질문에 «이 카피가 통과하는가»를 designer 자기 점검·reviewer `[Design-voice]`가 본다. **Humanize KR(im-not-ai) A~J 범주는 AI 문체 탐지 렌즈로만** 쓴다(범주 이름만 등재, 변경률 임계값·자동 치환은 UI 문구에 적용하지 않는다 — 문구는 짧아 통계가 성립하지 않는다).
- **검토 렌즈(English)**: sentence case, 능동태, plain language, 명령형 CTA, 약어 최초 전개.
- **서비스 전체 일관성**: 같은 행동은 같은 동사(예: 저장/보관 혼용 금지), 같은 상태는 같은 표현, 같은 대상은 같은 명사 — `### 용어 사전` 표(대상 | 한국어 | English | 금지 동의어)를 §10에 둔다. `/design-milestone` R3 브리프 카피는 이 표를 먼저 읽는다.
- **검토 시점**: 카피는 사용자 승인 **전**에 reviewer `[Design-voice]`가 본다(design-milestone R3 — ADR-072).
- 기본값 채움 + `/bootstrap-design` R1 «채택 or 변경» 1회 확인은 유지. 비-UI 삭제 경로 유지. FEATURE §8-1 copy 톤은 «§10 대비 feature-특이 delta만»(ADR-042#amend-1 승계).

### D7. §11 기준 자료 (확인일 기록)
`## 11. 기준 자료` 표: `| 자료 | 확인일 | 확인한 버전·일자 | 적용 변경점 |`. «최신 갱신» 같은 포괄 문구 대신 확인한 사실만 적는다. baseline 초기 행:
| Google design.md spec (Stitch canonical) | 2026-09-11 | alpha (spec.md) | 섹션 순서·lint |
| W3C DTCG | 2026-09-11 | 2025.10 stable (2025-10-28) | 3-tier 토큰 |
| Material 3 Expressive | 2026-09-11 | 최초 공개 2025-05-13 · I/O 2026 업데이트 세션 존재 | 모션·형태 default 참고 |
| Apple HIG (Liquid Glass) | 2026-09-11 | iOS 26 | §9 플랫폼 관례 예외 근거 |
| WCAG | 2026-09-11 | 2.2 (3.0 draft) | §9 a11y |
| Toss UX writing 8원칙 | 2026-09-11 | 2022-11-15 | §10 한국어 렌즈 |
| Humanize KR (im-not-ai) | 2026-09-11 | v2.3.2 (2026-08) | §10 A~J 렌즈 |
baseline 행의 확인일은 **실제로 확인한 날짜**만 적는다 — 위 값은 2026-09-11 설계 시 확인한 것이며, 실행 시점이 다르면 researcher로 재확인해 확인일을 갱신하고, 확인하지 못한 행은 확인일을 비운다(빈 확인일 = 미확인). `/bootstrap-design --update`와 `/design-milestone` R0가 이 표의 확인일이 12개월을 넘으면 researcher 재확인을 권장한다(자동 갱신 아님).

### D8. cross-surface enforcement (ADR-027#amend-1 결정 16~20 · #amend-6 승계)
- `/plan-workitem` 필수 read-list에 DESIGN.md(UI) + ARCH 7-x(해당 스택); self-check에 «DESIGN `## 7` 인벤토리 외 컴포넌트 신설? raw hex? 7-1 envelope 외 응답? §10 정합?».
- `/validate-plan` Plan Quality `[Plan-design]`(UI) + `[Plan-arch-iface]`(해당 스택).
- `/stabilize-milestone` preflight 5: raw hex grep(웹·Dart) + voice grep + 인벤토리 drift + 7-x Don'ts grep + DESIGN draft 잔존.
- TASK `## 7`·FEATURE `## 11`에 `Design:`·`Architecture-Iface:` 자리.
- design-surface reviewer 입력에 렌더 증거(§3-V 갤러리 + **승인 스냅샷**(ADR-072 D4) + visual-qa 결과) 주입, Read로 열람.

### D9. UI 판정 다중신호 절차 (ADR-027#amend-3 + #amend-8 결정 4 통합)
1. `docs/20-system/DESIGN.md` 부재 → 비-UI 확정.
2. 존재 + `## 0. Status` ≠ `draft` → UI 확정.
3. 존재 + `draft` → 추가 신호: (a) ARCH `## 7-4` **또는** `## 7-5` 활성, (b) 대상 workitem 산하 task `## 7`에 `Design:` 링크 또는 UI 키워드(`component/컴포넌트/page/페이지/screen/view/UI/frontend/프론트/widget/위젯`). 신호 ≥1 → UI 의심(경고 + 활성). 0 → skip.
각 skill은 압축 인라인 3-case를 유지하고 `상세: ADR-073 D9`로 인용한다.
- **UI 마일스톤 판정(ADR-072 소비)**: UI 프로젝트에서 산하 feature 중 하나라도 `## 11` `Design:` 줄이 있으면 UI 마일스톤이다.

### D10. lint 권장 (ADR-027#amend-2 결정 25 승계)
UI + Node 계열에서만 `/stack-guard`가 `@google/design.md lint`를 권장 텍스트로 낸다(강제 X). Motion·Voice·기준 자료 확장 섹션 경고는 무시 가능.

### D11. `--update` 내용 규칙 (ADR-027#amend-4 승계 — 라운드 구조는 ADR-058)
delta 갱신: 미변경 토큰·§1~§11 구조 보존, 전면 재작성 X. 프로필 추가·공유 모드 변경·폰트 교체는 되돌리기 비용이 커 ADR(project) 권장.

### D12. Codex 비대칭 (ADR-027#amend-2 비결정 승계)
`/bootstrap-design` Codex wrapper는 두지 않는다(자연어 호출 — README SSOT, ADR-010#amend-3).

### D13. 비결정 (영구 No — ADR-027 승계)
DESIGN_SYSTEM 광의 SSOT / 영역별 3파일 분리 / UI의 ARCHITECTURE 흡수 / Mobbin·Lazyweb MCP 기본 연결 / taste-skill·image-to-code 기본 편입 / repo root DESIGN.md / 플랫폼별 DESIGN 파일 분리(본 라운드 — 프로필로 대체).

## 외부 근거
- (ADR-027 외부 근거 7종 승계 — Stitch spec, DTCG, designproject.io, Brad Frost, Material 3 motion, prg.sh, Smashing naming)
- [외부실증] Toss — 토스의 UX writing 8원칙 (2022-11-15). Humanize KR v2.3.2 (github epoko77-ai/im-not-ai, 2026-08). Apple HIG Liquid Glass (iOS 26). WCAG 2.2.

## 대안과 제약 (ADR-053)
- 플랫폼별 DESIGN 파일 분리 — 읽기 쉽지만 공통 규칙이 두 파일에서 어긋난다. 기각.
- §10을 별도 VOICE.md로 — 파일 분리 기각(ADR-056 비결정 승계).
- 채택: 단일 파일 + 프로필 delta + 언어별 §10.

## 신뢰도
Medium — 내용 계약 확장의 효과는 design-eval 방법으로 재측정 전 [가설]. a11y·anti-slop은 승계분([외부실증]).

## 재검토 트리거
1. 프로필 delta 블록이 절마다 생겨 «독립» 모드가 사실상 되면 파일 분리 재검토.
2. §10 렌즈가 `[Design-voice]` 오탐을 유의하게 늘리면 LLM-판정분 후퇴.
3. §11 확인일 12개월 초과 자료가 3개 이상이면 researcher 일괄 재확인 라운드.

## 정책 강도 (ADR-022)
- 제약(강, [외부실증]/[관측됨] 승계): D5 a11y grep 가능분·anti-slop, D8 `[Plan-design]`·`[Plan-arch-iface]`·preflight 5.
- enabling(약): D3 프로필, D4 폰트 블록, D6 렌즈·용어 사전, D7 기준 자료.

## Mutation Contract (ADR-047 D3)
1. Target — `docs/20-system/DESIGN.md`(§0 매핑표·§3 폰트 블록·§9 예외 근거·§10 언어별·§11) / `.claude/skills/bootstrap-design/SKILL.md`(R1 공유 모드·폰트, R3 폰트 렌더, R5 §10·§11) / `.claude/agents/reviewer.md`(`[Design-voice]` 렌즈, 스냅샷 증거) / `.claude/agents/designer.md`(용어 사전·렌즈 자기 점검) / `.claude/skills/{plan-workitem,validate-plan,stabilize-milestone,validate-workitem}/SKILL.md`·`.claude/agents/{validator,builder}.md`(ADR-027 인용 재지정 + D9 인용) / 템플릿 2종 / `docs/00-meta/{STRUCTURE,WORKFLOW}.md`.
2. Failure mode — 플랫폼 축 부재로 웹+앱 프로젝트가 DESIGN을 둘로 쪼개거나 한쪽만 적음 / 폰트 결정이 이름 한 줄로 끝나 라이선스·로딩·CJK 문제가 구현 중 드러남 / §10이 언어·일관성 규칙 없이 즉흥 카피 / 플랫폼 관례가 위반으로 오판 / 기준 자료 노후 미감지 (전부 관측됨).
3. Predicted improvement — 웹+앱 dogfood(Round 12)에서 DESIGN 1파일로 두 프로필 렌더 / 폰트 블록 9항목 충원 / `[Design-voice]`가 용어 사전 위반을 잡음 / §11 확인일 존재.
4. Preserved invariants — DESIGN.md 시각 SSOT / canonical 8섹션 상대 순서 / 3-tier 토큰 / 비-UI 삭제 경로 / 취향 오라클=사용자 / ADR-058 라운드 SSOT / ADR-060 D9 authority.
5. Falsifying evaluation — Round 12에서 프로필 delta가 §2~§10 전 절에 생기면(사실상 독립) D3 재검토 / 폰트 블록 항목이 `(해당 없음)`으로만 채워지면 D4 항목 축소 / `[Design-voice]` 오탐률이 리뷰 항목의 절반을 넘으면 D6 렌즈 축소.
6. Rollback path — 본 ADR을 supersede하는 후속 ADR로 ADR-027 net 규칙을 재채택하고 §0 매핑표·§3 블록·§10 언어별·§11을 제거한다(ADR-027 status는 되돌리지 않는다 — ADR-045).

## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT. 실제 파일 경로 1행 1개)
- docs/20-system/DESIGN.md                            — D2·D3·D4·D5·D6·D7
- docs/20-system/ARCHITECTURE_OVERVIEW.md              — D1 `## 7-1`~`## 7-5`
- .claude/skills/bootstrap-design/SKILL.md            — D3 공유 모드·D4 폰트·D6·D7·D11
- .claude/skills/bootstrap-stack/SKILL.md             — D1 7-x 채움/삭제
- .claude/skills/bootstrap-stack/output-checklist.md  — D1 7-4/7-5 생략 안내
- .claude/skills/plan-milestone/SKILL.md              — D9 UI 마일스톤 판정
- .claude/skills/plan-workitem/SKILL.md               — D8 read-list·self-check, D9
- .claude/skills/validate-plan/SKILL.md               — D8 [Plan-design]·[Plan-arch-iface]
- .claude/skills/stabilize-milestone/SKILL.md         — D8 preflight 5, D9 §5-1
- .claude/skills/validate-workitem/SKILL.md           — D8 인터페이스 CHECK
- .claude/skills/stack-guard/SKILL.md                 — D10 lint 권장
- .claude/agents/reviewer.md                          — D5·D6·D8 Design Consistency
- .claude/agents/validator.md                         — D8 인터페이스 CHECK
- .claude/agents/builder.md                           — D1 인터페이스 SSOT 열거
- .claude/agents/designer.md                          — D6 렌즈·용어 사전
- docs/30-workitems/_templates/TASK_TEMPLATE.md       — D8 `Design:`·`Architecture-Iface:`
- docs/30-workitems/_templates/FEATURE_TEMPLATE.md    — D8 `Design:`·`Architecture-Iface:`
- docs/00-meta/WORKFLOW.md                            — D2 승인 게이트·프로필
- docs/00-meta/STRUCTURE.md                           — 산출물·Canonical Owner

## 참고
- ADR-027(superseded — 본 ADR이 승계), ADR-058(워크플로우), ADR-072(프로토타입·UI 제작 계약), ADR-056(superseded → ADR-072), ADR-060 D9, ADR-071 D3, ADR-042#amend-1, ADR-059 D7, ADR-045, ADR-022.
```

### P4-2. ADR-027 status 변경
- `## Status` 본문 `accepted` → `superseded`. 그 아래 첫 줄에 `> 대체: [ADR-073](ADR-073-interface-and-design-content-v2.md) — 통합 재발행(2026-09-11). 본 문서는 history 잔존. (현재 SSOT: ADR-073)`.
- `## 현재 유효 결정`·`## Surfaces`는 원문 유지(D 분류상 supersede 선언·역사). 인용 재지정은 Phase 6.

### P4-3. `docs/20-system/DESIGN.md` (baseline placeholder) 갱신
- `## 0. Status` 값 줄 `draft` 아래 주석 뒤에 추가:
  ```markdown
  <a id="design-0-profiles"></a>
  ### 표면 → 디자인 프로필 (ADR-073 D3)
  <!-- 단일 표면이면 1행. 웹+앱이면 표면마다 1행. 공유 모드는 /bootstrap-design R1에서 사용자가 고른다(user-choice).
       프로필별 차이는 §2~§10 안 `### profile: <name>` 하위 블록에 delta만 적는다. 하위 블록이 없는 절은 전 프로필 공통.
       기준 뷰포트는 design gate 매니페스트·승인 스냅샷·stabilize §3-V가 그대로 쓴다(ADR-072). -->
  | surface | profile | platform | 기준 뷰포트 | 공유 모드 |
  |---|---|---|---|---|
  | (예: customer) | (예: consumer-mobile) | (예: native/android, native/ios) | (예: 390×844, 360×800) | (예: 공통+delta) |
  | (예: admin) | (예: admin-web) | web | 1280×900, 375×812 | 공통+delta |
  ```
- `## 1. Overview` 주석 끝에 `+ §9 금칙 예외 채택 시 근거 1줄 — (a) 브랜드 근거 또는 (b) 플랫폼 관례(예: iOS 26 Liquid Glass) (ADR-073 D5).` 추가. 주석 안 `(ADR-027#amend-7 …)`·`(ADR-058)` 인용은 각각 `ADR-073 D2`·유지로 바꾼다.
- `## 3. Typography` 헤딩 위에 `<a id="design-3-typography"></a>` 추가, 주석을 교체:
  ```markdown
  <!-- 1~2 family, 4~5 size scale, modular ratio (1.125/1.25/1.333), weight pair.
       + Data-table 계약: 표·정렬 숫자 열은 tabular figures(`font-variant-numeric: tabular-nums`).
       + 폰트 결정 블록 (ADR-073 D4 — 아래 항목을 전부 채운다. 해당 없으면 "(해당 없음)" 명시):
         - 조합: display / body / mono
         - fallback stack
         - 라이선스: <라이선스명> — 사용자 확인 <YYYY-MM-DD>
         - 전달 방식: self-host | CDN | 앱 번들
         - weight 세트
         - CJK: 행간·자간·한글/한자/가나 혼용 규칙
         - 숫자 정렬: tabular-nums 적용 범위
         - 로딩: font-display·preload / 앱은 번들 크기
         - 모바일 번들 상한
       결정은 실제 서비스 문장을 R6 테마 쇼케이스로 렌더해 본 뒤 내린다(ADR-058#amend-4). 조합은 user-choice. -->
  ```
- `## 9` 주석 안 `- glassmorphism·neon glow 디폴트 금지 (의도된 brand 결정일 때만 ## 1 Overview에 근거 명시)` → `- glassmorphism·neon glow 디폴트 금지 (## 1 Overview에 근거를 적을 때만 — (a) 브랜드 근거 또는 (b) 플랫폼 관례(예: iOS 26 Liquid Glass 머티리얼) — ADR-073 D5)`. 주석 안의 `ADR-027#amend-7`·`ADR-027 #7`·`ADR-027#d23`·`ADR-058#amend-2` 인용은 각각 `ADR-073 D5`·`ADR-073 D5`·`ADR-073 D5`·`ADR-072 D6`으로.
- 기존 `<a id="design-10-voice"></a>` 줄부터 파일 끝(§10 전체)까지를 아래 블록으로 **교체**한다(앵커 중복 방지):
  ```markdown
  <a id="design-10-voice"></a>
  ## 10. Voice & Writing
  <!-- UX writing 규칙서 v2 (ADR-073 D6). 언어별 하위 블록 + 용어 사전 + 검토 렌즈.
       기본값은 /bootstrap-design R1에서 "채택 or 변경" 1회 확인 후 확정. 비-UI 프로젝트는 본 파일 삭제 시 함께 삭제.
       카피 검토 시점: /design-milestone R3 브리프 — 사용자 승인 전 reviewer [Design-voice] (ADR-072). -->

  ### 용어 사전 (서비스 전체 일관성)
  <!-- 같은 행동은 같은 동사, 같은 상태는 같은 표현, 같은 대상은 같은 명사. 프로젝트가 채운다. -->
  | 대상 | 한국어 | English | 금지 동의어 |
  |---|---|---|---|
  | (예: 저장 동작) | 저장 | Save | 보관·기록 |

  ### 한국어
  - 어조: 해요체 (예: "저장했어요"). 명령형 CTA (예: "시작하기", "저장"). 과도한 사과·의인화 금지.
  - 내부용어 → 사용자 언어 번역표: (§10 용어 사전과 별개 — 코드·DB 용어를 화면에 노출하지 않는다)
    | 내부 용어 | 사용자 표면 문구 |
    |---|---|
    | (예: workspace_member) | (예: 멤버) |
  - 금지 표현
    - [grep 가능] placeholder 카피: `lorem ipsum`, `TODO copy`, `sample text`, `여기에 텍스트`
    - [grep 가능] (프로젝트별 정규식 — 예: 해요체 프로젝트에서 합쇼체 어미 `습니다\.` 혼입)
    - [LLM-판정] 책임 회피 문구("문제가 발생했습니다"만 있고 원인·다음 행동 없음), 내부 에러코드 노출, 과도한 감탄사
  - 표면별 예시 카피: 버튼(동사 우선, 2~4어절) / 에러(원인 1줄 + 다음 행동 1줄) / 빈 상태(상황 + 첫 행동) / 확인 다이얼로그(결과 + 되돌림 가능 여부)
  - 검토 렌즈 — 토스 UX writing 8원칙 체크 질문(각 카피가 통과하는가): ① 예상 가능한 힌트를 주는가 ② 잡초(불필요한 말)를 뺐는가 ③ 빈 문장이 없는가 ④ 핵심 메시지 하나에 집중하는가 ⑤ 말하듯 쉬운가 ⑥ 강요 대신 제안인가 ⑦ 보편적인 단어인가 ⑧ 숨은 감정을 다뤘는가
  - 검토 렌즈 — Humanize KR(im-not-ai) A~J 범주는 **AI 문체 탐지 렌즈로만** 쓴다(범주: 접속 부사 과다·상투적 강조·중복 수식·기계적 병렬·과잉 완곡·설명조 종결 등 — 저장소 README의 범주 이름 사용). 변경률 임계값·자동 치환은 UI 문구에 적용하지 않는다.

  ### English (해당 시)
  - Tone: sentence case, active voice, imperative CTAs, plain language, expand acronyms on first use.
  - Term table / forbidden patterns / examples: (한국어 블록과 같은 4항목을 영어로)
  - Review lens: one idea per sentence, no filler, say what happened and what to do next.

  <!-- 추가 언어는 위 형식으로 `### <언어>` 블록을 더한다. 프로필별 delta가 필요하면 블록 안에 `#### profile: <name>`. -->
  ```
- 파일 끝에 추가:
  ```markdown
  <a id="design-11-sources"></a>
  ## 11. 기준 자료 (ADR-073 D7)
  <!-- 확인한 자료·확인일·버전·적용 변경점만 적는다("최신 갱신" 같은 포괄 문구 금지). 확인일 12개월 초과 시 /bootstrap-design --update·/design-milestone R0가 재확인을 권장한다. -->
  | 자료 | 확인일 | 확인한 버전·일자 | 적용 변경점 |
  |---|---|---|---|
  | Google design.md spec (Stitch canonical) | 2026-09-11 | alpha (`docs/spec.md`) | 섹션 순서·lint |
  | W3C DTCG | 2026-09-11 | 2025.10 stable (2025-10-28) | 3-tier 토큰 |
  | Material 3 Expressive | 2026-09-11 | 최초 공개 2025-05-13 · I/O 2026 업데이트 세션 존재 | 모션·형태 시작 default |
  | Apple HIG (Liquid Glass) | 2026-09-11 | iOS 26 | §9 플랫폼 관례 예외 근거 |
  | WCAG | 2026-09-11 | 2.2 (3.0 draft) | §9 a11y |
  | Toss UX writing 8원칙 | 2026-09-11 | 2022-11-15 | §10 한국어 렌즈 |
  | Humanize KR (im-not-ai) | 2026-09-11 | v2.3.2 (2026-08) | §10 A~J 렌즈 |
  ```
- 위 행의 값은 2026-09-11 확인분이다. **실행 시 researcher 단발 sub-call로 각 행을 재확인**해 확인일을 실행일로 갱신하고, 확인 못 한 행은 확인일을 비운다(AGENTS.md «사실·가정 구분» — 확인하지 않은 날짜를 적지 않는다).
- 파일 안 `ADR-027#…` 인용은 전부 부록 A로 재지정(§4·§7·§8 주석 포함). `## 0` 상단 주석의 `(ADR-058)` 유지.

### P4-4. ADR-058 `## Amendment 4` 추가 — `docs/90-decisions/boilerplate/ADR-058-design-workflow.md` 끝에 append

```markdown
<a id="adr-058-amend-4"></a>
## Amendment 4 (2026-09-11) — 레퍼런스 갤러리 절차(4층 소스 + 큐레이션) + R6 네이티브 테마 쇼케이스 + 게이트 실행물 계약 이관

### 배경
- [관측됨] R0는 텍스트 리서치와 토큰 패키지 값 추출뿐이라 AI가 레퍼런스 화면을 «보지» 못한다. design-eval은 «텍스트 레퍼런스를 늘려도 시각 점수가 오르지 않는다»까지만 말하고, 시각 관측·사람 큐레이션의 효과는 미측정이다([가설]). 사용자 fork에서 시안이 낡거나 평범하다는 보고가 반복된다.
- [관측됨] 앱 화면은 AI가 설치·조작할 수 없고, 로그인 필요 사이트는 캡처가 막힌다. 디자이너 관행은 큐레이션 허브(uibowl.io·Mobbin·Refero 등)와 스토어 스크린샷을 먼저 본다.
- [관측됨] R6 프리뷰는 HTML이라 «DESIGN.md 토큰 → 스택 테마 배선»의 오차를 잡지 못하고, 그 오차는 첫 마일스톤 화면에서 늦게 드러난다. 코드 프로토타입(ADR-072)이 도입되면 이 배선이 선행돼야 한다.
- [관측됨] 게이트 실행물 계약(#amend-1 결정 5·6·#amend-2 digest·capability·conformance)은 «복사본이 원본과 같은가»를 증명할 뿐 이 프로젝트에 맞는가를 증명하지 못하며, Flutter 어댑터가 생기면 전제(단일 Node 파일) 자체가 깨진다. 인용 규모(2026-09-11 실측): `ADR-058#amend-2` 16파일/31줄.

### 결정
1. **레퍼런스 갤러리 절차(R0 확장)** — `/bootstrap-design` R0와 `/design-milestone` R2가 공유한다. 소스 4층:
   - **1층 큐레이션 허브**: uibowl.io(국내 앱·웹·게임, 컴포넌트·인터랙션 필터, 로그인 없이 열람), Mobbin, Refero, Screenlane, Page Flows, Nicelydone(앱 흐름) / Land-book, Godly, Awwwards(웹) / App Store·Google Play 공개 스크린샷(앱 최우선 — 로그인 불요) / Behance·Dribbble은 실제 제품이 아니므로 `concept-only` 표기. Pinterest는 주 소스에서 제외(3층으로만). 허브도 `capture-refs.mjs`의 자동 캡처 대상이다(내부 참고용 — 캡처물은 `참고용(재배포 금지)`으로 표기하고 제품·문서에 재배포하지 않는다). 로그인 벽 뒤 화면은 캡처되지 않으므로 공개 열람 페이지만 찍히고, 나머지는 사용자가 열어 본 뒤 3층 캡처로 넣는다. 1층 허브는 Layer B 값 추출 소스가 아니다(researcher 거부 목록 유지 — 시각 관측 lead로만).
   - **2층 실제 제품**: `capture-refs.mjs`(Playwright)로 지정 URL을 프로필 뷰포트로 캡처. 흐름 관측은 **관측 목적별**(온보딩·검색·결제·오류 복구 등)로 예산 안에서(기본 ≤3 흐름 × ≤6 화면). 봇 차단·로그인 필요는 `캡처 불가 — <사유>`로 정직 표기하고 3층을 요청한다. 자격 증명은 다루지 않는다.
   - **3층 사용자 캡처**: `docs/20-system/design-refs/inbox/`(gitignore)에 사용자가 이미지를 넣는다. 앱 프로젝트의 주 경로.
   - **4층 DESIGN.md 분석본**: getdesign.md(VoltAgent 커뮤니티 디렉터리, 550+ 분석본 — 공식 문서 아님)와 Google 공식 예시를 `docs/20-system/design-refs/cache/`(gitignore)에 내려받아 designer가 **어휘·토큰 범위·컴포넌트 규칙·결정을 근거 짓는 방식**을 참고한다. 기록은 `getdesign.md 분석본(<brand>)`로 적고 «<brand> 공식»으로 적지 않는다. 값·문구를 그대로 옮기지 않는다(ADR-040#amend-4 값 복제 금지 승계).
   - **갤러리 라운드(기본 — `--fast`만 생략)**: 1~3층 캡처를 `docs/20-system/design-refs/gallery.html`(gitignore, 자기완결) 한 페이지로 묶어 사용자가 브라우저에서 고르고 메모한다. **선택본만** designer가 분해한다. 취향 오라클=사용자 불변.
   - `DESIGN_RESEARCH.md` 항목 schema에 `- 출처 유형: live | curated-hub | store-screenshot | user-capture | design-md-analysis`와 `- 사용 주의: 참고용(재배포 금지) | concept-only | 비공식 분석본` 두 줄을 추가한다. Layer A/B/C·role 3종·정지 규칙·최소 schema는 유지.
2. **R6 = 네이티브 테마 쇼케이스**: R6는 HTML preview 대신 **DESIGN.md 토큰을 실제 스택 테마에 배선**하고 그것을 렌더한다. 웹: `src/styles/tokens.css`(CSS 변수) + Tailwind/테마 설정 + Storybook `Theme/Showcase` 스토리(토큰 swatch·타이포 scale·컴포넌트 category state·대표 화면 2~3개 — 실카피). Flutter: `lib/theme/tokens.dart`·`lib/theme/app_theme.dart` + `lib/prototype/theme_gallery.dart` 진입 파일. 배선 파일은 제품 코드이므로 **커밋한다**(HTML preview와 달리 삭제하지 않는다). 게이트는 매니페스트 모드(ADR-072 D6)로 쇼케이스를 검사한다. 사용자 승인 뒤 concept HTML만 삭제한다. 폰트 결정(ADR-073 D4)은 이 쇼케이스에서 실제 문장을 본 뒤 확정한다. Storybook·테마 배선 코드 authoring은 builder 단발 sub-call(dispatch `mode: ui-authoring` — designer는 Bash 없음, 스펙만 낸다). **`--fast`도 R6-1 배선·쇼케이스·게이트는 수행한다**(갤러리·R6-2 reviewer 픽셀 판정만 생략) — `_theme/manifest.json`이 `/design-milestone`의 필수 입력이기 때문이다. `--update`에서 토큰·컴포넌트가 바뀌면 R6-1 배선을 delta 재생성한다(DESIGN만 바뀌고 테마가 낡는 것을 막는다). 폰트 패키지·파일 추가는 R6-1 배선의 일부다(설치 소유 예외 — ADR-071 D6).
3. **R1 확장**: 공유 모드(ADR-073 D3)·폰트 조합(ADR-073 D4) Decision Brief 추가(user-choice). R2 concept HTML은 유지한다(방향 탐색 일회성 — 세 방향을 네이티브로 배선하면 비용이 3배).
4. **게이트 실행물 계약 이관**: #amend-1 결정 5·6(capability v1·conformance self-test)과 #amend-2 전부(canonical asset digest·capability v2·fixed conformance·upgrade/recovery)를 [ADR-072](ADR-072-design-milestone-and-code-prototype.md) D6(design gate v3 — 매니페스트 모드 + 설치 시 자가 검사 4케이스 + 복사 시 fingerprint)이 **대체**한다. D3의 품질 계약(serious/critical axe·좁은 폭 geometry·reviewer 픽셀 판정·repair loop ≤2·fail-closed)은 그대로다. #amend-1·#amend-2 본문은 기록으로 두고 각 헤딩 아래 `(현재 SSOT: ADR-072 D6)`를 병기한다. #amend-3(visual-QA 전제 표현)은 유효하다.

### 근거
- 갤러리·큐레이션은 «AI가 보고, 사람이 고른다»로 취향 오라클을 유지하면서 관측 기반 주장(D2)을 실제로 가능하게 한다. 효과는 [가설] — 재검토 트리거에 둔다.
- 테마 배선을 R6로 당기면 옮김 오차가 한 곳(토큰→테마)에서 한 번 승인된다.

### 강도 (ADR-022)
- enabling(약, [가설]): 결정 1·2·3. 결정 4는 실행물 소유 이관(품질 계약 불변).
- 재검토 트리거: Round 11·12에서 갤러리 라운드가 마일스톤당 1시간을 넘거나 선택본이 0건이면 `--fast` 기본화 검토 / 큐레이션 선택본 기반 시안이 R2-G reviewer 픽셀 판정에서 이전 라운드보다 나쁘면 1층 소스 축소.

### Mutation delta (ADR-047 D3)
- Target = bootstrap-design R0·R1·R6·allowed-tools / `capture-refs.mjs` 신설 / researcher.md 디자인 레퍼런스 모드 / designer.md / DESIGN_RESEARCH schema / `.gitignore` / STRUCTURE.
- failure = 텍스트만 보는 리서치의 median 회귀 / HTML preview가 테마 배선 오차를 못 잡음 / digest 계약이 Flutter에서 불성립 (관측됨).
- falsifier = 갤러리 선택본 0건 반복 / R6 쇼케이스가 gate 매니페스트 모드에서 exit 2로 굳음 / 자가 검사가 알려진 불량을 통과시킴.
- rollback = R0 갤러리 라운드·R6 네이티브 제거, HTML preview 복원; 결정 4는 ADR-072 rollback과 함께.

### 적용 surface
- .claude/skills/bootstrap-design/SKILL.md
- .claude/skills/bootstrap-design/assets/capture-refs.mjs
- .claude/agents/researcher.md
- .claude/agents/designer.md
- docs/20-system/DESIGN.md (§0 R0~R6 주석)
- docs/00-meta/STRUCTURE.md
- .gitignore
```

- ADR-058 `## 현재 유효 결정`에 두 줄 추가: `- **R0 레퍼런스 갤러리 절차(4층 소스 + 큐레이션 라운드)·R6 네이티브 테마 쇼케이스 — #amend-4.**` / `- **게이트 실행물(adapter·자가 검사·registry)은 ADR-072 D6이 소유한다 — #amend-4 결정 4. D3 품질 계약은 본 ADR.**`
- `## Surfaces`에서 `.claude/skills/stack-guard/assets/design-gate-conformance.mjs` 행 삭제, `design-gate.mjs` 행 설명을 `— v3 canonical (매니페스트 모드·자가 검사) — 소유 ADR-072 D6`으로. **`.claude/skills/plan-milestone/SKILL.md — R5-5 프로토타입 수용 게이트 caller(…)` 행을 `.claude/skills/design-milestone/SKILL.md — R2 갤러리·R6 게이트 품질 계약 caller`로 재지정**(plan-milestone은 R5 삭제 뒤 ADR-058 인용이 0이 된다 — 역참조 검사 실패 방지. design-milestone 파일은 Phase 5에서 생기므로 Phase 7 검사 시점에는 실재한다).
- #amend-1 헤딩 아래·#amend-2 헤딩 아래 각각 `> (현재 SSOT: ADR-072 D6 — #amend-4 결정 4로 이관)` 한 줄.

### P4-5. `.claude/skills/bootstrap-design/assets/capture-refs.mjs` 신설
Node ESM. 헤더 주석 `// reference gallery capture (ADR-058#amend-4 결정 1)`. 입력 JSON(`docs/20-system/design-refs/refs.json` — skill이 작성): `{ "viewports": [{w,h,name}], "targets": [{ "id", "url", "kind": "live|store|hub", "flows": [{ "name", "steps": [{ "action": "goto|click|wait", "selector" }] }] }] }`. 동작: (1) 세 `kind` 모두 Playwright chromium(stack-guard 설치분 재사용, 없으면 `Needs Install` exit 2)으로 target·viewport별 캡처 → `docs/20-system/design-refs/shots/<id>-<flow|page>-<n>-<w>x<h>.png`. `kind`는 카드의 `출처 유형` 라벨(live / store-screenshot / curated-hub)과 `사용 주의` 기본값에만 쓰인다. (2) 실패(로그인 벽·봇 차단·타임아웃)는 `캡처 불가 — <사유>`로 `shots/_log.json`에 기록하고 그 target은 **링크 카드**로 대체한다(exit 0 유지 — 일부 실패는 정상). `fill` 액션은 지원하지 않는다(자격 증명 입력 경로 자체를 두지 않는다). (3) `docs/20-system/design-refs/inbox/`의 이미지(png/jpg/webp)를 `출처 유형: user-capture` 카드로 갤러리에 합친다. (4) `gallery.html`(자기완결 — 썸네일 grid + 링크 카드 + 체크박스 + 메모 textarea + «선택 내보내기» → `selection.json`)을 생성한다. 보안: `browser_run_code`류 없음, 로그인·자격 증명 없음.

### P4-6. `.claude/skills/bootstrap-design/SKILL.md`
- (a) frontmatter `allowed-tools`에 추가: `Bash(node .claude/skills/bootstrap-design/assets/capture-refs.mjs*)` `Bash(pnpm build-storybook*)` `Bash(npm run build-storybook*)` `Bash(yarn build-storybook*)` `Bash(bun run build-storybook*)` `Bash(flutter test*)`. `Bash(rm docs/20-system/design-preview.html)`는 삭제(R6 산출물이 HTML이 아님). `WebFetch(domain:github.com)`에 `WebFetch(domain:getdesign.md)` 추가.
- (b) 도입부 `> 패턴:` 줄에 `**R0 캡처(capture-refs)·R6 테마 배선(builder 단발)**은 Bash·코드 작성이 필요해 각각 메인 세션 실행·builder 위임이다(designer는 Bash 없음).` 추가. `> 라운드 구조…SSOT는 ADR-058` 줄의 `ADR-027` → `ADR-073`.
- (c) `## 모드` `--fast` 설명을 `**갤러리 라운드(R0-G)·R2 concept·R4·R6-2 reviewer 픽셀 판정 생략 — R6-1 테마 배선·쇼케이스·게이트는 수행**(`_theme/manifest.json`이 design-milestone 필수 입력)`으로 바꾼다(기존 «R6 생략» 문구 삭제). `--update`에 `프로필 추가·공유 모드 변경·폰트 교체는 R1 브리프 재실행 + R6 재검토(ADR-073 D11); **토큰·컴포넌트가 바뀌면 R6-1 배선을 delta 재생성한다(생략 금지)**; §10이 v1 형식(언어 블록·용어 사전 없음)인 기존 fork는 R5에서 §10 v2로 마이그레이션(기본값 채움 + 확인 1회 — 구 plan-milestone R5의 §10 신설 경로 승계)` 추가.
- (d) `## 반드시 먼저 읽을 파일`의 STACK_SETUP_PLAN 줄 → `- `docs/00-meta/STACK_SETUP_PLAN.md` (`## Design Gate Adapter` `status: ready (self-test PASS <날짜>)` — R2-G·R6 게이트 실행 전제; `## Stack Decision Registry`의 UI 킷·스타일링·미리보기 도구 행 — R6 배선 대상)`.
- (e) `## R0` 절의 `- **레퍼런스 노트 영속화 (필수, `--fast`는 minimal)**` 불릿 **앞**에 새 하위 절 삽입:
  ```
  ### R0-G. 레퍼런스 갤러리 (ADR-058#amend-4 결정 1 — 기본, `--fast` 생략)
  1. **소스 후보 수집**(researcher 디자인 레퍼런스 모드 위임): 방향타(primary task·결정 순간·실패/복구·정체성 tension)에 맞춰 4층에서 후보를 모은다 — 1층 큐레이션 허브(uibowl.io·Mobbin·Refero·Screenlane·Page Flows·Nicelydone / Land-book·Godly·Awwwards / App Store·Google Play 스크린샷 / Behance·Dribbble은 concept-only) · 2층 실제 제품 URL · 4층 getdesign.md 분석본 2~4개(방향 일치 브랜드). researcher는 URL·설명·`출처 유형`·`사용 주의`만 반환한다(값 추출은 Layer B 그대로).
  2. **캡처(메인 세션)**: 후보를 `docs/20-system/design-refs/refs.json`에 적고 `node .claude/skills/bootstrap-design/assets/capture-refs.mjs`를 실행한다. 1층 허브·스토어 공개 스크린샷·2층 실제 제품을 모두 캡처한다. 뷰포트는 DESIGN `## 0` 매핑표(없으면 웹 1280/375·앱 390×844). 흐름 관측은 관측 목적별 예산 안(기본 ≤3 흐름 × ≤6 화면). 봇 차단·로그인은 `캡처 불가`로 남기고 사용자에게 3층(inbox) 캡처를 요청한다. 자격 증명은 다루지 않는다.
  3. **4층 내려받기**: getdesign.md 분석본은 `docs/20-system/design-refs/cache/<brand>.DESIGN.md`로 저장(gitignore). Google 공식 예시는 R5 format fixture로만(Layer C 불변).
  4. **큐레이션(사용자)**: `docs/20-system/design-refs/gallery.html`을 열어 마음에 드는 화면을 고르고 메모하게 한다(«원하시면 추천을 요청하실 수 있어요» 노출 — 취향 오라클). 선택 결과(`selection.json` 또는 대화 답변)를 받는다.
  5. **분해(designer)**: 선택본 + 4층 분석본만 입력으로 what-to-borrow/avoid·role·토큰 범위를 분해한다. 분석본은 «getdesign.md 분석본(<brand>)»로 인용하고 값·문구 복제는 금지.
  6. `DESIGN_RESEARCH.md` 각 항목에 `- 출처 유형:`·`- 사용 주의:`를 적는다. 갤러리·캡처·캐시는 커밋하지 않는다(재생성 가능).
  ```
  기존 `- **관측 기반 주장만**` 불릿 끝에 `— 갤러리 캡처가 그 «실화면»이다(R0-G).` 추가. `DESIGN_RESEARCH.md` schema 블록의 각 레퍼런스 항목에 `- 출처 유형: live | curated-hub | store-screenshot | user-capture | design-md-analysis` / `- 사용 주의: 참고용(재배포 금지) | concept-only | 비공식 분석본` 두 줄 추가.
- (f) `## R1` 끝에 추가:
  ```
  - **프로필·공유 모드 결정 (ADR-073 D3, user-choice)**: 표면이 둘 이상(웹+앱 등)이면 `## 0` 매핑표를 채우고 공유 모드(대부분 공통 / 공통+delta / 독립)를 Decision Brief로 확정한다. 단일 표면이면 1행 + 공유 모드 «단일».
  - **폰트 조합 후보 (ADR-073 D4, user-choice)**: 후보 2~3조합을 Decision Brief로 제시하되 **확정은 R6 쇼케이스에서 실제 문장을 본 뒤**로 미룬다(원장 `open` → R6에서 `closed`). 라이선스 확인은 사용자 몫임을 브리프에 적는다.
  ```
- (g) `## R3` 끝에 `- **폰트 결정 블록 9항목**(ADR-073 D4)을 채운다. 조합은 R1 후보 중 R6에서 확정될 값으로 잠정 기입.`
- (h) `## R5` `## 10 Voice & Writing`을 …` 불릿 → `- `## 10 Voice & Writing`을 언어별 블록(ADR-073 D6)으로 확정 저장한다 — 용어 사전 표는 charter 시나리오의 핵심 명사·동사로 초기 채움. `## 11 기준 자료`는 baseline 표를 유지하고 R0에서 새로 참고한 자료가 있으면 행을 더한다(확인일 필수).`
- (i) `## R6` 전체를 교체:
  ```
  ## R6 — 네이티브 테마 쇼케이스 + 검토 루프 + 정리 (ADR-058#amend-4 결정 2)

  > 목적: 확정된 DESIGN.md 토큰이 **실제 스택 테마에 배선되어** 충실히 렌더되는지 확인한다. 옮김 오차(토큰→테마)를 여기서 한 번 승인한다. 배선 파일은 제품 코드이며 커밋한다. `--fast`는 R6-2 reviewer 픽셀 판정만 생략(배선·쇼케이스·게이트는 수행). `--update`는 토큰·컴포넌트 변경 시 R6-1을 delta 재생성.

  ### R6-1. 테마 배선 + 쇼케이스 생성 (builder 단발 sub-call, dispatch에 `mode: ui-authoring` — designer 스펙 입력)
  - 웹: `src/styles/tokens.css`(또는 스택 관례 경로)에 DESIGN `## 2~6` 토큰을 CSS 변수로, Tailwind/테마 설정이 그 변수를 참조하게 배선. Storybook `Theme/Showcase` 스토리 1개 — 섹션 순서: Tokens(swatch+hex+대비비 / typography scale — **폰트 후보 조합별 실제 서비스 문장** / spacing / radius·shadow) → Components(`## 7` 인벤토리 각 category expected 상태 — hover/focus는 상태 클래스 변형 병행) → 대표 화면 2~3개(실카피). 프로필이 둘 이상이면 프로필별 스토리(`Theme/Showcase/<profile>`).
  - Flutter: `lib/theme/tokens.dart`·`lib/theme/app_theme.dart`(ThemeData/ColorScheme/TextTheme 배선) + `lib/prototype/theme_gallery.dart` 진입 파일(같은 섹션 순서) + `test/prototype/theme_gallery_test.dart`(프로필 뷰포트 렌더 + Accessibility Guideline 4종 + overflow 0 + 스냅샷 PNG).
  - 폰트 패키지·파일(예: `@fontsource/*`, `assets/fonts/`, Flutter `pubspec.yaml` `fonts:`)은 여기서 추가한다(설치 소유 예외 — ADR-071 D6).
  - 매니페스트: `docs/20-system/prototypes/_theme/manifest.json`(ADR-072 D3 schema, `milestone: "_theme"`)에 쇼케이스 화면을 등록한다.
  - 파일 상단 주석: `GENERATED FROM docs/20-system/DESIGN.md — 수정은 DESIGN.md → /bootstrap-design R6 재생성. 토큰 외 값 금지.`
  ### R6-2. 게이트 + reviewer 픽셀 판정
  - `STACK_SETUP_PLAN.md ## Design Gate Adapter`가 `ready`인지 확인 후 `validate:design -- --manifest docs/20-system/prototypes/_theme/manifest.json`을 실행한다(경로 추측 금지; `needs-install`·`n/a`면 `Needs Design Gate: /stack-guard` + 승인 보류). 차단(serious/critical axe·좁은 폭 geometry·Flutter guideline·overflow)은 **DESIGN.md를 먼저 고치고** R6-1 재생성(retry ≤2, 초과 시 brief 재검토).
  - reviewer(design surface) 단발 sub-call이 `design-gate-shots/` 스크린샷을 Read로 열람해 위계·밀도·slop·overlap을 판정(Design Consistency 6차원 전부 — DESIGN 확정 후). Codex: 순차 페르소나 + `under-verified` 명시.
  ### R6-3. 검토 루프 + 폰트 확정
  - 사용자에게 «`npm run storybook`(또는 `flutter run -t lib/prototype/theme_gallery.dart`)으로 열어 확인해 주세요» 안내. 피드백은 **DESIGN.md 먼저 수정 → 재생성**. 2사이클 미수렴 시 brief(R0/R1) 수정.
  - 폰트 조합을 여기서 확정하고 원장 `closed` + `DESIGN.md ## 3` 앵커. `## 3` 폰트 블록의 잠정값을 확정값으로 갱신.
  ### R6-4. 정리
  - 승인 시 `docs/20-system/design-concepts/concept-*.html`만 삭제한다. 테마 배선·쇼케이스·`_theme/manifest.json`은 **유지·커밋 대상**(살아 있는 참조 — `/design-milestone`이 재사용).
  - 안내: «concept 삭제됨 / 테마 쇼케이스는 코드로 유지(재생성: `/bootstrap-design` R6)».
  ```
- (j) `## 종료 후`·`마지막 출력`의 `design-preview.html` 언급을 `테마 쇼케이스(Storybook `Theme/Showcase` 또는 `lib/prototype/theme_gallery.dart`) 경로`로, `concept/preview 시안 상태` → `concept 상태: 삭제됨 / 쇼케이스: 유지(커밋)`. 후속 권장 단계에 `(UI 마일스톤은 `/plan-milestone` → `/design-milestone M<N>` 순)` 추가.
- (k) 문서 내 `ADR-027#…` 인용은 부록 A로 재지정. `R2-G`·R6의 `capability ADR-058#amend-2/v2`·`source digest`·`fixed conformance` 문구는 전부 `status: ready (self-test PASS <날짜>)` 확인으로 교체(Phase 5 P5-6 참조).

### P4-7. `.claude/agents/researcher.md` 디자인 레퍼런스 모드
- 절 끝에 추가:
  ```
  - **갤러리 후보 수집 (ADR-058#amend-4 결정 1)**: 호출 측이 «갤러리 후보»를 요청하면 4층(큐레이션 허브 / 실제 제품 URL / 스토어 스크린샷 / getdesign.md 분석본) 후보를 `id | url | kind | 출처 유형 | 사용 주의 | 방향타 대응` 표로 반환한다. 캡처·다운로드는 하지 않는다(메인 세션이 `capture-refs.mjs`로 수행). 로그인 필요·봇 차단 가능성을 아는 대로 표기한다. getdesign.md는 VoltAgent 커뮤니티의 비공식 분석본임을 항상 명시한다.
  ```
- 기존 `- **거부 목록**: mobbin·copycats류 "가짜 요약/갤러리" 사이트는 값 추출 소스로 쓰지 않는다(…)` 줄 끝에 ` — **갤러리 후보(시각 관측 lead)로는 허용**한다(ADR-058#amend-4 결정 1). 값 추출 소스 거부는 불변.`을 덧붙인다(같은 파일 안의 상반 지시 방지).

### P4-8. `.claude/agents/designer.md`
- 역할 목록 `- 레퍼런스 분해(R0): …` → `- 레퍼런스 분해(R0): researcher 후보 + **사용자 큐레이션 선택본**(갤러리) + 4층 분석본을 입력으로 what-to-borrow/avoid·role별 정리를 분해한다(ADR-058#amend-4). 분석본은 «getdesign.md 분석본(<brand>)»로 인용하고 값·문구를 복제하지 않는다.`
- `- 마일스톤 화면 프로토타입(plan-milestone R5): …` 불릿은 Phase 5 P5-12에서 교체한다(여기서는 그대로 둔다).
- 규칙에 추가: `- 카피는 DESIGN.md §10의 **해당 언어 블록 + 용어 사전**을 먼저 읽고 쓴다. 자기 점검으로 토스 8원칙 체크 질문(한국어)·plain-language(영어)를 통과시키고, AI 문체 렌즈(A~J)에 걸리는 표현은 고친다(ADR-073 D6).`
- `- 산출 HTML은 자기완결…` → `- concept 시안 HTML은 자기완결(빌드·외부 의존 0, CSS 인라인) + GENERATED 헤더. 화면 브리프·테마 스펙은 markdown이며 코드 authoring은 builder에 넘긴다(너는 Bash가 없다).`

### P4-9. `.claude/agents/reviewer.md`
- Design Consistency 5 `[Design-voice]` 설명 끝에 `**렌즈**: 해당 언어 블록의 검토 렌즈(한국어 = 토스 8원칙 체크 질문 + Humanize KR A~J 탐지 렌즈 / English = plain-language)와 **용어 사전** 위반(같은 행동 다른 동사 등)을 본다(ADR-073 D6). 임계값·자동 치환은 적용하지 않는다.`
- Design Consistency 도입 문장 `호출 측이 렌더 증거(스크린샷·1280/375 캡처·axe 결과)를 주입하면` → `호출 측이 렌더 증거(`design-gate-shots/` 스크린샷·프로필 뷰포트 캡처·axe/guideline 결과·**승인 스냅샷**)를 주입하면`. 호출자 목록에 `bootstrap-design R6(테마 쇼케이스)` 추가.
- 문서 내 `ADR-027#…` 인용은 부록 A로.

### P4-10. `.gitignore`
- `docs/20-system/design-preview.html` 줄 삭제(더 이상 생성하지 않음). 주석 `# design exploration/preview (ephemeral, never committed — ADR-058 / ADR-027#d22): concept 시안 + DESIGN.md 파생 preview` → `# design exploration (ephemeral — ADR-058): concept 시안. R6 테마 쇼케이스는 코드라 커밋 대상(ADR-058#amend-4)`.
- 추가:
  ```
  # 레퍼런스 갤러리 (ephemeral — ADR-058#amend-4): 캡처·캐시·갤러리 페이지. 저작권 자료라 커밋하지 않는다
  docs/20-system/design-refs/
  ```

### P4-11. `docs/00-meta/STRUCTURE.md` 산출물 표
- `design preview` 행 → `| 테마 쇼케이스 (UI only — 토큰→테마 배선 + Storybook `Theme/Showcase` / `lib/prototype/theme_gallery.dart`) | 스택 관례 경로 + `docs/20-system/prototypes/_theme/manifest.json` | `/bootstrap-design` R6 (builder 단발) | Living | conditional |`
- 행 추가: `| 레퍼런스 갤러리 (캡처·캐시·gallery.html) | `docs/20-system/design-refs/` | `/bootstrap-design` R0-G · `/design-milestone` R2 (capture-refs.mjs — ADR-058#amend-4) | ephemeral | conditional |` / `| 레퍼런스 캡처 asset | `.claude/skills/bootstrap-design/assets/capture-refs.mjs` | 수동 (harness 제공) | Reference | baseline |`
- Canonical Owner `UI 시각 디자인` 행: `design-preview.html`(R6) 언급 → `테마 쇼케이스(R6 — 코드, 커밋)`.

### P4-12. `docs/00-meta/WORKFLOW.md`
- 줄 11의 R6 설명 `R6(DESIGN.md 파생 preview 최종 확인 + 게이트)` → `R6(DESIGN.md 토큰의 스택 테마 배선 + 네이티브 쇼케이스 확인 + 게이트 — ADR-058#amend-4)`; `R6 preview를 승인한 뒤** concept/preview 시안을 삭제하고` → `R6 쇼케이스를 승인한 뒤** concept 시안을 삭제하고(쇼케이스·배선은 커밋)`; 끝의 `DESIGN.md *내용*·인터페이스 할당 SSOT는 ADR-027.` → `ADR-073.`

### P4-13. 커밋
```
docs(adr): reissue ADR-027 as ADR-073 design content contract v2 with profiles, fonts and per-language voice
docs(adr): amend ADR-058 with reference gallery procedure and native theme showcase
feat(skills): add reference gallery round and native theme showcase to bootstrap-design
```


---

## Phase 5. 디자인 마일스톤 + 코드 프로토타입 + UI 제작 계약 + design gate v3 (ADR-072) · ADR-059#amend-1 · 하류 배선

목표: `/design-milestone M<N>` 신설, 프로토타입을 스택 코드로, 게이트를 매니페스트 모드로, 승인 스냅샷 커밋, UI 제작 계약, 하류 스킬·에이전트·템플릿 배선. ADR-056을 대체한다.

### P5-1. ADR-072 작성 — `docs/90-decisions/boilerplate/ADR-072-design-milestone-and-code-prototype.md`

```markdown
# ADR-072 — 디자인 마일스톤 + 코드 프로토타입 + UI 제작 계약 + design gate v3

> scope: boilerplate
> area: design/process

## Status
accepted

> 대체: [ADR-056](ADR-056-milestone-experience-contract.md)을 supersede한다(비결정 «프로토타입 코드의 구현 재사용 — 스펙이지 코드가 아니다»를 뒤집고, R5 라운드를 `/plan-milestone`에서 분리한다). ADR-056은 `superseded`로 history 잔존. 경험 계약의 목적(사용자 승인 artifact가 오라클, 구현 전 시각 확인, PX 커버리지, §10 voice 집행, 전환표)은 전부 승계한다. 디자인 워크플로우(R0~R6)는 [ADR-058](ADR-058-design-workflow.md), DESIGN.md 내용은 [ADR-073](ADR-073-interface-and-design-content-v2.md).
> 부분 supersede: ADR-058#amend-1 결정 5·6, #amend-2 전부(게이트 실행물 계약) → 본 ADR D6. [ADR-060](ADR-060-decision-closure-and-milestone-seal.md) D7 «봉인 전 구현 없음» → 본 ADR D5의 UI 제작 계약이 명시 예외. [ADR-009](ADR-009-tdd-default.md) TDD 기본 → D5가 시각 탐색 코드에 한해 Red-first를 면제. [ADR-059](ADR-059-flutter-mobile-profile.md) D12 native degrade → #amend-1이 갱신. 각 ADR에는 참조 갱신 줄만 둔다.

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
- **코드 위치·규칙**: 웹은 ARCH `## 3-1` 트리의 컴포넌트 디렉터리 하위 `screens/<screen>/` — `<Screen>.<ext>`(presentational: props-in/callbacks-out, fetch·store·router import 금지; 확장자는 스택 관례 `.tsx`/`.vue`/`.svelte`/Astro 컴포넌트) + `<Screen>.stories.<ext>`(상태별 스토리 = fixture — Storybook 프레임워크 통합 관례) + `fixtures.<ext>`(출처 표기 — ADR-064 D5). Flutter는 `lib/screens/<screen>/`(위젯, 데이터는 생성자 인자) + `lib/prototype/main.dart`(갤러리 진입 — 화면·상태 목록) + `test/screens/<screen>_prototype_test.dart`(프로필 뷰포트 렌더 + Accessibility Guideline 4종 + overflow 0 + 스냅샷 PNG). 파일 상단 **추적 헤더** 주석: `feature: F-NNN | PX: PX-M<N>-<screen>-01..NN | DESIGN: §2 <token set>, §7 <components> | 승인: <YYYY-MM-DD>`.
- **PX 마커**: 코드 주석 `// PX-M<N>-<screen>-NN: <한 줄 결정>`(JSX 안 `{/* … */}`). 문법·불변식·소유 규칙은 ADR-056#amend-1 승계(마일스톤 번호=버전, 한 화면 내 중복 금지, 각 PX는 구현 feature 정확히 1곳 `## 7`).
- **매니페스트** `docs/20-system/prototypes/M<N>/manifest.json`(커밋, 부록 C schema): `version`, `milestone`, `profiles`(name → viewports), `screens[]` — `id`, `feature`, `profile`, `preview`(`story:<storybook-id>` 또는 `flutter:<test file>` + `entry: lib/prototype/main.dart#<screen>`), `source[]`(코드 경로), `states[]`(각 `{ id, preview, baseline? }` — 상태별 스토리 id 또는 위젯 테스트 group; `baseline: true`는 브리프의 «승인 필요 상태»), `px[]`, `snapshots[]`, `brief`, `product_entry`(제품 라우트·딥링크 — R7이 `## 9`·ARCH 라우팅에서 채우고, 미정이면 `null` + 배선 task line item이 확정), `approved{date, by}`, `supersedes[]`(이전 M 화면 참조 `M<K>/<screen>` — 공용 컴포넌트·토큰 변경으로 그 화면의 기준선을 이 M이 새로 잡을 때), `handoff{ run, remaining_wiring[] }`. **이 파일이 게이트·validate-plan·seal·stabilize·accept의 단일 입력**이다(경로 추측 금지).
- **fixture 보존**: 스토리·fixture·위젯 테스트는 삭제하지 않는다(테스트 자산 — 구현 task가 그대로 쓴다).
- **미리보기**: 웹 Storybook(정적 빌드는 게이트가 `design-gate-storybook/`에 생성), Flutter `flutter run -t lib/prototype/main.dart`. 제품 라우트에 개발 전용 페이지를 두지 않는다(불가한 스택만 예외 — 사유를 매니페스트 `handoff.run`에 적음).
- **불확실 화면 2안**: 브리프 `구성 불확실` 화면만 `<Screen>.stories.tsx`에 `A`/`B` 스토리(또는 Flutter 갤러리 항목 2개). 선택 후 탈락안 삭제.

### D4. 승인 스냅샷 (동결 기준선)
- R6 사용자 승인 직후 게이트가 캡처해 `snapshots/<screen>-<state>-<w>x<h>.png`로 저장한다. **형식은 PNG**(Playwright·Flutter 위젯 테스트가 직접 만드는 형식 — 변환 의존 없음). 기준선 집합 = 각 뷰포트의 `default` 상태 + 1차 뷰포트의 `empty`·`error` 상태 + 매니페스트 `states[].baseline: true` 상태. 파일당 500KB 초과는 게이트가 경고한다(차단 아님 — 화면 단순화 권고). **커밋 대상**. `approved.date`와 함께 동결된다 — 같은 M 안에서(봉인 전) 재승인하면 같은 파일을 대체하고, **봉인 뒤에는 그 M의 스냅샷·매니페스트를 다시 쓰지 않는다**(D5-5).
- 용도: stabilize §3-V·accept·validate-plan의 **사람·AI 육안 대조 참조**. **픽셀 diff 오라클로 쓰지 않는다**(Flutter는 host마다 1~3% 다름 — ADR-059 D3). golden(`test/**/goldens/`, 로컬 전용)과 별개 경로·별개 목적이다.
- Flutter 스냅샷은 위젯 테스트가 논리 크기로 렌더해 생성한다(디바이스 불요). 안전 영역·글자 확대 1.3배는 권장 상태.

### D5. UI 제작 계약 (봉인 전 예외 — ADR-060 D7·ADR-009 carve-out)
1. **범위**: `/design-milestone` R4~R6가 만드는 presentational 코드·스토리·fixture·위젯 테스트·테마 배선(ADR-058#amend-4 R6)만. 데이터·권한·저장·라우팅 배선은 만들지 않는다.
2. **TDD**: 시각 탐색 코드에 Red-first를 요구하지 않는다. **행동 계약**(키보드 도달·포커스 순서·취소·확인·콜백 호출)은 R6에서 게이트(axe/guideline) + 스토리 interaction test 또는 위젯 테스트로 검사한다 — 브리프의 인터랙션 계약 항목이 그 테스트의 명세다.
3. **가짜 Red 금지**: 이후 구현 task는 승인 UI를 «재사용»한다. task `## 3`에 `- 승인 UI 재사용: <컴포넌트 경로> (manifest: <screen id>) — 배선만: <데이터/권한/저장 연결>` line item을 두고, builder는 그 컴포넌트의 표현을 다시 쓰지 않으며 Red 관측은 **배선 AC에 대해서만** 보고한다. 이미 통과하는 표현 테스트를 «Red였다»고 적지 않는다.
4. **추적**: 추적 헤더 + PX 마커 + 매니페스트 `source[]`가 «어느 feature·PX·DESIGN 결정에서 왔는가»의 경로다. validator는 `승인 UI 재사용` task의 diff가 배선(props·데이터·이벤트 연결)에 한정되는지 보고, 표현 마크업이 바뀌었는데 재승인 등재가 없으면 `P1 [Design-reuse-drift]`.
5. **공용 컴포넌트·토큰 변경 → 새 기준선 append(이전 M 불변)**: M<N+1>에서 이전 M 승인 화면에 쓰인 공용 컴포넌트·토큰을 바꾸면, 그 화면을 M<N+1> 매니페스트 `screens[]`에 **다시 등록**하고 `supersedes: ["M<K>/<screen>"]`을 적어 R6에서 렌더·승인·스냅샷을 M<N+1> `snapshots/`에 저장한다. 이전 M의 매니페스트·스냅샷·봉인 증거는 **건드리지 않는다**(마일스톤 번호 = 버전 — ADR-056#amend-1 승계, ADR-057#amend-3 결정 4). 소비자(stabilize §3-V·accept·validate-plan)는 화면의 현재 기준선을 «가장 최근 M의 등록 또는 supersedes»로 해석한다. 봉인 전(`contract-ready`)이면 같은 M 안에서 재승인·대체한다. `/amend-ssot` 전파표 행(ADR-069#amend-1)이 이 판정을 낸다.
6. **세션 인계**: 매니페스트 `handoff`에 실행 방법·남은 배선 목록을 적는다(별도 HANDOFF 파일 없음).
7. **커밋**: 본 skill은 커밋하지 않는다. 종료 출력에 권장 커밋 메시지(`feat(ui): approve M<N> screen prototypes`)를 낸다. 사용자 커밋 후 `/plan-workitem`.

### D6. design gate v3 (매니페스트 모드 + 설치 시 자가 검사)
- **실행물**: canonical `.claude/skills/stack-guard/assets/design-gate.mjs` v3를 `/stack-guard`가 project-native 경로(기본 `scripts/design-gate.mjs`)에 복사하고 `validate:design`(npm 계열)에 배선한다. **`design-gate-conformance.mjs`(고정 적합성 oracle)·capability version 핸드셰이크는 폐지**한다. 복사 시점의 canonical sha256은 registry `copied-from`에 남긴다 — caller는 대조하지 않으며, stack-guard 재실행의 local-modification 판별과 stabilize의 canonical 갱신 감지에만 쓴다.
- **모드**: `--html <files|glob>`(concept HTML — bootstrap-design R2-G) / `--manifest <path> [--only <screen id,...>] [--snapshot <dir>] [--no-build]`(화면·쇼케이스 — R6·design-milestone·stabilize·validate-workitem) / `--self-test`(설치 시) / `--tokens-only <glob>`(토큰 외 리터럴 스캔 — 기록 등급, 렌더 출력을 건드리지 않는다). 렌더 모드(`--html`·`--manifest`·`--self-test`)만 `design-gate-shots/`를 초기화한다. 출력 `design-gate-shots/report.json` + 스크린샷. exit `0`(pass) / `1`(blocker) / `2`(실행 불가 — Needs Install·미정의 플래그·모르는 매니페스트 `version`). 자식 프로세스 기동 실패(EPERM·EACCES·ENOENT)는 exit 2, 기동 후 시간 초과·출력 초과는 exit 1(ADR-063 D1 spawn 3분기 승계).
- **웹 어댑터**: `preview: "story:<id>"` → Storybook 정적 빌드(`build-storybook -o design-gate-storybook/` — **매 실행 재빌드**; 같은 세션 반복에서만 `--no-build`로 재사용, mtime 캐시 없음) + 내장 정적 서버(임시 포트) → 화면의 `states[]` 각 `preview`(없으면 화면 `preview` 1개)를 `iframe.html?id=<id>&viewMode=story`로 프로필 뷰포트마다 fresh render → populated axe(serious/critical 차단, moderate/minor 보고) + 좁은 폭 geometry(page overflow·viewport escape·clipped text — 기존 v2 로직·오탐 제외 유지). `--html`은 `file://` 렌더로 같은 검사.
- **Flutter 어댑터**: `preview: "flutter:<test file>"` → `flutter test <file> --reporter json`(위젯 테스트가 프로필 논리 크기 렌더 + `meetsGuideline` 4종 + `FlutterError`(RenderFlex overflow) 0 + PNG 저장 — 캡처 이름 `<screen>-<state>-<w>x<h>.png`) → 결과를 같은 report schema로 정규화. 차단 = guideline 실패·overflow·예외. **컴파일 오류·러너 기동 실패는 exit 2**(blocker가 아니라 실행 불가)로 구분한다.
- **자가 검사(4케이스)**: `--self-test`는 (a) 내장 known-bad HTML — **규칙별 기대**: `page-overflow`(320) ≥1 · `color-contrast` ≥1 · `button-name` ≥1이 각각 blocker로 잡혀야 한다(합계가 아니라 규칙별 — 한 규칙의 다중 검출이 다른 규칙의 결함을 가리지 않게) (b) 내장 known-good HTML — blocker 0 (c) 내장 정적 HTML 2개를 임시 매니페스트(`preview: "url:<path>"`)로 서빙해 매니페스트 경로·report·`--snapshot` 저장까지 exit 0 (d) Flutter 프로젝트면 `test/design_gate/self_bad_test.dart`(known-bad: 탭 타겟 20px + 대비 2:1) 실패 + `test/design_gate/self_ok_test.dart`(known-good) 통과 — 컴파일 오류는 exit 2로 구분. 넷 다 기대와 같아야 `self-test: PASS`. 불일치 → `status: wiring-fail`. 통과하면 registry `status: ready (self-test PASS <YYYY-MM-DD>)`.
- **registry 6필드**: `status | command template | adapter path | manifest 규약 | self-test 일자 | copied-from(복사 시 canonical sha256)`. caller는 `status: ready`만 확인한다(missing/n/a/needs-install/wiring-fail면 `Needs Design Gate: /stack-guard` + 승인 보류 — fail-closed 유지). `adapter path`는 stabilize §1.0 (a) 실재 검사용, `copied-from`은 stack-guard 재실행(사본 sha == copied-from이면 무수정 → 새 canonical로 교체 + copied-from 갱신, 다르면 diff 보고 + 사용자 결정)과 stabilize §1.0 (b)(canonical 현재 sha ≠ copied-from → `/stack-guard` 재실행 권장)에만 쓴다.
- **품질 계약 불변**: ADR-058 D3(serious/critical axe·좁은 폭 geometry 차단, reviewer 픽셀 판정, repair ≤2, populated 전제). 토큰 외 리터럴 스캔은 문자열 검사라 기록 등급(ADR-063 D6) — design-milestone 승인 체크리스트가 «0건 또는 사유 기입»을 요구한다.
- **single-origin**: `design-gate-shots/`·`design-gate-storybook/`은 매 실행 초기화 — 같은 checkout에서 동시 2실행 금지(ADR-063 D7 승계).

### D7. stabilize §3-V v2
- 웹: 매니페스트 `screens[]`마다 (a) 스토리 렌더(게이트 `--manifest`)와 (b) 제품 라우트 렌더(dev server + 매니페스트 `product_entry` — `null`이면 «제품 진입점 미기록» 사유 echo + (a) 대조만)를 프로필 뷰포트로 캡처해 `docs/40-validation/visual/M-N/`에 두고, **승인 스냅샷과 나란히** Read로 대조한다. Flutter: (a) 위젯 테스트 스냅샷 재생성 + (b) 통합 테스트 스크린샷(가능 시, 아니면 `blocked-on-env` 명시). 화면의 현재 기준선은 «가장 최근 M의 등록·supersedes»다(D5-5). 앵커 위계: ① 승인 스냅샷 ② DESIGN 파생 체크리스트. 불일치 `P1 [Experience-drift]` report-only(승계) — 봉인 AC·PX↔AC 위반을 동반해 재현되면 별도 P0 결함(ADR-070 D1). 실행 의무·silent skip 금지 승계.

### D8. `/plan-milestone` 분리
R5 라운드 제거. UI 마일스톤은 R4 뒤 텍스트 정합 재대조(M `## 3` ↔ F `## 3` ↔ F `## 7` FAC)까지 하고 **`draft` 유지** + 출력 «다음: `/design-milestone M<N>`». 비-UI는 기존대로 `contract-ready`. draft UI M 재실행 시 R0~R4 완료면 재실행 없이 같은 안내를 낸다. `contract-ready` UI M의 텍스트 계약 수정은 plan-milestone, 화면 층 수정은 design-milestone 재진입.

### D9. 하류 소비자 배선
- `/plan-workitem` 입구 계약: `contract-ready` + feature `## 7` `프로토타입:`(매니페스트 screen id) 또는 `프로토타입 면제:`. 부재 시 `Needs Experience Contract` + «`/design-milestone M<N>`» 안내(ADR-007#amend-5 문구 갱신). task `## 3`에 `승인 UI 재사용` line item authoring, PX↔AC는 매니페스트 `px[]`에서.
- `/validate-plan`·reviewer `[Plan-FAC-coverage]`: PX 소유·문법 검사의 source = 매니페스트 `px[]` + 코드 주석 grep(`^PX-M<N>-<screen>-\d{2,}$`). 매니페스트 화면마다 스냅샷 파일 실재 + 각 feature `프로토타입:` id가 매니페스트에 존재.
- `/seal-milestone` 조건 4에 UI M «매니페스트 존재 + 스냅샷 실재» 추가.
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
```

### P5-2. ADR-056 status 변경
- `## Status` `accepted` → `superseded`. 아래 줄: `> 대체: [ADR-072](ADR-072-design-milestone-and-code-prototype.md) (2026-09-11). 본 문서는 history 잔존. (현재 SSOT: ADR-072)`. `## 현재 유효 결정`·본문·amendment는 원문 유지.

### P5-3. 새 스킬 — `.claude/skills/design-milestone/SKILL.md`
아래를 그대로 파일로 만든다(본문 안의 `<…>`는 실행 시 채워지는 값).

````markdown
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
- **입력 분기**: (a) `draft` M + 대상 화면 미완 → 미완 라운드부터 재개(완료 화면 skip — 매니페스트 `approved.date` 유무로 판정). (b) `draft`·`contract-ready` M의 재진입 대상은 셋 — (i) `프로토타입:`·`프로토타입 면제:` 둘 다 없는 UI feature의 화면(최초·추가) (ii) `- 계약 수정:` 마커가 남은 UI feature의 승인 화면(브리프 delta → 재승인; 마커 자체는 plan-workitem 재검증 규칙대로 남긴다) (iii) `--screens <id,...>`로 지정된 승인 화면(`/repair-plan` 4-M·사용자 요청). (ii)(iii)는 R3부터 돌고 같은 M 스냅샷을 대체한다. `contract-ready`는 유지(강등 없음). (c) `ready` + `- 봉인일:` 채움 → 거부 + «변경은 M<N+1>». (d) 비-UI M(산하 feature `## 11` `Design:` 줄 0) → «비-UI 마일스톤 — /plan-workitem M<N>» 안내 후 종료.

## 반드시 먼저 읽을 파일
- 마일스톤 문서 `## 1~4`·`## 9`, 산하 feature `## 2`·`## 3`·`## 7`·`## 8-1`·`## 11`
- `docs/20-system/DESIGN.md` 전체 (`## 0` 프로필 매핑표 · `## 1` 정체성(thesis·signature·imagery — 브랜드 근거) · `## 2`~`## 11`)
- `docs/20-system/prototypes/_theme/manifest.json` (R6 테마 배선 — 재사용 대상)
- 이전 마일스톤 `docs/20-system/prototypes/M<K>/manifest.json`(있으면 — 공용 컴포넌트·`supersedes` 후보 판정)
- `docs/00-meta/STACK_SETUP_PLAN.md ## Design Gate Adapter`·`## Stack Decision Registry`(UI 킷·미리보기 도구)
- `docs/20-system/ARCHITECTURE_OVERVIEW.md ## 3-1`(컴포넌트 디렉터리)·`## 7-4`/`## 7-5`

## R0 — preflight + 회수
1. 전제 확인(하나라도 아니면 무엇을 먼저 돌릴지 안내 후 종료): M `draft`(또는 분기 b) / 산하 feature에 `## 3`·`## 7 FAC` 있음 / DESIGN `## 0 Status` ≠ draft + 프로필 매핑표 있음 / Design Gate Adapter `status: ready` / `_theme/manifest.json` 존재(없으면 «`/bootstrap-design` R6 먼저»).
2. 대상 화면 = 입력 분기 (b)의 (i)(ii)(iii). 비-UI feature는 `## 7`에 `프로토타입 면제: 비-UI feature` 자동 기입. 중단 재개는 화면별로 판정한다(매니페스트 `approved` + feature `## 7` 기입 여부).
3. DESIGN `## 11` 확인일이 12개월 초과면 «researcher 재확인 권장» 1줄(자동 갱신 아님).
4. 이전 M 매니페스트에서 공용 컴포넌트 목록을 회수한다(재사용 후보). 대상 화면이 이전 M 승인 화면의 공용 컴포넌트·토큰을 바꾸면 그 화면을 이 M에 `supersedes`로 재등록할 후보로 표시한다(ADR-072 D5-5).
5. DESIGN `## 10`이 v1 형식(언어 블록·용어 사전 없음)이면 «`/bootstrap-design --update`로 §10 v2 마이그레이션 먼저» 안내 후 종료(구 plan-milestone R5의 §10 신설 경로 승계).

## R1 — 화면 목록 · 전환표 · 프로필 배정
- feature `## 3` 시나리오에서 화면을 도출한다(feature당 대표 1화면 기본, 다화면은 협의, 총 6~8화면 초과 시 우선순위 협상 + 세션 분할 안내).
- 각 화면에 프로필(DESIGN `## 0` 매핑표)을 배정한다 — 기준 뷰포트가 여기서 정해진다.
- 마일스톤 `## 9. 화면 전환` 표를 채운다(ADR-056#amend-3 승계 — 트리거는 비가역·분기·복구 상태 존재; 아니면 «(해당 없음)»).
- 화면 id는 kebab-case(`<screen>`) — 매니페스트·PX·브리프·코드 디렉터리가 같은 id를 쓴다. **숫자로 끝나지 않는다**(PX 문법 `\d{2,}$` 파싱 보호).
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
- 화면마다 builder 단발 sub-call(dispatch에 `mode: ui-authoring` 명시 — 입력: 승인 브리프 + DESIGN 토큰·`_theme` 배선 경로 + 재사용 컴포넌트 목록 + ADR-072 D3 규칙 + 추적 헤더 형식 + PX 마커 문법). **presentational만** — props-in/callbacks-out, fetch·store·router 금지.
- 웹: `screens/<screen>/<Screen>.<ext>` + `<Screen>.stories.<ext>`(확장자는 스택 관례 — `.tsx`/`.vue`/`.svelte`; 상태별 스토리: happy + 못생긴 상태 5종 + category state, `구성 불확실`이면 `A`/`B`) + `fixtures.<ext>`(출처 표기). Flutter: `lib/screens/<screen>/` + `lib/prototype/main.dart` 갤러리 등록 + `test/screens/<screen>_prototype_test.dart`(프로필 크기 렌더 + guideline 4종 + overflow 0 + PNG — ADR-059#amend-1 결정 2·3).
- 각 코드에 PX 마커 주석을 단다(브리프 PX 후보 → 확정 id). 토큰 외 리터럴 금지.
- 매니페스트 `docs/20-system/prototypes/M<N>/manifest.json`에 화면을 등록한다(`states[]`는 `{id, preview}`로 상태별 스토리 id·테스트 group까지, 브리프의 «승인 필요 상태»는 `baseline: true`; `approved`·`product_entry`는 비움).
- builder 반환은 경로·PX 목록·남은 리스크만(코드 전문 금지).

## R5 — 선택·수정 루프 (사용자)
- 안내: «`npm run storybook`에서 `Screens/<screen>` 스토리(또는 `flutter run -t lib/prototype/main.dart`)를 열어 상태별로 확인해 주세요. 원하시면 추천을 요청하실 수 있어요.»
- 피드백은 builder 재생성으로 반영(사용자 직접 편집 X). 브리프와 어긋나는 변경 요청은 브리프를 먼저 고친다. 2사이클 미수렴 시 브리프 재검토.
- `A`/`B` 선택 후 탈락안 스토리·항목 삭제.

## R6 — 게이트 + 픽셀 판정 + 승인 + 스냅샷
1. `STACK_SETUP_PLAN.md ## Design Gate Adapter` `status: ready`가 아니면 `Needs Design Gate: /stack-guard` + 승격 보류(silent skip 금지).
2. `validate:design -- --manifest docs/20-system/prototypes/M<N>/manifest.json --only <이번 대상 화면>` 실행(같은 세션 반복은 `--no-build`). exit 1 blocker는 builder에 selector·요약을 되먹여 재생성(≤2회), 초과 시 승인 보류 + 브리프 재검토. exit 2면 사유 echo + 보류.
3. `--tokens-only <screens 경로>` 결과가 0건이 아니면 고치거나 브리프에 사유를 적는다(승인 체크리스트 항목 — 이 모드는 렌더 출력을 지우지 않는다).
4. reviewer(design surface) 단발 sub-call이 `design-gate-shots/`를 Read로 열람해 위계·밀도·slop·overlap·도메인 fit을 판정(차단은 재생성).
5. 사용자 최종 승인(화면 단위). **승인 체크리스트**: happy + 못생긴 상태 5종 + category state 렌더됨 / 실카피(§10) / 인터랙션 계약 테스트(키보드·포커스·취소·콜백) 존재·통과 / PX 마커 ≥1 / 토큰 외 리터럴 0 또는 사유 / 접근성 blocker 0.
6. 승인 직후 `validate:design -- --manifest <경로> --only <화면> --snapshot docs/20-system/prototypes/M<N>/snapshots/`로 기준선 스냅샷(각 뷰포트 default + 1차 뷰포트 empty·error + `baseline: true` 상태)을 `snapshots/<screen>-<state>-<w>x<h>.png`로 저장한다(500KB 초과 경고). 매니페스트 `approved{date, by: user}`·`snapshots[]`·`product_entry`(`## 9`·ARCH 라우팅에서 도출, 미정이면 `null`)·`handoff{run, remaining_wiring[]}` 채움. 이전 M 승인 화면에 영향(공용 컴포넌트·토큰 변경)이 있으면 그 화면을 **이 M 매니페스트에 `supersedes: ["M<K>/<screen>"]`로 재등록**해 함께 렌더·승인·스냅샷(이전 M 파일은 불변 — ADR-072 D5-5).

## R7 — feature 기입 · 정합 재대조 · contract-ready
1. 각 구현 feature `## 7`에 `프로토타입: <screen id> (manifest: docs/20-system/prototypes/M<N>/manifest.json, 진입: <story id | entry>)` + `승인 스냅샷: <경로들>` + `경험 결정(PX):` 인벤토리(코드 주석에서 **그대로 복사** — 재추출 금지; 화면이 여러 feature에 걸치면 PX별 구현 feature에 분산). 완전성 확인: 그 화면 코드의 PX 마커 집합 = 관련 feature 인벤토리 부분집합.
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
````

### P5-4. Codex wrapper — `.agents/skills/design-milestone/SKILL.md`
```markdown
---
name: design-milestone
description: Use ONLY when the user explicitly types `$design-milestone M<N>`. Do not trigger implicitly from generic phrasing.
---

Source of truth: `.claude/skills/design-milestone/SKILL.md` (skill 신설 근거: ADR-072). Read it and follow the workflow.

Treat all frontmatter keys other than `name` and `description` (e.g., `agent:`, `disable-model-invocation:`, `allowed-tools:`, `context:`, `argument-hint:`, `model:`, `effort:`) as Claude-only and ignore them — execute locally in Codex.

**Slash command translation**: 본문 안의 `/design-milestone`·`/plan-milestone`·`/plan-workitem`·`/stack-guard`·`/bootstrap-design` 표기는 Claude 슬래시 커맨드다. Codex에서는 `$design-milestone` 등으로 읽고 사용자에게 안내한다.

**Sub-agent parity**: 본문의 designer·builder·reviewer·researcher 단발 sub-call은 Claude `Agent` 도구 기능이다. Codex에서는 메인 세션이 각 persona 파일을 읽고 순차 인라인 수행하며, 생성→감사 전환을 명시적 단계로 끊고 `under-verified: 동일 세션 감사`를 산출물에 적는다(ADR-058 D5). 게이트·캡처 명령은 그대로 실행한다.

Preserve all repo policies from `AGENTS.md` and `docs/`.

If the source path no longer exists, this wrapper is stale — see ADR-010.
```
`.agents/skills/design-milestone/agents/openai.yaml`:
```yaml
policy:
  allow_implicit_invocation: false
```

### P5-5. design gate v3 — `.claude/skills/stack-guard/assets/design-gate.mjs` 재작성
기존 138줄의 렌더·geometry·axe·오탐 제외 로직은 **함수로 보존**하고 아래 구조로 감싼다. `design-gate-conformance.mjs`는 `git rm`.

- **CLI**: `node design-gate.mjs (--html <files|glob...> | --manifest <path> [--only <id,...>] [--snapshot <dir>] [--no-build] | --self-test | --tokens-only <glob...>) [--report <path>] [--viewports WxH,...]`. 인자 없음·미정의 플래그 → usage + exit 2.
- **공통**: 렌더 모드(`--html`·`--manifest`·`--self-test`)만 실행 시작에 `design-gate-shots/`를 초기화한다(ADR-063 D7). `--tokens-only`는 출력 디렉터리를 건드리지 않는다(R6에서 렌더 뒤에 돌아도 reviewer가 볼 스크린샷이 남는다). 자식 프로세스(`storybook build`·`flutter test`) 기동 실패(`EPERM`·`EACCES`·`ENOENT`)는 exit 2, 기동 후 시간 초과·출력 초과는 exit 1(ADR-063 D1 spawn 3분기 승계). 결과는 `design-gate-shots/report.json`(schema: `{ version: 3, mode, screens: [{ id, profile, viewport: {w,h}, preview, blockers: [{rule, selector|widget, detail}], reports: [...], screenshot }], summary: { blockers, reports, unavailable } }`). exit 0/1/2.
- **`--html`**: v2와 같다(1280/375/320 fresh render, 320 geometry, populated axe 1280·320). 뷰포트 override `--viewports 1280x900,375x812`.
- **`--manifest`**: JSON 읽기 → `version !== 1`이면 exit 2. `--only`가 있으면 그 화면만. `profiles[<screen.profile>].viewports` + 항상 `320x720` geometry 전용 추가(웹만). 화면의 `states[]` 각 `preview`(없으면 화면 `preview` 1개)를 렌더한다:
  - `story:<id>` → (1) `npx storybook build -o design-gate-storybook --quiet`를 **매 실행** 수행(`--no-build`가 있으면 기존 빌드 재사용 — 같은 세션 반복용; mtime 캐시 없음) (2) `node:http`로 임시 포트 정적 서빙 (3) `http://127.0.0.1:<port>/iframe.html?id=<id>&viewMode=story`를 뷰포트별 fresh goto → v2 검사 함수. 빌드 실패·Storybook 미설치 → 그 화면 `unavailable` + 전체 exit 2.
  - `flutter:<test file>` → `flutter test <file> --reporter json --dart-define=DESIGN_GATE_OUT=design-gate-shots` 실행. 테스트 파일 규약(design-milestone R4가 생성): 각 프로필 크기마다 `tester.binding.setSurfaceSize`, `pumpWidget`, `expectLater(tester, meetsGuideline(...))` 4종, `FlutterError.onError` 수집(RenderFlex overflow 등) 0 확인, `captureImage`로 PNG를 `DESIGN_GATE_OUT/<screen>-<state>-<w>x<h>.png` 저장. 러너는 json 이벤트에서 `testDone` 실패를 blocker로 정규화(`rule: guideline:<name> | overflow | exception`). `flutter` 미설치·러너 기동 실패·컴파일 오류(스트림에 `protocolVersion` 없음 또는 `error` 이벤트만)는 exit 2로 구분한다.
  - `--snapshot <dir>`이 있으면 통과 화면의 기준선 집합(각 뷰포트 default + 1차 뷰포트 empty·error + `states[].baseline: true`)을 PNG 그대로 `<dir>/<screen>-<state>-<w>x<h>.png`로 복사한다(변환 없음). 파일당 500KB 초과는 `report.summary.snapshotWarnings[]`에 경고(차단 아님).
- **`--tokens-only`**: glob 파일에서 정의 라인(`--<name>: #hex`, `static const Color … =`, tokens 파일 경로) 제외 후 `#hex`·`[#hex]`(Tailwind arbitrary)·`Color(0x…)`·`Colors.<x>`·`\b\d+px\b`(spacing 토큰 정의 밖)를 grep. 결과는 `report.tokens[]`(기록 등급 — exit에 영향 없음).
- **`--self-test`**(4케이스): (a) 내장 known-bad HTML(뷰포트 escape `width: 200vw` 요소 + 대비 2:1 텍스트 + 라벨 없는 `<button><svg/></button>`) 렌더 → **규칙별** blocker 기대: `page-overflow`(320) ≥1 · `color-contrast` ≥1 · `button-name` ≥1. (b) 내장 known-good HTML → blocker 0. (c) 내장 정적 HTML 2개를 임시 디렉터리에 쓰고 임시 매니페스트(`preview: "url:<path>"`)로 서빙해 매니페스트 경로·report·`--snapshot` 저장까지 exit 0. (d) `pubspec.yaml`이 있으면 `test/design_gate/self_bad_test.dart`(stack-guard가 생성: 20px 탭 타겟 + 2:1 대비 위젯) 실패 + `test/design_gate/self_ok_test.dart` 통과 — 컴파일 오류는 exit 2. 넷 다 기대 일치 → `self-test: PASS` exit 0, 불일치 → `self-test: FAIL` exit 1, 실행 불가 → exit 2.
- 헤더 주석: `// design gate v3 (ADR-072 D6 / Flutter 어댑터: ADR-059#amend-1). 모드: --html | --manifest | --self-test | --tokens-only. 품질 계약: ADR-058 D3.`

### P5-6. `.claude/skills/stack-guard/SKILL.md` — 게이트 절 교체
- (a) `이 skill의 1단계 범위` 항목 `- UI 판정 시 canonical asset byte-copy + project-native validate:design entry + fixed browser conformance + … registry 기록(ADR-058#amend-2). …` → `- UI 판정 시 canonical design gate v3 asset을 project-native `validate:design`에 배선하고 **자가 검사 1회**를 통과시켜 `STACK_SETUP_PLAN.md ## Design Gate Adapter`(6필드)에 기록(ADR-072 D6). 비-UI는 asset을 읽거나 복사하지 않는다.`
- (b) `반드시 먼저 읽을 파일`의 `- UI 판정 시에만 docs/…/ADR-058-design-workflow.md#adr-058-amend-2와 .claude/skills/stack-guard/assets/design-gate*.mjs` → `- UI 판정 시에만 `.claude/skills/stack-guard/assets/design-gate.mjs`(v3) — 소유 ADR-072 D6`.
- (c) 2-1 harness 경로 배제의 `**포맷되면 SHA-256 digest 가 바뀌어 conformance oracle 이 게이트를 차단하고 status: wiring-fail 로 굳는다.**` → `**포맷되면 자가 검사 fixture 문자열이 깨질 수 있다(자가 검사 재실행으로 복구 — 재실행 계약).**`
- (d) 수행 5의 `validate:design 판정 행 (UI 한정, ADR-058#amend-2):` 블록 전체 → 
  ```
   `validate:design` 판정 행 (UI 한정, ADR-072 D6):
   - **자가 검사 통과** → registry `status: ready (self-test PASS <YYYY-MM-DD>)`, 출력 `validate:design self-test: PASS`.
   - **module/browser/flutter 부재** → `status: needs-install` + `Needs Install: <실제 명령>`; design artifact 승인 보류.
   - **자가 검사 기대 불일치**(known-bad를 통과시킴) → `status: wiring-fail` + `validate:design self-test: FAIL`; 원인을 고치고 재실행 전까지 `ready` 금지.
   - **비-UI** → `status: n/a`; asset read/copy·browser 설치 없음.
  ```
- (e) 6-4-1 절 제목·본문을 교체:
  ```
   - **6-4-1. design gate v3 어댑터 + Visual-QA scaffold (UI 한정 — ADR-072 D6 / ADR-058#amend-3)**:
     - **JIT read 경계**: 6-1이 UI 확정/의심일 때만 `.claude/skills/stack-guard/assets/design-gate.mjs`를 읽는다. 비-UI는 로드·복사·설치 없음(ADR-019).
     - **물질화**: canonical v3를 project-native 경로(기본 `scripts/design-gate.mjs`)로 복사하고 `validate:design` 진입점을 **npm 계열**로 박는다(`make`·`task` 금지 — exit 1/2 구분 보존, ADR-059 D2). Flutter도 design gate 진입점만 npm이다. command template: `<pm> validate:design -- <args>`.
     - **Storybook 정적 빌드 출력**: `design-gate-storybook/`을 `.gitignore`에 추가(첫 실행 전).
     - **Flutter 자가 검사 fixture**: `pubspec.yaml`이 있으면 `test/design_gate/self_bad_test.dart`(known-bad 위젯 — 20px 탭 타겟 + 2:1 대비; 헤더 주석 «design gate self-test fixture — 실패가 정상»)와 `test/design_gate/self_ok_test.dart`(known-good)를 생성한다. **주의**: `flutter test`가 이 파일을 통합 `validate`에서 실행하지 않도록 `validate`의 test 단계에서 `test/design_gate/`를 제외한다(제외 방법은 도구 문서 확인 — SKILL에 키를 박지 않는다).
     - **자가 검사(4케이스)**: `<pm> validate:design -- --self-test` 실행 → 위 판정 행. **capability 버전 핸드셰이크·고정 적합성 oracle은 없다**(ADR-072 D6이 ADR-058#amend-2를 대체). 복사 직후 canonical asset의 SHA-256을 registry `copied-from`에 적는다(caller 대조 없음).
     - **registry 기록(6필드)**: `status | command template | adapter path | manifest 규약(docs/20-system/prototypes/<M|_theme>/manifest.json — ADR-072 D3) | self-test 일자 | copied-from`. 비-UI는 `status: n/a`만.
     - **single-origin**: `design-gate-shots/`·`design-gate-storybook/`은 매 실행 초기화 — 동시 2실행 금지(ADR-063 D7). 이 사실을 registry 하단에 1줄 부기.
     - **구현 앱 Visual-QA (별도 surface)**: (기존 문단 유지 — ADR-058#amend-3 전제 처리·`test.skip()`·`visual-qa:` 기록 전부 그대로)
  ```
  기존 `- **direct-support Node UI 물질화**…`, `- **source integrity + fixed conformance (direct-support Node UI)**…`, `- **version/re-run policy**…`, `- **output ignore + 실행 single-origin (ADR-063 D7)**…`(새 «Storybook 정적 빌드 출력»·«single-origin» 불릿이 대체), `- **registry 기록**: … capability version=ADR-058#amend-2/v2 | source digest | conformance…`, `- **비-Node/범위밖-스택**…` 불릿은 삭제. `- **JIT read 경계**`는 위 새 문구로 교체. `- **구현 앱 Visual-QA (별도 surface)**` 이하 하위 불릿은 유지.
  수행 3의 `- `## Design Gate Adapter` — UI면 실제 command template·adapter/output 경로·current capability version·source digest·…` 줄도 `- `## Design Gate Adapter` — UI면 6필드(status·command template·adapter path·manifest 규약·self-test 일자·copied-from)를 6-4-1이 기록, 비-UI면 `status: n/a`만(ADR-072 D6)`로 바꾼다.
- (f) 마지막 출력 `- validate:design adapter 결과 (UI 한정 — current capability/source digest + registry status + …)` → `- validate:design adapter 결과 (UI 한정 — registry status + self-test 일자 + command; 비-UI는 n/a)`.
- (g) `## 재실행 계약` 표 `| ## Design Gate Adapter | 매 실행 **digest + conformance 재검증**, 낮은 capability version 은 승격 |` → `| ## Design Gate Adapter | 매 실행 **자가 검사 재실행**. canonical asset sha ≠ registry `copied-from`이면 갱신 대상 — project 사본 sha == `copied-from`(무수정)일 때만 새 canonical로 교체 + `copied-from` 갱신, 다르면(local modification) 덮어쓰지 않고 diff 보고 + 사용자 결정 |`. 재실행 시점 문장의 `design gate capability version 승격 시` → `design gate canonical asset 갱신 시`.
- (h) `## DESIGN.md lint 권장` 절 끝의 `> **기존 fork 마이그레이션**:` 문단의 `v1/lower adapter는 위 digest 정책으로 v2 업그레이드하고, local modification은 자동 덮어쓰기 금지.` → `v1/v2 adapter(`design-gate-conformance.mjs` 존재)는 v3 사본으로 교체하고 conformance 파일과 registry의 digest·capability·conformance 행을 제거한 뒤 자가 검사를 돌린다. local modification은 diff 보고 + 사용자 결정.`
- (i) `## 정적 분석 도구 권장`·`## 스택별 verify 풀세트` 등 나머지는 불변. 문서 내 `ADR-058#amend-2` 인용은 전부 `ADR-072 D6`으로, `ADR-027#…`은 부록 A로.

### P5-7. `docs/00-meta/_templates/STACK_SETUP_PLAN_TEMPLATE.md` — `## Design Gate Adapter` 교체
```markdown
## Design Gate Adapter
<!-- UI 프로젝트에서만 /stack-guard가 채우는 실행 registry (ADR-072 D6). caller(bootstrap-design R2-G/R6, design-milestone R6, stabilize §3-V, validate-workitem)는 command template을 그대로 쓰고 경로를 추측하지 않는다.
     비-UI면 status=n/a만 기록. status가 ready가 아니면 승인·프로토타입 승격을 보류한다(fail-closed).
     같은 checkout에서 validate:design을 동시에 2개 실행하지 않는다(출력 디렉터리를 매 실행 초기화 — ADR-063 D7). -->
| field | value |
|-------|-------|
| status | `n/a` (`ready (self-test PASS <YYYY-MM-DD>)` / `needs-install` / `wiring-fail`) |
| command template | (예: `npm run validate:design -- <args>` — args: `--html <files>` / `--manifest <path> [--only <id>] [--snapshot <dir>] [--no-build]` / `--self-test` / `--tokens-only <glob>`) |
| adapter path | (예: `scripts/design-gate.mjs` — stabilize §1.0 (a) 실재 검사 대상) |
| manifest 규약 | `docs/20-system/prototypes/<M<N>|_theme>/manifest.json` (ADR-072 D3 schema v1) |
| self-test 일자 | (마지막 자가 검사 PASS 일자) |
| copied-from | (복사 시점 canonical `design-gate.mjs` SHA-256 — caller는 대조하지 않는다; stack-guard 재실행·stabilize §1.0 (b)만 사용) |
```

### P5-8. ADR-059 `## Amendment 1` — `docs/90-decisions/boilerplate/ADR-059-flutter-mobile-profile.md` 끝에 append
```markdown
<a id="adr-059-amend-1"></a>
## Amendment 1 (2026-09-11) — target별 e2e 진입점 + 집계, 승인 스냅샷·design gate Flutter 어댑터, D12 갱신

### 배경
- [관측됨] D4는 `validate:e2e` 진입점을 하나로 두고 `web`과 `native/*`가 함께 선언되면 `FAIL(wiring)`으로 멈춘다. 웹+앱을 한 저장소에서 다루는 프로젝트(ADR-073 D3 프로필)가 이 경로에서 막힌다.
- [관측됨] D12는 native 시각 대조를 degrade로 두었다. ADR-072가 코드 프로토타입·위젯 테스트 스냅샷을 도입하므로 native에서도 승인 스냅샷 대조가 가능해진다.

### 결정
1. **target별 진입점 + 실행 시점 device 해석**: `validate:e2e:web`(Playwright) · `validate:e2e:android` · `validate:e2e:ios`를 두고 **`validate:e2e`는 집계 진입점**으로 선언된 target을 순차 실행해 target별 상태를 한 줄씩 출력한다. native 진입점은 `node scripts/e2e-target.mjs <android|ios>`(stack-guard 생성)로 배선한다 — 이 스크립트가 `flutter devices --machine`에 registry의 «실행 대상 선택 규칙»을 대입해 **그때의 device id를 얻어** `flutter test integration_test -d <id>`를 실행하고 `--machine` 스트림을 그대로 전달한다. **`package.json`에 `-d <id>`를 박지 않는다**(D4의 «임시 id 금지» 불변 — 해석 시점만 스크립트로 옮긴 것). 후보 0개면 `BLOCKED_ENV`, iOS는 host가 macOS일 때만. 각 target의 구조화 출력·판정 순서는 ADR-052#amend-1 그대로. 단일 target 프로젝트는 `validate:e2e`가 그 하나만 실행하므로 **웹 단독 프로젝트의 구성은 바뀌지 않는다**. D4의 «진입점 하나로 유지 · 다른 계열이면 FAIL(wiring)» 문장은 본 결정이 대체한다 — `/stack-guard` 6-4·`/stabilize-milestone` 3-b도 갱신.
2. **승인 스냅샷(native)**: `/design-milestone` R6가 위젯 테스트(`test/screens/<screen>_prototype_test.dart`)로 프로필 논리 크기 PNG를 생성하고 게이트가 PNG 그대로 `docs/20-system/prototypes/M<N>/snapshots/`에 저장한다(커밋). golden(D3 — `test/**/goldens/`, 로컬 전용)과 **경로·목적이 다르다**: golden은 픽셀 회귀 오라클(로컬), 승인 스냅샷은 사람·AI 육안 참조(커밋, 픽셀 diff 금지). D3은 불변.
3. **design gate Flutter 어댑터**: `validate:design -- --manifest`가 `flutter:<test file>` preview를 `flutter test --reporter json`으로 실행해 Accessibility Guideline 4종(D5)·overflow·예외를 blocker로 정규화한다(ADR-072 D6). D5의 «존재 강제 없음»은 유지 — 강제 대상은 프로토타입 테스트뿐이다.
4. **D12 갱신**: §3-V native 경로는 «위젯 테스트 스냅샷 재생성 + 승인 스냅샷 대조»를 기본으로 하고, 앱 기동 캡처(`flutter drive`/integration_test 스크린샷)는 가능할 때만 추가한다. 실행 불가 사유 echo 의무는 유지.

### 강도 (ADR-022)
- 제약(강, [관측됨]): 결정 1 — 혼합 target에서 `FAIL(wiring)` 대신 target별 실행.
- enabling(약): 결정 2·3·4.

### 적용 surface
- .claude/skills/stack-guard/SKILL.md (6-4 진입점·6-4-1 Flutter fixture)
- .claude/skills/stabilize-milestone/SKILL.md (3-b target별 호출·§3-V native)
- .claude/skills/design-milestone/SKILL.md (R4 위젯 테스트·R6 스냅샷)
- .claude/skills/stack-guard/assets/design-gate.mjs (flutter 어댑터)
- docs/00-meta/_templates/STACK_SETUP_PLAN_TEMPLATE.md (`## E2E Smoke Registry` 주석 — 진입점 표기; `scripts/e2e-target.mjs`는 프로젝트 측 생성물이라 surface가 아니다)
- docs/00-meta/STRUCTURE.md (승인 스냅샷 행)
```
- ADR-059 `## 결정` D4의 해당 불릿(`**판정은 target마다 나므로 실행도 target마다 한다.** validate:e2e 진입점은 **하나로 유지**…`와 `**한 진입점을 두 도구가 다툴 수는 없다**…`) 각 끝에 `(참조 갱신 2026-09: #amend-1 결정 1이 target별 진입점 + 집계로 대체)` 병기. D12 첫 줄 끝에 `(참조 갱신 2026-09: #amend-1 결정 4)`.
- `/stack-guard` 6-4 «공통» 문단: `**단 validate:e2e 가 *다른 계열* 로 물려 있으면** … FAIL(wiring) 으로 보고하고 종료한다` → `**target이 둘 이상이면** `validate:e2e:<target>`을 target마다 만들고(native는 `node scripts/e2e-target.mjs <target>` — device id를 실행 시점에 해석하며 `-d` 리터럴은 어디에도 박지 않는다) `validate:e2e`는 집계 진입점으로 배선한다(ADR-059#amend-1). 단일 target은 기존과 같다. 기존 `validate:e2e`가 한 계열로만 물려 있고 새 target이 추가되면 그 계열을 `validate:e2e:<target>`으로 옮기고 집계를 새로 만든다(덮어쓰기 아님 — 이동 사실을 출력에 기록).` 수행 5의 `둘 이상이면 target 마다 npm run validate:e2e -- -d <device id> 로` → `둘 이상이면 `validate:e2e:<target>`을 target마다(집계 `validate:e2e` 1회로 대체 가능)`.
- `/stabilize-milestone` 3-b: `진입점은 validate:e2e 하나이므로 target이 둘 이상이면 npm run validate:e2e -- -d <device id> 로 target마다 한 번씩 호출한다` → `target이 둘 이상이면 `validate:e2e:<target>`을 target마다(또는 집계 `validate:e2e` 1회) 호출하고 target별 구조화 출력으로 각각 판정한다(ADR-059#amend-1)`.
- `/stack-guard` 6-4 native 3항(`validate:e2e 진입점을 **flutter test integration_test 로 박는다 — -d 를 넣지 않는다.**`) 끝에 `(참조 갱신: target이 둘 이상이면 target별 진입점은 `scripts/e2e-target.mjs`가 실행 시점에 id를 해석한다 — ADR-059#amend-1 결정 1. 진입점 문자열에 id를 박지 않는 원칙은 불변)` 병기. 6-4에 `scripts/e2e-target.mjs` 생성 항목(입력: target 이름 → registry 선택 규칙 + `flutter devices --machine` → `flutter test integration_test -d <id>` 실행, 후보 0이면 `BLOCKED_ENV` 종료코드·메시지)을 추가한다.
- `STACK_SETUP_PLAN_TEMPLATE.md ## E2E Smoke Registry` 주석에 `진입점은 target별 validate:e2e:<target> + 집계 validate:e2e (ADR-059#amend-1). 단일 target은 validate:e2e 하나. native 진입점은 scripts/e2e-target.mjs가 이 칸의 선택 규칙을 실행 시점에 device id로 해석한다(칸의 문자열은 여전히 명령에 그대로 들어가지 않는다).` 추가.


### P5-9. `.claude/skills/plan-milestone/SKILL.md` — R5 제거 + Exit 분기
- (a) frontmatter `allowed-tools:` 전체 → `allowed-tools: Read Glob Grep Write Edit Agent`.
- (b) 첫 문단 `메인 세션이 R0~R4(+UI 마일스톤은 R5 프로토타입 라운드)를 직접 운전해` → `메인 세션이 R0~R4를 직접 운전해`. 이어지는 입력 분기 (a)에 추가: `**UI 마일스톤(ADR-073 D9)의 draft M이 R0~R4를 모두 마쳤으면 라운드를 재실행하지 않고 «다음: `/design-milestone M<N>`»만 안내한다**(화면 층은 그 skill 소관 — ADR-072 D8).` (b)의 `계약 수정 요청이면 해당 라운드부터 재개하고` 뒤에 `(텍스트 계약 — 화면·PX·스냅샷 층은 `/design-milestone M<N>` 재진입)`.
- (c) `각 라운드(R0~R5) 산출물은` → `각 라운드(R0~R4) 산출물은`. Codex 문단 `R2의 architect·R5-2의 designer 단발 sub-call은` → `R2의 architect 단발 sub-call은`.
- (d) `반드시 먼저 읽을 파일`에서 `- UI R5를 수행할 때 docs/00-meta/STACK_SETUP_PLAN.md ## Design Gate Adapter …` 줄 삭제.
- (e) R3 불릿 `**R2 분할이 식별한 *후속* 마일스톤은 지금 Mx 문서를 만들지 않는다 — 그 마일스톤의 feature 문서·R5 프로토타입도 만들지 않는다** (로드맵 Next/Later에 얇은 행(미번호 (M?))으로만; R4 컴포넌트·R5 프로토타입은 지금 착수하는 Now 마일스톤의 화면에만 적용). 후속 마일스톤의 feature·프로토타입은 그 마일스톤이 *Now가 되는 회차*에 생성한다.` → `**R2 분할이 식별한 *후속* 마일스톤은 지금 Mx 문서를 만들지 않는다 — 그 마일스톤의 feature 문서·화면 프로토타입(`/design-milestone`)도 만들지 않는다** (로드맵 Next/Later에 얇은 행으로만). 후속 마일스톤의 feature·프로토타입은 그 마일스톤이 *Now가 되는 회차*에 생성한다.`
- (f) R4에 불릿 추가: `- **UI feature 표시**: 화면이 있는 feature는 `## 11. 관련 문서`의 `Design:` 줄을 채운다(DESIGN.md 링크). 이 줄이 UI feature·UI 마일스톤 판정 신호다(ADR-073 D9). 비-UI feature는 그 줄을 삭제한다.`
- (g) `**R5 — 프로토타입 라운드 (경험 계약, UI 마일스톤 한정 — ADR-056)**` 헤딩부터 R5-5의 5(정리)까지 **전부 삭제**. 그 자리에 한 단락:
  ```
  **(UI 마일스톤) 화면 층은 본 skill이 만들지 않는다 (ADR-072 D8)**: 화면 목록·전환표·브리프·코드 프로토타입·스냅샷·PX 인벤토리·`## 9` 전환표는 `/design-milestone M<N>`이 채운다. R4 종료 시 `## 9`는 비워 둔다(«(해당 없음)» 기입 금지 — design-milestone R1이 판정).
  ```
- (h) `**Exit — 확정 재대조 → contract-ready (ADR-060 D6)**` 문단 교체:
  ```
  **Exit — 확정 재대조 (ADR-060 D6 / ADR-072 D8)**: 종료 전 마일스톤 `## 3` ↔ feature `## 3` ↔ feature `## 7` FAC 정합을 재대조한다(`## 7-1`은 shell). 불일치면 해당 라운드로.
  - **비-UI 마일스톤**: 재대조 통과 + `DECISION_REGISTER.md`의 이 M `영향:` 및 `(미할당)` `status: open` 0건일 때만 **feature 먼저, M 마지막** `contract-ready`. open이 남으면 보류 + D-NNN 보고. 원장 부재는 echo 후 skip.
  - **UI 마일스톤(산하 feature `Design:` 줄 ≥1)**: 재대조만 통과시키고 **`draft` 유지**. `contract-ready` 전환은 `/design-milestone M<N>`이 화면 층 정합(프로토타입↔`## 3`↔PX↔`## 9`)까지 본 뒤 수행한다. 출력에 «다음: `/design-milestone M<N>`».
  ```
  이어지는 `**contract-ready는 잠금이 아니다**`·`**계획 잠금**`·`**단계별 출구**` 문단은 유지하되 단계별 출구의 `M·전 feature가 contract-ready가 된 뒤에만 /plan-workitem M<N>을 안내한다` → `비-UI는 M·전 feature가 `contract-ready`가 된 뒤 `/plan-workitem M<N>`, UI는 `draft` 상태에서 `/design-milestone M<N>`을 안내한다`.
- (i) `종료 후: 사용자가 /clear 권장 — R0~R5 인터랙션이` → `R0~R4 인터랙션이`.
- (j) 마지막 출력의 `— (UI 마일스톤) 승인 프로토타입 경로 목록 + 면제 feature 목록` 삭제 → `— (UI 마일스톤) `draft` 유지·화면 층은 `/design-milestone M<N>``. `다음 단계` 블록의 `- 기본 권장: /plan-workitem M<N> — …` 앞에 `- (UI 마일스톤) 기본 권장: `/design-milestone M<N>` — 화면 브리프·코드 프로토타입·스냅샷·PX 인벤토리 완성 후 `contract-ready`. 그 뒤 `/plan-workitem M<N>`.` 추가하고 기존 줄 앞에 `(비-UI)` 표기. 분기 옵션의 `M/F scope·FAC·프로토타입·PX 층 finding도 repair-plan이` → `M/F scope·FAC 층 finding은 repair-plan이, 프로토타입·PX 층은 `/design-milestone` 재진입이`.
- (k) 문서 내 `ADR-056`·`ADR-027#…` 인용 재지정(부록 A·B).

### P5-10. `.claude/skills/plan-workitem/SKILL.md`
- (a) 입구 상태 확인 `draft(plan-milestone 미완)면 "plan-milestone으로 계약 확정 먼저" 안내 후 종료` → `draft면 — 비-UI 마일스톤은 "`/plan-milestone M<N>`으로 계약 확정 먼저", UI 마일스톤(feature `Design:` 줄 ≥1)은 "`/design-milestone M<N>`으로 화면 층 확정 먼저" 안내 후 종료(ADR-072 D8)`.
- (b) 경험 계약 입구 점검 문단 교체:
  ```
  - **경험 계약 입구 점검 (ADR-072 D9 / ADR-007#amend-5)**: 입력 feature가 **UI 확정**(ADR-073 D9)인데 (a) feature `## 7`에 `프로토타입: <screen id> (manifest: …)` 참조도 없고 (b) `프로토타입 면제: <사유>`도 없으면 — task 0건 상태로 중단하고 `Needs Experience Contract` + «`/design-milestone M<N>`으로 화면 층을 완성한 뒤 재실행»을 안내한다. 참조가 있으면 `docs/20-system/prototypes/M<N>/manifest.json`에 그 screen id가 실재하고 `approved.date`·`snapshots[]`가 채워졌는지 확인한다(없으면 같은 안내). 봉인 완료 M에서 발견되면 상위 P0로 사용자 보고. **UI 의심**은 경고 1줄만.
  ```
- (c) 프로토타입 line item 문단(`입력 feature가 UI 확정·비면제이면, feature ## 7의 프로토타입: 참조 줄에서 화면 파일 경로를 회수해 읽고 … - 구현 시 승인 프로토타입 참조 — <경로>의 <상태/섹션>과 동일 상태·문구로 구현 (AC-N)`) 교체:
  ```
  입력 feature가 UI 확정·비면제이면 매니페스트에서 그 화면의 `source[]`·`preview`·`handoff.remaining_wiring[]`를 회수해(코드 전문은 읽지 않는다 — 경로·PX·남은 배선만), 그 화면을 구현하는 *모든* UI task `## 3`에 **재사용 line item**을 authoring한다(builder는 기계 실행 — ADR-072 D5-3). 형식: `- 승인 UI 재사용: <컴포넌트 경로> (manifest: <screen id>) — 배선만: <데이터/권한/저장/라우팅 연결 항목> (AC-N)`. 표현(마크업·스타일·카피)을 다시 쓰는 line item은 만들지 않는다. 배선 항목은 `handoff.remaining_wiring[]`에서 가져온다. 매니페스트 `product_entry`가 `null`이면 라우팅을 확정하는 배선 task에 `- product_entry 확정: <route> → docs/20-system/prototypes/M<N>/manifest.json 의 그 화면 product_entry 갱신` line item을 둔다(implement가 실행 — 매니페스트의 다른 필드는 건드리지 않는다).
  ```
  PX↔AC 매핑 문단의 `feature ## 7의 경험 결정(PX): 인벤토리 각 PX를` 유지, `(해당 AC 본문에 (PX-…) 태그 가능)` 유지, `[Plan-FAC-coverage]가 재점검` 유지. 문단 끝에 `PX 원천은 매니페스트 `px[]`와 코드 주석이다(HTML 아님).`
- (d) self-check 9-1 «경험 좁힘 질문 규칙»(ADR-056 결정 4)이 있으면 인용을 `ADR-072 D5`로. 문서 내 `ADR-056` → 부록 B, `ADR-027#…` → 부록 A.

### P5-11. `.claude/skills/validate-plan/SKILL.md` + reviewer `[Plan-FAC-coverage]` 미러
- validate-plan 항목 5 `[Plan-FAC-coverage]`의 `**`docs/20-system/prototypes/M<N>/*.html` glob**(`_drafts/` 제외)로 현재 active 화면 HTML 전체를 회수해 — ① … ⑦ …` 문단에서 source를 교체: `M<N>` 입력이면 `docs/20-system/prototypes/M<N>/manifest.json`의 `screens[]`와 각 `source[]` 파일의 PX 주석(`grep -rn "PX-M<N>-"`)을 회수해 — ① 각 화면 PX ≥1 · ② 문법·화면 id 일치(`^PX-M<N>-<screen>-\d{2,}$`, id의 `<screen>` = 매니페스트 `id`) · ③ 한 화면 source 내 중복 없음 · ④ 코드 PX = 모든 feature `## 7` 인벤토리의 disjoint union(orphan·중복·누락) · ⑤ 각 PX 정확히 1 feature · ⑥ `(id, 설명)` 정확 일치 · ⑦ task `(PX-…)` 태그 ↔ `## 7-3` RHS 일치 — 를 검사한다. **추가 ⑧**: 매니페스트 각 화면의 `snapshots[]` 파일 실재 + `approved.date` 존재 + 각 feature `프로토타입:` id가 매니페스트에 존재(부재 = P0).` 나머지 문장 유지.
- 항목 9 `[Plan-design]`의 `**마일스톤 ## 9. 화면 전환(있으면) owner의 존재하는 각 path type 행(primary/failure/recovery)이 프로토타입·AC에 존재**(ADR-056#amend-3)` → `(… 매니페스트 화면·브리프·AC에 존재 — ADR-072 D1)`. 항목 48 milestone-mode 문구의 `R5-5가 PX 인벤토리만 채우고` → `design-milestone R7이 PX 인벤토리만 채우고`; `승인 프로토타입에 나타나는지` → `매니페스트 화면·브리프에 나타나는지`.
- `reviewer.md` Plan Quality 5 `[Plan-FAC-coverage]`의 ``prototypes/M<N>/*.html` glob(`_drafts` 제외)로` → ``prototypes/M<N>/manifest.json` + source PX 주석으로`, `HTML` 표현 전부 `코드`로, `⑧ 스냅샷·approved·참조 id 실재` 추가. Milestone-Plan Quality 4의 `R5-5` → `design-milestone R7`, `승인 프로토타입` → `매니페스트 화면·브리프`.
- `reviewer.md` Design Consistency 6차원 뒤에 7차원 추가: `7. **[Design-element-rationale]** (ADR-072 D2) — 화면 브리프의 요소 목록에서 근거 4문항(왜 있는가·왜 그 위치·어떤 결정을 돕는가·없으면 무엇이 깨지는가) 중 하나라도 빈 요소, 또는 근거가 브리프의 목적·시나리오와 무관한 요소. (P1)`. «단계 스코프» 문단에 `**브리프(design-milestone R3)** 단계는 렌더 증거 없음 — 문서 기반으로 `[Design-element-rationale]`·`[Design-donts]`·`[Design-voice]`·`[Design-inventory]`만 적용(`[Design-token]`·`[Design-state]`·`[Design-a11y]`는 R6 픽셀 단계)` 추가. 호출자 목록에 `design-milestone R3(브리프)·R6(픽셀)` 추가.
- 두 파일의 `ADR-056` 인용 → 부록 B.

### P5-12. `.claude/agents/designer.md`
- `- 마일스톤 화면 프로토타입(plan-milestone R5): 확정된 DESIGN.md 토큰(:root CSS 변수만 참조 — 정의 블록 밖 raw hex 금지) 위에서 …` 불릿 전체 → 
  ```
  - 화면 브리프(design-milestone R3): 화면마다 `docs/20-system/prototypes/M<N>/briefs/<screen>.md`를 쓴다 — 목적(비즈니스 목표·시나리오) / 사용자 상황 / 브랜드 정체성 부합(DESIGN `## 1`) / 정보 위계 / **요소 목록(각 요소의 근거 4문항: 왜 있는가·왜 그 위치·어떤 결정을 돕는가·없으면 무엇이 깨지는가)** / 상태(못생긴 상태 5종 + category state) / 카피 초안(§10 언어 블록·용어 사전) / 인터랙션 계약(키보드·포커스·취소·확인·콜백) / 접근성 / 프로필·뷰포트 / 재사용 vs 신규(DESIGN `## 7`·이전 M 컴포넌트 대조) / PX 후보 / `구성 불확실` 표시(ADR-072 D2). 근거 없는 요소는 넣지 않는다 — reviewer가 `[Design-element-rationale]`로 잡는다. 코드는 쓰지 않는다(builder에 브리프를 넘긴다).
  - 게이트 repair 되먹임(design-milestone R6): 실패 selector·위젯을 받으면 브리프의 해당 요소 규정을 고치고 builder 재생성을 지시한다(전면 재설계 금지).
  ```
- 규칙 `- 확정 토큰(DESIGN.md)이 존재하는 작업(R5 프로토타입 등)에서는` → `(화면 브리프·테마 스펙 등)에서는`. `ADR-056#amend-1` 인용 → `ADR-072 D3`.

### P5-13. `.claude/agents/builder.md` — UI 제작 계약 모드
- `단순성 self-check` 앞에 절 추가:
  ```
  ## UI 제작 계약 모드 (design-milestone R4·R6 / bootstrap-design R6 dispatch — ADR-072 D3·D5)
  dispatch 입력에 `mode: ui-authoring`이 있으면 아래를 따른다.
  - **presentational만**: props-in / callbacks-out(웹) · 생성자 인자(Flutter). fetch·store·router·영속 저장·환경변수 import 금지. 데이터는 `fixtures.ts` / 갤러리 항목에서만 온다(출처 표기 — ADR-064 D5).
  - **산출물**: 웹 `screens/<screen>/<Screen>.tsx` + `<Screen>.stories.tsx`(브리프의 상태 전부를 스토리로 — happy·긴 제목·빈·로딩·에러·항목 과다·category state; `구성 불확실`이면 `A`/`B`) + `fixtures.ts`. Flutter `lib/screens/<screen>/` + `lib/prototype/main.dart` 갤러리 등록 + `test/screens/<screen>_prototype_test.dart`(프로필 논리 크기 `setSurfaceSize` → `pumpWidget` → `meetsGuideline` 4종 → `FlutterError` 0 → `DESIGN_GATE_OUT`이 있으면 PNG 저장).
  - **토큰만**: DESIGN.md 토큰 배선(`_theme` 경로)만 참조. raw hex·px 리터럴 금지(게이트 `--tokens-only`가 잡는다).
  - **추적 헤더** 파일 상단: `feature: F-NNN | PX: … | DESIGN: §2 <token set>, §7 <components> | 승인: <미정>`. **PX 마커** 주석 `// PX-M<N>-<screen>-NN: <한 줄>`(브리프의 PX 후보 id 그대로).
  - **TDD**: 시각 탐색 코드에 Red-first를 요구하지 않는다. 브리프의 **인터랙션 계약**만 스토리 interaction test(웹) 또는 위젯 테스트(Flutter)로 쓴다 — 키보드 도달·포커스 순서·취소·확인·콜백 호출. 반환에 «Red 관측» 대신 «인터랙션 계약 테스트 N건 통과»를 적는다.
  - 반환: 경로·PX 목록·상태 목록·남은 리스크만(코드 전문 금지).

  ## 승인 UI 재사용 (implement dispatch에 `- 승인 UI 재사용:` line item이 있을 때 — ADR-072 D5-3)
  - 그 컴포넌트의 표현(마크업·스타일·카피·스토리)을 **다시 쓰지 않는다**. 배선만 한다 — props에 실제 데이터, 콜백에 저장·라우팅·권한 연결, 로딩·에러 상태를 실제 소스에 연결.
  - 표현을 바꿔야만 AC를 만족하면 멈추고 `Needs Plan Decision: 승인 UI 변경 필요 — <무엇>`으로 보고한다(재승인 경로 — 다음 M 또는 design-milestone).
  - Red 관측은 **배선 AC에 대해서만** 보고한다. 이미 통과하는 표현 테스트를 Red였다고 적지 않는다(가짜 Red 금지).
  ```
- 기존 `**AC ambiguity 하드스탑**` 문장의 `(경험 계약 — ADR-056)` → `(경험 계약 — ADR-072 D5)`. `ADR-027` 인용 → 부록 A.

### P5-14. `.claude/agents/validator.md` + `.claude/skills/validate-workitem/SKILL.md`
- validator UI 항목(`- UI: 본 task 가 새 컴포넌트를 추가했는가? …`) 끝에 추가: `**승인 UI 재사용 점검 (ADR-072 D5-4)**: task `## 3`에 `- 승인 UI 재사용:` line item이 있으면 그 컴포넌트 파일의 diff가 배선(props·데이터·이벤트·상태 소스 연결)에 한정되는지 본다. 표현(마크업·스타일·카피·스토리) 변경이 있는데 같은 M 재승인도 다음 M 매니페스트 `supersedes` 등재도 없으면 `P1 [Design-reuse-drift] <file> — 승인 UI 표현 변경, 재승인 미등재`. 게이트 `--manifest` 재실행(그 화면만)으로 blocker가 새로 생기면 `P0`.`
- validate-workitem 5축 UI 항목(`- **UI 프로젝트 — Design inventory audit** …`) 끝에 같은 취지 1줄(`… `P1 [Design-reuse-drift]` (ADR-072 D5-4)`) + «task `## 3`에 `승인 UI 재사용` line item이 있고 diff가 그 화면의 매니페스트 `source[]`를 건드릴 때만» `validate:design -- --manifest <M> --only <screen id>` 실행(allowed-tools에 `Bash(npm run validate:design*)` 등 4 PM 변형 추가 — 없으면 추가). 그 외 task는 게이트를 돌리지 않는다(task마다 Storybook 재빌드 비용). `ADR-027#amend-1` → 부록 A.

### P5-15. `.claude/skills/stabilize-milestone/SKILL.md` — §3-V·§1.0 항목 8·§5-2
- (a) §3-V 전체((a)~(d) + Codex)를 교체:
  ```
  3-V. **경험 게이트 — 구현 화면 vs 승인 스냅샷 대조 (ADR-072 D7, UI 확정 마일스톤 한정)**: MCP 불요 체계 감사. **실행 자체는 의무 — silent skip 금지**(미실행 사유 echo; 판정은 report-only).
     - (a) `docs/20-system/prototypes/M<N>/manifest.json`을 읽는다(부재 = `blocked-on-env` 아님 — 계약 결함 `P0 [Experience-contract] 매니페스트 부재`). 화면마다 두 렌더를 만든다: **① 스토리/위젯 렌더** — `validate:design -- --manifest <경로> --snapshot docs/40-validation/visual/M-N/proto/`; **② 제품 렌더** — 웹은 dev server 기동(명령은 STACK_SETUP_PLAN·`package.json` `dev`/`start`에서 회수, readiness 대기, 종료 시 kill — 재사용 규칙 기존대로) 후 매니페스트 `product_entry`(`null`이면 «제품 진입점 미기록» 사유 echo + ① 대조만)의 라우트를 프로필 뷰포트로 캡처해 `docs/40-validation/visual/M-N/app/`, Flutter는 통합 테스트 스크린샷이 가능하면 그것, 아니면 `blocked-on-env` 명시(ADR-059#amend-1 결정 4). blocker가 있어 `--snapshot` 복사에서 빠진 화면은 `design-gate-shots/`의 캡처를 ①로 쓴다.
     - (b) 각 화면에 대해 **승인 스냅샷(`snapshots/`) ↔ ① ↔ ②**를 Read(멀티모달)로 나란히 대조한다. 앵커 위계: ① 승인 스냅샷(존재 시) ② DESIGN.md §2/§7/§9/§10 파생 체크리스트(면제·부재 화면). 관점: 레이아웃·상태·카피·토큰 준수 — 픽셀 일치가 아니라 경험 계약 준수. ① vs 승인 스냅샷 불일치는 «승인 후 UI 코드 변경»이므로 같은 M 재승인 또는 다음 M `supersedes` 등재 여부를 함께 본다. 화면의 현재 기준선은 «가장 최근 M의 등록·supersedes»다(ADR-072 D5-5).
     - (c) 불일치는 QA_FINDINGS에 `P1 [Experience-drift] <screen> — <1줄> (앵커: 스냅샷|DESIGN 파생 / 렌더: proto|app)` report-only. 판독 불확실은 «판독 불확실» 명시. 시각 불일치가 봉인 AC·PX↔AC 위반을 동반하고 재현되면 그것은 별도 P0 결함(재현 줄 포함)으로 등재한다(ADR-070 D1).
     - (d) 단계 8 출력에 갤러리 경로 + «사용자 육안 확인은 `/accept-milestone <M>`이 수행한다» 1줄. 관측 modality AC가 1건이라도 있으면 사실상 필수 경로(ADR-068 D3).
     - Codex: 캡처까지 수행 + 대조는 «사용자 수동 검토» 안내로 degrade.
  ```
- (b) §1.0 항목 8 (a) 표의 `## Design Gate Adapter` 행은 그대로 둔다(`adapter path` 필드가 유지된다). (b) `**design gate digest**` 항목 전체 → `- (b) **design gate canonical 갱신** — `status: ready`인 경우 canonical `.claude/skills/stack-guard/assets/design-gate.mjs`의 SHA-256 ≠ registry `copied-from`이면 `P2 [Guard-drift] design gate canonical 갱신됨 — /stack-guard 재실행 권장`(읽기 전용 — mtime·날짜 비교 없음; sha256 도구 부재 시 skip + 사유 echo).`
- (c) §5-2 웹 계열 제외 `(b) docs/20-system/prototypes/ 하위(자기완결 프로토타입)` 삭제(프로토타입은 이제 소스 트리의 코드 — 검사 대상). 주석 `> 웹 계열의 **제외 (ADR-056#amend-2 — …)**` → `(ADR-072 — 정의/사용처 라인 구분)`.
- (d) 단계 5 design reviewer 입력의 `**렌더 증거**를 주입한다 — §3-V 갤러리 경로(docs/40-validation/visual/M-N/) + visual-qa.spec 최근 결과(존재 시)` → `… §3-V 갤러리 경로(`proto/`·`app/`) + **승인 스냅샷 경로(매니페스트)** + visual-qa.spec 최근 결과`. `(ADR-027#amend-6)` → `(ADR-073 D8)`.
- (e) 단계 8 `(UI) 경험 게이트 결과: [Experience-drift] N건 + 스크린샷 갤러리 경로` 유지. 문서 내 `ADR-056` → 부록 B, `ADR-058#amend-2` → `ADR-072 D6`, `ADR-027#…` → 부록 A.

### P5-16. 나머지 스킬 한 줄씩
- `seal-milestone` 조건 4(`4. **커버리지** — …`) 끝에: `**UI M은 추가로** `docs/20-system/prototypes/M<N>/manifest.json` 존재 + 각 화면 `approved.date`·`snapshots[]` 파일 실재 + 각 UI feature `프로토타입:` id가 매니페스트에 존재(ADR-072 D9). 부재면 봉인 거부 + «`/design-milestone M<N>`».` 봉인 receipt 형식은 불변.
- `implement-workitem` 3-R (b) `UI면 승인 프로토타입 경로가 **실제로 바뀌었거나 사라졌는지**` → `UI면 매니페스트의 그 화면 entry + `source[]` 파일이 **실재하고 approved 상태인지**(ADR-072 D9)`. 3-R 뒤 문장 `(참조 프로토타입 경로 삭제·상위 ## 7/INV 변경 등 계획 전제 붕괴)` → `(매니페스트 entry·source 삭제·상위 `## 7`/INV 변경 등)`. `일반 오류(테스트·타입·구현 누락·프로토타입 세부 불일치)` 유지.
- `accept-milestone` R0 2 `## 7의 프로토타입: 참조 줄` → `## 7의 프로토타입: 참조 줄 + 매니페스트(`snapshots[]`·`handoff.run`)`; R2 5 `승인 프로토타입 경로(docs/20-system/prototypes/M<N>/<screen>.html)를 함께 제시해` → `승인 스냅샷 경로(`docs/20-system/prototypes/M<N>/snapshots/`)와 미리보기 실행 명령(`handoff.run`)을 함께 제시해`. R4/근거의 `프로토타입 경로` → `스냅샷 경로`. R0 2 줄 끝에 `(ADR-072 D9)`를 붙인다(역참조).
- `repair-plan` 4-M `프로토타입 재승인이 필요한 수정(화면 구성·PX 변경)은 직접 고치지 말고 /plan-milestone M<N> 재개를 안내한다(R5 승인 루프가 소유)` → `… `/design-milestone M<N> --screens <id,...>` 재진입을 안내한다(R3~R6 승인 루프가 소유 — ADR-072 D1 (iii))`.
- `amend-ssot` A3 문장 `전파표는 ADR-069 D3가 SSOT이며 여기에 재서술하지 않는다` 뒤에 `(#amend-1 행 포함 — 승인 UI·공용 컴포넌트·토큰 변경 시 재승인 판정)`만 덧붙인다(재서술 금지 규율 유지 — ADR-069#amend-1). `design gate 재실행 필요` 문구 유지.
- `bootstrap-design` R2-G: `**실행 preflight**: STACK_SETUP_PLAN.md ## Design Gate Adapter가 status: ready, capability ADR-058#amend-2/v2, 기록된 source digest(…), fixed conformance PASS인지 모두 확인한다. missing/n/a/needs-install/wiring-fail/lower-version/digest·conformance 누락이면 …` → `**실행 preflight**: `## Design Gate Adapter`가 `status: ready`인지 확인한다. missing/n/a/needs-install/wiring-fail이면 command를 실행하지 않고 … `Needs Design Gate: /stack-guard` …`. `command template의 <html...>에 …을 대입해` → `command template의 args에 `--html docs/20-system/design-concepts/concept-*.html`을 대입해`. `**차단(block) — source-verified current-v2 validate:design adapter가 결정적 계산**` → `**차단(block) — validate:design v3가 결정적 계산(ADR-072 D6)**`. 문서 내 `v2`·`digest`·`conformance` 잔여 문구 전부 정리.

### P5-17. 템플릿
- `FEATURE_TEMPLATE.md` `## 7` 주석의 `프로토타입: [M<N>/<screen>.html](../../20-system/prototypes/M<N>/<screen>.html) (진입: <라우트/상태 진입 메모>)` → `프로토타입: <screen id> (manifest: ../../20-system/prototypes/M<N>/manifest.json, 진입: <story id | flutter entry>)` + 다음 줄 `승인 스냅샷: <snapshots 경로 목록>`. `경험 결정(PX) 인벤토리(ADR-056#amend-1 — plan-milestone R5-5가 승인 프로토타입 HTML의 <!-- PX-… --> 마커를 그대로 복사` → `(ADR-072 D3 — design-milestone R7이 코드 PX 주석 `// PX-…`를 그대로 복사`. `## 7-3` 주석 `(ADR-056#amend-1). /plan-workitem 3-P가 채운다` → `(ADR-072 D3·D9). /plan-workitem이 채운다`. `## 11` `Design:` 줄 주석에 `— 이 줄이 UI feature 신호(ADR-073 D9)` 추가.
- `MILESTONE_TEMPLATE.md` `## 9` 주석 `/plan-milestone R5-1이 채운다.` → `/design-milestone R1이 채운다(ADR-072 D1). plan-milestone은 비워 둔다.` `(ADR-056#amend-3)` → `(ADR-072 D1 — ADR-056#amend-3 승계)`. item 6 예시 주석 `(ADR-056 — 채택 시 …)` → `(ADR-072 D7 — …)`.
- `TASK_TEMPLATE.md` `## 3` 주석에 `- UI task는 `- 승인 UI 재사용: <컴포넌트 경로> (manifest: <screen id>) — 배선만: <…> (AC-N)` line item을 둔다(plan-workitem authoring — ADR-072 D5-3). 표현을 다시 쓰는 line item은 두지 않는다.` 추가. `## 6` 주석 `(ADR-056#amend-1 — …)` → `(ADR-072 D3 — …)`. `## 6-1` 예시 `승인 프로토타입과 대조` → `승인 스냅샷과 대조`. `## 6-2` 주석에 `- design-milestone이 만든 UI 코드의 시각 탐색분은 TDD 대상이 아니다(ADR-072 D5) — 배선 task는 배선 AC에 TDD 적용.` 추가.

### P5-18. ADR-069 `## Amendment 1` + `amend-ssot` 미러
- ADR-069 끝에 append:
  ```markdown
  <a id="adr-069-amend-1"></a>
  ## Amendment 1 (2026-09-11) — D3 전파표에 승인 UI 코드·공용 컴포넌트·토큰 행 추가
  ### 결정
  D3 표에 행을 더한다: `| 승인 UI 코드(프로토타입)·공용 컴포넌트·DESIGN 토큰 변경 | 그 컴포넌트·토큰을 쓰는 승인 화면(전 M 매니페스트 `source[]`·`supersedes[]`) | 재승인 판정 — 봉인 전이면 `/design-milestone M<N> --screens <id>` 재진입(같은 M 대체), 봉인 후면 다음 M 매니페스트에 `supersedes`로 재등록(이전 M 불변 — ADR-072 D5-5) |`. DESIGN 행의 «함께 볼 곳»에 `매니페스트·승인 스냅샷`을 더한다.
  ### 강도 (ADR-022)
  - enabling(약) — 표 행 추가.
  ### 적용 surface
  - .claude/skills/amend-ssot/SKILL.md (A3 인용 줄에 #amend-1 표기 — 전파표 재서술 없음)
  ```
- `amend-ssot/SKILL.md`는 전파표를 재서술하지 않는다(A3 규율). D3 인용 줄에 `(#amend-1 행 포함 — ADR-069#amend-1 · ADR-072 D5-5)`만 병기한다(역참조).

### P5-19. `.gitignore`
- `# milestone experience contract (ADR-056): prototypes/M<N>/<screen>.html 승인본은 커밋 대상(ignore 금지).`·`# 탐색 시안(_drafts)과 스크린샷 갤러리만 ephemeral.`·`docs/20-system/prototypes/*/_drafts/` 세 줄 → 
  ```
  # milestone experience contract (ADR-072): prototypes/M<N>/{manifest.json,briefs/,snapshots/} 승인본은 커밋 대상(ignore 금지). 스크린샷 갤러리만 ephemeral.
  ```
- `# canonical validate:design output (다른 output path는 stack-guard가 첫 실행 전에 추가 — ADR-058#amend-2)` → `(… — ADR-072 D6)`. 아래에 `design-gate-storybook/` 추가.

### P5-20. 참조 갱신 줄
- `ADR-060` D7 «Seal은 내용을 수정하지 않고…» 문단 앞: `> 참조 갱신 (2026-09): 봉인 전 UI presentational 코드·스토리·fixture·위젯 테스트 작성은 [ADR-072](ADR-072-design-milestone-and-code-prototype.md) D5(UI 제작 계약)가 명시 예외로 허용한다. 그 외 «봉인 전 구현 없음»은 불변.`
- `ADR-009` 본문 첫 `## 결정` 절 끝(첫 amendment 헤딩 앞): `> 참조 갱신 (2026-09): `/design-milestone`이 만드는 시각 탐색 UI 코드는 Red-first 대상이 아니며 행동 계약은 게이트·interaction/위젯 테스트가 검사한다([ADR-072](ADR-072-design-milestone-and-code-prototype.md) D5). 배선 task는 본 ADR 그대로.`
- `ADR-007` `## Amendment 5` 결정 문장의 `(상세: [ADR-056](ADR-056-milestone-experience-contract.md) 결정 3)` → `(상세: [ADR-072](ADR-072-design-milestone-and-code-prototype.md) D9 — ADR-056 결정 3 승계. 완성 경로는 `/design-milestone M<N>`)`. 같은 문장의 `**UI 확정 feature**(ADR-027#amend-3)` → `(ADR-073 D9)`. 본문 lifecycle 표의 `| 3 | plan | `/plan-milestone`(…) · `/plan-workitem M<N>`(…)` 행의 plan 칸에 `· `/design-milestone M<N>`(UI M 화면 경험 계약 — plan-milestone 뒤·plan-workitem 앞, ADR-072)`를 끼워 넣는다(새 행 추가 아님 — 표는 단계별 1행).
- `ADR-057` `## Amendment 3` 결정 4의 `프로토타입 반복은 /plan-milestone M<N> 내부(R5-3 사용자 피드백 루프)에서` 끝에 `(참조 갱신 2026-09: 화면 층은 `/design-milestone M<N>` R3~R6 — ADR-072 D1)`.
- `ADR-042`에 `#amend-1`이 ADR-056을 인용하면 `(현재 SSOT: ADR-073 D6)` 병기.
- `ADR-063` — (a) `## Surfaces`의 `.claude/skills/stack-guard/assets/design-gate-conformance.mjs — D1 환경 실패 승계(spawn 실패 → exit 2)` 행을 `.claude/skills/stack-guard/assets/design-gate.mjs — D1 환경 실패 승계(spawn 실패 → exit 2; v3 자가 검사·Storybook 빌드·Flutter 러너의 spawnSync 3분기)`로 교체(참조 갱신 — 대상 파일 이동). (b) D1의 `**같은 원리를 design gate conformance 에도 적용한다**:` 문단 첫머리에 `> 참조 갱신 (2026-09): `design-gate-conformance.mjs`는 [ADR-072](ADR-072-design-milestone-and-code-prototype.md) D6이 폐지했다. 아래 spawn 3분기(기동 실패 → exit 2 / 기동 후 실패 → exit 1 / adapter exit 2 승계)는 v3 `design-gate.mjs`의 `--self-test`·Storybook 빌드·Flutter 러너 spawnSync에 그대로 적용된다.` (c) `## Mutation Contract` 1 Target의 `design-gate-conformance.mjs 의 spawn 실패 분기` → `design-gate.mjs(v3) 의 spawn 실행 분기`(B 낡은 지시 재작성). (d) 배경의 `design-gate*.mjs` 언급은 기록으로 두되 줄 끝에 `(현재 SSOT: ADR-072 D6)` 병기.

### P5-21. 커밋
```
docs(adr): add ADR-072 design milestone, code prototype and UI authoring contract; supersede ADR-056
feat(skills): add design-milestone skill and split prototype round out of plan-milestone
feat(stack-guard): replace design gate with v3 manifest mode and install-time self-test
docs(adr): amend ADR-059 with per-target e2e entries and native approval snapshots
feat(skills): rewire plan-workitem, validate-plan, seal, implement, validate, accept and stabilize to manifest and snapshots
```


---

## Phase 6. 로스터·인덱스·인용 재지정

### P6-1. 스킬 로스터
- `docs/00-meta/STRUCTURE.md` `Claude skill 본문` 행: `(26종 — bootstrap-project/…/amend-ssot)` → `(27종 — …/bootstrap-design/**design-milestone**/discover-product/…)` — 목록에 `design-milestone`을 `bootstrap-design` 다음에 삽입하고 종 수를 27로.
- `Codex skill wrapper` 행: 변화 없음(목록 SSOT는 README).
- 산출물 표 `milestone 승인 프로토타입 (UI only — 경험 계약, 화면 단위)` 행 → 세 행으로 교체:
  ```
  | 화면 브리프 (UI only) | `docs/20-system/prototypes/M<N>/briefs/<screen>.md` | `/design-milestone` R3 (designer) | Record | conditional |
  | 화면 매니페스트 + 승인 스냅샷 (UI only — 경험 계약 색인·동결 기준선, ADR-072 D3·D4 / native 스냅샷 ADR-059#amend-1) | `docs/20-system/prototypes/M<N>/manifest.json`, `snapshots/*.png` | `/design-milestone` R6~R7 (draft M 재실행으로 재개) | Record | conditional |
  | 코드 프로토타입 (UI only — presentational 컴포넌트·스토리·fixture·위젯 테스트) | ARCH `## 3-1` 트리의 `screens/<screen>/` · `lib/screens/<screen>/` · `lib/prototype/main.dart` · `test/screens/*_prototype_test.dart` | `/design-milestone` R4 (builder) → 구현 task가 배선(ADR-072 D5) | Living | conditional |
  ```
- `design gate canonical assets` 행 경로 `design-gate*.mjs` → `design-gate.mjs (v3)`, 설명에 `ADR-072 D6` 추가. `design gate adapter (UI)` 행 설명 `(UI 판정 뒤 생성·self-test)` 유지.
- `feature` 행 생성 주체에 `/design-milestone`(`## 7` 프로토타입 참조·PX 인벤토리) 추가. `milestone` 행에 `/design-milestone`(`## 9` 전환표·`contract-ready`) 추가.
- Canonical Owner 표의 `UI 시각 디자인` 행에 `화면 경험 계약 = 매니페스트 + 스냅샷 + 브리프(ADR-072) / DESIGN 내용·프로필 계약 = ADR-073` 부기(역참조).

### P6-2. WORKFLOW·DELEGATION·CHECKLIST·GUARDRAILS
- `WORKFLOW.md` 줄 15 `마일스톤·feature 문서는 첫 마일스톤(M1)부터 /plan-milestone이 만든다` 뒤에 `UI 마일스톤은 `/design-milestone M<N>`이 화면 층(브리프·코드 프로토타입·스냅샷·PX)을 확정해 `contract-ready`로 올린다(ADR-072).`; 줄 22 `(UI 마일스톤) /plan-milestone R5 프로토타입 라운드가 화면 경험 계약(승인 프로토타입 — docs/20-system/prototypes/M<N>/)을 확정한 뒤 task 분해로 진행한다. UI 확정 feature는 승인 프로토타입(또는 면제 기록) 없이 /plan-workitem 분해가 차단된다 (ADR-056).` → `(UI 마일스톤) `/design-milestone M<N>`이 화면 경험 계약(매니페스트·승인 스냅샷·코드 프로토타입 — `docs/20-system/prototypes/M<N>/`)을 확정한 뒤 task 분해로 진행한다. UI 확정 feature는 매니페스트 참조(또는 면제 기록) 없이 `/plan-workitem` 분해가 차단된다 (ADR-072 D9).`
- lifecycle 다이어그램 첫 줄 `discover → bootstrap → plan-milestone(+UI: 프로토타입 라운드) → [M/F = contract-ready]` → `discover → bootstrap → plan-milestone → (UI) design-milestone → [M/F = contract-ready]`. `→ stabilize(+UI: 경험 게이트)` 유지.
- 상태 전이 표 `(M/F) draft → contract-ready` 조건 `plan-milestone 라운드 완료 + 확정 재대조 통과 + …` → `비-UI: plan-milestone 라운드 완료 / UI: design-milestone R7 완료(매니페스트·스냅샷·PX) + 확정 재대조 통과 + …`.
- `DELEGATION_STRATEGY.md` 위임 표 designer 행 `/bootstrap-design R0~R2·plan-milestone R5가 호출` → `/bootstrap-design R0~R2·/design-milestone R3(브리프)가 호출. 코드는 builder(UI 제작 계약 모드)`. builder 행 `| task 문서가 존재하는 구현 작업 | builder | 범위 밖 변경 금지 |`의 셋째 칸에 ` UI 제작 계약 모드(dispatch `mode: ui-authoring` — design-milestone R4·bootstrap-design R6, ADR-072 D5)` 부기. reviewer 행에 `design-milestone R3 브리프 비평·R6 픽셀` 추가. `## 스킬 실행 순서 가이드` 3번 `/plan-milestone → (M1 포함) milestone + feature 문서 생성 → **M/F contract-ready** (+UI: R5 프로토타입 라운드) / /plan-workitem M<N> → …` → `/plan-milestone → milestone + feature 문서(비-UI는 `contract-ready`, UI는 `draft`) → (UI) `/design-milestone M<N>` → `contract-ready` / `/plan-workitem M<N>` → …`. Mid-project 표에 `| 승인 UI 코드·공용 컴포넌트·토큰 변경 | 봉인 전 /design-milestone 재진입, 봉인 후 다음 M (ADR-069#amend-1) |` 행.
- `PROJECT_START_CHECKLIST.md` `## 4` 첫 항목 `/plan-milestone으로 첫 마일스톤(M1)과 feature 문서를 생성했다 (UI 마일스톤이면 R5 프로토타입 라운드까지)` → `… 생성했다 (UI 마일스톤은 `draft`로 남는다)` + 새 항목 `- [ ] (UI 마일스톤) `/design-milestone M1`로 화면 브리프·코드 프로토타입·승인 스냅샷을 확정하고 M1/F를 `contract-ready`로 올렸다. 권장 커밋 메시지로 커밋했다 (ADR-072)`. `M1 / F-NNN은 /plan-milestone이 contract-ready까지 올렸다` → `M1 / F-NNN은 `/plan-milestone`(비-UI) 또는 `/design-milestone`(UI)이 `contract-ready`까지 올렸다`.
- `GUARDRAILS_STRATEGY.md` stack-guard 산출물 범위 항목 `UI 판정 시에만 JIT canonical asset을 project-native validate:design adapter로 물질화하고 fixed conformance를 실행한 뒤 … capability version·source digest를 기록한다(ADR-058#amend-2)` → `UI 판정 시에만 design gate v3 asset을 project-native `validate:design`으로 물질화하고 자가 검사(4케이스)를 통과시킨 뒤 `## Design Gate Adapter`(6필드)에 기록한다(ADR-072 D6)`. 유지 주기 표에 행 `| UI 화면 승인 시 | `validate:design --manifest` + reviewer 픽셀 판정 + 스냅샷 동결 | `/design-milestone` R6 |`.

### P6-3. README 2종
- `README.md` 줄 26 `→ /plan-milestone (+UI: R5 prototype round) → /plan-workitem M1 (batch)` → `→ /plan-milestone → /design-milestone M1 (UI only — screen briefs with element rationale, stack-native code prototypes with Storybook/Flutter gallery, gate + frozen approval snapshots) [ADR-072] → /plan-workitem M1 (batch)`. 줄 25 bootstrap-design 설명에 `reference gallery (curated hubs, live captures, your own screenshots, DESIGN.md analyses) + native theme showcase` 반영하고 `then a temporary design-preview.html for final review; mockups removed after approval` 문구를 `then a native theme showcase kept as code; concept mockups removed after approval`로 바꾼다(존재하지 않게 될 산출물 이름 제거). `[ADR-058]` 유지.
- 줄 119 wrapper 목록에 `$design-milestone` 추가(`$plan-milestone` 뒤). 줄 122 예시에 `$design-milestone M1` 추가. 자연어 목록(bootstrap-design 포함)은 불변.
- `README_ko.md` 같은 위치를 한국어로 동일 갱신(줄 26·25·118·121 — 줄 25의 `최종 검토용 design-preview.html, 승인 후 시안 삭제`도 `네이티브 테마 쇼케이스(코드로 유지), 승인 후 concept 시안 삭제`로).
- 두 README의 «자연어 호출» 두 위치는 그대로(stabilize §1.0 7 검사: `(.claude/skills 집합) − (.agents/skills 집합)` = 자연어 목록 — design-milestone은 wrapper가 있으므로 자연어 목록에 넣지 않는다).

### P6-4. ADR 인덱스 — `docs/90-decisions/boilerplate/README.md`
- 행 추가(형식은 기존 행과 동일 — `| 번호 | 제목 | 상태 | Amendments | 요약 |`):
  ```
  | 070 | finding 심각도·종결·수렴 계약 | accepted | — | P0 정의표 + 재현 필수 + 채택 전 5값 검토 + 4-판정 전부 종결 + 원인 단위·영향 반경 재감사 + 라운드 예산 3·수렴 실패 브리프(면제값 없음) |
  | 071 | 스택 결정 카탈로그 + 스캐폴드 소유 | accepted | — | 카탈로그 색인 + registry disposition 필수 + BASE/HYBRID/DEEP + /stack-guard 수행 0 스캐폴드·6-2-b baseline 라이브러리(Storybook 포함) — ADR-052 D1·055·063 D1 부분 supersede |
  | 072 | 디자인 마일스톤 + 코드 프로토타입 + UI 제작 계약 + design gate v3 | accepted | — | ADR-056 supersede. /design-milestone(브리프→코드→게이트→스냅샷→contract-ready) + 매니페스트 + 승인 스냅샷 + UI 제작 계약(봉인 전 예외·가짜 Red 금지·재사용 추적) + gate v3(매니페스트 모드·자가 검사 — ADR-058#amend-2 대체) |
  | 073 | 인터페이스 결정 책임 분배 + DESIGN.md 내용 계약 v2 | accepted | — | ADR-027 통합 재발행. 프로필(웹+앱 단일 파일) + §3 폰트 블록 + §10 언어별 렌즈·용어 사전 + §9 플랫폼 관례 예외 + §11 기준 자료 확인일 + cross-surface·UI 판정 통합 |
  ```
- 기존 행 갱신: `027` 상태 `accepted` → `superseded`, 요약 끝 `→ ADR-073으로 통합 재발행 (현재 SSOT: ADR-073)`. `056` 상태 → `superseded`, 요약 끝 `→ ADR-072로 supersede (현재 SSOT: ADR-072)`. `004` Amendments `+#amend-4`(P3-4). `058` Amendments `, +#amend-4: 레퍼런스 갤러리 + R6 네이티브 쇼케이스 + 게이트 실행물 ADR-072 이관`. `059` Amendments `+#amend-1: target별 e2e 진입점·승인 스냅샷·Flutter gate 어댑터`. `069` Amendments `+#amend-1: 승인 UI·공용 컴포넌트 전파 행`.
- `docs/90-decisions/README.md` 허브에 070~073 링크가 필요하면(기존 형식이 개별 링크를 두는 경우에만) 추가.

### P6-5. 인용 재지정 — ADR-027 → ADR-073, ADR-056 → ADR-072
0. **AGENTS.md 먼저**: `AGENTS.md`의 `[인터페이스 결정 책임 분배](docs/90-decisions/boilerplate/ADR-027-interface-decision-allocation.md)` 링크를 ADR-073 파일명·제목으로 바꾼다(프로젝트 진입 문서 — 100줄 cap 유지, 한 줄 교체).
1. 목록 뽑기:
   ```bash
   grep -rn --exclude-dir=.git --exclude-dir=node_modules -e "ADR-027" -e "ADR-056" . | grep -v "^./IMPROVE-GUIDE.md" > /tmp/cite-027-056.txt
   wc -l /tmp/cite-027-056.txt
   ```
   규모(2026-09-11 실측): ADR-027 46파일/156줄, ADR-056 29파일/83줄, ADR-058#amend-2 16파일/31줄 ≈ 270줄. **가이드에서 가장 큰 미명세 작업이다 — 별도 세션에서 파일 단위로 처리**하고, 파일마다 처리 후 `bash /tmp/check-refs.sh`를 증분 실행한다. 목록 파일에 처리 표시(`[x] <path>`)를 남겨 재개 가능하게 한다.
2. 각 줄을 ADR-045 D10 5종으로 분류한다.
   - **A 살아있는 규칙 인용**(skill·agent·템플릿·meta 문서·DESIGN.md·다른 ADR의 유효 결정 본문): 부록 A/B 표로 **재지정**. 앵커가 없는 `ADR-027`·`ADR-056` 단독 인용은 문맥의 결정을 찾아 `ADR-073 D<n>`·`ADR-072 D<n>`으로.
   - **B 낡은 지시**(Mutation Target·Rollback·Surfaces에 죽은 대상): 현재 유효 내용으로 재작성.
   - **C 배경 서술**: 링크 제거 + 산문.
   - **D supersede 선언·인덱스 행**: 유지 + `(현재 SSOT: ADR-073|072)` 줄 끝 병기.
   - **E 실행 기록**(`.boilerplate/validation/SIMULATION_RUN.md`, ADR-045 D6 grandfather 예시, 각 ADR `## Amendment` 본문 안 «당시 규칙» 서술): 유지 + 줄 끝 병기. SIMULATION_RUN 상단 시점 주석에 `ADR-027 → ADR-073 / ADR-056 → ADR-072` 추가.
   - ADR-027·ADR-056 **자기 본문** 안의 자기 인용은 그대로. **superseding ADR(ADR-073·ADR-072) 본문의 ADR-027·ADR-056 인용은 supersede 선언(D)이라 마커 불요** — 검사에서 그 두 파일은 제외한다.
3. 재지정 후 확인:
   ```bash
   grep -rn --exclude-dir=.git -e "ADR-027" -e "ADR-056" . | grep -v "^./IMPROVE-GUIDE.md" | grep -v "(현재 SSOT:" | grep -v "docs/90-decisions/boilerplate/ADR-027-" | grep -v "docs/90-decisions/boilerplate/ADR-056-" | grep -v "docs/90-decisions/boilerplate/ADR-07[23]-" | grep -v "boilerplate/README.md"
   ```
   출력이 0줄이어야 한다(남으면 A/B/C 미처리).
4. `ADR-058#amend-2` 인용도 같은 방식으로 `ADR-072 D6`으로(살아있는 규칙) 또는 병기(기록).
   ```bash
   grep -rn --exclude-dir=.git "ADR-058#amend-2" . | grep -v "^./IMPROVE-GUIDE.md" | grep -v "(현재 SSOT:" | grep -v "ADR-058-design-workflow.md"
   ```

### P6-6. Surfaces 역참조 확인
새 ADR·개정의 `## Surfaces`(또는 «적용 surface»)에 등재한 모든 파일 본문에 해당 `ADR-NNN`(또는 `ADR-NNN#amend-M`) 문자열이 실재해야 한다(stabilize §1.0 2 forward check). 부록 E 스크립트 3번이 검사한다.

### P6-7. 커밋
```
docs: update rosters, workflow, checklists and READMEs for design-milestone and new ADRs
docs(adr): re-point citations from ADR-027 and ADR-056 to ADR-073 and ADR-072
```

---

## Phase 7. 검증 (1회)

### P7-1. 참조 무결성 검사
부록 E 스크립트를 `/tmp/check-refs.sh`로 저장해 실행한다. 검사 1·2·6 `count: 0`, 검사 3(이번 라운드 ADR)·검사 4(ADR-027·ADR-056) `count: 0`, 검사 5 `ok` 4줄이어야 하고, `--all-surfaces`·`--all-dead` 값은 Phase 0 기준선 이하여야 한다. 아니면 해당 Phase로 돌아가 고친다.

### P7-2. dogfood Round 11 — 웹 (Next.js + Tailwind + shadcn/ui + Storybook)
- 별도 디렉터리 `dogfood-web/`에 저장소를 복제(template copy)하고 아래를 순서대로 돌린다(ADR-017 시나리오는 «todo 웹앱 — 목록·추가·완료·삭제 + 빈/오류 상태»).
  1. `/discover-product --fast` → `/bootstrap-project`.
  2. `/bootstrap-stack Next.js + TypeScript + pnpm` (HYBRID — 백엔드·DB 미정 → R1~R2 미결정 T1 행에 한정, R-C 카탈로그 라운드). 확인: registry 빈 행 0, `cat-web-ui-preview: Storybook`.
  3. `/stack-guard`. 확인: `## Scaffold` `.` 행 `done`, 수행 0 직후 보호 경로 검사 통과(`git status --porcelain -- README.md README_ko.md LICENSE AGENTS.md CLAUDE.md docs .claude .codex .agents .boilerplate .github` 비어 있음 — STACK_SETUP_PLAN 갱신은 그 뒤이므로 대상 아님), 생성기 `package.json`에 `validate*` 키만 추가됨, baseline libs 설치(폰트 패키지 없음), probe smoke `PASS`/`PARTIAL`(SKIPPED 아님), e2e boot smoke `PASS`, Design Gate Adapter `ready (self-test PASS …)` + `copied-from` 채움, `design-gate-storybook/` ignore.
  4. `/bootstrap-design` (갤러리 라운드: uibowl.io 1건 + 스토어 스크린샷 1건 + inbox 캡처 1건 + getdesign.md 분석본 2건; R1 공유 모드 «단일» + 폰트 후보 2조합; R6 쇼케이스 승인 후 concept 삭제). 확인: DESIGN `## 0` 표 1행, `## 3` 9항목, `## 10` 언어 블록·용어 사전, `## 11` 표, `_theme/manifest.json`, Storybook `Theme/Showcase` 렌더.
  5. `/plan-milestone` → M1 `draft` + 출력 «다음: /design-milestone M1».
  6. `/design-milestone M1` (화면 3개: list·add·empty-error). 확인: 브리프 3개(요소 근거 — reviewer `[Design-element-rationale]` 발화 여부), reviewer 비평 선행, 스토리 상태별, 게이트 blocker 0, `--tokens-only` 0(렌더 출력 보존 확인), 스냅샷 PNG(500KB 경고 0 또는 사유), `manifest.json` approved + `product_entry`, feature `## 7` PX 인벤토리, M1 `contract-ready`.
  7. `/plan-workitem M1` → task에 `승인 UI 재사용` line item. `/seal-milestone M1`.
  8. `/implement-workitem T-001` 네 조건(P3-1 실험 (a)~(d)) — 같은 task를 격리 사본 4개에서. 기록.
  9. `/implement-workitem` 나머지 → `/validate-workitem`(재사용 diff 배선 한정 확인 — 표현을 일부러 바꿔 `[Design-reuse-drift]` 발화 확인) → `/finalize-workitem`.
  10. `/stabilize-milestone M1`. 확인: 6-S `decision` 필드, §3-V proto/app/스냅샷 3자 대조, 7-T `수렴: round 0`.
  11. P0 하나를 일부러 남기고 `/repair-milestone M1`(round 1) → Reject-FP 1건 만들기 → `/stabilize-milestone`에서 그 ID 재등재 0 확인. round 3까지 반복해 수렴 실패 브리프 발화 확인(선택지 C 선택 → `/plan-milestone`에서 병렬 Now 허용 확인).
- 성공 기준(ADR-017 3개 + 본 라운드): 사용자 개입 ≤1(질문 응답 제외) / 충원율 ≥80% / graduation 미통과 ≤2 / registry 빈 행 0 / 스캐폴드 보호 경로 변경 0 / 재사용 task 표현 diff 0 / Reject 재등재 0 / 자가 검사 PASS(4케이스) / 수렴 실패 브리프가 결정 기록 후 재발화하지 않음.

### P7-3. dogfood Round 12 — Flutter (Android 에뮬레이터)
- `dogfood-flutter/`. 시나리오 «습관 메모 앱(Round 8 승계) — 목록·추가·완료 + 웹 관리자 페이지 1개(프로필 2개 검증용, Next.js 정적)».
  1~3. Round 11과 같되 `/bootstrap-stack Flutter + Android + Next.js admin`(monorepo KEEP-list; iOS는 macOS host에서만 선택 추가 — 선언한 target은 전부 실행 검증한다). 확인: `## Scaffold` `apps/mobile`·`apps/web` 두 행 `done`(각 scope에 생성), `validate:e2e:android`(→ `scripts/e2e-target.mjs android`)·`validate:e2e:web` + 집계 `validate:e2e`, `package.json`에 `-d` 리터럴 없음, Flutter 자가 검사 fixture 2개 생성·`validate`에서 제외.
  4. `/bootstrap-design` — `## 0` 표 2행(consumer-mobile / admin-web, 공통+delta), `lib/theme/*` + `theme_gallery.dart` + 웹 쇼케이스 둘 다, 프로필별 delta 블록 §2·§3에만.
  5~7. `/plan-milestone` → `/design-milestone M1`(앱 화면 2 + 웹 화면 1). 확인: Flutter 위젯 테스트 스냅샷(390×844·360×800) PNG(상태별 파일명), guideline 4종 통과, 웹 화면은 Storybook.
  8~10. 구현 1 task → stabilize. 확인: §3-V native 기본 경로(위젯 스냅샷 재생성 + 승인 스냅샷 대조)가 실행되고, 앱 기동 캡처는 가능하면 수행·불가면 `blocked-on-env`를 명시(두 축을 따로 확인), e2e 판정이 선언 target마다 1건씩.
- 성공 기준: Round 11과 동일 + 프로필 delta가 §2~§10 전 절에 생기지 않음 + 선언 target 전부 e2e `PASS`.

### P7-3b. 회귀 시나리오 (짧게 — Round 11 fork 재사용)
각 항목은 한 번씩만 돌리고 결과를 P7-4 기록에 한 줄씩 남긴다.
- (a) **비-UI 경로**: Round 11 fork에 API-only 마일스톤 M2(feature `Design:` 줄 없음)를 `/plan-milestone`으로 만들어 `contract-ready`로 직행하는지.
- (b) **`/bootstrap-design --fast`**: 별 fork에서 `_theme/manifest.json`·테마 배선이 생기는지(픽셀 판정만 생략).
- (c) **`/bootstrap-design --update`**: 토큰 1개 변경 → R6-1 배선이 delta 재생성되는지.
- (d) **승인 화면 재진입**: `/design-milestone M1 --screens list`로 브리프 delta → 재승인 → 같은 M 스냅샷 대체.
- (e) **부분 완료 재개**: R4 뒤 세션을 끊고 재실행 → 완료 화면 skip, 미완 화면부터 재개.
- (f) **봉인 후 공용 컴포넌트 변경**: M2에서 M1 화면이 쓰는 컴포넌트 변경 → M2 매니페스트 `supersedes` 등록 + M1 매니페스트·스냅샷 `git diff` 0.
- (g) **수렴 브리프 억제**: 선택지 A 기록 뒤 round 4에서 새 P0 없이 브리프가 재발화하지 않는지.

### P7-4. 기록
`.boilerplate/validation/SIMULATION_RUN.md`에 `## Round 11 (2026-09-XX, todo 웹앱 / Next.js + Storybook — ADR-070~073 적용 검증)`·`## Round 12 (…, 습관 메모 앱 + 관리자 웹 / Flutter + Next.js — 프로필·target별 e2e 검증)`·절을 기존 회차 형식(단계별 마찰점 / 성공 기준 충족 / 결정에 미친 영향)으로 append하고, P3-4b가 만든 `## Builder Effort Experiment (ADR-004#amend-4)` stub 절은 헤딩에 측정일을 부기하고 조건 (a)~(d) 결과 표로 채운다. 각 ADR의 Falsifying evaluation 항목별 결과를 표로 남긴다. 실패한 falsifier는 해당 ADR의 재검토 트리거에 따라 조정하고 그 조정도 기록한다.

### P7-5. 커밋
```
docs(validation): record dogfood rounds 11 and 12 and the builder effort experiment
```
그 뒤 본 문서(`IMPROVE-GUIDE.md`)를 삭제한다(사용자 수동).

---

## 부록 A. ADR-027 → ADR-073 앵커 매핑

| ADR-027 인용 | ADR-073 재지정 | 비고 |
|---|---|---|
| `ADR-027` (앵커 없음) | 문맥이 DESIGN 내용이면 `ADR-073 D2`, 인터페이스 할당·7-x면 `ADR-073 D1`, UI 판정이면 `ADR-073 D9`, cross-surface면 `ADR-073 D8` | 문맥으로 판정 |
| `ADR-027#amend-1` | `ADR-073 D8` | cross-surface enforcement |
| `ADR-027#amend-2` | anti-slop·Don'ts → `ADR-073 D5` / lint → `ADR-073 D10` / R5 시안·preview → `ADR-058`(historical) / 비결정 → `ADR-073 D12·D13` | |
| `ADR-027#amend-3` | `ADR-073 D9` | UI 판정 다중신호 |
| `ADR-027#amend-4` | `ADR-073 D11` | --update 내용 규칙 |
| `ADR-027#amend-5` | `ADR-073 D2`(섹션 구성)·`D6`(§10) | |
| `ADR-027#amend-6` | `ADR-073 D8` | 렌더 증거 주입 |
| `ADR-027#amend-7` | a11y·anti-slop → `ADR-073 D5` / 정체성·category state·responsive·tabular → `ADR-073 D2` | |
| `ADR-027#amend-8` | 7-5 자리 → `ADR-073 D1` / 신호 정정 → `ADR-073 D9` | |
| `ADR-027#d5` | `ADR-073 D2` | canonical 8 + 확장 |
| `ADR-027#d8` | `ADR-073 D1` | repo root DESIGN.md 없음 |
| `ADR-027#d6` | `ADR-073 D2` | 3-tier 토큰 |
| `ADR-027#d7` | `ADR-073 D5` | Don'ts 필수 |
| `ADR-027#d16`·`#d18`·`#d19` | `ADR-073 D8` | plan-workitem read-list·validate-plan 차원·stabilize cross-surface (SIMULATION_RUN의 `#d16…#d20`은 E 기록 — 병기) |
| `ADR-027#d21`·`#d22`·`#d26` | `ADR-058`(라운드·preview lifecycle — historical) | |
| `ADR-027#d23` | `ADR-073 D5` | anti-slop |
| `ADR-027#d24` | `ADR-073 D2` | Motion 확장 |
| `ADR-027#d25` | `ADR-073 D10` | lint 권장 |
| `ADR-027#31`·`#d31` | `ADR-060 D9`(부분 supersede) + `ADR-073 D1` | 7-x 채움 authority |
| 그 외 `#dK` | 해당 결정 K의 내용을 위 표의 성격으로 분류해 재지정 | `grep -rho "ADR-027#[a-z0-9-]*" . \| sort -u`로 전수 확인 |

## 부록 B. ADR-056 → ADR-072 매핑

| ADR-056 인용 | ADR-072 재지정 |
|---|---|
| `ADR-056` 결정 1(승인 프로토타입 산출물·SSOT 삼각) | `ADR-072 D3`(코드·매니페스트)·`D4`(스냅샷)·`D9`(삼각) |
| 결정 2(R5 라운드) | `ADR-072 D1`(design-milestone 라운드)·`D8` |
| 결정 3(입구 계약) | `ADR-072 D9` |
| 결정 4(경험 좁힘 질문) | `ADR-072 D5`(builder 하드스탑 비대칭 승계) |
| 결정 5(§3-V) | `ADR-072 D7` |
| 결정 6(렌더 증거) | `ADR-073 D8` |
| 결정 7(grep 오탐 방지) | 폐지 — stabilize §5-2 제외 삭제(P5-15 c) |
| 결정 8~11(§10 Voice) | `ADR-073 D6` |
| 결정 12(경험 축 학습) | `ADR-072`(stabilize 문구 유지 — 인용만 재지정) |
| `#amend-1`(PX 커버리지) | `ADR-072 D3`(마커·소유)·`D9`(PX↔AC·검사) |
| `#amend-2`(raw hex 정의 예외) | `ADR-072`(stabilize §5-2 정의/사용처 구분 — 인용 재지정) |
| `#amend-3`(전환표) | `ADR-072 D1`(R1 전환표)·`D9` |

## 부록 C. 화면 매니페스트 schema (v1)

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
- `snapshots[]` 파일명은 `<screen>-<state>-<w>x<h>.png`. 기준선 집합 = 각 뷰포트 `default` + 1차 뷰포트 `empty`·`error` + `baseline: true` 상태.
- `product_entry`는 제품 라우트·딥링크. design-milestone R7이 `## 9`·ARCH 라우팅에서 채우고, 미정이면 `null` → 배선 task line item이 확정해 implement가 이 필드만 갱신한다. stabilize §3-V ②(제품 렌더)의 입력.
- `supersedes[]`는 이전 M 화면 참조 `M<K>/<screen>` — 공용 컴포넌트·토큰 변경으로 이 M이 그 화면의 기준선을 새로 잡을 때. 이전 M 파일은 불변. 소비자는 «가장 최근 M의 등록·supersedes»를 현재 기준선으로 해석한다.
- `_theme/manifest.json`은 `milestone: "_theme"`, 화면 id `theme-showcase`(프로필별 `theme-showcase-<profile>`), `feature: "—"`, `px: []`, `product_entry: null`.
- 화면 id는 kebab-case이며 숫자로 끝나지 않는다. 게이트는 `version !== 1`이면 exit 2. 필드 추가는 minor로 하되 `version`은 호환 깨질 때만 올린다.

## 부록 D. 스택 결정 카탈로그 초안 (`stack-catalog.md` 본문)

```markdown
# 스택 결정 카탈로그 (ADR-071 D1 — 색인)

> 결정 본문은 정본 앵커에만 적는다. 이 표는 «무엇을 검토해야 하는가»의 색인이며, `/bootstrap-stack` R-C가 프로젝트 유형의 행 전부를 `STACK_SETUP_PLAN.md ## Stack Decision Registry`에 disposition과 함께 옮긴다.
> authority 기본값 기준: 되돌린 뒤 코드·데이터·계정·외부 계약에 파급 → user-approval / 코드 안에서 끝남 → agent-delegated (ADR-060 D9).
> 설치: baseline = /stack-guard 6-2-b가 설치 / task = plan-workitem authoring → implement 설치 / n/a = 패키지 아님. 폰트 패키지·파일은 예외(DESIGN §3 확정 뒤 bootstrap-design R6 배선이 추가 — ADR-071 D6).
> **DESIGN.md는 정본 앵커가 아니다** — 시각 값·폰트 선택·컴포넌트 규칙은 `/bootstrap-design`(ADR-058·ADR-073)이 소유한다. 카탈로그 행은 **라이브러리·방식 선택**(ARCH·ADR-101)만 확정한다. authority는 ADR-060 D2의 3값(user-choice / user-approval / agent-delegated).

## 공통 (전 유형)
| id | 항목 | tier | authority | 설치 | 정본 앵커 | 기본 후보 |
|---|---|---|---|---|---|---|
| cat-common-language-runtime | 언어·런타임·버전 | T1 | user-approval | n/a | ADR-101 | |
| cat-common-package-manager | 패키지 매니저(scope별) | T1 | agent-delegated | n/a | STACK_SETUP_PLAN ## Dependency Tools | npm / pnpm / uv / pub |
| cat-common-repo-layout | 단일/monorepo·디렉터리 트리 | T1 | user-approval | n/a | ARCH ## 3-1 | |
| cat-common-lint-format | lint·format 도구 | T3 | agent-delegated | baseline | ARCH ## 7 (도구) | Biome / ruff / dart format |
| cat-common-test-unit | 단위 테스트 러너 | T3 | agent-delegated | baseline | ARCH ## 7 | Vitest / pytest / flutter test |
| cat-common-test-e2e | e2e 도구(target별) | T2 | agent-delegated | baseline | STACK_SETUP_PLAN ## E2E Smoke Registry | Playwright / integration_test |
| cat-common-ci | CI | T3 | agent-delegated | n/a | STACK_SETUP_PLAN ## CI | GitHub Actions |
| cat-common-hosting-deploy | 호스팅·배포 토폴로지 | T2 | user-approval | n/a | ADR-101 · ARCH ## 7-3/7-5 | |
| cat-common-env-config | 환경변수·설정 관리 방식 | T2 | user-approval | task | ARCH ## 7 (운영 사실) | |
| cat-common-logging | 로깅 포맷·수집 | T3 | agent-delegated | task | ARCH ## 7 (운영성) | |
| cat-common-error-reporting | 에러 리포팅 provider | T3 | user-approval | task | ARCH ## 7 | Sentry |
| cat-common-analytics | 제품 계측 SDK | T3 | user-approval | baseline | ARCH ## 7 (운영 사실 — 이벤트 설계는 FEATURE ## 8-1이 나중에) | |
| cat-common-i18n | 국제화·로케일 | T3 | user-approval | task | ARCH ## 7-4/7-5 | |
| cat-common-datetime | 날짜·숫자 포맷 라이브러리·TZ 정책 | T3 | agent-delegated | task | ARCH ## 7 | |
| cat-common-auth-provider | 인증 provider(정책은 7-3/7-4/7-5) | T2 | user-approval | task | ADR-101 · ARCH ## 7-3 | |
| cat-common-secrets | 비밀 취급 위치·도구 | T2 | user-approval | n/a | ARCH ## 7 · .gitignore | secrets/ 하위 (ADR-059 D9) |
| cat-common-security-scan | secret scanner·의존성 취약점 | T3 | agent-delegated | baseline | ARCH ## 7 | gitleaks · osv-scanner |
| cat-common-license-policy | 배포 라이선스(Charter ## 7) | T1 | user-choice | n/a | Charter ## 7 · LICENSE | |

## web frontend
| id | 항목 | tier | authority | 설치 | 정본 앵커 | 기본 후보 |
|---|---|---|---|---|---|---|
| cat-web-framework | 프레임워크·렌더링 모델 | T1 | user-approval | n/a | ADR-101 · ARCH ## 7-4 (SSR-CSR) | Next.js / Vite+React |
| cat-web-routing | 라우팅 | T2 | user-approval | n/a | ARCH ## 7-4 | 프레임워크 내장 |
| cat-web-styling | 스타일링 방식 | T2 | user-approval | baseline | ARCH ## 7-4 (토큰 배선은 bootstrap-design R6) | Tailwind + CSS 변수 |
| cat-web-ui-kit | UI 킷·컴포넌트 라이브러리 | T2 | user-approval | baseline | ARCH ## 7-4 (컴포넌트 규칙은 DESIGN ## 7 — bootstrap-design) | shadcn/ui |
| cat-web-icons | 아이콘 패키지 | T3 | agent-delegated | baseline | ARCH ## 7-4 (아이콘 스타일 방향은 DESIGN ## 1) | lucide |
| cat-web-fonts-delivery | 폰트 전달 방식(self-host/CDN) | T3 | agent-delegated | n/a | ARCH ## 7-4 (폰트 선택·패키지 추가는 DESIGN ## 3 — bootstrap-design R6) | self-host |
| cat-web-ui-preview | UI 미리보기 도구 | T3 | agent-delegated | baseline | STACK_SETUP_PLAN ## Design Gate Adapter · ARCH ## 7-4 | Storybook (a11y·viewport 애드온만) |
| cat-web-state | 클라이언트 상태관리 | T3 | agent-delegated | task | ARCH ## 7-4 | |
| cat-web-data-fetching | 데이터 fetching·캐시 | T3 | agent-delegated | task | ARCH ## 7-4 | |
| cat-web-forms | 폼·validation | T3 | agent-delegated | task | ARCH ## 7-4 | |
| cat-web-auth-client | 토큰 저장·세션(정책) | T2 | user-approval | task | ARCH ## 7-4 | |
| cat-web-seo | SEO·메타 | T3 | agent-delegated | task | ARCH ## 7-4 | |
| cat-web-a11y-tooling | axe 등 접근성 검사 배선 | T3 | agent-delegated | baseline | STACK_SETUP_PLAN ## Design Gate Adapter | @axe-core/playwright |

## API server
| id | 항목 | tier | authority | 설치 | 정본 앵커 | 기본 후보 |
|---|---|---|---|---|---|---|
| cat-api-framework | 프레임워크 | T1 | user-approval | n/a | ADR-101 · ARCH ## 7-1 | |
| cat-api-db | DB·영속성 | T1 | user-approval | n/a | ADR-101 · ARCH ## 7-3 | |
| cat-api-orm-migration | ORM·마이그레이션 도구 | T2 | user-approval | task | ARCH ## 7-3 (DB migration) | |
| cat-api-auth | 인증·인가 방식 | T2 | user-approval | task | ARCH ## 7-3 | |
| cat-api-versioning | API versioning | T2 | user-approval | n/a | ARCH ## 7-3 | |
| cat-api-envelope | 응답 envelope·페이지네이션 | T2 | user-approval | n/a | ARCH ## 7-1 | |
| cat-api-validation | 입력 validation 라이브러리 | T3 | agent-delegated | task | ARCH ## 7-1 | |
| cat-api-queue-cache | 큐·캐시·비동기 job | T2 | agent-delegated | task | ARCH ## 7-3 | |
| cat-api-email-notify | 이메일·알림 provider | T3 | user-approval | task | ARCH ## 7-3 | |
| cat-api-storage | 파일 저장소 | T2 | user-approval | task | ARCH ## 7-3 | |
| cat-api-payment | 결제 provider(해당 시) | T2 | user-choice | task | ARCH ## 7-3 · Charter ## 7 | |
| cat-api-openapi | API 문서·스키마 | T3 | agent-delegated | task | ARCH ## 7-1 | |
| cat-api-local-deps | 로컬 외부 의존 부트업 | T3 | agent-delegated | n/a | STACK_SETUP_PLAN ## 외부 의존 부트업 | docker compose |

## CLI
| id | 항목 | tier | authority | 설치 | 정본 앵커 | 기본 후보 |
|---|---|---|---|---|---|---|
| cat-cli-framework | 인자 파서·프레임워크 | T1 | agent-delegated | baseline | ADR-101 · ARCH ## 7-2 | |
| cat-cli-output | 출력 포맷(기본 모드·--json) | T2 | user-approval | n/a | ARCH ## 7-2 | |
| cat-cli-config | 설정 파일·위치 | T3 | agent-delegated | task | ARCH ## 7-2 | |
| cat-cli-distribution | 배포 채널(npm/pipx/brew/binary) | T2 | user-approval | n/a | ARCH ## 7-2 · ADR-101 | |

## monorepo
| id | 항목 | tier | authority | 설치 | 정본 앵커 | 기본 후보 |
|---|---|---|---|---|---|---|
| cat-mono-orchestrator | orchestrator | T1 | user-approval | baseline | ADR-101 · ADR-008 | turbo / nx / pnpm workspaces |
| cat-mono-shared | shared 패키지·버전 정책 | T2 | user-approval | n/a | ARCH ## 3-1 | |
| cat-mono-publish | publish 정책 | T2 | user-approval | n/a | ADR-101 | |

## Supabase 통합
| id | 항목 | tier | authority | 설치 | 정본 앵커 | 기본 후보 |
|---|---|---|---|---|---|---|
| cat-supa-auth | Supabase Auth 사용 범위 | T2 | user-approval | task | ARCH ## 7-3 | |
| cat-supa-rls | RLS 정책 소유 | T2 | user-approval | n/a | ARCH ## 7-3 | |
| cat-supa-local | 로컬 개발(supabase start) | T3 | agent-delegated | baseline | STACK_SETUP_PLAN ## 외부 의존 부트업 | |
| cat-supa-migrations | 마이그레이션 흐름 | T2 | user-approval | task | ARCH ## 7-3 | |

## Flutter (Android·iOS)
| id | 항목 | tier | authority | 설치 | 정본 앵커 | 기본 후보 |
|---|---|---|---|---|---|---|
| cat-flutter-framework | Flutter SDK 채널·버전·생성기 | T1 | user-approval | n/a | ADR-101 · ARCH ## 7-5 | stable · `flutter create` |
| cat-flutter-platforms | 대상 플랫폼·최소 OS | T1 | user-approval | n/a | ARCH ## 7-5 | |
| cat-flutter-state | 상태관리 | T2 | agent-delegated | baseline | ARCH ## 7-5 | Riverpod |
| cat-flutter-navigation | 화면 이동 | T2 | user-approval | baseline | ARCH ## 7-5 | go_router |
| cat-flutter-di | 의존성 주입 | T3 | agent-delegated | task | ARCH ## 7-5 | |
| cat-flutter-networking | HTTP·직렬화 | T3 | agent-delegated | task | ARCH ## 7-5 | dio + json_serializable |
| cat-flutter-local-storage | 로컬 저장·오프라인 | T2 | user-approval | task | ARCH ## 7-5 | |
| cat-flutter-codegen | 코드 생성(freezed 등) | T3 | agent-delegated | baseline | ARCH ## 7-5 | |
| cat-flutter-design-kit | 디자인 킷 | T2 | user-approval | baseline | ARCH ## 7-5 (컴포넌트 규칙은 DESIGN ## 7) | Material 3 |
| cat-flutter-icons | 아이콘 패키지 | T3 | agent-delegated | baseline | ARCH ## 7-5 (폰트 번들은 DESIGN ## 3 — bootstrap-design R6) | |
| cat-flutter-intl | 국제화 | T3 | user-approval | task | ARCH ## 7-5 | intl |
| cat-flutter-analytics-crash | 분석·크래시 SDK | T3 | user-approval | baseline | ARCH ## 7-5 | |
| cat-flutter-permissions | 권한 요청 흐름 | T2 | user-approval | task | ARCH ## 7-5 | |
| cat-flutter-flavors-signing | 빌드 flavor·서명·배포 | T2 | user-approval | n/a | ARCH ## 7-5 · ADR-059 D9 | fastlane |
| cat-flutter-e2e-tooling | integration_test / Patrol | T3 | agent-delegated | baseline | STACK_SETUP_PLAN ## E2E Smoke Registry | integration_test |
```

## 부록 E. 참조 무결성 검사 스크립트 (`/tmp/check-refs.sh`)

```bash
#!/usr/bin/env bash
# 저장소 루트에서 실행. 종료코드 0 = 통과(기본 모드). 인자: --all-surfaces / --all-dead (기준선 비교용 전체 모드).
# 기본 통과 기준: 검사 1·2·6 = count 0, 검사 3(이번 라운드 ADR — ## Surfaces + 개정의 ### 적용 surface) = 0,
#               검사 4(이번 라운드 supersede분 — ADR-027·056) = 0, 검사 5 = ok 4줄.
# 전체 모드(--all-surfaces: 전 ADR의 ## Surfaces만 / --all-dead: 전 죽은 ADR)는 Phase 0 기준선 이하여야 한다.
# 민감 파일(.env·secrets/·키 파일)은 읽지 않는다(AGENTS.md).
set -u
EXC=(--exclude-dir=.git --exclude-dir=node_modules --exclude-dir=secrets --exclude=IMPROVE-GUIDE.md
     --exclude='.env' --exclude='.env.*' --exclude='*.jks' --exclude='*.keystore' --exclude='key.properties'
     --exclude='*.p12' --exclude='*.mobileprovision' --exclude='*.p8' --exclude='*-firebase-adminsdk-*.json'
     --exclude='serviceAccount*.json' --exclude='service-account*.json')
ADR_DIR=docs/90-decisions/boilerplate
ROUND_ADRS="${ROUND_ADRS:-ADR-0(04|58|59|69|70|71|72|73)}"
DEAD_FILTER="${DEAD_FILTER:-ADR-027|ADR-056}"
MODE_SURF=filtered; MODE_DEAD=filtered; FAIL=0
for a in "$@"; do case "$a" in --all-surfaces) MODE_SURF=all;; --all-dead) MODE_DEAD=all;; esac; done
strip(){ awk 'BEGIN{c=0} /^```/{c=!c; next} !c' "$1" | sed -E 's/<!--[^>]*-->//g'; }   # 코드펜스·한 줄 HTML 주석 제거
count(){ n=$(wc -l < "$1" | tr -d ' '); echo "count: $n"; [ "$n" = "0" ] || FAIL=1; }

echo "== 1. ADR 번호·링크 목적지 존재 (인덱스 Reserved/Parked/Dropped 제외)"
awk '/^## Reserved \/ Parked \/ Dropped/{f=1;next} f&&/^## /{f=0} f' "$ADR_DIR/README.md" | grep -oE "^\| ADR-0[0-9]{2} " | tr -d '| ' > /tmp/allow.txt
printf "ADR-002\nADR-003\n" >> /tmp/allow.txt
{ grep -rho "${EXC[@]}" -E "ADR-0[0-9]{2}" . | sort -u | while read -r id; do
    grep -qx "$id" /tmp/allow.txt && continue
    ls "$ADR_DIR"/ADR-"${id#ADR-}"-*.md >/dev/null 2>&1 || echo "MISSING $id"
  done
  grep -rho "${EXC[@]}" -E "ADR-0[0-9]{2}-[a-z0-9-]+\.md" . | sort -u | grep -vE "xxx|slug|nnn" | while read -r f; do
    [ -f "$ADR_DIR/$f" ] || echo "BAD-LINK-TARGET $f"
  done; } | tee /tmp/c1.txt; count /tmp/c1.txt

echo "== 2. amend 앵커 존재"
grep -rho "${EXC[@]}" -E "ADR-0[0-9]{2}#amend-[0-9]+" . | sort -u | while read -r ref; do
  n=$(echo "$ref" | sed -E 's/ADR-0?([0-9]+)#amend-([0-9]+)/\1/'); m=${ref#*amend-}
  f=$(ls "$ADR_DIR"/ADR-0"$n"-*.md 2>/dev/null | head -1)
  [ -n "$f" ] && grep -q -E "(<a id=\"adr-0?$n-amend-$m\">|^## Amendment $m\b)" "$f" || echo "NO-ANCHOR $ref"
done | tee /tmp/c2.txt; count /tmp/c2.txt

echo "== 3. Surfaces 역참조 (기본: 이번 라운드 ADR의 ## Surfaces + ### 적용 surface / --all-surfaces: 전 ADR의 ## Surfaces만)"
for f in "$ADR_DIR"/ADR-*.md; do
  id=$(basename "$f" | grep -oE "ADR-[0-9]{3}")
  if [ "$MODE_SURF" = filtered ] && ! echo "$id" | grep -qE "$ROUND_ADRS"; then continue; fi
  status=$(awk '/^## Status/{getline; print; exit}' "$f")
  case "$status" in superseded*|deprecated*) continue;; esac
  if [ "$MODE_SURF" = filtered ]; then
    lines=$(strip "$f" | awk '/^## Surfaces/{flag=1; next} /^### 적용 surface/{flag=1; next} /^## /{flag=0} /^### /{if(flag==1 && $0 !~ /적용 surface/) flag=0} flag && /^- /')
  else
    lines=$(strip "$f" | awk '/^## Surfaces/{flag=1; next} /^## /{flag=0} flag && /^- /')
  fi
  echo "$lines" | grep -oE '(\.claude|\.agents|\.codex|\.boilerplate|\.gitignore|\.gitattributes|docs/|README[_a-z]*\.md|AGENTS\.md|CLAUDE\.md|scripts/|LICENSE)[^ `,:)]*' | sed -E 's/#.*$//' | sort -u | while read -r path; do
    [ -z "$path" ] && continue
    case "$path" in *\**) ls $path >/dev/null 2>&1 || echo "SURFACE-MISSING $id -> $path"; continue;; esac   # glob 항목(«변경 없음» 열거 등)은 존재만 본다
    case "$path" in *.json|*.toml|.gitignore|.gitattributes|docs/90-decisions/boilerplate/README.md) [ -e "$path" ] || echo "SURFACE-MISSING $id -> $path"; continue;; esac   # 문자열 역참조를 둘 수 없는 파일은 존재만 본다
    if [ -d "$path" ]; then grep -rq "$id" "$path" || echo "NO-BACKREF $id -> $path/"; continue; fi
    [ -f "$path" ] || { echo "SURFACE-MISSING $id -> $path"; continue; }
    grep -q "$id" "$path" || echo "NO-BACKREF $id -> $path"
  done
done | tee /tmp/c3.txt; count /tmp/c3.txt

echo "== 4. 죽은 ADR 인용 (마커 없는 줄 — 기본: ADR-027·056 / --all-dead: 전체; superseding ADR 본문·인덱스·주석 제외)"
for f in "$ADR_DIR"/ADR-*.md; do
  status=$(awk '/^## Status/{getline; print; exit}' "$f")
  case "$status" in superseded*|deprecated*) basename "$f" | grep -oE 'ADR-[0-9]{3}';; esac
done | sort -u > /tmp/dead.txt
if [ "$MODE_DEAD" = filtered ]; then grep -E "$DEAD_FILTER" /tmp/dead.txt > /tmp/dead.f.txt; mv /tmp/dead.f.txt /tmp/dead.txt; fi
while read -r dead; do
  grep -rn "${EXC[@]}" "$dead" . | grep -v "(현재 SSOT:" | grep -v "$ADR_DIR/$dead-" | grep -v "$ADR_DIR/README.md" | grep -v "$ADR_DIR/ADR-07[23]-" | grep -v "<!--"
done < /tmp/dead.txt | tee /tmp/c4.txt; count /tmp/c4.txt

echo "== 5. 로스터 집합 (skills 디렉터리 ↔ STRUCTURE ↔ README 자연어 목록 ↔ wrappers)"
ls .claude/skills | sort > /tmp/skills.txt
ls .agents/skills | sort > /tmp/wrappers.txt
comm -23 /tmp/skills.txt /tmp/wrappers.txt > /tmp/natural.txt
grep -oE "\((2[0-9])종 — [^)]*\)" docs/00-meta/STRUCTURE.md | head -1 | tr '/' '\n' | sed -E 's/.*— //; s/\)//' | sort > /tmp/structure.txt
diff /tmp/skills.txt /tmp/structure.txt > /tmp/c5a.txt && echo "STRUCTURE list ok" || { cat /tmp/c5a.txt; FAIL=1; }
n=$(wc -l < /tmp/skills.txt | tr -d ' '); grep -q "(${n}종" docs/00-meta/STRUCTURE.md && echo "STRUCTURE count ok (${n})" || { echo "STRUCTURE count mismatch (expected ${n})"; FAIL=1; }
for r in README.md README_ko.md; do
  grep -oE "\((discover-product[^)]*)\)" "$r" | head -1 | tr -d '()' | tr ',' '\n' | sed 's/^ *//' | sort > /tmp/readme.txt
  diff /tmp/natural.txt /tmp/readme.txt >/dev/null && echo "$r natural list ok" || { echo "$r natural list mismatch"; diff /tmp/natural.txt /tmp/readme.txt; FAIL=1; }
done

echo "== 6. 인덱스 amend 수 ↔ 본문 Amendment 헤딩 수 (코드펜스 밖)"
grep -E "^\| 0[0-9]{2} " "$ADR_DIR/README.md" | while IFS='|' read -r _ num _ _ amends _; do
  n=$(echo "$num" | tr -d ' '); f=$(ls "$ADR_DIR"/ADR-"$n"-*.md 2>/dev/null | head -1); [ -z "$f" ] && continue
  idx=$(echo "$amends" | grep -o "#amend-[0-9]*" | sort -u | wc -l | tr -d ' ')
  body=$(awk '/^```/{c=!c} !c && /^## Amendment [0-9]+/{n++} END{print n+0}' "$f")
  [ "$idx" = "$body" ] || echo "AMEND-COUNT ADR-$n index=$idx body=$body"
done | tee /tmp/c6.txt; count /tmp/c6.txt

echo "== SUMMARY: $([ $FAIL = 0 ] && echo PASS || echo FAIL) (mode: surfaces=$MODE_SURF dead=$MODE_DEAD)"
exit $FAIL
```
- 통과 기준: 기본 모드 종료코드 0(검사 1·2·3·4·6 `count: 0`, 검사 5 `ok` 4줄). 전체 모드(`--all-surfaces`·`--all-dead`)는 기준선 비교용이라 종료코드가 1이어도 그 자체로 실패가 아니다 — count가 Phase 0 기준선(`/tmp/improve-baseline.txt` — 2026-09-11 실측: 검사 3 = 9, 검사 4 = 11)보다 **늘지 않았으면** 통과다(기존 drift는 부록 F 10번).
- 검사 3의 기본 모드는 이번 라운드 ADR(`ROUND_ADRS`)의 `## Surfaces`와 개정 `### 적용 surface`를 함께 읽고, 코드펜스·HTML 주석 안의 예시(ADR-045)는 무시한다. 역참조는 `ADR-NNN` 문자열 존재로 판정한다(개정 항목도 같은 기준 — `#amend-M`까지 요구하지 않는다).
- 검사 4는 superseding ADR 자신(ADR-072·073)의 인용을 제외한다 — 그 안의 ADR-056·027 인용은 supersede 선언(D)이라 마커가 필요 없다.
- 검사 1은 ADR 번호 외에 markdown 링크의 목적지 파일명(`ADR-0NN-<slug>.md`)도 실재 여부를 본다(가이드 초안이 ADR-055 파일명을 틀렸던 사례).
- 검사 4는 HTML 주석 안 인용을 완전히 거르지 못할 수 있다. 남은 줄이 주석·코드펜스 안이면 무시한다.

## 부록 F. 본 라운드 범위 밖 — 리뷰에서 확인된 기존 결함 후보

아래는 리뷰 과정에서 현재 저장소에서 확인된 문제이나 이번 여덟 개 요구사항과 무관하다. 고치지 않는다. 다음 개선 라운드의 입력이며, 원하면 Phase 6에서 10번만 함께 처리해도 된다(역참조 1줄씩 — 기준선이 줄어드는 방향이라 무해).

| # | 위치 | 문제 |
|---|---|---|
| 1 | `finalize-workitem` | `done`·closure를 쓴 뒤 커밋한다. 커밋이 실패하면 `done` + 미커밋 상태가 남고 재호출은 `done`이라 no-op — 재개 경로 없음. |
| 2 | `seal-milestone` ↔ `repair-plan` | seal은 M/F/T 리뷰 파일을 모두 보지만 차단 시 `repair-plan M1`을 안내하고, repair-plan은 M1 파일만 찾는다(F-001.peer.md만 있으면 «리뷰 없음»). |
| 3 | `repair-plan` | 구현 흔적이 있으면 task `## 8`에 쓰고 repair-workitem으로 보내는데, 전 task done(마일스톤 층)에서는 task 문서가 동결되고 repair-workitem도 거부한다 — 폐쇄 가드 부재. |
| 4 | `accept-milestone` | 3회차 보류 → repair → 관측 AC invalidated → 재accept가 4회차 상한에 걸린다. 수리 항목 재확인 또는 사용자 직접 receipt 경로 필요. |
| 5 | `repair-workitem` ↔ `validate-workitem` | 외부 경계 수정 뒤 실행 증거 재확보 실패가 출력에만 남고, validate는 이전 receipt 존재만 본다(신선도 미검사). |
| 6 | `bootstrap-stack --migrate` | 새 ADR로 ADR-101을 supersede한 뒤 재실행을 안내하는데, BASE는 계속 ADR-101 갱신을 지시한다 — 활성 스택 ADR 해석 절차 부재. |
| 7 | `repair-discovery` | architect는 고위험 결정을 직접 확정하지 말라고 하는데 repair-discovery에 사용자 승인·원장 반영 분기가 없다. |
| 8 | ADR-059 D3 ↔ `stack-guard` CI | golden은 미커밋·fresh checkout 실패가 정상인데 GitHub 프로젝트에는 fresh runner CI를 기본 생성한다 — golden 있는 Flutter 프로젝트의 CI 기준선 정책 부재. |
| 9 | `marketer.md`·`strategist.md` | 읽기 지정 절 번호(DISCOVERY JTBD/시나리오, Charter 문제 정의)가 실제 템플릿과 다르다. |
| 10 | ADR-009·047·050 `## Surfaces` | 역참조 누락 8건(ADR-009 → validate-workitem, ADR-047 → validator, ADR-050 → bootstrap-project·stack-guard·validate-plan·repair-plan·implement·finalize). ADR-045 `## Surfaces`는 코드펜스 예시를 포함해 파서 오탐 원인. |
| 11 | `design-gate.mjs` geometry | 접근 가능한 가로스크롤 컨테이너 내부 텍스트를 clipped로 오탐할 가능성(브라우저 재현 미완 — 확정 아님). v3 재작성 시 v2 함수를 보존하되 이 케이스를 자가 검사 (b) known-good에 넣어 두면 잡힌다. |
