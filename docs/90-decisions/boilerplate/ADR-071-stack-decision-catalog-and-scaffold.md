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
- [관측됨] `output-checklist.md`는 STACK_SETUP_PLAN을 «선택 생성 문서»로 두고 «자동 작성 X» 문구가 남아 있으나, 실제로는 stack-guard·plan-workitem·implement가 그 파일을 SSOT로 읽는다(ADR-051#amend-4 Dependency Tools) (현재 SSOT: ADR-075 D14).

## 결정

### D1. 스택 결정 카탈로그 (색인)
`.claude/skills/bootstrap-stack/stack-catalog.md`가 프로젝트 유형별(web frontend / API server / CLI / monorepo / Supabase / Flutter) 결정 항목의 **색인**이다. 열: id · 항목 · tier · authority 기본값 · 설치(baseline/task/n/a) · 정본 앵커 · 기본 후보. 결정 본문은 정본 앵커(ARCH `## 7-N` / ADR-101 / STACK_SETUP_PLAN)에만 적는다.

### D2. disposition 필수 + registry
`docs/00-meta/STACK_SETUP_PLAN.md ## Stack Decision Registry`에 카탈로그의 **해당 유형 행 전부**를 적는다. 열: `scope | id | 항목 | disposition | authority | 정본 앵커 | 확인일`.

**행 키는 `(scope, id)`다.** 단일 패키지 프로젝트는 전 행이 `scope: .`이라 id가 곧 키다. monorepo는 **scope마다 값이 갈릴 수 있는 행**(패키지 매니저·lint·test·e2e·유형별 행 전부)을 그 scope마다 한 행씩 두고, 저장소 전체에 한 번만 성립하는 행(레이아웃·라이선스·CI·비밀 취급)만 `scope: *` 한 행으로 둔다. 애매하면 scope별로 나눈다. 이 키가 없으면 «web은 pnpm·Flutter는 pub», «admin은 UI 킷 확정·marketing은 이관» 같은 정상 monorepo 상태를 표현할 수 없고, D5 생성기·D6 설치가 어느 행을 읽을지 정해지지 않는다. disposition 값은 넷뿐이다.

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
- **scope 단위**: registry `cat-common-repo-layout`이 정한 scope(단일 패키지 `.` / monorepo `apps/web`·`apps/mobile` 등)마다 생성기 1종을 **그 scope 디렉터리에** 돌린다. 옵션·생성기 도출은 **그 scope의 registry 행**(`scope`가 그 scope이거나 `*`인 행 — D2의 `(scope, id)` 키)만 읽는다. `## Scaffold`는 scope별 1행.
- **생성기**: 그 scope 유형의 `cat-<유형>-framework` 확정 행(그 scope의 행)의 공식 생성기(예 `create-next-app`, `npm create vite`, `flutter create`, `uv init`). 옵션은 registry `확정` 행에서 도출(언어·PM·스타일링·라우팅·src 디렉터리·테스트 도구). 도출 불가 옵션은 생성기 기본값 + 출력에 명시. 공식 생성기가 없는 유형(일부 API·CLI)은 «최소 골격» — 소스 루트 1 + 테스트 루트 1 + manifest — 만 만들고 `## Scaffold`에 `generator: minimal`로 적는다.
- **병합 규칙**: 임시 디렉터리에 생성 → scope 디렉터리로 복사하되 harness 파일은 **절대 덮어쓰지 않는다** — `README.md`·`README_ko.md`·`LICENSE`·`docs/**`·`.claude/**`·`.codex/**`·`.agents/**`·`.boilerplate/**`·`AGENTS.md`·`CLAUDE.md`·`.github/**`. 루트 `.gitignore`는 줄 단위 합집합(저장소 기존 줄 우선, 중복 제거). 그 외 충돌 파일(green-field에서는 정상적으로 없다)은 덮어쓰지 않고 `Scaffold conflict: <경로>`로 사용자 결정에 넘긴다. 생성기가 만든 `.git`은 버린다.
- **보호 경로 검사(내용 대조)**: 보호 경로(`README.md` `README_ko.md` `LICENSE` `AGENTS.md` `CLAUDE.md` `docs` `.claude` `.codex` `.agents` `.boilerplate` `.github`) 아래 **«파일 경로 + 내용 해시» 목록**을 복사 **직전**과 **직후**에 각각 만들어 **완전히 같아야** 한다(해시가 바뀐 파일 · 새로 생긴 파일 · 사라진 파일 = 위반). 예: `find <보호 경로> -type f -print0 | sort -z | xargs -0 shasum` — 동등한 digest면 무엇이든 된다. **`git status --porcelain` 출력 비교로 대신하지 않는다**: 이미 ` M` 상태인 파일을 덮어써도 상태 문자열이 그대로라 놓치고(실측 확인), 반대로 «직후 출력이 비어 있어야 한다»는 절대 기준은 정상 lifecycle에서 매번 위반으로 잡힌다 — `/bootstrap-stack`과 본 skill 사이에 커밋이 없어 방금 쓴 `STACK_SETUP_PLAN`·ARCH·원장이 이미 미커밋이기 때문이다. 달라진 경로가 있으면 `Scaffold protected-path violation: <경로>`를 출력하고 종료한다(되돌리기는 사용자 결정 — 자동 `checkout` 하지 않는다).
- **기록**: `STACK_SETUP_PLAN.md ## Scaffold`에 scope별 `scope | status | 생성기·버전 | 옵션 | 생성 파일 수 | 제외·충돌 | 실행일`. 생성 파일 전량은 `git status --porcelain`으로 사용자가 본다(문서 복사 금지).
- **커밋하지 않는다.** 출력에 권장 커밋 메시지 한 줄(`chore(scaffold): initialize <framework> project skeleton`).
- ADR-063 D1의 probe는 이 뒤(수행 5)에 돈다. probe는 여전히 소스 루트를 만들지 않는다.

### D6. 기초 라이브러리 baseline 설치 — `/stack-guard` 6-2-b
카탈로그 `설치: baseline`이고 registry `확정`인 행의 패키지(UI 킷·스타일링·아이콘·UI 미리보기 도구·lint/format 도구·계측 SDK 등)를 스캐폴드 직후 설치한다. **설치는 scope별이다** — 그 scope의 registry 행(D2 `(scope, id)` 키)을 그 scope의 패키지 매니저로 설치한다. 버전은 registry `확인일` 기준 researcher 고정값. **예외 — 폰트 패키지·파일**: 폰트 선택은 DESIGN `## 3`(ADR-073 D4)이 `/bootstrap-design` R6 쇼케이스에서 확정하므로 stack-guard가 미리 설치하지 않는다. 확정 뒤 R6 배선(builder 단발)이 그 패키지·파일을 추가한다(ADR-058#amend-4 결정 2) — 설치 소유의 명시 예외다. `설치: task` 행은 기존대로 plan-workitem authoring → implement 설치(ADR-040#amend-1·ADR-052 D1). install-ownership은 이제 **4분할**이다: authoring / per-task 실행 / baseline toolchain·e2e / **baseline 라이브러리·스캐폴드(본 ADR)**.
- 웹 UI 프로젝트에서 registry `cat-web-ui-preview`가 `Storybook`이면 여기서 설치한다: 프레임워크 공식 통합 패키지 + 애드온은 `a11y`·`viewport`만(추가 애드온·Chromatic·MDX 강제 없음). `package.json`에 `storybook`·`build-storybook` 스크립트가 없으면 추가한다. Flutter는 미리보기 도구를 설치하지 않는다(별도 진입 파일 갤러리 — ADR-072).
- **킷이 쓴 토큰·팔레트는 `/bootstrap-design` R6-1 소관이다 (2026-09-11 — 폰트 예외와 같은 이유)**. 생성형 UI 킷의 `init`(예: `shadcn init`)은 스타일시트에 자기 토큰 세트·팔레트·폰트 변수를 함께 쓴다. 그 시점에는 DESIGN `## 2`·`## 3` 이 아직 없으므로 **그 값들은 결정이 아니라 자리표시자**다. `/stack-guard` 는 킷을 설치하되 그 블록을 손대지 않고 `STACK_SETUP_PLAN` 에 «킷이 쓴 토큰 블록 — R6-1 재배선 대상: <파일>» 로 기록만 한다. **R6-1 이 킷 변수를 DESIGN semantic 토큰의 별칭으로 재정의해 출처를 하나로 만든다**(예: `--primary: var(--color-accent)`; 반대 방향 금지). 폰트 패키지를 설치하지 않는 규칙과 달리 **킷 자체는 설치한다** — 컴포넌트 코드가 그 패키지를 import 하기 때문이다.
- **킷이 끌고 오는 번들 의존은 결정의 일부다 — 제거 대상이 아니다.** `shadcn init` 의 `@base-ui/react`·`class-variance-authority`·`tw-animate-css`·`cn`·`shadcn` 처럼 킷이 자기 동작을 위해 추가하는 패키지는 `cat-web-ui-kit` 확정의 **딸린 결과**이며 ADR-071#amend-1 의 «결정 집합 밖 애드온 제거» 대상이 아니다(그 규칙은 *선택 가능한 애드온*을 가린다 — Storybook 의 Chromatic·vitest·docs·mcp 처럼). registry 의 그 킷 행에 번들 의존 목록을 적어 «결정의 일부» 임을 남긴다.

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
4. Preserved invariants — `disable-model-invocation` / bootstrap-stack에 Bash 없음(스캐폴드는 stack-guard) / probe가 소스 루트를 만들지 않음(ADR-063 D1) / 기존 도구 미덮어씀·재실행 계약(ADR-063 D3) / T1/T2/T3 taxonomy(ADR-055) / Dependency Tools 표 의미(ADR-051#amend-4) (현재 SSOT: ADR-075 D14) / Needs Install graceful fallback.
5. Falsifying evaluation — Round 11(web)·12(Flutter)에서 (a) registry에 빈 행이 남은 채 bootstrap-stack이 성공 종료하면 D2 실패 (b) 수행 0 복사 직전·직후의 보호 경로 «경로+내용 해시» 목록이 달라지면 D5 실패(내용 대조이므로 이미 미커밋 상태인 파일의 덮어쓰기도 잡힌다. 수행 3의 `STACK_SETUP_PLAN` 갱신은 복사 뒤라 대상이 아니다) (c) 스캐폴드 뒤 probe smoke가 `SKIPPED (등록된 소스 루트 부재)`면 D5 배선 실패 (d) HYBRID 입력(프론트만 지정)에서 백엔드 결정 라운드가 열리지 않으면 D4 실패.
6. Rollback path — 본 ADR superseded → 수행 0·6-2-b·R-C·registry 제거, R0 2분기 복원, ADR-052/055/063 참조 갱신 줄 삭제. 생성된 프로젝트 스캐폴드는 프로젝트 소유라 되돌리지 않는다.

## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT. 실제 파일 경로 1행 1개)
- .claude/skills/bootstrap-stack/SKILL.md                 — D2·D3·D4·D7·D8
- .claude/skills/bootstrap-stack/stack-catalog.md         — D1
- .claude/skills/bootstrap-stack/stack-brief-template.md  — D1 행 참조
- .claude/skills/bootstrap-stack/output-checklist.md      — D8
- .claude/skills/stack-guard/SKILL.md                     — D5·D6 · 수행 0 2-0 scope 하위 harness 파일 탐지(**2026-09-11 추가** — 발견 38)
- .claude/skills/bootstrap-design/SKILL.md               — D6 킷 토큰 별칭 재정의(R6-1) (**2026-09-11 추가** — 발견 42)
- docs/00-meta/_templates/STACK_SETUP_PLAN_TEMPLATE.md    — D2·D5 절
- .claude/skills/plan-workitem/SKILL.md                   — D6 설치 line item 경계
- docs/00-meta/PROJECT_START_CHECKLIST.md                 — 2·3절 문구
- docs/00-meta/GUARDRAILS_STRATEGY.md                     — stack-guard 산출물 범위·유지 주기
- docs/00-meta/STRUCTURE.md                               — 산출물 표·Canonical Owner
- docs/00-meta/DELEGATION_STRATEGY.md                     — Mid-project T3 행 갱신

## 참고
- ADR-052(install-ownership 3분할 → 4분할), ADR-055(T1/T2/T3·입력 적응형), ADR-063(probe·재실행 계약), ADR-060 D9(authority 배정 기준), ADR-051#amend-4(Dependency Tools) (현재 SSOT: ADR-075 D14), ADR-040#amend-1, ADR-047 D3, ADR-022.

<a id="adr-071-amend-1"></a>
## Amendment 1 (2026-09-11) — harness 경로 무결성을 실행 시작·종료로 확장 + Storybook 애드온 기본값 정정

### 배경
- [관측됨] dogfood Round 11 — `/stack-guard` 수행 0의 보호 경로 «경로+내용 해시» 대조는 **스캐폴드 복사 전후만** 본다. 그 뒤 6-2-b 설치와 수행 5·6-3의 e2e 실행이 계속되는데, **그 구간에서 harness 파일이 실제로 바뀌었다** — Next.js 16의 `next dev`가 실행할 때마다 `AGENTS.md`(없으면 `CLAUDE.md`)에 자기 규칙 블록 10줄을 append하고 지워도 되살린다(`node_modules/next/dist/server/lib/generate-agent-files.js`). 실측 57 → 67줄. 본 저장소의 `AGENTS.md`는 **100줄 hard cap**(ADR-011)이 걸린 에이전트 지시 파일이라 방치하면 상한을 잠식하고, 출처 불명 지시가 최상위 지시 파일에 섞인다(ADR-047 harness 무결성).
- [관측됨] 같은 라운드 — `storybook init`(v10)이 registry 결정 집합(`cat-web-ui-preview`) 밖 애드온 4종(`@chromatic-com/storybook`·`addon-vitest`·`addon-docs`·`addon-mcp`)과 `vitest.config.ts`를 함께 설치했다. 또 **viewport는 Storybook 8부터 코어 global**이라 «viewport 애드온»은 존재하지 않는다 — 카탈로그 기본 후보 문구가 SB 7 시절 전제였다.

### 결정
1. **harness 경로 무결성 검사를 `/stack-guard` 실행 시작·종료로 확장한다**(수행 0-H). 수행 0 2-1의 복사 전후 대조는 그대로 두고, 그것과 **같은 방법**으로 실행 맨 앞·맨 끝의 보호 경로 목록을 대조한다. 달라진 경로는 `Harness-path drift: <경로> — <추정 원인>`으로 **보고만** 하고 **자동으로 되돌리지 않는다** — 본 skill 자신이 쓰는 파일(`docs/00-meta/STACK_SETUP_PLAN.md`·`.gitignore`·`.gitattributes`)과 직전 skill의 미커밋 문서는 대조에서 뺀다. `AGENTS.md`가 커졌으면 줄 수를 함께 출력해 ADR-011 상한을 사용자가 판단하게 한다.
2. **Storybook 기본 후보를 «a11y 애드온만»으로 정정**하고, `init`이 추가로 깐 결정 집합 밖 애드온·생성 파일을 설치 직후 제거하도록 명시한다. 기준 뷰포트는 `.storybook/preview`의 `parameters.viewport.options`로 둔다.

### 근거
- 결정 1은 **새 차단을 만들지 않는다** — 보고 등급이다. 자동 되돌림을 두지 않는 이유는 그 변경이 의도된 것일 수 있고(본 skill이 문서를 갱신하는 것이 정상 경로다) 되돌리기는 사용자 결정이기 때문이다(ADR-059 D9의 «키 취급은 직접 옮기지 않는다»와 같은 형태).
- 대안: (a) 보호 경로를 read-only로 만든다 — 본 skill 자신이 써야 하는 파일이 그 안에 있어 성립하지 않는다. (b) `next dev`를 쓰지 않는다 — e2e webServer가 그것을 쓰므로 스택 결정을 침범한다. 둘 다 기각.

### 강도 (ADR-022)
- enabling(약, [관측됨]) — 보고 등급 확장 + 문구 정정. 졸업·봉인 차단을 새로 만들지 않는다.

### Mutation delta (ADR-047 D3)
- failure = 생성기·설치기·개발 서버가 harness 파일을 조용히 고치고 아무도 모른다 / falsifier = Round 12에서 `Harness-path drift:` 줄이 실제 변형(Next.js 블록 등)을 못 잡거나, 정상 갱신(STACK_SETUP_PLAN)을 drift로 오보고하면 결정 1 실패 / rollback = 본 amend superseded → 수행 0-H와 출력 항목 제거(수행 0 2-1은 유지).

### 적용 surface
- .claude/skills/stack-guard/SKILL.md                     — 수행 0-H 신설·마지막 출력 항목·6-2-b Storybook 문구
- .claude/skills/bootstrap-stack/stack-catalog.md         — `cat-web-ui-preview` 기본 후보
